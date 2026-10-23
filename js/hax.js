/* Một Kiếp Người — ⚽ BÓNG ĐÁ HAX (KN.Hax): bóng đá nhìn từ trên xuống kiểu HaxBall.
   Chế độ: đấu với máy (1v1 · 2v2 · 3v3, có đồng đội máy) · 2 người 1 máy · ONLINE nhiều người (tối đa 8) qua máy chủ riêng
   (server/index.js, WebSocket cổng 443 — không bị mạng trường chặn) hoặc WebRTC ngang hàng dự phòng.
   6 bản đồ: Cổ điển · Futsal · Sân lớn · Sân băng (trơn) · Bãi biển (cát nặng) · Sân hẻm.
   Online: chủ phòng mô phỏng vật lý 60 lần/giây và gửi trạng thái 60 lần/giây; người vào phòng tự DỰ ĐOÁN chuyển động
   (chạy vật lý ngay trên máy mình rồi khớp dần với chủ phòng) nên nhân vật của mình phản hồi tức thì, không bị trễ.
   Điều khiển: WASD/↑↓←→ di chuyển, Space/X sút (giữ sút thì chạy chậm lại như HaxBall). Điện thoại: cần gạt + nút sút. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  // ---------------------------------------------------------------- bản đồ
  const MAPS = {
    classic: { name: 'Cổ điển', icon: '🏟️', W: 900, H: 460, L: 70, R: 830, T: 40, B: 420, GH: 64, GD: 36, circle: 70, box: [90, 120], out: '#3c7a3a', grass: ['#3b783a', '#418541'], line: 'rgba(255,255,255,.85)', acc: 0.12, pd: 0.955, bd: 0.99, kick: 5.4 },
    futsal: { name: 'Futsal', icon: '🏠', W: 720, H: 400, L: 60, R: 660, T: 40, B: 360, GH: 50, GD: 30, circle: 55, box: [70, 95], out: '#4a2f1c', grass: ['#c98848', '#bf7e40'], line: 'rgba(255,255,255,.9)', acc: 0.12, pd: 0.955, bd: 0.985, kick: 5.0, deco: [['🪑', 30, 20], ['🪑', 690, 20], ['🧃', 30, 385], ['🧃', 690, 385]] },
    big: { name: 'Sân lớn', icon: '🌳', W: 1200, H: 620, L: 90, R: 1110, T: 55, B: 565, GH: 82, GD: 40, circle: 95, box: [125, 165], out: '#2f6b33', grass: ['#367537', '#3d823f'], line: 'rgba(255,255,255,.85)', acc: 0.12, pd: 0.958, bd: 0.991, kick: 5.8, deco: [['🌳', 30, 30], ['🌳', 1170, 30], ['🌳', 30, 590], ['🌳', 1170, 590], ['📣', 600, 22]] },
    ice: { name: 'Sân băng', icon: '🧊', W: 900, H: 460, L: 70, R: 830, T: 40, B: 420, GH: 60, GD: 34, circle: 70, box: [90, 120], out: '#7fa9c2', grass: ['#dcf0fa', '#d2eaf6'], line: 'rgba(200,40,60,.65)', acc: 0.06, pd: 0.984, bd: 0.996, kick: 5.0, dark: true, deco: [['⛄', 30, 25], ['⛄', 870, 25], ['❄️', 30, 440], ['❄️', 870, 440]] },
    beach: { name: 'Bãi biển', icon: '🏖️', W: 900, H: 460, L: 70, R: 830, T: 40, B: 420, GH: 66, GD: 34, circle: 70, box: [90, 120], out: '#3fa9d6', grass: ['#ecd394', '#e4c886'], line: 'rgba(255,255,255,.9)', acc: 0.13, pd: 0.935, bd: 0.975, kick: 5.2, dark: true, deco: [['🌴', 28, 30], ['🌴', 872, 30], ['⛱️', 28, 438], ['🦀', 872, 438]] },
    street: { name: 'Sân hẻm', icon: '🏚️', W: 860, H: 380, L: 60, R: 800, T: 50, B: 330, GH: 48, GD: 30, circle: 50, box: [70, 85], out: '#2c2f34', grass: ['#555a61', '#4e535a'], line: 'rgba(255,214,90,.8)', acc: 0.12, pd: 0.95, bd: 0.985, kick: 5.0, deco: [['🛵', 30, 25], ['🗑️', 830, 25], ['🐕', 30, 355], ['🍜', 830, 355]] },
  };
  // 🏀 sân bóng rổ: không có khung thành, hai rổ cách biên ngang hoopOff; ném (sút) bóng lọt rổ = 2 điểm, ném từ ngoài vạch 3 điểm (arc) = 3 điểm
  MAPS.court = { name: 'Sân bóng rổ', icon: '🏀', basket: true, W: 900, H: 480, L: 60, R: 840, T: 40, B: 440, GH: 0, GD: 0, hoopOff: 70, arc: 235, circle: 60, box: [150, 62], out: '#3b2a1d', grass: ['#cd8f4f', '#c58745'], line: 'rgba(255,255,255,.88)', acc: 0.12, pd: 0.955, bd: 0.986, kick: 5.0 };
  let MP, W, H, L, R, T, B, CY, GH, GD, POSTS, HOOPS = null;
  function applyMap(id) { MP = MAPS[id] || MAPS.classic; ({ W, H, L, R, T, B, GH, GD } = MP); CY = (T + B) / 2; POSTS = MP.basket ? [] : [[L, CY - GH], [L, CY + GH], [R, CY - GH], [R, CY + GH]]; HOOPS = MP.basket ? [[L + MP.hoopOff, CY], [R - MP.hoopOff, CY]] : null; }
  applyMap('classic');
  const PR = 15, BR = 10, POST_R = 7, KICK_RANGE = PR + BR + 9; // nới tầm chạm bóng cho dễ sút
  const COLORS = ['#e8423f', '#3d7bf2'], NAMES = ['Đỏ', 'Xanh'];
  const clamp1 = (v) => Math.max(-1, Math.min(1, v));
  // ---------------------------------------------------------------- trạng thái trận
  // roster: [{ team, name }] theo thứ tự cầu thủ
  function newMatch(o) {
    o = o || {}; applyMap(o.map);
    const m = { map: MAPS[o.map] ? o.map : 'classic', players: [], ball: { x: W / 2, y: CY, vx: 0, vy: 0, spin: 0 }, score: [0, 0], time: 0, dur: o.dur || 180, phase: 'kickoff', phaseT: 0, kickoff: 0, golden: false, noGolden: !!o.noGolden, events: [], client: !!o.client, lastTouch: -1, goalsBy: {} };
    (o.roster || [{ team: 0 }, { team: 1 }]).forEach((r) => m.players.push({ team: r.team, x: 0, y: 0, vx: 0, vy: 0, cool: 0, kicking: false, flash: 0, charge: 0, name: r.name || '', num: 0, hx: 0, hy: 0, sk: r.sk || { charge: true, curve: true } }));
    [0, 1].forEach((t) => m.players.filter((p) => p.team === t).forEach((p, i) => (p.num = i + 1)));
    resetPositions(m); return m;
  }
  const FORM = { 1: [[0.35, 0]], 2: [[0.45, -0.3], [0.3, 0.3]], 3: [[0.5, 0], [0.25, -0.45], [0.25, 0.45]], 4: [[0.5, -0.28], [0.5, 0.28], [0.22, -0.5], [0.22, 0.5]] };
  function resetPositions(m) {
    [0, 1].forEach((t) => {
      const list = m.players.filter((p) => p.team === t), n = list.length;
      list.forEach((p, i) => {
        const f = FORM[n] ? FORM[n][i] : [0.15 + 0.35 * ((i % 2) ? 0.3 : 1), -0.6 + 1.2 * (i / Math.max(1, n - 1))];
        p.x = t === 0 ? L + f[0] * (W / 2 - L) : R - f[0] * (R - W / 2); p.y = CY + f[1] * (B - T) / 2;
        p.hx = p.x; p.hy = p.y; p.vx = p.vy = 0; p.cool = 0; p.stun = 0; p.slide = 0; if (p.out) { p.x = -200; p.y = -200; }
      });
    });
    m.ball.x = W / 2; m.ball.y = CY; m.ball.vx = m.ball.vy = 0; m.ball.spin = 0; m.players.forEach((p) => (p.charge = 0)); m.phase = 'kickoff'; m.phaseT = 0;
  }
  // ---------------------------------------------------------------- vật lý (đơn vị: px / tick 1/60 giây)
  function collideCircles(a, b, ra, rb, ia, ib, rest) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = ra + rb;
    if (d >= min || d === 0) return false;
    const nx = dx / d, ny = dy / d, pen = min - d, tot = ia + ib; if (!tot) return false;
    a.x -= nx * pen * ia / tot; a.y -= ny * pen * ia / tot; b.x += nx * pen * ib / tot; b.y += ny * pen * ib / tot;
    const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv > 0) return true;
    const j = -(1 + rest) * rv / tot;
    a.vx -= j * ia * nx; a.vy -= j * ia * ny; b.vx += j * ib * nx; b.vy += j * ib * ny;
    return true;
  }
  function staticPost(o, r, post, rest) { const s = { x: post[0], y: post[1], vx: 0, vy: 0 }; return collideCircles(s, o, POST_R, r, 0, 1, rest); }
  // phím → vector chạy {jx, jy, k}
  function vecOf(inp) {
    inp = inp || {};
    let ax = inp.jx != null ? inp.jx : (inp.r ? 1 : 0) - (inp.l ? 1 : 0), ay = inp.jy != null ? inp.jy : (inp.d ? 1 : 0) - (inp.u ? 1 : 0);
    const len = Math.hypot(ax, ay); if (len > 1) { ax /= len; ay /= len; }
    return { jx: ax, jy: ay, k: !!inp.k, pw: inp.pw > 0 && inp.pw < 1 ? inp.pw : 1, s: !!inp.s, t: !!inp.t };
  }
  function step(m, inputs) {
    m.phaseT++;
    if (m.phase === 'goal') { if (!m.client && m.phaseT > 150) { m.cele = null; resetPositions(m); } else { celebrate(m); moveBall(m); return; } }
    if (m.phase === 'end') return;
    if (m.phase === 'play' && !m.client) { m.time += 1 / 60; if (m.time >= m.dur && !m.golden) { if (m.score[0] === m.score[1] && !m.noGolden) { m.golden = true; m.events.push({ t: 'golden' }); } else { m.phase = 'end'; m.events.push({ t: 'end' }); return; } } if (m.golden && m.time >= m.dur + 90) { m.phase = 'end'; m.events.push({ t: 'end' }); return; } }
    m.players.forEach((p, i) => {
      if (p.out) return; // bị thẻ đỏ: rời sân
      const v = p.stun > 0 ? vecOf({}) : vecOf(inputs[i]);
      if (p.stun > 0) p.stun--;
      // CHẠY NƯỚC RÚT: giữ phím chạy nhanh, tốn thể lực (thanh vàng), nghỉ thì hồi
      if (p.stam == null) p.stam = 100;
      const moving = v.jx || v.jy, spr = v.s && moving && p.stam > 4 && !v.k;
      p.stam = spr ? Math.max(0, p.stam - 1.1) : Math.min(100, p.stam + 0.35);
      p.spr = spr;
      // XOẠC BÓNG: lao người theo hướng chạy; xoạc trúng người trước khi chạm bóng là phạm lỗi
      if (p.tCool > 0) p.tCool--; if (p.slide > 0) p.slide--;
      if (v.t && moving && !(p.tCool > 0) && m.phase === 'play') { p.vx += v.jx * 4.2; p.vy += v.jy * 4.2; p.tCool = 80; p.slide = 16; p.slideT = m.phaseT; m.events.push({ t: 'slide' }); }
      // bấm sút sớm một chút (trước khi chạm bóng) vẫn ăn: nhớ lệnh sút thêm 8 khung hình (~0,13 giây)
      if (v.k && !p.kicking) p.kbuf = 8; else if (p.kbuf > 0) p.kbuf--;
      p.kicking = v.k; const acc = (p.kicking ? MP.acc * 0.62 : MP.acc) * (p.assist ? 1.08 : 1) * (spr ? 1.5 : 1) * (p.slide > 0 ? 0.2 : 1);
      p.vx = (p.vx + v.jx * acc) * MP.pd; p.vy = (p.vy + v.jy * acc) * MP.pd;
      p.x += p.vx; p.y += p.vy;
      // giao bóng: chưa được vượt sang nửa sân đối phương / vào vòng tròn giữa sân
      if (m.phase === 'kickoff') { if (p.team === 0) p.x = Math.min(p.x, W / 2 - PR); else p.x = Math.max(p.x, W / 2 + PR); if (p.team !== m.kickoff) { const dx = p.x - W / 2, dy = p.y - CY, d = Math.hypot(dx, dy), rr = MP.circle + PR; if (d < rr) { p.x = W / 2 + dx / (d || 1) * rr; p.y = CY + dy / (d || 1) * rr; } } }
      if (m.phase === 'setpiece' && p.team !== m.kickoff && i !== m.keeper) { const dx = p.x - m.ball.x, dy = p.y - m.ball.y, d = Math.hypot(dx, dy), rr = 85; if (d < rr) { p.x = m.ball.x + dx / (d || 1) * rr; p.y = m.ball.y + dy / (d || 1) * rr; } }
      p.x = Math.max(PR, Math.min(W - PR, p.x)); p.y = Math.max(PR, Math.min(H - PR, p.y));
      if (p.cool > 0) p.cool--; if (p.flash > 0) p.flash--;
      // SÚT TÍCH LỰC: giữ nút sút khi chưa chạm bóng để tích lực (vòng vàng), lao vào bóng là sút mạnh hơn tới 75%
      // SÚT XOÁY: vừa chạy ngang vừa sút thì bóng cong theo hướng chạy
      if (!p.kicking) p.charge = 0;
      if ((p.kicking || p.kbuf > 0) && p.cool <= 0) {
        const dx = m.ball.x - p.x, dy = m.ball.y - p.y, d = Math.hypot(dx, dy);
        if (d < KICK_RANGE + (p.assist ? 4 : 0) && ((m.phase !== 'kickoff' && m.phase !== 'setpiece') || p.team === m.kickoff)) {
          const pow = MP.kick * (p.sk.charge ? 1 + Math.min(p.charge, 45) / 45 * 0.75 : 1) * v.pw * (p.assist ? 1.12 : 1);
          let ux = dx / d, uy = dy / d;
          // hỗ trợ ngắm: sút gần đúng hướng khung thành đối phương (lệch < ~35°, trong 480px) thì bóng bẻ nhẹ vào khung
          if (!MP.basket) { const gx = (p.team === 0 ? R : L) - m.ball.x, gy = Math.max(CY - GH * 0.6, Math.min(CY + GH * 0.6, m.ball.y)) - m.ball.y, gl = Math.hypot(gx, gy) || 1; const wide = p.assist ? 0.6 : 0.82, pull = p.assist ? 0.55 : 0.35; if (gl < (p.assist ? 560 : 480) && (ux * gx + uy * gy) / gl > wide) { ux = ux * (1 - pull) + gx / gl * pull; uy = uy * (1 - pull) + gy / gl * pull; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul; } }
          m.ball.vx += ux * pow; m.ball.vy += uy * pow;
          if (p.sk.curve) { const side = ux * p.vy - uy * p.vx; m.ball.spin = Math.max(-0.035, Math.min(0.035, side * 0.014)); }
          if (p.charge > 25) m.events.push({ t: 'power' });
          p.cool = 12; p.flash = 8; p.charge = 0; p.kbuf = 0; m.lastTouch = i; m.shot = [p.x, p.y]; m.shotT = m.phaseT; m.events.push({ t: 'kick' }); if ((m.phase === 'kickoff' || m.phase === 'setpiece') && !m.client) m.phase = 'play';
        } else if (p.sk.charge && d >= KICK_RANGE) p.charge = Math.min(45, p.charge + 1);
      }
    });
    const ps = m.players;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      if (ps[i].out || ps[j].out) continue;
      if (collideCircles(ps[i], ps[j], PR, PR, 0.5, 0.5, 0.5) && ps[i].team !== ps[j].team && m.phase === 'play' && !m.client) {
        [[i, j], [j, i]].forEach(([a, bb]) => { const A = ps[a], Bp = ps[bb]; if (!(A.slide > 0) || Bp.stun > 0) return;
          // chạm bóng trước (trong lúc xoạc) thì hợp lệ, đối phương chỉ loạng choạng; xoạc thẳng vào người là phạm lỗi
          const clean = A.ballT != null && A.ballT >= A.slideT;
          Bp.stun = clean ? 14 : 45; A.slide = 0;
          if (!clean) foul(m, a, bb);
        });
      }
    }
    ps.forEach((p, i) => { if (p.out) return; const hit = collideCircles(p, m.ball, PR, BR, 0.5, 1, 0.5); if (hit) { p.ballT = m.phaseT; if (!(m.lastTouch === i && m.phaseT - (m.shotT || 0) < 15)) m.shot = null; m.lastTouch = i; } if (hit && (m.phase === 'kickoff' || m.phase === 'setpiece') && p.team === m.kickoff && !m.client) m.phase = 'play'; POSTS.forEach((po) => staticPost(p, PR, po, 0.4)); });
    if ((m.phase === 'kickoff' || m.phase === 'setpiece') && m.phaseT > 300 && !m.client) m.phase = 'play'; // 5 giây không ai giao thì tự chạy
    moveBall(m);
  }
  // ĂN MỪNG BÀN THẮNG: người ghi bàn chạy ra góc sân / khán đài theo kiểu ăn mừng, đồng đội chạy tới ôm, đội thua lững thững về sân nhà
  const CELE = [
    { id: 'siu', text: 'SIUUU! 🐐' }, { id: 'knee', text: 'Trượt gối ăn mừng! 🧎' }, { id: 'plane', text: 'Dang tay máy bay! ✈️' },
    { id: 'dance', text: 'Nhảy ăn mừng! 💃' }, { id: 'hush', text: 'Suỵt… im lặng nào! 🤫' }, { id: 'heart', text: 'Bắn tim cho khán giả! 🫶' },
  ];
  function celebrate(m) {
    const c = m.cele; if (!c) return;
    const sc = m.players[c.who]; if (!sc) return;
    const t = m.phaseT, dir = sc.team === 0 ? 1 : -1;
    const cx = c.cx != null ? c.cx : (c.cx = sc.team === 0 ? R - 40 : L + 40), cy = c.cy != null ? c.cy : (c.cy = sc.y < CY ? T + 30 : B - 30);
    let tx = cx, ty = cy, sp = 0.32;
    if (c.style === 'plane') { const a = t * 0.07; tx = W / 2 + dir * 160 + Math.cos(a) * 110; ty = CY + Math.sin(a) * 90; sp = 0.4; }
    else if (c.style === 'dance') { tx = sc.x + Math.sin(t * 0.3) * 30; ty = sc.y + Math.cos(t * 0.21) * 20; sp = 0.5; }
    else if (c.style === 'hush') { tx = sc.x + dir * 30; ty = sc.y < CY ? T + 18 : B - 18; }
    else if (c.style === 'knee') sp = t < 60 ? 0.55 : 0.05;
    const mv = (p, x, y, k) => { p.vx = (p.vx + (x - p.x) * 0.012 * k) * 0.88; p.vy = (p.vy + (y - p.y) * 0.012 * k) * 0.88; p.x = Math.max(PR, Math.min(W - PR, p.x + p.vx)); p.y = Math.max(PR, Math.min(H - PR, p.y + p.vy)); };
    mv(sc, tx, ty, sp * 3);
    m.players.forEach((p, i) => {
      if (i === c.who) return;
      if (p.team === sc.team) { if (t > 25) mv(p, sc.x - dir * (16 + (i % 3) * 10), sc.y + ((i % 2) ? 18 : -18), 0.9); } // chạy tới ôm người ghi bàn
      else mv(p, p.hx, p.hy, 0.25); // đội thua cúi đầu về chỗ
    });
  }
  function moveBall(m) {
    const b = m.ball;
    // bóng xoáy: hướng bay quay dần theo độ xoáy, xoáy tắt dần
    if (b.spin) { const sp = Math.hypot(b.vx, b.vy); if (sp < 0.6) b.spin = 0; else { const a = b.spin * Math.min(1, sp / 4), c = Math.cos(a), s = Math.sin(a), vx = b.vx * c - b.vy * s; b.vy = b.vx * s + b.vy * c; b.vx = vx; b.spin *= 0.975; if (Math.abs(b.spin) < 0.001) b.spin = 0; } }
    b.x += b.vx; b.y += b.vy; b.vx *= MP.bd; b.vy *= MP.bd;
    POSTS.forEach((po) => { if (staticPost(b, BR, po, 0.6)) b.spin = 0; });
    const inMouth = b.y > CY - GH && b.y < CY + GH;
    if (b.y < T + BR && !(b.x < L || b.x > R)) { b.y = T + BR; b.vy = -b.vy * 0.5; }
    if (b.y > B - BR && !(b.x < L || b.x > R)) { b.y = B - BR; b.vy = -b.vy * 0.5; }
    if (b.x < L + BR && !inMouth && b.x > L - 2) { b.x = L + BR; b.vx = -b.vx * 0.5; }
    if (b.x > R - BR && !inMouth && b.x < R + 2) { b.x = R - BR; b.vx = -b.vx * 0.5; }
    if (b.x < L) { if (b.y < CY - GH + BR) { b.y = CY - GH + BR; b.vy = Math.abs(b.vy) * 0.3; } if (b.y > CY + GH - BR) { b.y = CY + GH - BR; b.vy = -Math.abs(b.vy) * 0.3; } if (b.x < L - GD + BR) { b.x = L - GD + BR; b.vx = Math.abs(b.vx) * 0.2; } }
    if (b.x > R) { if (b.y < CY - GH + BR) { b.y = CY - GH + BR; b.vy = Math.abs(b.vy) * 0.3; } if (b.y > CY + GH - BR) { b.y = CY + GH - BR; b.vy = -Math.abs(b.vy) * 0.3; } if (b.x > R + GD - BR) { b.x = R + GD - BR; b.vx = -Math.abs(b.vx) * 0.2; } }
    if (MP.basket) {
      // bóng phải được NÉM (sút) bởi đội tấn công rổ đó, lọt qua vòng rổ với tốc độ vừa phải
      // cú ném đang bay về phía rổ trong tầm 150px thì bẻ nhẹ hướng vào rổ (ném chuẩn tay)
      if (m.shot && m.phase === 'play') HOOPS.forEach(([hx, hy]) => { const dx = hx - b.x, dy = hy - b.y, d = Math.hypot(dx, dy), sp = Math.hypot(b.vx, b.vy); if (d < 150 && d > 4 && sp > 1 && (b.vx * dx + b.vy * dy) / (sp * d) > 0.55) { const k = 0.12; b.vx = b.vx * (1 - k) + dx / d * sp * k; b.vy = b.vy * (1 - k) + dy / d * sp * k; } });
      if (!m.client && m.phase === 'play' && m.shot) for (let h = 0; h < 2; h++) {
        const [hx, hy] = HOOPS[h], team = h === 1 ? 0 : 1, sh = m.players[m.lastTouch], sp = Math.hypot(b.vx, b.vy);
        if (Math.hypot(b.x - hx, b.y - hy) < 22 && sp > 0.8 && sp < 13 && sh && sh.team === team) { goal(m, team, Math.hypot(m.shot[0] - hx, m.shot[1] - hy) > MP.arc ? 3 : 2); m.shot = null; break; }
      }
      return;
    }
    if (!m.client && (m.phase === 'play' || m.phase === 'kickoff')) { if (b.x < L - BR) goal(m, 1); else if (b.x > R + BR) goal(m, 0); }
  }
  // PHẠM LỖI: 2 lỗi = thẻ vàng, 4 lỗi = thẻ đỏ (rời sân). Lỗi trong vòng cấm của đội mình = phạt đền, ngoài vòng cấm = đá phạt
  function foul(m, a, bIdx) {
    const A = m.players[a], Bp = m.players[bIdx]; A.fouls = (A.fouls || 0) + 1;
    let card = null;
    if (A.fouls >= 4 && !A.out) { card = 'red'; A.card = 2; A.out = true; A.x = -200; A.y = -200; A.vx = A.vy = 0; }
    else if (A.fouls >= 2 && !A.card) { card = 'yellow'; A.card = 1; }
    const ownL = A.team === 0, inBox = !MP.basket && (ownL ? Bp.x < L + MP.box[0] : Bp.x > R - MP.box[0]) && Math.abs(Bp.y - CY) < MP.box[1];
    const b = m.ball; b.vx = b.vy = 0; b.spin = 0;
    if (inBox) { b.x = ownL ? L + 78 : R - 78; b.y = CY; } else { b.x = Math.max(L + 30, Math.min(R - 30, Bp.x)); b.y = Math.max(T + 20, Math.min(B - 20, Bp.y)); }
    m.phase = 'setpiece'; m.phaseT = 0; m.kickoff = Bp.team; m.pen = inBox; m.keeper = -1;
    // người bị phạm lỗi đứng sau bóng để đá
    const dir = Bp.team === 0 ? 1 : -1; Bp.x = b.x - dir * (PR + BR + 6); Bp.y = b.y; Bp.vx = Bp.vy = 0; Bp.stun = 0;
    if (inBox) {
      // phạt đền: thủ môn (người gần khung nhất của đội phạm lỗi) đứng trên vạch, còn lại ra khỏi vòng cấm
      let kp = -1, kd = 1e9; m.players.forEach((q, k) => { if (q.team === A.team && !q.out) { const d = Math.abs(q.x - (ownL ? L : R)); if (d < kd) { kd = d; kp = k; } } });
      m.keeper = kp; if (kp >= 0) { const K = m.players[kp]; K.x = ownL ? L + PR + 2 : R - PR - 2; K.y = CY; K.vx = K.vy = 0; }
      m.players.forEach((q, k) => { if (k === bIdx || k === kp || q.out) return; if (Math.abs(q.x - b.x) < 150) { q.x = b.x - dir * (160 + (k % 3) * 20); q.y = CY + ((k % 2) ? 70 : -70); q.vx = q.vy = 0; } });
    }
    m.lastCard = card === 'red' ? '🟥 THẺ ĐỎ cho ' + (A.name || 'số ' + A.num) + ', rời sân!' : card === 'yellow' ? '🟨 Thẻ vàng cho ' + (A.name || 'số ' + A.num) : '';
    m.events.push({ t: 'foul', pen: inBox, card, who: a });
  }
  function goal(m, team, pts) {
    m.score[team] += pts || 1; m.lastPts = pts || 1; m.phase = 'goal'; m.phaseT = 0; m.kickoff = 1 - team;
    const who = m.players[m.lastTouch] && m.players[m.lastTouch].team === team ? m.lastTouch : m.players.findIndex((q) => q.team === team);
    if (who >= 0) m.cele = { who, style: CELE[(m.score[0] + m.score[1] + who) % CELE.length].id }; // cùng công thức trên máy người vào phòng online
    const sc = m.players[m.lastTouch]; if (sc && sc.team === team) m.goalsBy[m.lastTouch] = (m.goalsBy[m.lastTouch] || 0) + 1;
    m.scorerName = sc ? (sc.team === team ? sc.name || '' : 'phản lưới nhà!') : '';
    m.events.push({ t: 'goal', team, scorer: m.lastTouch });
    if (m.golden) { m.phase = 'end'; m.events.push({ t: 'end' }); }
  }
  // ---------------------------------------------------------------- máy (AI) — biết phối hợp: người gần bóng nhất lên bóng, người khác lùi giữ/chờ bật tường
  // TIKI-TAKA: tìm đồng đội để chuyền — đường chuyền không bị chặn, người nhận càng trống càng tốt, ưu tiên chuyền lên và chuyền cho người thật
  function pickPass(m, i, dir) {
    const p = m.players[i], b = m.ball, foes = m.players.filter((q) => q.team !== p.team);
    let best = null, bs = -1e9;
    m.players.forEach((q, j) => {
      if (j === i || q.team !== p.team || q.out) return;
      const qx = q.x + q.vx * 6, qy = q.y + q.vy * 6, dx = qx - b.x, dy = qy - b.y, d = Math.hypot(dx, dy);
      if (d < 55 || d > 380) return;
      let lane = 1e9, open = 220;
      foes.forEach((f) => { const t = Math.max(0, Math.min(1, ((f.x - b.x) * dx + (f.y - b.y) * dy) / (d * d))); lane = Math.min(lane, Math.hypot(b.x + dx * t - f.x, b.y + dy * t - f.y)); open = Math.min(open, Math.hypot(f.x - qx, f.y - qy)); });
      if (lane < PR + BR + 4) return;
      const sc = open * 0.8 + dir * dx * 0.45 - Math.abs(d - 170) * 0.2 + (q.human ? 35 : 0) + Math.min(lane, 60) * 0.3;
      if (sc > bs) { bs = sc; best = { j, sc, x: qx, y: qy, d }; }
    });
    return best;
  }
  function aiInput(m, i, lvl) {
    const p = m.players[i], b = m.ball, dir = p.team === 0 ? 1 : -1, own = MP.basket ? HOOPS[p.team][0] : p.team === 0 ? L : R, opp = MP.basket ? HOOPS[1 - p.team][0] : p.team === 0 ? R + 10 : L - 10;
    const speed = ([0.58, 0.8, 0.95][lvl] ?? 0.8) * (p.slowK || 1); // máy chạy chậm hơn người một chút (trận trong cuộc đời còn chậm hơn nữa)
    const go = (tx, ty, s) => { const dx = tx - p.x, dy = ty - p.y, dl = Math.hypot(dx, dy) || 1, sp = (s || speed) * Math.min(1, dl / 14 + 0.2); return { jx: dx / dl * sp, jy: dy / dl * sp }; };
    if (m.phase === 'kickoff' && p.team !== m.kickoff) return go(p.hx, p.hy, 0.5);
    if (m.phase === 'setpiece' && p.team !== m.kickoff) { if (i === m.keeper) return go(p.x, Math.max(CY - GH + PR, Math.min(CY + GH - PR, b.y)), 0.6); const own2 = p.team === 0 ? L : R; return go(b.x + (own2 - b.x) * 0.35, b.y + (CY - b.y) * 0.4, 0.6); }
    // vừa chuyền xong (thấy chân loé sáng) thì nhả bóng, chạy chỗ chứ không đuổi theo bóng mình vừa chuyền
    if (p.plan && p.plan.j != null && p.flash > 0) { p.passedT = m.phaseT; p.plan = null; }
    const justPassed = p.passedT != null && m.phaseT - p.passedT >= 0 && m.phaseT - p.passedT < 40;
    const dist = (q) => Math.hypot(q.x - b.x, q.y - b.y), myD = dist(p);
    const mates = m.players.filter((q) => q.team === p.team && q !== p);
    let rank = mates.filter((q) => dist(q) < myD).length;
    if (justPassed && mates.length) rank = Math.max(rank, 1);
    const foes = m.players.filter((q) => q.team !== p.team), foeD = foes.length ? Math.min(...foes.map(dist)) : 999;
    const ownHalf = dir * (b.x - W / 2) < 0;
    const near = m.players.reduce((a, q) => (dist(q) < dist(a) ? q : a), p), poss = near.team === p.team && dist(near) < PR + BR + 28; // đội mình đang giữ bóng
    // đón đường chuyền của đồng đội: chạy tới điểm bóng sẽ lăn qua gần mình nhất
    const sp = Math.hypot(b.vx, b.vy), lt = m.players[m.lastTouch];
    if (rank > 0 && !justPassed && sp > 1.5 && lt && lt !== p && lt.team === p.team) {
      const t = Math.max(0, Math.min(70, ((p.x - b.x) * b.vx + (p.y - b.y) * b.vy) / (sp * sp))), cx = b.x + b.vx * t, cy = b.y + b.vy * t;
      if (t > 0 && Math.hypot(cx - p.x, cy - p.y) < 110) { const v = go(cx, cy, speed); v.k = false; return v; }
    }
    const co = m.coach && m.coach.team === p.team ? m.coach : null;
    if (rank > 0) {
      let tx, ty;
      const side = b.y < CY ? 1 : -1;
      if (poss && !(ownHalf && rank > 1 && mates.length > 2)) {
        // chạy chỗ tạo tam giác chuyền: người thứ nhất dạt cánh bên kia phía trước, người thứ hai lùi chéo làm điểm chuyền về
        if (rank === 1) { tx = b.x + dir * (MP.basket ? 120 : 105); ty = CY + side * (B - T) * 0.3; }
        else { tx = b.x - dir * 85; ty = b.y + side * 95; }
      } else if (rank === 1 || ownHalf) { tx = own + (b.x - own) * 0.32 + dir * 25; ty = CY + (b.y - CY) * 0.5 + (p.hy - CY) * 0.35; }
      else { tx = b.x - dir * 110; ty = CY + (p.hy - CY) * 0.9; }
      // vai trò HLV giao: hậu vệ đứng gần khung thành nhà, tiền đạo đứng cao; HLV hô dâng lên / lùi về thì cả đội dịch theo
      if (p.role === 'def') tx = Math.min(tx * dir, (own + (b.x - own) * 0.3 + dir * 30) * dir) * dir;
      else if (p.role === 'att' && !ownHalf) tx += dir * 50;
      if (co && co.line) tx += dir * co.line * 70;
      tx = Math.max(L + PR, Math.min(R - PR, tx)); ty = Math.max(T + PR, Math.min(B - PR, ty));
      const v = go(tx, ty, speed * (poss ? 0.95 : 0.9));
      v.k = !justPassed && myD < KICK_RANGE && dir * (b.x - p.x) > 0;
      return v;
    }
    const look = [3, 7, 11][lvl] ?? 7, bx = b.x + b.vx * look, by = b.y + b.vy * look;
    let aimX = opp, aimY = MP.basket ? CY : Math.max(CY - GH + 16, Math.min(CY + GH - 16, by)), pw = 1;
    // quyết định: sút / chuyền / dẫn bóng — giữ quyết định khoảng nửa giây cho khỏi giật cục
    if (mates.length && m.phase === 'play' && myD < 70) {
      if (!p.plan || p.plan.until < m.phaseT) {
        const goalD = Math.hypot(opp - b.x, CY - b.y), pass = pickPass(m, i, dir);
        const shootR = MP.basket ? MP.arc + 20 : [200, 240, 280][lvl] ?? 240;
        const rate = ([0.25, 0.45, 0.6][lvl] ?? 0.45) * (co ? co.pass : 1);
        let plan = { until: m.phaseT + 30 };
        if (goalD < shootR && !(pass && pass.sc > 140 && Math.random() < 0.3)) plan.shoot = true;
        else if (pass && (foeD < 70 || (pass.sc > 60 && Math.random() < rate))) { plan.j = pass.j; plan.until = m.phaseT + 45; }
        p.plan = plan;
      }
      if (p.plan.j != null) {
        const q = m.players[p.plan.j], qx = q.x + q.vx * 6, qy = q.y + q.vy * 6, d = Math.hypot(qx - b.x, qy - b.y);
        aimX = qx; aimY = qy;
        pw = Math.max(2.4, Math.min(MP.kick, d * (1 - MP.bd) * 1.6 + 1.6)) / MP.kick; // chuyền vừa lực, không phá bóng
      }
    } else if (myD >= 70) p.plan = null;
    const gx = aimX - bx, gy = aimY - by, gl = Math.hypot(gx, gy) || 1, ux = gx / gl, uy = gy / gl;
    let tx = bx - ux * (PR + BR - 2), ty = by - uy * (PR + BR - 2);
    const rel = (p.x - bx) * ux + (p.y - by) * uy;
    if (rel > -6) { const sd = (p.x - bx) * -uy + (p.y - by) * ux >= 0 ? 1 : -1; tx = bx - ux * (PR + BR + 14) - uy * sd * (PR + BR + 12); ty = by - uy * (PR + BR + 14) + ux * sd * (PR + BR + 12); }
    if (foeD + 25 < myD && ownHalf && !mates.length) { const t = lvl === 2 ? 0.42 : 0.55; tx = b.x + (own - b.x) * t; ty = b.y + (CY - b.y) * t; }
    const v = go(tx, ty);
    // chạy nước rút khi còn xa bóng; xoạc khi đối thủ đang dẫn bóng ngay trước mặt (máy giỏi xoạc chuẩn hơn, máy dở hay phạm lỗi)
    if (lvl >= 1 && myD > 110 && (p.stam ?? 100) > 45 && m.phase === 'play') v.s = true;
    const carrier = foes.find((f) => !f.out && dist(f) < PR + BR + 8);
    if (carrier && m.phase === 'play' && !(p.tCool > 0) && Math.hypot(carrier.x - p.x, carrier.y - p.y) < 42 && Math.random() < [0.006, 0.009, 0.013][lvl] * (p.slowK ? 0.4 : 1)) { const dx = (lvl === 2 ? b.x : carrier.x) - p.x, dy = (lvl === 2 ? b.y : carrier.y) - p.y, dl = Math.hypot(dx, dy) || 1; v.jx = dx / dl; v.jy = dy / dl; v.t = true; }
    const fx = b.x - p.x, fy = b.y - p.y, fl = Math.hypot(fx, fy) || 1, align = (fx * ux + fy * uy) / fl;
    const passing = p.plan && p.plan.j != null;
    if (passing) { v.k = myD < KICK_RANGE && align > 0.82; v.pw = pw; }
    else v.k = myD < KICK_RANGE && (align > [0.35, 0.55, 0.72][lvl] || (ownHalf && dir * fx > 0)) && Math.random() < [0.3, 0.65, 1][lvl];
    if (MP.basket && v.k && !passing && !ownHalf && Math.hypot(b.x - opp, b.y - CY) > 300) v.k = false; // bóng rổ: xa rổ thì dẫn bóng, lại gần mới ném
    return v;
  }
  // ---------------------------------------------------------------- vẽ
  function draw(c, m, me) {
    c.fillStyle = MP.out; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 10; i++) { c.fillStyle = MP.grass[i % 2]; c.fillRect(L + i * (R - L) / 10, T, (R - L) / 10 + 1, B - T); }
    if (m.map === 'ice') { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; for (let k = 0; k < 14; k++) { c.beginPath(); c.arc(L + ((k * 137) % (R - L)), T + ((k * 71) % (B - T)), 30 + (k % 4) * 12, k, k + 1.2); c.stroke(); } }
    if (m.map === 'beach') { c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(W / 2 + Math.sin(k) * 300, T - 14 + (k % 2) * 4, 60, 4, 0, 0, 7); c.fill(); } }
    c.strokeStyle = MP.line; c.lineWidth = 3;
    c.strokeRect(L, T, R - L, B - T);
    c.beginPath(); c.moveTo(W / 2, T); c.lineTo(W / 2, B); c.stroke();
    c.beginPath(); c.arc(W / 2, CY, MP.circle, 0, Math.PI * 2); c.stroke();
    c.strokeRect(L, CY - MP.box[1], MP.box[0], MP.box[1] * 2); c.strokeRect(R - MP.box[0], CY - MP.box[1], MP.box[0], MP.box[1] * 2);
    if (MP.basket) {
      HOOPS.forEach(([hx, hy], h) => {
        const side = h ? -1 : 1, lim = Math.asin(Math.min(1, (B - T) / 2 / MP.arc - 0.02));
        c.fillStyle = 'rgba(180,60,40,.25)'; c.fillRect(h ? R - MP.box[0] : L, CY - MP.box[1], MP.box[0], MP.box[1] * 2);
        c.strokeStyle = MP.line; c.lineWidth = 3; c.beginPath(); h ? c.arc(hx, hy, MP.arc, Math.PI - lim, Math.PI + lim) : c.arc(hx, hy, MP.arc, -lim, lim); c.stroke();
        c.beginPath(); c.arc(h ? R - MP.box[0] : L + MP.box[0], CY, MP.box[1], 0, Math.PI * 2); c.stroke();
        c.strokeStyle = '#f2f2f2'; c.lineWidth = 5; c.beginPath(); c.moveTo(hx - side * 22, hy - 30); c.lineTo(hx - side * 22, hy + 30); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(hx + k * 5, hy - 12); c.lineTo(hx + k * 3, hy + 12); c.stroke(); }
        c.strokeStyle = '#ff6a00'; c.lineWidth = 4; c.beginPath(); c.arc(hx, hy, 14, 0, Math.PI * 2); c.stroke();
      });
    }
    (MP.deco || []).forEach(([e, x, y]) => { c.font = '26px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y); });
    const net = MP.dark ? 'rgba(30,40,60,.85)' : 'rgba(255,255,255,.9)';
    if (!MP.basket) [[L - GD, 0], [R, 1]].forEach(([gx]) => { c.fillStyle = MP.dark ? 'rgba(30,40,60,.12)' : 'rgba(255,255,255,.12)'; c.fillRect(gx, CY - GH, GD, GH * 2); c.strokeStyle = net; c.lineWidth = 3; c.strokeRect(gx, CY - GH, GD, GH * 2); c.strokeStyle = MP.dark ? 'rgba(30,40,60,.3)' : 'rgba(255,255,255,.25)'; c.lineWidth = 1; for (let k = 6; k < GD; k += 7) { c.beginPath(); c.moveTo(gx + k, CY - GH); c.lineTo(gx + k, CY + GH); c.stroke(); } });
    POSTS.forEach(([x, y]) => { c.fillStyle = MP.dark ? '#26324a' : '#fff'; c.beginPath(); c.arc(x, y, POST_R, 0, Math.PI * 2); c.fill(); });
    if (m.phase !== 'goal') m.cele = null;
    else if (!m.cele && m.lastTouch >= 0 && m.players[m.lastTouch]) m.cele = { who: m.lastTouch, style: CELE[(m.score[0] + m.score[1] + m.lastTouch) % CELE.length].id };
    const cele = m.phase === 'goal' && m.cele ? m.cele : null;
    m.players.forEach((p, i) => {
      if (p.out) return;
      const star = cele && cele.who === i, PRd = star ? PR * (1 + 0.2 * Math.abs(Math.sin(m.phaseT * (cele.style === 'siu' && m.phaseT > 60 ? 0.35 : 0.18)))) : PR;
      if (star) { c.fillStyle = 'rgba(255,210,63,' + (0.25 + 0.2 * Math.sin(m.phaseT * 0.3)) + ')'; c.beginPath(); c.arc(p.x, p.y, PRd + 12, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(p.x + 2, p.y + 3, PRd, 0, Math.PI * 2); c.fill();
      c.fillStyle = COLORS[p.team]; c.beginPath(); c.arc(p.x, p.y, PRd, 0, Math.PI * 2); c.fill();
      c.lineWidth = p.kicking ? 4 : 2.5; c.strokeStyle = p.flash ? '#ffd23f' : p.kicking ? '#fff' : 'rgba(0,0,0,.6)'; c.stroke();
      if (p.charge > 4) { c.lineWidth = 4; c.strokeStyle = p.charge >= 45 ? '#ff5c2b' : '#ffd23f'; c.beginPath(); c.arc(p.x, p.y, PR + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.charge / 45)); c.stroke(); }
      if (i === me) { c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(p.x, p.y, PR + 5, 0, Math.PI * 2); c.stroke();
        // thanh thể lực (chạy nước rút)
        const st = p.stam ?? 100; if (st < 99) { c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(p.x - 16, p.y + PR + 6, 32, 4); c.fillStyle = st > 30 ? '#ffd23f' : '#ff5c2b'; c.fillRect(p.x - 16, p.y + PR + 6, 32 * st / 100, 4); } }
      if (p.slide > 0) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x - p.vx * 6, p.y - p.vy * 6); c.lineTo(p.x, p.y); c.stroke(); }
      if (p.stun > 0) { c.font = '14px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('💫', p.x + Math.sin(m.phaseT * 0.3) * 6, p.y - PR - 2); }
      if (p.card) { c.fillStyle = p.card === 2 ? '#e8231f' : '#ffd23f'; c.fillRect(p.x + PR - 2, p.y - PR - 4, 7, 10); }
      c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(i === me ? '★' : String(p.num), p.x, p.y + 1);
      if (p.name) { c.font = '600 11px sans-serif'; c.fillStyle = MP.dark ? 'rgba(20,30,50,.9)' : 'rgba(255,255,255,.92)'; c.fillText(p.name, p.x, p.y - PR - 9); }
    });
    const b = m.ball;
    if (Math.abs(b.spin) > 0.004) { c.strokeStyle = 'rgba(255,210,63,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, BR + 5, 0, Math.PI * 1.2 * Math.sign(b.spin), b.spin < 0); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(b.x + 2, b.y + 3, BR, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, BR, 0, Math.PI * 2); c.fill(); c.lineWidth = 2; c.strokeStyle = '#111'; c.stroke();
    if (cele && m.players[cele.who]) {
      // pháo giấy bung ra từ người ghi bàn
      const sp = m.players[cele.who], t = m.phaseT, cols = ['#ffd23f', '#ff5c8a', '#4fd1ff', '#7dff7a', '#ffffff', COLORS[sp.team]];
      for (let k = 0; k < 46; k++) { const a = k * 2.399, v = 1.2 + (k % 7) * 0.45, tt = Math.min(t, 90), x = sp.x + Math.cos(a) * v * tt, y = sp.y + Math.sin(a) * v * tt + 0.012 * tt * tt; if (t > 110 && k % 3 === 0) continue; c.save(); c.translate(x, y); c.rotate(t * 0.1 + k); c.fillStyle = cols[k % cols.length]; c.globalAlpha = Math.max(0, 1 - t / 150); c.fillRect(-3, -1.5, 6, 3); c.restore(); }
      const st = CELE.find((x) => x.id === cele.style);
      if (st && t > 20) { c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; const tx = Math.max(130, Math.min(W - 130, sp.x)), ty = Math.max(24, sp.y - PR - 30); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillText(st.text, tx + 1, ty + 1); c.fillStyle = '#ffd23f'; c.fillText(st.text, tx, ty); }
    }
    if (m.phase === 'goal') { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, CY - 50, W, 100); c.fillStyle = '#ffd23f'; c.font = '800 54px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(MP.basket ? 'VÀO RỔ! 🏀 +' + (m.lastPts || 2) : 'VÀOOO! ⚽', W / 2, CY - (m.scorerName ? 12 : 0)); if (m.scorerName) { c.font = '700 20px sans-serif'; c.fillStyle = '#fff'; c.fillText(m.scorerName, W / 2, CY + 30); } }
    if (m.phase === 'setpiece' && m.phaseT < 100) { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, T / 2 - 18, W, 36); c.fillStyle = m.pen ? '#ff8a3d' : '#fff'; c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText((m.pen ? '🚨 PHẠT ĐỀN cho đội ' : '🟨 Phạm lỗi! Đá phạt cho đội ') + NAMES[m.kickoff] + (m.lastCard ? ' · ' + m.lastCard : ''), W / 2, T / 2); }
    if (m.phase === 'kickoff' && m.phaseT < 90) { c.fillStyle = MP.dark ? 'rgba(20,30,50,.9)' : 'rgba(255,255,255,.9)'; c.font = '700 18px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Đội ' + NAMES[m.kickoff] + ' giao bóng', W / 2, T / 2); }
  }
  // ---------------------------------------------------------------- khung giao diện
  let root = null, cv = null, ctx = null, raf = 0, keys = {}, onEnd = null, stopFn = null, touch = { jx: 0, jy: 0, k: false, on: false };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const myName = () => { try { return (cfg.name || KN.store.get('kn_online_name', '') || (KN.Game.hasLife() && KN.Game.view() ? KN.Game.view().name.split(' ').pop() : '') || 'Bạn').slice(0, 14); } catch (e) { return 'Bạn'; } };
  const coarse = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  // cài đặt nhớ giữa các lần chơi
  const CFG_KEY = 'kn_hax_cfg';
  const mapOf = () => (cfg.sport === 'basket' ? 'court' : cfg.map === 'court' ? 'classic' : cfg.map);
  const cfg = Object.assign({ map: 'classic', sport: 'foot', dur: 180, size: 3, lvl: 1, bots: true }, (() => { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch (e) { return {}; } })());
  if (!cfg.v3) { cfg.v3 = 1; if (cfg.size === 1) cfg.size = 3; } // từ bản 1.60: mặc định đá 3v3 tiki-taka
  const saveCfg = () => { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* */ } };
  function open(html) {
    close(true);
    root = document.createElement('div'); root.className = 'hax';
    root.innerHTML = '<div class="hax-box">' + html + '</div>';
    document.body.appendChild(root);
    root.addEventListener('keydown', (e) => e.stopPropagation());
    return root;
  }
  // nhịp đều chạy trong Worker: cửa sổ không được chọn vẫn mô phỏng + gửi phím (requestAnimationFrame thì bị trình duyệt dừng)
  let tickStop = null, keyHook = null;
  function ticker(hz, fn) {
    stopTicker();
    let w = null, id = 0;
    try {
      const src = 'let t=0;onmessage=(e)=>{clearInterval(t);if(e.data>0)t=setInterval(()=>postMessage(0),e.data)}';
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      w = new Worker(url); URL.revokeObjectURL(url); w.onmessage = fn; w.postMessage(1000 / hz);
    } catch (e) { w = null; id = setInterval(fn, 1000 / hz); }
    tickStop = () => { if (w) w.terminate(); clearInterval(id); };
  }
  function stopTicker() { if (tickStop) { tickStop(); tickStop = null; } }
  function close(silent) {
    cancelAnimationFrame(raf); raf = 0; stopTicker(); keyHook = null;
    window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true);
    if (stopFn) { try { stopFn(); } catch (e) { /* */ } stopFn = null; }
    if (root) { root.remove(); root = null; }
    if (!silent && onEnd) { const f = onEnd; onEnd = null; f(null); }
  }
  const GAME_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'x', 'enter', '/', '0', 'shift', 'control', 'q', 'e', 'c', '.', ',', 'm'];
  function onKey(e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const k = (e.key || '').toLowerCase();
    if (!GAME_KEYS.includes(k) && k !== 'escape') return;
    e.preventDefault(); e.stopPropagation();
    if (k === 'escape') { if (e.type === 'keydown' && !onEnd && !onlineActive) menu(); return; }
    const v = e.type === 'keydown';
    if (keys[k] === v) return;
    keys[k + (e.location === 2 ? 'R' : e.location === 1 ? 'L' : '')] = keys[k] = v;
    if (keyHook) keyHook();
  }
  function bindKeys() { keys = {}; touch = { jx: 0, jy: 0, k: false, on: false }; window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true); bindTouch(); }
  const in1 = () => vecOf({ u: keys.w, d: keys.s, l: keys.a, r: keys.d, k: keys[' '] || keys.x, s: keys.shiftL || keys.q, t: keys.e || keys.c });
  const in2 = () => vecOf({ u: keys.arrowup, d: keys.arrowdown, l: keys.arrowleft, r: keys.arrowright, k: keys.enter || keys['/'] || keys['0'] || keys.shiftR || keys.control, s: keys['.'], t: keys[','] || keys.m });
  const inAny = () => {
    if (touch.on && (touch.jx || touch.jy || touch.k)) return vecOf({ jx: touch.jx, jy: touch.jy, k: touch.k });
    return vecOf({ u: keys.w || keys.arrowup, d: keys.s || keys.arrowdown, l: keys.a || keys.arrowleft, r: keys.d || keys.arrowright, k: keys[' '] || keys.x || keys.enter || touch.k, s: keys.shift || keys.q, t: keys.e || keys.c });
  };
  function pitchHtml(title) {
    return '<div class="hax-top"><span class="hax-t red" id="hxS0">0</span><span class="hax-mid"><b id="hxClock">3:00</b><small id="hxInfo">' + esc(title || '') + '</small></span><span class="hax-t blue" id="hxS1">0</span></div>' +
      '<div class="hax-field"><canvas id="hxCv" width="' + W + '" height="' + H + '"></canvas>' + (coarse() ? '<div class="hax-joy" id="hxJoy"><i></i></div><button type="button" class="hax-kick" id="hxKick">SÚT</button>' : '') + '</div>' +
      '<div class="hax-foot"><small id="hxHint"></small><button type="button" class="btn btn-ghost btn-sm" id="hxQuit">✖ Thoát</button></div>';
  }
  function bindTouch() {
    const joy = document.getElementById('hxJoy'), kick = document.getElementById('hxKick'); if (!joy) return;
    const knob = joy.querySelector('i');
    const mv = (e) => { const r = joy.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; let x = (t.clientX - r.left - r.width / 2) / (r.width / 2), y = (t.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } touch.jx = x; touch.jy = y; touch.on = true; knob.style.transform = 'translate(' + x * 28 + 'px,' + y * 28 + 'px)'; e.preventDefault(); if (keyHook) keyHook(); };
    const up = () => { touch.jx = touch.jy = 0; knob.style.transform = ''; if (keyHook) keyHook(); };
    joy.addEventListener('touchstart', mv, { passive: false }); joy.addEventListener('touchmove', mv, { passive: false }); joy.addEventListener('touchend', up);
    kick.addEventListener('touchstart', (e) => { touch.k = true; touch.on = true; e.preventDefault(); if (keyHook) keyHook(); }, { passive: false }); kick.addEventListener('touchend', () => { touch.k = false; if (keyHook) keyHook(); });
  }
  function hud(m) {
    const s0 = document.getElementById('hxS0'); if (!s0) return;
    s0.textContent = m.score[0]; document.getElementById('hxS1').textContent = m.score[1];
    const left = Math.max(0, m.dur - m.time), mm = Math.floor(left / 60), ss = Math.floor(left % 60);
    document.getElementById('hxClock').textContent = m.golden ? '⚡ Bàn thắng vàng' : mm + ':' + String(ss).padStart(2, '0');
  }
  function playEvents(m) { while (m.events.length) { const e = m.events.shift(); if (e.t === 'goal') sfx('cheer'); else if (e.t === 'kick') sfx('click'); else if (e.t === 'foul') sfx(e.card ? 'bad' : 'notify'); else if (e.t === 'slide') sfx('whoosh'); else if (e.t === 'power') sfx('whoosh'); else if (e.t === 'golden') sfx('notify'); } }
  const KEYS_HINT = (sk) => (coarse() ? 'Gạt cần để chạy, bấm SÚT khi bóng sát người' : 'WASD / ↑↓←→ chạy · Space / X sút · Shift chạy nước rút · E xoạc bóng') + ((!sk || sk.charge) ? ' · giữ sút trước khi chạm bóng = sút mạnh' : '') + ((!sk || sk.curve) ? ' · chạy ngang khi sút = sút xoáy' : '');
  // ---------------------------------------------------------------- vòng lặp ván đấu do máy này điều khiển (máy / 2 người / chủ phòng online)
  function runLocal(m, getInputs, opts) {
    opts = opts || {};
    cv = document.getElementById('hxCv'); ctx = cv.getContext('2d');
    bindKeys();
    document.getElementById('hxQuit').onclick = () => { if (opts.onQuit) opts.onQuit(); else menu(); };
    let acc = 0, last = performance.now(), over = false;
    const sim = () => {
      if (over) return;
      const now = performance.now(), dt = Math.min(0.25, (now - last) / 1000); last = now; acc += dt * (opts.speed ? opts.speed() : 1);
      let n = 0;
      while (acc >= 1 / 60 && n < 3000 && m.phase !== 'end') { step(m, getInputs(m)); acc -= 1 / 60; n++; }
      if (n && opts.broadcast) opts.broadcast(m);
      if (m.phase === 'end') { over = true; draw(ctx, m, opts.me ?? 0); hud(m); finish(m, opts); }
    };
    ticker(60, sim);
    const loop = () => { if (over) return; playEvents(m); draw(ctx, m, opts.me ?? 0); hud(m); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }
  function overlay(html) {
    const box = root && root.querySelector('.hax-field'); if (!box) return null;
    const old = box.querySelector('.hax-over'); if (old) old.remove();
    const ov = document.createElement('div'); ov.className = 'hax-over'; ov.innerHTML = html; box.appendChild(ov); return ov;
  }
  function finish(m, opts) {
    cancelAnimationFrame(raf); raf = 0; stopTicker();
    const myTeam = opts.myTeam || 0, mine = m.score[myTeam], theirs = m.score[1 - myTeam];
    const res = mine > theirs ? 'win' : mine < theirs ? 'lose' : 'draw';
    sfx(res === 'win' ? 'cheer' : res === 'lose' ? 'bad' : 'notify');
    if (opts.broadcastEnd) opts.broadcastEnd(m);
    if (opts.cupEnd) { if (res === 'win') (KN.Weekly && KN.Weekly.track('haxwin')); opts.cupEnd(mine, theirs, m.goalsBy[opts.me ?? 0] || 0); return; }
    if (opts.career) { const f = onEnd; onEnd = null; close(true); const myG = m.goalsBy[opts.me ?? 0] || 0; f && f({ score: Math.max(0, Math.min(1, (mine - theirs + 2) / 4)), text: 'Tỷ số ' + mine + ' – ' + theirs + (res === 'win' ? ': bạn thắng!' : res === 'lose' ? ': bạn thua.' : ': hoà.') + (myG ? ' Bạn ghi ' + myG + ' bàn.' : ''), gf: mine, ga: theirs, myGoals: myG }); return; }
    const title = opts.local2 ? (m.score[0] === m.score[1] ? 'Hoà!' : 'Đội ' + NAMES[m.score[0] > m.score[1] ? 0 : 1] + ' thắng!') : res === 'win' ? '🏆 Đội bạn thắng!' : res === 'lose' ? '😭 Đội bạn thua' : '🤝 Hoà';
    const ov = overlay('<b>' + title + '</b><span>' + m.score[0] + ' – ' + m.score[1] + '</span><div class="btnrow">' + (opts.againLabel === null ? '<small>⏳ Chờ chủ phòng bắt đầu ván mới…</small>' : '<button type="button" class="btn btn-primary" id="hxAgain">' + (opts.againLabel || '↻ Đá lại') + '</button>') + '<button type="button" class="btn btn-ghost" id="hxMenu">' + (opts.online ? 'Rời phòng' : 'Menu') + '</button></div>');
    if (!ov) return;
    const ag = document.getElementById('hxAgain'); if (ag) ag.onclick = () => (opts.again ? opts.again() : menu());
    document.getElementById('hxMenu').onclick = () => menu();
    if (res === 'win' && !opts.local2) (KN.Weekly && KN.Weekly.track('haxwin'));
    try { if (!opts.local2 && KN.Game && KN.Game.hasLife() && !KN.Game.isDead() && KN.Game.remoteEffect && res === 'win' && opts.online) KN.Game.remoteEffect({ happy: 3 }, '⚽ Bạn thắng một trận Bóng đá Hax online ' + mine + '–' + theirs + '.', '⚽'); } catch (e) { /* */ }
  }
  // ---------------------------------------------------------------- chế độ chơi trên một máy
  // đội hình: đội Đỏ có bạn + đồng đội máy, đội Xanh toàn máy
  function playAI() {
    const n = cfg.size, lvl = cfg.lvl, roster = [{ team: 0, name: myName() }], owners = ['me'];
    for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Đồng đội' }); owners.push(1); }
    for (let i = 0; i < n; i++) { roster.push({ team: 1, name: n > 1 ? 'Máy ' + (i + 1) : 'Máy' }); owners.push(lvl); }
    const m = newMatch({ dur: cfg.dur, map: mapOf(), roster }); m.players[0].human = true;
    open(pitchHtml('Đấu với máy · ' + n + 'v' + n + ' · ' + ['Dễ', 'Thường', 'Khó'][lvl] + ' · ' + MP.icon + ' ' + MP.name));
    document.getElementById('hxHint').textContent = KEYS_HINT() + ' · Esc: menu';
    runLocal(m, (mm) => owners.map((o, i) => (o === 'me' ? inAny() : aiInput(mm, i, o))), { again: playAI });
  }
  // ---------------------------------------------------------------- CÁC GIẢI HAX: Cúp Hax · Cúp Mùa Đông · Cúp Biển Xanh (8 đội, loại trực tiếp) · Giải Vô Địch (16 đội: vòng bảng rồi loại trực tiếp)
  const CUP_TEAMS = ['FC Sông Hàn', 'Hà Thành United', 'Sài Gòn Star', 'Hải Phòng Port', 'Huế Royal', 'Cần Thơ Mekong', 'Đà Lạt Pine', 'Quy Nhơn Wave', 'Vinh Phoenix', 'Nha Trang Coral', 'Thái Bình Rice', 'Hạ Long Bay FC', 'Biên Hoà Rồng Vàng', 'Phú Quốc Pearl', 'Buôn Ma Thuột Cà Phê', 'Cà Mau Sấu', 'Lạng Sơn Hổ', 'Hội An Lantern', 'Bình Dương Gỗ', 'Pleiku Gió Núi', 'Đồng Tháp Sen', 'Sa Pa Sương Mù', 'Vũng Tàu Hải Âu', 'Thanh Hoá Voi'];
  const ROUND = ['Tứ kết', 'Bán kết', 'Chung kết'];
  const CUPS = {
    classic: { name: 'Cúp Hax', icon: '🏆', desc: '8 đội, đấu loại trực tiếp (tứ kết, bán kết, chung kết)', key: 'kn_hax_cup', map: null, mult: 1, prizes: [0, 3e6, 8e6, 2e7] },
    ice: { name: 'Cúp Mùa Đông', icon: '🧊', desc: '8 đội, thi đấu trên sân băng trơn trượt · thưởng ×1,5', key: 'kn_hax_cup_ice', map: 'ice', mult: 1.5, prizes: [0, 3e6, 8e6, 2e7] },
    beach: { name: 'Cúp Biển Xanh', icon: '🏖️', desc: '8 đội, thi đấu trên bãi cát nặng chân · thưởng ×1,5', key: 'kn_hax_cup_beach', map: 'beach', mult: 1.5, prizes: [0, 3e6, 8e6, 2e7] },
    champ: { name: 'Giải Vô Địch Hax', icon: '🌏', desc: '16 đội: vòng bảng 4 bảng (đá vòng tròn, hoà được) lấy nhất nhì vào tứ kết · thưởng lớn nhất', key: 'kn_hax_cup_champ', map: null, mult: 1, groups: true, prizes: [0, 4e6, 8e6, 15e6, 4e7] },
  };
  const FIX = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]]; // 3 lượt vòng bảng: ai cũng gặp 3 đối thủ cùng bảng
  const GROUP = ['A', 'B', 'C', 'D'];
  const shuf = (a) => a.sort(() => Math.random() - 0.5);
  const cupLoad = (type) => { try { return JSON.parse(localStorage.getItem(CUPS[type].key) || 'null'); } catch (e) { return null; } };
  const cupSave = (c) => { try { localStorage.setItem(CUPS[c.type].key, JSON.stringify(c)); } catch (e) { /* */ } };
  function cupNew(type, prev) {
    const T = CUPS[type], n = T.groups ? 16 : 8;
    const names = shuf(CUP_TEAMS.slice()).slice(0, n - 1);
    const teams = [{ name: (cfg.name ? 'Đội của ' + cfg.name : 'Đội của bạn').slice(0, 22), me: true }].concat(names.map((nm) => ({ name: nm, str: Math.random() })));
    const order = shuf(teams.map((t, i) => i));
    const c = { type, season: prev ? prev.season + 1 : 1, titles: prev ? prev.titles || 0 : 0, teams, scores: [[], [], []], round: 0, out: false, champ: null, size: cfg.size, map: T.map || mapOf(), rounds: [null, null, null] };
    if (T.groups) { c.stage = 'group'; c.md = 0; c.groups = [0, 1, 2, 3].map((g) => order.slice(g * 4, g * 4 + 4)); c.res = c.groups.map(() => [[null, null], [null, null], [null, null]]); } else { c.stage = 'ko'; c.rounds[0] = order; }
    return c;
  }
  // trận giữa hai đội máy: đội mạnh hơn dễ thắng hơn (hoà = bàn thắng vàng khi loại trực tiếp)
  function simMatch(c, a, b, draw) {
    const sa = c.teams[a].str, sb = c.teams[b].str; let ga = 0, gb = 0;
    for (let i = 0; i < 6; i++) { if (Math.random() < 0.25 + sa * 0.25) ga++; if (Math.random() < 0.25 + sb * 0.25) gb++; }
    if (ga === gb && !draw) { if (Math.random() < 0.5 + (sa - sb) * 0.3) ga++; else gb++; }
    return [ga, gb];
  }
  // bảng xếp hạng một bảng: điểm → hiệu số → bàn thắng → ngẫu nhiên
  function groupTable(c, g) {
    const rows = c.groups[g].map((t) => ({ t, p: 0, pts: 0, gf: 0, ga: 0 }));
    for (let md = 0; md < 3; md++) FIX[md].forEach((f, m) => { const r = c.res[g][md][m]; if (!r) return; const A = rows[f[0]], B = rows[f[1]]; A.p++; B.p++; A.gf += r[0]; A.ga += r[1]; B.gf += r[1]; B.ga += r[0]; if (r[0] > r[1]) A.pts += 3; else if (r[0] < r[1]) B.pts += 3; else { A.pts++; B.pts++; } });
    return rows.sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || (x.t === 0 ? -1 : 0) || Math.random() - 0.5);
  }
  function simRest(c) { // bị loại: đá nốt các vòng loại trực tiếp (máy với máy) để biết nhà vô địch
    while (c.round <= 2) { const l = c.rounds[c.round], s2 = c.scores[c.round], nx = []; for (let k = 0; k < l.length; k += 2) { const g = simMatch(c, l[k], l[k + 1]); s2[k / 2] = g; nx.push(g[0] > g[1] ? l[k] : l[k + 1]); } if (c.round < 2) { c.rounds[c.round + 1] = nx; c.round++; } else { c.champ = nx[0]; c.round = 3; } }
  }
  function groupAdvance(c, myGf, myGa) {
    const md = c.md;
    c.groups.forEach((grp, g) => FIX[md].forEach((f, m) => { const a = grp[f[0]], b = grp[f[1]]; c.res[g][md][m] = c.teams[a].me ? [myGf, myGa] : c.teams[b].me ? [myGa, myGf] : simMatch(c, a, b, true); }));
    c.md++;
    if (c.md >= 3) { // hết vòng bảng: nhất nhì mỗi bảng vào tứ kết, nhất bảng này gặp nhì bảng kia
      const top = c.groups.map((_, g) => groupTable(c, g).slice(0, 2).map((r) => r.t));
      c.rounds[0] = [top[0][0], top[1][1], top[2][0], top[3][1], top[1][0], top[0][1], top[3][0], top[2][1]];
      c.stage = 'ko'; c.round = 0;
      if (!c.rounds[0].some((t) => c.teams[t].me)) { c.out = true; simRest(c); }
    }
    cupSave(c);
  }
  function cupAdvance(c, myGf, myGa) {
    if (c.stage === 'group') return groupAdvance(c, myGf, myGa);
    const list = c.rounds[c.round], sc = c.scores[c.round], next = [];
    for (let k = 0; k < list.length; k += 2) {
      const a = list[k], b = list[k + 1];
      const g = c.teams[a].me ? [myGf, myGa] : c.teams[b].me ? [myGa, myGf] : simMatch(c, a, b);
      sc[k / 2] = g; next.push(g[0] > g[1] ? a : b);
    }
    if (!next.some((t) => c.teams[t].me)) c.out = true;
    if (c.round < 2) { c.rounds[c.round + 1] = next; c.round++; } else { c.champ = next[0]; c.round = 3; }
    if (c.champ != null && c.teams[c.champ].me) { c.titles = (c.titles || 0) + 1; (KN.Weekly && KN.Weekly.track('cup')); }
    if (c.out && c.round <= 2) simRest(c);
    cupSave(c);
  }
  // mức đi tới: 0 = dừng ở vòng bảng/tứ kết (cúp 8 đội), tăng dần theo vòng
  function cupReached(c) {
    const T = CUPS[c.type], mine = (r) => c.rounds[r] && c.rounds[r].some((t) => c.teams[t].me), champ = c.champ != null && c.teams[c.champ].me;
    if (T.groups) return champ ? 4 : mine(2) ? 3 : mine(1) ? 2 : mine(0) ? 1 : 0;
    return champ ? 3 : mine(2) ? 2 : mine(1) ? 1 : 0;
  }
  function cupReward(c) {
    const T = CUPS[c.type], reached = cupReached(c), top = T.groups ? 4 : 3;
    if (c.rewarded || !reached) return '';
    c.rewarded = true; cupSave(c);
    const money = Math.round(T.prizes[reached] * T.mult * (KN.Weekly && KN.Weekly.bonus('hax') ? 2 : 1));
    try { if (KN.Game && KN.Game.hasLife() && !KN.Game.isDead() && KN.Game.remoteEffect) { KN.Game.remoteEffect({ happy: reached === top ? 5 : 2, money }, reached === top ? '🏆 Bạn cùng đồng đội vô địch ' + T.name + ' mùa ' + c.season + '! Tiền thưởng ' + Math.round(money / 1e6) + ' triệu.' : '⚽ Đội bạn đi tới ' + (T.groups ? ['', 'tứ kết', 'bán kết', 'chung kết'][reached] : ['', 'bán kết', 'chung kết'][reached]) + ' ' + T.name + ' mùa ' + c.season + ', thưởng ' + Math.round(money / 1e6) + ' triệu.', '⚽'); } } catch (e) { /* */ }
    return ' 💰 Thưởng ' + Math.round(money / 1e6) + ' triệu.';
  }
  // chọn giải
  function cupMenu() {
    const rows = Object.keys(CUPS).map((k) => { const T = CUPS[k], c = cupLoad(k), st = !c ? 'Mùa 1' : c.round > 2 ? 'Mùa ' + c.season + ' đã xong' : 'Mùa ' + c.season + ' đang đá' + (c.stage === 'group' ? ' · vòng bảng lượt ' + (c.md + 1) + '/3' : ' · ' + ROUND[c.round].toLowerCase()); return '<button type="button" class="btn btn-soft cup-pick" data-cup="' + k + '"><b>' + T.icon + ' ' + T.name + '</b><small>' + T.desc + '</small><em>' + st + (c && c.titles ? ' · 🏆×' + c.titles : '') + '</em></button>'; }).join('');
    open('<div class="hax-lobby"><h3>🏆 Các giải đấu Hax</h3><p class="sub">Chọn một giải. Mỗi giải lưu tiến độ riêng, đội máy mạnh dần theo vòng.</p><div class="hax-menu">' + rows + '</div><div class="btnrow"><button type="button" class="btn btn-ghost" id="cupBack">← Menu</button></div></div>');
    document.getElementById('cupBack').onclick = () => menu();
    root.querySelectorAll('[data-cup]').forEach((b) => (b.onclick = () => cupScreen(b.dataset.cup)));
  }
  function cupScreen(type) {
    if (!CUPS[type]) return cupMenu();
    const T = CUPS[type];
    let c = cupLoad(type); if (!c || (c.round > 2 && c.viewed)) c = cupNew(type, c);
    cupSave(c);
    const tn = (i) => '<span class="' + (c.teams[i].me ? 'cup-me' : '') + '">' + esc(c.teams[i].name) + '</span>';
    const col = (r) => { const l = c.rounds[r]; if (!l) return '<div class="cup-col"><b>' + ROUND[r] + '</b><div class="cup-m p-sub">Chờ…</div></div>'; let h = '<div class="cup-col"><b>' + ROUND[r] + '</b>'; for (let k = 0; k < l.length; k += 2) { const g = c.scores[r][k / 2]; h += '<div class="cup-m">' + tn(l[k]) + (g ? ' <b>' + g[0] + '</b>' : '') + '<br>' + tn(l[k + 1]) + (g ? ' <b>' + g[1] + '</b>' : '') + '</div>'; } return h + '</div>'; };
    // bảng vòng bảng (chỉ giải 16 đội)
    const groupsHtml = T.groups ? '<div class="cup-groups">' + c.groups.map((grp, g) => { const rows = groupTable(c, g); return '<div class="cup-g"><b>Bảng ' + GROUP[g] + '</b><table><tr><th></th><th>Tr</th><th>Đ</th><th>HS</th></tr>' + rows.map((r, i) => '<tr class="' + (i < 2 && c.md >= 3 ? 'adv' : '') + '"><td>' + tn(r.t) + '</td><td>' + r.p + '</td><td><b>' + r.pts + '</b></td><td>' + (r.gf - r.ga > 0 ? '+' : '') + (r.gf - r.ga) + '</td></tr>').join('') + '</table></div>'; }).join('') + '</div>' : '';
    let msg = '', btn = '';
    const top = T.groups ? 4 : 3;
    if (c.round > 2) {
      const meChamp = c.teams[c.champ].me; c.viewed = true;
      msg = meChamp ? '<div class="cup-trophy">🏆</div><h3>VÔ ĐỊCH ' + T.name + ' mùa ' + c.season + '!</h3><p class="sub">Danh hiệu thứ ' + c.titles + ' của bạn.' + cupReward(c) + '</p>' : '<p class="sub">😢 Đội bạn đã bị loại' + (T.groups && cupReached(c) === 0 ? ' ngay từ vòng bảng' : '') + '. Nhà vô địch mùa ' + c.season + ': <b>' + esc(c.teams[c.champ].name) + '</b>.' + cupReward(c) + '</p>';
      btn = '<button type="button" class="btn btn-primary" id="cupNew">🔁 Mùa giải mới</button>';
      cupSave(c);
    } else if (c.stage === 'group') {
      const g = c.groups.findIndex((grp) => grp.includes(0)), grp = c.groups[g], mi = grp.indexOf(0), f = FIX[c.md].find((x) => x.includes(mi)), foe = c.teams[grp[f[0] === mi ? f[1] : f[0]]];
      msg = '<p class="sub">Mùa ' + c.season + (c.titles ? ' · 🏆×' + c.titles : '') + ' · ' + c.size + 'v' + c.size + ' · <b>Vòng bảng ' + GROUP[g] + '</b> lượt ' + (c.md + 1) + '/3 · Gặp <b>' + esc(foe.name) + '</b> (máy ' + ['Dễ', 'Thường', 'Khó'][Math.min(2, c.md)] + '). Thắng 3 điểm, hoà 1 điểm (không có bàn thắng vàng), nhất nhì bảng vào tứ kết.</p>';
      btn = '<button type="button" class="btn btn-primary" id="cupPlay">▶ Đá lượt ' + (c.md + 1) + '</button><button type="button" class="btn btn-ghost" id="cupReset">Bỏ mùa này</button>';
    } else {
      const l = c.rounds[c.round], k = l.findIndex((t) => c.teams[t].me), foe = l[k % 2 ? k - 1 : k + 1];
      msg = '<p class="sub">Mùa ' + c.season + (c.titles ? ' · 🏆×' + c.titles : '') + ' · ' + c.size + 'v' + c.size + ' · Đối thủ ' + ROUND[c.round].toLowerCase() + ': <b>' + esc(c.teams[foe].name) + '</b> (máy ' + ['Dễ', 'Thường', 'Khó'][Math.min(2, c.round + (T.groups ? 1 : 0))] + '). Hoà hết giờ thì đá bàn thắng vàng.</p>';
      btn = '<button type="button" class="btn btn-primary" id="cupPlay">▶ Đá ' + ROUND[c.round] + '</button><button type="button" class="btn btn-ghost" id="cupReset">Bỏ mùa này</button>';
    }
    const pr = T.prizes.map((v) => Math.round(v * T.mult / 1e6));
    const prizeTxt = T.groups ? 'vào tứ kết ' + pr[1] + ' triệu · bán kết ' + pr[2] + ' · chung kết ' + pr[3] + ' · vô địch ' + pr[4] : 'vào bán kết ' + pr[1] + ' triệu · vào chung kết ' + pr[2] + ' · vô địch ' + pr[3];
    open('<div class="hax-lobby"><h3>' + T.icon + ' ' + T.name + '</h3>' + msg + groupsHtml + '<div class="cup-br">' + col(0) + col(1) + col(2) + '</div><p class="p-sub">Thưởng (nếu đang sống một cuộc đời): ' + prizeTxt + '.</p><div class="btnrow">' + btn + '<button type="button" class="btn btn-ghost" id="cupBack">← Các giải</button></div></div>');
    void top;
    document.getElementById('cupBack').onclick = () => cupMenu();
    const nb = document.getElementById('cupNew'); if (nb) nb.onclick = () => { cupSave(cupNew(type, c)); cupScreen(type); };
    const rb = document.getElementById('cupReset'); if (rb) rb.onclick = () => { cupSave(cupNew(type, c)); cupScreen(type); };
    const pb = document.getElementById('cupPlay'); if (pb) pb.onclick = () => cupPlay(c);
  }
  function cupPlay(c) {
    let foe, label, lvl, noGolden = false;
    if (c.stage === 'group') {
      const grp = c.groups.find((x) => x.includes(0)), mi = grp.indexOf(0), f = FIX[c.md].find((x) => x.includes(mi));
      foe = c.teams[grp[f[0] === mi ? f[1] : f[0]]]; label = 'Vòng bảng · lượt ' + (c.md + 1); lvl = Math.min(2, c.md); noGolden = true;
    } else {
      const l = c.rounds[c.round], k = l.findIndex((t) => c.teams[t].me); foe = c.teams[l[k % 2 ? k - 1 : k + 1]]; label = ROUND[c.round]; lvl = Math.min(2, c.round + (CUPS[c.type].groups ? 1 : 0));
    }
    const n = c.size || 3, roster = [{ team: 0, name: myName() }], owners = ['me'];
    for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Đồng đội' }); owners.push(1); }
    for (let i = 0; i < n; i++) { roster.push({ team: 1, name: foe.name.split(' ').pop() }); owners.push(lvl); }
    const m = newMatch({ dur: 120, map: c.map || 'classic', roster, noGolden }); m.players[0].human = true;
    open(pitchHtml(CUPS[c.type].icon + ' ' + label + ' · ' + foe.name + ' · ' + MP.icon + ' ' + MP.name));
    document.getElementById('hxHint').textContent = KEYS_HINT() + ' · Esc: menu';
    runLocal(m, (mm) => owners.map((o, i) => (o === 'me' ? inAny() : aiInput(mm, i, o))), { cupEnd: (gf, ga) => { cupAdvance(c, gf, ga); setTimeout(() => cupScreen(c.type), 1200); }, onQuit: () => cupScreen(c.type) });
  }
  // 📋 HLV XEM TRẬN: 2 đội toàn máy (4 đấu 4), sức mạnh từng cầu thủ theo chỉ số; HLV chỉ đạo dâng/lùi, lối chơi, tua nhanh hoặc xem luôn kết quả
  function watch(o) {
    return new Promise((res) => {
      const ros = [], owners = [], meta = [];
      [o.home, o.away].forEach((t, ti) => t.players.forEach((pl) => { ros.push({ team: ti, name: String(pl.name || '').split(' ').pop().slice(0, 10) }); owners.push(pl.ovr >= 72 ? 2 : pl.ovr >= 56 ? 1 : 0); meta.push(pl); }));
      const m = newMatch({ dur: o.dur || 90, map: o.map || 'classic', roster: ros });
      m.players.forEach((P, i) => { P.slowK = Math.max(0.7, Math.min(1.12, 0.72 + (meta[i].ovr - 45) / 110)); P.role = meta[i].role || null; });
      const myTeam = o.coachTeam || 0;
      m.coach = { team: myTeam, line: 0, pass: 1 };
      let speed = 1;
      open(pitchHtml('📋 ' + o.home.name + ' – ' + o.away.name + (o.title ? ' · ' + o.title : '')));
      document.getElementById('hxHint').textContent = 'Bạn là HLV (đội ' + NAMES[myTeam] + '): chỉ đạo bằng các nút bên dưới.';
      const bar = document.createElement('div'); bar.className = 'hax-coach';
      bar.innerHTML = '<button type="button" data-c="up">⬆️ Dâng cao</button><button type="button" data-c="mid" class="on">⏺️ Giữ vị trí</button><button type="button" data-c="down">⬇️ Lùi sâu</button><span></span><button type="button" data-c="pass">🎯 Chuyền ngắn</button><button type="button" data-c="direct">⚡ Đánh nhanh</button><span></span><button type="button" data-c="fast">⏩ Tua ×4</button><button type="button" data-c="skip">⏭️ Xem kết quả</button>';
      document.querySelector('.hax-foot').before(bar);
      bar.querySelectorAll('button').forEach((b) => (b.onclick = () => {
        const c = b.dataset.c; sfx('click');
        if (c === 'up' || c === 'mid' || c === 'down') { m.coach.line = c === 'up' ? 1 : c === 'down' ? -1 : 0; bar.querySelectorAll('[data-c="up"],[data-c="mid"],[data-c="down"]').forEach((x) => x.classList.toggle('on', x === b)); }
        else if (c === 'pass' || c === 'direct') { const on = !b.classList.contains('on'); bar.querySelectorAll('[data-c="pass"],[data-c="direct"]').forEach((x) => x.classList.remove('on')); if (on) b.classList.add('on'); m.coach.pass = on ? (c === 'pass' ? 1.7 : 0.3) : 1; }
        else if (c === 'fast') { speed = speed === 4 ? 1 : 4; b.classList.toggle('on', speed === 4); }
        else if (c === 'skip') speed = 400;
      }));
      runLocal(m, (mm) => owners.map((lv, i) => aiInput(mm, i, lv)), {
        me: -1, myTeam, speed: () => speed,
        cupEnd: (gf, ga) => { const sc = []; Object.keys(m.goalsBy).forEach((i) => { const pl = meta[+i]; if (pl && m.players[+i].team === myTeam) sc.push({ id: pl.id, name: pl.name, n: m.goalsBy[i] }); }); setTimeout(() => { close(true); res({ gf, ga, scorers: sc }); }, speed > 4 ? 50 : 1800); },
        onQuit: () => { speed = 400; },
      });
    });
  }
  function playLocal2() {
    const n = cfg.size, roster = [{ team: 0, name: 'Đỏ' }, { team: 1, name: 'Xanh' }], owners = ['p1', 'p2'];
    for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Máy' }, { team: 1, name: 'Máy' }); owners.push(1, 1); }
    const m = newMatch({ dur: cfg.dur, map: mapOf(), roster });
    open(pitchHtml('2 người 1 máy · ' + n + 'v' + n + ' · ' + MP.icon + ' ' + MP.name));
    document.getElementById('hxHint').textContent = 'Đỏ: WASD + Space · Q chạy nhanh · E xoạc — Xanh: ↑↓←→ + Enter · . chạy nhanh · , xoạc';
    runLocal(m, (mm) => owners.map((o, i) => (o === 'p1' ? in1() : o === 'p2' ? in2() : aiInput(mm, i, o))), { local2: true, again: playLocal2 });
  }
  // dùng trong cuộc đời: trận đấu của cầu thủ (đấu với máy 60 giây) — trả về { score 0..1, text }
  function playCareer(opts) {
    opts = opts || {};
    return new Promise((res) => {
      onEnd = res;
      // trận trong cuộc đời dễ hơn Haxball thường: đối thủ tối đa mức Thường và chạy chậm hơn, bạn được hỗ trợ sút
      const lvl = opts.need > 0.6 ? 1 : 0;
      // trận lớn có đồng đội máy đá cùng; đối thủ đông bằng
      const sk = opts.skills || { charge: true, curve: true };
      const n = Math.max(1, Math.min(4, opts.size || 1)), roster = [{ team: 0, name: myName(), sk }], owners = ['me'];
      for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Đồng đội' }); owners.push(1); }
      for (let i = 0; i < n; i++) { roster.push({ team: 1, name: opts.foe || 'Đối thủ' }); owners.push(lvl); }
      const m = newMatch({ dur: opts.dur || 60, map: opts.map || 'classic', roster }); m.players[0].human = true; m.players[0].assist = true;
      m.players.forEach((q) => { if (q.team === 1) q.slowK = opts.need > 0.6 ? 0.85 : 0.75; });
      open(pitchHtml((opts.title || 'Trận đấu') + ' · ' + n + 'v' + n + ' · ' + MP.icon + ' ' + MP.name));
      document.getElementById('hxHint').textContent = KEYS_HINT(sk) + ' · Trận đấu ' + (opts.dur || 60) + ' giây · bạn là ★';
      runLocal(m, (mm) => owners.map((o, i) => (o === 'me' ? inAny() : aiInput(mm, i, o))), { career: true, onQuit: () => { const f = onEnd; onEnd = null; close(true); f && f({ score: 0, text: 'Bạn bỏ dở trận đấu.' }); } });
    });
  }
  // ---------------------------------------------------------------- ONLINE (WebRTC, nhiều người)
  const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }] };
  // máy chủ chuyển tiếp TURN (qua cổng 443) cho mạng trường / công ty chặn kết nối trực tiếp — lấy từ /api/turn, nhớ 30 phút
  let iceCache = null;
  function getIce() {
    if (iceCache && Date.now() - iceCache.at < 1800e3) return iceCache.p;
    const p = Promise.race([fetch('/api/turn', { cache: 'no-store' }).then((r) => r.json()), wait(3500).then(() => ({}))])
      .then((j) => { const extra = Array.isArray(j && j.iceServers) ? j.iceServers : []; if (!extra.length) iceCache = null; return { iceServers: ICE.iceServers.concat(extra) }; })
      .catch(() => { iceCache = null; return ICE; });
    iceCache = { at: Date.now(), p };
    return p;
  }
  const MAX_PLAYERS = 8;
  let onlineActive = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function iceDone(pc) { return new Promise((res) => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 5000); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); }); }
  async function api(url, body) { const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error({ notfound: 'Không tìm thấy phòng (mã sai hoặc đã hết hạn)', full: 'Phòng đang đông người chờ vào, thử lại sau', 'slow-down': 'Thao tác nhanh quá, thử lại sau', 'not-configured': 'Máy chủ chưa sẵn sàng' }[j.error] || 'Lỗi mạng'); return j; }
  const NET_ERR = 'Không kết nối được. Mạng của một trong hai người đang chặn kết nối trực tiếp (hay gặp ở mạng trường, công ty) — thử lại sau ít phút, hoặc đổi sang 4G / Wi-Fi khác.';
  function openChannel(dc, ms) { return new Promise((res, rej) => { if (dc.readyState === 'open') return res(); const t = setTimeout(() => rej(new Error(NET_ERR)), ms); dc.addEventListener('open', () => { clearTimeout(t); res(); }); }); }
  const sendTo = (dc, o) => { try { if (dc && dc.readyState === 'open') dc.send(typeof o === 'string' ? o : JSON.stringify(o)); } catch (e) { /* */ } };
  // khung phòng chờ: thay nội dung mà không đóng khung (đóng khung sẽ huỷ các kết nối)
  function lobbyScreen(html) {
    const inner = '<div class="hax-lobby">' + html + '</div>';
    if (root && !root.querySelector('#hxCv')) root.querySelector('.hax-box').innerHTML = inner;
    else { const keep = stopFn; stopFn = null; open(inner); stopFn = keep; }
    cancelAnimationFrame(raf); raf = 0; stopTicker(); keyHook = null;
  }
  function setMsg(t) { const el = document.getElementById('hxMsg'); if (el) el.textContent = t; }
  const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100;
  function snapshot(m, ins) {
    return JSON.stringify({ t: 's', p: m.players.map((p, i) => [r1(p.x), r1(p.y), r2(p.vx), r2(p.vy), p.kicking ? 1 : 0, p.flash ? 1 : 0, r2(ins[i] ? ins[i].jx : 0), r2(ins[i] ? ins[i].jy : 0), p.stun > 0 ? 1 : 0, p.out ? 1 : 0, p.card || 0, p.slide > 0 ? 1 : 0]), b: [r1(m.ball.x), r1(m.ball.y), r2(m.ball.vx), r2(m.ball.vy), Math.round(m.ball.spin * 1e4) / 1e4], ch: m.players.map((p) => p.charge), sc: m.score, tm: r1(m.time), ph: m.phase, ko: m.kickoff, g: m.golden ? 1 : 0, pt: m.phaseT, pen: m.pen ? 1 : 0, kp: m.keeper ?? -1, lc: m.lastCard || '' });
  }
  // ---------- CHỦ PHÒNG
  async function host() {
    const H0 = { code: null, peers: [], pending: new Set(), alive: true, playing: false, m: null, owners: null };
    onlineActive = true;
    stopFn = () => { H0.alive = false; onlineActive = false; H0.peers.forEach((p) => { try { p.pc.close(); } catch (e) { /* */ } }); H0.pending.forEach((pc) => { try { pc.close(); } catch (e) { /* */ } }); };
    lobbyScreen('<h3>🌐 Tạo phòng online</h3><p class="sub">⏳ Đang tạo phòng…</p><p class="p-sub" id="hxMsg"></p><div class="btnrow"><button type="button" class="btn btn-ghost" id="hxBack">← Menu</button></div>');
    document.getElementById('hxBack').onclick = () => menu();
    try { H0.code = (await api('/api/hax', { op: 'create' })).code; } catch (e) { setMsg('⚠️ ' + e.message); return; }
    if (!H0.alive) return;
    const humans = () => [{ id: 'host', name: myName(), team: H0.hostTeam || 0 }].concat(H0.peers.filter((p) => p.open).map((p) => ({ id: p.id, name: p.name, team: p.team })));
    const lobbyMsg = (forId) => ({ t: 'lobby', code: H0.code, map: mapOf(), dur: cfg.dur, bots: cfg.bots, players: humans(), you: forId });
    const sendLobby = () => H0.peers.forEach((p) => sendTo(p.dc, lobbyMsg(p.id)));
    const fewer = () => { const h = humans(); return h.filter((x) => x.team === 0).length <= h.filter((x) => x.team === 1).length ? 0 : 1; };
    const drawLobby = () => {
      if (!H0.alive || H0.playing) return;
      const h = humans(), col = (t) => h.filter((x) => x.team === t).map((x) => '<li>' + esc(x.name) + (x.id === 'host' ? ' <small>(chủ phòng)</small>' : '') + ' <button type="button" class="hax-sw" data-sw="' + x.id + '" title="Đổi đội">⇄</button></li>').join('') || '<li class="empty">— trống —</li>';
      const n0 = h.filter((x) => x.team === 0).length, n1 = h.length - n0, size = Math.max(n0, n1, 1);
      lobbyScreen('<h3>🌐 Phòng online</h3><p class="sub">Gửi mã cho bạn bè, họ bấm <b>Vào phòng</b> rồi nhập mã (tối đa ' + MAX_PLAYERS + ' người):</p><div class="hax-code">' + H0.code + '</div><button type="button" class="btn btn-soft btn-sm" id="hxCopy">📋 Chép mã</button>' +
        '<div class="hax-teams"><div class="red"><b>🔴 Đội Đỏ (' + n0 + ')</b><ul>' + col(0) + '</ul></div><div class="blue"><b>🔵 Đội Xanh (' + n1 + ')</b><ul>' + col(1) + '</ul></div></div>' +
        settingsHtml(true) +
        '<label class="hax-chk"><input type="checkbox" id="hxBots"' + (cfg.bots ? ' checked' : '') + '> 🤖 Thêm máy cho đủ ' + size + 'v' + size + ' khi hai đội lệch người</label>' +
        '<p class="p-sub" id="hxMsg">' + (h.length < 2 ? '⏳ Đang chờ bạn bè vào… (có thể bắt đầu luôn để đá với máy)' : '✅ ' + h.length + ' người trong phòng') + '</p>' +
        '<div class="btnrow"><button type="button" class="btn btn-primary" id="hxStart">▶ Bắt đầu</button><button type="button" class="btn btn-ghost" id="hxBack">← Rời phòng</button></div>');
      bindSettings(() => { drawLobby(); sendLobby(); });
      document.getElementById('hxBack').onclick = () => menu();
      document.getElementById('hxCopy').onclick = async () => { try { await navigator.clipboard.writeText(H0.code); setMsg('Đã chép mã ' + H0.code); } catch (e) { /* */ } };
      document.getElementById('hxBots').onchange = (e) => { cfg.bots = e.target.checked; saveCfg(); drawLobby(); sendLobby(); };
      root.querySelectorAll('[data-sw]').forEach((b) => (b.onclick = () => { const id = b.dataset.sw; if (id === 'host') H0.hostTeam = 1 - (H0.hostTeam || 0); else { const p = H0.peers.find((x) => x.id === id); if (p) p.team = 1 - p.team; } drawLobby(); sendLobby(); }));
      document.getElementById('hxStart').onclick = start;
    };
    const drop = (peer) => {
      if (!H0.peers.includes(peer)) return;
      H0.peers = H0.peers.filter((p) => p !== peer); try { peer.pc.close(); } catch (e) { /* */ }
      if (H0.playing && H0.owners) { const i = H0.owners.indexOf(peer); if (i >= 0) { H0.owners[i] = 1; H0.m.players[i].name = (peer.name || '') + ' (máy)'; } }
      else { drawLobby(); sendLobby(); }
    };
    const onMsg = (peer, e) => {
      peer.seen = performance.now();
      let d; try { d = JSON.parse(e.data); } catch (x) { return; }
      if (d.t === 'i') peer.input = vecOf(d.i);
      else if (d.t === 'hello') { const nm = String(d.name || 'Bạn').slice(0, 14); if (nm !== peer.name) { peer.name = nm; if (!H0.playing) { drawLobby(); sendLobby(); } } }
      else if (d.t === 'team' && !H0.playing) { peer.team = 1 - peer.team; drawLobby(); sendLobby(); }
    };
    async function accept(req) {
      if (H0.peers.length + H0.pending.size >= MAX_PLAYERS - 1) return;
      const pc = new RTCPeerConnection(await getIce()); H0.pending.add(pc);
      const peer = { id: req.id, pc, dc: null, name: '…', team: fewer(), input: {}, open: false, seen: performance.now() };
      pc.ondatachannel = (ev) => {
        peer.dc = ev.channel;
        peer.dc.onmessage = (x) => onMsg(peer, x);
        peer.dc.onclose = () => drop(peer);
        const ready = () => { H0.pending.delete(pc); if (!H0.alive) return; peer.open = true; peer.seen = performance.now(); H0.peers.push(peer); sfx('notify'); if (H0.playing) { sendTo(peer.dc, { t: 'wait' }); } else { drawLobby(); sendLobby(); } };
        if (peer.dc.readyState === 'open') ready(); else peer.dc.onopen = ready;
      };
      try {
        await pc.setRemoteDescription(req.offer); await pc.setLocalDescription(await pc.createAnswer()); await iceDone(pc);
        await api('/api/hax', { op: 'answer', code: H0.code, id: req.id, answer: pc.localDescription });
        setTimeout(() => { if (!peer.open) { H0.pending.delete(pc); try { pc.close(); } catch (e) { /* */ } } }, 25000);
      } catch (e) { H0.pending.delete(pc); try { pc.close(); } catch (x) { /* */ } }
    }
    // lấy lời mời vào phòng + kiểm tra ai rớt mạng
    (async () => {
      while (H0.alive) {
        try { const j = await api('/api/hax?code=' + H0.code + '&get=queue&t=' + Date.now()); (j.reqs || []).forEach(accept); } catch (e) { /* */ }
        H0.peers.forEach((p) => { if (performance.now() - p.seen > 9000) drop(p); });
        await wait(1500);
      }
    })();
    const ping = setInterval(() => { if (!H0.alive) { clearInterval(ping); return; } H0.peers.forEach((p) => sendTo(p.dc, { t: 'hello', name: myName() })); }, 1000);
    const prevStop = stopFn; stopFn = () => { clearInterval(ping); prevStop(); };
    function start() {
      const h = humans();
      const roster = [], owners = [];
      h.forEach((x) => { roster.push({ team: x.team, name: x.name }); owners.push(x.id === 'host' ? 'host' : H0.peers.find((p) => p.id === x.id)); });
      const n0 = h.filter((x) => x.team === 0).length, n1 = h.length - n0, size = Math.max(n0, n1, 1);
      if (cfg.bots || h.length < 2) [0, 1].forEach((t) => { const have = t === 0 ? n0 : n1; for (let i = have; i < size; i++) { roster.push({ team: t, name: 'Máy' }); owners.push(cfg.lvl); } });
      if (!roster.some((r) => r.team === 0)) { roster.push({ team: 0, name: 'Máy' }); owners.push(cfg.lvl); }
      if (!roster.some((r) => r.team === 1)) { roster.push({ team: 1, name: 'Máy' }); owners.push(cfg.lvl); }
      // xếp lại: đội Đỏ trước, đội Xanh sau (số áo theo thứ tự)
      const order = roster.map((r, i) => i).sort((a, b) => roster[a].team - roster[b].team || a - b);
      const ros = order.map((i) => roster[i]), own = order.map((i) => owners[i]);
      const m = newMatch({ dur: cfg.dur, map: mapOf(), roster: ros });
      H0.m = m; H0.owners = own; H0.playing = true; own.forEach((o, i) => { if (o === 'host' || (o && typeof o === 'object')) m.players[i].human = true; });
      own.forEach((o, i) => { if (o && o.dc) sendTo(o.dc, { t: 'start', map: m.map, dur: m.dur, roster: ros, me: i }); });
      const meIdx = own.indexOf('host'), myTeam = ros[meIdx].team;
      const keep = stopFn; stopFn = null; open(pitchHtml('Online · ' + ros.length + ' cầu thủ · bạn ở đội ' + NAMES[myTeam] + ' · ' + MP.icon + ' ' + MP.name)); stopFn = keep;
      document.getElementById('hxHint').textContent = KEYS_HINT() + ' · Bạn là ★';
      let lastIns = [];
      runLocal(m, (mm) => (lastIns = H0.owners.map((o, i) => (o === 'host' ? inAny() : typeof o === 'number' ? aiInput(mm, i, o) : o.input || {}))), {
        me: meIdx, myTeam, online: true,
        broadcast: (mm) => { const s = snapshot(mm, lastIns.map(vecOf)); H0.peers.forEach((p) => sendTo(p.dc, s)); },
        broadcastEnd: (mm) => H0.peers.forEach((p) => sendTo(p.dc, { t: 'end', sc: mm.score })),
        againLabel: '↩ Về phòng chờ', again: () => { H0.playing = false; drawLobby(); sendLobby(); }, onQuit: () => menu(),
      });
    }
    drawLobby();
  }
  // ---------- NGƯỜI VÀO PHÒNG
  async function join(code) {
    code = String(code || '').trim().toUpperCase();
    let alive = true, pc = null;
    onlineActive = true;
    stopFn = () => { alive = false; onlineActive = false; try { pc && pc.close(); } catch (e) { /* */ } };
    lobbyScreen('<h3>🌐 Vào phòng ' + esc(code) + '</h3><p class="sub">⏳ Đang kết nối…</p><p class="p-sub" id="hxMsg"></p><div class="btnrow"><button type="button" class="btn btn-ghost" id="hxBack">← Menu</button></div>');
    document.getElementById('hxBack').onclick = () => menu();
    try {
      pc = new RTCPeerConnection(await getIce());
      const dc = pc.createDataChannel('hax');
      await pc.setLocalDescription(await pc.createOffer()); await iceDone(pc);
      const { id } = await api('/api/hax', { op: 'join', code, offer: pc.localDescription });
      setMsg('🤝 Đã gửi lời vào phòng, chờ chủ phòng nhận…');
      let ans = null;
      for (let i = 0; i < 40 && alive && !ans; i++) { await wait(1200); ans = (await api('/api/hax?code=' + code + '&get=answer&id=' + id + '&t=' + Date.now()).catch(() => ({}))).answer; }
      if (!alive) return;
      if (!ans) throw new Error('Chủ phòng không phản hồi. Kiểm tra lại mã phòng hoặc nhờ chủ phòng mở lại phòng chờ.');
      await pc.setRemoteDescription(ans);
      setMsg('🔗 Đang kết nối trực tiếp…');
      await openChannel(dc, 20000);
      if (!alive) return;
      guest(pc, dc);
    } catch (e) { if (alive) setMsg('⚠️ ' + e.message); }
  }
  // ---------- MÁY CHỦ RIÊNG (WebSocket qua cổng 443 → mạng trường/công ty không chặn được)
  const SERVER_DEFAULT = 'wss://mot-kiep-nguoi-hax.onrender.com';
  let serverUrlP = null;
  function serverUrl() {
    const own = (() => { try { return localStorage.getItem('kn_hax_server'); } catch (e) { return null; } })();
    if (own) return Promise.resolve(own);
    if (!serverUrlP) serverUrlP = Promise.race([fetch('/api/hax?get=server', { cache: 'no-store' }).then((r) => r.json()).then((j) => j.url || SERVER_DEFAULT), wait(3000).then(() => SERVER_DEFAULT)]).catch(() => SERVER_DEFAULT);
    return serverUrlP;
  }
  const httpOf = (u) => u.replace(/^ws/, 'http');
  // máy chủ miễn phí có thể đang "ngủ" → gọi dậy sớm ngay khi mở menu Hax
  function wakeServer() { serverUrl().then((u) => fetch(httpOf(u) + '/health', { cache: 'no-store' }).catch(() => {})).catch(() => {}); }
  async function serverPlay(op, code) {
    let alive = true, ws = null, tries = 0;
    onlineActive = true;
    stopFn = () => { alive = false; onlineActive = false; try { ws && ws.close(); } catch (e) { /* */ } };
    const title = op === 'quick' ? '⚡ Phòng chung' : op === 'create' ? '🖥️ Tạo phòng riêng' : '🖥️ Vào phòng ' + esc(code);
    lobbyScreen('<h3>' + title + '</h3><p class="sub">⏳ Đang nối tới máy chủ…</p><p class="p-sub" id="hxMsg"></p><div class="btnrow"><button type="button" class="btn btn-ghost" id="hxBack">← Menu</button></div>');
    document.getElementById('hxBack').onclick = () => menu();
    const url = await serverUrl();
    const t0 = Date.now();
    const connect = () => {
      if (!alive) return;
      tries++;
      try { ws = new WebSocket(url); } catch (e) { setMsg('⚠️ Địa chỉ máy chủ không hợp lệ'); return; }
      const dc = { readyState: 'connecting', server: true, onmessage: null, onclose: null, send: (s) => ws.send(s), close: () => ws.close() };
      let opened = false;
      ws.onopen = () => {
        opened = true; dc.readyState = 'open';
        ws.send(JSON.stringify(op === 'quick' ? { t: 'quick', name: myName() } : op === 'create' ? { t: 'create', name: myName(), cfg: { map: mapOf(), dur: cfg.dur, bots: cfg.bots, lvl: cfg.lvl } } : { t: 'join', code, name: myName() }));
      };
      ws.onmessage = (e) => {
        let d; try { d = JSON.parse(e.data); } catch (x) { return; }
        if (d.t === 'err') { alive = false; lobbyScreen('<h3>' + title + '</h3><p class="sub">⚠️ ' + esc(d.msg) + '</p><div class="btnrow"><button type="button" class="btn btn-ghost" id="hxBack">← Menu</button></div>'); document.getElementById('hxBack').onclick = () => menu(); try { ws.close(); } catch (x) { /* */ } return; }
        if (d.t === 'joined') { if (alive) guest({ close() {} }, dc); return; }
        if (dc.onmessage) dc.onmessage(e);
      };
      ws.onclose = () => {
        dc.readyState = 'closed';
        if (opened) { if (dc.onclose) dc.onclose(); return; }
        if (!alive) return;
        // chưa mở được: máy chủ đang thức dậy (bản miễn phí ngủ khi vắng người) → thử lại tối đa ~90 giây
        const secs = Math.round((Date.now() - t0) / 1000);
        if (secs > 90) { setMsg('⚠️ Không nối được máy chủ. Thử lại sau ít phút, hoặc dùng "Kết nối trực tiếp" ở menu.'); return; }
        setMsg('☕ Máy chủ đang thức dậy, lần đầu trong ngày có thể mất 30–60 giây… (' + secs + 's)');
        if (tries === 1) fetch(httpOf(url) + '/health', { cache: 'no-store' }).catch(() => {});
        setTimeout(connect, 2500);
      };
    };
    connect();
  }
  function guest(pc, dc) {
    let lastSeen = performance.now(), lost = false, m = null, me = 0, playing = false, snap = null, lastScore = '0-0', lobby = null;
    const send = (o) => sendTo(dc, o);
    send({ t: 'hello', name: myName() });
    const ping = setInterval(() => { send({ t: 'hello', name: myName() }); if (dc.server) send({ t: 'ping', c: performance.now() }); }, 1000);
    const lostCheck = setInterval(() => {
      if (lost || performance.now() - lastSeen < 7000) return;
      lost = true; cancelAnimationFrame(raf); raf = 0; stopTicker();
      const html = '<b>📡 Mất kết nối</b><span>' + (dc.server ? 'Rớt mạng với máy chủ.' : 'Chủ phòng đã thoát hoặc mạng chập chờn.') + '</span><div class="btnrow"><button type="button" class="btn btn-primary" id="hxMenu2">Menu</button></div>';
      if (root && root.querySelector('.hax-field')) overlay(html); else lobbyScreen('<h3>📡 Mất kết nối</h3><p class="sub">' + (dc.server ? 'Rớt mạng với máy chủ.' : 'Chủ phòng đã thoát hoặc mạng chập chờn.') + '</p><div class="btnrow"><button type="button" class="btn btn-primary" id="hxMenu2">Menu</button></div>');
      document.getElementById('hxMenu2').onclick = () => menu();
    }, 1000);
    dc.onclose = () => { lastSeen = 0; };
    stopFn = () => { onlineActive = false; clearInterval(ping); clearInterval(lostCheck); try { dc.close(); pc.close(); } catch (e) { /* */ } };
    const showLobby = (d) => {
      lobby = d; playing = false;
      if (d.server) return serverLobby(d);
      const col = (t) => d.players.filter((x) => x.team === t).map((x) => '<li>' + esc(x.name) + (x.id === d.you ? ' <small>(bạn)</small>' : x.id === 'host' ? ' <small>(chủ phòng)</small>' : '') + '</li>').join('') || '<li class="empty">— trống —</li>';
      const mp = MAPS[d.map] || MAPS.classic;
      lobbyScreen('<h3>🌐 Phòng ' + esc(d.code) + '</h3><p class="sub">Đã vào phòng! Chờ chủ phòng bấm <b>Bắt đầu</b>…</p>' +
        '<div class="hax-teams"><div class="red"><b>🔴 Đội Đỏ</b><ul>' + col(0) + '</ul></div><div class="blue"><b>🔵 Đội Xanh</b><ul>' + col(1) + '</ul></div></div>' +
        '<p class="p-sub">Bản đồ: ' + mp.icon + ' ' + mp.name + ' · ' + Math.round(d.dur / 60) + ' phút' + (d.bots ? ' · có máy bù người' : '') + '</p>' +
        '<div class="btnrow"><button type="button" class="btn btn-soft" id="hxTeam">⇄ Đổi đội</button><button type="button" class="btn btn-ghost" id="hxBack">← Rời phòng</button></div>');
      document.getElementById('hxTeam').onclick = () => { send({ t: 'team' }); sfx('click'); };
      document.getElementById('hxBack').onclick = () => menu();
    };
    // phòng chờ trên máy chủ riêng: chủ phòng chỉnh luật + bắt đầu; phòng chung tự đếm ngược
    const serverLobby = (d) => {
      if (d.admin) { cfg.sport = d.map === 'court' ? 'basket' : 'foot'; if (d.map !== 'court') cfg.map = d.map; cfg.dur = d.dur; cfg.lvl = d.lvl; cfg.bots = d.bots; }
      const col = (t) => d.players.filter((x) => x.team === t).map((x) => '<li>' + esc(x.name) + (x.id === d.you ? ' <small>(bạn)</small>' : '') + (x.admin ? ' <small>👑</small>' : '') + (d.admin && x.id !== d.you ? ' <button type="button" class="hax-sw" data-sw="' + x.id + '" title="Đổi đội">⇄</button>' : '') + '</li>').join('') || '<li class="empty">— trống —</li>';
      const mp = MAPS[d.map] || MAPS.classic, n = d.players.length;
      const status = d.playing ? '⏳ Trận đang diễn ra, bạn sẽ vào ở ván sau…' : d.pub ? (d.auto ? '⚽ Trận bắt đầu sau ' + d.auto + ' giây…' : '⏳ Chờ thêm người vào (đủ 2 người là tự đá)…') : d.admin ? (n < 2 ? '⏳ Chờ bạn bè vào… (có thể bắt đầu luôn để đá với máy)' : '✅ ' + n + ' người trong phòng') : '⏳ Chờ chủ phòng 👑 bấm Bắt đầu…';
      lobbyScreen('<h3>' + (d.pub ? '⚡ Phòng chung' : '🖥️ Phòng ' + esc(d.code)) + '</h3>' +
        (d.pub ? '<p class="sub">Ai bấm <b>Phòng chung</b> cũng vào đây, tự ghép trận (tối đa ' + MAX_PLAYERS + ' người).</p>' : '<p class="sub">Gửi mã cho bạn bè, họ bấm <b>Vào phòng</b> rồi nhập mã:</p><div class="hax-code">' + esc(d.code) + '</div><button type="button" class="btn btn-soft btn-sm" id="hxCopy">📋 Chép mã</button>') +
        '<div class="hax-teams"><div class="red"><b>🔴 Đội Đỏ</b><ul>' + col(0) + '</ul></div><div class="blue"><b>🔵 Đội Xanh</b><ul>' + col(1) + '</ul></div></div>' +
        (d.admin ? settingsHtml(true) + '<label class="hax-chk"><input type="checkbox" id="hxBots"' + (d.bots ? ' checked' : '') + '> 🤖 Thêm máy cho đủ người khi hai đội lệch</label>' : '<p class="p-sub">Bản đồ: ' + mp.icon + ' ' + mp.name + ' · ' + Math.round(d.dur / 60) + ' phút' + (d.bots ? ' · có máy bù người' : '') + '</p>') +
        '<p class="p-sub" id="hxMsg">' + status + ' <span id="hxPing"></span></p>' +
        '<div class="btnrow">' + (d.admin && !d.playing ? '<button type="button" class="btn btn-primary" id="hxStart">▶ Bắt đầu</button>' : '') + '<button type="button" class="btn btn-soft" id="hxTeam">⇄ Đổi đội</button><button type="button" class="btn btn-ghost" id="hxBack">← Rời phòng</button></div>');
      const sendCfg = () => send({ t: 'cfg', map: mapOf(), dur: cfg.dur, bots: cfg.bots, lvl: cfg.lvl });
      if (d.admin) {
        bindSettings(sendCfg);
        document.getElementById('hxBots').onchange = (e) => { cfg.bots = e.target.checked; saveCfg(); sendCfg(); };
        root.querySelectorAll('[data-sw]').forEach((b) => (b.onclick = () => send({ t: 'swap', id: b.dataset.sw })));
        const st = document.getElementById('hxStart'); if (st) st.onclick = () => { send({ t: 'start' }); sfx('click'); };
      }
      const cp = document.getElementById('hxCopy'); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(d.code); } catch (e) { /* */ } };
      document.getElementById('hxTeam').onclick = () => { send({ t: 'team' }); sfx('click'); };
      document.getElementById('hxBack').onclick = () => menu();
      showPing();
    };
    let rtt = 0, rttS = 0;
    const showPing = () => { const el = document.getElementById('hxPing'); if (el && rtt) el.textContent = '· ' + (rtt < 80 ? '🟢' : rtt < 160 ? '🟡' : '🔴') + ' ' + rtt + 'ms'; };
    // ván đấu phía người vào phòng: tự chạy vật lý (dự đoán) rồi khớp dần với trạng thái chủ phòng gửi về
    const startGame = (d) => {
      playing = true; me = d.me; snap = null; lastScore = '0-0';
      m = newMatch({ dur: d.dur, map: d.map, roster: d.roster, client: true });
      const keep = stopFn; stopFn = null; open(pitchHtml('Online · ' + d.roster.length + ' cầu thủ · bạn ở đội ' + NAMES[d.roster[me].team] + ' · ' + MP.icon + ' ' + MP.name)); stopFn = keep;
      document.getElementById('hxHint').textContent = KEYS_HINT() + ' · Bạn là ★';
      if (dc.server) { const sp = document.createElement('span'); sp.id = 'hxPing'; document.getElementById('hxHint').append(' ', sp); showPing(); }
      cv = document.getElementById('hxCv'); ctx = cv.getContext('2d'); bindKeys();
      document.getElementById('hxQuit').onclick = () => menu();
      let tick = 0, last = performance.now(), acc = 0;
      // gửi lệnh ngay khi thay đổi (không đợi nhịp) và nhắc lại mỗi 100ms phòng gói tin rơi
      let lastIn = '', sentAt = 0;
      const sendIn = () => { const v = inAny(), j = JSON.stringify(v), t0 = performance.now(); if (j !== lastIn || t0 - sentAt > 100) { lastIn = j; sentAt = t0; send({ t: 'i', i: v }); } };
      keyHook = sendIn;
      ticker(60, () => {
        if (!playing) return;
        const now = performance.now(); acc += Math.min(0.25, (now - last) / 1000); last = now;
        while (acc >= 1 / 60) {
          acc -= 1 / 60;
          const ins = m.players.map((p, i) => (i === me ? inAny() : snap && snap.p[i] ? { jx: snap.p[i][6], jy: snap.p[i][7], k: !!snap.p[i][4] } : {}));
          step(m, ins);
        }
        tick++; sendIn();
      });
      const loop = () => { if (!playing) return; playEvents(m); draw(ctx, m, me); hud(m); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    };
    const applySnap = (d) => {
      snap = d; if (!m) return;
      m.score = d.sc; m.time = d.tm; m.kickoff = d.ko; m.golden = !!d.g; m.phaseT = d.pt; m.pen = !!d.pen; m.keeper = d.kp ?? -1; m.lastCard = d.lc || '';
      if (d.ph !== m.phase) m.phase = d.ph;
      const sc = d.sc.join('-'); if (sc !== lastScore) { lastScore = sc; sfx('cheer'); }
      // khớp dần: của mình thì chỉnh nhẹ (đã dự đoán trước), của người khác chỉnh mạnh hơn; lệch quá xa thì nhảy luôn
      // bù trễ: trạng thái máy chủ đã “cũ” khoảng nửa vòng ping khi tới nơi → đẩy tới trước theo vận tốc để khớp với hiện tại
      if (KN.Hax._dbg) KN.Hax._dbg.m = m;
      const lt = dc.server && !KN.Hax._noLagComp ? Math.max(0, Math.min(10, rttS / 2 / 16.7)) : 0, dbg = KN.Hax._dbg;
      const fix = (o, x, y, vx, vy, k, own) => { const ex = x - o.x, ey = y - o.y, e = Math.hypot(ex, ey); if (own && dbg) { dbg.sum += e; dbg.n++; } if (e > 70) { o.x = x; o.y = y; o.vx = vx; o.vy = vy; return; } o.x += ex * k; o.y += ey * k; if (!own) { o.vx = vx; o.vy = vy; } else { o.vx += (vx - o.vx) * 0.2; o.vy += (vy - o.vy) * 0.2; } };
      d.p.forEach((a, i) => { const p = m.players[i]; if (!p) return; const l2 = i === me ? 0 : lt * 0.85; fix(p, a[0] + a[2] * l2, a[1] + a[3] * l2, a[2], a[3], i === me ? 0.12 : 0.45, i === me); if (i !== me) p.kicking = !!a[4]; p.flash = a[5] ? Math.max(p.flash, 1) : p.flash; p.stun = a[8] ? Math.max(p.stun || 0, 2) : 0; p.out = !!a[9]; p.card = a[10] || 0; if (i !== me) p.slide = a[11] ? 2 : 0; });
      const b = d.b, mine = m.players[me], near = mine && Math.hypot(mine.x - m.ball.x, mine.y - m.ball.y) < 60;
      const bd = (MP && MP.bd) || 0.985, bs = lt ? (1 - Math.pow(bd, lt)) / (1 - bd) : 0;
      fix(m.ball, b[0] + b[2] * bs, b[1] + b[3] * bs, b[2], b[3], near ? 0.25 : 0.5, false); if (!near) m.ball.spin = b[4] || 0;
      if (d.ch) d.ch.forEach((v, i) => { if (i !== me && m.players[i]) m.players[i].charge = v; });
    };
    dc.onmessage = (e) => {
      lastSeen = performance.now();
      let d; try { d = JSON.parse(e.data); } catch (x) { return; }
      if (d.t === 's') applySnap(d);
      else if (d.t === 'pong') { if (d.c) { rtt = Math.round(performance.now() - d.c); rttS = rttS ? rttS * 0.7 + rtt * 0.3 : rtt; showPing(); } }
      else if (d.t === 'lobby') showLobby(d);
      else if (d.t === 'start') startGame(d);
      else if (d.t === 'end') { playing = false; stopTicker(); keyHook = null; if (m) { m.score = d.sc; finish(m, { myTeam: m.players[me].team, online: true, againLabel: null }); } }
      else if (d.t === 'wait') lobbyScreen('<h3>🌐 Đã vào phòng</h3><p class="sub">⏳ Trận đang diễn ra, bạn sẽ vào ở ván sau…</p><div class="btnrow"><button type="button" class="btn btn-ghost" id="hxBack">← Rời phòng</button></div>'), document.getElementById('hxBack').onclick = () => menu();
    };
    lobbyScreen('<h3>🌐 Đã vào phòng</h3><p class="sub">⏳ Đang nhận thông tin phòng…</p><div class="btnrow"><button type="button" class="btn btn-ghost" id="hxBack">← Rời phòng</button></div>');
    document.getElementById('hxBack').onclick = () => menu();
    void lobby;
  }
  // ---------------------------------------------------------------- cài đặt + menu
  function settingsHtml(online) {
    const chips = (key, list) => list.map(([v, l]) => '<button type="button" data-set="' + key + '" data-v="' + v + '" class="' + (cfg[key] === v ? 'on' : '') + '">' + l + '</button>').join('');
    return '<div class="hax-set"><span>Môn</span><div>' + chips('sport', [['foot', '⚽ Bóng đá'], ['basket', '🏀 Bóng rổ']]) + '</div>' + (cfg.sport === 'basket' ? '' : '<span>Bản đồ</span><div>' + chips('map', Object.keys(MAPS).filter((k) => !MAPS[k].basket).map((k) => [k, MAPS[k].icon + ' ' + MAPS[k].name])) + '</div>') +
      '<span>Thời lượng</span><div>' + chips('dur', [[120, '2 phút'], [180, '3 phút'], [300, '5 phút']]) + '</div>' +
      (online ? '' : '<span>Số người</span><div>' + chips('size', [[1, '1v1'], [2, '2v2'], [3, '3v3'], [4, '4v4']]) + '</div>') +
      '<span>Máy</span><div>' + chips('lvl', [[0, 'Dễ'], [1, 'Thường'], [2, 'Khó']]) + '</div></div>' +
      '<p class="p-sub hax-mapdesc">' + (cfg.sport === 'basket' ? 'Bóng rổ: dẫn bóng bằng cách chạy đẩy bóng, bấm sút để NÉM. Bóng lọt vòng rổ cam = 2 điểm, ném từ ngoài vạch cong 3 điểm = 3 điểm. Dẫn bóng chạm rổ không tính!' : ({ classic: 'Sân tiêu chuẩn.', futsal: 'Sân nhỏ trong nhà, bóng nảy nhanh, hợp 1v1–2v2.', big: 'Sân rộng cho 3v3, 4v4.', ice: 'Mặt băng trơn trượt: khó phanh, bóng lăn rất xa!', beach: 'Cát lún: chạy nặng, bóng mau dừng.', street: 'Sân hẻm hẹp, khung thành nhỏ, va chạm liên tục.' }[cfg.map] || '')) + '</p>';
  }
  function bindSettings(redraw) {
    root.querySelectorAll('[data-set]').forEach((b) => (b.onclick = () => { const k = b.dataset.set, v = b.dataset.v; cfg[k] = k === 'map' || k === 'sport' ? v : +v; saveCfg(); sfx('click'); redraw(); }));
  }
  function menu() {
    onlineActive = false;
    open('<div class="hax-lobby"><h3>⚽ Bóng đá Hax · 🏀 Bóng rổ</h3><p class="sub">Bóng đá nhìn từ trên xuống kiểu HaxBall: chạy, va chạm, sút bóng bằng vật lý thật. Đá với máy, với bạn chung một máy, hoặc online nhiều người bằng mã phòng.</p>' +
      settingsHtml(false) +
      '<div class="hax-name"><span>Tên của bạn</span><input id="hxName" maxlength="14" placeholder="Nhập tên để bạn bè nhận ra" autocomplete="off" value="' + esc(cfg.name || '') + '"></div>' +
      '<div class="hax-menu"><button type="button" class="btn btn-primary" id="hxAI">🤖 Đấu với máy</button>' +
      '<button type="button" class="btn btn-primary" id="hxCup">🏆 Các giải đấu Hax · 4 giải, có vòng bảng</button>' +
      '<button type="button" class="btn btn-soft" id="hxLocal">👥 2 người 1 máy</button>' +
      '<div class="hax-srv"><b>🖥️ Online qua máy chủ riêng</b><small>Không bị mạng trường/công ty chặn · tối đa ' + MAX_PLAYERS + ' người · mỗi người một máy</small>' +
      '<button type="button" class="btn btn-primary" id="hxQuick">⚡ Vào phòng chung (tự ghép trận)</button>' +
      '<button type="button" class="btn btn-primary" id="hxSHost">➕ Tạo phòng riêng mời bạn bè</button>' +
      '<div class="ol-join"><input id="hxSCode" maxlength="5" placeholder="Mã phòng (5 ký tự)" autocomplete="off" style="text-transform:uppercase"><button type="button" class="btn btn-soft" id="hxSJoin">Vào phòng</button></div></div>' +
      '<details class="hax-p2p"><summary>Kết nối trực tiếp P2P (dự phòng, khi máy chủ bảo trì)</summary>' +
      '<button type="button" class="btn btn-soft" id="hxHost">🌐 Tạo phòng P2P</button>' +
      '<div class="ol-join"><input id="hxCode" maxlength="5" placeholder="Mã phòng P2P" autocomplete="off" style="text-transform:uppercase"><button type="button" class="btn btn-soft" id="hxJoin">Vào phòng</button></div>' +
      '<p class="p-sub">Kết nối thẳng giữa các máy (WebRTC) — mạng trường/công ty hay chặn.</p></details></div>' +
      '<div class="btnrow"><button type="button" class="btn btn-ghost" id="hxClose">✖ Đóng</button></div></div>');
    bindSettings(menu);
    document.getElementById('hxName').oninput = (e) => { cfg.name = e.target.value.replace(/[<>]/g, '').trim().slice(0, 14); saveCfg(); };
    document.getElementById('hxAI').onclick = playAI;
    document.getElementById('hxCup').onclick = () => cupMenu();
    document.getElementById('hxLocal').onclick = playLocal2;
    document.getElementById('hxHost').onclick = host;
    document.getElementById('hxQuick').onclick = () => serverPlay('quick');
    document.getElementById('hxSHost').onclick = () => serverPlay('create');
    document.getElementById('hxSJoin').onclick = () => { const c = document.getElementById('hxSCode').value.trim(); if (c.length !== 5) { document.getElementById('hxSCode').focus(); return; } serverPlay('join', c.toUpperCase()); };
    document.getElementById('hxSCode').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('hxSJoin').click(); };
    wakeServer();
    document.getElementById('hxJoin').onclick = () => { const c = document.getElementById('hxCode').value; if (c.trim().length !== 5) { document.getElementById('hxCode').focus(); return; } join(c); };
    document.getElementById('hxCode').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('hxJoin').click(); };
    document.getElementById('hxClose').onclick = () => close();
  }
  KN.Hax = { open: menu, close, playCareer, watch, MAPS, _cup: { load: cupLoad, advance: cupAdvance, screen: cupScreen }, _sim: { newMatch, step, aiInput, applyMap, draw, vecOf, snapshot } };
})();
