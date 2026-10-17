/* Một Kiếp Người — bối cảnh nghề nghiệp: sân bóng, nhà thi đấu, sàn võ, sân bay, phim trường. SPEC §4.3/§4.6 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  if (!KN.Env || !window.THREE) return;
  const THREE = window.THREE;
  const PI = Math.PI;
  const SHIRTS = ['#e53935', '#1e88e5', '#fdd835', '#ffffff', '#43a047', '#fb8c00', '#8e24aa', '#f06292'];

  function decorAt(H, g, opts, x, z, ry) {
    if (!opts.decor || !H.decor[opts.decor]) return;
    g.add(H.at(H.decor[opts.decor](), x ?? 3.2, 0, z ?? -3.2, ry || 0));
  }
  // khán đài bậc thang + khán giả (instanced) nhấp nhô cổ vũ
  function stands(H, g, o) {
    const { x0, x1, z, rows, step, color, seed, rot } = o;
    const root = H.group(); root.position.set(0, 0, z); if (rot) root.rotation.y = rot; g.add(root);
    for (let r = 0; r < rows; r++) root.add(H.at(H.box(x1 - x0, 0.32, 0.55, r % 2 ? color : KN.util.shadeHex(color, -0.12)), (x0 + x1) / 2, 0.16 + r * 0.32, -r * step));
    const rr = H.rng(seed || 7), bodies = [], heads = [];
    for (let r = 0; r < rows; r++) for (let x = x0 + 0.25; x < x1 - 0.1; x += 0.36) {
      if (rr() < 0.15) continue;
      const px = x + (rr() - 0.5) * 0.08, py = 0.32 + r * 0.32, pz = -r * step;
      bodies.push({ x: px, y: py + 0.2, z: pz, color: SHIRTS[Math.floor(rr() * SHIRTS.length)] });
      heads.push({ x: px, y: py + 0.47, z: pz, color: ['#e6b48f', '#d9a27c', '#c98d64', '#f0c8a8'][Math.floor(rr() * 4)] });
    }
    const b = H.instanced(new THREE.BoxGeometry(0.24, 0.36, 0.18), '#ffffff', bodies, { cast: false });
    const hd = H.instanced(new THREE.SphereGeometry(0.1, 8, 6), '#ffffff', heads, { cast: false });
    root.add(b); root.add(hd);
    // nhấp nhô: lắc cả khối khán đài theo nhịp (rẻ hơn cập nhật từng người)
    H.onUpdate((dt, t) => { b.position.y = Math.abs(Math.sin(t * 3.2)) * 0.05; hd.position.y = b.position.y; });
    return root;
  }
  function floodlight(H, g, x, z) {
    g.add(H.at(H.cyl(0.07, 0.1, 5.4, '#9aa3ad', { seg: 8 }), x, 2.7, z));
    const head = H.group(); head.position.set(x, 5.5, z);
    head.add(H.at(H.box(1.1, 0.7, 0.12, '#5b636d'), 0, 0, 0));
    for (let i = 0; i < 6; i++) head.add(H.at(H.box(0.28, 0.22, 0.04, H.glow('#f4f8ff', { intensity: 2.6 })), -0.36 + (i % 3) * 0.36, i < 3 ? 0.16 : -0.16, 0.08));
    head.lookAt(0, 0, 0); g.add(head);
  }
  function banner(H, text, w, bg, fg) { return H.sign(text, w, 0.42, { bg, fg: fg || '#ffffff', font: '900 78px "Baloo 2", system-ui' }); }

  // 1. STADIUM — sân bóng đá -----------------------------------------------------------
  KN.Env.register('stadium', { name: 'Sân vận động', indoor: false, sky: ['#7fbff0', '#eef6ff'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#4f9a3d', side: '#5a4632' }));
    // sọc cỏ + đường kẻ
    for (let i = 0; i < 10; i++) if (i % 2) g.add(H.at(H.ground(1, 7.6, '#5aa847'), -4.5 + i, 0.003, 0.6));
    const line = (w, d, x, z) => g.add(H.at(H.ground(w, d, '#f4f7f2'), x, 0.006, z));
    line(9.4, 0.06, 0, -3.2); line(0.06, 7.6, 0, 0.6); line(0.06, 7.6, -4.7, 0.6); line(0.06, 7.6, 4.7, 0.6);
    const circle = new THREE.RingGeometry(1.15, 1.21, 48); circle.rotateX(-PI / 2);
    g.add(H.at(H.mesh(circle, '#f4f7f2', { cast: false }), 0, 0.007, 0.8));
    g.add(H.at(H.cyl(0.08, 0.08, 0.01, '#f4f7f2', { seg: 12, cast: false }), 0, 0.007, 0.8));
    // khung thành hai bên + lưới
    [-4.35, 4.35].forEach((x) => {
      const goal = H.group(); goal.position.set(x, 0, 0.8); goal.rotation.y = x < 0 ? PI / 2 : -PI / 2;
      const post = '#ffffff';
      [-1.1, 1.1].forEach((px) => goal.add(H.at(H.cyl(0.04, 0.04, 1.2, post, { seg: 8 }), px, 0.6, 0)));
      const bar = H.cyl(0.04, 0.04, 2.24, post, { seg: 8 }); bar.rotation.z = PI / 2; goal.add(H.at(bar, 0, 1.2, 0));
      goal.add(H.at(H.box(2.2, 1.2, 0.02, H.mat('#ffffff', { opacity: 0.28, double: true }), { cast: false }), 0, 0.6, -0.55));
      [-1.1, 1.1].forEach((px) => goal.add(H.at(H.box(0.02, 1.2, 0.55, H.mat('#ffffff', { opacity: 0.22, double: true }), { cast: false }), px, 0.6, -0.28)));
      g.add(goal);
    });
    // khán đài phía sau + bảng tỷ số + băng rôn
    stands(H, g, { x0: -4.9, x1: 4.9, z: -3.9, rows: 3, step: 0.32, color: '#c62828', seed: 11 });
    g.add(H.at(H.box(10, 0.45, 0.06, '#1a237e'), 0, 0.23, -3.45));
    g.add(H.at(banner(H, 'VIỆT NAM VÔ ĐỊCH', 3.0, '#d32f2f', '#ffeb3b'), -2.2, 0.24, -3.41));
    g.add(H.at(banner(H, 'V-LEAGUE', 1.8, '#0d47a1'), 1.6, 0.24, -3.41));
    const board = H.group(); board.position.set(3.4, 2.2, -4.7);
    board.add(H.at(H.box(2.0, 0.9, 0.12, '#212121'), 0, 0, 0));
    board.add(H.at(H.sign('2 – 1', 1.8, 0.7, { bg: '#111', fg: '#ffca28', font: '900 150px "Baloo 2", system-ui', glow: true }), 0, 0, 0.07));
    board.add(H.at(H.cyl(0.05, 0.05, 2.2, '#666', { seg: 6 }), 0, -1.5, -0.05));
    g.add(board);
    floodlight(H, g, -4.7, -4.6); floodlight(H, g, 4.7, -4.6);
    // trái bóng lăn nhẹ, cột cờ góc sân
    const ball = H.group(H.sphere(0.13, '#ffffff', { seg: 16 }), H.at(H.sphere(0.135, H.mat('#222', { opacity: 0.85 }), { seg: 5, flat: true, cast: false }), 0, 0, 0));
    ball.position.set(1.2, 0.13, 1.8); g.add(ball);
    H.onUpdate((dt, t) => { ball.position.x = 1.2 + Math.sin(t * 0.7) * 0.5; ball.rotation.z = -ball.position.x / 0.13; });
    [[-4.6, 4.2], [4.6, 4.2]].forEach(([x, z]) => { g.add(H.at(H.cyl(0.02, 0.02, 0.9, '#fff', { seg: 6 }), x, 0.45, z)); g.add(H.at(H.box(0.22, 0.15, 0.01, '#ff5722'), x + 0.11, 0.82, z)); });
    // ghế dự bị
    const bench = H.group(); bench.position.set(-3.6, 0, -2.6);
    bench.add(H.at(H.box(1.8, 0.05, 0.45, '#37474f'), 0, 0.45, 0)); bench.add(H.at(H.box(1.9, 1.0, 0.04, H.mat('#bbdefb', { opacity: 0.4 })), 0, 0.9, -0.25));
    [-0.8, 0.8].forEach((x) => bench.add(H.at(H.box(0.05, 0.45, 0.4, '#263238'), x, 0.22, 0)));
    g.add(bench);
    H.nightLight(g, [0, 5, -3], '#f4f8ff', 2.2, 16);
    decorAt(H, g, opts, 3.6, -2.4);
    return { group: g, anchors: { seat: { pos: [-3.6, 0, -2.6], rotY: 0 } }, npcSpots: [{ pos: [-1.6, 0, 1.0], rotY: 0.6 }, { pos: [1.6, 0, 1.0], rotY: -0.6 }, { pos: [-1.4, 0, -0.9], rotY: 0.5 }, { pos: [1.7, 0, -0.8], rotY: -0.5 }] };
  });

  // 2. COURT — nhà thi đấu cầu lông / bóng chuyền ---------------------------------------
  KN.Env.register('court', { name: 'Nhà thi đấu', indoor: true, sky: ['#9fc2e6', '#eef2f7'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#c8925a', side: '#6b4a2e' }));
    g.add(H.room({ floor: '#d39a5c', wall: '#e8edf3', wallSide: '#dbe3ec', trim: '#1565c0', floorPattern: 'none' }));
    // sàn thi đấu xanh + vạch trắng
    g.add(H.at(H.box(6.2, 0.02, 4.6, '#2e7d5b', { cast: false }), 0, 0.05, 0.6));
    const ln = (w, d, x, z) => g.add(H.at(H.box(w, 0.012, d, '#ffffff', { cast: false }), x, 0.062, z));
    ln(6.2, 0.05, 0, -1.68); ln(6.2, 0.05, 0, 2.88); ln(0.05, 4.6, -3.08, 0.6); ln(0.05, 4.6, 3.08, 0.6); ln(6.2, 0.05, 0, -1.2);
    // lưới
    [-2.6, 2.6].forEach((x) => g.add(H.at(H.cyl(0.03, 0.03, 1.55, '#455a64', { seg: 8 }), x, 0.78, -1.2)));
    const net = H.group(); net.position.set(0, 0, -1.2);
    net.add(H.at(H.box(5.2, 0.72, 0.01, H.mat('#ffffff', { opacity: 0.35, double: true }), { cast: false }), 0, 1.15, 0));
    net.add(H.at(H.box(5.2, 0.05, 0.03, '#ffffff'), 0, 1.53, 0));
    g.add(net);
    // quả cầu lông bay qua lại
    const shuttle = H.group(H.sphere(0.035, '#ffffff', { seg: 8 }), H.at(H.cone(0.05, 0.09, '#ffffff', { seg: 8 }), 0, 0.06, 0));
    g.add(shuttle);
    H.onUpdate((dt, t) => { const k = (Math.sin(t * 1.4) + 1) / 2; shuttle.position.set(0.8, 1.6 + Math.sin(k * PI) * 1.4, -3.2 + k * 4.0); shuttle.rotation.x = (k - 0.5) * 2; });
    // khán đài, băng rôn, đồng hồ
    stands(H, g, { x0: -4.6, x1: 4.6, z: -3.9, rows: 3, step: 0.3, color: '#1565c0', seed: 21 });
    g.add(H.at(banner(H, 'GIẢI VÔ ĐỊCH QUỐC GIA', 3.6, '#1565c0'), 0, 3.2, -4.76));
    g.add(H.at(H.sign('21 – 19', 1.4, 0.5, { bg: '#111', fg: '#69f0ae', font: '900 110px "Baloo 2", system-ui', glow: true }), 3.4, 2.6, -4.76));
    for (let i = 0; i < 3; i++) g.add(H.at(H.box(1.8, 0.05, 0.3, H.glow('#ffffff', { intensity: 1.8 })), -2.4 + i * 2.4, 3.1, 0.4));
    // ghế trọng tài
    const ch = H.group(); ch.position.set(3.4, 0, 0.6);
    ch.add(H.at(H.box(0.5, 1.1, 0.5, '#455a64'), 0, 0.55, 0)); ch.add(H.at(H.box(0.55, 0.06, 0.55, '#263238'), 0, 1.12, 0));
    g.add(ch);
    H.nightLight(g, [0, 2.9, 0.5], '#ffffff', 1.4, 12);
    decorAt(H, g, opts, -3.8, 2.6);
    return { group: g, npcSpots: [{ pos: [-1.6, 0, 1.6], rotY: 0.6 }, { pos: [1.6, 0, 1.6], rotY: -0.6 }, { pos: [-1.8, 0, -0.6], rotY: 0.5 }, { pos: [1.9, 0, -0.6], rotY: -0.5 }] };
  });

  // 3. RING — sàn đấu võ ------------------------------------------------------------------
  KN.Env.register('ring', { name: 'Sàn đấu võ', indoor: true, sky: ['#1b1f33', '#3a2a4a'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#22252e', side: '#15171d' }));
    g.add(H.room({ floor: '#1d2027', wall: '#2a2e3a', wallSide: '#252935', trim: '#d32f2f', floorPattern: 'none' }));
    // bục võ đài
    const ring = H.group(); ring.position.set(0, 0, 0.6);
    ring.add(H.at(H.box(5.4, 0.02, 4.6, '#1565c0', { cast: false }), 0, 0.05, 0));
    ring.add(H.at(H.box(5.1, 0.012, 4.3, '#eceff1', { cast: false }), 0, 0.064, 0));
    ring.add(H.at(H.box(1.6, 0.01, 1.6, '#c62828', { cast: false }), 0, 0.074, 0));
    [[-2.55, -2.15, '#c62828'], [2.55, -2.15, '#1565c0'], [-2.55, 2.15, '#eceff1'], [2.55, 2.15, '#eceff1']].forEach(([x, z, c]) => ring.add(H.at(H.cyl(0.08, 0.08, 1.5, c, { seg: 10 }), x, 0.75, z)));
    [0.7, 1.0, 1.3].forEach((y, i) => {
      const c = ['#ffffff', '#d32f2f', '#ffffff'][i];
      ring.add(H.at(H.box(5.1, 0.04, 0.03, c, { cast: false }), 0, y, -2.15));
      [[-2.55, 0], [2.55, 0]].forEach(([x, z]) => ring.add(H.at(H.box(0.03, 0.04, 4.3, c, { cast: false }), x, y, z)));
    });
    g.add(ring);
    // khán giả trong bóng tối + đèn rọi
    stands(H, g, { x0: -4.6, x1: 4.6, z: -3.95, rows: 3, step: 0.3, color: '#37474f', seed: 31 });
    const spot = H.glow('#fff3d6', { intensity: 3 });
    [[-2.2, -1.4], [2.2, -1.4], [0, 2.6]].forEach(([x, z]) => { g.add(H.at(H.cone(0.3, 0.4, spot, { seg: 12 }), x, 3.4, z)); });
    const beam = H.mat('#fff6e0', { opacity: 0.08, double: true, unique: true });
    const cone = H.mesh(new THREE.ConeGeometry(2.6, 3.2, 24, 1, true), beam, { cast: false }); cone.position.set(0, 1.9, 0.6); g.add(cone);
    H.onUpdate((dt, t) => { beam.opacity = 0.07 + Math.sin(t * 2) * 0.015; });
    g.add(H.at(banner(H, 'ĐÊM TRANH ĐAI', 3.0, '#b71c1c', '#ffd54f'), 0, 3.0, -4.76));
    g.add(H.at(H.box(0.6, 0.14, 0.3, '#ffca28', { metal: 0.6, rough: 0.3 }), 3.9, 0.9, -3.0));
    g.add(H.at(H.box(0.8, 0.85, 0.5, '#263238'), 3.9, 0.42, -3.0));
    H.nightLight(g, [0, 3.2, 0.6], '#fff1d6', 2.0, 9);
    decorAt(H, g, opts, -3.9, 3.0);
    return { group: g, npcSpots: [{ pos: [-1.5, 0, 1.2], rotY: 0.7 }, { pos: [1.5, 0, 1.2], rotY: -0.7 }, { pos: [-1.6, 0, -0.6], rotY: 0.5 }, { pos: [1.6, 0, -0.6], rotY: -0.5 }] };
  });

  // 4. AIRPORT — sân đỗ máy bay -------------------------------------------------------------
  KN.Env.register('airport', { name: 'Sân bay', indoor: false, sky: ['#7cc0f5', '#f2f8ff'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#8e9399', side: '#4f5358' }));
    g.add(H.at(H.ground(10, 2.2, '#5d6268'), 0, 0.004, 3.8));
    for (let i = 0; i < 6; i++) g.add(H.at(H.ground(0.9, 0.12, '#ffeb3b'), -4.3 + i * 1.75, 0.007, 3.8));
    g.add(H.at(H.ground(10, 0.06, '#ffeb3b'), 0, 0.007, 2.6));
    // nhà ga kính phía sau
    const t = H.group(); t.position.set(0, 0, -4.4);
    t.add(H.at(H.box(10, 3.2, 1.0, H.mat('#9fd0f5', { opacity: 0.55, metal: 0.4, rough: 0.1 }), { cast: false }), 0, 1.6, 0));
    for (let i = 0; i < 11; i++) t.add(H.at(H.box(0.06, 3.2, 1.02, '#cfd8dc'), -5 + i, 1.6, 0));
    t.add(H.at(H.box(10.2, 0.3, 1.3, '#eceff1'), 0, 3.3, 0));
    t.add(H.at(H.sign('CẢNG HÀNG KHÔNG QUỐC TẾ', 4.6, 0.5, { bg: '#0d47a1', fg: '#ffffff', font: '800 70px "Baloo 2", system-ui', glow: true }), 0, 2.75, 0.52));
    g.add(t);
    // máy bay đỗ
    const plane = H.group(); plane.position.set(-0.6, 0, -3.3); plane.rotation.y = 0.12;
    const body = H.cyl(0.55, 0.55, 6.2, '#fafafa', { seg: 20 }); body.rotation.z = PI / 2; plane.add(H.at(body, 0, 1.15, 0));
    const nose = H.sphere(0.55, '#fafafa', { seg: 18, squash: [1.6, 1, 1] }); plane.add(H.at(nose, 3.1, 1.15, 0));
    const tail = H.cone(0.55, 1.4, '#fafafa', { seg: 20 }); tail.rotation.z = PI / 2; plane.add(H.at(tail, -3.8, 1.25, 0));
    plane.add(H.at(H.box(1.1, 1.3, 0.08, '#0d47a1'), -3.9, 2.0, 0));
    plane.add(H.at(H.box(1.6, 0.08, 4.6, '#e0e0e0'), -0.2, 0.95, 0));
    plane.add(H.at(H.box(0.8, 0.06, 2.2, '#e0e0e0'), -3.9, 1.35, 0));
    [-1.3, 1.3].forEach((z) => { const e = H.cyl(0.28, 0.28, 0.9, '#b0bec5', { seg: 14 }); e.rotation.z = PI / 2; plane.add(H.at(e, 0.2, 0.62, z)); });
    plane.add(H.at(H.box(5.6, 0.12, 0.02, '#0d47a1', { cast: false }), 0, 1.15, 0.56));
    for (let i = 0; i < 12; i++) plane.add(H.at(H.box(0.12, 0.14, 0.02, '#263238', { cast: false }), -2.4 + i * 0.42, 1.38, 0.555));
    [[2.4, 0], [-0.4, 0.9], [-0.4, -0.9]].forEach(([x, z]) => { plane.add(H.at(H.cyl(0.03, 0.03, 0.6, '#555', { seg: 6 }), x, 0.3, z)); plane.add(H.at(H.cyl(0.14, 0.14, 0.1, '#222', { seg: 12 }), x, 0.12, z)); });
    g.add(plane);
    // cầu thang lên máy bay + xe đẩy hành lý + cọc hướng dẫn
    const st = H.group(); st.position.set(2.9, 0, -2.0); st.rotation.y = -0.4;
    for (let i = 0; i < 6; i++) st.add(H.at(H.box(0.7, 0.05, 0.3, '#eceff1'), 0, 0.18 + i * 0.17, -i * 0.22));
    st.add(H.at(H.box(0.8, 0.5, 1.5, '#1565c0'), 0, 0.25, -0.5));
    g.add(st);
    const cart = H.group(); cart.position.set(-3.6, 0, 0.6);
    cart.add(H.at(H.box(1.2, 0.06, 0.7, '#607d8b'), 0, 0.3, 0));
    [['#e53935', -0.3], ['#1e88e5', 0.1], ['#fdd835', 0.45]].forEach(([c, x]) => cart.add(H.at(H.rbox(0.32, 0.42, 0.24, 0.04, c), x, 0.55, 0)));
    g.add(cart);
    [[3.6, 1.0], [-1.8, 1.6]].forEach(([x, z]) => { g.add(H.at(H.cone(0.14, 0.4, '#ff6d00', { seg: 10 }), x, 0.2, z)); });
    H.nightLight(g, [0, 3.4, -3], '#e8f1ff', 1.6, 12);
    decorAt(H, g, opts, 3.8, -3.0);
    return { group: g, npcSpots: [{ pos: [-1.5, 0, 1.2], rotY: 0.6 }, { pos: [1.5, 0, 1.2], rotY: -0.6 }, { pos: [-2.0, 0, 0.0], rotY: 0.5 }, { pos: [1.2, 0, 0.2], rotY: -0.5 }] };
  });

  // 5. STUDIO — phim trường & sàn diễn thời trang ----------------------------------------------
  KN.Env.register('studio', { name: 'Phim trường', indoor: true, sky: ['#2b2140', '#5b3b6e'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#2c2f38', side: '#1b1d23' }));
    g.add(H.room({ floor: '#25272e', wall: '#1f2128', wallSide: '#22242b', trim: '#ffb300', floorPattern: 'none' }));
    // sàn catwalk bóng loáng chạy về phía trước
    g.add(H.at(H.box(1.8, 0.03, 7.2, H.mat('#f5f5f5', { rough: 0.12, metal: 0.1 }), { cast: false }), 0, 0.055, 0.2));
    const strip = [];
    for (let i = 0; i < 14; i++) [-0.92, 0.92].forEach((x) => strip.push({ x, y: 0.07, z: -3.2 + i * 0.5 }));
    g.add(H.instanced(new THREE.SphereGeometry(0.04, 8, 6), H.glow('#ffe082', { intensity: 2.4 }), strip, { cast: false }));
    // phông nền + chữ
    g.add(H.at(H.box(4.2, 3.0, 0.06, '#7b1fa2', { cast: false }), 0, 1.7, -4.7));
    g.add(H.at(H.sign('FASHION WEEK', 3.4, 0.7, { bg: '#7b1fa2', fg: '#ffffff', font: '900 120px "Baloo 2", system-ui', glow: true }), 0, 2.3, -4.64));
    // máy quay trên chân + ghế đạo diễn + clapperboard + đèn softbox
    const cam = H.group(); cam.position.set(-3.0, 0, 1.6); cam.rotation.y = 0.9;
    [0, 2.1, 4.2].forEach((a) => { const leg = H.cyl(0.02, 0.02, 1.4, '#222', { seg: 6 }); leg.rotation.z = 0.25; const lg = H.group(H.at(leg, 0.17, 0.66, 0)); lg.rotation.y = a; cam.add(lg); });
    cam.add(H.at(H.box(0.5, 0.32, 0.3, '#212121'), 0, 1.45, 0));
    const lens = H.cyl(0.12, 0.14, 0.3, '#424242', { seg: 14 }); lens.rotation.z = PI / 2; cam.add(H.at(lens, 0.38, 1.45, 0));
    cam.add(H.at(H.sphere(0.03, H.glow('#ff1744', { intensity: 3 }), { seg: 8 }), -0.2, 1.65, 0.1));
    g.add(cam);
    const dc = H.group(); dc.position.set(3.1, 0, 1.8); dc.rotation.y = -0.8;
    dc.add(H.at(H.box(0.6, 0.05, 0.5, '#5d4037'), 0, 0.75, 0)); dc.add(H.at(H.box(0.6, 0.35, 0.03, '#212121'), 0, 1.1, -0.24));
    dc.add(H.at(H.sign('ĐẠO DIỄN', 0.58, 0.14, { bg: '#212121', fg: '#fff', font: '800 60px "Baloo 2", system-ui' }), 0, 1.1, -0.22));
    [[-0.27, -0.22], [0.27, -0.22], [-0.27, 0.22], [0.27, 0.22]].forEach(([x, z]) => dc.add(H.at(H.box(0.04, 0.75, 0.04, '#5d4037'), x, 0.37, z)));
    g.add(dc);
    [[-3.6, -2.4], [3.6, -2.4]].forEach(([x, z]) => {
      const sb = H.group(); sb.position.set(x, 0, z); sb.lookAt(0, 0, 0.5);
      sb.add(H.at(H.cyl(0.03, 0.03, 2.0, '#333', { seg: 6 }), 0, 1.0, 0));
      sb.add(H.at(H.box(0.9, 0.9, 0.1, H.glow('#fff8ee', { intensity: 2.2 })), 0, 2.1, 0.05));
      g.add(sb);
    });
    // khán giả hai bên catwalk + chớp đèn flash
    stands(H, g, { x0: -4.6, x1: -1.3, z: -1.0, rows: 2, step: 0.3, color: '#424242', seed: 41 });
    stands(H, g, { x0: 1.3, x1: 4.6, z: -1.0, rows: 2, step: 0.3, color: '#424242', seed: 42 });
    const flash = H.glow('#ffffff', { intensity: 0 }); const fl = H.sphere(0.06, flash, { seg: 8, cast: false }); g.add(fl);
    H.onUpdate((dt, t) => { const k = (t * 1.7) % 1; fl.position.set(Math.sin(t * 13) * 3.4, 0.9, -1.0); flash.emissiveIntensity = k < 0.06 ? 4 : 0; });
    H.nightLight(g, [0, 3.0, 0], '#ffe9c4', 1.8, 10);
    decorAt(H, g, opts, 3.8, 3.2);
    return { group: g, npcSpots: [{ pos: [-1.8, 0, 1.4], rotY: 0.6 }, { pos: [1.8, 0, 1.4], rotY: -0.6 }, { pos: [-1.9, 0, 0.2], rotY: 0.5 }, { pos: [1.9, 0, 0.2], rotY: -0.5 }] };
  });
})();
