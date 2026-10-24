/* Một Kiếp Người — minigame (KN.Mini): bài thi, phạt đền, bắt penalty, ném rổ, chạy, bơi, rượt đuổi, lái xe, đánh nhau,
 * phỏng vấn, bán hàng, lướt sóng, tỏ tình, mặc cả, ép tim, xì dách.
 * Mỗi trò trả về điểm 0..1. Chỉ số nhân vật làm trò dễ/khó hơn (trí tuệ → thêm giờ & gợi ý; sức khỏe → nhanh & mạnh hơn; ngoại hình → dễ cảm mến).
 * Game so điểm với ngưỡng theo độ khó của tình huống để quyết định thành bại. Luôn có nút “Để số phận quyết định”.
 * Chế độ thách đấu online dùng chung hạt giống ngẫu nhiên (seed) để hai bên gặp cùng đề/cùng thế trận. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // ngẫu nhiên có thể gieo hạt (thách đấu online: hai máy cùng một đề)
  let RNG = Math.random;
  const rnd = () => RNG();
  const rand = (a, b) => a + rnd() * (b - a);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function seeded(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const money = (v) => { v = Math.round(v); const a = Math.abs(v); return (v < 0 ? '-' : '') + (a >= 1e9 ? (a / 1e9).toFixed(a >= 1e10 ? 1 : 2).replace(/\.?0+$/, '') + ' tỷ' : a >= 1e6 ? Math.round(a / 1e6) + ' triệu' : a.toLocaleString('vi-VN') + 'đ'); };
  const PREF = 'kn_mini_on';
  const enabled = () => KN.store.get(PREF, true) !== false;

  // ------------------------------------------------------------------ chọn minigame cho một lựa chọn
  // chỉ áp dụng từ khóa cho lựa chọn dựa trên chỉ số; lựa chọn thuần xác suất phải được đánh dấu (mini: trong sự kiện hoặc MAP)
  const KW = [
    ['penalty', /\b(sut|penalty|phat den|panenka|ghi ban)\b/],
    ['fight', /(dung ra benh vuc|xan tay ao)/],
    ['chase', /(duoi theo|ruot duoi|duoi bat|bat trom|tom co)/],
    ['swim', /(boi ra|boi theo|boi cheo|boi nhanh|boi het|boi vuot|lao xuong boi)/],
    ['drive', /(phong xe|lai xe|chay xe|ro ga|dua xe|chay thu mot vong|cam lai|vit ga)/],
    ['sprint', /(bo chay|chay ve|chay tron|chay nhanh|chay het|co gio|chay thi|chay dua|chay vuot|nuoc rut|tang toc|ve dich|but toc)/],
    ['fight', /(danh tra|danh nhau|dam nhau|dam vao|dam no|dam han|dam lai|tung cu|xong vao|tu ve|danh lai|ha guc|doi khang|so gang|danh bai|tra don|dap tra|vung day)/],
    ['keeper', /(bat penalty|can pha|bat luan luu|thu mon)/],
    ['hoops', /(nem ro|up ro|ba diem|lay bong|nem phat|buzzer|bong ro)/],
    ['hoops', /(nem bong)/],
    ['love', /(to tinh|cau hon|ngo loi|tan tinh|lam lanh)/],
    ['haggle', /(mac ca|tra gia|dam phan|thuong luong|ep gia)/],
    ['cpr', /(so cuu|ep tim|hoi suc|cam dao mo)/],
    ['cook', /(mo quan|nau an|dung bep|nhap them hang|day hang)/],
    ['stock', /(co phieu|chung khoan|luot song|margin|tat tay)/],
    ['cards', /(danh bai|xi dach|bau cua|sat phat|choi bac|ca do)/],
    ['interview', /(phong van|tra loi kheo|thuyet trinh|pitch)/],
    ['quiz', /(ky thi|thi cu|thi vao|thi lai|thi hoc|thi tuyen|bai thi|bai kiem tra|lam bai thi|on thi|tranh luan|giai de|tinh nham)/],
  ];
  const AVOID = /(do phai|khoi phai|tranh |ne )/; // lựa chọn né tránh hành động thì không chơi
  // lựa chọn có sẵn trong các file sự kiện cũ: 'mã sự kiện#thứ tự lựa chọn' → loại game (kèm kiểu đối thủ)
  const MAP = {
    'a_mat_xe#0': 'chase', 's_crime_giat_dt#0': 'drive', 's_crime_bat_binh#0': 'chase',
    's_money_stock_margin#0': 'stock', 's_money_stock_margin#1': 'stock', 's_money_stock_crash#1': 'stock', 'a_tien_ao#0': 'stock', 'a_tien_ao#1': 'stock',
    'c_underage_bike#0': 'drive', 'c_underage_bike#1': 'drive',
    's_accident_tam_song#1': 'swim', 's_accident_chuot_rut#0': 'swim', 's_accident_cuu_be#0': 'swim', 's_army_culu#0': 'swim',
    'm_early_layoff#1': 'cook', 'm_side_hustle#0': 'cook', 'a_mo_quan_cafe#0': 'cook', 's_money_shop_boom#0': 'cook', 'a_lam_them_cafe#0': 'cook',
    'a_phong_van#0': 'interview', 's_work_toxic_newjob#1': 'interview', 's_job_laptrinh_nuocngoai#0': 'interview', 's_work_startup_office#0': 'interview',
    'a_mua_nha_tra_gop#2': 'haggle', 'a_kinhdoanh_mat_bang#0': 'haggle', 's_work_salary_strike#0': 'haggle', 's_crime_xe_cho#1': 'haggle',
    'c_crush#0': 'love', 'c_crush#1': 'love',
    's_job_bacsi_camo#0': 'cpr',
    's_job_bacsi_hanhhung#2': ['fight', 'gang'], 'c_fight#0': ['fight', 'kid'], 'c_bullied_friend#0': ['fight', 'danAnh'], 's_xhd_danh#0': ['fight', 'gang'],
  };
  const SPORT_GAME = { cauthu: 'penalty', bongro: 'hoops', bongchuyen: 'sprint', caulong: 'sprint', vdv_vo: 'fight', dienkinh: 'sprint', boi: 'swim', esports: 'aim' };
  const FIELDS = {
    tech: ['laptrinh', 'thietke', 'kysu', 'kientrucsu', 'khoahoc', 'kysunn'],
    health: ['bacsi', 'dieuduong', 'duocsi'],
    law: ['luatsu', 'ketoan', 'nganhang', 'congchuc', 'chinhtri', 'phiendich'],
    sales: ['banhang', 'marketing', 'kinhdoanh', 'phucvu', 'huongdanvien', 'tiepvien', 'daubep', 'thocattoc', 'nhabao'],
    teach: ['giaovien', 'hlv'],
    star: ['casi', 'dienvien', 'nguoimau', 'streamer', 'nhaccong', 'hoasi'],
    uniform: ['canhsat', 'cuuhoa', 'phicong', 'taixe', 'shipper', 'congnhan', 'nongdan'],
  };
  const fieldOf = (job) => { if (!job) return null; if (SPORT_GAME[job]) return 'sport'; return Object.keys(FIELDS).find((k) => FIELDS[k].includes(job)) || null; };
  function plan(ev, choice) {
    if (!enabled() || !ev || !choice || choice.disabled) return null;
    const odds = G().choiceOdds && G().choiceOdds(ev.uid, choice.index);
    if (!odds) return null;
    const ctx = G().miniContext(); if (!ctx) return null;
    let type = odds.mini || null, foe = odds.foe || null;
    const m = MAP[ev.id + '#' + choice.index];
    if (!type && m) { const a = [].concat(m); type = a[0]; foe = foe || a[1] || null; }
    if (!type && /^ms_(grade10|uni|retake|uni_late)$/.test(ev.id)) type = 'quiz';
    else if (!type && ev.id === 'ms_ys_tryout') type = SPORT_GAME[ctx.ys] || 'sprint';
    else if (!type && !odds.weighted) {
      const t = fold(choice.label) + ' ';
      if (!AVOID.test(t)) for (const [k, re] of KW) if (re.test(t)) { type = k; break; }
      // tình huống nghề thể thao: dùng trò của môn đó khi lựa chọn dựa vào thể lực
      if (!type && odds.stat === 'health' && SPORT_GAME[ctx.jobId] && /^s_(fb|job_cauthu|boi|dk|bc|job_vdv|job_caulong|job_bongro)/.test(ev.id)) type = SPORT_GAME[ctx.jobId];
      if (!type && odds.stat === 'smarts' && /(bai tap|bai thi|ky thi|di thi|de thi|cau hoi|kiem tra|olympic|on bai|hoc bai|hoc thuoc)/.test(fold(ev.title + ' ' + choice.label))) type = 'quiz';
    }
    // tuyển thủ eSports: trận đấu là phản xạ/ngắm, không phải bài kiểm tra
    if (type === 'quiz' && ctx.jobId === 'esports' && /^(s_job_esports|s_es_|s_job_game)/.test(ev.id)) type = 'aim';
    if (!type || !GAMES[type]) return null;
    // trận đấu bóng đá thường (không phải loạt phạt đền) → đá thật kiểu Hax
    if (type === 'penalty' && KN.Hax && !/(penalty|phat den|panenka|luan luu|da phat)/.test(fold(ev.title + ' ' + choice.label))) type = 'hax';
    if (type === 'drive' && GAMES.race && /(dua xe|dua voi|dua mo to|dua toc do)/.test(fold(ev.title + ' ' + choice.label))) type = 'race';
    if (type === 'fight' && !foe) foe = ctx.jobId === 'vdv_vo' && /^s_job_vdv/.test(ev.id) ? 'vo' : ctx.age < 14 ? 'kid' : 'thug';
    return { type, foe, need: odds.need, ctx, evId: ev.id, title: ev.title, label: choice.label, level: quizLevel(ev, ctx), field: fieldOf(ctx.jobId), mode: 'event' };
  }
  function quizLevel(ev, ctx) {
    if (ev.id === 'ms_grade10') return 2;
    if (/^ms_(uni|retake|uni_late)$/.test(ev.id)) return 3;
    return ctx.age < 11 ? 1 : ctx.age < 16 ? 2 : 3;
  }
  // ứng tuyển: nghề thể thao thì thi tuyển bằng môn đó, còn lại là phỏng vấn
  function planJob(id) {
    if (!enabled() || !G().jobOdds) return null;
    const o = G().jobOdds(id), ctx = G().miniContext(); if (!o || !ctx) return null;
    const type = SPORT_GAME[id] || 'interview';
    return { type, foe: type === 'fight' ? 'vo' : null, need: o.need, ctx, title: 'Ứng tuyển: ' + o.title, label: type === 'interview' ? 'Phỏng vấn xin việc' : 'Buổi thi tuyển', field: fieldOf(id), level: 3, mode: 'event' };
  }
  function planPropose(personId) {
    if (!enabled() || !G().interactOdds) return null;
    const o = G().interactOdds(personId, 'propose'), ctx = G().miniContext(); if (!o || !ctx) return null;
    return { type: 'love', need: o.need, ctx, title: 'Cầu hôn ' + o.name, label: 'Quỳ xuống, mở hộp nhẫn', partnerName: o.name, propose: true, mode: 'event' };
  }
  function planHaggle(itemId) {
    if (!enabled() || !G().haggleInfo) return null;
    const h = G().haggleInfo(itemId), ctx = G().miniContext(); if (!h || !ctx) return null;
    return { type: 'haggle', need: 0.4, ctx, title: 'Mua ' + h.name, label: 'Mặc cả trước khi xuống tiền', price: h.price, item: h.name, mode: 'buy' };
  }
  const DUEL_TYPES = ['quiz', 'penalty', 'hax', 'keeper', 'hoops', 'sprint', 'swim', 'chase', 'drive', 'fight', 'cards', 'stock', 'cook'];
  function planDuel(type, seed, vsName) {
    const ctx = (G().miniContext && G().miniContext()) || { stats: { happy: 60, health: 60, smarts: 60, looks: 60 }, appearance: {}, age: 25 };
    return { type, foe: 'thug', need: 0.5, ctx, title: '⚔️ Thách đấu với ' + vsName, label: NAME[type], level: 2, seed, mode: 'duel' };
  }
  const NAME = {
    quiz: '📝 Làm bài kiểm tra', penalty: '⚽ Sút phạt đền', keeper: '🧤 Bắt penalty', shoot: '🏀 Ném rổ', sprint: '🏃 Chạy nước rút',
    swim: '🏊 Bơi', chase: '🚓 Rượt đuổi', drive: '🛵 Lái xe', fight: '🥊 Đánh nhau', interview: '💼 Phỏng vấn', cook: '🍜 Bán hàng',
    paint: '🎨 Vẽ nét', land: '🛬 Hạ cánh', fix: '🔧 Sửa máy', clutch: '⚡ Xử lý clutch', aim: '🎯 Tập ngắm', scamchat: '💬 Nhắn tin dụ nạn nhân', stock: '📈 Lướt sóng', love: '💘 Tỏ tình', haggle: '🧧 Mặc cả', cpr: '🫀 Cấp cứu', cards: '🃏 Xì dách', sneak: '🌙 Vượt ngục', hoops: '🏀 Ném rổ', hax: '⚽ Đá bóng (Hax)',
  };

  // ------------------------------------------------------------------ khung chung
  let root = null, keyHandler = null, rafId = 0, timers = [], abortFn = null, curP = null;
  // icon nét mảnh dùng cho thanh chỉ số của mọi minigame (cùng ngôn ngữ thiết kế với phòng HLV)
  const MI = { health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', smarts: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>', looks: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', goal: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/>' };
  const miIc = (k, c) => '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + MI[k] + '</svg>';
  function statsBar(p) {
    if (!p || !p.ctx || !p.ctx.stats) return '';
    const st = p.ctx.stats, chip = (k, c, v, tip) => '<span title="' + tip + '">' + miIc(k, c) + '<b>' + Math.round(v) + '</b></span>';
    return '<div class="mini-stats">' + chip('health', '#ff6b6b', st.health, 'Sức khỏe: tốc độ, phản xạ, sức bền') + chip('smarts', '#5cc8ff', st.smarts, 'Trí tuệ: gợi ý và xử lý tình huống') + chip('looks', '#c792ff', st.looks, 'Ngoại hình: ấn tượng đầu') + (p.mode === 'duel' ? '<span class="mini-need">⚔️ Thách đấu</span>' : '<span class="mini-need" title="Điểm tối thiểu để thành công">' + miIc('goal', '#ffb547') + 'Cần ≥ <b>' + Math.round((p.need || 0) * 100) + '%</b></span>') + '</div>';
  }
  function open(html) {
    close();
    root = document.createElement('div'); root.className = 'mini'; root.innerHTML = '<div class="mini-box">' + html + '</div>';
    document.body.appendChild(root);
    if (abortFn && curP) { const h = root.querySelector('.mini-head'); if (h) h.insertAdjacentHTML('afterend', statsBar(curP)); }
    if (abortFn) addQuit(root);
    return root;
  }
  // nút ✖ Thoát góc trên: bỏ dở minigame → kết quả do số phận quyết định (thách đấu thì tính thua)
  function addQuit(el) { const b = document.createElement('button'); b.type = 'button'; b.className = 'mini-quit'; b.textContent = '✖ Thoát'; b.title = 'Bỏ dở minigame, để số phận quyết định'; let armed = 0; b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); sfx('click'); if (!armed) { armed = 1; b.textContent = '❓ Bấm lần nữa để thoát'; b.classList.add('arm'); setTimeout(() => { armed = 0; b.textContent = '✖ Thoát'; b.classList.remove('arm'); }, 3000); return; } if (abortFn) abortFn(); }; (el.querySelector('.mini-box') || el).appendChild(b); if (curP && PAUSABLE.includes(curP.type)) { const pb = document.createElement('button'); pb.type = 'button'; pb.className = 'mini-quit mini-pausebtn'; pb.textContent = '⏸ Tạm dừng'; pb.title = 'Tạm dừng (phím P hoặc Esc)'; pb.onclick = (e) => { e.preventDefault(); e.stopPropagation(); setPause(true); }; (el.querySelector('.mini-box') || el).appendChild(pb); } }
  // ⏸ tạm dừng: chỉ cho các trò chạy bằng loop()/every() (không dùng đồng hồ hệ thống) — đóng băng vòng lặp, chặn phím, phủ màn tạm dừng
  const PAUSABLE = ['sprint', 'swim', 'chase', 'drive', 'fight', 'sneak', 'cook', 'aim', 'quiz', 'stock', 'cpr', 'interview', 'love', 'clutch', 'keeper'];
  let paused = false, pauseEl = null;
  function setPause(on) {
    if (!root || !curP || !PAUSABLE.includes(curP.type)) return; on = !!on; if (on === paused) return; paused = on; sfx('click');
    const host = root.querySelector('.mini-box') || root;
    if (on) { pauseEl = document.createElement('div'); pauseEl.className = 'mini-pause'; pauseEl.innerHTML = '<div><b>⏸ Tạm dừng</b><small>Thời gian đang dừng. Bấm <kbd>P</kbd> hoặc <kbd>Esc</kbd> để tiếp tục.</small><button type="button" class="btn btn-primary" data-resume>▶ Tiếp tục</button></div>'; pauseEl.querySelector('[data-resume]').onclick = () => setPause(false); host.appendChild(pauseEl); }
    else if (pauseEl) { pauseEl.remove(); pauseEl = null; }
  }
  function close() {
    paused = false; if (pauseEl) { pauseEl.remove(); pauseEl = null; }
    cancelAnimationFrame(rafId); rafId = 0;
    timers.forEach((id) => clearInterval(id)); timers = [];
    if (keyHandler) { window.removeEventListener('keydown', keyHandler, true); window.removeEventListener('keyup', keyHandler, true); keyHandler = null; }
    if (root) { root.remove(); root = null; }
  }
  const every = (fn, ms) => { const id = setInterval(() => { if (!paused) fn(); }, ms); timers.push(id); return id; };
  function onKeys(fn) { keyHandler = (e) => { if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && curP && PAUSABLE.includes(curP.type) && root) { if (e.type === 'keydown' && !e.repeat) setPause(!paused); e.preventDefault(); e.stopPropagation(); return; } if (paused) { e.preventDefault(); e.stopPropagation(); return; } if (fn(e) !== false) { e.preventDefault(); e.stopPropagation(); } }; window.addEventListener('keydown', keyHandler, true); window.addEventListener('keyup', keyHandler, true); }
  function onKeysOnce(fn) { if (keyHandler) { window.removeEventListener('keydown', keyHandler, true); window.removeEventListener('keyup', keyHandler, true); } onKeys((e) => (e.type === 'keydown' ? fn(e) : false)); }
  const lv = (v, a, b, c) => (v >= 75 ? a : v >= 50 ? b : c);
  function hintOf(p) {
    const st = p.ctx.stats, H = 'Sức khỏe ' + Math.round(st.health) + ': ', S = 'Trí tuệ ' + Math.round(st.smarts) + ': ', L = 'Ngoại hình ' + Math.round(st.looks) + ': ';
    switch (p.type) {
      case 'quiz': return S + (st.smarts >= 85 ? 'được loại 2 đáp án sai + thêm giờ' : st.smarts >= 70 ? 'được loại 1 đáp án sai + thêm giờ' : 'không có gợi ý');
      case 'penalty': return H + 'tâm ngắm chạy ' + lv(st.health, 'chậm, dễ canh', 'vừa phải', 'rất nhanh');
      case 'keeper': return H + 'phản xạ ' + lv(st.health, 'nhanh như mèo', 'khá', 'chậm');
      case 'shoot': return H + 'vùng xanh ' + lv(st.health, 'rộng', 'vừa', 'hẹp');
      case 'sprint': return H + 'mỗi lần bấm chạy ' + lv(st.health, 'rất xa', 'khá xa', 'ngắn');
      case 'swim': return H + 'nhịp quạt tay ' + lv(st.health, 'dễ bắt, sải dài', 'vừa', 'khó bắt, sải ngắn');
      case 'chase': return H + 'chân chạy ' + lv(st.health, 'rất nhanh', 'khá', 'chậm');
      case 'drive': return H + 'phản xạ ' + lv(st.health, 'tốt, xe như chậm lại', 'vừa', 'chậm, xe lao vun vút');
      case 'fight': return H + Math.round(70 + st.health * 0.6) + ' máu, đòn ' + lv(st.health, 'rất mạnh', 'khá', 'yếu') + ' · Đối thủ: ' + (FOES[p.foe] || FOES.thug).name;
      case 'interview': return S + (st.smarts >= 70 ? 'linh cảm được câu trả lời dở' : 'không có gợi ý') + ' · ' + L + (st.looks >= 70 ? 'ấn tượng đầu rất tốt' : 'bình thường');
      case 'cook': return S + 'khách ' + lv(st.smarts, 'kiên nhẫn', 'chờ vừa phải', 'mau sốt ruột') + (st.smarts >= 70 ? ', được gợi ý nguyên liệu tiếp theo' : '');
      case 'stock': return S + (st.smarts >= 80 ? 'thấy đường trung bình + dự báo xu hướng' : st.smarts >= 60 ? 'thấy đường trung bình' : 'chỉ nhìn giá mà đoán');
      case 'love': return L + lv(st.looks, 'người ấy đã có cảm tình sẵn', 'khởi đầu bình thường', 'phải cố gắng nhiều') + ', vùng hồi hộp ' + lv(st.looks, 'rộng', 'vừa', 'hẹp');
      case 'haggle': return S + (st.smarts >= 70 ? 'đọc được thái độ người bán' : 'phải tự đoán giá vốn');
      case 'cpr': return S + lv(st.smarts, 'thuộc kỹ thuật, nhịp dễ giữ', 'biết sơ qua', 'lúng túng, khó giữ nhịp');
      case 'scamchat': return S + (st.smarts >= 65 ? 'nói chuyện khéo, quản lý ít nghi ngờ hơn' : 'dễ để lộ sơ hở') + ' · ' + L + (st.looks >= 65 ? 'nạn nhân dễ có cảm tình' : 'nạn nhân khó tin hơn');
      case 'clutch': return S + (st.smarts >= 70 ? 'linh cảm được cách xử lý quá liều lĩnh' : 'phải tự đọc tình huống') + ' · ' + H + 'thời gian ra tay ' + lv(st.health, 'dư dả', 'vừa đủ', 'eo hẹp');
      case 'aim': return H + 'mục tiêu tồn tại ' + lv(st.health, 'lâu hơn, dễ bắt', 'vừa phải', 'ngắn, khó bắt') + ' · ' + S + (st.smarts >= 70 ? 'đọc được nhịp xuất hiện' : 'phản xạ thuần tuý');
      case 'paint': return H + 'dung sai nét vẽ ' + lv(st.health, 'rộng, tay chắc', 'vừa', 'hẹp, tay run');
      case 'land': return H + 'độ nhạy lái ' + lv(st.health, 'cao', 'vừa', 'chậm') + ' · gió giật mạnh hơn ở độ khó cao';
      case 'fix': return S + 'chuỗi công tắc sáng ' + lv(st.smarts, 'chậm, dễ nhớ', 'vừa', 'nhanh, khó nhớ');
      case 'cards': return S + (st.smarts >= 65 ? 'tính được xác suất quắc khi rút' : 'chơi theo cảm giác');
      case 'hoops': return H + 'vùng lực chuẩn ' + lv(st.health, 'rộng, tay chắc', 'vừa', 'hẹp, tay run') + ', thanh lực chạy ' + lv(st.health, 'chậm', 'vừa', 'nhanh');
      case 'sneak': return H + 'bò ' + lv(st.health, 'nhanh', 'vừa', 'chậm') + ' · ' + S + 'đoán lính gác quay lại ' + lv(st.smarts, 'rất sớm', 'khá sớm', 'muộn');
      case 'hax': { const s = haxSetup(p), mp = KN.Hax && KN.Hax.MAPS[s.map], k = haxSkills(p); return (mp ? mp.icon + ' ' + mp.name + ' · ' : '') + s.size + 'v' + s.size + (s.size > 1 ? ' (bạn + ' + (s.size - 1) + ' đồng đội máy)' : '') + ' · đối thủ ' + (p.need > 0.6 ? 'mạnh' : p.need > 0.35 ? 'vừa' : 'yếu') + ' · kỹ năng: ' + (k.charge ? '💥 sút tích lực' : '🔒 sút tích lực (cần thể lực 55)') + ', ' + (k.curve ? '🌀 sút xoáy' : '🔒 sút xoáy (cần trí tuệ 55)'); }
      default: return EXTRA_HINT[p.type] ? EXTRA_HINT[p.type](p) : '';
    }
  }
  const EXTRA_HINT = {};
  const HOWTO = {
    quiz: 'Trả lời 5 câu hỏi, mỗi câu có giới hạn thời gian. Bấm đáp án hoặc phím 1–4.',
    penalty: '5 quả phạt đền. Bấm lần 1 chốt hướng ngang, lần 2 chốt độ cao, lần 3 chốt lực (vùng xanh là chuẩn). Phím Space hoặc chạm màn hình.',
    keeper: 'Bạn là thủ môn, đối thủ sút 5 quả. Nhìn bóng bay rồi đổ người: ← trái · ↓ giữa · → phải (hoặc chạm vào phần khung thành). Có thể đoán trước theo dáng chạy đà, nhưng cẩn thận bị lừa!',

    sprint: 'Bấm luân phiên ← → (hoặc hai nút trái/phải) thật nhanh để về đích trước đối thủ.',
    swim: 'Quạt tay luân phiên ← → đúng lúc vòng tròn khép lại (bấm loạn sẽ mất sức). Hết ô-xy thì bấm ↑ hoặc Space để ngoi lên thở, để cạn là sặc nước!',
    chase: '← → đổi làn, ↑ nhảy qua vật thấp, ↓ trượt dưới xà ngang, Space tăng tốc. Thu hẹp khoảng cách để tóm hắn (hoặc giữ khoảng cách để thoát) trong 45 giây!',
    drive: '← → đổi làn, ↑ ga, ↓ phanh. Né ô tô/ổ gà/chó (có ⚠ báo trước), giữ đúng tốc độ biển báo, dừng khi đèn đỏ, cẩn thận lúc mưa. Va 3 lần là hỏng chuyến. Trụ hết 36 giây.',
    fight: '← → di chuyển · J đấm · K đá (phá thế đỡ) · L đỡ · Space né đòn nặng có dấu ! đỏ · F bỏ chạy. Có thanh thể lực (vàng): đòn càng mạnh càng tốn; đấm 3 cú liên tiếp ra COMBO. Trên điện thoại dùng các nút bên dưới. Hạ đối thủ hoặc còn nhiều máu hơn khi hết giờ.',
    interview: '4 câu hỏi từ nhà tuyển dụng. Chọn câu trả lời khéo nhất trước khi hết giờ (phím 1–3).',
    cook: 'Khách tới gọi món. Bấm nguyên liệu đúng thứ tự công thức để làm món cho khách đang chọn. Sai là làm lại! Khách chờ lâu sẽ bỏ về. 45 giây.',
    stock: 'Giá chạy trong 25 giây. MUA khi đoán giá sắp lên, BÁN khi sắp xuống (↑/↓ hoặc nút). Cuối phiên tính lãi lỗ so với vốn ban đầu.',
    love: '3 câu hỏi thả thính: chọn câu trả lời ghi điểm. Cuối cùng là khoảnh khắc quyết định: bấm đúng lúc vạch vào vùng hồng.',
    haggle: 'Kéo thanh để chọn giá rồi bấm “Trả giá”. Trả quá thấp người bán sẽ mất kiên nhẫn và bỏ đi. Tối đa 6 lượt.',
    paint: 'Vẽ 3 nét: giữ chuột/ngón tay tại chấm xanh rồi kéo bám theo đường nét đứt tới chấm đỏ trong 9 giây mỗi nét. Tay càng vững càng chính xác (bàn phím: mũi tên + giữ Space).',
    land: 'Giữ máy bay bám sát đường trượt xanh bằng ↑ (kéo mũi lên) và ↓ (hạ mũi xuống), chống gió giật và chạm đường băng thật êm.',
    fix: 'Nhìn chuỗi công tắc sáng lên rồi bấm lại đúng thứ tự (chuột/chạm hoặc phím 1–4). Qua 5 vòng, chuỗi dài dần; sai 3 lần là cháy cầu chì.',
    cpr: 'Trước hết chọn đúng thứ tự: an toàn → gọi 115 → kiểm tra hơi thở (phím 1–3). Sau đó bấm ÉP (Space) đúng nhịp khi vòng tròn khép lại, 30 lần mỗi chu kỳ, rồi THỔI NGẠT (↑) 2 lần. Chu kỳ 2 mệt hơn nên nhịp khó hơn.',
    hoops: '6 cú ném: lên rổ, tầm trung, ba điểm, ném phạt, ba điểm có hậu vệ và cú ném quyết định. Giữ Space để thanh lực dâng lên, thả tay khi vạch trắng nằm trong vùng xanh (ném càng xa càng cần nhiều lực). Có hậu vệ thì ném trước khi hắn bật nhảy!',
    sneak: 'Giữ Space để bò về hàng rào. Đèn vàng là lính gác sắp quay lại: thả tay ngay! Đèn đỏ mà còn bò là bị phát hiện (2 mạng). 40 giây trước khi trời sáng.',
    hax: 'Trận đấu nhìn từ trên xuống, 60 giây (trận lớn có đồng đội máy đá cùng). WASD / ↑↓←→ để chạy, Space / X để sút khi bóng sát người (giữ sút thì chạy chậm lại). Đưa bóng vào khung thành bên phải!',
    scamchat: 'Một ca làm việc trong khu lừa đảo: KPI năm nay là lừa đủ số người, không đạt sẽ bị đánh đập. Mỗi nạn nhân đi theo một kịch bản 3 bước (làm quen, giới thiệu lợi ích, xin thông tin thẻ nhận tiền). Chọn câu gợi ý đúng ngữ cảnh hoặc tự gõ. Khi nạn nhân đọc số thẻ, gõ đúng 16 số vào cửa sổ Hồ sơ rồi xác nhận. Quản lý luôn nhìn Camera: bấm nút 📞 ở cửa sổ Chỉ tiêu để họ bớt nghi ngờ. Bạn cũng có thể lén cảnh báo nạn nhân để cứu họ, nhưng bị bắt gặp là bị đánh.',
    clutch: '3 tình huống clutch liên tiếp (1v3, đồng đội gục hết, hết đạn, giành rồng…). Mỗi ca: đọc tình huống, chọn hướng xử lý đúng ngữ cảnh (phím 1–3), rồi bấm hạ từng địch trước khi chúng tránh đi hoặc hết giờ. Quyết định đúng thì mục tiêu to và nhiều thời gian hơn; bấm trượt hoặc để địch thoát sẽ mất máu.',
    aim: '3 bài liên tiếp (~25 giây): Flick — bấm mục tiêu trước khi mờ, trúng tâm đỏ là headshot; Tracking — giữ trỏ trên mục tiêu đang di chuyển; Đổi mục tiêu — bấm số 1 → 5 theo thứ tự. Điểm là trung bình 3 bài, kỷ lục được lưu trên máy.',
    cards: 'Xì dách 5 ván với nhà cái. Rút thêm (H) hoặc dằn (S). Quá 21 là quắc. Dưới 16 điểm chưa được dằn.',
  };
  // màn giới thiệu: giải thích rõ cách chơi (mục tiêu · từng bước · phím) rồi mới cho chơi; có nút chơi thử không tính điểm
  const SEEN = 'kn_mini_seen';
  const seenMap = () => { try { return KN.store.get(SEEN, {}) || {}; } catch (e) { return {}; } };
  function markSeen(type) { try { const m = seenMap(); m[type] = (m[type] || 0) + 1; KN.store.set(SEEN, m); } catch (e) { /* */ } }
  // phím trong câu hướng dẫn → hiện thành nút bàn phím cho dễ nhìn
  function keyify(html) {
    return html
      .replace(/(Space|Enter|Esc|Shift|WASD|[←→↑↓](?:\s?[←→↑↓])*)/g, '<kbd>$1</kbd>')
      .replace(/(^|[\s(\/·,])([A-Z])(?=[\s)\/·,.]|$)/g, '$1<kbd>$2</kbd>')
      .replace(/(phím\s)(\d[–-]\d)/g, '$1<kbd>$2</kbd>');
  }
  function howSteps(how) {
    const parts = String(how || '').split(/(?<=[.!?])\s+(?=[A-ZÀ-Ỹ0-9“"(])/).map((x) => x.trim()).filter(Boolean);
    return parts.length > 1 ? '<ol class="mg-steps">' + parts.map((x) => '<li>' + keyify(x) + '</li>').join('') + '</ol>' : '<p>' + keyify(parts[0] || '') + '</p>';
  }
  function intro(p, practice) {
    return new Promise((res) => {
      const goal = p.mode === 'duel' ? 'Ai được điểm cao hơn sẽ thắng.' : p.mode === 'buy' ? 'Mặc cả càng khéo càng được giảm nhiều (tối đa <b>15%</b>).' : 'Đạt từ <b>' + Math.round(p.need * 100) + '%</b> trở lên là thành công. Thua thì cuộc đời rẽ sang hướng xấu hơn một chút.';
      const skip = p.mode === 'duel' ? '🏳️ Bỏ cuộc' : p.mode === 'buy' ? '💸 Mua luôn giá gốc' : '🎲 Để số phận quyết định';
      const first = !seenMap()[p.type], canTry = p.mode !== 'duel', hint = hintOf(p);
      const nm = p.type === 'interview' && ivKind(p) !== 'job' ? IV_CTX[ivKind(p)].title : NAME[p.type], how = p.type === 'interview' && ivKind(p) !== 'job' ? '4 lượt hỏi – đáp. Chọn câu trả lời khéo léo nhất trước khi hết giờ (phím 1–3). ' + IV_CTX[ivKind(p)].tip : HOWTO[p.type];
      const box = open('<div class="mini-head"><b>' + nm + '</b><small>' + esc(p.title) + ' · ' + esc(p.label) + '</small></div>' +
        (practice && practice.stopped ? '<div class="mini-new">🧪 Bạn đã dừng lượt chơi thử. Thử lại bao nhiêu lần cũng được, không tính điểm.</div>' : practice ? '<div class="mini-new">🧪 Lượt chơi thử vừa rồi: <b>' + practice.pct + '%</b>' + (p.mode === 'duel' || p.mode === 'buy' ? '' : practice.pct >= Math.round(p.need * 100) ? ' — đủ để thành công rồi! ✅' : ' — chưa đủ ' + Math.round(p.need * 100) + '%, thử thêm hoặc chơi thật nhé.') + '</div>'
          : first ? '<div class="mini-new">🆕 <b>Lần đầu chơi trò này?</b> Đọc 30 giây cách chơi bên dưới' + (canTry ? ', hoặc bấm <b>🧪 Chơi thử</b> để làm quen — lượt thử không tính điểm.' : '.') + '</div>' : '') +
        '<div class="mini-guide">' +
        '<div class="mg-row"><span class="mg-ic">🎯</span><div><b>Mục tiêu</b><p>' + goal + '</p></div></div>' +
        '<div class="mg-row"><span class="mg-ic">🕹️</span><div><b>Cách chơi</b>' + howSteps(how) + '</div></div>' +
        (hint ? '<div class="mg-row"><span class="mg-ic">💪</span><div><b>Chỉ số của bạn ảnh hưởng thế nào</b><p>' + esc(hint) + '</p></div></div>' : '') +
        '</div>' +
        '<div class="mini-btns"><button type="button" class="btn btn-ghost" data-skip>' + skip + '</button>' + (canTry ? '<button type="button" class="btn btn-soft" data-try>🧪 Chơi thử</button>' : '') + '<button type="button" class="btn btn-primary" data-play>▶ Chơi thật!</button></div>' +
        '<p class="mini-keys">⌨️ <kbd>Enter</kbd> chơi thật' + (canTry ? ' · <kbd>T</kbd> chơi thử' : '') + ' · <kbd>Esc</kbd> ' + skip.replace(/^\S+\s/, '').toLowerCase() + '</p>');
      box.querySelector('[data-play]').onclick = () => { sfx('click'); res('play'); };
      box.querySelector('[data-skip]').onclick = () => { sfx('click'); res('skip'); };
      if (canTry) box.querySelector('[data-try]').onclick = () => { sfx('click'); res('try'); };
      onKeys((e) => { if (e.type !== 'keydown') return false; if (e.key === 'Enter') { res('play'); return true; } if (canTry && (e.key === 't' || e.key === 'T')) { res('try'); return true; } if (e.key === 'Escape') { res('skip'); return true; } return false; });
    });
  }
  function finish(score, text, p) {
    return new Promise((res) => {
      const pct = Math.round(score * 100), duel = p.mode === 'duel', buy = p.mode === 'buy', ok = duel || buy ? score >= 0.5 : score >= p.need;
      if (ok && !duel) (KN.Weekly && KN.Weekly.track('minigame'));
      const line = duel ? '⏳ Đang chờ kết quả của đối thủ…' : buy ? (score > 0.01 ? '✅ Được giảm ' + Math.round(score * 15) + '% giá' : '😅 Không bớt được đồng nào') : ok ? '✅ Đạt yêu cầu (' + Math.round(p.need * 100) + '%)' : '❌ Chưa đạt yêu cầu (' + Math.round(p.need * 100) + '%)';
      const verdict = duel ? (ok ? 'Chiến thắng' : 'Thất bại') : buy ? (score > 0.01 ? 'Mặc cả thành công' : 'Không bớt được') : ok ? (score >= 0.9 ? 'Xuất sắc' : 'Thành công') : 'Chưa đạt';
      // ghi kỷ lục / thành tựu (mỗi lượt đúng một lần) rồi hiện tóm tắt thật trên màn kết quả
      let rec = null; try { rec = KN.MiniMeta && KN.MiniMeta.record(p, score, ok); } catch (e) { rec = null; }
      const metaHtml = rec ? '<div class="mini-meta">' + (rec.isBest ? '<span class="gold">🏅 Kỷ lục mới! (cũ ' + rec.prev + '%)</span>' : rec.firstTime ? '<span>🆕 Lần đầu chơi trò này</span>' : '<span>Kỷ lục: <b>' + rec.best + '%</b></span>') + '<span>Lần chơi #' + rec.plays + '</span>' + (rec.streak >= 2 ? '<span>🔥 Chuỗi thắng ' + rec.streak + '</span>' : '') + (rec.dailyDoneNow ? '<span class="gold">🎯 Hoàn thành thử thách hôm nay!</span>' : '') + rec.fresh.map((a) => '<span class="gold">' + a.icon + ' Thành tựu: ' + esc(a.name) + '</span>').join('') + '</div>' : '';
      const box = open('<div class="mini-result"><div class="mini-ring ' + (ok ? 'ok' : 'bad') + '" style="--p:' + pct + '"><div><b>' + pct + '<small>%</small></b><span>' + verdict + '</span></div></div><p class="mini-rtext">' + esc(text) + '</p><p class="mini-goal">' + line + '</p>' + metaHtml + '<div class="mini-btns"><button type="button" class="btn btn-primary" data-ok>' + (duel ? 'Xong' : buy ? 'Xuống tiền 💸' : 'Tiếp tục') + '</button></div></div>');
      sfx(ok ? 'cheer' : 'fail');
      const done = () => { close(); res(score); };
      box.querySelector('[data-ok]').onclick = done;
      onKeys((e) => { if (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ')) { done(); return true; } return false; });
    });
  }
  // điểm vào: trả về điểm 0..1 hoặc null nếu người chơi chọn để số phận quyết định (thách đấu: bỏ cuộc = 0)
  async function run(p) {
    if (!p) return null;
    if (root) close();
    if (KN.Mini) KN.Mini.lastOut = null; curP = p;
    RNG = p.seed ? seeded(p.seed) : Math.random;
    if (p.mode !== 'duel' && KN.Weekly && KN.Weekly.bonus('mini')) p.need = Math.max(0.05, p.need - 0.05);
    try {
      let go = await intro(p), practice = null;
      // chơi thử: chạy minigame thật nhưng không tính điểm, xong quay lại màn hướng dẫn
      while (go === 'try') {
        let tr = null;
        const abortT = new Promise((res) => (abortFn = () => res({ aborted: true })));
        if (root) addQuit(root);
        try { tr = await Promise.race([GAMES[p.type](p), abortT]); } catch (e) { tr = null; }
        abortFn = null; close();
        practice = { pct: tr && !tr.aborted ? Math.round(clamp(tr.score, 0, 1) * 100) : 0, stopped: !tr || !!tr.aborted };
        RNG = p.seed ? seeded(p.seed) : Math.random;
        go = await intro(p, practice);
      }
      if (go !== 'play') { close(); return p.mode === 'duel' ? 0 : null; }
      markSeen(p.type);
      let r;
      const abortP = new Promise((res) => (abortFn = () => res({ aborted: true })));
      if (root) addQuit(root);
      try { r = await Promise.race([GAMES[p.type](p), abortP]); } catch (e) { console.warn('[KN.Mini]', e); abortFn = null; close(); return p.mode === 'duel' ? 0 : null; }
      abortFn = null;
      if (r && r.aborted) { close(); if (KN.Mini.onAbort) KN.Mini.onAbort.forEach((f) => { try { f(); } catch (x) { /* */ } }); return p.mode === 'duel' ? 0 : null; }
      return await finish(clamp(r.score, 0, 1), r.text, p);
    } finally { RNG = Math.random; curP = null; }
  }

  // ------------------------------------------------------------------ khung canvas dùng chung
  // keys: dòng nhắc phím luôn hiện dưới khung chơi (chơi trên máy tính không cần nhớ màn hướng dẫn)
  function canvasGame(title, extraHtml, keys) {
    const box = open('<div class="mini-head"><b>' + title + '</b><small class="mini-hud"></small></div><canvas class="mini-cv" width="640" height="400"></canvas>' + (extraHtml || '') + (keys ? '<p class="mini-keys">⌨️ ' + keys + '</p>' : ''));
    const cv = box.querySelector('canvas'), c = cv.getContext('2d');
    return { box, cv, c, hud: box.querySelector('.mini-hud') };
  }
  function loop(fn) { let last = performance.now(); const tick = (now) => { if (paused) { last = now; rafId = requestAnimationFrame(tick); return; } const dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt, now / 1000) !== false) rafId = requestAnimationFrame(tick); }; rafId = requestAnimationFrame(tick); }
  function tapper(cv, fn) { cv.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(); }); onKeys((e) => { if (e.type === 'keydown' && (e.key === ' ' || e.key === 'Enter')) { if (!e.repeat) fn(); return true; } return false; }); }
  const padBind = (box, sel, fn) => box.querySelectorAll(sel).forEach((b) => { b.onpointerdown = (e) => { e.preventDefault(); fn(b); }; });
  const bigText = (c, txt, y, col, size) => { c.font = '800 ' + (size || 46) + 'px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillStyle = col || '#fff'; c.fillText(txt, 320, y); };
  const countdown = (c, t, go) => { if (t < 0) bigText(c, String(Math.ceil(-t)), 230, '#fff', 70); else if (t < 0.6) bigText(c, go || 'BẮT ĐẦU!', 230, '#ffd23f', 64); };
  // nhân vật que đơn giản (chạy/bơi/rượt đuổi)
  function runner(c, x, y, col, label, ph, skin) {
    const bob = Math.sin(ph * 1.3) * 4;
    c.fillStyle = col; c.fillRect(x - 10, y - 22 + bob, 20, 26); c.fillStyle = skin || '#f2c39a'; c.beginPath(); c.arc(x, y - 32 + bob, 10, 0, 7); c.fill();
    c.strokeStyle = '#222'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 4, y + 4); c.lineTo(x - 10 + Math.sin(ph * 2) * 8, y + 22); c.moveTo(x + 4, y + 4); c.lineTo(x + 10 - Math.sin(ph * 2) * 8, y + 22); c.stroke();
    if (label) { c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText(label, x, y - 48); }
  }
  // nhịp: vòng tròn co lại, khép đúng tâm là lúc bấm
  function beatRing(c, x, y, ph, ok) {
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 16, 0, 7); c.stroke();
    c.strokeStyle = ok ? '#39cf98' : '#ffb347'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 16 + (1 - ph) * 30, 0, 7); c.stroke();
  }

  // ------------------------------------------------------------------ 1. làm bài kiểm tra
  const BANK = [
    ['Thủ đô của Việt Nam là?', 'Hà Nội', ['TP. Hồ Chí Minh', 'Huế', 'Đà Nẵng'], 1],
    ['Sông dài nhất chảy qua Việt Nam là?', 'Sông Mê Kông', ['Sông Hồng', 'Sông Đà', 'Sông Hương'], 2],
    ['Đỉnh núi cao nhất Việt Nam là?', 'Phan Xi Păng', ['Bà Đen', 'Ngọc Linh', 'Langbiang'], 1],
    ['Chiến thắng Điện Biên Phủ năm nào?', '1954', ['1945', '1975', '1968'], 2],
    ['Ngày Quốc khánh Việt Nam?', '2/9', ['30/4', '1/5', '19/8'], 1],
    ['Nước sôi ở bao nhiêu độ C (áp suất thường)?', '100', ['90', '120', '80'], 1],
    ['Hành tinh gần Mặt Trời nhất?', 'Sao Thủy', ['Sao Kim', 'Trái Đất', 'Sao Hỏa'], 2],
    ['Công thức hóa học của nước?', 'H₂O', ['CO₂', 'O₂', 'NaCl'], 1],
    ['“Apple” tiếng Việt là gì?', 'Quả táo', ['Quả cam', 'Quả chuối', 'Quả nho'], 1],
    ['“Teacher” nghĩa là?', 'Giáo viên', ['Học sinh', 'Bác sĩ', 'Kỹ sư'], 1],
    ['Truyện Kiều do ai sáng tác?', 'Nguyễn Du', ['Nguyễn Trãi', 'Hồ Xuân Hương', 'Nam Cao'], 2],
    ['Tác giả “Bình Ngô đại cáo”?', 'Nguyễn Trãi', ['Lý Thường Kiệt', 'Trần Hưng Đạo', 'Lê Lợi'], 3],
    ['Bộ phận nào bơm máu đi khắp cơ thể?', 'Tim', ['Phổi', 'Gan', 'Dạ dày'], 1],
    ['Khí nào cây xanh hấp thụ để quang hợp?', 'CO₂', ['O₂', 'N₂', 'H₂'], 2],
    ['Một năm nhuận có bao nhiêu ngày?', '366', ['365', '364', '360'], 1],
    ['Tốc độ ánh sáng xấp xỉ?', '300.000 km/s', ['30.000 km/s', '3.000 km/s', '3 triệu km/s'], 3],
    ['Đơn vị đo điện trở là?', 'Ôm (Ω)', ['Vôn (V)', 'Ampe (A)', 'Oát (W)'], 3],
    ['Ai tìm ra định luật vạn vật hấp dẫn?', 'Newton', ['Einstein', 'Galileo', 'Darwin'], 2],
    ['Quần đảo Hoàng Sa thuộc thành phố nào?', 'Đà Nẵng', ['Khánh Hòa', 'Quảng Ngãi', 'Hải Phòng'], 3],
    ['“Environment” nghĩa là?', 'Môi trường', ['Năng lượng', 'Kinh tế', 'Chính phủ'], 2],
    ['Số nguyên tố nhỏ nhất?', '2', ['1', '3', '0'], 2],
    ['Thành phần chính của khí quyển Trái Đất?', 'Ni-tơ', ['Ô-xy', 'Các-bon', 'Hi-đrô'], 3],
    ['Vua đầu tiên của nhà Lý?', 'Lý Thái Tổ', ['Lý Thánh Tông', 'Lý Nhân Tông', 'Lý Thái Tông'], 3],
    ['Năm 2008, Hà Nội mở rộng sáp nhập tỉnh nào?', 'Hà Tây', ['Bắc Ninh', 'Hưng Yên', 'Vĩnh Phúc'], 3],
    ['Đạo hàm của x² là?', '2x', ['x', 'x²/2', '2'], 3],
    ['log₁₀(1000) bằng?', '3', ['10', '100', '30'], 3],
    ['“Although” nối hai mệnh đề mang nghĩa?', 'Mặc dù', ['Bởi vì', 'Vì vậy', 'Nếu'], 3],
    ['Ai là tác giả “Tắt đèn”?', 'Ngô Tất Tố', ['Nam Cao', 'Vũ Trọng Phụng', 'Tô Hoài'], 3],
  ];
  function mathQ(level) {
    let a, b, op, ans;
    if (level <= 1) { a = Math.floor(rand(2, 20)); b = Math.floor(rand(2, 20)); op = pick(['+', '−']); if (op === '−' && b > a) [a, b] = [b, a]; ans = op === '+' ? a + b : a - b; }
    else if (level === 2) { op = pick(['×', '+', '−']); a = Math.floor(rand(op === '×' ? 3 : 20, op === '×' ? 13 : 90)); b = Math.floor(rand(op === '×' ? 3 : 10, op === '×' ? 13 : 60)); ans = op === '×' ? a * b : op === '+' ? a + b : a - b; }
    else { op = pick(['×', '÷', '%']); if (op === '÷') { b = Math.floor(rand(3, 15)); ans = Math.floor(rand(4, 25)); a = b * ans; } else if (op === '%') { a = pick([10, 15, 20, 25, 40]); b = pick([80, 120, 200, 360, 500]); ans = a * b / 100; } else { a = Math.floor(rand(12, 40)); b = Math.floor(rand(6, 25)); ans = a * b; } }
    const q = op === '%' ? a + '% của ' + b + ' là?' : a + ' ' + op + ' ' + b + ' = ?';
    const wrong = new Set(); while (wrong.size < 3) { const w = ans + pick([-1, 1]) * Math.max(1, Math.round(Math.abs(ans) * rand(0.05, 0.3) + rand(1, 4))); if (w !== ans) wrong.add(w); }
    return { q, a: String(ans), w: Array.from(wrong).map(String) };
  }
  function quiz(p) {
    return new Promise((res) => {
      const smart = p.ctx.stats.smarts, lvl = p.level || 2;
      // ngân hàng câu hỏi lọc theo cấp; không lặp lại 60 câu gần nhất (lưu máy); độ khó thích ứng: đúng liền 2 câu → tăng 1 cấp, vừa sai → giảm 1 cấp
      let seen = []; try { seen = JSON.parse(localStorage.getItem('kn_quiz_seen') || '[]'); } catch (e) {}
      const fresh = BANK.filter((x) => x[3] <= lvl && !seen.includes(x[0]));
      const pool = shuffle(fresh.length >= 8 ? fresh : BANK.filter((x) => x[3] <= lvl));
      const log = []; let lastWrong = false;
      const mk = (n) => (n % 2 === 0 || !pool.length ? mathQ(lvl) : (() => { const b = pool.pop(); return { q: b[0], a: b[1], w: b[2].slice() }; })());
      const qs = []; for (let k = 0; k < 8; k++) qs.push(mk(k)); // 5 câu chính + 3 câu dự phòng cho quyền “Đổi câu”
      qs.forEach((q) => (q.opts = shuffle([q.a].concat(q.w))));
      const base = 7 + smart / 14 + (lvl <= 1 ? 3 : 0), removeN = smart >= 85 ? 2 : smart >= 70 ? 1 : 0, TOTAL = 5;
      // quyền trợ giúp: mỗi loại dùng một lần; người thông minh có thêm một quyền Đổi câu
      const life = { half: 1, time: 1, swap: smart >= 75 ? 2 : 1 };
      let qi = 0, spare = TOTAL, n = 0, ok = 0, streak = 0, timer = null, left = 0, secs = base, answered = false;
      const box = open('<div class="mini-head"><b>📝 Phòng thi</b><small id="mqN"></small></div><div class="mq-grid"><div class="mq-main"><div class="mini-bar"><i id="mqT"></i></div><div class="mq-card"><small id="mqS"></small><p class="mini-q" id="mqQ"></p></div><div class="mini-ans" id="mqA"></div></div>' +
        '<aside class="mq-side"><h5>Quyền trợ giúp</h5><button type="button" class="mq-life" data-l="half"><b>50 / 50</b><small>Loại 2 đáp án sai</small><i id="lH"></i></button><button type="button" class="mq-life" data-l="time"><b>+ Thời gian</b><small>Thêm 6 giây</small><i id="lT"></i></button><button type="button" class="mq-life" data-l="swap"><b>Đổi câu</b><small>Lấy câu khác</small><i id="lS"></i></button><div class="mq-pips" id="mqP"></div></aside></div><p class="mini-keys">⌨️ Đáp án: <kbd>1</kbd>–<kbd>4</kbd> · Trợ giúp: <kbd>5</kbd> 50/50 · <kbd>6</kbd> thêm giờ · <kbd>7</kbd> đổi câu</p>');
      const pips = () => { box.querySelector('#mqP').innerHTML = Array.from({ length: TOTAL }, (_, k) => '<span class="' + (k < n ? (box._res[k] ? 'ok' : 'bad') : k === n ? 'cur' : '') + '"></span>').join(''); };
      box._res = [];
      const lifeUi = () => { box.querySelector('#lH').textContent = '×' + life.half; box.querySelector('#lT').textContent = '×' + life.time; box.querySelector('#lS').textContent = '×' + life.swap; box.querySelectorAll('.mq-life').forEach((b) => (b.disabled = answered || life[b.dataset.l] <= 0)); };
      const draw = () => {
        const q = qs[qi], hide = new Set(q.w.slice(0, removeN)); q.hidden = q.hidden || hide; q.shown = true;
        box.querySelector('#mqN').textContent = 'Câu ' + (n + 1) + '/' + TOTAL + ' · đúng ' + ok + (streak >= 2 ? ' · 🔥 chuỗi ' + streak : '');
        box.querySelector('#mqS').textContent = q.a && /[0-9]\s*[×x+\-−÷]/.test(q.q) ? 'Toán nhanh' : 'Kiến thức';
        box.querySelector('#mqQ').textContent = q.q;
        box.querySelector('#mqA').innerHTML = q.opts.map((o, k) => '<button type="button" class="mini-opt" data-o="' + esc(o) + '"' + (q.hidden.has(o) ? ' disabled style="opacity:.25"' : '') + '><span>' + (k + 1) + '</span>' + esc(o) + '</button>').join('');
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(b.dataset.o)));
        pips(); lifeUi();
      };
      const startTimer = () => {
        const bar = box.querySelector('#mqT'); bar.style.width = '100%'; clearInterval(timer);
        timer = every(() => { left -= 0.1; bar.style.width = Math.max(0, left / secs * 100) + '%'; bar.style.background = left / secs < 0.3 ? '#ff5c5c' : ''; if (left <= 0) answer(null); }, 100);
      };
      const review = () => {
        const fin = () => res({ score: ok / TOTAL, text: 'Bạn trả lời đúng ' + ok + '/' + TOTAL + ' câu' + (ok === TOTAL ? ' — điểm tuyệt đối!' : '.') });
        try { localStorage.setItem('kn_quiz_seen', JSON.stringify(seen.concat(log.map((x) => x.q)).slice(-60))); } catch (e) {}
        box.innerHTML = '<div class="mini-head"><b>📝 Xem lại bài thi</b><small>' + ok + '/' + TOTAL + ' đúng</small></div><div class="mq-review">' + log.map((x, i) => '<div class="' + (x.ok ? 'ok' : 'bad') + '"><b>' + (x.ok ? '✔' : '✖') + ' Câu ' + (i + 1) + ':</b> ' + esc(x.q) + '<br><small>Đáp án đúng: <b>' + esc(x.a) + '</b>' + (x.ok ? '' : ' · bạn chọn: ' + esc(x.pick || '(hết giờ)')) + ' · ' + esc(x.why) + '</small></div>').join('') + '</div><div class="mini-btns"><button type="button" class="btn btn-primary" data-fin>Tiếp tục <kbd>Enter</kbd></button></div>';
        let gone = false; const go = () => { if (gone) return; gone = true; fin(); };
        box.querySelector('[data-fin]').onclick = go; onKeysOnce((e) => { if (e.key === 'Enter' || e.key === ' ') { go(); return true; } return false; });
      };
      const next = () => {
        if (n >= TOTAL) { clearInterval(timer); review(); return; }
        const ad = clamp(lvl + (streak >= 2 ? 1 : lastWrong ? -1 : 0), 1, 3); // câu kế tiếp thích ứng
        if (n > 0 && qs[qi] && !qs[qi].shown && ad !== lvl) { const ci = pool.map((x) => x[3] <= ad).lastIndexOf(true), cand = ci >= 0 ? pool.splice(ci, 1)[0] : null; const nq = (n % 2 === 0 || !cand) ? mathQ(ad) : { q: cand[0], a: cand[1], w: cand[2].slice() }; nq.opts = shuffle([nq.a].concat(nq.w)); qs[qi] = nq; }
        answered = false; secs = base + (streak >= 3 ? 1.5 : 0); left = secs; draw(); startTimer();
      };
      function answer(o) {
        if (answered) return; answered = true; clearInterval(timer);
        const q = qs[qi], right = o === q.a; box._res.push(right);
        if (right) { ok++; streak++; lastWrong = false; sfx('good'); } else { streak = 0; lastWrong = true; sfx('bad'); }
        log.push({ q: q.q, a: q.a, pick: o, ok: right, why: /[0-9]\s*[×x+\-−÷]/.test(q.q) ? 'phép tính: ' + q.q.replace('= ?', '').replace('?', '').trim() + ' = ' + q.a : 'kiến thức cơ bản — hãy nhớ đáp án này' });
        box.querySelectorAll('.mini-opt').forEach((b) => { if (b.dataset.o === q.a) b.classList.add('right'); else if (b.dataset.o === o) b.classList.add('wrong'); b.disabled = true; });
        n++; qi++; lifeUi(); pips(); setTimeout(next, 700);
      }
      const useLife = (k) => {
        if (answered || life[k] <= 0) return; const q = qs[qi]; life[k]--; sfx('click');
        if (k === 'half') { const w = q.w.filter((x) => !q.hidden.has(x)); shuffle(w).slice(0, 2).forEach((x) => q.hidden.add(x)); box.querySelectorAll('.mini-opt').forEach((b) => { if (q.hidden.has(b.dataset.o)) { b.disabled = true; b.style.opacity = '.25'; } }); }
        else if (k === 'time') { left += 6; secs = Math.max(secs, left); }
        else if (k === 'swap') { if (qi + 1 < qs.length) { qi++; left = secs; draw(); startTimer(); } }
        lifeUi();
      };
      box.querySelectorAll('.mq-life').forEach((b) => (b.onclick = () => useLife(b.dataset.l)));
      onKeys((e) => { if (e.type !== 'keydown') return false; const k = +e.key; if (k >= 1 && k <= 4) { const b = box.querySelectorAll('.mini-opt')[k - 1]; if (b && !b.disabled && !answered) answer(b.dataset.o); return true; } if (k === 5) { useLife('half'); return true; } if (k === 6) { useLife('time'); return true; } if (k === 7) { useLife('swap'); return true; } return false; });
      next();
    });
  }

  // ------------------------------------------------------------------ 2. sút phạt đền
  // Sút phạt đền — CONFIG chỉnh cân bằng. Độ khó: sức khỏe → vùng lực + độ rung tâm ngắm; need (cấp sự kiện) → thủ môn giỏi hơn;
  // áp lực tăng theo quả (vùng xanh hẹp lại, rung nhiều hơn). Thủ môn có “thói quen” nhảy về 1 bên, lộ dần sau mỗi quả.
  const PEN_CFG = { shots: 5, sweetBase: 0.2, sweetHp: 0.12, pressure: 0.018, shakeBase: 0.012, habitBase: 0.55, habitNeed: 0.2, cornerSave: 0.25 };
  // thuần túy, dễ test: trả về 'goal' | 'saved' | 'out'
  function penaltyResolve(ax, ay, pw, dive, r, sweet) {
    const col = ax < 1 / 3 ? 0 : ax > 2 / 3 ? 2 : 1;
    const power = Math.abs(pw - 0.75) < sweet ? 'ok' : pw < 0.75 ? 'weak' : 'over';
    if (power === 'over' && r < 0.7) return 'out';
    const topCorner = ay < 0.25 && col !== 1;
    let pSave = dive === col ? (topCorner ? PEN_CFG.cornerSave : 0.88) : (Math.abs(dive - col) === 1 && power === 'weak' ? 0.4 : 0.03);
    if (power === 'weak' && dive === col) pSave = Math.min(0.97, pSave + 0.1);
    return ((r * 7.31) % 1) < pSave ? 'saved' : 'goal';
  }
  function penalty(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health, { cv, c, hud } = canvasGame('⚽ Sút phạt đền', '', 'Space/chạm 3 lần: chốt hướng ngang → độ cao → lực (vạch cam vào vùng xanh). Thủ môn có thói quen nhảy một bên — quan sát!');
      const speed = 1.6 - hp / 100 * 0.9;
      const habitSide = Math.random() < 0.5 ? 0 : 2, habitP = clamp(PEN_CFG.habitBase + p.need * PEN_CFG.habitNeed, 0.5, 0.8);
      const seen = [0, 0, 0];
      let shot = 0, goals = 0, phase = 0, t = 0, ax = 0, ay = 0, pw = 0, kx = 320, kTarget = 320, result = '', ball = null, shake = 0;
      const GX = 140, GY = 90, GW = 360, GH = 170, ky = 200;
      const sweetNow = () => Math.max(0.06, PEN_CFG.sweetBase - PEN_CFG.pressure * shot * 2 + hp / 100 * PEN_CFG.sweetHp - 0.06);
      const wob = () => (Math.sin(t * 23) + Math.sin(t * 17.3)) * 0.5 * (PEN_CFG.shakeBase + shot * 0.01) * (1.3 - hp / 150);
      const next = () => { phase = 0; t = rnd() * 3; ax = ay = pw = 0; kx = 320; ball = null; result = ''; };
      tapper(cv, () => {
        if (phase === 0) { ax = clamp(0.5 + 0.5 * Math.sin(t * 2.6 / speed) + wob(), 0, 1); phase = 1; sfx('click'); }
        else if (phase === 1) { ay = clamp(0.5 + 0.5 * Math.sin(t * 2.9 / speed) + wob(), 0, 1); phase = 2; sfx('click'); }
        else if (phase === 2) {
          pw = 0.5 + 0.5 * Math.sin(t * 3.4 / speed); phase = 3; sfx('kick');
          const dive = rnd() < habitP ? habitSide : [0, 1, 2][Math.floor(rnd() * 3)];
          seen[dive]++;
          const r = rnd(), out = penaltyResolve(ax, ay, pw, dive, r, sweetNow());
          const tx = GX + ax * GW, ty = GY + ay * GH;
          kTarget = GX + (dive + 0.5) * GW / 3;
          ball = { x: 320, y: 360, tx: out === 'out' ? tx + (ax < 0.5 ? -60 : 60) : tx, ty: out === 'out' ? GY - 40 : ty, goal: out === 'goal' };
          result = out === 'goal' ? 'VÀOOOO!' : out === 'saved' ? 'Thủ môn cản phá!' : 'Ra ngoài!';
          if (out === 'goal') goals++;
          shot++;
          setTimeout(() => { if (shot >= PEN_CFG.shots) { phase = 9; setTimeout(() => res({ score: goals / PEN_CFG.shots, text: 'Bạn sút thành công ' + goals + '/' + PEN_CFG.shots + ' quả phạt đền.' }), 300); } else next(); }, 1300);
        }
      });
      loop((dt) => {
        t += dt;
        c.fillStyle = '#3f8f3f'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#47a047' : '#3f8f3f'; c.fillRect(0, 260 + i * 18, 640, 18); }
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(GX, GY, GW, GH);
        c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(GX, GY, GW, GH);
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(GX + i * GW / 12, GY); c.lineTo(GX + i * GW / 12, GY + GH); c.stroke(); }
        if (phase === 3) kx += (kTarget - kx) * Math.min(1, dt * 7); else kx = 320 + Math.sin(t * 1.7) * 40;
        c.fillStyle = '#ffd23f'; c.fillRect(kx - 22, ky - 10, 44, 60); c.fillStyle = '#f2c39a'; c.beginPath(); c.arc(kx, ky - 24, 15, 0, 7); c.fill();
        c.fillStyle = '#ffd23f'; c.fillRect(kx - 46, ky, 24, 12); c.fillRect(kx + 22, ky, 24, 12);
        const rx = 0.5 + 0.5 * Math.sin(t * 2.6 / speed), ry = 0.5 + 0.5 * Math.sin(t * 2.9 / speed);
        const cx = GX + (phase >= 1 ? ax : clamp(rx + wob(), 0, 1)) * GW;
        const cy = GY + (phase >= 2 ? ay : phase === 1 ? clamp(ry + wob(), 0, 1) : 0.5) * GH;
        if (phase < 3) { c.strokeStyle = '#ff3b3b'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 16, 0, 7); c.moveTo(cx - 24, cy); c.lineTo(cx + 24, cy); c.moveTo(cx, cy - 24); c.lineTo(cx, cy + 24); c.stroke(); }
        if (phase === 2) { const v = 0.5 + 0.5 * Math.sin(t * 3.4 / speed), sw = sweetNow(); c.fillStyle = '#222'; c.fillRect(600, 100, 22, 240); c.fillStyle = '#39cf98'; c.fillRect(600, 100 + (1 - 0.75 - sw) * 240, 22, sw * 2 * 240); c.fillStyle = '#ffb347'; c.fillRect(596, 100 + (1 - v) * 240 - 3, 30, 6); }
        const bx = ball ? ball.x : 320, by = ball ? ball.y : 360;
        if (ball) { ball.x += (ball.tx - ball.x) * Math.min(1, dt * 6); ball.y += (ball.ty - ball.y) * Math.min(1, dt * 6); }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, ball ? 10 : 13, 0, 7); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(bx, by, 4, 0, 7); c.fill();
        if (result) bigText(c, result, 60, ball && ball.goal ? '#ffd23f' : '#fff', 38);
        const tot = seen[0] + seen[1] + seen[2], fav = seen.indexOf(Math.max(...seen));
        const tip = tot >= 2 && seen[fav] / tot >= 0.6 ? ' · 👀 thủ môn hay nhảy ' + ['TRÁI', 'GIỮA', 'PHẢI'][fav] : '';
        hud.textContent = 'Quả ' + Math.min(shot + 1, PEN_CFG.shots) + '/' + PEN_CFG.shots + ' · vào ' + goals + tip + (phase === 0 ? ' · chốt hướng' : phase === 1 ? ' · chốt độ cao' : phase === 2 ? ' · chốt lực' : '');
      });
    });
  }

  // ------------------------------------------------------------------ 3. bắt penalty (thủ môn)
  // Bắt penalty — CONFIG. Cửa sổ phản xạ = thời gian bóng bay (hp cao → dài). Cầu thủ có “tell” 0.3–0.6s trước khi sút,
  // một phần tell là đánh lừa (fakeP tăng theo need). Hồ sơ cầu thủ: mỗi người có thiên hướng riêng, lộ qua các quả.
  const KP_CFG = { shots: 5, runup: 1.4, tellMin: 0.3, tellMax: 0.6, fakeBase: 0.15, fakeNeed: 0.35, bias: 0.55 };
  function keeper(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🧤 Bắt penalty', '<div class="mini-pad"><button type="button" data-c="0">◀ Trái <kbd>←</kbd></button><button type="button" data-c="1">⬇ Giữa <kbd>↓</kbd></button><button type="button" data-c="2">Phải ▶ <kbd>→</kbd></button></div>', 'Dáng chạy đà + ánh nhìn (vạch trắng) báo hướng, nhưng có thể là đánh lừa. Chọn sớm = liều, chọn muộn = không kịp. <kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>');
      const win = clamp(0.36 + hp / 100 * 0.3 - p.need * 0.12, 0.3, 0.7);
      const fakeP = clamp(KP_CFG.fakeBase + p.need * KP_CFG.fakeNeed, 0.15, 0.5);
      const GX = 140, GY = 70, GW = 360, GH = 170;
      const profiles = [{ n: 'Thích sút góc trái', w: [0.55, 0.15, 0.3] }, { n: 'Thích sút góc phải', w: [0.3, 0.15, 0.55] }, { n: 'Hay sút giữa', w: [0.25, 0.5, 0.25] }, { n: 'Khó đoán', w: [0.34, 0.32, 0.34] }];
      let prof = pick(profiles), shot = 0, saves = 0, phase = 'run', pt = 0, target = 1, look = 1, dive = null, diveAt = 0, ball = null, msg = '', t = 0, tell = 0.45, early = false;
      const draw = (w) => { let r = rnd(), i = 0; while (i < 2 && r > w[i]) { r -= w[i]; i++; } return i; };
      const next = () => { target = draw(prof.w); look = rnd() < fakeP ? (target + 1 + Math.floor(rnd() * 2)) % 3 : target; phase = 'run'; pt = 0; dive = null; ball = null; msg = ''; early = false; tell = rand(KP_CFG.tellMin, KP_CFG.tellMax); };
      next();
      const choose = (col) => { if (phase === 'end' || phase === 'res' || dive != null) return; dive = col; diveAt = phase === 'run' ? pt : -1; early = phase === 'run' && pt < KP_CFG.runup - tell; sfx('click'); };
      padBind(box, '[data-c]', (b) => choose(+b.dataset.c));
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); choose(clamp(Math.floor((e.clientX - r.left) / r.width * 3), 0, 2)); });
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const m = { ArrowLeft: 0, a: 0, A: 0, ArrowDown: 1, ArrowUp: 1, s: 1, S: 1, ' ': 1, ArrowRight: 2, d: 2, D: 2 }[e.key]; if (m == null) return false; choose(m); return true; });
      loop((dt) => {
        t += dt; pt += dt;
        if (phase === 'run' && pt >= KP_CFG.runup) { phase = 'fly'; pt = 0; ball = { tx: GX + (target + 0.5) * GW / 3 + rand(-35, 35), ty: GY + rand(30, GH - 25) }; sfx('kick'); }
        else if (phase === 'fly' && pt >= win) {
          // nhảy sớm (trước tell) mà đúng thì vẫn bắt được; nhảy sớm mà sai thì mất quả — đã nằm trong kết quả đúng/sai
          const saved = dive === target; if (saved) saves++; shot++;
          msg = saved ? pick(['CẢN PHÁ!', 'BẮT GỌN!', 'XUẤT THẦN!']) : dive == null ? 'Không kịp phản xạ!' : early ? 'Nhảy sớm quá — bị lừa!' : 'VÀO LƯỚI…';
          sfx(saved ? 'good' : 'bad'); phase = 'res'; pt = 0;
        } else if (phase === 'res' && pt >= 1.3) {
          if (shot >= KP_CFG.shots) { phase = 'end'; const score = [0, 0.3, 0.55, 0.75, 0.9, 1][saves]; setTimeout(() => res({ score, text: 'Bạn cản phá ' + saves + '/' + KP_CFG.shots + ' quả.' }), 200); }
          else next();
        }
        c.fillStyle = '#3f8f3f'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#47a047' : '#3f8f3f'; c.fillRect(0, 240 + i * 18, 640, 18); }
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(GX, GY, GW, GH);
        c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(GX, GY, GW, GH);
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(GX + i * GW / 3, GY); c.lineTo(GX + i * GW / 3, GY + GH); c.stroke(); }
        const kTx = dive == null ? 320 : GX + (dive + 0.5) * GW / 3;
        const kx = phase === 'run' && dive == null ? 320 + Math.sin(t * 2) * 10 : kTx;
        const tilt = dive == null || dive === 1 ? 0 : (dive === 0 ? -1 : 1) * 0.5;
        c.save(); c.translate(kx, GY + GH - 45); c.rotate(tilt);
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.top) || '#ffd23f'; c.fillRect(-20, -10, 40, 56);
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.skin) || '#f2c39a'; c.beginPath(); c.arc(0, -24, 14, 0, 7); c.fill();
        c.fillStyle = '#39cf98'; c.fillRect(-48, -14, 26, 12); c.fillRect(22, -14, 26, 12);
        c.restore();
        // “tell” chỉ hiện trong 0.3–0.6s cuối của giai đoạn chạy đà
        const showTell = phase === 'run' && pt > KP_CFG.runup - tell;
        const kickX = 320 + (phase === 'run' ? (showTell ? (look - 1) * 26 * Math.min(1, (pt - (KP_CFG.runup - tell)) / (tell * 0.8)) : 0) : 0), kickY = 395 - (phase === 'run' ? Math.min(1, pt / KP_CFG.runup) * 30 : 30);
        c.fillStyle = '#d63c3c'; c.fillRect(kickX - 14, kickY - 50, 28, 36); c.fillStyle = '#c98d64'; c.beginPath(); c.arc(kickX, kickY - 62, 11, 0, 7); c.fill();
        if (showTell) { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(kickX, kickY - 80); c.lineTo(kickX + (look - 1) * 40, kickY - 100); c.stroke(); }
        let bx = 320, by = 340, br = 12;
        if (ball) { const k = phase === 'fly' ? Math.min(1, pt / win) : 1; bx = 320 + (ball.tx - 320) * k; by = 340 + (ball.ty - 340) * k; br = 12 - 4 * k; if (phase !== 'fly' && dive === target) { bx = kTx; by = GY + GH - 60; } }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(bx, by, br * 0.35, 0, 7); c.fill();
        if (msg) bigText(c, msg, 40, msg.includes('!') && !msg.startsWith('Không') && !msg.startsWith('Nhảy') ? '#ffd23f' : '#fff', 30);
        hud.textContent = 'Quả ' + Math.min(shot + 1, KP_CFG.shots) + '/' + KP_CFG.shots + ' · cản ' + saves + ' · 👤 ' + prof.n + (phase === 'run' ? (dive == null ? '' : ' · đã chọn') : '');
      });
    });
  }

  // ------------------------------------------------------------------ 4. canh thời điểm (ném rổ / đập bóng / đập cầu)
  function shoot(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health, { cv, c, hud } = canvasGame('🏀 Canh thời điểm', '', 'Bấm <kbd>Space</kbd> (hoặc chạm màn hình) đúng lúc vạch cam nằm trong vùng xanh');
      const zone = 0.06 + hp / 100 * 0.12, speed = 1.0 + p.need * 1.2;
      let n = 0, hits = 0, t = 0, center = rand(0.25, 0.75), flash = 0, msg = '', done = false;
      tapper(cv, () => {
        if (done) return;
        const pos = 0.5 + 0.5 * Math.sin(t * speed * 2.2);
        const ok = Math.abs(pos - center) < zone;
        if (ok) { hits++; msg = pick(['Vào!', 'Đẹp!', 'Chuẩn!']); sfx('good'); } else { msg = 'Trượt!'; sfx('bad'); }
        flash = 1; n++; center = rand(0.2, 0.8);
        if (n >= 5) { done = true; setTimeout(() => res({ score: hits / 5, text: 'Bạn thực hiện thành công ' + hits + '/5 lượt.' }), 700); }
      });
      loop((dt) => {
        t += dt; flash = Math.max(0, flash - dt * 1.5);
        c.fillStyle = '#c47a3b'; c.fillRect(0, 0, 640, 400);
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.arc(320, 420, 200, Math.PI, 0); c.stroke();
        c.fillStyle = '#fff'; c.fillRect(270, 40, 100, 70); c.strokeStyle = '#e8702a'; c.lineWidth = 6; c.beginPath(); c.ellipse(320, 120, 34, 8, 0, 0, 7); c.stroke();
        const pos = 0.5 + 0.5 * Math.sin(t * speed * 2.2);
        c.fillStyle = '#222'; c.fillRect(80, 300, 480, 26);
        c.fillStyle = '#39cf98'; c.fillRect(80 + (center - zone) * 480, 300, zone * 2 * 480, 26);
        c.fillStyle = '#ffb347'; c.fillRect(80 + pos * 480 - 4, 292, 8, 42);
        if (flash > 0) { c.globalAlpha = flash; bigText(c, msg, 220, msg === 'Trượt!' ? '#ff6b6b' : '#ffd23f'); c.globalAlpha = 1; }
        hud.textContent = 'Lượt ' + Math.min(n + 1, 5) + '/5 · thành công ' + hits;
      });
    });
  }

  // ------------------------------------------------------------------ 5. chạy nước rút
  function sprint(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🏃 Chạy nước rút', '<div class="mini-pad"><button type="button" data-l>◀ TRÁI <kbd>←</kbd></button><button type="button" data-boost>💥 BÙNG NỔ <kbd>Space</kbd></button><button type="button" data-r>PHẢI ▶ <kbd>→</kbd></button></div>', '<b>Quản lý thể lực</b>: bấm quá dày sẽ cạn sức và chạy chậm lại. <kbd>Space</kbd> bùng nổ (tốn 35 thể lực, hồi chiêu 3 giây) để nước rút cuối. Bấm luân phiên <kbd>←</kbd> <kbd>→</kbd> (hoặc <kbd>A</kbd> <kbd>D</kbd>) thật nhanh. Bấm một phím liên tục sẽ không chạy.');
      const step = 2.4 + hp / 100 * 1.6; // sức khỏe cao → mỗi nhịp chân đi xa hơn
      // 3 đối thủ có phong cách: 0 = lao nhanh đầu (xuống sức cuối), 1 = đều, 2 = về đích mạnh. Độ khó: vận tốc gốc tăng theo need.
      const SPR_CFG = { lock: 0.8, goMin: 1.8, goMax: 3.4, pbKey: 'kn_sprint_pb' };
      const STYLE = [(f) => 1.18 - 0.4 * f, () => 1, (f) => 0.82 + 0.4 * f];
      const rivals = [0, 1, 2].map((i) => ({ x: 0, v: 7 + p.need * 6 + i * 1.0 + rand(-0.6, 0.6), st: i, name: ['Tay lao nhanh', 'Chạy đều', 'Về đích mạnh'][i] }));
      let pb = 0; try { pb = +localStorage.getItem(SPR_CFG.pbKey) || 0; } catch (e) {}
      let me = 0, v = 0, last = null, t = -rand(SPR_CFG.goMin, SPR_CFG.goMax), goT = -t, finished = false, stam = 100, cd = 0, flash = 0, lockT = 0, falseStarts = 0, react = 0, msg = '', msgT = 0;
      const press = (side) => {
        if (finished) return;
        if (t < 0) { falseStarts++; lockT = SPR_CFG.lock * falseStarts; msg = 'XUẤT PHÁT SỚM!'; msgT = 1; sfx('bad'); return; }
        if (lockT > 0 || side === last) return;
        if (!react) react = Math.round(t * 1000);
        last = side; const gas = stam <= 0; v += step * (gas ? 0.35 : 1); stam = Math.max(0, stam - 3); sfx('click');
      };
      const boost = () => { if (t < 0 || finished || lockT > 0 || cd > 0 || stam < 35) return; stam -= 35; cd = 3; v += step * 4.5; flash = 0.5; sfx('kick'); };
      padBind(box, '[data-l]', () => press('l')); padBind(box, '[data-r]', () => press('r')); padBind(box, '[data-boost]', boost);
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { press('l'); return true; } if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { press('r'); return true; } if (e.key === ' ') { boost(); return true; } return false; });
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        if (t > 0 && !finished) {
          stam = Math.min(100, stam + 6 * dt); cd = Math.max(0, cd - dt); flash = Math.max(0, flash - dt); lockT = Math.max(0, lockT - dt);
          v = Math.max(0, v - v * dt * 1.8); me += v * dt;
          rivals.forEach((r) => (r.x += r.v * dt * STYLE[r.st](Math.min(1, r.x / 100)) * (0.9 + Math.sin(t * 3 + r.v) * 0.1)));
          if (me >= 100) {
            finished = true; const place = 1 + rivals.filter((r) => r.x >= 100).length, tt = t;
            const newPb = !pb || tt < pb; if (newPb) { try { localStorage.setItem(SPR_CFG.pbKey, String(tt.toFixed(2))); } catch (e) {} }
            setTimeout(() => res({ score: [1, 0.66, 0.4, 0.15][place - 1], text: 'Bạn về đích thứ ' + place + '/4 · ' + tt.toFixed(2) + 's' + (react ? ' · phản xạ ' + react + 'ms' : '') + (falseStarts ? ' · ' + falseStarts + ' lần xuất phát sớm' : '') + (newPb ? ' · 🏅 KỶ LỤC MỚI!' : ''), }), 900);
          }
          else if (rivals.every((r) => r.x >= 100) && t > 25) { finished = true; setTimeout(() => res({ score: me / 100 * 0.3, text: 'Bạn bị bỏ xa, về cuối.' }), 900); }
        }
        c.fillStyle = '#b5482c'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#c4553a' : '#b5482c'; c.fillRect(0, 70 + i * 75, 640, 75); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 70 + i * 75); c.lineTo(640, 70 + i * 75); c.stroke(); }
        c.fillStyle = '#fff'; c.fillRect(600, 70, 8, 300);
        const px = (x) => 30 + Math.min(100, x) / 100 * 560;
        if (pb && t > 0 && !finished) { c.globalAlpha = 0.35; runner(c, px(100 * t / pb), 110, '#ffffff', '👻 Kỷ lục ' + pb + 's', 100 * t / pb); c.globalAlpha = 1; }
        rivals.forEach((r, i) => runner(c, px(r.x), 70 + (i + 1) * 75 + 40, ['#5b5fc7', '#2f9e9e', '#9b59b6'][i], r.name, r.x));
        runner(c, px(me), 110, (p.ctx.appearance && p.ctx.appearance.top) || '#ffd23f', 'BẠN', me, p.ctx.appearance && p.ctx.appearance.skin);
        c.fillStyle = 'rgba(8,12,22,.7)'; c.fillRect(14, 12, 300, 44); c.fillStyle = '#9fb0cc'; c.font = '700 12px sans-serif'; c.textAlign = 'left'; c.fillText('THỂ LỰC', 24, 28);
        c.fillStyle = '#232d40'; c.fillRect(24, 34, 190, 10); c.fillStyle = stam > 50 ? '#45c486' : stam > 20 ? '#ffb547' : '#ef6a62'; c.fillRect(24, 34, 190 * stam / 100, 10);
        c.fillStyle = cd > 0 ? '#9fb0cc' : stam >= 35 ? '#ffd23f' : '#6f7d99'; c.fillText(cd > 0 ? 'Bùng nổ: ' + cd.toFixed(1) + 's' : stam >= 35 ? '💥 Sẵn sàng bùng nổ!' : 'Chưa đủ thể lực', 224, 43);
        if (flash > 0) { c.fillStyle = 'rgba(255,210,63,' + flash * 0.5 + ')'; c.fillRect(0, 0, 640, 400); }
        if (t < 0) bigText(c, 'SẴN SÀNG…', 230, '#fff', 56); else if (t < 0.6) bigText(c, 'CHẠY!', 230, '#ffd23f', 64);
        if (lockT > 0) bigText(c, 'XUẤT PHÁT SỚM! khựng ' + lockT.toFixed(1) + 's', 300, '#ff6b6b', 26); else if (msgT > 0) bigText(c, msg, 300, '#ff6b6b', 26);
        hud.textContent = Math.round(Math.min(100, me)) + ' m · tốc độ ' + v.toFixed(1) + (pb ? ' · kỷ lục ' + pb + 's' : '');
      });
    });
  }

  // ------------------------------------------------------------------ 6. bơi (giữ nhịp + thở)
  function swim(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🏊 Bơi', '<div class="mini-pad"><button type="button" data-s="l">◀ Tay trái <kbd>←</kbd></button><button type="button" data-s="b">🫧 Thở <kbd>Space</kbd></button><button type="button" data-s="r">Tay phải ▶ <kbd>→</kbd></button></div>', 'Bấm luân phiên <kbd>←</kbd> <kbd>→</kbd> mỗi khi vòng cam co lại sát vòng trắng (vòng chuyển xanh lá = đúng nhịp). Thanh ô-xy gần hết thì bấm <kbd>Space</kbd> để ngoi lên thở. Bấm loạn sẽ mất sức!');
      const T = 0.5, tol = 0.2 + hp / 100 * 0.1, step = 6 + hp / 100 * 3, LEN = 50;
      const rivals = [0, 1].map((i) => ({ x: 0, v: 6.3 + p.need * 4 + i * 0.7 + rand(-0.4, 0.4) }));
      let me = 0, v = 0, last = null, lastT = -9, t = -2.5, o2 = 100, stall = 0, done = false, msg = '', msgT = 0, good = 0, total = 0;
      const say = (m) => { msg = m; msgT = 0.8; };
      const phase = () => (((t % T) + T) % T) / T;
      const stroke = (side) => {
        if (t < 0 || done || stall > 0 || side === last || t - lastT < T * 0.75) return;
        last = side; lastT = t; total++;
        const ph = phase(), d = Math.min(ph, 1 - ph);
        if (d < tol) { v += step; good++; sfx('click'); } else { v += step * 0.3; say('Lệch nhịp!'); }
      };
      // lật người ở thành hồ (25 m): bấm Space đúng lúc vòng sáng 0.5–0.9s → đạp thành lấy đà; muộn/sớm thì mất nhịp
      let turning = false, turnT = 0, turned = false;
      const breathe = () => {
        if (t < 0 || done) return;
        if (turning) { turning = false; turned = true; if (turnT > 0.5 && turnT < 0.9) { v += step * 2.2; say('LẬT HOÀN HẢO!'); sfx('good'); } else { v += step * 0.4; say(turnT < 0.5 ? 'Lật sớm — mất đà' : 'Lật muộn — chậm'); sfx('bad'); } return; }
        if (stall > 0) return; o2 = 100; stall = 0.35; say('Hít…');
      };
      padBind(box, '[data-s]', (b) => (b.dataset.s === 'b' ? breathe() : stroke(b.dataset.s)));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') stroke('l'); else if (k === 'ArrowRight' || k === 'd' || k === 'D') stroke('r'); else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') breathe(); else return false; return true; });
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        if (t > 0 && !done) {
          if (stall > 0) { stall -= dt; v *= Math.max(0, 1 - dt * 4); }
          o2 -= dt * 14;
          if (o2 <= 0) { o2 = 45; stall = 1.5; v = 0; say('SẶC NƯỚC!'); sfx('bad'); }
          v = Math.max(0, v - v * dt * 1.6);
          if (turning) { turnT += dt; v = 0; if (turnT > 1.3) { turning = false; turned = true; say('Quên lật! Mất thời gian'); sfx('bad'); } }
          else { me += v * dt * 0.5; if (!turned && me >= LEN / 2) { me = LEN / 2; turning = true; turnT = 0; } }
          rivals.forEach((r) => { if (r.pause > 0) { r.pause -= dt; return; } r.x += r.v * 0.5 * dt * (0.92 + Math.sin(t * 2 + r.v) * 0.08); if (!r.tn && r.x >= LEN / 2) { r.tn = true; r.pause = 0.45; } });
          if (me >= LEN) { done = true; const place = 1 + rivals.filter((r) => r.x >= LEN).length; setTimeout(() => res({ score: [1, 0.6, 0.25][place - 1], text: 'Bạn chạm tường thứ ' + place + '/3 · ' + good + '/' + total + ' sải đúng nhịp.' }), 900); }
          else if (rivals.every((r) => r.x >= LEN) && t > 30) { done = true; setTimeout(() => res({ score: me / LEN * 0.25, text: 'Bạn đuối sức, về cuối.' }), 900); }
        }
        c.fillStyle = '#1d6fa5'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 3; i++) { c.fillStyle = i % 2 ? '#2280bd' : '#1d6fa5'; c.fillRect(0, 100 + i * 90, 640, 90); }
        c.strokeStyle = '#ffd23f'; c.setLineDash([10, 8]); c.lineWidth = 3; for (let i = 0; i <= 3; i++) { c.beginPath(); c.moveTo(0, 100 + i * 90); c.lineTo(640, 100 + i * 90); c.stroke(); } c.setLineDash([]);
        c.fillStyle = '#fff'; c.fillRect(604, 100, 6, 270);
        const px = (x) => { const d = Math.min(LEN, x), f = (d % (LEN / 2)) / (LEN / 2); return 30 + (d >= LEN ? 0 : d >= LEN / 2 ? 1 - f : f) * 560; };
        const swimmer = (x, y, col, label, ph) => { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - 24, y + 4, 26, 7, 0, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill(); c.strokeStyle = '#f2c39a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 18 * Math.cos(ph), y - 14 * Math.sin(ph)); c.stroke(); if (label) { c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText(label, x, y - 22); } };
        rivals.forEach((r, i) => swimmer(px(r.x), 145 + (i + 1) * 90, ['#9b59b6', '#2f9e9e'][i], 'Đối thủ', r.x * 2));
        swimmer(px(me), 145, '#ffd23f', 'BẠN', me * 2 + (t - lastT < 0.2 ? 2 : 0));
        // nhịp tay + ô-xy
        const ph = phase(); beatRing(c, 580, 50, ph, Math.min(ph, 1 - ph) < tol);
        c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.fillText(turning ? 'LẬT! Space' : 'Bấm khi vòng khép', 580, 96);
        if (turning) { const k = clamp(turnT / 1.3, 0, 1); c.strokeStyle = turnT > 0.5 && turnT < 0.9 ? '#45c486' : '#fff'; c.lineWidth = 6; c.beginPath(); c.arc(320, 70, 34 * (1.4 - k), 0, 7); c.stroke(); }
        c.fillStyle = '#111'; c.fillRect(20, 30, 200, 16); c.fillStyle = o2 < 30 ? '#ff5c5c' : '#9ad1ff'; c.fillRect(22, 32, 196 * Math.max(0, o2) / 100, 12);
        c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'left'; c.fillText('Ô-xy' + (o2 < 30 ? ' — BẤM SPACE ĐỂ THỞ!' : ' (Space để thở)'), 22, 64);
        if (msgT > 0) bigText(c, msg, 90, msg === 'SẶC NƯỚC!' ? '#ff6b6b' : '#ffd23f', 30);
        countdown(c, t, 'BƠI!');
        hud.textContent = Math.round(Math.min(LEN, me)) + '/' + LEN + ' m · đúng nhịp ' + good + '/' + total;
      });
    });
  }

  // ------------------------------------------------------------------ 7. rượt đuổi (chạy + nhảy chướng ngại)
  // Rượt đuổi — 3 làn, nhảy (vật thấp) / trượt (xà ngang) / đổi làn (vật chắn). Khoảng cách `gap` (m) là thước đo thắng thua.
  // Độ khó: tốc độ mình = 8.2 + sức khỏe×0.03; tốc độ đối phương = 8.0 + need×2.2. Mỗi lần va: chậm 1.2s và +gap. Tăng tốc có hồi chiêu.
  // Vai: 'chaser' (mặc định, tóm tên kia trước khi hết giờ) hoặc 'chased' (chạy trốn: sống sót đến hết giờ, không để bị bắt kịp).
  const CH_CFG = { dur: 45, gap0: 20, hit: 4.5, lane: 3, boostCd: 6, boostT: 1.2, boostMul: 1.6, catchGap: 1, shortcut: 4, spacing: [9, 15], len: 460 };
  // sinh chướng ngại thuần túy: luôn chừa ít nhất 1 làn không bị chắn ở mỗi hàng (kiểm tra bằng chaseGenOk)
  function chaseGen(rng, cfg) {
    const out = [], kinds = ['low', 'high', 'block'];
    for (let z = 14; z < cfg.len; z += cfg.spacing[0] + rng() * (cfg.spacing[1] - cfg.spacing[0])) {
      const lane = Math.floor(rng() * 3), kind = kinds[Math.floor(rng() * 3)];
      out.push({ z, lane, kind, hit: false });
      if (kind === 'block' && rng() < 0.4) out.push({ z, lane: (lane + 1 + Math.floor(rng() * 2)) % 3, kind: 'block', hit: false }); // 2 làn chắn, vẫn còn 1 làn
      else if (kind !== 'block' && rng() < 0.3) out.push({ z, lane: (lane + 1) % 3, kind: kinds[Math.floor(rng() * 2)], hit: false });
      if (rng() < 0.18) { const sl = (lane + 2) % 3; out.push({ z: z + 3, lane: sl, kind: 'bolt', hit: false }, { z: z + 5.5, lane: sl, kind: 'high', hit: false }); } // lối tắt ⚡: ăn được -gap nhưng ngay sau là xà ngang
    }
    return out.sort((a, b) => a.z - b.z);
  }
  function chaseGenOk(obs) { const rows = {}; obs.forEach((o) => { if (o.kind === 'block') (rows[o.z] = rows[o.z] || new Set()).add(o.lane); }); return Object.values(rows).every((s) => s.size < 3); }
  function chase(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const tt = fold((p.title || '') + ' ' + (p.label || '')), chased = p.role === 'chased' || /(bo chay|tron|chuon|chay tron|tron thoat|bi duoi)/.test(tt);
      const { box, cv, c, hud } = canvasGame(chased ? '🏃 Chạy trốn' : '🚓 Rượt đuổi', '<div class="mini-pad"><button type="button" data-k="l">◀ <kbd>←</kbd></button><button type="button" data-k="j">⤴ Nhảy <kbd>↑</kbd></button><button type="button" data-k="s">⤵ Trượt <kbd>↓</kbd></button><button type="button" data-k="b">💥 Tăng tốc <kbd>Space</kbd></button><button type="button" data-k="r">▶ <kbd>→</kbd></button></div>',
        '<kbd>←</kbd><kbd>→</kbd> đổi làn · <kbd>↑</kbd> nhảy qua vật thấp 📦 · <kbd>↓</kbd> trượt dưới xà ngang · vật chắn 🧱 phải né sang làn khác · <kbd>Space</kbd> tăng tốc · ⚡ là lối tắt (ăn được rút ngắn khoảng cách nhưng ngay sau là xà ngang). Vuốt trên màn hình cũng được.');
      const sg = chased ? -1 : 1, mySpeed = 8.2 + hp / 100 * 3, tgtSpeed = 8.0 + p.need * 2.2;
      const obs = chaseGen(rnd, CH_CFG);
      let z = 0, lane = 1, lx = 1, jump = 0, slide = 0, slow = 0, boost = 0, bcd = 0, gap = chased ? CH_CFG.gap0 * 0.8 : CH_CFG.gap0, t = -1.5, done = false, msg = '', msgT = 0, hits = 0, bolts = 0, tstun = 0;
      const say = (m) => { msg = m; msgT = 0.7; };
      const go = (d) => { if (t < 0 || done) return; lane = clamp(lane + d, 0, 2); sfx('click'); };
      const hop = () => { if (t < 0 || done || jump > 0 || slide > 0) return; jump = 0.55; sfx('click'); };
      const duck = () => { if (t < 0 || done || jump > 0 || slide > 0) return; slide = 0.55; sfx('click'); };
      const surge = () => { if (t < 0 || done || bcd > 0) return; boost = CH_CFG.boostT; bcd = CH_CFG.boostCd; sfx('kick'); };
      padBind(box, '[data-k]', (b) => { const k = b.dataset.k; if (k === 'l') go(-1); else if (k === 'r') go(1); else if (k === 'j') hop(); else if (k === 's') duck(); else surge(); });
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') go(-1); else if (k === 'ArrowRight' || k === 'd' || k === 'D') go(1); else if (k === 'ArrowUp' || k === 'w' || k === 'W') hop(); else if (k === 'ArrowDown' || k === 's' || k === 'S') duck(); else if (k === ' ' || k === 'Shift' || k === 'b' || k === 'B') surge(); else return false; return true; });
      let sx0 = 0, sy0 = 0;
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); sx0 = e.clientX; sy0 = e.clientY; });
      cv.addEventListener('pointerup', (e) => { const dx = e.clientX - sx0, dy = e.clientY - sy0; if (Math.abs(dx) < 18 && Math.abs(dy) < 18) surge(); else if (Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? 1 : -1); else if (dy < 0) hop(); else duck(); });
      const end = (win, text, score) => { done = true; sfx(win ? 'good' : 'bad'); setTimeout(() => res({ score, text }), 800); };
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt); lx += (lane - lx) * Math.min(1, dt * 14);
        if (t > 0 && !done) {
          jump = Math.max(0, jump - dt); slide = Math.max(0, slide - dt); slow = Math.max(0, slow - dt); boost = Math.max(0, boost - dt); bcd = Math.max(0, bcd - dt); tstun = Math.max(0, tstun - dt);
          const v = mySpeed * (slow > 0 ? 0.35 : 1) * (boost > 0 ? CH_CFG.boostMul : 1);
          z += v * dt;
          // đối phương cũng vấp ngẫu nhiên → cơ hội thu hẹp khoảng cách
          if (rnd() < dt * 0.22) tstun = 1.1;
          const tv = tgtSpeed * (tstun > 0 ? 0.4 : 1);
          gap += (chased ? v - tv : tv - v) * dt; // chaser: gap = khoảng tới tên trộm; chased: gap = quãng dẫn trước cảnh sát
          const o = obs.find((x) => !x.hit && Math.abs(x.z - z) < 0.7 && x.lane === lane);
          if (o) {
            o.hit = true;
            if (o.kind === 'bolt') { gap -= sg * CH_CFG.shortcut; bolts++; say('⚡ Lối tắt! -' + CH_CFG.shortcut + 'm'); sfx('good'); }
            else if ((o.kind === 'low' && jump > 0.05) || (o.kind === 'high' && slide > 0.05)) { say('Né đẹp!'); }
            else { slow = 1.2; gap += sg * CH_CFG.hit; hits++; say(o.kind === 'block' ? 'ĐÂM VÀO!' : o.kind === 'low' ? 'VẤP NGÃ!' : 'ĐẬP ĐẦU!'); sfx('bad'); }
          }
          if (chased) { if (gap <= CH_CFG.catchGap) end(false, 'Bạn bị tóm sau ' + t.toFixed(1) + ' giây (' + hits + ' lần va).', clamp(0.35 * t / CH_CFG.dur, 0, 0.3)); }
          else if (gap <= CH_CFG.catchGap) end(true, 'Bạn tóm được hắn sau ' + t.toFixed(1) + ' giây! (' + hits + ' lần va)', 0.6 + 0.4 * clamp(1 - t / CH_CFG.dur, 0, 1));
          if (!done && t >= CH_CFG.dur) {
            if (chased) end(true, 'Bạn cắt đuôi thành công, còn cách ' + Math.round(gap) + ' m.', clamp(0.55 + 0.45 * gap / CH_CFG.gap0 / 1.5, 0.55, 1));
            else end(false, 'Hắn chạy thoát, bỏ xa bạn ' + Math.round(gap) + ' m.', clamp(0.5 * (1 - gap / (CH_CFG.gap0 * 2)), 0, 0.5));
          }
        }
        // đồ họa: nhìn từ trên xuống, làn dọc, vật chạy từ trên xuống
        c.fillStyle = '#242942'; c.fillRect(0, 0, 640, 400);
        const LX = 140, LW = 120, GY = 330;
        c.fillStyle = '#3c4260'; c.fillRect(LX, 0, LW * 3, 400);
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([22, 22]); c.lineDashOffset = -z * 12; c.lineWidth = 3;
        [1, 2].forEach((i) => { c.beginPath(); c.moveTo(LX + i * LW, 0); c.lineTo(LX + i * LW, 400); c.stroke(); }); c.setLineDash([]);
        c.fillStyle = '#1b1f33'; c.fillRect(0, 0, LX - 6, 400); c.fillRect(LX + LW * 3 + 6, 0, 640, 400);
        obs.forEach((o) => {
          const y = GY - (o.z - z) * 24; if (y < -40 || y > 440 || (o.hit && o.kind !== 'block' && y > GY + 20)) return;
          const x = LX + (o.lane + 0.5) * LW; c.globalAlpha = o.hit ? 0.35 : 1;
          if (o.kind === 'low') { c.font = '38px sans-serif'; c.textAlign = 'center'; c.fillText('📦', x, y); }
          else if (o.kind === 'block') { c.font = '44px sans-serif'; c.textAlign = 'center'; c.fillText('🧱', x, y + 6); }
          else if (o.kind === 'high') { c.fillStyle = '#ffb347'; c.fillRect(x - 54, y - 6, 108, 12); c.fillStyle = '#222'; for (let k = 0; k < 6; k++) c.fillRect(x - 54 + k * 18, y - 6, 9, 12); }
          else { c.font = '34px sans-serif'; c.textAlign = 'center'; c.fillText('⚡', x, y + 6); }
          c.globalAlpha = 1;
        });
        // đối phương hiện ở đầu màn hình theo gap
        const gy = clamp(GY - gap * 24, 40, GY - 40);
        const ty = chased ? clamp(GY + gap * 4 + 40, GY + 36, 392) : gy;
        runner(c, LX + 1.5 * LW + Math.sin(t * 2) * 60, chased ? 392 : ty, chased ? '#2d4fd6' : '#1c1c1c', chased ? 'Cảnh sát' : 'Tên trộm', t * 8);
        const jy = jump > 0 ? Math.sin(Math.PI * (0.55 - jump) / 0.55) * 34 : 0;
        const px = LX + (lx + 0.5) * LW;
        c.save(); if (slide > 0) { c.translate(px, GY + 10); c.scale(1, 0.55); c.translate(-px, -(GY + 10)); }
        if (boost > 0) { c.fillStyle = 'rgba(255,210,63,.35)'; c.fillRect(px - 18, GY - 6, 36, 90); }
        runner(c, px, GY - jy, (p.ctx.appearance && p.ctx.appearance.top) || '#2d6cdf', 'BẠN', z * 1.5, p.ctx.appearance && p.ctx.appearance.skin);
        c.restore();
        // thước đo khoảng cách
        const bw = 150; c.fillStyle = 'rgba(8,12,22,.75)'; c.fillRect(480, 14, 150, 62); c.fillStyle = '#9fb0cc'; c.font = '700 11px sans-serif'; c.textAlign = 'left'; c.fillText(chased ? 'CÁCH CẢNH SÁT' : 'CÁCH TÊN TRỘM', 488, 30);
        c.fillStyle = '#232d40'; c.fillRect(488, 38, bw - 16, 10); c.fillStyle = (chased ? gap < 6 : gap > 30) ? '#ef6a62' : '#45c486'; c.fillRect(488, 38, (bw - 16) * clamp(gap / (CH_CFG.gap0 * 2), 0, 1), 10);
        c.fillStyle = bcd > 0 ? '#9fb0cc' : '#ffd23f'; c.fillText(bcd > 0 ? 'Tăng tốc: ' + bcd.toFixed(0) + 's' : '💥 Tăng tốc sẵn sàng', 488, 66);
        if (msgT > 0) bigText(c, msg, 140, /Né|Lối/.test(msg) ? '#ffd23f' : '#ff6b6b', 30);
        if (t < 0) bigText(c, chased ? 'CHẠY!' : 'ĐUỔI!', 230, '#fff', 56);
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(CH_CFG.dur - Math.max(0, t))) + 's · cách ' + Math.max(0, Math.round(gap)) + ' m · va ' + hits;
      });
    });
  }

  // ------------------------------------------------------------------ 8. lái xe né chướng ngại
  // Lái xe — ↑ ga / ↓ phanh thật (tốc độ có quán tính), biển giới hạn tốc độ, đèn đỏ, mưa trơn, chướng ngại có cảnh báo ⚠.
  // Độ khó: tốc độ nền = (240 + need×170) × (1.15 − sức khỏe×0.3%); vi phạm bị phạt nhưng không kết thúc ván. Va 3 lần thì dừng xe.
  const DR_CFG = { dur: 36, limits: [{ a: 6, b: 12, v: 40 }, { a: 24, b: 30, v: 45 }], light: { warn: 14, spawn: 16, redFor: 5 }, rainFrom: 19, tol: 6, fine: { speed: 200, light: 400 } };
  function driveTicket(kmh, limit, tol) { return kmh > limit + tol; } // thuần túy: có quá tốc độ không
  function drive(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🛵 Lái xe', '<div class="mini-pad"><button type="button" data-d="-1">◀ <kbd>←</kbd></button><button type="button" data-h="brake">🛑 Phanh <kbd>↓</kbd></button><button type="button" data-h="gas">⚡ Ga <kbd>↑</kbd></button><button type="button" data-d="1">▶ <kbd>→</kbd></button></div>', '<kbd>←</kbd><kbd>→</kbd> đổi làn · giữ <kbd>↑</kbd> ga / <kbd>↓</kbd> phanh · Tuân thủ biển giới hạn tốc độ, <b>dừng trước vạch khi đèn đỏ</b>, cẩn thận khi trời mưa. ⚠ báo trước chướng ngại. Va 3 lần là hỏng chuyến.');
      const LX = [220, 320, 420], PY = 320;
      const base = (240 + p.need * 170) * (1.15 - hp / 100 * 0.3);
      const KINDS = [{ e: '🚗', w: 46, h: 60, car: 1 }, { e: '🚚', w: 52, h: 70, car: 1 }, { e: '🕳️', w: 40, h: 30 }, { e: '🐕', w: 36, h: 32 }, { e: '🚧', w: 46, h: 34 }, { e: '🛵', w: 34, h: 50, car: 1 }];
      let lane = 1, px = 320, t = -1.5, obs = [], pend = [], spawn = 0, hits = 0, inv = 0, done = false, scroll = 0, spd = 0.9, gas = false, brk = false, light = null, rain = false, over = 0, msg = '', msgT = 0;
      const viol = [], zoneBad = {}; let lightDone = false, warned = false;
      const say = (m) => { msg = m; msgT = 1.4; };
      const move = (d) => { if (done) return; lane = clamp(lane + d, 0, 2); sfx('click'); };
      padBind(box, '[data-d]', (b) => move(+b.dataset.d));
      box.querySelectorAll('[data-h]').forEach((b) => { const on = (v) => () => { if (b.dataset.h === 'gas') gas = v; else brk = v; }; b.addEventListener('pointerdown', on(true)); b.addEventListener('pointerup', on(false)); b.addEventListener('pointerleave', on(false)); });
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); move((e.clientX - r.left) / r.width < 0.5 ? -1 : 1); });
      onKeys((e) => {
        const k = e.key, dn = e.type === 'keydown';
        if (k === 'ArrowUp' || k === 'w' || k === 'W') { gas = dn; return true; }
        if (k === 'ArrowDown' || k === 's' || k === 'S') { brk = dn; return true; }
        if (!dn || e.repeat) return false;
        if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1); else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1); else return false; return true;
      });
      const end = (score, text) => { done = true; setTimeout(() => res({ score: clamp(score - viol.length * 0.12, 0, 1), text: text + (viol.length ? ' Vi phạm: ' + viol.map((v) => v.n + ' (' + v.f + 'k)').join(', ') + '.' : ' Không vi phạm luật.') + ' 💡 Giữ tốc độ theo biển báo và dừng đèn đỏ — an toàn quan trọng hơn đến sớm.' }), 800); };
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        px += (LX[lane] - px) * Math.min(1, dt * (rain ? 6 : 14));
        // quán tính: ga → 1.3, phanh → 0 (dừng hẳn được), thả → 0.9
        const tgt = brk ? 0 : gas ? 1.3 : 0.9; spd += (tgt - spd) * Math.min(1, dt * (brk ? 3.2 : 1.6));
        const v = (base + Math.max(0, t) * 3) * spd, kmh = Math.round(v / 6);
        if (t > 0 && !done) {
          rain = t >= DR_CFG.rainFrom; scroll += v * dt; spawn -= dt; inv = Math.max(0, inv - dt);
          if (rain && t < DR_CFG.rainFrom + 0.05) say('☔ Trời mưa — đường trơn, đổi làn chậm hơn!');
          // giới hạn tốc độ
          const zone = DR_CFG.limits.find((z) => t >= z.a && t <= z.b);
          if (zone) { if (driveTicket(kmh, zone.v, DR_CFG.tol)) { over += dt; if (over > 1.2 && !zoneBad[zone.a]) { zoneBad[zone.a] = 1; viol.push({ n: 'quá tốc độ ' + zone.v + 'km/h', f: DR_CFG.fine.speed }); say('📸 Camera phạt nguội!'); sfx('bad'); } } else over = Math.max(0, over - dt); }
          // đèn đỏ: cảnh báo trước, vạch dừng cuộn xuống theo tốc độ xe
          if (!warned && t >= DR_CFG.light.warn) { warned = true; say('🚦 Đèn đỏ phía trước — chuẩn bị dừng!'); }
          if (!light && !lightDone && t >= DR_CFG.light.spawn) light = { y: -260, t: 0, crossed: false, red: true };
          if (light) {
            light.y += v * dt; if (light.y > -80 || light.crossed) light.t += dt;
            if (light.t > DR_CFG.light.redFor) light.red = false;
            if (!light.crossed && light.y >= PY - 30) { light.crossed = true; if (light.red && kmh > 8) { viol.push({ n: 'vượt đèn đỏ', f: DR_CFG.fine.light }); say('🚨 VƯỢT ĐÈN ĐỎ!'); sfx('bad'); } else if (light.red) say('Dừng đúng vạch ✔'); }
            if (light.y > 480) { light = null; lightDone = true; }
            if (light && light.red && light.crossed && kmh <= 8 && light.t > 0) { /* đứng chờ */ }
          }
          // sinh chướng ngại: ⚠ báo trước 0.7s rồi mới xuất hiện
          if (spawn <= 0 && !(light && light.red && !light.crossed)) {
            spawn = rand(0.5, 0.95) * 480 / Math.max(180, v);
            const near = [...new Set(obs.concat(pend).filter((o) => o.y == null || o.y < 90).map((o) => o.l))];
            const free = [0, 1, 2].filter((x) => !near.includes(x));
            const l = near.length >= 2 ? pick(near) : pick(free.length ? free : [0, 1, 2]);
            pend.push(Object.assign({ l, w8: 0.7 }, pick(KINDS)));
          }
          pend.forEach((o) => (o.w8 -= dt));
          pend.filter((o) => o.w8 <= 0).forEach((o) => obs.push(Object.assign(o, { y: -50, hit: false })));
          pend = pend.filter((o) => o.w8 > 0);
          obs.forEach((o) => (o.y += v * (o.car ? 0.7 : 1) * dt));
          obs = obs.filter((o) => o.y < 470);
          if (inv <= 0) {
            const h = obs.find((o) => !o.hit && Math.abs(LX[o.l] - px) < o.w / 2 + 14 && Math.abs(o.y - PY) < o.h / 2 + 22);
            if (h) { h.hit = true; hits++; inv = 1.2; sfx('bad'); if (hits >= 3) end(clamp(t / DR_CFG.dur * 0.4, 0, 0.4), 'Bạn va chạm 3 lần, phải dừng xe giữa đường.'); }
          }
          if (t >= DR_CFG.dur && !done) end([1, 0.75, 0.5][hits], hits ? 'Tới nơi, va quệt ' + hits + ' lần.' : 'Tới nơi an toàn, không một vết xước!');
        }
        c.fillStyle = rain ? '#3a5a3a' : '#4f8a3a'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#3b3e48'; c.fillRect(160, 0, 320, 400);
        c.fillStyle = '#fff'; c.fillRect(160, 0, 5, 400); c.fillRect(475, 0, 5, 400);
        c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = -1; i < 9; i++) { const y = ((i * 60 + scroll) % 480) - 60; c.fillRect(268, y, 4, 30); c.fillRect(368, y, 4, 30); }
        if (light) { c.fillStyle = '#fff'; c.fillRect(165, light.y, 310, 6); c.font = '30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(light.red ? '🔴' : '🟢', 500, light.y); c.textBaseline = 'alphabetic'; }
        c.font = '40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        pend.forEach((o) => { c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 20); c.fillText('⚠️', LX[o.l], 28); c.globalAlpha = 1; });
        obs.forEach((o) => { c.globalAlpha = o.hit ? 0.4 : 1; c.fillText(o.e, LX[o.l], o.y); c.globalAlpha = 1; });
        c.globalAlpha = inv > 0 && Math.sin(t * 30) > 0 ? 0.4 : 1;
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.top) || '#2d6cdf'; c.fillRect(px - 12, PY - 22, 24, 44);
        c.fillStyle = '#111'; c.fillRect(px - 5, PY - 34, 10, 14); c.fillRect(px - 5, PY + 20, 10, 14);
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.skin) || '#f2c39a'; c.beginPath(); c.arc(px, PY - 4, 9, 0, 7); c.fill();
        c.globalAlpha = 1; c.textBaseline = 'alphabetic';
        if (rain) { c.strokeStyle = 'rgba(180,210,255,.45)'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 40) % 640, y = (i * 53 + t * 700) % 400; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y + 14); c.stroke(); } }
        // đồng hồ tốc độ + biển giới hạn
        const zn = t > 0 && DR_CFG.limits.find((z) => t >= z.a - 1 && t <= z.b);
        c.fillStyle = 'rgba(8,12,22,.75)'; c.fillRect(14, 12, 120, 44); c.fillStyle = zn && kmh > zn.v + DR_CFG.tol ? '#ff6b6b' : '#fff'; c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'left'; c.fillText(kmh + ' km/h', 24, 40);
        if (zn) { c.fillStyle = '#fff'; c.beginPath(); c.arc(570, 46, 28, 0, 7); c.fill(); c.strokeStyle = '#d63c3c'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#111'; c.font = '800 22px sans-serif'; c.textAlign = 'center'; c.fillText(String(zn.v), 570, 54); }
        if (msgT > 0) bigText(c, msg, 150, /✔/.test(msg) ? '#45c486' : '#ffd23f', 26);
        countdown(c, t, 'CHẠY!');
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(DR_CFG.dur - Math.max(0, t))) + 's · va chạm ' + hits + '/3 · vi phạm ' + viol.length;
      });
    });
  }

  // ------------------------------------------------------------------ 9. đánh nhau
  const FOES = {
    thug: { name: 'Côn đồ', col: '#1c1c1c', skin: '#c98d64', hp: 1, pow: 1, spd: 1, guard: 1, rate: 1 },
    dao: { name: 'Kẻ cầm dao', col: '#4a2323', skin: '#c98d64', hp: 0.75, pow: 1.55, spd: 1.05, guard: 0.4, rate: 1.1, knife: true },
    vo: { name: 'Võ sĩ', col: '#1d3f8a', skin: '#d9a77c', hp: 1.15, pow: 1.05, spd: 1.25, guard: 1.8, rate: 1.25 },
    say: { name: 'Gã say rượu', col: '#6b4f1d', skin: '#e0a080', hp: 1.15, pow: 1.25, spd: 0.65, guard: 0.3, rate: 0.75, wobble: true },
    gang: { name: 'Đầu gấu', col: '#2a2a2a', skin: '#b98060', hp: 1.3, pow: 1.1, spd: 1, guard: 0.9, rate: 1.05 },
    danAnh: { name: 'Đàn anh', col: '#3b5b2a', skin: '#e6b48f', hp: 0.8, pow: 0.75, spd: 1, guard: 0.7, rate: 0.95 },
    kid: { name: 'Bạn cùng lớp', col: '#7a3b8a', skin: '#e6b48f', hp: 0.65, pow: 0.6, spd: 0.9, guard: 0.6, rate: 0.85 },
  };
  function fight(p) {
    return new Promise((res) => {
      const hp0 = p.ctx.stats.health, F = FOES[p.foe] || FOES.thug;
      const { box, c, hud } = canvasGame('🥊 Đánh nhau · ' + F.name, '<div class="mini-pad fight"><button type="button" data-k="left">◀ <kbd>←</kbd></button><button type="button" data-k="right">▶ <kbd>→</kbd></button><button type="button" data-k="punch">👊 Đấm <kbd>J</kbd></button><button type="button" data-k="kick">🦵 Đá <kbd>K</kbd></button><button type="button" data-k="block">🛡️ Đỡ <kbd>L</kbd></button><button type="button" data-k="dodge">💨 Né <kbd>Space</kbd></button></div>', '<kbd>←</kbd> <kbd>→</kbd> tiến lùi · <kbd>J</kbd> đấm (nhanh) · <kbd>K</kbd> đá (mạnh, xa) · giữ <kbd>L</kbd> để đỡ · <kbd>Space</kbd> né. Áp sát rồi đấm, thấy đối thủ vung tay thì đỡ hoặc né.');
      const mk = (x, dir, hp, pow, col, skin) => ({ x, dir, hp, max: hp, pow, col, skin, act: null, actT: 0, cd: 0, hurt: 0, block: false, dodge: 0 });
      const me = mk(180, 1, 70 + hp0 * 0.6, 0.6 + hp0 / 100 * 0.8, (p.ctx.appearance && p.ctx.appearance.top) || '#2d6cdf', (p.ctx.appearance && p.ctx.appearance.skin) || '#e6b48f');
      const foeLvl = clamp(p.need, 0.3, 0.85);
      const foe = mk(460, -1, (60 + foeLvl * 80) * F.hp, (0.55 + foeLvl * 0.8) * F.pow, F.col, F.skin);
      const keys = {}; let t = 0, over = false, floating = [];
      // tam giác khắc chế: ĐỠ chặn đấm (còn 20%) nhưng ĐÁ phá thế đỡ (70%); đòn NẶNG của địch báo trước bằng dấu ! đỏ → né (Space) là trượt hoàn toàn và địch hở 0.6s.
      // thể lực: đấm −8, đá −16, giữ đỡ −10/s, hồi 14/s khi đứng yên; cạn thể lực thì đòn yếu đi một nửa. Đấm 3 cú liên tiếp (<0.9s) ra COMBO +60%.
      const ATK = { punch: { t: 0.28, hit: 0.14, reach: 70, dmg: 7, cd: 0.35, st: 8 }, kick: { t: 0.5, hit: 0.3, reach: 95, dmg: 13, cd: 0.7, st: 16 }, heavy: { t: 0.95, hit: 0.7, reach: 105, dmg: 22, cd: 0.9, st: 0 } };
      me.st = 100; let combo = 0, comboT = 0, fled = false;
      const start = (f, a) => { if (f.act || f.cd > 0 || f.hurt > 0) return; if (f === me && a !== 'dodge' && me.st < ATK[a].st) return; if (f === me && a !== 'dodge') me.st -= ATK[a].st; if (a === 'dodge') { f.dodge = 0.35; f.cd = 0.6; f.x -= f.dir * 40; return; } f.act = a; f.actT = 0; f.hitDone = false; };
      const press = (k, down) => { if (k === 'flee') { if (down) flee(); return; } if (k === 'left' || k === 'right' || k === 'block') keys[k] = down; else if (down) start(me, k); };
      box.querySelectorAll('[data-k]').forEach((b) => { b.onpointerdown = (e) => { e.preventDefault(); press(b.dataset.k, true); }; b.onpointerup = b.onpointerleave = () => press(b.dataset.k, false); });
      const fb = document.createElement('button'); fb.type = 'button'; fb.textContent = '🏃 Chạy'; fb.dataset.k = 'flee'; const padF = box.querySelector('.mini-pad'); if (padF) padF.appendChild(fb); fb.onpointerdown = (e) => { e.preventDefault(); press('flee', true); };
      const flee = () => { if (over || fled) return; fled = true; over = true; setTimeout(() => res({ score: 0.18, text: 'Bạn bỏ chạy khỏi cuộc ẩu đả — an toàn, nhưng mất mặt.' }), 600); };
      const map = { f: 'flee', F: 'flee', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', j: 'punch', J: 'punch', z: 'punch', Z: 'punch', k: 'kick', K: 'kick', x: 'kick', X: 'kick', l: 'block', L: 'block', c: 'block', C: 'block', ' ': 'dodge' };
      onKeys((e) => { const k = map[e.key]; if (!k) return false; if (e.repeat && k !== 'left' && k !== 'right' && k !== 'block') return true; press(k, e.type === 'keydown'); return true; });
      const hitCheck = (a, b) => {
        if (!a.act || a.hitDone) return; const A = ATK[a.act];
        if (a.actT >= A.hit) {
          a.hitDone = true;
          if (a.act === 'heavy' && b.dodge > 0) { a.cd = 1.2; floating.push({ x: b.x, y: 120, txt: 'NÉ!', life: 0.8, col: '#9ad1ff' }); }
          if (Math.abs(a.x - b.x) <= A.reach && b.dodge <= 0) {
            let d = A.dmg * a.pow * rand(0.85, 1.15) * (a === me && me.st < 10 ? 0.5 : 1);
            if (a === me && a.act === 'punch') { combo = comboT > 0 ? combo + 1 : 1; comboT = 0.9; if (combo >= 3) { d *= 1.6; combo = 0; floating.push({ x: a.x, y: 100, txt: 'COMBO!', life: 0.9, col: '#ffd23f' }); sfx('good'); } }
            if (b.block) d *= (a.act === 'punch' ? 0.2 : a.act === 'kick' ? 0.7 : 0.5);
            b.hp = Math.max(0, b.hp - d); b.hurt = b.block ? 0.08 : 0.3; b.x += a.dir * (b.block ? 6 : 22); sfx(b.block ? 'click' : 'bad');
            floating.push({ x: b.x, y: 130, txt: b.block ? 'đỡ' : '-' + Math.round(d), life: 0.8, col: b.block ? '#9ad1ff' : '#ff6b6b' });
          }
        }
      };
      let aiT = 0;
      loop((dt) => {
        if (!over) t += dt;
        comboT = Math.max(0, comboT - dt); if (!over) me.st = clamp(me.st + (keys.block ? -10 : (me.act || keys.left || keys.right) ? 5 : 14) * dt, 0, 100); if (me.st <= 0) keys.block = false;
        [me, foe].forEach((f) => { f.cd = Math.max(0, f.cd - dt); f.hurt = Math.max(0, f.hurt - dt); f.dodge = Math.max(0, f.dodge - dt); if (f.act) { f.actT += dt; if (f.actT >= ATK[f.act].t) { f.cd = ATK[f.act].cd; f.act = null; } } });
        if (!over) {
          me.block = !!keys.block && !me.act;
          const sp = 150 * (me.block ? 0.4 : 1);
          if (keys.left && !me.act && me.hurt <= 0) me.x -= sp * dt; if (keys.right && !me.act && me.hurt <= 0) me.x += sp * dt;
          // đối thủ (AI): tiến lại gần, đánh khi trong tầm, thỉnh thoảng đỡ
          aiT -= dt; const dist = Math.abs(me.x - foe.x);
          foe.block = false;
          if (foe.hurt <= 0 && !foe.act) {
            if (dist > 80) foe.x += (me.x > foe.x ? 1 : -1) * (90 + foeLvl * 80) * F.spd * dt;
            else if (aiT <= 0) { aiT = (rand(0.6, 1.25) - foeLvl * 0.3) / F.rate; const r = rnd(); if (me.act && r < (0.35 + foeLvl * 0.3) * Math.min(1.6, F.guard)) foe.block = true; else start(foe, dist < 72 && r < 0.65 ? 'punch' : rnd() < 0.2 + foeLvl * 0.2 ? 'heavy' : 'kick'); }
            else if (me.act && rnd() < foeLvl * 0.05 * F.guard) foe.block = true;
          }
          if (F.wobble) foe.x += Math.sin(t * 2.7) * 40 * dt;
          me.dir = foe.x > me.x ? 1 : -1; foe.dir = -me.dir;
          me.x = clamp(me.x, 40, 600); foe.x = clamp(foe.x, 40, 600);
          if (Math.abs(me.x - foe.x) < 34) { const push = (34 - Math.abs(me.x - foe.x)) / 2; me.x -= me.dir * push; foe.x -= foe.dir * push; }
          hitCheck(me, foe); hitCheck(foe, me);
          if (me.hp <= 0 || foe.hp <= 0 || t >= 45) {
            over = true;
            const win = foe.hp <= 0 || (me.hp > 0 && me.hp / me.max > foe.hp / foe.max);
            const score = win ? clamp(0.55 + 0.45 * me.hp / me.max, 0.55, 1) : clamp(0.45 * (1 - foe.hp / foe.max), 0, 0.45);
            setTimeout(() => res({ score, text: win ? (foe.hp <= 0 ? 'Bạn hạ gục ' + F.name.toLowerCase() + '!' : 'Hết giờ, bạn chiếm ưu thế.') : (me.hp <= 0 ? 'Bạn bị hạ gục…' : 'Hết giờ, đối thủ chiếm ưu thế.') }), 1100);
          }
        }
        c.fillStyle = '#2b2f45'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#3a3f5c'; c.fillRect(0, 300, 640, 100);
        c.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 640; i += 40) { c.beginPath(); c.moveTo(i, 300); c.lineTo(i - 60, 400); c.stroke(); }
        const drawF = (f, label, knife) => {
          const x = f.x, y = 300, d = f.dir, a = f.act ? Math.sin(Math.min(1, f.actT / ATK[f.act].t) * Math.PI) : 0;
          c.save(); if (f.hurt > 0) c.globalAlpha = 0.6 + Math.sin(t * 60) * 0.3; if (f.dodge > 0) c.globalAlpha = 0.45;
          c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, y + 4, 30, 7, 0, 0, 7); c.fill();
          c.strokeStyle = '#2b2b2b'; c.lineWidth = 9; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x - 6, y - 52); c.lineTo(x - 14, y); c.moveTo(x + 6, y - 52);
          if (f.act === 'kick' || f.act === 'heavy') c.lineTo(x + d * (20 + a * 60), y - 30 - a * 25); else c.lineTo(x + 14, y); c.stroke();
          c.fillStyle = f.col; c.fillRect(x - 17, y - 112, 34, 62);
          c.strokeStyle = f.skin; c.lineWidth = 8; c.beginPath();
          let hx = x + d * 26, hy = y - 82;
          if (f.block) { c.moveTo(x + d * 8, y - 100); c.lineTo(x + d * 26, y - 120); c.moveTo(x + d * 2, y - 96); c.lineTo(x + d * 24, y - 108); hx = x + d * 26; hy = y - 120; }
          else if (f.act === 'punch') { c.moveTo(x + d * 10, y - 100); hx = x + d * (28 + a * 42); hy = y - 104; c.lineTo(hx, hy); c.moveTo(x - d * 8, y - 98); c.lineTo(x + d * 6, y - 84); }
          else { c.moveTo(x + d * 12, y - 100); c.lineTo(x + d * 26, y - 82); c.moveTo(x - d * 10, y - 100); c.lineTo(x + d * 4, y - 82); }
          c.stroke();
          if (knife) { c.strokeStyle = '#d8dde6'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + d * 18, hy - 6); c.stroke(); }
          if (f.act === 'heavy' && f.actT < ATK.heavy.hit) { c.fillStyle = '#ff3b3b'; c.font = '800 38px sans-serif'; c.textAlign = 'center'; c.fillText('!', x, y - 160); }
          c.fillStyle = f.skin; c.beginPath(); c.arc(x, y - 128, 16, 0, 7); c.fill();
          c.fillStyle = '#111'; c.beginPath(); c.arc(x + d * 6, y - 131, 2.5, 0, 7); c.fill();
          c.restore();
          c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText(label, x, y - 152);
        };
        drawF(foe, F.name, F.knife); drawF(me, 'BẠN');
        const bar = (x, f, col) => { c.fillStyle = '#111'; c.fillRect(x, 20, 260, 18); c.fillStyle = col; c.fillRect(x + 2, 22, 256 * f.hp / f.max, 14); };
        bar(20, me, '#39cf98'); bar(360, foe, '#ff5c5c');
        c.fillStyle = '#111'; c.fillRect(20, 62, 160, 8); c.fillStyle = me.st < 20 ? '#ef6a62' : '#ffd23f'; c.fillRect(21, 63, 158 * me.st / 100, 6);
        c.fillStyle = '#fff'; c.font = '700 14px sans-serif'; c.textAlign = 'left'; c.fillText('BẠN ' + Math.round(me.hp), 22, 56); c.textAlign = 'right'; c.fillText(F.name.toUpperCase() + ' ' + Math.round(foe.hp), 618, 56);
        c.textAlign = 'center'; c.font = '800 26px "Baloo 2", sans-serif'; c.fillText(String(Math.max(0, Math.ceil(45 - t))), 320, 36);
        floating = floating.filter((f) => (f.life -= dt) > 0);
        floating.forEach((f) => { c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.font = '800 22px "Baloo 2", sans-serif'; c.fillText(f.txt, f.x, f.y - (0.8 - f.life) * 50); c.globalAlpha = 1; });
        if (over) bigText(c, foe.hp <= 0 ? 'K.O.!' : me.hp <= 0 ? 'Bị hạ!' : 'Hết giờ!', 210, foe.hp <= 0 ? '#ffd23f' : me.hp <= 0 ? '#ff6b6b' : '#fff', 54);
        hud.textContent = 'J đấm · K đá (phá đỡ) · L đỡ · Space né đòn ! đỏ · F bỏ chạy';
      });
    });
  }

  // ------------------------------------------------------------------ 10. phỏng vấn
  // [câu hỏi, trả lời khéo, tạm được, dở]
  const IV_GEN = [
    ['Hãy giới thiệu ngắn gọn về bản thân.', 'Tóm tắt kinh nghiệm và điểm mạnh liên quan tới vị trí này', 'Kể từ hồi mẫu giáo tới giờ', '“Thì… CV có hết rồi đó ạ.”'],
    ['Vì sao bạn muốn làm ở đây?', 'Em đã tìm hiểu sản phẩm, thấy hợp với định hướng của mình', '“Vì gần nhà ạ.”', '“Chỗ cũ trả bèo quá nên em đi.”'],
    ['Điểm yếu lớn nhất của bạn?', 'Hay ôm việc, em đang tập phân chia và nhờ hỗ trợ', '“Em hơi cầu toàn ạ.”', '“Em hay đi trễ, nhưng làm bù được.”'],
    ['Mức lương mong muốn của bạn?', 'Theo mặt bằng thị trường, em sẵn sàng trao đổi thêm', '“Bao nhiêu cũng được ạ.”', '“Gấp đôi chỗ cũ, không thì thôi.”'],
    ['Bất đồng ý kiến với sếp thì bạn làm gì?', 'Trao đổi riêng, đưa số liệu, rồi tôn trọng quyết định chung', 'Im lặng làm theo', 'Cãi tới cùng trước mặt mọi người'],
    ['5 năm nữa bạn thấy mình ở đâu?', 'Giỏi chuyên môn, dẫn dắt một nhóm nhỏ, gắn bó lâu dài', '“Em chưa nghĩ tới ạ.”', '“Ngồi ghế của anh/chị.”'],
    ['Bạn có câu hỏi gì cho chúng tôi không?', 'Kỳ vọng với người mới trong 3 tháng đầu là gì ạ?', '“Dạ không ạ.”', '“Công ty có cho làm việc riêng trong giờ không ạ?”'],
    ['Kể về một lần bạn thất bại.', 'Kể cụ thể, nói rõ bài học và cách đã khắc phục', '“Em chưa thất bại bao giờ.”', 'Đổ lỗi cho đồng nghiệp cũ'],
  ];
  const IV_FIELD = {
    tech: [['Hệ thống bỗng chạy chậm, bạn bắt đầu từ đâu?', 'Đo đạc, tìm đúng chỗ nghẽn rồi mới tối ưu', 'Nâng cấp máy chủ cho nhanh', 'Đập đi viết lại toàn bộ'], ['Sắp tới hạn mà sản phẩm còn lỗi?', 'Báo sớm, đề xuất cắt bớt tính năng, giữ chất lượng', 'Thức trắng làm cho kịp', 'Cứ nộp, lỗi tính sau']],
    health: [['Người nhà bệnh nhân to tiếng ở phòng cấp cứu?', 'Bình tĩnh giải thích, ưu tiên ca nặng, gọi hỗ trợ', 'Mặc kệ, làm tiếp', 'Cãi tay đôi cho ra lẽ'], ['Phát hiện đồng nghiệp ghi sai liều thuốc?', 'Báo ngay, dừng cấp thuốc, sửa hồ sơ', 'Nhắc nhẹ sau ca trực', 'Lờ đi kẻo mất lòng']],
    law: [['Khách nhờ “làm đẹp” số liệu?', 'Từ chối, giải thích rủi ro pháp lý, đề xuất cách hợp lệ', 'Hỏi ý sếp rồi tính', 'Làm luôn, khách là thượng đế'], ['Hồ sơ gấp nhưng thiếu một chữ ký?', 'Liên hệ bổ sung ngay, ghi chú rõ tiến độ', 'Để đó chờ người ta tự gửi', 'Ký hộ cho nhanh']],
    sales: [['Khách phàn nàn gay gắt về sản phẩm?', 'Lắng nghe, xin lỗi, đưa phương án đổi hoặc hoàn tiền', 'Chuyển cho quản lý xử lý', 'Bảo khách dùng sai cách'], ['“Bán cho tôi cây bút này.”', 'Hỏi nhu cầu của khách trước rồi mới giới thiệu', 'Khen bút đẹp, giá rẻ', '“Mua đi, không mua thì thôi.”']],
    teach: [['Học trò cá biệt quậy phá trong giờ?', 'Gặp riêng tìm hiểu nguyên nhân, giao cho em một vai trò', 'Phạt đứng cuối lớp', 'Mắng trước lớp cho sợ'], ['Phụ huynh xin “nâng điểm” cho con?', 'Từ chối khéo, đề xuất kế hoạch kèm cặp thêm', 'Hứa sẽ xem xét', 'Nhận quà rồi tính']],
    star: [['Bị antifan bôi nhọ trên mạng?', 'Giữ bình tĩnh, làm sản phẩm tốt để trả lời', 'Khóa bình luận một thời gian', 'Livestream chửi lại'], ['Đạo diễn yêu cầu cảnh quay khó?', 'Tập luyện kỹ, hỏi thêm ý đồ của đạo diễn', 'Xin đóng thế', 'Đòi sửa kịch bản theo ý mình']],
    uniform: [['Tình huống khẩn cấp mà mệnh lệnh chưa rõ?', 'Đảm bảo an toàn, báo cáo, làm theo quy trình', 'Đứng chờ lệnh', 'Tự ý làm theo cảm tính'], ['Đồng đội vi phạm quy định?', 'Nhắc nhở và báo cáo theo đúng quy trình', 'Làm ngơ một lần', 'Bao che cho anh em']],
    sport: [['HLV xếp bạn dự bị cả mùa?', 'Tập thêm, hỏi HLV mình cần cải thiện gì', 'Kiên nhẫn chờ cơ hội', 'Lên mạng than trách'], ['Có lời mời “bán độ”?', 'Từ chối thẳng, báo ban huấn luyện', 'Bảo để nghĩ thêm', 'Nhận, “một trận thôi mà”']],
  };
  // cùng một trò "chọn câu trả lời khéo nhất", nhưng đổi bộ câu hỏi theo ngữ cảnh: không phải lúc nào cũng là phỏng vấn xin việc
  const IV_CTX = {
    talk: { title: '💬 Trò chuyện', face: '🧑', good: ['Người ấy gật gù, nét mặt dịu lại.', '“Ừ, mình hiểu rồi.”', 'Không khí ấm lên hẳn.'], mid: ['“Ừm…”', 'Người ấy im lặng suy nghĩ.'], bad: ['Người ấy nhíu mày.', 'Không khí căng thẳng hơn…', '“Sao lại nói thế?”'],
      end: ['Cuộc nói chuyện rất cởi mở, hai bên hiểu nhau hơn.', 'Nói chuyện tạm ổn, vẫn còn vài chỗ gượng gạo.', 'Cuộc nói chuyện đổ bể, ai cũng khó chịu.'], tip: 'Chọn câu chân thành, tôn trọng người nghe nhất.',
      qs: [['“Sao dạo này về muộn thế?”', 'Kể thật lý do và hỏi lại xem người ấy có lo gì không', 'Bảo dạo này công việc nhiều', 'Gắt: “Hỏi lắm thế!”'], ['Người thân phàn nàn chuyện tiền nong trong nhà?', 'Ngồi xuống cùng xem lại chi tiêu, đề xuất cách chia sẻ', 'Hứa sẽ cố gắng hơn', 'Bảo đó không phải việc của mình'], ['“Con/em nghĩ sao về chuyện này?”', 'Nói rõ quan điểm của mình nhưng nhẹ nhàng, lắng nghe ý kiến lại', 'Tuỳ mọi người quyết', 'Nói thẳng là ý kiến kia vô lý'], ['Người ấy đang buồn mà không nói lý do?', 'Ngồi cạnh, hỏi han và cho người ấy thời gian', 'Rủ đi ăn cho khuây khoả', 'Bảo: “Có gì đâu mà buồn”'], ['Bị trách vì lỡ hẹn quan trọng?', 'Xin lỗi chân thành, không viện cớ, hẹn bù', 'Giải thích lý do thật dài', 'Đổ lỗi ngược lại cho người kia'], ['Hai bên bất đồng gay gắt?', 'Đề nghị tạm dừng, bình tĩnh rồi nói tiếp', 'Im lặng cho qua', 'Nói to át đi để thắng']] },
    argue: { title: '⚖️ Tranh luận', face: '🧑‍⚖️', good: ['Lập luận sắc bén, đối phương cứng họng.', 'Mọi người gật gù đồng tình.'], mid: ['Chưa thuyết phục lắm.', 'Đối phương vẫn giữ quan điểm.'], bad: ['Bạn bị bắt bẻ ngay.', 'Lập luận lộ sơ hở.', 'Có tiếng cười khẩy.'],
      end: ['Bạn tranh luận xuất sắc, lý lẽ chặt chẽ.', 'Cuộc tranh luận ngang ngửa.', 'Bạn bị đối phương áp đảo.'], tip: 'Chọn lập luận có bằng chứng, bình tĩnh và đúng trọng tâm.',
      qs: [['Đối phương đưa ra chứng cứ bất lợi cho bạn?', 'Bình tĩnh chỉ ra điểm chưa chính xác bằng giấy tờ cụ thể', 'Nói rằng đó chỉ là hiểu lầm', 'Lớn tiếng phủ nhận tất cả'], ['Bị cáo buộc làm sai?', 'Trình bày mốc thời gian, hoá đơn, nhân chứng', 'Xin thêm thời gian giải trình', 'Tấn công cá nhân người cáo buộc'], ['Câu hỏi bẫy “Có hay không?”', 'Trả lời đúng sự thật kèm bối cảnh ngắn gọn', 'Né sang chuyện khác', 'Trả lời bừa cho nhanh'], ['Đối phương ngắt lời liên tục?', 'Đề nghị được nói hết, giữ giọng điềm tĩnh', 'Im lặng nhường', 'Ngắt lời lại to hơn'], ['Cần thuyết phục người phân xử?', 'Tóm tắt 3 ý chính có bằng chứng', 'Kể lại toàn bộ sự việc từ đầu', 'Than vãn mình bị oan']] },
    speech: { title: '🎤 Phát biểu', face: '👥', good: ['Khán giả vỗ tay rào rào.', 'Mọi người chăm chú lắng nghe.'], mid: ['Có vài tiếng vỗ tay lác đác.', 'Khán giả hơi lơ đãng.'], bad: ['Có tiếng xì xào phía dưới.', 'Bạn vấp, khán phòng im phăng phắc.'],
      end: ['Bài phát biểu chạm đến mọi người.', 'Bài phát biểu tròn vai.', 'Bài phát biểu khá vụng về.'], tip: 'Chọn câu chân thành, ngắn gọn, đúng hoàn cảnh.',
      qs: [['Mở đầu thế nào?', 'Cảm ơn ngắn gọn rồi kể một câu chuyện thật', 'Đọc nguyên văn bài chuẩn bị sẵn', 'Đùa một câu nhạy cảm cho vui'], ['Bị hỏi câu khó trước đám đông?', 'Thừa nhận điều chưa làm được và nói hướng sửa', 'Hứa sẽ trả lời sau', 'Lảng sang chuyện khác'], ['Khán giả có người phản đối?', 'Lắng nghe, cảm ơn góp ý và trả lời bằng sự thật', 'Lờ đi', 'Mỉa mai người phản đối'], ['Kết thúc bài nói?', 'Nhắc lại thông điệp chính và cảm ơn', 'Nói “Hết rồi” rồi đi xuống', 'Nói thêm thật dài cho đủ giờ']] },
  };
  // bộ câu hỏi riêng cho từng loại ca việc (tránh dùng chung câu hỏi chuyện gia đình cho mọi tình huống)
  const mk = (title, face, tip, end, qs) => ({ title, face, tip, end, qs, good: ['Đối phương gật đầu, dịu hẳn.', '“Ừ, vậy cũng hợp lý.”', 'Không khí nhẹ đi trông thấy.'], mid: ['“Ừm… để tôi nghĩ đã.”', 'Họ im lặng cân nhắc.'], bad: ['Họ nhíu mày, khó chịu.', 'Không khí căng thẳng hơn…', '“Anh/chị nói vậy mà nghe được à?”'] });
  Object.assign(IV_CTX, {
    coach: mk('🗣️ Nói chuyện với học trò', '🧢', 'Công bằng, rõ ràng, tôn trọng cầu thủ nhưng giữ kỷ luật chung.', ['Cậu ấy hiểu ra, phòng thay đồ yên ắng trở lại.', 'Cậu ấy tạm nghe, chuyện chưa hẳn xong.', 'Cuộc nói chuyện đổ bể, cầu thủ bỏ ra ngoài.'], [
      ['“Em đá hay nhất đội mà phải ngồi dự bị?”', 'Nêu rõ tiêu chí chọn đội hình và chỉ ra điều em cần cải thiện', 'Hứa lần sau sẽ cho đá', '“HLV quyết định, không bàn cãi.”'],
      ['“Không được đá chính thì em xin sang CLB khác.”', 'Bình tĩnh hỏi lý do thật sự, đưa lộ trình và mốc thời gian cụ thể', 'Bảo em về suy nghĩ thêm', 'Doạ cắt hợp đồng ngay tại chỗ'],
      ['Cả đội xì xào nghi bạn thiên vị?', 'Họp đội, công khai quy tắc áp dụng cho tất cả kể cả ngôi sao', 'Mặc kệ, thắng rồi sẽ yên', 'Chỉ mặt người đồn thổi mắng trước cả đội'],
      ['Cậu ấy gắt: “Ban huấn luyện không công bằng!”', 'Lắng nghe hết, ghi nhận phần đúng rồi trao đổi cụ thể', 'Bảo cậu ấy ra ngoài bình tĩnh lại', '“Không thích thì đi!”'],
      ['Chốt buổi nói chuyện thế nào?', 'Giao mục tiêu rõ ràng, cuối tháng đánh giá lại', 'Hẹn mai nói tiếp', 'Cho đá chính luôn cho khỏi rắc rối']]),
    customer: mk('💬 Xử lý khách hàng', '😠', 'Giữ bình tĩnh, xin lỗi vì sự bất tiện, tìm giải pháp hợp lý.', ['Khách dịu xuống, còn cảm ơn bạn.', 'Khách tạm chấp nhận, vẫn còn ấm ức.', 'Khách bỏ đi và để lại lời chê.'], [
      ['Khách lớn tiếng giữa chỗ đông người?', 'Giữ giọng nhẹ, xin lỗi vì bất tiện rồi hỏi rõ vấn đề', 'Mời khách sang góc khác nói chuyện', 'Cãi lại cho ra lẽ'],
      ['Khách đòi bồi thường quá mức?', 'Giải thích chính sách, đề xuất phương án hợp lý', 'Chuyển cho quản lý xử lý', 'Từ chối thẳng thừng'],
      ['Khách doạ đăng lên mạng?', 'Ghi nhận, cam kết xử lý trong thời hạn cụ thể', 'Nói “anh/chị cứ đăng”', 'Giả vờ không nghe thấy'],
      ['Khách đã bớt giận, bạn kết thúc thế nào?', 'Cảm ơn góp ý, hứa cải thiện và kiểm tra lại sau', 'Nói “vậy nhé” rồi quay đi', 'Nhắc khách lần sau đừng làm vậy nữa']]),
    student: mk('🗣️ Nói chuyện với học trò', '🧒', 'Kiên nhẫn, tìm hiểu nguyên nhân trước khi phán xét.', ['Em mở lòng, chịu kể hết mọi chuyện.', 'Em kể một phần rồi lại im lặng.', 'Em đóng sập lòng, ngồi khóc một mình.'], [
      ['Em im lặng, không chịu kể vì sao nghỉ học?', 'Ngồi xuống ngang tầm, hỏi nhẹ và hứa giữ bí mật', 'Bảo em cứ nghĩ rồi nói', 'Doạ báo phụ huynh nếu không nói'],
      ['Em bảo: “Cô/thầy đừng gọi bố mẹ em.”', 'Hỏi vì sao và cùng tìm cách để gia đình biết mà không bị la', 'Đồng ý không gọi', 'Nói bắt buộc phải gọi, hết chuyện'],
      ['Em nói thẳng: “Em học dốt, bỏ cho rồi.”', 'Chỉ ra một điểm em làm tốt và đề nghị kèm thêm', '“Cố gắng lên em.”', '“Dốt thì đừng đến lớp.”'],
      ['Cuối buổi, bạn dặn em điều gì?', 'Hẹn lịch gặp lại và cho em cách liên lạc khi cần', 'Dặn em đi học đều', 'Bảo em đừng để chuyện này xảy ra nữa']]),
    crisis: mk('🕊️ Xử lý khủng hoảng', '😰', 'Hạ nhiệt trước, lắng nghe, đừng hứa điều không làm được.', ['Tình hình hạ nhiệt, mọi người an toàn.', 'Căng thẳng giảm bớt nhưng chưa dứt.', 'Tình hình xấu đi nhanh chóng.'], [
      ['Đối phương đang rất kích động?', 'Hạ giọng, gọi tên, lắng nghe và nhắc lại điều họ nói', 'Giữ khoảng cách, chờ họ bình tĩnh', 'Quát lớn bắt họ im'],
      ['Họ đòi bạn hứa một điều bạn không chắc làm được?', 'Nói thật những gì có thể làm ngay và những gì cần thời gian', 'Hứa tạm cho yên', 'Từ chối, không bàn thêm'],
      ['Có người xung quanh la ó, thêm dầu vào lửa?', 'Nhờ người phụ trách đưa mọi người ra xa, giữ một người nói chuyện', 'Mặc kệ tiếng ồn', 'Quay sang quát đám đông'],
      ['Họ bắt đầu dịu xuống, bạn làm gì tiếp?', 'Cảm ơn, đề xuất bước tiếp theo cụ thể và ai chịu trách nhiệm', 'Giữ im lặng chờ họ nói', 'Nhắc lại lỗi của họ cho đúng sai rõ ràng']]),
    work: mk('💼 Xử lý công việc', '🧑‍💼', 'Rõ ràng, có căn cứ, giữ đúng chuẩn mực nghề nghiệp.', ['Đối phương đồng ý, công việc êm xuôi.', 'Đối phương tạm chấp nhận, cần theo dõi thêm.', 'Cuộc trao đổi không đi đến đâu.'], [
      ['Cấp trên đưa yêu cầu trái với quy định?', 'Giải thích rủi ro bằng số liệu và đề xuất cách làm hợp lệ', 'Xin thêm thời gian để cân nhắc', 'Làm theo rồi tính sau'],
      ['Đối tác gây áp lực phải quyết ngay?', 'Nói rõ điều kiện bạn chấp nhận và hẹn mốc trả lời cụ thể', 'Xin báo lại sau', 'Đồng ý luôn cho xong'],
      ['Bị chất vấn về một sai sót?', 'Nhận phần trách nhiệm, trình bày cách khắc phục cụ thể', 'Giải thích hoàn cảnh', 'Đẩy trách nhiệm sang người khác'],
      ['Kết thúc cuộc trao đổi thế nào?', 'Tóm tắt thoả thuận, ai làm gì và khi nào', 'Hẹn họp lại', 'Rời đi trước khi bị hỏi thêm']]),
  });
  const JT_CTX = { hlv: 'coach', giaovien: 'student', canhsat: 'crisis', cuuhoa: 'crisis', chinhtri: 'crisis', bacsi: 'customer', duocsi: 'customer', moigioi: 'customer', congchuc: 'crisis', streamer: 'speech', hoasi: 'speech' };
  function ivKind(p) {
    const t = fold((p.title || '') + ' ' + (p.label || ''));
    // ca việc của từng nghề: bộ câu hỏi theo nghề, không dùng câu hỏi gia đình hay phỏng vấn xin việc
    if (/^jt_/.test(p.evId || '') && !/(phong van|ung tuyen)/.test(t)) {
      if (/(toa|kien|luat su|doi chat|bang chung)/.test(t)) return 'argue';
      if (/(phat bieu|hop bao|cong bo)/.test(t)) return 'speech';
      const jid = String(p.evId).replace(/^jt_/, '').replace(/_\d+$/, ''), f = fieldOf(jid);
      return JT_CTX[jid] || (f === 'sales' || f === 'health' ? 'customer' : f === 'teach' ? 'student' : f === 'uniform' ? 'crisis' : 'work');
    }
    if (p.mode === 'job' || /(phong van|ung tuyen|tuyen dung|xin viec|nha tuyen dung|tang luong|giam luong|o lai|shark|goi von|pitch|thang chuc)/.test(t)) return 'job';
    if (/(toa|kien|luat su|doi chat|to cao|cong an|thanh tra|giai trinh|chung minh|bang chung)/.test(t)) return 'argue';
    if (/(phat bieu|nhan giai|livestream|live |cong bo|hop bao|truoc dam dong|san khau)/.test(t)) return 'speech';
    return 'talk';
  }
  function interview(p) {
    const kind = ivKind(p);
    if (kind !== 'job') return talkGame(p, IV_CTX[kind]);
    return new Promise((res) => {
      const st = p.ctx.stats, field = p.field || fieldOf(p.ctx.jobId);
      const qs = shuffle((IV_FIELD[field] || []).slice()).slice(0, 2).concat(shuffle(IV_GEN.slice())).slice(0, 4);
      const secs = 9 + st.smarts / 12, hint = st.smarts >= 70;
      // người phỏng vấn có tính cách: nghiêm khắc (chấm khắt) / thân thiện (dễ tính) / phân tích. Báo cáo cuối liệt kê từng câu.
      const BOSS = [{ n: 'nghiêm khắc', k: -0.05 }, { n: 'thân thiện', k: 0.06 }, { n: 'thích phân tích', k: 0 }], boss = pick(BOSS), rep = [];
      let i = 0, sum = 0, timer = null;
      const box = open('<div class="mini-head"><b>💼 Phỏng vấn</b><small id="ivN"></small></div><div class="mini-bar"><i id="ivT"></i></div><div class="iv-boss"><span>🧑‍💼</span><p id="ivQ"></p></div><div class="mini-ans one" id="ivA"></div><p class="mini-tip" id="ivR"></p><p class="mini-keys">⌨️ Click câu trả lời hoặc bấm phím số <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. Chọn câu khéo léo, chuyên nghiệp nhất.</p>');
      const show = () => {
        if (i >= qs.length) { clearInterval(timer); const score = clamp(sum / qs.length + (st.looks - 50) / 500 + boss.k, 0, 1); res({ score, text: '(Người phỏng vấn ' + boss.n + ') ' + rep.join(' · ') + ' — ' + (score >= 0.75 ? 'Buổi phỏng vấn rất suôn sẻ, nhà tuyển dụng gật gù liên tục.' : score >= 0.45 ? 'Buổi phỏng vấn tạm ổn, có vài câu hơi lúng túng.' : 'Buổi phỏng vấn khá tệ, không khí ngượng ngùng.') }); return; }
        const q = qs[i], opts = shuffle([[q[1], 1], [q[2], 0.45], [q[3], 0]]);
        box.querySelector('#ivN').textContent = 'Câu ' + (i + 1) + '/' + qs.length;
        box.querySelector('#ivQ').textContent = q[0];
        box.querySelector('#ivA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-v="' + o[1] + '"' + (hint && o[1] === 0 ? ' style="opacity:.45" title="Linh cảm: câu này không ổn"' : '') + '><span>' + (k + 1) + '</span>' + esc(o[0]) + (hint && o[1] === 0 ? ' 💡' : '') + '</button>').join('');
        let left = secs, answered = false; const bar = box.querySelector('#ivT'); bar.style.width = '100%';
        const answer = (v, btn) => {
          if (answered) return; answered = true; clearInterval(timer);
          sum += v; rep.push((v === 1 ? '✔' : v > 0 ? '~' : '✖') + ' ' + qs[i][0].replace(/\?$/, '')); sfx(v === 1 ? 'good' : v > 0 ? 'click' : 'bad');
          box.querySelectorAll('.mini-opt').forEach((b) => { b.disabled = true; if (b === btn) b.classList.add(v === 1 ? 'right' : v > 0 ? 'mid' : 'wrong'); });
          box.querySelector('#ivR').textContent = v === 1 ? pick(['Nhà tuyển dụng gật gù, ghi chép.', '“Câu trả lời rất tốt.”', 'Họ mỉm cười hài lòng.']) : v > 0 ? pick(['“Ừm… cũng được.”', 'Họ gật nhẹ, không biểu lộ gì.']) : btn ? pick(['Nhà tuyển dụng nhíu mày.', 'Không khí chùng xuống…', 'Họ liếc nhau một cái.']) : 'Bạn ấp úng mãi không trả lời được.';
          i++; setTimeout(show, 1000);
        };
        clearInterval(timer);
        timer = every(() => { left -= 0.1; bar.style.width = Math.max(0, left / secs * 100) + '%'; if (left <= 0) answer(0, null); }, 100);
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(+b.dataset.v, b)));
        onKeysOnce((e) => { const n = +e.key; if (n >= 1 && n <= 3) { const b = box.querySelectorAll('.mini-opt')[n - 1]; if (b && !b.disabled) answer(+b.dataset.v, b); return true; } return false; });
      };
      show();
    });
  }

  function talkGame(p, C) {
    return new Promise((res) => {
      const st = p.ctx.stats, qs = shuffle(C.qs.slice()).slice(0, 4), secs = 10 + st.smarts / 12, hint = st.smarts >= 70;
      // hai thước đo thay cho đúng/sai đơn thuần: Thiện cảm (đối phương tin bạn) và Kiên nhẫn (để họ chờ lâu hay nói dở thì cạn dần)
      let i = 0, sum = 0, timer = null, like = 40 + (st.looks - 50) / 5, patience = 100;
      const face = (v, pt) => (pt < 25 ? '😠' : v >= 75 ? '😄' : v >= 55 ? '🙂' : v >= 35 ? '😐' : '🙁');
      const box = open('<div class="mini-head"><b>' + C.title + '</b><small id="ivN"></small></div><div class="tk-grid"><div class="tk-who"><div class="tk-face" id="tkF">' + C.face + '</div><div class="tk-meter"><small>Thiện cảm</small><div class="mini-bar"><i id="tkL" style="background:#45c486"></i></div></div><div class="tk-meter"><small>Kiên nhẫn</small><div class="mini-bar"><i id="tkP" style="background:#5cc8ff"></i></div></div></div><div class="tk-chat"><div class="iv-boss"><span>' + C.face + '</span><p id="ivQ"></p></div><div class="mini-bar"><i id="ivT"></i></div><div class="mini-ans one" id="ivA"></div><p class="mini-tip" id="ivR"></p></div></div><p class="mini-keys">⌨️ Click câu trả lời hoặc bấm phím số <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. ' + C.tip + '</p>');
      const meters = () => { const l = clamp(like, 0, 100), pt = clamp(patience, 0, 100); box.querySelector('#tkL').style.width = l + '%'; box.querySelector('#tkP').style.width = pt + '%'; box.querySelector('#tkP').style.background = pt < 30 ? '#ff5c5c' : '#5cc8ff'; box.querySelector('#tkF').textContent = face(l, pt); };
      const show = () => {
        if (i >= qs.length) { clearInterval(timer); const score = clamp(sum / qs.length * 0.7 + clamp(like, 0, 100) / 100 * 0.3 + (st.happy - 50) / 600 - (patience < 20 ? 0.1 : 0), 0, 1); res({ score, text: score >= 0.75 ? C.end[0] : score >= 0.45 ? C.end[1] : C.end[2] }); return; }
        const q = qs[i], opts = shuffle([[q[1], 1], [q[2], 0.45], [q[3], 0]]);
        box.querySelector('#ivN').textContent = 'Lượt ' + (i + 1) + '/' + qs.length;
        box.querySelector('#ivQ').textContent = q[0];
        box.querySelector('#ivR').textContent = '';
        box.querySelector('#ivA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-v="' + o[1] + '"' + (hint && o[1] === 0 ? ' style="opacity:.45"' : '') + '><span>' + (k + 1) + '</span>' + esc(o[0]) + '</button>').join('');
        let left = secs, answered = false; const bar = box.querySelector('#ivT'); bar.style.width = '100%'; meters();
        const answer = (v, btn) => {
          if (answered) return; answered = true; clearInterval(timer); sum += v; sfx(v === 1 ? 'good' : v > 0 ? 'click' : 'bad');
          like += v === 1 ? 18 : v > 0 ? 5 : -16; patience -= v === 1 ? 2 : v > 0 ? 8 : btn ? 22 : 28; patience -= Math.max(0, (secs - left) / secs) * 8; meters();
          box.querySelectorAll('.mini-opt').forEach((b) => { b.disabled = true; if (b === btn) b.classList.add(v === 1 ? 'right' : v > 0 ? 'mid' : 'wrong'); });
          box.querySelector('#ivR').textContent = v === 1 ? pick(C.good) : v > 0 ? pick(C.mid) : btn ? pick(C.bad) : 'Bạn ngập ngừng mãi không nói được gì.';
          i++; setTimeout(show, 1100);
        };
        timer = every(() => { left -= 0.1; bar.style.width = Math.max(0, left / secs * 100) + '%'; bar.style.background = left / secs < 0.3 ? '#ff5c5c' : ''; if (left <= 0) answer(0, null); }, 100);
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(+b.dataset.v, b)));
        onKeysOnce((e) => { const n = +e.key; if (n >= 1 && n <= 3) { const b = box.querySelectorAll('.mini-opt')[n - 1]; if (b && !b.disabled) answer(+b.dataset.v, b); return true; } return false; });
      };
      show();
    });
  }
  // ------------------------------------------------------------------ 11. bán hàng / nấu ăn
  const ING = { banhmi: ['🥖', 'Bánh mì'], pate: ['🥫', 'Pa-tê'], thit: ['🥩', 'Thịt'], rau: ['🥬', 'Rau'], banhpho: ['🍝', 'Bánh phở'], nuocdung: ['🍲', 'Nước dùng'], hanh: ['🧅', 'Hành'], caphe: ['☕', 'Cà phê'], suadac: ['🥛', 'Sữa đặc'], da: ['🧊', 'Đá'], tra: ['🍵', 'Trà'], sua: ['🍼', 'Sữa tươi'], tranchau: ['⚫', 'Trân châu'], bun: ['🍜', 'Bún'], cha: ['🍖', 'Chả'], nuocmam: ['🧂', 'Nước mắm'] };
  const RECIPES = [
    { n: 'Bánh mì', e: '🥖', s: ['banhmi', 'pate', 'thit', 'rau'] },
    { n: 'Phở', e: '🍜', s: ['banhpho', 'thit', 'nuocdung', 'hanh'] },
    { n: 'Cà phê sữa đá', e: '☕', s: ['caphe', 'suadac', 'da'] },
    { n: 'Trà sữa', e: '🧋', s: ['tra', 'sua', 'tranchau', 'da'] },
    { n: 'Bún chả', e: '🥢', s: ['bun', 'cha', 'rau', 'nuocmam'] },
  ];
  function cook(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, DUR = 45, target = Math.round(5 + p.need * 5), pat = 15 + st.smarts / 10 - p.need * 4, hint = st.smarts >= 70;
      const box = open('<div class="mini-head"><b>🍜 Bán hàng</b><small id="ckH"></small></div><div class="ck-queue" id="ckQ"></div><div class="ck-tray" id="ckT"></div><div class="ck-ing" id="ckI"></div><p class="mini-keys">🖱️ Click khách cần phục vụ (hoặc phím <kbd>1</kbd>–<kbd>4</kbd>), rồi click nguyên liệu <b>đúng thứ tự</b> trong công thức. Sai là làm lại món.</p>');
      const ings = shuffle(Object.keys(ING));
      box.querySelector('#ckI').innerHTML = ings.map((k) => '<button type="button" data-g="' + k + '"><span>' + ING[k][0] + '</span>' + ING[k][1] + '</button>').join('');
      // doanh thu: 8k × số nguyên liệu + 5k boa nếu phục vụ khi khách còn >50% kiên nhẫn; giờ cao điểm (20–32s) khách đến gấp đôi, giá ×1.3
      const rushNow = () => t >= 20 && t <= 32; let revenue = 0, tips = 0, missed = 0;
      let queue = [], sel = 0, tray = [], served = 0, lost = 0, t = 0, nextC = 3, done = false, uid = 0, msg = 'Chọn khách rồi làm món theo công thức!';
      const spawn = () => queue.push({ id: ++uid, r: pick(RECIPES), left: pat, max: pat, face: pick(['👩', '👨', '👵', '👴', '🧑', '👧', '👦', '🧔', '👱']) });
      const render = () => {
        const cur = queue[sel];
        box.querySelector('#ckQ').innerHTML = queue.length ? queue.map((q, i) => '<button type="button" class="ck-c' + (i === sel ? ' on' : '') + '" data-q="' + i + '"><b>' + q.face + '</b><span>' + q.r.e + ' ' + q.r.n + '</span><i style="width:' + Math.max(0, q.left / q.max * 100) + '%;background:' + (q.left / q.max < 0.3 ? '#ff5c5c' : '#39cf98') + '"></i></button>').join('') : '<p class="mini-tip">Chưa có khách…</p>';
        box.querySelector('#ckT').innerHTML = (cur ? '<div class="ck-recipe">' + cur.r.e + ' <b>' + cur.r.n + ':</b> ' + cur.r.s.map((k, i) => '<span class="' + (i < tray.length ? 'ok' : i === tray.length && hint ? 'nx' : '') + '">' + ING[k][0] + ' ' + ING[k][1] + '</span>').join(' → ') + '</div>' : '') + '<small>' + esc(msg) + '</small>';
        box.querySelector('#ckH').textContent = (rushNow() ? '🔥 CAO ĐIỂM · ' : '') + 'Còn ' + Math.max(0, Math.ceil(DUR - t)) + 's · phục vụ ' + served + '/' + target + ' · 💰' + revenue + 'k' + (lost ? ' · bỏ về ' + lost : '');
      };
      const add = (k) => {
        if (done) return; const cur = queue[sel]; if (!cur) return;
        if (cur.r.s[tray.length] === k) {
          tray.push(k); sfx('click');
          if (tray.length === cur.r.s.length) { served++; const fast = cur.left / cur.max > 0.5; revenue += Math.round(cur.r.s.length * 8 * (rushNow() ? 1.3 : 1)) + (fast ? 5 : 0); if (fast) tips += 5; sfx('coin'); msg = pick(['Khách khen ngon! 😋', 'Ting ting! Đã thanh toán.', 'Khách hẹn mai quay lại!']); queue.splice(sel, 1); sel = 0; tray = []; }
        } else { tray = []; msg = 'Sai nguyên liệu, làm lại từ đầu!'; sfx('bad'); }
        render();
      };
      box.querySelector('#ckI').addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-g]'); if (b) { e.preventDefault(); add(b.dataset.g); } });
      box.querySelector('#ckQ').addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-q]'); if (b) { e.preventDefault(); if (sel !== +b.dataset.q) { sel = +b.dataset.q; tray = []; } render(); } });
      onKeys((e) => { if (e.type !== 'keydown') return false; const n = +e.key; if (n >= 1 && n <= 4 && queue[n - 1]) { if (sel !== n - 1) { sel = n - 1; tray = []; } render(); return true; } return false; });
      spawn(); spawn(); render();
      every(() => {
        if (done) return; t += 0.1; nextC -= 0.1;
        if (nextC <= 0 && queue.length < 4) { spawn(); nextC = (rand(3.2, 4.8) - p.need * 1.2) * (rushNow() ? 0.5 : 1); }
        queue.forEach((q) => (q.left -= 0.1));
        if (queue.some((q) => q.left <= 0)) {
          const curId = queue[sel] && queue[sel].id;
          missed += queue.filter((q) => q.left <= 0).reduce((a2, q) => a2 + q.r.s.length * 8, 0); lost += queue.filter((q) => q.left <= 0).length; queue = queue.filter((q) => q.left > 0);
          const ni = queue.findIndex((q) => q.id === curId); if (ni < 0) { sel = 0; tray = []; } else sel = ni;
          msg = 'Một khách chờ lâu quá, bỏ về! 😤'; sfx('bad');
        }
        if (t >= DUR) { done = true; const score = clamp(served / target - lost * 0.04, 0, 1); setTimeout(() => res({ score, text: 'Báo cáo doanh thu: ' + revenue + 'k (boa ' + tips + 'k) · phục vụ ' + served + ' khách' + (lost ? ', ' + lost + ' khách bỏ về (mất ~' + missed + 'k)' : '') + ' (mục tiêu ' + target + ').' }), 400); }
        render();
      }, 100);
    });
  }

  // ------------------------------------------------------------------ 12. lướt sóng cổ phiếu
  const NEWS = [
    ['📰 Doanh thu quý vượt kỳ vọng, nhà đầu tư hào hứng', 1, 1], ['📰 Công ty ký hợp đồng lớn với đối tác nước ngoài', 1, 1], ['📰 Lợi nhuận giảm mạnh, ban lãnh đạo xin lỗi cổ đông', -1, 1], ['📰 Cơ quan chức năng điều tra sai phạm kế toán', -1, 1],
    ['🗣️ Tin đồn: “sắp có quỹ lớn gom hàng”', 1, 0], ['🗣️ Tin đồn: “lãnh đạo sắp bán chui cổ phiếu”', -1, 0], ['🗣️ Tin đồn: “công ty sắp được thâu tóm”', 1, 0], ['🗣️ Tin đồn: “sản phẩm mới bị lỗi nặng”', -1, 0],
  ];
  function stock(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, DUR = 25, sig = 0.007 + p.need * 0.008, FEE = 0.002;
      const { box, c, hud } = canvasGame('📈 Sàn giao dịch', '<div class="st-panel"><div><small>Tiền mặt</small><b id="stC">100</b></div><div><small>Cổ phiếu</small><b id="stS">0</b></div><div><small>Tổng tài sản</small><b id="stT">100</b></div><div><small>Lãi / lỗ</small><b id="stP">0%</b></div></div><div class="st-news" id="stN"><small>Bản tin</small><span>Chưa có tin mới. Theo dõi bản tin để đoán xu hướng.</span></div><div class="mini-pad st-pad"><button type="button" data-b="b25">Mua 25% <kbd>1</kbd></button><button type="button" data-b="b50">Mua 50% <kbd>2</kbd></button><button type="button" data-b="b100">Mua hết <kbd>3</kbd></button><button type="button" data-b="s50">Bán 50% <kbd>4</kbd></button><button type="button" data-b="s100">Bán hết <kbd>5</kbd></button></div>', 'Phím <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> mua 25% / 50% / hết · <kbd>4</kbd> <kbd>5</kbd> bán 50% / hết (hoặc <kbd>↑</kbd> mua hết, <kbd>↓</kbd> bán hết). Mỗi lệnh mất phí 0,2%, đừng lướt quá tay. Hết giờ tự bán hết, tính lãi lỗ.');
      // Lệnh điều kiện: 🛡️ cắt lỗ −3% / 🎯 chốt lời +4% so với giá vốn trung bình (bật/tắt, tự khớp khi chạm). Phí 0.2%/lệnh. Cuối phiên: bài học rủi ro.
      const OR = { sl: 0.03, tp: 0.04 }; let entry = 0, slOn = false, tpOn = false, fees = 0, auto = 0, orderMsg = '', orderT = 0;
      let t = -1.5, price = 100, cash = 100, sh = 0, hist = [100], mu = 0, regT = 0, acc = 0, marks = [], done = false, trendHint = 0, newsT = rand(3, 5), pending = null, boost = 0, boostT = 0, lastNews = null;
      const N = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
      const val = () => cash + sh * price, $ = (id) => box.querySelector('#' + id);
      const buy = (f) => { if (done || t < 0 || cash <= 0.5) return; const amt = cash * f; fees += amt * FEE; const nsh = amt * (1 - FEE) / price; entry = (entry * sh + price * nsh) / Math.max(1e-9, sh + nsh); sh += nsh; cash -= amt; marks.push({ i: hist.length - 1, b: 1 }); sfx('coin'); };
      const sell = (f) => { if (done || t < 0 || sh <= 0) return; const q = sh * f; fees += q * price * FEE; cash += q * price * (1 - FEE); sh -= q; if (sh * price < 0.5) { cash += sh * price; sh = 0; } marks.push({ i: hist.length - 1, b: 0 }); sfx('click'); };
      const act = { b25: () => buy(0.25), b50: () => buy(0.5), b100: () => buy(1), s50: () => sell(0.5), s100: () => sell(1) };
      const ord = document.createElement('div'); ord.className = 'mini-btns'; ord.innerHTML = '<button type="button" class="btn btn-soft" data-o="sl">🛡️ Cắt lỗ −3%: TẮT</button><button type="button" class="btn btn-soft" data-o="tp">🎯 Chốt lời +4%: TẮT</button>'; const padEl = box.querySelector('.st-panel') || box.querySelector('.mini-pad'); if (padEl) padEl.insertAdjacentElement('afterend', ord); else box.appendChild(ord);
      ord.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => { if (b.dataset.o === 'sl') { slOn = !slOn; b.textContent = '🛡️ Cắt lỗ −3%: ' + (slOn ? 'BẬT' : 'TẮT'); } else { tpOn = !tpOn; b.textContent = '🎯 Chốt lời +4%: ' + (tpOn ? 'BẬT' : 'TẮT'); } b.classList.toggle('btn-primary', b.dataset.o === 'sl' ? slOn : tpOn); sfx('click'); }));
      padBind(box, '[data-b]', (b) => act[b.dataset.b]());
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; const m = { 1: 'b25', 2: 'b50', 3: 'b100', 4: 's50', 5: 's100', ArrowUp: 'b100', b: 'b100', B: 'b100', ArrowDown: 's100', s: 's100', S: 's100' }[k]; if (!m) return false; act[m](); return true; });
      loop((dt) => {
        t += dt;
        if (t > 0 && !done) {
          acc += dt; regT -= dt; newsT -= dt;
          if (regT <= 0) { regT = rand(2.5, 5); mu = pick([0.006, 0.0045, -0.006, -0.0075, 0, 0.001]); trendHint = rnd() < 0.7 ? Math.sign(mu) : -Math.sign(mu); }
          // bản tin: tin thật (chắc chắn đẩy giá sau ~1,5 giây) hoặc tin đồn (có thể đúng hoặc sai). Trí tuệ cao đọc được độ tin cậy.
          if (newsT <= 0 && !pending && t < DUR - 5) { newsT = rand(5.5, 8); const [txt, dir, real] = pick(NEWS), truth = real ? true : rnd() < 0.55; pending = { txt, dir, real, truth, at: 1.6 }; lastNews = pending; const hintTxt = real ? '' : st.smarts >= 70 ? (truth ? ' · nguồn có vẻ đáng tin' : ' · nguồn khá mơ hồ') : ''; $('stN').innerHTML = '<small>Bản tin</small><span class="' + (dir > 0 ? 'up' : 'dn') + '">' + txt + hintTxt + '</span>'; sfx('notify'); }
          if (pending) { pending.at -= dt; if (pending.at <= 0) { const sgn = pending.truth ? pending.dir : -pending.dir; boost = sgn * 0.012; boostT = 3; pending = null; } }
          if (boostT > 0) boostT -= dt; else boost = 0;
          while (acc >= 0.1) { acc -= 0.1; price = Math.max(5, price * Math.exp(mu + boost + sig * N())); hist.push(price);
            if (sh > 0 && entry) { if (slOn && price <= entry * (1 - OR.sl)) { sell(1); auto++; orderMsg = '🛡️ Lệnh cắt lỗ đã khớp'; orderT = 1.6; entry = 0; } else if (tpOn && price >= entry * (1 + OR.tp)) { sell(1); auto++; orderMsg = '🎯 Lệnh chốt lời đã khớp'; orderT = 1.6; entry = 0; } } }
          orderT = Math.max(0, orderT - dt);
          if (t >= DUR) {
            done = true; if (sh > 0) { cash += sh * price * (1 - FEE); sh = 0; }
            const r = val() / 100 - 1, lesson = r < 0 && !slOn && !auto ? ' 💡 Bài học: đặt lệnh cắt lỗ để giới hạn thua lỗ, đừng “găm” hy vọng.' : r >= 0 ? ' 💡 Lãi chỉ thật khi bạn chốt; luôn tính phí giao dịch.' : ' 💡 Thua lỗ là bình thường — điều quan trọng là kiểm soát mức lỗ mỗi lệnh.';
            setTimeout(() => res({ score: clamp(0.5 + r * 2.5, 0, 1), text: 'Tài khoản ' + (r >= 0 ? 'lãi ' : 'lỗ ') + Math.abs(r * 100).toFixed(1) + '% (trước phí ' + (((val() + fees) / 100 - 1) * 100).toFixed(1) + '%, phí ' + fees.toFixed(2) + '; giá cả phiên ' + (price >= 100 ? 'tăng ' : 'giảm ') + Math.abs(price - 100).toFixed(1) + '%' + (auto ? '; ' + auto + ' lệnh điều kiện khớp' : '') + ').' + lesson }), 700);
          }
        }
        c.fillStyle = '#0f1424'; c.fillRect(0, 0, 640, 400);
        const vis = hist.slice(-240), off = hist.length - vis.length, lo = Math.min(...vis) * 0.98, hi = Math.max(...vis) * 1.02;
        const X = (i) => 20 + (i - off) / 240 * 600, Y = (v) => 360 - (v - lo) / (hi - lo || 1) * 300;
        c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(20, 60 + i * 60); c.lineTo(620, 60 + i * 60); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(20, Y(100)); c.lineTo(620, Y(100)); c.stroke(); c.setLineDash([]);
        if (st.smarts >= 60 && vis.length > 20) { c.strokeStyle = '#ffb347'; c.lineWidth = 2; c.beginPath(); for (let i = 20; i < hist.length; i++) { if (i < off) continue; const m = hist.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20; i === Math.max(20, off) ? c.moveTo(X(i), Y(m)) : c.lineTo(X(i), Y(m)); } c.stroke(); }
        // nến: gom 6 tick (0.6s) / nến
        for (let g = 0; g < vis.length; g += 6) { const seg = vis.slice(g, g + 6), o = seg[0], cl = seg[seg.length - 1], h = Math.max(...seg), l = Math.min(...seg), xm = X(g + off + 3), up = cl >= o; c.strokeStyle = c.fillStyle = up ? '#39cf98' : '#ff5c5c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(xm, Y(h)); c.lineTo(xm, Y(l)); c.stroke(); c.fillRect(xm - 5, Math.min(Y(o), Y(cl)), 10, Math.max(2, Math.abs(Y(o) - Y(cl)))); }
        if (sh > 0 && entry) { c.strokeStyle = 'rgba(255,210,63,.6)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(20, Y(entry)); c.lineTo(620, Y(entry)); c.stroke(); c.setLineDash([]); }
        if (orderT > 0) { c.fillStyle = '#ffd23f'; c.font = '800 18px sans-serif'; c.textAlign = 'center'; c.fillText(orderMsg, 320, 90); }
        marks.forEach((m) => { if (m.i < off) return; c.fillStyle = m.b ? '#39cf98' : '#ff5c5c'; c.beginPath(); c.arc(X(m.i), Y(hist[m.i]), 6, 0, 7); c.fill(); });
        c.fillStyle = '#fff'; c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'left'; c.fillText('Giá ' + price.toFixed(2), 24, 36);
        c.textAlign = 'right'; c.fillStyle = sh > 0 ? '#39cf98' : '#9ad1ff'; c.fillText(sh > 0 ? '📦 Đang giữ ' + Math.round(sh * price / Math.max(1, val()) * 100) + '% cổ phiếu' : '💵 Đang cầm tiền', 616, 36);
        if (st.smarts >= 80 && t > 0) { c.font = '700 15px sans-serif'; c.fillStyle = '#ffd23f'; c.fillText('Dự báo: ' + (trendHint > 0 ? '↗ tăng' : trendHint < 0 ? '↘ giảm' : '→ đi ngang'), 616, 58); }
        countdown(c, t, 'MỞ PHIÊN!');
        const r = val() / 100 - 1;
        $('stC').textContent = cash.toFixed(1); $('stS').textContent = sh.toFixed(2); $('stT').textContent = val().toFixed(1); const pe = $('stP'); pe.textContent = (r >= 0 ? '+' : '') + (r * 100).toFixed(1) + '%'; pe.style.color = r >= 0 ? '#45c486' : '#ff6b68';
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(DUR - Math.max(0, t))) + 's';
      });
    });
  }

  // ------------------------------------------------------------------ 13. tỏ tình / hẹn hò / cầu hôn
  const LOVE_Q = [
    ['{n}: “Hôm nay trời đẹp ghê ha?”', '“Đẹp, nhưng chưa bằng nụ cười của bạn.” 😊', '“Ừ, mát ghê.”', '“Ừ, mà nóng chết đi được.”'],
    ['{n}: “Cuối tuần bạn hay làm gì?”', '“Đi ăn vặt khám phá quán mới, bạn đi cùng không?”', '“Ngủ.”', '“Chơi game xuyên đêm, ai rủ cũng không đi.”'],
    ['{n}: “Sao tự nhiên rủ mình đi chơi vậy?”', '“Vì ở cạnh bạn mình thấy vui thật sự.”', '“Tự nhiên thôi.”', '“Tại đứa kia bận nên rủ bạn.”'],
    ['{n}: “Bạn có hay nghĩ về tương lai không?”', '“Có, và dạo này trong đó hay có bạn.”', '“Thỉnh thoảng.”', '“Tương lai gì, sống nay biết nay.”'],
    ['{n} lỡ tay làm đổ nước lên áo bạn.', 'Cười: “Coi như bạn nợ mình một buổi cà phê nhé!”', '“Không sao đâu.”', '“Trời ơi, áo hiệu đó!”'],
    ['{n}: “Mình nói nhiều quá phải không?”', '“Mình thích nghe bạn kể mà, kể tiếp đi!”', '“Hơi hơi.”', '“Ừ, mỏi tai thật.”'],
    ['{n}: “Món này ngon không?”', 'Gắp phần ngon nhất bỏ vào bát {n}', '“Cũng được.”', '“Dở, lần sau đừng chọn quán này.”'],
    ['{n}: “Người yêu cũ của bạn thế nào?”', '“Chuyện cũ rồi, giờ mình chỉ muốn nghe về bạn.”', '“Bình thường thôi.”', 'Kể say sưa suốt nửa tiếng'],
  ];
  function love(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, nm = p.partnerName || 'Người ấy';
      // tính cách người ấy: nhút nhát (thích lời nhẹ nhàng, nói quá lố thì mất điểm) · năng động (thích sự chủ động) · thực tế (ghét lúng túng). Ánh mắt/cử chỉ báo trước tính cách.
      const PER = [{ n: 'nhút nhát', hint: '🙈 ngại ngùng, hay nhìn xuống', adj: (v) => (v === 6 ? 8 : v === 22 ? -8 : 0) }, { n: 'năng động', hint: '😄 cười tươi, mắt sáng, nói nhanh', adj: (v) => (v === 22 ? 6 : 0) }, { n: 'thực tế', hint: '🤔 nhìn bạn dò xét, khoanh tay', adj: (v) => (v === -16 ? -4 : 0) }], per = pick(PER);
      let heart = clamp(30 + (st.looks - 50) / 2.5, 10, 55), round = 0, timer = null;
      const qs = shuffle(LOVE_Q.slice()).slice(0, 3);
      const box = open('<div class="mini-head"><b>💘 ' + (p.propose ? 'Cầu hôn' : 'Tỏ tình') + '</b><small id="lvH"></small></div><div class="lv-meter"><i id="lvM"></i></div><div class="mini-bar"><i id="lvT"></i></div><p class="mini-q" id="lvQ"></p><div class="mini-ans one" id="lvA"></div><p class="mini-tip" id="lvR"></p><p class="mini-keys">⌨️ Chọn câu trả lời bằng click hoặc phím <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. Màn cuối: bấm <kbd>Space</kbd> khi trái tim nằm trong vùng hồng.</p>');
      const upd = () => { heart = clamp(heart, 0, 100); box.querySelector('#lvM').style.width = heart + '%'; box.querySelector('#lvH').textContent = '❤️ Cảm tình ' + Math.round(heart) + '%'; };
      const ask = () => {
        if (round >= qs.length) { finale(); return; }
        const q = qs[round], opts = shuffle([[q[1], 22], [q[2], 6], [q[3], -16]]);
        box.querySelector('#lvQ').innerHTML = esc(q[0].replace(/\{n\}/g, nm)) + '<br><small style="opacity:.7">' + esc(nm + ': ' + per.hint) + '</small>';
        box.querySelector('#lvA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-v="' + o[1] + '"><span>' + (k + 1) + '</span>' + esc(o[0].replace(/\{n\}/g, nm)) + '</button>').join('');
        let left = 8, answered = false; const bar = box.querySelector('#lvT');
        const answer = (v, btn) => {
          if (answered) return; answered = true; clearInterval(timer);
          heart += v + per.adj(v); upd(); sfx(v > 10 ? 'good' : v > 0 ? 'click' : 'bad');
          box.querySelectorAll('.mini-opt').forEach((b) => { b.disabled = true; if (b === btn) b.classList.add(v > 10 ? 'right' : v > 0 ? 'mid' : 'wrong'); });
          box.querySelector('#lvR').textContent = v > 10 ? pick([nm + ' bật cười, má ửng hồng.', nm + ' nhìn bạn lâu hơn một chút.', 'Tim ' + nm + ' như lỡ một nhịp.']) : v > 0 ? nm + ' gật đầu, không nói gì.' : btn ? pick([nm + ' cười gượng…', 'Không khí hơi ngượng.', nm + ' lảng sang chuyện khác.']) : 'Bạn đứng hình, không nói nên lời…';
          round++; setTimeout(ask, 1100);
        };
        clearInterval(timer);
        timer = every(() => { left -= 0.1; bar.style.width = Math.max(0, left / 8 * 100) + '%'; if (left <= 0) answer(-10, null); }, 100);
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(+b.dataset.v, b)));
        onKeysOnce((e) => { const n = +e.key; if (n >= 1 && n <= 3) { const b = box.querySelectorAll('.mini-opt')[n - 1]; if (b && !b.disabled) answer(+b.dataset.v, b); return true; } return false; });
      };
      const finale = () => {
        box.querySelector('#lvT').style.width = '0%';
        box.querySelector('#lvQ').textContent = p.propose ? 'Quỳ xuống… mở hộp nhẫn đúng lúc tim ' + nm + ' rung động nhất!' : 'Khoảnh khắc quyết định: nói ra đúng lúc!';
        box.querySelector('#lvR').textContent = '';
        box.querySelector('#lvA').innerHTML = '<canvas class="mini-cv" width="640" height="120"></canvas><div class="mini-btns"><button type="button" class="btn btn-primary" data-go>' + (p.propose ? '💍 Mở hộp nhẫn!' : '💘 Nói “Mình thích bạn!”') + '</button></div>';
        const cv = box.querySelector('#lvA canvas'), c = cv.getContext('2d');
        const zone = 0.06 + st.looks / 100 * 0.09, center = rand(0.3, 0.7), sp = 1.2 + rnd() * 0.5;
        let t = 0, fired = false;
        const fire = () => {
          if (fired) return; fired = true;
          const pos = 0.5 + 0.5 * Math.sin(t * sp * 2.4), ok = Math.abs(pos - center) < zone;
          heart += ok ? 25 : -12; upd(); sfx(ok ? 'cheer' : 'bad');
          box.querySelector('#lvR').textContent = ok ? (p.propose ? nm + ' bật khóc, đưa tay ra…' : nm + ' đỏ mặt, khẽ gật đầu…') : nm + ' giật mình, chưa kịp chuẩn bị tinh thần…';
          setTimeout(() => res({ score: clamp(heart / 100, 0, 1), text: 'Cảm tình của ' + nm + ' (' + per.n + ') dành cho bạn: ' + Math.round(heart) + '%.' + (heart < 45 ? ' Dù kết quả thế nào, hãy tôn trọng quyết định của người ấy — một lời từ chối không phải là thất bại của bạn.' : '') }), 1200);
        };
        box.querySelector('[data-go]').onclick = fire; cv.addEventListener('pointerdown', (e) => { e.preventDefault(); fire(); });
        onKeysOnce((e) => { if (e.key === ' ' || e.key === 'Enter') { fire(); return true; } return false; });
        loop((dt) => {
          if (!fired) t += dt;
          const pos = 0.5 + 0.5 * Math.sin(t * sp * 2.4);
          c.fillStyle = '#2a1830'; c.fillRect(0, 0, 640, 120);
          c.fillStyle = '#111'; c.fillRect(40, 50, 560, 24); c.fillStyle = '#ff6fae'; c.fillRect(40 + (center - zone) * 560, 50, zone * 2 * 560, 24);
          c.font = '34px sans-serif'; c.textAlign = 'center'; c.fillText('❤️', 40 + pos * 560, 46 + Math.sin(t * 10) * 3);
        });
      };
      upd(); ask();
    });
  }

  // ------------------------------------------------------------------ 14. mặc cả
  function haggle(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, buyMode = p.mode === 'buy';
      // tính cách người bán: cứng (giá sàn +2%, kiên nhẫn tụt ×1.5) · dễ tính (tụt ×0.6) · nóng tính (chê hàng là nổi cáu). Giá sàn ẩn (≈ giá vốn) quanh 0.86–0.95 × giá hỏi.
      const PERS = { cung: { n: 'Cứng đầu', fl: 0.02, pm: 1.5 }, de: { n: 'Dễ tính', fl: -0.01, pm: 0.6 }, nong: { n: 'Nóng tính', fl: 0, pm: 1 } }, pk = pick(Object.keys(PERS)), PS = PERS[pk];
      let floor = clamp(0.86 + (p.need || 0.4) * 0.06 + rand(-0.03, 0.02) - (st.smarts - 50) / 1500 + PS.fl, 0.8, 0.96);
      let ask = 1, pat = 100, round = 0, done = false, praised = 0, bulk = false, bluffed = false;
      const fmt = (f) => (buyMode && p.price ? money(p.price * f) : Math.round(f * 100) + '% giá gốc');
      const seller = pick(['🧑‍🌾', '👨‍💼', '👩‍💼', '👵', '🧔']);
      const box = open('<div class="mini-head"><b>🧧 Mặc cả</b><small>' + esc(p.item || p.label) + ' · lượt <span id="hgN">1</span>/8</small></div>' +
        '<div class="iv-boss"><span>' + seller + '</span><p id="hgS">“' + (buyMode ? 'Giá này là chuẩn rồi, mua đi kẻo hết!' : 'Hàng tốt, giá mềm, không nói thách!') + '”</p></div>' +
        '<div class="hg-row"><small>Kiên nhẫn người bán</small><div class="mini-bar"><i id="hgP" style="width:100%;background:#39cf98"></i></div></div>' +
        '<p class="mini-goal">Người bán đang hỏi: <b id="hgA"></b> · <small>Tính: ' + PS.n + '</small></p>' +
        '<input type="range" id="hgR" class="hg-range" min="60" max="100" step="1" value="85"><p class="mini-goal">Bạn trả: <b id="hgO"></b></p>' +
        '<p class="mini-tip" id="hgM"></p>' +
        '<div class="mini-btns hg-acts"><button type="button" class="btn btn-soft" data-act="praise">😊 Khen hàng</button><button type="button" class="btn btn-soft" data-act="crit">🧐 Chê hàng</button><button type="button" class="btn btn-soft" data-act="else">🏪 Chỗ khác rẻ hơn</button><button type="button" class="btn btn-soft" data-act="bulk">🛒 Mua thêm</button><button type="button" class="btn btn-soft" data-act="leave">🚶 Giả vờ bỏ đi</button></div><div class="mini-btns"><button type="button" class="btn btn-ghost" data-deal>🤝 Chốt giá đang hỏi</button><button type="button" class="btn btn-primary" data-offer>💬 Trả giá <kbd>Enter</kbd></button></div>' +
        '<p class="mini-keys">⌨️ Kéo thanh (hoặc <kbd>←</kbd> <kbd>→</kbd>) để chọn giá, <kbd>Enter</kbd> để trả giá. Trả thấp quá thanh kiên nhẫn tụt mạnh, về 0 là người bán bỏ đi.</p>');
      const R = box.querySelector('#hgR');
      const say = (s) => { box.querySelector('#hgS').textContent = '“' + s + '”'; };
      const upd = () => {
        R.max = String(Math.round(ask * 100)); if (+R.value > ask * 100) R.value = String(Math.round(ask * 100));
        box.querySelector('#hgA').textContent = fmt(ask); box.querySelector('#hgO').textContent = fmt(+R.value / 100);
        box.querySelector('#hgN').textContent = String(Math.min(8, round + 1));
        const pb = box.querySelector('#hgP'); pb.style.width = Math.max(0, pat) + '%'; pb.style.background = pat < 35 ? '#ff5c5c' : pat < 65 ? '#ffb347' : '#39cf98';
        box.querySelector('#hgM').textContent = st.smarts >= 70 ? (ask - floor > 0.05 ? '😏 Nhìn mặt người bán: còn bớt được kha khá' : ask - floor > 0.015 ? '🤔 Có vẻ còn bớt được chút ít' : '😤 Sát giá vốn rồi, đừng ép nữa') : '';
      };
      const deal = (f, why) => { if (done) return; done = true; const d = 1 - f; sfx(d > 0.05 ? 'cheer' : 'coin'); const rate = d >= 0.08 ? '🟢 Giá RẺ' : d >= 0.03 ? '🟡 Giá HỢP LÝ' : '🔴 HƠI HỚ'; setTimeout(() => res({ score: clamp(buyMode ? d / 0.15 : d / 0.12, 0, 1), text: why + ' Giá chốt ' + fmt(f) + (d > 0.004 ? ' (bớt ' + Math.round(d * 100) + '%)' : '') + ' — ' + rate + (bulk ? ' (kèm mua thêm hàng)' : '') + '.' }), 700); };
      const walk = () => { if (done) return; done = true; sfx('bad'); say('Thôi không bán nữa, đi chỗ khác mà mua!'); setTimeout(() => res({ score: 0, text: 'Người bán phẩy tay bỏ đi.' + (buyMode ? ' Bạn năn nỉ mãi mới được mua lại đúng giá gốc.' : '') }), 900); };
      const offer = () => {
        if (done) return;
        const o = Math.min(ask, +R.value / 100); round++;
        if (o >= ask - 0.004) { deal(o, 'Người bán gật đầu.'); return; }
        if (o >= floor) {
          const na = o + (ask - o) * rand(0.35, 0.6); pat -= 6 * PS.pm;
          if (na - o < 0.015) { deal(o, 'Người bán thở dài: “Thôi, bán cho lấy may!”'); return; }
          ask = na; say(pick(['Thêm chút nữa đi, lời lãi gì đâu!', 'Bớt thế này là hết cỡ rồi đấy!', fmt(ask) + ' thì lấy, không là thôi.'])); sfx('click');
        } else {
          pat -= (12 + (floor - o) * 260) * PS.pm; ask = Math.max(floor, ask - rand(0.004, 0.012));
          say(pick(['Trả thế thì lỗ vốn à!', 'Đùa à? Giá đó tôi nhập còn không được!', 'Trả giá kiểu đấy ai bán!'])); sfx('bad');
        }
        if (pat <= 0) { walk(); return; }
        if (round >= 8) { deal(ask, 'Người bán chốt: “Giá cuối rồi đấy!”'); return; }
        upd();
      };
      // hành động ngoài trả giá
      const act = (a) => {
        if (done) return; round++; sfx('click');
        if (a === 'praise') { if (praised >= 2) { say('Khen mãi cũng không bớt đâu nhé!'); } else { praised++; pat = Math.min(100, pat + 12); ask = Math.max(floor, ask - 0.004); say('Cậu khéo nói chuyện đấy, để tôi tính lại cho!'); } }
        else if (a === 'crit') { const hot = pk === 'nong'; if (ask - floor > 0.02 && !hot) { ask = Math.max(floor, ask - rand(0.012, 0.028)); pat -= 8 * PS.pm; say('Hàng này mà chê à? Thôi bớt chút…'); } else { pat -= (hot ? 26 : 16); say(hot ? 'Chê hàng tôi hả?! Ra chỗ khác!' : 'Sát giá vốn rồi, chê cũng vậy thôi.'); sfx('bad'); } }
        else if (a === 'else') { if (rnd() < 0.42 + st.smarts / 250 - (pk === 'cung' ? 0.2 : 0)) { ask = Math.max(floor, ask - rand(0.02, 0.04)); say('Thôi được, bán cho cậu giá này, đừng qua bên kia!'); } else { pat -= 22 * PS.pm; say('Chỗ kia rẻ thì cậu qua đó mà mua!'); sfx('bad'); } }
        else if (a === 'bulk') { if (bulk) { say('Mua thêm rồi còn gì nữa?'); } else { bulk = true; floor = Math.max(0.78, floor - 0.02); ask = Math.max(floor, ask - 0.02); say('Lấy nhiều à? Vậy tôi bớt cho!'); } }
        else if (a === 'leave') { if (bluffed) { say('Lần này tôi không gọi lại đâu.'); pat -= 25; } else { bluffed = true; if (ask - floor < 0.035) { ask = Math.max(floor + 0.003, ask - 0.02); say('Ơ khoan! Thôi quay lại, tôi chịu thiệt chút!'); } else { return walk(); } } }
        if (pat <= 0) return walk();
        if (round >= 8) return deal(ask, 'Người bán chốt: “Giá cuối rồi đấy!”');
        upd();
      };
      box.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => act(b.dataset.act)));
      R.oninput = upd;
      box.querySelector('[data-offer]').onclick = offer;
      box.querySelector('[data-deal]').onclick = () => deal(ask, 'Bạn đồng ý giá người bán đưa ra.');
      onKeys((e) => { if (e.type !== 'keydown') return false; if (e.key === 'Enter') { offer(); return true; } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { R.value = String(+R.value - 1); upd(); return true; } if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { R.value = String(+R.value + 1); upd(); return true; } return false; });
      upd();
    });
  }

  // ------------------------------------------------------------------ 15. cấp cứu: ép tim + thổi ngạt
  function cpr(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, T = 60 / 110, tol = 0.07 + st.smarts / 100 * 0.06;
      const { box, cv, c, hud } = canvasGame('🫀 Cấp cứu', '<div class="mini-pad"><button type="button" data-k="push">🫸 ÉP TIM <kbd>Space</kbd></button><button type="button" data-k="air">🌬️ THỔI NGẠT <kbd>↑</kbd></button></div>', '<kbd>Space</kbd> ép tim mỗi khi vòng cam co sát vòng trắng (30 lần; trước đó chọn đúng quy trình bằng phím 1–3) · khi hiện chữ THỔI NGẠT thì bấm <kbd>↑</kbd> 2 lần. Làm 2 chu kỳ.');
      // quy trình thật: an toàn hiện trường → gọi 115 → kiểm tra ý thức/hô hấp → ép tim 30 lần : thổi ngạt 2 lần (2 chu kỳ). Mệt dần: chu kỳ 2 dung sai nhịp hẹp 20%.
      const STEPS = ['Đảm bảo an toàn hiện trường', 'Gọi 115 (nhờ người xung quanh)', 'Kiểm tra ý thức & hơi thở (≤10 giây)'];
      let order = shuffle([0, 1, 2]), stepN = 0, mistakes = 0, prepMsg = '';
      const pickStep = (idx) => { if (mode !== 'prep') return; const v = order[idx]; if (v === stepN) { stepN++; sfx('good'); prepMsg = '✔ ' + STEPS[v]; if (stepN >= 3) { mode = 'c'; t = -2; } } else { mistakes++; sfx('bad'); prepMsg = '✖ Chưa đúng thứ tự! Cần: ' + STEPS[stepN]; } };
      cv.addEventListener('pointerdown', (e) => { if (mode !== 'prep') return; const r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / r.height * 400, i = Math.floor((y - 90) / 80); if (i >= 0 && i < 3) pickStep(i); });
      let t = -2, cyc = 0, cycStart = 0.4, k = 0, mode = 'prep', bStart = 0, bCount = 0, breaths = 0, comp = [], squeeze = 0, done = false, msg = '', msgT = 0, ecg = [];
      const say = (m) => { msg = m; msgT = 0.6; };
      const tolNow = () => tol * (cyc >= 1 ? 0.8 : 1);
      const grade = (err) => (err < tolNow() ? 1 : err < tolNow() * 2 ? 0.5 : 0);
      const push = () => {
        if (done || t < 0 || mode === 'prep') return;
        if (mode !== 'c') { say('Đang tới lượt thổi ngạt!'); return; }
        squeeze = 0.18;
        const rel = t - cycStart, kk = Math.round(rel / T);
        if (kk < k || kk > 29) { say('Nhanh quá!'); return; }
        while (k < kk) { comp.push(0); k++; }
        const g = grade(Math.abs(rel - kk * T)); comp.push(g); k = kk + 1;
        if (g === 1) sfx('click'); else say(rel < kk * T ? 'Hơi sớm' : 'Hơi trễ');
      };
      const air = () => { if (done || t < 0) return; if (mode === 'b' && bCount < 2) { bCount++; sfx('click'); say('Thổi ' + bCount + '/2'); } else if (mode === 'c') say('Chưa tới lượt thổi!'); };
      padBind(box, '[data-k]', (b) => (b.dataset.k === 'push' ? push() : air()));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const kk = e.key; if (mode === 'prep' && /^[1-3]$/.test(kk)) { pickStep(+kk - 1); return true; } if (kk === ' ' || kk === 'Enter' || kk === 'j' || kk === 'J') push(); else if (kk === 'ArrowUp' || kk === 'b' || kk === 'B' || kk === 'w' || kk === 'W') air(); else return false; return true; });
      loop((dt) => {
        if (mode === 'prep') t = -2; else t += dt; squeeze = Math.max(0, squeeze - dt); msgT = Math.max(0, msgT - dt);
        if (t > 0 && !done) {
          if (mode === 'c') {
            const rel = t - cycStart;
            while (k <= 29 && rel > k * T + T / 2) { comp.push(0); k++; say('Lỡ nhịp!'); }
            if (k > 29) { mode = 'b'; bStart = t; bCount = 0; say('THỔI NGẠT 2 LẦN!'); }
          } else if (mode === 'b' && t - bStart > 2.6) {
            breaths += bCount; cyc++;
            if (cyc >= 2) {
              done = true; const cs = comp.reduce((a, b) => a + b, 0) / Math.max(60, comp.length);
              const score = clamp(cs * 0.85 + breaths / 4 * 0.15 - mistakes * 0.06, 0, 1);
              setTimeout(() => res({ score, text: 'Ép tim đúng nhịp ' + Math.round(cs * 100) + '%, thổi ngạt ' + breaths + '/4 lần' + (mistakes ? ', sai quy trình ' + mistakes + ' lần' : '') + '. 💡 Nhớ: an toàn → gọi 115 → kiểm tra thở → ép tim 30 : thổi 2, ép sâu ~5cm, 100–120 lần/phút.' }), 600);
            } else { mode = 'c'; cycStart = t + 0.8; k = 0; }
          }
        }
        const avg = comp.length ? comp.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, comp.length) : 0;
        ecg.push(t > 0 && Math.abs(((t - cycStart) % T + T) % T) < 0.05 && avg > 0.4 ? 1 : 0); if (ecg.length > 300) ecg.shift();
        c.fillStyle = '#0f1424'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#18233a'; c.fillRect(60, 250, 520, 110);
        c.fillStyle = '#3b6ea5'; c.fillRect(150, 200 + squeeze * 40, 300, 70);
        c.fillStyle = '#f2c39a'; c.beginPath(); c.arc(110, 235, 34, 0, 7); c.fill();
        c.fillStyle = '#f2c39a'; c.fillRect(260, 130 + squeeze * 120, 60, 80);
        c.fillStyle = 'rgba(69,196,134,.08)'; c.fillRect(330, 28, 280, 80); c.strokeStyle = '#45c486'; c.lineWidth = 2; c.beginPath(); ecg.forEach((v, i) => { const x = 330 + i, y = 70 - v * 40; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
        c.fillStyle = '#9fb0cc'; c.font = '700 14px sans-serif'; c.textAlign = 'left'; c.fillText('Nhịp tim bệnh nhân', 330, 128);
        c.fillStyle = '#232d40'; c.fillRect(330, 140, 280, 10); c.fillStyle = avg > 0.6 ? '#45c486' : avg > 0.3 ? '#ffb547' : '#ef6a62'; c.fillRect(330, 140, 280 * Math.min(1, avg), 10); c.fillStyle = '#9fb0cc'; c.fillText('Hồi phục', 330, 170);
        if (mode === 'prep') {
          c.fillStyle = '#e8ecf6'; c.font = '800 20px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText('Phát hiện người ngã gục! Bước ' + (stepN + 1) + '/3 — làm gì trước?', 320, 60);
          order.forEach((v, i) => { const y = 90 + i * 80; c.fillStyle = v < stepN ? 'rgba(69,196,134,.35)' : '#1d2a44'; c.fillRect(100, y, 440, 62); c.strokeStyle = '#3b6ea5'; c.strokeRect(100, y, 440, 62); c.fillStyle = '#fff'; c.font = '700 16px sans-serif'; c.fillText((i + 1) + '. ' + STEPS[v], 320, y + 37); });
          if (prepMsg) { c.fillStyle = prepMsg[0] === '✔' ? '#45c486' : '#ff8a80'; c.font = '700 15px sans-serif'; c.fillText(prepMsg, 320, 360); }
        }
        else if (mode === 'c' && t > 0) { const ph = (((t - cycStart) % T) + T) % T / T; beatRing(c, 80, 70, ph, Math.min(ph, 1 - ph) * T < tolNow()); }
        else if (mode === 'b') { c.font = '40px sans-serif'; c.textAlign = 'center'; c.fillText('🌬️', 80, 85); }
        c.fillStyle = '#e8ecf6'; c.font = '800 20px "Baloo 2", sans-serif'; c.textAlign = 'center';
        c.fillText(mode === 'c' ? 'Ép tim ' + Math.min(30, k) + '/30 · chu kỳ ' + (cyc + 1) + '/2' : 'Thổi ngạt ' + bCount + '/2', 320, 390);
        if (msgT > 0) bigText(c, msg, 160, msg.startsWith('THỔI') ? '#1d6fa5' : '#d63c3c', 30);
        if (mode !== 'prep') countdown(c, t, 'ÉP!');
        hud.textContent = 'Đúng nhịp ' + comp.filter((x) => x === 1).length + '/' + comp.length;
      });
    });
  }

  // ------------------------------------------------------------------ 16. xì dách
  function cards(p) {
    return new Promise((res) => {
      // CONFIG: vốn 10 chip, cược 1–3 chip/ván (không quá vốn). Xì dách ăn 1.5×, xì bàng/ngũ linh ăn 2×. Điểm = 0.5 + lãi/lỗ ÷ 20. Gợi ý xác suất quắc: dễ (need<0.4) hoặc trí tuệ ≥ 65.
      const XD = { bank: 10, hands: 5, maxBet: 3 };
      const st = p.ctx.stats, hint = st.smarts >= 65 || p.need < 0.4, dealerStand = p.need > 0.6 ? 17 : 16, HANDS = XD.hands;
      const box = open('<div class="mini-head"><b>🃏 Xì dách</b><small id="xdH"></small></div>' +
        '<div class="xd-row"><small>Nhà cái</small><div id="xdD" class="xd-cards"></div><b id="xdDv"></b></div>' +
        '<div class="xd-row"><small>Bạn</small><div id="xdP" class="xd-cards"></div><b id="xdPv"></b></div>' +
        '<p class="mini-tip" id="xdM"></p><div class="mini-btns" id="xdBet"></div><div class="mini-btns" id="xdAct"><button type="button" class="btn btn-soft" data-x="hit">🂠 Rút <kbd>H</kbd></button><button type="button" class="btn btn-primary" data-x="stand">✋ Dằn <kbd>S</kbd></button></div>' +
        '<p class="mini-keys">⌨️ <kbd>H</kbd> rút thêm bài · <kbd>S</kbd> (hoặc <kbd>Enter</kbd>) dằn. Gần 21 điểm nhất mà không quá 21 thì thắng; dưới 16 điểm phải rút thêm.</p>');
      const SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      let deck = [], hand = 0, pts = 0, wins = 0, pushes = 0, P = [], D = [], live = false, bank = XD.bank, bet = 1;
      const newDeck = () => { deck = []; SUITS.forEach((s) => RANKS.forEach((r) => deck.push({ r, s }))); shuffle(deck); };
      const draw = () => { if (deck.length < 12) newDeck(); return deck.pop(); };
      const valOf = (cs) => { let v = 0, a = 0; cs.forEach((x) => { if (x.r === 'A') { a++; v += 11; } else v += ['J', 'Q', 'K'].includes(x.r) ? 10 : +x.r; }); while (v > 21 && a) { v -= 10; a--; } return v; };
      const special = (cs) => (cs.length === 2 && cs.every((x) => x.r === 'A') ? 'Xì bàn' : cs.length === 2 && cs.some((x) => x.r === 'A') && cs.some((x) => ['10', 'J', 'Q', 'K'].includes(x.r)) ? 'Xì dách' : null);
      const cardH = (x, hide) => (hide ? '<span class="xd-c back">🂠</span>' : '<span class="xd-c' + ('♥♦'.includes(x.s) ? ' red' : '') + '">' + x.r + x.s + '</span>');
      const render = (showD, m) => {
        box.querySelector('#xdD').innerHTML = D.map((x, i) => cardH(x, !showD && i === 1)).join('');
        box.querySelector('#xdDv').textContent = showD ? String(valOf(D)) : '?';
        box.querySelector('#xdP').innerHTML = P.map((x) => cardH(x)).join('');
        box.querySelector('#xdPv').textContent = String(valOf(P));
        box.querySelector('#xdH').textContent = 'Ván ' + Math.min(hand + 1, HANDS) + '/' + HANDS + ' · thắng ' + wins + (pushes ? ' · hòa ' + pushes : '') + ' · 🪙 ' + bank + ' chip' + (live ? ' (cược ' + bet + ')' : '');
        const bust = deck.length ? deck.filter((x) => valOf(P.concat([x])) > 21).length / deck.length : 0;
        box.querySelector('#xdM').textContent = m || (live ? (valOf(P) < 16 ? 'Dưới 16 điểm (non) – phải rút thêm.' : '') + (hint ? ' 🧠 Rút thêm có ' + Math.round(bust * 100) + '% bị quắc.' : '') : '');
      };
      const endHand = (r, m, mult) => {
        live = false; const delta = r === 'win' ? Math.round(bet * (mult || 1) * 2) / 2 : r === 'lose' ? -bet : 0; bank += delta; m = (m || '') + (delta ? ' (' + (delta > 0 ? '+' : '') + delta + ' chip)' : '');
        if (r === 'win') { wins++; pts += 1; sfx('coin'); } else if (r === 'push') { pushes++; pts += 0.5; sfx('click'); } else sfx('bad');
        render(true, m); hand++;
        setTimeout(() => { if (hand >= HANDS || bank <= 0) { const net = bank - XD.bank; if (KN.Mini) KN.Mini.lastOut = { gambling: true, net }; res({ score: clamp(0.5 + net / 20, 0, 1), text: 'Thắng ' + wins + ', hòa ' + pushes + ', thua ' + (hand - wins - pushes) + ' ván · ' + (net >= 0 ? 'lãi ' : 'lỗ ') + Math.abs(net) + ' chip. 🎲 Cờ bạc rất dễ gây nghiện — chỉ nên coi là trò vui.' }); } else askBet(); }, 1500);
      };
      const deal = () => {
        P = [draw(), draw()]; D = [draw(), draw()]; live = true;
        box.querySelector('#xdBet').innerHTML = ''; box.querySelector('#xdAct').style.display = '';
        const sp = special(P), sd = special(D);
        if (sp || sd) { if (sp && sd) endHand('push', 'Cả hai cùng ' + sp + '! Hòa.'); else if (sp) endHand('win', sp + '! Bạn ăn ngay.', 1.5); else endHand('lose', 'Nhà cái ' + sd + '! Bạn thua.'); return; }
        render(false);
      };
      // chọn mức cược trước mỗi ván
      const askBet = () => {
        live = false; const bx = box.querySelector('#xdBet'); box.querySelector('#xdAct').style.display = 'none'; P = []; D = []; render(true, 'Chọn mức cược cho ván này (còn ' + bank + ' chip):');
        bx.innerHTML = [1, 2, 3].filter((b) => b <= Math.min(XD.maxBet, bank)).map((b) => '<button type="button" class="btn btn-soft" data-bet="' + b + '">🪙 Cược ' + b + ' <kbd>' + b + '</kbd></button>').join('');
        bx.querySelectorAll('[data-bet]').forEach((b) => { b.onclick = () => { bet = +b.dataset.bet; sfx('click'); deal(); }; });
      };
      const hit = () => {
        if (!live) return; P.push(draw()); sfx('click');
        const v = valOf(P);
        if (v > 21) endHand('lose', 'Quắc! ' + v + ' điểm.');
        else if (P.length === 5) endHand('win', 'Ngũ linh! 5 lá không quá 21.', 2);
        else render(false);
      };
      const stand = () => {
        if (!live) return;
        if (valOf(P) < 16) { render(false, 'Chưa đủ tuổi (dưới 16 điểm), phải rút thêm!'); sfx('bad'); return; }
        while (valOf(D) < dealerStand) D.push(draw());
        const pv = valOf(P), dv = valOf(D);
        if (dv > 21) endHand('win', 'Nhà cái quắc ' + dv + '! Bạn thắng.');
        else if (pv > dv) endHand('win', pv + ' hơn ' + dv + '. Bạn thắng!');
        else if (pv === dv) endHand('push', 'Bằng điểm ' + pv + '. Hòa.');
        else endHand('lose', dv + ' hơn ' + pv + '. Nhà cái ăn.');
      };
      box.querySelector('[data-x="hit"]').onclick = hit; box.querySelector('[data-x="stand"]').onclick = stand;
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (/^[1-3]$/.test(k) && !live) { const b = box.querySelector('[data-bet="' + k + '"]'); if (b) b.click(); } else if (k === 'h' || k === 'H' || k === 'ArrowUp') hit(); else if (k === 's' || k === 'S' || k === 'Enter' || k === ' ') stand(); else return false; return true; });
      newDeck(); askBet();
    });
  }

  // ------------------------------------------------------------------ 17. vượt ngục (đèn xanh – đèn đỏ)
  // Vượt ngục — nhìn từ trên xuống, lưới 16×10 ô. Lính canh tuần tra có tầm nhìn hình quạt (bị tường chắn). Thanh nghi ngờ đầy → bị bắt.
  // Độ khó: màn theo need (0..2), tầm nhìn +need×30, tốc độ đi: sức khỏe. Bò (giữ Space) chậm nhưng tầm nhìn bị thu 40% và gần như không ồn.
  // Tiếng ồn: đi bình thường ồn bán kính 90px; lính nghe thấy sẽ nghi ngờ dù không thấy. Đá (E) ném về hướng đang đi để dụ lính tới xem.
  const SN_CFG = { tile: 40, cone: 0.55, range: 150, walk: 105, crawl: 52, noiseWalk: 90, noiseCrawl: 18, guardSpeed: 55, lives: 2, dur: 60, stones: 2 };
  const SN_LEVELS = [
    { map: ['################', '#S.............#', '#..........#...#', '#..####....#...#', '#..........#...#', '#...#####......#', '#..............#', '#....#####.....#', '#.............X#', '################'], guards: [[[2, 2], [10, 2], [10, 6], [2, 6]]] },
    { map: ['################', '#S.....#.......#', '#......#...#...#', '#..##..#...#...#', '#..##......#...#', '#......###.....#', '#..#...........#', '#..#..####..#..#', '#.....#.....#.X#', '################'], guards: [[[2, 2], [6, 2], [6, 5], [2, 5]], [[10, 1], [14, 1], [14, 6], [10, 6]]] },
    { map: ['################', '#S..#.....#....#', '#...#.....#....#', '#...#..#..#..#.#', '#......#.....#.#', '#..###.#.###.#.#', '#......#.....#.#', '#.####.#####.#.#', '#.............X#', '################'], guards: [[[1, 4], [6, 4], [6, 8], [1, 8]], [[8, 1], [8, 4]], [[4, 8], [12, 8]]] }
  ];
  // thuần túy: BFS ô đi được từ S tới X (kiểm tra màn chơi giải được)
  function sneakSolvable(map) {
    let s, x; map.forEach((r, y) => r.split('').forEach((ch, i) => { if (ch === 'S') s = [i, y]; if (ch === 'X') x = [i, y]; }));
    const seen = new Set([s.join()]), q = [s];
    while (q.length) { const [a, b] = q.shift(); if (a === x[0] && b === x[1]) return true; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const n = [a + dx, b + dy]; if (map[n[1]] && map[n[1]][n[0]] && map[n[1]][n[0]] !== '#' && !seen.has(n.join())) { seen.add(n.join()); q.push(n); } }); }
    return false;
  }
  function sneak(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, T = SN_CFG.tile;
      const lvIdx = p.need < 0.4 ? 0 : p.need < 0.62 ? 1 : 2, LV = SN_LEVELS[lvIdx];
      const { box, c, hud } = canvasGame('🌙 Vượt ngục · Màn ' + (lvIdx + 1), '<div class="mini-pad"><button type="button" data-m="-1,0">◀</button><button type="button" data-m="0,-1">▲</button><button type="button" data-m="0,1">▼</button><button type="button" data-m="1,0">▶</button><button type="button" data-crawl>🦶 Bò <kbd>Space</kbd></button><button type="button" data-stone>🪨 Ném đá <kbd>E</kbd></button></div>',
        '<kbd>←↑↓→</kbd>/<kbd>WASD</kbd> di chuyển · giữ <kbd>Space</kbd> để bò (chậm, gần như không ồn, khó bị thấy) · <kbd>E</kbd> ném đá dụ lính. Tránh quạt tầm nhìn của lính, chạm ô <b style="color:#39cf98">EXIT</b> để thoát.');
      const walls = (x, y) => { const cx = Math.floor(x / T), cy = Math.floor(y / T); return !LV.map[cy] || LV.map[cy][cx] !== '.' && LV.map[cy][cx] !== 'S' && LV.map[cy][cx] !== 'X'; };
      let sx = 60, sy = 60, ex = 0, ey = 0; LV.map.forEach((r, y) => r.split('').forEach((ch, x) => { if (ch === 'S') { sx = x * T + T / 2; sy = y * T + T / 2; } if (ch === 'X') { ex = x * T + T / 2; ey = y * T + T / 2; } }));
      const guards = LV.guards.map((path) => ({ path: path.map(([a, b]) => [a * T + T / 2, b * T + T / 2]), i: 1, x: path[0][0] * T + T / 2, y: path[0][1] * T + T / 2, face: 0, wait: 0, look: null }));
      const range = SN_CFG.range + p.need * 30, spd = SN_CFG.walk * (0.85 + st.health / 100 * 0.3);
      let px = sx, py = sy, fx = 1, fy = 0, t = -1.2, susp = 0, lives = SN_CFG.lives, stones = SN_CFG.stones, done = false, crawl = false, flash = 0, msg = '', rocks = [], noise = 0;
      const dirs = { l: 0, r: 0, u: 0, d: 0 };
      const sight = (g, tx, ty) => { // đường nhìn không bị tường chắn
        const dx = tx - g.x, dy = ty - g.y, n = Math.ceil(Math.hypot(dx, dy) / 8);
        for (let k = 1; k < n; k++) if (walls(g.x + dx * k / n, g.y + dy * k / n)) return false; return true;
      };
      const stone = () => { if (stones <= 0 || done || t < 0) return; stones--; const tx = clamp(px + fx * 200, 50, 590), ty = clamp(py + fy * 200, 50, 350); rocks.push({ x: tx, y: ty, t: 0.6 }); sfx('click'); };
      box.querySelectorAll('[data-m]').forEach((b) => { const [dx, dy] = b.dataset.m.split(',').map(Number); const set = (v) => () => { if (dx < 0) dirs.l = v; if (dx > 0) dirs.r = v; if (dy < 0) dirs.u = v; if (dy > 0) dirs.d = v; }; b.onpointerdown = (e) => { e.preventDefault(); set(1)(); }; b.onpointerup = b.onpointerleave = set(0); });
      const cb = box.querySelector('[data-crawl]'); cb.onpointerdown = (e) => { e.preventDefault(); crawl = true; }; cb.onpointerup = cb.onpointerleave = () => { crawl = false; };
      box.querySelector('[data-stone]').onpointerdown = (e) => { e.preventDefault(); stone(); };
      onKeys((e) => {
        const k = e.key, dn = e.type === 'keydown';
        const m = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' }[k];
        if (m) { dirs[m] = dn ? 1 : 0; return true; }
        if (k === ' ') { crawl = dn; return true; }
        if ((k === 'e' || k === 'E') && dn && !e.repeat) { stone(); return true; }
        return false;
      });
      const end = (score, text) => { done = true; setTimeout(() => res({ score, text }), 900); };
      const respawn = () => { px = sx; py = sy; susp = 0; flash = 1; };
      loop((dt) => {
        t += dt; flash = Math.max(0, flash - dt); noise = Math.max(0, noise - dt * 200);
        if (t > 0 && !done) {
          // người chơi
          let mx = (dirs.r - dirs.l), my = (dirs.d - dirs.u); const mm = Math.hypot(mx, my);
          const sp = crawl ? SN_CFG.crawl : spd;
          if (mm) { mx /= mm; my /= mm; fx = mx; fy = my; const nx = px + mx * sp * dt, ny = py + my * sp * dt; if (!walls(nx + Math.sign(mx) * 9, py)) px = nx; if (!walls(px, ny + Math.sign(my) * 9)) py = ny; noise = crawl ? SN_CFG.noiseCrawl : SN_CFG.noiseWalk; }
          // lính canh
          let seen = 0;
          guards.forEach((g) => {
            rocks.forEach((r) => { if (r.t <= 0 && !r.used && Math.hypot(r.x - g.x, r.y - g.y) < 260 && !g.look) { g.look = { x: r.x, y: r.y, w: 2.2 }; } });
            let tx, ty;
            if (g.look) { tx = g.look.x; ty = g.look.y; if (Math.hypot(tx - g.x, ty - g.y) < 8) { g.look.w -= dt; if (g.look.w <= 0) g.look = null; tx = null; } }
            else { const w = g.path[g.i]; tx = w[0]; ty = w[1]; if (Math.hypot(tx - g.x, ty - g.y) < 6) { g.i = (g.i + 1) % g.path.length; g.wait = 0.5; tx = null; } }
            if (g.wait > 0) { g.wait -= dt; tx = null; }
            if (tx != null) { const a = Math.atan2(ty - g.y, tx - g.x); let da = a - g.face; da = Math.atan2(Math.sin(da), Math.cos(da)); g.face += da * Math.min(1, dt * 8); if (Math.abs(da) < 0.6) { g.x += Math.cos(g.face) * SN_CFG.guardSpeed * dt; g.y += Math.sin(g.face) * SN_CFG.guardSpeed * dt; } }
            const dx = px - g.x, dy = py - g.y, dist = Math.hypot(dx, dy), rng = range * (crawl ? 0.6 : 1);
            let ad = Math.atan2(dy, dx) - g.face; ad = Math.abs(Math.atan2(Math.sin(ad), Math.cos(ad)));
            if (dist < rng && ad < SN_CFG.cone && sight(g, px, py)) seen = Math.max(seen, 1.3 + (1 - dist / rng) * 1.5);
            else if (dist < noise && sight(g, px, py)) { seen = Math.max(seen, 0.5); g.face += (Math.atan2(dy, dx) - g.face) * Math.min(1, dt * 3); }
          });
          rocks.forEach((r) => { r.t -= dt; if (r.t <= 0) r.used = r.used || false; }); rocks = rocks.filter((r) => r.t > -0.1 || guards.some((g) => g.look));
          susp = seen ? Math.min(1, susp + seen * dt * 0.55) : Math.max(0, susp - dt * 0.45);
          if (susp >= 1) { lives--; msg = lives > 0 ? 'BỊ PHÁT HIỆN! Về điểm xuất phát' : 'BỊ BẮT!'; sfx('bad'); if (lives <= 0) end(clamp(0.1 + 0.25 * (1 - Math.hypot(ex - px, ey - py) / 600), 0, 0.35), 'Bạn bị lính canh tóm lại (màn ' + (lvIdx + 1) + ').'); else respawn(); }
          if (!done && Math.hypot(px - ex, py - ey) < 22) end(clamp(0.6 + 0.3 * (1 - t / SN_CFG.dur) + 0.1 * (lives / SN_CFG.lives), 0.6, 1), 'Bạn lách qua trại giam sau ' + t.toFixed(1) + ' giây (màn ' + (lvIdx + 1) + '). Tự do!');
          else if (!done && t >= SN_CFG.dur) end(0.2, 'Trời sáng mất rồi, bạn đành quay về buồng giam.');
        }
        c.fillStyle = '#0d1020'; c.fillRect(0, 0, 640, 400);
        LV.map.forEach((r, y) => r.split('').forEach((ch, x) => { if (ch === '#') { c.fillStyle = '#2b3150'; c.fillRect(x * T, y * T, T, T); c.fillStyle = '#3a4166'; c.fillRect(x * T, y * T, T, 5); } else { c.fillStyle = (x + y) % 2 ? '#161b2e' : '#1a2036'; c.fillRect(x * T, y * T, T, T); } }));
        c.fillStyle = 'rgba(57,207,152,.35)'; c.fillRect(ex - 18, ey - 18, 36, 36); c.fillStyle = '#39cf98'; c.font = '700 11px sans-serif'; c.textAlign = 'center'; c.fillText('EXIT', ex, ey + 4);
        // quạt tầm nhìn bị tường cắt
        guards.forEach((g) => {
          const rng = range * (crawl ? 0.6 : 1); c.fillStyle = susp > 0.5 ? 'rgba(255,92,92,.30)' : 'rgba(255,210,63,.20)'; c.beginPath(); c.moveTo(g.x, g.y);
          for (let k = -12; k <= 12; k++) { const a = g.face + k / 12 * SN_CFG.cone; let d = 6; while (d < rng && !walls(g.x + Math.cos(a) * d, g.y + Math.sin(a) * d)) d += 6; c.lineTo(g.x + Math.cos(a) * d, g.y + Math.sin(a) * d); }
          c.closePath(); c.fill();
          c.fillStyle = '#d63c3c'; c.beginPath(); c.arc(g.x, g.y, 11, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(g.x + Math.cos(g.face) * 6 - 2, g.y + Math.sin(g.face) * 6 - 2, 4, 4);
          if (g.look) { c.fillStyle = '#ffd23f'; c.font = '800 18px sans-serif'; c.fillText('?', g.x, g.y - 16); }
        });
        rocks.forEach((r) => { c.fillStyle = '#9aa3b8'; c.beginPath(); c.arc(r.x, r.y, 5, 0, 7); c.fill(); });
        if (noise > 20) { c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, noise, 0, 7); c.stroke(); }
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.top) || '#e66b2f'; c.beginPath(); c.arc(px, py, crawl ? 8 : 11, 0, 7); c.fill(); c.fillStyle = (p.ctx.appearance && p.ctx.appearance.skin) || '#e6b48f'; c.beginPath(); c.arc(px + fx * 5, py + fy * 5, 5, 0, 7); c.fill();
        // thanh nghi ngờ
        c.fillStyle = 'rgba(8,12,22,.8)'; c.fillRect(14, 8, 190, 24); c.fillStyle = '#232d40'; c.fillRect(20, 20, 178, 8); c.fillStyle = susp > 0.66 ? '#ef6a62' : susp > 0.33 ? '#ffb547' : '#45c486'; c.fillRect(20, 20, 178 * susp, 8);
        c.fillStyle = '#9fb0cc'; c.font = '700 10px sans-serif'; c.textAlign = 'left'; c.fillText('NGHI NGỜ' + (crawl ? ' · đang bò' : ''), 22, 17);
        if (flash > 0) { c.globalAlpha = Math.min(1, flash * 2); bigText(c, msg, 190, '#ff6b6b', 28); c.globalAlpha = 1; }
        countdown(c, t, 'ĐI!');
        hud.textContent = 'Màn ' + (lvIdx + 1) + '/3 · còn ' + Math.max(0, Math.ceil(SN_CFG.dur - Math.max(0, t))) + 's · ' + '❤️'.repeat(Math.max(0, lives)) + ' · 🪨' + stones;
      });
    });
  }

  // ------------------------------------------------------------------ 18. ném rổ (bóng rổ thật: giữ để lấy lực, thả để ném, có hậu vệ nhảy chắn)
  function hoops(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health, sm = p.ctx.stats.smarts;
      const { box, cv, c, hud } = canvasGame('🏀 Ném rổ', '<div class="mini-pad"><button type="button" data-shoot>🏀 GIỮ ĐỂ LẤY LỰC · THẢ ĐỂ NÉM <kbd>Space</kbd></button></div>',
        'Giữ <kbd>Space</kbd> (hoặc giữ nút / chạm giữ màn hình), thanh lực dâng lên rồi hạ xuống — <b>thả tay</b> khi vạch nằm trong <b style="color:#39cf98">vùng xanh</b>. Có hậu vệ thì phải ném trước khi hắn nhảy tới chắn bóng!');
      const HX = 548, HY = 150; // vành rổ
      // 6 lượt ném: lên rổ, trung bình, ba điểm, ném phạt, ba điểm có hậu vệ, cú ném quyết định
      const SHOTS = [{ x: 420, pts: 2, label: 'Lên rổ' }, { x: 330, pts: 2, label: 'Ném tầm trung' }, { x: 200, pts: 3, label: 'Ném ba điểm' }, { x: 380, pts: 1, label: 'Ném phạt' }, { x: 205, pts: 3, label: 'Ba điểm có hậu vệ', def: true }, { x: 185, pts: 3, label: 'Cú ném quyết định!', def: true, clutch: true }];
      // CONFIG: độ khó = vùng xanh (sức khỏe/trí tuệ rộng, need hẹp) × “tay nóng” (trúng 2 quả liên tiếp → vùng +20%)
      const HOOP_CFG = { hot: 1.2, clutchSec: 5, fakeAt: 0.7, realAt: 1.45 };
      const zoneBase = 0.09 + hp / 100 * 0.07 + sm / 100 * 0.02 - p.need * 0.03; let streak = 0, clutchT = 0;
      const zoneNow = () => zoneBase * (streak >= 2 ? HOOP_CFG.hot : 1);
      const speed = 1.15 - hp / 100 * 0.35 + p.need * 0.4; // tốc độ thanh lực
      let i = 0, pts = 0, made = 0, holding = false, pw = 0, dir = 1, phase = 'ready', t = 0, ball = null, msg = '', msgT = 0, defX = 0, defJump = 0, defT = 0, done = false;
      const target = (s) => 0.35 + (HX - s.x) / 420 * 0.5; // lực chuẩn tăng theo khoảng cách
      const startShot = () => { clutchT = HOOP_CFG.clutchSec; phase = 'ready'; pw = 0; dir = 1; ball = null; const s = SHOTS[i]; defX = s.x + 70; defJump = 0; defT = s.def ? 0 : -1; };
      startShot();
      const press = (down) => {
        if (done || phase === 'fly' || phase === 'res') return;
        if (down && phase === 'ready') { holding = true; phase = 'charge'; return; }
        if (!down && phase === 'charge') {
          holding = false;
          const s = SHOTS[i], tg = target(s), err = pw - tg, zoneW = zoneNow();
          const blocked = s.def && defJump > 0.55;
          const inZone = Math.abs(err) < zoneW / 2;
          const rim = !inZone && Math.abs(err) < zoneW;
          const ok = !blocked && (inZone || (rim && rnd() < 0.45));
          ball = { x0: s.x + 14, y0: 255, t: 0, ok, blocked, err, dur: 0.9, ms: Math.round(err / speed * 1000) };
          phase = 'fly'; sfx('click');
        }
      };
      const b = box.querySelector('[data-shoot]');
      b.onpointerdown = (e) => { e.preventDefault(); press(true); }; b.onpointerup = b.onpointerleave = () => press(false);
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); press(true); }); cv.addEventListener('pointerup', () => press(false));
      onKeys((e) => { if (e.key !== ' ' && e.key !== 'Enter') return false; if (e.repeat) return true; press(e.type === 'keydown'); return true; });
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        const s = SHOTS[Math.min(i, SHOTS.length - 1)];
        if (phase === 'charge') { pw += dir * dt * speed; if (pw >= 1) { pw = 1; dir = -1; } if (pw <= 0) { pw = 0; dir = 1; } }
        // hậu vệ: lao tới rồi bật nhảy chắn bóng
        if (s.def && phase === 'charge' && defT >= 0) {
          defT += dt; defX = Math.max(s.x + 26, defX - dt * 40);
          const real = (s.clutch ? HOOP_CFG.realAt : 1.1) - p.need * 0.3;
          defJump = Math.max(0, Math.min(1, (defT - real) / 0.4));
          if (s.clutch && defT > HOOP_CFG.fakeAt && defT < HOOP_CFG.fakeAt + 0.5) defJump = Math.max(defJump, 0.45 * Math.sin((defT - HOOP_CFG.fakeAt) / 0.5 * Math.PI)); // giả vờ nhảy (chưa đủ cao để chắn)
        }
        if (s.clutch && (phase === 'ready' || phase === 'charge') && !done) { clutchT -= dt; if (clutchT <= 0) { if (phase === 'ready') press(true); press(false); } }
        if (phase === 'fly' && ball) {
          ball.t += dt / ball.dur;
          if (ball.t >= 1) {
            phase = 'res';
            if (ball.ok) { pts += s.pts; made++; streak++; msg = (s.pts === 3 ? 'BA ĐIỂM!!' : pick(['VÀO!', 'Chuẩn!', 'Swish!'])) + (streak >= 2 ? ' 🔥' : ''); sfx(s.clutch ? 'cheer' : 'good'); }
            else { streak = 0; msg = ball.blocked ? 'BỊ CHẮN!' : ball.err > 0 ? 'Thả muộn ' + Math.abs(ball.ms) + 'ms — dội bảng!' : 'Thả sớm ' + Math.abs(ball.ms) + 'ms — chạm vành!'; sfx('bad'); }
            msgT = 1.2;
            setTimeout(() => { i++; if (i >= SHOTS.length) { done = true; const max = SHOTS.reduce((a, x) => a + x.pts, 0); res({ score: clamp(pts / max, 0, 1), text: 'Bạn ném vào ' + made + '/' + SHOTS.length + ' quả, ghi ' + pts + '/' + max + ' điểm.' }); } else startShot(); }, 1300);
          }
        }
        // sân
        c.fillStyle = '#1b2240'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#2a3566'; for (let k = 0; k < 6; k++) c.fillRect(0, 40 + k * 30, 640, 2);
        c.fillStyle = '#c98a4b'; c.fillRect(0, 290, 640, 110);
        // vạch sân: ba điểm & ném phạt
        c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(226, 290, 4, 110); c.fillRect(392, 290, 4, 110);
        c.fillStyle = 'rgba(214,60,60,.25)'; c.fillRect(396, 290, 244, 110);
        c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '700 11px sans-serif'; c.textAlign = 'center'; c.fillText('VẠCH 3 ĐIỂM', 228, 392); c.fillText('NÉM PHẠT', 394, 392);
        // trụ, bảng, vành, lưới
        c.fillStyle = '#555'; c.fillRect(610, 90, 10, 200);
        c.fillStyle = '#f5f5f5'; c.fillRect(585, 85, 8, 90); c.strokeStyle = '#d63c3c'; c.lineWidth = 2; c.strokeRect(586, 120, 6, 30);
        c.strokeStyle = '#ff6a00'; c.lineWidth = 4; c.beginPath(); c.moveTo(HX - 22, HY); c.lineTo(HX + 34, HY); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(HX - 20 + k * 13, HY); c.lineTo(HX - 12 + k * 9, HY + 28); c.stroke(); }
        // cầu thủ (bạn)
        const jumpY = phase === 'fly' && ball && ball.t < 0.3 ? -Math.sin(ball.t / 0.3 * Math.PI) * 26 : 0;
        runner(c, s.x, 266 + jumpY, (p.ctx.appearance && p.ctx.appearance.top) || '#2d6cdf', 'BẠN', 0, p.ctx.appearance && p.ctx.appearance.skin);
        // hậu vệ
        if (s.def) { const jy = -defJump * 60; runner(c, defX, 266 + jy, '#d63c3c', 'Hậu vệ', t * 3); c.strokeStyle = '#c98d64'; c.lineWidth = 5; c.beginPath(); c.moveTo(defX, 236 + jy); c.lineTo(defX - 14, 200 + jy); c.stroke(); }
        // bóng
        let bx = s.x + 14, by = 240;
        if (ball) {
          const k = Math.min(1, ball.t), ex = ball.ok ? HX + 6 : ball.blocked ? s.x + 60 : HX + 6 + clamp(ball.err, -0.3, 0.3) * 160, ey = ball.ok ? HY + 18 : ball.blocked ? 320 : HY - 4;
          const apex = ball.blocked ? 40 : 150 + (HX - s.x) * 0.25;
          bx = ball.x0 + (ex - ball.x0) * k; by = ball.y0 + (ey - ball.y0) * k - Math.sin(k * Math.PI) * apex;
        } else if (phase !== 'res') { by = 250 + Math.abs(Math.sin(t * 6)) * (phase === 'ready' ? 30 : 0); }
        c.fillStyle = '#ff8a1e'; c.beginPath(); c.arc(bx, by, 11, 0, 7); c.fill(); c.strokeStyle = '#3b1d00'; c.lineWidth = 1.5; c.beginPath(); c.arc(bx, by, 11, 0, 7); c.moveTo(bx - 11, by); c.lineTo(bx + 11, by); c.moveTo(bx, by - 11); c.lineTo(bx, by + 11); c.stroke();
        // thanh lực
        if (phase === 'charge' || phase === 'ready') {
          const tg = target(s), X = 24, Y = 70, H = 200, zoneW = zoneNow();
          c.fillStyle = '#111'; c.fillRect(X, Y, 22, H);
          c.fillStyle = '#39cf98'; c.fillRect(X, Y + (1 - tg - zoneW / 2) * H, 22, zoneW * H);
          c.fillStyle = 'rgba(255,179,71,.45)'; c.fillRect(X, Y + (1 - tg - zoneW) * H, 22, zoneW * 0.5 * H); c.fillRect(X, Y + (1 - tg + zoneW / 2) * H, 22, zoneW * 0.5 * H);
          c.fillStyle = '#fff'; c.fillRect(X - 4, Y + (1 - pw) * H - 3, 30, 6);
          c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'left'; c.fillText('LỰC', X - 2, Y - 8);
        }
        c.fillStyle = '#fff'; c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText(s.label + ' (' + s.pts + ' điểm)', 330, 34);
        if (phase === 'ready') { c.font = '700 14px sans-serif'; c.fillStyle = '#ffd23f'; c.fillText('Giữ Space để lấy lực…', 330, 58); }
        if (s.clutch && (phase === 'ready' || phase === 'charge')) { c.font = '800 26px "Baloo 2", sans-serif'; c.fillStyle = clutchT < 2 ? '#ff6b6b' : '#fff'; c.textAlign = 'right'; c.fillText('⏱ ' + Math.max(0, clutchT).toFixed(1) + 's', 620, 34); c.textAlign = 'center'; }
        if (streak >= 2 && phase !== 'res') { c.font = '800 14px sans-serif'; c.fillStyle = '#ff9f43'; c.textAlign = 'left'; c.fillText('🔥 TAY NÓNG: vùng xanh +20%', 24, 292); c.textAlign = 'center'; }
        if (msgT > 0) bigText(c, msg, 120, /VÀO|BA|Chuẩn|Swish/.test(msg) ? '#ffd23f' : '#ff6b6b', 40);
        hud.textContent = 'Lượt ' + Math.min(i + 1, SHOTS.length) + '/' + SHOTS.length + ' · ' + pts + ' điểm';
      });
    });
  }

  // 19. đá bóng kiểu Hax (js/hax.js): đấu với máy 60 giây
  // sân và số người theo hoàn cảnh: đá phủi ngoài ngõ → sân hẻm, đi biển → bãi biển, trẻ con → futsal, trận lớn → sân lớn 3v3, cầu thủ chuyên nghiệp → 2v2
  function haxSetup(p) {
    const t = fold((p.title || '') + ' ' + (p.label || '')), ctx = p.ctx || {}, age = ctx.age || 20, pro = ctx.jobId === 'cauthu';
    let map = 'classic', size = 1;
    if (/(bien|bai cat)/.test(t)) map = 'beach';
    else if (/(bang tuyet|san bang)/.test(t)) map = 'ice';
    else if (age < 11 || /(futsal|trong nha|nha thi dau)/.test(t)) map = 'futsal';
    else if (!pro || /(phui|hem|ngo|xom|via he|duong lang)/.test(t)) map = 'street';
    const big = /(chung ket|ban ket|derby|world cup|aff|sea games|doi tuyen|tuyen quoc gia|sieu kinh dien|champions|qua bong vang)/.test(t);
    if (p.mode === 'duel') { map = 'classic'; size = 1; }
    else if (big) { size = 4; if (map === 'classic') map = 'big'; }
    else if (pro) size = 4; // trận chuyên nghiệp: 4 đấu 4 (giống Phòng HLV)
    else size = age < 11 ? 2 : 3;
    return { map, size };
  }
  // kỹ năng sút theo chỉ số: thể lực ≥ 55 thì sút tích lực, trí tuệ ≥ 55 (hoặc cầu thủ chuyên nghiệp) thì sút xoáy; thách đấu thì ai cũng có
  const haxSkills = (p) => { const st = (p.ctx && p.ctx.stats) || {}; return p.mode === 'duel' ? { charge: true, curve: true } : { charge: (st.health || 0) >= 55, curve: (st.smarts || 0) >= 55 || (p.ctx && p.ctx.jobId === 'cauthu') }; };
  function hax(p) { close(); const s = haxSetup(p); return KN.Hax.playCareer({ title: p.title, need: p.need, dur: 60, foe: 'Đối thủ', map: s.map, size: s.size, skills: haxSkills(p) }); }
  // 'shoot' (trò canh thời điểm cũ) đã bỏ — giữ tên làm bí danh của Ném rổ cho các thách đấu cũ
  // ------------------------------------------------------------------ 12. nhắn tin dụ nạn nhân (trong khu lừa đảo bị ép làm) — gõ tự do hoặc bấm câu gợi ý
  // Bạn là người bị ép: có thể làm theo để đủ chỉ tiêu, hoặc lén cảnh báo nạn nhân (quản lý giám sát, bị phát hiện là bị đánh).
  // mỗi nạn nhân đi theo một kịch bản (tổ chức hư cấu): 3 bước làm quen → giới thiệu lợi ích → xin thẻ nhận tiền. Mỗi bước có 4 câu gợi ý đúng ngữ cảnh (điểm 2 / 1 / 0 / 0)
  const SC_SCEN = [
    { n: 'Bác Hùng', age: 62, face: '👴', job: 'vừa nghỉ hưu, vợ mất sớm', org: 'Quỹ hỗ trợ người cao tuổi An Phát', open: 'Alo? Ai đấy nhỉ? Sao lại biết số điện thoại của bác?',
      tip: 'Không có quỹ nào gọi điện “tặng tiền” rồi xin số thẻ ngân hàng. Tiền hỗ trợ thật không bao giờ cần bạn đưa số thẻ cho người lạ.',
      kw: [['chao', 'quy', 'an phat', 'nguoi cao tuoi', 'ho tro', 'hoi tham', 'suc khoe'], ['5 trieu', 'nam trieu', 'tien ho tro', 'tang', 'quyen loi', 'mien phi', 'danh sach', 'duoc chon'], ['so the', 'the ngan hang', 'tai khoan', 'chuyen khoan', 'nhan tien', 'doc so', 'cung cap']],
      st: [
        { hint: 'Tự giới thiệu, hỏi thăm bác', chips: [['Chào bác ạ, cháu gọi từ Quỹ hỗ trợ người cao tuổi An Phát, hỏi thăm sức khoẻ bác.', 2], ['Cháu chào bác, cháu có chuyện muốn nhờ bác ạ.', 1], ['Bác ơi cho cháu hỏi bác có bao nhiêu tiền?', 0], ['Alo? Nghe máy đi chứ!', 0]], good: '“Quỹ gì cơ? À, quỹ cho người già hả cháu? Bác có nghe nói. Cháu cứ nói.”', ok: '“Nhờ việc gì? Bác nghe đây.”', bad: '“Cái gì mà hỏi tiền? Bác cúp máy đây!”' },
        { hint: 'Nói về khoản hỗ trợ dành cho bác', chips: [['Quỹ đang có suất hỗ trợ 5 triệu cho người cao tuổi, bác nằm trong danh sách được chọn đợt này.', 2], ['Bên cháu có chương trình tặng quà, bác quan tâm không ạ?', 1], ['Bác phải làm theo cháu, không là mất suất đấy.', 0], ['Có tiền miễn phí đây, bác nhận không, nhanh lên!', 0]], good: '“Thật hả cháu? Bác có được chọn á? Thế thì quý quá, bác già rồi cũng cần.”', ok: '“Quà gì mà quà? Cháu nói rõ ra xem.”', bad: '“Sao lại hối thúc bác thế? Nghe không ổn chút nào.”' },
        { hint: 'Nói cần thông tin để chuyển tiền cho bác', chips: [['Để chuyển 5 triệu cho bác, bác cho cháu số thẻ ngân hàng để quỹ chuyển khoản ạ.', 2], ['Bác cho cháu xin thông tin tài khoản để quỹ làm hồ sơ nhé.', 1], ['Bác đọc luôn mật khẩu thẻ cho cháu đi!', 0], ['Bác chuyển trước cho cháu một ít phí nhé.', 0]], good: '“Ừ, để bác lấy cái thẻ ra. Cháu ghi cho cẩn thận nhé.”', ok: '“Thông tin tài khoản là sao? Bác không rành, cháu nói dễ hiểu thôi.”', bad: '“Mật khẩu thì không đời nào! Bác báo công an đấy!”' },
      ] },
    { n: 'Mai', age: 24, face: '👩', job: 'sinh viên mới ra trường, đang tìm việc', org: 'công ty Việc Nhanh', open: 'Dạ em chào anh/chị, mình nhắn em có việc gì vậy ạ?',
      tip: 'Công việc online “nhẹ lương cao, làm theo nhiệm vụ rồi nhận hoa hồng” là dấu hiệu lừa đảo kinh điển. Công ty thật không bắt bạn đưa số thẻ cho người lạ.',
      kw: [['chao', 'viec nhanh', 'viec lam', 'tuyen', 'cong ty', 'online', 'cv'], ['luong', 'hoa hong', 'nhiem vu', 'lam them', 'thu nhap', 'linh hoat', 'tai nha'], ['so the', 'the ngan hang', 'tai khoan', 'nhan luong', 'chuyen khoan', 'cung cap', 'doc so']],
      st: [
        { hint: 'Giới thiệu công ty và lý do nhắn', chips: [['Chào em, anh/chị bên công ty Việc Nhanh, thấy hồ sơ em đang tìm việc nên nhắn hỏi thăm.', 2], ['Chào em, bên mình đang cần tuyển người ạ.', 1], ['Em ơi đi làm không, lương cao lắm!', 0], ['Nhắn nhanh lên, đừng hỏi nhiều.', 0]], good: '“Dạ em đang tìm việc thật ạ! Công ty mình làm về gì vậy anh/chị?”', ok: '“Dạ tuyển vị trí gì ạ? Em chưa hiểu lắm.”', bad: '“Sao nói chuyện kỳ vậy ạ? Em thấy không ổn.”' },
        { hint: 'Giới thiệu công việc và thu nhập', chips: [['Công việc làm online tại nhà, giờ giấc linh hoạt, thu nhập khoảng 12 triệu một tháng, có hoa hồng theo nhiệm vụ.', 2], ['Việc nhẹ nhàng, em làm thử một tuần xem sao nhé.', 1], ['Làm xong là có tiền ngay, không cần kinh nghiệm gì hết!', 0], ['Không làm là tiếc, mai hết suất đấy.', 0]], good: '“Nghe hấp dẫn quá ạ! Em đang thiếu tiền thuê trọ. Em cần làm gì ạ?”', ok: '“Nhẹ nhàng thế sao ạ? Em hơi lo.”', bad: '“Hối thúc quá, em thấy giống lừa đảo…”' },
        { hint: 'Nói cần thẻ để nhận lương', chips: [['Để công ty chuyển tiền lương cho em, em cho anh/chị số thẻ ngân hàng để kế toán làm hồ sơ nhé.', 2], ['Em gửi thông tin tài khoản để bên mình ghi nhận lương nhé.', 1], ['Em chuyển anh/chị trước một khoản phí giữ chỗ nhé.', 0], ['Em đọc luôn mã OTP cho anh/chị đi.', 0]], good: '“Dạ vâng, em lấy thẻ ra liền ạ. Anh/chị ghi lại giúp em.”', ok: '“Tài khoản em thì em hơi ngại, anh/chị nói rõ hơn được không?”', bad: '“OTP á?! Không bao giờ! Em chặn số này!”' },
      ] },
    { n: 'Anh Tuấn', age: 35, face: '🧔', job: 'nhân viên văn phòng, muốn làm giàu nhanh', org: 'sàn Coin Vàng', open: 'Ừ, ai thế? Đang họp, nói nhanh giúp mình nhé.',
      tip: 'Lãi suất cao bất thường, “chuyên gia hướng dẫn”, hối thúc nạp tiền gấp đều là dấu hiệu lừa đảo đầu tư. Đừng đưa thông tin thẻ cho người lạ.',
      kw: [['chao', 'coin vang', 'dau tu', 'chuyen gia', 'tai chinh', 'lam giau', 'kiem tien'], ['loi nhuan', 'lai suat', 'cam ket', 'an toan', 'lai cao', 'hang ngay', 'khach hang cu', 'von'], ['so the', 'the ngan hang', 'lien ket', 'tai khoan', 'nap tien', 'chuyen khoan', 'doc so']],
      st: [
        { hint: 'Giới thiệu nhanh, vào việc ngắn gọn', chips: [['Chào anh, em tư vấn bên sàn Coin Vàng, em gọi nhanh một phút giới thiệu cơ hội đầu tư.', 2], ['Chào anh, em có việc muốn chia sẻ với anh ạ.', 1], ['Anh ơi anh muốn giàu không, nghe em đi!', 0], ['Alo anh nghe máy rồi thì đừng cúp nhé.', 0]], good: '“Đầu tư hả? Cũng đang tìm hiểu. Một phút thôi nhé, cậu nói đi.”', ok: '“Chia sẻ gì? Nói ngắn gọn thôi.”', bad: '“Giọng điệu gì vậy? Tôi cúp máy.”' },
        { hint: 'Nói về lợi nhuận và độ an toàn', chips: [['Sàn em có chuyên gia hướng dẫn, nhiều khách cũ lãi đều mỗi ngày, anh bỏ vốn nhỏ để làm quen trước.', 2], ['Bên em lãi cao, anh thử một ít xem sao ạ.', 1], ['Cam kết lãi 100% trong một tuần, không lỗ đồng nào!', 0], ['Anh phải vào ngay hôm nay, mai mất cơ hội đấy.', 0]], good: '“Khách cũ lãi đều hả? Nghe cũng được. Vốn nhỏ thì tôi thử xem.”', ok: '“Lãi cao thì rủi ro cao chứ. Cậu nói rõ hơn đi.”', bad: '“Cam kết lãi 100% á? Lừa đảo rồi! Tôi chặn số đây.”' },
        { hint: 'Nói cần thẻ để liên kết tài khoản', chips: [['Để nạp vốn và rút lãi, anh cho em số thẻ ngân hàng để em liên kết vào tài khoản sàn nhé.', 2], ['Anh gửi thông tin tài khoản em hướng dẫn nạp tiền nhé.', 1], ['Anh đưa em mật khẩu, em đầu tư giúp anh luôn.', 0], ['Anh chuyển thẳng cho em, em đầu tư hộ.', 0]], good: '“Ừ, liên kết thẻ thì được. Để tôi lấy thẻ, cậu ghi lại nhé.”', ok: '“Thông tin tài khoản thì tôi phải xem kỹ đã. Cậu nói cụ thể.”', bad: '“Đưa mật khẩu cho cậu á? Điên à! Tôi báo công an!”' },
      ] },
    { n: 'Cô Lan', age: 48, face: '👩‍🦳', job: 'bán hàng chợ, một mình nuôi con', org: 'Siêu Mall', open: 'Ai đó? Cô đang bận bán hàng, có gì thì nói nhanh nhé.',
      tip: 'Chưa tham gia mà “trúng thưởng” là lừa. Chương trình thật không bắt bạn cung cấp số thẻ hay trả phí trước để nhận quà.',
      kw: [['chao', 'sieu mall', 'chuong trinh', 'khach hang', 'cam on', 'khuyen mai', 'tri an'], ['trung thuong', 'giai thuong', 'xe may', 'phan thuong', 'may man', 'tang', 'bao mat'], ['so the', 'the ngan hang', 'tai khoan', 'nhan thuong', 'chuyen khoan', 'cung cap', 'doc so']],
      st: [
        { hint: 'Chào hỏi theo kiểu chăm sóc khách hàng', chips: [['Em chào cô ạ, em gọi từ Siêu Mall để cảm ơn cô là khách hàng thân thiết ạ.', 2], ['Em chào cô, bên em có tin vui muốn báo cô ạ.', 1], ['Cô ơi cô có tiền không cô?', 0], ['Nghe máy rồi thì nghe em nói đây.', 0]], good: '“Ừ, cô có hay mua ở Siêu Mall thật. Có chuyện gì thế em?”', ok: '“Tin vui gì? Nói nhanh nhé, cô đang bán.”', bad: '“Nói chuyện kiểu gì vậy? Cô không rảnh!”' },
        { hint: 'Báo chương trình trúng thưởng', chips: [['Cô được chọn ngẫu nhiên trong chương trình tri ân, trúng giải một chiếc xe máy, em báo để cô nhận ạ.', 2], ['Cô có may mắn được tặng một phần quà ạ.', 1], ['Cô trúng thưởng, nhưng phải nộp thuế trước nhé.', 0], ['Cô phải nhận ngay, không là em tặng người khác đấy.', 0]], good: '“Trời, cô trúng xe máy á? May quá! Con cô đang cần xe đi học.”', ok: '“Quà gì? Cô chưa hiểu, em nói kỹ xem.”', bad: '“Nộp thuế trước là lừa rồi! Cô biết thừa!”' },
        { hint: 'Nói cần thẻ để chuyển tiền thưởng', chips: [['Để chuyển tiền thưởng và hoàn tất thủ tục, cô cho em số thẻ ngân hàng của cô ạ.', 2], ['Cô gửi em thông tin tài khoản để em làm hồ sơ nhận thưởng nhé.', 1], ['Cô chuyển trước cho em phí vận chuyển xe nhé.', 0], ['Cô đọc mã xác nhận gửi về điện thoại cho em đi.', 0]], good: '“Ừ để cô lấy thẻ. Em ghi cho đúng nhé, cô cảm ơn em.”', ok: '“Thông tin tài khoản hả? Cô hơi lo, em giải thích thêm đi.”', bad: '“Mã xác nhận á? Không! Cô gọi công an đây!”' },
      ] },
  ];
  const SC_WARN = ['lua dao', 'lua dao', 'dung chuyen', 'khong chuyen', 'dung gui', 'canh bao', 'bi ep', 'bi bat', 'nan nhan', 'cong an', 'bao cong an', '113', 'chan so', 'chan toi', 'dung tin', 'khong that', 'tron di', 'bi giam', 'bi lua', 'campuchia', 'cuu toi', 'giup toi', 'dung nghe'];
  const SC_ASK = ['chuyen khoan', 'chuyen tien', 'nap tien', 'gui tien', 'dau tu', 'von', 'lai suat', 'loi nhuan', 'dang ky', 'so tai khoan', 'stk', 'dat coc', 'phi', 'vi dien tu', 'tien ao', 'coin', 'chot', 'giao dich', 'gap lam', 'ngay hom nay', 'kiem tien', 'thanh toan'];
  const SC_RAP = ['chao', 'lam quen', 'ban', 'dep', 'de thuong', 'quan tam', 'an com', 'khoe khong', 'suc khoe', 'cong viec', 'co don', 'chia se', 'tam su', 'nho', 'thuong', 'cam on', 'xin loi', 'hom nay', 'vui', 'buon', 'hieu', 'dong cam', 'tin minh', 'gia dinh'];
  const SC_TIPS = ['Không có công việc nhẹ lương cao nào tự tìm đến bạn: hãy kiểm tra công ty, địa chỉ và hợp đồng thật.', 'Đừng chuyển tiền cho người chưa từng gặp mặt, dù họ nói ngọt hay hối thúc đến đâu.', 'Bị hối thúc “làm ngay hôm nay” là dấu hiệu đáng ngờ. Hãy dừng lại và hỏi người thân.', 'Nghi ngờ bị lừa, hãy báo công an địa phương hoặc gọi 113, đừng ngại mất mặt.'];
  const hasAny = (t, list) => list.some((w) => t.includes(w));
  const scKind = (raw) => {
    const t = ' ' + fold(raw).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ') + ' ';
    if (t.trim().length < 3) return 'noise';
    if (hasAny(t, SC_WARN)) return 'warn';
    if (hasAny(t, SC_ASK)) return 'ask';
    if (hasAny(t, SC_RAP)) return 'rap';
    return 'other';
  };
  const cardGroups = (c) => c.replace(/(\d{4})(?=\d)/g, '$1 ');
  function scamchat(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, kd = (G().campKpi && G().campKpi()) || { target: 3 }, KPI = kd.target, MAXT = 12, DUR = 80 + 45 * KPI;
      let V = null, si = 0, prog = 0, strikes = 0, turns = 0, phase = 'chat', card = '', earned = 0, formLeft = 0, blocked = false, victimN = 0, used = [];
      let boss = 6, t = 0, done = false, caught = false, scammedN = 0, warnedN = 0, calls = 0, power = 1, helpers = 0, talk = 0, wait = 0;
      const box = open('<div class="sc-desk">' +
        '<section class="sc-win sc-clk"><header><span>🖱️ Chỉ tiêu cuộc gọi</span></header><div class="sc-wb"><button type="button" class="sc-big" id="scBig" aria-label="Gọi thêm">📞</button><div class="sc-cnt"><b id="scCalls">0</b> cuộc gọi · <span id="scRate">+1/lần bấm</span></div>' +
        '<p class="sc-hint">Bấm liên tục để quản lý thấy bạn đang làm việc. Đổi cuộc gọi lấy “trợ thủ” cho chạy tự động.</p>' +
        '<button type="button" class="sc-up" id="scU1"><b>👤 Đàn em gọi hộ</b><small id="scU1c"></small></button><button type="button" class="sc-up" id="scU2"><b>🎧 Tai nghe xịn</b><small id="scU2c"></small></button></div></section>' +
        '<section class="sc-win sc-phone"><header><span>📞 Điện thoại</span><em id="scH"></em></header><div class="sc-wb"><div class="sc-kpi"><span>KPI NĂM NAY</span><b id="scK2"></b></div><div class="sc-trust"><span>NIỀM TIN NGƯỜI NHẬN</span><b id="scTL">NGHI NGỜ</b></div><div class="mini-bar"><i id="scT" style="width:0"></i></div>' +
        '<div class="sc-who"><div class="sc-face" id="scFace">🙂</div><div><b id="scN"></b><small id="scM"></small><div class="sc-wave" id="scW"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>' +
        '<div class="sc-chat" id="scC"></div><div class="sc-step" id="scStep"></div><div class="sc-chips" id="scK"></div>' +
        '<form class="sc-in" id="scF"><input id="scI" maxlength="140" autocomplete="off" placeholder="Hoặc tự gõ câu của bạn rồi Enter…"><button type="submit" class="btn btn-primary btn-sm" id="scS">Gửi</button></form>' +
        '<div class="sc-calls"><button type="button" class="sc-warnbtn" id="scWarn">🤫 Lén cảnh báo nạn nhân</button><button type="button" class="sc-hang" id="scHang">☎️ Cúp máy</button></div></div></section>' +
        '<section class="sc-win sc-form"><header><span>🧾 Hồ sơ khách hàng</span></header><div class="sc-wb"><p class="sc-ok" id="scFS">Đang chờ nạn nhân đọc thông tin thẻ…</p><label for="scAmt">Số thẻ ngân hàng nạn nhân đọc (16 số, chỉ là số ví dụ trong game)</label><input id="scAmt" inputmode="numeric" maxlength="19" autocomplete="off" disabled placeholder="0000 0000 0000 0000"><button type="button" class="btn btn-soft btn-sm" id="scVer" disabled>Xác nhận</button></div></section>' +
        '<section class="sc-win sc-cam"><header><span>📹 Camera</span></header><div class="sc-wb"><div class="sc-boss-face" id="scBF">😐</div><div class="sc-bossbar"><span>👁️ Quản lý chú ý</span><div class="mini-bar sc-boss"><i id="scB" style="width:0"></i></div></div></div></section>' +
        '</div><div class="sc-pop" id="scPop"></div>');
      box.querySelector('.mini-box').classList.add('wide');
      const $ = (q) => box.querySelector(q), chat = $('#scC'), inp = $('#scI');
      const bub = (who, text) => { const d = document.createElement('div'); d.className = 'sc-b ' + who; d.textContent = text; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; };
      const pop = (text) => { const el = document.createElement('div'); el.className = 'sc-money'; el.textContent = text; $('#scPop').appendChild(el); setTimeout(() => el.remove(), 1800); };
      const upCost = (n) => (n === 1 ? 15 + helpers * 20 : 25 + (power - 1) * 30);
      const trust = () => clamp(((si * 2 + prog) / 6) * 100, 0, 100);
      const meters = () => {
        const tr = trust();
        $('#scT').style.width = tr + '%'; $('#scB').style.width = clamp(boss, 0, 100) + '%';
        $('#scTL').textContent = tr < 30 ? 'NGHI NGỜ' : tr < 65 ? 'DO DỰ' : 'TIN TƯỞNG'; $('#scTL').className = tr < 30 ? 'bad' : tr < 65 ? 'mid' : 'good';
        $('#scH').textContent = 'Người ' + victimN + ' · còn ' + Math.max(0, Math.ceil(DUR - t)) + 's';
        $('#scK2').textContent = scammedN + '/' + KPI + ' người' + (warnedN ? ' · cứu ' + warnedN : ''); $('#scK2').className = scammedN >= KPI ? 'ok' : '';
        $('#scBF').textContent = boss < 30 ? '😐' : boss < 60 ? '🤨' : boss < 85 ? '😠' : '🤬'; $('#scBF').parentNode.parentNode.classList.toggle('alert', boss >= 70);
        $('#scCalls').textContent = Math.floor(calls); $('#scRate').textContent = '+' + power + '/lần bấm' + (helpers ? ' · +' + helpers + '/giây' : '');
        $('#scU1c').textContent = upCost(1) + ' cuộc gọi · đã có ' + helpers; $('#scU2c').textContent = upCost(2) + ' cuộc gọi · lực bấm ' + power;
        $('#scU1').disabled = calls < upCost(1); $('#scU2').disabled = calls < upCost(2);
        $('#scFace').classList.toggle('talk', talk > 0); $('#scW').classList.toggle('talk', talk > 0);
      };
      const drawChips = () => {
        const S0 = V.st[si]; if (!S0) { $('#scK').innerHTML = ''; $('#scStep').textContent = ''; return; }
        $('#scStep').textContent = '💡 Bước ' + (si + 1) + '/3 · ' + S0.hint;
        const list = shuffle(S0.chips.map((c, i) => [c[0], i]));
        $('#scK').innerHTML = list.map((c) => '<button type="button" data-i="' + c[1] + '">' + esc(c[0]) + '</button>').join('');
      };
      const setForm = (on, msg, cls) => { $('#scAmt').disabled = !on; $('#scVer').disabled = !on; if (!on) $('#scAmt').value = ''; $('#scFS').textContent = msg; $('#scFS').className = 'sc-ok ' + (cls || ''); };
      const showInput = (on) => { ['#scF', '#scK', '#scStep', '#scHang', '#scWarn'].forEach((q) => { const e = $(q); if (e) e.style.display = on ? '' : 'none'; }); };
      const newVictim = () => {
        const pool = SC_SCEN.filter((v) => !used.includes(v.n)); if (!pool.length) used = [];
        V = pick(pool.length ? pool : SC_SCEN); used.push(V.n); victimN++;
        si = 0; prog = 0; strikes = 0; turns = 0; phase = 'chat'; blocked = false; card = ''; wait = 0;
        chat.innerHTML = ''; $('#scFace').textContent = V.face; $('#scN').textContent = V.n; $('#scM').textContent = V.age + ' tuổi · ' + V.job;
        setForm(false, 'Đang chờ nạn nhân đọc thông tin thẻ…'); showInput(true);
        bub('sys', '📞 Gọi người thứ ' + victimN + ' · kịch bản: ' + V.org); setTimeout(() => { if (!done) { bub('them', V.open); talk = 15; } }, 500);
        drawChips(); meters();
      };
      const say = (text) => { bub('them', text); talk = 18; };
      // q: 2 hợp ngữ cảnh · 1 tạm được · 0 lạc đề / làm lộ · 'warn'
      const rate = (raw) => { if (scKind(raw) === 'warn') return 'warn'; const f = ' ' + fold(raw), n = (V.kw[si] || []).filter((w) => f.includes(w)).length; return n >= 2 ? 2 : n === 1 ? 1 : 0; };
      const advance = (q) => {
        const S0 = V.st[si]; let line;
        if (q === 2) { prog += 2; line = S0.good; boss = Math.max(0, boss - 3); } else if (q === 1) { prog += 1; line = S0.ok; boss = Math.max(0, boss - 1); } else { prog -= 1; strikes++; line = S0.bad; boss += 8; }
        if (prog >= 2) { si++; prog = 0; }
        return line;
      };
      const finish = (text) => {
        if (done) return; done = true; sfx(scammedN >= KPI ? 'bad' : warnedN && !caught ? 'cheer' : 'fail');
        const out = { scammedN, warnedN, caught, target: KPI };
        if (KN.Mini) KN.Mini.lastOut = out;
        const score = clamp(scammedN / KPI, 0, 1);
        showInput(false); setForm(false, 'Ca làm việc đã kết thúc.');
        bub('sys', '🛡️ ' + pick(SC_TIPS));
        setTimeout(() => res({ score, text }), 2400);
      };
      const summary = (extra) => (extra ? extra + ' ' : '') + 'Kết quả ca: lừa ' + scammedN + '/' + KPI + ' người' + (warnedN ? ', lén cứu ' + warnedN + ' người' : '') + '.';
      const endVictim = (msg) => { phase = 'end'; bub('sys', msg); showInput(false); setForm(false, 'Chờ cuộc gọi tiếp theo…'); wait = 16; };
      const caughtEnd = () => { caught = true; bub('sys', '👁️ Quản lý xông tới giật điện thoại: “Mày dám làm trò gì hả?!”'); finish(summary(warnedN ? 'Quản lý phát hiện bạn lén cảnh báo nạn nhân nên đánh đập bạn.' : 'Bạn làm việc lề mề, bị quản lý đánh một trận.')); };
      const warnNow = () => {
        if (done || phase !== 'chat') return;
        bub('me', '⚠️ Đây là lừa đảo, bạn đừng đưa thông tin thẻ và đừng chuyển tiền cho ai hết!'); warnedN++; boss += 38 + rnd() * 10; blocked = true;
        const mine = victimN;
        setTimeout(() => { if (done || mine !== victimN) return; say(pick(['“Hả? Bị ép á? Trời ơi… cảm ơn bạn đã nói. Tôi sẽ không đưa thông tin gì và báo công an ngay!”', '“Thật hả? Vậy là lừa đảo… may mà bạn nhắn cho tôi. Tôi chặn số này rồi nhé, bạn cố giữ an toàn!”'])); meters(); if (boss >= 100) return caughtEnd(); endVictim('✅ Bạn đã lén cảnh báo ' + V.n + ', họ chặn số kịp thời. Quản lý chưa biết…'); }, 650);
      };
      const send = (raw, forcedQ) => {
        raw = String(raw || '').trim(); if (done || phase !== 'chat' || blocked || !raw) return;
        const q = forcedQ != null ? forcedQ : rate(raw);
        if (q === 'warn') { inp.value = ''; return warnNow(); }
        bub('me', raw); turns++; inp.value = ''; const mine = victimN;
        setTimeout(() => {
          if (done || mine !== victimN) return;
          say(advance(q)); meters();
          if (boss >= 100) return caughtEnd();
          if (si >= 3) {
            phase = 'form'; formLeft = 40; card = Array.from({ length: 16 }, () => Math.floor(rnd() * 10)).join('');
            setTimeout(() => { if (done || mine !== victimN) return; say('“Thẻ của tôi đây, số là: ' + cardGroups(card) + '. Bạn ghi cho kỹ nhé!”'); showInput(false); $('#scWarn').style.display = 'none'; setForm(true, 'Nạn nhân đang đọc số thẻ! Gõ đúng 16 số vào ô và bấm Xác nhận.', 'go'); $('#scAmt').focus(); }, 900);
            return;
          }
          if (strikes >= 3) return endVictim('😒 ' + V.n + ' nghi ngờ vì bạn nói chuyện lạc đề, cúp máy và chặn số.');
          if (turns >= MAXT) return endVictim('😮‍💨 ' + V.n + ' mất kiên nhẫn và cúp máy.');
          drawChips();
        }, 650);
      };
      const verify = () => {
        if (done || phase !== 'form') return; const v = $('#scAmt').value.replace(/\D/g, '');
        if (v === card) { scammedN++; earned = Math.round(rand(5, 60)); setForm(false, 'Đã ghi đúng thẻ — rút được ' + earned + ' triệu từ nạn nhân.', 'done'); pop('+' + earned + ' triệu'); sfx('coin'); meters(); bub('sys', '🛡️ ' + V.tip); endVictim('💸 Thẻ của ' + V.n + ' đã bị lấy sạch tiền. Quản lý huýt sáo hài lòng, còn bạn thấy buồn nôn.'); }
        else { boss += 10; sfx('bad'); setForm(true, 'Sai số thẻ! Nghe lại nạn nhân đọc và gõ lại cho đúng.', 'bad'); meters(); }
      };
      $('#scK').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; const c = V.st[si].chips[+b.dataset.i]; send(c[0], c[1]); });
      $('#scF').addEventListener('submit', (e) => { e.preventDefault(); send(inp.value); });
      $('#scVer').onclick = verify; $('#scAmt').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); verify(); } });
      $('#scWarn').onclick = warnNow;
      $('#scHang').onclick = () => { if (done || phase === 'end') return; boss += 6; endVictim('☎️ Bạn cúp máy, chuyển sang người khác (quản lý thấy bạn bỏ lỡ một cuộc).'); };
      $('#scBig').addEventListener('pointerdown', (e) => { e.preventDefault(); if (done) return; calls += power; boss = Math.max(0, boss - 0.8 * power); sfx('click'); meters(); });
      $('#scU1').onclick = () => { const c = upCost(1); if (calls >= c) { calls -= c; helpers++; sfx('coin'); meters(); } };
      $('#scU2').onclick = () => { const c = upCost(2); if (calls >= c) { calls -= c; power++; sfx('coin'); meters(); } };
      bub('sys', 'KPI năm nay: lừa đủ ' + KPI + ' người, không đạt sẽ bị đánh đập. Mỗi cuộc gọi có 3 bước theo kịch bản. Hoặc… lén cảnh báo nạn nhân.');
      newVictim();
      setTimeout(() => inp.focus(), 80);
      onKeys((e) => !(e.target && (e.target.tagName === 'INPUT')));
      every(() => {
        if (done) return; t += 0.1;
        if (talk > 0) talk--;
        calls += helpers * 0.1; boss = Math.max(0, boss + 0.05 - helpers * 0.04);
        if (phase === 'form') { formLeft -= 0.1; if (formLeft <= 0) endVictim('😒 ' + V.n + ' mất kiên nhẫn và cúp máy vì bạn ghi quá chậm.'); }
        else if (phase === 'end' && --wait <= 0) { if (t < DUR - 8) { newVictim(); } else finish(summary('Hết giờ làm.')); }
        meters();
        if (boss >= 100) caughtEnd(); else if (t >= DUR && phase !== 'form') finish(summary('Hết giờ làm.'));
      }, 100);
    });
  }
  // ------------------------------------------------------------------ 13. tập ngắm / phản xạ (leo rank, thi đấu eSports)
  // Tập ngắm — 3 bài: Flick (bắn mục tiêu hiện ngẫu nhiên, tâm đỏ = headshot ×2), Tracking (giữ trỏ trên mục tiêu di chuyển), Đổi mục tiêu (bấm 1→5 theo thứ tự).
  // Độ khó: thời gian sống mục tiêu = 1.25 + sức khỏe/220 + trí tuệ/400 − need×0.35; tốc độ mục tiêu tracking tăng theo need. Điểm = trung bình 3 bài. Kỷ lục lưu máy.
  const AIM_CFG = { flick: 9, track: 8, swap: 8, head: 0.38, key: 'kn_aim_best' };
  function aimScore(hits, heads, target) { return clamp((hits + heads * 0.5) / target, 0, 1); } // thuần túy
  function aim(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, target = Math.round(8 + p.need * 6), life = 1.25 + st.health / 220 + st.smarts / 400 - p.need * 0.35;
      let phase = 'flick', t = 0, done = false, hits = 0, heads = 0, miss = 0, onT = 0, sets = 0, swapOk = 0, uid = 0, next = 0.5, balls = [], mx = -1, my = -1, expect = 1, trk = null;
      const sc = { flick: 0, track: 0, swap: 0 };
      let best = 0; try { best = +localStorage.getItem(AIM_CFG.key) || 0; } catch (e) {}
      const box = open('<div class="mini-head"><b>🎯 Tập ngắm</b><small id="amH"></small></div><div class="mini-bar"><i id="amT" style="width:100%"></i></div><div class="am-arena" id="amA"></div><p class="mini-keys" id="amK"></p>');
      const arena = box.querySelector('#amA'), KEYS = { flick: '🖱️ Bài 1/3 FLICK: bấm vào mục tiêu trước khi biến mất. Bắn trúng <b>chấm đỏ giữa</b> = headshot (×2).', track: '🖱️ Bài 2/3 TRACKING: giữ trỏ chuột/ngón tay <b>trên mục tiêu đang di chuyển</b>, càng lâu càng tốt.', swap: '🖱️ Bài 3/3 ĐỔI MỤC TIÊU: bấm các mục tiêu theo thứ tự <b>1 → 5</b>, hết bộ thì có bộ mới.' };
      const setKeys = () => { box.querySelector('#amK').innerHTML = KEYS[phase]; };
      const mk = (txt, r, x, y) => { const el = document.createElement('button'); el.type = 'button'; el.className = 'am-t'; el.dataset.id = ++uid; el.style.width = el.style.height = r * 2 + 'px'; el.style.left = x + '%'; el.style.top = y + '%'; if (txt) { el.textContent = txt; el.style.fontWeight = '800'; } arena.appendChild(el); return el; };
      const spawn = () => { const r = 26 + rnd() * 14, el = mk('', r, 4 + rnd() * 88, 6 + rnd() * 80); el.insertAdjacentHTML('beforeend', '<i style="position:absolute;left:50%;top:50%;width:' + Math.round(r * 0.5) + 'px;height:' + Math.round(r * 0.5) + 'px;margin:-' + Math.round(r * 0.25) + 'px 0 0 -' + Math.round(r * 0.25) + 'px;border-radius:50%;background:#ff3b3b;pointer-events:none"></i>'); balls.push({ el, id: uid, left: life, r }); };
      const clear = () => { balls.forEach((o) => o.el.remove()); balls = []; if (trk) { trk.el.remove(); trk = null; } };
      const swapSet = () => { clear(); const spots = []; for (let n = 1; n <= 5; n++) { let x, y, ok; do { x = 8 + rnd() * 80; y = 10 + rnd() * 72; ok = spots.every(([a, b]) => Math.hypot(a - x, b - y) > 20); } while (!ok); spots.push([x, y]); const el = mk(String(n), 28, x, y); balls.push({ el, id: uid, n, left: 99 }); } expect = 1; };
      const phaseLen = () => AIM_CFG[phase === 'swap' ? 'swap' : phase];
      const startPhase = (ph) => { clear(); phase = ph; t = 0; setKeys(); if (ph === 'track') { const el = mk('', 38, 50, 50); trk = { el, ph: rnd() * 6 }; } if (ph === 'swap') swapSet(); sfx('notify'); };
      const hud = () => { box.querySelector('#amH').textContent = (phase === 'flick' ? 'Flick · trúng ' + hits + ' (HS ' + heads + ')' : phase === 'track' ? 'Tracking · ' + Math.round(onT / AIM_CFG.track * 100) + '% đúng mục tiêu' : 'Đổi mục tiêu · ' + swapOk + ' mục tiêu') + ' · còn ' + Math.max(0, Math.ceil(phaseLen() - t)) + 's'; box.querySelector('#amT').style.width = Math.max(0, (1 - t / phaseLen()) * 100) + '%'; };
      arena.addEventListener('pointermove', (e) => { const r = arena.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      arena.addEventListener('pointerdown', (e) => {
        if (done || phase === 'track') return; e.preventDefault();
        const b = e.target.closest('.am-t'); const o = b && balls.find((x) => x.id === +b.dataset.id);
        if (phase === 'flick') {
          if (o) { const rc = o.el.getBoundingClientRect(), d = Math.hypot(e.clientX - (rc.left + rc.width / 2), e.clientY - (rc.top + rc.height / 2)) / (rc.width / 2), hs = d < AIM_CFG.head; hits++; if (hs) heads++; sfx(hs ? 'coin' : 'click'); o.el.classList.add('hit'); setTimeout(() => o.el.remove(), 120); balls = balls.filter((x) => x !== o); }
          else { miss++; sfx('bad'); }
        } else if (phase === 'swap') {
          if (o && o.n === expect) { swapOk++; sfx('click'); o.el.classList.add('hit'); setTimeout(() => o.el.remove(), 120); balls = balls.filter((x) => x !== o); expect++; if (expect > 5) { sets++; swapSet(); } }
          else { miss++; sfx('bad'); }
        }
        hud();
      });
      setKeys(); hud();
      every(() => {
        if (done) return; t += 0.05;
        if (phase === 'flick') {
          next -= 0.05; if (next <= 0) { spawn(); next = rand(0.45, 0.75) - p.need * 0.1; }
          balls.forEach((o) => { o.left -= 0.05; o.el.style.opacity = Math.min(1, o.left / 0.4); });
          const gone = balls.filter((o) => o.left <= 0); if (gone.length) { gone.forEach((o) => o.el.remove()); balls = balls.filter((o) => o.left > 0); miss += gone.length; }
        } else if (phase === 'track' && trk) {
          const sp = 0.9 + p.need * 1.1, a = arena.getBoundingClientRect(); trk.ph += 0.05 * sp;
          const x = 50 + 36 * Math.sin(trk.ph * 1.3), y = 50 + 30 * Math.sin(trk.ph * 0.9 + 1.2) * Math.cos(trk.ph * 0.4);
          trk.el.style.left = x + '%'; trk.el.style.top = y + '%';
          const cx = x / 100 * a.width, cy = y / 100 * a.height, on = mx >= 0 && Math.hypot(mx - cx, my - cy) < 38; if (on) onT += 0.05; trk.el.classList.toggle('on', on);
        }
        hud();
        if (t >= phaseLen()) {
          if (phase === 'flick') { sc.flick = aimScore(hits, heads, target); startPhase('track'); }
          else if (phase === 'track') { sc.track = clamp(onT / AIM_CFG.track / 0.8, 0, 1); startPhase('swap'); }
          else {
            sc.swap = clamp(swapOk / (10 + p.need * 6), 0, 1); done = true; clear();
            const score = clamp((sc.flick + sc.track + sc.swap) / 3 - miss * 0.01, 0, 1), pct = Math.round(score * 100);
            let rec = ''; try { if (pct > best) { localStorage.setItem(AIM_CFG.key, String(pct)); rec = best ? ' 🏅 Kỷ lục mới (cũ ' + best + '%)!' : ''; } } catch (e) {}
            setTimeout(() => res({ score, text: 'Flick: ' + hits + ' trúng (' + heads + ' headshot) · Tracking: ' + Math.round(onT / AIM_CFG.track * 100) + '% · Đổi mục tiêu: ' + swapOk + ' · trượt ' + miss + '.' + rec }), 400);
          }
        }
      }, 50);
    });
  }
  // ------------------------------------------------------------------ 14. xử lý tình huống clutch (eSports): chọn hướng xử lý đúng ngữ cảnh rồi ra tay dưới áp lực thời gian
  const CL_SCEN = [
    { t: '1v3 · bom đã cài', d: 'Hiệp quyết định, đồng đội gục hết. Bạn còn 70 máu, ba địch đang canh khu đặt bom và bom chỉ còn 25 giây.', n: 3, secs: 25, o: [['Đi vòng đánh lén từng người, hạ đứa lẻ trước', 2], ['Ném khói rồi lao vào gỡ bom', 1], ['Rush thẳng vào chỗ bom, bắn liên tục', 0]] },
    { t: 'Đồng đội gục hết · nhà chính nguy', d: 'Bạn chỉ còn 20% máu. Địch còn ba người đang đẩy nhà chính, bạn là hy vọng cuối cùng của đội.', n: 3, secs: 22, o: [['Nấp bụi cỏ câu giờ, bắt từng kẻ tách đàn', 2], ['Về nhà hồi đầy máu rồi giữ cổng', 1], ['Lao vào giao tranh tổng cho đỡ tiếc', 0]] },
    { t: '1v2 · hết đạn súng chính', d: 'Chỉ còn hai địch nhưng băng đạn súng chính đã cạn. Địch đang tiến vào, nghe rõ tiếng bước chân.', n: 2, secs: 18, o: [['Đổi sang súng phụ, nép góc tường đánh cự ly gần', 2], ['Đứng im chờ chúng bước vào rồi hạ gục', 1], ['Quay lưng bỏ chạy ra ngoài bản đồ', 0]] },
    { t: 'Giành rồng cuối trận', d: 'Địch vừa bắt rồng, đội bạn thiếu hai người. Bạn đang ở bụi bên cạnh, hồi chiêu kỹ năng chỉ còn vài giây.', n: 3, secs: 20, o: [['Chờ hồi chiêu rồi bất ngờ nhảy vào cướp rồng', 2], ['Nhử địch bỏ rồng chạy theo bạn', 1], ['Xông vào ngay khi kỹ năng chưa hồi', 0]] },
    { t: 'Vòng bo cuối · còn 3 đội', d: 'Vòng an toàn thu nhỏ còn vài chục mét. Bạn chỉ có một mình, bao quanh là hai đội địch đang bắn nhau.', n: 2, secs: 20, o: [['Nằm chờ hai đội kiệt sức rồi nhặt hạ', 2], ['Ném lựu đạn vào giữa để chúng đánh nhau thêm', 1], ['Xông ra bắn cả hai đội cùng lúc', 0]] },
    { t: 'Lật kèo ở ván 5', d: 'Đội bạn kém 8.000 vàng, địch đang chủ quan đứng chắn trụ. Bạn có thể tận dụng sơ hở trong vài giây.', n: 3, secs: 22, o: [['Đợi địch tách lẻ rồi bắt từng người', 2], ['Câu địch đuổi theo vào bụi rồi quay lại đánh', 1], ['Đánh trực diện vào cả đội đang chủ quan', 0]] },
  ];
  function clutch(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, ROUNDS = 3, seq = shuffle(CL_SCEN.slice()).slice(0, ROUNDS), hint = st.smarts >= 70;
      // tiếng bước chân: ~70% đúng hướng địch thật sự xuất hiện (còn lại đánh lạc hướng); trí tuệ ≥ 70 cho linh cảm
      const SIDES = ['trái', 'giữa', 'phải']; let cue = { say: 1, real: 1 };
      let ri = 0, wins = 0, partial = 0, hp = 100, done = false, balls = [], hitsR = 0, nR = 0, timeLeft = 0, secs = 0, q = 0, spawnT = 0, queue = 0, uid = 0, phase = 'pick', log = [];
      const box = open('<div class="mini-head"><b>⚡ Clutch</b><small id="clH"></small></div>' +
        '<div class="cl-top"><div class="cl-hp"><span>❤️ Máu</span><div class="mini-bar"><i id="clHp" style="width:100%"></i></div></div><div class="cl-hp"><span>⏳ Thời gian</span><div class="mini-bar"><i id="clT" style="width:100%"></i></div></div></div>' +
        '<div class="cl-card" id="clC"></div><div class="mini-ans one" id="clO"></div><div class="am-arena cl-arena" id="clA" hidden></div><p class="mini-keys" id="clK"></p>');
      const arena = box.querySelector('#clA');
      const hud = () => { box.querySelector('#clH').textContent = 'Ca ' + Math.min(ri + 1, ROUNDS) + '/' + ROUNDS + ' · thắng ' + wins; box.querySelector('#clHp').style.width = clamp(hp, 0, 100) + '%'; box.querySelector('#clT').style.width = phase === 'act' ? clamp((timeLeft / secs) * 100, 0, 100) + '%' : '100%'; };
      const showPick = () => {
        phase = 'pick'; arena.hidden = true; arena.innerHTML = ''; balls = [];
        const sc = seq[ri], opts = shuffle(sc.o.map((o) => ({ text: o[0], q: o[1] })));
        box.querySelector('#clC').innerHTML = '<b>' + esc(sc.t) + '</b><p>' + esc(sc.d) + '</p>'; box.querySelector('#clO').hidden = false;
        box.querySelector('#clO').innerHTML = opts.map((o, i) => '<button type="button" class="mini-opt" data-q="' + o.q + '"' + (hint && o.q === 0 ? ' style="opacity:.5" title="Linh cảm: cách này rất nguy hiểm"' : '') + '><span>' + (i + 1) + '</span>' + esc(o.text) + '</button>').join('');
        box.querySelector('#clK').textContent = 'Chọn hướng xử lý (phím 1–3). Cách đúng ngữ cảnh sẽ cho bạn mục tiêu to và nhiều thời gian hơn.';
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => startAct(+b.dataset.q)));
        onKeysOnce((e) => { const n = +e.key; if (n >= 1 && n <= 3) { const b = box.querySelectorAll('.mini-opt')[n - 1]; if (b) b.click(); return true; } return false; });
        hud();
      };
      const startAct = (qq) => {
        if (phase !== 'pick') return; q = qq; phase = 'act'; sfx(q === 2 ? 'good' : q === 1 ? 'click' : 'bad');
        const sc = seq[ri]; cue.real = Math.floor(rnd() * 3); cue.say = rnd() < 0.7 ? cue.real : (cue.real + 1 + Math.floor(rnd() * 2)) % 3; nR = sc.n; hitsR = 0; queue = nR; spawnT = 0.3; secs = sc.secs * (q === 2 ? 0.62 : q === 1 ? 0.5 : 0.4) + st.health / 60 - p.need * 2; timeLeft = secs;
        box.querySelector('#clO').hidden = true; arena.hidden = false; arena.innerHTML = '';
        box.querySelector('#clC').innerHTML += '<p class="cl-note">' + (q === 2 ? '✅ Quyết định hợp lý: địch lộ sơ hở.' : q === 1 ? '⚠️ Cách này tạm được, địch khó bắt hơn.' : '❌ Quyết định liều lĩnh: địch đã sẵn sàng!') + ' Hạ ' + nR + ' mục tiêu trước khi hết giờ.</p>';
        box.querySelector('#clK').textContent = '🎧 Nghe tiếng bước chân phía ' + SIDES[cue.say] + ' (không phải lúc nào cũng đúng). 🖱️ Bấm vào từng địch trước khi nó tránh đi. Bấm trượt hoặc để địch thoát thì mất máu.';
        onKeys(() => true); hud();
      };
      const endRound = (ok) => {
        phase = 'result'; arena.innerHTML = ''; balls = [];
        if (ok) { wins++; sfx('coin'); } else { partial += hitsR / nR * 0.4; sfx('fail'); }
        box.querySelector('#clC').innerHTML += '<p class="cl-res ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '🔥 CLUTCH THÀNH CÔNG! Bạn hạ gục cả ' + nR + ' người.' : '💥 Thất bại: chỉ hạ được ' + hitsR + '/' + nR + ' người.') + '</p>';
        log.push(ok); ri++; hud();
        setTimeout(() => { if (done) return; if (ri >= ROUNDS || hp <= 0) finishAll(); else showPick(); }, 1400);
      };
      const finishAll = () => { if (done) return; done = true; const score = clamp((wins + partial) / ROUNDS, 0, 1); res({ score, text: 'Bạn xử lý thành công ' + wins + '/' + ROUNDS + ' tình huống clutch' + (wins === ROUNDS ? ' — xứng đáng MVP trận!' : wins ? '.' : ', cần bình tĩnh hơn.') }); };
      const spawn = () => {
        const el = document.createElement('button'); el.type = 'button'; el.className = 'am-t cl-e'; el.dataset.id = ++uid;
        const r = (q === 2 ? 28 : q === 1 ? 23 : 18) + rnd() * 10; el.style.width = el.style.height = r * 2 + 'px'; const lo = [6, 34, 62][cue.real], xx = rnd() < 0.7 ? lo + rnd() * 30 : 6 + rnd() * 86; el.style.left = xx + '%'; el.style.top = (8 + rnd() * 78) + '%'; el.textContent = '👤';
        arena.appendChild(el); balls.push({ el, id: uid, left: (q === 2 ? 1.9 : q === 1 ? 1.5 : 1.15) + st.health / 300 });
      };
      arena.addEventListener('pointerdown', (e) => {
        if (done || phase !== 'act') return; e.preventDefault();
        const b = e.target.closest('.cl-e'); const o = b && balls.find((x) => x.id === +b.dataset.id);
        if (o) { hitsR++; o.el.classList.add('hit'); setTimeout(() => o.el.remove(), 120); balls = balls.filter((x) => x !== o); sfx('click'); if (hitsR >= nR) return endRound(true); }
        else { hp -= 12; sfx('bad'); if (hp <= 0) return endRound(false); }
        hud();
      });
      showPick();
      every(() => {
        if (done || phase !== 'act') return; timeLeft -= 0.05; spawnT -= 0.05;
        if (queue > 0 && balls.length < 2 && spawnT <= 0) { spawn(); queue--; spawnT = rand(0.5, 0.9); }
        balls.forEach((o) => { o.left -= 0.05; o.el.style.opacity = Math.min(1, o.left / 0.35); });
        const gone = balls.filter((o) => o.left <= 0);
        if (gone.length) { gone.forEach((o) => o.el.remove()); balls = balls.filter((o) => o.left > 0); hp -= 15 * gone.length; queue += gone.length; sfx('bad'); if (hp <= 0) return endRound(false); }
        hud();
        if (timeLeft <= 0) endRound(false);
      }, 50);
    });
  }
  // ------------------------------------------------------------------ 🎨 vẽ nét (hoạ sĩ, thợ cắt tóc, thợ thủ công): đi theo đường mẫu bằng tay vững
  // Độ khó: dung sai = 10 + sức khỏe×0.12 − need×6 (px); 3 nét, mỗi nét 9s. Điểm = độ bám đường của 3 nét (thuần túy: strokeAccuracy).
  const PAINT_CFG = { strokes: 3, secs: 9, tolBase: 10, tolHp: 0.12, tolNeed: 6 };
  function strokeAccuracy(dists, tol) { if (!dists.length) return 0; return clamp(1 - (dists.reduce((a, b) => a + b, 0) / dists.length - tol * 0.3) / (tol * 1.6), 0, 1); }
  function paintGame(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health, tol = Math.max(7, PAINT_CFG.tolBase + hp * PAINT_CFG.tolHp - p.need * PAINT_CFG.tolNeed);
      const { cv, c, hud } = canvasGame('🎨 Vẽ nét', '', 'Bấm giữ chuột/ngón tay tại chấm xanh rồi kéo theo đường nét đứt tới chấm đỏ. Bằng bàn phím: <kbd>←↑↓→</kbd> di chuyển bút, giữ <kbd>Space</kbd> để vẽ.');
      let si = 0, drawing = false, trail = [], dists = [], scores = [], t = 0, curve = null, done = false, msg = '', msgT = 0, prog = 0;
      let kx = 100, ky = 200, space = false; const keys = {};
      const mk = () => { const y0 = rand(120, 280), y1 = rand(120, 280); return [[70, y0], [200, rand(60, 340)], [440, rand(60, 340)], [570, y1]]; };
      const bz = (u) => { const a = 1 - u, [P0, P1, P2, P3] = curve; return [a * a * a * P0[0] + 3 * a * a * u * P1[0] + 3 * a * u * u * P2[0] + u * u * u * P3[0], a * a * a * P0[1] + 3 * a * a * u * P1[1] + 3 * a * u * u * P2[1] + u * u * u * P3[1]]; };
      let pts = [];
      const next = () => { curve = mk(); pts = Array.from({ length: 80 }, (_, i) => bz(i / 79)); trail = []; drawing = false; prog = 0; t = 0; kx = curve[0][0]; ky = curve[0][1]; };
      const dist = (x, y) => { let b = 1e9, bi = 0; pts.forEach(([a, d], i) => { const q = Math.hypot(a - x, d - y); if (q < b) { b = q; bi = i; } }); return [b, bi]; };
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 640 / r.width, (e.clientY - r.top) * 400 / r.height]; };
      const add = (x, y) => { const [d, i] = dist(x, y); trail.push([x, y]); dists.push(Math.min(60, d)); prog = Math.max(prog, i / 79); };
      const endStroke = () => { if (!drawing) return; drawing = false; if (prog < 0.9) { msg = 'Chưa tới cuối nét! Vẽ lại'; msgT = 1; trail = []; dists = []; prog = 0; return; } fin(); };
      const fin = () => { const a = strokeAccuracy(dists.slice(-Math.max(1, trail.length)), tol); scores.push(a); sfx(a > 0.6 ? 'good' : 'bad'); msg = a > 0.8 ? 'Nét vẽ đẹp!' : a > 0.5 ? 'Tạm ổn' : 'Hơi run tay…'; msgT = 1; si++; if (si >= PAINT_CFG.strokes) { done = true; const sc = scores.reduce((x, y) => x + y, 0) / scores.length; setTimeout(() => res({ score: sc, text: 'Độ chính xác trung bình ' + Math.round(sc * 100) + '% qua ' + scores.length + ' nét.' }), 900); } else setTimeout(next, 700); };
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); if (done) return; const [x, y] = pos(e); if (Math.hypot(x - curve[0][0], y - curve[0][1]) < 26) { drawing = true; trail = []; dists = []; cv.setPointerCapture(e.pointerId); add(x, y); } else { msg = 'Bắt đầu từ chấm xanh!'; msgT = 0.8; } });
      cv.addEventListener('pointermove', (e) => { if (!drawing || done) return; const [x, y] = pos(e); add(x, y); });
      cv.addEventListener('pointerup', endStroke);
      onKeys((e) => { const k = e.key, dn = e.type === 'keydown'; const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[k]; if (m) { keys[m] = dn; return true; } if (k === ' ') { if (dn && !space) { if (!drawing && Math.hypot(kx - curve[0][0], ky - curve[0][1]) < 26) { drawing = true; trail = []; dists = []; } } if (!dn && drawing) endStroke(); space = dn; return true; } return false; });
      next();
      loop((dt) => {
        if (!done) { t += dt; msgT = Math.max(0, msgT - dt); const sp = 140 * dt; kx = clamp(kx + ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * sp, 10, 630); ky = clamp(ky + ((keys.d ? 1 : 0) - (keys.u ? 1 : 0)) * sp, 10, 390); if (drawing && space) add(kx, ky); if (t > PAINT_CFG.secs && !done) { if (drawing) { drawing = false; } if (prog < 0.9) { scores.push(0); si++; msg = 'Hết giờ nét này'; msgT = 1; if (si >= PAINT_CFG.strokes) { done = true; const sc = scores.reduce((x, y) => x + y, 0) / scores.length; setTimeout(() => res({ score: sc, text: 'Độ chính xác trung bình ' + Math.round(sc * 100) + '% qua ' + scores.length + ' nét.' }), 700); } else next(); } } }
        c.fillStyle = '#f3ead8'; c.fillRect(0, 0, 640, 400); c.fillStyle = 'rgba(0,0,0,.04)'; for (let i = 0; i < 640; i += 20) c.fillRect(i, 0, 1, 400);
        c.setLineDash([8, 8]); c.strokeStyle = 'rgba(80,40,120,.7)'; c.lineWidth = 3; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.setLineDash([]);
        c.strokeStyle = 'rgba(80,40,120,.12)'; c.lineWidth = tol * 2; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        c.fillStyle = '#39cf98'; c.beginPath(); c.arc(curve[0][0], curve[0][1], 10, 0, 7); c.fill(); c.fillStyle = '#ff5c5c'; c.beginPath(); c.arc(curve[3][0], curve[3][1], 10, 0, 7); c.fill();
        if (trail.length > 1) { c.strokeStyle = '#2a2250'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); trail.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
        c.fillStyle = '#2a2250'; c.beginPath(); c.arc(kx, ky, 4, 0, 7); c.fill();
        c.fillStyle = '#222'; c.font = '700 14px sans-serif'; c.textAlign = 'left'; c.fillText('Nét ' + Math.min(si + 1, PAINT_CFG.strokes) + '/' + PAINT_CFG.strokes + ' · ' + Math.max(0, Math.ceil(PAINT_CFG.secs - t)) + 's', 14, 24);
        if (msgT > 0) bigText(c, msg, 60, '#5b3fd0', 26);
        hud.textContent = 'Độ bám đường: ' + (dists.length ? Math.round(strokeAccuracy(dists, tol) * 100) + '%' : '–');
      });
    });
  }

  // ------------------------------------------------------------------ 🛬 hạ cánh (phi công): giữ máy bay trên đường trượt, chạm đường băng nhẹ nhàng
  // Độ khó: gió giật = 12 + need×22; độ nhạy lái giảm khi thể lực thấp. Điểm = bám đường trượt (70%) + độ êm khi chạm đất (30%).
  const LAND_CFG = { dur: 22, sink: 0.9, gust: 20, gustNeed: 40 }; // đã cân bằng bằng mô phỏng bot: tay lái yếu ~0.5–0.7, giỏi ~0.9
  function landScore(devAvg, vsTouch) { return clamp(1 - devAvg / 14, 0, 1) * 0.7 + clamp(1 - Math.max(0, vsTouch - 1.2) / 2, 0, 1) * 0.3; }
  function landGame(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health, resp = 0.7 + hp / 100 * 0.5;
      const { box, cv, c, hud } = canvasGame('🛬 Hạ cánh', '<div class="mini-pad"><button type="button" data-v="-1">⬆ Kéo lên <kbd>↑</kbd></button><button type="button" data-v="1">⬇ Hạ xuống <kbd>↓</kbd></button></div>', 'Giữ <kbd>↑</kbd> kéo mũi lên (giảm độ dốc), <kbd>↓</kbd> hạ mũi xuống. Bám sát <b style="color:#39cf98">đường trượt xanh</b>, chạm đường băng thật êm (tốc độ rơi thấp). Gió giật sẽ đẩy bạn lệch.');
      let t = -1, x = 0, y = 80, vy = 11, pitch = 0, devs = [], touched = false, done = false, gust = 0, gustT = 2, msg = '', keys = { u: false, d: false };
      const W = 640, GX0 = 40, GX1 = 560, GY0 = 80, GY1 = 320, slopeY = (px) => GY0 + (px - GX0) / (GX1 - GX0) * (GY1 - GY0);
      const press = (d, on) => { if (d < 0) keys.u = on; else keys.d = on; };
      box.querySelectorAll('[data-v]').forEach((b) => { const d = +b.dataset.v; b.onpointerdown = (e) => { e.preventDefault(); press(d, true); }; b.onpointerup = b.onpointerleave = () => press(d, false); });
      onKeys((e) => { const dn = e.type === 'keydown'; if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { keys.u = dn; return true; } if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { keys.d = dn; return true; } return false; });
      x = GX0;
      loop((dt) => {
        t += dt;
        if (t > 0 && !done) {
          gustT -= dt; if (gustT <= 0) { gustT = rand(1.2, 2.6); gust = rand(-1, 1) * (LAND_CFG.gust + p.need * LAND_CFG.gustNeed); }
          gust *= 1 - dt * 1.2;
          pitch += ((keys.d ? 1 : 0) - (keys.u ? 1 : 0)) * 90 * resp * dt; pitch *= 1 - dt * 0.6; pitch = clamp(pitch, -60, 90);
          vy += (pitch * 0.4 + 11 - vy) * dt * 2 + gust * dt * 1.3; vy = clamp(vy, -25, 70);
          y += vy * dt; x += (GX1 - GX0) / LAND_CFG.dur * dt;
          devs.push(Math.abs(y - slopeY(x)));
          if (y >= GY1 || x >= GX1) { done = true; touched = true; const vs = Math.max(0, vy / 10), dv = devs.reduce((a, b) => a + b, 0) / devs.length, sc = landScore(dv, vs); sfx(vs < 2.2 ? 'good' : 'bad'); msg = vs < 1.4 ? 'Chạm đất êm ru!' : vs < 2.4 ? 'Chạm đất ổn' : 'Hạ cánh cứng!'; setTimeout(() => res({ score: sc, text: msg + ' Lệch đường trượt trung bình ' + dv.toFixed(0) + 'px, tốc độ rơi lúc chạm ' + vs.toFixed(1) + '.' }), 1000); }
        }
        const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#6aa8ff'); g.addColorStop(1, '#cfe6ff'); c.fillStyle = g; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#4f7d45'; c.fillRect(0, 330, 640, 70); c.fillStyle = '#444'; c.fillRect(GX1 - 40, 326, 140, 10); c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) c.fillRect(GX1 - 30 + i * 22, 330, 12, 2);
        c.strokeStyle = '#39cf98'; c.setLineDash([10, 8]); c.lineWidth = 3; c.beginPath(); c.moveTo(GX0, GY0); c.lineTo(GX1, GY1); c.stroke(); c.setLineDash([]);
        c.save(); c.translate(x, y); c.rotate(clamp(vy / 70, -0.4, 0.6) * 0.5); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, 0, 22, 7, 0, 0, 7); c.fill(); c.fillStyle = '#d63c3c'; c.fillRect(-4, -14, 8, 14); c.fillRect(-26, -9, 10, 8); c.restore();
        c.fillStyle = '#222'; c.font = '700 13px sans-serif'; c.textAlign = 'left'; c.fillText('Lệch: ' + Math.round(y - slopeY(x)) + 'px · rơi: ' + (Math.max(0, vy) / 10).toFixed(1) + (gust > 6 ? ' · 💨 gió giật' : ''), 14, 22);
        if (done) bigText(c, msg, 140, '#d63c3c', 34);
        if (t < 0) bigText(c, 'VÀO ĐƯỜNG TRƯỢT', 200, '#fff', 36);
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(LAND_CFG.dur - Math.max(0, t))) + 's';
      });
    });
  }

  // ------------------------------------------------------------------ 🔧 sửa máy (công nhân, kỹ thuật): ghi nhớ và lặp lại chuỗi công tắc sáng
  // Độ khó: chuỗi dài 3 + vòng (+1 nếu need cao); trí tuệ cao → mỗi vòng sáng chậm hơn (dễ nhớ). Sai 3 lần thì cháy cầu chì.
  const FIX_CFG = { rounds: 5, base: 3, lives: 3 };
  function fixGame(p) {
    return new Promise((res) => {
      const sm = p.ctx.stats.smarts, step = 0.55 + sm / 100 * 0.25 - p.need * 0.15, COL = ['#ff5c5c', '#ffd23f', '#39cf98', '#5cc8ff'];
      const { box, cv, c, hud } = canvasGame('🔧 Sửa máy', '<div class="mini-pad"><button type="button" data-s="0">1 <kbd>1</kbd></button><button type="button" data-s="1">2 <kbd>2</kbd></button><button type="button" data-s="2">3 <kbd>3</kbd></button><button type="button" data-s="3">4 <kbd>4</kbd></button></div>', 'Nhìn chuỗi công tắc sáng lên, rồi bấm lại <b>đúng thứ tự</b>: chuột/chạm vào ô, hoặc phím <kbd>1</kbd>–<kbd>4</kbd>.');
      let round = 0, seq = [], idx = 0, phase = 'show', showI = 0, showT = 0, lit = -1, lives = FIX_CFG.lives, done = false, msg = '', msgT = 0, ok = 0, t = -1;
      const start = () => { const n = FIX_CFG.base + round + (p.need > 0.6 ? 1 : 0); seq = Array.from({ length: n }, () => Math.floor(rnd() * 4)); idx = 0; phase = 'show'; showI = 0; showT = 0.6; lit = -1; };
      const press = (k) => {
        if (done || phase !== 'in') return; lit = k; setTimeout(() => { if (lit === k) lit = -1; }, 150);
        if (seq[idx] === k) { idx++; sfx('click'); if (idx >= seq.length) { ok++; round++; msg = 'Máy chạy ổn!'; msgT = 1; sfx('good'); if (round >= FIX_CFG.rounds) { done = true; setTimeout(() => res({ score: 1, text: 'Sửa xong máy, qua cả ' + FIX_CFG.rounds + ' vòng!' }), 800); } else { phase = 'wait'; setTimeout(start, 900); } } }
        else { lives--; sfx('bad'); msg = 'Sai rồi! Chập điện ⚡'; msgT = 1; if (lives <= 0) { done = true; setTimeout(() => res({ score: clamp(ok / FIX_CFG.rounds * 0.85, 0, 0.85), text: 'Cháy cầu chì sau ' + ok + '/' + FIX_CFG.rounds + ' vòng.' }), 800); } else { phase = 'wait'; setTimeout(() => { idx = 0; phase = 'show'; showI = 0; showT = 0.6; lit = -1; }, 900); } }
      };
      padBind(box, '[data-s]', (b) => press(+b.dataset.s));
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 640, y = (e.clientY - r.top) / r.height * 400; const col = Math.floor((x - 120) / 100), row = Math.floor((y - 110) / 100); if (col >= 0 && col < 4 && row === 0) press(col); });
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const n = +e.key; if (n >= 1 && n <= 4) { press(n - 1); return true; } return false; });
      start();
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        if (t > 0 && phase === 'show' && !done) { showT -= dt; if (showT <= 0) { if (showI < seq.length * 2) { if (showI % 2 === 0) { lit = seq[showI / 2]; sfx('click'); showT = step; } else { lit = -1; showT = 0.18; } showI++; } else { lit = -1; phase = 'in'; } } }
        c.fillStyle = '#1b1f2e'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#272c42'; c.fillRect(70, 70, 500, 200);
        for (let i = 0; i < 4; i++) { const on = lit === i; c.fillStyle = on ? COL[i] : 'rgba(255,255,255,.08)'; c.fillRect(120 + i * 100, 110, 80, 80); c.strokeStyle = COL[i]; c.lineWidth = 3; c.strokeRect(120 + i * 100, 110, 80, 80); c.fillStyle = on ? '#111' : '#9fb0cc'; c.font = '800 28px sans-serif'; c.textAlign = 'center'; c.fillText(String(i + 1), 160 + i * 100, 160); }
        c.fillStyle = '#9fb0cc'; c.font = '700 15px sans-serif'; c.fillText(phase === 'show' ? '👀 Ghi nhớ chuỗi…' : phase === 'in' ? '🖱️ Đến lượt bạn (' + idx + '/' + seq.length + ')' : '', 320, 235);
        c.fillStyle = '#ffd23f'; c.fillText('Vòng ' + Math.min(round + 1, FIX_CFG.rounds) + '/' + FIX_CFG.rounds + ' · ' + '🔌'.repeat(Math.max(0, lives)), 320, 300);
        if (msgT > 0) bigText(c, msg, 350, msg.startsWith('Sai') ? '#ff6b6b' : '#45c486', 26);
        hud.textContent = 'Vòng ' + Math.min(round + 1, FIX_CFG.rounds) + '/' + FIX_CFG.rounds;
      });
    });
  }

  const GAMES = { paint: paintGame, land: landGame, fix: fixGame, clutch, aim, scamchat, hoops, shoot: hoops, hax, sneak, quiz, penalty, keeper, sprint, swim, chase, drive, fight, interview, cook, stock, love, haggle, cpr, cards };
  KN.Mini = {
    plan, planJob, planPropose, planHaggle, planDuel, run, NAME, DUEL_TYPES,
    // file khác đăng ký thêm minigame (js/showbiz.js): fn(p) → Promise<{score, text}>, tự mở khung riêng
    register(type, fn, name, how, hint) { GAMES[type] = (p) => { close(); return fn(p); }; NAME[type] = name; HOWTO[type] = how; if (hint) EXTRA_HINT[type] = hint; },
    busy: () => !!root, HOWTO,
    abort() { if (abortFn) abortFn(); }, playing: () => !!abortFn, onAbort: [],
    setEnabled(b) { KN.store.set(PREF, !!b); }, isEnabled: enabled,
    test(type, need, stats, extra) { const ctx = Object.assign({ stats: { happy: 60, health: 70, smarts: 70, looks: 60 }, appearance: { top: '#2d6cdf', skin: '#e6b48f' }, age: 20 }, stats ? { stats } : {}); return run(Object.assign({ type, need: need ?? 0.5, ctx, title: 'Thử minigame', label: NAME[type], level: 2, mode: 'event', foe: 'thug', practice: true }, extra || {})); },
  };
})();
