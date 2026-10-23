/* Một Kiếp Người — máy chủ riêng cho Bóng đá Hax / Bóng rổ online.
   Mọi người nối vào đây bằng WebSocket qua cổng 443 (wss://) — như mở một trang web bình thường — nên mạng trường,
   công ty chặn kết nối trực tiếp (WebRTC) vẫn chơi được. Máy chủ tự chạy vật lý 60 lần/giây (dùng đúng code js/hax.js)
   và gửi trạng thái cho mọi người; trên máy người chơi vẫn dự đoán chuyển động nên nhân vật phản hồi tức thì.
   - Phòng chung "SANH": luôn mở sẵn, đủ 2 người là tự đếm ngược rồi đá, đá xong tự quay về phòng chờ.
   - Phòng riêng: người tạo phòng là chủ phòng, chỉnh bản đồ/thời lượng rồi bấm bắt đầu.
   Chạy: node server/index.js (PORT mặc định 8080). Kiểm tra sống: GET /health */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { WebSocketServer } = require('ws');

// ---------------------------------------------------------------- nạp bộ mô phỏng từ js/hax.js
function loadSim() {
  const win = { KN: {} };
  const ctx = { localStorage: { getItem: () => null, setItem() {} }, matchMedia: () => ({ matches: false }), performance, console, setTimeout, clearTimeout, requestAnimationFrame: () => 0, cancelAnimationFrame() {}, document: {}, navigator: {} };
  ctx.window = Object.assign(win, ctx);
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'hax.js'), 'utf8'), ctx, { filename: 'hax.js' });
  return { sim: win.KN.Hax._sim, maps: win.KN.Hax.MAPS };
}
const { sim: S, maps: MAPS } = loadSim();

const MAX_PLAYERS = 8, HZ = 60, SEND_EVERY = 1; // gửi trạng thái 60 lần/giây (mỗi nhịp) để giảm độ trễ cảm nhận
const PUBLIC = 'SANH', AUTO_START = 8;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rooms = new Map();
let nextId = 1;

const cleanName = (s) => String(s || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 14) || 'Bạn';
const sendTo = (c, o) => { try { if (c.ws.readyState === 1) c.ws.send(typeof o === 'string' ? o : JSON.stringify(o)); } catch (e) { /* */ } };
const DURS = [120, 180, 300];

function newRoom(code, pub) {
  const r = { code, pub, members: [], admin: null, cfg: { map: 'classic', dur: 180, bots: true, lvl: 1 }, playing: false, m: null, owners: null, countdown: 0, endAt: 0, tick: 0 };
  rooms.set(code, r); return r;
}
newRoom(PUBLIC, true);
function makeCode() { for (;;) { const c = Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join(''); if (!rooms.has(c)) return c; } }

const humans = (r) => r.members.filter((c) => !c.waiting);
function fewer(r) { const h = r.members; return h.filter((x) => x.team === 0).length <= h.filter((x) => x.team === 1).length ? 0 : 1; }
function lobbyMsg(r, c) {
  return { t: 'lobby', server: true, code: r.code, pub: r.pub, map: r.cfg.map, dur: r.cfg.dur, bots: r.cfg.bots, lvl: r.cfg.lvl, auto: r.countdown ? Math.ceil(r.countdown / HZ) : 0, admin: r.admin === c, playing: r.playing,
    players: r.members.map((x) => ({ id: x.id, name: x.name, team: x.team, admin: r.admin === x })), you: c.id };
}
function sendLobby(r) { r.members.forEach((c) => { if (!r.playing || c.waiting) sendTo(c, lobbyMsg(r, c)); }); }

function enter(c, r) {
  leave(c);
  if (r.members.length >= MAX_PLAYERS) return sendTo(c, { t: 'err', msg: 'Phòng đã đủ ' + MAX_PLAYERS + ' người' });
  c.room = r; c.team = fewer(r); c.input = {}; c.waiting = r.playing;
  r.members.push(c);
  if (!r.pub && !r.admin) r.admin = c;
  sendTo(c, { t: 'joined', code: r.code, you: c.id, pub: r.pub });
  if (r.playing) sendTo(c, { t: 'wait' });
  sendLobby(r);
}
function leave(c) {
  const r = c.room; if (!r) return;
  c.room = null; r.members = r.members.filter((x) => x !== c);
  if (r.admin === c) r.admin = r.members[0] || null;
  if (r.playing && r.owners) { const i = r.owners.indexOf(c); if (i >= 0) { r.owners[i] = r.cfg.lvl; r.m.players[i].human = false; r.m.players[i].name = c.name + ' (máy)'; } }
  if (!r.pub && !r.members.length) { rooms.delete(r.code); return; }
  if (r.playing && !humans(r).length) endMatch(r, true);
  sendLobby(r);
}

