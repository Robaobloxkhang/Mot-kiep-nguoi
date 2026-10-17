/* Một Kiếp Người — tình yêu người lớn: yêu sau tuổi học trò, tình già, đào mỏ & đại gia, ngoại tình có người tình bí mật.
   Giới tính của người yêu/người tình luôn theo xu hướng tính dục đã chọn (game.js: loveGender, romanceRoles). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const single = ['partner', 'spouse', 'lover'];
  const spouseRel = (max) => (s) => s.people.some((p) => p.alive && p.role === 'spouse' && p.relation < max);
  KN.EVENTS.push(
    // ======================= ĐỘC THÂN TUỔI TRƯỞNG THÀNH =======================
    {
      id: 's_rom_mai_moi', title: 'Mẹ đi mai mối', icon: '👵', age: [23, 45], weight: 1.8,
      req: { lacks: single, has: ['mother'] },
      text: 'Mẹ đi ăn cưới về, hớn hở: “Con bà Tư có đứa {stranger} hiền lành, đi làm ổn định, chưa có ai. Mẹ hẹn rồi, chủ nhật này đi cà phê với người ta đi!”',
      scene: { loc: 'home', anim: 'facepalm', npcs: [{ role: 'mother', anim: 'talk', say: 'Đi đi con, mẹ xem rồi!' }], fx: 'hearts' },
      choices: [
        { label: 'Đi xem mắt cho mẹ vui', mini: 'love',
          success: { stat: 'looks', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Tưởng gượng gạo, ai ngờ nói chuyện hợp đến lạ. {stranger} xin số bạn trước khi về. Mẹ biết chuyện, cười cả tuần.', effects: { happy: 9, rel: { mother: 6 }, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { loc: 'cafe', anim: 'love', fx: 'hearts' } },
            { text: 'Hai người im lặng nhiều hơn nói. Về nhà mẹ hỏi, bạn chỉ bảo: “Không hợp mẹ ạ.”', effects: { happy: -2, rel: { mother: 2 } }, scene: { loc: 'cafe', anim: 'shrug' } }
          ] },
        { label: '“Con tự lo được mà mẹ!”',
          text: 'Mẹ thở dài, lẩm bẩm “đến bao giờ mới có cháu bế”. Bữa cơm hôm đó hơi im ắng.',
          effects: { rel: { mother: -3 } }, scene: { anim: 'shake', npcAnim: { mother: 'sad' } } }
      ]
    },
    {
      id: 's_rom_cong_so', title: 'Tình yêu công sở', icon: '💼', age: [22, 50], weight: 1.6,
      req: { lacks: single, job: true },
      text: 'Phòng bạn có {coworker} mới chuyển về. Mấy hôm nay ly cà phê sáng của bạn cứ “tự nhiên” xuất hiện trên bàn, kèm tờ giấy nhớ vẽ mặt cười.',
      scene: { loc: 'office', anim: 'think', npcs: [{ role: 'coworker', anim: 'wave', say: 'Uống cho tỉnh nhé!' }], fx: 'hearts' },
      choices: [
        { label: 'Rủ {coworker} đi ăn trưa riêng', mini: 'love',
          success: { stat: 'looks', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bữa trưa kéo dài quá giờ nghỉ. Một tháng sau cả phòng đều biết, chỉ có hai người tưởng là bí mật.', effects: { happy: 9, addPerson: { role: 'partner', fromScene: 'coworker' } }, scene: { loc: 'cafe', anim: 'love', fx: 'hearts' } },
            { text: 'Hóa ra {coworker} pha cà phê cho cả phòng, không riêng gì bạn. Bạn cười trừ, ăn nốt bát cơm.', effects: { happy: -3 }, scene: { loc: 'cafe', anim: 'facepalm' } }
          ] },
        { label: 'Giữ khoảng cách, công việc là công việc',
          text: 'Bạn lịch sự cảm ơn và giữ mọi thứ ở mức đồng nghiệp. Yên ổn, nhưng hơi tiếc.',
          effects: { perf: 2 }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_rom_gym', title: 'Người lạ ở phòng gym', icon: '🏋️', age: [18, 45], weight: 1.2,
      req: { lacks: single },
      text: 'Tuần nào cũng gặp {stranger} ở phòng gym lúc 6 giờ chiều. Hôm nay hai người cùng giành một cái máy chạy bộ, nhìn nhau rồi bật cười.',
      scene: { loc: 'gym', anim: 'run', npcs: [{ role: 'stranger', anim: 'laugh', say: 'Bạn chạy trước đi!' }], fx: 'sweat' },
      choices: [
        { label: 'Bắt chuyện, rủ uống sinh tố sau buổi tập', mini: 'love',
          success: { stat: 'looks', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Từ cốc sinh tố thành những buổi chạy bộ ven hồ cuối tuần. Bạn có người yêu, kèm cả cơ bụng.', effects: { happy: 9, health: 2, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: '{stranger} cười: “Mình có người yêu rồi nha.” Bạn chạy thêm 5 cây số cho quên.', effects: { happy: -3, health: 1 }, scene: { anim: 'run', fx: 'sweat' } }
          ] },
        { label: 'Nhường máy, tập tiếp',
          text: 'Bạn nhường máy rồi chuyển sang tạ. Mỗi lần gặp lại hai người gật đầu chào nhau.',
          effects: { health: 1 }, scene: { anim: 'lift' } }
      ]
    },
    {
      id: 's_rom_du_lich', title: 'Chuyến xe đêm lên Đà Lạt', icon: '🌲', age: [19, 55], weight: 1.1,
      req: { lacks: single, minMoney: 3000000 },
      text: 'Chuyến xe giường nằm lên Đà Lạt, bạn nằm cạnh {stranger}. Xe xóc, hai người chia nhau gói bánh, rồi nói chuyện tới tận khi trời sáng ở đèo Prenn.',
      scene: { loc: 'countryside', time: 'dawn', weather: 'fog', anim: 'talk', npcs: [{ role: 'stranger', anim: 'laugh' }], fx: 'hearts' },
      choices: [
        { label: 'Rủ đi chung lịch trình mấy ngày', mini: 'love',
          success: { stat: 'looks', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Ba ngày đồi thông, chợ đêm, ly sữa đậu nóng. Về lại thành phố, hai người vẫn nhắn tin mỗi tối, rồi thành một đôi.', effects: { happy: 10, money: -3000000, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: 'Vui thì vui, nhưng về thành phố ai về nhà nấy. Một kỷ niệm đẹp thôi.', effects: { happy: 4, money: -3000000 }, scene: { anim: 'wave' } }
          ] },
        { label: 'Xin Facebook rồi thôi',
          text: 'Hai người kết bạn, thỉnh thoảng thả tim ảnh của nhau. Có những người chỉ đi cùng nhau một chuyến xe.',
          effects: { happy: 2 }, scene: { anim: 'phone' } }
      ]
    },
    {
      id: 's_rom_dam_cuoi', title: 'Bàn độc thân ở đám cưới', icon: '💒', age: [22, 42], weight: 1.3,
      req: { lacks: single, has: ['friend'] },
      text: 'Đám cưới {friend}, bạn bị xếp vào “bàn độc thân”. Ngồi cạnh là {stranger}, cũng bị cô dâu sắp đặt y hệt. Cả bàn bị MC gọi lên sân khấu chơi trò chơi.',
      scene: { loc: 'wedding', anim: 'laugh', npcs: [{ role: 'friend', anim: 'cheer' }, { role: 'stranger', anim: 'laugh', say: 'Bị sắp đặt rồi!' }], fx: 'petals' },
      choices: [
        { label: 'Lên sân khấu, chơi hết mình cùng {stranger}', mini: 'love',
          success: { stat: 'happy', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Hai người thắng trò “đoán ý đồng đội” và được cô dâu ném hoa trúng tay. Năm sau, đến lượt hai bạn gửi thiệp.', effects: { happy: 10, rel: { friend: 5 }, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: 'Hai người thua thảm, phải uống phạt. Vui, nhưng chỉ dừng ở đó.', effects: { happy: 3 }, scene: { anim: 'laugh' } }
          ] },
        { label: 'Ngồi ăn, chờ về',
          text: 'Bạn ăn hết đĩa tôm hùm, mừng phong bì rồi về sớm.',
          effects: { happy: 1 }, scene: { anim: 'eat' } }
      ]
    },
    {
      id: 's_rom_hop_lop', title: 'Họp lớp 10 năm', icon: '🎓', age: [27, 55], weight: 1.1,
      req: { lacks: single },
      text: 'Họp lớp cấp ba. {classmate} — người ngày xưa bạn từng thầm thích — giờ vẫn độc thân, ngồi đúng ghế cạnh bạn như hồi còn đi học.',
      scene: { loc: 'karaoke', time: 'night', anim: 'sing', npcs: [{ role: 'classmate', anim: 'laugh', say: 'Lâu quá rồi nhỉ!' }, { role: 'crowd', anim: 'dance' }], fx: 'music' },
      choices: [
        { label: 'Thú nhận chuyện ngày xưa', mini: 'love',
          success: { stat: 'looks', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: '“Thật hả? Hồi đó mình cũng…” Hai người cười như hai đứa học trò. Lần này không ai bỏ lỡ nữa.', effects: { happy: 11, addPerson: { role: 'partner', fromScene: 'classmate' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: '{classmate} cười: “Biết mà, cả lớp biết.” Rồi giơ tay khoe nhẫn đính hôn mới đeo tuần trước.', effects: { happy: -3 }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Hát karaoke, ôn chuyện cũ là đủ',
          text: 'Bạn hát bài tủ ngày xưa, cả lớp hò theo. Tuổi trẻ như quay lại một đêm.',
          effects: { happy: 4 }, scene: { anim: 'sing', fx: 'music' } }
      ]
    },
    {
      id: 's_rom_tin_nhan_la', title: 'Tin nhắn từ người lạ', icon: '💬', age: [18, 60], weight: 1,
      req: { lacks: single },
      text: '{stranger} nhắn tin làm quen: ảnh đẹp như người mẫu, nói chuyện ngọt ngào, ngày nào cũng hỏi han. Ba tuần sau: “Em/anh đang kẹt tiền gửi hàng từ nước ngoài về, mình mượn tạm {money:30000000} nha?”',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', npcs: [], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đòi gọi video trước đã', mini: 'love',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Gọi video thì toàn “mạng yếu”, “camera hỏng”. Bạn tra ảnh ngược: ảnh lấy từ tài khoản của một hot girl Thái Lan. Chặn ngay!', effects: { happy: 2, smarts: 1, karma: 1 }, scene: { anim: 'point', fx: 'exclaim' } },
            { text: 'Người ấy bật camera vài giây rồi tắt, khóc lóc kể khổ. Bạn mềm lòng chuyển tiền. Ngay hôm sau, tài khoản bay màu.', effects: { money: -30000000, happy: -10 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Chuyển luôn, tin người',
          text: 'Bạn chuyển tiền. Tin nhắn cuối cùng bạn nhận được là “Cảm ơn nha”, rồi bị chặn vĩnh viễn.',
          effects: { money: -30000000, happy: -12 }, scene: { anim: 'cry', fx: 'heartbreak' } }
      ]
    },
    {
      id: 's_rom_bo_don_than', title: 'Gà trống/mái nuôi con', icon: '👨‍👧', age: [30, 65], weight: 1.4,
      req: { lacks: single, has: ['child'] },
      text: 'Một mình nuôi con đã mấy năm. Ở buổi họp phụ huynh, {stranger} — phụ huynh của bạn cùng lớp con bạn, cũng một mình nuôi con — mời bạn cà phê “bàn chuyện tụi nhỏ”.',
      scene: { loc: 'school', anim: 'talk', npcs: [{ role: 'stranger', anim: 'talk', say: 'Cà phê không?' }, { role: 'kid', anim: 'jump' }], fx: 'hearts' },
      choices: [
        { label: 'Nhận lời, biết đâu đấy', mini: 'love',
          success: { stat: 'happy', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Hai người lớn hiểu nhau ngay từ câu chuyện đưa đón con. Mấy tháng sau, cuối tuần hai nhà hay đi chơi chung. Con bạn bảo: “Bố/mẹ dạo này hay cười.”', effects: { happy: 10, rel: { child: 4 }, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { loc: 'park', anim: 'love', fx: 'hearts' } },
            { text: 'Cà phê vui, nhưng con bạn chưa sẵn sàng đón ai mới. Hai người quyết định làm bạn.', effects: { happy: 1 }, scene: { loc: 'cafe', anim: 'nod' } }
          ] },
        { label: 'Con là ưu tiên, chưa nghĩ tới',
          text: 'Bạn từ chối khéo. Tối đó hai bố/mẹ con xem phim hoạt hình, ăn bỏng ngô.',
          effects: { rel: { child: 3 } }, scene: { loc: 'home', anim: 'sit' } }
      ]
    },
    {
      id: 's_rom_tinh_gia', title: 'Bạn già ở câu lạc bộ dưỡng sinh', icon: '👴', age: [58, 92], weight: 1.6,
      req: { lacks: single },
      text: 'Sáng nào ở câu lạc bộ dưỡng sinh cũng có {stranger} đến sớm, để phần bạn chỗ đứng cạnh mình, mang theo hộp xôi nóng. Con cháu bạn bắt đầu trêu: “Ông/bà có bạn già rồi à?”',
      scene: { loc: 'park', time: 'dawn', anim: 'dance', npcs: [{ role: 'stranger', anim: 'dance', say: 'Ăn xôi không?' }, { role: 'crowd', anim: 'dance' }], fx: 'hearts' },
      choices: [
        { label: 'Rủ đi dạo bờ hồ sau buổi tập', mini: 'love',
          success: { stat: 'happy', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Hai người đi chậm quanh hồ, kể chuyện đời mình. Tuổi già bỗng có người để gọi điện mỗi tối, có người nhắc uống thuốc.', effects: { happy: 12, health: 2, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: 'Con cái {stranger} phản đối kịch liệt chuyện “già còn yêu đương”. Hai người đành chỉ làm bạn tập chung.', effects: { happy: -3 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Cảm ơn hộp xôi, vậy là đủ',
          text: 'Bạn nhận hộp xôi, nói lời cảm ơn. Tình bạn tuổi già cũng ấm áp lắm.',
          effects: { happy: 3 }, scene: { anim: 'eat' } }
      ]
    },
    {
      id: 's_rom_duoc_cau_hon', title: 'Được cầu hôn', icon: '💍', age: [21, 70], weight: 1.4,
      req: { has: ['partner'], lacks: ['spouse'], cond: (s) => s.people.some((p) => p.alive && p.role === 'partner' && p.relation >= 55) },
      text: 'Tối kỷ niệm ngày yêu, {partner} bỗng quỳ xuống giữa nhà hàng, mở hộp nhẫn. Cả quán im phăng phắc chờ câu trả lời của bạn.',
      scene: { loc: 'cafe', time: 'night', anim: 'love', expr: 'surprised', npcs: [{ role: 'partner', anim: 'bow', say: 'Mình cưới nhau nhé?' }, { role: 'crowd', anim: 'clap' }], fx: 'hearts', shot: 'dramatic' },
      choices: [
        { label: 'Gật đầu: “Đồng ý!”',
          text: 'Bạn bật khóc, gật đầu lia lịa. Cả quán vỗ tay. Mấy tháng sau, đám cưới linh đình, hai họ nâng ly chúc mừng.',
          effects: { happy: 14, marry: true, money: -60000000, rel: { mother: 4 } }, scene: { loc: 'wedding', anim: 'love', fx: ['petals', 'hearts'], npcAnim: { partner: 'love' } } },
        { label: '“Cho mình thêm thời gian…”',
          text: '{partner} cười gượng, cất hộp nhẫn. Không khí cả buổi tối chùng xuống.',
          effects: { happy: -3, rel: { partner: -12 } }, scene: { anim: 'sad', npcAnim: { partner: 'sad' } } }
      ]
    },

    // ======================= ĐÀO MỎ & ĐẠI GIA =======================
    {
      id: 's_rom_dao_mo', title: 'Người đẹp bỗng để ý', icon: '💎', age: [30, 80], weight: 1.3,
      req: { lacks: ['partner', 'spouse'], minMoney: 2000000000, notFlag: 's_rom_dao_mo' },
      text: 'Từ khi bạn giàu, ở đâu cũng có người để ý. Lần này là {stranger}, kém bạn cả chục tuổi, đẹp như hoa hậu, chủ động làm quen ở bữa tiệc: “Em thích người đàn ông/phụ nữ thành đạt như anh/chị.”',
      scene: { loc: 'karaoke', time: 'night', anim: 'drink', npcs: [{ role: 'stranger', anim: 'love', say: 'Anh/chị phong độ quá!' }], fx: 'hearts' },
      choices: [
        { label: 'Hẹn hò, tận hưởng tuổi xuân thứ hai',
          text: 'Những bữa tối sang trọng, những bức ảnh check-in khắp nơi. Bạn thấy mình trẻ lại mười tuổi. Bạn bè thì nhìn nhau, không ai nói gì.',
          effects: { happy: 9, money: -50000000, flag: ['s_rom_dao_mo', 's_rom_dao_mo_on'], addPerson: { role: 'partner', fromScene: 'stranger' }, followUp: { id: 's_rom_dao_mo_lo', delay: 1 } },
          scene: { anim: 'love', fx: 'hearts' } },
        { label: 'Thử lòng: giả vờ vừa phá sản',
          outcomes: [
            { p: 0.7, text: 'Bạn kể công ty sắp phá sản, nhà sắp bị siết nợ. Ba hôm sau {stranger} “bận”, một tuần sau thì chặn số. May mà biết sớm.', effects: { happy: -2, smarts: 1, flag: 's_rom_dao_mo' }, scene: { anim: 'facepalm', fx: 'question' } },
            { p: 0.3, text: 'Bất ngờ, {stranger} nắm tay bạn: “Vậy thì mình làm lại từ đầu, em/anh phụ một tay.” Hóa ra có người thật lòng.', effects: { happy: 12, flag: 's_rom_dao_mo', addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { anim: 'hug', fx: 'hearts' } }
          ] },
        { label: 'Từ chối: “Tiền thì có, tim thì không”',
          text: 'Bạn cười, nâng ly rồi quay đi. Có những thứ tiền không mua được, và bạn không định mua.',
          effects: { karma: 2, flag: 's_rom_dao_mo' }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_rom_dao_mo_lo', title: 'Lộ mặt đào mỏ', icon: '🪙', age: [30, 85], chainOnly: true,
      req: { has: ['partner'], flag: 's_rom_dao_mo_on' },
      text: '{partner} bắt đầu đòi hỏi: chiếc xe Mercedes, căn hộ đứng tên mình, chuyển khoản “tiêu vặt” mỗi tháng. “Yêu em/anh thật thì chứng minh đi, không thì chia tay!”',
      scene: { loc: 'home', anim: 'think', expr: 'sad', npcs: [{ role: 'partner', anim: 'angry', say: 'Chứng minh đi!' }], fx: 'money' },
      choices: [
        { label: 'Chiều theo, sang tên căn hộ',
          outcomes: [
            { p: 0.25, text: 'Bạn sang tên căn hộ. {partner} ở lại, chăm bạn chu đáo. Người ngoài vẫn bàn tán, nhưng bạn thấy đủ.', effects: { moneyPct: -0.25, happy: 4, rel: { partner: 15 }, unflag: 's_rom_dao_mo_on' }, scene: { anim: 'hug', fx: 'hearts' } },
            { p: 0.75, text: 'Sổ đỏ vừa sang tên được hai tuần, {partner} dọn đồ đi mất, số điện thoại không liên lạc được. Căn hộ đã bị bán lại. Bạn ngồi trong căn nhà trống, cười như mếu.', effects: { moneyPct: -0.25, happy: -16, removePerson: 'partner', unflag: 's_rom_dao_mo_on' }, scene: { anim: 'cry', fx: 'heartbreak' } }
          ] },
        { label: 'Đưa ra hợp đồng tiền hôn nhân', mini: 'haggle',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: '{partner} đọc hợp đồng, mặt biến sắc, rồi đóng sầm cửa bỏ đi. Đau, nhưng tài sản cả đời của bạn còn nguyên.', effects: { happy: -6, karma: 2, removePerson: 'partner', unflag: 's_rom_dao_mo_on' }, scene: { anim: 'sad', fx: 'heartbreak' } },
            { text: 'Bạn mềm lòng trước nước mắt, xé luôn hợp đồng. Tháng sau, tài khoản bị “mượn” thêm một khoản lớn.', effects: { moneyPct: -0.12, happy: -4, unflag: 's_rom_dao_mo_on' }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Nói thẳng rồi chia tay',
          text: '“Chúng ta không hợp.” {partner} cười khẩy, lấy hết quà đã được tặng rồi đi. Bạn mất một mối tình, nhưng giữ được tự trọng.',
          effects: { happy: -6, karma: 2, removePerson: 'partner', unflag: 's_rom_dao_mo_on' }, scene: { anim: 'shake', fx: 'heartbreak' } }
      ]
    },
    {
      id: 's_rom_bao_nuoi', title: 'Lời đề nghị “bao nuôi”', icon: '💰', age: [18, 35], weight: 1,
      req: { lacks: ['spouse'], minStat: { looks: 65 }, maxMoney: 100000000, notFlag: 's_rom_bao_nuoi' },
      text: 'Một đại gia hơn bạn hai mươi mấy tuổi, đã có gia đình, nhắn tin: “Em/anh cứ sống thoải mái: căn hộ cao cấp, 50 triệu mỗi tháng tiêu vặt. Chỉ cần ở bên khi anh/chị rảnh.”',
      scene: { loc: 'cafe', time: 'night', anim: 'phone', expr: 'surprised', npcs: [{ role: 'stranger', anim: 'talk', say: 'Nghĩ kỹ đi.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhận lời, đời là để hưởng',
          text: 'Bạn chuyển vào căn hộ view sông, tài khoản ting ting đều đặn. Ảnh sống ảo lung linh, nhưng những đêm “người ấy” về với gia đình, căn hộ rộng thênh thang.',
          effects: { money: 400000000, happy: 4, karma: -10, flag: ['s_rom_bao_nuoi', 's_rom_bao_nuoi_on'], followUp: { id: 's_rom_danh_ghen', delay: 1 } },
          scene: { loc: 'home', anim: 'cheer', fx: 'money' } },
        { label: 'Từ chối, tự kiếm tiền bằng sức mình',
          text: 'Bạn chặn số. Lương còn ít, nhưng tối về ngủ ngon.',
          effects: { karma: 4, happy: 1, flag: 's_rom_bao_nuoi' }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_rom_danh_ghen', title: 'Bị đánh ghen', icon: '😡', age: [18, 40], chainOnly: true,
      req: { flag: 's_rom_bao_nuoi_on' },
      text: 'Chiều chủ nhật, cửa căn hộ bị đập rầm rầm. Vợ/chồng của đại gia kéo theo ba người họ hàng xông vào, tay cầm điện thoại livestream: “Mọi người xem đây, cái loại phá hoại gia đình người khác!”',
      scene: { loc: 'home', anim: 'scared', expr: 'scared', npcs: [{ role: 'stranger', anim: 'angry', say: 'Đồ phá hoại!' }, { role: 'thug', anim: 'angry' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Chống trả, không để bị đánh', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.1, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đẩy được cả đám ra ngoài, khóa trái cửa. Clip vẫn lan khắp mạng, đại gia cắt đứt liên lạc, căn hộ phải trả lại.', effects: { happy: -10, karma: -2, followers: 0.1, unflag: 's_rom_bao_nuoi_on' }, scene: { anim: 'angry', fx: 'anger' } },
            { text: 'Bạn bị túm tóc, cào xước mặt giữa tiếng livestream. Clip triệu view. Mấy tháng liền bạn không dám ra đường.', effects: { happy: -16, health: -8, looks: -3, followers: 0.2, unflag: 's_rom_bao_nuoi_on' }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Quỳ xuống xin lỗi, trả lại tất cả',
          text: 'Bạn xin lỗi, dọn ra khỏi căn hộ ngay trong đêm, trả lại xe và trang sức. Mất hết, nhưng không có clip nào lan ra.',
          effects: { moneyPct: -0.5, happy: -8, karma: 4, unflag: 's_rom_bao_nuoi_on' }, scene: { anim: 'bow', fx: 'tears' } }
      ]
    },
    {
      id: 's_rom_tinh_hay_tien', title: 'Tình hay tiền?', icon: '⚖️', age: [20, 35], weight: 1,
      req: { has: ['partner'], lacks: ['spouse'] },
      text: '{partner} yêu bạn ba năm, lương tháng bảy triệu, hứa “cố gắng vì tương lai hai đứa”. Đúng lúc đó, {stranger} — giám đốc trẻ, có nhà có xe — theo đuổi bạn ráo riết, tặng hoa tận công ty.',
      scene: { loc: 'office', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Cho anh/em một cơ hội nhé?' }, { role: 'partner', anim: 'phone' }], fx: 'question' },
      choices: [
        { label: 'Ở lại với {partner}',
          text: 'Bạn trả hoa lại. Tối đó ăn bát phở cùng {partner}, nghe kể kế hoạch tiết kiệm mua nhà. Nghèo, nhưng bình yên.',
          effects: { happy: 4, karma: 4, rel: { partner: 12 } }, scene: { loc: 'street', anim: 'love', fx: 'hearts' } },
        { label: 'Chọn người có điều kiện',
          outcomes: [
            { p: 0.5, text: 'Bạn chia tay {partner} trong nước mắt, nhận lời {stranger}. Cuộc sống đủ đầy, những chuyến du lịch sang chảnh. Thỉnh thoảng nghe tin cũ, lòng hơi gợn.', effects: { happy: 3, karma: -4, money: 50000000, removePerson: 'partner', addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { loc: 'cafe', anim: 'shrug', fx: 'money' } },
            { p: 0.5, text: 'Bạn chia tay {partner}. Ba tháng sau mới biết {stranger} đã có gia đình ở quê. Mất cả chì lẫn chài.', effects: { happy: -12, karma: -4, removePerson: 'partner' }, scene: { anim: 'cry', fx: 'heartbreak' } }
          ] }
      ]
    },

    // ======================= HÔN NHÂN & NGƯỜI TÌNH =======================
    {
      id: 's_rom_ky_niem', title: 'Kỷ niệm ngày cưới', icon: '🌹', age: [24, 85], weight: 1.2,
      req: { has: ['spouse'] },
      text: 'Hôm nay kỷ niệm ngày cưới. Công việc, con cái cuốn đi, hai người lâu lắm rồi chưa đi đâu riêng với nhau.',
      scene: { loc: 'home', anim: 'think', npcs: [{ role: 'spouse', anim: 'cook' }], fx: 'hearts' },
      choices: [
        { label: 'Bí mật đặt bàn, tặng hoa bất ngờ', mini: 'love',
          success: { stat: 'looks', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: '{spouse} sững người khi thấy bó hoa, rồi cười như ngày mới yêu. Hai người nắm tay đi bộ về dưới mưa phùn.', effects: { happy: 8, money: -2000000, rel: { spouse: 14 } }, scene: { loc: 'cafe', anim: 'love', fx: 'hearts' } },
            { text: 'Bạn chọn đúng món {spouse} bị dị ứng. Buổi tối kết thúc ở phòng khám. Dù sao cũng nhớ đời.', effects: { happy: 1, money: -2500000, rel: { spouse: 4 } }, scene: { loc: 'hospital', anim: 'facepalm' } }
          ] },
        { label: 'Quên mất, đi làm như thường',
          text: 'Tối về thấy mâm cơm nguội và {spouse} ngồi im. Bạn chợt nhớ ra… muộn rồi.',
          effects: { happy: -3, rel: { spouse: -10 } }, scene: { anim: 'facepalm', npcAnim: { spouse: 'sad' } } }
      ]
    },
    {
      id: 's_lover_gap', title: 'Chán cơm thèm phở', icon: '🍜', age: [27, 68], weight: 2,
      req: { has: ['spouse'], lacks: ['lover'], cond: spouseRel(75) },
      text: 'Hôn nhân dạo này nhạt nhẽo: về nhà là cơm, con, hóa đơn, ít khi nói với nhau quá ba câu. Ở quán quen gần công ty, {stranger} trẻ trung, hay cười, nhắn tin hỏi han bạn mỗi ngày: “Hôm nay anh/chị có mệt không?”',
      scene: { loc: 'cafe', time: 'dusk', anim: 'phone', npcs: [{ role: 'stranger', anim: 'love', say: 'Ở lại thêm chút nữa đi…' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Lén lút qua lại với {stranger}',
          text: 'Từ những buổi cà phê “tình cờ” thành những lần nói dối vợ/chồng là đi tiếp khách. Bạn có một người tình, và một chiếc điện thoại luôn úp mặt xuống bàn.',
          effects: { happy: 7, karma: -8, rel: { spouse: -6 }, addPerson: { role: 'lover', fromScene: 'stranger' }, followUp: { id: 's_lover_lo', delay: 4 } }, scene: { anim: 'love', fx: 'hearts' } },
        { label: 'Về hâm nóng lại với {spouse}', mini: 'love',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn rủ {spouse} đi xem phim như hồi mới yêu. Lâu lắm rồi hai người mới cười to như thế.', effects: { happy: 6, karma: 3, rel: { spouse: 14 } }, scene: { loc: 'cafe', anim: 'love', fx: 'hearts' } },
            { text: '{spouse} kêu mệt, không muốn đi đâu. Bạn ngồi một mình, tin nhắn của {stranger} vẫn sáng trên màn hình.', effects: { happy: -3, rel: { spouse: -2 } }, scene: { anim: 'sad', fx: 'question' } }
          ] },
        { label: 'Cắt đứt ngay, không để có chuyện gì',
          text: 'Bạn chặn số, đổi quán cà phê. Có những cánh cửa tốt nhất đừng hé ra.',
          effects: { karma: 5 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_lover_lo', title: 'Bị phát hiện ngoại tình', icon: '💔', age: [25, 80], chainOnly: true,
      req: { has: ['spouse', 'lover'] },
      text: '{spouse} đặt điện thoại của bạn lên bàn: ảnh hai người ở nhà nghỉ, tin nhắn “nhớ anh/em” với {lover}. Giọng run lên: “Bao lâu rồi? Nói thật đi.”',
      scene: { loc: 'home', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'spouse', anim: 'cry', say: 'Bao lâu rồi?' }], fx: 'heartbreak', shot: 'dramatic' },
      choices: [
        { label: 'Quỳ xuống xin tha thứ, cắt đứt với {lover}', mini: 'love',
          success: { stat: 'karma', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chặn {lover} trước mặt {spouse}, đồng ý đi tư vấn hôn nhân. Gần một năm sau, niềm tin mới lành lại từng chút.', effects: { happy: -6, karma: 4, rel: { spouse: -12, child: -5 }, removePerson: 'lover' }, scene: { anim: 'cry', fx: 'tears' } },
            { text: '{spouse} lắc đầu: “Muộn rồi.” Đơn ly hôn được nộp tuần sau. Bạn mất gia đình, mất nửa tài sản.', effects: { happy: -16, divorce: true, rel: { child: -20 } }, scene: { anim: 'cry', fx: 'heartbreak' } }
          ] },
        { label: 'Chọn {lover}, ra đi',
          text: 'Bạn xếp đồ dọn sang ở với {lover}. Ly hôn, chia tài sản, con cái không muốn gặp. Không còn phải lén lút, nhưng cũng không còn đường quay lại.',
          effects: { happy: -6, karma: -10, divorce: true, rel: { child: -30 } }, scene: { loc: 'street', anim: 'walk', fx: 'dust' } },
        { label: 'Chối: “Chỉ là bạn bè thôi!”',
          outcomes: [
            { p: 0.3, text: '{spouse} không tin hẳn, nhưng quá mệt để cãi. Hai người sống cạnh nhau như hai người lạ, còn bạn vẫn lén nhắn tin cho {lover}.', effects: { happy: -6, karma: -6, rel: { spouse: -25 } }, scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.7, text: '{spouse} lấy thêm sao kê thẻ, ảnh camera hành trình. Lời chối làm mọi chuyện tệ hơn. Đơn ly hôn kèm câu chuyện lan khắp họ hàng.', effects: { happy: -18, karma: -8, divorce: true, rel: { child: -25, mother: -10 } }, scene: { anim: 'facepalm', fx: 'heartbreak' } }
          ] }
      ]
    },
    {
      id: 's_lover_danh_ghen', title: 'Đánh ghen giữa phố', icon: '🧨', age: [25, 75], weight: 1,
      req: { has: ['spouse', 'lover'] },
      text: 'Bạn đang ngồi cà phê với {lover} thì {spouse} ập tới cùng anh chị em họ hàng. Chiếc ly vỡ tan, cả quán đứng dậy, điện thoại giơ lên quay khắp nơi.',
      scene: { loc: 'cafe', anim: 'scared', expr: 'scared', npcs: [{ role: 'spouse', anim: 'angry', say: 'Hai người giỏi lắm!' }, { role: 'lover', anim: 'scared' }, { role: 'crowd', anim: 'phone' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Đứng chắn cho {lover}, giằng co với cả đám', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.1, scale: 0.5 },
          outcomes: [
            { text: 'Bạn kéo được {lover} chạy ra xe. Nhưng clip “đánh ghen quán cà phê” đã lan khắp mạng, ai cũng nhận ra mặt bạn.', effects: { happy: -10, karma: -4, followers: 0.15, rel: { spouse: -25, lover: 10 } }, scene: { loc: 'street', anim: 'run', fx: 'dust' } },
            { text: 'Bạn bị đánh bầm dập giữa tiếng hò hét. {spouse} vứt nhẫn cưới xuống đất rồi bỏ đi. Đơn ly hôn tới ngay tuần sau.', effects: { happy: -16, health: -10, divorce: true, followers: 0.2 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Bỏ chạy một mạch', mini: 'sprint',
          success: { stat: 'health', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chạy thoát, bỏ lại {lover} và cả đôi dép. Tối đó không dám về nhà, ngủ ở khách sạn. {lover} cũng không thèm nghe máy.', effects: { happy: -10, karma: -4, rel: { spouse: -20, lover: -25 } }, scene: { loc: 'street', anim: 'run', fx: 'sweat' } },
            { text: 'Bạn vấp ngã ngay cửa quán, bị túm áo kéo lại. Cảnh đó nằm trong clip triệu view.', effects: { happy: -14, health: -4, rel: { spouse: -25 }, followers: 0.2 }, scene: { anim: 'fall', fx: 'dust' } }
          ] },
        { label: 'Đứng im chịu trận, xin lỗi trước mặt mọi người',
          text: 'Bạn cúi đầu xin lỗi {spouse} ngay giữa quán, nói sẽ chấm dứt. {lover} bỏ đi trong nước mắt. Về nhà là cả một cuộc chiến im lặng.',
          effects: { happy: -10, karma: 2, removePerson: 'lover', rel: { spouse: -15 } }, scene: { anim: 'bow', fx: 'tears' } }
      ]
    },
    {
      id: 's_lover_co_bau', title: '“Em có bầu rồi”', icon: '🤰', age: [25, 65], weight: 0.9,
      req: { gender: 'm', has: ['spouse', 'lover'], cond: (s) => s.people.some((p) => p.alive && p.role === 'lover' && p.gender === 'f' && p.age < 46) },
      text: '{lover} gọi bạn ra, đưa tờ giấy siêu âm: “Em có bầu rồi. Anh tính sao? Em không muốn con mình không có bố.”',
      scene: { loc: 'cafe', anim: 'scared', expr: 'surprised', npcs: [{ role: 'lover', anim: 'cry', say: 'Anh tính sao?' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Ly hôn, cưới {lover} cho đàng hoàng',
          text: 'Bạn về nói thật với {spouse}. Cả nhà chấn động, ly hôn, chia đôi tài sản. Bạn bắt đầu lại với {lover} và đứa con sắp chào đời.',
          effects: { happy: -6, karma: -6, divorce: true, rel: { child: -25, lover: 20 } }, scene: { loc: 'street', anim: 'walk', fx: 'heartbreak' } },
        { label: 'Chu cấp bí mật, giữ cả hai nhà',
          text: 'Bạn thuê cho {lover} một căn hộ, tháng nào cũng chuyển tiền đều. Hai gia đình, hai chiếc điện thoại, một bí mật ngày càng nặng.',
          effects: { money: -150000000, happy: -4, karma: -8, rel: { lover: 8 } }, scene: { anim: 'phone', fx: 'money' } },
        { label: 'Ép {lover} bỏ đứa bé, cắt đứt',
          text: 'Bạn dúi một xấp tiền rồi đứng dậy. {lover} nhìn bạn lần cuối, không khóc nữa. Câu chuyện đó theo bạn đến hết đời.',
          effects: { money: -50000000, happy: -10, karma: -18, removePerson: 'lover' }, scene: { anim: 'walk', fx: 'tears' } }
      ]
    },
    {
      id: 's_lover_tong_tien', title: 'Người tình trở mặt', icon: '📸', age: [27, 75], weight: 0.8,
      req: { has: ['spouse', 'lover'], minMoney: 100000000 },
      text: '{lover} gửi một tin nhắn kèm ảnh nhạy cảm của hai người: “Chuyển {money:300000000} trong tuần này. Không thì {spouse} và cả công ty sẽ được xem bộ ảnh này.”',
      scene: { loc: 'office', anim: 'scared', expr: 'scared', npcs: [], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Chuyển tiền cho yên chuyện',
          outcomes: [
            { p: 0.45, text: 'Tiền đi, ảnh bị xóa, {lover} biến mất. Bạn trả giá đắt cho một bài học.', effects: { money: -300000000, happy: -8, removePerson: 'lover' }, scene: { anim: 'sad', fx: 'money' } },
            { p: 0.55, text: 'Chuyển xong, tháng sau {lover} lại đòi tiếp. Bạn đã thành “cây ATM” cho một người từng nói yêu mình.', effects: { money: -300000000, happy: -12, rel: { lover: -30 } }, scene: { anim: 'cry', fx: 'money' } }
          ] },
        { label: 'Báo công an tội cưỡng đoạt tài sản',
          outcomes: [
            { p: 0.6, text: 'Công an lập án, {lover} bị bắt quả tang lúc nhận tiền. Nhưng chuyện vỡ lở, {spouse} biết hết, ly hôn.', effects: { happy: -12, karma: 2, removePerson: 'lover', divorce: true }, scene: { anim: 'sad', npcs: [{ role: 'police', anim: 'talk' }] } },
            { p: 0.4, text: 'Công an xử lý nhanh và kín đáo, {lover} bị khởi tố. {spouse} không biết gì. Bạn thề sẽ không bao giờ dại như vậy nữa.', effects: { happy: -4, karma: 3, removePerson: 'lover' }, scene: { anim: 'nod', npcs: [{ role: 'police', anim: 'nod' }] } }
          ] },
        { label: 'Tự thú với {spouse} trước khi bị lộ',
          success: { stat: 'karma', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: '{spouse} khóc cả đêm, nhưng sáng ra nói: “Mình cùng đi báo công an.” Hôn nhân sứt mẻ nhưng còn đó.', effects: { happy: -8, karma: 6, removePerson: 'lover', rel: { spouse: -15 } }, scene: { anim: 'hug', fx: 'tears' } },
            { text: '{spouse} nghe xong chỉ nói một câu: “Mình ly hôn đi.”', effects: { happy: -14, removePerson: 'lover', divorce: true }, scene: { anim: 'cry', fx: 'heartbreak' } }
          ] }
      ]
    }
  );
})();
