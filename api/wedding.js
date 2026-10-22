// Một Kiếp Người — đám cưới online: cô dâu chú rể tạo thiệp mời có mã, bạn bè vào dự, viết lời chúc và mừng cưới
// POST /api/wedding { op:'create', pid, card }              → { code }
// GET  /api/wedding?code=XXXXXX                               → { card, wishes:[...], guests, total }
// POST /api/wedding { op:'wish', code, pid, nick, text, gift } → { ok }   (gift: 0 | 200000 | 500000 | 1000000 | 2000000)
// POST /api/wedding { op:'claim', code, pid }                 → { amount }  (chủ đám cưới nhận tiền mừng chưa nhận)
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ID_RE = /^[a-z0-9]{4,16}$/, CODE_RE = /^[A-Z2-9]{6}$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const K = (code, part) => 'mkn:wed:' + code + ':' + part;
const TTL = '1209600'; // 14 ngày
const GIFTS = [0, 200000, 500000, 1000000, 2000000];

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
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > 20000) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}
const txt = (s, n) => String(s || '').replace(/[<>\u0000-\u001f]/g, ' ').replace(/https?:\/\/\S+/gi, '').trim().slice(0, n);
// chỉ giữ dữ liệu ngoại hình cần để dựng nhân vật 3D (màu, kiểu tóc…), bỏ mọi thứ lạ
function cleanPerson(p) {
  if (!p || typeof p !== 'object') return null;
  const ap = {}; const src = p.appearance && typeof p.appearance === 'object' ? p.appearance : {};
  Object.keys(src).slice(0, 40).forEach((k) => { const v = src[k]; if (typeof v === 'string' && v.length <= 24) ap[k] = v; else if (typeof v === 'number' && isFinite(v)) ap[k] = v; else if (typeof v === 'boolean') ap[k] = v; });
  return { name: txt(p.name, 20) || '?', gender: p.gender === 'f' ? 'f' : 'm', age: Math.max(18, Math.min(99, +p.age || 25)), appearance: ap };
}

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      const code = String(q.code || '').toUpperCase(); if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
      const [card, wishes, total] = await pipeline([['GET', K(code, 'card')], ['LRANGE', K(code, 'w'), '-50', '-1'], ['GET', K(code, 'total')]]);
      if (!card) return send(res, 404, { error: 'notfound' });
      const c = JSON.parse(card); delete c.owner;
      const list = (wishes || []).map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
      return send(res, 200, { card: c, wishes: list, guests: list.length, total: +total || 0 });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const b = await readBody(req);
    const pid = String(b.pid || ''); if (!ID_RE.test(pid)) return send(res, 400, { error: 'bad-pid' });
    const [hits] = await pipeline([['INCR', 'mkn:wed:rl:' + pid], ['EXPIRE', 'mkn:wed:rl:' + pid, '60']]);
    if (hits > 12) return send(res, 429, { error: 'slow-down' });
    if (b.op === 'create') {
      const a = cleanPerson(b.card && b.card.a), bb = cleanPerson(b.card && b.card.b); if (!a || !bb) return send(res, 400, { error: 'bad-card' });
      const card = JSON.stringify({ owner: pid, a, b: bb, year: Math.max(1900, Math.min(2200, +(b.card && b.card.year) || 2026)), place: txt(b.card && b.card.place, 40), t: Date.now() });
      for (let i = 0; i < 6; i++) {
        const code = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
        const [ok] = await pipeline([['SET', K(code, 'card'), card, 'EX', TTL, 'NX']]);
        if (ok) return send(res, 200, { code });
      }
      return send(res, 500, { error: 'busy' });
    }
    const code = String(b.code || '').toUpperCase(); if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
    const [card] = await pipeline([['GET', K(code, 'card')]]);
    if (!card) return send(res, 404, { error: 'notfound' });
    const c = JSON.parse(card);
    if (b.op === 'wish') {
      if (c.owner === pid) return send(res, 400, { error: 'own' });
      const [dup] = await pipeline([['SADD', K(code, 'g'), pid], ['EXPIRE', K(code, 'g'), TTL]]);
      if (!dup) return send(res, 409, { error: 'already' });
      const gift = GIFTS.includes(+b.gift) ? +b.gift : 0;
      const w = JSON.stringify({ nick: txt(b.nick, 20) || 'Khách', text: txt(b.text, 160) || 'Chúc hai bạn trăm năm hạnh phúc!', gift, t: Date.now() });
      await pipeline([['RPUSH', K(code, 'w'), w], ['LTRIM', K(code, 'w'), '-50', '-1'], ['EXPIRE', K(code, 'w'), TTL], ['INCRBY', K(code, 'total'), String(gift)], ['INCRBY', K(code, 'unclaimed'), String(gift)], ['EXPIRE', K(code, 'total'), TTL], ['EXPIRE', K(code, 'unclaimed'), TTL]]);
      return send(res, 200, { ok: true });
    }
    if (b.op === 'claim') {
      if (c.owner !== pid) return send(res, 403, { error: 'not-owner' });
      const [amount] = await pipeline([['GETDEL', K(code, 'unclaimed')]]);
      return send(res, 200, { amount: +amount || 0 });
    }
    return send(res, 400, { error: 'bad-op' });
  } catch (e) {
    return send(res, 500, { error: 'server' });
  }
};
