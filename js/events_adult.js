// events_adult.js — Một Kiếp Người: tình huống tuổi trưởng thành (18–45, vài cái tới 55). Mọi id có tiền tố a_.
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const UNI = { school: true, eduLevel: ['university'] };

  KN.EVENTS.push(
    // ======================= SINH VIÊN =======================
    {
      id: 'a_tro_tang_gia', title: 'Chủ trọ tăng giá', icon: '🏚️', age: [18, 25], weight: 1.2,
      req: UNI,
      text: 'Bà chủ trọ gõ cửa đúng lúc bạn đang húp mì: “Tháng sau điện nước tăng, phòng tăng thêm {money:500000} nha con.” Căn phòng 12 mét vuông nóng như lò bánh mì, giờ đắt ngang căn hộ mini.',
      scene: { loc: 'bedroom', time: 'dusk', weather: 'clear', anim: 'eat', expr: 'surprised',
        npcs: [{ role: 'neighbor', gender: 'f', age: 58, anim: 'talk', say: 'Tháng sau tăng 500 nghìn nha con!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Năn nỉ bằng giọng ngọt nhất',
          success: { stat: 'looks', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bà chủ trọ phì cười: “Thôi, con ngoan, tăng 200 nghìn thôi.” Bạn thở phào như vừa qua môn.', effects: { money: -2400000, happy: 3 },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { neighbor: 'laugh' }, npcSay: { neighbor: 'Thôi, tăng 200 thôi nghe!' } } },
            { text: 'Bà lắc đầu: “Giá chung cả dãy rồi con.” Cái ví của bạn khóc thầm suốt cả năm.', effects: { money: -6000000, happy: -4 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { neighbor: 'shake' } } }
          ] },
        { label: 'Rủ thêm người ở ghép cho đỡ',
          text: 'Bạn kê thêm tấm nệm, chia đôi tiền phòng. Tiết kiệm được kha khá, đổi lại mất luôn sự riêng tư và nửa cái quạt.',
          effects: { money: 6000000, happy: -2 },
          scene: { anim: 'shrug', fx: 'money', npcAnim: { neighbor: 'nod' } } },
        { label: 'Dọn đi tìm trọ mới',
          outcomes: [
            { p: 0.5, text: 'Bạn tìm được phòng rẻ hơn, có cửa sổ nhìn ra... bức tường nhà bên. Nhưng vẫn là cửa sổ, vẫn vui!', effects: { money: 3000000, happy: 4 },
              scene: { loc: 'street', anim: 'lift', fx: 'dust' } },
            { p: 0.5, text: 'Phòng mới rẻ thật, nhưng mưa là dột, đêm nào chuột cũng chạy đua trên trần.', effects: { happy: -6, health: -2 },
              scene: { loc: 'street', anim: 'facepalm', weather: 'rain', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 'a_mi_tom_cuoi_thang', title: 'Mì tôm cuối tháng', icon: '🍜', age: [18, 24], weight: 1.3, once: false, cooldown: 3,
      req: UNI,
      text: 'Ngày 25, ví còn đúng {money:47000}. Thùng mì tôm dưới gầm giường còn 3 gói, còn 6 ngày nữa mới có tiền nhà gửi lên. Bạn cùng phòng {classmate} nhìn bạn bằng ánh mắt đói khát.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'eat', expr: 'sad',
        npcs: [{ role: 'classmate', anim: 'sit', expr: 'sad', say: 'Còn gói nào cho tao xin không?' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Chia mì cho bạn cùng phòng',
          text: 'Hai đứa chia nhau gói mì cuối, thêm quả trứng {classmate} giấu kỹ trong balo. Nghèo mà vui, tình bạn đậm đà như nước súp.',
          effects: { happy: 4, karma: 4, addPerson: { role: 'friend', fromScene: 'classmate' } },
          scene: { anim: 'laugh', fx: 'steam', npcAnim: { classmate: 'eat' }, npcSay: { classmate: 'Mày là nhất!' } } },
        { label: 'Gọi điện về nhà xin thêm',
          text: 'Nhà chuyển ngay {money:1000000}, kèm tin nhắn “Ăn uống đàng hoàng vào con”. Bạn vừa mừng vừa thấy có lỗi.',
          effects: { money: 1000000, happy: 2, karma: -1 },
          scene: { anim: 'phone', say: 'Dạ, con hết tiền rồi ạ...', fx: 'money' } },
        { label: 'Nhịn, uống nước cầm hơi',
          text: 'Bạn sống sót qua 6 ngày bằng nước lọc và ý chí thép. Sụt 2 cân, đổi lại hiểu thấu giá trị đồng tiền.',
          effects: { health: -4, happy: -3, smarts: 1 },
          scene: { anim: 'sad', fx: 'sweat', npcAnim: { classmate: 'shrug' } } },
        { label: 'Đi phát tờ rơi cuối tuần',
          text: 'Đứng ngã tư phát tờ rơi cả cuối tuần, cháy da nhưng kiếm được {money:400000}, đủ ăn cơm tấm tới đầu tháng.',
          effects: { money: 400000, health: -1, happy: 2 },
          scene: { loc: 'street', time: 'day', anim: 'wave', say: 'Mời anh chị xem thử ạ!', fx: 'sweat' } }
      ]
    },
    {
      id: 'a_ban_cung_phong', title: 'Bạn cùng phòng', icon: '🧦', age: [18, 23],
      req: UNI,
      text: 'Bạn cùng phòng {classmate} ngáy như máy cày, phơi tất trên đầu giường bạn và hay “mượn” dầu gội không hỏi. Hôm nay chai dầu gội mới mua đã vơi một nửa.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'classmate', anim: 'sleep' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Nói thẳng, lập nội quy phòng',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Hai đứa ngồi xuống viết nội quy dán tường. {classmate} hứa sửa, còn mua đền chai dầu gội mới.', effects: { happy: 5, karma: 2 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { classmate: 'bow' }, npcSay: { classmate: 'Tao sai rồi, tao đền!' } } },
            { text: '{classmate} tự ái, cả tháng không nói câu nào. Phòng 12 mét vuông mà lạnh như tủ đông.', effects: { happy: -5 },
              scene: { anim: 'sad', npcAnim: { classmate: 'angry' }, npcSay: { classmate: 'Có chai dầu gội thôi mà!' } } }
          ] },
        { label: 'Trả đũa: pha nước vào dầu gội',
          text: 'Mỗi ngày bạn pha thêm chút nước. Một tuần sau {classmate} than: “Dầu gội gì mà loãng như nước lã.” Bạn nín cười đến nội thương.',
          effects: { happy: 4, karma: -3 },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { classmate: 'shrug' } } },
        { label: 'Mua nút tai, nhịn cho êm',
          text: 'Bạn mua nút tai và giấu dầu gội trong balo. Bình yên, nhưng hơi uất.',
          effects: { money: -150000, happy: -1, health: 1 },
          scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'a_thi_lai', title: 'Thi lại', icon: '📉', age: [18, 24],
      req: UNI,
      text: 'Bảng điểm vừa đăng: môn Xác suất thống kê — 3,5 điểm. Bạn phải thi lại, trượt nữa là học lại cả môn với khóa dưới.',
      scene: { loc: 'university', time: 'day', weather: 'cloudy', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'teacher', gender: 'm', age: 52, anim: 'talk', say: 'Tuần sau thi lại, em ôn kỹ vào.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Cày đề ở thư viện cả tuần',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn qua môn với 7 điểm. Thầy {teacher} gật gù: “Thế mới phải chứ!”', effects: { smarts: 4, happy: 5 },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { teacher: 'nod' }, npcSay: { teacher: 'Thế mới phải chứ!' } } },
            { text: 'Ôn cả tuần mà vào phòng thi đầu óc trống trơn. Lại trượt, phải học lại, tốn thêm {money:1500000}.', effects: { money: -1500000, happy: -6, smarts: 2 },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { teacher: 'shake' } } }
          ] },
        { label: 'Xách giỏ trái cây đến nhà thầy',
          outcomes: [
            { p: 0.3, text: 'Thầy nhận giỏ trái cây nhưng vẫn cho bạn thi như thường. Bạn qua môn sát nút, lòng hơi ngượng.', effects: { money: -500000, karma: -3, happy: 1 },
              scene: { anim: 'bow', fx: 'sweat', npcAnim: { teacher: 'shrug' } } },
            { p: 0.7, text: 'Thầy nghiêm mặt trả lại quà: “Em về ôn bài đi.” Cả khoa biết chuyện, bạn chỉ muốn độn thổ.', effects: { money: -500000, karma: -5, happy: -6 },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { teacher: 'shake' }, npcSay: { teacher: 'Em mang về đi, ôn bài cho tử tế.' } } }
          ] },
        { label: 'Thôi, học lại năm sau',
          text: 'Bạn đăng ký học lại cùng khóa dưới. Tốn {money:1500000}, đổi lại có thêm một hội đàn em gọi bạn là “tiền bối”.',
          effects: { money: -1500000, happy: 1 },
          scene: { anim: 'shrug', fx: 'question' } }
      ]
    },
    {
      id: 'a_clb', title: 'Ngày hội câu lạc bộ', icon: '🎸', age: [18, 21],
      req: UNI,
      text: 'Ngày hội câu lạc bộ, sân trường rợp băng rôn: Guitar, Tình nguyện, Võ thuật, Kỹ năng... Một anh khóa trên chặn bạn lại, mắt sáng rực như vừa tìm được nhân tài.',
      scene: { loc: 'university', time: 'day', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'm', age: 21, anim: 'talk', say: 'Em ơi, vào CLB bọn anh đi!' }, { role: 'crowd', anim: 'clap' }], fx: 'music', shot: 'wide' },
      choices: [
        { label: 'Vào CLB Tình nguyện',
          text: 'Mùa hè đó bạn theo đoàn lên vùng cao dạy chữ, ngủ nhà sàn, tắm suối. Về thành phố đen nhẻm nhưng trái tim đầy ắp.',
          effects: { karma: 8, happy: 6, health: 2, addPerson: { role: 'friend', fromScene: 'stranger' } },
          scene: { loc: 'countryside', anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'wave' } } },
        { label: 'Vào CLB Guitar',
          outcomes: [
            { p: 0.6, text: 'Sau ba tháng bạn đánh được đúng... một bài. Nhưng hát chung với cả hội dưới gốc cây thì vui quên trời đất.', effects: { happy: 6 },
              scene: { anim: 'sing', fx: 'music', npcAnim: { all: 'clap' } } },
            { p: 0.4, text: 'Bạn tập đến phồng ngón tay, rồi được chọn đệm đàn ở đêm văn nghệ khoa. Cả khoa vỗ tay rần rần!', effects: { happy: 8, looks: 2 },
              scene: { anim: 'sing', time: 'night', fx: 'stars', npcAnim: { all: 'clap' } } }
          ] },
        { label: 'Lách khỏi đám đông, về ngủ',
          text: 'Bạn lủi về phòng nằm. Bốn năm đại học trôi qua yên ả... hơi quá yên ả.',
          effects: { happy: -1, health: 1 },
          scene: { anim: 'shrug', npcAnim: { stranger: 'facepalm' } } }
      ]
    },
    {
      id: 'a_tinh_dau_dai_hoc', title: 'Bàn cuối thư viện', icon: '💘', age: [18, 23],
      req: { school: true, eduLevel: ['university'], lacks: ['partner', 'spouse'] },
      text: 'Có một người lớp bên hay ngồi dưới gốc cây lớn đọc sách say sưa. Bạn đã “vô tình” ngồi đối diện ba buổi liền, tim đập như trống trường.',
      scene: { loc: 'university', time: 'day', weather: 'clear', anim: 'study', expr: 'love',
        npcs: [{ role: 'stranger', age: 20, anim: 'study' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Mạnh dạn bắt chuyện',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn hỏi mượn bút, rồi mượn luôn số điện thoại. Một tháng sau, hai người chính thức nắm tay đi ăn chè.', effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'love', fx: 'hearts', npcAnim: { stranger: 'laugh' }, npcSay: { stranger: 'Ừ, mai đi ăn chè nha.' } } },
            { text: 'Bạn lắp bắp: “Bạn có... bút chì không?” Người ta đưa bút rồi đi mất. Bạn ôm mối hận với cây bút chì.', effects: { happy: -4 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'walk' } } }
          ] },
        { label: 'Viết thư tay kẹp vào sách',
          outcomes: [
            { p: 0.5, text: 'Hôm sau trong sách có mảnh giấy: “Thứ Bảy đi cà phê nhé?” Bạn hét lên giữa thư viện và bị nhắc nhở.', effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'jump', fx: 'hearts', npcAnim: { stranger: 'wave' } } },
            { p: 0.5, text: 'Lá thư rơi ra giữa lớp và bị đọc to trước cả lớp. Bạn nổi tiếng cả khoa, theo nghĩa không vui lắm.', effects: { happy: -6 },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Ngắm thôi, tập trung học',
          text: 'Bạn cất rung động vào ngăn kéo, điểm học kỳ đó cao vút. Thỉnh thoảng vẫn ngoái nhìn gốc cây quen.',
          effects: { smarts: 4, happy: -1 },
          scene: { anim: 'study', fx: 'idea' } }
      ]
    },
    {
      id: 'a_lam_them_cafe', title: 'Ca tối ở quán cà phê', icon: '☕', age: [18, 24],
      req: UNI,
      text: 'Bạn làm thêm ca tối ở quán cà phê, {money:22000} một giờ. Một vị khách gọi “nâu đá, ít đá, nhiều sữa, không ngọt”, uống một ngụm rồi đập bàn chê dở.',
      scene: { loc: 'cafe', time: 'night', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 42, anim: 'angry', say: 'Pha kiểu gì vậy? Làm lại!' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Mỉm cười pha lại ly khác',
          success: { stat: 'karma', base: 0.4, scale: 0.5 },
          outcomes: [
            { text: 'Ông khách uống xong, dịu giọng, còn để lại {money:50000} tiền boa. Chủ quán khen bạn khéo.', effects: { money: 50000, happy: 4, karma: 3 },
              scene: { anim: 'bow', fx: 'money', npcAnim: { stranger: 'nod' }, npcSay: { stranger: 'Ừ, ly này được đấy.' } } },
            { text: 'Ông khách vẫn chê, bỏ về không trả tiền. Chủ quán trừ vào lương bạn {money:35000}.', effects: { money: -35000, happy: -4 },
              scene: { anim: 'sad', npcAnim: { stranger: 'walk' } } }
          ] },
        { label: 'Cãi lại cho ra lẽ',
          text: 'Hai bên to tiếng, cả quán quay lại nhìn. Bạn thắng lý, nhưng thua luôn cái ca làm: chủ quán cho nghỉ.',
          effects: { money: -400000, happy: -3, karma: -1 },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { stranger: 'point' } } },
        { label: 'Pha lại y hệt, chỉ đổi cái ly',
          outcomes: [
            { p: 0.7, text: 'Ông khách nhấp một ngụm: “Đấy, phải thế chứ!” Bạn quay vào quầy cười run cả vai.', effects: { happy: 6, karma: -1 },
              scene: { anim: 'laugh', fx: 'music', npcAnim: { stranger: 'nod' }, npcSay: { stranger: 'Đấy, phải thế chứ!' } } },
            { p: 0.3, text: 'Ông ta nhận ra cái ly vẫn y vết son cũ. Bạn bị mắng thêm 10 phút.', effects: { happy: -3 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'angry' } } }
          ] }
      ]
    },
    {
      id: 'a_diem_danh_ho', title: 'Điểm danh hộ', icon: '🙋', age: [18, 23],
      req: { school: true, eduLevel: ['university'], has: ['friend'] },
      text: '{friend} nhắn: “Điểm danh hộ tao nha, tao ngủ quên!” Đúng hôm cô {teacher} gọi tên từng người và nhìn tận mặt.',
      scene: { loc: 'university', time: 'day', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'teacher', gender: 'f', age: 45, anim: 'talk', say: 'Cô điểm danh nhé. Ai vắng nào?' }, { role: 'crowd', anim: 'sit' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Giả giọng hô “Có!”',
          outcomes: [
            { p: 0.5, text: 'Cô {teacher} không ngẩng lên. Trót lọt! {friend} hứa bao bạn một tuần trà sữa.', effects: { happy: 4, karma: -2, rel: { friend: 6 } },
              scene: { anim: 'laugh', fx: 'sparkle' } },
            { p: 0.5, text: 'Cô {teacher} nhìn thẳng vào bạn: “Em là ai mà có mặt hai lần?” Cả hai bị trừ điểm chuyên cần.', effects: { happy: -5, smarts: -1, rel: { friend: 2 } },
              scene: { anim: 'facepalm', fx: 'exclaim', npcAnim: { teacher: 'point' }, npcSay: { teacher: 'Em có mặt hai lần à?' } } }
          ] },
        { label: 'Từ chối, bảo bạn tự lo',
          text: '{friend} dỗi một hôm rồi thôi. Từ đó tự đặt ba cái báo thức.',
          effects: { karma: 2, rel: { friend: -4 } },
          scene: { anim: 'shrug' } },
        { label: 'Gọi video dựng bạn dậy',
          text: '{friend} lao vào lớp đầu tóc bù xù, áo mặc trái, kịp lúc cô gọi tới tên. Cả lớp vỗ tay rào rào.',
          effects: { happy: 3, rel: { friend: 5 } },
          scene: { anim: 'clap', fx: 'confetti', npcAnim: { teacher: 'shrug', crowd: 'clap' } } }
      ]
    },
    {
      id: 'a_nhom_bai_tap', title: 'Bài tập nhóm', icon: '📊', age: [18, 24],
      req: UNI,
      text: 'Bài tập nhóm 5 người, thứ Hai thuyết trình. Tối Chủ nhật, chỉ mình bạn làm. Ba đứa “đã xem” không trả lời, còn {classmate} gửi đúng một slide ghi “Cảm ơn đã lắng nghe”.',
      scene: { loc: 'cafe', time: 'night', weather: 'clear', anim: 'type', expr: 'angry',
        npcs: [{ role: 'classmate', anim: 'phone', say: 'Slide cuối tao làm xong rồi nha!' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Gạch tên đứa lười khỏi danh sách',
          outcomes: [
            { p: 0.6, text: 'Thầy hỏi lý do, bạn đưa bằng chứng tin nhắn. Bạn được 9 điểm, mấy đứa kia học lại.', effects: { smarts: 3, happy: 5, karma: -1 },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { classmate: 'facepalm' } } },
            { p: 0.4, text: 'Cả nhóm quay ra gọi bạn là “đồ kể công”. Điểm cao mà ăn cơm một mình cả kỳ.', effects: { smarts: 2, happy: -4 },
              scene: { anim: 'sad', npcAnim: { classmate: 'angry' } } }
          ] },
        { label: 'Cắn răng làm hết',
          text: 'Bạn thức tới 4 giờ sáng, thuyết trình xuất sắc. Cả nhóm được 9 điểm, chẳng ai cảm ơn. Nhưng bạn thì giỏi lên thật.',
          effects: { smarts: 5, health: -3, happy: -2, karma: 3 },
          scene: { anim: 'type', fx: 'zzz' } },
        { label: 'Bỏ luôn, đi ngủ',
          text: 'Sáng thứ Hai cả nhóm lên bục với... màn hình trống trơn. 3 điểm cho tất cả. Ít ra đêm đó bạn ngủ ngon.',
          effects: { smarts: -2, happy: -2, health: 2 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'a_hoc_bong', title: 'Suất trao đổi duy nhất', icon: '🎓', age: [19, 24],
      req: { school: true, eduLevel: ['university'], minStat: { smarts: 55 } },
      text: 'Khoa thông báo học bổng trao đổi một học kỳ ở nước ngoài, chỉ một suất. Hạn nộp hồ sơ là thứ Sáu, kèm bài luận tiếng Anh dài 1.000 chữ.',
      scene: { loc: 'university', time: 'day', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'teacher', gender: 'f', age: 40, anim: 'talk', say: 'Em thử nộp đi, cô thấy em được đấy.' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Thức trắng viết bài luận',
          success: { stat: 'smarts', base: 0.1, scale: 0.7 },
          outcomes: [
            { text: 'Bạn được chọn! Một học kỳ ở xứ người, học bao điều mới, tiếng Anh trôi chảy hẳn.', effects: { smarts: 8, happy: 10, flag: 'a_du_hoc_trao_doi' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { teacher: 'clap' }, npcSay: { teacher: 'Cô biết mà!' } } },
            { text: 'Hồ sơ của bạn xếp thứ hai. Tiếc, nhưng cô {teacher} bảo bài luận rất đáng đọc.', effects: { smarts: 3, happy: -3 },
              scene: { anim: 'sad', npcAnim: { teacher: 'hug' } } }
          ] },
        { label: 'Thôi, tiếng Anh mình dở lắm',
          text: 'Bạn không nộp. Cuối kỳ thấy người được chọn đăng ảnh tuyết rơi, bạn lặng lẽ thả tim.',
          effects: { happy: -3 },
          scene: { anim: 'shrug', npcAnim: { teacher: 'sad' } } }
      ]
    },

    // ======================= TÌM VIỆC & ĐI LÀM =======================
    {
      id: 'a_phong_van', title: 'Buổi phỏng vấn', icon: '👔', age: [21, 35],
      req: { job: false, school: false, degree: true },
      text: 'Bạn mặc chiếc sơ mi là phẳng nhất, ngồi trước hội đồng phỏng vấn. Chị trưởng phòng nhìn CV rồi hỏi: “Em hãy nói điểm yếu lớn nhất của mình.”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'f', age: 42, anim: 'talk', say: 'Điểm yếu lớn nhất của em là gì?' }, { role: 'coworker', gender: 'm', age: 35, anim: 'think' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: '“Em hơi cầu toàn ạ”',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Câu trả lời kinh điển, nhưng bạn kể kèm ví dụ thật. Một tuần sau, email trúng tuyển nằm trong hộp thư!', effects: { happy: 10, job: { hire: 'marketing' } },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { boss: 'nod' }, npcSay: { boss: 'Thứ Hai đi làm nhé.' } } },
            { text: 'Người phỏng vấn mỉm cười kiểu “câu này tôi nghe 200 lần rồi”. Bạn chờ mãi không thấy email.', effects: { happy: -4 },
              scene: { anim: 'sad', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Thật thà: “Em hay ngủ quên”',
          outcomes: [
            { p: 0.35, text: 'Cả hội đồng bật cười: “Ít ra em trung thực.” Bạn được nhận, kèm lời dặn mua ba cái đồng hồ báo thức.', effects: { happy: 12, job: { hire: 'marketing' } },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { all: 'laugh' } } },
            { p: 0.65, text: 'Phòng họp im phăng phắc. “Cảm ơn em, chúng tôi sẽ liên hệ sau.”', effects: { happy: -5 },
              scene: { anim: 'facepalm', npcAnim: { boss: 'shake' } } }
          ] },
        { label: 'Hỏi ngược: “Còn điểm yếu của công ty?”',
          outcomes: [
            { p: 0.3, text: 'Chị trưởng phòng nhướn mày rồi gật gù: “Thú vị đấy.” Bạn được nhận vì cá tính.', effects: { happy: 10, job: { hire: 'marketing' } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { boss: 'clap' } } },
            { p: 0.7, text: 'Bạn được mời ra về rất lịch sự, và rất nhanh.', effects: { happy: -4 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 'a_tim_viec', title: 'Lướt nhóm tìm việc', icon: '🔎', age: [18, 32],
      req: { job: false, school: false },
      text: 'Ở nhà ba tháng, bạn lướt nhóm tìm việc thì thấy: “Tuyển shipper, thu nhập 12–15 triệu, tự do giờ giấc.” Ngay dưới là: “Tuyển công nhân, bao cơm trưa, có xe đưa đón.”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'phone', expr: 'neutral', fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Đội nón chạy shipper',
          text: 'Bạn xách balo lên đường. Tuần đầu lạc đường 14 lần, nhưng thuộc thêm cả trăm con hẻm.',
          effects: { happy: 4, health: -1, job: { hire: 'shipper' } },
          scene: { loc: 'street', anim: 'drive', fx: 'dust' } },
        { label: 'Vào nhà máy làm ca',
          text: 'Ca sáng 6 giờ, bữa trưa có canh chua. Đều đặn, mệt, nhưng tháng nào cũng có lương.',
          effects: { happy: 3, job: { hire: 'congnhan' } },
          scene: { loc: 'street', time: 'dawn', anim: 'walk', fx: 'sparkle' } },
        { label: 'Chờ việc “xịn” hơn',
          outcomes: [
            { p: 0.4, text: 'Một người quen giới thiệu chỗ bán hàng ở cửa hàng điện máy. Đáng chờ!', effects: { happy: 6, job: { hire: 'banhang' } },
              scene: { anim: 'cheer', fx: 'confetti' } },
            { p: 0.6, text: 'Bạn chờ thêm nửa năm, tiền tiết kiệm bay hơi như nước sôi.', effects: { money: -5000000, happy: -5 },
              scene: { anim: 'sad', fx: 'money' } }
          ] }
      ]
    },
    {
      id: 'a_sep_kho_tinh', title: 'Sếp khó tính', icon: '📑', age: [21, 45],
      req: { job: true },
      text: 'Sếp {boss} ném bản báo cáo xuống bàn: “Phông chữ gì đây? Lề trái lệch 2 mi-li-mét! Làm lại trước 8 giờ sáng mai.” Đây là lần sửa thứ bảy.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'boss', gender: 'm', age: 46, anim: 'angry', say: 'Lề lệch 2 mi-li-mét! Làm lại!' }, { role: 'coworker', anim: 'type' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Ngoan ngoãn sửa lần thứ tám',
          text: 'Bạn sửa đến nửa đêm. Sáng ra sếp liếc qua: “Ừ, thật ra bản đầu tiên là được rồi.” Bạn mỉm cười trong vô vọng.',
          effects: { happy: -5, health: -2, karma: 1 },
          scene: { time: 'night', anim: 'type', fx: 'zzz', npcAnim: { boss: 'shrug' } } },
        { label: 'Góp ý thẳng với sếp',
          success: { stat: 'smarts', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn trình bày bình tĩnh, có số liệu hẳn hoi. Sếp im lặng một lúc rồi gật: “Được, từ giờ duyệt một lần thôi.”', effects: { happy: 6, karma: 2 },
              scene: { anim: 'nod', fx: 'idea', npcAnim: { boss: 'nod' } } },
            { text: 'Sếp đỏ mặt: “Cậu dạy tôi làm việc à?” Quý này bạn bị đánh giá loại C.', effects: { happy: -6 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'point' }, npcSay: { boss: 'Cậu dạy tôi làm việc à?' } } }
          ] },
        { label: 'Gửi lại bản cũ, đổi tên file',
          outcomes: [
            { p: 0.7, text: 'Sếp đọc xong khen: “Bản này ổn hơn nhiều đấy!” Bạn và đồng nghiệp {coworker} nhìn nhau, cố nhịn cười.', effects: { happy: 6 },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { coworker: 'laugh', boss: 'nod' }, npcSay: { boss: 'Bản này ổn hơn nhiều!' } } },
            { p: 0.3, text: 'Sếp so hai file, thấy giống hệt nhau. Bạn được “mời” lên phòng nói chuyện riêng.', effects: { happy: -6, karma: -1 },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { boss: 'angry' } } }
          ] }
      ]
    },
    {
      id: 'a_dong_nghiep_choi_xau', title: 'Ý tưởng bị cướp', icon: '🐍', age: [22, 45],
      req: { job: true },
      text: 'Trong cuộc họp, đồng nghiệp {coworker} trình bày ý tưởng của bạn như thể của mình, trơn tru tới từng dấu chấm. Sếp vỗ tay: “Xuất sắc! Quý này em lên trưởng nhóm nhé.”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'angry',
        npcs: [{ role: 'coworker', anim: 'talk', say: 'Ý tưởng này em ấp ủ lâu lắm rồi ạ!' }, { role: 'boss', anim: 'clap' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đứng lên đưa bằng chứng',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn mở email gửi ý tưởng từ tháng trước, có ngày giờ hẳn hoi. Cả phòng im lặng. Sếp giao dự án cho bạn, kèm phần thưởng.', effects: { happy: 8, karma: 2, job: 'raise' },
              scene: { anim: 'point', fx: 'levelup', npcAnim: { coworker: 'facepalm', boss: 'nod' } } },
            { text: 'Bằng chứng không đủ rõ, bạn bị cho là ganh tị. Không khí phòng ngột ngạt cả quý.', effects: { happy: -6 },
              scene: { anim: 'sad', npcAnim: { coworker: 'laugh', boss: 'shake' } } }
          ] },
        { label: 'Im lặng, rút kinh nghiệm',
          text: 'Bạn nuốt cục tức, nhưng từ đó mọi ý tưởng đều gửi email cho sếp, đồng gửi cả phòng. Khôn ra là có thật.',
          effects: { smarts: 3, happy: -2, karma: 2 },
          scene: { anim: 'type', fx: 'idea' } },
        { label: 'Nói xấu {coworker} khắp công ty',
          outcomes: [
            { p: 0.5, text: 'Tin đồn lan nhanh, {coworker} mất uy tín. Bạn hả dạ, nhưng mọi người bắt đầu dè chừng cả bạn.', effects: { happy: 2, karma: -6 },
              scene: { anim: 'laugh', npcAnim: { coworker: 'sad' } } },
            { p: 0.5, text: 'Tin đồn quay ngược về bạn. Sếp gọi lên nhắc nhở vì “gây mất đoàn kết”.', effects: { happy: -6, karma: -5 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 'a_tang_ca', title: '5 giờ 29 phút', icon: '⏰', age: [22, 45],
      req: { job: true },
      text: 'Đúng 5 giờ 29 phút, bạn vừa tắt máy thì sếp {boss} nhắn: “Tối nay ở lại tăng ca nhé, khách cần gấp.” Tối nay bạn đã hẹn đi sinh nhật đứa bạn thân.',
      scene: { loc: 'office', time: 'dusk', weather: 'clear', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'point', say: 'Tối nay tăng ca nhé, khách cần gấp!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Ở lại tăng ca',
          text: 'Bạn ở lại tới 11 giờ đêm, gặm bánh mì nguội. Cuối tháng có thêm {money:1500000}, và một người bạn hơi giận.',
          effects: { money: 1500000, happy: -4, health: -2 },
          scene: { time: 'night', anim: 'type', fx: 'zzz' } },
        { label: 'Từ chối khéo, xin về',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Sếp gật đầu: “Ừ, mai đi sớm làm bù nhé.” Bữa sinh nhật vui hết cỡ.', effects: { happy: 6 },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { boss: 'nod' } } },
            { text: 'Sếp không nói gì, nhưng tuần sau bạn bị giao gấp đôi việc.', effects: { happy: -3, health: -2 },
              scene: { anim: 'sad', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Giả vờ đau bụng',
          outcomes: [
            { p: 0.6, text: 'Bạn ôm bụng lết ra cửa, rẽ qua góc phố là cười tươi như hoa. Trót lọt!', effects: { happy: 5, karma: -3 },
              scene: { loc: 'street', time: 'night', anim: 'laugh', fx: 'music' } },
            { p: 0.4, text: 'Đến quán thì thấy ngay sếp ngồi bàn bên cạnh. Hai bên nhìn nhau, không khí đông cứng.', effects: { happy: -6, karma: -3 },
              scene: { loc: 'street', time: 'night', anim: 'scared', fx: 'exclaim', npcAnim: { boss: 'angry' }, npcSay: { boss: 'Hết đau bụng rồi à?' } } }
          ] }
      ]
    },
    {
      id: 'a_team_building', title: 'Team building', icon: '🏖️', age: [21, 45], once: false, cooldown: 3,
      req: { job: true },
      text: 'Công ty tổ chức team building ở biển. Trò chơi đầu tiên: cả phòng xếp kim tự tháp người, và bạn được “vinh dự” đứng tầng dưới cùng.',
      scene: { loc: 'beach', time: 'day', weather: 'clear', anim: 'shrug', expr: 'surprised',
        npcs: [{ role: 'boss', anim: 'clap', say: 'Cố lên nào cả nhà ơi!' }, { role: 'crowd', anim: 'jump' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Hết mình, lăn lộn trên cát',
          text: 'Bạn lăn lộn, hò hét, đội thắng giải nhất. Tối gala còn lên hát tặng cả công ty. Đồng nghiệp nhìn bạn bằng ánh mắt khác hẳn.',
          effects: { happy: 8, health: 1 },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { all: 'clap' } } },
        { label: 'Trốn ra ghế dài nằm',
          text: 'Bạn nằm nghe sóng, ngủ quên tới cháy nắng hai vai. Thư giãn thật, nhưng cả tuần sau bị gọi là “tôm hùm”.',
          effects: { happy: 4, health: -1, looks: -1 },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { boss: 'facepalm' } } },
        { label: 'Quẩy tới bến đêm gala',
          outcomes: [
            { p: 0.5, text: 'Bạn hát, nhảy, khoác vai sếp hô khẩu hiệu. Sáng hôm sau video đã có mặt trong mọi nhóm chat công ty.', effects: { happy: 4, health: -2 },
              scene: { time: 'night', anim: 'dance', fx: 'music', npcAnim: { all: 'laugh' } } },
            { p: 0.5, text: 'Bạn quá chén, ngủ gục ở sảnh khách sạn. Ít ra có người đắp chăn cho.', effects: { happy: -2, health: -4 },
              scene: { time: 'night', anim: 'sleep', fx: 'zzz' } }
          ] }
      ]
    },
    {
      id: 'a_nhau_voi_sep', title: 'Nhậu với sếp', icon: '🍻', age: [22, 45],
      req: { job: true },
      text: 'Liên hoan cuối quý ở quán nhậu vỉa hè. Sếp {boss} rót đầy ly, đẩy sang bạn: “Không uống là không nể anh nhé!” Cả bàn dồn mắt về phía bạn.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'boss', gender: 'm', age: 45, anim: 'drink', say: 'Không uống là không nể anh nhé!' }, { role: 'crowd', anim: 'clap' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Uống cạn, “một trăm phần trăm”',
          outcomes: [
            { p: 0.6, text: 'Bạn uống cạn, cả bàn vỗ tay. Sếp khoác vai: “Được, có tương lai!” Sáng hôm sau đầu đau như búa bổ.', effects: { happy: 3, health: -4 },
              scene: { anim: 'drink', fx: 'stars', npcAnim: { boss: 'cheer' }, npcSay: { boss: 'Được, có tương lai!' } } },
            { p: 0.4, text: 'Ly thứ ba, ly thứ năm... Đồng nghiệp chở bạn về, sáng ra không nhớ mình đã hứa gì với sếp.', effects: { happy: -2, health: -7 },
              scene: { anim: 'sleep', fx: 'zzz', npcAnim: { boss: 'laugh' } } }
          ] },
        { label: 'Xin phép nâng ly nước ngọt',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn khéo léo: “Em lái xe, em xin phép nâng ly nước ngọt kính anh.” Sếp gật gù: “Biết giữ mình, tốt!”', effects: { happy: 4, health: 1, karma: 2 },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { boss: 'nod' } } },
            { text: 'Sếp xị mặt: “Thanh niên gì mà yếu thế!” Cả buổi bạn ngồi như người vô hình.', effects: { happy: -4 },
              scene: { anim: 'sad', npcAnim: { boss: 'shake' } } }
          ] },
        { label: 'Kể chuyện cười đánh lạc hướng',
          text: 'Bạn kể chuyện con mèo nhà hàng xóm trộm cá, cả bàn cười ngặt nghẽo, quên luôn ly rượu. Bạn thoát nạn và thành “cây hài” của phòng.',
          effects: { happy: 6 },
          scene: { anim: 'talk', fx: 'music', npcAnim: { all: 'laugh' } } }
      ]
    },
    {
      id: 'a_cat_luong', title: 'Email cắt lương', icon: '✂️', age: [22, 45], weight: 0.8,
      req: { job: true },
      text: 'Email gửi toàn công ty: “Do kinh tế khó khăn, toàn bộ nhân viên giảm 20% lương trong 6 tháng.” Ngay chiều đó, sếp tổng đăng ảnh đi nghỉ dưỡng.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'type', expr: 'angry',
        npcs: [{ role: 'coworker', anim: 'facepalm', say: 'Đọc email chưa? Cắt 20% lương đấy!' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Thắt lưng buộc bụng',
          text: 'Bạn cắt trà sữa, cắt ăn ngoài, nấu cơm mang đi làm. Ví mỏng hơn, nhưng tay nghề nấu nướng lên hẳn.',
          effects: { money: -6000000, happy: -3, health: 1 },
          scene: { loc: 'home', anim: 'cook', fx: 'steam' } },
        { label: 'Nhận thêm việc buổi tối',
          text: 'Tối nào bạn cũng làm thêm tới khuya. Thu nhập bù được, nhưng quầng thâm mắt cũng to ra.',
          effects: { money: 1000000, health: -4, happy: -2 },
          scene: { loc: 'bedroom', time: 'night', anim: 'type', fx: 'zzz' } },
        { label: 'Nộp đơn nghỉ việc ngay',
          outcomes: [
            { p: 0.5, text: 'Ba tuần sau bạn tìm được chỗ mới lương cao hơn. Đời đôi khi cũng công bằng.', effects: { happy: 8, money: 2000000 },
              scene: { anim: 'cheer', fx: 'confetti' } },
            { p: 0.5, text: 'Bạn nghỉ hơi vội. Bốn tháng gửi CV khắp nơi mà chưa ai gọi lại.', effects: { happy: -8, money: -8000000, job: 'fire' },
              scene: { loc: 'home', anim: 'sad', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 'a_nhay_viec', title: 'Lời mời nhảy việc', icon: '🦘', age: [24, 45],
      req: { job: true, minStat: { smarts: 40 } },
      text: 'Một chị “săn đầu người” hẹn cà phê: “Bên chị có vị trí lương cao hơn 40%, nhưng công ty mới thành lập, áp lực cao.” Chỗ hiện tại thì ổn định, chỉ có lương đứng im ba năm.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'f', age: 32, anim: 'talk', say: 'Cao hơn 40% đó em, suy nghĩ nha!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhảy! Tuổi trẻ phải liều',
          outcomes: [
            { p: 0.6, text: 'Công ty mới tăng trưởng như tên lửa, bạn học được rất nhiều, lương tăng vù vù.', effects: { happy: 8, smarts: 3, job: 'raise' },
              scene: { loc: 'office', anim: 'cheer', fx: 'levelup' } },
            { p: 0.4, text: 'Sáu tháng sau công ty mới hết vốn, đóng cửa. Bạn ôm thùng đồ đứng giữa phố.', effects: { happy: -10, job: 'fire' },
              scene: { loc: 'street', anim: 'sad', weather: 'rain', fx: 'tears' } }
          ] },
        { label: 'Dùng lời mời để đòi tăng lương',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Sếp nghe bạn sắp đi, vội vàng tăng lương 20%. Đúng là phải “dọa” mới được.', effects: { happy: 6, job: 'raise' },
              scene: { loc: 'office', anim: 'cheer', fx: 'money' } },
            { text: 'Sếp bình thản: “Em cứ đi, công ty tôn trọng quyết định của em.” Bạn đứng hình, đành ở lại trong ngượng ngùng.', effects: { happy: -6 },
              scene: { loc: 'office', anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Ở lại, ổn định là vàng',
          text: 'Bạn từ chối. Lương không tăng, nhưng 5 giờ chiều vẫn về kịp ăn cơm nhà.',
          effects: { happy: 2, health: 1 },
          scene: { anim: 'shrug', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 'a_kpi', title: 'KPI 62%', icon: '📈', age: [22, 45], once: false, cooldown: 3,
      req: { job: true },
      text: 'Còn một tuần nữa hết quý, KPI của bạn mới đạt 62%. Trên nhóm chat, sếp gửi một mặt cười kèm dòng chữ: “Ai không đạt thì cuối năm mình nói chuyện riêng nhé.”',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'point', say: 'KPI mới 62% thôi đấy nhé!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Cày ngày cày đêm',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Một tuần ngủ 4 tiếng mỗi đêm, bạn đẩy KPI lên 104%. Sếp tuyên dương trước cả phòng.', effects: { happy: 6, health: -4, job: 'raise' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { boss: 'clap' } } },
            { text: 'Bạn cố hết sức, được 91%, kèm một trận cảm cúm.', effects: { happy: -4, health: -6, illness: 'Cảm cúm' },
              scene: { anim: 'sick', fx: 'sick' } }
          ] },
        { label: '“Làm đẹp” số liệu một chút',
          outcomes: [
            { p: 0.5, text: 'Báo cáo đẹp như mơ. Không ai phát hiện... lần này.', effects: { happy: 3, karma: -6 },
              scene: { anim: 'laugh', fx: 'sweat' } },
            { p: 0.5, text: 'Phòng kiểm soát phát hiện số liệu ảo. Bạn bị kỷ luật, mất trắng thưởng quý.', effects: { happy: -8, karma: -6, money: -5000000 },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Gặp sếp nói chuyện thật',
          text: 'Bạn xin gặp sếp, phân tích lý do và đưa kế hoạch quý sau. Sếp không vui, nhưng nể sự thẳng thắn.',
          effects: { karma: 3, happy: -1, smarts: 2 },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { boss: 'nod' } } }
      ]
    },
    {
      id: 'a_hop_nua_dem', title: 'Họp online lúc nửa đêm', icon: '💻', age: [22, 45],
      req: { job: true },
      text: '11 giờ đêm, đối tác nước ngoài gửi lịch họp gấp. Bạn bật camera trong bộ đồ ngủ hình gấu, sau lưng là cái màn chưa kịp vén.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'type', expr: 'sleepy', say: 'Hello... mọi người nghe rõ không?', fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Tắt camera, chỉ bật mic',
          text: 'Cuộc họp kéo dài 2 tiếng. Bạn ngủ gật ba lần, may mà tắt mic kịp trước khi ngáy.',
          effects: { health: -2, happy: -2 },
          scene: { anim: 'sleep', fx: 'zzz' } },
        { label: 'Họp nghiêm túc, đồ gấu cũng được',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn trình bày trôi chảy. Đối tác khen ngợi, còn hỏi mua bộ đồ gấu ở đâu. Dự án được duyệt!', effects: { happy: 7, smarts: 2 },
              scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Đang nói thì rớt mạng, vào lại thì cuộc họp đã xong. Sáng ra sếp hỏi: “Đêm qua em đi đâu?”', effects: { happy: -5 },
              scene: { anim: 'facepalm', fx: 'question' } }
          ] },
        { label: 'Giả vờ mạng chập chờn',
          text: 'Bạn vào họp 5 phút, “a lô a lô em không nghe rõ” rồi thoát. Ngủ ngon, lương tâm hơi nhói.',
          effects: { happy: 3, health: 1, karma: -2 },
          scene: { anim: 'shrug', say: 'A lô? Em không nghe rõ...', fx: 'question' } }
      ]
    },
    {
      id: 'a_sep_tre', title: 'Sếp mới kém tuổi', icon: '🧑‍💼', age: [30, 45],
      req: { job: true },
      text: 'Công ty bổ nhiệm sếp mới: một bạn 26 tuổi, nói câu nào cũng chêm tiếng Anh. Buổi họp đầu tiên, sếp {boss} gọi bạn là “anh chị lâu năm của team”.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'boss', age: 26, anim: 'talk', say: 'Mình cùng sync lại roadmap nha!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Hợp tác hết mình',
          text: 'Bạn chia sẻ kinh nghiệm, sếp trẻ học nhanh và rất tôn trọng bạn. Cả nhóm chạy trơn tru như được tra dầu.',
          effects: { happy: 4, karma: 4, smarts: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'bow' } } },
        { label: 'Ngầm làm khó',
          outcomes: [
            { p: 0.5, text: 'Sếp trẻ lúng túng vài tuần, rồi nhận ra và... chuyển bạn sang dự án chẳng ai để ý.', effects: { happy: -4, karma: -4 },
              scene: { anim: 'sad', npcAnim: { boss: 'point' } } },
            { p: 0.5, text: 'Sếp trẻ chịu không nổi, xin chuyển phòng. Bạn thắng, mà chẳng thấy vui.', effects: { happy: 1, karma: -5 },
              scene: { anim: 'shrug', npcAnim: { boss: 'sad' } } }
          ] },
        { label: 'Học thêm tiếng Anh cho kịp',
          text: 'Bạn đăng ký lớp tiếng Anh buổi tối. Ba tháng sau đã “sync” với “align” trơn tru như ai.',
          effects: { smarts: 5, money: -3000000, happy: 2 },
          scene: { anim: 'study', fx: 'levelup', npcAnim: { boss: 'clap' } } }
      ]
    },
    {
      id: 'a_gop_tien_qua', title: 'Góp tiền mua quà sếp', icon: '🎁', age: [22, 45], weight: 0.8,
      req: { job: true },
      text: 'Nhóm chat phòng lại sôi động: “Mỗi người góp {money:300000} mua quà sinh nhật sếp nha.” Tháng này đã là đợt góp thứ ba, ví bạn mỏng như tờ lịch.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'coworker', gender: 'f', anim: 'talk', say: 'Góp 300 nghìn mua quà sếp nha!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Góp ngay, còn đề xuất quà',
          text: 'Bạn góp tiền, còn nghĩ ra món quà sếp thích nhất. Sếp cảm động, nhớ tên bạn đầu tiên.',
          effects: { money: -300000, happy: 2, karma: 2 },
          scene: { anim: 'nod', fx: 'idea', npcAnim: { coworker: 'clap' } } },
        { label: 'Góp, kèm một câu than',
          text: 'Bạn góp và thả câu: “Tháng này ăn mì thay cơm.” Cả phòng cười, hóa ra ai cũng đang ăn mì.',
          effects: { money: -300000, happy: 3 },
          scene: { anim: 'laugh', npcAnim: { coworker: 'laugh' } } },
        { label: 'Lặng lẽ không góp',
          text: 'Không ai nói gì, nhưng tấm thiệp ký tên cả phòng không có tên bạn.',
          effects: { happy: -2, karma: -1 },
          scene: { anim: 'shrug', npcAnim: { coworker: 'shake' } } }
      ]
    },
    // ======================= THEO NGHỀ =======================
    {
      id: 'a_shipper_bom_hang', title: 'Nồi lẩu bị bom', icon: '🛵', age: [18, 45],
      req: { jobId: ['shipper'] },
      text: 'Bạn chở đơn hàng qua nửa thành phố giữa trưa nắng 38 độ. Đến nơi, chị khách ra cửa lắc đầu: “Chị không đặt, em mang về đi.” Đơn hàng là... một nồi lẩu cá nấu sẵn.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'idle', expr: 'angry',
        npcs: [{ role: 'stranger', gender: 'f', age: 35, anim: 'shake', say: 'Chị không đặt, em mang về đi!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Năn nỉ chị khách nhận',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Chị khách mềm lòng, nhận đơn, còn đưa bạn chai nước mát.', effects: { happy: 3, karma: 2 },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'nod' }, npcSay: { stranger: 'Thôi được, chị lấy. Uống nước đi em.' } } },
            { text: 'Cánh cửa đóng cái rầm. Bạn ôm nồi lẩu về, bù {money:250000} tiền hàng.', effects: { money: -250000, happy: -5 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { stranger: 'walk' } } }
          ] },
        { label: 'Mang lẩu về ăn với anh em shipper',
          text: 'Cả hội shipper ngồi gốc cây ăn lẩu cá giữa trưa, cười nghiêng ngả. Mất {money:250000}, nhưng được bữa no.',
          effects: { money: -250000, happy: 5 },
          scene: { anim: 'eat', fx: 'steam', npcAnim: { stranger: 'walk' } } },
        { label: 'Đăng nhóm shipper “bóc phốt”',
          outcomes: [
            { p: 0.6, text: 'Bài đăng được hàng nghìn lượt chia sẻ, chị khách phải gọi lại xin lỗi và chuyển khoản đủ tiền.', effects: { happy: 6 },
              scene: { anim: 'phone', fx: 'exclaim' } },
            { p: 0.4, text: 'Bài đăng bị báo cáo, nhóm chia phe cãi nhau ầm ĩ. Bạn mệt hơn cả chạy đơn.', effects: { happy: -3, money: -250000 },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 'a_taixe_quen_do', title: 'Chiếc túi bỏ quên', icon: '💼', age: [20, 45],
      req: { jobId: ['taixe'] },
      text: 'Trả khách xong, bạn phát hiện một chiếc túi trên yên sau: trong có máy tính xách tay và xấp hồ sơ đóng dấu đỏ. Khách đã đi mất, điện thoại bạn còn 3% pin.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'think', expr: 'surprised', fx: 'question', shot: 'close' },
      choices: [
        { label: 'Chạy đi tìm chủ túi',
          text: 'Bạn xin sạc nhờ quán nước, gọi tổng đài, chạy ngược lại 5 cây số. Chủ túi rưng rưng: “Hồ sơ này là cả công ty anh!” rồi dúi cho bạn {money:1000000}.',
          effects: { money: 1000000, karma: 10, happy: 6 },
          scene: { anim: 'cheer', fx: 'sparkle' } },
        { label: 'Nộp cho công an phường',
          text: 'Bạn nộp túi, ký biên bản. Ba ngày sau chủ túi gọi điện cảm ơn rối rít.',
          effects: { karma: 7, happy: 3 },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Giữ cái máy, bỏ lại hồ sơ',
          outcomes: [
            { p: 0.3, text: 'Bạn bán máy được {money:6000000}. Từ đó, mỗi lần nhận cuốc, bạn lại giật mình nhìn yên sau.', effects: { money: 6000000, karma: -15, happy: -4 },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.7, text: 'Máy có định vị, công an tìm đến tận nhà. Tài khoản tài xế bị khóa, bạn còn bị phạt nặng.', effects: { karma: -15, happy: -12, money: -5000000, job: 'fire' },
              scene: { anim: 'scared', fx: 'exclaim' } }
          ] }
      ]
    },
    {
      id: 'a_bacsi_truc_dem', title: 'Ca trực 2 giờ sáng', icon: '🩺', age: [24, 50],
      req: { jobId: ['bacsi'] },
      text: 'Hai giờ sáng, một bé trai sốt cao co giật được bế vào, cùng lúc ông cụ giường số 3 lên cơn khó thở. Trực đêm nay chỉ có bạn và một điều dưỡng.',
      scene: { loc: 'hospital', time: 'night', weather: 'clear', anim: 'run', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 30, anim: 'cry', say: 'Bác sĩ ơi, cứu con em với!' }, { role: 'kid', gender: 'm', age: 4, anim: 'sick' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Cắt cơn cho bé, gọi điều dưỡng giữ ông cụ',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn cắt cơn co giật cho bé rồi kịp chạy sang ổn định ông cụ. Sáng ra, mẹ bé cúi đầu cảm ơn mãi không thôi.', effects: { karma: 8, happy: 8, smarts: 2 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'bow', kid: 'sleep' }, npcSay: { stranger: 'Ơn bác sĩ, em không biết nói sao...' } } },
            { text: 'Bé qua cơn nguy kịch, nhưng ông cụ phải chuyển hồi sức. Bạn ngồi thừ ở hành lang tới sáng.', effects: { karma: 4, happy: -6, health: -3 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'hug' } } }
          ] },
        { label: 'Gọi ngay bác sĩ cấp trên',
          text: 'Cấp trên tới trong 10 phút, hai người chia nhau cứu cả hai. Bạn học được một điều: không ai phải làm siêu nhân một mình.',
          effects: { smarts: 3, karma: 4, happy: 3 },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { stranger: 'pray' } } }
      ]
    },
    {
      id: 'a_giaovien_phong_bi', title: 'Phong bì sau buổi họp', icon: '✉️', age: [22, 50],
      req: { jobId: ['giaovien'] },
      text: 'Họp phụ huynh xong, một chị nán lại, dúi vào tay bạn chiếc phong bì dày cộp: “Chút lòng thành, nhờ em để ý cháu, cuối năm cho cháu học sinh giỏi.”',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 40, anim: 'talk', say: 'Chút lòng thành, em để ý cháu nhé.' }, { role: 'kid', age: 10, anim: 'idle' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Từ chối và trả lại',
          text: 'Bạn nhẹ nhàng trả lại: “Cháu cố thì cháu sẽ giỏi, chị ạ.” Chị phụ huynh ngượng, nhưng cuối năm nhắn cảm ơn vì con tiến bộ thật.',
          effects: { karma: 8, happy: 3 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'bow' } } },
        { label: 'Dùng tiền mua sách cho cả lớp',
          text: 'Bạn nói rõ sẽ dùng phong bì mua sách cho tủ sách lớp, và kèm em ấy thêm giờ ra chơi. Lạ, nhưng ai cũng hài lòng.',
          effects: { karma: 4, happy: 4, smarts: 1 },
          scene: { anim: 'study', fx: 'idea', npcAnim: { kid: 'jump' } } },
        { label: 'Nhận và nâng điểm',
          outcomes: [
            { p: 0.5, text: 'Không ai biết. Phong bì {money:3000000}, nhưng mỗi lần chấm bài em ấy, tay bạn lại nặng trĩu.', effects: { money: 3000000, karma: -10, happy: -3 },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.5, text: 'Phụ huynh khác phát hiện, làm đơn lên phòng giáo dục. Bạn bị kỷ luật, mất việc.', effects: { karma: -12, happy: -10, job: 'fire' },
              scene: { anim: 'cry', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 'a_laptrinh_sap_he_thong', title: 'Sập hệ thống chiều thứ Sáu', icon: '🐞', age: [21, 45],
      req: { jobId: ['laptrinh'] },
      text: '6 giờ chiều thứ Sáu, bạn vừa đẩy bản cập nhật lên. 6 giờ 05, nhóm chat nổ tung: “Ứng dụng sập rồi! Khách không thanh toán được!” Chuyến đi biển cuối tuần bắt đầu lung lay.',
      scene: { loc: 'office', time: 'dusk', weather: 'clear', anim: 'type', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'angry', say: 'Sập hết rồi! Sửa ngay cho anh!' }, { role: 'coworker', anim: 'facepalm' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Bình tĩnh dò lỗi',
          success: { stat: 'smarts', base: 0.2, scale: 0.7 },
          outcomes: [
            { text: 'Ba tiếng sau, bạn tìm ra một dấu chấm phẩy đặt sai chỗ. Hệ thống chạy lại, cả nhóm vỗ tay như vừa vô địch.', effects: { happy: 6, smarts: 3 },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { all: 'clap' } } },
            { text: 'Bạn thức trắng hai đêm mới sửa xong. Chuyến đi biển tan tành.', effects: { health: -5, happy: -6, smarts: 2 },
              scene: { time: 'night', anim: 'type', fx: 'zzz' } }
          ] },
        { label: 'Quay về bản cũ, thứ Hai tính',
          text: 'Bạn khôi phục bản cũ trong 5 phút, hệ thống chạy lại ngon lành. Một nước đi cực kỳ “lão làng”.',
          effects: { smarts: 2, happy: 4 },
          scene: { anim: 'shrug', fx: 'idea', npcAnim: { boss: 'nod' } } },
        { label: 'Đổ lỗi cho người làm cùng',
          outcomes: [
            { p: 0.3, text: 'Không ai kiểm tra lịch sử thay đổi. Bạn thoát, đồng nghiệp {coworker} chịu trận.', effects: { karma: -8, happy: -1 },
              scene: { anim: 'think', npcAnim: { coworker: 'sad' } } },
            { p: 0.7, text: 'Lịch sử thay đổi ghi rõ tên bạn. Cả nhóm nhìn bạn bằng ánh mắt khác hẳn.', effects: { karma: -8, happy: -7 },
              scene: { anim: 'facepalm', fx: 'exclaim', npcAnim: { coworker: 'point', boss: 'angry' } } }
          ] }
      ]
    },
    {
      id: 'a_streamer_anti', title: 'Hội anti-fan', icon: '📱', age: [18, 40],
      req: { jobId: ['streamer'] },
      text: 'Clip mới của bạn bất ngờ lên xu hướng, kèm theo hàng nghìn bình luận chê bai từ một hội anti-fan. Có người còn cắt ghép mặt bạn thành ảnh chế.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'sad', fx: 'heartbreak', shot: 'close' },
      choices: [
        { label: 'Livestream đáp trả',
          outcomes: [
            { p: 0.5, text: 'Bạn đáp trả khéo léo, hài hước. Lượt theo dõi tăng vọt, anti-fan cũng phải bật cười.', effects: { happy: 8, money: 5000000 },
              scene: { anim: 'talk', fx: 'stars' } },
            { p: 0.5, text: 'Bạn nóng giận, lỡ lời trên sóng. Ồn ào kéo dài cả tuần, mất luôn hợp đồng quảng cáo.', effects: { happy: -8, money: -5000000 },
              scene: { anim: 'angry', fx: 'anger' } }
          ] },
        { label: 'Tắt bình luận, đi ngủ',
          text: 'Bạn tắt điện thoại, ngủ một giấc. Một tuần sau mạng đã quên, còn bạn thì khỏe re.',
          effects: { happy: 2, health: 2 },
          scene: { anim: 'sleep', fx: 'zzz' } },
        { label: 'Tự chế ảnh mình còn hài hơn',
          text: 'Bạn tung loạt ảnh tự chế, cả cộng đồng mạng cười lăn. Anti-fan thành fan cứng.',
          effects: { happy: 9, money: 3000000, looks: 1 },
          scene: { anim: 'laugh', fx: 'confetti' } }
      ]
    },
    {
      id: 'a_quan_khach_che', title: 'Khách chê mà ăn sạch', icon: '🍲', age: [18, 45],
      req: { jobId: ['daubep', 'phucvu'] },
      text: 'Bàn 10 người gọi đủ món, ăn xong gọi bạn ra: “Canh chua thì chua quá, cá thì tanh, cơm thì khô!” Trên bàn, đĩa nào cũng sạch bóng.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'point', say: 'Món nào cũng dở! Không trả tiền!' }, { role: 'crowd', anim: 'eat' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Xin lỗi, tặng chè tráng miệng',
          text: 'Bạn cúi chào, mời cả bàn chè đậu. Ông khách hơi ngượng, rồi trả đủ tiền.',
          effects: { karma: 3, happy: 2, money: -200000 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'shrug' } } },
        { label: 'Chỉ vào đĩa trống, hỏi thật lòng',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: '“Dạ, món dở mà cả bàn ăn sạch, chắc lỗi tại bếp nấu... ít quá ạ?” Cả bàn cười ồ, ông khách trả tiền còn boa thêm.', effects: { happy: 6, money: 200000 },
              scene: { anim: 'point', fx: 'money', npcAnim: { all: 'laugh' } } },
            { text: 'Ông khách nổi giận, chấm quán 1 sao kèm bài văn dài hai trang.', effects: { happy: -5 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { stranger: 'angry' } } }
          ] },
        { label: 'Gọi chủ quán ra xử',
          text: 'Chủ quán xử lý êm thấm, rồi trừ lương bạn {money:500000} gọi là “tiền thiện chí”.',
          effects: { money: -500000, happy: -4 },
          scene: { anim: 'sad', npcAnim: { stranger: 'nod' } } }
      ]
    },
    {
      id: 'a_congnhan_thuong_tet', title: 'Tăng ca tháng Chạp', icon: '🏭', age: [18, 45], once: false, cooldown: 3,
      req: { jobId: ['congnhan'] },
      text: 'Nhà máy thông báo: ai tăng ca đủ tháng Chạp được thưởng Tết thêm {money:3000000}. Nhưng nếu ở lại, bạn chỉ kịp về quê chiều Ba mươi.',
      scene: { loc: 'street', time: 'dawn', weather: 'fog', anim: 'walk', expr: 'sleepy',
        npcs: [{ role: 'coworker', anim: 'walk', say: 'Tăng ca không? Thêm 3 triệu đó!' }, { role: 'crowd', anim: 'walk' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Tăng ca lấy thưởng',
          text: 'Bạn làm quần quật cả tháng, chiều Ba mươi mới lên xe về quê, ôm theo phong bì dày cộp. Cả nhà thấy bạn gầy mà xót.',
          effects: { money: 3000000, health: -3, happy: 1 },
          scene: { anim: 'lift', fx: 'sweat', npcAnim: { coworker: 'lift' } } },
        { label: 'Về sớm phụ nhà dọn Tết',
          text: 'Bạn về sớm, phụ gói bánh chưng, lau bàn thờ, quét lại cái sân. Tết năm nay ấm hẳn.',
          effects: { happy: 7, rel: { all: 3 } },
          scene: { loc: 'countryside', time: 'day', weather: 'clear', decor: 'tet', anim: 'cheer', fx: 'petals' } }
      ]
    },
    {
      id: 'a_kinhdoanh_mat_bang', title: 'Mặt bằng tăng giá', icon: '🏪', age: [25, 55],
      req: { jobId: ['kinhdoanh'] },
      text: 'Chủ nhà nơi bạn thuê mặt bằng báo tăng giá 30% từ tháng sau, “vì đường này sắp lên giá”. Khách quen của bạn đều ở khu này cả.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'angry',
        npcs: [{ role: 'stranger', gender: 'm', age: 60, anim: 'talk', say: 'Tháng sau tăng 30% nhé, đường lên giá!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Đàm phán hợp đồng dài hạn',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đề nghị ký 5 năm, đổi lại chỉ tăng 10%. Chủ nhà gật gù bắt tay.', effects: { money: -20000000, happy: 4 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'nod' } } },
            { text: 'Chủ nhà không nhượng bộ. Bạn cắn răng trả giá mới.', effects: { money: -60000000, happy: -5 },
              scene: { anim: 'sad', fx: 'money', npcAnim: { stranger: 'shake' } } }
          ] },
        { label: 'Dời vào mặt bằng trong hẻm',
          outcomes: [
            { p: 0.5, text: 'Khách quen theo bạn vào hẻm, còn rủ thêm bạn bè. Tiết kiệm được kha khá!', effects: { money: 20000000, happy: 5 },
              scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.5, text: 'Hẻm sâu, khách thưa hẳn. Doanh thu giảm một nửa suốt nửa năm đầu.', effects: { money: -40000000, happy: -6 },
              scene: { anim: 'sad', fx: 'dust' } }
          ] },
        { label: 'Chuyển hẳn sang bán online',
          text: 'Bạn trả mặt bằng, tối nào cũng livestream bán hàng tới khàn giọng. Mệt, nhưng chi phí giảm hẳn.',
          effects: { money: 10000000, health: -2, smarts: 2 },
          scene: { loc: 'home', time: 'night', anim: 'talk', fx: 'stars' } }
      ]
    },

    // ======================= ĐÔ THỊ =======================
    {
      id: 'a_ket_xe', title: 'Kẹt xe giờ cao điểm', icon: '🚦', age: [18, 50], once: false, cooldown: 4, weight: 1.2,
      text: 'Giờ cao điểm, ngã tư kẹt cứng, khói xe mù mịt. Bạn đứng im 25 phút rồi, còn 10 phút nữa là tới cuộc hẹn quan trọng.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'drive', expr: 'angry',
        npcs: [{ role: 'stranger', gender: 'm', age: 40, anim: 'drive', say: 'Nhích lên chút coi, nóng quá!' }, { role: 'crowd', anim: 'drive' }], fx: 'smoke', shot: 'wide' },
      choices: [
        { label: 'Leo vỉa hè đi tắt',
          outcomes: [
            { p: 0.5, text: 'Bạn len lỏi qua vỉa hè, tới kịp giờ. Phía sau vọng lại vài tiếng chửi.', effects: { happy: 2, karma: -3 },
              scene: { anim: 'drive', fx: 'dust' } },
            { p: 0.5, text: 'Vừa lên vỉa hè đã gặp tổ trật tự đô thị. Phạt {money:400000}, trễ thêm 30 phút.', effects: { money: -400000, happy: -5, karma: -3 },
              scene: { anim: 'facepalm', fx: 'exclaim' } }
          ] },
        { label: 'Kiên nhẫn, bật nhạc hát theo',
          text: 'Bạn đeo tai nghe, hát nhẩm hết cả album. Đến muộn, nhưng tâm hồn bình yên lạ thường.',
          effects: { happy: 2, karma: 1 },
          scene: { anim: 'sing', fx: 'music', npcAnim: { stranger: 'laugh' } } },
        { label: 'Gửi xe, chạy bộ nốt',
          text: 'Bạn gửi xe ven đường, chạy bộ 2 cây số. Tới nơi mồ hôi nhễ nhại, nhưng đúng giờ.',
          effects: { health: 2, happy: -1, money: -10000 },
          scene: { anim: 'run', fx: 'sweat' } }
      ]
    },
    {
      id: 'a_ngap_nuoc', title: 'Phố thành sông', icon: '🌊', age: [18, 50], once: false, cooldown: 4,
      req: { asset: 'motorbike' },
      text: 'Mưa lớn 40 phút, con đường về nhà biến thành sông. Nước ngập tới yên, chiếc xe máy của bạn ho khục khục rồi tắt lịm giữa dòng.',
      scene: { loc: 'street', time: 'dusk', weather: 'storm', anim: 'drive', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 52, anim: 'wave', say: 'Đẩy vô đây chú sửa cho!' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Đẩy vào tiệm sửa ven đường',
          text: 'Chú sửa xe tháo bugi, lau khô, 15 phút sau xe nổ máy. Giá {money:150000} vì “trời mưa mà con”.',
          effects: { money: -150000, happy: 1 },
          scene: { anim: 'walk', fx: 'sparkle', npcAnim: { stranger: 'nod' } } },
        { label: 'Lội bộ dắt xe về nhà',
          text: 'Bạn lội nước 3 cây số, về tới nhà ướt như chuột lột và hắt hơi liên tục.',
          effects: { health: -4, happy: -3, illness: 'Cảm cúm' },
          scene: { anim: 'walk', fx: 'sick' } },
        { label: 'Cố đề tiếp, quyết không thua',
          outcomes: [
            { p: 0.3, text: 'Xe nổ thật! Bạn rồ ga lướt qua dòng nước như anh hùng phim hành động.', effects: { happy: 6 },
              scene: { anim: 'drive', fx: 'stars', npcAnim: { stranger: 'clap' } } },
            { p: 0.7, text: 'Nước vào máy, xe hỏng nặng. Sửa hết {money:2500000}.', effects: { money: -2500000, happy: -6 },
              scene: { anim: 'facepalm', fx: 'smoke', npcAnim: { stranger: 'shake' } } }
          ] }
      ]
    },
    {
      id: 'a_mat_xe', title: 'Hai phút định mệnh', icon: '🏍️', age: [18, 50], weight: 0.7,
      req: { asset: 'motorbike' },
      text: 'Bạn chạy vào tiệm tạp hóa mua chai nước, chưa đầy hai phút. Bước ra, chỗ để xe trống trơn, chỉ còn cái mũ bảo hiểm lăn lóc.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'vendor', gender: 'f', age: 50, anim: 'point', say: 'Thằng áo đen dắt xe chạy hướng kia!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đuổi theo, hô hoán',
          outcomes: [
            { p: 0.25, text: 'Bạn vừa chạy vừa hô “Trộm! Trộm!”. Người đi đường xúm lại chặn, tên trộm bỏ xe chạy mất.', effects: { happy: 8, health: -1 },
              scene: { anim: 'run', fx: 'stars', npcAnim: { vendor: 'clap' } } },
            { p: 0.75, text: 'Bạn chạy hết hai con hẻm, hụt hơi. Chiếc xe đã mất hút.', effects: { happy: -10, health: -2, asset: { lose: 'motorbike' } },
              scene: { anim: 'run', fx: 'sweat' } }
          ] },
        { label: 'Báo công an, xin xem camera',
          outcomes: [
            { p: 0.4, text: 'Nhờ camera nhà dân, công an tìm lại được xe sau một tuần. Bạn mừng như bắt được vàng.', effects: { happy: 6, karma: 2 },
              scene: { anim: 'cheer', fx: 'sparkle' } },
            { p: 0.6, text: 'Camera mờ tịt, xe không tìm lại được. Bạn chuyển sang đi xe buýt.', effects: { happy: -8, asset: { lose: 'motorbike' } },
              scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Ngồi bệt xuống, cười như mếu',
          text: 'Bạn ngồi bệt lề đường, cười như mếu. Cô tạp hóa thương tình cho chai nước không lấy tiền. Xe thì mất thật.',
          effects: { happy: -6, karma: 1, asset: { lose: 'motorbike' } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { vendor: 'hug' }, npcSay: { vendor: 'Thôi, của đi thay người con ạ.' } } }
      ]
    },
    {
      id: 'a_csgt', title: 'Bị thổi phạt', icon: '👮', age: [18, 50], once: false, cooldown: 5,
      req: { asset: 'motorbike' },
      text: 'Bạn vừa lướt qua đèn vàng (hay đỏ nhỉ?) thì anh cảnh sát giao thông giơ gậy ra hiệu. Bằng lái của bạn... hình như đang nằm ở nhà.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'drive', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 30, anim: 'point', say: 'Mời xuất trình giấy tờ xe và bằng lái.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Thành thật nhận lỗi',
          text: 'Bạn nhận lỗi, ký biên bản. Phạt {money:1200000} cho cả hai lỗi. Đau ví nhưng nhẹ lòng.',
          effects: { money: -1200000, karma: 3, happy: -3 },
          scene: { anim: 'nod', npcAnim: { police: 'nod' } } },
        { label: 'Gọi điện cho “người quen”',
          text: 'Bạn bấm số ông chú họ xa. Ông bảo: “Chú làm ở vườn thú, quen mỗi con hổ.” Bạn vẫn bị phạt {money:1200000}, kèm cái nhìn ái ngại của anh cảnh sát.',
          effects: { money: -1200000, happy: -4 },
          scene: { anim: 'phone', fx: 'sweat', npcAnim: { police: 'shake' } } },
        { label: 'Năn nỉ, kể hoàn cảnh',
          success: { stat: 'looks', base: 0.2, scale: 0.4 },
          outcomes: [
            { text: 'Anh cảnh sát thở dài: “Lần này nhắc nhở, lần sau nhớ mang giấy tờ.” Bạn cảm ơn rối rít.', effects: { happy: 5 },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { police: 'wave' } } },
            { text: '“Hoàn cảnh ai cũng khó, luật vẫn là luật.” Phạt {money:1200000}.', effects: { money: -1200000, happy: -4 },
              scene: { anim: 'sad', npcAnim: { police: 'shake' }, npcSay: { police: 'Luật vẫn là luật nhé.' } } }
          ] }
      ]
    },
    {
      id: 'a_giao_nham', title: 'Giao nhầm hàng', icon: '📦', age: [18, 50],
      text: 'Cậu shipper đưa bạn một kiện hàng to đùng rồi vội đi đơn khác. Mở ra là chiếc máy massage chân đắt tiền, trong khi bạn chỉ đặt... một cái ốp điện thoại {money:45000}.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 24, anim: 'wave', say: 'Hàng của mình đây ạ, em đi nha!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Gọi shipper quay lại',
          text: 'Cậu shipper quay lại, mặt tái mét: “Em cảm ơn, không là em đền nửa năm lương!” Hôm sau cậu mang biếu bạn hộp bánh.',
          effects: { karma: 8, happy: 4 },
          scene: { anim: 'wave', fx: 'sparkle', npcAnim: { stranger: 'bow' }, npcSay: { stranger: 'Em cảm ơn anh chị nhiều lắm!' } } },
        { label: 'Giữ luôn, chân cũng đang mỏi',
          outcomes: [
            { p: 0.4, text: 'Không ai đòi. Tối nào bạn cũng ngâm chân, sướng mà lòng cứ gợn gợn.', effects: { karma: -8, happy: 3, health: 1 },
              scene: { anim: 'sit', fx: 'bubbles' } },
            { p: 0.6, text: 'Ba ngày sau cậu shipper tìm tới, mắt đỏ hoe vì bị trừ lương. Bạn trả hàng trong xấu hổ.', effects: { karma: -6, happy: -5 },
              scene: { anim: 'facepalm', npcAnim: { stranger: 'cry' } } }
          ] },
        { label: 'Thử 15 phút rồi mới trả',
          text: 'Bạn ngâm chân đúng 15 phút rồi đóng hộp gọi trả. Tội lỗi vừa đủ, sảng khoái cũng vừa đủ.',
          effects: { happy: 3, karma: 2, health: 1 },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 'a_cuoc_goi_lua_dao', title: 'Cuộc gọi lạ', icon: '☎️', age: [18, 55], weight: 1.2,
      text: 'Số lạ gọi đến, giọng nghiêm trọng: “Tôi là cán bộ điều tra. Tài khoản của bạn liên quan đến đường dây rửa tiền. Chuyển toàn bộ tiền vào tài khoản tạm giữ để xác minh ngay!”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'phone', expr: 'scared', say: 'Dạ... rửa tiền ạ?', fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Cúp máy, chặn số',
          text: 'Bạn cúp máy, chặn số, đăng lên mạng cảnh báo mọi người. Tỉnh táo hơn cả thám tử!',
          effects: { smarts: 2, happy: 3, karma: 2 },
          scene: { anim: 'shake', fx: 'idea' } },
        { label: 'Trêu lại kẻ lừa đảo',
          text: 'Bạn giả vờ hoảng hốt, hỏi đi hỏi lại số tài khoản suốt 20 phút, rồi bảo: “Để em hỏi mẹ em đã.” Đầu dây bên kia cúp máy trong tức tối.',
          effects: { happy: 6 },
          scene: { anim: 'laugh', say: 'Anh đọc lại số đi, em ghi chưa kịp!', fx: 'music' } },
        { label: 'Hoảng quá, làm theo',
          success: { stat: 'smarts', base: 0.2, scale: 0.6 },
          outcomes: [
            { text: 'Đang bấm chuyển thì bạn khựng lại: công an đâu có làm việc qua điện thoại? Bạn tắt máy, tay vẫn còn run.', effects: { happy: -2, smarts: 2 },
              scene: { anim: 'scared', fx: 'sweat' } },
            { text: 'Bạn chuyển gần hết tiền trong tài khoản. Gọi lại thì số máy đã không liên lạc được.', effects: { moneyPct: -0.4, happy: -12 },
              scene: { anim: 'cry', fx: 'tears', shot: 'dramatic' } }
          ] }
      ]
    },
    {
      id: 'a_tien_dien', title: 'Hóa đơn tháng Sáu', icon: '💡', age: [20, 55], once: false, cooldown: 4,
      text: 'Tháng Sáu nắng như đổ lửa, máy lạnh chạy cả ngày. Hóa đơn tiền điện về: {money:2800000}, gấp ba tháng trước. Bạn nhìn tờ hóa đơn như nhìn bảng điểm môn Toán.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'facepalm', expr: 'surprised', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Trả tiền, kêu trời',
          text: 'Bạn trả tiền rồi than với cả xóm. Hóa ra nhà nào cũng thế, coi như được an ủi.',
          effects: { money: -2800000, happy: -3 },
          scene: { anim: 'sad', fx: 'sweat' } },
        { label: 'Tắt máy lạnh, trải chiếu nằm quạt',
          text: 'Bạn chuyển sang quạt cây, tối trải chiếu xuống nền gạch mà ngủ. Tiền điện giảm hẳn, ký ức tuổi thơ ùa về.',
          effects: { money: -1200000, health: -1, happy: 1 },
          scene: { anim: 'sleep', time: 'night', fx: 'zzz' } },
        { label: 'Lắp điện mặt trời trên mái', req: { minMoney: 60000000 },
          text: 'Bạn chi {money:60000000} lắp tấm pin mặt trời. Đắt lúc đầu, nhưng từ đó tiền điện gần như bằng không.',
          effects: { money: -60000000, happy: 4, smarts: 2 },
          scene: { anim: 'cheer', fx: 'sparkle' } }
      ]
    },
    {
      id: 'a_karaoke_hang_xom', title: 'Karaoke xuyên đêm', icon: '🎤', age: [18, 55], once: false, cooldown: 5,
      text: '11 giờ đêm, ông hàng xóm vẫn mở loa kẹo kéo hát bolero lần thứ chín, giọng lên không tới mà quyết không bỏ cuộc. Sáng mai bạn phải dậy từ 6 giờ.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'angry', expr: 'sleepy',
        npcs: [{ role: 'neighbor', gender: 'm', age: 55, anim: 'sing', say: 'Bài cuối thôi, bài cuối thôi mà!' }], fx: 'music', shot: 'wide' },
      choices: [
        { label: 'Sang góp ý nhẹ nhàng',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Ông hàng xóm gãi đầu: “Ờ, bác quên mất giờ.” Loa tắt, hôm sau bác còn biếu bạn đĩa chả giò.', effects: { happy: 4, karma: 2 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { neighbor: 'bow' }, npcSay: { neighbor: 'Ờ, bác quên mất giờ!' } } },
            { text: 'Bác ấy kéo bạn vào... hát cùng. Bạn từ chối, về nằm nghe tiếp tới 1 giờ sáng.', effects: { happy: -4, health: -2 },
              scene: { anim: 'facepalm', fx: 'zzz', npcAnim: { neighbor: 'sing' } } }
          ] },
        { label: 'Mở loa nhà mình to hơn',
          text: 'Hai nhà đấu loa tới nửa đêm, cả xóm thức trắng. Sáng ra tổ trưởng dân phố đến làm việc với cả hai.',
          effects: { happy: -2, karma: -5, health: -2 },
          scene: { anim: 'dance', fx: 'music', npcAnim: { neighbor: 'angry' } } },
        { label: 'Gọi tổ dân phố',
          outcomes: [
            { p: 0.6, text: 'Tổ dân phố đến nhắc, loa tắt ngay. Ông hàng xóm giận bạn cả tháng.', effects: { happy: 2, karma: -1 },
              scene: { anim: 'phone', npcAnim: { neighbor: 'angry' } } },
            { p: 0.4, text: 'Không ai nghe máy. Bạn nhét bông vào tai, mơ thấy mình đang đi hát karaoke.', effects: { happy: -3, health: -1 },
              scene: { anim: 'sleep', fx: 'zzz' } }
          ] },
        { label: 'Sang song ca luôn',
          text: 'Bạn mặc kệ, qua hát một bài song ca. Cả xóm vỗ tay, từ đó ông hàng xóm coi bạn như con cháu.',
          effects: { happy: 6, health: -1 },
          scene: { anim: 'sing', fx: 'music', npcAnim: { neighbor: 'clap' } } }
      ]
    },
    {
      id: 'a_chuyen_tro', title: 'Chuyển nhà trọ', icon: '📦', age: [18, 35], once: false, cooldown: 6, weight: 0.8,
      req: { noAsset: 'house' },
      text: 'Hợp đồng thuê nhà hết hạn, bạn phải dọn đi. Đồ đạc tưởng ít, gom lại thành 14 thùng các-tông, một nồi cơm điện và một chậu xương rồng sống dai.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'lift', expr: 'sad',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'talk', say: 'Xe ba gác 300 nghìn, một chuyến gọn!' }], fx: 'dust', shot: 'wide' },
      choices: [
        { label: 'Thuê xe ba gác chở',
          text: 'Chú ba gác chở một chuyến gọn gàng. Mất {money:300000}, đổi lại cái lưng còn nguyên.',
          effects: { money: -300000, happy: 2 },
          scene: { anim: 'wave', npcAnim: { stranger: 'lift' } } },
        { label: 'Tự chở bằng xe máy 10 chuyến',
          text: 'Bạn chạy 10 chuyến, chuyến cuối ôm chậu xương rồng. Lưng đau ba ngày, nhưng tiết kiệm được tiền.',
          effects: { health: -3, happy: -1 },
          scene: { anim: 'drive', fx: 'sweat' } },
        { label: 'Gọi hội bạn tới phụ, bao ăn', req: { has: ['friend'] },
          text: 'Cả hội kéo tới, khuân vác một buổi chiều rồi ngồi ăn lẩu mừng nhà mới. Dọn nhà mà như đi hội.',
          effects: { money: -500000, happy: 7, rel: { friend: 4 } },
          scene: { time: 'night', anim: 'eat', fx: 'steam' } }
      ]
    },
    {
      id: 'a_tai_nan_giup', title: 'Người ngã giữa đường', icon: '🚑', age: [18, 55],
      text: 'Trên đường về, bạn thấy một người đi xe máy ngã sóng soài, chân chảy máu. Xung quanh mọi người đứng quay phim, chưa ai dám lại đỡ.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'sick', expr: 'sick' }, { role: 'crowd', anim: 'phone' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Lao vào sơ cứu, gọi cấp cứu',
          text: 'Bạn cầm máu, gọi 115, ở lại tới khi xe cấp cứu đến. Tuần sau gia đình người ấy tìm tới cảm ơn, rưng rưng nước mắt.',
          effects: { karma: 12, happy: 6 },
          scene: { anim: 'hug', fx: 'sparkle', npcSay: { stranger: 'Cảm ơn con... cảm ơn nhiều lắm...' } } },
        { label: 'Gọi cấp cứu rồi đứng chờ',
          text: 'Bạn gọi 115 và đứng chờ cùng mọi người. Không anh hùng, nhưng đủ tử tế.',
          effects: { karma: 5, happy: 1 },
          scene: { anim: 'phone', say: 'Alo 115 ạ, ở đây có tai nạn!' } },
        { label: 'Lặng lẽ đi tiếp',
          text: 'Bạn đi tiếp. Tối đó, hình ảnh người nằm giữa đường cứ hiện lại trong đầu.',
          effects: { karma: -6, happy: -4 },
          scene: { anim: 'walk', fx: 'question' } }
      ]
    },

    // ======================= TÌNH YÊU =======================
    {
      id: 'a_hen_ho_app', title: 'Gặp mặt người quen qua app', icon: '📲', age: [18, 40], weight: 1.2,
      req: { lacks: ['partner', 'spouse'] },
      text: 'Sau ba tuần nhắn tin trên ứng dụng hẹn hò, hai người hẹn gặp ở quán cà phê. Người bước vào trông khác ảnh đại diện chừng năm tuổi và ba lớp filter, nhưng nụ cười thì rất thật.',
      scene: { loc: 'cafe', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', anim: 'wave', say: 'Chào nha! Ngoài đời hơi khác ảnh nhỉ?' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Trò chuyện thật lòng',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Hai người nói chuyện tới lúc quán đóng cửa. Hóa ra hợp nhau đến lạ!', effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'stranger' } },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'love' } } },
            { text: 'Nói chuyện vui, nhưng không có “tia lửa”. Hai người chia tiền, chào nhau thân thiện.', effects: { happy: 1, money: -100000 },
              scene: { anim: 'shrug', npcAnim: { stranger: 'wave' } } }
          ] },
        { label: 'Giả vờ có cuộc gọi khẩn',
          text: 'Bạn áp điện thoại vào tai: “Hả? Nhà cháy á?” rồi chạy mất. Về tới nhà thấy mình hơi tệ.',
          effects: { karma: -4, happy: -1 },
          scene: { anim: 'run', say: 'Hả? Cháy nhà á? Mình phải đi!', fx: 'sweat', npcAnim: { stranger: 'shrug' } } },
        { label: 'Thú nhận mình cũng dùng filter',
          text: 'Hai người cười ngặt nghẽo, trút hết áp lực. Một tình bạn đẹp bắt đầu.',
          effects: { happy: 6, addPerson: { role: 'friend', fromScene: 'stranger' } },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { stranger: 'laugh' } } }
      ]
    },
    {
      id: 'a_nguoi_yeu_cu', title: 'Tin nhắn lúc 11 giờ đêm', icon: '🌙', age: [20, 45],
      req: { has: ['ex'] },
      text: '{ex} nhắn tin: “Ngủ chưa? Tự nhiên nhớ những ngày xưa quá...” kèm tấm ảnh cũ hai người chụp ở biển năm nào.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised', fx: 'heartbreak', shot: 'close' },
      choices: [
        { label: 'Hẹn gặp lại một lần', req: { lacks: ['partner', 'spouse'] },
          outcomes: [
            { p: 0.4, text: 'Hai người ngồi cà phê, nói chuyện như chưa từng xa. Ngọn lửa cũ khẽ bùng lên.', effects: { happy: 8, rel: { ex: 15 }, flag: 'a_gap_lai_nguoi_cu' },
              scene: { loc: 'cafe', anim: 'love', fx: 'hearts' } },
            { p: 0.6, text: 'Gặp rồi mới nhớ vì sao ngày ấy chia tay. Bữa cà phê kết thúc trong im lặng.', effects: { happy: -4, rel: { ex: -5 } },
              scene: { loc: 'cafe', anim: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Trả lời xã giao rồi thôi',
          text: 'Bạn nhắn: “Mình khỏe, chúc bạn mọi điều tốt.” Rồi úp điện thoại, ngủ ngon. Trưởng thành là thế.',
          effects: { happy: 2, smarts: 1 },
          scene: { anim: 'sleep', fx: 'zzz' } },
        { label: 'Chặn luôn, không do dự',
          text: 'Bạn chặn {ex} trong một nốt nhạc. Cuộc sống hiện tại đã đủ bận rộn rồi.',
          effects: { happy: 1, rel: { ex: -20 } },
          scene: { anim: 'shake', fx: 'anger' } }
      ]
    },
    {
      id: 'a_ghen_tuong', title: 'Ghen', icon: '😤', age: [18, 45],
      req: { has: ['partner'] },
      text: '{partner} cầm điện thoại của bạn, mặt lạnh tanh: “Ai nhắn “ngủ ngon nha” lúc 12 giờ đêm đây?” Thật ra đó là nhóm chat công việc... nhưng tin nhắn hiện lên trông đáng ngờ vô cùng.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'shrug', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'angry', say: 'Ai nhắn “ngủ ngon nha” lúc nửa đêm?' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Bình tĩnh mở nhóm chat cho xem',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: '{partner} đọc cả đoạn chat, đỏ mặt rồi bật cười. Hai người ôm nhau, hứa không ghen vớ vẩn nữa.', effects: { happy: 5, rel: { partner: 5 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug' } } },
            { text: '{partner} vẫn nghi: “Xóa bớt rồi chứ gì!” Cả tuần lạnh nhạt.', effects: { happy: -5, rel: { partner: -8 } },
              scene: { anim: 'sad', npcAnim: { partner: 'shake' } } }
          ] },
        { label: 'Giận lại vì bị xem trộm điện thoại',
          outcomes: [
            { p: 0.5, text: 'Hai người cãi to, rồi ngồi xuống nói chuyện nghiêm túc về niềm tin. Mệt, nhưng hiểu nhau hơn.', effects: { happy: -2, rel: { partner: 2 } },
              scene: { anim: 'talk', npcAnim: { partner: 'nod' } } },
            { p: 0.5, text: 'Cãi nhau to, {partner} xách túi bỏ về nhà ba ngày.', effects: { happy: -8, rel: { partner: -12 } },
              scene: { anim: 'angry', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Đùa: “Bạn tri kỷ tiền kiếp đấy”',
          outcomes: [
            { p: 0.5, text: '{partner} phì cười, đấm nhẹ vào vai bạn. Giông bão tan.', effects: { happy: 3, rel: { partner: 3 } },
              scene: { anim: 'laugh', npcAnim: { partner: 'laugh' } } },
            { p: 0.5, text: '{partner} không thấy buồn cười chút nào. Đêm đó bạn ngủ ghế.', effects: { happy: -3, rel: { partner: -6 } },
              scene: { anim: 'sleep', fx: 'zzz', npcAnim: { partner: 'angry' } } }
          ] }
      ]
    },
    {
      id: 'a_ra_mat', title: 'Ra mắt nhà người yêu', icon: '🫖', age: [20, 40],
      req: { has: ['partner'], married: false },
      text: 'Hôm nay bạn theo {partner} về ra mắt. Bố {partner} ngồi nghiêm nghị bên bộ bàn ghế gỗ, còn mẹ {partner} nhìn bạn từ đầu đến chân rồi hỏi: “Cháu làm nghề gì? Quê ở đâu?”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'bow', expr: 'scared',
        npcs: [{ role: 'partner', anim: 'idle' }, { role: 'relative', gender: 'f', age: 55, anim: 'talk', say: 'Cháu làm nghề gì? Quê ở đâu?' }, { role: 'stranger', gender: 'm', age: 58, anim: 'sit' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Xắn tay vào bếp phụ nấu',
          text: 'Bạn xin vào bếp nhặt rau, rửa bát thoăn thoắt. Mẹ {partner} gật gù: “Được, nhanh nhẹn đấy!”',
          effects: { happy: 6, karma: 2, rel: { partner: 8 } },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { relative: 'nod', partner: 'love' } } },
        { label: 'Uống rượu cùng bố người yêu',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Hai chén, bốn chén... bố {partner} vỗ vai bạn: “Được! Có bản lĩnh!”', effects: { happy: 6, health: -2, rel: { partner: 6 } },
              scene: { anim: 'drink', fx: 'stars', npcAnim: { stranger: 'laugh' }, npcSay: { stranger: 'Được! Có bản lĩnh!' } } },
            { text: 'Chén thứ ba bạn đã đỏ mặt, chén thứ năm thì gục xuống bàn. Cả nhà cười, {partner} xấu hổ muốn độn thổ.', effects: { happy: -3, health: -3, rel: { partner: -4 } },
              scene: { anim: 'sleep', fx: 'zzz', npcAnim: { partner: 'facepalm', stranger: 'laugh' } } }
          ] },
        { label: 'Khoe kế hoạch tương lai hơi quá',
          text: 'Bạn kể về kế hoạch mua nhà, mua xe, đi du lịch châu Âu... Bố {partner} hỏi: “Thế giờ cháu để dành được bao nhiêu?” Bạn im lặng.',
          effects: { happy: -3, rel: { partner: -2 } },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { stranger: 'think' }, npcSay: { stranger: 'Thế giờ cháu có bao nhiêu?' } } }
      ]
    },
    {
      id: 'a_me_giuc_cuoi', title: 'Mẹ giục cưới', icon: '💍', age: [26, 38], weight: 1.2,
      req: { has: ['mother'], married: false },
      text: '{mother.K} {mother} gọi lần thứ ba trong tuần: “Con nhà cô Hạnh đầu ngõ cưới rồi, đẻ hai đứa rồi. Còn con, bao giờ định cho mẹ bế cháu?”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'talk', say: 'Bao giờ con mới cho mẹ bế cháu?' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Hứa: “Năm sau mẹ ạ”',
          text: '{mother.K} vui hẳn, khoe với cả xóm. Năm sau là chuyện của năm sau.',
          effects: { happy: 1, karma: -1, rel: { mother: 3 } },
          scene: { anim: 'nod', npcAnim: { mother: 'cheer' } } },
        { label: 'Nói thật lòng mình',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: '{mother.K} im lặng một lúc rồi nói: “Ừ, mẹ chỉ mong con hạnh phúc thôi.” Bạn ôm mẹ thật lâu.', effects: { happy: 6, rel: { mother: 8 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug' }, npcSay: { mother: 'Mẹ chỉ mong con hạnh phúc.' } } },
            { text: '{mother.K} rơm rớm: “Mẹ nuôi con lớn để con nói thế à?” Bữa cơm hôm ấy nghẹn ngào.', effects: { happy: -5, rel: { mother: -6 } },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { mother: 'cry' } } }
          ] },
        { label: 'Nhờ mẹ giới thiệu luôn', req: { lacks: ['partner'] },
          outcomes: [
            { p: 0.4, text: '{mother.K} mai mối cho một người con của bạn dì. Ai ngờ hợp thật!', effects: { happy: 8, rel: { mother: 6 }, addPerson: { role: 'partner' } },
              scene: { anim: 'love', fx: 'hearts', npcAnim: { mother: 'clap' } } },
            { p: 0.6, text: '{mother.K} xếp cho bạn bốn buổi xem mắt trong một tháng. Bạn uống cà phê thay cơm.', effects: { happy: -3, rel: { mother: 4 } },
              scene: { loc: 'cafe', anim: 'drink', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 'a_tet_ho_hang_hoi', title: 'Câu hỏi ngày Tết', icon: '🧧', age: [22, 40], once: false, cooldown: 3, weight: 1.3,
      text: 'Mùng Hai Tết, họ hàng tới chật nhà. Bác cả nhấp ngụm trà rồi hỏi to: “Năm nay lương tháng bao nhiêu? Bao giờ cưới? Mua nhà chưa?” Cả nhà quay sang chờ.',
      scene: { loc: 'home', time: 'day', weather: 'clear', decor: 'tet', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'relative', gender: 'm', age: 62, anim: 'talk', say: 'Lương bao nhiêu? Bao giờ cưới?' }, { role: 'crowd', anim: 'eat' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Trả lời thật lòng',
          text: 'Bạn nói thật con số. Bác cả gật gù: “Ừ, thế là được, cố lên.” Hóa ra không đáng sợ như tưởng.',
          effects: { happy: 2, karma: 1 },
          scene: { anim: 'talk', npcAnim: { relative: 'nod' } } },
        { label: 'Hỏi lại: “Lương hưu bác bao nhiêu ạ?”',
          text: 'Cả nhà nín thở, rồi cười rần rần. Bác cả chuyển sang chuyện... thời tiết. Bạn thắng trận đầu năm.',
          effects: { happy: 7, karma: -1 },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { all: 'laugh' }, npcSay: { relative: 'Ờ... năm nay trời đẹp nhỉ.' } } },
        { label: 'Phát lì xì cho lũ trẻ để lảng',
          text: 'Bạn rút xấp phong bao đỏ phát cho lũ nhóc. Tiếng reo hò át hết mọi câu hỏi. Ví mỏng đi {money:1000000}.',
          effects: { money: -1000000, happy: 4, karma: 3 },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { crowd: 'jump' } } },
        { label: 'Lủi xuống bếp rửa bát',
          text: 'Bạn trốn xuống bếp rửa sáu chục cái bát. Tay nhăn nheo, nhưng tai được yên.',
          effects: { happy: 1, karma: 2 },
          scene: { anim: 'cook', fx: 'bubbles' } }
      ]
    },
    {
      id: 'a_dam_cuoi_ban', title: 'Thiệp hồng', icon: '💌', age: [22, 42], once: false, cooldown: 3,
      req: { has: ['friend'] },
      text: 'Thiệp cưới đỏ chót của {friend} tới tay bạn. Tháng này đã là đám thứ ba. Câu hỏi muôn thuở: bỏ phong bì bao nhiêu cho vừa?',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'friend', anim: 'wave', say: 'Tới sớm nha, ngồi bàn bạn thân đó!' }, { role: 'crowd', anim: 'clap' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Phong bì {money:500000}',
          text: 'Bạn bỏ 500 nghìn, ăn đủ tám món, uống nước ngọt, chụp ảnh với cô dâu chú rể. Vừa vặn, an toàn.',
          effects: { money: -500000, happy: 3, rel: { friend: 2 } },
          scene: { anim: 'eat', npcAnim: { friend: 'wave' } } },
        { label: 'Phong bì {money:2000000}, bạn thân mà',
          text: '{friend} mở phong bì xong nhắn cảm ơn kèm ba trái tim. Tình bạn càng thêm bền.',
          effects: { money: -2000000, happy: 4, karma: 2, rel: { friend: 8 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { friend: 'hug' } } },
        { label: 'Lên sân khấu hát tặng',
          success: { stat: 'happy', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn hát say sưa, cả hội trường vỗ tay theo nhịp. Cô dâu chú rể cảm động rơi nước mắt.', effects: { money: -300000, happy: 8, rel: { friend: 6 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { all: 'clap' } } },
            { text: 'Bạn hát lệch tông từ câu đầu, MC phải chen vào cứu nguy. Video lan khắp nhóm bạn.', effects: { money: -300000, happy: -3, rel: { friend: 2 } },
              scene: { anim: 'sing', fx: 'sweat', npcAnim: { friend: 'facepalm', crowd: 'laugh' } } }
          ] },
        { label: 'Gửi phong bì nhờ người mang',
          text: 'Bạn gửi {money:300000} nhờ bạn chung mang tới. {friend} hơi buồn vì không thấy bạn trong ảnh cưới.',
          effects: { money: -300000, rel: { friend: -4 } },
          scene: { loc: 'home', anim: 'phone', fx: 'question' } }
      ]
    },
    {
      id: 'a_cai_nhau_tien', title: 'Khoản “linh tinh”', icon: '🧾', age: [24, 50],
      req: { married: true },
      text: 'Cuối tháng, {spouse.k} {spouse} cầm sổ chi tiêu chỉ vào dòng “Linh tinh: {money:3500000}”. “Linh tinh là gì? Giải thích đi!”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'shrug', expr: 'scared',
        npcs: [{ role: 'spouse', anim: 'angry', say: 'Linh tinh ba triệu rưỡi là gì đây?' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Thành thật kể từng khoản',
          text: 'Bạn liệt kê: cà phê, trà sữa, quà đồng nghiệp, mấy món đồ ăn vặt... {spouse.K} thở dài, rồi hai người cùng lập kế hoạch chi tiêu mới.',
          effects: { happy: 1, smarts: 1, rel: { spouse: 4 } },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { spouse: 'nod' } } },
        { label: 'Phản đòn: “Còn đôi giày tháng trước?”',
          outcomes: [
            { p: 0.5, text: 'Hai người nhìn nhau rồi cùng bật cười. Hòa nhau, mỗi người một lỗi.', effects: { happy: 3, rel: { spouse: 2 } },
              scene: { anim: 'laugh', npcAnim: { spouse: 'laugh' } } },
            { p: 0.5, text: 'Chiến tranh lạnh kéo dài ba ngày. Cơm vẫn có, nhưng không ai nói với ai.', effects: { happy: -6, rel: { spouse: -10 } },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { spouse: 'angry' } } }
          ] },
        { label: 'Giao hết tài chính cho {spouse.k}',
          text: '{spouse.K} nắm tay hòm chìa khóa, mỗi tuần phát cho bạn tiền tiêu vặt như học sinh. Nhà cửa yên ấm, ví bạn thì lép.',
          effects: { happy: -1, money: 3000000, rel: { spouse: 8 } },
          scene: { anim: 'bow', fx: 'money', npcAnim: { spouse: 'cheer' } } }
      ]
    },
    {
      id: 'a_quen_ky_niem', title: 'Hôm nay là ngày gì?', icon: '📅', age: [18, 40],
      req: { has: ['partner'] },
      text: 'Bạn đang chơi game thì {partner} nhắn: “Hôm nay là ngày gì?” Bạn nhìn lịch... chết rồi, tròn một năm yêu nhau, và bạn quên sạch.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'scared', fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Phóng đi mua hoa và bánh',
          outcomes: [
            { p: 0.7, text: '30 phút sau bạn xuất hiện với bó hoa và chiếc bánh kem. {partner} vờ giận rồi cười tít mắt.', effects: { money: -800000, happy: 4, rel: { partner: 6 } },
              scene: { loc: 'street', anim: 'run', fx: 'petals' } },
            { p: 0.3, text: 'Tiệm hoa đã đóng, bạn mang tới... một túi cam. {partner} vừa giận vừa buồn cười.', effects: { money: -60000, happy: -1, rel: { partner: -2 } },
              scene: { loc: 'street', anim: 'shrug', fx: 'question' } }
          ] },
        { label: 'Thú thật và xin lỗi',
          text: '{partner} giận cả tối, nhưng quý sự thành thật. Bạn cài lịch nhắc cho 50 năm tới.',
          effects: { karma: 2, rel: { partner: -3 } },
          scene: { anim: 'bow', fx: 'sweat' } },
        { label: 'Giả vờ đã chuẩn bị bất ngờ',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn ứng biến một bữa tối nến lung linh trong hai tiếng. {partner} cảm động không tin nổi.', effects: { money: -1000000, happy: 6, rel: { partner: 10 } },
              scene: { loc: 'home', anim: 'cook', fx: 'hearts' } },
            { text: 'Bất ngờ của bạn là... gói mì có thêm quả trứng. {partner} nhìn bạn, im lặng rất lâu.', effects: { happy: -4, rel: { partner: -8 } },
              scene: { loc: 'home', anim: 'shrug', fx: 'heartbreak' } }
          ] }
      ]
    },
    {
      id: 'a_crush_dong_nghiep', title: 'Ly cà phê thứ hai', icon: '☕', age: [22, 38],
      req: { job: true, lacks: ['partner', 'spouse'] },
      text: 'Đồng nghiệp {coworker} phòng bên hay ghé bàn bạn mượn cái dập ghim. Hôm nay còn kèm ly cà phê: “Tiện mua hai ly.” Cả phòng nháy mắt với nhau.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'love',
        npcs: [{ role: 'coworker', anim: 'talk', say: 'Tiện mua hai ly, của bạn nè!' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Rủ đi ăn trưa riêng',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bữa trưa kéo thành bữa tối, bữa tối thành nhiều bữa nữa. Hai người chính thức hẹn hò.', effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'coworker' } },
              scene: { anim: 'love', fx: 'hearts', npcAnim: { coworker: 'love' } } },
            { text: '{coworker} cười: “Đi cả nhóm cho vui nha!” Hóa ra người ta chỉ thân thiện.', effects: { happy: -3 },
              scene: { anim: 'facepalm', npcAnim: { coworker: 'wave' } } }
          ] },
        { label: 'Giữ khoảng cách, công sở là công sở',
          text: 'Bạn cảm ơn ly cà phê và giữ mọi thứ chuyên nghiệp. Bình yên, hơi tiếc.',
          effects: { happy: -1, smarts: 1 },
          scene: { anim: 'nod', npcAnim: { coworker: 'shrug' } } },
        { label: 'Đáp lễ bằng hộp bánh tự làm',
          outcomes: [
            { p: 0.6, text: '{coworker} khen bánh ngon, hôm sau mang lại hộp xôi. Một tình bạn ấm áp, biết đâu còn hơn thế.', effects: { happy: 5, addPerson: { role: 'friend', fromScene: 'coworker' } },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { coworker: 'eat' } } },
            { p: 0.4, text: 'Bánh hơi khét. {coworker} vẫn ăn hết, mặt cố tỏ ra ngon lành.', effects: { happy: 3 },
              scene: { anim: 'facepalm', fx: 'smoke', npcAnim: { coworker: 'eat' } } }
          ] }
      ]
    },
    {
      id: 'a_chia_viec_nha', title: 'Ai rửa bát?', icon: '🧽', age: [24, 50],
      req: { married: true },
      text: 'Bồn rửa chất đầy chén bát, quần áo thành núi, sàn nhà dính dính. {spouse.K} {spouse} khoanh tay: “Mình phải nói chuyện nghiêm túc về việc nhà.”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'spouse', anim: 'point', say: 'Mình nói chuyện về việc nhà đi!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Lập bảng phân công dán tủ lạnh',
          text: 'Hai người lập bảng: ai nấu, ai rửa, ai giặt. Tuần đầu hơi lộn xộn, rồi nhà sạch dần lên.',
          effects: { happy: 3, rel: { spouse: 6 } },
          scene: { anim: 'nod', fx: 'idea', npcAnim: { spouse: 'nod' } } },
        { label: 'Mua máy rửa bát', req: { minMoney: 12000000 },
          text: 'Bạn chi {money:12000000} mua máy rửa bát. {spouse.K} ôm cái máy như ôm báu vật.',
          effects: { money: -12000000, happy: 5, rel: { spouse: 8 } },
          scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { spouse: 'jump' } } },
        { label: 'Hứa sẽ làm, rồi... quên',
          text: '{spouse.K} chờ ba ngày rồi tự làm trong im lặng. Sự im lặng ấy còn đáng sợ hơn cãi nhau.',
          effects: { happy: -3, rel: { spouse: -8 } },
          scene: { anim: 'shrug', npcAnim: { spouse: 'angry' } } }
      ]
    },
    {
      id: 'a_giang_sinh', title: 'Đêm Giáng sinh', icon: '🎄', age: [18, 38], once: false, cooldown: 3,
      req: { has: ['partner'] },
      text: 'Đêm Giáng sinh, phố đông nghẹt người, đèn giăng lấp lánh. {partner} nắm tay bạn: “Đi chụp ảnh với cây thông không? Hay về nhà nấu lẩu?”',
      scene: { loc: 'street', time: 'night', weather: 'clear', decor: 'christmas', anim: 'walk', expr: 'love',
        npcs: [{ role: 'partner', anim: 'walk', say: 'Đi chụp ảnh cây thông không?' }, { role: 'crowd', anim: 'walk' }], fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Chen ra phố chụp ảnh',
          text: 'Hai người chen chúc hai tiếng, chụp 300 tấm, trong đó 3 tấm đẹp. Lạnh tay mà ấm lòng.',
          effects: { happy: 6, rel: { partner: 5 } },
          scene: { anim: 'cheer', fx: 'stars', npcAnim: { partner: 'love' } } },
        { label: 'Về nhà nấu lẩu xem phim',
          text: 'Nồi lẩu sôi lục bục, phim chiếu được nửa chừng thì cả hai ngủ gục. Giáng sinh bình yên nhất.',
          effects: { happy: 5, rel: { partner: 6 } },
          scene: { loc: 'home', anim: 'cook', fx: 'steam', npcAnim: { partner: 'eat' } } },
        { label: 'Tặng quà bất ngờ', req: { minMoney: 2000000 },
          outcomes: [
            { p: 0.7, text: '{partner} mở hộp quà, mắt sáng long lanh. Bạn chọn trúng phóc!', effects: { money: -1500000, happy: 6, rel: { partner: 10 } },
              scene: { anim: 'love', fx: 'hearts', npcAnim: { partner: 'jump' } } },
            { p: 0.3, text: 'Quà là chiếc khăn len... giống hệt chiếc {partner} vừa tặng bạn. Hai người ôm nhau cười.', effects: { money: -1500000, happy: 5, rel: { partner: 6 } },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { partner: 'laugh' } } }
          ] }
      ]
    },
    // ======================= GIA ĐÌNH TRẺ =======================
    {
      id: 'a_con_sot_dem', title: 'Con sốt lúc 2 giờ sáng', icon: '🌡️', age: [22, 45], once: false, cooldown: 4,
      req: { has: ['child'] },
      text: 'Hai giờ sáng, {child} sốt 39 độ rưỡi, mặt đỏ bừng, mếu máo gọi bạn. Cái nhiệt kế kêu bíp bíp, tim bạn đập thình thịch.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'think', expr: 'scared',
        npcs: [{ role: 'child', anim: 'sick', expr: 'sick', say: 'Con mệt quá...' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Lau mát, cho uống hạ sốt, thức canh',
          success: { stat: 'health', base: 0.4, scale: 0.3 },
          outcomes: [
            { text: 'Bạn thức trọn đêm lau người cho con. Gần sáng cơn sốt hạ, {child} ngủ ngon lành trên tay bạn.', effects: { health: -3, happy: 4, rel: { child: 8 } },
              scene: { anim: 'hug', fx: 'zzz', npcAnim: { child: 'sleep' } } },
            { text: 'Tới sáng con vẫn sốt, bạn bế con vào viện. Bác sĩ bảo sốt siêu vi, phải theo dõi thêm vài ngày.', effects: { money: -1500000, health: -3, rel: { child: 5 } },
              scene: { loc: 'hospital', time: 'dawn', anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Bế con đi cấp cứu ngay',
          text: 'Bạn ôm con phóng xe trong đêm. Bác sĩ khám, kê thuốc, dặn dò cẩn thận. Về tới nhà trời đã sáng, con ngủ say.',
          effects: { money: -800000, health: -2, karma: 2, rel: { child: 6 } },
          scene: { loc: 'hospital', anim: 'hug', fx: 'sparkle', npcAnim: { child: 'sleep' } } },
        { label: 'Lên hội cha mẹ bỉm sữa hỏi',
          text: 'Bài đăng có 200 bình luận với 199 cách khác nhau, có người còn bảo đắp lá. Cuối cùng bạn vẫn phải đưa con đi khám.',
          effects: { money: -800000, happy: -2, smarts: 1 },
          scene: { anim: 'phone', fx: 'question' } }
      ]
    },
    {
      id: 'a_chon_mam_non', title: 'Chọn trường mầm non', icon: '🏫', age: [24, 38],
      req: { has: ['child'] },
      text: 'Đến tuổi cho {child} đi mẫu giáo. Trường công gần nhà {money:1500000} một tháng nhưng lớp 40 bé; trường quốc tế {money:15000000} một tháng, có hồ bơi và cô giáo nói tiếng Anh.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'child', anim: 'walk', say: 'Trường nào có cầu tuột hả?' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Trường công gần nhà',
          text: 'Lớp đông nhưng cô giáo hiền, {child} có thêm cả chục bạn thân. Đón con tiện, ví cũng thở được.',
          effects: { money: -18000000, happy: 3, rel: { child: 3 } },
          scene: { loc: 'school', anim: 'wave', npcAnim: { child: 'jump' } } },
        { label: 'Trường quốc tế', req: { minMoney: 180000000 },
          text: 'Bạn đóng {money:180000000} cho năm đầu. {child} về nhà nói tiếng Anh ríu rít, bạn vừa tự hào vừa xót ví.',
          effects: { money: -180000000, happy: 4, rel: { child: 4 } },
          scene: { loc: 'school', anim: 'clap', fx: 'sparkle', npcAnim: { child: 'cheer' } } },
        { label: 'Gửi về quê ông bà trông',
          text: 'Ông bà mừng rỡ đón cháu. {child} khỏe mạnh, đen nhẻm, chạy nhảy khắp đồng. Còn bạn thì nhớ con quay quắt.',
          effects: { money: -5000000, happy: -4, rel: { child: -3 } },
          scene: { loc: 'countryside', anim: 'wave', fx: 'tears', npcAnim: { child: 'run' } } }
      ]
    },
    {
      id: 'a_hop_phu_huynh', title: 'Họp phụ huynh', icon: '📒', age: [30, 50],
      req: { has: ['child'] },
      text: 'Buổi họp phụ huynh, cô chủ nhiệm {teacher} đọc bảng điểm. Đến tên {child}, cô dừng lại: “Cháu thông minh nhưng hay nói chuyện riêng, còn vẽ bậy vào vở bạn bên cạnh.”',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'teacher', gender: 'f', age: 40, anim: 'talk', say: 'Cháu thông minh nhưng hay nói chuyện.' }, { role: 'crowd', anim: 'sit' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Về nói chuyện nhẹ nhàng với con',
          text: '{child} thú nhận chán vì bài dễ quá. Bạn mua thêm sách cho con đọc, con tiến bộ thấy rõ.',
          effects: { happy: 3, karma: 2, rel: { child: 6 } },
          scene: { loc: 'home', anim: 'talk', fx: 'idea' } },
        { label: 'Về mắng cho một trận',
          text: '{child} khóc, hứa không tái phạm. Một tuần sau mọi thứ y nguyên, chỉ có con ngại nói chuyện với bạn hơn.',
          effects: { happy: -2, rel: { child: -6 } },
          scene: { loc: 'home', anim: 'angry', fx: 'anger' } },
        { label: 'Bênh con trước mặt cô',
          text: '“Chắc cháu chỉ hỏi bài bạn thôi cô ạ!” Cô {teacher} mỉm cười cho qua, nhưng các phụ huynh khác nhìn bạn rất lạ.',
          effects: { happy: -2, karma: -2, rel: { child: 2 } },
          scene: { anim: 'point', fx: 'sweat', npcAnim: { teacher: 'shrug', crowd: 'shake' } } }
      ]
    },
    {
      id: 'a_ong_ba_chieu_chau', title: 'Bà chiều cháu', icon: '🍬', age: [26, 50],
      req: { has: ['child', 'mother'] },
      text: '{mother.K} {mother} lên chơi một tuần. Mới hai ngày, {child} đã được ăn kẹo trước bữa cơm, thức tới 11 giờ xem hoạt hình, và học thuộc câu “Bà bảo được mà!”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'laugh', say: 'Cháu bà, ăn thêm cái kẹo nữa nè!' }, { role: 'child', anim: 'jump' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Nhẹ nhàng nói chuyện với mẹ',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: '{mother.K} gật gù: “Ừ, thời mẹ khác, thời giờ khác.” Hai bà cháu vẫn quấn quýt, nhưng kẹo giảm hẳn.', effects: { happy: 4, rel: { mother: 4 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'nod' } } },
            { text: '{mother.K} tự ái: “Mẹ nuôi con lớn từng này, giờ con dạy mẹ nuôi cháu à?”', effects: { happy: -3, rel: { mother: -6 } },
              scene: { anim: 'sad', npcAnim: { mother: 'angry' }, npcSay: { mother: 'Con dạy mẹ nuôi cháu à?' } } }
          ] },
        { label: 'Kệ, có một tuần thôi mà',
          text: 'Bạn nhắm một mắt. Tuần ấy {child} hạnh phúc nhất đời, còn {mother.k} về quê thì nhớ cháu tới khóc.',
          effects: { happy: 3, rel: { mother: 6, child: 4 } },
          scene: { anim: 'shrug', npcAnim: { child: 'cheer', mother: 'hug' } } },
        { label: 'Gia nhập phe bà',
          text: 'Bạn cũng ăn kẹo, cũng thức xem hoạt hình. Ba thế hệ cười giòn tan, dọn dẹp để tuần sau tính.',
          effects: { happy: 7, health: -1, rel: { mother: 5, child: 6 } },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { all: 'laugh' } } }
      ]
    },
    {
      id: 'a_con_doi_dien_thoai', title: 'Con đòi điện thoại', icon: '📱', age: [30, 50],
      req: { has: ['child'] },
      text: '{child} lăn ra sàn khóc: “Cả lớp ai cũng có điện thoại, mỗi con không có!” Bạn thừa biết “cả lớp” thường là ba đứa bạn thân.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'sad',
        npcs: [{ role: 'child', anim: 'cry', say: 'Cả lớp ai cũng có, mỗi con không!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Mua máy, kèm luật rõ ràng',
          text: 'Bạn mua máy {money:3000000}, đặt luật: mỗi ngày một tiếng. {child} reo lên, ôm cổ bạn.',
          effects: { money: -3000000, happy: 3, rel: { child: 8 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { child: 'jump' } } },
        { label: 'Từ chối, đưa con ra công viên',
          text: '{child} dỗi cả buổi, rồi chơi cầu tuột tới tối mịt, quên luôn chuyện điện thoại.',
          effects: { happy: 3, health: 1, rel: { child: 2 } },
          scene: { loc: 'park', anim: 'run', fx: 'sparkle', npcAnim: { child: 'run' } } },
        { label: 'Đưa con cái điện thoại “cục gạch”',
          text: '{child} cầm chiếc máy cũ chỉ nghe gọi được, nhìn bạn như nhìn đồ cổ. Nhưng rồi chơi trò rắn săn mồi cả tuần không chán.',
          effects: { happy: 5, rel: { child: 3 } },
          scene: { anim: 'laugh', npcAnim: { child: 'phone' } } }
      ]
    },
    {
      id: 'a_trung_thu_long_den', title: 'Lồng đèn ông sao', icon: '🏮', age: [25, 50], once: false, cooldown: 3,
      req: { has: ['child'] },
      text: 'Trung thu, {child} đòi lồng đèn ông sao tự làm “giống hồi xưa”. Bạn có tre, giấy kính, hồ dán... và không chút kinh nghiệm nào.',
      scene: { loc: 'home', time: 'night', weather: 'clear', decor: 'midautumn', anim: 'think', expr: 'happy',
        npcs: [{ role: 'child', anim: 'jump', say: 'Làm đèn ông sao đi mà!' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Cặm cụi làm cùng con',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Chiếc đèn hơi méo nhưng sáng rực. {child} rước đèn khắp xóm, gặp ai cũng khoe: “Nhà con tự làm đó!”', effects: { happy: 8, rel: { child: 10 } },
              scene: { loc: 'street', anim: 'cheer', fx: 'sparkle', npcAnim: { child: 'walk' } } },
            { text: 'Chiếc đèn bén lửa vì cây nến đặt nghiêng. Hai người đứng nhìn nhau rồi cười lăn.', effects: { happy: 4, rel: { child: 6 } },
              scene: { anim: 'laugh', fx: 'smoke', npcAnim: { child: 'laugh' } } }
          ] },
        { label: 'Ra chợ mua đèn có nhạc',
          text: 'Đèn nhựa phát nhạc inh ỏi, {child} thích lắm. Được hai hôm thì hết pin.',
          effects: { money: -150000, happy: 2, rel: { child: 3 } },
          scene: { loc: 'market', anim: 'walk', fx: 'music', npcAnim: { child: 'dance' } } }
      ]
    },
    {
      id: 'a_gui_tien_ve_que', title: 'Mái nhà dột', icon: '🏡', age: [22, 50], once: false, cooldown: 4,
      req: { has: ['mother'], job: true },
      text: 'Lương vừa về. {mother.K} {mother} ở quê gọi điện, chẳng xin gì, chỉ kể mái nhà dột mấy chỗ và cái ti vi lại hỏng.',
      scene: { loc: 'home', time: 'day', weather: 'rain', anim: 'phone', expr: 'sad', say: 'Dạ, mẹ cứ để con lo...', fx: 'question', shot: 'close' },
      choices: [
        { label: 'Gửi về {money:5000000} sửa nhà',
          text: '{mother.K} gọi lại, giọng nghèn nghẹn: “Con lo cho mình trước đã.” Nhưng bạn biết mẹ vui lắm.',
          effects: { money: -5000000, happy: 4, karma: 5, rel: { mother: 10 } },
          scene: { anim: 'nod', fx: 'hearts' } },
        { label: 'Về quê tự tay lợp lại mái',
          text: 'Cuối tuần bạn về, trèo mái thay ngói, mẹ nấu nồi canh cua đợi. Vất vả mà ấm lòng.',
          effects: { money: -1500000, health: -1, happy: 6, rel: { mother: 12 } },
          scene: { loc: 'countryside', weather: 'clear', anim: 'lift', fx: 'sparkle' } },
        { label: 'Hứa tháng sau',
          text: '{mother.K} bảo: “Ừ, không sao con.” Tháng sau mái dột thêm chỗ nữa.',
          effects: { happy: -2, rel: { mother: -4 } },
          scene: { anim: 'sad' } }
      ]
    },
    {
      id: 'a_em_vay_tien', title: 'Lần thứ tư trong năm', icon: '💸', age: [22, 50],
      req: { has: ['sibling'], minMoney: 15000000 },
      text: '{sibling.K} {sibling} gọi, giọng ngọt như mía lùi: “Cho mượn ít tiền mua xe mới đi, xe cũ hỏng hoài.” Đây là lần thứ tư trong năm.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'sad',
        npcs: [{ role: 'sibling', anim: 'talk', say: 'Cho mượn ít tiền nha, lần này thôi!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Cho mượn {money:15000000}',
          outcomes: [
            { p: 0.4, text: '{sibling.K} trả đủ sau nửa năm, còn mua quà cảm ơn. Hóa ra đã trưởng thành thật!', effects: { happy: 4, rel: { sibling: 8 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { sibling: 'hug' } } },
            { p: 0.6, text: 'Tiền ra đi không hẹn ngày về. Mỗi lần bạn nhắc, {sibling.k} lại đổi chủ đề.', effects: { money: -15000000, happy: -4, rel: { sibling: 2 } },
              scene: { anim: 'facepalm', fx: 'money', npcAnim: { sibling: 'shrug' } } }
          ] },
        { label: 'Từ chối, dạy cách tiết kiệm',
          text: '{sibling.K} hậm hực bỏ đi, nhưng một năm sau tự mua được xe bằng tiền để dành.',
          effects: { karma: 2, happy: 1, rel: { sibling: -3 } },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { sibling: 'angry' } } },
        { label: 'Mua giúp chiếc xe cũ giá mềm',
          text: '{sibling.K} hơi chê xe cũ, nhưng xe chạy bền bỉ. Bạn tốn {money:8000000}, đổi lại yên tâm.',
          effects: { money: -8000000, karma: 3, rel: { sibling: 6 } },
          scene: { loc: 'street', anim: 'drive', npcAnim: { sibling: 'cheer' } } }
      ]
    },
    {
      id: 'a_bo_nam_vien', title: 'Bố nằm viện', icon: '🏥', age: [24, 55], weight: 0.8,
      req: { has: ['father'] },
      text: '{father.K} {father} nhập viện vì cao huyết áp. Bạn đang giữa dự án quan trọng, còn bệnh viện cách nhà hai trăm cây số.',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'father', anim: 'sit', expr: 'sick', say: 'Bố không sao, con cứ lo việc đi.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Gác hết, ở lại chăm bố',
          text: '{father.K} cằn nhằn “ở lại làm gì cho tốn kém”, nhưng nắm tay bạn suốt đêm. Công việc trễ, nhưng bạn không hối hận.',
          effects: { money: -3000000, happy: 4, karma: 5, rel: { father: 12 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { father: 'hug' } } },
        { label: 'Gửi tiền, thuê người chăm',
          text: 'Bạn gửi {money:10000000} thuê người chăm. {father.k} được chăm chu đáo, nhưng cứ nhìn ra cửa chờ con.',
          effects: { money: -10000000, happy: -3, rel: { father: 2 } },
          scene: { anim: 'phone', npcAnim: { father: 'sad' } } },
        { label: 'Gọi video mỗi tối',
          text: 'Tối nào bạn cũng gọi video. {father.K} khoe hôm nay ăn được nửa bát cháo, mặt rạng rỡ hẳn.',
          effects: { happy: 1, rel: { father: 5 } },
          scene: { anim: 'phone', fx: 'sparkle', npcAnim: { father: 'wave' } } }
      ]
    },

    // ======================= TIỀN BẠC =======================
    {
      id: 'a_da_cap', title: 'Cơ hội làm giàu', icon: '🕴️', age: [20, 50],
      text: 'Người bạn cũ lâu không gặp bỗng hẹn cà phê, áo vest, đồng hồ lấp lánh: “Mình đang có cơ hội làm giàu. Chỉ cần góp {money:30000000}, rủ thêm ba người là hoàn vốn!”',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 30, anim: 'talk', say: 'Rủ thêm ba người là hoàn vốn ngay!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Từ chối thẳng',
          text: 'Bạn từ chối lịch sự, trả tiền cà phê rồi về. Nửa năm sau đọc tin cái “cơ hội” ấy bị điều tra.',
          effects: { smarts: 3, happy: 2, karma: 1 },
          scene: { anim: 'shake', fx: 'idea', npcAnim: { stranger: 'shrug' } } },
        { label: 'Tham gia thử', req: { minMoney: 30000000 },
          outcomes: [
            { p: 0.2, text: 'Bạn rút ra kịp với {money:10000000} tiền lời, nhưng đã lỡ rủ ba người bạn thân vào... và họ mất trắng.', effects: { money: 10000000, karma: -12, happy: -2 },
              scene: { anim: 'think', fx: 'money' } },
            { p: 0.8, text: 'Công ty “bốc hơi” sau bốn tháng. Bạn mất {money:30000000} và vài người bạn.', effects: { money: -30000000, happy: -10 },
              scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Hỏi vặn đến cùng',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn hỏi lợi nhuận đến từ đâu, sản phẩm là gì, giấy phép ở đâu... Người bạn cũ ấp úng rồi xin phép về trước.', effects: { smarts: 2, happy: 4 },
              scene: { anim: 'point', fx: 'idea', npcAnim: { stranger: 'facepalm' } } },
            { text: 'Bạn cũ trả lời trôi chảy như thuộc bài. Bạn về nhà, đầu óc rối như tơ vò.', effects: { happy: -2 },
              scene: { anim: 'think', fx: 'question', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 'a_tien_ao', title: 'Đồng xu thần kỳ', icon: '🪙', age: [20, 45],
      text: 'Nhóm chat “Đầu tư thông minh” rần rần: một đồng tiền ảo mới tăng 300% trong một tuần. Ai cũng khoe lời, có người bảo “không vào bây giờ là tiếc cả đời”.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Bỏ {money:20000000} vào thử', req: { minMoney: 20000000 },
          outcomes: [
            { p: 0.3, text: 'Đồng tiền tăng thêm gấp đôi! Bạn chốt lời kịp, lời {money:20000000}.', effects: { money: 20000000, happy: 8 },
              scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.7, text: 'Hai hôm sau đồng tiền rơi 95%. Nhóm chat im phăng phắc, quản trị viên rời nhóm.', effects: { money: -19000000, happy: -10 },
              scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Tất tay toàn bộ tiền tiết kiệm', req: { minMoney: 50000000 },
          outcomes: [
            { p: 0.1, text: 'Bạn tất tay và... trúng lớn! Tài khoản nhân ba. Bạn run tay bấm bán.', effects: { moneyPct: 2, happy: 15 },
              scene: { anim: 'jump', fx: 'fireworks' } },
            { p: 0.9, text: 'Sàn giao dịch bị khóa, tiền bốc hơi. Bạn ngồi nhìn màn hình tới sáng.', effects: { moneyPct: -0.9, happy: -20, health: -3 },
              scene: { anim: 'sad', time: 'dawn', fx: 'tears', shot: 'dramatic' } }
          ] },
        { label: 'Rời nhóm, đi ngủ',
          text: 'Bạn rời nhóm, úp điện thoại. Sáng ra tiền vẫn còn nguyên, lòng vẫn an.',
          effects: { happy: 2, smarts: 2 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'a_ban_vay_tien', title: 'Bạn hỏi vay tiền', icon: '🤝', age: [20, 50],
      req: { has: ['friend'], minMoney: 20000000 },
      text: '{friend} gọi, giọng ngập ngừng: “Cho mình mượn {money:20000000}, mẹ mình phải mổ gấp. Ba tháng mình trả.” Đây là lần đầu tiên {friend} mở lời vay tiền.',
      scene: { loc: 'cafe', time: 'day', weather: 'cloudy', anim: 'think', expr: 'sad',
        npcs: [{ role: 'friend', anim: 'sad', say: 'Ba tháng mình trả, hứa đó!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Cho vay ngay',
          outcomes: [
            { p: 0.7, text: 'Ba tháng sau {friend} trả đủ, kèm túi trái cây quê. Tình bạn thêm đậm.', effects: { karma: 6, happy: 4, rel: { friend: 12 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { friend: 'hug' } } },
            { p: 0.3, text: '{friend} trả được một nửa rồi biệt tăm. Bạn mất {money:10000000} và một người bạn.', effects: { money: -10000000, happy: -6, rel: { friend: -20 } },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { friend: 'walk' } } }
          ] },
        { label: 'Biếu luôn {money:5000000}, không cần trả',
          text: '{friend} rưng rưng: “Mình sẽ nhớ suốt đời.” Không nhiều, nhưng đúng lúc.',
          effects: { money: -5000000, karma: 8, rel: { friend: 10 } },
          scene: { anim: 'hug', fx: 'sparkle', npcAnim: { friend: 'cry' } } },
        { label: 'Bảo mình cũng đang kẹt',
          text: '{friend} bảo không sao, nhưng từ đó ít liên lạc hẳn.',
          effects: { karma: -3, rel: { friend: -10 } },
          scene: { anim: 'shrug', npcAnim: { friend: 'nod' } } }
      ]
    },
    {
      id: 'a_choi_hui', title: 'Chơi hụi', icon: '🪷', age: [25, 55], weight: 0.8,
      text: 'Cô {vendor} bán tạp hóa đầu hẻm rủ bạn chơi hụi: mỗi tháng góp {money:2000000}, 12 người, ai cần thì bỏ thăm hốt trước. “Chơi đi con, cô làm đầu thảo 20 năm chưa bể lần nào!”',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'vendor', gender: 'f', age: 56, anim: 'talk', say: 'Chơi hụi đi con, cô làm 20 năm rồi!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Tham gia, hốt cuối lấy lãi',
          outcomes: [
            { p: 0.75, text: 'Cuối năm bạn hốt hụi, lời hơn gửi ngân hàng một chút.', effects: { money: 2000000, happy: 5 },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { vendor: 'clap' } } },
            { p: 0.25, text: 'Tháng thứ tám, cô {vendor} ôm hụi bỏ trốn. Cả hẻm ngồi khóc trước cửa tiệm đóng im ỉm.', effects: { money: -16000000, happy: -10 },
              scene: { loc: 'street', anim: 'cry', fx: 'tears', npcAnim: { vendor: 'run' } } }
          ] },
        { label: 'Cảm ơn cô, con gửi ngân hàng',
          text: 'Bạn từ chối khéo. Cô {vendor} cười: “Ừ, tụi trẻ bây giờ khôn lắm.”',
          effects: { smarts: 1, happy: 1 },
          scene: { anim: 'bow', npcAnim: { vendor: 'laugh' } } },
        { label: 'Tham gia, hốt ngay tháng đầu',
          text: 'Bạn cần vốn gấp nên hốt ngay, chịu trả lãi cho cả dây hụi. Có tiền xoay xở, nhưng mười một tháng sau góp đều mệt nghỉ.',
          effects: { money: -3000000, happy: 2 },
          scene: { anim: 'nod', fx: 'money', npcAnim: { vendor: 'nod' } } }
      ]
    },
    {
      id: 'a_vang_tang_gia', title: 'Vàng lại lập đỉnh', icon: '🥇', age: [22, 55], once: false, cooldown: 5,
      req: { minMoney: 30000000 },
      text: 'Giá vàng lại lập đỉnh, tiệm vàng đầu chợ đông nghẹt người xếp hàng. Người lớn trong nhà vẫn dặn: “Có tiền thì mua chỉ vàng mà để dành, tiền giấy mất giá lắm.”',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'vendor', gender: 'f', age: 45, anim: 'talk', say: 'Hôm nay lên nữa rồi, mua nhanh kẻo lỡ!' }, { role: 'crowd', anim: 'idle' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Xếp hàng mua hai chỉ vàng',
          text: 'Bạn xếp hàng hai tiếng, ôm về hai chỉ vàng giá {money:24000000}. Cất kỹ trong tủ, đêm ngủ cũng thấy yên tâm.',
          effects: { money: -24000000, happy: 3, asset: { add: { type: 'gold', name: 'Hai chỉ vàng', value: 24000000 } } },
          scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { vendor: 'nod' } } },
        { label: 'Đứng ngoài chờ giá giảm',
          outcomes: [
            { p: 0.5, text: 'Một tháng sau giá vàng giảm mạnh. Bạn gật gù như chuyên gia tài chính.', effects: { happy: 3, smarts: 1 },
              scene: { anim: 'nod', fx: 'idea' } },
            { p: 0.5, text: 'Giá vàng tăng tiếp 20%. Mỗi lần đi ngang tiệm vàng, bạn lại tiếc hùi hụi.', effects: { happy: -3 },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Gửi tiết kiệm ngân hàng',
          text: 'Bạn chọn gửi tiết kiệm 12 tháng. Lãi không cao, nhưng ngủ ngon.',
          effects: { money: 1500000, happy: 1 },
          scene: { anim: 'shrug', fx: 'money' } }
      ]
    },
    {
      id: 'a_mo_quan_cafe', title: 'Giấc mơ quán cà phê', icon: '🪴', age: [24, 50], weight: 0.7,
      req: { minMoney: 150000000 },
      text: 'Bạn ấp ủ giấc mơ mở một quán cà phê nhỏ trong hẻm: cây xanh, nhạc nhẹ, ghế gỗ. Tính sơ sơ cần {money:150000000}, gần như toàn bộ tiền để dành.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'think', expr: 'happy', fx: 'idea', shot: 'orbit' },
      choices: [
        { label: 'Liều một phen, mở quán!',
          success: { stat: 'smarts', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Quán đông khách nhờ góc chụp ảnh xinh và ly cà phê muối ngon. Một năm sau bạn đã hòa vốn và bắt đầu có lời.', effects: { money: 50000000, happy: 12, flag: 'a_co_quan_cafe' },
              scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Quán vắng như chùa Bà Đanh. Một năm sau bạn sang lại quán, lỗ {money:100000000}.', effects: { money: -100000000, happy: -12, smarts: 3 },
              scene: { anim: 'sad', fx: 'dust' } }
          ] },
        { label: 'Bán cà phê đóng chai online',
          text: 'Bạn pha cà phê đóng chai bán qua mạng: vốn ít, rủi ro ít. Mỗi tháng có thêm một khoản kha khá.',
          effects: { money: 15000000, happy: 4, health: -1 },
          scene: { loc: 'home', anim: 'cook', fx: 'money' } },
        { label: 'Cất giấc mơ vào ngăn kéo',
          text: 'Bạn quyết định chưa phải lúc. Thỉnh thoảng đi ngang một quán xinh, lòng lại khẽ chùng xuống.',
          effects: { happy: -3 },
          scene: { loc: 'street', anim: 'walk' } }
      ]
    },
    {
      id: 'a_livestream_ban_hang', title: 'Lên sóng chốt đơn', icon: '🎥', age: [20, 50], weight: 0.8,
      text: 'Thấy người ta livestream bán quần áo chốt đơn ầm ầm, bạn quyết định thử. Điện thoại dựng giá ba chân, đèn vòng bật sáng. Người xem: 3, trong đó có... chính bạn bằng máy phụ.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'talk', expr: 'happy', say: 'Chào cả nhà, chốt đơn nha!', fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Nhảy múa câu lượt xem',
          success: { stat: 'looks', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Điệu nhảy của bạn bị cắt thành clip, lên xu hướng. Đêm sau 2.000 người xem, chốt 120 đơn!', effects: { money: 8000000, happy: 10 },
              scene: { anim: 'dance', fx: 'music' } },
            { text: 'Bạn nhảy tới trẹo lưng, chốt được hai đơn, một đơn là người nhà đặt ủng hộ.', effects: { money: 100000, happy: -2, health: -2 },
              scene: { anim: 'fall', fx: 'stars' } }
          ] },
        { label: 'Bán chân thật, tư vấn kỹ',
          text: 'Khách ít nhưng quay lại nhiều. Mỗi tháng có thêm vài trăm nghìn, đều đặn mà vui.',
          effects: { money: 6000000, happy: 4, karma: 2 },
          scene: { anim: 'talk', fx: 'money' } },
        { label: 'Tắt máy sau 15 phút',
          text: 'Bạn cất giá ba chân vào gầm giường, cùng với giấc mơ làm giàu.',
          effects: { happy: -1 },
          scene: { anim: 'shrug' } }
      ]
    },
    {
      id: 'a_ve_so', title: 'Tờ vé số cuối cùng', icon: '🎫', age: [18, 55], weight: 0.4, once: false, cooldown: 6,
      text: 'Bà cụ bán vé số tóc bạc trắng, lưng còng, đứng bên quán cóc mời bạn: “Mua giúp bà mấy tờ cuối, bà về sớm con ơi.” Có tờ đuôi trùng ngày sinh của bạn.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 75, anim: 'talk', say: 'Mua giúp bà mấy tờ cuối nghe con.' }], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Mua hết cho bà về sớm',
          outcomes: [
            { p: 0.9, text: 'Không trúng tờ nào, nhưng nụ cười móm mém của bà đáng giá hơn.', effects: { money: -100000, karma: 6, happy: 4 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'bow' } } },
            { p: 0.1, text: 'Sáng hôm sau dò số: trúng giải ba {money:10000000}! Bạn mang biếu bà một phần.', effects: { money: 9000000, karma: 8, happy: 12 },
              scene: { anim: 'jump', fx: 'confetti', npcAnim: { stranger: 'cheer' } } }
          ] },
        { label: 'Mua đúng tờ trùng ngày sinh',
          outcomes: [
            { p: 0.98, text: 'Trật lất. {money:10000} đổi lấy một buổi tối mơ mộng.', effects: { money: -10000, happy: 1 },
              scene: { anim: 'shrug' } },
            { p: 0.02, text: 'Trúng độc đắc! Bạn hét lên giữa quán, cả xóm đổ ra xem. Trừ thuế vẫn còn gần {money:1800000000}!', effects: { money: 1800000000, happy: 25 },
              scene: { anim: 'jump', fx: 'fireworks', shot: 'dramatic', npcAnim: { stranger: 'clap' } } }
          ] },
        { label: 'Không mua, dúi bà ít tiền',
          text: 'Bạn dúi bà {money:50000}: “Bà cầm về ăn tối.” Bà cảm ơn mãi, còn chúc bạn “sớm phát tài”.',
          effects: { money: -50000, karma: 5, happy: 3 },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { stranger: 'bow' }, npcSay: { stranger: 'Bà chúc con sớm phát tài!' } } }
      ]
    },

    // ======================= BẢN THÂN =======================
    {
      id: 'a_burnout', title: 'Kiệt sức', icon: '🫠', age: [24, 50],
      req: { job: true },
      text: 'Sáng thứ Hai, bạn ngồi trên giường nhìn chằm chằm vào tường 40 phút. Không ốm, không đau, chỉ là không thể nhấc mình đi làm. Email chưa đọc: 127.',
      scene: { loc: 'bedroom', time: 'dawn', weather: 'cloudy', anim: 'sit', expr: 'sad', fx: 'question', shot: 'close' },
      choices: [
        { label: 'Xin nghỉ phép một tuần',
          text: 'Bạn tắt điện thoại, về quê nằm võng nghe gà gáy. Một tuần sau quay lại, đầu óc nhẹ tênh.',
          effects: { happy: 8, health: 3 },
          scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'sleep', fx: 'zzz' } },
        { label: 'Đi gặp chuyên gia tâm lý',
          text: 'Lần đầu tiên có người hỏi “Bạn thực sự thấy thế nào?”, và bạn khóc như mưa. Rồi nhẹ hẳn đi.',
          effects: { money: -1500000, happy: 10, health: 2 },
          scene: { loc: 'cafe', time: 'day', anim: 'cry', fx: 'tears' } },
        { label: 'Gồng tiếp',
          success: { stat: 'health', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn gồng qua được mùa dự án. Mệt rã rời, nhưng xong.', effects: { happy: -3, health: -3 },
              scene: { loc: 'office', time: 'day', anim: 'type', fx: 'sweat' } },
            { text: 'Ba tuần sau bạn xỉu ngay ở văn phòng, phải nhập viện truyền nước.', effects: { health: -10, happy: -8, money: -3000000 },
              scene: { loc: 'office', time: 'day', anim: 'fall', fx: 'stars', shot: 'dramatic' } }
          ] },
        { label: 'Nghỉ việc, đi “chữa lành”',
          text: 'Bạn nộp đơn nghỉ, xách balo lên núi. Ba tháng “chữa lành” xong, tài khoản cần được chữa lành hơn cả bạn.',
          effects: { happy: 10, health: 3, money: -15000000, job: 'fire' },
          scene: { loc: 'countryside', time: 'day', weather: 'fog', anim: 'cheer', fx: 'sparkle' } }
      ]
    },
    {
      id: 'a_dau_da_day', title: 'Cơn đau lúc nửa đêm', icon: '🤢', age: [22, 50],
      req: { illness: false },
      text: 'Cà phê thay bữa sáng, nhậu thay bữa tối. Đêm nay bụng bạn quặn lên từng cơn, nóng rát như ai đốt lửa trong đó.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'sick', expr: 'sick', fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Sáng mai đi khám ngay',
          text: 'Bác sĩ nội soi, kết luận viêm dạ dày nhẹ. Bạn được kê thuốc kèm danh sách dài những món phải kiêng. Phát hiện sớm, chữa nhanh.',
          effects: { money: -1500000, health: 2, happy: -1 },
          scene: { loc: 'hospital', time: 'day', anim: 'nod', fx: 'sparkle' } },
        { label: 'Uống tạm viên thuốc, kệ',
          text: 'Sáng hôm sau bạn lại cà phê như thường. Cơn đau trở thành bạn đồng hành.',
          effects: { health: -5, happy: -2, illness: 'Đau dạ dày' },
          scene: { anim: 'shrug', fx: 'sick' } },
        { label: 'Đổi lối sống từ hôm nay',
          text: 'Bạn bỏ nhậu, ăn sáng đúng giờ, mang cơm hộp đi làm. Ba tháng sau bụng êm ru, da dẻ còn hồng hào.',
          effects: { health: 6, happy: 2, looks: 1, money: 2000000 },
          scene: { loc: 'home', time: 'day', anim: 'cook', fx: 'steam' } }
      ]
    },
    {
      id: 'a_khung_hoang_30', title: 'Ba mươi', icon: '🎂', age: [29, 32], weight: 1.3,
      text: 'Sinh nhật {age} tuổi. Bạn bè đăng ảnh nhà mới, xe mới, con thứ hai. Bạn nhìn lại mình trong gương: tóc bắt đầu thưa, và câu hỏi to đùng “mình đang sống vì cái gì?”',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', decor: 'birthday', anim: 'think', expr: 'sad', fx: 'question', shot: 'close' },
      choices: [
        { label: 'Ngồi viết kế hoạch 5 năm',
          text: 'Bạn viết kín ba trang giấy: học thêm, tiết kiệm, tập thể dục. Có kế hoạch, lòng nhẹ hẳn.',
          effects: { smarts: 3, happy: 4 },
          scene: { anim: 'study', fx: 'idea' } },
        { label: 'Xách balo đi Tây Bắc', req: { minMoney: 10000000 },
          text: 'Một tuần giữa núi rừng, đứng trên đèo lộng gió, bạn thấy mình nhỏ bé mà nhẹ nhõm lạ thường.',
          effects: { money: -8000000, happy: 10, health: 2 },
          scene: { loc: 'countryside', time: 'dawn', weather: 'fog', anim: 'cheer', fx: 'sparkle' } },
        { label: 'Học một thứ hoàn toàn mới',
          text: 'Bạn đăng ký lớp nhảy cho người mới. Buổi đầu vụng như vịt, buổi thứ mười đã tự tin xoay một vòng.',
          effects: { happy: 6, health: 2, looks: 1, money: -2000000 },
          scene: { loc: 'gym', time: 'day', anim: 'dance', fx: 'music' } },
        { label: 'Nằm lướt mạng so sánh tiếp',
          text: 'Bạn lướt tới 3 giờ sáng, càng lướt càng thấy mình thua kém. Mạng xã hội chưa bao giờ là tấm gương đúng.',
          effects: { happy: -6, health: -1 },
          scene: { anim: 'phone', fx: 'zzz' } }
      ]
    },
    {
      id: 'a_du_lich_mot_minh', title: 'Đi một mình', icon: '🎒', age: [22, 50],
      req: { minMoney: 8000000 },
      text: 'Bạn bè ai cũng bận, lịch hẹn cứ lùi mãi. Một tối, bạn tự hỏi: sao không đi du lịch một mình? Vé xe giường nằm đi Đà Lạt chỉ {money:350000}.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'happy', fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Lên xe đêm đi Đà Lạt',
          text: 'Đà Lạt sương mù, bạn ngồi quán cà phê nhìn đồi thông, quen thêm vài người bạn mới. Một mình mà chẳng cô đơn.',
          effects: { money: -4000000, happy: 10, health: 2 },
          scene: { loc: 'park', time: 'dawn', weather: 'fog', anim: 'drink', fx: 'sparkle' } },
        { label: 'Ra biển ngắm hoàng hôn',
          text: 'Bạn ngồi thúng chai, ăn hải sản, ngắm mặt trời lặn. Lần đầu chụp ảnh mà không cần ai đứng cạnh.',
          effects: { money: -5000000, happy: 9, looks: 1 },
          scene: { loc: 'beach', time: 'dusk', anim: 'cheer', fx: 'stars' } },
        { label: 'Thôi, ở nhà ngủ',
          text: 'Bạn ngủ trọn hai ngày cuối tuần. Cũng là một chuyến du lịch... vào giấc mơ.',
          effects: { health: 2, happy: 1 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'a_meo_hien_nha', title: 'Mèo con dưới mái hiên', icon: '🐱', age: [18, 55],
      req: { lacks: ['pet'] },
      text: 'Trời mưa tầm tã, một bé mèo con ướt sũng nép dưới mái hiên nhà bạn, kêu meo meo yếu ớt. Bé gầy nhom, một tai cụp, mắt tròn xoe nhìn bạn.',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'think', expr: 'sad',
        npcs: [{ role: 'stranger', kind: 'cat', anim: 'sit' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Bế bé về nuôi',
          text: 'Bạn quấn bé trong khăn, sấy khô, cho ăn. Bé ngủ say trên ngực bạn. Từ nay nhà có thêm một “hoàng thượng”.',
          effects: { happy: 10, karma: 6, money: -500000, addPerson: { role: 'pet', fromScene: 'stranger', kind: 'cat' } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'cheer' } } },
        { label: 'Cho ăn rồi để bé ở đó',
          text: 'Bạn để lại đĩa cơm cá và cái thùng các-tông lót khăn. Sáng ra bé đã đi đâu mất, chỉ còn cái đĩa sạch bóng.',
          effects: { karma: 3, happy: 1 },
          scene: { anim: 'wave', npcAnim: { stranger: 'walk' } } },
        { label: 'Nhờ nhóm cứu hộ động vật',
          text: 'Một nhóm cứu hộ nhận bé. Vài tuần sau họ gửi ảnh bé tròn quay trong nhà mới. Bạn vui lây.',
          effects: { karma: 5, happy: 4 },
          scene: { anim: 'phone', fx: 'sparkle', npcAnim: { stranger: 'jump' } } }
      ]
    },
    {
      id: 'a_the_gym', title: 'Thẻ tập một năm', icon: '🏋️', age: [18, 50], once: false, cooldown: 4,
      text: 'Năm mới, quyết tâm mới: bạn đăng ký thẻ tập gym một năm {money:6000000}. Buổi đầu tiên, anh huấn luyện viên cơ bắp cuồn cuộn nhìn bạn: “Mình khởi động bằng 100 cái gánh tạ nhé!”',
      scene: { loc: 'gym', time: 'day', weather: 'clear', anim: 'lift', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 28, anim: 'lift', say: 'Khởi động 100 cái thôi mà!' }], fx: 'sweat', shot: 'low' },
      choices: [
        { label: 'Quyết tâm tập đều cả năm',
          success: { stat: 'health', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đi tập đều đặn. Một năm sau bụng phẳng lì, ngủ ngon, ăn khỏe. Đáng đồng tiền bát gạo!', effects: { money: -6000000, health: 10, looks: 5, happy: 6 },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { stranger: 'clap' } } },
            { text: 'Bạn tập đúng sáu buổi. Tấm thẻ nằm trong ví như lá bùa hộ mệnh.', effects: { money: -6000000, health: 1, happy: -3 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Đổi sang chạy bộ công viên',
          text: 'Bạn bỏ ý định gym, sáng nào cũng chạy quanh hồ. Miễn phí, lại quen được hội các cô chú tập dưỡng sinh.',
          effects: { health: 6, happy: 4 },
          scene: { loc: 'park', time: 'dawn', anim: 'run', fx: 'sparkle' } },
        { label: 'Mua thẻ, mua thêm đồ tập',
          text: 'Giày mới, áo mới, bình nước, găng tay. Ảnh check-in đẹp lung linh. Còn tập thì... để tuần sau.',
          effects: { money: -9000000, looks: 1, happy: 2 },
          scene: { anim: 'idle', fx: 'flash', say: 'Chụp kiểu này cho ngầu nè!' } }
      ]
    },

    // ======================= XÃ HỘI =======================
    {
      id: 'a_tu_thien_mien_trung', title: 'Hướng về miền Trung', icon: '🌧️', age: [18, 55], once: false, cooldown: 5,
      text: 'Bão lũ miền Trung, trên ti vi nước ngập tới mái nhà, bà con ngồi trên nóc chờ cứu trợ. Nhóm bạn của bạn đang gom hàng, thuê xe tải chở vào vùng lũ.',
      scene: { loc: 'street', time: 'day', weather: 'rain', anim: 'lift', expr: 'sad',
        npcs: [{ role: 'stranger', gender: 'm', age: 30, anim: 'talk', say: 'Ai góp được gì thì góp, mai xe chạy!' }, { role: 'crowd', anim: 'lift' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Xin nghỉ phép đi cùng đoàn',
          text: 'Bạn theo xe vào vùng lũ, lội nước phát mì gói, áo phao. Một cụ bà nắm tay bạn không buông. Chuyến đi ấy theo bạn suốt đời.',
          effects: { karma: 15, happy: 8, health: -3, money: -2000000 },
          scene: { loc: 'countryside', weather: 'rain', anim: 'hug', fx: 'sparkle' } },
        { label: 'Góp {money:2000000} và một thùng quần áo',
          text: 'Bạn chuyển khoản, gói thêm thùng quần áo ấm. Ít thôi, nhưng góp gió thành bão.',
          effects: { money: -2000000, karma: 8, happy: 3 },
          scene: { anim: 'lift', fx: 'hearts', npcAnim: { stranger: 'bow' } } },
        { label: 'Chia sẻ bài kêu gọi lên mạng',
          text: 'Bạn chia sẻ bài viết kèm vài dòng xúc động. Được 37 lượt thích; số tiền quyên góp thì... không đổi.',
          effects: { karma: 1, happy: 1 },
          scene: { anim: 'phone', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 'a_hien_mau', title: 'Giọt máu hồng', icon: '🩸', age: [18, 55], once: false, cooldown: 4,
      req: { minStat: { health: 50 } },
      text: 'Bệnh viện kêu gọi hiến máu khẩn vì kho máu cạn. Bạn chưa hiến bao giờ, và thú thật, bạn hơi sợ kim tiêm.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'doctor', gender: 'f', age: 35, anim: 'wave', say: 'Không đau đâu, như kiến cắn thôi!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Xắn tay áo lên',
          text: 'Kim chích vào, bạn nhắm tịt mắt, hóa ra đau hơn kiến cắn một chút. Đổi lại hộp sữa, ổ bánh mì và một tờ giấy chứng nhận đáng tự hào.',
          effects: { karma: 10, happy: 5, health: -1 },
          scene: { anim: 'sit', fx: 'sparkle', npcAnim: { doctor: 'clap' } } },
        { label: 'Kéo cả hội bạn đi cùng',
          text: 'Cả nhóm cùng hiến máu, chụp ảnh khoe giấy chứng nhận như khoe huy chương.',
          effects: { karma: 12, happy: 6, health: -1 },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { doctor: 'clap' } } },
        { label: 'Thấy kim là quay đầu chạy',
          text: 'Vừa thấy cây kim, bạn quay đầu chạy thẳng ra cổng. Chị bác sĩ nói với theo: “Lần sau nhé!”',
          effects: { happy: -1, karma: -1 },
          scene: { anim: 'run', fx: 'sweat', npcAnim: { doctor: 'laugh' }, npcSay: { doctor: 'Lần sau nhé!' } } }
      ]
    },

    // ======================= HIẾM & KỲ QUẶC =======================
    {
      id: 'a_clip_te_nga', title: 'Cú ngã triệu view', icon: '🤸', age: [18, 45], weight: 0.3,
      text: 'Bạn trượt chân ngã chổng vó vào đống thùng xốp ngoài chợ, đúng lúc có người đang quay video. Tối đó, clip “Cú ngã đẹp nhất năm” đạt 2 triệu lượt xem.',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'fall', expr: 'surprised',
        npcs: [{ role: 'stranger', anim: 'phone', say: 'Ối giời ơi, quay được rồi!' }, { role: 'crowd', anim: 'laugh' }], fx: 'stars', shot: 'dramatic' },
      choices: [
        { label: 'Nhận luôn mình là nhân vật chính',
          text: 'Bạn đăng lại clip: “Người ngã là tôi, vẫn ổn nha.” Cả mạng mê sự hài hước của bạn, một xưởng thùng xốp còn mời quay quảng cáo!',
          effects: { money: 5000000, happy: 10, looks: 1 },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { all: 'clap' } } },
        { label: 'Đeo khẩu trang trốn biệt',
          text: 'Bạn đeo khẩu trang cả tháng. Mấy đứa bạn vẫn nhận ra, ngày nào cũng gửi clip vào nhóm chat.',
          effects: { happy: -4 },
          scene: { anim: 'facepalm', fx: 'sweat' } },
        { label: 'Quay thêm “phần hai”',
          outcomes: [
            { p: 0.5, text: 'Phần hai còn hài hơn, bạn thành “thánh ngã” của mạng xã hội.', effects: { money: 3000000, happy: 8 },
              scene: { anim: 'jump', fx: 'stars', npcAnim: { crowd: 'clap' } } },
            { p: 0.5, text: 'Lần này ngã thật, trật mắt cá chân.', effects: { health: -5, happy: -2 },
              scene: { anim: 'fall', fx: 'sick' } }
          ] }
      ]
    },
    {
      id: 'a_thay_boi_go_da', title: 'Ông thầy dưới gốc đa', icon: '🔮', age: [20, 45], weight: 0.3,
      text: 'Đi chùa đầu năm, một ông thầy bói ngồi gốc đa vẫy bạn lại: “Năm nay con có quý nhân phù trợ, nhưng phải cẩn thận người tên có chữ H.” Bạn quen ít nhất bảy người tên H.',
      scene: { loc: 'temple', time: 'day', weather: 'clear', decor: 'tet', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 72, anim: 'point', say: 'Cẩn thận người tên có chữ H!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Tin sái cổ, né hết người tên H',
          text: 'Bạn né chị Hoa, né anh Hùng, né cả cô bán xôi tên Hạnh. Cả năm chẳng có gì xảy ra, ngoài việc mất ba người bạn.',
          effects: { happy: -2, karma: -1 },
          scene: { anim: 'scared', fx: 'sweat' } },
        { label: 'Cười, trả {money:50000} tiền quẻ',
          text: 'Bạn nghe như nghe chuyện vui. Ra về, câu “quý nhân phù trợ” lại khiến bạn tự tin hơn hẳn.',
          effects: { money: -50000, happy: 3 },
          scene: { anim: 'laugh', npcAnim: { stranger: 'nod' } } },
        { label: 'Hỏi: “Thầy đoán con đang nghĩ gì?”',
          text: 'Ông thầy ngẫm nghĩ rồi đáp: “Con đang nghĩ ta nói phét.” Hai bên cùng cười khà khà.',
          effects: { happy: 5, smarts: 1 },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { stranger: 'laugh' }, npcSay: { stranger: 'Con đang nghĩ ta nói phét!' } } }
      ]
    },
    {
      id: 'a_ga_trong_hang_xom', title: 'Con gà trống 3 giờ sáng', icon: '🐓', age: [18, 55], weight: 0.3,
      text: 'Ông hàng xóm mới mua một con gà trống chọi. Nó gáy lúc 3 giờ sáng, 3 giờ 15, 3 giờ 30, và có vẻ rất tự hào về điều đó.',
      scene: { loc: 'street', time: 'dawn', weather: 'fog', anim: 'facepalm', expr: 'sleepy',
        npcs: [{ role: 'neighbor', gender: 'm', age: 62, anim: 'laugh', say: 'Gà giống quý đấy, gáy hay không?' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Tặng ông chiếc lồng có tấm che',
          text: 'Bạn chi {money:400000} mua lồng có tấm che. Gà vẫn gáy, nhưng nhỏ đi được... chừng 20%.',
          effects: { money: -400000, happy: 1, karma: 2 },
          scene: { anim: 'bow', npcAnim: { neighbor: 'nod' } } },
        { label: 'Tập gáy đáp trả',
          text: 'Sáng nào bạn cũng gáy lại. Con gà bối rối, im luôn một tuần. Cả xóm đồn bạn có năng lực lạ.',
          effects: { happy: 6 },
          scene: { anim: 'sing', fx: 'music', npcAnim: { neighbor: 'scared' } } },
        { label: 'Dậy luôn, đi tập thể dục',
          text: 'Bạn coi con gà là đồng hồ báo thức miễn phí. Ba tháng sau khỏe hẳn, còn thấy biết ơn nó.',
          effects: { health: 6, happy: 3 },
          scene: { loc: 'park', anim: 'run', fx: 'sparkle' } }
      ]
    },
    {
      id: 'a_ve_xe_tet', title: 'Vé xe ngày 27 Tết', icon: '🚌', age: [18, 35], once: false, cooldown: 3,
      text: 'Hai mươi bảy Tết, bến xe đông như kiến, vé xe khách tăng giá gấp đôi. Quê cách 300 cây số, và {money:900000} là giá một chỗ... ghế nhựa giữa lối đi.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', decor: 'tet', anim: 'walk', expr: 'sad',
        npcs: [{ role: 'vendor', gender: 'm', age: 45, anim: 'talk', say: 'Vé cuối đây, ghế nhựa 900 nghìn!' }, { role: 'crowd', anim: 'walk' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Mua vé ghế nhựa về quê',
          text: 'Bạn ngồi ghế nhựa tám tiếng, ê ẩm cả người. Nhưng vừa bước vào sân, mùi bánh chưng làm bạn quên hết.',
          effects: { money: -900000, happy: 8, health: -1 },
          scene: { loc: 'countryside', decor: 'tet', weather: 'clear', anim: 'cheer', fx: 'petals' } },
        { label: 'Chạy xe máy về quê', req: { asset: 'motorbike' },
          text: 'Bạn chạy xuyên đêm cùng dòng người về quê, áo mưa phần phật. Tới nhà lúc gà gáy, cả nhà ùa ra đón.',
          effects: { health: -3, happy: 9 },
          scene: { loc: 'countryside', decor: 'tet', time: 'dawn', anim: 'drive', fx: 'sparkle' } },
        { label: 'Ở lại thành phố ăn Tết',
          text: 'Phố xá vắng hoe, đêm giao thừa bạn ăn bánh mì và gọi video về nhà. Pháo hoa đẹp, mà lòng thì trống.',
          effects: { happy: -5, money: 500000 },
          scene: { time: 'night', anim: 'phone', fx: 'fireworks' } }
      ]
    },
    {
      id: 'a_mua_nha_tra_gop', title: 'Căn hộ trả góp 25 năm', icon: '🏢', age: [27, 45], weight: 0.8,
      req: { noAsset: 'house', minMoney: 500000000 },
      text: 'Bạn đi xem một căn hộ hai phòng ngủ: giá {money:2500000000}, trả trước 30%, phần còn lại góp 25 năm. Chị môi giới cười tươi: “Mua đi em, sang năm lên giá đó!”',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 33, anim: 'talk', say: 'Mua đi em, sang năm lên giá đó!' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Ký luôn, có nhà là có tất cả', req: { minMoney: 750000000 },
          text: 'Bạn ký hợp đồng, nhận chìa khóa trong niềm vui run rẩy. Từ nay mỗi tháng trả góp đều đặn, nhưng tối nào về cũng là nhà của mình.',
          effects: { money: -750000000, happy: 12, asset: { add: { type: 'house', name: 'Căn hộ trả góp', value: 2500000000 } } },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { stranger: 'clap' } } },
        { label: 'Thuê nhà tiếp, dồn tiền đầu tư',
          text: 'Bạn quyết định chưa mua. Không áp lực nợ, nhưng mỗi lần chủ nhà tăng giá lại thấy chạnh lòng.',
          effects: { happy: -1, smarts: 2 },
          scene: { anim: 'shrug', npcAnim: { stranger: 'shrug' } } },
        { label: 'Mặc cả cho bằng được',
          success: { stat: 'smarts', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chỉ ra hướng nhà nắng chiều, thang máy chậm, phí quản lý cao... Chủ đầu tư giảm thêm 5%. Bạn vẫn chưa ký, nhưng thấy mình rất có nghề.', effects: { happy: 4, smarts: 2 },
              scene: { anim: 'point', fx: 'idea', npcAnim: { stranger: 'facepalm' } } },
            { text: 'Mặc cả cả buổi, chị môi giới chỉ tặng thêm... bộ chén. Bạn ra về, chân mỏi nhừ.', effects: { happy: -2 },
              scene: { anim: 'facepalm', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    }
  );
})();
