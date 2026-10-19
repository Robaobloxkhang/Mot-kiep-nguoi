/* Một Kiếp Người — ⚽ BÓNG ĐÁ HAX (KN.Hax): bóng đá nhìn từ trên xuống kiểu HaxBall.
   Chế độ: đấu với máy (1v1 · 2v2 · 3v3, có đồng đội máy) · 2 người 1 máy · ONLINE nhiều người (tối đa 8, WebRTC ngang hàng).
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
    const m = { map: MAPS[o.map] ? o.map : 'classic', players: [], ball: { x: W / 2, y: CY, vx: 0, vy: 0, spin: 0 }, score: [0, 0], time: 0, dur: o.dur || 180, phase: 'kickoff', phaseT: 0, kickoff: 0, golden: false, events: [], client: !!o.client, lastTouch: -1, goalsBy: {} };
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
        p.hx = p.x; p.hy = p.y; p.vx = p.vy = 0; p.cool = 0;
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
    return { jx: ax, jy: ay, k: !!inp.k };
  }
  function step(m, inputs) {
    m.phaseT++;
    if (m.phase === 'goal') { if (!m.client && m.phaseT > 120) resetPositions(m); else { moveBall(m); return; } }
    if (m.phase === 'end') return;
    if (m.phase === 'play' && !m.client) { m.time += 1 / 60; if (m.time >= m.dur && !m.golden) { if (m.score[0] === m.score[1]) { m.golden = true; m.events.push({ t: 'golden' }); } else { m.phase = 'end'; m.events.push({ t: 'end' }); return; } } if (m.golden && m.time >= m.dur + 90) { m.phase = 'end'; m.events.push({ t: 'end' }); return; } }
    m.players.forEach((p, i) => {
      const v = vecOf(inputs[i]);
      // bấm sút sớm một chút (trước khi chạm bóng) vẫn ăn: nhớ lệnh sút thêm 8 khung hình (~0,13 giây)
      if (v.k && !p.kicking) p.kbuf = 8; else if (p.kbuf > 0) p.kbuf--;
      p.kicking = v.k; const acc = p.kicking ? MP.acc * 0.62 : MP.acc;
      p.vx = (p.vx + v.jx * acc) * MP.pd; p.vy = (p.vy + v.jy * acc) * MP.pd;
      p.x += p.vx; p.y += p.vy;
      // giao bóng: chưa được vượt sang nửa sân đối phương / vào vòng tròn giữa sân
      if (m.phase === 'kickoff') { if (p.team === 0) p.x = Math.min(p.x, W / 2 - PR); else p.x = Math.max(p.x, W / 2 + PR); if (p.team !== m.kickoff) { const dx = p.x - W / 2, dy = p.y - CY, d = Math.hypot(dx, dy), rr = MP.circle + PR; if (d < rr) { p.x = W / 2 + dx / (d || 1) * rr; p.y = CY + dy / (d || 1) * rr; } } }
      p.x = Math.max(PR, Math.min(W - PR, p.x)); p.y = Math.max(PR, Math.min(H - PR, p.y));
      if (p.cool > 0) p.cool--; if (p.flash > 0) p.flash--;
      // SÚT TÍCH LỰC: giữ nút sút khi chưa chạm bóng để tích lực (vòng vàng), lao vào bóng là sút mạnh hơn tới 75%
      // SÚT XOÁY: vừa chạy ngang vừa sút thì bóng cong theo hướng chạy
      if (!p.kicking) p.charge = 0;
      if ((p.kicking || p.kbuf > 0) && p.cool <= 0) {
        const dx = m.ball.x - p.x, dy = m.ball.y - p.y, d = Math.hypot(dx, dy);
        if (d < KICK_RANGE && (m.phase !== 'kickoff' || p.team === m.kickoff)) {
          const pow = MP.kick * (p.sk.charge ? 1 + Math.min(p.charge, 45) / 45 * 0.75 : 1);
          let ux = dx / d, uy = dy / d;
          // hỗ trợ ngắm: sút gần đúng hướng khung thành đối phương (lệch < ~35°, trong 480px) thì bóng bẻ nhẹ vào khung
          if (!MP.basket) { const gx = (p.team === 0 ? R : L) - m.ball.x, gy = Math.max(CY - GH * 0.6, Math.min(CY + GH * 0.6, m.ball.y)) - m.ball.y, gl = Math.hypot(gx, gy) || 1; if (gl < 480 && (ux * gx + uy * gy) / gl > 0.82) { ux = ux * 0.65 + gx / gl * 0.35; uy = uy * 0.65 + gy / gl * 0.35; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul; } }
          m.ball.vx += ux * pow; m.ball.vy += uy * pow;
          if (p.sk.curve) { const side = ux * p.vy - uy * p.vx; m.ball.spin = Math.max(-0.035, Math.min(0.035, side * 0.014)); }
          if (p.charge > 25) m.events.push({ t: 'power' });
          p.cool = 12; p.flash = 8; p.charge = 0; p.kbuf = 0; m.lastTouch = i; m.shot = [p.x, p.y]; m.shotT = m.phaseT; m.events.push({ t: 'kick' }); if (m.phase === 'kickoff' && !m.client) m.phase = 'play';
        } else if (p.sk.charge && d >= KICK_RANGE) p.charge = Math.min(45, p.charge + 1);
      }
    });
    const ps = m.players;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) collideCircles(ps[i], ps[j], PR, PR, 0.5, 0.5, 0.5);
    ps.forEach((p, i) => { const hit = collideCircles(p, m.ball, PR, BR, 0.5, 1, 0.5); if (hit) { if (!(m.lastTouch === i && m.phaseT - (m.shotT || 0) < 15)) m.shot = null; m.lastTouch = i; } if (hit && m.phase === 'kickoff' && p.team === m.kickoff && !m.client) m.phase = 'play'; POSTS.forEach((po) => staticPost(p, PR, po, 0.4)); });
    if (m.phase === 'kickoff' && m.phaseT > 300 && !m.client) m.phase = 'play'; // 5 giây không ai giao thì tự chạy
    moveBall(m);
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
  function goal(m, team, pts) {
    m.score[team] += pts || 1; m.lastPts = pts || 1; m.phase = 'goal'; m.phaseT = 0; m.kickoff = 1 - team;
    const sc = m.players[m.lastTouch]; if (sc && sc.team === team) m.goalsBy[m.lastTouch] = (m.goalsBy[m.lastTouch] || 0) + 1;
    m.scorerName = sc ? (sc.team === team ? sc.name || '' : 'phản lưới nhà!') : '';
    m.events.push({ t: 'goal', team, scorer: m.lastTouch });
    if (m.golden) { m.phase = 'end'; m.events.push({ t: 'end' }); }
  }
  // ---------------------------------------------------------------- máy (AI) — biết phối hợp: người gần bóng nhất lên bóng, người khác lùi giữ/chờ bật tường
  function aiInput(m, i, lvl) {
    const p = m.players[i], b = m.ball, dir = p.team === 0 ? 1 : -1, own = MP.basket ? HOOPS[p.team][0] : p.team === 0 ? L : R, opp = MP.basket ? HOOPS[1 - p.team][0] : p.team === 0 ? R + 10 : L - 10;
    const speed = [0.58, 0.8, 0.95][lvl] ?? 0.8; // máy chạy chậm hơn người một chút
    const go = (tx, ty, s) => { const dx = tx - p.x, dy = ty - p.y, dl = Math.hypot(dx, dy) || 1, sp = (s || speed) * Math.min(1, dl / 14 + 0.2); return { jx: dx / dl * sp, jy: dy / dl * sp }; };
    if (m.phase === 'kickoff' && p.team !== m.kickoff) return go(p.hx, p.hy, 0.5);
    const dist = (q) => Math.hypot(q.x - b.x, q.y - b.y), myD = dist(p);
    const mates = m.players.filter((q) => q.team === p.team && q !== p);
    const rank = mates.filter((q) => dist(q) < myD).length;
    const foes = m.players.filter((q) => q.team !== p.team), foeD = foes.length ? Math.min(...foes.map(dist)) : 999;
    const ownHalf = dir * (b.x - W / 2) < 0;
    if (rank > 0) {
      // không phải người gần bóng nhất: hậu vệ thì chắn giữa bóng và khung thành, tiền vệ thì chờ ở chỗ trống
      let tx, ty;
      if (rank === 1 || ownHalf) { tx = own + (b.x - own) * 0.32 + dir * 25; ty = CY + (b.y - CY) * 0.5 + (p.hy - CY) * 0.35; }
      else { tx = b.x - dir * 110; ty = CY + (p.hy - CY) * 0.9; }
      tx = Math.max(L + PR, Math.min(R - PR, tx)); ty = Math.max(T + PR, Math.min(B - PR, ty));
      const v = go(tx, ty, speed * 0.9);
      v.k = myD < KICK_RANGE && dir * (b.x - p.x) > 0;
      return v;
    }
    const look = [3, 7, 11][lvl] ?? 7, bx = b.x + b.vx * look, by = b.y + b.vy * look;
    const aimY = MP.basket ? CY : Math.max(CY - GH + 16, Math.min(CY + GH - 16, by));
    const gx = opp - bx, gy = aimY - by, gl = Math.hypot(gx, gy) || 1, ux = gx / gl, uy = gy / gl;
    let tx = bx - ux * (PR + BR - 2), ty = by - uy * (PR + BR - 2);
    const rel = (p.x - bx) * ux + (p.y - by) * uy;
    if (rel > -6) { const side = (p.x - bx) * -uy + (p.y - by) * ux >= 0 ? 1 : -1; tx = bx - ux * (PR + BR + 14) - uy * side * (PR + BR + 12); ty = by - uy * (PR + BR + 14) + ux * side * (PR + BR + 12); }
    if (foeD + 25 < myD && ownHalf && !mates.length) { const t = lvl === 2 ? 0.42 : 0.55; tx = b.x + (own - b.x) * t; ty = b.y + (CY - b.y) * t; }
    const v = go(tx, ty);
    const fx = b.x - p.x, fy = b.y - p.y, fl = Math.hypot(fx, fy) || 1, align = (fx * ux + fy * uy) / fl;
    v.k = myD < KICK_RANGE && (align > [0.35, 0.55, 0.72][lvl] || (ownHalf && dir * fx > 0)) && Math.random() < [0.3, 0.65, 1][lvl];
    if (MP.basket && v.k && !ownHalf && Math.hypot(b.x - opp, b.y - CY) > 300) v.k = false; // bóng rổ: xa rổ thì dẫn bóng, lại gần mới ném
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
    m.players.forEach((p, i) => {
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(p.x + 2, p.y + 3, PR, 0, Math.PI * 2); c.fill();
      c.fillStyle = COLORS[p.team]; c.beginPath(); c.arc(p.x, p.y, PR, 0, Math.PI * 2); c.fill();
      c.lineWidth = p.kicking ? 4 : 2.5; c.strokeStyle = p.flash ? '#ffd23f' : p.kicking ? '#fff' : 'rgba(0,0,0,.6)'; c.stroke();
      if (p.charge > 4) { c.lineWidth = 4; c.strokeStyle = p.charge >= 45 ? '#ff5c2b' : '#ffd23f'; c.beginPath(); c.arc(p.x, p.y, PR + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p.charge / 45)); c.stroke(); }
      if (i === me) { c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(p.x, p.y, PR + 5, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(i === me ? '★' : String(p.num), p.x, p.y + 1);
      if (p.name) { c.font = '600 11px sans-serif'; c.fillStyle = MP.dark ? 'rgba(20,30,50,.9)' : 'rgba(255,255,255,.92)'; c.fillText(p.name, p.x, p.y - PR - 9); }
    });
    const b = m.ball;
    if (Math.abs(b.spin) > 0.004) { c.strokeStyle = 'rgba(255,210,63,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, BR + 5, 0, Math.PI * 1.2 * Math.sign(b.spin), b.spin < 0); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(b.x + 2, b.y + 3, BR, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, BR, 0, Math.PI * 2); c.fill(); c.lineWidth = 2; c.strokeStyle = '#111'; c.stroke();
    if (m.phase === 'goal') { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, CY - 50, W, 100); c.fillStyle = '#ffd23f'; c.font = '800 54px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(MP.basket ? 'VÀO RỔ! 🏀 +' + (m.lastPts || 2) : 'VÀOOO! ⚽', W / 2, CY - (m.scorerName ? 12 : 0)); if (m.scorerName) { c.font = '700 20px sans-serif'; c.fillStyle = '#fff'; c.fillText(m.scorerName, W / 2, CY + 30); } }
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
  const cfg = Object.assign({ map: 'classic', sport: 'foot', dur: 180, size: 1, lvl: 1, bots: true }, (() => { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch (e) { return {}; } })());
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
  const GAME_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'x', 'enter', '/', '0', 'shift', 'control'];
  function onKey(e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const k = (e.key || '').toLowerCase();
    if (!GAME_KEYS.includes(k) && k !== 'escape') return;
    e.preventDefault(); e.stopPropagation();
    if (k === 'escape') { if (e.type === 'keydown' && !onEnd && !onlineActive) menu(); return; }
    const v = e.type === 'keydown';
    if (keys[k] === v) return;
    keys[k + (e.location === 2 ? 'R' : '')] = keys[k] = v;
    if (keyHook) keyHook();
  }
  function bindKeys() { keys = {}; touch = { jx: 0, jy: 0, k: false, on: false }; window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true); bindTouch(); }
  const in1 = () => vecOf({ u: keys.w, d: keys.s, l: keys.a, r: keys.d, k: keys[' '] || keys.x });
  const in2 = () => vecOf({ u: keys.arrowup, d: keys.arrowdown, l: keys.arrowleft, r: keys.arrowright, k: keys.enter || keys['/'] || keys['0'] || keys.shiftR || keys.control });
  const inAny = () => {
    if (touch.on && (touch.jx || touch.jy || touch.k)) return vecOf({ jx: touch.jx, jy: touch.jy, k: touch.k });
    return vecOf({ u: keys.w || keys.arrowup, d: keys.s || keys.arrowdown, l: keys.a || keys.arrowleft, r: keys.d || keys.arrowright, k: keys[' '] || keys.x || keys.enter || touch.k });
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
  function playEvents(m) { while (m.events.length) { const e = m.events.shift(); if (e.t === 'goal') sfx('cheer'); else if (e.t === 'kick') sfx('click'); else if (e.t === 'power') sfx('whoosh'); else if (e.t === 'golden') sfx('notify'); } }
  const KEYS_HINT = (sk) => (coarse() ? 'Gạt cần để chạy, bấm SÚT khi bóng sát người' : 'WASD / ↑↓←→ chạy · Space / X sút') + ((!sk || sk.charge) ? ' · giữ sút trước khi chạm bóng = sút mạnh' : '') + ((!sk || sk.curve) ? ' · chạy ngang khi sút = sút xoáy' : '');
  // ---------------------------------------------------------------- vòng lặp ván đấu do máy này điều khiển (máy / 2 người / chủ phòng online)
  function runLocal(m, getInputs, opts) {
    opts = opts || {};
    cv = document.getElementById('hxCv'); ctx = cv.getContext('2d');
    bindKeys();
    document.getElementById('hxQuit').onclick = () => { if (opts.onQuit) opts.onQuit(); else menu(); };
    let acc = 0, last = performance.now(), over = false;
    const sim = () => {
      if (over) return;
      const now = performance.now(), dt = Math.min(0.25, (now - last) / 1000); last = now; acc += dt;
      let n = 0;
      while (acc >= 1 / 60) { step(m, getInputs(m)); acc -= 1 / 60; n++; }
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
    if (opts.career) { const f = onEnd; onEnd = null; close(true); const myG = m.goalsBy[opts.me ?? 0] || 0; f && f({ score: Math.max(0, Math.min(1, (mine - theirs + 2) / 4)), text: 'Tỷ số ' + mine + ' – ' + theirs + (res === 'win' ? ': bạn thắng!' : res === 'lose' ? ': bạn thua.' : ': hoà.') + (myG ? ' Bạn ghi ' + myG + ' bàn.' : ''), gf: mine, ga: theirs, myGoals: myG }); return; }
    const title = opts.local2 ? (m.score[0] === m.score[1] ? 'Hoà!' : 'Đội ' + NAMES[m.score[0] > m.score[1] ? 0 : 1] + ' thắng!') : res === 'win' ? '🏆 Đội bạn thắng!' : res === 'lose' ? '😭 Đội bạn thua' : '🤝 Hoà';
    const ov = overlay('<b>' + title + '</b><span>' + m.score[0] + ' – ' + m.score[1] + '</span><div class="btnrow">' + (opts.againLabel === null ? '<small>⏳ Chờ chủ phòng bắt đầu ván mới…</small>' : '<button type="button" class="btn btn-primary" id="hxAgain">' + (opts.againLabel || '↻ Đá lại') + '</button>') + '<button type="button" class="btn btn-ghost" id="hxMenu">' + (opts.online ? 'Rời phòng' : 'Menu') + '</button></div>');
    if (!ov) return;
    const ag = document.getElementById('hxAgain'); if (ag) ag.onclick = () => (opts.again ? opts.again() : menu());
    document.getElementById('hxMenu').onclick = () => menu();
    try { if (!opts.local2 && KN.Game && KN.Game.hasLife() && !KN.Game.isDead() && KN.Game.remoteEffect && res === 'win' && opts.online) KN.Game.remoteEffect({ happy: 3 }, '⚽ Bạn thắng một trận Bóng đá Hax online ' + mine + '–' + theirs + '.', '⚽'); } catch (e) { /* */ }
  }
  // ---------------------------------------------------------------- chế độ chơi trên một máy
  // đội hình: đội Đỏ có bạn + đồng đội máy, đội Xanh toàn máy
  function playAI() {
    const n = cfg.size, lvl = cfg.lvl, roster = [{ team: 0, name: myName() }], owners = ['me'];
    for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Đồng đội' }); owners.push(1); }
    for (let i = 0; i < n; i++) { roster.push({ team: 1, name: n > 1 ? 'Máy ' + (i + 1) : 'Máy' }); owners.push(lvl); }
    const m = newMatch({ dur: cfg.dur, map: mapOf(), roster });
    open(pitchHtml('Đấu với máy · ' + n + 'v' + n + ' · ' + ['Dễ', 'Thường', 'Khó'][lvl] + ' · ' + MP.icon + ' ' + MP.name));
    document.getElementById('hxHint').textContent = KEYS_HINT() + ' · Esc: menu';
    runLocal(m, (mm) => owners.map((o, i) => (o === 'me' ? inAny() : aiInput(mm, i, o))), { again: playAI });
  }
  function playLocal2() {
    const n = cfg.size, roster = [{ team: 0, name: 'Đỏ' }, { team: 1, name: 'Xanh' }], owners = ['p1', 'p2'];
    for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Máy' }, { team: 1, name: 'Máy' }); owners.push(1, 1); }
    const m = newMatch({ dur: cfg.dur, map: mapOf(), roster });
    open(pitchHtml('2 người 1 máy · ' + n + 'v' + n + ' · ' + MP.icon + ' ' + MP.name));
    document.getElementById('hxHint').textContent = 'Đỏ: WASD + Space · Xanh: ↑↓←→ + Enter (hoặc /, 0, Shift phải)';
    runLocal(m, (mm) => owners.map((o, i) => (o === 'p1' ? in1() : o === 'p2' ? in2() : aiInput(mm, i, o))), { local2: true, again: playLocal2 });
  }
  // dùng trong cuộc đời: trận đấu của cầu thủ (đấu với máy 60 giây) — trả về { score 0..1, text }
  function playCareer(opts) {
    opts = opts || {};
    return new Promise((res) => {
      onEnd = res;
      const lvl = opts.need > 0.6 ? 2 : opts.need > 0.35 ? 1 : 0;
      // trận lớn có đồng đội máy đá cùng; đối thủ đông bằng
      const sk = opts.skills || { charge: true, curve: true };
      const n = Math.max(1, Math.min(4, opts.size || 1)), roster = [{ team: 0, name: myName(), sk }], owners = ['me'];
      for (let i = 1; i < n; i++) { roster.push({ team: 0, name: 'Đồng đội' }); owners.push(1); }
      for (let i = 0; i < n; i++) { roster.push({ team: 1, name: opts.foe || 'Đối thủ' }); owners.push(lvl); }
      const m = newMatch({ dur: opts.dur || 60, map: opts.map || 'classic', roster });
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
    return JSON.stringify({ t: 's', p: m.players.map((p, i) => [r1(p.x), r1(p.y), r2(p.vx), r2(p.vy), p.kicking ? 1 : 0, p.flash ? 1 : 0, r2(ins[i] ? ins[i].jx : 0), r2(ins[i] ? ins[i].jy : 0)]), b: [r1(m.ball.x), r1(m.ball.y), r2(m.ball.vx), r2(m.ball.vy), Math.round(m.ball.spin * 1e4) / 1e4], ch: m.players.map((p) => p.charge), sc: m.score, tm: r1(m.time), ph: m.phase, ko: m.kickoff, g: m.golden ? 1 : 0, pt: m.phaseT });
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
      H0.m = m; H0.owners = own; H0.playing = true;
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
  function guest(pc, dc) {
    let lastSeen = performance.now(), lost = false, m = null, me = 0, playing = false, snap = null, lastScore = '0-0', lobby = null;
    const send = (o) => sendTo(dc, o);
    send({ t: 'hello', name: myName() });
    const ping = setInterval(() => send({ t: 'hello', name: myName() }), 1000);
    const lostCheck = setInterval(() => {
      if (lost || performance.now() - lastSeen < 7000) return;
      lost = true; cancelAnimationFrame(raf); raf = 0; stopTicker();
      const html = '<b>📡 Mất kết nối</b><span>Chủ phòng đã thoát hoặc mạng chập chờn.</span><div class="btnrow"><button type="button" class="btn btn-primary" id="hxMenu2">Menu</button></div>';
      if (root && root.querySelector('.hax-field')) overlay(html); else lobbyScreen('<h3>📡 Mất kết nối</h3><p class="sub">Chủ phòng đã thoát hoặc mạng chập chờn.</p><div class="btnrow"><button type="button" class="btn btn-primary" id="hxMenu2">Menu</button></div>');
      document.getElementById('hxMenu2').onclick = () => menu();
    }, 1000);
    dc.onclose = () => { lastSeen = 0; };
    stopFn = () => { onlineActive = false; clearInterval(ping); clearInterval(lostCheck); try { dc.close(); pc.close(); } catch (e) { /* */ } };
    const showLobby = (d) => {
      lobby = d; playing = false;
      const col = (t) => d.players.filter((x) => x.team === t).map((x) => '<li>' + esc(x.name) + (x.id === d.you ? ' <small>(bạn)</small>' : x.id === 'host' ? ' <small>(chủ phòng)</small>' : '') + '</li>').join('') || '<li class="empty">— trống —</li>';
      const mp = MAPS[d.map] || MAPS.classic;
      lobbyScreen('<h3>🌐 Phòng ' + esc(d.code) + '</h3><p class="sub">Đã vào phòng! Chờ chủ phòng bấm <b>Bắt đầu</b>…</p>' +
        '<div class="hax-teams"><div class="red"><b>🔴 Đội Đỏ</b><ul>' + col(0) + '</ul></div><div class="blue"><b>🔵 Đội Xanh</b><ul>' + col(1) + '</ul></div></div>' +
        '<p class="p-sub">Bản đồ: ' + mp.icon + ' ' + mp.name + ' · ' + Math.round(d.dur / 60) + ' phút' + (d.bots ? ' · có máy bù người' : '') + '</p>' +
        '<div class="btnrow"><button type="button" class="btn btn-soft" id="hxTeam">⇄ Đổi đội</button><button type="button" class="btn btn-ghost" id="hxBack">← Rời phòng</button></div>');
      document.getElementById('hxTeam').onclick = () => { send({ t: 'team' }); sfx('click'); };
      document.getElementById('hxBack').onclick = () => menu();
    };
    // ván đấu phía người vào phòng: tự chạy vật lý (dự đoán) rồi khớp dần với trạng thái chủ phòng gửi về
    const startGame = (d) => {
      playing = true; me = d.me; snap = null; lastScore = '0-0';
      m = newMatch({ dur: d.dur, map: d.map, roster: d.roster, client: true });
      const keep = stopFn; stopFn = null; open(pitchHtml('Online · ' + d.roster.length + ' cầu thủ · bạn ở đội ' + NAMES[d.roster[me].team] + ' · ' + MP.icon + ' ' + MP.name)); stopFn = keep;
      document.getElementById('hxHint').textContent = KEYS_HINT() + ' · Bạn là ★';
      cv = document.getElementById('hxCv'); ctx = cv.getContext('2d'); bindKeys();
      document.getElementById('hxQuit').onclick = () => menu();
      let tick = 0, last = performance.now(), acc = 0;
      const sendIn = () => send({ t: 'i', i: inAny() });
      keyHook = sendIn;
      ticker(60, () => {
        if (!playing) return;
        const now = performance.now(); acc += Math.min(0.25, (now - last) / 1000); last = now;
        while (acc >= 1 / 60) {
          acc -= 1 / 60;
          const ins = m.players.map((p, i) => (i === me ? inAny() : snap && snap.p[i] ? { jx: snap.p[i][6], jy: snap.p[i][7], k: !!snap.p[i][4] } : {}));
          step(m, ins);
        }
        if (++tick % 2 === 0) sendIn();
      });
      const loop = () => { if (!playing) return; playEvents(m); draw(ctx, m, me); hud(m); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    };
    const applySnap = (d) => {
      snap = d; if (!m) return;
      m.score = d.sc; m.time = d.tm; m.kickoff = d.ko; m.golden = !!d.g; m.phaseT = d.pt;
      if (d.ph !== m.phase) m.phase = d.ph;
      const sc = d.sc.join('-'); if (sc !== lastScore) { lastScore = sc; sfx('cheer'); }
      // khớp dần: của mình thì chỉnh nhẹ (đã dự đoán trước), của người khác chỉnh mạnh hơn; lệch quá xa thì nhảy luôn
      const fix = (o, x, y, vx, vy, k, own) => { const ex = x - o.x, ey = y - o.y, e = Math.hypot(ex, ey); if (e > 70) { o.x = x; o.y = y; o.vx = vx; o.vy = vy; return; } o.x += ex * k; o.y += ey * k; if (!own) { o.vx = vx; o.vy = vy; } else { o.vx += (vx - o.vx) * 0.2; o.vy += (vy - o.vy) * 0.2; } };
      d.p.forEach((a, i) => { const p = m.players[i]; if (!p) return; fix(p, a[0], a[1], a[2], a[3], i === me ? 0.12 : 0.45, i === me); if (i !== me) p.kicking = !!a[4]; p.flash = a[5] ? Math.max(p.flash, 1) : p.flash; });
      const b = d.b, mine = m.players[me], near = mine && Math.hypot(mine.x - m.ball.x, mine.y - m.ball.y) < 60;
      fix(m.ball, b[0], b[1], b[2], b[3], near ? 0.25 : 0.5, false); if (!near) m.ball.spin = b[4] || 0;
      if (d.ch) d.ch.forEach((v, i) => { if (i !== me && m.players[i]) m.players[i].charge = v; });
    };
    dc.onmessage = (e) => {
      lastSeen = performance.now();
      let d; try { d = JSON.parse(e.data); } catch (x) { return; }
      if (d.t === 's') applySnap(d);
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
      '<button type="button" class="btn btn-soft" id="hxLocal">👥 2 người 1 máy</button>' +
      '<button type="button" class="btn btn-primary" id="hxHost">🌐 Tạo phòng online (tối đa ' + MAX_PLAYERS + ' người)</button>' +
      '<div class="ol-join"><input id="hxCode" maxlength="5" placeholder="Mã phòng (5 ký tự)" autocomplete="off" style="text-transform:uppercase"><button type="button" class="btn btn-soft" id="hxJoin">Vào phòng</button></div></div>' +
      '<p class="p-sub">Online kết nối trực tiếp giữa các máy (WebRTC). Mạng công ty/trường học có thể chặn — khi đó thử 4G. Mỗi người chơi trên một máy riêng (bàn phím chỉ điều khiển cửa sổ đang chọn).</p>' +
      '<div class="btnrow"><button type="button" class="btn btn-ghost" id="hxClose">✖ Đóng</button></div></div>');
    bindSettings(menu);
    document.getElementById('hxName').oninput = (e) => { cfg.name = e.target.value.replace(/[<>]/g, '').trim().slice(0, 14); saveCfg(); };
    document.getElementById('hxAI').onclick = playAI;
    document.getElementById('hxLocal').onclick = playLocal2;
    document.getElementById('hxHost').onclick = host;
    document.getElementById('hxJoin').onclick = () => { const c = document.getElementById('hxCode').value; if (c.trim().length !== 5) { document.getElementById('hxCode').focus(); return; } join(c); };
    document.getElementById('hxCode').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('hxJoin').click(); };
    document.getElementById('hxClose').onclick = () => close();
  }
  KN.Hax = { open: menu, close, playCareer, MAPS, _sim: { newMatch, step, aiInput, applyMap } };
})();
