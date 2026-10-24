/* Một Kiếp Người — minigame truyền hình (đăng ký vào KN.Mini):
   💰 'millionaire' — "Ai là triệu phú": 15 câu, 3 quyền trợ giúp (50:50 · hỏi khán giả · gọi điện người thân), mốc an toàn câu 5 và 10, dừng lấy tiền bất cứ lúc nào.
      Điểm trả về = số câu giữ được / 15 (game quy ra tiền thưởng theo bậc PRIZES).
   🎤 'sing' — thi hát truyền hình: nốt nhạc rơi trên 4 làn (D F J K hoặc ← ↓ ↑ →), bấm đúng lúc chạm vạch. 4 huấn luyện viên quay ghế khi bạn hát đủ hay. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const money = (v) => (v >= 1e6 ? (v / 1e6).toLocaleString('vi-VN') + ' triệu' : (v / 1e3).toLocaleString('vi-VN') + ' nghìn') + ' đồng';
  // ---------------------------------------------------------------- khung chung
  let root = null, keyH = null, timers = [];
  function open(html) {
    close();
    root = document.createElement('div'); root.className = 'mini'; root.innerHTML = '<div class="mini-box sb-box">' + html + '</div>';
    document.body.appendChild(root);
    if (KN.Mini && KN.Mini.playing && KN.Mini.playing()) { const qb = document.createElement('button'); qb.type = 'button'; qb.className = 'mini-quit'; qb.textContent = '✖ Thoát'; qb.title = 'Bỏ dở minigame, để số phận quyết định'; qb.onclick = (e) => { e.preventDefault(); e.stopPropagation(); KN.Mini.abort(); }; root.querySelector('.mini-box').appendChild(qb); }
    return root;
  }
  function close() {
    timers.forEach((t) => { clearInterval(t); clearTimeout(t); cancelAnimationFrame(t); }); timers = [];
    if (keyH) { window.removeEventListener('keydown', keyH, true); window.removeEventListener('keyup', keyH, true); keyH = null; }
    if (root) { root.remove(); root = null; }
  }
  function onKeys(fn) { keyH = (e) => { if (fn(e) !== false) { e.preventDefault(); e.stopPropagation(); } }; window.addEventListener('keydown', keyH, true); window.addEventListener('keyup', keyH, true); }

  // ================================================================ 💰 AI LÀ TRIỆU PHÚ
  const PRIZES = [0, 2e5, 4e5, 6e5, 1e6, 2e6, 3e6, 6e6, 1e7, 1.4e7, 2.2e7, 3e7, 4e7, 8e7, 1.5e8, 2.5e8];
  // [câu hỏi, đáp án đúng, [3 đáp án sai]] — bậc 1: câu 1–5, bậc 2: câu 6–10, bậc 3: câu 11–15
  const QB = {
    1: [
      ['Con vật nào được gọi là "chúa sơn lâm"?', 'Con hổ', ['Sư tử', 'Con gấu', 'Con voi']],
      ['Bánh chưng thường được gói bằng lá gì?', 'Lá dong', ['Lá chuối', 'Lá sen', 'Lá bàng']],
      ['Tết Trung thu rơi vào ngày nào âm lịch?', '15 tháng 8', ['15 tháng 1', '1 tháng 1', '5 tháng 5']],
      ['Lá cây có màu xanh chủ yếu nhờ chất gì?', 'Diệp lục', ['Tinh bột', 'Muối khoáng', 'Đường']],
      ['Ngôi sao trên Quốc kỳ Việt Nam có màu gì?', 'Vàng', ['Trắng', 'Đỏ', 'Xanh']],
      ['Câu "Ăn quả nhớ kẻ trồng cây" khuyên ta điều gì?', 'Biết ơn', ['Chăm chỉ', 'Tiết kiệm', 'Dũng cảm']],
      ['Đơn vị tiền tệ của Việt Nam là gì?', 'Đồng', ['Yên', 'Won', 'Baht']],
      ['Hồ Gươm nằm ở thành phố nào?', 'Hà Nội', ['Huế', 'Hải Phòng', 'Đà Nẵng']],
      ['Bộ phận nào của cây hút nước từ đất?', 'Rễ', ['Lá', 'Hoa', 'Quả']],
      ['Môn thể thao nào được gọi là "môn thể thao vua"?', 'Bóng đá', ['Bóng rổ', 'Quần vợt', 'Bơi lội']],
      ['7 nhân 8 bằng bao nhiêu?', '56', ['54', '63', '48']],
      ['Con vật nào có chiếc vòi dài?', 'Con voi', ['Con hươu', 'Con tê giác', 'Con ngựa']],
      ['Trái Đất quay quanh thiên thể nào?', 'Mặt Trời', ['Mặt Trăng', 'Sao Hỏa', 'Sao Bắc Đẩu']],
      ['Thành phố nào được gọi là "thành phố ngàn hoa"?', 'Đà Lạt', ['Huế', 'Nha Trang', 'Sa Pa']],
      ['Vịnh Hạ Long thuộc tỉnh nào?', 'Quảng Ninh', ['Hải Phòng', 'Thái Bình', 'Nam Định']],
      ['Một tuần có bao nhiêu ngày?', '7', ['5', '6', '8']],
      ['Người ta dùng gì để đo nhiệt độ cơ thể?', 'Nhiệt kế', ['Cân', 'Thước dây', 'La bàn']],
      ['"Cõng rắn cắn gà nhà" chỉ hành động gì?', 'Rước kẻ xấu về hại người mình', ['Nuôi gà trong nhà', 'Bắt rắn cứu gà', 'Chăm chỉ làm ăn']],
      ['Màu trộn từ xanh lam và vàng là màu gì?', 'Xanh lá', ['Tím', 'Cam', 'Nâu']],
      ['Loài chim nào là biểu tượng của hòa bình?', 'Bồ câu', ['Đại bàng', 'Chim sẻ', 'Quạ']],
    ],
    2: [
      ['Ai là tác giả "Truyện Kiều"?', 'Nguyễn Du', ['Nguyễn Trãi', 'Hồ Xuân Hương', 'Nguyễn Đình Chiểu']],
      ['"Bình Ngô đại cáo" do ai viết?', 'Nguyễn Trãi', ['Lê Lợi', 'Nguyễn Du', 'Trần Hưng Đạo']],
      ['Hành tinh lớn nhất trong Hệ Mặt Trời là?', 'Sao Mộc', ['Sao Thổ', 'Trái Đất', 'Sao Hỏa']],
      ['Ký hiệu hóa học của vàng là gì?', 'Au', ['Ag', 'Fe', 'Cu']],
      ['Châu lục nào rộng lớn nhất?', 'Châu Á', ['Châu Phi', 'Châu Mỹ', 'Châu Âu']],
      ['Kim tự tháp Giza nằm ở nước nào?', 'Ai Cập', ['Mexico', 'Hy Lạp', 'Ấn Độ']],
      ['Ai là người đầu tiên đặt chân lên Mặt Trăng?', 'Neil Armstrong', ['Yuri Gagarin', 'Buzz Aldrin', 'Phạm Tuân']],
      ['Phạm Tuân là người Việt Nam đầu tiên làm gì?', 'Bay vào vũ trụ', ['Leo lên đỉnh Everest', 'Đoạt huy chương Olympic', 'Đi vòng quanh thế giới']],
      ['Năm 1010, vua Lý Thái Tổ dời đô về đâu?', 'Thăng Long', ['Hoa Lư', 'Phú Xuân', 'Cổ Loa']],
      ['Chiến thắng Bạch Đằng năm 938 do ai lãnh đạo?', 'Ngô Quyền', ['Trần Hưng Đạo', 'Lê Lợi', 'Lý Thường Kiệt']],
      ['Đại dương lớn nhất thế giới là?', 'Thái Bình Dương', ['Đại Tây Dương', 'Ấn Độ Dương', 'Bắc Băng Dương']],
      ['Đơn vị đo cường độ dòng điện là gì?', 'Ampe', ['Vôn', 'Oát', 'Ôm']],
      ['Ai là tác giả bức tranh "Mona Lisa"?', 'Leonardo da Vinci', ['Pablo Picasso', 'Van Gogh', 'Michelangelo']],
      ['Hai Bà Trưng khởi nghĩa chống ách đô hộ của nhà nào?', 'Nhà Hán', ['Nhà Tống', 'Nhà Nguyên', 'Nhà Minh']],
      ['Nhạc sĩ nào sáng tác "Tiến quân ca"?', 'Văn Cao', ['Phạm Tuyên', 'Trịnh Công Sơn', 'Hoàng Vân']],
      ['Đơn vị tiền tệ của Thái Lan là?', 'Baht', ['Ringgit', 'Rupiah', 'Peso']],
      ['Loài động vật nào lớn nhất hiện nay?', 'Cá voi xanh', ['Voi châu Phi', 'Cá mập trắng', 'Hươu cao cổ']],
      ['Nước nào có hình dạng giống chiếc ủng?', 'Ý', ['Pháp', 'Chile', 'Na Uy']],
      ['Trong cơ thể người, cơ quan nào bơm máu?', 'Tim', ['Gan', 'Phổi', 'Thận']],
      ['Thủ đô của Nhật Bản là?', 'Tokyo', ['Osaka', 'Kyoto', 'Seoul']],
    ],
    3: [
      ['Nguyên tố có số hiệu nguyên tử bằng 1 là?', 'Hiđro', ['Heli', 'Oxi', 'Liti']],
      ['Thủ đô của nước Úc là?', 'Canberra', ['Sydney', 'Melbourne', 'Perth']],
      ['Vị vua cuối cùng của triều Nguyễn là ai?', 'Bảo Đại', ['Khải Định', 'Duy Tân', 'Hàm Nghi']],
      ['Hiệp định Paris về chấm dứt chiến tranh ở Việt Nam được ký năm nào?', '1973', ['1968', '1975', '1954']],
      ['Nhà toán học Việt Nam nào đoạt giải Fields năm 2010?', 'Ngô Bảo Châu', ['Lê Bá Khánh Trình', 'Hoàng Tụy', 'Đàm Thanh Sơn']],
      ['Phim nói tiếng nước ngoài đầu tiên đoạt Oscar "Phim hay nhất" (2020) là?', 'Ký sinh trùng', ['Joker', '1917', 'Roma']],
      ['Xương dài nhất trong cơ thể người là?', 'Xương đùi', ['Xương cánh tay', 'Xương chày', 'Xương sườn']],
      ['"Nhật ký trong tù" được Bác Hồ viết bằng chữ gì?', 'Chữ Hán', ['Chữ Quốc ngữ', 'Chữ Nôm', 'Tiếng Pháp']],
      ['Thành nhà Hồ (di sản thế giới) nằm ở tỉnh nào?', 'Thanh Hóa', ['Ninh Bình', 'Nghệ An', 'Hà Tĩnh']],
      ['Việt Nam trở thành thành viên WTO vào năm nào?', '2007', ['1995', '2000', '2010']],
      ['Việt Nam gia nhập ASEAN năm nào?', '1995', ['1986', '1999', '2007']],
      ['Kênh đào Suez nối Địa Trung Hải với biển nào?', 'Biển Đỏ', ['Biển Đen', 'Biển Bắc', 'Biển Caspi']],
      ['Ai là tác giả tiểu thuyết "Số đỏ"?', 'Vũ Trọng Phụng', ['Nam Cao', 'Ngô Tất Tố', 'Nguyễn Tuân']],
      ['Tác phẩm "Tắt đèn" là của nhà văn nào?', 'Ngô Tất Tố', ['Nam Cao', 'Tô Hoài', 'Kim Lân']],
      ['Khí nào chiếm tỉ lệ lớn nhất trong khí quyển Trái Đất?', 'Nitơ', ['Oxi', 'Cacbonic', 'Agon']],
      ['Đỉnh Everest thuộc dãy núi nào?', 'Himalaya', ['Andes', 'Alps', 'Trường Sơn']],
      ['Ai là người đề ra thuyết tương đối?', 'Albert Einstein', ['Isaac Newton', 'Nikola Tesla', 'Galileo Galilei']],
      ['Cùng với Paul Allen, ai đồng sáng lập Microsoft?', 'Bill Gates', ['Steve Jobs', 'Mark Zuckerberg', 'Larry Page']],
      ['Quần đảo Trường Sa thuộc tỉnh nào của Việt Nam?', 'Khánh Hòa', ['Đà Nẵng', 'Bình Thuận', 'Quảng Ngãi']],
      ['Chiến dịch Hồ Chí Minh toàn thắng vào ngày nào?', '30/4/1975', ['2/9/1975', '7/5/1954', '27/1/1973']],
    ],
  };
  const CALL = ['Bố', 'Mẹ', 'Thằng bạn thân', 'Cô giáo cũ', 'Ông hàng xóm'];
  function millionaire(p) {
    return new Promise((res) => {
      const smart = (p.ctx && p.ctx.stats && p.ctx.stats.smarts) || 60, limit = smart >= 80 ? 45 : 30;
      // CONFIG: mốc an toàn câu 5/10; bấm giờ chỉ ở câu 1–5 (30s, trí tuệ ≥80 → 45s); từ câu 6 phải bấm lần 2 để chốt đáp án; 4 quyền trợ giúp gồm đổi câu hỏi
      const mk = (t, q) => ({ t, q: q[0], a: q[1], opts: shuffle([q[1]].concat(q[2])) });
      const pools = { 1: shuffle(QB[1].slice()), 2: shuffle(QB[2].slice()), 3: shuffle(QB[3].slice()) };
      const qs = [1, 2, 3].flatMap((t) => pools[t].splice(0, 5).map((q) => mk(t, q)));
      let pendK = -1;
      let i = 0, safe = 0, used = { ff: false, aud: false, call: false, swap: false }, left = limit, locked = false, done = false, hidden = [];
      const box = open('<div class="mini-head"><b>💰 Ai là triệu phú</b><small class="mini-hud" id="tpHud"></small></div><div class="tp"><div class="tp-ladder" id="tpLad"></div><div class="tp-main"><div class="tp-life"><button type="button" data-l="ff">50:50</button><button type="button" data-l="aud">👥 Khán giả</button><button type="button" data-l="call">📞 Gọi điện</button><button type="button" data-l="swap">🔄 Đổi câu</button><button type="button" data-l="stop" class="stop">✋ Dừng cuộc chơi</button></div><div class="tp-help" id="tpHelp"></div><div class="tp-q" id="tpQ"></div><div class="tp-opts" id="tpO"></div><div class="tp-timer"><i id="tpT"></i></div></div></div><p class="mini-keys">⌨️ Chọn đáp án bằng <kbd>1</kbd>–<kbd>4</kbd> hoặc <kbd>A</kbd>–<kbd>D</kbd>. Sai là rơi về mốc an toàn (câu 5 hoặc 10). Muốn chắc ăn thì dừng cuộc chơi để mang tiền về.</p>');
      const lad = box.querySelector('#tpLad');
      const end = (idx, why) => {
        if (done) return; done = true; timers.forEach((t) => clearInterval(t));
        const prize = PRIZES[idx];
        setTimeout(() => res({ score: idx / 15, text: why + ' Bạn mang về ' + (prize ? money(prize) : '0 đồng') + '.' }), 1600);
      };
      const drawLadder = () => { lad.innerHTML = PRIZES.slice(1).map((v, k) => '<div class="' + (k + 1 === i + 1 ? 'cur ' : '') + (k + 1 <= i ? 'ok ' : '') + (k + 1 === 5 || k + 1 === 10 ? 'safe' : '') + '"><span>' + (k + 1) + '</span><b>' + (v >= 1e6 ? v / 1e6 + ' tr' : v / 1e3 + 'k') + '</b></div>').reverse().join(''); };
      const show = () => {
        const q = qs[i]; locked = false; hidden = []; left = limit; pendK = -1; const tb = box.querySelector('.tp-timer'); if (tb) tb.style.visibility = i < 5 ? '' : 'hidden';
        box.querySelector('#tpHelp').innerHTML = '';
        box.querySelector('#tpQ').innerHTML = '<small>Câu ' + (i + 1) + ' · ' + money(PRIZES[i + 1]) + '</small>' + esc(q.q);
        box.querySelector('#tpO').innerHTML = q.opts.map((o, k) => '<button type="button" data-k="' + k + '"><b>' + 'ABCD'[k] + ':</b> ' + esc(o) + '</button>').join('');
        box.querySelector('#tpHud').textContent = 'Đang giữ: ' + money(PRIZES[i]);
        drawLadder(); sfx('notify');
      };
      const answer = (k) => {
        if (locked || done) return; const q = qs[i]; if (hidden.includes(k)) return;
        if (i >= 5 && pendK !== k) { pendK = k; box.querySelectorAll('#tpO button').forEach((b, x) => b.classList.toggle('pend', x === k)); box.querySelector('#tpHelp').innerHTML = '<div class="tp-call">❓ Chốt đáp án ' + 'ABCD'[k] + '? Bấm lại để xác nhận.</div>'; sfx('click'); return; }
        locked = true;
        const btns = box.querySelectorAll('#tpO button'); btns[k].classList.add('lock');
        setTimeout(() => {
          const ok = q.opts[k] === q.a, right = q.opts.indexOf(q.a);
          btns[right].classList.add('right'); if (!ok) btns[k].classList.add('wrong');
          if (ok) { sfx(i === 14 ? 'cheer' : 'good'); i++; if (i === 5 || i === 10) safe = i; if (i >= 15) { drawLadder(); end(15, '🏆 TRIỆU PHÚ! Bạn trả lời đúng cả 15 câu hỏi!'); } else setTimeout(show, 1300); }
          else { sfx('bad'); end(safe, 'Rất tiếc, đáp án đúng là ' + 'ABCD'[right] + ': ' + q.a + '.'); }
        }, 1100);
      };
      box.querySelector('.tp-life').onclick = (e) => {
        const b = e.target.closest('[data-l]'); if (!b || locked || done) return; const l = b.dataset.l, q = qs[i], right = q.opts.indexOf(q.a), help = box.querySelector('#tpHelp');
        if (l === 'stop') { locked = true; sfx('click'); end(i, 'Bạn quyết định dừng cuộc chơi ở câu ' + (i + 1) + '.'); return; }
        if (used[l]) return; used[l] = true; b.disabled = true; sfx('click');
        if (l === 'swap') { const sp = pools[q.t].shift(); if (sp) { qs[i] = mk(q.t, sp); show(); help.innerHTML = '<div class="tp-call">🔄 Đã đổi sang câu hỏi khác cùng độ khó.</div>'; } return; }
        if (l === 'ff') { const wrong = shuffle([0, 1, 2, 3].filter((x) => x !== right)).slice(0, 2); hidden = wrong; wrong.forEach((x) => box.querySelectorAll('#tpO button')[x].classList.add('gone')); }
        else if (l === 'aud') {
          const base = q.t === 1 ? 0.75 : q.t === 2 ? 0.55 : 0.38, votes = [0, 1, 2, 3].map((x) => (hidden.includes(x) ? 0 : x === right ? base + Math.random() * 0.2 : Math.random() * 0.3)), sum = votes.reduce((a, b) => a + b, 0);
          help.innerHTML = '<div class="tp-aud">' + votes.map((v, x) => '<div><i style="height:' + Math.round(v / sum * 100) + '%"></i><small>' + 'ABCD'[x] + ' ' + Math.round(v / sum * 100) + '%</small></div>').join('') + '</div>';
        } else {
          const who = pick(CALL), sure = q.t === 1 ? 0.92 : q.t === 2 ? 0.75 : 0.55, ok = Math.random() < sure + (smart - 60) / 300, pickK = ok ? right : pick([0, 1, 2, 3].filter((x) => x !== right && !hidden.includes(x)));
          help.innerHTML = '<div class="tp-call">📞 ' + who + ': "' + (Math.random() < 0.15 ? 'Ơ… alo? Câu gì cơ? À… chắc là ' + 'ABCD'[pickK] + ' đấy, nhưng đừng tin lắm!' : 'Theo mình là ' + 'ABCD'[pickK] + ', chắc khoảng ' + Math.round((ok ? 60 : 35) + Math.random() * 30) + ' phần trăm.') + '"</div>';
        }
      };
      box.querySelector('#tpO').onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) answer(+b.dataset.k); };
      onKeys((e) => { if (e.type !== 'keydown') return false; const m = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 }[e.key.toLowerCase()]; if (m == null) return false; answer(m); return true; });
      timers.push(setInterval(() => { if (locked || done || i >= 5) return; left -= 0.1; const bar = box.querySelector('#tpT'); if (bar) bar.style.width = Math.max(0, left / limit * 100) + '%'; if (left <= 0) { locked = true; sfx('bad'); end(safe, 'Hết giờ suy nghĩ!'); } }, 100));
      show();
    });
  }
  // ================================================================ 🎤 THI HÁT: nốt nhạc rơi 4 làn
  const LYRICS = {
    tre: ['Ngày mai nắng lên trên phố quen', 'Mình vẫn bước đi dù xa vắng', 'Gió mang theo những câu hát hôm nào', 'Tim này vẫn hát cho em nghe', 'Dù cho thế giới quay vòng', 'Ta vẫn là ta, không quên lối về'],
    bolero: ['Chiều quê mưa giăng lối ngõ xưa', 'Người đi biền biệt mấy mùa thu', 'Còn đây câu hò ru tuổi thơ', 'Nhớ thương ơi theo cánh cò bay', 'Đêm nay trăng sáng bên sông', 'Lòng ai thương nhớ một người phương xa'],
  };
  const LANE_KEYS = [['d', 'arrowleft'], ['f', 'arrowdown'], ['j', 'arrowup'], ['k', 'arrowright']];
  const JUDGES = [['HLV Tóc Xoăn', 0.5], ['HLV Giọng Khàn', 0.62], ['HLV Diva', 0.74], ['HLV Khó Tính', 0.86]];
  function sing(p) {
    return new Promise((res) => {
      const st = (p.ctx && p.ctx.stats) || {}, bolero = /bolero|tru tinh|trữ tình|que huong|quê hương/i.test((p.label || '') + ' ' + (p.title || ''));
      const gap = (bolero ? 0.62 : 0.44) * (1 - (p.need || 0.5) * 0.25), dur = 26, speed = 260, hitY = 330;
      const win = 0.07 + Math.min(40, Math.max(0, (st.happy || 50) + (st.looks || 50) - 80)) / 1000; // vùng "chuẩn" rộng hơn khi vui vẻ, tự tin
      const notes = []; let t = 1.6;
      while (t < dur) { const lane = Math.floor(Math.random() * 4); notes.push({ t, lane, hit: null }); if (Math.random() < 0.18 && t > 4) notes.push({ t, lane: (lane + 2) % 4, hit: null }); t += gap * (Math.random() < 0.25 ? 0.5 : 1); }
      const box = open('<div class="mini-head"><b>🎤 ' + esc(p.title || 'Thi hát') + '</b><small class="mini-hud" id="sgHud"></small></div><div class="sg-judges" id="sgJ">' + JUDGES.map((j) => '<div><span>🪑</span><small>' + esc(j[0]) + '</small></div>').join('') + '</div><canvas class="mini-cv" width="640" height="400"></canvas><div class="mini-pad sg-pad">' + ['D', 'F', 'J', 'K'].map((k, i) => '<button type="button" data-lane="' + i + '">' + k + '</button>').join('') + '</div><p class="mini-keys">⌨️ Bấm <kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> (hoặc <kbd>←</kbd> <kbd>↓</kbd> <kbd>↑</kbd> <kbd>→</kbd>) đúng lúc nốt chạm vạch sáng. Hát hay thì các HLV quay ghế!</p>');
      const cv = box.querySelector('canvas'), c = cv.getContext('2d'), hud = box.querySelector('#sgHud'), jbox = box.querySelector('#sgJ').children;
      let t0 = performance.now(), score = 0, maxScore = 0, combo = 0, best = 0, flash = [0, 0, 0, 0], msg = '', msgT = 0, turned = 0, done = false;
      const lyr = LYRICS[bolero ? 'bolero' : 'tre'];
      const hit = (lane) => {
        if (done) return; const now = (performance.now() - t0) / 1000; flash[lane] = 0.15;
        let bestN = null, bd = 9; notes.forEach((n) => { if (n.lane === lane && n.hit == null) { const d = Math.abs(n.t - now); if (d < bd) { bd = d; bestN = n; } } });
        if (!bestN || bd > 0.22) { combo = 0; return; }
        if (bd < win) { bestN.hit = 1; score += 1; combo++; msg = pick(['Tuyệt vời!', 'Chuẩn!', 'Hay quá!']); }
        else { bestN.hit = 0.55; score += 0.55; combo++; msg = 'Được!'; }
        msgT = 0.5; best = Math.max(best, combo); if (combo && combo % 10 === 0) sfx('good');
      };
      box.querySelectorAll('[data-lane]').forEach((b) => (b.onpointerdown = (e) => { e.preventDefault(); hit(+b.dataset.lane); }));
      onKeys((e) => { if (e.type !== 'keydown' || e.repeat) return e.type === 'keyup' ? false : true; const k = e.key.toLowerCase(), lane = LANE_KEYS.findIndex((x) => x.includes(k)); if (lane < 0) return false; hit(lane); return true; });
      const frame = () => {
        if (!root || done) return;
        const now = (performance.now() - t0) / 1000;
        notes.forEach((n) => { if (n.hit == null && now - n.t > 0.22) { n.hit = 0; combo = 0; } });
        maxScore = notes.filter((n) => n.t < now - 0.22 || n.hit != null).length;
        const acc = maxScore ? score / maxScore : 0, prog = Math.min(1, now / dur);
        // HLV quay ghế khi độ chính xác đủ cao (sau khi hát được 1/3 bài)
        JUDGES.forEach((j, k) => { if (k >= turned && prog > 0.33 && acc >= j[1]) { turned = k + 1; jbox[k].classList.add('on'); jbox[k].querySelector('span').textContent = '🔄'; sfx('cheer'); msg = j[0] + ' quay ghế!'; msgT = 1.2; } });
        c.fillStyle = '#140f2a'; c.fillRect(0, 0, 640, 400);
        for (let k = 0; k < 12; k++) { c.fillStyle = 'rgba(255,' + (120 + k * 10) + ',200,' + (0.04 + Math.sin(now * 2 + k) * 0.02) + ')'; c.beginPath(); c.arc(40 + k * 52, 40 + Math.sin(now + k) * 12, 30, 0, 7); c.fill(); }
        const lx = (l) => 170 + l * 80;
        for (let l = 0; l < 4; l++) { c.fillStyle = 'rgba(255,255,255,' + (0.05 + flash[l] * 2) + ')'; c.fillRect(lx(l) - 34, 0, 68, 400); flash[l] = Math.max(0, flash[l] - 1 / 60); }
        c.fillStyle = '#ffd23f'; c.fillRect(130, hitY - 3, 380, 6);
        const COL = ['#ff7eb6', '#5cc8ff', '#39cf98', '#ffb347'];
        notes.forEach((n) => { const y = hitY - (n.t - now) * speed; if (y < -20 || y > 420 || n.hit) return; c.fillStyle = COL[n.lane]; c.beginPath(); c.arc(lx(n.lane), y, 18, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#fff'; c.font = '700 15px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♪', lx(n.lane), y + 1); });
        c.fillStyle = 'rgba(255,255,255,.9)'; c.font = '600 17px sans-serif'; c.textAlign = 'center'; c.fillText('“' + lyr[Math.min(lyr.length - 1, Math.floor(prog * lyr.length))] + '”', 320, 375);
        if (msgT > 0) { msgT -= 1 / 60; c.font = '800 30px "Baloo 2", sans-serif'; c.fillStyle = '#ffd23f'; c.fillText(msg, 320, 140); }
        c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(20, 20, 8, 340); c.fillStyle = '#ff7eb6'; c.fillRect(20, 20 + 340 * (1 - prog), 8, 340 * prog);
        hud.textContent = 'Chính xác ' + Math.round(acc * 100) + '% · combo ' + combo + ' · ' + turned + '/4 HLV quay ghế';
        if (now > dur + 1) {
          done = true; const total = notes.length, fin = score / total;
          const sc = Math.min(1, fin * 0.8 + turned * 0.06);
          sfx(turned ? 'cheer' : 'bad');
          setTimeout(() => res({ score: sc, text: 'Bạn hát chính xác ' + Math.round(fin * 100) + '%, combo dài nhất ' + best + '. ' + (turned ? turned + ' huấn luyện viên quay ghế!' : 'Không HLV nào quay ghế…') }), 500);
          return;
        }
        timers.push(requestAnimationFrame(frame));
      };
      timers.push(requestAnimationFrame(frame));
    });
  }
  const wrap = (fn) => (p) => fn(p).then((r) => { close(); return r; });
  function boot() {
    if (!KN.Mini || !KN.Mini.register) return;
    if (KN.Mini.onAbort) KN.Mini.onAbort.push(close);
    KN.Mini.register('millionaire', wrap(millionaire), '💰 Ai là triệu phú', '15 câu hỏi khó dần, mỗi câu 30 giây. Có 3 quyền trợ giúp: 50:50, hỏi ý kiến khán giả, gọi điện cho người thân. Câu 5 và câu 10 là mốc an toàn. Có thể dừng cuộc chơi bất cứ lúc nào để mang tiền về.',
      (p) => 'Trí tuệ ' + Math.round(p.ctx.stats.smarts) + ': ' + (p.ctx.stats.smarts >= 80 ? 'được 45 giây mỗi câu, người thân gọi điện đáng tin hơn' : 'mỗi câu 30 giây'));
    KN.Mini.register('sing', wrap(sing), '🎤 Thi hát', 'Nốt nhạc rơi xuống 4 làn. Bấm D F J K (hoặc ← ↓ ↑ →) đúng lúc nốt chạm vạch vàng. Hát càng chuẩn càng nhiều HLV quay ghế.',
      (p) => 'Hạnh phúc + ngoại hình (tự tin trên sân khấu): vùng bấm chuẩn ' + ((p.ctx.stats.happy + p.ctx.stats.looks) >= 130 ? 'rộng' : 'vừa'));
  }
  boot();
  KN.Show = { PRIZES, _millionaire: millionaire, _sing: sing };
})();
