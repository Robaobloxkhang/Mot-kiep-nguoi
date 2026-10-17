/* Một Kiếp Người — biến cố nghề nghiệp: giải trí & hàng không */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ============================== CA SĨ ==============================
    {
      id: 's_job_casi_hatnhep', title: 'Hát nhép bị lộ', icon: '🎤', age: [16, 65], weight: 1.5,
      req: { jobId: ['casi'], notFlag: 'job_casi_hatnhep' },
      text: 'Đêm nhạc hội ở quảng trường {city}, hàng nghìn khán giả giơ đèn flash. Đang điệp khúc cao trào thì micro tuột khỏi tay bạn rơi xuống sàn, nhưng tiếng hát vẫn vang lên đều đều, trong trẻo. Cả quảng trường khựng lại một giây, rồi ai đó hét lên: “Hát nhép kìa!”',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'sing', expr: 'surprised',
        npcs: [{ role: 'crowd', anim: 'point', say: 'Hát nhép kìa!' }, { role: 'coworker', gender: 'm', age: 35, anim: 'facepalm', say: 'Chết rồi, quên tắt bè!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Ra hiệu tắt nhạc, hát mộc trước cả quảng trường',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn nhặt micro, cười: “Vậy mình hát thật cho mọi người nghe nhé!” Không nhạc nền, chỉ có giọng bạn giữa quảng trường im phăng phắc. Hết bài, tiếng vỗ tay còn to hơn lúc nãy.',
              effects: { happy: 8, looks: 6, karma: 3, flag: ['job_casi_hatnhep', 'job_casi_hatlive'], followUp: { id: 's_job_casi_hatnhep_clip', delay: 0 } },
              scene: { anim: 'sing', fx: 'music', npcAnim: { crowd: 'clap', coworker: 'cheer' }, npcSay: { crowd: 'Hát live còn hay hơn!' } } },
            { text: 'Bạn hít một hơi thật sâu rồi lên nốt cao… và vỡ giọng. Tiếng cười rộ lên khắp quảng trường, hàng trăm chiếc điện thoại vẫn đang quay.',
              effects: { happy: -8, looks: -4, flag: 'job_casi_hatnhep', followUp: { id: 's_job_casi_hatnhep_clip', delay: 0 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] },
        { label: 'Đổ lỗi cho kỹ thuật âm thanh',
          outcomes: [
            { p: 0.5, text: 'Bạn chỉ tay về phía bàn mixer: “Lỗi kỹ thuật, xin lỗi mọi người!” Khán giả tạm tin. Tuần sau, anh kỹ thuật viên bị cắt hợp đồng vì “làm hỏng show”.',
              effects: { karma: -8, happy: -2, flag: ['job_casi_hatnhep', 'job_casi_doloi'], followUp: { id: 's_job_casi_hatnhep_clip', delay: 0 } },
              scene: { anim: 'point', fx: 'sweat', npcAnim: { coworker: 'sad' } } },
            { p: 0.5, text: 'Bạn vừa đổ lỗi, anh kỹ thuật viên đã đăng ngay đoạn clip tổng duyệt: bạn chưa từng hát một câu live nào. Cư dân mạng gọi bạn là “ca sĩ đổ thừa”.',
              effects: { karma: -6, happy: -6, looks: -6, flag: ['job_casi_hatnhep', 'job_casi_doloi'], followUp: { id: 's_job_casi_hatnhep_clip', delay: 0 } },
              scene: { anim: 'scared', fx: 'anger', npcAnim: { coworker: 'angry', crowd: 'shake' } } }
          ] },
        { label: 'Cười xòa, nhảy nốt phần còn lại',
          text: 'Bạn nháy mắt với khán giả: “Hôm nay em viêm họng, cho em nợ nhé!” rồi nhảy tung tăng hết bài. Người thấy dễ thương, người thấy bị coi thường.',
          effects: { happy: -2, karma: 1, flag: 'job_casi_hatnhep', followUp: { id: 's_job_casi_hatnhep_clip', delay: 0 } },
          scene: { anim: 'dance', fx: 'question', npcAnim: { crowd: 'shrug' } } }
      ]
    },
    {
      id: 's_job_casi_hatnhep_clip', title: 'Clip hát nhép lên xu hướng', icon: '📉', age: [16, 70], chainOnly: true,
      req: { jobId: ['casi'] },
      text: 'Sáng hôm sau, clip mười lăm giây từ đêm nhạc hội đạt ba triệu lượt xem trên TikTok, báo mạng giật tít ầm ầm. Chị quản lý gọi đến cháy máy: một nhãn hàng mỹ phẩm sắp ký hợp đồng với bạn đang “xin phép cân nhắc lại”.',
      scene: { loc: 'bedroom', time: 'day', weather: 'cloudy', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'coworker', gender: 'f', age: 33, anim: 'phone', say: 'Em tính sao thì tính nhanh lên!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Livestream xin lỗi, hứa từ nay hát live 100%',
          text: 'Bạn lên sóng không trang điểm, cúi đầu xin lỗi khán giả và hứa mọi sân khấu từ nay đều hát thật. Bình luận chửi nhiều, nhưng cũng có người viết: “Biết nhận sai là được.”',
          effects: { karma: 5, looks: 2, happy: -2, flag: 'job_casi_hatlive' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { coworker: 'nod' } } },
        { label: 'Chi tiền thuê đội PR “dìm” tin',
          outcomes: [
            { p: 0.6, text: 'Đội PR tung ngay một drama khác của người nổi tiếng khác. Ba ngày sau, chẳng ai còn nhớ clip của bạn. Chỉ có ví bạn là nhớ.',
              effects: { money: -150000000, karma: -5, happy: 2 },
              scene: { anim: 'phone', fx: 'money', npcAnim: { coworker: 'laugh' } } },
            { p: 0.4, text: 'Một trang tin tung ảnh chụp đoạn chat bạn thuê người dìm tin, kèm bảng giá. Công ty quản lý tuyên bố chấm dứt hợp đồng với bạn để “giữ uy tín”.',
              effects: { money: -150000000, karma: -6, looks: -8, happy: -10, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { coworker: 'shake' }, npcSay: { coworker: 'Chị hết cứu nổi em rồi.' } } }
          ] },
        { label: 'Im lặng chờ cơn bão qua',
          text: 'Bạn tắt bình luận, không nói một lời. Nhãn hàng mỹ phẩm rút hợp đồng, vài show tháng sau bị hủy. Một tháng sau, mạng xã hội đã có drama mới.',
          effects: { happy: -5, looks: -3, money: -60000000 },
          scene: { anim: 'sad', fx: 'zzz' } },
        { label: 'Tung bản live acoustic để “phục thù”', req: { flag: 'job_casi_hatlive' },
          text: 'Bạn thu một bản live mộc trong phòng tập, chỉ một cây guitar và giọng thật. Video vượt cả clip hát nhép, nhãn hàng quay lại với mức cát-sê cao hơn.',
          effects: { looks: 8, happy: 10, money: 80000000, job: 'raise' },
          scene: { anim: 'sing', fx: 'music', npcAnim: { coworker: 'clap' } } }
      ]
    },
    {
      id: 's_job_casi_scandal', title: 'Scandal đời tư', icon: '📸', age: [18, 65], weight: 1.4,
      req: { jobId: ['casi'], notFlag: 'job_casi_scandal' },
      text: 'Ba giờ sáng, một fanpage “bóc phốt” đăng loạt ảnh chụp lén bạn đi ăn khuya với một người lạ, kèm đoạn tin nhắn cắt ghép tố bạn “sống hai mặt” và quỵt tiền ekip. Đến sáng, tên bạn đứng top 1 tìm kiếm, điện thoại rung không ngừng.',
      scene: { loc: 'bedroom', time: 'night', weather: 'rain', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'coworker', gender: 'f', age: 34, anim: 'phone', say: 'Đừng đăng gì hết, chờ chị!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Viết thư tay, nói thật mọi chuyện',
          success: { stat: 'karma', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn kể rõ người trong ảnh là ai, đưa luôn sao kê đã trả đủ tiền ekip. Fan lũ lượt vào bênh, fanpage kia lặng lẽ xóa bài.',
              effects: { happy: 4, looks: 3, karma: 5, flag: 'job_casi_scandal' },
              scene: { anim: 'type', fx: 'sparkle', npcAnim: { coworker: 'clap' } } },
            { text: 'Bạn nói thật, nhưng người ta chỉ thích tin xấu. Lượt theo dõi rơi mất hai trăm nghìn, vài show hủy hẹn.',
              effects: { happy: -6, looks: -3, karma: 3, money: -50000000, flag: 'job_casi_scandal' },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Chối bay, dọa kiện fanpage',
          outcomes: [
            { p: 0.6, text: 'Bạn đăng thông báo đanh thép, gửi thư luật sư cho fanpage. Họ xóa bài, nhưng người quản trị nhắn riêng: “Còn nhiều thứ lắm, cứ chờ đấy.”',
              effects: { karma: -4, happy: 2, flag: ['job_casi_scandal', 'job_casi_choi'], followUp: { id: 's_job_casi_scandal_bang', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'nod' } } },
            { p: 0.4, text: 'Lời phủ nhận dứt khoát của bạn khiến dư luận chuyển hướng. Fanpage kia bị báo cáo đến mức sập trang. Chuyện tạm êm.',
              effects: { karma: -3, happy: 3, flag: ['job_casi_scandal', 'job_casi_choi'] },
              scene: { anim: 'shrug', fx: 'sparkle' } }
          ] },
        { label: 'Tận dụng ồn ào để tung MV mới',
          text: 'Đúng lúc cả mạng đang bàn về bạn, MV mới lên sóng. Mười triệu lượt xem sau hai ngày, nhưng báo chí gọi đó là “chiêu trò làm nóng tên tuổi”.',
          effects: { money: 200000000, looks: 5, karma: -6, happy: 2, flag: 'job_casi_scandal' },
          scene: { anim: 'dance', fx: 'money', npcAnim: { coworker: 'laugh' } } },
        { label: 'Tắt mạng, về quê trốn một thời gian',
          text: 'Bạn tắt điện thoại, về quê hái rau, ngủ trưa trên võng. Hủy show phải đền hợp đồng, nhưng lần đầu sau nhiều năm bạn ngủ đủ tám tiếng.',
          effects: { happy: 4, health: 3, looks: -4, money: -50000000, flag: 'job_casi_scandal' },
          scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 's_job_casi_scandal_bang', title: 'Phốt chồng phốt', icon: '💣', age: [18, 70], chainOnly: true,
      req: { jobId: ['casi'], flag: 'job_casi_choi' },
      text: 'Một năm sau vụ ảnh chụp lén, một thành viên ekip cũ tung đoạn ghi âm và bảng lương thật: những điều bạn từng chối đều là sự thật. Hai nhãn hàng đơn phương chấm dứt hợp đồng, báo chí xếp hàng trước cửa nhà.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'crowd', anim: 'phone', say: 'Anh chị có gì muốn nói không?' }, { role: 'coworker', gender: 'f', anim: 'facepalm' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Cúi đầu xin lỗi công khai, bồi thường ekip',
          text: 'Bạn đứng trước ống kính, cúi đầu thật lâu, rồi trả đủ tiền cho ekip cũ kèm bồi thường hợp đồng. Mất rất nhiều, nhưng ít ra từ nay bạn không phải nhớ mình đã nói dối điều gì.',
          effects: { karma: 6, happy: -8, looks: -6, money: -300000000 },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { crowd: 'phone' } } },
        { label: 'Tiếp tục chối, thuê luật sư đấu đến cùng',
          outcomes: [
            { p: 0.5, text: 'Vụ kiện kéo dài, tiền luật sư chảy như nước. Bạn thắng một phần về thủ tục, nhưng trong mắt công chúng bạn đã thua từ lâu.',
              effects: { money: -400000000, happy: -10, karma: -4 },
              scene: { anim: 'think', fx: 'money' } },
            { p: 0.5, text: 'Công ty quản lý tuyên bố chấm dứt hợp đồng, các show còn lại bị hủy sạch. Bạn ngồi một mình giữa căn hộ im ắng, poster của chính mình nhìn xuống.',
              effects: { money: -200000000, looks: -10, happy: -12, karma: -4, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', loc: 'home' } }
          ] },
        { label: 'Rút khỏi showbiz, làm lại từ đầu',
          text: 'Bạn đăng một dòng ngắn: “Tôi xin dừng lại để sửa mình.” Rồi tắt hết mạng xã hội. Không còn ánh đèn, nhưng cũng không còn những đêm thức trắng đọc bình luận.',
          effects: { happy: -2, health: 5, karma: 3, job: 'fire' },
          scene: { anim: 'walk', fx: 'dust', loc: 'park', time: 'dusk' } }
      ]
    },
    {
      id: 's_job_casi_liveshow', title: 'Giấc mơ đêm nhạc riêng', icon: '🎟️', age: [18, 65], weight: 1.3,
      req: { jobId: ['casi'], notFlag: 'job_casi_liveshow' },
      text: 'Một bầu show có tiếng hẹn bạn ra quán cà phê, đẩy sang bản kế hoạch: đêm nhạc riêng mang tên bạn. Muốn làm lớn ở nhà thi đấu năm nghìn chỗ thì bạn phải góp vốn {money:500000000}, lời ăn lỗ chịu.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 48, anim: 'talk', say: 'Tên em đủ sức bán hết vé đấy.' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Liều một phen: nhà thi đấu năm nghìn chỗ', req: { minMoney: 500000000 },
          text: 'Bạn ký hợp đồng, chuyển khoản mà tay hơi run. Cả năm sau đó bạn tập hát, tập nhảy đến khuya.',
          effects: { money: -500000000, happy: 3, flag: ['job_casi_liveshow', 'job_casi_lon'], followUp: { id: 's_job_casi_liveshow_dem', delay: 1 } },
          scene: { anim: 'nod', fx: 'money', npcAnim: { stranger: 'clap' } } },
        { label: 'Làm đêm nhạc nhỏ ấm cúng ở phòng trà',
          text: 'Ba trăm ghế, ánh đèn vàng, ban nhạc mộc. Bạn bỏ ra {money:80000000} và bắt đầu chọn từng bài hát mình thương nhất.',
          effects: { money: -80000000, happy: 4, flag: ['job_casi_liveshow', 'job_casi_nho'], followUp: { id: 's_job_casi_liveshow_dem', delay: 1 } },
          scene: { anim: 'think', fx: 'music', npcAnim: { stranger: 'nod' } } },
        { label: 'Chưa đủ tầm, để vài năm nữa',
          text: 'Bạn từ chối khéo. Người ta nói bạn nhát, nhưng bạn biết mình cần thêm vài bản hit nữa.',
          effects: { happy: -2, smarts: 2 },
          scene: { anim: 'shake', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 's_job_casi_liveshow_dem', title: 'Đêm nhạc riêng cháy vé', icon: '🔥', age: [18, 70], chainOnly: true,
      req: { jobId: ['casi'] },
      text: 'Vé đêm nhạc của bạn bán sạch trong hai giờ, chợ đen đội giá gấp ba. Sau cánh gà, bạn nghe rõ tiếng khán giả hô tên mình đều đặn như nhịp trống. Đèn sân khấu bật sáng.',
      scene: { loc: 'karaoke', time: 'night', weather: 'clear', anim: 'wave', expr: 'happy',
        npcs: [{ role: 'crowd', anim: 'cheer', say: 'Ra đi! Ra đi!' }, { role: 'coworker', gender: 'f', anim: 'clap', say: 'Lên đi em, của em hết!' }], fx: 'fireworks', shot: 'orbit' },
      choices: [
        { label: 'Cháy hết mình trước năm nghìn khán giả', req: { flag: 'job_casi_lon' },
          text: 'Ba tiếng đồng hồ, năm nghìn ánh đèn flash, khán giả hát theo từng câu. Trừ hết chi phí, bạn thu về {money:1500000000}, và sáng hôm sau các bầu show xếp hàng mời bạn.',
          effects: { money: 1500000000, looks: 8, happy: 15, job: 'promote' },
          scene: { anim: 'sing', fx: 'confetti', npcAnim: { crowd: 'dance' } } },
        { label: 'Hát mộc, kể chuyện đời bên cây đàn', req: { flag: 'job_casi_nho' },
          text: 'Ba trăm khán giả ngồi lặng như tờ nghe bạn kể về những năm hát phòng trà kiếm từng đồng. Đến bài cuối, nhiều người khóc. Clip đêm nhạc lan khắp mạng, cát-sê của bạn tăng hẳn.',
          effects: { money: 200000000, looks: 5, happy: 12, karma: 3, job: 'raise' },
          scene: { anim: 'sing', fx: 'music', npcAnim: { crowd: 'cry' } } },
        { label: 'Mời một khán giả lên song ca',
          outcomes: [
            { p: 0.7, text: 'Cô bé sinh viên run run cầm micro, hát lạc tông nhưng cả khán phòng vỗ tay theo nhịp. Khoảnh khắc ấy thành clip triệu view.',
              effects: { money: 300000000, looks: 6, happy: 10 },
              scene: { anim: 'dance', fx: 'hearts', npcAnim: { crowd: 'clap' } } },
            { p: 0.3, text: 'Một fan cuồng lao lên ôm chặt bạn không buông, bảo vệ phải can ra. Đêm nhạc vẫn trọn vẹn, nhưng bạn giật mình mãi.',
              effects: { money: 250000000, looks: 2, happy: -3 },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { crowd: 'point' } } }
          ] }
      ]
    },
    // ============================== DIỄN VIÊN ==============================
    {
      id: 's_job_dienvien_gagam', title: 'Bị gạ gẫm đổi vai', icon: '🚫', age: [18, 55], weight: 1.4,
      req: { jobId: ['dienvien'], notFlag: 'job_dienvien_gagam' },
      text: 'Sau buổi casting vai chính cho một bộ phim chiếu rạp, nhà sản xuất {stranger} giữ bạn lại. Ông ta rót trà, cười rất hiền: “Vai này nhiều người muốn lắm. Tối nay em qua khách sạn bàn thêm, mình “trao đổi” cho rõ thì vai là của em.” Ánh mắt ông ta khiến bạn lạnh sống lưng.',
      scene: { loc: 'office', time: 'dusk', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 52, anim: 'talk', say: 'Tối nay qua bàn thêm nhé em.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Từ chối thẳng thừng rồi bước ra',
          text: 'Bạn đứng dậy: “Em đến đây để diễn, không phải để trao đổi.” Cửa đóng sầm sau lưng. Tuần sau, vai chính về tay người khác, nhưng bạn ngẩng cao đầu.',
          effects: { karma: 8, happy: -4, flag: 'job_dienvien_gagam' },
          scene: { anim: 'shake', fx: 'anger', npcAnim: { stranger: 'shrug' }, say: 'Em đến để diễn thôi ạ.' } },
        { label: 'Bật ghi âm, khéo léo để ông ta nói rõ hơn',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn giả vờ ngây ngô hỏi lại, và ông ta nói rõ từng chữ. Ra khỏi phòng, file ghi âm dài mười hai phút nằm gọn trong điện thoại. Tay bạn vẫn run, nhưng lòng thì đã quyết.',
              effects: { smarts: 3, karma: 3, happy: -3, flag: ['job_dienvien_gagam', 'job_dienvien_bangchung'], followUp: { id: 's_job_dienvien_toco', delay: 0 } },
              scene: { anim: 'phone', fx: 'idea', npcAnim: { stranger: 'laugh' } } },
            { text: 'Điện thoại bỗng đổ chuông giữa chừng, ông ta liếc thấy màn hình đang ghi âm. Mặt ông ta sầm lại: “Liệu hồn đấy. Cái nghề này nhỏ lắm.”',
              effects: { happy: -8, flag: ['job_dienvien_gagam', 'job_dienvien_bidoa'], followUp: { id: 's_job_dienvien_toco', delay: 0 } },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { stranger: 'angry' }, npcSay: { stranger: 'Cái nghề này nhỏ lắm.' } } }
          ] },
        { label: 'Bỏ luôn công ty quản lý đã sắp xếp buổi này',
          text: 'Hóa ra chính công ty quản lý đã “gợi ý” bạn ở lại. Bạn nộp đơn chấm dứt hợp đồng, chịu phạt {money:50000000}, rồi tự đi casting một mình. Đường khó hơn, nhưng sạch.',
          effects: { karma: 6, happy: -3, money: -50000000, flag: 'job_dienvien_gagam' },
          scene: { anim: 'walk', fx: 'dust', loc: 'street', npcAnim: { stranger: 'angry' } } }
      ]
    },
    {
      id: 's_job_dienvien_toco', title: 'Lên tiếng', icon: '📢', age: [18, 60], chainOnly: true,
      req: { jobId: ['dienvien'] },
      text: 'Bạn kể chuyện cho một người bạn diễn, và cô ấy bật khóc: cô cũng từng gặp đúng câu nói ấy, từ đúng người ấy. Rồi thêm hai, ba người nữa nhắn tin cho bạn. Một nhà báo điều tra hẹn gặp, hỏi bạn có dám đứng tên không.',
      scene: { loc: 'cafe', time: 'night', weather: 'rain', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'coworker', gender: 'f', age: 26, anim: 'cry', say: 'Em cũng từng bị y như vậy…' }, { role: 'stranger', gender: 'f', age: 40, anim: 'talk', say: 'Chị cần một người dám đứng tên.' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Cùng mọi người tố cáo, nộp ghi âm cho công an', req: { flag: 'job_dienvien_bangchung' },
          outcomes: [
            { p: 0.75, text: 'Đoạn ghi âm cùng lời khai của bốn diễn viên khiến cơ quan điều tra vào cuộc. Nhà sản xuất kia bị khởi tố, cả showbiz rúng động. Một đạo diễn lớn gọi bạn: “Tôi muốn làm việc với người như em.”',
              effects: { karma: 12, happy: 8, looks: 5, job: 'promote' },
              scene: { anim: 'nod', fx: 'sparkle', loc: 'office', npcAnim: { coworker: 'hug' } } },
            { p: 0.25, text: 'Ông ta bị điều tra, nhưng nhiều nhà sản xuất lặng lẽ gạch tên bạn khỏi danh sách casting. Cả năm trời không ai gọi, bạn sống bằng nghề dạy diễn xuất cho trẻ con.',
              effects: { karma: 10, happy: -6, money: -40000000 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'hug' } } }
          ] },
        { label: 'Đứng tên kể lại trên báo, dù không có bằng chứng',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bài báo gây chấn động; thêm nhiều người lên tiếng, đủ để ông ta phải rút khỏi dự án. Bạn nhận được hàng nghìn tin nhắn: “Cảm ơn vì đã nói thay em.”',
              effects: { karma: 10, happy: 4, looks: 4 },
              scene: { anim: 'phone', fx: 'hearts' } },
            { text: 'Ông ta phản pháo, dọa kiện bạn tội vu khống. Bạn mất hai hợp đồng quảng cáo, nhưng không rút lại một chữ nào.',
              effects: { karma: 8, happy: -8, money: -100000000 },
              scene: { anim: 'angry', fx: 'anger' } }
          ] },
        { label: 'Giữ im lặng, chỉ cảnh báo riêng các bạn trẻ',
          text: 'Bạn chưa đủ sức đối đầu. Nhưng từ đó, mỗi khi có diễn viên trẻ được hẹn “bàn riêng”, bạn đều kéo họ ra nhắn một câu: “Đừng đi một mình.”',
          effects: { karma: 4, happy: -4 },
          scene: { anim: 'talk', fx: 'question', npcAnim: { coworker: 'nod', stranger: 'sad' } } }
      ]
    },
    {
      id: 's_job_dienvien_bichhe', title: 'Phim bị khán giả chê', icon: '🍅', age: [16, 70], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['dienvien'] },
      text: 'Bộ phim bạn đóng ra rạp được ba ngày thì bị suất chiếu cắt sạch. Trên mạng, người ta cắt cảnh khóc của bạn ghép nhạc hài, kèm bình luận “diễn đơ như tượng sáp”. Đạo diễn trả lời phỏng vấn: “Diễn viên chưa tới.”',
      scene: { loc: 'home', time: 'night', weather: 'rain', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'crowd', anim: 'laugh', say: 'Diễn đơ như tượng sáp!' }], fx: 'heartbreak', shot: 'close' },
      choices: [
        { label: 'Đăng ký lớp diễn xuất, học lại từ đầu',
          text: 'Bạn bỏ {money:30000000} học lớp diễn xuất của một nghệ sĩ gạo cội, ngày nào cũng tập trước gương đến khàn giọng. Lần sau, bạn sẽ không để ai gọi mình là tượng sáp.',
          effects: { money: -30000000, smarts: 5, happy: 2, flag: 'job_dienvien_hoc' },
          scene: { anim: 'study', fx: 'idea', loc: 'school', npcAnim: { crowd: 'idle' } } },
        { label: 'Vào tận nơi cãi tay đôi với antifan',
          outcomes: [
            { p: 0.4, text: 'Bạn trả lời dí dỏm, tự chế ảnh chế của chính mình. Dân mạng quay sang khen bạn “tấu hài có duyên”, lượng theo dõi tăng vọt.',
              effects: { looks: 4, happy: 4 },
              scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { crowd: 'clap' } } },
            { p: 0.6, text: 'Câu trả lời nóng nảy của bạn bị chụp màn hình và lan nhanh hơn cả trailer. Báo mạng giật tít: “Diễn viên không biết nhận góp ý”.',
              effects: { looks: -6, happy: -6, karma: -2 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { crowd: 'point' } } }
          ] },
        { label: 'Thuê dịch vụ “seeding” khen phim',
          outcomes: [
            { p: 0.5, text: 'Hàng nghìn tài khoản ảo khen nức nở. Phim vẫn ế, nhưng ít ra bình luận dưới tên bạn đã dễ thở hơn.',
              effects: { money: -40000000, karma: -4 },
              scene: { anim: 'type', fx: 'money' } },
            { p: 0.5, text: 'Một reviewer phát hiện cả trăm bình luận khen giống hệt nhau từng dấu chấm. Bạn bị gọi là “diễn viên tự khen”, và trò cười nhân đôi.',
              effects: { money: -40000000, karma: -5, looks: -6, happy: -8 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] },
        { label: 'Tắt mạng, nhận vai khác ngay',
          text: 'Bạn không đọc thêm một bình luận nào, xách va li vào đoàn phim mới. Vai nhỏ, cát-sê thấp, nhưng làm việc là cách quên nhanh nhất.',
          effects: { happy: -2, money: 20000000 },
          scene: { anim: 'walk', fx: 'dust', loc: 'studio' } }
      ]
    },
    {
      id: 's_job_dienvien_vaidoi', title: 'Lời mời cho một vai khó', icon: '🎭', age: [20, 70], weight: 1.3,
      req: { jobId: ['dienvien'], notFlag: 'job_dienvien_vaidoi' },
      text: 'Một đạo diễn phim nghệ thuật đưa bạn kịch bản về một ngư dân mất trắng sau trận lũ miền Trung. Vai cần giảm tám cân, sống nửa năm ở làng chài, cát-sê chỉ bằng một phần ba phim thương mại. Cùng tuần đó, một phim hài Tết mời bạn với giá gấp ba.',
      scene: { loc: 'cafe', time: 'day', weather: 'cloudy', anim: 'study', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'm', age: 55, anim: 'talk', say: 'Vai này cần người dám sống thật.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Nhận vai, sống nửa năm ở làng chài',
          text: 'Bạn dọn về làng chài, phơi nắng, vá lưới, ăn cơm với muối mè cùng người dân. Đến ngày bấm máy, không ai trong đoàn nhận ra bạn.',
          effects: { health: -5, happy: 3, smarts: 3, money: 60000000, flag: 'job_dienvien_vaidoi', followUp: { id: 's_job_dienvien_canhdieu', delay: 1 } },
          scene: { anim: 'lift', fx: 'sweat', loc: 'beach', time: 'dawn', npcAnim: { stranger: 'nod' } } },
        { label: 'Chọn phim hài Tết, cát-sê gấp ba',
          text: 'Phim hài Tết thắng lớn phòng vé, tài khoản của bạn rủng rỉnh hẳn. Đôi khi bạn vẫn nghĩ về người ngư dân vùng lũ mà mình đã không đóng.',
          effects: { money: 250000000, happy: 4, looks: 3, flag: 'job_dienvien_vaidoi' },
          scene: { anim: 'laugh', fx: 'money', decor: 'tet', npcAnim: { stranger: 'shrug' } } },
        { label: 'Nhận vai nhưng không chịu giảm cân',
          text: 'Bạn thương lượng được với đoàn phim, diễn với thân hình hiện tại. Phim làm xong, đẹp nhưng thiếu điều gì đó.',
          effects: { money: 60000000, happy: 2, flag: 'job_dienvien_vaidoi' },
          scene: { anim: 'shrug', npcAnim: { stranger: 'think' } } }
      ]
    },
    {
      id: 's_job_dienvien_canhdieu', title: 'Vai diễn để đời', icon: '🏆', age: [20, 75], chainOnly: true,
      req: { jobId: ['dienvien'] },
      text: 'Bộ phim về người ngư dân vùng lũ ra mắt và khiến khán phòng khóc ròng. Tối nay, tên bạn nằm trong đề cử Diễn viên chính xuất sắc ở lễ trao giải điện ảnh. Người dẫn chương trình bắt đầu mở phong bì.',
      scene: { loc: 'studio', time: 'night', weather: 'clear', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 40, anim: 'talk', say: 'Và giải thưởng thuộc về…' }, { role: 'crowd', anim: 'sit' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Nắm chặt tay, chờ xướng tên',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Tên bạn vang lên. Bạn bước lên sân khấu, cầm chiếc cúp nặng trĩu, nói không trọn câu. Sáng hôm sau, kịch bản từ khắp nơi gửi về chất đầy bàn.',
              effects: { happy: 15, looks: 8, money: 100000000, job: 'promote' },
              scene: { anim: 'cry', fx: 'confetti', npcAnim: { crowd: 'clap' } } },
            { text: 'Giải thuộc về người khác. Nhưng bên dưới hội trường, cả đoàn phim đứng dậy vỗ tay cho bạn, và báo chí gọi đây là “vai diễn để đời”.',
              effects: { happy: 6, looks: 5, job: 'raise' },
              scene: { anim: 'clap', fx: 'sparkle', npcAnim: { crowd: 'clap' } } }
          ] },
        { label: 'Bình thản: đã học diễn xuất bài bản, vai đã nói thay mình', req: { flag: 'job_dienvien_hoc' },
          text: 'Những tháng học lại từ đầu đã được đền đáp. Tên bạn vang lên, và trên sân khấu bạn cảm ơn cả những người từng gọi mình là “tượng sáp”.',
          effects: { happy: 15, looks: 10, smarts: 3, money: 100000000, job: 'promote' },
          scene: { anim: 'bow', fx: 'stars', npcAnim: { crowd: 'cheer' } } }
      ]
    },
    // ============================== NGƯỜI MẪU ==============================
    {
      id: 's_job_nguoimau_giamcan', title: 'Bị ép giảm cân cấp tốc', icon: '⚖️', age: [16, 40], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['nguoimau'] },
      text: 'Hai tuần trước show lớn, chị quản lý agency quấn thước dây quanh eo bạn rồi nhíu mày: “Dư hai phân.” Chị đặt lên bàn một hộp thuốc giảm cân “xách tay”, không nhãn mác: “Hai tuần, năm ký. Không thì nhường suất diễn cho đứa khác.”',
      scene: { loc: 'gym', time: 'day', weather: 'clear', anim: 'idle', expr: 'sad',
        npcs: [{ role: 'boss', gender: 'f', age: 42, anim: 'point', say: 'Hai tuần, năm ký. Không thì nghỉ.' }, { role: 'coworker', gender: 'f', age: 20, anim: 'eat', expr: 'scared' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Uống thuốc, nhịn ăn cho kịp',
          success: { stat: 'health', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn sống bằng nước lọc và thuốc trong mười bốn ngày, giảm đủ năm ký. Trên sàn diễn bạn rực rỡ, nhưng tóc rụng từng nắm và tim đập loạn mỗi đêm.',
              effects: { health: -8, looks: 3, happy: -3, money: 30000000 },
              scene: { anim: 'walk', fx: 'flash', loc: 'studio', time: 'night', npcAnim: { boss: 'clap' } } },
            { text: 'Đến buổi tổng duyệt, mắt bạn tối sầm rồi ngã quỵ sau cánh gà. Bạn tỉnh dậy trong bệnh viện với ống truyền dịch, và suất diễn đã về tay người khác.',
              effects: { health: -12, happy: -8, illness: 'Suy nhược cơ thể' },
              scene: { anim: 'sick', fx: 'sick', loc: 'hospital', npcAnim: { boss: 'phone' } } }
          ] },
        { label: 'Ăn uống khoa học, tập cùng huấn luyện viên',
          outcomes: [
            { p: 0.6, text: 'Ức gà, rau luộc, chạy bộ mỗi sáng. Bạn giảm được ba ký, săn chắc hơn hẳn, và chị quản lý miễn cưỡng gật đầu cho bạn diễn.',
              effects: { health: 4, looks: 3, happy: 2 },
              scene: { anim: 'run', fx: 'sparkle', npcAnim: { boss: 'nod' } } },
            { p: 0.4, text: 'Bạn khỏe hơn, nhưng cân nặng chưa đạt “chuẩn”. Suất diễn về tay người khác, bạn tức đến phát khóc.',
              effects: { health: 3, happy: -5 },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { boss: 'shake' } } }
          ] },
        { label: 'Từ chối, đăng bài về áp lực cân nặng',
          outcomes: [
            { p: 0.5, text: 'Bài viết của bạn được chia sẻ chóng mặt, nhiều người mẫu khác lên tiếng theo. Một nhãn hàng thời trang “body positive” mời bạn làm gương mặt đại diện.',
              effects: { karma: 6, looks: 5, happy: 5, money: 80000000 },
              scene: { anim: 'phone', fx: 'hearts', npcAnim: { boss: 'facepalm' } } },
            { p: 0.5, text: 'Bài viết được nhiều người ủng hộ, nhưng agency lập tức chấm dứt hợp đồng với lý do “vi phạm bảo mật nội bộ”. Bạn mất việc, nhưng không mất mình.',
              effects: { karma: 6, happy: -4, job: 'fire' },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_nguoimau_quangcao', title: 'Hợp đồng quảng cáo lớn', icon: '💼', age: [16, 45], weight: 1.4,
      req: { jobId: ['nguoimau'], notFlag: 'job_nguoimau_qc' },
      text: 'Cùng một tuần, hai lời mời đến tay bạn. Một hãng mỹ phẩm quốc tế trả {money:1200000000} cho hai năm độc quyền, điều khoản đạo đức dày cộp. Một hãng “trà giảm cân thần tốc” trả {money:3000000000}, chỉ cần bạn nói trước ống kính: “Mười ký trong bảy ngày!”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 38, anim: 'talk', say: 'Hãng em làm việc rất chuyên nghiệp.' }, { role: 'stranger', gender: 'm', age: 45, anim: 'point', say: 'Ba tỷ, ký là chuyển khoản!' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Ký với hãng mỹ phẩm quốc tế',
          text: 'Gương mặt bạn xuất hiện trên biển quảng cáo khổng lồ giữa trung tâm thành phố. Tiền ít hơn, nhưng tên bạn đứng cạnh một thương hiệu đàng hoàng.',
          effects: { money: 1200000000, looks: 6, happy: 8, job: 'raise', flag: 'job_nguoimau_qc' },
          scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'clap' } } },
        { label: 'Nhận ba tỷ của hãng trà giảm cân',
          text: 'Ba tỷ về tài khoản trong một buổi chiều. Bạn đọc câu thoại “mười ký trong bảy ngày” mà cố không nghĩ xem trong gói trà đó có gì.',
          effects: { money: 3000000000, karma: -8, happy: 4, flag: ['job_nguoimau_qc', 'job_nguoimau_trabay'], followUp: { id: 's_job_nguoimau_bephanh', delay: 1 } },
          scene: { anim: 'drink', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Đòi xem giấy kiểm nghiệm trà trước khi ký',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn nhờ bạn quen ở trung tâm kiểm nghiệm xem giấy tờ: con dấu giả, số đăng ký không tồn tại. Bạn từ chối, báo cho quản lý thị trường, rồi ký với hãng mỹ phẩm.',
              effects: { money: 1200000000, karma: 6, smarts: 2, looks: 4, flag: 'job_nguoimau_qc' },
              scene: { anim: 'point', fx: 'idea', npcAnim: { stranger: 'scared' } } },
            { text: 'Họ đưa ra một xấp giấy tờ đóng dấu đỏ chót, trông rất thật. Bạn yên tâm ký hợp đồng ba tỷ.',
              effects: { money: 3000000000, karma: -2, flag: ['job_nguoimau_qc', 'job_nguoimau_trabay'], followUp: { id: 's_job_nguoimau_bephanh', delay: 1 } },
              scene: { anim: 'nod', fx: 'money', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_nguoimau_bephanh', title: 'Nhãn hàng bị phanh phui', icon: '🚨', age: [16, 50], chainOnly: true,
      req: { jobId: ['nguoimau'], flag: 'job_nguoimau_trabay' },
      text: 'Lực lượng quản lý thị trường đột kích kho của hãng trà giảm cân: sản phẩm chứa chất cấm, hàng chục người phải nhập viện. Gương mặt bạn trên bao bì bị báo chí khoanh đỏ, và bạn nhận giấy mời lên làm việc với cơ quan công an.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 40, anim: 'talk', say: 'Bạn đã kiểm tra sản phẩm chưa?' }, { role: 'crowd', anim: 'phone' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Hợp tác, xin lỗi và góp tiền chữa bệnh cho nạn nhân',
          text: 'Bạn khai đầy đủ, nộp lại phần lớn thù lao để hỗ trợ người bị hại, rồi đăng lời xin lỗi không một chữ biện minh. Danh tiếng sứt mẻ, nhưng đêm đó bạn ngủ được.',
          effects: { money: -2000000000, karma: 8, happy: -8, looks: -5 },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Đổ hết trách nhiệm cho nhãn hàng',
          outcomes: [
            { p: 0.5, text: 'Bạn chỉ nhận một khoản phạt hành chính vì quảng cáo sai sự thật. Nhưng cư dân mạng không quên: dưới mọi bài đăng của bạn là ảnh người nằm viện.',
              effects: { money: -70000000, looks: -8, karma: -4, happy: -6 },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { crowd: 'point' } } },
            { p: 0.5, text: 'Đoạn chat bạn đùa “trà này uống chắc tiêu chảy” bị trích xuất. Hãng mỹ phẩm, agency, các show đều chấm dứt hợp đồng cùng lúc.',
              effects: { money: -500000000, looks: -12, karma: -6, happy: -12, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { police: 'shake' } } }
          ] },
        { label: 'Lặng lẽ xóa hết bài quảng cáo',
          text: 'Bạn xóa sạch mọi bài đăng trong một đêm, nhưng ảnh chụp màn hình thì còn mãi. Bạn vẫn bị phạt, và dân mạng gọi bạn là “người mẫu xóa dấu vết”.',
          effects: { money: -70000000, karma: -4, looks: -6, happy: -6 },
          scene: { anim: 'type', fx: 'sweat' } }
      ]
    },
    {
      id: 's_job_nguoimau_casting', title: 'Buổi casting của agency nước ngoài', icon: '🌍', age: [17, 35], weight: 1.3,
      req: { jobId: ['nguoimau'], notFlag: 'job_nguoimau_tuanle' },
      text: 'Một agency từ Paris sang {city} tuyển người mẫu cho tuần lễ thời trang quốc tế. Hàng trăm gương mặt xếp hàng từ sáng sớm. Đến lượt bạn, vị giám đốc casting tóc bạc chỉ nói một câu: “Walk.”',
      scene: { loc: 'studio', time: 'day', weather: 'clear', anim: 'walk', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'm', age: 58, anim: 'sit', say: 'Walk, please.' }, { role: 'crowd', anim: 'idle' }], fx: 'flash', shot: 'low' },
      choices: [
        { label: 'Sải bước catwalk hết sức mình',
          success: { stat: 'looks', base: 0.15, scale: 0.6 },
          outcomes: [
            { text: 'Bạn bước đi như thể cả sàn diễn là của mình. Ông ta gật đầu, ghi một dấu sao cạnh tên bạn: “See you in Paris.”',
              effects: { happy: 10, looks: 3, flag: 'job_nguoimau_tuanle', followUp: { id: 's_job_nguoimau_paris', delay: 1 } },
              scene: { anim: 'walk', fx: 'stars', npcAnim: { stranger: 'nod' } } },
            { text: '“Next.” Chỉ một từ. Bạn bước ra ngoài, nắng chói chang, và tự hứa sang năm sẽ quay lại.',
              effects: { happy: -5, smarts: 2 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { stranger: 'shake' } } }
          ] },
        { label: 'Giới thiệu bản thân bằng tiếng Anh thật tự tin',
          success: { stat: 'smarts', base: 0.15, scale: 0.6 },
          outcomes: [
            { text: 'Bạn kể về những năm chạy show ở chợ đêm, bằng thứ tiếng Anh trôi chảy và hài hước. Ông ta bật cười: “Personality. We need that.”',
              effects: { happy: 10, smarts: 2, flag: 'job_nguoimau_tuanle', followUp: { id: 's_job_nguoimau_paris', delay: 1 } },
              scene: { anim: 'talk', fx: 'stars', npcAnim: { stranger: 'laugh' } } },
            { text: 'Bạn nói vấp, quên cả từ “experience”. Ông ta mỉm cười lịch sự và gọi người tiếp theo.',
              effects: { happy: -5, smarts: 2 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Thôi, sàn diễn trong nước là đủ',
          text: 'Bạn lặng lẽ rời hàng. Ở nhà còn mấy show trong nước đang chờ, tiền đều đặn, khỏi lo xa.',
          effects: { happy: 1 },
          scene: { anim: 'walk', fx: 'dust', loc: 'street' } }
      ]
    },
    {
      id: 's_job_nguoimau_paris', title: 'Diễn ở tuần lễ thời trang quốc tế', icon: '👠', age: [17, 40], chainOnly: true,
      req: { jobId: ['nguoimau'] },
      text: 'Paris, tuần lễ thời trang. Bạn là gương mặt Việt duy nhất trong show. Đèn flash chớp liên hồi, nhạc dồn dập, và đúng giữa sàn diễn, gót đôi giày mười lăm phân gãy “rắc” dưới chân bạn.',
      scene: { loc: 'studio', time: 'night', weather: 'clear', anim: 'walk', expr: 'surprised',
        npcs: [{ role: 'crowd', anim: 'phone' }, { role: 'stranger', gender: 'f', age: 45, anim: 'scared', say: 'Oh no…' }], fx: 'flash', shot: 'low' },
      choices: [
        { label: 'Đá văng đôi giày, sải bước chân trần',
          outcomes: [
            { p: 0.7, text: 'Bạn nhấc giày cầm trên tay, bước chân trần đến cuối sàn rồi tạo dáng như thể đó là kịch bản. Khán phòng vỗ tay rần rần, clip lên khắp các trang thời trang thế giới.',
              effects: { looks: 10, happy: 12, money: 500000000, job: 'promote' },
              scene: { anim: 'walk', fx: 'stars', npcAnim: { crowd: 'clap', stranger: 'clap' } } },
            { p: 0.3, text: 'Khán giả thích mê, nhưng nhà thiết kế thì giận vì bạn “phá concept”. Dù vậy, ba agency khác đã kịp xin số điện thoại của bạn.',
              effects: { looks: 6, happy: 3, money: 150000000 },
              scene: { anim: 'shrug', fx: 'flash', npcAnim: { stranger: 'angry', crowd: 'clap' } } }
          ] },
        { label: 'Cố đi tiếp trên một chiếc gót',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn dồn trọng tâm sang chân kia, bước đi chậm mà vẫn uyển chuyển. Không ai nhận ra, trừ nhà thiết kế, người ôm chầm lấy bạn sau show.',
              effects: { looks: 6, happy: 8, money: 300000000, job: 'promote' },
              scene: { anim: 'walk', fx: 'sparkle', npcAnim: { stranger: 'hug' } } },
            { text: 'Cổ chân bạn lật sang một bên, bạn ngã ngồi giữa sàn diễn trước hàng trăm ống kính. Bác sĩ chẩn đoán bong gân, phải nghỉ cả tháng.',
              effects: { health: -8, looks: -2, happy: -6, illness: 'Bong gân cổ chân' },
              scene: { anim: 'fall', fx: 'flash', npcAnim: { crowd: 'scared' } } }
          ] },
        { label: 'Dừng lại, xin lỗi rồi lui vào cánh gà',
          text: 'Bạn khựng lại, cúi đầu xin lỗi và đi thẳng vào hậu trường. Show vẫn tiếp tục, nhưng tên bạn không còn trong danh sách mùa sau.',
          effects: { happy: -8, looks: -3 },
          scene: { anim: 'bow', fx: 'sweat', npcAnim: { stranger: 'facepalm' } } }
      ]
    },
    // ============================== STREAMER ==============================
    {
      id: 's_job_streamer_antifan', title: 'Bị antifan tấn công', icon: '👿', age: [16, 60], weight: 1.5,
      req: { jobId: ['streamer'], notFlag: 'job_streamer_antifan' },
      text: 'Tối nay, một nhóm antifan kéo vào buổi live của bạn: hàng nghìn bình luận chửi bới, ảnh chế, tin đồn bịa đặt. Đến nửa đêm, có kẻ đăng cả địa chỉ nhà bạn lên một group mấy chục nghìn thành viên, kèm dòng chữ “ghé thăm nó đi”.',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'type', expr: 'angry',
        npcs: [{ role: 'coworker', gender: 'm', age: 23, anim: 'phone', expr: 'scared', say: 'Tụi nó đăng địa chỉ nhà mình rồi!' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Chặn, lọc từ khóa, tiếp tục làm nội dung',
          text: 'Bạn bật bộ lọc từ khóa, chặn vài trăm tài khoản rồi tiếp tục livestream như chưa có gì. Người xem thật thà nhắn: “Bình tĩnh ghê, nể thật.”',
          effects: { happy: -3, smarts: 2, karma: 2, flag: 'job_streamer_antifan' },
          scene: { anim: 'type', fx: 'sparkle', npcAnim: { coworker: 'nod' } } },
        { label: 'Livestream “đáp trả” cực gắt',
          outcomes: [
            { p: 0.6, text: 'Buổi live chửi tay đôi đạt kỷ lục người xem, quà tặng nổ liên tục. Nhưng đám antifan cũng điên tiết hơn, và bắt đầu nói đến chuyện “gặp ngoài đời”.',
              effects: { money: 30000000, looks: 3, karma: -4, flag: ['job_streamer_antifan', 'job_streamer_cangang'], followUp: { id: 's_job_streamer_dentannha', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'facepalm' } } },
            { p: 0.4, text: 'Nền tảng khóa kênh bạn bảy ngày vì “ngôn từ thù ghét”. Mất tiền, mất lịch quảng cáo, còn đám antifan thì ăn mừng.',
              effects: { money: -20000000, happy: -6, karma: -3, flag: ['job_streamer_antifan', 'job_streamer_cangang'], followUp: { id: 's_job_streamer_dentannha', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { coworker: 'shake' } } }
          ] },
        { label: 'Trình báo công an, nộp bằng chứng',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chụp lại đủ mọi thứ, nộp cho công an. Kẻ tung địa chỉ bị xác minh, phạt hành chính và phải đăng bài xin lỗi công khai. Cả group im thin thít.',
              effects: { karma: 4, happy: 6, looks: 2, flag: 'job_streamer_antifan' },
              scene: { anim: 'nod', fx: 'sparkle', loc: 'office', npcAnim: { coworker: 'clap' } } },
            { text: 'Hồ sơ được tiếp nhận nhưng xử lý chậm. Bạn đành dọn tạm sang nhà trọ khác cho yên tâm, mất thêm tiền và mất ngủ.',
              effects: { money: -15000000, happy: -4, flag: 'job_streamer_antifan' },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Nghỉ live một tháng để giữ sức khỏe tinh thần',
          text: 'Bạn đăng một dòng “Mình nghỉ ngơi chút nhé” rồi tắt máy. Một tháng đi bộ, đọc sách, ngủ sớm. Thu nhập giảm, lượt theo dõi rơi, nhưng bạn thở được.',
          effects: { happy: 5, health: 3, money: -20000000, looks: -2, flag: 'job_streamer_antifan' },
          scene: { anim: 'walk', fx: 'sparkle', loc: 'park', time: 'dawn' } }
      ]
    },
    {
      id: 's_job_streamer_dentannha', title: 'Antifan đến tận nhà', icon: '🚪', age: [16, 65], chainOnly: true,
      req: { jobId: ['streamer'], flag: 'job_streamer_cangang' },
      text: 'Chín giờ tối, có tiếng đập cổng rầm rầm. Một thanh niên đứng trước nhà bạn, tay cầm điện thoại livestream, miệng gào tên kênh của bạn. Hàng xóm ló đầu ra, ai cũng sợ.',
      scene: { loc: 'street', time: 'night', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 20, anim: 'angry', say: 'Ra đây nói chuyện coi!' }, { role: 'neighbor', anim: 'scared', say: 'Gọi công an đi cháu ơi!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Đóng cửa, gọi công an phường',
          text: 'Mười phút sau, công an phường có mặt. Cậu thanh niên bị đưa về trụ sở, hóa ra mới mười chín tuổi, bỏ học, ngày nào cũng ngồi xem bạn live. Từ đó, bạn bớt gay gắt trên sóng hẳn.',
          effects: { karma: 3, happy: 2, smarts: 2 },
          scene: { anim: 'phone', fx: 'sparkle', npcAnim: { stranger: 'sad', neighbor: 'nod' } } },
        { label: 'Bước ra nói chuyện trực tiếp',
          outcomes: [
            { p: 0.5, text: 'Bạn mời cậu ta ly trà đá ngay đầu ngõ. Hóa ra cậu ta đang thất nghiệp, bực đời, trút hết lên bạn. Cuối buổi, cậu ta lí nhí xin lỗi và xóa bài.',
              effects: { karma: 6, happy: 4 },
              scene: { anim: 'talk', fx: 'sparkle', npcAnim: { stranger: 'bow' } } },
            { p: 0.5, text: 'Lời qua tiếng lại, cậu ta xô bạn ngã vào cánh cổng. Bạn bị trầy tay, rách trán, hàng xóm phải gọi công an tới can.',
              effects: { health: -6, happy: -6 },
              scene: { anim: 'fall', fx: 'anger', npcAnim: { stranger: 'angry', neighbor: 'phone' } } }
          ] },
        { label: 'Bật live quay luôn cảnh hắn đứng trước nhà',
          text: 'Hai buổi live “đối đầu” cùng lúc, người xem đông kỷ lục. Bạn kiếm được tiền, nhưng hàng xóm bắt đầu nhìn bạn bằng ánh mắt khác.',
          effects: { money: 20000000, looks: 2, karma: -3, happy: -2 },
          scene: { anim: 'phone', fx: 'money', npcAnim: { neighbor: 'shake' } } }
      ]
    },
    {
      id: 's_job_streamer_taitro', title: 'Nhà tài trợ “bẩn”', icon: '🎰', age: [16, 60], weight: 1.5,
      req: { jobId: ['streamer'], notFlag: 'job_streamer_taitro' },
      text: 'Một tài khoản Telegram nhắn bạn: trang cá cược trực tuyến muốn tài trợ {money:600000000} một năm, chỉ cần gắn logo góc màn hình và đọc mã khuyến mãi mỗi buổi live. “Ai cũng làm hết anh/chị ơi, có sao đâu.”',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 30, anim: 'phone', say: 'Sáu trăm triệu, chỉ gắn cái logo thôi.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Từ chối thẳng, chặn luôn',
          text: 'Bạn bấm chặn không chần chừ. Tháng đó thu nhập chỉ đủ trả tiền nhà, nhưng kênh của bạn sạch sẽ.',
          effects: { karma: 5, happy: 1, flag: 'job_streamer_taitro' },
          scene: { anim: 'shake', fx: 'sparkle' } },
        { label: 'Nhận tiền, gắn logo nhà cái',
          text: 'Tiền về đều như lương tháng. Mỗi tối, bạn đọc mã khuyến mãi như một câu thần chú, cố không nhìn những bình luận kiểu “thua hết tiền học rồi anh ơi”.',
          effects: { money: 600000000, karma: -10, happy: 3, flag: ['job_streamer_taitro', 'job_streamer_nhacai'], followUp: { id: 's_job_streamer_trieutap', delay: 1 } },
          scene: { anim: 'type', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Giả vờ đồng ý để thu thập bằng chứng, rồi bóc phốt',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn ghi lại cả cuộc thương lượng rồi làm video phanh phui đường dây quảng cáo cờ bạc núp bóng streamer. Video triệu view, báo chí vào cuộc, kênh bạn tăng vọt người theo dõi.',
              effects: { karma: 6, looks: 6, money: 50000000, happy: 6, flag: 'job_streamer_taitro' },
              scene: { anim: 'point', fx: 'idea' } },
            { text: 'Chúng phát hiện bạn ghi âm. Đêm đó, điện thoại bạn nhận hàng trăm cuộc gọi đe dọa từ số lạ. Bạn đành xóa video, mất ngủ cả tuần.',
              effects: { happy: -6, health: -3, flag: 'job_streamer_taitro' },
              scene: { anim: 'scared', fx: 'sweat' } }
          ] },
        { label: 'Nhận ít hơn, chỉ gắn logo, không đọc mã',
          outcomes: [
            { p: 0.5, text: 'Bạn tự nhủ “mình đâu có mời ai chơi”. Tiền vẫn về, và cái logo nhỏ xíu góc màn hình vẫn ở đó, tối nào cũng vậy.',
              effects: { money: 200000000, karma: -5, flag: ['job_streamer_taitro', 'job_streamer_nhacai'], followUp: { id: 's_job_streamer_trieutap', delay: 1 } },
              scene: { anim: 'shrug', fx: 'money' } },
            { p: 0.5, text: 'Được ba tháng, bạn thấy bứt rứt quá nên chủ động gỡ logo và trả lại phần tiền chưa dùng. Nhà cái chửi bới vài câu rồi biến mất.',
              effects: { money: 50000000, karma: -1, flag: 'job_streamer_taitro' },
              scene: { anim: 'think', fx: 'question' } }
          ] }
      ]
    },
    {
      id: 's_job_streamer_trieutap', title: 'Giấy triệu tập', icon: '📄', age: [16, 65], chainOnly: true,
      req: { jobId: ['streamer'], flag: 'job_streamer_nhacai' },
      text: 'Công an triệt phá đường dây cá cược trực tuyến, và danh sách người quảng cáo có tên bạn. Báo chí đăng ảnh chụp màn hình buổi live có logo nhà cái. Sáng nay, giấy triệu tập được gửi đến tận nhà.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 42, anim: 'talk', say: 'Bạn nhận bao nhiêu tiền quảng cáo?' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Thành khẩn khai báo, nộp lại toàn bộ tiền',
          text: 'Bạn khai rõ từng khoản, nộp lại số tiền đã nhận và đăng video xin lỗi người xem. Bạn chỉ bị phạt hành chính, nhưng kênh mất một nửa nhà tài trợ đàng hoàng.',
          effects: { money: -600000000, karma: 6, happy: -8, looks: -4 },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Thuê luật sư, khẳng định mình không biết là cờ bạc',
          outcomes: [
            { p: 0.4, text: 'Luật sư lo được cho bạn mức phạt hành chính. Nhưng cái mác “streamer quảng cáo nhà cái” thì dính chặt, không luật sư nào gỡ được.',
              effects: { money: -150000000, looks: -6, karma: -2, happy: -6 },
              scene: { anim: 'think', fx: 'money' } },
            { p: 0.6, text: 'Đoạn chat bạn bàn giá với nhà cái được đưa ra làm bằng chứng. Bạn bị xử lý nghiêm, bị truy thu toàn bộ tiền và nền tảng khóa kênh vĩnh viễn.',
              effects: { money: -800000000, looks: -12, happy: -15, karma: -5, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { police: 'shake' } } }
          ] },
        { label: 'Xóa sạch video, đổi tên kênh trước khi lên làm việc',
          outcomes: [
            { p: 0.3, text: 'Bạn may mắn: dữ liệu bạn xóa không được dùng đến, chỉ bị nhắc nhở. Nhưng người xem cũ nhận ra ngay kênh “mới” của bạn.',
              effects: { karma: -4, looks: -4, happy: -2 },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.7, text: 'Cơ quan điều tra khôi phục toàn bộ dữ liệu, hành vi xóa bằng chứng khiến bạn bị xử lý nặng hơn. Kênh bị khóa, tiền bị truy thu.',
              effects: { money: -700000000, looks: -10, happy: -12, karma: -6, job: 'fire' },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_streamer_trieuview', title: 'Livestream triệu view', icon: '📈', age: [16, 60], weight: 1.4,
      req: { jobId: ['streamer'], notFlag: 'job_streamer_trieuview' },
      text: 'Một buổi live nửa đêm bình thường bỗng nổ tung: clip bạn nấu mì cháy khét lên xu hướng, số người xem cùng lúc vượt một triệu. Quà tặng bay kín màn hình, nhãn hàng nhắn tin liên tục. Trong bình luận, có người nhắc: miền Trung đang lũ lớn.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'cheer', expr: 'surprised',
        npcs: [{ role: 'coworker', gender: 'f', age: 24, anim: 'jump', say: 'Một triệu người xem! Một triệu!' }], fx: 'levelup', shot: 'orbit' },
      choices: [
        { label: 'Chốt đơn liền tay, bán hàng xuyên đêm',
          text: 'Bạn mở giỏ hàng: nồi chiên, son, mì gói, cái gì cũng chốt. Đến sáng, doanh số vượt chục tỷ, phần hoa hồng của bạn là {money:800000000}.',
          effects: { money: 800000000, happy: 8, looks: 4, job: 'raise', flag: 'job_streamer_trieuview' },
          scene: { anim: 'talk', fx: 'money', npcAnim: { coworker: 'type' } } },
        { label: 'Kêu gọi quyên góp cho bà con vùng lũ',
          text: 'Bạn tắt giỏ hàng, mở số tài khoản riêng cho từ thiện. Chỉ trong một đêm, hơn ba tỷ đồng đổ về. Sáng hôm sau, bạn khăn gói ra miền Trung.',
          effects: { karma: 8, looks: 6, happy: 6, flag: ['job_streamer_trieuview', 'job_streamer_tuthien'], followUp: { id: 's_job_streamer_saoke', delay: 1 } },
          scene: { anim: 'talk', fx: 'hearts', npcAnim: { coworker: 'cry' } } },
        { label: 'Rủ KOL hàng đầu PK để giữ nhiệt',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn thắng PK trước cả triệu người xem. Từ một streamer vô danh, bạn thành cái tên mà các nhãn hàng tranh nhau đặt lịch.',
              effects: { money: 300000000, looks: 8, happy: 10, job: 'promote', flag: 'job_streamer_trieuview' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'dance' } } },
            { text: 'Bạn thua, phải bôi nhọ nồi lên mặt theo luật PK. Nhưng người xem thấy bạn dễ thương, và lượt theo dõi vẫn tăng.',
              effects: { looks: 2, happy: -2, money: 50000000, flag: 'job_streamer_trieuview' },
              scene: { anim: 'laugh', fx: 'smoke', npcAnim: { coworker: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_streamer_saoke', title: 'Đòi sao kê', icon: '🧾', age: [16, 65], chainOnly: true,
      req: { jobId: ['streamer'], flag: 'job_streamer_tuthien' },
      text: 'Một năm sau đợt quyên góp, dân mạng bắt đầu hỏi: “Ba tỷ đi đâu rồi?” Kế toán của bạn thì thầm: “Hay mình giữ lại mười phần trăm làm chi phí đi lại, ai mà biết.”',
      scene: { loc: 'home', time: 'day', weather: 'cloudy', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'coworker', gender: 'm', age: 35, anim: 'talk', say: 'Mười phần trăm thôi, ai mà biết.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Công khai sao kê từng đồng',
          text: 'Bạn đăng file sao kê hơn bốn trăm trang, kèm ảnh từng ngôi nhà được dựng lại. Cư dân mạng soi kỹ rồi phải thốt lên: “Sạch thật.” Uy tín của bạn tăng vọt.',
          effects: { karma: 8, looks: 6, happy: 6, job: 'promote' },
          scene: { anim: 'type', fx: 'sparkle', npcAnim: { coworker: 'shrug' } } },
        { label: 'Giữ lại mười phần trăm làm “chi phí”',
          outcomes: [
            { p: 0.4, text: 'Không ai phát hiện. Ba trăm triệu nằm yên trong tài khoản riêng, nhưng mỗi lần ai đó cảm ơn bạn, bạn lại thấy nhói.',
              effects: { money: 300000000, karma: -12, happy: -2 },
              scene: { anim: 'think', fx: 'money' } },
            { p: 0.6, text: 'Một nhóm cư dân mạng đối chiếu từng giao dịch và tìm ra khoản chênh lệch. Bạn bị công an mời làm việc, phải hoàn trả toàn bộ, nền tảng gỡ huy hiệu và nhãn hàng bỏ đi hết.',
              effects: { money: -100000000, karma: -12, looks: -12, happy: -12, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Chuyển toàn bộ số còn lại cho Mặt trận Tổ quốc',
          text: 'Bạn chuyển hết số tiền chưa dùng cho Ủy ban Mặt trận Tổ quốc tỉnh và đăng biên nhận. Từ đó, bạn chỉ kêu gọi qua tài khoản chính thức.',
          effects: { karma: 6, looks: 3, happy: 4 },
          scene: { anim: 'nod', fx: 'sparkle', loc: 'office' } }
      ]
    },
    // ============================== TIẾP VIÊN HÀNG KHÔNG ==============================
    {
      id: 's_job_tiepvien_gayroi', title: 'Hành khách gây rối', icon: '🍺', age: [18, 55], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['tiepvien'] },
      text: 'Chuyến bay đêm Hà Nội – TP.HCM. Một hành khách hạng thương gia say khướt đòi thêm rượu, không chịu thắt dây an toàn, lớn tiếng xúc phạm và giật mạnh tay áo bạn. Cả khoang im phăng phắc nhìn về phía bạn.',
      scene: { loc: 'airport', time: 'night', weather: 'clear', anim: 'talk', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 47, anim: 'angry', say: 'Mang thêm rượu ra đây! Biết tôi là ai không?' }, { role: 'crowd', anim: 'sit', expr: 'scared' }, { role: 'coworker', gender: 'f', age: 28, anim: 'walk' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Bình tĩnh xoa dịu theo đúng quy trình',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn hạ giọng, mang ra ly nước lọc và khăn lạnh, gọi ông ta bằng tên, hứa sẽ “xem lại” chuyện rượu. Mười phút sau ông ta ngáy khò khò. Hành khách hàng ghế bên lén giơ ngón cái với bạn.',
              effects: { happy: 4, karma: 3, smarts: 2 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'sleep', crowd: 'clap' } } },
            { text: 'Ông ta hất cả ly nước vào người bạn. Tổ bay phải cùng nhau khống chế bằng dây đai chuyên dụng, và công an sân bay chờ sẵn ở cửa máy bay khi hạ cánh.',
              effects: { happy: -4, health: -2, karma: 2 },
              scene: { anim: 'scared', fx: 'bubbles', npcAnim: { stranger: 'angry', coworker: 'run' } } }
          ] },
        { label: 'Báo cơ trưởng, cùng tổ bay khống chế',
          text: 'Bạn báo buồng lái, cùng tổ bay khống chế ông ta đúng quy trình. Hạ cánh xuống Tân Sơn Nhất, ông ta bị lập biên bản, phạt tiền và cấm bay mười hai tháng. Hãng gửi thư ghi nhận cho cả tổ.',
          effects: { happy: 3, smarts: 2, karma: 3, money: 5000000 },
          scene: { anim: 'point', fx: 'exclaim', npcAnim: { stranger: 'sad', coworker: 'nod' } } },
        { label: 'Lén mang thêm rượu cho ông ta im',
          outcomes: [
            { p: 0.5, text: 'Ông ta uống xong rồi ngủ li bì đến lúc hạ cánh. Không ai phàn nàn, nhưng bạn biết mình vừa làm trái quy định.',
              effects: { karma: -3, happy: 1 },
              scene: { anim: 'shrug', fx: 'zzz', npcAnim: { stranger: 'sleep' } } },
            { p: 0.5, text: 'Thêm rượu, ông ta càng quậy, nôn khắp lối đi và chửi cả hành khách khác. Một người viết đơn khiếu nại. Hãng kỷ luật bạn vì phục vụ rượu cho khách đã say.',
              effects: { karma: -3, happy: -6, money: -10000000 },
              scene: { anim: 'facepalm', fx: 'sick', npcAnim: { stranger: 'sick', crowd: 'angry' } } }
          ] },
        { label: 'Cãi tay đôi cho bõ tức',
          outcomes: [
            { p: 0.5, text: 'Clip bạn đáp trả sắc lẹm lan trên mạng, dân mạng bênh bạn chằm chặp. Hãng chỉ nhắc nhở nhẹ, kèm một câu: “Lần sau giữ bình tĩnh hơn nhé.”',
              effects: { happy: 3, looks: 2, karma: -1 },
              scene: { anim: 'point', fx: 'anger', npcAnim: { crowd: 'clap' } } },
            { p: 0.5, text: 'Ông ta là khách VIP, và đơn khiếu nại của ông ta đến thẳng phòng giám đốc. Bạn bị đình chỉ bay một tháng.',
              effects: { happy: -6, money: -15000000, karma: -2 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_tiepvien_nhieudong', title: 'Chuyến bay gặp nhiễu động mạnh', icon: '🌪️', age: [18, 55], weight: 1.5,
      req: { jobId: ['tiepvien'], notFlag: 'job_tiepvien_nhieudong' },
      text: 'Đang chia suất ăn trên chuyến bay Đà Nẵng – Seoul, máy bay bỗng rơi hẫng. Khay đồ ăn bay lên trần, xe đẩy trượt dọc lối đi, một em bé khóc thét, một bà cụ hoảng loạn kêu cứu. Đèn báo thắt dây an toàn nhấp nháy liên hồi.',
      scene: { loc: 'airport', time: 'day', weather: 'storm', anim: 'fall', expr: 'scared',
        npcs: [{ role: 'crowd', anim: 'scared' }, { role: 'kid', anim: 'cry' }, { role: 'stranger', gender: 'f', age: 72, anim: 'scared', say: 'Trời ơi, rơi rồi, rơi rồi!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Ngồi xuống ghế gần nhất, hô to hướng dẫn hành khách',
          text: 'Bạn thả người xuống ghế phụ, thắt đai, giọng vang khắp khoang: “Thắt dây an toàn! Cúi đầu! Giữ chặt tay vịn!” Ba phút dài như ba năm, rồi máy bay ổn định. Không ai bị thương nặng.',
          effects: { karma: 4, happy: 3, smarts: 2, flag: 'job_tiepvien_nhieudong', followUp: { id: 's_job_tiepvien_thukhen', delay: 1 } },
          scene: { anim: 'sit', fx: 'exclaim', say: 'Thắt dây an toàn! Cúi đầu!', npcAnim: { crowd: 'sit', kid: 'sit' } } },
        { label: 'Lao ra giữ xe đẩy để nó không đè hành khách',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chộp được xe đẩy, đạp khóa phanh rồi ngồi thụp xuống sàn. Chiếc xe nặng gần trăm ký dừng lại cách đầu em bé chỉ một gang tay. Bạn chỉ bị bầm tím cánh tay.',
              effects: { health: -3, karma: 6, happy: 5, flag: 'job_tiepvien_nhieudong', followUp: { id: 's_job_tiepvien_thukhen', delay: 1 } },
              scene: { anim: 'lift', fx: 'stars', npcAnim: { kid: 'hug', crowd: 'clap' } } },
            { text: 'Bạn giữ được xe đẩy, nhưng cú hẫng thứ hai hất bạn đập vai vào khoang hành lý. Máy bay hạ cánh an toàn, còn bạn phải nghỉ dưỡng thương vài tuần.',
              effects: { health: -10, karma: 4, happy: -3, illness: 'Chấn thương cơ', flag: 'job_tiepvien_nhieudong', followUp: { id: 's_job_tiepvien_thukhen', delay: 1 } },
              scene: { anim: 'fall', fx: 'stars', npcAnim: { crowd: 'scared' } } }
          ] },
        { label: 'Thắt đai rồi nắm tay trấn an bà cụ bên cạnh',
          text: 'Bạn ngồi ghế phụ cạnh bà cụ, một tay giữ đai, một tay nắm chặt tay bà, kể chuyện quê bà cho bà quên sợ. Khi máy bay ổn định, bà cụ không chịu buông tay bạn.',
          effects: { karma: 5, happy: 4, flag: 'job_tiepvien_nhieudong', followUp: { id: 's_job_tiepvien_thukhen', delay: 1 } },
          scene: { anim: 'sit', fx: 'hearts', npcAnim: { stranger: 'cry' } } }
      ]
    },
    {
      id: 's_job_tiepvien_thukhen', title: 'Lá thư từ hành khách', icon: '💌', age: [18, 60], chainOnly: true,
      req: { jobId: ['tiepvien'] },
      text: 'Phòng tiếp viên nhận được một lá thư tay gửi từ hành khách trên chuyến bay gặp nhiễu động năm ngoái, kể chi tiết bạn đã giữ bình tĩnh thế nào. Trưởng phòng đọc to trong buổi giao ban rồi gọi bạn ở lại.',
      scene: { loc: 'airport', time: 'day', weather: 'clear', anim: 'idle', expr: 'happy',
        npcs: [{ role: 'boss', gender: 'f', age: 48, anim: 'talk', say: 'Hãng muốn đề bạt em đấy.' }, { role: 'coworker', anim: 'clap' }], fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Nhận đề bạt lên vị trí cao hơn',
          text: 'Bạn nhận quyết định đề bạt, đeo thêm vạch trên vai áo. Lá thư được đóng khung treo ngay phòng nghỉ của tổ bay.',
          effects: { happy: 10, job: 'promote' },
          scene: { anim: 'bow', fx: 'levelup', npcAnim: { coworker: 'cheer' } } },
        { label: 'Xin ở lại tổ bay cũ, nhận thưởng nóng',
          text: 'Bạn muốn bay cùng những người đã đứng cạnh mình hôm ấy. Hãng trao thưởng nóng {money:30000000}, cả tổ kéo nhau đi ăn lẩu.',
          effects: { happy: 7, money: 30000000, karma: 2 },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'hug' } } }
      ]
    },
    {
      id: 's_job_tiepvien_xachhang', title: 'Được xách hàng “nhờ”', icon: '🧳', age: [18, 55], weight: 1.4,
      req: { jobId: ['tiepvien'], notFlag: 'job_tiepvien_xachhang' },
      text: 'Trước chuyến bay từ Frankfurt về TP.HCM, một người quen trong hãng kéo bạn ra góc: “Em xách giúp chị vali sữa bột với mỹ phẩm cho người nhà nhé, chị gửi em ba nghìn euro.” Chiếc vali nặng một cách bất thường.',
      scene: { loc: 'airport', time: 'dusk', weather: 'cloudy', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'coworker', gender: 'f', age: 36, anim: 'talk', say: 'Sữa bột thôi mà, xách giúp chị đi.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Từ chối khéo',
          text: '“Em không mang hàng giúp ai bao giờ chị ạ.” Chị ta cười gượng, mấy tháng sau không thèm chào bạn. Bạn thấy nhẹ cả người.',
          effects: { karma: 3, happy: -1, flag: 'job_tiepvien_xachhang' },
          scene: { anim: 'shake', npcAnim: { coworker: 'shrug' } } },
        { label: 'Mở vali kiểm tra trước đã',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn rạch nhẹ một hộp sữa: bên trong là những gói bột trắng hút chân không. Bạn báo ngay an ninh sân bay. Đường dây lợi dụng tiếp viên vận chuyển ma túy bị triệt phá, bạn được hãng khen thưởng.',
              effects: { karma: 10, happy: 6, smarts: 2, job: 'promote', flag: 'job_tiepvien_xachhang' },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { coworker: 'scared' } } },
            { text: 'Bạn lật qua lật lại, thấy toàn hộp sữa còn nguyên tem. Yên tâm, bạn kéo vali ra quầy làm thủ tục.',
              effects: { flag: ['job_tiepvien_xachhang', 'job_tiepvien_mangho'], followUp: { id: 's_job_tiepvien_maysoi', delay: 0 } },
              scene: { anim: 'nod', fx: 'question', npcAnim: { coworker: 'laugh' } } }
          ] },
        { label: 'Nhận xách, kiếm thêm ba nghìn euro',
          outcomes: [
            { p: 0.55, text: 'Bạn nhận tiền, kéo vali đi thẳng ra quầy hải quan với nụ cười thật tươi.',
              effects: { karma: -6, flag: ['job_tiepvien_xachhang', 'job_tiepvien_mangho'], followUp: { id: 's_job_tiepvien_maysoi', delay: 0 } },
              scene: { anim: 'walk', fx: 'money', npcAnim: { coworker: 'wave' } } },
            { p: 0.45, text: 'Trót lọt. Ba nghìn euro nằm gọn trong túi. Năm sau, chị ta lại nhờ bạn thêm một chuyến nữa, và bạn không nỡ từ chối.',
              effects: { money: 80000000, karma: -10, flag: ['job_tiepvien_xachhang', 'job_tiepvien_mangho'], followUp: { id: 's_job_tiepvien_maysoi', delay: 1 } },
              scene: { anim: 'laugh', fx: 'money', npcAnim: { coworker: 'laugh' } } }
          ] },
        { label: 'Báo ngay cho an ninh hàng không',
          outcomes: [
            { p: 0.7, text: 'An ninh kiểm tra và phát hiện hàng cấm giấu trong hộp sữa. Người nhờ bị bắt ngay tại sân bay. Hãng khen thưởng bạn trước toàn đoàn tiếp viên.',
              effects: { karma: 10, happy: 5, money: 20000000, flag: 'job_tiepvien_xachhang' },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { coworker: 'scared' } } },
            { p: 0.3, text: 'Trong vali đúng là chỉ có sữa bột và mỹ phẩm. Chị ta giận tím mặt, nhưng an ninh vẫn khen bạn cẩn thận đúng mực.',
              effects: { karma: 3, happy: -3, flag: 'job_tiepvien_xachhang' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { coworker: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_tiepvien_maysoi', title: 'Máy soi ở Tân Sơn Nhất', icon: '🛃', age: [18, 60], chainOnly: true,
      req: { jobId: ['tiepvien'], flag: 'job_tiepvien_mangho' },
      text: 'Chiếc vali “nhờ xách” đi qua máy soi chiếu của hải quan Tân Sơn Nhất. Trên màn hình hiện những khối đặc bất thường nằm trong các hộp sữa bột. Nhân viên hải quan ra hiệu cho bạn đứng sang một bên.',
      scene: { loc: 'airport', time: 'night', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 38, anim: 'point', say: 'Mời chị/anh mở vali ra.' }, { role: 'crowd', anim: 'phone' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Khai thật toàn bộ, chỉ đích danh người nhờ',
          outcomes: [
            { p: 0.6, text: 'Bạn khai rõ ngày giờ, tin nhắn, cả số tiền được hứa. Cơ quan điều tra xác định bạn bị lợi dụng nên không truy cứu, nhưng hãng chấm dứt hợp đồng với bạn.',
              effects: { happy: -12, karma: 2, money: -80000000, job: 'fire' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod' } } },
            { p: 0.4, text: 'Bạn bị tạm giữ nhiều tháng để điều tra trước khi được trả tự do vì bị lợi dụng. Khi bước ra, bạn gầy rộc, mất việc và mất cả niềm tin vào người quen.',
              effects: { happy: -15, health: -6, karma: 2, money: -80000000, job: 'fire' },
              scene: { anim: 'sad', fx: 'tears', time: 'dawn', npcAnim: { police: 'idle' } } }
          ] },
        { label: 'Khăng khăng “không biết gì hết”',
          text: 'Lời chối của bạn không đứng vững trước tin nhắn và lịch sử chuyển khoản. Bạn bị điều tra kéo dài, hãng lập tức sa thải, cái tên bạn lên khắp mặt báo.',
          effects: { happy: -15, health: -5, karma: -5, money: -80000000, looks: -5, job: 'fire' },
          scene: { anim: 'shake', fx: 'anger', npcAnim: { police: 'shake' } } }
      ]
    },
    // ============================== PHI CÔNG ==============================
    {
      id: 's_job_phicong_dongco', title: 'Sự cố động cơ trên không', icon: '🔥', age: [22, 65], weight: 1.4,
      req: { jobId: ['phicong'], notFlag: 'job_phicong_dongco' },
      text: 'Chuyến bay chở một trăm tám mươi hành khách đang ở độ cao mười nghìn mét trên biển Đông thì chuông cảnh báo réo inh ỏi: đèn cháy động cơ số hai bật đỏ. Thân máy bay rung lên, mùi khét thoang thoảng trong buồng lái. Người ngồi ghế bên nhìn bạn, chờ quyết định.',
      scene: { loc: 'airport', time: 'night', weather: 'cloudy', anim: 'drive', expr: 'scared',
        npcs: [{ role: 'coworker', gender: 'm', age: 41, anim: 'point', say: 'Cháy động cơ số hai!' }], fx: 'smoke', shot: 'close' },
      choices: [
        { label: 'Làm đúng checklist, tắt động cơ, hạ cánh khẩn cấp',
          success: { stat: 'smarts', base: 0.45, scale: 0.45 },
          outcomes: [
            { text: 'Bạn gọi MAYDAY, cắt nhiên liệu, xả bình chữa cháy, rồi chuyển hướng về Cam Ranh. Máy bay chạm đất êm như một chuyến bình thường. Cả khoang hành khách đứng dậy vỗ tay.',
              effects: { happy: 10, looks: 5, karma: 5, flag: ['job_phicong_dongco', 'job_phicong_dungquytrinh'], followUp: { id: 's_job_phicong_dieutra', delay: 1 } },
              scene: { anim: 'drive', fx: 'sparkle', npcAnim: { coworker: 'clap' }, npcSay: { coworker: 'Hạ cánh đẹp quá!' } } },
            { text: 'Bạn làm đúng từng bước, nhưng gió giật mạnh khiến máy bay chạm đất khá nặng và nảy lên một nhịp. Vài hành khách bị trật cổ tay khi sơ tán, còn lại tất cả đều an toàn.',
              effects: { happy: -4, health: -2, karma: 3, flag: ['job_phicong_dongco', 'job_phicong_dungquytrinh'], followUp: { id: 's_job_phicong_dieutra', delay: 1 } },
              scene: { anim: 'drive', fx: 'sweat', npcAnim: { coworker: 'nod' } } }
          ] },
        { label: 'Thử khởi động lại động cơ để bay tiếp về đích',
          outcomes: [
            { p: 0.4, text: 'Động cơ khởi động lại được, bạn bay tiếp và hạ cánh đúng giờ. Nhưng đội kỹ thuật phát hiện động cơ hư hại nặng: bạn đã đánh cược với một trăm tám mươi mạng người.',
              effects: { happy: -2, karma: -6, flag: ['job_phicong_dongco', 'job_phicong_lieulinh'], followUp: { id: 's_job_phicong_dieutra', delay: 1 } },
              scene: { anim: 'drive', fx: 'question', npcAnim: { coworker: 'shake' } } },
            { p: 0.6, text: 'Vừa khởi động lại, lửa bùng lên dữ dội hơn. Bạn buộc phải hạ cánh khẩn cấp trong tình thế khó hơn nhiều. Mọi người đều an toàn, nhưng bạn run tay suốt cả đêm.',
              effects: { happy: -8, karma: -4, flag: ['job_phicong_dongco', 'job_phicong_lieulinh'], followUp: { id: 's_job_phicong_dieutra', delay: 1 } },
              scene: { anim: 'drive', fx: 'smoke', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Phân công người bên cạnh đọc checklist, mình trấn an hành khách',
          text: 'Bạn giữ cần lái, phân việc rành mạch, rồi cầm micro nói với hành khách bằng giọng điềm tĩnh nhất đời mình. Máy bay hạ cánh an toàn xuống sân bay gần nhất, không ai bị thương.',
          effects: { happy: 6, karma: 4, smarts: 2, flag: ['job_phicong_dongco', 'job_phicong_dungquytrinh'], followUp: { id: 's_job_phicong_dieutra', delay: 1 } },
          scene: { anim: 'talk', fx: 'sparkle', say: 'Quý khách vui lòng bình tĩnh…', npcAnim: { coworker: 'type' } } }
      ]
    },
    {
      id: 's_job_phicong_dieutra', title: 'Hội đồng điều tra sự cố', icon: '📼', age: [22, 70], chainOnly: true,
      req: { jobId: ['phicong'] },
      text: 'Cục Hàng không mở cuộc điều tra vụ cháy động cơ. Hộp đen được giải mã từng giây, từng câu nói trong buồng lái. Bạn ngồi trước hội đồng năm người, tách trà trước mặt đã nguội ngắt.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'neutral',
        npcs: [{ role: 'boss', gender: 'm', age: 56, anim: 'talk', say: 'Anh/chị trình bày lại từng bước.' }, { role: 'crowd', anim: 'sit' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Trình bày theo dữ liệu, đúng từng bước checklist', req: { flag: 'job_phicong_dungquytrinh' },
          text: 'Dữ liệu khớp từng giây với lời bạn. Hội đồng kết luận tổ bay xử lý mẫu mực. Bạn nhận bằng khen của Cục Hàng không và được đề bạt sớm.',
          effects: { happy: 12, looks: 4, smarts: 2, job: 'promote' },
          scene: { anim: 'bow', fx: 'levelup', npcAnim: { boss: 'nod', crowd: 'clap' } } },
        { label: 'Thừa nhận đã liều lĩnh, xin rút kinh nghiệm', req: { flag: 'job_phicong_lieulinh' },
          text: 'Bạn nhận hết trách nhiệm. Hội đồng đình chỉ bay sáu tháng, buộc huấn luyện lại toàn bộ quy trình khẩn cấp. Lương giảm, nhưng bạn hiểu ra một điều không sách nào dạy.',
          effects: { happy: -8, smarts: 4, karma: 3, money: -100000000 },
          scene: { anim: 'nod', fx: 'sweat', npcAnim: { boss: 'nod' } } },
        { label: 'Đổ lỗi cho bộ phận bảo dưỡng kỹ thuật',
          outcomes: [
            { p: 0.3, text: 'Hồ sơ bảo dưỡng đúng là có thiếu sót, và hội đồng tạm chấp nhận lời bạn. Nhưng anh kỹ sư bảo dưỡng bị kỷ luật thay, nhìn bạn không nói một lời.',
              effects: { karma: -6, happy: -2 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'think' } } },
            { p: 0.7, text: 'Hộp đen cho thấy chính quyết định của bạn khiến tình huống tệ hơn. Hãng tước quyền bay và chấm dứt hợp đồng vì “thiếu trung thực trong điều tra an toàn”.',
              effects: { karma: -8, happy: -12, looks: -5, job: 'fire' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_phicong_metmoi', title: 'Bay khi mệt mỏi', icon: '😵', age: [22, 65], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['phicong'] },
      text: 'Ba chuyến bay đêm liên tiếp, bạn mới chợp mắt được bốn tiếng thì điều phái bay gọi: thiếu người dự bị, cần bạn bay chuyến sáu giờ sáng đi Phú Quốc. “Báo mệt là hủy cả chuyến đấy, hai trăm khách đang chờ.”',
      scene: { loc: 'bedroom', time: 'dawn', weather: 'fog', anim: 'phone', expr: 'sleepy',
        npcs: [{ role: 'boss', gender: 'm', age: 45, anim: 'phone', say: 'Ráng giúp hãng chuyến này thôi!' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Báo cáo không đủ điều kiện bay',
          outcomes: [
            { p: 0.7, text: 'Bạn gửi báo cáo mệt mỏi đúng quy định. Phòng an toàn bay ủng hộ bạn, chuyến bay lùi hai tiếng chờ phi công khác. Điều phái càu nhàu, nhưng bạn ngủ một giấc ngon lành.',
              effects: { karma: 5, health: 2, happy: 1 },
              scene: { anim: 'sleep', fx: 'zzz', npcAnim: { boss: 'shrug' } } },
            { p: 0.3, text: 'Bạn đúng quy định, nhưng trưởng đội bay ghi nhớ. Quý đó bạn bị xếp lịch khó và cắt thưởng “tinh thần hợp tác”.',
              effects: { karma: 5, money: -30000000, happy: -4 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Uống ba lon cà phê rồi lên đường',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Chuyến bay trôi qua suôn sẻ, nhưng đầu bạn ong ong suốt hành trình. Hạ cánh xong, bạn ngủ gục ngay trong phòng nghỉ tổ bay.',
              effects: { health: -5, karma: -2, happy: -2 },
              scene: { anim: 'drive', fx: 'sweat', loc: 'airport', time: 'day' } },
            { text: 'Lúc tiếp cận hạ cánh, mắt bạn díp lại vài giây. Người ngồi bên phải hét lên rồi giành quyền điều khiển, máy bay hạ cánh an toàn. Báo cáo sự cố được gửi lên ngay trong ngày.',
              effects: { health: -5, happy: -6, flag: 'job_phicong_ngugat', followUp: { id: 's_job_phicong_kiemtra', delay: 0 } },
              scene: { anim: 'sleep', fx: 'exclaim', loc: 'airport', time: 'day' } }
          ] },
        { label: 'Đi bay, nhưng bỏ bớt bước kiểm tra trước chuyến cho kịp giờ',
          outcomes: [
            { p: 0.4, text: 'Bạn kiểm tra qua loa, ký sổ rồi cất cánh đúng giờ. Không có chuyện gì xảy ra, lần này.',
              effects: { karma: -4, health: -3 },
              scene: { anim: 'drive', fx: 'question', loc: 'airport' } },
            { p: 0.6, text: 'Thanh tra an toàn bay đối chiếu thời gian ký sổ và camera sân đỗ: bạn bỏ qua cả vòng kiểm tra quanh tàu bay. Bạn bị gọi lên làm việc.',
              effects: { karma: -4, happy: -5, flag: 'job_phicong_bocheck', followUp: { id: 's_job_phicong_kiemtra', delay: 0 } },
              scene: { anim: 'scared', fx: 'exclaim', loc: 'airport' } }
          ] }
      ]
    },
    {
      id: 's_job_phicong_kiemtra', title: 'Phòng an toàn bay gọi lên', icon: '⚠️', age: [22, 70], chainOnly: true,
      req: { jobId: ['phicong'] },
      text: 'Dữ liệu chuyến bay được trích xuất và đặt trên bàn trưởng phòng an toàn bay. Ông ta gõ ngón tay lên tờ giấy: “Hàng không không có chỗ cho chữ “may mà”. Anh/chị giải thích đi.”',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'm', age: 55, anim: 'point', say: 'Hàng không không có chữ “may mà”.' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Nhận lỗi, khai thật mọi chuyện',
          text: 'Bạn kể hết, cả việc mình đã chủ quan. Bạn bị đình chỉ bay ba tháng và huấn luyện lại, nhưng hồ sơ ghi nhận “trung thực, hợp tác”. Cánh cửa buồng lái vẫn còn mở cho bạn.',
          effects: { money: -150000000, karma: 4, happy: -8, smarts: 3 },
          scene: { anim: 'nod', fx: 'tears', npcAnim: { boss: 'nod' } } },
        { label: 'Nêu thẳng: lịch bay của hãng quá dày đặc', req: { flag: 'job_phicong_ngugat' },
          outcomes: [
            { p: 0.5, text: 'Bạn đưa ra bảng giờ bay ba tháng liền. Phòng an toàn bay giật mình, hãng phải điều chỉnh lại lịch cho toàn đội. Bạn chỉ bị nhắc nhở, và đồng nghiệp âm thầm cảm ơn bạn.',
              effects: { karma: 4, happy: 3, smarts: 2 },
              scene: { anim: 'point', fx: 'idea', npcAnim: { boss: 'think' } } },
            { p: 0.5, text: 'Ban giám đốc coi đó là “thái độ chống đối”. Bạn bị kỷ luật cảnh cáo, cắt hết thưởng năm.',
              effects: { money: -100000000, happy: -8 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Sửa lại nhật ký bay cho đẹp',
          outcomes: [
            { p: 0.2, text: 'Không ai phát hiện chỗ sửa. Bạn thoát, nhưng từ đó mỗi lần cầm bút ký sổ bay, tay bạn lại khựng lại.',
              effects: { karma: -10, happy: -3 },
              scene: { anim: 'type', fx: 'sweat' } },
            { p: 0.8, text: 'Dữ liệu tự động không biết nói dối. Hãng tước quyền bay, chấm dứt hợp đồng và báo cáo lên Cục Hàng không. Sự nghiệp bay của bạn dừng lại tại đây.',
              effects: { karma: -10, happy: -15, looks: -4, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_phicong_cotruong', title: 'Lên cơ trưởng', icon: '🏅', age: [25, 60], weight: 1.5, once: false, cooldown: 2,
      req: { jobId: ['phicong'], notFlag: 'job_phicong_cotruong', cond: function (s) { return !!s.job && s.job.level === 1; } },
      text: 'Sau hàng nghìn giờ bay ở ghế phải, bạn được đề cử kiểm tra lên cơ trưởng. Bài sát hạch trên buồng lái giả định do giáo viên khó tính nhất hãng chấm: hỏng động cơ ngay lúc cất cánh, trời mưa giông, đường băng ướt.',
      scene: { loc: 'airport', time: 'day', weather: 'storm', anim: 'drive', expr: 'neutral',
        npcs: [{ role: 'teacher', gender: 'm', age: 58, anim: 'think', say: 'Bắt đầu. Động cơ số một hỏng.' }], fx: 'flash', shot: 'close' },
      choices: [
        { label: 'Đã ôn luyện nửa năm, vào thi bằng thực lực',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Tay bạn chắc như thép, từng câu gọi chuẩn xác. Bài thi kết thúc, ông giáo viên tháo kính, gật đầu: “Chúc mừng cơ trưởng.”',
              effects: { happy: 15, smarts: 3, job: 'promote', flag: 'job_phicong_cotruong', followUp: { id: 's_job_phicong_bonvach', delay: 0 } },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { teacher: 'clap' }, npcSay: { teacher: 'Chúc mừng cơ trưởng.' } } },
            { text: 'Bạn xử lý được sự cố nhưng quên một bước gọi quan trọng. “Chưa đạt. Năm sau thi lại.” Bạn bước ra khỏi phòng mô phỏng, mưa vẫn rơi.',
              effects: { happy: -8, smarts: 3 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { teacher: 'shake' } } }
          ] },
        { label: 'Gửi “phong bì” cho giám khảo cho chắc ăn',
          outcomes: [
            { p: 0.4, text: 'Phong bì được nhận, bài thi “đạt” dù bạn lóng ngóng ở bước quan trọng nhất. Bạn có bốn vạch trên vai, và một nỗi sợ mà không ai thấy.',
              effects: { money: -200000000, karma: -12, job: 'promote', flag: ['job_phicong_cotruong', 'job_phicong_chaycua'], followUp: { id: 's_job_phicong_bonvach', delay: 0 } },
              scene: { anim: 'shrug', fx: 'money', npcAnim: { teacher: 'nod' } } },
            { p: 0.6, text: 'Ông giáo viên đẩy phong bì lại, mặt lạnh tanh, rồi báo cáo lên ban giám đốc. Bạn bị kỷ luật và mất quyền dự thi ba năm.',
              effects: { karma: -10, happy: -10, smarts: -2 },
              scene: { anim: 'scared', fx: 'anger', npcAnim: { teacher: 'angry' }, npcSay: { teacher: 'Cầm về. Tôi sẽ báo cáo.' } } }
          ] },
        { label: 'Xin hoãn, chưa đủ tự tin',
          text: 'Bạn xin lùi kỳ kiểm tra thêm một năm để bay thêm giờ. Đồng nghiệp lên trước, nhưng bạn biết ghế trái không chờ người vội.',
          effects: { happy: -2, smarts: 2 },
          scene: { anim: 'think', npcAnim: { teacher: 'nod' } } }
      ]
    },
    {
      id: 's_job_phicong_bonvach', title: 'Chuyến bay đầu tiên với bốn vạch', icon: '✈️', age: [25, 65], chainOnly: true,
      req: { jobId: ['phicong'] },
      text: 'Sáng nay, bạn khoác bộ đồng phục có bốn vạch vàng trên vai, ngồi vào ghế trái lần đầu tiên. Hai trăm hành khách phía sau đang thắt dây an toàn. Người ngồi ghế phải mỉm cười: “Sẵn sàng chưa, cơ trưởng?”',
      scene: { loc: 'airport', time: 'dawn', weather: 'clear', anim: 'drive', expr: 'happy',
        npcs: [{ role: 'coworker', gender: 'f', age: 30, anim: 'nod', say: 'Sẵn sàng chưa, cơ trưởng?' }], fx: 'sparkle', shot: 'low' },
      choices: [
        { label: 'Đọc lời chào hành khách thật ấm áp',
          text: '“Xin chào quý khách, tôi là cơ trưởng {fullname}…” Giọng bạn hơi run ở chữ “cơ trưởng”. Khi máy bay rời đường băng, bạn biết mình đã đi đúng đường.',
          effects: { happy: 10, looks: 3 },
          scene: { anim: 'talk', fx: 'stars', npcAnim: { coworker: 'clap' } } },
        { label: 'Rà checklist thêm một lần nữa',
          text: 'Bạn rà lại từng mục, chậm rãi, không bỏ dòng nào. Người ngồi bên cạnh gật gù: “Bay với cơ trưởng như vậy em yên tâm.”',
          effects: { happy: 6, smarts: 3, karma: 2 },
          scene: { anim: 'study', fx: 'idea', npcAnim: { coworker: 'nod' } } },
        { label: 'Tự bỏ tiền thuê giờ bay mô phỏng để học lại cho thật', req: { flag: 'job_phicong_chaycua' },
          text: 'Tim bạn đập loạn mỗi khi có câu hỏi kỹ thuật. Sau chuyến bay, bạn lặng lẽ tự bỏ tiền thuê buồng lái giả định, tập lại đến khi thực sự xứng với bốn vạch trên vai.',
          effects: { money: -50000000, smarts: 5, karma: 4, happy: 2 },
          scene: { anim: 'drive', fx: 'sweat', loc: 'airport', time: 'night' } }
      ]
    }
  );
})();
