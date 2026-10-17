/* Một Kiếp Người — environment registry + diorama helper kit.
 *
 * Location files register themselves:
 *
 *   KN.Env.register('cafe', { name: 'Quán cà phê', indoor: true, sky: ['#ffd9a8', '#fff3e0'] },
 *     function build(H, opts) {
 *       const g = H.group();
 *       g.add(H.slab(10, 10, { top: '#c9a27c' }));            // floating diorama base, top at y = 0
 *       g.add(H.room({ w: 10, d: 10, h: 3.2, floor: '#b98a5e', wall: '#f1e3c6' }));
 *       g.add(H.at(H.box(1.2, 0.75, 0.8, '#7a4b2a'), 2.5, 0.375, -1));  // a table (center pivot)
 *       const lampMat = H.glow('#ffd27a');                    // material that lights up at dusk/night
 *       g.add(H.at(H.sphere(0.12, lampMat), 0, 2.6, -3));
 *       H.nightLight(g, [0, 2.4, -2.5], '#ffcc88', 1.2, 7);  // point light visible only at dusk/night
 *       H.onUpdate((dt, t) => { fan.rotation.y += dt * 8; });
 *       if (opts.decor === 'tet') g.add(H.at(H.decor.tet(), -3.5, 0, -3.5));
 *       return { group: g, playerSpot: { pos: [0, 0, 0.8], rotY: 0 } };
 *     });
 *
 * Build functions receive a per-build helper kit `H` (below) and `opts` ({ decor }).
 * Everything returned is wrapped into an EnvInstance by KN.Env.build(id, opts).
 *
 * Helper kit H  (all meshes castShadow + receiveShadow by default; pass {cast:false} etc. to change)
 *   H.mat(color, o?)            cached MeshStandardMaterial. o: { rough, metal, flat, opacity, emissive,
 *                               emissiveIntensity, double, map, unique }  (unique:true → not cached)
 *   H.glow(color, o?)           unique emissive material registered as a "night glow" (dim by day, bright at night)
 *   H.box(w,h,d, colorOrMat, o?)       Mesh, center pivot
 *   H.rbox(w,h,d, r, colorOrMat, o?)   rounded box (r = corner radius), center pivot
 *   H.cyl(rTop, rBot, h, colorOrMat, o?)  (o.seg radial segments, default 18)
 *   H.sphere(r, colorOrMat, o?)  (o.seg, o.squash: [sx,sy,sz])
 *   H.cone(r, h, colorOrMat, o?)
 *   H.torus(r, tube, colorOrMat, o?)  (o.arc)
 *   H.plane(w, h, colorOrMat, o?)      vertical plane facing +Z
 *   H.ground(w, d, colorOrMat, o?)     horizontal plane at y = 0.002 (decals, rugs, roads)
 *   H.mesh(geometry, colorOrMat, o?)
 *   H.at(obj, x, y, z, ry = 0, s = 1)  set position / rotation.y / uniform scale, returns obj
 *   H.group(...children)
 *   H.textTexture(text, o?)     CanvasTexture. o: { w=512, h=128, bg='#c62828', fg='#fff8e1',
 *                               font='700 64px "Be Vietnam Pro", system-ui, sans-serif', border=null, radius=16 }
 *   H.sign(text, w, h, o?)      plane mesh showing text (o same as textTexture, + o.glow to light at night)
 *   H.slab(w=10, d=10, o?)      diorama base. o: { top='#8fbf6a', side='#6b4f3a', under='#4a3628', thickness=0.7, edge=true }
 *   H.room(o)                   cut-away room (floor + back wall at z=-d/2 + left wall at x=-w/2 + skirting).
 *                               o: { w=10, d=10, h=3.2, floor, wall, wallSide, trim, floorPattern:'tile'|'wood'|'none',
 *                               windowBack:bool, windowSide:bool }. Returns Group; group.userData.walls = {back,left}
 *   H.tree(kind, o?)            kind: 'round'|'palm'|'pine'|'willow'|'bamboo'|'bush'|'potted'|'flower'|'banana'
 *                               o: { h, trunk, leaves, seed }
 *   H.instanced(geometry, colorOrMat, transforms:[{x,y,z,ry,s|sx,sy,sz}], o?)  InstancedMesh
 *   H.nightLight(parent, [x,y,z], color, intensity, distance)  PointLight shown only at dusk/night (≤ 3 per env!)
 *   H.onUpdate(fn(dt, t))       ambient animation hook
 *   H.rng(seed)                 deterministic random() for stable layouts
 *   H.decor.tet() / .birthday() / .midautumn() / .christmas() / .funeral()   small decor groups (origin on floor)
 *   H.motorbike(color)          parked scooter (Group, ~1.8 m long along X)
 *   H.plasticStool(color) / H.lantern(color) / H.fan()   tiny VN props
 *   H.THREE                     the THREE namespace
 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const THREE = window.THREE;
  const U = KN.util;

  if (!THREE) {
    KN.Env = { register() {}, build() { return null; }, has() { return false; }, list() { return []; }, meta() { return null; } };
    return;
  }

  const registry = new Map();
  const matCache = new Map();
  const geoCache = new Map();

  const DEFAULT_NPC_SPOTS = [
    { pos: [-1.5, 0, 1.0], rotY: 0.6 },
    { pos: [1.5, 0, 1.0], rotY: -0.6 },
    { pos: [-2.5, 0, -0.1], rotY: 0.9 },
    { pos: [2.5, 0, -0.1], rotY: -0.9 },
  ];
  const DEFAULT_CAMERA = {
    wide: { pos: [7.0, 5.9, 10.3], target: [-0.2, 0.9, -0.3] },
    close: { pos: [2.4, 2.2, 5.6], target: [0, 1.15, 0.6] },
    low: { pos: [3.2, 0.8, 6.4], target: [0, 1.35, 0.4] },
    top: { pos: [0.01, 15, 6.5], target: [0, 0, 0] },
    dramatic: { pos: [-4.6, 2.3, 5.8], target: [0, 1.25, 0.5] },
  };

  function toColor(c) { return c instanceof THREE.Color ? c : new THREE.Color(c); }

  function mat(color, o) {
    o = o || {};
    if (color && color.isMaterial) return color;
    const params = {
      color: toColor(color == null ? '#cccccc' : color),
      roughness: o.rough ?? 0.82,
      metalness: o.metal ?? 0,
      flatShading: !!o.flat,
      transparent: o.opacity != null && o.opacity < 1,
      opacity: o.opacity ?? 1,
      side: o.double ? THREE.DoubleSide : THREE.FrontSide,
    };
    if (o.emissive) { params.emissive = toColor(o.emissive); params.emissiveIntensity = o.emissiveIntensity ?? 1; }
    if (o.map) params.map = o.map;
    if (o.unique || o.map) return new THREE.MeshStandardMaterial(params);
    const key = [color, params.roughness, params.metalness, o.flat ? 1 : 0, params.opacity, o.double ? 1 : 0, o.emissive || '', o.emissiveIntensity ?? ''].join('|');
    let m = matCache.get(key);
    if (!m) { m = new THREE.MeshStandardMaterial(params); m.userData.cached = true; matCache.set(key, m); }
    return m;
  }

  function cachedGeo(key, make) {
    let g = geoCache.get(key);
    if (!g) { g = make(); g.userData.cached = true; geoCache.set(key, g); }
    return g;
  }

  function roundedBoxGeometry(w, h, d, r, seg) {
    r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    const depth = Math.max(0.001, d - 2 * r);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: seg || 3, curveSegments: seg || 3 });
    geo.translate(0, 0, -depth / 2);
    geo.computeVertexNormals();
    return geo;
  }

  function makeKit(ctx) {
    const H = { THREE };

    H.mat = mat;
    H.glow = function (color, o) {
      const m = new THREE.MeshStandardMaterial({ color: toColor(color), emissive: toColor((o && o.emissive) || color), emissiveIntensity: 0.15, roughness: (o && o.rough) ?? 0.5 });
      m.userData.glowMax = (o && o.intensity) ?? 1.6;
      ctx.glows.push(m); ctx.owned.push(m);
      return m;
    };
    function M(c, o) { return c && c.isMaterial ? c : mat(c, o); }
    H.mesh = function (geo, c, o) {
      o = o || {};
      const m = new THREE.Mesh(geo, M(c, o));
      m.castShadow = o.cast ?? true;
      m.receiveShadow = o.receive ?? true;
      return m;
    };
    H.box = (w, h, d, c, o) => H.mesh(cachedGeo(`box|${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d)), c, o);
    H.rbox = (w, h, d, r, c, o) => H.mesh(cachedGeo(`rbox|${w}|${h}|${d}|${r}`, () => roundedBoxGeometry(w, h, d, r, 3)), c, o);
    H.cyl = (rt, rb, h, c, o) => { const s = (o && o.seg) || 18; return H.mesh(cachedGeo(`cyl|${rt}|${rb}|${h}|${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s)), c, o); };
    H.sphere = (r, c, o) => {
      const s = (o && o.seg) || 20;
      const m = H.mesh(cachedGeo(`sph|${r}|${s}`, () => new THREE.SphereGeometry(r, s, Math.max(8, Math.round(s * 0.7)))), c, o);
      if (o && o.squash) m.scale.set(o.squash[0], o.squash[1], o.squash[2]);
      return m;
    };
    H.cone = (r, h, c, o) => { const s = (o && o.seg) || 18; return H.mesh(cachedGeo(`cone|${r}|${h}|${s}`, () => new THREE.ConeGeometry(r, h, s)), c, o); };
    H.torus = (r, t, c, o) => { const arc = (o && o.arc) || Math.PI * 2; return H.mesh(cachedGeo(`tor|${r}|${t}|${arc}`, () => new THREE.TorusGeometry(r, t, 10, 28, arc)), c, o); };
    H.plane = (w, h, c, o) => H.mesh(cachedGeo(`pl|${w}|${h}`, () => new THREE.PlaneGeometry(w, h)), c, Object.assign({ cast: false }, o));
    H.ground = (w, d, c, o) => {
      const m = H.mesh(cachedGeo(`gr|${w}|${d}`, () => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); return g; }), c, Object.assign({ cast: false }, o));
      m.position.y = 0.002;
      return m;
    };
    H.at = function (obj, x, y, z, ry, s) {
      obj.position.set(x || 0, y || 0, z || 0);
      if (ry) obj.rotation.y = ry;
      if (s != null && s !== 1) obj.scale.setScalar(s);
      return obj;
    };
    H.group = function (...children) { const g = new THREE.Group(); children.forEach((c) => c && g.add(c)); return g; };

    H.textTexture = function (text, o) {
      o = Object.assign({ w: 512, h: 128, bg: '#c62828', fg: '#fff8e1', font: '700 64px "Be Vietnam Pro", system-ui, sans-serif', border: null, radius: 16 }, o || {});
      const cv = document.createElement('canvas');
      cv.width = o.w; cv.height = o.h;
      const g = cv.getContext('2d');
      if (o.bg) {
        g.fillStyle = o.bg;
        const r = o.radius;
        g.beginPath();
        g.moveTo(r, 0); g.lineTo(o.w - r, 0); g.quadraticCurveTo(o.w, 0, o.w, r);
        g.lineTo(o.w, o.h - r); g.quadraticCurveTo(o.w, o.h, o.w - r, o.h);
        g.lineTo(r, o.h); g.quadraticCurveTo(0, o.h, 0, o.h - r);
        g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
        g.fill();
      }
      if (o.border) { g.strokeStyle = o.border; g.lineWidth = 8; g.strokeRect(8, 8, o.w - 16, o.h - 16); }
      g.fillStyle = o.fg; g.font = o.font; g.textAlign = 'center'; g.textBaseline = 'middle';
      const lines = String(text).split('\n');
      const lh = o.h / (lines.length + 0.3);
      lines.forEach((ln, i) => g.fillText(ln, o.w / 2, (o.h - lh * lines.length) / 2 + lh * (i + 0.5), o.w * 0.92));
      const tex = new THREE.CanvasTexture(cv);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 4;
      ctx.owned.push(tex);
      return tex;
    };
    H.sign = function (text, w, h, o) {
      o = o || {};
      const tex = H.textTexture(text, o);
      let m;
      if (o.glow) {
        m = new THREE.MeshStandardMaterial({ map: tex, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 0.1, roughness: 0.6 });
        m.userData.glowMax = 0.9; ctx.glows.push(m);
      } else {
        m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
      }
      ctx.owned.push(m);
      const mesh = new THREE.Mesh(cachedGeo(`pl|${w}|${h}`, () => new THREE.PlaneGeometry(w, h)), m);
      mesh.receiveShadow = true;
      return mesh;
    };

    H.slab = function (w = 10, d = 10, o) {
      o = Object.assign({ top: '#8fbf6a', side: '#6b4f3a', under: '#4a3628', thickness: 0.7, edge: true }, o || {});
      const g = new THREE.Group();
      const top = H.rbox(w, 0.16, d, 0.07, o.top, { cast: false });
      // mặt trên của khối bo góc phải nằm đúng y = 0 (bevel làm nó dày hơn 0.16) — nếu không sẽ che sàn phòng
      top.geometry.computeBoundingBox();
      top.position.y = -top.geometry.boundingBox.max.y - 0.001;
      g.add(top);
      const body = H.rbox(w - 0.04, o.thickness, d - 0.04, 0.12, o.side, { cast: false });
      body.position.y = -0.16 - o.thickness / 2 + 0.02;
      g.add(body);
      const under = H.rbox(w - 0.5, 0.25, d - 0.5, 0.1, o.under, { cast: false });
      under.position.y = -0.16 - o.thickness - 0.08;
      g.add(under);
      g.userData.isSlab = true;
      return g;
    };

    H.room = function (o) {
      o = Object.assign({ w: 10, d: 10, h: 3.2, floor: '#d8c3a5', wall: '#efe6d6', wallSide: null, trim: '#8a6a4f', floorPattern: 'tile', windowBack: false, windowSide: false }, o || {});
      const g = new THREE.Group();
      const t = 0.18;
      // floor
      const fl = H.box(o.w, 0.04, o.d, o.floor, { cast: false });
      fl.position.y = 0.02; g.add(fl);
      if (o.floorPattern === 'tile' || o.floorPattern === 'wood') {
        const lines = [];
        const step = o.floorPattern === 'tile' ? 0.8 : 0.35;
        const darker = U.shadeHex(typeof o.floor === 'string' ? o.floor : '#d8c3a5', -0.12);
        if (o.floorPattern === 'tile') {
          for (let x = -o.w / 2 + step; x < o.w / 2; x += step) lines.push({ x, y: 0.042, z: 0, sx: 1, sy: 1, sz: o.d });
          for (let z = -o.d / 2 + step; z < o.d / 2; z += step) lines.push({ x: 0, y: 0.042, z, ry: Math.PI / 2, sx: 1, sy: 1, sz: o.w });
        } else {
          for (let z = -o.d / 2 + step; z < o.d / 2; z += step) lines.push({ x: 0, y: 0.042, z, ry: Math.PI / 2, sx: 1, sy: 1, sz: o.w });
        }
        g.add(H.instanced(cachedGeo('grout', () => new THREE.BoxGeometry(0.025, 0.004, 1)), darker, lines, { cast: false }));
      }
      // walls
      const back = H.box(o.w, o.h, t, o.wall);
      back.position.set(0, o.h / 2, -o.d / 2 + t / 2);
      const left = H.box(t, o.h, o.d, o.wallSide || o.wall);
      left.position.set(-o.w / 2 + t / 2, o.h / 2, 0);
      g.add(back, left);
      // skirting
      const sk1 = H.box(o.w, 0.12, 0.04, o.trim, { cast: false }); sk1.position.set(0, 0.1, -o.d / 2 + t + 0.02);
      const sk2 = H.box(0.04, 0.12, o.d, o.trim, { cast: false }); sk2.position.set(-o.w / 2 + t + 0.02, 0.1, 0);
      g.add(sk1, sk2);
      // wall top caps
      const cap1 = H.box(o.w, 0.06, t + 0.04, o.trim, { cast: false }); cap1.position.set(0, o.h + 0.03, -o.d / 2 + t / 2);
      const cap2 = H.box(t + 0.04, 0.06, o.d, o.trim, { cast: false }); cap2.position.set(-o.w / 2 + t / 2, o.h + 0.03, 0);
      g.add(cap1, cap2);
      const glass = H.glow('#bfe3ff', { intensity: 0.9 });
      glass.transparent = true; glass.opacity = 0.75;
      if (o.windowBack) {
        const wf = H.box(2.2, 1.4, 0.06, '#f8f4ec'); wf.position.set(1.8, 1.75, -o.d / 2 + t + 0.01); g.add(wf);
        const wg = H.box(2.0, 1.2, 0.07, glass); wg.position.set(1.8, 1.75, -o.d / 2 + t + 0.02); g.add(wg);
        const mul = H.box(0.05, 1.2, 0.09, '#f8f4ec', { cast: false }); mul.position.set(1.8, 1.75, -o.d / 2 + t + 0.03); g.add(mul);
      }
      if (o.windowSide) {
        const wf = H.box(0.06, 1.4, 2.2, '#f8f4ec'); wf.position.set(-o.w / 2 + t + 0.01, 1.75, -1.2); g.add(wf);
        const wg = H.box(0.07, 1.2, 2.0, glass); wg.position.set(-o.w / 2 + t + 0.02, 1.75, -1.2); g.add(wg);
      }
      g.userData.walls = { back, left };
      return g;
    };

    H.tree = function (kind, o) {
      o = o || {};
      const r = U.seeded(o.seed ?? 7);
      const g = new THREE.Group();
      const h = o.h ?? 3;
      const trunkC = o.trunk || '#6b4a2f';
      const leafC = o.leaves || '#5f9e4f';
      if (kind === 'palm') {
        let y = 0;
        const segs = 7;
        for (let i = 0; i < segs; i++) {
          const s = H.cyl(0.11 - i * 0.007, 0.13 - i * 0.007, h / segs, trunkC, { seg: 8 });
          s.position.set(Math.sin(i * 0.35) * 0.18, y + h / segs / 2, 0); s.rotation.z = -0.06 * i;
          g.add(s); y += h / segs;
        }
        const top = new THREE.Vector3(Math.sin(segs * 0.35) * 0.18, h, 0);
        for (let i = 0; i < 8; i++) {
          const leaf = H.box(1.5, 0.03, 0.32, leafC, { flat: true });
          leaf.geometry = cachedGeo('palmleaf', () => { const gg = new THREE.BoxGeometry(1.5, 0.03, 0.32); gg.translate(0.75, 0, 0); return gg; });
          leaf.position.copy(top); leaf.rotation.y = (i / 8) * Math.PI * 2 + r() * 0.3; leaf.rotation.z = -0.45 - r() * 0.25;
          g.add(leaf);
        }
        for (let i = 0; i < 3; i++) { const c = H.sphere(0.1, '#5a4a1e'); c.position.set(top.x + Math.cos(i * 2.1) * 0.13, h - 0.12, Math.sin(i * 2.1) * 0.13); g.add(c); }
      } else if (kind === 'pine') {
        g.add(H.at(H.cyl(0.1, 0.14, h * 0.3, trunkC, { seg: 8 }), 0, h * 0.15, 0));
        for (let i = 0; i < 3; i++) g.add(H.at(H.cone(0.9 - i * 0.22, h * 0.42, leafC, { seg: 10, flat: true }), 0, h * 0.35 + i * h * 0.2, 0));
      } else if (kind === 'willow') {
        g.add(H.at(H.cyl(0.13, 0.2, h * 0.65, trunkC, { seg: 9 }), 0, h * 0.32, 0));
        g.add(H.at(H.sphere(1.0, leafC, { seg: 14, flat: true, squash: [1.2, 0.7, 1.2] }), 0, h * 0.75, 0));
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const strand = H.box(0.1, h * 0.55, 0.1, U.shadeHex(leafC, 0.08), { flat: true });
          strand.position.set(Math.cos(a) * 1.05, h * 0.5, Math.sin(a) * 1.05);
          g.add(strand);
        }
      } else if (kind === 'bamboo') {
        for (let i = 0; i < 6; i++) {
          const x = (r() - 0.5) * 0.9, z = (r() - 0.5) * 0.9, hh = h * (0.8 + r() * 0.4);
          const c = H.cyl(0.045, 0.05, hh, '#7fa648', { seg: 6 }); c.position.set(x, hh / 2, z); c.rotation.z = (r() - 0.5) * 0.12; g.add(c);
          for (let k = 0; k < 3; k++) { const lf = H.box(0.5, 0.02, 0.1, leafC, { flat: true }); lf.position.set(x + 0.2, hh * (0.6 + k * 0.15), z); lf.rotation.set(r(), r() * 6, -0.4); g.add(lf); }
        }
      } else if (kind === 'bush') {
        for (let i = 0; i < 3; i++) g.add(H.at(H.sphere(0.4 + r() * 0.15, leafC, { seg: 10, flat: true }), (i - 1) * 0.35, 0.35, (r() - 0.5) * 0.3));
      } else if (kind === 'potted' || kind === 'flower') {
        g.add(H.at(H.cyl(0.22, 0.16, 0.4, o.pot || '#b5653a', { seg: 14 }), 0, 0.2, 0));
        if (kind === 'flower') {
          for (let i = 0; i < 7; i++) g.add(H.at(H.sphere(0.08, o.bloom || U.pick(['#ff6f91', '#ffd166', '#f78c6b', '#ffffff']), { seg: 8 }), (r() - 0.5) * 0.35, 0.55 + r() * 0.25, (r() - 0.5) * 0.35));
          g.add(H.at(H.sphere(0.24, leafC, { seg: 10, flat: true }), 0, 0.5, 0));
        } else {
          for (let i = 0; i < 6; i++) {
            const lf = H.box(0.12, 0.02, 0.7, leafC, { flat: true });
            lf.geometry = cachedGeo('potleaf', () => { const gg = new THREE.BoxGeometry(0.14, 0.02, 0.7); gg.translate(0, 0, 0.35); return gg; });
            lf.position.set(0, 0.42, 0); lf.rotation.set(-0.9 - r() * 0.4, (i / 6) * Math.PI * 2, 0); g.add(lf);
          }
        }
      } else if (kind === 'banana') {
        g.add(H.at(H.cyl(0.12, 0.16, h * 0.6, '#8aa65a', { seg: 8 }), 0, h * 0.3, 0));
        for (let i = 0; i < 6; i++) {
          const lf = H.box(0.4, 0.02, 1.4, leafC, { flat: true });
          lf.geometry = cachedGeo('bananaleaf', () => { const gg = new THREE.BoxGeometry(0.45, 0.02, 1.4); gg.translate(0, 0, 0.7); return gg; });
          lf.position.set(0, h * 0.6, 0); lf.rotation.set(-0.5 - r() * 0.5, (i / 6) * Math.PI * 2, 0); g.add(lf);
        }
      } else { // round
        g.add(H.at(H.cyl(0.12, 0.18, h * 0.5, trunkC, { seg: 9 }), 0, h * 0.25, 0));
        for (let i = 0; i < 4; i++) {
          const s = 0.55 + r() * 0.35;
          g.add(H.at(H.sphere(s, i % 2 ? leafC : U.shadeHex(leafC, -0.08), { seg: 12, flat: true }), (r() - 0.5) * 0.8, h * 0.6 + r() * h * 0.25, (r() - 0.5) * 0.8));
        }
      }
      return g;
    };

    H.instanced = function (geo, c, transforms, o) {
      o = o || {};
      const im = new THREE.InstancedMesh(geo, M(c, o), transforms.length);
      const dummy = new THREE.Object3D();
      transforms.forEach((t, i) => {
        dummy.position.set(t.x || 0, t.y || 0, t.z || 0);
        dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
        if (t.s != null) dummy.scale.setScalar(t.s); else dummy.scale.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        if (t.color) im.setColorAt(i, toColor(t.color));
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = o.cast ?? true;
      im.receiveShadow = o.receive ?? true;
      return im;
    };

    H.nightLight = function (parent, p, color, intensity, distance) {
      if (ctx.lights.length >= 3) { U.warnOnce('nl3', 'max 3 night lights per environment'); return null; }
      const l = new THREE.PointLight(toColor(color || '#ffcc88'), intensity ?? 1.2, distance ?? 7, 1.6);
      l.position.set(p[0], p[1], p[2]);
      l.visible = false;
      l.userData.maxIntensity = intensity ?? 1.2;
      parent.add(l);
      ctx.lights.push(l);
      return l;
    };
    H.onUpdate = (fn) => { ctx.updaters.push(fn); };
    H.rng = (seed) => U.seeded(seed);

    // ---------- tiny Vietnamese props ----------
    H.motorbike = function (color) {
      const c = color || U.pick(['#c0392b', '#1f4e8c', '#222831', '#e8e8e8', '#2e7d32']);
      const g = new THREE.Group();
      const tireM = mat('#1b1b1b', { rough: 0.9 });
      [[-0.62], [0.62]].forEach(([x]) => {
        const w = H.torus(0.27, 0.075, tireM); w.position.set(x, 0.3, 0); g.add(w);
        const hub = H.cyl(0.1, 0.1, 0.1, '#9aa0a6', { seg: 10, metal: 0.6, rough: 0.4 }); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.3, 0); g.add(hub);
      });
      g.add(H.at(H.rbox(1.0, 0.36, 0.36, 0.12, c), 0.05, 0.56, 0));                 // body
      g.add(H.at(H.rbox(0.62, 0.12, 0.34, 0.05, '#2b2b2b'), -0.15, 0.8, 0));         // seat
      g.add(H.at(H.rbox(0.22, 0.6, 0.3, 0.08, c), 0.55, 0.75, 0));                   // front shield
      const bar = H.cyl(0.025, 0.025, 0.62, '#444', { seg: 8 }); bar.rotation.x = Math.PI / 2; bar.position.set(0.6, 1.1, 0); g.add(bar);
      g.add(H.at(H.sphere(0.07, H.glow('#fff6c8')), 0.7, 1.0, 0));                   // headlight
      g.add(H.at(H.box(0.08, 0.06, 0.16, '#d32f2f'), -0.62, 0.62, 0));               // tail light
      return g;
    };
    H.plasticStool = function (color) {
      const g = new THREE.Group();
      const c = color || U.pick(['#d93a3a', '#2f80ed', '#2fb36d']);
      g.add(H.at(H.cyl(0.17, 0.2, 0.05, c, { seg: 14 }), 0, 0.42, 0));
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const l = H.box(0.05, 0.42, 0.05, c); l.position.set(Math.cos(a) * 0.15, 0.2, Math.sin(a) * 0.15); g.add(l); }
      return g;
    };
    H.lantern = function (color) {
      const g = new THREE.Group();
      const m = H.glow(color || '#e53935', { intensity: 1.4 });
      g.add(H.at(H.sphere(0.2, m, { seg: 14, squash: [1, 1.25, 1] }), 0, 0, 0));
      g.add(H.at(H.cyl(0.08, 0.08, 0.05, '#d4a017', { seg: 10 }), 0, 0.26, 0));
      g.add(H.at(H.cyl(0.08, 0.08, 0.05, '#d4a017', { seg: 10 }), 0, -0.26, 0));
      g.add(H.at(H.box(0.015, 0.22, 0.015, '#d4a017', { cast: false }), 0, -0.4, 0));
      return g;
    };
    H.fan = function () {
      const g = new THREE.Group();
      g.add(H.at(H.cyl(0.25, 0.28, 0.05, '#e8e8e8', { seg: 16 }), 0, 0.03, 0));
      g.add(H.at(H.cyl(0.03, 0.03, 1.1, '#cfcfcf', { seg: 8 }), 0, 0.58, 0));
      const head = new THREE.Group(); head.position.set(0, 1.18, 0);
      head.add(H.at(H.cyl(0.08, 0.1, 0.16, '#e8e8e8', { seg: 12 }), 0, 0, -0.06));
      head.children[0].rotation.x = Math.PI / 2;
      const blades = new THREE.Group(); blades.position.z = 0.06;
      for (let i = 0; i < 3; i++) { const b = H.box(0.08, 0.26, 0.01, '#7ec8e3', { opacity: 0.85 }); b.position.y = 0.13; const p = new THREE.Group(); p.rotation.z = (i / 3) * Math.PI * 2; p.add(b); blades.add(p); }
      head.add(blades);
      const cage = H.torus(0.3, 0.012, '#d9d9d9', { cast: false }); cage.position.z = 0.07; head.add(cage);
      g.add(head);
      ctx.updaters.push((dt, t) => { blades.rotation.z += dt * 14; head.rotation.y = Math.sin(t * 0.5) * 0.6; });
      return g;
    };

    // ---------- decor sets (origin on floor, ~1.2 m footprint) ----------
    H.decor = {
      tet() {
        const g = new THREE.Group();
        g.add(H.at(H.cyl(0.32, 0.25, 0.5, '#8d2f1f', { seg: 16 }), 0, 0.25, 0));
        const br = U.seeded(11);
        for (let i = 0; i < 5; i++) {
          const b = H.cyl(0.02, 0.035, 1.1, '#4e342e', { seg: 6 });
          b.position.set((br() - 0.5) * 0.5, 0.95, (br() - 0.5) * 0.5); b.rotation.set((br() - 0.5) * 0.7, 0, (br() - 0.5) * 0.7);
          g.add(b);
        }
        const blossoms = [];
        for (let i = 0; i < 46; i++) blossoms.push({ x: (br() - 0.5) * 1.1, y: 0.8 + br() * 0.9, z: (br() - 0.5) * 1.1, s: 0.7 + br() * 0.6 });
        g.add(H.instanced(cachedGeo('blossom', () => new THREE.SphereGeometry(0.06, 8, 6)), mat('#ff8fb1', { rough: 0.6 }), blossoms));
        const l1 = H.lantern('#e53935'); l1.position.set(0.6, 1.4, 0.1); g.add(l1);
        const cake = H.box(0.32, 0.12, 0.32, '#3f7d3a'); cake.position.set(-0.7, 0.06, 0.3); g.add(cake);
        const st = H.box(0.34, 0.02, 0.04, '#e8d27a', { cast: false }); st.position.set(-0.7, 0.125, 0.3); g.add(st);
        const red = H.sign('An Khang\nThịnh Vượng', 0.5, 1.1, { w: 128, h: 300, bg: '#c62828', fg: '#ffd54f', font: '700 34px "Be Vietnam Pro", system-ui' });
        red.position.set(0.95, 1.2, -0.3); g.add(red);
        return g;
      },
      birthday() {
        const g = new THREE.Group();
        const t = H.cyl(0.45, 0.45, 0.06, '#f5f5f5', { seg: 20 }); t.position.y = 0.75; g.add(t);
        g.add(H.at(H.cyl(0.04, 0.06, 0.72, '#8d6e63', { seg: 8 }), 0, 0.36, 0));
        g.add(H.at(H.cyl(0.22, 0.22, 0.18, '#ffccdd', { seg: 20 }), 0, 0.87, 0));
        g.add(H.at(H.cyl(0.16, 0.16, 0.12, '#ffffff', { seg: 20 }), 0, 1.02, 0));
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          g.add(H.at(H.cyl(0.012, 0.012, 0.1, '#64b5f6', { seg: 6 }), Math.cos(a) * 0.1, 1.13, Math.sin(a) * 0.1));
          g.add(H.at(H.sphere(0.018, H.glow('#ffb74d', { intensity: 2 })), Math.cos(a) * 0.1, 1.2, Math.sin(a) * 0.1));
        }
        const cols = ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a', '#ab47bc'];
        for (let i = 0; i < 5; i++) {
          const b = H.sphere(0.2, cols[i], { seg: 14, squash: [1, 1.2, 1], rough: 0.35 });
          b.position.set(-0.8 + i * 0.4, 2.0 + (i % 2) * 0.25, -0.4 + (i % 3) * 0.15); g.add(b);
          const s = H.box(0.006, 1.0, 0.006, '#eeeeee', { cast: false }); s.position.set(b.position.x, b.position.y - 0.7, b.position.z); g.add(s);
          ctx.updaters.push((dt, tt) => { b.position.y = 2.0 + (i % 2) * 0.25 + Math.sin(tt * 1.3 + i) * 0.05; });
        }
        return g;
      },
      midautumn() {
        const g = new THREE.Group();
        const star = new THREE.Shape();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.12 : 0.3; const a = (i / 10) * Math.PI * 2 + Math.PI / 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? star.lineTo(x, y) : star.moveTo(x, y); }
        const sg = new THREE.ExtrudeGeometry(star, { depth: 0.06, bevelEnabled: false });
        const sm = H.glow('#ff5252', { intensity: 1.6 });
        const s1 = H.mesh(sg, sm); s1.position.set(0, 1.5, 0); g.add(s1);
        g.add(H.at(H.cyl(0.015, 0.015, 1.5, '#8d6e63', { seg: 6 }), 0.0, 0.75, 0.03));
        const l2 = H.lantern('#ffb300'); l2.position.set(0.6, 1.6, -0.2); g.add(l2);
        for (let i = 0; i < 3; i++) g.add(H.at(H.cyl(0.12, 0.12, 0.07, '#c58b3a', { seg: 14 }), -0.5 + i * 0.28, 0.04, 0.4));
        ctx.updaters.push((dt, t) => { s1.rotation.y = Math.sin(t * 0.8) * 0.4; });
        return g;
      },
      christmas() {
        const g = H.tree('pine', { h: 1.8, leaves: '#2e7d32' });
        const cols = ['#e53935', '#fdd835', '#42a5f5'];
        for (let i = 0; i < 9; i++) { const a = i * 2.3; const y = 0.6 + (i / 9) * 1.0; const r = 0.55 - (i / 9) * 0.4; g.add(H.at(H.sphere(0.05, H.glow(cols[i % 3], { intensity: 1.8 })), Math.cos(a) * r, y, Math.sin(a) * r)); }
        g.add(H.at(H.sphere(0.09, H.glow('#ffd54f', { intensity: 2 })), 0, 1.92, 0));
        return g;
      },
      funeral() {
        const g = new THREE.Group();
        g.add(H.at(H.box(1.4, 0.8, 0.6, '#5d4037'), 0, 0.4, 0));
        g.add(H.at(H.box(1.5, 0.05, 0.7, '#f5f5f5', { cast: false }), 0, 0.82, 0));
        const frame = H.box(0.42, 0.55, 0.04, '#3e2723'); frame.position.set(0, 1.15, -0.15); g.add(frame);
        g.add(H.at(H.box(0.34, 0.46, 0.045, '#cfd8dc', { cast: false }), 0, 1.15, -0.14));
        g.add(H.at(H.cyl(0.08, 0.1, 0.12, '#b0855a', { seg: 12 }), 0.4, 0.9, 0.1));
        for (let i = 0; i < 3; i++) g.add(H.at(H.cyl(0.006, 0.006, 0.3, '#c62828', { seg: 4 }), 0.37 + i * 0.03, 1.08, 0.1));
        for (let i = 0; i < 2; i++) {
          const v = new THREE.Group(); v.position.set(i ? 0.6 : -0.6, 0.85, 0);
          v.add(H.at(H.cyl(0.07, 0.05, 0.25, '#eceff1', { seg: 10 }), 0, 0.12, 0));
          for (let k = 0; k < 6; k++) v.add(H.at(H.sphere(0.06, '#ffffff', { seg: 8 }), (k % 3 - 1) * 0.07, 0.3 + Math.floor(k / 3) * 0.08, ((k * 7) % 3 - 1) * 0.04));
          g.add(v);
        }
        return g;
      },
    };

    return H;
  }

  function disposeTree(obj) {
    obj.traverse((o) => {
      if (o.geometry && !o.geometry.userData.cached) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => { if (!m.userData.cached) { if (m.map) m.map.dispose(); m.dispose(); } });
    });
  }

  function build(id, opts) {
    opts = opts || {};
    if (!registry.has(id)) {
      U.warnOnce('env:' + id, 'unknown location', id, '→ home');
      id = registry.has('home') ? 'home' : registry.keys().next().value;
      if (!id) return null;
    }
    const def = registry.get(id);
    const ctx = { glows: [], lights: [], updaters: [], owned: [] };
    const H = makeKit(ctx);
    let res;
    try { res = def.build(H, opts) || {}; }
    catch (e) { console.error('[KN.Env] build failed for', id, e); res = { group: H.group(H.slab(10, 10)) }; }
    const group = res.group || H.group();
    group.name = 'env:' + id;
    let currentTime = 'day';
    const inst = {
      id,
      meta: def.meta,
      group,
      playerSpot: res.playerSpot || { pos: [0, 0, 0.8], rotY: 0 },
      npcSpots: (res.npcSpots && res.npcSpots.length >= 4) ? res.npcSpots : DEFAULT_NPC_SPOTS.map((s, i) => (res.npcSpots && res.npcSpots[i]) || s),
      camera: Object.assign({}, DEFAULT_CAMERA, res.camera || {}),
      anchors: res.anchors || {},
      update(dt, t) {
        for (let i = 0; i < ctx.updaters.length; i++) { try { ctx.updaters[i](dt, t); } catch (e) { /* keep running */ } }
        if (res.update) { try { res.update(dt, t); } catch (e) { /* ignore */ } }
      },
      setTime(time) {
        currentTime = time;
        const k = time === 'night' ? 1 : time === 'dusk' ? 0.7 : time === 'dawn' ? 0.35 : 0.08;
        ctx.glows.forEach((m) => { m.emissiveIntensity = (m.userData.glowMax ?? 1.4) * k; });
        ctx.lights.forEach((l) => { l.visible = k > 0.3; l.intensity = l.userData.maxIntensity * k; });
        if (res.setTime) { try { res.setTime(time); } catch (e) { /* ignore */ } }
      },
      get time() { return currentTime; },
      dispose() {
        disposeTree(group);
        ctx.owned.forEach((o) => { if (o && o.dispose) o.dispose(); });
        if (group.parent) group.parent.remove(group);
      },
    };
    inst.setTime('day');
    return inst;
  }

  KN.Env = {
    register(id, meta, buildFn) {
      if (typeof buildFn !== 'function') { console.warn('[KN.Env] register needs a build function', id); return; }
      registry.set(id, { meta: Object.assign({ name: id, indoor: false, sky: ['#9fd3ff', '#fff1dc'] }, meta || {}), build: buildFn });
    },
    build,
    has: (id) => registry.has(id),
    list: () => Array.from(registry.keys()),
    meta: (id) => (registry.get(id) || {}).meta || null,
    DEFAULT_NPC_SPOTS,
    DEFAULT_CAMERA,
    _makeKit: makeKit, // for tests
  };
})();
