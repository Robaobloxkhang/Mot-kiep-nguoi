/* events_early.js — Một Kiếp Người: tình huống tuổi thơ & tuổi teen (0–17). Mọi id có tiền tố 'c_'. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(

    // ───────────────────────── EM BÉ 0–2 ─────────────────────────
    {
      id: 'c_first_word', title: 'Tiếng gọi đầu đời', icon: '🗣️', age: [1, 2], weight: 1.5,
      text: 'Cả nhà quây quanh bạn. Mẹ dỗ “Gọi mẹ đi con”, bố chen vào “Gọi bố, gọi bố!”. Hai người đã cá cược một chầu chè xem bạn gọi ai trước.',
      scene: { loc: 'home', time: 'day', anim: 'laugh', fx: 'question', shot: 'close',
        npcs: [ { role: 'mother', anim: 'talk', say: 'Mẹ… mẹ… gọi mẹ đi con!' }, { role: 'father', anim: 'point', say: 'Bố! Bố mới đúng!' } ] },
      choices: [
        { label: '“Mẹ!”', text: 'Mẹ ôm chầm lấy bạn, mắt rưng rưng. Bố lủi thủi đi mua chè trả nợ.',
          effects: { happy: 5, rel: { mother: 8, father: 2 } },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { mother: 'hug', father: 'facepalm' }, npcSay: { mother: 'Con gọi mẹ rồi kìa!' } } },
        { label: '“Bố!”', text: 'Bố nhảy cẫng lên như vừa trúng số, gọi điện khoe khắp họ hàng. Mẹ hơi dỗi nhưng vẫn cười.',
          effects: { happy: 5, rel: { father: 8, mother: 2 } },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { father: 'cheer', mother: 'shrug' }, npcSay: { father: 'Thắng rồi! Chè đâu!' } } },
        { label: '“Măm măm!”', text: 'Từ đầu tiên của bạn là… đòi ăn. Cả nhà cười nghiêng ngả: đúng là có thực mới vực được đạo.',
          effects: { happy: 7, health: 2, rel: { mother: 3, father: 3 } },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { all: 'laugh' } } }
      ]
    },

    {
      id: 'c_first_steps', title: 'Những bước chân đầu tiên', icon: '👣', age: [0, 2], weight: 1.5,
      text: 'Bạn bám mép bàn đứng chênh vênh, hai chân run như cầy sấy. Ở đầu kia phòng khách, mẹ dang tay chờ, bố cầm điện thoại sẵn sàng quay lại khoảnh khắc lịch sử.',
      scene: { loc: 'home', time: 'day', anim: 'idle', fx: 'exclaim', shot: 'low',
        npcs: [ { role: 'mother', anim: 'wave', say: 'Lại đây với mẹ nào!' }, { role: 'father', anim: 'phone', say: 'Đang quay nè, đi đi con!' } ] },
      choices: [
        { label: 'Buông tay, bước tới!',
          success: { stat: 'health', base: 0.5, scale: 0.4 },
          outcomes: [
            { text: 'Một bước, hai bước… bạn lao thẳng vào lòng mẹ! Video bố quay được cả họ thả tim.',
              effects: { happy: 6, health: 3, rel: { mother: 4, father: 4 } },
              scene: { anim: 'laugh', fx: 'confetti', npcAnim: { mother: 'hug', father: 'cheer' } } },
            { text: 'Tới bước thứ hai thì bạn ngồi phịch xuống. Khóc một chút, rồi lại đòi đứng dậy.',
              effects: { happy: -1, health: 1 },
              scene: { anim: 'cry', fx: 'dust', npcAnim: { mother: 'hug' }, npcSay: { mother: 'Không sao, làm lại nào!' } } }
          ] },
        { label: 'Thôi, bò cho chắc', text: 'Bạn bò với tốc độ ánh sáng tới chỗ mẹ. Bố tắt máy quay, thở dài: “Tuần sau làm lại”.',
          effects: { happy: 3 },
          scene: { anim: 'crawl', fx: 'dust', npcAnim: { father: 'facepalm', mother: 'laugh' } } }
      ]
    },

    {
      id: 'c_thoi_noi', title: 'Thôi nôi bốc đồ', icon: '🎂', age: [0, 1], weight: 2,
      text: 'Tiệc thôi nôi của bạn! Trên mâm đỏ bày đủ thứ: cây bút, tờ tiền, cái micro đồ chơi, ống nghe bác sĩ. Cả họ nín thở chờ xem bạn bốc gì để đoán nghề tương lai.',
      scene: { loc: 'home', time: 'day', decor: 'birthday', anim: 'crawl', fx: 'sparkle', shot: 'top',
        npcs: [ { role: 'mother', anim: 'clap' }, { role: 'father', anim: 'cheer' }, { role: 'relative', anim: 'point', say: 'Bốc cây bút đi cháu!' } ] },
      choices: [
        { label: 'Bốc cây bút', text: 'Bà con tấm tắc: “Sau này học giỏi, làm thầy làm cô!”. Bố mẹ cười không khép được miệng.',
          effects: { smarts: 3, happy: 3, flag: 'boc_but' },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { all: 'clap' } } },
        { label: 'Bốc tờ tiền', text: 'Cả nhà hò reo: “Sau này làm giàu nuôi bố mẹ!”. Bạn nhét luôn tờ tiền vào miệng.',
          effects: { happy: 3, money: 200000, flag: 'boc_tien' },
          scene: { anim: 'laugh', fx: 'money', npcAnim: { father: 'cheer', relative: 'laugh' } } },
        { label: 'Bốc cái micro', text: 'Bạn cầm micro hét “Aaa!” rõ to. Một ông chú phán: “Ca sĩ tương lai đây rồi!”.',
          effects: { happy: 4, looks: 1, flag: 'boc_micro' },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { relative: 'clap', mother: 'laugh' } } },
        { label: 'Bò thẳng tới ống nghe', text: 'Bạn quàng ống nghe lên cổ mẹ. Một bà cô họ chắp tay: “Mai mốt làm bác sĩ cứu người”.',
          effects: { karma: 3, smarts: 2, flag: 'boc_ongnghe' },
          scene: { anim: 'crawl', fx: 'sparkle', npcAnim: { mother: 'love', relative: 'nod' } } }
      ]
    },

    {
      id: 'c_teething', title: 'Sốt mọc răng', icon: '🦷', age: [0, 2],
      text: 'Chiếc răng sữa đầu tiên đang nhú lên, bạn sốt hầm hập và quấy suốt từ chiều. Mẹ bế bạn đi đi lại lại trong phòng, tay không ngừng chườm khăn ấm.',
      scene: { loc: 'bedroom', time: 'night', anim: 'cry', expr: 'sick', fx: 'sweat', shot: 'close',
        npcs: [ { role: 'mother', anim: 'walk', say: 'Ngoan nào, mẹ thương…' } ] },
      choices: [
        { label: 'Khóc thật to cho cả xóm biết', text: 'Bạn khóc tới nửa đêm. Hàng xóm gõ cửa hỏi thăm, mẹ thức trắng nhưng chẳng một lời than.',
          effects: { health: -3, happy: -3, rel: { mother: 5 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'sad' } } },
        { label: 'Gặm ngón tay mẹ cho đỡ ngứa', text: 'Bạn ngoạm ngón tay mẹ, chiếc răng nhú cắn đau điếng. Mẹ nhăn mặt rồi bật cười: con mình có răng rồi!',
          effects: { health: 1, happy: 3, rel: { mother: 3 } },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { mother: 'laugh' }, npcSay: { mother: 'Á! Có răng thật rồi!' } } },
        { label: 'Lả đi ngủ trong vòng tay mẹ',
          outcomes: [
            { p: 0.7, text: 'Cơn sốt hạ dần. Sáng ra bạn tỉnh dậy cười toe, khoe chiếc răng bé xíu.',
              effects: { health: 2, happy: 2 }, scene: { anim: 'sleep', fx: 'zzz', time: 'dawn' } },
            { p: 0.3, text: 'Sáng ra bạn sốt cao hơn, mẹ phải bế đi viện. Bác sĩ bảo không sao, chỉ cần theo dõi thêm.',
              effects: { health: -2, rel: { mother: 3 } }, scene: { loc: 'hospital', time: 'day', anim: 'sleep', npcAnim: { mother: 'talk' } } }
          ] }
      ]
    },

    {
      id: 'c_vaccine', title: 'Mũi tiêm chủng', icon: '💉', age: [0, 2], weight: 1.2,
      text: 'Hôm nay là lịch tiêm chủng. Phòng chờ trạm y tế đầy những đứa bé khóc ré, và giờ đến lượt bạn. {doctor.K} {doctor} cầm kim tiêm, mỉm cười thật hiền.',
      scene: { loc: 'hospital', time: 'day', anim: 'idle', fx: 'question', shot: 'close',
        npcs: [ { role: 'doctor', gender: 'f', anim: 'talk', say: 'Một chút xíu thôi nha con!' }, { role: 'mother', anim: 'idle', say: 'Có mẹ đây rồi.' } ] },
      choices: [
        { label: 'Khóc to nhất phòng', text: 'Bạn gào to tới mức mấy đứa bé khác im bặt vì sợ. Mẹ được tặng thêm viên kẹo để dỗ bạn.',
          effects: { happy: -2, health: 4 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { doctor: 'laugh', mother: 'hug' } } },
        { label: 'Nhìn chằm chằm vào kim tiêm',
          outcomes: [
            { p: 0.5, text: 'Bạn không khóc một tiếng! Bác sĩ khen “Dũng cảm quá!” và mẹ kể đi kể lại suốt cả tuần.',
              effects: { happy: 4, health: 4, rel: { mother: 3 } },
              scene: { anim: 'laugh', fx: 'stars', npcAnim: { doctor: 'clap' } } },
            { p: 0.5, text: 'Bạn im lặng ba giây… rồi oà khóc muộn màng. Cả phòng bật cười.',
              effects: { health: 4, happy: -1 },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { all: 'laugh' } } }
          ] },
        { label: 'Cười toe với bác sĩ', text: 'Bác sĩ bối rối vì lần đầu được em bé cười trước khi tiêm. Mũi tiêm xong lúc nào không hay.',
          effects: { health: 4, happy: 2, karma: 1 },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { doctor: 'laugh' }, npcSay: { doctor: 'Bé này dễ thương ghê!' } } }
      ]
    },

    {
      id: 'c_night_cry', title: 'Ca sĩ ba giờ sáng', icon: '🌙', age: [0, 2], weight: 1.2,
      text: 'Ba giờ sáng, bạn tỉnh giấc và quyết định đây là lúc thích hợp để… biểu diễn. Bố mẹ lờ đờ ngồi dậy, mắt thâm như gấu trúc.',
      scene: { loc: 'bedroom', time: 'night', anim: 'cry', fx: 'music', shot: 'wide',
        npcs: [ { role: 'mother', anim: 'sit', expr: 'sleepy' }, { role: 'father', anim: 'think', expr: 'sleepy', say: 'Ba giờ sáng rồi con ơi…' } ] },
      choices: [
        { label: 'Khóc tiếp, khóc to hơn', text: 'Bố phải bế bạn đi vòng vòng quanh nhà tới sáng. Hôm sau bố ngủ gục ở chỗ làm.',
          effects: { happy: 1, health: -1, rel: { father: -1 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { father: 'walk' }, npcExpr: { father: 'sleepy' } } },
        { label: 'Nghe mẹ ru rồi ngủ', text: 'Giọng ru của mẹ nhỏ dần, bạn ngủ say lúc nào không hay. Mẹ cũng ngủ gục ngay bên cạnh.',
          effects: { health: 3, happy: 3, rel: { mother: 4 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { mother: 'talk', father: 'sleep' }, npcSay: { mother: 'Ầu ơ… con ngủ cho ngoan…' } } },
        { label: 'Cười khanh khách một mình', text: 'Bạn nhìn lên trần nhà cười khanh khách như đang thấy ai đó. Bố mẹ nổi da gà, bật hết đèn trong nhà.',
          effects: { happy: 3 },
          scene: { anim: 'laugh', fx: 'question', npcAnim: { mother: 'scared', father: 'scared' } } }
      ]
    },

    {
      id: 'c_baby_market', title: 'Em bé đi chợ', icon: '🧺', age: [0, 2],
      text: 'Mẹ bế bạn đi chợ sáng. Tới sạp nào các cô bán hàng cũng nựng má, khen bạn bụ bẫm, còn dúi cho mẹ nắm rau thơm “cho em bé”.',
      scene: { loc: 'market', time: 'dawn', anim: 'idle', fx: 'hearts', shot: 'wide',
        npcs: [ { role: 'mother', anim: 'walk' }, { role: 'vendor', gender: 'f', anim: 'talk', say: 'Ui, em bé bụ bẫm quá trời!' }, { role: 'crowd', anim: 'walk' } ] },
      choices: [
        { label: 'Cười tít mắt với cô bán hàng', text: 'Cô bán cá mê bạn quá, bớt cho mẹ hẳn mười nghìn. Mẹ bảo từ nay đi chợ phải mang bạn theo.',
          effects: { happy: 4, looks: 1, rel: { mother: 3 } },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { vendor: 'love', mother: 'laugh' } } },
        { label: 'Túm tóc cô bán hàng', text: 'Bạn túm một nắm tóc cô bán rau không chịu buông. Mẹ xin lỗi rối rít, cô cười xoà: “Con nít mà!”.',
          effects: { happy: 2, karma: -1 },
          scene: { anim: 'laugh', fx: 'sweat', npcAnim: { vendor: 'scared', mother: 'bow' } } },
        { label: 'Khóc vì chợ ồn quá', text: 'Tiếng rao, tiếng xe, tiếng cò kè… bạn khóc thét. Mẹ mua vội mớ rau rồi bế bạn về.',
          effects: { happy: -2 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'hug', vendor: 'shrug' } } }
      ]
    },

    {
      id: 'c_baby_lullaby', title: 'Trưa hè tiếng ru', icon: '🎐', age: [0, 2],
      text: 'Buổi trưa hè, {grandparent.k} {grandparent} vừa đưa võng vừa ru bạn bằng những câu hát xưa. Chiếc quạt nan phe phẩy, tiếng ve kêu râm ran ngoài ngõ.',
      scene: { loc: 'home', time: 'day', anim: 'sleep', fx: 'music', shot: 'close',
        npcs: [ { role: 'grandparent', anim: 'sit', say: 'Ầu ơ… ngủ đi cháu ơi…' } ] },
      choices: [
        { label: 'Ngủ ngon lành', text: 'Bạn ngủ một mạch tới chiều, má đỏ hây hây. {grandparent.K} ngồi canh cả buổi không rời.',
          effects: { health: 3, happy: 3, rel: { grandparent: 5 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { grandparent: 'sit' } } },
        { label: 'Mở mắt thao láo đòi chơi', text: '{grandparent.K} hết vốn bài hát, chuyển sang kể chuyện Tấm Cám. Bạn nghe say sưa dù chưa hiểu chữ nào.',
          effects: { smarts: 2, happy: 3, rel: { grandparent: 4 } },
          scene: { anim: 'laugh', fx: 'idea', npcAnim: { grandparent: 'talk' }, npcSay: { grandparent: 'Ngày xửa ngày xưa…' } } }
      ]
    },

    {
      id: 'c_baby_blackout', title: 'Cúp điện giữa trưa', icon: '🔌', age: [0, 2],
      text: 'Giữa trưa hè nóng như đổ lửa thì cả khu phố cúp điện. Quạt tắt phụt, bạn đỏ mặt khó chịu. Bố lục tìm cái quạt nan, mẹ lấy khăn ướt lau người cho bạn.',
      scene: { loc: 'home', time: 'day', anim: 'cry', fx: 'sweat', shot: 'wide',
        npcs: [ { role: 'father', anim: 'think', say: 'Cái quạt nan đâu rồi ta?' }, { role: 'mother', anim: 'talk', say: 'Nóng quá, tội con…' } ] },
      choices: [
        { label: 'Khóc ầm ĩ phản đối', text: 'Bố quạt tay liên tục ba tiếng đồng hồ, mỏi nhừ cả vai. Có điện lại, bố nằm vật ra sàn.',
          effects: { happy: -1, rel: { father: 3 } },
          scene: { anim: 'cry', fx: 'steam', npcAnim: { father: 'sit' }, npcFx: { father: 'sweat' } } },
        { label: 'Nằm im nghe bố kể chuyện', text: 'Trong căn nhà nhá nhem, bố kể chuyện ngày xưa bằng giọng đều đều. Bạn ngủ thiếp đi, mồ hôi lấm tấm trên trán.',
          effects: { happy: 2, health: 1, rel: { father: 5 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { father: 'talk', mother: 'sit' } } }
      ]
    },

    {
      id: 'c_baby_porridge', title: 'Giờ ăn dặm', icon: '🥣', age: [1, 2],
      text: 'Giờ ăn dặm. Mẹ múc thìa cháo cà rốt xay nhuyễn, giả tiếng máy bay “ù ù… há miệng nào!”. Bạn nhìn thìa cháo đầy nghi ngờ.',
      scene: { loc: 'home', time: 'day', anim: 'idle', fx: 'question', shot: 'close',
        npcs: [ { role: 'mother', anim: 'talk', say: 'Máy bay tới rồi, há miệng nào!' } ] },
      choices: [
        { label: 'Há miệng ăn ngon lành', text: 'Bạn ăn sạch bát cháo, mẹ vui như Tết. Cân tháng này lên hẳn nửa ký.',
          effects: { health: 5, happy: 2, rel: { mother: 3 } },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { mother: 'clap' } } },
        { label: 'Phun cháo vào mặt mẹ', text: 'Phụt! Mặt mẹ lấm tấm cà rốt. Mẹ ngồi im ba giây, rồi cả hai cùng phá lên cười.',
          effects: { happy: 5, health: -1 },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { mother: 'facepalm' }, npcSay: { mother: 'Trời ơi con tôi…' } } },
        { label: 'Mím chặt miệng, lắc đầu', text: 'Bạn quyết tâm tuyệt thực. Mẹ đành dùng chiêu cuối: bật hoạt hình. Thìa cháo lọt vào lúc bạn mải xem.',
          effects: { health: 2, happy: 1 },
          scene: { anim: 'idle', fx: 'question', npcAnim: { mother: 'shrug' } } }
      ]
    },

    // ── em bé đi đây đi đó: mỗi tình huống một khung cảnh khác cho đỡ chán ──
    {
      id: 'c_baby_park', title: 'Buổi sáng ở công viên', icon: '🌳', age: [0, 2],
      text: 'Sáng sớm, {father.k} {father} đẩy xe nôi đưa bạn ra công viên. Các cụ tập dưỡng sinh, đàn bồ câu sà xuống mổ thóc, một chú bán bong bóng xà phòng đang thổi những quả bong bóng óng ánh.',
      scene: { loc: 'park', time: 'dawn', anim: 'idle', fx: 'bubbles', shot: 'wide',
        npcs: [ { role: 'father', anim: 'walk', say: 'Hít thở không khí trong lành nào con!' }, { role: 'crowd', anim: 'dance' } ] },
      choices: [
        { label: 'Với tay bắt bong bóng', text: 'Bạn chộp mãi không được quả nào, bong bóng vỡ tách trên mũi. Bạn cười khanh khách, bố mua luôn một lọ về nhà.',
          effects: { happy: 6, rel: { father: 3 } },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { father: 'laugh' } } },
        { label: 'Đuổi theo đàn bồ câu', text: 'Bạn bò lổm ngổm về phía đàn bồ câu, chúng bay vụt lên trời. Bạn ngẩn người nhìn theo rất lâu, mắt sáng rỡ.',
          effects: { happy: 4, health: 2, smarts: 1 },
          scene: { anim: 'crawl', fx: 'exclaim', npcAnim: { father: 'run' } } },
        { label: 'Ngủ quên trong xe nôi', text: 'Gió mát, tiếng chim hót, bạn ngủ ngon lành. Bố ngồi ghế đá đọc báo, hiếm hoi lắm mới có một buổi sáng yên bình.',
          effects: { health: 3, happy: 2, rel: { father: 2 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { father: 'sit' } } }
      ]
    },

    {
      id: 'c_baby_beach', title: 'Lần đầu thấy biển', icon: '🏖️', age: [1, 2], weight: 1.2,
      text: 'Cả nhà đi biển mùa hè. Lần đầu tiên bạn thấy một vũng nước to đến vô tận, sóng ì oạp vỗ vào bờ, cát mịn lún dưới bàn chân bé xíu.',
      scene: { loc: 'beach', time: 'day', anim: 'idle', fx: 'question', shot: 'wide',
        npcs: [ { role: 'mother', anim: 'wave', say: 'Biển đó con! To không?' }, { role: 'father', anim: 'phone', say: 'Cười lên cho bố chụp nào!' } ] },
      choices: [
        { label: 'Lao ra đón sóng', text: 'Con sóng nhỏ ập tới làm bạn ngã ngửa, uống một ngụm nước mặn chát. Bạn khóc ré, rồi năm phút sau lại đòi ra tiếp.',
          effects: { happy: 4, health: 2, flag: 'baby_sea' },
          scene: { anim: 'swim', fx: 'bubbles', npcAnim: { mother: 'run', father: 'laugh' } } },
        { label: 'Ngồi xúc cát ăn thử', text: 'Bạn xúc một nắm cát cho vào miệng, nhăn mặt nhè ra. Mẹ hốt hoảng lau miệng, bố quay được cả đoạn, đăng lên nhóm gia đình.',
          effects: { happy: 3, health: -1, rel: { father: 2 } },
          scene: { anim: 'sit', fx: 'dust', npcAnim: { mother: 'scared', father: 'laugh' } } },
        { label: 'Sợ quá, ôm chặt cổ mẹ', text: 'Tiếng sóng ầm ào làm bạn sợ hãi, cả buổi chỉ chịu ngồi trên đùi mẹ dưới ô dù. Mẹ kiên nhẫn chỉ cho bạn từng con dã tràng.',
          effects: { happy: 1, smarts: 1, rel: { mother: 4 } },
          scene: { anim: 'idle', fx: 'sweat', npcAnim: { mother: 'hug' } } }
      ]
    },

    {
      id: 'c_baby_que', title: 'Về quê thăm ông bà', icon: '🐓', age: [0, 2], weight: 1.3,
      text: 'Cả nhà về quê. Sân gạch phơi thóc vàng óng, đàn gà con chạy lon ton, con trâu đứng nhai rơm ngoài ngõ. {grandparent.K} {grandparent} bế bạn đi khoe khắp xóm.',
      scene: { loc: 'countryside', time: 'day', anim: 'idle', fx: 'sparkle', shot: 'wide',
        npcs: [ { role: 'grandparent', anim: 'walk', say: 'Cháu nội nhà tôi đây, bụ chưa?' }, { role: 'neighbor', anim: 'clap', say: 'Ôi giống bố như đúc!' } ] },
      choices: [
        { label: 'Đòi sờ con trâu', text: 'Con trâu khịt mũi phì một cái, hơi nóng phả vào mặt. Bạn giật mình rồi cười khanh khách, cả xóm khen đứa nhỏ gan dạ.',
          effects: { happy: 5, health: 1, rel: { grandparent: 3 } },
          scene: { anim: 'laugh', fx: 'steam', npcAnim: { grandparent: 'laugh', neighbor: 'point' } } },
        { label: 'Đuổi theo đàn gà con', text: 'Bạn bò khắp sân đuổi gà, quần áo lấm lem đất cát. {grandparent.K} không mắng mà còn reo hò cổ vũ.',
          effects: { happy: 5, health: 3 },
          scene: { anim: 'crawl', fx: 'dust', npcAnim: { grandparent: 'cheer' } } },
        { label: 'Ngủ trên võng dưới gốc cau', text: 'Gió đồng mát rượi, tiếng võng kẽo kẹt. Bạn ngủ một giấc dài nhất từ lúc chào đời, {grandparent.k} ngồi quạt suốt buổi.',
          effects: { health: 4, happy: 2, rel: { grandparent: 5 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { grandparent: 'sit' } } }
      ]
    },

    {
      id: 'c_baby_chua', title: 'Lên chùa xin vía', icon: '🛕', age: [0, 1],
      text: 'Sáng rằm, {grandparent.k} {grandparent} bế bạn lên chùa xin vía cho cứng cáp, hay ăn chóng lớn. Khói hương nghi ngút, tiếng chuông chùa ngân nga.',
      scene: { loc: 'temple', time: 'dawn', anim: 'idle', fx: 'smoke', shot: 'wide',
        npcs: [ { role: 'grandparent', anim: 'pray', say: 'Cầu cho cháu hay ăn chóng lớn…' } ] },
      choices: [
        { label: 'Ngoan ngoãn im lặng', text: 'Suốt buổi lễ bạn không khóc tiếng nào, mắt tròn xoe nhìn tượng Phật. Sư thầy xoa đầu khen: “Đứa nhỏ có phúc”.',
          effects: { karma: 3, happy: 2, rel: { grandparent: 4 } },
          scene: { anim: 'idle', fx: 'sparkle', npcAnim: { grandparent: 'bow' } } },
        { label: 'Khóc vì khói hương cay mắt', text: 'Khói hương làm bạn cay mắt, oà khóc giữa chính điện. {grandparent.K} vội bế ra sân, mua cho bạn cái chong chóng giấy.',
          effects: { happy: 1, health: -1 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { grandparent: 'hug' } } },
        { label: 'Với tay túm đĩa oản', text: 'Bạn chộp lấy miếng oản trên mâm cúng. Mọi người bật cười: “Lộc Phật đấy, cho cháu ăn đi!”.',
          effects: { happy: 4, health: 1, karma: 1 },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { grandparent: 'laugh' } } }
      ]
    },

    {
      id: 'c_baby_storm', title: 'Đêm mưa giông', icon: '⛈️', age: [0, 2],
      text: 'Nửa đêm trời đổ giông. Sấm nổ đùng đoàng, mưa quất rào rào lên mái tôn, cửa sổ rung bần bật. Bạn giật mình tỉnh giấc giữa tiếng sét.',
      scene: { loc: 'bedroom', time: 'night', weather: 'storm', anim: 'cry', fx: 'exclaim', shot: 'close',
        npcs: [ { role: 'mother', anim: 'hug', say: 'Có mẹ đây, không sợ nha con.' } ] },
      choices: [
        { label: 'Rúc vào lòng mẹ', text: 'Mẹ ôm bạn thật chặt, khẽ hát một bài ru. Tiếng tim mẹ đập đều đều át cả tiếng sấm, bạn thiếp đi lúc nào không hay.',
          effects: { happy: 2, health: 1, rel: { mother: 5 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { mother: 'sit' } } },
        { label: 'Khóc át cả tiếng sấm', text: 'Bạn khóc to tới mức cả nhà phải dậy, bố bật đèn pin làm trò bóng tay trên tường để dỗ bạn.',
          effects: { happy: -1, rel: { father: 3, mother: 2 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'hug' } } },
        { label: 'Nhìn chớp lóe mà cười', text: 'Mỗi lần trời lóe sáng, bạn lại vỗ tay cười như xem pháo hoa. Mẹ vừa thương vừa buồn cười: “Con gan thế!”.',
          effects: { happy: 4, smarts: 1 },
          scene: { anim: 'laugh', fx: 'flash', npcAnim: { mother: 'laugh' } } }
      ]
    },

    {
      id: 'c_baby_tet', title: 'Cái Tết đầu đời', icon: '🧧', age: [0, 2], weight: 1.4,
      text: 'Tết đến, nhà đầy hoa đào, bánh chưng và họ hàng. Ai tới cũng giành bế bạn, nựng má, dúi bao lì xì đỏ vào tay. Bạn được mặc bộ áo dài bé xíu mẹ đặt may.',
      scene: { loc: 'home', time: 'day', decor: 'tet', anim: 'idle', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'relative', anim: 'talk', say: 'Chúc cháu hay ăn chóng lớn!' }, { role: 'mother', anim: 'clap' }, { role: 'grandparent', anim: 'love' } ] },
      choices: [
        { label: 'Cười với tất cả mọi người', text: 'Bạn cười toe với từng người, được lì xì dày cộp. Mẹ cất hết vào “quỹ cho con” — và bạn sẽ không bao giờ thấy lại số tiền đó.',
          effects: { happy: 4, money: 300000, rel: { grandparent: 3 } },
          scene: { anim: 'laugh', fx: 'money', npcAnim: { all: 'laugh' } } },
        { label: 'Xé bao lì xì', text: 'Bạn xé toạc bao lì xì đỏ, cười sằng sặc vì tiếng giấy rách. Ông bà bảo xé lộc là năm nay phát.',
          effects: { happy: 5, money: 100000 },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { grandparent: 'laugh' } } },
        { label: 'Khóc vì người lạ bế', text: 'Bị chuyền tay qua mười mấy người lạ, bạn khóc thét. Mẹ phải bế vào phòng trong, cả buổi Tết chỉ chịu theo mẹ.',
          effects: { happy: -2, rel: { mother: 4 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'hug', relative: 'shrug' } } }
      ]
    },

    {
      id: 'c_baby_trungthu', title: 'Trung thu đầu tiên', icon: '🏮', age: [1, 2],
      text: 'Đêm Trung thu, phố rực đèn lồng. Bố cõng bạn trên vai đi xem múa lân, tiếng trống “tùng tùng cắc” rộn rã. Mẹ cầm chiếc đèn ông sao bé xíu cho bạn.',
      scene: { loc: 'street', time: 'night', anim: 'idle', fx: 'sparkle', shot: 'wide',
        npcs: [ { role: 'father', anim: 'walk', say: 'Lân kìa con, lân kìa!' }, { role: 'crowd', anim: 'dance' }, { role: 'mother', anim: 'wave' } ] },
      choices: [
        { label: 'Vỗ tay theo tiếng trống', text: 'Bạn nhún nhảy theo nhịp trống trên vai bố. Ông lân sà xuống chớp mắt với bạn, cả đám đông vỗ tay.',
          effects: { happy: 6, rel: { father: 3 } },
          scene: { anim: 'dance', fx: 'music', npcAnim: { father: 'cheer', crowd: 'clap' } } },
        { label: 'Sợ ông lân, khóc thét', text: 'Cái đầu lân to tướng lao tới làm bạn sợ hết hồn. Bố vội bế ra chỗ vắng, mua cho bạn cái bánh nướng nhân đậu xanh.',
          effects: { happy: -1, health: 1 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { father: 'hug' } } },
        { label: 'Ôm khư khư đèn ông sao', text: 'Bạn ôm cây đèn ông sao không rời, ngắm ánh nến lung linh suốt cả buổi tối. Về nhà ngủ vẫn không chịu buông.',
          effects: { happy: 4, smarts: 1, rel: { mother: 2 } },
          scene: { anim: 'idle', fx: 'stars', npcAnim: { mother: 'love' } } }
      ]
    },

    {
      id: 'c_baby_wedding', title: 'Đi ăn cưới cùng mẹ', icon: '💒', age: [1, 2],
      text: 'Mẹ bế bạn đi ăn cưới {relative.k} {relative}. Nhạc xập xình, đèn sân khấu nhấp nháy, cô dâu chú rể bước ra giữa tràng pháo tay.',
      scene: { loc: 'wedding', time: 'dusk', anim: 'idle', fx: 'confetti', shot: 'wide',
        npcs: [ { role: 'mother', anim: 'clap' }, { role: 'relative', anim: 'wave', say: 'Cảm ơn cả nhà đã tới!' }, { role: 'crowd', anim: 'clap' } ] },
      choices: [
        { label: 'Bò lên sân khấu', text: 'Đúng lúc cô dâu chú rể cắt bánh, bạn bò thẳng lên sân khấu. MC đùa: “Khách mời đặc biệt nhất hôm nay!”, cả hội trường cười rần.',
          effects: { happy: 5, looks: 1 },
          scene: { anim: 'crawl', fx: 'stars', npcAnim: { crowd: 'laugh', mother: 'facepalm' } } },
        { label: 'Nhún nhảy theo nhạc', text: 'Bạn nhún nhảy theo bài nhạc sàn trên đùi mẹ. Cả bàn tiệc quay video, bạn thành “hot boy hot girl” của đám cưới.',
          effects: { happy: 5 },
          scene: { anim: 'dance', fx: 'music', npcAnim: { mother: 'laugh' } } },
        { label: 'Ngủ say giữa tiếng nhạc', text: 'Giữa tiếng loa ầm ầm, bạn ngủ say như chưa từng có. Mẹ được ăn trọn một bữa cỗ hiếm hoi không bị quấy.',
          effects: { health: 2, rel: { mother: 3 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { mother: 'eat' } } }
      ]
    },

    {
      id: 'c_baby_photo', title: 'Chụp ảnh studio', icon: '📷', age: [0, 2],
      text: 'Bố mẹ đưa bạn đi chụp bộ ảnh kỷ niệm ở studio. Anh thợ ảnh bày đủ thứ: mũ thỏ, giỏ mây, bóng bay, phông nền sặc sỡ. “Nhìn chú này, cười nào!”.',
      scene: { loc: 'studio', time: 'day', anim: 'idle', fx: 'flash', shot: 'close',
        npcs: [ { role: 'stranger', gender: 'm', anim: 'phone', say: 'Nhìn chú nè, cười lên nào!' }, { role: 'mother', anim: 'wave' } ] },
      choices: [
        { label: 'Tạo dáng như người mẫu', text: 'Bạn cười đúng lúc, nghiêng đầu đúng góc. Thợ ảnh xin phép dùng một tấm làm ảnh mẫu treo ở cửa tiệm.',
          effects: { happy: 4, looks: 2, flag: 'baby_model' },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { stranger: 'clap', mother: 'love' } } },
        { label: 'Ăn luôn cái mũ thỏ', text: 'Bạn gặm tai thỏ suốt buổi. Bộ ảnh nào cũng là cảnh bạn đang nhai mũ — mà lại là bộ ảnh cả nhà thích nhất.',
          effects: { happy: 5 },
          scene: { anim: 'eat', fx: 'question', npcAnim: { stranger: 'facepalm', mother: 'laugh' } } },
        { label: 'Khóc ướt cả phông nền', text: 'Đèn chớp liên tục làm bạn khóc mãi không nín. Tấm duy nhất chụp được là bạn đang há miệng khóc, sau này bị mang ra trêu suốt.',
          effects: { happy: -1 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'hug' } } }
      ]
    },

    {
      id: 'c_baby_plane', title: 'Chuyến bay đầu tiên', icon: '✈️', age: [1, 2],
      text: 'Cả nhà bay vào thăm họ hàng. Sân bay đông nghịt, bạn ngồi xe đẩy nhìn những chiếc máy bay khổng lồ qua lớp kính. Lát nữa thôi bạn sẽ ở trên đó.',
      scene: { loc: 'airport', time: 'day', anim: 'idle', fx: 'exclaim', shot: 'wide',
        npcs: [ { role: 'father', anim: 'point', say: 'Máy bay kìa con, to chưa!' }, { role: 'mother', anim: 'walk' }, { role: 'crowd', anim: 'walk' } ] },
      choices: [
        { label: 'Hò hét chỉ trỏ máy bay', text: 'Mỗi chiếc máy bay cất cánh bạn lại reo “Ò ò!”. Cô tiếp viên khen bạn dễ thương, tặng một chiếc huy hiệu cánh bay.',
          effects: { happy: 5, smarts: 1, flag: 'baby_plane' },
          scene: { anim: 'cheer', fx: 'stars', npcAnim: { father: 'laugh' } } },
        { label: 'Khóc suốt chuyến bay vì ù tai',
          outcomes: [
            { p: 0.6, text: 'Bạn khóc từ lúc cất cánh tới lúc hạ cánh. Bố mẹ cúi đầu xin lỗi cả khoang, một bà cụ ghế bên còn cho bạn mút kẹo.',
              effects: { happy: -2, health: -1, rel: { mother: 2 } }, scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'bow' } } },
            { p: 0.4, text: 'Mẹ cho bạn bú lúc cất cánh nên đỡ ù tai, bạn nín dần rồi ngủ khì tới nơi. Cả khoang thở phào.',
              effects: { health: 1, rel: { mother: 3 } }, scene: { anim: 'sleep', fx: 'zzz', npcAnim: { mother: 'hug' } } }
          ] },
        { label: 'Ngủ trên xe đẩy', text: 'Chờ lâu quá, bạn ngủ luôn trên xe đẩy. Bố mẹ được ngồi uống cà phê sân bay trong yên lặng.',
          effects: { health: 2, rel: { father: 1, mother: 1 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { father: 'drink' } } }
      ]
    },

    {
      id: 'c_baby_pet', title: 'Người bạn bốn chân', icon: '🐾', age: [0, 2],
      text: 'Bạn và {pet} ngồi nhìn nhau giữa phòng khách. Nó dí cái mũi ướt vào má bạn, đuôi vẫy tít. Bố mẹ đứng nín thở, không biết hai đứa sẽ làm gì nhau.',
      scene: { loc: 'home', time: 'day', anim: 'crawl', fx: 'question', shot: 'close',
        npcs: [ { role: 'pet', anim: 'idle' }, { role: 'mother', anim: 'idle', say: 'Nhẹ tay thôi con…' } ] },
      choices: [
        { label: 'Ôm chặt lấy nó', text: 'Bạn ôm chầm lấy {pet}, nó ngoan ngoãn nằm im cho bạn ôm. Từ hôm đó hai đứa ngủ trưa chung một tấm chiếu.',
          effects: { happy: 6, rel: { pet: 10 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'love' } } },
        { label: 'Kéo đuôi nó', text: 'Bạn túm đuôi kéo mạnh, {pet} kêu ăng ẳng chạy trốn dưới gầm giường. Mẹ dạy: “Phải thương bạn ấy chứ con!”.',
          effects: { happy: 1, karma: -1, rel: { pet: -4 } },
          scene: { anim: 'laugh', fx: 'sweat', npcAnim: { mother: 'shake' } } },
        { label: 'Chia bánh cho nó ăn', text: 'Bạn chìa miếng bánh quy đang gặm dở. {pet} ăn sạch rồi liếm luôn tay bạn. Mẹ hốt hoảng đi rửa tay, còn bạn cười như được mùa.',
          effects: { happy: 5, karma: 2, rel: { pet: 6 } },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { mother: 'facepalm' } } }
      ]
    },

    {
      id: 'c_baby_moto', title: 'Ngồi xe máy dạo phố', icon: '🛵', age: [1, 2],
      text: 'Chiều mát, bố chở cả nhà đi dạo phố bằng xe máy. Bạn ngồi phía trước, đội chiếc mũ bảo hiểm hình con vịt. Phố xá đèn đóm, xe cộ bấm còi inh ỏi.',
      scene: { loc: 'street', time: 'dusk', anim: 'drive', fx: 'dust', shot: 'wide',
        npcs: [ { role: 'father', anim: 'drive', say: 'Ngồi im nha con!' }, { role: 'mother', anim: 'sit' } ] },
      choices: [
        { label: 'Vỗ tay theo tiếng còi xe', text: 'Cứ xe nào bấm còi bạn lại vỗ tay reo hò. Bố cười suốt dọc đường: “Con nhà mình ồn y như phố”.',
          effects: { happy: 5, rel: { father: 3 } },
          scene: { anim: 'clap', fx: 'music', npcAnim: { father: 'laugh' } } },
        { label: 'Đòi dừng mua kem', text: 'Bạn chỉ tay vào xe kem, ê a mãi không thôi. Bố đành tấp vào, cả nhà ngồi vỉa hè ăn kem ốc quế.',
          effects: { happy: 5, health: -1, money: -20000 },
          scene: { loc: 'street', anim: 'eat', fx: 'sparkle', npcAnim: { father: 'eat', mother: 'laugh' } } },
        { label: 'Ngủ gật trên xe', text: 'Gió mát, xe lắc lư, bạn gục đầu ngủ ngon lành. Mẹ phải một tay giữ bạn, một tay bám bố suốt quãng đường về.',
          effects: { health: 2, rel: { mother: 2 } },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { mother: 'hug' } } }
      ]
    },

    {
      id: 'c_baby_toy', title: 'Món đồ chơi đầu tiên', icon: '🧸', age: [1, 2],
      text: 'Mẹ dắt bạn đi chợ đồ chơi. Trên sạp bày đủ thứ: cái trống con, chiếc ô tô điều khiển, quyển sách vải có hình con vật, và một con gấu bông to bằng người bạn.',
      scene: { loc: 'market', time: 'day', anim: 'idle', fx: 'sparkle', shot: 'close',
        npcs: [ { role: 'vendor', gender: 'f', anim: 'talk', say: 'Bé thích cái nào cô lấy cho!' }, { role: 'mother', anim: 'point' } ] },
      choices: [
        { label: 'Chộp lấy cái trống', text: 'Bạn gõ trống tùng tùng từ chợ về tới nhà, rồi gõ tiếp ba tháng liền. Hàng xóm thuộc lòng nhịp trống của bạn.',
          effects: { happy: 5, flag: 'toy_trong' },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { mother: 'facepalm', vendor: 'laugh' } } },
        { label: 'Ôm quyển sách vải', text: 'Bạn lật đi lật lại quyển sách, chỉ vào từng con vật. Chẳng bao lâu bạn đã biết kêu “meo meo”, “gâu gâu”, “ò ó o”.',
          effects: { smarts: 4, happy: 2, flag: 'toy_sach' },
          scene: { anim: 'study', fx: 'idea', npcAnim: { mother: 'love' } } },
        { label: 'Đòi con gấu bông khổng lồ', text: 'Bạn ôm chặt con gấu không buông, mẹ đành mua dù đắt. Con gấu theo bạn qua bao năm tháng, ngủ cùng bạn mỗi đêm.',
          effects: { happy: 6, money: -150000, flag: 'toy_gau' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'shrug' } } }
      ]
    },

    {
      id: 'c_baby_mirror', title: 'Em bé trong gương', icon: '🪞', age: [1, 2],
      text: 'Bạn bò tới trước tấm gương lớn trong phòng và phát hiện ra… một em bé khác! Em bé đó bắt chước y hệt mọi động tác của bạn.',
      scene: { loc: 'bedroom', time: 'day', anim: 'crawl', fx: 'question', shot: 'close',
        npcs: [ { role: 'mother', anim: 'laugh', say: 'Ai đây? Ai trong gương đây?' } ] },
      choices: [
        { label: 'Hôn em bé trong gương', text: 'Bạn hôn chụt lên gương, để lại một vệt nước miếng to. Mẹ cười ngặt nghẽo và không thèm lau vệt đó suốt một tuần.',
          effects: { happy: 5, looks: 1, rel: { mother: 2 } },
          scene: { anim: 'love', fx: 'hearts', npcAnim: { mother: 'laugh' } } },
        { label: 'Đập gương đòi đánh nhau', text: 'Bạn đập tay vào gương, em bé kia cũng đập lại! Bạn tức tối oà khóc. Mẹ ôm bạn: “Đó là con mà!”.',
          effects: { happy: 1, smarts: 1 },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { mother: 'laugh' } } },
        { label: 'Nhìn rất lâu, rất lâu', text: 'Bạn ngồi nhìn mình trong gương hồi lâu, như đang nghĩ ngợi điều gì đó lớn lao. Mẹ bảo con mình sau này chắc thành triết gia.',
          effects: { smarts: 3, happy: 1 },
          scene: { anim: 'think', fx: 'idea', npcAnim: { mother: 'nod' } } }
      ]
    },

    {
      id: 'c_baby_football', title: 'Xem bóng đá cùng cả xóm', icon: '⚽', age: [1, 2],
      text: 'Tối nay đội tuyển Việt Nam đá trận quan trọng. Bố bế bạn ngồi trước tivi, cả xóm tụ tập, ai cũng quấn băng rôn đỏ sao vàng trên trán.',
      scene: { loc: 'home', time: 'night', anim: 'sit', fx: 'exclaim', shot: 'wide',
        npcs: [ { role: 'father', anim: 'cheer', say: 'Vào! Vàooo!' }, { role: 'neighbor', anim: 'cheer' } ] },
      choices: [
        { label: 'Hò reo cùng cả xóm', text: 'Việt Nam ghi bàn, cả xóm gào lên, bạn cũng hét theo “Ôôô!”. Bố tung bạn lên trời, tuyên bố: “Con là bùa may mắn của đội tuyển!”.',
          effects: { happy: 6, rel: { father: 4 }, flag: 'baby_football' },
          scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { father: 'jump', neighbor: 'cheer' } } },
        { label: 'Giật mình khóc ré', text: 'Tiếng hò hét ầm ĩ làm bạn khóc ré. Bố đành bế bạn ra sân dỗ, lỡ mất bàn thắng duy nhất của trận.',
          effects: { happy: -1, rel: { father: 2 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { father: 'facepalm' } } },
        { label: 'Ngủ khì giữa trận', text: 'Hiệp hai chưa bắt đầu bạn đã ngủ say. Bố vặn nhỏ tiếng, ngồi xem mà không dám hò hét, tức anh ách.',
          effects: { health: 2 },
          scene: { anim: 'sleep', fx: 'zzz', npcAnim: { father: 'sit' } } }
      ]
    },

    {
      id: 'c_baby_cafe', title: 'Cà phê sáng cuối tuần', icon: '☕', age: [1, 2],
      text: 'Sáng chủ nhật, bố mẹ đưa bạn đi cà phê. Quán đông người, tiếng nhạc nhẹ, mùi cà phê thơm phức. Bạn ngồi ghế em bé, được gọi riêng một ly sữa.',
      scene: { loc: 'cafe', time: 'day', anim: 'sit', fx: 'steam', shot: 'wide',
        npcs: [ { role: 'father', anim: 'drink' }, { role: 'mother', anim: 'talk', say: 'Uống sữa đi con, đừng đụng ly của bố!' } ] },
      choices: [
        { label: 'Làm đổ ly cà phê của bố', text: 'Bạn với tay hất đổ ly cà phê sữa đá, ướt hết quần bố. Bố nhìn trời, mẹ cười không nhặt được mồm.',
          effects: { happy: 4, rel: { father: -1, mother: 1 } },
          scene: { anim: 'laugh', fx: 'sweat', npcAnim: { father: 'facepalm', mother: 'laugh' } } },
        { label: 'Vẫy tay chào khách bàn bên', text: 'Bạn vẫy tay chào từng người. Mấy chị sinh viên bàn bên sang nựng má, còn tặng bạn một chiếc bánh quy.',
          effects: { happy: 4, looks: 1, karma: 1 },
          scene: { anim: 'wave', fx: 'hearts', npcAnim: { mother: 'laugh' } } },
        { label: 'Uống sữa ngoan ngoãn', text: 'Bạn uống hết ly sữa, ngồi ngoan nghe nhạc. Bố mẹ được một buổi sáng hẹn hò hiếm hoi kể từ ngày có bạn.',
          effects: { health: 2, rel: { father: 2, mother: 2 } },
          scene: { anim: 'drink', fx: 'music', npcAnim: { father: 'talk', mother: 'love' } } }
      ]
    },

    {
      id: 'c_baby_nhatre', title: 'Ngày đầu đi nhà trẻ', icon: '🎒', age: [2, 2], weight: 1.5,
      text: 'Hôm nay là ngày đầu tiên bạn đi nhà trẻ. Lớp học đầy đồ chơi màu sắc, mấy đứa nhỏ đứa thì khóc, đứa thì chạy lung tung. Cô giáo dang tay đón bạn ở cửa.',
      scene: { loc: 'school', time: 'dawn', anim: 'idle', fx: 'question', shot: 'wide',
        npcs: [ { role: 'teacher', gender: 'f', anim: 'wave', say: 'Chào con, vào lớp với cô nào!' }, { role: 'mother', anim: 'wave' }, { role: 'kid', anim: 'cry' } ] },
      choices: [
        { label: 'Ôm chân mẹ khóc không buông', text: 'Bạn ôm chân mẹ gào khóc. Mẹ đi khuất rồi mà bạn vẫn đứng ở cửa sổ nhìn theo. Tới trưa thì bạn đã chơi xếp hình vui vẻ.',
          effects: { happy: -2, rel: { mother: 3 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'sad', teacher: 'hug' } } },
        { label: 'Chạy ngay vào chơi', text: 'Bạn buông tay mẹ, lao thẳng vào góc đồ chơi không thèm ngoái lại. Mẹ đứng ngoài cửa, hơi tủi thân vì con mình không nhớ mẹ.',
          effects: { happy: 5, smarts: 1 },
          scene: { anim: 'run', fx: 'sparkle', npcAnim: { mother: 'shrug', teacher: 'clap' } } },
        { label: 'Dỗ đứa bạn đang khóc', text: 'Thấy một bạn nhỏ khóc nhè, bạn lẫm chẫm tới chia cho nó cái bánh. Cô giáo khen trước cả lớp, hai đứa thành bạn thân.',
          effects: { happy: 3, karma: 4, rel: { mother: 2 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { teacher: 'love', kid: 'laugh' } } }
      ]
    },

    // ───────────────────────── TRẺ NHỎ 3–6 ─────────────────────────
    {
      id: 'c_kinder_cry', title: 'Cuộc chia ly mỗi sáng', icon: '😭', age: [3, 4], weight: 1.5,
      text: 'Sáng nào mẹ chở bạn tới lớp mầm non cũng là một cuộc chia ly đẫm nước mắt. Bạn bám chặt lấy áo mẹ, cô {teacher} đứng ở cửa dang tay đón.',
      scene: { loc: 'school', time: 'dawn', anim: 'cry', fx: 'tears', shot: 'wide',
        npcs: [ { role: 'mother', anim: 'sad', say: 'Chiều mẹ đón sớm nha con…' }, { role: 'teacher', gender: 'f', anim: 'wave', say: 'Vào đây với cô, có bánh nè!' }, { role: 'kid', anim: 'cry' } ] },
      choices: [
        { label: 'Bám chặt áo mẹ, gào khóc',
          outcomes: [
            { p: 0.5, text: 'Mẹ phải ngồi ngoài cửa lớp cả buổi sáng, đi làm trễ bị trừ lương. Bạn thắng, nhưng thấy mẹ buồn buồn.',
              effects: { happy: 1, rel: { mother: 2 } }, scene: { anim: 'hug', npcAnim: { mother: 'sit' } } },
            { p: 0.5, text: 'Cô {teacher} bế bạn vào lớp. Năm phút sau bạn đã tranh xích đu với đứa khác, quên luôn mẹ là ai.',
              effects: { happy: 3, smarts: 1 }, scene: { anim: 'laugh', fx: 'stars', npcAnim: { teacher: 'laugh', kid: 'laugh' } } }
          ] },
        { label: 'Lau nước mắt, vẫy tay chào mẹ', text: 'Bạn sụt sịt nhưng vẫn vẫy tay. Mẹ quay đi, mắt cũng đỏ hoe. Chiều đó cô {teacher} thưởng bạn một ngôi sao giấy.',
          effects: { happy: 3, karma: 2, rel: { mother: 4 } },
          scene: { anim: 'wave', fx: 'stars', npcAnim: { mother: 'wave', teacher: 'clap' }, npcSay: { teacher: 'Giỏi quá, cô thưởng nè!' } } },
        { label: 'Giả vờ đau bụng để được về',
          outcomes: [
            { p: 0.4, text: 'Mẹ tin sái cổ, bế bạn về nhà. Nhưng bạn phải uống một thìa thuốc đắng nghét “cho chắc”.',
              effects: { happy: 2, health: -1 }, scene: { anim: 'sick', fx: 'sweat', npcAnim: { mother: 'hug' } } },
            { p: 0.6, text: 'Cô {teacher} nhìn bạn vừa ôm bụng vừa nhún nhảy mà bật cười. Kế hoạch thất bại.',
              effects: { happy: -2 }, scene: { anim: 'facepalm', fx: 'question', npcAnim: { teacher: 'laugh' } } }
          ] }
      ]
    },

    {
      id: 'c_toy_sibling', title: 'Tranh giành robot', icon: '🤖', age: [3, 8],
      text: '{sibling.K} {sibling} và bạn cùng nhào tới con robot biến hình mới mua. Hai bên giằng co, con robot kêu răng rắc như sắp gãy làm đôi.',
      scene: { loc: 'home', time: 'day', anim: 'angry', fx: 'anger', shot: 'close',
        npcs: [ { role: 'sibling', anim: 'angry', say: 'Của tui! Tui thấy trước!' }, { role: 'mother', anim: 'cook' } ] },
      choices: [
        { label: 'Nhường {sibling.k} chơi trước', text: '{sibling.K} {sibling} ngạc nhiên, rồi rủ bạn chơi chung. Mẹ thấy vậy thưởng cả hai một que kem.',
          effects: { karma: 4, happy: 3, rel: { sibling: 6, mother: 3 } },
          scene: { anim: 'nod', fx: 'hearts', npcAnim: { sibling: 'laugh', mother: 'clap' } } },
        { label: 'Giật thật mạnh!',
          outcomes: [
            { p: 0.5, text: 'Bạn giành được con robot, nhưng {sibling.k} {sibling} khóc ầm lên và mách mẹ. Bạn bị phạt đứng úp mặt vào tường.',
              effects: { happy: -2, karma: -3, rel: { sibling: -5 } },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { sibling: 'cry', mother: 'point' } } },
            { p: 0.5, text: 'Rắc! Con robot gãy tay. Cả hai bị phạt đứng góc nhà, nhìn nhau đầy oán hận.',
              effects: { happy: -4, rel: { sibling: -3 } },
              scene: { anim: 'cry', fx: 'dust', npcAnim: { sibling: 'cry', mother: 'angry' } } }
          ] },
        { label: 'Khóc to hơn để mẹ xử', text: 'Mẹ phán: “Không ai được chơi!” rồi cất con robot lên nóc tủ. Hai đứa ngồi ôm gối hờn dỗi cả buổi.',
          effects: { happy: -2, rel: { sibling: -2 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'point', sibling: 'sad' }, npcSay: { mother: 'Không ai được chơi hết!' } } }
      ]
    },

    {
      id: 'c_market_tantrum', title: 'Ăn vạ giữa chợ', icon: '🔫', age: [3, 6],
      text: 'Đi chợ với mẹ, bạn đứng sững trước sạp đồ chơi có cây súng bắn bong bóng giá {money:85000}. Mẹ kéo tay đi tiếp, bạn liền nằm lăn ra đất.',
      scene: { loc: 'market', time: 'day', anim: 'cry', fx: 'tears', shot: 'wide',
        npcs: [ { role: 'mother', anim: 'angry', say: 'Đứng dậy! Về mẹ tính sau!' }, { role: 'vendor', gender: 'm', anim: 'laugh' }, { role: 'crowd', anim: 'idle' } ] },
      choices: [
        { label: 'Lăn lộn ăn vạ tiếp',
          outcomes: [
            { p: 0.4, text: 'Mẹ ngượng chín mặt trước cả chợ, đành mua. Nhưng về nhà mẹ không nói chuyện với bạn cả buổi tối.',
              effects: { happy: 4, karma: -2, rel: { mother: -5 } },
              scene: { anim: 'cheer', fx: 'bubbles', npcAnim: { mother: 'facepalm', vendor: 'laugh' } } },
            { p: 0.6, text: 'Mẹ bình thản đi tiếp. Nằm một mình giữa chợ, bạn tự đứng dậy, phủi quần, chạy theo.',
              effects: { happy: -3, smarts: 1 },
              scene: { anim: 'run', fx: 'dust', npcAnim: { vendor: 'laugh', mother: 'walk' } } }
          ] },
        { label: 'Hứa ngoan cả tuần để đổi lấy', text: 'Mẹ đồng ý với điều kiện: tự dọn đồ chơi, ăn hết rau. Bạn giữ lời được… ba ngày rưỡi.',
          effects: { happy: 3, rel: { mother: 2 } },
          scene: { anim: 'nod', fx: 'bubbles', npcAnim: { mother: 'nod' }, npcSay: { mother: 'Hứa rồi đó nha!' } } },
        { label: 'Lủi thủi đi theo mẹ', text: 'Bạn ngoan ngoãn đi theo. Cuối buổi chợ, mẹ bất ngờ mua cho bạn một cái bánh bò thật to.',
          effects: { happy: 2, karma: 2, rel: { mother: 4 } },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { mother: 'hug' } } }
      ]
    },

    {
      id: 'c_tet_lixi', title: 'Lì xì ngày Tết', icon: '🧧', age: [3, 17], weight: 1.2, once: false, cooldown: 1,
      text: 'Mùng Một Tết, nhà rộn ràng mai vàng, bánh chưng. Họ hàng tới chúc Tết, ai cũng dúi vào tay bạn một phong bao đỏ. Tổng cộng chừng {money:1200000} — cả một gia tài!',
      scene: { loc: 'home', time: 'day', decor: 'tet', anim: 'bow', fx: 'money', shot: 'wide',
        npcs: [ { role: 'relative', anim: 'talk', say: 'Năm mới học giỏi, ngoan ngoãn nha!' }, { role: 'mother', anim: 'laugh' } ] },
      choices: [
        { label: 'Đưa mẹ “giữ hộ”', text: 'Mẹ cất phong bao vào túi, hứa sẽ trả khi bạn lớn. Bạn lớn tới giờ, mẹ vẫn đang… giữ hộ.',
          effects: { karma: 3, happy: -1, rel: { mother: 5 } },
          scene: { anim: 'nod', fx: 'sweat', npcAnim: { mother: 'laugh' }, npcSay: { mother: 'Mẹ giữ cho, lớn mẹ trả!' } } },
        { label: 'Bỏ hết vào ống heo', text: 'Ống heo nặng trịch. Bạn tự thấy mình là người giàu nhất xóm.',
          effects: { money: 1200000, happy: 4, smarts: 1 },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { relative: 'clap' } } },
        { label: 'Mở phong bao ngay trước mặt khách',
          outcomes: [
            { p: 0.5, text: 'Mẹ lườm cháy mặt, nhưng bác khách cười lớn, lì xì thêm một phong nữa “cho đứa thật thà”.',
              effects: { money: 1500000, happy: 5, rel: { mother: -2 } },
              scene: { anim: 'laugh', fx: 'money', npcAnim: { relative: 'laugh', mother: 'facepalm' } } },
            { p: 0.5, text: 'Mẹ cốc nhẹ vào đầu bạn trước mặt cả nhà. Tiền thì vẫn được, nhưng mặt mũi thì không.',
              effects: { money: 1200000, happy: -2 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { mother: 'angry' } } }
          ] }
      ]
    },

    {
      id: 'c_midautumn', title: 'Đêm rước đèn', icon: '🏮', age: [3, 10], weight: 1.2, once: false, cooldown: 2,
      text: 'Đêm Trung thu, cả xóm rước đèn. Tiếng trống “tùng rinh rinh” rộn ràng, đầu lân nhảy múa, lũ trẻ cầm đèn ông sao, đèn cá chép đi thành hàng dài.',
      scene: { loc: 'street', time: 'night', decor: 'midautumn', anim: 'walk', fx: 'sparkle', shot: 'orbit',
        npcs: [ { role: 'kid', anim: 'dance', say: 'Lân tới rồi, lân tới rồi!' }, { role: 'crowd', anim: 'clap' } ] },
      choices: [
        { label: 'Chạy theo đoàn múa lân', text: 'Bạn chạy theo đầu lân suốt ba con hẻm, được ông Địa xoa đầu lấy may. Về nhà mồ hôi nhễ nhại mà vui hết cỡ.',
          effects: { happy: 6, health: 2 },
          scene: { anim: 'run', fx: 'confetti', npcAnim: { kid: 'run' } } },
        { label: 'Ngồi phá cỗ, ăn bánh nướng', text: 'Bánh nướng thập cẩm, bưởi, hồng, cốm… Bạn ăn tới căng bụng rồi lăn ra ngủ trên chiếu.',
          effects: { happy: 4, health: -1 },
          scene: { anim: 'eat', fx: 'stars', npcAnim: { kid: 'eat' } } },
        { label: 'Thắp nến đèn ông sao thật sáng',
          outcomes: [
            { p: 0.6, text: 'Ngọn nến bén vào giấy bóng kính, chiếc đèn cháy rụi. Bạn tiếc hùi hụi, nhưng một bác hàng xóm làm cho cái mới bằng tre.',
              effects: { happy: 1, karma: 1 }, scene: { anim: 'scared', fx: 'smoke', npcAnim: { kid: 'scared' } } },
            { p: 0.4, text: 'Đèn của bạn sáng lung linh nhất xóm, cả đám trẻ xúm lại trầm trồ.',
              effects: { happy: 5, looks: 1 }, scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { kid: 'clap' } } }
          ] }
      ]
    },

    {
      id: 'c_neighbor_dog', title: 'Con Vện nhà bên', icon: '🐕', age: [3, 9],
      text: 'Đi ngang nhà bác {neighbor}, con chó vện bỗng sủa ầm lên rồi lao ra cổng. Tim bạn đập thình thịch, hai chân bắt đầu run.',
      scene: { loc: 'street', time: 'day', anim: 'scared', fx: 'exclaim', shot: 'low',
        npcs: [ { role: 'neighbor', gender: 'm', anim: 'point', say: 'Vện! Vện! Quay vô!' }, { role: 'stranger', kind: 'dog', anim: 'run' } ] },
      choices: [
        { label: 'Co giò chạy!',
          success: { stat: 'health', base: 0.4, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chạy nhanh chưa từng thấy, phóng thẳng về nhà, đóng sập cửa. Hôm sau bạn tự hào kể với cả lớp.',
              effects: { happy: 2, health: 2 }, scene: { anim: 'run', fx: 'dust', npcAnim: { stranger: 'run' } } },
            { text: 'Bạn vấp cục đá ngã sõng soài, con Vện tới nơi… liếm mặt bạn. Bác {neighbor} cười chảy nước mắt.',
              effects: { happy: -1, health: -2 }, scene: { anim: 'fall', fx: 'dust', npcAnim: { neighbor: 'laugh', stranger: 'jump' } } }
          ] },
        { label: 'Đứng im như tượng', text: 'Bạn nhớ lời người lớn dặn: đứng yên, đừng nhìn vào mắt chó. Con Vện ngửi ngửi rồi bỏ đi. Bạn thở phào.',
          effects: { smarts: 2, happy: 1 },
          scene: { anim: 'idle', fx: 'sweat', npcAnim: { stranger: 'sit', neighbor: 'nod' } } },
        { label: 'Chìa mẩu bánh mì làm quen', text: 'Con Vện vẫy đuôi ăn ngon lành. Từ đó mỗi lần bạn đi qua, nó chạy ra đón như người quen.',
          effects: { karma: 3, happy: 4 },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'cheer', neighbor: 'nod' }, npcSay: { neighbor: 'Nó quý con rồi đó!' } } }
      ]
    },

    {
      id: 'c_wall_drawing', title: 'Hoạ sĩ nhí', icon: '🖍️', age: [3, 6],
      text: 'Nhà vừa sơn lại tường màu kem tinh tươm. Bạn cầm hộp bút sáp mới, nhìn bức tường trống trơn… và thấy cảm hứng nghệ thuật dâng trào.',
      scene: { loc: 'home', time: 'day', anim: 'think', fx: 'idea', shot: 'close',
        npcs: [ { role: 'mother', anim: 'cook' } ] },
      choices: [
        { label: 'Vẽ cả gia đình lên tường',
          outcomes: [
            { p: 0.5, text: 'Mẹ định mắng, nhưng thấy bức vẽ “bố mẹ và con” ngộ nghĩnh quá, lại lấy điện thoại ra chụp. Bức tranh được giữ tới tận bây giờ.',
              effects: { happy: 5, smarts: 1, rel: { mother: 4 } },
              scene: { anim: 'cheer', fx: 'hearts', npcAnim: { mother: 'love' }, npcSay: { mother: 'Ai vẽ mẹ mập vậy nè?' } } },
            { p: 0.5, text: 'Mẹ nhìn bức tường, hít một hơi thật sâu. Bạn bị phạt cầm giẻ lau tới tối mà vết sáp vẫn còn mờ mờ.',
              effects: { happy: -3, rel: { mother: -3 } },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { mother: 'angry' } } }
          ] },
        { label: 'Vẽ vào giấy như người lịch sự', text: 'Bạn vẽ một con mèo ba chân rất đẹp (theo bạn). Mẹ dán nó lên cửa tủ lạnh.',
          effects: { smarts: 2, happy: 3, karma: 1, rel: { mother: 2 } },
          scene: { anim: 'sit', fx: 'stars', npcAnim: { mother: 'clap' } } },
        { label: 'Vẽ xong đổ tội cho con mèo',
          outcomes: [
            { p: 0.3, text: 'Mẹ tin, vì con mèo đúng là hay leo tường. Con mèo bị nhốt ngoài sân một buổi chiều.',
              effects: { happy: 2, karma: -4 }, scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.7, text: 'Mẹ hỏi: “Mèo nào biết viết chữ “{name}” lên tường thế này?”. Bạn bị phạt gấp đôi.',
              effects: { happy: -4, karma: -2, rel: { mother: -2 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { mother: 'point' } } }
          ] }
      ]
    },

    {
      id: 'c_candy_meal', title: 'Kẹo trước bữa cơm', icon: '🍬', age: [3, 6],
      text: 'Còn mười phút nữa là tới bữa cơm, bạn lén mở hộp kẹo trên nóc tủ lạnh. Từ trong bếp vọng ra tiếng mẹ.',
      scene: { loc: 'home', time: 'dusk', anim: 'think', expr: 'scared', fx: 'exclaim', shot: 'close',
        npcs: [ { role: 'mother', anim: 'cook', say: 'Đứa nào đang lục tủ đó?' } ] },
      choices: [
        { label: 'Nhét vội ba viên vào miệng', text: 'Má phồng như con sóc, bạn lắc đầu “Hông có ai hết”. Tới bữa cơm bạn chẳng nuốt nổi hột nào, bị mẹ phát hiện ngay.',
          effects: { happy: 1, health: -2, rel: { mother: -2 } },
          scene: { anim: 'shake', fx: 'sweat', npcAnim: { mother: 'point' } } },
        { label: 'Thú nhận và cất kẹo lại', text: 'Mẹ xoa đầu, bảo ăn cơm xong được hai viên. Bạn ăn hết sạch bát cơm nhanh kỷ lục.',
          effects: { karma: 3, health: 2, rel: { mother: 4 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { mother: 'hug' } } },
        { label: 'Chia kẹo cho mẹ để “hối lộ”', text: 'Mẹ cầm viên kẹo, nhịn cười không nổi: “Lần này thôi đấy”. Bạn vừa học được bài học đầu tiên về ngoại giao.',
          effects: { smarts: 2, happy: 3 },
          scene: { anim: 'laugh', fx: 'idea', npcAnim: { mother: 'laugh' } } }
      ]
    },

    {
      id: 'c_lost_market', title: 'Lạc giữa chợ', icon: '🐠', age: [3, 6],
      text: 'Mải nhìn mấy con cá vàng bơi trong chậu, ngẩng lên thì bạn không thấy mẹ đâu nữa. Chợ đông nghịt, ai cũng cao lớn và lạ hoắc.',
      scene: { loc: 'market', time: 'day', anim: 'cry', expr: 'scared', fx: 'question', shot: 'top',
        npcs: [ { role: 'vendor', gender: 'f', anim: 'talk', say: 'Con đi lạc hả? Mẹ con tên gì?' }, { role: 'crowd', anim: 'walk' }, { role: 'mother', anim: 'phone', say: '{name} ơi! Con ơi!' } ] },
      choices: [
        { label: 'Đọc số điện thoại của mẹ',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn đọc vanh vách số điện thoại mẹ dạy. Cô bán cá gọi ngay, năm phút sau mẹ chạy tới ôm chầm lấy bạn.',
              effects: { smarts: 2, happy: 3, rel: { mother: 4 } }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug', vendor: 'clap' } } },
            { text: 'Bạn chỉ nhớ mẹ tên là… “Mẹ”. Cô bán cá phải nhờ loa chợ thông báo, mẹ hớt hải chạy tới.',
              effects: { happy: -2, rel: { mother: 2 } }, scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'run', vendor: 'shrug' } } }
          ] },
        { label: 'Đứng yên tại chỗ chờ', text: 'Bạn nhớ lời mẹ dặn: lạc thì đứng yên. Mẹ quay lại đúng chỗ chậu cá, thở phào ôm bạn vào lòng.',
          effects: { smarts: 2, karma: 2, rel: { mother: 5 } },
          scene: { anim: 'idle', fx: 'sparkle', npcAnim: { mother: 'hug' }, npcSay: { mother: 'Con ngoan quá, mẹ hết hồn!' } } },
        { label: 'Tự đi tìm khắp chợ',
          outcomes: [
            { p: 0.5, text: 'Bạn lang thang tới hàng bánh, được cô bán bánh cho một miếng bánh da lợn. Mẹ tìm thấy bạn đang ngồi ăn ngon lành.',
              effects: { happy: 3, rel: { mother: -1 } }, scene: { anim: 'eat', fx: 'stars', npcAnim: { mother: 'facepalm' } } },
            { p: 0.5, text: 'Bạn càng đi càng lạc, khóc ướt cả áo tới khi chú bảo vệ chợ dắt về chỗ mẹ.',
              effects: { happy: -4 }, scene: { anim: 'cry', fx: 'tears', npcAnim: { mother: 'run' } } }
          ] }
      ]
    },

    {
      id: 'c_hide_seek', title: 'Vua trốn tìm', icon: '🙈', age: [4, 8],
      text: 'Cả đám trẻ trong hẻm chơi trốn tìm. Bạn chui vào tủ quần áo, thơm mùi băng phiến, tối om và… ấm áp vô cùng.',
      scene: { loc: 'bedroom', time: 'day', anim: 'sit', fx: 'question', shot: 'close',
        npcs: [ { role: 'kid', anim: 'run', say: 'Năm, mười, mười lăm… ai chưa trốn?' } ] },
      choices: [
        { label: 'Ngủ quên luôn trong tủ', text: 'Bạn tỉnh dậy lúc trời đã tối, cả xóm đang nháo nhác đi tìm. Người lớn vừa mắng vừa cười.',
          effects: { happy: 2, health: 1 },
          scene: { anim: 'sleep', fx: 'zzz', time: 'night', npcAnim: { kid: 'facepalm' } } },
        { label: 'Nhảy ra hù đứa đi tìm', text: 'Đứa đi tìm hét lên, té ngửa. Cả đám cười lăn lộn, bạn được phong “vua trốn tìm”.',
          effects: { happy: 5 },
          scene: { anim: 'jump', fx: 'exclaim', npcAnim: { kid: 'scared' } } },
        { label: 'Lén chạy về “chạm nhà”',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: '“Chạm!” — bạn về đích an toàn trong tiếng hò reo của cả đám.',
              effects: { happy: 4, health: 1 }, scene: { anim: 'cheer', fx: 'stars', loc: 'street', npcAnim: { kid: 'clap' } } },
            { text: 'Bị bắt ngay ở bậc cửa. Tới lượt bạn úp mặt đếm tới một trăm.',
              effects: { happy: -1 }, scene: { anim: 'facepalm', fx: 'dust', loc: 'street', npcAnim: { kid: 'point' } } }
          ] }
      ]
    },

    {
      id: 'c_rare_lizard', title: 'Thầy bói thạch sùng', icon: '🦎', age: [3, 6], weight: 0.3,
      text: 'Tối nào con thạch sùng trên tường cũng “chắc chắc” đúng lúc bạn nói. Bạn tin chắc nó hiểu tiếng người, và tối nay quyết định hỏi nó một câu thật quan trọng.',
      scene: { loc: 'bedroom', time: 'night', anim: 'talk', say: 'Thạch sùng ơi, mai có được ăn kem không?', fx: 'question', shot: 'close' },
      choices: [
        { label: 'Hỏi chuyện ăn kem ngày mai',
          outcomes: [
            { p: 0.5, text: '“Chắc chắc!” Hôm sau bạn được ăn kem thật. Bạn tôn con thạch sùng làm thầy bói riêng.',
              effects: { happy: 6 }, scene: { anim: 'cheer', fx: 'sparkle' } },
            { p: 0.5, text: 'Con thạch sùng im lặng bò đi mất. Bạn buồn cả tối vì nghĩ mình bị “bơ”.',
              effects: { happy: -1 }, scene: { anim: 'sad', fx: 'question' } }
          ] },
        { label: 'Đặt tên nó là “Ông Tám”', text: 'Từ đó “Ông Tám” thành thành viên bí mật của gia đình. Tối nào bạn cũng kể chuyện ở lớp cho Ông Tám nghe.',
          effects: { happy: 4, smarts: 1 },
          scene: { anim: 'laugh', fx: 'hearts' } }
      ]
    },

    {
      id: 'c_kid_haircut', title: 'Tiệm hớt tóc đầu hẻm', icon: '💈', age: [3, 6],
      text: 'Tóc bạn dài loà xoà che cả mắt. Bố chở bạn ra tiệm hớt tóc vỉa hè đầu hẻm, ông thợ cầm tông-đơ kêu “rè rè” như máy cày.',
      scene: { loc: 'street', time: 'day', anim: 'scared', fx: 'sweat', shot: 'close',
        npcs: [ { role: 'father', anim: 'talk', say: 'Cắt ngắn gọn cho mát nha anh!' }, { role: 'stranger', gender: 'm', age: 55, anim: 'idle', say: 'Ngồi im nha con, cắt đẹp liền!' } ] },
      choices: [
        { label: 'Ngồi im thin thít', text: 'Mái tóc mới gọn gàng, ai gặp cũng khen bảnh. Ông thợ tặng bạn viên kẹo vì là “khách ngoan nhất tuần”.',
          effects: { looks: 3, happy: 3 },
          scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'clap', father: 'nod' } } },
        { label: 'Ngọ nguậy, quay đầu liên tục', text: 'Kết quả: một mái tóc “bờm ngựa” lệch hẳn một bên. Cả tuần đi học bạn phải đội mũ.',
          effects: { looks: -3, happy: -2 },
          scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { father: 'laugh', stranger: 'shrug' } } },
        { label: 'Đòi cắt kiểu giống cầu thủ', text: 'Ông thợ nháy mắt, cạo hai đường kẻ bên thái dương. Bạn soi gương mãi không chán, bố thì lắc đầu cười.',
          effects: { looks: 2, happy: 5, rel: { father: 2 } },
          scene: { anim: 'cheer', fx: 'stars', npcAnim: { father: 'shake', stranger: 'nod' } } }
      ]
    },

    {
      id: 'c_pet_mischief', title: 'Thủ phạm bốn chân', icon: '🩴', age: [4, 15],
      text: '{pet.K} {pet} vừa gặm nát đôi dép mới mua của bố, rồi nằm ngửa bụng nhìn bạn đầy ngây thơ. Tiếng xe máy của bố đã về tới đầu hẻm.',
      scene: { loc: 'home', time: 'dusk', anim: 'scared', fx: 'exclaim', shot: 'wide',
        npcs: [ { role: 'pet', anim: 'sit' }, { role: 'father', anim: 'walk', say: 'Bố về rồi đây!' } ] },
      choices: [
        { label: 'Nhận tội thay cho {pet}', text: 'Bạn bảo mình lỡ làm hỏng dép. Bố mắng vài câu rồi thôi. {pet} liếm tay bạn như biết ơn.',
          effects: { karma: 4, happy: 1, rel: { pet: 8, father: -1 } },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { pet: 'cheer', father: 'angry' } } },
        { label: 'Giấu dép xuống gầm tủ',
          outcomes: [
            { p: 0.5, text: 'Bố tìm dép cả buổi tối rồi đành đi đôi dép lê cũ. Bí mật được chôn vùi… tới đợt dọn nhà đón Tết.',
              effects: { happy: 3, karma: -1 }, scene: { anim: 'shrug', fx: 'sweat', npcAnim: { father: 'think' } } },
            { p: 0.5, text: 'Bố cúi xuống gầm tủ tìm cái điều khiển và thấy đôi dép. {pet.K} {pet} bị nhốt ngoài sân một đêm.',
              effects: { happy: -3, rel: { pet: -2 } }, scene: { anim: 'facepalm', fx: 'anger', npcAnim: { father: 'angry', pet: 'sit' } } }
          ] },
        { label: 'Khai thật: “Tại {pet} đó!”', text: 'Bố nhìn {pet}, {pet} nhìn bố. Năm giây sau bố bật cười, xoa đầu nó: “Dép bố mua rẻ mà”.',
          effects: { happy: 4, rel: { father: 2 } },
          scene: { anim: 'point', fx: 'bubbles', npcAnim: { father: 'laugh', pet: 'cheer' } } }
      ]
    },

    // ───────────────────────── TIỂU HỌC 5–12 ─────────────────────────
    {
      id: 'c_bad_grade', title: 'Con điểm 3 đỏ chót', icon: '📝', age: [6, 11], req: { school: true },
      text: 'Bài kiểm tra Toán của bạn bị khoanh tròn đỏ chót: điểm 3. Cô dặn phải mang về cho phụ huynh ký tên. Tờ giấy trong cặp nặng như đá.',
      scene: { loc: 'home', time: 'dusk', anim: 'think', expr: 'scared', fx: 'sweat', shot: 'close',
        npcs: [ { role: 'mother', anim: 'talk', say: 'Hôm nay đi học có gì vui không con?' } ] },
      choices: [
        { label: 'Thú thật và xin lỗi', text: 'Mẹ thở dài, rồi ngồi giảng lại bài cho bạn tới khuya. Bài kiểm tra sau bạn được 8 điểm.',
          effects: { smarts: 4, karma: 3, happy: 1, rel: { mother: 4 } },
          scene: { anim: 'study', fx: 'idea', npcAnim: { mother: 'talk' } } },
        { label: 'Tự ký giả chữ ký của mẹ',
          success: { stat: 'smarts', base: 0.2, scale: 0.4 },
          outcomes: [
            { text: 'Chữ ký giống y như thật. Cô không phát hiện, nhưng cả tuần bạn giật mình mỗi khi điện thoại mẹ reo.',
              effects: { happy: -1, karma: -5 }, scene: { anim: 'think', fx: 'sweat' } },
            { text: 'Chữ ký “mẹ” của bạn nguệch ngoạc như gà bới. Cô gọi điện cho mẹ, bạn bị phạt cả điểm 3 lẫn tội gian dối.',
              effects: { happy: -5, karma: -5, rel: { mother: -6 } },
              scene: { anim: 'cry', fx: 'anger', npcAnim: { mother: 'angry' }, npcSay: { mother: 'Giỏi lắm, còn biết giả chữ ký nữa!' } } }
          ] },
        { label: 'Đợi lúc mẹ đang xem phim mới đưa',
          outcomes: [
            { p: 0.6, text: 'Mẹ đang tới đoạn gay cấn, ký roẹt một cái không thèm nhìn. Bạn thoát nạn… lần này.',
              effects: { happy: 3, karma: -2 }, scene: { anim: 'laugh', fx: 'sweat', npcAnim: { mother: 'sit' } } },
            { p: 0.4, text: 'Mẹ tắt TV, nhìn bạn rất lâu: “Con nghĩ mẹ không biết chiêu này à?”.',
              effects: { happy: -3, rel: { mother: -2 } }, scene: { anim: 'facepalm', fx: 'exclaim', npcAnim: { mother: 'point' } } }
          ] }
      ]
    },

    {
      id: 'c_bullied_friend', title: 'Giờ ra chơi không vui', icon: '🛡️', age: [7, 12], req: { school: true },
      text: 'Giờ ra chơi, mấy đứa lớp trên vây lấy {classmate} — cậu bạn nhỏ con nhất lớp — giật hộp bút ném qua ném lại. {classmate} mắt đỏ hoe, không dám nói gì.',
      scene: { loc: 'school', time: 'day', anim: 'think', fx: 'exclaim', shot: 'wide',
        npcs: [ { role: 'classmate', gender: 'm', anim: 'cry' }, { role: 'kid', gender: 'm', age: 12, anim: 'laugh', say: 'Giỏi thì lấy lại đi!' }, { role: 'crowd', anim: 'laugh' } ] },
      choices: [
        { label: 'Đứng ra bênh vực',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đứng chắn trước {classmate}, giọng run run nhưng dứt khoát. Mấy đứa kia chột dạ bỏ đi. Từ đó {classmate} coi bạn như anh em ruột.',
              effects: { karma: 8, happy: 4, addPerson: { role: 'friend', fromScene: 'classmate' } },
              scene: { anim: 'point', fx: 'stars', npcAnim: { classmate: 'hug', kid: 'run' } } },
            { text: 'Bạn bị xô ngã, sưng một cục trên trán. Nhưng {classmate} đỡ bạn dậy, và hai đứa thành bạn thân từ đó.',
              effects: { karma: 8, health: -4, happy: 1, addPerson: { role: 'friend', fromScene: 'classmate' } },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { classmate: 'hug', kid: 'laugh' } } }
          ] },
        { label: 'Chạy đi báo cô chủ nhiệm', text: 'Cô chủ nhiệm tới kịp, mấy đứa lớp trên bị ghi tên vào sổ. {classmate} lí nhí cảm ơn bạn.',
          effects: { karma: 5, smarts: 1 },
          scene: { anim: 'run', fx: 'exclaim', npcAnim: { classmate: 'bow', kid: 'scared' } } },
        { label: 'Lờ đi, không phải chuyện mình', text: 'Bạn quay đi giả vờ không thấy. Nhưng ánh mắt của {classmate} lúc đó cứ ám ảnh bạn mãi.',
          effects: { karma: -5, happy: -3 },
          scene: { anim: 'sad', fx: 'question', npcAnim: { classmate: 'sad' } } }
      ]
    },

    {
      id: 'c_found_money', title: 'Tờ tiền trên vỉa hè', icon: '💵', age: [6, 10],
      text: 'Trên đường đi học, bạn thấy tờ {money:50000} nằm chỏng chơ giữa vỉa hè. Xung quanh không có ai, chỉ có cô bán xôi đang dọn hàng gần đó.',
      scene: { loc: 'street', time: 'dawn', anim: 'think', fx: 'question', shot: 'low',
        npcs: [ { role: 'vendor', gender: 'f', anim: 'cook', say: 'Xôi nóng đây, xôi nóng!' } ] },
      choices: [
        { label: 'Hỏi cô bán xôi có ai đánh rơi', text: 'Cô bảo của một chú vừa mua xôi. Chú quay lại tìm, cảm ơn rối rít và mua tặng bạn gói xôi gấc.',
          effects: { karma: 6, happy: 3, health: 1 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { vendor: 'clap' }, npcSay: { vendor: 'Con ngoan quá trời!' } } },
        { label: 'Đút túi, khao bạn bè quà vặt', text: 'Bạn khao cả nhóm một chầu bánh tráng trộn. Ngon thật, nhưng hơi áy náy.',
          effects: { happy: 4, karma: -3 },
          scene: { anim: 'laugh', fx: 'money' } },
        { label: 'Mang nộp cho cô chủ nhiệm', text: 'Cô khen bạn trước cả lớp, tên bạn còn được đọc trong giờ chào cờ sáng thứ Hai.',
          effects: { karma: 6, happy: 4 },
          scene: { loc: 'school', anim: 'cheer', fx: 'stars' } }
      ]
    },

    {
      id: 'c_chicks', title: 'Gà con bảy màu', icon: '🐥', age: [6, 10],
      text: 'Cổng trường có ông bán gà con nhuộm xanh đỏ tím vàng, kêu chiêm chiếp trong cái lồng tre. {money:10000} một con. Học trò vây kín, bạn đứng nhìn không rời mắt.',
      scene: { loc: 'street', time: 'day', anim: 'idle', fx: 'hearts', shot: 'close',
        npcs: [ { role: 'vendor', gender: 'm', age: 65, anim: 'talk', say: 'Gà bảy màu đây, mười ngàn một con!' }, { role: 'crowd', anim: 'point' } ] },
      choices: [
        { label: 'Mua một con về nuôi', req: { minMoney: 10000 },
          outcomes: [
            { p: 0.5, text: 'Bạn đặt tên nó là “Tí Hon”, làm ổ bằng hộp giày. Nó lớn khoẻ thành con gà mái, ngày ngày đẻ trứng cho cả nhà.',
              effects: { money: -10000, happy: 6, karma: 2, flag: 'nuoi_ga' }, scene: { anim: 'cheer', fx: 'hearts', npcAnim: { vendor: 'nod' } } },
            { p: 0.5, text: 'Ba ngày sau, Tí Hon nằm im trong hộp giày. Bạn chôn nó dưới gốc cây, khóc cả buổi chiều.',
              effects: { money: -10000, happy: -5 }, scene: { anim: 'cry', fx: 'tears', loc: 'home' } }
          ] },
        { label: 'Mặc cả mua hai con', req: { minMoney: 15000 }, text: 'Ông cười móm mém, bán cho bạn hai con với giá một con rưỡi. Bạn về khoe tài mặc cả với cả nhà.',
          effects: { money: -15000, happy: 5, smarts: 1 },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { vendor: 'laugh' } } },
        { label: 'Thương gà bị nhuộm, không mua', text: 'Bạn nghĩ lũ gà con chắc khó chịu lắm với lớp phẩm màu. Về nhà bạn tìm đọc cách chăm gà và biết thêm bao điều thú vị.',
          effects: { karma: 3, smarts: 2 },
          scene: { anim: 'sad', fx: 'question', npcAnim: { vendor: 'shrug' } } }
      ]
    },

    {
      id: 'c_class_duty', title: 'Ngày trực nhật', icon: '🧹', age: [6, 11], req: { school: true },
      text: 'Hôm nay tổ bạn trực nhật. Lớp học la liệt vỏ bánh, giấy vụn, bảng đen chi chít chữ. Mấy đứa cùng tổ đã lén chuồn về từ lúc nào.',
      scene: { loc: 'school', time: 'dusk', anim: 'think', fx: 'dust', shot: 'wide',
        npcs: [ { role: 'classmate', anim: 'run', say: 'Tui về trước nha, mai tui trực bù!' } ] },
      choices: [
        { label: 'Một mình dọn sạch sẽ', text: 'Bạn lau bảng, quét lớp, xếp bàn ghế tới tối mịt. Sáng hôm sau cô chủ nhiệm khen tổ bạn, nhìn bạn đầy trìu mến.',
          effects: { karma: 5, health: 1, happy: 1 },
          scene: { anim: 'walk', fx: 'sparkle' } },
        { label: 'Quét qua loa rồi về', text: 'Sáng hôm sau cô phát hiện một bãi kẹo cao su dưới gầm bàn. Cả tổ bị trực thêm một tuần.',
          effects: { happy: -2, karma: -1 },
          scene: { anim: 'shrug', fx: 'anger' } },
        { label: 'Ghi tên mấy đứa trốn trực', text: 'Mấy đứa trốn bị phạt trực một tuần. Tụi nó gọi bạn là “Bao Công” và giận cả tháng.',
          effects: { karma: 1, happy: -1, smarts: 1 },
          scene: { anim: 'point', fx: 'exclaim', npcAnim: { classmate: 'angry' } } }
      ]
    },

    {
      id: 'c_o_an_quan', title: 'Giờ ra chơi', icon: '🪀', age: [6, 10], weight: 1.2, req: { school: true },
      text: 'Giờ ra chơi rộn tiếng cười. Một nhóm kẻ ô ăn quan bằng phấn, nhóm khác nhảy dây, nhóm nữa đá cầu. Ai cũng gọi bạn nhập hội.',
      scene: { loc: 'school', time: 'day', anim: 'idle', fx: 'music', shot: 'wide',
        npcs: [ { role: 'kid', anim: 'jump', say: 'Nhảy dây không? Thiếu một người nè!' }, { role: 'classmate', anim: 'sit', say: 'Ô ăn quan nè, vô đi!' } ] },
      choices: [
        { label: 'Chơi ô ăn quan',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn tính nước rải sỏi như một kỳ thủ, ăn trọn hai quan. Cả đám xúm lại xin “bí kíp”.',
              effects: { smarts: 3, happy: 5 }, scene: { anim: 'cheer', fx: 'stars', npcAnim: { classmate: 'clap' } } },
            { text: 'Bạn rải một vòng… và ăn đúng ô trống. Thua sạch, nhưng cười đã đời.',
              effects: { smarts: 1, happy: 2 }, scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { classmate: 'laugh' } } }
          ] },
        { label: 'Nhảy dây',
          success: { stat: 'health', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn nhảy qua mức dây ngang đầu mà không vướng. Cả sân vỗ tay rần rần.',
              effects: { health: 3, happy: 5 }, scene: { anim: 'jump', fx: 'confetti', npcAnim: { kid: 'clap' } } },
            { text: 'Dây vướng chân, bạn ngã chổng vó. Đầu gối trầy nhẹ, nhưng mai lại chơi tiếp.',
              effects: { health: -1, happy: 1 }, scene: { anim: 'fall', fx: 'dust', npcAnim: { kid: 'laugh' } } }
          ] },
        { label: 'Ngồi đọc truyện tranh một mình', text: 'Bạn đọc hết một cuốn truyện tranh trong mười lăm phút ra chơi. Yên bình, dù hơi lẻ loi.',
          effects: { smarts: 2, happy: 1 },
          scene: { anim: 'study', fx: 'idea' } }
      ]
    },

    {
      id: 'c_school_snacks', title: 'Thiên đường quà vặt', icon: '🍢', age: [6, 12], once: false, cooldown: 3, req: { minMoney: 20000 },
      text: 'Trống tan trường vừa dứt, cổng trường đã thành thiên đường quà vặt: bánh tráng trộn, xoài lắc, kem que, mực nướng. Trong túi bạn còn đúng {money:20000}.',
      scene: { loc: 'street', time: 'dusk', anim: 'think', fx: 'steam', shot: 'wide',
        npcs: [ { role: 'vendor', gender: 'f', anim: 'cook', say: 'Bánh tráng trộn mười ngàn nè con!' }, { role: 'kid', anim: 'idle' }, { role: 'crowd', anim: 'walk' } ] },
      choices: [
        { label: 'Bánh tráng trộn, thêm trứng cút', text: 'Chua cay mặn ngọt đủ vị, bạn hít hà suýt xoa. Ngon tới mức quên cả đường về.',
          effects: { money: -15000, happy: 5, health: -1 },
          scene: { anim: 'eat', fx: 'steam', npcAnim: { vendor: 'nod' } } },
        { label: 'Nhịn, để dành bỏ ống heo', text: 'Bạn nuốt nước miếng đi thẳng một mạch. Một tháng sau ống heo đầy hơn hẳn, bạn tự hào lắm.',
          effects: { happy: -1, smarts: 1, flag: 'tiet_kiem' },
          scene: { anim: 'walk', fx: 'money' } },
        { label: 'Chia đôi cây kem với bạn nghèo cùng lớp', text: 'Hai đứa ngồi vỉa hè liếm chung một cây kem. Rẻ nhất mà ngon nhất.',
          effects: { money: -5000, karma: 5, happy: 4 },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { kid: 'laugh' }, npcSay: { kid: 'Cảm ơn nha, ngon ghê!' } } }
      ]
    },

    {
      id: 'c_trading_cards', title: 'Cơn sốt thẻ bài', icon: '🃏', age: [7, 11],
      text: 'Cả lớp đang phát cuồng vì thẻ bài siêu nhân, đứa nào có thẻ “ánh kim” là được tôn như vua. Mỗi gói {money:5000}, cả hộp thì {money:100000}.',
      scene: { loc: 'home', time: 'day', anim: 'talk', fx: 'question', shot: 'close',
        npcs: [ { role: 'mother', anim: 'think', say: 'Mua thẻ bài để làm gì vậy con?' } ] },
      choices: [
        { label: 'Năn nỉ mẹ cho tiền',
          outcomes: [
            { p: 0.5, text: 'Mẹ cho tiền với điều kiện thi học kỳ trên 8. Bạn mở hộp được đúng một lá ánh kim, sướng run người.',
              effects: { happy: 6, rel: { mother: 1 } }, scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { mother: 'shrug' } } },
            { p: 0.5, text: 'Mẹ từ chối thẳng thừng: “Tiền đâu mà phung phí!”. Bạn ôm gối dỗi tới bữa tối.',
              effects: { happy: -3, rel: { mother: -2 } }, scene: { anim: 'sad', fx: 'anger', npcAnim: { mother: 'shake' } } }
          ] },
        { label: 'Đập ống heo mua cả hộp', req: { minMoney: 100000 }, text: 'Bạn mua cả hộp, oai được đúng một tuần. Sau đó cả xấp thẻ bị cô giáo tịch thu vì chơi trong giờ.',
          effects: { money: -100000, happy: 2 },
          scene: { anim: 'facepalm', fx: 'sweat' } },
        { label: 'Tự vẽ thẻ bài bằng bìa cứng', text: 'Bộ thẻ “siêu nhân tự chế” của bạn bất ngờ thành mốt. Cả lớp đặt hàng, bạn kiếm được {money:30000}.',
          effects: { smarts: 3, happy: 5, money: 30000 },
          scene: { anim: 'study', fx: 'idea', npcAnim: { mother: 'clap' } } }
      ]
    },

    {
      id: 'c_rain_bath', title: 'Tắm mưa', icon: '🌧️', age: [5, 11],
      text: 'Cơn mưa rào đầu mùa ập xuống, nước trắng xoá cả con hẻm. Lũ trẻ hàng xóm cởi áo lao ra đường, hò hét, té nước, đá bóng trong mưa.',
      scene: { loc: 'street', time: 'day', weather: 'rain', anim: 'idle', fx: 'bubbles', shot: 'wide',
        npcs: [ { role: 'kid', anim: 'jump', say: 'Ra đây! Tắm mưa vui lắm!' }, { role: 'mother', anim: 'point', say: 'Không được ra, cảm bây giờ!' } ] },
      choices: [
        { label: 'Lao ra tắm mưa',
          outcomes: [
            { p: 0.65, text: 'Bạn chạy nhảy tới khi mưa tạnh, đã đời nhất năm. Về nhà mẹ vừa lau đầu vừa mắng, rồi nấu cho bát cháo hành.',
              effects: { happy: 7, health: 1, rel: { mother: -1 } }, scene: { anim: 'dance', fx: 'bubbles', npcAnim: { kid: 'dance', mother: 'facepalm' } } },
            { p: 0.35, text: 'Tắm mưa vui thật, nhưng tối đó bạn sốt hầm hập, sổ mũi cả tuần.',
              effects: { happy: 3, health: -5 }, scene: { anim: 'sick', fx: 'sick', loc: 'bedroom', npcAnim: { mother: 'talk' } } }
          ] },
        { label: 'Ngồi hiên nhà ngắm mưa', text: 'Bạn ngồi nghe mưa rơi lộp độp trên mái tôn, mùi đất ngai ngái. Bình yên đến lạ.',
          effects: { happy: 2, smarts: 1 },
          scene: { anim: 'sit', fx: 'music', npcAnim: { mother: 'nod' } } },
        { label: 'Lấy thau ra làm “hồ bơi”', text: 'Cái thau nhôm của mẹ thành hồ bơi mini, bạn ngồi gọn trong đó cười khanh khách. Mẹ đứng nhìn, chẳng nỡ mắng.',
          effects: { happy: 5, rel: { mother: 2 } },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { mother: 'laugh' } } }
      ]
    },

    {
      id: 'c_summer_countryside', title: 'Hè về quê', icon: '🌾', age: [6, 12], weight: 1.3,
      text: 'Nghỉ hè, bạn được gửi về quê với {grandparent.k} {grandparent}. Không wifi, không máy lạnh, chỉ có đồng lúa, bờ tre, con trâu và những buổi chiều dài vô tận.',
      scene: { loc: 'countryside', time: 'day', anim: 'walk', fx: 'sparkle', shot: 'wide',
        npcs: [ { role: 'grandparent', anim: 'wave', say: 'Cháu về rồi đó hả? Lại đây!' }, { role: 'kid', anim: 'run' } ] },
      choices: [
        { label: 'Theo đám trẻ quê đi bắt cá', text: 'Bạn lội ruộng, mò cua, bắt cào cào, đen nhẻm như cột nhà cháy. Mùa hè đáng nhớ nhất đời.',
          effects: { happy: 7, health: 3, looks: -1 },
          scene: { anim: 'run', fx: 'sparkle', npcAnim: { kid: 'cheer' } } },
        { label: 'Phụ {grandparent.k} nấu cơm, làm vườn', text: '{grandparent.K} dạy bạn nhóm bếp rơm, nấu nồi cơm cháy giòn rụm. Tối nào cũng ngồi ngoài hiên nghe kể chuyện ngày xưa.',
          effects: { karma: 3, smarts: 2, happy: 4, rel: { grandparent: 8 } },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { grandparent: 'talk' } } },
        { label: 'Đòi về thành phố vì chán', text: 'Bạn gọi điện khóc lóc đòi về. {grandparent.K} buồn hiu, lặng lẽ gói cho bạn túi ổi với hũ mắm mang theo.',
          effects: { happy: -2, rel: { grandparent: -5 } },
          scene: { anim: 'phone', fx: 'tears', npcAnim: { grandparent: 'sad' } } }
      ]
    },

    {
      id: 'c_kite', title: 'Cánh diều chiều gió', icon: '🪁', age: [6, 12],
      text: 'Chiều lộng gió, bạn cùng mấy đứa trong xóm mang con diều giấy tự dán ra bãi cỏ ven hồ. Gió thổi phần phật, con diều chao nghiêng đòi bay.',
      scene: { loc: 'park', time: 'dusk', anim: 'run', fx: 'dust', shot: 'low',
        npcs: [ { role: 'kid', anim: 'run', say: 'Thả dây ra! Thả dây ra!' } ] },
      choices: [
        { label: 'Chạy thật nhanh cho diều lên',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Con diều vút lên cao, chấp chới giữa trời chiều. Bạn nằm ngửa trên cỏ ngắm nó cả tiếng đồng hồ.',
              effects: { happy: 6, health: 2 }, scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { kid: 'clap' } } },
            { text: 'Diều cắm đầu xuống đất ba lần, lần thứ tư thì mắc lên cành liễu. Thôi, mai làm con khác.',
              effects: { happy: -1, health: 1 }, scene: { anim: 'facepalm', fx: 'dust', npcAnim: { kid: 'laugh' } } }
          ] },
        { label: 'Cắt dây diều đứa khác',
          outcomes: [
            { p: 0.5, text: 'Diều của đứa kia bay mất hút. Nó khóc ầm lên, bạn thắng mà chẳng thấy vui.',
              effects: { karma: -4, happy: 1 }, scene: { anim: 'laugh', fx: 'question', npcAnim: { kid: 'cry' } } },
            { p: 0.5, text: 'Dây quấn vào nhau, cả hai con diều cùng rơi. Hai đứa nhìn nhau, rồi phá lên cười.',
              effects: { happy: 3 }, scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { kid: 'laugh' } } }
          ] },
        { label: 'Dạy đứa nhỏ hơn cách thả diều', text: 'Đứa nhỏ thả được diều lần đầu, mắt sáng rỡ. Nó gọi bạn là “sư phụ” suốt cả mùa hè.',
          effects: { karma: 4, happy: 4 },
          scene: { anim: 'point', fx: 'stars', npcAnim: { kid: 'cheer' }, npcSay: { kid: 'Sư phụ ơi, bay rồi nè!' } } }
      ]
    },

    {
      id: 'c_keo_keo', title: 'Đổi dép lấy kẹo kéo', icon: '🍭', age: [5, 9],
      text: 'Tiếng rao “Ai đổi dép đứt, nhôm nhựa đồng nát lấy kẹo kéo đây!” vang lên đầu hẻm. Đôi dép tổ ong của bạn mới đứt quai hôm qua…',
      scene: { loc: 'street', time: 'day', anim: 'think', fx: 'idea', shot: 'wide',
        npcs: [ { role: 'vendor', gender: 'm', anim: 'walk', say: 'Đổi dép đứt lấy kẹo kéo đây!' }, { role: 'kid', anim: 'run' } ] },
      choices: [
        { label: 'Đổi đôi dép đứt', text: 'Chú kéo cho bạn một sợi kẹo dài gần nửa mét, giòn tan, thơm mùi gừng. Đôi dép đứt chưa bao giờ đáng giá đến thế.',
          effects: { happy: 5 },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { vendor: 'laugh', kid: 'clap' } } },
        { label: 'Đổi luôn đôi dép còn lành trong nhà', text: 'Kẹo ngon thật, nhưng tối đó cả nhà đi tìm đôi dép. Bạn ăn một trận đòn nhớ đời.',
          effects: { happy: 2, karma: -3, health: -1 },
          scene: { anim: 'cry', fx: 'anger', npcAnim: { vendor: 'shrug' } } },
        { label: 'Đứng nhìn, nuốt nước miếng', text: 'Chú bán kẹo thấy tội, bẻ cho bạn một mẩu nhỏ. “Lần sau có dép đứt thì nhớ chú nha.”',
          effects: { happy: 3, karma: 1 },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { vendor: 'nod' } } }
      ]
    },

    {
      id: 'c_lost_tooth', title: 'Chiếc răng sữa', icon: '🦷', age: [5, 8],
      text: 'Chiếc răng cửa lung lay cả tuần cuối cùng cũng rụng khi bạn cắn miếng ổi. Bạn cầm chiếc răng bé xíu, cười toe với một lỗ hổng to tướng.',
      scene: { loc: 'home', time: 'day', anim: 'laugh', fx: 'sparkle', shot: 'close',
        npcs: [ { role: 'mother', anim: 'laugh', say: 'Ném lên mái nhà cho răng mọc nhanh!' } ] },
      choices: [
        { label: 'Ném lên mái, ước răng mọc đều', text: 'Chiếc răng bay lên mái tôn cái “cạch”. Vài tháng sau răng mới mọc thẳng tắp.',
          effects: { looks: 2, happy: 3 },
          scene: { anim: 'jump', fx: 'stars', loc: 'street', npcAnim: { mother: 'clap' } } },
        { label: 'Cất vào hộp làm kỷ niệm', text: 'Bạn cất chiếc răng vào hộp diêm, giấu dưới gối. Sáng ra có thêm {money:20000} bên cạnh — mẹ bảo “tiên răng gửi đó”.',
          effects: { money: 20000, happy: 5, rel: { mother: 3 } },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { mother: 'love' } } },
        { label: 'Mang lên lớp khoe', text: 'Cả lớp xúm lại xem như báu vật. Bạn nổi tiếng nguyên ngày với biệt danh “Sún”.',
          effects: { happy: 3, looks: -1 },
          scene: { anim: 'laugh', fx: 'exclaim', loc: 'school' } }
      ]
    },

    {
      id: 'c_teacher_day', title: 'Ngày Nhà giáo 20/11', icon: '💐', age: [7, 17], once: false, cooldown: 3, req: { school: true },
      text: 'Sắp tới ngày 20/11, cả lớp rộn ràng chuẩn bị quà cho cô chủ nhiệm {teacher}. Đứa góp tiền mua hoa, đứa làm thiệp, đứa tập văn nghệ.',
      scene: { loc: 'school', time: 'day', anim: 'think', fx: 'petals', shot: 'wide',
        npcs: [ { role: 'teacher', gender: 'f', anim: 'idle' }, { role: 'classmate', anim: 'talk', say: 'Góp hai chục mua hoa tặng cô nha!' } ] },
      choices: [
        { label: 'Tự tay làm thiệp cảm ơn', text: 'Cô {teacher} đọc tấm thiệp, lặng đi một lúc rồi ôm bạn. Tấm thiệp được cô kẹp trong giáo án nhiều năm sau.',
          effects: { karma: 4, happy: 4, smarts: 1 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { teacher: 'hug' }, npcSay: { teacher: 'Cảm ơn em, cô sẽ giữ mãi.' } } },
        { label: 'Góp tiền mua hoa', req: { minMoney: 20000 }, text: 'Bó hoa rực rỡ được cả lớp trao tặng. Cô cười tươi, bảo đó là bó hoa đẹp nhất năm.',
          effects: { money: -20000, karma: 2, happy: 3 },
          scene: { anim: 'clap', fx: 'petals', npcAnim: { teacher: 'laugh', classmate: 'clap' } } },
        { label: 'Hát tặng cô một bài',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Giọng bạn run run nhưng tha thiết, cả lớp lặng im. Cô {teacher} rưng rưng nước mắt.',
              effects: { happy: 6, karma: 2, looks: 1 }, scene: { anim: 'sing', fx: 'music', npcAnim: { teacher: 'clap' }, npcExpr: { teacher: 'happy' } } },
            { text: 'Bạn lạc tông từ câu thứ hai, cả lớp cười nghiêng ngả. Cô vẫn vỗ tay to nhất.',
              effects: { happy: 2 }, scene: { anim: 'sing', fx: 'sweat', npcAnim: { classmate: 'laugh', teacher: 'clap' } } }
          ] }
      ]
    },

    {
      id: 'c_class_monitor', title: 'Bầu lớp trưởng', icon: '🏅', age: [7, 11], req: { school: true },
      text: 'Đầu năm học, cô chủ nhiệm cho cả lớp bầu lớp trưởng. Bất ngờ, có đứa đề cử tên bạn. Cả lớp quay xuống nhìn.',
      scene: { loc: 'school', time: 'day', anim: 'idle', expr: 'surprised', fx: 'exclaim', shot: 'wide',
        npcs: [ { role: 'teacher', gender: 'f', anim: 'point', say: 'Em có muốn ứng cử không, {name}?' }, { role: 'classmate', anim: 'clap' } ] },
      choices: [
        { label: 'Nhận lời, hứa làm thật tốt',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn trúng cử với số phiếu áp đảo. Từ nay bạn giữ sổ đầu bài và… bị cả lớp nhờ xin cô cho về sớm.',
              effects: { smarts: 2, happy: 5, karma: 2, flag: 'lop_truong' }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { classmate: 'clap' } } },
            { text: 'Bạn thua sát nút đứa học giỏi nhất lớp, được làm lớp phó lao động. Cũng là một chức vụ!',
              effects: { happy: 1, smarts: 1 }, scene: { anim: 'shrug', fx: 'sweat', npcAnim: { classmate: 'laugh' } } }
          ] },
        { label: 'Từ chối, đề cử {classmate}', text: 'Bạn đề cử {classmate}, người vẫn hay giúp mọi người. {classmate} trúng cử và cảm ơn bạn mãi.',
          effects: { karma: 4, happy: 1 },
          scene: { anim: 'point', fx: 'sparkle', npcAnim: { classmate: 'bow' } } },
        { label: 'Hứa “bỏ bài tập về nhà” để kiếm phiếu', text: 'Cả lớp hò reo bầu bạn. Cô {teacher} mỉm cười giao bạn làm lớp trưởng… kiêm luôn việc chép bài tập lên bảng mỗi ngày.',
          effects: { happy: 4, smarts: 1, flag: 'lop_truong' },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { teacher: 'laugh', classmate: 'cheer' } } }
      ]
    },

    {
      id: 'c_piggy_bank', title: 'Đập hay không đập?', icon: '🐷', age: [6, 12],
      text: 'Con heo đất trên nóc tủ đã nặng trĩu sau mấy năm nuôi. Bạn ôm nó lắc lắc, nghe tiền xu va vào nhau lách cách. Đập hay không đập?',
      scene: { loc: 'bedroom', time: 'day', anim: 'think', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Đập! Đếm tiền', text: 'Bạn đếm được {money:650000}, tiền xu lẫn tiền giấy nhàu nát. Cảm giác giàu có thật là phê!',
          effects: { money: 650000, happy: 5 },
          scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Nuôi tiếp tới khi thật đầy', text: 'Bạn đặt heo đất về chỗ cũ, nhét thêm một đồng xu. Kiên nhẫn là đức tính của người giàu (theo lời bạn).',
          effects: { smarts: 2, karma: 1, happy: 1, flag: 'tiet_kiem' },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Khoét lỗ rút vài tờ rồi dán lại',
          outcomes: [
            { p: 0.5, text: 'Phi vụ hoàn hảo! Bạn có {money:100000} tiêu vặt mà heo đất vẫn “lành lặn”.',
              effects: { money: 100000, happy: 3, karma: -1 }, scene: { anim: 'laugh', fx: 'money' } },
            { p: 0.5, text: 'Băng keo bung ra ngay trước mặt cả nhà. Toàn bộ kho báu bị tịch thu “giữ hộ”.',
              effects: { happy: -4 }, scene: { anim: 'facepalm', fx: 'sweat', loc: 'home' } }
          ] }
      ]
    },

    {
      id: 'c_rare_buffalo', title: 'Cưỡi trâu', icon: '🐃', age: [5, 12], weight: 0.3,
      text: 'Về quê chơi, một chú bé chăn trâu rủ bạn cưỡi con trâu đực to nhất làng. Con trâu nhai cỏ, liếc bạn một cái đầy khinh bỉ.',
      scene: { loc: 'countryside', time: 'day', anim: 'think', fx: 'question', shot: 'low',
        npcs: [ { role: 'kid', gender: 'm', anim: 'wave', say: 'Leo lên đi, nó hiền lắm!' } ] },
      choices: [
        { label: 'Leo lên lưng trâu',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn ngồi vắt vẻo trên lưng trâu, đi một vòng quanh bờ ruộng như tướng quân. Đứa trẻ thành phố hiếm ai được thế!',
              effects: { happy: 7, health: 2 }, scene: { anim: 'cheer', fx: 'stars', npcAnim: { kid: 'clap' } } },
            { text: 'Con trâu lắc mình một cái, bạn rơi tõm xuống vũng bùn. Cả đám trẻ cười rần, bạn cũng cười theo.',
              effects: { happy: 3, looks: -1 }, scene: { anim: 'fall', fx: 'dust', npcAnim: { kid: 'laugh' } } }
          ] },
        { label: 'Đứng ngoài xem thôi', text: 'Bạn giữ khoảng cách an toàn. Con trâu quay lưng, quất đuôi đuổi ruồi đúng vào mặt bạn.',
          effects: { happy: 1 },
          scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { kid: 'laugh' } } }
      ]
    },

    {
      id: 'c_rare_tv', title: 'Lên sóng truyền hình', icon: '📺', age: [8, 15], weight: 0.3,
      text: 'Đang chơi ở công viên thì một đoàn làm phim dừng bạn lại phỏng vấn về “ước mơ tuổi thơ” cho chương trình thiếu nhi. Máy quay chĩa thẳng vào mặt bạn.',
      scene: { loc: 'park', time: 'day', anim: 'scared', fx: 'flash', shot: 'close',
        npcs: [ { role: 'stranger', gender: 'f', age: 28, anim: 'talk', say: 'Ước mơ lớn nhất của em là gì nào?' }, { role: 'crowd', anim: 'idle' } ] },
      choices: [
        { label: 'Trả lời thật lòng, ngắn gọn', text: 'Câu trả lời giản dị của bạn được lên sóng. Họ hàng gọi điện khoe nhau suốt cả tuần.',
          effects: { happy: 6, looks: 2 },
          scene: { anim: 'talk', fx: 'stars', npcAnim: { stranger: 'nod' } } },
        { label: 'Diễn sâu như thí sinh hoa hậu', text: 'Bạn nói “Em ước ai trên thế giới này cũng được hạnh phúc” với ánh mắt xa xăm. Đoạn clip lan khắp mạng, bạn nổi tiếng… theo kiểu hơi buồn cười.',
          effects: { happy: 4, looks: 1 },
          scene: { anim: 'wave', fx: 'flash', npcAnim: { all: 'laugh' } } },
        { label: 'Ú ớ, bỏ chạy', text: 'Bạn chạy biến trước khi kịp nói chữ nào. Cảnh “bé bỏ chạy” vẫn được phát sóng, khán giả cười nghiêng ngả.',
          effects: { happy: -1 },
          scene: { anim: 'run', fx: 'dust', npcAnim: { stranger: 'laugh' } } }
      ]
    },

    {
      id: 'c_storm', title: 'Đêm bão về', icon: '🌀', age: [5, 17], once: false, cooldown: 4,
      text: 'Bão về. Gió rít từng cơn, mưa quất ràn rạt vào cửa, mái tôn kêu răng rắc như muốn bay. Cả nhà thắp nến, ngồi co ro giữa phòng khách.',
      scene: { loc: 'home', time: 'night', weather: 'storm', anim: 'scared', fx: 'exclaim', shot: 'dramatic',
        npcs: [ { role: 'mother', anim: 'talk', say: 'Đừng sợ, có mẹ đây rồi.' } ] },
      choices: [
        { label: 'Phụ mẹ kê đồ, chèn cửa', text: 'Bạn khiêng ghế, chèn bao cát, lau nước tràn vào nhà. Sáng ra căn nhà vẫn vững, mẹ nhìn bạn: “Lớn thật rồi”.',
          effects: { karma: 4, health: -1, happy: 2, rel: { mother: 5 } },
          scene: { anim: 'run', fx: 'sweat', npcAnim: { mother: 'nod' } } },
        { label: 'Trùm chăn kín đầu', text: 'Bạn trùm chăn tới sáng, tim đập thình thịch mỗi lần sấm nổ. Sáng ra cây bàng đầu hẻm đổ ngang đường.',
          effects: { happy: -3 },
          scene: { anim: 'sleep', fx: 'zzz', loc: 'bedroom' } },
        { label: 'Kể chuyện ma cho đỡ sợ', text: 'Câu chuyện ma của bạn làm cả nhà quên cả bão… nhưng đêm đó không ai dám đi vệ sinh một mình.',
          effects: { happy: 3, rel: { mother: 2 } },
          scene: { anim: 'talk', fx: 'exclaim', npcAnim: { mother: 'scared' } } }
      ]
    },

    {
      id: 'c_football_window', title: 'Cú sút định mệnh', icon: '⚽', age: [8, 15],
      text: 'Trận bóng trong hẻm đang tới hồi gay cấn. Bạn tung một cú sút sấm sét… và “XOẢNG!” — cửa kính nhà bác {neighbor} vỡ tan tành.',
      scene: { loc: 'street', time: 'dusk', anim: 'scared', fx: 'flash', shot: 'dramatic',
        npcs: [ { role: 'neighbor', gender: 'm', age: 55, anim: 'angry', say: 'Đứa nào?! Đứa nào sút?!' }, { role: 'kid', anim: 'run' } ] },
      choices: [
        { label: 'Đứng ra nhận lỗi', text: 'Bác {neighbor} mắng một trận, nhưng thấy bạn thật thà nên chỉ bắt đền một nửa. Bạn trích tiền tiết kiệm ra trả.',
          effects: { moneyPct: -0.3, karma: 6, happy: -2 },
          scene: { anim: 'bow', fx: 'sweat', npcAnim: { neighbor: 'nod' }, npcSay: { neighbor: 'Thôi được, lần sau cẩn thận!' } } },
        { label: 'Bỏ chạy cùng cả đám',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Cả đám tán loạn vào các ngõ ngách. Không ai bị bắt, nhưng cả tuần chẳng ai dám đá bóng ở đó nữa.',
              effects: { karma: -4, happy: 2 }, scene: { anim: 'run', fx: 'dust', npcAnim: { kid: 'run' } } },
            { text: 'Bác {neighbor} túm được cổ áo bạn, dẫn thẳng về nhà. Người nhà phải đền tiền kính, bạn bị cấm đá bóng một tháng.',
              effects: { karma: -4, happy: -6 }, scene: { anim: 'sad', fx: 'anger', npcAnim: { neighbor: 'point' } } }
          ] },
        { label: 'Đổ tội cho đứa khác', text: 'Đứa kia bị oan, nhìn bạn đầy uất ức. Bác {neighbor} chẳng tin ai, bắt cả đám chia nhau đền.',
          effects: { karma: -6, moneyPct: -0.1, happy: -3 },
          scene: { anim: 'point', fx: 'anger', npcAnim: { kid: 'angry' } } }
      ]
    },

    {
      id: 'c_rare_ghost_night', title: 'Chuyện ma đêm cúp điện', icon: '🕯️', age: [8, 13], weight: 0.35,
      text: 'Cúp điện cả xóm, đám trẻ ngồi quanh cây nến kể chuyện ma. Đúng lúc đứa lớn nhất kể tới đoạn “và rồi… có tiếng gõ cửa” thì — “cốc, cốc, cốc”!',
      scene: { loc: 'street', time: 'night', anim: 'scared', fx: 'exclaim', shot: 'dramatic',
        npcs: [ { role: 'kid', anim: 'scared', say: 'Ai… ai gõ cửa đó?!' }, { role: 'neighbor', gender: 'f', age: 45, anim: 'idle' } ] },
      choices: [
        { label: 'Hét lên bỏ chạy', text: 'Bạn chạy một mạch về nhà, chui vào chăn. Hoá ra người gõ cửa là cô {neighbor} mang chè sang cho tụi nhỏ.',
          effects: { happy: 1 },
          scene: { anim: 'run', fx: 'dust', npcAnim: { neighbor: 'laugh', kid: 'run' } } },
        { label: 'Can đảm ra mở cửa', text: 'Bạn run run mở cửa: cô {neighbor} đứng đó với nồi chè đậu đen. Cả đám ùa ra, bạn được tôn là “người gan nhất xóm”.',
          effects: { happy: 5, karma: 1 },
          scene: { anim: 'cheer', fx: 'stars', npcAnim: { neighbor: 'wave', kid: 'cheer' }, npcSay: { neighbor: 'Chè nè mấy đứa, ăn đi!' } } },
        { label: 'Gõ lại “cốc cốc” doạ ngược', text: 'Tiếng gõ ngoài cửa im bặt, rồi có tiếng cô {neighbor} hét lên. Cả đám cười nắc nẻ, nồi chè suýt đổ.',
          effects: { happy: 6, karma: -1 },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { neighbor: 'scared', kid: 'laugh' } } }
      ]
    },

    // ───────────────────────── TUỔI TEEN 10–17 ─────────────────────────
    {
      id: 'c_crush', title: 'Rung động đầu đời', icon: '💌', age: [12, 17], weight: 1.5, req: { lacks: ['partner', 'spouse'] },
      text: 'Mấy tuần nay, cứ tới giờ ra chơi là bạn lại liếc sang chỗ {classmate} ngồi. Tim đập loạn mỗi lần người ấy cười. Đứa bạn thân cứ xúi tỏ tình đi.',
      scene: { loc: 'school', time: 'day', anim: 'think', expr: 'love', fx: 'hearts', shot: 'close',
        npcs: [ { role: 'classmate', anim: 'study' }, { role: 'kid', anim: 'point', say: 'Tỏ tình đi, sợ gì!' } ] },
      choices: [
        { label: 'Viết thư tay kẹp vào vở',
          success: { stat: 'looks', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Hôm sau, trong vở bạn có một mảnh giấy gấp hình trái tim: “Mình cũng thích bạn”. Bạn suýt hét lên giữa giờ Toán.',
              effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'classmate' } },
              scene: { anim: 'love', fx: 'hearts', npcAnim: { classmate: 'love', kid: 'cheer' } } },
            { text: '{classmate} đọc thư, cười nhẹ rồi trả lại: “Mình coi bạn là bạn thôi”. Tối đó bạn nghe nhạc buồn tới khuya.',
              effects: { happy: -6 },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { classmate: 'shrug', kid: 'facepalm' } } }
          ] },
        { label: 'Nhắn tin tỏ tình lúc nửa đêm',
          success: { stat: 'looks', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Ba chấm “đang soạn tin” hiện lên, tắt, rồi lại hiện… “Ừ, mình đồng ý”. Bạn ôm điện thoại lăn lộn trên giường.',
              effects: { happy: 10, addPerson: { role: 'partner', fromScene: 'classmate' } },
              scene: { loc: 'bedroom', time: 'night', anim: 'phone', fx: 'hearts' } },
            { text: 'Tin nhắn hiện “Đã xem” lúc 0 giờ 12. Không trả lời. Mãi mãi không trả lời.',
              effects: { happy: -7 },
              scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Giữ trong lòng, lặng lẽ nhìn', text: 'Bạn viết tên {classmate} vào góc vở rồi tẩy đi, ngày nào cũng thế. Tình đầu, đẹp vì chưa nói.',
          effects: { happy: 1, smarts: 1 },
          scene: { anim: 'study', fx: 'petals', npcAnim: { kid: 'shrug' } } }
      ]
    },

    {
      id: 'c_extra_class', title: 'Chạy sô học thêm', icon: '📚', age: [11, 17], req: { school: true },
      text: 'Lớp bạn ai cũng đi học thêm, bạn cũng bị cuốn theo: Toán, Lý, Anh ở ba lò luyện khác nhau. Lịch kín từ sáng tới chín giờ tối, bữa tối là ổ bánh mì ăn vội.',
      scene: { loc: 'school', time: 'night', anim: 'study', expr: 'sleepy', fx: 'sweat', shot: 'wide',
        npcs: [ { role: 'teacher', gender: 'm', anim: 'point', say: 'Dạng này chắc chắn ra thi, chép lại!' }, { role: 'classmate', anim: 'study' } ] },
      choices: [
        { label: 'Cày hết, không bỏ buổi nào', text: 'Bạn học như cái máy, điểm số tăng vọt, quầng thâm mắt cũng vậy.',
          effects: { smarts: 6, health: -3, happy: -3 },
          scene: { anim: 'study', fx: 'sweat', npcAnim: { teacher: 'nod' } } },
        { label: 'Bỏ bớt, tự học ở nhà', text: 'Bạn giữ lại môn yếu nhất, còn lại tự học theo cách mình. Điểm không vọt lên nhưng tối nào cũng được ngủ đủ.',
          effects: { smarts: 3, health: 2, happy: 2 },
          scene: { loc: 'bedroom', anim: 'study', fx: 'idea' } },
        { label: 'Đóng tiền rồi trốn đi chơi',
          outcomes: [
            { p: 0.5, text: 'Ba tháng trời không ai phát hiện. Tới khi bảng điểm về nhà, mọi thứ vỡ lở.',
              effects: { happy: 3, smarts: -3, karma: -4 }, scene: { loc: 'street', anim: 'facepalm', fx: 'anger' } },
            { p: 0.5, text: 'Thầy gọi điện hỏi thăm “sao em nghỉ hoài vậy?” đúng lúc người nhà đang cầm máy.',
              effects: { happy: -5, karma: -4 }, scene: { loc: 'street', anim: 'scared', fx: 'exclaim' } }
          ] }
      ]
    },

    {
      id: 'c_cheat', title: 'Tờ phao định mệnh', icon: '📜', age: [11, 17], req: { school: true },
      text: 'Kiểm tra một tiết môn Sử, đầu óc bạn trống trơn như tờ giấy thi. Đứa bên cạnh khẽ đẩy tờ “phao” chi chít chữ sang. Thầy giám thị đang nhìn ra cửa sổ.',
      scene: { loc: 'school', time: 'day', anim: 'think', expr: 'scared', fx: 'sweat', shot: 'close',
        npcs: [ { role: 'teacher', gender: 'm', anim: 'idle' }, { role: 'classmate', anim: 'study', say: 'Psst… chép lẹ đi!' } ] },
      choices: [
        { label: 'Chép lẹ!',
          outcomes: [
            { p: 0.55, text: 'Trót lọt, bạn được 8 điểm. Nhưng bài sau không có phao, bạn lại được… 2.',
              effects: { smarts: -1, karma: -3, happy: 2 }, scene: { anim: 'study', fx: 'sweat' } },
            { p: 0.45, text: 'Thầy quay lại đúng lúc bạn cúi xuống. Bài bị gạch chéo đỏ, điểm 0 tròn trĩnh, kèm giấy mời phụ huynh.',
              effects: { happy: -6, karma: -3, smarts: -1 },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { teacher: 'point' }, npcSay: { teacher: 'Em kia! Nộp bài đây!' } } }
          ] },
        { label: 'Đẩy phao trả lại, tự làm', text: 'Bạn viết được những gì mình nhớ, được 5 điểm. Thấp, nhưng là điểm của chính bạn.',
          effects: { karma: 4, smarts: 2, happy: -1 },
          scene: { anim: 'study', fx: 'sparkle', npcAnim: { classmate: 'shrug' } } },
        { label: 'Viết bừa một bài thật bay bổng', text: 'Bạn biến trận Bạch Đằng thành truyện kiếm hiệp ba trang. Thầy chấm 3 điểm, kèm lời phê “Văn hay, sai hết”.',
          effects: { smarts: 1, happy: 3 },
          scene: { anim: 'study', fx: 'idea', npcAnim: { teacher: 'facepalm' } } }
      ]
    },

    {
      id: 'c_net_cafe', title: 'Cúp tiết đi net', icon: '🎮', age: [12, 17], req: { school: true },
      text: 'Mấy đứa trong lớp rủ bạn cúp tiết thể dục ra quán net đầu ngõ “làm vài trận”. Quán tối om, ghế xoay ọp ẹp, tiếng gõ phím lạch cạch không ngớt.',
      scene: { loc: 'cafe', time: 'day', anim: 'type', fx: 'question', shot: 'close',
        npcs: [ { role: 'classmate', anim: 'type', say: 'Vô team đi, đang thiếu một đứa!' } ] },
      choices: [
        { label: 'Đi luôn, một tiết thôi mà',
          outcomes: [
            { p: 0.5, text: 'Một tiết thành ba tiết, ba tiết thành nguyên buổi chiều. Bạn thắng mười trận, và mất tiền ăn sáng cả tuần.',
              effects: { happy: 5, smarts: -2, money: -40000 }, scene: { anim: 'type', fx: 'stars', npcAnim: { classmate: 'cheer' } } },
            { p: 0.5, text: 'Đang combo thì cửa quán bật mở: thầy giám thị đứng đó, tay cầm sổ. Cả đám xếp hàng đi về.',
              effects: { happy: -5, karma: -3 }, scene: { anim: 'scared', fx: 'exclaim', npcAnim: { classmate: 'scared' } } }
          ] },
        { label: 'Từ chối, ở lại trường', text: 'Cả đám gọi bạn là “mọt sách”. Nhưng hôm đó thầy điểm danh đột xuất, bạn là một trong năm đứa có mặt.',
          effects: { karma: 3, smarts: 2, happy: -1 },
          scene: { loc: 'school', anim: 'shake', fx: 'sparkle' } },
        { label: 'Đi theo nhưng chỉ ngồi xem', text: 'Bạn ngồi xem tụi nó chơi, còn chạy đi mua nước cho cả đám. Về vẫn bị ghi tên chung vì tội “đồng phạm”.',
          effects: { happy: -1, karma: -1, money: -30000 },
          scene: { anim: 'drink', fx: 'sweat', npcAnim: { classmate: 'laugh' } } }
      ]
    },

    {
      id: 'c_first_phone', title: 'Chiếc điện thoại đầu tiên', icon: '📱', age: [11, 15], weight: 1.5, req: { noAsset: 'phone' },
      text: 'Sau bao lần năn nỉ, bố mẹ cũng mua cho bạn chiếc điện thoại đầu tiên — hàng cũ, màn hình hơi trầy, nhưng với bạn nó là cả thế giới. Kèm theo là bản “nội quy” dài một trang.',
      scene: { loc: 'home', time: 'day', anim: 'phone', expr: 'happy', fx: 'sparkle', shot: 'close',
        npcs: [ { role: 'mother', anim: 'point', say: 'Chín giờ tối là nộp máy cho mẹ!' }, { role: 'father', anim: 'nod' } ] },
      choices: [
        { label: 'Ký “hợp đồng”, giữ đúng nội quy', text: 'Bạn giữ lời, tối nào cũng nộp máy đúng giờ. Bố mẹ tin tưởng, nửa năm sau cho dùng thoải mái hơn.',
          effects: { happy: 5, karma: 2, rel: { mother: 4, father: 4 }, asset: { add: { type: 'phone', name: 'Điện thoại cũ', value: 1500000 } } },
          scene: { anim: 'nod', fx: 'hearts', npcAnim: { mother: 'hug', father: 'clap' } } },
        { label: 'Lén chơi game tới hai giờ sáng', text: 'Đêm nào bạn cũng trùm chăn chơi game. Mắt cận tăng hai độ, điểm Toán tụt ba điểm.',
          effects: { happy: 4, health: -3, smarts: -2, asset: { add: { type: 'phone', name: 'Điện thoại cũ', value: 1500000 } } },
          scene: { loc: 'bedroom', time: 'night', anim: 'phone', fx: 'zzz' } },
        { label: 'Lập tài khoản mạng xã hội ngay', text: 'Tấm ảnh tự sướng đầu tiên được 37 lượt thích. Bạn mở ra xem lại khoảng 200 lần.',
          effects: { happy: 6, looks: 1, asset: { add: { type: 'phone', name: 'Điện thoại cũ', value: 1500000 } } },
          scene: { anim: 'phone', fx: 'stars', npcAnim: { mother: 'facepalm', father: 'laugh' } } }
      ]
    },

    {
      id: 'c_social_drama', title: 'Drama trên mạng', icon: '💬', age: [13, 17],
      text: 'Một đứa trong lớp đăng bài “bóc phốt” bạn trên nhóm chat của khối, kèm ảnh chụp màn hình bị cắt ghép. Chưa đầy một tiếng đã hơn trăm bình luận.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'angry', fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Viết bài đáp trả thật gắt',
          outcomes: [
            { p: 0.5, text: 'Bài của bạn còn hot hơn bài kia. Bạn thắng trận khẩu chiến, nhưng cả hai bị mời lên phòng giám thị.',
              effects: { happy: 1, karma: -3 }, scene: { anim: 'phone', fx: 'anger' } },
            { p: 0.5, text: 'Càng đáp trả càng lún sâu. Drama kéo dài cả tuần, bạn mất ngủ, sút ba ký.',
              effects: { happy: -6, health: -2 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Im lặng, nhắn riêng nói chuyện', text: 'Hoá ra đứa kia hiểu lầm vì một câu đùa. Hai bên nói chuyện thẳng thắn, bài đăng được gỡ kèm lời xin lỗi.',
          effects: { karma: 5, smarts: 2, happy: 3 },
          scene: { anim: 'phone', fx: 'idea' } },
        { label: 'Tắt điện thoại, đi ngủ', text: 'Sáng ra, cả khối đã quay sang hóng một drama khác. Mạng xã hội trí nhớ ngắn lắm.',
          effects: { happy: 2, health: 1 },
          scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },

    {
      id: 'c_cigarette', title: 'Điếu thuốc sau nhà xe', icon: '🚭', age: [13, 17],
      text: 'Sau giờ học, mấy đứa đàn anh ngồi sau dãy nhà xe, chìa cho bạn một điếu thuốc. Đứa cầm đầu cười khẩy, cả đám nhìn chờ phản ứng của bạn.',
      scene: { loc: 'street', time: 'dusk', anim: 'think', fx: 'smoke', shot: 'close',
        npcs: [ { role: 'kid', gender: 'm', age: 17, anim: 'laugh', say: 'Thử một hơi đi, có gì đâu mà sợ!' }, { role: 'classmate', anim: 'idle' } ] },
      choices: [
        { label: 'Lắc đầu từ chối thẳng', text: 'Cả đám trề môi chê bạn “nhát”. Bạn mặc kệ, đạp xe về nhà. Lá phổi của bạn sau này sẽ cảm ơn bạn.',
          effects: { health: 3, karma: 3, happy: 1, flag: 'tu_choi_thuoc' },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { kid: 'shrug' } } },
        { label: 'Từ chối kiểu hài hước', text: 'Bạn bảo: “Tui đang để dành tiền mua trà sữa”. Cả đám bật cười, không ép nữa. Có đứa còn rủ bạn đi trà sữa thật.',
          effects: { happy: 4, health: 2, karma: 2, flag: 'tu_choi_thuoc' },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { kid: 'laugh', classmate: 'laugh' } } },
        { label: 'Cầm hút thử một hơi', text: 'Bạn ho sặc sụa, nước mắt nước mũi tèm lem. Mùi khói ám vào áo, về nhà bị phát hiện ngay.',
          effects: { health: -4, happy: -3, karma: -2 },
          scene: { anim: 'sick', fx: 'smoke', npcAnim: { kid: 'laugh' } } }
      ]
    },

    {
      id: 'c_fight', title: 'Xô xát ở nhà xe', icon: '👊', age: [12, 17],
      text: 'Ở nhà xe, một đứa lớp bên cố tình xô xe đạp của bạn đổ rồi cười hô hố. Nó hất hàm khiêu khích. Đám đông bắt đầu xúm lại.',
      scene: { loc: 'street', time: 'day', anim: 'angry', fx: 'anger', shot: 'dramatic',
        npcs: [ { role: 'kid', gender: 'm', age: 15, anim: 'point', say: 'Giỏi thì làm gì tao?' }, { role: 'crowd', anim: 'idle' } ] },
      choices: [
        { label: 'Lao vào đánh nhau',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn thắng, nó ôm mặt bỏ chạy. Nhưng cả hai bị kỷ luật, hạnh kiểm học kỳ tụt xuống loại khá.',
              effects: { happy: 1, health: -3, karma: -4 }, scene: { anim: 'angry', fx: 'dust', npcAnim: { kid: 'fall' } } },
            { text: 'Bạn lãnh một cú vào mắt, bầm tím cả tuần. Còn bị viết bản kiểm điểm.',
              effects: { health: -7, happy: -5, looks: -2, karma: -2 }, scene: { anim: 'fall', fx: 'stars', npcAnim: { kid: 'laugh' } } }
          ] },
        { label: 'Dựng xe lên, bỏ đi', text: 'Bạn bình tĩnh dựng xe, phủi yên rồi đạp đi. Đám đông tản ra, chẳng ai còn thấy thằng kia ngầu nữa.',
          effects: { karma: 4, happy: 1, smarts: 1 },
          scene: { anim: 'walk', fx: 'sparkle', npcAnim: { kid: 'shrug' } } },
        { label: 'Báo thầy giám thị', text: 'Camera nhà xe ghi lại tất cả. Đứa kia bị phạt, phải xin lỗi bạn trước lớp.',
          effects: { karma: 2, happy: 2 },
          scene: { anim: 'point', fx: 'exclaim', npcAnim: { kid: 'scared' } } }
      ]
    },

    {
      id: 'c_idol', title: 'Đêm nhạc thần tượng', icon: '🎤', age: [12, 17],
      text: 'Nhóm nhạc thần tượng của bạn sắp tổ chức đêm diễn ở {city}. Vé hạng rẻ nhất {money:1500000}, còn vé đứng sát sân khấu thì đắt gấp đôi.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'love', fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Dùng hết tiền tiết kiệm mua vé', req: { minMoney: 1500000 }, text: 'Đêm diễn như mơ. Bạn hò hét tới khản cổ, quay hơn ba trăm video mà không xem lại cái nào.',
          effects: { money: -1500000, happy: 10 },
          scene: { loc: 'park', time: 'night', anim: 'dance', fx: 'fireworks' } },
        { label: 'Xem livestream ở nhà', text: 'Bạn xem qua màn hình điện thoại, hát theo từng bài. Hàng xóm gõ tường hai lần.',
          effects: { happy: 4 },
          scene: { anim: 'sing', fx: 'music' } },
        { label: 'Đi làm thêm để tự kiếm tiền vé', text: 'Bạn phụ quán trà sữa ba tuần, kiếm được {money:1800000}. Đủ tiền thì vé đã bán hết. Bạn giữ tiền lại làm quỹ cho lần sau.',
          effects: { money: 1800000, smarts: 2, happy: -1 },
          scene: { anim: 'facepalm', fx: 'money' } }
      ]
    },

    {
      id: 'c_summer_job', title: 'Làm thêm mùa hè', icon: '🍛', age: [14, 17], once: false, cooldown: 2,
      text: 'Hè này, bạn xin phụ bán ở một quán cơm tấm gần nhà. Lương {money:20000} một giờ, bưng bê từ trưa tới tối, tay chân rã rời nhưng lần đầu tiên tự kiếm ra tiền.',
      scene: { loc: 'street', time: 'day', anim: 'walk', fx: 'steam', shot: 'wide',
        npcs: [ { role: 'vendor', gender: 'f', age: 45, anim: 'cook', say: 'Bàn số ba hai dĩa sườn trứng nha con!' }, { role: 'crowd', anim: 'eat' } ] },
      choices: [
        { label: 'Chăm chỉ, làm hết mình', text: 'Cô chủ quý bạn, cuối hè thưởng thêm một phong bì. Tổng cộng bạn kiếm được {money:3500000}.',
          effects: { money: 3500000, happy: 4, health: -1, karma: 2 },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { vendor: 'clap' } } },
        { label: 'Làm cho có, lướt điện thoại', text: 'Bạn làm đổ hai dĩa cơm, bị trừ lương. Cuối hè cầm về {money:1200000}.',
          effects: { money: 1200000, happy: 1 },
          scene: { anim: 'phone', fx: 'sweat', npcAnim: { vendor: 'angry' } } },
        { label: 'Lương đầu đời, mua quà cho cả nhà', text: 'Bạn mua quà cho từng người trong nhà. Ai cũng xúc động, bảo con lớn thật rồi.',
          effects: { money: 2000000, karma: 6, happy: 6, rel: { all: 4 } },
          scene: { loc: 'home', anim: 'hug', fx: 'hearts' } }
      ]
    },

    {
      id: 'c_underage_bike', title: 'Tập xe máy lén', icon: '🛵', age: [13, 17],
      text: 'Ông anh họ dắt chiếc xe số cũ ra hẻm, nháy mắt: “Muốn tập không?”. Bạn chưa đủ tuổi, chưa có bằng, nhưng tay đã nắm lấy tay lái.',
      scene: { loc: 'street', time: 'day', anim: 'drive', fx: 'exclaim', shot: 'low',
        npcs: [ { role: 'relative', gender: 'm', age: 22, anim: 'point', say: 'Côn, số, ga từ từ thôi nha!' } ] },
      choices: [
        { label: 'Chạy thử một vòng trong hẻm',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn rồ ga nhẹ, chạy hết con hẻm rồi quay về trót lọt. Lần đầu biết cảm giác gió tạt vào mặt!',
              effects: { happy: 6 }, scene: { anim: 'drive', fx: 'dust', npcAnim: { relative: 'clap' } } },
            { text: 'Bạn nhả côn quá nhanh, xe chồm lên đâm vào sạp rau của cô hàng xóm. Đền {money:200000} và nghe một bài ca dài.',
              effects: { happy: -3, health: -3, money: -200000 }, scene: { anim: 'fall', fx: 'dust', npcAnim: { relative: 'facepalm' } } }
          ] },
        { label: 'Phóng ra đường lớn cho đã',
          outcomes: [
            { p: 0.4, text: 'Bạn phóng một vòng đường lớn rồi về an toàn. Tim đập thình thịch, vừa sướng vừa sợ.',
              effects: { happy: 5, karma: -2 }, scene: { anim: 'drive', fx: 'dust' } },
            { p: 0.6, text: 'Chú cảnh sát giao thông vẫy vào lề. Xe bị tạm giữ, người lớn phải lên làm việc, bạn bị cấm túc một tháng.',
              effects: { happy: -8, karma: -3 }, scene: { anim: 'sad', fx: 'exclaim', npcAnim: { relative: 'facepalm' } } }
          ] },
        { label: 'Từ chối, đợi đủ tuổi thi bằng', text: 'Bạn bảo đợi đủ 18 thi bằng đàng hoàng. Ông anh họ nhún vai, nhưng trong bụng thầm phục.',
          effects: { karma: 3, smarts: 1 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { relative: 'shrug' } } }
      ]
    },

    {
      id: 'c_heartbreak', title: 'Thất tình tuổi mười lăm', icon: '💔', age: [13, 17],
      text: '{partner} hẹn bạn ra công viên, im lặng rất lâu rồi nói tụi mình nên dừng lại. Ly trà sữa trên tay bạn bỗng nhạt thếch.',
      scene: { loc: 'park', time: 'dusk', anim: 'sad', fx: 'heartbreak', shot: 'dramatic',
        npcs: [ { role: 'partner', anim: 'sad', say: 'Mình xin lỗi… mình nghĩ nên dừng lại.' } ] },
      choices: [
        { label: 'Chúc người ấy hạnh phúc', text: 'Bạn gượng cười, gật đầu. Về tới nhà mới oà khóc. Nhưng bạn biết mình đã cư xử thật đẹp.',
          effects: { happy: -6, karma: 4, removePerson: 'partner' },
          scene: { anim: 'nod', fx: 'tears', npcAnim: { partner: 'bow' } } },
        { label: 'Níu kéo, hỏi “tại sao?”',
          outcomes: [
            { p: 0.2, text: '{partner} mềm lòng. Hai đứa quyết định cho nhau thêm một cơ hội.',
              effects: { happy: 3, rel: { partner: 5 } }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug' } } },
            { p: 0.8, text: 'Câu trả lời chỉ là “Mình không biết nữa”. Bạn đứng đó rất lâu sau khi người ấy đã đi.',
              effects: { happy: -10, removePerson: 'partner' }, scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Về đăng status buồn lên mạng', text: 'Bạn đăng một bài thơ tự viết lúc nửa đêm. Ba mươi lượt thích, hai mươi đứa vào hỏi “Sao vậy?”. Nhẹ lòng hơn chút.',
          effects: { happy: -4, removePerson: 'partner' },
          scene: { loc: 'bedroom', time: 'night', anim: 'phone', fx: 'tears' } }
      ]
    },

    {
      id: 'c_parents_fight', title: 'Tiếng cãi vã sau cánh cửa', icon: '🚪', age: [7, 17], weight: 0.8,
      text: 'Tối nay bố mẹ lại cãi nhau to chuyện tiền bạc. Tiếng nói vọng qua cánh cửa, rồi có tiếng cái chén rơi vỡ. Bạn ngồi ôm gối, tim thắt lại.',
      scene: { loc: 'home', time: 'night', anim: 'sad', fx: 'anger', shot: 'dramatic',
        npcs: [ { role: 'mother', anim: 'angry', say: 'Tháng này lấy đâu ra tiền nữa?' }, { role: 'father', anim: 'angry', say: 'Tôi cũng đang cố đây mà!' } ] },
      choices: [
        { label: 'Bước ra, xin bố mẹ đừng cãi nữa', text: 'Thấy bạn đứng đó mắt đỏ hoe, cả hai im bặt. Mẹ ôm bạn, bố lặng lẽ nhặt mảnh chén vỡ. Tối đó cả nhà ngồi ăn chè với nhau.',
          effects: { karma: 3, happy: 2, rel: { mother: 5, father: 5 } },
          scene: { anim: 'cry', fx: 'hearts', npcAnim: { mother: 'hug', father: 'sad' } } },
        { label: 'Đeo tai nghe, mở nhạc thật to', text: 'Âm nhạc át đi tiếng cãi vã. Sáng ra mọi thứ có vẻ bình thường, nhưng bạn biết chẳng có gì bình thường cả.',
          effects: { happy: -4 },
          scene: { anim: 'sit', fx: 'music' } },
        { label: 'Làm trò hề phá tan không khí',
          outcomes: [
            { p: 0.5, text: 'Bạn đội nồi lên đầu, nghiêm trang “báo cáo nồi cơm đã chín”. Bố phì cười trước, mẹ cười sau. Cơn giận tan như sương.',
              effects: { happy: 4, rel: { mother: 4, father: 4 } }, scene: { anim: 'dance', fx: 'bubbles', npcAnim: { all: 'laugh' } } },
            { p: 0.5, text: 'Không ai cười cả. Mẹ bảo bạn vào phòng. Bạn chui vào chăn, thấy mình thật vô dụng.',
              effects: { happy: -5 }, scene: { anim: 'sad', fx: 'tears', npcAnim: { mother: 'point', father: 'facepalm' } } }
          ] }
      ]
    },

    {
      id: 'c_grandparent_sick', title: 'Thăm {grandparent.k} nằm viện', icon: '🏥', age: [8, 17],
      text: '{grandparent.K} {grandparent} trở bệnh, phải nằm viện cả tuần. Người gầy rộc đi, nhưng thấy bạn vào thăm thì mắt vẫn sáng lên.',
      scene: { loc: 'hospital', time: 'day', anim: 'sad', fx: 'tears', shot: 'close',
        npcs: [ { role: 'grandparent', anim: 'sick', say: 'Cháu tới rồi đó à… ngồi đây.' }, { role: 'doctor', anim: 'talk' } ] },
      choices: [
        { label: 'Ở lại chăm {grandparent.k} cả buổi', text: 'Bạn đút cháo, bóp chân, kể chuyện trường lớp. {grandparent.K} ngủ thiếp đi với nụ cười trên môi.',
          effects: { karma: 6, happy: 2, rel: { grandparent: 10 } },
          scene: { anim: 'sit', fx: 'hearts', npcAnim: { grandparent: 'sleep' } } },
        { label: 'Mở nhạc xưa cho {grandparent.k} nghe', text: '{grandparent.K} khe khẽ hát theo bài hát thời còn trẻ. Cả phòng bệnh lặng đi lắng nghe.',
          effects: { happy: 3, karma: 3, rel: { grandparent: 8 } },
          scene: { anim: 'phone', fx: 'music', npcAnim: { grandparent: 'nod', doctor: 'nod' } } },
        { label: 'Ghé chút rồi về ôn bài', text: 'Bạn ở lại mười phút rồi vội về ôn thi. Trên đường về, bạn cứ nghĩ mãi về bàn tay nhăn nheo của {grandparent.k}.',
          effects: { smarts: 1, happy: -2, rel: { grandparent: 1 } },
          scene: { anim: 'wave', fx: 'question', npcAnim: { grandparent: 'wave' } } }
      ]
    },

    {
      id: 'c_friend_birthday', title: 'Sinh nhật {friend}', icon: '🎁', age: [10, 17],
      text: 'Sinh nhật {friend}, cả nhóm hẹn nhau ở quán karaoke. Ai cũng mang quà, còn bạn thì… quên béng tới tận chiều nay.',
      scene: { loc: 'karaoke', time: 'night', decor: 'birthday', anim: 'think', expr: 'scared', fx: 'sweat', shot: 'wide',
        npcs: [ { role: 'friend', anim: 'sing', say: 'Tới rồi hả? Vô hát liền đi!' }, { role: 'crowd', anim: 'dance' } ] },
      choices: [
        { label: 'Chạy đi mua quà gấp', req: { minMoney: 150000 }, text: 'Bạn chọn vội một con gấu bông. {friend} ôm con gấu, cười tít: “Biết ngay là nhớ mà!”. Bạn cười trừ.',
          effects: { money: -150000, happy: 4, rel: { friend: 6 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { friend: 'hug' } } },
        { label: 'Tự chế bài hát tặng',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bài hát chế về kỷ niệm hai đứa làm cả phòng cười chảy nước mắt. Món quà rẻ nhất mà {friend} nhớ nhất.',
              effects: { happy: 6, rel: { friend: 10 } }, scene: { anim: 'sing', fx: 'music', npcAnim: { friend: 'laugh' } } },
            { text: 'Bạn quên lời ngay câu thứ ba, đứng ú ớ giữa phòng. {friend} vẫn vỗ tay cổ vũ nhiệt tình.',
              effects: { happy: 1, rel: { friend: 3 } }, scene: { anim: 'sing', fx: 'sweat', npcAnim: { friend: 'clap' } } }
          ] },
        { label: 'Thú thật là quên, hứa bao một chầu', text: '{friend} giả vờ giận, bắt bạn hát ba bài liền. Tuần sau bạn bao cả nhóm một chầu ốc.',
          effects: { money: -100000, happy: 3, rel: { friend: 3 } },
          scene: { anim: 'bow', fx: 'sweat', npcAnim: { friend: 'laugh' } } }
      ]
    },

    {
      id: 'c_game_scam', title: 'Quà khủng miễn phí?', icon: '🎣', age: [10, 16],
      text: 'Một tài khoản lạ nhắn tin: “Nạp {money:200000} thẻ cào, nhận ngay bộ trang phục huyền thoại trị giá hai triệu!”. Kèm theo là ảnh “bằng chứng” trông rất thật.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', expr: 'surprised', fx: 'question', shot: 'close' },
      choices: [
        { label: 'Nạp ngay kẻo hết suất!', req: { minMoney: 200000 }, text: 'Bạn nạp thẻ, gửi mã. Tài khoản kia… chặn bạn ngay lập tức. Bài học đắt giá nhất năm.',
          effects: { money: -200000, happy: -6, smarts: 2 },
          scene: { anim: 'facepalm', fx: 'heartbreak' } },
        { label: 'Báo cáo tài khoản lừa đảo', text: 'Bạn báo cáo và cảnh báo cả nhóm chat. Hai đứa bạn suýt mắc bẫy cảm ơn bạn rối rít.',
          effects: { karma: 4, smarts: 2, happy: 2 },
          scene: { anim: 'phone', fx: 'sparkle' } },
        { label: 'Nhắn trêu lại kẻ lừa đảo', text: 'Bạn giả vờ tin, hỏi han đủ thứ suốt một tiếng rồi gửi mã thẻ “1234-CHUC-ANH-MAY-MAN”. Kẻ lừa đảo tức tối chặn bạn.',
          effects: { happy: 5, smarts: 1 },
          scene: { anim: 'laugh', fx: 'bubbles' } }
      ]
    },

    {
      id: 'c_scholarship', title: 'Học bổng khuyến học', icon: '🎓', age: [11, 17], weight: 0.8, req: { school: true, minStat: { smarts: 65 } },
      text: 'Thầy hiệu trưởng xướng tên bạn trong giờ chào cờ: bạn nhận học bổng khuyến học {money:3000000} nhờ thành tích học tập xuất sắc. Cả trường vỗ tay.',
      scene: { loc: 'school', time: 'day', anim: 'bow', fx: 'confetti', shot: 'wide',
        npcs: [ { role: 'teacher', gender: 'm', age: 55, anim: 'clap', say: 'Chúc mừng em, cố gắng phát huy nhé!' }, { role: 'crowd', anim: 'clap' } ] },
      choices: [
        { label: 'Đưa hết cho gia đình', text: 'Người lớn trong nhà nhận tiền, giấu vội giọt nước mắt, đem đóng học phí cả học kỳ cho bạn.',
          effects: { karma: 5, happy: 4, rel: { all: 5 } },
          scene: { loc: 'home', anim: 'hug', fx: 'hearts' } },
        { label: 'Mua sách và khoá học', text: 'Bạn mua một chồng sách và khoá luyện tiếng Anh. Kiến thức là khoản đầu tư sinh lời nhất.',
          effects: { smarts: 5, happy: 3, money: 500000 },
          scene: { anim: 'study', fx: 'idea' } },
        { label: 'Giữ làm quỹ riêng', text: 'Bạn mở sổ tiết kiệm đầu tiên trong đời. Cảm giác tự chủ thật tuyệt.',
          effects: { money: 3000000, happy: 3 },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { teacher: 'nod' } } }
      ]
    },

    {
      id: 'c_school_show', title: 'Tiết mục văn nghệ', icon: '🎶', age: [10, 17], req: { school: true },
      text: 'Trường tổ chức văn nghệ chào mừng năm học mới, lớp bạn còn thiếu một tiết mục. Cô chủ nhiệm {teacher} nhìn quanh lớp, ánh mắt dừng lại ở bạn.',
      scene: { loc: 'school', time: 'day', anim: 'scared', fx: 'exclaim', shot: 'close',
        npcs: [ { role: 'teacher', gender: 'f', anim: 'point', say: 'Em lên hát một bài được không?' }, { role: 'classmate', anim: 'clap' } ] },
      choices: [
        { label: 'Nhận lời hát đơn ca',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Đêm diễn, giọng bạn vang lên trong veo dưới ánh đèn. Cả trường hò reo, bạn có hẳn vài “fan” lớp dưới.',
              effects: { happy: 8, looks: 2, flag: 'van_nghe' }, scene: { anim: 'sing', fx: 'music', npcAnim: { classmate: 'cheer', teacher: 'clap' } } },
            { text: 'Micro rè đúng đoạn cao trào, bạn hát chênh phô. Nhưng cả lớp vẫn đứng dậy vỗ tay như thể đó là đêm nhạc để đời.',
              effects: { happy: 3 }, scene: { anim: 'sing', fx: 'sweat', npcAnim: { classmate: 'clap' } } }
          ] },
        { label: 'Rủ cả nhóm múa tập thể', text: 'Ba tuần tập luyện, cả nhóm cười nhiều hơn tập. Tiết mục đoạt giải khuyến khích và một kho ảnh kỷ niệm.',
          effects: { happy: 6, health: 1 },
          scene: { anim: 'dance', fx: 'confetti', npcAnim: { classmate: 'dance' } } },
        { label: 'Xin làm hậu cần', text: 'Bạn lo trang phục, đạo cụ, nước uống cho cả đội. Cô {teacher} bảo không có bạn là “toang”.',
          effects: { karma: 3, smarts: 1, happy: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { teacher: 'nod' } } }
      ]
    },

    {
      id: 'c_bike_puncture', title: 'Thủng săm giữa đường', icon: '🚲', age: [11, 15],
      text: 'Đang đạp xe đi học thì “xì…” — bánh sau xẹp lép. Còn mười lăm phút nữa vào lớp, trường thì cách hai cây số. Góc đường có ông chú sửa xe vỉa hè.',
      scene: { loc: 'street', time: 'dawn', anim: 'think', expr: 'surprised', fx: 'sweat', shot: 'wide',
        npcs: [ { role: 'stranger', gender: 'm', age: 65, anim: 'sit', say: 'Vá xe đây con, mười lăm ngàn!' } ] },
      choices: [
        { label: 'Vá xe ở tiệm vỉa hè', text: 'Ông chú vá nhanh thoăn thoắt, vừa làm vừa kể chuyện ngày xưa. Bạn trễ học năm phút, nhưng nghe được một câu chuyện hay.',
          effects: { money: -15000, smarts: 1, happy: 1 },
          scene: { anim: 'sit', fx: 'idea', npcAnim: { stranger: 'talk' } } },
        { label: 'Dắt bộ chạy tới trường', text: 'Bạn vừa dắt vừa chạy, tới nơi mồ hôi ướt đẫm lưng áo. Thầy giám thị vẫn ghi tên đi trễ.',
          effects: { health: 2, happy: -2 },
          scene: { anim: 'run', fx: 'sweat', npcAnim: { stranger: 'shrug' } } },
        { label: 'Vẫy đứa cùng lớp đi ngang xin đèo',
          outcomes: [
            { p: 0.6, text: 'Đứa bạn chở bạn tới trường, ông chú sửa xe giữ xe giùm tới chiều. Tình bạn đẹp như phim.',
              effects: { happy: 3, karma: 1 }, scene: { anim: 'wave', fx: 'hearts', npcAnim: { stranger: 'nod' } } },
            { p: 0.4, text: 'Đứa bạn phóng vụt qua, tưởng bạn vẫy chào. Bạn đứng nhìn theo, thở dài.',
              effects: { happy: -2 }, scene: { anim: 'facepalm', fx: 'dust', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    },

    {
      id: 'c_dye_hair', title: 'Mái tóc nâu khói', icon: '💇', age: [14, 17], req: { school: true },
      text: 'Hè vừa rồi bạn nhuộm tóc màu nâu khói cho “cháy”. Sáng thứ Hai đầu tuần, thầy giám thị đứng ở cổng trường nhìn mái tóc bạn chằm chằm.',
      scene: { loc: 'school', time: 'dawn', anim: 'scared', fx: 'exclaim', shot: 'close',
        npcs: [ { role: 'teacher', gender: 'm', anim: 'point', say: 'Em kia, tóc tai thế này là sao?' }, { role: 'classmate', anim: 'laugh' } ] },
      choices: [
        { label: 'Hứa nhuộm đen lại ngay', text: 'Chiều đó bạn nhuộm tóc đen lại, tiếc đứt ruột {money:100000} tiền nhuộm.',
          effects: { money: -100000, karma: 2, looks: -1 },
          scene: { anim: 'nod', fx: 'sweat', npcAnim: { teacher: 'nod' } } },
        { label: 'Cãi “Tóc em tự nhiên vậy mà thầy!”',
          outcomes: [
            { p: 0.2, text: 'Thầy nheo mắt nhìn rồi… cho qua. Bạn trở thành huyền thoại của cả khối.',
              effects: { happy: 6, looks: 2 }, scene: { anim: 'shrug', fx: 'stars', npcAnim: { teacher: 'think', classmate: 'clap' } } },
            { p: 0.8, text: 'Thầy lấy ra tấm ảnh thẻ năm ngoái của bạn: tóc đen nhánh. Bạn viết bản kiểm điểm ba trang.',
              effects: { happy: -4, karma: -2 }, scene: { anim: 'facepalm', fx: 'anger', npcAnim: { teacher: 'angry' } } }
          ] },
        { label: 'Đội mũ lưỡi trai cả ngày', text: 'Kế hoạch hoàn hảo cho tới giờ thể dục, khi một cơn gió thổi bay chiếc mũ ngay trước mặt thầy.',
          effects: { happy: -2, looks: 1 },
          scene: { anim: 'scared', fx: 'dust', npcAnim: { classmate: 'laugh', teacher: 'facepalm' } } }
      ]
    },

    {
      id: 'c_curfew', title: 'Về nhà quá giờ', icon: '🕚', age: [14, 17],
      text: 'Đi chơi với bạn về, đồng hồ đã chỉ 11 giờ đêm — trễ hơn giờ hẹn hai tiếng. Đèn phòng khách vẫn sáng, mẹ ngồi chờ, điện thoại có 14 cuộc gọi nhỡ.',
      scene: { loc: 'home', time: 'night', anim: 'scared', fx: 'sweat', shot: 'dramatic',
        npcs: [ { role: 'mother', anim: 'sit', expr: 'angry', say: 'Con có biết mấy giờ rồi không?' } ] },
      choices: [
        { label: 'Xin lỗi thật lòng', text: 'Mẹ nhìn bạn rất lâu, rồi chỉ nói: “Lần sau nhớ gọi cho mẹ”. Tiếng thở phào của mẹ làm bạn thấy có lỗi hơn cả trận mắng.',
          effects: { karma: 3, happy: -1, rel: { mother: 3 } },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { mother: 'hug' } } },
        { label: 'Bịa chuyện xe hư giữa đường',
          outcomes: [
            { p: 0.4, text: 'Mẹ tin, còn lo lắng hỏi han. Bạn đi ngủ mà lòng nặng trĩu.',
              effects: { karma: -4, happy: -1 }, scene: { anim: 'shrug', fx: 'sweat', npcAnim: { mother: 'talk' } } },
            { p: 0.6, text: 'Mẹ bình tĩnh mở điện thoại: ảnh bạn đang hát karaoke lúc 10 giờ trên trang của bạn bè. Bị cấm túc một tháng.',
              effects: { happy: -6, karma: -3, rel: { mother: -5 } }, scene: { anim: 'facepalm', fx: 'anger', npcAnim: { mother: 'angry' } } }
          ] },
        { label: 'Cãi lại: “Con lớn rồi!”', text: 'Cuộc cãi vã kéo dài tới nửa đêm. Hai mẹ con đóng sầm cửa phòng, chẳng ai ngủ được.',
          effects: { happy: -5, rel: { mother: -8 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { mother: 'angry' }, npcSay: { mother: 'Lớn mà vậy hả con?' } } }
      ]
    },

    {
      id: 'c_volunteer', title: 'Dọn rác bãi biển', icon: '🏖️', age: [14, 17],
      text: 'Câu lạc bộ tình nguyện của trường tổ chức chuyến dọn rác bãi biển cuối tuần. Rác nhựa dạt vào bờ nhiều tới mức nhìn không thấy cát.',
      scene: { loc: 'beach', time: 'day', anim: 'idle', fx: 'dust', shot: 'wide',
        npcs: [ { role: 'classmate', anim: 'walk', say: 'Mỗi người một bao nha, lượm sạch!' }, { role: 'crowd', anim: 'walk' } ] },
      choices: [
        { label: 'Hăng hái nhặt rác cả ngày', text: 'Bạn cháy nắng đen thui, lưng mỏi nhừ. Nhưng nhìn bãi biển sạch tinh, bạn thấy mình vừa làm điều có ý nghĩa.',
          effects: { karma: 8, health: 1, happy: 4, looks: -1 },
          scene: { anim: 'walk', fx: 'sparkle', npcAnim: { classmate: 'clap' } } },
        { label: 'Chụp ảnh sống ảo là chính', text: 'Bạn có bộ ảnh “tình nguyện” cực đẹp, nhặt được đúng ba vỏ chai. Ảnh nhiều lượt thích, lòng hơi gợn.',
          effects: { happy: 3, looks: 1, karma: -1 },
          scene: { anim: 'phone', fx: 'flash', npcAnim: { classmate: 'facepalm' } } },
        { label: 'Rủ cả nhóm làm video kêu gọi',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Video của nhóm được chia sẻ hàng nghìn lần, tuần sau có thêm cả trăm người tới dọn biển.',
              effects: { karma: 10, happy: 6, smarts: 2 }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { classmate: 'cheer' } } },
            { text: 'Video chỉ được 42 lượt xem, toàn người quen. Nhưng bãi biển vẫn sạch hơn nhờ cả nhóm.',
              effects: { karma: 5, happy: 1 }, scene: { anim: 'shrug', fx: 'sparkle' } }
          ] }
      ]
    },

    {
      id: 'c_diary', title: 'Cuốn nhật ký bị lộ', icon: '📔', age: [11, 16],
      text: 'Bạn bắt gặp {sibling.k} {sibling} đang đọc cuốn nhật ký bí mật của bạn — đúng trang viết về người bạn thầm thích. {sibling.K} ngẩng lên, cười nham hiểm.',
      scene: { loc: 'bedroom', time: 'day', anim: 'angry', expr: 'surprised', fx: 'exclaim', shot: 'close',
        npcs: [ { role: 'sibling', anim: 'laugh', say: 'Ồ, ra là thích người ta hả?' } ] },
      choices: [
        { label: 'Giật lại, hét toáng lên', text: 'Hai bên giằng co tới rách bìa cuốn nhật ký. {sibling.K} {sibling} bị mắng, còn bạn mất cuốn sổ quý.',
          effects: { happy: -3, rel: { sibling: -6 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { sibling: 'run' } } },
        { label: 'Thương lượng “bịt miệng”', text: 'Bạn hứa rửa bát thay {sibling.k} một tháng để đổi lấy sự im lặng. Hợp đồng được ký bằng ngón út.',
          effects: { happy: -1, smarts: 1, rel: { sibling: 3 } },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { sibling: 'nod' } } },
        { label: 'Tỉnh bơ: “Ừ, thích thì sao?”', text: 'Câu trả lời tỉnh bơ làm {sibling.k} {sibling} cụt hứng. Hết gì để trêu, {sibling.k} lặng lẽ trả lại cuốn sổ.',
          effects: { happy: 3, karma: 1, rel: { sibling: 2 } },
          scene: { anim: 'shrug', fx: 'sparkle', npcAnim: { sibling: 'facepalm' } } }
      ]
    },

    {
      id: 'c_tourist', title: 'Khách nước ngoài hỏi đường', icon: '🗺️', age: [11, 17],
      text: 'Ở phố đi bộ, một chị khách du lịch nước ngoài cầm bản đồ, lúng túng hỏi bạn đường ra chợ đêm bằng tiếng Anh. Bao năm học tiếng Anh trên lớp dồn cả về khoảnh khắc này.',
      scene: { loc: 'street', time: 'dusk', anim: 'think', expr: 'surprised', fx: 'question', shot: 'close',
        npcs: [ { role: 'stranger', gender: 'f', age: 30, anim: 'talk', say: 'Excuse me, where is the night market?' } ] },
      choices: [
        { label: 'Tự tin chỉ đường bằng tiếng Anh',
          success: { stat: 'smarts', base: 0.25, scale: 0.6 },
          outcomes: [
            { text: 'Bạn chỉ đường trôi chảy, còn giới thiệu món bánh tráng nướng. Chị khách cảm ơn rối rít, khen tiếng Anh của bạn “very good”.',
              effects: { smarts: 3, happy: 5, karma: 2 }, scene: { anim: 'point', fx: 'stars', npcAnim: { stranger: 'clap' }, npcSay: { stranger: 'Thank you so much!' } } },
            { text: 'Bạn nói “go straight, turn… turn…” rồi đứng hình. Cuối cùng bạn dắt chị ấy đi bộ tới tận nơi.',
              effects: { smarts: 1, happy: 2, karma: 3 }, scene: { anim: 'walk', fx: 'sweat', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Dùng tay chân diễn tả', text: 'Bạn chỉ trỏ, vẽ bản đồ lên không trung, giả tiếng xe máy “bin bin”. Hai người cười ngặt nghẽo, nhưng chị ấy hiểu thật.',
          effects: { happy: 4, karma: 2 },
          scene: { anim: 'laugh', fx: 'bubbles', npcAnim: { stranger: 'laugh' } } },
        { label: 'Giả vờ không nghe thấy', text: 'Bạn cúi mặt đi thẳng. Về nhà, bạn mở sách tiếng Anh ra, quyết tâm lần sau không chạy nữa.',
          effects: { smarts: 1, happy: -1 },
          scene: { anim: 'walk', fx: 'sweat', npcAnim: { stranger: 'shrug' } } }
      ]
    },

    {
      id: 'c_acne', title: 'Nốt mụn trước ngày chụp ảnh', icon: '🪞', age: [12, 16],
      text: 'Mai là ngày chụp ảnh lớp, và sáng nay một nốt mụn đỏ chót mọc ngay giữa trán bạn, to như hạt đậu. Bạn đứng soi gương, muốn độn thổ.',
      scene: { loc: 'bedroom', time: 'dawn', anim: 'facepalm', expr: 'sad', fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Nặn cho bằng được', text: 'Nốt mụn biến thành một vết đỏ sưng vù gấp đôi. Trong ảnh lớp, bạn trông như vừa bị ong đốt.',
          effects: { looks: -3, happy: -3 },
          scene: { anim: 'facepalm', fx: 'sweat' } },
        { label: 'Rửa mặt, ngủ sớm, kệ nó', text: 'Sáng hôm sau nốt mụn xẹp hẳn. Bạn đứng hàng sau, cười tươi rói, chẳng ai để ý.',
          effects: { looks: 1, health: 1, happy: 2 },
          scene: { anim: 'sleep', fx: 'zzz', time: 'night' } },
        { label: 'Để tóc mái che đi', text: 'Mái tóc mới che kín nốt mụn, lại còn hợp với khuôn mặt bất ngờ. Bạn quyết định giữ kiểu tóc này luôn.',
          effects: { looks: 2, happy: 3 },
          scene: { anim: 'cheer', fx: 'sparkle' } }
      ]
    },

    {
      id: 'c_rare_lottery', title: 'Tờ vé số cuối cùng', icon: '🎫', age: [10, 17], weight: 0.25,
      text: 'Ông cụ bán vé số dạo dúi vào tay bạn tờ vé cuối cùng, giọng khàn khàn. Vé giá {money:10000}. Trời đã nhá nhem, ông còn phải đi bộ về xa lắm.',
      scene: { loc: 'street', time: 'dusk', anim: 'think', fx: 'question', shot: 'close',
        npcs: [ { role: 'stranger', gender: 'm', age: 75, anim: 'bow', say: 'Mua giùm ông tờ cuối đi con…' } ] },
      choices: [
        { label: 'Mua giúp ông',
          outcomes: [
            { p: 0.15, text: 'Tối dò số, bạn trúng giải… năm triệu! Bạn la hét khắp nhà, nghĩ tới ông cụ mà rưng rưng.',
              effects: { money: 5000000, happy: 10, karma: 5 }, scene: { loc: 'home', time: 'night', anim: 'cheer', fx: 'money' } },
            { p: 0.85, text: 'Không trúng gì, nhưng ông cụ được về sớm. Đổi {money:10000} lấy một nụ cười móm mém, bạn thấy mình lời.',
              effects: { money: -10000, karma: 5, happy: 2 }, scene: { anim: 'nod', fx: 'hearts', npcAnim: { stranger: 'bow' } } }
          ] },
        { label: 'Không mua, biếu ông chai nước', text: 'Ông cụ cảm ơn, uống một hơi hết nửa chai. Hai ông cháu ngồi vỉa hè nói chuyện trời mưa trời nắng.',
          effects: { money: -10000, karma: 4, happy: 2 },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { stranger: 'drink' } } },
        { label: 'Lắc đầu đi tiếp', text: 'Bạn đi tiếp. Tối đó xem kết quả xổ số, bạn chợt tự hỏi tờ vé ấy có trúng không.',
          effects: { karma: -1 },
          scene: { anim: 'walk', fx: 'question', npcAnim: { stranger: 'sad' } } }
      ]
    }
  );
})();
