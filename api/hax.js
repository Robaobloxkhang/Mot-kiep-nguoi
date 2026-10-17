// Một Kiếp Người — ghép phòng cho "Bóng đá Hax" online, nhiều người (chỉ trao đổi tín hiệu WebRTC; trận đấu chạy trực tiếp giữa các máy)
// POST /api/hax { op:'create' }                       → { code }            (chủ phòng tạo phòng)
// POST /api/hax { op:'join', code, offer }            → { id }              (người vào gửi lời mời kết nối)
// GET  /api/hax?code=XXXXX&get=queue                  → { reqs:[{id,offer}] } (chủ phòng lấy các lời mời mới)
// POST /api/hax { op:'answer', code, id, answer }     → { ok }              (chủ phòng trả lời từng người)
// GET  /api/hax?code=XXXXX&get=answer&id=ID           → { answer | null }   (người vào chờ câu trả lời)
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CODE_RE = /^[A-Z2-9]{5}$/, ID_RE = /^[a-z0-9]{8}$/;
const K = (code, part) => 'mkn:hax:' + code + ':' + part;
const TTL = '1800';

async function pipeline(cmds) {
  const r = await fetch(REDIS_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error((j && j.error) || 'redis');
  return j.map((x) => x.result);
}
function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > 40000) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}
// mô tả phiên WebRTC: chỉ nhận đúng dạng { type, sdp } và giới hạn kích thước
function cleanSdp(d, type) {
  if (!d || typeof d !== 'object' || d.type !== type || typeof d.sdp !== 'string') return null;
  if (d.sdp.length > 30000 || !/^v=0/.test(d.sdp)) return null;
  return { type, sdp: d.sdp };
}

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      const code = String(q.code || '').toUpperCase(); if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
      if (q.get === 'queue') {
        const [list] = await pipeline([['LRANGE', K(code, 'q'), '0', '-1'], ['DEL', K(code, 'q')], ['EXPIRE', K(code, 'room'), TTL]]);
        const reqs = (list || []).map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
        return send(res, 200, { reqs });
      }
      if (q.get === 'answer') {
        const id = String(q.id || ''); if (!ID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
        const [a] = await pipeline([['GET', K(code, 'a:' + id)]]);
        return send(res, 200, { answer: a ? JSON.parse(a) : null });
      }
      return send(res, 400, { error: 'bad-get' });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || 'x').slice(0, 64);
    const [hits] = await pipeline([['INCR', 'mkn:rl:hax:' + ip], ['EXPIRE', 'mkn:rl:hax:' + ip, '60']]);
    if (hits > 30) return send(res, 429, { error: 'slow-down' });
    const b = await readBody(req);
    if (b.op === 'create') {
      for (let i = 0; i < 6; i++) {
        const code = Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
        const [ok] = await pipeline([['SET', K(code, 'room'), '1', 'EX', TTL, 'NX']]);
        if (ok) return send(res, 200, { ok: true, code });
      }
      return send(res, 500, { error: 'busy' });
    }
    const code = String(b.code || '').toUpperCase(); if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
    if (b.op === 'join') {
      const offer = cleanSdp(b.offer, 'offer'); if (!offer) return send(res, 400, { error: 'bad-offer' });
      const [exists, len] = await pipeline([['EXISTS', K(code, 'room')], ['LLEN', K(code, 'q')]]);
      if (!exists) return send(res, 404, { error: 'notfound' });
      if (len >= 10) return send(res, 409, { error: 'full' });
      const id = Array.from({ length: 8 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join('');
      await pipeline([['RPUSH', K(code, 'q'), JSON.stringify({ id, offer })], ['EXPIRE', K(code, 'q'), TTL]]);
      return send(res, 200, { ok: true, id });
    }
    if (b.op === 'answer') {
      const id = String(b.id || ''); if (!ID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
      const answer = cleanSdp(b.answer, 'answer'); if (!answer) return send(res, 400, { error: 'bad-answer' });
      await pipeline([['SET', K(code, 'a:' + id), JSON.stringify(answer), 'EX', '300']]);
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { error: 'bad-op' });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String((e && e.message) || e).slice(0, 200) });
  }
};
