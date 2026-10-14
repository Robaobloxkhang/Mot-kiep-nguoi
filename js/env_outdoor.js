/* Một Kiếp Người — outdoor dioramas: street, market, park, beach, countryside, temple, university, wedding. SPEC §4.3/§4.6 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  if (!KN.Env || !window.THREE) return;
  const THREE = window.THREE;
  const PI = Math.PI;

  function decorAt(H, g, opts, x, z, ry) {
    if (!opts.decor || !H.decor[opts.decor]) return;
    g.add(H.at(H.decor[opts.decor](), x ?? 3.2, 0, z ?? -3.2, ry || 0));
  }
  function wire(H, pts, color, r) {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    return H.mesh(new THREE.TubeGeometry(curve, 20, r || 0.012, 4, false), color || '#1d1d1d', { cast: false });
  }
  function sag(a, b, s) { return [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - s, (a[2] + b[2]) / 2], b]; }
  function bench(H, color) {
    const g = H.group();
    for (let i = 0; i < 3; i++) g.add(H.at(H.box(1.5, 0.04, 0.12, color || '#8d5a3b'), 0, 0.45, -0.15 + i * 0.15));
    for (let i = 0; i < 2; i++) g.add(H.at(H.box(1.5, 0.1, 0.03, color || '#8d5a3b'), 0, 0.68 + i * 0.16, -0.24));
    [-0.65, 0.65].forEach((x) => { g.add(H.at(H.box(0.06, 0.45, 0.4, '#3a3a3a'), x, 0.225, 0)); g.add(H.at(H.box(0.06, 0.45, 0.04, '#3a3a3a'), x, 0.7, -0.24)); });
    return g;
  }
  function lampPost(H, glowColor) {
    const g = H.group();
    g.add(H.at(H.cyl(0.06, 0.09, 3.0, '#2f3640', { seg: 8 }), 0, 1.5, 0));
    g.add(H.at(H.box(0.5, 0.05, 0.05, '#2f3640'), 0.2, 2.95, 0));
    g.add(H.at(H.sphere(0.17, H.glow(glowColor || '#ffe6a8', { intensity: 2.2 }), { seg: 12 }), 0.42, 2.85, 0));
    return g;
  }
  function rider(H, color) {
    const g = H.group();
    g.add(H.at(H.cyl(0.14, 0.16, 0.5, color, { seg: 10 }), -0.1, 1.08, 0));
    g.add(H.at(H.sphere(0.12, '#e6b48f', { seg: 10 }), -0.05, 1.42, 0));
    g.add(H.at(H.sphere(0.135, H.mat(['#f5c518', '#e53935', '#1e88e5', '#fafafa'][Math.floor(Math.random() * 4)], { rough: 0.35 }), { seg: 10, squash: [1, 0.85, 1] }), -0.05, 1.47, 0));
    const arm = H.box(0.42, 0.07, 0.07, color); arm.rotation.z = -0.5; g.add(H.at(arm, 0.18, 1.12, 0.12));
    const arm2 = H.box(0.42, 0.07, 0.07, color); arm2.rotation.z = -0.5; g.add(H.at(arm2, 0.18, 1.12, -0.12));
    g.add(H.at(H.box(0.4, 0.12, 0.26, '#2f3b52'), 0.1, 0.82, 0));
    return g;
  }

  // 1. STREET — phố / hẻm ---------------------------------------------------------
  KN.Env.register('street', { name: 'Phố', indoor: false, sky: ['#8fc8f5', '#ffe9cf'] }, function (H, opts) {
    const g = H.group(), r = H.rng(101);
    g.add(H.slab(10, 10, { top: '#c7c0b2', side: '#6b5a4a' }));
    // road strip at the front + lane marks
    g.add(H.at(H.ground(10, 2.3, '#4b4f57'), 0, 0.004, 3.75));
    g.add(H.at(H.box(10, 0.1, 0.18, '#9e968a', { cast: false }), 0, 0.05, 2.55));
    for (let i = 0; i < 6; i++) g.add(H.at(H.ground(0.8, 0.08, '#f2f2f2'), -4.2 + i * 1.7, 0.006, 3.75));
    // sidewalk tiles pattern
    const tiles = [];
    for (let x = 0; x < 12; x++) for (let z = 0; z < 4; z++) if ((x + z) % 2 === 0) tiles.push({ x: -4.6 + x * 0.84, y: 0.004, z: -3.2 + z * 0.84, sx: 0.8, sz: 0.8 });
    g.add(H.instanced(new THREE.BoxGeometry(1, 0.006, 1), '#b8b0a2', tiles, { cast: false }));
    // tube houses
    const cols = ['#f2c14e', '#9ccfa8', '#f4a6a6', '#8fb8de', '#efe0c0'];
    const signs = [['PHỞ BÒ', '#c62828'], ['TẠP HÓA', '#1565c0'], ['BÁNH MÌ', '#e65100'], ['SỬA XE', '#2e7d32'], ['CÀ PHÊ', '#4e342e']];
    const winM = H.glow('#ffe1a0', { intensity: 1.6 });
    const posts = [];
    for (let i = 0; i < 5; i++) {
      const w = 1.95, h = 3.6 + r() * 1.8, x = -4.0 + i * 2.0, z = -4.3;
      const hs = H.group(); hs.position.set(x, 0, z);
      hs.add(H.at(H.box(w - 0.04, h, 1.3, cols[i]), 0, h / 2, 0));
      hs.add(H.at(H.box(w - 0.3, 1.25, 0.06, '#3a3a3a'), 0, 0.68, 0.64));
      const shutter = H.box(w - 0.36, 0.5, 0.07, '#b0b6bc'); hs.add(H.at(shutter, 0, 1.08, 0.65));
      hs.add(H.at(H.sign(signs[i][0], w - 0.2, 0.38, { bg: signs[i][1], fg: '#fff8e1', font: '800 72px "Baloo 2", system-ui', glow: true }), 0, 1.55, 0.67));
      for (let f = 1; f < Math.floor(h / 1.3); f++) {
        const y = 1.15 + f * 1.25;
        hs.add(H.at(H.box(w - 0.1, 0.08, 0.4, '#e9e4dc'), 0, y - 0.38, 0.84));
        for (let k = 0; k < 5; k++) posts.push({ x: x - w / 2 + 0.2 + k * (w - 0.4) / 4, y: y - 0.15, z: z + 1.02 });
        hs.add(H.at(H.box(w - 0.2, 0.03, 0.03, '#2f3640', { cast: false }), 0, y + 0.06, 1.02));
        hs.add(H.at(H.box(0.75, 0.7, 0.04, winM), -0.35, y + 0.1, 0.66));
        hs.add(H.at(H.box(0.42, 0.7, 0.05, '#7b4a2b'), 0.45, y + 0.1, 0.66));
        if (r() > 0.4) hs.add(H.at(H.tree('flower', { seed: i * 7 + f }), 0.6, y - 0.34, 0.86, 0, 0.55));
      }
      hs.add(H.at(H.box(w, 0.25, 1.4, U_shade(cols[i])), 0, h + 0.12, 0));
      g.add(hs);
    }
    g.add(H.instanced(new THREE.BoxGeometry(0.03, 0.4, 0.03), '#2f3640', posts, { cast: false }));
    // power poles + tangled wires
    [[-4.6, -2.6], [4.6, -2.6]].forEach(([x, z]) => {
      g.add(H.at(H.cyl(0.08, 0.11, 5.2, '#8c8c8c', { seg: 8 }), x, 2.6, z));
      g.add(H.at(H.box(1.1, 0.08, 0.08, '#6e6e6e'), x, 4.7, z));
      for (let k = 0; k < 3; k++) g.add(H.at(H.cyl(0.12, 0.12, 0.25, '#2b2b2b', { seg: 10 }), x + (k - 1) * 0.12, 4.3 - k * 0.3, z));
    });
    const wr = H.rng(9);
    for (let i = 0; i < 9; i++) {
      const y1 = 4.1 + wr() * 0.7, y2 = 4.1 + wr() * 0.7;
      g.add(wire(H, sag([-4.6, y1, -2.6], [4.6, y2, -2.6 + (wr() - 0.5) * 0.4], 0.5 + wr() * 0.7)));
    }
    for (let i = 0; i < 5; i++) g.add(wire(H, sag([-4.6 + 2.3 * i * 0.9, 4.3, -2.6], [-4.0 + i * 2.0, 3.0 + wr(), -3.6], 0.25)));
    // street food stall with plastic stools
    const st = H.group(); st.position.set(-3.1, 0, -1.0);
    st.add(H.at(H.box(1.1, 0.04, 0.6, '#1e88e5'), 0, 0.5, 0));
    [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].forEach(([x, z]) => st.add(H.at(H.box(0.04, 0.5, 0.04, '#1565c0'), x, 0.25, z)));
    st.add(H.at(H.cyl(0.26, 0.24, 0.42, H.mat('#c0c6cc', { metal: 0.7, rough: 0.3 }), { seg: 16 }), -1.2, 0.5, -0.5));
    st.add(H.at(H.cyl(0.22, 0.24, 0.3, '#3a3a3a', { seg: 12 }), -1.2, 0.15, -0.5));
    st.add(H.at(H.cyl(0.18, 0.18, 0.02, H.glow('#ff6a2b', { intensity: 1.2 }), { seg: 12 }), -1.2, 0.31, -0.5));
    for (let i = 0; i < 4; i++) st.add(H.at(H.cyl(0.035, 0.03, 0.09, H.mat('#d0e8f0', { opacity: 0.7 }), { seg: 8 }), -0.3 + i * 0.2, 0.565, 0.05));
    st.add(H.at(H.cyl(0.05, 0.04, 0.08, '#f4f4f0', { seg: 10 }), 0.2, 0.56, -0.15));
    [[-0.75, 0], [0.8, -0.1], [0, -0.6]].forEach(([x, z], i) => st.add(H.at(H.plasticStool(['#d93a3a', '#2f80ed', '#d93a3a'][i]), x, 0, z)));
    const um = H.group(H.at(H.cyl(0.02, 0.02, 2.2, '#ddd', { seg: 6 }), 0, 1.1, 0), H.at(H.cone(1.4, 0.5, '#e53935', { seg: 8, double: true }), 0, 2.2, 0));
    um.position.set(-0.4, 0, -0.2); st.add(um);
    g.add(st);
    g.add(H.at(H.plasticStool('#2f80ed'), -2.25, 0, -0.35));
    const steam = [];
    for (let i = 0; i < 5; i++) { const m = H.mat('#ffffff', { opacity: 0.35, unique: true }); const s = H.sphere(0.1, m, { seg: 8, cast: false }); g.add(s); steam.push(s); }
    H.onUpdate((dt, t) => steam.forEach((s, i) => { const k = (t * 0.35 + i / 5) % 1; s.position.set(-4.3 + Math.sin(t + i) * 0.05, 0.75 + k * 1.1, -1.5); s.scale.setScalar(0.6 + k * 1.6); s.material.opacity = 0.35 * (1 - k); }));
    // banh mi cart
    const cart = H.group(); cart.position.set(2.3, 0, -2.5);
    cart.add(H.at(H.box(1.2, 0.7, 0.6, '#f5f5f5'), 0, 0.75, 0));
    cart.add(H.at(H.box(1.15, 0.5, 0.55, H.mat('#dff3ff', { opacity: 0.45 })), 0, 1.35, 0));
    for (let i = 0; i < 5; i++) cart.add(H.at(H.sphere(0.12, '#e3a857', { seg: 8, squash: [1.8, 0.7, 0.8] }), -0.4 + i * 0.2, 1.2, 0));
    cart.add(H.at(H.sign('BÁNH MÌ', 1.1, 0.26, { bg: '#e65100', fg: '#fff', font: '800 70px "Baloo 2", system-ui' }), 0, 0.85, 0.31));
    [-0.5, 0.5].forEach((x) => { const w = H.cyl(0.18, 0.18, 0.06, '#333', { seg: 14 }); w.rotation.x = PI / 2; cart.add(H.at(w, x, 0.2, 0.3)); });
    g.add(cart);
    g.add(H.at(lampPost(H), 4.2, 0, -1.4, PI));
    // parked bikes
    [[-1.4, -2.9], [0.2, -3.0], [3.9, -3.1]].forEach(([x, z], i) => g.add(H.at(H.motorbike(), x, 0, z, PI / 2 + (i - 1) * 0.15)));
    // moving traffic
    const traffic = [];
    [['#1f4e8c', 3.3, 2.2], ['#c0392b', 4.2, -1.6], ['#e8e8e8', 3.7, 1.4]].forEach(([c, z, sp], i) => {
      const b = H.group(H.motorbike(c), rider(H, ['#2e7d32', '#6a1b9a', '#f9a825'][i]));
      b.position.set(-6 + i * 4, 0, z); if (sp < 0) b.rotation.y = PI; g.add(b); traffic.push({ b, sp });
    });
    H.onUpdate((dt) => traffic.forEach((o) => { o.b.position.x += o.sp * dt; if (o.b.position.x > 5.6) o.b.position.x = -5.6; if (o.b.position.x < -5.6) o.b.position.x = 5.6; const vis = Math.abs(o.b.position.x) < 5.0; o.b.visible = vis; }));
    H.nightLight(g, [3.8, 2.6, -1.4], '#ffd9a0', 1.6, 8);
    H.nightLight(g, [-3.1, 1.6, -1.0], '#ffb070', 0.9, 5);
    decorAt(H, g, opts, 1.0, -2.0);
    return {
      group: g,
      anchors: { seat: { pos: [-2.25, 0, -0.35], rotY: -PI / 2 } },
      npcSpots: [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-1.3, 0, -0.9], rotY: 0.6 }, { pos: [2.4, 0, -0.6], rotY: -0.9 }],
    };
  });
  function U_shade(c) { return KN.util.shadeHex(c, -0.18); }

  // 2. MARKET — chợ ---------------------------------------------------------------
  KN.Env.register('market', { name: 'Chợ', indoor: false, sky: ['#9bd0f2', '#fff0d6'] }, function (H, opts) {
    const g = H.group(), r = H.rng(202);
    g.add(H.slab(10, 10, { top: '#bfb39b', side: '#6b5a4a' }));
    const produce = { orange: '#ff9f1c', dragon: '#e84a8a', mango: '#ffcf3f', green: '#7cb342', tomato: '#e53935', purple: '#8e44ad', lime: '#b5d334' };
    function stall(x, z, roof, items) {
      const s = H.group(); s.position.set(x, 0, z);
      s.add(H.at(H.box(1.9, 0.08, 1.0, '#8d6e63'), 0, 0.8, 0));
      [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].forEach(([dx, dz]) => s.add(H.at(H.box(0.06, 0.8, 0.06, '#5d4037'), dx, 0.4, dz)));
      [[-0.95, -0.5], [0.95, -0.5]].forEach(([dx, dz]) => s.add(H.at(H.cyl(0.03, 0.03, 2.3, '#9e9e9e', { seg: 6 }), dx, 1.15, dz)));
      [[-0.95, 0.55], [0.95, 0.55]].forEach(([dx, dz]) => s.add(H.at(H.cyl(0.03, 0.03, 2.0, '#9e9e9e', { seg: 6 }), dx, 1.0, dz)));
      const rf = H.box(2.2, 0.04, 1.5, roof, { double: true }); rf.rotation.x = 0.18; s.add(H.at(rf, 0, 2.15, 0.05));
      for (let k = 0; k < 4; k++) { const sp = H.box(0.25, 0.045, 1.5, '#ffffff'); sp.rotation.x = 0.18; s.add(H.at(sp, -0.75 + k * 0.5, 2.16, 0.05)); }
      const pts = [];
      items.forEach((it, i) => {
        const bx = -0.6 + (i % 3) * 0.6, bz = -0.2 + Math.floor(i / 3) * 0.4;
        s.add(H.at(H.cyl(0.26, 0.2, 0.1, '#c8a26a', { seg: 12 }), bx, 0.89, bz));
        for (let k = 0; k < 7; k++) pts.push({ x: bx + (r() - 0.5) * 0.3, y: 0.98 + (k > 4 ? 0.07 : 0), z: bz + (r() - 0.5) * 0.25, s: 0.9 + r() * 0.3, color: produce[it] });
      });
      s.add(H.instanced(new THREE.SphereGeometry(0.065, 10, 8), '#ffffff', pts));
      return s;
    }
    g.add(stall(-3.4, -3.6, '#e53935', ['orange', 'dragon', 'mango', 'green', 'tomato', 'lime']));
    g.add(stall(-0.9, -3.8, '#1e88e5', ['tomato', 'purple', 'green', 'mango', 'orange', 'dragon']));
    g.add(stall(1.7, -3.6, '#43a047', ['lime', 'green', 'orange', 'purple', 'mango', 'tomato']));
    // fish stall on the left
    const fs = H.group(); fs.position.set(-4.0, 0, 0.2); fs.rotation.y = PI / 2;
    fs.add(H.at(H.box(1.8, 0.7, 0.9, '#78909c'), 0, 0.35, 0));
    fs.add(H.at(H.box(1.7, 0.06, 0.8, '#cfd8dc'), 0, 0.72, 0));
    for (let i = 0; i < 6; i++) { const f = H.sphere(0.07, H.mat('#9fb4c4', { metal: 0.5, rough: 0.3 }), { seg: 8, squash: [3, 0.8, 1] }); f.rotation.y = r() * 0.6; fs.add(H.at(f, -0.6 + (i % 3) * 0.55, 0.8, -0.2 + Math.floor(i / 3) * 0.35)); }
    g.add(fs);
    // baskets & crates on the ground
    [[2.9, -1.4], [3.6, -0.9], [-2.4, 2.4]].forEach(([x, z], i) => {
      g.add(H.at(H.cyl(0.32, 0.25, 0.32, '#b8894f', { seg: 14 }), x, 0.16, z));
      for (let k = 0; k < 5; k++) g.add(H.at(H.sphere(0.09, ['#7cb342', '#ff9f1c', '#e53935'][i], { seg: 8 }), x + Math.cos(k * 1.3) * 0.13, 0.35, z + Math.sin(k * 1.3) * 0.13));
    });
    [[3.6, -2.4], [4.1, -2.0]].forEach(([x, z]) => g.add(H.at(H.box(0.5, 0.35, 0.4, '#c49a6c'), x, 0.175, z)));
    // conical hats stand + vendor stool
    for (let i = 0; i < 3; i++) g.add(H.at(H.cone(0.32, 0.18, '#e8d39a', { seg: 18 }), 4.2, 0.1 + i * 0.12, 1.4));
    g.add(H.at(H.plasticStool('#d93a3a'), -2.0, 0, -2.5));
    // lantern string
    for (let i = 0; i < 6; i++) { const l = H.lantern(i % 2 ? '#e53935' : '#ffb300'); l.scale.setScalar(0.7); l.position.set(-3.8 + i * 1.5, 2.9 + Math.sin(i) * 0.1, -2.6); g.add(l); }
    g.add(wire(H, [[-4.8, 3.2, -2.6], [0, 2.95, -2.6], [4.8, 3.2, -2.6]], '#333', 0.01));
    g.add(H.at(H.sign('CHỢ PHƯỜNG', 2.2, 0.42, { bg: '#ffb300', fg: '#5d2c00', font: '900 80px "Baloo 2", system-ui' }), 3.6, 2.9, -4.6));
    [[4.3, -4.3]].forEach(([x, z]) => { g.add(H.at(H.cyl(0.04, 0.04, 3.3, '#666', { seg: 6 }), x - 1, 1.6, z)); g.add(H.at(H.cyl(0.04, 0.04, 3.3, '#666', { seg: 6 }), x + 0.5, 1.6, z)); });
    H.nightLight(g, [-1, 2.6, -2.6], '#ffcf8a', 1.4, 9);
    decorAt(H, g, opts, 3.4, -0.2);
    return { group: g, npcSpots: [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-1.1, 0, -1.4], rotY: 0.4 }, { pos: [1.6, 0, -1.3], rotY: -0.5 }] };
  });

  // 3. PARK — hồ công viên -------------------------------------------------------------
  KN.Env.register('park', { name: 'Công viên', indoor: false, sky: ['#86c5f2', '#f4f9e8'] }, function (H, opts) {
    const g = H.group(), r = H.rng(303);
    g.add(H.slab(10, 10, { top: '#8cc56b', side: '#6b5a3a' }));
    // lake with stone rim
    const lakeGeo = new THREE.CircleGeometry(1, 40); lakeGeo.rotateX(-PI / 2);
    const water = new THREE.MeshStandardMaterial({ color: '#3f9fc9', roughness: 0.15, metalness: 0.3, emissive: '#0d4a66', emissiveIntensity: 0.25 });
    const lake = H.mesh(lakeGeo, water, { cast: false }); lake.scale.set(3.0, 1, 2.0); lake.position.set(-2.0, 0.03, -3.0); g.add(lake);
    const rim = []; for (let i = 0; i < 40; i++) { const a = (i / 40) * PI * 2; rim.push({ x: -2.0 + Math.cos(a) * 3.05, y: 0.04, z: -3.0 + Math.sin(a) * 2.05, ry: -a, s: 0.9 + r() * 0.3 }); }
    g.add(H.instanced(new THREE.SphereGeometry(0.16, 6, 4), '#a8a29a', rim, { cast: false }));
    // pads & ducks
    for (let i = 0; i < 5; i++) g.add(H.at(H.cyl(0.18, 0.18, 0.01, '#4c9a4a', { seg: 10, cast: false }), -3.4 + r() * 1.6, 0.045, -2.4 + r() * 0.8));
    const ducks = [];
    for (let i = 0; i < 2; i++) { const d = H.group(H.at(H.sphere(0.12, '#ffffff', { seg: 10, squash: [1.3, 0.9, 1] }), 0, 0.08, 0), H.at(H.sphere(0.07, '#ffffff', { seg: 8 }), 0.13, 0.2, 0), H.at(H.cone(0.03, 0.08, '#ff9800', { seg: 6 }), 0.21, 0.19, 0)); d.children[2].rotation.z = -PI / 2; g.add(d); ducks.push(d); }
    // small tower on an islet (tháp)
    const tw = H.group(); tw.position.set(-2.9, 0, -3.4);
    tw.add(H.at(H.cyl(0.45, 0.5, 0.12, '#7a8b6a', { seg: 12 }), 0, 0.08, 0));
    [[0.62, 0.55], [0.5, 0.45], [0.38, 0.35]].forEach(([w, h], i) => { tw.add(H.at(H.box(w, h, w, '#e8dcc0'), 0, 0.4 + i * 0.52, 0)); tw.add(H.at(H.box(w + 0.12, 0.05, w + 0.12, '#8d6e63'), 0, 0.66 + i * 0.52, 0)); });
    tw.add(H.at(H.cone(0.2, 0.3, '#8d6e63', { seg: 4 }), 0, 1.95, 0));
    g.add(tw);
    // red arched bridge
    const br = H.group(); br.position.set(-0.9, 0, -2.1); br.rotation.y = 0.9;
    const arch = H.torus(1.4, 0.06, '#c62828', { arc: PI }); arch.scale.set(1, 0.45, 1); br.add(H.at(arch, 0, 0, 0.3)); const arch2 = H.torus(1.4, 0.06, '#c62828', { arc: PI }); arch2.scale.set(1, 0.45, 1); br.add(H.at(arch2, 0, 0, -0.3));
    for (let i = 0; i < 11; i++) { const a = (i / 10) * PI; const p = H.box(0.24, 0.05, 0.62, '#a1442a'); p.position.set(Math.cos(a) * 1.4, Math.sin(a) * 0.63 - 0.02, 0); p.rotation.z = Math.atan2(Math.cos(a) * 0.63, -Math.sin(a) * 1.4); br.add(p); }
    for (let i = 0; i < 6; i++) { const a = (i / 5) * PI; [-0.3, 0.3].forEach((z) => br.add(H.at(H.box(0.04, 0.35, 0.04, '#c62828'), Math.cos(a) * 1.35, Math.sin(a) * 0.63 + 0.17, z))); }
    g.add(br);
    // willows, trees, benches, lamps, flowers
    g.add(H.at(H.tree('willow', { h: 3.6, leaves: '#79b65a', seed: 1 }), -4.2, 0, -0.6));
    g.add(H.at(H.tree('willow', { h: 3.3, leaves: '#8ac46a', seed: 2 }), 1.6, 0, -4.3));
    g.add(H.at(H.tree('round', { h: 3.8, leaves: '#4f9a4a', seed: 3 }), 4.0, 0, -4.0));
    g.add(H.at(bench(H), 2.7, 0, -1.9, -0.3));
    g.add(H.at(bench(H), -4.0, 0, 1.6, PI / 2));
    g.add(H.at(lampPost(H), 3.9, 0, -0.6, PI));
    g.add(H.at(lampPost(H), -3.2, 0, 3.4, 0));
    const fl = [];
    for (let i = 0; i < 46; i++) fl.push({ x: 2.6 + r() * 1.9, y: 0.12, z: 2.6 + r() * 1.8, s: 0.6 + r() * 0.6, color: ['#ff6f91', '#ffd166', '#f78c6b', '#ffffff', '#c792ff'][i % 5] });
    g.add(H.instanced(new THREE.SphereGeometry(0.09, 8, 6), '#ffffff', fl));
    g.add(H.at(H.ground(2.1, 2.0, '#6aa84f'), 3.5, 0.003, 3.5));
    const path = []; for (let i = 0; i < 12; i++) path.push({ x: 1.0 + Math.sin(i * 0.5) * 0.6, y: 0.01, z: 4.4 - i * 0.6, s: 0.8 + r() * 0.3 });
    g.add(H.instanced(new THREE.CylinderGeometry(0.25, 0.27, 0.03, 10), '#cfc6b4', path, { cast: false }));
    H.onUpdate((dt, t) => {
      water.emissiveIntensity = 0.22 + Math.sin(t * 1.3) * 0.06;
      ducks.forEach((d, i) => { const a = t * 0.25 + i * PI; d.position.set(-1.4 + Math.cos(a) * 0.9, 0.03 + Math.sin(t * 3 + i) * 0.01, -3.0 + Math.sin(a) * 0.6); d.rotation.y = -a + (i ? PI : 0); });
    });
    H.nightLight(g, [3.5, 2.6, -0.6], '#ffe2a8', 1.4, 8);
    decorAt(H, g, opts, 1.4, -1.0);
    return { group: g, anchors: { seat: { pos: [2.7, 0.03, -1.82], rotY: -0.3 } } };
  });

  // 4. BEACH — biển -----------------------------------------------------------------
  KN.Env.register('beach', { name: 'Biển', indoor: false, sky: ['#5fb7f0', '#e9f7ff'] }, function (H, opts) {
    const g = H.group(), r = H.rng(404);
    g.add(H.slab(10, 10, { top: '#f0d9a7', side: '#b08d5a' }));
    // sea (animated vertex waves) in the back
    const seaGeo = new THREE.PlaneGeometry(10, 4.4, 30, 12); seaGeo.rotateX(-PI / 2);
    const seaM = new THREE.MeshStandardMaterial({ color: '#2f9fd0', roughness: 0.18, metalness: 0.25, transparent: true, opacity: 0.94 });
    const sea = H.mesh(seaGeo, seaM, { cast: false }); sea.position.set(0, 0.06, -2.8); g.add(sea);
    const base = seaGeo.attributes.position.array.slice();
    const foam = [];
    for (let i = 0; i < 3; i++) { const f = H.box(10, 0.02, 0.12, H.mat('#ffffff', { opacity: 0.75, unique: true }), { cast: false }); g.add(f); foam.push(f); }
    // palms
    g.add(H.at(H.tree('palm', { h: 3.6, seed: 2, leaves: '#3f9b4a' }), -4.0, 0, 1.6));
    g.add(H.at(H.tree('palm', { h: 3.2, seed: 5, leaves: '#4caf50' }), -3.2, 0, -0.4));
    g.add(H.at(H.tree('palm', { h: 3.9, seed: 8, leaves: '#3f9b4a' }), 4.1, 0, -0.9));
    // basket boats (thúng chai)
    function thung() { const t = H.group(); const b = H.mesh(new THREE.SphereGeometry(0.55, 18, 8, 0, PI * 2, PI / 2, PI / 2), H.mat('#7a5a33', { double: true }), {}); b.rotation.x = PI; b.position.y = 0.32; t.add(b); t.add(H.at(H.torus(0.55, 0.04, '#5d4127'), 0, 0.32, 0)); t.children[1].rotation.x = PI / 2; return t; }
    const tb1 = thung(); tb1.position.set(-1.9, 0, -0.6); g.add(tb1);
    const tb2 = thung(); tb2.position.set(1.6, 0, -3.3); g.add(tb2);
    // umbrella + loungers
    const um = H.group(H.at(H.cyl(0.03, 0.03, 2.3, '#eee', { seg: 6 }), 0, 1.15, 0), H.at(H.cone(1.2, 0.45, '#ff7043', { seg: 10, double: true }), 0, 2.3, 0));
    for (let i = 0; i < 5; i++) { const s = H.cone(1.21, 0.45, '#ffffff', { seg: 10, double: true }); s.scale.set(0.2, 1, 1); s.rotation.y = i * (PI / 5) * 2; um.add(H.at(s, 0, 2.3, 0)); }
    um.position.set(2.6, 0, 0.1); um.rotation.z = 0.08; g.add(um);
    function lounger(x, z, ry) { const l = H.group(); l.add(H.at(H.box(0.6, 0.06, 1.6, '#ffffff'), 0, 0.35, 0)); const bk = H.box(0.6, 0.06, 0.7, '#ffffff'); bk.rotation.x = -0.7; l.add(H.at(bk, 0, 0.55, -0.85)); l.add(H.at(H.box(0.62, 0.3, 1.5, '#2f80ed'), 0, 0.17, -0.05)); l.position.set(x, 0, z); l.rotation.y = ry; return l; }
    g.add(lounger(2.0, 1.4, PI * 0.95)); g.add(lounger(3.3, 1.2, PI * 1.05));
    // shells, starfish, sandcastle, island, gulls
    for (let i = 0; i < 8; i++) g.add(H.at(H.sphere(0.06, ['#ffe0e9', '#fff3d6', '#ffd6a5'][i % 3], { seg: 6, squash: [1.2, 0.5, 1] }), -4 + r() * 8, 0.02, 0.5 + r() * 3.8));
    const sc = H.group(H.at(H.cyl(0.35, 0.4, 0.3, '#e2c48a', { seg: 12 }), 0, 0.15, 0), H.at(H.cyl(0.22, 0.26, 0.25, '#e2c48a', { seg: 12 }), 0, 0.42, 0), H.at(H.cone(0.14, 0.25, '#e2c48a', { seg: 10 }), 0, 0.66, 0));
    sc.position.set(-1.2, 0, 3.4); g.add(sc);
    g.add(H.at(H.sphere(1.6, '#5f9e4f', { seg: 14, flat: true, squash: [1.4, 0.55, 0.7] }), 3.4, -0.2, -4.6));
    const gulls = [];
    for (let i = 0; i < 2; i++) { const b = H.group(); [-1, 1].forEach((s) => { const w = H.box(0.32, 0.02, 0.1, '#ffffff'); w.rotation.z = s * 0.35; b.add(H.at(w, s * 0.15, 0, 0)); }); g.add(b); gulls.push(b); }
    H.onUpdate((dt, t) => {
      const p = seaGeo.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) p[i + 1] = base[i + 1] + Math.sin(base[i] * 1.3 + t * 1.6) * 0.04 + Math.cos(base[i + 2] * 2.1 + t * 1.1) * 0.03;
      seaGeo.attributes.position.needsUpdate = true; seaGeo.computeVertexNormals();
      foam.forEach((f, i) => { const k = (t * 0.18 + i / 3) % 1; f.position.set(0, 0.08, -0.7 + k * 0.5 - i * 0.05); f.material.opacity = 0.75 * Math.sin(k * PI); });
      tb2.position.y = Math.sin(t * 1.4) * 0.05; tb2.rotation.z = Math.sin(t * 1.1) * 0.06;
      gulls.forEach((b, i) => { const a = t * 0.35 + i * 2.5; b.position.set(Math.cos(a) * 3.5, 3.6 + i * 0.5, -2.5 + Math.sin(a) * 1.5); b.rotation.y = -a; b.children.forEach((w, k) => (w.rotation.z = (k ? 1 : -1) * (0.35 + Math.sin(t * 8 + i) * 0.35))); });
    });
    H.nightLight(g, [2.6, 2.0, 0.1], '#ffd9a0', 1.0, 6);
    decorAt(H, g, opts, -1.0, 2.2);
    return { group: g, anchors: { seat: { pos: [2.0, 0, 1.15], rotY: PI * 0.95 + PI } } };
  });

  // 5. COUNTRYSIDE — quê ---------------------------------------------------------------
  KN.Env.register('countryside', { name: 'Quê nhà', indoor: false, sky: ['#7ec3f0', '#fff6dc'] }, function (H, opts) {
    const g = H.group(), r = H.rng(505);
    g.add(H.slab(10, 10, { top: '#86b45a', side: '#6b4f2f' }));
    // paddies: water + dikes + rice
    const pw = new THREE.MeshStandardMaterial({ color: '#7fb6a8', roughness: 0.2, metalness: 0.2 });
    [[1.2, -3.0, 6.8, 3.2]].forEach(([x, z, w, d]) => { const p = H.box(w, 0.04, d, pw, { cast: false }); g.add(H.at(p, x, 0.03, z)); });
    [[1.2, -1.35, 7.0, 0.22], [1.2, -4.65, 7.0, 0.22], [-2.25, -3.0, 0.22, 3.4], [4.65, -3.0, 0.22, 3.4], [1.2, -3.0, 7.0, 0.16]].forEach(([x, z, w, d]) => g.add(H.at(H.box(w, 0.14, d, '#8a6a43'), x, 0.07, z)));
    const rice = [];
    for (let i = 0; i < 26; i++) for (let k = 0; k < 9; k++) {
      if (k === 4) continue;
      rice.push({ x: -1.9 + i * 0.25 + (r() - 0.5) * 0.05, y: 0.18, z: -4.4 + k * 0.36 + (r() - 0.5) * 0.05, ry: r() * PI, s: 0.85 + r() * 0.3, color: k < 4 ? '#9bc53d' : '#c9b53a' });
    }
    g.add(H.instanced(new THREE.ConeGeometry(0.07, 0.36, 5), '#ffffff', rice));
    // house with red tile roof
    const hs = H.group(); hs.position.set(-3.7, 0, -3.3);
    hs.add(H.at(H.box(2.2, 1.7, 1.6, '#f3d27a'), 0, 0.85, 0));
    const rf1 = H.box(2.6, 0.08, 1.15, '#b5452e'); rf1.rotation.x = 0.62; hs.add(H.at(rf1, 0, 2.0, 0.42));
    const rf2 = H.box(2.6, 0.08, 1.15, '#a33b27'); rf2.rotation.x = -0.62; hs.add(H.at(rf2, 0, 2.0, -0.42));
    hs.add(H.at(H.box(2.65, 0.1, 0.12, '#8e2f1e'), 0, 2.36, 0));
    hs.add(H.at(H.box(0.55, 1.05, 0.05, '#6d4c33'), -0.3, 0.53, 0.81));
    hs.add(H.at(H.box(0.5, 0.45, 0.05, H.glow('#ffd58a', { intensity: 1.5 })), 0.6, 1.0, 0.81));
    hs.add(H.at(H.box(2.2, 0.12, 0.5, '#bdb3a3'), 0, 0.06, 1.05));
    g.add(hs);
    // buffalo
    const buf = H.group(); buf.position.set(2.6, 0, 0.0); buf.rotation.y = -0.7;
    const bm = '#4a4a50';
    buf.add(H.at(H.sphere(0.5, bm, { seg: 14, squash: [1.5, 0.9, 0.95] }), 0, 0.85, 0));
    [[-0.45, -0.25], [-0.45, 0.25], [0.45, -0.25], [0.45, 0.25]].forEach(([x, z]) => buf.add(H.at(H.cyl(0.08, 0.07, 0.6, bm, { seg: 8 }), x, 0.32, z)));
    const head = H.group(); head.position.set(0.8, 0.9, 0); buf.add(head);
    head.add(H.at(H.sphere(0.26, bm, { seg: 12, squash: [1.2, 0.9, 0.9] }), 0.12, -0.05, 0));
    head.add(H.at(H.sphere(0.13, '#5c5c62', { seg: 10 }), 0.38, -0.12, 0));
    [-1, 1].forEach((s) => { const h = H.torus(0.22, 0.035, '#d9cfbf', { arc: PI * 0.9 }); h.rotation.set(PI / 2, 0, s > 0 ? 0.2 : PI - 0.2); head.add(H.at(h, 0.0, 0.18, s * 0.12)); });
    const tail = H.box(0.03, 0.5, 0.03, bm); buf.add(H.at(tail, -0.72, 0.65, 0));
    g.add(buf);
    // bamboo, bananas, haystack, path, egret, hills
    g.add(H.at(H.tree('bamboo', { h: 3.6, leaves: '#6aa84f', seed: 3 }), -4.3, 0, 0.9));
    g.add(H.at(H.tree('bamboo', { h: 3.2, leaves: '#79b65a', seed: 4 }), -4.4, 0, 2.4));
    g.add(H.at(H.tree('banana', { h: 2.2, leaves: '#7cb342', seed: 6 }), -2.5, 0, -1.0));
    g.add(H.at(H.cone(0.7, 1.4, '#e3c46b', { seg: 12 }), 4.3, 0.7, -0.9));
    g.add(H.at(H.cyl(0.05, 0.05, 1.8, '#8d6e63', { seg: 6 }), 4.3, 0.9, -0.9));
    g.add(H.at(H.ground(1.2, 6.0, '#b89a6a'), -2.9, 0.003, 1.6));
    for (let i = 0; i < 3; i++) g.add(H.at(H.sphere(0.9 + i * 0.2, '#6f9f4a', { seg: 10, flat: true, squash: [1.6, 0.6, 0.6] }), -1.0 + i * 2.6, 0, -4.85));
    const egret = H.group(H.at(H.sphere(0.1, '#ffffff', { seg: 8, squash: [2, 0.8, 0.8] }), 0, 0, 0));
    const wings = [-1, 1].map((s) => { const w = H.box(0.08, 0.02, 0.4, '#ffffff'); egret.add(H.at(w, 0, 0, s * 0.2)); return w; });
    g.add(egret);
    H.onUpdate((dt, t) => {
      head.rotation.z = -0.45 + Math.sin(t * 0.7) * 0.25; tail.rotation.x = Math.sin(t * 2) * 0.3;
      const a = t * 0.3; egret.position.set(Math.cos(a) * 3.6, 3.4 + Math.sin(t) * 0.2, -1.5 + Math.sin(a) * 2); egret.rotation.y = -a;
      wings.forEach((w, i) => (w.rotation.x = (i ? 1 : -1) * Math.sin(t * 6) * 0.6));
    });
    H.nightLight(g, [-3.4, 1.4, -2.2], '#ffcf8a', 1.0, 6);
    decorAt(H, g, opts, -2.6, 0.8);
    return { group: g, npcSpots: [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.4, 0, 1.4], rotY: -0.6 }, { pos: [-1.0, 0, -0.6], rotY: 0.5 }, { pos: [1.3, 0, -0.6], rotY: -0.5 }] };
  });

  // 6. TEMPLE — chùa ------------------------------------------------------------------
  KN.Env.register('temple', { name: 'Chùa', indoor: false, sky: ['#9fc9ec', '#fbeed5'] }, function (H, opts) {
    const g = H.group(), r = H.rng(606);
    g.add(H.slab(10, 10, { top: '#cfc6b3', side: '#6e5c49' }));
    const tiles = []; for (let x = 0; x < 9; x++) for (let z = 0; z < 6; z++) if ((x + z) % 2) tiles.push({ x: -4 + x, y: 0.004, z: -1.6 + z, sx: 0.96, sz: 0.96 });
    g.add(H.instanced(new THREE.BoxGeometry(1, 0.006, 1), '#bdb3a0', tiles, { cast: false }));
    // hall
    const hall = H.group(); hall.position.set(0.4, 0, -3.9);
    hall.add(H.at(H.box(6.4, 0.5, 2.0, '#9e9384'), 0, 0.25, 0));
    for (let i = 0; i < 3; i++) hall.add(H.at(H.box(2.0, 0.17, 0.35, '#b3a896'), 0, 0.085 + i * 0.0, 1.15 - i * 0.0)); // steps
    hall.add(H.at(H.box(5.6, 2.2, 1.4, '#e9d9b8'), 0, 1.6, -0.2));
    hall.add(H.at(H.box(1.2, 1.7, 0.05, '#3b1d12'), 0, 1.35, 0.52));
    hall.add(H.at(H.box(0.9, 0.5, 0.05, H.glow('#ffb347', { intensity: 1.8 })), 0, 1.5, 0.53));
    [-2.6, -1.3, 1.3, 2.6].forEach((x) => hall.add(H.at(H.cyl(0.11, 0.12, 2.3, '#a61e1e', { seg: 10 }), x, 1.65, 0.75)));
    const roofM = '#2f6b4f';
    const rf1 = H.box(6.6, 0.12, 1.5, roofM); rf1.rotation.x = 0.45; hall.add(H.at(rf1, 0, 3.05, 0.45));
    const rf2 = H.box(6.6, 0.12, 1.5, U_dark(roofM)); rf2.rotation.x = -0.45; hall.add(H.at(rf2, 0, 3.05, -0.85));
    hall.add(H.at(H.box(5.4, 0.16, 0.16, '#c9a227'), 0, 3.38, -0.2));
    [-1, 1].forEach((s) => { const tip = H.cone(0.12, 0.6, '#c9a227', { seg: 6 }); tip.rotation.z = -s * 0.9; hall.add(H.at(tip, s * 2.85, 3.55, -0.2)); const e1 = H.cone(0.09, 0.5, roofM, { seg: 6 }); e1.rotation.set(0.6, 0, -s * 1.1); hall.add(H.at(e1, s * 3.35, 2.85, 1.0)); });
    hall.add(H.at(H.sphere(0.2, '#c9a227', { seg: 12 }), 0, 3.55, -0.2));
    hall.add(H.at(H.sign('CHÙA AN LẠC', 1.8, 0.36, { bg: '#7a1414', fg: '#ffd54f', font: '800 70px "Be Vietnam Pro", serif' }), 0, 2.45, 0.53));
    [-2.0, 2.0].forEach((x) => { const l = H.lantern('#e53935'); l.position.set(x, 2.35, 0.95); hall.add(l); });
    g.add(hall);
    // incense burner + smoke
    const bur = H.group(); bur.position.set(-1.9, 0, -1.4);
    bur.add(H.at(H.cyl(0.38, 0.3, 0.55, H.mat('#7b5a2a', { metal: 0.6, rough: 0.35 }), { seg: 14 }), 0, 0.62, 0));
    for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2; bur.add(H.at(H.cyl(0.05, 0.04, 0.4, '#5d4320', { seg: 6 }), Math.cos(a) * 0.22, 0.2, Math.sin(a) * 0.22)); }
    bur.add(H.at(H.cyl(0.42, 0.42, 0.06, '#5d4320', { seg: 14 }), 0, 0.92, 0));
    for (let i = 0; i < 7; i++) bur.add(H.at(H.cyl(0.005, 0.005, 0.32, '#b3261e', { seg: 4, cast: false }), (r() - 0.5) * 0.3, 1.08, (r() - 0.5) * 0.3));
    g.add(bur);
    const smoke = [];
    for (let i = 0; i < 6; i++) { const s = H.sphere(0.12, H.mat('#e6e6e6', { opacity: 0.3, unique: true }), { seg: 8, cast: false }); g.add(s); smoke.push(s); }
    H.onUpdate((dt, t) => smoke.forEach((s, i) => { const k = (t * 0.22 + i / 6) % 1; s.position.set(-1.9 + Math.sin(t * 0.7 + i) * 0.15 * k, 1.25 + k * 1.8, -1.4 + Math.cos(t * 0.5 + i) * 0.1 * k); s.scale.setScalar(0.5 + k * 2.2); s.material.opacity = 0.32 * (1 - k); }));
    // bodhi tree, lotus pond, stone lanterns, bell
    g.add(H.at(H.tree('round', { h: 4.3, leaves: '#3f8a3e', seed: 9 }), -4.1, 0, -3.6, 0, 1.15));
    const pondGeo = new THREE.CircleGeometry(1, 28); pondGeo.rotateX(-PI / 2);
    const pond = H.mesh(pondGeo, new THREE.MeshStandardMaterial({ color: '#4f8f8a', roughness: 0.15, metalness: 0.3 }), { cast: false }); pond.scale.set(1.3, 1, 0.9); pond.position.set(-3.6, 0.02, 2.4); g.add(pond);
    for (let i = 0; i < 6; i++) { const x = -3.6 + (r() - 0.5) * 1.8, z = 2.4 + (r() - 0.5) * 1.1; g.add(H.at(H.cyl(0.16, 0.16, 0.01, '#4c9a4a', { seg: 10, cast: false }), x, 0.035, z)); if (i % 2 === 0) g.add(H.at(H.sphere(0.07, '#ff8fb1', { seg: 8, squash: [1, 1.3, 1] }), x, 0.11, z)); }
    [[-1.0, -2.5], [1.9, -2.5]].forEach(([x, z]) => { const l = H.group(H.at(H.box(0.3, 0.5, 0.3, '#a59a88'), 0, 0.25, 0), H.at(H.box(0.42, 0.06, 0.42, '#8e8474'), 0, 0.53, 0), H.at(H.box(0.24, 0.24, 0.24, H.glow('#ffd58a', { intensity: 1.4 })), 0, 0.68, 0), H.at(H.cone(0.32, 0.25, '#8e8474', { seg: 4 }), 0, 0.92, 0)); l.position.set(x, 0, z); g.add(l); });
    const bell = H.group(H.at(H.box(0.08, 2.0, 0.08, '#6d4c33'), -0.5, 1.0, 0), H.at(H.box(0.08, 2.0, 0.08, '#6d4c33'), 0.5, 1.0, 0), H.at(H.box(1.2, 0.1, 0.12, '#6d4c33'), 0, 2.0, 0), H.at(H.cyl(0.24, 0.3, 0.6, H.mat('#8a6a2f', { metal: 0.6, rough: 0.35 }), { seg: 14 }), 0, 1.55, 0));
    bell.position.set(4.0, 0, -1.6); g.add(bell);
    g.add(H.at(H.tree('potted', { seed: 61, leaves: '#2e7d32' }), 2.9, 0, 1.6));
    H.nightLight(g, [0.4, 2.2, -2.6], '#ffb36b', 1.5, 9);
    H.nightLight(g, [-1.9, 1.4, -1.4], '#ff9a5a', 0.8, 4);
    if (opts.decor === 'funeral') g.add(H.at(H.decor.funeral(), 0.4, 0, -2.3));
    else decorAt(H, g, opts, 2.0, -1.6);
    return { group: g, npcSpots: [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-2.6, 0, 0.2], rotY: 0.8 }, { pos: [2.6, 0, 0.2], rotY: -0.8 }] };
  });
  function U_dark(c) { return KN.util.shadeHex(c, -0.15); }

  // 7. UNIVERSITY ----------------------------------------------------------------------
  KN.Env.register('university', { name: 'Đại học', indoor: false, sky: ['#8cc8f5', '#f3f9ff'] }, function (H, opts) {
    const g = H.group(), r = H.rng(707);
    g.add(H.slab(10, 10, { top: '#93c46c', side: '#6b5a3a' }));
    g.add(H.at(H.ground(6.5, 5.5, '#d7cfc0'), 1.2, 0.004, -0.6));
    const tiles = []; for (let i = 0; i < 9; i++) tiles.push({ x: 1.2, y: 0.006, z: 2.0 - i * 0.6, sx: 1.4, sz: 0.04 });
    g.add(H.instanced(new THREE.BoxGeometry(1, 0.004, 1), '#bfb5a3', tiles, { cast: false }));
    // building facade
    const b = H.group(); b.position.set(0.6, 0, -4.2);
    b.add(H.at(H.box(8.6, 3.9, 1.4, '#f3ead8'), 0, 1.95, -0.1));
    b.add(H.at(H.box(8.8, 0.25, 1.6, '#c9b99a'), 0, 4.0, -0.1));
    b.add(H.at(H.box(3.4, 0.9, 1.5, '#c9b99a'), 0, 4.5, -0.1));
    b.add(H.at(H.cone(1.9, 0.6, '#b5452e', { seg: 4 }), 0, 5.2, -0.1)).children;
    for (let i = 0; i < 6; i++) b.add(H.at(H.cyl(0.13, 0.15, 3.3, '#ffffff', { seg: 12 }), -2.5 + i * 1.0, 1.85, 0.75));
    b.add(H.at(H.box(5.6, 0.2, 0.6, '#e6dcc6'), 0, 3.55, 0.75));
    for (let i = 0; i < 3; i++) b.add(H.at(H.box(5.4 - i * 0.3, 0.12, 0.4, '#d6cbb5'), 0, 0.06 + i * 0.12, 1.1 - i * 0.25));
    b.add(H.at(H.box(1.1, 1.9, 0.05, '#5d4037'), 0, 1.25, 0.61));
    const winM = H.glow('#ffe39a', { intensity: 1.4 });
    for (let row = 0; row < 2; row++) for (let i = 0; i < 8; i++) { if (i === 3 || i === 4) continue; b.add(H.at(H.box(0.55, 0.75, 0.05, row ? winM : '#9cc3e6'), -3.6 + i * 1.03, 1.3 + row * 1.5, 0.61)); }
    b.add(H.at(H.sign('ĐẠI HỌC', 2.6, 0.5, { bg: '#1e3a8a', fg: '#ffd54f', font: '900 110px "Be Vietnam Pro", system-ui' }), 0, 4.5, 0.66));
    g.add(b);
    g.add(H.at(H.sign('CHÀO MỪNG TÂN SINH VIÊN', 3.2, 0.42, { bg: '#c62828', fg: '#ffffff', font: '800 56px "Be Vietnam Pro", system-ui' }), 0.6, 2.95, -3.15));
    // big shade tree + benches
    g.add(H.at(H.tree('round', { h: 4.6, leaves: '#3f8f45', seed: 12 }), -3.7, 0, -1.6, 0, 1.25));
    g.add(H.at(bench(H, '#6d4c33'), -3.2, 0, 0.6, PI / 2 * 0.0 + 0.4));
    g.add(H.at(H.box(0.35, 0.3, 0.15, '#c62828'), -3.55, 0.6, 0.5));
    // bikes, notice board, bushes, lamp
    [[2.7, -2.3], [3.4, -2.25], [4.1, -2.2]].forEach(([x, z], i) => g.add(H.at(H.motorbike(), x, 0, z, PI / 2 + (i - 1) * 0.1)));
    const nb = H.group(H.at(H.box(1.5, 1.0, 0.08, '#8d6e63'), 0, 1.35, 0), H.at(H.box(0.06, 1.0, 0.06, '#6d4c33'), -0.6, 0.5, 0), H.at(H.box(0.06, 1.0, 0.06, '#6d4c33'), 0.6, 0.5, 0));
    ['#fff59d', '#ffffff', '#b3e5fc', '#ffccbc', '#c8e6c9'].forEach((c, i) => nb.add(H.at(H.box(0.3, 0.38, 0.01, c, { cast: false }), -0.5 + (i % 3) * 0.48, 1.45 - Math.floor(i / 3) * 0.42 + (i % 2) * 0.05, 0.05)));
    nb.position.set(4.3, 0, 0.6); nb.rotation.y = -PI / 2.3; g.add(nb);
    [[-1.8, -2.8], [-0.8, -2.85], [2.0, -2.85]].forEach(([x, z], i) => g.add(H.at(H.tree('bush', { seed: 70 + i, leaves: '#4f9a4a' }), x, 0, z, 0, 0.8)));
    g.add(H.at(lampPost(H), -1.6, 0, 3.6, 0));
    H.nightLight(g, [0.6, 2.5, -2.6], '#ffe0a8', 1.3, 9);
    decorAt(H, g, opts, 2.6, 2.6);
    return { group: g, anchors: { seat: { pos: [-3.18, 0.03, 0.62], rotY: 0.4 } }, npcSpots: [{ pos: [-1.5, 0, 1.0], rotY: 0.6 }, { pos: [1.5, 0, 1.0], rotY: -0.6 }, { pos: [-1.6, 0, -1.0], rotY: 0.5 }, { pos: [2.2, 0, -0.6], rotY: -0.8 }] };
  });

  // 8. WEDDING — tiệc cưới ------------------------------------------------------------
  KN.Env.register('wedding', { name: 'Tiệc cưới', indoor: false, sky: ['#ffb3c7', '#fff1e0'] }, function (H, opts) {
    const g = H.group(), r = H.rng(808);
    g.add(H.slab(10, 10, { top: '#ead9c4', side: '#7a5a42' }));
    g.add(H.at(H.ground(1.6, 6.0, '#b71c1c'), 0, 0.005, 1.0));
    // stage + backdrop
    g.add(H.at(H.box(6.6, 0.3, 1.8, '#f5e6d3'), 0, 0.15, -4.0));
    g.add(H.at(H.box(6.6, 3.2, 0.12, '#b71c1c'), 0, 1.9, -4.85));
    g.add(H.at(H.sign('囍', 1.3, 1.3, { w: 256, h: 256, bg: null, fg: '#ffd54f', font: '900 220px serif' }), 0, 2.4, -4.77));
    g.add(H.at(H.sign('HẠNH PHÚC', 3.0, 0.45, { bg: null, fg: '#ffe9a8', font: '900 96px "Baloo 2", system-ui' }), 0, 1.35, -4.77));
    // heart flower arch
    const arch = H.group(); arch.position.set(0, 0.3, -3.6);
    const flowers = [];
    for (let i = 0; i < 60; i++) { const t = (i / 60) * PI * 2; const x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); flowers.push({ x: x * 0.085, y: 1.35 + y * 0.085, z: 0, s: 0.8 + r() * 0.5, color: ['#ffffff', '#ff8fb1', '#ffd6e0', '#e53950'][i % 4] }); }
    arch.add(H.instanced(new THREE.SphereGeometry(0.11, 8, 6), '#ffffff', flowers));
    g.add(arch);
    // banquet tables
    function table(x, z) {
      const t = H.group(); t.position.set(x, 0, z);
      t.add(H.at(H.cyl(0.75, 0.82, 0.75, '#c62828', { seg: 24 }), 0, 0.375, 0));
      t.add(H.at(H.cyl(0.78, 0.78, 0.03, '#f8f1e5', { seg: 24 }), 0, 0.77, 0));
      t.add(H.at(H.tree('flower', { seed: x * 3 + z, pot: '#ffffff' }), 0, 0.78, 0, 0, 0.6));
      const ch = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * PI * 2; ch.push({ x: Math.cos(a) * 1.05, y: 0.42, z: Math.sin(a) * 1.05, ry: -a + PI / 2 }); }
      t.add(H.instanced(new THREE.BoxGeometry(0.4, 0.84, 0.4), '#fdf6ec', ch));
      for (let i = 0; i < 5; i++) t.add(H.at(H.cyl(0.08, 0.08, 0.02, '#ffffff', { seg: 10 }), Math.cos(i * 1.25) * 0.5, 0.8, Math.sin(i * 1.25) * 0.5));
      return t;
    }
    g.add(table(-3.3, -1.7)); g.add(table(-3.5, 1.4)); g.add(table(3.3, -1.6));
    // gift table + money box, cake, flower stands, balloons
    g.add(H.at(H.box(1.2, 0.75, 0.6, '#f8f1e5'), 3.3, 0.375, -3.3));
    g.add(H.at(H.box(0.45, 0.4, 0.35, '#c62828'), 3.1, 0.95, -3.3));
    g.add(H.at(H.sign('囍', 0.3, 0.3, { w: 128, h: 128, bg: null, fg: '#ffd54f', font: '900 110px serif' }), 3.1, 0.95, -3.12));
    for (let i = 0; i < 3; i++) g.add(H.at(H.cyl(0.3 - i * 0.08, 0.3 - i * 0.08, 0.25, '#fffaf2', { seg: 18 }), -2.4, 0.42 + i * 0.25, -3.6));
    g.add(H.at(H.sphere(0.06, '#e53950', { seg: 8 }), -2.4, 1.15, -3.6));
    [-3.3, 3.3].forEach((x) => { g.add(H.at(H.cyl(0.05, 0.12, 1.5, '#d4af37', { seg: 8, metal: 0.6, rough: 0.35 }), x, 1.05, -3.9)); g.add(H.at(H.sphere(0.38, '#ff8fb1', { seg: 12, flat: true }), x, 1.9, -3.9)); });
    const balloons = [];
    [[-4.4, -4.4], [4.4, -4.4], [4.4, 3.8]].forEach(([x, z], k) => { for (let i = 0; i < 4; i++) { const b = H.sphere(0.2, ['#e53950', '#ffd54f', '#ffffff', '#ff8fb1'][i], { seg: 12, squash: [1, 1.2, 1], rough: 0.35 }); b.position.set(x + Math.cos(i * 1.6) * 0.22, 2.2 + i * 0.12, z + Math.sin(i * 1.6) * 0.22); g.add(b); balloons.push(b); } g.add(H.at(H.cyl(0.004, 0.004, 1.9, '#eee', { seg: 3, cast: false }), x, 1.1, z)); });
    // string lights
    const bulbM = H.glow('#ffe6a8', { intensity: 2.2 });
    const bulbs = [];
    [[-4.8, 4.8, -4.6], [-4.8, 4.8, -0.5]].forEach(([a, b2, z], k) => { for (let i = 0; i < 18; i++) { const t = i / 17; bulbs.push({ x: a + (b2 - a) * t, y: 3.3 - Math.sin(t * PI) * 0.4 - k * 0.2, z }); } });
    g.add(H.instanced(new THREE.SphereGeometry(0.05, 8, 6), bulbM, bulbs, { cast: false }));
    [[-4.8, -4.6], [4.8, -4.6], [-4.8, -0.5], [4.8, -0.5]].forEach(([x, z]) => g.add(H.at(H.cyl(0.04, 0.04, 3.4, '#d4af37', { seg: 6 }), x, 1.7, z)));
    H.onUpdate((dt, t) => balloons.forEach((b, i) => { b.position.y += Math.sin(t * 1.4 + i) * 0.0015; }));
    H.nightLight(g, [0, 2.8, -2.5], '#ffd9a8', 1.5, 10);
    decorAt(H, g, opts, 2.0, 2.8);
    return { group: g, playerSpot: { pos: [0, 0, 0.6], rotY: 0 }, npcSpots: [{ pos: [-1.2, 0, 0.7], rotY: 0.7 }, { pos: [1.3, 0, 0.9], rotY: -0.6 }, { pos: [-1.6, 0, -1.0], rotY: 0.5 }, { pos: [1.6, 0, -1.0], rotY: -0.5 }] };
  });
})();
