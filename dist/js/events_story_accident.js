/* Một Kiếp Người — ngoại truyện: tai nạn & rủi ro (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: TẮM SÔNG MÙA HÈ =======================
    {
      id: 's_accident_tam_song', title: 'Khúc sông mùa hè', icon: '🏊', age: [13, 25], weight: 1.3,
      req: { notFlag: 's_accident_song' },
      text: 'Trưa tháng Sáu nắng như đổ lửa, hội bạn rủ nhau ra khúc sông cuối làng tắm cho mát. {classmate} nhảy ùm xuống trước, hét vọng lên: “Đứa nào bơi ra tới cột mốc giữa sông thì tao bao trà sữa cả tuần!”',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'idle', expr: 'happy',
        npcs: [{ role: 'classmate', anim: 'swim', say: 'Ra tới cột mốc tao bao cả tuần!' }, { role: 'classmate', anim: 'cheer' }], fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Tắm chỗ nước nông quen thuộc',
          text: 'Bạn té nước, lặn ngụp ở chỗ nước ngang ngực, mát rượi cả người. Đang vui thì ngoài xa vọng lại một tiếng kêu thất thanh.',
          effects: { happy: 4, health: 1, flag: 's_accident_song', followUp: { id: 's_accident_chuot_rut', delay: 0 } },
          scene: { anim: 'swim', fx: 'bubbles', npcAnim: { classmate: 'swim' } } },
        { label: 'Nhận lời thách, bơi ra cột mốc',
          outcomes: [
            { p: 0.5, text: 'Bạn bơi tới cột mốc, bám vào thở hồng hộc. Nước giữa sông xiết hơn bạn tưởng nhiều. Về tới bờ, hai chân run lẩy bẩy mà vẫn cố cười ngạo nghễ.',
              effects: { happy: 5, health: -2, karma: -1, flag: 's_accident_song' },
              scene: { anim: 'swim', fx: 'sweat', npcAnim: { classmate: 'clap' } } },
            { p: 0.4, text: 'Giữa dòng, bắp chân bạn bỗng co rút cứng đờ. Bạn chới với, uống mấy ngụm nước đục, may một chú thả lưới gần đó lao thuyền tới kéo lên.',
              effects: { health: -12, happy: -8, flag: 's_accident_song', followUp: { id: 's_accident_song_benh_vien', delay: 0 } },
              scene: { anim: 'swim', expr: 'scared', fx: 'exclaim', shot: 'dramatic', npcAnim: { classmate: 'scared' } } },
            { p: 0.1, text: 'Dòng nước giữa sông lạnh và xiết hơn mọi lời thách đố. Bạn đuối sức, chìm xuống trước khi ai kịp với tới. Cả làng đi tìm đến tận chiều tối.',
              effects: { die: 'Đuối nước' },
              scene: { fx: 'tears', shot: 'wide', npcAnim: { classmate: 'cry' } } }
          ] },
        { label: 'Ngồi trên bờ trông đồ',
          text: 'Bạn ngồi dưới bụi tre trông dép, trông điện thoại cho cả bọn. Đang lim dim thì nghe tiếng hét thất thanh ngoài sông.',
          effects: { happy: 1, flag: 's_accident_song', followUp: { id: 's_accident_chuot_rut', delay: 0 } },
          scene: { anim: 'sit', fx: 'exclaim' } }
      ]
    },
    {
      id: 's_accident_chuot_rut', title: 'Chuột rút giữa dòng', icon: '🆘', age: [13, 30], chainOnly: true,
      text: '{classmate} đã bơi ra quá xa, giờ đang chới với giữa dòng, tay đập loạn xạ. Mấy đứa trên bờ đứng chết trân, không ai biết phải làm gì.',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'classmate', anim: 'swim', expr: 'scared', say: 'Cứu... chân tao bị chuột rút!' }, { role: 'classmate', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Lao xuống bơi ra cứu',
          success: { stat: 'health', base: 0.2, scale: 0.6 },
          outcomes: [
            { text: 'Bạn bơi vòng ra sau lưng {classmate}, kẹp nách kéo vào bờ đúng như từng xem trên tivi. Cả hai nằm vật ra bãi cỏ thở dốc, rồi {classmate} ôm chầm lấy bạn khóc nức nở.',
              effects: { karma: 15, happy: 10, health: -3, flag: 's_accident_cuu_ban', addPerson: { role: 'friend', fromScene: 'classmate' } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { classmate: 'cry' } } },
            { text: 'Bạn vừa tới nơi, {classmate} đã hoảng loạn ghì chặt lấy bạn, cả hai cùng chìm. Một chú đánh cá lao thuyền tới vớt cả hai lên. Bạn uống no nước và lịm đi.',
              effects: { health: -15, karma: 8, followUp: { id: 's_accident_song_benh_vien', delay: 0 } },
              scene: { anim: 'fall', fx: 'bubbles', shot: 'dramatic', npcAnim: { classmate: 'scared' } } }
          ] },
        { label: 'Chìa sào tre dài, hô người lớn',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn vớ cây sào tre dài, nằm rạp trên bờ chìa ra. {classmate} bám được, cả bọn hè nhau kéo vào. Ông lão bên kia sông gật gù: “Đứa này khôn đấy!”',
              effects: { karma: 10, smarts: 3, happy: 6, flag: 's_accident_cuu_ban' },
              scene: { anim: 'point', fx: 'idea', npcAnim: { classmate: 'swim' } } },
            { text: 'Cây sào ngắn quá, không với tới. May người lớn trong làng chạy ra kịp, kéo được {classmate} lên rồi chở đi trạm xá. Bạn đứng run cầm cập.',
              effects: { karma: 5, happy: -4 },
              scene: { anim: 'scared', fx: 'sweat', npcAnim: { classmate: 'sick' } } }
          ] },
        { label: 'Chạy vào làng gọi người lớn',
          outcomes: [
            { p: 0.75, text: 'Bạn chạy như bay vào làng. Mấy chú đang làm đồng nhảy ùm xuống sông, đưa {classmate} lên bờ an toàn. Ai cũng khen bạn nhanh trí mà không liều mạng.',
              effects: { karma: 6, happy: 3, smarts: 2 },
              scene: { anim: 'run', fx: 'dust', npcAnim: { classmate: 'sit' } } },
            { p: 0.25, text: 'Người lớn tới hơi muộn, {classmate} sặc nước phải nằm viện ba ngày. Bạn vào thăm, nó cười yếu ớt: “May mà mày chạy đi gọi.”',
              effects: { karma: 4, happy: -3 },
              scene: { loc: 'hospital', anim: 'sad', fx: 'tears', npcAnim: { classmate: 'sick' } } }
          ] }
      ]
    },
    {
      id: 's_accident_song_benh_vien', title: 'Tỉnh dậy ở trạm xá', icon: '🏥', age: [13, 30], chainOnly: true,
      text: 'Bạn mở mắt, trần nhà trắng toát, mùi thuốc sát trùng xộc vào mũi. {mother.K} ngồi bên giường, mắt sưng húp, tay vẫn nắm chặt tay bạn. Bác sĩ bảo may được sơ cứu kịp, phổi chỉ bị sặc nước nhẹ.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'sleep', expr: 'sick',
        npcs: [{ role: 'mother', anim: 'cry', say: 'Con làm mẹ sợ muốn đứng tim!' }, { role: 'doctor', anim: 'talk', say: 'Nghỉ vài hôm là khỏe, nhớ đừng liều nữa.' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Xin lỗi mẹ, hứa không liều nữa',
          text: 'Bạn ôm lấy mẹ, nói lí nhí lời xin lỗi. Mẹ không mắng câu nào, chỉ xoa đầu bạn mãi.',
          effects: { rel: { mother: 8 }, karma: 3, happy: 3, health: 4 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug' } } },
        { label: 'Xin mẹ cho đi học bơi bài bản',
          text: 'Bạn nói với mẹ: “Con sẽ học bơi cho thật giỏi, để không bao giờ phải sợ nước nữa.” Mẹ lau nước mắt, gật đầu.',
          effects: { health: 3, smarts: 2, rel: { mother: 4 }, followUp: { id: 's_accident_hoc_boi', delay: 1 } },
          scene: { anim: 'nod', fx: 'idea', npcAnim: { mother: 'nod', doctor: 'clap' } } },
        { label: 'Cười trừ: “Có sao đâu mẹ”',
          text: 'Mẹ nhìn bạn rất lâu, rồi quay mặt ra cửa sổ. Bác sĩ thở dài, lắc đầu.',
          effects: { rel: { mother: -6 }, karma: -2, happy: 1 },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { mother: 'sad', doctor: 'shake' } } }
      ]
    },
    {
      id: 's_accident_hoc_boi', title: 'Lớp bơi mùa hè', icon: '🤿', age: [14, 31], chainOnly: true,
      text: 'Mùa hè năm sau, bạn đăng ký lớp bơi của đội cứu hộ ngoài biển. Thầy dạy da đen nhẻm, giọng sang sảng: “Biết bơi chưa đủ, phải biết cứu mình rồi mới cứu người.”',
      scene: { loc: 'beach', time: 'day', weather: 'clear', anim: 'swim', expr: 'happy',
        npcs: [{ role: 'teacher', gender: 'm', age: 42, anim: 'point', say: 'Thở đều! Chân đạp mạnh lên!' }], fx: 'bubbles', shot: 'wide' },
      choices: [
        { label: 'Học chăm, thi luôn chứng chỉ cứu hộ',
          text: 'Ba tháng phơi nắng, bạn bơi được 400 mét liền, biết cả cách kéo người đuối nước vào bờ. Tấm chứng chỉ nhỏ xíu mà bạn quý như vàng.',
          effects: { health: 8, smarts: 2, happy: 5, flag: 's_accident_biet_boi', followUp: { id: 's_accident_cuu_be', delay: 3 } },
          scene: { anim: 'cheer', fx: 'levelup', npcAnim: { teacher: 'clap' } } },
        { label: 'Học vừa đủ để nổi được',
          text: 'Bạn học được bơi ếch, nổi được, thở được. Không giỏi, nhưng xuống nước không còn run như trước.',
          effects: { health: 4, happy: 3, flag: 's_accident_biet_boi' },
          scene: { anim: 'swim', fx: 'bubbles', npcAnim: { teacher: 'nod' } } },
        { label: 'Bỏ giữa chừng vì còn sợ nước',
          text: 'Cứ mỗi lần úp mặt xuống nước, cảnh chới với năm ngoái lại hiện về. Bạn bỏ lớp sau tuần thứ hai.',
          effects: { happy: -3, health: 1 },
          scene: { anim: 'sad', fx: 'sweat', npcAnim: { teacher: 'shrug' } } }
      ]
    },
    {
      id: 's_accident_cuu_be', title: 'Dòng chảy xa bờ', icon: '🌊', age: [16, 40], chainOnly: true,
      req: { flag: 's_accident_biet_boi' },
      text: 'Kỳ nghỉ ở biển, bạn nghe tiếng thét thất thanh: một đứa bé bị dòng chảy xa bờ cuốn ra ngoài, chỉ còn thấy cái đầu nhấp nhô. Người mẹ chạy dọc bờ gào khóc, còn chòi cứu hộ thì ở tít đầu bãi.',
      scene: { loc: 'beach', time: 'day', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'kid', anim: 'swim', expr: 'scared' }, { role: 'stranger', gender: 'f', age: 35, anim: 'cry', say: 'Cứu con tôi với! Ai cứu con tôi với!' }, { role: 'crowd', anim: 'point' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Bơi chéo ra cứu, đúng như đã học',
          success: { stat: 'health', base: 0.45, scale: 0.5 },
          outcomes: [
            { text: 'Bạn không bơi ngược dòng mà bơi chéo song song bờ như thầy dạy, áp sát đứa bé từ phía sau rồi kéo vào. Người mẹ ôm chặt con, quỳ sụp xuống cát cảm ơn bạn.',
              effects: { karma: 18, happy: 12, flag: 's_accident_anh_hung' },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'bow', kid: 'cry', crowd: 'clap' } } },
            { text: 'Bạn tới được chỗ đứa bé nhưng sóng quá mạnh. Hai người bám vào nhau nổi bập bềnh cho tới khi đội cứu hộ lao ra. Cả hai an toàn, bạn kiệt sức nằm vật trên cát.',
              effects: { karma: 12, health: -6, happy: 5 },
              scene: { anim: 'sit', expr: 'sleepy', fx: 'sweat', npcAnim: { stranger: 'hug', crowd: 'clap' } } }
          ] },
        { label: 'Ném phao, hô cứu hộ, chỉ đúng hướng',
          text: 'Bạn giật chiếc phao trên ghế cứu hộ ném ra, rồi đứng giữa bãi vẫy tay chỉ đúng chỗ đứa bé. Cứu hộ lao ra kịp, đứa bé được đưa vào bờ an toàn.',
          effects: { karma: 9, smarts: 3, happy: 6 },
          scene: { anim: 'wave', fx: 'exclaim', npcAnim: { stranger: 'bow', crowd: 'clap' } } }
      ]
    },

    // ======================= ARC 2: ĐUA XE ĐÊM =======================
    {
      id: 's_accident_dua_xe', title: 'Đêm đi bão', icon: '🏍️', age: [15, 19], weight: 1.2,
      req: { notFlag: 's_accident_dua' },
      text: 'Mười một giờ đêm thứ Bảy, đám bạn tụ tập ở đầu cầu, xe độ pô nổ inh tai. {classmate} rồ ga, hất hàm về phía đại lộ vắng tanh: “Đi một vòng không? Mũ mão gì, cho nó phiêu!”',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'classmate', anim: 'drive', say: 'Mũ mão gì, cho nó phiêu!' }, { role: 'classmate', anim: 'drive' }, { role: 'crowd', anim: 'cheer' }], fx: 'exclaim', shot: 'low' },
      choices: [
        { label: 'Lên xe, lạng lách cho ngầu',
          outcomes: [
            { p: 0.45, text: 'Cả đám lạng lách qua ba ngã tư vắng, gió quất rát mặt, tim bạn đập như trống trận. Về tới nhà lúc hai giờ sáng, chân còn run mà miệng vẫn cười.',
              effects: { happy: 6, karma: -4, health: -1, flag: 's_accident_dua' },
              scene: { anim: 'drive', fx: 'dust', npcAnim: { classmate: 'drive' } } },
            { p: 0.45, text: 'Ở khúc cua, bánh xe trượt vệt cát. Bạn văng khỏi xe, trượt dài trên mặt đường. Tiếng còi cấp cứu hú vang giữa đêm khuya.',
              effects: { health: -25, happy: -10, illness: 'Gãy chân', flag: 's_accident_dua', followUp: { id: 's_accident_xe_benh_vien', delay: 0 } },
              scene: { anim: 'fall', fx: 'dust', shot: 'dramatic', npcAnim: { classmate: 'scared' } } },
            { p: 0.1, text: 'Chiếc xe mất lái lao vào dải phân cách. Không mũ bảo hiểm, không ai kịp làm gì. Đêm ấy, nhóm bạn trở về thiếu một người.',
              effects: { die: 'Tai nạn giao thông' },
              scene: { anim: 'fall', fx: 'tears', shot: 'wide', npcAnim: { classmate: 'cry' } } }
          ] },
        { label: 'Đi theo nhưng đội mũ, chạy chậm phía sau',
          outcomes: [
            { p: 0.6, text: 'Bạn đội mũ, lẽo đẽo phía sau. Tới khúc cua, {classmate} ngã văng ngay trước mắt. Bạn dừng xe, gọi cấp cứu, ngồi cạnh nó tới khi xe tới. Đêm đó bạn không ngủ được.',
              effects: { karma: 6, happy: -6, flag: ['s_accident_dua', 's_accident_doi_mu'] },
              scene: { anim: 'phone', expr: 'scared', fx: 'exclaim', npcAnim: { classmate: 'fall' } } },
            { p: 0.4, text: 'Tổ tuần tra chặn cả nhóm ở đầu cầu. Xe bị tạm giữ, phụ huynh từng đứa phải lên bảo lãnh lúc nửa đêm. Bạn bị cấm túc cả tháng.',
              effects: { happy: -8, karma: -2, flag: 's_accident_dua' },
              scene: { anim: 'sad', fx: 'flash', npcAnim: { classmate: 'facepalm' } } }
          ] },
        { label: 'Từ chối, về nhà ngủ',
          text: 'Cả đám cười ồ, gọi bạn là “gà”. Bạn vẫn về. Sáng hôm sau, trên mạng lan truyền tin nhóm đua xe đêm qua có người nhập viện.',
          effects: { happy: -1, karma: 3, health: 1, flag: ['s_accident_dua', 's_accident_doi_mu'] },
          scene: { anim: 'walk', fx: 'question', npcAnim: { classmate: 'laugh' } } }
      ]
    },
    {
      id: 's_accident_xe_benh_vien', title: 'Phòng cấp cứu lúc nửa đêm', icon: '🚑', age: [15, 25], chainOnly: true,
      text: 'Bạn tỉnh dậy với cái chân bó bột trắng toát và hàng chục vết trầy. Bác sĩ nói giọng nghiêm: “Không mũ bảo hiểm mà chỉ gãy chân là phúc lớn đấy.” {mother.K} đứng ở cửa phòng, không khóc, không mắng, chỉ lặng im.',
      scene: { loc: 'hospital', time: 'night', weather: 'clear', anim: 'sleep', expr: 'sick',
        npcs: [{ role: 'doctor', anim: 'talk', say: 'Không mũ bảo hiểm mà chỉ gãy chân là phúc lớn.' }, { role: 'mother', anim: 'sad' }], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Xin lỗi mẹ, thề từ nay luôn đội mũ',
          text: 'Bạn khóc nấc lên. Mẹ bước tới, nắm tay bạn thật chặt. Chiếc mũ bảo hiểm mẹ mua hôm sau, bạn đội suốt mấy năm trời.',
          effects: { rel: { mother: 8 }, karma: 4, happy: 2, flag: 's_accident_doi_mu', followUp: { id: 's_accident_doi_mu_cuu', delay: 3 } },
          scene: { anim: 'cry', fx: 'hearts', npcAnim: { mother: 'hug' } } },
        { label: 'Đổ tại đường nhiều cát',
          text: 'Mẹ quay lưng đi ra hành lang. Đêm đó, bạn nghe tiếng mẹ khóc khe khẽ ngoài dãy ghế chờ.',
          effects: { rel: { mother: -8 }, karma: -3, happy: -3 },
          scene: { anim: 'shrug', fx: 'tears', npcAnim: { mother: 'cry', doctor: 'shake' } } },
        { label: 'Nhắn vào nhóm: “Từ nay tao bỏ đua”',
          text: 'Có đứa thả cười, có đứa im lặng. Hai tuần sau, nhóm giải tán, mấy đứa còn nhắn riêng cảm ơn bạn đã dám nói trước.',
          effects: { karma: 5, happy: 3, flag: 's_accident_doi_mu', followUp: { id: 's_accident_doi_mu_cuu', delay: 3 } },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { mother: 'nod' } } }
      ]
    },
    {
      id: 's_accident_doi_mu_cuu', title: 'Chiếc mũ vỡ đôi', icon: '⛑️', age: [17, 60], weight: 0.6,
      req: { since: { s_accident_doi_mu: 2 } },
      text: 'Chiều mưa, một chiếc xe tải tạt đầu, bạn ngã văng, đầu đập xuống mép đường. Chiếc mũ bảo hiểm vỡ toác một mảng, còn bạn chỉ choáng váng, trầy xước. Người đi đường xúm lại đỡ, ai cũng lắc đầu: “Không có cái mũ là xong rồi.”',
      scene: { loc: 'street', time: 'dusk', weather: 'rain', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'stranger', anim: 'talk', say: 'Không có cái mũ là xong rồi đó!' }, { role: 'crowd', anim: 'point' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Mua ngay chiếc mũ mới tốt hơn',
          text: 'Bạn mua chiếc mũ loại tốt nhất trong tiệm, còn chiếc mũ vỡ thì treo ở góc nhà như một lá bùa hộ mệnh.',
          effects: { money: -800000, health: -4, happy: 4, karma: 1 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'nod' } } },
        { label: 'Đăng ảnh chiếc mũ vỡ lên mạng',
          text: 'Bức ảnh chiếc mũ vỡ được chia sẻ hàng chục nghìn lần. Nhiều phụ huynh gắn thẻ con mình vào, kèm một dòng: “Đội mũ vào!”',
          effects: { health: -4, happy: 5, karma: 6 },
          scene: { anim: 'phone', fx: 'hearts' } },
        { label: 'Ghi biển số xe tải, trình báo',
          outcomes: [
            { p: 0.6, text: 'Nhờ camera ven đường, tài xế xe tải bị xác định có lỗi, phải bồi thường cho bạn {money:5000000}.',
              effects: { health: -4, money: 5000000, smarts: 2 },
              scene: { anim: 'point', fx: 'money' } },
            { p: 0.4, text: 'Chiếc xe tải đã chạy mất hút. Nhưng bạn vẫn lành lặn đứng đây, thế là đủ.',
              effects: { health: -4, happy: 2 },
              scene: { anim: 'shrug', fx: 'sweat' } }
          ] }
      ]
    },

    // ======================= ARC 3: SAY XỈN SAU ĐÁM CƯỚI =======================
    {
      id: 's_accident_cuoi_say', title: 'Trăm phần trăm', icon: '🍻', age: [22, 65], weight: 1.1,
      req: { notFlag: 's_accident_say' },
      text: 'Đám cưới đứa bạn thân, bàn bạn bè “dô” liên tục. Tàn tiệc, mặt bạn đỏ gay, đầu lâng lâng, chìa khóa xe máy lủng lẳng trong túi. Nhà cách đây mười hai cây số.',
      scene: { loc: 'wedding', time: 'night', weather: 'clear', anim: 'drink', expr: 'happy',
        npcs: [{ role: 'stranger', anim: 'cheer', say: 'Một trăm phần trăm nào!' }, { role: 'crowd', anim: 'cheer' }], fx: 'music', shot: 'close' },
      choices: [
        { label: 'Gọi xe ôm công nghệ, mai quay lại lấy xe',
          text: 'Bạn gửi xe lại nhà hàng, gọi xe về. Sáng hôm sau đầu hơi nhức, nhưng xe còn, người còn, bằng lái còn.',
          effects: { money: -180000, happy: 2, karma: 3, flag: 's_accident_say' },
          scene: { anim: 'phone', fx: 'sparkle', npcAnim: { stranger: 'wave' } } },
        { label: 'Nhờ đứa bạn chưa uống chở về',
          text: 'Đứa bạn uống nước ngọt cả buổi chở bạn về tận cửa. Bạn hứa đám cưới nó sẽ làm y như vậy.',
          effects: { happy: 2, karma: 2, flag: 's_accident_say' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'laugh' } } },
        { label: 'Tự lái về, “mới có mấy lon”',
          outcomes: [
            { p: 0.4, text: 'Tới ngã tư, tổ cảnh sát giao thông ra hiệu dừng xe đo nồng độ cồn. Máy kêu tít tít. Phạt {money:7000000}, tạm giữ xe, tước bằng gần hai năm.',
              effects: { money: -7000000, happy: -10, flag: 's_accident_say', followUp: { id: 's_accident_say_mot_nam', delay: 1 } },
              scene: { loc: 'street', anim: 'facepalm', fx: 'flash' } },
            { p: 0.35, text: 'Xe chao đảo rồi lao lên lề, tông đổ cả xe nước mía ven đường. Bạn nằm bất động trên vỉa hè, xung quanh tiếng người la hét.',
              effects: { health: -22, happy: -10, illness: 'Gãy tay', flag: 's_accident_say', followUp: { id: 's_accident_say_benh_vien', delay: 0 } },
              scene: { loc: 'street', anim: 'fall', fx: 'stars', shot: 'dramatic' } },
            { p: 0.12, text: 'Trên quãng đường tối, chiếc xe lạc tay lái lao sang làn ngược chiều. Tiệc cưới vui vẻ khép lại bằng một đám tang không ai mong muốn.',
              effects: { die: 'Tai nạn giao thông khi say rượu' },
              scene: { loc: 'street', anim: 'fall', fx: 'tears', shot: 'wide' } },
            { p: 0.13, text: 'Bạn về tới nhà an toàn, không hiểu bằng cách nào. Sáng ra thấy vết xước dài trên yếm xe, bạn lạnh cả sống lưng.',
              effects: { happy: -2, health: -1, karma: -1, flag: 's_accident_say', followUp: { id: 's_accident_say_mot_nam', delay: 1 } },
              scene: { loc: 'home', time: 'dawn', anim: 'think', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_accident_say_benh_vien', title: 'Biên bản bên giường bệnh', icon: '🩹', age: [22, 70], chainOnly: true,
      text: 'Bạn nằm viện với cánh tay bó bột và sáu mũi khâu trên trán. {police.K} {police} đến tận giường lập biên bản: nồng độ cồn vượt mức kịch khung. Bà chủ xe nước mía bị gãy cổ tay, đang nằm ở phòng bên.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'sick', expr: 'sad',
        npcs: [{ role: 'police', anim: 'talk', say: 'Nồng độ cồn kịch khung rồi đấy.' }, { role: 'doctor', anim: 'think' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Sang phòng bên xin lỗi, bồi thường đầy đủ',
          text: 'Bạn khập khiễng sang phòng bên, cúi đầu xin lỗi, lo toàn bộ viện phí và sắm lại xe nước mía mới. Bà cụ nhìn bạn một lúc rồi thở dài: “Thôi, người còn là may.”',
          effects: { money: -15000000, karma: 8, happy: 2, followUp: { id: 's_accident_say_mot_nam', delay: 1 } },
          scene: { anim: 'bow', fx: 'money', npcAnim: { police: 'nod' } } },
        { label: 'Thề bỏ hẳn rượu bia',
          text: 'Bạn nộp phạt, bồi thường, rồi xóa luôn số mấy ông bạn nhậu. Nằm viện ba tuần, bạn nghĩ về đủ thứ chuyện mà trước giờ chưa từng nghĩ.',
          effects: { money: -12000000, health: 5, happy: 1, flag: 's_accident_bo_ruou', followUp: { id: 's_accident_say_mot_nam', delay: 1 } },
          scene: { anim: 'think', fx: 'idea', npcAnim: { doctor: 'nod' } } },
        { label: 'Nhờ người quen “chạy” cho nhẹ tội',
          outcomes: [
            { p: 0.3, text: 'Người quen hứa chắc như đinh đóng cột, nhận của bạn {money:10000000} rồi... biến mất. Bạn vẫn phải nộp phạt đủ.',
              effects: { money: -22000000, karma: -6, happy: -6, followUp: { id: 's_accident_say_mot_nam', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { police: 'shake' } } },
            { p: 0.7, text: 'Chẳng ai dám nhận lời. Bạn vẫn phải nộp phạt và bồi thường đầy đủ, lại mang thêm tiếng xấu.',
              effects: { money: -12000000, karma: -3, happy: -4, followUp: { id: 's_accident_say_mot_nam', delay: 1 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { police: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_accident_say_mot_nam', title: 'Lại một mâm cỗ cưới', icon: '🥂', age: [23, 70], chainOnly: true,
      text: 'Một năm sau, lại một đám cưới, lại những tiếng “dô” rôm rả. Vẫn là {stranger} rót đầy ly, dúi vào tay bạn: “Năm ngoái xui thôi, uống đi, nay ai bắt nữa!” Cả bàn quay sang nhìn bạn chờ đợi.',
      scene: { loc: 'wedding', time: 'night', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'stranger', anim: 'cheer', say: 'Năm ngoái xui thôi, uống đi!' }, { role: 'crowd', anim: 'clap' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Nâng ly nước ngọt, cười từ chối',
          text: 'Bạn nâng ly nước ngọt: “Chuyện năm ngoái đủ để tôi nhớ cả đời.” Cả bàn im lặng một giây, rồi {stranger} là người vỗ tay đầu tiên.',
          effects: { health: 4, happy: 5, karma: 4, flag: 's_accident_tinh_tao' },
          scene: { anim: 'drink', fx: 'sparkle', npcAnim: { stranger: 'clap', crowd: 'clap' } } },
        { label: 'Uống vài ly rồi gọi xe về',
          text: 'Bạn uống vừa phải, cuối tiệc gọi xe về, gửi xe lại nhà hàng. Vui mà vẫn tỉnh.',
          effects: { money: -200000, happy: 4, health: -1 },
          scene: { anim: 'phone', fx: 'music', npcAnim: { stranger: 'wave' } } },
        { label: 'Uống tới bến rồi lại tự lái',
          outcomes: [
            { p: 0.6, text: 'Cảnh sát giao thông lại chặn bạn ở đúng ngã tư năm ngoái. Tái phạm, phạt nặng, xe bị tạm giữ dài hạn. Bạn đứng dưới đèn đường, cười chua chát.',
              effects: { money: -8000000, happy: -12, karma: -5, asset: { lose: 'motorbike' } },
              scene: { loc: 'street', anim: 'facepalm', fx: 'flash' } },
            { p: 0.28, text: 'Xe lao xuống mương ven đường. Bạn nằm viện ba tháng, chân đi cà nhắc mãi về sau.',
              effects: { health: -30, happy: -15, looks: -4, money: -20000000, illness: 'Di chứng tai nạn' },
              scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } },
            { p: 0.12, text: 'Lần này may mắn không còn ở lại. Chiếc xe lao vào gốc cây bên đường trong đêm tối, và bạn không bao giờ về tới nhà.',
              effects: { die: 'Tai nạn giao thông khi say rượu' },
              scene: { loc: 'street', anim: 'fall', fx: 'tears', shot: 'wide' } }
          ] }
      ]
    },

    // ======================= ARC 4: CON DIỀU MẮC DÂY ĐIỆN =======================
    {
      id: 's_accident_dieu_mac_day', title: 'Con diều mắc dây điện', icon: '🪁', age: [13, 16], weight: 1.0,
      req: { notFlag: 's_accident_dieu' },
      text: 'Con diều sáo bạn dán suốt ba buổi chiều mắc tòn ten trên đường dây điện đầu làng. Đứa nhỏ hàng xóm mếu máo đòi diều, còn {classmate} thì xúi: “Trèo cột lên gỡ đi, có ai thấy đâu!”',
      scene: { loc: 'countryside', time: 'dusk', weather: 'clear', anim: 'think', expr: 'sad',
        npcs: [{ role: 'classmate', anim: 'point', say: 'Trèo cột lên gỡ đi, nhanh mà!' }, { role: 'kid', anim: 'cry' }], fx: 'question', shot: 'low' },
      choices: [
        { label: 'Trèo cột điện lên gỡ',
          outcomes: [
            { p: 0.4, text: 'Bạn mới trèo được nửa cột thì bác trưởng thôn chạy ra quát ầm. Bạn tuột xuống, bị xách tai về nhà, nghe giảng cả tối về dòng điện trung thế.',
              effects: { happy: -4, karma: -1, flag: 's_accident_dieu' },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { classmate: 'run' } } },
            { p: 0.5, text: 'Tay bạn vừa với gần dây thì một tia lửa xanh lóe lên. Bạn bị hất văng xuống ruộng, cánh tay bỏng rát, tai ù đặc.',
              effects: { health: -20, happy: -8, looks: -2, illness: 'Bỏng điện', flag: 's_accident_dieu', followUp: { id: 's_accident_dien_benh_vien', delay: 0 } },
              scene: { anim: 'fall', fx: 'flash', shot: 'dramatic', npcAnim: { classmate: 'scared', kid: 'scared' } } },
            { p: 0.1, text: 'Một tiếng nổ chát chúa, tia lửa lóe sáng cả đầu làng. Mọi người chạy ra, nhưng đã quá muộn.',
              effects: { die: 'Điện giật' },
              scene: { anim: 'fall', fx: 'flash', shot: 'wide', npcAnim: { classmate: 'cry', kid: 'cry' } } }
          ] },
        { label: 'Lấy sào tre khều xuống',
          outcomes: [
            { p: 0.55, text: 'Cây sào tre ướt hơi sương, vừa chạm dây bạn đã thấy tê rần cả hai tay. Bạn buông sào kịp, ngồi phịch xuống đất, tim đập thình thịch.',
              effects: { health: -6, happy: -3, smarts: 2, flag: 's_accident_dieu' },
              scene: { anim: 'scared', fx: 'flash', npcAnim: { classmate: 'scared' } } },
            { p: 0.45, text: 'Bạn khều mãi không được, con diều rách tả tơi. Đành bỏ cuộc, may mà chẳng ai sao.',
              effects: { happy: -2, flag: 's_accident_dieu' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { kid: 'sad' } } }
          ] },
        { label: 'Bỏ diều, gọi báo điện lực',
          text: 'Bạn gọi đường dây nóng điện lực. Hôm sau thợ điện tới gỡ, còn khen bạn hiểu chuyện. Hai đứa dán con diều mới, to gấp đôi.',
          effects: { karma: 4, smarts: 2, happy: 3, flag: 's_accident_dieu' },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { kid: 'cheer' } } }
      ]
    },
    {
      id: 's_accident_dien_benh_vien', title: 'Vết bỏng trên tay', icon: '🩺', age: [13, 20], chainOnly: true,
      text: 'Bạn nằm ở khoa bỏng, cánh tay quấn băng kín mít. Bác sĩ bảo dòng điện chỉ đi qua tay, may không qua tim. {mother.K} ngồi đút cho bạn từng thìa cháo, thỉnh thoảng lại quay đi lau mắt.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'sick', expr: 'sick',
        npcs: [{ role: 'mother', anim: 'sad', say: 'Con mà có mệnh hệ gì thì mẹ sống sao...' }, { role: 'doctor', anim: 'talk' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Hứa với mẹ không bao giờ liều nữa',
          text: 'Bạn nắm lấy tay mẹ bằng bàn tay còn lành. Mẹ gật đầu, nước mắt rơi lã chã xuống bát cháo.',
          effects: { rel: { mother: 8 }, karma: 3, happy: 2, followUp: { id: 's_accident_dien_ngoai_khoa', delay: 1 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'cry' } } },
        { label: 'Nhờ {classmate} kể cho cả lớp để ai cũng sợ',
          text: '{classmate} vào thăm, nghe bạn dặn rồi về kể lại cho cả lớp. Tuần đó không đứa nào dám thả diều gần đường dây điện nữa.',
          effects: { karma: 4, happy: 2, followUp: { id: 's_accident_dien_ngoai_khoa', delay: 1 } },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { mother: 'nod' } } },
        { label: 'Lo nhất là vết sẹo xấu',
          text: 'Bạn soi gương cả buổi, thở dài thườn thượt. Bác sĩ cười: “Vết sẹo này là tấm huân chương nhắc cháu cả đời đấy.”',
          effects: { looks: -3, happy: -4 },
          scene: { anim: 'sad', fx: 'sweat', npcAnim: { doctor: 'laugh' } } }
      ]
    },
    {
      id: 's_accident_dien_ngoai_khoa', title: 'Buổi ngoại khóa an toàn điện', icon: '⚡', age: [14, 22], chainOnly: true,
      text: 'Năm sau, trường mời bạn lên sân khấu buổi ngoại khóa “An toàn điện mùa thả diều”. Vết sẹo trên tay vẫn còn đó. Cả trường im phăng phắc chờ bạn kể.',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'talk', expr: 'neutral',
        npcs: [{ role: 'teacher', anim: 'nod' }, { role: 'crowd', anim: 'sit' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Kể thật, kể cả lúc mình sợ nhất',
          text: 'Bạn kể về tia lửa xanh, về bát cháo của mẹ. Cuối buổi, mấy đứa lớp dưới chạy tới xin số điện thoại báo sự cố điện lực.',
          effects: { karma: 8, happy: 6, smarts: 2 },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { crowd: 'clap', teacher: 'clap' } } },
        { label: 'Pha trò cho đỡ ngại',
          outcomes: [
            { p: 0.6, text: 'Bạn kể chuyện có duyên, cả trường cười nghiêng ngả mà vẫn nhớ bài học.',
              effects: { happy: 6, karma: 4 },
              scene: { anim: 'laugh', fx: 'music', npcAnim: { crowd: 'laugh' } } },
            { p: 0.4, text: 'Cả trường cười ồ, nhưng {teacher.K} {teacher} nhắc khẽ: “Chuyện này không đùa được đâu em.” Bạn đỏ mặt, nghiêm túc lại.',
              effects: { happy: -1, karma: 2, smarts: 1 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { teacher: 'shake' } } }
          ] },
        { label: 'Run quá, cầm giấy đọc',
          text: 'Bạn đọc run run từ tờ giấy soạn sẵn. Giọng không hay, nhưng tới đoạn kể về vết sẹo thì cả trường lặng đi.',
          effects: { karma: 4, happy: 2, smarts: 1 },
          scene: { anim: 'study', fx: 'sweat', npcAnim: { crowd: 'clap' } } }
      ]
    },
    {
      id: 's_accident_o_dien', title: 'Ổ điện tóe lửa', icon: '🔌', age: [18, 80], weight: 0.9,
      text: 'Trời mưa tầm tã, ổ điện cạnh bàn nước bỗng xèo xèo tóe lửa rồi cả nhà tối om. Mùi nhựa khét thoang thoảng, còn nước mưa thì đang dột ngay trên đầu ổ cắm.',
      scene: { loc: 'home', time: 'night', weather: 'rain', anim: 'scared', expr: 'surprised', fx: 'flash', shot: 'close' },
      choices: [
        { label: 'Tự tháo ra sửa, tay còn ướt',
          outcomes: [
            { p: 0.55, text: 'Bạn vừa chạm tua vít vào, cả cánh tay giật nảy, tê rần. Bạn ngồi bệt xuống sàn, tim đập loạn mất mấy phút.',
              effects: { health: -10, happy: -4 },
              scene: { anim: 'fall', fx: 'flash' } },
            { p: 0.37, text: 'Ăn may, bạn đấu lại được dây, đèn sáng trở lại. Sáng ra đọc tin trên mạng mới biết mình vừa đùa với tử thần.',
              effects: { happy: 2, smarts: 1 },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.08, text: 'Sàn nhà ướt, tay ướt, và dòng điện không cho ai cơ hội thứ hai. Sáng hôm sau, cả con hẻm bàng hoàng.',
              effects: { die: 'Điện giật' },
              scene: { anim: 'fall', fx: 'flash', shot: 'wide' } }
          ] },
        { label: 'Ngắt cầu dao tổng rồi mới xem',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn ngắt cầu dao, lau khô, che chỗ dột, thay ổ cắm mới. Đèn sáng lại, bạn thấy mình như thợ điện thứ thiệt.',
              effects: { smarts: 3, happy: 4, money: -60000 },
              scene: { anim: 'cheer', fx: 'idea' } },
            { text: 'Ngắt cầu dao rồi, nhưng nhìn mớ dây lằng nhằng bạn đành chịu thua. Thắp nến chờ sáng mai gọi thợ vậy.',
              effects: { money: -300000, happy: -1, smarts: 1 },
              scene: { anim: 'shrug', fx: 'question' } }
          ] },
        { label: 'Gọi thợ điện tới ngay',
          text: 'Chú thợ điện đội mưa tới, vừa sửa vừa càm ràm: “Ổ cắm sát chỗ dột thế này là chết người như chơi.” Bạn trả {money:400000}, ngoan ngoãn gật đầu.',
          effects: { money: -400000, smarts: 2, happy: 1 },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Quấn băng keo tạm, mai tính',
          text: 'Bạn quấn băng keo quanh ổ điện, bật lại cầu dao rồi đi ngủ. Nửa đêm, một mùi khét lạ lùng len vào giấc ngủ.',
          effects: { happy: -1, followUp: { id: 's_accident_chay_nha', delay: 0 } },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'smoke' } }
      ]
    },

    // ======================= ARC 5: CHÁY NHÀ =======================
    {
      id: 's_accident_chay_nha', title: 'Đêm khói đen', icon: '🔥', age: [13, 90], weight: 0.8,
      req: { notFlag: 's_accident_chay' },
      text: 'Hai giờ sáng, bạn choàng tỉnh vì mùi khét nồng nặc. Khói đen cuồn cuộn từ tầng dưới bốc lên, ánh lửa đỏ rực hắt qua ô cửa, {neighbor.k} hàng xóm đập cửa ầm ầm.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'neighbor', anim: 'scared', say: 'Cháy rồi! Chạy ra ngoài mau!' }], fx: 'smoke', shot: 'dramatic' },
      choices: [
        { label: 'Bịt khăn ướt, cúi thấp, thoát ra ngoài',
          success: { stat: 'health', base: 0.5, scale: 0.4 },
          outcomes: [
            { text: 'Bạn nhúng khăn vào xô nước, bịt kín mũi miệng, cúi sát sàn lần theo tường ra cửa. Ra tới đường, bạn ho sặc sụa nhưng an toàn.',
              effects: { health: -3, smarts: 3, happy: 2, flag: 's_accident_chay', followUp: { id: 's_accident_chay_sang', delay: 0 } },
              scene: { loc: 'street', anim: 'sick', fx: 'smoke', npcAnim: { neighbor: 'hug' } } },
            { text: 'Khói dày đặc, bạn lạc hướng mất mấy phút mới mò được ra cửa. Vừa tới đường thì bạn khuỵu xuống.',
              effects: { health: -12, flag: 's_accident_chay', followUp: { id: 's_accident_chay_benh_vien', delay: 0 } },
              scene: { loc: 'street', anim: 'fall', fx: 'smoke', npcAnim: { neighbor: 'scared' } } }
          ] },
        { label: 'Quay vào lấy tiền, giấy tờ, máy tính',
          outcomes: [
            { p: 0.5, text: 'Bạn ôm được túi giấy tờ thì khói đã đặc quánh. Bạn ngã quỵ ở chân cầu thang, lính cứu hỏa phải lao vào đưa ra.',
              effects: { health: -20, flag: 's_accident_chay', followUp: { id: 's_accident_chay_benh_vien', delay: 0 } },
              scene: { anim: 'fall', fx: 'smoke', shot: 'dramatic' } },
            { p: 0.38, text: 'Bạn vơ được túi giấy tờ, lao ra kịp lúc trần nhà bắt đầu sụp. Phổi rát như có lửa, tay còn run bần bật.',
              effects: { health: -8, happy: 1, flag: 's_accident_chay', followUp: { id: 's_accident_chay_sang', delay: 0 } },
              scene: { loc: 'street', anim: 'sick', fx: 'smoke' } },
            { p: 0.12, text: 'Bạn quay vào lấy đồ và không kịp quay ra nữa. Khói độc lấy đi hơi thở của bạn trước khi lính cứu hỏa tới.',
              effects: { die: 'Ngạt khói trong đám cháy' },
              scene: { anim: 'fall', fx: 'smoke', shot: 'wide' } }
          ] },
        { label: 'Đập cửa từng nhà đánh thức hàng xóm',
          outcomes: [
            { p: 0.75, text: 'Bạn vừa chạy vừa đập cửa, kịp đánh thức bà cụ sống một mình và hai đứa nhỏ nhà bên. Ra tới đường, bạn ho sặc sụa, mặt mũi lem luốc khói.',
              effects: { karma: 15, health: -6, happy: 5, flag: ['s_accident_chay', 's_accident_cuu_hang_xom'], followUp: { id: 's_accident_chay_sang', delay: 0 } },
              scene: { loc: 'street', anim: 'sick', fx: 'smoke', npcAnim: { neighbor: 'clap' } } },
            { p: 0.25, text: 'Mọi người thoát ra được hết, nhưng bạn hít quá nhiều khói và ngất ở chiếu nghỉ cầu thang. Lính cứu hỏa cõng bạn ra ngoài.',
              effects: { karma: 15, health: -18, flag: ['s_accident_chay', 's_accident_cuu_hang_xom'], followUp: { id: 's_accident_chay_benh_vien', delay: 0 } },
              scene: { anim: 'fall', fx: 'smoke', shot: 'dramatic' } }
          ] },
        { label: 'Chạy lên sân thượng chờ cứu',
          outcomes: [
            { p: 0.6, text: 'Bạn lên sân thượng, bật đèn điện thoại vẫy liên hồi. Lính cứu hỏa dựng thang đưa bạn xuống an toàn trong tiếng vỗ tay của cả xóm.',
              effects: { health: -4, happy: -2, flag: 's_accident_chay', followUp: { id: 's_accident_chay_sang', delay: 0 } },
              scene: { loc: 'street', anim: 'wave', fx: 'smoke', npcAnim: { neighbor: 'clap' } } },
            { p: 0.4, text: 'Cửa sân thượng khóa trái! Bạn kẹt giữa cầu thang đầy khói hơn mười phút mới được giải cứu.',
              effects: { health: -14, flag: 's_accident_chay', followUp: { id: 's_accident_chay_benh_vien', delay: 0 } },
              scene: { anim: 'sick', fx: 'smoke', shot: 'dramatic' } }
          ] }
      ]
    },
    {
      id: 's_accident_chay_benh_vien', title: 'Ống thở oxy', icon: '😷', age: [13, 99], chainOnly: true,
      text: 'Bạn tỉnh dậy với ống thở oxy trên mũi, cổ họng rát bỏng. Bác sĩ nói phổi bị ngạt khói, cần theo dõi thêm vài ngày. {neighbor.K} {neighbor} mang sang hộp cháo còn nóng, kể cả khu phố đang lo cho bạn.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'sleep', expr: 'sick',
        npcs: [{ role: 'doctor', anim: 'talk', say: 'Phổi ngạt khói, phải theo dõi thêm.' }, { role: 'neighbor', anim: 'talk', say: 'Ăn chút cháo cho lại sức đi.' }], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Nghe lời bác sĩ, nằm lại theo dõi',
          text: 'Bạn nằm viện năm ngày, uống thuốc, tập thở. Ra viện, phổi đã nhẹ hẳn, giọng nói cũng trong trở lại.',
          effects: { money: -4000000, health: 8, happy: 2, followUp: { id: 's_accident_chay_sang', delay: 0 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { doctor: 'nod' } } },
        { label: 'Đòi về sớm để lo nhà cửa',
          text: 'Bạn ký giấy xin về sớm. Mấy tuần sau vẫn ho khù khụ, đêm nằm khò khè không ngủ được.',
          effects: { money: -1000000, health: -5, happy: -2, illness: 'Viêm phổi', followUp: { id: 's_accident_chay_sang', delay: 0 } },
          scene: { anim: 'sick', fx: 'sick', npcAnim: { doctor: 'shake' } } }
      ]
    },
    {
      id: 's_accident_chay_sang', title: 'Sau đám cháy', icon: '🧯', age: [13, 99], chainOnly: true,
      text: 'Khi khói đã tan, căn nhà ám đen kịt, nước chữa cháy lênh láng khắp sàn. Lính cứu hỏa kết luận: chập điện từ một ổ cắm cũ. Cả khu phố đứng lặng nhìn, người mất đồ đạc, người mất cả chỗ ở.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'neighbor', anim: 'sad' }, { role: 'crowd', anim: 'sad' }], fx: 'smoke', shot: 'wide' },
      choices: [
        { label: 'Cùng hàng xóm dọn dẹp, góp tiền giúp nhà mất trắng',
          text: 'Bạn xắn tay áo dọn dẹp cùng cả xóm, góp thêm {money:3000000} cho gia đình mất trắng. Mất mát nhiều, nhưng tình làng nghĩa xóm thì đầy thêm.',
          effects: { money: -8000000, karma: 8, happy: 3 },
          scene: { anim: 'walk', fx: 'dust', npcAnim: { neighbor: 'hug', crowd: 'walk' } } },
        { label: 'Lắp báo khói, sắm bình chữa cháy, tập thoát hiểm',
          text: 'Bạn sửa lại hệ thống điện, lắp đầu báo khói, mua bình chữa cháy, dán sơ đồ thoát hiểm sau cửa. Cả nhà tập thoát hiểm như chơi một trò chơi.',
          effects: { money: -7000000, smarts: 4, happy: 2, health: 1, flag: 's_accident_pccc' },
          scene: { anim: 'point', fx: 'idea', npcAnim: { neighbor: 'nod' } } },
        { label: 'Ngồi thẫn thờ giữa đống tro',
          text: 'Bạn ngồi thẫn thờ cả buổi trên bậc thềm cháy xém. Đồ đạc có thể mua lại, nhưng cảm giác an toàn thì rất lâu mới quay về.',
          effects: { money: -5000000, happy: -8, health: -1 },
          scene: { anim: 'sit', expr: 'sad', fx: 'tears', npcAnim: { neighbor: 'hug' } } }
      ]
    },
    {
      id: 's_accident_ba_cu_tra_on', title: 'Cặp bánh chưng trả ơn', icon: '🧧', age: [14, 95], weight: 1.5,
      req: { since: { s_accident_cuu_hang_xom: 1 } },
      text: 'Tết năm ấy, bà cụ hàng xóm mà bạn đập cửa đánh thức trong đêm cháy lụi cụi mang sang một cặp bánh chưng tự gói, lạt buộc còn xanh. Bà nói: “Không có con, giờ này bà đã nằm ngoài nghĩa địa rồi.”',
      scene: { loc: 'home', time: 'day', weather: 'clear', decor: 'tet', anim: 'bow', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'f', age: 78, anim: 'talk', say: 'Bà gói cho con đấy, ăn Tết cho vui.' }], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Mời bà ở lại ăn bữa cơm Tết',
          text: 'Bà ngồi lại, kể chuyện ngày xưa đến tận chiều. Từ đó, nhà bạn có thêm một người bà.',
          effects: { happy: 8, karma: 5 },
          scene: { anim: 'eat', fx: 'hearts', npcAnim: { stranger: 'eat' } } },
        { label: 'Lì xì lại cho bà',
          text: 'Bạn dúi vào tay bà phong bao lì xì đỏ. Bà cười móm mém, mắt rưng rưng: “Lớn tướng rồi còn lì xì bà.”',
          effects: { money: -500000, happy: 6, karma: 4 },
          scene: { anim: 'hug', fx: 'petals', npcAnim: { stranger: 'laugh' } } }
      ]
    },

    // ======================= ARC 6: LÀM VIỆC QUÁ SỨC =======================
    {
      id: 's_accident_thuc_trang', title: 'Đêm trắng thứ ba', icon: '☕', age: [28, 58], weight: 1.0,
      req: { job: 'any', notFlag: 's_accident_qua_suc' },
      text: 'Ba đêm liền bạn ngủ chưa tới ba tiếng để kịp dự án. Ly cà phê thứ năm trong ngày đã nguội ngắt, ngực thỉnh thoảng nhói lên, mí mắt giật liên hồi. {boss.K} nhắn: “Sáng mai 8 giờ phải có bản cuối nhé.”',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'sleepy',
        npcs: [{ role: 'coworker', anim: 'sit', expr: 'sleepy' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Uống thêm lon tăng lực, cày tới sáng',
          outcomes: [
            { p: 0.7, text: 'Bạn nộp bản cuối lúc 7 giờ 58 phút. Sếp khen nức nở, thưởng nóng {money:5000000}. Bạn gục xuống bàn ngủ một mạch tới trưa.',
              effects: { money: 5000000, health: -8, happy: 3, flag: 's_accident_qua_suc', followUp: { id: 's_accident_choang', delay: 1 } },
              scene: { anim: 'sit', expr: 'sleepy', fx: 'zzz' } },
            { p: 0.3, text: 'Bốn giờ sáng, tay bạn tê dại, màn hình nhòe đi thành những vệt sáng. Bạn gục xuống bàn phím lúc nào không hay.',
              effects: { health: -12, flag: 's_accident_qua_suc', followUp: { id: 's_accident_choang', delay: 0 } },
              scene: { anim: 'fall', fx: 'stars', shot: 'dramatic', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Xin lùi hạn, về ngủ một giấc',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Sếp càu nhàu nhưng đồng ý lùi một ngày. Ngủ đủ tám tiếng, bạn làm xong trong buổi sáng, chất lượng còn tốt hơn hẳn.',
              effects: { health: 5, happy: 4, smarts: 1 },
              scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } },
            { text: 'Sếp gắt: “Không làm được thì để người khác làm!” Bạn mất điểm trong mắt sếp, nhưng ít ra cơ thể được nghỉ một đêm.',
              effects: { health: 4, happy: -4 },
              scene: { anim: 'sad', fx: 'anger' } }
          ] },
        { label: 'Chia bớt việc cho {coworker}',
          text: '{coworker} nhận một nửa phần việc, hai người làm tới nửa đêm rồi cùng về. Dự án kịp hạn, còn bạn có thêm một người đồng đội.',
          effects: { health: 2, happy: 3, karma: 1 },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { coworker: 'nod' } } }
      ]
    },
    {
      id: 's_accident_choang', title: 'Cơn choáng giữa cuộc họp', icon: '😵', age: [28, 65], chainOnly: true,
      req: { job: true },
      text: 'Đang thuyết trình, mắt bạn bỗng tối sầm, nửa người tê rần, nói không ra tiếng. Bạn được đưa đi cấp cứu. Bác sĩ cầm phim chụp não, giọng nghiêm: “Thiếu máu não thoáng qua. Đây là lời cảnh báo, lần sau có thể là đột quỵ thật.”',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'sick', expr: 'scared',
        npcs: [{ role: 'doctor', anim: 'talk', say: 'Đây là lời cảnh báo, đừng coi thường.' }, { role: 'coworker', anim: 'sad' }], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Nghe lời, thay đổi lối sống',
          text: 'Bạn tập ngủ trước 11 giờ, đi bộ mỗi sáng, tắt thông báo công việc sau 8 giờ tối. Mấy tháng đầu bứt rứt, rồi quen dần.',
          effects: { health: 10, happy: 4, unflag: 's_accident_qua_suc', flag: 's_accident_song_cham', followUp: { id: 's_accident_song_moi', delay: 2 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { doctor: 'nod' } } },
        { label: 'Xin xuất viện, quay lại làm ngay',
          text: 'Hôm sau bạn đã ngồi lại bàn làm việc, giấu tờ giấy ra viện trong ngăn kéo. Dự án kịp hạn, thưởng {money:3000000}, còn lời bác sĩ thì trôi đi như gió thoảng.',
          effects: { money: 3000000, health: -6, flag: 's_accident_lo_canh_bao', followUp: { id: 's_accident_dot_quy', delay: 2 } },
          scene: { loc: 'office', anim: 'type', fx: 'sweat', npcAnim: { coworker: 'shake' } } },
        { label: 'Nghỉ việc, tìm nhịp sống nhẹ hơn',
          text: 'Bạn nộp đơn nghỉ việc ngay trên giường bệnh. Thu nhập rồi sẽ thấp hơn, nhưng lần đầu sau nhiều năm, bạn ngủ một giấc không mộng mị.',
          effects: { job: 'fire', happy: 6, health: 8, flag: 's_accident_song_cham', followUp: { id: 's_accident_song_moi', delay: 2 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { coworker: 'wave' } } }
      ]
    },
    {
      id: 's_accident_dot_quy', title: 'Ba giờ sáng', icon: '🚨', age: [30, 70], chainOnly: true,
      req: { flag: 's_accident_lo_canh_bao', job: 'any' },
      text: 'Hai năm sau lần choáng ấy, bạn vẫn ôm việc tới khuya. Ba giờ sáng, cánh tay phải bỗng nặng trĩu, miệng méo xệch, chữ trên màn hình nhảy múa. Một giọng nói trong đầu bảo: “Cố nốt chút nữa thôi...”',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'sick', expr: 'scared', fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Gọi cấp cứu 115 ngay lập tức',
          outcomes: [
            { p: 0.8, text: 'Xe cấp cứu tới trong mười lăm phút, kịp “giờ vàng”. Bạn qua khỏi, chỉ còn yếu tay phải, phải tập vật lý trị liệu nửa năm trời.',
              effects: { health: -15, happy: -5, money: -30000000, illness: 'Di chứng đột quỵ', unflag: 's_accident_lo_canh_bao', flag: 's_accident_song_cham' },
              scene: { loc: 'hospital', time: 'day', anim: 'sick', fx: 'sick' } },
            { p: 0.2, text: 'Bạn qua khỏi, nhưng nói còn ngọng, tay chân yếu hẳn, phải nghỉ việc dài hạn để phục hồi.',
              effects: { health: -22, happy: -10, money: -50000000, illness: 'Di chứng đột quỵ', job: 'fire', unflag: 's_accident_lo_canh_bao', flag: 's_accident_song_cham' },
              scene: { loc: 'hospital', time: 'day', anim: 'sleep', fx: 'tears' } }
          ] },
        { label: 'Cố làm nốt rồi mới đi khám',
          outcomes: [
            { p: 0.8, text: 'Bạn gục xuống bàn phím. Sáng ra bảo vệ phát hiện, đưa đi cấp cứu. Bạn giữ được mạng sống, nhưng nửa người yếu hẳn, phải ngồi xe lăn một thời gian dài.',
              effects: { health: -30, happy: -15, money: -60000000, illness: 'Di chứng đột quỵ', job: 'fire', unflag: 's_accident_lo_canh_bao', flag: 's_accident_song_cham' },
              scene: { loc: 'hospital', time: 'day', anim: 'sleep', fx: 'tears' } },
            { p: 0.2, text: 'Màn hình vẫn sáng đến tận sáng hôm sau. Đồng nghiệp tìm thấy bạn gục bên bàn làm việc, bản báo cáo còn dang dở.',
              effects: { die: 'Đột quỵ do làm việc quá sức' },
              scene: { anim: 'fall', fx: 'tears', shot: 'wide' } }
          ] }
      ]
    },
    {
      id: 's_accident_song_moi', title: 'Nhịp sống chậm', icon: '🚶', age: [30, 70], chainOnly: true,
      req: { flag: 's_accident_song_cham' },
      text: 'Hai năm sau cơn choáng ấy, bạn dậy lúc năm giờ sáng đi bộ quanh hồ, mười giờ tối đã tắt máy tính. Lạ thay, cuộc sống vẫn chạy đều, còn bạn thì khỏe ra trông thấy, da dẻ hồng hào.',
      scene: { loc: 'park', time: 'dawn', weather: 'clear', anim: 'walk', expr: 'happy', fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Rủ đồng nghiệp cũ đi bộ cùng',
          text: 'Hội đi bộ năm giờ sáng từ một người thành năm người. Ai cũng bảo nhìn bạn trẻ ra cả chục tuổi.',
          effects: { health: 6, happy: 5 },
          scene: { anim: 'wave', fx: 'stars' } },
        { label: 'Viết bài “Đừng đợi cơ thể lên tiếng”',
          text: 'Bài viết của bạn được chia sẻ khắp các nhóm dân văn phòng. Có người nhắn: “Đọc xong em xin nghỉ phép ngay.”',
          effects: { karma: 5, happy: 4, smarts: 2 },
          scene: { anim: 'type', fx: 'hearts' } },
        { label: 'Đi khám sức khỏe tổng quát',
          text: 'Kết quả khám đẹp như sách giáo khoa. Bác sĩ cười: “Cứ giữ nhịp này là sống thọ.”',
          effects: { money: -2000000, health: 8, happy: 3 },
          scene: { loc: 'hospital', time: 'day', anim: 'cheer', fx: 'levelup' } }
      ]
    },

    // ======================= RƯỢU GIẢ (2 chương) =======================
    {
      id: 's_accident_ruou_gia', title: 'Can rượu nhà nấu', icon: '🍶', age: [20, 75], weight: 0.8,
      text: 'Đám cưới ở quê, {relative.k} họ xách ra can rượu trắng “nhà nấu, chuẩn men lá”. Rượu cay xè, thoảng mùi hơi lạ, ai uống xong cũng khen “êm”. Bàn bên đã có người gục xuống, mặt tái mét.',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'relative', gender: 'm', age: 56, anim: 'drink', say: 'Rượu nhà nấu, chuẩn men lá đây!' }, { role: 'crowd', anim: 'drink' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Uống cho vui, “trăm phần trăm”',
          outcomes: [
            { p: 0.5, text: 'Bạn đau đầu như búa bổ cả ngày hôm sau, nằm bẹp một chỗ, nhưng rồi cũng qua.',
              effects: { health: -3, happy: 1 },
              scene: { anim: 'sick', fx: 'stars' } },
            { p: 0.5, text: 'Nửa đêm, bạn nôn thốc nôn tháo, mắt mờ đi, tay chân lạnh ngắt. Người nhà vội chở bạn lên bệnh viện huyện.',
              effects: { health: -18, happy: -6, followUp: { id: 's_accident_ngo_doc', delay: 0 } },
              scene: { time: 'night', anim: 'sick', fx: 'sick', shot: 'dramatic' } }
          ] },
        { label: 'Khéo léo từ chối, xin ly trà đá',
          text: '{relative.K} hơi phật ý. Nhưng sáng hôm sau nghe tin bàn bên phải đi cấp cứu, {relative.k} chỉ biết lặng im.',
          effects: { health: 2, happy: 1, smarts: 2 },
          scene: { anim: 'drink', fx: 'idea', npcAnim: { relative: 'shrug' } } },
        { label: 'Thấy người gục, gọi cấp cứu ngay',
          text: 'Bạn gọi 115, đặt người bị gục nằm nghiêng, giữ ấm. Bác sĩ nói nhờ đưa đi sớm mà người ấy qua khỏi, cả mâm cũng được kiểm tra kịp thời.',
          effects: { karma: 10, happy: 4, smarts: 1 },
          scene: { anim: 'phone', fx: 'exclaim', npcAnim: { crowd: 'scared' } } }
      ]
    },
    {
      id: 's_accident_ngo_doc', title: 'Ngộ độc rượu', icon: '🧪', age: [20, 80], chainOnly: true,
      text: 'Bác sĩ cầm kết quả xét nghiệm: “Rượu pha cồn công nghiệp. Cả đám cưới có năm người nhập viện.” Bạn phải lọc máu hai ngày, mắt vẫn còn nhìn mờ mờ. {relative.K} ngồi ngoài hành lang, vò đầu bứt tai.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'sick', expr: 'sick',
        npcs: [{ role: 'doctor', anim: 'talk', say: 'Rượu pha cồn công nghiệp đấy.' }, { role: 'relative', anim: 'facepalm' }], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Báo công an điều tra lò rượu',
          text: 'Công an lần ra một lò rượu pha cồn ở xã bên, tiêu hủy hàng nghìn lít. Viện phí hết {money:6000000}, nhưng bạn biết mình vừa cứu được nhiều người khác.',
          effects: { money: -6000000, karma: 6, health: 3, happy: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { doctor: 'nod' } } },
        { label: 'Thề bỏ hẳn rượu',
          text: 'Nằm viện một tuần, bạn thề không đụng giọt rượu nào nữa. Từ đó mâm nào bạn cũng chỉ uống trà, mà vui vẫn hoàn vui.',
          effects: { money: -6000000, health: 6, happy: 1, flag: 's_accident_bo_ruou' },
          scene: { anim: 'think', fx: 'idea', npcAnim: { relative: 'nod' } } },
        { label: 'Đòi {relative.k} trả viện phí',
          outcomes: [
            { p: 0.5, text: '{relative.K} ngượng chín mặt, bán cả con lợn trả viện phí cho bạn.',
              effects: { money: -1000000, karma: -2, happy: 1 },
              scene: { anim: 'point', fx: 'money', npcAnim: { relative: 'bow' } } },
            { p: 0.5, text: 'Hai bên to tiếng ngay giữa hành lang bệnh viện. Cả họ xì xào, Tết năm ấy chẳng ai nói với ai câu nào.',
              effects: { money: -6000000, happy: -6, karma: -2 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { relative: 'angry' } } }
          ] }
      ]
    },

    // ======================= STANDALONE / SUÝT NỮA =======================
    {
      id: 's_accident_cho_can', title: 'Cú đớp bất ngờ', icon: '🐕', age: [13, 85], weight: 0.9,
      text: 'Đi bộ qua đầu hẻm, con chó vàng nhà ai sổng xích lao ra đớp một phát vào bắp chân bạn rồi chạy biến. Vết răng rớm máu. Chủ nhà chạy ra phân bua: “Chó nhà tôi hiền lắm, chỉ chưa tiêm phòng thôi!”',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'neighbor', anim: 'talk', say: 'Nó hiền lắm, chỉ chưa tiêm phòng thôi!' }, { role: 'stranger', kind: 'dog', anim: 'run' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Rửa vết thương bằng xà phòng, đi tiêm phòng dại ngay',
          text: 'Bạn xả vết thương dưới vòi nước với xà phòng mười lăm phút rồi đi tiêm đủ năm mũi, hết {money:1500000}. Bác sĩ khen: “Làm đúng từng bước luôn!”',
          effects: { money: -1500000, health: -2, smarts: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { neighbor: 'bow' } } },
        { label: 'Đắp lá thuốc nam theo lời mách',
          outcomes: [
            { p: 0.75, text: 'Vết thương lành, nhưng suốt ba tháng bạn mất ngủ vì đọc tin trên mạng. Cuối cùng vẫn phải đi tiêm, còn bị bác sĩ mắng cho một trận.',
              effects: { money: -1500000, happy: -6, health: -2 },
              scene: { anim: 'facepalm', fx: 'sweat' } },
            { p: 0.25, text: 'Vết cắn sưng tấy nhiễm trùng, bạn phải nằm viện một tuần, tiêm cả kháng sinh lẫn vắc xin. Bác sĩ lắc đầu: “Chậm chút nữa là không kịp đâu.”',
              effects: { health: -10, money: -5000000, happy: -5, smarts: 1 },
              scene: { loc: 'hospital', anim: 'sick', fx: 'sick' } }
          ] },
        { label: 'Bắt chủ chó chịu tiền tiêm',
          outcomes: [
            { p: 0.6, text: 'Chủ nhà ngượng, trả đủ tiền tiêm, còn hứa từ nay xích chó cẩn thận. Bạn đi tiêm ngay trong chiều.',
              effects: { health: -2, happy: 2 },
              scene: { anim: 'point', fx: 'money', npcAnim: { neighbor: 'bow' } } },
            { p: 0.4, text: 'Hai bên cãi nhau một trận, chủ nhà khăng khăng “chó tôi chưa cắn ai bao giờ”. Bạn bực bội tự đi tiêm.',
              effects: { money: -1500000, health: -2, happy: -4 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { neighbor: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_accident_cong_truong', title: 'Giàn giáo tầng năm', icon: '🏗️', age: [18, 60], weight: 1.4,
      req: { jobId: ['congnhan', 'kysu'] },
      text: 'Công trình chạy tiến độ, {boss.k} hối thúc lên giàn giáo tầng năm gia cố cốp pha. Dây đai an toàn thì thiếu, móc vào móc ra mất thời gian. {coworker} đã leo lên, ngoái xuống gọi: “Nhanh lên, đứng đó làm gì!”',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'coworker', anim: 'point', say: 'Nhanh lên, đứng đó làm gì!' }, { role: 'boss', anim: 'angry', say: 'Chiều nay phải xong tầng này!' }], fx: 'sweat', shot: 'low' },
      choices: [
        { label: 'Đi mượn bằng được dây an toàn rồi mới leo',
          text: 'Mất mười lăm phút đi mượn dây, bị sếp cằn nhằn. Chiều đó gió giật mạnh, bạn trượt chân, và chính sợi dây ấy giữ bạn lơ lửng giữa không trung.',
          effects: { karma: 2, happy: 2, health: -1, smarts: 2 },
          scene: { anim: 'scared', fx: 'exclaim', npcAnim: { coworker: 'scared', boss: 'facepalm' } } },
        { label: 'Leo luôn cho kịp tiến độ',
          outcomes: [
            { p: 0.6, text: 'Bạn leo thoăn thoắt, làm xong trước giờ. Sếp thưởng nóng {money:500000}. Tối về nghĩ lại, chân bạn vẫn còn bủn rủn.',
              effects: { money: 500000, happy: 2, karma: -1 },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { boss: 'nod' } } },
            { p: 0.32, text: 'Một tấm ván mục gãy đôi, bạn rơi xuống sàn tầng dưới, gãy tay, rạn xương sườn. Công trình phải dừng thi công nửa ngày.',
              effects: { health: -25, happy: -10, money: -8000000, illness: 'Gãy tay' },
              scene: { loc: 'hospital', anim: 'sick', fx: 'stars' } },
            { p: 0.08, text: 'Bạn trượt chân từ giàn giáo tầng năm. Công trình dừng thi công ba ngày, đồng nghiệp lặng lẽ thắp nén nhang tiễn bạn.',
              effects: { die: 'Tai nạn lao động' },
              scene: { anim: 'fall', fx: 'tears', shot: 'wide', npcAnim: { coworker: 'cry' } } }
          ] },
        { label: 'Báo cáo công trình thiếu đồ bảo hộ',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Ban chỉ huy công trình phát đủ dây đai, mũ bảo hộ cho cả đội, còn khen bạn có trách nhiệm. Lương tháng sau nhích lên một chút.',
              effects: { karma: 6, happy: 4, job: 'raise' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'nod', coworker: 'clap' } } },
            { text: 'Sếp gạch tên bạn khỏi đội vì “lắm chuyện”. Tuần sau thanh tra lao động xuống kiểm tra, cả công trình bị phạt nặng.',
              effects: { karma: 4, happy: -6, job: 'fire' },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_accident_lu_cuon', title: 'Ngầm tràn mùa lũ', icon: '⛈️', age: [13, 85], weight: 0.3,
      text: 'Mưa lũ ba ngày liền, con ngầm tràn trên đường về nhà nước đã ngập ngang đầu gối, chảy xiết đục ngầu. Bên kia là nhà, bên này mấy người đang đứng chờ, có anh còn dắt xe máy định lội qua.',
      scene: { loc: 'countryside', time: 'dusk', weather: 'storm', anim: 'think', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Không ai được qua ngầm lúc này!' }, { role: 'stranger', gender: 'm', age: 30, anim: 'walk', say: 'Nước thế này lội qua được mà!' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Nghe lời chốt chặn, chờ nước rút',
          text: 'Bạn ngủ tạm ở nhà văn hóa xã một đêm, ăn mì gói cùng bà con. Sáng ra nước rút, bạn về nhà an toàn.',
          effects: { happy: -2, health: -1, karma: 2, smarts: 2 },
          scene: { anim: 'sit', fx: 'zzz', npcAnim: { police: 'nod' } } },
        { label: 'Lội qua, cố bám cho chắc',
          outcomes: [
            { p: 0.45, text: 'Nước xiết suýt cuốn bạn đi, may bám được cọc tiêu, lết qua được bên kia, run cầm cập.',
              effects: { health: -6, happy: -4, karma: -1 },
              scene: { anim: 'swim', fx: 'sweat', npcAnim: { police: 'angry' } } },
            { p: 0.43, text: 'Dòng nước quật ngã bạn, cuốn đi cả chục mét. Bạn bám được bụi tre ven suối, lực lượng cứu hộ phải quăng dây kéo vào bờ.',
              effects: { health: -18, happy: -10, illness: 'Viêm phổi' },
              scene: { anim: 'swim', expr: 'scared', fx: 'exclaim', shot: 'dramatic', npcAnim: { police: 'run' } } },
            { p: 0.12, text: 'Dòng lũ đục ngầu cuốn bạn đi trong tích tắc. Lực lượng cứu hộ tìm kiếm suốt nhiều ngày dọc con suối.',
              effects: { die: 'Lũ cuốn trôi' },
              scene: { anim: 'swim', fx: 'tears', shot: 'wide', npcAnim: { police: 'scared' } } }
          ] },
        { label: 'Can ngăn anh kia đừng lội',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Anh ta cằn nhằn nhưng dừng lại. Mười phút sau, một thân cây lớn trôi ầm qua đúng chỗ anh định lội. Hai người nhìn nhau, không nói nên lời.',
              effects: { karma: 8, happy: 4 },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { stranger: 'scared' } } },
            { text: 'Anh ta gạt tay bạn ra rồi lội, trượt ngã ngay giữa ngầm. May lực lượng chốt chặn quăng dây kéo lại kịp.',
              effects: { karma: 4, happy: -2 },
              scene: { anim: 'scared', fx: 'sweat', npcAnim: { stranger: 'swim', police: 'run' } } }
          ] }
      ]
    },
    {
      id: 's_accident_suyt_xe_tai', title: 'Một giây định mệnh', icon: '🚚', age: [13, 85], weight: 0.8, once: false, cooldown: 4,
      text: 'Bạn vừa sang đường vừa cắm mặt vào điện thoại. Tiếng còi hơi rú lên chát chúa, một chiếc xe tải phanh rít ngay trước mặt. Một bàn tay lạ giật mạnh bạn lùi lại đúng lúc.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'stranger', anim: 'point', say: 'Đi đường mà nhìn điện thoại à!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Rối rít cảm ơn người lạ',
          text: 'Người ấy chỉ phẩy tay: “Lần sau nhìn đường nhé.” rồi đi mất. Bạn đứng run một lúc lâu, thầm cảm ơn ông trời và người lạ tốt bụng.',
          effects: { karma: 3, happy: 3, smarts: 1 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'wave' } } },
        { label: 'Cất điện thoại, từ nay không vừa đi vừa xem',
          text: 'Bạn cất điện thoại vào túi và giữ thói quen ấy mãi về sau. Tin nhắn nào cũng chờ được, mạng sống thì không.',
          effects: { smarts: 3, health: 1, happy: 1 },
          scene: { anim: 'nod', fx: 'idea', npcAnim: { stranger: 'nod' } } },
        { label: 'Quay ra cự tài xế',
          text: 'Bạn chỉ tay mắng tài xế. Ông ta thò đầu ra, chỉ vào cột đèn đỏ dành cho người đi bộ. Đám đông quay sang nhìn, bạn chỉ muốn độn thổ.',
          effects: { karma: -2, happy: -3 },
          scene: { anim: 'point', expr: 'angry', fx: 'anger', npcAnim: { stranger: 'facepalm' } } }
      ]
    },
    {
      id: 's_accident_ro_ga', title: 'Mùi gas trong bếp', icon: '⛽', age: [18, 90], weight: 0.8,
      text: 'Vừa về tới nhà, mở cửa ra đã nghe mùi gas nồng nặc. Bình gas trong bếp kêu xì xì nho nhỏ. Tay bạn theo thói quen đang với lên công tắc đèn.',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'scared', expr: 'surprised', fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Không bật đèn, mở cửa, khóa van, ra ngoài gọi thợ',
          text: 'Bạn rụt tay khỏi công tắc như phải bỏng, mở hết cửa, khóa van bình rồi ra ngoài gọi thợ. Thợ tới thay ống dẫn, lắc đầu: “Chỉ một tia lửa thôi là cả nhà bay.”',
          effects: { smarts: 4, happy: 3, money: -300000 },
          scene: { loc: 'street', anim: 'phone', fx: 'idea' } },
        { label: 'Bật đèn cho dễ nhìn',
          outcomes: [
            { p: 0.7, text: 'Đèn bật sáng, không có gì xảy ra. Tối đó đọc tin về một vụ nổ gas tương tự, bạn rùng mình mãi.',
              effects: { happy: -2, smarts: 2 },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.3, text: 'Một tiếng “bụp” nhỏ, ngọn lửa xanh bùng lên rồi tắt. Lông mày bạn cháy xém, tay phỏng nhẹ, tim suýt rớt ra ngoài.',
              effects: { health: -10, looks: -3, happy: -6 },
              scene: { anim: 'fall', fx: 'flash', shot: 'dramatic' } }
          ] },
        { label: 'Tự tháo van ra kiểm tra',
          outcomes: [
            { p: 0.6, text: 'Bạn khóa van, quét nước xà phòng lên ống thấy sủi bọt ngay chỗ nối, bèn thay ống mới. Gọn gàng như thợ chuyên nghiệp.',
              effects: { smarts: 3, happy: 2, money: -150000 },
              scene: { anim: 'nod', fx: 'bubbles' } },
            { p: 0.4, text: 'Bạn vặn nhầm chiều, gas xì ra mạnh hơn. Bạn hoảng hốt chạy ra ngoài gọi cứu hỏa, cả xóm được một phen náo loạn.',
              effects: { happy: -5, money: -500000, karma: -1 },
              scene: { loc: 'street', anim: 'run', fx: 'exclaim' } }
          ] }
      ]
    }
  );
})();
