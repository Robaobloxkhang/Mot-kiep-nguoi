// Một Kiếp Người — chat giữa người chơi: kênh chung + tin nhắn riêng + danh sách đang online
// GET  /api/chat?pid=..&nick=..&after=SEQ   → { g:[tin kênh chung mới], dm:[tin riêng gửi tới mình], on:[{pid,nick}], seq }
// POST /api/chat { op:'send', pid, nick, text, to? }  → { ok }  (to = pid người nhận → tin riêng)
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ID_RE = /^[a-z0-9]{4,16}$/;
const G = 'mkn:chat:g', SEQ = 'mkn:chat:seq', ON = 'mkn:chat:on', NAMES = 'mkn:chat:names';
const INBOX = (pid) => 'mkn:chat:in:' + pid;

// lọc từ thô tục (thay bằng ***), bỏ đường link để tránh lừa đảo
const BAD = ['đm', 'dm', 'đmm', 'dmm', 'đcm', 'dcm', 'vcl', 'vkl', 'vl', 'cc', 'cặc', 'cak', 'lồn', 'loz', 'buồi', 'địt', 'đĩ', 'đéo', 'óc chó', 'fuck', 'fck', 'shit', 'bitch', 'đụ', 'đù má', 'đjt', 'cl', 'clm', 'clgt'];
const BAD_RE = new RegExp('(^|[^\\p{L}\\p{N}])(' + BAD.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=$|[^\\p{L}\\p{N}])', 'giu');
function clean(t) {
  let s = String(t || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
  s = s.replace(/https?:\/\/\S+|www\.\S+/gi, '[link]');
  return s.replace(BAD_RE, (m, a, w) => a + '*'.repeat(w.length));
}
const nickOf = (n) => String(n || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 20) || 'Ẩn danh';

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
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > 8000) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}
const parse = (list) => (list || []).map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    const now = Date.now();
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      const pid = String(q.pid || ''); if (!ID_RE.test(pid)) return send(res, 400, { error: 'bad-pid' });
      const after = Math.max(0, +q.after || 0);
      const [, , , , g, dm, on, seq] = await pipeline([
        ['ZADD', ON, String(now), pid], ['HSET', NAMES, pid, nickOf(q.nick)], ['ZREMRANGEBYSCORE', ON, '0', String(now - 90000)], ['EXPIRE', INBOX(pid), '604800'],
        ['LRANGE', G, '-60', '-1'], ['LRANGE', INBOX(pid), '-40', '-1'], ['ZRANGEBYSCORE', ON, String(now - 60000), '+inf', 'LIMIT', '0', '60'], ['GET', SEQ],
      ]);
      const ids = (on || []).filter((x) => x !== pid);
      const names = ids.length ? (await pipeline([['HMGET', NAMES].concat(ids)]))[0] : [];
      return send(res, 200, { g: parse(g).filter((m) => m.seq > after), dm: parse(dm), on: ids.map((id, i) => ({ pid: id, nick: names[i] || 'Ẩn danh' })), seq: +seq || 0 });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const b = await readBody(req);
    const pid = String(b.pid || ''); if (!ID_RE.test(pid)) return send(res, 400, { error: 'bad-pid' });
    if (b.op !== 'send') return send(res, 400, { error: 'bad-op' });
    const text = clean(b.text); if (!text) return send(res, 400, { error: 'empty' });
    const [hits] = await pipeline([['INCR', 'mkn:chat:rl:' + pid], ['EXPIRE', 'mkn:chat:rl:' + pid, '15']]);
    if (hits > 6) return send(res, 429, { error: 'slow-down' });
    const nick = nickOf(b.nick);
    if (b.to) {
      const to = String(b.to); if (!ID_RE.test(to) || to === pid) return send(res, 400, { error: 'bad-to' });
      const [toName] = await pipeline([['HGET', NAMES, to]]);
      const m = JSON.stringify({ from: pid, nick, to, toNick: toName || 'Ẩn danh', text, t: now });
      await pipeline([['RPUSH', INBOX(to), m], ['LTRIM', INBOX(to), '-40', '-1'], ['EXPIRE', INBOX(to), '604800'], ['RPUSH', INBOX(pid), m], ['LTRIM', INBOX(pid), '-40', '-1'], ['EXPIRE', INBOX(pid), '604800']]);
      return send(res, 200, { ok: true });
    }
    const [seq] = await pipeline([['INCR', SEQ]]);
    await pipeline([['RPUSH', G, JSON.stringify({ seq, from: pid, nick, text, t: now })], ['LTRIM', G, '-60', '-1']]);
    return send(res, 200, { ok: true, seq });
  } catch (e) {
    return send(res, 500, { error: 'server' });
  }
};
