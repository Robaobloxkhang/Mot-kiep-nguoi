/* Một Kiếp Người — chế độ solo online (KN.Online)
 * Máy chủ phòng chơi chạy ngay trên Vercel (api/room.js + Upstash Redis). Trình duyệt chỉ gọi
 * HTTPS cổng 443 như lướt web bình thường, nên mạng nào cũng vào được (4G, wifi nhà/trường/công ty).
 * Mỗi máy hỏi trạng thái phòng ~2 giây/lần; gửi tin thì nhận lại trạng thái mới ngay lập tức.
 * Chơi một mình không gọi máy chủ nào cả.
 * Luật: mỗi mốc 10 năm tuổi, ai tới trước phải chờ những người còn sống tới cùng mốc → hiện bảng so sánh.
 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const API = 'api/room';
  const HIST = 'kn_online_hist';
  const MAX_PLAYERS = 6;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = () => KN.Game, UI = () => KN.UI;
  const money = (n) => (KN.DATA && KN.DATA.fmtShort ? KN.DATA.fmtShort(n) : String(n));

  const O = {
    code: null, myId: null, myName: '', hostId: null, isHost: false, lastSeq: 0, polling: null, pingT: 0, fails: 0,
    players: {}, // id → { name, snap, left }
    phase: 'idle', // idle | lobby | playing | ended
    nextCp: 10, boards: [], chat: [], unread: 0, panel: null, acted: {}, lifeStarted: false, myDone: false,
  };
  const randId = () => 'p' + Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, '').padEnd(8, '0');
  const ERR = {
    'not-configured': 'Máy chủ online chưa được bật (thiếu kho dữ liệu trên Vercel).',
    notfound: 'Không tìm thấy phòng này. Kiểm tra lại mã (phòng tự hết hạn sau 6 giờ).',
    started: 'Phòng đã bắt đầu chơi, không vào thêm được.',
    full: 'Phòng đã đủ ' + MAX_PLAYERS + ' người.',
  };

  // ------------------------------------------------------------------ gọi máy chủ
  async function call(body) {
    let r;
    try { r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' }); }
    catch (e) { throw new Error('Không có mạng hoặc không kết nối được máy chủ. Thử lại nhé.'); }
    let j = {}; try { j = await r.json(); } catch (e) { /* */ }
    if (!r.ok || j.error) throw new Error(ERR[j.error] || 'Máy chủ báo lỗi (' + (j.error || r.status) + '). Thử lại sau ít phút.');
    return j;
  }
  async function createRoom(name) {
    reset();
    O.myId = randId(); O.myName = name;
    const j = await call({ op: 'create', id: O.myId, name });
    O.code = j.code; O.phase = 'lobby';
    applyRoom(j.room); startPolling(); saveSession();
  }
  async function joinRoom(code, name) {
    reset();
    O.myId = randId(); O.myName = name; O.code = code.toUpperCase().trim();
    const j = await call({ op: 'join', code: O.code, id: O.myId, name });
    O.phase = 'lobby';
    applyRoom(j.room); startPolling(); saveSession();
  }
  // gửi một tin (chat, quà, trạng thái nhân vật…) rồi áp ngay trạng thái mới nhận về
  function send(m) {
    if (!O.code) return;
    call({ op: 'msg', code: O.code, id: O.myId, m }).then((j) => applyRoom(j.room)).catch((e) => {
      if (/Không tìm thấy phòng/.test(e.message)) { toast('Phòng đã đóng', 'Phòng hết hạn hoặc không còn tồn tại. Bạn vẫn chơi tiếp offline.', '📴'); leave(true); }
      else if (m.t === 'chat') toast('Chưa gửi được', e.message, '⚠️');
    });
  }
  // hỏi trạng thái phòng định kỳ (chậm lại khi tab chạy nền)
  function startPolling() {
    clearTimeout(O.polling);
    const loop = async () => {
      if (O.phase === 'idle' || !O.code) return;
      try {
        const r = await fetch(API + '?code=' + O.code + '&t=' + Date.now(), { cache: 'no-store' });
        if (r.status === 404) { toast('Phòng đã đóng', 'Phòng hết hạn hoặc không còn tồn tại. Bạn vẫn chơi tiếp offline.', '📴'); leave(true); return; }
        const j = await r.json();
        if (j.room) { applyRoom(j.room); O.fails = 0; }
      } catch (e) { if (++O.fails === 5) toast('Mạng chập chờn', 'Đang thử kết nối lại phòng…', '📶'); }
      // báo “còn online” 15 giây/lần (máy chủ coi im lặng 45 giây là mất kết nối)
      if (Date.now() - O.pingT > 15000) { O.pingT = Date.now(); send({ t: 'ping' }); }
      O.polling = setTimeout(loop, document.hidden ? 8000 : 2000);
    };
    O.polling = setTimeout(loop, 1200);
  }
  // nhận trạng thái phòng từ máy chủ: người chơi, giai đoạn, tin nhắn mới
  function applyRoom(r) {
    if (!r || O.phase === 'idle') return;
    O.hostId = r.host; O.isHost = r.host === O.myId;
    const players = {};
    Object.keys(r.players || {}).forEach((k) => { const p = r.players[k]; players[k] = { name: p.name, snap: p.snap || null, left: !!p.left, n: p.n || 0 }; });
    O.players = players;
    if (r.fam) O.fam = parseFam(r.fam);
    syncSiblings();
    const msgs = Array.isArray(r.msgs) ? r.msgs : [];
    const fresh = msgs.filter((m) => m.seq > O.lastSeq).sort((a, b) => a.seq - b.seq);
    const first = O.lastSeq === 0;
    fresh.forEach((m) => {
      O.lastSeq = Math.max(O.lastSeq, m.seq);
      if (m.t === 'sys') O.chat.push({ sys: true, text: m.text });
      else if (m.t === 'start') { if (!first || r.phase === 'playing') onMsg(m); }
      else if (!first || m.t === 'chat' || m.t === 'emote') onMsg(Object.assign({ quiet: first }, m));
    });
    // lỡ mất tin “bắt đầu” (ví dụ mạng rớt) thì vẫn vào trận theo trạng thái phòng
    if (r.phase === 'playing' && O.phase === 'lobby') onMsg({ t: 'start' });
    refresh();
    checkBoards();
  }
  function sysChat(text) { O.chat.push({ sys: true, text }); refresh(); }
  // sống chung một nhà: đối thủ trong phòng là anh chị em ruột của nhân vật mình
  function syncSiblings() {
    if (!O.fam || O.phase !== 'playing' || !O.lifeStarted || !onlineMode() || !G().onlineSibling) return;
    Object.keys(O.players).forEach((k) => { if (k === O.myId) return; const p = O.players[k], s = p.snap; if (s && s.fullName) G().onlineSibling({ pid: k, name: s.fullName, gender: s.gender, age: s.age, alive: s.alive !== false, nick: p.name }); });
  }
  function makeFamily() {
    const D = KN.DATA, fa = D.randomName('m'), mo = D.randomName('f'), fAge = 24 + Math.floor(Math.random() * 12);
    const born = (KN.store.get('kn_prefs', {}) || {}).born || 2026;
    return { lastName: fa.lastName, city: D.CITIES[Math.floor(Math.random() * D.CITIES.length)].id, born, father: { firstName: fa.firstName, middleName: fa.middleName, age: fAge }, mother: { firstName: mo.firstName, middleName: mo.middleName, age: Math.max(20, fAge - Math.floor(Math.random() * 5)) } };
  }
  function parseFam(f) { if (!f) return null; if (typeof f === 'object') return f; try { return JSON.parse(f); } catch (e) { return null; } }
  function familyOpts() { return O.fam && O.phase === 'playing' && onlineMode() ? { family: O.fam, familyHost: O.isHost } : {}; }
  // tin dành cho mọi người (cả chủ phòng)
  function onMsg(m) {
    if (m.t === 'start') { if (m.fam) O.fam = parseFam(m.fam); if (O.phase === 'playing' && O.lifeStarted) return; O.phase = 'playing'; O.nextCp = 10; O.boards = []; O.lifeStarted = false; saveSession(); startMyLife(); return; }
    const mine = m.from === O.myId;
    if (m.t === 'chat') { O.chat.push({ name: m.name, text: m.text, me: mine }); if (O.panel !== 'chat' && !mine && !m.quiet) { O.unread++; toast('💬 ' + m.name, m.text, '💬'); } return; }
    if (m.t === 'emote') { O.chat.push({ name: m.name, text: m.text, me: mine, emote: true }); if (!mine && !m.quiet) toast(m.name, m.text, m.text); return; }
    if (m.t === 'act' && SPECIAL(m.kind)) { specialAct(m, m.quiet); return; }
    if (m.t === 'act' && m.to === O.myId && !mine) receiveAct(m);
    if (m.t === 'act') { const A = ACTS[m.kind]; if (A) O.chat.push({ sys: true, text: m.name + ' ' + A.verb + ' ' + ((O.players[m.to] || {}).name || '?') + ' ' + A.icon }); }
  }

  // ------------------------------------------------------------------ vòng chơi
  // nhân vật online nằm ở ô lưu riêng: kiếp offline đang chơi dở được cất nguyên vẹn
  const onlineMode = () => !G().getMode || G().getMode() === 'online';
  function startMyLife() {
    UI().closeModal && UI().closeModal();
    toast('Trận đấu bắt đầu!', 'Tạo nhân vật và sống thật lâu, thật giàu. Mỗi 10 năm sẽ so bảng. Kiếp offline của bạn vẫn được giữ riêng.', '🏁');
    if (G().setMode) G().setMode('online', { fresh: true });
    UI().openCreator();
  }
  function onLifeStart() {
    if (O.phase !== 'playing' || O.lifeStarted || !onlineMode()) return;
    O.lifeStarted = true; O.myDone = false; O.acted = {};
    saveSession();
    pushSnap(true);
  }
  // quay lại trận từ màn hình chính: cộng các món quà/khiêu khích nhận được lúc vắng mặt
  function onResume() {
    const q = O.queue || []; O.queue = [];
    q.forEach((m) => receiveAct(m));
    if (q.length) toast('Trong lúc bạn vắng mặt', q.length + ' tương tác từ đối thủ đã được cộng vào nhân vật.', '📬');
    pushSnap(true);
  }
  function inMatch() { return O.phase === 'playing'; }
  // gửi trạng thái nhân vật: gửi ngay ở mốc 10 năm / khi mất, còn lại gom tối đa 2,5 giây/lần
  let snapTimer = null, snapAt = 0;
  function pushSnap(now) {
    if (O.phase !== 'playing' || !O.lifeStarted || O.myDone || !onlineMode()) return;
    const s = G().onlineSnapshot(); if (!s) return;
    const urgent = now || !s.alive || s.age % 10 === 0;
    // kiểm tra lại lúc gửi: nếu người chơi đã chuyển sang offline thì không gửi nhầm nhân vật offline
    const go = () => { snapTimer = null; if (!onlineMode() || O.myDone) return; snapAt = Date.now(); const x = G().onlineSnapshot(); if (x) send({ t: 'snap', snap: x }); };
    if (urgent || Date.now() - snapAt > 2500) { clearTimeout(snapTimer); go(); }
    else if (!snapTimer) snapTimer = setTimeout(go, 2500 - (Date.now() - snapAt));
  }
  function alivePlayers() { return Object.keys(O.players).filter((k) => !O.players[k].left && !(O.players[k].snap && !O.players[k].snap.alive)); }
  // chặn lên tuổi khi mình đã chạm mốc mà còn người chưa tới
  function gate() {
    if (O.phase !== 'playing' || !O.lifeStarted || O.myDone || !onlineMode()) return null;
    const me = G().view(); if (!me || !me.alive) return null;
    if (me.age < O.nextCp) return null;
    const behind = alivePlayers().filter((k) => k !== O.myId).map((k) => O.players[k]).filter((p) => !p.snap || p.snap.age < O.nextCp);
    if (!behind.length) return null;
    return 'Bạn đã tới mốc ' + O.nextCp + ' tuổi. Đang chờ ' + behind.map((p) => p.name + (p.snap ? ' (' + p.snap.age + ' tuổi)' : ' (đang tạo nhân vật)')).join(', ') + '…';
  }
  function afterAge() { pushSnap(); refresh(); }
  // mất là hết lượt trong trận (sống tiếp làm con cháu không tính vào trận solo)
  function onDeath() { if (O.phase !== 'playing' || !O.lifeStarted || O.myDone || !onlineMode()) return; pushSnap(true); O.myDone = true; saveSession(); refresh(); }
  // hiện bảng khi mọi người còn sống đã qua mốc; hết người sống → bảng chung cuộc
  function checkBoards() {
    if (O.phase !== 'playing') return;
    const ids = Object.keys(O.players).filter((k) => !O.players[k].left);
    if (!ids.length || ids.some((k) => !O.players[k].snap)) return;
    const living = ids.filter((k) => O.players[k].snap.alive);
    if (!living.length) { endMatch(); return; }
    while (living.every((k) => O.players[k].snap.age >= O.nextCp)) {
      const rows = ids.map((k) => Object.assign({ id: k, name: O.players[k].name }, O.players[k].snap));
      O.boards.push({ cp: O.nextCp, rows });
      O.nextCp += 10;
      saveSession();
      showBoard(O.nextCp - 10, rows, false);
      // chủ phòng tung một sự kiện chung cho cả phòng ở mỗi mốc (60%)
      if (O.isHost && Math.random() < 0.6 && G().worldKinds) { const ks = G().worldKinds(); setTimeout(() => send({ t: 'act', to: '*', kind: 'w:' + ks[Math.floor(Math.random() * ks.length)] }), 1500); }
    }
    renderBar();
  }
  function endMatch() {
    if (O.phase === 'ended') return;
    O.phase = 'ended'; clearSession();
    const rows = Object.keys(O.players).map((k) => Object.assign({ id: k, name: O.players[k].name, left: O.players[k].left }, O.players[k].snap || {}));
    showBoard(null, rows, true);
    // lưu lịch sử trên máy
    const res = ranking(rows);
    const myRank = res.findIndex((r) => r.id === O.myId) + 1;
    const hist = (KN.store.get(HIST, []) || []).slice(0, 19);
    hist.unshift({ at: Date.now(), code: O.code, rank: myRank, of: rows.length, win: myRank === 1, players: rows.map((r) => ({ name: r.name, age: r.age, worth: r.worth, score: r.score })) });
    KN.store.set(HIST, hist);
  }
  // xếp hạng chung: thọ (40%) + tài sản (40%) + điểm kiếp người (20%), theo thứ hạng trong phòng
  function ranking(rows) {
    const list = rows.filter((r) => r.age != null);
    const rankBy = (key) => { const s = list.slice().sort((a, b) => (b[key] || 0) - (a[key] || 0)); return (r) => s.indexOf(r); };
    const rA = rankBy('age'), rW = rankBy('worth'), rS = rankBy('score');
    return list.map((r) => Object.assign({}, r, { pts: (list.length - rA(r)) * 4 + (list.length - rW(r)) * 4 + (list.length - rS(r)) * 2 })).sort((a, b) => b.pts - a.pts);
  }

  // ------------------------------------------------------------------ tương tác đối thủ
  const ACTS = {
    gift: { icon: '🎁', label: 'Tặng quà', verb: 'tặng quà cho', mine: { karma: 1 }, them: { happy: 3 }, text: (n) => n + ' gửi tặng bạn một món quà. Vui cả ngày!' },
    bless: { icon: '🙏', label: 'Chúc phúc', verb: 'chúc phúc', mine: { karma: 1 }, them: { happy: 2, health: 1 }, text: (n) => n + ' chúc bạn sống lâu, sống khỏe.' },
    taunt: { icon: '😈', label: 'Khiêu khích', verb: 'khiêu khích', mine: { karma: -1 }, them: { happy: -3 }, text: (n) => n + ' khoe khoang, chọc tức bạn. Hơi cay!' },
    joke: { icon: '🤡', label: 'Đố vui', verb: 'đố vui', mine: {}, them: { happy: 1 }, text: (n) => n + ' gửi một câu đố hài hước, bạn cười ngặt nghẽo.' },
  };
  function doAct(to, kind) {
    if (!onlineMode()) { toast('Bạn đang ở chế độ offline', 'Quay lại trận online để tương tác với đối thủ.', '⚔️'); return; }
    const me = G().view(); if (!me || !me.alive) return;
    const key = kind + '|' + to + '|' + me.age;
    if (O.acted[key]) { toast('Từ từ đã', 'Mỗi năm chỉ được ' + ACTS[kind].label.toLowerCase() + ' một lần với mỗi người.', '⏳'); return; }
    O.acted[key] = 1;
    if (ACTS[kind].mine.karma) G().remoteEffect(ACTS[kind].mine, 'Bạn ' + ACTS[kind].verb + ' ' + O.players[to].name + '.', ACTS[kind].icon);
    send({ t: 'act', to, kind });
    refresh();
  }
  // ---- tương tác “lớn”: cầu hôn, ly hôn, làm ăn chung, sự kiện chung cả phòng
  // prop/pyes/pno/div · inv:N (rủ góp N triệu) / iok:N (đồng ý) / ino · w:<loại> (sự kiện chung do chủ phòng phát)
  // dc:<game>:<cược> thách đấu · da:<game>:<cược> nhận lời · dn từ chối · dr:<mã trận>:<điểm 0..1000> nộp điểm
  // mny:N cho anh chị em N triệu · pd:mother|father bố/mẹ chung qua đời (chủ phòng báo)
  const SPECIAL = (k) => /^(prop|pyes|pno|div|ino|dn|inv:\d+|iok:\d+|w:[a-z]+|d[ca]:[a-z]+:\d+|dr:\d+:\d+|mny:\d+|pd:(mother|father))$/.test(String(k || ''));
  const nameOf = (id) => (O.players[id] || {}).name || '?';
  const charOf = (id) => { const s = (O.players[id] || {}).snap; return s ? s.fullName : nameOf(id); };
  const INVEST = [[0, 'Dự án đổ bể, mất trắng', '💸'], [0.5, 'Làm ăn thua lỗ, mất một nửa vốn', '📉'], [1, 'Hòa vốn, coi như học phí kinh nghiệm', '😐'], [1.6, 'Làm ăn có lãi', '📈'], [2.5, 'Trúng lớn, lãi gấp rưỡi vốn', '🚀']];
  function seededPick(seq, arr) { let h = (seq * 2654435761) >>> 0; h ^= h >>> 15; return arr[h % arr.length]; }
  function specialAct(m, quiet) {
    const k = m.kind, mine = m.from === O.myId, toMe = m.to === O.myId, involved = mine || toMe;
    const other = mine ? m.to : m.from;
    // tác động lên nhân vật: chỉ khi đang ở trận online, không thì giữ lại tới khi quay về
    const apply = (fn) => { if (quiet) return; if (!onlineMode() || !O.lifeStarted) { (O.queue = O.queue || []).push(m); return; } fn(); UI().render && UI().render(); pushSnap(); };
    if (k.startsWith('w:')) {
      if (m.from !== O.hostId) return;
      const kind = k.slice(2);
      apply(() => { const r = G().worldEvent(kind); if (r) toast(r.icon + ' ' + r.title, r.text + ' (cả phòng cùng chịu)', r.icon); });
      const WN = { bao: '🌀 Siêu bão', lu: '🌊 Lũ lịch sử', khunghoang: '📉 Khủng hoảng kinh tế', dich: '🦠 Đại dịch', bung: '📈 Kinh tế bùng nổ', worldcup: '⚽ Việt Nam dự World Cup', tet: '🧧 Thưởng Tết kỷ lục', nangnong: '🔥 Nắng nóng kỷ lục' };
      O.chat.push({ sys: true, text: '🌐 Sự kiện chung cả phòng: ' + (WN[kind] || kind) });
      return;
    }
    if (k === 'prop') {
      O.chat.push({ sys: true, text: '💍 ' + m.name + ' cầu hôn ' + nameOf(m.to) + '!' });
      if (toMe && !quiet) askYesNo('💍 Lời cầu hôn', esc(charOf(m.from)) + ' (' + esc(m.name) + ') quỳ xuống cầu hôn bạn. Bạn có đồng ý?', 'Đồng ý 💍', 'Từ chối', (yes) => {
        if (yes && !onlineMode()) { toast('Bạn đang ở chế độ offline', 'Quay lại trận online rồi trả lời nhé.', '⚔️'); return; }
        send({ t: 'act', to: m.from, kind: yes ? 'pyes' : 'pno' });
      });
      return;
    }
    if (k === 'pyes') {
      O.chat.push({ sys: true, text: '💒 ' + nameOf(m.to) + ' và ' + m.name + ' đã nên duyên vợ chồng!' });
      if (!involved) return;
      const s = (O.players[other] || {}).snap || {};
      apply(() => { const r = G().onlineMarry({ name: s.fullName || nameOf(other), gender: s.gender, age: s.age, pid: other, nick: nameOf(other) }); if (r && r.ok) toast('💒 Đám cưới!', 'Bạn và ' + (s.fullName || nameOf(other)) + ' đã thành vợ chồng.', '💍'); else if (r) toast('Chưa cưới được', r.reason, '💔'); });
      return;
    }
    if (k === 'pno') { O.chat.push({ sys: true, text: '💔 ' + m.name + ' đã từ chối lời cầu hôn.' }); if (toMe && !quiet) toast('💔 Bị từ chối', m.name + ' chưa sẵn sàng. Thôi thì làm bạn vậy.', '💔'); return; }
    if (k === 'div') {
      O.chat.push({ sys: true, text: '💔 ' + m.name + ' và ' + nameOf(m.to) + ' đã ly hôn.' });
      if (involved) apply(() => { G().onlineDivorce(other, mine ? 'Bạn đệ đơn ly hôn ' + charOf(other) + '. Tài sản chung chia đôi.' : charOf(other) + ' đệ đơn ly hôn bạn. Tài sản chung chia đôi.'); toast('💔 Ly hôn', 'Mỗi người mất 25% tài sản.', '💔'); });
      return;
    }
    if (k.startsWith('inv:')) {
      const n = +k.slice(4);
      O.chat.push({ sys: true, text: '🤝 ' + m.name + ' rủ ' + nameOf(m.to) + ' góp vốn ' + n + ' triệu làm ăn.' });
      if (toMe && !quiet) askYesNo('🤝 Rủ làm ăn chung', esc(m.name) + ' rủ bạn mỗi người góp <b>' + n + ' triệu</b> mở công ty chung. Có thể lãi gấp rưỡi, cũng có thể mất trắng. Hai bên cùng chịu chung một kết quả.', 'Góp vốn', 'Thôi', (yes) => {
        if (yes && (!onlineMode() || !G().view() || G().view().money < n * 1e6)) { toast('Không đủ điều kiện', !onlineMode() ? 'Quay lại trận online trước đã.' : 'Bạn không đủ ' + n + ' triệu tiền mặt.', '⛔'); yes = false; }
        send({ t: 'act', to: m.from, kind: yes ? 'iok:' + n : 'ino' });
      });
      return;
    }
    if (k === 'ino') { O.chat.push({ sys: true, text: '🙅 ' + m.name + ' không góp vốn.' }); if (toMe && !quiet) toast('Không thành', m.name + ' từ chối làm ăn chung.', '🙅'); return; }
    // ---- sống chung một nhà
    if (k.startsWith('mny:')) {
      const n = +k.slice(4);
      O.chat.push({ sys: true, text: '💸 ' + m.name + ' cho ' + nameOf(m.to) + ' ' + n + ' triệu.' });
      if (toMe) apply(() => { G().onlineMoney(n * 1e6, '💸 ' + charOf(m.from) + ' cho bạn ' + n + ' triệu. Anh em trong nhà đùm bọc nhau.', '💸'); toast('💸 Được cho tiền', m.name + ' gửi bạn ' + n + ' triệu.', '💸'); });
      return;
    }
    if (k.startsWith('pd:')) {
      if (mine || m.from !== O.hostId) return;
      const role = k.slice(3);
      apply(() => { const r = G().onlineParentDied(role); if (r) toast(r.title, r.text, '🕯️'); });
      return;
    }
    // ---- thách đấu minigame
    if (k.startsWith('dc:')) {
      const [, type, st] = k.split(':'), n = +st;
      O.chat.push({ sys: true, text: '⚔️ ' + m.name + ' thách ' + nameOf(m.to) + ' đấu ' + gameName(type) + (n ? ' (cược ' + n + ' triệu)' : '') });
      if (toMe && !quiet) askYesNo('⚔️ Lời thách đấu', esc(m.name) + ' thách bạn đấu <b>' + esc(gameName(type)) + '</b>' + (n ? ', mỗi bên cược <b>' + n + ' triệu</b>. Ai điểm cao hơn ăn trọn.' : ' cho vui. Người thắng vui hơn, người thua hơi cay.') + ' Hai bên chơi cùng một đề.', 'Nhận lời ⚔️', 'Từ chối', (yes) => {
        if (yes && (!onlineMode() || !O.lifeStarted || !G().view() || !G().view().alive)) { toast('Chưa đấu được', 'Bạn cần đang sống trong trận online.', '⚔️'); yes = false; }
        if (yes && n && (G().view().money || 0) < n * 1e6) { toast('Không đủ tiền cược', 'Bạn không có đủ ' + n + ' triệu tiền mặt.', '⛔'); yes = false; }
        send({ t: 'act', to: m.from, kind: yes ? 'da:' + type + ':' + n : 'dn' });
      });
      return;
    }
    if (k === 'dn') { O.chat.push({ sys: true, text: '🙅 ' + m.name + ' từ chối lời thách đấu.' }); if (toMe && !quiet) toast('🙅 Bị từ chối', m.name + ' chưa muốn đấu lúc này.', '🙅'); return; }
    if (k.startsWith('da:')) {
      const [, type, st] = k.split(':');
      O.chat.push({ sys: true, text: '⚔️ ' + m.name + ' nhận lời đấu ' + gameName(type) + ' với ' + nameOf(m.to) + '!' });
      if (!involved || quiet || !KN.Mini || !m.seq) return;
      O.duels = O.duels || {};
      if (O.duels[m.seq]) return;
      const d = (O.duels[m.seq] = { id: m.seq, type, stake: +st, other, mine: null, theirs: null, done: false });
      startDuel(d);
      return;
    }
    if (k.startsWith('dr:')) {
      const [, id, sc] = k.split(':'), d = (O.duels || {})[id];
      if (!d || quiet) return;
      if (mine) d.mine = +sc; else if (m.from === d.other) d.theirs = +sc;
      resolveDuel(d);
    }
    if (k.startsWith('iok:')) {
      const n = +k.slice(4), r = seededPick(m.seq || 1, INVEST);
      O.chat.push({ sys: true, text: '🤝 ' + nameOf(m.to) + ' & ' + m.name + ' làm ăn chung ' + n + ' triệu: ' + r[1].toLowerCase() + ' ' + r[2] });
      if (involved) apply(() => { G().onlineMoney(Math.round(n * 1e6 * (r[0] - 1)), r[2] + ' Làm ăn chung với ' + charOf(other) + ' (mỗi người góp ' + n + ' triệu): ' + r[1].toLowerCase() + '.', r[2]); toast(r[2] + ' Làm ăn chung', r[1] + (r[0] !== 1 ? ' · ' + (r[0] > 1 ? '+' : '') + Math.round(n * (r[0] - 1)) + ' triệu' : ''), r[2]); });
    }
  }
  const gameName = (type) => (KN.Mini && KN.Mini.NAME[type]) || type;
  // vào trận đấu: chờ minigame khác (nếu đang chơi) xong rồi mới mở, cùng hạt giống ngẫu nhiên với đối thủ
  function startDuel(d) {
    const go = async () => {
      if (d.done) return;
      if (KN.Mini.busy()) { setTimeout(go, 1500); return; }
      UI().closeModal && UI().closeModal(); O.panel = null;
      const sc = await KN.Mini.run(KN.Mini.planDuel(d.type, d.id * 7919 + 13, nameOf(d.other)));
      if (d.done) return;
      d.mine = Math.round(clamp01(sc) * 1000);
      send({ t: 'act', to: d.other, kind: 'dr:' + d.id + ':' + d.mine });
      if (d.theirs == null) toast('⏳ Đã nộp điểm', 'Chờ ' + nameOf(d.other) + ' chơi xong…', '⚔️');
      resolveDuel(d);
    };
    toast('⚔️ Vào trận!', gameName(d.type) + ' với ' + nameOf(d.other), '⚔️');
    setTimeout(go, 800);
    // đối thủ bỏ dở quá 4 phút thì hủy kèo
    setTimeout(() => { if (!d.done) { d.done = true; toast('⌛ Hủy kèo', 'Trận đấu với ' + nameOf(d.other) + ' quá lâu chưa có kết quả, kèo được hủy.', '⚔️'); } }, 240000);
  }
  const clamp01 = (v) => Math.max(0, Math.min(1, +v || 0));
  function resolveDuel(d) {
    if (d.done || d.mine == null || d.theirs == null) return;
    d.done = true;
    const win = d.mine > d.theirs, tie = d.mine === d.theirs, on = d.stake;
    const pct = (v) => Math.round(v / 10) + '%';
    const text = (tie ? '🤝 Hòa' : win ? '🏆 Bạn thắng' : '😵 Bạn thua') + ' trận ' + gameName(d.type) + ' với ' + charOf(d.other) + ' (' + pct(d.mine) + ' – ' + pct(d.theirs) + ')' + (on && !tie ? (win ? ', ẵm ' : ', mất ') + on + ' triệu tiền cược.' : '.');
    O.chat.push({ sys: true, text: '⚔️ ' + (tie ? 'Hòa: ' + O.myName + ' & ' + nameOf(d.other) : (win ? O.myName : nameOf(d.other)) + ' thắng trận ' + gameName(d.type)) + ' (' + pct(win ? d.mine : d.theirs) + ' – ' + pct(win ? d.theirs : d.mine) + ')' });
    if (onlineMode() && O.lifeStarted) {
      if (on && !tie) G().onlineMoney((win ? 1 : -1) * on * 1e6, text, '⚔️');
      else G().remoteEffect({ happy: tie ? 1 : win ? 4 : -2 }, text, '⚔️');
      UI().render && UI().render(); pushSnap();
    }
    toast(tie ? '🤝 Hòa!' : win ? '🏆 Chiến thắng!' : '😵 Thua rồi', text, '⚔️');
    refresh();
  }
  function duelPicker(to) {
    const me = G().view(); if (!me || !me.alive) return;
    const cash = Math.floor((me.money || 0) / 1e6);
    O.panel = null; // bảng tương tác tự làm mới sẽ không đè lên hộp chọn
    UI().openModal('<div class="online"><h3>⚔️ Thách đấu ' + esc(nameOf(to)) + '</h3><p class="sub">Hai bên chơi cùng một minigame, cùng một đề. Chỉ số nhân vật vẫn có tác dụng như khi chơi thường. Ai điểm cao hơn thắng.</p>' +
      '<label class="ol-field">Tiền cược mỗi bên (triệu, 0 = đấu cho vui · bạn có ' + cash + ' triệu)<input id="duStake" type="number" min="0" max="' + Math.min(cash, 99999) + '" value="0"></label>' +
      '<div class="du-grid">' + KN.Mini.DUEL_TYPES.map((t) => '<button type="button" class="btn btn-soft" data-du="' + t + '">' + esc(KN.Mini.NAME[t]) + '</button>').join('') + '</div></div>');
    document.querySelectorAll('[data-du]').forEach((b) => (b.onclick = () => {
      const n = Math.max(0, Math.floor(+document.getElementById('duStake').value || 0));
      if (n > cash || n > 99999) { toast('Không đủ tiền cược', 'Bạn chỉ có ' + cash + ' triệu tiền mặt.', '⛔'); return; }
      UI().closeModal(); O.panel = null;
      send({ t: 'act', to, kind: 'dc:' + b.dataset.du + ':' + n });
      toast('⚔️ Đã gửi lời thách đấu', 'Chờ ' + nameOf(to) + ' nhận lời…', '⚔️');
    }));
  }
  // nút cầu hôn / ly hôn / rủ làm ăn trong bảng tương tác
  function bigActs(k, s, me) {
    if (!s || !s.alive || me.age < 18 || s.age < 18) return '';
    const mySpouse = G().onlineSpouse && G().onlineSpouse();
    const b = (kind, label) => '<button type="button" class="btn btn-soft btn-sm" data-big="' + kind + '" data-to="' + k + '">' + label + '</button>';
    return '<div class="ol-acts">' + (mySpouse === k ? b('div', '💔 Ly hôn') : !mySpouse && !me.married && !s.married ? b('prop', '💍 Cầu hôn') : '') + b('inv', '🤝 Rủ làm ăn chung') + '</div>';
  }
  function askYesNo(title, html, yesL, noL, cb) {
    UI().openModal('<div class="online"><h3>' + title + '</h3><p class="sub">' + html + '</p><div class="btnrow" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" id="olNo">' + noL + '</button><button type="button" class="btn btn-primary" id="olYes">' + yesL + '</button></div></div>');
    let done = false; const fin = (v) => { if (done) return; done = true; UI().closeModal(); cb(v); };
    document.getElementById('olYes').onclick = () => fin(true);
    document.getElementById('olNo').onclick = () => fin(false);
  }
  function receiveAct(m) {
    if (SPECIAL(m.kind)) { specialAct(m, false); return; }
    const A = ACTS[m.kind]; if (!A) return;
    // đang chơi offline: giữ lại, về trận mới cộng (không đụng vào nhân vật offline)
    if (!onlineMode() || !O.lifeStarted) { (O.queue = O.queue || []).push(m); toast(A.icon + ' ' + m.name, A.text(m.name) + ' (sẽ cộng khi bạn quay lại trận online)', A.icon); return; }
    G().remoteEffect(A.them, A.text(m.name), A.icon);
    toast(A.icon + ' ' + m.name, A.text(m.name), A.icon);
    UI().render && UI().render();
    pushSnap();
  }

  // ------------------------------------------------------------------ giao diện
  function toast(t, b, i) { UI() && UI().toast && UI().toast(t, b, i); }
  function reset() {
    clearTimeout(O.polling); clearTimeout(snapTimer); snapTimer = null;
    Object.assign(O, { code: null, myId: null, myName: '', hostId: null, isHost: false, lastSeq: 0, polling: null, pingT: 0, fails: 0, players: {}, phase: 'idle', nextCp: 10, boards: [], chat: [], unread: 0, panel: null, acted: {}, lifeStarted: false, myDone: false, fam: null, famMode: false, duels: {} });
  }
  // ---- phiên chơi: lỡ tải lại trang / đóng nhầm tab thì vào lại đúng phòng, đúng nhân vật
  // lưu theo từng tab (sessionStorage): tải lại trang vẫn còn, mở 2 tab cùng máy không giẫm lên nhau
  const SESS = 'kn_online_sess';
  const sess = {
    get() { try { return JSON.parse(window.sessionStorage.getItem(SESS) || 'null'); } catch (e) { return null; } },
    set(v) { try { if (v) window.sessionStorage.setItem(SESS, JSON.stringify(v)); else window.sessionStorage.removeItem(SESS); } catch (e) { /* */ } },
  };
  function saveSession() { if (O.code && O.myId) sess.set({ code: O.code, id: O.myId, name: O.myName, started: O.lifeStarted, done: O.myDone, nextCp: O.nextCp, ts: Date.now() }); }
  function clearSession() { sess.set(null); }
  async function tryRejoin() {
    const s = sess.get();
    if (!s || !s.code || !s.id || Date.now() - (s.ts || 0) > 6 * 3600e3 || O.phase !== 'idle') return;
    try {
      const j = await call({ op: 'join', code: s.code, id: s.id, name: s.name });
      const r = j.room;
      Object.assign(O, { code: s.code, myId: s.id, myName: s.name, phase: r.phase === 'playing' ? 'playing' : 'lobby', lifeStarted: !!s.started, myDone: !!s.done, nextCp: s.nextCp || 10, lastSeq: r.v || 0 });
      applyRoom(r); startPolling(); saveSession();
      toast('Đã vào lại phòng ' + s.code, O.phase === 'playing' ? 'Bấm “⚔️ Tiếp tục trận online” để quay lại nhân vật đang đấu.' : 'Bạn đang ở sảnh chờ.', '🌐');
      if (UI().isTitle && UI().isTitle()) UI().updateOnlineTitle();
    } catch (e) { clearSession(); }
  }
  setTimeout(() => { try { tryRejoin(); } catch (e) { /* */ } }, 1500);
  function leave(silent) {
    clearSession();
    if (O.code && O.myId && !silent) { try { fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'msg', code: O.code, id: O.myId, m: { t: 'leave' } }), keepalive: true }); } catch (e) { /* */ } }
    reset();
    const bar = document.getElementById('onlineBar'); if (bar) bar.hidden = true;
    if (!silent) toast('Đã rời phòng', 'Bạn tiếp tục chơi offline.', '📴');
    if (UI().closeModal) UI().closeModal();
  }
  function refresh() {
    renderBar();
    if (O.panel && !document.getElementById('modal').hidden) renderPanel(O.panel);
  }
  function renderBar() {
    let bar = document.getElementById('onlineBar');
    if (O.phase === 'idle') { if (bar) bar.hidden = true; return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'onlineBar'; bar.className = 'online-bar'; document.getElementById('app').appendChild(bar); }
    bar.hidden = false;
    const n = Object.keys(O.players).filter((k) => !O.players[k].left).length;
    const w = gate();
    const away = O.phase === 'playing' && !onlineMode(); // đang ở “phòng” offline trong lúc trận còn diễn ra
    bar.innerHTML = '<span class="ob-room">🌐 ' + esc(O.code || '') + ' · ' + n + ' người</span>' +
      (away ? '<button type="button" class="ob-back" data-op="back" title="Quay lại nhân vật đang đấu">⚔️ Về trận</button>' :
        w ? '<span class="ob-wait" title="' + esc(w) + '">⏳ chờ mốc ' + O.nextCp + '</span>' : O.phase === 'playing' ? '<span class="ob-cp">🎯 mốc ' + O.nextCp + ' tuổi</span>' : '') +
      '<button type="button" data-op="lobby" title="Phòng">👥</button>' +
      '<button type="button" data-op="chat" title="Chat">💬' + (O.unread ? '<i>' + O.unread + '</i>' : '') + '</button>' +
      (O.phase !== 'lobby' ? '<button type="button" data-op="act" title="Tương tác đối thủ">🤝</button><button type="button" data-op="board" title="Bảng xếp hạng phòng">📊</button>' : '');
    bar.querySelectorAll('[data-op]').forEach((b) => (b.onclick = () => (b.dataset.op === 'back' ? UI().enterOnline() : open(b.dataset.op))));
    if (UI().isTitle && UI().isTitle() && UI().updateOnlineTitle) UI().updateOnlineTitle();
  }
  function open(panel) {
    if (!KN.UI || !KN.UI.openModal) return;
    O.panel = panel || (O.phase === 'idle' ? 'home' : 'lobby');
    if (O.panel === 'chat') O.unread = 0;
    renderPanel(O.panel);
    renderBar();
  }
  function renderPanel(panel) {
    const h = PANELS[panel] ? PANELS[panel]() : PANELS.home();
    UI().openModal('<div class="online">' + h + '</div>');
    const box = document.getElementById('modalBox');
    box.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { O.panel = null; }));
    BIND[panel] && BIND[panel](box);
    const log = box.querySelector('.ol-chat'); if (log) log.scrollTop = log.scrollHeight;
  }
  const lastName = () => (KN.store.get('kn_online_name', '') || (G().hasLife() && G().view() ? G().view().name : '') || '');
  const PANELS = {
    home() {
      const hist = KN.store.get(HIST, []) || [];
      const wins = hist.filter((x) => x.win).length;
      return '<h3>🌐 Solo online</h3><p class="sub">2–' + MAX_PLAYERS + ' người cùng sống một kiếp. Mỗi 10 năm hiện bảng so sánh: ai sống lâu hơn, ai giàu hơn. Khi tất cả đã qua đời, người có tổng điểm cao nhất thắng.</p>' +
        '<label class="ol-field">Tên của bạn<input id="olName" maxlength="20" value="' + esc(lastName()) + '" placeholder="Nhập tên hiển thị"></label>' +
        '<div class="btnrow"><button type="button" class="btn btn-primary" id="olCreate">➕ Tạo phòng</button></div>' +
        '<div class="ol-join"><input id="olCode" maxlength="5" placeholder="Mã phòng (5 ký tự)" autocomplete="off"><button type="button" class="btn btn-ghost" id="olJoin">Vào phòng</button></div>' +
        '<p class="p-sub" id="olErr"></p>' +
        '<div class="sec-title">Lịch sử solo <small>' + hist.length + ' trận · thắng ' + wins + '</small></div>' +
        (hist.length ? '<div class="ol-hist">' + hist.slice(0, 8).map((x) => '<div>' + (x.win ? '🏆' : '🎗️') + ' Hạng ' + x.rank + '/' + x.of + ' · ' + new Date(x.at).toLocaleDateString('vi-VN') + ' · ' + x.players.map((p) => esc(p.name) + ' (' + (p.age ?? '?') + 't)').join(', ') + '</div>').join('') + '</div>' : '<p class="p-sub">Chưa có trận nào. Rủ bạn bè vào chơi nhé!</p>') +
        '<p class="p-sub" style="margin-top:10px">Chạy qua máy chủ của game (HTTPS), vào được từ 4G lẫn mọi loại wifi. Phòng tự xoá sau 6 giờ. Chơi một mình vẫn chạy bình thường khi không có mạng.</p>';
    },
    lobby() {
      const ids = Object.keys(O.players).filter((k) => !O.players[k].left);
      return '<h3>👥 Phòng ' + esc(O.code) + '</h3>' +
        (O.phase === 'lobby' ? '<p class="sub">Gửi mã <b class="ol-code">' + esc(O.code) + '</b> cho bạn bè. ' + (O.isHost ? 'Đủ người thì bấm Bắt đầu.' : 'Chờ chủ phòng bắt đầu…') + '</p>' : '<p class="sub">Trận đang diễn ra · mốc so bảng tiếp theo: <b>' + O.nextCp + ' tuổi</b></p>') +
        '<div class="ol-players">' + ids.map((k) => { const p = O.players[k], s = p.snap; return '<div class="ol-p"><b>' + esc(p.name) + (k === O.myId ? ' (bạn)' : '') + '</b><span>' + (s ? (s.alive ? s.age + ' tuổi · ' + money(s.worth) : '🕯️ mất ở tuổi ' + s.age) : O.phase === 'lobby' ? 'đã sẵn sàng' : 'đang tạo nhân vật…') + '</span></div>'; }).join('') + '</div>' +
        (O.isHost && O.phase === 'lobby' ? '<div class="sec-title">Chế độ chơi</div><div class="seg" role="group"><button type="button" data-fm="0" aria-pressed="' + !O.famMode + '">⚔️ Solo đấu</button><button type="button" data-fm="1" aria-pressed="' + !!O.famMode + '">👨‍👩‍👧 Sống chung một nhà</button></div><p class="p-sub">' + (O.famMode ? 'Cả phòng là anh chị em ruột: cùng họ, cùng quê, cùng bố mẹ. Bố mẹ mất thì cả nhà cùng chịu tang; anh chị em có thể cho nhau tiền. Cuối trận vẫn so bảng ai sống lâu, giàu hơn.' : 'Mỗi người một gia đình riêng, thi nhau sống lâu và giàu nhất.') + '</p>' : O.phase === 'lobby' ? '<p class="p-sub">Chủ phòng sẽ chọn chế độ: solo đấu hay sống chung một nhà.</p>' : (O.fam ? '<p class="p-sub">👨‍👩‍👧 Đang chơi chế độ sống chung một nhà (họ ' + esc(O.fam.lastName || '') + ').</p>' : '')) +
        '<div class="btnrow">' + (O.isHost && O.phase === 'lobby' ? '<button type="button" class="btn btn-primary" id="olStart"' + (ids.length < 2 ? ' disabled' : '') + '>🏁 Bắt đầu (' + ids.length + ' người)</button>' : '') +
        '<button type="button" class="btn btn-ghost" id="olChat">💬 Chat</button><button type="button" class="btn btn-soft" id="olLeave">Rời phòng</button></div>';
    },
    chat() {
      return '<h3>💬 Chat phòng ' + esc(O.code) + '</h3><div class="ol-chat">' + (O.chat.length ? O.chat.slice(-80).map((c) => c.sys ? '<div class="ol-sys">' + esc(c.text) + '</div>' : '<div class="ol-msg' + (c.me ? ' me' : '') + (c.emote ? ' emo' : '') + '"><b>' + esc(c.name) + '</b> ' + esc(c.text) + '</div>').join('') : '<div class="ol-sys">Chưa có tin nhắn nào.</div>') + '</div>' +
        '<div class="ol-emos">' + ['😂', '😭', '😎', '🤑', '💀', '👑', '🔥', '👏', '🙏', '😡'].map((e) => '<button type="button" data-emo="' + e + '">' + e + '</button>').join('') + '</div>' +
        '<div class="ol-join"><input id="olMsg" maxlength="200" placeholder="Nhắn gì đó…" autocomplete="off"><button type="button" class="btn btn-primary" id="olSend">Gửi</button></div>';
    },
    act() {
      const me = G().view();
      const others = Object.keys(O.players).filter((k) => k !== O.myId && !O.players[k].left);
      if (!me || !me.alive || !O.lifeStarted) return '<h3>🤝 Tương tác</h3><p class="sub">Bạn cần đang sống trong trận để tương tác với đối thủ.</p>';
      return '<h3>🤝 Tương tác đối thủ</h3><p class="sub">Mỗi năm, với mỗi người, mỗi kiểu tương tác dùng được một lần. Tác động nhỏ thôi, cho vui.</p>' +
        (others.length ? others.map((k) => { const p = O.players[k], s = p.snap; return '<div class="ol-p"><b>' + esc(p.name) + '</b><span>' + (s ? (s.alive ? s.age + ' tuổi · ' + esc(s.job) + ' · ' + money(s.worth) : '🕯️ đã mất') : 'đang tạo nhân vật') + '</span><div class="ol-acts">' + (s && s.alive ? Object.keys(ACTS).map((a) => '<button type="button" class="btn btn-soft btn-sm" data-act="' + a + '" data-to="' + k + '"' + (O.acted[a + '|' + k + '|' + me.age] ? ' disabled' : '') + '>' + ACTS[a].icon + ' ' + ACTS[a].label + '</button>').join('') : '') + '</div>' + bigActs(k, s, me) + (s && s.alive && KN.Mini ? '<div class="ol-acts"><button type="button" class="btn btn-primary btn-sm" data-big="duel" data-to="' + k + '">⚔️ Thách đấu minigame</button>' + (O.fam ? '<button type="button" class="btn btn-soft btn-sm" data-big="mny" data-to="' + k + '">💸 Cho anh/chị/em tiền</button>' : '') + '</div>' : '') + '</div>'; }).join('') : '<p class="p-sub">Chưa có đối thủ nào trong phòng.</p>');
    },
    board() {
      const rows = Object.keys(O.players).map((k) => Object.assign({ id: k, name: O.players[k].name, left: O.players[k].left }, O.players[k].snap || {}));
      return '<h3>📊 Bảng xếp hạng phòng</h3><p class="sub">Cập nhật trực tiếp · điểm = thọ 40% + tài sản 40% + điểm kiếp người 20%</p>' + tableHtml(rows) +
        (O.boards.length ? '<div class="sec-title">Các mốc đã qua</div><div class="btnrow">' + O.boards.map((b, i) => '<button type="button" class="btn btn-soft btn-sm" data-cp="' + i + '">Mốc ' + b.cp + ' tuổi</button>').join('') + '</div>' : '');
    },
  };
  const BIND = {
    home(box) {
      const err = (e) => { box.querySelector('#olErr').textContent = '⚠️ ' + (e && e.message ? e.message : e); };
      const nm = () => { const v = box.querySelector('#olName').value.trim(); if (!v) { err('Nhập tên trước đã.'); return null; } KN.store.set('kn_online_name', v); return v; };
      box.querySelector('#olCreate').onclick = async () => { const n = nm(); if (!n) return; box.querySelector('#olErr').textContent = '⏳ Đang tạo phòng…'; try { await createRoom(n); open('lobby'); } catch (e) { reset(); err(e); } };
      box.querySelector('#olJoin').onclick = async () => { const n = nm(); if (!n) return; const c = box.querySelector('#olCode').value.trim(); if (c.length !== 5) { err('Mã phòng gồm 5 ký tự.'); return; } box.querySelector('#olErr').textContent = '⏳ Đang vào phòng…'; try { await joinRoom(c, n); open('lobby'); } catch (e) { reset(); err(e); } };
    },
    lobby(box) {
      const s = box.querySelector('#olStart'); if (s) s.onclick = () => send(O.famMode ? { t: 'start', fam: makeFamily() } : { t: 'start' });
      box.querySelectorAll('[data-fm]').forEach((b) => (b.onclick = () => { O.famMode = b.dataset.fm === '1'; renderPanel('lobby'); }));
      box.querySelector('#olChat').onclick = () => open('chat');
      box.querySelector('#olLeave').onclick = () => leave(false);
    },
    chat(box) {
      const inp = box.querySelector('#olMsg');
      const go = () => { const t = inp.value.trim(); if (!t) return; send({ t: 'chat', text: t }); inp.value = ''; inp.focus(); };
      box.querySelector('#olSend').onclick = go;
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      box.querySelectorAll('[data-emo]').forEach((b) => (b.onclick = () => send({ t: 'emote', text: b.dataset.emo })));
      setTimeout(() => inp.focus(), 50);
    },
    act(box) {
      box.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => doAct(b.dataset.to, b.dataset.act)));
      box.querySelectorAll('[data-big]').forEach((b) => (b.onclick = () => {
        const to = b.dataset.to, k = b.dataset.big;
        if (!onlineMode()) { toast('Bạn đang ở chế độ offline', 'Quay lại trận online trước đã.', '⚔️'); return; }
        if (k === 'duel') { duelPicker(to); return; }
        if (k === 'mny') {
          const cash = Math.floor((G().view().money || 0) / 1e6);
          const n = Math.floor(Number(window.prompt('Cho ' + nameOf(to) + ' bao nhiêu triệu? (bạn có ' + cash + ' triệu)', String(Math.min(10, cash)))));
          if (!n || n < 1) return;
          if (n > cash || n > 99999) { toast('Không đủ tiền', 'Bạn chỉ có ' + cash + ' triệu tiền mặt.', '⛔'); return; }
          G().onlineMoney(-n * 1e6, '💸 Bạn cho ' + charOf(to) + ' ' + n + ' triệu.', '💸'); UI().render && UI().render(); pushSnap();
          send({ t: 'act', to, kind: 'mny:' + n }); toast('💸 Đã gửi', nameOf(to) + ' nhận được ' + n + ' triệu.', '💸');
          return;
        }
        if (k === 'prop') { send({ t: 'act', to, kind: 'prop' }); toast('💍 Đã ngỏ lời', 'Chờ ' + nameOf(to) + ' trả lời…', '💍'); b.disabled = true; return; }
        if (k === 'div') { askYesNo('💔 Ly hôn?', 'Ly hôn thì cả hai mất 25% tài sản và hạnh phúc giảm mạnh.', 'Ly hôn', 'Thôi', (y) => { if (y) send({ t: 'act', to, kind: 'div' }); }); return; }
        if (k === 'inv') {
          const cash = Math.floor((G().view().money || 0) / 1e6);
          const v = window.prompt('Mỗi người góp bao nhiêu triệu? (bạn đang có ' + cash + ' triệu tiền mặt)', String(Math.min(100, cash)));
          const n = Math.floor(Number(v));
          if (!n || n < 1) return;
          if (n > cash) { toast('Không đủ tiền', 'Bạn chỉ có ' + cash + ' triệu tiền mặt.', '⛔'); return; }
          if (n > 99999) { toast('Quá lớn', 'Tối đa 99.999 triệu mỗi lần.', '⛔'); return; }
          send({ t: 'act', to, kind: 'inv:' + n }); toast('🤝 Đã gửi lời mời', 'Chờ ' + nameOf(to) + ' quyết định góp vốn…', '🤝');
        }
      }));
    },
    board(box) { box.querySelectorAll('[data-cp]').forEach((b) => (b.onclick = () => { const x = O.boards[+b.dataset.cp]; showBoard(x.cp, x.rows, false); })); },
  };
  function tableHtml(rows) {
    const rk = ranking(rows);
    const best = (key) => Math.max(...rk.map((r) => r[key] || 0));
    const bA = best('age'), bW = best('worth'), bS = best('score');
    return '<div class="ol-table"><div class="ol-tr ol-th"><span>#</span><span>Người chơi</span><span>Tuổi</span><span>Tài sản</span><span>Nghề</span><span>😊❤️</span><span>Điểm</span></div>' +
      rk.map((r, i) => '<div class="ol-tr' + (r.id === O.myId ? ' me' : '') + '"><span>' + (i === 0 ? '👑' : i + 1) + '</span><span><b>' + esc(r.name) + '</b>' + (r.fullName ? '<small>' + esc(r.fullName) + '</small>' : '') + '</span>' +
        '<span' + (r.age === bA ? ' class="top"' : '') + '>' + (r.alive === false ? '🕯️' : '') + r.age + '</span>' +
        '<span' + (r.worth === bW ? ' class="top"' : '') + '>' + money(r.worth || 0) + '</span>' +
        '<span><small>' + esc(r.alive === false ? (r.cause || 'Đã mất') : r.job || '') + '</small></span>' +
        '<span><small>' + (r.stats ? r.stats.happy + ' · ' + r.stats.health : '') + '</small></span>' +
        '<span' + (r.score === bS ? ' class="top"' : '') + '>' + (r.score ?? '') + '</span></div>').join('') + '</div>';
  }
  function showBoard(cp, rows, final) {
    if (!KN.UI || !KN.UI.openModal) return;
    const rk = ranking(rows), win = rk[0];
    const meFirst = win && win.id === O.myId;
    O.panel = null;
    UI().openModal('<div class="online"><h3>' + (final ? '🏁 Chung cuộc!' : '📊 So bảng mốc ' + cp + ' tuổi') + '</h3>' +
      '<p class="sub">' + (final ? (meFirst ? '🏆 Bạn là người chiến thắng! Sống lâu nhất, giàu nhất, đáng sống nhất.' : '👑 ' + esc(win ? win.name : '?') + ' thắng chung cuộc. Hẹn trận sau phục thù!') : (meFirst ? '👑 Bạn đang dẫn đầu sau ' + cp + ' năm!' : '👑 ' + esc(win ? win.name : '?') + ' đang dẫn đầu. Cố lên!')) + '</p>' +
      tableHtml(rows) + '<div class="btnrow" style="justify-content:flex-end">' + (final ? '<button type="button" class="btn btn-ghost" id="olAgain">Về sảnh online</button>' : '') + '<button type="button" class="btn btn-primary" data-close="1">' + (final ? 'Đóng' : 'Sống tiếp →') + '</button></div></div>');
    try { KN.Audio && KN.Audio.sfx(meFirst ? 'cheer' : 'notify'); } catch (e) { /* */ }
    const a = document.getElementById('olAgain'); if (a) a.onclick = () => { leave(true); open('home'); };
    renderBar();
  }

  // chủ phòng báo bố/mẹ chung qua đời cho cả nhà
  if (G() && G().on) G().on('famParentDied', (role) => { if (O.fam && O.isHost && onlineMode()) send({ t: 'act', to: '*', kind: 'pd:' + role }); });
  KN.Online = {
    open, gate, afterAge, onDeath, onLifeStart, onResume, inMatch, familyOpts,
    get active() { return O.phase === 'playing' && O.lifeStarted; },
    _state: O,
  };
})();
