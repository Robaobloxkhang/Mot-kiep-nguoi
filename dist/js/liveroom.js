/* Một Kiếp Người — 📱 PHÒNG LIVE (KN.LiveRoom): livestream thật như TikTok/Facebook Live.
   Điện thoại treo trước mặt: camera 3D quay thẳng mặt nhân vật trong phòng có đèn ring-light.
   Người xem bình luận, hỏi đáp (câu hỏi được 📌 ghim — trả lời bằng nút hoặc tự gõ), tặng quà, giang hồ mạng vào phá.
   Hành động: 🎤 Hát · 💃 Nhảy · 🙏 Xin quà · 🛍️ Chốt đơn (live bán hàng). Chán thì bấm ⏹ TẮT LIVE → tổng kết buổi live. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const recent = [];
  const pickR = (a) => { let s = pick(a); for (let i = 0; i < 12 && recent.includes(s); i++) s = pick(a); recent.push(s); if (recent.length > 14) recent.shift(); return s; };
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const FALLBACK = { POOL: { question: ['thả tim nào 💗'], neutral: ['chill quá'], good: ['đỉnh 🔥'] }, HATER: ['nhạt'], GIANGHO: ['ra đây solo'], NAMES: ['fan_cứng'], GH_NAMES: ['Đại_Ca_Ảo'], COLORS: ['#ff7eb6'] };
  const PO = () => (KN.LiveChat && KN.LiveChat.POOLS) || FALLBACK;
  const CHILL = ['idol xinh/đẹp trai quá 😍', 'phòng đẹp ghê', 'mới vào nè 👋', 'chào cả nhà', 'ánh sáng xịn vậy', 'like like like', 'nay live sớm thế', 'quê đâu vậy idol', 'xem từ Cà Mau nè', 'đang đi làm mà lén xem 🤫', 'mic rè rè á', 'share rồi nha', 'giọng dễ thương ghê', 'cho xin tên bài nhạc', 'ai cùng hóng giống tui không', '🔥🔥🔥', '💗💗💗', 'hihi', 'hello idol', 'mãi yêu ❤️'];
  const KHUYA = ['3h sáng rồi mà vẫn xem', 'mất ngủ quá idol ơi', 'nghe giọng thấy bình yên ghê', 'buồn quá 🥺', 'cảm ơn vì đã live', 'đêm nay lạnh ghê', 'ai thức khuya điểm danh'];
  const SELL = ['giá bao nhiêu vậy shop', 'chốt 1 cái', 'còn màu đen không', 'ship về Hải Phòng bao lâu', 'cho xem cận chất vải', 'có trả góp không 😂', 'mua 2 có giảm không'];
  let root = null, three = null, timers = [], raf = 0, sess = null, done = null, pinned = null, qIdx = 0, likes = 0, viewers = 0, t0 = 0, replies = 0, ending = false;
  const every = (fn, ms) => { const id = setInterval(fn, ms); timers.push(id); return id; };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const fmtN = (n) => (n >= 1e6 ? (Math.round(n / 1e5) / 10 + 'M') : n >= 1e3 ? (Math.round(n / 100) / 10 + 'K') : String(n)).replace('.', ',');
  // ---------------------------------------------------------------- camera 3D trước mặt
  function makeCam(canvas, player, night) {
    const THREE = window.THREE; if (!THREE || !KN.Characters || !player) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min((function () { let t = 0; try { t = +localStorage.getItem('kn_perf_tier') || 0; } catch (e) { /* */ } return t; })() >= 2 ? 1 : 1.25, window.devicePixelRatio || 1)); // máy yếu: độ phân giải thấp hơn cho đỡ lag
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = night ? 0.95 : 1.1;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(night ? 0x1b1530 : 0xe9d6c8);
    const cam = new THREE.PerspectiveCamera(34, 9 / 16, 0.05, 30);
    // phòng: tường sau, kệ sách, đèn LED, cây, khung ảnh
    const wallMat = new THREE.MeshStandardMaterial({ color: night ? 0x2a2348 : 0xf0e2d6, roughness: 0.95 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), wallMat); wall.position.set(0, 1.6, -1.6); scene.add(wall);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshStandardMaterial({ color: night ? 0x2d2438 : 0xb98c66, roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.7 });
    const shelf = new THREE.Group(); shelf.position.set(-0.95, 0, -1.45); scene.add(shelf);
    [0.85, 1.25, 1.65].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.25), wood); b.position.y = y; shelf.add(b); for (let i = 0; i < 6; i++) { const bk = new THREE.Mesh(new THREE.BoxGeometry(0.06 + Math.random() * 0.04, 0.18 + Math.random() * 0.1, 0.18), new THREE.MeshStandardMaterial({ color: pick([0xe8423f, 0x3d7bf2, 0xffd23f, 0x39cf98, 0xc792ff, 0xffffff]), roughness: 0.8 })); bk.position.set(-0.36 + i * 0.13, y + 0.12, 0); shelf.add(bk); } });
    // dải LED neon trên tường
    const ledCol = night ? 0xc56bff : 0xff7eb6;
    const led = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: ledCol })); led.position.set(0.3, 2.25, -1.58); scene.add(led);
    const led2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.2, 0.02), new THREE.MeshBasicMaterial({ color: night ? 0x5cc8ff : 0xffb347 })); led2.position.set(1.05, 1.6, -1.58); scene.add(led2);
    // khung ảnh + cây
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.03), new THREE.MeshStandardMaterial({ color: 0x222222 })); frame.position.set(0.75, 1.75, -1.57); scene.add(frame);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), new THREE.MeshBasicMaterial({ color: night ? 0x3d7bf2 : 0x7cc0e8 })); pic.position.set(0.75, 1.75, -1.55); scene.add(pic);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })); pot.position.set(0.95, 0.12, -1.2); scene.add(pot);
    for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3f8f4a, roughness: 0.8 })); lf.scale.set(0.6, 1.4, 0.6); lf.position.set(0.95 + Math.cos(i) * 0.1, 0.42 + (i % 3) * 0.12, -1.2 + Math.sin(i) * 0.1); lf.rotation.z = Math.cos(i) * 0.6; scene.add(lf); }
    // đèn: ring-light trước mặt + đèn LED màu hắt sau
    scene.add(new THREE.HemisphereLight(0xffffff, night ? 0x2a1d3a : 0x9a7a60, night ? 0.45 : 0.7));
    const key = new THREE.DirectionalLight(0xfff2e6, night ? 0.9 : 1.15); key.position.set(0.3, 1.8, 2.2); scene.add(key);
    const rim = new THREE.PointLight(ledCol, night ? 2.2 : 1.2, 4); rim.position.set(-0.6, 2.0, -0.9); scene.add(rim);
    const rim2 = new THREE.PointLight(night ? 0x5cc8ff : 0xffd0a0, 1.3, 4); rim2.position.set(0.9, 1.5, -0.8); scene.add(rim2);
    let ch = null;
    try { ch = KN.Characters.create({ kind: 'human', appearance: player.appearance, age: player.age ?? 25, gender: player.gender, name: player.name }); } catch (e) { ch = null; }
    if (!ch) { renderer.dispose(); return null; }
    scene.add(ch.root); ch.root.position.set(0, 0, 0); ch.play('talk');
    const h = ch.height, focus = new THREE.Vector3(0, h * 0.86, 0);
    try { ch.getHeadWorldPosition(focus); } catch (e) { /* */ }
    ch.lookAt(new THREE.Vector3(0, focus.y, 3));
    const size = () => { const w = canvas.clientWidth || 360, hh = canvas.clientHeight || 640; renderer.setSize(w, hh, false); cam.aspect = w / hh; cam.updateProjectionMatrix(); };
    size();
    let last = performance.now(), t = 0, shake = 0;
    const api = {
      ch, cam, focus, scene, fk: 0.89, dk: 1.45, cy: 0.0, ty: 0.17, yaw: 0, steady: false,
      render(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
        try { ch.update(dt, t); } catch (e) { /* */ }
        // tay cầm/giá đỡ điện thoại hơi rung nhẹ cho thật
        // khung hình selfie: mặt nằm ở 1/3 trên màn hình, thấy được vai và căn phòng phía sau
        const face = h * api.fk, dist = api.dk * h;
        const wob = api.steady ? 0.3 : 1;
        cam.position.set(Math.sin(api.yaw) * dist + Math.sin(t * 0.7) * 0.012 * wob + (Math.random() - 0.5) * shake, face + api.cy * h + Math.sin(t * 1.1) * 0.008 * wob, Math.cos(api.yaw) * dist);
        cam.lookAt(0, face - api.ty * h, 0); shake *= 0.9;
        renderer.render(scene, cam);
      },
      anim(a, loopSec) {
        if (!a) return;
        const one = KN.Characters.ONESHOTS.includes(a);
        if (one) ch.play(a, { base: 'talk' }); else { ch.play(a); if (loopSec) later(() => ch.play('talk'), loopSec * 1000); }
      },
      shake(v) { shake = v; },
      capture(type, q) { api.render(performance.now()); return canvas.toDataURL(type || 'image/jpeg', q || 0.88); },
      size,
      dispose() { try { ch.dispose(); } catch (e) { /* */ } scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) { /* */ } },
    };
    return api;
  }
  // ---------------------------------------------------------------- chat
  function addMsg(text, kind, user, opts) {
    if (!root) return null; opts = opts || {};
    const list = root.querySelector('.lr-chat');
    const el = document.createElement('div');
    el.className = 'lr-msg k-' + kind + (opts.me ? ' me' : '') + (opts.note ? ' note' : '') + (opts.q ? ' q' : '');
    if (!opts.me && !opts.note) { el.dataset.kind = kind === 'q' ? 'fan' : kind; el.dataset.user = user; if (opts.q) el.dataset.q = opts.q; el.title = opts.q ? 'Bấm để trả lời câu hỏi' : 'Bấm để trả lời'; }
    const badge = opts.q ? '<span class="lr-tag q">❓ hỏi</span>' : kind === 'giangho' ? '<span class="lr-tag gh">🥊 giang hồ mạng</span>' : kind === 'hater' ? '<span class="lr-tag ht">😠</span>' : '';
    const col = opts.me ? '#ffb347' : kind === 'giangho' ? '#ff6b6b' : pick(PO().COLORS);
    el.innerHTML = opts.note ? esc(text) : badge + '<b style="color:' + col + '">' + esc(user) + '</b> <span>' + esc(text) + '</span>';
    // đang kéo lên đọc bình luận cũ thì không tự nhảy xuống, hiện nút "bình luận mới"
    const atEnd = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
    list.appendChild(el);
    if (atEnd) { while (list.children.length > 120) list.removeChild(list.firstChild); list.scrollTop = list.scrollHeight; }
    else { const nb = root.querySelector('.lr-newmsg'); if (nb) { nb.hidden = false; nb.dataset.n = (+nb.dataset.n || 0) + 1; nb.textContent = '↓ ' + nb.dataset.n + ' bình luận mới'; } }
    return el;
  }
  const note = (t) => addMsg(t, 'note', '', { note: true });
  function chatter() {
    if (!root || ending) return;
    const P = PO(), r = Math.random(), heat = sess.ghBoost > 0 ? 0.3 : sess.gh;
    if (r < heat) addMsg(pickR(P.GIANGHO), 'giangho', pick(P.GH_NAMES));
    else if (r < heat + sess.hater) addMsg(pickR(P.HATER), 'hater', pick(P.NAMES));
    else {
      const pool = [CHILL, P.POOL.neutral || CHILL, P.POOL.question || CHILL];
      if (sess.night) pool.push(KHUYA, KHUYA); if (sess.sell) pool.push(SELL, SELL);
      if (sess.hype > 6) pool.push(P.POOL.good || CHILL);
      addMsg(pickR(pick(pool)), 'fan', pick(P.NAMES));
    }
    if (sess.ghBoost > 0 && Math.random() < 0.3) sess.ghBoost--;
    const gap = Math.max(1100, 2600 - viewers - sess.hype * 50) * (0.7 + Math.random() * 0.8);
    later(chatter, gap);
  }
  // câu hỏi của người xem: lần lượt hiện lên, câu mới nhất được ghim
  function nextQuestion() {
    if (!root || ending) return;
    const q = sess.questions[qIdx++]; if (!q) return;
    const user = pick(PO().NAMES);
    addMsg(q.text, 'q', user, { q: q.id });
    if (!pinned) pin(q, user);
    later(nextQuestion, 15000 + Math.random() * 9000);
  }
  function pin(q, user) {
    pinned = { q, user };
    const box = root.querySelector('.lr-pin');
    box.hidden = false;
    box.innerHTML = '<div class="lr-pin-h"><span>📌 <b>@' + esc(user) + '</b> hỏi:</span><button type="button" class="lr-x" data-unpin aria-label="Bỏ qua">✕</button></div><p>' + esc(q.text) + '</p>' +
      '<div class="lr-pin-b"><button type="button" data-ans="that">😇 Trả lời thật</button><button type="button" data-ans="ne">😏 Né khéo</button><button type="button" data-ans="troll">🤡 Troll</button><button type="button" data-ans="gat">😤 Gắt</button></div>' +
      '<form class="lr-pin-f"><input maxlength="120" placeholder="✍️ Tự gõ câu trả lời…" autocomplete="off"><button type="submit">Gửi</button></form>';
    sfx('notify');
  }
  function unpin() { pinned = null; const box = root && root.querySelector('.lr-pin'); if (box) { box.hidden = true; box.innerHTML = ''; } }
  function answer(mode, typed) {
    if (!pinned) return;
    const { q, user } = pinned;
    const r = G().liveAnswer(q.id, mode, typed);
    if (!r || r.ok === false) { note((r && r.reason) || 'Không trả lời được.'); unpin(); return; }
    unpin();
    root.querySelectorAll('.lr-msg[data-q="' + q.id + '"]').forEach((m) => { m.classList.add('done'); m.removeAttribute('data-q'); });
    addMsg('↳ @' + user + ': ' + r.reply, 'me', sess.first, { me: true });
    three && three.anim(r.anim, 4);
    sess.hype = r.hype;
    sfx(r.tone === 'good' ? 'good' : r.tone === 'bad' ? 'bad' : 'click');
    later(() => { if (r.react) addMsg(r.react, r.tone === 'bad' ? 'hater' : 'fan', pick(PO().NAMES)); if (r.note) note(r.note); if (r.tone === 'good') hearts(8); if (r.ghWave) ghWave(); }, 700);
    hud();
  }
  function ghWave() { sess.ghBoost = 4; for (let i = 0; i < 3; i++) later(() => addMsg(pickR(PO().GIANGHO), 'giangho', pick(PO().GH_NAMES)), 400 + i * 600); three && three.shake(0.01); }
  // trả lời bình luận thường (dùng chung luật của khung LIVE cũ)
  function replyMsg(msg, mode, typed) {
    if (replies >= 8) { note('Bạn trả lời nhiều rồi, để người xem nói với nào 😄'); return; }
    const all = !msg, kind = all ? 'fan' : msg.dataset.kind, user = all ? 'mọi người' : msg.dataset.user;
    closeMenus(); if (msg) { msg.removeAttribute('data-kind'); msg.classList.add('done'); }
    let r = null; try { r = G().liveReply(kind, mode === 'text' ? 'tim' : mode, user, mode === 'text' ? typed : undefined); } catch (e) { r = null; }
    if (!r || r.ok === false) { note((r && r.reason) || 'Không trả lời được lúc này.'); return; }
    replies++;
    addMsg((all ? '' : '↳ @' + user + ': ') + r.reply, 'me', sess.first, { me: true });
    three && three.anim(r.tone === 'bad' ? 'facepalm' : mode === 'gat' ? 'angry' : mode === 'hai' ? 'laugh' : 'wave');
    sfx(r.tone === 'bad' ? 'bad' : r.tone === 'good' ? 'good' : 'click');
    later(() => { if (r.react) addMsg(r.react, r.reactKind || 'fan', pick(r.reactKind === 'giangho' ? PO().GH_NAMES : PO().NAMES)); if (r.note) note(r.note); if (r.ghWave) ghWave(); }, 700);
  }
  function closeMenus() { if (!root) return; root.querySelectorAll('.lr-menu').forEach((m) => m.remove()); }
  function openMenu(msg) {
    const was = msg.querySelector('.lr-menu'); closeMenus(); if (was) return;
    const m = document.createElement('div'); m.className = 'lr-menu';
    m.innerHTML = [['tim', '💗 Cảm ơn'], ['hai', '😂 Đáp hài'], ['gat', '😤 Đáp trả'], ['chan', '🚫 Chặn']].map(([k, l]) => '<button type="button" data-rep="' + k + '">' + l + '</button>').join('');
    msg.appendChild(m);
  }
  function act(a) {
    const r = G().liveAct(a);
    if (!r || r.ok === false) { note((r && r.reason) || 'Không làm được.'); sfx('fail'); return; }
    sess.hype = r.hype; note((a === 'sing' ? '🎤 ' : a === 'dance' ? '💃 ' : a === 'beg' ? '🙏 ' : '🛍️ ') + r.text);
    three && three.anim(r.anim, a === 'sing' || a === 'dance' ? 5 : 0);
    sfx(r.tone === 'good' ? 'good' : 'bad');
    later(() => { addMsg(r.react, r.tone === 'good' ? 'fan' : 'hater', pick(PO().NAMES)); if (r.tone === 'good') hearts(12); }, 800);
    const b = root.querySelector('[data-act="' + a + '"]'); if (b) { b.dataset.n = (+b.dataset.n || 0) + 1; if (+b.dataset.n >= 2) b.disabled = true; }
    hud();
  }
  // tim bay + quà
  function hearts(n) {
    const lay = root && root.querySelector('.lr-hearts'); if (!lay) return;
    for (let i = 0; i < n; i++) later(() => { if (!root) return; const h = document.createElement('i'); h.textContent = pick(['💗', '💖', '❤️', '💜', '💛', '🧡']); h.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px'); h.style.animationDuration = (1.6 + Math.random()) + 's'; lay.appendChild(h); setTimeout(() => h.remove(), 2800); }, i * 90);
    likes += n * 7; hud();
  }
  function giftBanner(g) {
    const lay = root.querySelector('.lr-gifts'); if (!lay) return;
    const el = document.createElement('div'); el.className = 'lr-gift' + (g.big ? ' big' : '');
    el.innerHTML = '<span class="ic">' + g.icon + '</span><span><b>' + esc(pick(PO().NAMES)) + '</b><small>tặng ' + esc(g.name) + '</small></span><em>x' + g.n + '</em>';
    lay.appendChild(el); while (lay.children.length > 3) lay.removeChild(lay.firstChild);
    setTimeout(() => el.classList.add('out'), 4600); setTimeout(() => el.remove(), 5200);
    if (g.big) { sfx('cheer'); const big = document.createElement('div'); big.className = 'lr-biggift'; big.textContent = g.icon; root.querySelector('.lr-screen').appendChild(big); setTimeout(() => big.remove(), 2600); three && three.anim('cheer'); } else sfx('click');
    hearts(g.big ? 20 : 3);
  }
  function tick() {
    if (!root || ending) return;
    const r = G().liveTick(); if (!r || r.ok === false) return;
    viewers = r.viewers; sess.hype = r.hype;
    if (r.gift) giftBanner(r.gift);
    if (r.inc) { note(r.inc.icon + ' ' + r.inc.text); three && three.anim(r.inc.icon === '📶' ? 'facepalm' : 'laugh'); }
    root.querySelector('.lr-earn').textContent = '🎁 ' + r.giftsText;
    hud();
  }
  function hud() {
    if (!root) return; if (pk) { pkHud(); return; }
    root.querySelector('.lr-view').textContent = '👁 ' + fmtN(viewers);
    root.querySelector('.lr-likes').textContent = '❤️ ' + fmtN(likes);
    const hp = Math.max(0, Math.min(100, 30 + sess.hype * 5));
    const bar = root.querySelector('.lr-hype i'); if (bar) bar.style.width = hp + '%';
    const s = Math.floor((Date.now() - t0) / 1000); root.querySelector('.lr-time').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  // ---------------------------------------------------------------- mở / đóng
  function run(st) {
    return new Promise((res) => {
      done = res; sess = Object.assign({ hype: 0, ghBoost: 0 }, st); qIdx = 0; likes = Math.round(st.followers * 0.02); viewers = 3; t0 = Date.now(); replies = 0; pinned = null; ending = false;
      root = document.createElement('div'); root.className = 'lr' + (st.night ? ' night' : '');
      root.innerHTML = '<div class="lr-phone"><div class="lr-screen">' +
        '<canvas class="lr-cam"></canvas><div class="lr-fallback">📱</div><div class="lr-vig"></div>' +
        '<div class="lr-top"><div class="lr-me"><span class="lr-ava">' + esc((st.first || '?').charAt(0)) + '</span><span><b>' + esc(st.name) + (st.verified ? ' <span class="lr-tick">✔</span>' : '') + '</b><small>' + esc(st.followersText) + ' theo dõi · ' + esc(st.icon + ' ' + st.title) + '</small></span></div>' +
        '<button type="button" class="lr-end" data-end>⏹ Tắt live</button></div>' +
        '<div class="lr-stats"><span class="lr-badge">LIVE</span><span class="lr-time">0:00</span><span class="lr-view">👁 0</span><span class="lr-likes">❤️ 0</span><span class="lr-earn">🎁 0đ</span></div>' +
        '<div class="lr-hype" title="Độ hot buổi live"><i></i><small>🔥 độ hot</small></div>' +
        '<div class="lr-gifts"></div><div class="lr-hearts"></div>' +
        '<div class="lr-bottom"><div class="lr-chatwrap"><div class="lr-chat" aria-live="polite"></div><button type="button" class="lr-newmsg" data-newmsg hidden></button></div><div class="lr-pin" hidden></div>' +
        '<div class="lr-acts"><button type="button" data-act="sing">🎤 Hát</button><button type="button" data-act="dance">💃 Nhảy</button><button type="button" data-act="beg">🙏 Xin quà</button>' + (st.sell ? '<button type="button" data-act="sell">🛍️ Chốt đơn</button>' : '') + '<button type="button" data-heart>💗</button></div>' +
        '<form class="lr-say"><input maxlength="120" placeholder="Nói gì đó với người xem…" autocomplete="off"><button type="submit">Gửi</button></form>' +
        '<p class="lr-keys">Bấm vào bình luận để trả lời · câu hỏi ❓ được ghim 📌 phía trên · <kbd>Enter</kbd> để gõ</p></div>' +
        '</div></div>';
      document.body.appendChild(root);
      // ngăn phím tắt của game khi đang live
      root.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' && !/input/i.test(e.target.tagName)) { const i = root.querySelector('.lr-pin input') || root.querySelector('.lr-say input'); i && i.focus(); e.preventDefault(); } });
      root.tabIndex = -1; root.focus({ preventScroll: true });
      root.addEventListener('click', onClick);
      root.addEventListener('submit', onSubmit); bindChat();
      const cv = root.querySelector('.lr-cam');
      requestAnimationFrame(() => {
        if (!root) return;
        three = makeCam(cv, st.player, st.night);
        if (three) { root.querySelector('.lr-fallback').remove(); const loop = (now) => { if (!root) return; three.render(now); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); window.addEventListener('resize', three.size); }
      });
      note('🔴 Bạn đã bắt đầu phát trực tiếp. Người xem đang vào…');
      later(chatter, 900); later(nextQuestion, 3500); tick(); every(tick, 5500); every(hud, 1000);
      sfx('notify');
    });
  }
  function onSubmit(e) {
    e.preventDefault();
    const f = e.target, inp = f.querySelector('input'), v = inp.value.trim(); if (!v) return; inp.value = '';
    if (f.classList.contains('lr-pin-f')) answer(null, v);
    else replyMsg(null, 'text', v);
  }
  function onClick(e) {
    const t = e.target;
    if (t.closest('[data-end]')) { end(); return; }
    const ans = t.closest('[data-ans]'); if (ans) { answer(ans.dataset.ans); return; }
    if (t.closest('[data-unpin]')) { unpin(); return; }
    const a = t.closest('[data-act]'); if (a) { act(a.dataset.act); return; }
    if (t.closest('[data-heart]')) { hearts(5); sfx('click'); return; }
    const rep = t.closest('[data-rep]'); if (rep) { e.stopPropagation(); replyMsg(rep.closest('.lr-msg'), rep.dataset.rep); return; }
    const msg = t.closest('.lr-msg'); if (!msg) { closeMenus(); return; }
    if (msg.dataset.q) { const q = sess.questions.find((x) => x.id === msg.dataset.q); if (q) pin(q, msg.dataset.user); return; }
    if (msg.dataset.kind) openMenu(msg);
  }
  // kéo lên xuống xem bình luận: chuột lăn, vuốt, hoặc nút "bình luận mới"
  function bindChat() {
    const list = root.querySelector('.lr-chat'), nb = root.querySelector('.lr-newmsg');
    list.addEventListener('scroll', () => { if (list.scrollHeight - list.scrollTop - list.clientHeight < 40) { nb.hidden = true; nb.dataset.n = 0; } });
    list.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
    nb.addEventListener('click', (e) => { e.stopPropagation(); list.scrollTop = list.scrollHeight; nb.hidden = true; nb.dataset.n = 0; });
  }
  function cleanup() {
    timers.forEach((id) => { clearInterval(id); clearTimeout(id); }); timers = [];
    cancelAnimationFrame(raf); raf = 0;
    if (three) { window.removeEventListener('resize', three.size); three.dispose(); three = null; }
    if (three2) { window.removeEventListener('resize', three2.size); three2.dispose(); three2 = null; }
    if (root) { root.remove(); root = null; }
    pk = null;
  }
  function end() {
    if (ending) return; ending = true;
    sfx('click');
    const r = G().liveEnd();
    root.classList.add('ending');
    setTimeout(() => { cleanup(); const f = done; done = null; f && f(r); }, 450);
  }
  // ---------------------------------------------------------------- ⚔️ PK kiểu TikTok: chia đôi màn hình, quà quy ra điểm
  const PK_DUR = 90;
  const PK_GIFTS = [['🌹', 'Hoa hồng', 1], ['💗', 'Tim', 5], ['🍭', 'Kẹo mút', 10], ['🍩', 'Bánh donut', 30], ['🎩', 'Mũ ảo thuật', 99], ['🎂', 'Bánh kem', 199], ['🎆', 'Pháo hoa', 499], ['🚗', 'Siêu xe', 1999], ['🦁', 'Sư tử', 4999], ['🚀', 'Tên lửa', 9999]];
  const PK_CHAT = ['đội mình cố lên!!! 💪', 'thả quà đi mọi người ơi', 'sắp hết giờ rồi 😱', 'không được thua đâu', 'idol cố lên 🔥', 'ai còn xu thả hết đi', 'tui vừa nạp xu nè', 'phạt bên kia đi 😂', 'đánh đẹp quá', 'giữ vững nha', 'x2 đi idol ơi', 'bên kia nhiều fan cứng ghê', 'tim tim tim 💗💗'];
  const PK_FOE = ['bên kia đang vượt kìa 😨', 'fan bên kia đông thế', 'đối thủ hát hay phết', 'ủa bên kia ai vừa thả sư tử vậy'];
  let three2 = null, pk = null;
  const mmss = (s) => Math.floor(s / 60) + ':' + String(Math.max(0, s % 60)).padStart(2, '0');
  function pkGift(side, rate) {
    // chọn một món sao cho trung bình khớp “sức thả quà” hiện tại, thỉnh thoảng có quà to
    let g = PK_GIFTS[0], n = 1;
    const r = Math.random();
    if (r < 0.025 * Math.min(3, rate / 40)) g = PK_GIFTS[Math.min(PK_GIFTS.length - 1, 7 + Math.floor(Math.random() * 3 * Math.min(1, rate / 120)))];
    else { const target = rate * (0.3 + Math.random() * 2.2); let i = 0; while (i < 6 && PK_GIFTS[i + 1][2] <= target) i++; g = PK_GIFTS[Math.max(0, i - (Math.random() < 0.5 ? 1 : 0))]; n = Math.max(1, Math.round(target / g[2])); if (n > 99) n = 99; }
    const pts = g[2] * n * (pk.x2[side] > Date.now() ? 2 : 1);
    pk.pts[side] += pts;
    if (side === 0) { if (g[2] >= 30 || Math.random() < 0.25) giftBanner({ icon: g[0], name: g[1], n, big: g[2] >= 1999 }); else hearts(2); }
    if (side === 1 && g[2] >= 1999) { pkPop(1, g[0] + ' +' + fmtN(pts)); pkSay(pick(PK_FOE), 'hater'); }
    else if (pts >= 30) pkPop(side, '+' + fmtN(pts));
    return pts;
  }
  function pkPop(side, text) {
    const half = root && root.querySelectorAll('.pk-half')[side]; if (!half) return;
    const el = document.createElement('span'); el.className = 'pk-pop'; el.textContent = text; el.style.left = (20 + Math.random() * 55) + '%';
    half.appendChild(el); setTimeout(() => el.remove(), 1600);
  }
  const pkSay = (t, k) => addMsg(t, k || 'fan', pick(PO().NAMES));
  function pkHud() {
    if (!root || !pk) return;
    const [a, b] = pk.pts, tot = a + b, pct = tot ? Math.max(6, Math.min(94, (a / tot) * 100)) : 50;
    root.querySelector('.pk-bar i').style.width = pct + '%';
    root.querySelector('.pk-a').textContent = fmtN(Math.round(a));
    root.querySelector('.pk-b').textContent = fmtN(Math.round(b));
    const left = Math.max(0, Math.ceil(PK_DUR - (Date.now() - pk.t0) / 1000));
    const tm = root.querySelector('.pk-time'); tm.textContent = pk.started ? (left <= 10 ? '⏰ ' : '⚔️ ') + mmss(left) : 'Sắp bắt đầu';
    tm.classList.toggle('hot', pk.started && left <= 10);
    const now = Date.now();
    root.querySelectorAll('.pk-half').forEach((h, i) => { h.classList.toggle('x2', pk.x2[i] > now); h.classList.toggle('lead', pk.started && pk.pts[i] > pk.pts[1 - i]); });
    root.querySelectorAll('[data-pk]').forEach((btn) => { const cd = pk.cd[btn.dataset.pk] || 0, w = Math.ceil((cd - now) / 1000); btn.disabled = !pk.started || pk.over || cd === Infinity || w > 0; btn.querySelector('small').textContent = cd === Infinity ? 'đã dùng' : w > 0 ? w + 's' : btn.dataset.lbl; });
    root.querySelector('.lr-view').textContent = '👁 ' + fmtN(viewers);
  }
  function pkTick() {
    if (!root || !pk || pk.over || !pk.started) return;
    const now = Date.now(), el = (now - pk.t0) / 1000;
    if (el >= PK_DUR) { pkFinish(); return; }
    const hypeK = Math.max(0.5, Math.min(2.6, 1 + pk.hype * 0.07)), boost = pk.boost > now ? pk.boostK : 1;
    const ramp = Math.min(1, 0.35 + el / 15);
    // đối thủ dồn quà ở 12 giây cuối (càng bị bỏ xa càng dồn mạnh)
    let foeK = 1; if (PK_DUR - el < 12) { if (!pk.surged) { pk.surged = true; note('🔥 Fan cứng của ' + pk.foe + ' đang dồn quà phút chót!'); pkSay('bên kia dồn quà kìa, thả nhanh lên!!', 'hater'); } foeK = 1.6 + Math.max(0, (pk.pts[0] - pk.pts[1]) / Math.max(1, pk.pts[0])) * 2.2; }
    if (pk.foeBoost > now) foeK *= 1.8;
    const myRate = pk.myStr * 22 * hypeK * boost * ramp, foeRate = pk.foeStr * 22 * (0.85 + Math.random() * 0.4) * foeK * ramp;
    if (Math.random() < 0.6) pkGift(0, myRate);
    if (Math.random() < 0.6) pkGift(1, foeRate);
    // đối thủ cũng biết bật x2 / hát kéo quà
    if (!pk.foeX2 && el > 20 && Math.random() < 0.02) { pk.foeX2 = true; pk.x2[1] = now + 8000; note('⚡ ' + pk.foe + ' bật NHÂN ĐÔI điểm trong 8 giây!'); sfx('notify'); }
    if (Math.random() < 0.012) { pk.foeBoost = now + 5000; three2 && three2.anim(pick(['sing', 'dance']), 5); note('🎤 ' + pk.foe + ' đang ' + pick(['hát', 'nhảy', 'kể chuyện cảm động']) + ' kéo quà…'); }
    viewers = Math.round(viewers * 0.92 + (8 + sess.followers * 0.012) * (1 + Math.max(0, pk.hype) * 0.05) * 0.08);
    if (Math.random() < 0.08) hearts(2);
    pkHud();
  }
  function pkChatter() {
    if (!root || !pk || pk.over) return;
    const r = Math.random();
    if (r < 0.08) addMsg(pickR(PO().HATER), 'hater', pick(PO().NAMES));
    else if (r < 0.55 && pk.started) pkSay(pickR(PK_CHAT));
    else pkSay(pickR(CHILL));
    later(pkChatter, (1300 + Math.random() * 1500) * (pk.started ? 1 : 1.5));
  }
  function pkAct(k) {
    if (!pk || !pk.started || pk.over) return;
    const now = Date.now(); if ((pk.cd[k] || 0) > now) return;
    let ok = true, msg = '', anim = 'talk', loop = 0;
    if (k === 'call') { pk.cd.call = now + 12000; pk.boost = now + 8000; pk.boostK = 1.9; msg = '📣 "Cả nhà ơi thả quà giúp mình với, sắp thua rồi!" — fan cứng lao vào thả quà.'; anim = 'bow'; pkSay('thả liền đây idol ơi 🎁'); }
    else if (k === 'sing' || k === 'dance') {
      pk.cd.sing = pk.cd.dance = now + 12000; ok = Math.random() < (k === 'sing' ? sess.singP : sess.danceP);
      pk.hype += ok ? 3 : -1.5; anim = k; loop = 5;
      msg = k === 'sing' ? (ok ? '🎤 Bạn hát một đoạn cực cuốn, người xem thả tim kín màn.' : '🎤 Bạn hát lạc tông, bên kia cười ngặt nghẽo.') : (ok ? '💃 Bạn nhảy trend cực sung, quà bay tới tấp.' : '💃 Bạn trượt chân suýt ngã, chat spam 💀.');
      pkSay(ok ? pick(['hay quá trời 😍', 'cuốn ghê 🔥', 'vote đội đỏ!']) : pick(['ối dồi ôi 🙉', 'thôi đừng 😂']), ok ? 'fan' : 'hater');
      if (ok) { pk.boost = now + 5000; pk.boostK = 1.5; }
    } else if (k === 'drama') {
      pk.cd.drama = Infinity; pk.drama = true; ok = Math.random() < 0.6; anim = ok ? 'cry' : 'facepalm'; loop = 4;
      if (ok) { pk.boost = now + 7000; pk.boostK = 3; pk.hype += 2; msg = '😭 Bạn rưng rưng "hôm nay sinh nhật mẹ mình mà thua thì buồn lắm…" — người xem mủi lòng thả quà ào ào.'; pkSay('thương idol quá 🥺 thả nè'); }
      else { pk.hype -= 3; msg = '😭 Bạn giả khóc nhưng lộ quá, chat chê "diễn sâu".'; pkSay('diễn hơi lố rồi á 🙄', 'hater'); }
    } else if (k === 'x2') { pk.cd.x2 = Infinity; pk.x2[0] = now + 10000; msg = '⚡ NHÂN ĐÔI điểm trong 10 giây! Thả quà ngay!'; anim = 'cheer'; }
    note(msg); sfx(ok ? 'good' : 'bad');
    if (three) three.anim(anim, loop);
    if (ok) hearts(8);
    pkHud();
  }
  function pkFinish(forfeit) {
    if (!pk || pk.over) return; pk.over = true; ending = true;
    const [a, b] = pk.pts, win = !forfeit && a > b;
    pkHud();
    const ov = document.createElement('div'); ov.className = 'pk-result ' + (win ? 'win' : 'lose');
    ov.innerHTML = forfeit ? '<b>🏳️ Bỏ cuộc</b><small>' + esc(pk.foe) + ' thắng mặc định</small>' : '<b>' + (win ? '🏆 CHIẾN THẮNG!' : '💀 THUA RỒI…') + '</b><small>' + fmtN(Math.round(a)) + ' – ' + fmtN(Math.round(b)) + ' điểm</small><em>' + (win ? esc(pk.foe) + ' phải chịu phạt!' : 'Bạn phải chịu phạt!') + '</em>';
    root.querySelector('.lr-screen').appendChild(ov);
    root.querySelectorAll('.pk-half')[win ? 0 : 1].classList.add('won');
    if (three) three.anim(win ? 'cheer' : 'facepalm', 0);
    if (three2) three2.anim(win ? 'facepalm' : 'cheer', 0);
    sfx(win ? 'cheer' : 'bad'); if (win) hearts(24);
    setTimeout(() => {
      const r = G().pkEnd(a, b, { forfeit: !!forfeit, drama: pk && pk.drama });
      if (root) root.classList.add('ending');
      setTimeout(() => { cleanup(); const f = done; done = null; f && f(r); }, 450);
    }, forfeit ? 900 : 3200);
  }
  function runPK(st) {
    return new Promise((res) => {
      done = res; sess = Object.assign({ hype: 0, ghBoost: 0 }, st); likes = Math.round(st.followers * 0.02); viewers = 12; t0 = Date.now(); replies = 0; pinned = null; ending = false;
      pk = { foe: st.foe.name, pts: [0, 0], x2: [0, 0], cd: {}, hype: 0, boost: 0, boostK: 1, foeBoost: 0, myStr: st.myStr || 1, foeStr: st.foeStr || 1, t0: Date.now(), started: false, over: false, drama: false };
      root = document.createElement('div'); root.className = 'lr pk';
      const side = (cls, name, sub, ava) => '<div class="pk-half ' + cls + '"><canvas class="pk-cam"></canvas><div class="lr-fallback">' + ava + '</div><div class="pk-tag"><b>' + esc(name) + '</b><small>' + esc(sub) + '</small></div><span class="pk-x2">⚡x2</span></div>';
      root.innerHTML = '<div class="lr-phone"><div class="lr-screen">' +
        '<div class="lr-top"><div class="lr-me"><span class="lr-ava">' + esc((st.first || '?').charAt(0)) + '</span><span><b>' + esc(st.name) + (st.verified ? ' <span class="lr-tick">✔</span>' : '') + '</b><small>' + esc(st.followersText) + ' theo dõi · ⚔️ PK</small></span></div>' +
        '<button type="button" class="lr-end" data-end>⏹ Tắt live</button></div>' +
        '<div class="lr-stats"><span class="lr-badge">LIVE</span><span class="pk-time">Sắp bắt đầu</span><span class="lr-view">👁 0</span></div>' +
        '<div class="pk-bar"><i></i><span class="pk-a">0</span><span class="pk-b">0</span></div>' +
        '<div class="pk-split">' + side('me', 'Bạn', st.followersText + ' theo dõi', '🙂') + side('foe', st.foe.name, st.foe.followersText + ' theo dõi', '😎') + '<div class="pk-vs">VS</div><div class="pk-count"></div></div>' +
        '<div class="lr-gifts"></div><div class="lr-hearts"></div>' +
        '<div class="lr-bottom"><div class="lr-chatwrap"><div class="lr-chat" aria-live="polite"></div><button type="button" class="lr-newmsg" data-newmsg hidden></button></div>' +
        '<div class="lr-acts pk-acts">' + [['call', '📣', 'Kêu gọi quà'], ['sing', '🎤', 'Hát'], ['dance', '💃', 'Nhảy'], ['drama', '😭', 'Diễn drama'], ['x2', '⚡', 'Nhân đôi']].map(([k, ic, l]) => '<button type="button" data-pk="' + k + '" data-lbl="' + l + '" disabled>' + ic + '<small>' + l + '</small></button>').join('') + '</div>' +
        '<p class="lr-keys">Quà người xem = điểm PK · hết ' + PK_DUR + ' giây bên ít điểm phải chịu phạt · phím <kbd>1</kbd>–<kbd>5</kbd> dùng chiêu</p></div>' +
        '</div></div>';
      document.body.appendChild(root);
      root.addEventListener('keydown', (e) => { e.stopPropagation(); const i = '12345'.indexOf(e.key); if (i >= 0) { pkAct(['call', 'sing', 'dance', 'drama', 'x2'][i]); e.preventDefault(); } });
      root.tabIndex = -1; root.focus({ preventScroll: true }); bindChat();
      root.addEventListener('click', (e) => { if (e.target.closest('[data-end]')) { if (!pk.over) { sfx('click'); pkFinish(true); } return; } const b = e.target.closest('[data-pk]'); if (b) pkAct(b.dataset.pk); });
      const cvs = root.querySelectorAll('.pk-cam');
      requestAnimationFrame(() => {
        if (!root) return;
        three = makeCam(cvs[0], st.player, false);
        three2 = makeCam(cvs[1], st.foe.player, true);
        [three, three2].forEach((c, i) => { if (!c) return; c.dk = 1.25; root.querySelectorAll('.pk-half')[i].querySelector('.lr-fallback').remove(); window.addEventListener('resize', c.size); });
        if (three || three2) { const loop = (now) => { if (!root) return; three && three.render(now); three2 && three2.render(now); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); }
      });
      note('⚔️ ' + st.foe.name + ' đã vào phòng PK. Fan hai bên đang tập trung…');
      // đếm ngược 3-2-1
      const cnt = root.querySelector('.pk-count');
      [3, 2, 1].forEach((n, i) => later(() => { cnt.textContent = n; cnt.className = 'pk-count on'; sfx('click'); }, 1200 + i * 900));
      later(() => { cnt.textContent = 'PK!'; sfx('notify'); pk.started = true; pk.t0 = Date.now(); later(() => (cnt.className = 'pk-count'), 700); pkHud(); }, 1200 + 3 * 900);
      later(pkChatter, 700); every(pkTick, 800); every(pkHud, 1000); pkHud();
      sfx('notify');
    });
  }
  KN.LiveRoom = { run, runPK, makeCam, isOpen: () => !!root, KINDS: ['qa', 'khuya', 'giangho', 'live'], _cam: () => three, _pk: () => pk };
})();
