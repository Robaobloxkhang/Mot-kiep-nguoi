/* Một Kiếp Người — CÚ TWIST: những bước ngoặt bất ngờ khiến người xem phải “ồ” lên (hiếm, mỗi đời gặp vài lần) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    {
      id: 's_twist_connuoi', title: 'Tờ giấy trong hộp sắt', icon: '📜', age: [14, 50], weight: 0.35,
      req: { has: 'mother', notFlag: 'twist_connuoi' },
      text: 'Dọn kho giúp {mother.k}, bạn tìm thấy một hộp sắt gỉ. Bên trong là tờ giấy nhận con nuôi đề tên bạn, ngày tháng trùng đúng ngày sinh nhật của bạn.',
      scene: { loc: 'home', anim: 'scared', expr: 'scared', npcs: [{ role: 'mother', anim: 'cry', say: 'Con… mẹ định nói từ lâu rồi…' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Ôm {mother.k}: “Mẹ vẫn là mẹ của con”', text: '{mother.k} khóc nức nở. Hai mẹ con ngồi đến khuya, {mother.k} kể lại ngày nhặt được bạn trước cổng chùa. Từ hôm đó, hai người thương nhau hơn bao giờ hết.', effects: { happy: 4, karma: 6, rel: { mother: 20 }, flag: 'twist_connuoi' }, scene: { anim: 'hug', fx: 'hearts' } },
        { label: 'Đi tìm bố mẹ ruột', effects: { flag: ['twist_connuoi', 'twist_timbome'], followUp: { id: 's_twist_bomeruot', delay: 1 } }, text: 'Bạn mang tờ giấy đi khắp các chùa, đăng bài tìm người thân. Hành trình này có thể mất nhiều năm…', scene: { anim: 'think' } },
        { label: 'Giận dỗi, bỏ đi mấy tháng', text: 'Bạn thấy cả tuổi thơ là một lời nói dối. Mấy tháng không về nhà, rồi một đêm mưa bạn đứng trước cổng, thấy {mother.k} vẫn để đèn chờ.', effects: { happy: -8, rel: { mother: -15 }, flag: 'twist_connuoi' }, scene: { anim: 'sad', time: 'night', weather: 'rain' } }
      ]
    },
    {
      id: 's_twist_bomeruot', title: 'Cuộc gọi từ chương trình tìm người thân', icon: '📞', age: [15, 70], chainOnly: true,
      text: 'Chương trình “Như chưa hề có cuộc chia ly” gọi đến: họ đã tìm thấy người mẹ ruột của bạn. Bà đang sống ở một làng chài miền Trung, chưa từng thôi tìm con.',
      scene: { loc: 'beach', anim: 'cry', npcs: [{ role: 'neighbor', gender: 'f', anim: 'cry', say: 'Con ơi…' }], fx: 'tears', shot: 'dramatic' },
      choices: [
        { label: 'Về làng chài gặp mẹ ruột', text: 'Hai mẹ con ôm nhau giữa bãi biển, cả làng đứng xem mà rơi nước mắt. Bạn có thêm một người mẹ, một quê hương.', effects: { happy: 14, karma: 4, followers: 0.05 }, scene: { anim: 'hug', fx: 'hearts' } },
        { label: 'Chỉ gửi thư và tiền, chưa sẵn sàng gặp', text: 'Bạn gửi một lá thư dài và một khoản tiền. Vài tháng sau nhận được thư hồi âm, nét chữ run run: “Mẹ chỉ cần biết con sống tốt.”', effects: { happy: 4, money: -20000000, karma: 3 }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_twist_veso', title: 'Tấm vé số trong túi quần', icon: '🎫', age: [20, 80], weight: 0.3,
      req: { married: true, notFlag: 'twist_veso' },
      text: 'Bạn dò kết quả xổ số và đứng hình: tấm vé mua hôm qua trúng giải đặc biệt 2 tỷ! Nhưng cái quần chứa tấm vé… {spouse.k} vừa cho vào máy giặt.',
      scene: { loc: 'home', anim: 'scared', expr: 'scared', npcs: [{ role: 'spouse', anim: 'shrug', say: 'Quần nào cơ?' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Lao vào giật phích máy giặt', success: { stat: 'health', base: 0.35, scale: 0.4 }, mini: 'sprint',
          outcomes: [
            { text: 'Bạn rút phích kịp lúc nước vừa ngấm. Tấm vé nhàu nát nhưng còn đọc được số! Đại lý xác nhận: 2 tỷ là của bạn.', effects: { money: 1800000000, happy: 18, flag: 'twist_veso' }, scene: { anim: 'cheer', fx: ['confetti', 'money'] } },
            { text: 'Tấm vé đã thành bột giấy. Bạn ngồi bệt xuống sàn, {spouse.k} lúng túng xin lỗi. Cả nhà ăn mì tôm ba ngày cho bõ tức.', effects: { happy: -12, rel: { spouse: -5 }, flag: 'twist_veso' }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Bình tĩnh phơi khô tấm vé', success: { stat: 'smarts', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn kẹp tấm vé giữa hai cuốn sách, sấy nhẹ. Đại lý soi kỹ rồi gật đầu. 2 tỷ!', effects: { money: 1800000000, happy: 16, flag: 'twist_veso' }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Tấm vé phai mất hai chữ số. Đại lý lắc đầu: “Không đổi được em ơi.”', effects: { happy: -10, flag: 'twist_veso' }, scene: { anim: 'facepalm' } }
          ] }
      ]
    },
    {
      id: 's_twist_nguoiyeucu', title: 'Người cũ và đứa trẻ', icon: '👧', age: [24, 60], weight: 0.25,
      req: { notFlag: 'twist_nyc' },
      text: 'Một người yêu cũ từ nhiều năm trước bất ngờ xuất hiện trước cửa, tay dắt một đứa bé có đôi mắt giống bạn đến kỳ lạ.',
      scene: { loc: 'home', anim: 'scared', expr: 'scared', npcs: [{ role: 'stranger', anim: 'sad', say: 'Đây là con của chúng ta.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đi xét nghiệm ADN', effects: { flag: 'twist_nyc' },
          outcomes: [
            { p: 0.55, text: 'Kết quả: 99,99% là con bạn. Bạn nhìn đứa trẻ rất lâu, rồi quyết định nhận con. Cuộc sống rẽ sang một hướng hoàn toàn mới.', effects: { happy: 2, karma: 5, baby: 'solo', money: -50000000 }, scene: { loc: 'hospital', anim: 'hug', fx: 'hearts' } },
            { p: 0.45, text: 'Kết quả: không cùng huyết thống. Người cũ thừa nhận chỉ muốn tìm chỗ dựa. Bạn vẫn giúp hai mẹ con một khoản tiền rồi chào tạm biệt.', effects: { happy: -4, money: -30000000, karma: 3 }, scene: { loc: 'hospital', anim: 'sad' } }
          ] },
        { label: 'Đóng cửa, không muốn dính dáng', text: 'Bạn đóng cửa lại. Đêm đó bạn không ngủ được, hình ảnh đứa bé cứ hiện lên mãi.', effects: { happy: -6, karma: -6, flag: 'twist_nyc' }, scene: { anim: 'sad', time: 'night' } }
      ]
    },
    {
      id: 's_twist_traonham', title: 'Bị trao nhầm ở nhà hộ sinh', icon: '🍼', age: [18, 45], weight: 0.15,
      req: { has: 'mother', notFlag: ['twist_traonham', 'twist_connuoi'] },
      text: 'Một đoạn phóng sự về các ca trao nhầm con ở nhà hộ sinh năm bạn chào đời. Bạn thử đi xét nghiệm… và kết quả khiến cả nhà chết lặng: bạn không phải con ruột của bố mẹ.',
      scene: { loc: 'hospital', anim: 'scared', expr: 'scared', npcs: [{ role: 'mother', anim: 'cry' }, { role: 'doctor', anim: 'talk', say: 'Có sự nhầm lẫn năm đó…' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Tìm gặp gia đình “bên kia”', text: 'Gia đình kia giàu có, người con thật của họ — người đáng lẽ là bạn — lại lớn lên trong căn nhà bạn từng ở. Hai gia đình quyết định coi nhau như họ hàng, cùng ăn Tết.', effects: { happy: 6, money: 300000000, karma: 4, flag: 'twist_traonham', followers: 0.08 }, scene: { loc: 'home', anim: 'hug', fx: 'hearts' } },
        { label: 'Giữ kín, coi như chưa biết', text: 'Bạn xé tờ kết quả. Máu mủ là gì khi bố mẹ đã nuôi bạn cả đời?', effects: { happy: -2, rel: { mother: 10 }, flag: 'twist_traonham' }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_twist_ditruc', title: 'Bức thư từ văn phòng luật', icon: '✉️', age: [22, 80], weight: 0.25,
      req: { notFlag: 'twist_dichuc', minKarma: 55 },
      text: 'Một văn phòng luật gửi thư mời: cụ ông bán vé số mà bạn hay mua giúp mỗi sáng vừa qua đời, và để lại di chúc… cho bạn.',
      scene: { loc: 'office', anim: 'scared', npcs: [{ role: 'boss', anim: 'talk', say: 'Cụ dặn trao tận tay anh/chị.' }], fx: 'sparkle' },
      choices: [
        { label: 'Đến nhận di chúc', effects: { flag: 'twist_dichuc' },
          outcomes: [
            { p: 0.4, text: 'Hoá ra cụ có ba lô đất ở ngoại thành, không con cháu. Trong di chúc ghi: “Cho người duy nhất hỏi han tôi mỗi sáng.” Bạn bật khóc ngay tại văn phòng luật.', effects: { money: 3000000000, happy: 12, karma: 6 }, scene: { anim: 'cry', fx: ['money', 'tears'] } },
            { p: 0.6, text: 'Cụ để lại cho bạn chiếc đài cũ và một cuốn sổ chép tay ghi chuyện đời mình. Không đáng tiền, nhưng bạn giữ suốt đời.', effects: { happy: 6, karma: 4, smarts: 2 }, scene: { anim: 'sad', fx: 'sparkle' } }
          ] }
      ]
    },
    {
      id: 's_twist_banthan', title: 'Bạn thân là kẻ phản bội', icon: '🗡️', age: [20, 60], weight: 0.25,
      req: { has: 'friend', notFlag: 'twist_banthan' },
      text: 'Bạn vô tình đọc được tin nhắn trên điện thoại của {friend}: suốt nhiều năm, người bạn thân nhất đã nói xấu bạn sau lưng, còn lấy ý tưởng của bạn đi bán cho người khác.',
      scene: { loc: 'cafe', anim: 'angry', expr: 'angry', npcs: [{ role: 'friend', anim: 'scared', say: 'Để tao giải thích…' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Đối mặt, đòi lời giải thích', text: '{friend} khóc, thừa nhận vì ghen tị. Hai người cắt đứt. Bạn đau, nhưng nhẹ người vì đã biết sự thật.', effects: { happy: -6, rel: { friend: -60 }, smarts: 2, flag: 'twist_banthan' }, scene: { anim: 'angry' } },
        { label: 'Tha thứ, cho thêm một cơ hội', text: 'Bạn tha thứ. Có thể người ta sẽ thay đổi… hoặc không.', effects: { karma: 5, happy: -2, rel: { friend: -15 }, flag: 'twist_banthan' }, scene: { anim: 'sad' } },
        { label: 'Lặng lẽ rút lui, không nói gì', text: 'Bạn không nói gì, chỉ dần thưa liên lạc. Một tình bạn lặng lẽ khép lại.', effects: { happy: -4, rel: { friend: -40 }, flag: 'twist_banthan' }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_twist_songsinh', title: 'Người giống hệt bạn', icon: '👯', age: [16, 50], weight: 0.15,
      req: { notFlag: 'twist_songsinh' },
      text: 'Đi công tác ở thành phố khác, một người lạ chạy tới gọi bạn bằng cái tên khác. Rồi bạn gặp người đó: giống bạn như hai giọt nước, cùng ngày sinh.',
      scene: { loc: 'street', anim: 'scared', expr: 'scared', npcs: [{ role: 'stranger', anim: 'scared', say: 'Không thể nào…' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Cùng đi xét nghiệm, tìm hiểu sự thật', text: 'Hai người là anh/chị em song sinh thất lạc từ lúc lọt lòng. Câu chuyện đoàn tụ lên báo, hai người như tìm lại một nửa của mình.', effects: { happy: 12, karma: 3, followers: 0.15, flag: 'twist_songsinh', addPerson: { role: 'sibling', relation: 80 } }, scene: { anim: 'hug', fx: 'hearts' } },
        { label: 'Nghĩ là trùng hợp, bỏ qua', text: 'Bạn nghĩ là trùng hợp. Nhưng nhiều đêm sau, khuôn mặt ấy cứ ám ảnh bạn.', effects: { happy: -2, flag: 'twist_songsinh' }, scene: { anim: 'think' } }
      ]
    },
    {
      id: 's_twist_coinha', title: 'Ví tiền ảo bị quên', icon: '🪙', age: [25, 70], weight: 0.2,
      req: { minYear: 2022, notFlag: 'twist_coin' },
      text: 'Dọn máy tính cũ, bạn tìm thấy một ví tiền ảo mua chơi hồi 2013 với giá vài trăm nghìn. Giờ nó đáng giá… vài tỷ đồng. Nhưng bạn quên mật khẩu.',
      scene: { loc: 'bedroom', anim: 'type', expr: 'surprised', fx: 'money' },
      choices: [
        { label: 'Thử nhớ lại mật khẩu', success: { stat: 'smarts', base: 0.15, scale: 0.55 }, mini: 'quiz',
          outcomes: [
            { text: 'Lần thử thứ 9: tên con mèo đầu tiên cộng năm sinh. Ví mở ra! Bạn rút về được 4 tỷ trước khi giá kịp lao dốc.', effects: { money: 4000000000, happy: 18, flag: 'twist_coin' }, scene: { anim: 'cheer', fx: ['money', 'fireworks'] } },
            { text: 'Sai lần thứ 10, ví khoá vĩnh viễn. 4 tỷ nằm đó mãi mãi, ngay trước mắt bạn.', effects: { happy: -14, flag: 'twist_coin' }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Thuê “chuyên gia” phá mật khẩu', outcomes: [
          { p: 0.35, text: 'Chuyên gia mở được ví, lấy 30% phí. Bạn vẫn còn 2,8 tỷ!', effects: { money: 2800000000, happy: 12, flag: 'twist_coin' }, scene: { anim: 'cheer', fx: 'money' } },
          { p: 0.65, text: 'Gã “chuyên gia” mở được ví… rồi chuyển hết tiền đi và biến mất.', effects: { happy: -16, flag: 'twist_coin' }, scene: { anim: 'facepalm' } }
        ] }
      ]
    },
    {
      id: 's_twist_bomebimat', title: 'Bí mật của bố', icon: '🤫', age: [16, 60], weight: 0.2,
      req: { has: 'father', notFlag: 'twist_bomat' },
      text: 'Đám giỗ ông nội, một người phụ nữ lạ dắt theo một thanh niên đến thắp hương. Cả họ xì xào: người thanh niên đó giống {father.k} như đúc.',
      scene: { loc: 'home', anim: 'scared', npcs: [{ role: 'father', anim: 'facepalm' }, { role: 'stranger', anim: 'sad', say: 'Em chỉ muốn được thắp nén nhang.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đón nhận người anh/em cùng cha khác mẹ', text: 'Bạn bước tới, mời người thanh niên vào ngồi cùng mâm. Không khí dịu xuống. {father.k} nhìn bạn, mắt đỏ hoe.', effects: { karma: 6, happy: 2, rel: { father: 8 }, flag: 'twist_bomat', addPerson: { role: 'sibling', relation: 55 } }, scene: { anim: 'hug' } },
        { label: 'Đứng về phía mẹ, yêu cầu họ về', text: 'Bạn lạnh lùng tiễn khách. Đêm đó nhà bạn vỡ một trận cãi vã lớn chưa từng có.', effects: { happy: -8, rel: { father: -20, mother: 10 }, flag: 'twist_bomat' }, scene: { anim: 'angry', fx: 'anger' } }
      ]
    },
    {
      id: 's_twist_quayclip', title: 'Clip ngày xưa bất ngờ nổi', icon: '📼', age: [25, 70], weight: 0.2,
      req: { minYear: 2015, notFlag: 'twist_clip' },
      text: 'Một đoạn clip bạn hát karaoke dở tệ từ 10 năm trước bị ai đó đào lại, ghép nhạc, giờ đang là trend số 1 cả nước. Hàng nghìn người đang hát nhái theo bạn.',
      scene: { loc: 'karaoke', anim: 'facepalm', expr: 'surprised', fx: 'music' },
      choices: [
        { label: 'Tận dụng: hát lại bản “chuẩn” lên mạng', text: 'Bạn quay bản hát lại cực lầy, cả nước cười nghiêng ngả. Nhãn hàng gọi tới tấp mời quảng cáo.', effects: { happy: 10, money: 80000000, followers: 1, flag: 'twist_clip' }, scene: { anim: 'sing', fx: ['music', 'stars'] } },
        { label: 'Xấu hổ, trốn biệt', text: 'Bạn tắt điện thoại cả tháng. Ra đường vẫn có người nhận ra, hát nhái theo.', effects: { happy: -6, flag: 'twist_clip' }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_twist_benhnhamn', title: 'Chẩn đoán nhầm', icon: '🩺', age: [30, 80], weight: 0.15,
      req: { notFlag: 'twist_chandoan' },
      text: 'Ba tháng trước bạn nhận tin dữ: ung thư giai đoạn cuối, chỉ còn sống được nửa năm. Bạn đã bán nhà, đi du lịch khắp nơi, nói lời từ biệt mọi người… Hôm nay bệnh viện gọi: họ nhầm hồ sơ.',
      scene: { loc: 'hospital', anim: 'scared', expr: 'surprised', npcs: [{ role: 'doctor', anim: 'bow', say: 'Chúng tôi vô cùng xin lỗi…' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Kiện bệnh viện đòi bồi thường', success: { stat: 'smarts', base: 0.4, scale: 0.4 }, mini: 'interview',
          outcomes: [
            { text: 'Toà buộc bệnh viện bồi thường 1,5 tỷ. Bạn dùng tiền mua lại một căn nhà nhỏ, sống tiếp như được sinh ra lần nữa.', effects: { money: 1500000000, happy: 14, health: 5, flag: 'twist_chandoan' }, scene: { loc: 'office', anim: 'cheer', fx: 'stars' } },
            { text: 'Vụ kiện kéo dài, bạn chỉ được bồi thường tượng trưng. Nhưng ít ra bạn còn sống.', effects: { money: 50000000, happy: 8, flag: 'twist_chandoan' }, scene: { loc: 'office', anim: 'shrug' } }
          ] },
        { label: 'Bỏ qua, coi như được sống thêm một đời', text: 'Bạn cười ra nước mắt. Những tháng “sắp chết” đã dạy bạn trân trọng từng ngày. Bạn sống phần đời còn lại nhẹ nhõm lạ thường.', effects: { happy: 18, karma: 5, health: 5, flag: 'twist_chandoan' }, scene: { anim: 'cheer', fx: 'sparkle' } }
      ]
    }
  );
})();
