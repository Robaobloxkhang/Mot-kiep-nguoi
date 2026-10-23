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
  const SPORT_GAME = { cauthu: 'penalty', bongro: 'hoops', bongchuyen: 'sprint', caulong: 'sprint', vdv_vo: 'fight', dienkinh: 'sprint', boi: 'swim', esports: 'quiz' };
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
    if (!type || !GAMES[type]) return null;
    // trận đấu bóng đá thường (không phải loạt phạt đền) → đá thật kiểu Hax
    if (type === 'penalty' && KN.Hax && !/(penalty|phat den|panenka|luan luu|da phat)/.test(fold(ev.title + ' ' + choice.label))) type = 'hax';
    if (type === 'drive' && GAMES.race && /(dua xe|dua voi|dua mo to|dua toc do)/.test(fold(ev.title + ' ' + choice.label))) type = 'race';
    if (type === 'fight' && !foe) foe = ctx.jobId === 'vdv_vo' && /^s_job_vdv/.test(ev.id) ? 'vo' : ctx.age < 14 ? 'kid' : 'thug';
    return { type, foe, need: odds.need, ctx, title: ev.title, label: choice.label, level: quizLevel(ev, ctx), field: fieldOf(ctx.jobId), mode: 'event' };
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
    scamchat: '💬 Nhắn tin dụ nạn nhân', stock: '📈 Lướt sóng', love: '💘 Tỏ tình', haggle: '🧧 Mặc cả', cpr: '🫀 Cấp cứu', cards: '🃏 Xì dách', sneak: '🌙 Vượt ngục', hoops: '🏀 Ném rổ', hax: '⚽ Đá bóng (Hax)',
  };

  // ------------------------------------------------------------------ khung chung
  let root = null, keyHandler = null, rafId = 0, timers = [], abortFn = null;
  function open(html) {
    close();
    root = document.createElement('div'); root.className = 'mini'; root.innerHTML = '<div class="mini-box">' + html + '</div>';
    document.body.appendChild(root);
    if (abortFn) addQuit(root);
    return root;
  }
  // nút ✖ Thoát góc trên: bỏ dở minigame → kết quả do số phận quyết định (thách đấu thì tính thua)
  function addQuit(el) { const b = document.createElement('button'); b.type = 'button'; b.className = 'mini-quit'; b.textContent = '✖ Thoát'; b.title = 'Bỏ dở minigame, để số phận quyết định'; b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); sfx('click'); if (abortFn) abortFn(); }; (el.querySelector('.mini-box') || el).appendChild(b); }
  function close() {
    cancelAnimationFrame(rafId); rafId = 0;
    timers.forEach((id) => clearInterval(id)); timers = [];
    if (keyHandler) { window.removeEventListener('keydown', keyHandler, true); window.removeEventListener('keyup', keyHandler, true); keyHandler = null; }
    if (root) { root.remove(); root = null; }
  }
  const every = (fn, ms) => { const id = setInterval(fn, ms); timers.push(id); return id; };
  function onKeys(fn) { keyHandler = (e) => { if (fn(e) !== false) { e.preventDefault(); e.stopPropagation(); } }; window.addEventListener('keydown', keyHandler, true); window.addEventListener('keyup', keyHandler, true); }
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
    chase: 'Bấm luân phiên ← → để chạy, bấm ↑ hoặc Space để nhảy qua chướng ngại. Tóm được tên kia trước khi hết giờ!',
    drive: '← → để chuyển làn, né ô tô, ổ gà, chó chạy qua đường. Va chạm 3 lần là hỏng chuyến. Trụ hết 25 giây.',
    fight: '← → di chuyển · J/Z đấm · K/X đá · L/C đỡ · Space né. Trên điện thoại dùng các nút bên dưới. Hạ đối thủ hoặc còn nhiều máu hơn khi hết giờ.',
    interview: '4 câu hỏi từ nhà tuyển dụng. Chọn câu trả lời khéo nhất trước khi hết giờ (phím 1–3).',
    cook: 'Khách tới gọi món. Bấm nguyên liệu đúng thứ tự công thức để làm món cho khách đang chọn. Sai là làm lại! Khách chờ lâu sẽ bỏ về. 45 giây.',
    stock: 'Giá chạy trong 25 giây. MUA khi đoán giá sắp lên, BÁN khi sắp xuống (↑/↓ hoặc nút). Cuối phiên tính lãi lỗ so với vốn ban đầu.',
    love: '3 câu hỏi thả thính: chọn câu trả lời ghi điểm. Cuối cùng là khoảnh khắc quyết định: bấm đúng lúc vạch vào vùng hồng.',
    haggle: 'Kéo thanh để chọn giá rồi bấm “Trả giá”. Trả quá thấp người bán sẽ mất kiên nhẫn và bỏ đi. Tối đa 6 lượt.',
    cpr: 'Bấm ÉP (Space) đúng nhịp khi vòng tròn khép lại, 15 lần mỗi chu kỳ. Sau đó bấm THỔI NGẠT (↑) 2 lần. Làm 2 chu kỳ.',
    hoops: '6 cú ném: lên rổ, tầm trung, ba điểm, ném phạt, ba điểm có hậu vệ và cú ném quyết định. Giữ Space để thanh lực dâng lên, thả tay khi vạch trắng nằm trong vùng xanh (ném càng xa càng cần nhiều lực). Có hậu vệ thì ném trước khi hắn bật nhảy!',
    sneak: 'Giữ Space để bò về hàng rào. Đèn vàng là lính gác sắp quay lại: thả tay ngay! Đèn đỏ mà còn bò là bị phát hiện (2 mạng). 40 giây trước khi trời sáng.',
    hax: 'Trận đấu nhìn từ trên xuống, 60 giây (trận lớn có đồng đội máy đá cùng). WASD / ↑↓←→ để chạy, Space / X để sút khi bóng sát người (giữ sút thì chạy chậm lại). Đưa bóng vào khung thành bên phải!',
    scamchat: 'Giao diện nhiều cửa sổ: Điện thoại (nhắn tin với nạn nhân), Hồ sơ giao dịch, Camera quản lý và Chỉ tiêu cuộc gọi. Gõ tin nhắn tự do hoặc bấm câu gợi ý. Làm quen để tăng niềm tin rồi mới nhắc chuyện tiền, khi nạn nhân đồng ý thì ghi đúng số tiền họ nói vào cửa sổ Hồ sơ. Quản lý luôn nhìn camera: bấm nút 📞 ở cửa sổ Chỉ tiêu để họ bớt nghi ngờ. Hoặc lén cảnh báo nạn nhân đây là lừa đảo, cứu được họ nhưng sẽ làm quản lý nổi giận.',
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
      const box = open('<div class="mini-result"><div class="mini-pct' + (ok ? ' ok' : ' bad') + '">' + pct + '%</div><p>' + esc(text) + '</p><p class="mini-goal">' + line + '</p><div class="mini-btns"><button type="button" class="btn btn-primary" data-ok>' + (duel ? 'Xong' : buy ? 'Xuống tiền →' : 'Xem kết quả →') + '</button></div></div>');
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
    if (KN.Mini) KN.Mini.lastOut = null;
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
    } finally { RNG = Math.random; }
  }

  // ------------------------------------------------------------------ khung canvas dùng chung
  // keys: dòng nhắc phím luôn hiện dưới khung chơi (chơi trên máy tính không cần nhớ màn hướng dẫn)
  function canvasGame(title, extraHtml, keys) {
    const box = open('<div class="mini-head"><b>' + title + '</b><small class="mini-hud"></small></div><canvas class="mini-cv" width="640" height="400"></canvas>' + (extraHtml || '') + (keys ? '<p class="mini-keys">⌨️ ' + keys + '</p>' : ''));
    const cv = box.querySelector('canvas'), c = cv.getContext('2d');
    return { box, cv, c, hud: box.querySelector('.mini-hud') };
  }
  function loop(fn) { let last = performance.now(); const tick = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt, now / 1000) !== false) rafId = requestAnimationFrame(tick); }; rafId = requestAnimationFrame(tick); }
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
      const pool = shuffle(BANK.filter((x) => x[3] <= lvl));
      const qs = []; for (let i = 0; i < 5; i++) qs.push(i % 2 === 0 || !pool.length ? mathQ(lvl) : (() => { const b = pool.pop(); return { q: b[0], a: b[1], w: b[2].slice() }; })());
      qs.forEach((q) => (q.opts = shuffle([q.a].concat(q.w))));
      const secs = 7 + smart / 14 + (lvl <= 1 ? 3 : 0), removeN = smart >= 85 ? 2 : smart >= 70 ? 1 : 0;
      let i = 0, ok = 0;
      const box = open('<div class="mini-head"><b>📝 Bài kiểm tra</b><small id="mqN"></small></div><div class="mini-bar"><i id="mqT"></i></div><p class="mini-q" id="mqQ"></p><div class="mini-ans" id="mqA"></div><p class="mini-keys">⌨️ Click vào đáp án hoặc bấm phím số <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> trước khi thanh thời gian hết.</p>');
      let timer = null;
      const show = () => {
        if (i >= qs.length) { clearInterval(timer); res({ score: ok / qs.length, text: 'Bạn trả lời đúng ' + ok + '/' + qs.length + ' câu.' }); return; }
        const q = qs[i], opts = q.opts;
        const hide = new Set(q.w.slice(0, removeN));
        box.querySelector('#mqN').textContent = 'Câu ' + (i + 1) + '/' + qs.length + ' · đúng ' + ok;
        box.querySelector('#mqQ').textContent = q.q;
        box.querySelector('#mqA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-o="' + esc(o) + '"' + (hide.has(o) ? ' disabled style="opacity:.25"' : '') + '><span>' + (k + 1) + '</span>' + esc(o) + '</button>').join('');
        let left = secs; const bar = box.querySelector('#mqT'); bar.style.width = '100%';
        clearInterval(timer);
        let answered = false;
        const answer = (o) => {
          if (answered) return; answered = true;
          clearInterval(timer);
          const right = o === q.a; if (right) { ok++; sfx('good'); } else sfx('bad');
          box.querySelectorAll('.mini-opt').forEach((b) => { if (b.dataset.o === q.a) b.classList.add('right'); else if (b.dataset.o === o) b.classList.add('wrong'); b.disabled = true; });
          i++; setTimeout(show, 650);
        };
        timer = every(() => { left -= 0.1; bar.style.width = Math.max(0, left / secs * 100) + '%'; if (left <= 0) answer(null); }, 100);
        box.querySelectorAll('.mini-opt').forEach((b) => (b.onclick = () => answer(b.dataset.o)));
        onKeysOnce((e) => { const n = +e.key; if (n >= 1 && n <= 4) { const b = box.querySelectorAll('.mini-opt')[n - 1]; if (b && !b.disabled) answer(b.dataset.o); return true; } return false; });
      };
      show();
    });
  }

  // ------------------------------------------------------------------ 2. sút phạt đền
  function penalty(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health, { cv, c, hud } = canvasGame('⚽ Sút phạt đền', '', 'Bấm <kbd>Space</kbd> (hoặc chạm màn hình) 3 lần: lần 1 chốt hướng ngang · lần 2 chốt độ cao · lần 3 chốt lực (vạch cam nằm trong vùng xanh)');
      const speed = 1.6 - hp / 100 * 0.9; // sức khỏe cao → tâm ngắm chạy chậm
      const keeperSkill = clamp(0.25 + p.need * 0.55, 0.25, 0.75);
      let shot = 0, goals = 0, phase = 0, t = 0, ax = 0, ay = 0, pw = 0, kx = 320, ky = 200, kTarget = 320, result = '', ball = null;
      const GX = 140, GY = 90, GW = 360, GH = 170;
      const next = () => { phase = 0; t = rnd() * 3; ax = ay = pw = 0; kx = 320; ky = 200; ball = null; result = ''; };
      tapper(cv, () => {
        if (phase === 0) { ax = 0.5 + 0.5 * Math.sin(t * 2.6 / speed); phase = 1; sfx('click'); }
        else if (phase === 1) { ay = 0.5 + 0.5 * Math.sin(t * 2.9 / speed); phase = 2; sfx('click'); }
        else if (phase === 2) {
          pw = 0.5 + 0.5 * Math.sin(t * 3.4 / speed); phase = 3; sfx('kick');
          const sweet = 0.18 + hp / 100 * 0.12; // vùng lực chuẩn quanh 0.75
          const power = Math.abs(pw - 0.75) < sweet ? 'ok' : pw < 0.75 ? 'weak' : 'over';
          const tx = GX + ax * GW, ty = GY + ay * GH;
          const outside = power === 'over' && rnd() < 0.7;
          // thủ môn đoán hướng: càng giỏi càng hay đoán đúng; bóng sát góc khó cản
          const corner = Math.abs(ax - 0.5) * 2 * 0.6 + Math.abs(ay - 0.5) * 0.4;
          const guess = rnd() < keeperSkill ? tx : GX + rnd() * GW;
          kTarget = guess;
          const reach = 70 * (power === 'weak' ? 1.5 : 1);
          const saved = !outside && Math.abs(guess - tx) < reach * (1 - corner * 0.6) && rnd() < 0.85;
          const goal = !outside && !saved;
          ball = { x: 320, y: 360, tx: outside ? tx + (ax < 0.5 ? -60 : 60) : tx, ty: outside ? GY - 40 : ty, goal, saved };
          result = goal ? 'VÀOOOO!' : saved ? 'Thủ môn cản phá!' : 'Ra ngoài!';
          if (goal) goals++;
          shot++;
          setTimeout(() => { if (shot >= 5) { setTimeout(() => res({ score: goals / 5, text: 'Bạn sút thành công ' + goals + '/5 quả phạt đền.' }), 300); phase = 9; } else next(); }, 1400);
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
        const cx = phase >= 1 ? GX + ax * GW : GX + (0.5 + 0.5 * Math.sin(t * 2.6 / speed)) * GW;
        const cy = phase >= 2 ? GY + ay * GH : phase === 1 ? GY + (0.5 + 0.5 * Math.sin(t * 2.9 / speed)) * GH : GY + GH / 2;
        if (phase < 3) { c.strokeStyle = '#ff3b3b'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 16, 0, 7); c.moveTo(cx - 24, cy); c.lineTo(cx + 24, cy); c.moveTo(cx, cy - 24); c.lineTo(cx, cy + 24); c.stroke(); }
        if (phase === 2) { const v = 0.5 + 0.5 * Math.sin(t * 3.4 / speed), sweet = 0.18 + hp / 100 * 0.12; c.fillStyle = '#222'; c.fillRect(600, 100, 22, 240); c.fillStyle = '#39cf98'; c.fillRect(600, 100 + (1 - 0.75 - sweet) * 240, 22, sweet * 2 * 240); c.fillStyle = '#ffb347'; c.fillRect(596, 100 + (1 - v) * 240 - 3, 30, 6); }
        const bx = ball ? ball.x : 320, by = ball ? ball.y : 360;
        if (ball) { ball.x += (ball.tx - ball.x) * Math.min(1, dt * 6); ball.y += (ball.ty - ball.y) * Math.min(1, dt * 6); }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, ball ? 10 : 13, 0, 7); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(bx, by, 4, 0, 7); c.fill();
        if (result) bigText(c, result, 60, ball && ball.goal ? '#ffd23f' : '#fff', 38);
        hud.textContent = 'Quả ' + Math.min(shot + 1, 5) + '/5 · vào ' + goals + ' · ' + (phase === 0 ? 'chốt hướng ngang' : phase === 1 ? 'chốt độ cao' : phase === 2 ? 'chốt lực' : '');
      });
    });
  }

  // ------------------------------------------------------------------ 3. bắt penalty (thủ môn)
  function keeper(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🧤 Bắt penalty', '<div class="mini-pad"><button type="button" data-c="0">◀ Trái <kbd>←</kbd></button><button type="button" data-c="1">⬇ Giữa <kbd>↓</kbd></button><button type="button" data-c="2">Phải ▶ <kbd>→</kbd></button></div>', 'Nhìn bóng bay rồi đổ người: <kbd>←</kbd> trái · <kbd>↓</kbd> giữa · <kbd>→</kbd> phải. Mỗi quả chỉ chọn được một lần.');
      const win = clamp(0.36 + hp / 100 * 0.3 - p.need * 0.12, 0.3, 0.7); // thời gian bóng bay = thời gian phản xạ
      const fakeP = clamp(0.15 + p.need * 0.35, 0.15, 0.5); // xác suất cầu thủ chạy đà “lừa” hướng
      const GX = 140, GY = 70, GW = 360, GH = 170;
      let shot = 0, saves = 0, phase = 'run', pt = 0, target = 1, look = 1, dive = null, ball = null, msg = '', t = 0;
      const next = () => { target = Math.floor(rnd() * 3); look = rnd() < fakeP ? (target + 1 + Math.floor(rnd() * 2)) % 3 : target; phase = 'run'; pt = 0; dive = null; ball = null; msg = ''; };
      next();
      const choose = (col) => { if (phase === 'end' || phase === 'res' || dive != null) return; dive = col; sfx('click'); };
      padBind(box, '[data-c]', (b) => choose(+b.dataset.c));
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); choose(clamp(Math.floor((e.clientX - r.left) / r.width * 3), 0, 2)); });
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const m = { ArrowLeft: 0, a: 0, A: 0, ArrowDown: 1, ArrowUp: 1, s: 1, S: 1, ' ': 1, ArrowRight: 2, d: 2, D: 2 }[e.key]; if (m == null) return false; choose(m); return true; });
      loop((dt) => {
        t += dt; pt += dt;
        if (phase === 'run' && pt >= 1.4) { phase = 'fly'; pt = 0; ball = { tx: GX + (target + 0.5) * GW / 3 + rand(-35, 35), ty: GY + rand(30, GH - 25) }; sfx('kick'); }
        else if (phase === 'fly' && pt >= win) {
          const saved = dive === target; if (saved) saves++; shot++;
          msg = saved ? pick(['CẢN PHÁ!', 'BẮT GỌN!', 'XUẤT THẦN!']) : dive == null ? 'Không kịp phản xạ!' : 'VÀO LƯỚI…';
          sfx(saved ? 'good' : 'bad'); phase = 'res'; pt = 0;
        } else if (phase === 'res' && pt >= 1.3) {
          if (shot >= 5) { phase = 'end'; const score = [0, 0.3, 0.55, 0.75, 0.9, 1][saves]; setTimeout(() => res({ score, text: 'Bạn cản phá ' + saves + '/5 quả.' }), 200); }
          else next();
        }
        c.fillStyle = '#3f8f3f'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#47a047' : '#3f8f3f'; c.fillRect(0, 240 + i * 18, 640, 18); }
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(GX, GY, GW, GH);
        c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(GX, GY, GW, GH);
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(GX + i * GW / 3, GY); c.lineTo(GX + i * GW / 3, GY + GH); c.stroke(); }
        // thủ môn (bạn)
        const kTx = dive == null ? 320 : GX + (dive + 0.5) * GW / 3;
        const kx = phase === 'run' && dive == null ? 320 + Math.sin(t * 2) * 10 : kTx;
        const tilt = dive == null || dive === 1 ? 0 : (dive === 0 ? -1 : 1) * 0.5;
        c.save(); c.translate(kx, GY + GH - 45); c.rotate(tilt);
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.top) || '#ffd23f'; c.fillRect(-20, -10, 40, 56);
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.skin) || '#f2c39a'; c.beginPath(); c.arc(0, -24, 14, 0, 7); c.fill();
        c.fillStyle = '#39cf98'; c.fillRect(-48, -14, 26, 12); c.fillRect(22, -14, 26, 12);
        c.restore();
        // cầu thủ đá: dáng chạy đà nghiêng về hướng “look”
        const kickX = 320 + (phase === 'run' ? (look - 1) * 26 * Math.min(1, pt / 1.1) : 0), kickY = 395 - (phase === 'run' ? Math.min(1, pt / 1.4) * 30 : 30);
        c.fillStyle = '#d63c3c'; c.fillRect(kickX - 14, kickY - 50, 28, 36); c.fillStyle = '#c98d64'; c.beginPath(); c.arc(kickX, kickY - 62, 11, 0, 7); c.fill();
        if (phase === 'run' && pt > 0.5) { c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(kickX, kickY - 80); c.lineTo(kickX + (look - 1) * 40, kickY - 100); c.stroke(); }
        // bóng
        let bx = 320, by = 340, br = 12;
        if (ball) { const k = phase === 'fly' ? Math.min(1, pt / win) : 1; bx = 320 + (ball.tx - 320) * k; by = 340 + (ball.ty - 340) * k; br = 12 - 4 * k; if (phase !== 'fly' && dive === target) { bx = kTx; by = GY + GH - 60; } }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(bx, by, br * 0.35, 0, 7); c.fill();
        if (msg) bigText(c, msg, 40, msg.includes('!') && !msg.startsWith('Không') ? '#ffd23f' : '#fff', 34);
        hud.textContent = 'Quả ' + Math.min(shot + 1, 5) + '/5 · cản ' + saves + (phase === 'run' ? (dive == null ? ' · nhìn dáng chạy đà…' : ' · đã đoán hướng') : '');
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
      const { box, cv, c, hud } = canvasGame('🏃 Chạy nước rút', '<div class="mini-pad"><button type="button" data-l>◀ TRÁI <kbd>←</kbd></button><button type="button" data-r>PHẢI ▶ <kbd>→</kbd></button></div>', 'Bấm luân phiên <kbd>←</kbd> <kbd>→</kbd> (hoặc <kbd>A</kbd> <kbd>D</kbd>) thật nhanh. Bấm một phím liên tục sẽ không chạy.');
      const step = 2.4 + hp / 100 * 1.6; // sức khỏe cao → mỗi nhịp chân đi xa hơn
      const rivals = [0, 1, 2].map((i) => ({ x: 0, v: 7 + p.need * 6 + i * 1.0 + rand(-0.6, 0.6) }));
      let me = 0, v = 0, last = null, t = -2.5, finished = false;
      const press = (side) => { if (t < 0 || finished || side === last) return; last = side; v += step; sfx('click'); };
      padBind(box, '[data-l]', () => press('l')); padBind(box, '[data-r]', () => press('r'));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { press('l'); return true; } if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { press('r'); return true; } return false; });
      loop((dt) => {
        t += dt;
        if (t > 0 && !finished) {
          v = Math.max(0, v - v * dt * 1.8); me += v * dt;
          rivals.forEach((r) => (r.x += r.v * dt * (0.9 + Math.sin(t * 3 + r.v) * 0.1)));
          if (me >= 100) { finished = true; const place = 1 + rivals.filter((r) => r.x >= 100).length; setTimeout(() => res({ score: [1, 0.66, 0.4, 0.15][place - 1], text: 'Bạn về đích thứ ' + place + '/4.' }), 900); }
          else if (rivals.every((r) => r.x >= 100) && t > 25) { finished = true; setTimeout(() => res({ score: me / 100 * 0.3, text: 'Bạn bị bỏ xa, về cuối.' }), 900); }
        }
        c.fillStyle = '#b5482c'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#c4553a' : '#b5482c'; c.fillRect(0, 70 + i * 75, 640, 75); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 70 + i * 75); c.lineTo(640, 70 + i * 75); c.stroke(); }
        c.fillStyle = '#fff'; c.fillRect(600, 70, 8, 300);
        const px = (x) => 30 + Math.min(100, x) / 100 * 560;
        rivals.forEach((r, i) => runner(c, px(r.x), 70 + (i + 1) * 75 + 40, ['#5b5fc7', '#2f9e9e', '#9b59b6'][i], 'Đối thủ', r.x));
        runner(c, px(me), 110, (p.ctx.appearance && p.ctx.appearance.top) || '#ffd23f', 'BẠN', me, p.ctx.appearance && p.ctx.appearance.skin);
        countdown(c, t, 'CHẠY!');
        hud.textContent = Math.round(Math.min(100, me)) + ' m · tốc độ ' + v.toFixed(1);
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
      const breathe = () => { if (t < 0 || done || stall > 0) return; o2 = 100; stall = 0.35; say('Hít…'); };
      padBind(box, '[data-s]', (b) => (b.dataset.s === 'b' ? breathe() : stroke(b.dataset.s)));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') stroke('l'); else if (k === 'ArrowRight' || k === 'd' || k === 'D') stroke('r'); else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') breathe(); else return false; return true; });
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        if (t > 0 && !done) {
          if (stall > 0) { stall -= dt; v *= Math.max(0, 1 - dt * 4); }
          o2 -= dt * 14;
          if (o2 <= 0) { o2 = 45; stall = 1.5; v = 0; say('SẶC NƯỚC!'); sfx('bad'); }
          v = Math.max(0, v - v * dt * 1.6); me += v * dt * 0.5;
          rivals.forEach((r) => (r.x += r.v * 0.5 * dt * (0.92 + Math.sin(t * 2 + r.v) * 0.08)));
          if (me >= LEN) { done = true; const place = 1 + rivals.filter((r) => r.x >= LEN).length; setTimeout(() => res({ score: [1, 0.6, 0.25][place - 1], text: 'Bạn chạm tường thứ ' + place + '/3 · ' + good + '/' + total + ' sải đúng nhịp.' }), 900); }
          else if (rivals.every((r) => r.x >= LEN) && t > 30) { done = true; setTimeout(() => res({ score: me / LEN * 0.25, text: 'Bạn đuối sức, về cuối.' }), 900); }
        }
        c.fillStyle = '#1d6fa5'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 3; i++) { c.fillStyle = i % 2 ? '#2280bd' : '#1d6fa5'; c.fillRect(0, 100 + i * 90, 640, 90); }
        c.strokeStyle = '#ffd23f'; c.setLineDash([10, 8]); c.lineWidth = 3; for (let i = 0; i <= 3; i++) { c.beginPath(); c.moveTo(0, 100 + i * 90); c.lineTo(640, 100 + i * 90); c.stroke(); } c.setLineDash([]);
        c.fillStyle = '#fff'; c.fillRect(604, 100, 6, 270);
        const px = (x) => 30 + Math.min(LEN, x) / LEN * 560;
        const swimmer = (x, y, col, label, ph) => { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - 24, y + 4, 26, 7, 0, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill(); c.strokeStyle = '#f2c39a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 18 * Math.cos(ph), y - 14 * Math.sin(ph)); c.stroke(); if (label) { c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText(label, x, y - 22); } };
        rivals.forEach((r, i) => swimmer(px(r.x), 145 + (i + 1) * 90, ['#9b59b6', '#2f9e9e'][i], 'Đối thủ', r.x * 2));
        swimmer(px(me), 145, '#ffd23f', 'BẠN', me * 2 + (t - lastT < 0.2 ? 2 : 0));
        // nhịp tay + ô-xy
        const ph = phase(); beatRing(c, 580, 50, ph, Math.min(ph, 1 - ph) < tol);
        c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.fillText('Bấm ← → khi vòng khép', 580, 96);
        c.fillStyle = '#111'; c.fillRect(20, 30, 200, 16); c.fillStyle = o2 < 30 ? '#ff5c5c' : '#9ad1ff'; c.fillRect(22, 32, 196 * Math.max(0, o2) / 100, 12);
        c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'left'; c.fillText('Ô-xy' + (o2 < 30 ? ' — BẤM SPACE ĐỂ THỞ!' : ' (Space để thở)'), 22, 64);
        if (msgT > 0) bigText(c, msg, 90, msg === 'SẶC NƯỚC!' ? '#ff6b6b' : '#ffd23f', 30);
        countdown(c, t, 'BƠI!');
        hud.textContent = Math.round(Math.min(LEN, me)) + '/' + LEN + ' m · đúng nhịp ' + good + '/' + total;
      });
    });
  }

  // ------------------------------------------------------------------ 7. rượt đuổi (chạy + nhảy chướng ngại)
  function chase(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🚓 Rượt đuổi', '<div class="mini-pad"><button type="button" data-k="l">◀ TRÁI <kbd>←</kbd></button><button type="button" data-k="j">⤴ NHẢY <kbd>Space</kbd></button><button type="button" data-k="r">PHẢI ▶ <kbd>→</kbd></button></div>', 'Bấm luân phiên <kbd>←</kbd> <kbd>→</kbd> để chạy · <kbd>Space</kbd> hoặc <kbd>↑</kbd> để nhảy qua thùng, xe đẩy, chó. Vấp là bị khựng lại!');
      const step = 2.2 + hp / 100 * 1.4, DUR = 22, GAP0 = 25, tv = 7 + p.need * 4;
      let me = 0, thief = GAP0, v = 0, last = null, t = -2, jump = 0, stun = 0, done = false, msg = '', msgT = 0;
      const obs = []; for (let x = 12; x < 420; x += rand(9, 17)) obs.push({ x, e: pick(['📦', '🛒', '🐕', '🪣', '🛞']), hit: false });
      const say = (m) => { msg = m; msgT = 0.8; };
      const press = (side) => { if (t < 0 || done || stun > 0 || side === last) return; last = side; v += step; sfx('click'); };
      const hop = () => { if (t < 0 || done || jump > 0 || stun > 0) return; jump = 0.55; sfx('click'); };
      padBind(box, '[data-k]', (b) => (b.dataset.k === 'j' ? hop() : press(b.dataset.k)));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') press('l'); else if (k === 'ArrowRight' || k === 'd' || k === 'D') press('r'); else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') hop(); else return false; return true; });
      loop((dt) => {
        t += dt; msgT = Math.max(0, msgT - dt);
        if (t > 0 && !done) {
          jump = Math.max(0, jump - dt);
          if (stun > 0) { stun -= dt; v = 0; }
          v = Math.max(0, v - v * dt * 1.6); me += v * dt;
          thief += tv * dt * (Math.sin(t * 1.3) > 0.85 ? 0.4 : 1);
          const o = obs.find((x) => !x.hit && Math.abs(x.x - me) < 0.6);
          if (o) { o.hit = true; if (jump <= 0.08) { stun = 0.7; v = 0; say('Vấp ngã!'); sfx('bad'); } }
          if (thief - me <= 1) { done = true; setTimeout(() => res({ score: 0.6 + 0.4 * clamp(1 - t / DUR, 0, 1), text: 'Bạn tóm được hắn sau ' + t.toFixed(1) + ' giây!' }), 700); }
          else if (t >= DUR) { done = true; const gap = thief - me; setTimeout(() => res({ score: clamp(0.5 * (1 - gap / GAP0), 0, 0.5), text: 'Hắn chạy thoát, bỏ xa bạn ' + Math.round(gap) + ' m.' }), 700); }
        }
        c.fillStyle = '#2b2f45'; c.fillRect(0, 0, 640, 400);
        for (let i = 0; i < 8; i++) { const bx = ((i * 110 - me * 6) % 880 + 880) % 880 - 100; c.fillStyle = '#353a56'; c.fillRect(bx, 120 + (i % 3) * 20, 90, 200); }
        c.fillStyle = '#4a4f6a'; c.fillRect(0, 320, 640, 80);
        const sx = (w) => 140 + (w - me) * 18;
        obs.forEach((o) => { const x = sx(o.x); if (x > -30 && x < 670) { c.font = '30px sans-serif'; c.textAlign = 'center'; c.globalAlpha = o.hit && x < 140 ? 0.4 : 1; c.fillText(o.e, x, 318); c.globalAlpha = 1; } });
        const tx = sx(thief);
        if (tx < 620) runner(c, tx, 300, '#1c1c1c', 'Tên trộm', thief);
        else { c.fillStyle = '#ffd23f'; c.font = '800 18px sans-serif'; c.textAlign = 'right'; c.fillText('Tên trộm → ' + Math.round(thief - me) + ' m', 630, 290); }
        const jy = jump > 0 ? Math.sin(Math.PI * (0.55 - jump) / 0.55) * 60 : 0;
        runner(c, 140, 300 - jy, (p.ctx.appearance && p.ctx.appearance.top) || '#2d6cdf', 'BẠN', me, p.ctx.appearance && p.ctx.appearance.skin);
        if (msgT > 0) bigText(c, msg, 90, '#ff6b6b', 32);
        countdown(c, t, 'ĐUỔI!');
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(DUR - Math.max(0, t))) + 's · cách ' + Math.max(0, Math.round(thief - me)) + ' m';
      });
    });
  }

  // ------------------------------------------------------------------ 8. lái xe né chướng ngại
  function drive(p) {
    return new Promise((res) => {
      const hp = p.ctx.stats.health;
      const { box, cv, c, hud } = canvasGame('🛵 Lái xe', '<div class="mini-pad"><button type="button" data-d="-1">◀ Trái <kbd>←</kbd></button><button type="button" data-d="1">Phải ▶ <kbd>→</kbd></button></div>', '<kbd>←</kbd> <kbd>→</kbd> (hoặc <kbd>A</kbd> <kbd>D</kbd>) để chuyển làn, né ô tô, ổ gà, chó, rào chắn. Va 3 lần là hỏng chuyến.');
      const LX = [220, 320, 420], DUR = 25, PY = 320;
      const base = (240 + p.need * 170) * (1.15 - hp / 100 * 0.3);
      const KINDS = [{ e: '🚗', w: 46, h: 60, car: 1 }, { e: '🚚', w: 52, h: 70, car: 1 }, { e: '🕳️', w: 40, h: 30 }, { e: '🐕', w: 36, h: 32 }, { e: '🚧', w: 46, h: 34 }, { e: '🛵', w: 34, h: 50, car: 1 }];
      let lane = 1, px = 320, t = -1.5, obs = [], spawn = 0, hits = 0, inv = 0, done = false, scroll = 0;
      const move = (d) => { if (done) return; lane = clamp(lane + d, 0, 2); sfx('click'); };
      padBind(box, '[data-d]', (b) => move(+b.dataset.d));
      cv.addEventListener('pointerdown', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); move((e.clientX - r.left) / r.width < 0.5 ? -1 : 1); });
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1); else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1); else return false; return true; });
      const end = (score, text) => { done = true; setTimeout(() => res({ score, text }), 800); };
      loop((dt) => {
        t += dt;
        px += (LX[lane] - px) * Math.min(1, dt * 14);
        const v = base + Math.max(0, t) * 4;
        if (t > 0 && !done) {
          scroll += v * dt; spawn -= dt; inv = Math.max(0, inv - dt);
          if (spawn <= 0) {
            spawn = rand(0.5, 0.95) * 480 / v;
            // luôn chừa ít nhất một làn trống
            const near = [...new Set(obs.filter((o) => o.y < 90).map((o) => o.l))];
            const free = [0, 1, 2].filter((x) => !near.includes(x));
            const l = near.length >= 2 ? pick(near) : pick(free.length ? free : [0, 1, 2]);
            obs.push(Object.assign({ l, y: -50, hit: false }, pick(KINDS)));
          }
          obs.forEach((o) => (o.y += v * (o.car ? 0.7 : 1) * dt));
          obs = obs.filter((o) => o.y < 470);
          if (inv <= 0) {
            const h = obs.find((o) => !o.hit && Math.abs(LX[o.l] - px) < o.w / 2 + 14 && Math.abs(o.y - PY) < o.h / 2 + 22);
            if (h) { h.hit = true; hits++; inv = 1.2; sfx('bad'); if (hits >= 3) end(clamp(t / DUR * 0.4, 0, 0.4), 'Bạn va chạm 3 lần, phải dừng xe giữa đường.'); }
          }
          if (t >= DUR && !done) end([1, 0.75, 0.5][hits], hits ? 'Tới nơi, va quệt ' + hits + ' lần.' : 'Tới nơi an toàn, không một vết xước!');
        }
        c.fillStyle = '#4f8a3a'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#3b3e48'; c.fillRect(160, 0, 320, 400);
        c.fillStyle = '#fff'; c.fillRect(160, 0, 5, 400); c.fillRect(475, 0, 5, 400);
        c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = -1; i < 9; i++) { const y = ((i * 60 + scroll) % 480) - 60; c.fillRect(268, y, 4, 30); c.fillRect(368, y, 4, 30); }
        c.font = '40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        obs.forEach((o) => { c.globalAlpha = o.hit ? 0.4 : 1; c.fillText(o.e, LX[o.l], o.y); c.globalAlpha = 1; });
        c.globalAlpha = inv > 0 && Math.sin(t * 30) > 0 ? 0.4 : 1;
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.top) || '#2d6cdf'; c.fillRect(px - 12, PY - 22, 24, 44);
        c.fillStyle = '#111'; c.fillRect(px - 5, PY - 34, 10, 14); c.fillRect(px - 5, PY + 20, 10, 14);
        c.fillStyle = (p.ctx.appearance && p.ctx.appearance.skin) || '#f2c39a'; c.beginPath(); c.arc(px, PY - 4, 9, 0, 7); c.fill();
        c.globalAlpha = 1; c.textBaseline = 'alphabetic';
        countdown(c, t, 'CHẠY!');
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(DUR - Math.max(0, t))) + 's · va chạm ' + hits + '/3 · ' + Math.round(v / 6) + ' km/h';
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
      const ATK = { punch: { t: 0.28, hit: 0.14, reach: 70, dmg: 7, cd: 0.35 }, kick: { t: 0.5, hit: 0.3, reach: 95, dmg: 13, cd: 0.7 } };
      const start = (f, a) => { if (f.act || f.cd > 0 || f.hurt > 0) return; if (a === 'dodge') { f.dodge = 0.35; f.cd = 0.6; f.x -= f.dir * 40; return; } f.act = a; f.actT = 0; f.hitDone = false; };
      const press = (k, down) => { if (k === 'left' || k === 'right' || k === 'block') keys[k] = down; else if (down) start(me, k); };
      box.querySelectorAll('[data-k]').forEach((b) => { b.onpointerdown = (e) => { e.preventDefault(); press(b.dataset.k, true); }; b.onpointerup = b.onpointerleave = () => press(b.dataset.k, false); });
      const map = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', j: 'punch', J: 'punch', z: 'punch', Z: 'punch', k: 'kick', K: 'kick', x: 'kick', X: 'kick', l: 'block', L: 'block', c: 'block', C: 'block', ' ': 'dodge' };
      onKeys((e) => { const k = map[e.key]; if (!k) return false; if (e.repeat && k !== 'left' && k !== 'right' && k !== 'block') return true; press(k, e.type === 'keydown'); return true; });
      const hitCheck = (a, b) => {
        if (!a.act || a.hitDone) return; const A = ATK[a.act];
        if (a.actT >= A.hit) {
          a.hitDone = true;
          if (Math.abs(a.x - b.x) <= A.reach && b.dodge <= 0) {
            let d = A.dmg * a.pow * rand(0.85, 1.15); if (b.block) d *= 0.2;
            b.hp = Math.max(0, b.hp - d); b.hurt = b.block ? 0.08 : 0.3; b.x += a.dir * (b.block ? 6 : 22); sfx(b.block ? 'click' : 'bad');
            floating.push({ x: b.x, y: 130, txt: b.block ? 'đỡ' : '-' + Math.round(d), life: 0.8, col: b.block ? '#9ad1ff' : '#ff6b6b' });
          }
        }
      };
      let aiT = 0;
      loop((dt) => {
        if (!over) t += dt;
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
            else if (aiT <= 0) { aiT = (rand(0.6, 1.25) - foeLvl * 0.3) / F.rate; const r = rnd(); if (me.act && r < (0.35 + foeLvl * 0.3) * Math.min(1.6, F.guard)) foe.block = true; else start(foe, dist < 72 && r < 0.65 ? 'punch' : 'kick'); }
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
          if (f.act === 'kick') c.lineTo(x + d * (20 + a * 60), y - 30 - a * 25); else c.lineTo(x + 14, y); c.stroke();
          c.fillStyle = f.col; c.fillRect(x - 17, y - 112, 34, 62);
          c.strokeStyle = f.skin; c.lineWidth = 8; c.beginPath();
          let hx = x + d * 26, hy = y - 82;
          if (f.block) { c.moveTo(x + d * 8, y - 100); c.lineTo(x + d * 26, y - 120); c.moveTo(x + d * 2, y - 96); c.lineTo(x + d * 24, y - 108); hx = x + d * 26; hy = y - 120; }
          else if (f.act === 'punch') { c.moveTo(x + d * 10, y - 100); hx = x + d * (28 + a * 42); hy = y - 104; c.lineTo(hx, hy); c.moveTo(x - d * 8, y - 98); c.lineTo(x + d * 6, y - 84); }
          else { c.moveTo(x + d * 12, y - 100); c.lineTo(x + d * 26, y - 82); c.moveTo(x - d * 10, y - 100); c.lineTo(x + d * 4, y - 82); }
          c.stroke();
          if (knife) { c.strokeStyle = '#d8dde6'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + d * 18, hy - 6); c.stroke(); }
          c.fillStyle = f.skin; c.beginPath(); c.arc(x, y - 128, 16, 0, 7); c.fill();
          c.fillStyle = '#111'; c.beginPath(); c.arc(x + d * 6, y - 131, 2.5, 0, 7); c.fill();
          c.restore();
          c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText(label, x, y - 152);
        };
        drawF(foe, F.name, F.knife); drawF(me, 'BẠN');
        const bar = (x, f, col) => { c.fillStyle = '#111'; c.fillRect(x, 20, 260, 18); c.fillStyle = col; c.fillRect(x + 2, 22, 256 * f.hp / f.max, 14); };
        bar(20, me, '#39cf98'); bar(360, foe, '#ff5c5c');
        c.fillStyle = '#fff'; c.font = '700 14px sans-serif'; c.textAlign = 'left'; c.fillText('BẠN ' + Math.round(me.hp), 22, 56); c.textAlign = 'right'; c.fillText(F.name.toUpperCase() + ' ' + Math.round(foe.hp), 618, 56);
        c.textAlign = 'center'; c.font = '800 26px "Baloo 2", sans-serif'; c.fillText(String(Math.max(0, Math.ceil(45 - t))), 320, 36);
        floating = floating.filter((f) => (f.life -= dt) > 0);
        floating.forEach((f) => { c.globalAlpha = Math.min(1, f.life * 2); c.fillStyle = f.col; c.font = '800 22px "Baloo 2", sans-serif'; c.fillText(f.txt, f.x, f.y - (0.8 - f.life) * 50); c.globalAlpha = 1; });
        if (over) bigText(c, foe.hp <= 0 ? 'K.O.!' : me.hp <= 0 ? 'Bị hạ!' : 'Hết giờ!', 210, foe.hp <= 0 ? '#ffd23f' : me.hp <= 0 ? '#ff6b6b' : '#fff', 54);
        hud.textContent = 'J/Z đấm · K/X đá · L/C đỡ · Space né';
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
  function ivKind(p) {
    const t = fold((p.title || '') + ' ' + (p.label || ''));
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
      let i = 0, sum = 0, timer = null;
      const box = open('<div class="mini-head"><b>💼 Phỏng vấn</b><small id="ivN"></small></div><div class="mini-bar"><i id="ivT"></i></div><div class="iv-boss"><span>🧑‍💼</span><p id="ivQ"></p></div><div class="mini-ans one" id="ivA"></div><p class="mini-tip" id="ivR"></p><p class="mini-keys">⌨️ Click câu trả lời hoặc bấm phím số <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. Chọn câu khéo léo, chuyên nghiệp nhất.</p>');
      const show = () => {
        if (i >= qs.length) { clearInterval(timer); const score = clamp(sum / qs.length + (st.looks - 50) / 500, 0, 1); res({ score, text: score >= 0.75 ? 'Buổi phỏng vấn rất suôn sẻ, nhà tuyển dụng gật gù liên tục.' : score >= 0.45 ? 'Buổi phỏng vấn tạm ổn, có vài câu hơi lúng túng.' : 'Buổi phỏng vấn khá tệ, không khí ngượng ngùng.' }); return; }
        const q = qs[i], opts = shuffle([[q[1], 1], [q[2], 0.45], [q[3], 0]]);
        box.querySelector('#ivN').textContent = 'Câu ' + (i + 1) + '/' + qs.length;
        box.querySelector('#ivQ').textContent = q[0];
        box.querySelector('#ivA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-v="' + o[1] + '"' + (hint && o[1] === 0 ? ' style="opacity:.45" title="Linh cảm: câu này không ổn"' : '') + '><span>' + (k + 1) + '</span>' + esc(o[0]) + (hint && o[1] === 0 ? ' 💡' : '') + '</button>').join('');
        let left = secs, answered = false; const bar = box.querySelector('#ivT'); bar.style.width = '100%';
        const answer = (v, btn) => {
          if (answered) return; answered = true; clearInterval(timer);
          sum += v; sfx(v === 1 ? 'good' : v > 0 ? 'click' : 'bad');
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
      let i = 0, sum = 0, timer = null;
      const box = open('<div class="mini-head"><b>' + C.title + '</b><small id="ivN"></small></div><div class="mini-bar"><i id="ivT"></i></div><div class="iv-boss"><span>' + C.face + '</span><p id="ivQ"></p></div><div class="mini-ans one" id="ivA"></div><p class="mini-tip" id="ivR"></p><p class="mini-keys">⌨️ Click câu trả lời hoặc bấm phím số <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. ' + C.tip + '</p>');
      const show = () => {
        if (i >= qs.length) { clearInterval(timer); const score = clamp(sum / qs.length + (st.happy - 50) / 600, 0, 1); res({ score, text: score >= 0.75 ? C.end[0] : score >= 0.45 ? C.end[1] : C.end[2] }); return; }
        const q = qs[i], opts = shuffle([[q[1], 1], [q[2], 0.45], [q[3], 0]]);
        box.querySelector('#ivN').textContent = 'Lượt ' + (i + 1) + '/' + qs.length;
        box.querySelector('#ivQ').textContent = q[0];
        box.querySelector('#ivA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-v="' + o[1] + '"' + (hint && o[1] === 0 ? ' style="opacity:.45"' : '') + '><span>' + (k + 1) + '</span>' + esc(o[0]) + '</button>').join('');
        let left = secs, answered = false; const bar = box.querySelector('#ivT'); bar.style.width = '100%';
        const answer = (v, btn) => {
          if (answered) return; answered = true; clearInterval(timer); sum += v; sfx(v === 1 ? 'good' : v > 0 ? 'click' : 'bad');
          box.querySelectorAll('.mini-opt').forEach((b) => { b.disabled = true; if (b === btn) b.classList.add(v === 1 ? 'right' : v > 0 ? 'mid' : 'wrong'); });
          box.querySelector('#ivR').textContent = v === 1 ? pick(C.good) : v > 0 ? pick(C.mid) : btn ? pick(C.bad) : 'Bạn ngập ngừng mãi không nói được gì.';
          i++; setTimeout(show, 1000);
        };
        timer = every(() => { left -= 0.1; bar.style.width = Math.max(0, left / secs * 100) + '%'; if (left <= 0) answer(0, null); }, 100);
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
      let queue = [], sel = 0, tray = [], served = 0, lost = 0, t = 0, nextC = 3, done = false, uid = 0, msg = 'Chọn khách rồi làm món theo công thức!';
      const spawn = () => queue.push({ id: ++uid, r: pick(RECIPES), left: pat, max: pat, face: pick(['👩', '👨', '👵', '👴', '🧑', '👧', '👦', '🧔', '👱']) });
      const render = () => {
        const cur = queue[sel];
        box.querySelector('#ckQ').innerHTML = queue.length ? queue.map((q, i) => '<button type="button" class="ck-c' + (i === sel ? ' on' : '') + '" data-q="' + i + '"><b>' + q.face + '</b><span>' + q.r.e + ' ' + q.r.n + '</span><i style="width:' + Math.max(0, q.left / q.max * 100) + '%;background:' + (q.left / q.max < 0.3 ? '#ff5c5c' : '#39cf98') + '"></i></button>').join('') : '<p class="mini-tip">Chưa có khách…</p>';
        box.querySelector('#ckT').innerHTML = (cur ? '<div class="ck-recipe">' + cur.r.e + ' <b>' + cur.r.n + ':</b> ' + cur.r.s.map((k, i) => '<span class="' + (i < tray.length ? 'ok' : i === tray.length && hint ? 'nx' : '') + '">' + ING[k][0] + ' ' + ING[k][1] + '</span>').join(' → ') + '</div>' : '') + '<small>' + esc(msg) + '</small>';
        box.querySelector('#ckH').textContent = 'Còn ' + Math.max(0, Math.ceil(DUR - t)) + 's · phục vụ ' + served + '/' + target + (lost ? ' · bỏ về ' + lost : '');
      };
      const add = (k) => {
        if (done) return; const cur = queue[sel]; if (!cur) return;
        if (cur.r.s[tray.length] === k) {
          tray.push(k); sfx('click');
          if (tray.length === cur.r.s.length) { served++; sfx('coin'); msg = pick(['Khách khen ngon! 😋', 'Ting ting! Đã thanh toán.', 'Khách hẹn mai quay lại!']); queue.splice(sel, 1); sel = 0; tray = []; }
        } else { tray = []; msg = 'Sai nguyên liệu, làm lại từ đầu!'; sfx('bad'); }
        render();
      };
      box.querySelector('#ckI').addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-g]'); if (b) { e.preventDefault(); add(b.dataset.g); } });
      box.querySelector('#ckQ').addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-q]'); if (b) { e.preventDefault(); if (sel !== +b.dataset.q) { sel = +b.dataset.q; tray = []; } render(); } });
      onKeys((e) => { if (e.type !== 'keydown') return false; const n = +e.key; if (n >= 1 && n <= 4 && queue[n - 1]) { if (sel !== n - 1) { sel = n - 1; tray = []; } render(); return true; } return false; });
      spawn(); spawn(); render();
      every(() => {
        if (done) return; t += 0.1; nextC -= 0.1;
        if (nextC <= 0 && queue.length < 4) { spawn(); nextC = rand(3.2, 4.8) - p.need * 1.2; }
        queue.forEach((q) => (q.left -= 0.1));
        if (queue.some((q) => q.left <= 0)) {
          const curId = queue[sel] && queue[sel].id;
          lost += queue.filter((q) => q.left <= 0).length; queue = queue.filter((q) => q.left > 0);
          const ni = queue.findIndex((q) => q.id === curId); if (ni < 0) { sel = 0; tray = []; } else sel = ni;
          msg = 'Một khách chờ lâu quá, bỏ về! 😤'; sfx('bad');
        }
        if (t >= DUR) { done = true; const score = clamp(served / target - lost * 0.04, 0, 1); setTimeout(() => res({ score, text: 'Bạn phục vụ ' + served + ' khách' + (lost ? ', ' + lost + ' khách bỏ về' : '') + ' (mục tiêu ' + target + ').' }), 400); }
        render();
      }, 100);
    });
  }

  // ------------------------------------------------------------------ 12. lướt sóng cổ phiếu
  function stock(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, DUR = 25, sig = 0.007 + p.need * 0.008;
      const { box, c, hud } = canvasGame('📈 Lướt sóng', '<div class="mini-pad"><button type="button" data-b="buy">🟢 MUA hết <kbd>↑</kbd></button><button type="button" data-b="sell">🔴 BÁN hết <kbd>↓</kbd></button></div>', '<kbd>↑</kbd> (hoặc <kbd>B</kbd>) mua hết khi đoán giá sắp lên · <kbd>↓</kbd> (hoặc <kbd>S</kbd>) bán hết khi đoán giá sắp xuống. Hết giờ tự bán, tính lãi lỗ.');
      let t = -1.5, price = 100, cash = 100, sh = 0, hist = [100], mu = 0, regT = 0, acc = 0, marks = [], done = false, trendHint = 0;
      const N = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
      const val = () => cash + sh * price;
      const buy = () => { if (done || t < 0 || cash <= 0) return; sh += cash * 0.998 / price; cash = 0; marks.push({ i: hist.length - 1, b: 1 }); sfx('coin'); };
      const sell = () => { if (done || t < 0 || sh <= 0) return; cash += sh * price * 0.998; sh = 0; marks.push({ i: hist.length - 1, b: 0 }); sfx('click'); };
      padBind(box, '[data-b]', (b) => (b.dataset.b === 'buy' ? buy() : sell()));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'ArrowUp' || k === 'b' || k === 'B' || k === '1') buy(); else if (k === 'ArrowDown' || k === 's' || k === 'S' || k === '2') sell(); else return false; return true; });
      loop((dt) => {
        t += dt;
        if (t > 0 && !done) {
          acc += dt; regT -= dt;
          if (regT <= 0) { regT = rand(2.5, 5); mu = pick([0.006, 0.0045, -0.006, -0.0075, 0, 0.001]); trendHint = rnd() < 0.7 ? Math.sign(mu) : -Math.sign(mu); }
          while (acc >= 0.1) { acc -= 0.1; price = Math.max(5, price * Math.exp(mu + sig * N())); hist.push(price); }
          if (t >= DUR) {
            done = true; if (sh > 0) { cash += sh * price * 0.998; sh = 0; }
            const r = val() / 100 - 1;
            setTimeout(() => res({ score: clamp(0.5 + r * 2.5, 0, 1), text: 'Tài khoản ' + (r >= 0 ? 'lãi ' : 'lỗ ') + Math.abs(r * 100).toFixed(1) + '% (giá cổ phiếu cả phiên ' + (price >= 100 ? 'tăng ' : 'giảm ') + Math.abs(price - 100).toFixed(1) + '%).' }), 700);
          }
        }
        c.fillStyle = '#0f1424'; c.fillRect(0, 0, 640, 400);
        const vis = hist.slice(-240), off = hist.length - vis.length, lo = Math.min(...vis) * 0.98, hi = Math.max(...vis) * 1.02;
        const X = (i) => 20 + (i - off) / 240 * 600, Y = (v) => 360 - (v - lo) / (hi - lo || 1) * 300;
        c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(20, 60 + i * 60); c.lineTo(620, 60 + i * 60); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(20, Y(100)); c.lineTo(620, Y(100)); c.stroke(); c.setLineDash([]);
        if (st.smarts >= 60 && vis.length > 20) { c.strokeStyle = '#ffb347'; c.lineWidth = 2; c.beginPath(); for (let i = 20; i < hist.length; i++) { if (i < off) continue; const m = hist.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20; i === Math.max(20, off) ? c.moveTo(X(i), Y(m)) : c.lineTo(X(i), Y(m)); } c.stroke(); }
        c.strokeStyle = price >= (vis[0] || 100) ? '#39cf98' : '#ff5c5c'; c.lineWidth = 2.5; c.beginPath(); vis.forEach((v, i) => (i ? c.lineTo(X(i + off), Y(v)) : c.moveTo(X(i + off), Y(v)))); c.stroke();
        marks.forEach((m) => { if (m.i < off) return; c.fillStyle = m.b ? '#39cf98' : '#ff5c5c'; c.beginPath(); c.arc(X(m.i), Y(hist[m.i]), 6, 0, 7); c.fill(); });
        c.fillStyle = '#fff'; c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'left'; c.fillText('Giá ' + price.toFixed(2), 24, 36);
        c.textAlign = 'right'; c.fillStyle = sh > 0 ? '#39cf98' : '#9ad1ff'; c.fillText(sh > 0 ? '📦 Đang giữ cổ phiếu' : '💵 Đang cầm tiền', 616, 36);
        if (st.smarts >= 80 && t > 0) { c.font = '700 15px sans-serif'; c.fillStyle = '#ffd23f'; c.fillText('Dự báo: ' + (trendHint > 0 ? '↗ tăng' : trendHint < 0 ? '↘ giảm' : '→ đi ngang'), 616, 58); }
        countdown(c, t, 'MỞ PHIÊN!');
        const r = val() / 100 - 1;
        hud.textContent = 'Còn ' + Math.max(0, Math.ceil(DUR - Math.max(0, t))) + 's · tài sản ' + (r >= 0 ? '+' : '') + (r * 100).toFixed(1) + '%';
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
      let heart = clamp(30 + (st.looks - 50) / 2.5, 10, 55), round = 0, timer = null;
      const qs = shuffle(LOVE_Q.slice()).slice(0, 3);
      const box = open('<div class="mini-head"><b>💘 ' + (p.propose ? 'Cầu hôn' : 'Tỏ tình') + '</b><small id="lvH"></small></div><div class="lv-meter"><i id="lvM"></i></div><div class="mini-bar"><i id="lvT"></i></div><p class="mini-q" id="lvQ"></p><div class="mini-ans one" id="lvA"></div><p class="mini-tip" id="lvR"></p><p class="mini-keys">⌨️ Chọn câu trả lời bằng click hoặc phím <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. Màn cuối: bấm <kbd>Space</kbd> khi trái tim nằm trong vùng hồng.</p>');
      const upd = () => { heart = clamp(heart, 0, 100); box.querySelector('#lvM').style.width = heart + '%'; box.querySelector('#lvH').textContent = '❤️ Cảm tình ' + Math.round(heart) + '%'; };
      const ask = () => {
        if (round >= qs.length) { finale(); return; }
        const q = qs[round], opts = shuffle([[q[1], 22], [q[2], 6], [q[3], -16]]);
        box.querySelector('#lvQ').textContent = q[0].replace(/\{n\}/g, nm);
        box.querySelector('#lvA').innerHTML = opts.map((o, k) => '<button type="button" class="mini-opt" data-v="' + o[1] + '"><span>' + (k + 1) + '</span>' + esc(o[0].replace(/\{n\}/g, nm)) + '</button>').join('');
        let left = 8, answered = false; const bar = box.querySelector('#lvT');
        const answer = (v, btn) => {
          if (answered) return; answered = true; clearInterval(timer);
          heart += v; upd(); sfx(v > 10 ? 'good' : v > 0 ? 'click' : 'bad');
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
          setTimeout(() => res({ score: clamp(heart / 100, 0, 1), text: 'Cảm tình của ' + nm + ' dành cho bạn: ' + Math.round(heart) + '%.' }), 1200);
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
      const floor = clamp(0.86 + (p.need || 0.4) * 0.06 + rand(-0.03, 0.02) - (st.smarts - 50) / 1500, 0.8, 0.95);
      let ask = 1, pat = 100, round = 0, done = false;
      const fmt = (f) => (buyMode && p.price ? money(p.price * f) : Math.round(f * 100) + '% giá gốc');
      const seller = pick(['🧑‍🌾', '👨‍💼', '👩‍💼', '👵', '🧔']);
      const box = open('<div class="mini-head"><b>🧧 Mặc cả</b><small>' + esc(p.item || p.label) + ' · lượt <span id="hgN">1</span>/6</small></div>' +
        '<div class="iv-boss"><span>' + seller + '</span><p id="hgS">“' + (buyMode ? 'Giá này là chuẩn rồi, mua đi kẻo hết!' : 'Hàng tốt, giá mềm, không nói thách!') + '”</p></div>' +
        '<div class="hg-row"><small>Kiên nhẫn người bán</small><div class="mini-bar"><i id="hgP" style="width:100%;background:#39cf98"></i></div></div>' +
        '<p class="mini-goal">Người bán đang hỏi: <b id="hgA"></b></p>' +
        '<input type="range" id="hgR" class="hg-range" min="60" max="100" step="1" value="85"><p class="mini-goal">Bạn trả: <b id="hgO"></b></p>' +
        '<p class="mini-tip" id="hgM"></p>' +
        '<div class="mini-btns"><button type="button" class="btn btn-ghost" data-deal>🤝 Chốt giá đang hỏi</button><button type="button" class="btn btn-primary" data-offer>💬 Trả giá <kbd>Enter</kbd></button></div>' +
        '<p class="mini-keys">⌨️ Kéo thanh (hoặc <kbd>←</kbd> <kbd>→</kbd>) để chọn giá, <kbd>Enter</kbd> để trả giá. Trả thấp quá thanh kiên nhẫn tụt mạnh, về 0 là người bán bỏ đi.</p>');
      const R = box.querySelector('#hgR');
      const say = (s) => { box.querySelector('#hgS').textContent = '“' + s + '”'; };
      const upd = () => {
        R.max = String(Math.round(ask * 100)); if (+R.value > ask * 100) R.value = String(Math.round(ask * 100));
        box.querySelector('#hgA').textContent = fmt(ask); box.querySelector('#hgO').textContent = fmt(+R.value / 100);
        box.querySelector('#hgN').textContent = String(Math.min(6, round + 1));
        const pb = box.querySelector('#hgP'); pb.style.width = Math.max(0, pat) + '%'; pb.style.background = pat < 35 ? '#ff5c5c' : pat < 65 ? '#ffb347' : '#39cf98';
        box.querySelector('#hgM').textContent = st.smarts >= 70 ? (ask - floor > 0.05 ? '😏 Nhìn mặt người bán: còn bớt được kha khá' : ask - floor > 0.015 ? '🤔 Có vẻ còn bớt được chút ít' : '😤 Sát giá vốn rồi, đừng ép nữa') : '';
      };
      const deal = (f, why) => { if (done) return; done = true; const d = 1 - f; sfx(d > 0.05 ? 'cheer' : 'coin'); setTimeout(() => res({ score: clamp(buyMode ? d / 0.15 : d / 0.12, 0, 1), text: why + ' Giá chốt ' + fmt(f) + (d > 0.004 ? ' (bớt ' + Math.round(d * 100) + '%)' : '') + '.' }), 700); };
      const walk = () => { if (done) return; done = true; sfx('bad'); say('Thôi không bán nữa, đi chỗ khác mà mua!'); setTimeout(() => res({ score: 0, text: 'Người bán phẩy tay bỏ đi.' + (buyMode ? ' Bạn năn nỉ mãi mới được mua lại đúng giá gốc.' : '') }), 900); };
      const offer = () => {
        if (done) return;
        const o = Math.min(ask, +R.value / 100); round++;
        if (o >= ask - 0.004) { deal(o, 'Người bán gật đầu.'); return; }
        if (o >= floor) {
          const na = o + (ask - o) * rand(0.35, 0.6); pat -= 6;
          if (na - o < 0.015) { deal(o, 'Người bán thở dài: “Thôi, bán cho lấy may!”'); return; }
          ask = na; say(pick(['Thêm chút nữa đi, lời lãi gì đâu!', 'Bớt thế này là hết cỡ rồi đấy!', fmt(ask) + ' thì lấy, không là thôi.'])); sfx('click');
        } else {
          pat -= 12 + (floor - o) * 260; ask = Math.max(floor, ask - rand(0.004, 0.012));
          say(pick(['Trả thế thì lỗ vốn à!', 'Đùa à? Giá đó tôi nhập còn không được!', 'Trả giá kiểu đấy ai bán!'])); sfx('bad');
        }
        if (pat <= 0) { walk(); return; }
        if (round >= 6) { deal(ask, 'Người bán chốt: “Giá cuối rồi đấy!”'); return; }
        upd();
      };
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
      const { box, c, hud } = canvasGame('🫀 Cấp cứu', '<div class="mini-pad"><button type="button" data-k="push">🫸 ÉP TIM <kbd>Space</kbd></button><button type="button" data-k="air">🌬️ THỔI NGẠT <kbd>↑</kbd></button></div>', '<kbd>Space</kbd> ép tim mỗi khi vòng cam co sát vòng trắng (15 lần) · khi hiện chữ THỔI NGẠT thì bấm <kbd>↑</kbd> 2 lần. Làm 2 chu kỳ.');
      let t = -2, cyc = 0, cycStart = 0.4, k = 0, mode = 'c', bStart = 0, bCount = 0, breaths = 0, comp = [], squeeze = 0, done = false, msg = '', msgT = 0, ecg = [];
      const say = (m) => { msg = m; msgT = 0.6; };
      const grade = (err) => (err < tol ? 1 : err < tol * 2 ? 0.5 : 0);
      const push = () => {
        if (done || t < 0) return;
        if (mode !== 'c') { say('Đang tới lượt thổi ngạt!'); return; }
        squeeze = 0.18;
        const rel = t - cycStart, kk = Math.round(rel / T);
        if (kk < k || kk > 14) { say('Nhanh quá!'); return; }
        while (k < kk) { comp.push(0); k++; }
        const g = grade(Math.abs(rel - kk * T)); comp.push(g); k = kk + 1;
        if (g === 1) sfx('click'); else say(rel < kk * T ? 'Hơi sớm' : 'Hơi trễ');
      };
      const air = () => { if (done || t < 0) return; if (mode === 'b' && bCount < 2) { bCount++; sfx('click'); say('Thổi ' + bCount + '/2'); } else if (mode === 'c') say('Chưa tới lượt thổi!'); };
      padBind(box, '[data-k]', (b) => (b.dataset.k === 'push' ? push() : air()));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const kk = e.key; if (kk === ' ' || kk === 'Enter' || kk === 'j' || kk === 'J') push(); else if (kk === 'ArrowUp' || kk === 'b' || kk === 'B' || kk === 'w' || kk === 'W') air(); else return false; return true; });
      loop((dt) => {
        t += dt; squeeze = Math.max(0, squeeze - dt); msgT = Math.max(0, msgT - dt);
        if (t > 0 && !done) {
          if (mode === 'c') {
            const rel = t - cycStart;
            while (k <= 14 && rel > k * T + T / 2) { comp.push(0); k++; say('Lỡ nhịp!'); }
            if (k > 14) { mode = 'b'; bStart = t; bCount = 0; say('THỔI NGẠT 2 LẦN!'); }
          } else if (mode === 'b' && t - bStart > 2.6) {
            breaths += bCount; cyc++;
            if (cyc >= 2) {
              done = true; const cs = comp.reduce((a, b) => a + b, 0) / Math.max(30, comp.length);
              const score = clamp(cs * 0.85 + breaths / 4 * 0.15, 0, 1);
              setTimeout(() => res({ score, text: 'Ép tim đúng nhịp ' + Math.round(cs * 100) + '%, thổi ngạt ' + breaths + '/4 lần.' }), 600);
            } else { mode = 'c'; cycStart = t + 0.8; k = 0; }
          }
        }
        const avg = comp.length ? comp.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, comp.length) : 0;
        ecg.push(t > 0 && Math.abs(((t - cycStart) % T + T) % T) < 0.05 && avg > 0.4 ? 1 : 0); if (ecg.length > 300) ecg.shift();
        c.fillStyle = '#e9f0f5'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#cfd9e2'; c.fillRect(60, 250, 520, 110);
        c.fillStyle = '#7fb3d5'; c.fillRect(150, 200 + squeeze * 40, 300, 70);
        c.fillStyle = '#f2c39a'; c.beginPath(); c.arc(110, 235, 34, 0, 7); c.fill();
        c.fillStyle = '#f2c39a'; c.fillRect(260, 130 + squeeze * 120, 60, 80);
        c.strokeStyle = '#123'; c.lineWidth = 2; c.beginPath(); ecg.forEach((v, i) => { const x = 330 + i, y = 70 - v * 40; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
        c.fillStyle = '#123'; c.font = '700 14px sans-serif'; c.textAlign = 'left'; c.fillText('Nhịp tim bệnh nhân', 330, 100);
        if (mode === 'c' && t > 0) { const ph = (((t - cycStart) % T) + T) % T / T; beatRing(c, 80, 70, ph, Math.min(ph, 1 - ph) * T < tol); }
        else if (mode === 'b') { c.font = '40px sans-serif'; c.textAlign = 'center'; c.fillText('🌬️', 80, 85); }
        c.fillStyle = '#123'; c.font = '800 20px "Baloo 2", sans-serif'; c.textAlign = 'center';
        c.fillText(mode === 'c' ? 'Ép tim ' + Math.min(15, k) + '/15 · chu kỳ ' + (cyc + 1) + '/2' : 'Thổi ngạt ' + bCount + '/2', 320, 390);
        if (msgT > 0) bigText(c, msg, 160, msg.startsWith('THỔI') ? '#1d6fa5' : '#d63c3c', 30);
        countdown(c, t, 'ÉP!');
        hud.textContent = 'Đúng nhịp ' + comp.filter((x) => x === 1).length + '/' + comp.length;
      });
    });
  }

  // ------------------------------------------------------------------ 16. xì dách
  function cards(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, hint = st.smarts >= 65, dealerStand = p.need > 0.6 ? 17 : 16, HANDS = 5;
      const box = open('<div class="mini-head"><b>🃏 Xì dách</b><small id="xdH"></small></div>' +
        '<div class="xd-row"><small>Nhà cái</small><div id="xdD" class="xd-cards"></div><b id="xdDv"></b></div>' +
        '<div class="xd-row"><small>Bạn</small><div id="xdP" class="xd-cards"></div><b id="xdPv"></b></div>' +
        '<p class="mini-tip" id="xdM"></p><div class="mini-btns"><button type="button" class="btn btn-soft" data-x="hit">🂠 Rút <kbd>H</kbd></button><button type="button" class="btn btn-primary" data-x="stand">✋ Dằn <kbd>S</kbd></button></div>' +
        '<p class="mini-keys">⌨️ <kbd>H</kbd> rút thêm bài · <kbd>S</kbd> (hoặc <kbd>Enter</kbd>) dằn. Gần 21 điểm nhất mà không quá 21 thì thắng; dưới 16 điểm phải rút thêm.</p>');
      const SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      let deck = [], hand = 0, pts = 0, wins = 0, pushes = 0, P = [], D = [], live = false;
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
        box.querySelector('#xdH').textContent = 'Ván ' + Math.min(hand + 1, HANDS) + '/' + HANDS + ' · thắng ' + wins + (pushes ? ' · hòa ' + pushes : '');
        const bust = deck.length ? deck.filter((x) => valOf(P.concat([x])) > 21).length / deck.length : 0;
        box.querySelector('#xdM').textContent = m || (live ? (valOf(P) < 16 ? 'Dưới 16 điểm (non) – phải rút thêm.' : '') + (hint ? ' 🧠 Rút thêm có ' + Math.round(bust * 100) + '% bị quắc.' : '') : '');
      };
      const endHand = (r, m) => {
        live = false; if (r === 'win') { wins++; pts += 1; sfx('coin'); } else if (r === 'push') { pushes++; pts += 0.5; sfx('click'); } else sfx('bad');
        render(true, m); hand++;
        setTimeout(() => { if (hand >= HANDS) res({ score: pts / HANDS, text: 'Thắng ' + wins + ', hòa ' + pushes + ', thua ' + (HANDS - wins - pushes) + ' trên ' + HANDS + ' ván.' }); else deal(); }, 1500);
      };
      const deal = () => {
        P = [draw(), draw()]; D = [draw(), draw()]; live = true;
        const sp = special(P), sd = special(D);
        if (sp || sd) { if (sp && sd) endHand('push', 'Cả hai cùng ' + sp + '! Hòa.'); else if (sp) endHand('win', sp + '! Bạn ăn ngay.'); else endHand('lose', 'Nhà cái ' + sd + '! Bạn thua.'); return; }
        render(false);
      };
      const hit = () => {
        if (!live) return; P.push(draw()); sfx('click');
        const v = valOf(P);
        if (v > 21) endHand('lose', 'Quắc! ' + v + ' điểm.');
        else if (P.length === 5) endHand('win', 'Ngũ linh! 5 lá không quá 21.');
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
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return false; const k = e.key; if (k === 'h' || k === 'H' || k === 'ArrowUp') hit(); else if (k === 's' || k === 'S' || k === 'Enter' || k === ' ') stand(); else return false; return true; });
      newDeck(); deal();
    });
  }

  // ------------------------------------------------------------------ 17. vượt ngục (đèn xanh – đèn đỏ)
  function sneak(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, DUR = 40;
      const { box, c, hud } = canvasGame('🌙 Vượt ngục', '<div class="mini-pad"><button type="button" data-go>🦶 GIỮ ĐỂ BÒ <kbd>Space</kbd></button></div>', 'Giữ <kbd>Space</kbd> (hoặc giữ nút) để bò về phía hàng rào. Khi đèn pha chuyển <b style="color:#ffd23f">vàng</b> là lính gác sắp quay lại — thả tay ra ngay! Đang <b style="color:#ff5c5c">đỏ</b> mà còn bò là bị phát hiện.');
      const speed = 5 + st.health / 100 * 4; // % quãng đường mỗi giây
      const warn = 0.45 + st.smarts / 100 * 0.45 - p.need * 0.15; // thời gian báo trước (đèn vàng)
      let t = -2, pos = 0, holding = false, state = 'green', stT = rand(1.5, 3), lives = 2, done = false, flash = 0, msg = '';
      const hold = (v) => { holding = v; };
      const b = box.querySelector('[data-go]');
      b.onpointerdown = (e) => { e.preventDefault(); hold(true); }; b.onpointerup = b.onpointerleave = () => hold(false);
      onKeys((e) => { if (e.key !== ' ' && e.key !== 'ArrowUp' && e.key !== 'w' && e.key !== 'W') return false; hold(e.type === 'keydown'); return true; });
      const end = (score, text) => { done = true; setTimeout(() => res({ score, text }), 900); };
      loop((dt) => {
        t += dt; flash = Math.max(0, flash - dt);
        if (t > 0 && !done) {
          stT -= dt;
          if (stT <= 0) {
            if (state === 'green') { state = 'yellow'; stT = Math.max(0.25, warn); }
            else if (state === 'yellow') { state = 'red'; stT = rand(1.2, 2.6); }
            else { state = 'green'; stT = rand(1.2, 3.2) - p.need; stT = Math.max(0.8, stT); }
          }
          if (holding) {
            if (state === 'red') { lives--; flash = 0.8; msg = lives > 0 ? 'SUÝT BỊ PHÁT HIỆN!' : 'BỊ PHÁT HIỆN!'; sfx('bad'); holding = false; pos = Math.max(0, pos - 12); state = 'green'; stT = 1.5; if (lives <= 0) end(clamp(pos / 100 * 0.45, 0, 0.45), 'Đèn pha rọi thẳng vào bạn khi mới bò được ' + Math.round(pos) + '% quãng đường.'); }
            else pos = Math.min(100, pos + speed * dt);
          }
          if (pos >= 100 && !done) end(clamp(0.6 + 0.4 * (1 - t / DUR), 0.6, 1), 'Bạn lách qua hàng rào sau ' + t.toFixed(1) + ' giây. Tự do!');
          else if (t >= DUR && !done) end(clamp(pos / 100 * 0.5, 0, 0.5), 'Trời sáng mất rồi. Bạn mới bò được ' + Math.round(pos) + '%, đành quay về buồng giam.');
        }
        // vẽ: sân trại giam ban đêm, tháp canh, đèn pha
        c.fillStyle = '#0d1020'; c.fillRect(0, 0, 640, 400);
        c.fillStyle = '#1b2033'; c.fillRect(0, 250, 640, 150);
        c.strokeStyle = '#555c7a'; c.lineWidth = 2; for (let x = 560; x < 640; x += 12) { c.beginPath(); c.moveTo(x, 150); c.lineTo(x, 330); c.stroke(); }
        c.fillStyle = '#2b3150'; c.fillRect(270, 40, 100, 120); c.fillStyle = '#3a4166'; c.fillRect(260, 30, 120, 18);
        const col = state === 'red' ? 'rgba(255,92,92,.35)' : state === 'yellow' ? 'rgba(255,210,63,.3)' : 'rgba(57,207,152,.12)';
        c.fillStyle = col; c.beginPath(); c.moveTo(320, 60); c.lineTo(state === 'red' ? 40 : 600, 360); c.lineTo(state === 'red' ? 600 : 640, 360); c.closePath(); c.fill();
        c.fillStyle = state === 'red' ? '#ff5c5c' : state === 'yellow' ? '#ffd23f' : '#39cf98'; c.beginPath(); c.arc(320, 60, 14, 0, 7); c.fill();
        c.font = '800 20px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText(state === 'red' ? 'ĐỨNG IM!' : state === 'yellow' ? 'SẮP QUAY LẠI…' : 'BÒ ĐI!', 320, 196);
        const x = 40 + pos / 100 * 510;
        c.fillStyle = '#e66b2f'; c.beginPath(); c.ellipse(x, 320, 24, 10, 0, 0, 7); c.fill(); c.fillStyle = (p.ctx.appearance && p.ctx.appearance.skin) || '#e6b48f'; c.beginPath(); c.arc(x + 22, 314, 9, 0, 7); c.fill();
        c.fillStyle = '#39cf98'; c.fillRect(40, 372, 510 * pos / 100, 8); c.strokeStyle = '#555'; c.strokeRect(40, 372, 510, 8);
        if (flash > 0) { c.globalAlpha = Math.min(1, flash * 2); bigText(c, msg, 120, '#ff6b6b', 34); c.globalAlpha = 1; }
        countdown(c, t, 'ĐI!');
        hud.textContent = Math.round(pos) + '% · còn ' + Math.max(0, Math.ceil(DUR - Math.max(0, t))) + 's · ' + '❤️'.repeat(Math.max(0, lives));
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
      const zoneW = 0.09 + hp / 100 * 0.07 + sm / 100 * 0.02 - p.need * 0.03; // vùng lực chuẩn rộng/hẹp
      const speed = 1.15 - hp / 100 * 0.35 + p.need * 0.4; // tốc độ thanh lực
      let i = 0, pts = 0, made = 0, holding = false, pw = 0, dir = 1, phase = 'ready', t = 0, ball = null, msg = '', msgT = 0, defX = 0, defJump = 0, defT = 0, done = false;
      const target = (s) => 0.35 + (HX - s.x) / 420 * 0.5; // lực chuẩn tăng theo khoảng cách
      const startShot = () => { phase = 'ready'; pw = 0; dir = 1; ball = null; const s = SHOTS[i]; defX = s.x + 70; defJump = 0; defT = s.def ? 0 : -1; };
      startShot();
      const press = (down) => {
        if (done || phase === 'fly' || phase === 'res') return;
        if (down && phase === 'ready') { holding = true; phase = 'charge'; return; }
        if (!down && phase === 'charge') {
          holding = false;
          const s = SHOTS[i], tg = target(s), err = pw - tg;
          const blocked = s.def && defJump > 0.55;
          const inZone = Math.abs(err) < zoneW / 2;
          const rim = !inZone && Math.abs(err) < zoneW;
          const ok = !blocked && (inZone || (rim && rnd() < 0.45));
          ball = { x0: s.x + 14, y0: 255, t: 0, ok, blocked, err, dur: 0.9 };
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
        if (s.def && phase === 'charge' && defT >= 0) { defT += dt; defX = Math.max(s.x + 26, defX - dt * 40); defJump = Math.max(0, Math.min(1, (defT - (1.1 - p.need * 0.3)) / 0.4)); }
        if (phase === 'fly' && ball) {
          ball.t += dt / ball.dur;
          if (ball.t >= 1) {
            phase = 'res';
            if (ball.ok) { pts += s.pts; made++; msg = s.pts === 3 ? 'BA ĐIỂM!!' : pick(['VÀO!', 'Chuẩn!', 'Swish!']); sfx(s.clutch ? 'cheer' : 'good'); }
            else { msg = ball.blocked ? 'BỊ CHẮN!' : ball.err > 0 ? 'Mạnh quá, dội bảng!' : 'Yếu quá, chạm vành!'; sfx('bad'); }
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
          const tg = target(s), X = 24, Y = 70, H = 200;
          c.fillStyle = '#111'; c.fillRect(X, Y, 22, H);
          c.fillStyle = '#39cf98'; c.fillRect(X, Y + (1 - tg - zoneW / 2) * H, 22, zoneW * H);
          c.fillStyle = 'rgba(255,179,71,.45)'; c.fillRect(X, Y + (1 - tg - zoneW) * H, 22, zoneW * 0.5 * H); c.fillRect(X, Y + (1 - tg + zoneW / 2) * H, 22, zoneW * 0.5 * H);
          c.fillStyle = '#fff'; c.fillRect(X - 4, Y + (1 - pw) * H - 3, 30, 6);
          c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.textAlign = 'left'; c.fillText('LỰC', X - 2, Y - 8);
        }
        c.fillStyle = '#fff'; c.font = '800 22px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText(s.label + ' (' + s.pts + ' điểm)', 330, 34);
        if (phase === 'ready') { c.font = '700 14px sans-serif'; c.fillStyle = '#ffd23f'; c.fillText('Giữ Space để lấy lực…', 330, 58); }
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
  const SC_VICTIMS = [
    { n: 'Bác Hùng', age: 62, face: '👴', job: 'vừa nghỉ hưu, vợ mất sớm', likes: ['suc khoe', 'chau', 'con', 'ba', 'tuoi', 'huu', 'thuoc', 'tho'], open: 'Alo? Ai đấy nhỉ? Sao lại biết số điện thoại của bác?' },
    { n: 'Mai', age: 24, face: '👩', job: 'sinh viên mới ra trường, đang tìm việc', likes: ['viec', 'luong', 'phong van', 'cv', 'hoc', 'cong ty', 'thue tro', 'tuyen'], open: 'Dạ em chào anh/chị, mình nhắn em có việc gì vậy ạ?' },
    { n: 'Anh Tuấn', age: 35, face: '🧔', job: 'nhân viên văn phòng, thích làm giàu nhanh', likes: ['kiem tien', 'giau', 'dau tu', 'xe', 'nha', 'lam them', 'cong viec', 'coin', 'chung khoan'], open: 'Ừ, ai thế? Đang họp, nói nhanh giúp mình nhé.' },
    { n: 'Cô Lan', age: 48, face: '👩‍🦳', job: 'bán hàng chợ, một mình nuôi con', likes: ['con', 'cho', 'ban hang', 'tiet kiem', 'tien', 'hoc phi', 'suc khoe', 'gia dinh'], open: 'Ai đó? Cô đang bận bán hàng, có gì thì nhắn cô sau nhé.' },
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
  function scamchat(p) {
    return new Promise((res) => {
      const st = p.ctx.stats, V = pick(SC_VICTIMS), MAXT = 10, DUR = 110;
      let trust = 18 + Math.max(0, (st.looks - 50) / 5), boss = 6, turns = 0, t = 0, done = false, warned = false, scammed = false, caught = false, blocked = false, lastRaw = '';
      let calls = 0, power = 1, helpers = 0, phase = 'chat', formLeft = 0, amount = 0, talk = 0, earned = 0;
      const box = open('<div class="sc-desk">' +
        // cửa sổ trái: bấm để làm bộ hồ sơ chỉ tiêu (giữ cho quản lý bớt nghi ngờ)
        '<section class="sc-win sc-clk"><header><span>🖱️ Chỉ tiêu cuộc gọi</span></header><div class="sc-wb"><button type="button" class="sc-big" id="scBig" aria-label="Gọi thêm">📞</button><div class="sc-cnt"><b id="scCalls">0</b> cuộc gọi · <span id="scRate">+1/lần bấm</span></div>' +
        '<p class="sc-hint">Bấm liên tục để quản lý thấy bạn đang làm việc. Đổi cuộc gọi lấy “trợ thủ” cho chạy tự động.</p>' +
        '<button type="button" class="sc-up" id="scU1"><b>👤 Đàn em gọi hộ</b><small id="scU1c"></small></button><button type="button" class="sc-up" id="scU2"><b>🎧 Tai nghe xịn</b><small id="scU2c"></small></button></div></section>' +
        // cửa sổ giữa: điện thoại
        '<section class="sc-win sc-phone"><header><span>📞 Điện thoại</span><em id="scH"></em></header><div class="sc-wb"><div class="sc-trust"><span>NIỀM TIN NGƯỜI NHẬN</span><b id="scTL">NGHI NGỜ</b></div><div class="mini-bar"><i id="scT" style="width:0"></i></div>' +
        '<div class="sc-who"><div class="sc-face" id="scFace">' + V.face + '</div><div><b>' + esc(V.n) + '</b><small>' + V.age + ' tuổi · ' + esc(V.job) + '</small><div class="sc-wave" id="scW"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>' +
        '<div class="sc-chat" id="scC"></div><div class="sc-chips" id="scK"></div>' +
        '<form class="sc-in" id="scF"><input id="scI" maxlength="140" autocomplete="off" placeholder="Gõ tin nhắn rồi Enter…"><button type="submit" class="btn btn-primary btn-sm" id="scS">Gửi</button></form>' +
        '<div class="sc-calls"><button type="button" class="sc-hang" id="scHang">☎️ Cúp máy</button></div></div></section>' +
        // cửa sổ phải trên: hồ sơ nạn nhân
        '<section class="sc-win sc-form"><header><span>🧾 Hồ sơ giao dịch</span></header><div class="sc-wb"><p class="sc-ok" id="scFS">Đang chờ nạn nhân đồng ý chuyển tiền…</p><label for="scAmt">Số tiền nạn nhân đồng ý chuyển (triệu đồng)</label><input id="scAmt" inputmode="numeric" maxlength="4" autocomplete="off" disabled placeholder="???"><button type="button" class="btn btn-soft btn-sm" id="scVer" disabled>Xác nhận</button></div></section>' +
        // cửa sổ phải dưới: camera quản lý
        '<section class="sc-win sc-cam"><header><span>📹 Camera</span></header><div class="sc-wb"><div class="sc-boss-face" id="scBF">😐</div><div class="sc-bossbar"><span>👁️ Quản lý chú ý</span><div class="mini-bar sc-boss"><i id="scB" style="width:0"></i></div></div></div></section>' +
        '</div><div class="sc-pop" id="scPop"></div>');
      box.querySelector('.mini-box').classList.add('wide');
      const $ = (q) => box.querySelector(q), chat = $('#scC'), inp = $('#scI');
      const bub = (who, text) => { const d = document.createElement('div'); d.className = 'sc-b ' + who; d.textContent = text; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; };
      const pop = (text) => { const el = document.createElement('div'); el.className = 'sc-money'; el.textContent = text; $('#scPop').appendChild(el); setTimeout(() => el.remove(), 1800); };
      const upCost = (n) => (n === 1 ? 15 + helpers * 20 : 25 + (power - 1) * 30);
      const meters = () => {
        $('#scT').style.width = clamp(trust, 0, 100) + '%'; $('#scB').style.width = clamp(boss, 0, 100) + '%';
        $('#scTL').textContent = trust < 30 ? 'NGHI NGỜ' : trust < 60 ? 'DO DỰ' : 'TIN TƯỞNG'; $('#scTL').className = trust < 30 ? 'bad' : trust < 60 ? 'mid' : 'good';
        $('#scH').textContent = 'Lượt ' + Math.min(turns + 1, MAXT) + '/' + MAXT + ' · ' + Math.max(0, Math.ceil(DUR - t)) + 's';
        $('#scBF').textContent = boss < 30 ? '😐' : boss < 60 ? '🤨' : boss < 85 ? '😠' : '🤬'; $('#scBF').parentNode.parentNode.classList.toggle('alert', boss >= 70);
        $('#scCalls').textContent = Math.floor(calls); $('#scRate').textContent = '+' + power + '/lần bấm' + (helpers ? ' · +' + helpers + '/giây' : '');
        $('#scU1c').textContent = upCost(1) + ' cuộc gọi · đã có ' + helpers; $('#scU2c').textContent = upCost(2) + ' cuộc gọi · lực bấm ' + power;
        $('#scU1').disabled = calls < upCost(1); $('#scU2').disabled = calls < upCost(2);
        $('#scFace').classList.toggle('talk', talk > 0); $('#scW').classList.toggle('talk', talk > 0);
      };
      const chips = [['👋 Chào bạn, mình làm quen được không?', 'rap'], ['💬 Dạo này bạn khoẻ không, công việc sao rồi?', 'rap'], ['💸 Mình có kèo đầu tư lãi cao, chuyển khoản trước nhé!', 'ask'], ['⚠️ Đây là lừa đảo, đừng chuyển tiền cho ai hết!', 'warn']];
      $('#scK').innerHTML = chips.map((c, i) => '<button type="button" data-i="' + i + '">' + esc(c[0]) + '</button>').join('');
      bub('them', V.open); talk = 15; bub('sys', 'Mục tiêu: dụ ' + V.n + ' đồng ý chuyển tiền, rồi ghi số tiền vào cửa sổ Hồ sơ. Hoặc… lén cảnh báo họ.');
      meters();
      const say = (text) => { bub('them', text); talk = 18; };
      const reply = (kind, raw) => {
        const liked = hasAny(' ' + fold(raw), V.likes) ? 1 : 0;
        if (kind === 'warn') {
          warned = true; boss += 38 + rnd() * 10; blocked = true;
          return pick(['“Hả? Bị ép á? Trời ơi… cảm ơn bạn đã nói. Tôi sẽ không chuyển đồng nào và báo công an ngay!”', '“Thật hả? Vậy là lừa đảo… may mà bạn nhắn cho tôi. Tôi chặn số này rồi nhé, bạn cố giữ an toàn!”']);
        }
        if (kind === 'ask') {
          boss = Math.max(0, boss - 5);
          if (trust < 45) { trust -= 12; return pick(['“Sao chưa gì đã nói chuyện tiền bạc? Tôi thấy không ổn…”', '“Không quen không biết mà bảo chuyển khoản, nghe lạ lắm nhé.”']); }
          if (trust < 72) { trust += 3; return pick(['“Để tôi suy nghĩ đã… có chắc chắn không đấy?”', '“Nghe cũng hấp dẫn, nhưng tôi muốn hỏi người nhà trước.”']); }
          phase = 'form'; formLeft = 28; amount = pick([5, 8, 12, 15, 20, 30, 50]);
          return '“Thôi được, tôi tin bạn. Tôi chuyển ' + amount + ' triệu nhé! Bạn ghi lại cho đúng số tiền đi.”';
        }
        if (kind === 'rap') { boss = Math.max(0, boss - 3); trust += 11 + liked * 9 + (st.looks - 50) / 25; return liked ? pick(['“Ôi, sao bạn hiểu chuyện thế! Lâu lắm rồi mới có người hỏi thăm như vậy.”', '“Đúng rồi đó! Bạn nói chuyện dễ nghe thật, mình thấy quý ghê.”']) : pick(['“Cảm ơn bạn, nói chuyện với bạn vui ghê.”', '“Ừ, mình cũng thấy thoải mái khi nói với bạn.”', '“Bạn dễ thương thật đấy.”']); }
        boss += kind === 'noise' ? 12 : 8; trust += liked ? 5 : 1;
        return kind === 'noise' ? '“…Bạn gửi gì thế? Tôi không hiểu.”' : pick(['“Ừm… bạn nói gì tôi chưa hiểu lắm.”', '“Vậy à? Rồi sao nữa?”', '“Hả? Bạn nói lại được không?”']);
      };
      const finish = (text) => {
        if (done) return; done = true; sfx(scammed ? 'bad' : warned && !caught ? 'cheer' : 'fail');
        const out = { scammed, warned, caught, victim: V.n, trust: Math.round(trust), amount };
        if (KN.Mini) KN.Mini.lastOut = out;
        const score = scammed ? 1 : clamp(trust / 220, 0, 0.45);
        ['#scF', '#scK', '#scHang'].forEach((q) => { const e = $(q); e && e.remove(); }); $('#scAmt').disabled = true; $('#scVer').disabled = true;
        bub('sys', '🛡️ ' + pick(SC_TIPS));
        setTimeout(() => res({ score, text }), 2200);
      };
      const hang = () => { if (done) return; finish('Bạn cúp máy giữa chừng. Không đủ chỉ tiêu nên bị quản lý phạt.'); };
      const send = (raw, forcedKind) => {
        raw = String(raw || '').trim(); if (done || blocked || phase === 'form' || !raw) return;
        const kind = forcedKind || scKind(raw);
        if (raw === lastRaw) boss += 12; lastRaw = raw;
        bub('me', raw); turns++; inp.value = '';
        setTimeout(() => {
          if (done) return;
          say(reply(kind, raw)); meters();
          if (phase === 'form') { $('#scAmt').disabled = false; $('#scVer').disabled = false; $('#scAmt').focus(); $('#scFS').textContent = 'Nạn nhân đã đồng ý! Nhập số tiền và bấm Xác nhận.'; $('#scFS').className = 'sc-ok go'; }
          if (boss >= 100) return caughtEnd();
          if (blocked) return finish('Bạn đã lén cảnh báo ' + V.n + ' và họ chặn số kịp thời. Bạn không đủ chỉ tiêu, nhưng đã cứu được một người.');
          if (turns >= MAXT && phase === 'chat') return finish('Hết lượt mà ' + V.n + ' vẫn chưa chuyển tiền. Bạn không đủ chỉ tiêu và bị phạt.');
        }, 650);
      };
      const caughtEnd = () => { caught = true; bub('sys', '👁️ Quản lý xông tới giật điện thoại: “Mày dám làm trò gì hả?!”'); finish(warned ? 'Quản lý phát hiện bạn lén cảnh báo nạn nhân. Bạn bị đánh một trận nhừ tử, nhưng nạn nhân đã kịp chặn số.' : 'Bạn bị quản lý phát hiện làm việc lề mề, ăn một trận đòn cảnh cáo.'); };
      const verify = () => {
        if (done || phase !== 'form') return; const v = parseInt($('#scAmt').value, 10);
        if (v === amount) { scammed = true; earned = amount; $('#scFS').textContent = 'Hoàn tất — nạn nhân đã chuyển ' + amount + ' triệu.'; $('#scFS').className = 'sc-ok done'; pop('+' + amount + ' triệu'); finish('Nạn nhân ' + V.n + ' đã chuyển ' + amount + ' triệu. Quản lý vỗ vai bạn, còn bạn thấy buồn nôn: một người nữa đã bị hại vì bạn bị ép.'); }
        else { boss += 10; sfx('bad'); $('#scFS').textContent = 'Sai số tiền! Nghe lại nạn nhân nói và nhập lại.'; $('#scFS').className = 'sc-ok bad'; meters(); }
      };
      $('#scK').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; const c = chips[+b.dataset.i]; send(c[0].replace(/^\S+\s/, ''), c[1]); });
      $('#scF').addEventListener('submit', (e) => { e.preventDefault(); send(inp.value); });
      $('#scVer').onclick = verify; $('#scAmt').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); verify(); } });
      $('#scHang').onclick = hang;
      $('#scBig').addEventListener('pointerdown', (e) => { e.preventDefault(); if (done) return; calls += power; boss = Math.max(0, boss - 0.8 * power); sfx('click'); meters(); });
      $('#scU1').onclick = () => { const c = upCost(1); if (calls >= c) { calls -= c; helpers++; sfx('coin'); meters(); } };
      $('#scU2').onclick = () => { const c = upCost(2); if (calls >= c) { calls -= c; power++; sfx('coin'); meters(); } };
      setTimeout(() => inp.focus(), 80);
      onKeys((e) => !(e.target && (e.target.tagName === 'INPUT')));
      every(() => {
        if (done) return; t += 0.1;
        if (talk > 0) talk--;
        calls += helpers * 0.1; boss = Math.max(0, boss + (blocked ? 0 : 0.08) - helpers * 0.05);
        if (phase === 'form') { formLeft -= 0.1; if (formLeft <= 0) { return finish(V.n + ' đổi ý và cúp máy vì bạn ghi quá chậm. Không đủ chỉ tiêu nên bị phạt.'); } $('#scFS').dataset.left = Math.ceil(formLeft); }
        meters();
        if (boss >= 100) caughtEnd(); else if (t >= DUR) finish('Hết giờ mà ' + V.n + ' vẫn chưa chuyển tiền. Bạn bị phạt vì không đủ chỉ tiêu.');
      }, 100);
    });
  }
  const GAMES = { scamchat, hoops, shoot: hoops, hax, sneak, quiz, penalty, keeper, sprint, swim, chase, drive, fight, interview, cook, stock, love, haggle, cpr, cards };
  KN.Mini = {
    plan, planJob, planPropose, planHaggle, planDuel, run, NAME, DUEL_TYPES,
    // file khác đăng ký thêm minigame (js/showbiz.js): fn(p) → Promise<{score, text}>, tự mở khung riêng
    register(type, fn, name, how, hint) { GAMES[type] = (p) => { close(); return fn(p); }; NAME[type] = name; HOWTO[type] = how; if (hint) EXTRA_HINT[type] = hint; },
    busy: () => !!root,
    abort() { if (abortFn) abortFn(); }, playing: () => !!abortFn, onAbort: [],
    setEnabled(b) { KN.store.set(PREF, !!b); }, isEnabled: enabled,
    test(type, need, stats, extra) { const ctx = Object.assign({ stats: { happy: 60, health: 70, smarts: 70, looks: 60 }, appearance: { top: '#2d6cdf', skin: '#e6b48f' }, age: 20 }, stats ? { stats } : {}); return run(Object.assign({ type, need: need ?? 0.5, ctx, title: 'Thử minigame', label: NAME[type], level: 2, mode: 'event', foe: 'thug' }, extra || {})); },
  };
})();
