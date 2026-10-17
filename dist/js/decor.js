/* Một Kiếp Người — 🛋️ TRANG TRÍ NHÀ RIÊNG 3D (KN.Decor)
   Căn phòng 3D (nhà riêng to nhỏ theo giá trị nhà; chưa có nhà thì là phòng trọ 5×4 m). Mua đồ nội thất trong danh mục,
   chạm lên sàn để đặt, chạm vào đồ để xoay / di chuyển / bán lại nửa giá. Kéo để xoay góc nhìn, lăn chuột để phóng to.
   Luật mua bán và chỗ đặt do KN.Game kiểm tra (decorBuy / decorMove / decorSell); tiện nghi cao → thêm hạnh phúc mỗi năm. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const money = (v) => (KN.DATA && KN.DATA.fmtMoney ? KN.DATA.fmtMoney(v) : Math.round(v).toLocaleString('vi-VN') + 'đ');
  let root = null, three = null, view = null, mode = null, raf = 0;
  // ---------------------------------------------------------------- mô hình đồ đạc (dựng từ khối cơ bản, đơn vị: mét)
  function mat(T, color, o) { return new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.75, metalness: 0.05 }, o || {})); }
  function box(T, g, w, h, d, x, y, z, m) { const me = new T.Mesh(new T.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; }
  function cyl(T, g, rt, rb, h, x, y, z, m, seg) { const me = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; }
  function sph(T, g, r, x, y, z, m) { const me = new T.Mesh(new T.SphereGeometry(r, 16, 12), m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; }
  function model(T, k, w, d) {
    const g = new T.Group(), wood = mat(T, 0x8a5a3b), dark = mat(T, 0x2a2a2e), white = mat(T, 0xf3f1ec);
    const W = w - 0.1, D = d - 0.1;
    switch (k) {
      case 'thamtrai': box(T, g, W, 0.02, D, 0, 0.01, 0, mat(T, 0xb5443a)); box(T, g, W * 0.8, 0.021, D * 0.8, 0, 0.011, 0, mat(T, 0xe8c36a)); break;
      case 'sofa': { const m = mat(T, 0x3d6fb6); box(T, g, W, 0.42, D * 0.9, 0, 0.21, 0.04, m); box(T, g, W, 0.5, 0.2, 0, 0.6, -D / 2 + 0.12, m); box(T, g, 0.18, 0.3, D * 0.9, -W / 2 + 0.09, 0.55, 0.04, m); box(T, g, 0.18, 0.3, D * 0.9, W / 2 - 0.09, 0.55, 0.04, m); box(T, g, W * 0.42, 0.12, D * 0.6, -W * 0.22, 0.48, 0.08, mat(T, 0x5a8fd6)); box(T, g, W * 0.42, 0.12, D * 0.6, W * 0.22, 0.48, 0.08, mat(T, 0x5a8fd6)); break; }
      case 'banTra': box(T, g, 0.8, 0.05, 0.5, 0, 0.42, 0, wood); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(T, g, 0.05, 0.4, 0.05, a * 0.35, 0.2, b * 0.2, wood)); cyl(T, g, 0.05, 0.05, 0.1, 0.1, 0.5, 0, white); break;
      case 'tv': box(T, g, W, 0.45, 0.4, 0, 0.225, -D / 2 + 0.22, wood); box(T, g, W * 0.85, 0.95, 0.06, 0, 0.98, -D / 2 + 0.2, dark); box(T, g, W * 0.8, 0.85, 0.01, 0, 0.98, -D / 2 + 0.235, mat(T, 0x2f6fd8, { emissive: 0x1f4fa8, emissiveIntensity: 0.6 })); break;
      case 'giuong': box(T, g, W, 0.35, D, 0, 0.175, 0, wood); box(T, g, W * 0.96, 0.18, D * 0.94, 0, 0.44, 0.02, white); box(T, g, W, 0.8, 0.08, 0, 0.6, -D / 2 + 0.04, wood); box(T, g, W * 0.35, 0.12, 0.35, -W * 0.22, 0.58, -D / 2 + 0.32, white); box(T, g, W * 0.35, 0.12, 0.35, W * 0.22, 0.58, -D / 2 + 0.32, white); box(T, g, W * 0.96, 0.06, D * 0.55, 0, 0.55, D * 0.18, mat(T, 0xd76b8a)); break;
      case 'tu': box(T, g, W, 2, D * 0.6, 0, 1, -D * 0.2, mat(T, 0xc9a77c)); box(T, g, 0.02, 1.9, 0.01, 0, 1, D * 0.1 + 0.005, dark); cyl(T, g, 0.02, 0.02, 0.15, -0.06, 1, D * 0.1 + 0.02, mat(T, 0xd4af37)); cyl(T, g, 0.02, 0.02, 0.15, 0.06, 1, D * 0.1 + 0.02, mat(T, 0xd4af37)); break;
      case 'banHoc': box(T, g, W, 0.05, D * 0.6, 0, 0.75, -D * 0.15, wood); box(T, g, 0.05, 0.72, D * 0.55, -W / 2 + 0.05, 0.36, -D * 0.15, wood); box(T, g, 0.05, 0.72, D * 0.55, W / 2 - 0.05, 0.36, -D * 0.15, wood); box(T, g, 0.5, 0.32, 0.03, 0, 1.0, -D * 0.35, dark); box(T, g, 0.46, 0.28, 0.01, 0, 1.0, -D * 0.33, mat(T, 0x39cf98, { emissive: 0x1f8f60, emissiveIntensity: 0.5 })); box(T, g, 0.4, 0.05, 0.4, 0, 0.45, D * 0.25, dark); box(T, g, 0.4, 0.45, 0.05, 0, 0.7, D * 0.42, dark); break;
      case 'banAn': box(T, g, W * 0.8, 0.05, D * 0.7, 0, 0.75, 0, wood); cyl(T, g, 0.06, 0.1, 0.72, 0, 0.36, 0, wood); [-1, 1].forEach((s) => { [-1, 1].forEach((t2) => { const cx = s * W * 0.22; box(T, g, 0.35, 0.05, 0.35, cx, 0.45, t2 * D * 0.5, wood); box(T, g, 0.35, 0.4, 0.04, cx, 0.68, t2 * (D * 0.5 + 0.16), wood); }); }); cyl(T, g, 0.1, 0.1, 0.05, 0, 0.8, 0, white); break;
      case 'tuLanh': box(T, g, 0.7, 1.8, 0.65, 0, 0.9, -0.1, mat(T, 0xdfe6ea, { metalness: 0.3, roughness: 0.3 })); box(T, g, 0.02, 0.4, 0.02, 0.25, 1.3, 0.24, dark); box(T, g, 0.02, 0.4, 0.02, 0.25, 0.6, 0.24, dark); box(T, g, 0.7, 0.01, 0.01, 0, 1.15, 0.23, dark); break;
      case 'cay': cyl(T, g, 0.2, 0.16, 0.35, 0, 0.175, 0, mat(T, 0xf0e6d8)); sph(T, g, 0.32, 0, 0.75, 0, mat(T, 0x3f8f4a)); sph(T, g, 0.22, 0.15, 1.0, 0.05, mat(T, 0x4fa85a)); sph(T, g, 0.2, -0.12, 0.95, -0.08, mat(T, 0x357d40)); break;
      case 'den': cyl(T, g, 0.18, 0.18, 0.04, 0, 0.02, 0, dark); cyl(T, g, 0.02, 0.02, 1.5, 0, 0.77, 0, dark); cyl(T, g, 0.12, 0.25, 0.3, 0, 1.55, 0, mat(T, 0xfff1c9, { emissive: 0xffd27a, emissiveIntensity: 0.9 })); break;
      case 'beCa': box(T, g, 0.9, 0.7, 0.4, 0, 0.35, 0, wood); box(T, g, 0.85, 0.5, 0.38, 0, 0.95, 0, mat(T, 0x7fd0f0, { transparent: true, opacity: 0.45, roughness: 0.1 })); box(T, g, 0.12, 0.06, 0.04, -0.15, 0.95, 0, mat(T, 0xff8a1e)); box(T, g, 0.1, 0.05, 0.04, 0.2, 1.05, 0.05, mat(T, 0xffd23f)); box(T, g, 0.8, 0.05, 0.35, 0, 0.73, 0, mat(T, 0xd9c08a)); break;
      case 'banTho': box(T, g, 0.9, 0.9, 0.5, 0, 0.45, -0.2, mat(T, 0x8f1d1d)); box(T, g, 0.95, 0.05, 0.55, 0, 0.92, -0.2, mat(T, 0xd4af37)); cyl(T, g, 0.1, 0.08, 0.12, 0, 1.0, -0.2, mat(T, 0xd4af37)); box(T, g, 0.25, 0.32, 0.03, -0.25, 1.1, -0.38, mat(T, 0x2a2a2e)); box(T, g, 0.25, 0.32, 0.03, 0.25, 1.1, -0.38, mat(T, 0x2a2a2e)); for (let i = -1; i <= 1; i++) cyl(T, g, 0.005, 0.005, 0.2, i * 0.03, 1.15, -0.2, mat(T, 0xc0392b, { emissive: 0xff4400, emissiveIntensity: 0.4 }), 4); sph(T, g, 0.08, 0.32, 1.0, -0.15, mat(T, 0xff8a1e)); break;
      case 'piano': box(T, g, W * 0.9, 1.1, 0.55, 0, 0.55, -D / 2 + 0.3, mat(T, 0x111114, { roughness: 0.25 })); box(T, g, W * 0.85, 0.04, 0.2, 0, 0.75, -D / 2 + 0.66, white); for (let i = 0; i < 14; i++) box(T, g, 0.03, 0.02, 0.12, -W * 0.4 + i * W * 0.062, 0.78, -D / 2 + 0.62, dark); box(T, g, 0.6, 0.45, 0.35, 0, 0.225, D / 2 - 0.2, mat(T, 0x111114)); break;
      case 'game': box(T, g, 0.9, 0.05, 0.6, 0, 0.75, -0.15, dark); [-0.2, 0.2].forEach((x) => { box(T, g, 0.36, 0.24, 0.03, x, 1.05, -0.4, dark); box(T, g, 0.33, 0.21, 0.01, x, 1.05, -0.38, mat(T, x < 0 ? 0xc56bff : 0x5cc8ff, { emissive: x < 0 ? 0x8a3ed0 : 0x2f8fcf, emissiveIntensity: 0.7 })); }); box(T, g, 0.9, 0.02, 0.02, 0, 0.73, 0.14, mat(T, 0xff3d7f, { emissive: 0xff3d7f, emissiveIntensity: 0.8 })); box(T, g, 0.5, 0.08, 0.5, 0, 0.45, 0.3, mat(T, 0xe8423f)); box(T, g, 0.5, 0.7, 0.08, 0, 0.85, 0.52, mat(T, 0xe8423f)); break;
      case 'gauBong': { const m = mat(T, 0xb77a4a); sph(T, g, 0.32, 0, 0.32, 0, m); sph(T, g, 0.22, 0, 0.78, 0.02, m); sph(T, g, 0.08, -0.15, 0.95, 0.02, m); sph(T, g, 0.08, 0.15, 0.95, 0.02, m); sph(T, g, 0.07, 0, 0.74, 0.2, mat(T, 0xe8c8a8)); sph(T, g, 0.09, -0.3, 0.4, 0.1, m); sph(T, g, 0.09, 0.3, 0.4, 0.1, m); break; }
      case 'tranh': cyl(T, g, 0.02, 0.02, 1.5, -0.25, 0.75, 0.1, wood, 6); cyl(T, g, 0.02, 0.02, 1.5, 0.25, 0.75, 0.1, wood, 6); box(T, g, 0.7, 0.55, 0.04, 0, 1.15, 0, mat(T, 0xd4af37)); box(T, g, 0.6, 0.45, 0.01, 0, 1.15, 0.025, mat(T, 0x5fa8d3)); box(T, g, 0.6, 0.15, 0.012, 0, 1.0, 0.026, mat(T, 0x4f8a3c)); break;
      case 'ghematxa': { const m = mat(T, 0x3a2f2a, { roughness: 0.4 }); box(T, g, 0.75, 0.45, 0.8, 0, 0.225, 0.05, m); box(T, g, 0.7, 0.85, 0.2, 0, 0.75, -0.3, m); box(T, g, 0.15, 0.25, 0.7, -0.38, 0.55, 0.05, m); box(T, g, 0.15, 0.25, 0.7, 0.38, 0.55, 0.05, m); box(T, g, 0.4, 0.2, 0.35, 0, 0.12, 0.55, m); break; }
      default: box(T, g, W, 0.5, D, 0, 0.25, 0, wood);
    }
    return g;
  }
  // ---------------------------------------------------------------- cảnh 3D
  function floorTexture(T) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
    for (let i = 0; i < 8; i++) { c.fillStyle = ['#b98a5e', '#c4956a', '#ad7f55', '#bf9064'][i % 4]; c.fillRect(0, i * 32, 256, 32); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, i * 32, 256, 2); c.fillRect((i * 97) % 256, i * 32, 2, 32); }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t;
  }
  function makeScene(canvas, SX, SZ) {
    const T = window.THREE; if (!T) return null;
    let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(); scene.background = new T.Color(0xd9e6ee);
    const cam = new T.PerspectiveCamera(42, 1, 0.1, 100);
    const ft = floorTexture(T); ft.repeat.set(SX / 2, SZ / 2);
    const floor = new T.Mesh(new T.PlaneGeometry(SX, SZ), new T.MeshStandardMaterial({ map: ft, roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.position.set(SX / 2, 0, SZ / 2); floor.receiveShadow = true; scene.add(floor);
    const wallM = new T.MeshStandardMaterial({ color: 0xf2eadf, roughness: 0.95 }), H = 2.8;
    const wb = new T.Mesh(new T.BoxGeometry(SX, H, 0.12), wallM); wb.position.set(SX / 2, H / 2, -0.06); wb.receiveShadow = true; scene.add(wb);
    const wl = new T.Mesh(new T.BoxGeometry(0.12, H, SZ), wallM.clone()); wl.material.color.set(0xe9dfd0); wl.position.set(-0.06, H / 2, SZ / 2); wl.receiveShadow = true; scene.add(wl);
    // cửa sổ + chân tường
    const win = new T.Mesh(new T.PlaneGeometry(1.6, 1.1), new T.MeshBasicMaterial({ color: 0xbfe6ff })); win.position.set(SX * 0.6, 1.6, 0.005); scene.add(win);
    const frameM = new T.MeshStandardMaterial({ color: 0xffffff }); [[0, 0.58, 1.7, 0.06], [0, -0.58, 1.7, 0.06], [0.83, 0, 0.06, 1.2], [-0.83, 0, 0.06, 1.2], [0, 0, 0.04, 1.1]].forEach(([x, y, w, h]) => { const f = new T.Mesh(new T.BoxGeometry(w, h, 0.04), frameM); f.position.set(SX * 0.6 + x, 1.6 + y, 0.02); scene.add(f); });
    const base = new T.MeshStandardMaterial({ color: 0x8a5a3b }); const b1 = new T.Mesh(new T.BoxGeometry(SX, 0.1, 0.02), base); b1.position.set(SX / 2, 0.05, 0.01); scene.add(b1); const b2 = new T.Mesh(new T.BoxGeometry(0.02, 0.1, SZ), base); b2.position.set(0.01, 0.05, SZ / 2); scene.add(b2);
    // lưới ô (hiện khi đang đặt đồ)
    const grid = new T.GridHelper(Math.max(SX, SZ), Math.max(SX, SZ), 0x8a6a4a, 0x8a6a4a); grid.position.set(Math.max(SX, SZ) / 2, 0.012, Math.max(SX, SZ) / 2); grid.material.transparent = true; grid.material.opacity = 0.35; grid.visible = false; scene.add(grid);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a7060, 0.75));
    const sun = new T.DirectionalLight(0xfff2e0, 1.0); sun.position.set(SX * 0.7, 6, SZ + 3); sun.target.position.set(SX / 2, 0, SZ / 2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -SX; sc.right = SX; sc.top = SZ; sc.bottom = -SZ; scene.add(sun, sun.target);
    const itemsG = new T.Group(); scene.add(itemsG);
    const orbit = { yaw: 0.65, pitch: 0.72, dist: Math.max(SX, SZ) * 1.25 + 2 };
    const place = () => { const tx = SX / 2, tz = SZ / 2; cam.position.set(tx + Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist, Math.sin(orbit.pitch) * orbit.dist, tz + Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist); cam.lookAt(tx, 0.4, tz); };
    const size = () => { const w = canvas.clientWidth || 600, h = canvas.clientHeight || 400; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); place();
    return { T, renderer, scene, cam, floor, grid, itemsG, orbit, place, size, ghost: null, dispose() { scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); }); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) { /* */ } } };
  }
  const dims = (it, r) => (r % 2 ? [it.d, it.w] : [it.w, it.d]);
  function placeGroup(g, it, x, z, r) { const [w, d] = dims(it, r); g.position.set(x + w / 2, 0, z + d / 2); g.rotation.y = -r * Math.PI / 2; }
  function rebuild() {
    view = G().decorView();
    const T = three.T; three.itemsG.children.slice().forEach((c) => { three.itemsG.remove(c); c.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); });
    view.items.forEach((d, i) => { const it = cat(d.k); if (!it) return; const g = model(T, d.k, it.w, it.d); placeGroup(g, it, d.x, d.z, d.r); g.userData.idx = i; g.traverse((o) => (o.userData.idx = i)); three.itemsG.add(g); });
    panel();
  }
  const cat = (k) => view.catalog.find((c) => c.k === k);
  function fits(k, x, z, r, skip) {
    const it = cat(k), [w, d] = dims(it, r), [SX, SZ] = view.size;
    if (x < 0 || z < 0 || x + w > SX || z + d > SZ) return false;
    return !view.items.some((o, i) => { if (i === skip || o.k === 'thamtrai' || k === 'thamtrai') return false; const oi = cat(o.k), [ow, od] = dims(oi, o.r); return x < o.x + ow && x + w > o.x && z < o.z + od && z + d > o.z; });
  }
  function setGhost(k, r) {
    const T = three.T; if (three.ghost) { three.scene.remove(three.ghost.userData.pad); three.scene.remove(three.ghost); three.ghost = null; }
    if (!k) { three.grid.visible = false; return; }
    const it = cat(k), g = model(T, k, it.w, it.d);
    g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; o.castShadow = false; } });
    const pad = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: 0x39cf98, transparent: true, opacity: 0.35 })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.02; pad.name = 'pad'; three.scene.add(pad);
    g.userData.pad = pad; three.ghost = g; three.scene.add(g); three.grid.visible = true; g.visible = false; pad.visible = false;
  }
  function moveGhost(x, z) {
    if (!three.ghost || !mode) return; const it = cat(mode.k), [w, d] = dims(it, mode.r);
    x = Math.max(0, Math.min(view.size[0] - w, Math.round(x - w / 2))); z = Math.max(0, Math.min(view.size[1] - d, Math.round(z - d / 2)));
    mode.x = x; mode.z = z; const ok = fits(mode.k, x, z, mode.r, mode.idx);
    placeGroup(three.ghost, it, x, z, mode.r); three.ghost.visible = true;
    const pad = three.ghost.userData.pad; pad.visible = true; pad.scale.set(w, d, 1); pad.position.set(x + w / 2, 0.02, z + d / 2); pad.material.color.set(ok ? 0x39cf98 : 0xff5c5c);
    mode.ok = ok;
  }
  // ---------------------------------------------------------------- giao diện
  function panel() {
    const p = root && root.querySelector('#dcPanel'); if (!p) return;
    const sel = mode && mode.kind === 'sel' ? view.items[mode.idx] : null;
    root.querySelector('#dcInfo').innerHTML = '💰 ' + esc(money(view.money)) + ' · ' + view.items.length + ' món · tiện nghi <b>' + view.comfort + '</b>' + (view.joy ? ' (+' + String(view.joy).replace('.', ',') + ' hạnh phúc/năm)' : '');
    let tools = '';
    if (mode && (mode.kind === 'place' || mode.kind === 'move')) { const it = cat(mode.k); tools = '<div class="dc-tools"><span>' + (mode.kind === 'place' ? 'Đặt ' : 'Di chuyển ') + it.icon + ' ' + esc(it.name) + ': chạm lên sàn</span><button type="button" data-t="rot">↻ Xoay <kbd>R</kbd></button><button type="button" data-t="cancel">✖ Huỷ <kbd>Esc</kbd></button></div>'; }
    else if (sel) { const it = cat(sel.k); tools = '<div class="dc-tools"><span>' + it.icon + ' ' + esc(it.name) + '</span><button type="button" data-t="srot">↻ Xoay</button><button type="button" data-t="move">✥ Di chuyển</button><button type="button" data-t="sell">💰 Bán (' + esc(money(Math.round(it.price * 0.5))) + ')</button><button type="button" data-t="cancel">✖</button></div>'; }
    root.querySelector('#dcTools').innerHTML = tools;
    p.innerHTML = view.catalog.map((c) => '<button type="button" class="dc-item' + (mode && mode.kind === 'place' && mode.k === c.k ? ' on' : '') + '" data-k="' + c.k + '"' + (view.money < c.price ? ' disabled' : '') + '><span class="dc-ic">' + c.icon + '</span><span><b>' + esc(c.name) + '</b><small>' + esc(c.priceText) + ' · tiện nghi +' + c.comfort + ' · ' + c.w + '×' + c.d + ' m</small></span></button>').join('');
  }
  function msg(t, bad) { const el = root && root.querySelector('#dcMsg'); if (el) { el.textContent = t; el.className = 'dc-msg' + (bad ? ' bad' : ''); } }
  function open() {
    if (!G() || !G().hasLife() || G().isDead()) return;
    close();
    view = G().decorView();
    root = document.createElement('div'); root.className = 'hax decor';
    root.innerHTML = '<div class="hax-box"><div class="dc-head"><b>🛋️ ' + (view.home ? 'Nhà riêng của bạn' : 'Phòng trọ của bạn') + ' · ' + view.size[0] + '×' + view.size[1] + ' m</b><span class="dc-saved">Đồ đạc tự lưu · <kbd>Esc</kbd> để thoát</span><button type="button" class="btn btn-primary btn-sm" id="dcDone">✖ Thoát</button></div><div class="dc-main"><div class="dc-view"><canvas id="dcCv"></canvas><div id="dcTools"></div><p class="dc-msg" id="dcMsg">Chọn món đồ bên cạnh rồi chạm lên sàn để đặt. Chạm vào đồ đã đặt để xoay, di chuyển hoặc bán. Kéo để xoay góc nhìn.</p></div><div class="dc-side"><div class="dc-info" id="dcInfo"></div><div class="dc-cat" id="dcPanel"></div></div></div></div>';
    document.body.appendChild(root);
    root.addEventListener('keydown', (e) => e.stopPropagation());
    const cv = root.querySelector('#dcCv');
    three = makeScene(cv, view.size[0], view.size[1]);
    if (!three) { msg('Trình duyệt không hỗ trợ 3D.', true); return; }
    rebuild();
    root.querySelector('#dcDone').onclick = () => close();
    root.querySelector('#dcPanel').onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; mode = { kind: 'place', k: b.dataset.k, r: 0 }; setGhost(mode.k, 0); sfx('click'); panel(); msg('Chạm lên sàn để đặt. Ô xanh là đặt được, ô đỏ là vướng.'); };
    root.querySelector('#dcTools').onclick = (e) => {
      const t = e.target.closest('[data-t]'); if (!t) return; const a = t.dataset.t;
      if (a === 'rot' && mode) { mode.r = (mode.r + 1) % 4; setGhost(mode.k, mode.r); if (mode.x != null) moveGhost(mode.x + cat(mode.k).w / 2, mode.z + cat(mode.k).d / 2); }
      else if (a === 'cancel') { mode = null; setGhost(null); panel(); }
      else if (a === 'srot' && mode && mode.kind === 'sel') { const d = view.items[mode.idx], r = G().decorMove(mode.idx, d.x, d.z, (d.r + 1) % 4); if (r.ok === false) msg(r.reason, true); else { sfx('click'); rebuild(); } }
      else if (a === 'move' && mode && mode.kind === 'sel') { const d = view.items[mode.idx]; mode = { kind: 'move', idx: mode.idx, k: d.k, r: d.r }; setGhost(d.k, d.r); panel(); msg('Chạm lên sàn để chuyển món đồ tới đó.'); }
      else if (a === 'sell' && mode && mode.kind === 'sel') { const r = G().decorSell(mode.idx); mode = null; if (r.ok === false) msg(r.reason, true); else { sfx('notify'); msg('Đã bán lại, thu về ' + r.back + '.'); rebuild(); } }
    };
    // chuột/chạm: kéo để xoay góc nhìn, chạm để đặt/chọn
    const ray = new three.T.Raycaster(), ndc = new three.T.Vector2();
    let down = null;
    const at = (e) => { const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); three.scene.updateMatrixWorld(); three.cam.updateMatrixWorld(); ray.setFromCamera(ndc, three.cam); };
    const floorHit = () => { const h = ray.intersectObject(three.floor)[0]; return h ? h.point : null; };
    cv.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, yaw: three.orbit.yaw, pitch: three.orbit.pitch, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => {
      if (down) { const dx = e.clientX - down.x, dy = e.clientY - down.y; if (Math.abs(dx) + Math.abs(dy) > 6) down.moved = true; if (down.moved && !(mode && (mode.kind === 'place' || mode.kind === 'move') && e.pointerType !== 'mouse')) { three.orbit.yaw = Math.max(-0.25, Math.min(1.85, down.yaw - dx * 0.008)); three.orbit.pitch = Math.max(0.3, Math.min(1.25, down.pitch + dy * 0.006)); three.place(); } }
      if (mode && (mode.kind === 'place' || mode.kind === 'move')) { at(e); const p = floorHit(); if (p) moveGhost(p.x, p.z); }
    });
    cv.addEventListener('pointerup', (e) => {
      const wasDrag = down && down.moved; down = null; if (wasDrag && !(mode && mode.kind !== 'sel' && e.pointerType !== 'mouse')) return;
      at(e);
      if (mode && (mode.kind === 'place' || mode.kind === 'move')) {
        const p = floorHit(); if (!p) return; moveGhost(p.x, p.z);
        if (!mode.ok) { msg('Chỗ này không đủ rộng hoặc bị vướng đồ khác.', true); sfx('fail'); return; }
        const r = mode.kind === 'place' ? G().decorBuy(mode.k, mode.x, mode.z, mode.r) : G().decorMove(mode.idx, mode.x, mode.z, mode.r);
        if (r.ok === false) { msg(r.reason, true); sfx('fail'); return; }
        sfx(mode.kind === 'place' ? 'good' : 'click'); msg(mode.kind === 'place' ? 'Đã mua và đặt ' + cat(mode.k).name.toLowerCase() + '.' : 'Đã chuyển chỗ.');
        mode = null; setGhost(null); rebuild(); return;
      }
      const hit = ray.intersectObjects(three.itemsG.children, true)[0];
      if (hit && hit.object.userData.idx != null) { mode = { kind: 'sel', idx: hit.object.userData.idx }; sfx('click'); panel(); }
      else if (mode) { mode = null; panel(); }
    });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); three.orbit.dist = Math.max(4, Math.min(30, three.orbit.dist * (e.deltaY > 0 ? 1.08 : 0.92))); three.place(); }, { passive: false });
    const key = (e) => { if (!root) return; const k = e.key.toLowerCase(); if (k === 'escape') { if (mode) { mode = null; setGhost(null); panel(); } else close(); e.preventDefault(); e.stopPropagation(); } else if (k === 'r' && mode && mode.kind !== 'sel') { mode.r = (mode.r + 1) % 4; setGhost(mode.k, mode.r); e.preventDefault(); e.stopPropagation(); } };
    window.addEventListener('keydown', key, true); root._key = key;
    const onResize = () => three && three.size(); window.addEventListener('resize', onResize); root._resize = onResize;
    const loop = () => { if (!root || !three) return; three.renderer.render(three.scene, three.cam); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    requestAnimationFrame(() => three && three.size());
  }
  function close() {
    cancelAnimationFrame(raf); raf = 0; mode = null;
    if (root) { if (root._key) window.removeEventListener('keydown', root._key, true); if (root._resize) window.removeEventListener('resize', root._resize); }
    if (three) { three.dispose(); three = null; }
    if (root) { root.remove(); root = null; try { KN.UI && KN.UI.render && KN.UI.render(); } catch (e) { /* */ } try { const sc = KN.Game.homeScene && KN.Game.homeScene(); if (sc && KN.World && KN.World.playScene) KN.World.playScene(sc); } catch (e) { /* */ } }
  }
  // dựng một món đồ cho cảnh 3D khác (cảnh Nhà trong world): w, d là số ô 1 m
  KN.Decor = { open, close, model: (k, w, d) => (window.THREE ? model(window.THREE, k, w, d) : null) };
})();
