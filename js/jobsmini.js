/* Một Kiếp Người — minigame nghề nghiệp & giải trí (đăng ký vào KN.Mini):
   🚕 'ride'      tài xế công nghệ: chạy trên lưới phố, đón khách → trả khách, tránh xe khác, giữ sao đánh giá
   🔪 'surgery'   bác sĩ phẫu thuật: kéo dao mổ theo đường kẻ rồi khâu đúng nhịp, nhịp tim bệnh nhân tụt dần
   🕵️ 'detective' cảnh sát phá án: chọn cách điều tra (có hạn), loại trừ nghi phạm, chỉ đúng thủ phạm
   🎣 'fishing'   câu cá: canh lực quăng, giật cần đúng lúc, kéo dây không để đứt (điểm = cỡ cá / 5)
   🦈 'pitch'     gọi vốn Shark Tank: trả lời câu hỏi của các "cá mập" rồi thương lượng
   Mỗi trò trả về Promise<{ score 0..1, text }>. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let root = null, keyH = null, timers = [];
  function open(title, body, keys) {
    close();
    root = document.createElement('div'); root.className = 'mini';
    root.innerHTML = '<div class="mini-box jm-box"><div class="mini-head"><b>' + title + '</b><small class="mini-hud" id="jmHud"></small></div>' + body + (keys ? '<p class="mini-keys">⌨️ ' + keys + '</p>' : '') + '</div>';
    document.body.appendChild(root);
    if (KN.Mini && KN.Mini.playing && KN.Mini.playing()) { const qb = document.createElement('button'); qb.type = 'button'; qb.className = 'mini-quit'; qb.textContent = '✖ Thoát'; qb.title = 'Bỏ dở minigame, để số phận quyết định'; qb.onclick = (e) => { e.preventDefault(); e.stopPropagation(); KN.Mini.abort(); }; root.querySelector('.mini-box').appendChild(qb); }
    return root;
  }
  function close() {
    timers.forEach((t) => { clearInterval(t); clearTimeout(t); cancelAnimationFrame(t); }); timers = [];
    if (keyH) { window.removeEventListener('keydown', keyH, true); window.removeEventListener('keyup', keyH, true); keyH = null; }
    if (root) { root.remove(); root = null; }
  }
  function onKeys(fn) { keyH = (e) => { if (fn(e) !== false) { e.preventDefault(); e.stopPropagation(); } }; window.addEventListener('keydown', keyH, true); window.addEventListener('keyup', keyH, true); }
  function loop(fn) { let last = performance.now(); const tick = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (root && fn(dt, now / 1000) !== false) timers.push(requestAnimationFrame(tick)); }; timers.push(requestAnimationFrame(tick)); }
  const hud = (t) => { const el = root && root.querySelector('#jmHud'); if (el) el.textContent = t; };
  const st = (p) => (p.ctx && p.ctx.stats) || { happy: 60, health: 60, smarts: 60, looks: 60 };
  const big = (c, txt, y, col, size) => { c.font = '800 ' + (size || 40) + 'px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col || '#fff'; c.fillText(txt, 320, y); };

  // ================================================================ 🚕 TÀI XẾ CÔNG NGHỆ
  function ride(p) {
    return new Promise((res) => {
      const s = st(p), G = 80, X0 = 40, Y0 = 40, NX = 8, NY = 5; // giao lộ: (X0 + i*G, Y0 + j*G)
      const box = open('🚕 Chạy xe công nghệ', '<canvas class="mini-cv" width="640" height="400"></canvas><div class="mini-pad"><button type="button" data-d="l">◀</button><button type="button" data-d="u">▲</button><button type="button" data-d="d">▼</button><button type="button" data-d="r">▶</button></div>', '<kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> hoặc WASD để chạy trên đường. Tới 🧍 đón khách rồi chở tới 🏁. Đâm xe khác là bị trừ sao!');
      const cv = box.querySelector('canvas'), c = cv.getContext('2d');
      const spd = 150 + s.health * 0.9, dur = 45;
      const ix = (i) => X0 + i * G, iy = (j) => Y0 + j * G;
      const car = { x: ix(0), y: iy(0), dir: null, want: null, hit: 0 };
      const rndNode = (avoid) => { let n; do { n = [Math.floor(Math.random() * NX), Math.floor(Math.random() * NY)]; } while (avoid && Math.abs(ix(n[0]) - avoid.x) + Math.abs(iy(n[1]) - avoid.y) < G * 3); return n; };
      let job = { phase: 'pick', at: rndNode(car), t: 0 }, rides = [], t = 0, crash = 0, flash = 0, done = false;
      const traffic = Array.from({ length: 5 }, () => { const h = Math.random() < 0.5, n = rndNode(); return { x: ix(n[0]), y: iy(n[1]), h, v: (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 50), col: pick(['#5cc8ff', '#39cf98', '#c792ff', '#ffb347']) }; });
      const keys = {};
      const setDir = (d, on) => { keys[d] = on; };
      box.querySelectorAll('[data-d]').forEach((b) => { b.onpointerdown = (e) => { e.preventDefault(); setDir(b.dataset.d, true); }; b.onpointerup = b.onpointerleave = () => setDir(b.dataset.d, false); });
      onKeys((e) => { const m = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' }[e.key.toLowerCase()]; if (!m) return false; setDir(m, e.type === 'keydown'); return true; });
      loop((dt) => {
        if (done) return false;
        t += dt; flash = Math.max(0, flash - dt);
        // chỉ được rẽ ở giao lộ: xe chạy dọc/ngang theo đường
        const want = keys.l ? 'l' : keys.r ? 'r' : keys.u ? 'u' : keys.d ? 'd' : null;
        const onCol = Math.abs((car.x - X0) % G) < 6 || Math.abs((car.x - X0) % G - G) < 6, onRow = Math.abs((car.y - Y0) % G) < 6 || Math.abs((car.y - Y0) % G - G) < 6;
        if (want) { if ((want === 'l' || want === 'r') && onRow) { car.y = Y0 + Math.round((car.y - Y0) / G) * G; car.dir = want; } else if ((want === 'u' || want === 'd') && onCol) { car.x = X0 + Math.round((car.x - X0) / G) * G; car.dir = want; } }
        else car.dir = null;
        const v = spd * dt * (car.hit > 0 ? 0.4 : 1);
        if (car.dir === 'l') car.x -= v; if (car.dir === 'r') car.x += v; if (car.dir === 'u') car.y -= v; if (car.dir === 'd') car.y += v;
        car.x = clamp(car.x, ix(0), ix(NX - 1)); car.y = clamp(car.y, iy(0), iy(NY - 1)); car.hit = Math.max(0, car.hit - dt);
        traffic.forEach((o) => { if (o.h) { o.x += o.v * dt; if (o.x < ix(0) || o.x > ix(NX - 1)) o.v *= -1; } else { o.y += o.v * dt; if (o.y < iy(0) || o.y > iy(NY - 1)) o.v *= -1; } if (car.hit <= 0 && Math.hypot(o.x - car.x, o.y - car.y) < 20) { crash++; car.hit = 1; flash = 0.4; sfx('bad'); } });
        job.t += dt;
        const tx = ix(job.at[0]), ty = iy(job.at[1]);
        if (Math.hypot(tx - car.x, ty - car.y) < 14) {
          if (job.phase === 'pick') { sfx('click'); job = { phase: 'drop', at: rndNode(car), t: 0, c0: crash }; }
          else { const stars = clamp(5 - (crash - job.c0) - (job.t > 14 ? 1 : 0) - (job.t > 22 ? 1 : 0), 1, 5); rides.push(stars); sfx(stars >= 4 ? 'good' : 'click'); job = { phase: 'pick', at: rndNode(car), t: 0 }; }
        }
        // vẽ
        c.fillStyle = '#6aa35a'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < NX - 1; i++) for (let j = 0; j < NY - 1; j++) { c.fillStyle = (i + j) % 3 ? '#c9b79a' : '#b8c7d6'; c.fillRect(ix(i) + 18, iy(j) + 18, G - 36, G - 36); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(ix(i) + 24, iy(j) + 24, 12, 12); c.fillRect(ix(i) + 44, iy(j) + 24, 12, 12); }
        c.fillStyle = '#4b4f55'; for (let i = 0; i < NX; i++) c.fillRect(ix(i) - 16, iy(0) - 16, 32, iy(NY - 1) - iy(0) + 32); for (let j = 0; j < NY; j++) c.fillRect(ix(0) - 16, iy(j) - 16, ix(NX - 1) - ix(0) + 32, 32);
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([8, 10]); c.lineWidth = 2; for (let i = 0; i < NX; i++) { c.beginPath(); c.moveTo(ix(i), iy(0)); c.lineTo(ix(i), iy(NY - 1)); c.stroke(); } for (let j = 0; j < NY; j++) { c.beginPath(); c.moveTo(ix(0), iy(j)); c.lineTo(ix(NX - 1), iy(j)); c.stroke(); } c.setLineDash([]);
        c.font = '26px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(job.phase === 'pick' ? '🧍' : '🏁', tx, ty - 4);
        c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.arc(tx, ty, 16 + Math.sin(t * 6) * 3, 0, 7); c.stroke();
        traffic.forEach((o) => { c.fillStyle = o.col; c.fillRect(o.x - (o.h ? 13 : 8), o.y - (o.h ? 8 : 13), o.h ? 26 : 16, o.h ? 16 : 26); });
        c.fillStyle = car.hit > 0 && Math.floor(t * 10) % 2 ? '#fff' : '#18b45b'; c.beginPath(); c.arc(car.x, car.y, 11, 0, 7); c.fill(); c.font = '16px sans-serif'; c.fillText(job.phase === 'drop' ? '🧑' : '🛵', car.x, car.y + 1);
        if (flash) big(c, 'Ầm! −1 sao', 60, '#ff6b6b', 30);
        const left = Math.max(0, dur - t);
        hud('⏱ ' + Math.ceil(left) + 's · ' + rides.length + ' cuốc · ⭐ ' + (rides.length ? (rides.reduce((a, b) => a + b, 0) / rides.length).toFixed(1) : '–'));
        if (left <= 0) {
          done = true; const avg = rides.length ? rides.reduce((a, b) => a + b, 0) / rides.length : 0;
          res({ score: clamp(rides.length / 4 * (avg / 5) * 1.1, 0, 1), text: 'Bạn chạy được ' + rides.length + ' cuốc, đánh giá trung bình ' + (avg ? avg.toFixed(1) : 0) + ' sao' + (crash ? ', va quẹt ' + crash + ' lần' : '') + '.' });
          return false;
        }
      });
    });
  }

  // ================================================================ 🔪 PHẪU THUẬT
  function surgery(p) {
    return new Promise((res) => {
      const s = st(p), tol = 10 + s.smarts / 10;
      const box = open('🔪 Ca phẫu thuật', '<canvas class="mini-cv" width="640" height="400" style="touch-action:none;cursor:crosshair"></canvas>', 'Bước 1: <b>giữ chuột (hoặc ngón tay)</b> từ chấm xanh và kéo dọc đường nét đứt tới chấm đỏ. Bước 2: bấm vào từng mũi khâu khi vòng tròn thu nhỏ vừa khít (hoặc <kbd>Space</kbd>).');
      const cv = box.querySelector('canvas'), c = cv.getContext('2d');
      // đường rạch: đường cong bezier
      const P0 = [140, 230 + (Math.random() - 0.5) * 60], P1 = [260, 120 + Math.random() * 60], P2 = [380, 300 - Math.random() * 60], P3 = [500, 190 + (Math.random() - 0.5) * 60];
      const pt = (u) => { const a = 1 - u; return [a * a * a * P0[0] + 3 * a * a * u * P1[0] + 3 * a * u * u * P2[0] + u * u * u * P3[0], a * a * a * P0[1] + 3 * a * a * u * P1[1] + 3 * a * u * u * P2[1] + u * u * u * P3[1]]; };
      const path = Array.from({ length: 80 }, (_, i) => pt(i / 79));
      let phase = 'cut', drawing = false, trail = [], prog = 0, err = 0, errN = 0, hr = 82, t = 0, cutAcc = 0, stitches = [], si = 0, stitchScore = 0, msg = '', msgT = 0, done = false;
      const near = (x, y) => { let best = 1e9, bi = 0; path.forEach(([px, py], i) => { const d = Math.hypot(px - x, py - y); if (d < best) { best = d; bi = i; } }); return { d: best, i: bi }; };
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 640 / r.width, (e.clientY - r.top) * 400 / r.height]; };
      cv.addEventListener('pointerdown', (e) => {
        e.preventDefault(); const [x, y] = pos(e);
        if (phase === 'cut') { if (Math.hypot(x - P0[0], y - P0[1]) < 26) { drawing = true; trail = [[x, y]]; cv.setPointerCapture(e.pointerId); } else { msg = 'Bắt đầu từ chấm xanh!'; msgT = 1; } }
        else if (phase === 'stitch') stitchTap();
      });
      cv.addEventListener('pointermove', (e) => { if (!drawing) return; const [x, y] = pos(e); trail.push([x, y]); const n = near(x, y); err += Math.min(60, n.d); errN++; prog = Math.max(prog, n.i / 79); if (n.d > tol * 2.2) { msg = 'Lệch quá! Cẩn thận!'; msgT = 0.6; hr -= 0.4; } });
      cv.addEventListener('pointerup', () => { if (!drawing) return; drawing = false; if (prog > 0.95) finishCut(); else { msg = 'Chưa rạch hết đường! Làm lại từ chấm xanh.'; msgT = 1.2; } });
      const finishCut = () => {
        const avg = errN ? err / errN : 60; cutAcc = clamp(1 - (avg - tol * 0.4) / (tol * 2.2), 0, 1);
        sfx(cutAcc > 0.6 ? 'good' : 'bad'); msg = cutAcc > 0.8 ? 'Đường rạch hoàn hảo!' : cutAcc > 0.5 ? 'Đường rạch tạm ổn' : 'Đường rạch xấu quá…'; msgT = 1.2;
        phase = 'stitch'; stitches = [0.12, 0.27, 0.42, 0.57, 0.72, 0.87].map((u) => ({ p: pt(u), r: 46, hit: null })); si = 0;
      };
      const stitchTap = () => {
        const sk = stitches[si]; if (!sk || sk.hit != null) return;
        const d = Math.abs(sk.r - 14); sk.hit = d < 4 ? 1 : d < 10 ? 0.6 : 0.15; stitchScore += sk.hit; sfx(sk.hit >= 0.6 ? 'click' : 'bad');
        msg = sk.hit === 1 ? 'Khâu chuẩn!' : sk.hit >= 0.6 ? 'Được' : 'Lệch mũi'; msgT = 0.5; si++;
        if (si >= stitches.length) end();
      };
      const end = () => { if (done) return; done = true; const sc = clamp(cutAcc * 0.55 + stitchScore / stitches.length * 0.45 - (hr < 50 ? 0.2 : 0), 0, 1); setTimeout(() => res({ score: sc, text: 'Đường rạch chính xác ' + Math.round(cutAcc * 100) + '%, khâu ' + Math.round(stitchScore / Math.max(1, stitches.length) * 100) + '%. Nhịp tim bệnh nhân cuối ca: ' + Math.round(hr) + ' lần/phút.' }), 600); };
      onKeys((e) => { if (e.type !== 'keydown' || e.key !== ' ') return false; if (phase === 'stitch') stitchTap(); return true; });
      loop((dt) => {
        if (done && msgT <= 0) return false;
        t += dt; msgT = Math.max(0, msgT - dt);
        hr = Math.max(30, hr - dt * (phase === 'cut' ? 0.9 : 0.6));
        if (hr <= 30 && !done) { cutAcc *= 0.5; end(); }
        if (phase === 'stitch' && stitches[si]) { const sk = stitches[si]; sk.r -= dt * (34 + (1 - s.smarts / 100) * 26); if (sk.r < 2) { sk.hit = 0; si++; sfx('bad'); msg = 'Lỡ mũi khâu!'; msgT = 0.5; if (si >= stitches.length) end(); else stitches[si].r = 46; } }
        // vẽ: da, khăn mổ, đường kẻ
        c.fillStyle = '#2f6f6a'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#e8b896'; c.beginPath(); c.ellipse(320, 210, 250, 140, 0, 0, 7); c.fill();
        c.setLineDash([8, 8]); c.strokeStyle = 'rgba(80,40,120,.75)'; c.lineWidth = 3; c.beginPath(); path.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#39cf98'; c.beginPath(); c.arc(P0[0], P0[1], 10, 0, 7); c.fill(); c.fillStyle = '#ff5c5c'; c.beginPath(); c.arc(P3[0], P3[1], 10, 0, 7); c.fill();
        if (trail.length > 1) { c.strokeStyle = '#b3122b'; c.lineWidth = 4; c.beginPath(); trail.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
        stitches.forEach((sk, k) => { const [x, y] = sk.p; if (sk.hit != null) { c.strokeStyle = sk.hit >= 0.6 ? '#1b3d8f' : '#777'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 9, y - 9); c.lineTo(x + 9, y + 9); c.stroke(); } else if (k === si) { c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, Math.max(2, sk.r), 0, 7); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x, y, 14, 0, 7); c.stroke(); } });
        // máy đo nhịp tim
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(470, 12, 158, 54); c.strokeStyle = hr > 60 ? '#39cf98' : '#ff5c5c'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 140; k++) { const ph = (t * hr / 60 + k / 40) % 1; const y = 44 - (ph < 0.06 ? 18 : ph < 0.1 ? -8 : 0); k ? c.lineTo(480 + k, y) : c.moveTo(480, y); } c.stroke();
        c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'left'; c.fillText('♥ ' + Math.round(hr), 478, 24);
        if (msgT > 0) big(c, msg, 360, '#ffd23f', 26);
        hud(phase === 'cut' ? 'Bước 1/2: rạch theo đường kẻ' : 'Bước 2/2: khâu ' + Math.min(si + 1, stitches.length) + '/' + stitches.length);
      });
    });
  }

  // ================================================================ 🕵️ PHÁ ÁN
  const CASES = [['Vụ trộm két sắt ở tiệm vàng', 'Đêm qua két sắt tiệm vàng trên phố bị cạy, mất gần 2 tỷ tiền vàng.'], ['Vụ mất xe máy ở chung cư', 'Chiếc SH của một cư dân biến mất khỏi hầm xe lúc nửa đêm.'], ['Vụ đột nhập văn phòng', 'Máy tính chứa dữ liệu khách hàng của một công ty bị lấy cắp.'], ['Vụ cướp giật trước chợ', 'Một bà cụ bị giật túi tiền ngay trước cổng chợ lúc sáng sớm.']];
  const NAMES = ['Tuấn "Sẹo"', 'Bà Năm bán nước', 'Hùng bảo vệ', 'Lan kế toán', 'Quân thợ khoá', 'Minh xe ôm', 'Tư "Gầy"', 'Hạnh tạp vụ'];
  const ATTR = { h: ['cao', 'thấp'], shirt: ['đỏ', 'đen', 'trắng'], veh: ['xe máy', 'xe đạp', 'đi bộ'] };
  function detective(p) {
    return new Promise((res) => {
      const s = st(p), ap0 = s.smarts >= 75 ? 4 : 3;
      const [title, desc] = pick(CASES), names = shuffle(NAMES.slice()).slice(0, 4);
      // dựng 4 nghi phạm sao cho đủ manh mối thì chỉ một người khớp
      let sus, culprit;
      for (let tries = 0; tries < 200; tries++) {
        sus = names.map((n) => ({ n, h: pick(ATTR.h), shirt: pick(ATTR.shirt), veh: pick(ATTR.veh), alibi: Math.random() < 0.4, out: false }));
        culprit = sus[Math.floor(Math.random() * 4)]; culprit.alibi = false;
        const same = sus.filter((x) => x !== culprit && !x.alibi && x.h === culprit.h && x.shirt === culprit.shirt && x.veh === culprit.veh);
        const partial = sus.filter((x) => x !== culprit && !x.alibi && (x.h === culprit.h) + (x.shirt === culprit.shirt) + (x.veh === culprit.veh) >= 2);
        if (!same.length && partial.length >= 1) break;
      }
      const ACTS = [
        ['scene', '🔍 Khám hiện trường', () => 'Dấu giày để lại khá ' + (culprit.h === 'cao' ? 'to và sải bước dài: thủ phạm dáng người CAO.' : 'nhỏ, bước ngắn: thủ phạm dáng người THẤP.')],
        ['cam', '📹 Xem camera an ninh', () => 'Camera mờ, nhưng thấy rõ thủ phạm mặc áo màu ' + culprit.shirt.toUpperCase() + '.'],
        ['wit', '🗣️ Hỏi nhân chứng', () => 'Bà bán xôi đầu ngõ kể: kẻ đó rời đi bằng ' + culprit.veh.toUpperCase() + '.'],
        ['alibi', '🕰️ Kiểm tra bằng chứng ngoại phạm', () => { const ok = sus.filter((x) => x.alibi); ok.forEach((x) => (x.out = true)); return ok.length ? ok.map((x) => x.n).join(', ') + ' có bằng chứng ngoại phạm rõ ràng (bị loại).' : 'Không ai trong số họ có bằng chứng ngoại phạm.'; }],
      ];
      let ap = ap0, notes = [], used = {}, done = false;
      const box = open('🕵️ ' + esc(title), '<div class="dt"><p class="dt-desc">' + esc(desc) + '</p><div class="dt-sus" id="dtSus"></div><div class="dt-acts" id="dtActs"></div><div class="dt-notes" id="dtNotes"></div></div>', 'Mỗi hành động điều tra tốn 1 lượt. Đọc manh mối, bấm <b>❌</b> để gạch tên người không khớp, rồi bấm <b>👉 Bắt</b> đúng thủ phạm.');
      const draw = () => {
        box.querySelector('#dtSus').innerHTML = sus.map((x, i) => '<div class="dt-card' + (x.out ? ' out' : '') + '"><b>' + esc(x.n) + '</b><small>Dáng ' + x.h + ' · áo ' + x.shirt + ' · ' + x.veh + '</small><div><button type="button" data-x="' + i + '">' + (x.out ? '↩' : '❌') + '</button><button type="button" class="arrest" data-a="' + i + '">👉 Bắt</button></div></div>').join('');
        box.querySelector('#dtActs').innerHTML = '<span>Lượt điều tra còn: <b>' + ap + '</b></span>' + ACTS.map(([k, l]) => '<button type="button" data-k="' + k + '"' + (used[k] || ap <= 0 ? ' disabled' : '') + '>' + l + '</button>').join('');
        box.querySelector('#dtNotes').innerHTML = notes.length ? notes.map((n) => '<div>📝 ' + esc(n) + '</div>').join('') : '<div class="p-sub">Chưa có manh mối nào.</div>';
        hud(ap + ' lượt điều tra');
      };
      box.querySelector('.dt').onclick = (e) => {
        if (done) return; const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.k) { const a = ACTS.find((x) => x[0] === b.dataset.k); used[a[0]] = true; ap--; notes.push(a[2]()); sfx('click'); }
        else if (b.dataset.x != null) sus[+b.dataset.x].out = !sus[+b.dataset.x].out;
        else if (b.dataset.a != null) {
          done = true; const x = sus[+b.dataset.a], ok = x === culprit;
          sfx(ok ? 'cheer' : 'bad');
          box.querySelector('.dt').insertAdjacentHTML('beforeend', '<div class="dt-end ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✅ Chính xác! ' + esc(culprit.n) + ' cúi đầu nhận tội.' : '❌ Bắt nhầm người! Thủ phạm thật là ' + esc(culprit.n) + '.') + '</div>');
          setTimeout(() => res({ score: ok ? clamp(0.75 + ap * 0.1, 0, 1) : 0, text: ok ? 'Bạn phá án thành công, chỉ đúng thủ phạm ' + culprit.n + (ap ? ' mà còn dư ' + ap + ' lượt điều tra' : '') + '.' : 'Bạn bắt nhầm ' + x.n + '. Thủ phạm thật là ' + culprit.n + '.' }), 1500);
        }
        draw();
      };
      draw();
    });
  }

  // ================================================================ 🎣 CÂU CÁ
  const FISH_SIZE = ['', 'cá nhỏ', 'cá vừa', 'cá to', 'cá rất to', 'cá cực hiếm'];
  function fishing(p) {
    return new Promise((res) => {
      const s = st(p);
      const box = open('🎣 Câu cá', '<canvas class="mini-cv" width="640" height="400"></canvas><div class="mini-pad"><button type="button" data-f>🎣 QUĂNG · GIẬT · KÉO <kbd>Space</kbd></button></div>', 'Bấm <kbd>Space</kbd> để quăng câu (vạch càng xa càng dễ gặp cá to) → chờ phao chìm thì bấm thật nhanh để giật → <b>giữ</b> Space để kéo, thả ra khi dây căng đỏ kẻo đứt.');
      const cv = box.querySelector('canvas'), c = cv.getContext('2d');
      let phase = 'aim', pw = 0, dir = 1, dist = 0, wait = 0, biteT = 0, prog = 0, ten = 0, hold = false, t = 0, tier = 0, msg = '', msgT = 0, done = false, pull = 0;
      const say = (m) => { msg = m; msgT = 1.4; };
      const press = (down) => {
        if (done) return;
        if (phase === 'aim' && down) { dist = pw; phase = 'wait'; wait = 1.5 + Math.random() * 3.5; sfx('whoosh'); }
        else if (phase === 'bite' && down) { phase = 'reel'; prog = 10; ten = 30; tier = clamp(1 + Math.floor(dist * 3 + Math.random() * 1.6 + (Math.random() < 0.08 ? 1 : 0)), 1, 5); sfx('click'); }
        else if (phase === 'wait' && down) say('Từ từ, cá chưa cắn!');
        if (phase === 'reel') hold = down;
      };
      const b = box.querySelector('[data-f]'); b.onpointerdown = (e) => { e.preventDefault(); press(true); }; b.onpointerup = b.onpointerleave = () => press(false);
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); press(true); }); cv.addEventListener('pointerup', () => press(false));
      onKeys((e) => { if (e.key !== ' ') return false; if (e.repeat) return true; press(e.type === 'keydown'); return true; });
      const end = (ok, why) => { if (done) return; done = true; sfx(ok ? 'cheer' : 'bad'); msg = why || 'Lên rồi! 🐟'; msgT = 99; setTimeout(() => res({ score: ok ? tier / 5 : 0, text: ok ? 'Bạn câu được một con ' + FISH_SIZE[tier] + '!' : why }), 1200); };
      loop((dt) => {
        t += dt;
        if (phase === 'aim') { pw += dir * dt * 0.9; if (pw > 1) { pw = 1; dir = -1; } if (pw < 0) { pw = 0; dir = 1; } }
        if (phase === 'wait') { wait -= dt; if (wait <= 0) { phase = 'bite'; biteT = 0.45 + s.health / 400; sfx('notify'); } }
        if (phase === 'bite') { biteT -= dt; if (biteT <= 0) { phase = 'aim'; say('Cá ăn mồi mất rồi! Quăng lại nhé.'); } }
        if (phase === 'reel' && !done) {
          pull = Math.max(0, pull - dt) ; if (Math.random() < dt * (0.6 + tier * 0.25)) pull = 0.5 + Math.random() * 0.6;
          const fishF = (pull > 0 ? 55 : 8) * (0.6 + tier * 0.2);
          if (hold) { prog += dt * (22 - tier * 2); ten += dt * (38 + tier * 6) + fishF * dt * 0.6; } else { prog -= dt * (5 + tier * 2); ten -= dt * 55; }
          ten = clamp(ten, 0, 120); prog = clamp(prog, 0, 100);
          if (ten >= 100) end(false, 'Phựt! Dây căng quá nên đứt mất rồi…');
          else if (prog <= 0) end(false, 'Cá vùng thoát mất…');
          else if (prog >= 100) end(true, '');
        }
        if (phase === 'reel' && t > 40) end(false, 'Kéo lâu quá, cá vùng thoát mất…');
        // vẽ
        const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#9ed7f2'); g.addColorStop(0.35, '#cfeaf5'); g.addColorStop(0.36, '#2f7fa6'); g.addColorStop(1, '#174f6d'); c.fillStyle = g; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#4f8a3c'; c.fillRect(0, 300, 120, 100); c.fillStyle = '#6b4a2b'; c.fillRect(60, 250, 10, 60);
        for (let k = 0; k < 8; k++) { c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(150 + k * 60 + Math.sin(t + k) * 10, 170 + k * 25); c.lineTo(190 + k * 60 + Math.sin(t + k) * 10, 170 + k * 25); c.stroke(); }
        const bx = 160 + (phase === 'aim' ? pw : dist) * 420, by = 200 + Math.sin(t * 2) * 3 + (phase === 'bite' ? 8 + Math.sin(t * 30) * 4 : 0);
        c.strokeStyle = '#ddd'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(70, 250); c.quadraticCurveTo(bx * 0.6, 120, bx, by); c.stroke();
        if (phase !== 'aim') { c.fillStyle = '#ff4d4d'; c.beginPath(); c.arc(bx, by, 7, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by - 4, 4, Math.PI, 0); c.fill(); }
        if (phase === 'aim') { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(160, 40, 420, 14); c.fillStyle = '#ffd23f'; c.fillRect(160, 40, 420 * pw, 14); c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'left'; c.fillText('Lực quăng — xa hơn = dễ gặp cá to', 160, 32); }
        if (phase === 'bite') big(c, 'CÁ CẮN! BẤM NGAY!', 90, '#ffd23f', 34);
        if (phase === 'reel') {
          c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(160, 40, 420, 14); c.fillStyle = '#39cf98'; c.fillRect(160, 40, 4.2 * prog, 14);
          c.fillRect(600, 80, 18, 220); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(600, 80, 18, 220); c.fillStyle = ten > 80 ? '#ff5c5c' : ten > 55 ? '#ffb347' : '#39cf98'; c.fillRect(600, 300 - ten * 2.2, 18, ten * 2.2);
          c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'left'; c.fillText('Kéo cá vào bờ', 160, 32); c.textAlign = 'center'; c.fillText('Độ căng', 609, 72);
          if (pull > 0) big(c, 'Cá đang giật mạnh!', 120, '#ffb347', 24);
        }
        msgT = Math.max(0, msgT - dt); if (msgT > 0 && msg) big(c, msg, 360, '#fff', 22);
        hud(phase === 'aim' ? 'Canh lực quăng' : phase === 'wait' ? 'Chờ cá cắn câu…' : phase === 'bite' ? 'Giật cần!' : 'Đang kéo cá');
      });
    });
  }

  // ================================================================ 🦈 SHARK TANK
  const SHARKS = ['Shark Bình Minh', 'Shark Thủy Tiên', 'Shark Lâm Vũ', 'Shark Hoàng Kim'];
  const PQ = [
    ['Doanh thu năm vừa rồi của bạn là bao nhiêu, lãi hay lỗ?', [['Nói rõ số liệu, thừa nhận còn lỗ nhẹ nhưng biên lợi nhuận đang tăng', 3], ['"Doanh thu rất khủng, các anh chị cứ tin em"', 0], ['Chưa có doanh thu, nhưng có 2.000 người đăng ký dùng thử', 2]]],
    ['Đối thủ lớn nhất của bạn là ai? Vì sao khách chọn bạn?', [['"Bọn em không có đối thủ nào cả"', 0], ['Kể tên 2 đối thủ, chỉ ra điểm khác biệt về giá và trải nghiệm', 3], ['Đối thủ mạnh hơn, nhưng bọn em phục vụ ngách mà họ bỏ qua', 2]]],
    ['Bạn định dùng tiền gọi vốn vào việc gì?', [['Mở rộng kênh bán, tuyển thêm 5 người, chi tiết từng hạng mục', 3], ['Mua ô tô cho đội ngũ đi gặp khách cho sang', 0], ['Marketing là chính, phần còn lại làm quỹ dự phòng', 2]]],
    ['Nếu tôi không đầu tư, bạn sẽ làm gì?', [['Vẫn làm tiếp bằng tiền của mình, chậm hơn nhưng chắc', 3], ['"Chắc em nghỉ, về quê nuôi cá"', 0], ['Tìm quỹ đầu tư khác, em đang nói chuyện với 2 quỹ', 2]]],
    ['Bạn hiểu gì về dòng tiền của chính công ty mình?', [['Nêu được chi phí cố định, điểm hoà vốn và số tháng còn trụ được', 3], ['"Kế toán lo hết, em lo tầm nhìn"', 0], ['Nắm sơ sơ, đang thuê người làm báo cáo chuẩn', 1]]],
  ];
  function pitch(p) {
    return new Promise((res) => {
      const s = st(p), qs = shuffle(PQ.slice()).slice(0, 3), sharks = shuffle(SHARKS.slice());
      let qi = 0, pts = (s.smarts - 50) / 25 + (s.looks - 50) / 40, done = false;
      const box = open('🦈 Shark Tank: gọi vốn', '<div class="pt" id="ptBox"></div>', 'Chọn câu trả lời (phím <kbd>1</kbd>–<kbd>3</kbd>). Trả lời thông minh, minh bạch thì các shark mới muốn đầu tư.');
      const area = box.querySelector('#ptBox');
      const showQ = () => {
        const [q, opts] = qs[qi], ord = shuffle(opts.map((o, i) => i));
        area.innerHTML = '<div class="pt-shark">🦈 <b>' + sharks[qi % 4] + '</b> hỏi:</div><div class="pt-q">' + esc(q) + '</div><div class="pt-opts">' + ord.map((k, n) => '<button type="button" data-o="' + k + '"><b>' + (n + 1) + '</b> ' + esc(opts[k][0]) + '</button>').join('') + '</div>';
        hud('Câu hỏi ' + (qi + 1) + '/3');
        area.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => answer(+b.dataset.o)));
        area.dataset.ord = ord.join(',');
      };
      const answer = (k) => {
        if (done) return; const sc = qs[qi][1][k][1]; pts += sc; sfx(sc >= 3 ? 'good' : sc ? 'click' : 'bad'); qi++;
        if (qi < 3) showQ(); else offer();
      };
      onKeys((e) => { if (e.type !== 'keydown' || done || qi >= 3) return false; const n = +e.key; if (!(n >= 1 && n <= 3)) return false; const ord = (area.dataset.ord || '').split(',').map(Number); if (ord[n - 1] != null) answer(ord[n - 1]); return true; });
      const offer = () => {
        const interest = clamp(pts / 9, 0, 1.2), keen = sharks.filter((x, i) => interest > 0.3 + i * 0.18);
        if (!keen.length) { done = true; area.innerHTML = '<div class="pt-q">Cả 4 shark lần lượt nói: "Tôi xin phép không đầu tư." 😔</div>'; sfx('bad'); setTimeout(() => res({ score: 0.1, text: 'Không shark nào xuống tiền. Bạn ra về với bài học quý giá.' }), 1600); return; }
        let eq = Math.round(clamp(45 - interest * 25, 15, 45) / 5) * 5;
        const draw = (note) => {
          area.innerHTML = '<div class="pt-q">' + keen.map((x) => '🦈 ' + esc(x)).join(', ') + ' muốn đầu tư!</div><p class="pt-deal">Đề nghị tốt nhất: góp vốn đổi lấy <b>' + eq + '%</b> cổ phần.' + (note ? '<br><small>' + esc(note) + '</small>' : '') + '</p><div class="pt-opts"><button type="button" data-d="ok">🤝 Đồng ý</button><button type="button" data-d="ct">💬 Mặc cả xuống ' + Math.max(10, eq - 10) + '%</button><button type="button" data-d="no">🚶 Từ chối</button></div>';
          area.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => decide(b.dataset.d)));
        };
        const finish = (score, text) => { done = true; sfx(score >= 0.5 ? 'cheer' : 'bad'); setTimeout(() => res({ score, text }), 900); };
        let tries = 0;
        const decide = (d) => {
          if (d === 'ok') return finish(clamp(0.5 + (45 - eq) / 60 + keen.length * 0.04, 0.5, 1), 'Bạn bắt tay ' + keen[0] + ': nhận vốn đổi lấy ' + eq + '% cổ phần.');
          if (d === 'no') return finish(0.3, 'Bạn từ chối mọi đề nghị, tự tin đi tiếp một mình.');
          tries++;
          if (Math.random() < clamp(interest - 0.15 - tries * 0.12, 0.05, 0.85)) { eq = Math.max(10, eq - 10); draw(keen[0] + ' gật đầu: "Được, tôi chịu ' + eq + '%."'); }
          else if (Math.random() < 0.5 || keen.length < 2) { finish(0.2, keen[0] + ' phật ý vì bị mặc cả, rút lại đề nghị. Bạn ra về tay trắng.'); }
          else { keen.shift(); draw('Shark kia rút lui, nhưng ' + keen[0] + ' vẫn giữ đề nghị.'); }
        };
        draw('');
      };
      showQ();
    });
  }

  if (KN.Mini && KN.Mini.onAbort) KN.Mini.onAbort.push(close);
  if (KN.Mini && KN.Mini.register) {
    const R = (id, fn, name, how, hint) => KN.Mini.register(id, (p) => fn(p).then((r) => { close(); return r; }), name, how, hint);
    R('ride', ride, '🚕 Chạy xe công nghệ', '45 giây chạy trên lưới phố. Tới 🧍 đón khách, chở tới 🏁. Chở nhanh, không va quẹt thì được 5 sao. Phím mũi tên hoặc WASD, điện thoại dùng nút.', (p) => 'Sức khỏe ' + Math.round(st(p).health) + ': xe chạy ' + (st(p).health >= 70 ? 'nhanh, lách tốt' : 'vừa phải'));
    R('surgery', surgery, '🔪 Phẫu thuật', 'Bước 1: giữ và kéo dao mổ dọc đường nét đứt từ chấm xanh tới chấm đỏ. Bước 2: bấm từng mũi khâu khi vòng vàng thu nhỏ vừa khít vòng trắng. Nhịp tim bệnh nhân tụt dần, đừng chậm quá!', (p) => 'Trí tuệ ' + Math.round(st(p).smarts) + ': sai số cho phép ' + (st(p).smarts >= 75 ? 'rộng, tay vững' : 'hẹp'));
    R('detective', detective, '🕵️ Phá án', 'Có 4 nghi phạm. Mỗi lượt điều tra cho một manh mối (dáng người, màu áo, phương tiện, chứng cứ ngoại phạm). Gạch tên người không khớp và chỉ đúng thủ phạm. Bắt nhầm là thất bại!', (p) => 'Trí tuệ ' + Math.round(st(p).smarts) + ': ' + (st(p).smarts >= 75 ? '4 lượt điều tra' : '3 lượt điều tra'));
    R('fishing', fishing, '🎣 Câu cá', 'Quăng câu (vạch xa = cá to), chờ phao chìm thì giật ngay, rồi giữ Space để kéo — thả ra khi thanh độ căng đỏ kẻo đứt dây.', (p) => 'Sức khỏe ' + Math.round(st(p).health) + ': phản xạ giật cần ' + (st(p).health >= 70 ? 'nhanh' : 'vừa'));
    R('pitch', pitch, '🦈 Gọi vốn Shark Tank', 'Trả lời 3 câu hỏi của các shark. Câu trả lời minh bạch, có số liệu thì được đánh giá cao. Sau đó chọn đồng ý, mặc cả hay từ chối đề nghị.', (p) => 'Trí tuệ và ngoại hình giúp bạn thuyết phục hơn');
  }
  KN.JobMini = { ride, surgery, detective, fishing, pitch };
})();
