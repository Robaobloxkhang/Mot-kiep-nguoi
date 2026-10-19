/* Một Kiếp Người — cảnh du lịch nước ngoài: Tokyo · Seoul · Paris · Bangkok (dùng cho "Đi du lịch") */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  if (!KN.Env || !window.THREE) return;
  const THREE = window.THREE;
  const PI = Math.PI;
  const SPOTS = [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-2.6, 0, 0.2], rotY: 0.8 }, { pos: [2.6, 0, 0.2], rotY: -0.8 }];

  // cây hoa anh đào / hoa giấy: thân + vài chùm cầu hoa
  function blossomTree(H, color, seed, h) {
    const r = H.rng(seed), g = H.group();
    h = h || 2.6;
    g.add(H.at(H.cyl(0.09, 0.14, h * 0.6, '#5b3a29', { seg: 8 }), 0, h * 0.3, 0));
    for (let i = 0; i < 6; i++) {
      const a = r() * PI * 2, d = 0.2 + r() * 0.5;
      g.add(H.at(H.sphere(0.45 + r() * 0.25, color, { seg: 10, flat: true }), Math.cos(a) * d, h * 0.62 + r() * 0.5, Math.sin(a) * d));
    }
    return g;
  }
  function paperLantern(H, color, x, y, z) { const l = H.group(H.at(H.sphere(0.18, H.glow(color, { intensity: 1.6 }), { seg: 10, squash: [1, 1.3, 1] }), 0, 0, 0), H.at(H.cyl(0.08, 0.08, 0.04, '#222', { seg: 8 }), 0, 0.24, 0), H.at(H.cyl(0.08, 0.08, 0.04, '#222', { seg: 8 }), 0, -0.24, 0)); l.position.set(x, y, z); return l; }
  function petals(H, g, color, n) {
    const list = [];
    for (let i = 0; i < n; i++) { const p = H.box(0.06, 0.01, 0.05, H.mat(color, { unique: true }), { cast: false }); g.add(p); list.push(p); }
    H.onUpdate((dt, t) => list.forEach((p, i) => { const k = (t * 0.08 + i / n) % 1; p.position.set(-4 + ((i * 37) % 80) / 10 + Math.sin(t + i) * 0.4, 4.2 - k * 4.2, -3 + ((i * 53) % 60) / 10); p.rotation.set(t * 2 + i, t + i, 0); }));
  }

  // 1. TOKYO — cổng torii, hoa anh đào, núi Phú Sĩ, đèn lồng giấy, máy bán nước tự động ----------------
  KN.Env.register('tokyo', { name: 'Tokyo', indoor: false, sky: ['#9fc6ef', '#ffe3ec'] }, function (H) {
    const g = H.group(), r = H.rng(811);
    g.add(H.slab(10, 10, { top: '#d9d2c3', side: '#7a6a55' }));
    const stones = []; for (let i = 0; i < 7; i++) stones.push({ x: 0, y: 0.006, z: 3.6 - i * 1.05, sx: 1.4, sz: 0.9 });
    g.add(H.instanced(new THREE.BoxGeometry(1, 0.012, 1), '#b8ad99', stones, { cast: false }));
    // núi Phú Sĩ phía xa
    const fuji = H.group(H.at(H.cone(3.2, 3.0, '#6f86a8', { seg: 24 }), 0, 1.5, 0), H.at(H.cone(1.15, 1.08, '#f5f8ff', { seg: 24 }), 0, 2.47, 0));
    fuji.position.set(-1.0, -0.2, -4.3); fuji.scale.setScalar(0.55); g.add(fuji);
    // cổng torii đỏ
    const red = '#d4381f', tor = H.group();
    [-1.2, 1.2].forEach((x) => tor.add(H.at(H.cyl(0.12, 0.14, 2.9, red, { seg: 12 }), x, 1.45, 0)));
    tor.add(H.at(H.box(3.4, 0.2, 0.3, '#1d1d1d'), 0, 3.0, 0));
    tor.add(H.at(H.box(3.0, 0.16, 0.22, red), 0, 2.72, 0));
    tor.add(H.at(H.box(3.1, 0.12, 0.26, red), 0, 2.9, 0));
    tor.add(H.at(H.box(0.2, 0.3, 0.06, '#1d1d1d'), 0, 2.82, 0.14));
    tor.position.set(0, 0, -1.8); g.add(tor);
    // đền nhỏ phía sau
    const hall = H.group(H.at(H.box(3.6, 0.35, 1.8, '#8c7b66'), 0, 0.17, 0), H.at(H.box(3.0, 1.6, 1.3, '#efe4cf'), 0, 1.15, 0), H.at(H.box(0.9, 1.2, 0.05, '#5a2c1a'), 0, 0.95, 0.66));
    const roof = H.cone(2.3, 1.1, '#3b3f46', { seg: 4 }); roof.rotation.y = PI / 4; roof.scale.set(1.0, 1, 0.62); const rg = H.group(roof); rg.rotation.y = 0; hall.add(H.at(rg, 0, 2.45, 0));
    hall.position.set(0, 0, -3.8); g.add(hall);
    // hoa anh đào
    [[-3.6, -2.6], [3.5, -2.8], [-3.9, 1.6], [3.8, 1.2]].forEach(([x, z], i) => g.add(H.at(blossomTree(H, ['#ffc0d6', '#ffd1e0', '#ffb3cc'][i % 3], 20 + i, 2.6 + r() * 0.6), x, 0, z)));
    // đèn lồng đá + đèn giấy
    [[-1.9, -0.6], [1.9, -0.6]].forEach(([x, z]) => g.add(H.group(H.at(H.box(0.3, 0.6, 0.3, '#a59a88'), x, 0.3, z), H.at(H.box(0.4, 0.06, 0.4, '#8e8474'), x, 0.63, z), H.at(H.box(0.24, 0.22, 0.24, H.glow('#ffd58a', { intensity: 1.4 })), x, 0.77, z), H.at(H.cone(0.3, 0.22, '#8e8474', { seg: 4 }), x, 1.0, z))));
    g.add(paperLantern(H, '#ff5a3c', -1.2, 2.3, -1.6)); g.add(paperLantern(H, '#ff5a3c', 1.2, 2.3, -1.6));
    // máy bán nước tự động
    const vm = H.group(H.at(H.box(0.8, 1.8, 0.6, '#e8eef5'), 0, 0.9, 0), H.at(H.box(0.66, 0.9, 0.02, H.glow('#bfe3ff', { intensity: 1.2 })), 0, 1.2, 0.31));
    for (let i = 0; i < 8; i++) vm.add(H.at(H.cyl(0.04, 0.04, 0.14, ['#e53935', '#43a047', '#1e88e5', '#fdd835'][i % 4], { seg: 8, cast: false }), -0.24 + (i % 4) * 0.16, 1.45 - Math.floor(i / 4) * 0.3, 0.33));
    vm.position.set(4.1, 0, -1.0); vm.rotation.y = -0.5; g.add(vm);
    g.add(H.at(H.sign('東京 TOKYO', 1.6, 0.4, { bg: '#1d1d1d', fg: '#ffd54f', font: '800 64px "Be Vietnam Pro", sans-serif', glow: true }), -3.4, 2.2, -3.9));
    petals(H, g, '#ffc6da', 26);
    H.nightLight(g, [0, 2.4, -1.6], '#ffb36b', 1.3, 8);
    return { group: g, npcSpots: SPOTS, anchors: {} };
  });

  // 2. SEOUL — cổng cung điện, tháp Namsan, biển hiệu neon, xe đẩy tteokbokki --------------------------
  KN.Env.register('seoul', { name: 'Seoul', indoor: false, sky: ['#8fbde8', '#f6ecff'] }, function (H) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#c9c4bd', side: '#5f5a55' }));
    g.add(H.ground(10, 1.6, '#3c3f45'));
    // cổng cung điện (kiểu Gyeongbokgung)
    const gate = H.group();
    gate.add(H.at(H.box(5.4, 1.4, 1.4, '#b9a48a'), 0, 0.7, 0));
    [-1.6, 0, 1.6].forEach((x) => gate.add(H.at(H.box(0.9, 1.1, 1.45, '#3a2a22'), x, 0.55, 0)));
    gate.add(H.at(H.box(4.2, 1.0, 1.0, '#c0392b'), 0, 1.9, 0));
    for (let i = -3; i <= 3; i++) gate.add(H.at(H.box(0.12, 0.9, 0.12, '#2e7d5b'), i * 0.6, 1.9, 0.52));
    const r1 = H.box(5.2, 0.14, 1.9, '#2f3640'); r1.rotation.x = 0.35; gate.add(H.at(r1, 0, 2.6, 0.5));
    const r2 = H.box(5.2, 0.14, 1.9, '#262b33'); r2.rotation.x = -0.35; gate.add(H.at(r2, 0, 2.6, -0.5));
    gate.add(H.at(H.sign('광화문', 1.1, 0.34, { bg: '#1b2a4a', fg: '#ffd54f', font: '800 70px sans-serif' }), 0, 2.15, 0.52));
    gate.position.set(-0.6, 0, -3.6); g.add(gate);
    // tháp Namsan trên đồi
    const hill = H.sphere(1.5, '#4f8a4a', { seg: 16, squash: [1.3, 0.6, 1] }); hill.position.set(3.4, -0.3, -4.6); g.add(hill);
    const tw = H.group(H.at(H.cyl(0.08, 0.14, 2.6, '#e8e8e8', { seg: 10 }), 0, 1.3, 0), H.at(H.cyl(0.38, 0.3, 0.4, '#f0f0f0', { seg: 14 }), 0, 2.3, 0), H.at(H.cyl(0.02, 0.04, 0.9, '#d33', { seg: 6 }), 0, 3.0, 0));
    tw.position.set(3.4, 0.5, -4.6); g.add(tw);
    // dãy biển hiệu neon
    const signs = [['치킨 CHICKEN', '#ff3d7f'], ['노래방', '#4fc3f7'], ['K-POP', '#b388ff'], ['카페', '#69f0ae']];
    signs.forEach(([t, c], i) => g.add(H.at(H.sign(t, 1.2, 0.36, { bg: '#141421', fg: c, font: '800 64px sans-serif', glow: true }), -4.4, 2.4 - i * 0.48, -0.8 + i * 0.05, PI / 2)));
    g.add(H.at(H.box(0.3, 3.0, 3.0, '#5a5f6b'), -4.7, 1.5, -0.6));
    // xe đẩy đồ ăn vỉa hè
    const cart = H.group(H.at(H.box(1.4, 0.8, 0.7, '#d84315'), 0, 0.6, 0), H.at(H.box(1.5, 0.06, 0.8, '#bdbdbd'), 0, 1.02, 0), H.at(H.box(1.6, 0.06, 1.0, '#ff7043'), 0, 1.9, 0));
    [-0.7, 0.7].forEach((x) => cart.add(H.at(H.cyl(0.03, 0.03, 0.9, '#888', { seg: 6 }), x, 1.45, 0.4)));
    for (let i = 0; i < 6; i++) cart.add(H.at(H.cyl(0.04, 0.04, 0.16, '#ff1744', { seg: 6 }), -0.4 + (i % 3) * 0.2, 1.1, -0.15 + Math.floor(i / 3) * 0.25));
    cart.position.set(2.7, 0, 0.6); cart.rotation.y = -0.4; g.add(cart);
    g.add(H.at(H.tree('round', { h: 3.0, leaves: '#e88b2f', seed: 31 }), -3.4, 0, 2.6));
    g.add(H.at(H.tree('round', { h: 2.7, leaves: '#d9a32c', seed: 33 }), 4.0, 0, 2.8));
    H.nightLight(g, [-4.2, 2.2, -0.6], '#ff6ec7', 1.4, 7);
    H.nightLight(g, [2.7, 1.9, 0.6], '#ffd08a', 1.0, 5);
    return { group: g, npcSpots: SPOTS, anchors: {} };
  });

  // 3. PARIS — tháp Eiffel, quán cà phê vỉa hè, đèn đường cổ, sông Seine -------------------------------
  KN.Env.register('paris', { name: 'Paris', indoor: false, sky: ['#9cc2e6', '#ffe6cf'] }, function (H) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#d8cdb8', side: '#7d6e58' }));
    // sông phía sau
    const river = H.ground(10, 2.0, H.mat('#4f7f9a', { rough: 0.15, metal: 0.3 })); river.position.z = -4.0; river.position.y = 0.01; g.add(river);
    // tháp Eiffel: 3 khối chóp cụt 4 cạnh chồng lên nhau, có vòm cong ở chân và 2 tầng sàn
    const iron = '#7a6650', ef = H.group();
    const p1 = H.cyl(0.62, 1.35, 2.0, iron, { seg: 4 }); p1.rotation.y = PI / 4; ef.add(H.at(p1, 0, 1.0, 0));
    const arch = H.torus(0.62, 0.12, '#8c7860', { arc: PI }); ef.add(H.at(arch, 0, 0.05, 0.75)); const arch2 = H.torus(0.62, 0.12, '#8c7860', { arc: PI }); arch2.rotation.y = PI / 2; ef.add(H.at(arch2, 0.75, 0.05, 0));
    ef.add(H.at(H.box(1.5, 0.14, 1.5, '#5e4e3c'), 0, 2.05, 0));
    const p2 = H.cyl(0.24, 0.6, 2.2, iron, { seg: 4 }); p2.rotation.y = PI / 4; ef.add(H.at(p2, 0, 3.2, 0));
    ef.add(H.at(H.box(0.6, 0.1, 0.6, '#5e4e3c'), 0, 4.3, 0));
    const p3 = H.cyl(0.03, 0.24, 1.9, iron, { seg: 4 }); p3.rotation.y = PI / 4; ef.add(H.at(p3, 0, 5.25, 0));
    ef.add(H.at(H.sphere(0.07, H.glow('#ffe08a', { intensity: 2.0 }), { seg: 8 }), 0, 6.25, 0));
    ef.scale.setScalar(1.05);
    ef.position.set(2.8, 0, -3.9); g.add(ef);
    // dãy nhà kiểu Haussmann bên trái
    for (let i = 0; i < 3; i++) {
      const b = H.group(H.at(H.box(1.6, 3.0, 1.4, '#efe1c6'), 0, 1.5, 0), H.at(H.box(1.7, 0.5, 1.5, '#5b6b7a'), 0, 3.25, 0));
      for (let k = 0; k < 6; k++) b.add(H.at(H.box(0.3, 0.45, 0.04, H.glow('#ffe2a8', { intensity: 0.9 })), -0.45 + (k % 3) * 0.45, 1.2 + Math.floor(k / 3) * 0.9, 0.72));
      b.position.set(-4.2 + i * 1.65, 0, -2.6); g.add(b);
    }
    g.add(H.at(H.sign('CAFÉ DE FLORE', 1.6, 0.3, { bg: '#1e3d2f', fg: '#fdf6e3', font: '700 56px serif' }), -2.55, 2.05, -1.88));
    // bàn ghế cà phê
    [[-2.8, -0.6], [-1.4, -0.4]].forEach(([x, z]) => {
      const t = H.group(H.at(H.cyl(0.35, 0.35, 0.04, '#e8e8e8', { seg: 16 }), 0, 0.75, 0), H.at(H.cyl(0.03, 0.03, 0.75, '#333', { seg: 6 }), 0, 0.37, 0));
      [-0.55, 0.55].forEach((dx) => t.add(H.group(H.at(H.box(0.36, 0.04, 0.36, '#b5651d'), dx, 0.45, 0), H.at(H.box(0.36, 0.4, 0.04, '#b5651d'), dx, 0.67, -0.17 * Math.sign(dx)))));
      t.add(H.at(H.cyl(0.04, 0.03, 0.08, '#fff', { seg: 8 }), 0.1, 0.81, 0));
      t.position.set(x, 0, z); g.add(t);
    });
    // mái hiên sọc
    const aw = H.box(3.4, 0.08, 1.0, '#c62828'); aw.rotation.x = 0.35; g.add(H.at(aw, -2.6, 2.4, -1.4));
    // đèn đường cổ
    // nền lát đá + bồn hoa
    const cob = []; for (let x = 0; x < 9; x++) for (let z = 0; z < 4; z++) if ((x + z) % 2) cob.push({ x: -4 + x, y: 0.005, z: 0.4 + z, sx: 0.95, sz: 0.95 });
    g.add(H.instanced(new THREE.BoxGeometry(1, 0.01, 1), '#c7baa2', cob, { cast: false }));
    [[-0.6, 3.9], [2.2, 3.9]].forEach(([x, z]) => { g.add(H.at(H.box(1.6, 0.3, 0.6, '#8d7b65'), x, 0.15, z)); for (let k = 0; k < 5; k++) g.add(H.at(H.sphere(0.12, ['#e91e63', '#ffeb3b', '#ff5722', '#9c27b0'][k % 4], { seg: 8 }), x - 0.6 + k * 0.3, 0.38, z)); });
    [[-4.3, 1.9], [4.3, 2.6]].forEach(([x, z]) => g.add(H.group(H.at(H.cyl(0.05, 0.08, 2.8, '#1f2a2e', { seg: 8 }), x, 1.4, z), H.at(H.box(0.28, 0.36, 0.28, H.glow('#ffe1a0', { intensity: 1.8 })), x, 2.95, z))));
    g.add(H.at(H.tree('round', { h: 3.2, leaves: '#5d9b4a', seed: 41 }), 4.2, 0, -1.2));
    H.nightLight(g, [2.6, 4.0, -4.4], '#ffcf7a', 1.6, 10);
    H.nightLight(g, [-2.6, 2.0, -1.0], '#ffd9a0', 1.0, 6);
    return { group: g, npcSpots: SPOTS, anchors: {} };
  });

  // 4. BANGKOK — chùa vàng, xe tuk-tuk, chợ nổi trên kênh ------------------------------------------------
  KN.Env.register('bangkok', { name: 'Bangkok', indoor: false, sky: ['#7fc2ef', '#fff1cf'] }, function (H) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#d6c7a6', side: '#7a6340' }));
    // kênh nước phía trước bên phải
    const canalGeo = new THREE.PlaneGeometry(4.2, 2.0, 16, 6); canalGeo.rotateX(-PI / 2);
    const canal = H.mesh(canalGeo, new THREE.MeshStandardMaterial({ color: '#5b8f6e', roughness: 0.2, metalness: 0.2 }), { cast: false }); canal.position.set(2.8, 0.02, 3.4); g.add(canal);
    const boat = H.group(H.at(H.box(1.8, 0.2, 0.5, '#6d4c33'), 0, 0.1, 0));
    ['#ffeb3b', '#ff7043', '#8bc34a', '#e91e63'].forEach((c, i) => boat.add(H.at(H.sphere(0.12, c, { seg: 8 }), -0.6 + i * 0.4, 0.28, 0)));
    boat.add(H.at(H.cone(0.32, 0.25, '#e0c070', { seg: 12 }), 0.7, 0.55, 0)); // nón lá người bán
    boat.position.set(2.8, 0.05, 3.3); g.add(boat);
    H.onUpdate((dt, t) => { boat.position.x = 2.8 + Math.sin(t * 0.3) * 1.0; boat.position.y = 0.05 + Math.sin(t * 1.5) * 0.02; });
    // chùa vàng (bảo tháp chuông)
    const gold = H.mat('#e5b33a', { metal: 0.7, rough: 0.3 }), wat = H.group();
    wat.add(H.at(H.box(3.2, 0.5, 3.2, '#f2efe6'), 0, 0.25, 0));
    wat.add(H.at(H.box(2.4, 0.5, 2.4, '#f2efe6'), 0, 0.75, 0));
    wat.add(H.at(H.sphere(0.95, gold, { seg: 20, squash: [1, 1.15, 1] }), 0, 1.75, 0));
    for (let i = 0; i < 5; i++) wat.add(H.at(H.torus(0.42 - i * 0.07, 0.05, gold), 0, 2.75 + i * 0.16, 0));
    wat.add(H.at(H.cone(0.12, 1.4, gold, { seg: 10 }), 0, 4.1, 0));
    [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(([x, z]) => wat.add(H.at(H.cone(0.18, 1.1, gold, { seg: 8 }), x, 1.55, z)));
    wat.position.set(-1.6, 0, -3.5); g.add(wat);
    // xe tuk-tuk
    const tuk = H.group(H.at(H.rbox(1.5, 0.55, 0.9, 0.12, '#1565c0'), 0, 0.55, 0), H.at(H.box(1.2, 0.06, 1.0, '#ffca28'), -0.15, 1.45, 0));
    [[-0.7, 0.42], [-0.7, -0.42], [0.6, -0.42], [0.6, 0.42]].forEach(([x, z]) => tuk.add(H.at(H.cyl(0.03, 0.03, 0.6, '#aaa', { seg: 6 }), x, 1.15, z)));
    [[-0.5, 0.48], [-0.5, -0.48], [0.65, 0]].forEach(([x, z]) => { const w = H.cyl(0.2, 0.2, 0.1, '#222', { seg: 12 }); w.rotation.x = PI / 2; tuk.add(H.at(w, x, 0.2, z)); });
    tuk.add(H.at(H.sign('TUK TUK', 0.9, 0.2, { bg: '#ffca28', fg: '#1a1a1a', font: '800 60px sans-serif' }), -0.15, 1.6, 0.52));
    tuk.position.set(2.4, 0, 0.0); tuk.rotation.y = -0.5; g.add(tuk);
    // hàng quán vỉa hè + cây
    const stall = H.group(H.at(H.box(1.4, 0.8, 0.6, '#795548'), 0, 0.4, 0), H.at(H.box(1.6, 0.05, 0.9, '#e53935'), 0, 1.85, 0));
    [-0.7, 0.7].forEach((x) => stall.add(H.at(H.cyl(0.03, 0.03, 1.05, '#888', { seg: 6 }), x, 1.32, 0.3)));
    for (let i = 0; i < 5; i++) stall.add(H.at(H.sphere(0.1, ['#ff9800', '#ffeb3b', '#8bc34a'][i % 3], { seg: 8 }), -0.5 + i * 0.25, 0.86, 0));
    stall.position.set(-3.6, 0, 0.8); stall.rotation.y = 0.5; g.add(stall);
    g.add(H.at(H.tree('palm', { h: 3.6, seed: 61, leaves: '#3f9b4a' }), 4.1, 0, -2.2));
    g.add(H.at(H.tree('banana', { seed: 62 }), -4.2, 0, -1.4));
    g.add(H.at(paperLantern(H, '#ffb300', 0, 0, 0), -3.6, 2.2, 0.8));
    H.nightLight(g, [-1.6, 3.0, -3.0], '#ffcf6a', 1.4, 9);
    H.nightLight(g, [-3.6, 1.9, 0.8], '#ffb36b', 0.9, 5);
    return { group: g, npcSpots: SPOTS, anchors: {} };
  });
})();
