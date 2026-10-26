/* Một Kiếp Người — minigame 🗡️ "Hầm ngục Dreadfall" (đăng ký vào KN.Mini), kiểu hành động đi lại tự do như Dungeon Quest / Soul Knight.
   Sảnh: chọn hầm ngục (5 hầm, 3 mức khó), xem trang bị, mua hòm, nhận thưởng tiền vào cuộc đời.
   Hầm ngục: bản đồ nhiều phòng tạo ngẫu nhiên, cửa khóa khi có quái, phòng rương, phòng nghỉ, phòng trùm, trang bị rơi theo độ hiếm,
   vũ khí cận chiến và tầm xa, kỹ năng đặc biệt. Kho đồ lưu trên máy. Mô hình 3D: bộ DREADFALL (assets/dread/*.glb), dữ liệu: js/dread_core.js.
   Điều khiển: WASD/mũi tên · Space/J/click chém hoặc bắn (tự ngắm) · Shift/K lướt · E/Q thuốc · R/F kỹ năng. Điện thoại: cần bên trái + nút bên dưới. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fmtMoney = (v) => (v >= 1e6 ? (v / 1e6).toFixed(v % 1e6 ? 1 : 0) + ' triệu' : Math.round(v / 1e3) + 'k');
  const C = {
    baseHP: 70, hpPerHealth: 0.7, defBase: 8, defPerHealth: 0.1, hurtCut: 0.28, potionHeal: 35, potions: 2, heartHeal: 14,
    speed: 4.3, speedPerHealth: 0.006, dash: { speed: 13, time: 0.2, iframes: 0.3, cd: 1.1 }, critBase: 0.08, critPerSmarts: 0.001, critMul: 1.6,
    room: { w: 14, h: 10 }, skillCd: 7, maxSecs: 1500, moneyPerGold: 9000, moneyCap: 8e6,
  };
  const D = () => KN.DreadCore;

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

  // ---------------------------------------------------------------- cảnh 3D
  function makeStage(canvas) {
    const T = window.THREE, core = D();
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    const scene = new T.Scene(); scene.background = new T.Color(0x0b0810); scene.fog = new T.Fog(0x0b0810, 13, 32);
    const cam = new T.PerspectiveCamera(46, 2, 0.1, 80);
    scene.add(new T.HemisphereLight(0x9a96c8, 0x2e1c14, 1.0));
    const key = new T.DirectionalLight(0xffe6c4, 0.85); key.position.set(-4, 9, 5); scene.add(key);
    const torch = new T.PointLight(0xff8a3c, 1.3, 14); torch.position.set(0, 3.2, 0); scene.add(torch);
    const mat = new T.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    const geos = {}, owned = [], mats = [];
    const geoOf = async (name) => {
      if (geos[name]) return geos[name];
      const g = await core.loadGlb(name), geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(g.pos, 3)); geo.setAttribute('color', new T.BufferAttribute(g.col, 3)); geo.setIndex(new T.BufferAttribute(g.idx, 1)); geo.computeVertexNormals(); geo.computeBoundingBox();
      owned.push(geo); return (geos[name] = geo);
    };
    const lam = (hex, o) => { const m = new T.MeshLambertMaterial(Object.assign({ color: hex }, o || {})); mats.push(m); return m; };
    const bas = (hex, o) => { const m = new T.MeshBasicMaterial(Object.assign({ color: hex }, o || {})); mats.push(m); return m; };
    const stage = {
      T, renderer, scene, cam, torch, lam, bas,
      resize() { const w = canvas.clientWidth || 640, h = canvas.clientHeight || 300; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); },
      // một thực thể từ GLB: nhóm đã chuẩn hóa về chiều cao h, chân đặt ở y=0, nhìn về +z
      async spawn(name, h, flash, tint) {
        const geo = await geoOf(name), bb = geo.boundingBox, s = h / (bb.max.y - bb.min.y), grp = new T.Group(), m = flash || tint ? mat.clone() : mat, mesh = new T.Mesh(geo, m);
        if (tint) m.color.setHex(tint);
        mesh.position.set(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -(bb.max.z + bb.min.z) / 2); grp.add(mesh); grp.scale.setScalar(s); scene.add(grp);
        return { grp, mesh, mat: m, scale: s, remove() { scene.remove(grp); if (m !== mat) m.dispose(); } };
      },
      // vũ khí tầm xa dựng tay (bộ kit chỉ có vũ khí cận chiến); gốc ở y=0, thân dọc theo +y như mô hình GLB
      proc(kind) {
        const grp = new T.Group();
        if (kind === 'bow') {
          const arc = new T.Mesh(new T.TorusGeometry(0.62, 0.045, 6, 18, Math.PI), lam(0x8a6a44)); arc.rotation.z = -Math.PI / 2; arc.position.y = 0.62; grp.add(arc);
          const str = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 1.24, 4), bas(0xe8e0d0)); str.position.set(0, 0.62, 0); grp.add(str);
        } else {
          const rod = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 1.5, 6), lam(0x4a3a5a)); rod.position.y = 0.75; grp.add(rod);
          const orb = new T.Mesh(new T.SphereGeometry(0.14, 10, 8), bas(0xb78bff)); orb.position.y = 1.58; grp.add(orb);
        }
        scene.add(grp); return { grp, mat: null, scale: 1, remove() { scene.remove(grp); } };
      },
      // phòng: sàn caro, tường có cửa, cột và đuốc; trả về các cửa để đổi màu khóa/mở
      room(theme, doors, W, H) {
        const g = new T.Group(), cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const hx = (n) => '#' + n.toString(16).padStart(6, '0');
        x.fillStyle = hx(theme.floor[0]); x.fillRect(0, 0, 64, 64); x.fillStyle = hx(theme.floor[1]); x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32);
        const tex = new T.CanvasTexture(cv); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(W / 2, H / 2); tex.magFilter = T.NearestFilter; owned.push(tex);
        const fm = new T.MeshLambertMaterial({ map: tex }); mats.push(fm);
        const floor = new T.Mesh(new T.PlaneGeometry(W, H), fm); floor.rotation.x = -Math.PI / 2; g.add(floor); owned.push(floor.geometry);
        const wallM = lam(theme.wall), trimM = lam(theme.trim), tH = 2.4, th = 0.7, gap = 2.6;
        const addBox = (w, h, d, px, py, pz, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(px, py, pz); g.add(b); owned.push(b.geometry); return b; };
        const seg = (len, has, axis, sgn) => {
          const parts = has ? [[-len / 2, -gap / 2], [gap / 2, len / 2]] : [[-len / 2, len / 2]];
          parts.forEach(([a, b]) => { const w = b - a, c = (a + b) / 2; if (axis === 'x') { addBox(w, tH, th, c, tH / 2, sgn * (H / 2 + th / 2), wallM); addBox(w, 0.25, th + 0.2, c, tH + 0.12, sgn * (H / 2 + th / 2), trimM); } else { addBox(th, tH, w, sgn * (W / 2 + th / 2), tH / 2, c, wallM); addBox(th + 0.2, 0.25, w, sgn * (W / 2 + th / 2), tH + 0.12, c, trimM); } });
        };
        seg(W + th * 2, doors.n, 'x', -1); seg(W + th * 2, doors.s, 'x', 1); seg(H, doors.w, 'z', -1); seg(H, doors.e, 'z', 1);
        const gates = {};
        const pos = { n: [0, -H / 2], s: [0, H / 2], w: [-W / 2, 0], e: [W / 2, 0] };
        ['n', 's', 'w', 'e'].forEach((d) => { if (!doors[d]) return; const m = bas(0x44aa66, { transparent: true, opacity: 0.55 }); const hz = d === 'n' || d === 's'; const b = new T.Mesh(new T.BoxGeometry(hz ? gap : 0.25, 2.2, hz ? 0.25 : gap), m); b.position.set(pos[d][0], 1.1, pos[d][1]); g.add(b); owned.push(b.geometry); gates[d] = { mesh: b, mat: m, x: pos[d][0], z: pos[d][1] }; });
        [[-W / 2 + 0.6, -H / 2 + 0.6], [W / 2 - 0.6, -H / 2 + 0.6], [-W / 2 + 0.6, H / 2 - 0.6], [W / 2 - 0.6, H / 2 - 0.6]].forEach(([px, pz]) => { addBox(0.7, 2.0, 0.7, px, 1.0, pz, trimM); const f = new T.Mesh(new T.SphereGeometry(0.17, 8, 6), bas(theme.torch)); f.position.set(px, 2.15, pz); g.add(f); owned.push(f.geometry); });
        scene.add(g);
        return { grp: g, gates, remove() { scene.remove(g); } };
      },
      render(t) { torch.intensity = 1.25 + Math.sin(t * 9) * 0.16 + Math.sin(t * 23) * 0.08; renderer.render(scene, cam); },
      dispose() { owned.forEach((g) => { try { g.dispose(); } catch (e) { /* */ } }); mats.forEach((m) => m.dispose()); mat.dispose(); renderer.dispose(); },
    };
    return stage;
  }

  // ---------------------------------------------------------------- minigame
  function dread(p) {
    return new Promise((res) => {
      const core = D(), st = p.ctx.stats, need = p.need != null ? p.need : 0.5, hpMulNeed = 0.9 + need * 0.2, dmgMulNeed = 0.9 + need * 0.2;
      const box = open('<div class="mini-head"><b>🗡️ Hầm ngục Dreadfall</b><small id="drF"></small></div>' +
        '<div class="dr-stage" id="drSt"><canvas id="drCv" class="dr-cv" role="img" aria-label="Cảnh hầm ngục 3D: bạn di chuyển và chiến đấu với quái"></canvas>' +
        '<div class="dr-hud" id="drHud" hidden><div class="dr-bar me"><i id="drMe"></i><span id="drMeT"></span></div><div class="dr-bar foe"><i id="drFoe"></i><span id="drFoeT"></span></div></div>' +
        '<canvas class="dr-map" id="drMap" width="132" height="96" hidden aria-label="Bản đồ hầm ngục"></canvas>' +
        '<div class="dr-float" id="drFl" aria-live="polite"></div><div class="dr-banner" id="drBn"></div>' +
        '<div class="dr-joy" id="drJoy" hidden><i id="drKnob"></i></div></div>' +
        '<div class="dr-lobby" id="drLobby"></div>' +
        '<p class="dr-msg" id="drMsg"></p>' +
        '<div class="mini-btns dr-btns" id="drBtns" hidden><button type="button" class="btn btn-primary" id="drBtA">⚔️ Chém <kbd>Space</kbd></button><button type="button" class="btn btn-soft" id="drBtD">💨 Lướt <kbd>Shift</kbd> <small id="drCd"></small></button><button type="button" class="btn btn-soft" id="drBtS">🌪️ Kỹ năng <kbd>R</kbd> <small id="drSk"></small></button><button type="button" class="btn btn-soft" id="drBtP">🧪 Thuốc <kbd>E</kbd> <small id="drPot"></small></button></div>' +
        '<p class="mini-keys" id="drKeys" hidden>⌨️ <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> di chuyển · <kbd>Space</kbd>/<kbd>J</kbd>/click chém hoặc bắn (tự ngắm) · <kbd>Shift</kbd>/<kbd>K</kbd> lướt · <kbd>R</kbd>/<kbd>F</kbd> kỹ năng · <kbd>E</kbd>/<kbd>Q</kbd> thuốc</p>');
      const $ = (s) => box.querySelector(s), msgEl = $('#drMsg'), flEl = $('#drFl'), bnEl = $('#drBn'), cv = $('#drCv'), stEl = $('#drSt'), lobEl = $('#drLobby');
      const say = (t) => { msgEl.textContent = t; };
      if (!core.webgl()) { say('Cần WebGL để chơi minigame này.'); lobEl.innerHTML = ''; later(() => res({ score: 0, text: 'Trình duyệt này không hiển thị được cảnh 3D nên bạn không vào được hầm ngục.' }), 200); return; }
      let S;
      try { S = makeStage(cv); } catch (e) { later(() => res({ score: 0, text: 'Không dựng được cảnh 3D.' }), 200); return; }
      R = S; S.resize(); const onResize = () => S.resize(); window.addEventListener('resize', onResize); const od = S.dispose; S.dispose = () => { window.removeEventListener('resize', onResize); od(); };
      const T = S.T, V3 = (x, y, z) => new T.Vector3(x, y, z);
      const meta = core.loadMeta(), save = () => core.saveMeta(meta);
      const W = C.room.w, H = C.room.h;
      let mode = 'lobby', best = 0, sessionRuns = 0, tNow = 0, done = false, last = performance.now();
      let run = null, hero = null, mobs = [], bolts = [], shots = [], zones = [], pickups = [], roomObj = null, keys = { w: 0, a: 0, s: 0, d: 0, atk: 0 }, joy = { x: 0, z: 0 }, atkQueued = false, lobbyHero = null, bossAdds = false;
      const joyEl = $('#drJoy'), knob = $('#drKnob');
      // ---------------------------------------------------------------- SẢNH
      const rarSpan = (it) => '<span style="color:' + core.RARITY[it.rar].color + '">' + esc(it.name) + '</span>';
      const rate = (it) => (it ? (it.atk || 0) + (it.hp || 0) * 0.5 + (it.def || 0) * 2 + it.rar * 4 + (it.aff ? it.aff.length : 0) * 3 : -1);
      const lifeOn = () => { try { return !!(KN.Game && KN.Game.hasLife && KN.Game.hasLife() && !KN.Game.isDead()); } catch (e) { return false; } };
      const ageK = () => { try { const c = KN.Game && KN.Game.miniContext && KN.Game.miniContext(); return c ? (c.age < 12 ? 0.2 : c.age < 18 ? 0.5 : 1) : 1; } catch (e) { return 1; } };
      let tab = 'dg', selDg = 'bone', selTier = 0;
      function lobbyView() {
        mode = 'lobby'; $('#drHud').hidden = true; $('#drMap').hidden = true; $('#drBtns').hidden = true; $('#drKeys').hidden = true; lobEl.hidden = false; joyEl.hidden = true;
        const g = core.gearStats(meta.eq), dgs = core.DUNGEONS;
        const money = lifeOn() ? '' : ' <small>(chưa có cuộc đời, chưa nhận được tiền)</small>';
        const head = '<div class="dr-lh"><b>🪙 ' + meta.gold + ' vàng</b><span>Đã vào hầm ' + meta.runs + ' lần · hạ ' + meta.kills + ' quái' + money + '</span></div>';
        const tabs = '<div class="dr-tabs" role="tablist">' + [['dg', '🏰 Hầm ngục'], ['eq', '🎒 Trang bị'], ['shop', '🏪 Cửa hàng'], ['on', '🌐 Online']].map(([k, l]) => '<button type="button" role="tab" data-tab="' + k + '" class="' + (tab === k ? 'on' : '') + '" aria-selected="' + (tab === k) + '">' + l + '</button>').join('') + '</div>';
        let body = '';
        if (tab === 'dg') {
          body = '<div class="dr-dgs">' + dgs.map((d) => { const un = core.unlocked(meta, d), cl = (meta.clears[d.id] || {}); return '<button type="button" class="dr-dg' + (selDg === d.id ? ' sel' : '') + (un ? '' : ' lock') + '" data-dg="' + d.id + '"' + (un ? '' : ' disabled') + '><span class="ic">' + d.icon + '</span><b>' + esc(d.name) + '</b><small>' + esc(d.blurb) + '</small><i>' + (un ? d.rooms + ' phòng · đã phá ' + ((cl[0] || 0) + (cl[1] || 0) + (cl[2] || 0)) + ' lần' : '🔒 Phá ' + esc(dgs.find((x) => x.id === d.unlock).name) + ' để mở') + '</i></button>'; }).join('') + '</div>' +
            '<div class="dr-tiers">' + core.TIERS.map((t) => { const cl = (meta.clears[selDg] || {}), un = t.id === 0 || (cl[t.id - 1] || 0) > 0; return '<button type="button" data-tier="' + t.id + '" class="' + (selTier === t.id ? 'on' : '') + '"' + (un ? '' : ' disabled') + '>' + esc(t.name) + (un ? '' : ' 🔒') + '<small>vàng ×' + t.gold + ' · tiền ×' + t.money + '</small></button>'; }).join('') + '</div>' +
            '<div class="mini-btns"><button type="button" class="btn btn-primary" id="drGo">⚔️ Vào hầm ngục</button><button type="button" class="btn btn-ghost" id="drDone">✔ Xong, nộp kết quả' + (best ? ' (' + Math.round(best * 100) + '%)' : '') + '</button></div>';
        } else if (tab === 'eq') {
          const slot = (s, l) => { const it = meta.eq[s]; return '<div class="dr-slot"><small>' + l + '</small>' + (it ? '<div>' + it.icon + ' ' + rarSpan(it) + '<br><i>' + esc(core.statsText(it)) + '</i></div>' : '<div class="dim">Trống</div>') + '</div>'; };
          body = '<div class="dr-slots">' + slot('weapon', 'Vũ khí') + slot('armor', 'Giáp') + slot('ring', 'Trang sức') + '</div><p class="dr-sum">⚔️ ' + Math.round(g.atk) + ' · ❤️ +' + Math.round(g.hp) + ' · 🛡️ ' + g.def + ' · 💥 ' + Math.round(g.crit * 100) + '% · 🩸 ' + Math.round(g.life * 100) + '% · 🏃 +' + Math.round(g.speed * 100) + '%</p>' +
            '<div class="dr-inv">' + (meta.inv.length ? meta.inv.map((it) => '<div class="dr-it"><span>' + it.icon + ' ' + rarSpan(it) + '<br><i>' + esc(core.statsText(it)) + '</i></span><span class="b"><button type="button" class="btn btn-soft btn-sm" data-eq="' + it.id + '">Trang bị</button><button type="button" class="btn btn-ghost btn-sm" data-sell="' + it.id + '">Bán ' + core.sellValue(it) + '🪙</button></span></div>').join('') : '<p class="dim">Kho trống. Mở rương trong hầm ngục hoặc mua hòm ở cửa hàng.</p>') + '</div>' +
            (meta.inv.length ? '<div class="mini-btns"><button type="button" class="btn btn-ghost btn-sm" id="drSellAll">Bán hết đồ Thường/Tốt</button></div>' : '');
        } else if (tab === 'shop') {
          const boxes = [['Hòm đồng', 90, 0, '🟫', 'Trang bị Thường–Hiếm'], ['Hòm bạc', 260, 2, '⬜', 'Chắc chắn từ Hiếm trở lên'], ['Hòm vàng', 750, 3, '🟨', 'Chắc chắn từ Sử thi trở lên']];
          body = '<div class="dr-shop">' + boxes.map((b, i) => '<div class="dr-box2"><span class="ic">' + b[3] + '</span><b>' + b[0] + '</b><small>' + b[4] + '</small><button type="button" class="btn btn-primary btn-sm" data-buy="' + i + '"' + (meta.gold >= b[1] ? '' : ' disabled') + '>Mua ' + b[1] + '🪙</button></div>').join('') + '<div class="dr-box2"><span class="ic">🧪</span><b>Thuốc dự trữ</b><small>+1 bình mỗi lượt vào hầm (đang có +' + (meta.extraPotions || 0) + ', tối đa +4)</small><button type="button" class="btn btn-primary btn-sm" data-buy="p"' + (meta.gold >= 120 && (meta.extraPotions || 0) < 4 ? '' : ' disabled') + '>Mua 120🪙</button></div></div>';
        } else {
          body = '<div class="dr-on"><p><b>🌐 Co-op online</b></p><p class="dim">Chơi chung hầm ngục với bạn bè qua mã phòng đang được phát triển. Hiện tại bạn chơi một mình; kho đồ và tiến trình vẫn được giữ trên máy này và sẽ dùng được khi chế độ online ra mắt.</p><button type="button" class="btn btn-soft" disabled>Tạo phòng (sắp có)</button> <button type="button" class="btn btn-soft" disabled>Vào bằng mã (sắp có)</button></div>';
        }
        lobEl.innerHTML = head + tabs + '<div class="dr-tb">' + body + '</div>';
        lobEl.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-dg]').forEach((b) => (b.onclick = () => { selDg = b.dataset.dg; selTier = 0; sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-tier]').forEach((b) => (b.onclick = () => { selTier = +b.dataset.tier; sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-eq]').forEach((b) => (b.onclick = () => { equip(b.dataset.eq); sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-sell]').forEach((b) => (b.onclick = () => { const i = meta.inv.findIndex((x) => x.id === b.dataset.sell); if (i >= 0) { meta.gold += core.sellValue(meta.inv[i]); meta.inv.splice(i, 1); save(); sfx('coin'); lobbyView(); } }));
        const sa = $('#drSellAll'); if (sa) sa.onclick = () => { const keep = []; let gain = 0; meta.inv.forEach((it) => { if (it.rar <= 1) gain += core.sellValue(it); else keep.push(it); }); meta.inv = keep; meta.gold += gain; save(); sfx('coin'); say('Bán đồ Thường/Tốt được ' + gain + ' vàng.'); lobbyView(); };
        lobEl.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => {
          const k = b.dataset.buy;
          if (k === 'p') { if (meta.gold >= 120 && (meta.extraPotions || 0) < 4) { meta.gold -= 120; meta.extraPotions = (meta.extraPotions || 0) + 1; save(); sfx('coin'); lobbyView(); } return; }
          const cost = [90, 260, 750][+k], minR = [0, 2, 3][+k]; if (meta.gold < cost) return; meta.gold -= cost; const it = core.rollItem(3, +k * 0.4, null, minR); addInv(it); save(); sfx('good'); say('Mở hòm: ' + it.name + ' (' + core.RARITY[it.rar].name + ').'); tab = 'eq'; lobbyView();
        }));
        const go = $('#drGo'); if (go) go.onclick = () => startRun(selDg, selTier);
        const dn = $('#drDone'); if (dn) dn.onclick = () => { finishSession(); };
        updateLobbyHero();
      }
      function addInv(it) { if (meta.inv.length >= 40) { meta.gold += core.sellValue(it); return false; } meta.inv.push(it); return true; }
      function equip(id) { const i = meta.inv.findIndex((x) => x.id === id); if (i < 0) return; const it = meta.inv[i], old = meta.eq[it.slot]; meta.eq[it.slot] = it; meta.inv.splice(i, 1); if (old && old.id !== 'start') meta.inv.push(old); save(); }
      async function setupLobbyScene() {
        if (!S.lobbyGrp) { S.lobbyGrp = new T.Group(); const ped = new T.Mesh(new T.CylinderGeometry(1.6, 1.9, 0.3, 20), S.lam(0x2a2433)); ped.position.y = -0.15; S.lobbyGrp.add(ped); const ring = new T.Mesh(new T.TorusGeometry(1.7, 0.05, 6, 32), S.bas(0xffb347)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; S.lobbyGrp.add(ring); S.scene.add(S.lobbyGrp); }
        S.lobbyGrp.visible = true; if (!lobbyHero) lobbyHero = await S.spawn('character_hollow_knight', 2.4); lobbyHero.grp.visible = true;
        S.cam.position.set(0, 2.6, 6.4); S.cam.lookAt(0, 1.3, 0);
      }
      let lobbyWeapon = null, lobbyWeaponKey = '';
      async function updateLobbyHero() {
        try { await setupLobbyScene(); } catch (e) { return; }
        const wp = meta.eq.weapon, wk = wp ? wp.id : ''; if (wk === lobbyWeaponKey || mode !== 'lobby') return; lobbyWeaponKey = wk; if (lobbyWeapon) { lobbyWeapon.remove(); lobbyWeapon = null; }
        if (wp) { try { lobbyWeapon = await makeWeapon(wp); } catch (e) { /* */ } }
      }
      async function makeWeapon(it) { const b = core.baseOf(it); if (!b) return null; return b.proc ? S.proc(b.proc) : S.spawn(b.model, b.h); }
      // ---------------------------------------------------------------- VÀO HẦM NGỤC
      async function startRun(dgId, tierId) {
        const dg = core.DUNGEONS.find((d) => d.id === dgId), tier = core.TIERS[tierId]; if (!dg || !tier) return;
        lobEl.hidden = true; say('Đang dựng hầm ngục…'); mode = 'load';
        if (S.lobbyGrp) S.lobbyGrp.visible = false; if (lobbyHero) lobbyHero.grp.visible = false; if (lobbyWeapon) { lobbyWeapon.remove(); lobbyWeapon = null; lobbyWeaponKey = ''; }
        meta.runs++; save();
        const map = core.genMap(dg), sx = map.rooms[0];
        run = { dg, tier, map, cur: sx, gold: 0, items: [], kills: 0, roomsCleared: 0, combatTotal: map.rooms.filter((r) => r.type === 'combat' || r.type === 'boss').length, potions: C.potions + (meta.extraPotions || 0), t0: tNow, over: false, won: false };
        S.scene.background.setHex(dg.theme.fog); S.scene.fog.color.setHex(dg.theme.fog); S.torch.color.setHex(dg.theme.torch);
        hero = { x: 0, z: 0, fx: 0, fz: -1, atkT: 0, atkAnim: 0, dashT: 0, dashCd: 0, skillCd: 0, inv: 0, ent: null, weapon: null, wkey: '', hurtT: 0, r: 0.4, hp: 1, maxHP: 1, defense: 0, atk: 15, spd: 4.3, critP: 0.1, lifeP: 0, goldMul: 1, cdr: 0, wdef: null };
        mobs = []; bolts = []; shots = []; zones = []; pickups = [];
        try { hero.ent = await S.spawn('character_hollow_knight', 2.0); } catch (e) { say('Không tải được mô hình nhân vật.'); run = null; lobbyView(); return; }
        await applyGear(true);
        mode = 'run'; $('#drHud').hidden = false; $('#drMap').hidden = false; $('#drBtns').hidden = false; $('#drKeys').hidden = false; if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) joyEl.hidden = false;
        await enterRoom(sx, null);
      }
      async function applyGear(first) {
        const g = core.gearStats(meta.eq), prevMax = hero.maxHP, w = g.weapon || meta.eq.weapon, b = w ? core.baseOf(w) : null;
        const hpBase = C.baseHP + st.health * C.hpPerHealth + g.hp; hero.maxHP = Math.round(hpBase); hero.hp = first ? hero.maxHP : Math.min(hero.maxHP, hero.hp + Math.max(0, hero.maxHP - prevMax));
        hero.defense = C.defBase + st.health * C.defPerHealth + g.def; hero.atk = (w ? w.atk : 12) + Math.round(st.smarts * 0.02); hero.spd = C.speed * (1 + (st.health - 50) * C.speedPerHealth) * (1 + g.speed); hero.critP = C.critBase + st.smarts * C.critPerSmarts + g.crit; hero.lifeP = g.life; hero.goldMul = 1 + g.gold; hero.cdr = clamp(g.cdr, 0, 0.5); hero.wdef = b ? { melee: b.melee, range: b.range, cd: b.cd } : { melee: true, range: 1.9, cd: 0.62 };
        if (w && hero.wkey !== w.id) { if (hero.weapon) { hero.weapon.remove(); hero.weapon = null; } try { hero.weapon = await makeWeapon(w); hero.wkey = w.id; } catch (e) { /* */ } }
      }
      const HALFW = () => W / 2 - 0.75, HALFH = () => H / 2 - 0.75;
      const DOORS = { n: [0, -1, 's'], s: [0, 1, 'n'], w: [-1, 0, 'e'], e: [1, 0, 'w'] };
      async function enterRoom(room, fromDir) {
        mobs.forEach((m) => m.ent && m.ent.remove()); mobs = []; bolts.forEach((b) => S.scene.remove(b.mesh)); bolts = []; shots.forEach((b) => S.scene.remove(b.mesh)); shots = []; zones.forEach((z) => S.scene.remove(z.mesh)); zones = []; pickups.forEach((q) => { if (q.ent) q.ent.remove(); if (q.mesh) S.scene.remove(q.mesh); }); pickups = [];
        if (roomObj) roomObj.remove(); roomObj = S.room(run.dg.theme, room.doors, W, H); run.cur = room; room.visited = true;
        Object.keys(room.doors).forEach((d) => { if (room.doors[d]) { const nb = run.map.byKey.get(run.map.key(room.x + DOORS[d][0], room.y + DOORS[d][1])); if (nb) nb.seen = true; } });
        if (fromDir) { const d = DOORS[fromDir]; hero.x = -d[0] * (W / 2 - 1.5); hero.z = -d[1] * (H / 2 - 1.5); hero.fx = -d[0]; hero.fz = -d[1]; } else { hero.x = 0; hero.z = 1.2; hero.fx = 0; hero.fz = -1; }
        hero.inv = 0.8; bossAdds = false; const depth = room.d || 0;
        if (room.type === 'combat' && !room.cleared) await spawnMobs(2 + Math.min(3, Math.floor(depth / 2)) + (Math.random() < 0.5 ? 1 : 0), depth);
        else if (room.type === 'boss' && !room.cleared) { say('Trùm hầm ngục xuất hiện!'); banner('⚠️ PHÒNG TRÙM', 1800); const mk = [await makeMob(run.dg.boss, 0, 1, depth + 2, true)]; if (run.dg.boss2) mk.push(await makeMob(run.dg.boss2, 1, 2, depth + 2, true)); mobs.push(...mk); }
        else if (room.type === 'chest' && !room.opened) { const e = await S.spawn('loot_ashen_chest', 1.1); e.grp.position.set(0, 0, -1); pickups.push({ kind: 'chest', x: 0, z: -1, ent: e, r: 1.3, t: 0 }); say('Một chiếc rương nằm giữa phòng. Lại gần để mở.'); }
        else if (room.type === 'rest' && !room.opened) { const m1 = new T.Mesh(new T.CylinderGeometry(0.7, 0.9, 0.5, 14), S.lam(0x445577)), m2 = new T.Mesh(new T.SphereGeometry(0.45, 12, 8), S.bas(0x5ac8ff, { transparent: true, opacity: 0.8 })); m2.position.y = 0.55; const gp = new T.Group(); gp.add(m1, m2); gp.position.set(0, 0.25, -1); S.scene.add(gp); pickups.push({ kind: 'fountain', x: 0, z: -1, mesh: gp, r: 1.4, t: 0 }); say('Đài phun nước ánh xanh: lại gần để hồi máu.'); }
        else if (room.type === 'start') say('Bắt đầu hầm ngục ' + run.dg.name + '. Đi qua các cửa để khám phá, tìm phòng trùm.');
        setDoors(); bars(); drawMap();
      }
      function setDoors() { if (!roomObj) return; const lock = mobs.some((m) => m.hp > 0); Object.keys(roomObj.gates).forEach((d) => { const g = roomObj.gates[d]; g.mat.color.setHex(lock ? 0xcc3344 : 0x44aa66); g.mat.opacity = lock ? 0.75 : 0.35; }); }
      async function spawnMobs(n, depth) { const list = []; for (let i = 0; i < n; i++) list.push(makeMob(pick(run.dg.mobs), i, n, depth, false)); const made = await Promise.all(list); mobs.push(...made); bars(); }
      async function makeMob(kind, idx, n, depth, isBoss) {
        const def = core.MOBS[kind], ent = await S.spawn(def.model, def.h, true, def.tint), ang = (idx / Math.max(1, n)) * Math.PI * 2 + rand(-0.4, 0.4), rr = Math.min(HALFW(), HALFH()) * 0.7;
        const sc = (1 + 0.1 * depth) * run.tier.hp * hpMulNeed, dm = (1 + 0.05 * depth) * run.tier.dmg * dmgMulNeed;
        const m = { kind, def, ent, x: clamp(Math.sin(ang) * rr * 1.3, -HALFW(), HALFW()), z: clamp(-H * 0.18 + Math.cos(ang) * rr * 0.7, -HALFH(), HALFH()), hp: 0, max: 0, dmg: def.dmg * dm, state: 'chase', t: rand(0.4, 1.2), cd: rand(0.6, 1.4), fx: 0, fz: 1, flash: 0, slamCd: rand(2.5, 4), chargeCd: rand(4, 6), dying: 0, aim: null, moveType: null, isBoss: !!isBoss, gold: isBoss ? 40 : def.hp > 100 ? 5 : 3 };
        m.hp = m.max = Math.round(def.hp * sc); return m;
      }
      // ---------------------------------------------------------------- vòng lặp trận
      const bars = () => {
        if (!run || !hero) return; $('#drMe').style.width = clamp(hero.hp / hero.maxHP * 100, 0, 100) + '%'; $('#drMeT').textContent = 'Bạn ' + Math.max(0, Math.round(hero.hp)) + '/' + hero.maxHP;
        const alive = mobs.filter((m) => m.hp > 0), tot = alive.reduce((a, m) => a + m.hp, 0), mx = alive.reduce((a, m) => a + m.max, 0);
        $('#drFoe').style.width = (mx ? clamp(tot / mx * 100, 0, 100) : 0) + '%'; $('#drFoeT').textContent = alive.length ? (alive.length === 1 && alive[0].def.boss ? alive[0].def.name : 'Quái còn ' + alive.length) : '🪙 ' + run.gold + ' vàng';
        $('#drPot').textContent = '×' + run.potions; $('#drF').textContent = run.dg.name + ' · ' + run.tier.name + ' · phòng ' + run.map.rooms.filter((r) => r.visited).length + '/' + run.map.rooms.length + ' · 🪙' + run.gold;
        const cd = Math.max(0, hero.dashCd), sk = Math.max(0, hero.skillCd); $('#drCd').textContent = cd > 0.05 ? cd.toFixed(1) + 's' : ''; $('#drSk').textContent = sk > 0.05 ? sk.toFixed(0) + 's' : '';
      };
      const banner = (t, ms) => { bnEl.textContent = t; bnEl.classList.add('on'); later(() => bnEl.classList.remove('on'), ms || 1600); };
      const fl = (txt, cls, x, z, y) => { const e = document.createElement('b'); e.className = cls || ''; e.textContent = txt; e._p = { x, z, y: y || 1.8, t: 0 }; flEl.appendChild(e); setTimeout(() => e.remove(), 900); };
      const project = (d) => { const v = V3(d.x, d.y, d.z).project(S.cam); return { x: (v.x * 0.5 + 0.5) * cv.clientWidth, y: (-v.y * 0.5 + 0.5) * cv.clientHeight }; };
      function drawMap() {
        const mc = $('#drMap'), x = mc.getContext('2d'); x.clearRect(0, 0, 132, 96); if (!run) return; const cw = 26, ch = 20, ox = 6, oy = 6;
        x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, 0, 132, 96);
        run.map.rooms.forEach((r) => {
          if (!r.seen && !r.visited) return; const px = ox + r.x * (cw + 3), py = oy + r.y * (ch + 3);
          x.fillStyle = '#666'; if (r.doors.e) x.fillRect(px + cw, py + ch / 2 - 1, 3, 2); if (r.doors.s) x.fillRect(px + cw / 2 - 1, py + ch, 2, 3);
          x.fillStyle = r === run.cur ? '#ffd36a' : r.visited ? (r.cleared ? '#4a7a5a' : '#8a4a4a') : '#3a3a48'; x.fillRect(px, py, cw, ch);
          x.fillStyle = '#fff'; x.font = '12px sans-serif'; x.textAlign = 'center'; x.fillText(r.type === 'boss' ? '☠' : r.type === 'chest' ? '▣' : r.type === 'rest' ? '✚' : '', px + cw / 2, py + ch / 2 + 4);
        });
      }
      function score() { if (!run) return 0; if (run.won) return clamp(0.8 + 0.2 * clamp(hero.hp / hero.maxHP, 0, 1), 0, 1); const fr = run.roomsCleared / Math.max(1, run.combatTotal); return clamp(fr * 0.72, 0, 0.72); }
      function endRun(won, why) {
        if (!run || run.over) return; run.over = true; run.won = won; mode = 'end'; const sc = score(); best = Math.max(best, sc); sessionRuns++;
        const keepGold = won ? run.gold : Math.round(run.gold * 0.6); meta.gold += keepGold; meta.kills += run.kills; meta.bestGold = Math.max(meta.bestGold || 0, run.gold);
        if (won) { const cl = (meta.clears[run.dg.id] = meta.clears[run.dg.id] || {}); cl[run.tier.id] = (cl[run.tier.id] || 0) + 1; } save();
        const cash = Math.min(C.moneyCap, Math.round(keepGold * C.moneyPerGold * run.tier.money * ageK() / 1e4) * 1e4);
        lobEl.hidden = false; $('#drBtns').hidden = true; $('#drKeys').hidden = true; $('#drHud').hidden = true; $('#drMap').hidden = true; joyEl.hidden = true; mobs.forEach((m) => m.ent && m.ent.remove()); mobs = [];
        lobEl.innerHTML = '<div class="dr-end ' + (won ? 'win' : 'lose') + '"><h4>' + (won ? '🏆 Phá đảo ' + esc(run.dg.name) + '!' : '💀 Bạn gục ngã') + '</h4><p>' + esc(why || '') + '</p>' +
          '<p>Đã dọn ' + run.roomsCleared + '/' + run.combatTotal + ' phòng · hạ ' + run.kills + ' quái · nhặt ' + run.gold + ' vàng' + (won ? '' : ' (giữ lại ' + keepGold + ')') + ' · ' + run.items.length + ' món trang bị.</p>' +
          (run.items.length ? '<div class="dr-inv">' + run.items.map((it) => '<div class="dr-it"><span>' + it.icon + ' ' + rarSpan(it) + '<br><i>' + esc(core.statsText(it)) + '</i></span></div>').join('') + '</div>' : '') +
          '<div class="mini-btns">' + (cash > 0 && lifeOn() ? '<button type="button" class="btn btn-primary" id="drCash">💰 Nhận ' + fmtMoney(cash) + ' vào cuộc đời</button>' : '<span class="dim">' + (lifeOn() ? 'Chưa kiếm được tiền lần này.' : 'Bắt đầu một cuộc đời để đổi vàng hầm ngục thành tiền.') + '</span>') + '<button type="button" class="btn btn-soft" id="drLobby2">🏰 Về sảnh</button><button type="button" class="btn btn-ghost" id="drDone2">✔ Xong, nộp kết quả</button></div></div>';
        let claimed = false; const cb = $('#drCash'); if (cb) cb.onclick = () => { if (claimed) return; claimed = true; try { KN.Game.onlineMoney(cash, 'Hầm ngục Dreadfall: bán chiến lợi phẩm được ' + fmtMoney(cash) + '.', '🗡️'); } catch (e) { /* */ } cb.disabled = true; cb.textContent = '✔ Đã nhận ' + fmtMoney(cash); sfx('coin'); };
        $('#drLobby2').onclick = () => { run = null; tab = 'dg'; if (roomObj) { roomObj.remove(); roomObj = null; } if (hero && hero.ent) { hero.ent.remove(); hero.ent = null; } if (hero && hero.weapon) { hero.weapon.remove(); hero.weapon = null; } pickups.forEach((q) => { if (q.ent) q.ent.remove(); if (q.mesh) S.scene.remove(q.mesh); }); pickups = []; bolts.forEach((b) => S.scene.remove(b.mesh)); bolts = []; shots.forEach((b) => S.scene.remove(b.mesh)); shots = []; zones.forEach((z) => S.scene.remove(z.mesh)); zones = []; S.scene.background.setHex(0x0b0810); S.scene.fog.color.setHex(0x0b0810); S.torch.color.setHex(0xff8a3c); lobbyView(); say(''); };
        $('#drDone2').onclick = () => finishSession();
      }
      function finishSession() { if (done) return; done = true; const txt = best >= 0.8 ? 'Bạn phá đảo hầm ngục và mang chiến lợi phẩm về sảnh.' : best > 0 ? 'Bạn dọn được một phần hầm ngục (' + Math.round(best * 100) + '%).' : 'Bạn chưa vào hầm ngục nào.'; later(() => res({ score: best, text: txt + ' Kho đồ và vàng được lưu trên máy này.' }), 300); }
      function hurtHero(raw, label) {
        if (hero.inv > 0 || run.over) return false; const d = Math.max(2, Math.round(raw - hero.defense * C.hurtCut)); hero.hp -= d; hero.hurtT = 0.25; hero.inv = 0.35; fl('-' + d, 'me', hero.x, hero.z, 2.1); sfx('bad'); bars();
        if (hero.hp <= 0) { say('Bạn gục xuống… ' + (label || '')); endRun(false, label || ''); } return true;
      }
      function addZone(x, z, r, delay, dmg, color) { const mesh = new T.Mesh(new T.CircleGeometry(r, 28), new T.MeshBasicMaterial({ color: color || 0xff3322, transparent: true, opacity: 0.25, depthWrite: false })); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, 0.05, z); S.scene.add(mesh); zones.push({ mesh, x, z, r, t: 0, delay, dmg }); }
      function mobStrike(m, dx, dz) {
        const d = m.def;
        if (d.ranged) { const n = d.boss ? 3 : 1; for (let k = 0; k < n; k++) { const a = Math.atan2(dx, dz) + (k - (n - 1) / 2) * 0.28, vx = Math.sin(a) * 5.6, vz = Math.cos(a) * 5.6, mesh = new T.Mesh(new T.SphereGeometry(d.boss ? 0.3 : 0.22, 10, 8), new T.MeshBasicMaterial({ color: 0xb78bff })); mesh.position.set(m.x, 1.2, m.z); S.scene.add(mesh); bolts.push({ mesh, x: m.x, z: m.z, vx, vz, life: 3.2, dmg: m.dmg }); } sfx('click'); return; }
        const ddx = hero.x - m.x, ddz = hero.z - m.z, dd = Math.hypot(ddx, ddz); if (dd <= d.reach + hero.r + (d.boss ? 0.6 : 0)) hurtHero(m.dmg, d.name + ' giáng đòn.');
      }
      function updateMob(m, dt) {
        const d = m.def, dx = hero.x - m.x, dz = hero.z - m.z, dist = Math.hypot(dx, dz) || 0.001; m.flash = Math.max(0, m.flash - dt); m.cd -= dt;
        if (m.dying > 0) { m.dying -= dt; return; }
        const face = () => { m.fx = dx / dist; m.fz = dz / dist; };
        if (m.state === 'chase') {
          face(); let want = 0;
          if (d.ranged) { if (dist < 3.4) want = -1; else if (dist > 5.6) want = 1; } else want = dist > d.reach * 0.85 ? 1 : 0;
          m.x += m.fx * d.speed * want * dt; m.z += m.fz * d.speed * want * dt;
          if (d.ranged && want === 0) { m.x += -m.fz * 0.9 * dt * Math.sin(tNow * 1.3); m.z += m.fx * 0.9 * dt * Math.sin(tNow * 1.3); }
          const bossMelee = d.boss && !d.ranged;
          if (m.cd <= 0 && dist <= d.reach + hero.r + (d.boss ? 0.8 : 0.1) && !d.ranged) { m.state = 'wind'; m.t = d.wind; m.aim = { x: m.fx, z: m.fz, d: dist }; m.moveType = 'melee'; if (bossMelee) { if (m.slamCd <= 0 && dist < 3.4) { m.moveType = 'slam'; m.t = 1.05; addZone(m.x + m.fx * 1.2, m.z + m.fz * 1.2, 2.5, 1.05, m.dmg * 1.5, 0xff3322); m.slamCd = rand(3.2, 5); } else if (m.chargeCd <= 0) { m.moveType = 'charge'; m.t = 0.85; m.chargeCd = rand(5, 7); } } }
          else if (bossMelee && m.cd <= 0 && dist > 4.5 && m.chargeCd <= 0) { m.state = 'wind'; m.moveType = 'charge'; m.t = 0.85; m.aim = { x: m.fx, z: m.fz, d: dist }; m.chargeCd = rand(5, 7); }
          else if (d.ranged && m.cd <= 0 && dist < d.reach) { m.state = 'wind'; m.moveType = 'bolt'; m.t = d.wind; }
          m.slamCd -= dt; m.chargeCd -= dt;
        } else if (m.state === 'wind') {
          if (m.moveType !== 'charge') face(); m.t -= dt;
          if (m.t <= 0) { if (m.moveType === 'charge') { m.state = 'rush'; m.t = 0.5; m.aim = { x: dx / dist, z: dz / dist }; } else { if (m.moveType === 'bolt' || m.moveType === 'melee') mobStrike(m, dx, dz); m.state = 'rec'; m.t = 0.35; m.cd = d.cd * rand(0.9, 1.15); } }
        } else if (m.state === 'rush') {
          m.t -= dt; m.x += m.aim.x * 10 * dt; m.z += m.aim.z * 10 * dt; m.fx = m.aim.x; m.fz = m.aim.z;
          if (Math.hypot(hero.x - m.x, hero.z - m.z) < d.r + hero.r + 0.6) { if (hurtHero(m.dmg * 1.2, d.name + ' húc trúng bạn.')) m.t = 0; }
          if (m.t <= 0) { m.state = 'rec'; m.t = 0.6; m.cd = d.cd; }
        } else if (m.state === 'rec') { m.t -= dt; if (m.t <= 0) m.state = 'chase'; }
        m.x = clamp(m.x, -HALFW(), HALFW()); m.z = clamp(m.z, -HALFH(), HALFH());
        if (d.boss && !bossAdds && m.hp < m.max * 0.5) { bossAdds = true; banner('Trùm triệu hồi quân hộ vệ!', 1600); Promise.all([makeMob('skeleton', 0, 2, 2, false), makeMob('goblin', 1, 2, 2, false)]).then((a) => { if (!run.over) { mobs.push(...a); bars(); } }); }
      }
      function separate() { const ent = mobs.filter((m) => m.hp > 0); for (let i = 0; i < ent.length; i++) for (let j = i + 1; j < ent.length; j++) { const a = ent[i], b = ent[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 0.001, min = a.def.r + b.def.r; if (d < min) { const push = (min - d) / 2; a.x -= dx / d * push; a.z -= dz / d * push; b.x += dx / d * push; b.z += dz / d * push; } } }
      const nearest = (range) => { let best = null, bd = range; for (const m of mobs) { if (m.hp <= 0) continue; const d = Math.hypot(m.x - hero.x, m.z - hero.z) - m.def.r; if (d < bd) { bd = d; best = m; } } return best; };
      function dmgMob(m, dmg, crit, kb) {
        m.hp -= dmg; m.flash = 0.14; if (hero.lifeP) { const h = Math.min(hero.maxHP - hero.hp, dmg * hero.lifeP); if (h > 0.4) hero.hp += h; }
        const dx = m.x - hero.x, dz = m.z - hero.z, l = Math.hypot(dx, dz) || 1, k = m.def.boss ? 0.08 : kb; m.x += dx / l * k; m.z += dz / l * k;
        if (!m.def.boss && m.state === 'wind' && dmg > m.max * 0.45) m.state = 'chase';
        fl((crit ? '💥' : '') + Math.round(dmg), 'foe' + (crit ? ' crit' : ''), m.x, m.z, m.def.h + 0.4);
        if (m.hp <= 0) { m.dying = 0.45; run.kills++; sfx('kick'); dropFrom(m); }
      }
      function dropFrom(m) {
        const gv = Math.max(1, Math.round(m.gold * run.tier.gold * hero.goldMul)), n = m.isBoss ? 10 : 1 + (Math.random() < 0.4 ? 1 : 0);
        for (let i = 0; i < n; i++) addPickup('coin', m.x + rand(-0.8, 0.8), m.z + rand(-0.8, 0.8), Math.max(1, Math.round(gv / n * rand(0.8, 1.3))));
        if (Math.random() < 0.12) addPickup('heart', m.x + rand(-0.5, 0.5), m.z + rand(-0.5, 0.5));
        if (m.isBoss) { for (let i = 0; i < 2; i++) addPickup('item', m.x + rand(-1.4, 1.4), m.z + rand(-1.4, 1.4), core.rollItem(run.dg.lvl, run.tier.rar + 0.8, null, run.dg.id === 'abyss' ? 3 : 2)); }
        else if (Math.random() < 0.05 + run.tier.rar * 0.03) addPickup('item', m.x, m.z, core.rollItem(run.dg.lvl, run.tier.rar));
      }
      function addPickup(kind, x, z, val) {
        let mesh;
        if (kind === 'coin') { mesh = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.06, 10), S.bas(0xffd24a)); mesh.rotation.x = Math.PI / 2; }
        else if (kind === 'heart') { mesh = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), S.bas(0xff4a5a)); }
        else { const col = parseInt(core.RARITY[val.rar].color.slice(1), 16), grp = new T.Group(), gem = new T.Mesh(new T.OctahedronGeometry(0.32), S.bas(col)), beam = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.6, 6), S.bas(col, { transparent: true, opacity: 0.35 })); gem.position.y = 0.7; beam.position.y = 1.3; grp.add(gem, beam); mesh = grp; }
        mesh.position.set(x, kind === 'item' ? 0 : 0.35, z); S.scene.add(mesh); pickups.push({ kind, x, z, mesh, val, r: kind === 'item' ? 0.9 : 0.7, t: 0 });
      }
      function openChest() {
        const room = run.cur; room.opened = true; sfx('cheer'); banner('Mở rương!', 1100);
        for (let i = 0; i < 6; i++) addPickup('coin', rand(-1.5, 1.5), rand(-0.4, 0.8), Math.round(rand(4, 9) * run.tier.gold));
        addPickup('item', -0.8, 0.7, core.rollItem(run.dg.lvl, run.tier.rar + 0.6, null, run.dg.lvl >= 3 ? 2 : 1)); if (Math.random() < 0.5) addPickup('item', 0.8, 0.7, core.rollItem(run.dg.lvl, run.tier.rar + 0.3));
        addPickup('heart', 0, 1.1);
      }
      function takeItem(q) {
        const it = q.val; run.items.push(it); addInv(it); save(); sfx('good'); fl(it.icon + ' ' + core.RARITY[it.rar].name, 'foe crit', hero.x, hero.z, 2.4);
        const cur = meta.eq[it.slot], better = !cur || rate(it) > rate(cur) * 1.05;
        if (better) { if (cur && cur.id !== 'start') addInv(cur); meta.eq[it.slot] = it; const i = meta.inv.findIndex((x) => x.id === it.id); if (i >= 0) meta.inv.splice(i, 1); save(); say('Trang bị mới: ' + it.name + ' (' + core.RARITY[it.rar].name + ') — ' + core.statsText(it)); applyGear(false).then(bars); }
        else say('Nhặt được ' + it.name + ' (' + core.RARITY[it.rar].name + '), cất vào kho.');
      }
      function swing() {
        const w = hero.wdef; hero.atkT = w.cd; hero.atkAnim = 0.22; const tg = nearest(w.range + 1.6); if (tg) { const dx = tg.x - hero.x, dz = tg.z - hero.z, d = Math.hypot(dx, dz) || 1; hero.fx = dx / d; hero.fz = dz / d; }
        sfx('click');
        if (!w.melee) { const dx = hero.fx, dz = hero.fz, wb = meta.eq.weapon, mesh = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), S.bas(wb && wb.base === 'staff' ? 0xb78bff : 0xfff0c0)); mesh.position.set(hero.x + dx * 0.6, 1.2, hero.z + dz * 0.6); S.scene.add(mesh); shots.push({ mesh, x: hero.x + dx * 0.6, z: hero.z + dz * 0.6, vx: dx * 15, vz: dz * 15, life: w.range / 15 + 0.2, dmg: hero.atk }); return; }
        let hit = 0;
        for (const m of mobs) {
          if (m.hp <= 0) continue; const dx = m.x - hero.x, dz = m.z - hero.z, d = Math.hypot(dx, dz) - m.def.r; if (d > w.range) continue;
          const dot = (dx * hero.fx + dz * hero.fz) / (Math.hypot(dx, dz) || 1); if (dot < Math.cos(Math.PI * 0.42)) continue;
          const crit = Math.random() < hero.critP; dmgMob(m, Math.round(hero.atk * rand(0.9, 1.1) * (crit ? C.critMul : 1)), crit, 0.45); hit++;
        }
        if (hit) { sfx('kick'); bars(); }
      }
      function skill() {
        if (hero.skillCd > 0 || mode !== 'run') return; hero.skillCd = C.skillCd * (1 - hero.cdr); sfx('kick'); hero.atkAnim = 0.3;
        if (hero.wdef.melee) { const ring = new T.Mesh(new T.RingGeometry(0.5, 0.9, 28), new T.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0.7, side: T.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(hero.x, 0.1, hero.z); S.scene.add(ring); zones.push({ mesh: ring, x: hero.x, z: hero.z, r: 2.9, t: 0, delay: 0, dmg: 0, fx: true, life: 0.35 }); for (const m of mobs) { if (m.hp <= 0) continue; if (Math.hypot(m.x - hero.x, m.z - hero.z) - m.def.r < 2.9) { const crit = Math.random() < hero.critP; dmgMob(m, Math.round(hero.atk * 2.2 * (crit ? C.critMul : 1)), crit, 0.8); } } }
        else { for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, mesh = new T.Mesh(new T.SphereGeometry(0.14, 8, 6), S.bas(0xffd36a)); mesh.position.set(hero.x, 1.2, hero.z); S.scene.add(mesh); shots.push({ mesh, x: hero.x, z: hero.z, vx: Math.sin(a) * 12, vz: Math.cos(a) * 12, life: 0.8, dmg: hero.atk * 1.1 }); } }
        bars();
      }
      function dash() { if (!hero || hero.dashCd > 0 || hero.dashT > 0 || mode !== 'run') return; let dx = keys.d - keys.a + joy.x, dz = keys.s - keys.w + joy.z; const l = Math.hypot(dx, dz); if (l < 0.1) { dx = -hero.fx; dz = -hero.fz; } else { dx /= l; dz /= l; } hero.dvx = dx; hero.dvz = dz; hero.dashT = C.dash.time; hero.inv = Math.max(hero.inv, C.dash.iframes); hero.dashCd = C.dash.cd; sfx('click'); }
      function potion() { if (!run || run.potions <= 0 || hero.hp >= hero.maxHP || mode !== 'run') return; run.potions--; const h = Math.min(C.potionHeal + hero.maxHP * 0.15, hero.maxHP - hero.hp); hero.hp += h; fl('+' + Math.round(h), 'me heal', hero.x, hero.z, 2.1); sfx('good'); bars(); }
      let transT = 0;
      function sim(dt) {
        tNow += dt; if (mode !== 'run' || !run || run.over) return;
        if (tNow - run.t0 > C.maxSecs) { endRun(false, 'Hết giờ.'); return; }
        let ix = keys.d - keys.a + joy.x, iz = keys.s - keys.w + joy.z; const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
        hero.atkT -= dt; hero.atkAnim -= dt; hero.dashCd -= dt; hero.skillCd -= dt; hero.inv -= dt; hero.hurtT -= dt; transT -= dt;
        if (hero.dashT > 0) { hero.dashT -= dt; hero.x += hero.dvx * C.dash.speed * dt; hero.z += hero.dvz * C.dash.speed * dt; }
        else { hero.x += ix * hero.spd * dt; hero.z += iz * hero.spd * dt; if (il > 0.15) { const l2 = Math.hypot(ix, iz) || 1; hero.fx = ix / l2; hero.fz = iz / l2; } }
        const room = run.cur, locked = mobs.some((m) => m.hp > 0);
        // tường: trong phòng bị chặn; còn cửa đã mở thì đi xuyên qua được
        const mx = HALFW(), mz = HALFH(), doorN = room.doors.n && !locked, doorS = room.doors.s && !locked, doorW = room.doors.w && !locked, doorE = room.doors.e && !locked;
        const inX = Math.abs(hero.x) < 1.1, inZ = Math.abs(hero.z) < 1.1;
        hero.x = clamp(hero.x, (doorW && inZ) ? -W / 2 - 0.3 : -mx, (doorE && inZ) ? W / 2 + 0.3 : mx); hero.z = clamp(hero.z, (doorN && inX) ? -H / 2 - 0.3 : -mz, (doorS && inX) ? H / 2 + 0.3 : mz);
        let dirOut = null; if (hero.z < -H / 2 + 0.2 && doorN) dirOut = 'n'; else if (hero.z > H / 2 - 0.2 && doorS) dirOut = 's'; else if (hero.x < -W / 2 + 0.2 && doorW) dirOut = 'w'; else if (hero.x > W / 2 - 0.2 && doorE) dirOut = 'e';
        if (dirOut && transT <= 0) { const nb = run.map.byKey.get(run.map.key(room.x + DOORS[dirOut][0], room.y + DOORS[dirOut][1])); if (nb) { transT = 1; mode = 'trans'; enterRoom(nb, DOORS[dirOut][2]).then(() => { mode = 'run'; }).catch(() => { mode = 'run'; }); return; } }
        if (atkQueued && hero.atkT <= 0) swing(); if (keys.atk && hero.atkT <= 0) swing(); atkQueued = false;
        mobs.forEach((m) => updateMob(m, dt)); separate(); mobs.forEach((m) => { if (m.hp <= 0 && m.dying <= 0 && m.ent) { m.ent.remove(); m.ent = null; } }); mobs = mobs.filter((m) => m.hp > 0 || m.dying > 0);
        for (const b of bolts) { b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt; b.mesh.position.set(b.x, 1.2, b.z); if (Math.hypot(b.x - hero.x, b.z - hero.z) < 0.55 && hero.inv <= 0) { hurtHero(b.dmg, 'Tia ma thuật trúng bạn.'); b.life = 0; } if (Math.abs(b.x) > W / 2 + 0.5 || Math.abs(b.z) > H / 2 + 0.5) b.life = 0; }
        bolts = bolts.filter((b) => { if (b.life <= 0) { S.scene.remove(b.mesh); return false; } return true; });
        for (const b of shots) { b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt; b.mesh.position.set(b.x, 1.2, b.z); for (const m of mobs) { if (m.hp > 0 && Math.hypot(b.x - m.x, b.z - m.z) < m.def.r + 0.25) { const crit = Math.random() < hero.critP; dmgMob(m, Math.round(b.dmg * rand(0.9, 1.1) * (crit ? C.critMul : 1)), crit, 0.3); b.life = 0; bars(); break; } } if (Math.abs(b.x) > W / 2 || Math.abs(b.z) > H / 2) b.life = 0; }
        shots = shots.filter((b) => { if (b.life <= 0) { S.scene.remove(b.mesh); return false; } return true; });
        for (const z of zones) { z.t += dt; if (z.fx) { z.mesh.scale.setScalar(1 + z.t / z.life * 2.2); z.mesh.material.opacity = 0.7 * (1 - z.t / z.life); if (z.t >= z.life) z.dead = true; continue; } z.mesh.material.opacity = 0.2 + 0.4 * Math.min(1, z.t / z.delay); z.mesh.scale.setScalar(0.4 + 0.6 * Math.min(1, z.t / z.delay)); if (z.t >= z.delay && !z.hit) { z.hit = true; if (Math.hypot(hero.x - z.x, hero.z - z.z) < z.r) hurtHero(z.dmg, 'Đòn nện của trùm giáng trúng bạn.'); sfx('bad'); z.dead = true; z.t = z.delay + 0.2; } }
        zones = zones.filter((z) => { if (z.dead && (z.fx || z.t > z.delay + 0.15)) { S.scene.remove(z.mesh); return false; } return true; });
        for (const q of pickups) {
          q.t += dt; const dx = hero.x - q.x, dz = hero.z - q.z, d = Math.hypot(dx, dz) || 0.001;
          if (q.kind === 'coin') { if (d < 3) { q.x += dx / d * 9 * dt; q.z += dz / d * 9 * dt; } if (d < 0.6) { run.gold += q.val; q.dead = true; sfx('coin'); bars(); } }
          else if (q.kind === 'heart') { if (d < 2) { q.x += dx / d * 6 * dt; q.z += dz / d * 6 * dt; } if (d < 0.6) { hero.hp = Math.min(hero.maxHP, hero.hp + C.heartHeal + hero.maxHP * 0.05); q.dead = true; sfx('good'); bars(); } }
          else if (q.kind === 'item') { if (d < q.r) { takeItem(q); q.dead = true; } }
          else if (q.kind === 'chest') { if (d < q.r) { openChest(); q.dead = true; q.ent.remove(); q.ent = null; } }
          else if (q.kind === 'fountain') { if (d < q.r && !room.opened) { room.opened = true; const h = Math.round(hero.maxHP * 0.5); hero.hp = Math.min(hero.maxHP, hero.hp + h); fl('+' + h, 'me heal', hero.x, hero.z, 2.1); say('Nước thần hồi ' + h + ' máu.'); sfx('good'); bars(); } }
          else if (q.kind === 'portal') { q.ent.grp.rotation.y += dt * 1.5; if (d < 1.2) { q.dead = true; endRun(true, 'Bạn bước qua cổng linh hồn và thoát khỏi hầm ngục.'); } }
          if (q.mesh) { q.mesh.position.x = q.x; q.mesh.position.z = q.z; if (q.kind === 'item') q.mesh.rotation.y += dt * 2; if (q.kind === 'coin') q.mesh.rotation.z += dt * 5; }
        }
        pickups = pickups.filter((q) => { if (q.dead) { if (q.mesh) S.scene.remove(q.mesh); if (q.ent && q.kind !== 'chest') q.ent.remove(); return false; } return true; });
        if (mobs.length === 0 && !room.cleared && (room.type === 'combat' || room.type === 'boss')) {
          room.cleared = true; run.roomsCleared++; setDoors(); drawMap(); sfx('cheer');
          if (room.type === 'boss') { banner('Trùm đã gục!', 2000); S.spawn('loot_soul_crystal', 1.4).then((e) => { e.grp.position.set(0, 0.4, -1); pickups.push({ kind: 'portal', x: 0, z: -1, ent: e, r: 1.2, t: 0 }); say('Bước vào cổng linh hồn ở giữa phòng để rời hầm ngục (nhặt hết chiến lợi phẩm trước).'); }); }
          else { banner('Phòng đã sạch!', 1200); say('Cửa đã mở. Nhặt vàng rồi đi tiếp.'); }
        }
        if (Math.floor(tNow * 8) % 2 === 0) { bars(); setDoors(); }
      }
      function draw(dt) {
        if (mode === 'lobby' || mode === 'load' || !run) { if (lobbyHero && lobbyHero.grp.visible) { lobbyHero.grp.rotation.y += dt * 0.7; lobbyHero.grp.position.set(0, Math.abs(Math.sin(tNow * 2)) * 0.03, 0); if (lobbyWeapon) { const a = lobbyHero.grp.rotation.y - 1.15; lobbyWeapon.grp.position.set(Math.sin(a) * 0.8, 1.2, Math.cos(a) * 0.8); lobbyWeapon.grp.rotation.set(0.35, a, 0, 'YXZ'); } } S.render(tNow); return; }
        if (hero.ent) {
          const g = hero.ent.grp, mv = Math.hypot(keys.d - keys.a + joy.x, keys.s - keys.w + joy.z) > 0.1; g.position.set(hero.x, mv ? Math.abs(Math.sin(tNow * 9)) * 0.06 : 0, hero.z); g.rotation.y = Math.atan2(hero.fx, hero.fz) + (hero.atkAnim > 0 && hero.wdef.melee ? Math.sin((1 - hero.atkAnim / 0.22) * Math.PI) * 0.4 : 0); g.visible = !(hero.inv > 0 && Math.floor(tNow * 20) % 2 === 0 && hero.hurtT > -0.3);
          const wp = hero.weapon; if (wp) { const a0 = Math.atan2(hero.fx, hero.fz), mel = hero.wdef.melee, pv = hero.atkAnim > 0 ? 1 - hero.atkAnim / 0.22 : -1, off = !mel ? -0.6 : pv < 0 ? -1.15 : -1.15 + 2.3 * pv, th = !mel ? 0.1 + (pv >= 0 ? 0.25 : 0) : pv < 0 ? 0.35 : 1.25, sa = a0 + off; wp.grp.position.set(hero.x + Math.sin(sa) * 0.62, 0.95, hero.z + Math.cos(sa) * 0.62); wp.grp.rotation.set(th, sa, 0, 'YXZ'); wp.grp.visible = hero.dashT <= 0; }
        }
        mobs.forEach((m) => {
          if (!m.ent) return; const g = m.ent.grp, wind = m.state === 'wind', fy = (m.def.float || 0) + (m.def.float ? Math.sin(tNow * 2 + m.x) * 0.15 : 0), sq = wind ? 1 + Math.sin(tNow * 40) * 0.04 : 1;
          g.position.set(m.x, m.dying > 0 ? -0.5 * (1 - m.dying / 0.45) : fy, m.z); g.rotation.y = Math.atan2(m.fx, m.fz); g.scale.setScalar(m.ent.scale * (m.dying > 0 ? Math.max(0.05, m.dying / 0.45) : sq * (wind ? 1.06 : 1)));
          m.ent.mat.emissive.setHex(m.flash > 0 ? 0xff5533 : wind ? 0x661108 : 0x000000);
        });
        const lim = { x: Math.max(0, W / 2 - 4.6), z: Math.max(0, H / 2 - 3.2) }, tx = clamp(hero.x, -lim.x, lim.x), tz = clamp(hero.z, -lim.z, lim.z);
        S.cam.position.x += (tx - S.cam.position.x) * Math.min(1, dt * 5); S.cam.position.z += (tz + 7.2 - S.cam.position.z) * Math.min(1, dt * 5); S.cam.position.y = 8.2;
        S.cam.lookAt(S.cam.position.x, 0.4, S.cam.position.z - 7.0); S.torch.position.set(hero.x, 3.2, hero.z); S.render(tNow);
        for (const e of [...flEl.children]) { const q = e._p; q.t += dt; const pt = project({ x: q.x, y: q.y + q.t * 1.4, z: q.z }); e.style.left = pt.x + 'px'; e.style.top = pt.y + 'px'; }
        if (Math.floor(tNow * 4) % 2 === 0) drawMap();
      }
      const frame = (ts) => { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (ts - last) / 1000); last = ts; if (window.__dreadManual) return; sim(dt); draw(dt); };
      // ---- điều khiển
      const kmap = { w: 'w', arrowup: 'w', s: 's', arrowdown: 's', a: 'a', arrowleft: 'a', d: 'd', arrowright: 'd' };
      keyH = (e) => {
        if (mode !== 'run') return; const k = e.key.toLowerCase(); if (kmap[k]) { keys[kmap[k]] = 1; e.preventDefault(); e.stopPropagation(); return; }
        if (k === ' ' || k === 'j') { if (!e.repeat) atkQueued = true; keys.atk = 1; e.preventDefault(); e.stopPropagation(); } else if (k === 'shift' || k === 'k') { if (!e.repeat) dash(); e.preventDefault(); e.stopPropagation(); } else if (k === 'e' || k === 'q') { if (!e.repeat) potion(); e.preventDefault(); e.stopPropagation(); } else if (k === 'r' || k === 'f') { if (!e.repeat) skill(); e.preventDefault(); e.stopPropagation(); }
      };
      keyU = (e) => { const k = e.key.toLowerCase(); if (kmap[k]) keys[kmap[k]] = 0; if (k === ' ' || k === 'j') keys.atk = 0; };
      window.addEventListener('keydown', keyH, true); window.addEventListener('keyup', keyU, true);
      $('#drBtA').onpointerdown = (e) => { e.preventDefault(); atkQueued = true; keys.atk = 1; }; $('#drBtA').onpointerup = $('#drBtA').onpointerleave = () => { keys.atk = 0; };
      $('#drBtD').onclick = dash; $('#drBtP').onclick = potion; $('#drBtS').onclick = skill;
      let joyId = null, jc = null;
      stEl.addEventListener('pointerdown', (e) => {
        if (mode !== 'run') return; const r = stEl.getBoundingClientRect(), left = e.clientX - r.left < r.width * 0.45;
        if (e.pointerType === 'mouse' || !left) { atkQueued = true; if (e.pointerType === 'mouse') keys.atk = 1; return; }
        joyId = e.pointerId; jc = { x: e.clientX, y: e.clientY }; stEl.setPointerCapture(e.pointerId); joyEl.hidden = false; joyEl.style.left = (e.clientX - r.left - 48) + 'px'; joyEl.style.top = (e.clientY - r.top - 48) + 'px'; joyEl.style.bottom = 'auto';
      });
      stEl.addEventListener('pointermove', (e) => { if (e.pointerId !== joyId || !jc) return; let dx = e.clientX - jc.x, dz = e.clientY - jc.y; const l = Math.hypot(dx, dz), m = 44; if (l > m) { dx = dx / l * m; dz = dz / l * m; } joy = { x: dx / m, z: dz / m }; knob.style.transform = 'translate(' + dx + 'px,' + dz + 'px)'; });
      const joyEnd = (e) => { if (e.pointerId === joyId) { joyId = null; jc = null; joy = { x: 0, z: 0 }; knob.style.transform = ''; } keys.atk = 0; };
      stEl.addEventListener('pointerup', joyEnd); stEl.addEventListener('pointercancel', joyEnd);
      raf = requestAnimationFrame(frame);
      // móc cho kiểm thử tự động: đích đi tiếp theo (cửa tới phòng chưa dọn gần nhất)
      const nav = () => {
        if (!run) return null; const room = run.cur, q = [[room, null]], seen = new Set([run.map.key(room.x, room.y)]);
        const want = (r) => r !== room && (((r.type === 'combat' || r.type === 'boss') && !r.cleared) || (r.type === 'chest' && !r.opened));
        while (q.length) { const [r, first] = q.shift(); if (want(r)) return { dir: first, room: r }; for (const d of ['n', 's', 'w', 'e']) { if (!r.doors[d]) continue; const nb = run.map.byKey.get(run.map.key(r.x + DOORS[d][0], r.y + DOORS[d][1])); if (nb && !seen.has(run.map.key(nb.x, nb.y))) { seen.add(run.map.key(nb.x, nb.y)); q.push([nb, first || d]); } } } return null;
      };
      window.__dread = {
        dbg: () => { const nv = nav(), r = run && run.cur, g = nv && roomObj && roomObj.gates[nv.dir]; return { mode, hero: hero && hero.ent ? { x: hero.x, z: hero.z, hp: hero.hp, maxHP: hero.maxHP, dashCd: hero.dashCd, atkT: hero.atkT, skillCd: hero.skillCd } : null, mobs: mobs.filter((m) => m.hp > 0).map((m) => ({ x: m.x, z: m.z, st: m.state, kind: m.kind, hp: m.hp, boss: !!m.isBoss })), roomType: r && r.type, cleared: r && r.cleared, roomsCleared: run && run.roomsCleared, combatTotal: run && run.combatTotal, kills: run && run.kills, gold: run && run.gold, items: run && run.items.length, potions: run && run.potions, nav: nv && g ? { x: g.x, z: g.z } : null, nextType: nv && nv.room.type, pick: pickups.map((q) => ({ k: q.kind, x: q.x, z: q.z })), over: run && run.over, won: run && run.won, rooms: run && run.map.rooms.length }; },
        keys, atk: () => { atkQueued = true; }, dash, potion, skill, sim, draw, isDone: () => done, start: (d, t) => startRun(d, t), meta, lobby: () => lobbyView(), run: () => run,
      };
      lobbyView();
      if (window.__dreadAuto) startRun(window.__dreadAuto.dg || 'bone', window.__dreadAuto.tier || 0);
    });
  }

  function boot() {
    if (!KN.Mini || !KN.Mini.register || !KN.DreadCore) return;
    if (KN.Mini.onAbort) KN.Mini.onAbort.push(close);
    KN.Mini.register('dread', (p) => dread(p).then((r) => { close(); return r; }), '🗡️ Hầm ngục Dreadfall',
      'Hành động đi lại tự do kiểu Dungeon Quest / Soul Knight, chơi một mình (online co-op sẽ có sau). Ở sảnh: chọn 1 trong 5 hầm ngục và độ khó, xem trang bị, mua hòm, bán đồ. Trong hầm ngục: WASD hoặc mũi tên để di chuyển, Space/J/click để chém hoặc bắn (tự ngắm kẻ gần nhất), Shift/K để lướt né (bất tử ngắn), R/F kỹ năng đặc biệt, E/Q uống thuốc. Cửa khóa khi còn quái; hạ hết để đi tiếp, mở rương, uống nước hồi máu và đánh trùm ở phòng cuối. Quái báo đòn bằng vòng đỏ dưới chân. Trang bị rơi theo độ hiếm; vàng nhặt được đổi thành tiền vào cuộc đời khi kết thúc lượt. Điện thoại: chạm kéo bên trái để di chuyển, nút bên dưới để chém, lướt, kỹ năng, thuốc.',
      (p) => 'Sức khỏe ' + Math.round(p.ctx.stats.health) + ': ' + Math.round(C.baseHP + p.ctx.stats.health * C.hpPerHealth) + ' máu gốc, đỡ đòn tốt hơn, chạy nhanh hơn · Trí tuệ ' + Math.round(p.ctx.stats.smarts) + ': tỉ lệ chí mạng ' + Math.round((C.critBase + p.ctx.stats.smarts * C.critPerSmarts) * 100) + '% (chưa tính trang bị)');
  }
  boot();
  KN.Dread = { C };
})();
