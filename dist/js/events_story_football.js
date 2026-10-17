/* Một Kiếp Người — đời cầu thủ bóng đá chuyên nghiệp (V-League, đội tuyển, chuyển nhượng, CĐV, kỷ luật…) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const FB = ['cauthu'];
  const lv = (n) => (s) => !!(s.job && s.job.level >= n);
  KN.EVENTS.push(
    // ======================= KHỞI ĐẦU =======================
    {
      id: 's_fb_ra_mat', title: 'Trận ra mắt V-League', icon: '🏟️', age: [16, 24], weight: 3,
      req: { jobId: FB, notFlag: 's_fb_ra_mat' },
      text: 'Phút 78, HLV gọi tên bạn. Bạn đứng ở đường biên chờ thay người, tim đập thình thịch, nghe rõ cả tiếng mười nghìn khán giả. Đồng đội đập vai: “Cứ đá như lúc tập là được.”',
      scene: { loc: 'stadium', time: 'night', anim: 'idle', expr: 'scared', npcs: [{ role: 'boss', anim: 'point', say: 'Vào đi em, đá thoải mái!' }, { role: 'crowd', anim: 'cheer' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Chơi đơn giản, chuyền chắc chân',
          text: 'Bạn chạm bóng chín lần, chuyền chính xác cả chín. Không có gì nổi bật, nhưng HLV gật đầu hài lòng: “Thằng bé này có đầu óc.”',
          effects: { happy: 6, perf: 5, flag: 's_fb_ra_mat' },
          scene: { anim: 'kick', fx: 'sparkle', npcAnim: { boss: 'nod' } } },
        { label: 'Đi bóng qua người để gây ấn tượng',
          success: { stat: 'health', base: 0.25, scale: 0.4 },
          outcomes: [
            { text: 'Bạn xỏ háng hậu vệ đối phương rồi kiến tạo cho đồng đội ghi bàn. Clip tình huống lan khắp mạng, báo chí gọi bạn là “viên ngọc mới”.',
              effects: { happy: 12, looks: 3, perf: 10, followers: 0.3, flag: 's_fb_ra_mat' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { crowd: 'cheer' } } },
            { text: 'Bạn cố đi bóng, mất bóng ngay giữa sân để đối phương phản công ghi bàn. Đội thua. Cả phòng thay đồ không ai nói gì với bạn.',
              effects: { happy: -8, perf: -6, flag: 's_fb_ra_mat' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_fb_ban_thang_dau', title: 'Bàn thắng đầu tiên', icon: '⚽', age: [17, 30], weight: 4,
      req: { jobId: FB, flag: 's_fb_ra_mat', notFlag: 's_fb_ban_thang_dau' },
      text: 'Bóng bật ra sau pha cứu thua của thủ môn, rơi ngay trước chân bạn. Khung thành trống. Bạn sút. Lưới rung. Bàn thắng đầu tiên trong đời cầu thủ chuyên nghiệp. Ăn mừng thế nào đây?',
      scene: { loc: 'stadium', time: 'night', anim: 'cheer', expr: 'happy', npcs: [{ role: 'coworker', anim: 'run' }, { role: 'crowd', anim: 'cheer' }], fx: 'fireworks', shot: 'dramatic' },
      choices: [
        { label: 'Chạy về phía khán đài, chỉ lên trời tặng bố mẹ',
          text: 'Bạn chỉ tay lên trời rồi hướng về góc khán đài nơi bố mẹ ngồi. Mẹ khóc nức nở. Ảnh khoảnh khắc ấy lên trang nhất báo thể thao sáng hôm sau.',
          effects: { happy: 12, perf: 6, rel: { mother: 8, father: 8 }, followers: 0.2, flag: 's_fb_ban_thang_dau' },
          scene: { anim: 'point', fx: 'hearts', npcAnim: { crowd: 'clap' } } },
        { label: 'Màn ăn mừng tự nghĩ, độc lạ',
          text: 'Bạn nằm ra sân giả vờ “ngủ”, cả đội xúm lại “gọi dậy”. Clip ăn mừng được chia sẻ hàng triệu lần, nhãn hàng bắt đầu nhắn tin hỏi giá quảng cáo.',
          effects: { happy: 10, perf: 4, looks: 3, followers: 0.5, flag: 's_fb_ban_thang_dau' },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { coworker: 'laugh' } } },
        { label: 'Chạy lại ôm người kiến tạo',
          text: 'Bạn chạy lại ôm người đồng đội vừa chuyền bóng. Phòng thay đồ quý bạn hơn hẳn: thằng nhóc mới lên mà biết điều.',
          effects: { happy: 8, perf: 5, karma: 3, flag: 's_fb_ban_thang_dau' },
          scene: { anim: 'hug', fx: 'sparkle', npcAnim: { coworker: 'hug' } } }
      ]
    },
    // ======================= ĐỜI THƯỜNG Ở CLB =======================
    {
      id: 's_fb_du_bi', title: 'Ghế dự bị cả mùa', icon: '🪑', age: [18, 33], weight: 1.4,
      req: { jobId: FB, notFlag: 's_fb_du_bi' },
      text: 'HLV mới về mang theo triết lý mới và mấy cầu thủ ruột từ đội cũ. Tên bạn biến khỏi đội hình xuất phát. Mười trận liên tiếp, bạn chỉ ngồi khoác áo dự bị nhìn đồng đội thi đấu.',
      scene: { loc: 'stadium', time: 'night', anim: 'sit', expr: 'sad', npcs: [{ role: 'boss', anim: 'point', say: 'Tập cho tốt rồi tính.' }, { role: 'coworker', anim: 'run' }], fx: 'sweat' },
      choices: [
        { label: 'Tập thêm mỗi chiều, chứng minh bằng hành động',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Ba tháng ở lại sân tập muộn nhất. Một trận đội bị dẫn, HLV tung bạn vào và bạn ghi bàn gỡ hòa. Từ đó bạn trở lại đội hình chính.',
              effects: { happy: 10, perf: 12, health: 2, flag: 's_fb_du_bi' },
              scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Bạn tập kiệt sức mà vẫn không được dùng. Đến cuối mùa, HLV vẫn không nhìn bạn lấy một lần.',
              effects: { happy: -8, health: -3, perf: -3, flag: 's_fb_du_bi' },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Xin CLB cho đi mượn ở đội hạng Nhất',
          text: 'Bạn xuống hạng Nhất theo dạng cho mượn. Sân nhỏ, lương thấp, xe đi sân khách là xe khách giường nằm, nhưng mỗi tuần được đá chính 90 phút.',
          effects: { happy: 3, perf: 8, money: -20000000, flag: 's_fb_du_bi' },
          scene: { anim: 'kick', fx: 'dust' } },
        { label: 'Lên mạng than thở “không được tin tưởng”',
          text: 'Bài đăng của bạn bị báo chí chụp lại. HLV đọc được, ban lãnh đạo phạt bạn vì phát ngôn tiêu cực. Bạn bị đưa xuống tập cùng đội trẻ.',
          effects: { happy: -10, perf: -8, followers: 0.1, money: -30000000, flag: 's_fb_du_bi' },
          scene: { anim: 'phone', fx: 'anger' } }
      ]
    },
    {
      id: 's_fb_no_luong', title: 'CLB nợ lương', icon: '💸', age: [18, 35], weight: 1.2,
      req: { jobId: FB, notFlag: 's_fb_no_luong' },
      text: 'Ông bầu làm ăn thua lỗ, CLB đã nợ lương cầu thủ bốn tháng. Tin đồn đội sẽ giải thể sau mùa giải lan khắp phòng thay đồ. Đội trưởng rủ cả đội tẩy chay buổi tập để đòi quyền lợi.',
      scene: { loc: 'office', anim: 'think', expr: 'sad', npcs: [{ role: 'coworker', anim: 'angry', say: 'Không trả lương thì không tập!' }, { role: 'boss', anim: 'shrug', say: 'Các em thông cảm…' }], fx: 'question' },
      choices: [
        { label: 'Đứng cùng đồng đội đòi lương',
          outcomes: [
            { p: 0.55, text: 'Báo chí vào cuộc, VPF can thiệp. Ông bầu bán bớt đất để trả đủ lương. Cả đội ôm nhau trong phòng thay đồ.',
              effects: { money: 60000000, happy: 6, karma: 3, flag: 's_fb_no_luong' },
              scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.45, text: 'CLB giải thể thật. Cả đội thành cầu thủ tự do, mỗi người tự đi tìm đội mới. Số lương bị nợ coi như mất.',
              effects: { happy: -12, perf: -10, job: 'fire', flag: ['s_fb_no_luong', 's_fb_tu_do'], followUp: { id: 's_fb_tu_do_tim_doi', delay: 0 } },
              scene: { anim: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Lặng lẽ tập, chờ ông bầu xoay xở',
          text: 'Bạn vẫn tập đều. Ông bầu nhớ tình, sang mùa trả bạn một nửa số nợ và giữ bạn lại. Vài đồng đội coi bạn là “phản bội”.',
          effects: { money: 30000000, happy: -2, perf: 3, rel: { friend: -5 }, flag: 's_fb_no_luong' },
          scene: { anim: 'kick', fx: 'sweat' } },
        { label: 'Nhờ người đại diện tìm đội khác ngay',
          text: 'Người đại diện tìm được một đội giữa bảng chịu trả phí giải phóng hợp đồng. Bạn đổi áo giữa mùa, lương mới đều hơn hẳn.',
          effects: { happy: 4, perf: 2, money: 20000000, flag: 's_fb_no_luong' },
          scene: { anim: 'phone', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_fb_tu_do_tim_doi', title: 'Cầu thủ tự do', icon: '🎒', age: [18, 36], chainOnly: true,
      req: { flag: 's_fb_tu_do' },
      text: 'Không CLB, không lương, bạn ôm túi đồ tập đi thử việc khắp nơi. Một đội hạng Nhất ở tỉnh xa đồng ý cho bạn tập thử một tuần.',
      scene: { loc: 'stadium', anim: 'kick', expr: 'sad', npcs: [{ role: 'boss', anim: 'think', say: 'Cho em một tuần.' }], fx: 'dust' },
      choices: [
        { label: 'Dốc hết sức trong tuần thử việc',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn ghi bàn trong trận đấu tập cuối tuần. Đội ký với bạn hợp đồng một năm, lương thấp nhưng có chỗ đá.',
              effects: { happy: 10, job: { hire: 'cauthu' }, unflag: 's_fb_tu_do' },
              scene: { anim: 'cheer', fx: 'sparkle' } },
            { text: 'Họ lịch sự cảm ơn rồi chọn một cầu thủ trẻ hơn. Bạn bắt xe khách về nhà trong đêm.',
              effects: { happy: -10, unflag: 's_fb_tu_do' },
              scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Thôi, giải nghệ đi học nghề khác',
          text: 'Bạn cất đôi giày vào tủ. Bóng đá cho bạn tuổi trẻ đẹp nhất, giờ đến lúc tự lo cho đời mình theo cách khác.',
          effects: { happy: -6, smarts: 2, unflag: 's_fb_tu_do' },
          scene: { anim: 'sad', fx: 'tears' } }
      ]
    },
    {
      id: 's_fb_san_khach', title: 'Sân khách nóng bỏng', icon: '🧨', age: [18, 35], weight: 1.2,
      req: { jobId: FB, notFlag: 's_fb_san_khach' },
      text: 'Trận đấu trên sân khách căng như dây đàn. Cổ động viên đội nhà ném chai nước, đốt pháo sáng, chửi bới mỗi lần bạn chạm bóng. Một chai nước đá bay sượt qua đầu bạn khi đang đá phạt góc.',
      scene: { loc: 'stadium', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'crowd', anim: 'angry' }, { role: 'police', anim: 'run' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Giữ bình tĩnh, đá phạt góc tiếp',
          text: 'Bạn nhặt chai nước để ra ngoài đường biên, đặt bóng và đá. Đồng đội đánh đầu ghi bàn. Khán đài lặng ngắt. Báo chí khen bạn “bản lĩnh”.',
          effects: { happy: 6, perf: 6, karma: 3, flag: 's_fb_san_khach' },
          scene: { anim: 'kick', fx: 'sparkle', npcAnim: { crowd: 'sad' } } },
        { label: 'Đưa tay ra hiệu khiêu khích khán đài',
          text: 'Hành động của bạn làm khán đài bùng nổ. Trận đấu bị dừng 15 phút, VFF phạt bạn {money:20000000} và treo giò hai trận.',
          effects: { happy: -4, perf: -5, money: -20000000, followers: 0.1, flag: 's_fb_san_khach' },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { crowd: 'angry' } } },
        { label: 'Báo trọng tài dừng trận để đảm bảo an toàn',
          text: 'Trọng tài cho dừng trận. Sau trận, đội chủ nhà bị phạt đá sân không khán giả. Bạn nhận được nhiều tin nhắn đe dọa trên mạng.',
          effects: { happy: -2, karma: 2, flag: 's_fb_san_khach' },
          scene: { anim: 'point', fx: 'exclaim', npcAnim: { police: 'talk' } } }
      ]
    },
    {
      id: 's_fb_the_do', title: 'Thẻ đỏ trực tiếp', icon: '🟥', age: [18, 35], weight: 1.1,
      req: { jobId: FB, notFlag: 's_fb_the_do' },
      text: 'Hậu vệ đối phương liên tục chơi xấu, đạp gót, chửi thề vào tai bạn suốt cả hiệp một. Phút 55, hắn lại kéo áo bạn ngã sấp mặt trong khi trọng tài làm ngơ. Máu nóng dồn lên đầu.',
      scene: { loc: 'stadium', time: 'night', anim: 'angry', expr: 'angry', npcs: [{ role: 'stranger', gender: 'm', anim: 'laugh', say: 'Làm gì được tao?' }, { role: 'crowd', anim: 'angry' }], fx: 'anger' },
      choices: [
        { label: 'Hít sâu, bỏ qua, đá tiếp',
          text: 'Bạn đứng dậy phủi áo. Mười phút sau, bạn qua mặt chính gã đó và ghi bàn. Màn trả đũa đẹp nhất là bàn thắng.',
          effects: { happy: 8, perf: 8, karma: 3, flag: 's_fb_the_do' },
          scene: { anim: 'cheer', fx: 'confetti' } },
        { label: 'Đẩy ngã hắn để dằn mặt',
          text: 'Thẻ đỏ trực tiếp. Đội chơi thiếu người và thua. Bạn bị treo giò ba trận, phạt tiền, HLV mắng trước cả đội.',
          effects: { happy: -8, perf: -10, money: -15000000, flag: 's_fb_the_do' },
          scene: { anim: 'angry', fx: 'flash', npcAnim: { stranger: 'fall' } } },
        { label: 'Ăn vạ thật lâu cho hắn bị thẻ',
          outcomes: [
            { p: 0.5, text: 'Trọng tài rút thẻ vàng thứ hai cho gã hậu vệ. Đội bạn thắng, nhưng clip ăn vạ của bạn bị chế thành meme khắp mạng.',
              effects: { happy: 2, perf: 2, karma: -3, looks: -2, flag: 's_fb_the_do' },
              scene: { anim: 'fall', fx: 'question' } },
            { p: 0.5, text: 'Trọng tài xem VAR, rút thẻ vàng cho chính bạn vì ăn vạ. Khán giả huýt sáo suốt phần còn lại của trận.',
              effects: { happy: -6, perf: -4, karma: -2, flag: 's_fb_the_do' },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_fb_bar_dem', title: 'Đêm trước trận cầu lớn', icon: '🍾', age: [18, 32], weight: 1,
      req: { jobId: FB, notFlag: 's_fb_bar_dem' },
      text: 'Tối trước trận derby, mấy người bạn rủ bạn đi quán bar “ngồi một tí cho thư giãn”. Cả đội đang trong thời gian tập trung, giờ giới nghiêm là 22 giờ.',
      scene: { loc: 'karaoke', time: 'night', anim: 'think', npcs: [{ role: 'friend', anim: 'dance', say: 'Một tí thôi mà!' }], fx: 'question' },
      choices: [
        { label: 'Từ chối, đi ngủ sớm',
          text: 'Bạn ngủ đủ tám tiếng. Trận derby bạn chạy không biết mệt, được chấm điểm cao nhất trận.',
          effects: { health: 2, perf: 6, happy: 3, flag: 's_fb_bar_dem' },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } },
        { label: 'Trốn đi “một tí”',
          outcomes: [
            { p: 0.45, text: 'Bạn lẻn về lúc 2 giờ sáng mà không ai biết. Hôm sau chân nặng như chì, bị thay ra từ giờ nghỉ giữa hiệp.',
              effects: { health: -3, perf: -5, happy: 2, flag: 's_fb_bar_dem' },
              scene: { anim: 'sleep', fx: 'zzz' } },
            { p: 0.55, text: 'Một CĐV chụp được ảnh bạn trong quán bar lúc nửa đêm, đăng lên mạng. CLB kỷ luật, phạt nặng, gạch tên khỏi trận derby.',
              effects: { happy: -10, perf: -12, money: -50000000, followers: -0.05, flag: 's_fb_bar_dem' },
              scene: { anim: 'facepalm', fx: 'flash' } }
          ] }
      ]
    },
    {
      id: 's_fb_thuoc_la', title: 'Hộp “thực phẩm chức năng”', icon: '💊', age: [18, 34], weight: 0.9,
      req: { jobId: FB, notFlag: 's_fb_thuoc_la' },
      text: 'Một người quen giới thiệu hộp “thực phẩm chức năng nhập khẩu” giúp hồi phục thể lực cực nhanh, nhiều cầu thủ đội khác đang dùng. Trên vỏ hộp toàn chữ nước ngoài, không rõ thành phần.',
      scene: { loc: 'gym', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Uống vào chạy cả trận không mệt!' }], fx: 'question' },
      choices: [
        { label: 'Đưa bác sĩ đội kiểm tra trước',
          text: 'Bác sĩ đội đọc thành phần, tái mặt: có chất kích thích nằm trong danh sách cấm của WADA. Bạn vừa thoát một án treo giò dài.',
          effects: { happy: 2, karma: 2, smarts: 1, flag: 's_fb_thuoc_la' },
          scene: { anim: 'nod', fx: 'idea', npcs: [{ role: 'doctor', anim: 'shake', say: 'Cái này là doping đấy!' }] } },
        { label: 'Uống thử, chắc không sao',
          outcomes: [
            { p: 0.45, text: 'Thể lực tăng thật. May mắn mùa đó không có đợt kiểm tra doping nào trúng tên bạn.',
              effects: { perf: 6, health: -4, karma: -4, flag: 's_fb_thuoc_la' },
              scene: { anim: 'run', fx: 'sweat' } },
            { p: 0.55, text: 'Mẫu kiểm tra doping sau trận dương tính. Bạn bị cấm thi đấu hai năm, CLB thanh lý hợp đồng. Sự nghiệp gần như chấm dứt.',
              effects: { happy: -20, perf: -30, karma: -6, followers: -0.4, job: 'fire', flag: 's_fb_thuoc_la' },
              scene: { anim: 'cry', fx: 'heartbreak', npcs: [{ role: 'doctor', anim: 'shake' }] } }
          ] }
      ]
    },
    // ======================= TIỀN, TÀI TRỢ, CHUYỂN NHƯỢNG =======================
    {
      id: 's_fb_lot_tay', title: 'Phí “lót tay”', icon: '✍️', age: [19, 32], weight: 1.2,
      req: { jobId: FB, cond: lv(1), notFlag: 's_fb_lot_tay' },
      text: 'Hợp đồng sắp hết. Hai CLB cùng hỏi mua bạn: đội bóng quê nhà trả lót tay {money:1500000000}, còn một đội nhà giàu ở thành phố lớn trả {money:4000000000} nhưng cạnh tranh suất đá chính rất khốc liệt.',
      scene: { loc: 'office', anim: 'think', npcs: [{ role: 'boss', anim: 'talk', say: 'Ký ở đây, tiền về ngay.' }], fx: 'money' },
      choices: [
        { label: 'Ở lại đội bóng quê nhà',
          text: 'Bạn ký tiếp với đội bóng quê hương. Ít tiền hơn, nhưng là trụ cột, được khán giả quê nhà coi như con cháu trong nhà.',
          effects: { money: 1500000000, happy: 8, perf: 5, karma: 3, flag: 's_fb_lot_tay' },
          scene: { anim: 'cheer', fx: 'hearts' } },
        { label: 'Sang đội nhà giàu',
          success: { stat: 'health', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn giành được suất đá chính sau nửa mùa cạnh tranh, cùng đội lên ngôi vô địch V-League.',
              effects: { money: 4000000000, happy: 12, perf: 8, job: 'promote', flag: 's_fb_lot_tay' },
              scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Tiền về đầy tài khoản, nhưng bạn ngồi dự bị gần như cả mùa. Phong độ sa sút, tuyển quốc gia cũng quên tên bạn.',
              effects: { money: 4000000000, happy: -6, perf: -10, flag: 's_fb_lot_tay' },
              scene: { anim: 'sit', fx: 'money' } }
          ] }
      ]
    },
    {
      id: 's_fb_quang_cao', title: 'Hợp đồng quảng cáo', icon: '📺', age: [18, 34], weight: 1.1,
      req: { jobId: FB, cond: lv(1), notFlag: 's_fb_quang_cao' },
      text: 'Bạn bắt đầu có tiếng. Ba lời mời quảng cáo cùng đến: một hãng giày thể thao, một nước tăng lực, và một thương hiệu “thuốc tăng chiều cao” chẳng ai rõ nguồn gốc nhưng trả gấp đôi.',
      scene: { loc: 'studio', anim: 'phone', expr: 'happy', npcs: [{ role: 'boss', anim: 'talk', say: 'Chỉ cần chụp vài kiểu ảnh.' }], fx: 'money' },
      choices: [
        { label: 'Nhận quảng cáo giày thể thao',
          text: 'Bạn mang đôi giày mới ra sân và ghi bàn ngay trận đầu. Hãng gia hạn hợp đồng thêm hai năm.',
          effects: { money: 300000000, happy: 6, looks: 2, followers: 0.15, flag: 's_fb_quang_cao' },
          scene: { anim: 'cheer', fx: 'sparkle' } },
        { label: 'Nhận quảng cáo nước tăng lực',
          text: 'Mặt bạn xuất hiện trên lon nước khắp các tiệm tạp hóa. Hồi nhỏ bạn từng mơ điều này.',
          effects: { money: 400000000, happy: 6, followers: 0.2, flag: 's_fb_quang_cao' },
          scene: { anim: 'drink', fx: 'money' } },
        { label: 'Nhận “thuốc tăng chiều cao” vì trả cao nhất',
          text: 'Tiền về nhanh. Nửa năm sau, cơ quan chức năng kết luận sản phẩm là hàng giả. Bạn bị phạt vì quảng cáo sai sự thật, phụ huynh tràn vào trang cá nhân chửi bới.',
          effects: { money: 400000000, karma: -12, happy: -8, followers: -0.3, flag: 's_fb_quang_cao' },
          scene: { anim: 'facepalm', fx: 'anger' } }
      ]
    },
    // ======================= ĐỘI TUYỂN & ĐỈNH CAO =======================
    {
      id: 's_fb_aff', title: 'Chung kết AFF Cup', icon: '🏆', age: [19, 34], weight: 2,
      req: { jobId: FB, cond: lv(2), notFlag: 's_fb_aff' },
      text: 'Lượt về chung kết AFF Cup trên sân Mỹ Đình, tỷ số đang hòa. Phút 88, đội được hưởng phạt đền. Cả sân bốn mươi nghìn người nín thở. Đội trưởng nhìn bạn: “Em đá đi.”',
      scene: { loc: 'stadium', time: 'night', anim: 'idle', expr: 'scared', npcs: [{ role: 'coworker', anim: 'pray' }, { role: 'crowd', anim: 'pray' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Sút mạnh lên góc cao',
          success: { stat: 'health', base: 0.45, scale: 0.35 },
          outcomes: [
            { text: 'Bóng găm vào góc chữ A. Việt Nam vô địch! Cả nước đổ ra đường đi bão, tên bạn được hô vang từ Bắc vào Nam.',
              effects: { happy: 20, perf: 15, looks: 5, money: 500000000, followers: 1.0, flag: ['s_fb_aff', 's_fb_vo_dich'] },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { crowd: 'cheer', coworker: 'hug' } } },
            { text: 'Bóng đập xà ngang bật ra. Đội hòa rồi thua trên chấm luân lưu. Bạn đổ gục xuống sân, đồng đội phải dìu vào phòng thay đồ.',
              effects: { happy: -18, perf: -8, followers: 0.1, flag: 's_fb_aff', followUp: { id: 's_fb_bi_chui', delay: 0 } },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { crowd: 'sad' } } }
          ] },
        { label: 'Sút nhẹ chính giữa kiểu Panenka',
          outcomes: [
            { p: 0.5, text: 'Thủ môn đổ người, bóng bay lơ lửng vào chính giữa lưới. Việt Nam vô địch với cú Panenka đi vào lịch sử!',
              effects: { happy: 22, perf: 15, looks: 6, money: 500000000, followers: 1.4, flag: ['s_fb_aff', 's_fb_vo_dich'] },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { crowd: 'cheer' } } },
            { p: 0.5, text: 'Thủ môn đứng yên và bắt gọn. Cả sân chết lặng. Cú Panenka hỏng trở thành ác mộng của cả một thế hệ người hâm mộ.',
              effects: { happy: -22, perf: -12, looks: -4, flag: 's_fb_aff', followUp: { id: 's_fb_bi_chui', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'heartbreak' } }
          ] },
        { label: 'Nhường cho đàn anh nhiều kinh nghiệm',
          text: 'Đàn anh đá thành công. Việt Nam vô địch! Bạn là người đầu tiên lao vào ôm anh ấy. Không ai quên cái gật đầu nhường nhịn hôm đó.',
          effects: { happy: 15, karma: 4, perf: 5, money: 300000000, followers: 0.3, flag: ['s_fb_aff', 's_fb_vo_dich'] },
          scene: { anim: 'hug', fx: 'fireworks', npcAnim: { coworker: 'cheer' } } }
      ]
    },
    {
      id: 's_fb_bi_chui', title: 'Cơn bão mạng', icon: '🌪️', age: [18, 40], chainOnly: true,
      req: { jobId: FB },
      text: 'Sau trận thua, trang cá nhân của bạn ngập hàng chục nghìn bình luận chửi bới, có người còn nhắn tin dọa tìm đến nhà. Mẹ gọi điện, giọng run run hỏi bạn có sao không.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'sad', npcs: [], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Đăng lời xin lỗi, hứa sẽ trở lại mạnh mẽ hơn',
          text: 'Lời xin lỗi chân thành làm nhiều người dịu lại. Mùa sau bạn ghi bàn liên tục, những người từng chửi quay lại cổ vũ.',
          effects: { happy: 4, perf: 4, karma: 2 },
          scene: { anim: 'phone', fx: 'sparkle' } },
        { label: 'Khóa mạng xã hội, gặp chuyên gia tâm lý',
          text: 'Bạn khóa hết tài khoản và gặp chuyên gia tâm lý thể thao. Vài tháng sau bạn thấy nhẹ nhõm, tập trung lại vào bóng đá.',
          effects: { happy: 6, health: 2, money: -20000000 },
          scene: { anim: 'talk', fx: 'sparkle' } },
        { label: 'Lên mạng cãi tay đôi với antifan',
          text: 'Bạn trả lời từng bình luận một. Cuộc khẩu chiến lên báo, bạn bị LĐBĐ nhắc nhở và mất thêm nhiều người hâm mộ.',
          effects: { happy: -8, karma: -3, followers: -0.15 },
          scene: { anim: 'angry', fx: 'anger' } }
      ]
    },
    {
      id: 's_fb_seagames', title: 'Tấm huy chương SEA Games', icon: '🥇', age: [18, 23], weight: 1.6,
      req: { jobId: FB, notFlag: 's_fb_seagames' },
      text: 'Bạn được gọi vào đội U22 dự SEA Games. Trận chung kết gặp kình địch Thái Lan, hiệp phụ tỷ số vẫn 1-1. Đôi chân bạn chuột rút, HLV hỏi có muốn thay người không.',
      scene: { loc: 'stadium', time: 'night', anim: 'sick', expr: 'sick', npcs: [{ role: 'boss', anim: 'talk', say: 'Em còn đá được không?' }, { role: 'crowd', anim: 'cheer' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Cắn răng đá tiếp',
          success: { stat: 'health', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Phút 118, bạn lao vào đánh đầu ghi bàn quyết định. Huy chương vàng SEA Games! Bạn khóc như đứa trẻ khi bước lên bục nhận huy chương.',
              effects: { happy: 18, perf: 12, money: 200000000, followers: 0.6, flag: ['s_fb_seagames', 's_fb_vo_dich'] },
              scene: { anim: 'cheer', fx: 'fireworks' } },
            { text: 'Bạn khuỵu xuống, cơ đùi rách. Đội thua trên chấm luân lưu, còn bạn nghỉ thi đấu ba tháng.',
              effects: { happy: -10, health: -10, perf: -8, illness: 'chanthuong', flag: 's_fb_seagames' },
              scene: { anim: 'fall', fx: 'tears' } }
          ] },
        { label: 'Xin thay người, tin đồng đội',
          text: 'Người vào thay ghi bàn ở phút 115. Huy chương vàng! Bạn chạy vào sân ôm cậu ấy, không chút ghen tị.',
          effects: { happy: 12, karma: 3, perf: 3, money: 100000000, flag: ['s_fb_seagames', 's_fb_vo_dich'] },
          scene: { anim: 'hug', fx: 'confetti' } }
      ]
    },
    {
      id: 's_fb_doi_truong', title: 'Chiếc băng đội trưởng', icon: '©️', age: [24, 34], weight: 1.2,
      req: { jobId: FB, cond: lv(2), notFlag: 's_fb_doi_truong' },
      text: 'Đội trưởng cũ giải nghệ. HLV trao cho bạn chiếc băng đội trưởng trước cả đội. Trong phòng thay đồ có hai phe đang mâu thuẫn chuyện chia tiền thưởng.',
      scene: { loc: 'stadium', anim: 'nod', npcs: [{ role: 'boss', anim: 'clap', say: 'Từ nay em dẫn dắt cả đội.' }, { role: 'coworker', anim: 'clap' }], fx: 'sparkle' },
      choices: [
        { label: 'Chia thưởng đều, người dự bị cũng như người đá chính',
          text: 'Bạn đề xuất chia đều tiền thưởng. Đám cầu thủ trẻ quý bạn hết mực, đội đoàn kết, đá có tinh thần hơn hẳn.',
          effects: { happy: 6, karma: 5, perf: 6, flag: 's_fb_doi_truong' },
          scene: { anim: 'hug', fx: 'hearts' } },
        { label: 'Theo phe đàn anh, chia theo thâm niên',
          text: 'Phe đàn anh hài lòng, nhưng mấy cầu thủ trẻ bắt đầu chơi rời rạc. Đội trượt dài trên bảng xếp hạng.',
          effects: { happy: -2, perf: -4, flag: 's_fb_doi_truong' },
          scene: { anim: 'shrug', fx: 'sweat' } },
        { label: 'Từ chối băng đội trưởng, chỉ muốn tập trung đá',
          text: 'Bạn nhường băng đội trưởng cho người khác. Không áp lực, nhưng HLV có vẻ hơi thất vọng.',
          effects: { happy: 2, flag: 's_fb_doi_truong' },
          scene: { anim: 'shake' } }
      ]
    },
    // ======================= GIA ĐÌNH & CUỐI SỰ NGHIỆP =======================
    {
      id: 's_fb_me_om', title: 'Cuộc gọi trước giờ bóng lăn', icon: '📞', age: [18, 35], weight: 0.9,
      req: { jobId: FB, has: ['mother'], notFlag: 's_fb_me_om' },
      text: 'Hai tiếng trước trận quan trọng nhất mùa, em gái gọi: mẹ bị ngất, đang cấp cứu ở bệnh viện tỉnh. Từ sân vận động về quê mất bốn tiếng.',
      scene: { loc: 'stadium', anim: 'phone', expr: 'scared', npcs: [{ role: 'boss', anim: 'talk', say: 'Đội cần em hôm nay…' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Xin HLV về ngay với mẹ',
          text: 'HLV gật đầu: “Gia đình là trên hết.” Bạn ngồi bên giường bệnh suốt đêm. Mẹ tỉnh lại, câu đầu tiên là hỏi đội thắng hay thua.',
          effects: { happy: 2, karma: 5, perf: -3, rel: { mother: 15 }, flag: 's_fb_me_om' },
          scene: { loc: 'hospital', anim: 'hug', fx: 'hearts', npcs: [{ role: 'mother', anim: 'sleep' }] } },
        { label: 'Đá xong trận rồi về',
          text: 'Bạn ghi bàn rồi chỉ tay lên trời tặng mẹ. Về đến bệnh viện lúc nửa đêm, mẹ đã qua cơn nguy kịch. Nhưng em gái nhìn bạn rất lâu mà không nói gì.',
          effects: { happy: -2, perf: 6, rel: { mother: -3, sibling: -8 }, flag: 's_fb_me_om' },
          scene: { anim: 'kick', fx: 'tears' } }
      ]
    },
    {
      id: 's_fb_bang_hlv', title: 'Học bằng huấn luyện viên', icon: '📋', age: [28, 36], weight: 1.1,
      req: { jobId: FB, notFlag: 's_fb_bang_hlv' },
      text: 'Tuổi ngoài ba mươi, bạn bắt đầu thấy mình chậm hơn đàn em. LĐBĐ mở khóa học bằng HLV hạng C dành cho cầu thủ đang thi đấu, học vào những ngày nghỉ.',
      scene: { loc: 'university', anim: 'study', npcs: [{ role: 'teacher', anim: 'talk', say: 'Chiến thuật là cái đầu, không phải đôi chân.' }], fx: 'idea' },
      choices: [
        { label: 'Đăng ký học, chuẩn bị cho sau giải nghệ',
          text: 'Bạn vừa đá vừa học, mệt nhưng vui. Cầm tấm bằng HLV trên tay, bạn thấy tương lai sau khi treo giày bớt mù mịt hẳn.',
          effects: { smarts: 4, happy: 4, money: -30000000, flag: ['s_fb_bang_hlv', 'ex_athlete'] },
          scene: { anim: 'study', fx: 'levelup' } },
        { label: 'Còn đá được thì cứ đá đã',
          text: 'Bạn tập trung thi đấu, gác chuyện học lại. Thêm một mùa giải chất lượng, nhưng câu hỏi “sau này làm gì” vẫn lơ lửng.',
          effects: { perf: 4, flag: 's_fb_bang_hlv' },
          scene: { anim: 'kick', fx: 'sweat' } }
      ]
    },
    {
      id: 's_fb_dan_em', title: 'Cậu nhóc ở lò đào tạo', icon: '🧒', age: [26, 36], weight: 1,
      req: { jobId: FB, notFlag: 's_fb_dan_em' },
      text: 'Một cậu bé 15 tuổi ở lò đào tạo của CLB ngày nào cũng ra sân xem bạn tập, ôm quả bóng cũ sờn. Cậu xin bạn chỉ cho cách sút phạt. Nhìn cậu, bạn thấy chính mình mười lăm năm trước.',
      scene: { loc: 'stadium', time: 'dusk', anim: 'kick', npcs: [{ role: 'kid', anim: 'wave', say: 'Anh dạy em sút phạt với!' }], fx: 'sparkle' },
      choices: [
        { label: 'Ở lại kèm cậu bé mỗi chiều',
          text: 'Mỗi chiều bạn ở lại thêm nửa tiếng. Vài năm sau, cậu bé ấy ra mắt đội một và ghi bàn bằng một cú sút phạt, rồi chạy về phía khán đài chỉ tay vào bạn.',
          effects: { happy: 10, karma: 8, flag: 's_fb_dan_em' },
          scene: { anim: 'clap', fx: 'hearts', npcAnim: { kid: 'kick' } } },
        { label: 'Tặng cậu đôi giày cũ và lời động viên',
          text: 'Bạn tặng cậu đôi giày đã theo mình qua hai mùa giải. Cậu bé ôm đôi giày như báu vật.',
          effects: { happy: 5, karma: 4, flag: 's_fb_dan_em' },
          scene: { anim: 'hug', fx: 'sparkle', npcAnim: { kid: 'cheer' } } }
      ]
    }
  );
})();
