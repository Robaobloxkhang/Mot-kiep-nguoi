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
    const geoOf = (name) => KN.DreadUI.geo(name);
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
      const core = D(), UI = KN.DreadUI, ico = UI.ico, st = p.ctx.stats, need = p.need != null ? p.need : 0.5, hpMulNeed = 0.9 + need * 0.2, dmgMulNeed = 0.9 + need * 0.2;
      const box = open('<div class="dr-top" id="drTop"></div>' +
        '<div class="dr-main" id="drMain"><div class="dr-left">' +
        '<div class="dr-stage" id="drSt"><canvas id="drCv" class="dr-cv" role="img" aria-label="Cảnh 3D: nhân vật hoặc hầm ngục"></canvas>' +
        '<div class="dr-hud" id="drHud" hidden><div class="hl"><div class="dr-bar me"><i id="drMe"></i><span id="drMeT"></span></div><div class="dr-xp" title="Kinh nghiệm"><i id="drXp"></i></div></div>' +
        '<div class="hm"><b id="drLoc"></b><span id="drRun"></span></div><div class="hr"><button type="button" class="ib2" id="drPause" aria-label="Tạm dừng (P)" title="Tạm dừng (P)">' + ico('pause', '', 16) + '</button><button type="button" class="ib2" id="drExit" aria-label="Rút lui khỏi hầm ngục" title="Rút lui">' + ico('exit', '', 16) + '</button></div>' +
        '<div class="dr-bar foe" id="drFoeW"><i id="drFoe"></i><span id="drFoeT"></span></div></div>' +
        '<canvas class="dr-map" id="drMap" width="132" height="96" hidden aria-label="Bản đồ hầm ngục"></canvas>' +
        '<div class="dr-float" id="drFl" aria-live="polite"></div><div class="dr-banner" id="drBn"></div>' +
        '<div class="dr-sl L" id="drSlL"></div><div class="dr-sl R" id="drSlR"></div>' +
        '<div class="dr-tools" id="drTools"><button type="button" class="ib2" data-z="-1" aria-label="Thu nhỏ" title="Thu nhỏ">' + ico('zoomout', '', 16) + '</button><button type="button" class="ib2" data-z="1" aria-label="Phóng to" title="Phóng to">' + ico('zoomin', '', 16) + '</button><button type="button" class="ib2" data-z="0" aria-label="Đặt lại góc nhìn" title="Đặt lại góc nhìn">' + ico('reset', '', 16) + '</button></div>' +
        '<div class="dr-load" id="drLoad" role="status">Đang tải mô hình 3D…</div>' +
        '<div class="dr-joy" id="drJoy" hidden><i id="drKnob"></i></div><div class="dr-end" id="drEnd" hidden></div></div>' +
        '<p class="dr-msg" id="drMsg"></p>' +
        '<div class="dr-btns" id="drBtns" hidden><button type="button" class="ab main" id="drBtA">' + ico('sword', '', 18) + '<span>Chém</span><kbd>Space</kbd></button><button type="button" class="ab" id="drBtD">' + ico('dash', '', 18) + '<span>Lướt</span><kbd>Shift</kbd><small id="drCd"></small></button><button type="button" class="ab" id="drBtS">' + ico('spin', '', 18) + '<span>Kỹ năng</span><kbd>R</kbd><small id="drSk"></small></button><button type="button" class="ab" id="drBtP">' + ico('potion', '', 18) + '<span>Thuốc</span><kbd>E</kbd><small id="drPot"></small></button></div>' +
        '<p class="mini-keys" id="drKeys" hidden><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> di chuyển · <kbd>Space</kbd>/<kbd>J</kbd>/click chém hoặc bắn (tự ngắm) · <kbd>Shift</kbd>/<kbd>K</kbd> lướt · <kbd>R</kbd>/<kbd>F</kbd> kỹ năng · <kbd>E</kbd>/<kbd>Q</kbd> thuốc · <kbd>P</kbd> tạm dừng</p></div>' +
        '<div class="dr-lobby" id="drLobby"></div></div><div class="dr-dlg" id="drDlg" hidden></div>');
      const $ = (s) => box.querySelector(s), msgEl = $('#drMsg'), flEl = $('#drFl'), bnEl = $('#drBn'), cv = $('#drCv'), stEl = $('#drSt'), lobEl = $('#drLobby'), mainEl = $('#drMain'), topEl = $('#drTop'), dlgEl = $('#drDlg'), endEl = $('#drEnd'), loadEl = $('#drLoad');
      const say = (t) => { msgEl.textContent = t; };
      if (!core.webgl()) { say('Cần WebGL để chơi minigame này.'); later(() => res({ score: 0, text: 'Trình duyệt này không hiển thị được cảnh 3D nên bạn không vào được hầm ngục.' }), 200); return; }
      let S;
      try { S = makeStage(cv); } catch (e) { later(() => res({ score: 0, text: 'Không dựng được cảnh 3D.' }), 200); return; }
      R = S; S.resize(); const onResize = () => S.resize(); window.addEventListener('resize', onResize); const od = S.dispose; S.dispose = () => { window.removeEventListener('resize', onResize); UI.disposeThumbs(); od(); };
      const T = S.T, V3 = (x, y, z) => new T.Vector3(x, y, z);
      const meta = core.loadMeta(), save = () => core.saveMeta(meta);
      const W = C.room.w, H = C.room.h, CAP = 40;
      let mode = 'lobby', best = 0, sessionRuns = 0, tNow = 0, done = false, last = performance.now();
      let run = null, hero = null, mobs = [], bolts = [], shots = [], zones = [], pickups = [], roomObj = null, keys = { w: 0, a: 0, s: 0, d: 0, atk: 0 }, joy = { x: 0, z: 0 }, atkQueued = false, lobbyHero = null, bossAdds = false;
      const joyEl = $('#drJoy'), knob = $('#drKnob');
      // ---------------------------------------------------------------- SẢNH: trạng thái giao diện
      const rate = (it) => (it ? (it.atk || 0) + (it.hp || 0) * 0.5 + (it.def || 0) * 2 + it.rar * 4 + (it.aff ? it.aff.length : 0) * 3 + (it.crit || 0) * 100 + (it.speed || 0) * 60 : -1);
      const lifeOn = () => { try { return !!(KN.Game && KN.Game.hasLife && KN.Game.hasLife() && !KN.Game.isDead()); } catch (e) { return false; } };
      const ctxLife = () => { try { return (KN.Game && KN.Game.miniContext && KN.Game.miniContext()) || null; } catch (e) { return null; } };
      const ageK = () => { const c = ctxLife(); return c ? (c.age < 12 ? 0.2 : c.age < 18 ? 0.5 : 1) : 1; };
      const pname = () => { const c = ctxLife(); return (c && c.name) || 'Lữ khách'; };
      let tab = 'dg', selDg = 'bone', selTier = 0, sel = null, selSlot = null, flt = { q: '', type: '', rar: '', sort: 'new', fav: false };
      const addInv = (it) => { if (meta.inv.length >= CAP) { meta.gold += core.sellValue(it); return false; } meta.inv.push(it); return true; };
      const cs = () => core.calcStats(meta, st);
      const lvlInfo = () => core.levelOf(meta.xp);
      const findItem = (id) => { const i = meta.inv.find((x) => x.id === id); if (i) return { it: i, slot: '' }; const s = core.SLOTS.find((x) => meta.eq[x.id] && meta.eq[x.id].id === id); return s ? { it: meta.eq[s.id], slot: s.id } : null; };
      const claimable = () => core.QUESTS.filter((q) => !meta.quests[q.id] && q.val(meta) >= q.goal).length;
      // hộp thoại xác nhận / bảng phụ
      function dlg(html, bind) { dlgEl.hidden = false; dlgEl.innerHTML = '<div class="dg" role="dialog" aria-modal="true">' + html + '</div>'; const x = dlgEl.querySelector('[data-close]'); if (x) x.onclick = () => { dlgEl.hidden = true; }; dlgEl.onclick = (e) => { if (e.target === dlgEl) dlgEl.hidden = true; }; if (bind) bind(dlgEl); const f = dlgEl.querySelector('button:not([data-close])') || x; if (f) f.focus(); }
      function ask(title, body, ok) { return new Promise((r) => { dlg('<h4>' + esc(title) + '</h4><p>' + body + '</p><div class="row"><button type="button" class="btn btn-ghost btn-sm" data-n>Hủy</button><button type="button" class="btn btn-primary btn-sm" data-y>' + esc(ok || 'Đồng ý') + '</button></div>', (d) => { d.querySelector('[data-n]').onclick = () => { dlgEl.hidden = true; r(false); }; d.querySelector('[data-y]').onclick = () => { dlgEl.hidden = true; r(true); }; }); }); }
      // ---------------------------------------------------------------- HUD sảnh
      function topView() {
        const c = cs(), lv = lvlInfo(), dg = core.DUNGEONS.find((d) => d.id === selDg), q = claimable();
        topEl.innerHTML = '<div class="av"><img alt="" data-th="character_hollow_knight|0|0|0.3|2.6"><span>' + ico('skull', '', 22) + '</span></div>' +
          '<div class="pn"><b>' + esc(pname()) + '</b><small>Cấp ' + lv.level + (lv.level >= core.MAXLV ? ' (tối đa)' : '') + '</small></div>' +
          '<div class="bars"><div class="dr-bar me" title="Máu tối đa"><i style="width:100%"></i><span>HP ' + c.maxHP + '</span></div><div class="dr-xp lg" title="Kinh nghiệm"><i style="width:' + (lv.need ? Math.round(lv.cur / lv.need * 100) : 100) + '%"></i><span>XP ' + (lv.need ? lv.cur + '/' + lv.need : 'MAX') + '</span></div></div>' +
          '<div class="gd" title="Vàng">' + ico('coin', '', 16) + '<b>' + meta.gold + '</b></div>' +
          '<div class="cur" title="Hầm ngục đang chọn">' + ico('map', '', 15) + '<span>' + esc(dg.name) + ' · ' + esc(core.TIERS[selTier].name) + '</span></div>' +
          '<div class="nv"><button type="button" data-go="gear" class="' + (['gear', 'storage', 'skills'].includes(tab) ? 'on' : '') + '">' + ico('bag', '', 15) + '<span>Hành trang</span></button><button type="button" data-go="shop" class="' + (tab === 'shop' ? 'on' : '') + '">' + ico('shop', '', 15) + '<span>Cửa hàng</span></button><button type="button" data-go="quests">' + ico('scroll', '', 15) + '<span>Nhiệm vụ</span>' + (q ? '<i class="dot">' + q + '</i>' : '') + '</button><button type="button" data-go="settings">' + ico('gear', '', 15) + '<span>Cài đặt</span></button><button type="button" data-go="done" class="fin">' + ico('check', '', 15) + '<span>Nộp kết quả' + (best ? ' (' + Math.round(best * 100) + '%)' : '') + '</span></button></div>';
        UI.hydrate(topEl);
        topEl.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { const g = b.dataset.go; sfx('click'); if (g === 'quests') questsPanel(); else if (g === 'settings') settingsPanel(); else if (g === 'done') finishSession(); else { tab = g; lobbyView(); } }));
      }
      // ô trang bị quanh nhân vật
      function slotsView() {
        const mk = (ids) => ids.map((id) => { const s = core.SLOTS.find((x) => x.id === id); return UI.slot(s, meta.eq[id], { sel: selSlot === id }); }).join('');
        $('#drSlL').innerHTML = mk(['helmet', 'armor', 'boots']); $('#drSlR').innerHTML = mk(['weapon', 'offhand', 'ring', 'ring2']);
        stEl.querySelectorAll('.ds').forEach((b) => (b.onclick = () => { const id = b.dataset.slot; selSlot = id; const it = meta.eq[id]; sel = it ? it.id : null; if (!['gear'].includes(tab)) tab = 'gear'; sfx('click'); lobbyView(); }));
        UI.hydrate($('#drSlL')); UI.hydrate($('#drSlR'));
      }
      function tabsHtml() { return '<div class="dr-tabs" role="tablist">' + [['dg', 'map', 'Hầm ngục'], ['gear', 'bag', 'Trang bị'], ['skills', 'bolt', 'Kỹ năng'], ['storage', 'bag', 'Kho đồ'], ['shop', 'shop', 'Cửa hàng']].map(([k, ic, l]) => '<button type="button" role="tab" data-tab="' + k + '" class="' + (tab === k ? 'on' : '') + '" aria-selected="' + (tab === k) + '">' + ico(ic, '', 14) + '<span>' + l + '</span></button>').join('') + '</div>'; }
      // ---------------------------------------------------------------- tab Hầm ngục: đường tiến trình
      const fmtT = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      function viewDg() {
        const lvl = lvlInfo().level, ds = core.DUNGEONS;
        const cards = ds.map((d, i) => {
          const un = core.unlocked(meta, d), cl = meta.clears[d.id] || {}, bm = core.MOBS[d.boss], prev = ds[i - 1], bt = [0, 1, 2].map((t) => meta.best[d.id + ':' + t]).filter(Boolean).sort((a, b) => a - b)[0];
          const hex = (n) => '#' + n.toString(16).padStart(6, '0'), bg = 'linear-gradient(135deg,' + hex(d.theme.floor[0]) + ',' + hex(d.theme.wall) + ')';
          return (i ? '<i class="cn' + (un ? ' on' : '') + '"></i>' : '') + '<button type="button" class="dg-c' + (selDg === d.id ? ' sel' : '') + (un ? '' : ' lock') + '" data-dg="' + d.id + '" aria-label="' + esc(d.name + (un ? '' : ', đang khóa')) + '">' +
            '<span class="th" style="background:' + bg + '">' + (d.env ? '<img alt="" data-th="' + d.env + '|0|0|0|1.5">' : '') + ico(un ? 'map' : 'lock', 'big', 30) + '</span>' +
            '<b>' + esc(d.name) + '</b><small>Cấp khuyến nghị ' + d.rec + (lvl < d.rec ? ' · bạn thấp hơn' : '') + '</small><small>' + '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars) + ' · ' + d.rooms + ' phòng</small>' +
            '<span class="bs"><img alt="" data-th="' + bm.model + '|' + (bm.tint || 0) + '|0|0|1.2">' + ico('skull', 'under', 20) + '<em>' + esc(bm.name) + '</em></span>' +
            '<small class="rw">Rơi: ' + rarRange(d) + '</small>' +
            (un ? '<small class="ok">Đã phá ' + ((cl[0] || 0) + (cl[1] || 0) + (cl[2] || 0)) + ' lần' + (bt ? ' · tốt nhất ' + fmtT(bt) : '') + '</small>' : '<small class="req">' + ico('lock', '', 11) + ' Phá đảo ' + esc(prev.name) + ' (độ Thường) để mở</small>') + '</button>';
        }).join('');
        const d = ds.find((x) => x.id === selDg), cl = meta.clears[d.id] || {}, unSel = core.unlocked(meta, d);
        const tiers = core.TIERS.map((t) => { const un = t.id === 0 || (cl[t.id - 1] || 0) > 0; return '<button type="button" data-tier="' + t.id + '" class="' + (selTier === t.id ? 'on' : '') + '"' + (un ? '' : ' disabled') + '><b>' + esc(t.name) + '</b><small>Quái ×' + t.hp + ' máu · ×' + t.dmg + ' sát thương</small><small>Vàng ×' + t.gold + ' · tiền ×' + t.money + '</small>' + (un ? '' : '<small class="req">Phá độ ' + esc(core.TIERS[t.id - 1].name) + ' để mở</small>') + '</button>'; }).join('');
        const w = core.lootWeights(d, core.TIERS[selTier]), tot = w.reduce((a, b) => a + b, 0);
        const dots = core.RARITY.map((r, i) => '<span class="rd" style="--rc:' + r.color + '" title="' + esc(r.name) + ': ' + (w[i] / tot * 100).toFixed(1) + '%"><i></i>' + esc(r.name) + ' ' + (w[i] / tot * 100 < 10 ? (w[i] / tot * 100).toFixed(1) : Math.round(w[i] / tot * 100)) + '%</span>').join('');
        return '<div class="dr-path">' + cards + '</div><div class="dr-sel"><p><b>' + esc(d.name) + '</b> — ' + esc(d.blurb) + '</p><div class="dr-tiers">' + tiers + '</div><div class="dr-rar">' + dots + '</div>' +
          '<div class="act"><button type="button" class="btn btn-primary" id="drGo"' + (unSel ? '' : ' disabled') + '>' + ico('sword', '', 16) + ' Vào ' + esc(d.name) + ' (' + esc(core.TIERS[selTier].name) + ')</button></div>' + (unSel ? '' : '<p class="dim">Hầm này đang khóa: phá đảo hầm trước ở độ Thường.</p>') + '</div>';
      }
      const rarRange = (d) => { const w = d.loot, hi = w.reduce((a, x, i) => (x / w.reduce((p, q) => p + q, 0) >= 0.01 ? i : a), 0); return core.RARITY[0].name + '–' + core.RARITY[hi].name; };
      // ---------------------------------------------------------------- lưới vật phẩm dùng chung (Trang bị / Kho đồ / Cửa hàng)
      const grid = (list, o) => (list.length ? '<div class="dgrid">' + list.map((e) => UI.card(e.it, { sel: sel === e.it.id, equipped: !!e.slot, price: o && o.price ? core.buyPrice(e.it) : null, afford: meta.gold >= core.buyPrice(e.it) })).join('') + '</div>' : '<div class="dempty">' + ico('bag', '', 34) + '<p>' + esc((o && o.empty) || 'Không có vật phẩm nào.') + '</p></div>');
      function detailHtml(o) {
        const f = o && o.shop ? { it: o.shop } : sel ? findItem(sel) : null; if (!f) return '<div class="dempty sm"><p>Chọn một vật phẩm để xem chi tiết và so sánh.</p></div>';
        const it = f.it, sl = core.slotsFor(it); let target = sl.find((s) => !meta.eq[s]) || sl.slice().sort((a, b) => rate(meta.eq[a]) - rate(meta.eq[b]))[0];
        return UI.detail(it, { meta, equippedSlot: f.slot || '', target, actions: o && o.shop ? 'shop' : 'inv', price: o && o.shop ? core.buyPrice(it) : 0, afford: o && o.shop ? meta.gold >= core.buyPrice(it) : true });
      }
      const eqEntries = () => core.SLOTS.filter((s) => meta.eq[s.id]).map((s) => ({ it: meta.eq[s.id], slot: s.id }));
      function viewGear() {
        const sc = selSlot ? core.SLOTS.find((s) => s.id === selSlot) : null;
        const list = meta.inv.filter((it) => !sc || it.slot === sc.type).map((it) => ({ it, slot: '' })).sort((a, b) => b.it.rar - a.it.rar || (b.it.req || 1) - (a.it.req || 1));
        const chips = '<div class="dchips"><button type="button" data-fslot="" class="' + (!sc ? 'on' : '') + '">Tất cả</button>' + core.SLOTS.map((s) => '<button type="button" data-fslot="' + s.id + '" class="' + (selSlot === s.id ? 'on' : '') + '">' + esc(s.name) + '</button>').join('') + '</div>';
        return '<div class="inv-h"><span>' + (sc ? 'Đồ hợp ô <b>' + esc(sc.name) + '</b>' : 'Chọn một ô trang bị bên trái hoặc bấm vào đồ trong kho') + '</span><span class="cap">' + meta.inv.length + '/' + CAP + '</span></div>' + chips +
          '<div class="gscroll">' + (sc && meta.eq[sc.id] ? '<p class="sub">Đang mặc</p>' + grid([{ it: meta.eq[sc.id], slot: sc.id }]) + '<p class="sub">Trong kho</p>' : '') + grid(list, { empty: sc ? 'Chưa có món nào hợp ô này. Mở rương trong hầm ngục hoặc mua ở cửa hàng.' : 'Kho trống. Đi hầm ngục để nhặt đồ.' }) + '</div><div class="dpane" id="drDet">' + detailHtml() + '</div>';
      }
      function storageList() {
        let a = meta.inv.map((it) => ({ it, slot: '' })).concat(eqEntries()); const q = flt.q.trim().toLowerCase();
        if (q) a = a.filter((e) => (e.it.name + ' ' + core.RARITY[e.it.rar].name).toLowerCase().includes(q));
        if (flt.type) a = a.filter((e) => e.it.slot === flt.type); if (flt.rar !== '') a = a.filter((e) => e.it.rar === +flt.rar); if (flt.fav) a = a.filter((e) => e.it.fav);
        const to = core.TYPES.map((t) => t.id), order = { new: (x, y) => meta.inv.indexOf(y.it) - meta.inv.indexOf(x.it), req: (x, y) => (y.it.req || 1) - (x.it.req || 1), rar: (x, y) => y.it.rar - x.it.rar, type: (x, y) => to.indexOf(x.it.slot) - to.indexOf(y.it.slot) || y.it.rar - x.it.rar };
        return a.sort(order[flt.sort] || order.new);
      }
      function viewStorage() {
        const opt = (arr, v) => arr.map(([k, l]) => '<option value="' + k + '"' + (String(v) === String(k) ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
        const list = storageList();
        return '<div class="inv-h"><span>Kho đồ</span><span class="cap" title="Sức chứa kho">' + meta.inv.length + '/' + CAP + (meta.inv.length >= CAP ? ' · đầy' : '') + '</span></div>' +
          '<div class="dflt"><input type="search" id="fQ" placeholder="Tìm tên hoặc độ hiếm" aria-label="Tìm kiếm" value="' + esc(flt.q) + '"><select id="fT" aria-label="Lọc loại">' + opt([['', 'Mọi loại']].concat(core.TYPES.map((t) => [t.id, t.name])), flt.type) + '</select><select id="fR" aria-label="Lọc độ hiếm">' + opt([['', 'Mọi độ hiếm']].concat(core.RARITY.map((r) => [r.id, r.name])), flt.rar) + '</select><select id="fS" aria-label="Sắp xếp">' + opt([['new', 'Mới nhất'], ['req', 'Cấp yêu cầu'], ['rar', 'Độ hiếm'], ['type', 'Loại']], flt.sort) + '</select><label class="chk"><input type="checkbox" id="fF"' + (flt.fav ? ' checked' : '') + '> Đã khóa</label></div>' +
          '<div class="gscroll">' + grid(list, { empty: meta.inv.length || eqEntries().length ? 'Không có món nào khớp bộ lọc.' : 'Kho trống. Đi hầm ngục để nhặt đồ.' }) + '</div><div class="dpane" id="drDet">' + detailHtml() + '</div>' +
          '<div class="bulk"><button type="button" class="btn btn-ghost btn-sm" id="drSellAll">Bán đồ Thường/Tốt không khóa</button></div>';
      }
      // ---------------------------------------------------------------- tab Kỹ năng
      function viewSkills() {
        const c = cs(), free = core.spFree(meta), lv = lvlInfo().level, tot = (lv - 1) * core.SP_PER_LEVEL;
        const rows = core.SKILLS.map((s) => { const n = (meta.sp && meta.sp[s.k]) || 0; return '<li><div><b>' + esc(s.name) + '</b><small>' + esc(s.desc) + '</small></div><span class="pts">' + n + '</span><button type="button" class="btn btn-soft btn-sm" data-sp="' + s.k + '" aria-label="Cộng điểm ' + esc(s.name) + '"' + (free > 0 && n < 20 ? '' : ' disabled') + '>+</button></li>'; }).join('');
        return '<div class="inv-h"><span>Điểm kỹ năng còn <b class="sp">' + free + '</b> / ' + tot + ' (nhận ' + core.SP_PER_LEVEL + ' điểm mỗi cấp, tối đa 20 điểm mỗi chỉ số)</span><button type="button" class="btn btn-ghost btn-sm" id="drSpReset"' + (core.spSpent(meta) ? '' : ' disabled') + '>Đặt lại kỹ năng</button></div><ul class="dsk">' + rows + '</ul>' +
          '<div class="dsum"><h5>Chỉ số hiện tại</h5><dl><dt>Máu tối đa</dt><dd>' + c.maxHP + '</dd><dt>' + (c.melee ? 'Sức mạnh vật lý' : 'Phép thuật') + ' (sát thương/đòn)</dt><dd>' + Math.round(c.atk) + '</dd><dt>Phòng thủ</dt><dd>' + c.def.toFixed(1) + '</dd><dt>Chí mạng</dt><dd>' + Math.round(c.crit * 100) + '%</dd><dt>Tốc độ chạy</dt><dd>' + c.spd.toFixed(2) + '</dd><dt>Hút máu / Vàng nhặt</dt><dd>' + Math.round(c.life * 100) + '% / +' + Math.round((c.goldMul - 1) * 100) + '%</dd></dl><p class="dim">Sức mạnh vật lý chỉ tác dụng với vũ khí cận chiến, Phép thuật chỉ với cung/trượng. Sức khỏe và trí tuệ ngoài đời cũng cộng vào máu, tốc chạy, chí mạng.</p></div>';
      }
      // ---------------------------------------------------------------- tab Cửa hàng
      function ensureShop() {
        if (meta.shop && meta.runs - meta.shop.at < 2 && meta.shop.items) return; const un = core.DUNGEONS.filter((d) => core.unlocked(meta, d)), top = un[un.length - 1] || core.DUNGEONS[0], w = core.lootWeights(top, core.TIERS[0]).map((x, i) => (i >= 4 ? 0 : x));
        meta.shop = { at: meta.runs, items: Array.from({ length: 6 }, () => core.rollItem(top.lvl, 0, null, 0, w)) }; save();
      }
      function viewShop() {
        ensureShop(); const list = meta.shop.items.map((it) => ({ it, slot: '' })), boxes = [['Hòm đồng', 90, 0, 'Thường–Hiếm'], ['Hòm bạc', 260, 2, 'Từ Hiếm trở lên'], ['Hòm vàng', 750, 3, 'Từ Sử thi trở lên']];
        const cur = sel && meta.shop.items.find((x) => x.id === sel);
        return '<div class="inv-h"><span>Hàng đang bán <small class="dim">(đổi hàng sau 2 lượt vào hầm)</small></span><button type="button" class="btn btn-soft btn-sm" id="drRefresh"' + (meta.gold >= 40 ? '' : ' disabled') + '>Làm mới · 40 vàng</button></div>' +
          '<div class="gscroll">' + grid(list, { price: true, empty: 'Đã hết hàng. Bấm Làm mới.' }) + '<p class="sub">Hòm trang bị (đồ ngẫu nhiên, trả bằng vàng trong game)</p><div class="dboxes">' + boxes.map((b, i) => '<button type="button" class="btn btn-soft btn-sm" data-box="' + i + '"' + (meta.gold >= b[1] ? '' : ' disabled') + '><b>' + b[0] + '</b><small>' + b[3] + '</small><span>' + ico('coin', '', 12) + ' ' + b[1] + '</span></button>').join('') + '<button type="button" class="btn btn-soft btn-sm" data-box="p"' + (meta.gold >= 120 && (meta.extraPotions || 0) < 4 ? '' : ' disabled') + '><b>Thuốc dự trữ</b><small>+1 bình mỗi lượt (đang +' + (meta.extraPotions || 0) + '/4)</small><span>' + ico('coin', '', 12) + ' 120</span></button></div></div><div class="dpane" id="drDet">' + detailHtml(cur ? { shop: cur } : null) + '</div>';
      }
      // ---------------------------------------------------------------- bảng nhiệm vụ / cài đặt
      function questsPanel() {
        const rows = core.QUESTS.map((q) => { const v = Math.min(q.goal, q.val(meta)), done = !!meta.quests[q.id], ok = v >= q.goal; return '<li><div><b>' + esc(q.name) + '</b><small>' + esc(q.desc) + ' (' + v + '/' + q.goal + ')</small><div class="dr-xp"><i style="width:' + Math.round(v / q.goal * 100) + '%"></i></div></div><button type="button" class="btn ' + (ok && !done ? 'btn-primary' : 'btn-ghost') + ' btn-sm" data-q="' + q.id + '"' + (ok && !done ? '' : ' disabled') + '>' + (done ? 'Đã nhận' : ok ? 'Nhận ' + q.reward + ' vàng' : q.reward + ' vàng') + '</button></li>'; }).join('');
        dlg('<h4>Nhiệm vụ</h4><ul class="dq">' + rows + '</ul><div class="row"><button type="button" class="btn btn-soft btn-sm" data-close>Đóng</button></div>', (d) => d.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { const q = core.QUESTS.find((x) => x.id === b.dataset.q); if (!q || meta.quests[q.id] || q.val(meta) < q.goal) return; meta.quests[q.id] = 1; meta.gold += q.reward; save(); sfx('coin'); say('Nhận ' + q.reward + ' vàng từ nhiệm vụ "' + q.name + '".'); questsPanel(); lobbyView(); })));
      }
      function settingsPanel() {
        dlg('<h4>Cài đặt</h4><label class="chk"><input type="checkbox" id="sDmg"' + (meta.set.dmg ? ' checked' : '') + '> Hiện số sát thương nổi</label><p class="dim">Tiến trình lưu trong bộ nhớ trình duyệt này (localStorage): không đồng bộ giữa các máy và sẽ mất nếu xóa dữ liệu trình duyệt.</p><div class="row"><button type="button" class="btn btn-ghost btn-sm" id="sWipe">Xóa toàn bộ tiến trình hầm ngục</button><button type="button" class="btn btn-soft btn-sm" data-close>Đóng</button></div>', (d) => {
          d.querySelector('#sDmg').onchange = (e) => { meta.set.dmg = e.target.checked; save(); };
          d.querySelector('#sWipe').onclick = async () => { if (await ask('Xóa tiến trình?', 'Mất toàn bộ vàng, trang bị, cấp độ, kỹ năng và tiến độ hầm ngục. Không hoàn tác được.', 'Xóa hết')) { Object.keys(meta).forEach((k) => delete meta[k]); Object.assign(meta, core.resetMeta()); sel = null; selSlot = null; selDg = 'bone'; selTier = 0; tab = 'dg'; save(); lobbyView(); updateLobbyHero(); say('Đã xóa tiến trình hầm ngục.'); } };
        });
      }
      // ---------------------------------------------------------------- vẽ sảnh + gắn sự kiện
      function lobbyView() {
        mode = 'lobby'; mainEl.classList.remove('run'); topEl.hidden = false; endEl.hidden = true; $('#drHud').hidden = true; $('#drMap').hidden = true; $('#drBtns').hidden = true; $('#drKeys').hidden = true; joyEl.hidden = true; $('#drTools').hidden = false; $('#drSlL').hidden = false; $('#drSlR').hidden = false;
        if (tab === 'dg' && false) tab = 'dg';
        const body = tab === 'dg' ? viewDg() : tab === 'gear' ? viewGear() : tab === 'skills' ? viewSkills() : tab === 'storage' ? viewStorage() : viewShop();
        const keepScroll = lobEl.querySelector('.gscroll') ? lobEl.querySelector('.gscroll').scrollTop : 0;
        lobEl.innerHTML = tabsHtml() + '<div class="dr-tb ' + tab + '">' + body + '</div>'; const gs = lobEl.querySelector('.gscroll'); if (gs) gs.scrollTop = keepScroll;
        topView(); slotsView(); UI.hydrate(lobEl); bindLobby(); S.resize();
      }
      function bindLobby() {
        lobEl.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; if (tab === 'dg') sel = null; sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-dg]').forEach((b) => (b.onclick = () => { selDg = b.dataset.dg; selTier = 0; sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-tier]').forEach((b) => (b.onclick = () => { selTier = +b.dataset.tier; sfx('click'); lobbyView(); }));
        const go = $('#drGo'); if (go) go.onclick = () => startRun(selDg, selTier);
        lobEl.querySelectorAll('.dc').forEach((b) => (b.onclick = () => { sel = b.dataset.id; const f = findItem(sel); if (f && f.slot) selSlot = f.slot; sfx('click'); lobbyView(); }));
        lobEl.querySelectorAll('[data-fslot]').forEach((b) => (b.onclick = () => { selSlot = b.dataset.fslot || null; sel = null; sfx('click'); lobbyView(); }));
        const q = $('#fQ'); if (q) { q.oninput = () => { flt.q = q.value; const pos = q.selectionStart; lobbyView(); const n = $('#fQ'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }; }
        [['#fT', 'type'], ['#fR', 'rar'], ['#fS', 'sort']].forEach(([id, k]) => { const e = $(id); if (e) e.onchange = () => { flt[k] = e.value; lobbyView(); }; }); const ff = $('#fF'); if (ff) ff.onchange = () => { flt.fav = ff.checked; lobbyView(); };
        const sa = $('#drSellAll'); if (sa) sa.onclick = async () => { const del = meta.inv.filter((it) => it.rar <= 1 && !it.fav); if (!del.length) { say('Không có món Thường/Tốt nào chưa khóa để bán.'); return; } const g = del.reduce((a, it) => a + core.sellValue(it), 0); if (await ask('Bán ' + del.length + ' món?', 'Bán toàn bộ đồ Thường/Tốt chưa khóa, nhận ' + g + ' vàng.', 'Bán')) { meta.inv = meta.inv.filter((it) => !(it.rar <= 1 && !it.fav)); meta.gold += g; if (sel && !findItem(sel)) sel = null; save(); sfx('coin'); say('Đã bán ' + del.length + ' món, nhận ' + g + ' vàng.'); lobbyView(); } };
        lobEl.querySelectorAll('[data-sp]').forEach((b) => (b.onclick = () => { if (core.spFree(meta) <= 0) return; const k = b.dataset.sp; meta.sp[k] = (meta.sp[k] || 0) + 1; save(); sfx('click'); lobbyView(); }));
        const rs = $('#drSpReset'); if (rs) rs.onclick = async () => { if (await ask('Đặt lại kỹ năng?', 'Thu hồi ' + core.spSpent(meta) + ' điểm đã cộng để bạn phân bổ lại (miễn phí).', 'Đặt lại')) { meta.sp = {}; save(); sfx('click'); lobbyView(); } };
        const rf = $('#drRefresh'); if (rf) rf.onclick = () => { if (meta.gold < 40) return; meta.gold -= 40; meta.shop = null; sel = null; save(); sfx('coin'); lobbyView(); };
        lobEl.querySelectorAll('[data-box]').forEach((b) => (b.onclick = () => { const k = b.dataset.box; if (k === 'p') { if (meta.gold >= 120 && (meta.extraPotions || 0) < 4) { meta.gold -= 120; meta.extraPotions = (meta.extraPotions || 0) + 1; save(); sfx('coin'); lobbyView(); } return; } const cost = [90, 260, 750][+k], minR = [0, 2, 3][+k]; if (meta.gold < cost) return; if (meta.inv.length >= CAP) { say('Kho đầy, hãy bán bớt đồ.'); return; } meta.gold -= cost; const un = core.DUNGEONS.filter((d) => core.unlocked(meta, d)), top = un[un.length - 1]; const it = core.rollItem(top.lvl, +k * 0.4, null, minR, core.lootWeights(top, core.TIERS[0]).map((x, i) => x * (1 + i * 0.4 * (+k)))); meta.inv.push(it); sel = it.id; tab = 'gear'; selSlot = null; save(); sfx('good'); say('Mở hòm: ' + it.name + ' (' + core.RARITY[it.rar].name + ').'); lobbyView(); }));
        const det = $('#drDet'); if (det) det.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => itemAct(b.dataset.act, b.dataset.slot)));
      }
      async function itemAct(act, slotId) {
        if (act === 'buy') { const it = meta.shop && meta.shop.items.find((x) => x.id === sel); if (!it) return; const pr = core.buyPrice(it); if (meta.gold < pr) return; if (meta.inv.length >= CAP) { say('Kho đầy, hãy bán bớt đồ.'); return; } meta.gold -= pr; meta.shop.items = meta.shop.items.filter((x) => x.id !== it.id); meta.inv.push(it); save(); sfx('coin'); say('Đã mua ' + it.name + '.'); lobbyView(); return; }
        const f = sel ? findItem(sel) : null; if (!f) return; const it = f.it;
        if (act === 'equip') { const why = core.canEquip(meta, it, slotId); if (why) { say(why); return; } const i = meta.inv.findIndex((x) => x.id === it.id); if (i < 0) return; const old = meta.eq[slotId]; meta.inv.splice(i, 1); if (old) meta.inv.push(old); meta.eq[slotId] = it; selSlot = slotId; save(); sfx('good'); say('Đã trang bị ' + it.name + (old ? ' (' + old.name + ' trở về kho).' : '.')); lobbyView(); updateLobbyHero(); }
        else if (act === 'unequip') { if (meta.inv.length >= CAP) { say('Kho đầy, không tháo được. Hãy bán bớt đồ.'); return; } meta.inv.push(it); delete meta.eq[f.slot]; save(); sfx('click'); say('Đã tháo ' + it.name + ' về kho.'); lobbyView(); updateLobbyHero(); }
        else if (act === 'fav') { it.fav = !it.fav; save(); sfx('click'); lobbyView(); }
        else if (act === 'sell') { if (it.fav) { say('Món này đang khóa, bỏ khóa trước khi bán.'); return; } const v = core.sellValue(it); if (it.rar >= 2 && !(await ask('Bán ' + it.name + '?', '<b style="color:' + core.RARITY[it.rar].color + '">' + esc(core.RARITY[it.rar].name) + '</b> · nhận ' + v + ' vàng. Không thể hoàn tác.', 'Bán'))) return; const i = meta.inv.findIndex((x) => x.id === it.id); if (i < 0) return; meta.inv.splice(i, 1); meta.gold += v; sel = null; save(); sfx('coin'); say('Đã bán ' + it.name + ' được ' + v + ' vàng.'); lobbyView(); }
      }
      // ---------------------------------------------------------------- xem trước nhân vật 3D (kéo để xoay, thu phóng, đặt lại)
      let lobbyRot = 0, lobbyZoom = 1, lobbyIdle = 0, lobbyDrag = null, lobbyWeapon = null, lobbyWeaponKey = '', lobbyBuilding = false;
      async function setupLobbyScene() {
        if (!S.lobbyGrp) { S.lobbyGrp = new T.Group(); const ped = new T.Mesh(new T.CylinderGeometry(1.5, 1.75, 0.22, 28), S.lam(0x2a2d3a)); ped.position.y = -0.11; S.lobbyGrp.add(ped); const ring = new T.Mesh(new T.TorusGeometry(1.52, 0.035, 6, 40), S.bas(0xd9a441)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.01; S.lobbyGrp.add(ring); const glow = new T.Mesh(new T.CircleGeometry(1.4, 28), S.bas(0x6a7fb0, { transparent: true, opacity: 0.16 })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.005; S.lobbyGrp.add(glow); S.scene.add(S.lobbyGrp); }
        S.scene.background.setRGB(0.1, 0.13, 0.19); S.scene.fog.color.setRGB(0.1, 0.13, 0.19); S.torch.color.setHex(0xffe2b8);
        S.lobbyGrp.visible = true; if (!lobbyHero) { lobbyHero = await S.spawn('character_hollow_knight', 2.4); lobbyHero.gear = []; } lobbyHero.grp.visible = true; loadEl.hidden = true;
      }
      const lobbyCam = () => { S.cam.position.set(0, 2.5 * lobbyZoom + 0.1, 6.8 * lobbyZoom); S.cam.lookAt(0, 1.25, 0); S.torch.position.set(1.5, 3.4, 3.5); };
      // trang phục trên người: mô hình bộ kit chỉ có vũ khí cận chiến, nên mũ/giáp/giày/khiên/nhẫn được dựng bằng khối đơn giản gắn thẳng vào nhân vật
      function dressHero(ent, hh, withWeapon) {
        if (!ent) return; const s = ent.scale, k = hh / 2.4, col = (it) => { const c = new T.Color(core.RARITY[it.rar].color); c.lerp(new T.Color(0x8a90a0), 0.5); return c; };
        (ent.gear || []).forEach((g) => { ent.grp.remove(g.m); if (g.own) { g.m.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); } if (g.rm) g.rm(); }); ent.gear = [];
        const put = (m, x, y, z, rx, ry, rz) => { m.position.set(x * k / s, y * k / s, z * k / s); m.scale.multiplyScalar(k / s); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); ent.grp.add(m); ent.gear.push({ m, own: true }); return m; };
        const mat = (it) => new T.MeshLambertMaterial({ color: col(it), flatShading: true });
        const E = meta.eq;
        if (E.helmet) put(new T.Mesh(new T.SphereGeometry(0.43, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(E.helmet)), 0, 2.0, 0.0);
        if (E.armor) { [-1, 1].forEach((sg) => put(new T.Mesh(new T.SphereGeometry(0.2, 12, 8), mat(E.armor)), sg * 0.5, 1.52, 0)); put(new T.Mesh(new T.BoxGeometry(0.62, 0.16, 0.36), mat(E.armor)), 0, 1.07, 0); }
        if (E.boots) [-1, 1].forEach((sg) => put(new T.Mesh(new T.BoxGeometry(0.26, 0.15, 0.4), mat(E.boots)), sg * 0.2, 0.08, 0.07));
        if (E.offhand) { const b = E.offhand.base; if (b === 'tome') put(new T.Mesh(new T.BoxGeometry(0.34, 0.06, 0.26), mat(E.offhand)), 0.58, 0.88, 0.22, 0.2, 0.3, 0); else put(new T.Mesh(new T.CylinderGeometry(b === 'tower' ? 0.4 : 0.3, b === 'tower' ? 0.4 : 0.3, 0.07, 18), mat(E.offhand)), 0.62, 1.0, 0.1, 0, 0, Math.PI / 2); }
        if (E.ring) put(new T.Mesh(new T.TorusGeometry(0.1, 0.035, 6, 14), mat(E.ring)), 0.54, 0.7, 0.06, Math.PI / 2, 0, 0);
        if (E.ring2) put(new T.Mesh(new T.TorusGeometry(0.1, 0.035, 6, 14), mat(E.ring2)), -0.54, 0.7, 0.06, Math.PI / 2, 0, 0);
        if (withWeapon) { if (lobbyWeapon) { lobbyWeapon.remove(); lobbyWeapon = null; } const w = E.weapon; lobbyWeaponKey = w ? w.id : ''; if (w) { const b = core.baseOf(w); makeWeapon(w, k * 0.92).then((we) => { if (!we) return; if (lobbyWeaponKey !== w.id || mode !== 'lobby') { we.remove(); return; } S.scene.remove(we.grp); ent.grp.add(we.grp); we.grp.scale.setScalar(1 / s); we.grp.position.set(-0.5 * k / s, 0.78 * k / s, 0.12 * k / s); we.grp.rotation.set((we.flip ? Math.PI : 0) + 0.5, 0, 0.08); lobbyWeapon = we; we.remove = () => { ent.grp.remove(we.grp); lobbyWeapon = null; }; }).catch(() => {}); } }
      }
      async function updateLobbyHero() {
        if (lobbyBuilding) return; lobbyBuilding = true;
        try { await setupLobbyScene(); dressHero(lobbyHero, 2.4, true); } catch (e) { loadEl.textContent = 'Không tải được mô hình nhân vật.'; } lobbyBuilding = false;
      }
      // vũ khí bọc trong nhóm "hold": gốc của hold = điểm cầm trong bàn tay; mô hình kiếm bị ngược (mũi ở dưới) nên lật bằng flip
      async function makeWeapon(it, mul) {
        const b = core.baseOf(it); if (!b) return null; const m = mul || 1, h = (b.h || 1.5) * m;
        const e = b.proc ? S.proc(b.proc) : await S.spawn(b.model, h); S.scene.remove(e.grp); const hold = new T.Group(); hold.add(e.grp); if (b.proc) e.grp.scale.setScalar(m);
        e.grp.position.y = -(b.grip || 0) * h; S.scene.add(hold);
        return { grp: hold, flip: !!b.flip, scale: 1, remove() { S.scene.remove(hold); hold.parent && hold.parent.remove(hold); e.remove(); } };
      }
      $('#drTools').querySelectorAll('[data-z]').forEach((b) => (b.onclick = () => { const z = +b.dataset.z; lobbyZoom = z === 0 ? 1 : clamp(lobbyZoom - z * 0.14, 0.6, 1.5); if (z === 0) lobbyRot = 0; lobbyIdle = 0; }));
      cv.addEventListener('wheel', (e) => { if (mode !== 'lobby') return; e.preventDefault(); lobbyZoom = clamp(lobbyZoom + Math.sign(e.deltaY) * 0.08, 0.6, 1.5); }, { passive: false });
      cv.addEventListener('pointerdown', (e) => { if (mode !== 'lobby') return; lobbyDrag = { id: e.pointerId, x: e.clientX }; lobbyIdle = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
      cv.addEventListener('pointermove', (e) => { if (!lobbyDrag || e.pointerId !== lobbyDrag.id) return; lobbyRot += (e.clientX - lobbyDrag.x) * 0.012; lobbyDrag.x = e.clientX; lobbyIdle = 0; });
      const dragEnd = (e) => { if (lobbyDrag && e.pointerId === lobbyDrag.id) lobbyDrag = null; }; cv.addEventListener('pointerup', dragEnd); cv.addEventListener('pointercancel', dragEnd);
      // ---------------------------------------------------------------- VÀO HẦM NGỤC
      async function startRun(dgId, tierId) {
        const dg = core.DUNGEONS.find((d) => d.id === dgId), tier = core.TIERS[tierId]; if (!dg || !tier || !core.unlocked(meta, dg)) return;
        mainEl.classList.add('run'); topEl.hidden = true; $('#drTools').hidden = true; $('#drSlL').hidden = true; $('#drSlR').hidden = true; endEl.hidden = true; dlgEl.hidden = true; say('Đang dựng hầm ngục…'); mode = 'load'; loadEl.hidden = false; loadEl.textContent = 'Đang dựng hầm ngục…'; S.resize();
        if (S.lobbyGrp) S.lobbyGrp.visible = false; if (lobbyHero) lobbyHero.grp.visible = false; if (lobbyWeapon) { lobbyWeapon.remove(); lobbyWeapon = null; lobbyWeaponKey = ''; }
        meta.runs++; save();
        const map = core.genMap(dg), sx = map.rooms[0], wts = core.lootWeights(dg, tier);
        run = { dg, tier, map, cur: sx, gold: 0, items: [], kills: 0, roomsCleared: 0, combatTotal: map.rooms.filter((r) => r.type === 'combat' || r.type === 'boss').length, potions: C.potions + (meta.extraPotions || 0), t0: tNow, over: false, won: false, wts, wtsC: wts.map((w, i) => w * (1 + i * 0.5)), wtsB: wts.map((w, i) => w * (1 + i * 1.2)) };
        S.scene.background.setHex(dg.theme.fog); S.scene.fog.color.setHex(dg.theme.fog); S.torch.color.setHex(dg.theme.torch);
        hero = { x: 0, z: 0, fx: 0, fz: -1, atkT: 0, atkAnim: 0, dashT: 0, dashCd: 0, skillCd: 0, inv: 0, ent: null, weapon: null, wkey: '', hurtT: 0, r: 0.4, hp: 1, maxHP: 1, defense: 0, atk: 15, spd: 4.3, critP: 0.1, lifeP: 0, goldMul: 1, cdr: 0, wdef: null };
        mobs = []; bolts = []; shots = []; zones = []; pickups = [];
        try { hero.ent = await S.spawn('character_hollow_knight', 2.0); hero.ent.gear = []; } catch (e) { say('Không tải được mô hình nhân vật.'); run = null; lobbyView(); updateLobbyHero(); return; }
        await applyGear(true);
        mode = 'run'; loadEl.hidden = true; $('#drHud').hidden = false; $('#drMap').hidden = false; $('#drBtns').hidden = false; $('#drKeys').hidden = false; if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) joyEl.hidden = false;
        await enterRoom(sx, null);
        S.resize();
      }
      async function applyGear(first) {
        const c = core.calcStats(meta, st), prevMax = hero.maxHP, w = c.g.weapon, b = w ? core.baseOf(w) : null;
        hero.maxHP = c.maxHP; hero.hp = first ? hero.maxHP : Math.min(hero.maxHP, hero.hp + Math.max(0, hero.maxHP - prevMax));
        hero.defense = c.def; hero.atk = c.atk; hero.spd = c.spd; hero.critP = c.crit; hero.lifeP = c.life; hero.goldMul = c.goldMul; hero.cdr = c.cdr;
        hero.wdef = b ? { melee: b.melee, range: b.range, cd: b.cd } : { melee: true, range: 1.2, cd: 0.55 };
        if (hero.wkey !== (w ? w.id : '')) { if (hero.weapon) { hero.weapon.remove(); hero.weapon = null; } hero.wkey = w ? w.id : ''; if (w) { try { hero.weapon = await makeWeapon(w); } catch (e) { /* */ } } }
        if (hero.ent) dressHero(hero.ent, 2.0, false);
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
        if (!run || !hero) return; $('#drMe').style.width = clamp(hero.hp / hero.maxHP * 100, 0, 100) + '%'; $('#drMeT').textContent = 'HP ' + Math.max(0, Math.round(hero.hp)) + '/' + hero.maxHP;
        const lv = core.levelOf(meta.xp); $('#drXp').style.width = (lv.need ? Math.round(lv.cur / lv.need * 100) : 100) + '%';
        const alive = mobs.filter((m) => m.hp > 0), bosses = alive.filter((m) => m.isBoss), grp = bosses.length ? bosses : alive, tot = grp.reduce((a, m) => a + m.hp, 0), mx = grp.reduce((a, m) => a + m.max, 0);
        $('#drFoeW').classList.toggle('boss', bosses.length > 0); $('#drFoeW').hidden = !alive.length;
        $('#drFoe').style.width = (mx ? clamp(tot / mx * 100, 0, 100) : 0) + '%'; $('#drFoeT').textContent = bosses.length ? (bosses.length === 1 ? bosses[0].def.name : 'Trùm · ' + bosses.length + ' kẻ') + ' ' + Math.round(tot) + '/' + mx : 'Quái còn ' + alive.length;
        $('#drLoc').textContent = run.dg.name + ' · ' + run.tier.name; const vis = run.map.rooms.filter((r) => r.visited).length;
        $('#drRun').innerHTML = 'Cấp ' + lv.level + ' · Phòng ' + vis + '/' + run.map.rooms.length + ' · ' + ico('coin', '', 12) + ' ' + run.gold + ' · ' + run.items.length + ' đồ';
        $('#drPot').textContent = '×' + run.potions;
        const cd = Math.max(0, hero.dashCd), sk = Math.max(0, hero.skillCd); $('#drCd').textContent = cd > 0.05 ? cd.toFixed(1) + 's' : ''; $('#drSk').textContent = sk > 0.05 ? sk.toFixed(0) + 's' : '';
        $('#drBtD').classList.toggle('cd', cd > 0.05); $('#drBtS').classList.toggle('cd', sk > 0.05);
      };
      const banner = (t, ms) => { bnEl.textContent = t; bnEl.classList.add('on'); later(() => bnEl.classList.remove('on'), ms || 1600); };
      const fl = (txt, cls, x, z, y) => { if (!meta.set.dmg && /^foe/.test(cls || '') && !/crit/.test(cls)) return; const e = document.createElement('b'); e.className = cls || ''; e.textContent = txt; e._p = { x, z, y: y || 1.8, t: 0 }; flEl.appendChild(e); setTimeout(() => e.remove(), 900); };
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
      function leaveRun() {
        run = null; if (roomObj) { roomObj.remove(); roomObj = null; } if (hero && hero.ent) { hero.ent.remove(); hero.ent = null; } if (hero && hero.weapon) { hero.weapon.remove(); hero.weapon = null; } pickups.forEach((q) => { if (q.ent) q.ent.remove(); if (q.mesh) S.scene.remove(q.mesh); }); pickups = []; mobs.forEach((m) => m.ent && m.ent.remove()); mobs = [];
        bolts.forEach((b) => S.scene.remove(b.mesh)); bolts = []; shots.forEach((b) => S.scene.remove(b.mesh)); shots = []; zones.forEach((z) => S.scene.remove(z.mesh)); zones = []; flEl.innerHTML = '';
        endEl.hidden = true; mainEl.classList.remove('run'); hero = null; lobbyWeaponKey = ''; say(''); lobbyView(); updateLobbyHero();
      }
      function endRun(won, why) {
        if (!run || run.over) return; run.over = true; run.won = won; mode = 'end'; const sc = score(); best = Math.max(best, sc); sessionRuns++;
        // phần thưởng chỉ trao một lần ở đây (run.over chặn gọi lại)
        const keepGold = won ? run.gold : Math.round(run.gold * 0.6), xpGain = Math.round((run.kills * 4 + run.roomsCleared * 12 + (won ? 80 : 0)) * (1 + run.tier.id * 0.5)), before = core.levelOf(meta.xp).level;
        meta.gold += keepGold; meta.xp = (meta.xp || 0) + xpGain; meta.kills += run.kills; meta.rooms = (meta.rooms || 0) + run.roomsCleared; meta.bestGold = Math.max(meta.bestGold || 0, run.gold);
        const secs = Math.round(tNow - run.t0);
        if (won) { const cl = (meta.clears[run.dg.id] = meta.clears[run.dg.id] || {}); cl[run.tier.id] = (cl[run.tier.id] || 0) + 1; meta.wins = (meta.wins || 0) + 1; const k = run.dg.id + ':' + run.tier.id; if (!meta.best[k] || secs < meta.best[k]) meta.best[k] = secs; }
        const after = core.levelOf(meta.xp); save();
        const cash = Math.min(C.moneyCap, Math.round(keepGold * C.moneyPerGold * run.tier.money * ageK() / 1e4) * 1e4);
        const nextDg = won ? core.DUNGEONS[core.DUNGEONS.findIndex((d) => d.id === run.dg.id) + 1] : null, nextOk = nextDg && core.unlocked(meta, nextDg);
        $('#drBtns').hidden = true; $('#drKeys').hidden = true; $('#drHud').hidden = true; $('#drMap').hidden = true; joyEl.hidden = true; mobs.forEach((m) => m.ent && m.ent.remove()); mobs = [];
        const lv = after, xpPct = lv.need ? Math.round(lv.cur / lv.need * 100) : 100;
        endEl.hidden = false; endEl.innerHTML = '<div class="box ' + (won ? 'win' : 'lose') + '"><h4>' + ico(won ? 'trophy' : 'skull', '', 22) + ' ' + (won ? 'Phá đảo ' + esc(run.dg.name) + '!' : 'Bạn gục ngã') + '</h4><p class="why">' + esc(why || '') + '</p>' +
          '<div class="rw"><span>' + ico('coin', '', 15) + ' <b>+' + keepGold + '</b> vàng' + (won ? '' : ' <small>(giữ 60% của ' + run.gold + ')</small>') + '</span><span>' + ico('star', '', 15) + ' <b>+' + xpGain + '</b> XP</span><span>' + run.kills + ' quái · ' + run.roomsCleared + '/' + run.combatTotal + ' phòng · ' + fmtT2(secs) + '</span></div>' +
          '<div class="dr-xp lg"><i style="width:' + xpPct + '%"></i><span>Cấp ' + lv.level + (lv.need ? ' · ' + lv.cur + '/' + lv.need + ' XP' : ' · tối đa') + '</span></div>' + (after.level > before ? '<p class="lvup">Lên cấp ' + after.level + '! Bạn có ' + core.spFree(meta) + ' điểm kỹ năng chưa dùng (tab Kỹ năng).</p>' : '') +
          '<p class="sub">Chiến lợi phẩm (' + run.items.length + ')</p>' + (run.items.length ? '<div class="dgrid loot">' + run.items.map((it) => UI.card(it, {})).join('') + '</div>' : '<p class="dim">Không có trang bị nào rơi ra lần này.</p>') +
          '<div class="act">' + (nextOk ? '<button type="button" class="btn btn-primary btn-sm" id="drNext">Tiếp tục: ' + esc(nextDg.name) + '</button>' : '') + (cash > 0 && lifeOn() ? '<button type="button" class="btn btn-soft btn-sm" id="drCash">' + ico('coin', '', 14) + ' Nhận ' + fmtMoney(cash) + ' vào cuộc đời</button>' : '<span class="dim">' + (lifeOn() ? 'Chưa kiếm được tiền lần này.' : 'Cần một cuộc đời đang chơi để đổi vàng thành tiền.') + '</span>') + '<button type="button" class="btn btn-soft btn-sm" id="drLobby2">Về sảnh</button><button type="button" class="btn btn-ghost btn-sm" id="drDone2">Nộp kết quả</button></div></div>';
        UI.hydrate(endEl); endEl.querySelectorAll('.dc').forEach((b) => (b.disabled = true));
        let claimed = false; const cb = $('#drCash'); if (cb) cb.onclick = () => { if (claimed) return; claimed = true; try { KN.Game.onlineMoney(cash, 'Hầm ngục Dreadfall: bán chiến lợi phẩm được ' + fmtMoney(cash) + '.', '🗡️'); } catch (e) { /* */ } cb.disabled = true; cb.textContent = 'Đã nhận ' + fmtMoney(cash); sfx('coin'); };
        $('#drLobby2').onclick = () => { selDg = run.dg.id; selTier = run.tier.id; tab = 'dg'; leaveRun(); };
        $('#drDone2').onclick = () => finishSession(); const nx = $('#drNext'); if (nx) nx.onclick = () => { const id = nextDg.id; selDg = id; selTier = 0; leaveRun(); startRun(id, 0); };
      }
      const fmtT2 = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
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
        if (m.isBoss) { for (let i = 0; i < 2; i++) addPickup('item', m.x + rand(-1.4, 1.4), m.z + rand(-1.4, 1.4), core.rollItem(run.dg.lvl, 0, null, run.dg.id === 'abyss' ? 3 : 2, run.wtsB)); }
        else if (Math.random() < 0.05 + run.tier.rar * 0.03) addPickup('item', m.x, m.z, core.rollItem(run.dg.lvl, 0, null, 0, run.wts));
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
        addPickup('item', -0.8, 0.7, core.rollItem(run.dg.lvl, 0, null, run.dg.lvl >= 3 ? 2 : 1, run.wtsC)); if (Math.random() < 0.5) addPickup('item', 0.8, 0.7, core.rollItem(run.dg.lvl, 0, null, 0, run.wtsC));
        addPickup('heart', 0, 1.1);
      }
      function takeItem(q) {
        const it = q.val; run.items.push(it); if (it.rar >= 2) meta.rareFound = (meta.rareFound || 0) + 1; if (it.rar >= 3) meta.epicFound = (meta.epicFound || 0) + 1; const R = core.RARITY[it.rar], stored = addInv(it); sfx('good'); fl(R.name + ': ' + it.name, 'foe crit', hero.x, hero.z, 2.4);
        if (!stored) { say('Kho đầy: ' + it.name + ' được bán tự động lấy ' + core.sellValue(it) + ' vàng.'); save(); return; }
        // tự mang vào ô còn trống, hoặc thay món yếu hơn ≥5% nếu đủ cấp
        let tgt = null; core.slotsFor(it).forEach((sid) => { if (core.canEquip(meta, it, sid)) return; const cur = meta.eq[sid]; if (!cur) { if (!tgt || meta.eq[tgt]) tgt = sid; } else if (!tgt && rate(it) > rate(cur) * 1.05) tgt = sid; });
        if (tgt) { const i = meta.inv.findIndex((x) => x.id === it.id), old = meta.eq[tgt]; if (i >= 0) meta.inv.splice(i, 1); if (old) meta.inv.push(old); meta.eq[tgt] = it; save(); say('Trang bị mới: ' + it.name + ' (' + R.name + ') — ' + core.statsText(it)); applyGear(false).then(bars); }
        else { save(); say('Nhặt được ' + it.name + ' (' + R.name + ')' + ((it.req || 1) > core.levelOf(meta.xp).level ? ', cần cấp ' + it.req + ' để dùng' : '') + ', cất vào kho.'); }
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
        if (dirOut && transT <= 0) { const nb = run.map.byKey.get(run.map.key(room.x + DOORS[dirOut][0], room.y + DOORS[dirOut][1])); if (nb) { transT = 1; mode = 'trans'; enterRoom(nb, DOORS[dirOut][2]).then(() => { mode = 'run'; }).catch((er) => { console.error('enterRoom', er && er.stack || er); mode = 'run'; }); return; } }
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
        if (mode === 'lobby' || mode === 'load' || !run) { if (lobbyHero && lobbyHero.grp.visible) { lobbyIdle += dt; if (!lobbyDrag && lobbyIdle > 4) lobbyRot += dt * 0.4; lobbyHero.grp.rotation.y = lobbyRot; lobbyHero.grp.position.set(0, 0, 0); if (S.lobbyGrp) S.lobbyGrp.rotation.y = 0; lobbyCam(); } S.render(tNow); return; }
        if (hero.ent) {
          const g = hero.ent.grp, mv = Math.hypot(keys.d - keys.a + joy.x, keys.s - keys.w + joy.z) > 0.1; g.position.set(hero.x, mv ? Math.abs(Math.sin(tNow * 9)) * 0.06 : 0, hero.z); g.rotation.y = Math.atan2(hero.fx, hero.fz) + (hero.atkAnim > 0 && hero.wdef.melee ? Math.sin((1 - hero.atkAnim / 0.22) * Math.PI) * 0.4 : 0); g.visible = !(hero.inv > 0 && Math.floor(tNow * 20) % 2 === 0 && hero.hurtT > -0.3);
          const wp = hero.weapon; if (wp) { const a0 = Math.atan2(hero.fx, hero.fz), mel = hero.wdef.melee, pv = hero.atkAnim > 0 ? 1 - hero.atkAnim / 0.22 : -1, off = !mel ? -0.6 : pv < 0 ? -1.15 : -1.15 + 2.3 * pv, th = !mel ? 0.1 + (pv >= 0 ? 0.25 : 0) : pv < 0 ? 0.35 : 1.25, sa = a0 + off; wp.grp.position.set(hero.x + Math.sin(sa) * 0.62, 0.95, hero.z + Math.cos(sa) * 0.62); wp.grp.rotation.set(th + (wp.flip ? Math.PI : 0), sa, 0, 'YXZ'); wp.grp.visible = hero.dashT <= 0; }
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
        const k0 = e.key.toLowerCase(); if ((mode === 'run' || mode === 'pause') && (k0 === 'p' || k0 === 'escape') && !e.repeat) { pauseToggle(); e.preventDefault(); e.stopPropagation(); return; }
        if (mode !== 'run') return; const k = e.key.toLowerCase(); if (kmap[k]) { keys[kmap[k]] = 1; e.preventDefault(); e.stopPropagation(); return; }
        if (k === ' ' || k === 'j') { if (!e.repeat) atkQueued = true; keys.atk = 1; e.preventDefault(); e.stopPropagation(); } else if (k === 'shift' || k === 'k') { if (!e.repeat) dash(); e.preventDefault(); e.stopPropagation(); } else if (k === 'e' || k === 'q') { if (!e.repeat) potion(); e.preventDefault(); e.stopPropagation(); } else if (k === 'r' || k === 'f') { if (!e.repeat) skill(); e.preventDefault(); e.stopPropagation(); }
      };
      keyU = (e) => { const k = e.key.toLowerCase(); if (kmap[k]) keys[kmap[k]] = 0; if (k === ' ' || k === 'j') keys.atk = 0; };
      window.addEventListener('keydown', keyH, true); window.addEventListener('keyup', keyU, true);
      $('#drBtA').onpointerdown = (e) => { e.preventDefault(); atkQueued = true; keys.atk = 1; }; $('#drBtA').onpointerup = $('#drBtA').onpointerleave = () => { keys.atk = 0; };
      function pauseToggle() { if (mode === 'run') { mode = 'pause'; keys.w = keys.a = keys.s = keys.d = keys.atk = 0; bnEl.textContent = 'TẠM DỪNG — bấm P để tiếp tục'; bnEl.classList.add('on'); } else if (mode === 'pause') { mode = 'run'; bnEl.classList.remove('on'); } }
      $('#drPause').onclick = pauseToggle;
      $('#drExit').onclick = async () => { if (mode !== 'run' && mode !== 'pause') return; const was = mode; mode = 'pause'; if (await ask('Rút lui khỏi hầm ngục?', 'Bạn chỉ giữ 60% vàng đã nhặt. Trang bị nhặt được vẫn ở trong kho.', 'Rút lui')) { bnEl.classList.remove('on'); dlgEl.hidden = true; endRun(false, 'Bạn rút lui khỏi hầm ngục.'); } else if (run && !run.over) mode = was === 'pause' && bnEl.classList.contains('on') ? 'pause' : 'run'; };
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
        S, keys, hero: () => hero, mobs: () => mobs, shots: () => shots, atk: () => { atkQueued = true; }, dash, potion, skill, sim, draw, isDone: () => done, start: (d, t) => startRun(d, t), meta, lobby: () => lobbyView(), run: () => run,
      };
      lobbyView(); updateLobbyHero();
      if (window.__dreadAuto) startRun(window.__dreadAuto.dg || 'bone', window.__dreadAuto.tier || 0);
    });
  }

  function boot() {
    if (!KN.Mini || !KN.Mini.register || !KN.DreadCore) return;
    if (KN.Mini.onAbort) KN.Mini.onAbort.push(close);
    KN.Mini.register('dread', (p) => dread(p).then((r) => { close(); return r; }), '🗡️ Hầm ngục Dreadfall',
      'Hành động đi lại tự do kiểu Dungeon Quest / Soul Knight, chơi một mình (online co-op sẽ có sau). Ở sảnh: chọn hầm ngục và độ khó, kéo nhân vật để xoay, mặc trang bị vào 7 ô (cần đủ cấp), xem so sánh chỉ số, cộng điểm kỹ năng, mua hàng bằng vàng, làm nhiệm vụ. Trong hầm ngục: WASD hoặc mũi tên để di chuyển, Space/J/click để chém hoặc bắn (tự ngắm kẻ gần nhất), Shift/K lướt né, R/F kỹ năng, E/Q uống thuốc, P tạm dừng. Cửa khóa khi còn quái; hạ hết để đi tiếp, mở rương, uống nước hồi máu và đánh trùm ở phòng cuối rồi bước vào cổng linh hồn. Quái báo đòn bằng vòng đỏ dưới chân. Vàng nhặt được đổi thành tiền vào cuộc đời khi kết thúc lượt (nút Nhận tiền ở màn thưởng). Điện thoại: chạm kéo bên trái để di chuyển, nút bên dưới để chém, lướt, kỹ năng, thuốc.',
      (p) => 'Sức khỏe ' + Math.round(p.ctx.stats.health) + ': ' + Math.round(C.baseHP + p.ctx.stats.health * C.hpPerHealth) + ' máu gốc, đỡ đòn tốt hơn, chạy nhanh hơn · Trí tuệ ' + Math.round(p.ctx.stats.smarts) + ': tỉ lệ chí mạng ' + Math.round((C.critBase + p.ctx.stats.smarts * C.critPerSmarts) * 100) + '% (chưa tính trang bị)');
  }
  boot();
  KN.Dread = { C };
})();