function startMatch(r) {
  const h = humans(r); if (!h.length) return;
  const roster = [], owners = [];
  h.forEach((c) => { roster.push({ team: c.team, name: c.name }); owners.push(c); });
  const n0 = h.filter((x) => x.team === 0).length, n1 = h.length - n0, size = Math.max(n0, n1, 1);
  if (r.cfg.bots || h.length < 2) [0, 1].forEach((t) => { for (let i = t === 0 ? n0 : n1; i < size; i++) { roster.push({ team: t, name: 'Máy' }); owners.push(r.cfg.lvl); } });
  [0, 1].forEach((t) => { if (!roster.some((x) => x.team === t)) { roster.push({ team: t, name: 'Máy' }); owners.push(r.cfg.lvl); } });
  const order = roster.map((x, i) => i).sort((a, b) => roster[a].team - roster[b].team || a - b);
  const ros = order.map((i) => roster[i]), own = order.map((i) => owners[i]);
  const m = S.newMatch({ dur: r.cfg.dur, map: r.cfg.map, roster: ros });
  own.forEach((o, i) => { if (typeof o === 'object') m.players[i].human = true; });
  Object.assign(r, { m, owners: own, playing: true, countdown: 0, tick: 0, endAt: 0 });
  own.forEach((o, i) => { if (typeof o === 'object') sendTo(o, { t: 'start', map: m.map, dur: m.dur, roster: ros, me: i }); });
}
function endMatch(r, silent) {
  if (!r.m) return;
  if (!silent) r.members.forEach((c) => { if (!c.waiting) sendTo(c, { t: 'end', sc: r.m.score }); });
  r.playing = false; r.m = null; r.owners = null;
  r.members.forEach((c) => { c.waiting = false; c.input = {}; });
  r.backAt = Date.now() + 6000; // để mọi người xem tỷ số rồi mới quay về phòng chờ
}

// ---------------------------------------------------------------- vòng lặp 60 lần/giây cho mọi phòng
let last = process.hrtime.bigint(), acc = 0;
setInterval(() => {
  const now = process.hrtime.bigint(); acc += Math.min(0.25, Number(now - last) / 1e9); last = now;
  while (acc >= 1 / HZ) { acc -= 1 / HZ; rooms.forEach(tickRoom); }
}, 1000 / HZ / 2);
function tickRoom(r) {
  if (r.backAt) { if (Date.now() < r.backAt) return; r.backAt = 0; sendLobby(r); }
  if (!r.playing) {
    if (r.pub) {
      const n = r.members.length;
      if (n >= 2 && !r.countdown) { r.countdown = AUTO_START * HZ; sendLobby(r); }
      else if (n < 2 && r.countdown) { r.countdown = 0; sendLobby(r); }
      else if (r.countdown) { r.countdown--; if (r.countdown % HZ === 0) sendLobby(r); if (r.countdown <= 0) startMatch(r); }
    }
    return;
  }
  const m = r.m; S.applyMap(m.map); // bản đồ là biến chung của bộ mô phỏng → đặt lại trước mỗi phòng
  const ins = r.owners.map((o, i) => (typeof o === 'number' ? S.aiInput(m, i, o) : o.input || {}));
  S.step(m, ins); m.events.length = 0;
  if (m.phase === 'end') { r.members.forEach((c) => { if (!c.waiting) sendTo(c, S.snapshot(m, ins.map(S.vecOf))); }); endMatch(r); return; }
  if (++r.tick % SEND_EVERY === 0) { const s = S.snapshot(m, ins.map(S.vecOf)); r.members.forEach((c) => { if (!c.waiting) sendTo(c, s); }); }
}

