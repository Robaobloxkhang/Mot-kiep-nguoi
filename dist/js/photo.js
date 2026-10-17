/* Một Kiếp Người — 📸 STUDIO ẢNH + 📱 LƯỚT MXH (KN.Photo)
   - Studio: tự cầm máy, kéo để xoay góc, zoom, nâng/hạ máy, chọn dáng + bộ lọc, bấm chụp.
     Sau đó chọn mẫu CapCut giật giật (giật beat, glitch, zoom sốc, lắc lư, nháy đèn, slow tình cảm), viết chú thích rồi đăng.
   - Lướt MXH: bảng tin dọc kiểu TikTok (KOL, người quen của bạn, quảng cáo, lừa đảo, tin tức), cuộn chuột / vuốt / phím ↑↓. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (n) => (n >= 1e6 ? (Math.round(n / 1e5) / 10 + 'M') : n >= 1e3 ? (Math.round(n / 100) / 10 + 'K') : String(n)).replace('.', ',');
  const FILTERS = [['none', 'Gốc', 'none'], ['sang', 'Trắng sáng', 'brightness(1.14) contrast(.95) saturate(1.12)'], ['han', 'Hàn Quốc', 'brightness(1.1) saturate(.82) sepia(.12) hue-rotate(-6deg)'], ['film', 'Film cũ', 'sepia(.45) contrast(1.12) brightness(.96)'], ['lanh', 'Lạnh', 'saturate(1.1) hue-rotate(12deg) brightness(1.04)'], ['bw', 'Đen trắng', 'grayscale(1) contrast(1.15)']];
  const POSES = [['idle', '🙂', 'Tự nhiên'], ['phone', '🤳', 'Selfie'], ['wave', '👋', 'Vẫy tay'], ['love', '😘', 'Thả tim'], ['cheer', '🙌', 'Phấn khích'], ['point', '👉', 'Chỉ tay'], ['dance', '💃', 'Nhún nhảy']];
  let root = null, cam = null, raf = 0, done = null, st = null, view = null, keyH = null;
  // ---------------------------------------------------------------- điểm góc chụp
  function score() {
    if (!cam) return 0;
    const yawS = 1 - Math.min(1, Math.abs(Math.abs(cam.yaw) - 0.35) / 0.6);
    const cyS = 1 - Math.min(1, Math.abs(cam.cy - 0.12) / 0.28);
    const dkS = 1 - Math.min(1, Math.abs(cam.dk - 1.1) / 0.8);
    const poseB = view.pose !== 'idle' && (Date.now() - view.poseT < 2600 || ['phone', 'dance'].includes(view.pose)) ? 0.12 : 0;
    return clamp(yawS * 0.38 + cyS * 0.27 + dkS * 0.27 + poseB + 0.02, 0, 1);
  }
  const verdict = (q) => q > 0.8 ? '😍 Góc thần thánh' : q > 0.6 ? '👍 Góc đẹp' : q > 0.4 ? '🙂 Tạm được' : '😬 Góc dìm';
  function hint() {
    if (!cam) return '';
    if (cam.dk > 1.6) return 'Lại gần hơn chút';
    if (cam.dk < 0.75) return 'Gần quá, lùi ra';
    if (Math.abs(cam.yaw) < 0.15) return 'Thử nghiêng máy sang một bên (góc 3/4)';
    if (Math.abs(cam.yaw) > 0.8) return 'Nghiêng quá rồi';
    if (cam.cy < 0) return 'Nâng máy cao lên, chụp từ trên xuống';
    if (cam.cy > 0.3) return 'Cao quá, hạ máy xuống';
    return 'Chuẩn rồi, tạo dáng rồi chụp!';
  }
  function meter() {
    if (!root || !view || view.step !== 1) return;
    const q = score(), m = root.querySelector('.ph-meter');
    m.querySelector('i').style.width = Math.round(q * 100) + '%';
    m.querySelector('b').textContent = verdict(q) + ' · ' + Math.round(q * 100) + '%';
    root.querySelector('.ph-hint').textContent = hint();
  }
  // ---------------------------------------------------------------- studio
  function studio(s) {
    return new Promise((res) => {
      done = res; st = s; view = { step: 1, pose: 'idle', poseT: 0, filter: 'none', shot: null, q: 0, tpl: s.hot, drag: null };
      root = document.createElement('div'); root.className = 'lr ph';
      root.innerHTML = '<div class="lr-phone"><div class="lr-screen ph-screen">' +
        '<div class="ph-shoot"><canvas class="ph-cam"></canvas><div class="lr-fallback">📷</div><div class="ph-grid"></div><div class="ph-flash"></div>' +
        '<div class="ph-top"><button type="button" class="ph-x" data-x aria-label="Thoát">✖</button><b>📸 Chụp ảnh</b><span class="ph-left">' + esc(s.followersText) + ' theo dõi</span></div>' +
        '<div class="ph-meter"><i></i><b></b></div><div class="ph-hint"></div>' +
        '<div class="ph-side"><button type="button" data-z="-1" title="Lại gần (+)">＋</button><button type="button" data-z="1" title="Ra xa (−)">－</button><button type="button" data-h="1" title="Nâng máy (↑)">⤒</button><button type="button" data-h="-1" title="Hạ máy (↓)">⤓</button><button type="button" data-r title="Về giữa">⟲</button></div>' +
        '<div class="ph-bot"><div class="ph-chips ph-filters">' + FILTERS.map(([k, l]) => '<button type="button" data-f="' + k + '" class="' + (k === 'none' ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
        '<div class="ph-chips ph-poses">' + POSES.map(([k, ic, l]) => '<button type="button" data-p="' + k + '" class="' + (k === 'idle' ? 'on' : '') + '">' + ic + ' ' + l + '</button>').join('') + '</div>' +
        '<div class="ph-shutrow"><span></span><button type="button" class="ph-shutter" data-shoot aria-label="Chụp"></button><span></span></div>' +
        '<p class="lr-keys">Kéo màn hình để xoay góc · cuộn chuột / <kbd>+</kbd><kbd>−</kbd> zoom · <kbd>↑</kbd><kbd>↓</kbd> nâng hạ máy · <kbd>←</kbd><kbd>→</kbd> xoay · <kbd>Space</kbd> chụp</p></div></div>' +
        '<div class="ph-edit" hidden></div>' +
        '</div></div>';
      document.body.appendChild(root);
      root.tabIndex = -1; root.focus({ preventScroll: true });
      root.addEventListener('click', onClick);
      root.addEventListener('keydown', onKey);
      const cv = root.querySelector('.ph-cam');
      cv.addEventListener('pointerdown', (e) => { view.drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', (e) => { if (!view.drag || !cam) return; const dx = e.clientX - view.drag.x, dy = e.clientY - view.drag.y; view.drag = { x: e.clientX, y: e.clientY }; cam.yaw = clamp(cam.yaw - dx * 0.006, -1.2, 1.2); cam.cy = clamp(cam.cy - dy * 0.002, -0.2, 0.45); cam.ty = 0.17 + cam.cy * 0.6; meter(); });
      cv.addEventListener('pointerup', () => (view.drag = null));
      cv.addEventListener('wheel', (e) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1 : -1); }, { passive: false });
      requestAnimationFrame(() => {
        if (!root) return;
        cam = KN.LiveRoom && KN.LiveRoom.makeCam ? KN.LiveRoom.makeCam(cv, s.player, s.night) : null;
        if (cam) {
          root.querySelector('.ph-shoot .lr-fallback').remove(); cam.steady = true; cam.dk = 1.7; cam.cy = -0.05; cam.ch.play('idle');
          const loop = (now) => { if (!root) return; if (view.step === 1) cam.render(now); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
          window.addEventListener('resize', cam.size);
        }
        meter();
      });
      const mt = setInterval(() => { if (!root) return clearInterval(mt); meter(); }, 400);
      sfx('click');
    });
  }
  function zoom(d) { if (!cam) return; cam.dk = clamp(cam.dk + d * 0.08, 0.6, 2.4); meter(); }
  function pose(k) {
    view.pose = k; view.poseT = Date.now();
    root.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('on', b.dataset.p === k));
    if (!cam) return;
    if (KN.Characters.ONESHOTS.includes(k)) cam.ch.play(k, { base: 'idle' }); else cam.ch.play(k);
    meter();
  }
  function setFilter(k) {
    view.filter = k; const f = FILTERS.find((x) => x[0] === k);
    root.querySelector('.ph-cam').style.filter = f[2] === 'none' ? '' : f[2];
    root.querySelectorAll('[data-f]').forEach((b) => b.classList.toggle('on', b.dataset.f === k));
  }
  function shoot() {
    if (view.step !== 1) return;
    view.q = score();
    let url = null;
    if (cam) {
      const raw = cam.capture('image/png'), img = new Image();
      img.onload = () => {
        const w = Math.min(540, img.width), h = Math.round(img.height * w / img.width), c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d'), f = FILTERS.find((x) => x[0] === view.filter); if (f[2] !== 'none') g.filter = f[2];
        g.drawImage(img, 0, 0, w, h); url = c.toDataURL('image/jpeg', 0.86); view.shot = url; edit();
      };
      img.src = raw;
    } else { view.shot = null; setTimeout(edit, 300); }
    const fl = root.querySelector('.ph-flash'); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on');
    sfx('click');
  }
  // ---------------------------------------------------------------- bước 2: mẫu CapCut + chú thích
  function clip(tpl, small) {
    const src = view.shot, im = src ? '<img src="' + src + '" alt="">' : '<div class="ph-noimg">📷</div>';
    const t = st.templates.find((x) => x.id === tpl);
    return '<div class="ph-clip tpl-' + (tpl || 'none') + (small ? ' sm' : '') + '"><div class="ph-layer">' + im + '</div>' + (tpl === 'glitch' && src ? '<div class="ph-layer g1">' + im + '</div><div class="ph-layer g2">' + im + '</div>' : '') +
      '<div class="ph-fx"></div>' + (!small && t ? '<div class="ph-song">♫ ' + esc(t.song) + '</div>' : '') + (!small ? '<div class="ph-cap"></div>' : '') + '</div>';
  }
  function edit() {
    if (!root) return;
    view.step = 2;
    const e = root.querySelector('.ph-edit'); root.querySelector('.ph-shoot').hidden = true; e.hidden = false;
    const q = view.q;
    e.innerHTML = '<div class="ph-top"><button type="button" class="ph-x" data-retake>↺ Chụp lại</button><b>🎬 Chọn mẫu CapCut</b><span class="ph-left">' + verdict(q) + ' ' + Math.round(q * 100) + '%</span></div>' +
      '<div class="ph-main">' + clip(view.tpl) + '</div>' +
      '<div class="ph-tpls"><button type="button" data-t="" class="' + (!view.tpl ? 'on' : '') + '"><div class="ph-clip sm tpl-none"><div class="ph-layer">' + (view.shot ? '<img src="' + view.shot + '" alt="">' : '📷') + '</div></div><small>Ảnh tĩnh</small></button>' +
      st.templates.map((t) => '<button type="button" data-t="' + t.id + '" class="' + (view.tpl === t.id ? 'on' : '') + '">' + clip(t.id, true) + '<small>' + t.icon + ' ' + esc(t.name) + (t.id === st.hot ? ' <em>🔥 HOT</em>' : '') + '</small></button>').join('') + '</div>' +
      '<form class="ph-post"><input maxlength="80" placeholder="Viết chú thích… (vd: Mood hôm nay ✨)" autocomplete="off"><button type="submit">Đăng ➤</button></form>' +
      '<p class="lr-keys">Mẫu có 🔥 HOT đang thịnh hành năm nay — dễ lên xu hướng hơn</p>';
    const tl = e.querySelector('.ph-tpls'); tl.addEventListener('wheel', (ev) => { if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) { tl.scrollLeft += ev.deltaY; ev.preventDefault(); } }, { passive: false });
    const inp = e.querySelector('input');
    inp.addEventListener('input', () => { const c = e.querySelector('.ph-main .ph-cap'); if (c) c.textContent = inp.value; });
    e.querySelector('form').addEventListener('submit', (ev) => { ev.preventDefault(); post(inp.value); });
  }
  function pickTpl(id) {
    view.tpl = id || null;
    const main = root.querySelector('.ph-main'), cap = root.querySelector('.ph-post input');
    main.innerHTML = clip(view.tpl); const c = main.querySelector('.ph-cap'); if (c) c.textContent = cap.value;
    root.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', (b.dataset.t || null) === view.tpl));
    sfx('click');
  }
  function post(caption) {
    if (view.posting) return; view.posting = true;
    const r = G().photoPost({ q: view.q, tpl: view.tpl, filter: view.filter, caption });
    close(r);
  }
  function retake() {
    view.step = 1; view.shot = null;
    root.querySelector('.ph-edit').hidden = true; root.querySelector('.ph-edit').innerHTML = ''; root.querySelector('.ph-shoot').hidden = false;
    if (cam) cam.size(); meter();
  }
  function close(r) {
    cancelAnimationFrame(raf); raf = 0;
    if (cam) { window.removeEventListener('resize', cam.size); cam.dispose(); cam = null; }
    if (root) { root.remove(); root = null; }
    const f = done; done = null; view = null; f && f(r || null);
  }
  function onKey(e) {
    e.stopPropagation();
    if (/input/i.test(e.target.tagName)) { if (e.key === 'Escape') e.target.blur(); return; }
    if (e.key === 'Escape') { if (view.step === 2) retake(); else close(null); e.preventDefault(); return; }
    if (view.step !== 1) return;
    const k = e.key;
    if (k === ' ' || k === 'Enter') { shoot(); e.preventDefault(); }
    else if (k === '+' || k === '=') zoom(-1); else if (k === '-' || k === '_') zoom(1);
    else if (k === 'ArrowUp' && cam) { cam.cy = clamp(cam.cy + 0.03, -0.2, 0.45); cam.ty = 0.17 + cam.cy * 0.6; meter(); e.preventDefault(); }
    else if (k === 'ArrowDown' && cam) { cam.cy = clamp(cam.cy - 0.03, -0.2, 0.45); cam.ty = 0.17 + cam.cy * 0.6; meter(); e.preventDefault(); }
    else if (k === 'ArrowLeft' && cam) { cam.yaw = clamp(cam.yaw + 0.06, -1.2, 1.2); meter(); e.preventDefault(); }
    else if (k === 'ArrowRight' && cam) { cam.yaw = clamp(cam.yaw - 0.06, -1.2, 1.2); meter(); e.preventDefault(); }
    else if (/^[1-7]$/.test(k)) pose(POSES[+k - 1][0]);
  }
  function onClick(e) {
    const t = e.target;
    if (t.closest('[data-x]')) { close(null); return; }
    if (t.closest('[data-shoot]')) { shoot(); return; }
    if (t.closest('[data-retake]')) { retake(); return; }
    const z = t.closest('[data-z]'); if (z) { zoom(+z.dataset.z); return; }
    const h = t.closest('[data-h]'); if (h && cam) { cam.cy = clamp(cam.cy + 0.04 * h.dataset.h, -0.2, 0.45); cam.ty = 0.17 + cam.cy * 0.6; meter(); return; }
    if (t.closest('[data-r]') && cam) { cam.yaw = 0; cam.cy = 0; cam.dk = 1.45; cam.ty = 0.17; meter(); return; }
    const f = t.closest('[data-f]'); if (f) { setFilter(f.dataset.f); return; }
    const p = t.closest('[data-p]'); if (p) { pose(p.dataset.p); return; }
    const tp = t.closest('[data-t]'); if (tp) { pickTpl(tp.dataset.t); return; }
  }

  // ================================================================ 📱 LƯỚT MXH
  let fd = null;
  // một renderer dùng chung để "chụp" nhân vật cho từng bài đăng
  function snapper() {
    const THREE = window.THREE; if (!THREE || !KN.Characters) return null;
    const cv = document.createElement('canvas'); cv.width = 360; cv.height = 480;
    let r; try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return null; }
    r.setSize(360, 480, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8a7060, 0.8));
    const key = new THREE.DirectionalLight(0xfff2e6, 1.15); key.position.set(0.8, 2.2, 3); sc.add(key);
    const camr = new THREE.PerspectiveCamera(30, 360 / 480, 0.05, 30);
    return {
      shot(it) {
        let ch = null;
        try { ch = KN.Characters.create({ kind: 'human', appearance: it.app, age: it.age ?? 25, gender: it.gender, name: it.name }); } catch (e) { return null; }
        sc.add(ch.root); const a = ['wave', 'cheer', 'laugh', 'love', 'point', 'dance', 'phone', 'idle'][Math.floor(Math.random() * 8)];
        try { ch.play(a); for (let i = 0; i < 24; i++) ch.update(1 / 30, i / 30); } catch (e) { /* */ }
        const f = new THREE.Vector3(0, ch.height * 0.86, 0); try { ch.getHeadWorldPosition(f); } catch (e) { /* */ }
        const yaw = (Math.random() - 0.5) * 0.8; camr.position.set(Math.sin(yaw) * 3.1, f.y - 0.1, Math.cos(yaw) * 3.1); camr.lookAt(0, f.y - 0.5, 0);
        r.render(sc, camr); const url = cv.toDataURL('image/png');
        sc.remove(ch.root); try { ch.dispose(); } catch (e) { /* */ }
        return url;
      },
      dispose() { r.dispose(); try { r.forceContextLoss(); } catch (e) { /* */ } },
    };
  }
  function feed(s) {
    return new Promise((res) => {
      fd = { s, i: 0, done: res, snap: snapper(), lock: 0, seen: {}, liked: {} };
      root = document.createElement('div'); root.className = 'lr fd';
      root.innerHTML = '<div class="lr-phone"><div class="lr-screen fd-screen">' +
        '<div class="fd-track">' + s.items.map((it, i) => card(it, i)).join('') + '</div>' +
        '<div class="fd-top"><button type="button" class="ph-x" data-x aria-label="Thoát">✖</button><span><b>Dành cho bạn</b> · Đang theo dõi</span><span class="fd-n">1/' + s.items.length + '</span></div>' +
        '<div class="fd-nav"><button type="button" data-go="-1" aria-label="Bài trước">▲</button><button type="button" data-go="1" aria-label="Bài sau">▼</button></div>' +
        '<p class="lr-keys fd-keys">Cuộn chuột / vuốt / <kbd>↑</kbd><kbd>↓</kbd> để lướt · nhấp đúp hoặc <kbd>L</kbd> để thả tim · <kbd>Esc</kbd> thoát</p>' +
        '</div></div>';
      document.body.appendChild(root);
      root.tabIndex = -1; root.focus({ preventScroll: true });
      root.addEventListener('click', fdClick);
      root.addEventListener('dblclick', (e) => { const c = e.target.closest('.fd-card'); if (c) like(+c.dataset.i, true); });
      root.addEventListener('keydown', (e) => {
        e.stopPropagation(); const k = e.key;
        if (k === 'ArrowDown' || k === 's' || k === 'S' || k === ' ') { go(1); e.preventDefault(); }
        else if (k === 'ArrowUp' || k === 'w' || k === 'W') { go(-1); e.preventDefault(); }
        else if (k === 'l' || k === 'L') like(fd.i, true);
        else if (k === 'Escape') fdClose();
      });
      const scr = root.querySelector('.fd-screen');
      scr.addEventListener('wheel', (e) => { e.preventDefault(); if (Math.abs(e.deltaY) > 8) go(e.deltaY > 0 ? 1 : -1); }, { passive: false });
      let ty = null; scr.addEventListener('touchstart', (e) => (ty = e.touches[0].clientY), { passive: true });
      scr.addEventListener('touchend', (e) => { if (ty == null) return; const d = ty - e.changedTouches[0].clientY; if (Math.abs(d) > 40) go(d > 0 ? 1 : -1); ty = null; });
      show(0);
      sfx('click');
    });
  }
  function card(it, i) {
    const ad = it.kind === 'ad' || it.kind === 'scam', news = it.kind === 'news';
    return '<div class="fd-card k-' + it.kind + '" data-i="' + i + '" style="--bg:' + esc(it.bg) + '">' +
      '<div class="fd-media">' + (it.app ? '<div class="fd-ph">⏳</div>' : '<div class="fd-big">' + esc(it.icon || '📱') + '</div>') + '</div>' +
      '<div class="fd-heart" aria-hidden="true">❤️</div>' +
      '<div class="fd-right"><button type="button" data-like="' + i + '"><span>🤍</span><small>' + fmtN(it.likes) + '</small></button><button type="button" data-cmt="' + i + '"><span>💬</span><small>' + fmtN(Math.round(it.likes / 9)) + '</small></button><button type="button" data-share="' + i + '"><span>↗️</span><small>Chia sẻ</small></button></div>' +
      '<div class="fd-info"><b>@' + esc(it.name) + '</b>' + (it.kind === 'friend' ? ' <em class="fd-rel">' + esc(it.tag) + ' của bạn</em>' : ' <small>' + esc(it.tag) + '</small>') + '<p>' + esc(it.cap) + '</p>' +
      (ad ? '<button type="button" class="fd-cta" data-open="' + i + '">' + (it.kind === 'scam' ? 'Nhận ngay 🎁' : 'Tìm hiểu thêm') + '</button>' : '') + (news ? '<small class="fd-src">Nguồn: báo mạng · ' + fmtN(it.likes) + ' lượt đọc</small>' : '') +
      '<div class="fd-note" hidden></div></div></div>';
  }
  function paint(i) {
    const it = fd.s.items[i]; if (!it || !it.app || it.img !== undefined) return;
    it.img = fd.snap ? fd.snap.shot(it) : null;
    const c = root.querySelector('.fd-card[data-i="' + i + '"] .fd-media'); if (!c) return;
    c.innerHTML = it.img ? '<img src="' + it.img + '" alt="">' : '<div class="fd-big">🙂</div>';
  }
  function show(i) {
    fd.i = i;
    root.querySelector('.fd-track').style.transform = 'translateY(' + (-i * 100) + '%)';
    root.querySelector('.fd-n').textContent = (i + 1) + '/' + fd.s.items.length;
    paint(i); setTimeout(() => { if (root && fd) { paint(i + 1); paint(i + 2); } }, 60);
    if (!fd.seen[i]) { fd.seen[i] = 1; G().feedAct(fd.s.items[i].id, 'seen'); }
    const n = Object.keys(fd.seen).length;
    if (n === 30) note(i, '⏰ Bạn đã lướt 30 bài rồi đó… nghỉ mắt chút?');
  }
  function go(d) {
    const now = Date.now(); if (now - fd.lock < 380) return; fd.lock = now;
    const j = clamp(fd.i + d, 0, fd.s.items.length - 1); if (j === fd.i) { if (d > 0) note(fd.i, 'Hết bài rồi! Thoát ra làm việc khác thôi 😅'); return; }
    show(j); sfx('click');
  }
  function note(i, t, bad) {
    const n = root && root.querySelector('.fd-card[data-i="' + i + '"] .fd-note'); if (!n) return;
    n.hidden = false; n.textContent = t; n.classList.toggle('bad', !!bad);
    clearTimeout(n._t); n._t = setTimeout(() => (n.hidden = true), 3500);
  }
  function like(i, pop) {
    const it = fd.s.items[i], c = root.querySelector('.fd-card[data-i="' + i + '"]'); if (!it || !c) return;
    if (pop) { const h = c.querySelector('.fd-heart'); h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }
    if (fd.liked[i]) return; fd.liked[i] = 1;
    const b = c.querySelector('[data-like]'); b.classList.add('on'); b.querySelector('span').textContent = '❤️'; b.querySelector('small').textContent = fmtN(it.likes + 1);
    sfx('click');
    if (it.kind === 'friend') { const r = G().feedAct(it.id, 'like', it.pid); if (r && r.note) note(i, r.note); }
  }
  function fdClick(e) {
    const t = e.target;
    if (t.closest('[data-x]')) { fdClose(); return; }
    const g = t.closest('[data-go]'); if (g) { go(+g.dataset.go); return; }
    const l = t.closest('[data-like]'); if (l) { like(+l.dataset.like, true); return; }
    const c = t.closest('[data-cmt]'); if (c) { const it = fd.s.items[+c.dataset.cmt]; note(+c.dataset.cmt, '💬 ' + (it.kind === 'scam' ? 'Bình luận toàn tài khoản ảo: "mình rút được tiền rồi nè!" 🤔' : ['"Đẹp quá!"', '"Hóng phần 2"', '"Ủa đây là đâu vậy?"', '"Cười xỉu 🤣"'][Math.floor(Math.random() * 4)])); return; }
    const sh = t.closest('[data-share]'); if (sh) { note(+sh.dataset.share, '↗️ Đã chia sẻ vào nhóm bạn bè'); sfx('click'); return; }
    const o = t.closest('[data-open]'); if (o) {
      const i = +o.dataset.open, it = fd.s.items[i];
      if (it.kind === 'scam') { const r = G().feedAct(it.id, 'open'); note(i, (r && r.note) || 'Trang web không tải được.', r && r.bad); sfx(r && r.bad ? 'bad' : 'click'); }
      else note(i, 'Bạn xem qua rồi đóng lại. Quảng cáo mà.');
    }
  }
  function fdClose() {
    if (!fd) return;
    const f = fd.done; try { fd.snap && fd.snap.dispose(); } catch (e) { /* */ }
    fd = null; if (root) { root.remove(); root = null; }
    const r = G().feedEnd(); f && f(r);
  }
  KN.Photo = { studio, feed, isOpen: () => !!root, _score: score, _cam: () => cam, _view: () => view, _shoot: shoot };
})();
