/* Một Kiếp Người — cõi sau khi chết: Thiên đàng (nhiều đức) · Địa ngục (ít đức). Dùng ở màn hình phán xét cuối đời. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  if (!KN.Env || !window.THREE) return;
  const PI = Math.PI;
  const SPOTS = [{ pos: [-1.6, 0, 1.0], rotY: 0.6 }, { pos: [1.6, 0, 1.0], rotY: -0.6 }, { pos: [-2.7, 0, 0.1], rotY: 0.8 }, { pos: [2.7, 0, 0.1], rotY: -0.8 }];

  // 1. THIÊN ĐÀNG — sàn mây trắng, cổng vàng, cầu thang ánh sáng, thiên thần, hoa sen nở --------------------------------
  KN.Env.register('heaven', { name: 'Thiên đàng', indoor: false, sky: ['#ffe9b8', '#fffaf0'] }, function (H) {
    const g = H.group(), r = H.rng(77);
    g.add(H.slab(10, 10, { top: '#fbf7ee', side: '#e8e1d2', under: '#d9d2c4', edge: false }));
    // mây bồng bềnh quanh mép
    const clouds = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * PI * 2, d = 4.4 + r() * 0.6;
      const c = H.sphere(0.6 + r() * 0.5, '#ffffff', { seg: 10, squash: [1.4, 0.6, 1] });
      c.position.set(Math.cos(a) * d, 0.1 + r() * 0.3, Math.sin(a) * d); g.add(c); clouds.push(c);
    }
    H.onUpdate((dt, t) => clouds.forEach((c, i) => (c.position.y = 0.15 + Math.sin(t * 0.6 + i) * 0.12)));
    // cầu thang ánh sáng dẫn lên cổng
    const gold = H.glow('#ffd36b', { intensity: 1.4 });
    for (let i = 0; i < 6; i++) g.add(H.at(H.box(2.4 - i * 0.12, 0.14, 0.5, '#fff6dc'), 0, 0.07 + i * 0.14, -0.6 - i * 0.5));
    // cổng vàng hình vòm
    const gate = H.group();
    [-1.4, 1.4].forEach((x) => gate.add(H.at(H.cyl(0.16, 0.2, 3.2, '#f2c94c', { seg: 14 }), x, 1.6, 0)));
    const arch = H.torus(1.4, 0.13, '#f2c94c', { arc: PI }); arch.position.y = 3.2; gate.add(arch);
    gate.add(H.at(H.sphere(0.28, gold), 0, 4.75, 0));
    gate.add(H.at(H.sign('THIÊN ĐÀNG', 2.0, 0.42, { bg: '#fff3cf', fg: '#b8860b', font: '800 60px "Be Vietnam Pro", sans-serif', glow: true }), 0, 2.75, 0.1));
    gate.position.set(0, 0.84, -3.6); g.add(gate);
    // vầng hào quang sau cổng
    const halo = H.torus(2.3, 0.05, gold, { cast: false }); halo.position.set(0, 4.0, -4.2); g.add(halo);
    H.onUpdate((dt, t) => { halo.rotation.z = t * 0.2; halo.scale.setScalar(1 + Math.sin(t * 1.3) * 0.04); });
    // thiên thần (tượng trắng có cánh + vòng sáng trên đầu)
    function angel(x, z, ry) {
      const a = H.group();
      a.add(H.at(H.cone(0.38, 1.1, '#ffffff', { seg: 14 }), 0, 0.55, 0));
      a.add(H.at(H.sphere(0.2, '#ffe8d2', { seg: 12 }), 0, 1.25, 0));
      a.add(H.at(H.torus(0.17, 0.025, gold, { cast: false }), 0, 1.55, 0));
      a.children[a.children.length - 1].rotation.x = PI / 2;
      [-1, 1].forEach((s) => { const w = H.sphere(0.42, '#fdfdfd', { seg: 10, squash: [0.25, 1, 0.7] }); w.position.set(s * 0.32, 0.95, -0.12); w.rotation.z = s * 0.5; a.add(w); });
      a.position.set(x, 0, z); a.rotation.y = ry; g.add(a);
      H.onUpdate((dt, t) => (a.position.y = 0.25 + Math.sin(t * 1.4 + x) * 0.12));
    }
    angel(-3.0, -2.2, 0.5); angel(3.0, -2.2, -0.5); angel(-3.6, 0.8, 0.9);
    // hoa sen nở trên mặt nước sáng
    g.add(H.at(H.cyl(1.0, 1.0, 0.04, H.mat('#bfe8ff', { rough: 0.2, metal: 0.1 }), { seg: 24, cast: false }), 3.1, 0.02, 1.4));
    [[2.8, 1.2], [3.4, 1.6], [3.1, 1.0]].forEach(([x, z]) => { const lo = H.group(); for (let i = 0; i < 6; i++) { const p = H.sphere(0.12, '#ffb6c9', { seg: 8, squash: [0.6, 1, 0.4] }); p.position.set(Math.cos(i) * 0.1, 0.1, Math.sin(i) * 0.1); p.rotation.z = 0.5; lo.add(p); } lo.add(H.at(H.sphere(0.06, '#ffe066', { seg: 8 }), 0, 0.14, 0)); lo.position.set(x, 0.04, z); g.add(lo); });
    // cánh hoa vàng rơi nhẹ
    const motes = [];
    for (let i = 0; i < 24; i++) { const m = H.sphere(0.035, gold, { seg: 6, cast: false }); g.add(m); motes.push(m); }
    H.onUpdate((dt, t) => motes.forEach((m, i) => { const k = (t * 0.06 + i / 24) % 1; m.position.set(-4 + ((i * 41) % 80) / 10 + Math.sin(t + i) * 0.3, 4.5 - k * 4.4, -3.5 + ((i * 29) % 70) / 10); }));
    H.nightLight(g, [0, 3.5, -2.5], '#ffe7a3', 1.6, 10);
    return { group: g, npcSpots: SPOTS, anchors: {}, playerSpot: { pos: [0, 0, 1.4], rotY: 0 } };
  });

  // 2. ĐỊA NGỤC — nền đá nứt, sông dung nham, vạc dầu sôi, quỷ sứ đầu trâu mặt ngựa, cầu Nại Hà ---------------------
  KN.Env.register('hell', { name: 'Địa ngục', indoor: false, sky: ['#2a0905', '#5c1408'] }, function (H) {
    const g = H.group(), r = H.rng(66);
    g.add(H.slab(10, 10, { top: '#3a2a26', side: '#1f1412', under: '#120b0a' }));
    // vết nứt dung nham
    const lava = H.glow('#ff5a1f', { intensity: 2.2 });
    for (let i = 0; i < 9; i++) { const c = H.box(0.08 + r() * 0.06, 0.02, 1.2 + r() * 1.6, lava, { cast: false }); c.position.set(-4 + r() * 8, 0.01, -4 + r() * 8); c.rotation.y = r() * PI; g.add(c); }
    // sông dung nham phía sau + cầu Nại Hà
    const river = H.box(10, 0.06, 1.4, lava, { cast: false }); river.position.set(0, 0.02, -3.2); g.add(river);
    const bridge = H.group(H.at(H.box(1.4, 0.12, 2.0, '#4a3a33'), 0, 0.3, 0));
    [-0.66, 0.66].forEach((x) => bridge.add(H.at(H.box(0.06, 0.4, 2.0, '#2b201c'), x, 0.55, 0)));
    bridge.position.set(-1.6, 0, -3.2); g.add(bridge);
    // cổng âm phủ
    const gate = H.group();
    [-1.3, 1.3].forEach((x) => gate.add(H.at(H.box(0.5, 3.0, 0.5, '#241816'), x, 1.5, 0)));
    gate.add(H.at(H.box(3.4, 0.5, 0.7, '#1b1110'), 0, 3.1, 0));
    gate.add(H.at(H.sign('ĐỊA NGỤC', 1.8, 0.4, { bg: '#1b0b08', fg: '#ff6a3d', font: '800 60px "Be Vietnam Pro", sans-serif', glow: true }), 0, 3.1, 0.36));
    [-1.3, 1.3].forEach((x) => { const f = H.cone(0.18, 0.4, H.glow('#ff8a2b', { intensity: 2 }), { seg: 8, cast: false }); f.position.set(x, 3.25, 0); gate.add(f); });
    gate.position.set(1.4, 0, -4.2); g.add(gate);
    // vạc dầu sôi
    const pot = H.group(H.at(H.cyl(0.9, 0.7, 0.9, '#1c1c1c', { seg: 20 }), 0, 0.6, 0), H.at(H.cyl(0.82, 0.82, 0.04, H.glow('#ffb02e', { intensity: 1.8 }), { seg: 20, cast: false }), 0, 1.04, 0));
    [0, 2.1, 4.2].forEach((a) => pot.add(H.at(H.cyl(0.07, 0.07, 0.4, '#111', { seg: 6 }), Math.cos(a) * 0.6, 0.15, Math.sin(a) * 0.6)));
    pot.position.set(3.0, 0, 0.8); g.add(pot);
    const bubbles = [];
    for (let i = 0; i < 6; i++) { const b = H.sphere(0.08, '#ffcf6b', { seg: 6, cast: false }); pot.add(b); bubbles.push(b); }
    H.onUpdate((dt, t) => bubbles.forEach((b, i) => { const k = (t * 0.8 + i / 6) % 1; b.position.set(Math.cos(i * 1.7) * 0.4, 1.05 + k * 0.5, Math.sin(i * 1.7) * 0.4); b.scale.setScalar(1 - k); }));
    // quỷ sứ đầu trâu mặt ngựa (tượng có sừng, cầm đinh ba)
    function demon(x, z, ry, col) {
      const d = H.group();
      d.add(H.at(H.cyl(0.3, 0.38, 1.1, col, { seg: 12 }), 0, 0.55, 0));
      d.add(H.at(H.sphere(0.26, col, { seg: 12 }), 0, 1.3, 0));
      [-1, 1].forEach((s) => { const h = H.cone(0.06, 0.3, '#e8dcc0', { seg: 8 }); h.position.set(s * 0.17, 1.55, 0); h.rotation.z = -s * 0.5; d.add(h); });
      [-1, 1].forEach((s) => d.add(H.at(H.sphere(0.04, H.glow('#ffea00', { intensity: 2 }), { seg: 6, cast: false }), s * 0.09, 1.34, 0.22)));
      const fork = H.group(H.at(H.cyl(0.03, 0.03, 2.0, '#555', { seg: 6 }), 0, 1.0, 0));
      [-0.12, 0, 0.12].forEach((fx) => fork.add(H.at(H.cone(0.035, 0.22, '#777', { seg: 6 }), fx, 2.08, 0)));
      fork.position.set(0.42, 0, 0.1); d.add(fork);
      d.position.set(x, 0, z); d.rotation.y = ry; g.add(d);
    }
    demon(-3.2, -1.6, 0.6, '#7a1f17'); demon(-2.4, 1.8, 0.9, '#3e3a6b');
    // khói & tàn lửa bay lên
    const embers = [];
    for (let i = 0; i < 26; i++) { const e = H.sphere(0.03, H.glow('#ff7a2b', { intensity: 2 }), { seg: 5, cast: false }); g.add(e); embers.push(e); }
    H.onUpdate((dt, t) => embers.forEach((e, i) => { const k = (t * 0.12 + i / 26) % 1; e.position.set(-4.5 + ((i * 37) % 90) / 10 + Math.sin(t * 2 + i) * 0.2, k * 4.5, -4 + ((i * 23) % 80) / 10); }));
    H.nightLight(g, [0, 1.5, -3.0], '#ff4a12', 2.2, 9);
    H.nightLight(g, [3.0, 1.6, 0.8], '#ffa040', 1.4, 5);
    return { group: g, npcSpots: SPOTS, anchors: {}, playerSpot: { pos: [0, 0, 1.4], rotY: 0 } };
  });
})();
