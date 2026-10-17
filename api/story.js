// Một Kiếp Người — tiểu sử chia sẻ được (Vercel Serverless + Upstash Redis REST)
// POST /api/story { pid, story:{...} } → { id }   (lưu 180 ngày)
// GET  /api/story?id=xxxxxxxx           → { story }
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ID_RE = /^[a-z0-9]{8}$/;
const KEY = (id) => 'mkn:story:' + id;

async function pipeline(cmds) {
  const r = await fetch(REDIS_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error((j && j.error) || 'redis');
  return j.map((x) => x.result);
}
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f<>]/g, ' ').trim().slice(0, n);
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; };
const list = (a, n, len) => (Array.isArray(a) ? a.slice(0, n).map((x) => clip(x, len)).filter(Boolean) : []);
function send(res, status, obj, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > 20000) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      const id = clip(q.id, 8).toLowerCase();
      if (!ID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
      const [raw] = await pipeline([['GET', KEY(id)]]);
      if (!raw) return send(res, 404, { error: 'notfound' });
      return send(res, 200, { story: JSON.parse(raw) }, 'public, s-maxage=3600, stale-while-revalidate=86400');
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const ip = clip((req.headers['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || 'x', 64);
    const [hits] = await pipeline([['INCR', 'mkn:rl:st:' + ip], ['EXPIRE', 'mkn:rl:st:' + ip, '60']]);
    if (hits > 6) return send(res, 429, { error: 'slow-down' });
    const b = await readBody(req);
    const s = b.story || {};
    const story = {
      name: clip(s.name, 50) || 'Vô danh', nick: clip(b.nick, 20),
      born: Math.round(num(s.born, 1900, 2300)), died: Math.round(num(s.died, 1900, 2400)), age: Math.round(num(s.age, 0, 125)),
      gender: s.gender === 'f' ? 'f' : 'm', city: clip(s.city, 40), cause: clip(s.cause, 90), rank: clip(s.rank, 24), score: Math.round(num(s.score, 0, 5000)),
      gen: Math.round(num(s.gen, 1, 99)), epitaph: clip(s.epitaph, 200), title: clip(s.title, 120),
      paragraphs: list(s.paragraphs, 10, 700), highlights: list(s.highlights, 10, 160), heirlooms: list(s.heirlooms, 8, 50),
      at: Date.now(),
    };
    if (!story.paragraphs.length) return send(res, 400, { error: 'empty' });
    for (let i = 0; i < 5; i++) {
      const id = Array.from({ length: 8 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');
      const [ok] = await pipeline([['SET', KEY(id), JSON.stringify(story), 'EX', String(180 * 86400), 'NX']]);
      if (ok) return send(res, 200, { ok: true, id });
    }
    return send(res, 500, { error: 'busy' });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String((e && e.message) || e).slice(0, 200) });
  }
};
