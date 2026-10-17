/* Một Kiếp Người — ngoại truyện: tình yêu (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: MỐI TÌNH ĐẦU CẤP 3 =======================
    {
      id: 's_love_dau_cung_ban', title: 'Bạn cùng bàn mới', icon: '✏️', age: [15, 16], weight: 1.5,
      req: { school: true, eduLevel: ['highschool'], lacks: ['partner', 'spouse'], notFlag: 's_love_dau' },
      text: 'Đầu năm học mới, cô chủ nhiệm xếp bạn ngồi cạnh {classmate}. Mới ba tuần mà bạn đã thuộc lòng mùi dầu gội, nụ cười híp mắt và thói quen gặm nắp bút của người ta. Tối nào bạn cũng mở khung chat, gõ rồi lại xóa.',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'study', expr: 'love',
        npcs: [{ role: 'classmate', anim: 'study', say: 'Cho mình mượn cái thước nha?' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Viết thư tay kẹp vào vở Văn',
          text: 'Bạn nắn nót cả buổi tối, viết hỏng mười hai tờ giấy rồi kẹp lá thư vào giữa vở Văn của {classmate}. Sáng hôm sau, người ta đọc xong, đỏ mặt nhìn ra cửa sổ suốt tiết Sử.',
          effects: { happy: 4, flag: 's_love_dau', followUp: { id: 's_love_dau_to_tinh', delay: 0 } },
          scene: { anim: 'think', fx: 'sweat', npcAnim: { classmate: 'love' } } },
        { label: 'Nhắn tin dù ngồi ngay cạnh nhau',
          text: 'Giờ ra chơi, bạn cúi mặt nhắn: “Chiều nay đi ăn chè không?” dù người nhận ngồi cách bạn đúng hai mươi phân. {classmate} đọc, bật cười, rồi cũng cúi xuống gõ trả lời.',
          effects: { happy: 5, flag: 's_love_dau', followUp: { id: 's_love_dau_to_tinh', delay: 0 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { classmate: 'phone' }, npcExpr: { classmate: 'love' } } },
        { label: 'Nhờ đứa bạn thân làm “chim xanh”',
          outcomes: [
            { p: 0.5, text: 'Chim xanh làm nhiệm vụ xuất sắc, mang về tin tình báo nóng hổi: “Người ta cũng để ý mày đấy!” Bạn sướng đến mất ngủ.',
              effects: { happy: 6, flag: 's_love_dau', followUp: { id: 's_love_dau_to_tinh', delay: 0 } },
              scene: { anim: 'jump', fx: 'hearts', npcAnim: { classmate: 'laugh' } } },
            { p: 0.5, text: 'Chim xanh... bép xép. Đến chiều cả lớp đã biết, bảng đen có hẳn hình trái tim ghép tên hai đứa. Ngượng chín người, nhưng hình như {classmate} không giận.',
              effects: { happy: -2, flag: 's_love_dau', followUp: { id: 's_love_dau_to_tinh', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { classmate: 'laugh' } } }
          ] },
        { label: 'Cất vào nhật ký, chỉ ngắm thôi',
          text: 'Bạn chọn làm người thầm lặng. Ba năm cấp ba trôi qua với một góc nhật ký toàn tên {classmate}. Chẳng có gì xảy ra, cũng chẳng có gì phải hối tiếc... hoặc có, một chút.',
          effects: { happy: -1, smarts: 2, flag: 's_love_dau' },
          scene: { anim: 'study', fx: 'petals' } }
      ]
    },
    {
      id: 's_love_dau_to_tinh', title: 'Lời tỏ tình sau giờ tan học', icon: '💌', age: [15, 17], chainOnly: true,
      text: 'Chiều thứ Sáu, lớp học vắng tanh, nắng chiều xiên qua cửa sổ. Bạn nhờ {classmate} ở lại vì “có chuyện muốn nói”. Tay bạn cầm hộp sữa dâu, tim đập to đến mức sợ người ta nghe thấy.',
      scene: { loc: 'school', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'scared',
        npcs: [{ role: 'classmate', anim: 'idle', say: 'Có chuyện gì mà bí mật thế?' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Nói thẳng: “Mình thích bạn”',
          success: { stat: 'looks', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Im lặng ba giây dài như ba năm. Rồi {classmate} cầm lấy hộp sữa, cười: “Sao giờ mới nói?” Từ hôm đó, bạn chính thức có mối tình đầu.',
              effects: { happy: 12, addPerson: { role: 'partner', fromScene: 'classmate' }, flag: 's_love_dau_yeu', followUp: { id: 's_love_dau_hen_ho', delay: 0 } },
              scene: { anim: 'love', fx: 'hearts', npcAnim: { classmate: 'love' }, npcSay: { classmate: 'Sao giờ mới nói?' } } },
            { text: '{classmate} cúi đầu: “Mình xin lỗi, mình chỉ coi bạn là bạn thôi.” Bạn cười gượng, đạp xe về, khóc một trận ra trò dưới mưa.',
              effects: { happy: -10 },
              scene: { anim: 'cry', weather: 'rain', fx: 'heartbreak', npcAnim: { classmate: 'sad' } } }
          ] },
        { label: 'Hát tặng một bài bằng cây guitar mượn',
          outcomes: [
            { p: 0.4, text: 'Giọng bạn vỡ ngay đoạn điệp khúc, nhưng {classmate} vỗ tay, mắt long lanh: “Hát dở ghê... nhưng mình đồng ý.”',
              effects: { happy: 12, looks: 1, addPerson: { role: 'partner', fromScene: 'classmate' }, flag: 's_love_dau_yeu', followUp: { id: 's_love_dau_hen_ho', delay: 0 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { classmate: 'clap' }, npcSay: { classmate: 'Hát dở ghê... nhưng mình đồng ý.' } } },
            { p: 0.35, text: 'Bác bảo vệ nghe tiếng đàn chạy vào tưởng có trộm. Cả ba cùng cười, bầu không khí tan biến. {classmate} vỗ vai bạn: “Mình làm bạn thân nhé?”',
              effects: { happy: 2, addPerson: { role: 'friend', fromScene: 'classmate' }, flag: 's_love_dau_friendzone' },
              scene: { anim: 'facepalm', fx: 'question', npcAnim: { classmate: 'laugh' } } },
            { p: 0.25, text: 'Đứt dây đàn ngay nốt đầu tiên. {classmate} nhịn cười không nổi, còn bạn chỉ muốn độn thổ. Lời tỏ tình trôi theo tiếng ve.',
              effects: { happy: -6 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { classmate: 'laugh' } } }
          ] },
        { label: 'Đăng story ẩn ý, chờ người ta hiểu',
          outcomes: [
            { p: 0.5, text: '{classmate} thả tim story rồi nhắn: “Bài hát đó nói về ai vậy?” Bạn gõ đúng một chữ: “Bạn.” Mười phút sau: “Mình cũng vậy.”',
              effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'classmate' }, flag: 's_love_dau_yeu', followUp: { id: 's_love_dau_hen_ho', delay: 0 } },
              scene: { anim: 'phone', fx: 'hearts', npcAnim: { classmate: 'phone' } } },
            { p: 0.5, text: 'Story được 47 lượt xem, đủ cả lớp, trừ đúng một người. Bạn ôm điện thoại đến nửa đêm rồi âm thầm xóa.',
              effects: { happy: -5 },
              scene: { anim: 'sad', fx: 'question', npcAnim: { classmate: 'walk' } } }
          ] },
        { label: 'Đổi ý: “À... cho mình mượn vở Lý thôi”',
          text: 'Bạn chìa hộp sữa ra rồi hỏi mượn vở Lý. {classmate} nhìn bạn rất lâu, thở dài, đưa vở. Hai người làm bạn thân, còn câu nói kia nằm lại trong ngăn bàn.',
          effects: { happy: -2, addPerson: { role: 'friend', fromScene: 'classmate' }, flag: 's_love_dau_friendzone' },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { classmate: 'shrug' } } }
      ]
    },
    {
      id: 's_love_dau_hen_ho', title: 'Hẹn hò lén lút', icon: '🧋', age: [15, 17], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Yêu nhau tuổi học trò là những ly trà sữa vội sau giờ học thêm, là chiếc xe đạp chở nhau một vòng hồ trước khi về. Thứ Bảy này {partner} rủ đi xem phim, nhưng bố mẹ bạn đã nói rõ: “Lo mà học, yêu đương gì tầm này.”',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'phone', expr: 'love',
        npcs: [{ role: 'partner', anim: 'wave', say: 'Thứ Bảy đi xem phim nha!' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Nói dối “con đi học nhóm”',
          text: 'Bạn ôm cặp ra khỏi nhà lúc 7 giờ tối, trong cặp là... chiếc áo đẹp nhất. Phim dở tệ nhưng hai bạn cười suốt, và lần đầu nắm tay nhau trong bóng tối.',
          effects: { happy: 8, karma: -2, rel: { partner: 10 }, flag: 's_love_dau_noi_doi', followUp: { id: 's_love_dau_bi_lo', delay: 1 } },
          scene: { time: 'night', anim: 'love', fx: 'hearts', npcAnim: { partner: 'love' } } },
        { label: 'Rủ người ấy về nhà học nhóm thật',
          text: '{partner} đến nhà, hai đứa ngồi giải đề Toán dưới con mắt “camera” của bố mẹ. Học thì ít, liếc nhau thì nhiều, nhưng điểm kiểm tra tuần sau của cả hai đều tăng vọt.',
          effects: { happy: 5, smarts: 3, rel: { partner: 6 }, flag: 's_love_dau_cong_khai', followUp: { id: 's_love_dau_mua_thi', delay: 2 } },
          scene: { loc: 'home', anim: 'study', fx: 'idea', npcAnim: { partner: 'study' } } },
        { label: 'Đạp xe đi ăn chè, về trước 9 giờ',
          text: 'Hai đứa đạp xe một vòng hồ, ăn chè thập cẩm, chia nhau một bên tai nghe. Về đến nhà đúng 8 giờ 59 phút, mẹ không nghi ngờ gì. Hạnh phúc đơn giản thế thôi.',
          effects: { happy: 7, money: -40000, rel: { partner: 8 }, followUp: { id: 's_love_dau_bi_lo', delay: 1 } },
          scene: { loc: 'park', anim: 'eat', fx: 'hearts', npcAnim: { partner: 'eat' } } },
        { label: 'Từ chối, tập trung học',
          text: '{partner} hơi buồn: “Ừ, thế thôi.” Bạn ngồi học mà đầu óc cứ trôi về rạp phim. Tình cảm nguội đi một chút, nhưng điểm thì không.',
          effects: { smarts: 3, happy: -2, rel: { partner: -6 }, followUp: { id: 's_love_dau_mua_thi', delay: 2 } },
          scene: { anim: 'study', fx: 'sweat', npcAnim: { partner: 'sad' } } }
      ]
    },
    {
      id: 's_love_dau_bi_lo', title: 'Bị bắt quả tang', icon: '📱', age: [15, 18], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Giờ sinh hoạt lớp, cô chủ nhiệm {teacher} giơ lên chiếc điện thoại bị tịch thu sáng nay — của bạn. Màn hình khóa là ảnh photobooth của bạn và {partner}, kèm tin nhắn vừa đến: “Tối nay lại học nhóm nha 😘”. Cô nói: “Cuối buổi, hai em ở lại gặp cô.”',
      scene: { loc: 'school', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'teacher', gender: 'f', age: 45, anim: 'point', say: 'Hai em ở lại gặp cô!' }, { role: 'partner', anim: 'scared', expr: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Thành thật nhận hết, hứa giữ điểm',
          success: { stat: 'karma', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Cô {teacher} nghe xong, thở dài rồi bật cười: “Cô cũng từng mười sáu tuổi. Nhưng điểm mà tụt là cô báo bố mẹ ngay.” Hai bạn thoát nạn, kèm một lời hứa nặng trĩu.',
              effects: { happy: 4, karma: 3, rel: { partner: 5 }, flag: 's_love_dau_hua', followUp: { id: 's_love_dau_mua_thi', delay: 1 } },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { teacher: 'nod', partner: 'bow' }, npcSay: { teacher: 'Điểm mà tụt là cô báo bố mẹ đấy.' } } },
            { text: 'Cô vẫn mời phụ huynh. Tối đó bố mẹ ngồi nghiêm như tòa án, tịch thu điện thoại ba tháng. Nhưng ít nhất bạn không phải nói dối thêm câu nào.',
              effects: { happy: -6, karma: 2, rel: { mother: -4, father: -4, partner: 3 }, followUp: { id: 's_love_dau_mua_thi', delay: 1 } },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { teacher: 'shake', partner: 'sad' } } }
          ] },
        { label: 'Chối: “Bạn em nhắn đùa thôi ạ”',
          outcomes: [
            { p: 0.3, text: 'Cô nửa tin nửa ngờ, trả điện thoại kèm lời cảnh cáo. Bạn thoát, nhưng {partner} buồn suốt một tuần vì bị gọi là “bạn nhắn đùa”.',
              effects: { happy: 1, karma: -3, rel: { partner: -10 }, followUp: { id: 's_love_dau_mua_thi', delay: 1 } },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { partner: 'sad' } } },
            { p: 0.7, text: 'Đúng lúc đó điện thoại lại rung, tin nhắn mới hiện lên: “Nhớ quá 💕”. Cả lớp ồ lên. Cô mời phụ huynh, còn {partner} giận bạn cả tuần vì dám chối.',
              effects: { happy: -8, karma: -3, rel: { partner: -12 }, followUp: { id: 's_love_dau_mua_thi', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { teacher: 'angry', partner: 'angry' } } }
          ] },
        { label: 'Chia tay cho yên chuyện',
          text: 'Bạn nói với {partner} ngay ngoài hành lang: “Mình dừng lại đi, mình sợ lắm.” Người ấy không khóc, chỉ gật đầu rồi đi thẳng. Đêm đó, người khóc lại là bạn.',
          effects: { happy: -10, smarts: 2, removePerson: 'partner' },
          scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'walk', teacher: 'sad' } } },
        { label: 'Cãi lại: “Yêu thì có gì sai hả cô?”',
          text: 'Cả lớp nín thở. Bạn bị hạ hạnh kiểm, bố mẹ phải lên trường. Về nhà, bố im lặng suốt bữa cơm, điều đó còn đáng sợ hơn bị mắng. Nhưng {partner} thì nhìn bạn như nhìn người hùng.',
          effects: { happy: -4, karma: -4, smarts: -1, rel: { partner: 8, father: -8, mother: -6 }, followUp: { id: 's_love_dau_mua_thi', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { teacher: 'angry', partner: 'love' } } }
      ]
    },
    {
      id: 's_love_dau_mua_thi', title: 'Mùa ôn thi', icon: '📚', age: [16, 18], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Năm cuối cấp, lịch học kín từ 6 giờ sáng đến 10 giờ đêm. {partner} muốn thi vào một trường ở thành phố khác, còn bạn vẫn chưa biết mình muốn gì. Con số đếm ngược trên góc bảng chỉ còn 120 ngày.',
      scene: { loc: 'school', time: 'night', weather: 'clear', anim: 'study', expr: 'sleepy',
        npcs: [{ role: 'partner', anim: 'study', say: 'Mình ôn chung, cùng đỗ nhé?' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Cùng ôn ở thư viện mỗi tối',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Hai đứa thay nhau làm thầy: đứa giỏi Toán kèm đứa giỏi Văn. Những tối ôn thi ấy hóa ra là quãng thời gian đẹp nhất của cả hai.',
              effects: { smarts: 6, happy: 5, rel: { partner: 10 }, flag: 's_love_dau_cung_on', followUp: { id: 's_love_dau_ket', delay: 1 } },
              scene: { anim: 'cheer', fx: 'idea', npcAnim: { partner: 'clap' } } },
            { text: 'Ôn chung nhưng tám chuyện nhiều hơn ôn. Điểm thi thử của cả hai tụt thê thảm, và bố mẹ bắt đầu nhìn {partner} bằng ánh mắt chẳng mấy thiện cảm.',
              effects: { smarts: 1, happy: -3, rel: { partner: 3 }, flag: 's_love_dau_cung_on', followUp: { id: 's_love_dau_ket', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { partner: 'shrug' } } }
          ] },
        { label: 'Tạm dừng để mỗi người tập trung',
          text: 'Bạn đề nghị “tạm chia tay đến sau kỳ thi”. {partner} im lặng rất lâu rồi gật đầu. Không còn tin nhắn chúc ngủ ngon, chỉ còn đề thi và nỗi nhớ.',
          effects: { smarts: 7, happy: -8, removePerson: 'partner', flag: 's_love_dau_tam_dung', followUp: { id: 's_love_dau_gap_lai', delay: 1 } },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { partner: 'cry' } } },
        { label: 'Viết lời hẹn ước vào lưu bút',
          text: 'Hai bạn viết vào trang cuối cuốn lưu bút của nhau: “Dù đỗ đâu, mình vẫn chờ nhau.” Ký tên, ghi ngày, dán thêm tấm ảnh photobooth. Rồi lao vào ôn thi như hai chiến binh.',
          effects: { smarts: 4, happy: 6, rel: { partner: 8 }, flag: 's_love_dau_hen_uoc', followUp: { id: 's_love_dau_ket', delay: 1 } },
          scene: { anim: 'love', fx: 'petals', npcAnim: { partner: 'love' } } },
        { label: 'Trốn lò luyện thi đi chơi “xả stress”',
          text: 'Hai đứa trốn lò luyện thi đi ăn ốc, xem phim, chụp ảnh. Vui quên trời đất. Rồi bảng điểm thi thử gửi về nhà, và bố mẹ thì chẳng thấy vui chút nào.',
          effects: { happy: 6, smarts: -5, rel: { partner: 6, mother: -5, father: -5 }, followUp: { id: 's_love_dau_ket', delay: 1 } },
          scene: { loc: 'street', anim: 'laugh', fx: 'confetti', npcAnim: { partner: 'laugh' } } }
      ]
    },
    {
      id: 's_love_dau_ket', title: 'Mùa hè cuối cùng', icon: '🎓', age: [17, 19], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Kỳ thi đã khép lại. Chiều nay hai đứa ngồi ở quán chè quen, mỗi người cầm một chiếc điện thoại chờ tra kết quả. {partner} nắm tay bạn dưới gầm bàn, lạnh ngắt.',
      scene: { loc: 'cafe', time: 'dusk', weather: 'clear', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'phone', expr: 'scared', say: 'Đếm đến ba rồi cùng mở nhé...' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Đếm đến ba, cùng mở kết quả',
          outcomes: [
            { p: 0.45, text: 'Cùng đỗ một trường! Hai đứa hét lên giữa quán, bà chủ quán chè tặng thêm hai cốc. Tháng Chín này, sẽ có hai tân sinh viên đạp xe chung một con đường.',
              effects: { happy: 14, rel: { partner: 12 }, flag: 's_love_dau_cung_truong' },
              scene: { anim: 'jump', fx: 'fireworks', npcAnim: { partner: 'hug' } } },
            { p: 0.35, text: '{partner} đỗ vào một trường cách bạn tám trăm cây số. Hai đứa nhìn nhau, không ai nói gì. Rồi người ấy siết tay bạn: “Mình thử yêu xa nhé?”',
              effects: { happy: -2, rel: { partner: 6 }, flag: 's_love_dau_xa' },
              scene: { anim: 'hug', fx: 'tears', npcAnim: { partner: 'hug' } } },
            { p: 0.2, text: 'Kết quả khác nhau quá xa, và những giấc mơ cũng vậy. Hai đứa ngồi đến khi quán đóng cửa, rồi chia tay trong nước mắt, nhẹ như cơn mưa đầu hạ.',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'cry', weather: 'rain', fx: 'heartbreak', npcAnim: { partner: 'cry' } } }
          ] },
        { label: 'Mở lưu bút, đọc lại lời hẹn ước', req: { flag: 's_love_dau_hen_uoc' },
          text: 'Bạn lấy cuốn lưu bút ra, đọc to dòng chữ năm nào. {partner} bật khóc rồi bật cười: “Đỗ đâu cũng được, mình vẫn chờ nhau mà.” Lời hẹn tuổi mười bảy, hóa ra vẫn còn nguyên.',
          effects: { happy: 10, karma: 2, rel: { partner: 14 } },
          scene: { anim: 'hug', fx: 'petals', npcAnim: { partner: 'cry' } } },
        { label: 'Nói lời chia tay trước khi mỗi người một ngả',
          text: 'Bạn bảo: “Mình đi đường riêng đi, để không ai phải chờ ai.” {partner} gật đầu, tháo chiếc vòng tay đôi trả lại bạn. Mối tình đầu khép lại đẹp như một bộ phim học trò.',
          effects: { happy: -8, smarts: 1, removePerson: 'partner' },
          scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { partner: 'cry' } } }
      ]
    },
    {
      id: 's_love_dau_gap_lai', title: 'Gặp lại sau kỳ thi', icon: '🌦️', age: [17, 19], chainOnly: true,
      req: { has: ['ex'], flag: 's_love_dau_tam_dung' },
      text: 'Ngày tra điểm, bạn gặp lại {ex} ở cổng trường. Sau mấy tháng “tạm dừng”, hai đứa đứng nhìn nhau như người quen cũ, không biết nên vẫy tay hay ôm một cái.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'wave', expr: 'surprised',
        npcs: [{ role: 'ex', anim: 'wave', say: 'Thi tốt không?' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Hỏi: “Mình bắt đầu lại được không?”',
          outcomes: [
            { p: 0.5, text: '{ex} cười buồn: “Mình quen với việc không có cậu rồi.” Câu trả lời nhẹ tênh mà nặng trĩu. Bạn gật đầu, chúc người ta đỗ nguyện vọng một.',
              effects: { happy: -6, rel: { ex: 4 } },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { ex: 'shake' } } },
            { p: 0.5, text: '{ex} im lặng một lúc rồi chìa tay ra: “Làm lại từ đầu nhé, lần này làm bạn trước đã.” Hai đứa cười xòa, hẹn tối đi ăn chè như ngày xưa.',
              effects: { happy: 8, rel: { ex: 15 } },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { ex: 'laugh' } } }
          ] },
        { label: 'Chúc mừng nhau rồi mỉm cười đi tiếp',
          text: '“Chúc cậu đỗ nhé.” “Cậu cũng thế.” Hai người quay lưng về hai hướng, nhẹ nhõm như vừa gấp lại trang lưu bút cuối cùng.',
          effects: { happy: 3, karma: 2, rel: { ex: 6 } },
          scene: { anim: 'wave', fx: 'petals', npcAnim: { ex: 'wave' } } },
        { label: 'Giả vờ không thấy, quay đi',
          text: 'Bạn cúi mặt bước nhanh qua. Về nhà mới thấy tin nhắn: “Cậu vẫn đi nhanh như ngày xưa.” Bạn đọc đi đọc lại cả buổi tối.',
          effects: { happy: -3 },
          scene: { anim: 'walk', fx: 'sweat', npcAnim: { ex: 'sad' } } }
      ]
    },

    // ======================= ARC 2: NGƯỜI YÊU DỖI (lặp lại) =======================
    {
      id: 's_love_doi_tin_nhan', title: 'Đã xem lúc 14:02', icon: '💬', age: [15, 60], weight: 0.7, once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: '{partner} nhắn từ trưa: “Tối nay ăn gì?” Bạn đọc, định trả lời sau, rồi... quên mất. 9 giờ tối mới nhắn lại đúng ba chữ “Gì cũng được”. Màn hình hiện dòng trả lời lạnh như đá: “Ừ.”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'phone', expr: 'angry', say: 'Ừ.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Đặt ngay trà sữa full topping ship tới',
          outcomes: [
            { p: 0.65, text: 'Ly trà sữa trân châu đường đen đến tận cửa, kèm tờ giấy nhỏ “Mình sai rồi, đừng giận nha”. {partner} gửi lại sticker con mèo ôm tim. Hòa bình lập lại với giá {money:65000}.',
              effects: { money: -65000, happy: 3, rel: { partner: 6 } },
              scene: { anim: 'cheer', fx: 'hearts', npcAnim: { partner: 'drink' } } },
            { p: 0.35, text: '“Tưởng trà sữa là xong à?” Trà sữa vẫn được uống sạch, nhưng cơn giận thì còn nguyên. Bạn bị “đã xem” không trả lời thêm hai ngày.',
              effects: { money: -65000, happy: -3, rel: { partner: -3 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { partner: 'drink' } } }
          ] },
        { label: 'Gọi điện xin lỗi thật lòng',
          text: 'Bạn gọi điện, giải thích hôm nay bận thật, rồi hứa lần sau bận thì ít nhất nhắn một câu “bận xíu nha”. Đầu dây bên kia im lặng, rồi phì cười: “Biết vậy là được.”',
          effects: { happy: 3, karma: 1, rel: { partner: 8 } },
          scene: { anim: 'phone', fx: 'sparkle', npcAnim: { partner: 'laugh' } } },
        { label: 'Cãi: “Bận thật mà, làm gì căng”',
          outcomes: [
            { p: 0.75, text: 'Cuộc nhắn tin biến thành trận khẩu chiến 200 tin. Cả hai đi ngủ trong bực bội, sáng ra mắt ai cũng thâm quầng.',
              effects: { happy: -5, rel: { partner: -10 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { partner: 'angry' } } },
            { p: 0.25, text: '“Ừ, vậy cứ bận luôn đi.” {partner} chặn bạn trên mọi nền tảng. Mối tình kết thúc chỉ vì một tin nhắn trả lời chậm.',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'shrug', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Im lặng chờ người ấy nguôi',
          text: 'Bạn quyết định im lặng cho “nguội”. Một ngày trôi qua. Rồi hai ngày...',
          effects: { happy: -2, followUp: { id: 's_love_doi_lanh', delay: 0 } },
          scene: { anim: 'shrug', fx: 'question' } }
      ]
    },
    {
      id: 's_love_doi_like_anh', title: 'Cái tim định mệnh', icon: '❤️', age: [15, 60], weight: 0.7, once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: '1 giờ sáng, bạn lướt Facebook và lỡ tay thả tim tấm ảnh “sống ảo” ở biển của một người lạ cực kỳ đẹp. Sáng hôm sau, {partner} gửi cho bạn đúng tấm ảnh chụp màn hình đó, không kèm một chữ nào.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'point', expr: 'angry', say: 'Giải thích đi.' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Giải thích: “Lỡ tay thật mà!”',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: '{partner} nheo mắt nhìn bạn ba giây, rồi tin. Hoặc ít nhất là giả vờ tin. Bạn bị phạt hủy theo dõi tài khoản đó ngay trước mặt.',
              effects: { happy: 1, rel: { partner: 2 } },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { partner: 'nod' } } },
            { text: '“Lỡ tay lúc 1 giờ sáng? Lỡ tay lướt tới tấm thứ 37?” Bằng chứng rành rành, bạn cứng họng. Cả tuần bị đối xử lạnh hơn ngăn đá tủ lạnh.',
              effects: { happy: -5, rel: { partner: -8 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { partner: 'angry' } } }
          ] },
        { label: 'Thả tim lại 100 tấm ảnh của người yêu',
          text: 'Bạn lặn ngược về tận những tấm ảnh mười năm trước, thả tim từng tấm của {partner}, bình luận “đẹp quá trời”. Người ấy vừa giận vừa buồn cười: “Đồ dở hơi.” Thế là xong.',
          effects: { happy: 4, rel: { partner: 7 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { partner: 'laugh' } } },
        { label: 'Phản công: “Thế hôm trước ai like ảnh người cũ?”',
          outcomes: [
            { p: 0.5, text: 'Hai người lôi hết lịch sử thả tim của nhau ra đối chất như một phiên tòa. Kết quả: hòa, nhưng cả hai đều mệt rã rời.',
              effects: { happy: -4, rel: { partner: -6 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { partner: 'angry' } } },
            { p: 0.5, text: '{partner} khựng lại, đỏ mặt. Hóa ra ai cũng có “tiền án”. Hai đứa phá lên cười, hứa từ nay lướt mạng có trách nhiệm.',
              effects: { happy: 4, rel: { partner: 3 } },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { partner: 'laugh' } } }
          ] },
        { label: 'Im lặng chờ cơn giận nguội',
          text: 'Bạn không giải thích, cũng không xin lỗi, chỉ chờ mọi chuyện tự qua. Nhưng có những chuyện không tự qua.',
          effects: { happy: -2, followUp: { id: 's_love_doi_lanh', delay: 0 } },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { partner: 'angry' } } }
      ]
    },
    {
      id: 's_love_doi_nhau', title: 'Bỏ quên buổi hẹn', icon: '🍻', age: [18, 60], weight: 0.7, once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: 'Bạn đã hứa tối nay đi xem phim với {partner}. Rồi đám bạn rủ “làm vài lon thôi”. Đến khi nhìn điện thoại: 11 cuộc gọi nhỡ. Chưa kịp gọi lại thì {partner} đã đứng ngay đầu bàn nhậu, tay cầm hai tấm vé đã quá giờ chiếu.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'drink', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'angry', say: 'Phim chiếu xong rồi đấy!' }, { role: 'crowd', anim: 'drink' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Quỳ xuống xin lỗi trước cả bàn',
          outcomes: [
            { p: 0.6, text: 'Cả bàn nhậu vỗ tay rần rần, ông chú bàn bên còn hô “Tha cho nó đi!”. {partner} xấu hổ quá, kéo bạn về. Vẫn giận, nhưng đã nguôi một nửa.',
              effects: { happy: 2, rel: { partner: 4 } },
              scene: { anim: 'bow', fx: 'sweat', npcAnim: { partner: 'facepalm', crowd: 'clap' } } },
            { p: 0.4, text: '{partner} lạnh lùng: “Đứng lên, đừng làm trò.” Rồi quay lưng đi. Bạn chạy theo dưới mưa phùn, men bia bay sạch.',
              effects: { happy: -5, rel: { partner: -6 } },
              scene: { anim: 'run', weather: 'rain', fx: 'tears', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Đền bù: suất chiếu muộn + bắp nước cỡ đại',
          text: 'Bạn mua vé suất 23 giờ 30, bắp phô mai cỡ đại và thề không đụng một giọt bia nào trong tháng. Phim hay, {partner} dựa vai bạn ngủ gật giữa chừng.',
          effects: { money: -350000, happy: 4, rel: { partner: 8 } },
          scene: { anim: 'love', fx: 'hearts', npcAnim: { partner: 'love' } } },
        { label: 'Kéo người ấy ngồi xuống nhậu cùng',
          outcomes: [
            { p: 0.4, text: 'Không ngờ {partner} ngồi xuống, cụng ly, rồi kể chuyện còn duyên hơn cả bàn. Đám bạn bái phục sát đất. Buổi hẹn hỏng hóa ra lại vui.',
              effects: { happy: 6, rel: { partner: 5 } },
              scene: { anim: 'laugh', fx: 'music', npcAnim: { partner: 'drink', crowd: 'laugh' } } },
            { p: 0.6, text: '“Ngồi với cái đám đã cướp buổi hẹn của tôi á?” Bạn nhận lại tấm vé xem phim và một ánh mắt có thể đóng băng cả cốc bia.',
              effects: { happy: -6, rel: { partner: -12 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { partner: 'angry', crowd: 'scared' } } }
          ] },
        { label: 'Cãi: “Lâu lâu đi với bạn một hôm mà cũng...”',
          outcomes: [
            { p: 0.7, text: 'Hai người cãi nhau ngay giữa vỉa hè. Đám bạn lặng lẽ... gọi thêm đĩa lạc.',
              effects: { happy: -6, rel: { partner: -12 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { partner: 'angry', crowd: 'eat' } } },
            { p: 0.3, text: '“Vậy cứ ở với bạn bè cả đời đi.” {partner} tháo chiếc nhẫn đôi đặt xuống bàn nhậu rồi bỏ đi. Lần này là thật.',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { partner: 'walk', crowd: 'scared' } } }
          ] }
      ]
    },
    {
      id: 's_love_doi_mon_an', title: 'Canh hơi mặn', icon: '🍲', age: [16, 60], weight: 0.7, once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: '{partner} lần đầu vào bếp nấu cho bạn một mâm cơm: cá kho, rau muống xào và nồi canh chua. Bạn húp một thìa canh, mặt méo xệch. {partner} nhìn bạn đầy mong đợi: “Ngon không?”',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'eat', expr: 'surprised',
        npcs: [{ role: 'partner', anim: 'cook', expr: 'happy', say: 'Ngon không? Nói thật đi!' }], fx: 'steam', shot: 'close' },
      choices: [
        { label: 'Nói thật: “Hơi mặn... một xíu thôi”',
          outcomes: [
            { p: 0.5, text: '{partner} nếm thử, ho sặc sụa rồi phá lên cười: “Mặn như nước biển!” Hai đứa đổ nồi canh, gọi hai suất cơm tấm, vẫn vui như thường.',
              effects: { happy: 4, money: -90000, rel: { partner: 4 } },
              scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { partner: 'laugh' } } },
            { p: 0.5, text: '“Ừ, thế từ nay tự nấu mà ăn.” {partner} cởi tạp dề, đóng sầm cửa phòng. Bạn ngồi một mình với nồi canh mặn chát.',
              effects: { happy: -5, rel: { partner: -8 } },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { partner: 'angry' } } }
          ] },
        { label: 'Khen nức nở, ăn sạch ba bát',
          text: 'Bạn khen ngon như nhà hàng năm sao rồi chiến sạch sành sanh. Đêm đó bạn uống hết hai lít nước. {partner} hạnh phúc đến mức hứa tuần nào cũng nấu.',
          effects: { happy: 3, health: -2, karma: -1, rel: { partner: 10 } },
          scene: { anim: 'cheer', fx: 'hearts', npcAnim: { partner: 'love' } } },
        { label: 'Chê thẳng, so với mẹ nấu',
          outcomes: [
            { p: 0.7, text: '“Thế về nhà mẹ mà ăn!” So sánh với mẹ là tội tày đình. Bạn ăn mì tôm một mình ba ngày liền.',
              effects: { happy: -6, rel: { partner: -14 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { partner: 'angry' } } },
            { p: 0.3, text: '{partner} đặt đũa xuống, mắt đỏ hoe: “Mình đã cố cả buổi chiều.” Rồi lặng lẽ thu dọn đồ. Có những câu nói ra là không rút lại được.',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { partner: 'cry' } } }
          ] },
        { label: 'Lén chế thêm nước sôi vào nồi canh',
          outcomes: [
            { p: 0.6, text: 'Bạn pha loãng nồi canh lúc {partner} quay đi. Canh nhạt hẳn, người ấy tự hào: “Thấy chưa, vừa miệng mà!” Một phi vụ hoàn hảo.',
              effects: { happy: 5, karma: -1, rel: { partner: 5 } },
              scene: { anim: 'laugh', fx: 'steam', npcAnim: { partner: 'eat' } } },
            { p: 0.4, text: 'Bị bắt quả tang tay cầm ấm nước sôi. {partner} vừa tức vừa buồn cười, phạt bạn rửa bát cả tuần.',
              effects: { happy: 1, rel: { partner: -2 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { partner: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_love_doi_ky_niem', title: 'Trễ đúng một ngày', icon: '💐', age: [17, 60], weight: 0.6, once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: 'Bạn ôm bó hoa hồng và hộp bánh kem đứng trước cửa nhà {partner}, hớn hở: “Kỷ niệm ngày yêu nhau vui vẻ!” Người ấy nhìn bó hoa, giọng đều đều: “Kỷ niệm là hôm qua.”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'idle', expr: 'happy',
        npcs: [{ role: 'partner', anim: 'idle', expr: 'angry', say: 'Kỷ niệm là hôm qua.' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Chống chế: “Mình tính theo giờ Mỹ mà!”',
          outcomes: [
            { p: 0.5, text: '{partner} cố nhịn mà không nhịn nổi, phì cười: “Sao không tính theo giờ sao Hỏa luôn đi?” Hoa được nhận, lỗi được tha một nửa.',
              effects: { happy: 4, rel: { partner: 3 } },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { partner: 'laugh' } } },
            { p: 0.5, text: '“Hài hước lắm.” Cánh cửa đóng lại ngay trước mũi bạn và bó hoa.',
              effects: { happy: -5, rel: { partner: -7 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { partner: 'angry' } } }
          ] },
        { label: 'Xin lỗi thật lòng, đặt bữa tối bù',
          text: 'Bạn nhận sai, rồi đặt bàn ở một nhà hàng tử tế cho tối mai, kèm tấm thiệp viết tay liệt kê 500 điều bạn thích ở người ấy (thật ra mới viết được 47).',
          effects: { money: -1200000, happy: 4, karma: 1, rel: { partner: 10 } },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { partner: 'love' } } },
        { label: 'Đổ lỗi cho điện thoại không nhắc',
          text: '“Điện thoại không nhắc thì tim cũng không nhắc à?” Câu hỏi ấy treo lơ lửng, và cánh cửa khép lại.',
          effects: { happy: -4, rel: { partner: -9 }, followUp: { id: 's_love_doi_lanh', delay: 0 } },
          scene: { anim: 'shrug', fx: 'anger', npcAnim: { partner: 'angry' } } },
        { label: 'Cài nhắc lịch cho mọi ngày kỷ niệm',
          text: 'Bạn mở điện thoại ngay trước mặt người ấy, cài nhắc cho kỷ niệm tháng, kỷ niệm năm, sinh nhật, ngày nắm tay đầu tiên... {partner} vẫn giận, nhưng khóe miệng đã cong lên.',
          effects: { happy: 2, smarts: 1, rel: { partner: 5 } },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { partner: 'shrug' } } }
      ]
    },
    {
      id: 's_love_doi_khong_sao', title: '“Không sao đâu”', icon: '🙂', age: [15, 60], weight: 0.7, once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: 'Cả tối {partner} chỉ trả lời “Ừ”, “Ok”, “Tùy”. Bạn hỏi có chuyện gì không, người ấy mỉm cười rất nhẹ: “Không sao đâu.” Mọi chuông báo động trong đầu bạn đồng loạt reo vang.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'think', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'sit', expr: 'sad', say: 'Không sao đâu.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Kiên nhẫn hỏi đến cùng',
          success: { stat: 'karma', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn ngồi xuống, nắm tay, hỏi lần thứ năm thật dịu dàng. Cuối cùng {partner} kể: hôm nay đã là một ngày rất tệ, về đến nơi lại thấy bạn cắm mặt vào điện thoại. Ôm nhau một lúc, mọi thứ ổn cả.',
              effects: { happy: 5, rel: { partner: 10 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'cry' } } },
            { text: 'Hỏi đến lần thứ năm thì “Không sao đâu” biến thành “Đã bảo không sao rồi mà!”. Bạn vẫn không biết mình sai ở đâu, nhưng chắc chắn là có sai.',
              effects: { happy: -4, rel: { partner: -5 } },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { partner: 'angry' } } }
          ] },
        { label: 'Mua trà sữa và một bó cúc họa mi',
          text: 'Bạn chưa biết mình có lỗi gì, nhưng trà sữa và hoa thì chưa bao giờ có lỗi. {partner} cầm bó hoa, cuối cùng cũng cười thật.',
          effects: { money: -250000, happy: 3, rel: { partner: 7 } },
          scene: { anim: 'love', fx: 'petals', npcAnim: { partner: 'love' } } },
        { label: 'Làm trò: nhảy điệu TikTok đang hot',
          outcomes: [
            { p: 0.6, text: 'Bạn nhảy điệu đang hot trên TikTok với độ dẻo của một khúc gỗ. {partner} cố giữ mặt lạnh được bảy giây rồi cười lăn ra ghế.',
              effects: { happy: 6, rel: { partner: 8 } },
              scene: { anim: 'dance', fx: 'music', npcAnim: { partner: 'laugh' } } },
            { p: 0.4, text: '“Người ta đang buồn mà còn nhảy nhót à?” Chọn sai thời điểm để hài hước. Bạn đứng hình giữa một động tác dang dở.',
              effects: { happy: -4, rel: { partner: -6 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { partner: 'angry' } } }
          ] },
        { label: 'Tin lời, đi ngủ',
          text: '“Không sao” nghĩa là có sao, ai cũng biết, trừ bạn. Bạn ngủ ngon lành, còn sáng hôm sau thì...',
          effects: { happy: -1, followUp: { id: 's_love_doi_lanh', delay: 0 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { partner: 'sad' } } }
      ]
    },
    {
      id: 's_love_doi_lanh', title: 'Chiến tranh lạnh', icon: '🧊', age: [15, 60], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Ba ngày rồi {partner} không nhắn tin, không gọi điện, chỉ âm thầm xem hết story của bạn. Điện thoại im lặng đến mức bạn kiểm tra wifi tới lần thứ mười.',
      scene: { loc: 'home', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'partner', anim: 'phone', expr: 'neutral' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Nấu một bữa thật ngon rồi mời sang ăn',
          outcomes: [
            { p: 0.7, text: 'Mùi trứng chiên hành thơm lừng. {partner} đến, ngồi xuống, gắp một miếng: “Mặn.” Nhưng vẫn ăn hết. Băng đã tan.',
              effects: { happy: 6, rel: { partner: 10 } },
              scene: { anim: 'cook', fx: 'steam', npcAnim: { partner: 'eat' } } },
            { p: 0.3, text: 'Bạn làm cháy chảo, khói bốc mù mịt. Hai người cùng lao vào cứu cái bếp rồi nhìn nhau... phì cười. Theo một cách nào đó, vẫn có tác dụng.',
              effects: { happy: 4, money: -200000, rel: { partner: 6 } },
              scene: { anim: 'scared', fx: 'smoke', npcAnim: { partner: 'laugh' } } }
          ] },
        { label: 'Viết một lá thư tay thật dài',
          text: 'Bạn viết ba trang giấy, kể những điều chưa bao giờ dám nói. Hôm sau, có tin nhắn đến: “Đọc rồi. Tối đi ăn lẩu.” Chỉ năm chữ mà bạn đọc đi đọc lại cả chục lần.',
          effects: { happy: 7, karma: 2, rel: { partner: 12 } },
          scene: { anim: 'study', fx: 'hearts', npcAnim: { partner: 'love' } } },
        { label: 'Tiếp tục cuộc chiến, xem ai lì hơn',
          outcomes: [
            { p: 0.5, text: 'Một tuần. Hai tuần. Cuối cùng hai người nói chuyện lại vì... phải chia tiền một món nợ chung. Mọi thứ trở lại như cũ, nhưng có gì đó đã nứt.',
              effects: { happy: -5, rel: { partner: -10 } },
              scene: { anim: 'sad', fx: 'sweat' } },
            { p: 0.5, text: '{partner} nhắn một tin rất dài, kết thúc bằng câu: “Mình nghĩ tụi mình nên dừng lại.” Không còn gì để cãi nữa.',
              effects: { happy: -14, removePerson: 'partner' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Nhờ hội bạn thân làm trung gian',
          outcomes: [
            { p: 0.6, text: 'Đám bạn bày một buổi “tình cờ” gặp nhau ở quán cà phê. Hai người ngượng ngùng chào nhau, rồi nói chuyện đến lúc quán đóng cửa.',
              effects: { happy: 5, rel: { partner: 8 } },
              scene: { loc: 'cafe', anim: 'talk', fx: 'sparkle', npcAnim: { partner: 'talk' } } },
            { p: 0.4, text: '“Chuyện hai đứa mà đi kể cho cả thiên hạ à?” Buổi hòa giải biến thành buổi cãi nhau công khai.',
              effects: { happy: -5, rel: { partner: -8 } },
              scene: { loc: 'cafe', anim: 'facepalm', fx: 'anger', npcAnim: { partner: 'angry' } } }
          ] }
      ]
    },

    // ======================= ARC 3: YÊU XA =======================
    {
      id: 's_love_xa_chia_xa', title: 'Tám trăm cây số', icon: '✈️', age: [18, 32], weight: 1,
      req: { has: ['partner'], married: false, notFlag: 's_love_xa' },
      text: '{partner} báo tin: được nhận vào một chương trình làm việc mơ ước ở thành phố khác, cách {city} gần tám trăm cây số. Vé máy bay đã đặt cho tuần sau. Người ấy hỏi khẽ: “Mình... vẫn tiếp tục chứ?”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'cloudy', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'partner', anim: 'talk', expr: 'sad', say: 'Mình vẫn tiếp tục chứ?' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Tất nhiên! Yêu xa thì đã sao',
          text: 'Bạn nắm tay {partner}: “Có video call, có vé máy bay giá rẻ, có mình.” Tuần sau, bạn tiễn người ấy ra sân bay, vẫy tay đến khi khuất bóng rồi mới cho phép mình khóc.',
          effects: { happy: 2, rel: { partner: 10 }, flag: 's_love_xa', followUp: { id: 's_love_xa_video', delay: 1 } },
          scene: { anim: 'hug', fx: 'tears', npcAnim: { partner: 'hug' } } },
        { label: 'Bỏ việc, khăn gói đi theo người ấy', req: { job: 'any' },
          outcomes: [
            { p: 0.5, text: 'Bạn nghỉ việc, khăn gói theo {partner} đến thành phố mới. Mất ba tháng mới tìm được việc, tiền tiết kiệm vơi dần, nhưng tối nào cũng được ăn cơm cùng nhau.',
              effects: { happy: 6, money: -15000000, job: 'fire', rel: { partner: 15 }, flag: ['s_love_xa', 's_love_xa_theo'], followUp: { id: 's_love_xa_quyet_dinh', delay: 2 } },
              scene: { loc: 'street', anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug' } } },
            { p: 0.5, text: 'Thành phố mới xa lạ, công việc mới áp lực, bạn bắt đầu trách {partner} vì mình đã hy sinh quá nhiều. Những trận cãi nhau ngày một dày.',
              effects: { happy: -6, money: -15000000, job: 'fire', rel: { partner: -6 }, flag: ['s_love_xa', 's_love_xa_theo'], followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { loc: 'street', anim: 'angry', fx: 'anger', npcAnim: { partner: 'sad' } } }
          ] },
        { label: 'Đề nghị chia tay cho nhẹ lòng',
          text: '“Mình không đủ mạnh mẽ để yêu xa.” {partner} gật đầu, mắt đỏ hoe. Hai người ngồi đến khi quán đóng cửa, lần cuối cùng.',
          effects: { happy: -10, removePerson: 'partner' },
          scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'cry' } } },
        { label: 'Năn nỉ người ấy đừng đi',
          outcomes: [
            { p: 0.4, text: '{partner} ở lại. Nhưng mỗi lần thấy bạn bè đăng ảnh thành công, người ấy lại im lặng rất lâu. Bạn giữ lại được một người, nhưng người ấy đánh mất một giấc mơ.',
              effects: { happy: 2, karma: -3, rel: { partner: -8 } },
              scene: { anim: 'hug', fx: 'sweat', npcAnim: { partner: 'sad' } } },
            { p: 0.6, text: '“Mình xin lỗi, mình phải đi.” Người ấy vẫn lên máy bay. Hai người hứa thử yêu xa, giọng chẳng ai chắc chắn.',
              effects: { happy: -4, rel: { partner: -3 }, flag: 's_love_xa', followUp: { id: 's_love_xa_video', delay: 1 } },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { partner: 'walk' } } }
          ] }
      ]
    },
    {
      id: 's_love_xa_video', title: 'Cuộc gọi lúc nửa đêm', icon: '📹', age: [18, 34], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Một năm yêu xa. Lịch của hai người lệch nhau như hai múi giờ: bạn tan làm thì {partner} tăng ca, bạn rảnh thì người ấy đã ngủ. Đêm nay, 0 giờ 30, cuộc gọi video lại mở đầu bằng câu quen thuộc: “Hôm nay mệt quá...”',
      scene: { loc: 'bedroom', time: 'night', weather: 'rain', anim: 'phone', expr: 'sleepy',
        npcs: [{ role: 'partner', anim: 'phone', expr: 'sleepy', say: 'Hôm nay mệt quá...' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Bay ra thăm bất ngờ cuối tuần này',
          text: 'Bạn giả vờ bận cả cuối tuần, lén đặt vé máy bay đêm thứ Sáu, ôm theo hộp bánh người ấy thích nhất. Tim đập thình thịch suốt chuyến bay.',
          effects: { money: -3500000, happy: 4, followUp: { id: 's_love_xa_bat_ngo', delay: 0 } },
          scene: { anim: 'cheer', fx: 'idea' } },
        { label: 'Gửi quà qua Shopee kèm thư tay',
          text: 'Ba ngày sau, {partner} nhận được thùng hàng: chiếc gối ôm in mặt bạn, hộp trà và lá thư “Ráng lên, còn có mình”. Người ấy gửi lại tấm ảnh ôm cái gối ngủ ngon lành.',
          effects: { money: -450000, happy: 4, rel: { partner: 8 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { partner: 'love' } } },
        { label: 'Ngủ quên khi đang gọi',
          outcomes: [
            { p: 0.5, text: 'Bạn ngủ gục giữa câu chuyện, điện thoại vẫn sáng. Sáng ra thấy tin nhắn: “Ngáy to quá, nhưng nghe cũng đỡ nhớ.”',
              effects: { happy: 3, health: 1, rel: { partner: 3 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'sleep', fx: 'zzz', npcAnim: { partner: 'laugh' } } },
            { p: 0.5, text: '{partner} kể một chuyện quan trọng suốt cả tiếng, còn bạn ngủ từ phút thứ năm. Sáng ra chỉ có một tin: “Thôi, khỏi nghe nữa.” Tám trăm cây số bỗng thấy xa hơn.',
              effects: { happy: -4, rel: { partner: -8 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'sleep', fx: 'heartbreak', npcAnim: { partner: 'sad' } } }
          ] },
        { label: 'Gợi ý: “Hay mình bớt gọi cho đỡ mệt?”',
          outcomes: [
            { p: 0.5, text: 'Hai người thống nhất mỗi tuần gọi ba lần. Ít hơn nhưng chất lượng hơn, cuộc gọi nào cũng háo hức.',
              effects: { happy: 2, rel: { partner: 3 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { partner: 'nod' } } },
            { p: 0.5, text: 'Ba lần một tuần thành một lần, rồi thành tin nhắn chúc ngủ ngon cho có. Một hôm, bạn thấy {partner} đăng ảnh đi ăn với một người lạ. Bạn quyết định bay ra xem tận mắt.',
              effects: { happy: -6, money: -3500000, rel: { partner: -6 }, flag: 's_love_xa_nghi', followUp: { id: 's_love_xa_bat_ngo', delay: 0 } },
              scene: { anim: 'think', fx: 'question', npcAnim: { partner: 'phone' } } }
          ] }
      ]
    },
    {
      id: 's_love_xa_bat_ngo', title: 'Chuyến bay bất ngờ', icon: '🛬', age: [18, 34], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Bạn đáp chuyến bay sớm, bắt Grab thẳng tới chỗ làm của {partner}, tay ôm hộp quà. Từ bên kia đường, bạn thấy người ấy bước ra, cười rất tươi với một người lạ, hai người cầm chung một túi đồ ăn.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'partner', anim: 'laugh' }, { role: 'stranger', age: 28, anim: 'talk', say: 'Mai lại ăn trưa chung nha!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Bước thẳng tới, chìa hộp quà ra',
          outcomes: [
            { p: 0.6, text: '{partner} sững người rồi hét lên, nhào tới ôm bạn chặt cứng. Người lạ kia hóa ra là đồng nghiệp đã có gia đình, còn hào hứng chụp ảnh giúp hai người. Bạn thấy mình hơi ngốc, nhưng hạnh phúc.',
              effects: { happy: 10, rel: { partner: 12 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug', stranger: 'clap' } } },
            { p: 0.4, text: '{partner} nhìn thấy bạn, nụ cười tắt ngấm. Người lạ kia lặng lẽ rút tay về. Không ai cần giải thích nữa; hộp quà rơi xuống vỉa hè.',
              effects: { happy: -14, removePerson: 'partner' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'scared', stranger: 'walk' } } }
          ] },
        { label: 'Đứng từ xa, gọi điện thử',
          outcomes: [
            { p: 0.5, text: 'Bạn gọi. {partner} nghe ngay: “Đang đi mua đồ ăn cho cả phòng nè, nhớ quá!” rồi quay sang người kia nói gì đó, cả hai cùng cười. Bạn thở phào, băng qua đường.',
              effects: { happy: 8, rel: { partner: 8 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'phone', fx: 'sparkle', npcAnim: { partner: 'phone' } } },
            { p: 0.5, text: '{partner} nhìn màn hình, tắt máy, rồi nhắn: “Đang họp, tối gọi nha.” Bạn đứng bên kia đường, thấy rõ người ấy chẳng họp hành gì cả.',
              effects: { happy: -8, rel: { partner: -15 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'sad', fx: 'question', npcAnim: { partner: 'phone' } } }
          ] },
        { label: 'Ghen điên lên, xông tới làm ầm',
          outcomes: [
            { p: 0.5, text: 'Bạn lớn tiếng giữa phố. Người lạ kia hoảng hốt giơ tay: “Đồng nghiệp thôi, tôi có gia đình rồi!” {partner} xấu hổ đến mức không nói nổi một lời. Chuyến thăm bất ngờ thành thảm họa.',
              effects: { happy: -6, karma: -3, rel: { partner: -14 }, followUp: { id: 's_love_xa_quyet_dinh', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { partner: 'facepalm', stranger: 'scared' } } },
            { p: 0.5, text: 'Cơn ghen của bạn hóa ra có lý. {partner} không chối, chỉ nói khẽ: “Mình xin lỗi, xa quá, mình cô đơn quá.” Chiều hôm đó bạn bay về, một mình.',
              effects: { happy: -14, removePerson: 'partner' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'sad', stranger: 'walk' } } }
          ] }
      ]
    },
    {
      id: 's_love_xa_quyet_dinh', title: 'Về chung một nhà?', icon: '🏠', age: [19, 36], chainOnly: true,
      req: { has: ['partner'], married: false },
      text: 'Hai năm kể từ ngày {partner} xách vali lên đường. Qua bao chuyến bay đêm, cuộc gọi lỡ và những lần giận dỗi, hai người vẫn còn đây. Tối nay, người ấy hỏi điều cả hai né tránh bấy lâu: “Rốt cuộc, mình sẽ sống ở đâu, với nhau thế nào?”',
      scene: { loc: 'park', time: 'night', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'partner', anim: 'talk', say: 'Mình sẽ sống ở đâu, với nhau thế nào?' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Quỳ xuống, chìa ra chiếc nhẫn',
          success: { stat: 'happy', base: 0.4, scale: 0.5 },
          outcomes: [
            { text: '{partner} lấy tay che miệng, gật đầu lia lịa giữa tiếng vỗ tay của mấy cặp đôi gần đó. Ba tháng sau, hai bạn về chung một nhà, khép lại những năm tháng yêu xa.',
              effects: { happy: 15, money: -60000000, rel: { partner: 15 }, marry: true },
              scene: { loc: 'wedding', time: 'dusk', anim: 'love', fx: 'fireworks', npcAnim: { partner: 'love' } } },
            { text: '{partner} nắm tay kéo bạn đứng dậy: “Chưa phải lúc. Mình còn chưa biết sẽ sống ở đâu mà.” Chiếc nhẫn quay về hộp, chờ một ngày khác.',
              effects: { happy: -5, rel: { partner: 2 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { partner: 'shake' } } }
          ] },
        { label: 'Bạn sẽ chuyển đến thành phố của người ấy',
          text: 'Bạn nộp đơn nghỉ việc, gói cả cuộc sống vào ba thùng các-tông. Ngày bạn đến, {partner} đứng đợi ở sân bay với tấm bảng viết tay: “Chào mừng về nhà.”',
          effects: { happy: 8, money: -20000000, job: 'fire', rel: { partner: 15 } },
          scene: { loc: 'street', anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug' } } },
        { label: 'Thuyết phục người ấy quay về',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: '{partner} đồng ý về {city}. Phải mất một thời gian để người ấy quen lại nhịp sống cũ, nhưng mỗi sáng thức dậy có nhau là đủ.',
              effects: { happy: 8, rel: { partner: 6 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug' } } },
            { text: '“Tại sao lúc nào cũng là mình phải hy sinh?” Câu hỏi treo lơ lửng, và hai người chia tay vào một sáng mưa.',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'cry', weather: 'rain', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Thừa nhận: mình đã mệt rồi',
          text: 'Bạn nói ra điều đã nghĩ suốt nhiều tháng. {partner} khóc, rồi gật đầu: “Mình cũng vậy.” Hai người chia tay, không ai có lỗi, chỉ có khoảng cách.',
          effects: { happy: -10, karma: 1, removePerson: 'partner' },
          scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'cry' } } }
      ]
    },

    // ======================= ARC 4: RA MẮT NHÀ NGƯỜI YÊU =======================
    {
      id: 's_love_ra_mat_loi_moi', title: 'Lời mời cơm Chủ nhật', icon: '📩', age: [22, 38], weight: 1,
      req: { has: ['partner'], married: false, notFlag: 's_love_ra_mat' },
      text: '{partner} nhắn: “Chủ nhật này về nhà ăn cơm nhé. Bố mẹ muốn gặp.” Kèm theo một danh sách “lưu ý”: bố thích uống rượu, mẹ ghét người ăn mặc lôi thôi, và tuyệt đối đừng nhắc đến đội bóng bố ghét.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'phone', say: 'Chủ nhật về ra mắt bố mẹ nhé!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Mua giỏ quà sang trọng, cháy nửa tháng lương',
          text: 'Bạn mua giỏ trái cây nhập khẩu, hộp sâm và chai rượu ngoại. Ví thủng một lỗ to, nhưng trông bạn chỉn chu như đi phỏng vấn.',
          effects: { money: -6000000, happy: 2, flag: 's_love_ra_mat', followUp: { id: 's_love_ra_mat_bua_com', delay: 0 } },
          scene: { loc: 'market', anim: 'cheer', fx: 'money', npcAnim: { partner: 'clap' } } },
        { label: 'Mang đặc sản quê nhà làm quà',
          text: 'Bạn xách theo túi chè búp, bánh đa mẹ gửi lên từ quê. Quà mộc mạc nhưng gói ghém kỹ càng, đầy tình cảm.',
          effects: { money: -500000, karma: 2, flag: 's_love_ra_mat', followUp: { id: 's_love_ra_mat_bua_com', delay: 0 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { partner: 'love' } } },
        { label: 'Tập trước kịch bản trả lời “phỏng vấn”',
          text: 'Bạn soạn hẳn file “100 câu hỏi bố mẹ người yêu hay hỏi”, đứng trước gương tập cả tuần. {partner} nhìn mà vừa thương vừa buồn cười.',
          effects: { smarts: 2, happy: 1, rel: { partner: 4 }, flag: 's_love_ra_mat', followUp: { id: 's_love_ra_mat_bua_com', delay: 0 } },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { partner: 'laugh' } } },
        { label: 'Lấy cớ bận, hẹn dịp khác',
          text: '{partner} im lặng một lúc rồi nhắn “Ừ”. Một chữ “ừ” nặng hơn cả tấn. Có vẻ “dịp khác” sẽ khó hơn dịp này nhiều.',
          effects: { happy: -3, rel: { partner: -10 } },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { partner: 'sad' } } }
      ]
    },
    {
      id: 's_love_ra_mat_bua_com', title: 'Bữa cơm thử thách', icon: '🍚', age: [20, 40], chainOnly: true,
      req: { has: ['partner'] },
      text: 'Mâm cơm sáu món bày giữa nhà. Bố {partner} rót cho bạn chén rượu đầy, mẹ {partner} gắp cho bạn miếng thịt mỡ to nhất rồi hỏi nhẹ như không: “Thế cháu lương tháng được bao nhiêu?” Cả mâm cơm im phăng phắc.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'eat', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'eat' }, { role: 'relative', gender: 'f', age: 54, anim: 'talk', say: 'Thế cháu lương tháng được bao nhiêu?' }, { role: 'stranger', gender: 'm', age: 58, anim: 'drink', say: 'Uống với bác chén này!' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Nói thật mức lương, kèm kế hoạch tương lai',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn nói rõ con số, rồi kể kế hoạch tiết kiệm, mua nhà, học thêm. Mẹ {partner} gật gù, bố {partner} vỗ vai bạn: “Được, thật thà là được.”',
              effects: { happy: 6, karma: 2, rel: { partner: 8 }, followUp: { id: 's_love_ra_mat_dong_y', delay: 1 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { relative: 'nod', stranger: 'clap', partner: 'love' } } },
            { text: 'Mẹ {partner} khẽ nhíu mày khi nghe con số, rồi quay sang gắp rau: “Ừ, thế cũng... được.” Chữ “được” kéo dài đến mức bạn thấy lạnh gáy.',
              effects: { happy: -4, followUp: { id: 's_love_ra_mat_phan_doi', delay: 1 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { relative: 'shrug', stranger: 'drink' } } }
          ] },
        { label: 'Cạn chén với bố người yêu',
          outcomes: [
            { p: 0.5, text: 'Bạn cạn chén thứ nhất, thứ hai, rồi thứ năm. Bố {partner} cười khà khà: “Được! Uống được thì làm được!” Bạn không nhớ mình về bằng cách nào, nhưng nghe kể đã hát tặng cả nhà một bài.',
              effects: { happy: 5, health: -3, followUp: { id: 's_love_ra_mat_dong_y', delay: 1 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { stranger: 'laugh', relative: 'facepalm', partner: 'laugh' } } },
            { p: 0.5, text: 'Đến chén thứ ba bạn đã đỏ như gấc, chén thứ tư thì gục xuống mâm. Mẹ {partner} lắc đầu: “Tửu lượng thế này thì sau này lo được việc gì.”',
              effects: { happy: -5, health: -4, followUp: { id: 's_love_ra_mat_phan_doi', delay: 1 } },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { relative: 'shake', partner: 'facepalm' } } }
          ] },
        { label: 'Xắn tay áo xin rửa bát',
          text: 'Ăn xong, bạn giành rửa bát, lau mâm, quét nhà. Mẹ {partner} đứng ở cửa bếp nhìn mãi, rồi thì thầm với con: “Đứa này được, chịu khó.”',
          effects: { happy: 4, karma: 3, rel: { partner: 6 }, followUp: { id: 's_love_ra_mat_dong_y', delay: 1 } },
          scene: { anim: 'cook', fx: 'bubbles', npcAnim: { relative: 'nod', partner: 'love' } } },
        { label: 'Pha trò cho không khí bớt căng',
          outcomes: [
            { p: 0.5, text: 'Câu đùa “lương cháu đủ nuôi... một con mèo” khiến bố {partner} bật cười sặc cả rượu. Bữa cơm từ đó rôm rả hẳn.',
              effects: { happy: 5, followUp: { id: 's_love_ra_mat_dong_y', delay: 1 } },
              scene: { anim: 'laugh', fx: 'music', npcAnim: { stranger: 'laugh', relative: 'laugh' } } },
            { p: 0.5, text: 'Câu đùa rơi vào im lặng tuyệt đối. Chỉ còn tiếng quạt trần quay vù vù. {partner} đá nhẹ chân bạn dưới gầm bàn.',
              effects: { happy: -4, followUp: { id: 's_love_ra_mat_phan_doi', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'idle', partner: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_love_ra_mat_dong_y', title: 'Bố mẹ gật đầu', icon: '💐', age: [21, 41], chainOnly: true,
      req: { has: ['partner'], married: false },
      text: 'Mấy tháng sau bữa cơm ra mắt, mẹ {partner} gọi điện cho bạn, lần đầu tiên gọi trực tiếp: “Hai đứa tính bao giờ cưới? Bác xem ngày rồi, cuối năm đẹp lắm.” {partner} đứng bên cạnh, cười tủm tỉm.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'partner', anim: 'laugh' }, { role: 'relative', gender: 'f', age: 55, anim: 'phone', say: 'Bác xem ngày rồi, cuối năm nhé!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Dạ! Cháu xin phép cưới luôn ạ',
          text: 'Bạn trả lời không chút do dự. Hai gia đình gặp mặt, dạm ngõ, ăn hỏi, chọn ngày. Mọi thứ diễn ra nhanh như một giấc mơ đẹp.',
          effects: { happy: 8, rel: { partner: 10 }, followUp: { id: 's_love_ra_mat_cuoi', delay: 0 } },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { partner: 'hug', relative: 'laugh' } } },
        { label: 'Xin thêm thời gian lo tài chính',
          text: 'Bạn thật thà nói muốn có chút vốn liếng trước khi cưới. Mẹ {partner} khen bạn chín chắn, hẹn sang năm. {partner} hơi tiu nghỉu, nhưng hiểu.',
          effects: { happy: 2, smarts: 1, rel: { partner: -3 }, followUp: { id: 's_love_ra_mat_cuoi', delay: 1 } },
          scene: { anim: 'bow', fx: 'idea', npcAnim: { relative: 'nod', partner: 'shrug' } } },
        { label: 'Hoảng hốt: mình chưa sẵn sàng!',
          outcomes: [
            { p: 0.5, text: 'Bạn lắp bắp xin khất. {partner} nhìn bạn rất lâu: “Vậy bao giờ mới sẵn sàng?” Câu hỏi không có lời đáp.',
              effects: { happy: -6, rel: { partner: -12 } },
              scene: { anim: 'scared', fx: 'question', npcAnim: { partner: 'sad' } } },
            { p: 0.5, text: 'Bạn xin khất, và {partner} hiểu đó chính là câu trả lời. Một tuần sau, người ấy trả lại chìa khóa nhà bạn: “Mình không chờ được nữa.”',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] }
      ]
    },
    {
      id: 's_love_ra_mat_phan_doi', title: 'Không môn đăng hộ đối', icon: '🚧', age: [21, 41], chainOnly: true,
      req: { has: ['partner'], married: false },
      text: 'Gần một năm sau bữa cơm ra mắt, {partner} vẫn chưa dám đưa bạn về nhà lần nữa. Tối nay người ấy thú nhận: bố mẹ chê bạn “không môn đăng hộ đối”, còn giới thiệu cho người ấy một đối tượng khác “con nhà gia giáo, lương cao”.',
      scene: { loc: 'park', time: 'night', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'partner', anim: 'cry', say: 'Bố mẹ bắt mình đi xem mắt...' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Xin gặp riêng bố mẹ người ấy',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đến một mình, ngồi nói chuyện thật lòng suốt buổi chiều, không giấu một khó khăn nào. Cuối buổi, mẹ {partner} rót cho bạn chén trà: “Thôi, hai đứa thương nhau thì bố mẹ chiều.”',
              effects: { happy: 10, karma: 3, rel: { partner: 10 }, followUp: { id: 's_love_ra_mat_cuoi', delay: 1 } },
              scene: { loc: 'home', anim: 'bow', fx: 'sparkle', npcAnim: { partner: 'cry' } } },
            { text: 'Bố {partner} nghe hết rồi lắc đầu: “Bác vẫn chưa yên tâm.” Hai người hứa sẽ kiên nhẫn, nhưng con đường phía trước còn lắm chông gai.',
              effects: { happy: -5, rel: { partner: 5 } },
              scene: { loc: 'home', anim: 'sad', fx: 'sweat', npcAnim: { partner: 'sad' } } }
          ] },
        { label: 'Chứng minh bằng sự nghiệp',
          text: 'Bạn lao vào làm việc như điên, nhận thêm dự án, tăng ca mỗi tối. Một năm sau, bạn mang về bảng lương mới và lời khen của sếp. Mẹ {partner} bắt đầu hỏi han bạn nhiều hơn.',
          effects: { money: 30000000, health: -6, smarts: 2, rel: { partner: 6 }, followUp: { id: 's_love_ra_mat_cuoi', delay: 2 } },
          scene: { loc: 'office', anim: 'type', fx: 'money' } },
        { label: 'Chia tay để người ấy khỏi khó xử',
          text: '“Mình không muốn cậu phải chọn giữa mình và bố mẹ.” {partner} khóc nấc, nhưng không giữ bạn lại. Có những cuộc tình kết thúc không phải vì hết thương.',
          effects: { happy: -12, karma: 2, removePerson: 'partner' },
          scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'cry' } } },
        { label: 'Rủ người ấy đăng ký kết hôn luôn',
          outcomes: [
            { p: 0.4, text: 'Hai bạn lặng lẽ ra phường đăng ký kết hôn, rồi về quỳ trước bố mẹ {partner}. Bà khóc, ông im lặng, nhưng cuối cùng vẫn đỡ hai đứa đứng dậy.',
              effects: { happy: 8, rel: { partner: 10 }, marry: true },
              scene: { loc: 'home', anim: 'bow', fx: 'tears', npcAnim: { partner: 'cry' } } },
            { p: 0.6, text: '{partner} lắc đầu: “Mình không thể làm bố mẹ đau lòng như thế.” Lời đề nghị bốc đồng khiến người ấy thấy bạn chưa đủ chín chắn.',
              effects: { happy: -6, rel: { partner: -10 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { partner: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_love_ra_mat_cuoi', title: 'Ngày về chung nhà', icon: '💍', age: [21, 45], chainOnly: true,
      req: { has: ['partner'], married: false },
      text: 'Ngày ấy cuối cùng cũng đến. Rạp cưới đỏ rực đầu hẻm, cổng hoa kết bóng bay, loa phát nhạc từ 6 giờ sáng. {partner} rạng rỡ trong bộ đồ cưới, nắm tay bạn run run. Bố mẹ hai bên ngồi cạnh nhau, cười như chưa từng có buổi ra mắt căng thẳng nào.',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'love', expr: 'love',
        npcs: [{ role: 'partner', anim: 'love', say: 'Từ nay về chung một nhà nhé!' }, { role: 'relative', gender: 'f', age: 55, anim: 'clap' }, { role: 'crowd', anim: 'clap' }], fx: 'petals', shot: 'wide' },
      choices: [
        { label: 'Tiệc cưới linh đình, mời cả xóm',
          text: 'Ba mươi mâm cỗ, ban nhạc sống, MC hài hước. Phong bì mừng cưới bù lại phần lớn chi phí, và cả xóm nhắc mãi về đám cưới vui nhất năm.',
          effects: { happy: 14, money: -80000000, rel: { partner: 10 }, marry: true },
          scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { all: 'clap', partner: 'love' } } },
        { label: 'Cưới nhỏ, chỉ người thân',
          text: 'Một đám cưới nhỏ trong sân nhà, chỉ hai họ và vài người bạn thân. Không cầu kỳ, nhưng ai cũng rưng rưng.',
          effects: { happy: 12, karma: 2, money: -30000000, rel: { partner: 8 }, marry: true },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug', relative: 'cry' } } },
        { label: 'Phát biểu cảm ơn bố mẹ hai bên',
          text: 'Bạn cầm micro, định nói vài câu, nhưng đến chữ “cảm ơn bố mẹ” thì nghẹn lại. Cả rạp cưới lặng đi rồi vỗ tay rất lâu. Mẹ {partner} lau nước mắt, nắm chặt tay bạn.',
          effects: { happy: 12, karma: 3, money: -50000000, rel: { partner: 10, mother: 8, father: 8 }, marry: true },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { all: 'clap', relative: 'cry' } } }
      ]
    },

    // ======================= ARC 5: NGƯỜI CŨ QUAY LẠI =======================
    {
      id: 's_love_cu_dam_cuoi', title: 'Chung bàn với người cũ', icon: '🥂', age: [21, 45], weight: 1.1,
      req: { has: ['ex'], notFlag: 's_love_cu' },
      text: 'Đám cưới đứa bạn thân, bạn được xếp ngồi... đúng bàn với {ex}. Người cũ vẫn cười kiểu ấy, vẫn gắp đồ ăn cho người bên cạnh. MC còn hồn nhiên mời “các cặp đôi trong khán phòng” lên sân khấu chơi trò chơi.',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'ex', anim: 'eat', say: 'Lâu rồi không gặp nhỉ?' }, { role: 'crowd', anim: 'clap' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Chào hỏi tự nhiên như bạn cũ',
          text: 'Hai người nói chuyện về công việc, về đám bạn cũ, cười vài lần. Lúc ra về, {ex} xin lại số Zalo “để tiện liên lạc”. Bạn đưa, tim đập hơi lệch nhịp.',
          effects: { happy: 3, rel: { ex: 8 }, flag: 's_love_cu', followUp: { id: 's_love_cu_nhan_dem', delay: 0 } },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { ex: 'laugh' } } },
        { label: 'Xin đổi bàn, tránh mặt cho lành',
          text: 'Bạn viện cớ ngồi với hội đồng nghiệp, ăn vội rồi về sớm. Bình yên, nhưng cả tối bạn cứ ngoái lại nhìn chiếc bàn ấy.',
          effects: { happy: -2, flag: 's_love_cu' },
          scene: { anim: 'walk', fx: 'sweat', npcAnim: { ex: 'sad' } } },
        { label: 'Lên sân khấu hát tặng cô dâu chú rể',
          outcomes: [
            { p: 0.6, text: 'Bạn hát một bản tình ca thật sâu, ánh mắt vô tình lướt qua bàn của {ex}. Cả rạp cưới vỗ tay. Tối đó có tin nhắn mới: “Vẫn hát hay như ngày xưa.”',
              effects: { happy: 6, looks: 1, rel: { ex: 6 }, flag: 's_love_cu', followUp: { id: 's_love_cu_nhan_dem', delay: 0 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { crowd: 'clap', ex: 'clap' } } },
            { p: 0.4, text: 'Đến đoạn cao trào, giọng bạn lạc hẳn sang một tông khác. Cả rạp cưới cười nghiêng ngả, {ex} cười to nhất. Ít ra cô dâu chú rể có thêm một kỷ niệm khó quên.',
              effects: { happy: -3, rel: { ex: 3 }, flag: 's_love_cu' },
              scene: { anim: 'sing', fx: 'sweat', npcAnim: { crowd: 'laugh', ex: 'laugh' } } }
          ] },
        { label: 'Uống hơi nhiều, nói lời thật lòng',
          outcomes: [
            { p: 0.5, text: 'Ly thứ năm, bạn buột miệng: “Hồi đó... mình xin lỗi.” {ex} khựng lại, rồi khẽ nói: “Mình cũng vậy.” Có gì đó vừa được tháo gỡ.',
              effects: { happy: 4, health: -2, rel: { ex: 10 }, flag: 's_love_cu', followUp: { id: 's_love_cu_nhan_dem', delay: 0 } },
              scene: { anim: 'drink', fx: 'tears', npcAnim: { ex: 'sad' } } },
            { p: 0.5, text: 'Bạn kể lể chuyện cũ to đến mức cả bàn nghe thấy. Sáng hôm sau, nhóm chat lớp đầy ảnh bạn ôm cột rạp cưới. Không ai quên được.',
              effects: { happy: -6, health: -3, flag: 's_love_cu' },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { ex: 'facepalm', crowd: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_love_cu_nhan_dem', title: 'Tin nhắn lúc 1 giờ 17', icon: '🌙', age: [21, 45], chainOnly: true,
      req: { has: ['ex'] },
      text: 'Ba tuần sau đám cưới, 1 giờ 17 phút sáng, điện thoại sáng lên. {ex}: “Mình vừa chia tay người ta. Tự nhiên chỉ nghĩ đến cậu. Nói chuyện chút được không?”',
      scene: { loc: 'bedroom', time: 'night', weather: 'rain', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'ex', anim: 'phone', expr: 'sad', say: 'Nói chuyện chút được không?' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Nhắn lại, tâm sự đến sáng',
          text: 'Hai người nhắn đến 4 giờ sáng, kể hết những điều ngày xưa chưa kịp nói. Trước khi ngủ, {ex} hỏi: “Cuối tuần cà phê nhé, quán cũ?”',
          effects: { happy: 4, health: -2, rel: { ex: 10 }, followUp: { id: 's_love_cu_ca_phe', delay: 0 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { ex: 'phone' } } },
        { label: 'Trả lời: “Mình có người yêu rồi”', req: { has: ['partner'] },
          text: 'Bạn nhắn ngắn gọn: “Mình có người yêu rồi. Chúc cậu sớm ổn.” rồi tắt máy, mở tin nhắn chúc ngủ ngon của người yêu hiện tại ra đọc lại. Lòng nhẹ tênh.',
          effects: { happy: 3, karma: 4, rel: { ex: -3, partner: 5 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { ex: 'sad' } } },
        { label: 'Chặn luôn cho dứt điểm',
          text: 'Bạn bấm chặn, xóa luôn đoạn chat cũ. Phải một lúc lâu mới ngủ lại được, nhưng sáng ra thấy mình trưởng thành hơn hẳn.',
          effects: { happy: 1, smarts: 1, rel: { ex: -10 }, flag: 's_love_cu_khep_lai' },
          scene: { anim: 'shake', fx: 'flash', npcAnim: { ex: 'sad' } } },
        { label: 'Đọc rồi để đó, không trả lời',
          text: 'Bạn úp điện thoại xuống, nằm nhìn trần nhà đến sáng. Tin nhắn vẫn nằm đó, chữ “Đã xem” lạnh lùng như một câu trả lời.',
          effects: { happy: -3, health: -1, followUp: { id: 's_love_cu_thiep_hong', delay: 2 } },
          scene: { anim: 'sleep', fx: 'question', npcAnim: { ex: 'sad' } } }
      ]
    },
    {
      id: 's_love_cu_ca_phe', title: 'Quán cũ, người cũ', icon: '☕', age: [21, 45], chainOnly: true,
      req: { has: ['ex'] },
      text: 'Quán cà phê ngày xưa vẫn vậy, chỉ có giá nước đã tăng gấp đôi. {ex} đến muộn mười phút như mọi khi, ngồi xuống và nói thẳng: “Mình nghĩ mãi rồi. Hay là... mình thử lại?”',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'drink', expr: 'surprised',
        npcs: [{ role: 'ex', anim: 'talk', say: 'Hay là... mình thử lại?' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Cho nhau thêm một cơ hội', req: { lacks: ['partner', 'spouse'] },
          outcomes: [
            { p: 0.5, text: 'Hai người hẹn hò lại vài tuần, đẹp như phim. Rồi một tối, hai bạn cãi nhau đúng vì cái lý do năm xưa đã chia tay. Hóa ra có những thứ không đổi. Lần này, cả hai buông tay nhẹ nhàng hơn.',
              effects: { happy: -3, smarts: 2, rel: { ex: -4 }, flag: 's_love_cu_khep_lai', followUp: { id: 's_love_cu_thiep_hong', delay: 2 } },
              scene: { anim: 'shrug', fx: 'heartbreak', npcAnim: { ex: 'sad' } } },
            { p: 0.5, text: 'Đang nói chuyện vui, {ex} bỗng ngập ngừng hỏi vay {money:30000000} để “xoay chút việc làm ăn”. Bạn nhìn ly cà phê, chợt hiểu vì sao người cũ quay lại.',
              effects: { happy: -6, smarts: 1, rel: { ex: -12 }, flag: 's_love_cu_khep_lai' },
              scene: { anim: 'facepalm', fx: 'money', npcAnim: { ex: 'shrug' } } }
          ] },
        { label: 'Nói lời tạm biệt tử tế lần cuối',
          text: 'Bạn mỉm cười: “Mình đã từng rất thương cậu. Nhưng mình của bây giờ khác rồi.” {ex} gật đầu, hai người ôm nhau thật nhẹ ở cửa quán. Lần chia tay này, không ai khóc.',
          effects: { happy: 5, karma: 3, rel: { ex: 6 }, flag: 's_love_cu_khep_lai', followUp: { id: 's_love_cu_thiep_hong', delay: 2 } },
          scene: { anim: 'hug', fx: 'petals', npcAnim: { ex: 'hug' } } },
        { label: 'Đang có người yêu mà vẫn gật đầu', req: { has: ['partner'] },
          outcomes: [
            { p: 0.6, text: 'Bạn bắt cá hai tay được đúng mười hai ngày. Rồi người yêu hiện tại thấy tin nhắn của {ex} hiện trên màn hình khóa. Chỉ trong một buổi tối, bạn mất cả hai người.',
              effects: { happy: -14, karma: -10, rel: { ex: -10 }, removePerson: 'partner' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { ex: 'walk' } } },
            { p: 0.4, text: 'Tối đó nhận được tin nhắn “Về đến nhà chưa, nhớ ăn tối nha” của người yêu hiện tại, bạn thấy mình tệ không chịu nổi. Bạn nhắn cho {ex}: “Mình xin lỗi, không được.”',
              effects: { happy: -4, karma: -3, rel: { ex: -6, partner: 3 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { ex: 'sad' } } }
          ] },
        { label: 'Cười trừ, lái sang chuyện thời tiết',
          text: '“Dạo này mưa nhiều nhỉ.” {ex} hiểu ý, cười buồn, khuấy ly cà phê đã tan hết đá. Hai người ngồi thêm một lúc rồi ai về nhà nấy.',
          effects: { happy: -1, rel: { ex: -2 }, followUp: { id: 's_love_cu_thiep_hong', delay: 2 } },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { ex: 'sad' } } }
      ]
    },
    {
      id: 's_love_cu_thiep_hong', title: 'Thiệp hồng từ người cũ', icon: '💌', age: [22, 48], chainOnly: true,
      req: { has: ['ex'] },
      text: 'Hai năm sau, {ex} mang đến tận nhà một tấm thiệp cưới đỏ thắm, tên in nhũ vàng. Mặt sau có dòng chữ viết tay: “Mong cậu đến. Cảm ơn vì tất cả.”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'ex', anim: 'wave', say: 'Mong cậu đến nhé!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đến dự, mừng một phong bì thật dày',
          text: 'Bạn đến, chúc phúc bằng cả tấm lòng, bắt tay người bạn đời của {ex}. Ra về, bạn thấy nhẹ nhõm như vừa đặt xuống chiếc ba lô đã mang theo nhiều năm.',
          effects: { money: -2000000, happy: 6, karma: 5, rel: { ex: 10 } },
          scene: { loc: 'wedding', time: 'dusk', anim: 'clap', fx: 'petals', npcAnim: { ex: 'bow' } } },
        { label: 'Chuyển khoản mừng cưới kèm lời chúc',
          text: 'Bạn chuyển khoản {money:1000000}, nhắn: “Chúc hạnh phúc nhé.” {ex} thả tim. Thế là đủ, không cần gì hơn.',
          effects: { money: -1000000, happy: 3, karma: 2, rel: { ex: 4 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { ex: 'nod' } } },
        { label: 'Không đi, cất tấm thiệp vào ngăn kéo',
          text: 'Tấm thiệp nằm im trong ngăn kéo, cạnh vài tấm ảnh cũ. Có những cánh cửa, chỉ cần khép lại nhẹ nhàng là đủ.',
          effects: { happy: -2 },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { ex: 'walk' } } },
        { label: 'Dắt người yêu hiện tại đi dự cho “ngầu”', req: { has: ['partner'] },
          outcomes: [
            { p: 0.5, text: 'Bạn khoác tay người yêu bước vào rạp cưới, lưng thẳng như diễn viên. {ex} cười rất thật, chúc hai bạn sớm theo sau. Hóa ra chẳng ai cần chứng minh gì cả.',
              effects: { happy: 5, rel: { partner: 5, ex: 4 } },
              scene: { loc: 'wedding', time: 'dusk', anim: 'love', fx: 'hearts', npcAnim: { ex: 'clap' } } },
            { p: 0.5, text: 'Người yêu hiện tại cả buổi nhìn bạn dò xét: “Sao cứ ngó lên sân khấu thế?” Bữa tiệc kết thúc bằng một trận cãi nhau trên đường về.',
              effects: { happy: -5, rel: { partner: -8 } },
              scene: { loc: 'wedding', time: 'dusk', anim: 'facepalm', fx: 'anger', npcAnim: { ex: 'idle' } } }
          ] }
      ]
    },

    // ======================= STANDALONE =======================
    {
      id: 's_love_tang_12', title: 'Người ở tầng 12', icon: '🛗', age: [22, 38], weight: 0.9,
      req: { job: true, lacks: ['partner', 'spouse'] },
      text: 'Ba tháng nay, sáng nào bạn cũng đi chung thang máy với {stranger}, người làm ở công ty tầng 12, lúc nào cũng cầm ly cà phê muối và một cuốn sách đọc dở. Hôm nay thang máy kẹt cứng giữa tầng 7 và tầng 8, chỉ còn hai người.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'idle', expr: 'love',
        npcs: [{ role: 'stranger', age: 27, anim: 'phone', say: 'Ơ... thang máy kẹt rồi à?' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Bắt chuyện về cuốn sách người ấy cầm',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Hóa ra hai người cùng mê một tác giả. Mười lăm phút kẹt thang máy trôi nhanh như năm phút. Lúc cửa mở, {stranger} nói: “Trưa nay ăn cơm chung nhé?” Chuyện tình văn phòng bắt đầu từ đó.',
              effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'laugh' } } },
            { text: 'Bạn đoán sai tên tác giả, rồi sai luôn thể loại. {stranger} cười lịch sự rồi quay lại với điện thoại. Mười lăm phút dài nhất đời bạn.',
              effects: { happy: -3 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'phone' } } }
          ] },
        { label: 'Chia nửa ổ bánh mì đang cầm',
          outcomes: [
            { p: 0.5, text: '“Bạn cũng chưa ăn sáng à?” {stranger} nhận nửa ổ bánh mì, cười. Từ hôm đó, sáng nào cũng có người đứng chờ bạn ở sảnh để “đi chung thang”.',
              effects: { happy: 8, karma: 2, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'eat', fx: 'hearts', npcAnim: { stranger: 'eat' } } },
            { p: 0.5, text: '{stranger} từ chối khéo: “Mình đang ăn kiêng.” Bạn ăn hết cả ổ trong bầu không khí ngượng ngùng tột độ.',
              effects: { happy: -2 },
              scene: { anim: 'eat', fx: 'sweat', npcAnim: { stranger: 'shake' } } }
          ] },
        { label: 'Hoảng loạn bấm chuông cứu hộ liên tục',
          text: '{stranger} nhìn bạn đập nút chuông như gõ trống hội. Hai phút sau thang chạy lại. Từ đó người ấy gọi bạn là “người bấm chuông”, chẳng biết là trêu hay là thân.',
          effects: { happy: 1 },
          scene: { anim: 'scared', fx: 'exclaim', npcAnim: { stranger: 'laugh' } } },
        { label: 'Im lặng, giả vờ đọc email',
          text: 'Bạn dán mắt vào điện thoại suốt mười lăm phút. Cửa mở, người ấy bước ra. Hôm sau, bạn quyết định... đi thang bộ.',
          effects: { happy: -2, health: 1 },
          scene: { anim: 'phone', fx: 'sweat', npcAnim: { stranger: 'walk' } } }
      ]
    },
    {
      id: 's_love_app_khac_anh', title: 'Người trong ảnh là ai?', icon: '🎭', age: [18, 40], weight: 0.9,
      req: { lacks: ['partner', 'spouse'] },
      text: 'Match trên app hẹn hò được hai tuần, bạn hẹn {stranger} ở quán cà phê. Người bước vào khác ảnh đại diện... hoàn toàn. {stranger} ngồi xuống, thú nhận luôn: “Ảnh đó là của đứa em họ. Mình sợ đăng ảnh thật thì không ai quẹt.”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', anim: 'shrug', say: 'Ảnh đó là của đứa em họ mình...' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Cười xòa, ngồi lại nói chuyện',
          outcomes: [
            { p: 0.5, text: 'Người thật hóa ra hài hước hơn người trong ảnh gấp mười lần. Hai người nói chuyện đến lúc quán đóng cửa, hẹn tuần sau đi ăn ốc.',
              effects: { happy: 8, karma: 3, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'laugh' } } },
            { p: 0.5, text: 'Nói chuyện vui, nhưng bạn không thấy “rung rinh”. Hai người chia tiền nước, kết bạn Facebook, thỉnh thoảng rủ nhau đi cà phê như hai người bạn.',
              effects: { happy: 3, karma: 2, addPerson: { role: 'friend', fromScene: 'stranger' } },
              scene: { anim: 'talk', fx: 'sparkle', npcAnim: { stranger: 'talk' } } }
          ] },
        { label: 'Đứng dậy bỏ về',
          text: 'Bạn viện cớ “nhà có việc gấp”, trả tiền nước rồi đi. Trên đường về hơi áy náy, nhưng bắt đầu bằng một lời nói dối thì khó mà đi tiếp.',
          effects: { happy: -2 },
          scene: { anim: 'walk', fx: 'sweat', npcAnim: { stranger: 'sad' } } },
        { label: 'Thú nhận: ảnh của mình cũng... chỉnh hơi nhiều',
          outcomes: [
            { p: 0.6, text: '{stranger} nhìn bạn từ đầu đến chân rồi phá lên cười: “Hòa nhé!” Hai kẻ “lừa đảo” cụng ly trà đá, thấy thoải mái lạ thường, và hẹn nhau thêm lần nữa.',
              effects: { happy: 7, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'laugh' } } },
            { p: 0.4, text: 'Hai người cười đến chảy nước mắt, rồi thống nhất làm “đồng minh chỉnh ảnh”, chỉ làm bạn thôi. Một tình bạn kỳ lạ bắt đầu.',
              effects: { happy: 4, addPerson: { role: 'friend', fromScene: 'stranger' } },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { stranger: 'clap' } } }
          ] },
        { label: 'Đòi gọi luôn đứa em họ ra cho gặp',
          text: '{stranger} gọi thật. Hai mươi phút sau, “người trong ảnh” xuất hiện, ngồi ăn hết đĩa hướng dương rồi về. Bạn cả buổi không hiểu mình đang hẹn hò với ai.',
          effects: { happy: 3 },
          scene: { anim: 'facepalm', fx: 'question', npcAnim: { stranger: 'phone' } } }
      ]
    },
    {
      id: 's_love_cam_sung', title: 'Ảnh check-in Đà Lạt', icon: '🌲', age: [17, 45], weight: 0.8,
      req: { has: ['partner'] },
      text: '{partner} bảo cuối tuần “về quê có việc”. Tối Chủ nhật, Facebook gợi ý cho bạn một tấm ảnh check-in Đà Lạt của một người lạ. Góc ảnh có đúng chiếc áo khoác bạn tặng {partner} sinh nhật năm ngoái.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'partner', anim: 'phone', say: 'Về quê có chút việc thôi mà.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Gửi ảnh, hỏi thẳng',
          outcomes: [
            { p: 0.35, text: 'Hóa ra {partner} cho đứa em họ mượn áo đi Đà Lạt, còn mình thì về quê thật. Người ấy gọi video chứng minh hẳn hoi, sau lưng là cả đàn gà. Bạn xin lỗi rối rít.',
              effects: { happy: 4, rel: { partner: -2 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { partner: 'laugh' } } },
            { p: 0.65, text: '{partner} im lặng rất lâu, rồi nhắn: “Mình xin lỗi.” Ba chữ đủ làm mọi thứ sụp đổ. Bạn chặn số, xóa hết ảnh đôi ngay trong đêm.',
              effects: { happy: -15, removePerson: 'partner' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'sad' } } }
          ] },
        { label: 'Âm thầm thu thập thêm bằng chứng',
          outcomes: [
            { p: 0.6, text: 'Bạn lần theo từng lượt thích, từng bình luận. Một tuần sau, bằng chứng đã đủ. Bạn bày tất cả ra bàn và nói lời chia tay, bình tĩnh đến lạnh người.',
              effects: { happy: -10, smarts: 2, removePerson: 'partner' },
              scene: { anim: 'point', fx: 'flash', npcAnim: { partner: 'scared' } } },
            { p: 0.4, text: 'Càng tìm càng không thấy gì. Hóa ra chỉ là một chiếc áo giống hệt, bán đầy trên Shopee. Bạn thở phào, và hơi xấu hổ vì đã nghi ngờ.',
              effects: { happy: 2, smarts: 1 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { partner: 'idle' } } }
          ] },
        { label: 'Đăng status ẩn ý “Đà Lạt lạnh nhỉ?”',
          outcomes: [
            { p: 0.5, text: 'Status nhận 200 lượt bày tỏ cảm xúc, bạn bè kéo vào hóng. {partner} gọi điện cãi nhau cả đêm. Không ai thắng, chỉ có cả hai cùng thua.',
              effects: { happy: -8, rel: { partner: -15 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { partner: 'angry' } } },
            { p: 0.5, text: '{partner} đọc status, hiểu ngay, và chủ động nhắn chia tay trước khi bạn kịp nói gì. Màn drama được nhiều lượt thích nhất năm.',
              effects: { happy: -12, removePerson: 'partner' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Chia tay ngay, không cần giải thích',
          text: '“Mình biết rồi. Không cần nói gì nữa.” Bạn gửi tin nhắn cuối cùng rồi tắt điện thoại, ra ban công ngồi đến sáng. Đau, nhưng lòng tự trọng còn nguyên.',
          effects: { happy: -10, karma: 2, removePerson: 'partner' },
          scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
      ]
    }
  );
})();
