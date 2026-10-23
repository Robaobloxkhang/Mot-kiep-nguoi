// Một Kiếp Người — góp ý từ người chơi (có thể kèm tối đa 2 ảnh đã nén sẵn ở trình duyệt)
// POST /api/feedback { op:'send', pid, name, kind, text, contact?, ver?, imgs?:[dataURL] } → { ok, id }
// GET  /api/feedback?key=ADMIN&n=40                      → { items:[{id,t,kind,name,text,contact,ver,imgs}] }   (cần biến môi trường FEEDBACK_ADMIN_KEY)
// GET  /api/feedback?key=ADMIN&img=ID&i=0                → { img }
// POST /api/feedback { op:'del', key:ADMIN, id }          → { ok }
'use strict';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_KEY = process.env.FEEDBACK_ADMIN_KEY || '';
const ID_RE = /^[a-z0-9]{4,16}$/, FID_RE = /^[a-z0-9]{6,20}$/;
const IDX = 'mkn:fb:idx';
const KEEP = '7776000'; // 90 ngày
const KINDS = ['gopy', 'loi', 'ytuong', 'khac'];
const IMG_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_IMG = 400000, MAX_IMGS = 2, MAX_BODY = 1000000;

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
  return new Promise((res) => { let s = ''; req.on('data', (c) => { s += c; if (s.length > MAX_BODY) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(s || '{}')); } catch (e) { res({}); } }); });
}
const txt = (s, n) => String(s || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim().slice(0, n);
const isAdmin = (k) => !!ADMIN_KEY && typeof k === 'string' && k.length === ADMIN_KEY.length && k === ADMIN_KEY;
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

module.exports = async (req, res) => {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: 'not-configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
      if (!isAdmin(q.key)) return send(res, 403, { error: ADMIN_KEY ? 'forbidden' : 'admin-off' });
      if (q.img) {
        const id = String(q.img); if (!FID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
        const [d] = await pipeline([['GET', 'mkn:fb:i:' + id + ':' + (+q.i === 1 ? 1 : 0)]]);
        return d ? send(res, 200, { img: d }) : send(res, 404, { error: 'notfound' });
      }
      const n = Math.max(1, Math.min(60, +q.n || 40));
      const [ids] = await pipeline([['LRANGE', IDX, '0', String(n - 1)]]);
      const list = (ids || []).filter((x) => FID_RE.test(x));
      const rows = list.length ? await pipeline(list.map((id) => ['GET', 'mkn:fb:' + id])) : [];
      const items = rows.map((r, i) => { try { const o = JSON.parse(r); o.id = list[i]; return o; } catch (e) { return null; } }).filter(Boolean);
      return send(res, 200, { items });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });
    const b = await readBody(req);
    if (b.op === 'del') {
      if (!isAdmin(b.key)) return send(res, 403, { error: 'forbidden' });
      const id = String(b.id || ''); if (!FID_RE.test(id)) return send(res, 400, { error: 'bad-id' });
      await pipeline([['DEL', 'mkn:fb:' + id], ['DEL', 'mkn:fb:i:' + id + ':0'], ['DEL', 'mkn:fb:i:' + id + ':1'], ['LREM', IDX, '0', id]]);
      return send(res, 200, { ok: true });
    }
    if (b.op !== 'send') return send(res, 400, { error: 'bad-op' });
    const pid = String(b.pid || ''); if (!ID_RE.test(pid)) return send(res, 400, { error: 'bad-pid' });
    const text = txt(b.text, 1500); if (text.length < 5) return send(res, 400, { error: 'too-short' });
    const imgs = (Array.isArray(b.imgs) ? b.imgs : []).slice(0, MAX_IMGS);
    for (const im of imgs) if (typeof im !== 'string' || im.length > MAX_IMG || !IMG_RE.test(im)) return send(res, 400, { error: 'bad-img' });
    const ip = String((req.headers && (req.headers['x-forwarded-for'] || '')) || '').split(',')[0].trim().slice(0, 45) || 'x';
    const [h1, h2] = await pipeline([['INCR', 'mkn:fb:rl:' + pid], ['INCR', 'mkn:fb:rl:ip:' + ip], ['EXPIRE', 'mkn:fb:rl:' + pid, '3600'], ['EXPIRE', 'mkn:fb:rl:ip:' + ip, '3600']]);
    if (h1 > 5 || h2 > 12) return send(res, 429, { error: 'slow-down' });
    const id = newId();
    const rec = { t: Date.now(), kind: KINDS.includes(b.kind) ? b.kind : 'khac', name: txt(b.name, 30) || 'Ẩn danh', text, contact: txt(b.contact, 80), ver: txt(b.ver, 12), pid, imgs: imgs.length };
    const cmds = [['SET', 'mkn:fb:' + id, JSON.stringify(rec), 'EX', KEEP]];
    imgs.forEach((im, i) => cmds.push(['SET', 'mkn:fb:i:' + id + ':' + i, im, 'EX', KEEP]));
    cmds.push(['LPUSH', IDX, id], ['LTRIM', IDX, '0', '499']);
    await pipeline(cmds);
    return send(res, 200, { ok: true, id });
  } catch (e) {
    return send(res, 500, { error: 'server' });
  }
};
