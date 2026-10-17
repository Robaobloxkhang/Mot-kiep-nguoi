/* Một Kiếp Người — mạng xã hội, thi đấu nước ngoài, du học & làm việc xứ người (SPEC §5.1–5.2) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const SPORT = ['cauthu', 'vdv_vo', 'caulong', 'esports'];
  KN.EVENTS.push(
    // ======================= MẠNG XÃ HỘI: BỊ BÓC PHỐT =======================
    {
      id: 's_mxh_bocphot', title: 'Bị bóc phốt', icon: '🔥', age: [16, 70], weight: 1.4,
      req: { minFollowers: 20000, notFlag: 's_mxh_bocphot' },
      text: 'Sáng ngủ dậy, điện thoại nóng ran: một trang chuyên “bóc phốt” đăng bài dài cả nghìn chữ, kèm ảnh chụp tin nhắn cũ và lời kể của “người quen” rằng bạn sống hai mặt, từng bắt nạt bạn học. Một nửa là thật, một nửa bị thêm mắm dặm muối. Dưới bài đã có hai vạn bình luận.',
      scene: { loc: 'bedroom', time: 'dawn', anim: 'phone', expr: 'scared', npcs: [], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Livestream xin lỗi phần mình sai, đính chính phần bịa',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn lên live mặt mộc, nhận lỗi cũ thật lòng và đưa bằng chứng cho những đoạn bị cắt ghép. Người xem chia phe, nhưng phần đông thấy bạn đủ trưởng thành. Bão dịu dần sau một tuần.',
              effects: { followers: -0.08, karma: 4, happy: -3, flag: 's_mxh_bocphot', followUp: { id: 's_mxh_bocphot_sau', delay: 1 } },
              scene: { anim: 'talk', fx: 'sparkle' } },
            { text: 'Buổi live bị cắt từng đoạn đăng lại với tựa “xin lỗi cho có”. Bạn càng giải thích càng bị chửi.',
              effects: { followers: -0.3, happy: -10, flag: 's_mxh_bocphot', followUp: { id: 's_mxh_bocphot_sau', delay: 1 } },
              scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Im lặng tuyệt đối, khóa bình luận',
          text: 'Bạn khóa bình luận, không đăng gì suốt hai tháng. Drama tự nguội, nhưng mất kha khá người theo dõi và vài nhãn hàng âm thầm rút hợp đồng.',
          effects: { followers: -0.18, happy: -5, flag: 's_mxh_bocphot' },
          scene: { anim: 'sit', fx: 'sweat' } },
        { label: 'Thuê luật sư gửi đơn kiện tội vu khống',
          outcomes: [
            { p: 0.45, text: 'Công an mời chủ trang lên làm việc, họ phải gỡ bài và đăng đính chính. Bạn tốn {money:60000000} tiền luật sư, nhưng lấy lại danh dự.',
              effects: { money: -60000000, followers: 0.05, happy: 5, karma: 2, flag: 's_mxh_bocphot' },
              scene: { loc: 'office', anim: 'nod', fx: 'sparkle', npcs: [{ role: 'police', anim: 'talk' }] } },
            { p: 0.55, text: 'Vụ kiện kéo dài, cư dân mạng gọi bạn là “làm to chuyện”. Tốn {money:60000000} mà phốt thì vẫn nằm đó.',
              effects: { money: -60000000, followers: -0.15, happy: -6, flag: 's_mxh_bocphot' },
              scene: { loc: 'office', anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Đăng clip cà khịa ngược lại trang bóc phốt',
          outcomes: [
            { p: 0.35, text: 'Clip duyên dáng của bạn lật ngược tình thế, dân mạng quay sang chế giễu trang bóc phốt. Lượt theo dõi còn tăng.',
              effects: { followers: 0.12, happy: 6, flag: 's_mxh_bocphot' },
              scene: { anim: 'laugh', fx: 'stars' } },
            { p: 0.65, text: 'Clip bị xem là “thái độ”, phốt mới chồng phốt cũ. Nhãn hàng gửi thư chấm dứt hợp đồng.',
              effects: { followers: -0.35, happy: -10, karma: -3, money: -30000000, flag: 's_mxh_bocphot' },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 's_mxh_bocphot_sau', title: 'Một năm sau cơn bão', icon: '🌤️', age: [17, 71], chainOnly: true,
      req: { flag: 's_mxh_bocphot' },
      text: 'Một năm sau vụ bóc phốt, có người nhắn: “Em từng rất ghét anh/chị, nhưng xem cách anh/chị thay đổi, em xin lỗi vì những bình luận hồi đó.” Kèm theo là lời mời dẫn một chương trình về bắt nạt học đường.',
      scene: { loc: 'cafe', anim: 'phone', expr: 'surprised', npcs: [], fx: 'idea' },
      choices: [
        { label: 'Nhận lời, kể lại câu chuyện của mình',
          text: 'Bạn kể thật về những sai lầm năm xưa. Chương trình chạm đến hàng triệu người, và lần đầu tiên bạn thấy vụ phốt có ý nghĩa.',
          effects: { followers: 0.15, karma: 8, happy: 8 },
          scene: { loc: 'studio', anim: 'talk', fx: 'hearts' } },
        { label: 'Cảm ơn, nhưng muốn khép lại chuyện cũ',
          text: 'Bạn trả lời ngắn gọn, cảm ơn và chúc người ấy bình an. Có những chuyện cũ không cần mở lại nữa.',
          effects: { happy: 3 },
          scene: { anim: 'nod', fx: 'sparkle' } }
      ]
    },

    // ======================= MẠNG XÃ HỘI: DRAMA VỚI KOL KHÁC =======================
    {
      id: 's_mxh_drama_kol', title: 'KOL khác “cà khịa” bạn', icon: '⚔️', age: [16, 60], weight: 1.4,
      req: { minFollowers: 50000, notFlag: 's_mxh_drama' },
      text: 'Trong buổi livestream ba trăm nghìn người xem, một KOL nổi tiếng nhắc thẳng tên bạn: “Content kiểu đó thì tôi làm trong lúc đánh răng.” Clip bị cắt lan khắp nơi. Fan hai bên đã bắt đầu “khẩu chiến” dưới mọi bài đăng.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'angry', npcs: [{ role: 'stranger', gender: 'm', age: 29, anim: 'laugh', say: 'Tôi làm trong lúc đánh răng!' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Quay clip đáp trả cực gắt',
          text: 'Clip đáp trả của bạn đạt bốn triệu lượt xem trong một đêm. Drama nổ to, báo mạng đưa tin liên tục. Lượt theo dõi tăng vọt — nhưng các nhãn hàng bắt đầu dè chừng.',
          effects: { followers: 0.25, karma: -4, happy: 3, flag: ['s_mxh_drama', 's_mxh_drama_war'], followUp: { id: 's_mxh_drama_daichien', delay: 0 } },
          scene: { anim: 'angry', fx: 'flash' } },
        { label: 'Mời người đó làm clip collab hòa giải',
          success: { stat: 'karma', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Người kia bất ngờ nhận lời. Clip hai người cùng nấu mì tôm, tự cà khịa nhau vui vẻ, hút hàng triệu lượt xem. Cả hai cùng có lợi.',
              effects: { followers: 0.2, karma: 5, happy: 8, flag: 's_mxh_drama' },
              scene: { loc: 'studio', anim: 'laugh', fx: 'confetti', npcAnim: { stranger: 'laugh' } } },
            { text: 'Họ đăng ảnh chụp tin nhắn mời collab của bạn kèm dòng “Sợ rồi à?”. Fan của họ cười cợt bạn cả tuần.',
              effects: { followers: -0.08, happy: -6, flag: 's_mxh_drama' },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Im lặng, tiếp tục làm nội dung của mình',
          text: 'Bạn không đáp một lời, cứ đều đặn ra clip. Vài tuần sau, chính người kia dính phốt khác, còn bạn được khen “có văn hóa”.',
          effects: { followers: 0.04, karma: 3, happy: 2, flag: 's_mxh_drama' },
          scene: { anim: 'type', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_mxh_drama_daichien', title: 'Đại chiến fan', icon: '💥', age: [16, 60], chainOnly: true,
      req: { flag: 's_mxh_drama_war' },
      text: 'Drama leo thang: fan hai bên đào bới đời tư của nhau, có người còn tìm đến tận nơi bạn ở để chụp ảnh. Một nhãn hàng lớn gọi điện: “Anh/chị dừng drama ngay, nếu không chúng tôi phải chấm dứt hợp đồng.”',
      scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'crowd', anim: 'phone' }, { role: 'stranger', anim: 'point', say: 'Đây rồi, chụp đi!' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Đăng bài kêu gọi fan dừng lại, xin lỗi công khai',
          text: 'Bạn đăng bài xin fan dừng tấn công đời tư người khác, nhắn riêng xin lỗi KOL kia. Drama hạ nhiệt, nhãn hàng ở lại.',
          effects: { followers: -0.05, karma: 6, happy: 4, unflag: 's_mxh_drama_war' },
          scene: { anim: 'phone', fx: 'sparkle' } },
        { label: 'Tiếp tục “đổ dầu vào lửa” để câu view',
          outcomes: [
            { p: 0.4, text: 'Drama giúp bạn đạt kỷ lục lượt xem, nhưng mất hợp đồng quảng cáo lớn nhất và bị gắn mác “KOL độc hại”.',
              effects: { followers: 0.15, money: -80000000, karma: -8, happy: -2, unflag: 's_mxh_drama_war' },
              scene: { anim: 'laugh', fx: 'money' } },
            { p: 0.6, text: 'Một fan quá khích của bạn bị công an mời làm việc vì đăng thông tin cá nhân người khác. Báo chí gọi tên bạn là người kích động. Bạn mất cả fan lẫn hợp đồng.',
              effects: { followers: -0.4, money: -80000000, karma: -10, happy: -12, unflag: 's_mxh_drama_war' },
              scene: { anim: 'facepalm', fx: 'anger', npcs: [{ role: 'police', anim: 'talk' }] } }
          ] },
        { label: 'Báo công an về người theo dõi đến tận nhà',
          text: 'Công an phường vào cuộc, người kia bị xử phạt vì xâm phạm đời tư. Bạn tạm nghỉ mạng một thời gian cho yên.',
          effects: { followers: -0.1, happy: 2, unflag: 's_mxh_drama_war' },
          scene: { loc: 'office', anim: 'talk', fx: 'sparkle', npcs: [{ role: 'police', anim: 'nod' }] } }
      ]
    },
    {
      id: 's_mxh_hack', title: 'Bị hack tài khoản', icon: '🔐', age: [14, 70], weight: 1.1,
      req: { minFollowers: 10000, notFlag: 's_mxh_hack' },
      text: 'Bạn bấm vào một đường link “nhận bản quyền âm nhạc” gửi qua tin nhắn. Mười phút sau, tài khoản bị đổi mật khẩu, kẻ gian nhắn: “Chuyển {money:20000000} thì trả lại, không thì tôi đăng bậy và bán kênh.”',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'scared', npcs: [], fx: 'exclaim' },
      choices: [
        { label: 'Chuyển tiền cho xong',
          outcomes: [
            { p: 0.4, text: 'Chúng trả lại tài khoản thật. Bạn thở phào, nhưng mất trắng {money:20000000} và một bài học.',
              effects: { money: -20000000, happy: -3, flag: 's_mxh_hack' },
              scene: { anim: 'shrug', fx: 'money' } },
            { p: 0.6, text: 'Nhận tiền xong, chúng đòi thêm, rồi bán luôn kênh. Bạn mất cả tiền lẫn bao năm gây dựng.',
              effects: { money: -20000000, followers: -0.7, happy: -12, flag: 's_mxh_hack' },
              scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Liên hệ nền tảng và báo công an',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Sau ba ngày gửi giấy tờ chứng minh, nền tảng trả lại tài khoản. Bạn bật bảo mật hai lớp ngay lập tức.',
              effects: { followers: -0.05, smarts: 2, flag: 's_mxh_hack' },
              scene: { anim: 'cheer', fx: 'sparkle' } },
            { text: 'Thủ tục quá lâu, kẻ gian đã kịp đăng loạt bài quảng cáo cá độ dưới tên bạn. Lấy lại được kênh thì người theo dõi đã bỏ đi gần một nửa.',
              effects: { followers: -0.45, happy: -8, flag: 's_mxh_hack' },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Bỏ kênh, lập tài khoản mới từ đầu',
          text: 'Bạn lập tài khoản mới, nhờ bạn bè chia sẻ. Bắt đầu lại từ con số nhỏ, nhưng sạch sẽ.',
          effects: { followers: -0.85, happy: -6, flag: 's_mxh_hack' },
          scene: { anim: 'sad', fx: 'dust' } }
      ]
    },
    {
      id: 's_mxh_fan_cuong', title: 'Fan cuồng', icon: '👀', age: [16, 70], weight: 1.0,
      req: { minFollowers: 150000, notFlag: 's_mxh_fancuong' },
      text: 'Một người theo dõi bạn suốt nhiều năm bắt đầu xuất hiện ở quán cà phê bạn hay ngồi, gửi quà về tận nhà, nhắn tin hàng trăm lần mỗi ngày: “Sao không trả lời em?”',
      scene: { loc: 'cafe', anim: 'scared', expr: 'scared', npcs: [{ role: 'stranger', age: 24, anim: 'wave', say: 'Em đợi anh/chị cả buổi rồi!' }], fx: 'exclaim' },
      choices: [
        { label: 'Báo công an, giữ khoảng cách',
          text: 'Công an làm việc với người đó và gia đình họ. Bạn thay đổi lịch sinh hoạt, thuê thêm bảo vệ một thời gian. Tốn kém, nhưng an toàn.',
          effects: { money: -30000000, happy: -3, flag: 's_mxh_fancuong' },
          scene: { anim: 'nod', fx: 'sparkle', npcs: [{ role: 'police', anim: 'talk' }] } },
        { label: 'Gặp riêng, nói chuyện thẳng thắn',
          outcomes: [
            { p: 0.5, text: 'Bạn nhẹ nhàng giải thích ranh giới giữa người làm nội dung và người xem. Người đó khóc, xin lỗi, rồi thôi làm phiền.',
              effects: { karma: 5, happy: 3, flag: 's_mxh_fancuong' },
              scene: { anim: 'talk', fx: 'sparkle' } },
            { p: 0.5, text: 'Cuộc gặp làm người đó hiểu lầm là “được đáp lại”, mọi chuyện tệ hơn. Cuối cùng bạn vẫn phải nhờ công an can thiệp.',
              effects: { happy: -8, health: -2, flag: 's_mxh_fancuong' },
              scene: { anim: 'scared', fx: 'anger' } }
          ] }
      ]
    },

    // ======================= THỂ THAO: THI ĐẤU NƯỚC NGOÀI =======================
    {
      id: 's_global_thidau', title: 'Thi đấu ở nước ngoài', icon: '🌏', age: [17, 38], weight: 1.5,
      req: { jobId: SPORT, notFlag: 's_global_thidau' },
      text: 'Bạn được triệu tập dự một giải quốc tế ở Bangkok. Họp báo trước trận toàn tiếng Anh, trọng tài và đối thủ đều là người nước ngoài. Phóng viên giơ micro hỏi thẳng bạn: “How do you feel about tomorrow’s match?”',
      scene: { loc: 'stadium', time: 'day', anim: 'think', expr: 'surprised', npcs: [{ role: 'stranger', gender: 'f', age: 30, anim: 'talk', say: 'How do you feel?' }, { role: 'crowd', anim: 'phone' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Tự trả lời bằng tiếng Anh',
          success: { stat: 'english', base: 0.05, scale: 0.9 },
          outcomes: [
            { text: 'Bạn trả lời tự tin, còn đùa một câu khiến cả phòng họp báo bật cười. Báo nước ngoài viết về bạn, tinh thần lên cao, hôm sau bạn thi đấu cực hay.',
              effects: { happy: 10, looks: 4, money: 100000000, job: 'raise', english: 3, flag: 's_global_thidau' },
              scene: { anim: 'talk', fx: 'stars', npcAnim: { stranger: 'clap' } } },
            { text: 'Bạn nói lắp, hiểu sai câu hỏi, trả lời “Yes, I am tomorrow”. Clip lan về nước, dân mạng chế meme cả tuần. Bạn mất ngủ và thi đấu dưới sức.',
              effects: { happy: -8, looks: -2, flag: ['s_global_thidau', 's_global_thidau_meme'], followUp: { id: 's_global_hoc_ta', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] },
        { label: 'Nhờ phiên dịch của đoàn',
          text: 'Phiên dịch giúp bạn trả lời gọn gàng. Không có gì nổi bật, nhưng cũng không có gì sai. Bạn tập trung hết sức cho trận đấu.',
          effects: { happy: 3, flag: 's_global_thidau' },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Lắc đầu “No English”, bỏ về phòng',
          text: 'Báo chí nước bạn viết rằng vận động viên Việt Nam “thiếu chuyên nghiệp”. Ban huấn luyện nhắc nhở, bắt bạn đi học tiếng Anh.',
          effects: { happy: -4, karma: -2, flag: 's_global_thidau', followUp: { id: 's_global_hoc_ta', delay: 0 } },
          scene: { anim: 'shake', fx: 'anger' } }
      ]
    },
    {
      id: 's_global_hoc_ta', title: 'Lớp tiếng Anh bắt buộc', icon: '🔤', age: [17, 40], chainOnly: true,
      text: 'Sau chuyến đi vừa rồi, liên đoàn yêu cầu mọi vận động viên đội tuyển học tiếng Anh: thi đấu quốc tế, ký hợp đồng, làm việc với trọng tài, giải thích với ban chống doping — chỗ nào cũng cần.',
      scene: { loc: 'school', anim: 'study', npcs: [{ role: 'teacher', anim: 'talk', say: 'Repeat after me!' }, { role: 'coworker', anim: 'sleep' }], fx: 'idea' },
      choices: [
        { label: 'Học nghiêm túc mỗi tối',
          text: 'Mỗi tối sau giờ tập, bạn học thêm một tiếng. Sáu tháng sau bạn đã tự đọc được hợp đồng và trò chuyện với đồng nghiệp nước ngoài.',
          effects: { english: 12, smarts: 2, happy: -1 },
          scene: { anim: 'study', fx: 'levelup' } },
        { label: 'Học cho có',
          text: 'Bạn ngủ gục trong lớp cùng mấy đồng đội. Chứng chỉ thì có, còn tiếng Anh thì vẫn vậy.',
          effects: { english: 2, happy: 1 },
          scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 's_global_doping', title: 'Nghi án doping', icon: '🧪', age: [17, 38], weight: 1.1,
      req: { jobId: ['cauthu', 'vdv_vo', 'caulong'], notFlag: 's_global_doping' },
      text: 'Ở một giải đấu quốc tế, mẫu thử của bạn cho kết quả bất thường. Hóa ra viên thuốc cảm mua ở hiệu thuốc ven đường có chất bị cấm. Hội đồng chống doping gọi bạn lên giải trình — tất cả bằng tiếng Anh.',
      scene: { loc: 'office', anim: 'scared', expr: 'scared', npcs: [{ role: 'doctor', anim: 'talk', say: 'Please explain the result.' }, { role: 'boss', anim: 'facepalm' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Tự giải trình, nộp đơn thuốc và hóa đơn',
          success: { stat: 'english', base: 0.1, scale: 0.8 },
          outcomes: [
            { text: 'Bạn trình bày rõ ràng, có hóa đơn hiệu thuốc và lời xác nhận của bác sĩ đội. Hội đồng kết luận vô ý, chỉ cảnh cáo. Bạn thở phào như vừa thắng chung kết.',
              effects: { happy: 6, english: 3, flag: 's_global_doping' },
              scene: { anim: 'nod', fx: 'sparkle' } },
            { text: 'Bạn lúng túng, giải thích không rõ. Hội đồng treo giò bạn một năm. Mất giải, mất thưởng, mất cả suất đội tuyển.',
              effects: { happy: -14, money: -50000000, looks: -3, flag: 's_global_doping' },
              scene: { anim: 'cry', fx: 'heartbreak' } }
          ] },
        { label: 'Thuê luật sư thể thao quốc tế',
          text: 'Luật sư tính phí {money:150000000}, nhưng làm việc rất chuyên nghiệp: hồ sơ được chấp nhận, bạn chỉ bị cảnh cáo.',
          effects: { money: -150000000, happy: 3, flag: 's_global_doping' },
          scene: { anim: 'nod', fx: 'money' } }
      ]
    },
    {
      id: 's_global_khan_gia', title: 'Bị khán giả chủ nhà la ó', icon: '📣', age: [17, 38], weight: 1.0,
      req: { jobId: SPORT, notFlag: 's_global_khangia' },
      text: 'Trận đấu trên sân khách, mỗi lần bạn chạm bóng là cả khán đài la ó, có người còn ném chai nước xuống sân. Sau trận, một video bạn chỉ tay về phía khán đài bị cắt đăng lên mạng nước bạn, kèm hàng nghìn bình luận chửi bới.',
      scene: { loc: 'stadium', time: 'night', anim: 'angry', npcs: [{ role: 'crowd', anim: 'angry' }, { role: 'police', anim: 'idle' }], fx: 'anger' },
      choices: [
        { label: 'Đăng lời xin lỗi bằng tiếng Anh, giải thích',
          success: { stat: 'english', base: 0.15, scale: 0.7 },
          outcomes: [
            { text: 'Lời xin lỗi chân thành bằng tiếng Anh của bạn được báo nước bạn đăng lại. Khán giả chủ nhà quay sang khen “cầu thủ có văn hóa”.',
              effects: { karma: 6, happy: 5, english: 2, flag: 's_global_khangia' },
              scene: { anim: 'bow', fx: 'sparkle' } },
            { text: 'Câu xin lỗi dịch máy lủng củng bị hiểu thành mỉa mai, drama càng lớn. Liên đoàn phạt bạn vì “gây ảnh hưởng hình ảnh”.',
              effects: { karma: -2, happy: -8, money: -20000000, flag: 's_global_khangia' },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Mặc kệ, tập trung trận sau',
          text: 'Bạn tắt mạng, tập trung chuyên môn. Drama trôi qua sau vài ngày, nhưng bạn bị cấm thi đấu một trận vì hành vi trên sân.',
          effects: { happy: -3, flag: 's_global_khangia' },
          scene: { anim: 'sit', fx: 'sweat' } }
      ]
    },

    // ======================= DU HỌC & LÀM VIỆC Ở NƯỚC NGOÀI =======================
    {
      id: 's_global_hocbong', title: 'Học bổng du học', icon: '🎓', age: [17, 30], weight: 1.0,
      req: { minEnglish: 55, minStat: { smarts: 70 }, notFlag: 's_global_hocbong' },
      text: 'Một trường đại học ở Úc mở học bổng 50% cho sinh viên Việt Nam. Yêu cầu: IELTS 6.5 và một bài luận kể về bản thân. Hạn nộp còn đúng ba tuần.',
      scene: { loc: 'cafe', anim: 'type', expr: 'surprised', npcs: [{ role: 'friend', anim: 'talk', say: 'Nộp đi, mày làm được mà!' }], fx: 'idea' },
      choices: [
        { label: 'Viết bài luận thật hay, nộp hồ sơ',
          success: { stat: 'english', base: 0.05, scale: 0.75 },
          outcomes: [
            { text: 'Ba tuần thức trắng, bài luận viết đi viết lại mười lần. Email trúng tuyển về giữa đêm, bạn hét lên làm cả nhà thức giấc. Bạn sẽ học thạc sĩ một năm ở Melbourne.',
              effects: { english: 10, smarts: 5, happy: 12, money: -200000000, flag: ['s_global_hocbong', 's_global_duhoc_ok'], achievement: 'abroad' },
              scene: { loc: 'airport', anim: 'cheer', fx: 'confetti' } },
            { text: 'Hồ sơ bị loại vì bài luận “chưa đủ thuyết phục”. Bạn buồn mất mấy ngày, nhưng biết mình cần cải thiện gì.',
              effects: { happy: -6, english: 3, flag: 's_global_hocbong' },
              scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Thôi, ở nhà cho gần bố mẹ',
          text: 'Bạn đóng tab đăng ký. Có lẽ cơ hội khác sẽ đến, hoặc không. Ở nhà, ít nhất bữa tối vẫn có canh chua mẹ nấu.',
          effects: { happy: 1, flag: 's_global_hocbong' },
          scene: { loc: 'home', anim: 'eat', fx: 'steam' } }
      ]
    },
    {
      id: 's_global_lac_san_bay', title: 'Lạc ở sân bay nước ngoài', icon: '🛫', age: [16, 85], weight: 0.9,
      req: { cond: (s) => (s.counters.abroad || 0) > 0 || !!s.abroad, notFlag: 's_global_lac' },
      text: 'Chuyến bay nối chuyến ở Frankfurt bị đổi cổng vào phút chót. Loa thông báo liên tục bằng tiếng Đức và tiếng Anh, còn bạn đứng giữa dòng người hối hả, tay cầm tấm vé, không biết phải đi đâu.',
      scene: { loc: 'airport', anim: 'scared', expr: 'scared', npcs: [{ role: 'stranger', gender: 'f', age: 40, anim: 'walk' }, { role: 'crowd', anim: 'walk' }], fx: 'question' },
      choices: [
        { label: 'Hỏi nhân viên sân bay bằng tiếng Anh',
          success: { stat: 'english', base: 0.1, scale: 0.85 },
          outcomes: [
            { text: 'Chị nhân viên chỉ đường tận tình, bạn chạy kịp lên máy bay đúng lúc cửa sắp đóng.',
              effects: { happy: 4, english: 2, flag: 's_global_lac' },
              scene: { anim: 'run', fx: 'sparkle' } },
            { text: 'Bạn nói mà người ta không hiểu, người ta nói bạn cũng không hiểu. Lỡ chuyến, phải mua vé mới {money:18000000} và ngủ một đêm ở ghế chờ.',
              effects: { money: -18000000, happy: -6, flag: 's_global_lac' },
              scene: { anim: 'sleep', fx: 'zzz' } }
          ] },
        { label: 'Đi theo một nhóm người Việt gặp được',
          text: 'May có đoàn du lịch người Việt đi ngang, cô hướng dẫn viên dẫn bạn tới đúng cổng. Bạn tự hứa về nhà sẽ học tiếng Anh cho đàng hoàng.',
          effects: { happy: 2, flag: 's_global_lac' },
          scene: { anim: 'walk', fx: 'hearts' } }
      ]
    },
    {
      id: 's_global_nho_nha', title: 'Tết xa nhà', icon: '🧧', age: [18, 70], weight: 1.3, once: false, cooldown: 3,
      req: { abroad: true },
      text: 'Đêm giao thừa ở nước ngoài trùng ngày làm việc bình thường. Bạn tan ca lúc chín giờ tối, mở video call: cả nhà đang quây quần bên mâm cỗ, mẹ cố cười mà mắt đỏ hoe.',
      scene: { loc: 'bedroom', time: 'night', decor: 'tet', anim: 'phone', expr: 'sad', npcs: [], fx: 'tears' },
      choices: [
        { label: 'Mua vé về ăn Tết dù đắt cắt cổ',
          text: 'Vé mùa Tết hết {money:45000000}, cộng thêm mấy ngày nghỉ không lương. Nhưng khoảnh khắc mẹ ôm chầm lấy bạn ở cổng, mọi thứ đều xứng đáng.',
          effects: { money: -45000000, happy: 12, rel: { mother: 10, father: 8 } },
          scene: { loc: 'home', time: 'day', anim: 'hug', fx: 'petals' } },
        { label: 'Rủ hội người Việt nấu mâm cỗ chung',
          text: 'Cả hội người Việt gom nguyên liệu từ chợ châu Á, gói bánh chưng bằng lá chuối đông lạnh. Méo xệch mà ấm áp lạ.',
          effects: { happy: 6, money: -2000000 },
          scene: { anim: 'cook', fx: 'steam' } },
        { label: 'Gửi tiền về biếu bố mẹ',
          text: 'Bạn chuyển {money:30000000} về cho bố mẹ sắm Tết. Mẹ nhắn: “Tiền thì mẹ cất, chỉ mong con về.”',
          effects: { money: -30000000, karma: 4, happy: -2, rel: { mother: 6, father: 6 } },
          scene: { anim: 'phone', fx: 'hearts' } }
      ]
    },
    {
      id: 's_global_ky_thi', title: 'Bị đối xử khác biệt nơi công sở', icon: '🌐', age: [20, 65], weight: 1.0,
      req: { abroad: true, job: true, notFlag: 's_global_kythi' },
      text: 'Ở công ty mới bên nước ngoài, bạn làm nhiều nhất nhóm nhưng toàn bị giao việc lặt vặt. Một đồng nghiệp còn nhại giọng tiếng Anh của bạn trong cuộc họp, vài người bật cười.',
      scene: { loc: 'office', anim: 'sad', expr: 'angry', npcs: [{ role: 'coworker', gender: 'm', age: 35, anim: 'laugh', say: 'Say that again?' }, { role: 'boss', anim: 'idle' }], fx: 'anger' },
      choices: [
        { label: 'Phản ánh bình tĩnh với quản lý, kèm số liệu công việc',
          success: { stat: 'english', base: 0.1, scale: 0.8 },
          outcomes: [
            { text: 'Bạn trình bày mạch lạc, có số liệu rõ ràng. Quản lý xin lỗi, đồng nghiệp kia bị nhắc nhở, còn bạn được giao dự án chính.',
              effects: { happy: 8, karma: 3, job: 'promote', flag: 's_global_kythi' },
              scene: { anim: 'talk', fx: 'levelup', npcAnim: { boss: 'nod' } } },
            { text: 'Quản lý gật gù “sẽ xem xét”, nhưng không có gì thay đổi. Bạn bắt đầu nghĩ đến chuyện về nước.',
              effects: { happy: -6, flag: 's_global_kythi' },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Nhẫn nhịn, chứng minh bằng kết quả',
          text: 'Bạn lặng lẽ làm tốt hơn tất cả. Hai năm sau, chính người từng nhại giọng bạn phải xin vào nhóm của bạn.',
          effects: { happy: -2, smarts: 3, flag: 's_global_kythi' },
          scene: { anim: 'type', fx: 'idea' } },
        { label: 'Nghỉ việc, về nước',
          text: 'Bạn nộp đơn nghỉ, xách va li về nước. Lương thấp hơn, nhưng được là chính mình.',
          effects: { happy: 4, abroad: 'home', flag: 's_global_kythi' },
          scene: { loc: 'airport', anim: 'walk', fx: 'dust' } }
      ]
    },
    {
      id: 's_global_dinh_cu', title: 'Ở lại hay về?', icon: '🛂', age: [26, 60], weight: 1.0,
      req: { abroad: true, notFlag: 's_global_dinhcu' },
      text: 'Sau mấy năm làm việc ở nước ngoài, công ty đề nghị bảo lãnh thường trú lâu dài. Cùng lúc, mẹ gọi điện: “Bố con dạo này yếu lắm, con tính bao giờ về?”',
      scene: { loc: 'airport', anim: 'think', npcs: [{ role: 'boss', anim: 'talk', say: 'We want you to stay.' }], fx: 'question' },
      choices: [
        { label: 'Nhận thường trú, ở lại lập nghiệp',
          text: 'Bạn nhận thẻ thường trú. Cuộc sống ổn định, lương cao, nhưng mỗi lần nghe tin nhà là một lần thấy mình ở xa quá.',
          effects: { happy: 2, money: 100000000, flag: 's_global_dinhcu', rel: { mother: -5, father: -5 } },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Về nước chăm bố mẹ',
          text: 'Bạn từ chối lời đề nghị, đóng gói mười năm xứ người vào hai va li. Về đến nhà, bố nắm tay bạn rất lâu.',
          effects: { happy: 8, karma: 5, abroad: 'home', rel: { mother: 10, father: 12 }, flag: 's_global_dinhcu' },
          scene: { loc: 'home', anim: 'hug', fx: 'hearts' } }
      ]
    },

    // ======================= NGOẠI TÌNH: BẠN BỊ CÁM DỖ =======================
    {
      id: 's_affair_camdo', title: 'Tin nhắn lúc nửa đêm', icon: '📱', age: [25, 65], weight: 1.2,
      req: { married: true, has: ['spouse'], notFlag: 's_affair' },
      text: 'Hôn nhân dạo này nhạt như nước ốc: về nhà mỗi người một cái điện thoại. Đúng lúc đó, {coworker} — người đồng nghiệp hay ở lại tăng ca cùng bạn — nhắn lúc nửa đêm: “Ngủ chưa? Tự nhiên muốn nói chuyện với anh/chị quá.”',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'surprised', npcs: [{ role: 'spouse', anim: 'sleep' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Không trả lời, giữ khoảng cách',
          text: 'Bạn tắt điện thoại, quay sang nhìn {spouse} đang ngủ. Hôm sau ở công ty bạn giữ khoảng cách lịch sự. Có những ranh giới không nên chạm vào.',
          effects: { karma: 5, happy: -1, rel: { spouse: 3 }, flag: 's_affair' },
          scene: { anim: 'sleep', fx: 'zzz' } },
        { label: 'Rủ {spouse} đi hẹn hò để hâm nóng',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn đặt bàn ở quán cũ hai người hay ngồi hồi mới yêu. {spouse} bất ngờ, rồi cười như ngày xưa. Hai người nói chuyện đến khuya.',
              effects: { happy: 8, karma: 4, money: -2000000, rel: { spouse: 12 }, flag: 's_affair' },
              scene: { loc: 'cafe', anim: 'love', fx: 'hearts', npcAnim: { spouse: 'love' } } },
            { text: '{spouse} kêu mệt, xin ở nhà. Bạn ngồi một mình trong quán, tin nhắn của đồng nghiệp vẫn sáng trên màn hình.',
              effects: { happy: -4, rel: { spouse: -2 }, flag: 's_affair' },
              scene: { loc: 'cafe', anim: 'sad', fx: 'question' } }
          ] },
        { label: 'Nhắn lại, “chỉ là nói chuyện thôi”',
          text: 'Tin nhắn qua lại đến hai giờ sáng. Rồi những bữa trưa riêng, những lần “tăng ca” không có thật. Bạn biết mình đang đi quá xa, nhưng vẫn không dừng lại.',
          effects: { happy: 6, karma: -10, rel: { spouse: -8 }, flag: ['s_affair', 's_affair_on'], followUp: { id: 's_affair_lo', delay: 1 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { spouse: 'sleep' } } }
      ]
    },
    {
      id: 's_affair_lo', title: 'Bị phát hiện', icon: '💔', age: [25, 70], chainOnly: true,
      req: { married: true, has: ['spouse'], flag: 's_affair_on' },
      text: 'Tối nay {spouse} đặt điện thoại của bạn lên bàn, màn hình mở sẵn đoạn tin nhắn với người kia. Giọng run run: “Bao lâu rồi?” Trong phòng bên, con vẫn đang học bài.',
      scene: { loc: 'home', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'spouse', anim: 'cry', say: 'Bao lâu rồi?' }], fx: 'heartbreak', shot: 'dramatic' },
      choices: [
        { label: 'Thú nhận, xin cơ hội làm lại',
          success: { stat: 'karma', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn cắt đứt hoàn toàn với người kia, đồng ý đi tư vấn hôn nhân. Mất gần một năm, niềm tin mới lành lại từng chút. Vết sẹo vẫn còn, nhưng gia đình vẫn còn.',
              effects: { happy: -6, karma: 4, money: -15000000, rel: { spouse: -10, child: -5 }, unflag: 's_affair_on' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { spouse: 'cry' } } },
            { text: '{spouse} im lặng rất lâu rồi nói: “Mình ly hôn đi.” Bạn mất gia đình, mất nửa tài sản, và mất cả sự tôn trọng của các con.',
              effects: { happy: -18, divorce: true, rel: { child: -20 }, unflag: 's_affair_on' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { spouse: 'walk' } } }
          ] },
        { label: 'Chối bay chối biến',
          outcomes: [
            { p: 0.25, text: 'Bạn bảo bị hack, tin nhắn là đùa. {spouse} không tin hẳn, nhưng mệt mỏi đến mức không muốn cãi nữa. Hai người sống cạnh nhau như hai người lạ.',
              effects: { happy: -8, karma: -6, rel: { spouse: -25 }, unflag: 's_affair_on' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { spouse: 'sad' } } },
            { p: 0.75, text: '{spouse} lấy ra thêm ảnh chụp camera hành trình, lịch sử đặt phòng. Lời chối càng làm mọi chuyện tệ hơn. Đơn ly hôn được nộp ngay tuần sau, kèm câu chuyện lan khắp họ hàng.',
              effects: { happy: -20, karma: -8, divorce: true, rel: { child: -25, mother: -10 }, unflag: 's_affair_on' },
              scene: { anim: 'facepalm', fx: 'heartbreak', npcAnim: { spouse: 'angry' } } }
          ] },
        { label: 'Chọn người kia, ra đi',
          text: 'Bạn xếp đồ, dọn sang ở với người kia. Ly hôn, chia tài sản, con cái không muốn gặp. Mấy năm sau ngồi lại, bạn không chắc mình đã đổi được điều gì.',
          effects: { happy: -10, karma: -12, divorce: true, rel: { child: -30 }, addPerson: { role: 'partner', fromScene: 'coworker' }, unflag: 's_affair_on' },
          scene: { loc: 'street', anim: 'walk', fx: 'dust', npcAnim: { spouse: 'cry' } } }
      ]
    },

    // ======================= NGOẠI TÌNH: NGHI NGỜ VỢ/CHỒNG =======================
    {
      id: 's_affair_nghingo', title: 'Những dấu hiệu lạ', icon: '🕵️', age: [25, 70], weight: 1.1,
      req: { married: true, has: ['spouse'], notFlag: 's_affair_ng' },
      text: 'Dạo này {spouse} hay về muộn, điện thoại luôn úp mặt xuống bàn, đặt mật khẩu mới, đi tắm cũng mang theo. Có lần bạn thấy tin nhắn hiện lên: “Mai gặp chỗ cũ nhé ❤️”.',
      scene: { loc: 'home', time: 'night', anim: 'think', expr: 'sad', npcs: [{ role: 'spouse', anim: 'phone' }], fx: 'question' },
      choices: [
        { label: 'Hỏi thẳng một cách bình tĩnh',
          outcomes: [
            { p: 0.5, text: 'Hóa ra {spouse} đang bí mật chuẩn bị quà kỷ niệm ngày cưới cùng nhóm bạn, “chỗ cũ” là tiệm bánh. Bạn xấu hổ muốn độn thổ, còn {spouse} cười ngặt nghẽo.',
              effects: { happy: 6, rel: { spouse: 6 }, flag: 's_affair_ng' },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { spouse: 'laugh' } } },
            { p: 0.5, text: '{spouse} chối, nhưng mắt không dám nhìn bạn. Bạn biết có chuyện, chỉ là chưa đủ bằng chứng.',
              effects: { happy: -6, rel: { spouse: -6 }, flag: ['s_affair_ng', 's_affair_ng_that'], followUp: { id: 's_affair_ng_lo', delay: 1 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { spouse: 'shrug' } } }
          ] },
        { label: 'Thuê thám tử tư theo dõi',
          outcomes: [
            { p: 0.55, text: 'Sau hai tuần, thám tử gửi ảnh: {spouse} cà phê với một người lạ, nắm tay nhau. Bạn ngồi trong xe rất lâu, không khóc nổi.',
              effects: { money: -25000000, happy: -10, flag: ['s_affair_ng', 's_affair_ng_that'], followUp: { id: 's_affair_ng_lo', delay: 0 } },
              scene: { loc: 'street', anim: 'phone', fx: 'heartbreak' } },
            { p: 0.45, text: 'Thám tử báo cáo: {spouse} chỉ đi học tiếng Anh buổi tối để chuẩn bị đổi việc, giấu vì sợ bạn lo. Bạn mất {money:25000000} và một chút lòng tự trọng.',
              effects: { money: -25000000, happy: 2, rel: { spouse: -3 }, flag: 's_affair_ng' },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Cho qua, chắc mình nghĩ nhiều',
          text: 'Bạn tự nhủ phải tin người mình chọn. Đêm đó bạn trằn trọc mãi mới ngủ được.',
          effects: { happy: -2, flag: 's_affair_ng' },
          scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 's_affair_ng_lo', title: 'Sự thật', icon: '💔', age: [25, 70], chainOnly: true,
      req: { married: true, has: ['spouse'], flag: 's_affair_ng_that' },
      text: '{spouse} cuối cùng cũng thừa nhận: đã qua lại với người khác gần một năm. Câu xin lỗi rơi vào khoảng lặng giữa hai người. Bạn sẽ làm gì?',
      scene: { loc: 'home', time: 'night', anim: 'cry', expr: 'sad', npcs: [{ role: 'spouse', anim: 'cry', say: 'Em/anh xin lỗi…' }], fx: 'heartbreak', shot: 'dramatic' },
      choices: [
        { label: 'Tha thứ, cùng đi tư vấn hôn nhân',
          success: { stat: 'happy', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Những buổi tư vấn khó khăn, có lúc tưởng bỏ cuộc. Nhưng một năm sau, hai người học được cách nói chuyện với nhau thật lòng như chưa từng có.',
              effects: { happy: 2, karma: 6, money: -15000000, rel: { spouse: 8 }, unflag: 's_affair_ng_that' },
              scene: { anim: 'hug', fx: 'tears', npcAnim: { spouse: 'hug' } } },
            { text: 'Bạn cố tha thứ, nhưng mỗi lần {spouse} về muộn là tim lại thắt lại. Cuối cùng hai người đồng ý chia tay trong im lặng.',
              effects: { happy: -12, divorce: true, unflag: 's_affair_ng_that' },
              scene: { anim: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Ly hôn, giành quyền nuôi con',
          text: 'Bạn nộp đơn ly hôn. Tòa xử bạn được nuôi con, tài sản chia đôi. Những năm sau vất vả, nhưng bạn ngẩng cao đầu.',
          effects: { happy: -10, karma: 2, divorce: true, rel: { child: 8 }, unflag: 's_affair_ng_that' },
          scene: { loc: 'office', anim: 'nod', fx: 'tears' } },
        { label: 'Đăng lên mạng “bóc phốt” người thứ ba',
          outcomes: [
            { p: 0.4, text: 'Bài viết lan khắp các hội nhóm, người thứ ba bị chỉ trích dữ dội. Bạn thấy hả giận trong vài ngày, rồi thấy trống rỗng.',
              effects: { happy: -4, karma: -5, rel: { spouse: -20 }, unflag: 's_affair_ng_that' },
              scene: { anim: 'phone', fx: 'anger' } },
            { p: 0.6, text: 'Bạn bị chính cộng đồng mạng quay ra chỉ trích “vạch áo cho người xem lưng”, người kia còn dọa kiện vì bôi nhọ. Con cái đọc được hết.',
              effects: { happy: -12, karma: -6, rel: { spouse: -25, child: -10 }, unflag: 's_affair_ng_that' },
              scene: { anim: 'facepalm', fx: 'flash' } }
          ] }
      ]
    },

    // ======================= NỢ NẦN: XÃ HỘI ĐEN ĐÒI NỢ =======================
    {
      id: 's_xhd_doino', title: 'Xã hội đen gõ cửa', icon: '🔪', age: [18, 75], weight: 3,
      req: { maxMoney: -80000000, notFlag: 's_xhd_doi' },
      text: 'Nợ chồng nợ, bạn vay chỗ này đắp chỗ kia. Tối nay ba gã xăm trổ đứng chờ trước cổng, cổng nhà bị tạt sơn đỏ hai chữ “TRẢ NỢ”. Điện thoại người thân, đồng nghiệp đều nhận được tin nhắn bêu tên bạn kèm ảnh chân dung.',
      scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Hạn cuối tuần này. Không có thì liệu hồn!' }, { role: 'thug', anim: 'idle' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Quỳ xin bố mẹ, người thân trả giúp', req: { has: ['mother'] },
          outcomes: [
            { p: 0.6, text: 'Mẹ bán sợi dây chuyền cưới, bố cầm sổ đỏ vay ngân hàng. Món nợ được trả, nhưng tóc mẹ bạc thêm hẳn sau tháng ấy.',
              effects: { money: 80000000, happy: -6, karma: -2, rel: { mother: -12, father: -12 }, flag: 's_xhd_doi' },
              scene: { loc: 'home', anim: 'cry', fx: 'tears', npcs: [{ role: 'mother', anim: 'cry' }] } },
            { p: 0.4, text: 'Bố đập bàn: “Tao không có đứa con như mày!” Bạn ra về tay trắng, và bọn chúng vẫn đứng chờ ở đầu ngõ.',
              effects: { happy: -10, rel: { father: -20 }, flag: 's_xhd_doi', followUp: { id: 's_xhd_danh', delay: 1 } },
              scene: { loc: 'home', anim: 'sad', fx: 'anger', npcs: [{ role: 'father', anim: 'angry' }] } }
          ] },
        { label: 'Mang hết tin nhắn, ghi âm đi trình báo công an',
          outcomes: [
            { p: 0.6, text: 'Công an vào cuộc, xác định là cho vay nặng lãi trái phép (lãi trên 100%/năm). Bạn chỉ phải trả tiền gốc, cả đường dây bị triệt phá.',
              effects: { money: 50000000, happy: 6, karma: 3, flag: 's_xhd_doi' },
              scene: { loc: 'office', anim: 'nod', fx: 'sparkle', npcs: [{ role: 'police', anim: 'talk', say: 'Chúng tôi sẽ xử lý.' }] } },
            { p: 0.4, text: 'Hồ sơ còn chờ xác minh thì bọn chúng biết bạn đi báo. Một tối đi làm về, bạn bị chặn đường đánh hội đồng.',
              effects: { health: -18, happy: -12, flag: 's_xhd_doi', illness: 'chanthuong' },
              scene: { anim: 'cry', fx: 'flash', npcs: [{ role: 'thug', anim: 'angry' }] } }
          ] },
        { label: 'Bỏ trốn vào Nam / ra Bắc',
          text: 'Bạn khóa Facebook, vứt sim, bắt chuyến xe đêm đi thật xa. Mỗi lần có người lạ nhìn mình lâu một chút, tim bạn lại thắt lại.',
          effects: { happy: -8, job: 'quit', flag: ['s_xhd_doi', 's_xhd_tron'], followUp: { id: 's_xhd_timra', delay: 2 } },
          scene: { loc: 'street', time: 'night', anim: 'run', fx: 'sweat' } },
        { label: 'Vay app khác để đắp vào',
          text: 'Ứng dụng vay mới duyệt trong 5 phút. Bạn trả được kỳ này, và tự tay đào cái hố sâu hơn.',
          effects: { money: 60000000, happy: 2, flag: 's_xhd_doi', followUp: { id: 's_xhd_lan', delay: 1 } },
          scene: { anim: 'phone', fx: 'money' } }
      ]
    },
    {
      id: 's_xhd_danh', title: 'Trận đòn đầu ngõ', icon: '🩸', age: [18, 80], chainOnly: true,
      req: { flag: 's_xhd_doi' },
      text: 'Hạn trả qua ba ngày. Đêm ấy, bạn vừa dắt xe vào ngõ thì bị trùm áo lên đầu. Tiếng gậy, tiếng chửi, rồi tất cả tối sầm.',
      scene: { loc: 'street', time: 'night', anim: 'fall', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry' }, { role: 'thug', anim: 'angry' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Vùng dậy đánh trả',
          success: { stat: 'health', base: 0.1, scale: 0.5 },
          outcomes: [
            { text: 'Bạn giằng được áo trùm đầu, tung một cú đấm trúng mặt gã cầm gậy. Bọn chúng không ngờ con nợ dám chống trả, chửi bới vài câu rồi bỏ chạy. Hôm sau bạn mang vết bầm đi trình báo công an.', effects: { health: -6, happy: 4, karma: 2 }, scene: { anim: 'angry', fx: 'flash' } },
            { text: 'Một chọi ba, bạn không đỡ nổi. Bạn nằm viện ba tuần, gãy hai xương sườn, và bọn chúng còn hăm dọa nặng hơn.', effects: { health: -28, happy: -15, moneyPct: -0.3, illness: 'chanthuong' }, scene: { loc: 'hospital', anim: 'sleep', fx: 'tears' } }
          ] },
        { label: 'Cố chịu, bò về nhà',
          outcomes: [
            { p: 0.9, text: 'Bạn nằm viện ba tuần, gãy hai xương sườn. Chúng để lại lời nhắn: “Lần sau là cái chân.” Bạn bán hết những gì có thể bán để trả nợ.',
              effects: { health: -25, happy: -15, moneyPct: -0.3, illness: 'chanthuong' },
              scene: { loc: 'hospital', anim: 'sleep', fx: 'tears' } },
            { p: 0.1, text: 'Người đi đường phát hiện bạn nằm bất động trong ngõ. Xe cấp cứu đến quá muộn.',
              effects: { die: 'Bị xã hội đen đòi nợ đánh trọng thương' },
              scene: { anim: 'fall', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 's_xhd_timra', title: 'Chúng tìm ra bạn', icon: '👁️', age: [18, 80], chainOnly: true,
      req: { flag: 's_xhd_tron' },
      text: 'Hai năm trốn chui trốn lủi, bạn tưởng đã yên. Sáng nay, gã đòi nợ ngày xưa ngồi ngay quán cà phê đối diện chỗ làm, giơ tay vẫy bạn, cười: “Lãi mẹ đẻ lãi con rồi đấy.”',
      scene: { loc: 'cafe', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'wave', say: 'Lâu quá không gặp!' }], fx: 'exclaim' },
      choices: [
        { label: 'Trả góp, chấp nhận làm quần quật',
          text: 'Bạn trả góp từng tháng, mấy năm liền không dám mua cái áo mới. Món nợ gốc 80 triệu cuối cùng thành gần 300 triệu.',
          effects: { money: -200000000, happy: -12, health: -5, unflag: 's_xhd_tron' },
          scene: { anim: 'sad', fx: 'money' } },
        { label: 'Lần này đi báo công an',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Lần này bạn chuẩn bị kỹ: ghi âm lời đe dọa, ảnh chụp, nhân chứng. Kẻ đòi nợ bị bắt quả tang, bạn chỉ phải trả gốc.',
              effects: { money: -40000000, happy: 8, unflag: 's_xhd_tron' },
              scene: { loc: 'office', anim: 'cheer', fx: 'sparkle', npcs: [{ role: 'police', anim: 'nod' }] } },
            { text: 'Chưa kịp đi, bạn đã bị đánh ngay trong bãi gửi xe.',
              effects: { health: -20, happy: -10, money: -100000000, illness: 'chanthuong', unflag: 's_xhd_tron' },
              scene: { anim: 'fall', fx: 'flash', npcAnim: { thug: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_xhd_lan', title: 'Vòng xoáy tín dụng đen', icon: '🌀', age: [18, 80], chainOnly: true,
      req: { flag: 's_xhd_doi' },
      text: 'Một app thành năm app. Mỗi sáng thức dậy là hàng chục cuộc gọi đòi nợ. Một gã “đại ca” hẹn gặp: “Không trả được thì làm cho anh vài chuyến hàng, xóa nợ.”',
      scene: { loc: 'street', time: 'night', anim: 'think', expr: 'scared', npcs: [{ role: 'thug', anim: 'talk', say: 'Chở vài chuyến là xong nợ.' }], fx: 'question' },
      choices: [
        { label: 'Từ chối, bán hết tài sản trả nợ',
          text: 'Bạn bán xe, bán điện thoại, dọn về phòng trọ 10 mét vuông. Nợ trả xong, người trắng tay, nhưng ngủ được.',
          effects: { moneyPct: -0.6, money: -60000000, happy: -6, karma: 4, unflag: 's_xhd_doi' },
          scene: { anim: 'sad', fx: 'dust' } },
        { label: 'Nhận “chạy hàng” cho chúng',
          outcomes: [
            { p: 0.45, text: 'Vài chuyến trót lọt, nợ được xóa. Nhưng bọn chúng có ảnh bạn cầm hàng, và bạn biết mình đã thành người của chúng.',
              effects: { money: 100000000, karma: -20, happy: -8 },
              scene: { anim: 'walk', fx: 'sweat' } },
            { p: 0.55, text: 'Chuyến thứ hai, xe bị chặn ở chốt kiểm tra. Bạn bị bắt quả tang vận chuyển hàng cấm, lãnh án tù nhiều năm.',
              effects: { karma: -20, happy: -25, health: -10, job: 'fire', flag: 'record', unflag: 's_xhd_doi' },
              scene: { anim: 'cry', fx: 'flash', npcs: [{ role: 'police', anim: 'point', say: 'Đứng im!' }] } }
          ] }
      ]
    },

    // ======================= NỔI TIẾNG: QUẢNG CÁO BẨN =======================
    {
      id: 's_kol_nhacai', title: 'Lời mời từ nhà cái', icon: '🎰', age: [16, 70], weight: 2.2,
      req: { minFollowers: 200000, notFlag: 's_kol_nhacai' },
      text: 'Bạn nổi tiếng rồi, và những lời mời “bẩn” bắt đầu tìm đến. Một người tự xưng “bên đối tác giải trí” nhắn: {money:1500000000} cho một năm, chỉ cần đăng vài story “game giải trí đổi thưởng” kèm link, có kịch bản soạn sẵn. Quản lý của bạn khuyên: “Ai nổi cũng nhận, không nhận thì người khác nhận.”',
      scene: { loc: 'studio', time: 'night', anim: 'phone', expr: 'surprised', npcs: [{ role: 'stranger', gender: 'm', anim: 'phone', say: 'Một tỷ rưỡi, đăng vài story thôi.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Từ chối thẳng, đăng bài cảnh báo fan',
          outcomes: [
            { p: 0.7, text: 'Bạn đăng bài cảnh báo người hâm mộ về các trang cá cược trá hình. Bài viết được báo chí đưa tin, fan càng quý bạn.',
              effects: { karma: 8, happy: 3, followers: 0.08, flag: 's_kol_nhacai' },
              scene: { anim: 'point', fx: 'sparkle' } },
            { p: 0.3, text: 'Nhà cái trả đũa: hàng trăm tài khoản ảo tràn vào bình luận bịa chuyện, tung tin đồn bạn “phông bạt, lừa fan”. Mất cả tháng mới yên.',
              effects: { karma: 6, happy: -6, followers: -0.06, flag: 's_kol_nhacai' },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Nhận tiền, đăng link “game giải trí”',
          text: 'Tiền về tài khoản nhanh hơn cả cát-xê. Bạn cố không đọc tin nhắn của một cậu sinh viên: “Em nghe anh/chị giới thiệu, giờ thua hết tiền học rồi.”',
          effects: { money: 1500000000, karma: -15, followers: 0.05, flag: ['s_kol_nhacai', 's_kol_bancuoc'], followUp: { id: 's_kol_trieutap', delay: 2 } },
          scene: { anim: 'phone', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Giả vờ thương lượng, thu bằng chứng nộp công an',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn giao toàn bộ đoạn chat cho cơ quan chức năng. Đường dây bị triệt phá, bạn được Bộ Công an gửi thư cảm ơn, báo chí ca ngợi hết lời.',
              effects: { karma: 12, happy: 8, followers: 0.15, flag: 's_kol_nhacai' },
              scene: { loc: 'office', anim: 'cheer', fx: 'confetti', npcs: [{ role: 'police', anim: 'nod' }] } },
            { text: 'Chúng phát hiện ra, gửi ảnh nhà bạn kèm lời đe dọa. Bạn phải thuê vệ sĩ mấy tháng liền.',
              effects: { money: -80000000, happy: -10, flag: 's_kol_nhacai' },
              scene: { anim: 'scared', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_kol_trieutap', title: 'Danh sách KOL quảng cáo cờ bạc', icon: '🚔', age: [16, 75], chainOnly: true,
      req: { flag: 's_kol_bancuoc' },
      text: 'Công an triệt phá đường dây cá cược hàng nghìn tỷ, công bố danh sách người nổi tiếng nhận tiền quảng cáo. Tên bạn nằm ở dòng thứ ba. Báo chí đăng lại từng story cũ, các nhãn hàng lần lượt gửi thư hủy hợp đồng.',
      scene: { loc: 'office', anim: 'sit', expr: 'scared', npcs: [{ role: 'police', anim: 'talk', say: 'Bạn nhận bao nhiêu tiền?' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Thành khẩn, nộp lại toàn bộ tiền, xin lỗi công khai',
          text: 'Bạn nộp lại toàn bộ số tiền, đăng video cúi đầu xin lỗi. Bạn chỉ bị phạt hành chính, nhưng sự nghiệp coi như đóng băng vài năm.',
          effects: { money: -1600000000, karma: 6, happy: -12, followers: -0.45, unflag: 's_kol_bancuoc' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Chối: “Tôi tưởng đó là game giải trí”',
          outcomes: [
            { p: 0.35, text: 'Luật sư giỏi giúp bạn thoát với mức phạt hành chính. Nhưng cộng đồng mạng không tha: mỗi bài đăng của bạn đều có hàng nghìn bình luận “nhà cái đâu?”.',
              effects: { money: -300000000, followers: -0.5, happy: -10, karma: -3, unflag: 's_kol_bancuoc' },
              scene: { anim: 'shrug', fx: 'anger' } },
            { p: 0.65, text: 'Tin nhắn bàn giá được công bố làm bằng chứng. Bạn bị khởi tố về tội tổ chức đánh bạc, mất trắng sự nghiệp, tài khoản bị phong tỏa.',
              effects: { money: -2000000000, followers: -0.8, happy: -25, karma: -8, job: 'fire', flag: 'record', unflag: 's_kol_bancuoc' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_kol_tpcn', title: '“Thần dược” cần người nổi tiếng', icon: '💊', age: [18, 75], weight: 1.8,
      req: { minFollowers: 100000, notFlag: 's_kol_tpcn' },
      text: 'Một công ty mời bạn livestream bán “thực phẩm chức năng” quảng cáo là chữa được tiểu đường, hỗ trợ điều trị ung thư. Hoa hồng 30% mỗi đơn, kịch bản viết sẵn: “Chính mẹ mình uống khỏi bệnh đấy cả nhà ơi!”',
      scene: { loc: 'studio', anim: 'think', npcs: [{ role: 'boss', anim: 'talk', say: 'Bán một đêm bằng người ta làm cả năm.' }], fx: 'question' },
      choices: [
        { label: 'Từ chối, không bán thứ mình không hiểu',
          text: 'Bạn lắc đầu. Vài tháng sau, mấy KOL nhận lời bị khán giả kiện vì người nhà bỏ thuốc điều trị để uống “thần dược”.',
          effects: { karma: 6, happy: 2, flag: 's_kol_tpcn' },
          scene: { anim: 'shake', fx: 'sparkle' } },
        { label: 'Nhận, livestream đọc theo kịch bản',
          text: 'Một đêm live bán hơn chục nghìn hộp. Tiền hoa hồng về tài khoản {money:900000000}. Bạn không hỏi trong hộp thật sự có gì.',
          effects: { money: 900000000, karma: -14, followers: 0.04, flag: ['s_kol_tpcn', 's_kol_tpcn_ban'], followUp: { id: 's_kol_tpcn_phot', delay: 1 } },
          scene: { anim: 'talk', fx: 'money' } }
      ]
    },
    {
      id: 's_kol_tpcn_phot', title: 'Nạn nhân của “thần dược”', icon: '⚖️', age: [18, 80], chainOnly: true,
      req: { flag: 's_kol_tpcn_ban' },
      text: 'Cơ quan chức năng kiểm nghiệm: sản phẩm bạn bán chứa chất cấm, nhiều người dùng phải nhập viện. Một cô gái đăng clip khóc kể bố cô bỏ chạy thận để uống thuốc bạn quảng cáo. Clip 20 triệu lượt xem.',
      scene: { loc: 'home', anim: 'phone', expr: 'scared', npcs: [], fx: 'flash' },
      choices: [
        { label: 'Xin lỗi, đền bù cho nạn nhân',
          text: 'Bạn đến tận nhà xin lỗi, đền bù chi phí chữa bệnh, nộp lại tiền hoa hồng. Mất gần hết danh tiếng, nhưng giữ được chút lương tâm.',
          effects: { money: -1100000000, karma: 8, happy: -12, followers: -0.4, unflag: 's_kol_tpcn_ban' },
          scene: { anim: 'bow', fx: 'tears' } },
        { label: 'Đổ hết cho công ty, im lặng chờ qua',
          outcomes: [
            { p: 0.4, text: 'Bão mạng qua sau vài tháng, nhưng cái tên bạn gắn chặt với hai chữ “thuốc giả”.',
              effects: { followers: -0.5, happy: -8, karma: -5, unflag: 's_kol_tpcn_ban' },
              scene: { anim: 'shrug', fx: 'anger' } },
            { p: 0.6, text: 'Bạn bị điều tra vì quảng cáo gian dối, phạt nặng, truy thu thuế, các nhãn hàng kiện đòi bồi thường hợp đồng.',
              effects: { money: -1500000000, followers: -0.7, happy: -18, karma: -6, unflag: 's_kol_tpcn_ban' },
              scene: { anim: 'cry', fx: 'heartbreak', npcs: [{ role: 'police', anim: 'talk' }] } }
          ] }
      ]
    },
    {
      id: 's_kol_coin', title: 'Dự án tiền ảo “x100”', icon: '🪙', age: [18, 70], weight: 1.5,
      req: { minFollowers: 150000, notFlag: 's_kol_coin' },
      text: 'Một nhóm “nhà phát triển” mời bạn làm đại sứ cho đồng coin mới: tặng sẵn một ví coin trị giá {money:2000000000}, chỉ cần kêu gọi fan “vào sớm kẻo lỡ”.',
      scene: { loc: 'office', anim: 'phone', expr: 'happy', npcs: [{ role: 'stranger', anim: 'talk', say: 'Cơ hội đổi đời cho fan của bạn đấy!' }], fx: 'money' },
      choices: [
        { label: 'Không dính vào',
          text: 'Ba tháng sau, đồng coin sập về 0, nhóm phát triển biến mất. Vài người nổi tiếng nhận lời bị fan kéo đến tận nhà đòi tiền.',
          effects: { karma: 5, happy: 2, flag: 's_kol_coin' },
          scene: { anim: 'shake', fx: 'sparkle' } },
        { label: 'Nhận, hô hào fan mua',
          outcomes: [
            { p: 0.3, text: 'Bạn kịp bán coin lúc đỉnh, bỏ túi bộn tiền. Còn fan thì không kịp, và họ nhớ mặt bạn.',
              effects: { money: 1200000000, karma: -18, followers: -0.35, flag: 's_kol_coin' },
              scene: { anim: 'phone', fx: 'money' } },
            { p: 0.7, text: 'Coin sập về 0 trước khi bạn kịp bán. Hàng nghìn fan mất tiền tiết kiệm, đơn tố cáo gửi tới công an, bạn bị triệu tập vì liên quan lừa đảo.',
              effects: { money: -500000000, karma: -18, followers: -0.6, happy: -20, flag: 's_kol_coin' },
              scene: { anim: 'cry', fx: 'heartbreak', npcs: [{ role: 'police', anim: 'talk' }] } }
          ] }
      ]
    }
  );
})();
