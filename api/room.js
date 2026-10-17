// Một Kiếp Người — máy chủ phòng chơi online (Vercel Serverless Function + Upstash Redis REST)
// GET  /api/room?code=ABCDE            → trạng thái phòng (người chơi, giai đoạn, tin nhắn gần nhất)
// POST /api/room { op, code, id, ... }  → create | join | msg   (ghi nguyên tử bằng script Lua)
// Biến môi trường do Vercel tự thêm khi nối kho Upstash: KV_REST_API_URL/KV_REST_API_TOKEN
// (hoặc UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN).
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = (code) => 'mkn:room:' + code;
const CODE_RE = /^[A-Z0-9]{5}$/;
const ID_RE = /^[a-z0-9]{4,16}$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Toàn bộ logic ghi chạy trong Redis để nhiều người bấm cùng lúc không ghi đè nhau.
const SCRIPT = `
local raw = redis.call('GET', KEYS[1])
local op = ARGV[1]
local p = cjson.decode(ARGV[2])
local now = tonumber(ARGV[3])
local TTL = 21600000
local function out(r) redis.call('SET', KEYS[1], cjson.encode(r), 'PX', TTL); return cjson.encode(r) end
local function push(r, m)
  r.v = (r.v or 0) + 1
  m.seq = r.v
  if type(r.msgs) ~= 'table' then r.msgs = {} end
  table.insert(r.msgs, m)
  while #r.msgs > 80 do table.remove(r.msgs, 1) end
end
local function sweep(r)
  for pid, pl in pairs(r.players) do
    if not pl.left and pid ~= p.id and (now - (pl.seen or now)) > 45000 then
      pl.left = true
      push(r, { t = 'sys', text = pl.name .. ' đã mất kết nối.' })
    end
  end
end
if op == 'create' then
  if raw then return cjson.encode({ err = 'exists' }) end
  local r = { v = 0, host = p.id, phase = 'lobby', players = {}, msgs = {}, created = now }
  r.players[p.id] = { name = p.name, seen = now, n = 1 }
  push(r, { t = 'sys', text = p.name .. ' đã tạo phòng.' })
  return out(r)
end
if not raw then return cjson.encode({ err = 'notfound' }) end
local r = cjson.decode(raw)
if type(r.players) ~= 'table' then r.players = {} end
if op == 'join' then
  local me = r.players[p.id]
  if me then
    me.left = false; me.seen = now
    return out(r)
  end
  if r.phase ~= 'lobby' then return cjson.encode({ err = 'started' }) end
  local active, total = 0, 0
  for _, pl in pairs(r.players) do total = total + 1; if not pl.left then active = active + 1 end end
  if active >= 6 then return cjson.encode({ err = 'full' }) end
  r.players[p.id] = { name = p.name, seen = now, n = total + 1 }
  push(r, { t = 'sys', text = p.name .. ' đã vào phòng.' })
  sweep(r)
  return out(r)
end
if op == 'msg' then
  local me = r.players[p.id]
  if not me then return cjson.encode({ err = 'notmember' }) end
  me.seen = now
  local m = p.m
  if m.t == 'snap' then
    me.snap = m.snap
    r.v = (r.v or 0) + 1
  elseif m.t == 'ping' then
    -- chỉ cập nhật “còn online”
  elseif m.t == 'leave' then
    me.left = true
    push(r, { t = 'sys', text = me.name .. ' đã rời phòng.' })
  elseif m.t == 'start' then
    if p.id ~= r.host or r.phase ~= 'lobby' then return cjson.encode({ err = 'forbidden' }) end
    r.phase = 'playing'
    if type(m.fam) == 'string' then r.fam = m.fam end
    push(r, { t = 'start', fam = m.fam })
  elseif m.t == 'chat' or m.t == 'emote' then
    push(r, { t = m.t, from = p.id, name = me.name, text = m.text })
  elseif m.t == 'act' then
    push(r, { t = 'act', from = p.id, name = me.name, to = m.to, kind = m.kind })
  else
    return cjson.encode({ err = 'badmsg' })
  end
  sweep(r)
  return out(r)
end
return cjson.encode({ err = 'badop' })
`;

async function redis(cmd) {
  const r = await fetch(REDIS_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((res) => {
    let s = '';
    req.on('data', (c) => { s += c; if (s.length > 20000) req.destroy(); });
    req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } });
  });
}
function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const code = clip((req.query && req.query.code) || new URL(req.url, 'http://x').searchParams.get('code'), 5).toUpperCase();
      if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
      const raw = await redis(['GET', KEY(code)]);
      if (!raw) return send(res, 404, { error: 'notfound' });
      return send(res, 200, { room: JSON.parse(raw) });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const b = await readBody(req);
    const id = clip(b.id, 16);
    if (!ID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
    const now = Date.now();
    if (b.op === 'create') {
      const name = clip(b.name, 20) || 'Chủ phòng';
      for (let i = 0; i < 6; i++) {
        const code = Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
        const r = JSON.parse(await redis(['EVAL', SCRIPT, '1', KEY(code), 'create', JSON.stringify({ id, name }), String(now)]));
        if (!r.err) return send(res, 200, { code, room: r });
      }
      return send(res, 500, { error: 'busy' });
    }
    const code = clip(b.code, 5).toUpperCase();
    if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
    let payload;
    if (b.op === 'join') payload = { id, name: clip(b.name, 20) || 'Khách' };
    else if (b.op === 'msg') {
      const m = b.m || {};
      const t = String(m.t || '');
      const clean = { t };
      if (t === 'chat' || t === 'emote') clean.text = clip(m.text, t === 'chat' ? 200 : 8);
      if (t === 'act') { clean.to = clip(m.to, 16); clean.kind = clip(m.kind, 16); }
      // chế độ “sống chung một nhà”: chủ phòng gửi kèm thông tin gia đình chung (họ, quê, năm sinh, bố mẹ)
      if (t === 'start' && m.fam && typeof m.fam === 'object') {
        const f = m.fam, par = (x) => ({ firstName: clip(x && x.firstName, 12), middleName: clip(x && x.middleName, 12), age: Math.round(Math.max(18, Math.min(60, Number(x && x.age) || 30))) });
        // gửi dạng chuỗi JSON: Lua chỉ lưu nguyên văn, không phải mã hoá bảng lồng nhau
        clean.fam = JSON.stringify({ lastName: clip(f.lastName, 12), city: clip(f.city, 16), born: Math.round(Math.max(1940, Math.min(2026, Number(f.born) || 2026))), father: par(f.father), mother: par(f.mother) });
      }
      if (t === 'snap') { const s = JSON.stringify(m.snap || {}); if (s.length > 3000) return send(res, 413, { error: 'too-big' }); clean.snap = m.snap; }
      payload = { id, m: clean };
    } else return send(res, 400, { error: 'bad-op' });
    const r = JSON.parse(await redis(['EVAL', SCRIPT, '1', KEY(code), b.op, JSON.stringify(payload), String(now)]));
    if (r.err) return send(res, r.err === 'notfound' ? 404 : 409, { error: r.err });
    return send(res, 200, { room: r });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String(e && e.message || e).slice(0, 200) });
  }
};
