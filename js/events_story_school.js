/* Một Kiếp Người — ngoại truyện: học đường (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: BỊ BẮT NẠT Ở TRƯỜNG CẤP 2 =======================
    // Ghi chú: classmate đầu tiên trong scene = {classmate} (bạn mới chuyển trường, người sẽ đứng ra bảo vệ);
    // các classmate tiếp theo = bộ ba “Tam Hổ” (không gọi tên riêng).
    {
      id: 's_school_bn_nha_xe', title: 'Phí bảo kê ở nhà xe', icon: '🚲', age: [11, 14], weight: 1.3,
      req: { school: true, eduLevel: ['secondary'], notFlag: 's_school_batnat' },
      text: 'Tan học, bộ ba “Tam Hổ” lớp trên chặn bạn ở góc nhà xe, giật cặp đổ hết sách vở xuống đất rồi tuyên bố: từ mai mỗi ngày nộp {money:20000} “phí giữ xe”, không thì xe xì lốp. Cuối dãy xe, {classmate} — đứa mới chuyển đến lớp bạn, cao nhòng và ít nói nhất trường — đứng lặng nhìn, tay siết chặt quai cặp.',
      scene: { loc: 'school', time: 'dusk', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [
          { role: 'classmate', anim: 'idle', expr: 'neutral' },
          { role: 'classmate', gender: 'm', anim: 'point', expr: 'angry', say: 'Mỗi ngày hai chục, nghe chưa?' },
          { role: 'classmate', gender: 'm', anim: 'laugh', expr: 'happy', say: 'Không nộp thì xe xẹp lốp nha!' }
        ], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Ngoan ngoãn nộp tiền cho yên chuyện',
          text: 'Bạn nhịn ăn sáng suốt hai tuần để có tiền “nộp phí”. Bụng réo ầm ĩ trong giờ Toán, còn “Tam Hổ” thì mỗi ngày lại đòi nhiều hơn một chút.',
          effects: { money: -200000, happy: -7, health: -2, flag: ['s_school_batnat', 's_school_bn_nhin'], followUp: { id: 's_school_bn_clip', delay: 0 } },
          scene: { anim: 'sad', expr: 'sad', fx: 'sweat' } },
        { label: 'Cãi lại: “Không có tiền! Mách thầy bây giờ!”',
          outcomes: [
            { p: 0.5, text: 'Sáng hôm sau, xe bạn xẹp cả hai bánh, yên xe bị rạch một đường dài. Bạn dắt bộ ba cây số về nhà, nước mắt hòa mồ hôi.',
              effects: { happy: -6, money: -60000, flag: 's_school_batnat', followUp: { id: 's_school_bn_clip', delay: 0 } },
              scene: { anim: 'cry', expr: 'sad', fx: 'tears' } },
            { p: 0.5, text: 'Đúng lúc đó bác bảo vệ cầm dùi cui đi ngang, “Tam Hổ” giải tán như chưa có gì. Nhưng trước khi đi, tên cầm đầu ghé tai bạn: “Mai tính tiếp.”',
              effects: { happy: -3, karma: 2, flag: 's_school_batnat', followUp: { id: 's_school_bn_clip', delay: 0 } },
              scene: { anim: 'scared', fx: 'exclaim' } }
          ] },
        { label: 'Liều mình đẩy tên cầm đầu ra',
          success: { stat: 'health', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Tên cầm đầu loạng choạng, ngã ngồi vào hàng xe đạp, cả dãy xe đổ rầm rầm như domino. Đám đông cười ồ. Hắn đứng dậy, mặt đỏ gay: “Mày nhớ đấy!”',
              effects: { happy: 4, health: -1, flag: ['s_school_batnat', 's_school_bn_phan_khang'], followUp: { id: 's_school_bn_clip', delay: 0 } },
              scene: { anim: 'angry', expr: 'angry', fx: 'dust', npcExpr: { classmate: 'surprised' } } },
            { text: 'Bạn chưa kịp chạm vào áo hắn thì đã ăn một cú đấm vào mắt. Về nhà, bạn bảo “con va vào cửa”, nhưng con mắt tím bầm thì không biết nói dối.',
              effects: { health: -7, happy: -6, flag: ['s_school_batnat', 's_school_bn_phan_khang'], followUp: { id: 's_school_bn_clip', delay: 0 } },
              scene: { anim: 'fall', expr: 'sad', fx: 'stars' } }
          ] },
        { label: 'Pha trò: “Em chỉ có thẻ Pokémon thôi anh ơi”',
          outcomes: [
            { p: 0.4, text: 'Tên cầm đầu lật xấp thẻ, thấy lá Pikachu hiếm thì mắt sáng rỡ. Hắn cầm lấy, vỗ vai bạn: “Đứa này được.” Từ đó “Tam Hổ” để bạn yên — đổi lại bộ sưu tập thẻ mất một nửa.',
              effects: { happy: -1, flag: 's_school_batnat' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { classmate: 'laugh' } } },
            { p: 0.6, text: '“Tam Hổ” lấy luôn xấp thẻ, rồi vẫn đòi tiền như thường. Câu đùa của bạn còn bị chúng nhại lại suốt cả tuần trong giờ ra chơi.',
              effects: { happy: -5, flag: 's_school_batnat', followUp: { id: 's_school_bn_clip', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'question', npcAnim: { classmate: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_school_bn_clip', title: 'Đoạn clip trong nhóm Zalo khối', icon: '📹', age: [11, 15], chainOnly: true,
      text: 'Hai tuần sau, “Tam Hổ” úp sọt rác lên đầu bạn giữa giờ ra chơi, quay clip đăng TikTok kèm dòng chữ “Tiết mục hài của năm 🤣”. Clip lan khắp nhóm Zalo của khối, đi qua hành lang đâu cũng nghe tiếng cười khúc khích. Bạn đứng chết lặng ở cầu thang, chỉ muốn biến mất khỏi ngôi trường này.',
      scene: { loc: 'school', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [
          { role: 'classmate', anim: 'idle', expr: 'sad' },
          { role: 'classmate', anim: 'phone', expr: 'happy', say: 'Lên xu hướng rồi nha!' },
          { role: 'classmate', anim: 'laugh', expr: 'happy' },
          { role: 'crowd', anim: 'laugh' }
        ], fx: 'flash', shot: 'wide' },
      choices: [
        { label: 'Gọi điện cho bố mẹ ngay giữa giờ ra chơi',
          text: 'Bạn vừa nói vừa nấc. Nửa tiếng sau, bố mẹ phóng xe máy đến trường, cầm theo điện thoại có đoạn clip, đi thẳng lên phòng thầy hiệu trưởng.',
          effects: { happy: 3, rel: { mother: 8, father: 8 }, flag: 's_school_bn_bao', followUp: { id: 's_school_bn_ky_luat', delay: 0 } },
          scene: { anim: 'phone', expr: 'sad', fx: 'tears' } },
        { label: 'Gửi link clip cho cô chủ nhiệm qua Zalo',
          outcomes: [
            { p: 0.6, text: 'Năm phút sau cô gọi lại, giọng run lên vì giận: “Em yên tâm, chuyện này cô không để yên đâu.” Chiều đó, cả ba đứa bị gọi lên phòng hội đồng.',
              effects: { happy: 4, flag: 's_school_bn_bao', followUp: { id: 's_school_bn_ky_luat', delay: 0 } },
              scene: { anim: 'phone', expr: 'surprised', fx: 'exclaim' } },
            { p: 0.4, text: 'Tin nhắn hiện “Đã xem” từ trưa đến tối. Mãi 10 giờ đêm cô mới trả lời: “Cô sẽ nhắc nhở các bạn.” Hôm sau chẳng có gì thay đổi. Giờ ra chơi, bạn lặng lẽ trốn lên thư viện.',
              effects: { happy: -5, followUp: { id: 's_school_bn_ban_cuoi', delay: 0 } },
              scene: { anim: 'sad', fx: 'question' } }
          ] },
        { label: 'Tự xử: hẹn “Tam Hổ” ra sau trường',
          text: 'Bạn nhắn thẳng vào tài khoản đã đăng clip: “Chiều thứ Sáu, sau nhà thể chất. Ra mà nói chuyện.” Gửi xong, tay bạn run đến mức suýt đánh rơi điện thoại.',
          effects: { happy: -2, flag: 's_school_bn_hen', followUp: { id: 's_school_bn_tu_xu', delay: 0 } },
          scene: { anim: 'type', expr: 'angry', fx: 'anger' } },
        { label: 'Trốn lên thư viện cả giờ ra chơi',
          text: 'Bạn ôm cặp chạy một mạch lên tầng ba, chui vào góc khuất nhất của thư viện, nơi chỉ có tiếng quạt trần và mùi sách cũ.',
          effects: { happy: -3, smarts: 1, followUp: { id: 's_school_bn_ban_cuoi', delay: 0 } },
          scene: { anim: 'run', fx: 'sweat' } }
      ]
    },
    {
      id: 's_school_bn_ky_luat', title: 'Hội đồng kỷ luật', icon: '⚖️', age: [11, 15], chainOnly: true,
      text: 'Phòng hội đồng sáng thứ Hai lạnh như tủ đá. Thầy hiệu trưởng chiếu đoạn clip lên màn hình, “Tam Hổ” cúi gằm. Bất ngờ nhất là {classmate} — đứa ít nói nhất lớp — tự nguyện đứng ra làm chứng, kể hết những lần cả lớp bị thu “phí giữ xe”. Thầy quay sang bạn: “Em muốn nhà trường xử lý thế nào?”',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'idle', expr: 'neutral',
        npcs: [
          { role: 'teacher', gender: 'm', age: 55, anim: 'talk', say: 'Em cứ nói thật, thầy nghe.' },
          { role: 'classmate', anim: 'nod', expr: 'neutral', say: 'Em làm chứng. Em thấy hết.' },
          { role: 'classmate', anim: 'sad', expr: 'sad' },
          { role: 'classmate', anim: 'sad', expr: 'scared' }
        ], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Đề nghị kỷ luật thật nghiêm',
          text: 'Ba đứa bị đình chỉ học một tuần, hạ hạnh kiểm, phải đọc bản kiểm điểm trước toàn trường và gỡ clip. Lần đầu tiên sau nhiều tháng, bạn dắt xe về mà không phải ngoái lại phía sau.',
          effects: { happy: 9, flag: 's_school_bn_xu_ly' },
          scene: { anim: 'nod', expr: 'happy', fx: 'sparkle', npcAnim: { teacher: 'point' } } },
        { label: 'Xin cho tụi nó một cơ hội',
          text: 'Bạn chỉ xin ba điều: gỡ clip, xin lỗi trước lớp, trả lại tiền cho những ai bị thu. Thầy hiệu trưởng nhìn bạn rất lâu rồi gật đầu. Tên cầm đầu ngẩng lên, lần đầu tiên không dám nhìn thẳng vào mắt bạn.',
          effects: { happy: 5, karma: 9, money: 200000, flag: 's_school_bn_xu_ly', followUp: { id: 's_school_bn_loi_xin_loi', delay: 3 } },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { teacher: 'nod' }, npcSay: { teacher: 'Em rộng lượng hơn thầy nghĩ.' } } },
        { label: 'Chạy theo cảm ơn {classmate}', req: { notFlag: 's_school_bn_ban_than' },
          text: 'Nhà trường kỷ luật “Tam Hổ” đúng quy định. Tan họp, bạn chạy theo {classmate}, dúi vào tay hộp sữa: “Sao cậu giúp mình?” — “Vì ở trường cũ, mình cũng từng là cậu.” Từ hôm đó, chiều nào hai đứa cũng dắt xe về cùng nhau.',
          effects: { happy: 10, karma: 3, addPerson: { role: 'friend', fromScene: 'classmate' }, flag: ['s_school_bn_xu_ly', 's_school_bn_ban_than'] },
          scene: { anim: 'hug', expr: 'happy', fx: 'hearts', npcSay: { classmate: 'Từ giờ đi về chung nhé.' } } },
        { label: 'Đòi bồi thường cả tiền lẫn... xe mới',
          outcomes: [
            { p: 0.5, text: 'Phụ huynh “Tam Hổ” ngượng chín mặt, góp nhau đền bạn {money:1500000}. Bạn có xe mới, nhưng cả trường đồn bạn “làm tiền”. Bạn kệ.',
              effects: { money: 1500000, happy: 4, karma: -3, flag: 's_school_bn_xu_ly' },
              scene: { anim: 'shrug', fx: 'money' } },
            { p: 0.5, text: 'Một phụ huynh đập bàn: “Trẻ con đùa nhau mà đòi tiền à?” Hai bên cãi nhau to đến mức thầy hiệu trưởng phải mời ra ngoài. Vụ việc chìm xuồng, chỉ còn cái tiếng.',
              effects: { happy: -6, karma: -2, flag: 's_school_bn_xu_ly' },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { teacher: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_school_bn_ban_cuoi', title: 'Người bạn ở góc thư viện', icon: '🍙', age: [11, 15], chainOnly: true,
      text: 'Bạn ngồi thu lu ở góc thư viện, giả vờ đọc cuốn từ điển dày cộp. Một hộp xôi được đặt nhẹ xuống bàn. {classmate} ngồi xuống cạnh bạn, nói nhỏ: “Ở trường cũ mình cũng bị y như vậy. Mình học võ ba năm rồi. Từ mai về chung với mình nhé?”',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'classmate', anim: 'sit', expr: 'neutral', say: 'Từ mai về chung với mình nhé?' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Gật đầu, chia nhau hộp xôi',
          text: 'Từ hôm đó, chiều nào cũng có hai cái bóng dắt xe về cùng nhau. “Tam Hổ” đứng từ xa nhìn, rồi... không dám lại gần nữa. Cái clip cũ trôi dần xuống đáy nhóm chat, chẳng ai nhắc lại.',
          effects: { happy: 10, addPerson: { role: 'friend', fromScene: 'classmate' }, flag: 's_school_bn_ban_than' },
          scene: { anim: 'eat', expr: 'happy', fx: 'hearts', npcAnim: { classmate: 'eat' } } },
        { label: 'Nhờ cậu ấy dạy võ để tự đứng lên',
          text: 'Sáu giờ sáng mỗi ngày, hai đứa ra công viên tập đấm bao cát. Một năm sau, bạn cao thêm tám phân, vai rộng hẳn ra, và trong mắt không còn sợ hãi. Đã đến lúc nói chuyện với “Tam Hổ”.',
          effects: { health: 8, happy: 6, addPerson: { role: 'friend', fromScene: 'classmate' }, flag: 's_school_bn_ban_than', followUp: { id: 's_school_bn_tu_xu', delay: 1 } },
          scene: { loc: 'park', time: 'dawn', anim: 'lift', expr: 'happy', fx: 'levelup', npcAnim: { classmate: 'clap' } } },
        { label: 'Từ chối: “Cậu dính vào sẽ bị liên lụy”',
          text: '{classmate} không nói gì, chỉ để lại hộp xôi. Cả học kỳ đó bạn trốn trong thư viện — điểm Văn tăng vọt, nhưng lòng thì chẳng vui chút nào.',
          effects: { smarts: 4, happy: -5 },
          scene: { anim: 'study', expr: 'sad', fx: 'sweat', npcAnim: { classmate: 'walk' } } }
      ]
    },
    {
      id: 's_school_bn_tu_xu', title: 'Hẹn nhau sau nhà thể chất', icon: '🥊', age: [11, 16], chainOnly: true,
      text: 'Chiều thứ Sáu, sau dãy nhà thể chất. “Tam Hổ” đứng chờ sẵn, vài chục đứa hóng chuyện giơ điện thoại lên quay. Tim bạn đập thình thịch. Đúng lúc ấy, {classmate} lặng lẽ bước ra, đứng ngay sau lưng bạn.',
      scene: { loc: 'school', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'angry',
        npcs: [
          { role: 'classmate', anim: 'idle', expr: 'neutral', say: 'Mình đứng đây. Cậu cứ nói.' },
          { role: 'classmate', anim: 'point', expr: 'angry', say: 'Gan nhỉ? Dám hẹn bọn tao à?' },
          { role: 'classmate', anim: 'angry', expr: 'angry' },
          { role: 'crowd', anim: 'phone' }
        ], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Xông vào ăn thua đủ',
          success: { stat: 'health', base: 0.1, scale: 0.55 },
          outcomes: [
            { text: 'Bạn né cú đấm đầu tiên rồi quật tên cầm đầu ngã sõng soài. Cả sân hò reo. Nhưng clip trận đánh lên mạng ngay tối đó: bạn bị hạ hạnh kiểm cùng “Tam Hổ”. Đáng không? Bạn thấy... đáng.',
              effects: { happy: 6, health: -3, karma: -4, smarts: -1, flag: 's_school_bn_danh_nhau' },
              scene: { anim: 'cheer', expr: 'happy', fx: 'dust', npcAnim: { crowd: 'cheer' } } },
            { text: 'Ba đánh một, {classmate} lao vào kéo bạn ra thì đã muộn: bạn phải khâu ba mũi ở lông mày. Cả hai phe bị mời phụ huynh, còn bố mẹ thì vừa băng bó vừa khóc.',
              effects: { health: -10, happy: -7, karma: -2, flag: 's_school_bn_danh_nhau' },
              scene: { anim: 'fall', expr: 'sick', fx: 'stars', npcAnim: { crowd: 'scared' } } }
          ] },
        { label: 'Bật ghi âm, khích chúng tự khai',
          text: 'Bạn hỏi to: “Thu tiền bao nhiêu đứa rồi?” Tên cầm đầu vênh mặt kể vanh vách, còn khoe số tiền “kiếm” được mỗi tháng. Tất cả nằm gọn trong file ghi âm. Tối đó, file được gửi thẳng tới cô chủ nhiệm.',
          effects: { smarts: 4, happy: 5, followUp: { id: 's_school_bn_ky_luat', delay: 0 } },
          scene: { anim: 'phone', expr: 'happy', fx: 'idea' } },
        { label: 'Nhìn thẳng mắt: “Tao không sợ tụi mày nữa”',
          outcomes: [
            { p: 0.6, text: 'Cả đám đông im phăng phắc. Tên cầm đầu nhìn bạn, nhìn {classmate}, rồi chửi đổng một câu và bỏ đi. Từ hôm đó, không ai trong trường dám đụng đến bạn nữa.',
              effects: { happy: 12, karma: 3 },
              scene: { anim: 'point', expr: 'angry', fx: 'flash', npcAnim: { crowd: 'clap' } } },
            { p: 0.4, text: 'Hắn xô bạn ngã, nhưng {classmate} giữ chặt tay hắn lại, đám đông la ó ầm ĩ. Bác bảo vệ thổi còi chạy tới, và lần này mọi chuyện được đưa lên tận phòng hội đồng.',
              effects: { health: -3, happy: 2, followUp: { id: 's_school_bn_ky_luat', delay: 0 } },
              scene: { anim: 'fall', fx: 'exclaim', npcAnim: { crowd: 'scared' } } }
          ] },
        { label: 'Quay lưng bỏ về',
          text: 'Tiếng huýt sáo chế giễu đuổi theo bạn suốt quãng đường ra cổng. Hè năm đó, bố mẹ xin cho bạn chuyển trường. Ở trường mới không ai biết bạn là ai — nhẹ nhõm, mà cũng hơi tiếc.',
          effects: { happy: -6, money: -500000 },
          scene: { anim: 'walk', expr: 'sad', fx: 'tears', npcAnim: { crowd: 'laugh' } } }
      ]
    },
    {
      id: 's_school_bn_loi_xin_loi', title: 'Tin nhắn từ “Tam Hổ”', icon: '🍵', age: [14, 18], chainOnly: true,
      text: 'Ba năm sau, một tài khoản lạ nhắn cho bạn: “Tao là đứa cầm đầu nhóm Tam Hổ hồi cấp hai. Giờ tao nghỉ học, đi giao hàng. Tao muốn gặp mày, xin lỗi cho đàng hoàng.” Hắn hẹn ở quán trà đá đầu hẻm. Bạn rủ {classmate} đi cùng cho chắc.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'neutral',
        npcs: [
          { role: 'classmate', anim: 'sit', expr: 'neutral' },
          { role: 'classmate', anim: 'bow', expr: 'sad', say: 'Hồi đó tao sai. Xin lỗi mày.' }
        ], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Tha thứ, gọi thêm hai cốc trà đá',
          text: 'Ba đứa ngồi đến tối mịt, kể chuyện trường cũ như những người bạn lâu năm. Lúc về, hắn nói nhỏ: “Cảm ơn mày. Tao nhẹ cả người.” Bạn cũng vậy.',
          effects: { happy: 7, karma: 7, money: -20000 },
          scene: { anim: 'drink', expr: 'happy', fx: 'sparkle', npcAnim: { classmate: 'drink' } } },
        { label: 'Nhận lời xin lỗi, nhưng không làm bạn',
          text: '“Tao nhận. Nhưng mình không thân được đâu.” Hắn gật đầu, trả tiền trà rồi đi. Có những vết xước lành rồi vẫn để lại sẹo — và thế cũng không sao.',
          effects: { happy: 3, smarts: 2 },
          scene: { anim: 'nod', expr: 'neutral', fx: 'sparkle' } },
        { label: 'Bảo hắn đi xin lỗi những đứa khác nữa',
          text: 'Bạn đưa hắn danh sách năm cái tên từng bị thu “phí giữ xe”. Một tháng sau, từng đứa một nhắn cho bạn: “Nó tìm đến tận nhà xin lỗi tao đấy, mày tin được không?”',
          effects: { happy: 5, karma: 10 },
          scene: { anim: 'point', expr: 'happy', fx: 'idea' } },
        { label: 'Đứng dậy bỏ về, không nói một lời',
          text: 'Bạn để lại tiền trà rồi đi thẳng. Tối đó bạn chặn tài khoản kia. Có những chuyện chẳng cần lời xin lỗi nào nữa.',
          effects: { happy: -1, karma: -2 },
          scene: { anim: 'walk', expr: 'angry', fx: 'smoke' } }
      ]
    },
  );
})();
