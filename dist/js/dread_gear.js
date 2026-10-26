/* Một Kiếp Người — nhân vật 3D và trang phục cho Hầm ngục Dreadfall.
   Nhân vật: mô hình GLB gốc (đầu to, thân tròn) nhưng đổi sang đổ bóng mịn + chất liệu theo bộ phận (da, tóc, vải, da thuộc), thêm tai, lông mày, ánh mắt.
   Trang phục: dựng bằng nhiều khối có chủ đích, đặt theo đúng tọa độ các bộ phận của mô hình (đầu, vai, ngực, cổ tay, bàn chân), chia 5 phong cách:
   Adventurer (da + vải), Knight (giáp thép nhiều lớp), Arcane (áo choàng huyền bí), Royal (điểm nhấn vàng cho đồ Huyền thoại), Abyssal (tối, gai, lõi phát sáng).
   Mọi tọa độ dưới đây ở hệ tọa độ của mô hình gốc (cao ≈ 3,05; đầu tâm (0, 2,57, 0); vai x ±0,6; bàn tay x ±0,575, y 1,08; bàn chân x ±0,225). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const PI = Math.PI;
  // phong cách theo loại đồ gốc; độ hiếm Huyền thoại trở lên được phủ thêm vàng (Royal)
  const STYLE = { cap: 'adv', leather: 'adv', sandal: 'adv', buckler: 'adv', ember: 'adv', helm: 'knight', rust: 'knight', boots: 'knight', tower: 'knight', soul: 'arcane', tome: 'arcane', hollow: 'abyss', greaves: 'abyss', horn: 'abyss', ash: 'abyss' };
  const PAL = {
    adv: { main: 0x7b5434, alt: 0xb99b6c, trim: 0xc9a14a, metal: 0x8d8f96 },
    knight: { main: 0xaab4c4, alt: 0x3b5aa0, trim: 0x77839a, metal: 0xc7ced9 },
    arcane: { main: 0x5d3c8f, alt: 0x2e2252, trim: 0xd1a93f, metal: 0xa9b3d1 },
    abyss: { main: 0x2a2433, alt: 0x15111c, trim: 0x5a3b88, metal: 0x3d3748 },
    royal: { main: 0xd9a441, alt: 0x8f2330, trim: 0xf2d27a, metal: 0xe2b858 },
  };
  const GLOW = { adv: 0xffb04a, knight: 0x9fd0ff, arcane: 0x8fd6ff, abyss: 0xb06bff, royal: 0xffe39a };
  const styleOf = (it) => STYLE[it.base] || 'adv';
  // phân loại bộ phận của nhân vật để gán chất liệu
  const partClass = (n) => (/^(head|neck|hand_|forearm_|upper_arm_)/.test(n) ? 'skin' : /^hair_/.test(n) ? 'hair' : /^(eye_|nose|mouth)/.test(n) ? 'face' : /^(boot|leather_belt)/.test(n) ? 'leather' : /^belt_buckle/.test(n) ? 'metal' : 'cloth');
  const CLASSES = ['skin', 'hair', 'face', 'cloth', 'leather', 'metal'];

  function kit(S) {
    if (S._gk) return S._gk; const T = S.T, cache = {};
    const std = (key, o) => cache[key] || (cache[key] = new T.MeshStandardMaterial(Object.assign({ envMapIntensity: 0.7 }, o)));
    const k = {
      cache,
      metal: (c) => std('m' + c, { color: c, metalness: 0.62, roughness: 0.42, envMapIntensity: 1.25 }),
      gold: (c) => std('g' + (c || 0), { color: c || 0xe0b04a, metalness: 0.75, roughness: 0.34, envMapIntensity: 1.2 }),
      leather: (c) => std('l' + c, { color: c, metalness: 0.05, roughness: 0.55 }),
      cloth: (c) => std('c' + c, { color: c, metalness: 0, roughness: 0.92, envMapIntensity: 0.35 }),
      wood: (c) => std('w' + c, { color: c, metalness: 0, roughness: 0.75, envMapIntensity: 0.4 }),
      dark: (c) => std('d' + c, { color: c, metalness: 0.4, roughness: 0.5, envMapIntensity: 1.1 }),
      glow: (c) => cache['e' + c] || (cache['e' + c] = new T.MeshBasicMaterial({ color: c })),
      body: null, shadowTex: null,
    };
    // chất liệu thân: da mềm, tóc, mặt, vải, da thuộc, kim loại; dùng màu đỉnh có sẵn trong mô hình
    const base = (o) => new T.MeshStandardMaterial(Object.assign({ vertexColors: true, flatShading: false, envMapIntensity: 0.5 }, o));
    k.body = [base({ roughness: 0.62, metalness: 0 }), base({ roughness: 0.5, metalness: 0.05 }), base({ roughness: 0.3, metalness: 0 }), base({ roughness: 0.92, metalness: 0, envMapIntensity: 0.3 }), base({ roughness: 0.5, metalness: 0.08 }), base({ roughness: 0.32, metalness: 0.85, envMapIntensity: 1 })];
    S._gk = k; return k;
  }

  // nhân vật: hình học tách theo chất liệu (index sắp xếp lại theo nhóm), nhìn về +z, chân ở y=0
  async function spawnHero(S, h) {
    const T = S.T, g = await KN.DreadUI.geo('character_hollow_knight'), k = kit(S);
    if (!g.userData.heroGeo) {
      const parts = g.userData.parts || [], src = g.index.array, ib = [], groups = [];
      CLASSES.forEach((c, mi) => { const st = ib.length; parts.filter((p) => partClass(p.name) === c).forEach((p) => { for (let i = 0; i < p.count; i++) ib.push(src[p.start + i]); }); if (ib.length > st) groups.push([st, ib.length - st, mi]); });
      const bg = new T.BufferGeometry(); ['color', 'normal'].forEach((a) => bg.setAttribute(a, g.attributes[a]));
      // nâng mái tóc mái lên khỏi mắt (bản gốc che kín mắt như đeo kính đen)
      const pa = new Float32Array(g.attributes.position.array); parts.forEach((p) => { if (/^hair_fringe/.test(p.name)) for (let v = p.v0; v < p.v1; v++) pa[v * 3 + 1] += 0.14; }); bg.setAttribute('position', new T.BufferAttribute(pa, 3)); bg.setIndex(new T.BufferAttribute(new Uint32Array(ib), 1)); groups.forEach((x) => bg.addGroup(x[0], x[1], x[2])); bg.computeBoundingBox();
      const avg = {}; parts.forEach((p) => { avg[p.name] = p.avg; }); bg.userData.avg = avg; g.userData.heroGeo = bg;
    }
    const bg = g.userData.heroGeo, bb = bg.boundingBox, s = h / (bb.max.y - bb.min.y), grp = new T.Group(), mesh = new T.Mesh(bg, k.body);
    const off = new T.Vector3(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -(bb.max.z + bb.min.z) / 2); mesh.position.copy(off); grp.add(mesh); grp.scale.setScalar(s); S.scene.add(grp);
    const ent = { grp, mesh, mat: null, scale: s, off, gear: [], extra: [], hand: new T.Vector3(0.575 + off.x, 1.1 + off.y, 0.1 + off.z), remove() { S.scene.remove(grp); this.gear.concat(this.extra).forEach((m) => m.traverse((o) => { if (o.geometry) o.geometry.dispose(); })); } };
    // chi tiết thêm cho nhân vật: tai, lông mày, ánh mắt, bóng dưới chân
    const avg = bg.userData.avg, rgb = (a, m) => new T.Color(a[0] * (m || 1), a[1] * (m || 1), a[2] * (m || 1)), sk = avg.head || [0.9, 0.7, 0.55], hr = avg.hair_cap || [0.1, 0.07, 0.06];
    const put = (m, x, y, z, list) => { m.position.set(x + off.x, y + off.y, z + off.z); grp.add(m); (list || ent.extra).push(m); return m; };
    const skinM = new T.MeshStandardMaterial({ color: rgb(sk), roughness: 0.62, metalness: 0 }), hairM = new T.MeshStandardMaterial({ color: rgb(hr), roughness: 0.5 }), whiteM = new T.MeshBasicMaterial({ color: 0xffffff });
    [-1, 1].forEach((sg) => {
      const ear = put(new T.Mesh(new T.SphereGeometry(0.085, 12, 10), skinM), sg * 0.405, 2.52, -0.02); ear.scale.set(0.55, 1, 0.8);
      const brow = put(new T.Mesh(new T.BoxGeometry(0.12, 0.028, 0.03), hairM), sg * 0.13, 2.665, 0.365); brow.rotation.z = sg * -0.12;
      put(new T.Mesh(new T.SphereGeometry(0.014, 6, 6), whiteM), sg * 0.145, 2.585, 0.383);
    });
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    if (!k.shadowTex) k.shadowTex = new T.CanvasTexture(c);
    const sh = new T.Mesh(new T.PlaneGeometry(1.9, 1.5), new T.MeshBasicMaterial({ map: k.shadowTex, transparent: true, depthWrite: false })); sh.rotation.x = -PI / 2; put(sh, 0, 0.02, 0.05);
    return ent;
  }

  // ---------------------------------------------------------------- trang phục
  function dress(ent, eq, S) {
    if (!ent) return; const T = S.T, k = kit(S), off = ent.off;
    ent.gear.forEach((m) => { ent.grp.remove(m); m.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }); ent.gear = [];
    const add = (m, x, y, z, rx, ry, rz) => { m.position.set(x + off.x, y + off.y, z + off.z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); ent.grp.add(m); ent.gear.push(m); return m; };
    const mesh = (geo, mat) => new T.Mesh(geo, mat);
    const sph = (r, mat, sx, sy, sz, ws, hs) => { const m = mesh(new T.SphereGeometry(r, ws || 18, hs || 12), mat); m.scale.set(sx || 1, sy || 1, sz || 1); return m; };
    const box = (w, h, d, mat) => mesh(new T.BoxGeometry(w, h, d), mat);
    const tor = (R, r, mat, seg) => mesh(new T.TorusGeometry(R, r, 8, seg || 28), mat);
    const cone = (r, h, mat, seg) => mesh(new T.ConeGeometry(r, h, seg || 10), mat);
    const cyl = (rt, rb, h, mat, seg) => mesh(new T.CylinderGeometry(rt, rb, h, seg || 20), mat);
    const rc = (it) => new T.Color(KN.DreadCore.RARITY[it.rar].color);
    const gem = (it, r, st) => new T.MeshBasicMaterial({ color: it.rar >= 2 ? rc(it) : GLOW[st] });
    const isRoyal = (it) => it.rar >= 4;
    const E = eq || {};
    // ---- mũ
    if (E.helmet) {
      const it = E.helmet, st = styleOf(it), P = PAL[st], roy = isRoyal(it), mat = st === 'adv' ? k.leather(P.main) : st === 'abyss' ? k.dark(P.main) : st === 'arcane' ? k.cloth(P.main) : k.metal(P.main), trim = roy ? k.gold(PAL.royal.trim) : st === 'adv' ? k.leather(0x4d3320) : k.metal(P.trim);
      const dome = add(mesh(new T.SphereGeometry(0.5, 28, 16, 0, PI * 2, 0, PI * 0.47), mat), 0, 2.6, -0.02); dome.scale.set(1.0, 1.08, 1.08);
      add(tor(0.5, 0.034, trim, 36), 0, 2.648, -0.02, PI / 2, 0, 0).scale.set(1, 1.06, 1);
      if (st === 'adv') { add(box(0.52, 0.035, 0.24, mat), 0, 2.67, 0.5, -0.22, 0, 0); add(cone(0.05, 0.34, k.cloth(P.alt), 8), 0.36, 2.9, -0.05, 0.3, 0, -0.8); }
      if (st === 'knight') { add(box(0.06, 0.07, 0.66, k.metal(P.trim)), 0, 3.14, -0.02, -0.05, 0, 0); [-1, 1].forEach((sg) => { add(box(0.04, 0.26, 0.26, mat), sg * 0.45, 2.45, 0.0); add(sph(0.022, trim), sg * 0.47, 2.52, 0.1); }); }
      if (st === 'arcane') { add(cone(0.34, 0.55, mat, 14), 0, 3.28, -0.1, -0.35, 0, 0); add(tor(0.43, 0.03, k.gold(PAL.arcane.trim), 28), 0, 2.74, -0.02, PI / 2, 0, 0); add(sph(0.045, new T.MeshBasicMaterial({ color: GLOW.arcane })), 0, 2.74, 0.43); }
      if (st === 'abyss') { [-1, 1].forEach((sg) => { add(cone(0.085, 0.55, k.dark(0x1c1724), 10), sg * 0.4, 2.98, -0.03, 0, 0, -sg * 0.75); add(sph(0.03, new T.MeshBasicMaterial({ color: GLOW.abyss })), sg * 0.13, 2.69, 0.5); }); add(box(0.62, 0.05, 0.07, trim), 0, 2.66, 0.49); }
      if (roy) { add(tor(0.5, 0.045, k.gold(PAL.royal.trim), 36), 0, 2.648, -0.02, PI / 2, 0, 0); for (let i = 0; i < 5; i++) { const a = -0.8 + i * 0.4; add(cone(0.05, 0.17, k.gold(PAL.royal.trim), 6), Math.sin(a) * 0.5, 2.74, Math.cos(a) * 0.5 - 0.02); }
        add(sph(0.05, gem(it, 0, st)), 0, 2.75, 0.5); }
    }
    // ---- giáp ngực + vai + cổ
    if (E.armor) {
      const it = E.armor, st = styleOf(it), P = PAL[st], roy = isRoyal(it), mat = st === 'adv' ? k.leather(P.main) : st === 'abyss' ? k.dark(P.main) : st === 'arcane' ? k.cloth(P.main) : k.metal(P.main), alt = st === 'knight' ? k.cloth(P.alt) : st === 'arcane' ? k.cloth(P.alt) : k.leather(0x4d3320), trim = roy ? k.gold(PAL.royal.trim) : st === 'adv' ? k.gold(P.trim) : st === 'arcane' ? k.gold(P.trim) : k.metal(P.trim);
      const shell = add(mesh(new T.SphereGeometry(1, 30, 18, 0, PI * 2, PI * 0.15, PI * 0.71), mat), 0, 1.72, 0); shell.scale.set(0.505, 0.565, 0.35);
      add(tor(0.215, 0.05, trim, 24), 0, 2.2, 0, PI / 2, 0, 0).scale.set(1, 1, 1);
      if (st === 'adv') { [-1, 1].forEach((sg) => { const s = add(box(0.07, 0.95, 0.03, alt), sg * 0.18, 1.74, 0.345, 0, 0, sg * -0.42); s.userData.keep = 1; }); add(box(0.12, 0.12, 0.05, trim), 0, 1.74, 0.36); add(sph(0.2, mat, 1, 0.75, 1, 14, 10), -0.55, 2.1, 0); add(tor(0.19, 0.025, alt, 20), -0.55, 1.98, 0, PI / 2, 0, 0); }
      if (st === 'knight') { add(box(0.05, 0.85, 0.035, trim), 0, 1.72, 0.352); add(tor(0.46, 0.03, trim, 32), 0, 1.38, 0, PI / 2, 0, 0).scale.set(1, 0.72, 1); [-1, 1].forEach((sg) => { add(sph(0.27, mat, 1, 0.68, 1, 18, 10), sg * 0.56, 2.1, 0); add(tor(0.23, 0.028, trim, 24), sg * 0.58, 1.99, 0, PI / 2, 0, sg * 0.12); [-1, 1].forEach((z) => add(sph(0.025, trim), sg * 0.57, 2.18, z * 0.16)); }); for (let i = -1; i <= 1; i += 2) add(sph(0.028, trim), i * 0.2, 1.98, 0.335); }
      if (st === 'arcane') { const sk = add(cyl(0.44, 0.58, 0.5, mat, 28), 0, 1.22, 0); sk.scale.set(1, 1, 0.75); add(tor(0.58, 0.03, trim, 32), 0, 0.98, 0, PI / 2, 0, 0).scale.set(1, 0.75, 1); [-1, 1].forEach((sg) => { add(sph(0.26, mat, 1, 0.7, 1, 16, 10), sg * 0.55, 2.06, 0); add(tor(0.22, 0.025, trim, 20), sg * 0.56, 1.96, 0, PI / 2, 0, 0); }); add(mesh(new T.OctahedronGeometry(0.075), new T.MeshBasicMaterial({ color: GLOW.arcane })), 0, 1.86, 0.37); add(tor(0.1, 0.018, trim, 18), 0, 1.86, 0.355); }
      if (st === 'abyss') { [-1, 1].forEach((sg) => { add(sph(0.27, mat, 1, 0.7, 1, 16, 10), sg * 0.56, 2.1, 0); add(cone(0.1, 0.46, k.dark(0x1c1724), 8), sg * 0.62, 2.34, 0, 0, 0, -sg * 0.5); add(cone(0.07, 0.3, k.dark(0x1c1724), 8), sg * 0.7, 2.18, -0.1, 0, 0, -sg * 1.0); }); add(mesh(new T.IcosahedronGeometry(0.085, 0), new T.MeshBasicMaterial({ color: GLOW.abyss })), 0, 1.8, 0.36); add(box(0.5, 0.04, 0.04, trim), 0, 1.55, 0.345); add(box(0.4, 0.04, 0.04, trim), 0, 1.4, 0.335); }
      if (roy) { add(tor(0.46, 0.03, k.gold(PAL.royal.trim), 32), 0, 1.38, 0, PI / 2, 0, 0).scale.set(1, 0.72, 1); add(sph(0.065, gem(it, 0, st)), 0, 1.98, 0.355); if (st === 'adv') add(cyl(0.11, 0.11, 0.03, k.gold(PAL.royal.trim), 20), 0, 1.74, 0.36, PI / 2, 0, 0); }
    }
    // ---- giày + ống chân
    if (E.boots) {
      const it = E.boots, st = styleOf(it), P = PAL[st], roy = isRoyal(it), mat = st === 'adv' ? k.leather(P.main) : st === 'abyss' ? k.dark(P.main) : st === 'arcane' ? k.cloth(P.main) : k.metal(P.main), trim = roy ? k.gold(PAL.royal.trim) : st === 'adv' ? k.leather(0x4d3320) : st === 'arcane' ? k.gold(P.trim) : k.metal(P.trim);
      [-1, 1].forEach((sg) => {
        const cx = sg * 0.225; add(cyl(0.185, 0.2, 0.3, mat, 22), cx, 0.38, 0); add(tor(0.19, 0.03, trim, 22), cx, 0.54, 0, PI / 2, 0, 0); add(sph(0.2, mat, 1, 0.62, 1.55, 18, 10), cx, 0.12, 0.2); add(tor(0.17, 0.02, trim, 20), cx, 0.2, 0.06, PI / 2, 0, 0);
        if (st === 'knight') { add(cyl(0.165, 0.18, 0.28, mat, 20), cx, 0.66, 0); add(sph(0.19, mat, 1, 0.8, 0.9, 16, 10), cx, 0.72, 0.1); add(sph(0.025, trim), cx, 0.72, 0.27); }
        if (st === 'adv') { add(tor(0.195, 0.022, k.cloth(P.alt), 20), cx, 0.32, 0, PI / 2, 0, 0); add(tor(0.195, 0.022, k.cloth(P.alt), 20), cx, 0.4, 0, PI / 2, 0, 0); }
        if (st === 'arcane') { add(cone(0.07, 0.24, mat, 8), cx, 0.15, 0.46, PI / 2 - 0.5, 0, 0); }
        if (st === 'abyss') { add(cone(0.06, 0.26, k.dark(0x1c1724), 8), cx, 0.54, 0.16, PI / 2, 0, 0); add(box(0.04, 0.2, 0.02, new T.MeshBasicMaterial({ color: GLOW.abyss })), cx, 0.4, 0.2); }
        if (roy) add(sph(0.04, gem(it, 0, st)), cx, 0.55, 0.19);
      });
    }
    // ---- tay phụ (tay -x): khiên gắn lên cẳng tay, sách cầm trong tay
    if (E.offhand) {
      const it = E.offhand, st = styleOf(it), P = PAL[st], roy = isRoyal(it);
      if (it.base === 'tome') {
        const cover = k.cloth(0x5a3a92), gold = roy ? k.gold(PAL.royal.trim) : k.gold(PAL.arcane.trim);
        const at = (o, x, y, z) => { o.position.set(x, y, z); return o; }, b = add(box(0.3, 0.4, 0.08, cover), -0.56, 1.28, 0.3, -0.35, 0.5, 0.15);
        b.add(at(box(0.27, 0.37, 0.02, k.cloth(0xe8dfc4)), 0, 0, -0.045));
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) => b.add(at(box(0.06, 0.06, 0.092, gold), a * 0.13, c * 0.18, 0)));
        b.add(at(mesh(new T.OctahedronGeometry(0.06), new T.MeshBasicMaterial({ color: it.rar >= 2 ? rc(it) : GLOW.arcane })), 0, 0, 0.06));
      } else {
        const big = it.base === 'tower', mat = st === 'adv' ? k.wood(0x8a6238) : k.metal(P.main), rim = roy ? k.gold(PAL.royal.trim) : st === 'adv' ? k.metal(0x75777d) : k.metal(P.trim), cx = -0.76;
        if (big) {
          const sh = new T.Shape(); sh.moveTo(-0.27, 0.34); sh.lineTo(0.27, 0.34); sh.lineTo(0.27, -0.04); sh.quadraticCurveTo(0.27, -0.4, 0, -0.5); sh.quadraticCurveTo(-0.27, -0.4, -0.27, -0.04); sh.closePath();
          const m = mesh(new T.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 10 }), mat); add(m, cx, 1.4, 0.0, 0, -PI / 2 + 0.28, 0);
          add(box(0.06, 0.62, 0.02, rim), cx - 0.045, 1.4, 0.04); add(box(0.4, 0.06, 0.02, rim), cx - 0.045, 1.5, 0.04); add(sph(0.06, rim, 0.6, 1, 1), cx - 0.07, 1.4, 0.04);
        } else {
          add(cyl(0.34, 0.34, 0.07, mat, 32), cx, 1.38, 0.04, 0, 0, PI / 2); add(tor(0.34, 0.04, rim, 32), cx - 0.04, 1.38, 0.04, 0, PI / 2, 0); add(sph(0.11, rim, 0.55, 1, 1, 16, 10), cx - 0.06, 1.38, 0.04);
          if (st === 'adv') for (let i = 0; i < 8; i++) { const a = i * PI / 4; add(sph(0.022, rim), cx - 0.045, 1.38 + Math.sin(a) * 0.27, 0.04 + Math.cos(a) * 0.27); }
        }
        if (roy) add(sph(0.045, gem(it, 0, st)), cx - 0.1, 1.38, 0.04);
      }
    }
    // ---- phụ kiện: vòng tay ở cổ tay (ring: tay -x, ring2: tay +x)
    [['ring', -1], ['ring2', 1]].forEach(([slot, sg]) => {
      const it = E[slot]; if (!it) return; const st = styleOf(it), roy = isRoyal(it), band = roy ? k.gold(PAL.royal.trim) : st === 'adv' ? k.gold(0xb9722e) : st === 'arcane' ? k.metal(0xcfd6e8) : k.dark(0x3d3748), x = sg * 0.565;
      add(tor(0.125, 0.032, band, 22), x, 1.22, 0.03, PI / 2, 0, 0); add(sph(0.036, new T.MeshBasicMaterial({ color: it.rar >= 2 ? rc(it) : GLOW[st] })), x + sg * 0.1, 1.22, 0.07);
      if (st === 'abyss') add(cone(0.035, 0.12, k.dark(0x1c1724), 6), x + sg * 0.14, 1.22, 0.02, 0, 0, -sg * PI / 2);
    });
  }
  KN.DreadGear = { spawnHero, dress, kit, PAL, styleOf };
})();
