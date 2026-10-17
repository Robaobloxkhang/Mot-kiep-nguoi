/* Một Kiếp Người — ngoại truyện: tội phạm & an ninh (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: CƯỚP GIẬT ĐIỆN THOẠI =======================
    {
      id: 's_crime_giat_dt', title: 'Bàn tay trong đêm', icon: '📱', age: [18, 60], weight: 1.2,
      req: { notFlag: 's_crime_giat' },
      text: 'Mười giờ đêm, bạn tấp xe máy vào lề, mở bản đồ trên điện thoại tìm đường. Một chiếc xe không biển số lướt sát, kẻ ngồi sau đội mũ lưỡi trai giật phăng chiếc điện thoại khỏi tay bạn rồi rồ ga vọt đi.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'scared', expr: 'surprised', say: 'Ê! Điện thoại của tôi!',
        npcs: [{ role: 'thief', anim: 'drive' }, { role: 'vendor', gender: 'f', age: 56, anim: 'point', say: 'Cướp! Nó chạy hướng kia kìa!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Rồ ga đuổi theo',
          outcomes: [
            { p: 0.35, text: 'Bạn bám riết qua hai ngã tư. Tới đèn đỏ, mấy anh xe ôm xúm vào chặn đầu, {thief.k} hoảng hồn ném chiếc điện thoại xuống đường rồi bỏ chạy. Bạn thở dốc mà cười như được mùa.',
              effects: { happy: 7, karma: 2, health: -1, flag: 's_crime_giat' },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { thief: 'run', vendor: 'clap' } } },
            { p: 0.4, text: 'Chiếc xe kia ôm cua, rẽ ngoắt vào một con hẻm tối om. Bạn phanh kít ở đầu hẻm, tim đập thình thịch.',
              effects: { health: -1, flag: 's_crime_giat', followUp: { id: 's_crime_giat_hem', delay: 0 } },
              scene: { anim: 'think', expr: 'scared', fx: 'sweat', npcAnim: { thief: 'run' } } },
            { p: 0.25, text: 'Cua gấp quá, bánh xe trượt vệt dầu, bạn ngã sõng soài, trầy hết một bên tay. Kẻ cướp mất hút trong dòng xe.',
              effects: { health: -8, happy: -6, asset: { lose: 'phone' }, flag: 's_crime_giat', followUp: { id: 's_crime_giat_baocao', delay: 0 } },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { vendor: 'scared', thief: 'run' } } }
          ] },
        { label: 'Buông tay, của đi thay người',
          text: 'Bạn đứng chết lặng nhìn ánh đèn hậu xa dần. Mất điện thoại, mất cả danh bạ, nhưng tay chân còn nguyên vẹn.',
          effects: { happy: -6, smarts: 1, asset: { lose: 'phone' }, flag: 's_crime_giat', followUp: { id: 's_crime_giat_baocao', delay: 0 } },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { vendor: 'shake', thief: 'run' } } },
        { label: 'Hô thật to “Cướp! Cướp!”',
          outcomes: [
            { p: 0.45, text: 'Tiếng hô của bạn vang cả khu phố. Một anh giao hàng chặn đầu, chiếc xe kia loạng choạng, điện thoại văng xuống đường, nứt màn hình nhưng vẫn sáng. Thay màn hình hết {money:1200000}.',
              effects: { happy: 5, money: -1200000, karma: 1, flag: 's_crime_giat' },
              scene: { anim: 'jump', fx: 'exclaim', npcAnim: { vendor: 'cheer', thief: 'run' } } },
            { p: 0.55, text: 'Cả phố quay ra nhìn, nhưng chiếc xe đã mất hút. Cô bán nước lắc đầu ngao ngán.',
              effects: { happy: -4, asset: { lose: 'phone' }, flag: 's_crime_giat', followUp: { id: 's_crime_giat_baocao', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { vendor: 'shake' }, npcSay: { vendor: 'Tuần này vụ thứ ba rồi đó con!' } } }
          ] }
      ]
    },
    {
      id: 's_crime_giat_hem', title: 'Đầu hẻm tối', icon: '🌑', age: [18, 70], chainOnly: true,
      text: 'Con hẻm sâu hun hút, chỉ có ngọn đèn le lói ở cuối hẻm. Bạn nghe tiếng xe tắt máy và tiếng hai gã thì thầm. Chiếc điện thoại của bạn đang ở trong đó.',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thief', anim: 'idle', expr: 'angry', say: 'Theo tới đây là liều đó nha!' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Lao vào hẻm, tay không giành lại',
          outcomes: [
            { p: 0.3, text: 'Bạn quát thật lớn rồi lao thẳng vào. Không ngờ {thief.k} hoảng, ném điện thoại xuống đất rồi trèo tường chạy mất. Bạn nhặt máy lên, chân vẫn còn run.',
              effects: { happy: 6, health: -2 },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { thief: 'run' } } },
            { p: 0.62, text: 'Hai gã quay lại xô bạn ngã đập đầu vào tường rồi bỏ chạy. Người trong hẻm đưa bạn đi viện khâu năm mũi. Điện thoại mất, đầu thì quấn băng trắng.',
              effects: { health: -16, happy: -10, money: -2500000, asset: { lose: 'phone' }, followUp: { id: 's_crime_giat_baocao', delay: 0 } },
              scene: { anim: 'fall', fx: 'stars', npcAnim: { thief: 'run' } } },
            { p: 0.08, text: 'Trong bóng tối, một kẻ rút dao. Mọi chuyện diễn ra quá nhanh. Người dân trong hẻm gọi cấp cứu, nhưng bạn đã không qua khỏi.',
              effects: { die: 'Bị cướp tấn công khi đuổi theo' },
              scene: { anim: 'fall', fx: 'tears', shot: 'wide' } }
          ] },
        { label: 'Dừng lại, gọi 113 rồi chờ',
          text: 'Bạn lùi ra đường lớn, gọi 113, tả rõ chiếc xe và hướng chạy. Mười phút sau tổ tuần tra tới soi đèn khắp hẻm, nhưng bọn chúng đã thoát qua lối sau.',
          effects: { smarts: 3, happy: -3, asset: { lose: 'phone' }, followUp: { id: 's_crime_giat_baocao', delay: 0 } },
          scene: { anim: 'phone', say: 'Alo 113, tôi vừa bị cướp giật!', fx: 'exclaim', npcAnim: { thief: 'run' } } },
        { label: 'Quay xe về, không đáng liều',
          text: 'Bạn nhìn con hẻm thêm vài giây rồi quay đầu xe. Điện thoại thì mua lại được, mạng sống thì không.',
          effects: { happy: -4, smarts: 2, karma: 1, asset: { lose: 'phone' } },
          scene: { anim: 'drive', fx: 'dust' } }
      ]
    },
    {
      id: 's_crime_giat_baocao', title: 'Trình báo công an phường', icon: '📝', age: [18, 70], chainOnly: true,
      text: 'Bạn đến công an phường trình báo. {police.K} {police} vừa ghi biên bản vừa hỏi kỹ: xe màu gì, chạy hướng nào, có nhớ biển số không. Ngoài cửa, đèn đường vàng vọt, đêm đã khuya lắm rồi.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'talk', expr: 'sad',
        npcs: [{ role: 'police', anim: 'type', say: 'Nhớ được đặc điểm gì cứ khai hết nhé.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đi xin trích xuất camera dọc đường',
          outcomes: [
            { p: 0.65, text: 'Bạn gõ cửa từng nhà có camera. Một đoạn clip ghi rõ mặt {thief.k} lúc dừng đèn đỏ. {police.K} {police} gật gù: “Có cái này là dễ rồi.”',
              effects: { smarts: 3, karma: 2, flag: 's_crime_giat_manh_moi', followUp: { id: 's_crime_giat_tim', delay: 1 } },
              scene: { anim: 'point', fx: 'idea', npcAnim: { police: 'nod' }, npcSay: { police: 'Có cái này là dễ rồi.' } } },
            { p: 0.35, text: 'Camera thì nhiều mà cái nào cũng mờ như sương. Bạn về nhà lúc ba giờ sáng, tay trắng.',
              effects: { happy: -4, health: -2 },
              scene: { anim: 'facepalm', fx: 'zzz', npcAnim: { police: 'shrug' } } }
          ] },
        { label: 'Đăng bài nhờ cộng đồng mạng',
          outcomes: [
            { p: 0.45, text: 'Bài đăng được chia sẻ cả nghìn lần. Một người lạ nhắn tin gửi đoạn clip quay được kẻ cướp, bạn chuyển ngay cho công an.',
              effects: { happy: 3, smarts: 1, followUp: { id: 's_crime_giat_tim', delay: 1 } },
              scene: { anim: 'phone', fx: 'bubbles', npcAnim: { police: 'nod' } } },
            { p: 0.55, text: 'Một tài khoản lạ nhắn: “Chuyển 2 triệu tiền chuộc, trả máy liền.” Bạn chuyển, rồi bị chặn. Mất máy, mất thêm tiền.',
              effects: { money: -2000000, happy: -8, smarts: 1 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { police: 'facepalm' } } }
          ] },
        { label: 'Mua máy mới, cho qua chuyện',
          text: 'Bạn ra cửa hàng mua chiếc điện thoại mới, mất {money:6000000} và hai ngày khôi phục danh bạ. Từ đó mỗi lần đi đêm, bạn cất máy thật sâu trong túi.',
          effects: { money: -6000000, happy: -3, smarts: 2 },
          scene: { loc: 'street', time: 'day', anim: 'phone', fx: 'sweat' } }
      ]
    },
    {
      id: 's_crime_giat_tim', title: 'Cuộc gọi từ công an', icon: '🚔', age: [18, 75], chainOnly: true,
      text: 'Một năm sau, {police.K} {police} gọi bạn lên phường: băng cướp giật chuyên chạy đêm đã bị triệt phá, trong đống tang vật có chiếc điện thoại của bạn. Kẻ giật máy hôm ấy, {thief}, đang ngồi cúi gằm ở góc phòng.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'police', anim: 'talk', say: 'Máy của em đúng không? Ký nhận nhé.' }, { role: 'thief', anim: 'sad', expr: 'sad' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Nhận lại máy, đề nghị xử nghiêm',
          text: 'Bạn ký biên bản nhận lại tài sản. Chiếc máy trầy xước, nhưng ảnh của cả nhà vẫn còn nguyên trong đó.',
          effects: { happy: 8, flag: 's_crime_giat_xong', asset: { add: { type: 'phone', name: 'Điện thoại cũ (tìm lại được)', value: 3000000 } } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { police: 'nod' } } },
        { label: 'Hỏi chuyện {thief}',
          text: '{thief} kể mẹ nằm viện, nợ tiền thuốc nên mới theo đàn anh đi giật. Bạn không tha thứ được hết, nhưng hiểu được một phần.',
          effects: { happy: 4, karma: 4, smarts: 2, flag: 's_crime_giat_xong' },
          scene: { anim: 'sit', expr: 'sad', npcAnim: { thief: 'cry' }, npcSay: { thief: 'Em xin lỗi... em sai rồi.' } } },
        { label: 'Viết đơn xin giảm nhẹ cho {thief}',
          text: 'Bạn viết đơn bãi nại phần dân sự, xin cho {thief} được hưởng khoan hồng. {police.K} {police} nhìn bạn, gật đầu chậm rãi.',
          effects: { happy: 5, karma: 10, flag: 's_crime_giat_xong' },
          scene: { anim: 'type', fx: 'sparkle', npcAnim: { thief: 'bow', police: 'nod' }, npcSay: { thief: 'Em cảm ơn... em sẽ làm lại từ đầu.' } } }
      ]
    },

    // ======================= ARC 2: TRỘM ĐỘT NHẬP NHÀ =======================
    {
      id: 's_crime_trom_nha', title: 'Tiếng động lúc hai giờ sáng', icon: '🕵️', age: [16, 90], weight: 1.0,
      req: { notFlag: 's_crime_trom' },
      text: 'Hai giờ sáng, bạn choàng tỉnh vì tiếng lạch cạch dưới nhà. Hé cửa nhìn xuống, một bóng người trùm mũ áo khoác đang lần mò mở tủ, ánh đèn pin nhỏ lia qua lia lại.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thief', anim: 'crawl' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Nằm im, giả vờ ngủ say',
          text: 'Bạn rón rén về giường, trùm chăn kín đầu. Lát sau hắn lên tận phòng, lục ngăn bàn ngay sát đầu giường, bạn nín thở đến tê cả người. Sáng ra mất {money:4000000} và chiếc máy tính xách tay.',
          effects: { money: -4000000, happy: -8, health: -1, flag: 's_crime_trom', followUp: { id: 's_crime_trom_dieutra', delay: 0 } },
          scene: { loc: 'bedroom', anim: 'sleep', expr: 'scared', fx: 'sweat', npcAnim: { thief: 'walk' } } },
        { label: 'Bật đèn, hô thật to',
          outcomes: [
            { p: 0.7, text: 'Đèn bật sáng, bạn hét “Trộm! Trộm!” vang cả xóm. Hắn giật mình làm rơi cả túi đồ, phóng qua cửa sổ chạy mất. Hàng xóm cầm đèn pin kéo sang đông nghịt.',
              effects: { happy: 3, karma: 1, flag: 's_crime_trom', followUp: { id: 's_crime_trom_dieutra', delay: 0 } },
              scene: { anim: 'point', expr: 'angry', fx: 'flash', npcAnim: { thief: 'run' } } },
            { p: 0.3, text: 'Hắn giật mình, nhưng kịp vơ chiếc điện thoại trên bàn rồi lao ra cửa. Bạn chỉ kịp nhìn thấy tấm lưng áo khoác đen.',
              effects: { happy: -5, asset: { lose: 'phone' }, money: -500000, flag: 's_crime_trom', followUp: { id: 's_crime_trom_dieutra', delay: 0 } },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { thief: 'run' } } }
          ] },
        { label: 'Vớ cây chổi, lao xuống vật lộn',
          outcomes: [
            { p: 0.44, text: 'Bạn hét lớn rồi lao vào. Hai bên giằng co lăn lộn, tiếng động làm hàng xóm chạy sang. Mọi người khống chế được {thief.k}, trói lại chờ công an.',
              effects: { happy: 6, health: -6, karma: 2, flag: ['s_crime_trom', 's_crime_trom_bat'], followUp: { id: 's_crime_trom_toa', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { thief: 'fall' } } },
            { p: 0.5, text: 'Hắn xô bạn ngã lăn xuống mấy bậc cầu thang rồi tẩu thoát. Bạn bong gân cổ chân, bầm tím khắp người.',
              effects: { health: -14, happy: -8, illness: 'Chấn thương cơ', flag: 's_crime_trom', followUp: { id: 's_crime_trom_dieutra', delay: 0 } },
              scene: { anim: 'fall', fx: 'stars', npcAnim: { thief: 'run' } } },
            { p: 0.06, text: 'Trong lúc giằng co, kẻ gian rút dao. Hàng xóm nghe tiếng động chạy sang thì đã quá muộn.',
              effects: { die: 'Bị kẻ trộm tấn công khi chống cự' },
              scene: { anim: 'fall', fx: 'tears', shot: 'wide' } }
          ] },
        { label: 'Lặng lẽ gọi 113',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn nép sau cửa, thì thầm báo địa chỉ. Bảy phút sau, tổ tuần tra ập vào, bắt {thief.k} ngay tại trận, tay còn cầm túi đồ.',
              effects: { happy: 8, smarts: 2, karma: 2, flag: ['s_crime_trom', 's_crime_trom_bat'], followUp: { id: 's_crime_trom_toa', delay: 1 } },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { thief: 'sad' } } },
            { text: 'Công an tới nơi thì hắn đã cao chạy xa bay, dắt theo cả chiếc xe máy để dưới nhà.',
              effects: { happy: -8, asset: { lose: 'motorbike' }, flag: 's_crime_trom', followUp: { id: 's_crime_trom_dieutra', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { thief: 'run' } } }
          ] }
      ]
    },
    {
      id: 's_crime_trom_dieutra', title: 'Khám nghiệm hiện trường', icon: '🔎', age: [16, 95], chainOnly: true,
      text: 'Sáng hôm sau, {police.K} {police} đến chụp ảnh ổ khóa bị cắt, ghi lời khai. {neighbor.K} {neighbor} hàng xóm đứng ngoài cổng kể: “Tuần trước tôi thấy có đứa đi lòng vòng hỏi mua phế liệu, chắc là nó dò đường.”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'talk', expr: 'sad',
        npcs: [{ role: 'police', anim: 'think', say: 'Ổ khóa này bị cắt bằng kìm cộng lực.' }, { role: 'neighbor', anim: 'point', say: 'Tuần trước tôi thấy nó lảng vảng!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Xin trích xuất camera cả xóm',
          outcomes: [
            { p: 0.6, text: 'Camera nhà {neighbor} ghi rõ mặt kẻ gian lúc trèo cổng. Ba hôm sau, công an báo đã bắt được người.',
              effects: { happy: 6, karma: 2, flag: 's_crime_trom_bat', followUp: { id: 's_crime_trom_toa', delay: 1 } },
              scene: { anim: 'cheer', fx: 'idea', npcAnim: { police: 'nod', neighbor: 'clap' } } },
            { p: 0.4, text: 'Camera xóm toàn loại rẻ tiền, ban đêm chỉ thấy một cái bóng mờ mờ. Vụ việc chìm dần.',
              effects: { happy: -3 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { police: 'shrug' } } }
          ] },
        { label: 'Lắp camera, thay khóa chống cắt',
          text: 'Bạn lắp hai mắt camera, thay ổ khóa chống cắt, mất {money:6000000}. Đêm đầu tiên bạn ngủ ngon trở lại.',
          effects: { money: -6000000, happy: 3, smarts: 2, flag: 's_crime_camera' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { neighbor: 'nod' } } },
        { label: 'Nhận nuôi một chú chó giữ nhà',
          text: 'Bạn xin về một chú chó con lông vàng. Ba tháng sau nó đã sủa vang mỗi khi có tiếng lạ, còn cả nhà thì cưng như trứng.',
          effects: { happy: 6, money: -500000, addPerson: { role: 'pet', kind: 'dog' }, flag: 's_crime_nuoi_cho' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { neighbor: 'laugh' } } },
        { label: 'Rủ cả xóm lập tổ tuần tra',
          text: 'Bạn nhắn vào nhóm chat khu phố. Tối đó cả xóm họp, lập tổ tuần tra luân phiên, ai cũng nhận ca. Xóm nhỏ bỗng thân nhau hơn hẳn.',
          effects: { karma: 5, happy: 4, flag: 's_crime_to_tuan_tra' },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { neighbor: 'cheer', police: 'clap' } } }
      ]
    },
    {
      id: 's_crime_trom_toa', title: 'Phiên tòa', icon: '⚖️', age: [16, 95], chainOnly: true,
      text: 'Giấy triệu tập gửi đến: bạn được mời làm chứng trong phiên xử {thief}, kẻ đã đột nhập nhà bạn năm ngoái. Trong phòng xử, {thief} gầy rộc, cạo trọc đầu, liếc nhìn bạn một cái rồi cúi gằm.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'idle', expr: 'neutral',
        npcs: [{ role: 'thief', anim: 'sad', expr: 'sad' }, { role: 'police', anim: 'idle' }, { role: 'crowd', anim: 'sit' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Khai đúng những gì đã thấy',
          text: 'Bạn kể lại từng chi tiết, không thêm không bớt. Tòa tuyên {thief} hai năm tù. Ra khỏi tòa, lòng bạn nhẹ tênh mà cũng nằng nặng.',
          effects: { karma: 5, smarts: 2, happy: 3, flag: 's_crime_trom_xong' },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { thief: 'sad' } } },
        { label: 'Xin tòa khoan hồng vì {thief} còn trẻ',
          text: 'Bạn nói thêm: “Cậu ấy còn trẻ, xin tòa cho một cơ hội.” {thief} ngẩng lên nhìn bạn, mắt đỏ hoe. Bản án được giảm nhẹ.',
          effects: { karma: 10, happy: 4, flag: ['s_crime_trom_xong', 's_crime_trom_khoan_hong'], followUp: { id: 's_crime_trom_hoan_luong', delay: 3 } },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { thief: 'cry' } } },
        { label: 'Thêm mắm dặm muối cho hắn chừa',
          outcomes: [
            { p: 0.5, text: 'Bạn kể thêm vài chi tiết “cho nặng tội”. Luật sư bào chữa chỉ ra lời khai lệch với biên bản, bạn đỏ mặt trước cả phòng xử.',
              effects: { karma: -8, happy: -6, flag: 's_crime_trom_xong' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'point' } } },
            { p: 0.5, text: 'Bản án nặng hơn thật. Bạn thấy hả dạ được đúng một buổi, rồi cứ nghĩ mãi về ánh mắt của {thief}.',
              effects: { karma: -8, happy: -1, flag: 's_crime_trom_xong' },
              scene: { anim: 'think', fx: 'question', npcAnim: { thief: 'cry' } } }
          ] }
      ]
    },
    {
      id: 's_crime_trom_hoan_luong', title: 'Người đến gõ cửa', icon: '🍊', age: [18, 99], chainOnly: true,
      text: 'Ba năm sau, một thanh niên rụt rè đứng trước cổng, tay xách túi cam. Là {thief}. Cậu mới mãn hạn, giờ làm thợ sửa xe ở đầu chợ, đến chỉ để nói một câu xin lỗi.',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'thief', anim: 'bow', say: 'Em đến để xin lỗi... và cảm ơn.' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Mời vào nhà uống chén trà',
          text: 'Hai người ngồi đến tối mịt. {thief} kể chuyện trong trại, chuyện học nghề, chuyện mẹ đã khỏe. Từ đó, xe bạn hỏng là có người sửa miễn phí.',
          effects: { karma: 8, happy: 8, addPerson: { role: 'friend', fromScene: 'thief' }, flag: 's_crime_hoan_luong' },
          scene: { anim: 'drink', fx: 'steam', npcAnim: { thief: 'laugh' } } },
        { label: 'Nhận túi cam, chúc cậu làm ăn tử tế',
          text: 'Bạn nhận túi cam, vỗ vai cậu: “Sống cho đàng hoàng là được.” {thief} cúi chào rồi đạp xe đi, lưng thẳng hơn lúc đến.',
          effects: { karma: 4, happy: 5 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { thief: 'wave' } } },
        { label: 'Đóng cổng, chuyện cũ không muốn nhắc',
          text: 'Bạn khép cổng lại. Túi cam vẫn treo trên chấn song suốt buổi tối, như một lời xin lỗi chưa được nhận.',
          effects: { happy: -2, karma: -1 },
          scene: { anim: 'shake', fx: 'question', npcAnim: { thief: 'sad' } } }
      ]
    },

    // ======================= ARC 3: MẤT XE Ở QUÁN CÀ PHÊ =======================
    {
      id: 's_crime_mat_xe_cafe', title: 'Tấm vé xe trong túi', icon: '🛵', age: [18, 70], weight: 1.0,
      req: { asset: 'motorbike', notFlag: 's_crime_mat_xe' },
      text: 'Bạn ngồi quán cà phê chạy việc suốt buổi chiều. Bước ra, chỗ để xe trống trơn, trong khi vé xe vẫn nằm trong túi bạn. Chú giữ xe gãi đầu: “Ủa, nãy có thằng đưa vé lấy xe rồi mà?”',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'vendor', gender: 'm', age: 62, anim: 'shrug', say: 'Nãy có thằng đưa vé lấy xe rồi mà?' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Tự đi lùng các hội mua bán xe cũ',
          text: 'Bạn chụp lại vé xe, lưu ảnh chiếc xe, rồi thức trắng lướt các hội nhóm mua bán xe cũ. Đêm thứ ba, một tin rao bán làm bạn khựng lại.',
          effects: { happy: -6, asset: { lose: 'motorbike' }, flag: 's_crime_mat_xe', followUp: { id: 's_crime_xe_cho', delay: 0 } },
          scene: { anim: 'phone', time: 'night', fx: 'idea' } },
        { label: 'Lên công an phường trình báo',
          text: 'Bạn làm đơn trình báo, nộp giấy đăng ký xe và đoạn camera của quán. Công an hẹn sẽ thông báo khi có tin.',
          effects: { happy: -6, smarts: 1, asset: { lose: 'motorbike' }, flag: 's_crime_mat_xe', followUp: { id: 's_crime_xe_cong_an', delay: 1 } },
          scene: { loc: 'office', anim: 'type', fx: 'question' } },
        { label: 'Bắt quán phải đền',
          outcomes: [
            { p: 0.5, text: 'Chủ quán ngại lùm xùm, đền bạn {money:5000000} rồi cho chú giữ xe nghỉ. Tiền đền chưa bằng một phần ba chiếc xe.',
              effects: { money: 5000000, happy: -5, asset: { lose: 'motorbike' }, flag: 's_crime_mat_xe' },
              scene: { anim: 'shrug', fx: 'money', npcAnim: { vendor: 'sad' } } },
            { p: 0.5, text: 'Chủ quán chỉ vào tấm biển “Quán không chịu trách nhiệm mất mát”. Hai bên cãi nhau một trận to, rốt cuộc bạn đi bộ về.',
              effects: { happy: -9, asset: { lose: 'motorbike' }, flag: 's_crime_mat_xe' },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { vendor: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_crime_xe_cho', title: 'Chợ đồ cũ sáng Chủ nhật', icon: '🔍', age: [18, 75], chainOnly: true,
      text: 'Theo tin rao, bạn tìm tới một bãi xe ở chợ đồ cũ. Một chiếc xe đã sơn lại màu khác, thay biển số, nhưng vết xước hình chữ V trên yếm thì bạn nhận ra ngay. Người bán xoa tay mời chào rối rít.',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'thief', anim: 'talk', say: 'Xe zin, chạy êm ru, giá mềm nè!' }, { role: 'crowd', anim: 'walk' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Trả tiền chuộc lại cho nhanh',
          text: 'Bạn mặc cả còn {money:9000000} rồi dắt xe về. Có lại xe thì mừng, nhưng nghĩ tới việc mình vừa trả tiền cho kẻ trộm thì nghẹn cả cổ.',
          effects: { money: -9000000, happy: 2, karma: -2, asset: { add: { type: 'motorbike', name: 'Xe máy cũ (chuộc lại)', value: 12000000 } } },
          scene: { anim: 'drive', fx: 'money', npcAnim: { thief: 'laugh' } } },
        { label: 'Giả vờ mặc cả, lén nhắn công an',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn kì kèo từng trăm nghìn, tay nhắn tin dưới gầm bàn. Mười lăm phút sau công an ập tới, {thief.k} bị bắt tại chỗ, chiếc xe được trả về cho bạn.',
              effects: { happy: 10, karma: 5, smarts: 2, asset: { add: { type: 'motorbike', name: 'Xe máy cũ (tìm lại được)', value: 12000000 } } },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { thief: 'scared', crowd: 'clap' } } },
            { text: 'Hắn liếc thấy màn hình điện thoại của bạn, nhảy lên xe nổ máy chạy mất. Lần này thì mất thật rồi.',
              effects: { happy: -8, smarts: 1 },
              scene: { anim: 'facepalm', fx: 'dust', npcAnim: { thief: 'drive' } } }
          ] },
        { label: 'Túm lấy tay lái, hô “Xe của tôi!”',
          outcomes: [
            { p: 0.5, text: 'Người trong chợ xúm lại, bạn đọc vanh vách số khung. {thief.K} chột dạ, bỏ của chạy lấy người. Bạn dắt xe về giữa tiếng vỗ tay.',
              effects: { happy: 7, karma: 2, asset: { add: { type: 'motorbike', name: 'Xe máy cũ (giành lại được)', value: 12000000 } } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { thief: 'run', crowd: 'clap' } } },
            { p: 0.5, text: 'Đồng bọn của hắn chen vào xô đẩy, bạn ngã dúi dụi, rách cả khuỷu tay. Lúc đứng dậy được thì chiếc xe đã mất hút.',
              effects: { health: -9, happy: -7 },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { thief: 'drive' } } }
          ] }
      ]
    },
    {
      id: 's_crime_xe_cong_an', title: 'Bãi xe tang vật', icon: '🚓', age: [18, 75], chainOnly: true,
      text: 'Một năm sau, công an gọi bạn đến nhận dạng xe: đường dây trộm xe liên tỉnh vừa bị triệt phá. Chiếc xe của bạn nằm lẫn giữa hàng trăm chiếc khác, đã bị tháo gương, thay yên, nhưng số khung vẫn khớp.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'police', anim: 'point', say: 'Số khung khớp rồi, ký nhận nhé.' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Ký nhận, dắt xe về',
          text: 'Bạn xoa tay lên yên xe như gặp lại người quen cũ. Thay lại cái gương mới, chiếc xe vẫn nổ máy giòn tan.',
          effects: { happy: 8, money: -300000, asset: { add: { type: 'motorbike', name: 'Xe máy cũ (tìm lại được)', value: 10000000 } } },
          scene: { anim: 'drive', fx: 'sparkle', npcAnim: { police: 'wave' } } },
        { label: 'Nhận xe rồi bán luôn cho đỡ vướng',
          text: 'Bạn đã quen đi xe buýt cả năm nay. Dắt xe ra tiệm bán được {money:8000000}, coi như lộc trời cho.',
          effects: { money: 8000000, happy: 4 },
          scene: { anim: 'shrug', fx: 'money', npcAnim: { police: 'nod' } } },
        { label: 'Mang giỏ trái cây cảm ơn các anh',
          text: 'Bạn mang giỏ trái cây sang cảm ơn, các anh chỉ nhận một nải chuối cho vui. Ai cũng vui khi thấy chủ xe mừng như bắt được vàng.',
          effects: { happy: 7, karma: 4, money: -300000, asset: { add: { type: 'motorbike', name: 'Xe máy cũ (tìm lại được)', value: 10000000 } } },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { police: 'laugh' } } }
      ]
    },
    {
      id: 's_crime_moc_tui', title: 'Bàn tay nhẹ như lông vũ', icon: '👛', age: [14, 90], weight: 0.9, once: false, cooldown: 4,
      text: 'Chợ sáng đông nghịt, ai cũng chen vai. Bạn bỗng thấy túi quần nhẹ bẫng. Quay lại, một người đội nón đang lách nhanh vào dòng người, tay vừa nhét vật gì đó vào túi áo.',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'thief', anim: 'walk' }, { role: 'vendor', anim: 'point', say: 'Nó kìa! Áo xám đội nón kìa!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Lao tới túm áo hắn',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn túm được vạt áo, giật lại cái ví ngay giữa chợ. Mấy cô bán hàng vỗ tay rần rần, còn {thief.k} giằng ra chạy trối chết.',
              effects: { happy: 6, karma: 2 },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { thief: 'run', vendor: 'clap' } } },
            { text: 'Bạn với hụt, va đổ nguyên rổ trứng gà. Hắn mất hút, còn bạn đền {money:300000} tiền trứng và mất cái ví có {money:700000}.',
              effects: { money: -1000000, happy: -6 },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { thief: 'run', vendor: 'angry' } } }
          ] },
        { label: 'Hô lên cho cả chợ biết',
          outcomes: [
            { p: 0.5, text: 'Cô bán cá chặn ngay lối ra, {thief.k} vứt cái ví xuống đất rồi chuồn. Ví còn nguyên, chỉ hơi tanh mùi cá.',
              effects: { happy: 5 },
              scene: { anim: 'jump', fx: 'exclaim', npcAnim: { vendor: 'cheer', thief: 'run' } } },
            { p: 0.5, text: 'Cả chợ nhốn nháo nhưng hắn đã lẩn mất. Bạn mất {money:700000} và một buổi sáng tử tế.',
              effects: { money: -700000, happy: -5 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { vendor: 'shake' } } }
          ] },
        { label: 'Thôi, kiểm đồ rồi về',
          text: 'Bạn đứng nép vào sạp rau kiểm lại đồ: mất cái ví có {money:700000}. Từ đó đi chợ bạn đeo túi trước ngực, kéo khóa kỹ càng.',
          effects: { money: -700000, happy: -4, smarts: 2 },
          scene: { anim: 'think', fx: 'idea', npcAnim: { vendor: 'shrug' } } }
      ]
    },

    // ======================= ARC 4: LỪA ĐẢO QUA ĐIỆN THOẠI / MẠNG =======================
    {
      id: 's_crime_lua_con', title: 'Con đang cấp cứu!', icon: '☎️', age: [38, 90], weight: 1.0,
      req: { has: ['child'], notFlag: 's_crime_lua_con', cond: function (s) { return s.people.every(function (p) { return p.role !== 'child' || !p.alive || p.age >= 12; }); } },
      text: 'Một số lạ gọi tới, giọng gấp gáp: “Có phải người nhà của {child} không? {child} bị tai nạn đang cấp cứu, cần chuyển ngay {money:30000000} tiền mổ, chậm là nguy hiểm!” Đầu dây bên kia văng vẳng tiếng còi xe cứu thương.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'phone', expr: 'scared', say: 'Con tôi làm sao? Bệnh viện nào?', fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Chuyển tiền ngay, con là trên hết',
          text: 'Tay run lẩy bẩy, bạn chuyển khoản ngay. Đầu dây bên kia cúp máy. Mười phút sau, chính {child} gọi về hỏi chuyện vui vẻ như chưa hề có gì.',
          effects: { money: -30000000, happy: -15, health: -2, flag: ['s_crime_lua_con', 's_crime_bi_lua'], followUp: { id: 's_crime_lua_bao_an', delay: 0 } },
          scene: { anim: 'cry', fx: 'tears', shot: 'dramatic' } },
        { label: 'Gọi thẳng cho {child}',
          outcomes: [
            { p: 0.8, text: '{child} bắt máy sau hai hồi chuông, đang ngồi ăn trưa ngon lành. Bạn thở phào, rồi tức tím mặt khi hiểu ra mình vừa suýt bị lừa.',
              effects: { happy: 4, smarts: 3, rel: { child: 3 }, flag: 's_crime_lua_con' },
              scene: { anim: 'facepalm', fx: 'sweat' } },
            { p: 0.2, text: '{child} không bắt máy, bạn sợ đến lạnh người. Gọi thêm mấy người quen mới biết {child} đang họp, điện thoại để im lặng. Bạn ngồi phịch xuống ghế.',
              effects: { happy: 1, health: -2, smarts: 2, rel: { child: 2 }, flag: 's_crime_lua_con' },
              scene: { anim: 'sit', fx: 'sweat' } }
          ] },
        { label: 'Hỏi tên bệnh viện, bác sĩ, rồi tự gọi kiểm tra',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bệnh viện xác nhận không có bệnh nhân nào tên như vậy. Bạn ghi âm lại cuộc gọi lần hai rồi mang lên công an trình báo.',
              effects: { smarts: 4, karma: 3, happy: 3, flag: ['s_crime_lua_con', 's_crime_lua_bao_cao'], followUp: { id: 's_crime_lua_triet_pha', delay: 2 } },
              scene: { anim: 'nod', fx: 'idea' } },
            { text: 'Bạn vừa hỏi tên bác sĩ, đầu dây bên kia đã cúp máy cái rụp. Bạn ngồi thừ, tim vẫn đập thình thịch.',
              effects: { smarts: 2, happy: -1, flag: 's_crime_lua_con' },
              scene: { anim: 'think', fx: 'question' } }
          ] }
      ]
    },
    {
      id: 's_crime_viec_nhe', title: 'Việc nhẹ lương cao', icon: '💼', age: [18, 35], weight: 1.2,
      req: { notFlag: 's_crime_viec_nhe' },
      text: 'Một tài khoản tên “Chị Hằng Tuyển Dụng” nhắn tin: “Việc online tại nhà, chỉ cần thả tim sản phẩm, mỗi nhiệm vụ 50 nghìn, ngày kiếm cả triệu.” Kèm theo là cả chục ảnh chụp chuyển khoản của “các bạn cộng tác viên”.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Làm thử vài nhiệm vụ',
          text: 'Bạn thả tim ba sản phẩm, mười phút sau tài khoản báo nhận {money:150000}. Tiền thật! Bạn mở to mắt nhìn màn hình.',
          effects: { money: 150000, happy: 3, flag: 's_crime_viec_nhe', followUp: { id: 's_crime_viec_nhe_vip', delay: 0 } },
          scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Chặn luôn, việc gì mà ngon thế',
          text: 'Bạn chặn tài khoản, đăng lên nhóm lớp cảnh báo. Trên đời này, việc nào nhẹ mà lương cao thì thường là việc của kẻ lừa.',
          effects: { smarts: 2, happy: 1, karma: 2, flag: 's_crime_viec_nhe' },
          scene: { anim: 'shake', fx: 'idea' } },
        { label: 'Hỏi tên công ty, mã số thuế',
          text: '“Chị Hằng” trả lời vòng vo được hai câu thì chặn bạn luôn. Bạn bật cười, tự thưởng một ly trà sữa vì sự tỉnh táo.',
          effects: { smarts: 3, happy: 2, money: -35000, flag: 's_crime_viec_nhe' },
          scene: { anim: 'laugh', fx: 'question' } }
      ]
    },
    {
      id: 's_crime_viec_nhe_vip', title: 'Nhiệm vụ combo', icon: '🧾', age: [18, 40], chainOnly: true,
      text: 'Sau vài nhiệm vụ trót lọt, “chị Hằng” mời bạn vào nhóm VIP: nạp {money:5000000} làm “nhiệm vụ combo”, hoàn lại {money:6500000}. Trong nhóm ai cũng khoe vừa rút được tiền triệu, tin nhắn chạy liên tục.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'happy', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nạp tiền làm nhiệm vụ combo',
          text: 'Nạp 5 triệu, hệ thống báo bạn “thao tác sai”, phải nạp thêm 15 triệu mới rút được. Bạn vay mượn khắp nơi để nạp tiếp, rồi nhóm VIP biến mất trong một đêm.',
          effects: { money: -20000000, happy: -15, health: -3, flag: 's_crime_bi_lua', followUp: { id: 's_crime_lua_bao_an', delay: 0 } },
          scene: { anim: 'cry', fx: 'tears', shot: 'dramatic' } },
        { label: 'Dừng lại, rời nhóm',
          text: 'Bạn lặng lẽ rời nhóm với 150 nghìn trong túi. Vài tuần sau báo đưa tin cả trăm người mất tiền tỷ vì “nhiệm vụ combo”. Bạn rùng mình.',
          effects: { smarts: 3, happy: 3 },
          scene: { anim: 'think', fx: 'sweat' } },
        { label: 'Gom bằng chứng, báo công an',
          text: 'Bạn chụp màn hình toàn bộ tin nhắn, số tài khoản nhận tiền, rồi lên công an trình báo. Cán bộ khen bạn tỉnh táo và cung cấp được đầu mối quan trọng.',
          effects: { smarts: 3, karma: 5, happy: 2, flag: 's_crime_lua_bao_cao', followUp: { id: 's_crime_lua_triet_pha', delay: 2 } },
          scene: { loc: 'office', anim: 'talk', fx: 'idea' } }
      ]
    },
    {
      id: 's_crime_san_ao', title: 'Phòng đầu tư của “chuyên gia”', icon: '📈', age: [25, 65], weight: 0.9,
      req: { minMoney: 30000000, notFlag: 's_crime_san_ao' },
      text: 'Bạn được kéo vào nhóm chat “Đầu tư vàng và ngoại tệ” do một “chuyên gia” áo vest dẫn dắt. Ngày nào nhóm cũng khoe lãi 20-30%, chuyên gia còn tặng bạn một tài khoản thử có sẵn tiền ảo để “trải nghiệm”.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nạp thử {money:20000000}',
          text: 'Bạn nạp 20 triệu. Một tuần sau, tài khoản trên sàn báo lãi gần gấp đôi. Chuyên gia nhắn: “Em thấy chưa, anh nói có sai bao giờ.”',
          effects: { money: -20000000, happy: 5, flag: 's_crime_san_ao', followUp: { id: 's_crime_san_ao_rut', delay: 0 } },
          scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Tra cứu giấy phép của sàn',
          text: 'Sàn không có giấy phép, tên miền mới lập được hai tháng, máy chủ đặt ở nước ngoài. Bạn rời nhóm và nhắn cảnh báo cho mấy người quen.',
          effects: { smarts: 4, karma: 2, flag: 's_crime_san_ao' },
          scene: { anim: 'type', fx: 'idea' } },
        { label: 'Rời nhóm, đi ngủ',
          text: 'Bạn bấm rời nhóm, úp điện thoại. Lãi 30% mỗi tuần thì ngân hàng đã đóng cửa hết rồi.',
          effects: { smarts: 1, happy: 1, flag: 's_crime_san_ao' },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 's_crime_san_ao_rut', title: 'Không rút được tiền', icon: '🔒', age: [25, 70], chainOnly: true,
      text: 'Bạn bấm rút tiền lãi, màn hình hiện dòng chữ đỏ: “Cần nộp 20% thuế thu nhập và phí xác minh để giải ngân.” Chuyên gia nhắn dồn dập: “Chậm là tài khoản bị đóng băng đó em!”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'scared', fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Nộp phí để rút tiền',
          text: 'Nộp xong phí xác minh, lại có “phí chống rửa tiền”, rồi “phí nâng hạng”. Đến khi bạn hết tiền để nộp, sàn đóng cửa, nhóm chat giải tán.',
          effects: { money: -15000000, happy: -15, health: -3, flag: 's_crime_bi_lua', followUp: { id: 's_crime_lua_bao_an', delay: 0 } },
          scene: { anim: 'cry', fx: 'tears', shot: 'dramatic' } },
        { label: 'Chấp nhận mất, mang bằng chứng đi báo công an',
          text: 'Bạn chấp nhận mất 20 triệu, mang toàn bộ tin nhắn và sao kê lên công an. Mất tiền đau thật, nhưng dừng đúng lúc là thắng.',
          effects: { happy: -6, smarts: 3, karma: 3, flag: ['s_crime_bi_lua', 's_crime_lua_bao_cao'], followUp: { id: 's_crime_lua_triet_pha', delay: 2 } },
          scene: { loc: 'office', anim: 'talk', fx: 'idea' } },
        { label: 'Vay thêm để nạp, quyết gỡ lại',
          text: 'Bạn vay nóng thêm {money:60000000} để nộp “phí”, tin rằng chỉ cần qua được bước này. Không có bước nào cuối cùng cả. Tài khoản trên sàn biến mất cùng toàn bộ số tiền.',
          effects: { money: -60000000, happy: -20, health: -5, flag: 's_crime_bi_lua', followUp: { id: 's_crime_lua_bao_an', delay: 0 } },
          scene: { anim: 'sit', expr: 'sad', time: 'dawn', fx: 'tears', shot: 'dramatic' } }
      ]
    },
    {
      id: 's_crime_lua_bao_an', title: 'Tỉnh mộng', icon: '😶', age: [18, 95], chainOnly: true,
      text: 'Số điện thoại kia giờ đã thuê bao, tài khoản nhận tiền đã khóa, mọi dấu vết biến mất như chưa từng tồn tại. Bạn ngồi thừ trước bảng sao kê ngân hàng, từng con số nhảy múa trước mắt.',
      scene: { loc: 'home', time: 'night', weather: 'rain', anim: 'sit', expr: 'sad', fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Đến công an trình báo, nộp sao kê',
          text: 'Bạn mang sao kê, ảnh chụp tin nhắn lên công an. {police.K} {police} ghi nhận, dặn: “Đường dây này nhiều nạn nhân lắm, cứ yên tâm chờ.”',
          effects: { happy: 2, karma: 2, smarts: 2, flag: 's_crime_lua_bao_cao', followUp: { id: 's_crime_lua_triet_pha', delay: 2 } },
          scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'talk', fx: 'idea' } },
        { label: 'Thuê “dịch vụ lấy lại tiền” trên mạng',
          text: 'Một trang mạng hứa “thu hồi tiền bị lừa trong 48 giờ, phí {money:5000000}”. Bạn chuyển phí. Và thế là bạn bị lừa lần thứ hai.',
          effects: { money: -5000000, happy: -8, smarts: 2 },
          scene: { anim: 'facepalm', fx: 'anger' } },
        { label: 'Giấu nhẹm, không kể với ai',
          text: 'Bạn giấu biệt chuyện, đêm nào cũng trằn trọc đến sáng. Nỗi xấu hổ còn nặng hơn cả số tiền đã mất.',
          effects: { happy: -10, health: -4 },
          scene: { loc: 'bedroom', anim: 'sleep', expr: 'sad', fx: 'zzz' } },
        { label: 'Kể với người nhà, cùng nhau gượng dậy',
          text: 'Bạn kể hết với người nhà. Không ai trách, chỉ có một câu: “Mất tiền thì kiếm lại, miễn người còn là được.” Bạn khóc như đứa trẻ.',
          effects: { happy: 3, karma: 1, rel: { all: 4 } },
          scene: { anim: 'cry', fx: 'hearts' } }
      ]
    },
    {
      id: 's_crime_lua_triet_pha', title: 'Đường dây bị triệt phá', icon: '🚨', age: [18, 99], chainOnly: true,
      req: { flag: 's_crime_lua_bao_cao' },
      text: 'Hai năm sau, bản tin thời sự phát cảnh công an ập vào một khu nhà cho thuê, thu giữ hàng trăm điện thoại và sim rác. Đường dây lừa đảo bạn từng tố giác đã bị triệt phá, {police.K} {police} gọi mời bạn lên làm việc.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'idle', expr: 'happy',
        npcs: [{ role: 'police', anim: 'talk', say: 'Nhờ đơn tố giác của bạn đấy.' }], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Nhận lại một phần tiền bị lừa', req: { flag: 's_crime_bi_lua' },
          text: 'Từ số tiền thu hồi, bạn được hoàn lại {money:8000000}. Không đủ bù hết, nhưng đủ để bạn tin rằng lẽ phải vẫn còn.',
          effects: { money: 8000000, happy: 8 },
          scene: { anim: 'bow', fx: 'money', npcAnim: { police: 'nod' } } },
        { label: 'Lên mạng kể lại để cảnh báo mọi người',
          text: 'Bạn viết một bài dài kể lại toàn bộ chiêu trò. Bài viết được chia sẻ hàng nghìn lần, có người nhắn: “Nhờ bài của bạn mà mẹ mình không chuyển tiền.”',
          effects: { karma: 6, happy: 5, smarts: 2 },
          scene: { anim: 'type', fx: 'hearts', npcAnim: { police: 'clap' } } },
        { label: 'Tình nguyện đi tuyên truyền ở tổ dân phố',
          text: 'Bạn cùng công an phường đi từng tổ dân phố, kể chuyện của chính mình. Mấy bác lớn tuổi nghe xong, về chặn hết số lạ.',
          effects: { karma: 8, happy: 5 },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { police: 'nod' } } }
      ]
    },

    // ======================= ARC 5: TÍN DỤNG ĐEN =======================
    {
      id: 's_crime_vay_nong', title: 'Vay nhanh 5 phút', icon: '💸', age: [18, 55], weight: 1.1,
      req: { maxMoney: 3000000, notFlag: 's_crime_tdd' },
      text: 'Cuối tháng, ví còn đúng {money:80000} mà tiền nhà, tiền điện đang dí sát sau lưng. Điện thoại liên tục nhảy tin nhắn: “Vay 10 triệu chỉ cần ảnh căn cước, giải ngân trong 5 phút, không thẩm định!”',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'sad', fx: 'money', shot: 'close' },
      choices: [
        { label: 'Tải ứng dụng, vay 10 triệu',
          text: 'Tiền về thật, nhưng chỉ có {money:7000000} vì “phí hồ sơ” đã bị trừ trước. Ứng dụng xin quyền đọc danh bạ, bạn bấm “Đồng ý” cho nhanh.',
          effects: { money: 7000000, happy: 3, flag: 's_crime_tdd', followUp: { id: 's_crime_vay_lai', delay: 1 } },
          scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Muối mặt hỏi mượn người thân',
          text: 'Bạn ấp úng mãi mới nói được. Người nhà gửi {money:3000000} kèm một câu: “Chi tiêu dè sẻn thôi con.” Ngượng, nhưng ấm lòng.',
          effects: { money: 3000000, happy: -1, karma: 1 },
          scene: { anim: 'phone', fx: 'sweat' } },
        { label: 'Làm thêm cuối tuần cầm cự',
          text: 'Hai cuối tuần liền bạn chạy giao hàng từ sáng tới tối, kiếm được {money:1500000}. Mệt rã rời, nhưng không nợ ai đồng nào.',
          effects: { money: 1500000, health: -3, smarts: 1, happy: 1 },
          scene: { loc: 'street', time: 'day', anim: 'drive', fx: 'sweat' } }
      ]
    },
    {
      id: 's_crime_vay_lai', title: 'Lãi mẹ đẻ lãi con', icon: '📉', age: [19, 60], chainOnly: true,
      text: 'Khoản vay 10 triệu năm ngoái, sau mấy lần “gia hạn”, đã phình thành {money:60000000}. Tin nhắn chửi bới gửi tới cả danh bạ của bạn, ảnh căn cước bị ghép vào bài “truy tìm con nợ”. Sáng nay, một {thug.k} xăm trổ đứng chờ trước cổng.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thug', anim: 'angry', say: 'Tuần này không trả thì đừng trách!' }, { role: 'neighbor', anim: 'think' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Trình báo công an, nộp tin nhắn đe dọa',
          outcomes: [
            { p: 0.65, text: 'Công an vào cuộc, xác định đây là cho vay nặng lãi trái phép. Bạn chỉ phải trả tiền gốc {money:10000000}, còn {thug.k} bị mời lên làm việc.',
              effects: { money: -10000000, happy: 6, karma: 2, flag: 's_crime_tdd_xong', followUp: { id: 's_crime_vay_lam_lai', delay: 2 } },
              scene: { loc: 'office', anim: 'nod', fx: 'sparkle', npcAnim: { thug: 'sad' } } },
            { p: 0.35, text: 'Công an tiếp nhận đơn, nhưng điều tra cần thời gian. Trong lúc chờ, bọn chúng chuyển sang chiêu khác.',
              effects: { happy: -4, followUp: { id: 's_crime_vay_son', delay: 0 } },
              scene: { anim: 'think', fx: 'sweat', npcAnim: { thug: 'point' } } }
          ] },
        { label: 'Nhờ gia đình gom tiền trả hết',
          text: 'Cả nhà gom góp, có người bán cả chỉ vàng, trả đủ 60 triệu. Không ai trách bạn câu nào, và chính điều đó làm bạn đau nhất.',
          effects: { happy: -6, karma: -1, rel: { all: -5 }, flag: 's_crime_tdd_xong', followUp: { id: 's_crime_vay_lam_lai', delay: 2 } },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { thug: 'shrug' } } },
        { label: 'Vay ứng dụng khác đắp vào',
          text: 'Bạn vay chỗ B trả chỗ A, vay chỗ C trả chỗ B. Ba tháng sau, bạn nợ chồng nợ ở sáu ứng dụng, điện thoại không lúc nào ngừng rung.',
          effects: { money: -40000000, happy: -12, health: -5, followUp: { id: 's_crime_vay_son', delay: 0 } },
          scene: { anim: 'phone', expr: 'scared', fx: 'sweat', npcAnim: { thug: 'laugh' } } },
        { label: 'Bỏ trốn khỏi thành phố',
          text: 'Đêm đó bạn gói ghém vài bộ quần áo, bắt chuyến xe khách cuối cùng rời thành phố, tắt luôn điện thoại.',
          effects: { happy: -10, karma: -3, followUp: { id: 's_crime_vay_tron', delay: 1 } },
          scene: { time: 'night', anim: 'run', fx: 'dust' } }
      ]
    },
    {
      id: 's_crime_vay_son', title: 'Sơn đỏ trước cửa', icon: '🎨', age: [19, 60], chainOnly: true,
      text: 'Nửa đêm, “choang” một tiếng. Sáng ra, cửa nhà bạn loang lổ sơn đỏ kèm dòng chữ “TRẢ NỢ ĐI”. Hàng xóm tụ lại xì xào, còn {thug.k} hôm trước thì đứng khoanh tay bên kia đường, cười nhếch mép.',
      scene: { loc: 'street', time: 'dawn', weather: 'cloudy', anim: 'sad', expr: 'angry',
        npcs: [{ role: 'thug', anim: 'idle', expr: 'angry', say: 'Lần sau không phải sơn đâu nhé.' }, { role: 'neighbor', anim: 'shake' }, { role: 'crowd', anim: 'phone' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Lần này báo công an tới cùng',
          text: 'Bạn nộp đơn kèm camera nhà hàng xóm. Công an bắt giữ nhóm ném sơn, ứng dụng cho vay bị xử lý. Bạn chỉ phải trả tiền gốc.',
          effects: { money: -10000000, happy: 5, karma: 3, flag: 's_crime_tdd_xong', followUp: { id: 's_crime_vay_lam_lai', delay: 2 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { thug: 'sad', neighbor: 'clap' } } },
        { label: 'Bán hết đồ giá trị, trả đứt cho xong',
          text: 'Bạn bán xe, bán cả những món đồ quý, gom đủ trả nợ. Căn phòng trống trơn, nhưng đêm đó lần đầu tiên sau nhiều tháng, bạn ngủ được.',
          effects: { money: -15000000, happy: -5, asset: { lose: 'motorbike' }, flag: 's_crime_tdd_xong', followUp: { id: 's_crime_vay_lam_lai', delay: 2 } },
          scene: { anim: 'sad', fx: 'money', npcAnim: { thug: 'shrug' } } },
        { label: 'Xông ra đối mặt gã đòi nợ',
          outcomes: [
            { p: 0.35, text: 'Bạn bước ra giữa đường, nói to cho cả xóm nghe. Hàng xóm kéo ra đông nghịt, có người gọi công an. {thug.K} chửi đổng vài câu rồi bỏ đi, không quay lại nữa.',
              effects: { happy: 4, health: -2, karma: 2, flag: 's_crime_tdd_xong' },
              scene: { anim: 'point', expr: 'angry', fx: 'exclaim', npcAnim: { thug: 'walk', neighbor: 'cheer' } } },
            { p: 0.6, text: 'Lời qua tiếng lại, {thug.k} cùng đồng bọn lao vào đánh bạn. Bạn nằm viện hai tuần với ba chiếc xương sườn rạn. Công an bắt cả nhóm, nhưng cái giá quá đắt.',
              effects: { health: -20, happy: -10, money: -5000000, illness: 'Rạn xương sườn', flag: 's_crime_tdd_xong' },
              scene: { loc: 'hospital', anim: 'sick', fx: 'stars' } },
            { p: 0.05, text: '{thug.K} rút dao trong lúc xô xát. Hàng xóm gọi cấp cứu, nhưng bạn đã không qua khỏi.',
              effects: { die: 'Bị nhóm đòi nợ hành hung' },
              scene: { anim: 'fall', fx: 'tears', shot: 'wide' } }
          ] }
      ]
    },
    {
      id: 's_crime_vay_tron', title: 'Trốn nợ', icon: '🏃', age: [19, 60], chainOnly: true,
      text: 'Một năm trốn chui trốn lủi ở thành phố khác, đổi số điện thoại ba lần, làm thuê không dám ký hợp đồng. Vậy mà tin nhắn đòi nợ vẫn tìm về tận nhà người thân. Đêm nào bạn cũng giật mình vì tiếng gõ cửa.',
      scene: { loc: 'bedroom', time: 'night', weather: 'rain', anim: 'sit', expr: 'scared', fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Quay về đối mặt, ra công an trình báo',
          text: 'Bạn quay về, nộp hết bằng chứng. Công an xác định đây là tín dụng đen, bạn chỉ phải trả gốc và được bảo vệ. Lần đầu sau một năm, bạn dám nhìn thẳng vào mắt người thân.',
          effects: { money: -10000000, happy: 8, karma: 3, flag: 's_crime_tdd_xong', followUp: { id: 's_crime_vay_lam_lai', delay: 2 } },
          scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'talk', fx: 'sparkle' } },
        { label: 'Tiếp tục trốn',
          text: 'Tháng ngày trôi qua trong sợ hãi. Bạn mất việc, mất bạn bè, mất cả những cái Tết sum vầy. Món nợ không mất đi, chỉ có bạn là mất dần.',
          effects: { happy: -12, health: -6, karma: -3, job: 'fire', flag: 's_crime_tdd_tron' },
          scene: { anim: 'cry', fx: 'tears' } }
      ]
    },
    {
      id: 's_crime_vay_lam_lai', title: 'Sạch nợ', icon: '🌤️', age: [20, 65], chainOnly: true,
      text: 'Hai năm sau vụ tín dụng đen, bạn đã trả sạch mọi khoản nợ. Tờ giấy ghi chi tiêu dán trên tủ lạnh, quỹ khẩn cấp đã có những đồng đầu tiên. Bỗng một người quen nhắn tin hỏi bạn có biết ứng dụng vay nhanh nào không.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'phone', expr: 'happy', fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Kể hết chuyện cũ để can ngăn',
          text: 'Bạn gọi điện kể hết, cả những đêm mất ngủ lẫn vệt sơn đỏ trước cửa. Người kia im lặng rất lâu, rồi bảo: “Cảm ơn, mình sẽ tìm cách khác.”',
          effects: { karma: 6, happy: 4 },
          scene: { anim: 'talk', fx: 'hearts' } },
        { label: 'Lập quỹ tiết kiệm khẩn cấp',
          text: 'Mỗi tháng bạn trích một khoản cố định vào quỹ “không được đụng”. Cuối năm, quỹ có {money:5000000}, và bạn ngủ ngon hơn bao giờ hết.',
          effects: { money: 5000000, smarts: 3, happy: 3 },
          scene: { anim: 'type', fx: 'money' } },
        { label: 'Gửi tên ứng dụng cho người ta',
          text: 'Bạn gửi tên ứng dụng rồi chột dạ cả tuần. Hai tháng sau nghe tin người ấy bị đòi nợ khủng bố, bạn chỉ biết lặng im.',
          effects: { karma: -8, happy: -4 },
          scene: { anim: 'facepalm', fx: 'sweat' } }
      ]
    },

    // ======================= ARC 6: THẤY CHUYỆN BẤT BÌNH =======================
    {
      id: 's_crime_bat_binh', title: 'Tiếng kêu giữa phố', icon: '👜', age: [16, 65], weight: 1.1,
      req: { notFlag: 's_crime_bat_binh' },
      text: 'Chiều tối trên phố đông, một bà cụ bán vé số bị {thief.k} giật phăng túi tiền rồi cắm đầu chạy về phía chợ. Bà ngồi bệt xuống vỉa hè, run run khóc. Người đi đường dừng lại, nhưng chưa ai nhúc nhích.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 72, anim: 'cry', say: 'Trời ơi, tiền vốn cả tuần của tôi!' }, { role: 'thief', anim: 'run' }, { role: 'crowd', anim: 'phone' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đuổi theo tên cướp',
          success: { stat: 'health', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đuổi qua hai dãy hàng, túm được vạt áo {thief.k}. Người dân xúm vào giữ lại, túi tiền được trả về tay bà cụ, còn nguyên từng tờ.',
              effects: { karma: 10, happy: 8, health: -2, flag: 's_crime_bat_binh', followUp: { id: 's_crime_bat_binh_khai', delay: 0 } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { thief: 'sad', stranger: 'bow', crowd: 'clap' } } },
            { text: 'Bạn vấp ngã trầy đầu gối, hắn lẩn vào chợ mất hút. Bạn khập khiễng quay lại, dúi vào tay bà cụ {money:300000}.',
              effects: { karma: 6, health: -4, money: -300000, flag: 's_crime_bat_binh' },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { stranger: 'bow' } } }
          ] },
        { label: 'Đỡ bà dậy, gọi 113, xin camera',
          text: 'Bạn đỡ bà ngồi lên ghế nhựa, gọi 113, rồi chạy sang tiệm vàng đầu phố xin trích camera. Nhờ đoạn clip rõ mặt, ba ngày sau kẻ cướp bị bắt.',
          effects: { karma: 8, smarts: 2, happy: 4, flag: 's_crime_bat_binh', followUp: { id: 's_crime_bat_binh_khai', delay: 0 } },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { stranger: 'sit' } } },
        { label: 'Quay clip đăng lên mạng',
          text: 'Clip của bạn đạt cả triệu lượt xem. Nhưng bình luận nhiều nhất lại là: “Người quay sao không giúp bà?” Bạn đọc mà nóng cả mặt.',
          effects: { karma: -3, happy: -1, flag: 's_crime_bat_binh' },
          scene: { anim: 'phone', fx: 'flash', npcAnim: { stranger: 'cry' } } },
        { label: 'Lặng lẽ đi tiếp',
          text: 'Bạn đi tiếp, tự nhủ “chuyện người ta”. Tối đó, tiếng khóc của bà cụ cứ văng vẳng mãi trong đầu.',
          effects: { karma: -6, happy: -2, flag: 's_crime_bat_binh' },
          scene: { anim: 'walk', fx: 'question', npcAnim: { stranger: 'cry' } } }
      ]
    },
    {
      id: 's_crime_bat_binh_khai', title: 'Phong bì của người lạ', icon: '✉️', age: [16, 70], chainOnly: true,
      text: 'Bạn được mời lên phường làm chứng vụ cướp giật. Vừa ra khỏi cổng, một gã lạ mặt chặn xe bạn, nói nhỏ: “Thằng em tôi còn trẻ. Rút lời khai đi, có chút quà cảm ơn.” Rồi hắn dúi vào tay bạn một phong bì dày cộp.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'thug', anim: 'talk', say: 'Rút lời khai đi, có chút quà nè.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Trả phong bì, quay vào báo công an',
          text: 'Bạn dúi trả phong bì rồi quay ngay vào phường. Gã kia bị mời làm việc vì hành vi mua chuộc nhân chứng. Cán bộ bắt tay bạn thật chặt.',
          effects: { karma: 8, happy: 3, flag: 's_crime_nhan_chung', followUp: { id: 's_crime_bat_binh_khen', delay: 1 } },
          scene: { anim: 'shake', expr: 'angry', fx: 'exclaim', npcAnim: { thug: 'angry' } } },
        { label: 'Nhận phong bì, rút lời khai',
          text: 'Phong bì có {money:5000000}. Bạn rút lời khai, viện cớ “nhìn không rõ”. Tiền tiêu hết rồi, cảm giác bẩn thỉu thì vẫn còn.',
          effects: { money: 5000000, karma: -12, happy: -4 },
          scene: { anim: 'sad', fx: 'money', npcAnim: { thug: 'laugh' } } },
        { label: 'Trả phong bì nhưng xin rút lời khai vì sợ',
          text: 'Bạn trả lại phong bì nhưng cũng rút lời khai cho yên thân. Vụ án vẫn đi tiếp nhờ camera, còn bạn thì day dứt mãi.',
          effects: { karma: -2, happy: -3 },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { thug: 'nod' } } }
      ]
    },
    {
      id: 's_crime_bat_binh_khen', title: 'Tấm giấy khen', icon: '🏅', age: [16, 75], chainOnly: true,
      text: 'Năm sau, công an quận tổ chức buổi tuyên dương “Người tốt, việc tốt”. Tên bạn được xướng lên giữa hội trường. Bà cụ bán vé số năm nào ngồi ở hàng ghế đầu, mắt đỏ hoe, tay vẫn nắm chặt xấp vé số.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'bow', expr: 'happy',
        npcs: [{ role: 'stranger', anim: 'clap', say: 'Ơn con bà nhớ suốt đời!' }, { role: 'police', anim: 'clap' }, { role: 'crowd', anim: 'clap' }], fx: 'confetti', shot: 'wide' },
      choices: [
        { label: 'Lên nhận khen, cúi chào thật sâu',
          text: 'Bạn nhận tấm giấy khen, cúi chào cả hội trường. Bức ảnh ấy về sau được đóng khung, treo trang trọng giữa nhà.',
          effects: { happy: 10, karma: 4 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { all: 'clap' } } },
        { label: 'Nhường lời cảm ơn cho những người cùng giúp',
          text: 'Bạn cầm micro: “Hôm đó có cả chục người cùng giữ tên cướp, tôi chỉ chạy nhanh hơn một chút.” Cả hội trường vỗ tay rần rần.',
          effects: { karma: 8, happy: 6 },
          scene: { anim: 'talk', fx: 'confetti', npcAnim: { all: 'clap' } } },
        { label: 'Xuống ôm bà cụ',
          text: 'Bạn bước xuống ôm bà cụ. Bà dúi vào tay bạn tờ vé số đẹp nhất: “Bà để dành cho con đó.” Tờ vé không trúng, nhưng bạn giữ nó mãi.',
          effects: { happy: 8, karma: 5 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'cry', crowd: 'clap' } } }
      ]
    },

    // ======================= STANDALONE =======================
    {
      id: 's_crime_va_cham', title: 'Va quẹt giờ tan tầm', icon: '💥', age: [18, 75], weight: 0.9, once: false, cooldown: 4,
      req: { asset: 'motorbike' },
      text: 'Giờ tan tầm, một chiếc xe phía sau đâm nhẹ vào đuôi xe bạn. Chưa kịp quay lại, gã cầm lái đã nhảy xuống quát ầm, đòi bạn đền tiền cái đèn xe của hắn. Đám đông bắt đầu bu quanh.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'thug', anim: 'angry', say: 'Phanh gấp thế à? Đền 3 triệu cái đèn!' }, { role: 'crowd', anim: 'phone' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Bình tĩnh gọi công an giải quyết',
          outcomes: [
            { p: 0.7, text: 'Nghe tới chữ “công an”, gã kia chửi đổng vài câu rồi rồ ga đi mất. Rõ là chiêu ăn vạ quen tay.',
              effects: { happy: 4, smarts: 2 },
              scene: { anim: 'phone', fx: 'idea', npcAnim: { thug: 'walk' } } },
            { p: 0.3, text: 'Chờ gần một tiếng, cảnh sát giao thông tới đo đạc, kết luận xe sau đâm xe trước. Gã kia tiu nghỉu, còn bạn thì đói meo.',
              effects: { happy: 1, health: -1, karma: 1 },
              scene: { anim: 'nod', fx: 'sweat', npcAnim: { thug: 'facepalm' } } }
          ] },
        { label: 'Đưa tiền cho xong chuyện',
          text: 'Bạn mặc cả còn {money:1500000}, đưa cho xong. Về nhà bạn mới thấy đèn xe hắn vốn nứt từ trước.',
          effects: { money: -1500000, happy: -5 },
          scene: { anim: 'sad', fx: 'money', npcAnim: { thug: 'laugh' } } },
        { label: 'Cãi tay đôi cho ra lẽ',
          outcomes: [
            { p: 0.5, text: 'Một chiếc ô tô phía sau có camera hành trình, tài xế bước xuống làm chứng giúp bạn. Gã kia cứng họng, lủi mất.',
              effects: { happy: 5, karma: 1 },
              scene: { anim: 'point', expr: 'angry', fx: 'exclaim', npcAnim: { thug: 'shrug', crowd: 'clap' } } },
            { p: 0.5, text: 'Cãi qua cãi lại thành xô xát, cả hai bị mời về phường. Bạn trầy tay, mất nguyên buổi tối.',
              effects: { happy: -6, health: -5 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { thug: 'angry' } } }
          ] },
        { label: 'Bật camera điện thoại quay lại',
          text: 'Bạn giơ điện thoại lên quay, đọc to biển số xe hắn. Gã kia đổi giọng ngay: “Thôi, hai bên đều có lỗi, bỏ qua đi.”',
          effects: { smarts: 3, happy: 3 },
          scene: { anim: 'phone', fx: 'flash', npcAnim: { thug: 'shrug' } } }
      ]
    },
    {
      id: 's_crime_gia_dien_luc', title: 'Nhân viên kiểm tra điện', icon: '🔌', age: [55, 95], weight: 1.1,
      text: 'Hai thanh niên mặc áo đồng phục gõ cửa, nói là nhân viên điện lực đi kiểm tra đồng hồ, cần vào nhà “đo rò điện”. Một đứa cứ đòi vào tận phòng trong, đứa kia thì liến thoắng hỏi nhà có mấy người, con cháu đi làm hết chưa.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'thief', anim: 'talk', say: 'Bác cho cháu vào kiểm tra tí ạ!' }, { role: 'thief', anim: 'point' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Xin xem thẻ, gọi tổng đài xác minh',
          outcomes: [
            { p: 0.85, text: 'Vừa nghe bạn bấm số tổng đài, hai đứa lúng túng nói “để cháu ra xe lấy thẻ” rồi chuồn thẳng. Hàng xóm khen bạn tỉnh như sáo.',
              effects: { smarts: 3, happy: 4, karma: 1 },
              scene: { anim: 'phone', fx: 'idea', npcAnim: { thief: 'run' } } },
            { p: 0.15, text: 'Hóa ra là nhân viên thật. Bạn hơi ngượng, nhưng cậu nhân viên lại cảm ơn: “Bác cẩn thận thế là đúng ạ.”',
              effects: { happy: 2, smarts: 1 },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { thief: 'bow' } } }
          ] },
        { label: 'Mở cửa cho vào, rót nước mời',
          outcomes: [
            { p: 0.7, text: 'Một đứa giữ chân bạn ngoài phòng khách, đứa kia lục tủ trong buồng. Họ đi rồi bạn mới thấy mất {money:12000000} tiền tiết kiệm và mấy chỉ vàng.',
              effects: { money: -12000000, happy: -12, asset: { lose: 'gold' } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { thief: 'run' } } },
            { p: 0.3, text: 'Họ kiểm tra đồng hồ điện thật, ghi chép rồi chào ra về. Lần này may, nhưng con cháu nghe kể thì dặn đi dặn lại.',
              effects: { happy: 1 },
              scene: { anim: 'nod', fx: 'sweat', npcAnim: { thief: 'wave' } } }
          ] },
        { label: 'Gọi hàng xóm sang ngồi cùng',
          text: 'Bạn gọi với sang nhà bên. Thấy hàng xóm kéo sang đông, hai đứa vội bảo “mai cháu quay lại”, và không bao giờ quay lại nữa.',
          effects: { happy: 3, karma: 1, smarts: 1 },
          scene: { anim: 'wave', fx: 'exclaim', npcAnim: { thief: 'walk' } } }
      ]
    },
    {
      id: 's_crime_tran_lot', title: 'Mấy anh ở đầu hẻm', icon: '😠', age: [12, 16], weight: 1.0,
      text: 'Tan học, hai anh lớp lớn trường bên chặn bạn ở đầu hẻm, tay đút túi quần: “Có tiền không? Cho anh mượn tí.” Trong cặp bạn còn {money:50000} tiền ăn sáng cả tuần.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 17, anim: 'angry', say: 'Có tiền không? Cho anh mượn tí.' }, { role: 'stranger', gender: 'm', age: 16, anim: 'point' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Đưa tiền cho yên chuyện',
          text: 'Bạn đưa tờ 50 nghìn. Chúng cười khẩy bỏ đi. Hôm sau, hôm sau nữa, chúng vẫn đứng đó.',
          effects: { money: -50000, happy: -6 },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { stranger: 'laugh' } } },
        { label: 'Kể với cô chủ nhiệm và người lớn',
          text: 'Bạn kể với cô chủ nhiệm. Nhà trường phối hợp với công an phường, hai anh kia bị mời lên làm việc, phụ huynh phải viết cam kết. Đầu hẻm yên bình trở lại.',
          effects: { karma: 3, happy: 5, smarts: 1 },
          scene: { loc: 'school', time: 'day', anim: 'talk', fx: 'idea' } },
        { label: 'Co giò chạy về chỗ đông người',
          success: { stat: 'health', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chạy một mạch tới quán nước đầu đường, nơi mấy chú xe ôm đang ngồi. Hai đứa kia chưng hửng đứng nhìn.',
              effects: { happy: 3, health: 1 },
              scene: { anim: 'run', fx: 'dust', npcAnim: { stranger: 'shrug' } } },
            { text: 'Bạn vấp cục đá ngã sấp, rách cả quần. Tiền vẫn mất, đầu gối thì rớm máu.',
              effects: { money: -50000, health: -3, happy: -5 },
              scene: { anim: 'fall', fx: 'stars', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Lớn giọng cự lại',
          outcomes: [
            { p: 0.5, text: 'Bạn nói thật to, mấy cô bán hàng gần đó quay ra nhìn. Hai đứa kia chột dạ, bỏ đi.',
              effects: { happy: 4, karma: 1 },
              scene: { anim: 'point', expr: 'angry', fx: 'exclaim', npcAnim: { stranger: 'walk' } } },
            { p: 0.5, text: 'Chúng đẩy bạn ngã dúi vào tường, giật luôn tiền rồi bỏ đi. Bạn về nhà, trầy tay, mắt đỏ hoe.',
              effects: { money: -50000, health: -3, happy: -6 },
              scene: { anim: 'fall', fx: 'tears', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    }
  );
})();
