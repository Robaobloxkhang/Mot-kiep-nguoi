// Một Kiếp Người — dòng họ online (Vercel Serverless + Upstash Redis REST)
// GET  /api/clan?code=ABC123      → thông tin dòng họ
// GET  /api/clan?top=1            → top 30 dòng họ theo tổng điểm
// POST /api/clan { op, pid, nick, ... }  op: create {name} | join {code} | leave {code} | life {code, life} | donate {code, amount}
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = (code) => 'mkn:clan:' + code;
const LB = 'mkn:clan:lb';
const CODE_RE = /^[A-Z0-9]{6}$/;
const ID_RE = /^[a-z0-9]{4,16}$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// ghi nguyên tử trong Redis; trả về JSON dòng họ sau khi cập nhật
const SCRIPT = `
local raw = redis.call('GET', KEYS[1])
local op = ARGV[1]
local p = cjson.decode(ARGV[2])
local now = tonumber(ARGV[3])
local function out(c)
  redis.call('SET', KEYS[1], cjson.encode(c))
  redis.call('ZADD', KEYS[2], c.total, KEYS[1] .. '|' .. c.name)
  return cjson.encode(c)
end
local function log(c, text)
  if type(c.log) ~= 'table' then c.log = {} end
  table.insert(c.log, { t = now, text = text })
  while #c.log > 30 do table.remove(c.log, 1) end
end
local function count(c) local n = 0; for _ in pairs(c.members) do n = n + 1 end; return n end
if op == 'create' then
  if raw then return cjson.encode({ err = 'exists' }) end
  local c = { name = p.name, owner = p.pid, created = now, total = 0, fund = 0, lives = 0, members = {}, log = {} }
  c.members[p.pid] = { nick = p.nick, lives = 0, best = 0, total = 0, joined = now }
  log(c, p.nick .. ' lập dòng họ ' .. p.name .. '.')
  return out(c)
end
if not raw then return cjson.encode({ err = 'notfound' }) end
local c = cjson.decode(raw)
if type(c.members) ~= 'table' then c.members = {} end
local me = c.members[p.pid]
if op == 'join' then
  if me then me.nick = p.nick; return out(c) end
  if count(c) >= 30 then return cjson.encode({ err = 'full' }) end
  c.members[p.pid] = { nick = p.nick, lives = 0, best = 0, total = 0, joined = now }
  log(c, p.nick .. ' gia nhập dòng họ.')
  return out(c)
end
if not me then return cjson.encode({ err = 'notmember' }) end
if op == 'leave' then
  c.members[p.pid] = nil
  log(c, me.nick .. ' rời dòng họ.')
  return out(c)
end
if op == 'life' then
  local L = p.life
  me.lives = me.lives + 1; me.total = me.total + L.score
  if L.score > me.best then me.best = L.score end
  c.lives = (c.lives or 0) + 1; c.total = c.total + L.score
  log(c, me.nick .. ': ' .. L.name .. ' mất ở tuổi ' .. L.age .. ', ' .. L.score .. ' điểm' .. (L.note ~= '' and (' · ' .. L.note) or '') .. '.')
  return out(c)
end
if op == 'donate' then
  c.fund = (c.fund or 0) + p.amount
  log(c, me.nick .. ' góp ' .. p.label .. ' vào quỹ dòng họ.')
  return out(c)
end
return cjson.encode({ err = 'badop' })
`;

async function redis(cmd) {
  const r = await fetch(REDIS_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n);
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; };
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
const money = (v) => (v >= 1e9 ? Math.round(v / 1e8) / 10 + ' tỷ' : Math.round(v / 1e6) + ' triệu');

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      if (q.top) {
        const rows = await redis(['ZREVRANGE', LB, '0', '29', 'WITHSCORES']);
        const list = [];
        for (let i = 0; i < (rows || []).length; i += 2) { const [k, ...nm] = String(rows[i]).split('|'); list.push({ code: k.replace('mkn:clan:', ''), name: nm.join('|'), total: Number(rows[i + 1]) }); }
        return send(res, 200, { list }, 'public, s-maxage=30, stale-while-revalidate=60');
      }
      const code = clip(q.code, 6).toUpperCase();
      if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
      const raw = await redis(['GET', KEY(code)]);
      if (!raw) return send(res, 404, { error: 'notfound' });
      return send(res, 200, { code, clan: JSON.parse(raw) });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const ip = clip((req.headers['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || 'x', 64);
    const hits = await redis(['INCR', 'mkn:rl:cl:' + ip]); if (hits === 1) await redis(['EXPIRE', 'mkn:rl:cl:' + ip, '60']);
    if (hits > 20) return send(res, 429, { error: 'slow-down' });
    const b = await readBody(req);
    const pid = clip(b.pid, 16); if (!ID_RE.test(pid)) return send(res, 400, { error: 'bad-id' });
    const nick = clip(b.nick, 20) || 'Ẩn danh';
    const now = String(Date.now());
    const run = (code, op, payload) => redis(['EVAL', SCRIPT, '2', KEY(code), LB, op, JSON.stringify(Object.assign({ pid, nick }, payload)), now]);
    if (b.op === 'create') {
      const name = clip(b.name, 30); if (!name) return send(res, 400, { error: 'bad-name' });
      for (let i = 0; i < 6; i++) {
        const code = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
        const c = JSON.parse(await run(code, 'create', { name }));
        if (!c.err) return send(res, 200, { code, clan: c });
      }
      return send(res, 500, { error: 'busy' });
    }
    const code = clip(b.code, 6).toUpperCase();
    if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad-code' });
    let payload = {};
    if (b.op === 'life') {
      const L = b.life || {};
      payload = { life: { name: clip(L.name, 40) || 'Vô danh', age: Math.round(num(L.age, 0, 125)), score: Math.round(num(L.score, 0, 2000)), note: clip(L.note, 60) } };
    } else if (b.op === 'donate') {
      const amount = Math.round(num(b.amount, 0, 5e11));
      if (amount < 1e6) return send(res, 400, { error: 'too-small' });
      payload = { amount, label: money(amount) };
    } else if (!['join', 'leave'].includes(b.op)) return send(res, 400, { error: 'bad-op' });
    const c = JSON.parse(await run(code, b.op, payload));
    if (c.err) return send(res, c.err === 'notfound' ? 404 : 409, { error: c.err });
    return send(res, 200, { code, clan: c });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String((e && e.message) || e).slice(0, 200) });
  }
};
