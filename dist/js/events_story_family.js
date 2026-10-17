/* Một Kiếp Người — ngoại truyện: gia đình (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: BỐ MẸ LY HÔN (góc nhìn của con, 7–17 tuổi) =======================
    {
      id: 's_family_lyhon_dem', title: 'Hai chữ “ly hôn” lúc nửa đêm', icon: '🌧️', age: [7, 15], weight: 1,
      req: { has: ['mother', 'father'], notFlag: 's_family_lyhon' },
      text: 'Hai giờ sáng, bạn dậy đi uống nước thì nghe tiếng bố mẹ nói chuyện rất khẽ mà rất gắt dưới phòng khách. Lần này không có tiếng chén vỡ, chỉ có một câu nhỏ mà rõ mồn một: “Mình ly hôn đi.” Cạnh cửa là chiếc vali của {father.k} đã kéo khóa sẵn.',
      scene: { loc: 'home', time: 'night', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'mother', anim: 'cry', say: 'Tôi mệt lắm rồi. Mình ly hôn đi.' }, { role: 'father', anim: 'sad', say: 'Ừ... để sáng mai nói với con.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Chạy ra ôm chầm lấy cả bố lẫn mẹ',
          outcomes: [
            { p: 0.4, text: 'Bố mẹ giật mình, rồi cả ba ôm nhau khóc giữa phòng khách. {father.K} lặng lẽ xách vali cất vào góc nhà: “Bố mẹ sẽ thử thêm một lần nữa, vì con.”',
              effects: { happy: -2, rel: { mother: 6, father: 6 }, flag: 's_family_lyhon', followUp: { id: 's_family_lyhon_bien', delay: 1 } },
              scene: { anim: 'hug', fx: 'tears', npcAnim: { mother: 'hug', father: 'hug' }, npcSay: { father: 'Bố mẹ sẽ thử lại, vì con.' } } },
            { p: 0.6, text: 'Mẹ ôm bạn vào lòng, bố quay mặt đi lau nước mắt. Không ai nói gì. Sáng hôm sau, chiếc vali không còn ở góc nhà, và bố cũng vậy.',
              effects: { happy: -8, rel: { mother: 5, father: 3 }, flag: 's_family_lyhon', followUp: { id: 's_family_lyhon_chon', delay: 0 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'hug', father: 'sad' } } }
          ] },
        { label: 'Lẻn về giường, trùm chăn giả vờ không biết',
          text: 'Bạn nằm co ro trong chăn, tim đập thình thịch đến sáng. Bữa sáng hôm sau cả nhà vẫn cười nói như không có gì, và chính điều đó làm bạn sợ nhất.',
          effects: { happy: -6, smarts: 1, flag: 's_family_lyhon', followUp: { id: 's_family_lyhon_chon', delay: 1 } },
          scene: { loc: 'bedroom', anim: 'sad', fx: 'tears' } },
        { label: 'Viết thư tay dán lên cửa tủ lạnh',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Sáng ra, mẹ đọc lá thư nguệch ngoạc “Con xin bố mẹ đừng bỏ nhau” rồi lặng lẽ đưa cho bố. Hai người ngồi im rất lâu. Tối đó, lần đầu sau nhiều tháng, cả nhà ăn cơm chung một mâm.',
              effects: { happy: 3, karma: 3, rel: { mother: 8, father: 8 }, flag: 's_family_lyhon', followUp: { id: 's_family_lyhon_bien', delay: 1 } },
              scene: { time: 'dawn', anim: 'hug', fx: 'hearts', npcAnim: { mother: 'cry', father: 'hug' } } },
            { text: 'Lá thư bị gỡ xuống, gấp gọn, cất vào ngăn kéo. Mẹ xoa đầu bạn: “Chuyện người lớn, con đừng lo.” Nhưng ai cũng thấy mắt mẹ sưng húp.',
              effects: { happy: -5, rel: { mother: 3 }, flag: 's_family_lyhon', followUp: { id: 's_family_lyhon_chon', delay: 1 } },
              scene: { time: 'dawn', anim: 'sad', npcAnim: { mother: 'sad', father: 'shake' }, npcSay: { mother: 'Chuyện người lớn, con đừng lo.' } } }
          ] },
        { label: 'Đập cửa hét lên: “Im hết đi!”',
          text: 'Cả nhà sững sờ. Bố mẹ im bặt, không phải vì làm lành mà vì không biết nói gì với bạn. Từ hôm đó, những trận cãi nhau chuyển hết sang... tin nhắn Zalo.',
          effects: { happy: -6, rel: { mother: -3, father: -3 }, flag: 's_family_lyhon', followUp: { id: 's_family_lyhon_chon', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { mother: 'scared', father: 'facepalm' } } }
      ]
    },
    {
      id: 's_family_lyhon_bien', title: 'Chuyến đi biển “làm lại từ đầu”', icon: '🏖️', age: [7, 17], chainOnly: true,
      req: { has: ['mother', 'father'] },
      text: 'Để “làm lại từ đầu”, bố mẹ đưa bạn đi biển ba ngày. Bố thuê hẳn chiếc thúng chai, mẹ mặc lại chiếc váy hoa hồi mới cưới. Nhưng mới chiều đầu tiên, hai người đã to tiếng chỉ vì ai quên mang sạc điện thoại.',
      scene: { loc: 'beach', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'angry', say: 'Có cái sạc cũng không nhớ!' }, { role: 'father', anim: 'angry', say: 'Thì ra tiệm mua cái khác!' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Bày trò thi xây lâu đài cát, đội thua rửa bát',
          success: { stat: 'happy', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bố mẹ bị bạn lôi xuống bãi cát, cãi nhau xem tháp nào đẹp hơn rồi phá lên cười. Tối đó cả nhà ăn ốc, chụp chung một tấm ảnh. Hóa ra bố mẹ chỉ cần ai đó nhắc rằng họ từng vui thế nào.',
              effects: { happy: 10, rel: { mother: 10, father: 10 }, flag: 's_family_lyhon_hangan' },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { mother: 'laugh', father: 'laugh' }, npcSay: { father: 'Tháp của bố đẹp nhất nhé!' } } },
            { text: 'Lâu đài chưa xây xong đã bị sóng đánh sập, và trận cãi vã lại tiếp tục ngay trên bãi cát. Chuyến đi kết thúc sớm một ngày, trên xe về không ai nói câu nào.',
              effects: { happy: -6, followUp: { id: 's_family_lyhon_chon', delay: 0 } },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { mother: 'angry', father: 'shake' } } }
          ] },
        { label: 'Lặng lẽ đưa cục sạc dự phòng hình con mèo cho bố',
          outcomes: [
            { p: 0.5, text: 'Bố cầm cục sạc hình con mèo, bật cười. Mẹ cũng cười theo. Đêm đó bố mẹ ngồi nói chuyện ngoài hiên đến khuya, giọng nhỏ nhẹ như hồi xưa, và chiếc vali cứ thế nằm yên trong tủ.',
              effects: { happy: 8, rel: { mother: 8, father: 8 }, flag: 's_family_lyhon_hangan' },
              scene: { time: 'night', anim: 'laugh', fx: 'stars', npcAnim: { mother: 'laugh', father: 'hug' } } },
            { p: 0.5, text: 'Bố nói “cảm ơn con” rồi im lặng. Cơn giận tan, nhưng khoảng cách thì ở lại. Về nhà được một tuần, bố mẹ gọi bạn ra phòng khách nói chuyện nghiêm túc.',
              effects: { happy: -4, followUp: { id: 's_family_lyhon_chon', delay: 0 } },
              scene: { anim: 'sad', npcAnim: { mother: 'sad', father: 'sad' } } }
          ] },
        { label: 'Đeo tai nghe, ra bờ biển ngồi một mình',
          text: 'Bạn ngồi đếm sóng đến khi trời tối hẳn. Không ai đi tìm, vì bố mẹ còn mải cãi nhau. Lúc ấy bạn hiểu: chuyến đi này không cứu được gì nữa rồi.',
          effects: { happy: -7, followUp: { id: 's_family_lyhon_chon', delay: 0 } },
          scene: { time: 'night', anim: 'sit', fx: 'tears', npcAnim: { mother: 'angry', father: 'angry' } } }
      ]
    },
    {
      id: 's_family_lyhon_chon', title: 'Con muốn ở với ai?', icon: '💔', age: [7, 17], chainOnly: true,
      req: { has: ['mother', 'father'] },
      text: 'Bố mẹ ngồi hai đầu bộ bàn ghế gỗ, ở giữa là đĩa cam không ai bóc. Mẹ nói nhỏ: “Bố mẹ quyết định chia tay rồi. Không phải lỗi của con.” Rồi bố hỏi câu mà bạn sợ nhất: “Con muốn ở với bố hay với mẹ?”',
      scene: { loc: 'home', time: 'dusk', weather: 'cloudy', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'talk', say: 'Không phải lỗi của con đâu.' }, { role: 'father', anim: 'sad', say: 'Con muốn ở với bố hay với mẹ?' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Ở với mẹ',
          text: 'Bạn nắm tay mẹ. Bố gật đầu, cố cười mà mắt đỏ hoe: “Ừ, cuối tuần bố đón con đi ăn kem.” Tuần sau, hai mẹ con dọn ra căn phòng trọ nhỏ gần chợ.',
          effects: { happy: -6, rel: { mother: 8, father: -2 }, flag: 's_family_lyhon_me', followUp: { id: 's_family_lyhon_nha_moi', delay: 0 } },
          scene: { anim: 'hug', fx: 'tears', npcAnim: { mother: 'hug', father: 'sad' }, npcSay: { father: 'Cuối tuần bố đón con đi ăn kem.' } } },
        { label: 'Ở với bố',
          text: 'Bạn đứng về phía bố. Mẹ ôm bạn thật lâu rồi thì thầm: “Con nhớ ăn sáng đầy đủ nhé.” Từ nay hai bố con sống trong căn nhà vắng tiếng mẹ, bữa sáng thường là ổ bánh mì đầu hẻm.',
          effects: { happy: -6, rel: { father: 8, mother: -2 }, flag: 's_family_lyhon_bo', followUp: { id: 's_family_lyhon_nha_moi', delay: 0 } },
          scene: { anim: 'hug', fx: 'tears', npcAnim: { father: 'hug', mother: 'cry' }, npcSay: { mother: 'Con nhớ ăn sáng đầy đủ nhé.' } } },
        { label: 'Hét lên: “Con không chọn! Con muốn cả hai!”',
          outcomes: [
            { p: 0.5, text: 'Bạn chạy vào phòng khóa trái cửa. Cuối cùng tòa xử bạn ở với mẹ, cuối tuần về với bố. Người lớn quyết hết, chẳng ai hỏi lại bạn lần nữa.',
              effects: { happy: -9, rel: { mother: 2, father: 2 }, flag: 's_family_lyhon_me', followUp: { id: 's_family_lyhon_nha_moi', delay: 0 } },
              scene: { loc: 'bedroom', anim: 'cry', fx: 'tears' } },
            { p: 0.5, text: 'Bạn chạy vào phòng khóa trái cửa. Cuối cùng tòa xử bạn ở với bố, vì bố giữ căn nhà gần trường. Mẹ dọn đi vào một sáng thứ Bảy, để lại nồi thịt kho đầy ắp trong tủ lạnh.',
              effects: { happy: -9, rel: { mother: 2, father: 2 }, flag: 's_family_lyhon_bo', followUp: { id: 's_family_lyhon_nha_moi', delay: 0 } },
              scene: { loc: 'bedroom', anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Ra điều kiện: “Ai hứa không nói xấu người kia, con ở với người đó”',
          text: 'Bố mẹ sững người trước câu nói của đứa con. Cả hai cùng giơ tay hứa. Bạn ở với mẹ trong tuần, cuối tuần với bố, và kỳ lạ thay, cả hai đều giữ lời.',
          effects: { happy: -3, smarts: 3, karma: 4, rel: { mother: 6, father: 6 }, flag: ['s_family_lyhon_me', 's_family_lyhon_hua'], followUp: { id: 's_family_lyhon_nha_moi', delay: 0 } },
          scene: { anim: 'point', fx: 'idea', npcAnim: { mother: 'nod', father: 'nod' }, npcSay: { father: 'Bố hứa.', mother: 'Mẹ cũng hứa.' } } }
      ]
    },
    {
      id: 's_family_lyhon_nha_moi', title: 'Chỉ còn hai cái bàn chải', icon: '🪥', age: [7, 17], chainOnly: true,
      req: { has: ['mother', 'father'] },
      text: 'Trong cốc đánh răng giờ chỉ còn hai cái bàn chải thay vì ba. Ở lớp, {classmate} hỏi to giữa giờ ra chơi: “Ủa, sao hôm họp phụ huynh bố mẹ mày ngồi hai bàn khác nhau vậy?” Cả lớp quay lại nhìn bạn.',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'classmate', anim: 'point', say: 'Bố mẹ mày bỏ nhau hả?' }, { role: 'crowd', anim: 'laugh' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Bình tĩnh nói thật: “Ừ, bố mẹ tao chia tay rồi”',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Cả lớp im phắt. Giờ ra về, {classmate} ngập ngừng đến xin lỗi, rồi kể nhỏ rằng bố mẹ nó cũng đang ly thân. Hai đứa thành bạn thân từ hôm ấy.',
              effects: { happy: 4, karma: 3, addPerson: { role: 'friend', fromScene: 'classmate' }, followUp: { id: 's_family_lyhon_tet', delay: 1 } },
              scene: { anim: 'talk', fx: 'sparkle', npcAnim: { classmate: 'bow', crowd: 'idle' }, npcSay: { classmate: 'Xin lỗi nha... nhà tao cũng vậy.' } } },
            { text: 'Mấy đứa vẫn xì xào sau lưng cả tuần. Nhưng lạ thay, nói ra được rồi, bạn thấy nhẹ lòng hơn hẳn.',
              effects: { happy: -2, smarts: 1, followUp: { id: 's_family_lyhon_tet', delay: 1 } },
              scene: { anim: 'shrug', npcAnim: { classmate: 'shrug', crowd: 'talk' } } }
          ] },
        { label: 'Nói dối: “Bố tao đi công tác nước ngoài”',
          text: 'Lời nói dối đứng vững được ba tháng, cho đến khi bố đến đón bạn trước cổng trường bằng chiếc xe máy cũ. Bạn phải bịa thêm rằng bố... vừa về phép.',
          effects: { happy: -3, karma: -2, followUp: { id: 's_family_lyhon_tet', delay: 1 } },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { classmate: 'think' } } },
        { label: 'Lao vào đánh nhau với nó',
          text: 'Hai đứa lăn lộn dưới gốc bàng, áo đứt cúc. Cô chủ nhiệm mời phụ huynh, và lần đầu tiên sau khi chia tay, bố mẹ cùng ngồi một phòng... để nghe cô phê bình bạn.',
          effects: { happy: -4, health: -2, rel: { mother: -2, father: -2 }, followUp: { id: 's_family_lyhon_tet', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { classmate: 'fall', crowd: 'scared' } } },
        { label: 'Về nhà, trút hết vào cuốn nhật ký',
          text: 'Bạn viết kín ba trang, nước mắt nhòe cả chữ. Cuốn nhật ký bìa xanh trở thành người bạn duy nhất biết hết mọi chuyện trong nhà.',
          effects: { happy: 2, smarts: 2, followUp: { id: 's_family_lyhon_tet', delay: 1 } },
          scene: { loc: 'bedroom', time: 'night', anim: 'study', fx: 'tears' } }
      ]
    },
    {
      id: 's_family_lyhon_tet', title: 'Tết hai nơi', icon: '🧧', age: [8, 18], chainOnly: true,
      req: { has: ['mother', 'father'] },
      text: 'Tết đầu tiên sau khi bố mẹ chia tay: chiều 30 ăn tất niên với mẹ, sáng mùng Một chúc Tết bố. Lần này bố không ở một mình. Bên cạnh bố là một người phụ nữ lạ đang bày mâm ngũ quả, cười hiền: “Chúc mừng năm mới con, cô là bạn của bố.”',
      scene: { loc: 'home', decor: 'tet', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'father', anim: 'talk', say: 'Con chào cô đi.' }, { role: 'stranger', gender: 'f', age: 38, anim: 'wave', say: 'Chúc mừng năm mới con!' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Lễ phép chào, nhận lì xì',
          text: 'Cô ấy lì xì bạn {money:200000}, dúi thêm hộp mứt gừng. Bạn chưa thương được ngay, nhưng thấy bố cười nhiều hơn hẳn. Tối về, mẹ hỏi: “Bên đó vui không con?” Bạn chỉ “dạ” một tiếng.',
          effects: { money: 200000, happy: 2, karma: 3, rel: { father: 6 }, followUp: { id: 's_family_lyhon_tha_thu', delay: 4 } },
          scene: { anim: 'bow', fx: 'money', npcAnim: { stranger: 'nod', father: 'laugh' } } },
        { label: 'Mặt lạnh, ôm điện thoại cả buổi',
          text: 'Cả buổi bạn chỉ nhìn màn hình. Bố ngồi cạnh, mấy lần định nói gì rồi thôi. Lúc về, bố dúi vào tay bạn phong bao đỏ, kèm câu “Bố xin lỗi” rất khẽ.',
          effects: { happy: -4, rel: { father: -6 }, followUp: { id: 's_family_lyhon_tha_thu', delay: 4 } },
          scene: { anim: 'phone', expr: 'angry', npcAnim: { father: 'sad', stranger: 'shrug' } } },
        { label: 'Đòi về nhà mẹ ngay lập tức',
          text: 'Bạn bỏ dở mâm cơm, đòi về. Bố chở bạn đi trong im lặng, mưa xuân lất phất. Đến đầu hẻm, bố dừng xe: “Dù thế nào, bố vẫn là bố của con.”',
          effects: { happy: -5, rel: { father: -8, mother: 3 }, followUp: { id: 's_family_lyhon_tha_thu', delay: 4 } },
          scene: { loc: 'street', weather: 'fog', anim: 'sad', fx: 'tears', npcAnim: { father: 'sad', stranger: 'sad' }, npcSay: { father: 'Bố vẫn là bố của con.' } } },
        { label: 'Xắn tay vào gói bánh chưng cùng cô ấy',
          outcomes: [
            { p: 0.6, text: 'Bánh của bạn méo xẹo như cái gối, cô ấy cười chảy cả nước mắt. Lần đầu tiên sau nhiều tháng, bạn thấy Tết vẫn còn là Tết, dù ở hai nơi.',
              effects: { happy: 6, karma: 3, rel: { father: 8 }, followUp: { id: 's_family_lyhon_tha_thu', delay: 4 } },
              scene: { anim: 'cook', fx: 'sparkle', npcAnim: { stranger: 'laugh', father: 'clap' } } },
            { p: 0.4, text: 'Bạn gói rất khéo, nhưng lỡ miệng: “Mẹ con gói đẹp hơn cô nhiều.” Cả bếp im phăng phắc, chỉ còn tiếng nồi bánh sôi lục bục.',
              effects: { happy: -2, rel: { father: -2 }, followUp: { id: 's_family_lyhon_tha_thu', delay: 4 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'sad', father: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_family_lyhon_tha_thu', title: 'Bàn cà phê ba người', icon: '☕', age: [12, 30], chainOnly: true,
      req: { has: ['mother', 'father'] },
      text: 'Nhiều năm đã trôi qua. Hôm nay sinh nhật tuổi {age}, lần đầu tiên bố mẹ hẹn bạn ra cùng một quán cà phê. Bố tóc đã lốm đốm bạc, mẹ gầy đi nhiều. Mẹ đẩy hộp quà sang: “Ngày đó bố mẹ ích kỷ quá. Con còn giận không?”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'talk', say: 'Con còn giận bố mẹ không?' }, { role: 'father', anim: 'sad', say: 'Bố nợ con một lời xin lỗi.' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Nắm tay cả hai: “Con hiểu rồi. Con không giận nữa”',
          text: 'Mẹ bật khóc, bố quay đi lau mắt. Ba người ngồi đến khi quán đóng cửa, kể lại chuyện cũ, cả chuyện buồn lẫn chuyện cười. Có những vết thương chỉ lành khi ta đủ lớn để hiểu.',
          effects: { happy: 12, karma: 6, rel: { mother: 15, father: 15 }, flag: 's_family_lyhon_thathu' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'cry', father: 'hug' } } },
        { label: 'Nói thật: “Con từng giận lắm, giờ thì đỡ rồi”',
          text: 'Bạn kể về những đêm khóc một mình, những buổi họp phụ huynh hai bàn. Bố mẹ im lặng nghe, không thanh minh câu nào. Lúc chia tay, bạn thấy lòng nhẹ như vừa đặt xuống chiếc ba lô nặng trĩu.',
          effects: { happy: 8, smarts: 3, rel: { mother: 10, father: 10 }, flag: 's_family_lyhon_thathu' },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { mother: 'nod', father: 'nod' } } },
        { label: 'Nhắc lại lời hứa năm xưa', req: { flag: 's_family_lyhon_hua' },
          text: 'Bạn mỉm cười: “Bố mẹ giữ lời không nói xấu nhau suốt ngần ấy năm. Con biết ơn nhất là điều đó.” Bố mẹ nhìn nhau, rồi lần đầu tiên sau bao năm, cùng bật cười.',
          effects: { happy: 12, karma: 5, rel: { mother: 15, father: 15 }, flag: 's_family_lyhon_thathu' },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { mother: 'laugh', father: 'laugh' } } },
        { label: 'Đứng dậy bỏ về: “Muộn quá rồi”',
          text: 'Bạn để lại hộp quà chưa mở trên bàn. Đi được nửa đường thì điện thoại rung: tin nhắn của mẹ, dài đến mức phải cuộn ba lần. Bạn chưa trả lời, nhưng cũng không xóa.',
          effects: { happy: -6, rel: { mother: -6, father: -6 } },
          scene: { loc: 'street', time: 'night', anim: 'walk', fx: 'tears', npcAnim: { mother: 'cry', father: 'sad' } } }
      ]
    },

    // ======================= ARC 2: CÓ EM BÉ MỚI (4–12 tuổi) =======================
    {
      id: 's_family_embe_ve_nha', title: 'Em bé về nhà', icon: '🍼', age: [4, 9], weight: 1.2,
      req: { has: ['mother'], lacks: ['sibling'], notFlag: 's_family_embe', cond: (s) => s.people.some((p) => p.alive && p.role === 'mother' && p.age <= 42) },
      text: 'Mẹ đi viện ba ngày, về nhà với một cái bọc khăn nhỏ xíu, đỏ hỏn, khóc to hơn cả tiếng còi xe ngoài hẻm. Cả nhà, cả hàng xóm xúm lại ngắm em bé. Không ai để ý đến bức tranh “Gia đình em” bạn vẽ suốt buổi sáng.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'mother', anim: 'sit', say: 'Lại đây xem em nè con!' }, { role: 'baby', anim: 'sleep' }, { role: 'neighbor', gender: 'f', age: 60, anim: 'clap', say: 'Ôi, giống bố như đúc!' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Rón rén lại gần, chạm vào bàn tay bé xíu',
          text: 'Em bé nắm chặt lấy ngón tay bạn, không chịu buông. Bạn đứng im như tượng, sợ thở mạnh làm em giật mình. Mẹ cười: “Em nhận ra người nhà rồi đó.”',
          effects: { happy: 6, rel: { mother: 4 }, addPerson: { role: 'sibling' }, flag: 's_family_embe', followUp: { id: 's_family_embe_ghen', delay: 1 } },
          scene: { anim: 'love', fx: 'hearts', npcAnim: { mother: 'laugh', neighbor: 'clap' }, npcSay: { mother: 'Em nhận ra người nhà rồi đó.' } } },
        { label: 'Giơ bức tranh lên: “Mẹ ơi, xem tranh con vẽ!”',
          outcomes: [
            { p: 0.5, text: 'Mẹ khen “đẹp quá” nhưng mắt vẫn dán vào em bé. Bạn lặng lẽ cầm tranh về phòng, vẽ thêm một em bé vào góc tranh... rồi tô đen sì.',
              effects: { happy: -4, addPerson: { role: 'sibling' }, flag: 's_family_embe', followUp: { id: 's_family_embe_ghen', delay: 1 } },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { mother: 'sit', neighbor: 'idle' } } },
            { p: 0.5, text: 'Mẹ đặt em xuống, ôm bạn vào lòng, ngắm bức tranh thật lâu: “Thiếu em bé rồi, con vẽ thêm em vào nhé?” Bạn gật đầu, vẽ thêm một em bé thật to.',
              effects: { happy: 5, rel: { mother: 6 }, addPerson: { role: 'sibling' }, flag: 's_family_embe', followUp: { id: 's_family_embe_ghen', delay: 1 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug', neighbor: 'clap' } } }
          ] },
        { label: 'Hỏi to: “Bao giờ trả em bé về bệnh viện ạ?”',
          text: 'Cả nhà cười rần rần, bà hàng xóm cười đến chảy nước mắt. Mẹ giải thích em sẽ ở đây mãi mãi. Bạn nhìn cái bọc khăn, nghĩ ngợi rất lâu, rồi thở dài như ông cụ non.',
          effects: { happy: 2, addPerson: { role: 'sibling' }, flag: 's_family_embe', followUp: { id: 's_family_embe_ghen', delay: 1 } },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { mother: 'laugh', neighbor: 'laugh' }, npcSay: { neighbor: 'Trời đất, trả sao được con!' } } }
      ]
    },
    {
      id: 's_family_embe_ghen', title: 'Mẹ không thương con nữa?', icon: '😤', age: [5, 11], chainOnly: true,
      req: { has: ['mother', 'sibling'] },
      text: 'Từ ngày có {sibling}, mẹ lúc nào cũng bận: pha sữa, ru em, giặt tã. Hôm nay bạn được điểm 10 đỏ chót, chạy ào về khoe thì mẹ “suỵt” một tiếng vì em vừa ngủ. Cái điểm 10 bỗng chẳng còn vui nữa.',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'sit', say: 'Suỵt, em vừa ngủ con ạ!' }, { role: 'sibling', anim: 'sleep' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Giả vờ đau bụng để được mẹ chăm',
          outcomes: [
            { p: 0.5, text: 'Mẹ hốt hoảng đặt em vào nôi, ôm bạn xoa dầu cả buổi. Sướng thì sướng, nhưng đêm đó mẹ thức trắng vì cả hai đứa, sáng ra mắt thâm quầng. Bạn thấy hơi có lỗi.',
              effects: { happy: 3, karma: -2, rel: { mother: 3 }, followUp: { id: 's_family_embe_trong_em', delay: 1 } },
              scene: { anim: 'sick', fx: 'sweat', npcAnim: { mother: 'hug', sibling: 'cry' } } },
            { p: 0.5, text: 'Mẹ đưa bạn đi khám. Bác sĩ vừa ấn vào bụng, bạn đã cười nhột không nhịn được. Mẹ nhìn bạn, không mắng, chỉ thở dài thật khẽ.',
              effects: { happy: -3, karma: -2, followUp: { id: 's_family_embe_trong_em', delay: 1 } },
              scene: { loc: 'hospital', anim: 'laugh', fx: 'sweat', npcAnim: { mother: 'facepalm', sibling: 'sleep' } } }
          ] },
        { label: 'Lén giấu bình sữa của em',
          text: 'Cả nhà lục tung lên tìm bình sữa trong khi em khóc ré. Cuối cùng mẹ tìm thấy nó dưới gối của bạn. Mẹ không đánh, chỉ hỏi: “Con ghét em lắm hả?” Câu hỏi ấy làm bạn khóc còn to hơn em.',
          effects: { happy: -5, karma: -3, rel: { mother: -3 }, followUp: { id: 's_family_embe_trong_em', delay: 1 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'sad', sibling: 'cry' }, npcSay: { mother: 'Con ghét em lắm hả?' } } },
        { label: 'Nói thật: “Mẹ không thương con nữa”',
          text: 'Mẹ sững người, rồi kéo bạn vào lòng: “Mẹ có hai tay, một tay bế em, một tay ôm con.” Tối đó mẹ gửi em cho người nhà trông, dắt bạn đi ăn kem, chỉ hai mẹ con.',
          effects: { happy: 8, rel: { mother: 10 }, followUp: { id: 's_family_embe_trong_em', delay: 1 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug' }, npcSay: { mother: 'Một tay bế em, một tay ôm con.' } } },
        { label: 'Xin mẹ cho phụ một tay chăm em',
          text: 'Mẹ ngạc nhiên rồi cười tít mắt, phong bạn chức “trợ lý thay tã”. Bạn nhăn mũi, nhưng lần đầu thấy mình quan trọng trong nhà.',
          effects: { happy: 5, karma: 4, rel: { mother: 6, sibling: 5 }, flag: 's_family_embe_ngoan', followUp: { id: 's_family_embe_trong_em', delay: 0 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { mother: 'laugh' } } }
      ]
    },
    {
      id: 's_family_embe_trong_em', title: 'Một tiếng làm người lớn', icon: '🧸', age: [5, 12], chainOnly: true,
      req: { has: ['sibling'] },
      text: 'Mẹ phải chạy ra chợ, dặn đi dặn lại: “Trông em một tiếng thôi, có gì gọi bà Tư hàng xóm.” Mẹ vừa khuất đầu hẻm thì {sibling} khóc ré lên, mặt đỏ gay, tay quơ quào đòi mẹ.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'sibling', anim: 'cry' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Hát ru bài “Một con vịt”',
          success: { stat: 'happy', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: '“Một con vịt xòe ra hai cái cánh...” Hát đến lần thứ mười bảy thì {sibling} nín, cười toe, rồi ngủ gục trên vai bạn. Mẹ về thấy hai đứa ngủ ôm nhau trên chiếu, đứng nhìn mãi không nỡ gọi.',
              effects: { happy: 8, rel: { sibling: 10 }, flag: 's_family_embe_ngoan', followUp: { id: 's_family_embe_thuong', delay: 2 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { sibling: 'laugh' } } },
            { text: 'Bạn hát khản cả cổ, em càng khóc to. Bạn cũng khóc theo. Mẹ về đến cổng nghe hai đứa song ca khóc, vừa thương vừa buồn cười.',
              effects: { happy: -2, rel: { sibling: 3, mother: 3 }, followUp: { id: 's_family_embe_thuong', delay: 2 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { sibling: 'cry' } } }
          ] },
        { label: 'Chạy sang gọi bà Tư hàng xóm',
          text: 'Bà Tư sang, bế em lên vỗ vỗ mấy cái là em nín. Bà dạy bạn bế em đúng kiểu: một tay đỡ đầu, một tay đỡ mông. Bạn tập theo, vụng về nhưng cẩn thận lắm.',
          effects: { happy: 3, smarts: 2, rel: { sibling: 5 }, followUp: { id: 's_family_embe_thuong', delay: 2 } },
          scene: { anim: 'hug', fx: 'idea', npcAnim: { sibling: 'laugh' } } },
        { label: 'Mở TikTok cho em xem',
          outcomes: [
            { p: 0.6, text: 'Em nín ngay lập tức, mắt dán vào màn hình. Một tiếng trôi qua êm ru. Mẹ về khen bạn giỏi, bạn không dám kể bí quyết.',
              effects: { happy: 4, karma: -1, followUp: { id: 's_family_embe_thuong', delay: 2 } },
              scene: { anim: 'phone', fx: 'music', npcAnim: { sibling: 'idle' } } },
            { p: 0.4, text: 'Em nín được năm phút, rồi giật điện thoại ném xuống đất. Màn hình nứt một đường dài. Mẹ về, nhìn cái điện thoại rồi nhìn hai đứa, chỉ biết ôm trán.',
              effects: { happy: -4, rel: { mother: -3 }, followUp: { id: 's_family_embe_thuong', delay: 2 } },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { sibling: 'laugh' } } }
          ] },
        { label: 'Trùm khăn lên đầu chơi ú òa',
          text: 'Bạn trùm khăn, “ú òa!”, rồi làm mặt khỉ, mặt heo, mặt ông Địa. {sibling} nấc lên mấy cái rồi phá ra cười khanh khách, tiếng cười đầu tiên dành riêng cho bạn.',
          effects: { happy: 7, rel: { sibling: 8 }, flag: 's_family_embe_ngoan', followUp: { id: 's_family_embe_thuong', delay: 2 } },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { sibling: 'laugh' } } }
      ]
    },
    {
      id: 's_family_embe_thuong', title: 'Ai bắt nạt em tao?', icon: '🛡️', age: [7, 15], chainOnly: true,
      req: { has: ['sibling'] },
      text: '{sibling} giờ đã lon ton chạy khắp hẻm, nói líu lo như chim. Chiều nay em chạy về mếu máo: thằng bé {kid} nhà cuối hẻm giật mất con gấu bông, còn chê em là “đồ mít ướt”.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'sibling', anim: 'cry', say: 'Nó lấy gấu của em!' }, { role: 'kid', gender: 'm', anim: 'laugh', say: 'Đồ mít ướt! Lêu lêu!' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Xắn tay áo đi đòi lại gấu bông',
          success: { stat: 'health', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn đứng chắn trước mặt {kid}, nói từng chữ: “Trả gấu cho em tao.” Nó lí nhí trả lại rồi chạy mất dép. {sibling} ôm gấu, ôm luôn chân bạn không buông.',
              effects: { happy: 7, karma: 2, rel: { sibling: 12 }, flag: 's_family_embe_thuong' },
              scene: { anim: 'point', fx: 'sparkle', npcAnim: { kid: 'scared', sibling: 'hug' } } },
            { text: '{kid} lè lưỡi chạy vòng vòng, bạn đuổi theo vấp ngã trầy đầu gối. Nhưng thấy bạn khập khiễng mang được gấu về, {sibling} nín khóc, thổi phù phù vào vết xước cho bạn.',
              effects: { happy: 4, health: -2, rel: { sibling: 12 }, flag: 's_family_embe_thuong' },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { kid: 'laugh', sibling: 'hug' } } }
          ] },
        { label: 'Dắt em sang gặp bố mẹ thằng bé',
          text: 'Mẹ {kid} xin lỗi rối rít, bắt con trả gấu và cho em thêm cái kẹo mút. Đường về, em nắm chặt tay bạn, vừa đi vừa nhảy chân sáo.',
          effects: { happy: 5, karma: 4, smarts: 1, rel: { sibling: 8 }, flag: 's_family_embe_thuong' },
          scene: { anim: 'walk', fx: 'sparkle', npcAnim: { sibling: 'jump', kid: 'sad' } } },
        { label: 'Lấy con gấu cũ của mình cho em',
          text: 'Bạn lôi con gấu cũ đã ôm ngủ suốt bao năm ra, đưa cho em. {sibling} tròn mắt, rồi ôm cả gấu lẫn bạn. Chiều hôm đó, bạn hiểu thương một người là sẵn lòng nhường cho họ thứ mình quý nhất.',
          effects: { happy: 6, karma: 6, rel: { sibling: 15 }, flag: 's_family_embe_thuong' },
          scene: { loc: 'home', anim: 'hug', fx: 'hearts', npcAnim: { sibling: 'hug', kid: 'idle' } } },
        { label: 'Bảo em: “Tự đi mà đòi, mít ướt thật”',
          text: '{sibling} khóc to hơn rồi chạy vào nhà. Tối đó em không chịu ngồi cạnh bạn ăn cơm. Nằm trên giường, bạn cứ nghĩ mãi về đôi mắt đỏ hoe của em.',
          effects: { happy: -4, karma: -2, rel: { sibling: -8 } },
          scene: { anim: 'shrug', npcAnim: { sibling: 'cry', kid: 'laugh' } } }
      ]
    },

    // ======================= ARC 3: MẸ GIÀ ỐM NẶNG (người chơi 30–65) =======================
    {
      id: 's_family_meom_dau_hieu', title: 'Bát canh mặn chát', icon: '🍲', age: [30, 65], weight: 1,
      req: { has: ['mother'], notFlag: 's_family_meom', cond: (s) => s.people.some((p) => p.alive && p.role === 'mother' && p.age >= 58) },
      text: 'Trưa Chủ nhật về ăn cơm với mẹ, bạn húp một ngụm canh chua thì mặn chát. {mother.K} cười, nhưng nụ cười méo hẳn một bên, giọng líu ríu: “Mẹ... nêm... hơi tay.” Đôi đũa trong tay mẹ rơi xuống đất lần thứ hai.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'eat', expr: 'scared',
        npcs: [{ role: 'mother', anim: 'sick', expr: 'sick', say: 'Mẹ... không sao đâu...' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Gọi 115 ngay: méo miệng, nói ngọng là đột quỵ',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Xe cấp cứu đến trong mười lăm phút. Bác sĩ bảo nhờ đưa vào kịp “giờ vàng” nên mẹ giữ được tiếng nói, chỉ yếu tay phải. Bạn ngồi bệt ngoài hành lang, tay vẫn còn run.',
              effects: { happy: -4, karma: 4, money: -15000000, rel: { mother: 8 }, flag: ['s_family_meom', 's_family_meom_kip'], followUp: { id: 's_family_meom_chia_ca', delay: 0 } },
              scene: { loc: 'hospital', anim: 'sit', fx: 'sweat', npcAnim: { mother: 'sleep' } } },
            { text: 'Xe cấp cứu kẹt cứng giữa giờ tan tầm. Đến viện, bác sĩ lắc đầu: mẹ bị liệt nửa người bên phải, sẽ phải tập phục hồi rất lâu.',
              effects: { happy: -10, money: -15000000, rel: { mother: 5 }, flag: 's_family_meom', followUp: { id: 's_family_meom_chia_ca', delay: 0 } },
              scene: { loc: 'hospital', anim: 'cry', fx: 'tears', npcAnim: { mother: 'sleep' } } }
          ] },
        { label: 'Cạo gió, chích máu đầu ngón tay theo mẹo dân gian',
          text: 'Bạn nghe lời bà hàng xóm, cạo gió và chích máu đầu ngón tay cho mẹ. Hai tiếng sau mẹ lả đi, lúc đó mới gọi cấp cứu. Bác sĩ thở dài: “Sao không đưa vào sớm hơn?”',
          effects: { happy: -12, karma: -2, money: -15000000, rel: { mother: 2 }, flag: 's_family_meom', followUp: { id: 's_family_meom_chia_ca', delay: 0 } },
          scene: { loc: 'hospital', anim: 'cry', fx: 'tears', npcAnim: { mother: 'sleep' } } },
        { label: 'Tự chở mẹ đến viện bằng xe máy',
          outcomes: [
            { p: 0.6, text: 'Bạn ôm chặt mẹ ngồi phía trước, phóng như bay qua mấy con hẻm. Đến viện vẫn kịp giờ vàng, nhưng bác sĩ dặn lần sau phải gọi cấp cứu, vì ngồi xe máy rất nguy hiểm cho người đột quỵ.',
              effects: { happy: -5, health: -2, money: -12000000, rel: { mother: 8 }, flag: ['s_family_meom', 's_family_meom_kip'], followUp: { id: 's_family_meom_chia_ca', delay: 0 } },
              scene: { loc: 'hospital', anim: 'sit', fx: 'sweat', npcAnim: { mother: 'sleep' } } },
            { p: 0.4, text: 'Giữa đường mẹ lả đi, suýt ngã khỏi xe. Người đi đường xúm lại giúp gọi taxi. Đến viện muộn hơn dự tính, mẹ yếu hẳn nửa người.',
              effects: { happy: -10, money: -12000000, rel: { mother: 4 }, flag: 's_family_meom', followUp: { id: 's_family_meom_chia_ca', delay: 0 } },
              scene: { loc: 'street', anim: 'scared', fx: 'sweat', npcAnim: { mother: 'sick' } } }
          ] }
      ]
    },
    {
      id: 's_family_meom_chia_ca', title: 'Chiếc ghế xếp cạnh giường bệnh', icon: '🏥', age: [30, 70], chainOnly: true,
      req: { has: ['mother'] },
      text: 'Mẹ nằm khoa Thần kinh, ba người một giường, người nhà trải chiếu kín hành lang. Bác sĩ nói mẹ phải nằm viện cả tháng, sau đó tập phục hồi lâu dài, chi phí có thể lên tới {money:200000000}. Bạn nhìn chiếc ghế xếp, nhìn lịch làm việc, rồi nhìn mẹ.',
      scene: { loc: 'hospital', time: 'night', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'sleep' }, { role: 'doctor', anim: 'talk', say: 'Gia đình chuẩn bị tinh thần lâu dài nhé.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Lập nhóm Zalo chia ca với anh chị em', req: { has: ['sibling'] },
          text: 'Bạn lập nhóm Zalo “Trực mẹ”, dán bảng phân ca: ai trực đêm nào, ai đóng tiền đợt nào. Tuần đầu mọi thứ trơn tru. Sang tuần thứ hai, nhóm bắt đầu có những tin nhắn chỉ hiện chữ “đã xem”.',
          effects: { happy: -2, smarts: 2, flag: 's_family_meom_zalo', followUp: { id: 's_family_meom_bat_hoa', delay: 0 } },
          scene: { anim: 'phone', fx: 'question', npcAnim: { mother: 'sleep', doctor: 'nod' } } },
        { label: 'Xin nghỉ không lương, tự trực mỗi đêm',
          text: 'Một tháng ngủ ghế xếp, ăn cơm hộp, tắm vội trong nhà vệ sinh bệnh viện. Bạn sụt bốn cân, nhưng sáng nào mẹ mở mắt cũng thấy con ngồi đó.',
          effects: { health: -8, happy: -3, karma: 8, money: -20000000, rel: { mother: 15 }, followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
          scene: { anim: 'sit', fx: 'zzz', npcAnim: { mother: 'sleep', doctor: 'nod' } } },
        { label: 'Thuê người nuôi bệnh {money:500000} một ngày', req: { minMoney: 20000000 },
          text: 'Cô nuôi bệnh tay nghề cao, lật người, vỗ lưng, đút cháo đâu ra đấy. Bạn yên tâm đi làm, tối nào cũng ghé. Mẹ khen cô khéo, nhưng câu hỏi quen thuộc vẫn là: “Mai con có vào không?”',
          effects: { money: -15000000, happy: -1, rel: { mother: 4 }, followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
          scene: { anim: 'talk', fx: 'money', npcAnim: { mother: 'talk', doctor: 'idle' }, npcSay: { mother: 'Mai con có vào không?' } } },
        { label: 'Xin xuất viện sớm, tự học cách chăm ở nhà',
          outcomes: [
            { p: 0.5, text: 'Bạn học y tá cách cho ăn qua ống, tập vật lý trị liệu theo video hướng dẫn. Mẹ về nhà ăn ngon ngủ yên hơn hẳn, còn bạn thì kiệt sức.',
              effects: { health: -6, happy: 2, karma: 5, money: -5000000, rel: { mother: 10 }, followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
              scene: { loc: 'home', anim: 'cook', fx: 'steam', npcAnim: { mother: 'sit' } } },
            { p: 0.5, text: 'Về nhà được một tuần, mẹ sốt cao, lại phải nhập viện cấp cứu. Bác sĩ nhắc nhẹ: chưa đủ điều kiện mà về sớm thì khổ cả mẹ lẫn con.',
              effects: { happy: -6, health: -3, money: -25000000, rel: { mother: 3 }, followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { mother: 'sick', doctor: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_family_meom_bat_hoa', title: 'Bảng phân ca bỏ trống', icon: '💢', age: [30, 70], chainOnly: true,
      req: { has: ['mother', 'sibling'] },
      text: 'Ngày thứ mười lăm, {sibling.k} {sibling} mới ghé viện, đặt giỏ cam xuống rồi nói ngay ngoài hành lang: “Ai ở gần thì lo nhiều, tôi ở xa gửi tiền là được.” Bảng phân ca trên Zalo đã trống ba đêm liền. Mẹ nằm trong phòng, cửa khép hờ.',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'sibling', anim: 'talk', say: 'Ở xa thì gửi tiền là được rồi!' }, { role: 'mother', anim: 'sick' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Đề xuất: người xa góp tiền, người gần góp công',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn mở bảng tính trên điện thoại: ai ở xa góp nhiều tiền hơn, ai ở gần trực nhiều đêm hơn, cuối tháng công khai sao kê. {sibling.K} {sibling} đọc xong, gật đầu: “Ừ, thế là công bằng.”',
              effects: { happy: 4, smarts: 2, money: -30000000, rel: { sibling: 6 }, flag: 's_family_meom_hoa', followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
              scene: { anim: 'talk', fx: 'idea', npcAnim: { sibling: 'nod' }, npcSay: { sibling: 'Ừ, thế là công bằng.' } } },
            { text: '“Lại tính toán với nhau à?” {sibling.K} {sibling} đập bàn bỏ về. Từ đó mỗi người tự lo phần mình, gặp nhau ở viện cũng chỉ gật đầu cho có.',
              effects: { happy: -6, money: -40000000, rel: { sibling: -10 }, flag: 's_family_meom_ancha', followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { sibling: 'angry' } } }
          ] },
        { label: 'Nuốt cục tức, một mình gánh hết',
          text: 'Bạn lặng lẽ đóng hết tiền viện, trực luôn những đêm trống. Không ai cảm ơn. Chỉ có mẹ, mỗi lần tỉnh dậy, lại nắm tay bạn lâu hơn một chút.',
          effects: { money: -60000000, health: -5, happy: -4, karma: 8, rel: { mother: 10, sibling: -4 }, followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
          scene: { anim: 'sit', fx: 'sweat', npcAnim: { sibling: 'walk', mother: 'sleep' } } },
        { label: 'Cãi tay đôi ngay giữa hành lang',
          text: 'Hai anh em to tiếng, kể tội nhau từ chuyện chia tiền Tết mười năm trước. Y tá phải ra nhắc. Quay vào phòng, bạn thấy mẹ quay mặt vào tường, vai run run.',
          effects: { happy: -8, karma: -3, rel: { sibling: -15, mother: -5 }, flag: 's_family_meom_ancha', followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { sibling: 'angry', mother: 'cry' } } },
        { label: 'Đưa mọi người vào phòng, để mẹ tự nói',
          text: 'Mẹ thều thào từng chữ: “Mẹ... chỉ cần... các con... đừng cãi nhau.” Cả phòng lặng đi. Từ hôm đó, bảng phân ca không còn ô trống nào.',
          effects: { happy: 3, karma: 4, rel: { sibling: 8, mother: 8 }, flag: 's_family_meom_hoa', followUp: { id: 's_family_meom_ban_dat', delay: 1 } },
          scene: { anim: 'hug', fx: 'tears', npcAnim: { sibling: 'cry', mother: 'talk' }, npcSay: { mother: 'Các con... đừng cãi nhau.' } } }
      ]
    },
    {
      id: 's_family_meom_ban_dat', title: 'Mảnh vườn của mẹ', icon: '🌾', age: [31, 72], chainOnly: true,
      req: { has: ['mother'] },
      text: 'Một năm chạy chữa, tiền tiết kiệm đã cạn. Bác sĩ đề nghị một đợt điều trị mới ở viện tuyến trên, hết khoảng {money:300000000}. Cách nhanh nhất có đủ tiền là bán mảnh vườn ở quê đứng tên mẹ, nhưng mẹ lắc đầu nguầy nguậy: “Đất đó để dành cho các con, không bán.”',
      scene: { loc: 'countryside', time: 'day', weather: 'cloudy', anim: 'think', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'sit', say: 'Đất để dành cho các con, không bán!' }, { role: 'neighbor', gender: 'm', age: 52, anim: 'talk', say: 'Bán thì tôi trả giá cao nhất xóm.' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Thuyết phục mẹ bán đất để chữa bệnh',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn ngồi bên mẹ cả buổi chiều: “Đất mất còn mua lại được, mẹ thì chỉ có một.” Mẹ khóc, rồi run run ký giấy. Tiền bán đất vừa đủ cho đợt điều trị mới.',
              effects: { happy: 2, karma: 3, rel: { mother: 6 }, flag: 's_family_meom_bandat', followUp: { id: 's_family_meom_cuoi', delay: 1 } },
              scene: { anim: 'hug', fx: 'money', npcAnim: { mother: 'cry', neighbor: 'nod' } } },
            { text: 'Mẹ nhất quyết không ký: “Bán đất là mẹ nhịn ăn đến chết.” Bạn đành thôi, ôm mẹ mà lòng rối như tơ vò.',
              effects: { happy: -6, rel: { mother: -2 }, followUp: { id: 's_family_meom_cuoi', delay: 1 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { mother: 'angry', neighbor: 'shrug' } } }
          ] },
        { label: 'Vay ngân hàng, tự gánh nợ thay mẹ',
          text: 'Bạn ký hồ sơ vay {money:300000000}, trả dần mười năm. Mẹ không biết chuyện, chỉ thấy con đi làm về muộn hơn, ăn cơm vội hơn. Mảnh vườn vẫn xanh, còn bạn thì gầy rộc.',
          effects: { money: -300000000, happy: -5, health: -3, karma: 6, rel: { mother: 8 }, followUp: { id: 's_family_meom_cuoi', delay: 1 } },
          scene: { loc: 'office', anim: 'type', fx: 'sweat' } },
        { label: 'Họp anh chị em góp tiền, giữ đất cho mẹ', req: { has: ['sibling'] },
          outcomes: [
            { p: 0.5, text: 'Người góp nhiều kẻ góp ít, nhưng cuối cùng cũng đủ. Mẹ biết chuyện, khóc vì các con còn thương nhau.',
              effects: { money: -100000000, happy: 4, rel: { mother: 8, sibling: 6 }, followUp: { id: 's_family_meom_cuoi', delay: 1 } },
              scene: { anim: 'nod', fx: 'hearts', npcAnim: { mother: 'cry', neighbor: 'shrug' } } },
            { p: 0.5, text: 'Cuộc họp biến thành phiên tòa: ai góp bao nhiêu, ai được chia đất sau này. Cuối cùng chẳng ai góp đồng nào, chỉ thêm một vết rạn.',
              effects: { happy: -6, rel: { sibling: -10 }, flag: 's_family_meom_ancha', followUp: { id: 's_family_meom_cuoi', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { mother: 'sad', neighbor: 'shake' } } }
          ] },
        { label: 'Hỏi ý mẹ: chữa tiếp hay về quê dưỡng bệnh',
          text: 'Mẹ nắm tay bạn: “Mẹ già rồi, mẹ muốn ở nhà, nghe tiếng gà gáy, nhìn ra vườn.” Bạn chiều ý mẹ. Ngày nào cũng gọi video, cuối tuần nào cũng về.',
          effects: { happy: -2, karma: 4, rel: { mother: 12 }, flag: 's_family_meom_veque', followUp: { id: 's_family_meom_cuoi', delay: 1 } },
          scene: { anim: 'hug', fx: 'petals', npcAnim: { mother: 'nod', neighbor: 'idle' }, npcSay: { mother: 'Mẹ muốn ở nhà, nhìn ra vườn.' } } }
      ]
    },
    {
      id: 's_family_meom_cuoi', title: 'Những buổi chiều bên mẹ', icon: '🌅', age: [32, 75], chainOnly: true,
      req: { has: ['mother'] },
      text: 'Mẹ yếu đi nhiều, có hôm nhận ra bạn, có hôm gọi bạn bằng cái tên hồi còn đỏ hỏn. Chiều nay mẹ tỉnh táo lạ thường, đòi ngồi dậy chải tóc, rồi vỗ vỗ xuống mép giường: “Ngồi đây, mẹ dặn mấy câu.”',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'sit', expr: 'sick', say: 'Ngồi đây, mẹ dặn mấy câu.' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Nắm tay mẹ thật chặt, ngồi nghe mẹ dặn',
          outcomes: [
            { p: 0.6, text: 'Mẹ dặn các con phải thương nhau, dặn bạn bớt thức khuya, dặn cả chuyện cho con mèo nhà hàng xóm ăn. Rồi mẹ thiếp đi trên tay bạn và không thức dậy nữa. Gương mặt mẹ bình yên như đang mơ một giấc thật đẹp.',
              effects: { happy: -15, karma: 5, kill: 'mother', flag: 's_family_meom_tienme', followUp: { id: 's_family_meom_gio_dau', delay: 1 } },
              scene: { time: 'night', anim: 'cry', fx: 'tears', npcAnim: { mother: 'sleep' } } },
            { p: 0.4, text: 'Mẹ kể chuyện ngày xưa gánh hàng nuôi con, kể đến đâu cười đến đó. Vài tháng sau, mẹ đã đi được mấy bước với khung tập đi. Bác sĩ bảo đó là “phép màu của tình thương”.',
              effects: { happy: 10, rel: { mother: 12 }, flag: 's_family_meom_khoi' },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { mother: 'laugh' } } }
          ] },
        { label: 'Đẩy xe lăn đưa mẹ ra vườn ngắm hoàng hôn',
          outcomes: [
            { p: 0.5, text: 'Mẹ ngắm mặt trời lặn sau rặng tre, mỉm cười: “Đẹp quá con nhỉ.” Đêm đó mẹ ra đi nhẹ nhàng, có đủ các con cháu ở bên.',
              effects: { happy: -14, karma: 4, kill: 'mother', flag: 's_family_meom_tienme', followUp: { id: 's_family_meom_gio_dau', delay: 1 } },
              scene: { loc: 'countryside', anim: 'cry', fx: 'tears', npcAnim: { mother: 'sleep' } } },
            { p: 0.5, text: 'Gió vườn mát rượi, mẹ ăn hết một bát cháo rồi đòi thêm. Từ hôm đó mẹ khỏe dần lên từng chút, như cây rau được tưới đúng lúc.',
              effects: { happy: 9, rel: { mother: 10 }, flag: 's_family_meom_khoi' },
              scene: { loc: 'countryside', anim: 'laugh', fx: 'sparkle', npcAnim: { mother: 'eat' } } }
          ] },
        { label: 'Chuyển mẹ lên viện tuyến trên thử cách điều trị mới', req: { minMoney: 100000000 },
          success: { stat: 'money', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Đợt điều trị thành công ngoài mong đợi. Mẹ nói rõ hơn, tay cử động được, còn đòi về quê trồng lại luống rau. Tiền mất, nhưng mẹ còn.',
              effects: { money: -100000000, happy: 12, rel: { mother: 10 }, flag: 's_family_meom_khoi' },
              scene: { loc: 'hospital', anim: 'cheer', fx: 'sparkle', npcAnim: { mother: 'laugh' } } },
            { text: 'Mẹ không qua khỏi sau đợt điều trị. Bạn ngồi bên giường bệnh, nắm bàn tay lạnh dần, chỉ ước giá như đã để mẹ ở nhà thêm những ngày cuối.',
              effects: { money: -100000000, happy: -16, kill: 'mother', flag: 's_family_meom_tienme', followUp: { id: 's_family_meom_gio_dau', delay: 1 } },
              scene: { loc: 'hospital', anim: 'cry', fx: 'tears', npcAnim: { mother: 'sleep' } } }
          ] },
        { label: 'Bật máy ghi âm, xin mẹ kể chuyện ngày xưa',
          outcomes: [
            { p: 0.5, text: 'Mẹ kể chuyện quen bố, chuyện gánh khoai đi chợ huyện, chuyện ngày bạn chào đời. Một tuần sau mẹ ra đi. Đoạn ghi âm bốn tiếng ấy, nhiều năm sau bạn vẫn mở nghe mỗi khi nhớ mẹ.',
              effects: { happy: -12, smarts: 2, kill: 'mother', flag: 's_family_meom_tienme', followUp: { id: 's_family_meom_gio_dau', delay: 1 } },
              scene: { anim: 'phone', fx: 'tears', npcAnim: { mother: 'sleep' } } },
            { p: 0.5, text: 'Mẹ kể say sưa đến tối, kể xong còn bắt bạn hứa đăng lên “mạng” cho con cháu nghe. Từ hôm ấy mẹ ăn ngon ngủ yên, sức khỏe khá dần lên.',
              effects: { happy: 8, rel: { mother: 10 }, flag: 's_family_meom_khoi' },
              scene: { anim: 'laugh', fx: 'music', npcAnim: { mother: 'talk' } } }
          ] }
      ]
    },
    {
      id: 's_family_meom_gio_dau', title: 'Giỗ đầu của mẹ', icon: '🕯️', age: [33, 76], chainOnly: true,
      text: 'Tròn một năm ngày mẹ mất. Căn nhà lại đông người, mâm cỗ bày kín chiếu, khói hương nghi ngút trước di ảnh mẹ cười hiền. Chiếc áo len mẹ đan dở vẫn nằm trong giỏ, que đan cắm nguyên chỗ cũ.',
      scene: { loc: 'home', decor: 'funeral', time: 'day', weather: 'cloudy', anim: 'pray', expr: 'sad',
        npcs: [{ role: 'relative', gender: 'f', age: 62, anim: 'pray' }, { role: 'crowd', anim: 'sit' }], fx: 'smoke', shot: 'wide' },
      choices: [
        { label: 'Học đan, đan nốt chiếc áo của mẹ',
          text: 'Bạn mày mò xem video dạy đan suốt ba tháng, nối những mũi đan vụng về vào những mũi đan khéo léo của mẹ. Mùa đông năm ấy, bạn mặc chiếc áo đó, thấy ấm lạ thường.',
          effects: { happy: 6, karma: 3, smarts: 1 },
          scene: { anim: 'sit', fx: 'sparkle', npcAnim: { relative: 'nod' } } },
        { label: 'Hứa với anh chị em giữ nếp nhà như mẹ dặn', req: { has: ['sibling'] },
          text: 'Sau mâm cỗ, mấy anh em ngồi lại, hứa với nhau: giỗ Tết nhất định về đủ, có chuyện gì cũng nói thẳng với nhau. Tấm ảnh mẹ trên bàn thờ như đang mỉm cười.',
          effects: { happy: 6, karma: 4, rel: { sibling: 10 }, flag: 's_family_meom_hua' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { relative: 'clap' } } },
        { label: 'Mở lại đoạn ghi âm giọng mẹ',
          text: 'Giọng mẹ vang lên giữa nhà: “Con ăn cơm chưa?” Cả nhà lặng đi, rồi bà con kể cho nhau nghe những chuyện về mẹ mà bạn chưa từng biết.',
          effects: { happy: -3, karma: 2, rel: { all: 4 } },
          scene: { anim: 'phone', fx: 'tears', npcAnim: { relative: 'cry', crowd: 'sad' } } },
        { label: 'Bàn chuyện nhà cửa sau này', req: { has: ['sibling'] },
          text: 'Mâm cỗ chưa dọn, câu chuyện đã chuyển sang sổ đỏ: ai giữ nhà, ai thờ cúng. Chưa ai to tiếng, nhưng ai cũng đã có tính toán riêng. Bạn nhìn lên di ảnh mẹ, thấy lòng nặng trĩu.',
          effects: { happy: -4, followUp: { id: 's_family_tk_so_do', delay: 2 } },
          scene: { anim: 'think', fx: 'question', npcAnim: { relative: 'shake', crowd: 'talk' } } }
      ]
    },

    // ======================= ARC 4: CHIA THỪA KẾ NHÀ ĐẤT =======================
    {
      id: 's_family_tk_so_do', title: 'Cuốn sổ đỏ trên bàn thờ', icon: '📕', age: [35, 75], weight: 1,
      req: { has: ['sibling'], lacks: ['mother', 'father'], notFlag: 's_family_tk' },
      text: 'Đám giỗ bố mẹ vừa xong, {sibling.k} {sibling} lấy cuốn sổ đỏ trên bàn thờ xuống, đặt giữa mâm: căn nhà ba tầng trong hẻm, môi giới trả {money:4000000000}. {sibling.K} nói chắc nịch: “Mấy năm nay ai ở với bố mẹ? Nhà này phải là của tôi.”',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'think', expr: 'angry',
        npcs: [{ role: 'sibling', anim: 'point', say: 'Ai ở với bố mẹ thì người đó giữ nhà!' }, { role: 'relative', gender: 'm', age: 70, anim: 'shake', say: 'Từ từ, anh em cả mà...' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Đề nghị chia đều theo pháp luật',
          text: '“Không có di chúc thì chia đều theo luật,” bạn nói. Mặt {sibling.k} {sibling} tối sầm. Tuần sau, {sibling.k} gửi cho bạn ảnh chụp một tờ giấy viết tay, bảo đó là di chúc của bố.',
          effects: { happy: -3, flag: 's_family_tk', followUp: { id: 's_family_tk_di_chuc', delay: 0 } },
          scene: { anim: 'talk', fx: 'exclaim', npcAnim: { sibling: 'angry', relative: 'think' } } },
        { label: 'Nhường nhà cho {sibling.k}, giữ tình anh em',
          text: 'Bạn đẩy cuốn sổ đỏ về phía {sibling.k} {sibling}: “Anh em mình chỉ còn có nhau.” {sibling.K} sững người, rồi bật khóc như đứa trẻ. Bác họ vỗ vai bạn: “Bố mẹ mày dạy con khéo.”',
          effects: { karma: 12, happy: 2, rel: { sibling: 15 }, flag: ['s_family_tk', 's_family_tk_nhuong'], followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
          scene: { anim: 'hug', fx: 'sparkle', npcAnim: { sibling: 'cry', relative: 'clap' }, npcSay: { relative: 'Bố mẹ mày dạy con khéo.' } } },
        { label: 'Thuê luật sư, gửi đơn ra tòa',
          text: 'Bạn thuê luật sư, phí trả trước {money:50000000}. Giấy triệu tập của tòa gửi về đúng địa chỉ căn nhà. Từ hôm đó, nhóm Zalo gia đình im lặng như tờ.',
          effects: { money: -50000000, happy: -4, rel: { sibling: -15 }, flag: ['s_family_tk', 's_family_tk_kien'], followUp: { id: 's_family_tk_toa', delay: 1 } },
          scene: { loc: 'office', anim: 'type', fx: 'sweat', npcAnim: { sibling: 'angry', relative: 'facepalm' } } },
        { label: 'Giữ nhà làm nơi thờ chung, cho thuê tầng trệt',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn đề xuất: tầng trệt cho thuê mở quán cà phê, tiền thuê chia đều; tầng trên giữ làm nơi thờ bố mẹ, ai cũng có chìa khóa. Bác họ đập đùi khen phải, {sibling.k} {sibling} gật gù đồng ý.',
              effects: { money: 36000000, happy: 6, karma: 4, rel: { sibling: 8 }, flag: ['s_family_tk', 's_family_tk_hoa'], followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
              scene: { anim: 'clap', fx: 'idea', npcAnim: { relative: 'clap', sibling: 'nod' } } },
            { text: '“Cho thuê thì ai quản lý? Tiền ai giữ?” Cuộc họp chuyển sang cãi nhau xem... ai giữ chìa khóa. Không ai chịu ai.',
              effects: { happy: -5, rel: { sibling: -6 }, flag: 's_family_tk', followUp: { id: 's_family_tk_di_chuc', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { sibling: 'angry', relative: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_family_tk_di_chuc', title: 'Tờ di chúc viết tay', icon: '📝', age: [35, 78], chainOnly: true,
      req: { has: ['sibling'] },
      text: 'Buổi hòa giải ở nhà văn hóa khu phố. {sibling.K} {sibling} đặt lên bàn tờ giấy học trò viết tay: “Bố để lại căn nhà cho con...”, chữ ký run run, không công chứng, không người làm chứng. Bác tổ trưởng dân phố đẩy gọng kính, nhìn hai anh em mà thở dài.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'sibling', anim: 'point', say: 'Đây, chữ của bố rõ ràng!' }, { role: 'neighbor', gender: 'm', age: 66, anim: 'think', say: 'Giấy này chưa đủ pháp lý đâu...' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Chấp nhận tờ di chúc, coi như ý bố',
          text: 'Bạn nhìn nét chữ quen quen, không chắc thật hay giả, nhưng chọn tin: “Nếu bố muốn vậy thì vậy.” {sibling.K} {sibling} cúi đầu, không dám nhìn thẳng vào bạn.',
          effects: { karma: 8, happy: -2, rel: { sibling: 6 }, flag: 's_family_tk_nhuong', followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { sibling: 'sad', neighbor: 'nod' } } },
        { label: 'Đòi giám định chữ ký, đưa ra tòa',
          text: 'Bạn nộp đơn đề nghị giám định. {sibling.K} {sibling} đứng bật dậy: “Mày nghi tao làm giả à?” Cánh cửa nhà văn hóa đóng sầm. Vụ việc chính thức ra tòa.',
          effects: { happy: -5, money: -30000000, rel: { sibling: -15 }, flag: 's_family_tk_kien', followUp: { id: 's_family_tk_toa', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { sibling: 'angry', neighbor: 'facepalm' }, npcSay: { sibling: 'Mày nghi tao làm giả à?' } } },
        { label: 'Đề xuất: ai giữ nhà thì trả tiền phần còn lại',
          success: { stat: 'karma', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bác tổ trưởng gật gù: hợp tình hợp lý. {sibling.K} {sibling} giữ nhà, trả bạn {money:1500000000} chia làm ba đợt. Hai anh em ký biên bản, bắt tay nhau lần đầu sau nhiều tháng.',
              effects: { money: 1500000000, happy: 6, rel: { sibling: 6 }, flag: 's_family_tk_chia', followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
              scene: { anim: 'nod', fx: 'money', npcAnim: { sibling: 'nod', neighbor: 'clap' } } },
            { text: '{sibling.K} {sibling} chê bạn đòi cao, bạn chê {sibling.k} trả bèo. Buổi hòa giải kết thúc bằng câu: “Gặp nhau ở tòa!”',
              effects: { happy: -6, rel: { sibling: -10 }, flag: 's_family_tk_kien', followUp: { id: 's_family_tk_toa', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { sibling: 'point', neighbor: 'shake' } } }
          ] },
        { label: 'Đứng dậy bỏ về, không thèm tranh nữa',
          text: 'Bạn đứng dậy: “Giữ lấy mà ở, tôi không cần.” Bạn không kiện, cũng chẳng nghe máy {sibling.k} {sibling} suốt mấy năm liền. Căn nhà còn đó, mà anh em thì như người dưng.',
          effects: { happy: -6, karma: 2, rel: { sibling: -20 }, followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
          scene: { anim: 'walk', fx: 'anger', npcAnim: { sibling: 'shrug', neighbor: 'sad' } } }
      ]
    },
    {
      id: 's_family_tk_toa', title: 'Phiên tòa anh em', icon: '⚖️', age: [36, 80], chainOnly: true,
      req: { has: ['sibling'] },
      text: 'Phòng xử án lạnh ngắt. {sibling.K} {sibling} ngồi bàn bên kia, cạnh luật sư riêng, không liếc sang bạn lấy một lần. Kết quả giám định chữ ký đã có, thẩm phán chuẩn bị tuyên án. Phút cuối, luật sư của bạn thì thầm: “Vẫn còn cơ hội hòa giải tại tòa.”',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'sibling', anim: 'sit', expr: 'angry' }, { role: 'stranger', gender: 'f', age: 52, anim: 'talk', say: 'Hội đồng xét xử chuẩn bị tuyên án.' }, { role: 'police', anim: 'idle' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Ngồi im chờ tòa tuyên án',
          outcomes: [
            { p: 0.5, text: 'Tờ di chúc không hợp lệ, tòa tuyên chia đều. Trừ phí luật sư, bạn nhận {money:1800000000}. Bước ra khỏi tòa, bạn gọi với theo {sibling.k} {sibling}, nhưng người ấy đã lên taxi đi thẳng.',
              effects: { money: 1800000000, happy: -2, karma: -2, rel: { sibling: -25 }, flag: 's_family_tk_thang', followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
              scene: { anim: 'shrug', fx: 'money', npcAnim: { sibling: 'walk', stranger: 'nod' } } },
            { p: 0.5, text: 'Giám định kết luận chữ ký đúng là của bố. Tòa công nhận di chúc, bạn trắng tay, còn mất thêm {money:80000000} án phí và tiền luật sư. Cái mất lớn nhất thì không ghi trên giấy.',
              effects: { money: -80000000, happy: -10, rel: { sibling: -20 }, followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
              scene: { anim: 'facepalm', fx: 'heartbreak', npcAnim: { sibling: 'shrug', stranger: 'nod' } } }
          ] },
        { label: 'Bước sang bàn bên kia đề nghị hòa giải',
          success: { stat: 'karma', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bước sang: “Mình dừng ở đây đi. Bố mẹ mà thấy cảnh này chắc buồn lắm.” {sibling.K} {sibling} đỏ hoe mắt. Hai bên thỏa thuận chia nhà theo tỷ lệ sáu – bốn, rút đơn kiện.',
              effects: { money: 1200000000, happy: 6, karma: 6, rel: { sibling: 12 }, flag: 's_family_tk_chia', followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { sibling: 'cry', stranger: 'nod' } } },
            { text: '{sibling.K} {sibling} lạnh lùng: “Muộn rồi.” Tòa tuyên chia đều, mỗi người một nửa, nhưng chẳng ai thấy mình thắng.',
              effects: { money: 1500000000, happy: -6, rel: { sibling: -15 }, followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
              scene: { anim: 'sad', fx: 'money', npcAnim: { sibling: 'shake' }, npcSay: { sibling: 'Muộn rồi.' } } }
          ] },
        { label: 'Xin rút đơn, không theo nữa',
          text: 'Bạn đứng dậy xin rút đơn. Cả phòng xử ngạc nhiên. Bạn mất trắng tiền luật sư, nhưng đêm đó, lần đầu sau hai năm, bạn ngủ một mạch đến sáng.',
          effects: { money: -20000000, happy: 4, karma: 6, rel: { sibling: 6 }, followUp: { id: 's_family_tk_dam_cuoi', delay: 3 } },
          scene: { anim: 'walk', fx: 'sparkle', npcAnim: { sibling: 'think', stranger: 'shrug' } } }
      ]
    },
    {
      id: 's_family_tk_dam_cuoi', title: 'Tấm thiệp cưới của cháu', icon: '💌', age: [38, 85], chainOnly: true,
      req: { has: ['sibling'] },
      text: 'Mấy năm sau chuyện căn nhà, bạn nhận được thiệp cưới của đứa cháu ruột, con {sibling.k} {sibling}. Mặt sau có dòng chữ viết tay: “Về dự nhé, cháu nó nhắc hoài.” Giờ bạn đứng trước cổng hoa đỏ rực, phong bì trong túi áo, chân như dính chặt xuống đất.',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'sad',
        npcs: [{ role: 'sibling', anim: 'idle', say: 'Ơ... đến rồi à?' }, { role: 'crowd', anim: 'clap' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Bước tới ôm {sibling.k} một cái thật chặt',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Hai người ôm nhau giữa cổng hoa, mặc khách khứa nhìn. Không ai nhắc đến căn nhà nữa. Đêm đó, hai anh em cụng ly, kể chuyện hồi bé trèo cây ổi sau nhà bị ăn đòn.',
              effects: { happy: 12, karma: 5, rel: { sibling: 20 }, flag: 's_family_tk_hoa' },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { sibling: 'hug', crowd: 'clap' } } },
            { text: '{sibling.K} {sibling} đứng cứng đờ trong vòng tay bạn, rồi gượng gạo vỗ vai: “Vào ăn cỗ đi.” Vết rạn chưa lành, nhưng ít ra hai người đã chạm vào nhau.',
              effects: { happy: 3, rel: { sibling: 6 } },
              scene: { anim: 'hug', fx: 'sweat', npcAnim: { sibling: 'idle' }, npcSay: { sibling: 'Thôi... vào ăn cỗ đi.' } } }
          ] },
        { label: 'Mừng phong bì thật dày, ăn xong lặng lẽ về',
          text: 'Bạn bỏ vào phong bì {money:10000000}, ngồi bàn cuối, ăn vội rồi về. Hôm sau, đứa cháu nhắn cảm ơn kèm tấm ảnh cưới: “Lần sau ở lại chụp ảnh với cháu nha!”',
          effects: { money: -10000000, happy: 2, karma: 3, rel: { sibling: 4 } },
          scene: { anim: 'eat', fx: 'money', npcAnim: { sibling: 'wave' } } },
        { label: 'Xin micro lên sân khấu chúc mừng',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn kể chuyện ngày xưa hai anh em thay nhau cõng đứa cháu đi rước đèn Trung thu. Cả hội trường cười rồi khóc. {sibling.K} {sibling} lên sân khấu ôm bạn, nói nhỏ: “Cho tao xin lỗi.”',
              effects: { happy: 12, karma: 4, rel: { sibling: 18 }, flag: 's_family_tk_hoa' },
              scene: { anim: 'talk', fx: 'hearts', npcAnim: { sibling: 'hug', crowd: 'clap' }, npcSay: { sibling: 'Cho tao xin lỗi.' } } },
            { text: 'Bạn run tay, nói lắp, quên luôn tên cô dâu. Cả hội trường cười ồ. Nhưng {sibling.k} {sibling} cười to nhất, và đó là tiếng cười bạn đã chờ mấy năm.',
              effects: { happy: 6, looks: -1, rel: { sibling: 10 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { sibling: 'laugh', crowd: 'laugh' } } }
          ] },
        { label: 'Gửi phong bì nhờ người quen, quay xe về',
          text: 'Bạn gửi phong bì nhờ người bạn cùng quê rồi quay xe. Đi được nửa đường, bạn dừng lại bên lề, ngồi rất lâu. Có những cánh cửa, càng để lâu càng khó mở.',
          effects: { money: -5000000, happy: -6, rel: { sibling: -6 } },
          scene: { loc: 'street', time: 'night', anim: 'sad', fx: 'tears' } }
      ]
    },

    // ======================= ARC 5: MẸ CHỒNG – NÀNG DÂU / BỐ VỢ – CON RỂ =======================
    {
      id: 's_family_dau_me_chong', title: 'Mẹ chồng và bát cháo', icon: '🥣', age: [22, 45], weight: 1,
      req: { gender: 'f', married: true, has: ['child'], notFlag: 's_family_dau',
        cond: (s) => s.people.some((p) => p.alive && p.role === 'spouse' && p.gender === 'm') && s.people.some((p) => p.alive && p.role === 'child' && p.age <= 2) },
      text: 'Từ ngày bạn sinh con, mẹ chồng lên ở hẳn để “phụ một tay”. Sáng nay bạn bắt gặp bà đang nhai cơm rồi mớm cho đứa cháu bé bỏng, bên cạnh là chai nước cam thảo “cho mát ruột”. Bác sĩ nhi đã dặn đi dặn lại: tuyệt đối không được làm thế.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'point', expr: 'surprised',
        npcs: [{ role: 'relative', gender: 'f', age: 62, anim: 'talk', say: 'Ngày xưa mẹ nuôi chồng con thế đấy!' }, { role: 'baby', anim: 'idle' }, { role: 'spouse', anim: 'phone' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Mở video bác sĩ nhi, ngồi xem cùng bà',
          success: { stat: 'karma', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bà xem hết đoạn video, im lặng một lúc rồi gật gù: “Thời thế khác thật.” Từ đó bà vẫn chăm cháu, nhưng theo “sách mới”.',
              effects: { happy: 6, karma: 3, rel: { spouse: 4 }, flag: ['s_family_dau', 's_family_dau_hoa'], followUp: { id: 's_family_dau_ra_rieng', delay: 2 } },
              scene: { anim: 'talk', fx: 'idea', npcAnim: { relative: 'nod', spouse: 'nod' } } },
            { text: 'Bà đặt bát cơm xuống đánh cạch: “Mẹ nuôi ba đứa khôn lớn, giờ con dạy mẹ à?” Cả ngày hôm đó bà bỏ cơm. Tối, chồng bạn bị kẹp giữa như miếng chả trong ổ bánh mì.',
              effects: { happy: -6, rel: { spouse: -4 }, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { relative: 'angry', spouse: 'facepalm' }, npcSay: { relative: 'Giờ con dạy mẹ à?' } } }
          ] },
        { label: 'Đẩy cho {spouse} nói với mẹ',
          outcomes: [
            { p: 0.5, text: '{spouse} gãi đầu, nói với mẹ đúng một câu: “Mẹ ơi, bác sĩ bảo không nên.” rồi chuồn đi làm. Bà thở dài, nhưng con trai nói thì bà nghe.',
              effects: { happy: 3, rel: { spouse: 3 }, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 2 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { spouse: 'talk', relative: 'shrug' } } },
            { p: 0.5, text: '{spouse} nói khéo kiểu gì mà thành ra “vợ con chê mẹ lạc hậu”. Bà khóc, gọi điện về quê kể cho cả họ nghe.',
              effects: { happy: -8, rel: { spouse: -6 }, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'tears', npcAnim: { relative: 'cry', spouse: 'scared' } } }
          ] },
        { label: 'Im lặng, lén đổ chai nước cam thảo',
          text: 'Bạn chọn chiến tranh lạnh: lén đổ nước cam thảo, cất luôn bát của bà. Bà biết, bà không nói. Nhưng nồi canh tối hôm ấy mặn chát.',
          effects: { happy: -3, karma: -2, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 1 } },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { relative: 'angry', spouse: 'phone' } } },
        { label: 'Nhờ bà nấu cháo cá rô kiểu quê, xay nhuyễn đúng cách',
          text: 'Bạn khéo léo “nhờ” bà nấu cháo cá rô đồng kiểu quê, rồi xay nhuyễn theo đúng hướng dẫn bác sĩ. Bà nấu say sưa, cháu ăn sạch bát. Hai mẹ con lần đầu cười chung một chuyện.',
          effects: { happy: 7, karma: 4, rel: { spouse: 5 }, flag: ['s_family_dau', 's_family_dau_hoa'], followUp: { id: 's_family_dau_ra_rieng', delay: 2 } },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { relative: 'cook', baby: 'laugh', spouse: 'clap' } } }
      ]
    },
    {
      id: 's_family_dau_bo_vo', title: 'Bố vợ lên chơi... rồi ở luôn', icon: '👴', age: [24, 48], weight: 1,
      req: { gender: 'm', married: true, has: ['child'], notFlag: 's_family_dau',
        cond: (s) => s.people.some((p) => p.alive && p.role === 'spouse' && p.gender === 'f') && s.people.some((p) => p.alive && p.role === 'child' && p.age <= 10) },
      text: 'Bố vợ lên “chơi vài hôm” để phụ trông cháu, rồi ở luôn đã nửa năm. Ông quản nhà như quản đơn vị: 5 giờ sáng bật thời sự, cấm cháu xem điện thoại, và tối nào cũng hỏi: “Lương tháng này được bao nhiêu? Bao giờ mua nhà?”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'eat', expr: 'surprised',
        npcs: [{ role: 'relative', gender: 'm', age: 64, anim: 'talk', say: 'Bao giờ thì mua được nhà hả con?' }, { role: 'spouse', anim: 'eat' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Rủ bố vợ ra quán, nói chuyện đàn ông với nhau',
          success: { stat: 'happy', base: 0.4, scale: 0.3 },
          outcomes: [
            { text: 'Hai bố con ngồi quán vỉa hè, ba chai bia, một đĩa lạc. Ông kể ngày xưa cũng nghèo, cũng bị bố vợ hỏi y như vậy. Về đến nhà, ông vỗ vai bạn: “Cố lên, bố tin con.”',
              effects: { happy: 7, health: -1, rel: { spouse: 5 }, flag: ['s_family_dau', 's_family_dau_hoa'], followUp: { id: 's_family_dau_ra_rieng', delay: 2 } },
              scene: { loc: 'street', anim: 'drink', fx: 'music', npcAnim: { relative: 'drink', spouse: 'idle' }, npcSay: { relative: 'Cố lên, bố tin con.' } } },
            { text: 'Ông uống hai chai đã đỏ mặt, giảng cho bạn một bài dài về cách làm giàu từ nuôi heo. Bạn gật gù đến 11 giờ đêm, về còn bị vợ trách để bố uống nhiều.',
              effects: { happy: -3, health: -2, rel: { spouse: -4 }, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 1 } },
              scene: { loc: 'street', anim: 'facepalm', fx: 'zzz', npcAnim: { relative: 'talk', spouse: 'angry' } } }
          ] },
        { label: 'Cãi lại: “Con tự lo được, bố đừng can thiệp”',
          text: 'Mâm cơm im bặt. Ông đặt đũa xuống, đứng dậy vào phòng. Vợ bạn nhìn bạn như nhìn người lạ. Sáng hôm sau ông vẫn dậy lúc 5 giờ bật thời sự, nhưng không nói với bạn câu nào.',
          effects: { happy: -6, karma: -2, rel: { spouse: -10 }, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { relative: 'angry', spouse: 'angry' } } },
        { label: 'Nhường ông dạy cháu, mình tập trung kiếm tiền',
          text: 'Bạn nhận ra ông khó tính nhưng thương cháu thật: dạy cháu viết chữ đẹp, tập thể dục, nhặt rau. Bạn tăng ca nhiều hơn, về nhà đã thấy cháu ngủ ngoan.',
          effects: { happy: 2, money: 15000000, rel: { spouse: 4, child: -3 }, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 2 } },
          scene: { loc: 'office', anim: 'type', fx: 'money' } },
        { label: 'Lập bảng kế hoạch mua nhà, trình bày cho ông',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chiếu file Excel lên TV: thu nhập, tiết kiệm, lãi vay, năm năm nữa có nhà. Bố vợ đeo kính đọc từng dòng, gật gù: “Thằng này được.” Từ đó ông thôi hỏi lương.',
              effects: { happy: 6, smarts: 2, rel: { spouse: 6 }, flag: ['s_family_dau', 's_family_dau_hoa'], followUp: { id: 's_family_dau_ra_rieng', delay: 2 } },
              scene: { anim: 'point', fx: 'idea', npcAnim: { relative: 'nod', spouse: 'clap' }, npcSay: { relative: 'Thằng này được!' } } },
            { text: 'Ông chỉ vào ô lãi suất: “Tính sai rồi, lãi thả nổi cơ mà.” Ông đúng. Bạn đỏ mặt, cả nhà cố nhịn cười.',
              effects: { happy: -3, smarts: 2, flag: 's_family_dau', followUp: { id: 's_family_dau_ra_rieng', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'point', spouse: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_family_dau_ra_rieng', title: 'Ở chung hay ra riêng?', icon: '🏠', age: [24, 52], chainOnly: true,
      req: { married: true },
      text: 'Sống chung với {relative} bên nhà {spouse.k} đủ lâu để nếm đủ vị: có hôm ấm áp, có hôm ngột ngạt như nồi áp suất. Căn hộ cách đó năm cây số vừa rao cho thuê {money:8000000} một tháng. Đêm khuya, {spouse.K} {spouse} thì thầm: “Hay mình ra riêng?”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'sit', expr: 'neutral',
        npcs: [{ role: 'spouse', anim: 'talk', say: 'Hay là mình ra riêng nhé?' }, { role: 'relative', anim: 'sit' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Ra riêng, cuối tuần đưa cháu về thăm',
          outcomes: [
            { p: 0.6, text: 'Ngày dọn đi, {relative} đứng ở cửa dúi cho túi gạo với hũ mắm: “Có gì thì về.” Ra riêng rồi mới thấy nhớ tiếng gọi cháu ăn cơm. Chủ nhật nào cả nhà cũng về ăn bữa trưa.',
              effects: { happy: 7, money: -20000000, rel: { spouse: 6 }, flag: 's_family_dau_rarieng', followUp: { id: 's_family_dau_om', delay: 2 } },
              scene: { anim: 'hug', fx: 'sparkle', npcAnim: { relative: 'wave', spouse: 'laugh' }, npcSay: { relative: 'Có gì thì về nhé.' } } },
            { p: 0.4, text: '{relative} giận ra mặt: “Nuôi lớn rồi giờ bỏ đi!” Ngày dọn nhà, không ai ra tiễn. Căn hộ mới thoáng đãng, nhưng bữa cơm đầu tiên ăn mà nghẹn.',
              effects: { happy: -3, money: -20000000, rel: { spouse: -2 }, flag: 's_family_dau_rarieng', followUp: { id: 's_family_dau_om', delay: 2 } },
              scene: { anim: 'sad', fx: 'dust', npcAnim: { relative: 'angry', spouse: 'sad' } } }
          ] },
        { label: 'Ở lại, cả nhà họp lập “luật nhà” cho rõ',
          success: { stat: 'karma', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Cả nhà dán lên tủ lạnh tờ “quy ước”: chuyện nuôi con thì bố mẹ cháu quyết, chuyện bếp núc người lớn quyết, cuối tuần đi chơi chung. Nghe buồn cười, nhưng mà hiệu quả.',
              effects: { happy: 6, karma: 3, rel: { spouse: 6 }, flag: 's_family_dau_ochung', followUp: { id: 's_family_dau_om', delay: 2 } },
              scene: { anim: 'clap', fx: 'idea', npcAnim: { relative: 'nod', spouse: 'clap' } } },
            { text: 'Tờ quy ước dán được hai ngày thì bị gỡ xuống làm giấy lót nồi. Mọi chuyện vẫn như cũ, chỉ có thêm một chuyện để cãi.',
              effects: { happy: -5, rel: { spouse: -3 }, flag: 's_family_dau_ochung', followUp: { id: 's_family_dau_om', delay: 2 } },
              scene: { anim: 'facepalm', fx: 'steam', npcAnim: { relative: 'shrug', spouse: 'facepalm' } } }
          ] },
        { label: 'Mua nhà gần, “bát canh đưa sang vẫn còn nóng”', req: { minMoney: 1000000000 },
          text: 'Bạn dồn tiền mua căn nhà nhỏ cách đó đúng một con hẻm, gần đến mức bưng bát canh sang vẫn còn nóng. Ai cũng có không gian riêng, còn cháu thì có hai nhà để chạy qua chạy lại.',
          effects: { money: -1000000000, happy: 9, rel: { spouse: 8 }, asset: { add: { type: 'house', name: 'Nhà trong hẻm', value: 1000000000 } }, flag: 's_family_dau_rarieng', followUp: { id: 's_family_dau_om', delay: 2 } },
          scene: { loc: 'street', time: 'day', anim: 'cheer', fx: 'confetti', npcAnim: { spouse: 'cheer', relative: 'clap' } } },
        { label: 'Gạt đi: “Ở chung cho tiết kiệm”',
          text: 'Bạn chứng minh mỗi tháng tiết kiệm được {money:8000000}, lý lẽ chặt chẽ. {spouse.K} {spouse} im lặng quay mặt vào tường. Tiền thì để dành được thật, còn khoảng cách giữa hai vợ chồng thì xa thêm một chút.',
          effects: { money: 50000000, happy: -4, rel: { spouse: -8 }, flag: 's_family_dau_ochung', followUp: { id: 's_family_dau_om', delay: 2 } },
          scene: { anim: 'shrug', fx: 'money', npcAnim: { spouse: 'sad', relative: 'idle' } } }
      ]
    },
    {
      id: 's_family_dau_om', title: 'Khi người già trở bệnh', icon: '🩼', age: [26, 56], chainOnly: true,
      req: { married: true },
      text: '{relative} bị ngã gãy cổ xương đùi, phải nằm một chỗ ít nhất ba tháng. Bác sĩ dặn cần người túc trực. Anh chị em bên nhà {spouse.k} ai cũng bận, và mọi ánh mắt dần đổ dồn về phía bạn.',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'think', expr: 'sad',
        npcs: [{ role: 'relative', anim: 'sick', say: 'Thôi, để tôi tự lo được...' }, { role: 'spouse', anim: 'sad' }, { role: 'doctor', anim: 'talk', say: 'Cần người túc trực ít nhất ba tháng.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Xin nghỉ phép, tự tay chăm sóc',
          text: 'Ba tháng thay bỉm, đút cháo, xoa bóp. Một hôm {relative} nắm tay bạn, nói câu bạn chờ bao năm: “Con còn hơn con ruột.” Bạn chạy ra hành lang khóc một trận cho đã.',
          effects: { happy: 8, health: -4, karma: 10, rel: { spouse: 12 }, flag: 's_family_dau_thuong' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { relative: 'cry', spouse: 'hug' }, npcSay: { relative: 'Con còn hơn con ruột...' } } },
        { label: 'Góp tiền thuê người chăm', req: { minMoney: 30000000 },
          text: 'Bạn thuê người chăm chuyên nghiệp, chiều nào cũng ghé thăm. {relative} được chăm kỹ lưỡng, nhưng hay hỏi: “Sao hôm nay không thấy sang?”',
          effects: { money: -30000000, happy: 2, rel: { spouse: 4 } },
          scene: { anim: 'talk', fx: 'money', npcAnim: { relative: 'talk', spouse: 'nod' } } },
        { label: 'Đón về ở cùng nhà mình', req: { flag: 's_family_dau_rarieng' },
          text: 'Bạn dọn phòng làm việc thành phòng ngủ, đón {relative} về. Nhà chật hơn, ồn hơn, nhưng tối nào cũng có tiếng kể chuyện cổ tích cho cháu. Những va chạm năm xưa tự nhiên nhỏ lại.',
          effects: { happy: 6, karma: 8, money: -10000000, rel: { spouse: 10 }, flag: 's_family_dau_thuong' },
          scene: { loc: 'home', anim: 'hug', fx: 'hearts', npcAnim: { relative: 'laugh', spouse: 'hug' } } },
        { label: 'Nhắc khéo: “Hồi xưa có ai thương con đâu”',
          text: 'Câu nói buột ra rồi không rút lại được. {relative} quay mặt đi. {spouse.K} {spouse} gắt: “Lúc nào rồi mà còn tính sổ?” Bạn vẫn chăm, nhưng bữa cơm nào cũng như có một chiếc gai.',
          effects: { happy: -6, karma: -4, rel: { spouse: -10 } },
          scene: { anim: 'shrug', fx: 'anger', npcAnim: { relative: 'sad', spouse: 'angry' } } }
      ]
    },

    // ======================= ARC 6: CON TUỔI TEEN NỔI LOẠN (người chơi 38–60, con 13–18) =======================
    {
      id: 's_family_teen_net', title: 'Năm buổi vắng mặt', icon: '🎮', age: [38, 60], weight: 1.2,
      req: { has: ['child'], notFlag: 's_family_teen', cond: (s) => s.people.some((p) => p.alive && p.role === 'child' && p.age >= 13 && p.age <= 18) },
      text: 'Cô chủ nhiệm gọi: “Tuần này cháu {child} nghỉ học năm buổi, phụ huynh có biết không?” Bạn chết lặng, vì sáng nào con cũng đeo cặp ra khỏi nhà đúng giờ. 10 giờ đêm, bạn tìm thấy con trong quán net cuối phố, tai nghe đeo lệch, mắt đỏ kè dán vào màn hình.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'child', anim: 'type', say: 'Đợi con hết trận này đã!' }, { role: 'crowd', anim: 'type' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Rút phích cắm, lôi con về ngay',
          text: 'Màn hình tắt phụt giữa trận. Cả quán quay lại nhìn. Con đứng dậy, mặt tái đi vì xấu hổ, theo bạn về mà không nói một lời. Tối đó bạn tịch thu điện thoại, cắt luôn wifi.',
          effects: { happy: -4, rel: { child: -15 }, flag: ['s_family_teen', 's_family_teen_cam'], followUp: { id: 's_family_teen_bo_nha', delay: 0 } },
          scene: { anim: 'point', fx: 'anger', npcAnim: { child: 'angry', crowd: 'scared' } } },
        { label: 'Kéo ghế ngồi xuống: “Game gì thế, chỉ xem với”',
          outcomes: [
            { p: 0.6, text: 'Con sững người, rồi ngập ngừng giải thích luật chơi. Bạn thua liền ba trận, con bật cười lần đầu sau nhiều tháng. Trên đường về, con kể chuyện bị cả nhóm bạn cô lập, chỉ trong game mới có “đồng đội”.',
              effects: { happy: 5, rel: { child: 12 }, flag: ['s_family_teen', 's_family_teen_dong'], followUp: { id: 's_family_teen_giai_dau', delay: 0 } },
              scene: { anim: 'type', fx: 'stars', npcAnim: { child: 'laugh' } } },
            { p: 0.4, text: 'Con nhìn bạn như nhìn người ngoài hành tinh: “Thôi, về thì về, đừng làm con quê.” Ít ra con chịu về, không cãi nửa câu.',
              effects: { happy: 1, rel: { child: 3 }, flag: ['s_family_teen', 's_family_teen_dong'], followUp: { id: 's_family_teen_giai_dau', delay: 1 } },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { child: 'facepalm' } } }
          ] },
        { label: 'Đứng chờ hết trận, về nhà rồi nói chuyện',
          success: { stat: 'karma', base: 0.4, scale: 0.35 },
          outcomes: [
            { text: 'Bạn đứng chờ, không quát. Hết trận, con tự tháo tai nghe đi ra. Về nhà, hai người nói chuyện đến 1 giờ sáng: con mất gốc môn Toán, sợ bị chê nên trốn học.',
              effects: { happy: 4, karma: 3, rel: { child: 10 }, flag: ['s_family_teen', 's_family_teen_dong'], followUp: { id: 's_family_teen_giai_dau', delay: 1 } },
              scene: { loc: 'home', anim: 'talk', fx: 'idea', npcAnim: { child: 'sad' } } },
            { text: 'Hết trận này con lại vào trận khác, như thể bạn không hề đứng đó. Cơn giận nén cả tối bùng lên ở nhà, và mọi chuyện thành ra còn tệ hơn.',
              effects: { happy: -5, rel: { child: -8 }, flag: ['s_family_teen', 's_family_teen_cam'], followUp: { id: 's_family_teen_bo_nha', delay: 0 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { child: 'type' } } }
          ] },
        { label: 'Chụp ảnh gửi nhóm Zalo đại gia đình',
          text: 'Bạn chụp ảnh con trong quán net, gửi nhóm Zalo họ hàng: “Các bác xem cháu đây!” Hai chục người vào thả biểu tượng phẫn nộ. Con đọc được, xóa luôn tài khoản và khóa trái cửa phòng.',
          effects: { happy: -3, karma: -3, rel: { child: -18 }, flag: ['s_family_teen', 's_family_teen_cam'], followUp: { id: 's_family_teen_bo_nha', delay: 0 } },
          scene: { anim: 'phone', fx: 'flash', npcAnim: { child: 'angry' } } }
      ]
    },
    {
      id: 's_family_teen_bo_nha', title: 'Căn phòng trống', icon: '🚪', age: [38, 62], chainOnly: true,
      req: { has: ['child'] },
      text: 'Sáng ra, phòng của {child} trống trơn, chăn gấp gọn, trên bàn để lại mẩu giấy: “Con đi đây. Đừng tìm.” Điện thoại con tắt máy. Bạn gọi hết bạn bè của con, chạy xe khắp các quán net, đến tối vẫn bặt vô âm tín.',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'run', expr: 'scared',
        npcs: [{ role: 'police', anim: 'talk', say: 'Anh chị bình tĩnh, cho tôi xin ảnh cháu.' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Đăng bài tìm con lên Facebook',
          outcomes: [
            { p: 0.6, text: 'Bài đăng được chia sẻ hai nghìn lượt. Nửa đêm, chủ một nhà nghỉ ở ngoại thành gọi điện: con đang ở đó cùng hai đứa bạn. Bạn lao đến, ôm chầm lấy con, không mắng nửa lời.',
              effects: { happy: 4, rel: { child: 8 }, flag: 's_family_teen_tim', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
              scene: { anim: 'hug', fx: 'tears', npcAnim: { police: 'nod' } } },
            { p: 0.4, text: 'Bài đăng bị chia sẻ khắp nơi, kèm hàng trăm bình luận phán xét “cha mẹ kiểu gì”. Hai ngày sau con tự về, đọc được hết, và càng thu mình hơn.',
              effects: { happy: -6, rel: { child: -6 }, followUp: { id: 's_family_teen_la_thu', delay: 3 } },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { police: 'shrug' } } }
          ] },
        { label: 'Trình báo công an phường',
          text: 'Công an phường trích xuất camera, lần ra con đang ở nhà một người bạn ở quận bên. Bạn đến đón, con cúi gằm mặt. Anh công an dặn: “Về nhà nói chuyện với nhau, đừng đánh cháu.”',
          effects: { happy: 2, karma: 2, rel: { child: 4 }, followUp: { id: 's_family_teen_la_thu', delay: 3 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { police: 'talk' }, npcSay: { police: 'Về nói chuyện với nhau, đừng đánh cháu.' } } },
        { label: 'Nhắn vào Zalo của con một lời xin lỗi',
          text: '“Bố mẹ sai rồi. Con về đi, mình nói chuyện.” Ba tiếng sau tin nhắn hiện “đã xem”. Năm tiếng sau, con đứng trước cổng, mắt đỏ hoe. Hai bên ôm nhau ngay giữa hẻm.',
          effects: { happy: 6, karma: 4, rel: { child: 12 }, flag: 's_family_teen_dong', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
          scene: { time: 'dawn', weather: 'clear', anim: 'hug', fx: 'hearts', npcAnim: { police: 'idle' } } }
      ]
    },
    {
      id: 's_family_teen_giai_dau', title: 'Giải đấu của con', icon: '🏆', age: [38, 62], chainOnly: true,
      req: { has: ['child'] },
      text: '{child} rụt rè đưa bạn tờ đăng ký: đội game của con vào chung kết giải học sinh toàn thành phố, thi đúng tuần kiểm tra học kỳ. “Đội vô địch được học bổng {money:20000000}. Cho con đi nhé?”',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'child', anim: 'talk', say: 'Cho con đi thi đi mà!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đồng ý, còn đi cổ vũ cùng con',
          outcomes: [
            { p: 0.4, text: 'Bạn ngồi khán đài cầm tấm bảng cổ vũ tự vẽ, hét to nhất hội trường. Đội con vô địch! Con chạy xuống ôm bạn trước cả nghìn người.',
              effects: { happy: 12, money: 20000000, rel: { child: 15 }, flag: 's_family_teen_ok', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
              scene: { loc: 'university', anim: 'cheer', fx: 'confetti', npcAnim: { child: 'jump' } } },
            { p: 0.6, text: 'Đội con thua ở trận cuối. Con khóc, bạn dắt con đi ăn ốc, kể chuyện mình từng thi trượt. Con nói nhỏ: “Lần đầu có người đứng về phía con.”',
              effects: { happy: 4, rel: { child: 12 }, flag: 's_family_teen_ok', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
              scene: { loc: 'street', time: 'night', anim: 'eat', fx: 'hearts', npcAnim: { child: 'cry' } } }
          ] },
        { label: 'Ra điều kiện: thi học kỳ trên 7 điểm',
          outcomes: [
            { p: 0.5, text: 'Con cày đề đến 2 giờ sáng, thi học kỳ xong là lao đi thi game. Điểm trung bình 7,4, đội vào top 3. Bạn thấy con lớn lên trông thấy.',
              effects: { happy: 8, rel: { child: 8 }, flag: 's_family_teen_ok', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
              scene: { anim: 'clap', fx: 'levelup', npcAnim: { child: 'cheer' } } },
            { p: 0.5, text: 'Con được 6,8 điểm, thiếu đúng 0,2. Bạn giữ lời, con ở nhà. Con giận mấy hôm, nhưng cũng hiểu: lời hứa là lời hứa.',
              effects: { happy: -2, rel: { child: -4 }, followUp: { id: 's_family_teen_la_thu', delay: 3 } },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { child: 'sad' } } }
          ] },
        { label: 'Cấm tuyệt đối, học là trên hết',
          text: 'Bạn xé tờ đăng ký. Con không cãi, chỉ lặng lẽ về phòng. Cả học kỳ đó con học đều, điểm khá, nhưng không còn kể với bạn chuyện gì nữa.',
          effects: { happy: -3, rel: { child: -12 }, flag: 's_family_teen_cam', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { child: 'sad' } } },
        { label: 'Tìm hiểu nghề game thủ, cùng con lập kế hoạch',
          text: 'Bạn thức mấy đêm đọc về thể thao điện tử, hỏi cả người quen làm ở công ty game. Hai người thống nhất: học xong lớp 12, thử sức một năm, không thành thì thi ngành thiết kế game.',
          effects: { happy: 6, smarts: 3, rel: { child: 14 }, flag: 's_family_teen_ok', followUp: { id: 's_family_teen_la_thu', delay: 3 } },
          scene: { anim: 'type', fx: 'idea', npcAnim: { child: 'nod' } } }
      ]
    },
    {
      id: 's_family_teen_la_thu', title: 'Lá thư trên gối', icon: '✉️', age: [40, 66], chainOnly: true,
      req: { has: ['child'] },
      text: 'Mấy năm đã trôi qua kể từ đêm ở quán net. Tối nay, bạn tìm thấy trên gối mình một lá thư tay của {child}, nét chữ xiêu vẹo y như hồi con học lớp Một: “Gửi người mà hồi đó con giận nhất...”',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'child', anim: 'shrug', say: 'Đọc xong đừng khóc nha!' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Đọc tiếp: “...và cũng là người hiểu con nhất”', req: { flag: 's_family_teen_ok' },
          text: 'Con viết về đêm quán net năm nào, về khán đài có người hét to nhất, về những lần bạn đứng về phía con khi cả thế giới quay lưng. Bạn đọc đến đâu, nước mắt rơi đến đó.',
          effects: { happy: 14, karma: 4, rel: { child: 15 } },
          scene: { anim: 'cry', fx: 'hearts', npcAnim: { child: 'hug' } } },
        { label: 'Đọc tiếp: “...con đã từng rất giận”', req: { flag: 's_family_teen_cam' },
          text: 'Con viết thật lòng: những năm ấy con thấy mình bị kiểm soát, bị bêu riếu, không ai chịu nghe. Nhưng giờ con hiểu bố mẹ chỉ sợ mất con. Cuối thư là dòng chữ: “Mình làm lại từ đầu nhé?”',
          effects: { happy: 8, smarts: 2, rel: { child: 12 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { child: 'hug' } } },
        { label: 'Chưa đọc xong đã chạy sang ôm con',
          text: 'Bạn bỏ dở lá thư, chạy sang phòng con. Hai người ôm nhau, chẳng cần nói gì nhiều. Đứa trẻ nổi loạn ngày nào giờ đã cao hơn bạn cả cái đầu.',
          effects: { happy: 10, rel: { child: 10 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { child: 'hug' } } },
        { label: 'Cất lá thư vào két, giả vờ như chưa đọc',
          text: 'Bạn cất lá thư vào két sắt, cạnh sổ đỏ và giấy khai sinh của con. Sáng hôm sau ăn sáng như thường, nhưng con thấy mắt bạn sưng húp thì cười tủm tỉm.',
          effects: { happy: 6, rel: { child: 5 } },
          scene: { loc: 'home', time: 'dawn', anim: 'eat', fx: 'sparkle', npcAnim: { child: 'laugh' } } }
      ]
    },

    // ======================= TRUYỆN LẺ =======================
    {
      id: 's_family_gio_hop', title: 'Cuộc họp sau mâm giỗ', icon: '📒', age: [30, 75], weight: 0.9, once: false, cooldown: 4,
      text: 'Giỗ cụ tổ, cả họ tụ về nhà bác trưởng. Mâm cỗ vừa dọn, bác gõ chén: “Nhà thờ họ dột nát rồi, mỗi nhà góp {money:20000000} để sửa. Ai có ý kiến gì không?” Cả gian nhà im phăng phắc, chỉ nghe tiếng quạt trần kẽo kẹt.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'relative', gender: 'm', age: 72, anim: 'talk', say: 'Mỗi nhà góp 20 triệu nhé!' }, { role: 'relative', gender: 'f', age: 55, anim: 'shake', say: 'Nhà em dạo này khó lắm bác ơi...' }, { role: 'crowd', anim: 'sit' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Góp luôn, góp cả phần nhà cô Út khó khăn', req: { minMoney: 40000000 },
          text: 'Bạn đặt phong bì {money:40000000} lên mâm: “Phần nhà cô Út, con góp luôn.” Cô Út rưng rưng, bác trưởng gật gù ghi sổ, cả họ nhìn bạn bằng ánh mắt khác hẳn.',
          effects: { money: -40000000, karma: 8, happy: 5 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { relative: 'clap', crowd: 'clap' } } },
        { label: 'Xin làm thủ quỹ, công khai từng đồng',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn lập bảng tính online, chụp hóa đơn từng bao xi măng, gửi vào nhóm Zalo dòng họ. Lần đầu tiên tiền họ minh bạch, ai cũng yên tâm góp. Bác trưởng phong bạn là “bộ trưởng tài chính” của họ.',
              effects: { money: -20000000, smarts: 2, happy: 6, karma: 4 },
              scene: { anim: 'type', fx: 'levelup', npcAnim: { relative: 'clap' } } },
            { text: 'Bảng tính của bạn có một công thức sai, lệch mất {money:3000000}. Cả họ xì xào suốt ba tháng, bạn đành bỏ tiền túi bù vào cho êm.',
              effects: { money: -23000000, happy: -5 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'shake' } } }
          ] },
        { label: 'Đứng lên đề nghị góp theo khả năng',
          outcomes: [
            { p: 0.6, text: '“Nhà nào khá góp nhiều, nhà nào khó góp ít, ai không có tiền thì góp công.” Bác trưởng ngẫm một lúc rồi gật đầu. Cô Út nắm tay bạn cảm ơn mãi.',
              effects: { money: -10000000, karma: 6, happy: 3 },
              scene: { anim: 'talk', fx: 'idea', npcAnim: { relative: 'nod', crowd: 'clap' } } },
            { p: 0.4, text: 'Bác trưởng đỏ mặt: “Cháu định dạy bác chia tiền à?” Cả họ im lặng. Năm sau đám giỗ, chỗ ngồi của bạn bị xếp xuống mâm cuối.',
              effects: { money: -20000000, happy: -5, karma: 2 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { relative: 'angry' } } }
          ] },
        { label: 'Lấy cớ nghe điện thoại, lẻn ra ngoài',
          text: 'Bạn cầm điện thoại ra sân “nghe máy”, đứng nửa tiếng giữa trời nắng. Quay vào thì cuộc họp đã xong, phần của bạn được chốt hẳn {money:30000000}, vì “nhà nó ở thành phố, khá giả nhất”.',
          effects: { money: -30000000, happy: -4 },
          scene: { loc: 'street', anim: 'phone', fx: 'sweat', npcAnim: { relative: 'point' } } }
      ]
    },
    {
      id: 's_family_bao_hiem', title: 'Sổ tiết kiệm hóa bảo hiểm', icon: '📄', age: [28, 62], weight: 0.9,
      req: { has: ['father'], cond: (s) => s.people.some((p) => p.alive && p.role === 'father' && p.age >= 55) },
      text: '{father.K} {father} khoe: ra ngân hàng gửi tiết kiệm {money:200000000}, được cô nhân viên “tư vấn thêm gói lãi cao hơn”. Bạn đọc tờ giấy bố mang về: hợp đồng bảo hiểm liên kết đầu tư, đóng {money:50000000} mỗi năm trong 15 năm, rút trước hạn thì mất gần hết.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'facepalm', expr: 'surprised',
        npcs: [{ role: 'father', anim: 'talk', say: 'Lãi cao hơn gửi tiết kiệm đấy con!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Đưa bố ra ngân hàng hủy trong 21 ngày cân nhắc',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn đọc kỹ điều khoản: vẫn còn trong 21 ngày cân nhắc. Hai bố con kiên nhẫn ngồi ở ngân hàng suốt buổi sáng, hợp đồng được hủy, tiền về đủ. Bố lẩm bẩm: “Thế mà nó bảo bố là gửi tiết kiệm.”',
              effects: { happy: 6, smarts: 2, rel: { father: 8 } },
              scene: { loc: 'office', anim: 'nod', fx: 'sparkle', npcAnim: { father: 'facepalm' }, npcSay: { father: 'Thế mà nó bảo là gửi tiết kiệm...' } } },
            { text: 'Bố giấu tờ hợp đồng gần hai tháng mới đưa, đã quá hạn cân nhắc. Hủy bây giờ chỉ lấy lại được một phần nhỏ. Bạn ôm đầu, còn bố ngồi lặng thinh như đứa trẻ có lỗi.',
              effects: { happy: -6, rel: { father: 3 } },
              scene: { loc: 'office', anim: 'facepalm', fx: 'sweat', npcAnim: { father: 'sad' } } }
          ] },
        { label: 'Mắng bố một trận vì cả tin',
          text: 'Bạn lỡ to tiếng: “Bố có đọc hợp đồng không vậy?” Bố im lặng, đặt tờ giấy xuống rồi ra hiên ngồi một mình. Câu nói ấy, bạn hối hận cả tuần.',
          effects: { happy: -5, karma: -3, rel: { father: -12 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { father: 'sad' } } },
        { label: 'Đóng tiếp giúp bố cho khỏi mất trắng',
          text: 'Bạn tính đi tính lại, thấy hủy thì mất nhiều, đành gánh tiếp mỗi năm một phần. Bố áy náy, cứ dúi tiền lương hưu cho bạn “góp vào”.',
          effects: { money: -25000000, happy: -2, karma: 3, rel: { father: 6 } },
          scene: { anim: 'shrug', fx: 'money', npcAnim: { father: 'bow' } } },
        { label: 'Viết bài bóc phốt lên Facebook',
          outcomes: [
            { p: 0.5, text: 'Bài viết lan truyền chóng mặt, hàng trăm người kể chuyện y hệt. Ngân hàng gọi điện xin gặp và đồng ý hủy hợp đồng cho bố. Bố đọc bình luận cả đêm, lần đầu thấy mình không đơn độc.',
              effects: { happy: 8, karma: 2, rel: { father: 6 } },
              scene: { anim: 'type', fx: 'flash', npcAnim: { father: 'clap' } } },
            { p: 0.5, text: 'Bài viết được vài chục lượt thích rồi chìm nghỉm. Ngân hàng trả lời bằng văn bản ba trang toàn thuật ngữ. Bố bảo: “Thôi con, coi như bố đóng học phí.”',
              effects: { happy: -4, rel: { father: 4 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { father: 'shrug' }, npcSay: { father: 'Coi như bố đóng học phí.' } } }
          ] }
      ]
    },
    {
      id: 's_family_no_anh_em', title: 'Khoản nợ “tháng sau trả”', icon: '💸', age: [28, 65], weight: 1, once: false, cooldown: 4,
      req: { has: ['sibling'] },
      text: 'Ba năm trước, {sibling.k} {sibling} vay {money:80000000} để “xoay vốn ba tháng”, đến giờ chưa trả đồng nào. Chiều nay {sibling.k} ghé chơi, dựng chiếc xe tay ga mới cóng trước cửa, vừa vào nhà đã khoe: “Xe mới đấy, trả góp có mấy chục triệu thôi!”',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'angry',
        npcs: [{ role: 'sibling', anim: 'laugh', say: 'Xe mới đấy, đẹp không?' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Nhắc khéo: “Xe đẹp ghê, chắc sắp trả nợ được rồi nhỉ?”',
          outcomes: [
            { p: 0.4, text: '{sibling.K} {sibling} khựng lại, đỏ mặt, rồi chuyển khoản ngay {money:20000000}: “Trả trước một ít, tháng sau trả tiếp.” Lần này, tháng sau có trả tiếp thật.',
              effects: { money: 20000000, happy: 4, rel: { sibling: 2 } },
              scene: { anim: 'nod', fx: 'money', npcAnim: { sibling: 'phone' } } },
            { p: 0.6, text: '{sibling.K} {sibling} cười trừ: “Từ từ, anh em mà tính toán gì.” Rồi dắt xe về luôn, bỏ dở cốc trà còn nóng.',
              effects: { happy: -5, rel: { sibling: -5 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { sibling: 'walk' }, npcSay: { sibling: 'Anh em mà tính toán gì!' } } }
          ] },
        { label: 'Nói thẳng, đòi viết giấy hẹn trả',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn lấy giấy bút, ghi rõ mỗi tháng trả {money:5000000}, hai bên cùng ký. {sibling.K} {sibling} ấm ức nhưng vẫn ký. Một năm sau, khoản nợ được trả đủ, và lạ thay, hai người lại thân hơn.',
              effects: { money: 60000000, happy: 5, rel: { sibling: 3 } },
              scene: { anim: 'point', fx: 'money', npcAnim: { sibling: 'nod' } } },
            { text: '{sibling.K} {sibling} đập bàn: “Có mấy chục triệu mà làm như chủ nợ!” rồi bỏ về. Tết năm đó, hai nhà ngồi hai đầu mâm.',
              effects: { happy: -6, rel: { sibling: -15 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { sibling: 'angry' } } }
          ] },
        { label: 'Xóa nợ, coi như quà tặng',
          text: 'Bạn nói nhẹ: “Khoản đó thôi, coi như quà. Nhưng lần sau đừng vay nữa nhé.” {sibling.K} {sibling} lặng người, rồi ôm chầm lấy bạn. Bạn mất tiền, nhưng tối đó ngủ ngon hơn hẳn.',
          effects: { karma: 8, happy: 2, rel: { sibling: 10 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { sibling: 'hug' } } },
        { label: 'Giữ chìa khóa xe: “Cho mượn một tháng, coi như trả lãi”',
          text: 'Bạn cười tươi, rút chìa khóa khỏi ổ. {sibling.K} {sibling} há hốc mồm mà không cãi được câu nào. Cuối tháng, khoản nợ được chuyển đủ, kèm lời năn nỉ xin lại chiếc xe.',
          effects: { money: 80000000, happy: 8, karma: -1, rel: { sibling: -4 } },
          scene: { loc: 'street', anim: 'drive', fx: 'money', npcAnim: { sibling: 'facepalm' } } }
      ]
    },
    {
      id: 's_family_tim_nguoi_than', title: 'Vết bớt hình chiếc lá', icon: '🍃', age: [24, 45], weight: 0.6,
      text: 'Bạn lớn lên với câu chuyện mẹ kể mỗi dịp giỗ chạp: hồi bạn còn quá nhỏ để nhớ, nhà có một đứa con bị lạc ở chợ Tết năm lên ba, tìm mãi không thấy. Hôm nay, một người lạ nhắn tin qua nhóm “Tìm người thân thất lạc”, hẹn bạn ra quán cà phê, tay run run cầm tấm ảnh vết bớt hình chiếc lá sau gáy, đúng như lời mẹ tả.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', age: 33, anim: 'sit', say: 'Mình... có thể là người nhà của bạn.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đề nghị đi xét nghiệm ADN',
          outcomes: [
            { p: 0.4, text: 'Kết quả ADN: trùng khớp. {stranger} và bạn ôm nhau khóc ngay giữa phòng xét nghiệm. Bao nhiêu năm lạc nhau, giờ bạn có thêm một người ruột thịt, và cả một câu chuyện dài để kể suốt mấy đêm liền.',
              effects: { happy: 15, karma: 4, money: -5000000, addPerson: { role: 'sibling', fromScene: 'stranger' }, flag: 's_family_timthay' },
              scene: { loc: 'hospital', anim: 'hug', fx: 'tears', npcAnim: { stranger: 'hug' } } },
            { p: 0.6, text: 'Kết quả ADN: không cùng huyết thống. {stranger} cúi đầu cảm ơn rồi lại tiếp tục hành trình tìm kiếm. Hai người vẫn giữ liên lạc, coi nhau như bạn.',
              effects: { happy: -2, karma: 3, money: -5000000, addPerson: { role: 'friend', fromScene: 'stranger' } },
              scene: { loc: 'hospital', anim: 'sad', fx: 'sparkle', npcAnim: { stranger: 'bow' } } }
          ] },
        { label: 'Hỏi những chi tiết chỉ người nhà mới biết',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn hỏi: “Hồi đó nhà mình nuôi con gì?” Người ấy đáp ngay: “Con chó vàng tên Mực, cụt nửa cái đuôi.” Bạn bật khóc. Lần gặp sau, ai nhìn cũng bảo hai người giống nhau như đúc.',
              effects: { happy: 14, addPerson: { role: 'sibling', fromScene: 'stranger' }, flag: 's_family_timthay' },
              scene: { anim: 'cry', fx: 'hearts', npcAnim: { stranger: 'cry' } } },
            { text: 'Người kia trả lời ấp úng, rồi xin chuyển trước “chút tiền thuốc men cho mẹ nuôi”. Bạn nhận ra mình suýt bị lừa, lặng lẽ báo cáo bài viết.',
              effects: { happy: -4, smarts: 2 },
              scene: { anim: 'shake', fx: 'exclaim', npcAnim: { stranger: 'walk' } } }
          ] },
        { label: 'Chuyển tiền giúp người ấy như lời nhờ',
          outcomes: [
            { p: 0.3, text: 'Người ấy dùng tiền về quê lấy tấm ảnh cũ ố vàng chụp cả nhà năm xưa. Không cần ADN, chỉ nhìn tấm ảnh là đủ. Bạn có thêm một người ruột thịt.',
              effects: { happy: 12, money: -5000000, addPerson: { role: 'sibling', fromScene: 'stranger' }, flag: 's_family_timthay' },
              scene: { anim: 'hug', fx: 'tears', npcAnim: { stranger: 'hug' } } },
            { p: 0.7, text: 'Nhận {money:5000000} xong, tài khoản kia chặn bạn. Công an bảo đây là chiêu quen: đọc bài tìm người thân rồi nhận vơ. Bạn mất tiền, mất luôn một niềm hy vọng.',
              effects: { happy: -8, money: -5000000 },
              scene: { anim: 'facepalm', fx: 'heartbreak', npcAnim: { stranger: 'walk' } } }
          ] },
        { label: 'Đứng dậy bỏ về, sợ vỡ mộng',
          text: 'Bạn xin lỗi rồi đi về, không dám nghe thêm. Có những hy vọng, cứ giữ nguyên là hy vọng thì dễ chịu hơn. Thỉnh thoảng, bạn vẫn mở lại tấm ảnh vết bớt ấy.',
          effects: { happy: -3 },
          scene: { loc: 'street', anim: 'walk', fx: 'question', npcAnim: { stranger: 'sad' } } }
      ]
    }
  );
})();
