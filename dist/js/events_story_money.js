/* Một Kiếp Người — ngoại truyện: tiền bạc, khởi nghiệp & phá sản (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: TIỆM TRÀ SỮA — KHAI TRƯƠNG, BÙNG NỔ, PHÁ SẢN =======================
    {
      id: 's_money_shop_dream', title: 'Mặt bằng góc ngã tư', icon: '🧋', age: [22, 55], weight: 1.2,
      req: { minMoney: 300000000, notFlag: ['s_money_shop', 's_money_shop_no'] },
      text: 'Mặt bằng góc ngã tư gần trường đại học treo biển cho thuê. Bạn đứng nhìn dòng sinh viên tấp nập và thấy ngay trong đầu một tiệm trà sữa đông nghịt. Tính sơ: cọc sáu tháng, sửa sang, máy móc, nguyên liệu — hết {money:350000000}.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'neighbor', gender: 'f', age: 56, anim: 'talk', say: 'Góc đẹp nhất phố đó con, cọc sáu tháng nha!' }, { role: 'crowd', anim: 'walk' }], fx: 'idea', shot: 'wide' },
      choices: [
        { label: 'Mở tiệm trà sữa, chơi lớn',
          text: 'Bạn ký hợp đồng, dốc gần hết tiền để dành. Ba tháng chạy thợ, chọn ly, thử công thức trân châu đến mức nằm mơ cũng thấy đường đen.',
          effects: { money: -350000000, happy: 6, flag: 's_money_shop', followUp: { id: 's_money_shop_open', delay: 0 } },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { neighbor: 'clap' } } },
        { label: 'Mở tiệm bánh nhỏ, vốn vừa phải',
          text: 'Bạn thuê nửa mặt bằng, mua lại chiếc lò nướng cũ, tự tay nhào bột mỗi sáng. Vốn bỏ ra {money:180000000}, vẫn đủ để mất ngủ.',
          effects: { money: -180000000, happy: 4, flag: 's_money_shop', followUp: { id: 's_money_shop_open', delay: 0 } },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { neighbor: 'nod' } } },
        { label: 'Thôi, gửi tiết kiệm cho lành',
          text: 'Bạn quay xe về ngân hàng. Ba tháng sau, mặt bằng đó thành tiệm trà sữa thứ năm trên cùng một con phố. Bạn không biết mình vừa tránh được gì, hay bỏ lỡ gì.',
          effects: { smarts: 2, happy: -1, flag: 's_money_shop_no' },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { neighbor: 'shrug' } } }
      ]
    },
    {
      id: 's_money_shop_open', title: 'Ngày khai trương', icon: '🎊', age: [22, 60], chainOnly: true,
      text: 'Ngày khai trương, lẵng hoa xếp kín vỉa hè, loa phát nhạc xập xình, bảng “Mua 1 tặng 1” dán to đùng. Hàng xóm ghé ủng hộ, bạn bè check-in rần rần. Nhưng ai làm ăn cũng biết: tuần đầu đông chưa nói lên điều gì.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'cheer', expr: 'happy',
        npcs: [{ role: 'neighbor', anim: 'clap', say: 'Khai trương hồng phát nha con!' }, { role: 'crowd', anim: 'clap' }], fx: 'confetti', shot: 'wide' },
      choices: [
        { label: 'Thuê KOL TikTok về quay review',
          outcomes: [
            { p: 0.55, text: 'Clip “Tiệm nhỏ mà có võ” lên xu hướng với hai triệu lượt xem. Khách xếp hàng ra tận lòng đường, bạn đứng quầy đến rã cả tay.',
              effects: { money: -30000000, happy: 8, flag: 's_money_shop_hot', followUp: { id: 's_money_shop_boom', delay: 1 } },
              scene: { anim: 'dance', fx: 'stars', npcAnim: { crowd: 'cheer', neighbor: 'clap' } } },
            { p: 0.45, text: 'KOL nhấp một ngụm rồi nhăn mặt: “Ngọt như nước đường pha màu.” Clip chê nổi hơn mọi clip khen, tiệm vắng dần.',
              effects: { money: -30000000, happy: -8, flag: 's_money_shop_cold', followUp: { id: 's_money_shop_slump', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'shrug', neighbor: 'shake' } } }
          ] },
        { label: 'Chậm mà chắc, chăm từng món',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn nhớ tên khách quen, nhớ cả ai ít đá ai nhiều trân châu. Khách cũ dẫn khách mới, tiệm đông đều như nước chảy.',
              effects: { happy: 6, karma: 2, flag: 's_money_shop_hot', followUp: { id: 's_money_shop_boom', delay: 2 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { crowd: 'drink' } } },
            { text: 'Bạn làm chậm thật, chậm đến mức khách đợi hai mươi phút rồi bỏ sang tiệm đối diện. Doanh thu không đủ trả tiền mặt bằng.',
              effects: { happy: -5, flag: 's_money_shop_cold', followUp: { id: 's_money_shop_slump', delay: 1 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { crowd: 'walk' } } }
          ] },
        { label: 'Giảm giá sập sàn 50% cả tháng',
          outcomes: [
            { p: 0.5, text: 'Tháng đầu đông nghẹt, lỗ {money:45000000} vì giảm giá nhưng cả khu ai cũng biết tên tiệm. Hết khuyến mãi, khách vẫn ở lại.',
              effects: { money: -45000000, happy: 5, flag: 's_money_shop_hot', followUp: { id: 's_money_shop_boom', delay: 1 } },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { crowd: 'cheer' } } },
            { p: 0.5, text: 'Khách chỉ đến đúng những ngày giảm giá. Hết khuyến mãi, tiệm vắng tanh, còn khoản lỗ {money:45000000} thì không lấy lại được.',
              effects: { money: -45000000, happy: -6, flag: 's_money_shop_cold', followUp: { id: 's_money_shop_slump', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'dust', npcAnim: { crowd: 'walk' } } }
          ] }
      ]
    },
    {
      id: 's_money_shop_boom', title: 'Tiệm đông nghịt', icon: '📈', age: [22, 65], chainOnly: true,
      text: 'Tiệm của bạn giờ đông từ sáng đến khuya, mỗi tháng lãi ròng cả trăm triệu. Một chị bên ngân hàng tìm đến tận quầy: “Bên chị cho vay {money:1000000000} lãi ưu đãi năm đầu, em mở thêm ba chi nhánh là thành chuỗi!” Cùng tuần đó, một nhà đầu tư nhắn hỏi mua lại thương hiệu.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'f', age: 34, anim: 'talk', say: 'Vay một tỷ, mở ba chi nhánh là thành chuỗi!' }, { role: 'crowd', anim: 'drink' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Vay 1 tỷ, mở thêm ba chi nhánh',
          outcomes: [
            { p: 0.35, text: 'Ba chi nhánh mới đều có lãi. Ba năm sau bạn trả sạch nợ ngân hàng, có văn phòng riêng và bốn mươi nhân viên gọi mình là “sếp”.',
              effects: { money: 900000000, happy: 12, achievement: 'startup', flag: 's_money_shop_chain' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { stranger: 'clap', crowd: 'cheer' } } },
            { p: 0.65, text: 'Bạn bỏ thêm {money:250000000} vốn tự có, ký giấy vay, cắt băng ba chi nhánh liền trong một tháng. Tối nào cũng ngồi tính lãi, vừa phấn khích vừa run.',
              effects: { money: -250000000, happy: 6, flag: 's_money_shop_loan', followUp: { id: 's_money_shop_slump', delay: 2 } },
              scene: { anim: 'type', fx: 'sweat', npcAnim: { stranger: 'nod' } } }
          ] },
        { label: 'Bán lại thương hiệu lúc đang đỉnh',
          text: 'Nhà đầu tư trả {money:900000000} cho thương hiệu, công thức và hợp đồng mặt bằng. Ký xong, bạn đứng nhìn tấm biển hiệu thật lâu, rồi đi ăn một đĩa cơm tấm thật ngon.',
          effects: { money: 900000000, happy: 9, smarts: 3, flag: 's_money_shop_sold' },
          scene: { anim: 'bow', fx: 'money', npcAnim: { stranger: 'shrug' } } },
        { label: 'Giữ một tiệm thôi, sống khỏe',
          text: 'Bạn từ chối khéo cả hai. Một tiệm là đủ: đủ lãi, đủ ngủ, đủ thời gian ăn cơm với người nhà. Có những thành công không cần phải to.',
          effects: { money: 250000000, happy: 7, health: 3, flag: 's_money_shop_steady' },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 's_money_shop_slump', title: 'Bão giữa mùa', icon: '🌧️', age: [22, 65], chainOnly: true,
      text: 'Tiệm đang chật vật: dịch bệnh làm phố vắng hoe, đối diện mọc lên một chuỗi lớn giảm giá 50%, chủ nhà còn nhắn Zalo đòi tăng 30% tiền thuê. Mỗi tháng lỗ vài chục triệu, nhân viên đứng nhìn bạn chờ lương.',
      scene: { loc: 'street', time: 'dusk', weather: 'rain', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'coworker', anim: 'idle', expr: 'sad', say: 'Sếp ơi, tháng này có lương không ạ?' }, { role: 'neighbor', anim: 'phone', say: 'Tháng sau tăng 30% nha con!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Cắn răng bơm thêm tiền, chờ qua bão',
          outcomes: [
            { p: 0.35, text: 'Bạn bơm thêm {money:300000000}, gồng qua sáu tháng tối tăm. Bão qua, khách quay lại, tiệm sống sót — gầy đi một nửa, giống hệt chủ của nó.',
              effects: { money: -300000000, happy: 5, health: -4, smarts: 2 },
              scene: { anim: 'cheer', weather: 'clear', fx: 'sparkle', npcAnim: { coworker: 'cheer' } } },
            { p: 0.65, text: 'Bạn bơm thêm {money:300000000} như đổ nước vào cát. Tháng thứ tư, ngân hàng gửi giấy báo nợ quá hạn.',
              effects: { money: -300000000, happy: -10, health: -4, followUp: { id: 's_money_shop_bankrupt', delay: 1 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Sang nhượng ngay, chịu lỗ',
          text: 'Bạn sang lại tiệm với giá bèo, bồi thường hợp đồng mặt bằng, mất trắng {money:150000000}. Đau, nhưng là cái đau có điểm dừng.',
          effects: { money: -150000000, happy: -7, smarts: 4, flag: 's_money_shop_closed' },
          scene: { anim: 'sad', fx: 'dust', npcAnim: { coworker: 'wave', neighbor: 'shrug' } } },
        { label: 'Chuyển hẳn sang bán online qua app',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn trả mặt bằng, dọn về bếp nhỏ, bán qua app giao đồ ăn với combo “trà sữa + bánh tráng trộn”. Đơn nổ đều, lại có lãi.',
              effects: { money: 60000000, happy: 6, smarts: 3, flag: 's_money_shop_online' },
              scene: { loc: 'home', anim: 'phone', fx: 'money', npcAnim: { coworker: 'cheer' } } },
            { text: 'Phí sàn, phí giao hàng, mã giảm giá... càng bán nhiều càng lỗ. Đơn hàng cuối cùng của tháng là một đơn bị bom.',
              effects: { money: -80000000, happy: -8, followUp: { id: 's_money_shop_bankrupt', delay: 1 } },
              scene: { loc: 'home', anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Vay nóng bên ngoài để trụ',
          outcomes: [
            { p: 0.2, text: 'May mắn mỉm cười: chuỗi lớn đối diện rút khỏi khu này, khách dồn về tiệm bạn. Sáu tháng sau bạn trả xong khoản vay nóng, thề không bao giờ dính lại.',
              effects: { money: -60000000, happy: 4, karma: -1 },
              scene: { anim: 'cheer', weather: 'clear', fx: 'sparkle' } },
            { p: 0.8, text: 'Lãi vay nóng nuốt sạch mọi đồng doanh thu. Nợ chồng nợ, bạn biết ngày đóng cửa đã gần lắm rồi.',
              effects: { money: -200000000, happy: -10, health: -3, followUp: { id: 's_money_shop_bankrupt', delay: 0 } },
              scene: { anim: 'scared', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_money_shop_bankrupt', title: 'Ngày gỡ biển hiệu', icon: '📉', age: [22, 70], chainOnly: true,
      text: 'Giấy báo của ngân hàng: khoản vay quá hạn, tài sản thế chấp sẽ bị phát mại. Chiều đó, thợ tháo xuống tấm biển hiệu bạn từng tự tay chọn màu. Hàng xóm đứng xem, không ai nói câu nào.',
      scene: { loc: 'street', time: 'dusk', weather: 'cloudy', anim: 'cry', expr: 'sad',
        npcs: [{ role: 'stranger', anim: 'talk', say: 'Hồ sơ thế chấp đến hạn phát mại rồi ạ.' }, { role: 'neighbor', anim: 'shake' }], fx: 'tears', shot: 'dramatic' },
      choices: [
        { label: 'Ký giấy bàn giao toàn bộ tài sản',
          text: 'Bạn ký. Xe, nhà, sổ tiết kiệm, cả chiếc đồng hồ kỷ niệm cũng lần lượt ra đi. Bạn vẫn còn nợ {money:400000000}, cùng bài học đắt nhất đời.',
          effects: { moneyPct: -0.7, money: -400000000, asset: { lose: 'all' }, happy: -15, health: -5, smarts: 4, flag: 's_money_broke', followUp: { id: 's_money_shop_comeback', delay: 2 } },
          scene: { anim: 'sad', fx: 'dust', shot: 'wide', npcAnim: { stranger: 'bow', neighbor: 'sad' } } },
        { label: 'Bán xe, bán nhà, giữ lấy chữ tín',
          text: 'Bạn chủ động bán xe, bán nhà trả nợ trước hạn, xin ngân hàng xóa phần lãi phạt. Cả nhà dọn về căn phòng trọ hai mươi mét vuông, nhưng không ai phải cúi mặt.',
          effects: { moneyPct: -0.5, money: -250000000, asset: { lose: ['car', 'house'] }, happy: -12, karma: 8, flag: 's_money_broke', followUp: { id: 's_money_shop_comeback', delay: 2 } },
          scene: { anim: 'bow', fx: 'dust', npcAnim: { stranger: 'nod', neighbor: 'nod' } } },
        { label: 'Gọi về quê cầu cứu mẹ', req: { has: ['mother'] },
          text: 'Mẹ lặng im rất lâu, rồi bán mảnh vườn sau nhà gửi lên. Bạn trả được một phần nợ, phần còn lại vẫn phải bán xe. Đêm đó bạn khóc như một đứa trẻ.',
          effects: { moneyPct: -0.4, money: -150000000, asset: { lose: ['car', 'motorbike'] }, happy: -10, rel: { mother: 6 }, flag: 's_money_broke', followUp: { id: 's_money_shop_comeback', delay: 2 } },
          scene: { anim: 'phone', expr: 'sad', fx: 'tears' } }
      ]
    },
    {
      id: 's_money_shop_comeback', title: 'Làm lại từ con số âm', icon: '🌱', age: [22, 75], chainOnly: true,
      text: 'Hai năm sau ngày phá sản. Bạn đi làm thuê, trả nợ từng tháng, tối về đếm từng đồng. Một tối mưa ở trạm xe buýt, cô bán xôi đầu hẻm — khách quen ngày xưa — nhận ra bạn: “Ơ, chủ tiệm năm nào đây mà! Cả xóm vẫn nhắc món của tiệm con đó!”',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'vendor', gender: 'f', age: 52, anim: 'talk', say: 'Cả xóm vẫn nhắc món của tiệm con đó!' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Mở xe đẩy bán vỉa hè, làm lại',
          success: { stat: 'karma', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Chiếc xe đẩy nhỏ bán đúng món ngày xưa. Khách cũ kéo nhau đến, người này rủ người kia. Hai năm sau bạn trả xong nợ và còn dư một khoản — lần này không vay ai một đồng.',
              effects: { money: 350000000, happy: 14, smarts: 3, flag: 's_money_comeback' },
              scene: { anim: 'cheer', weather: 'clear', time: 'day', fx: 'sparkle', npcAnim: { vendor: 'clap' } } },
            { text: 'Xe đẩy bị nhắc nhở lấn chiếm vỉa hè liên tục, buôn bán lúc được lúc không. Đủ ăn, trả nợ chậm, nhưng ít ra bạn đã đứng dậy.',
              effects: { money: 40000000, happy: 3, health: -2 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { vendor: 'nod' } } }
          ] },
        { label: 'Đi làm công ăn lương, trả nợ dần',
          text: 'Bạn chọn sự an toàn: đi làm, trả nợ, ngủ đủ giấc. Có những đêm vẫn mơ thấy tiếng máy dập nắp ly, nhưng tỉnh dậy thấy lòng nhẹ tênh.',
          effects: { money: 80000000, happy: 4, health: 3, karma: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { vendor: 'wave' } } },
        { label: 'Viết bài kể chuyện thất bại lên mạng',
          outcomes: [
            { p: 0.5, text: 'Bài viết “Tôi đã mất tất cả vì giấc mơ làm chủ” được chia sẻ hai mươi nghìn lần. Một quỹ nhỏ mời bạn làm cố vấn, kèm khoản tạm ứng.',
              effects: { money: 200000000, happy: 10, smarts: 4 },
              scene: { loc: 'cafe', anim: 'type', fx: 'stars' } },
            { p: 0.5, text: 'Bài viết bị “ném đá” tơi bời: “Không biết làm ăn thì đừng mơ.” Bạn tắt máy, nhưng hóa ra viết được ra cũng đã nhẹ lòng.',
              effects: { happy: -2, smarts: 4 },
              scene: { loc: 'cafe', anim: 'shrug', fx: 'anger' } }
          ] }
      ]
    },

    // ======================= ARC 2: SỐT ĐẤT VEN ĐÔ =======================
    {
      id: 's_money_land_fever', title: 'Cơn sốt đất ven đô', icon: '🏞️', age: [25, 65], weight: 1.1,
      req: { minMoney: 1500000000, notFlag: ['s_money_land', 's_money_land_wise'] },
      text: 'Nhóm Zalo “Đất nền ven đô — cơ hội cuối” réo suốt ngày: nghe nói sắp có đường vành đai, đất ruộng giá {money:1500000000} một lô, “tháng sau gấp đôi”. Môi giới chở bạn đi xem bằng xe bảy chỗ, phát nước suối, bánh mì, rồi đứng giữa ruộng chỉ tay: “Đây sẽ là trung tâm thành phố mới!”',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 29, anim: 'point', say: 'Cọc liền tay, chiều nay là hết lô đẹp!' }, { role: 'crowd', anim: 'phone' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Xuống tiền 1,5 tỷ, cọc liền tay',
          text: 'Bạn chuyển khoản ngay giữa ruộng, sóng điện thoại chập chờn mà tay không run. Tối về mở Zalo, cả nhóm chúc mừng “nhà đầu tư thông thái”.',
          effects: { money: -1500000000, asset: { add: { type: 'land', name: 'Lô đất nền ven đô', value: 1500000000 } }, happy: 5, flag: 's_money_land', followUp: { id: 's_money_land_peak', delay: 1 } },
          scene: { anim: 'phone', fx: 'money', npcAnim: { stranger: 'clap', crowd: 'clap' } } },
        { label: 'Vay thêm ngân hàng, ôm lô góc 3 tỷ',
          text: 'Bạn dốc hết tiền, ký thêm khoản vay ngân hàng, ôm luôn lô góc “hai mặt tiền”. Môi giới bắt tay chặt đến đau: “Anh chị đúng là có tầm nhìn!”',
          effects: { money: -3000000000, asset: { add: { type: 'land', name: 'Lô đất góc ven đô', value: 3000000000 } }, happy: 6, flag: ['s_money_land', 's_money_land_loan'], followUp: { id: 's_money_land_debt', delay: 1 } },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'bow' } } },
        { label: 'Đòi xem sổ đỏ, lên phường hỏi quy hoạch',
          outcomes: [
            { p: 0.6, text: 'Bạn lên phường hỏi: đất nông nghiệp chưa lên thổ cư, sổ chung cả chục người, còn đường vành đai thì chỉ có trong... nhóm Zalo. Bạn rút lui, môi giới chặn số bạn ngay trong đêm.',
              effects: { smarts: 5, happy: 3, flag: 's_money_land_wise' },
              scene: { anim: 'nod', fx: 'idea', npcAnim: { stranger: 'facepalm' } } },
            { p: 0.4, text: 'Sổ đỏ riêng, đường nhựa đã trải tới đầu lô. Bạn mua một lô nhỏ {money:700000000}, vừa sức, ngủ ngon.',
              effects: { money: -700000000, asset: { add: { type: 'land', name: 'Lô đất nhỏ có sổ', value: 700000000 } }, happy: 4, smarts: 2, flag: 's_money_land_wise' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'nod' } } }
          ] },
        { label: 'Đất ruộng thì để trồng lúa',
          text: 'Bạn xin thêm ổ bánh mì rồi ra về. Trên xe, cả đoàn nhìn bạn như nhìn người vừa bỏ lỡ chuyến tàu cuối.',
          effects: { happy: 1, smarts: 1, flag: 's_money_land_wise' },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { crowd: 'shake' } } }
      ]
    },
    {
      id: 's_money_land_peak', title: 'Giá đất nhảy múa', icon: '💹', age: [25, 70], chainOnly: true,
      req: { asset: 'land' },
      text: 'Một năm sau, giá trong nhóm Zalo đã “nhảy” gần gấp đôi. Môi giới hẹn bạn ra quán cà phê lúc 7 giờ sáng: “Có khách trả {money:2800000000} cho lô của anh chị, chốt trong hôm nay!” Nhưng cả nhóm đang hô: “Cuối năm lên 5 tỷ, ai bán bây giờ là dại.”',
      scene: { loc: 'cafe', time: 'dawn', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', anim: 'talk', say: 'Khách trả 2,8 tỷ, chốt trong hôm nay nha!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Chốt lời liền, không tham',
          text: 'Bạn ký giấy, cầm về gần gấp đôi số vốn. Ba tháng sau nhóm Zalo im bặt, giá đất rơi như đá. Bạn rùng mình nhìn sổ tiết kiệm.',
          effects: { money: 2800000000, asset: { lose: 'land' }, happy: 10, smarts: 4, flag: 's_money_land_win' },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'clap' } } },
        { label: 'Ôm tiếp, đợi lên 5 tỷ',
          text: 'Bạn lắc đầu từ chối. Tối đó bạn mơ thấy mình đứng giữa ruộng, tay ôm cục vàng to bằng cái nồi cơm điện.',
          effects: { happy: 3, followUp: { id: 's_money_land_burst', delay: 1 } },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { stranger: 'shrug' } } },
        { label: 'Cầm sổ đỏ vay thêm, mua lô thứ hai',
          text: 'Thắng một lần, bạn muốn thắng to hơn. Bạn thế chấp lô đất, vay {money:1500000000} mua thêm lô bên cạnh. Môi giới cười híp cả mắt.',
          effects: { money: -1500000000, asset: { add: { type: 'land', name: 'Lô đất thứ hai', value: 1500000000 } }, happy: 5, flag: 's_money_land_loan', followUp: { id: 's_money_land_seized', delay: 1 } },
          scene: { anim: 'phone', fx: 'money', npcAnim: { stranger: 'laugh' } } }
      ]
    },
    {
      id: 's_money_land_debt', title: 'Lãi ngân hàng mỗi tháng', icon: '🏦', age: [25, 70], chainOnly: true,
      req: { asset: 'land' },
      text: 'Một năm ôm lô góc. Giá trong nhóm vẫn “đang lên” nhưng chẳng thấy ai mua thật. Tháng nào tin nhắn ngân hàng cũng “ting” một lần: trừ {money:28000000} tiền lãi. Môi giới vỗ vai: “Gồng thêm chút nữa thôi, sắp có sóng rồi!”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'cloudy', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'stranger', anim: 'talk', say: 'Gồng thêm chút nữa thôi, sắp có sóng!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Gồng tiếp, lấy lương trả lãi',
          text: 'Bạn thắt lưng buộc bụng: cắt cà phê, cắt du lịch, cắt luôn giấc ngủ. Một năm trả {money:340000000} tiền lãi cho một mảnh ruộng cỏ mọc ngang đầu gối.',
          effects: { money: -340000000, happy: -8, health: -4, followUp: { id: 's_money_land_seized', delay: 1 } },
          scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'shrug' } } },
        { label: 'Bán cắt lỗ, trả nợ cho nhẹ người',
          outcomes: [
            { p: 0.6, text: 'Bạn hạ giá còn {money:2500000000}, hai tháng sau mới có người mua. Trả xong nợ, lỗ ngót nửa tỷ, nhưng đêm đầu tiên bạn ngủ một mạch tới sáng.',
              effects: { money: 2500000000, asset: { lose: 'land' }, happy: 2, smarts: 5, flag: 's_money_land_lost' },
              scene: { anim: 'sad', fx: 'zzz', npcAnim: { stranger: 'nod' } } },
            { p: 0.4, text: 'Không ai mua. Bạn hạ mãi, cuối cùng bán tháo được {money:1800000000}. Hơn tỷ bạc bốc hơi trong một năm.',
              effects: { money: 1800000000, asset: { lose: 'land' }, happy: -10, smarts: 5, flag: 's_money_land_lost' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Rao bán ngay trong chính nhóm Zalo đó',
          outcomes: [
            { p: 0.3, text: 'Có một người còn “say đất” hơn cả bạn, mua lại với giá {money:3400000000}. Bạn thoát hàng ngoạn mục, nhưng đêm nằm nghĩ đến người mua lại thấy chột dạ.',
              effects: { money: 3400000000, asset: { lose: 'land' }, happy: 10, karma: -3, flag: 's_money_land_win' },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'clap' } } },
            { p: 0.7, text: 'Bạn đăng tin, rồi phát hiện ra cả nhóm năm trăm người... đều đang rao bán. Không một ai mua.',
              effects: { happy: -6, followUp: { id: 's_money_land_seized', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'question', npcAnim: { stranger: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_money_land_burst', title: 'Bong bóng vỡ', icon: '🫧', age: [25, 75], chainOnly: true,
      req: { asset: 'land' },
      text: 'Bong bóng vỡ không một tiếng động: đường vành đai hóa ra chỉ là “định hướng đến năm 2050”, nhóm Zalo im bặt, môi giới đổi số. Lô đất của bạn rao {money:800000000} cả tháng không một cuộc gọi. Chỉ có bác nông dân cạnh bên là ghé hỏi thăm.',
      scene: { loc: 'countryside', time: 'dusk', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'neighbor', gender: 'm', age: 63, anim: 'idle', say: 'Đất này trồng mía tốt lắm cháu ạ.' }], fx: 'dust', shot: 'wide' },
      choices: [
        { label: 'Bán tháo cho xong',
          text: 'Bạn bán lại cho chính bác nông dân với giá {money:750000000}. Bác vui vẻ: “Mai bác trồng mía.” Bạn cười mà muốn khóc.',
          effects: { money: 750000000, asset: { lose: 'land' }, happy: -8, smarts: 5, flag: 's_money_land_lost' },
          scene: { anim: 'shrug', fx: 'tears', npcAnim: { neighbor: 'nod' } } },
        { label: 'Giữ lại, coi như để dành',
          text: 'Bạn cất sổ đỏ vào két, tự nhủ đất không mất đi đâu. Chỉ có tiền là nằm im ở đó, không đẻ thêm đồng nào.',
          effects: { happy: -4, flag: 's_money_land_hold', followUp: { id: 's_money_land_twist', delay: 4 } },
          scene: { anim: 'think', fx: 'question', npcAnim: { neighbor: 'shrug' } } },
        { label: 'Trồng chuối trên lô đất tỷ bạc',
          text: 'Bạn thuê người phát cỏ, trồng ba trăm gốc chuối. Cuối tuần nào cũng về chăm chuối, tự gọi mình là “đại gia nông nghiệp công nghệ cao”.',
          effects: { money: -15000000, happy: 3, health: 3, flag: 's_money_land_hold', followUp: { id: 's_money_land_twist', delay: 4 } },
          scene: { anim: 'laugh', time: 'day', weather: 'clear', fx: 'sparkle', npcAnim: { neighbor: 'laugh' } } }
      ]
    },
    {
      id: 's_money_land_seized', title: 'Ngân hàng siết nợ', icon: '🔒', age: [25, 75], chainOnly: true,
      req: { asset: 'land' },
      text: 'Thông báo cuối cùng từ ngân hàng: khoản vay thế chấp bằng đất đã quá hạn, tài sản sẽ bị phát mại. Giá đất giờ chỉ còn một nửa, rao mãi không ai hỏi. Cô nhân viên ngân hàng ngồi ngay phòng khách nhà bạn, lật từng trang hồ sơ.',
      scene: { loc: 'home', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'coworker', gender: 'f', age: 33, anim: 'talk', say: 'Quá hạn ba kỳ rồi, bên em buộc phải phát mại.' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Giao sổ đỏ cho ngân hàng',
          text: 'Bạn ký biên bản bàn giao. Đất bị phát mại rẻ mạt, chỉ đủ trừ một phần nợ. Bước ra khỏi ngân hàng, trời vẫn nắng, chỉ có lòng mình là tối sầm.',
          effects: { asset: { lose: ['land', 'land'] }, money: 1200000000, happy: -14, health: -4, smarts: 4, flag: 's_money_land_lost' },
          scene: { anim: 'sad', fx: 'dust', npcAnim: { coworker: 'bow' } } },
        { label: 'Bán nhà đang ở để giữ đất', req: { asset: 'house' },
          text: 'Bạn bán vội căn nhà đang ở, trả sạch nợ, giữ lại mảnh đất như giữ một lời hứa với chính mình. Cả nhà dọn đi ở thuê, không ai nói gì.',
          effects: { asset: { lose: 'house' }, money: 2500000000, happy: -12, flag: 's_money_land_hold', followUp: { id: 's_money_land_twist', delay: 4 } },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'nod' } } },
        { label: 'Đi vay họ hàng để đảo nợ',
          outcomes: [
            { p: 0.5, text: 'Họ hàng mỗi người góp một ít, đủ cho bạn đảo nợ. Bạn giữ được đất, đổi lại đám giỗ nào cũng nghe nhắc khéo chuyện tiền nong.',
              effects: { happy: -4, karma: -2, rel: { all: -5 }, flag: 's_money_land_hold', followUp: { id: 's_money_land_twist', delay: 4 } },
              scene: { anim: 'bow', fx: 'sweat', npcAnim: { coworker: 'nod' } } },
            { p: 0.5, text: 'Ai cũng “đang kẹt”. Ngân hàng phát mại đất, bạn còn mang thêm tiếng “ham đất mất nhà” trong họ.',
              effects: { asset: { lose: ['land', 'land'] }, money: 1000000000, happy: -15, health: -3, flag: 's_money_land_lost' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'shrug' } } }
          ] }
      ]
    },
    {
      id: 's_money_land_twist', title: 'Đất cũ, giá mới', icon: '🛣️', age: [25, 85], chainOnly: true,
      req: { asset: 'land' },
      text: 'Bốn năm sau, chẳng ai ngờ: máy xúc về thật, tuyến đường mới được khởi công ngay sát lô đất bạn ôm. Điện thoại lại réo, vẫn giọng môi giới năm nào, ngọt hơn mía lùi: “Anh chị ơi, lô đó giờ có khách trả {money:3500000000}!”',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'stranger', anim: 'phone', say: 'Khách trả 3,5 tỷ, anh chị bán không?' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Bán ngay, gỡ cả vốn lẫn lời',
          text: 'Bạn ký hợp đồng, nhận {money:3500000000}. Bốn năm ôm đất như ôm cục than hồng, cuối cùng than hóa vàng. Bạn tự hứa sẽ không bao giờ kể chuyện này như một “bí quyết”.',
          effects: { money: 3500000000, asset: { lose: 'land' }, happy: 14, flag: 's_money_land_win' },
          scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { stranger: 'clap' } } },
        { label: 'Giữ làm của để dành cho con cháu',
          text: 'Bạn từ chối. Mảnh đất từng làm bạn mất ngủ giờ thành chỗ dựa. Cuối tuần bạn về đó pha ấm trà, ngồi nhìn xe chạy trên con đường mới.',
          effects: { happy: 8, karma: 2 },
          scene: { anim: 'sit', fx: 'sparkle', npcAnim: { stranger: 'shrug' } } },
        { label: 'Xây dãy trọ cho công nhân thuê',
          text: 'Bạn bỏ thêm {money:1200000000} xây hai mươi phòng trọ. Tiền thuê đều đặn về tài khoản mỗi tháng, còn bạn thành chủ trọ dễ tính nhất vùng.',
          effects: { money: -1200000000, asset: { add: { type: 'house', name: 'Dãy trọ ven đô', value: 3200000000 }, lose: 'land' }, happy: 9, karma: 3 },
          scene: { anim: 'lift', fx: 'dust', npcAnim: { stranger: 'nod' } } }
      ]
    },

    // ======================= ARC 3: CHỨNG KHOÁN, MARGIN & TIỀN SỐ =======================
    {
      id: 's_money_stock_tip', title: 'Nhóm phím hàng VIP', icon: '📊', age: [22, 60], weight: 1.1,
      req: { minMoney: 200000000, notFlag: ['s_money_stock', 's_money_stock_safe'] },
      text: 'Một người quen trong hội cầu lông, {stranger}, kéo bạn vào nhóm “Phím hàng VIP”, phí {money:5000000} một tháng. Tuần đầu làm theo, mã cổ phiếu được phím tăng trần ba phiên liền, tài khoản bạn lời {money:60000000}. Bạn bắt đầu mở app chứng khoán nhiều hơn mở Facebook.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'phone', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'm', age: 38, anim: 'laugh', say: 'Thấy chưa, cứ theo anh là ăn!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Bơm thêm tiền, đánh lớn',
          text: 'Bạn chuyển thêm {money:500000000} vào tài khoản chứng khoán. Ba tuần tiếp theo toàn màu xanh, bạn bắt đầu tin mình có “tố chất”.',
          effects: { money: 60000000, happy: 7, flag: 's_money_stock', followUp: { id: 's_money_stock_margin', delay: 1 } },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'clap' } } },
        { label: 'Chốt lời, rút tiền đi ăn mừng',
          text: 'Bạn chốt lời, rút tiền, rời nhóm, mời cả nhà đi ăn lẩu. Tháng sau nghe tin mã đó nằm sàn năm phiên liền.',
          effects: { money: 45000000, happy: 6, smarts: 2, flag: 's_money_stock_safe' },
          scene: { loc: 'home', anim: 'eat', fx: 'steam' } },
        { label: 'Học bài bản: đọc báo cáo tài chính',
          text: 'Bạn mua ba cuốn sách đầu tư dày cộp và một khóa học {money:8000000}. Lời ít hơn, nhưng ít nhất bạn biết mình đang mua cái gì.',
          effects: { money: -8000000, smarts: 6, happy: 2, flag: 's_money_stock_safe' },
          scene: { loc: 'bedroom', anim: 'study', fx: 'idea' } }
      ]
    },
    {
      id: 's_money_stock_margin', title: 'Đòn bẩy margin', icon: '🎢', age: [22, 65], chainOnly: true,
      text: 'Thị trường đang sóng to, ai cũng khoe lãi trên Facebook. Công ty chứng khoán mời vay margin: có một đồng được mua hai đồng rưỡi. Trưởng nhóm phím hàng hô trên Telegram: “All-in mã này, cuối năm x3, ai không vào đừng hối hận!”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'happy', fx: 'money', shot: 'close' },
      choices: [
        { label: 'All-in, vay margin tối đa',
          outcomes: [
            { p: 0.25, text: 'Thị trường lên thêm 40% trong hai tháng. Bạn chốt sạch đúng đỉnh — một cú may mắn mà bạn sẽ kể suốt đời như thể đó là tài năng.',
              effects: { money: 700000000, happy: 12, flag: 's_money_stock_lucky' },
              scene: { anim: 'dance', fx: 'fireworks' } },
            { p: 0.75, text: 'Bạn ký hợp đồng margin, mua kín tài khoản. Màn hình xanh rực, đêm nằm mơ thấy biệt thự có hồ cá Koi.',
              effects: { happy: 6, flag: 's_money_stock_margin', followUp: { id: 's_money_stock_crash', delay: 1 } },
              scene: { anim: 'laugh', fx: 'stars' } }
          ] },
        { label: 'Đánh vừa sức, không vay',
          outcomes: [
            { p: 0.6, text: 'Bạn chỉ dùng tiền nhàn rỗi. Lãi {money:90000000}, không giàu nhanh nhưng cũng không mất ngủ.',
              effects: { money: 90000000, happy: 4, smarts: 2 },
              scene: { anim: 'nod', fx: 'money' } },
            { p: 0.4, text: 'Thị trường điều chỉnh, bạn lỗ {money:70000000}. Đau, nhưng vẫn còn đứng vững.',
              effects: { money: -70000000, happy: -4, smarts: 2 },
              scene: { anim: 'shrug', fx: 'sweat' } }
          ] },
        { label: 'Chuyển sang tiền số, x100 mới đáng',
          text: 'Chứng khoán chậm quá. Bạn mở tài khoản sàn tiền số, nạp tiền, học vẽ “nến” xuyên đêm.',
          effects: { happy: 3, flag: 's_money_crypto', followUp: { id: 's_money_stock_crypto', delay: 0 } },
          scene: { loc: 'bedroom', anim: 'type', fx: 'idea' } },
        { label: 'Rút hết, rời nhóm phím hàng',
          text: 'Bạn rút tiền, rời nhóm, chặn luôn trưởng nhóm. Nửa năm sau thị trường sập, bạn thắp nén nhang cảm ơn... chính mình.',
          effects: { happy: 4, smarts: 4, flag: 's_money_stock_safe' },
          scene: { anim: 'nod', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_money_stock_crash', title: 'Lệnh gọi ký quỹ', icon: '🔻', age: [22, 70], chainOnly: true,
      text: 'Sáng thứ Hai, bảng điện đỏ lòm, cả sàn nằm sàn. Chín giờ mười lăm, tin nhắn công ty chứng khoán: “Tài khoản của quý khách dưới tỷ lệ ký quỹ. Vui lòng nộp thêm {money:400000000} trước 14 giờ, nếu không sẽ bị bán giải chấp.” Tay bạn run tới mức gõ sai mật khẩu ba lần.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'coworker', anim: 'facepalm', say: 'Sàn nằm sàn hết rồi, cứu tôi với!' }], fx: ['sweat', 'exclaim'], shot: 'dramatic' },
      choices: [
        { label: 'Cắt lỗ ngay, chấp nhận mất',
          text: 'Bạn bấm bán tất cả trong nước mắt. Mất {money:350000000} cùng một phần tư số tiền còn lại, nhưng giữ được cái nhà và cái đầu.',
          effects: { money: -350000000, moneyPct: -0.25, happy: -10, smarts: 5, flag: 's_money_stock_burned' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'sad' } } },
        { label: 'Gom tiền nhà nộp thêm, gồng tiếp',
          outcomes: [
            { p: 0.3, text: 'Bạn nộp đủ lúc 13 giờ 58. Tuần sau thị trường hồi mạnh, bạn thoát hàng gần hòa vốn và thề không bao giờ đụng tới margin nữa.',
              effects: { money: -50000000, happy: 3, health: -4, smarts: 4 },
              scene: { anim: 'sit', fx: 'sweat', npcAnim: { coworker: 'clap' } } },
            { p: 0.7, text: 'Nộp thêm rồi thị trường vẫn rơi. Ba phiên sau, tài khoản bị bán giải chấp sạch sẽ. Bạn mất {money:900000000} và gần nửa số tiền còn lại, ngồi im trong nhà vệ sinh công ty cả tiếng đồng hồ.',
              effects: { money: -900000000, moneyPct: -0.45, happy: -18, health: -6, flag: 's_money_stock_burned' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'shake' } } }
          ] },
        { label: 'Tắt app, lên chùa cho tĩnh tâm',
          outcomes: [
            { p: 0.5, text: 'Bạn lên chùa, tắt điện thoại cả ngày. Chiều về mở app: tài khoản đã bị bán giải chấp, chỉ còn con số lẻ. Tâm thì tĩnh, ví thì trống.',
              effects: { money: -600000000, moneyPct: -0.3, happy: -10, karma: 2, flag: 's_money_stock_burned' },
              scene: { loc: 'temple', anim: 'pray', fx: 'tears' } },
            { p: 0.5, text: 'Bạn lên chùa, tắt điện thoại cả ngày. Chiều về, thị trường đã quay đầu từ lúc nào, tài khoản chỉ âm nhẹ. Bạn quay lại chùa thắp thêm nén nhang.',
              effects: { money: -80000000, happy: 3, karma: 2 },
              scene: { loc: 'temple', anim: 'pray', fx: 'sparkle' } }
          ] }
      ]
    },
    {
      id: 's_money_stock_crypto', title: 'Đêm canh nến', icon: '🕯️', age: [22, 65], chainOnly: true,
      text: 'Ba giờ sáng, bạn vẫn ngồi canh biểu đồ, mắt đỏ hoe. Sàn tiền số cho phép đòn bẩy x50: đúng hướng thì một đêm đổi đời, sai hướng thì một cây nến là bay sạch. Nhóm chat đang hô vang: “Long đi anh em, bay lên mặt trăng!”',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'type', expr: 'surprised', fx: ['sweat', 'money'], shot: 'close' },
      choices: [
        { label: 'Long x50, đặt hết vào',
          outcomes: [
            { p: 0.15, text: 'Nến xanh dựng đứng. Tài khoản nhân tám trong một đêm. Bạn rút ngay {money:1200000000}, tay run đến mức làm đổ ly cà phê lên bàn phím.',
              effects: { money: 1200000000, happy: 14, health: -3 },
              scene: { anim: 'jump', fx: 'fireworks' } },
            { p: 0.85, text: 'Một cây nến đỏ lúc 3 giờ 17 phút. Màn hình hiện dòng chữ “Đã thanh lý”. Bạn mất {money:600000000} cùng phần lớn tiền để dành, nằm nhìn trần nhà đến sáng.',
              effects: { money: -600000000, moneyPct: -0.35, happy: -16, health: -5, flag: 's_money_stock_burned' },
              scene: { anim: 'sad', expr: 'sad', time: 'dawn', fx: 'tears' } }
          ] },
        { label: 'Đặt dừng lỗ cẩn thận, đánh nhỏ',
          outcomes: [
            { p: 0.5, text: 'Bạn đặt lệnh nhỏ, có dừng lỗ đàng hoàng. Sáng ra lãi {money:80000000}, đủ để biết mình không phải thiên tài nhưng cũng chưa thành con bạc.',
              effects: { money: 80000000, happy: 4, smarts: 3 },
              scene: { anim: 'nod', fx: 'money' } },
            { p: 0.5, text: 'Giá quét đúng điểm dừng lỗ của bạn rồi bay vút lên. Bạn mất {money:120000000} và một đêm ngủ.',
              effects: { money: -120000000, happy: -5, health: -2 },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Gập máy, đi ngủ',
          text: 'Bạn gập laptop, rút tiền về ngân hàng. Giấc ngủ đêm đó là khoản đầu tư sinh lời nhất năm.',
          effects: { health: 3, happy: 2, smarts: 3, flag: 's_money_stock_safe' },
          scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },

    // ======================= ARC 4: CÁ ĐỘ MÙA WORLD CUP =======================
    {
      id: 's_money_bet_start', title: 'Mùa World Cup', icon: '⚽', age: [18, 60], weight: 1,
      req: { notFlag: ['s_money_bet', 's_money_bet_no'] },
      text: 'Mùa World Cup, quán nhậu đầu hẻm kéo màn hình lớn ra vỉa hè. {stranger}, ông bạn nhậu ngồi cạnh, khoe vừa “ăn” {money:5000000} nhờ kèo chấp nửa trái, rồi chìa điện thoại: “Tải cái app này, nạp tiền đặt kèo nhanh như một nốt nhạc!”',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 35, anim: 'laugh', say: 'Kèo thơm lắm, vào một ít cho vui!' }, { role: 'crowd', anim: 'cheer' }], fx: 'music', shot: 'close' },
      choices: [
        { label: 'Đặt thử 2 triệu cho vui',
          outcomes: [
            { p: 0.7, text: 'Đội bạn chọn thắng ở phút bù giờ. Ting ting: tài khoản cộng {money:3000000}. Bạn hét còn to hơn lúc đội nhà ghi bàn.',
              effects: { money: 3000000, happy: 6, karma: -2, flag: 's_money_bet', followUp: { id: 's_money_bet_deep', delay: 0 } },
              scene: { anim: 'jump', fx: 'money', npcAnim: { stranger: 'clap', crowd: 'cheer' } } },
            { p: 0.3, text: 'Thua. Mất {money:2000000}. Bạn tự nhủ: “Trận sau gỡ, trận sau chắc ăn.”',
              effects: { money: -2000000, happy: -2, karma: -2, flag: 's_money_bet', followUp: { id: 's_money_bet_deep', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Chỉ xem bóng, uống trà đá',
          text: 'Bạn gọi thêm ly trà đá, hò hét theo từng pha bóng. Vui trọn vẹn, ví nguyên vẹn.',
          effects: { happy: 4, flag: 's_money_bet_no' },
          scene: { anim: 'cheer', fx: 'music', npcAnim: { stranger: 'shrug' } } },
        { label: 'Khuyên ông bạn bỏ đi',
          text: '“Nhà cái không bao giờ thua đâu ông ạ.” {stranger} cười khẩy, bảo bạn nhát. Ba tháng sau nghe nói ông ấy phải bán xe.',
          effects: { karma: 3, smarts: 2, flag: 's_money_bet_no' },
          scene: { anim: 'shake', fx: 'idea', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 's_money_bet_deep', title: 'Gỡ, gỡ nữa, gỡ mãi', icon: '🎲', age: [18, 65], chainOnly: true,
      text: 'Vòng tứ kết. Bạn thắng vài trận, rồi thua liền năm trận. Số nợ trên app đã là {money:180000000}. Một “đại lý” nhắn tin lúc nửa đêm: “Cho vay thêm 200 triệu để gỡ, chung kết kèo chắc ăn, lãi nhẹ thôi.”',
      scene: { loc: 'bedroom', time: 'night', weather: 'rain', anim: 'phone', expr: 'scared', fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Vay thêm, đánh trận chung kết',
          outcomes: [
            { p: 0.2, text: 'Phút 89, bàn thắng định mệnh. Bạn gỡ đủ nợ, còn dư {money:20000000}. Bạn run rẩy xóa app... và ba ngày sau tải lại.',
              effects: { money: 20000000, happy: 6, karma: -3, flag: 's_money_bet_lucky', followUp: { id: 's_money_bet_after', delay: 2 } },
              scene: { anim: 'jump', fx: 'money' } },
            { p: 0.8, text: 'Đội bạn đặt thua không gỡ nổi. Nợ cả gốc lẫn lãi vọt lên gần nửa tỷ. Điện thoại bắt đầu réo những số lạ.',
              effects: { happy: -14, health: -3, karma: -3, followUp: { id: 's_money_bet_thug', delay: 0 } },
              scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Dừng lại, khai thật với gia đình',
          text: 'Bạn ngồi xuống giữa bữa cơm, nói hết. Cả nhà im lặng rất lâu, rồi cùng gom tiền trả nợ. Bạn mất {money:180000000}, nhưng giữ được mái nhà.',
          effects: { money: -180000000, happy: -6, karma: 4, smarts: 3, flag: 's_money_bet_quit' },
          scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'cry', fx: 'tears' } },
        { label: 'Chặn số đại lý, trốn nợ',
          text: 'Bạn chặn số, xóa app, tắt định vị. Bạn tưởng thế là xong.',
          effects: { karma: -5, happy: -3, followUp: { id: 's_money_bet_thug', delay: 0 } },
          scene: { anim: 'scared', fx: 'exclaim' } }
      ]
    },
    {
      id: 's_money_bet_thug', title: 'Người đòi nợ', icon: '🧾', age: [18, 70], chainOnly: true,
      text: 'Hai {thug.k} xăm trổ chặn bạn ngay đầu hẻm: “Lãi mẹ đẻ lãi con, giờ là {money:450000000}. Một tuần.” Sáng hôm sau, cửa nhà bị tạt sơn đỏ, hàng xóm đứng xa xì xào, không ai dám lại gần.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thug', anim: 'point', expr: 'angry', say: 'Một tuần. Không có tiền thì đừng trách!' }, { role: 'thug', anim: 'angry' }, { role: 'neighbor', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Bán xe, cầm sổ nhà trả nợ',
          text: 'Bạn bán xe, cầm sổ nhà vay ngân hàng, trả sạch {money:450000000}. Hai gã kia đếm tiền, cười: “Lần sau chơi tiếp nha.” Bạn đứng run trong hẻm rất lâu.',
          effects: { money: -450000000, asset: { lose: ['car', 'motorbike'] }, happy: -12, health: -3, flag: 's_money_bet_paid', followUp: { id: 's_money_bet_after', delay: 2 } },
          scene: { anim: 'sad', fx: 'dust', npcAnim: { thug: 'laugh', neighbor: 'shake' } } },
        { label: 'Báo công an',
          outcomes: [
            { p: 0.6, text: 'Công an phường vào cuộc, triệt phá đường dây cho vay nặng lãi. Bạn cũng bị phạt hành chính {money:20000000} vì đánh bạc, và cả xóm biết chuyện. Nhục, nhưng hết sợ.',
              effects: { money: -20000000, happy: -6, karma: 4, flag: 's_money_bet_quit', followUp: { id: 's_money_bet_after', delay: 2 } },
              scene: { anim: 'bow', fx: 'flash', npcAnim: { thug: 'scared', neighbor: 'nod' } } },
            { p: 0.4, text: 'Công an ghi nhận, nhưng bọn chúng thay người đòi liên tục. Cuối cùng bạn vẫn phải bán xe, trả {money:250000000} cho yên chuyện.',
              effects: { money: -250000000, asset: { lose: 'motorbike' }, happy: -10, health: -3, flag: 's_money_bet_paid', followUp: { id: 's_money_bet_after', delay: 2 } },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { thug: 'laugh' } } }
          ] },
        { label: 'Bỏ trốn đi tỉnh khác làm thuê',
          text: 'Bạn trốn biệt xứ. Bọn đòi nợ tìm đến nhà, người thân phải bán mảnh đất hương hỏa trả thay. Ở nơi xa, bạn nhận được đúng một tin nhắn: “Đừng về nữa.”',
          effects: { happy: -16, karma: -10, rel: { mother: -20, father: -20, spouse: -25, sibling: -15 }, flag: 's_money_bet_fled', followUp: { id: 's_money_bet_after', delay: 2 } },
          scene: { loc: 'countryside', time: 'dawn', weather: 'fog', anim: 'walk', fx: 'tears' } }
      ]
    },
    {
      id: 's_money_bet_after', title: 'Euro lại về', icon: '📺', age: [18, 75], chainOnly: true,
      text: 'Hai năm sau mùa World Cup ấy. Quán nhậu đầu hẻm lại kéo màn hình ra vỉa hè đón Euro. Cái app cũ vẫn nằm đâu đó trong điện thoại, và ngón tay bạn bỗng ngứa ngáy lạ thường.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'phone', expr: 'neutral',
        npcs: [{ role: 'stranger', anim: 'cheer', say: 'Ê, lâu quá! Vào kèo không?' }, { role: 'crowd', anim: 'cheer' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Xóa app, đứng dậy đi về',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn xóa app ngay trước mặt {stranger}, đứng dậy đi về. Từ đó bạn xem bóng ở nhà với người thân, đĩa hướng dương và ấm trà nóng. Không kèo nào thơm bằng bình yên.',
              effects: { happy: 9, health: 3, karma: 4, rel: { all: 6 }, flag: 's_money_bet_clean' },
              scene: { loc: 'home', anim: 'laugh', fx: 'sparkle' } },
            { text: 'Bạn xóa app, nhưng hai tuần sau lén tải lại “chỉ đặt một kèo nhỏ”. Mùa Euro đó lấy thêm của bạn {money:120000000}.',
              effects: { money: -120000000, happy: -8, karma: -3 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Một kèo cuối, gỡ lại hết',
          outcomes: [
            { p: 0.15, text: 'Thắng. Bạn lấy lại {money:60000000}, cùng một niềm tin rất nguy hiểm.',
              effects: { money: 60000000, happy: 4, karma: -3 },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'clap' } } },
            { p: 0.85, text: 'Một kèo thành mười kèo. Hết Euro, bạn mất thêm {money:300000000} và chút niềm tin cuối cùng người nhà dành cho mình.',
              effects: { money: -300000000, moneyPct: -0.2, happy: -14, karma: -5, rel: { all: -10 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Về nhà, xin bạn đời một cơ hội cuối', req: { married: true },
          outcomes: [
            { p: 0.55, text: 'Bạn về nhà, kể thật rằng cơn thèm đặt cược đang quay lại. Người bạn đời nắm lấy tay bạn: “Mình cùng cai, có gì cứ nói với nhau.” Từ đó lương được chuyển hết vào tài khoản chung.',
              effects: { happy: 8, karma: 3, rel: { spouse: 12 }, flag: 's_money_bet_clean' },
              scene: { loc: 'home', anim: 'hug', fx: 'hearts' } },
            { p: 0.45, text: 'Người bạn đời lặng lẽ đặt lá đơn ly hôn lên bàn: “Cơ hội đã cho quá nhiều lần rồi.” Bạn ký trong im lặng.',
              effects: { divorce: true, happy: -15 },
              scene: { loc: 'home', anim: 'cry', fx: 'heartbreak' } }
          ] },
        { label: 'Tìm đến lớp sinh hoạt cai cờ bạc',
          text: 'Tối thứ Năm nào bạn cũng ngồi trong gian nhà nhỏ sau chùa, nơi thầy trụ trì mở lớp cho những người muốn bỏ cờ bạc. Nghe những người như mình kể chuyện, lần đầu tiên bạn thấy mình không cô độc.',
          effects: { happy: 5, karma: 4, smarts: 2, health: 2, flag: 's_money_bet_clean' },
          scene: { loc: 'temple', time: 'dusk', anim: 'sit', fx: 'sparkle' } }
      ]
    },

    // ======================= ARC 5: ĐA CẤP — “CƠ HỘI TỰ DO TÀI CHÍNH” =======================
    {
      id: 's_money_mlm_invite', title: 'Buổi phỏng vấn lạ', icon: '🕴️', age: [20, 55], weight: 1,
      req: { minMoney: 30000000, notFlag: ['s_money_mlm', 's_money_mlm_no'] },
      text: 'Bạn đăng hồ sơ tìm việc lên mạng, hôm sau có người gọi mời phỏng vấn “trợ lý kinh doanh, thu nhập 30 triệu, không cần kinh nghiệm”. Đến nơi, không phải văn phòng mà là hội trường khách sạn: nhạc xập xình, hàng trăm người mặc vest đứng vỗ tay theo nhịp, diễn giả áo trắng nhảy lên sân khấu.',
      scene: { loc: 'wedding', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 40, anim: 'cheer', say: 'Bạn muốn làm nô lệ đồng lương cả đời sao?' }, { role: 'crowd', anim: 'clap' }], fx: 'music', shot: 'wide' },
      choices: [
        { label: 'Ngồi lại nghe thử xem sao',
          text: 'Bạn ngồi xuống hàng ghế cuối. Ba tiếng sau, bạn đã thuộc lòng câu khẩu hiệu và đứng dậy vỗ tay lúc nào không hay.',
          effects: { happy: 2, flag: 's_money_mlm', followUp: { id: 's_money_mlm_pitch', delay: 0 } },
          scene: { anim: 'clap', fx: 'music', npcAnim: { stranger: 'point', crowd: 'cheer' } } },
        { label: 'Đứng dậy bỏ về ngay',
          text: 'Bạn lách qua đám đông, ra khỏi hội trường, kịp ăn tô phở trước giờ trưa. Tối đó số điện thoại kia gọi bạn mười hai cuộc.',
          effects: { smarts: 2, happy: 1, flag: 's_money_mlm_no' },
          scene: { loc: 'street', anim: 'walk', fx: 'sparkle' } },
        { label: 'Ở lại ăn buffet rồi chuồn',
          text: 'Bạn vỗ tay nhiệt tình nhất hội trường, ăn liền ba đĩa tôm, rồi lặng lẽ chuồn bằng cửa thoát hiểm. Một buổi “phỏng vấn” no nê nhất đời.',
          effects: { happy: 5, health: 1, karma: -1, flag: 's_money_mlm_no' },
          scene: { anim: 'eat', fx: 'steam', npcAnim: { stranger: 'facepalm' } } }
      ]
    },
    {
      id: 's_money_mlm_pitch', title: 'Gói Kim cương', icon: '💠', age: [20, 60], chainOnly: true,
      text: 'Hết buổi “truyền lửa”, chính diễn giả bước xuống kéo bạn ra góc: chỉ cần mua “gói khởi nghiệp” {money:68000000} — một máy lọc nước ion kiềm và “quyền kinh doanh” — rồi tuyển thêm năm người là “tự do tài chính trong một năm”. Xung quanh, ai cũng nhìn bạn với ánh mắt sáng rực.',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', anim: 'talk', say: 'Một năm thôi, bạn sẽ tự do tài chính!' }, { role: 'crowd', anim: 'clap' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Mua gói Kim cương 68 triệu',
          text: 'Bạn quẹt thẻ, nhận về chiếc máy lọc nước nặng mười hai ký và tấm danh thiếp “Nhà phân phối”. Cả hội trường vỗ tay chào đón “chiến binh mới”.',
          effects: { money: -68000000, happy: 5, flag: 's_money_mlm_in', followUp: { id: 's_money_mlm_recruit', delay: 1 } },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { stranger: 'hug', crowd: 'cheer' } } },
        { label: 'Mua gói nhỏ cho đỡ ngại',
          text: 'Bạn mua gói {money:15000000} cho xong chuyện. Chiếc máy lọc nước giờ nằm ở góc bếp, dùng để kê chậu cây.',
          effects: { money: -15000000, happy: -2, smarts: 2, flag: 's_money_mlm_out' },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { stranger: 'nod' } } },
        { label: 'Quay clip vạch trần',
          outcomes: [
            { p: 0.5, text: 'Clip “Bên trong một buổi hội thảo đa cấp” lên xu hướng. Nhiều người nhắn cảm ơn vì đã kịp dừng lại.',
              effects: { karma: 6, happy: 4, flag: 's_money_mlm_no' },
              scene: { anim: 'phone', fx: 'stars', npcAnim: { stranger: 'angry' } } },
            { p: 0.5, text: 'Bảo vệ phát hiện, “mời” bạn ra ngoài và bắt xóa clip. Bạn bị đẩy ra cửa giữa những tiếng la ó.',
              effects: { happy: -4, karma: 2, flag: 's_money_mlm_no' },
              scene: { loc: 'street', anim: 'facepalm', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 's_money_mlm_recruit', title: 'Danh bạ điện thoại', icon: '📇', age: [20, 65], chainOnly: true,
      text: 'Một năm làm “nhà phân phối”. Phòng khách chất đầy thùng máy lọc nước và thực phẩm chức năng. Muốn lên “Kim cương”, bạn phải tuyển thêm năm người và ôm thêm {money:120000000} tiền hàng. Danh bạ điện thoại mở sẵn: người thân, bạn bè, đồng nghiệp cũ...',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'stranger', anim: 'talk', say: 'Tháng này phải lên Kim cương, cố lên!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Rủ người thân, bạn bè tham gia',
          outcomes: [
            { p: 0.3, text: 'Bạn thuyết phục được năm người, nhận hoa hồng kha khá. Nhưng mỗi lần họ hỏi “bao giờ có lời”, bạn lại né ánh mắt.',
              effects: { money: 30000000, karma: -8, happy: 2, rel: { all: -6, friend: -10 }, followUp: { id: 's_money_mlm_collapse', delay: 1 } },
              scene: { anim: 'talk', fx: 'money', npcAnim: { stranger: 'clap' } } },
            { p: 0.7, text: 'Bạn bỏ tiền ôm thêm hàng, rủ được người cô và hai đứa bạn thân. Họ mất tiền, bạn mất luôn họ: một người bạn chặn bạn trên mọi mạng xã hội.',
              effects: { money: -120000000, karma: -10, happy: -8, rel: { all: -12 }, removePerson: 'friend', followUp: { id: 's_money_mlm_collapse', delay: 1 } },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Ôm hàng, tự livestream bán',
          text: 'Bạn ôm thêm {money:120000000} tiền hàng, livestream mỗi tối. Ba tháng bán được bốn cái máy, hai cái bị trả lại vì “nước có mùi lạ”.',
          effects: { money: -120000000, happy: -5, health: -2, followUp: { id: 's_money_mlm_collapse', delay: 1 } },
          scene: { anim: 'talk', fx: 'sweat' } },
        { label: 'Rút lui, thanh lý đống hàng tồn',
          text: 'Bạn rao bán máy lọc nước bằng một phần năm giá gốc. Lỗ, nhưng phòng khách lại có chỗ để ngồi, và điện thoại thôi réo.',
          effects: { money: 20000000, happy: 3, smarts: 5, karma: 2, flag: 's_money_mlm_out' },
          scene: { anim: 'lift', fx: 'dust', npcAnim: { stranger: 'angry' } } }
      ]
    },
    {
      id: 's_money_mlm_collapse', title: 'Công ty bốc hơi', icon: '🏚️', age: [20, 70], chainOnly: true,
      text: 'Thời sự đưa tin: công ty bị khởi tố vì kinh doanh đa cấp trái phép, ban lãnh đạo ôm tiền bỏ trốn. Hàng trăm người kéo đến trụ sở đòi tiền. Vị diễn giả từng gọi bạn là “chiến binh” giờ đã khóa trang cá nhân.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'police', anim: 'talk', say: 'Bà con làm đơn tố giác theo mẫu nhé!' }, { role: 'crowd', anim: 'angry' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Làm đơn tố giác, nộp bằng chứng',
          text: 'Bạn nộp toàn bộ hóa đơn, hợp đồng, tin nhắn. Hai năm sau, mỗi nạn nhân được trả lại một phần nhỏ. Bạn nhận {money:15000000}, kèm cảm giác đã làm điều đúng.',
          effects: { money: 15000000, karma: 5, smarts: 3, happy: -2 },
          scene: { anim: 'nod', fx: 'idea', npcAnim: { police: 'nod' } } },
        { label: 'Bán rẻ hàng tồn trên chợ mạng',
          text: 'Bạn chụp ảnh đống máy lọc nước, đăng bán “thanh lý giá sốc”. Thu về {money:12000000} và vài bình luận mỉa mai.',
          effects: { money: 12000000, happy: -3 },
          scene: { loc: 'home', anim: 'phone', fx: 'sweat' } },
        { label: 'Đi xin lỗi từng người đã rủ',
          text: 'Bạn đến từng nhà, cúi đầu xin lỗi. Có người tha thứ, có người đóng cửa. Nhưng mỗi bước chân về, lòng bạn nhẹ đi một chút.',
          effects: { karma: 6, happy: 3, rel: { all: 10, friend: 6 } },
          scene: { loc: 'home', anim: 'bow', fx: 'sparkle' } },
        { label: 'Lập nhóm nạn nhân đòi quyền lợi',
          outcomes: [
            { p: 0.4, text: 'Nhóm làm việc với cơ quan điều tra, cung cấp chứng cứ. Một năm sau mỗi người nhận lại 30% số tiền đã mất.',
              effects: { money: 50000000, karma: 4, happy: 4 },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { crowd: 'clap' } } },
            { p: 0.6, text: 'Nhóm cãi nhau chuyện ai làm trưởng nhóm, tan rã sau hai tuần.',
              effects: { happy: -4 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { crowd: 'angry' } } }
          ] }
      ]
    },

    // ======================= ARC 6: CHỮ KÝ BẢO LÃNH — NGƯỜI NHÀ BỎ TRỐN =======================
    {
      id: 's_money_guarantor_ask', title: 'Chữ ký bảo lãnh', icon: '✍️', age: [25, 65], weight: 1,
      req: { minMoney: 300000000, notFlag: ['s_money_guarantor', 's_money_guarantor_no'] },
      text: '{relative}, người anh em họ bên nội, xách giỏ trái cây đến nhà: “Mình mở xưởng gỗ, cần vay ngân hàng 2 tỷ mà thiếu người bảo lãnh. Ký giùm một chữ thôi, tháng nào cũng trả đều, không liên lụy gì đâu.” Hồ sơ soạn sẵn, chỉ thiếu chữ ký của bạn.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'relative', gender: 'm', anim: 'talk', say: 'Ký giùm một chữ thôi, không liên lụy đâu!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Ký bảo lãnh, người nhà cả mà',
          text: 'Bạn ký. {relative} ôm chầm lấy bạn, hứa Tết này mang biếu bộ bàn ghế gỗ đẹp nhất xưởng.',
          effects: { happy: 3, karma: 4, flag: 's_money_guarantor', followUp: { id: 's_money_guarantor_run', delay: 2 } },
          scene: { anim: 'hug', fx: 'sparkle', npcAnim: { relative: 'hug' } } },
        { label: 'Không ký, cho vay thẳng 300 triệu',
          text: 'Bạn không ký giấy tờ ngân hàng, nhưng chuyển khoản {money:300000000}: “Coi như góp vốn giúp nhau.” {relative} cảm ơn rối rít, hứa hai năm trả đủ.',
          effects: { money: -300000000, karma: 3, flag: 's_money_guarantor', followUp: { id: 's_money_guarantor_debt', delay: 2 } },
          scene: { anim: 'nod', fx: 'money', npcAnim: { relative: 'bow' } } },
        { label: 'Đọc kỹ hồ sơ xưởng gỗ trước',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn phát hiện xưởng đang nợ ba nơi, máy móc đã thế chấp từ năm ngoái. Bạn từ chối nhẹ nhàng. {relative} đỏ mặt ra về.',
              effects: { smarts: 4, karma: 1, flag: 's_money_guarantor_no' },
              scene: { anim: 'shake', fx: 'idea', npcAnim: { relative: 'facepalm' } } },
            { text: 'Hồ sơ đẹp như mơ, có cả ảnh xưởng chụp từ trên cao. Bạn yên tâm đặt bút ký.',
              effects: { karma: 3, flag: 's_money_guarantor', followUp: { id: 's_money_guarantor_run', delay: 2 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { relative: 'cheer' } } }
          ] },
        { label: 'Từ chối, giữ lại ăn bữa cơm',
          text: 'Bạn từ chối khéo, giữ {relative} ở lại ăn cơm. Tết năm đó họ hàng xì xào bạn “giàu mà keo”, nhưng giấc ngủ của bạn vẫn yên.',
          effects: { happy: -2, karma: -1, flag: 's_money_guarantor_no' },
          scene: { anim: 'eat', fx: 'steam', npcAnim: { relative: 'eat' } } }
      ]
    },
    {
      id: 's_money_guarantor_run', title: 'Người bảo lãnh', icon: '🏃', age: [25, 75], chainOnly: true,
      text: 'Hai năm sau, ngân hàng gọi: {relative} đã ngừng trả nợ sáu tháng, xưởng gỗ đóng cửa, cả nhà biến mất khỏi {city}. Là người bảo lãnh, bạn phải trả thay {money:1800000000} cả gốc lẫn lãi.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'coworker', gender: 'f', age: 32, anim: 'talk', say: 'Quý khách là người bảo lãnh, phải trả thay ạ.' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Gom hết tiền, trả thay',
          text: 'Bạn rút sổ tiết kiệm, bán vàng, vay thêm bạn bè, trả sạch khoản nợ không phải của mình. Đêm đó bạn ngồi một mình ngoài ban công, không khóc nổi.',
          effects: { money: -1800000000, happy: -14, karma: 4, flag: 's_money_guarantor_paid', followUp: { id: 's_money_guarantor_return', delay: 3 } },
          scene: { anim: 'sad', fx: 'dust', npcAnim: { coworker: 'bow' } } },
        { label: 'Giao nhà cho ngân hàng xử lý', req: { asset: 'house' },
          text: 'Căn nhà bị ngân hàng phát mại để trừ nợ. Ngày bàn giao, bạn đứng ở cổng rất lâu, nhìn cây khế mình tự tay trồng.',
          effects: { asset: { lose: 'house' }, money: -200000000, happy: -16, flag: 's_money_guarantor_paid', followUp: { id: 's_money_guarantor_return', delay: 3 } },
          scene: { loc: 'home', anim: 'cry', fx: 'tears' } },
        { label: 'Thuê luật sư ra tòa',
          success: { stat: 'smarts', base: 0.25, scale: 0.45 },
          outcomes: [
            { text: 'Luật sư phát hiện hợp đồng bảo lãnh có điều khoản sai quy định. Tòa tuyên bạn chỉ chịu một phần ba. Vẫn mất {money:600000000} cộng {money:150000000} phí luật sư, nhưng còn mái nhà để ở.',
              effects: { money: -750000000, happy: -5, smarts: 4, flag: 's_money_guarantor_paid', followUp: { id: 's_money_guarantor_return', delay: 3 } },
              scene: { anim: 'nod', fx: 'idea', npcAnim: { coworker: 'shrug' } } },
            { text: 'Kiện tụng một năm, thua trắng. Bạn trả đủ {money:1800000000}, cộng {money:150000000} phí luật sư và một mái tóc bạc sớm.',
              effects: { money: -1950000000, happy: -16, health: -5, flag: 's_money_guarantor_paid', followUp: { id: 's_money_guarantor_return', delay: 3 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_money_guarantor_debt', title: 'Khoản vay không ngày về', icon: '📵', age: [25, 75], chainOnly: true,
      text: 'Hai năm trôi qua, {money:300000000} cho {relative} vay vẫn bặt vô âm tín. Gọi thì “đang bận”, nhắn thì “đã xem”. Vậy mà trang cá nhân của {relative} vẫn đều đặn ảnh đi Đà Lạt, ăn hải sản, khoe xe mới.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'angry', fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Bình luận công khai đòi nợ',
          outcomes: [
            { p: 0.45, text: 'Bình luận “Trả tiền rồi hẵng đi Đà Lạt” nhận hai trăm lượt thích từ họ hàng. {relative} ngượng chín mặt, chuyển trả {money:150000000} ngay trong đêm.',
              effects: { money: 150000000, happy: 4, karma: -2 },
              scene: { anim: 'laugh', fx: 'money' } },
            { p: 0.55, text: 'Cả họ chia hai phe. Bạn bị gọi là “đứa bêu riếu người nhà”, còn tiền thì vẫn chưa thấy đâu.',
              effects: { happy: -8, karma: -2, rel: { all: -4 } },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Nhờ bác trưởng họ đứng ra nói chuyện',
          outcomes: [
            { p: 0.6, text: 'Bác trưởng họ gọi {relative} đến nhà thờ họ, nói đúng ba câu. Tuần sau tài khoản bạn nhận {money:200000000}, phần còn lại hẹn trả dần.',
              effects: { money: 200000000, happy: 5, karma: 1 },
              scene: { loc: 'temple', anim: 'bow', fx: 'money' } },
            { p: 0.4, text: 'Bác trưởng họ nói xong, {relative} gật gù lia lịa... rồi chặn luôn số của bác.',
              effects: { happy: -6 },
              scene: { anim: 'facepalm', fx: 'question' } }
          ] },
        { label: 'Coi như cho, giữ tình anh em',
          text: 'Bạn gạch dòng ghi nợ trong sổ tay, tự nhủ coi như làm phước. Lòng hơi xót, nhưng không còn đêm nào thức trắng vì nó nữa.',
          effects: { karma: 8, happy: -2, followUp: { id: 's_money_guarantor_return', delay: 3 } },
          scene: { anim: 'shrug', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_money_guarantor_return', title: 'Người về trong mưa', icon: '☔', age: [25, 85], chainOnly: true,
      text: 'Ba năm sau. Một chiều mưa, {relative} đứng trước cổng nhà bạn, gầy rộc, đen sạm, tay cầm chiếc phong bì nhàu: “Mình xin lỗi. Ba năm làm thuê ở công trường, gom được chút này trả trước. Phần còn lại, sống ngày nào mình trả ngày đó.”',
      scene: { loc: 'home', time: 'dusk', weather: 'rain', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'relative', anim: 'bow', expr: 'sad', say: 'Mình xin lỗi... trả trước chút này.' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Nhận tiền, ôm nhau một cái',
          text: 'Bạn nhận phong bì {money:200000000}, rồi kéo {relative} vào nhà thay bộ đồ khô, nấu nồi cháo nóng. Tiền chưa đủ, nhưng tình thì đủ rồi.',
          effects: { money: 200000000, happy: 8, karma: 4 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { relative: 'cry' } } },
        { label: 'Không nhận, bảo lo cho con cái trước',
          text: 'Bạn đẩy phong bì lại: “Cầm về lo cho mấy đứa nhỏ đi học.” {relative} khóc như một đứa trẻ. Hôm đó bạn nghèo đi, nhưng thấy mình giàu lắm.',
          effects: { karma: 12, happy: 6 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { relative: 'cry' } } },
        { label: 'Nhận tiền rồi đóng cổng',
          text: 'Bạn cầm phong bì, đóng cổng, không nói lời nào. Có những vết nứt không trám lại được bằng tiền.',
          effects: { money: 200000000, happy: -3, karma: -3 },
          scene: { anim: 'angry', fx: 'heartbreak', npcAnim: { relative: 'sad' } } }
      ]
    },

    // ======================= TRUYỆN NGẮN: TIÊU TIỀN =======================
    {
      id: 's_money_luxury', title: 'Hàng hiệu giới hạn', icon: '💎', age: [22, 70], weight: 1, once: false, cooldown: 4,
      req: { minMoney: 500000000 },
      text: 'Bạn ghé cửa hàng đồng hồ sang trọng mặt phố chỉ để thay dây đồng hồ cũ. Cô nhân viên đã rót sẵn ly nước ép, đặt trước mặt bạn chiếc đồng hồ cơ Thụy Sĩ giá {money:450000000}: “Bản giới hạn, cả nước chỉ có ba chiếc thôi ạ.” Trên quầy còn tờ rơi mời lái thử xe sang mui trần.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'think', expr: 'love',
        npcs: [{ role: 'vendor', gender: 'f', age: 27, anim: 'bow', say: 'Bản giới hạn, cả nước chỉ ba chiếc thôi ạ!' }], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Quẹt thẻ chiếc đồng hồ',
          text: 'Bạn quẹt thẻ {money:450000000} nhanh hơn cả lúc trả tiền gửi xe. Cả tuần sau, bạn xắn tay áo cao hơn một chút mỗi khi cầm ly cà phê.',
          effects: { money: -450000000, happy: 9, looks: 4, karma: -1 },
          scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { vendor: 'clap' } } },
        { label: 'Đổi luôn xe sang mui trần', req: { minMoney: 4000000000 },
          text: 'Bạn lái chiếc mui trần màu đỏ giá {money:3800000000} về hẻm, cả xóm ra xem. Vừa lăn bánh đã mất giá cả tỷ, và muốn đậu xe thì phải nhờ hàng xóm dời ba chiếc xe máy.',
          effects: { money: -3800000000, asset: { add: { type: 'car', name: 'Xe sang mui trần', value: 2600000000 } }, happy: 12, looks: 6, karma: -2 },
          scene: { anim: 'cheer', fx: 'stars', npcAnim: { vendor: 'bow' } } },
        { label: 'Mua túi “giống thật 99%” cho oai',
          outcomes: [
            { p: 0.6, text: 'Bạn mua chiếc túi “giống thật 99%” giá {money:3500000} trên chợ mạng. Đi đám cưới ai cũng khen, bạn cười mà mồ hôi rịn trán.',
              effects: { money: -3500000, happy: 4, looks: 2 },
              scene: { anim: 'laugh', fx: 'sweat' } },
            { p: 0.4, text: 'Giữa tiệc cưới, quai túi đứt, lòi ra lớp lót in sai chính tả tên hãng. Cả bàn cố nhịn cười, còn bạn thì không nhịn được đỏ mặt.',
              effects: { money: -3500000, happy: -6, looks: -1 },
              scene: { loc: 'wedding', anim: 'facepalm', fx: 'flash' } }
          ] },
        { label: 'Ngắm thôi, ra quán cơm tấm',
          text: 'Bạn cảm ơn, ra quán cơm tấm đầu hẻm gọi sườn bì chả. {money:450000000} là hơn bảy nghìn đĩa cơm tấm — tính nhẩm xong, bạn thấy mình vừa thắng lớn.',
          effects: { money: -60000, happy: 3, smarts: 2 },
          scene: { anim: 'eat', fx: 'steam', npcAnim: { vendor: 'shrug' } } }
      ]
    },
    {
      id: 's_money_hui_vo', title: 'Dây hụi bể', icon: '🪷', age: [25, 70], weight: 0.8,
      req: { minMoney: 50000000 },
      text: 'Gần nửa đêm, cô Tư chủ hụi đầu hẻm — người quen hai mươi năm — gõ cửa nhà bạn, mắt đỏ hoe: dây hụi bể rồi, mấy người hốt trước đã bỏ trốn, cô không còn tiền trả. Phần của bạn, {money:120000000} góp hai năm trời, coi như mất. “Con đừng báo công an, cô bán nhà trả dần mà...”',
      scene: { loc: 'home', time: 'night', weather: 'rain', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'neighbor', gender: 'f', age: 62, anim: 'cry', say: 'Con đừng báo công an, cô trả dần mà...' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Làm đơn trình báo, đúng luật',
          outcomes: [
            { p: 0.4, text: 'Cô Tư bị khởi tố, nhà bị phát mại chia cho các hụi viên. Bạn nhận lại được 40%, mất {money:72000000}. Mỗi lần đi ngang căn nhà cũ của cô, bạn lại thấy nặng lòng.',
              effects: { money: -72000000, happy: -5 },
              scene: { loc: 'street', anim: 'sad', fx: 'sweat', npcAnim: { neighbor: 'cry' } } },
            { p: 0.6, text: 'Phát mại xong, tiền chỉ đủ trả những người hốt nợ. {money:120000000} của bạn thành “chuyện kể mỗi Tết”.',
              effects: { money: -120000000, happy: -8 },
              scene: { loc: 'street', anim: 'facepalm', fx: 'tears' } }
          ] },
        { label: 'Cho cô trả góp, không làm lớn',
          outcomes: [
            { p: 0.5, text: 'Ba năm, tháng nào cô Tư cũng mang sang ba triệu, chưa trễ một lần. Lần trả cuối, cô mang thêm con gà và rổ trứng.',
              effects: { money: -12000000, karma: 6, happy: 3 },
              scene: { anim: 'hug', fx: 'sparkle', npcAnim: { neighbor: 'bow' } } },
            { p: 0.5, text: 'Được nửa năm, cô Tư dọn đi trong đêm. Căn nhà khóa trái, bạn đứng trước cổng cầm cuốn sổ ghi nợ.',
              effects: { money: -100000000, happy: -8, karma: 2 },
              scene: { loc: 'street', anim: 'sad', fx: 'question' } }
          ] },
        { label: 'Coi như của đi thay người',
          text: 'Bạn thở dài: “Của đi thay người.” Mất {money:120000000}, nhưng bạn không để nó lấy thêm giấc ngủ và sức khỏe của mình.',
          effects: { money: -120000000, happy: -3, karma: 5, health: 1 },
          scene: { anim: 'pray', fx: 'sparkle', npcAnim: { neighbor: 'cry' } } },
        { label: 'Cùng cả xóm đến xiết đồ',
          text: 'Sáng sớm, cả xóm kéo đến nhà cô Tư. Bạn ôm về cái tivi cũ và bộ bàn ghế, quy ra chưa được một phần tư số tiền. Đứa cháu nội của cô đứng nép sau cửa nhìn theo.',
          effects: { money: -90000000, karma: -6, happy: -4 },
          scene: { loc: 'street', time: 'dawn', weather: 'cloudy', anim: 'lift', fx: 'anger', npcAnim: { neighbor: 'cry' } } }
      ]
    },
    {
      id: 's_money_wedding_gift', title: 'Đám cưới ở đảo', icon: '💒', age: [22, 45], weight: 0.9,
      req: { has: ['friend'] },
      text: '{friend} — đứa bạn thân từ thời cởi truồng tắm mưa — cưới ở khu nghỉ dưỡng Phú Quốc và nhờ bạn đứng phù. Vé máy bay, khách sạn, đồ phù đã ngót {money:15000000}. Còn phong bì thì... năm nào bạn khó khăn nhất, chính {friend} đã ôm đến {money:10000000} không cần ai nhắc.',
      scene: { loc: 'wedding', time: 'dusk', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'friend', anim: 'love', say: 'Mày phải đứng phù cho tao đấy nhé!' }, { role: 'crowd', anim: 'clap' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Mừng một cây vàng cho xứng tình',
          text: 'Bạn đặt một lượng vàng vào tay {friend} trước mặt hai họ. {friend} ôm bạn khóc làm trôi cả lớp trang điểm. Tổng thiệt hại {money:100000000}, tổng hạnh phúc không đếm được.',
          effects: { money: -100000000, happy: 8, karma: 3, rel: { friend: 15 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { friend: 'cry', crowd: 'clap' } } },
        { label: 'Mừng 10 triệu, đúng chuẩn bạn thân',
          text: 'Phong bì {money:10000000} cộng chuyến đi, tổng cộng {money:25000000}. Vừa đủ tình, vừa đủ sức, tháng sau ăn mì gói thêm vài bữa.',
          effects: { money: -25000000, happy: 4, rel: { friend: 7 } },
          scene: { anim: 'clap', fx: 'confetti', npcAnim: { friend: 'laugh' } } },
        { label: 'Viện cớ bận, chuyển khoản 2 triệu',
          text: 'Bạn nhắn “bận dự án”, chuyển {money:2000000}. Ảnh cưới lên mạng, chỗ đứng phù là người khác. {friend} thả tim tin nhắn của bạn, chỉ vậy thôi.',
          effects: { money: -2000000, happy: -4, rel: { friend: -14 } },
          scene: { loc: 'home', anim: 'phone', fx: 'heartbreak' } },
        { label: 'Đứng phù và hát tặng bài tự sáng tác',
          outcomes: [
            { p: 0.6, text: 'Bạn ôm đàn hát bài tự viết về mười lăm năm tình bạn. Cô dâu chú rể khóc, hai họ khóc, cả MC cũng khóc. Tốn {money:20000000} mà đáng từng đồng.',
              effects: { money: -20000000, happy: 9, rel: { friend: 14 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { friend: 'cry', crowd: 'clap' } } },
            { p: 0.4, text: 'Bạn hát lạc tông từ câu đầu tới câu cuối. Clip lên TikTok một triệu lượt xem với tiêu đề “người đứng phù hát hại não nhất năm”. {friend} cười lăn, bảo đây là món quà nhớ đời nhất.',
              effects: { money: -20000000, happy: 2, looks: -1, rel: { friend: 8 } },
              scene: { anim: 'sing', fx: 'flash', npcAnim: { friend: 'laugh', crowd: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_money_house_repair', title: 'Đục ra mới thấy', icon: '🔨', age: [28, 80], weight: 1,
      req: { asset: 'house' },
      text: 'Mái thấm dột, tường nứt chân chim, Tết lại sắp đến. Anh thợ báo giá sửa {money:150000000}. Đục được nửa bức tường, anh lắc đầu: “Đục ra mới thấy, đường ống mục hết rồi, phải làm lại cả tầng.”',
      scene: { loc: 'home', time: 'day', weather: 'cloudy', anim: 'facepalm', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'shake', say: 'Đục ra mới thấy, hư hết cả rồi!' }], fx: 'dust', shot: 'close' },
      choices: [
        { label: 'Làm luôn cho đẹp, đón Tết nhà mới',
          text: 'Bạn cắn răng làm lại cả tầng, lát gạch mới, sơn màu kem. Hóa đơn cuối cùng {money:480000000}, gấp ba báo giá. Nhưng đêm giao thừa, cả nhà ngồi trong căn nhà sáng bừng, ai cũng cười.',
          effects: { money: -480000000, happy: 9, health: 2 },
          scene: { anim: 'cheer', fx: 'sparkle', decor: 'tet', time: 'night', npcAnim: { stranger: 'bow' } } },
        { label: 'Chỉ vá chỗ hỏng, giữ ngân sách',
          text: 'Bạn bảo thợ vá tạm chỗ dột, trát lại vết nứt. Tốn {money:160000000}. Nhà chưa đẹp, nhưng mưa đã thôi rơi trong phòng khách.',
          effects: { money: -160000000, happy: 2 },
          scene: { anim: 'nod', fx: 'sweat', npcAnim: { stranger: 'nod' } } },
        { label: 'Tự làm theo video trên mạng',
          outcomes: [
            { p: 0.4, text: 'Sau ba cuối tuần, bạn tự chống thấm, tự sơn, tự thay ống. Chỉ tốn {money:45000000} vật liệu và một bộ quần áo dính sơn vĩnh viễn.',
              effects: { money: -45000000, happy: 7, smarts: 3 },
              scene: { anim: 'lift', fx: 'levelup', npcAnim: { stranger: 'clap' } } },
            { p: 0.6, text: 'Bạn trượt chân từ thang, bong gân cổ chân. Rốt cuộc vẫn phải thuê thợ, tốn {money:230000000} tính cả viện phí.',
              effects: { money: -230000000, health: -10, happy: -5, illness: 'Chấn thương cơ' },
              scene: { loc: 'hospital', anim: 'sick', fx: 'sweat' } }
          ] },
        { label: 'Thuê đội thợ người quen giá rẻ',
          outcomes: [
            { p: 0.5, text: 'Đội thợ người quen làm chậm nhưng chắc, giá mềm. Tổng cộng {money:200000000}, còn được tặng thêm cái kệ dép.',
              effects: { money: -200000000, happy: 5, karma: 1 },
              scene: { anim: 'clap', fx: 'sparkle' } },
            { p: 0.5, text: 'Đội thợ nhận cọc, đục tung nhà ra rồi... biến mất. Bạn sống giữa đống gạch vụn ba tháng rồi thuê đội khác làm lại, tổng thiệt hại {money:250000000}.',
              effects: { money: -250000000, happy: -9, health: -3 },
              scene: { anim: 'angry', fx: 'dust' } }
          ] }
      ]
    },

    // ───────────────────────── NHÀ ĐẤT & MÔI GIỚI ─────────────────────────
    {
      id: 's_re_so_do_gia', title: 'Mảnh đất giá hời', icon: '📜', age: [24, 70], weight: 1.2, once: false, cooldown: 4, req: { minMoney: 3e8 },
      text: 'Một người môi giới nhắn: “Anh/chị ơi, có mảnh đất mặt đường giá rẻ hơn thị trường cả trăm triệu, chủ cần tiền gấp, đặt cọc trong hôm nay là chốt.” Sổ đỏ chụp qua ảnh trông rất đẹp.',
      scene: { loc: 'street', time: 'day', anim: 'phone', expr: 'surprised', npcs: [{ role: 'stranger', anim: 'talk', say: 'Giá này không có lần hai đâu!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Thuê luật sư kiểm tra sổ và quy hoạch (3 triệu)',
          outcomes: [
            { p: 0.7, text: 'Luật sư xác minh sổ hợp lệ, đất không tranh chấp. Bạn mua được mảnh đất đúng giá hời, vài năm sau tăng giá thấy rõ.', effects: { money: 90000000, happy: 4, smarts: 1 }, scene: { loc: 'office', anim: 'cheer', fx: 'money' } },
            { p: 0.3, text: 'Luật sư phát hiện sổ đỏ làm giả và đất nằm trong diện quy hoạch. Tốn 3 triệu nhưng bạn tránh được thảm hoạ cả trăm triệu.', effects: { money: -3000000, happy: 1, smarts: 2, karma: 1 }, scene: { loc: 'office', anim: 'nod', fx: 'idea' } }
          ] },
        { label: 'Chuyển cọc luôn kẻo mất cơ hội',
          outcomes: [
            { p: 0.35, text: 'May mắn, sổ thật, đất sạch. Bạn mua được giá hời và ăn lời nhanh.', effects: { money: 100000000, happy: 5 }, scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.65, text: 'Sổ đỏ là giả, người môi giới chặn số. Số tiền cọc bay sạch, công an ghi nhận hồ sơ nhưng khó đòi lại.', effects: { money: -150000000, happy: -10, smarts: 1 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }
          ] },
        { label: 'Bỏ qua, giá rẻ bất thường thường có vấn đề', text: 'Bạn lắc đầu. Hai tháng sau nghe tin vài người sập bẫy chính mảnh đất đó.', effects: { karma: 1, smarts: 1 }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_re_quy_hoach', title: 'Tin đồn quy hoạch đường mới', icon: '🛣️', age: [25, 65], weight: 1.2, once: false, cooldown: 4, req: { minMoney: 2e8 },
      text: 'Cả quán cà phê xôn xao: sắp có tuyến đường mới chạy qua khu đất ven đô, giá sẽ tăng gấp đôi. Anh bạn quen nói chắc như đinh đóng cột: “Mua sớm là lãi to.”',
      scene: { loc: 'cafe', time: 'day', anim: 'think', npcs: [{ role: 'stranger', gender: 'm', anim: 'talk', say: 'Nghe anh, mua đi!' }, { role: 'crowd', anim: 'talk' }], fx: 'idea', shot: 'wide' },
      choices: [
        { label: 'Mua đất ven đô chờ quy hoạch (200 triệu)',
          outcomes: [
            { p: 0.4, text: 'Tuyến đường được duyệt đúng như tin đồn. Giá đất nhảy vọt, bạn chốt lời thật đậm.', effects: { money: 250000000, happy: 6 }, scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.35, text: 'Tin đồn chỉ là tin đồn. Đất nằm đó nhiều năm không ai mua, tiền bị chôn chặt, bạn sốt ruột mỗi lần nhìn sổ.', effects: { money: -20000000, happy: -4 }, scene: { anim: 'sad', fx: 'sweat' } },
            { p: 0.25, text: 'Khu đất bị treo quy hoạch, không xây không bán được. Bạn bán lỗ để rút vốn.', effects: { money: -80000000, happy: -7 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }
          ] },
        { label: 'Hỏi phòng quy hoạch của quận trước khi quyết', success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn xin được bản đồ quy hoạch chính thức: đất ngoài diện giải toả và có đường vào. Bạn mua có căn cứ và về sau lãi đều.', effects: { money: 120000000, happy: 4, smarts: 2 }, scene: { loc: 'office', anim: 'nod', fx: 'idea' } },
            { text: 'Bạn hỏi mất nửa tháng, cuối cùng người khác đã mua trước. Tiếc nhưng không mất đồng nào.', effects: { happy: -1 }, scene: { anim: 'shrug' } }
          ] },
        { label: 'Không đầu cơ, giữ tiền', text: 'Bạn không chạy theo đám đông. Có người lời, có người cháy túi, bạn ngủ ngon.', effects: { happy: 2 }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_re_sang_ten', title: 'Thủ tục sang tên sổ đỏ', icon: '🏛️', age: [25, 70], weight: 1, once: false, cooldown: 5, req: { minMoney: 1e8 },
      text: 'Bạn vừa mua căn nhà và phải ra phòng công chứng sang tên. Người bên cạnh thì thầm: “Hay ghi giá thấp trong hợp đồng cho đỡ tiền thuế, ai cũng làm thế.”',
      scene: { loc: 'office', time: 'day', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Ghi giá thấp đi, đỡ thuế mà!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Khai đúng giá, đóng đủ thuế phí', text: 'Bạn đóng thuế và lệ phí sang tên theo giá thật, tốn thêm một khoản nhưng hồ sơ sạch sẽ, sau này bán lại hay vay thế chấp đều thuận lợi.', effects: { money: -12000000, karma: 2, happy: 1 }, scene: { loc: 'office', anim: 'nod', fx: 'sparkle' } },
        { label: 'Ghi giá thấp để giảm thuế',
          outcomes: [
            { p: 0.6, text: 'Hồ sơ qua trót lọt, bạn tiết kiệm được khoản thuế kha khá. Nhưng lòng vẫn thấy nhấp nhổm.', effects: { money: 6000000, karma: -3 }, scene: { anim: 'scared' } },
            { p: 0.4, text: 'Cơ quan thuế rà soát, phát hiện giá ghi thấp hơn giá thị trường: bạn bị truy thu thuế và phạt gấp mấy lần.', effects: { money: -45000000, karma: -2, happy: -6 }, scene: { loc: 'office', anim: 'angry', fx: 'sweat' }, tone: 'bad' }
          ] }
      ]
    },
    {
      id: 's_re_nguoi_thue', title: 'Người thuê nhà không trả tiền', icon: '🔑', age: [30, 75], weight: 1, once: false, cooldown: 4, req: { minMoney: 5e8 },
      text: 'Căn nhà bạn cho thuê đã hai tháng liền không thấy chuyển tiền. Gọi điện thì người thuê hẹn hết lần này đến lần khác, nghe nói chị ấy vừa mất việc và đang nuôi con nhỏ.',
      scene: { loc: 'home', time: 'dusk', anim: 'phone', expr: 'angry', npcs: [{ role: 'stranger', gender: 'f', anim: 'sad', say: 'Cho em xin thêm ít hôm…' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Thông cảm, cho khất ba tháng', text: 'Bạn đồng ý. Ba tháng sau chị ấy có việc mới, trả đủ gốc và còn gửi kèm hộp bánh. Quan hệ chủ nhà - người thuê hoá ra cũng ấm áp.', effects: { money: -6000000, karma: 4, happy: 3 }, scene: { anim: 'nod', fx: 'hearts' } },
        { label: 'Đòi nhà ngay, báo chính quyền', text: 'Bạn thu hồi nhà theo đúng hợp đồng. Người thuê dọn đi trong nước mắt. Bạn đúng về mặt pháp lý, nhưng cả tuần sau bạn không yên lòng.', effects: { money: -3000000, karma: -2, happy: -3 }, scene: { anim: 'sad', fx: 'sweat' } },
        { label: 'Thuê dân anh chị đòi nợ', success: { stat: 'health', base: 0.4, scale: 0.3 },
          outcomes: [
            { text: 'Đám đòi nợ doạ nạt mấy hôm, người thuê gom đủ tiền trả. Nhưng bà con khu phố nhìn bạn khác đi, và bạn bị nhắc tên trong nhóm cư dân.', effects: { money: 6000000, karma: -5, happy: -2 }, scene: { anim: 'angry', fx: 'anger' }, tone: 'bad' },
            { text: 'Chuyện loan ra, người thuê tố công an. Bạn bị mời lên làm việc và phạt hành chính vì dùng người đe doạ.', effects: { money: -15000000, karma: -6, happy: -6 }, scene: { loc: 'office', anim: 'sad', fx: 'sweat' }, tone: 'bad' }
          ] }
      ]
    },
    {
      id: 's_re_mg_chot', title: 'Chốt giao dịch căn hộ', icon: '🏢', age: [20, 65], weight: 2, once: false, cooldown: 1, req: { jobId: ['moigioi'] },
      text: 'Một cặp vợ chồng trẻ dẫn bạn xem căn hộ hai phòng ngủ. Họ ưng nhưng chê giá cao, chủ nhà lại nhất quyết không giảm. Hoa hồng của bạn nằm ở cuộc thương lượng này.',
      scene: { loc: 'home', time: 'day', anim: 'talk', npcs: [{ role: 'stranger', gender: 'f', anim: 'think', say: 'Giá này em hơi ngợp…' }, { role: 'stranger', gender: 'm', anim: 'idle' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Đàm phán hai bên để chốt giá', mini: 'haggle', success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn khéo léo kéo hai bên về mức giá chung. Giao dịch thành công, hoa hồng về đúng hạn và cặp vợ chồng giới thiệu thêm bạn bè.', effects: { money: 30000000, perf: 14, happy: 5 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Hai bên không thống nhất, khách đi xem căn khác và bạn mất hoa hồng.', effects: { perf: -6, happy: -3 }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Nói quá về căn hộ để khách mua nhanh',
          outcomes: [
            { p: 0.5, text: 'Khách tin lời bạn, ký hợp đồng ngay. Bạn nhận hoa hồng nhanh nhưng lòng không yên về việc đã nói quá.', effects: { money: 30000000, karma: -3, perf: 8 }, scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.5, text: 'Sau khi dọn vào, khách phát hiện căn hộ thiếu nước vào mùa khô và quay lại làm ầm lên. Công ty phạt bạn.', effects: { money: -20000000, karma: -3, perf: -12, happy: -5 }, scene: { anim: 'angry', fx: 'anger' }, tone: 'bad' }
          ] },
        { label: 'Nói thật ưu nhược điểm, để khách tự quyết', text: 'Khách cảm ơn sự thẳng thắn và quay lại mua căn khác với giá hợp lý. Bạn mất một hoa hồng nhưng có thêm hai khách quen.', effects: { money: 12000000, perf: 7, karma: 3, happy: 3 }, scene: { anim: 'nod', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_re_mg_huycoc', title: 'Khách huỷ cọc phút chót', icon: '📉', age: [20, 65], weight: 1.4, once: false, cooldown: 2, req: { jobId: ['moigioi'] },
      text: 'Khách đã đặt cọc căn nhà, hai bên chuẩn bị ký hợp đồng thì khách nhắn: “Em đổi ý, em mua căn khác rẻ hơn.” Chủ nhà đòi bạn đền công vì đã từ chối nhiều khách khác.',
      scene: { loc: 'office', time: 'day', anim: 'sad', npcs: [{ role: 'stranger', anim: 'angry', say: 'Anh làm ăn kiểu gì vậy!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Nhận lỗi, đền một phần cho chủ nhà', text: 'Bạn đền 5 triệu để giữ uy tín. Chủ nhà dịu lại và tiếp tục giao nhà cho bạn rao bán.', effects: { money: -5000000, perf: 4, karma: 1 }, scene: { anim: 'bow', fx: 'sweat' } },
        { label: 'Thuyết phục chủ nhà chờ khách khác', success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chăm chỉ tìm khách mới, một tuần sau có người mua đúng giá. Chủ nhà phục bạn.', effects: { money: 18000000, perf: 10, happy: 3 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Chủ nhà mất kiên nhẫn, rút luôn hợp đồng độc quyền. Bạn mất cả khách lẫn hoa hồng.', effects: { perf: -8, happy: -4 }, scene: { anim: 'sad' } }
          ] }
      ]
    },
    // ───────────────────────── GAME & ESPORT ─────────────────────────
    {
      id: 'a_game_leo_rank', title: 'Leo rank xuyên đêm', icon: '🎮', age: [12, 35], weight: 1.4, once: false, cooldown: 2,
      text: 'Bạn đang kẹt ở nấc rank cuối trước khi lên hạng cao nhất mùa này. Đã gần hai giờ sáng, đồng đội chat “thêm một trận cuối” đến lần thứ năm. Chuột đã nóng tay.',
      scene: { loc: 'bedroom', time: 'night', anim: 'gamepad', expr: 'angry', npcs: [{ role: 'stranger', anim: 'gamepad', say: 'Một trận nữa thôi!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Tập trung vào, đánh nốt trận quyết định', mini: 'clutch', success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chơi cực tập trung và bứt tốc cuối trận, lên hạng cao nhất mùa! Lũ bạn ném cả loạt biểu tượng cảm xúc chúc mừng.', effects: { happy: 7, smarts: 1, flag: 'game_rank_top' }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn mất tập trung vì thiếu ngủ, thua sát nút và tụt hẳn mấy bậc. Cả đêm công cốc, sáng mắt thâm như gấu trúc.', effects: { happy: -5, health: -3 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }
          ] },
        { label: 'Đi ngủ, mai chơi tiếp', text: 'Bạn tắt máy đi ngủ. Sáng hôm sau đầu óc tỉnh táo, bạn lên hạng ngay trận đầu tiên. Ngủ đủ đúng là buff mạnh nhất.', effects: { health: 3, happy: 3, smarts: 1 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 's_es_giai', title: 'Giải đấu mùa này', icon: '🏆', age: [16, 32], weight: 2.2, once: false, cooldown: 1, req: { jobId: ['esports'] },
      text: 'Giải đấu quốc gia mở cửa, đội bạn lọt vào vòng chung kết. Sân khấu rực đèn, khán giả hò reo, màn hình lớn chiếu thẳng mặt từng tuyển thủ. Tay bạn hơi run.',
      scene: { loc: 'studio', time: 'night', anim: 'gamepad', expr: 'surprised', npcs: [{ role: 'crowd', anim: 'cheer' }, { role: 'stranger', anim: 'gamepad', say: 'Bình tĩnh nhé!' }], fx: 'stars', shot: 'dramatic' },
      choices: [
        { label: 'Thi đấu hết mình', mini: 'clutch', success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chơi xuất thần, đội thắng chung kết! Chiếc cúp được nâng lên giữa tràng pháo tay, tiền thưởng và hợp đồng tài trợ đổ về.', effects: { money: 80000000, perf: 18, happy: 8, flag: 'es_champion' }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Đội thua trận cuối sát nút. Bạn ôm đầu ngồi lặng trên sân khấu, nhưng khán giả vẫn vỗ tay động viên.', effects: { money: 10000000, perf: -3, happy: -4 }, scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Đá an toàn, hỗ trợ đồng đội', text: 'Bạn nhường nổi bật cho đồng đội, đội vào được top 3. Không phải ngôi sao, nhưng ban huấn luyện đánh giá cao tinh thần đồng đội.', effects: { money: 25000000, perf: 6, happy: 3 }, scene: { anim: 'clap', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_es_hack', title: 'Lời rủ dùng phần mềm hack', icon: '🕹️', age: [16, 32], weight: 1.2, once: false, cooldown: 3, req: { jobId: ['esports'] },
      text: 'Một tuyển thủ khác nhắn riêng: “Bên anh có công cụ hỗ trợ ngắm bắn, không ai phát hiện đâu, giải lớn sắp tới rồi, em dùng thử không?” Tiền thưởng chung kết là con số bạn mơ ước.',
      scene: { loc: 'studio', time: 'night', anim: 'phone', expr: 'surprised', npcs: [{ role: 'stranger', anim: 'talk', say: 'Không ai biết đâu!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Dùng thử cho có lợi thế',
          outcomes: [
            { p: 0.4, text: 'Bạn thắng giải nhưng trong lòng không vui. Phần thưởng đến tay mà bạn cứ nhìn qua vai mỗi khi có người lạ tới gần.', effects: { money: 60000000, karma: -6, happy: -3, perf: 10 }, scene: { anim: 'scared', fx: 'money' }, tone: 'bad' },
            { p: 0.6, text: 'Hệ thống chống gian lận phát hiện. Bạn bị cấm thi đấu, mất hợp đồng và tiếng xấu lan khắp cộng đồng game thủ.', effects: { money: -20000000, karma: -6, happy: -10, perf: -30 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }
          ] },
        { label: 'Từ chối và báo ban tổ chức', text: 'Bạn chụp lại tin nhắn gửi ban tổ chức. Người kia bị loại khỏi giải, bạn được khen là tuyển thủ đáng tin. Một số người gọi bạn là “mách lẻo”, nhưng lòng bạn sạch sẽ.', effects: { karma: 6, happy: 3, perf: 6 }, scene: { anim: 'nod', fx: 'stars' } },
        { label: 'Từ chối, im lặng', text: 'Bạn xoá tin nhắn và thi đấu bằng thực lực. Không thắng lớn, nhưng không phải giấu giếm điều gì.', effects: { karma: 2, happy: 2 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_es_stream', title: 'Lên sóng stream game', icon: '📺', age: [16, 34], weight: 1.4, once: false, cooldown: 3, req: { jobId: ['esports'] },
      text: 'Đội yêu cầu bạn stream một buổi để kéo thêm khán giả cho mùa giải. Khung chat chạy vun vút, người xem đòi bạn chơi thử “tướng khó nhất”, người khác lại đòi bạn xin lỗi vì lần thua hôm trước.',
      scene: { loc: 'studio', time: 'night', anim: 'gamepad', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'music', shot: 'close' },
      choices: [
        { label: 'Chơi vui vẻ, đùa với người xem', text: 'Bạn pha trò suốt buổi, khán giả thích thú. Lượng người theo dõi tăng vọt, nhà tài trợ gửi lời mời hợp tác.', effects: { money: 15000000, happy: 5, looks: 1 }, scene: { anim: 'laugh', fx: 'hearts' } },
        { label: 'Cãi lại antifan trên sóng', outcomes: [
            { p: 0.4, text: 'Bạn đáp trả đanh thép và được fan cổ vũ, view tăng vọt.', effects: { money: 8000000, happy: 2 }, scene: { anim: 'angry', fx: 'stars' } },
            { p: 0.6, text: 'Đoạn clip bạn mất bình tĩnh bị cắt ra lan khắp mạng. Nhà tài trợ gạch tên, bạn bị đội nhắc nhở.', effects: { money: -10000000, happy: -6, perf: -8 }, scene: { anim: 'angry', fx: 'sweat' }, tone: 'bad' }
          ] }
      ]
    }
  );
})();
