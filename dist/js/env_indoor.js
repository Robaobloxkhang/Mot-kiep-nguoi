/* Một Kiếp Người — indoor dioramas: home, bedroom, hospital, school, office, gym, karaoke, cafe. SPEC §4.3/§4.6 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  if (!KN.Env || !window.THREE) return;
  const PI = Math.PI;

  // shared little builders --------------------------------------------------
  function decorAt(H, g, opts, x, z, ry) {
    if (!opts.decor || !H.decor[opts.decor]) return;
    g.add(H.at(H.decor[opts.decor](), x ?? 3.2, 0, z ?? -3.2, ry || 0));
  }
  function chair(H, color, back = true) {
    const g = H.group();
    g.add(H.at(H.box(0.46, 0.05, 0.44, color), 0, 0.45, 0));
    [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(([x, z]) => g.add(H.at(H.box(0.04, 0.45, 0.04, color), x, 0.225, z)));
    if (back) g.add(H.at(H.box(0.46, 0.5, 0.04, color), 0, 0.72, -0.2));
    return g;
  }
  function books(H, n, seed) {
    const r = H.rng(seed || 3), g = H.group(); let x = 0;
    const cols = ['#b23a48', '#2d6cdf', '#2f9e6e', '#e0a100', '#7b4fd6', '#e86f2c'];
    for (let i = 0; i < n; i++) { const w = 0.05 + r() * 0.04, h = 0.2 + r() * 0.1; g.add(H.at(H.box(w, h, 0.17, cols[Math.floor(r() * cols.length)]), x + w / 2, h / 2, 0)); x += w + 0.005; }
    return g;
  }
  function ceilingFan(H, g, x, y, z) {
    const f = H.group(); f.position.set(x, y, z);
    f.add(H.at(H.cyl(0.02, 0.02, 0.4, '#d9d9d9', { seg: 6 }), 0, 0.2, 0));
    f.add(H.at(H.cyl(0.1, 0.12, 0.1, '#f0f0f0', { seg: 12 }), 0, 0, 0));
    const bl = H.group();
    for (let i = 0; i < 3; i++) { const b = H.box(0.75, 0.015, 0.13, '#e8e2d6'); b.geometry = H.box(0.75, 0.015, 0.13, '#e8e2d6').geometry; const p = H.group(H.at(b, 0.42, 0, 0)); p.rotation.y = (i / 3) * PI * 2; bl.add(p); }
    f.add(bl); g.add(f);
    H.onUpdate((dt) => { bl.rotation.y += dt * 6; });
  }
  function plantHanging(H, g, x, y, z) {
    g.add(H.at(H.cyl(0.004, 0.004, 0.6, '#555', { seg: 4, cast: false }), x, y + 0.3, z));
    g.add(H.at(H.cyl(0.14, 0.1, 0.16, '#c56b3c', { seg: 12 }), x, y, z));
    g.add(H.at(H.sphere(0.2, '#4f9a4a', { seg: 9, flat: true, squash: [1.1, 0.8, 1.1] }), x, y + 0.08, z));
    g.add(H.at(H.sphere(0.13, '#3f8a3e', { seg: 8, flat: true }), x + 0.06, y - 0.12, z + 0.05));
  }

  // 1. HOME — phòng khách nhà ống ----------------------------------------------
  KN.Env.register('home', { name: 'Nhà', indoor: true, sky: ['#9ccbe8', '#fde9cf'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#cdb89a', side: '#7a5a42', under: '#5b4231' }));
    g.add(H.room({ floor: '#ece0c8', wall: '#f4e3bd', wallSide: '#efd9ab', trim: '#8a5a3a', floorPattern: 'tile', windowSide: true }));
    const wood = '#7b4528', woodD = '#5c321c';
    // ancestral altar (bàn thờ treo) above the sofa
    g.add(H.at(H.box(2.0, 1.25, 0.04, '#8e1b12'), -0.5, 2.25, -4.79));
    g.add(H.at(H.sign('PHÚC  LỘC  THỌ', 1.7, 0.32, { bg: '#8e1b12', fg: '#ffd54f', font: '700 54px "Be Vietnam Pro", serif' }), -0.5, 2.62, -4.76));
    g.add(H.at(H.box(1.9, 0.08, 0.5, woodD), -0.5, 1.98, -4.6));
    g.add(H.at(H.box(1.9, 0.12, 0.06, '#c9a227'), -0.5, 1.93, -4.36));
    g.add(H.at(H.cyl(0.11, 0.09, 0.14, '#c9a227', { seg: 14, metal: 0.5, rough: 0.35 }), -0.5, 2.09, -4.55));
    for (let i = 0; i < 3; i++) g.add(H.at(H.cyl(0.006, 0.006, 0.28, '#b3261e', { seg: 4, cast: false }), -0.53 + i * 0.03, 2.28, -4.55));
    g.add(H.at(H.cyl(0.18, 0.12, 0.04, '#d8c08a', { seg: 14 }), -1.05, 2.04, -4.55));
    [['#ff9f1c', -1.1, 0], ['#ffd23f', -1.0, 0.04], ['#7cb342', -1.05, -0.06], ['#ff7043', -0.98, -0.02]].forEach(([c, x, z], i) => g.add(H.at(H.sphere(0.065, c, { seg: 10 }), x, 2.11 + (i > 2 ? 0.08 : 0), -4.55 + z)));
    const lampM = H.glow('#ff3d2e', { intensity: 2.2 });
    [-1.3, 0.3].forEach((x) => { g.add(H.at(H.cyl(0.05, 0.06, 0.18, lampM, { seg: 10 }), x, 2.11, -4.58)); });
    g.add(H.at(H.box(0.3, 0.38, 0.03, '#3e2723'), 0.05, 2.22, -4.7));
    g.add(H.at(H.box(0.24, 0.31, 0.035, '#cfd8dc'), 0.05, 2.22, -4.69));
    // wooden sofa set along the back wall, facing the camera
    const sofa = H.group(); sofa.position.set(-0.5, 0, -4.15);
    sofa.add(H.at(H.box(2.3, 0.08, 0.62, wood), 0, 0.42, 0));
    sofa.add(H.at(H.rbox(2.2, 0.1, 0.56, 0.04, '#b5562f'), 0, 0.5, 0.02));
    sofa.add(H.at(H.box(2.3, 0.62, 0.07, wood), 0, 0.78, -0.3));
    [-1.14, 1.14].forEach((x) => { sofa.add(H.at(H.box(0.08, 0.66, 0.62, wood), x, 0.55, 0)); sofa.add(H.at(H.box(0.06, 0.42, 0.06, woodD), x, 0.21, 0.27)); sofa.add(H.at(H.box(0.06, 0.42, 0.06, woodD), x, 0.21, -0.27)); });
    for (let i = 0; i < 4; i++) sofa.add(H.at(H.box(0.04, 0.42, 0.04, woodD), -0.75 + i * 0.5, 0.78, -0.27));
    [-0.7, 0.7].forEach((x, i) => sofa.add(H.at(H.rbox(0.42, 0.36, 0.14, 0.06, i ? '#e0a100' : '#2f7d6d'), x, 0.72, -0.2)));
    g.add(sofa);
    // coffee table + tea set
    g.add(H.at(H.ground(2.7, 1.7, '#9b3a2a'), -0.5, 0, -3.15));
    g.add(H.at(H.ground(2.4, 1.4, '#c9774f'), -0.5, 0.001, -3.15));
    g.add(H.at(H.box(1.3, 0.06, 0.66, wood), -0.5, 0.45, -3.15));
    [[-1.1, -3.4], [0.1, -3.4], [-1.1, -2.9], [0.1, -2.9]].forEach(([x, z]) => g.add(H.at(H.box(0.06, 0.42, 0.06, woodD), x, 0.21, z)));
    g.add(H.at(H.sphere(0.1, '#f2f2ee', { seg: 14, squash: [1, 0.85, 1] }), -0.65, 0.56, -3.15));
    const spout = H.at(H.cyl(0.015, 0.015, 0.1, '#f2f2ee', { seg: 6 }), -0.53, 0.58, -3.15); spout.rotation.z = -0.9; g.add(spout);
    for (let i = 0; i < 4; i++) g.add(H.at(H.cyl(0.03, 0.025, 0.045, '#f2f2ee', { seg: 10 }), -0.35 + (i % 2) * 0.1, 0.505, -3.22 + Math.floor(i / 2) * 0.12));
    g.add(H.at(H.cyl(0.13, 0.13, 0.015, '#c9a227', { seg: 16 }), -0.3, 0.485, -3.16));
    const teaSteam = H.group(); g.add(teaSteam);
    // TV on the left wall
    g.add(H.at(H.box(0.5, 0.55, 1.8, woodD), -4.55, 0.275, 1.0));
    g.add(H.at(H.box(0.08, 0.78, 1.32, '#1d1d22'), -4.55, 1.0, 1.0));
    const screen = H.glow('#5aa9ff', { intensity: 0.9 });
    screen.emissiveIntensity = 0.8; screen.userData.glowMax = 1.0;
    g.add(H.at(H.box(0.02, 0.68, 1.2, screen), -4.5, 1.0, 1.0));
    g.add(H.at(H.box(0.3, 0.12, 0.3, '#333'), -4.55, 0.61, 1.65));
    // motorbike parked inside — very Vietnamese
    g.add(H.at(H.motorbike('#b71c1c'), 2.5, 0, -4.25, 0.04));
    // fan, plant, calendar, clock, shoes
    g.add(H.at(H.fan(), -2.35, 0, -3.95, 0.4));
    g.add(H.at(H.tree('potted', { leaves: '#3f8f45', seed: 4 }), -4.3, 0, -4.3));
    g.add(H.at(H.tree('flower', { seed: 9 }), 1.2, 0.48, -3.3, 0, 0.6));
    g.add(H.at(H.sign('2026\n13', 0.42, 0.58, { w: 160, h: 220, bg: '#ffffff', fg: '#c62828', font: '800 70px "Baloo 2", system-ui' }), 2.7, 1.75, -4.8));
    g.add(H.at(H.box(0.44, 0.1, 0.03, '#c62828'), 2.7, 2.1, -4.79));
    const clock = H.group(H.at(H.cyl(0.22, 0.22, 0.04, '#fafafa', { seg: 24 }), 0, 0, 0)); clock.children[0].rotation.x = PI / 2;
    const hand = H.box(0.012, 0.15, 0.01, '#222', { cast: false }); hand.geometry.translate && 0; const hp = H.group(H.at(hand, 0, 0.07, 0.03)); clock.add(hp);
    clock.position.set(-4.75, 2.35, -2.2); clock.rotation.y = PI / 2; g.add(clock);
    H.onUpdate((dt, t) => { hp.rotation.z = -t * 0.5; });
    for (let i = 0; i < 3; i++) g.add(H.at(H.box(0.1, 0.05, 0.25, ['#1565c0', '#e53935', '#fdd835'][i]), 2.6 + i * 0.25, 0.03, 4.3));
    const ceil = H.glow('#fff7d6', { intensity: 2 });
    g.add(H.at(H.box(1.1, 0.06, 0.12, ceil), -0.5, 3.0, -4.6));
    H.nightLight(g, [-0.4, 2.7, -2.6], '#ffe0a8', 1.4, 9);
    H.nightLight(g, [-4.2, 1.2, 1.0], '#7db6ff', 0.6, 4);
    decorAt(H, g, opts, 3.7, -2.5);
    return {
      group: g,
      npcSpots: [{ pos: [-1.5, 0, 1.1], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-2.4, 0, -0.5], rotY: 0.9 }, { pos: [2.4, 0, -0.3], rotY: -0.9 }],
      anchors: { seat: { pos: [-0.5, 0.05, -4.12], rotY: 0 } },
    };
  });

  // 2. BEDROOM ------------------------------------------------------------------
  KN.Env.register('bedroom', { name: 'Phòng ngủ', indoor: true, sky: ['#b7c9f2', '#fde2e4'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#c9b49a', side: '#7a5a42' }));
    g.add(H.room({ floor: '#c99a6b', wall: '#dde9f3', wallSide: '#cfe0ee', trim: '#9a7656', floorPattern: 'wood', windowBack: true }));
    // bed with mosquito net (màn)
    const bed = H.group(); bed.position.set(-3.0, 0, -3.55);
    bed.add(H.at(H.box(2.2, 0.32, 1.55, '#8d5a3b'), 0, 0.2, 0));
    bed.add(H.at(H.rbox(2.1, 0.18, 1.45, 0.06, '#fdfcf8'), 0, 0.45, 0));
    bed.add(H.at(H.box(0.08, 0.9, 1.55, '#8d5a3b'), -1.1, 0.55, 0));
    bed.add(H.at(H.rbox(0.42, 0.13, 0.62, 0.06, '#ffd6e0'), -0.78, 0.6, 0.0));
    bed.add(H.at(H.rbox(1.0, 0.1, 1.42, 0.05, '#7fb3d5'), 0.48, 0.56, 0.0));
    bed.add(H.at(H.rbox(0.6, 0.14, 0.4, 0.07, '#f4d06f'), 0.75, 0.62, -0.4));
    // teddy bear
    const ted = H.group(); ted.position.set(-0.55, 0.62, 0.48);
    ted.add(H.at(H.sphere(0.12, '#b98055', { seg: 12 }), 0, 0.1, 0)); ted.add(H.at(H.sphere(0.09, '#b98055', { seg: 12 }), 0, 0.27, 0.02));
    [-1, 1].forEach((s) => ted.add(H.at(H.sphere(0.035, '#8d5a3b', { seg: 8 }), s * 0.07, 0.35, 0)));
    bed.add(ted);
    const netM = H.mat('#ffffff', { opacity: 0.2, double: true });
    [[-1.05, -0.72], [1.05, -0.72], [-1.05, 0.72], [1.05, 0.72]].forEach(([x, z]) => bed.add(H.at(H.cyl(0.015, 0.015, 1.9, '#c8b49a', { seg: 5 }), x, 1.2, z)));
    bed.add(H.at(H.box(2.15, 1.55, 1.5, netM, { cast: false }), 0, 1.38, 0));
    g.add(bed);
    // desk along left wall
    g.add(H.at(H.box(0.62, 0.05, 1.5, '#e9dcc8'), -4.42, 0.75, 1.0));
    [[-4.65, 0.35], [-4.2, 0.35], [-4.65, 1.65], [-4.2, 1.65]].forEach(([x, z]) => g.add(H.at(H.box(0.05, 0.75, 0.05, '#9a7656'), x, 0.375, z)));
    g.add(H.at(books(H, 8, 5), -4.62, 0.775, 0.45, PI / 2));
    const lampM = H.glow('#fff1b8', { intensity: 2.2 });
    g.add(H.at(H.cyl(0.012, 0.012, 0.45, '#444', { seg: 6 }), -4.55, 1.0, 1.5));
    g.add(H.at(H.cone(0.12, 0.14, lampM, { seg: 14 }), -4.48, 1.22, 1.5));
    g.add(H.at(chair(H, '#9a7656'), -3.7, 0, 1.0, -PI / 2));
    // wardrobe, poster, rug, slippers, guitar
    g.add(H.at(H.box(1.3, 2.2, 0.6, '#b98a62'), 3.9, 1.1, -4.5));
    g.add(H.at(H.box(0.02, 2.0, 0.02, '#6d4c33'), 3.9, 1.1, -4.19));
    g.add(H.at(H.sign('MƠ LỚN\nLÀM LỚN', 0.9, 1.2, { w: 256, h: 340, bg: '#24305e', fg: '#ffd166', font: '800 52px "Baloo 2", system-ui' }), -0.3, 1.9, -4.79));
    g.add(H.at(H.ground(2.2, 1.5, '#e7a6b5'), -1.6, 0, -1.7));
    [-0.12, 0.12].forEach((x) => g.add(H.at(H.rbox(0.11, 0.05, 0.26, 0.02, '#ff8fab'), -1.6 + x, 0.03, -1.0)));
    const guitar = H.group(H.at(H.sphere(0.22, '#c47a3a', { seg: 14, squash: [1, 1.2, 0.35] }), 0, 0.3, 0), H.at(H.box(0.06, 0.6, 0.04, '#5a3b22'), 0, 0.8, 0));
    guitar.rotation.z = 0.15; guitar.position.set(-4.6, 0, -1.6); guitar.rotation.y = PI / 2; g.add(guitar);
    g.add(H.at(H.tree('potted', { seed: 8 }), 2.3, 0, -4.4));
    H.nightLight(g, [-4.3, 1.4, 1.4], '#ffd58a', 1.3, 6);
    H.nightLight(g, [0, 2.8, -1.5], '#fff1d6', 0.8, 9);
    decorAt(H, g, opts, 2.8, -2.8);
    return { group: g, anchors: { bed: { pos: [-2.9, 0.55, -3.55], rotY: 0 }, seat: { pos: [-3.7, 0, 1.0], rotY: -PI / 2 } } };
  });

  // 3. HOSPITAL -----------------------------------------------------------------
  KN.Env.register('hospital', { name: 'Bệnh viện', indoor: true, sky: ['#a8d8ea', '#eaf6f6'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#c8d8d6', side: '#6b7f86' }));
    g.add(H.room({ floor: '#e3ebea', wall: '#cdeae0', wallSide: '#d8f0e8', trim: '#7fa8a0', floorPattern: 'tile', windowBack: true }));
    const metal = H.mat('#c9d1d6', { metal: 0.6, rough: 0.35 });
    const bed = H.group(); bed.position.set(-1.7, 0, -3.5);
    bed.add(H.at(H.box(2.15, 0.08, 1.05, metal), 0, 0.5, 0));
    [[-1, -0.45], [1, -0.45], [-1, 0.45], [1, 0.45]].forEach(([x, z]) => { bed.add(H.at(H.cyl(0.025, 0.025, 0.5, metal, { seg: 6 }), x, 0.25, z)); bed.add(H.at(H.sphere(0.04, '#333', { seg: 8 }), x, 0.04, z)); });
    bed.add(H.at(H.rbox(2.05, 0.14, 0.98, 0.05, '#ffffff'), 0, 0.6, 0));
    bed.add(H.at(H.rbox(0.42, 0.12, 0.7, 0.05, '#f0f4f8'), -0.78, 0.72, 0));
    bed.add(H.at(H.rbox(1.15, 0.08, 1.0, 0.04, '#9cc9e6'), 0.4, 0.68, 0));
    bed.add(H.at(H.box(0.06, 0.75, 1.05, metal), -1.08, 0.82, 0));
    bed.add(H.at(H.box(0.06, 0.45, 1.05, metal), 1.08, 0.7, 0));
    bed.add(H.at(H.box(1.2, 0.03, 0.03, metal), 0.1, 0.85, 0.52));
    g.add(bed);
    // IV stand
    const iv = H.group(); iv.position.set(-3.2, 0, -2.75);
    iv.add(H.at(H.cyl(0.015, 0.015, 1.9, metal, { seg: 6 }), 0, 0.95, 0));
    iv.add(H.at(H.cyl(0.22, 0.22, 0.03, metal, { seg: 5 }), 0, 0.03, 0));
    iv.add(H.at(H.rbox(0.16, 0.24, 0.06, 0.03, H.mat('#dff4ff', { opacity: 0.7 })), 0.1, 1.78, 0));
    iv.add(H.at(H.cyl(0.004, 0.004, 0.9, '#cfe9f5', { seg: 4, cast: false }), 0.25, 1.3, 0.1));
    g.add(iv);
    // monitor cart
    g.add(H.at(H.box(0.5, 1.0, 0.45, '#e9eef2'), -4.2, 0.5, -4.3));
    g.add(H.at(H.box(0.55, 0.42, 0.12, '#2b3036'), -4.2, 1.25, -4.3));
    g.add(H.at(H.sign('♥ 72  ∿∿∿', 0.48, 0.34, { w: 256, h: 180, bg: '#06231b', fg: '#3dff9a', font: '700 48px ui-monospace, monospace' }), -4.2, 1.25, -4.235));
    // bedside cabinet with flowers & fruit
    g.add(H.at(H.box(0.55, 0.65, 0.5, '#f5f7f8'), 0.0, 0.325, -4.45));
    g.add(H.at(H.tree('flower', { seed: 12, pot: '#e1f5fe' }), 0.1, 0.65, -4.45, 0, 0.7));
    const basket = H.group(H.at(H.cyl(0.18, 0.13, 0.12, '#c8a26a', { seg: 12 }), 0, 0.06, 0));
    ['#ff7043', '#ffd23f', '#9ccc65', '#e53935'].forEach((c, i) => basket.add(H.at(H.sphere(0.06, c, { seg: 8 }), Math.cos(i * 1.6) * 0.08, 0.14, Math.sin(i * 1.6) * 0.08)));
    basket.position.set(0.9, 0, -4.4); g.add(basket);
    // curtain on rail
    g.add(H.at(H.box(0.03, 0.03, 3.2, metal, { cast: false }), -0.35, 2.6, -3.2));
    const curtain = H.group(); curtain.position.set(-0.35, 0, -3.2); g.add(curtain);
    for (let i = 0; i < 6; i++) { const c = H.box(0.05, 2.1, 0.5, H.mat('#9fd2df', { opacity: 0.88 })); c.position.set(Math.sin(i * 1.7) * 0.05, 1.5, -1.25 + i * 0.5); curtain.add(c); }
    H.onUpdate((dt, t) => { curtain.children.forEach((c, i) => (c.rotation.y = Math.sin(t * 0.8 + i) * 0.06)); });
    g.add(H.at(H.sign('PHÒNG BỆNH 203', 1.6, 0.32, { bg: '#0f7b6c', fg: '#ffffff', font: '700 56px "Be Vietnam Pro", system-ui' }), 2.6, 2.72, -4.78));
    g.add(H.at(H.sign('✚', 0.4, 0.4, { w: 128, h: 128, bg: '#ffffff', fg: '#e53935', font: '900 100px system-ui' }), 2.6, 2.25, -4.78));
    g.add(H.at(chair(H, '#7fa8a0'), 1.3, 0, -2.6, -0.5));
    g.add(H.at(H.cyl(0.06, 0.06, 0.2, '#e3f2fd', { seg: 10 }), 0.25, 0.75, -4.3));
    H.nightLight(g, [-1.7, 2.6, -3.2], '#e8f4ff', 1.3, 8);
    decorAt(H, g, opts, 3.2, -3.2);
    return {
      group: g, anchors: { bed: { pos: [-1.6, 0.68, -3.5], rotY: 0 } },
      npcSpots: [{ pos: [-0.3, 0, -2.45], rotY: -0.9 }, { pos: [-2.6, 0, -2.3], rotY: 0.7 }, { pos: [0.9, 0, -1.7], rotY: -0.8 }, { pos: [-1.5, 0, -1.5], rotY: 0.2 }],
    };
  });

  // 4. SCHOOL — lớp học --------------------------------------------------------------
  KN.Env.register('school', { name: 'Lớp học', indoor: true, sky: ['#9ed3ff', '#fff3cf'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#d6c39e', side: '#7a5a42' }));
    g.add(H.room({ floor: '#dcc9a6', wall: '#f7e7b5', wallSide: '#f3df9f', trim: '#8a6a4f', floorPattern: 'tile', windowSide: true }));
    g.add(H.at(H.box(5.0, 0.14, 1.3, '#b98a62'), 0.6, 0.07, -4.2));
    g.add(H.at(H.box(4.3, 1.5, 0.06, '#5d4037'), 0.6, 1.75, -4.8));
    g.add(H.at(H.sign('Chào mừng\nnăm học mới!', 4.1, 1.32, { w: 1024, h: 330, bg: '#22463a', fg: '#f4f1e6', font: '600 96px "Be Vietnam Pro", system-ui', radius: 4 }), 0.6, 1.75, -4.76));
    g.add(H.at(H.box(4.2, 0.05, 0.1, '#8d6e63'), 0.6, 0.98, -4.72));
    g.add(H.at(H.box(0.12, 0.04, 0.04, '#ffffff'), 1.6, 1.02, -4.7));
    g.add(H.at(H.sign('DẠY TỐT – HỌC TỐT', 3.4, 0.36, { bg: '#c62828', fg: '#ffe066', font: '800 70px "Baloo 2", system-ui' }), 0.6, 2.82, -4.78));
    // teacher desk
    g.add(H.at(H.box(1.4, 0.06, 0.65, '#8d5a3b'), -1.6, 0.92, -3.9));
    g.add(H.at(H.box(1.4, 0.75, 0.04, '#7b4528'), -1.6, 0.52, -3.6));
    g.add(H.at(books(H, 5, 11), -2.1, 0.95, -3.95));
    g.add(H.at(H.tree('flower', { seed: 3 }), -1.05, 0.95, -4.0, 0, 0.5));
    // student desks (two-seat) + benches
    const deskTop = '#c19a6b', deskLeg = '#6d4c33';
    function studentDesk(x, z) {
      const d = H.group(); d.position.set(x, 0, z);
      d.add(H.at(H.box(1.25, 0.05, 0.45, deskTop), 0, 0.7, 0));
      d.add(H.at(H.box(1.25, 0.28, 0.03, deskTop), 0, 0.53, -0.21));
      [-0.58, 0.58].forEach((dx) => d.add(H.at(H.box(0.05, 0.7, 0.4, deskLeg), dx, 0.35, 0)));
      d.add(H.at(H.box(1.25, 0.05, 0.28, deskTop), 0, 0.42, 0.5));
      [-0.55, 0.55].forEach((dx) => d.add(H.at(H.box(0.05, 0.42, 0.25, deskLeg), dx, 0.21, 0.5)));
      d.add(H.at(H.box(0.2, 0.02, 0.28, '#ffffff'), -0.25, 0.735, 0.0)); d.add(H.at(H.box(0.2, 0.02, 0.28, '#e3f2fd'), 0.3, 0.735, 0.02));
      return d;
    }
    [[-3.6, -2.2], [-1.6, -2.2], [-3.6, -0.4], [3.4, -2.3]].forEach(([x, z]) => g.add(studentDesk(x, z)));
    ceilingFan(H, g, -1.5, 3.0, -1.6);
    ceilingFan(H, g, 2.0, 3.0, -1.6);
    g.add(H.at(H.box(0.4, 1.6, 1.2, '#a07850'), -4.6, 0.8, 2.6));
    g.add(H.at(books(H, 9, 21), -4.55, 1.0, 2.1, PI / 2));
    g.add(H.at(books(H, 7, 22), -4.55, 1.6, 2.1, PI / 2));
    g.add(H.at(H.tree('potted', { seed: 14 }), 3.9, 0, -4.2));
    const clock = H.cyl(0.2, 0.2, 0.04, '#ffffff', { seg: 20 }); clock.rotation.x = PI / 2; g.add(H.at(clock, 3.4, 2.4, -4.78));
    H.nightLight(g, [0, 2.8, -2], '#fff4d6', 1.2, 10);
    decorAt(H, g, opts, 3.3, -0.4);
    return { group: g };
  });

  // 5. OFFICE --------------------------------------------------------------------
  KN.Env.register('office', { name: 'Văn phòng', indoor: true, sky: ['#9fb8d6', '#eef3f8'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#b9c2cc', side: '#5f6b78' }));
    g.add(H.room({ floor: '#c7ccd6', wall: '#eef1f4', wallSide: '#dfe5ec', trim: '#8a96a3', floorPattern: 'tile' }));
    // big window with skyline
    g.add(H.at(H.box(5.2, 2.0, 0.05, '#7b8794'), 1.2, 1.65, -4.79));
    const skyM = H.mat('#9cc3e6'); g.add(H.at(H.box(5.0, 1.85, 0.03, skyM, { cast: false }), 1.2, 1.65, -4.77));
    const r = H.rng(77);
    const winM = H.glow('#ffe39a', { intensity: 1.6 });
    for (let i = 0; i < 9; i++) {
      const w = 0.35 + r() * 0.3, h = 0.5 + r() * 1.2, x = -1.1 + i * 0.55;
      g.add(H.at(H.box(w, h, 0.02, '#4f6684', { cast: false }), x, 0.75 + h / 2, -4.755));
      for (let k = 0; k < Math.floor(h / 0.25); k++) if (r() > 0.4) g.add(H.at(H.box(0.06, 0.06, 0.01, winM, { cast: false }), x - w * 0.2 + (k % 2) * w * 0.4, 0.85 + k * 0.22, -4.745));
    }
    [-1.4, 1.2, 3.8].forEach((x) => g.add(H.at(H.box(0.06, 2.0, 0.08, '#7b8794'), x, 1.65, -4.76)));
    // desks along the left wall
    function desk(z) {
      const d = H.group(); d.position.set(-4.25, 0, z);
      d.add(H.at(H.box(0.75, 0.05, 1.4, '#f2f2f2'), 0, 0.74, 0));
      [[-0.32, -0.65], [-0.32, 0.65], [0.32, -0.65], [0.32, 0.65]].forEach(([x, zz]) => d.add(H.at(H.box(0.04, 0.74, 0.04, '#9aa3ad'), x, 0.37, zz)));
      d.add(H.at(H.box(0.06, 0.4, 0.62, '#1f2328'), -0.2, 1.05, 0));
      const scr = H.glow('#8fd0ff', { intensity: 1.2 }); scr.emissiveIntensity = 0.7; scr.userData.glowMax = 1.0;
      d.add(H.at(H.box(0.01, 0.34, 0.56, scr), -0.165, 1.05, 0));
      d.add(H.at(H.box(0.06, 0.2, 0.06, '#1f2328'), -0.22, 0.85, 0));
      d.add(H.at(H.box(0.18, 0.015, 0.42, '#30353b'), 0.08, 0.775, 0));
      d.add(H.at(H.cyl(0.04, 0.035, 0.09, '#ffffff', { seg: 10 }), 0.18, 0.81, 0.5));
      d.add(H.at(H.tree('potted', { seed: z * 10 }), 0.1, 0.77, -0.55, 0, 0.35));
      const ch = H.group(); ch.position.set(0.75, 0, 0); ch.rotation.y = -PI / 2;
      ch.add(H.at(H.rbox(0.5, 0.08, 0.48, 0.03, '#2b3a55'), 0, 0.46, 0));
      ch.add(H.at(H.rbox(0.48, 0.55, 0.07, 0.03, '#2b3a55'), 0, 0.8, -0.24));
      ch.add(H.at(H.cyl(0.03, 0.03, 0.4, '#555', { seg: 6 }), 0, 0.22, 0));
      ch.add(H.at(H.cyl(0.25, 0.25, 0.03, '#555', { seg: 5 }), 0, 0.03, 0));
      d.add(ch);
      return d;
    }
    g.add(desk(-2.6)); g.add(desk(-0.9));
    g.add(H.at(H.box(1.8, 0.9, 0.06, '#ffffff'), -1.9, 1.65, -4.79));
    g.add(H.at(H.sign('KPI Q4 ↑ 120%', 1.6, 0.25, { bg: null, fg: '#1e5bb8', font: '700 60px "Be Vietnam Pro", system-ui' }), -1.9, 1.9, -4.75));
    ['#ffe066', '#ff8fab', '#8ce99a', '#74c0fc', '#ffe066'].forEach((c, i) => g.add(H.at(H.box(0.16, 0.16, 0.01, c, { cast: false }), -2.6 + i * 0.32, 1.45 - (i % 2) * 0.18, -4.75)));
    const cooler = H.group(); cooler.position.set(-4.3, 0, -4.3);
    cooler.add(H.at(H.box(0.4, 1.0, 0.4, '#f0f2f4'), 0, 0.5, 0)); cooler.add(H.at(H.cyl(0.16, 0.16, 0.45, H.mat('#8fd3ff', { opacity: 0.6 }), { seg: 14 }), 0, 1.22, 0));
    g.add(cooler);
    g.add(H.at(H.tree('potted', { seed: 33, leaves: '#2e7d32' }), 4.2, 0, -4.2, 0, 1.3));
    g.add(H.at(H.box(0.7, 0.55, 0.5, '#d7dce2'), 3.2, 0.275, -4.45));
    g.add(H.at(H.box(0.6, 0.12, 0.45, '#5f6b78'), 3.2, 0.61, -4.45));
    for (let i = 0; i < 3; i++) g.add(H.at(H.box(1.2, 0.04, 0.12, H.glow('#f4fbff', { intensity: 1.5 })), -1 + i * 2, 3.05, -1.5 - i * 0.4));
    H.nightLight(g, [-2.5, 2.8, -1.5], '#eef6ff', 1.2, 10);
    decorAt(H, g, opts, 2.6, -3.1);
    return { group: g, anchors: { seat: { pos: [-3.5, 0, -0.9], rotY: -PI / 2 } } };
  });

  // 6. GYM ---------------------------------------------------------------------------
  KN.Env.register('gym', { name: 'Phòng gym', indoor: true, sky: ['#ffb38a', '#ffe7d1'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#5a5f68', side: '#3b3f46' }));
    g.add(H.room({ floor: '#2f333a', wall: '#ece6dc', wallSide: '#d9e3ec', trim: '#ff7043', floorPattern: 'none' }));
    g.add(H.at(H.box(10, 0.3, 0.02, '#ff7043', { cast: false }), 0, 1.2, -4.8));
    g.add(H.at(H.box(0.04, 2.2, 6, H.mat('#c9d6e3', { metal: 0.9, rough: 0.08 }), { cast: false }), -4.78, 1.4, -0.5));
    g.add(H.at(H.sign('CỐ LÊN!', 2.4, 0.6, { bg: '#ff7043', fg: '#ffffff', font: '900 120px "Baloo 2", system-ui' }), -0.6, 2.4, -4.77));
    // dumbbell rack
    g.add(H.at(H.box(2.6, 0.06, 0.5, '#3a3f47'), -1.6, 0.45, -4.4));
    g.add(H.at(H.box(2.6, 0.06, 0.5, '#3a3f47'), -1.6, 0.85, -4.4));
    [-2.85, -0.35].forEach((x) => g.add(H.at(H.box(0.06, 0.9, 0.5, '#3a3f47'), x, 0.45, -4.4)));
    const bars = [], plates = [];
    for (let i = 0; i < 10; i++) { const x = -2.7 + (i % 5) * 0.55, y = i < 5 ? 0.53 : 0.93; bars.push({ x, y, z: -4.4, rz: PI / 2, sx: 1, sy: 1, sz: 1 }); plates.push({ x: x - 0.12, y, z: -4.4, rz: PI / 2 }); plates.push({ x: x + 0.12, y, z: -4.4, rz: PI / 2 }); }
    g.add(H.instanced(new H.THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), '#a0a6ad', bars));
    g.add(H.instanced(new H.THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), '#1f2125', plates));
    // bench press
    g.add(H.at(H.rbox(0.38, 0.1, 1.3, 0.04, '#c62828'), -3.0, 0.48, -2.4));
    g.add(H.at(H.box(0.08, 0.44, 0.08, '#555'), -3.0, 0.22, -2.0)); g.add(H.at(H.box(0.08, 0.44, 0.08, '#555'), -3.0, 0.22, -2.85));
    [-3.4, -2.6].forEach((x) => g.add(H.at(H.box(0.06, 1.1, 0.06, '#555'), x, 0.55, -3.0)));
    const bb = H.cyl(0.02, 0.02, 1.8, '#a0a6ad', { seg: 8, metal: 0.6 }); bb.rotation.z = PI / 2; g.add(H.at(bb, -3.0, 1.1, -3.0));
    [-3.75, -2.25].forEach((x) => { const p = H.cyl(0.22, 0.22, 0.06, '#1f2125', { seg: 18 }); p.rotation.z = PI / 2; g.add(H.at(p, x, 1.1, -3.0)); });
    // treadmill
    const tm = H.group(); tm.position.set(2.2, 0, -3.9);
    tm.add(H.at(H.box(0.8, 0.18, 1.9, '#2b2e33'), 0, 0.09, 0));
    const belt = H.group(); belt.position.y = 0.185; tm.add(belt);
    for (let i = 0; i < 9; i++) belt.add(H.at(H.box(0.66, 0.006, 0.06, '#4a4f57', { cast: false }), 0, 0, -0.85 + i * 0.21));
    [-0.38, 0.38].forEach((x) => tm.add(H.at(H.box(0.05, 1.1, 0.05, '#555'), x, 0.65, -0.85)));
    tm.add(H.at(H.box(0.8, 0.3, 0.12, '#33373d'), 0, 1.22, -0.85));
    tm.add(H.at(H.box(0.5, 0.18, 0.02, H.glow('#3dff9a', { intensity: 1.4 })), 0, 1.24, -0.78));
    g.add(tm);
    H.onUpdate((dt) => { belt.children.forEach((s) => { s.position.z += dt * 0.9; if (s.position.z > 0.95) s.position.z -= 1.9; }); });
    // punching bag
    const bag = H.group(); bag.position.set(-3.9, 2.95, 2.2);
    bag.add(H.at(H.cyl(0.01, 0.01, 0.9, '#888', { seg: 4 }), 0, -0.45, 0));
    bag.add(H.at(H.cyl(0.22, 0.22, 1.0, '#b71c1c', { seg: 16 }), 0, -1.4, 0));
    g.add(bag); g.add(H.at(H.box(1.4, 0.06, 0.12, '#555'), -4.3, 2.98, 2.2));
    H.onUpdate((dt, t) => { bag.rotation.z = Math.sin(t * 1.6) * 0.06; bag.rotation.x = Math.sin(t * 1.1) * 0.04; });
    ['#7e57c2', '#26a69a', '#ef5350'].forEach((c, i) => g.add(H.at(H.ground(0.65, 1.8, c), 1.6 + i * 0.8, 0.005, -1.4)));
    g.add(H.at(H.sphere(0.3, '#42a5f5', { seg: 16 }), 3.8, 0.3, -2.4));
    for (let i = 0; i < 3; i++) g.add(H.at(H.box(1.4, 0.04, 0.12, H.glow('#ffffff', { intensity: 1.4 })), -1.5 + i * 2.2, 3.05, -2));
    H.nightLight(g, [0, 2.8, -2], '#ffffff', 1.2, 10);
    decorAt(H, g, opts, 3.6, -0.6);
    return { group: g };
  });

  // 7. KARAOKE --------------------------------------------------------------------
  KN.Env.register('karaoke', { name: 'Phòng karaoke', indoor: true, sky: ['#2a1b4f', '#7b3fa0'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#2a2140', side: '#1b1530', under: '#120e22' }));
    g.add(H.room({ floor: '#2b1f42', wall: '#2f2650', wallSide: '#382c5e', trim: '#ff4fd8', floorPattern: 'none' }));
    const neonP = H.mat('#ff4fd8', { emissive: '#ff4fd8', emissiveIntensity: 2.2 });
    const neonC = H.mat('#3ee6ff', { emissive: '#3ee6ff', emissiveIntensity: 2.2 });
    g.add(H.at(H.box(9.6, 0.05, 0.05, neonP, { cast: false }), 0, 3.05, -4.7));
    g.add(H.at(H.box(0.05, 0.05, 9.6, neonC, { cast: false }), -4.7, 3.05, 0));
    g.add(H.at(H.box(9.6, 0.04, 0.04, neonC, { cast: false }), 0, 0.12, -4.7));
    // screen
    g.add(H.at(H.box(3.5, 2.0, 0.08, '#111'), 0.8, 1.65, -4.78));
    const scrBg = H.mat('#1c1240', { emissive: '#2a1a6a', emissiveIntensity: 1.2 });
    g.add(H.at(H.box(3.3, 1.8, 0.02, scrBg, { cast: false }), 0.8, 1.65, -4.73));
    g.add(H.at(H.sign('♪ Hát cho nhau nghe ♪', 2.6, 0.35, { bg: null, fg: '#ffe066', font: '800 64px "Baloo 2", system-ui' }), 0.8, 2.25, -4.71));
    const lyricBars = [];
    const lyrM = [H.mat('#ffffff', { emissive: '#ffffff', emissiveIntensity: 1.2 }), H.mat('#3ee6ff', { emissive: '#3ee6ff', emissiveIntensity: 1.8 })];
    for (let i = 0; i < 2; i++) { const b = H.box(2.4, 0.12, 0.01, lyrM[0], { cast: false }); g.add(H.at(b, 0.8, 1.5 - i * 0.3, -4.715)); const f = H.box(2.4, 0.12, 0.012, lyrM[1], { cast: false }); f.geometry = new H.THREE.BoxGeometry(2.4, 0.12, 0.012); f.geometry.translate(1.2, 0, 0); g.add(H.at(f, 0.8 - 1.2, 1.5 - i * 0.3, -4.71)); lyricBars.push(f); }
    H.onUpdate((dt, t) => { lyricBars.forEach((f, i) => { f.scale.x = Math.max(0.001, ((t * 0.25 + i * 0.5) % 1)); }); });
    [-1.3, 2.9].forEach((x) => {
      g.add(H.at(H.box(0.45, 1.0, 0.4, '#151515'), x, 0.5, -4.5));
      [[0.13, 0.65], [0.08, 0.3]].forEach(([r, y]) => { const w = H.cyl(r, r, 0.02, '#333', { seg: 16 }); w.rotation.x = PI / 2; g.add(H.at(w, x, y, -4.29)); });
    });
    // L sofa
    const sofaM = '#5e2a84', sofaD = '#4a1f6a';
    g.add(H.at(H.rbox(0.8, 0.42, 5.2, 0.08, sofaM), -4.2, 0.21, -0.6));
    g.add(H.at(H.rbox(0.25, 0.75, 5.2, 0.08, sofaD), -4.62, 0.55, -0.6));
    g.add(H.at(H.rbox(2.6, 0.42, 0.8, 0.08, sofaM), -2.6, 0.21, -4.2));
    g.add(H.at(H.rbox(2.6, 0.75, 0.25, 0.08, sofaD), -2.6, 0.55, -4.62));
    ['#ff4fd8', '#3ee6ff', '#ffe066'].forEach((c, i) => g.add(H.at(H.rbox(0.38, 0.36, 0.14, 0.06, c), -4.42, 0.6, -2.4 + i * 1.6, PI / 2)));
    // table with fruit, drinks, mics
    g.add(H.at(H.box(1.4, 0.06, 2.2, '#1e1b2a'), -2.7, 0.42, -1.4));
    g.add(H.at(H.box(1.2, 0.38, 2.0, '#151320'), -2.7, 0.2, -1.4));
    g.add(H.at(H.cyl(0.25, 0.2, 0.05, '#e0e0e0', { seg: 18 }), -2.7, 0.48, -1.8));
    [['#ff7043', 0, 0], ['#7cb342', 0.1, 0.08], ['#e53935', -0.1, 0.06], ['#ffd23f', 0.05, -0.1], ['#ab47bc', -0.06, -0.08]].forEach(([c, x, z]) => g.add(H.at(H.sphere(0.07, c, { seg: 8 }), -2.7 + x, 0.55, -1.8 + z)));
    for (let i = 0; i < 4; i++) g.add(H.at(H.cyl(0.04, 0.04, 0.13, ['#d32f2f', '#1976d2', '#388e3c', '#fbc02d'][i], { seg: 10, metal: 0.5, rough: 0.3 }), -3.0 + (i % 2) * 0.55, 0.515, -1.0 + Math.floor(i / 2) * 0.25));
    [-0.15, 0.15].forEach((x) => { const m = H.cyl(0.02, 0.015, 0.2, '#111', { seg: 8 }); m.rotation.z = PI / 2; g.add(H.at(m, -2.6 + x, 0.47, -0.7 + x)); });
    // disco ball
    const disco = H.group(); disco.position.set(0, 2.75, -1.4);
    disco.add(H.at(H.cyl(0.005, 0.005, 0.3, '#999', { seg: 4 }), 0, 0.3, 0));
    disco.add(H.sphere(0.24, H.mat('#dfe6ee', { metal: 1, rough: 0.15, flat: true }), { seg: 10 }));
    const sparkM = H.mat('#ffffff', { emissive: '#ffffff', emissiveIntensity: 2 });
    for (let i = 0; i < 14; i++) { const a = i * 2.4, e = Math.sin(i * 1.3) * 1.2; disco.add(H.at(H.box(0.03, 0.03, 0.01, sparkM, { cast: false }), Math.cos(a) * Math.cos(e) * 0.245, Math.sin(e) * 0.245, Math.sin(a) * Math.cos(e) * 0.245)); }
    g.add(disco);
    const spots = [];
    ['#ff4fd8', '#3ee6ff', '#ffe066', '#7cff6b'].forEach((c, i) => { const s = H.ground(0.9, 0.9, H.mat(c, { emissive: c, emissiveIntensity: 1.4, opacity: 0.35 })); g.add(s); spots.push(s); });
    H.onUpdate((dt, t) => {
      disco.rotation.y += dt * 0.8;
      spots.forEach((s, i) => { const a = t * 0.7 + i * 1.57; s.position.set(Math.cos(a) * 2.2 + 0.5, 0.008, Math.sin(a * 1.3) * 1.6 - 0.5); });
    });
    const kl = [H.nightLight(g, [0, 2.4, -1], '#ff6ad5', 1.6, 9), H.nightLight(g, [-3, 2.2, 0], '#45d9ff', 1.0, 7)].filter(Boolean);
    decorAt(H, g, opts, 3.4, -3.2);
    return {
      group: g,
      setTime() { kl.forEach((l) => { l.visible = true; l.intensity = l.userData.maxIntensity; }); }, // karaoke is always lit
      anchors: { seat: { pos: [-3.95, 0, 0.6], rotY: PI / 2 } },
      npcSpots: [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-1.4, 0, -0.9], rotY: 0.4 }, { pos: [2.4, 0, -0.3], rotY: -0.9 }],
    };
  });

  // 8. CAFE — quán cà phê ------------------------------------------------------------
  KN.Env.register('cafe', { name: 'Quán cà phê', indoor: true, sky: ['#ffc58f', '#fff1dc'] }, function (H, opts) {
    const g = H.group();
    g.add(H.slab(10, 10, { top: '#b88f68', side: '#6b4a32' }));
    g.add(H.room({ floor: '#b88a5a', wall: '#efe1c8', wallSide: '#b5653a', trim: '#5c3a22', floorPattern: 'wood', windowBack: true }));
    // brick pattern on left wall
    const bricks = [];
    for (let y = 0; y < 10; y++) for (let z = 0; z < 14; z++) if ((y + z) % 3 === 0) bricks.push({ x: -4.79, y: 0.25 + y * 0.29, z: -4.4 + z * 0.66 + (y % 2) * 0.33, sx: 1, sy: 1, sz: 1 });
    g.add(H.instanced(new H.THREE.BoxGeometry(0.02, 0.22, 0.56), '#a2522c', bricks, { cast: false }));
    // counter + espresso machine + menu
    g.add(H.at(H.box(2.8, 1.0, 0.7, '#5c3a22'), 2.4, 0.5, -4.15));
    g.add(H.at(H.box(2.9, 0.06, 0.78, '#e9dcc8'), 2.4, 1.03, -4.15));
    g.add(H.at(H.box(0.6, 0.45, 0.45, H.mat('#b0b8bf', { metal: 0.7, rough: 0.25 })), 3.2, 1.28, -4.25));
    g.add(H.at(H.cyl(0.05, 0.05, 0.08, '#333', { seg: 8 }), 3.1, 1.12, -4.0));
    for (let i = 0; i < 4; i++) g.add(H.at(H.cyl(0.04, 0.035, 0.09, '#ffffff', { seg: 10 }), 1.4 + i * 0.18, 1.105, -3.95));
    g.add(H.at(H.sign('CÀ PHÊ SỮA ĐÁ   25K\nBẠC XỈU             30K\nTRÀ ĐÀO CAM SẢ  35K', 2.2, 1.0, { w: 768, h: 350, bg: '#2b2b2b', fg: '#f6efe1', font: '600 46px "Be Vietnam Pro", system-ui', radius: 8 }), 2.4, 2.1, -4.78));
    // tables with phin coffee
    function table(x, z, rot) {
      const t = H.group(); t.position.set(x, 0, z); t.rotation.y = rot || 0;
      t.add(H.at(H.cyl(0.42, 0.42, 0.05, '#8d5a3b', { seg: 20 }), 0, 0.72, 0));
      t.add(H.at(H.cyl(0.04, 0.06, 0.7, '#3b2618', { seg: 8 }), 0, 0.36, 0));
      t.add(H.at(H.cyl(0.24, 0.24, 0.03, '#3b2618', { seg: 12 }), 0, 0.02, 0));
      [-0.12, 0.14].forEach((dx, i) => {
        t.add(H.at(H.cyl(0.04, 0.034, 0.1, H.mat('#e3eef2', { opacity: 0.75 }), { seg: 10 }), dx, 0.8, 0.05 * i));
        t.add(H.at(H.cyl(0.036, 0.03, 0.06, '#7a4a28', { seg: 10 }), dx, 0.78, 0.05 * i));
        t.add(H.at(H.cyl(0.042, 0.035, 0.07, H.mat('#c0c6cc', { metal: 0.8, rough: 0.3 }), { seg: 10 }), dx, 0.89, 0.05 * i));
      });
      return t;
    }
    g.add(table(-3.3, -3.4)); g.add(table(-1.0, -3.6)); g.add(table(-3.6, 0.1));
    [[-3.3, -2.7, PI], [-2.6, -3.4, -PI / 2], [-1.0, -2.9, PI], [-2.9, 0.1, -PI / 2], [-3.6, 0.8, PI]].forEach(([x, z, r]) => g.add(H.at(chair(H, '#6d4c33'), x, 0, z, r)));
    // plants & string lights
    [[-4.4, -4.4], [0.3, -4.5], [4.2, -2.6]].forEach(([x, z], i) => g.add(H.at(H.tree(i % 2 ? 'banana' : 'potted', { seed: 40 + i, h: 1.4 }), x, 0, z, 0, i % 2 ? 0.55 : 1)));
    plantHanging(H, g, -4.3, 2.4, -2.0); plantHanging(H, g, -4.3, 2.4, 1.8);
    const bulbM = H.glow('#ffd27a', { intensity: 2.4 });
    const bulbs = [];
    for (let i = 0; i < 16; i++) { const k = i / 15; bulbs.push({ x: -4.6 + k * 9.0, y: 2.85 - Math.sin(k * PI * 3) * 0.18 - 0.1, z: -4.6 }); }
    for (let i = 0; i < 12; i++) { const k = i / 11; bulbs.push({ x: -4.6, y: 2.85 - Math.sin(k * PI * 2) * 0.18 - 0.1, z: -4.4 + k * 8.4 }); }
    g.add(H.instanced(new H.THREE.SphereGeometry(0.05, 8, 6), bulbM, bulbs, { cast: false }));
    g.add(H.at(H.sign('Cà Phê Phố', 1.8, 0.45, { bg: '#5c3a22', fg: '#ffd27a', font: '800 84px "Baloo 2", system-ui', glow: true }), -0.9, 2.65, -4.78));
    H.nightLight(g, [0, 2.6, -3], '#ffcf8a', 1.5, 10);
    H.nightLight(g, [-3.5, 2.4, 0], '#ffcf8a', 0.9, 6);
    decorAt(H, g, opts, 3.4, -2.8);
    return {
      group: g,
      anchors: { seat: { pos: [-2.9, 0, 0.1], rotY: -PI / 2 } },
      npcSpots: [{ pos: [-1.4, 0, 1.2], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-1.6, 0, -1.4], rotY: 0.7 }, { pos: [2.4, 0, -0.6], rotY: -0.9 }],
    };
  });
})();