// ---------------------------------------------------------------- tin nhắn từ người chơi
function onMsg(c, raw) {
  let d; try { d = JSON.parse(raw); } catch (e) { return; }
  if (!d || typeof d !== 'object') return;
  const r = c.room;
  switch (d.t) {
    case 'i': if (r && r.playing && d.i && typeof d.i === 'object') c.input = S.vecOf(d.i); break;
    case 'ping': sendTo(c, { t: 'pong', c: d.c }); break;
    case 'hello': { const nm = cleanName(d.name); if (nm !== c.name) { c.name = nm; if (r && !r.playing) sendLobby(r); } break; }
    case 'quick': c.name = cleanName(d.name); enter(c, rooms.get(PUBLIC)); break;
    case 'create': { c.name = cleanName(d.name); if (rooms.size > 300) return sendTo(c, { t: 'err', msg: 'Máy chủ đang đông, thử lại sau' }); const nr = newRoom(makeCode(), false); applyCfg(nr, d.cfg); enter(c, nr); break; }
    case 'join': { c.name = cleanName(d.name); const nr = rooms.get(String(d.code || '').trim().toUpperCase()); if (!nr) return sendTo(c, { t: 'err', msg: 'Không tìm thấy phòng (mã sai hoặc chủ phòng đã thoát)' }); enter(c, nr); break; }
    case 'leave': leave(c); break;
    case 'team': if (r && !r.playing) { c.team = 1 - c.team; sendLobby(r); } break;
    case 'swap': if (r && !r.playing && r.admin === c) { const x = r.members.find((y) => y.id === d.id); if (x) { x.team = 1 - x.team; sendLobby(r); } } break;
    case 'cfg': if (r && !r.playing && r.admin === c) { applyCfg(r, d); sendLobby(r); } break;
    case 'start': if (r && !r.playing && !r.backAt && r.admin === c) startMatch(r); break;
    default:
  }
}
function applyCfg(r, d) {
  if (!d || typeof d !== 'object') return;
  if (MAPS[d.map]) r.cfg.map = d.map;
  if (DURS.includes(+d.dur)) r.cfg.dur = +d.dur;
  if (typeof d.bots === 'boolean') r.cfg.bots = d.bots;
  if ([0, 1, 2].includes(+d.lvl)) r.cfg.lvl = +d.lvl;
}

// ---------------------------------------------------------------- HTTP + WebSocket
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.url.startsWith('/health') || req.url === '/') {
    const pub = rooms.get(PUBLIC);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: true, rooms: rooms.size, online: wss.clients.size, lobby: pub.members.length, playing: pub.playing }));
  }
  res.statusCode = 404; res.end('not found');
});
const wss = new WebSocketServer({ server, maxPayload: 4096, perMessageDeflate: false });
wss.on('connection', (ws, req) => {
  if (wss.clients.size > 400) { ws.close(1013, 'busy'); return; }
  const c = { id: 'p' + nextId++, ws, name: 'Bạn', room: null, team: 0, input: {}, alive: true, waiting: false, n: 0, nAt: Date.now() };
  ws._sock = req.socket; try { req.socket.setNoDelay(true); } catch (e) { /* */ }
  ws.on('pong', () => (c.alive = true));
  ws.on('message', (data) => {
    const now = Date.now(); if (now - c.nAt > 1000) { c.nAt = now; c.n = 0; }
    if (++c.n > 120) return; // chống spam: tối đa 120 tin/giây
    onMsg(c, data.toString());
  });
  ws.on('close', () => leave(c));
  ws.on('error', () => { /* */ });
  c.ws._kn = c;
  sendTo(c, { t: 'hi', you: c.id });
});
setInterval(() => wss.clients.forEach((ws) => { const c = ws._kn; if (!c) return; if (!c.alive) { ws.terminate(); return; } c.alive = false; try { ws.ping(); } catch (e) { /* */ } }), 15000);

// Render bản miễn phí ngủ sau 15 phút không ai ghé → tự ghé chính mình mỗi 10 phút để phòng luôn bật sẵn
if (process.env.RENDER_EXTERNAL_URL && process.env.KEEP_AWAKE !== '0') {
  setInterval(() => { fetch(process.env.RENDER_EXTERNAL_URL + '/health').catch(() => {}); }, 10 * 60e3);
}
const PORT = +process.env.PORT || 8080;
server.listen(PORT, () => console.log('Hax server on :' + PORT));
