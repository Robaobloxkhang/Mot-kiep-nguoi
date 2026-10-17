// Một Kiếp Người — nghĩa trang online (Vercel Serverless + Upstash Redis REST)
// GET  /api/grave                 → { graves:[...] }  (300 bia mộ mới nhất, kèm số nén nhang)
// GET  /api/grave?id=xxxxxxxx     → { grave, incense, msgs }
// GET  /api/grave?feed=1          → { lives:[...] }   (bảng tin: các kiếp điểm cao nhất trong 48 giờ qua, kèm dòng đời)
// POST /api/grave { action:'add', grave:{...} }          → { id }
// POST /api/grave { action:'incense', id }               → { incense }
// POST /api/grave { action:'msg', id, nick, text }       → { msgs }
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ID_RE = /^[a-z0-9]{8}$/;
const K = { list: 'mkn:graves', g: (id) => 'mkn:grave:' + id, inc: (id) => 'mkn:grave:inc:' + id, msg: (id) => 'mkn:grave:msg:' + id };
const TTL = String(365 * 86400);

async function pipeline(cmds) {
  const r = await fetch(REDIS_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error((j && j.error) || 'redis');
  return j.map((x) => x.result);
}
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; };
// lời nhắn công khai: bỏ đường link, che từ tục
const BAD = /(đ[ịi]t|đ[ée]o|l[ồo]n|c[ặa]c|đ[ĩi]\s?ch[oó]|\bdm\b|\bđm\b|\bvcl\b|\bvl\b|\bcc\b|fuck|shit)/gi;
const clean = (s, n) => clip(s, n).replace(/(https?:\/\/|www\.)\S+/gi, '[link]').replace(/\b\S+\.(com|net|vn|io|xyz|me|top)\S*/gi, '[link]').replace(BAD, '***');
function send(res, status, obj, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > 8000) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}
async function limited(ip, kind, max, sec) {
  const k = 'mkn:rl:gv:' + kind + ':' + ip;
  const [n] = await pipeline([['INCR', k], ['EXPIRE', k, String(sec)]]);
  return n > max;
}

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    const ip = clip((req.headers['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || 'x', 64);
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      if (q.id) {
        const id = clip(q.id, 8).toLowerCase(); if (!ID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
        const [raw, inc, msgs] = await pipeline([['GET', K.g(id)], ['GET', K.inc(id)], ['LRANGE', K.msg(id), '0', '19']]);
        if (!raw) return send(res, 404, { error: 'notfound' });
        return send(res, 200, { grave: Object.assign({ id }, JSON.parse(raw)), incense: Number(inc) || 0, msgs: (msgs || []).map((m) => { try { return JSON.parse(m); } catch (e) { return null; } }).filter(Boolean) });
      }
      if (q.feed) {
        const [all] = await pipeline([['LRANGE', K.list, '0', '199']]);
        if (!all || !all.length) return send(res, 200, { lives: [] }, 'public, s-maxage=30');
        const rows = await pipeline(all.map((id) => ['GET', K.g(id)]).concat(all.map((id) => ['GET', K.inc(id)])));
        const now = Date.now();
        let lives = all.map((id, i) => { try { const g = JSON.parse(rows[i]); return g ? Object.assign({ id, incense: Number(rows[all.length + i]) || 0 }, g) : null; } catch (e) { return null; } }).filter(Boolean);
        const fresh = lives.filter((g) => now - (g.at || 0) < 48 * 3600e3);
        lives = (fresh.length >= 5 ? fresh : lives).sort((a, b) => (b.score + b.incense * 5) - (a.score + a.incense * 5)).slice(0, 30);
        return send(res, 200, { lives, fresh: fresh.length >= 5 }, 'public, s-maxage=30');
      }
      const [ids] = await pipeline([['LRANGE', K.list, '0', '59']]);
      if (!ids || !ids.length) return send(res, 200, { graves: [] }, 'public, s-maxage=20');
      const rows = await pipeline(ids.map((id) => ['GET', K.g(id)]).concat(ids.map((id) => ['GET', K.inc(id)])));
      const graves = ids.map((id, i) => { try { const g = JSON.parse(rows[i]); return g ? Object.assign({ id, incense: Number(rows[ids.length + i]) || 0 }, g) : null; } catch (e) { return null; } }).filter(Boolean);
      return send(res, 200, { graves }, 'public, s-maxage=20');
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const b = await readBody(req);
    if (b.action === 'add') {
      if (await limited(ip, 'add', 3, 120)) return send(res, 429, { error: 'slow-down' });
      const s = b.grave || {};
      const grave = {
        name: clip(s.name, 50) || 'Vô danh', born: Math.round(num(s.born, 1900, 2300)), died: Math.round(num(s.died, 1900, 2400)), age: Math.round(num(s.age, 0, 125)),
        gender: s.gender === 'f' ? 'f' : 'm', cause: clip(s.cause, 90), epitaph: clean(s.epitaph, 160), rank: clip(s.rank, 24), score: Math.round(num(s.score, 0, 5000)),
        job: clip(s.job, 40), city: clip(s.city, 40), worth: clip(s.worth, 30), kids: Math.round(num(s.kids, 0, 30)), spouse: clean(s.spouse, 40),
        story: (Array.isArray(s.story) ? s.story : []).slice(0, 10).map((x) => clean(x, 150)).filter((x) => x.length > 3), at: Date.now(),
      };
      for (let i = 0; i < 5; i++) {
        const id = Array.from({ length: 8 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');
        const [ok] = await pipeline([['SET', K.g(id), JSON.stringify(grave), 'EX', TTL, 'NX']]);
        if (ok) { await pipeline([['LPUSH', K.list, id], ['LTRIM', K.list, '0', '299']]); return send(res, 200, { ok: true, id }); }
      }
      return send(res, 500, { error: 'busy' });
    }
    const id = clip(b.id, 8).toLowerCase(); if (!ID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
    if (b.action === 'incense') {
      const [first] = await pipeline([['SET', 'mkn:gv:inc1:' + ip + ':' + id, '1', 'EX', '3600', 'NX']]);
      if (!first) { const [n] = await pipeline([['GET', K.inc(id)]]); return send(res, 200, { ok: true, incense: Number(n) || 0, already: true }); }
      const [n] = await pipeline([['INCR', K.inc(id)], ['EXPIRE', K.inc(id), TTL]]);
      return send(res, 200, { ok: true, incense: n });
    }
    if (b.action === 'msg') {
      if (await limited(ip, 'msg', 4, 60)) return send(res, 429, { error: 'slow-down' });
      const text = clean(b.text, 100); if (text.length < 2) return send(res, 400, { error: 'empty' });
      const m = JSON.stringify({ nick: clean(b.nick, 20) || 'Người qua đường', text, at: Date.now() });
      const [, , msgs] = await pipeline([['LPUSH', K.msg(id), m], ['LTRIM', K.msg(id), '0', '19'], ['LRANGE', K.msg(id), '0', '19'], ['EXPIRE', K.msg(id), TTL]]);
      return send(res, 200, { ok: true, msgs: (msgs || []).map((x) => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean) });
    }
    return send(res, 400, { error: 'bad-action' });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String((e && e.message) || e).slice(0, 200) });
  }
};
