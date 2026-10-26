/* Một Kiếp Người — minigame 🗡️ "Hầm ngục Dreadfall" (đăng ký vào KN.Mini), kiểu hành động đi lại tự do như Dungeon Quest.
   Mô hình 3D lấy từ bộ DREADFALL — Dark Fantasy Dungeon Kit (assets/dread/*.glb, mô hình tĩnh, màu theo đỉnh).
   Game tự đọc GLB (không cần GLTFLoader) và dựng bằng three.js sẵn có; không có WebGL thì báo lỗi nhẹ nhàng và tính như bỏ cuộc.
   Điều khiển: WASD/mũi tên di chuyển · Space/J hoặc click = chém (tự ngắm kẻ gần nhất) · Shift/K = lướt (né, bất tử ngắn) · E/Q = uống thuốc.
   Điện thoại: cần joystick bên trái + nút bên phải.
   3 tầng: Hành lang Xương → Hầm Tro → Ngai của Vua Rỗng. Mỗi tầng có đợt quái, hạ hết thì nhặt rương để xuống tầng. Điểm = số tầng vượt qua + máu còn lại. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const BASE = 'assets/dread/';

  // ---------------------------------------------------------------- CONFIG cân bằng (con số gốc theo game_data.json của bộ DREADFALL, đã chỉnh cho thời gian thực)
  const DR_CFG = {
    baseHP: 70, hpPerHealth: 0.7, defBase: 8, defPerHealth: 0.1, hurtCut: 0.28, potionHeal: 35, potions: 2,
    speed: 4.3, speedPerHealth: 0.006, dash: { speed: 13, time: 0.2, iframes: 0.3, cd: 1.1 }, crit: { base: 0.08, perSmarts: 0.001, mul: 1.6 },
    weapons: [
      { key: 'weapon_iron_sword', name: 'Kiếm sắt', atk: 15, range: 1.9, cd: 0.62, h: 1.7 },
      { key: 'weapon_grave_axe', name: 'Rìu Mộ', atk: 22, range: 2.1, cd: 0.72, h: 1.5 },
      { key: 'weapon_nightfang', name: 'Nanh Đêm', atk: 34, range: 2.4, cd: 0.62, h: 2.1 },
    ],
    restHeal: 0.35, maxSecs: 300,
    mobs: {
      goblin: { model: 'monster_gutter_goblin', h: 1.6, hp: 70, speed: 3.4, dmg: 10, reach: 1.35, wind: 0.32, cd: 0.8, r: 0.45, name: 'Yêu tinh cống' },
      skeleton: { model: 'monster_bone_skeleton', h: 2.05, hp: 130, speed: 2.6, dmg: 15, reach: 1.55, wind: 0.5, cd: 1.05, r: 0.5, name: 'Bộ xương' },
      wraith: { model: 'monster_crypt_wraith', h: 1.8, hp: 125, speed: 2.2, dmg: 16, reach: 5.2, wind: 0.55, cd: 1.7, r: 0.5, ranged: true, float: 0.45, name: 'Bóng ma' },
      boss: { model: 'boss_ashen_knight', h: 3.4, hp: 900, speed: 2.4, dmg: 24, reach: 2.4, wind: 0.65, cd: 1.3, r: 1.0, boss: true, name: 'Hiệp sĩ Tro' },
    },
    floors: [
      { name: 'Hành lang Xương', env: 'environment_bone_passage', bx: 2.6, bz: 6.2, waves: [['goblin', 'goblin', 'goblin'], ['skeleton', 'goblin', 'goblin'], ['skeleton', 'skeleton', 'goblin']], loot: ['loot_health_potion', 'Bình máu đỏ thẫm'] },
      { name: 'Hầm Tro', env: 'environment_crypt_of_ash', bx: 3.6, bz: 3.6, waves: [['skeleton', 'skeleton', 'goblin'], ['wraith', 'skeleton', 'skeleton'], ['wraith', 'wraith', 'goblin', 'goblin']], loot: ['loot_soul_crystal', 'Tinh thể linh hồn'] },
      { name: 'Ngai của Vua Rỗng', env: 'environment_hollow_throne', bx: 4.4, bz: 4.2, waves: [['boss']], loot: ['loot_ashen_chest', 'Rương Tro'] },
    ],
  };

  // ---------------------------------------------------------------- khung chung
  let root = null, keyH = null, keyU = null, timers = [], raf = 0, R = null;
  function open(html) {
    close();
    root = document.createElement('div'); root.className = 'mini'; root.innerHTML = '<div class="mini-box dr-box">' + html + '</div>';
    document.body.appendChild(root);
    if (KN.Mini && KN.Mini.playing && KN.Mini.playing()) { const qb = document.createElement('button'); qb.type = 'button'; qb.className = 'mini-quit'; qb.textContent = '✖ Thoát'; qb.title = 'Bỏ dở minigame'; qb.onclick = () => { if (KN.Mini.abort) KN.Mini.abort(); }; root.appendChild(qb); }
    return root;
  }
  function close() {
    timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers = []; cancelAnimationFrame(raf); raf = 0;
    if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (keyU) { window.removeEventListener('keyup', keyU, true); keyU = null; }
    if (R) { try { R.dispose(); } catch (e) { /* */ } R = null; }
    if (root) { root.remove(); root = null; }
  }
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  // ---------------------------------------------------------------- đọc tệp GLB (mô hình tĩnh, POSITION + COLOR_0 + chỉ số)
  const cache = {};
  function parseGlb(buf) {
    const dv = new DataView(buf), jl = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
    const bin = 20 + jl + 8;
    const read = (i) => {
      const a = json.accessors[i], bv = json.bufferViews[a.bufferView], off = bin + (bv.byteOffset || 0) + (a.byteOffset || 0), n = { SCALAR: 1, VEC3: 3, VEC4: 4 }[a.type];
      if (a.componentType === 5126) return { n, a: new Float32Array(buf.slice(off, off + a.count * n * 4)) };
      if (a.componentType === 5125) return { n, a: new Uint32Array(buf.slice(off, off + a.count * n * 4)) };
      if (a.componentType === 5123) return { n, a: new Uint16Array(buf.slice(off, off + a.count * n * 2)) };
      if (a.componentType === 5121) return { n, a: new Uint8Array(buf.slice(off, off + a.count * n)), norm: true };
      throw new Error('kiểu dữ liệu GLB chưa hỗ trợ');
    };
    const P = [], C = [], I = []; let base = 0;
    json.meshes.forEach((m) => m.primitives.forEach((p) => {
      const pos = read(p.attributes.POSITION), col = p.attributes.COLOR_0 != null ? read(p.attributes.COLOR_0) : null, cnt = pos.a.length / 3;
      for (let i = 0; i < pos.a.length; i++) P.push(pos.a[i]);
      for (let i = 0; i < cnt; i++) { if (col) { const k = col.n, s = col.norm ? 255 : 1; C.push(col.a[i * k] / s, col.a[i * k + 1] / s, col.a[i * k + 2] / s); } else C.push(0.7, 0.7, 0.7); }
      if (p.indices != null) { const ix = read(p.indices).a; for (let i = 0; i < ix.length; i++) I.push(ix[i] + base); } else for (let i = 0; i < cnt; i++) I.push(base + i);
      base += cnt;
    }));
    return { pos: new Float32Array(P), col: new Float32Array(C), idx: new Uint32Array(I) };
  }
  function loadGlb(name) {
    if (!cache[name]) { cache[name] = fetch(BASE + name + '.glb').then((r) => { if (!r.ok) throw new Error('404'); return r.arrayBuffer(); }).then(parseGlb); cache[name].catch(() => { delete cache[name]; }); }
    return cache[name];
  }
  const webgl = () => { try { const c = document.createElement('canvas'); return !!(window.THREE && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } };

  // ---------------------------------------------------------------- dựng cảnh 3D
  function makeStage(canvas) {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    const scene = new T.Scene(); scene.background = new T.Color(0x0b0810); scene.fog = new T.Fog(0x0b0810, 12, 30);
    const cam = new T.PerspectiveCamera(46, 2, 0.1, 80);
    scene.add(new T.HemisphereLight(0x9a96c8, 0x2e1c14, 1.0));
    const key = new T.DirectionalLight(0xffe6c4, 0.85); key.position.set(-4, 9, 5); scene.add(key);
    const torch = new T.PointLight(0xff8a3c, 1.3, 14); torch.position.set(0, 3.2, 0); scene.add(torch);
    const mat = new T.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    const geos = {}, owned = [];
    const geoOf = async (name) => {
      if (geos[name]) return geos[name];
      const g = await loadGlb(name), geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(g.pos, 3)); geo.setAttribute('color', new T.BufferAttribute(g.col, 3)); geo.setIndex(new T.BufferAttribute(g.idx, 1)); geo.computeVertexNormals(); geo.computeBoundingBox();
      owned.push(geo); return (geos[name] = geo);
    };
    const stage = {
      T, renderer, scene, cam, torch,
      resize() { const w = canvas.clientWidth || 640, h = canvas.clientHeight || 300; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); },
      // một thực thể: nhóm đã chuẩn hóa về chiều cao h, chân đặt ở y=0, nhìn về +z
      async spawn(name, h, flash) {
        const geo = await geoOf(name), bb = geo.boundingBox, s = h / (bb.max.y - bb.min.y), grp = new T.Group(), m = flash ? mat.clone() : mat, mesh = new T.Mesh(geo, m);
        mesh.position.set(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -(bb.max.z + bb.min.z) / 2); grp.add(mesh); grp.scale.setScalar(s); scene.add(grp);
        return { grp, mesh, mat: m, scale: s, remove() { scene.remove(grp); if (flash) m.dispose(); } };
      },
      async setEnv(name) {
        const geo = await geoOf(name); if (stage.env) scene.remove(stage.env);
        const grp = new T.Group(); grp.add(new T.Mesh(geo, mat)); grp.position.set(0, -0.06, 0); scene.add(grp); stage.env = grp;
        if (!stage.ground) { stage.ground = new T.Mesh(new T.CircleGeometry(30, 24), new T.MeshLambertMaterial({ color: 0x17121e })); stage.ground.rotation.x = -Math.PI / 2; stage.ground.position.y = -0.3; scene.add(stage.ground); }
      },
      render(t) { torch.intensity = 1.25 + Math.sin(t * 9) * 0.16 + Math.sin(t * 23) * 0.08; renderer.render(scene, cam); },
      dispose() { owned.forEach((g) => g.dispose()); mat.dispose(); renderer.dispose(); },
    };
    return stage;
  }

  // ---------------------------------------------------------------- minigame
  function dread(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, need = p.need != null ? p.need : 0.5, C = DR_CFG;
      const maxHP = Math.round(C.baseHP + st.health * C.hpPerHealth), defense = C.defBase + st.health * C.defPerHealth;
      const hpMul = 0.85 + need * 0.3, dmgMul = 0.9 + need * 0.25, critP = C.crit.base + st.smarts * C.crit.perSmarts, spd = C.speed * (1 + (st.health - 50) * C.speedPerHealth);
      const box = open('<div class="mini-head"><b>🗡️ Hầm ngục Dreadfall</b><small id="drF"></small></div>' +
        '<div class="dr-stage" id="drSt"><canvas id="drCv" class="dr-cv" role="img" aria-label="Cảnh hầm ngục 3D: bạn di chuyển và chém quái"></canvas>' +
        '<div class="dr-hud"><div class="dr-bar me"><i id="drMe"></i><span id="drMeT"></span></div><div class="dr-bar foe"><i id="drFoe"></i><span id="drFoeT"></span></div></div>' +
        '<div class="dr-float" id="drFl" aria-live="polite"></div><div class="dr-banner" id="drBn"></div>' +
        '<div class="dr-joy" id="drJoy" hidden><i id="drKnob"></i></div></div>' +
        '<p class="dr-msg" id="drMsg"></p>' +
        '<div class="mini-btns dr-btns"><button type="button" class="btn btn-primary" id="drBtA">⚔️ Chém <kbd>Space</kbd></button><button type="button" class="btn btn-soft" id="drBtD">💨 Lướt <kbd>Shift</kbd> <small id="drCd"></small></button><button type="button" class="btn btn-soft" id="drBtP">🧪 Thuốc <kbd>E</kbd> <small id="drPot"></small></button></div>' +
        '<p class="mini-keys">⌨️ <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> di chuyển · <kbd>Space</kbd>/<kbd>J</kbd>/click chém (tự ngắm kẻ gần nhất) · <kbd>Shift</kbd>/<kbd>K</kbd> lướt né · <kbd>E</kbd>/<kbd>Q</kbd> thuốc · Điện thoại: cần bên trái, nút bên dưới</p>');
      const $ = (s) => box.querySelector(s), msgEl = $('#drMsg'), flEl = $('#drFl'), bnEl = $('#drBn'), cv = $('#drCv'), stEl = $('#drSt');
      const say = (t) => { msgEl.textContent = t; };
      if (!webgl()) { later(() => finish('Trình duyệt này không hiển thị được cảnh 3D nên bạn không vào được hầm ngục.'), 100); say('Cần WebGL để chơi minigame này.'); return; }
      let S;
      try { S = makeStage(cv); } catch (e) { later(() => finish('Không dựng được cảnh 3D.'), 100); return; }
      R = S; S.resize(); const onResize = () => S.resize(); window.addEventListener('resize', onResize); const od = S.dispose; S.dispose = () => { window.removeEventListener('resize', onResize); od(); };
      const T = S.T, V3 = (x, y, z) => new T.Vector3(x, y, z);
      // ---- trạng thái
      let hp = maxHP, potions = C.potions, weaponI = 0, floorI = 0, cleared = 0, waveI = 0, kills = 0, floorKills = 0, floorTotal = 1, done = false, phase = 'load', ended = false;
      const tStart = performance.now(); let tNow = 0, bounds = { x: 3, z: 3 }, loot = null, lootT = 0, bossAdds = false;
      const hero = { x: 0, z: 0, fx: 0, fz: -1, vx: 0, vz: 0, atkT: 0, atkAnim: 0, dashT: 0, dashCd: 0, inv: 0, ent: null, weapon: null, hurtT: 0, r: 0.4 };
      let mobs = [], bolts = [], zones = [], keys = {}, joy = { x: 0, z: 0 }, atkQueued = false, floors = [];
      const W = () => C.weapons[weaponI];
      const bars = () => {
        $('#drMe').style.width = clamp(hp / maxHP * 100, 0, 100) + '%'; $('#drMeT').textContent = 'Bạn ' + Math.max(0, Math.round(hp)) + '/' + maxHP;
        const alive = mobs.filter((m) => m.hp > 0), tot = alive.reduce((a, m) => a + m.hp, 0), mx = alive.reduce((a, m) => a + m.max, 0);
        $('#drFoe').style.width = (mx ? clamp(tot / mx * 100, 0, 100) : 0) + '%'; $('#drFoeT').textContent = alive.length ? (alive.length === 1 && alive[0].def.boss ? alive[0].def.name : 'Quái còn ' + alive.length) + ' · đợt ' + (waveI + 1) + '/' + C.floors[floorI].waves.length : (phase === 'loot' ? 'Nhặt rương!' : '…');
        $('#drPot').textContent = '×' + potions; $('#drF').textContent = 'Tầng ' + (floorI + 1) + '/3 · ' + C.floors[floorI].name + ' · ' + W().name;
        const cd = Math.max(0, hero.dashCd); $('#drCd').textContent = cd > 0.05 ? cd.toFixed(1) + 's' : '';
      };
      const banner = (t, ms) => { bnEl.textContent = t; bnEl.classList.add('on'); later(() => bnEl.classList.remove('on'), ms || 1600); };
      const fl = (txt, cls, x, z, y) => { const e = document.createElement('b'); e.className = cls || ''; e.textContent = txt; e._p = { x, z, y: y || 1.8, t: 0 }; flEl.appendChild(e); setTimeout(() => e.remove(), 900); };
      const cross = (d) => { const b = S.cam; const v = V3(d.x, d.y, d.z).project(b); return { x: (v.x * 0.5 + 0.5) * cv.clientWidth, y: (-v.y * 0.5 + 0.5) * cv.clientHeight }; };
      // ---- kết thúc
      function score() { const fr = floorTotal ? clamp(floorKills / floorTotal, 0, 0.99) : 0; return clamp((cleared + (cleared >= 3 ? 0 : fr)) / 3 * 0.85 + (cleared >= 3 ? 0.15 * clamp(hp / maxHP, 0, 1) : 0), 0, 1); }
      function finish(why) {
        if (ended) return; ended = true; done = true;
        const sc = score(), fn = C.floors[Math.min(floorI, 2)];
        later(() => res({ score: sc, text: (cleared >= 3 ? 'Bạn hạ Hiệp sĩ Tro và thoát khỏi hầm ngục' + (hp > 0 ? ' với ' + Math.round(hp) + ' máu.' : '.') : cleared > 0 ? 'Bạn vượt qua ' + cleared + ' tầng, gục ở ' + fn.name + '.' : hp > 0 && !why ? 'Bạn bỏ dở ngay tầng đầu.' : 'Bạn gục ngay ở tầng đầu.') + (why ? ' ' + why : '') + ' (hạ ' + kills + ' quái)' }), 1100);
      }
      // ---- tầng và đợt quái
      async function loadFloor(i) {
        phase = 'load'; floorI = i; waveI = 0; floorKills = 0; bossAdds = false; const f = C.floors[i]; bounds = { x: f.bx, z: f.bz };
        floorTotal = f.waves.reduce((a, w) => a + w.length, 0); mobs.forEach((m) => m.ent && m.ent.remove()); mobs = []; bolts.forEach((b) => S.scene.remove(b.mesh)); bolts = []; zones.forEach((z) => S.scene.remove(z.mesh)); zones = [];
        if (loot) { loot.remove(); loot = null; }
        say('Đang bước xuống ' + f.name + '…'); bars();
        const need2 = [S.setEnv(f.env)]; if (!hero.ent) need2.push(S.spawn('character_hollow_knight', 2.0).then((e) => { hero.ent = e; }));
        await Promise.all(need2); if (done) return;
        await equip(); hero.x = 0; hero.z = bounds.z - 0.9; hero.fx = 0; hero.fz = -1; hero.inv = 1.2;
        banner('Tầng ' + (i + 1) + ' — ' + f.name, 1800); say('Di chuyển bằng WASD, chém bằng Space.'); phase = 'fight'; await spawnWave(); bars();
      }
      async function equip() {
        const w = W(); if (hero.weapon && hero.weapon.name === w.key) return; if (hero.weapon) { hero.weapon.ent.remove(); hero.weapon = null; }
        const ent = await S.spawn(w.key, w.h); if (done) return; ent.grp.rotation.x = -Math.PI / 2; hero.weapon = { name: w.key, ent }; // cầm nằm ngang, dựng lại khi vung
      }
      async function spawnWave() {
        const f = C.floors[floorI], list = f.waves[waveI]; const made = await Promise.all(list.map((k, idx) => makeMob(k, idx, list.length))); if (done) return; mobs.push(...made); bars();
      }
      async function makeMob(kind, idx, n) {
        const def = C.mobs[kind], ent = await S.spawn(def.model, def.h, true), ang = (idx / Math.max(1, n)) * Math.PI * 2 + rand(-0.4, 0.4), rr = Math.min(bounds.x, bounds.z) * 0.6;
        const m = { kind, def, ent, x: clamp(Math.sin(ang) * rr * 1.1, -bounds.x, bounds.x), z: clamp(-bounds.z * 0.55 + Math.cos(ang) * rr * 0.5, -bounds.z, bounds.z), hp: Math.round(def.hp * hpMul), max: 0, state: 'chase', t: rand(0.4, 1.2), cd: rand(0.5, 1.2), fx: 0, fz: 1, flash: 0, slamCd: rand(2.5, 4), chargeCd: rand(4, 6), vx: 0, vz: 0, dying: 0, aim: null, moveType: null };
        m.max = m.hp; if (def.float) m.fy = def.float; return m;
      }
      // ---- vòng lặp
      const clampB = (o) => { o.x = clamp(o.x, -bounds.x, bounds.x); o.z = clamp(o.z, -bounds.z, bounds.z); };
      function hurtHero(raw, label) {
        if (hero.inv > 0 || phase === 'end') return false; const d = Math.max(2, Math.round(raw * dmgMul - defense * C.hurtCut)); hp -= d; hero.hurtT = 0.25; hero.inv = 0.35; fl('-' + d, 'me', hero.x, hero.z, 2.1); sfx('bad'); bars();
        if (hp <= 0) { phase = 'end'; say('Bạn gục xuống… ' + (label || '')); finish(''); } return true;
      }
      function mobStrike(m, dx, dz, dist) {
        const d = m.def; if (d.ranged) { const dir = V3(dx / dist, 0, dz / dist), mesh = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), new T.MeshBasicMaterial({ color: 0xb78bff })); mesh.position.set(m.x, 1.2, m.z); S.scene.add(mesh); bolts.push({ mesh, x: m.x, z: m.z, vx: dir.x * 5.6, vz: dir.z * 5.6, life: 3.2, dmg: d.dmg }); sfx('click'); return; }
        const ddx = hero.x - m.x, ddz = hero.z - m.z, dd = Math.hypot(ddx, ddz); if (dd <= d.reach + hero.r + (d.boss ? 0.6 : 0)) hurtHero(d.dmg, d.name + ' giáng đòn.');
      }
      function addZone(x, z, r, delay, dmg, color, owner) { const mesh = new T.Mesh(new T.CircleGeometry(r, 28), new T.MeshBasicMaterial({ color: color || 0xff3322, transparent: true, opacity: 0.25, depthWrite: false })); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, 0.05, z); S.scene.add(mesh); zones.push({ mesh, x, z, r, t: 0, delay, dmg, owner }); }
      function updateMob(m, dt) {
        const d = m.def, dx = hero.x - m.x, dz = hero.z - m.z, dist = Math.hypot(dx, dz) || 0.001; m.flash = Math.max(0, m.flash - dt); m.cd -= dt;
        if (m.dying > 0) { m.dying -= dt; return; }
        const face = () => { m.fx = dx / dist; m.fz = dz / dist; };
        if (m.state === 'chase') {
          face(); let want = 0;
          if (d.ranged) { if (dist < 3.4) want = -1; else if (dist > 5.6) want = 1; } else want = dist > d.reach * 0.85 ? 1 : 0;
          const sp = d.speed * (d.boss ? 1 : 1); m.x += m.fx * sp * want * dt; m.z += m.fz * sp * want * dt;
          if (d.ranged && want === 0) { m.x += -m.fz * 0.9 * dt * Math.sin(tNow * 1.3); m.z += m.fx * 0.9 * dt * Math.sin(tNow * 1.3); }
          if (m.cd <= 0 && dist <= d.reach + hero.r + (d.boss ? 0.8 : 0.1)) { m.state = 'wind'; m.t = d.wind; m.aim = { x: m.fx, z: m.fz, d: dist }; m.moveType = 'melee'; if (d.boss) { if (m.slamCd <= 0 && dist < 3.4) { m.moveType = 'slam'; m.t = 1.05; addZone(m.x + m.fx * 1.2, m.z + m.fz * 1.2, 2.5, 1.05, d.dmg * 1.5, 0xff3322, m); m.slamCd = rand(3.2, 5); } else if (m.chargeCd <= 0) { m.moveType = 'charge'; m.t = 0.85; m.chargeCd = rand(5, 7); } } }
          else if (d.boss && m.cd <= 0 && dist > 4.5 && m.chargeCd <= 0) { m.state = 'wind'; m.moveType = 'charge'; m.t = 0.85; m.aim = { x: m.fx, z: m.fz, d: dist }; m.chargeCd = rand(5, 7); }
          else if (d.ranged && m.cd <= 0 && dist < d.reach) { m.state = 'wind'; m.moveType = 'bolt'; m.t = d.wind; }
          m.slamCd -= dt; m.chargeCd -= dt;
        } else if (m.state === 'wind') {
          if (m.moveType !== 'charge') face(); m.t -= dt;
          if (m.t <= 0) {
            if (m.moveType === 'charge') { m.state = 'rush'; m.t = 0.5; m.aim = { x: dx / dist, z: dz / dist }; }
            else { if (m.moveType === 'bolt') mobStrike(m, dx, dz, dist); else if (m.moveType === 'melee') { m.lunge = 0.12; mobStrike(m, dx, dz, dist); } m.state = 'rec'; m.t = 0.35; m.cd = d.cd * rand(0.9, 1.15); }
          }
        } else if (m.state === 'rush') {
          m.t -= dt; m.x += m.aim.x * 10 * dt; m.z += m.aim.z * 10 * dt; m.fx = m.aim.x; m.fz = m.aim.z;
          if (Math.hypot(hero.x - m.x, hero.z - m.z) < d.r + hero.r + 0.6) { if (hurtHero(d.dmg * 1.2, 'Hiệp sĩ Tro húc trúng bạn.')) { m.t = 0; } }
          if (m.t <= 0) { m.state = 'rec'; m.t = 0.6; m.cd = d.cd; }
        } else if (m.state === 'rec') { m.t -= dt; if (m.t <= 0) m.state = 'chase'; }
        clampB(m);
        if (d.boss && !bossAdds && m.hp < m.max * 0.5) { bossAdds = true; banner('Hiệp sĩ Tro triệu hồi bộ xương!', 1600); Promise.all([makeMob('skeleton', 0, 2), makeMob('skeleton', 1, 2)]).then((a) => { if (!done) { mobs.push(...a); floorTotal += 2; bars(); } }); }
      }
      function separate() { const all = [hero].concat(mobs.filter((m) => m.hp > 0).map((m) => ({ o: m, x: m.x, z: m.z, r: m.def.r })) ); const ent = mobs.filter((m) => m.hp > 0); for (let i = 0; i < ent.length; i++) for (let j = i + 1; j < ent.length; j++) { const a = ent[i], b = ent[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 0.001, min = a.def.r + b.def.r; if (d < min) { const push = (min - d) / 2; a.x -= dx / d * push; a.z -= dz / d * push; b.x += dx / d * push; b.z += dz / d * push; } } void all; }
      function targetNear(range) { let best = null, bd = range; for (const m of mobs) { if (m.hp <= 0) continue; const d = Math.hypot(m.x - hero.x, m.z - hero.z) - m.def.r; if (d < bd) { bd = d; best = m; } } return best; }
      function swing() {
        const w = W(); hero.atkT = w.cd; hero.atkAnim = 0.22; const tg = targetNear(w.range + 1.6); if (tg) { const dx = tg.x - hero.x, dz = tg.z - hero.z, d = Math.hypot(dx, dz) || 1; hero.fx = dx / d; hero.fz = dz / d; }
        sfx('click'); let hit = 0;
        for (const m of mobs) {
          if (m.hp <= 0) continue; const dx = m.x - hero.x, dz = m.z - hero.z, d = Math.hypot(dx, dz) - m.def.r; if (d > w.range) continue;
          const dot = (dx * hero.fx + dz * hero.fz) / (Math.hypot(dx, dz) || 1); if (dot < Math.cos(Math.PI * 0.42)) continue;
          const crit = Math.random() < critP, dmg = Math.round(w.atk * rand(0.9, 1.1) * (crit ? C.crit.mul : 1)); m.hp -= dmg; m.flash = 0.14; m.state = m.state === 'wind' && !m.def.boss && dmg > m.max * 0.45 ? 'chase' : m.state; const kb = m.def.boss ? 0.1 : 0.45; m.x += dx / (Math.hypot(dx, dz) || 1) * kb; m.z += dz / (Math.hypot(dx, dz) || 1) * kb; fl((crit ? '💥' : '') + dmg, 'foe' + (crit ? ' crit' : ''), m.x, m.z, m.def.h + 0.4); hit++;
          if (m.hp <= 0) { m.dying = 0.45; kills++; floorKills++; sfx('kick'); }
        }
        if (hit) { sfx('kick'); bars(); }
      }
      function dash() { if (hero.dashCd > 0 || hero.dashT > 0) return; let dx = keys.d - keys.a + joy.x, dz = keys.s - keys.w + joy.z; const l = Math.hypot(dx, dz); if (l < 0.1) { dx = -hero.fx; dz = -hero.fz; } else { dx /= l; dz /= l; } hero.dvx = dx; hero.dvz = dz; hero.dashT = C.dash.time; hero.inv = Math.max(hero.inv, C.dash.iframes); hero.dashCd = C.dash.cd; sfx('click'); }
      function potion() { if (potions <= 0 || hp >= maxHP || phase === 'end') return; potions--; const h = Math.min(C.potionHeal, maxHP - hp); hp += h; fl('+' + Math.round(h), 'me heal', hero.x, hero.z, 2.1); sfx('good'); bars(); }
      function winFloor() {
        cleared++; phase = 'loot'; sfx('cheer'); const f = C.floors[floorI];
        S.spawn(f.loot[0], 1.0).then((e) => { if (done) { e.remove(); return; } loot = e; e.grp.position.set(0, 0.3, -bounds.z * 0.15); loot.baseY = 0.3; });
        if (cleared >= 3) { phase = 'end'; banner('Chiến thắng!', 1800); say('Hiệp sĩ Tro gục ngã. Hầm ngục im lặng.'); finish(''); return; }
        banner('Hạ hết quái! Nhặt ' + f.loot[1].toLowerCase(), 2000); say('Đi tới rương phát sáng ở giữa phòng.'); bars();
      }
      function takeLoot() {
        const f = C.floors[floorI]; let txt = 'Nhặt được ' + f.loot[1].toLowerCase() + '.'; if (f.loot[0] === 'loot_health_potion') potions++;
        if (weaponI < C.weapons.length - 1 && floorI < 2) { weaponI = Math.min(floorI + 1, C.weapons.length - 1); txt += ' Trang bị ' + W().name + ' (+' + W().atk + ' tấn công).'; }
        const rest = Math.round(maxHP * C.restHeal); hp = Math.min(maxHP, hp + rest); txt += ' Hồi ' + rest + ' máu.'; sfx('coin'); say(txt); bars();
        if (loot) { loot.remove(); loot = null; } phase = 'load'; later(() => loadFloor(floorI + 1).catch(() => finish('Không tải được tầng kế tiếp.')), 900);
      }
      let last = performance.now();
      const frame = (ts) => {
        raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
        if (window.__dreadManual) return; sim(dt); draw(dt);
      };
      function sim(dt) {
        tNow += dt;
        if (!done && tNow > C.maxSecs) { say('Hết giờ.'); finish('Hết giờ.'); }
        if (phase === 'fight' || phase === 'loot') {
          // di chuyển người chơi
          let ix = keys.d - keys.a + joy.x, iz = keys.s - keys.w + joy.z; const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
          hero.atkT -= dt; hero.atkAnim -= dt; hero.dashCd -= dt; hero.inv -= dt; hero.hurtT -= dt;
          if (hero.dashT > 0) { hero.dashT -= dt; hero.x += hero.dvx * C.dash.speed * dt; hero.z += hero.dvz * C.dash.speed * dt; }
          else { hero.x += ix * spd * dt; hero.z += iz * spd * dt; if (il > 0.15) { hero.fx = ix / Math.max(il, 1); hero.fz = iz / Math.max(il, 1); const l2 = Math.hypot(hero.fx, hero.fz) || 1; hero.fx /= l2; hero.fz /= l2; } }
          clampB(hero);
          if (atkQueued && hero.atkT <= 0) { swing(); }
          if (keys.atk && hero.atkT <= 0) swing(); atkQueued = false;
          mobs.forEach((m) => updateMob(m, dt)); separate(); mobs.forEach((m) => { if (m.hp <= 0 && m.dying <= 0 && m.ent) { m.ent.remove(); m.ent = null; } }); mobs = mobs.filter((m) => m.hp > 0 || m.dying > 0);
          // tia ma thuật
          for (const b of bolts) { b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt; b.mesh.position.set(b.x, 1.2, b.z); if (Math.hypot(b.x - hero.x, b.z - hero.z) < 0.55 && hero.inv <= 0) { hurtHero(b.dmg, 'Tia ma thuật trúng bạn.'); b.life = 0; } if (Math.abs(b.x) > bounds.x + 1.5 || Math.abs(b.z) > bounds.z + 1.5) b.life = 0; }
          bolts = bolts.filter((b) => { if (b.life <= 0) { S.scene.remove(b.mesh); return false; } return true; });
          // vùng nện của trùm
          for (const z of zones) { z.t += dt; z.mesh.material.opacity = 0.2 + 0.4 * Math.min(1, z.t / z.delay); z.mesh.scale.setScalar(0.4 + 0.6 * Math.min(1, z.t / z.delay)); if (z.t >= z.delay && !z.hit) { z.hit = true; if (Math.hypot(hero.x - z.x, hero.z - z.z) < z.r) hurtHero(z.dmg, 'Đòn nện của trùm giáng trúng bạn.'); sfx('bad'); z.t = z.delay + 0.2; z.dead = true; } }
          zones = zones.filter((z) => { if (z.dead && z.t > z.delay + 0.15) { S.scene.remove(z.mesh); return false; } return true; });
          // đợt kế tiếp / hết tầng
          if (phase === 'fight' && !mobs.some((m) => m.hp > 0)) { const f = C.floors[floorI]; if (waveI + 1 < f.waves.length) { waveI++; phase = 'wave'; later(() => { if (done) return; banner('Đợt ' + (waveI + 1), 1100); phase = 'fight'; spawnWave(); }, 900); } else winFloor(); }
          if (phase === 'loot' && loot && Math.hypot(hero.x - loot.grp.position.x, hero.z - loot.grp.position.z) < 1.0) takeLoot();
          if (loot) { loot.grp.position.y = 0.3 + Math.sin(tNow * 3) * 0.12; loot.grp.rotation.y += dt * 1.6; }
        }
      }
      function draw(dt) {
        // đồng bộ 3D
        if (hero.ent) {
          const g = hero.ent.grp; g.position.set(hero.x, Math.abs(Math.sin(tNow * 9)) * 0.06 * (Math.hypot(keys.d - keys.a + joy.x, keys.s - keys.w + joy.z) > 0.1 ? 1 : 0), hero.z); g.rotation.y = Math.atan2(hero.fx, hero.fz) + (hero.atkAnim > 0 ? Math.sin((1 - hero.atkAnim / 0.22) * Math.PI) * 0.6 : 0);
          hero.ent.mat.emissive && 0; const wp = hero.weapon; if (wp) { const pv = hero.atkAnim > 0 ? (1 - hero.atkAnim / 0.22) : -1, sw = pv < 0 ? 0 : pv; const ang = Math.atan2(hero.fx, hero.fz) + (pv < 0 ? 0.9 : 0.9 - sw * 1.9); const r = 0.75; wp.ent.grp.position.set(hero.x + Math.sin(ang) * r, 1.0, hero.z + Math.cos(ang) * r); wp.ent.grp.rotation.set(-Math.PI / 2 + (pv < 0 ? 0.9 : 0.2), ang, 0, 'YXZ'); wp.ent.grp.visible = hero.dashT <= 0; }
        }
        mobs.forEach((m) => {
          if (!m.ent) return; const g = m.ent.grp, wind = m.state === 'wind', lunge = m.state === 'rush' ? 0 : 0; void lunge;
          const fy = (m.def.float || 0) + (m.def.float ? Math.sin(tNow * 2 + m.x) * 0.15 : 0), sq = wind ? 1 + Math.sin(tNow * 40) * 0.04 : 1;
          g.position.set(m.x, m.dying > 0 ? -0.5 * (1 - m.dying / 0.45) : fy, m.z); g.rotation.y = Math.atan2(m.fx, m.fz); g.scale.setScalar(m.ent.scale * (m.dying > 0 ? Math.max(0.05, m.dying / 0.45) : sq * (wind ? 1.06 : 1)));
          m.ent.mat.emissive.setHex(m.flash > 0 ? 0xff5533 : wind ? 0x661108 : 0x000000);
        });
        // máy ảnh theo người chơi
        S.cam.position.x += (hero.x * 0.8 - S.cam.position.x) * Math.min(1, dt * 4); S.cam.position.z += (hero.z * 0.6 + 6.2 - S.cam.position.z) * Math.min(1, dt * 4); S.cam.position.y = 7.4;
        S.cam.lookAt(S.cam.position.x * 0.9, 0.6, hero.z * 0.7 - 0.4); S.torch.position.set(hero.x, 3.2, hero.z); S.render(tNow);
        // chữ nổi
        for (const e of [...flEl.children]) { const q = e._p; q.t += dt; const pt = cross({ x: q.x, y: q.y + q.t * 1.4, z: q.z }); e.style.left = pt.x + 'px'; e.style.top = pt.y + 'px'; }
        if (Math.floor(tNow * 10) % 3 === 0) bars();
      };
      // ---- điều khiển
      const kmap = { w: 'w', arrowup: 'w', s: 's', arrowdown: 's', a: 'a', arrowleft: 'a', d: 'd', arrowright: 'd' };
      keys = { w: 0, a: 0, s: 0, d: 0, atk: 0 };
      keyH = (e) => {
        const k = e.key.toLowerCase(); if (kmap[k]) { keys[kmap[k]] = 1; e.preventDefault(); e.stopPropagation(); return; }
        if (k === ' ' || k === 'j') { if (!e.repeat) atkQueued = true; keys.atk = 1; e.preventDefault(); e.stopPropagation(); } else if (k === 'shift' || k === 'k') { if (!e.repeat) dash(); e.preventDefault(); e.stopPropagation(); } else if (k === 'e' || k === 'q') { if (!e.repeat) potion(); e.preventDefault(); e.stopPropagation(); }
      };
      keyU = (e) => { const k = e.key.toLowerCase(); if (kmap[k]) keys[kmap[k]] = 0; if (k === ' ' || k === 'j') keys.atk = 0; };
      window.addEventListener('keydown', keyH, true); window.addEventListener('keyup', keyU, true);
      $('#drBtA').onpointerdown = (e) => { e.preventDefault(); atkQueued = true; keys.atk = 1; }; $('#drBtA').onpointerup = $('#drBtA').onpointerleave = () => { keys.atk = 0; };
      $('#drBtD').onclick = dash; $('#drBtP').onclick = potion;
      // cần điều khiển cảm ứng + chạm bên phải = chém
      const joyEl = $('#drJoy'), knob = $('#drKnob'); let joyId = null, jc = null;
      if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) joyEl.hidden = false;
      stEl.addEventListener('pointerdown', (e) => {
        const r = stEl.getBoundingClientRect(), left = e.clientX - r.left < r.width * 0.45;
        if (e.pointerType === 'mouse' || !left) { atkQueued = true; if (e.pointerType === 'mouse') keys.atk = 1; return; }
        joyId = e.pointerId; jc = { x: e.clientX, y: e.clientY }; stEl.setPointerCapture(e.pointerId); joyEl.hidden = false; joyEl.style.left = (e.clientX - r.left - 48) + 'px'; joyEl.style.top = (e.clientY - r.top - 48) + 'px'; joyEl.style.bottom = 'auto';
      });
      stEl.addEventListener('pointermove', (e) => { if (e.pointerId !== joyId || !jc) return; let dx = e.clientX - jc.x, dz = e.clientY - jc.y; const l = Math.hypot(dx, dz), m = 44; if (l > m) { dx = dx / l * m; dz = dz / l * m; } joy = { x: dx / m, z: dz / m }; knob.style.transform = 'translate(' + dx + 'px,' + dz + 'px)'; });
      const joyEnd = (e) => { if (e.pointerId === joyId) { joyId = null; jc = null; joy = { x: 0, z: 0 }; knob.style.transform = ''; } keys.atk = 0; };
      stEl.addEventListener('pointerup', joyEnd); stEl.addEventListener('pointercancel', joyEnd);
      bars(); raf = requestAnimationFrame(frame);
      window.__dread = { dbg: () => ({ hero: { x: hero.x, z: hero.z, hp, maxHP, dashCd: hero.dashCd, inv: hero.inv, atkT: hero.atkT }, mobs: mobs.filter((m) => m.hp > 0).map((m) => ({ x: m.x, z: m.z, st: m.state, kind: m.kind, hp: m.hp })), phase, floorI, cleared, kills, loot: loot ? { x: loot.grp.position.x, z: loot.grp.position.z } : null, bounds, potions }), keys, atk: () => { atkQueued = true; }, dash, potion, sim, isDone: () => done };
      loadFloor(0).catch((e) => { finish('Không tải được mô hình hầm ngục (' + (e && e.message || 'lỗi') + ').'); });
    });
  }

  function boot() {
    if (!KN.Mini || !KN.Mini.register) return;
    if (KN.Mini.onAbort) KN.Mini.onAbort.push(close);
    KN.Mini.register('dread', (p) => dread(p).then((r) => { close(); return r; }), '🗡️ Hầm ngục Dreadfall',
      'Hành động đi lại tự do như Dungeon Quest: WASD hoặc mũi tên để di chuyển, Space/J/click để chém (tự ngắm kẻ gần nhất, trúng các kẻ ở trước mặt), Shift/K để lướt né (bất tử ngắn), E/Q để uống thuốc. Quái có vòng báo đòn đỏ: né ra khỏi vòng hoặc lướt đúng lúc. Hạ hết các đợt quái ở mỗi tầng rồi đi tới rương phát sáng để xuống tầng kế tiếp (nhặt vũ khí mạnh hơn, hồi máu). Tầng cuối có trùm Hiệp sĩ Tro. Điện thoại: chạm kéo bên trái để di chuyển, nút bên dưới để chém, lướt, uống thuốc.',
      (p) => 'Sức khỏe ' + Math.round(p.ctx.stats.health) + ': ' + Math.round(DR_CFG.baseHP + p.ctx.stats.health * DR_CFG.hpPerHealth) + ' máu, đỡ đòn tốt hơn, chạy nhanh hơn · Trí tuệ ' + Math.round(p.ctx.stats.smarts) + ': tỉ lệ chí mạng ' + Math.round((DR_CFG.crit.base + p.ctx.stats.smarts * DR_CFG.crit.perSmarts) * 100) + '%');
  }
  boot();
  KN.Dread = { DR_CFG, _parseGlb: parseGlb, _loadGlb: loadGlb };
})();
