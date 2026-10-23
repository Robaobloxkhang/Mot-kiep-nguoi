/* Một Kiếp Người — CỘNG ĐỒNG (KN.Community, KN.Weekly):
   💬 chat giữa người chơi (kênh chung + nhắn riêng + ai đang online) · 🎪 sự kiện tuần (cả server chung một chủ đề, có nhiệm vụ & thưởng)
   💒 đám cưới online: cô dâu chú rể tạo thiệp có mã, bạn bè vào dự trong cảnh 3D, viết lời chúc và mừng cưới. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pid = () => { let p = KN.store.get('kn_pid', null); if (!p) { p = 'u' + Math.random().toString(36).slice(2, 12); KN.store.set('kn_pid', p); } return p; };
  const nick = () => KN.store.get('kn_online_name', '') || '';
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const toast = (t, s, ic, k) => { try { KN.UI && KN.UI.toast(t, s || '', ic || '✨', k); } catch (e) { /* */ } };
  const alive = () => { try { return G().hasLife() && !G().isDead(); } catch (e) { return false; } };
  const fmtM = (v) => (KN.DATA && KN.DATA.fmtMoney ? KN.DATA.fmtMoney(v) : v + 'đ');
  async function api(url, body) {
    const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error({ 'slow-down': 'Gửi nhanh quá, chờ chút nhé', 'too-short': 'Nội dung hơi ngắn, viết thêm chút nhé', 'bad-img': 'Ảnh không hợp lệ hoặc quá lớn', forbidden: 'Sai mã quản trị', 'admin-off': 'Chưa đặt mã quản trị trên máy chủ', notfound: 'Không tìm thấy (mã sai hoặc đã hết hạn)', already: 'Bạn đã gửi lời chúc rồi', own: 'Đây là đám cưới của chính bạn', 'not-configured': 'Máy chủ chưa sẵn sàng', empty: 'Chưa nhập gì' }[j.error] || 'Lỗi mạng, thử lại sau');
    return j;
  }

  // ================================================================== 🎪 SỰ KIỆN TUẦN
  // cả server cùng một chủ đề mỗi tuần (tính theo lịch, đổi vào thứ Hai 0h giờ Việt Nam)
  const THEMES = [
    { id: 'foot', icon: '⚽', name: 'Tuần lễ bóng đá', bonus: 'hax', bonusText: 'Tiền thưởng Cúp Hax ×2', tasks: [['haxwin', 3, 'Thắng 3 trận Haxball (đấu máy / online / cúp)'], ['cup', 1, 'Vô địch Cúp Hax 1 lần'], ['minigame', 3, 'Vượt qua 3 minigame trong cuộc đời']] },
    { id: 'travel', icon: '✈️', name: 'Tuần lễ du lịch', bonus: 'travel', bonusText: 'Vé du lịch giảm 30%', tasks: [['travel', 2, 'Đi du lịch 2 chuyến'], ['post', 3, 'Đăng 3 bài lên mạng xã hội'], ['minigame', 2, 'Vượt qua 2 minigame']] },
    { id: 'love', icon: '💘', name: 'Tuần lễ tình yêu', bonus: 'love', bonusText: 'Hẹn hò dễ thành công hơn 10%', tasks: [['marry', 1, 'Kết hôn trong một cuộc đời'], ['wish', 1, 'Đi dự đám cưới online của người khác'], ['post', 2, 'Đăng 2 bài lên mạng xã hội']] },
    { id: 'kind', icon: '💝', name: 'Tuần lễ tử tế', bonus: 'kind', bonusText: 'Phúc đức từ làm từ thiện ×2', tasks: [['charity', 2, 'Làm từ thiện 2 lần'], ['wish', 1, 'Gửi lời chúc ở một đám cưới online'], ['minigame', 2, 'Vượt qua 2 minigame']] },
    { id: 'game', icon: '🎮', name: 'Tuần lễ minigame', bonus: 'mini', bonusText: 'Mọi minigame dễ hơn 5%', tasks: [['minigame', 5, 'Vượt qua 5 minigame'], ['haxwin', 2, 'Thắng 2 trận Haxball'], ['chat', 3, 'Nhắn 3 tin trong kênh chat chung']] },
  ];
  const WEEK = 7 * 864e5, EPOCH = Date.UTC(2024, 0, 1) - 7 * 36e5; // thứ Hai 1/1/2024, 0h giờ VN
  const weekNo = () => Math.floor((Date.now() - EPOCH) / WEEK);
  const theme = () => THEMES[weekNo() % THEMES.length];
  const WKEY = 'kn_weekly';
  function wState() { let s = KN.store.get(WKEY, null); if (!s || s.wk !== weekNo()) { s = { wk: weekNo(), prog: {}, done: {}, all: false }; KN.store.set(WKEY, s); } return s; }
  function track(type, n) {
    try {
      const th = theme(), s = wState(), task = th.tasks.find((t) => t[0] === type); if (!task || s.done[type]) return;
      s.prog[type] = Math.min(task[1], (s.prog[type] || 0) + (n || 1));
      if (s.prog[type] >= task[1]) {
        s.done[type] = true;
        const gift = alive(); if (gift) G().remoteEffect({ happy: 3, money: 3e6 }, th.icon + ' Hoàn thành nhiệm vụ ' + th.name + ': “' + task[2] + '”. Thưởng 3 triệu.', '🎪');
        toast('🎪 Xong nhiệm vụ tuần!', task[2] + (gift ? ' · +3 triệu' : ''), th.icon, 'good'); sfx('cheer');
        if (th.tasks.every((t) => s.done[t[0]]) && !s.all) {
          s.all = true; KN.store.set('kn_weekly_badges', (KN.store.get('kn_weekly_badges', 0) || 0) + 1);
          if (alive()) G().remoteEffect({ happy: 5, money: 1e7 }, '🎖️ Hoàn thành toàn bộ ' + th.name + '! Nhận huy hiệu tuần và 10 triệu.', '🎖️');
          toast('🎖️ Huy hiệu tuần!', 'Hoàn thành toàn bộ ' + th.name, '🎖️', 'good');
        }
      }
      KN.store.set(WKEY, s); refreshDock();
    } catch (e) { /* */ }
  }
  KN.Weekly = { track, theme, bonus: (k) => theme().bonus === k, weekNo };
  function weeklyHtml() {
    const th = theme(), s = wState(), left = WEEK - ((Date.now() - EPOCH) % WEEK), d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5);
    return '<div class="cm-wk"><div class="cm-wk-ic">' + th.icon + '</div><h3>' + th.name + '</h3><p class="p-sub">Cả server cùng chơi một chủ đề · còn ' + d + ' ngày ' + h + ' giờ · 🎖️ huy hiệu đã có: ' + (KN.store.get('kn_weekly_badges', 0) || 0) + '</p>' +
      '<div class="cm-bonus">🎁 Ưu đãi cả tuần: <b>' + th.bonusText + '</b></div>' +
      th.tasks.map((t) => { const p = s.prog[t[0]] || 0, ok = s.done[t[0]]; return '<div class="cm-task' + (ok ? ' ok' : '') + '"><span>' + (ok ? '✅' : '⬜') + ' ' + esc(t[2]) + '</span><b>' + p + '/' + t[1] + '</b><i style="width:' + Math.round(p / t[1] * 100) + '%"></i></div>'; }).join('') +
      '<p class="p-sub">Mỗi nhiệm vụ: +3 triệu vào cuộc đời đang sống. Xong cả 3: huy hiệu tuần + 10 triệu. Tuần sau là: ' + THEMES[(weekNo() + 1) % THEMES.length].icon + ' ' + THEMES[(weekNo() + 1) % THEMES.length].name + '.</p></div>';
  }

  // ================================================================== khung cộng đồng
  let panel = null, tab = 'chat', poll = 0, bgPoll = 0, lastSeq = 0, msgs = [], dms = [], online = [], dmWith = null, unread = 0, dmSeen = KN.store.get('kn_dm_seen', 0) || 0;
  function dock() {
    let d = document.getElementById('cmDock'); if (d) return d;
    d = document.createElement('div'); d.id = 'cmDock'; d.className = 'cm-dock';
    d.innerHTML = '<button type="button" data-t="chat" title="Chat với người chơi khác">💬<i hidden></i></button><button type="button" data-t="week" title="Sự kiện tuần">' + theme().icon + '</button><button type="button" data-t="wed" title="Đám cưới online">💒</button><button type="button" data-fb="1" title="Gửi góp ý, báo lỗi (kèm ảnh)">📝</button>';
    d.querySelectorAll('button').forEach((b) => (b.onclick = () => (b.dataset.fb ? openFeedback() : open(b.dataset.t))));
    document.body.appendChild(d); return d;
  }
  function refreshDock() { const d = document.getElementById('cmDock'); if (!d) return; const i = d.querySelector('i'); i.hidden = !unread; i.textContent = unread > 9 ? '9+' : unread; }
  function close() { if (panel) { panel.remove(); panel = null; } clearInterval(poll); poll = 0; }
  function open(t) {
    if (panel && tab === t) { close(); return; }
    tab = t || tab; sfx('click');
    if (!panel) {
      panel = document.createElement('div'); panel.className = 'cm-panel';
      panel.addEventListener('keydown', (e) => e.stopPropagation()); panel.addEventListener('keyup', (e) => e.stopPropagation());
      document.body.appendChild(panel);
    }
    render();
    clearInterval(poll); poll = 0;
    if (tab === 'chat') { pull(); poll = setInterval(pull, 4000); }
  }
  function head() {
    return '<div class="cm-head"><div class="cm-tabs">' + [['chat', '💬 Chat'], ['week', theme().icon + ' Sự kiện tuần'], ['wed', '💒 Đám cưới']].map(([k, l]) => '<button type="button" data-tab="' + k + '" class="' + (tab === k ? 'on' : '') + '">' + l + '</button>').join('') + '</div><button type="button" class="icon-btn" data-x aria-label="Đóng">✕</button></div>';
  }
  function render() {
    if (!panel) return;
    let body = '';
    if (tab === 'week') body = weeklyHtml();
    else if (tab === 'wed') body = '<div class="cm-wed" id="cmWed">' + wedHtml() + '</div>';
    else body = chatHtml();
    panel.innerHTML = head() + '<div class="cm-body">' + body + '</div>';
    panel.querySelector('[data-x]').onclick = close;
    panel.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => open(b.dataset.tab)));
    if (tab === 'chat') bindChat(); else if (tab === 'wed') bindWed();
  }

  // ================================================================== 💬 CHAT
  function chatHtml() {
    if (!nick()) return '<div class="cm-name"><p>Đặt tên hiển thị để chat với mọi người:</p><input id="cmNick" maxlength="20" placeholder="Tên của bạn" autocomplete="off"><button type="button" class="btn btn-primary btn-sm" id="cmNickOk">Vào chat</button><p class="p-sub">Lịch sự nhé: từ thô tục sẽ bị che, đường link bị xoá. Không chia sẻ thông tin cá nhân.</p></div>';
    const list = dmWith ? dms.filter((m) => m.from === dmWith.pid || m.to === dmWith.pid) : msgs;
    const me = pid();
    const rows = list.slice(-60).map((m) => '<div class="cm-msg' + (m.from === me ? ' me' : '') + '"><b data-dm="' + esc(m.from) + '" data-nick="' + esc(m.nick) + '">' + esc(m.from === me ? 'Bạn' : m.nick) + '</b> ' + esc(m.text) + '</div>').join('') || '<p class="p-sub">' + (dmWith ? 'Chưa có tin nhắn nào với ' + esc(dmWith.nick) + '.' : 'Chưa có ai nói gì. Chào mọi người đi!') + '</p>';
    const convs = {}; dms.forEach((m) => { const o = m.from === me ? { pid: m.to, nick: m.toNick } : { pid: m.from, nick: m.nick }; convs[o.pid] = o; });
    return '<div class="cm-chat"><div class="cm-side"><button type="button" class="' + (!dmWith ? 'on' : '') + '" data-room="">🌍 Kênh chung</button>' +
      Object.values(convs).map((o) => '<button type="button" class="' + (dmWith && dmWith.pid === o.pid ? 'on' : '') + '" data-room="' + esc(o.pid) + '" data-nick="' + esc(o.nick) + '">✉️ ' + esc(o.nick) + '</button>').join('') +
      '<small>🟢 Đang online (' + online.length + ')</small>' + online.slice(0, 30).map((o) => '<button type="button" data-room="' + esc(o.pid) + '" data-nick="' + esc(o.nick) + '">' + esc(o.nick) + '</button>').join('') + '</div>' +
      '<div class="cm-main"><div class="cm-title">' + (dmWith ? '✉️ Nhắn riêng với <b>' + esc(dmWith.nick) + '</b>' : '🌍 Kênh chung · bấm tên ai đó để nhắn riêng') + '</div><div class="cm-log" id="cmLog">' + rows + '</div>' +
      '<form class="cm-form" id="cmForm"><input id="cmText" maxlength="200" placeholder="' + (dmWith ? 'Nhắn cho ' + esc(dmWith.nick) + '…' : 'Nhắn gì đó với mọi người…') + '" autocomplete="off"><button type="submit" class="btn btn-primary btn-sm">Gửi</button></form><p class="cm-err" id="cmErr"></p></div></div>';
  }
  function bindChat() {
    const ok = panel.querySelector('#cmNickOk');
    if (ok) { const go = () => { const v = panel.querySelector('#cmNick').value.replace(/[<>]/g, '').trim().slice(0, 20); if (!v) return; KN.store.set('kn_online_name', v); render(); pull(); }; ok.onclick = go; panel.querySelector('#cmNick').onkeydown = (e) => { if (e.key === 'Enter') go(); }; return; }
    const log = panel.querySelector('#cmLog'); if (log) log.scrollTop = log.scrollHeight;
    panel.querySelectorAll('[data-room]').forEach((b) => (b.onclick = () => { dmWith = b.dataset.room ? { pid: b.dataset.room, nick: b.dataset.nick } : null; render(); }));
    panel.querySelectorAll('.cm-msg b[data-dm]').forEach((b) => (b.onclick = () => { if (b.dataset.dm === pid()) return; dmWith = { pid: b.dataset.dm, nick: b.dataset.nick }; render(); }));
    const f = panel.querySelector('#cmForm'), inp = panel.querySelector('#cmText');
    inp.focus();
    f.onsubmit = async (e) => {
      e.preventDefault(); const text = inp.value.trim(); if (!text) return;
      inp.value = ''; const er = panel.querySelector('#cmErr'); er.textContent = '';
      try { await api('/api/chat', { op: 'send', pid: pid(), nick: nick(), text, to: dmWith ? dmWith.pid : undefined }); if (!dmWith) track('chat'); pull(); } catch (x) { er.textContent = '⚠️ ' + x.message; inp.value = text; }
    };
  }
  async function pull() {
    if (!nick()) return;
    try {
      const j = await api('/api/chat?pid=' + pid() + '&nick=' + encodeURIComponent(nick()) + '&after=' + lastSeq + '&t=' + Date.now());
      if (j.g && j.g.length) { msgs = msgs.concat(j.g).slice(-80); lastSeq = Math.max(lastSeq, ...j.g.map((m) => m.seq)); }
      dms = j.dm || []; online = j.on || [];
      const newest = dms.filter((m) => m.from !== pid()).reduce((a, m) => Math.max(a, m.t), 0);
      if (panel && tab === 'chat') { dmSeen = Math.max(dmSeen, newest); KN.store.set('kn_dm_seen', dmSeen); unread = 0; }
      else unread = dms.filter((m) => m.from !== pid() && m.t > dmSeen).length;
      refreshDock();
      if (panel && tab === 'chat' && !(document.activeElement && document.activeElement.id === 'cmText' && document.activeElement.value)) { const keep = panel.querySelector('#cmText'); const typed = keep ? keep.value : ''; render(); const k2 = panel.querySelector('#cmText'); if (k2 && typed) k2.value = typed; }
    } catch (e) { /* mất mạng: thử lại lượt sau */ }
  }

  // ================================================================== 💒 ĐÁM CƯỚI ONLINE
  let wedView = null; // { code, card, wishes, total }
  function myCard() { try { return G().weddingCard ? G().weddingCard() : null; } catch (e) { return null; } }
  function wedHtml() {
    const c = myCard();
    let h = '<h3>💒 Đám cưới online</h3>';
    if (c && c.code) h += '<div class="cm-card"><p>Thiệp cưới của <b>' + esc(c.a.name) + ' & ' + esc(c.b.name) + '</b></p><div class="cm-code">' + esc(c.code) + '</div><p class="p-sub">Gửi mã này cho bạn bè. Họ mở 💒 → nhập mã → vào dự, viết lời chúc và mừng cưới.</p><div class="btnrow"><button type="button" class="btn btn-soft btn-sm" id="wdCopy">📋 Chép mã</button><button type="button" class="btn btn-soft btn-sm" id="wdBook">📖 Sổ mừng cưới</button><button type="button" class="btn btn-primary btn-sm" id="wdClaim">💰 Nhận tiền mừng</button></div></div>';
    else if (c) h += '<div class="cm-card"><p>Bạn đã kết hôn với <b>' + esc(c.b.name) + '</b>! Tạo thiệp mời online để bạn bè (người chơi thật) vào dự và mừng cưới.</p><button type="button" class="btn btn-primary" id="wdCreate">💌 Tạo thiệp mời</button></div>';
    else h += '<p class="p-sub">Khi nhân vật của bạn kết hôn, bạn có thể tạo thiệp mời online ở đây.</p>';
    h += '<div class="cm-card"><p>Được mời dự đám cưới? Nhập mã thiệp:</p><div class="ol-join"><input id="wdCode" maxlength="6" placeholder="Mã 6 ký tự" autocomplete="off" style="text-transform:uppercase"><button type="button" class="btn btn-soft btn-sm" id="wdJoin">Vào dự</button></div></div>';
    if (wedView) {
      const v = wedView, mine = c && c.code === v.code;
      h += '<div class="cm-card cm-wedview"><p class="cm-couple">💍 <b>' + esc(v.card.a.name) + '</b> & <b>' + esc(v.card.b.name) + '</b><br><small>' + esc(v.card.place || '') + ' · năm ' + v.card.year + ' · ' + v.guests + ' khách · mừng cưới ' + fmtM(v.total) + '</small></p>' +
        (mine ? '' : '<form id="wdWish" class="cm-wishf"><textarea id="wdText" maxlength="160" placeholder="Lời chúc cho cô dâu chú rể…"></textarea><select id="wdGift"><option value="0">Chỉ gửi lời chúc</option>' + [200000, 500000, 1000000, 2000000].map((g) => '<option value="' + g + '"' + (alive() ? '' : ' disabled') + '>Mừng ' + fmtM(g) + '</option>').join('') + '</select><button type="submit" class="btn btn-primary btn-sm">🎁 Gửi</button>' + (alive() ? '' : '<small class="p-sub">Cần đang sống một cuộc đời mới mừng tiền được.</small>') + '</form>') +
        '<div class="cm-wishes">' + (v.wishes.slice().reverse().map((w) => '<div><b>' + esc(w.nick) + '</b>' + (w.gift ? ' <span class="tag good">🧧 ' + fmtM(w.gift) + '</span>' : '') + '<br>' + esc(w.text) + '</div>').join('') || '<p class="p-sub">Chưa có lời chúc nào.</p>') + '</div><p class="cm-err" id="wdErr"></p></div>';
    }
    return h;
  }
  function bindWed() {
    const $ = (s) => panel.querySelector(s), err = (t) => { const e = $('#wdErr') || $('#cmWed'); if ($('#wdErr')) $('#wdErr').textContent = '⚠️ ' + t; else toast('Đám cưới online', t, '⚠️', 'err'); };
    const cr = $('#wdCreate'); if (cr) cr.onclick = async () => { const c = myCard(); if (!c) return; cr.disabled = true; try { const j = await api('/api/wedding', { op: 'create', pid: pid(), card: { a: c.a, b: c.b, year: c.year, place: c.place } }); G().weddingSetCode(j.code); render(); toast('💌 Đã tạo thiệp mời', 'Mã thiệp: ' + j.code, '💒', 'good'); } catch (x) { cr.disabled = false; toast('Không tạo được thiệp', x.message, '⚠️', 'err'); } };
    const cp = $('#wdCopy'); if (cp) cp.onclick = () => { const c = myCard(); try { navigator.clipboard.writeText(c.code); toast('📋 Đã chép mã', c.code, '💒'); } catch (e) { /* */ } };
    const bk = $('#wdBook'); if (bk) bk.onclick = () => load(myCard().code, false);
    const cl = $('#wdClaim'); if (cl) cl.onclick = async () => { try { const j = await api('/api/wedding', { op: 'claim', pid: pid(), code: myCard().code }); if (j.amount > 0 && alive()) { G().remoteEffect({ money: j.amount, happy: 3 }, '🧧 Nhận ' + fmtM(j.amount) + ' tiền mừng cưới từ bạn bè online.', '💒'); toast('🧧 Nhận tiền mừng', fmtM(j.amount), '💒', 'good'); sfx('cheer'); } else toast('Chưa có tiền mừng mới', '', '💒'); } catch (x) { toast('Lỗi', x.message, '⚠️', 'err'); } };
    const jn = $('#wdJoin'); if (jn) { const go = () => { const v = $('#wdCode').value.trim().toUpperCase(); if (v.length === 6) load(v, true); }; jn.onclick = go; $('#wdCode').onkeydown = (e) => { if (e.key === 'Enter') go(); }; }
    const wf = $('#wdWish'); if (wf) wf.onsubmit = async (e) => {
      e.preventDefault(); const gift = +$('#wdGift').value || 0;
      try {
        await api('/api/wedding', { op: 'wish', pid: pid(), nick: nick() || (alive() ? G().view().name : 'Khách'), code: wedView.code, text: $('#wdText').value, gift });
        if (gift && alive()) G().remoteEffect({ money: -gift, happy: 2 }, '💒 Dự đám cưới online của ' + wedView.card.a.name + ' & ' + wedView.card.b.name + ', mừng ' + fmtM(gift) + '.', '💒');
        track('wish'); sfx('cheer'); load(wedView.code, false);
      } catch (x) { err(x.message); }
    };
  }
  async function load(code, show3d) {
    try {
      const j = await api('/api/wedding?code=' + code + '&t=' + Date.now());
      wedView = Object.assign({ code }, j); render();
      if (show3d && KN.World && KN.World.playScene) {
        const a = Object.assign({ id: 'wedA', kind: 'human', anim: 'love', say: 'Cảm ơn đã đến!' }, j.card.a), b = Object.assign({ id: 'wedB', kind: 'human', anim: 'love' }, j.card.b);
        const guest = G().weddingGuest ? G().weddingGuest() : null;
        const sc = { loc: 'wedding', time: 'dusk', npcs: [a, b], fx: 'hearts', shot: 'wide' }; if (guest) sc.player = guest;
        KN.World.playScene(sc);
      }
    } catch (x) { toast('Đám cưới online', x.message, '⚠️', 'err'); }
  }


  // ================================================================== 📝 GÓP Ý (kèm ảnh)
  const FB_KINDS = [['ytuong', '💡 Ý tưởng mới'], ['loi', '🐞 Báo lỗi'], ['gopy', '💬 Góp ý'], ['khac', '✉️ Khác']];
  let fbEl = null;
  // nén ảnh ở trình duyệt: cạnh dài tối đa 1280px, JPEG, giảm dần chất lượng tới khi ≤ ~300KB
  function fbCompress(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('Chỉ nhận file ảnh'));
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        try {
          let w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, 1280 / Math.max(w, h)), q = 0.82, out = '';
          for (let i = 0; i < 8; i++) {
            const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
            const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
            out = c.toDataURL('image/jpeg', q);
            if (out.length <= 300000) break;
            if (q > 0.5) q -= 0.12; else k *= 0.8;
          }
          URL.revokeObjectURL(url);
          if (out.length > 390000) return reject(new Error('Ảnh quá lớn, thử ảnh khác'));
          resolve(out);
        } catch (e) { reject(new Error('Không đọc được ảnh')); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh')); };
      img.src = url;
    });
  }
  function openFeedback() {
    if (fbEl) { fbEl.remove(); fbEl = null; return; }
    sfx('click');
    const ver = (KN.DATA && KN.DATA.CHANGELOG && KN.DATA.CHANGELOG[0] && KN.DATA.CHANGELOG[0].v) || '';
    let kind = 'ytuong'; const imgs = [];
    fbEl = document.createElement('div'); fbEl.className = 'fb-overlay';
    ['keydown', 'keyup'].forEach((ev) => fbEl.addEventListener(ev, (e) => e.stopPropagation()));
    fbEl.innerHTML = '<div class="fb-box"><div class="fb-head"><b>📝 Gửi góp ý cho người làm game</b><button type="button" class="fb-x" data-x aria-label="Đóng">✖</button></div>' +
      '<div class="fb-body"><div class="fb-chips" id="fbKinds">' + FB_KINDS.map((k) => '<button type="button" data-k="' + k[0] + '" class="' + (k[0] === kind ? 'on' : '') + '">' + k[1] + '</button>').join('') + '</div>' +
      '<label class="fb-l" for="fbText">Bạn muốn nói gì? <small id="fbCnt">0/1500</small></label><textarea id="fbText" maxlength="1500" rows="6" placeholder="Mô tả ý tưởng, lỗi gặp phải (xảy ra lúc nào, ở tuổi mấy, bấm gì) hay điều bạn muốn game có thêm…"></textarea>' +
      '<div class="fb-row"><div><label class="fb-l" for="fbName">Tên (không bắt buộc)</label><input id="fbName" maxlength="30" autocomplete="off" value="' + esc(nick()) + '" placeholder="Ẩn danh"></div><div><label class="fb-l" for="fbContact">Liên hệ lại (không bắt buộc)</label><input id="fbContact" maxlength="80" autocomplete="off" placeholder="Zalo, email…"></div></div>' +
      '<div class="fb-l">Ảnh minh hoạ (tối đa 2, tự nén nhỏ)</div><div class="fb-imgs" id="fbImgs"></div><input type="file" id="fbFile" accept="image/*" multiple hidden>' +
      '<p class="fb-msg" id="fbMsg"></p><div class="fb-btns"><button type="button" class="btn btn-soft btn-sm" id="fbAdmin">🔑 Quản trị</button><button type="button" class="btn btn-primary" id="fbSend">📨 Gửi góp ý</button></div>' +
      '<div class="fb-admin" id="fbAdm" hidden></div></div></div>';
    document.body.appendChild(fbEl);
    const $ = (id) => fbEl.querySelector('#' + id), msg = (t, bad) => { $('fbMsg').textContent = t; $('fbMsg').className = 'fb-msg' + (bad ? ' bad' : t ? ' ok' : ''); };
    const closeFb = () => { if (fbEl) { fbEl.remove(); fbEl = null; } };
    fbEl.querySelector('[data-x]').onclick = closeFb;
    fbEl.addEventListener('pointerdown', (e) => { if (e.target === fbEl) closeFb(); });
    $('fbKinds').onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b) return; kind = b.dataset.k; $('fbKinds').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); sfx('click'); };
    $('fbText').oninput = () => ($('fbCnt').textContent = $('fbText').value.length + '/1500');
    const drawImgs = () => {
      $('fbImgs').innerHTML = imgs.map((d, i) => '<div class="fb-th"><img alt="Ảnh ' + (i + 1) + '" src="' + d + '"><button type="button" data-rm="' + i + '" aria-label="Bỏ ảnh">✖</button></div>').join('') + (imgs.length < 2 ? '<button type="button" class="fb-add" id="fbPick">🖼️<span>Thêm ảnh</span></button>' : '');
      const pk = $('fbPick'); if (pk) pk.onclick = () => $('fbFile').click();
      $('fbImgs').querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { imgs.splice(+b.dataset.rm, 1); drawImgs(); }));
    };
    drawImgs();
    const addFiles = async (files) => {
      for (const f of Array.from(files || [])) {
        if (imgs.length >= 2) break;
        try { msg('Đang xử lý ảnh…'); imgs.push(await fbCompress(f)); msg(''); } catch (e) { msg(e.message, true); }
      }
      drawImgs();
    };
    $('fbFile').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };
    // dán ảnh bằng Ctrl+V
    fbEl.addEventListener('paste', (e) => { const fs = Array.from((e.clipboardData && e.clipboardData.files) || []).filter((f) => /^image\//.test(f.type)); if (fs.length) { e.preventDefault(); addFiles(fs); } });
    $('fbSend').onclick = async () => {
      const text = $('fbText').value.trim();
      if (text.length < 5) { msg('Hãy viết ít nhất vài chữ nhé.', true); $('fbText').focus(); return; }
      $('fbSend').disabled = true; msg('Đang gửi…');
      try {
        await api('/api/feedback', { op: 'send', pid: pid(), name: $('fbName').value, kind, text, contact: $('fbContact').value, ver, imgs });
        sfx('cheer'); toast('Đã gửi góp ý', 'Cảm ơn bạn! Người làm game sẽ đọc.', '📝', 'good');
        if ($('fbName').value) KN.store.set('kn_online_name', $('fbName').value.trim().slice(0, 20));
        closeFb();
      } catch (e) { $('fbSend').disabled = false; msg(e.message === 'Lỗi mạng' ? 'Không gửi được (mạng lỗi hoặc máy chủ chưa bật). Thử lại sau nhé.' : e.message, true); }
    };
    // ---- khu quản trị: chủ game nhập mã (biến môi trường FEEDBACK_ADMIN_KEY) để đọc góp ý
    $('fbAdmin').onclick = () => {
      const a = $('fbAdm'); a.hidden = !a.hidden; if (a.hidden) return;
      const saved = (() => { try { return sessionStorage.getItem('kn_fb_key') || ''; } catch (e) { return ''; } })();
      a.innerHTML = '<div class="fb-row"><input id="fbKey" type="password" autocomplete="off" placeholder="Mã quản trị" value="' + esc(saved) + '"><button type="button" class="btn btn-soft btn-sm" id="fbLoad">Xem góp ý</button></div><div id="fbList"></div>';
      const load = async () => {
        const key = a.querySelector('#fbKey').value.trim(); if (!key) return;
        try { sessionStorage.setItem('kn_fb_key', key); } catch (e) { /* */ }
        const list = a.querySelector('#fbList'); list.textContent = 'Đang tải…';
        try {
          const j = await api('/api/feedback?key=' + encodeURIComponent(key) + '&n=40&t=' + Date.now());
          const KI = { ytuong: '💡', loi: '🐞', gopy: '💬', khac: '✉️' };
          list.innerHTML = j.items.length ? j.items.map((it) => '<div class="fb-it" data-id="' + esc(it.id) + '"><div class="fb-it-h"><b>' + (KI[it.kind] || '✉️') + ' ' + esc(it.name) + '</b><small>' + new Date(it.t).toLocaleString('vi-VN') + (it.ver ? ' · v' + esc(it.ver) : '') + '</small></div><p>' + esc(it.text) + '</p>' +
            (it.contact ? '<small>📞 ' + esc(it.contact) + '</small>' : '') + '<div class="fb-it-b">' + (it.imgs ? '<button type="button" class="btn btn-soft btn-sm" data-im="' + esc(it.id) + '" data-n="' + it.imgs + '">🖼️ Xem ' + it.imgs + ' ảnh</button>' : '') + '<button type="button" class="btn btn-ghost btn-sm" data-del="' + esc(it.id) + '">🗑️ Xoá</button></div><div class="fb-it-i"></div></div>').join('') : '<p class="p-sub">Chưa có góp ý nào.</p>';
          list.querySelectorAll('[data-im]').forEach((b) => (b.onclick = async () => {
            const box = b.closest('.fb-it').querySelector('.fb-it-i'); b.disabled = true; box.innerHTML = '';
            for (let i = 0; i < +b.dataset.n; i++) { try { const r = await api('/api/feedback?key=' + encodeURIComponent(key) + '&img=' + b.dataset.im + '&i=' + i); const im = document.createElement('img'); im.src = r.img; im.alt = 'Ảnh góp ý'; box.appendChild(im); } catch (e) { /* */ } }
          }));
          list.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Bấm lần nữa để xoá'; return; } try { await api('/api/feedback', { op: 'del', key, id: b.dataset.del }); b.closest('.fb-it').remove(); } catch (e) { toast('Góp ý', e.message, '⚠️', 'err'); } }));
        } catch (e) { list.textContent = e.message === 'Lỗi mạng' ? 'Sai mã quản trị, hoặc chưa đặt FEEDBACK_ADMIN_KEY trên máy chủ.' : e.message; }
      };
      a.querySelector('#fbLoad').onclick = load; if (saved) load();
    };
    setTimeout(() => { const t = $('fbText'); t && t.focus(); }, 60);
  }

  // ================================================================== khởi động
  function boot() {
    dock();
    // kiểm tra tin nhắn riêng mới mỗi 45 giây (chỉ khi đã đặt tên chat)
    bgPoll = setInterval(() => { if (!document.hidden && nick() && !(panel && tab === 'chat')) pull(); }, 45000);
    setTimeout(() => { if (nick()) pull(); }, 4000);
  }
  KN.Community = { open, close, track, openFeedback };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
