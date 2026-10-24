/* Một Kiếp Người — 🏍️ ĐUA XE MÁY (KN.Race): đua nhìn từ trên xuống, 3 đường đua, ổ gà · vũng dầu · ô tăng tốc ⚡.
   Chế độ: đua với máy (5 đối thủ) · ONLINE tối đa 8 người (WebRTC, ghép phòng qua /api/hax như Bóng đá Hax).
   Online: mỗi người tự chạy xe của mình ngay trên máy mình (không trễ), gửi vị trí cho chủ phòng; chủ phòng chạy xe máy (bot),
   gộp vị trí mọi người rồi phát lại cho cả phòng 30 lần/giây, và là người xếp hạng về đích.
   Điều khiển: ↑/W ga · ↓/S phanh/lùi · ←→/AD lái · Space dùng nitro (khi có). Điện thoại: nút cảm ứng. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const coarse = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const myName = () => { try { const c = JSON.parse(localStorage.getItem('kn_hax_cfg') || '{}'); return (c.name || (KN.Game.hasLife() && KN.Game.view() ? KN.Game.view().name.split(' ').pop() : '') || 'Bạn').slice(0, 14); } catch (e) { return 'Bạn'; } };
  // ---------------------------------------------------------------- đường đua (đường cong khép kín sinh từ tham số → không bao giờ tự cắt)
  const TRACKS = {
    pho: { name: 'Phố cổ', icon: '🏮', rx: 1150, ry: 820, k: 6, A: 0.07, sq: 4, w: 130, bg: '#cdbf9f', road: '#5a5d63', edge: '#e8e2d2', deco: ['🏮', '🛵', '🍜', '🏪', '🌳', '☕', '🏠'], desc: 'Phố hẹp vuông vức, nhiều góc cua gắt' },
    bien: { name: 'Đường ven biển', icon: '🌊', rx: 1550, ry: 950, k: 3, A: 0.15, sq: 2, w: 150, bg: '#e6cf92', road: '#4f5359', edge: '#ffffff', deco: ['🌴', '⛱️', '🦀', '🐚', '🌴', '🏖️'], sea: true, desc: 'Đường rộng, tốc độ cao, gió biển lồng lộng' },
    deo: { name: 'Đèo Hải Vân', icon: '⛰️', rx: 1250, ry: 1050, k: 5, A: 0.27, sq: 2, w: 118, bg: '#5d8f4a', road: '#55585e', edge: '#f2d34a', deco: ['🌲', '⛰️', '🌲', '🐐', '🌫️', '🌲'], desc: 'Uốn lượn liên tục, ra khỏi đường là chậm hẳn' },
  };
  const NPT = 64;
  let TK = null; // đường đua đang dùng (đã dựng điểm)
  function buildTrack(id) {
    const d = TRACKS[id] || TRACKS.pho, pts = [];
    for (let i = 0; i < NPT; i++) {
      const t = i / NPT * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      // siêu elip (sq = 4: gần vuông) + sóng uốn lượn
      const e = 2 / d.sq, r = 1 + d.A * Math.sin(d.k * t + 0.7);
      pts.push([Math.sign(c) * Math.pow(Math.abs(c), e) * d.rx * r, Math.sign(s) * Math.pow(Math.abs(s), e) * d.ry * r]);
    }
    const path = new Path2D(); pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y))); path.closePath();
    // vật phẩm trên đường: ô tăng tốc, ổ gà, vũng dầu (vị trí cố định theo đường đua)
    let seed = id.length * 977; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const items = [];
    for (let i = 3; i < NPT; i += 4) { const [x, y] = pts[i], [nx, ny] = pts[(i + 1) % NPT], ang = Math.atan2(ny - y, nx - x), off = (rnd() - 0.5) * d.w * 0.6; items.push({ x: x - Math.sin(ang) * off, y: y + Math.cos(ang) * off, k: rnd() < 0.45 ? 'boost' : rnd() < 0.6 ? 'hole' : 'oil', ang }); }
    const deco = [];
    for (let i = 0; i < 160; i++) { const x = (rnd() * 2 - 1) * (d.rx + 500), y = (rnd() * 2 - 1) * (d.ry + 450); if (distTo(pts, x, y).d > d.w * 0.9) deco.push([d.deco[Math.floor(rnd() * d.deco.length)], x, y, 22 + rnd() * 16]); }
    TK = { id, d, pts, path, items, deco, start: pts[0], startAng: Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]) };
    return TK;
  }
  // khoảng cách tới tâm đường + vị trí dọc đường (s: 0..NPT)
  function distTo(pts, x, y, near) {
    let best = { d: 1e9, s: 0 };
    const n = pts.length, from = near == null ? 0 : Math.floor(near) - 6, to = near == null ? n : Math.floor(near) + 7;
    for (let j = from; j < to; j++) {
      const i = ((j % n) + n) % n, a = pts[i], b = pts[(i + 1) % n], vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy;
      let t = ((x - a[0]) * vx + (y - a[1]) * vy) / L2; t = Math.max(0, Math.min(1, t));
      const px = a[0] + vx * t, py = a[1] + vy * t, d = Math.hypot(x - px, y - py);
      if (d < best.d) best = { d, s: i + t };
    }
    return best;
  }
  // ---------------------------------------------------------------- xe
  const COLORS = ['#e8423f', '#3d7bf2', '#39cf98', '#ffb347', '#c792ff', '#ff7eb6', '#5cc8ff', '#f2f2f2'];
  function newBike(i, name, bot) {
    const row = Math.floor(i / 2), col = i % 2, a = TK.startAng, back = -60 - row * 46, side = (col - 0.5) * 46;
    return { i, name, bot, color: COLORS[i % COLORS.length], x: TK.start[0] + Math.cos(a) * back - Math.sin(a) * side, y: TK.start[1] + Math.sin(a) * back + Math.cos(a) * side, a, v: 0, s: NPT - 1.2 - row * 0.8, lap: 0, half: false, prog: -1, fin: 0, boost: 0, nitro: 0, spin: 0, hitCool: 0, off: 0, lat: (col - 0.5) * 0.5 + (Math.random() - 0.5) * 0.3, skill: 0.9 };
  }
  function stepBike(b, inp, t) {
    const d = TK.d;
    if (b.fin) { b.v *= 0.96; b.x += Math.cos(b.a) * b.v; b.y += Math.sin(b.a) * b.v; return; }
    const q = distTo(TK.pts, b.x, b.y, b.s), off = q.d > d.w / 2;
    // vòng đua: phải qua nửa đường rồi mới tính lượt
    const prevS = b.s; b.s = q.s;
    if (Math.abs(b.s - NPT / 2) < 3) b.half = true;
    if (prevS > NPT - 4 && b.s < 4 && b.half) { b.lap++; b.half = false; }
    else if (prevS < 4 && b.s > NPT - 4 && b.lap > 0 && !b.half) b.lap--; // chạy lùi qua vạch
    // chưa qua vạch xuất phát lần nào (đứng sau vạch) thì tiến độ là số âm, không phải gần hết vòng
    b.prog = b.lap * NPT + (b.lap === 0 && !b.half && b.s > NPT / 2 ? b.s - NPT : b.s);
    b.off = off ? 1 : 0;
    const boosting = b.boost > 0, vmax = (off ? 4.2 : 9.6) * (boosting ? 1.45 : 1) * (b.skill || 1) * (b.slip && !off ? 1.07 : 1); // hít gió: bám đuôi xe phía trước (<110px, thẳng hướng) được +7% tốc độ tối đa
    if (inp.n && b.nitro > 0 && !boosting) { b.nitro--; b.boost = 100; if (!b.bot) sfx('whoosh'); }
    if (inp.u) b.v += boosting ? 0.32 : 0.2; else if (inp.d) b.v -= b.v > 0 ? 0.32 : 0.08; else b.v *= 0.99;
    b.v = Math.max(-2.2, Math.min(vmax, b.v)); if (b.v > vmax) b.v = vmax;
    b.v *= off ? 0.955 : 0.997;
    const steer = (inp.r ? 1 : 0) - (inp.l ? 1 : 0) + (inp.jx || 0);
    b.a += Math.max(-1, Math.min(1, steer)) * 0.052 * Math.min(1, Math.abs(b.v) / 3) * Math.sign(b.v || 1);
    if (b.spin > 0) { b.spin--; b.a += 0.22; b.v *= 0.97; }
    b.x += Math.cos(b.a) * b.v; b.y += Math.sin(b.a) * b.v;
    if (b.boost > 0) b.boost--; if (b.hitCool > 0) b.hitCool--;
    // vật phẩm
    if (b.hitCool <= 0) for (const it of TK.items) {
      if (Math.hypot(it.x - b.x, it.y - b.y) > 26) continue;
      if (it.k === 'boost') { b.boost = 80; b.nitro = Math.min(2, b.nitro + (Math.random() < 0.35 ? 1 : 0)); if (!b.bot) sfx('whoosh'); }
      else if (it.k === 'hole') { b.v *= 0.45; if (!b.bot) sfx('bad'); }
      else { b.spin = 26; if (!b.bot) sfx('bad'); }
      b.hitCool = 40; break;
    }
  }
  // hít gió: đánh dấu xe nào đang bám đuôi xe khác
  function slipstream(list) {
    list.forEach((b) => {
      b.slip = 0; if (b.fin) return;
      for (const o of list) { if (o === b || o.fin || o.v < 5) continue; const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy); if (d < 26 || d > 110) continue; if ((dx * Math.cos(b.a) + dy * Math.sin(b.a)) / d > 0.93) { b.slip = 1; break; } }
    });
  }
  // 3 tính cách bot: liều (phanh muộn, hay dùng nitro, hơi nhanh hơn), thận trọng (phanh sớm, ít nitro), cân bằng
  const BOT_STYLE = { aggr: { brake: 0.9, nitro: 2.5, sk: 1.02 }, safe: { brake: 0.55, nitro: 0.5, sk: 0.99 }, bal: { brake: 0.7, nitro: 1, sk: 1 } };
  function botInput(b, lvl) {
    const tgtI = Math.floor(b.s + 3 + b.v * 0.25) % NPT, nx = (tgtI + 1) % NPT, p = TK.pts[tgtI], pn = TK.pts[nx];
    const ang = Math.atan2(pn[1] - p[1], pn[0] - p[0]), off = b.lat * TK.d.w * 0.6;
    const tx = p[0] - Math.sin(ang) * off, ty = p[1] + Math.cos(ang) * off;
    let da = Math.atan2(ty - b.y, tx - b.x) - b.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const sty = BOT_STYLE[b.style] || BOT_STYLE.bal;
    return { u: !(Math.abs(da) > sty.brake && b.v > 6), d: Math.abs(da) > 1.1 && b.v > 5, jx: Math.max(-1, Math.min(1, da * 2.2)), n: b.nitro > 0 && Math.abs(da) < 0.12 && Math.random() < 0.02 * (lvl + 1) * sty.nitro };
  }
  function collideBikes(list, onlyMe) {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); if (d >= 24 || d === 0) continue;
      const nx = dx / d, ny = dy / d, pen = (24 - d) / 2;
      if (!onlyMe || a === onlyMe) { a.x -= nx * pen; a.y -= ny * pen; a.v *= 0.97; }
      if (!onlyMe || b === onlyMe) { b.x += nx * pen; b.y += ny * pen; b.v *= 0.97; }
    }
  }
  // ---------------------------------------------------------------- vẽ
  function drawBike(c, b, me) {
    c.save(); c.translate(b.x, b.y); c.rotate(b.a);
    if (b.boost > 0) { c.fillStyle = 'rgba(255,170,40,.7)'; c.beginPath(); c.moveTo(-14, -4); c.lineTo(-30 - Math.random() * 10, 0); c.lineTo(-14, 4); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-13, -5, 28, 12);
    c.fillStyle = '#222'; c.fillRect(-15, -3, 6, 6); c.fillRect(10, -3, 6, 6);
    c.fillStyle = b.color; c.fillRect(-10, -6, 22, 12);
    c.fillStyle = '#ffd9b0'; c.beginPath(); c.arc(-1, 0, 5, 0, 7); c.fill();
    c.fillStyle = b.color; c.beginPath(); c.arc(-1, 0, 5.5, Math.PI * 0.5, Math.PI * 1.5); c.fill();
    c.restore();
    c.fillStyle = me ? '#ffd23f' : 'rgba(255,255,255,.95)'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText((me ? '★ ' : '') + b.name, b.x, b.y - 22);
  }
  function drawWorld(c, W, H, bikes, me, t) {
    const d = TK.d, cam = bikes[me] || bikes[0];
    c.fillStyle = d.bg; c.fillRect(0, 0, W, H);
    c.save(); c.translate(W / 2 - cam.x, H / 2 - cam.y);
    if (d.sea) { c.fillStyle = '#3fa9d6'; c.fillRect(-4000, d.ry + 380, 8000, 3000); c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 20; k++) c.fillRect(-3000 + k * 320 + Math.sin(t + k) * 20, d.ry + 400 + (k % 3) * 30, 90, 4); }
    TK.deco.forEach(([e, x, y, s]) => { if (Math.abs(x - cam.x) < W && Math.abs(y - cam.y) < H) { c.font = s + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y); } });
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = d.edge; c.lineWidth = d.w + 14; c.stroke(TK.path);
    c.strokeStyle = d.road; c.lineWidth = d.w; c.stroke(TK.path);
    c.setLineDash([26, 22]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.stroke(TK.path); c.setLineDash([]);
    // vạch xuất phát
    const [sx, sy] = TK.start, a = TK.startAng; c.save(); c.translate(sx, sy); c.rotate(a + Math.PI / 2);
    for (let k = -6; k < 6; k++) for (let r = 0; r < 2; r++) { c.fillStyle = (k + r) % 2 ? '#fff' : '#111'; c.fillRect(k * d.w / 12, r * 10 - 10, d.w / 12, 10); }
    c.restore();
    TK.items.forEach((it) => { c.save(); c.translate(it.x, it.y); if (it.k === 'boost') { c.rotate(it.ang); c.fillStyle = 'rgba(255,200,40,.9)'; for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(-12 + k * 12, -12); c.lineTo(2 + k * 12, 0); c.lineTo(-12 + k * 12, 12); c.lineTo(-6 + k * 12, 0); c.fill(); } } else if (it.k === 'hole') { c.fillStyle = '#2b2b2b'; c.beginPath(); c.ellipse(0, 0, 16, 11, 0.3, 0, 7); c.fill(); c.strokeStyle = '#777'; c.lineWidth = 2; c.stroke(); } else { c.fillStyle = 'rgba(20,20,30,.85)'; c.beginPath(); c.ellipse(0, 0, 20, 13, 0.8, 0, 7); c.fill(); c.fillStyle = 'rgba(120,80,255,.35)'; c.beginPath(); c.ellipse(-4, -3, 8, 4, 0.8, 0, 7); c.fill(); } c.restore(); });
    bikes.forEach((b, i) => { if (i !== me) drawBike(c, b, false); });
    if (bikes[me]) drawBike(c, bikes[me], true);
    c.restore();
    // bản đồ nhỏ
    const mw = 170, mh = 120, sc = Math.min(mw / (d.rx * 2.6), mh / (d.ry * 2.6));
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(W - mw - 10, 10, mw, mh);
    c.save(); c.translate(W - mw / 2 - 10, 10 + mh / 2); c.scale(sc, sc); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6 / sc * 0.5; c.stroke(TK.path);
    bikes.forEach((b, i) => { c.fillStyle = i === me ? '#ffd23f' : b.color; c.beginPath(); c.arc(b.x, b.y, (i === me ? 5 : 3.5) / sc, 0, 7); c.fill(); });
    c.restore();
  }
  // ---------------------------------------------------------------- khung giao diện
  let root = null, raf = 0, keys = {}, onEnd = null, stopFn = null, tickStop = null, touch = { l: 0, r: 0, u: 0, d: 0, n: 0 };
  function ticker(hz, fn) {
    stopTicker(); let w = null, id = 0;
    try { const url = URL.createObjectURL(new Blob(['let t=0;onmessage=(e)=>{clearInterval(t);if(e.data>0)t=setInterval(()=>postMessage(0),e.data)}'], { type: 'text/javascript' })); w = new Worker(url); URL.revokeObjectURL(url); w.onmessage = fn; w.postMessage(1000 / hz); }
    catch (e) { id = setInterval(fn, 1000 / hz); }
    tickStop = () => { if (w) w.terminate(); clearInterval(id); };
  }
  function stopTicker() { if (tickStop) { tickStop(); tickStop = null; } }
  function open(html) {
    close(true);
    root = document.createElement('div'); root.className = 'hax race'; root.innerHTML = '<div class="hax-box">' + html + '</div>';
    document.body.appendChild(root); root.addEventListener('keydown', (e) => e.stopPropagation()); return root;
  }
  function close(silent) {
    cancelAnimationFrame(raf); raf = 0; stopTicker();
    window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true);
    if (stopFn) { try { stopFn(); } catch (e) { /* */ } stopFn = null; }
    if (root) { root.remove(); root = null; }
    if (!silent && onEnd) { const f = onEnd; onEnd = null; f(null); }
  }
  const KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'];
  function onKey(e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const k = (e.key || '').toLowerCase(); if (!KEYS.includes(k)) return;
    e.preventDefault(); e.stopPropagation(); keys[k] = e.type === 'keydown';
  }
  const myInput = () => ({ u: keys.w || keys.arrowup || touch.u, d: keys.s || keys.arrowdown || touch.d, l: keys.a || keys.arrowleft || touch.l, r: keys.d || keys.arrowright || touch.r, n: keys[' '] || keys.shift || touch.n });
  function raceHtml(title) {
    return '<div class="hax-top"><span class="race-pill" id="rcPos">–/–</span><span class="hax-mid"><b id="rcLap">Vòng 1/3</b><small id="rcInfo">' + esc(title) + '</small></span><span class="race-pill" id="rcSpd">0 km/h</span></div>' +
      '<div class="hax-field"><canvas id="rcCv" width="960" height="560"></canvas>' + (coarse() ? '<div class="race-touch"><button type="button" data-t="l">◀</button><button type="button" data-t="r">▶</button><span></span><button type="button" data-t="n">⚡</button><button type="button" data-t="d">⏬</button><button type="button" data-t="u">⏫ GA</button></div>' : '') + '</div>' +
      '<div class="hax-foot"><small>' + (coarse() ? 'Giữ GA để chạy, ◀ ▶ để lái, ⚡ nitro.' : '↑/W ga · ↓/S phanh · ←→/AD lái · Space nitro (ăn ô ⚡ để có) · tránh 🕳️ ổ gà và vũng dầu') + '</small><button type="button" class="btn btn-ghost btn-sm" id="rcQuit">✖ Thoát</button></div>';
  }
  function bindControls() {
    keys = {}; touch = { l: 0, r: 0, u: 0, d: 0, n: 0 };
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true);
    root.querySelectorAll('[data-t]').forEach((b) => { const k = b.dataset.t; b.addEventListener('touchstart', (e) => { touch[k] = 1; e.preventDefault(); }, { passive: false }); b.addEventListener('touchend', () => (touch[k] = 0)); });
  }
  function hud(bikes, me, laps, t0) {
    const b = bikes[me]; if (!b) return;
    const order = rankOf(bikes), pos = order.indexOf(b) + 1;
    const e1 = document.getElementById('rcPos'); if (!e1) return;
    e1.textContent = (b.fin ? '🏁 ' : '') + pos + '/' + bikes.length;
    document.getElementById('rcLap').textContent = b.fin ? 'Về đích!' : 'Vòng ' + Math.min(laps, Math.max(1, b.lap + 1)) + '/' + laps + ' · ' + fmtT((performance.now() - t0) / 1000) + (b.nitro ? ' · ⚡×' + b.nitro : '');
    document.getElementById('rcSpd').textContent = Math.round(Math.abs(b.v) * 12) + ' km/h';
  }
  const fmtT = (s) => Math.floor(s / 60) + ':' + (s % 60).toFixed(1).padStart(4, '0');
  const rankOf = (bikes) => bikes.slice().sort((a, b) => (a.fin && b.fin ? a.fin - b.fin : a.fin ? -1 : b.fin ? 1 : b.prog - a.prog));
  function results(list, me, onAgain, againLabel) {
    const box = root && root.querySelector('.hax-field'); if (!box) return;
    const ov = document.createElement('div'); ov.className = 'hax-over race-res';
    ov.innerHTML = '<b>🏁 Kết quả</b><ol>' + list.map((r) => '<li class="' + (r.i === me ? 'me' : '') + '"><span>' + esc(r.name) + '</span><em>' + (r.f ? fmtT(r.f) : 'chưa về') + '</em></li>').join('') + '</ol><div class="btnrow">' + (againLabel === null ? '<small>⏳ Chờ chủ phòng…</small>' : '<button type="button" class="btn btn-primary" id="rcAgain">' + (againLabel || '↻ Đua lại') + '</button>') + '<button type="button" class="btn btn-ghost" id="rcMenu">Menu</button></div>';
    box.appendChild(ov);
    const ag = document.getElementById('rcAgain'); if (ag) ag.onclick = onAgain; document.getElementById('rcMenu').onclick = () => menu();
  }
  // ---------------------------------------------------------------- đua trên máy này (với máy · chủ phòng online · trong đời)
  function runRace(o) {
    buildTrack(o.track);
    const bikes = o.roster.map((r, i) => newBike(i, r.name, r.bot));
    let bn = 0; bikes.forEach((b) => { if (b.bot) { b.style = ['aggr', 'safe', 'bal'][bn++ % 3]; b.skill = [0.86, 0.93, 1.0][o.lvl ?? 1] * (0.96 + Math.random() * 0.06) * BOT_STYLE[b.style].sk; } });
    open(raceHtml(o.title)); bindControls();
    const cv = document.getElementById('rcCv'), c = cv.getContext('2d');
    document.getElementById('rcQuit').onclick = () => (o.onQuit ? o.onQuit() : menu());
    const me = o.me ?? 0, laps = o.laps || 3; let t0 = performance.now() + 3000, last = performance.now(), acc = 0, firstFin = 0, over = false, sendT = 0;
    const startT = () => t0;
    const sim = () => {
      if (over) return;
      const now = performance.now(); acc += Math.min(0.25, (now - last) / 1000); last = now;
      while (acc >= 1 / 60) {
        acc -= 1 / 60;
        if (now < t0) continue;
        slipstream(bikes.filter((b, i) => !(o.remote && o.remote[i])));
        bikes.forEach((b, i) => {
          if (o.remote && o.remote[i]) { const r = o.remote[i](); if (r) Object.assign(b, r); return; } // người chơi online: vị trí do họ gửi
          stepBike(b, i === me ? myInput() : b.bot ? botInput(b, o.lvl ?? 1) : {}, now);
          if (!b.fin && b.lap >= laps) { b.fin = (now - t0) / 1000; if (!firstFin) firstFin = now; if (i === me) sfx('cheer'); }
        });
        collideBikes(bikes.filter((b, i) => !(o.remote && o.remote[i])));
      }
      sendT++; if (o.broadcast && sendT % 2 === 0) o.broadcast(bikes, now < t0 ? Math.ceil((t0 - now) / 1000) : 0, (now - t0) / 1000);
      const humansDone = bikes.every((b, i) => b.bot || b.fin || (o.gone && o.gone(i)));
      if ((humansDone && bikes[me].fin) || (firstFin && now - firstFin > 25000) || (o.endNow && o.endNow())) {
        over = true; stopTicker();
        const list = rankOf(bikes).map((b) => ({ i: b.i, name: b.name, f: b.fin }));
        if (o.onFinish) o.onFinish(list);
        if (o.career) { const pos = list.findIndex((r) => r.i === me) + 1; const f = onEnd; onEnd = null; close(true); f && f({ score: Math.max(0, Math.min(1, 1 - (pos - 1) / (bikes.length - 1))), text: 'Bạn về thứ ' + pos + '/' + bikes.length + (bikes[me].fin ? ' sau ' + fmtT(bikes[me].fin) : '') + '.' }); return; }
        cancelAnimationFrame(raf); draw(performance.now()); results(list, me, o.again, o.againLabel);
      }
    };
    const draw = (now) => {
      drawWorld(c, cv.width, cv.height, bikes, me, now / 1000); hud(bikes, me, laps, startT());
      if (now < t0) { const n = Math.ceil((t0 - now) / 1000); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, cv.width, cv.height); c.fillStyle = '#ffd23f'; c.font = '900 110px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), cv.width / 2, cv.height / 2); }
      else if (now - t0 < 700) { c.fillStyle = '#39cf98'; c.font = '900 90px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ĐI!', cv.width / 2, cv.height / 2); }
    };
    ticker(60, sim);
    const loop = (now) => { if (over || !root) return; draw(now); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); sfx('notify');
    return { bikes, setT0: (v) => (t0 = v) };
  }
  // ---------------------------------------------------------------- chế độ
  const CFG_KEY = 'kn_race_cfg';
  const cfg = Object.assign({ track: 'pho', laps: 3, lvl: 1, bots: true }, (() => { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch (e) { return {}; } })());
  const saveCfg = () => { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* */ } };
  const BOT_NAMES = ['Tuấn Bốc Đầu', 'Hùng Xe Ôm', 'Lan Vespa', 'Shipper Tốc Độ', 'Bà Tám Wave', 'Quân Exciter', 'Minh Cub 81'];
  function playAI() {
    const roster = [{ name: myName() }].concat(BOT_NAMES.slice().sort(() => Math.random() - 0.5).slice(0, 5).map((n) => ({ name: n, bot: true })));
    const t = TRACKS[cfg.track];
    runRace({ track: cfg.track, laps: cfg.laps, lvl: cfg.lvl, roster, me: 0, title: t.icon + ' ' + t.name + ' · ' + cfg.laps + ' vòng · máy ' + ['dễ', 'thường', 'khó'][cfg.lvl], again: playAI });
  }
  // dùng trong cuộc đời: một chặng đua 1 vòng với 3 tay đua → điểm theo thứ hạng
  function playCareer(opts) {
    opts = opts || {};
    return new Promise((res) => {
      onEnd = res;
      const lvl = opts.need > 0.6 ? 2 : opts.need > 0.35 ? 1 : 0, ids = Object.keys(TRACKS), track = opts.track || ids[Math.floor(Math.random() * ids.length)];
      runRace({ track, laps: 1, lvl, roster: [{ name: myName() }].concat(BOT_NAMES.slice(0, 3).map((n) => ({ name: n, bot: true }))), me: 0, title: opts.title || 'Đua xe', career: true, onQuit: () => { const f = onEnd; onEnd = null; close(true); f && f({ score: 0, text: 'Bạn bỏ cuộc giữa chừng.' }); } });
    });
  }
  // ---------------------------------------------------------------- ONLINE
  const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }] };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function iceDone(pc) { return new Promise((res) => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 3500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); }); }
  async function api(url, body) { const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error({ notfound: 'Không tìm thấy phòng (mã sai hoặc đã hết hạn)', full: 'Phòng đang đông người chờ vào, thử lại sau', 'slow-down': 'Thao tác nhanh quá, thử lại sau', 'not-configured': 'Máy chủ chưa sẵn sàng' }[j.error] || 'Lỗi mạng'); return j; }
  const sendTo = (dc, o) => { try { if (dc && dc.readyState === 'open') dc.send(typeof o === 'string' ? o : JSON.stringify(o)); } catch (e) { /* */ } };
  function lobby(html) {
    const inner = '<div class="hax-lobby">' + html + '</div>';
    if (root && !root.querySelector('#rcCv')) root.querySelector('.hax-box').innerHTML = inner; else { const keep = stopFn; stopFn = null; open(inner); stopFn = keep; }
    cancelAnimationFrame(raf); raf = 0; stopTicker();
  }
  const setMsg = (t) => { const el = document.getElementById('rcMsg'); if (el) el.textContent = t; };
  const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100;
  async function host() {
    const H0 = { code: null, peers: [], alive: true, playing: false };
    stopFn = () => { H0.alive = false; H0.peers.forEach((p) => { try { p.pc.close(); } catch (e) { /* */ } }); };
    lobby('<h3>🏍️ Tạo phòng đua online</h3><p class="sub">⏳ Đang tạo phòng…</p><p class="p-sub" id="rcMsg"></p><div class="btnrow"><button type="button" class="btn btn-ghost" id="rcBack">← Menu</button></div>');
    document.getElementById('rcBack').onclick = () => menu();
    try { H0.code = (await api('/api/hax', { op: 'create' })).code; } catch (e) { setMsg('⚠️ ' + e.message); return; }
    const humans = () => [{ id: 'host', name: myName() }].concat(H0.peers.filter((p) => p.open).map((p) => ({ id: p.id, name: p.name })));
    const lobbyMsg = (you) => ({ t: 'lobby', code: H0.code, track: cfg.track, laps: cfg.laps, bots: cfg.bots, players: humans(), you });
    const sendLobby = () => H0.peers.forEach((p) => sendTo(p.dc, lobbyMsg(p.id)));
    const draw = () => {
      if (!H0.alive || H0.playing) return;
      const h = humans();
      lobby('<h3>🏍️ Phòng đua online</h3><p class="sub">Gửi mã cho bạn bè, họ bấm <b>Vào phòng</b> trong menu Đua xe (tối đa 8 người):</p><div class="hax-code">' + H0.code + '</div>' +
        '<div class="race-list">' + h.map((x, i) => '<span style="border-color:' + COLORS[i] + '">🏍️ ' + esc(x.name) + (x.id === 'host' ? ' (chủ phòng)' : '') + '</span>').join('') + '</div>' + settingsHtml() +
        '<label class="hax-chk"><input type="checkbox" id="rcBots"' + (cfg.bots ? ' checked' : '') + '> 🤖 Thêm tay đua máy cho đủ 6 xe</label>' +
        '<p class="p-sub" id="rcMsg">' + (h.length < 2 ? '⏳ Đang chờ bạn bè vào…' : '✅ ' + h.length + ' người trong phòng') + '</p>' +
        '<div class="btnrow"><button type="button" class="btn btn-primary" id="rcStart">▶ Bắt đầu đua</button><button type="button" class="btn btn-ghost" id="rcBack">← Rời phòng</button></div>');
      bindSettings(() => { draw(); sendLobby(); });
      document.getElementById('rcBots').onchange = (e) => { cfg.bots = e.target.checked; saveCfg(); sendLobby(); };
      document.getElementById('rcBack').onclick = () => menu();
      document.getElementById('rcStart').onclick = start;
    };
    const drop = (peer) => { if (!H0.peers.includes(peer)) return; H0.peers = H0.peers.filter((p) => p !== peer); peer.gone = true; try { peer.pc.close(); } catch (e) { /* */ } if (!H0.playing) { draw(); sendLobby(); } };
    async function accept(req) {
      if (H0.peers.length >= 7) return;
      const pc = new RTCPeerConnection(ICE), peer = { id: req.id, pc, dc: null, name: '…', open: false, seen: performance.now(), st: null };
      pc.ondatachannel = (ev) => {
        peer.dc = ev.channel;
        peer.dc.onmessage = (x) => { peer.seen = performance.now(); let d; try { d = JSON.parse(x.data); } catch (e) { return; } if (d.t === 'hello') { const nm = String(d.name || 'Bạn').slice(0, 14); if (nm !== peer.name) { peer.name = nm; if (!H0.playing) { draw(); sendLobby(); } } } else if (d.t === 'st') peer.st = d; };
        peer.dc.onclose = () => drop(peer);
        const ready = () => { if (!H0.alive) return; peer.open = true; H0.peers.push(peer); sfx('notify'); if (H0.playing) sendTo(peer.dc, { t: 'wait' }); else { draw(); sendLobby(); } };
        if (peer.dc.readyState === 'open') ready(); else peer.dc.onopen = ready;
      };
      try { await pc.setRemoteDescription(req.offer); await pc.setLocalDescription(await pc.createAnswer()); await iceDone(pc); await api('/api/hax', { op: 'answer', code: H0.code, id: req.id, answer: pc.localDescription }); } catch (e) { try { pc.close(); } catch (x) { /* */ } }
    }
    (async () => { while (H0.alive) { try { const j = await api('/api/hax?code=' + H0.code + '&get=queue&t=' + Date.now()); (j.reqs || []).forEach(accept); } catch (e) { /* */ } H0.peers.forEach((p) => { if (performance.now() - p.seen > 9000) drop(p); }); await wait(1500); } })();
    const ping = setInterval(() => { if (!H0.alive) return clearInterval(ping); H0.peers.forEach((p) => sendTo(p.dc, { t: 'hello', name: myName() })); }, 1000);
    const prev = stopFn; stopFn = () => { clearInterval(ping); prev(); };
    function start() {
      const h = humans(), owners = h.map((x) => (x.id === 'host' ? 'host' : H0.peers.find((p) => p.id === x.id)));
      const roster = h.map((x) => ({ name: x.name }));
      if (cfg.bots) BOT_NAMES.slice(0, Math.max(0, 6 - roster.length)).forEach((n) => { roster.push({ name: n, bot: true }); owners.push('bot'); });
      H0.playing = true;
      owners.forEach((o, i) => { if (o && o.dc) { o.st = null; sendTo(o.dc, { t: 'start', track: cfg.track, laps: cfg.laps, roster, me: i }); } });
      const t = TRACKS[cfg.track], remote = {};
      owners.forEach((o, i) => { if (o && o.dc) remote[i] = () => (o.st ? { x: o.st.x, y: o.st.y, a: o.st.a, v: o.st.v, prog: o.st.p, lap: o.st.l, fin: o.st.f, boost: o.st.b ? 1 : 0 } : null); });
      const keep = stopFn; stopFn = null;
      runRace({ track: cfg.track, laps: cfg.laps, lvl: cfg.lvl, roster, me: 0, title: '🌐 Online · ' + t.icon + ' ' + t.name + ' · ' + roster.length + ' xe', remote, gone: (i) => owners[i] && owners[i].gone,
        broadcast: (bikes, cd, tm) => { const s = JSON.stringify({ t: 's', cd, b: bikes.map((b) => [r1(b.x), r1(b.y), r2(b.a), r2(b.v), r1(b.prog), b.fin ? r1(b.fin) : 0, b.boost > 0 ? 1 : 0, b.lap]) }); H0.peers.forEach((p) => sendTo(p.dc, s)); },
        onFinish: (list) => H0.peers.forEach((p) => sendTo(p.dc, { t: 'end', list })),
        againLabel: '↩ Về phòng chờ', again: () => { H0.playing = false; draw(); sendLobby(); }, onQuit: () => menu() });
      stopFn = keep;
    }
    draw();
  }
  async function join(code) {
    code = String(code || '').trim().toUpperCase();
    let alive = true, pc = null;
    stopFn = () => { alive = false; try { pc && pc.close(); } catch (e) { /* */ } };
    lobby('<h3>🏍️ Vào phòng ' + esc(code) + '</h3><p class="sub">⏳ Đang kết nối…</p><p class="p-sub" id="rcMsg"></p><div class="btnrow"><button type="button" class="btn btn-ghost" id="rcBack">← Menu</button></div>');
    document.getElementById('rcBack').onclick = () => menu();
    try {
      pc = new RTCPeerConnection(ICE); const dc = pc.createDataChannel('race');
      await pc.setLocalDescription(await pc.createOffer()); await iceDone(pc);
      const { id } = await api('/api/hax', { op: 'join', code, offer: pc.localDescription });
      setMsg('🤝 Chờ chủ phòng nhận…');
      let ans = null; for (let i = 0; i < 40 && alive && !ans; i++) { await wait(1200); ans = (await api('/api/hax?code=' + code + '&get=answer&id=' + id + '&t=' + Date.now()).catch(() => ({}))).answer; }
      if (!alive) return; if (!ans) throw new Error('Chủ phòng không phản hồi. Kiểm tra lại mã phòng.');
      await pc.setRemoteDescription(ans);
      await new Promise((res, rej) => { if (dc.readyState === 'open') return res(); const t = setTimeout(() => rej(new Error('Không kết nối được — thử 4G hoặc Wi-Fi khác.')), 20000); dc.addEventListener('open', () => { clearTimeout(t); res(); }); });
      if (alive) guest(pc, dc);
    } catch (e) { if (alive) setMsg('⚠️ ' + e.message); }
  }
  function guest(pc, dc) {
    let seen = performance.now(), game = null;
    const send = (o) => sendTo(dc, o);
    send({ t: 'hello', name: myName() });
    const ping = setInterval(() => send({ t: 'hello', name: myName() }), 1000);
    const lost = setInterval(() => { if (performance.now() - seen > 8000) { clearInterval(lost); lobby('<h3>📡 Mất kết nối</h3><p class="sub">Chủ phòng đã thoát hoặc mạng chập chờn.</p><div class="btnrow"><button type="button" class="btn btn-primary" id="rcBack">Menu</button></div>'); document.getElementById('rcBack').onclick = () => menu(); } }, 1000);
    stopFn = () => { clearInterval(ping); clearInterval(lost); try { dc.close(); pc.close(); } catch (e) { /* */ } };
    const showLobby = (d) => {
      game = null; const t = TRACKS[d.track] || TRACKS.pho;
      lobby('<h3>🏍️ Phòng ' + esc(d.code) + '</h3><p class="sub">Đã vào phòng! Chờ chủ phòng bấm <b>Bắt đầu</b>…</p><div class="race-list">' + d.players.map((x, i) => '<span style="border-color:' + COLORS[i] + '">🏍️ ' + esc(x.name) + (x.id === d.you ? ' (bạn)' : x.id === 'host' ? ' (chủ phòng)' : '') + '</span>').join('') + '</div><p class="p-sub">Đường đua: ' + t.icon + ' ' + t.name + ' · ' + d.laps + ' vòng</p><div class="btnrow"><button type="button" class="btn btn-ghost" id="rcBack">← Rời phòng</button></div>');
      document.getElementById('rcBack').onclick = () => menu();
    };
    const startGame = (d) => {
      const others = {}; let snap = null;
      d.roster.forEach((r, i) => { if (i !== d.me) others[i] = () => { if (!snap || !snap.b[i]) return null; const s = snap.b[i], b = game.bikes[i]; return { x: b.x + (s[0] - b.x) * 0.35, y: b.y + (s[1] - b.y) * 0.35, a: s[2], v: s[3], prog: s[4], fin: s[5], boost: s[6] ? 1 : 0, lap: s[7] }; }; });
      const keep = stopFn; stopFn = null;
      game = runRace({ track: d.track, laps: d.laps, roster: d.roster, me: d.me, title: '🌐 Online · ' + d.roster.length + ' xe', remote: others, endNow: () => game && game.ended, againLabel: null, onQuit: () => menu() });
      stopFn = keep;
      game.meIdx = d.me;
      game.onSnap = (s) => { snap = s; if (s.cd) game.setT0(performance.now() + s.cd * 1000 - 500); };
      // gửi vị trí xe của mình 30 lần/giây
      const me = game.bikes[d.me];
      game.sendIv = setInterval(() => send({ t: 'st', x: r1(me.x), y: r1(me.y), a: r2(me.a), v: r2(me.v), p: r1(me.prog), l: me.lap, f: me.fin ? r1(me.fin) : 0, b: me.boost > 0 ? 1 : 0 }), 33);
      const prev = stopFn; stopFn = () => { clearInterval(game && game.sendIv); prev && prev(); };
    };
    dc.onmessage = (e) => {
      seen = performance.now(); let d; try { d = JSON.parse(e.data); } catch (x) { return; }
      if (d.t === 'lobby') { if (game) clearInterval(game.sendIv); showLobby(d); }
      else if (d.t === 'start') startGame(d);
      else if (d.t === 's' && game && game.onSnap) game.onSnap(d);
      else if (d.t === 'end' && game) { game.ended = true; clearInterval(game.sendIv); const g = game; setTimeout(() => { const box = root && root.querySelector('.hax-field'); if (!box) return; const old = box.querySelector('.race-res'); if (old) old.remove(); results(d.list, g.meIdx, null, null); }, 300); }
      else if (d.t === 'wait') lobby('<h3>🏍️ Đã vào phòng</h3><p class="sub">⏳ Cuộc đua đang diễn ra, bạn sẽ vào ở lượt sau…</p>');
    };
    lobby('<h3>🏍️ Đã vào phòng</h3><p class="sub">⏳ Đang nhận thông tin phòng…</p>');
  }
  // ---------------------------------------------------------------- cài đặt + menu
  function settingsHtml() {
    const chips = (key, list) => list.map(([v, l]) => '<button type="button" data-set="' + key + '" data-v="' + v + '" class="' + (cfg[key] === v ? 'on' : '') + '">' + l + '</button>').join('');
    return '<div class="hax-set"><span>Đường đua</span><div>' + chips('track', Object.keys(TRACKS).map((k) => [k, TRACKS[k].icon + ' ' + TRACKS[k].name])) + '</div><span>Số vòng</span><div>' + chips('laps', [[1, '1 vòng'], [2, '2 vòng'], [3, '3 vòng'], [5, '5 vòng']]) + '</div><span>Máy</span><div>' + chips('lvl', [[0, 'Dễ'], [1, 'Thường'], [2, 'Khó']]) + '</div></div><p class="p-sub hax-mapdesc">' + esc(TRACKS[cfg.track].desc) + '</p>';
  }
  function bindSettings(redraw) { root.querySelectorAll('[data-set]').forEach((b) => (b.onclick = () => { const k = b.dataset.set; cfg[k] = k === 'track' ? b.dataset.v : +b.dataset.v; saveCfg(); sfx('click'); redraw(); })); }
  function menu() {
    open('<div class="hax-lobby"><h3>🏍️ Đua xe máy</h3><p class="sub">Đua nhìn từ trên xuống qua phố cổ, đường biển, đèo núi. Ăn ô ⚡ để tăng tốc và có nitro, tránh 🕳️ ổ gà và vũng dầu. Đua với máy hoặc online với bạn bè.</p>' + settingsHtml() +
      '<div class="hax-menu"><button type="button" class="btn btn-primary" id="rcAI">🤖 Đua với máy</button><button type="button" class="btn btn-primary" id="rcHost">🌐 Tạo phòng đua online (tối đa 8 người)</button>' +
      '<div class="ol-join"><input id="rcCode" maxlength="5" placeholder="Mã phòng (5 ký tự)" autocomplete="off" style="text-transform:uppercase"><button type="button" class="btn btn-soft" id="rcJoin">Vào phòng</button></div></div>' +
      '<p class="p-sub">Tên hiển thị dùng chung với Bóng đá Hax. Mỗi người chơi trên một máy riêng.</p><div class="btnrow"><button type="button" class="btn btn-ghost" id="rcClose">✖ Đóng</button></div></div>');
    bindSettings(menu);
    document.getElementById('rcAI').onclick = playAI; document.getElementById('rcHost').onclick = host;
    document.getElementById('rcJoin').onclick = () => { const c = document.getElementById('rcCode').value; if (c.trim().length !== 5) return document.getElementById('rcCode').focus(); join(c); };
    document.getElementById('rcCode').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('rcJoin').click(); };
    document.getElementById('rcClose').onclick = () => close();
  }
  // đăng ký minigame cho các tình huống "đua xe" trong đời
  if (KN.Mini && KN.Mini.register) KN.Mini.register('race', (p) => playCareer({ title: p.title, need: p.need }), '🏍️ Đua xe', 'Một vòng đua với 3 tay đua khác. ↑/W ga · ↓/S phanh · ←→/AD lái · Space nitro. Bám đuôi xe trước để “hít gió” (+7% tốc độ). Các tay đua có tính cách: liều, thận trọng, cân bằng. Về nhất 100%, về nhì 67%…');
  KN.Race = { open: menu, close, playCareer, TRACKS, _sim: { buildTrack, newBike, stepBike, botInput } };
})();
