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

  const STAT_META = [
    { k: 'happy', label: 'Hạnh phúc', icon: '😊', c: 'var(--c-happy)' },
    { k: 'health', label: 'Sức khỏe', icon: '❤️', c: 'var(--c-health)' },
    { k: 'smarts', label: 'Trí tuệ', icon: '🧠', c: 'var(--c-smarts)' },
    { k: 'looks', label: 'Ngoại hình', icon: '✨', c: 'var(--c-looks)' },
  ];
  const DELTA_META = { happy: ['😊', 'Hạnh phúc'], health: ['❤️', 'Sức khỏe'], smarts: ['🧠', 'Trí tuệ'], looks: ['✨', 'Ngoại hình'], karma: ['☯️', 'Đức'], money: ['💰', ''] };
  const TABS = [{ id: 'log', icon: '📜', label: 'Nhật ký' }, { id: 'act', icon: '🎯', label: 'Hoạt động' }, { id: 'people', icon: '❤️', label: 'Quan hệ' }, { id: 'career', icon: '🎓', label: 'Học & Làm' }, { id: 'money', icon: '💰', label: 'Tài sản' }];

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
    $('#btnAge').hidden = m !== 'play';
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
    const btn = $('#btnContinue');
    const v = G().hasLife() ? G().view() : null;
    if (v && v.alive) { btn.hidden = false; btn.textContent = 'Tiếp tục: ' + v.name + ', ' + v.age + ' tuổi'; }
    else if (v && !v.alive) { btn.hidden = false; btn.textContent = 'Xem lại: ' + v.name + ' (đã khuất)'; }
    else btn.hidden = true;
    const m = G().meta();
    $('#btnGrave').textContent = '🕯️ Nghĩa trang' + (m.lives.length ? ' (' + m.lives.length + ')' : '');
    $('#btnAch').textContent = '🏆 Thành tựu ' + Object.keys(m.achievements).length + '/' + D.ACHIEVEMENTS.length;
    mood('calm');
    startDemo();
  }
  function startDemo() {
    stopDemo();
    const step = () => { if (S.mode === 'title') playScene(G().demoScene(S.demoN++)); };
    step();
    S.demoTimer = setInterval(step, 7000);
  }
  function stopDemo() { if (S.demoTimer) clearInterval(S.demoTimer); S.demoTimer = null; }

  // ------------------------------------------------------------------ creator
  function openCreator() {
    const g = U.pick(['m', 'f']);
    S.create = Object.assign({ gender: g, city: U.pick(D.CITIES).id, app: D.randomAppearance(g, 20), goals: U.shuffle(G().goalsList()).slice(0, 3).map((x) => x.id), perks: [] }, D.randomName(g));
    setMode('create');
    renderCreator();
    previewCreator('wave');
    mood('happy');
  }
  function renderCreator() {
    const c = S.create, a = c.app;
    const sw = (key, list) => list.map((col) => '<button type="button" class="sw" style="--c:' + col + '" data-k="' + key + '" data-v="' + col + '" aria-pressed="' + (a[key] === col) + '" aria-label="' + col + '"></button>').join('');
    const chips = (key, list) => list.map((o) => '<button type="button" data-k="' + key + '" data-v="' + o.id + '" aria-pressed="' + (a[key] === o.id) + '">' + esc(o.label) + '</button>').join('');
    $('#viewCreate').innerHTML =
      '<div class="create-wrap">' +
      '<h2>Kiếp mới</h2><p>Bạn sẽ chào đời trong một gia đình Việt. Chọn vài điều về mình — phần còn lại, đời sẽ lo.</p>' +
      '<div class="field"><span class="lbl">Giới tính</span><div class="seg" role="group"><button type="button" data-g="m" aria-pressed="' + (c.gender === 'm') + '">Nam</button><button type="button" data-g="f" aria-pressed="' + (c.gender === 'f') + '">Nữ</button></div></div>' +
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
      goalsField(c) + perksField(c) +
      '</div>' +
      '<div class="create-foot"><button type="button" id="cBack" class="btn btn-ghost">Quay lại</button><button type="button" id="cGo" class="btn btn-primary btn-lg">👶 Chào đời</button></div>';
    const root = $('#viewCreate');
    root.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { sfx('click'); const g = b.dataset.g; if (g === c.gender) return; const keep = { skin: a.skin, hair: a.hair }; c.gender = g; Object.assign(c, D.randomName(g)); c.app = Object.assign(D.randomAppearance(g, 20), keep); renderCreator(); previewCreator('wave'); });
    root.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { sfx('click'); a[b.dataset.k] = b.dataset.v; if (b.dataset.k === 'topStyle' && b.dataset.v === 'aodai') a.bottom = '#f5f5f2'; renderCreator(); previewCreator(b.dataset.k === 'topStyle' ? 'dance' : 'cheer'); });
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
      r = safe(() => G().newLife({ gender: c.gender, firstName: c.firstName, middleName: c.middleName, lastName: c.lastName || 'Nguyễn', city: c.city, appearance: c.app, goals: c.goals, perks: c.perks }));
      if (!r) return;
      S.seenLog = 0; S.prevStats = null; S.prevAge = null; S.moneyShown = null;
      setMode('play'); render();
    });
    if (!r) { showTitle(); return; }
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
    renderHud(v);
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
      box.innerHTML = STAT_META.map((m) => '<div class="stat" data-s="' + m.k + '" style="--c:' + m.c + '"><div class="stat-top"><span>' + m.icon + ' ' + m.label + '</span><b>0</b></div><div class="stat-bar"><div class="stat-fill"></div></div></div>').join('');
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
      body.innerHTML = { log: tabLog, act: tabAct, people: tabPeople, career: tabCareer, money: tabMoney }[S.tab](v);
    } catch (e) { console.error(e); body.innerHTML = '<div class="empty">Không hiển thị được mục này.</div>'; }
    bindTab(body, v);
    if (S.tab !== 'log') body.scrollTop = top;
  }
  function tabLog(v) {
    let h = '<div class="sec-title">Mục tiêu kiếp này <small>' + v.goals.filter((g) => g.done).length + '/' + v.goals.length + '</small></div><div class="chipsel" style="margin-bottom:12px">' + v.goals.map((g) => '<span class="goal' + (g.done ? ' done' : '') + '">' + (g.done ? '✓ ' : '◇ ') + esc(g.text) + '</span>').join('') + '</div>';
    if (v.illnesses.length) h += '<div class="card" style="margin-bottom:12px;border-color:rgba(255,92,92,.35)">🤒 Đang mắc: <b>' + v.illnesses.map((i) => esc(i.name)).join(', ') + '</b><div class="p-sub">Vào tab Hoạt động → Đi khám bệnh để chữa trị.</div></div>';
    const log = v.log;
    const groups = [];
    for (let i = log.length - 1; i >= 0; i--) { const e = log[i]; let g = groups[groups.length - 1]; if (!g || g.age !== e.age) { g = { age: e.age, year: e.year, items: [] }; groups.push(g); } g.items.push({ e, i }); }
    const seen = S.seenLog;
    h += groups.slice(0, 60).map((g) => '<div class="log-age">' + g.age + ' tuổi <small>Năm ' + g.year + '</small></div>' + g.items.map(({ e, i }) => '<div class="log-item ' + esc(e.tone) + (i >= seen ? ' new' : '') + '"><span class="li">' + esc(e.icon || '•') + '</span><span>' + esc(e.text) + '</span></div>').join('')).join('');
    S.seenLog = log.length;
    return h;
  }
  function tabAct(v) {
    const acts = G().activities();
    if (!acts.length) return '<div class="empty">Chưa có hoạt động nào.</div>';
    const cats = {};
    acts.forEach((a) => (cats[a.categoryLabel] = cats[a.categoryLabel] || []).push(a));
    return Object.keys(cats).map((c) => '<div class="sec-title">' + esc(c) + '</div><div class="grid2">' + cats[c].map((a) =>
      '<button type="button" class="card act" data-act="' + a.id + '"' + (a.available ? '' : ' disabled') + '><span class="ai">' + a.icon + '</span><span class="an">' + esc(a.label) + '</span><span class="ac' + (a.available ? '' : ' warn') + '">' + esc(a.available ? a.costText : a.reason) + '</span></button>').join('') + '</div>').join('');
  }
  function avatar(p) {
    if (p.kind !== 'human') return '<span class="avatar pet">' + (p.kind === 'cat' ? '🐱' : '🐶') + '</span>';
    const a = p.appearance || {};
    const hair = p.age >= 60 ? U.mixHex(a.hair || '#222', '#dcdcdc', Math.min(1, (p.age - 55) / 25)) : a.hair;
    return '<span class="avatar" style="--skin:' + (a.skin || '#e6b48f') + ';--hair:' + (a.hairStyle === 'bald' ? (a.skin || '#e6b48f') : hair) + ';--top:' + (a.top || '#888') + ';--ring:' + (p.gender === 'f' ? '#ff7eb6' : '#5cc8ff') + '"><span class="eyes"><i></i><i></i></span></span>';
  }
  function tabPeople(v) {
    const order = ['spouse', 'partner', 'child', 'grandchild', 'mother', 'father', 'grandparent', 'sibling', 'friend', 'pet', 'ex'];
    const ppl = v.people.slice().sort((a, b) => (b.alive - a.alive) || order.indexOf(a.role) - order.indexOf(b.role));
    if (!ppl.length) return '<div class="empty">Bạn đang một mình. Hãy kết bạn qua các hoạt động nhé.</div>';
    return '<div class="sec-title">Những người thương <small>chạm để tương tác</small></div>' + ppl.map((p) =>
      '<button type="button" class="card person' + (p.alive ? '' : ' dead') + '" data-person="' + p.id + '"' + (p.alive ? '' : ' disabled') + '>' + avatar(p) +
      '<span style="min-width:0"><span class="p-name">' + esc(p.name) + '</span> <span class="p-sub">· ' + esc(p.roleLabel) + ' · ' + p.age + ' tuổi' + (p.alive ? '' : ' · đã mất') + '</span>' +
      '<span class="relbar' + (p.relation < 30 ? ' low' : '') + '"><i style="width:' + p.relation + '%"></i></span></span><span class="p-rel">' + (p.alive ? p.relation + '%' : '🕯️') + '</span></button>').join('');
  }
  function btns(actions, attr) {
    return '<div class="btnrow">' + actions.map((a) => '<button type="button" class="btn btn-soft btn-sm" ' + attr + '="' + a.id + '"' + (a.disabled ? ' disabled title="' + esc(a.reason || '') + '"' : '') + '>' + a.icon + ' ' + esc(a.label) + '</button>').join('') + '</div>';
  }
  function tabCareer(v) {
    const e = v.education;
    let h = '<div class="sec-title">Học vấn</div><div class="card">';
    h += '<div class="kv"><span>Hiện tại</span><b>' + esc(e.label) + '</b></div>';
    if (e.inSchool) h += '<div class="kv"><span>Học lực</span><b>' + e.performance + '/100</b></div><div class="meter"><i style="width:' + e.performance + '%"></i></div>';
    if (e.degrees.length) h += '<div class="kv"><span>Bằng cấp</span><b>' + esc(e.degrees.join(', ')) + '</b></div>';
    if (e.actions.length) h += btns(e.actions, 'data-edu');
    h += '</div>';
    h += '<div class="sec-title">Sự nghiệp</div>';
    if (v.job) {
      const j = v.job;
      h += '<div class="card"><div class="kv"><span>' + j.icon + ' ' + esc(j.title) + '</span><b>' + esc(j.levelTitle) + '</b></div><div class="kv"><span>Lương</span><b style="color:var(--c-money)">' + esc(j.salaryText) + '</b></div><div class="kv"><span>Thâm niên</span><b>' + j.years + ' năm · cấp ' + (j.level + 1) + '/' + (j.maxLevel + 1) + '</b></div><div class="kv"><span>Hiệu suất</span><b>' + j.performance + '/100</b></div><div class="meter"><i style="width:' + j.performance + '%"></i></div>' + btns(j.actions, 'data-job') + '</div>';
    } else if (v.retired) h += '<div class="card">🪴 Bạn đã nghỉ hưu' + (v.pensionText ? ' — lương hưu ' + esc(v.pensionText) : '') + '.</div>';
    else h += '<div class="card p-sub">' + (v.age < 14 ? 'Còn nhỏ lắm, lo học hành vui chơi đã!' : 'Bạn chưa có việc làm. Xem các vị trí đang tuyển bên dưới.') + '</div>';
    const jobs = G().jobListings();
    if (jobs.length) {
      const ok = jobs.filter((j) => j.eligible), no = jobs.filter((j) => !j.eligible);
      h += '<div class="sec-title">Việc làm đang tuyển <small>' + ok.length + ' phù hợp</small></div>';
      h += ok.map(jobRow).join('') || '<div class="empty">Chưa có vị trí phù hợp với bạn lúc này.</div>';
      if (no.length) h += '<details class="more"><summary>Xem ' + no.length + ' nghề khác và điều kiện</summary>' + no.map(jobRow).join('') + '</details>';
    }
    return h;
    function jobRow(j) { return '<div class="card job' + (j.eligible ? '' : ' no') + '"><span class="ji">' + j.icon + '</span><span style="min-width:0"><span class="jt">' + esc(j.title) + '</span><br><span class="js">' + esc(j.salaryText) + ' · ' + esc(j.reqText) + '</span>' + (j.eligible ? '' : '<br><span class="jr">' + esc(j.reason) + '</span>') + '</span>' + (j.eligible ? '<button type="button" class="btn btn-primary btn-sm" data-apply="' + j.id + '">Ứng tuyển</button>' : '') + '</div>'; }
  }
  function tabMoney(v) {
    let h = '<div class="bank"><div><small>Tài khoản</small><div class="big' + (v.money < 0 ? ' neg' : '') + '">' + esc(v.moneyText) + '</div></div><small>' + (v.assets.length ? 'Tài sản: ' + esc(D.fmtMoney(v.assets.reduce((s, a) => s + a.value, 0))) : 'Chưa có tài sản') + '</small></div>';
    if (v.age >= 18 && v.alive) h += '<div class="sec-title">Mức sống <small>chi tiêu và hạnh phúc mỗi năm</small></div><div class="lifestyle">' + v.lifestyles.map((l) => '<button type="button" class="ls" data-ls="' + l.id + '" aria-pressed="' + (v.lifestyle === l.id) + '"><span class="li">' + l.icon + '</span><b>' + esc(l.label) + '</b><small>' + esc(l.desc) + '</small></button>').join('') + '</div>';
    if (v.assets.length) h += '<div class="sec-title">Tài sản của bạn</div>' + v.assets.map((a) => '<div class="card asset"><span class="ai">' + a.icon + '</span><span><b>' + esc(a.name) + '</b><br><span class="p-sub">Giá trị ' + esc(a.valueText) + '</span></span><button type="button" class="btn btn-soft btn-sm" data-sell="' + a.id + '">Bán</button></div>').join('');
    const items = G().shopItems();
    if (!items.length) return h + '<div class="empty">Lớn thêm chút nữa mới tự mua sắm được nhé.</div>';
    const groups = { phone: 'Điện thoại', motorbike: 'Xe máy', car: 'Ô tô', house: 'Nhà cửa', land: 'Đất đai', gold: 'Vàng', luxury: 'Đồ xa xỉ' };
    Object.keys(groups).forEach((t) => {
      const list = items.filter((i) => i.type === t); if (!list.length) return;
      h += '<div class="sec-title">' + groups[t] + '</div>' + list.map((i) => '<div class="card item"><span class="ai">' + i.icon + '</span><span style="min-width:0"><span class="in">' + esc(i.name) + '</span><br><span class="id">' + esc(i.desc) + '</span></span><span style="text-align:right"><span class="price">' + esc(i.priceText) + '</span><br>' +
        (i.owned ? '<span class="p-sub">Đã có</span>' : '<button type="button" class="btn btn-primary btn-sm" data-buy="' + i.id + '"' + (i.affordable ? '' : ' disabled title="' + esc(i.reason || '') + '"') + '>Mua</button>') + '</span></div>').join('');
    });
    return h;
  }
  function bindTab(body, v) {
    body.querySelectorAll('[data-act]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().doActivity(b.dataset.act)); });
    body.querySelectorAll('[data-person]').forEach((b) => b.onclick = () => { sfx('click'); openPerson(b.dataset.person); });
    body.querySelectorAll('[data-edu]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(b.dataset.edu === 'dropout', 'Bỏ học?', 'Bố mẹ sẽ buồn lắm đấy. Bạn chắc chứ?', () => doAction(() => G().eduAction(b.dataset.edu))); });
    body.querySelectorAll('[data-job]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(b.dataset.job === 'quit' || b.dataset.job === 'retire', b.dataset.job === 'quit' ? 'Nghỉ việc?' : 'Nghỉ hưu?', 'Quyết định này không thể rút lại ngay.', () => doAction(() => G().jobAction(b.dataset.job))); });
    body.querySelectorAll('[data-apply]').forEach((b) => b.onclick = () => { sfx('click'); doAction(() => G().applyJob(b.dataset.apply)); });
    body.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => { sfx('coin'); doAction(() => G().buy(b.dataset.buy)); });
    body.querySelectorAll('[data-sell]').forEach((b) => b.onclick = () => { sfx('click'); confirmIf(true, 'Bán tài sản?', 'Bạn sẽ nhận lại giá trị hiện tại của món này.', () => doAction(() => G().sell(b.dataset.sell))); });
    body.querySelectorAll('[data-ls]').forEach((b) => b.onclick = () => { if (b.getAttribute('aria-pressed') === 'true') return; sfx('click'); const r = safe(() => G().setLifestyle(b.dataset.ls)); if (r && r.ok) toast(r.title, r.text, r.icon); else if (r) toast('Không đổi được', r.reason, '⛔', 'err'); render(); });
  }

  // ------------------------------------------------------------------ people action sheet
  function openPerson(id) {
    const v = G().view(); const p = v && v.people.find((x) => x.id === id);
    if (!p || !p.alive) return;
    openModal('<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">' + avatar(p) + '<div><h3 style="margin:0">' + esc(p.name) + '</h3><div class="sub" style="margin:0">' + esc(p.roleLabel) + ' · ' + p.age + ' tuổi · thân thiết ' + p.relation + '%</div></div></div>' +
      '<div class="relbar' + (p.relation < 30 ? ' low' : '') + '" style="margin-bottom:14px"><i style="width:' + p.relation + '%"></i></div>' +
      '<div class="actsheet">' + p.actions.map((a) => '<button type="button" class="btn btn-soft" data-ia="' + a.id + '"' + (a.disabled ? ' disabled' : '') + '>' + a.icon + ' ' + esc(a.label) + (a.disabled ? ' <small style="margin-left:auto;color:var(--fg-faint)">' + esc(a.reason) + '</small>' : '') + '</button>').join('') + '</div>');
    $('#modalBox').querySelectorAll('[data-ia]').forEach((b) => b.onclick = () => { sfx('click'); const act = b.dataset.ia; if (act === 'gift') { openGiftPicker(id); return; } const danger = act === 'breakup' || act === 'divorce' || act === 'argue'; closeModal(); confirmIf(danger && act !== 'argue', act === 'divorce' ? 'Ly hôn?' : 'Chia tay?', 'Có những lời đã nói ra thì khó rút lại.', () => doAction(() => G().interact(id, act))); });
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
    const v = G().view();
    const card = showSheet(
      '<div class="ev-head"><span class="ev-icon">' + esc(ev.icon || '✨') + '</span><div><div class="ev-kicker">Tình huống · ' + v.age + ' tuổi</div><h2 class="ev-title">' + esc(ev.title) + '</h2></div></div>' +
      '<p class="ev-text"></p><div class="ev-choices"></div>');
    await typeText(card.querySelector('.ev-text'), ev.text);
    coach('choice');
    const box = card.querySelector('.ev-choices');
    if (ev.many) box.classList.add('many');
    box.innerHTML = ev.choices.map((c, i) => '<button type="button" class="choice" style="animation-delay:' + (Math.min(i, 8) * 60) + 'ms" data-i="' + c.index + '"' + (c.disabled ? ' disabled' : '') + '><span class="num">' + (i < 9 ? i + 1 : '•') + '</span><span>' + esc(c.label) + (c.hint ? '<em class="choice-hint">' + esc(c.hint) + '</em>' : '') + (c.disabled && c.reason ? '<small>' + esc(c.reason) + '</small>' : '') + '</span></button>').join('');
    const picked = await new Promise((res) => {
      S.choiceFns = ev.choices.map((c) => (c.disabled ? null : () => res(c)));
      box.querySelectorAll('.choice').forEach((b, i) => b.onclick = () => { if (!ev.choices[i].disabled) res(ev.choices[i]); });
    });
    S.choiceFns = [];
    sfx('click');
    const r = safe(() => G().choose(ev.uid, picked.index));
    if (!r) { hideSheet(); return; }
    if (r.ok === false) { toast('Không chọn được', r.reason, '⛔', 'err'); hideSheet(); return; }
    playScene(r.scene);
    toneSfx(r.tone);
    celebrate(r);
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
  function setAgeBtn() { const b = $('#btnAge'); b.disabled = S.busy; }
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
    } finally { S.busy = false; setAgeBtn(); render(); }
  }
  async function onAgeUp() {
    if (S.busy || S.mode !== 'play') return;
    unlockAudio();
    S.busy = true; setAgeBtn();
    try {
      if (G().pending().length) { await runPending(); return; }
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
    } finally { S.busy = false; setAgeBtn(); render(); }
  }

  // ------------------------------------------------------------------ death
  async function deathFlow() {
    hideSheet();
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
      '<div class="death-actions">' + info.heirs.map((h) => '<button type="button" class="btn btn-primary" data-heir="' + h.id + '">🌳 Sống tiếp làm con: ' + esc(h.name) + ' (' + h.age + ' tuổi)</button>').join('') +
      '<button type="button" class="btn ' + (info.heirs.length ? 'btn-ghost' : 'btn-primary') + '" data-newlife>👶 Bắt đầu kiếp mới</button><button type="button" class="btn btn-soft" data-home>Về màn hình chính</button></div></div>';
    const target = info.score, el = $('#scoreNum'), t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 1600); el.textContent = Math.round(target * U.ease.outCubic(k)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    $('#viewDeath').querySelectorAll('[data-heir]').forEach((b) => b.onclick = () => continueAs(b.dataset.heir));
    $('#viewDeath').querySelector('[data-newlife]').onclick = () => { sfx('click'); openCreator(); };
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
      '<div class="toggle"><span>💾 Lưu & tải game<br><small class="p-sub">Ô lưu và mã lưu để chơi tiếp trên máy khác</small></span><button type="button" class="btn btn-soft btn-sm" id="tSaves">Mở</button></div>' +
      '<div class="toggle"><span>🗑️ Xóa toàn bộ dữ liệu<br><small class="p-sub">Cuộc đời hiện tại, ô lưu, nghĩa trang và thành tựu</small></span><button type="button" class="btn btn-danger btn-sm" id="tWipe">Xóa</button></div>' +
      '<p class="sub" style="margin-top:14px">Một Kiếp Người — mỗi lựa chọn đều có hậu quả. Phím tắt: <b>Space</b> lớn thêm 1 tuổi, <b>1–9</b> chọn, <b>Enter</b> tiếp tục.</p>');
    $('#tSaves').onclick = () => { sfx('click'); openSaves(); };
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
    $('#btnSave').onclick = () => { if (S.busy) return; sfx('click'); openSaves(); };
    $('#btnGrave').onclick = () => { sfx('click'); openGraveyard(); };
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
  }
  function start(data) {
    try { if (data && data.save) KN.store.set('kn_save_v1', data.save); } catch (e) { /* */ }
    boot();
  }
  try { window.claude?.hot?.snapshot?.(() => ({ save: KN.store.get('kn_save_v1') })); } catch (e) { /* */ }
  if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});

  KN.UI = { showTitle, openCreator, render, toast };
})();
