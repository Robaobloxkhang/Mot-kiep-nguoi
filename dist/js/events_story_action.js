/* Một Kiếp Người — tình huống hành động: mỗi lựa chọn có `mini` sẽ mở minigame tương ứng (js/minigames.js)
   mini: fight (foe: dao/vo/say/gang/danAnh) · chase · drive · keeper · swim · interview · cook · stock · love · haggle · cpr · cards · sprint */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= BÓNG RỔ (mini: hoops) =======================
    {
      id: 's_act_ro_3x3', title: 'Kèo bóng rổ 3x3 ngoài công viên', icon: '🏀', age: [13, 40], weight: 1.1,
      text: 'Chiều cuối tuần, sân bóng rổ công viên đông nghịt. Một nhóm thanh niên đang thiếu người, gã đội trưởng búng quả bóng về phía bạn: “Vào chơi không? Đội thua bao trà sữa cả sân!”',
      scene: { loc: 'court', time: 'day', anim: 'dribble', npcs: [{ role: 'stranger', gender: 'm', anim: 'dribble', say: 'Vào đi, thiếu một người!' }, { role: 'friend', anim: 'clap' }], fx: 'sparkle' },
      choices: [
        { label: 'Vào sân, ném vài quả ba điểm cho biết tay', mini: 'hoops',
          success: { stat: 'health', base: 0.2, scale: 0.55 },
          outcomes: [
            { text: 'Ba quả ba điểm liên tiếp, quả nào cũng “swish” không chạm vành. Cả sân hú hét, đội bên kia lủi thủi đi mua trà sữa. Có người còn xin số bạn để rủ đá kèo tuần sau.', effects: { happy: 8, health: 3, looks: 2, flag: 'ro_3x3_thang' }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn ném quả nào trượt quả đó, có quả còn bay ra ngoài hàng rào. Đội thua, bạn móc ví bao trà sữa cho tám người.', effects: { happy: -3, health: 2, money: -350000 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Ngồi ngoài cổ vũ thôi',
          text: 'Bạn ngồi ghế đá xem, hò hét theo từng pha úp rổ. Vui, nhưng hơi tiếc vì không được chạm bóng.',
          effects: { happy: 2 }, scene: { anim: 'clap' } }
      ]
    },
    {
      id: 's_act_ro_tryout', title: 'Buổi thử việc đội bóng rổ trường', icon: '🏀', age: [11, 18], weight: 1,
      text: 'Đội bóng rổ của trường tuyển thành viên. Thầy thể dục cầm bảng ghi điểm, mỗi người được ném sáu quả từ các vị trí khác nhau. Mấy đứa cao kều đứng xếp hàng trước bạn.',
      scene: { loc: 'court', time: 'day', anim: 'idle', npcs: [{ role: 'teacher', anim: 'idle', say: 'Người tiếp theo!' }, { role: 'classmate', anim: 'clap' }] },
      choices: [
        { label: 'Bước lên vạch ném', mini: 'hoops',
          success: { stat: 'health', base: 0.2, scale: 0.6 },
          outcomes: [
            { text: 'Thầy gật gù ghi tên bạn vào danh sách đội tuyển. Từ giờ chiều nào cũng phải ở lại tập, nhưng bạn sướng rơn.', effects: { happy: 8, health: 4, flag: 'doi_ro_truong' }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Thầy vỗ vai: “Năm sau thử lại nhé, em cần tập thêm.” Bạn về nhà ném bóng vào sọt rác cả tối.', effects: { happy: -5, health: 1 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Thôi, mình lùn quá',
          text: 'Bạn rút lui khỏi hàng. Về sau xem đội trường thi đấu, bạn hơi tiếc.', effects: { happy: -2 }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_job_bongro_buzzer', title: 'Còn 3 giây, đội thua 2 điểm', icon: '⏱️', age: [17, 36], weight: 1.6,
      req: { jobId: ['bongro'] },
      text: 'Trận bán kết VBA. Đội bạn kém hai điểm, đồng hồ còn đúng ba giây. HLV vạch chiến thuật, đồng đội chuyền bóng cho bạn ở góc ba điểm. Cả nhà thi đấu đứng bật dậy.',
      scene: { loc: 'court', time: 'night', anim: 'dribble', npcs: [{ role: 'coworker', anim: 'scared' }, { role: 'crowd', anim: 'cheer' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Ném ba điểm, thắng hoặc thua', mini: 'hoops',
          success: { stat: 'health', base: 0.15, scale: 0.55 },
          outcomes: [
            { text: 'Bóng rời tay đúng lúc còi kết thúc vang lên… và rơi gọn vào rổ! Cả đội đè bạn xuống sàn ăn mừng. Clip “buzzer beater” của bạn lên top thịnh hành.', effects: { happy: 14, looks: 6, money: 50000000, flag: 'ro_buzzer' }, scene: { anim: 'cheer', fx: 'confetti', npcAnim: { crowd: 'cheer', coworker: 'hug' } } },
            { text: 'Bóng xoay một vòng trên vành rồi bật ra. Đội bạn thua. Bạn ngồi gục trên sàn rất lâu sau khi khán giả đã về.', effects: { happy: -10 }, scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Lên rổ ăn chắc 2 điểm, kéo hiệp phụ', mini: 'hoops',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đột phá, lên rổ thành công. Trận đấu vào hiệp phụ, và đội bạn thắng nhờ thể lực tốt hơn. Không phải pha để đời, nhưng đúng là quyết định khôn.', effects: { happy: 9, money: 20000000 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Trung phong đối thủ bật lên chắn bóng của bạn văng ra ngoài. Hết giờ. Thua.', effects: { happy: -8 }, scene: { anim: 'sad' } }
          ] }
      ]
    },
    {
      id: 's_job_bongro_phat', title: 'Hai quả ném phạt giữa tiếng la ó', icon: '🎯', age: [17, 36], weight: 1.2,
      req: { jobId: ['bongro'] },
      text: 'Sân khách, cổ động viên đội nhà vẫy khăn, gõ trống, la ó ầm ĩ sau rổ để làm bạn mất tập trung. Hai quả ném phạt, hòa điểm.',
      scene: { loc: 'court', time: 'night', anim: 'idle', npcs: [{ role: 'crowd', anim: 'angry' }], fx: 'sweat' },
      choices: [
        { label: 'Hít sâu, ném', mini: 'hoops',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Hai quả, hai lần lưới rung. Cả sân khách im phăng phắc. Bạn đưa ngón tay lên môi: suỵt.', effects: { happy: 8, looks: 3 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Quả đầu chạm vành, quả sau dội bảng. Tiếng la ó còn to hơn.', effects: { happy: -6 }, scene: { anim: 'facepalm' } }
          ] }
      ]
    },
    // ======================= ĐÁNH NHAU =======================
    {
      id: 's_act_cuop_dem', title: 'Bị chặn đường lúc nửa đêm', icon: '🔪', age: [16, 65], weight: 1.4,
      text: 'Gần nửa đêm, bạn đi về qua con hẻm vắng. Một gã bịt khẩu trang bước ra chặn đầu, tay lăm lăm con dao bấm: “Điện thoại, ví. Nhanh!”',
      scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Đưa đây, nhanh!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Liều đánh trả', mini: 'fight', foe: 'dao',
          success: { stat: 'health', base: 0.1, scale: 0.55 },
          outcomes: [
            { text: 'Bạn gạt tay cầm dao, tung một cú đấm trúng cằm. Gã loạng choạng rồi bỏ chạy, đánh rơi cả con dao. Công an phường tới lấy lời khai, khen bạn gan dạ.', effects: { happy: 6, karma: 3, health: -2 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Lưỡi dao sượt qua cánh tay bạn. Gã giật được ví rồi biến mất. Bạn phải khâu bảy mũi ở trạm y tế.', effects: { health: -14, happy: -8, money: -3000000 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Bỏ chạy thục mạng ra đường lớn', mini: 'sprint',
          success: { stat: 'health', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn chạy một mạch ra đường lớn sáng đèn, lao vào quán phở còn mở. Gã kia không dám đuổi theo. Tim đập như trống trận.', effects: { happy: -2, health: 1 }, scene: { anim: 'run', fx: 'sweat' } },
            { text: 'Bạn vấp ổ gà ngã sõng soài. Gã đuổi kịp, lục lấy ví rồi đạp thêm một cái cho “nhớ đời”.', effects: { health: -8, happy: -8, money: -2500000 }, scene: { anim: 'fall', fx: 'dust' } }
          ] },
        { label: 'Đưa ví, giữ lấy mạng',
          text: 'Bạn đưa ví và điện thoại. Gã chạy mất. Mất tiền, mất máy, nhưng người không sao. Của đi thay người.',
          effects: { money: -6000000, happy: -6 }, scene: { anim: 'sad', fx: 'tears' } }
      ]
    },
    {
      id: 's_act_nhau_quan', title: 'Ẩu đả ở quán nhậu', icon: '🍺', age: [18, 60], weight: 1.2,
      text: 'Bàn bên cạnh say khướt, một gã to con đi ngang làm đổ cả bia lên người bạn rồi quay lại sừng sộ: “Nhìn cái gì? Muốn ăn đòn hả?”',
      scene: { loc: 'street', time: 'night', anim: 'angry', npcs: [{ role: 'stranger', gender: 'm', anim: 'angry', say: 'Nhìn gì mà nhìn!' }, { role: 'friend', anim: 'scared' }], fx: 'anger' },
      choices: [
        { label: 'Đứng dậy, cho hắn một bài học', mini: 'fight', foe: 'say',
          success: { stat: 'health', base: 0.2, scale: 0.55 },
          outcomes: [
            { text: 'Gã say lao vào, bạn né rồi quật hắn ngã dúi xuống ghế nhựa. Cả quán vỗ tay. Chủ quán miễn luôn tiền bàn của bạn.', effects: { happy: 6, karma: -1 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Gã say mà đấm như búa tạ. Bạn ăn trọn một cú vào mắt, sáng hôm sau đi làm với con mắt tím bầm.', effects: { health: -8, happy: -6, looks: -2 }, scene: { anim: 'sick', fx: 'dust' } }
          ] },
        { label: 'Xin lỗi cho qua, đổi bàn',
          text: 'Bạn cười xòa xin lỗi dù không phải lỗi mình. Gã lẩm bẩm vài câu rồi bỏ đi. Đêm đó bạn về nhà nguyên vẹn.',
          effects: { happy: -2, karma: 2 }, scene: { anim: 'bow' } },
        { label: 'Gọi bảo vệ quán',
          text: 'Hai anh bảo vệ tới kéo gã ra ngoài. Bàn bạn được tặng đĩa lạc rang “xin lỗi quý khách”.',
          effects: { happy: 1 }, scene: { anim: 'nod', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_act_bao_ve_ny', title: 'Bảo vệ người yêu', icon: '🛡️', age: [16, 45], weight: 1.2,
      req: { has: ['partner'] },
      text: 'Đi dạo phố đêm, ba thanh niên choai choai huýt sáo, buông lời trêu ghẹo {partner} rồi một tên giơ tay định kéo tay {partner}.',
      scene: { loc: 'street', time: 'night', anim: 'angry', npcs: [{ role: 'partner', anim: 'scared' }, { role: 'thug', anim: 'laugh', say: 'Đi với anh không em?' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Đứng chắn trước, động tay là đánh', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.15, scale: 0.55 },
          outcomes: [
            { text: 'Bạn hất tay tên kia ra, đỡ một cú rồi trả lại một cú đá. Cả bọn bỏ chạy tán loạn. {partner} ôm chặt lấy bạn, mắt long lanh.', effects: { happy: 8, rel: { partner: 14 } }, scene: { anim: 'hug', fx: 'hearts' } },
            { text: 'Một chọi ba, bạn bị đánh ngã. Người đi đường hô hoán bọn kia mới chạy. {partner} khóc, đưa bạn đi băng bó, thương bạn hơn bao giờ hết.', effects: { health: -10, happy: -3, rel: { partner: 8 } }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Kéo {partner} đi chỗ khác',
          text: 'Bạn nắm tay {partner} rảo bước sang đường đông người. Bọn kia cười hô hố phía sau. {partner} im lặng suốt quãng đường về.',
          effects: { happy: -3, rel: { partner: -3 } }, scene: { anim: 'walk' } }
      ]
    },
    {
      id: 's_act_dan_anh', title: 'Đàn anh chặn ở nhà xe', icon: '😠', age: [11, 17], weight: 1.4,
      req: { school: true },
      text: 'Tan học, hai đàn anh lớp trên chặn bạn ở nhà xe: “Mỗi tuần nộp 50 nghìn tiền ‘bảo kê’. Không thì liệu hồn.”',
      scene: { loc: 'school', time: 'dusk', anim: 'scared', npcs: [{ role: 'classmate', gender: 'm', anim: 'angry', say: 'Nộp tiền đây!' }], fx: 'anger' },
      choices: [
        { label: 'Đánh trả, không nộp đồng nào', mini: 'fight', foe: 'danAnh',
          success: { stat: 'health', base: 0.15, scale: 0.55 },
          outcomes: [
            { text: 'Bạn đẩy ngã tên đầu sỏ xuống đống xe đạp. Từ hôm đó cả hai tránh mặt bạn. Mấy đứa cùng lớp nhìn bạn đầy nể phục.', effects: { happy: 7, karma: 1 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn bị đấm chảy máu mũi, cặp sách bị vứt xuống mương. Về nhà mẹ hỏi, bạn nói dối là ngã xe.', effects: { health: -6, happy: -8 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Mách thầy giám thị',
          text: 'Thầy giám thị mời phụ huynh hai đàn anh lên làm việc. Bạn bị gọi là “đồ mách lẻo” một thời gian, nhưng không ai dám vòi tiền nữa.',
          effects: { happy: -1, karma: 2 }, scene: { anim: 'talk', npcs: [{ role: 'teacher', anim: 'point' }] } },
        { label: 'Nộp tiền cho yên chuyện',
          text: 'Bạn nhịn ăn sáng để nộp “phí bảo kê”. Cứ thế gần hết học kỳ.',
          effects: { happy: -6, health: -2, money: -500000 }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_act_vo_dai', title: 'Võ đài ngầm', icon: '🥊', age: [18, 40], weight: 0.8,
      req: { minStat: { health: 60 } },
      text: 'Một người quen dẫn bạn tới tầng hầm một quán bar. Ở đó có võ đài ngầm, ai thắng một trận được {money:20000000}. “Mày to khỏe thế, lên thử đi!”',
      scene: { loc: 'ring', time: 'night', anim: 'box', npcs: [{ role: 'crowd', anim: 'cheer' }, { role: 'thug', anim: 'box', say: 'Lên đây!' }], fx: 'exclaim' },
      choices: [
        { label: 'Lên đài một trận', mini: 'fight', foe: 'vo',
          success: { stat: 'health', base: 0.0, scale: 0.6 },
          outcomes: [
            { text: 'Hiệp hai, bạn tung cú móc trái làm đối thủ đổ gục. Khán giả gào thét. Bạn cầm cọc tiền, tay vẫn còn run.', effects: { money: 20000000, happy: 8, health: -4, karma: -2 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Đối thủ là dân võ thật. Bạn bị knock-out sau hai phút, gãy sống mũi, nằm viện một tuần.', effects: { health: -16, happy: -6, illness: 'chanthuong' }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Đứng xem rồi về',
          text: 'Bạn xem vài trận, thấy máu me be bét thì lặng lẽ về. Có những đồng tiền không đáng để đổi.',
          effects: { karma: 1 }, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_act_trom_nha', title: 'Trộm đột nhập lúc 2 giờ sáng', icon: '🦹', age: [22, 75], weight: 1,
      text: 'Bạn tỉnh giấc vì tiếng lạch cạch dưới nhà. Một bóng đen đang cạy tủ, cạnh đó là cái túi đã nhét đầy đồ.',
      scene: { loc: 'home', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thief', anim: 'walk' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Vớ cây gậy, xông xuống', mini: 'fight',
          success: { stat: 'health', base: 0.15, scale: 0.55 },
          outcomes: [
            { text: 'Bạn quật trúng tay tên trộm, hắn đánh rơi túi đồ, phá cửa sau chạy mất. Không mất món gì. Cả xóm sáng ra kéo sang hỏi chuyện.', effects: { happy: 6, karma: 2 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Tên trộm khỏe hơn bạn tưởng. Hắn xô bạn ngã đập đầu vào cạnh bàn rồi ôm túi đồ chạy mất.', effects: { health: -10, money: -8000000, happy: -6 }, scene: { anim: 'fall', fx: 'dust' } }
          ] },
        { label: 'Bật hết đèn, la thật to',
          outcomes: [
            { p: 0.6, text: 'Đèn bật sáng, bạn hét “Trộm!”. Tên trộm hoảng hốt bỏ chạy tay không.', effects: { happy: 2 }, scene: { anim: 'point', fx: 'exclaim' } },
            { p: 0.4, text: 'Tên trộm vơ vội túi đồ rồi bỏ chạy. Bạn mất cái laptop và ít tiền mặt.', effects: { money: -6000000, happy: -4 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Nằm im, gọi 113',
          text: 'Bạn nín thở gọi 113. Công an tới thì tên trộm đã cuỗm đồ đi mất, nhưng camera nhà hàng xóm ghi được mặt hắn.',
          effects: { money: -5000000, happy: -3 }, scene: { anim: 'phone', npcs: [{ role: 'police', anim: 'talk' }] } }
      ]
    },
    {
      id: 's_act_tranh_dat', title: 'Tranh chấp ranh giới đất', icon: '🧱', age: [30, 70], weight: 0.9,
      req: { asset: 'house' },
      text: 'Nhà hàng xóm xây tường lấn sang đất nhà bạn nửa mét. Bạn sang nói chuyện thì ông ta gọi thêm hai đứa cháu xăm trổ ra đứng khoanh tay.',
      scene: { loc: 'home', anim: 'angry', npcs: [{ role: 'neighbor', gender: 'm', anim: 'angry', say: 'Đất của tôi!' }, { role: 'thug', anim: 'angry' }], fx: 'anger' },
      choices: [
        { label: 'Không lùi bước, chúng động tay thì đánh', mini: 'fight', foe: 'gang',
          success: { stat: 'health', base: 0.1, scale: 0.5 },
          outcomes: [
            { text: 'Tên cháu xông vào, bạn quật ngã hắn trước mặt cả xóm. Ông hàng xóm chột dạ, hôm sau cho thợ đập bức tường lùi về.', effects: { happy: 5, karma: -2 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn bị đánh hội đồng, phải đi bệnh viện. Vụ việc lên tới phường, cả hai bên bị phạt vì gây rối.', effects: { health: -12, happy: -6, money: -3000000 }, scene: { loc: 'hospital', anim: 'sick' } }
          ] },
        { label: 'Mời tổ hòa giải và địa chính',
          text: 'Cán bộ địa chính đo lại, xác nhận tường lấn đất. Mất ba tháng giấy tờ, nhưng nhà bạn lấy lại đủ nửa mét đất.',
          effects: { happy: 2, karma: 3 }, scene: { anim: 'talk', npcs: [{ role: 'police', anim: 'nod' }] } }
      ]
    },

    // ======================= RƯỢT ĐUỔI & LÁI XE =======================
    {
      id: 's_act_giat_tui', title: 'Cướp giật giữa phố', icon: '👜', age: [16, 60], weight: 1.3,
      text: 'Một chiếc xe máy hai người áp sát, tên ngồi sau giật phăng túi xách của một chị đi đường rồi rồ ga phóng đi. Chị ấy ngã xuống lề đường kêu cứu.',
      scene: { loc: 'street', anim: 'scared', expr: 'surprised', npcs: [{ role: 'stranger', gender: 'f', anim: 'fall', say: 'Cướp! Cướp!' }, { role: 'thief', anim: 'drive' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Rồ ga xe mình đuổi theo', mini: 'drive', req: { asset: 'motorbike' },
          success: { stat: 'health', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Bạn bám riết qua ba ngã tư, ép xe tên cướp vào lề. Người dân xúm lại giữ cả hai tên. Chị kia nhận lại túi, cảm ơn bạn rối rít.', effects: { karma: 10, happy: 8 }, scene: { anim: 'cheer', fx: 'stars', npcs: [{ role: 'police', anim: 'clap' }] } },
            { text: 'Bạn ôm cua quá gấp, trượt ngã. Xe cướp mất hút. Bạn ngồi bệt bên đường, đầu gối rớm máu.', effects: { health: -8, happy: -4, karma: 3 }, scene: { anim: 'fall', fx: 'dust' } }
          ] },
        { label: 'Đỡ chị ấy dậy, chạy bộ đuổi theo', mini: 'chase',
          success: { stat: 'health', base: 0.1, scale: 0.5 },
          outcomes: [
            { text: 'Xe cướp kẹt ở đèn đỏ, bạn chạy tới túm được quai túi giật lại. Hai tên hoảng hốt bỏ chạy. Cả phố vỗ tay.', effects: { karma: 9, happy: 7, health: 1 }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn chạy tới hụt hơi, chiếc xe đã mất hút. Ít ra bạn ghi lại được nửa biển số cho công an.', effects: { karma: 4, health: -1 }, scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Gọi 113, ở lại chăm chị ấy',
          text: 'Bạn gọi công an, đưa chị ấy vào quán nước ngồi nghỉ. Túi thì mất, nhưng chị ấy nắm tay bạn: “May mà có em.”',
          effects: { karma: 5, happy: 2 }, scene: { anim: 'phone', fx: 'hearts' } }
      ]
    },
    {
      id: 's_act_cs_truy', title: 'Truy bắt đối tượng', icon: '🚨', age: [20, 60], weight: 2,
      req: { jobId: ['canhsat'] },
      text: 'Đang tuần tra, bạn phát hiện đối tượng truy nã ở chợ đêm. Hắn nhận ra bạn, hất đổ sạp trái cây rồi bỏ chạy vào mê cung hẻm nhỏ.',
      scene: { loc: 'market', time: 'night', anim: 'run', npcs: [{ role: 'thief', anim: 'run' }, { role: 'vendor', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đuổi bộ qua các con hẻm', mini: 'chase',
          success: { stat: 'health', base: 0.2, scale: 0.55 },
          outcomes: [
            { text: 'Bạn vượt qua hai hàng rào, quật ngã đối tượng ở cuối hẻm. Trên người hắn có cả túi ma túy. Bạn được đề nghị khen thưởng.', effects: { perf: 12, karma: 5, happy: 8 }, scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Đối tượng thông thạo đường hẻm hơn bạn. Hắn trốn thoát, bạn bị trưởng đồn nhắc nhở.', effects: { perf: -5, happy: -4 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Lên xe chặn đầu ở ngã ba', mini: 'drive',
          success: { stat: 'smarts', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đoán đúng lối ra, xe đặc nhiệm đỗ chắn ngay đầu hẻm. Đối tượng lao ra là vừa “tự nộp mạng”.', effects: { perf: 12, happy: 7 }, scene: { anim: 'point', fx: 'levelup' } },
            { text: 'Xe kẹt giữa dòng người đi chợ đêm. Khi bạn tới nơi thì đối tượng đã mất hút.', effects: { perf: -4, happy: -3 }, scene: { anim: 'facepalm' } }
          ] }
      ]
    },
    {
      id: 's_act_bang_lai', title: 'Thi bằng lái ô tô', icon: '🚗', age: [18, 45], weight: 1.5,
      req: { notFlag: 'bang_lai_oto', minMoney: 15000000 },
      text: 'Hôm nay thi sát hạch bằng B. Phần lý thuyết bạn đã qua, giờ tới sa hình: ghép ngang, dừng dốc, rồi chạy đường trường. Thầy dạy lái dặn: “Bình tĩnh là đỗ.”',
      scene: { loc: 'street', anim: 'drive', npcs: [{ role: 'teacher', gender: 'm', anim: 'point', say: 'Bình tĩnh!' }], fx: 'sweat' },
      choices: [
        { label: 'Vào thi, tay chắc vô lăng', mini: 'drive',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Ghép xe gọn, dừng dốc không trôi một phân. Màn hình báo “ĐẠT”. Bạn cầm tấm bằng lái mới tinh, chụp ảnh khoe cả nhà.', effects: { happy: 8, money: -8000000, flag: 'bang_lai_oto' }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn đè vạch ở bài ghép ngang, rớt ngay vòng sa hình. Hẹn thi lại, mất thêm tiền lệ phí.', effects: { happy: -5, money: -9000000 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Hoãn thi, học thêm ít buổi',
          text: 'Bạn xin hoãn, học thêm ba buổi với thầy. Lần sau chắc tay hơn.',
          effects: { money: -2000000 }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_act_ve_tet_xe', title: 'Phóng xe về quê ăn Tết', icon: '🛵', age: [18, 45], weight: 1,
      req: { asset: 'motorbike' },
      text: 'Chiều 29 Tết, quốc lộ đặc kín xe. Còn hơn trăm cây số mới về tới nhà, mẹ gọi điện hỏi mãi: “Bao giờ con về tới?”',
      scene: { loc: 'street', time: 'dusk', anim: 'drive', npcs: [{ role: 'crowd', anim: 'drive' }], fx: 'dust' },
      choices: [
        { label: 'Lách nhanh cho kịp bữa tất niên', mini: 'drive',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn về tới cổng đúng lúc mẹ bày mâm. Cả nhà reo lên. Bữa tất niên ấm hơn mọi năm.', effects: { happy: 9, rel: { mother: 6 } }, scene: { loc: 'home', anim: 'hug', fx: 'hearts', npcs: [{ role: 'mother', anim: 'hug' }] } },
            { text: 'Bạn quệt phải đuôi xe khách, ngã trầy cả tay chân. Về nhà muộn, mẹ vừa bôi thuốc vừa mắng.', effects: { health: -9, happy: -3, money: -1500000 }, scene: { loc: 'home', anim: 'sick', npcs: [{ role: 'mother', anim: 'angry' }] } }
          ] },
        { label: 'Đi chậm, tới muộn cũng được',
          text: 'Bạn đi chậm, nghỉ hai trạm dừng chân. Về tới nhà lúc 10 giờ đêm, cả nhà vẫn chờ cơm.',
          effects: { happy: 4 }, scene: { loc: 'home', anim: 'eat', fx: 'steam' } }
      ]
    },
    {
      id: 's_act_khach_gap', title: 'Khách trễ chuyến bay', icon: '✈️', age: [18, 60], weight: 2,
      req: { jobId: ['taixe', 'shipper'] },
      text: 'Khách lên xe thở hổn hển: “Anh/chị ơi, 40 phút nữa máy bay cất cánh! Kịp thì em bo gấp ba!” Đường ra sân bay đang giờ cao điểm.',
      scene: { loc: 'street', anim: 'drive', npcs: [{ role: 'stranger', anim: 'scared', say: 'Nhanh lên giúp em!' }], fx: 'sweat' },
      choices: [
        { label: 'Cầm chắc tay lái, chạy hết tốc lực', mini: 'drive',
          success: { stat: 'health', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn luồn lách khéo léo, tới sân bay còn dư năm phút. Khách dúi vào tay bạn {money:500000} tiền bo, cảm ơn rối rít.', effects: { money: 500000, happy: 6, perf: 3 }, scene: { loc: 'airport', anim: 'cheer', fx: 'money' } },
            { text: 'Bạn vượt đèn vàng thì bị cảnh sát giao thông thổi lại. Khách lỡ chuyến, bạn còn dính phạt.', effects: { money: -1500000, happy: -5 }, scene: { anim: 'facepalm', npcs: [{ role: 'police', anim: 'point' }] } }
          ] },
        { label: 'Chạy đúng luật, kịp hay không là duyên',
          text: 'Bạn chạy đúng tốc độ. Khách kịp làm thủ tục ở phút chót, vẫn bo bạn chút ít.',
          effects: { money: 100000, karma: 1 }, scene: { loc: 'airport', anim: 'wave' } }
      ]
    },
    {
      id: 's_act_dua_xe', title: 'Lời rủ đua xe đêm', icon: '🏍️', age: [15, 24], weight: 1,
      req: { notFlag: 's_act_dua_xe' },
      text: 'Hội bạn rủ đi “bão” đêm trên đại lộ vắng. Đứa nào về nhất được cả bọn bao ăn một tuần. Tiếng pô xe gầm rú ngoài ngõ.',
      scene: { loc: 'street', time: 'night', anim: 'drive', npcs: [{ role: 'friend', anim: 'drive', say: 'Đi không mày?' }], fx: 'smoke' },
      choices: [
        { label: 'Vít ga, quyết về nhất', mini: 'drive',
          success: { stat: 'health', base: 0.25, scale: 0.4 },
          outcomes: [
            { text: 'Bạn về nhất trong tiếng hò hét. Cả bọn bao bạn ăn ốc một tuần liền. Vui, nhưng nghĩ lại thấy lạnh gáy.', effects: { happy: 8, karma: -2, flag: 's_act_dua_xe' }, scene: { anim: 'cheer', fx: 'stars' } },
            { text: 'Bạn đâm vào dải phân cách, gãy tay, nằm viện ba tuần. Bố mẹ khóc hết nước mắt.', effects: { health: -20, happy: -10, illness: 'chanthuong', rel: { mother: -6 }, flag: 's_act_dua_xe' }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' } }
          ] },
        { label: 'Từ chối, ở nhà',
          text: 'Bạn từ chối. Sáng hôm sau đọc báo thấy một nhóm đua xe bị bắt, có đứa bị thương nặng.',
          effects: { karma: 2, flag: 's_act_dua_xe' }, scene: { anim: 'phone' } }
      ]
    },

    // ======================= THỦ MÔN & BƠI =======================
    // ======================= ĐỘI BÓNG PHONG TRÀO (người lớn đá futsal / đá phủi) =======================
    {
      id: 's_act_futsal_join', title: 'Đội futsal phong trào', icon: '⚽', age: [18, 50], weight: 1.6, once: false, cooldown: 6,
      req: { notFlag: 'futsal' },
      text: 'Đám bạn trong khu / đồng nghiệp lập đội futsal đá tối thứ Ba và thứ Năm ở sân mini gần nhà, còn thiếu một người. “Vào đá cho vui, thắng thua gì cũng có bia.”',
      scene: { loc: 'stadium', time: 'dusk', anim: 'talk', npcs: [{ role: 'stranger', anim: 'point', say: 'Vào đá với tụi tao!' }], fx: 'exclaim' },
      choices: [
        { label: 'Vào đội, tối nào cũng ra sân', text: 'Bạn nhận áo số 10 mượn tạm. Mỗi tuần hai buổi đổ mồ hôi, cười thả ga, người nhẹ hẳn đi.', effects: { happy: 5, health: 2, money: -500000, flag: 'futsal' }, scene: { anim: 'kick', fx: 'sparkle' } },
        { label: 'Để lúc khác', text: 'Bạn hẹn “lúc nào rảnh”. Họ gật đầu, vẫn chừa chỗ cho bạn.', effects: {}, scene: { anim: 'shrug' } }
      ]
    },
    {
      id: 's_act_futsal_game', title: 'Trận futsal tối thứ Năm', icon: '🏟️', age: [18, 50], weight: 2.6, once: false, cooldown: 2,
      req: { flag: 'futsal' },
      text: 'Đội futsal phong trào hôm nay gặp đội phường bên cạnh, cược một thùng nước ngọt. Hiệp hai hoà 2–2, đội trưởng gọi bạn vào thay: “Cầm bóng đi, mày chạy nhiều nhất đội mà!”',
      scene: { loc: 'stadium', time: 'night', anim: 'kick', npcs: [{ role: 'stranger', anim: 'cheer', say: 'Sút đi!' }, { role: 'crowd', anim: 'cheer' }], fx: 'exclaim' },
      choices: [
        { label: 'Ra sân thi đấu hết mình', mini: 'hax',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn ghi bàn quyết định ở phút cuối. Cả đội ôm nhau, thùng nước ngọt về tay bạn.', effects: { happy: 8, health: 1 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Đội thua sát nút 2–3, bạn đá hỏng một cơ hội rõ ràng. Cả bọn vẫn rủ nhau đi ăn mì cay.', effects: { happy: -2 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Nhường chỗ, ngồi ngoài cổ vũ', text: 'Bạn ngồi ngoài đường biên hò hét. Đội thắng hay thua thì cũng có bạn bè bên cạnh.', effects: { happy: 1 }, scene: { anim: 'cheer' } },
        { label: 'Xin nghỉ đội, đi làm bận quá', text: 'Bạn gửi lời xin lỗi vào nhóm chat và rút khỏi đội. Tối thứ Năm bỗng yên ắng lạ.', effects: { happy: -2, unflag: 'futsal' }, scene: { anim: 'sad' } }
      ]
    },
    {
      id: 's_act_da_phui', title: 'Chung kết đá phủi', icon: '🧤', age: [12, 45], weight: 1.2,
      text: 'Chung kết giải bóng đá phủi của phường hòa 1–1. Thủ môn đội bạn bị chuột rút, cả đội nhìn về phía bạn: “Mày bắt luân lưu đi!”',
      scene: { loc: 'stadium', time: 'dusk', anim: 'think', npcs: [{ role: 'friend', anim: 'point', say: 'Mày vào khung thành!' }, { role: 'crowd', anim: 'cheer' }], fx: 'exclaim' },
      choices: [
        { label: 'Đeo găng, đứng vào khung thành', mini: 'keeper',
          success: { stat: 'health', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn bay người cản phá hai quả liền. Đội bạn vô địch! Cả bọn công kênh bạn chạy quanh sân, chiếc cúp nhựa sáng lấp lánh.', effects: { happy: 10, health: 1 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Năm quả, bạn đổ người sai hướng cả năm. Đội thua. Bạn vẫn được mời bia vì “dám đứng vào khung thành”.', effects: { happy: -3 }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Đẩy cho đứa khác bắt',
          text: 'Bạn lắc đầu. Thằng bạn to con nhất đội vào thay và… đội thua luân lưu.',
          effects: { happy: -2 }, scene: { anim: 'shrug' } }
      ]
    },
    {
      id: 's_act_fb_luanluu', title: 'Thủ môn nhận thẻ đỏ', icon: '🟥', age: [17, 38], weight: 2,
      req: { jobId: ['cauthu'] },
      text: 'Phút 120, thủ môn đội bạn nhận thẻ đỏ, đội đã hết quyền thay người. HLV chỉ thẳng vào bạn: “Cậu vào khung thành bắt luân lưu!”',
      scene: { loc: 'stadium', time: 'night', anim: 'think', npcs: [{ role: 'boss', anim: 'point', say: 'Cậu vào bắt!' }, { role: 'crowd', anim: 'cheer' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Mặc áo thủ môn, bắt luân lưu', mini: 'keeper',
          success: { stat: 'health', base: 0.15, scale: 0.45 },
          outcomes: [
            { text: 'Bạn bay người cản phá hai quả luân lưu! Đội bạn thắng, báo chí gọi bạn là “người hùng bất đắc dĩ”. Clip được chia sẻ khắp mạng.', effects: { happy: 12, perf: 10, followers: 0.2 }, scene: { anim: 'cheer', fx: 'fireworks' } },
            { text: 'Bạn không cản được quả nào. Đội thua, nhưng không ai trách bạn. HLV vỗ vai: “Cậu đã làm hết sức.”', effects: { happy: -4 }, scene: { anim: 'sad' } }
          ] }
      ]
    },
    {
      id: 's_act_boi_truong', title: 'Hội thao: bơi 50 mét', icon: '🏊', age: [9, 17], weight: 1.2,
      req: { school: true },
      text: 'Hội thao trường có nội dung bơi 50 mét. Lớp bạn không ai đăng ký, cô chủ nhiệm nhìn bạn đầy hy vọng.',
      scene: { loc: 'beach', anim: 'swim', npcs: [{ role: 'teacher', anim: 'clap', say: 'Cố lên em!' }, { role: 'classmate', anim: 'cheer' }], fx: 'bubbles' },
      choices: [
        { label: 'Nhận lời, xuống nước', mini: 'swim',
          success: { stat: 'health', base: 0.2, scale: 0.55 },
          outcomes: [
            { text: 'Bạn chạm tường đầu tiên! Cả lớp nhảy cẫng lên, cô chủ nhiệm ôm bạn ướt sũng. Tấm huy chương được treo ở góc lớp cả năm.', effects: { happy: 10, health: 2 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn về cuối, uống mấy ngụm nước. Lên bờ cả lớp vẫn vỗ tay vì bạn dám thi.', effects: { happy: -2, health: 1 }, scene: { anim: 'shrug', fx: 'bubbles' } }
          ] },
        { label: 'Lắc đầu: “Em sợ nước lắm cô”',
          text: 'Cô cười, không ép. Lớp bạn bỏ trống nội dung bơi năm đó.',
          effects: {}, scene: { anim: 'shake' } }
      ]
    },
    {
      id: 's_act_dong_xoay', title: 'Dòng nước xoáy', icon: '🌊', age: [14, 60], weight: 0.9,
      text: 'Đang tắm biển, bạn thấy một cậu bé bị dòng xoáy kéo ra xa, đầu nhấp nhô giữa sóng. Bố mẹ cậu bé gào khóc trên bờ.',
      scene: { loc: 'beach', anim: 'scared', npcs: [{ role: 'kid', anim: 'swim' }, { role: 'stranger', anim: 'cry', say: 'Cứu con tôi!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Lao ra bơi chéo dòng để cứu', mini: 'swim',
          success: { stat: 'health', base: 0.2, scale: 0.55 },
          outcomes: [
            { text: 'Bạn bơi chéo thoát dòng xoáy, kéo được cậu bé vào bờ. Bố mẹ cậu quỳ xuống cảm ơn. Báo địa phương đăng tin về bạn.', effects: { karma: 14, happy: 10, followers: 0.05 }, scene: { anim: 'hug', fx: 'hearts' } },
            { text: 'Bạn đuối sức giữa sóng. May đội cứu hộ kịp tới, kéo cả bạn và cậu bé lên. Bạn sặc nước, phải thở ô-xy.', effects: { karma: 8, health: -10, happy: -2 }, scene: { loc: 'hospital', anim: 'sick' } }
          ] },
        { label: 'Hô cứu hộ, ném phao',
          text: 'Bạn chạy dọc bờ hô cứu hộ, ném chiếc phao gần nhất. Cậu bé bám được phao, đội cứu hộ kéo vào an toàn.',
          effects: { karma: 6, happy: 4 }, scene: { anim: 'point', fx: 'sparkle' } }
      ]
    },

    // ======================= NGHỀ & KINH DOANH =======================
    {
      id: 's_act_thang_chuc', title: 'Phỏng vấn thăng chức', icon: '💼', age: [26, 58], weight: 1.2,
      req: { jobId: ['laptrinh', 'ketoan', 'marketing', 'kysu', 'nganhang', 'thietke', 'banhang', 'congchuc', 'phiendich', 'luatsu', 'nhabao', 'kientrucsu', 'duocsi', 'kinhdoanh'] },
      text: 'Công ty mở vị trí trưởng nhóm. Ban giám đốc mời bạn vào phỏng vấn cùng hai ứng viên khác. Nếu đậu, lương tăng gần gấp rưỡi.',
      scene: { loc: 'office', anim: 'talk', npcs: [{ role: 'boss', anim: 'think', say: 'Mời bạn ngồi.' }], fx: 'question' },
      choices: [
        { label: 'Chuẩn bị kỹ, vào phỏng vấn', mini: 'interview',
          success: { stat: 'smarts', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Bạn trả lời mạch lạc, đưa ra số liệu thuyết phục. Tuần sau, quyết định bổ nhiệm được ký. Đồng nghiệp kéo nhau đi ăn mừng.', effects: { perf: 18, happy: 8, money: 15000000 }, scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Người khác được chọn. Sếp bảo bạn “còn thiếu chút độ chín”. Bạn hứa với mình lần sau sẽ khác.', effects: { happy: -5, perf: 2 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Nhường cơ hội, chưa muốn ôm việc',
          text: 'Bạn rút hồ sơ. Đỡ áp lực, nhưng nhìn người khác lên chức cũng hơi chạnh lòng.',
          effects: { happy: -1 }, scene: { anim: 'shrug' } }
      ]
    },
    {
      id: 's_act_cho_hoa_tet', title: 'Bán hàng chợ Tết', icon: '🧧', age: [16, 65], weight: 1,
      req: { minMoney: 5000000 },
      text: 'Người quen rủ thuê một sạp ở chợ Tết, bán bánh mứt và đồ uống ba ngày cuối năm. Vốn bỏ ra {money:5000000}, đông khách thì lãi to.',
      scene: { loc: 'market', time: 'dusk', anim: 'cook', npcs: [{ role: 'vendor', anim: 'talk', say: 'Làm không?' }, { role: 'crowd', anim: 'walk' }], fx: 'steam' },
      choices: [
        { label: 'Xắn tay đứng sạp', mini: 'cook',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Ba ngày bán không kịp thở, khách xếp hàng dài. Tất niên đếm tiền, bạn lãi hơn {money:12000000}.', effects: { money: 12000000, happy: 7, health: -2 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Bạn làm chậm, khách chờ lâu bỏ sang sạp bên. Ế gần nửa hàng, lỗ vốn.', effects: { money: -3000000, happy: -4, health: -2 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Thôi, Tết để nghỉ ngơi',
          text: 'Bạn từ chối. Ba ngày cuối năm ngủ nướng, dọn nhà, gói bánh chưng với mẹ.',
          effects: { happy: 3 }, scene: { loc: 'home', anim: 'sit' } }
      ]
    },
    {
      id: 's_act_bep_kin_ban', title: 'Nhà hàng kín bàn', icon: '👨‍🍳', age: [18, 60], weight: 2,
      req: { jobId: ['daubep', 'phucvu'] },
      text: 'Tối thứ Bảy, nhà hàng kín bàn, bếp trưởng thì nghỉ ốm. Phiếu order dồn dập, quản lý hét vọng vào: “Bàn 7 giục lần thứ ba rồi!”',
      scene: { loc: 'cafe', time: 'night', anim: 'cook', npcs: [{ role: 'boss', anim: 'angry', say: 'Nhanh lên!' }], fx: 'steam' },
      choices: [
        { label: 'Đứng bếp chính, cân hết', mini: 'cook',
          success: { stat: 'health', base: 0.25, scale: 0.45 },
          outcomes: [
            { text: 'Bạn ra món nhanh như máy. Cuối ca, chủ nhà hàng bắt tay: “Từ tháng sau em làm phó bếp.”', effects: { perf: 14, happy: 7, money: 2000000 }, scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Bạn nhầm ba món, hai bàn bỏ về. Chủ nhà hàng thở dài, trừ tiền thưởng tháng.', effects: { perf: -6, happy: -5, money: -1000000 }, scene: { anim: 'facepalm', fx: 'smoke' } }
          ] }
      ]
    },
    {
      id: 's_act_xe_banh_mi', title: 'Xe bánh mì buổi sáng', icon: '🥖', age: [17, 55], weight: 0.9,
      req: { minMoney: 8000000 },
      text: 'Bạn tính mở một xe bánh mì ở cổng trường đại học, bán từ 6 đến 9 giờ sáng. Vốn sắm xe, lò nướng hết {money:8000000}.',
      scene: { loc: 'street', time: 'dawn', anim: 'cook', npcs: [{ role: 'stranger', anim: 'walk' }], fx: 'steam' },
      choices: [
        { label: 'Làm luôn, sáng mai bán', mini: 'cook',
          success: { stat: 'smarts', base: 0.25, scale: 0.45 },
          outcomes: [
            { text: 'Bánh nóng, nhân đầy, làm nhanh. Sinh viên xếp hàng, ba tháng là hoàn vốn. Xe bánh mì thành nguồn thu đều mỗi tháng.', effects: { money: 18000000, happy: 6, health: -2 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Làm chậm, sinh viên trễ học bỏ đi mua chỗ khác. Hai tháng sau bạn sang lại xe, lỗ gần hết vốn.', effects: { money: -6000000, happy: -5 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Nghĩ lại, chưa đủ liều',
          text: 'Bạn cất ý tưởng vào ngăn kéo. Sáng sáng đi ngang cổng trường vẫn thấy tiếc tiếc.',
          effects: {}, scene: { anim: 'think' } }
      ]
    },
    {
      id: 's_act_co_phieu', title: 'Cổ phiếu dậy sóng', icon: '📈', age: [22, 70], weight: 1,
      req: { minMoney: 50000000 },
      text: 'Nhóm đầu tư rần rần: cổ phiếu ngành thép vừa tăng trần ba phiên liền. Có người bảo sắp “lên mặt trăng”, có người bảo sắp “sập hầm”.',
      scene: { loc: 'office', anim: 'phone', npcs: [{ role: 'coworker', anim: 'talk', say: 'Vào nhanh kẻo lỡ!' }], fx: 'money' },
      choices: [
        { label: 'Vào lệnh lướt sóng', mini: 'stock',
          success: { stat: 'smarts', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Bạn mua đúng nhịp, bán ra trước phiên điều chỉnh. Tài khoản lãi gần 15%.', effects: { moneyPct: 0.12, happy: 6 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Bạn mua đúng đỉnh. Ba phiên giảm sàn liền, bạn cắt lỗ trong nước mắt.', effects: { moneyPct: -0.1, happy: -6 }, scene: { anim: 'facepalm', fx: 'tears' } }
          ] },
        { label: 'Đứng ngoài quan sát',
          text: 'Bạn tắt app. Tuần sau cổ phiếu ấy đảo chiều. Không lãi, không lỗ, ngủ ngon.',
          effects: { happy: 1 }, scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 's_act_coin', title: 'Đồng coin mới lên sàn', icon: '🪙', age: [18, 50], weight: 0.8,
      req: { minMoney: 20000000 },
      text: 'Đồng coin mới niêm yết, biểu đồ nhảy múa như điện tâm đồ. Nhóm chat toàn tên lửa và mặt trăng.',
      scene: { loc: 'bedroom', time: 'night', anim: 'phone', fx: 'money' },
      choices: [
        { label: 'Lướt một phiên rồi rút', mini: 'stock',
          success: { stat: 'smarts', base: 0.1, scale: 0.5 },
          outcomes: [
            { text: 'Bạn mua đáy, bán đỉnh trong một đêm. Tiền về tài khoản, tay vẫn còn run.', effects: { moneyPct: 0.15, happy: 7 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Đồng coin “rug pull”, chủ dự án ôm tiền biến mất. Bạn mất một khoản đáng kể.', effects: { moneyPct: -0.15, happy: -8 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Rời nhóm, đi ngủ',
          text: 'Bạn rời nhóm. Vài hôm sau, đồng coin ấy về gần 0.',
          effects: { happy: 2, karma: 1 }, scene: { anim: 'sleep', fx: 'zzz' } }
      ]
    },

    // ======================= TÌNH CẢM =======================
    {
      id: 's_act_to_tinh_trai', title: 'Đêm lửa trại', icon: '🔥', age: [15, 26], weight: 1.3,
      req: { lacks: ['partner', 'spouse'] },
      text: 'Đêm lửa trại cuối khóa, người bạn thầm thích ngồi một mình ở góc sân. Bạn bè đẩy lưng bạn: “Giờ không nói thì bao giờ?”',
      scene: { loc: 'park', time: 'night', anim: 'think', npcs: [{ role: 'classmate', anim: 'sit' }, { role: 'friend', anim: 'point', say: 'Đi đi!' }], fx: 'hearts' },
      choices: [
        { label: 'Lấy hết can đảm, ra tỏ tình', mini: 'love',
          success: { stat: 'looks', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Người ấy đỏ mặt, gật đầu thật khẽ. Hai người ngồi cạnh nhau tới khi lửa tàn. Đêm đó bạn không ngủ nổi.', effects: { happy: 12, addPerson: { role: 'partner', fromScene: 'classmate' } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: '“Mình xin lỗi… mình coi bạn là bạn thôi.” Bạn cười gượng, quay về đống lửa, hát to hơn mọi người.', effects: { happy: -8 }, scene: { anim: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Thôi, để dành trong tim',
          text: 'Bạn ngồi xa nhìn. Nhiều năm sau, thỉnh thoảng bạn vẫn tự hỏi “nếu lúc đó…”.',
          effects: { happy: -2 }, scene: { anim: 'sit' } }
      ]
    },
    {
      id: 's_act_hen_ho_lau', title: 'Buổi hẹn ở quán lẩu', icon: '🍲', age: [16, 45], weight: 1.2,
      req: { has: ['partner'] },
      text: 'Lần đầu bạn hẹn {partner} đi ăn lẩu ở quán mới mở. Chọn món, gắp đồ, nói chuyện gì cho khéo… mọi thứ đều có thể thành điểm cộng hoặc thảm họa.',
      scene: { loc: 'cafe', time: 'night', anim: 'eat', npcs: [{ role: 'partner', anim: 'eat', say: 'Quán đẹp ghê!' }], fx: 'steam' },
      choices: [
        { label: 'Hết mình cho buổi hẹn', mini: 'love',
          success: { stat: 'looks', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Hai người cười suốt buổi. Về tới cổng, {partner} nắm tay bạn: “Lần sau mình đi tiếp nhé.”', effects: { happy: 8, rel: { partner: 14 } }, scene: { anim: 'love', fx: 'hearts' } },
            { text: 'Bạn nói hơi nhiều chuyện người yêu cũ. Không khí chùng hẳn xuống. Về nhà, tin nhắn của {partner} cụt lủn.', effects: { happy: -3, rel: { partner: -6 } }, scene: { anim: 'facepalm' } }
          ] }
      ]
    },
    {
      id: 's_act_lam_lanh', title: 'Giận nhau ba ngày', icon: '🥺', age: [20, 75], weight: 1,
      req: { has: ['spouse'] },
      text: 'Vợ chồng cãi nhau to vì chuyện tiền nong. Ba ngày nay {spouse} không nói với bạn câu nào, cơm ai nấy ăn.',
      scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'spouse', anim: 'angry' }], fx: 'anger' },
      choices: [
        { label: 'Chủ động làm lành', mini: 'love',
          success: { stat: 'karma', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn nấu món {spouse} thích nhất, nói lời xin lỗi thật lòng. {spouse} bật cười, ôm bạn: “Lần sau đừng thế nữa.”', effects: { happy: 7, rel: { spouse: 14 } }, scene: { anim: 'hug', fx: 'hearts' } },
            { text: 'Lời xin lỗi vụng về thành ra cãi tiếp hiệp hai. Phải nhờ mẹ vợ/mẹ chồng sang mới yên.', effects: { happy: -5, rel: { spouse: -6 } }, scene: { anim: 'angry', fx: 'anger' } }
          ] },
        { label: 'Im lặng chờ nguôi',
          text: 'Một tuần sau mọi chuyện tự trôi qua. Nhưng có gì đó vẫn còn lấn cấn.',
          effects: { rel: { spouse: -3 } }, scene: { anim: 'sit' } }
      ]
    },

    // ======================= MẶC CẢ =======================
    {
      id: 's_act_cho_dao', title: 'Mua cành đào Tết', icon: '🌸', age: [18, 80], weight: 1,
      req: { minMoney: 3000000 },
      text: 'Chợ hoa ngày 28 Tết. Cành đào thế đẹp nhất chợ, người bán hét giá {money:3000000}. “Đào Nhật Tân chính gốc đấy, không mặc cả!”',
      scene: { loc: 'market', anim: 'talk', npcs: [{ role: 'vendor', anim: 'talk', say: 'Giá đó là rẻ!' }], fx: 'petals' },
      choices: [
        { label: 'Trả giá cho bằng được', mini: 'haggle',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Sau năm phút “đấu khẩu”, bạn ôm cành đào về với giá chỉ hơn nửa. Cả nhà khen bạn đi chợ giỏi.', effects: { money: -1600000, happy: 6 }, scene: { loc: 'home', anim: 'cheer', fx: 'petals' } },
            { text: 'Người bán phật ý, quay sang khách khác. Bạn đành mua cành nhỏ hơn mà giá vẫn đắt.', effects: { money: -2200000, happy: -1 }, scene: { anim: 'shrug' } }
          ] },
        { label: 'Mua luôn, Tết mà',
          text: 'Bạn trả đủ. Cành đào nở rộ đúng giao thừa, đẹp nhất xóm.',
          effects: { money: -3000000, happy: 5 }, scene: { loc: 'home', anim: 'cheer', fx: 'petals' } }
      ]
    },
    {
      id: 's_act_thue_mat_bang', title: 'Đàm phán tiền thuê nhà', icon: '🏠', age: [20, 50], weight: 0.9,
      req: { noAsset: 'house' },
      text: 'Chủ nhà báo tăng tiền thuê 20% từ tháng sau. Chuyển đi thì mất cọc, ở lại thì thêm gánh nặng.',
      scene: { loc: 'home', anim: 'think', npcs: [{ role: 'neighbor', anim: 'talk', say: 'Giá chung cả khu rồi.' }], fx: 'question' },
      choices: [
        { label: 'Ngồi xuống thương lượng', mini: 'haggle',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chỉ ra những chỗ hỏng chưa sửa, hứa ký thêm hai năm. Chủ nhà chỉ tăng 5%. Một năm tiết kiệm được kha khá.', effects: { money: 8000000, happy: 4 }, scene: { anim: 'nod', fx: 'sparkle' } },
            { text: 'Chủ nhà không nhượng bộ: “Không ở thì có người khác ở.” Bạn đành chịu tăng giá.', effects: { money: -6000000, happy: -3 }, scene: { anim: 'sad' } }
          ] },
        { label: 'Chịu tăng, đỡ phiền',
          text: 'Bạn ký tiếp với giá mới. Đỡ mệt chuyện chuyển nhà, chỉ hơi xót ví.',
          effects: { money: -8000000 }, scene: { anim: 'shrug' } }
      ]
    },

    // ======================= CẤP CỨU =======================
    {
      id: 's_act_ngung_tho', title: 'Người ngã gục giữa phố', icon: '🫀', age: [16, 70], weight: 1,
      text: 'Một người đàn ông đang đi bỗng ngã vật xuống vỉa hè, môi tím tái, không còn thở. Mọi người đứng quanh, chưa ai dám làm gì.',
      scene: { loc: 'street', anim: 'scared', npcs: [{ role: 'stranger', gender: 'm', anim: 'dead' }, { role: 'crowd', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Quỳ xuống ép tim ngay', mini: 'cpr',
          success: { stat: 'smarts', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Bạn ép tim đều tay suốt tám phút tới khi xe 115 tới. Ông ấy được cứu sống. Một tuần sau, cả gia đình tìm đến nhà cảm ơn bạn.', effects: { karma: 15, happy: 10 }, scene: { anim: 'hug', fx: 'hearts' } },
            { text: 'Bạn đã cố hết sức, nhưng ông ấy không qua khỏi. Bác sĩ bảo nhờ bạn mà gia đình kịp gặp ông lần cuối ở bệnh viện.', effects: { karma: 8, happy: -6 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Gọi 115, giữ đám đông giãn ra',
          text: 'Bạn gọi cấp cứu, mở khoảng trống cho thoáng khí. Xe tới sau mười phút. Bạn không biết ông ấy có qua khỏi không.',
          effects: { karma: 4 }, scene: { anim: 'phone' } }
      ]
    },
    {
      id: 's_act_ca_truc', title: 'Ca trực lúc 3 giờ sáng', icon: '🏥', age: [22, 65], weight: 2,
      req: { jobId: ['bacsi', 'dieuduong'] },
      text: 'Ba giờ sáng, bệnh nhân giường số 4 ngừng tuần hoàn. Máy monitor kêu inh ỏi. Bác sĩ trưởng ca đang ở phòng mổ.',
      scene: { loc: 'hospital', time: 'night', anim: 'scared', npcs: [{ role: 'doctor', anim: 'run' }, { role: 'stranger', anim: 'sick' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Lao vào hồi sức tim phổi', mini: 'cpr',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Sau hai chu kỳ ép tim và sốc điện, nhịp tim trở lại. Sáng ra, bệnh nhân mở mắt. Trưởng khoa ghi tên bạn vào danh sách khen thưởng.', effects: { perf: 14, karma: 8, happy: 8 }, scene: { anim: 'cheer', fx: 'sparkle' } },
            { text: 'Ba mươi phút cấp cứu không có kết quả. Bạn ngồi thẫn thờ ở cầu thang thoát hiểm tới sáng.', effects: { happy: -8, perf: 2 }, scene: { anim: 'cry', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 's_act_bo_nga', title: 'Bố ngã gục trong bữa cơm', icon: '💔', age: [16, 60], weight: 0.7,
      req: { has: ['father'], notFlag: 's_act_bo_nga' },
      text: 'Đang ăn cơm, bố bỗng ôm ngực rồi gục xuống mâm. Mẹ hét lên. Xe cấp cứu ít nhất mười lăm phút nữa mới tới.',
      scene: { loc: 'home', anim: 'scared', expr: 'scared', npcs: [{ role: 'father', anim: 'dead' }, { role: 'mother', anim: 'cry', say: 'Ông ơi!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đặt bố nằm ngửa, ép tim', mini: 'cpr',
          success: { stat: 'smarts', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn ép tim đến rã rời đôi tay. Bố thở lại trước khi xe cấp cứu tới. Bác sĩ bảo: “Cháu cứu bố cháu đấy.”', effects: { happy: 6, karma: 6, rel: { father: 20, mother: 10 }, flag: 's_act_bo_nga' }, scene: { loc: 'hospital', anim: 'hug', fx: 'hearts', npcs: [{ role: 'father', anim: 'sick' }] } },
            { text: 'Bố qua khỏi nhờ cấp cứu, nhưng phải nằm viện dài ngày, nói còn khó khăn. Cả nhà thay nhau túc trực.', effects: { happy: -6, money: -15000000, rel: { father: 10 }, flag: 's_act_bo_nga' }, scene: { loc: 'hospital', anim: 'sad', npcs: [{ role: 'father', anim: 'sleep' }] } }
          ] }
      ]
    },

    // ======================= ĐÁNH BÀI =======================
    {
      id: 's_act_bai_tet', title: 'Chiếu bài mùng 2 Tết', icon: '🃏', age: [14, 80], weight: 1.2,
      text: 'Mùng 2 Tết, các chú các bác trải chiếu đánh xì dách “cho vui”. Chú út vẫy bạn: “Vào một chân đi, ăn thua đủ!”',
      scene: { loc: 'home', anim: 'sit', npcs: [{ role: 'relative', anim: 'laugh', say: 'Vào đi cháu!' }, { role: 'relative', anim: 'sit' }], fx: 'money' },
      choices: [
        { label: 'Ngồi vào chiếu', mini: 'cards',
          success: { stat: 'smarts', base: 0.25, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bốc liền hai ván xì dách, ôm trọn cả chiếu. Chú út cười mếu: “Cháu học ở đâu thế!”', effects: { money: 2000000, happy: 6, karma: -1 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Ván nào cũng quắc. Hết sạch tiền lì xì, bạn đứng dậy đi rửa bát cho đỡ ngại.', effects: { money: -2500000, happy: -4, karma: -1 }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Chỉ ngồi xem, cắn hạt dưa',
          text: 'Bạn ngồi xem, cắn hết đĩa hạt dưa. Cuối buổi có bác thua sạch, có chú cãi nhau. Bạn thấy mình sáng suốt.',
          effects: { happy: 2 }, scene: { anim: 'eat' } }
      ]
    },
    {
      id: 's_act_casino', title: 'Lời mời vào sòng bài', icon: '🎰', age: [21, 65], weight: 0.6,
      req: { minMoney: 200000000 },
      text: 'Đối tác làm ăn mời bạn sang casino bên kia biên giới: “Chơi vài ván cho biết, thắng thì chia đôi.”',
      scene: { loc: 'karaoke', time: 'night', anim: 'think', npcs: [{ role: 'boss', gender: 'm', anim: 'laugh', say: 'Đi cho biết!' }], fx: 'money' },
      choices: [
        { label: 'Ngồi vào bàn xì dách', mini: 'cards',
          success: { stat: 'smarts', base: 0.1, scale: 0.45 },
          outcomes: [
            { text: 'Đêm đó bạn đỏ bài, ôm về {money:80000000}. Đối tác trầm trồ. Bạn tự nhủ: một lần thôi, không bao giờ nữa.', effects: { money: 80000000, happy: 8, karma: -3 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Thua rồi gỡ, gỡ rồi thua. Sáng ra bạn mất {money:150000000}. Đường về dài nhất đời.', effects: { money: -150000000, happy: -12, karma: -3 }, scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Từ chối khéo',
          text: 'Bạn cáo bệnh xin về. Đối tác hơi phật ý, nhưng ví bạn thì nguyên vẹn.',
          effects: { karma: 2 }, scene: { anim: 'shake' } }
      ]
    }
  );
})();
