// Một Kiếp Người — danh thiếp nhân vật để kết bạn giữa người chơi thật (Vercel Serverless + Upstash Redis REST)
// POST /api/people { op:'publish', card }   → { code }    (người chơi tự bấm chia sẻ nhân vật của mình)
// GET  /api/people?code=XXXXXX              → { card }
// GET  /api/people?get=random&n=4           → { cards:[...] }  (nhân vật được chia sẻ gần đây)
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CODE_RE = /^[A-Z2-9]{6}$/;
const K = { card: (c) => 'mkn:ppl:' + c, recent: 'mkn:ppl:recent' };
const TTL = String(90 * 86400);

async function pipeline(cmds) {
  const r = await fetch(REDIS_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error((j && j.error) || 'redis');
  return j.map((x) => x.result);
}
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; };
const BAD = /(đ[ịi]t|đ[ée]o|l[ồo]n|c[ặa]c|đ[ĩi]\s?ch[oó]|\bdm\b|\bđm\b|\bvcl\b|\bvl\b|\bcc\b|fuck|shit)/gi;
const clean = (s, n) => clip(s, n).replace(/(https?:\/\/|www\.)\S+/gi, '').replace(BAD, '***');
// ngoại hình: chỉ nhận các khoá/giá trị đơn giản (màu, kiểu tóc…)
function cleanApp(a) {
  const out = {}; if (!a || typeof a !== 'object') return out;
  Object.keys(a).slice(0, 40).forEach((k) => {
    if (!/^[a-zA-Z]{1,20}$/.test(k)) return; const v = a[k];
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.round(v * 1000) / 1000;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string' && v.length <= 24 && /^[#\w .-]*$/.test(v)) out[k] = v;
  });
  return out;
}
function send(res, status, obj, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > 6000) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      if (q.code) {
        const code = clip(q.code, 6).toUpperCase(); if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
        const [raw] = await pipeline([['GET', K.card(code)]]);
        if (!raw) return send(res, 404, { error: 'notfound' });
        return send(res, 200, { card: Object.assign({ code }, JSON.parse(raw)) });
      }
      if (q.get === 'random') {
        const n = Math.round(num(q.n, 1, 8));
        const [codes] = await pipeline([['LRANGE', K.recent, '0', '299']]);
        const uniq = Array.from(new Set(codes || []));
        for (let i = uniq.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uniq[i], uniq[j]] = [uniq[j], uniq[i]]; }
        const pickC = uniq.slice(0, n); if (!pickC.length) return send(res, 200, { cards: [] });
        const rows = await pipeline(pickC.map((c) => ['GET', K.card(c)]));
        const cards = pickC.map((c, i) => { try { return rows[i] ? Object.assign({ code: c }, JSON.parse(rows[i])) : null; } catch (e) { return null; } }).filter(Boolean);
        return send(res, 200, { cards });
      }
      return send(res, 400, { error: 'bad-get' });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const ip = clip((req.headers['x-forwarded-for'] || '').split(',')[0] || 'x', 64);
    const [hits] = await pipeline([['INCR', 'mkn:rl:ppl:' + ip], ['EXPIRE', 'mkn:rl:ppl:' + ip, '600']]);
    if (hits > 8) return send(res, 429, { error: 'slow-down' });
    const b = await readBody(req);
    if (b.op !== 'publish') return send(res, 400, { error: 'bad-op' });
    const s = b.card || {};
    const name = clean(s.name, 40); if (name.length < 2) return send(res, 400, { error: 'bad-name' });
    const card = { name, gender: s.gender === 'f' ? 'f' : 'm', age: Math.round(num(s.age, 0, 120)), city: clean(s.city, 30), job: clean(s.job, 40), bio: clean(s.bio, 120), app: cleanApp(s.app), at: Date.now() };
    for (let i = 0; i < 6; i++) {
      const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
      const [ok] = await pipeline([['SET', K.card(code), JSON.stringify(card), 'EX', TTL, 'NX']]);
      if (ok) { await pipeline([['LPUSH', K.recent, code], ['LTRIM', K.recent, '0', '299']]); return send(res, 200, { ok: true, code }); }
    }
    return send(res, 500, { error: 'busy' });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String((e && e.message) || e).slice(0, 200) });
  }
};
