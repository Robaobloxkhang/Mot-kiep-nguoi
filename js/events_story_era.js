/* Một Kiếp Người — sống theo thời đại: chiến tranh, bao cấp, Đổi Mới, quán net, smartphone, Covid, AI và tương lai.
   Mỗi sự kiện có req.minYear / req.maxYear: chỉ xảy ra nếu bạn sống đúng những năm đó (chọn năm sinh khi tạo nhân vật). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= CHIẾN TRANH (1955–1979) =======================
    {
      id: 's_era_so_tan', title: 'Sơ tán tránh bom', icon: '✈️', age: [5, 15], weight: 4,
      req: { minYear: 1965, maxYear: 1972 },
      text: 'Máy bay Mỹ ném bom miền Bắc. Trường lớp sơ tán về nông thôn, học trong lớp mái rạ, đội mũ rơm đến trường. Bố mẹ phải ở lại thành phố làm việc.',
      scene: { loc: 'countryside', anim: 'scared', npcs: [{ role: 'teacher', anim: 'point', say: 'Các em xuống hầm!' }, { role: 'classmate', anim: 'run' }], fx: 'smoke', shot: 'dramatic' },
      choices: [
        { label: 'Theo trường đi sơ tán',
          text: 'Những năm ở làng quê: học dưới ánh đèn dầu, chiều đi bắt cua, tối nghe tiếng máy bay gầm xa xa. Bạn lớn nhanh hơn tuổi.',
          effects: { smarts: 3, health: 2, happy: -3, rel: { mother: -3 } }, scene: { anim: 'study', fx: 'stars' } },
        { label: 'Ở lại thành phố với gia đình',
          outcomes: [
            { p: 0.85, text: 'Mỗi lần còi báo động, cả nhà lại chui xuống hầm cá nhân đào ngay dưới gốc cây. Bạn quen với tiếng bom như quen tiếng mưa.', effects: { happy: -4, rel: { mother: 6 } }, scene: { loc: 'home', anim: 'scared', fx: 'smoke' } },
            { p: 0.15, text: 'Một trận bom rơi gần khu nhà. Bạn bị mảnh vỡ cứa vào chân, vết sẹo theo bạn suốt đời.', effects: { health: -15, happy: -8 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 's_era_nhap_ngu', title: 'Lệnh tổng động viên', icon: '🎖️', age: [17, 30], weight: 5,
      req: { minYear: 1964, maxYear: 1979 },
      text: 'Loa phường đọc lệnh tổng động viên. Bạn bè cùng trang lứa lần lượt viết đơn tình nguyện, có người còn cắt máu ngón tay viết huyết thư.',
      scene: { loc: 'street', anim: 'think', npcs: [{ role: 'friend', anim: 'cheer', say: 'Đi thôi mày!' }, { role: 'mother', anim: 'cry' }], fx: 'exclaim' },
      choices: [
        { label: 'Xung phong ra trận', mini: 'chase',
          success: { stat: 'health', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Những năm hành quân qua Trường Sơn, mưa rừng, sốt rét, bom đạn. Ngày chiến thắng, bạn trở về với tấm huân chương và những người đồng đội mãi nằm lại.', effects: { happy: 4, karma: 10, health: -6, flag: 'veteran' }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Một trận càn ác liệt, bạn bị thương nặng ở chân. Bạn về quê với tấm giấy chứng nhận thương binh và bước đi khập khiễng suốt đời.', effects: { happy: -6, karma: 10, health: -25, illness: 'chanthuong', flag: 'veteran' }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Đi thanh niên xung phong mở đường',
          text: 'Bạn cùng đồng đội san lấp hố bom, mở đường cho xe ra mặt trận. Tay chai sạn, tóc cháy nắng, nhưng tuổi trẻ thì không bao giờ quên.',
          effects: { health: -5, karma: 8, happy: 3 }, scene: { loc: 'countryside', anim: 'lift', fx: 'dust' } },
        { label: 'Xin ở lại hậu phương',
          text: 'Bạn ở lại làm việc ở nhà máy, sản xuất phục vụ tiền tuyến. Mỗi lần có giấy báo tử gửi về làng, lòng bạn lại thắt lại.',
          effects: { happy: -3, karma: 1 }, scene: { loc: 'office', anim: 'type' } }
      ]
    },
    {
      id: 's_era_thong_nhat', title: 'Ngày thống nhất', icon: '🇻🇳', age: [3, 99], weight: 30,
      req: { minYear: 1975, maxYear: 1975 },
      text: 'Trưa 30/4/1975, đài phát thanh báo tin: miền Nam hoàn toàn giải phóng. Cả phố đổ ra đường, người ôm nhau khóc, người gõ xoong nồi, cờ bay đỏ rực.',
      scene: { loc: 'street', anim: 'cheer', npcs: [{ role: 'crowd', anim: 'cheer' }, { role: 'mother', anim: 'cry', say: 'Hòa bình rồi con ơi!' }], fx: ['fireworks', 'confetti'] },
      choices: [
        { label: 'Hòa vào dòng người',
          text: 'Bạn chạy theo đoàn người suốt buổi chiều, hô đến khản giọng. Nhiều năm sau, đó vẫn là ngày bạn nhớ nhất đời.',
          effects: { happy: 15 }, scene: { anim: 'cheer', fx: 'fireworks' } }
      ]
    },
    // ======================= BAO CẤP (1976–1989) =======================
    {
      id: 's_era_tem_phieu', title: 'Xếp hàng tem phiếu', icon: '🎫', age: [7, 85], weight: 3,
      req: { minYear: 1976, maxYear: 1988 },
      text: 'Bốn giờ sáng, cửa hàng mậu dịch chưa mở, hàng người đã dài tít. Mẹ đưa bạn sổ gạo và tờ tem phiếu: “Xếp hàng giữ chỗ cho mẹ, mất là cả nhà nhịn đói.”',
      scene: { loc: 'market', time: 'dawn', anim: 'idle', npcs: [{ role: 'vendor', anim: 'angry', say: 'Hết gạo rồi!' }, { role: 'crowd', anim: 'idle' }], fx: 'sweat' },
      choices: [
        { label: 'Đặt viên gạch giữ chỗ rồi chạy về ngủ',
          outcomes: [
            { p: 0.6, text: 'Viên gạch vẫn nằm đó khi bạn quay lại. Mua đủ gạo, mẹ khen “con khôn”.', effects: { happy: 3, rel: { mother: 3 } }, scene: { anim: 'cheer' } },
            { p: 0.4, text: 'Viên gạch của bạn bị ai đá ra tận lề đường. Hôm đó cả nhà ăn khoai độn.', effects: { happy: -4 }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Đứng xếp hàng tới sáng',
          text: 'Bạn đứng run cầm cập trong sương, mua được 13 cân gạo mốc và nửa cân thịt. Mẹ ôm bạn: “Con giỏi lắm.”',
          effects: { health: -2, happy: 2, rel: { mother: 6 } }, scene: { anim: 'idle', fx: 'sweat' } },
        { label: 'Đi “cửa sau” nhờ người quen',
          text: 'Cô bán hàng là hàng xóm, lén để dành cho nhà bạn phần thịt ngon. Đổi lại, mẹ biếu cô hộp sữa Ông Thọ.',
          effects: { happy: 3, karma: -2 }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_era_nuoi_lon', title: 'Nuôi lợn trong nhà tắm', icon: '🐖', age: [24, 65], weight: 2,
      req: { minYear: 1976, maxYear: 1990 },
      text: 'Lương không đủ sống. Nhà hàng xóm trên khu tập thể nuôi hẳn một con lợn trong nhà tắm, cuối năm bán được món tiền kha khá. Vợ/chồng bạn nhìn bạn đầy ẩn ý.',
      scene: { loc: 'home', anim: 'think', npcs: [{ role: 'neighbor', anim: 'laugh', say: 'Lợi lắm!' }], fx: 'idea' },
      choices: [
        { label: 'Nuôi luôn, có gì mà ngại',
          text: 'Cả năm cả nhà tắm nhờ, mùi lợn bay khắp tầng, nhưng cuối năm bán lợn được món tiền mua cái quạt tai voi.',
          effects: { money: 3000000, happy: 2, health: -1 }, scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Thôi, làm thêm nghề phụ',
          text: 'Tối tối bạn ngồi đan len, chữa đồng hồ, kiếm thêm đồng ra đồng vào.',
          effects: { money: 1500000, health: -1 }, scene: { anim: 'type' } }
      ]
    },
    {
      id: 's_era_buon_chui', title: 'Buôn chui', icon: '🎒', age: [18, 55], weight: 2,
      req: { minYear: 1977, maxYear: 1988 },
      text: 'Người quen rủ đi buôn chui: chở hàng từ quê lên thành phố bán lại, lãi gấp mấy tháng lương. Nhưng nếu bị quản lý thị trường bắt, hàng bị tịch thu, người có thể bị đi cải tạo.',
      scene: { loc: 'street', time: 'night', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Một chuyến thôi.' }], fx: 'money' },
      choices: [
        { label: 'Liều một chuyến, đạp xe xuyên đêm', mini: 'drive',
          success: { stat: 'health', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn lách qua ba trạm kiểm soát, bán hết hàng trước khi trời sáng. Lãi bằng nửa năm lương.', effects: { money: 15000000, happy: 6, karma: -2 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Đến trạm thứ hai thì bị chặn lại. Hàng bị tịch thu, bạn bị giữ lại đi cải tạo.', effects: { money: -5000000, happy: -10, jail: 1, jailReason: 'buôn lậu thời bao cấp' }, scene: { anim: 'sad', npcs: [{ role: 'police', anim: 'point' }] } }
          ] },
        { label: 'Từ chối, sống đúng phép',
          text: 'Bạn tiếp tục đi làm hợp tác xã, nghèo nhưng yên ổn.',
          effects: { karma: 2 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_era_vuot_bien', title: 'Chuyến tàu vượt biên', icon: '🚤', age: [16, 45], weight: 1.4,
      req: { minYear: 1978, maxYear: 1989 },
      text: 'Một người quen thì thầm: có chuyến tàu đi trong đêm, chỉ cần vài cây vàng. Bên kia là trại tị nạn, rồi Mỹ, Úc… nếu sống sót qua biển.',
      scene: { loc: 'beach', time: 'night', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Đêm mai, ở bến cũ.' }], fx: 'question', shot: 'dramatic' },
      choices: [
        { label: 'Lên tàu, đánh cược mạng sống', mini: 'swim',
          success: { stat: 'health', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Sau mười ngày lênh đênh, tàu cập trại tị nạn. Hai năm sau bạn được định cư ở nước ngoài, bắt đầu lại từ hai bàn tay trắng.', effects: { money: -8000000, happy: 4, english: 15, flag: 'vuot_bien', rel: { mother: -10 } }, scene: { loc: 'airport', anim: 'cry', fx: 'tears' } },
            { text: 'Tàu bị bắt ngay ở cửa biển. Bạn mất sạch vàng và bị đưa đi trại cải tạo.', effects: { money: -8000000, happy: -10, jail: 2, jailReason: 'vượt biên trái phép' }, scene: { anim: 'sad', npcs: [{ role: 'police', anim: 'point' }] } }
          ] },
        { label: 'Ở lại quê hương',
          text: 'Bạn quyết định ở lại. Nhiều năm sau, có người đi được, có người không bao giờ tới bờ.',
          effects: { happy: -1, rel: { mother: 4 } }, scene: { anim: 'sit' } }
      ]
    },
    // ======================= ĐỔI MỚI (1986–1999) =======================
    {
      id: 's_era_quan_dau_tien', title: 'Mở quán tư nhân đầu tiên', icon: '🍜', age: [20, 60], weight: 3,
      req: { minYear: 1987, maxYear: 1996 },
      text: 'Đổi Mới rồi, tư nhân được buôn bán. Mặt tiền nhà bạn nằm ngay đầu chợ. Hay là mở một quán phở, một tiệm tạp hóa?',
      scene: { loc: 'street', anim: 'think', npcs: [{ role: 'neighbor', anim: 'talk', say: 'Giờ ai cũng buôn bán cả!' }], fx: 'idea' },
      choices: [
        { label: 'Mở quán ngay', mini: 'cook',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Quán phở nhỏ đông khách từ sáng sớm. Lần đầu tiên trong đời, nhà bạn có tiền mua tivi màu.', effects: { money: 40000000, happy: 8 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Quán vắng như chùa bà đanh, nửa năm sau phải đóng cửa.', effects: { money: -6000000, happy: -4 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Thôi, giữ biên chế nhà nước',
          text: 'Bạn giữ chiếc ghế ở cơ quan. Lương ít, nhưng “chắc chân”.',
          effects: { happy: 1 }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_era_xkld', title: 'Đi lao động ở Liên Xô', icon: '❄️', age: [19, 35], weight: 2,
      req: { minYear: 1981, maxYear: 1991 },
      text: 'Có suất đi xuất khẩu lao động sang Liên Xô, Đông Đức: làm công nhân nhà máy, mỗi năm gửi về cả “thùng hàng” bàn là, xe đạp, vải vóc.',
      scene: { loc: 'airport', anim: 'think', npcs: [{ role: 'mother', anim: 'cry', say: 'Đi giữ sức khỏe nhé con.' }], fx: 'question' },
      choices: [
        { label: 'Lên đường',
          text: 'Mùa đông âm 20 độ, ca đêm ở nhà máy dệt. Nhưng mỗi thùng hàng gửi về là cả nhà đổi đời: ti vi, xe máy, nhà mái bằng.',
          effects: { money: 60000000, happy: 2, health: -4, english: 5, rel: { mother: -4 } }, scene: { loc: 'office', anim: 'type', fx: 'money' } },
        { label: 'Ở nhà với bố mẹ',
          text: 'Bạn ở lại. Bạn bè đi về, ai cũng có xe Cub, còn bạn có bữa cơm đủ mặt cả nhà.',
          effects: { rel: { mother: 5 } }, scene: { anim: 'sit' } }
      ]
    },
    {
      id: 's_era_xe_cub', title: 'Chiếc xe Cub', icon: '🏍️', age: [20, 60], weight: 2,
      req: { minYear: 1990, maxYear: 2002, noAsset: 'motorbike' },
      text: 'Cả phố trầm trồ khi nhà bên mua chiếc Honda Cub 82. Đi xe máy là “oai” nhất phường. Bạn đã dành dụm được kha khá…',
      scene: { loc: 'street', anim: 'think', npcs: [{ role: 'neighbor', anim: 'drive', say: 'Xe Nhật xịn đấy!' }], fx: 'sparkle' },
      choices: [
        { label: 'Dốc hết tiền mua một chiếc',
          text: 'Chiếc Cub đỏ đậu trước nhà, sáng nào bạn cũng lau bóng loáng. Đi đâu cũng có người ngoái nhìn.',
          effects: { money: -25000000, happy: 9, asset: { add: { type: 'motorbike', name: 'Honda Cub 82', value: 20000000 } } }, scene: { anim: 'drive', fx: 'sparkle' } },
        { label: 'Đạp xe tiếp, để dành tiền',
          text: 'Chiếc xe đạp Phượng Hoàng vẫn chạy tốt. Tiền để dành, ít ra không lo đói.',
          effects: { health: 1 }, scene: { anim: 'walk' } }
      ]
    },
    // ======================= HỘI NHẬP (1997–2012) =======================
    {
      id: 's_era_quan_net', title: 'Quán net đầu ngõ', icon: '🖥️', age: [10, 22], weight: 3,
      req: { minYear: 1999, maxYear: 2012 },
      text: 'Quán “net” đầu ngõ lúc nào cũng đông nghẹt. Bọn bạn rủ bạn trốn tiết cuối ra chơi Đế Chế, Võ Lâm Truyền Kỳ, chat Yahoo với “người lạ dễ thương”.',
      scene: { loc: 'street', anim: 'gamepad', npcs: [{ role: 'friend', anim: 'gamepad', say: 'Vào trận nhanh!' }], fx: 'music' },
      choices: [
        { label: 'Trốn học đi net',
          outcomes: [
            { p: 0.6, text: 'Một buổi chiều cày level sung sướng. Về nhà kịp trước khi bố mẹ đi làm về.', effects: { happy: 6, smarts: -1 }, scene: { anim: 'cheer' } },
            { p: 0.4, text: 'Bố bạn xuất hiện ở cửa quán net, xách tai bạn về giữa tiếng cười của cả quán.', effects: { happy: -6, rel: { father: -6 } }, scene: { anim: 'scared', npcs: [{ role: 'father', anim: 'angry' }] } }
          ] },
        { label: 'Chat Yahoo làm quen', mini: 'love', req: { lacks: ['partner', 'spouse'] },
          success: { stat: 'looks', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Nick “cogaimuadong_9x” hóa ra học trường bên. Hai đứa hẹn nhau ăn kem Tràng Tiền, rồi thành một đôi.', effects: { happy: 9, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: 'Gặp ngoài đời, “người lạ dễ thương” là thằng bạn cùng lớp chơi khăm. Cả lớp cười cả tuần.', effects: { happy: -4 }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Về nhà học bài',
          text: 'Bạn về nhà ôn bài. Cuối kỳ được học sinh tiên tiến.',
          effects: { smarts: 2 }, scene: { loc: 'bedroom', anim: 'study' } }
      ]
    },
    {
      id: 's_era_di_bao', title: 'Đêm “đi bão” AFF Cup', icon: '🏆', age: [6, 85], weight: 30,
      req: { minYear: 2008, maxYear: 2008 },
      text: 'Lê Công Vinh đánh đầu ghi bàn phút bù giờ, Việt Nam vô địch AFF Cup! Cả nước đổ ra đường, cờ đỏ sao vàng rợp trời, còi xe inh ỏi đến sáng.',
      scene: { loc: 'street', time: 'night', anim: 'cheer', npcs: [{ role: 'crowd', anim: 'cheer' }, { role: 'friend', anim: 'jump' }], fx: ['fireworks', 'confetti'] },
      choices: [
        { label: 'Lao ra đường đi bão',
          text: 'Bạn hò hét, đập trống, vẫy cờ đến 3 giờ sáng. Mất giọng ba ngày, nhưng đáng.',
          effects: { happy: 12, health: -1 }, scene: { anim: 'cheer', fx: 'fireworks' } }
      ]
    },
    {
      id: 's_era_smartphone', title: 'Chiếc điện thoại cảm ứng đầu tiên', icon: '📱', age: [13, 70], weight: 2.5,
      req: { minYear: 2010, maxYear: 2014 },
      text: 'Ai cũng bàn về chiếc điện thoại màn hình cảm ứng, lướt Facebook, chụp ảnh “tự sướng”. Cái điện thoại “cục gạch” của bạn bỗng trông thật cổ lỗ.',
      scene: { loc: 'street', anim: 'phone', npcs: [{ role: 'friend', anim: 'phone', say: 'Selfie phát nào!' }], fx: 'sparkle' },
      choices: [
        { label: 'Mua ngay, trả góp cũng được',
          text: 'Bạn lập tài khoản Facebook, đăng tấm ảnh đầu tiên, ngồi đếm từng lượt thích. Thế giới bỗng nằm gọn trong lòng bàn tay.',
          effects: { money: -12000000, happy: 7, asset: { add: { type: 'phone', name: 'Điện thoại cảm ứng', value: 6000000 } } }, scene: { anim: 'phone', fx: 'sparkle' } },
        { label: 'Cục gạch vẫn nghe gọi tốt',
          text: 'Bạn giữ chiếc điện thoại cũ, pin dùng cả tuần. Đỡ bị cuốn vào mạng xã hội.',
          effects: { smarts: 1 }, scene: { anim: 'shrug' } }
      ]
    },
    // ======================= GẦN ĐÂY (2017–2026) =======================
    {
      id: 's_era_sot_dat', title: 'Cơn sốt đất nền', icon: '🗺️', age: [24, 70], weight: 2,
      req: { minYear: 2017, maxYear: 2021, minMoney: 1000000000 },
      text: 'Sốt đất nền khắp nơi: sáng mua chiều bán đã lãi trăm triệu. Đoàn người đi “săn đất” kéo về những vùng quê vốn chỉ có lúa và trâu.',
      scene: { loc: 'countryside', anim: 'phone', npcs: [{ role: 'stranger', anim: 'talk', say: 'Lô góc, sổ đỏ, chốt nhanh!' }], fx: 'money' },
      choices: [
        { label: 'Lướt sóng đất nền', mini: 'stock',
          success: { stat: 'smarts', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Bạn mua đúng lúc, bán đúng đỉnh. Lãi gấp rưỡi chỉ sau ba tháng.', effects: { moneyPct: 0.2, happy: 7 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Cơn sốt hạ nhiệt, lô đất của bạn hóa ra là đất nông nghiệp chưa lên thổ cư. Kẹt vốn mấy năm liền.', effects: { moneyPct: -0.18, happy: -8 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Đứng ngoài xem',
          text: 'Bạn không tham gia. Năm sau, nhiều người “ôm đất” không bán được.',
          effects: { happy: 1 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_era_covid', title: 'Giãn cách xã hội', icon: '😷', age: [6, 99], weight: 12,
      req: { minYear: 2020, maxYear: 2021 },
      text: 'Đại dịch Covid-19. Thành phố giãn cách, đường phố vắng tanh, mọi người ở nhà, khẩu trang và nước rửa tay thành thứ quý nhất.',
      scene: { loc: 'home', anim: 'sit', npcs: [{ role: 'mother', anim: 'phone' }], fx: 'sick' },
      choices: [
        { label: 'Đi làm tình nguyện “ATM gạo”',
          text: 'Bạn mặc đồ bảo hộ phát gạo, chở đồ ăn cho những khu bị phong tỏa. Mệt rã rời nhưng lòng thấy ấm.',
          effects: { karma: 10, happy: 4, health: -2 }, scene: { loc: 'street', anim: 'lift', fx: 'hearts' } },
        { label: 'Ở nhà học nấu ăn, làm bánh',
          text: 'Bạn thành “master chef” bất đắc dĩ, cả nhà ăn bánh mì tự nướng suốt ba tháng.',
          effects: { happy: 4, health: 1 }, scene: { anim: 'cook', fx: 'steam' } },
        { label: 'Tích trữ khẩu trang bán lại',
          text: 'Bạn ôm mấy thùng khẩu trang bán giá cắt cổ. Lãi được ít, nhưng bị hàng xóm khinh ra mặt.',
          effects: { money: 10000000, karma: -10 }, scene: { anim: 'phone', fx: 'money' } }
      ]
    },
    // ======================= TRÍ TUỆ NHÂN TẠO & TƯƠNG LAI =======================
    {
      id: 's_era_ai_thay_viec', title: 'AI làm thay công việc', icon: '🤖', age: [22, 60], weight: 2.5,
      req: { minYear: 2026, job: true },
      text: 'Công ty triển khai hệ thống trí tuệ nhân tạo. Một nửa phòng bạn nhận email “cảm ơn vì những đóng góp”. Sếp gọi bạn vào: “Em chứng minh được mình làm tốt hơn máy không?”',
      scene: { loc: 'office', anim: 'scared', npcs: [{ role: 'boss', anim: 'talk', say: 'Thuyết phục tôi đi.' }], fx: 'question' },
      choices: [
        { label: 'Thuyết phục sếp: em làm chủ được AI', mini: 'interview',
          success: { stat: 'smarts', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn trình bày cách dùng AI tăng năng suất cả phòng gấp ba. Sếp giữ bạn lại, còn giao làm trưởng nhóm “người + máy”.', effects: { perf: 15, happy: 6, smarts: 2 }, scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Sếp lắc đầu. Bạn ôm thùng các-tông ra về, bên cạnh là cái máy chủ vẫn chạy rì rì.', effects: { job: 'fire', happy: -10 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Đi học lại nghề mới',
          text: 'Bạn xin nghỉ, đăng ký khóa học điều khiển robot. Bắt đầu lại ở tuổi này không dễ, nhưng còn hơn ngồi chờ.',
          effects: { job: 'fire', smarts: 4, money: -30000000 }, scene: { loc: 'university', anim: 'study' } }
      ]
    },
    {
      id: 's_era_robot', title: 'Robot giúp việc', icon: '🦾', age: [28, 95], weight: 2,
      req: { minYear: 2040, minMoney: 300000000 },
      text: 'Robot giúp việc giờ rẻ như cái tủ lạnh ngày xưa: nấu ăn, lau nhà, đưa đón con, còn biết kể chuyện cổ tích.',
      scene: { loc: 'home', anim: 'think', npcs: [{ role: 'vendor', anim: 'talk', say: 'Bảo hành mười năm!' }], fx: 'sparkle' },
      choices: [
        { label: 'Mua một con',
          text: 'Con robot tên “Tí” nấu canh chua ngon hơn cả bạn. Cả nhà rảnh tay, tối nào cũng ngồi nói chuyện với nhau lâu hơn.',
          effects: { money: -250000000, happy: 8, health: 2 }, scene: { anim: 'cheer', fx: 'sparkle' } },
        { label: 'Tự làm việc nhà cho vận động',
          text: 'Bạn vẫn tự đi chợ, nấu cơm. Hàng xóm bảo bạn “hoài cổ”.',
          effects: { health: 2 }, scene: { anim: 'cook' } }
      ]
    },
    {
      id: 's_era_taxi_bay', title: 'Taxi bay', icon: '🚁', age: [18, 85], weight: 2,
      req: { minYear: 2045 },
      text: 'Taxi bay tự lái phủ kín bầu trời thành phố. Hôm nay hệ thống tự lái gặp sự cố, buộc bạn phải điều khiển bằng tay giữa giờ cao điểm trên không.',
      scene: { loc: 'street', anim: 'drive', npcs: [{ role: 'stranger', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Cầm lái, né các xe bay khác', mini: 'drive',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn hạ cánh an toàn xuống sân thượng tòa nhà gần nhất. Hãng xe tặng bạn một năm đi miễn phí.', effects: { happy: 8, money: 20000000 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn quệt vào biển quảng cáo 3D, xe rơi xuống tấm đệm an toàn. Trầy xước nhẹ và một phen hú vía.', effects: { health: -6, happy: -4 }, scene: { loc: 'hospital', anim: 'sick' } }
          ] }
      ]
    },
    {
      id: 's_era_sao_hoa', title: 'Du lịch sao Hỏa', icon: '🚀', age: [22, 80], weight: 1.5,
      req: { minYear: 2060, minMoney: 5000000000 },
      text: 'Tour du lịch sao Hỏa 6 tháng khứ hồi đã mở bán. Giá vé bằng cả một căn nhà, nhưng đây là chuyến đi mà loài người mơ ước hàng nghìn năm.',
      scene: { loc: 'airport', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Còn hai ghế cuối!' }], fx: 'stars' },
      choices: [
        { label: 'Mua vé, bay lên sao Hỏa',
          text: 'Bạn đặt chân lên mặt đất đỏ, nhìn Trái Đất chỉ còn là một chấm xanh nhỏ. Bạn khóc trong bộ đồ phi hành gia.',
          effects: { money: -3000000000, happy: 18, health: -4, followers: 0.3 }, scene: { anim: 'cry', fx: 'stars' } },
        { label: 'Để tiền cho con cháu',
          text: 'Bạn xem buổi phóng tàu qua kính thực tế ảo, rồi đi ngủ sớm.',
          effects: { happy: 1 }, scene: { anim: 'sit' } }
      ]
    }
  );
})();
