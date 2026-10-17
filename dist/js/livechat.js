/* Một Kiếp Người — khung bình luận LIVE (KN.LiveChat): chỉ chạy khi nhân vật đang livestream.
   Bình luận theo tâm trạng tình huống; có fan, anti-fan và cả "giang hồ mạng" vào dằn mặt.
   BẤM VÀO MỘT BÌNH LUẬN để trả lời: 💗 cảm ơn · 😂 đáp hài · 😤 đáp trả · 🚫 chặn (ảnh hưởng fan và phúc đức qua KN.Game.liveReply).
   Tắt/bật ở ⚙️ Cài đặt. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const NAMES = ['bé_mây', 'trà_sữa_fan', 'anh_shipper', 'mèo_ú', 'gió_đông', 'tý_nị', 'chị_đẹp_92', 'coder_đêm', 'mẹ_bỉm_sữa', 'thánh_soi', 'người_qua_đường', 'cô_ba_sg', 'hn_mùa_thu', 'fan_cứng', 'dân_chơi_hệ_nhẹ', 'ông_chú_U50', 'học_sinh_lớp_9', 'bác_sĩ_tâm_lý', 'người_hóng_drama', 'chủ_tịch_xã', 'ếch_xanh', 'bò_sữa_99', 'cá_mập_tí_hon', 'gà_rán_KFC'];
  const GH_NAMES = ['Tuấn_Sẹo_Official', 'Hùng_Đầu_Đinh', 'Dũng_Xăm_Trổ', 'Long_Giang_Hồ', 'Bà_Trùm_Khu_Phố', 'Khá_Bảnh_Fake', 'Đại_Ca_Ảo'];
  const COLORS = ['#ff7eb6', '#ffb347', '#5cc8ff', '#39cf98', '#c792ff', '#ffd23f', '#8fe3ff'];
  const POOL = {
    question: ['thả tim nào mọi người 💗', 'share live đi cả nhà', 'idol nhìn em đi 🥺', 'tặng quà nè 🎁', 'mới vào, có gì hot vậy', 'chọn 1 điiii', '2 chứ còn gì nữa 😤', 'ủa sao lại phải chọn 😭', 'tôi mà là bạn tôi chạy luôn', 'cẩn thận cú lừa 👀', 'hồi hộp quá trời', 'chat ơi vote đi', 'cái này 50/50 nha', 'xem tới đây là nghiện 🍿', 'chọn cái an toàn đi bạn ơi', 'liều ăn nhiều 🔥'],
    good: ['QUÁ ĐỈNH 🔥🔥', 'khóc thật sự 😭👏', 'đời ai mà đẹp vậy', 'chúc mừng chúc mừng 🎉', 'xứng đáng!!!', 'nổi da gà luôn', 'gg wp', 'idol của tôi đây rồi', 'nhân phẩm vượt trội', 'share cho mẹ xem ngay'],
    bad: ['toang rồi ông giáo ạ 💀', 'thôi xong 😭', 'f trong chat', 'đã bảo rồi mà không nghe', 'ối dồi ôi', 'thương ghê 🥺', 'còn thở là còn gỡ', 'lần sau chừa nha', 'từ từ sẽ ổn thôi'],
    milestone: ['KHOẢNH KHẮC LỊCH SỬ 🏆', 'chụp màn hình lại đi chat', 'đỉnh cao cuộc đời', 'mãi đỉnh 👑', 'pháo hoa đâu 🎆🎆', 'clip này phải viral'],
    neutral: ['ừ cũng được', 'hóng tập sau', 'ai ăn cơm chưa', 'cho xin link nhạc nền', 'kênh hay mà ít view vậy', 'like đi mọi người', 'tôi ở đây từ đầu nha', 'chill quá'],
    money: ['giàu quá trời 💸', 'cho em xin vài tỷ', 'tiền đâu nhiều thế', 'đại gia là đây'],
    love: ['ship ship ship 💘', 'ôi tình yêu', 'ghen tị ghê 😤', 'cưới đi chờ chi'],
    sad: ['🕯️🕯️', 'xin chia buồn', 'cuộc đời vô thường', 'mạnh mẽ lên nhé'],
  };
  const HATER = ['live như hạch, out đây', 'nhìn mặt đã thấy ghét 🙄', 'lại câu view à', 'content nhạt như nước ốc', 'ai cho tự tin vậy', 'diễn sâu ghê 🤡'];
  const GIANGHO = ['ra đây solo không 👊', 'anh em đâu, vào phá live nào!!!', 'tao biết nhà mày ở đâu đấy', 'câm mồm đi, nói nhiều', 'đừng để anh gặp ngoài đường', 'nộp tiền bảo kê kênh chưa em?', 'nói xấu đại ca là xác định nhé', 'cho bố cái địa chỉ, bố qua nói chuyện', 'kênh này anh em mình xử lý nhé', 'sống phải biết điều nghe chưa', 'mày nghĩ mày là ai mà to mồm', 'anh em report kênh này cho anh', 'đợi đấy, tối nay anh lên live gọi tên', 'tuổi gì mà đòi so với đại ca', 'nói chuyện cho cẩn thận vào', 'xin cái số điện thoại, anh gọi giảng đạo lý', 'gặp anh ngoài đời mày có dám nói thế không'];
  const KEYS = { money: /tiền|tỷ|triệu|lương|thưởng|giàu|đại gia|cổ tức/i, love: /yêu|cưới|hẹn hò|tỏ tình|người yêu|hôn|💘|💍/i, sad: /qua đời|mất|tang|đám ma|ra đi|khóc|tiễn biệt/i };
  const REPLY = [['tim', '💗 Cảm ơn'], ['hai', '😂 Đáp hài'], ['gat', '😤 Đáp trả'], ['chan', '🚫 Chặn']];
  let box = null, viewers = 0, timer = null, hideT = null, replies = 0, ghBoost = 0;
  const on = () => { try { return localStorage.getItem('kn_livechat') !== 'off'; } catch (e) { return true; } };
  const escH = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  // không lặp lại câu vừa xuất hiện gần đây (tránh 2 tin nhắn giống hệt nhau liền nhau)
  const recent = [];
  const pickR = (a) => { let s = pick(a); for (let i = 0; i < 12 && recent.includes(s); i++) s = pick(a); recent.push(s); if (recent.length > 10) recent.shift(); return s; };
  function ensure() {
    if (box && box.isConnected) return box;
    const stage = document.getElementById('stage'); if (!stage) return null;
    box = document.createElement('div'); box.className = 'lchat';
    box.innerHTML = '<div class="lchat-top"><span class="lchat-live">LIVE</span><span class="lchat-view">👁 0</span><span class="lchat-hint">bấm bình luận để trả lời</span></div><div class="lchat-list"></div><form class="lchat-say"><input maxlength="120" placeholder="Nói gì đó với người xem…" autocomplete="off"><button type="submit">Gửi</button></form>';
    stage.appendChild(box);
    // đang tương tác thì không tự ẩn
    box.addEventListener('pointerenter', () => clearTimeout(hideT));
    box.addEventListener('pointerleave', () => scheduleHide(5000));
    box.addEventListener('click', onClick);
    const form = box.querySelector('.lchat-say');
    form.addEventListener('submit', (e) => { e.preventDefault(); const inp = form.querySelector('input'); const txt = inp.value.trim(); if (!txt) return; inp.value = ''; sendTyped(null, txt); });
    box.addEventListener('keydown', (e) => e.stopPropagation()); // gõ chữ không kích hoạt phím tắt của game
    return box;
  }
  function scheduleHide(ms) { clearTimeout(hideT); hideT = setTimeout(() => box && box.classList.remove('show'), ms); }
  function followers() { try { const s = KN.Game && KN.Game.socialView && KN.Game.socialView(); return (s && s.followers) || 0; } catch (e) { return 0; } }
  function line(text, kind, user, opts) {
    const b = ensure(); if (!b) return null;
    const list = b.querySelector('.lchat-list');
    const el = document.createElement('div');
    el.className = 'lchat-msg k-' + kind + (opts && opts.me ? ' me' : '') + (opts && opts.note ? ' note' : '');
    if (!(opts && (opts.me || opts.note))) { el.dataset.kind = kind; el.dataset.user = user; el.tabIndex = 0; el.setAttribute('role', 'button'); el.title = 'Bấm để trả lời'; }
    const badge = kind === 'giangho' ? '<span class="lc-badge">🥊 giang hồ mạng</span> ' : kind === 'hater' ? '<span class="lc-badge hater">😠</span> ' : '';
    el.innerHTML = opts && opts.note ? escH(text) : badge + '<b style="color:' + (opts && opts.me ? '#ffb347' : kind === 'giangho' ? '#ff5c5c' : pick(COLORS)) + '">' + escH(user) + '</b> ' + escH(text);
    list.appendChild(el);
    while (list.children.length > 8) list.removeChild(list.firstChild);
    return el;
  }
  function closeMenus() { if (!box) return; box.querySelectorAll('.lc-menu').forEach((m) => m.remove()); box.querySelectorAll('.lchat-msg.open').forEach((m) => m.classList.remove('open')); }
  function onClick(e) {
    const btn = e.target.closest('[data-rep]');
    if (btn) { e.stopPropagation(); doReply(btn.closest('.lchat-msg'), btn.dataset.rep); return; }
    if (e.target.closest('.lc-menu') || e.target.closest('.lchat-say')) return; // đang gõ chữ trong menu / ô chat
    const msg = e.target.closest('.lchat-msg[data-kind]'); if (!msg) return;
    const wasOpen = msg.classList.contains('open'); closeMenus(); if (wasOpen) return;
    if (replies >= 4) { line('Bạn đã trả lời khá nhiều rồi, tập trung live tiếp nhé.', 'note', '', { note: true }); return; }
    clearTimeout(hideT); clearInterval(timer); // dừng chạy chữ khi đang chọn trả lời
    msg.classList.add('open');
    const menu = document.createElement('div'); menu.className = 'lc-menu';
    menu.innerHTML = REPLY.map(([k, l]) => '<button type="button" data-rep="' + k + '">' + l + '</button>').join('') + '<form class="lc-type"><input maxlength="120" placeholder="✍️ Tự viết…" autocomplete="off"><button type="submit">↵</button></form>';
    menu.querySelector('.lc-type').addEventListener('submit', (ev) => { ev.preventDefault(); ev.stopPropagation(); const v = ev.target.querySelector('input').value.trim(); if (v) sendTyped(msg, v); });
    setTimeout(() => { try { menu.querySelector('input').focus({ preventScroll: true }); } catch (x) { /* */ } }, 30);
    msg.appendChild(menu);
  }
  // tự gõ: trả lời một bình luận (msg) hoặc nói với cả phòng live (msg = null)
  function sendTyped(msg, text) { if (replies >= 6) { line('Bạn đã nói khá nhiều rồi, để người xem nói với nào 😄', 'note', '', { note: true }); return; } doReply(msg, 'text', text); }
  function doReply(msg, mode, typed) {
    const all = !msg;
    const kind = all ? 'fan' : msg.dataset.kind, user = all ? 'mọi người' : msg.dataset.user;
    closeMenus(); if (msg) { msg.removeAttribute('data-kind'); msg.classList.add('replied'); }
    let r = null; try { r = KN.Game && KN.Game.liveReply && KN.Game.liveReply(kind, mode === 'text' ? 'tim' : mode, user, mode === 'text' ? typed : undefined); } catch (e) { r = null; }
    if (!r || r.ok === false) { line((r && r.reason) || 'Không trả lời được lúc này.', 'note', '', { note: true }); return; }
    replies++;
    try { KN.Audio && KN.Audio.sfx(r.tone === 'bad' ? 'bad' : r.tone === 'good' ? 'good' : 'click'); } catch (e) { /* */ }
    line((all ? '' : '↳ @' + user + ': ') + r.reply, 'me', 'Bạn', { me: true });
    // khán giả phản ứng lại câu trả lời
    setTimeout(() => {
      if (r.react) line(r.react, r.reactKind || 'fan', pick(r.reactKind === 'giangho' ? GH_NAMES : NAMES));
      if (r.note) line(r.note, 'note', '', { note: true });
      if (r.ghWave) { ghBoost = 3; for (let i = 0; i < 2; i++) setTimeout(() => line(pickR(GIANGHO), 'giangho', pick(GH_NAMES)), 600 + i * 700); }
      try { KN.UI && KN.UI.render && KN.UI.render(); } catch (e) { /* */ }
    }, 700);
    scheduleHide(9000);
  }
  function burst(tone, text) {
    if (!on() || (KN.UI && KN.UI.isTitle && KN.UI.isTitle())) return;
    const b = ensure(); if (!b) return;
    clearInterval(timer); clearTimeout(hideT); closeMenus(); replies = 0;
    const f = followers(), t = text || '';
    // số người xem ≈ 0,5–3% lượng theo dõi (ít fan thì chỉ lèo tèo vài chục người)
    viewers = Math.round(Math.max(viewers * 0.85, 8 + f * (0.005 + Math.random() * 0.025) + Math.random() * 20) * (tone === 'milestone' ? 1.5 : 1));
    b.querySelector('.lchat-view').textContent = '👁 ' + (viewers >= 1000 ? (Math.round(viewers / 100) / 10 + 'K').replace('.', ',') : viewers);
    b.classList.add('show');
    let pools = [POOL[tone] || POOL.neutral];
    Object.keys(KEYS).forEach((k) => { if (KEYS[k].test(t)) pools.push(POOL[k]); });
    if (tone === 'bad' && KEYS.sad.test(t)) pools = [POOL.sad, POOL.bad];
    // giang hồ mạng xuất hiện nhiều hẳn khi đang “khẩu chiến”, hoặc khi kênh đi theo hướng giang hồ
    const ghRate = /giang hồ|phá live|solo|dằn mặt/i.test(t) ? 0.45 : ghBoost > 0 ? 0.3 : 0.08, hateRate = f > 5000 ? 0.12 : 0.06;
    let n = tone === 'milestone' ? 10 : tone === 'question' ? 8 : 7;
    const used = new Set();
    const fresh = (arr) => { for (let i = 0; i < 8; i++) { const s = pick(arr); if (!used.has(s) && !recent.includes(s)) { used.add(s); recent.push(s); if (recent.length > 10) recent.shift(); return s; } } return pickR(POOL.neutral); };
    const tick = () => {
      if (n-- <= 0) { clearInterval(timer); ghBoost = Math.max(0, ghBoost - 1); scheduleHide(6500); return; }
      const r = Math.random();
      if (r < ghRate) line(fresh(GIANGHO), 'giangho', pick(GH_NAMES));
      else if (r < ghRate + hateRate) line(fresh(HATER), 'hater', pick(NAMES));
      else line(fresh(pick(pools)), 'fan', pick(NAMES));
    };
    tick(); timer = setInterval(tick, 560 + Math.random() * 380);
  }
  function setOn(v) { try { localStorage.setItem('kn_livechat', v ? 'on' : 'off'); } catch (e) { /* */ } if (!v && box) box.classList.remove('show'); }
  KN.LiveChat = { burst, setOn, isOn: on, POOLS: { POOL, HATER, GIANGHO, NAMES, GH_NAMES, COLORS }, pickR };
})();
