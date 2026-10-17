/* Một Kiếp Người — xã hội: quân ngũ, chính trường, nghề thể thao & nghệ thuật mới, thị trường nhà đất */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const inArmy = (s) => !!(s.army && s.army.until);
  const lv = (n) => (s) => !!(s.job && s.job.level >= n);
  const phase = (p) => (s) => !!(s.market && s.market.phase === p);
  KN.EVENTS.push(
    // ======================= QUÂN NGŨ =======================
    {
      id: 's_army_huanluyen', title: 'Ba tháng tân binh', icon: '🪖', age: [18, 29], weight: 4,
      req: { cond: inArmy, notFlag: 's_army_huanluyen' },
      text: 'Ba tháng huấn luyện tân binh: 5 giờ sáng còi báo thức, chạy 5 cây số, học điều lệnh, tập bắn. Tiểu đội trưởng nghiêm như bố, nhưng tối nào cũng hỏi han từng người.',
      scene: { loc: 'stadium', time: 'dawn', anim: 'run', npcs: [{ role: 'boss', anim: 'point', say: 'Nhanh lên các đồng chí!' }, { role: 'coworker', anim: 'run' }], fx: 'sweat' },
      choices: [
        { label: 'Cố gắng hết sức, xin làm tiểu đội phó',
          success: { stat: 'health', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn dẫn đầu bài chạy vũ trang, được bầu làm tiểu đội phó. Cuối khóa nhận giấy khen “Chiến sĩ tiên tiến”.', effects: { health: 4, karma: 4, happy: 5, flag: 's_army_huanluyen' }, scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Bạn cố quá, bị chuột rút giữa bài chạy. Cả tiểu đội dìu bạn về, từ đó thân nhau như anh em.', effects: { health: -2, happy: 3, flag: 's_army_huanluyen' }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Làm vừa đủ, “trốn việc” khi có thể',
          text: 'Bạn tìm cách lỉnh những buổi lao động nặng. Bị phát hiện, cả tiểu đội bị phạt chạy thêm vì bạn. Bài học về trách nhiệm tập thể nhớ cả đời.',
          effects: { karma: -3, happy: -3, flag: 's_army_huanluyen' }, scene: { anim: 'facepalm', fx: 'anger' } }
      ]
    },
    {
      id: 's_army_culu', title: 'Bộ đội về vùng lũ', icon: '🌊', age: [18, 29], weight: 2,
      req: { cond: inArmy, notFlag: 's_army_culu' },
      text: 'Lũ lớn ở miền Trung. Đơn vị bạn hành quân trong đêm về vùng ngập. Nước chảy xiết, một nhà ba người đang mắc kẹt trên mái tôn.',
      scene: { loc: 'countryside', time: 'night', weather: 'rain', anim: 'swim', npcs: [{ role: 'neighbor', anim: 'scared', say: 'Cứu với!' }, { role: 'kid', anim: 'cry' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Buộc dây quanh người, bơi ra cứu',
          success: { stat: 'health', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn đưa được cả ba người vào bờ an toàn. Báo chí đăng ảnh bạn ướt sũng bế đứa bé. Đơn vị đề nghị tặng bằng khen.', effects: { karma: 12, happy: 10, health: -3, followers: 0.1, flag: 's_army_culu' }, scene: { anim: 'hug', fx: 'hearts' } },
            { text: 'Dòng nước quật bạn vào gốc cây. Đồng đội kéo được bạn lên, cứu được hai người, còn bạn gãy tay nằm viện cả tháng.', effects: { karma: 8, health: -12, illness: 'chanthuong', flag: 's_army_culu' }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Chờ xuồng máy, làm theo chỉ huy',
          text: 'Bạn giữ bình tĩnh, chờ xuồng và hỗ trợ đồng đội đưa người lên. Cả gia đình được cứu. Chỉ huy khen bạn biết kỷ luật.',
          effects: { karma: 6, happy: 5, flag: 's_army_culu' }, scene: { anim: 'nod', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_army_thunha', title: 'Lá thư từ nhà', icon: '✉️', age: [18, 29], weight: 2,
      req: { cond: inArmy, notFlag: 's_army_thunha' },
      text: 'Mẹ gửi thư lên đơn vị, kèm gói mứt gừng tự làm. Trong thư mẹ kể ở nhà vẫn ổn, nhưng nét chữ run run làm bạn đoán mẹ đang giấu chuyện gì.',
      scene: { loc: 'bedroom', time: 'night', anim: 'study', npcs: [], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Xin phép gọi điện về hỏi thăm',
          text: 'Mẹ bị ốm mấy tuần nhưng không muốn bạn lo. Chính trị viên cho bạn về phép 3 ngày. Bạn ngồi bên giường mẹ, nấu cháo cho mẹ ăn.',
          effects: { happy: 4, rel: { mother: 12 }, flag: 's_army_thunha' }, scene: { loc: 'home', anim: 'hug', fx: 'hearts', npcs: [{ role: 'mother', anim: 'sleep' }] } },
        { label: 'Viết thư trả lời, kể chuyện vui ở đơn vị',
          text: 'Bạn viết bốn trang kể chuyện đồng đội, chuyện tăng gia trồng rau. Mẹ đọc đi đọc lại, mang khoe cả xóm.',
          effects: { happy: 3, rel: { mother: 8 }, flag: 's_army_thunha' }, scene: { anim: 'study', fx: 'hearts' } }
      ]
    },

    // ======================= CHÍNH TRƯỜNG =======================
    {
      id: 's_pol_phongbi', title: 'Phong bì “cảm ơn”', icon: '✉️', age: [24, 64], weight: 1.6,
      req: { jobId: ['chinhtri'], notFlag: 's_pol_phongbi' },
      text: 'Chủ đầu tư dự án khu đô thị xin gặp riêng. Ông ta đặt lên bàn một phong bì dày: “Chút quà cảm ơn anh/chị đã tạo điều kiện. Hồ sơ đất bên em mong được duyệt sớm.” Trong phong bì là {money:500000000}.',
      scene: { loc: 'office', time: 'night', anim: 'think', expr: 'scared', npcs: [{ role: 'boss', gender: 'm', anim: 'talk', say: 'Chút lòng thành thôi mà.' }], fx: 'money', shot: 'dramatic' },
      choices: [
        { label: 'Từ chối, báo cáo lên cấp trên',
          text: 'Bạn đẩy phong bì lại và lập biên bản báo cáo. Hồ sơ dự án bị rà soát kỹ, phát hiện nhiều sai phạm. Bạn được khen, nhưng cũng có thêm vài “kẻ thù”.',
          effects: { karma: 10, happy: 2, perf: 8, flag: 's_pol_phongbi' }, scene: { anim: 'shake', fx: 'sparkle' } },
        { label: 'Nhận, “ai cũng thế cả”',
          text: 'Phong bì vào ngăn kéo, hồ sơ được ký trong tuần. Đêm đó bạn ngủ không yên, mỗi tiếng chuông cửa đều làm bạn giật mình.',
          effects: { money: 500000000, karma: -18, flag: ['s_pol_phongbi', 's_pol_thamnhung'], followUp: { id: 's_pol_dieutra', delay: 3 } }, scene: { anim: 'phone', fx: 'money' } },
        { label: 'Không nhận nhưng vẫn “ưu tiên” hồ sơ',
          text: 'Bạn không cầm tiền, nhưng hồ sơ của ông ta được xử lý nhanh bất thường. Người dân bị thu hồi đất bắt đầu viết đơn khiếu nại.',
          effects: { karma: -5, flag: 's_pol_phongbi' }, scene: { anim: 'shrug', fx: 'question' } }
      ]
    },
    {
      id: 's_pol_dieutra', title: 'Đoàn thanh tra', icon: '🔍', age: [25, 75], chainOnly: true,
      req: { flag: 's_pol_thamnhung' },
      text: 'Ủy ban Kiểm tra vào cuộc kiểm tra dự án khu đô thị năm nào. Chủ đầu tư đã bị bắt và khai ra danh sách những người nhận “quà”. Tên bạn có trong đó.',
      scene: { loc: 'office', anim: 'sit', expr: 'scared', npcs: [{ role: 'police', anim: 'talk', say: 'Đề nghị đồng chí giải trình.' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Thành khẩn, nộp lại toàn bộ tiền',
          text: 'Bạn khai báo đầy đủ, nộp lại số tiền đã nhận. Nhờ thành khẩn, bạn chỉ bị cách chức và kỷ luật Đảng, không bị truy cứu hình sự. Sự nghiệp chính trị coi như chấm dứt.',
          effects: { money: -500000000, karma: 6, happy: -15, job: 'fire', unflag: 's_pol_thamnhung' }, scene: { anim: 'bow', fx: 'tears' } },
        { label: 'Chối bỏ, nhờ “quan hệ” chạy án',
          outcomes: [
            { p: 0.3, text: 'Người quen đứng ra lo liệu, vụ việc chìm xuồng. Nhưng bạn biết mình đã mắc nợ những người không nên mắc nợ.', effects: { money: -300000000, karma: -10, unflag: 's_pol_thamnhung' }, scene: { anim: 'shrug', fx: 'money' } },
            { p: 0.7, text: 'Chứng cứ rõ ràng, thêm tội đưa hối lộ để chạy án. Bạn bị khởi tố, lĩnh án tù, tài sản bị kê biên. Báo chí đưa tin khắp nơi.', effects: { moneyPct: -0.7, karma: -15, happy: -30, health: -10, job: 'fire', flag: 'record', unflag: 's_pol_thamnhung' }, scene: { anim: 'cry', fx: 'heartbreak', npcs: [{ role: 'police', anim: 'point' }] } }
          ] }
      ]
    },
    {
      id: 's_pol_chaychuc', title: 'Ghế phó giám đốc sở', icon: '🪑', age: [30, 58], weight: 1.2,
      req: { jobId: ['chinhtri'], cond: lv(2), notFlag: 's_pol_chaychuc' },
      text: 'Ghế phó giám đốc sở đang trống. Một người “có quan hệ” gợi ý: “Muốn chắc ăn thì chuẩn bị chừng {money:2000000000}, anh lo cho.” Đối thủ cạnh tranh của bạn nghe nói đã “chuẩn bị” rồi.',
      scene: { loc: 'cafe', time: 'night', anim: 'think', npcs: [{ role: 'stranger', gender: 'm', anim: 'talk', say: 'Thời buổi này phải thế.' }], fx: 'money' },
      choices: [
        { label: 'Không chạy, để năng lực nói thay',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Hội đồng chọn bạn nhờ thành tích công tác. Đối thủ “chạy” bị phát hiện, mất luôn cả chức cũ.', effects: { job: 'promote', karma: 8, happy: 10, flag: 's_pol_chaychuc' }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Ghế rơi vào tay người khác. Bạn vẫn ở vị trí cũ, ngẩng cao đầu nhưng lòng hơi chùng xuống.', effects: { happy: -6, karma: 4, flag: 's_pol_chaychuc' }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Vay mượn để “chạy”',
          outcomes: [
            { p: 0.5, text: 'Bạn được bổ nhiệm, nhưng nợ ngập đầu. Từ đó mỗi quyết định đều có người “nhắc nhở” bạn nhớ ơn.', effects: { money: -2000000000, job: 'promote', karma: -15, flag: ['s_pol_chaychuc', 's_pol_thamnhung'], followUp: { id: 's_pol_dieutra', delay: 4 } }, scene: { anim: 'nod', fx: 'money' } },
            { p: 0.5, text: 'Tiền mất, chức không thấy. Kẻ môi giới biến mất, bạn không dám tố cáo vì chính mình cũng phạm luật.', effects: { money: -2000000000, karma: -12, happy: -15, flag: 's_pol_chaychuc' }, scene: { anim: 'facepalm', fx: 'heartbreak' } }
          ] }
      ]
    },
    {
      id: 's_pol_tiepdan', title: 'Buổi tiếp dân', icon: '🗣️', age: [24, 64], weight: 1.4,
      req: { jobId: ['chinhtri'], notFlag: 's_pol_tiepdan' },
      text: 'Buổi tiếp dân kéo dài đến chiều. Một cụ bà 80 tuổi run run đưa bộ hồ sơ khiếu nại đất đai đã gửi 15 năm chưa ai giải quyết.',
      scene: { loc: 'office', anim: 'talk', npcs: [{ role: 'neighbor', gender: 'f', age: 80, anim: 'cry', say: 'Cháu giúp bà với…' }, { role: 'crowd', anim: 'idle' }], fx: 'tears' },
      choices: [
        { label: 'Nhận hồ sơ, theo đến cùng',
          text: 'Bạn mất ba tháng lục lại giấy tờ, đối chất với các phòng ban. Cuối cùng bà cụ nhận lại được mảnh đất. Bà nắm tay bạn khóc mãi.',
          effects: { karma: 12, happy: 8, perf: 6, flag: 's_pol_tiepdan' }, scene: { anim: 'hug', fx: 'hearts' } },
        { label: 'Hứa “sẽ xem xét” rồi chuyển phòng ban',
          text: 'Hồ sơ lại nằm trong ngăn kéo của một phòng ban khác. Bà cụ ra về, lưng còng hơn lúc đến.',
          effects: { karma: -4, flag: 's_pol_tiepdan' }, scene: { anim: 'shrug', fx: 'sweat' } }
      ]
    },
    {
      id: 's_pol_tinnhiem', title: 'Lấy phiếu tín nhiệm', icon: '🗳️', age: [28, 64], weight: 1.1,
      req: { jobId: ['chinhtri'], cond: lv(1), notFlag: 's_pol_tinnhiem' },
      text: 'Hội đồng nhân dân lấy phiếu tín nhiệm các chức danh. Mấy năm qua bạn làm được nhiều việc, nhưng cũng mích lòng không ít người.',
      scene: { loc: 'office', anim: 'think', npcs: [{ role: 'crowd', anim: 'idle' }], fx: 'question' },
      choices: [
        { label: 'Báo cáo thẳng thắn cả thành tích lẫn hạn chế',
          success: { stat: 'karma', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn được tín nhiệm cao. Báo địa phương khen bài phát biểu “dám nói thật”.', effects: { perf: 10, happy: 6, flag: 's_pol_tinnhiem' }, scene: { anim: 'bow', fx: 'confetti' } },
            { text: 'Phiếu tín nhiệm thấp vượt ngưỡng. Bạn bị điều chuyển sang vị trí khác, lương giảm.', effects: { perf: -15, happy: -8, flag: 's_pol_tinnhiem' }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Đi “vận động” từng đại biểu',
          text: 'Bạn mời cơm, tặng quà từng người. Phiếu tín nhiệm cao chót vót, nhưng ai cũng biết vì sao.',
          effects: { money: -80000000, karma: -6, perf: 4, flag: 's_pol_tinnhiem' }, scene: { anim: 'talk', fx: 'money' } }
      ]
    },
    {
      id: 's_pol_chongbao', title: 'Đêm chống bão', icon: '🌀', age: [26, 64], weight: 1.1,
      req: { jobId: ['chinhtri'], cond: lv(2), notFlag: 's_pol_chongbao' },
      text: 'Siêu bão sắp đổ bộ. Bạn là người đứng đầu địa phương, phải quyết định có sơ tán hàng nghìn hộ dân ven biển hay không. Sơ tán thì tốn kém, dân phản đối; không sơ tán thì có thể có thương vong.',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'point', npcs: [{ role: 'police', anim: 'run' }, { role: 'crowd', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Lệnh sơ tán bắt buộc toàn bộ',
          text: 'Bạn thức trắng ba đêm chỉ đạo. Bão quét qua tan hoang nhưng không ai thiệt mạng. Dân làng gọi bạn là “ông/bà lãnh đạo của dân”.',
          effects: { karma: 12, perf: 12, happy: 8, health: -4, flag: 's_pol_chongbao' }, scene: { anim: 'cheer', fx: 'sparkle' } },
        { label: 'Chỉ khuyến cáo, để dân tự quyết',
          outcomes: [
            { p: 0.5, text: 'Bão đổi hướng, thiệt hại nhẹ. Bạn thở phào, tiết kiệm được ngân sách.', effects: { perf: 2, flag: 's_pol_chongbao' }, scene: { anim: 'shrug' } },
            { p: 0.5, text: 'Bão đổ bộ đúng tâm, nhiều nhà ven biển bị cuốn trôi, có người thiệt mạng. Bạn bị kỷ luật vì chủ quan.', effects: { karma: -8, perf: -20, happy: -15, flag: 's_pol_chongbao' }, scene: { anim: 'cry', fx: 'tears' } }
          ] }
      ]
    },

    // ======================= THỂ THAO & NGHỆ THUẬT MỚI =======================
    {
      id: 's_boi_kyluc', title: 'Kỷ lục quốc gia', icon: '🏊', age: [15, 30], weight: 2,
      req: { jobId: ['boi'], notFlag: 's_boi_kyluc' },
      text: 'Chung kết 200 mét tự do giải vô địch quốc gia. Lượt quay vòng cuối, bạn đang ngang hàng với đương kim vô địch. Phổi như sắp nổ tung.',
      scene: { loc: 'beach', anim: 'swim', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Dồn hết sức nước rút',
          success: { stat: 'health', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn chạm thành trước 0,08 giây, phá kỷ lục quốc gia! Ảnh bạn giơ tay trong làn nước lên báo khắp nơi.', effects: { happy: 15, perf: 15, money: 100000000, followers: 0.4, flag: 's_boi_kyluc' }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn đuối sức ở 10 mét cuối, về nhì. Huy chương bạc, nhưng lần đầu bạn tin mình có thể vô địch.', effects: { happy: 4, perf: 6, money: 30000000, flag: 's_boi_kyluc' }, scene: { anim: 'nod', fx: 'sparkle' } }
          ] }
      ]
    },
    {
      id: 's_dk_doping', title: 'Viên thuốc “bổ sung”', icon: '💊', age: [16, 32], weight: 1.5,
      req: { jobId: ['dienkinh', 'boi'], notFlag: 's_dk_doping' },
      text: 'Trước SEA Games, một “chuyên gia” lén đưa bạn lọ thuốc: “Uống đều ba tuần, cơ bắp bùng nổ. Hết thời gian thải là xét nghiệm không ra đâu.”',
      scene: { loc: 'gym', time: 'night', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Ai mà biết được.' }], fx: 'question' },
      choices: [
        { label: 'Từ chối, báo ban huấn luyện',
          text: 'Bạn báo cáo, đường dây cung cấp chất cấm bị triệt phá. Bạn thi đấu bằng sức mình và giành huy chương đồng sạch sẽ.',
          effects: { karma: 8, happy: 5, money: 30000000, flag: 's_dk_doping' }, scene: { anim: 'shake', fx: 'sparkle' } },
        { label: 'Uống thử',
          outcomes: [
            { p: 0.4, text: 'Bạn phá kỷ lục, giành huy chương vàng. Nhưng mỗi lần thấy tin VĐV bị tước huy chương, tim bạn lại thắt lại.', effects: { money: 200000000, karma: -12, perf: 10, health: -5, flag: 's_dk_doping' }, scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.6, text: 'Mẫu thử dương tính. Bạn bị tước huy chương, cấm thi đấu 4 năm. Sự nghiệp coi như kết thúc.', effects: { happy: -20, karma: -12, perf: -40, followers: -0.5, job: 'fire', flag: 's_dk_doping' }, scene: { anim: 'cry', fx: 'heartbreak' } }
          ] }
      ]
    },
    {
      id: 's_dk_seagames', title: 'Đường chạy 100 mét', icon: '🏃', age: [16, 32], weight: 1.8,
      req: { jobId: ['dienkinh'], cond: lv(2), notFlag: 's_dk_seagames' },
      text: 'Chung kết 100 mét SEA Games. Tám người, mười giây, cả đất nước nhìn vào. Bạn quỳ xuống bàn đạp xuất phát, nghe rõ tiếng tim mình đập.',
      scene: { loc: 'stadium', anim: 'run', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Xuất phát thật nhanh, liều một chút',
          outcomes: [
            { p: 0.45, text: 'Xuất phát hoàn hảo, bạn về nhất với 10,21 giây! Lá cờ đỏ sao vàng khoác trên vai.', effects: { happy: 18, perf: 15, money: 200000000, followers: 0.6, flag: 's_dk_seagames' }, scene: { anim: 'cheer', fx: 'fireworks' } },
            { p: 0.55, text: 'Bạn xuất phát sớm 0,09 giây — phạm quy, bị truất quyền thi đấu. Bốn năm khổ luyện tan biến trong một tiếng súng.', effects: { happy: -15, perf: -8, flag: 's_dk_seagames' }, scene: { anim: 'facepalm', fx: 'heartbreak' } }
          ] },
        { label: 'Xuất phát an toàn, dồn sức về đích',
          text: 'Bạn xuất phát chậm hơn đối thủ nhưng tăng tốc cực mạnh, về thứ ba. Huy chương đồng SEA Games đầu tiên trong sự nghiệp.',
          effects: { happy: 10, perf: 8, money: 50000000, flag: 's_dk_seagames' }, scene: { anim: 'cheer', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_bc_thailan', title: 'Lời mời từ Thái Lan', icon: '🏐', age: [18, 30], weight: 1.5,
      req: { jobId: ['bongchuyen'], cond: lv(1), notFlag: 's_bc_thailan' },
      text: 'Một CLB bóng chuyền mạnh của Thái Lan mời bạn sang thi đấu một mùa, lương gấp ba trong nước. CLB hiện tại thì đang cần bạn cho giải vô địch quốc gia.',
      scene: { loc: 'court', anim: 'phone', npcs: [{ role: 'boss', anim: 'talk', say: 'Ở lại với đội nhé em.' }], fx: 'question' },
      choices: [
        { label: 'Sang Thái Lan thi đấu một mùa',
          text: 'Một mùa giải ở Thái giúp bạn tiến bộ vượt bậc. Về nước, bạn được gọi thẳng lên đội tuyển quốc gia.',
          effects: { money: 400000000, happy: 6, perf: 12, job: 'promote', flag: 's_bc_thailan' }, scene: { loc: 'airport', anim: 'wave', fx: 'sparkle' } },
        { label: 'Ở lại cùng CLB',
          text: 'Bạn ở lại, cùng đồng đội giành chức vô địch quốc gia. Người hâm mộ quê nhà yêu bạn hơn bao giờ hết.',
          effects: { happy: 8, karma: 4, money: 100000000, flag: 's_bc_thailan' }, scene: { anim: 'cheer', fx: 'confetti' } }
      ]
    },
    {
      id: 's_hoasi_trienlam', title: 'Triển lãm đầu tiên', icon: '🖼️', age: [20, 70], weight: 1.8,
      req: { jobId: ['hoasi'], notFlag: 's_hoasi_trienlam' },
      text: 'Sau mười năm vẽ, bạn có triển lãm cá nhân đầu tiên. Một đại gia đứng rất lâu trước bức tranh bạn yêu nhất, rồi hỏi giá.',
      scene: { loc: 'studio', anim: 'talk', npcs: [{ role: 'boss', anim: 'think', say: 'Bức này bao nhiêu?' }, { role: 'crowd', anim: 'clap' }], fx: 'sparkle' },
      choices: [
        { label: 'Bán, với giá thật cao',
          text: 'Ông ta trả {money:300000000} không mặc cả. Tin lan ra, tranh của bạn bỗng thành hàng hot, phòng tranh xin ký hợp đồng độc quyền.',
          effects: { money: 300000000, happy: 8, perf: 15, job: 'promote', flag: 's_hoasi_trienlam' }, scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Không bán, bức này là “con” của mình',
          text: 'Bạn giữ lại bức tranh. Đại gia mua ba bức khác thay vào. Bức tranh kia sau này treo ở phòng khách nhà bạn đến cuối đời.',
          effects: { money: 150000000, happy: 6, karma: 2, flag: 's_hoasi_trienlam' }, scene: { anim: 'nod', fx: 'hearts' } }
      ]
    },
    {
      id: 's_hoasi_dao', title: 'Tranh bị đạo', icon: '🎨', age: [20, 75], weight: 1.2,
      req: { jobId: ['hoasi'], notFlag: 's_hoasi_dao' },
      text: 'Bạn phát hiện một thương hiệu thời trang in nguyên bức tranh của mình lên áo bán khắp cả nước, không xin phép, không ghi tên.',
      scene: { loc: 'street', anim: 'angry', npcs: [{ role: 'vendor', anim: 'idle' }], fx: 'anger' },
      choices: [
        { label: 'Kiện ra tòa',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Tòa xử bạn thắng kiện, hãng phải bồi thường và xin lỗi công khai. Vụ kiện làm tên bạn nổi tiếng hơn cả trăm buổi triển lãm.', effects: { money: 400000000, happy: 10, followers: 0.3, flag: 's_hoasi_dao' }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Vụ kiện kéo dài ba năm, tốn kém, cuối cùng hai bên hòa giải với khoản bồi thường nhỏ.', effects: { money: -50000000, happy: -6, flag: 's_hoasi_dao' }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Đăng bài lên mạng xã hội bóc phốt',
          text: 'Bài viết lan truyền, hãng rút sản phẩm và liên hệ mua bản quyền. Bạn nhận thêm nhiều đơn đặt vẽ.',
          effects: { money: 100000000, happy: 6, followers: 0.2, flag: 's_hoasi_dao' }, scene: { anim: 'phone', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_nhac_hit', title: 'Giai điệu nửa đêm', icon: '🎸', age: [16, 60], weight: 1.8,
      req: { jobId: ['nhaccong'], notFlag: 's_nhac_hit' },
      text: 'Sau buổi diễn ở quán bar, bạn ngân nga một giai điệu tự nghĩ ra. Khách quen quay lại đăng lên mạng, sáng ra clip đã có nửa triệu lượt xem.',
      scene: { loc: 'karaoke', time: 'night', anim: 'guitar', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'sparkle' },
      choices: [
        { label: 'Thu âm chỉnh chu, phát hành chính thức',
          text: 'Bài hát được phát hành, lọt top thịnh hành. Các nhãn hàng, ca sĩ tìm đến mời bạn sáng tác.',
          effects: { money: 200000000, happy: 12, perf: 15, followers: 0.6, job: 'promote', flag: 's_nhac_hit' }, scene: { loc: 'studio', anim: 'cheer', fx: 'confetti' } },
        { label: 'Bán bản quyền cho ca sĩ nổi tiếng',
          text: 'Một ca sĩ mua bài hát với giá {money:150000000}. Bài hát thành hit, nhưng chẳng ai biết bạn là người viết.',
          effects: { money: 150000000, happy: 2, flag: 's_nhac_hit' }, scene: { anim: 'shrug', fx: 'money' } }
      ]
    },
    {
      id: 's_nhac_xuyendem', title: 'Show thứ ba trong đêm', icon: '🌙', age: [18, 60], weight: 1.2,
      req: { jobId: ['nhaccong'], notFlag: 's_nhac_xuyendem' },
      text: 'Mùa cưới, bạn chạy ba show mỗi tối, ngủ chưa đầy bốn tiếng. Đêm nay ở show thứ ba, ngón tay bắt đầu tê, mắt díp lại.',
      scene: { loc: 'wedding', time: 'night', anim: 'guitar', expr: 'sleepy', npcs: [{ role: 'crowd', anim: 'dance' }], fx: 'zzz' },
      choices: [
        { label: 'Bỏ bớt show, giữ sức',
          text: 'Bạn chỉ nhận một show mỗi tối. Thu nhập giảm, nhưng tay đàn tươi hơn, cả ban nhạc chơi hay hẳn.',
          effects: { money: -20000000, health: 3, happy: 3, flag: 's_nhac_xuyendem' }, scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Cố thêm mùa cưới này',
          text: 'Bạn kiếm được một khoản lớn, nhưng cuối mùa bị viêm gân ngón tay, phải nghỉ đàn hai tháng.',
          effects: { money: 80000000, health: -8, illness: 'chanthuong', flag: 's_nhac_xuyendem' }, scene: { anim: 'sick', fx: 'sweat' } }
      ]
    },

    // ======================= THỊ TRƯỜNG NHÀ ĐẤT =======================
    {
      id: 's_market_sotdat', title: 'Cò đất gõ cửa', icon: '🏚️', age: [25, 70], weight: 2.5,
      req: { cond: phase('sot'), minMoney: 300000000, notFlag: 's_market_sotdat' },
      text: 'Thị trường đang sốt. Một cò đất rủ bạn góp {money:300000000} mua chung lô đất “sắp lên quy hoạch sân bay”: “Ba tháng là gấp đôi, không đi là lỡ chuyến tàu!”',
      scene: { loc: 'countryside', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Gấp đôi trong ba tháng!' }], fx: 'money' },
      choices: [
        { label: 'Xuống tiền, lướt sóng',
          outcomes: [
            { p: 0.45, text: 'Bạn bán lại đúng đỉnh, lời gần gấp đôi. Cả họ hàng gọi bạn là “thánh đất”.', effects: { money: 260000000, happy: 8, flag: 's_market_sotdat' }, scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.55, text: 'Thông tin quy hoạch là tin đồn, lô đất không ai mua lại. Tiền chôn ở đó, cò đất thì cắt liên lạc.', effects: { money: -300000000, happy: -10, flag: 's_market_sotdat' }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Đứng ngoài cuộc chơi',
          text: 'Bạn từ chối. Vài tháng sau, nhiều người trong làng ôm đất “sân bay” không bán được, có người phải bán cả nhà trả nợ.',
          effects: { karma: 2, happy: 2, flag: 's_market_sotdat' }, scene: { anim: 'shake', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_market_vono', title: 'Người bạn vỡ nợ', icon: '💥', age: [25, 75], weight: 2,
      req: { cond: phase('vo'), has: ['friend'], notFlag: 's_market_vono' },
      text: 'Bong bóng vỡ. {friend} gọi cho bạn lúc nửa đêm: vay ngân hàng mua ba lô đất đúng đỉnh, giờ giá giảm một nửa, ngân hàng đòi nợ, vợ con không biết. “Cho tớ vay {money:200000000}, tớ hứa trả.”',
      scene: { loc: 'home', time: 'night', anim: 'phone', npcs: [{ role: 'friend', anim: 'cry', say: 'Cứu tớ với…' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Cho vay, bạn bè lúc hoạn nạn', req: { minMoney: 200000000 },
          outcomes: [
            { p: 0.5, text: 'Hai năm sau thị trường hồi phục, {friend} trả đủ cả gốc, còn tặng thêm chai rượu quý. Tình bạn bền chặt hơn bao giờ hết.', effects: { karma: 8, rel: { friend: 20 }, happy: 4, flag: 's_market_vono' }, scene: { anim: 'hug', fx: 'hearts' } },
            { p: 0.5, text: '{friend} không trả nổi, rồi ngại không dám gặp bạn nữa. Mất tiền, mất luôn cả bạn.', effects: { money: -200000000, karma: 6, rel: { friend: -20 }, happy: -6, flag: 's_market_vono' }, scene: { anim: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Từ chối khéo, khuyên bạn bán bớt cắt lỗ',
          text: 'Bạn từ chối cho vay nhưng ngồi cả đêm giúp {friend} tính toán. Bán bớt một lô, cắt lỗ, bạn ấy giữ được nhà.',
          effects: { karma: 3, rel: { friend: 5 }, flag: 's_market_vono' }, scene: { anim: 'talk', fx: 'idea' } }
      ]
    }
  );
})();
