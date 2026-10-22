/* events_holiday.js — Một Kiếp Người: các dịp lễ trong năm (ngoài Tết đã có nhiều).
   8/3, 20/10, 1/6, Valentine, Vu Lan, Trung thu cho trẻ, Halloween, Giáng sinh, giao thừa dương lịch, 30/4, Quốc khánh 2/9,
   Giỗ Tổ Hùng Vương, ông Công ông Táo, lễ hội đầu xuân, Rằm tháng Giêng. Mọi id có tiền tố 's_hol_'; đa số lặp lại sau vài năm. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(

    // ───────────────────────── TRẺ EM ─────────────────────────
    {
      id: 's_hol_thieu_nhi', title: 'Ngày Quốc tế Thiếu nhi 1/6', icon: '🎈', age: [3, 11], once: false, cooldown: 3, weight: 1.3,
      text: 'Hôm nay là 1/6! Phường tổ chức vui chơi cho thiếu nhi ở công viên: thi kéo co, nhảy bao bố, ăn kẹo bông, ai cũng được phát một túi quà.',
      scene: { loc: 'park', time: 'day', anim: 'run', fx: 'confetti', shot: 'wide',
        npcs: [ { role: 'kid', anim: 'run' }, { role: 'mother', anim: 'clap', say: 'Cố lên con ơi!' }, { role: 'crowd', anim: 'cheer' } ] },
      choices: [
        { label: '🏃 Thi nhảy bao bố', success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn nhảy về nhất, được thưởng một bộ đồ chơi xếp hình. Mẹ hét to nhất khán đài.', effects: { happy: 7, health: 2, rel: { mother: 3 } }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn vấp ngã giữa đường, lăn lông lốc như cái bao. Cả công viên cười, bạn cũng cười theo.', effects: { happy: 4, health: 1 }, scene: { anim: 'fall', fx: 'dust' } }
          ] },
        { label: '🎨 Vẽ tranh “Ước mơ của em”', text: 'Bạn vẽ mình lái tàu vũ trụ chở cả nhà lên Mặt Trăng. Tranh được dán lên bảng tin của phường.', effects: { happy: 5, smarts: 2, looks: 1 }, scene: { anim: 'study', fx: 'idea' } },
        { label: '🍭 Đi một vòng ăn hết các gian', text: 'Kẹo bông, kem, bỏng ngô, xúc xích… Tối về bạn đau bụng, nhưng đó là ngày 1/6 vui nhất.', effects: { happy: 6, health: -2 }, scene: { anim: 'eat', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_hol_trungthu_kid', title: 'Rước đèn Trung thu', icon: '🏮', age: [3, 11], once: false, cooldown: 2, weight: 1.4,
      text: 'Rằm tháng Tám, cả xóm rước đèn. Trống lân rộn ràng, mâm cỗ bày đủ bánh nướng, bánh dẻo, bưởi, hồng. Bạn cầm chiếc đèn lồng mới tinh.',
      scene: { loc: 'street', time: 'night', decor: 'midautumn', anim: 'walk', fx: 'sparkle', shot: 'wide',
        npcs: [ { role: 'kid', anim: 'walk' }, { role: 'crowd', anim: 'dance' }, { role: 'father', anim: 'wave' } ] },
      choices: [
        { label: '🦁 Xin vào đội múa lân', text: 'Bạn được đội đầu lân bé xíu, nhảy theo trống đến mỏi nhừ cả chân. Cả xóm khen “con lân con” dễ thương nhất.', effects: { happy: 7, health: 2 }, scene: { anim: 'dance', fx: 'music' } },
        { label: '🏮 Rước đèn khắp xóm', text: 'Đoàn rước đèn đi khắp ngõ hát “Tết Trung thu rước đèn đi chơi”. Đèn của bạn cháy mất một góc, vẫn thấy đẹp nhất xóm.', effects: { happy: 6 }, scene: { anim: 'walk', fx: 'stars' } },
        { label: '🥮 Phá cỗ cùng ông bà', text: 'Bạn ngồi bóc bưởi, nghe ông kể chuyện chú Cuội ngồi gốc cây đa. Bánh nướng nhân thập cẩm ngon nhớ đời.', effects: { happy: 5, rel: { grandparent: 5 } }, scene: { loc: 'home', anim: 'eat', fx: 'sparkle', decor: 'midautumn', npcs: [ { role: 'grandparent', anim: 'talk', say: 'Ngày xưa có chú Cuội…' } ] } }
      ]
    },
    {
      id: 's_hol_noel_kid', title: 'Ông già Noel có thật không?', icon: '🎅', age: [3, 10], once: false, cooldown: 3,
      text: 'Đêm Giáng sinh, bạn treo chiếc tất lên đầu giường, viết một lá thư xin ông già Noel món quà mình thích nhất. Bố mẹ liếc nhau, cười bí hiểm.',
      scene: { loc: 'bedroom', time: 'night', decor: 'christmas', anim: 'study', fx: 'sparkle', shot: 'close',
        npcs: [ { role: 'mother', anim: 'idle', say: 'Ngủ sớm thì ông mới tới nhé!' } ] },
      choices: [
        { label: '😴 Ngủ thật sớm chờ quà', text: 'Sáng ra trong tất có đúng món bạn xin. Bạn tin chắc ông già Noel có thật — và bố mẹ thì thở phào vì đã kịp đi mua.', effects: { happy: 7, rel: { mother: 3, father: 3 } }, scene: { anim: 'cheer', fx: 'confetti' } },
        { label: '👀 Giả vờ ngủ để rình', text: 'Nửa đêm, bạn hé mắt thấy… bố đội mũ đỏ rón rén nhét quà vào tất. Bạn im lặng, lần đầu tiên thấy mình đã lớn.', effects: { happy: 3, smarts: 2, rel: { father: 4 } }, scene: { anim: 'think', fx: 'idea' } }
      ]
    },
    {
      id: 's_hol_halloween', title: 'Halloween hoá trang', icon: '🎃', age: [6, 25], once: false, cooldown: 3,
      text: 'Halloween tới, trường (hay công ty) tổ chức tiệc hoá trang. Mọi người rủ nhau đeo mặt nạ, vẽ mặt ma, khoác áo choàng đen.',
      scene: { loc: 'school', time: 'dusk', anim: 'dance', fx: 'smoke', shot: 'wide',
        npcs: [ { role: 'friend', anim: 'scared', say: 'Hù!!' }, { role: 'crowd', anim: 'dance' } ] },
      choices: [
        { label: '🧛 Hoá trang ma cà rồng thật ngầu', text: 'Bộ đồ đỏ đen, răng nanh nhựa, mặt trắng bệch. Bạn đoạt giải “hoá trang ấn tượng”, ảnh lên trang của trường.', effects: { happy: 6, looks: 2 }, scene: { anim: 'cheer', fx: 'stars' } },
        { label: '👻 Trùm chăn trắng làm ma', text: 'Không kịp chuẩn bị, bạn trùm chăn trắng khoét hai lỗ mắt. Đi đâu cũng bị va vào cột, cả lớp cười ngặt nghẽo.', effects: { happy: 5 }, scene: { anim: 'walk', fx: 'question' } },
        { label: '🙅 Ở nhà, “lễ Tây” không quan tâm', text: 'Bạn ở nhà xem phim kinh dị một mình, giật mình mỗi khi mèo kêu ngoài cửa sổ.', effects: { happy: 1 }, scene: { loc: 'bedroom', time: 'night', anim: 'scared', fx: 'exclaim' } }
      ]
    },

    // ───────────────────────── LỄ CỦA PHỤ NỮ ─────────────────────────
    {
      id: 's_hol_8_3_boy', title: 'Mùng 8 tháng 3', icon: '💐', age: [8, 80], once: false, cooldown: 2, weight: 1.2,
      req: { gender: 'm' },
      text: 'Ngày Quốc tế Phụ nữ 8/3. Tiệm hoa ngoài đầu ngõ chật cứng, đàn ông con trai xếp hàng mua hoa. Bạn nghĩ tới những người phụ nữ quan trọng của đời mình.',
      scene: { loc: 'street', time: 'day', anim: 'think', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'vendor', gender: 'f', anim: 'talk', say: 'Bó này đẹp nè, tặng mẹ tặng vợ đều hợp!' } ] },
      choices: [
        { label: '💐 Mua hoa tặng mẹ', text: 'Mẹ cầm bó hoa, giả vờ trách “tốn tiền”, nhưng cắm ngay vào lọ giữa nhà và khoe với hàng xóm cả tuần.', effects: { happy: 4, money: -200000, rel: { mother: 8 } }, scene: { loc: 'home', anim: 'love', fx: 'hearts', npcs: [ { role: 'mother', anim: 'love', say: 'Con trai mẹ lớn rồi!' } ] } },
        { label: '🎁 Quà cho người thương', req: { has: ['partner'] }, text: 'Bạn tặng {partner} bó hồng và hộp sô-cô-la, kèm tấm thiệp tự viết. {partner} cười tít mắt, chụp ảnh đăng lên mạng ngay.', effects: { happy: 5, money: -500000, rel: { partner: 8 } }, scene: { anim: 'love', fx: 'hearts', npcs: [ { role: 'partner', anim: 'jump' } ] } },
        { label: '🍳 Vào bếp nấu cơm thay vợ', req: { has: ['spouse'] }, text: 'Bạn xắn tay áo nấu nguyên mâm cơm, cháy mất nồi canh. {spouse} vẫn ăn sạch, bảo “ngon nhất năm”.', effects: { happy: 5, rel: { spouse: 9 } }, scene: { loc: 'home', anim: 'cook', fx: 'steam', npcs: [ { role: 'spouse', anim: 'laugh' } ] } },
        { label: '🤷 Quên mất', text: 'Đến tối mới nhớ ra là 8/3. Cả nhà phụ nữ nhìn bạn bằng ánh mắt rất… khó tả.', effects: { happy: -2, rel: { mother: -3 } }, scene: { anim: 'facepalm', fx: 'sweat' } }
      ]
    },
    {
      id: 's_hol_8_3_girl', title: 'Mùng 8 tháng 3', icon: '🌷', age: [8, 80], once: false, cooldown: 2, weight: 1.2,
      req: { gender: 'f' },
      text: 'Ngày Quốc tế Phụ nữ 8/3. Đi đâu cũng thấy hoa, lời chúc rộn ràng. Hôm nay là ngày của bạn — và của mẹ bạn nữa.',
      scene: { loc: 'home', time: 'day', anim: 'idle', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'father', anim: 'wave', say: 'Chúc hai mẹ con 8/3 vui vẻ!' }, { role: 'mother', anim: 'laugh' } ] },
      choices: [
        { label: '🛍️ Rủ mẹ đi chơi phố', text: 'Hai mẹ con đi ăn kem, thử váy, chụp ảnh. Mẹ bảo lâu lắm rồi mới được làm “con gái” một ngày.', effects: { happy: 6, money: -300000, rel: { mother: 8 } }, scene: { loc: 'street', anim: 'walk', fx: 'hearts', npcs: [ { role: 'mother', anim: 'laugh' } ] } },
        { label: '💝 Nhận quà từ người thương', req: { has: ['partner'] }, text: '{partner} xuất hiện với bó hoa to hơn cả người, mặt đỏ lựng. Bạn giả vờ bình thản, nhưng tim đập loạn xạ.', effects: { happy: 7, rel: { partner: 6 } }, scene: { anim: 'love', fx: 'hearts', npcs: [ { role: 'partner', anim: 'love' } ] } },
        { label: '🍰 Tự thưởng cho bản thân', text: 'Bạn tự mua cho mình một chiếc bánh kem nhỏ và một cuốn sách hay. Phụ nữ thì phải biết thương mình trước đã.', effects: { happy: 5, money: -250000, smarts: 1 }, scene: { anim: 'eat', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_hol_20_10', title: 'Ngày Phụ nữ Việt Nam 20/10', icon: '🌹', age: [10, 80], once: false, cooldown: 3,
      text: '20/10, ngày Phụ nữ Việt Nam. Trường lớp, cơ quan đều tổ chức chúc mừng; cánh đàn ông thì lo sốt vó chuyện quà cáp.',
      scene: { loc: 'office', time: 'day', anim: 'clap', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'coworker', anim: 'clap', say: 'Chúc chị em luôn xinh đẹp!' }, { role: 'crowd', anim: 'clap' } ] },
      choices: [
        { label: '🎤 Hát tặng một bài', text: 'Bạn cầm micro hát “Bông hồng cài áo”. Giọng không hay, nhưng nhiều người rơm rớm nước mắt nghĩ tới mẹ.', effects: { happy: 5, karma: 1 }, scene: { anim: 'sing', fx: 'music' } },
        { label: '📞 Gọi điện cho mẹ', req: { has: ['mother'] }, text: 'Bạn gọi về chúc mẹ. Mẹ cười: “Có đứa con nhớ là vui rồi.” Cuộc gọi kéo dài cả tiếng chuyện trên trời dưới biển.', effects: { happy: 4, rel: { mother: 6 } }, scene: { anim: 'phone', fx: 'hearts' } },
        { label: '🍜 Rủ hội bạn đi ăn', text: 'Cả hội đi ăn lẩu, chúc nhau đủ điều. Bàn bên cạnh cũng là một hội 20/10, hai bàn cụng ly với nhau.', effects: { happy: 5, money: -300000, rel: { friend: 4 } }, scene: { loc: 'cafe', anim: 'eat', fx: 'steam' } }
      ]
    },
    {
      id: 's_hol_valentine', title: 'Lễ tình nhân 14/2', icon: '💘', age: [15, 50], once: false, cooldown: 2, weight: 1.2,
      req: { has: ['partner'] },
      text: 'Valentine. Phố đầy hoa hồng và gấu bông, quán xá kín bàn. {partner} nhắn: “Tối nay mình đi đâu?” kèm ba cái icon trái tim.',
      scene: { loc: 'cafe', time: 'night', anim: 'idle', expr: 'love', fx: 'hearts', shot: 'close',
        npcs: [ { role: 'partner', anim: 'love', say: 'Valentine vui vẻ nha!' } ] },
      choices: [
        { label: '🕯️ Đặt bàn nhà hàng nến', text: 'Bữa tối dưới ánh nến, nhạc violin, hoá đơn làm bạn suýt sặc. Nhưng nụ cười của {partner} đáng từng đồng.', effects: { happy: 7, money: -2000000, rel: { partner: 10 } }, scene: { anim: 'love', fx: 'hearts', npcAnim: { partner: 'love' } } },
        { label: '🍫 Tự làm sô-cô-la tặng', text: 'Bạn mất ba tiếng làm sô-cô-la hình trái tim, méo xệch. {partner} giữ lại một miếng, nói để làm kỷ niệm.', effects: { happy: 6, money: -150000, rel: { partner: 8 } }, scene: { loc: 'home', anim: 'cook', fx: 'hearts' } },
        { label: '🎮 Valentine thì cũng như ngày thường', text: 'Bạn bảo “ngày nào yêu nhau chẳng là Valentine”. {partner} gật gù, nhưng cả tối nhắn tin cụt lủn.', effects: { happy: 1, rel: { partner: -5 } }, scene: { anim: 'shrug', fx: 'question', npcAnim: { partner: 'angry' } } }
      ]
    },
    {
      id: 's_hol_valentine_fa', title: 'Valentine một mình', icon: '🥲', age: [16, 40], once: false, cooldown: 3,
      req: { lacks: ['partner', 'spouse'] },
      text: '14/2. Mạng xã hội ngập ảnh các cặp đôi khoe hoa, khoe quà. Bạn mở tủ lạnh, chỉ có một hộp sữa chua và một quả trứng.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', fx: 'heartbreak', shot: 'close' },
      choices: [
        { label: '🍻 Lập hội “FA” đi ăn', text: 'Cả đám bạn độc thân kéo nhau đi ăn ốc, cụng ly “vì một năm tự do”. Vui hơn hẳn mấy cặp ngồi nhà hàng nến.', effects: { happy: 6, money: -200000, rel: { friend: 5 } }, scene: { loc: 'street', anim: 'cheer', fx: 'music', npcs: [ { role: 'friend', anim: 'cheer' } ] } },
        { label: '📱 Tải app hẹn hò', success: { stat: 'looks', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn “quẹt” trúng một người nói chuyện rất hợp. Hai người hẹn cà phê cuối tuần.', effects: { happy: 6, flag: 'valentine_match' }, scene: { anim: 'love', fx: 'hearts' } },
            { text: 'Ba tiếng quẹt, không ai ghép đôi. Bạn xoá app, đi ngủ.', effects: { happy: -2 }, scene: { anim: 'sad', fx: 'zzz' } }
          ] },
        { label: '🛌 Ngủ sớm, mai đi làm', text: 'Bạn tắt điện thoại, ngủ một giấc ngon. Sáng hôm sau hoa hồng giảm giá 70%.', effects: { health: 2 }, scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },

    // ───────────────────────── LỄ TRUYỀN THỐNG ─────────────────────────
    {
      id: 's_hol_vu_lan', title: 'Mùa Vu Lan báo hiếu', icon: '🌹', age: [10, 90], once: false, cooldown: 3, weight: 1.1,
      text: 'Rằm tháng Bảy, mùa Vu Lan. Ở chùa, mọi người được cài lên ngực áo một bông hồng: hồng đỏ cho ai còn mẹ, hồng trắng cho ai đã mất mẹ.',
      scene: { loc: 'temple', time: 'dusk', anim: 'pray', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'pray' }, { role: 'stranger', gender: 'f', anim: 'talk', say: 'Con cài hoa nhé.' } ] },
      choices: [
        { label: '🌹 Về nhà ôm mẹ', req: { has: ['mother'] }, text: 'Cài bông hồng đỏ trên ngực, bạn chạy về ôm mẹ thật lâu. Mẹ ngạc nhiên rồi khóc, vỗ lưng bạn như hồi bé.', effects: { happy: 6, karma: 3, rel: { mother: 10 } }, scene: { loc: 'home', anim: 'hug', fx: 'hearts', npcs: [ { role: 'mother', anim: 'hug', say: 'Con tôi…' } ] } },
        { label: '🤍 Cài bông hồng trắng', req: { lacks: ['mother'] }, text: 'Bạn nhận bông hồng trắng, đứng lặng trước chính điện. Tiếng kinh cầu ngân nga, bạn thấy mẹ như đang ở rất gần.', effects: { happy: 2, karma: 4 }, scene: { anim: 'pray', fx: 'tears' } },
        { label: '🍚 Cúng cô hồn, phát cháo từ thiện', text: 'Bạn góp tiền nấu cháo phát cho người vô gia cư. Một cụ bà nắm tay bạn cảm ơn mãi không thôi.', effects: { karma: 6, happy: 3, money: -500000 }, scene: { loc: 'street', anim: 'cook', fx: 'steam' } }
      ]
    },
    {
      id: 's_hol_ong_tao', title: 'Tiễn ông Công ông Táo', icon: '🐟', age: [5, 90], once: false, cooldown: 3,
      text: '23 tháng Chạp, nhà nhà cúng tiễn ông Công ông Táo về trời. Trên mâm cúng có ba con cá chép đỏ còn đang quẫy trong chậu nước.',
      scene: { loc: 'home', time: 'day', decor: 'tet', anim: 'pray', fx: 'smoke', shot: 'close',
        npcs: [ { role: 'mother', anim: 'pray', say: 'Cầu cho năm mới cả nhà bình an.' } ] },
      choices: [
        { label: '🐟 Đi thả cá chép ở hồ', text: 'Bạn mang cá ra hồ thả nhẹ nhàng xuống nước, nhìn chúng bơi đi. Có người thả cả túi ni lông xuống hồ, bạn nhặt lên mang về.', effects: { karma: 4, happy: 3 }, scene: { loc: 'park', anim: 'idle', fx: 'bubbles' } },
        { label: '🙏 Khấn “ông Táo báo cáo tốt giùm”', text: 'Bạn khấn thì thầm xin ông Táo đừng kể chuyện bạn lười rửa bát cả năm. Mẹ nghe thấy, cười suýt làm đổ chén rượu.', effects: { happy: 4, rel: { mother: 2 } }, scene: { anim: 'pray', fx: 'idea', npcAnim: { mother: 'laugh' } } }
      ]
    },
    {
      id: 's_hol_le_hoi_xuan', title: 'Đi lễ hội đầu xuân', icon: '🎎', age: [8, 85], once: false, cooldown: 3,
      text: 'Ra Giêng, cả nhà đi lễ hội đầu xuân. Đường lên đền đông nghịt, tiếng trống hội, cờ ngũ sắc phấp phới, người xin lộc, người xin chữ, người chơi đánh đu.',
      scene: { loc: 'temple', time: 'day', decor: 'tet', anim: 'walk', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'walk' }, { role: 'grandparent', anim: 'pray' } ] },
      choices: [
        { label: '🖌️ Xin chữ ông đồ', text: 'Ông đồ viết tặng bạn chữ “Nhẫn”. Bạn mang về treo đầu giường, mỗi lần nóng giận lại liếc nhìn.', effects: { smarts: 2, karma: 2, happy: 2 }, scene: { anim: 'bow', fx: 'idea', npcs: [ { role: 'stranger', gender: 'm', anim: 'talk', say: 'Chữ Nhẫn, giữ lấy mà dùng.' } ] } },
        { label: '🎯 Chơi trò dân gian', success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn thắng giải kéo co, được thưởng một con gà trống. Cả nhà khiêng gà về trong tiếng hò reo.', effects: { happy: 6, health: 2 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn chơi đánh đu, đu cao quá chóng mặt, xuống nôn thốc nôn tháo.', effects: { happy: 2, health: -2 }, scene: { anim: 'sick', fx: 'sweat' } }
          ] },
        { label: '😤 Chen lấn cướp lộc', text: 'Bạn chen vào đám đông giành lộc, bị giẫm rách cả giày. Cầm được nhành lộc mà áo rách, mặt lấm lem.', effects: { happy: 1, karma: -2, health: -1 }, scene: { anim: 'run', fx: 'dust' } }
      ]
    },
    {
      id: 's_hol_gio_to', title: 'Giỗ Tổ Hùng Vương', icon: '🏯', age: [6, 85], once: false, cooldown: 4,
      text: 'Mùng 10 tháng Ba âm lịch, Giỗ Tổ Hùng Vương. Cả nước được nghỉ. Trên tivi phát cảnh dâng hương ở đền Hùng, dòng người nối nhau lên núi Nghĩa Lĩnh.',
      scene: { loc: 'temple', time: 'dawn', anim: 'pray', fx: 'smoke', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'pray' }, { role: 'father', anim: 'pray' } ] },
      choices: [
        { label: '⛰️ Hành hương lên đền Hùng', text: 'Bạn leo hơn năm trăm bậc đá, mồ hôi nhễ nhại, dâng nén hương lên Tổ. Đứng trên đỉnh núi nhìn xuống, thấy lòng tự hào lạ thường.', effects: { happy: 4, health: 2, karma: 3 }, scene: { anim: 'pray', fx: 'sparkle' } },
        { label: '🍙 Gói bánh chưng bánh giầy', text: 'Cả nhà gói bánh chưng, giã bánh giầy như chuyện Lang Liêu. Bánh vuông vức, bạn khoe ảnh lên mạng.', effects: { happy: 5, rel: { mother: 3 } }, scene: { loc: 'home', anim: 'cook', fx: 'steam' } },
        { label: '🛌 Ngủ bù ngày nghỉ', text: 'Bạn tranh thủ ngủ tới trưa. Ngày nghỉ quý như vàng.', effects: { health: 2, happy: 1 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },

    // ───────────────────────── NGÀY NGHỈ LỄ ─────────────────────────
    {
      id: 's_hol_30_4', title: 'Kỳ nghỉ lễ 30/4 – 1/5', icon: '🏖️', age: [10, 75], once: false, cooldown: 2, weight: 1.3,
      text: 'Nghỉ lễ 30/4 – 1/5 kéo dài năm ngày. Cao tốc kẹt cứng, biển đông như kiến, giá phòng khách sạn tăng gấp ba. Đi hay ở?',
      scene: { loc: 'beach', time: 'day', anim: 'idle', fx: 'sparkle', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'swim' }, { role: 'friend', anim: 'wave', say: 'Đi biển không?' } ] },
      choices: [
        { label: '🏖️ Đi biển cùng hội bạn', text: 'Kẹt xe tám tiếng, ăn hải sản bị chặt chém, ngủ phòng sáu người. Nhưng tắm biển lúc hoàng hôn thì đẹp như phim.', effects: { happy: 7, money: -3000000, rel: { friend: 5 } }, scene: { anim: 'swim', fx: 'bubbles' } },
        { label: '🏡 Về quê thăm ông bà', req: { has: ['grandparent'] }, text: 'Bạn về quê, theo ông ra đồng, ăn cơm bà nấu. Năm ngày lễ trôi qua chậm rãi và bình yên.', effects: { happy: 5, health: 2, rel: { grandparent: 8 } }, scene: { loc: 'countryside', anim: 'walk', fx: 'sparkle', npcs: [ { role: 'grandparent', anim: 'wave', say: 'Cháu về rồi đấy à!' } ] } },
        { label: '💼 Ở lại làm thêm ca lễ', text: 'Lương ngày lễ gấp ba, bạn nhận hết các ca trực. Tài khoản dày lên, còn mạng xã hội thì toàn ảnh người khác đi chơi.', effects: { money: 3000000, happy: -2, health: -1 }, scene: { loc: 'office', anim: 'type', fx: 'money' } }
      ]
    },
    {
      id: 's_hol_quoc_khanh', title: 'Quốc khánh 2/9', icon: '🇻🇳', age: [6, 90], once: false, cooldown: 3,
      text: 'Ngày Quốc khánh 2/9. Phố phường rợp cờ đỏ sao vàng, tối nay có bắn pháo hoa. Loa phường phát những bài hát cách mạng từ sáng sớm.',
      scene: { loc: 'street', time: 'night', anim: 'idle', fx: 'fireworks', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'cheer' }, { role: 'friend', anim: 'point', say: 'Pháo hoa kìa!' } ] },
      choices: [
        { label: '🎆 Ra hồ xem pháo hoa', text: 'Bạn chen ra bờ hồ, ngước nhìn từng chùm pháo hoa nở bung trên trời. Cả biển người cùng “Ồ!” một lúc.', effects: { happy: 6 }, scene: { anim: 'cheer', fx: 'fireworks' } },
        { label: '🎖️ Xem diễu binh trên tivi', text: 'Cả nhà quây quanh tivi xem diễu binh. Ông kể chuyện ngày xưa đi bộ đội, mắt sáng lên như trẻ lại.', effects: { happy: 4, smarts: 1, rel: { grandparent: 4 } }, scene: { loc: 'home', anim: 'sit', fx: 'stars' } },
        { label: '🚩 Treo cờ trước nhà', text: 'Bạn trèo lên treo lá cờ thật ngay ngắn trước cổng. Cả dãy phố đỏ rực một màu, đẹp đến nao lòng.', effects: { happy: 3, karma: 2 }, scene: { anim: 'lift', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_hol_giao_thua_duong', title: 'Đếm ngược năm mới', icon: '🎇', age: [14, 60], once: false, cooldown: 2,
      text: 'Đêm 31/12. Quảng trường chật kín người chờ đếm ngược, sân khấu ca nhạc mở hết công suất. Ai cũng cầm điện thoại sẵn sàng quay khoảnh khắc giao thừa.',
      scene: { loc: 'street', time: 'night', anim: 'cheer', fx: 'fireworks', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'dance' }, { role: 'friend', anim: 'cheer', say: 'Mười! Chín! Tám!…' } ] },
      choices: [
        { label: '🥳 Hét đếm ngược cùng đám đông', text: '“Ba! Hai! Một!” Pháo hoa bùng nổ, người lạ ôm nhau chúc mừng. Bạn khản cả cổ, về nhà lúc hai giờ sáng.', effects: { happy: 7, health: -1 }, scene: { anim: 'jump', fx: 'fireworks' } },
        { label: '💋 Đón năm mới bên người thương', req: { has: ['partner'] }, text: 'Đúng giây phút giao thừa, bạn quay sang {partner}. Pháo hoa nở rộ sau lưng, còn hai người thì chẳng nhìn thấy gì ngoài nhau.', effects: { happy: 8, rel: { partner: 8 } }, scene: { anim: 'love', fx: 'hearts', npcs: [ { role: 'partner', anim: 'love' } ] } },
        { label: '📝 Ở nhà viết mục tiêu năm mới', text: 'Bạn viết ra mười mục tiêu cho năm mới: tập thể dục, tiết kiệm, đọc sách… Năm nào cũng viết, năm nay chắc chắn sẽ khác.', effects: { smarts: 2, happy: 2 }, scene: { loc: 'bedroom', anim: 'study', fx: 'idea' } }
      ]
    },
    {
      id: 's_hol_ram_gieng', title: 'Rằm tháng Giêng', icon: '🌕', age: [12, 90], once: false, cooldown: 4,
      text: '“Lễ Phật quanh năm không bằng Rằm tháng Giêng.” Chùa đông nghịt người đi lễ, khói hương mù mịt, trăng tròn vành vạnh trên mái ngói.',
      scene: { loc: 'temple', time: 'night', anim: 'pray', fx: 'smoke', shot: 'wide',
        npcs: [ { role: 'crowd', anim: 'pray' }, { role: 'mother', anim: 'pray' } ] },
      choices: [
        { label: '🙏 Cầu an cho cả nhà', text: 'Bạn thắp nén hương, cầu cho cả nhà bình an, mạnh khoẻ. Bước ra sân chùa, thấy lòng nhẹ tênh.', effects: { happy: 3, karma: 3 }, scene: { anim: 'pray', fx: 'sparkle' } },
        { label: '💰 Cầu tài, xin lộc làm ăn', text: 'Bạn khấn xin một năm phát tài, còn mua cả túi “vàng mã” to đùng. Sư thầy nhắc khéo: “Đi chùa là để lòng an, chứ không phải đi chợ”.', effects: { happy: 2, money: -300000, karma: -1 }, scene: { anim: 'pray', fx: 'money' } }
      ]
    }
  );
})();
