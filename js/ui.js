/* Một Kiếp Người — UI controller (KN.UI). SPEC §6 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const U = KN.util, D = KN.DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = () => KN.Game;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PREFS = 'kn_ui_v1';
  const prefs = Object.assign({ sfx: true, music: true, quality: null, coach: 0, tab: 'log' }, KN.store.get(PREFS, {}) || {});
  const savePrefs = () => KN.store.set(PREFS, prefs);
  const S = { mode: 'title', busy: false, tab: prefs.tab || 'log', worldOk: false, demoN: U.randi(0, 15), demoTimer: null, seenLog: 0, prevStats: null, prevAge: null, primary: null, choiceFns: [], create: null, moneyShown: null, coachShown: {}, sceneSeq: 0 };

  // bộ icon nét mảnh dùng chung cho chỉ số và thanh mục (thay emoji để giao diện đồng nhất)
  const SVGI = {
    happy: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M9 9.5h.01M15 9.5h.01"/>',
    health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    smarts: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    looks: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z"/>',
    log: '<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6zM6 4v16M10 9h6M10 13h6"/>',
    act: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M16 14.2c3 .2 5 2.3 5 5.3"/>',
    career: '<path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/>',
    money: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16 14.5h2"/>',
    social: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  };
  const svgIc = (k, s) => '<svg class="gi" width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SVGI[k] || '') + '</svg>';
  const STAT_META = [
    { k: 'happy', label: 'Hạnh phúc', icon: svgIc('happy', 16), c: 'var(--c-happy)' },
    { k: 'health', label: 'Sức khỏe', icon: svgIc('health', 16), c: 'var(--c-health)' },
    { k: 'smarts', label: 'Trí tuệ', icon: svgIc('smarts', 16), c: 'var(--c-smarts)' },
    { k: 'looks', label: 'Ngoại hình', icon: svgIc('looks', 16), c: 'var(--c-looks)' },
  ];
  const DELTA_META = { happy: ['😊', 'Hạnh phúc'], health: ['❤️', 'Sức khỏe'], smarts: ['🧠', 'Trí tuệ'], looks: ['✨', 'Ngoại hình'], karma: ['☯️', 'Đức'], money: ['💰', ''] };
  const TABS = [{ id: 'log', icon: svgIc('log', 20), label: 'Nhật ký' }, { id: 'act', icon: svgIc('act', 20), label: 'Hoạt động' }, { id: 'people', icon: svgIc('people', 20), label: 'Quan hệ' }, { id: 'career', icon: svgIc('career', 20), label: 'Học/Làm' }, { id: 'money', icon: svgIc('money', 20), label: 'Tài sản' }, { id: 'social', icon: svgIc('social', 20), label: 'MXH' }];

  // ------------------------------------------------------------------ audio
  function sfx(n) { try { if (prefs.sfx && KN.Audio) KN.Audio.sfx(n); } catch (e) { /* */ } }
  function mood(m) { try { KN.Audio && KN.Audio.mood(m); } catch (e) { /* */ } }
  let unlocked = false;
  function unlockAudio() {
    if (unlocked || !KN.Audio) return; unlocked = true;
    try { KN.Audio.setSfx(prefs.sfx); KN.Audio.setMusic(prefs.music); KN.Audio.unlock(); } catch (e) { /* */ }
  }

  // ------------------------------------------------------------------ safe calls / toasts
  function safe(fn) {
    try { return fn(); } catch (e) { console.error('[KN.UI]', e); toast('Có trục trặc nhỏ', 'Thử lại thao tác vừa rồi nhé.', '⚠️', 'err'); return null; }
  }
  function toast(title, body, icon, kind) {
    const box = $('#toasts');
    while (box.children.length >= 3) box.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.innerHTML = '<div class="ti">' + esc(icon || '✨') + '</div><div><div class="tt">' + esc(title) + '</div>' + (body ? '<div class="tb">' + esc(body) + '</div>' : '') + '</div>';
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, kind === 'ach' ? 4200 : 3200);
  }
  function celebrate(r) {
    (r.achievements || []).forEach((a, i) => setTimeout(() => { toast('Thành tựu mới', a.icon + ' ' + a.name, '🏆', 'ach'); sfx('achievement'); }, 500 + i * 900));
    (r.goals || []).forEach((g, i) => setTimeout(() => { toast('Hoàn thành mục tiêu', g.text, '🎯', 'ach'); sfx('cheer'); }, 900 + i * 900));
    if (r.phuc) setTimeout(() => { toast('Viên mãn! +' + r.phuc + ' Phúc đức', 'Dùng điểm này ở màn tạo nhân vật kiếp sau.', '🌟', 'ach'); sfx('achievement'); }, 1800 + (r.goals || []).length * 900);
  }

  // ------------------------------------------------------------------ world & bubbles
  const bubbles = [];
  function playScene(sc) {
    if (!sc) return Promise.resolve();
    updateLocTag(sc);
    if (!S.worldOk) { clearBubbles(); return Promise.resolve(); }
    clearBubbles();
    const seq = ++S.sceneSeq;
    const p = Promise.resolve(safe(() => KN.World.playScene(sc)));
    p.then(() => { if (seq === S.sceneSeq) showBubbles(sc, seq); }).catch(() => {});
    return p;
  }
  function updateLocTag(sc) {
    const tag = $('#locTag');
    if (S.mode !== 'play' || !sc || !sc.loc) { tag.hidden = true; return; }
    const m = KN.Env && KN.Env.meta(sc.loc);
    const v = G().view();
    const tod = { dawn: 'Bình minh', day: '', dusk: 'Hoàng hôn', night: 'Đêm' }[sc.time] || '';
    tag.textContent = (m ? m.name : sc.loc) + (tod ? ' · ' + tod : '') + (v ? ' · Năm ' + v.year : '');
    tag.hidden = false;
  }
  function clearBubbles() { bubbles.splice(0).forEach((b) => b.el.remove()); }
  function showBubbles(sc, seq) {
    const list = [];
    if (sc.player && sc.player.say && !sc.player.hidden) list.push({ id: 'player', text: sc.player.say, me: true });
    (sc.npcs || []).forEach((n) => { if (n.say) list.push({ id: n.id, text: n.say }); });
    list.slice(0, 4).forEach((b, i) => setTimeout(() => { if (seq === S.sceneSeq) addBubble(b); }, i * 700));
  }
  function addBubble(b) {
    const e = document.createElement('div');
    e.className = 'bubble' + (b.me ? ' me' : '');
    e.textContent = b.text;
    e.style.visibility = 'hidden';
    $('#bubbles').appendChild(e);
    bubbles.push({ el: e, id: b.id, born: performance.now(), life: 3600 + b.text.length * 35 });
    if (b.me) sfx('pop'); else sfx('tick');
  }
  function tickBubbles() {
    const now = performance.now();
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (now - b.born > b.life) { b.el.classList.add('out'); const el = b.el; setTimeout(() => el.remove(), 320); bubbles.splice(i, 1); continue; }
      const p = KN.World.screenPos(b.id);
      if (!p.visible) { b.el.style.visibility = 'hidden'; continue; }
      const w = b.el.offsetWidth, h = b.el.offsetHeight, sw = $('#stage').clientWidth;
      const x = U.clamp(p.x - w / 2, 6, sw - w - 6), y = Math.max(6, p.y - h - 12);
      b.el.style.visibility = 'visible';
      b.el.style.left = x + 'px'; b.el.style.top = y + 'px';
    }
  }

  // ------------------------------------------------------------------ modes
  function setMode(m) {
    S.mode = m;
    $('#app').dataset.mode = m;
    $('#titleScreen').hidden = m !== 'title';
    $('#viewPlay').hidden = m !== 'play';
    $('#viewCreate').hidden = m !== 'create';
    $('#viewDeath').hidden = m !== 'death';
    $('#hud').hidden = !(m === 'play' || m === 'death');
    $('#btnAge').hidden = m !== 'play'; { const ff = $('#btnFF'); if (ff && m !== 'play') ff.hidden = true; }
    if (m !== 'play') hideSheet();
    if (m !== 'title') stopDemo();
    if (m !== 'play') $('#locTag').hidden = true;
  }
  async function fadeThrough(fn) {
    const f = $('#fade');
    if (reduced) { await fn(); return; }
    f.classList.add('on'); await sleep(450);
    try { await fn(); } finally { f.classList.remove('on'); }
  }

  // ------------------------------------------------------------------ title
  function showTitle() {
    setMode('title');
    // màn hình chính luôn là “phòng” offline; trận online nằm ở ô lưu riêng, không bị đè
    if (G().setMode) G().setMode('offline');
    const btn = $('#btnContinue');
    const v = G().hasLife() ? G().view() : null;
    const lc = (head, v2) => '<span class="lc-av" aria-hidden="true">' + (v2.alive ? '🌱' : '🕯️') + '</span><span class="lc-tx"><small>' + head + '</small><b>' + esc(v2.fullName || v2.name) + '</b><em>' + v2.age + ' tuổi · ' + esc(v2.occupation || v2.stageLabel || '') + (v2.alive ? ' · ' + esc(v2.moneyText) : '') + '</em></span><span class="lc-go" aria-hidden="true">›</span>';
    if (v && v.alive) { btn.hidden = false; btn.innerHTML = lc('Tiếp tục kiếp đang sống', v); }
    else if (v && !v.alive) { btn.hidden = false; btn.innerHTML = lc('Xem lại kiếp vừa khép lại', v); }
    else btn.hidden = true;
    $('#btnNew').textContent = v ? 'Bắt đầu một kiếp mới' : 'Bắt đầu kiếp đầu tiên';
    $('#btnNew').classList.toggle('btn-primary', !v || !v.alive); $('#btnNew').classList.toggle('btn-soft', !!(v && v.alive));
    safe(() => { const c = G().dailyChallenge(), tc = $('#todayCard'); tc.hidden = false; tc.innerHTML = '<small>Hôm nay</small><b>' + c.icon + ' ' + esc(c.text) + '</b>'; tc.onclick = () => { sfx('click'); const d = $('#btnDaily'); if (d) d.click(); }; const td = $('#tileDaily'); if (td) td.textContent = 'Đề hôm nay: ' + c.icon; });
    updateOnlineTitle();
    const m = G().meta();
    $('#btnGrave').textContent = '🕯️ Nghĩa trang' + (m.lives.length ? ' (' + m.lives.length + ')' : '');
    $('#btnAch').textContent = '🏆 Thành tựu ' + Object.keys(m.achievements).length + '/' + D.ACHIEVEMENTS.length;
    { const ta = $('#tileAch'); if (ta) ta.textContent = Object.keys(m.achievements).length + '/' + D.ACHIEVEMENTS.length + ' đã mở'; }
    const latest = (D.CHANGELOG || [])[0];
    if (latest) { $('#newsLabel').textContent = '✨ Có gì mới · v' + latest.v; $('#newsDot').hidden = prefs.seenVer === latest.v; }
    else $('#btnNews').hidden = true;
    mood('calm');
    startDemo();
  }
  // nút “Tiếp tục trận online” chỉ hiện khi đang ở trong một trận
  function updateOnlineTitle() {
    const b = $('#btnOnlineCont'); if (!b) return;
    const inMatch = KN.Online && KN.Online.inMatch && KN.Online.inMatch();
    const ov = G().peekSave ? G().peekSave('online') : null;
    if (!inMatch) { b.hidden = true; return; }
    b.hidden = false;
    b.textContent = ov ? '⚔️ Tiếp tục trận online: ' + ov.name + ', ' + ov.age + ' tuổi' + (ov.alive ? '' : ' (đã khuất)') : '⚔️ Vào trận online (tạo nhân vật)';
  }
  // sang “phòng” online: chuyển ô lưu, rồi tiếp tục nhân vật online (hoặc tạo mới nếu chưa có)
  async function enterOnline() {
    if (!G().setMode) return;
    G().setMode('online');
    if (KN.Online && KN.Online.onResume) safe(() => KN.Online.onResume());
    if (G().hasLife()) await resumeLife(); else openCreator();
  }
  function startDemo() {
    stopDemo();
    const step = () => { if (S.mode === 'title') playScene(G().demoScene(S.demoN++)); };
    step();
    S.demoTimer = setInterval(step, 7000);
  }
  function stopDemo() { if (S.demoTimer) clearInterval(S.demoTimer); S.demoTimer = null; }

  // ------------------------------------------------------------------ creator
  // extra: { rebirth } (đầu thai theo nghiệp) hoặc { scenario } (kịch bản đặc biệt)
  function openCreator(extra) {
    const g = U.pick(['m', 'f']);
    S.create = Object.assign({ gender: g, city: U.pick(D.CITIES).id, app: D.randomAppearance(g, 20), goals: U.shuffle(G().goalsList()).slice(0, 3).map((x) => x.id), perks: [], diff: prefs.diff || 'thuong' }, D.randomName(g), extra && typeof extra === 'object' && !extra.target ? extra : {});
    setMode('create');
    renderCreator();
    previewCreator('wave');
    mood('happy');
  }
  // gợi ý thời đại theo năm sinh
  function bornHint(y) {
    return ({ 2026: 'sống từ nay đến tương lai: mạng xã hội, AI, xe tự lái', 2010: 'tuổi thơ có smartphone, lớn lên cùng AI', 1995: 'tuổi thơ quán net, lớn lên thời hội nhập', 1985: 'tuổi thơ bao cấp, lớn lên thời Đổi Mới', 1975: 'sinh năm thống nhất, tuổi trẻ thời bao cấp', 1965: 'tuổi thơ giữa bom đạn, tuổi trẻ thời bao cấp', 1955: 'lớn lên trong chiến tranh, có thể ra trận', 1945: 'trải qua hai cuộc kháng chiến' }[y] || '') + ' · tiền quy đổi theo thời giá hiện nay';
  }
  // dựng lại khung tạo nhân vật mà KHÔNG nhảy về đầu trang: lưu vị trí cuộn của mọi khung cuộn rồi trả lại sau khi vẽ
  function renderCreator() {
    const vc = $('#viewCreate');
    const boxes = [vc, vc && vc.querySelector('.create-wrap'), $('#panel'), document.scrollingElement];
    const saved = boxes.map((el) => (el ? el.scrollTop : null));
    renderCreatorInner();
    const boxes2 = [vc, vc && vc.querySelector('.create-wrap'), $('#panel'), document.scrollingElement];
    boxes2.forEach((el, i) => { if (el && saved[i] != null) el.scrollTop = saved[i]; });
  }
  function renderCreatorInner() {
    const c = S.create, a = c.app;
    const sw = (key, list) => list.map((col) => '<button type="button" class="sw" style="--c:' + col + '" data-k="' + key + '" data-v="' + col + '" aria-pressed="' + (a[key] === col) + '" aria-label="' + col + '"></button>').join('');
    const chips = (key, list) => list.map((o) => '<button type="button" data-k="' + key + '" data-v="' + o.id + '" aria-pressed="' + (a[key] === o.id) + '">' + esc(o.label) + '</button>').join('');
    $('#viewCreate').innerHTML =
      '<div class="create-wrap">' +
      '<h2>Kiếp mới</h2><p>Bạn sẽ chào đời trong một gia đình Việt. Chọn vài điều về mình — phần còn lại, đời sẽ lo.</p>' +
      (c.rebirth ? '<div class="card create-banner"><b>♻️ Đầu thai · ' + esc(c.rebirth.icon + ' ' + c.rebirth.label) + '</b><span class="p-sub">Kiếp trước: ' + esc(c.rebirth.past.name) + ' (' + c.rebirth.past.born + '–' + c.rebirth.past.died + ') · nghiệp ' + c.rebirth.karma + '. ' + esc(c.rebirth.desc) + '</span></div>' : '') +
      (c.scenario ? (() => { const sc = G().scenarios().find((x) => x.id === c.scenario); return sc ? '<div class="card create-banner"><b>🎬 Kịch bản: ' + sc.icon + ' ' + esc(sc.name) + '</b><span class="p-sub">' + esc(sc.desc) + ' 🎯 Mục tiêu: <b>' + esc(sc.goal) + '</b>' + (sc.born !== 2026 ? ' · năm sinh cố định ' + sc.born : '') + '</span></div>' : ''; })() : '') +
      (c.same ? '<div class="card create-banner" style="border-color:rgba(255,179,71,.6)"><b>⚔️ Thách đấu cùng xuất phát</b><span class="p-sub">' + esc(c.same.from || 'Bạn bè') + ' đã sống đời này được <b>' + (c.same.age || '?') + ' tuổi, ' + (c.same.score || 0) + ' điểm</b>' + (c.same.rank ? ' (' + esc(c.same.rank) + ')' : '') + '. Cùng tên, cùng quê, cùng năm sinh, cùng chỉ số — xem bạn có sống tốt hơn không!</span></div>' : '') +
      '<div class="field"><span class="lbl">🔮 Ngày sinh <small>tuỳ chọn — lá số cộng chút chỉ số khởi đầu</small></span><div class="names"><select id="bdD" class="select" aria-label="Ngày"><option value="">Ngày</option>' + Array.from({ length: 31 }, (_, i) => '<option value="' + (i + 1) + '"' + (c.birthday && c.birthday.d === i + 1 ? ' selected' : '') + '>' + (i + 1) + '</option>').join('') + '</select><select id="bdM" class="select" aria-label="Tháng"><option value="">Tháng</option>' + Array.from({ length: 12 }, (_, i) => '<option value="' + (i + 1) + '"' + (c.birthday && c.birthday.m === i + 1 ? ' selected' : '') + '>Tháng ' + (i + 1) + '</option>').join('') + '</select></div>' +
        (c.birthday && c.birthday.d && c.birthday.m ? (() => { const x = G().destinyPreview(c.birthday.d, c.birthday.m, c.born || 2026); return '<div class="card destiny"><b>' + x.zodiac.icon + ' ' + esc(x.zodiac.name) + ' · nguyên tố ' + esc(x.element) + ' · tuổi ' + esc(x.canchi) + ' ' + x.animal + '</b><span>“' + esc(x.text) + '”</span><small class="p-sub">' + esc(x.effText) + '</small></div>'; })() : '') + '</div>' +
      '<div class="field"><span class="lbl">Giới tính</span><div class="seg" role="group"><button type="button" data-g="m" aria-pressed="' + (c.gender === 'm') + '">Nam</button><button type="button" data-g="f" aria-pressed="' + (c.gender === 'f') + '">Nữ</button></div></div>' +
      '<div class="field"><span class="lbl">Độ khó <small>' + esc((D.DIFFICULTY.find((x) => x.id === (c.diff || 'thuong')) || {}).desc || '') + '</small></span><div class="seg" role="group">' + D.DIFFICULTY.map((d) => '<button type="button" data-diff="' + d.id + '" aria-pressed="' + ((c.diff || 'thuong') === d.id) + '">' + d.icon + ' ' + d.label + '</button>').join('') + '</div></div>' +
      '<div class="field"><span class="lbl">Năm sinh <small>' + esc(bornHint(c.born || 2026)) + '</small></span><div class="seg wrap" role="group">' + [2026, 2010, 1995, 1985, 1975, 1965, 1955, 1945].map((y) => '<button type="button" data-born="' + y + '" aria-pressed="' + ((c.born || 2026) === y) + '">' + (y === 2026 ? 'Hiện tại' : y) + '</button>').join('') + '</div></div>' +
      '<div class="field"><span class="lbl">Xu hướng tính dục <small>ẩn đến tuổi dậy thì mới tự nhận ra</small></span><div class="seg" role="group">' + [['random', '🎲 Để đời quyết định'], ['straight', 'Dị tính'], ['gay', 'Đồng tính'], ['bi', 'Song tính']].map(([k, l]) => '<button type="button" data-or="' + k + '" aria-pressed="' + ((c.orientation || 'random') === k) + '">' + l + '</button>').join('') + '</div></div>' +
      '<div class="field"><label for="nLast">Họ và tên</label><div class="names">' +
      '<input id="nLast" value="' + esc(c.lastName) + '" aria-label="Họ" maxlength="12">' +
      '<input id="nMid" value="' + esc(c.middleName) + '" aria-label="Tên đệm" maxlength="12">' +
      '<input id="nFirst" value="' + esc(c.firstName) + '" aria-label="Tên" maxlength="12">' +
      '<button type="button" id="nDice" class="btn btn-soft btn-icon" aria-label="Đặt tên ngẫu nhiên">🎲</button></div></div>' +
      '<div class="field"><label for="nCity">Nơi chào đời</label><select id="nCity" class="select">' + D.CITIES.map((x) => '<option value="' + x.id + '"' + (x.id === c.city ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></div>' +
      '<div class="field"><span class="lbl">Màu da</span><div class="swatches">' + sw('skin', D.SKIN_TONES) + '</div></div>' +
      '<div class="field"><span class="lbl">Màu tóc' + (G().unlocked('tocdep') ? ' <small>✨ đã mở màu đặc biệt</small>' : '') + '</span><div class="swatches">' + sw('hair', D.HAIR_COLORS.concat(G().unlocked('tocdep') ? D.SPECIAL_HAIR : [])) + '</div></div>' +
      '<div class="field"><span class="lbl">Kiểu tóc</span><div class="chipsel">' + chips('hairStyle', D.HAIR_STYLES) + '</div></div>' +
      '<div class="field"><span class="lbl">Trang phục</span><div class="chipsel">' + chips('topStyle', D.TOP_STYLES) + '</div></div>' +
      '<div class="field"><span class="lbl">Màu áo</span><div class="swatches">' + sw('top', D.OUTFIT_COLORS) + '</div></div>' +
      '<div class="field"><span class="lbl">Phụ kiện</span><div class="chipsel"><button type="button" data-t="glasses" aria-pressed="' + !!a.glasses + '">👓 Kính</button>' +
        HATS.filter((h) => h.free || G().unlocked('mu')).map((h) => '<button type="button" data-hat="' + h.id + '" aria-pressed="' + (a.hat === h.id) + '">' + h.label + '</button>').join('') +
        '<button type="button" data-rnd="1">🎲 Ngẫu nhiên tất cả</button></div></div>' +
      '<div class="field"><span class="lbl">✨ Skin đặc biệt <small>mở khoá bằng thành tích các kiếp</small></span><div class="skins">' + G().skinsView().map((s) => '<button type="button" class="skin' + (c.skin === s.id ? ' on' : '') + '" data-skin="' + s.id + '"' + (s.ok ? '' : ' disabled') + ' title="' + esc(s.needText) + '"><span>' + s.icon + '</span><b>' + esc(s.name) + '</b><small>' + (s.ok ? (c.skin === s.id ? '✓ đang mặc' : 'Mặc thử') : '🔒 ' + esc(s.needText)) + '</small></button>').join('') + '</div></div>' +
      goalsField(c) + perksField(c) +
      '</div>' +
      '<div class="create-foot"><button type="button" id="cBack" class="btn btn-ghost">Quay lại</button><button type="button" id="cGo" class="btn btn-primary btn-lg">👶 Chào đời</button></div>';
    const root = $('#viewCreate');
    root.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { sfx('click'); const g = b.dataset.g; if (g === c.gender) return; const keep = { skin: a.skin, hair: a.hair }; c.gender = g; Object.assign(c, D.randomName(g)); c.app = Object.assign(D.randomAppearance(g, 20), keep); renderCreator(); previewCreator('wave'); });
    root.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { sfx('click'); a[b.dataset.k] = b.dataset.v; if (b.dataset.k === 'topStyle' && b.dataset.v === 'aodai') a.bottom = '#f5f5f2'; renderCreator(); previewCreator(b.dataset.k === 'topStyle' ? 'dance' : 'cheer'); });
    root.querySelectorAll('[data-or]').forEach((b) => b.onclick = () => { sfx('click'); c.orientation = b.dataset.or; renderCreator(); });
    root.querySelectorAll('[data-born]').forEach((b) => b.onclick = () => { sfx('click'); c.born = +b.dataset.born; renderCreator(); });
    root.querySelectorAll('[data-diff]').forEach((b) => b.onclick = () => { sfx('click'); c.diff = b.dataset.diff; prefs.diff = c.diff; savePrefs(); renderCreator(); });
    root.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { sfx('click'); a.glasses = !a.glasses; renderCreator(); previewCreator('nod'); });
    root.querySelectorAll('[data-hat]').forEach((b) => b.onclick = () => { sfx('click'); a.hat = a.hat === b.dataset.hat ? null : b.dataset.hat; renderCreator(); previewCreator('nod'); });
    root.querySelectorAll('[data-goal]').forEach((b) => b.onclick = () => {
      const id = b.dataset.goal, i = c.goals.indexOf(id);
      if (i >= 0) c.goals.splice(i, 1); else { if (c.goals.length >= 3) c.goals.shift(); c.goals.push(id); }
      sfx('click'); renderCreator();
    });
    const gr = root.querySelector('[data-goalrnd]'); if (gr) gr.onclick = () => { sfx('whoosh'); c.goals = U.shuffle(G().goalsList()).slice(0, 3).map((x) => x.id); renderCreator(); };
    root.querySelectorAll('[data-perk]').forEach((b) => b.onclick = () => {
      const id = b.dataset.perk, i = c.perks.indexOf(id);
      if (i >= 0) c.perks.splice(i, 1); else c.perks.push(id);
      sfx(i >= 0 ? 'click' : 'coin'); renderCreator(); previewCreator(i >= 0 ? 'nod' : 'cheer');
    });
    root.querySelectorAll('[data-unlock]').forEach((b) => b.onclick = () => {
      const r = G().buyUnlock(b.dataset.unlock);
      if (r.ok) { sfx('achievement'); toast('Đã mở khóa', b.dataset.name || '', '✨', 'ach'); } else toast('Chưa mở được', r.reason, '⛔', 'err');
      renderCreator();
    });
    root.querySelector('[data-rnd]').onclick = () => { sfx('whoosh'); c.app = D.randomAppearance(c.gender, 20); Object.assign(c, D.randomName(c.gender)); renderCreator(); previewCreator('jump'); };
    $('#nDice').onclick = () => { sfx('click'); Object.assign(c, D.randomName(c.gender)); renderCreator(); previewCreator('wave'); };
    ['nLast', 'nMid', 'nFirst'].forEach((id) => { $('#' + id).oninput = (e) => { const v = e.target.value.trim(); if (id === 'nLast') c.lastName = v; if (id === 'nMid') c.middleName = v; if (id === 'nFirst') c.firstName = v; }; });
    $('#nFirst').onchange = () => previewCreator('wave');
    $('#nCity').onchange = (e) => { c.city = e.target.value; sfx('click'); };
    const bd = () => { const d = +$('#bdD').value, m = +$('#bdM').value; c.birthday = d && m ? { d, m } : (d || m ? { d, m } : null); sfx('click'); renderCreator(); };
    $('#bdD').onchange = bd; $('#bdM').onchange = bd;
    root.querySelectorAll('[data-skin]').forEach((b) => b.onclick = () => { const s = G().skinsView().find((x) => x.id === b.dataset.skin); if (!s || !s.ok) return; sfx('coin'); if (c.skin === s.id) { delete a.acc; c.skin = null; } else { Object.assign(a, s.app); c.skin = s.id; } renderCreator(); previewCreator('cheer'); });
    $('#cBack').onclick = () => { sfx('click'); showTitle(); };
    $('#cGo').onclick = () => startLife();
  }
  const HATS = [{ id: 'conical', label: 'Nón lá', free: true }, { id: 'cap', label: '🧢 Mũ lưỡi trai' }, { id: 'beanie', label: 'Mũ len' }, { id: 'helmet', label: '⛑️ Mũ bảo hiểm' }];
  function goalsField(c) {
    const list = G().goalsList();
    return '<div class="field"><span class="lbl">Mục tiêu kiếp này <small>chọn 3 · ★ càng nhiều càng khó · đạt đủ cả 3 để nhận điểm Phúc đức</small></span>' +
      '<div class="chipsel goalsel">' + list.map((g) => '<button type="button" data-goal="' + g.id + '" aria-pressed="' + c.goals.includes(g.id) + '">' + esc(g.text) + ' <span class="stars">' + '★'.repeat(g.diff) + '</span></button>').join('') +
      '<button type="button" data-goalrnd="1">🎲 Chọn ngẫu nhiên</button></div>' +
      '<div class="p-sub goalcount">Đã chọn ' + c.goals.length + '/3' + (c.goals.length < 3 ? ' — phần còn thiếu sẽ được chọn ngẫu nhiên' : '') + '</div></div>';
  }
  function perksField(c) {
    const all = G().perks(), have = G().phuc();
    c.perks = c.perks.filter((id) => all.some((p) => p.id === id && p.kind === 'life'));
    let spent = c.perks.reduce((t, id) => t + (all.find((p) => p.id === id) || {}).cost, 0);
    while (spent > have && c.perks.length) { c.perks.pop(); spent = c.perks.reduce((t, id) => t + (all.find((p) => p.id === id) || {}).cost, 0); }
    const left = have - spent;
    const life = all.filter((p) => p.kind === 'life'), unl = all.filter((p) => p.kind === 'unlock');
    return '<div class="field"><span class="lbl">Phúc phần <small>✨ còn ' + left + '/' + have + ' điểm Phúc đức</small></span>' +
      (have ? '' : '<p class="p-sub perk-note">Hoàn thành đủ 3 mục tiêu trong một kiếp để nhận điểm Phúc đức, rồi đổi lấy lợi thế cho kiếp sau.</p>') +
      '<div class="perks">' + life.map((p) => { const on = c.perks.includes(p.id); const can = on || p.cost <= left; return '<button type="button" class="perk" data-perk="' + p.id + '" aria-pressed="' + on + '"' + (can ? '' : ' disabled') + '><span class="pi">' + p.icon + '</span><span class="pt"><b>' + esc(p.name) + '</b><small>' + esc(p.desc) + '</small></span><span class="pc">' + p.cost + '✨</span></button>'; }).join('') +
      unl.map((p) => '<button type="button" class="perk unlock" ' + (p.owned ? 'disabled aria-pressed="true"' : 'data-unlock="' + p.id + '" data-name="' + esc(p.name) + '"' + (p.cost <= left ? '' : ' disabled')) + '><span class="pi">' + p.icon + '</span><span class="pt"><b>' + esc(p.name) + '</b><small>' + esc(p.desc) + '</small></span><span class="pc">' + (p.owned ? 'Đã mở' : 'Mở ' + p.cost + '✨') + '</span></button>').join('') +
      '</div></div>';
  }
  let pvTimer = null;
  function previewCreator(anim) {
    clearTimeout(pvTimer);
    pvTimer = setTimeout(() => {
      const c = S.create;
      playScene({ loc: 'home', decor: null, time: 'day', weather: 'clear', shot: 'close', npcs: [], fx: anim === 'jump' ? 'sparkle' : null,
        player: { id: 'player', name: c.firstName, appearance: c.app, age: 20, gender: c.gender, anim: anim || 'wave', expr: null, say: 'Chào bạn, mình là ' + (c.firstName || '…') + '!' } });
    }, 160);
  }
  async function startLife() {
    const c = S.create;
    if (!c.firstName) { toast('Thiếu tên', 'Hãy đặt cho mình một cái tên nhé.', '✏️', 'err'); return; }
    unlockAudio(); sfx('birth');
    let r;
    await fadeThrough(async () => {
      r = safe(() => G().newLife(Object.assign({ gender: c.gender, firstName: c.firstName, middleName: c.middleName, lastName: c.lastName || 'Nguyễn', city: c.city, appearance: c.app, goals: c.goals, perks: c.perks, orientation: c.orientation && c.orientation !== 'random' ? c.orientation : null, diff: c.diff || 'thuong', born: c.born || 2026, clanLevel: KN.Clan ? KN.Clan.level() : 0, rebirth: c.rebirth || null, scenario: c.scenario || null, birthday: c.birthday && c.birthday.d && c.birthday.m ? c.birthday : null, same: c.same || null }, (KN.Online && KN.Online.familyOpts && KN.Online.familyOpts()) || {})));
      if (!r) return;
      S.seenLog = 0; S.prevStats = null; S.prevAge = null; S.moneyShown = null;
      setMode('play'); render();
    });
    if (!r) { showTitle(); return; }
    if (KN.Online && KN.Online.onLifeStart) safe(() => KN.Online.onLifeStart());
    if (KN.Extras && KN.Extras.onLifeStart) safe(() => KN.Extras.onLifeStart());
    mood('happy');
    S.busy = true; setAgeBtn();
    try { await presentResult(r, { kicker: 'Khởi đầu' }); } finally { S.busy = false; setAgeBtn(); }
    coach('age');
  }

  // ------------------------------------------------------------------ play: render
  let renderQueued = false;
  function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }
  function render() {
    if (S.mode !== 'play' && S.mode !== 'death') return;
    const v = G().view(); if (!v) return;
    renderHud(v); setAgeBtn();
    if (S.mode === 'play') { renderStats(v); renderTabs(v); renderTab(v); }
  }
  function renderHud(v) {
    const ageEl = $('#hudAge');
    if (S.prevAge !== v.age) { ageEl.textContent = v.age; if (S.prevAge != null && !reduced) { ageEl.classList.remove('flip'); void ageEl.offsetWidth; ageEl.classList.add('flip'); } S.prevAge = v.age; }
    $('#hudName').textContent = v.fullName + (v.generation > 1 ? ' · đời ' + v.generation : '');
    $('#hudOcc').textContent = v.occupation + ' · ' + v.cityName;
    countMoney(v.money);
  }
  let moneyAnim = null;
  function countMoney(target) {
    const el = $('#hudMoney');
    const from = S.moneyShown == null ? target : S.moneyShown;
    S.moneyShown = target;
    if (moneyAnim) cancelAnimationFrame(moneyAnim);
    if (from === target || reduced) { el.textContent = '💰 ' + D.fmtMoney(target); return; }
    const t0 = performance.now(), dur = 800;
    const stepFn = (now) => { const k = Math.min(1, (now - t0) / dur), e = U.ease.outCubic(k); el.textContent = '💰 ' + D.fmtMoney(from + (target - from) * e); if (k < 1) moneyAnim = requestAnimationFrame(stepFn); };
    moneyAnim = requestAnimationFrame(stepFn);
  }
  function renderStats(v) {
    const box = $('#stats');
    if (!box.children.length) {
      box.innerHTML = STAT_META.map((m) => '<div class="stat" data-s="' + m.k + '" style="--c:' + m.c + '" title="' + m.label + '"><span class="stat-ic">' + m.icon + '</span><div class="stat-body"><div class="stat-top"><span>' + m.label + '</span><b>0</b></div><div class="stat-bar"><div class="stat-fill"></div></div></div></div>').join('');
    }
    STAT_META.forEach((m) => {
      const el = box.querySelector('[data-s="' + m.k + '"]'), val = v.stats[m.k];
      el.querySelector('b').textContent = val;
      el.querySelector('.stat-fill').style.width = val + '%';
      el.classList.toggle('low', val < 20);
      if (S.prevStats && S.prevStats[m.k] !== val) {
        const d = val - S.prevStats[m.k];
        const f = document.createElement('span'); f.className = 'stat-float ' + (d > 0 ? 'up' : 'down'); f.textContent = (d > 0 ? '+' : '') + d;
        el.appendChild(f); setTimeout(() => f.remove(), 1700);
      }
    });
    S.prevStats = Object.assign({}, v.stats);
  }
  function renderTabs(v) {
    const nav = $('#tabs');
    if (!nav.children.length) {
      nav.innerHTML = TABS.map((t) => '<button type="button" class="tab" role="tab" data-tab="' + t.id + '"><span class="ti">' + t.icon + '</span>' + t.label + '</button>').join('');
      nav.querySelectorAll('.tab').forEach((b) => b.onclick = () => { sfx('page'); switchTab(b.dataset.tab); });
    }
    nav.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === S.tab)));
  }
  function switchTab(id) { S.tab = id; prefs.tab = id; savePrefs(); const v = G().view(); if (v) { renderTabs(v); renderTab(v); $('#tabBody').scrollTop = 0; } }
  function renderTab(v) {
    const body = $('#tabBody');
    const top = body.scrollTop;
    try {
      body.innerHTML = { log: tabLog, act: tabAct, people: tabPeople, career: tabCareer, money: tabMoney, social: tabSocial }[S.tab](v);
    } catch (e) { console.error(e); body.innerHTML = '<div class="empty">Không hiển thị được mục này.</div>'; }
    bindTab(body, v);
    if (S.tab !== 'log') body.scrollTop = top;
  }
  function tabLog(v) {
    let h = (v.scenario ? '<div class="card create-banner"><b>🎬 ' + v.scenario.icon + ' ' + esc(v.scenario.name) + ' · ' + ({ done: '✅ Đã hoàn thành', failed: '❌ Thất bại', progress: '⏳ Đang thực hiện' }[v.scenario.status]) + '</b><span class="p-sub">🎯 ' + esc(v.scenario.goal) + '</span></div>' : '') +
      (v.jail && v.jail.camp ? '<div class="card create-banner" style="border-color:rgba(255,92,92,.5)"><b>🚨 Đang bị giam giữ ở Campuchia · năm thứ ' + v.jail.years + '</b><span class="p-sub">' + (v.jail.kind === 'ransom' ? 'Bọn bắt cóc đòi tiền chuộc. Bạn đã mất hết tiền, chỉ gia đình mới chuộc được.' : 'Bị ép làm việc lừa đảo. Hãy tìm cách báo tin, trốn thoát hoặc chờ được giải cứu.') + '</span></div>' : v.jail ? '<div class="card create-banner" style="border-color:rgba(255,92,92,.5)"><b>⛓️ Đang thụ án: còn ' + v.jail.left + '/' + v.jail.total + ' năm</b><span class="p-sub">Tội danh: ' + esc(v.jail.reason) + '. Mỗi năm trong tù bạn chọn cải tạo, học nghề, đánh nhau hay vượt ngục.</span></div>' : v.wanted ? '<div class="card create-banner" style="border-color:rgba(255,92,92,.5)"><b>🚨 Đang bị truy nã</b><span class="p-sub">Mỗi năm có thể bị nhận ra và bắt lại.</span></div>' : '') +
      (v.path ? '<div class="card path-card"><div class="path-head"><b>' + v.path.icon + ' Con đường: ' + esc(v.path.name) + '</b><small>' + v.path.pct + '%</small></div><div class="meter"><i style="width:' + v.path.pct + '%"></i></div>' +
        '<div class="path-steps">' + v.path.steps.map((x) => '<div class="ps' + (x.done ? ' ok' : x.cur ? ' cur' : '') + '"><span>' + (x.done ? '✅' : x.cur ? '📍' : '⬜') + '</span>' + esc(x.t) + '</div>').join('') + '</div>' +
        '<p class="path-next">👉 ' + esc(v.path.next) + '</p></div>' : '') +
      '<div class="sec-title">Mục tiêu kiếp này <small>' + v.goals.filter((g) => g.done).length + '/' + v.goals.length + '</small></div><div class="chipsel" style="margin-bottom:12px">' + v.goals.map((g) => '<span class="goal' + (g.done ? ' done' : '') + '">' + (g.done ? '✓ ' : '◇ ') + esc(g.text) + '</span>').join('') + '</div>';
    if (v.illnesses.length) h += '<div class="card ills">' + '<div class="sec-mini">🤒 Bệnh đang mắc</div>' + v.illnesses.map((i) =>
      '<div class="ill"><b>' + esc(i.name) + '</b>' + (i.incurable ? '<span class="tag bad">Không thể chữa khỏi</span>' : '') + (i.neglect >= 1 ? '<span class="tag warn">' + i.neglect + ' năm chưa chữa</span>' : '') +
      (i.risk && !i.incurable ? '<div class="p-sub">Bỏ mặc lâu có thể thành: ' + esc(i.risk) + '</div>' : '') + '</div>').join('') +
      '<div class="p-sub">Tab Hoạt động → <b>Đi khám bệnh</b> để điều trị. <b>Khám tổng quát</b> mỗi năm giúp phát hiện sớm ung thư âm thầm.</div></div>';
    h += '<button type="button" class="btn btn-soft btn-sm" id="btnRisk" style="margin-bottom:12px">📊 Rủi ro đời sống của bạn (theo số liệu thực)</button>';
    const logAll = v.log, log = S.logOnly ? logAll.filter((e) => e.tone === 'milestone' || e.tone === 'good' || e.tone === 'bad') : logAll;
    h += '<div class="log-filter" role="group" aria-label="Lọc nhật ký"><button type="button" data-logf="all" class="' + (S.logOnly ? '' : 'on') + '">Tất cả</button><button type="button" data-logf="key" class="' + (S.logOnly ? 'on' : '') + '">Dấu ấn quan trọng</button></div>';
    const groups = [];
    for (let i = log.length - 1; i >= 0; i--) { const e = log[i]; let g = groups[groups.length - 1]; if (!g || g.age !== e.age) { g = { age: e.age, year: e.year, items: [] }; groups.push(g); } g.items.push({ e, i }); }
    const seen = S.seenLog;
    h += groups.slice(0, 60).map((g) => '<div class="log-age">' + g.age + ' tuổi <small>Năm ' + g.year + '</small></div>' + g.items.map(({ e, i }) => '<div class="log-item ' + esc(e.tone) + (i >= seen ? ' new' : '') + '"><span class="li">' + esc(e.icon || '•') + '</span><span>' + esc(e.text) + '</span></div>').join('')).join('');
    S.seenLog = logAll.length;
    return h;
  }
  function tabAct(v) {
    const acts = G().activities();
    if (!acts.length) return '<div class="empty">Chưa có hoạt động nào.</div>';
    const cats = {};
    acts.forEach((a) => (cats[a.categoryLabel] = cats[a.categoryLabel] || []).push(a));
    return Object.keys(cats).map((c) => '<div class="sec-title">' + esc(c) + '</div><div class="grid2">' + cats[c].map((a) =>
      '<button type="button" class="card act" data-act="' + a.id + '"' + (a.input ? ' data-input="' + a.input + '"' : '') + (a.available ? '' : ' disabled') + '><span class="ai">' + a.icon + '</span><span class="an">' + esc(a.label) + '</span><span class="ac' + (a.available ? '' : ' warn') + '">' + esc(a.available ? a.costText : a.reason) + '</span></button>').join('') + '</div>').join('');
  }
  function avatar(p) {
    if (p.kind !== 'human') return '<span class="avatar pet">' + (p.petIcon || (p.kind === 'cat' ? '🐱' : '🐶')) + '</span>';
    const a = p.appearance || {};
    const hair = p.age >= 60 ? U.mixHex(a.hair || '#222', '#dcdcdc', Math.min(1, (p.age - 55) / 25)) : a.hair;
    return '<span class="avatar" style="--skin:' + (a.skin || '#e6b48f') + ';--hair:' + (a.hairStyle === 'bald' ? (a.skin || '#e6b48f') : hair) + ';--top:' + (a.top || '#888') + ';--ring:' + (p.gender === 'f' ? '#ff7eb6' : '#5cc8ff') + '"><span class="eyes"><i></i><i></i></span></span>';
  }
  function tabPeople(v) {
    const order = ['spouse', 'partner', 'lover', 'child', 'grandchild', 'mother', 'father', 'grandparent', 'sibling', 'friend', 'pet', 'ex'];
    const ppl = v.people.slice().sort((a, b) => (b.alive - a.alive) || order.indexOf(a.role) - order.indexOf(b.role));
    const orient = v.orientation ? '<div class="p-sub" style="margin:-4px 2px 10px">' + (v.orientation === 'Dị tính' ? '' : '🏳️‍🌈 ') + 'Xu hướng: <b>' + esc(v.orientation) + '</b>' + (v.orientation !== 'Dị tính' ? (v.lgbtOut ? ' · đã công khai với gia đình' : ' · chưa công khai') : '') + '</div>' : '';
    const pc0 = v.parenting ? '<div class="card" style="display:block;margin-bottom:10px' + (v.disowned ? ';border-color:rgba(255,92,92,.45)' : '') + '"><b>' + v.parenting.icon + ' Kiểu cha mẹ: ' + esc(v.parenting.label) + '</b>' + (v.disowned ? ' <span class="tag bad">Đã từ mặt bạn</span>' : '') + '<div class="p-sub">' + esc(v.parenting.desc) + (v.parentMajor && !v.disowned ? ' Bố mẹ muốn bạn học ngành <b>' + esc(v.parentMajor) + '</b>.' : '') + '</div></div>' : '';
    const pc = pc0 + orient + (v.alive && v.age >= 6 ? '<div class="btnrow" style="margin:0 0 10px"><button type="button" class="btn btn-soft btn-sm" data-petshop>🐾 Nuôi thú cưng</button><button type="button" class="btn btn-soft btn-sm" data-tree>🌳 Gia phả dòng họ</button>' + (v.age >= 10 ? '<button type="button" class="btn btn-soft btn-sm" data-realfr>🌐 Bạn bè người chơi thật</button>' : '') + '</div>' : '');
    if (!ppl.length) return pc + '<div class="empty">Bạn đang một mình. Hãy kết bạn qua các hoạt động nhé.</div>';
    return pc + '<div class="sec-title">Những người thương <small>chạm để tương tác</small></div>' + ppl.map((p) =>
      '<button type="button" class="card person' + (p.alive ? '' : ' dead') + '" data-person="' + p.id + '"' + (p.alive ? '' : ' disabled') + '>' + avatar(p) +
      '<span style="min-width:0"><span class="p-name">' + esc(p.name) + '</span> <span class="p-sub">· ' + esc(p.roleLabel) + ' · ' + p.age + ' tuổi' + (p.alive ? '' : ' · đã mất') + '</span>' + (p.info && p.alive ? '<br><small class="p-sub">' + esc(p.info) + '</small>' : '') +
      '<span class="relbar' + (p.relation < 30 ? ' low' : '') + '"><i style="width:' + p.relation + '%"></i></span></span><span class="p-rel">' + (p.alive ? p.relation + '%' : '🕯️') + '</span></button>').join('');
  }
  function btns(actions, attr) {
    return '<div class="btnrow">' + actions.map((a) => '<button type="button" class="btn btn-soft btn-sm" ' + attr + '="' + a.id + '"' + (a.disabled ? ' disabled title="' + esc(a.reason || '') + '"' : '') + '>' + a.icon + ' ' + esc(a.label) + '</button>').join('') + '</div>';
  }
  function tabCareer(v) {
    const e = v.education;
    let h = '<div class="card">';
    h += '<div class="kv"><span>Hiện tại</span><b>' + esc(e.label) + '</b></div>';
    if (e.inSchool) h += '<div class="kv"><span>Học lực</span><b>' + e.performance + '/100</b></div><div class="meter"><i style="width:' + e.performance + '%"></i></div>';
    if (e.degrees.length) h += '<div class="kv"><span>Bằng cấp</span><b>' + esc(e.degrees.join(', ')) + '</b></div>';
    if (v.age >= 6) h += '<div class="kv"><span>🇬🇧 Tiếng Anh</span><b>' + v.english + '/100</b></div><div class="meter"><i style="width:' + v.english + '%"></i></div><div class="p-sub" style="margin:-2px 0 6px">' + esc(v.englishText) + ' · du lịch nước ngoài cần ≥ 30, làm việc nước ngoài ≥ 55, du học ≥ 60</div>' + (v.abroadText ? '<div class="p-sub">🌏 Đang ở: <b>' + esc(v.abroadText) + '</b></div>' : '');
    if (e.actions.length) h += btns(e.actions, 'data-edu');
    h += '</div>';
    if (v.interests && v.interests.length) h += '<div class="sec-title">Sở thích &amp; thiên hướng <small>từ những trò bạn chọn khi đi chơi</small></div><div class="card">' + v.interests.map((x) => '<div class="kv"><span>' + x.icon + ' ' + esc(x.label) + '</span><b>' + x.pct + '/100</b></div><div class="meter"><i style="width:' + x.pct + '%"></i></div><div class="p-sub" style="margin:-2px 0 8px">Hợp với: ' + esc(x.careers.join(', ').toLowerCase()) + '</div>').join('') + (v.route ? '<div class="p-sub">🧭 Hướng đã chọn: <b>' + esc(v.route) + '</b></div>' : '') + (v.vocTrade ? '<div class="p-sub">🛠️ Trường nghề: <b>' + esc(v.vocTrade) + '</b></div>' : '') + '<div class="p-sub" style="margin-top:6px">Nghề hợp sở thích được cộng điểm khi ứng tuyển.</div></div>';
    if (v.youth) {
      const y = v.youth;
      h += '<div class="sec-title">' + y.icon + ' Lộ trình ' + esc(y.name.toLowerCase()) + ' <small>điểm rèn luyện ' + y.xp + '</small></div><div class="card ys">' +
        y.stages.map((s) => '<div class="ys-step' + (s.cur ? ' cur' : s.passed ? ' ok' : '') + '"><span>' + (s.passed ? '✅' : s.cur ? '📍' : '⬜') + '</span><b>' + esc(s.name) + '</b><small>' + (s.need ? 'từ ' + s.age + ' tuổi · ' + s.need + ' điểm' : 'từ ' + s.age + ' tuổi') + '</small></div>').join('') +
        '<div class="ys-step pro"><span>🏆</span><b>' + esc(y.pro) + '</b></div>' +
        (y.next ? '<div class="p-sub" style="margin-top:6px">🎯 ' + esc(y.next) + '</div>' : '') +
        (y.closed ? '<div class="p-sub">⛔ Đã bị loại hoặc quá tuổi lên bậc tiếp theo.</div>' : y.done ? '<div class="p-sub">Lộ trình ngoại khóa đã khép lại.</div>' : '<div class="p-sub">Mỗi năm tập đều (và chọn Tập gym/Chạy bộ/Đi chơi) để tăng điểm. Lên bậc cao tập nhiều hơn nên học lực giảm dần.</div>') +
        (y.abroad ? '<div class="p-sub">🌍 ' + esc(y.abroad) + '.</div>' : '') + '</div>';
    }
    const pStudy = h; h = '';
    if (v.job) {
      const j = v.job;
      h += '<div class="card"><div class="kv"><span>' + j.icon + ' ' + esc(j.title) + '</span><b>' + esc(j.levelTitle) + '</b></div><div class="kv"><span>Lương</span><b style="color:var(--c-money)">' + esc(j.salaryText) + '</b></div>' + (j.club ? '<div class="kv"><span>🌍 Câu lạc bộ</span><b>' + esc(j.club) + '</b></div>' : '') + (j.rep ? '<div class="kv"><span>🎖️ Danh tiếng nghề</span><b>' + esc(j.rep.title) + ' <small class="p-sub">(' + j.rep.n + ' ca xuất sắc' + (j.rep.next ? ', còn ' + j.rep.next + ' ca lên bậc' : '') + ')</small></b></div>' : '') + '<div class="kv"><span>Thâm niên</span><b>' + j.years + ' năm · cấp ' + (j.level + 1) + '/' + (j.maxLevel + 1) + '</b></div><div class="kv"><span>Hiệu suất</span><b>' + j.performance + '/100</b></div><div class="meter"><i style="width:' + j.performance + '%"></i></div>' +
        (j.incidents && j.incidents.length ? '<div class="incidents"><span class="p-sub">Biến cố trong nghề:</span> ' + j.incidents.map((x) => '<span class="tag">' + esc(x) + '</span>').join('') + '</div>' : '') + btns(j.actions, 'data-job') + '</div>';
    } else if (v.retired) h += '<div class="card">🪴 Bạn đã nghỉ hưu' + (v.pensionText ? ' — lương hưu ' + esc(v.pensionText) : '') + '.</div>';
    else h += '<div class="card p-sub">' + (v.age < 14 ? 'Còn nhỏ lắm, lo học hành vui chơi đã!' : 'Bạn chưa có việc làm. Mở mục 📋 Tìm việc để xem các vị trí đang tuyển.') + '</div>';
    h += leagueHtml();
    h += officeHtml();
    const fm = G().farmView ? G().farmView() : null;
    if (fm) h += '<div class="card"><b>🌾 Ruộng vườn</b><div class="kv"><span>Đang trồng</span><b>' + esc(fm.crop) + ' · ' + fm.area + ' ha</b></div><div class="p-sub">' + esc(fm.desc) + (fm.young ? ' · cây còn non, chưa cho thu hoạch' : '') + '</div>' + (fm.last ? '<div class="kv"><span>Vụ ' + fm.last.year + '</span><b style="color:' + (fm.last.net >= 0 ? 'var(--c-money)' : '#ff6b6b') + '">' + esc(fm.last.weather) + ' · giá ' + fm.last.price + '%</b></div>' : '') + '<div class="p-sub">Mỗi năm được chọn lại cây trồng khi vào vụ mới.</div></div>';
    const xk = G().xkView ? G().xkView() : null;
    if (xk) h += '<div class="card"><b>✈️ Xuất khẩu lao động · ' + esc(xk.country) + '</b><div class="kv"><span>Công việc</span><b>' + esc(xk.word) + (xk.chui ? ' <span class="tag bad">làm chui</span>' : '') + '</b></div><div class="kv"><span>Đã ở</span><b>' + xk.years + ' năm' + (xk.chui ? '' : ' / 3 năm hợp đồng') + '</b></div><div class="kv"><span>Đã dành dụm</span><b style="color:var(--c-money)">' + esc(xk.sentText) + '</b></div>' + (xk.debtText ? '<div class="kv"><span>Nợ phí đi</span><b>' + esc(xk.debtText) + '</b></div>' : '') + (xk.chui ? '<div class="p-sub">⚠️ Làm chui lương cao hơn nhưng mỗi năm có thể bị bắt, trục xuất.</div>' : '') + '<button type="button" class="btn btn-soft btn-sm" data-xkhome>🛬 Về nước</button></div>';
    const pWork = h; h = '';
    const iv = G().insView ? G().insView() : null;
    if (iv) h += '<div class="card"><b>🛡️ Bảo hiểm đang có</b><div class="p-sub">' + esc(iv.list.join(' · ')) + '</div></div>';
    const fv = G().fishView ? G().fishView() : null;
    if (fv) h += '<div class="card"><b>🎣 Bộ sưu tập cá</b><div class="kv"><span>Đã câu</span><b>' + fv.n + ' con · ' + fv.kinds + ' loại</b></div><div class="kv"><span>Con to nhất</span><b>' + esc(fv.best) + '</b></div><div class="p-sub">' + esc(fv.list.join(' · ')) + '</div></div>';
    h += rivalsHtml();
    const pMore = h; h = '';
    const jm = v.age >= 16 && G().jobMarketView ? G().jobMarketView() : [];
    if (jm.length) h += '<div class="card jm"><b>📰 Thị trường việc làm năm nay</b>' + jm.map((x) => '<div class="jm-row ' + x.state + '"><span>' + x.icon + ' ' + esc(x.name) + '</span><small>' + esc(x.label) + '</small></div>').join('') + '</div>';
    const jobs = G().jobListings();
    if (jobs.length) {
      const ok = jobs.filter((j) => j.eligible), no = jobs.filter((j) => !j.eligible);
      h += '<div class="sec-title">Việc làm đang tuyển <small>' + ok.length + ' phù hợp</small></div>';
      h += ok.map(jobRow).join('') || '<div class="empty">Chưa có vị trí phù hợp với bạn lúc này.</div>';
      if (no.length) h += '<details class="more"><summary>Xem ' + no.length + ' nghề khác và điều kiện</summary>' + no.map(jobRow).join('') + '</details>';
    }
    const pJobs = h || '<div class="empty">' + (v.age < 14 ? 'Còn nhỏ lắm, lo học hành vui chơi đã!' : 'Chưa có vị trí nào đang tuyển.') + '</div>';
    const okN = jobs.filter((j) => j.eligible).length;
    const list = (v.age < 18 && !v.job ? [['study', '🎓 Học vấn'], ['work', '💼 Công việc']] : [['work', '💼 Công việc'], ['study', '🎓 Học vấn']]).concat(v.age >= 14 ? [['jobs', '📋 Tìm việc', okN || '']] : []).concat(pMore ? [['more', '🧩 Khác']] : []);
    const st = subtabs('career', list);
    return st.html + { study: pStudy, work: pWork, jobs: pJobs, more: pMore }[st.cur];
    function jobRow(j) {
      const more = '<details class="jobmore"><summary>Nghề này thế nào?</summary>' + (j.desc ? '<p>' + esc(j.desc) + '</p>' : '') +
        '<p><b>Lộ trình:</b> ' + esc(j.path) + '</p>' + (j.notes ? '<p class="p-sub">' + esc(j.notes) + '</p>' : '') +
        (j.incidents.length ? '<p><b>Biến cố có thể gặp:</b></p><div class="incidents">' + j.incidents.map((x) => '<span class="tag">' + esc(x) + '</span>').join('') + '</div>' : '') + '</details>';
      return '<div class="card job' + (j.eligible ? '' : ' no') + '"><span class="ji">' + j.icon + '</span><span style="min-width:0"><span class="jt">' + esc(j.title) + '</span>' + (j.talent ? ' <span class="tag good">Có năng khiếu</span>' : '') + '<br><span class="js">' + esc(j.salaryText) + ' · ' + esc(j.reqText) + '</span>' + (j.eligible ? '' : '<br><span class="jr">' + esc(j.reason) + '</span>') + more + '</span>' + (j.eligible ? '<button type="button" class="btn btn-primary btn-sm" data-apply="' + j.id + '">Ứng tuyển</button>' : '') + '</div>';
    }
  }
  // 🏪 chuỗi chi nhánh + nhượng quyền
  function chainHtml() {
    const ch = G().chainInfo ? G().chainInfo() : null; if (!ch) return '';
    return '<div class="chain"><span class="p-sub">🏪 ' + ch.branches + ' chi nhánh' + (ch.franchise ? ' · 🤝 ' + ch.franchise + ' cửa hàng nhượng quyền (phí ~' + esc(ch.feeText) + '/cửa hàng/năm)' : '') + '</span><div class="btnrow">' +
      '<button type="button" class="btn btn-soft btn-sm" data-chain="branch"' + (ch.canBranch ? '' : ' disabled title="' + esc(ch.why || '') + '"') + '>🏪 Mở chi nhánh (' + esc(ch.branchCostText) + ')</button>' +
      '<button type="button" class="btn btn-soft btn-sm" data-chain="franchise"' + (ch.canFranchise ? '' : ' disabled title="' + esc(ch.frWhy || '') + '"') + '>🤝 Bán nhượng quyền</button></div>' + (ch.frWhy ? '<small class="p-sub">' + esc(ch.frWhy) + '</small>' : '') + '</div>';
  }
  // 🏛️ chuyện cơ quan: uy tín, phe phái
  function officeHtml() {
    const o = G().officeView ? G().officeView() : null; if (!o) return '';
    return '<div class="card"><b>🏛️ Chuyện cơ quan</b><div class="kv"><span>🗳️ Uy tín (tín nhiệm)</span><b>' + o.tin + '/100</b></div><div class="meter"><i style="width:' + o.tin + '%"></i></div>' +
      '<div class="kv"><span>🤝 Phe</span><b>' + (o.phe ? 'người của ' + esc(o.phe) : 'trung lập') + (o.winner ? ' · ' + esc(o.winner) + ' đã lên giám đốc' : '') + '</b></div>' + (o.moved ? '<div class="p-sub">🎒 Từng bị luân chuyển công tác vùng sâu (được cộng điểm khi xét bổ nhiệm).</div>' : '') + (o.bribes ? '<div class="p-sub">✉️ Đã nhận ' + o.bribes + ' phong bì — càng nhận càng dễ bị thanh tra.</div>' : '') +
      '<div class="p-sub">Uy tín cao, làm việc tốt và theo đúng phe thì dễ đỗ phiếu tín nhiệm để lên chức.</div></div>';
  }
  // ⚽ mùa giải của cầu thủ: bảng xếp hạng + tự ra sân đá thật (Hax)
  function leagueHtml() {
    const lg = G().leagueView ? G().leagueView() : null; if (!lg) return '';
    return '<div class="card league"><div class="lg-head"><b>⚽ ' + esc(lg.name) + '</b><small>Vòng ' + lg.round + '/' + lg.rounds + ' · ' + esc(lg.club) + ' đứng thứ ' + lg.rank + '</small></div>' +
      '<table class="lg-tab"><thead><tr><th>#</th><th>Đội</th><th>Tr</th><th>T-H-B</th><th>HS</th><th>Đ</th></tr></thead><tbody>' + lg.table.map((t) => '<tr' + (t.me ? ' class="me"' : '') + '><td>' + t.pos + '</td><td>' + esc(t.name) + '</td><td>' + t.p + '</td><td>' + t.w + '-' + t.d + '-' + t.l + '</td><td>' + (t.gd > 0 ? '+' : '') + t.gd + '</td><td><b>' + t.pts + '</b></td></tr>').join('') + '</tbody></table>' +
      '<div class="kv"><span>👟 Bàn thắng của bạn</span><b>' + lg.goals + ' bàn / ' + lg.apps + ' trận</b></div>' + (lg.contract ? '<div class="kv"><span>📝 Hợp đồng</span><b>lương ×' + String(lg.contract).replace('.', ',') + '</b></div>' : '') +
      (lg.log.length ? '<div class="lg-log">' + lg.log.map((x) => '<div>' + esc(x) + '</div>').join('') + '</div>' : '') +
      (lg.haxLeft ? '<button type="button" class="btn btn-primary btn-sm" data-league>⚽ Ra sân vòng ' + (lg.round + 1) + ' (đá thật · còn ' + lg.haxLeft + ' lượt năm nay)</button>' : '<div class="p-sub">' + (lg.round >= lg.rounds ? 'Mùa giải đã kết thúc.' : 'Các vòng còn lại được tính theo phong độ khi qua năm.') + '</div>') +
      (lg.hist.length ? '<details class="more"><summary>Các mùa trước</summary>' + lg.hist.map((x) => '<div class="p-sub">' + x.year + ' · ' + esc(x.club) + ' (' + esc(x.league) + '): hạng ' + x.rank + ', ' + x.goals + ' bàn' + (x.rank === 1 ? ' 🏆' : '') + '</div>').join('') + '</details>' : '') + '</div>';
  }
  // ra sân một vòng: mở trận Hax rồi ghi kết quả vào bảng xếp hạng
  async function doLeague() {
    if (S.busy || S.mode !== 'play' || !KN.Hax) return;
    unlockAudio();
    const nx = safe(() => G().leagueNext());
    if (!nx) return;
    if (nx.ok === false) { toast('Chưa được đâu', nx.reason || '', '⛔', 'err'); sfx('fail'); return; }
    S.busy = true; setAgeBtn();
    try {
      const r = await KN.Hax.playCareer({ title: nx.title, need: nx.need, dur: 60, foe: nx.foe, map: nx.map, size: nx.size, skills: nx.skills });
      const res = safe(() => G().leagueResult(r && r.gf != null ? r.gf : 0, r && r.ga != null ? r.ga : 3, r && r.myGoals));
      render();
      if (res && res.ok !== false) await presentResult(res);
      await runPending();
    } finally { S.busy = false; setAgeBtn(); render(); }
  }
  // kình địch nổi tiếng: tỷ số đối đầu suốt đời
  function rivalsHtml() {
    const rv = G().rivalsView ? G().rivalsView() : [];
    return rv.length ? '<div class="card rivals"><b>⚔️ Kình địch</b>' + rv.map((r) => '<div class="rv-row"><span>' + r.icon + ' ' + esc(r.arena) + ': <b>' + esc(r.nick) + '</b></span><span class="rv-score' + (r.me > r.them ? ' up' : r.me < r.them ? ' down' : '') + '">Bạn ' + r.me + ' – ' + r.them + '</span></div>').join('') + '</div>' : '';
  }
  function tabSocial() {
    const s = G().socialView();
    if (!s.open) return '<div class="empty">📱 Mạng xã hội<br><small>' + esc(s.reason || '') + '</small></div>';
    const v0 = G().view();
    let h = '<div class="soc-head"><div class="soc-av">' + esc((v0.name || '?').trim().split(' ').pop().charAt(0)) + '</div><div class="soc-id"><b>' + esc(v0.name || '') + (s.verified ? ' <span class="soc-tick" title="Đã xác minh">✔</span>' : '') + '</b><small>' + esc(s.rank) + (s.niche ? ' · ' + s.niche.icon + ' ' + esc(s.niche.name) : '') + '</small>' +
      '<small>' + (s.income ? '💸 Quảng cáo năm qua: ' + esc(s.income) + ' · ' : '') + (s.brand ? '🏷️ ' + esc(s.brand) + ' · ' : '') + (s.scandals ? '🔥 ' + s.scandals + ' phốt · ' : '') + 'Còn ' + s.postsLeft + ' lượt đăng</small></div><div class="soc-f"><div class="big">' + esc(s.followersText) + '</div><small>theo dõi</small></div></div>';
    if (s.canVerify) h += '<button type="button" class="btn btn-soft btn-sm soc-verify" data-verify>✔ Xin tích xanh (đủ 100K theo dõi)</button>';
    const pHead = h; h = '';
    const nicheGrid = '<div class="soc-niches">' + s.niches.map((n) => '<button type="button" class="soc-niche' + (s.niche && s.niche.id === n.id ? ' on' : '') + '" data-niche="' + n.id + '"><span>' + n.icon + '</span><b>' + esc(n.name) + '</b><small>' + esc(n.desc) + '</small>' + (n.fit ? '<em>Hợp nghề của bạn</em>' : '') + '</button>').join('') + '</div>';
    if (!s.niche) h += '<div class="sec-title">Chọn kênh chủ đề <small>nội dung đúng thế mạnh (chỉ số, nghề) sẽ lên nhanh hơn</small></div>' + nicheGrid;
    else h += '<details class="jobmore"><summary>Đổi hướng kênh (mất ~20% người theo dõi)</summary>' + nicheGrid + '</details>';
    h += '<button type="button" class="card act fd-open" data-feed><span class="ai">📱</span><span class="an">Lướt MXH <small>xem bạn bè, KOL đăng gì · không tốn lượt đăng</small></span><span class="ac">Lướt</span></button>';
    h += '<div class="sec-title">Đăng nội dung</div><div class="grid2">' + s.actions.map((a) => '<button type="button" class="card act" data-soc="' + a.id + '"' + (a.available ? '' : ' disabled') + '><span class="ai">' + a.icon + '</span><span class="an">' + esc(a.label) + '</span><span class="ac' + (a.available ? '' : ' warn') + '">' + esc(a.available ? 'Đăng' : a.reason) + '</span></button>').join('') + '</div>';
    const pPost0 = h; h = '';
    if (s.inbox.length) h += '<div class="sec-title">📩 Hộp thư <small>' + s.inbox.length + ' tin chưa đọc</small></div>' + s.inbox.map((m) => '<div class="card dm ' + m.kind + '"><div class="dm-top"><span class="ai">' + m.icon + '</span><b>' + esc(m.from) + '</b></div><div class="dm-text">' + esc(m.text) + '</div><div class="btnrow">' + m.a.map((l, i) => '<button type="button" class="btn ' + (i ? 'btn-ghost' : 'btn-soft') + ' btn-sm" data-dm="' + m.id + '" data-ans="' + i + '">' + esc(l) + '</button>').join('') + '</div></div>').join('');
    const pInbox = h; h = '';
    // app hẹn hò
    const dv = G().datingView ? G().datingView() : { open: false };
    if (dv.open) {
      h += '<div class="sec-title">💘 App hẹn hò <small>còn ' + dv.swipesLeft + ' lượt quẹt năm nay</small></div>';
      if (dv.sneak) h += '<div class="card p-sub">🤫 Bạn đang có đôi — hẹn thành công sẽ thành <b>người tình bí mật</b>. Cẩn thận bị phát hiện!</div>';
      if (dv.deck.length) h += '<div class="tn-wrap"><div class="tn-stack" id="tnStack">' + dv.deck.slice(0, 3).map((p, i) => tnCard(p, i)).reverse().join('') + '</div><div class="tn-btns"><button type="button" class="tn-b no" data-tn="0" aria-label="Bỏ qua">✖</button><button type="button" class="tn-b yes" data-tn="1" aria-label="Thích">💚</button></div><p class="p-sub tn-hint">Kéo thẻ sang phải để thích, sang trái để bỏ qua · hoặc phím ← →</p><div class="tn-match" id="tnMatch" hidden></div></div>';
      else h += '<div class="card p-sub">Hết hồ sơ năm nay. Sang năm quay lại nhé!</div>';
      if (dv.matches.length) h += '<div class="date-matches">' + dv.matches.map((m) => '<div class="card dm-match"><span>' + m.icon + ' <b>' + esc(m.name) + '</b>, ' + m.age + ' · ' + esc(m.job) + '</span>' + (m.dated ? '<small class="p-sub">✓ đã hẹn</small>' : '<span class="btnrow"><button type="button" class="btn btn-soft btn-sm" data-date="' + m.id + '" data-op="0">😂 Mở lời hài</button><button type="button" class="btn btn-soft btn-sm" data-date="' + m.id + '" data-op="1">💬 Chân thành</button><button type="button" class="btn btn-soft btn-sm" data-date="' + m.id + '" data-op="2">😏 Thả thính</button></span>') + '</div>').join('') + '</div>';
    }
    // hội nhóm
    const gv = G().groupsView ? G().groupsView() : [];
    if (gv.length) h += '<details class="jobmore"><summary>👥 Hội nhóm (' + gv.filter((g) => g.joined).length + '/3 đang tham gia)</summary><div class="grp-list">' + gv.map((g) => '<div class="grp' + (g.joined ? ' on' : '') + '"><span class="ai">' + g.icon + '</span><span class="grp-t"><b>' + esc(g.name) + '</b>' + (g.admin ? ' <span class="tag good">👑 admin</span>' : '') + '<small>' + esc(g.desc) + '</small></span><span class="btnrow"><button type="button" class="btn btn-soft btn-sm" data-grp="' + g.id + '">' + (g.joined ? 'Rời' : 'Tham gia') + '</button>' + (!g.admin && s.followers >= 5000 ? '<button type="button" class="btn btn-ghost btn-sm" data-grpnew="' + g.id + '">Lập hội</button>' : '') + '</span></div>').join('') + '</div></details>';
    const pDate = h; h = '';
    if (s.posts.length) h += '<div class="sec-title">Bài đăng gần đây</div><div class="soc-posts">' + s.posts.map((p) => '<div class="soc-post' + (p.viral ? ' viral' : '') + (p.flop ? ' flop' : '') + '"><span class="ai">' + p.icon + '</span><span class="sp-t"><b>' + esc(p.title) + '</b><small>👁 ' + esc(p.views) + ' · ❤️ ' + esc(p.likes) + ' · ' + esc(p.when) + '</small></span>' + (p.viral ? '<span class="tag good">VIRAL</span>' : p.flop ? '<span class="tag">flop</span>' : '') + '</div>').join('') + '</div>';
    const pPosts = h; h = '';
    if (s.board) h += '<details class="jobmore"><summary>🏅 Bảng xếp hạng KOL · bạn đứng thứ ' + s.board.pos + '</summary><div class="soc-board">' + s.board.top.map((r) => '<div class="sb-row' + (r.me ? ' me' : '') + '"><span>#' + r.rank + '</span><b>' + esc(r.name) + '</b><small>' + esc(r.f) + '</small></div>').join('') + (s.board.pos > 8 ? '<div class="sb-row me"><span>#' + s.board.pos + '</span><b>Bạn</b><small>' + esc(s.followersText) + '</small></div>' : '') + '</div></details>';
    const pBoard = h; h = '';
    if (s.offers.length) h += '<div class="sec-title">Lời mời quảng cáo <small>nhận sản phẩm bẩn là có ngày bị bóc phốt</small></div>' + s.offers.map((o) => '<div class="card job"><span class="ji">🤝</span><span style="min-width:0"><span class="jt">' + esc(o.brand) + '</span><br><span class="js">Quảng cáo ' + esc(o.item) + ' · ' + esc(o.payText) + '</span></span><span class="btnrow" style="flex-direction:column;gap:6px"><button type="button" class="btn btn-primary btn-sm" data-offer="' + o.id + '" data-ok="1">Nhận</button><button type="button" class="btn btn-ghost btn-sm" data-offer="' + o.id + '">Từ chối</button></span></div>').join('');
    const pOffers = h; h = '';
    h += '<div class="sec-title">Bình luận mới</div>';
    h += s.feed.length ? s.feed.map((c) => '<div class="card cmt ' + c.kind + '"><div><b>@' + esc(c.user) + '</b> <span class="p-sub">' + ({ fan: '💖 fan', hater: '😠 anti-fan', troll: '🤡', friend: '👋 bạn bè', giangho: '🥊 giang hồ mạng' }[c.kind]) + ' · ' + c.likes + ' thích</span></div><div>' + esc(c.text) + '</div>' +
      (c.replied ? (c.myReply ? '<div class="cmt-my">↳ <b>Bạn:</b> ' + esc(c.myReply) + '</div>' : '<div class="p-sub">✓ Đã trả lời</div>') : '<div class="cmt-write"><input data-cmtin="' + c.id + '" maxlength="120" placeholder="✍️ Tự viết câu trả lời…" autocomplete="off"><button type="button" class="btn btn-primary btn-sm" data-cmtsend="' + c.id + '">Gửi</button></div><div class="btnrow"><button type="button" class="btn btn-soft btn-sm" data-reply="' + c.id + '" data-mode="kind">💗 Tử tế</button><button type="button" class="btn btn-soft btn-sm" data-reply="' + c.id + '" data-mode="funny">😂 Hài hước</button><button type="button" class="btn btn-soft btn-sm" data-reply="' + c.id + '" data-mode="harsh">😤 Đáp trả</button></div>') + '</div>').join('') : '<div class="empty">Chưa có bình luận. Đăng gì đó đi!</div>';
    const unread = s.inbox.length + s.feed.filter((c) => !c.replied).length, rank = pBoard + rivalsHtml();
    const st = subtabs('social', [['post', '📝 Đăng bài', s.postsLeft || ''], ['inter', '💬 Tương tác', unread || '']].concat(pDate ? [['date', '💘 Hẹn hò']] : []).concat(rank ? [['rank', '🏅 Xếp hạng']] : []));
    return pHead + st.html + { post: pPost0 + pOffers, inter: pInbox + h + pPosts, date: pDate, rank }[st.cur];
  }
  // ---- app hẹn hò kiểu quẹt: kéo thẻ sang phải để thích, sang trái để bỏ qua
  const TN_GRAD = ['#ff9a9e,#fad0c4', '#a18cd1,#fbc2eb', '#84fab0,#8fd3f4', '#fccb90,#d57eeb', '#a1c4fd,#c2e9fb', '#ffecd2,#fcb69f'];
  function tnCard(p, i) {
    const g = TN_GRAD[(p.name.length * 7 + p.age) % TN_GRAD.length];
    return '<div class="tn-card" data-id="' + p.id + '" style="--g:linear-gradient(160deg,' + g + ');z-index:' + (10 - i) + ';transform:scale(' + (1 - i * 0.05) + ') translateY(' + i * 12 + 'px)"><div class="tn-photo"><span>' + p.icon + '</span><i class="tn-stamp like">THÍCH</i><i class="tn-stamp nope">BỎ QUA</i></div>' +
      '<div class="tn-info"><b>' + esc(p.name) + ', ' + p.age + '</b>' + (p.hot ? ' <em>🔥 hot</em>' : '') + '<small>💼 ' + esc(p.job) + ' · 📍 cách bạn ' + p.km + ' km</small><p>“' + esc(p.bio) + '”</p></div></div>';
  }
  function bindSwipe(stack) {
    let busy = false, drag = null;
    const top = () => stack.querySelector('.tn-card:last-child');
    const stamps = (c, dx) => { const k = Math.min(1, Math.abs(dx) / 90); c.querySelector('.like').style.opacity = dx > 0 ? k : 0; c.querySelector('.nope').style.opacity = dx < 0 ? k : 0; };
    const fly = (like) => {
      const c = top(); if (!c || busy) return; busy = true; drag = null;
      c.style.transition = 'transform .32s ease, opacity .32s'; c.style.transform = 'translateX(' + (like ? 560 : -560) + 'px) rotate(' + (like ? 26 : -26) + 'deg)'; c.style.opacity = '0'; stamps(c, like ? 99 : -99); sfx('click');
      const id = c.dataset.id;
      setTimeout(() => {
        const r = safe(() => G().datingSwipe(id, like));
        if (r && r.ok !== false) {
          if (r.match) { sfx('good'); const m = document.getElementById('tnMatch'); if (m) { m.hidden = false; m.innerHTML = '<div><span>💘</span><b>It’s a match!</b><small>' + esc(r.text.replace(/^It’s a match! 💘 /, '')) + '</small></div>'; } setTimeout(() => render(), 1500); }
          else render();
        } else { if (r) toast('Chưa được', r.reason, '⛔', 'err'); busy = false; render(); }
      }, 300);
    };
    stack.addEventListener('selectstart', (e) => e.preventDefault()); stack.addEventListener('dragstart', (e) => e.preventDefault());
    stack.addEventListener('pointerdown', (e) => { const c = top(); if (busy || !c || !c.contains(e.target)) return; e.preventDefault(); try { const sel = window.getSelection(); if (sel) sel.removeAllRanges(); } catch (x) { /* */ } drag = { x: e.clientX, id: e.pointerId, dx: 0 }; c.style.transition = 'none'; try { stack.setPointerCapture(e.pointerId); } catch (x) { /* */ } });
    stack.addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; const c = top(); drag.dx = e.clientX - drag.x; c.style.transform = 'translateX(' + drag.dx + 'px) rotate(' + drag.dx / 18 + 'deg)'; stamps(c, drag.dx); });
    const up = (e) => { if (!drag || e.pointerId !== drag.id) return; const dx = drag.dx, c = top(); drag = null; if (Math.abs(dx) > 90) fly(dx > 0); else if (c) { c.style.transition = 'transform .25s'; c.style.transform = ''; stamps(c, 0); c.style.transform = 'scale(1)'; } };
    stack.addEventListener('pointerup', up); stack.addEventListener('pointercancel', up);
    stack.parentNode.querySelectorAll('[data-tn]').forEach((b) => (b.onclick = () => fly(b.dataset.tn === '1')));
  }
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('tnStack') || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const b = document.querySelector('.tn-b.' + (e.key === 'ArrowRight' ? 'yes' : 'no')); if (b) { e.preventDefault(); b.click(); } }
  });
  // tab con trong một tab lớn (ví dụ Tài sản → Tổng quan / Mua sắm / Nhà / Kinh doanh): nhớ tab con đang mở
  const SUB = (() => { try { return JSON.parse(localStorage.getItem('kn_subtabs') || '{}'); } catch (e) { return {}; } })();
  function subtabs(tab, list) {
    const cur = list.some((x) => x[0] === SUB[tab]) ? SUB[tab] : list[0][0];
    return { cur, html: '<div class="subtabs" role="tablist">' + list.map(([id, l, badge]) => '<button type="button" role="tab" class="subtab' + (id === cur ? ' on' : '') + '" data-sub="' + tab + ':' + id + '" aria-selected="' + (id === cur) + '">' + l + (badge ? '<i>' + esc(String(badge)) + '</i>' : '') + '</button>').join('') + '</div>' };
  }
  function setSub(tab, id) { SUB[tab] = id; try { localStorage.setItem('kn_subtabs', JSON.stringify(SUB)); } catch (e) { /* */ } }
  function tabMoney(v) {
    const adult = v.age >= 18 && v.alive;
    // đầu trang: luôn thấy số dư và tổng tài sản
    const head = '<div class="bank"><div><small>Tài khoản</small><div class="big' + (v.money < 0 ? ' neg' : '') + '">' + esc(v.moneyText) + '</div></div><small>' + (v.assets.length ? 'Tài sản: ' + esc(D.fmtMoney(v.assets.reduce((s, a) => s + a.value, 0))) + '<br>Đẳng cấp: <b>' + esc(v.prestigeRank) + '</b> (' + v.prestige + ')' : 'Chưa có tài sản') + '</small></div>';
    // --- 📊 tổng quan: thị trường, nợ, tài sản đang có, mức sống
    let ov = '';
    if (v.market && v.age >= 16) ov += '<div class="card market"><b>' + v.market.icon + ' Thị trường: ' + esc(v.market.label) + '</b><span class="p-sub">Giá nhà đất ' + (v.market.re >= 0 ? '+' : '') + v.market.re + '% · chứng khoán ' + (v.market.st >= 0 ? '+' : '') + v.market.st + '% so với năm 2026</span></div>';
    if (v.loans && v.loans.length) ov += v.loans.map((l) => '<div class="card market' + (v.loanLate ? ' late' : '') + '"><b>🏦 Vay mua ' + esc(l.name) + '</b><span class="p-sub">Còn nợ ' + esc(l.leftText) + ' · góp ' + esc(l.payText) + '/năm · còn ' + l.years + ' năm' + (v.loanLate ? ' · ⚠️ đang chậm trả, thêm một năm nữa là bị siết nhà!' : '') + '</span></div>').join('');
    if (v.assets.length) ov += '<div class="sec-title">Tài sản của bạn <small>' + (v.assetJoy ? '+' + String(v.assetJoy).replace('.', ',') + ' hạnh phúc/năm' : '') + '</small></div>' + v.assets.map((a) => '<div class="card asset"><span class="ai">' + a.icon + '</span><span style="min-width:0"><b>' + esc(a.name) + '</b>' + (a.rented ? ' <span class="tag good">Đang cho thuê ' + esc(a.rentText) + '</span>' : '') + '<br><span class="p-sub">Giá trị ' + esc(a.valueText) + '</span>' + (a.perkText && !a.rented ? '<br><span class="aperk">' + esc(a.perkText) + '</span>' : '') + '</span><span class="btnrow" style="flex-direction:column;gap:6px">' +
      (a.canRent ? '<button type="button" class="btn btn-soft btn-sm" data-rent="' + a.id + '">' + (a.rented ? 'Thôi cho thuê' : 'Cho thuê ' + esc(a.rentText)) + '</button>' : '') + '<button type="button" class="btn btn-soft btn-sm" data-sell="' + a.id + '">Bán</button></span></div>').join('');
    else ov += '<div class="empty">Bạn chưa có tài sản nào. Ghé mục 🛒 Mua sắm nhé.</div>';
    if (adult) ov += '<div class="sec-title">Mức sống <small>chi tiêu và hạnh phúc mỗi năm</small></div><div class="lifestyle">' + v.lifestyles.map((l) => '<button type="button" class="ls" data-ls="' + l.id + '" aria-pressed="' + (v.lifestyle === l.id) + '"><span class="li">' + l.icon + '</span><b>' + esc(l.label) + '</b><small>' + esc(l.desc) + '</small></button>').join('') + '</div>';
    // --- 🛒 mua sắm: lọc theo loại
    const items = G().shopItems();
    const groups = [['phone', '📱 Điện thoại'], ['motorbike', '🛵 Xe máy'], ['car', '🚗 Ô tô'], ['house', '🏠 Nhà'], ['land', '🌾 Đất'], ['gold', '🪙 Vàng'], ['luxury', '💎 Xa xỉ'], ['tech', '💻 Công nghệ'], ['hobby', '🎸 Sở thích'], ['study', '📚 Học tập/IELTS'], ['invest', '📈 Đầu tư'], ['once', '🎁 Dùng một lần']].filter(([t2]) => items.some((i) => i.type === t2));
    let shop = '';
    if (!items.length) shop = '<div class="empty">Lớn thêm chút nữa mới tự mua sắm được nhé.</div>';
    else {
      const g = subtabs('shop', groups);
      shop = g.html.replace('class="subtabs"', 'class="subtabs chips"') + items.filter((i) => i.type === g.cur).map((i) => '<div class="card item"><span class="ai">' + i.icon + '</span><span style="min-width:0"><span class="in">' + esc(i.name) + '</span><br><span class="id">' + esc(i.desc) + '</span>' + (i.perkText ? '<br><span class="aperk">' + esc(i.perkText) + '</span>' : '') + '</span><span style="text-align:right"><span class="price">' + esc(i.priceText) + '</span><br>' +
        (i.owned ? '<span class="p-sub">Đã có</span>' : i.loanable ? '<button type="button" class="btn btn-soft btn-sm" data-loan="' + i.id + '" title="' + esc(i.loanText) + '">🏦 Vay mua</button>' : '<button type="button" class="btn btn-primary btn-sm" data-buy="' + i.id + '"' + (i.affordable ? '' : ' disabled title="' + esc(i.reason || '') + '"') + '>Mua' + (i.once ? ' <small>(còn ' + i.left + ')</small>' : '') + '</button>') + (i.loanable ? '<br><small class="p-sub">' + esc(i.loanText) + '</small>' : '') + '</span></div>').join('');
    }
    // --- 🏠 nhà: trang trí 3D + đồ hiện trong cảnh Nhà
    let home = '';
    if (v.alive && v.age >= 16 && KN.Decor) { const dv = G().decorView(); home += '<div class="card market"><b>🛋️ Trang trí ' + (dv.home ? 'nhà riêng' : 'phòng trọ') + ' 3D</b><span class="p-sub">' + dv.items.length + ' món đồ · tiện nghi ' + dv.comfort + (dv.joy ? ' (+' + String(dv.joy).replace('.', ',') + ' hạnh phúc/năm)' : '') + '</span><button type="button" class="btn btn-primary btn-sm" data-decor>🛋️ Mở chế độ trang trí 3D</button></div>'; }
    if (adult) { const fv = G().furnitureView(); home += '<div class="sec-title">Đồ dùng trong nhà <small>hiện trong cảnh “Nhà”, cộng hạnh phúc mỗi năm</small></div><div class="furn">' + fv.map((s) => '<div class="furn-slot"><b>' + esc(s.label) + '</b><div class="furn-items">' + s.items.map((i) => '<button type="button" class="furn-it' + (i.owned ? ' on' : '') + '" data-furn="' + i.id + '"' + (i.ok ? '' : ' disabled') + ' title="' + esc(i.reason || '') + '"><span>' + i.icon + '</span>' + esc(i.name) + '<small>' + (i.owned ? '✓ đang dùng' : esc(i.priceText)) + '</small></button>').join('') + '</div></div>').join('') + '</div>'; }
    if (!home) home = '<div class="empty">Lớn thêm chút nữa mới có nhà riêng để trang trí nhé.</div>';
    // --- 💼 kinh doanh & vay
    let biz = '';
    if (v.company) biz += '<div class="card company"><span class="ai">' + v.company.icon + '</span><span style="min-width:0"><b>' + esc(v.company.name) + '</b> <span class="tag">' + esc(v.company.level) + '</span>' + (v.company.listed ? ' <span class="tag good">Đã niêm yết</span>' : '') + '<br><span class="p-sub">' + esc(v.company.ind) + ' · ' + v.company.staff + ' nhân viên · ' + v.company.years + ' năm tuổi</span><br><span class="p-sub">Định giá <b>' + esc(v.company.valueText) + '</b> · bạn nắm ' + esc(v.company.ownText) + ' (' + esc(v.company.stakeText) + ') · cổ tức năm qua ' + esc(v.company.profitText) + '</span><br><small class="p-sub">Cuối năm bạn sẽ ra quyết định: mở rộng, gọi vốn, niêm yết hay bán công ty. Khi qua đời, công ty truyền lại cho con.</small>' + chainHtml() + '</span></div>';
    else if (adult) biz += '<div class="card company"><span class="ai">🏢</span><span style="min-width:0"><b>Tự làm chủ</b><br><span class="p-sub">Mở công ty riêng từ quán nhỏ tới tập đoàn niêm yết. Mỗi năm một quyết định kinh doanh, có thể lãi lớn hoặc phá sản.</span></span><button type="button" class="btn btn-primary btn-sm" data-cofound>Thành lập</button></div>';
    if (adult) {
      const bl = G().blackLoanView(), hv = G().huiView();
      biz += '<div class="sec-title">Vay mượn & góp vốn <small>tiền nhanh thì rủi ro cao</small></div>';
      biz += '<div class="card company tdd"><span class="ai">📲</span><span style="min-width:0"><b>Vay nóng qua app</b>' + (bl.debt ? ' <span class="tag bad">Đang nợ ' + esc(bl.debtText) + '</span>' : '') + '<br><span class="p-sub">Giải ngân 5 phút, không thế chấp. Bị trừ 20% phí ngay, nợ nhân ~1,6 lần mỗi năm; không trả là bị khủng bố danh bạ, sơn cửa.</span><div class="btnrow" style="margin-top:6px">' + (bl.can ? bl.amounts.map((a) => '<button type="button" class="btn btn-soft btn-sm" data-tdd="' + a.v + '">Vay ' + esc(a.text) + '</button>').join('') : '') + (bl.debt ? '<button type="button" class="btn btn-primary btn-sm" data-tddpay>Tất toán ' + esc(bl.debtText) + '</button>' : '') + '</div></span></div>';
      if (hv.open) biz += '<div class="card company"><span class="ai">🧧</span><span style="min-width:0"><b>Chơi hụi với hàng xóm</b>' + (hv.h ? ' <span class="tag">Đang chơi · ' + esc(hv.h.per) + '/tháng</span>' : '') + '<br><span class="p-sub">' + (hv.h ? 'Chủ hụi: ' + esc(hv.h.host) + ' · đã góp ' + esc(hv.h.paid) + ' · còn ' + hv.h.years + ' năm. ' + (hv.h.taken ? 'Bạn đã hốt hụi, giờ góp phần hụi chết.' : 'Hốt sớm được ' + esc(hv.h.potEarly) + ', chờ cuối được ' + esc(hv.h.potEnd) + '.') : 'Góp tiền hằng tháng trong 2 năm. Cần gấp thì hốt sớm (chịu lãi), chờ cuối thì có lời — trừ khi chủ hụi ôm tiền bỏ trốn.') + '</span><div class="btnrow" style="margin-top:6px">' + (hv.h ? (hv.h.taken ? '' : '<button type="button" class="btn btn-primary btn-sm" data-huitake>Hốt hụi ngay</button>') : hv.levels.map((l) => '<button type="button" class="btn btn-soft btn-sm" data-hui="' + l.v + '">Góp ' + esc(l.text) + '</button>').join('')) + '</div></span></div>';
    }
    if (!biz) biz = '<div class="empty">Đủ 18 tuổi mới được làm chủ, vay mượn hay chơi hụi.</div>';
    const st = subtabs('money', [['ov', '📊 Tổng quan'], ['shop', '🛒 Mua sắm'], ['home', '🏠 Nhà'], ['biz', '💼 Làm ăn']]);
    return head + st.html + { ov, shop, home, biz }[st.cur];
  }  // ------------------------------------------------------------------ luân hồi: kiếp làm con vật (nghiệp nặng) rồi mới được làm người
  const ANIMAL_LIFE = {
    cho: { name: 'chó', icon: '🐕', steps: [
      ['Bạn đầu thai thành một chú chó con lông vàng ở góc chợ. Bà bán phở ném cho bạn một khúc xương.', [['Vẫy đuôi cảm ơn, nằm canh quán cho bà', 2], ['Giật luôn cả rổ thịt rồi chạy', -1]]],
      ['Đêm khuya, một tên trộm lẻn vào nhà bà bán phở.', [['Sủa thật to, cắn gấu quần hắn', 2], ['Rúc vào góc, giả vờ ngủ', 0]]],
      ['Bạn đã già, chân yếu. Bà cụ cũng già như bạn, chiều nào cũng ngồi trước hiên.', [['Nằm cạnh bà đến hơi thở cuối', 1], ['Bỏ đi lang thang', 0]]],
    ] },
    trau: { name: 'trâu', icon: '🐃', steps: [
      ['Bạn đầu thai thành một chú nghé ở làng quê. Thằng bé chăn trâu cưỡi trên lưng bạn thổi sáo.', [['Đi chậm cho nó khỏi ngã', 2], ['Hất nó xuống ruộng', -1]]],
      ['Mùa cày. Ruộng sâu, cái cày nặng trĩu, chủ nhà thì nghèo.', [['Cày miệt mài đến tối', 2], ['Nằm lì giữa ruộng', 0]]],
      ['Lũ về, nước dâng ngập chuồng.', [['Bơi chở thằng bé ra gò cao', 2], ['Tự bơi thoát một mình', 0]]],
    ] },
    ga: { name: 'gà', icon: '🐓', steps: [
      ['Bạn đầu thai thành một con gà trống trong trang trại.', [['Gáy đúng giờ đánh thức cả xóm', 1], ['Mổ nhau tranh giành với đàn gà', -1]]],
      ['Diều hâu lượn trên đầu, đàn gà con hoảng loạn.', [['Xù lông đứng chắn che đàn con', 2], ['Chạy trốn trước tiên', 0]]],
      ['Ngày giỗ ông chủ, cả nhà nhìn bạn đầy ẩn ý…', [['Thanh thản lên mâm cúng, xong một kiếp', 1], ['Bay lên mái nhà trốn', 0]]],
    ] },
  };
  function openAnimalLife(rb) {
    const A = ANIMAL_LIFE[rb.animal] || ANIMAL_LIFE.cho;
    let i = 0, pts = 0;
    const step = () => {
      if (i >= A.steps.length) {
        const tier = pts >= 4 ? 'cophuc' : pts >= 2 ? 'binhthuong' : 'nghiepnhe';
        const R = { cophuc: '🍀 Có phúc', binhthuong: '⚖️ Bình thường', nghiepnhe: '🌧️ Nghiệp nhẹ' }[tier];
        openModal('<h3>' + A.icon + ' Hết một kiếp ' + A.name + '</h3><p class="sub">Một kiếp ngắn ngủi khép lại. ' + (pts >= 4 ? 'Bạn đã sống trọn nghĩa, nghiệp cũ được rửa sạch.' : pts >= 2 ? 'Nghiệp cũ đã vơi đi phần nào.' : 'Nghiệp cũ vẫn còn đeo đẳng.') + '</p><p class="mini-goal">Kiếp người tiếp theo: <b>' + R + '</b></p><div class="btnrow" style="justify-content:flex-end"><button type="button" class="btn btn-primary" id="anDone">👶 Đầu thai làm người</button></div>');
        $('#anDone').onclick = () => { closeModal(); sfx('birth'); openCreator({ rebirth: Object.assign({}, rb, { tier, animal: rb.animal, icon: R.split(' ')[0], label: R.split(' ').slice(1).join(' '), desc: 'Sau một kiếp làm ' + A.name + ' để trả nghiệp, bạn được làm người trở lại.' }) }); };
        return;
      }
      const [text, opts] = A.steps[i];
      openModal('<h3>' + A.icon + ' Kiếp ' + A.name + ' · ' + (i + 1) + '/' + A.steps.length + '</h3><p class="sub">' + (i === 0 ? '⛓️ Nghiệp nặng: trước khi được làm người, bạn phải sống một kiếp ' + A.name + '. ' : '') + esc(text) + '</p><div class="actsheet">' + opts.map(([l, v], k) => '<button type="button" class="btn btn-soft" data-an="' + v + '">' + (k + 1) + '. ' + esc(l) + '</button>').join('') + '</div>');
      $('#modalBox').querySelectorAll('[data-an]').forEach((b) => (b.onclick = () => { sfx(+b.dataset.an > 0 ? 'good' : 'click'); pts += +b.dataset.an; i++; step(); }));
    };
    step();
  }
  function openScenarios() {
    const list = G().scenarios();
    openModal('<h3>🎬 Kịch bản đặc biệt</h3><p class="sub">Mỗi kịch bản có hoàn cảnh xuất phát và một mục tiêu riêng. Hoàn thành được ghi nhận ở màn hình cuối đời.</p><div class="co-list">' +
      list.map((s) => '<button type="button" class="card item" data-scn="' + s.id + '"><span class="ai">' + s.icon + '</span><span style="min-width:0;text-align:left"><b>' + esc(s.name) + '</b>' + (s.done ? ' <span class="tag good">✅ ×' + s.done + '</span>' : '') + '<br><span class="id">' + esc(s.desc) + '</span><br><small class="p-sub">🎯 ' + esc(s.goal) + '</small></span></button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-scn]').forEach((b) => (b.onclick = () => { closeModal(); sfx('click'); if (G().getMode && G().getMode() === 'online') G().setMode('offline'); openCreator({ scenario: b.dataset.scn }); }));
  }
  function openPetShop() {
    const opts = G().petShop();
    openModal('<h3>🐾 Nuôi thú cưng</h3><p class="sub">Tối đa 3 bé. Chó mèo có thể huấn luyện rồi đi thi; mỗi loài có tuổi thọ riêng. Chó, mèo xuất hiện trong cảnh 3D.</p>' +
      '<label class="ol-field">Đặt tên cho bé<input id="petName" maxlength="16" placeholder="Để trống: tên ngẫu nhiên"></label>' +
      '<div class="co-list">' + opts.map((o) => '<button type="button" class="card item" data-pet="' + o.id + '"' + (o.ok ? '' : ' disabled') + '><span class="ai">' + o.icon + '</span><span style="min-width:0;text-align:left"><b>' + esc(o.name) + '</b> <small class="p-sub">· sống ~' + o.life + ' năm</small><br><span class="id">' + esc(o.desc) + '</span>' + (o.ok ? '' : '<br><small class="p-sub">' + esc(o.reason) + '</small>') + '</span><span class="price">' + esc(o.priceText) + '</span></button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-pet]').forEach((b) => (b.onclick = () => { const nm = $('#petName').value; closeModal(); sfx('coin'); doAction(() => G().buyPet(b.dataset.pet, nm)); }));
  }
  function openFamilyTree() {
    const tree = G().familyTree();
    const money = (v) => (v == null ? '' : D.fmtMoney(v));
    openModal('<h3>🌳 Gia phả</h3><p class="sub">Mỗi dòng họ là chuỗi các đời bạn chơi nối tiếp (chơi tiếp bằng con sau khi qua đời). Đồ gia truyền cộng chỉ số cho con cháu.</p>' +
      (tree.length ? tree.slice(0, 8).map((d) => '<div class="tree"><div class="tree-head"><b>🏯 Họ ' + esc(d.surname) + '</b><small>' + d.gens + ' đời · tổng điểm ' + d.total + (d.city ? ' · ' + esc(d.city) : '') + '</small></div>' +
        (d.heirlooms.length ? '<div class="tree-hl">' + d.heirlooms.map((h) => '<span class="tag" title="' + esc(h.desc) + '">' + h.icon + ' ' + esc(h.name) + '</span>').join(' ') + '</div>' : '') +
        d.lives.map((l, i) => (i ? '<div class="tree-link">│</div>' : '') + '<div class="tree-node' + (l.living ? ' live' : '') + '"><b>Đời ' + (l.generation || 1) + ' · ' + esc(l.fullName) + '</b><small>' + (l.born || '?') + ' – ' + (l.living ? 'nay (' + l.age + ' tuổi)' : (l.died || '?') + ' · thọ ' + l.age) + (l.rank ? ' · ' + esc(l.rank) : '') + '</small>' +
          '<small>' + [l.job, l.spouse ? '💍 ' + l.spouse : '', l.kids && l.kids.length ? '👶 ' + l.kids.join(', ') : '', l.company ? '🏢 ' + l.company : '', l.worth != null ? '💰 ' + money(l.worth) : '', l.cause ? '🕯️ ' + l.cause : ''].filter(Boolean).map(esc).join(' · ') + '</small>' +
          (l.heir ? '<small>➜ Nối dõi: <b>' + esc(l.heir) + '</b></small>' : '') + '</div>').join('') + '</div>').join('') : '<p class="p-sub">Chưa có đời nào khép lại. Sống hết một kiếp rồi chọn chơi tiếp bằng con để dựng gia phả.</p>'));
  }
  function openCompanyFound() {
    const opts = G().companyOptions();
    openModal('<h3>🏢 Thành lập công ty</h3><p class="sub">Chọn ngành và đặt tên. Vốn ban đầu trừ ngay vào tài khoản; công ty lãi thì chia cổ tức về cho bạn mỗi năm.</p>' +
      '<label class="ol-field">Tên công ty<input id="coName" maxlength="40" placeholder="Để trống: game tự đặt"></label>' +
      '<div class="co-list">' + opts.map((o) => '<button type="button" class="card item" data-ind="' + o.id + '"' + (o.ok ? '' : ' disabled') + '><span class="ai">' + o.icon + '</span><span style="min-width:0;text-align:left"><b>' + esc(o.name) + '</b><br><span class="id">' + esc(o.desc) + '</span>' + (o.ok ? '' : '<br><small class="p-sub">' + esc(o.reason) + '</small>') + '</span><span class="price">' + esc(o.costText) + '</span></button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-ind]').forEach((b) => (b.onclick = () => { const nm = $('#coName').value; closeModal(); sfx('coin'); doAction(() => G().foundCompany(b.dataset.ind, nm)); }));
  }
  function bindTab(body, v) {
    body.querySelectorAll('[data-act]').forEach((b) => b.onclick = () => { sfx('click'); if (b.dataset.input === 'parttime') openPartTime(b.dataset.act); else if (b.dataset.input) openPlayPicker(b.dataset.act); else doAction(() => G().doActivity(b.dataset.act)); });
    body.querySelectorAll('[data-logf]').forEach((b) => (b.onclick = () => { sfx('click'); S.logOnly = b.dataset.logf === 'key'; render(); }));
    const rk = body.querySelector('#btnRisk'); if (rk) rk.onclick = () => { sfx('click'); openRisks(); };
    body.querySelectorAll('[data-person]').forEach((b) => b.onclick = () => { sfx('click'); openPerson(b.dataset.person); });
    body.querySelectorAll('[data-edu]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(b.dataset.edu === 'dropout', 'Bỏ học?', 'Bố mẹ sẽ buồn lắm đấy. Bạn chắc chứ?', () => doAction(() => G().eduAction(b.dataset.edu))); });
    body.querySelectorAll('[data-sub]').forEach((b) => b.onclick = () => { const [tb, id] = b.dataset.sub.split(':'); setSub(tb, id); sfx('click'); render(); const bd = b.closest('.panel-body') || body; if (bd && bd.scrollTo) bd.scrollTo({ top: 0 }); });
    body.querySelectorAll('[data-decor]').forEach((b) => b.onclick = () => { sfx('click'); KN.Decor && KN.Decor.open(); });
    body.querySelectorAll('[data-realfr]').forEach((b) => b.onclick = () => { sfx('click'); KN.People && KN.People.open(); });
    body.querySelectorAll('[data-xkhome]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(true, 'Về nước?', 'Kết thúc những năm làm việc ở nước ngoài.', () => doAction(() => G().xkHome())); });
    body.querySelectorAll('[data-chain]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().chainAction(b.dataset.chain)); });
    body.querySelectorAll('[data-league]').forEach((b) => b.onclick = () => { sfx('click'); doLeague(); });
    body.querySelectorAll('[data-job]').forEach((b) => b.onclick = () => { sfx('click'); if (b.dataset.job === 'mgr') { if (KN.Manager) KN.Manager.open(); return; } confirmIf(b.dataset.job === 'retire', 'Nghỉ hưu?', 'Quyết định này không thể rút lại ngay.', () => doAction(() => G().jobAction(b.dataset.job))); });
    body.querySelectorAll('[data-apply]').forEach((b) => b.onclick = () => { sfx('click'); const id = b.dataset.apply; withMini(KN.Mini && safe(() => KN.Mini.planJob(id)), (x) => G().applyJob(id, x)); });
    body.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => { sfx('coin'); const id = b.dataset.buy; withMini(KN.Mini && safe(() => KN.Mini.planHaggle(id)), (x) => G().buy(id, x ? { discount: x.mini * 0.15 } : null)); });
    const cf = body.querySelector('[data-cofound]'); if (cf) cf.onclick = () => { sfx('click'); openCompanyFound(); };
    const ps = body.querySelector('[data-petshop]'); if (ps) ps.onclick = () => { sfx('click'); openPetShop(); };
    const tr = body.querySelector('[data-tree]'); if (tr) tr.onclick = () => { sfx('click'); openFamilyTree(); };
    body.querySelectorAll('[data-furn]').forEach((b) => (b.onclick = () => { sfx('coin'); doAction(() => G().buyFurniture(b.dataset.furn)); }));
    body.querySelectorAll('[data-loan]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(true, 'Vay ngân hàng mua nhà?', b.title + '. Hai năm liền không đủ tiền góp thì ngân hàng siết nhà.', () => doAction(() => G().buyLoan(b.dataset.loan))); });
    body.querySelectorAll('[data-soc]').forEach((b) => b.onclick = () => { sfx('click'); if (b.dataset.soc === 'photo' && KN.Photo && G().photoStart) doPhoto(); else if (KN.LiveRoom && (KN.LiveRoom.KINDS.includes(b.dataset.soc) || (b.dataset.soc === 'pk' && KN.LiveRoom.runPK && G().pkStart)) && G().liveStart) doLive(b.dataset.soc); else doAction(() => G().socialAction(b.dataset.soc)); });
    const sendCmt = (id) => { const inp = body.querySelector('[data-cmtin="' + id + '"]'); const txt = inp ? inp.value : ''; const r = safe(() => G().socialReply(id, null, txt)); if (r && r.ok) { sfx(r.tone === 'bad' ? 'fail' : 'good'); toast(r.title, r.text, r.mood === 'harsh' ? '😤' : r.mood === 'funny' ? '😂' : '💗', r.tone === 'bad' ? 'err' : undefined); render(); } else if (r) toast('Chưa gửi được', r.reason, '✍️', 'err'); };
    body.querySelectorAll('[data-cmtsend]').forEach((b) => b.onclick = () => sendCmt(b.dataset.cmtsend));
    body.querySelectorAll('[data-cmtin]').forEach((inp) => inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); sendCmt(inp.dataset.cmtin); } });
    { const tn = body.querySelector('#tnStack'); if (tn) bindSwipe(tn); }
    body.querySelectorAll('[data-swipe]').forEach((b) => b.onclick = () => { const r = safe(() => G().datingSwipe(b.dataset.swipe, b.dataset.like === '1')); sfx(r && r.match ? 'good' : 'click'); if (r && r.ok !== false) { if (r.match) toast('💘 Match!', r.text, '💘'); render(); } else if (r) toast('Chưa được', r.reason, '⛔', 'err'); });
    body.querySelectorAll('[data-date]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().datingDate(b.dataset.date, +b.dataset.op)); });
    body.querySelectorAll('[data-grp]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().groupJoin(b.dataset.grp)); });
    body.querySelectorAll('[data-grpnew]').forEach((b) => b.onclick = () => { sfx('coin'); doAction(() => G().groupCreate(b.dataset.grpnew)); });
    body.querySelectorAll('[data-tdd]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(true, 'Vay nóng qua app?', 'Bị trừ 20% phí ngay, nợ nhân lên rất nhanh. Không trả nổi là bị đòi nợ kiểu khủng bố.', () => doAction(() => G().blackLoan(+b.dataset.tdd))); });
    body.querySelectorAll('[data-tddpay]').forEach((b) => b.onclick = () => { sfx('coin'); doAction(() => G().blackRepay()); });
    body.querySelectorAll('[data-hui]').forEach((b) => b.onclick = () => { sfx('coin'); doAction(() => G().huiJoin(+b.dataset.hui)); });
    body.querySelectorAll('[data-huitake]').forEach((b) => b.onclick = () => { sfx('coin'); doAction(() => G().huiTake()); });
    body.querySelectorAll('[data-feed]').forEach((b) => b.onclick = () => { sfx('click'); doFeed(); });
    body.querySelectorAll('[data-niche]').forEach((b) => b.onclick = () => { if (b.classList.contains('on')) return; sfx('click'); doAction(() => G().socialNiche(b.dataset.niche)); });
    body.querySelectorAll('[data-verify]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().socialVerify()); });
    body.querySelectorAll('[data-dm]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().socialInbox(b.dataset.dm, +b.dataset.ans)); });
    body.querySelectorAll('[data-offer]').forEach((b) => b.onclick = () => { sfx(b.dataset.ok ? 'coin' : 'click'); doAction(() => G().socialOffer(b.dataset.offer, !!b.dataset.ok)); });
    body.querySelectorAll('[data-reply]').forEach((b) => b.onclick = () => { sfx('click'); const r = safe(() => G().socialReply(b.dataset.reply, b.dataset.mode)); if (r && r.ok) toast(r.title, r.text, '💬', r.tone === 'bad' ? 'err' : undefined); render(); });
    body.querySelectorAll('[data-rent]').forEach((b) => b.onclick = () => { sfx('coin'); doAction(() => G().rentAsset(b.dataset.rent)); });
    body.querySelectorAll('[data-sell]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(true, 'Bán tài sản?', 'Bạn sẽ nhận lại giá trị hiện tại của món này.', () => doAction(() => G().sell(b.dataset.sell))); });
    body.querySelectorAll('[data-ls]').forEach((b) => b.onclick = () => { if (b.getAttribute('aria-pressed') === 'true') return; sfx('click'); const r = safe(() => G().setLifestyle(b.dataset.ls)); if (r && r.ok) toast(r.title, r.text, r.icon); else if (r) toast('Không đổi được', r.reason, '⛔', 'err'); render(); });
  }

  // ------------------------------------------------------------------ people action sheet
  function openPerson(id) {
    const v = G().view(); const p = v && v.people.find((x) => x.id === id);
    if (!p || !p.alive) return;
    openModal('<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">' + avatar(p) + '<div><h3 style="margin:0">' + esc(p.name) + '</h3><div class="sub" style="margin:0">' + esc(p.roleLabel) + ' · ' + p.age + ' tuổi · thân thiết ' + p.relation + '%</div>' + (p.info ? '<div class="sub" style="margin:2px 0 0">' + esc(p.info) + '</div>' : '') + '</div></div>' +
      '<div class="relbar' + (p.relation < 30 ? ' low' : '') + '" style="margin-bottom:14px"><i style="width:' + p.relation + '%"></i></div>' +
      '<div class="actsheet">' + p.actions.map((a) => '<button type="button" class="btn btn-soft" data-ia="' + a.id + '"' + (a.disabled ? ' disabled' : '') + '>' + a.icon + ' ' + esc(a.label) + (a.disabled ? ' <small style="margin-left:auto;color:var(--fg-faint)">' + esc(a.reason) + '</small>' : '') + '</button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-ia]').forEach((b) => b.onclick = () => { sfx('click'); const act = b.dataset.ia; if (act === 'gift') { openGiftPicker(id); return; } const danger = act === 'breakup' || act === 'divorce' || act === 'argue' || act === 'leave'; closeModal(); if (act === 'propose') { withMini(KN.Mini && safe(() => KN.Mini.planPropose(id)), (x) => G().interact(id, act, null, x)); return; } confirmIf(danger && act !== 'argue', act === 'divorce' ? 'Ly hôn?' : act === 'leave' ? 'Bỏ vợ/chồng theo người tình?' : 'Chia tay?', 'Có những lời đã nói ra thì khó rút lại.', () => doAction(() => G().interact(id, act))); });
  }
  function openGiftPicker(id) {
    const v = G().view(); const p = v && v.people.find((x) => x.id === id);
    if (!p) return;
    const opts = G().giftOptions(id).slice().sort((a, b) => a.price - b.price);
    const liked = opts.filter((g) => g.liked).length;
    openModal('<h3>🎁 Tặng quà cho ' + esc(p.name) + '</h3><p class="sub">' + esc(p.roleLabel) + ' · ' + p.age + ' tuổi. ' + (liked ? 'Món có <b class="heart">❤</b> là món người ấy thích nhất. ' : '') + 'Bạn đang có <b>' + esc(v.moneyText) + '</b>.</p>' +
      '<div class="giftgrid">' + opts.map((g) => '<button type="button" class="gift' + (g.liked ? ' liked' : '') + '" data-gift="' + g.id + '" title="' + esc(g.desc) + '"' + (g.affordable ? '' : ' disabled') + '><span class="gi">' + g.icon + '</span><span class="gn">' + esc(g.name) + '</span><span class="gp">' + esc(g.priceText) + '</span>' + (g.liked ? '<span class="gl" aria-label="Người ấy thích">❤</span>' : '') + '</button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-gift]').forEach((b) => b.onclick = () => { sfx('coin'); closeModal(); doAction(() => G().interact(id, 'gift', b.dataset.gift)); });
  }

  // ------------------------------------------------------------------ the sheet (events & results)
  function showSheet(html, tone) {
    const sh = $('#sheet');
    sh.innerHTML = '<div class="ev-card tone-' + (tone || 'neutral') + '">' + html + '</div>';
    sh.hidden = false;
    $('#app').classList.add('sheet-open');
    return sh.firstChild;
  }
  function hideSheet() { const sh = $('#sheet'); sh.hidden = true; sh.innerHTML = ''; S.primary = null; S.choiceFns = []; $('#app').classList.remove('sheet-open'); }
  function typeText(el, text) {
    return new Promise((res) => {
      if (reduced || !text) { el.textContent = text || ''; res(); return; }
      let i = 0; const total = text.length, cps = 85;
      const caret = '<span class="caret"></span>';
      const t0 = performance.now();
      let done = false;
      const finish = () => { if (done) return; done = true; el.textContent = text; res(); };
      const card = el.closest('.ev-card');
      if (card) card.addEventListener('pointerdown', finish, { once: true });
      const step = (now) => {
        if (done) return;
        i = Math.min(total, Math.floor((now - t0) / 1000 * cps));
        el.innerHTML = esc(text.slice(0, i)) + caret;
        if (i >= total) finish(); else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      S.skipType = finish;
    });
  }
  function chipsHtml(r) {
    const out = [];
    const d = r.deltas || {};
    ['happy', 'health', 'smarts', 'looks', 'karma'].forEach((k) => { if (d[k]) out.push('<span class="chip ' + (d[k] > 0 ? 'up' : 'down') + '">' + DELTA_META[k][0] + ' ' + (d[k] > 0 ? '+' : '') + Math.round(d[k]) + ' ' + DELTA_META[k][1] + '</span>'); });
    if (d.money) out.push('<span class="chip ' + (d.money > 0 ? 'up' : 'down') + '">💰 ' + (d.money > 0 ? '+' : '') + esc(D.fmtMoney(d.money)) + '</span>');
    (r.relDeltas || []).forEach((x) => out.push('<span class="chip ' + (x.delta > 0 ? 'up' : 'down') + '">❤️ ' + (x.delta > 0 ? '+' : '') + x.delta + ' ' + esc(x.name) + '</span>'));
    return out.length ? '<div class="chips">' + out.map((c, i) => c.replace('class="chip', 'style="animation-delay:' + (i * 70) + 'ms" class="chip')).join('') + '</div>' : '';
  }
  function toneSfx(t) { sfx(t === 'good' ? 'good' : t === 'bad' ? 'bad' : t === 'milestone' ? 'cheer' : 'notify'); }
  function waitPrimary(btn) {
    return new Promise((res) => {
      const go = () => { if (S.primary !== go) return; S.primary = null; sfx('click'); res(); };
      S.primary = go;
      btn.onclick = go;
      setTimeout(() => { try { btn.focus({ preventScroll: true }); } catch (e) { /* */ } }, 50);
    });
  }
  async function presentResult(r, opts) {
    opts = opts || {};
    playScene(r.scene);
    toneSfx(r.tone);
    celebrate(r);
    // bình luận trực tiếp CHỈ khi nhân vật đang livestream (live bán hàng, PK, trò chuyện, giang hồ mạng…)
    if (KN.LiveChat && r.live && !KN.LiveRoom) safe(() => KN.LiveChat.burst(r.tone || 'neutral', (r.title || '') + ' ' + (r.text || '')));
    // album ảnh cuộc đời: chụp lại cảnh 3D ở các cột mốc (đợi cảnh dựng xong)
    if (r.scene && (r.tone === 'milestone' || opts.kicker) && KN.Extras && KN.Extras.capture) { const t = r.title; setTimeout(() => safe(() => KN.Extras.capture(t)), 1700); }
    const v = G().view();
    const logs = (r.logs || []).filter((l) => !/^Thành tựu|^Hoàn thành mục tiêu/.test(l.text));
    const card = showSheet(
      '<div class="ev-head"><span class="ev-icon">' + esc(r.icon || '✨') + '</span><div><div class="ev-kicker">' + esc(opts.kicker || (v ? v.age + ' tuổi · năm ' + v.year : '')) + '</div><h2 class="ev-title">' + esc(r.title || '') + '</h2></div></div>' +
      '<p class="ev-text"></p>' +
      (logs.length ? '<ul class="ev-logs">' + logs.slice(0, 6).map((l) => '<li><span>' + esc(l.icon) + '</span><span>' + esc(l.text) + '</span></li>').join('') + '</ul>' : '') +
      chipsHtml(r) +
      '<div class="ev-foot"><span class="hint-key">Enter ↵</span><button type="button" class="btn btn-primary" data-go>' + (G().isDead() ? 'Tiễn biệt…' : 'Tiếp tục') + '</button></div>', r.tone);
    await typeText(card.querySelector('.ev-text'), r.text || '');
    await waitPrimary(card.querySelector('[data-go]'));
    hideSheet();
  }
  async function presentEvent(ev) {
    playScene(ev.scene);
    sfx('notify');
    if (KN.LiveChat && ev.live && !KN.LiveRoom) safe(() => KN.LiveChat.burst('question', ev.title + ' ' + ev.text));
    const v = G().view();
    const card = showSheet(
      '<div class="ev-head"><span class="ev-icon">' + esc(ev.icon || '✨') + '</span><div><div class="ev-kicker">Tình huống · ' + v.age + ' tuổi</div><h2 class="ev-title">' + esc(ev.title) + '</h2></div></div>' +
      '<p class="ev-text"></p><div class="ev-choices"></div>');
    await typeText(card.querySelector('.ev-text'), ev.text);
    coach('choice');
    const box = card.querySelector('.ev-choices');
    if (ev.many) box.classList.add('many');
    // lựa chọn nào có minigame thì gắn nhãn 🎮
    const plans = ev.choices.map((c) => (KN.Mini ? safe(() => KN.Mini.plan(ev, c)) : null));
    box.innerHTML = ev.choices.map((c, i) => '<button type="button" class="choice" style="animation-delay:' + (Math.min(i, 8) * 60) + 'ms" data-i="' + c.index + '"' + (c.disabled ? ' disabled' : '') + '><span class="num">' + (i < 9 ? i + 1 : '•') + '</span><span>' + esc(c.label) + (plans[i] ? ' <span class="tag mini-tag">🎮 ' + esc(KN.Mini.NAME[plans[i].type].replace(/^\S+\s/, '')) + '</span>' : '') + (c.hint ? '<em class="choice-hint">' + esc(c.hint) + '</em>' : '') + (c.disabled && c.reason ? '<small>' + esc(c.reason) + '</small>' : '') + '</span></button>').join('');
    const picked = await new Promise((res) => {
      S.choiceFns = ev.choices.map((c) => (c.disabled ? null : () => res(c)));
      box.querySelectorAll('.choice').forEach((b, i) => b.onclick = () => { if (!ev.choices[i].disabled) res(ev.choices[i]); });
    });
    S.choiceFns = [];
    sfx('click');
    // minigame: chơi trước rồi lấy điểm quyết định thành bại (bỏ qua = để số phận quyết định)
    let extra = null;
    const plan = plans[ev.choices.indexOf(picked)];
    if (plan) { try { const sc = await KN.Mini.run(plan); if (typeof sc === 'number') extra = { mini: sc }; } catch (e) { console.warn(e); } }
    const r = safe(() => G().choose(ev.uid, picked.index, extra));
    if (!r) { hideSheet(); return; }
    if (r.ok === false) { toast('Không chọn được', r.reason, '⛔', 'err'); hideSheet(); return; }
    playScene(r.scene);
    toneSfx(r.tone);
    celebrate(r);
    // bình luận trực tiếp CHỈ khi nhân vật đang livestream (live bán hàng, PK, trò chuyện, giang hồ mạng…)
    if (KN.LiveChat && r.live && !KN.LiveRoom) safe(() => KN.LiveChat.burst(r.tone || 'neutral', (r.title || '') + ' ' + (r.text || '')));
    card.className = 'ev-card tone-' + (r.tone || 'neutral');
    box.outerHTML = '<div class="ev-outcome"><div class="ev-picked">Bạn chọn: <b>' + esc(picked.label) + '</b></div><p class="ev-text ev-out"></p>' + chipsHtml(r) + '<div class="ev-foot"><span class="hint-key">Enter ↵</span><button type="button" class="btn btn-primary" data-go>' + (G().isDead() ? 'Tiễn biệt…' : 'Tiếp tục') + '</button></div></div>';
    card.querySelector('.ev-text').remove();
    await typeText(card.querySelector('.ev-out'), r.text || '');
    render();
    await waitPrimary(card.querySelector('[data-go]'));
    hideSheet();
  }
  async function runPending() {
    let guard = 0;
    while (G().pending().length && !G().isDead() && guard++ < 12) await presentEvent(G().pending()[0]);
  }
  function setAgeBtn() {
    const b = $('#btnAge'); b.disabled = S.busy;
    const f = $('#btnFF'); if (!f) return;
    const v = S.mode === 'play' ? safe(() => G().view()) : null;
    f.hidden = !(v && v.age < 10 && !v.dead && !G().pending().length); f.disabled = S.busy;
  }
  // tuổi thơ lặp lại nhiều: tự lớn tối đa 5 tuổi; gặp tình huống cần quyết định thì dừng cho bạn chọn rồi lớn tiếp; tới 10 tuổi thì thôi
  async function onFastForward() {
    if (S.busy || S.mode !== 'play') return;
    unlockAudio(); S.busy = true; setAgeBtn();
    try {
      let n = 0, stopped = false;
      for (; n < 5; n++) {
        const a = G().view().age; if (a >= 10 || G().pending().length) break;
        const r = safe(() => G().ageUp());
        if (!r || r.ok === false) break;
        if (r.died) { render(); await presentResult(r); await deathFlow(); return; }
        if (G().pending().length) { stopped = true; render(); playScene(r.scene); toast(r.title, r.text, '🎂'); await sleep(reduced ? 0 : 700); await runPending(); if (G().isDead()) { await deathFlow(); return; } }
      }
      sfx('age'); S.tab = 'log'; render(); mood('happy');
      toast('⏩ Tua tuổi thơ', 'Bạn đã lớn thêm ' + n + ' tuổi' + (stopped ? ' (có chuyện cần bạn quyết định trên đường)' : '') + '. Xem lại nhật ký để biết đã xảy ra gì.', '⏩');
    } finally { S.busy = false; setAgeBtn(); render(); onlineSync(); }
  }
  // chơi minigame trước (nếu có) rồi mới thực hiện hành động với điểm số đó; bỏ qua = như cũ
  async function withMini(plan, fn) {
    if (S.busy || S.mode !== 'play') return;
    let extra = null;
    if (plan && KN.Mini) {
      S.busy = true; setAgeBtn();
      try { const sc = await KN.Mini.run(plan); if (typeof sc === 'number') extra = { mini: sc }; } catch (e) { console.warn(e); }
      finally { S.busy = false; setAgeBtn(); }
    }
    doAction(() => fn(extra));
  }
  async function doAction(fn) {
    if (S.busy || S.mode !== 'play') return;
    unlockAudio();
    S.busy = true; setAgeBtn();
    try {
      const r = safe(fn);
      if (!r) return;
      if (r.ok === false) { toast('Chưa được đâu', r.reason || 'Không thể thực hiện lúc này.', '⛔', 'err'); sfx('fail'); return; }
      render();
      await presentResult(r);
      await runPending();
      if (G().isDead()) await deathFlow();
    } finally { S.busy = false; setAgeBtn(); render(); onlineSync(); }
  }
  // 📱 phòng live: phát trực tiếp đến khi người chơi tự bấm tắt, rồi mới hiện tổng kết
  async function doPhoto() {
    if (S.busy || S.mode !== 'play') return;
    unlockAudio();
    const st = safe(() => G().photoStart()); if (!st) return;
    if (st.ok === false) { toast('Chưa được đâu', st.reason || 'Không chụp được lúc này.', '⛔', 'err'); sfx('fail'); return; }
    S.busy = true; setAgeBtn();
    try {
      const r = await KN.Photo.studio(st);
      render();
      if (r && r.ok !== false) await presentResult(r);
      await runPending();
    } finally { S.busy = false; setAgeBtn(); render(); onlineSync(); }
  }
  async function doFeed() {
    if (S.busy || S.mode !== 'play') return;
    const st = safe(() => G().feedStart()); if (!st) return;
    if (st.ok === false) { toast('Chưa được đâu', st.reason || 'Không lướt được lúc này.', '⛔', 'err'); sfx('fail'); return; }
    S.busy = true; setAgeBtn();
    try {
      const r = await KN.Photo.feed(st);
      if (r) toast('📱 Lướt MXH', r.text + (r.deltas ? ' ' + Object.entries(r.deltas).map(([k, v]) => ({ happy: '😊', smarts: '🧠', health: '❤️' }[k] || k) + (v > 0 ? '+' : '') + v).join(' ') : ''), '📱');
    } finally { S.busy = false; setAgeBtn(); render(); }
  }
  async function doLive(id) {
    if (S.busy || S.mode !== 'play') return;
    unlockAudio();
    const pk = id === 'pk', st = safe(() => pk ? G().pkStart() : G().liveStart(id));
    if (!st) return;
    if (st.ok === false) { toast('Chưa được đâu', st.reason || 'Không thể live lúc này.', '⛔', 'err'); sfx('fail'); return; }
    S.busy = true; setAgeBtn();
    try {
      render();
      const r = await (pk ? KN.LiveRoom.runPK(st) : KN.LiveRoom.run(st));
      render();
      if (r && r.ok !== false) await presentResult(r);
      await runPending();
      if (G().isDead()) await deathFlow();
    } finally { S.busy = false; setAgeBtn(); render(); onlineSync(); }
  }
  function onlineSync() { if (KN.Online && KN.Online.afterAge) safe(() => KN.Online.afterAge()); }
  async function onAgeUp() {
    if (S.busy || S.mode !== 'play') return;
    unlockAudio();
    S.busy = true; setAgeBtn();
    try {
      if (G().pending().length) { await runPending(); return; }
      // solo online: chạm mốc 10 năm thì chờ đối thủ
      const wait = KN.Online && KN.Online.gate ? safe(() => KN.Online.gate()) : null;
      if (wait) { toast('Chờ đối thủ', wait, '⏳', 'err'); return; }
      const r = safe(() => G().ageUp());
      if (!r) return;
      if (r.ok === false) { toast('Khoan đã', r.reason, '⏳', 'err'); return; }
      sfx('age');
      if (S.tab !== 'log') S.tab = 'log';
      render();
      const v = G().view();
      if ([18, 30, 50, 60, 70, 80, 90, 100].includes(v.age)) mood('festive');
      else mood(v.age < 12 ? 'happy' : v.stats.happy < 35 ? 'sad' : 'calm');
      if (r.died) { await presentResult(r); await deathFlow(); return; }
      celebrate(r);
      playScene(r.scene);
      toast(r.title, r.text, '🎂');
      if (r.events && r.events.length) { await sleep(reduced ? 0 : 1100); await runPending(); }
      if (G().isDead()) { await deathFlow(); return; }
      coachAfterYears(v.age);
    } finally { S.busy = false; setAgeBtn(); render(); onlineSync(); }
  }

  // ------------------------------------------------------------------ death
  async function deathFlow() {
    hideSheet();
    if (KN.Online && KN.Online.onDeath) safe(() => KN.Online.onDeath());
    mood('sad'); sfx('death');
    setMode('death');
    playScene(G().deathScene());
    const info = G().deathInfo();
    if (!info) return;
    const rankIcon = { 'Huyền thoại': '🏮', 'Đáng nhớ': '🌸', 'Trọn vẹn': '🌾', 'Bình dị': '🍃', 'Lận đận': '🌧️' }[info.rank] || '🕯️';
    $('#viewDeath').innerHTML = '<div class="death-wrap">' +
      '<div class="candle">🕯️</div><div class="obit-kicker">Vĩnh biệt</div>' +
      '<div class="obit-name">' + esc(info.fullName) + '</div>' +
      '<div class="obit-years">' + info.born + ' – ' + info.died + ' · hưởng thọ ' + info.age + ' tuổi</div>' +
      '<div class="obit-cause">' + esc(info.cause) + '</div>' +
      '<p class="epitaph">“' + esc(info.epitaph) + '”</p>' +
      '<div class="rank"><b>' + rankIcon + ' ' + esc(info.rank) + '</b><span id="scoreNum">0</span><small class="p-sub">điểm kiếp người</small></div>' +
      (info.highlights.length ? '<div class="sec-title">Dấu ấn cuộc đời</div><div class="obit-list">' + info.highlights.map((h) => '<div>' + esc(h) + '</div>').join('') + '</div>' : '') +
      '<div class="sec-title">Mục tiêu</div><div class="obit-list">' + info.goals.map((g) => '<div>' + (g.done ? '✅ ' : '⬜ ') + esc(g.text) + '</div>').join('') + '</div>' +
      (info.achievements.length ? '<div class="sec-title">Thành tựu đạt được</div><div class="achs">' + info.achievements.map((a) => '<span>' + a.icon + ' ' + esc(a.name) + '</span>').join('') + '</div>' : '') +
      (info.allHeirlooms && info.allHeirlooms.length ? '<div class="death-sec"><b>🏺 Đồ gia truyền để lại cho con cháu</b><p class="p-sub">' + esc(info.allHeirlooms.join(' · ')) + (info.heirlooms && info.heirlooms.length ? ' — mới có thêm: ' + esc(info.heirlooms.join(', ')) : '') + '</p></div>' : '') +
      (info.scenario ? '<div class="ch-result ' + (info.scenario.status === 'done' ? 'ok' : 'fail') + '">🎬 Kịch bản “' + esc(info.scenario.name) + '”: ' + (info.scenario.status === 'done' ? '✅ HOÀN THÀNH' : '❌ chưa đạt') + ' — ' + esc(info.scenario.goal) + '</div>' : '') +
      (info.afterlife ? '<div class="death-sec afterlife ' + info.afterlife.kind + '"><b>⚖️ Phán xét: ' + info.afterlife.icon + ' ' + esc(info.afterlife.title) + '</b><p class="p-sub">Điểm đức cuối đời: <b>' + info.afterlife.karma + '</b>/100 (từ 65 lên thiên đàng, dưới 35 xuống địa ngục). ' + esc(info.afterlife.text) + '</p><button type="button" class="btn btn-soft btn-sm" data-afterlife>' + (info.afterlife.kind === 'heaven' ? '☁️ Xem linh hồn lên thiên đàng' : info.afterlife.kind === 'hell' ? '🔥 Xem linh hồn xuống địa ngục' : '🌫️ Xem linh hồn đi về đâu') + '</button></div>' : '') +
      (info.rebirth ? '<div class="death-sec"><b>♻️ Luân hồi theo nghiệp</b><p class="p-sub">Điểm nghiệp cuối đời: <b>' + info.rebirth.karma + '</b> → ' + esc(info.rebirth.icon + ' ' + info.rebirth.label) + '. ' + esc(info.rebirth.desc) + '</p></div>' : '') +
      '<div class="death-actions">' + (info.rebirth ? '<button type="button" class="btn btn-soft" data-reborn>♻️ Đầu thai: ' + esc(info.rebirth.icon + ' ' + info.rebirth.label) + '</button>' : '') + info.heirs.map((h) => '<button type="button" class="btn btn-primary" data-heir="' + h.id + '">🌳 Sống tiếp làm con: ' + esc(h.name) + ' (' + h.age + ' tuổi)' + (h.info ? '<small style="display:block;font-weight:500;opacity:.85">' + esc(h.info) + '</small>' : '') + '</button>').join('') +
      '<button type="button" class="btn ' + (info.heirs.length ? 'btn-ghost' : 'btn-primary') + '" data-newlife>👶 Bắt đầu kiếp mới</button><button type="button" class="btn btn-soft" data-home>Về màn hình chính</button></div></div>';
    const target = info.score, el = $('#scoreNum'), t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 1600); el.textContent = Math.round(target * U.ease.outCubic(k)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    $('#viewDeath').querySelectorAll('[data-heir]').forEach((b) => b.onclick = () => continueAs(b.dataset.heir));
    $('#viewDeath').querySelector('[data-newlife]').onclick = () => { sfx('click'); if (G().getMode && G().getMode() === 'online') G().setMode('offline'); openCreator(); };
    const rbb = $('#viewDeath').querySelector('[data-reborn]');
    if (rbb) rbb.onclick = () => { sfx('click'); const rb = info.rebirth; if (G().getMode && G().getMode() === 'online') G().setMode('offline'); if (rb.animal) openAnimalLife(rb); else openCreator({ rebirth: rb }); };
    const alb = $('#viewDeath').querySelector('[data-afterlife]');
    if (alb) { const label0 = alb.textContent; let soul = false; alb.onclick = () => { soul = !soul; sfx(soul ? (info.afterlife.kind === 'hell' ? 'bad' : 'cheer') : 'click'); playScene(soul ? G().afterlifeScene() : G().deathScene()); alb.textContent = soul ? '🕯️ Về lại tang lễ' : label0; }; }
    $('#viewDeath').querySelector('[data-home]').onclick = () => { sfx('click'); showTitle(); };
    renderHud(G().view());
  }
  async function continueAs(id) {
    sfx('birth');
    let r;
    await fadeThrough(async () => {
      r = safe(() => G().continueAs(id));
      if (!r || r.ok === false) return;
      S.seenLog = 0; S.prevStats = null; S.prevAge = null; S.moneyShown = null; S.tab = 'log';
      setMode('play'); render();
    });
    if (!r || r.ok === false) { toast('Không thể tiếp tục', r && r.reason, '⛔', 'err'); return; }
    mood('calm');
    S.busy = true; setAgeBtn();
    try { await presentResult(r, { kicker: 'Thế hệ mới' }); } finally { S.busy = false; setAgeBtn(); render(); }
  }

  // ------------------------------------------------------------------ modals
  function openModal(html) {
    $('#modalBox').innerHTML = '<button type="button" class="icon-btn modal-x" data-close="1" aria-label="Đóng">✕</button>' + html;
    $('#modal').hidden = false;
    $('#modal').querySelectorAll('[data-close]').forEach((b) => b.onclick = closeModal);
  }
  function closeModal() { $('#modal').hidden = true; $('#modalBox').innerHTML = ''; }
  function confirmIf(need, title, body, fn) {
    if (!need) { fn(); return; }
    openModal('<h3>' + esc(title) + '</h3><p class="sub">' + esc(body) + '</p><div class="btnrow" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-close="1">Thôi</button><button type="button" class="btn btn-primary" id="cfYes">Đồng ý</button></div>');
    $('#cfYes').onclick = () => { closeModal(); fn(); };
  }
  function openSettings() {
    const q = KN.World.getQuality ? KN.World.getQuality() : 'high';
    openModal('<h3>Cài đặt</h3><p class="sub">Tùy chỉnh trải nghiệm của bạn.</p>' +
      '<div class="toggle"><span>🔔 Hiệu ứng âm thanh</span><button type="button" class="switch" role="switch" id="tSfx" aria-checked="' + prefs.sfx + '" aria-label="Hiệu ứng âm thanh"></button></div>' +
      '<div class="toggle"><span>🎵 Nhạc nền</span><button type="button" class="switch" role="switch" id="tMusic" aria-checked="' + prefs.music + '" aria-label="Nhạc nền"></button></div>' +
      '<div class="toggle"><span>🖥️ Đồ họa</span><div class="seg"><button type="button" data-q="high" aria-pressed="' + (q === 'high') + '">Đẹp</button><button type="button" data-q="low" aria-pressed="' + (q === 'low') + '">Mượt</button></div></div>' +
      '<div class="toggle"><span>💬 Bình luận ảo kiểu livestream<br><small class="p-sub">Khán giả ảo bình luận theo từng tình huống</small></span><button type="button" class="switch" role="switch" id="tChat" aria-checked="' + (KN.LiveChat ? KN.LiveChat.isOn() : false) + '" aria-label="Bình luận ảo"></button></div>' +
      '<div class="toggle"><span>🎬 Hậu kỳ điện ảnh<br><small class="p-sub">Ánh sáng lan toả, chỉnh màu (máy yếu nên tắt)</small></span><button type="button" class="switch" role="switch" id="tPost" aria-checked="' + (KN.World.getPost ? KN.World.getPost() : false) + '" aria-label="Hậu kỳ"></button></div>' +
      '<div class="toggle"><span>🎮 Minigame<br><small class="p-sub">Tự chơi khi thi cử, đá bóng, đánh nhau… (tắt = để số phận quyết định)</small></span><button type="button" class="switch" role="switch" id="tMini" aria-checked="' + (KN.Mini ? KN.Mini.isEnabled() : false) + '" aria-label="Minigame"></button></div>' +
      '<div class="toggle"><span>💾 Lưu & tải game<br><small class="p-sub">Ô lưu và mã lưu để chơi tiếp trên máy khác</small></span><button type="button" class="btn btn-soft btn-sm" id="tSaves">Mở</button></div>' +
      '<div class="toggle"><span>🗑️ Xóa toàn bộ dữ liệu<br><small class="p-sub">Cuộc đời hiện tại, ô lưu, nghĩa trang và thành tựu</small></span><button type="button" class="btn btn-danger btn-sm" id="tWipe">Xóa</button></div>' +
      '<p class="sub" style="margin-top:14px">Một Kiếp Người — mỗi lựa chọn đều có hậu quả. Phím tắt: <b>Space</b> lớn thêm 1 tuổi, <b>1–9</b> chọn, <b>Enter</b> tiếp tục.</p>');
    $('#tSaves').onclick = () => { sfx('click'); openSaves(); };
    $('#tChat').onclick = (e) => { if (!KN.LiveChat) return; const on = !KN.LiveChat.isOn(); KN.LiveChat.setOn(on); e.target.setAttribute('aria-checked', on); sfx('click'); };
    $('#tPost').onclick = (e) => { const on = !(KN.World.getPost && KN.World.getPost()); if (on && KN.World.resetPerf) KN.World.resetPerf(); else KN.World.setPost(false); if (on && KN.World.getQuality && KN.World.getQuality() !== 'high') { prefs.quality = 'high'; savePrefs(); KN.World.setQuality('high'); } e.target.setAttribute('aria-checked', KN.World.getPost()); sfx('click'); };
    $('#tMini').onclick = (e) => { if (!KN.Mini) return; const on = !KN.Mini.isEnabled(); KN.Mini.setEnabled(on); e.target.setAttribute('aria-checked', on); sfx('click'); };
    $('#tSfx').onclick = (e) => { prefs.sfx = !prefs.sfx; e.target.setAttribute('aria-checked', prefs.sfx); savePrefs(); try { KN.Audio.setSfx(prefs.sfx); } catch (x) { /* */ } updateSoundBtn(); sfx('click'); };
    $('#tMusic').onclick = (e) => { prefs.music = !prefs.music; e.target.setAttribute('aria-checked', prefs.music); savePrefs(); unlockAudio(); try { KN.Audio.setMusic(prefs.music); } catch (x) { /* */ } updateSoundBtn(); };
    $('#modalBox').querySelectorAll('[data-q]').forEach((b) => b.onclick = () => { prefs.quality = b.dataset.q; savePrefs(); KN.World.setQuality(prefs.quality); openSettings(); });
    let armed = false;
    $('#tWipe').onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = 'Bấm lần nữa để xóa'; return; }
      G().wipeAll(); closeModal(); toast('Đã xóa dữ liệu', 'Mọi thứ bắt đầu lại từ đầu.', '🗑️'); showTitle();
    };
  }
  // ---- lưu & tải
  function openSaves() {
    const has = G().hasLife(), v = has ? G().view() : null;
    const fmtT = (t) => { try { return t ? new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''; } catch (e) { return ''; } };
    openModal('<h3>💾 Lưu & tải game</h3><p class="sub">Game luôn tự lưu sau mỗi lựa chọn trên trình duyệt này. Dùng các ô lưu để giữ lại những cột mốc, hoặc tạo <b>mã lưu</b> để chơi tiếp trên máy khác.</p>' +
      '<div class="slots">' + G().slots().map((s) => '<div class="card slot">' +
        '<span class="si">' + (s.empty ? '📂' : s.dead ? '🕯️' : '📜') + '</span>' +
        '<span style="min-width:0"><b>Ô lưu ' + s.n + '</b><br><span class="p-sub">' + (s.empty ? 'Trống' : esc(s.name) + ' · ' + s.age + ' tuổi · năm ' + s.year + (s.generation > 1 ? ' · đời ' + s.generation : '') + ' · ' + esc(s.moneyText) + (s.savedAt ? '<br>Lưu lúc ' + esc(fmtT(s.savedAt)) : '')) + '</span></span>' +
        '<span class="btnrow">' + (has ? '<button type="button" class="btn btn-primary btn-sm" data-save="' + s.n + '">' + (s.empty ? 'Lưu' : 'Ghi đè') + '</button>' : '') +
        (s.empty ? '' : '<button type="button" class="btn btn-soft btn-sm" data-load="' + s.n + '">Tải</button><button type="button" class="btn btn-ghost btn-sm" data-del="' + s.n + '" aria-label="Xóa ô ' + s.n + '">✕</button>') + '</span></div>').join('') + '</div>' +
      '<div class="sec-title">Mã lưu <small>kiếp đang chơi + nghĩa trang, thành tựu, Phúc đức</small></div>' +
      '<div class="btnrow"><button type="button" class="btn btn-soft btn-sm" id="svExport">📤 Tạo mã lưu</button><button type="button" class="btn btn-soft btn-sm" id="svCopy" hidden>📋 Sao chép</button></div>' +
      '<textarea id="svCode" class="code" rows="3" readonly hidden aria-label="Mã lưu của bạn"></textarea>' +
      '<label class="lbl" for="svIn" style="display:block;margin-top:12px">Dán mã lưu để tải</label><textarea id="svIn" class="code" rows="3" placeholder="KN1z.…" aria-label="Dán mã lưu"></textarea>' +
      '<div class="btnrow" style="justify-content:flex-end"><button type="button" class="btn btn-primary btn-sm" id="svImport">📥 Tải từ mã</button></div>' +
      (v ? '' : ''));
    const box = $('#modalBox');
    box.querySelectorAll('[data-save]').forEach((b) => b.onclick = () => { const r = G().saveSlot(+b.dataset.save, Date.now()); if (r.ok) { sfx('coin'); toast('Đã lưu', 'Ô lưu ' + b.dataset.save, '💾'); openSaves(); } else toast('Không lưu được', r.reason, '⛔', 'err'); });
    box.querySelectorAll('[data-load]').forEach((b) => b.onclick = () => confirmIf(G().hasLife() && !G().isDead(), 'Tải ô lưu ' + b.dataset.load + '?', 'Kiếp đang chơi sẽ được thay bằng ô lưu này (nếu chưa lưu, tiến độ hiện tại sẽ mất).', async () => {
      const r = G().loadSlot(+b.dataset.load); closeModal();
      if (!r.ok) { toast('Không tải được', r.reason, '⛔', 'err'); return; }
      toast('Đã tải ô lưu ' + b.dataset.load, '', '📂'); await resumeLife();
    }));
    box.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { G().deleteSlot(+b.dataset.del); sfx('click'); openSaves(); });
    $('#svExport').onclick = async () => {
      const code = await G().exportCode();
      const ta = $('#svCode'); if (!ta) return;
      ta.value = code; ta.hidden = false; $('#svCopy').hidden = false; ta.select(); sfx('coin');
    };
    $('#svCopy').onclick = async () => { const ta = $('#svCode'); try { await navigator.clipboard.writeText(ta.value); toast('Đã sao chép mã lưu', 'Dán vào ghi chú hoặc gửi sang máy khác.', '📋'); } catch (e) { ta.select(); toast('Hãy tự sao chép', 'Mã đã được bôi đen, nhấn Ctrl+C (hoặc giữ để sao chép).', '📋'); } };
    $('#svImport').onclick = async () => {
      const code = $('#svIn').value;
      if (!code.trim()) { toast('Chưa có mã', 'Hãy dán mã lưu vào ô bên trên.', '✏️', 'err'); return; }
      const r = await G().importCode(code);
      if (!r.ok) { toast('Không tải được', r.reason, '⛔', 'err'); return; }
      closeModal(); toast('Đã tải mã lưu', r.hasLife ? 'Tiếp tục cuộc đời đang dang dở.' : 'Đã khôi phục nghĩa trang và thành tựu.', '📥', 'ach');
      if (r.hasLife) await resumeLife(); else showTitle();
    };
  }
  function openGraveyard() {
    const m = G().meta();
    openModal('<h3>🕯️ Nghĩa trang</h3><p class="sub">Những kiếp người bạn đã sống. Điểm cao nhất: <b>' + (m.bestScore || 0) + '</b></p>' +
      (m.lives.length ? m.lives.map((l) => '<div class="card grave"><span class="gi">' + (l.generation > 1 ? '🌳' : '🪦') + '</span><span style="min-width:0"><span class="gn">' + esc(l.fullName) + '</span><br><span class="gs">' + l.born + '–' + l.died + ' · ' + l.age + ' tuổi · ' + esc(l.cause) + '</span></span><span class="gr">' + esc(l.rank) + '<br>' + l.score + ' điểm</span></div>').join('') : '<div class="empty">Chưa có ai ở đây. Hãy sống trọn vẹn kiếp đầu tiên!</div>'));
  }
  function openAchievements() {
    const m = G().meta();
    openModal('<h3>🏆 Thành tựu</h3><p class="sub">' + Object.keys(m.achievements).length + ' / ' + D.ACHIEVEMENTS.length + ' đã mở khóa qua mọi kiếp.</p><div class="achgrid">' +
      D.ACHIEVEMENTS.map((a) => '<div class="achcell' + (m.achievements[a.id] ? '' : ' locked') + '"><div class="ai">' + a.icon + '</div><div class="an">' + esc(a.name) + '</div><div class="ad">' + esc(a.desc) + '</div></div>').join('') + '</div>');
  }
  function openPartTime(actId) {
    const opts = G().partTimeOptions();
    openModal('<h3>🛵 Làm thêm</h3><p class="sub">Chọn việc làm thêm vài tháng. Mỗi năm làm tối đa 2 đợt; đang có việc chính thì kiếm ít hơn và mệt hơn.</p><div class="giftgrid">' +
      opts.map((o) => '<button type="button" class="card gift" data-gig="' + o.id + '"' + (o.available ? '' : ' disabled') + '><span class="gi">' + o.icon + '</span><span class="gn">' + esc(o.name) + '</span><span class="gp' + (o.available ? '' : ' warn') + '">' + esc(o.available ? o.payText : o.reason) + '</span></button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-gig]').forEach((b) => b.onclick = () => { closeModal(); sfx('coin'); doAction(() => G().doActivity(actId, { gig: b.dataset.gig })); });
  }  // ---- đi chơi: gõ tự do hoặc chọn nhanh → trợ lý hướng nghiệp phân tích sở thích
  function openPlayPicker(actId) {
    const I = D.INTERESTS, v = G().view();
    openModal('<h3>🎈 Đi chơi</h3><p class="sub">Hôm nay ' + esc(v.name) + ' muốn chơi gì? Gõ tự do bằng tiếng Việt (vd: “đá bóng với mấy đứa trong xóm”, “vẽ tranh con mèo”, “tháo cái quạt ra xem”), hoặc chọn nhanh bên dưới. Trợ lý hướng nghiệp sẽ ghi nhận sở thích để gợi ý nghề sau này.</p>' +
      '<textarea id="playTx" class="code" rows="2" maxlength="160" placeholder="Con muốn…" aria-label="Trò muốn chơi" style="font-family:inherit"></textarea>' +
      '<div id="playGuess" class="p-sub" style="min-height:20px;margin:6px 0"></div>' +
      '<div class="chipsel" id="playChips">' + Object.keys(I).map((k) => '<button type="button" data-pick="' + k + '" aria-pressed="false">' + I[k].icon + ' ' + esc(I[k].label) + '</button>').join('') + '</div>' +
      '<div class="btnrow" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn btn-ghost" data-close="1">Thôi</button><button type="button" class="btn btn-primary" id="playGo">Đi chơi!</button></div>');
    let pick = null;
    const box = $('#modalBox'), tx = $('#playTx'), guess = $('#playGuess');
    box.querySelectorAll('[data-pick]').forEach((b) => b.onclick = () => { pick = pick === b.dataset.pick ? null : b.dataset.pick; box.querySelectorAll('[data-pick]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.pick === pick)); });
    tx.oninput = () => {
      const r = G().analyzeInterest(tx.value);
      guess.textContent = tx.value.trim() ? (r.top.length ? '🤖 Đoán: ' + r.top.slice(0, 2).map((k) => I[k].icon + ' ' + I[k].label).join(' + ') : '🤖 Chưa nhận ra — thử gõ cụ thể hơn, hoặc chọn nhanh bên dưới') : '';
    };
    tx.focus();
    $('#playGo').onclick = () => {
      const text = tx.value.trim();
      if (!text && !pick) { guess.textContent = '✏️ Gõ trò muốn chơi hoặc chọn một ô bên dưới nhé.'; return; }
      closeModal(); sfx('click'); doAction(() => G().doActivity(actId, { text, pick }));
    };
  }
  // ---- rủi ro đời sống theo số liệu thực
  function openRisks() {
    const rows = G().riskReport();
    openModal('<h3>📊 Rủi ro đời sống</h3><p class="sub">Xác suất xảy ra <b>mỗi năm</b> với nhân vật của bạn — tính từ số liệu thực tế ở Việt Nam, điều chỉnh theo tuổi, nơi sống, tài sản và bệnh nền. Cẩn thận vẫn hơn!</p>' +
      rows.map((r) => '<details class="more risk"><summary><span>' + r.icon + ' ' + esc(r.label) + '</span><b>' + (r.pct ? (r.pct < 0.1 ? '<0,1' : String(r.pct).replace('.', ',')) + '%' : '<small>chưa áp dụng</small>') + '</b></summary><p class="p-sub">' + esc(r.src) + '</p></details>').join('') +
      '<p class="p-sub" style="margin-top:10px">Nguồn: Cục CSGT (2024), Bộ Công an, Bộ Y tế, WHO, GLOBOCAN 2022. Một số mục là ước tính vì số liệu chính thức chỉ tính vụ được trình báo.</p>');
  }  function openNews() {
    const log = D.CHANGELOG || []; if (!log.length) return;
    const ver = (c) => '<ul class="news">' + c.items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    openModal('<h3>✨ Có gì mới</h3><p class="sub">Phiên bản ' + esc(log[0].v) + ' · ' + esc(log[0].date) + '</p>' + ver(log[0]) +
      (log.length > 1 ? '<details class="more"><summary>Các bản trước</summary>' + log.slice(1).map((c) => '<p class="sub" style="margin:10px 0 4px">v' + esc(c.v) + ' · ' + esc(c.date) + '</p>' + ver(c)).join('') + '</details>' : ''));
    prefs.seenVer = log[0].v; savePrefs(); $('#newsDot').hidden = true;
  }
  function updateSoundBtn() { $('#btnSound').textContent = prefs.sfx || prefs.music ? '🔊' : '🔇'; }

  // ------------------------------------------------------------------ coach marks
  function coach(key) {
    const order = { age: 1, choice: 2, tabs: 3 };
    if ((prefs.coach || 0) >= order[key] || S.coachShown[key]) return;
    S.coachShown[key] = true;
    const c = $('#coach');
    const texts = { age: 'Nhấn <b>+1 tuổi</b> (hoặc phím cách) để lớn lên. Mỗi năm là một câu chuyện mới!', choice: 'Mỗi lựa chọn đều có hậu quả — đến sức khỏe, tiền bạc, các mối quan hệ… và cả "đức" của bạn.', tabs: 'Đừng chỉ chờ năm mới: thử các tab <b>Hoạt động</b>, <b>Quan hệ</b>, <b>Học & Làm</b> để tự viết cuộc đời mình.' };
    c.innerHTML = texts[key] + '<br><button type="button" class="btn btn-primary btn-sm">Đã hiểu</button>';
    c.hidden = false;
    let anchor;
    if (key === 'age') anchor = $('#btnAge'); else if (key === 'tabs') anchor = $('#tabs'); else anchor = $('#sheet');
    const r = anchor.getBoundingClientRect(), w = Math.min(260, window.innerWidth - 32);
    c.style.width = w + 'px';
    if (key === 'age') { c.style.left = U.clamp(r.left + r.width / 2 - w / 2, 16, window.innerWidth - w - 16) + 'px'; c.style.top = Math.max(16, r.top - 150) + 'px'; }
    else if (key === 'tabs') { c.style.left = U.clamp(r.left + 10, 16, window.innerWidth - w - 16) + 'px'; c.style.top = Math.min(window.innerHeight - 170, r.bottom + 10) + 'px'; }
    else { c.style.left = U.clamp(r.left + 16, 16, window.innerWidth - w - 16) + 'px'; c.style.top = Math.max(16, r.top + 12) + 'px'; }
    c.querySelector('button').onclick = () => { c.hidden = true; prefs.coach = Math.max(prefs.coach || 0, order[key]); savePrefs(); };
  }
  function coachAfterYears(age) { if (age >= 4 && (prefs.coach || 0) < 3) coach('tabs'); }

  async function resumeLife() {
    if (!G().hasLife()) { showTitle(); return; }
    const v = G().view();
    await fadeThrough(async () => { S.seenLog = 0; S.prevStats = null; S.prevAge = null; S.moneyShown = null; if (v && !v.alive) { await deathFlow(); return; } setMode('play'); render(); playScene(G().currentScene()); });
    if (v && v.alive && G().pending().length) { S.busy = true; setAgeBtn(); try { await runPending(); if (G().isDead()) await deathFlow(); } finally { S.busy = false; setAgeBtn(); render(); } }
  }
  // ------------------------------------------------------------------ input
  function bindGlobal() {
    $('#btnNew').onclick = () => { unlockAudio(); sfx('click'); openCreator(); };
    $('#btnContinue').onclick = () => { unlockAudio(); sfx('click'); resumeLife(); };
    $('#btnSaves').onclick = () => { unlockAudio(); sfx('click'); openSaves(); };
    $('#btnNews').onclick = () => { unlockAudio(); sfx('click'); openNews(); };
    if ($('#btnOnline')) $('#btnOnline').onclick = () => { unlockAudio(); sfx('click'); if (KN.Online) KN.Online.open(); };
    if ($('#btnOnlineCont')) $('#btnOnlineCont').onclick = () => { unlockAudio(); sfx('click'); enterOnline(); };
    $('#btnSave').onclick = () => { if (S.busy) return; sfx('click'); openSaves(); };
    $('#btnGrave').onclick = () => { sfx('click'); openGraveyard(); };
    if ($('#btnTree')) $('#btnTree').onclick = () => { sfx('click'); openFamilyTree(); };
    if ($('#btnScenario')) $('#btnScenario').onclick = () => { unlockAudio(); sfx('click'); openScenarios(); };
    $('#btnAch').onclick = () => { sfx('click'); openAchievements(); };
    $('#btnSettings2').onclick = () => { sfx('click'); openSettings(); };
    $('#btnMenu').onclick = () => { sfx('click'); openSettings(); };
    $('#btnHome').onclick = () => { if (S.busy) return; sfx('click'); showTitle(); };
    $('#btnSound').onclick = () => {
      unlockAudio();
      const on = !(prefs.sfx || prefs.music);
      prefs.sfx = on; prefs.music = on; savePrefs();
      try { KN.Audio.setSfx(on); KN.Audio.setMusic(on); } catch (e) { /* */ }
      updateSoundBtn(); if (on) sfx('click');
    };
    $('#btnAge').onclick = () => onAgeUp();
    $('#btnFF').onclick = () => onFastForward();
    document.addEventListener('pointerdown', unlockAudio, { once: true });
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape' && !$('#modal').hidden) { closeModal(); return; }
      if (!$('#modal').hidden) return;
      if (e.key === 'Enter' && S.primary) { e.preventDefault(); if (S.skipType) S.skipType(); S.primary(); return; }
      if (/^[1-9]$/.test(e.key) && S.choiceFns.length) { const f = S.choiceFns[+e.key - 1]; if (f) { e.preventDefault(); f(); } return; }
      if ((e.key === ' ' || e.code === 'Space') && S.mode === 'play' && !S.busy && $('#sheet').hidden) { e.preventDefault(); onAgeUp(); }
    });
    G().on('change', () => { if (!S.busy) scheduleRender(); });
  }

  // ------------------------------------------------------------------ boot
  function boot() {
    if (!KN.Game || !KN.DATA) { document.body.innerHTML = '<p style="padding:24px;color:#fff">Không tải được trò chơi. Hãy tải lại trang.</p>'; return; }
    S.worldOk = !!(KN.World && KN.World.init($('#world')));
    if (!S.worldOk) $('#fallback').hidden = false;
    else {
      if (prefs.quality) KN.World.setQuality(prefs.quality);
      KN.World.setReducedMotion(reduced);
      KN.World.onFrame(tickBubbles);
      $('#dragHint').hidden = false;
    }
    try { if (KN.Audio) { KN.Audio.setSfx(prefs.sfx); KN.Audio.setMusic(prefs.music); } } catch (e) { /* */ }
    updateSoundBtn();
    bindGlobal();
    G().load();
    showTitle();
    watchUpdates();
    // màn hình chờ: dựng sẵn cảnh 3D rồi mới tắt
    const LD = window.KN_LOADER;
    if (LD) {
      LD.set(82, 'Đang dựng thế giới 3D…');
      if (S.worldOk && KN.World.prewarm) KN.World.prewarm((k) => LD.set(82 + k * 17)).catch(() => {}).then(() => LD.done());
      else LD.done();
    }
    // vào game lần đầu sau khi cập nhật: báo ngắn gọn phiên bản mới
    const latest = (D.CHANGELOG || [])[0];
    // chờ màn hình loading tắt rồi mới báo bản mới
    if (latest && prefs.seenVer !== latest.v) setTimeout(function news() {
      if (document.getElementById('boot')) { setTimeout(news, 500); return; }
      const el = document.createElement('div');
      el.className = 'update-banner'; el.setAttribute('role', 'status');
      el.innerHTML = '<span class="ub-ic">✨</span><span class="ub-tx"><b>Game vừa cập nhật lên v' + esc(latest.v) + '!</b><br><small>' + esc(latest.items[0]) + (latest.items.length > 1 ? ' và ' + (latest.items.length - 1) + ' thay đổi khác.' : '') + '</small></span>' +
        '<button type="button" class="btn btn-primary btn-sm" id="ubNews">Xem</button><button type="button" class="icon-btn" id="ubX" aria-label="Đóng">✕</button>';
      document.body.appendChild(el);
      const done = () => { el.remove(); prefs.seenVer = latest.v; savePrefs(); $('#newsDot').hidden = true; };
      $('#ubNews').onclick = () => { done(); openNews(); };
      $('#ubX').onclick = done;
      setTimeout(() => { if (el.isConnected) el.remove(); }, 15000);
    }, 1500);
  }
  // ---- báo có bản cập nhật: so mã bản dựng đang chạy với version.json trên máy chủ
  function watchUpdates() {
    const mine = window.KN_BUILD; if (!mine || !window.fetch) return;
    let shown = false, busy = false;
    const check = async () => {
      if (shown || busy) return;
      busy = true;
      try {
        const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        if (j && j.build && j.build !== mine) { shown = true; showUpdateBanner(); }
      } catch (e) { /* mất mạng thì thôi */ } finally { busy = false; }
    };
    setTimeout(check, 4000);
    setInterval(check, 3 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  }
  function showUpdateBanner() {
    const latest = (D.CHANGELOG || [])[0];
    const el = document.createElement('div');
    el.className = 'update-banner'; el.setAttribute('role', 'status');
    el.innerHTML = '<span class="ub-ic">🔄</span><span class="ub-tx"><b>Có bản cập nhật mới!</b><br><small>Tải lại trang để chơi bản mới nhất. Tiến độ của bạn đã được tự động lưu.</small></span>' +
      '<button type="button" class="btn btn-primary btn-sm" id="ubReload">Tải lại</button><button type="button" class="icon-btn" id="ubClose" aria-label="Để sau">✕</button>';
    document.body.appendChild(el);
    $('#ubReload').onclick = () => { try { G().save && G().save(); } catch (e) { /* */ } location.reload(); };
    $('#ubClose').onclick = () => el.remove();
    void latest;
  }
  function start(data) {
    try { if (data && data.save) KN.store.set('kn_save_v1', data.save); } catch (e) { /* */ }
    boot();
  }
  try { window.claude?.hot?.snapshot?.(() => ({ save: KN.store.get('kn_save_v1') })); } catch (e) { /* */ }
  if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});

  KN.UI = { showTitle, openCreator, render, toast, openModal, closeModal, enterOnline, updateOnlineTitle, isTitle: () => S.mode === 'title', openFamilyTree, doAction: (fn) => doAction(fn) };
})();
