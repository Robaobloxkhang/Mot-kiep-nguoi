// Một Kiếp Người — bảng xếp hạng toàn server (Vercel Serverless + Upstash Redis REST)
// GET  /api/leaderboard?by=score|age|worth&period=all|week   → top 50
// POST /api/leaderboard { pid, nick, life:{...} }             → ghi một cuộc đời vừa kết thúc
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const BYS = ['score', 'age', 'worth'];
const KEEP = 500; // mỗi bảng chỉ giữ top 500

function weekId(d) {
  // tuần ISO (thứ Hai đầu tuần), tính theo giờ Việt Nam
  const t = new Date(d.getTime() + 7 * 3600e3);
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const y = t.getUTCFullYear();
  const first = new Date(Date.UTC(y, 0, 4));
  const w = 1 + Math.round(((t - first) / 864e5 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return y + '-' + String(w).padStart(2, '0');
}
const dayId = (d) => new Date(d.getTime() + 7 * 3600e3).toISOString().slice(0, 10);
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const key = (by, period, day) => 'mkn:lb:' + (period === 'week' ? 'w:' + weekId(new Date()) + ':' : period === 'day' ? 'd:' + day + ':' : '') + by;

async function pipeline(cmds) {
  const r = await fetch(REDIS_URL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error((j && j.error) || 'redis');
  return j.map((x) => x.result);
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

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      const by = BYS.includes(q.by) ? q.by : 'score';
      const period = ['week', 'day'].includes(q.period) ? q.period : 'all';
      const day = DAY_RE.test(q.day || '') ? q.day : dayId(new Date());
      const [rows, total] = await pipeline([['ZREVRANGE', key(by, period, day), '0', '49', 'WITHSCORES'], ['ZCARD', key(by, period, day)]]);
      const list = [];
      for (let i = 0; i < (rows || []).length; i += 2) { try { list.push(Object.assign(JSON.parse(rows[i]), { v: Number(rows[i + 1]) })); } catch (e) { /* bỏ dòng hỏng */ } }
      // bảng đọc nhiều: cho CDN giữ 30 giây để tiết kiệm lượt gọi Redis
      return send(res, 200, { by, period, day, week: weekId(new Date()), total: total || 0, list }, 'public, s-maxage=30, stale-while-revalidate=60');
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const ip = clip((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || 'x', 64);
    const [hits] = await pipeline([['INCR', 'mkn:rl:lb:' + ip], ['EXPIRE', 'mkn:rl:lb:' + ip, '60']]);
    if (hits > 10) return send(res, 429, { error: 'slow-down' });
    const b = await readBody(req);
    const L = b.life || {};
    // kiểm tra hợp lý (game chạy trên máy người chơi nên chỉ chặn được số liệu vô lý)
    const entry = {
      id: clip(b.pid, 16) + '.' + Date.now().toString(36),
      nick: clip(b.nick, 20) || 'Ẩn danh',
      name: clip(L.fullName, 40) || 'Vô danh',
      age: Math.round(num(L.age, 0, 125)),
      worth: Math.round(num(L.worth, -1e13, 1e15)),
      score: Math.round(num(L.score, 0, 2000)),
      cause: clip(L.cause, 60),
      job: clip(L.job, 40),
      diff: ['de', 'thuong', 'kho', 'diangu'].includes(L.diff) ? L.diff : 'thuong',
      gen: Math.round(num(L.gen, 1, 99)),
      rank: clip(L.rank, 20),
      at: Date.now(),
    };
    const member = JSON.stringify(entry);
    const cmds = [];
    for (const period of ['all', 'week']) {
      for (const by of BYS) {
        const k = key(by, period);
        cmds.push(['ZADD', k, String(entry[by]), member]);
        cmds.push(['ZREMRANGEBYRANK', k, '0', String(-KEEP - 1)]);
        if (period === 'week') cmds.push(['EXPIRE', k, String(16 * 86400)]);
      }
    }
    // thử thách hằng ngày: chỉ nhận cuộc đời hoàn thành thử thách của hôm nay (hoặc hôm qua, nếu chơi qua nửa đêm)
    const ch = b.challenge || {};
    const now = new Date(), today = dayId(now), yday = dayId(new Date(now.getTime() - 864e5));
    const chDay = ch.ok && (ch.day === today || ch.day === yday) ? ch.day : null;
    if (chDay) {
      const dk = key('score', 'day', chDay);
      cmds.push(['ZADD', dk, String(entry.score), member], ['ZREMRANGEBYRANK', dk, '0', String(-KEEP - 1)], ['EXPIRE', dk, String(4 * 86400)]);
    }
    cmds.push(['ZREVRANK', key('score', 'all'), member], ['ZREVRANK', key('score', 'week'), member], ['ZREVRANK', key('score', 'day', chDay || today), member]);
    const out = await pipeline(cmds);
    const rankAll = out[out.length - 3], rankWeek = out[out.length - 2], rankDay = chDay ? out[out.length - 1] : null;
    return send(res, 200, { ok: true, rankAll: rankAll == null ? null : rankAll + 1, rankWeek: rankWeek == null ? null : rankWeek + 1, rankDay: rankDay == null ? null : rankDay + 1 });
  } catch (e) {
    return send(res, 500, { error: 'server', detail: String((e && e.message) || e).slice(0, 200) });
  }
};
