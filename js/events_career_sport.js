/* Một Kiếp Người — biến cố nghề nghiệp: thể thao */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= NĂNG KHIẾU THỂ THAO (TUỔI NHỎ) =======================
    {
      id: 's_job_talent_cauthu', title: 'Ông tuyển trạch viên bên đường biên', icon: '⚽', age: [9, 14], weight: 1.0,
      req: { notFlag: 'talent_cauthu' },
      text: 'Trận chung kết giải bóng đá học sinh, bạn đá hậu vệ trái nhưng chạy khắp sân. Bên đường biên có một người đàn ông đội mũ lưỡi trai, cầm sổ ghi chép từ đầu trận. Giờ nghỉ giữa hiệp, {teacher.k} chủ nhiệm thì thầm: “Người của học viện bóng đá đấy, cố lên em!”',
      scene: { loc: 'stadium', time: 'day', weather: 'clear', anim: 'run', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'think', say: 'Đứa số 3 chạy khỏe đấy.' }, { role: 'teacher', anim: 'clap', say: 'Cố lên em!' }, { role: 'classmate', anim: 'run' }, { role: 'crowd', anim: 'cheer' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Lao lên ghi bàn, thể hiện hết mình',
          success: { stat: 'health', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Phút cuối, bạn dốc bóng qua ba cầu thủ rồi sút căng vào góc xa. Cả sân vỡ òa. Ông tuyển trạch viên bước tới, đưa danh thiếp: “Cuối tuần lên học viện thử việc nhé, nhóc.”',
              effects: { happy: 12, health: 3, looks: 2, flag: 'talent_cauthu' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { stranger: 'clap', crowd: 'jump', teacher: 'cheer' }, npcSay: { stranger: 'Cuối tuần lên thử việc nhé!' } } },
            { text: 'Bạn lao lên quá sớm, mất bóng, đội bạn phản công ghi bàn. Ông tuyển trạch viên gập sổ ra về. Về nhà bạn tập tâng bóng đến tối mịt, tự hứa lần sau sẽ khác.',
              effects: { happy: -5, health: 2 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'walk', classmate: 'facepalm' } } }
          ] },
        { label: 'Chơi đúng vị trí, chuyền bóng cho đồng đội',
          text: 'Bạn chơi kỷ luật, bọc lót đúng chỗ, tung đường chuyền dọn cỗ cho bạn cùng lớp ghi bàn. Hết trận, ông tuyển trạch viên gật gù: “Biết chơi cho đội, hiếm đấy.” Rồi ông xin số điện thoại gia đình bạn.',
          effects: { happy: 8, smarts: 2, karma: 2, flag: 'talent_cauthu' },
          scene: { anim: 'point', fx: 'sparkle', npcAnim: { classmate: 'cheer', stranger: 'nod' } } },
        { label: 'Ngại quá, xin thầy cho ngồi dự bị',
          text: 'Bạn xin ra sân ngồi, tim đập thình thịch vì có người lạ nhìn. Trận đấu trôi qua bình thường, và cơ hội cũng trôi qua theo.',
          effects: { happy: -3 },
          scene: { anim: 'sit', fx: 'sweat', npcAnim: { teacher: 'shrug' } } }
      ]
    },
    {
      id: 's_job_talent_vdv_vo', title: 'Thầy võ để ý', icon: '🥋', age: [9, 15], weight: 1.0,
      req: { notFlag: 'talent_vdv_vo' },
      text: 'Bạn theo đứa bạn đến xem lớp võ ở nhà văn hóa phường. Đứng ngoài nhìn một lúc, bạn bắt chước đá thử vào bao cát, “bịch” một tiếng rõ to. Ông thầy võ tóc bạc dừng tay, nhìn bạn từ đầu đến chân.',
      scene: { loc: 'gym', time: 'dusk', weather: 'clear', anim: 'jump', expr: 'surprised',
        npcs: [{ role: 'teacher', gender: 'm', age: 58, anim: 'point', say: 'Đá lại cái nữa xem nào.' }, { role: 'classmate', anim: 'clap' }, { role: 'kid', anim: 'lift' }], fx: 'exclaim', shot: 'low' },
      choices: [
        { label: 'Đá thêm cú nữa, thật mạnh',
          success: { stat: 'health', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Cú đá thứ hai làm bao cát văng lệch hẳn. Thầy cười khà: “Có chân võ! Mai đến tập, thầy không lấy học phí.” Bạn về nhà mà chân như không chạm đất.',
              effects: { happy: 10, health: 4, flag: 'talent_vdv_vo' },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { teacher: 'laugh', classmate: 'jump' }, npcSay: { teacher: 'Có chân võ! Mai đến tập.' } } },
            { text: 'Bạn dồn sức quá đà, trượt chân ngã chổng vó giữa sàn. Cả lớp cười ồ. Thầy đỡ bạn dậy: “Muốn đá mạnh thì phải học đứng vững trước đã.”',
              effects: { happy: -4, health: -1, smarts: 1 },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { kid: 'laugh', teacher: 'shake' } } }
          ] },
        { label: 'Cúi chào, xin thầy nhận làm học trò',
          text: 'Bạn khoanh tay cúi chào đúng kiểu phim võ hiệp. Thầy bật cười, xoa đầu bạn: “Lễ phép thế này thì thầy nhận. Võ trước hết là đạo.” Từ đó tối nào bạn cũng có mặt ở sàn tập.',
          effects: { happy: 8, karma: 3, health: 3, flag: 'talent_vdv_vo' },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { teacher: 'nod' } } },
        { label: 'Thôi, học võ đau lắm',
          text: 'Bạn nhìn mấy anh chị đang tập mà ê ẩm thay, lắc đầu đi về. Thầy võ nhún vai, quay lại với lớp học.',
          effects: { happy: -1 },
          scene: { anim: 'shake', npcAnim: { teacher: 'shrug', classmate: 'sad' } } }
      ]
    },
    {
      id: 's_job_talent_caulong', title: 'Buổi tuyển chọn đội cầu lông tỉnh', icon: '🏸', age: [10, 15], weight: 1.0,
      req: { notFlag: 'talent_caulong' },
      text: 'Đội tuyển cầu lông trẻ của tỉnh mở buổi tuyển chọn ở nhà thi đấu. Hàng trăm đứa trẻ cầm vợt xếp hàng, phụ huynh chen kín khán đài. Đến lượt bạn, cô huấn luyện viên đứng bên kia lưới, tay cầm cả rổ cầu.',
      scene: { loc: 'court', time: 'day', weather: 'clear', anim: 'jump', expr: 'neutral',
        npcs: [{ role: 'teacher', gender: 'f', age: 40, anim: 'point', say: 'Đỡ được mười quả liên tiếp xem!' }, { role: 'kid', anim: 'jump' }, { role: 'crowd', anim: 'clap' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Nhảy đập cầu quyết liệt',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn bật cao, đập cầu cắm thẳng xuống sát vạch. Mười quả, mười hai quả, cô huấn luyện viên dừng tay: “Em tên gì? Tháng sau lên đội năng khiếu tập trung nhé.”',
              effects: { happy: 12, health: 3, looks: 1, flag: 'talent_caulong' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { teacher: 'clap', crowd: 'cheer' } } },
            { text: 'Quả thứ tư bạn đập rúc lưới, quả thứ năm bay ra ngoài sân. Cô huấn luyện viên ghi gì đó vào sổ rồi gọi em tiếp theo. Bạn mím môi, quyết tâm tập thêm.',
              effects: { happy: -5, health: 1 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { teacher: 'shake' } } }
          ] },
        { label: 'Đánh chắc, cài cầu khéo léo',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn không đập mạnh, nhưng quả nào cũng rơi đúng góc khó. Cô huấn luyện viên nheo mắt: “Đầu óc chiến thuật đấy.” Tên bạn nằm trong danh sách đội năng khiếu.',
              effects: { happy: 10, smarts: 2, flag: 'talent_caulong' },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { teacher: 'nod' } } },
            { text: 'Bạn đánh an toàn quá, quả nào cũng nhẹ hều. Cô huấn luyện viên lắc đầu: “Tốt, nhưng chưa đủ.” Bạn ra về với cây vợt và một nỗi tiếc nuối.',
              effects: { happy: -4 },
              scene: { anim: 'sad', npcAnim: { teacher: 'shrug' } } }
          ] },
        { label: 'Run quá, xin rút lui',
          text: 'Nhìn đám đông trên khán đài, chân bạn nhũn ra. Bạn lặng lẽ cất vợt vào bao. Năm sau, có lẽ.',
          effects: { happy: -3 },
          scene: { anim: 'scared', fx: 'sweat', npcAnim: { kid: 'shrug' } } }
      ]
    },
    {
      id: 's_job_talent_esports', title: 'Tin nhắn từ đội tuyển eSports', icon: '🎮', age: [13, 15], weight: 1.0,
      req: { notFlag: 'talent_esports' },
      text: 'Nửa đêm, rank của bạn leo lên top 50 máy chủ Việt Nam. Sáng ra, hộp thư có tin nhắn từ quản lý một đội eSports chuyên nghiệp: “Bọn anh theo dõi em mấy tuần rồi. Có muốn thử vào học viện của đội không?”',
      scene: { loc: 'bedroom', time: 'dawn', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Đồng ý thử sức ngay',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Buổi đấu thử online, bạn gánh cả team dự bị lật kèo. Quản lý gửi ngay một biểu tượng ngón cái: “Đủ 16 tuổi là có hợp đồng nhé. Giờ lo học cho xong đã.”',
              effects: { happy: 12, smarts: 3, flag: 'talent_esports' },
              scene: { anim: 'cheer', fx: 'levelup', say: 'Gánh team!' } },
            { text: 'Trước camera của đội, tay bạn run bần bật, chết liên tục. Quản lý nhắn: “Kỹ năng có, nhưng tâm lý chưa vững. Hẹn em năm sau.”',
              effects: { happy: -6, smarts: 1 },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Hỏi ý kiến bố mẹ trước',
          text: 'Bạn đưa điện thoại cho bố mẹ xem. Cả nhà ngồi bàn suốt bữa tối, cuối cùng chốt: được theo, miễn điểm số không tụt. Đội chấp nhận, bạn được vào học viện cuối tuần.',
          effects: { happy: 8, karma: 2, smarts: 1, flag: 'talent_esports' },
          scene: { anim: 'talk', fx: 'idea', loc: 'home', time: 'night' } },
        { label: 'Lờ đi, chắc lừa đảo',
          text: 'Bạn chặn luôn tài khoản lạ cho chắc. Mấy tháng sau, bạn thấy cái tên ấy dẫn đội lên ngôi vô địch trên livestream, và hơi chột dạ.',
          effects: { happy: -2, smarts: 1 },
          scene: { anim: 'shrug', fx: 'question' } }
      ]
    },
    // ======================= CẦU THỦ BÓNG ĐÁ =======================
    {
      id: 's_job_cauthu_daychang', title: 'Đứt dây chằng', icon: '🦵', age: [17, 35], weight: 1.5,
      req: { jobId: ['cauthu'], notFlag: 'job_cauthu_daychang' },
      text: 'Phút 67 trận derby, bạn tiếp đất sau một pha tranh chấp bóng bổng và nghe thấy một tiếng “rắc” khô khốc trong đầu gối. Cả sân vận động lặng đi. Đầu gối phải sưng lên nhanh như bị bơm hơi, còn bác sĩ đội đang chạy vào với túi đá lạnh.',
      scene: { loc: 'stadium', time: 'night', weather: 'clear', anim: 'fall', expr: 'sick',
        npcs: [{ role: 'doctor', anim: 'run', say: 'Đừng cử động! Để tôi xem!' }, { role: 'coworker', anim: 'scared' }, { role: 'crowd', anim: 'idle' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Ra hiệu xin thay người ngay',
          text: 'Bạn nằm cáng rời sân trong tiếng vỗ tay động viên của khán đài. Kết quả chụp MRI sáng hôm sau: đứt dây chằng chéo trước. Ít nhất chín tháng không được chạm vào bóng.',
          effects: { health: -10, happy: -10, illness: 'Đứt dây chằng', flag: 'job_cauthu_daychang', followUp: { id: 's_job_cauthu_hoiphuc', delay: 1 } },
          scene: { anim: 'sick', fx: 'tears', npcAnim: { crowd: 'clap', coworker: 'sad' } } },
        { label: 'Cắn răng đá tiếp, đội đang cần mình',
          outcomes: [
            { p: 0.3, text: 'May mắn chỉ là bong gân nặng. Bạn tập tễnh đá nốt trận, còn kịp kiến tạo bàn thắng quyết định. Báo chí gọi bạn là “chiến binh”, nhưng đầu gối thì đau suốt cả tháng.',
              effects: { health: -5, happy: 6, looks: 4 },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { crowd: 'cheer', coworker: 'hug' } } },
            { p: 0.7, text: 'Ba phút sau, đầu gối khuỵu hẳn xuống, lần này bạn không đứng dậy nổi. Bác sĩ lắc đầu: dây chằng đứt hoàn toàn, sụn chêm cũng rách theo vì bạn cố quá.',
              effects: { health: -16, happy: -12, illness: 'Đứt dây chằng', flag: ['job_cauthu_daychang', 'job_cauthu_daychang_nang'], followUp: { id: 's_job_cauthu_hoiphuc', delay: 1 } },
              scene: { anim: 'fall', fx: 'tears', npcAnim: { doctor: 'facepalm', coworker: 'scared' } } }
          ] },
        { label: 'Xin tiêm giảm đau để đá nốt trận',
          text: 'Mũi tiêm làm cơn đau tan biến, bạn đá như chưa có gì xảy ra. Đến đêm thuốc hết tác dụng, bạn đau đến mức không ngủ được. Chụp phim: đứt dây chằng, và tổn thương nặng thêm vì cố chạy.',
          effects: { health: -14, happy: -8, illness: 'Đứt dây chằng', flag: ['job_cauthu_daychang', 'job_cauthu_daychang_nang'], followUp: { id: 's_job_cauthu_hoiphuc', delay: 1 } },
          scene: { anim: 'sick', fx: 'sweat', time: 'night', loc: 'hospital', npcAnim: { doctor: 'shake' } } }
      ]
    },
    {
      id: 's_job_cauthu_hoiphuc', title: 'Phòng tập phục hồi', icon: '🏥', age: [17, 40], chainOnly: true,
      req: { jobId: ['cauthu'], flag: 'job_cauthu_daychang' },
      text: 'Sau ca mổ nối dây chằng, ngày nào bạn cũng ở phòng vật lý trị liệu, tập từng bước co duỗi gối. Câu lạc bộ đã mua tiền đạo mới thế chỗ bạn. Bác sĩ dặn đi dặn lại: “Vội một tháng, mất cả sự nghiệp.”',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'walk', expr: 'sad',
        npcs: [{ role: 'doctor', anim: 'point', say: 'Chưa đủ chín tháng thì chưa được đá!' }, { role: 'boss', anim: 'phone', say: 'Bao giờ em đá lại được?' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Kiên nhẫn tập đủ phác đồ',
          text: 'Bạn nghe lời bác sĩ, tập từng ngày một, kể cả những hôm muốn bỏ cuộc. Mười tháng sau bạn trở lại sân, chậm hơn một chút nhưng đầu gối chắc như cũ. Cả đội xếp hàng vỗ tay đón bạn.',
          effects: { cure: true, health: 8, happy: 8, smarts: 2, unflag: 'job_cauthu_daychang' },
          scene: { anim: 'run', loc: 'stadium', fx: 'sparkle', npcAnim: { doctor: 'clap', boss: 'nod' } } },
        { label: 'Đòi ra sân sớm để giữ suất đá chính',
          success: { stat: 'health', base: 0.25, scale: 0.4 },
          outcomes: [
            { text: 'Sáu tháng sau bạn ra sân và ghi bàn ngay trận tái xuất. Khán đài gào tên bạn. Bác sĩ nhìn bảng tỷ số, thở phào mà vẫn lắc đầu.',
              effects: { cure: true, happy: 12, looks: 4, health: -3, unflag: 'job_cauthu_daychang' },
              scene: { anim: 'cheer', loc: 'stadium', fx: 'confetti', npcAnim: { boss: 'clap' } } },
            { text: 'Trận thứ hai trở lại, đầu gối cũ đứt lần nữa. Lần này bác sĩ nói thẳng: bạn không thể đá chuyên nghiệp được nữa. Câu lạc bộ gửi lời cảm ơn và thanh lý hợp đồng.',
              effects: { health: -12, happy: -18, job: 'fire', flag: 'ex_athlete', unflag: 'job_cauthu_daychang' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { doctor: 'shake', boss: 'shrug' } } }
          ] },
        { label: 'Bán ô tô, sang Singapore chữa trị', req: { asset: 'car' },
          text: 'Bạn bán chiếc ô tô vẫn hay chạy ra sân tập để bay sang Singapore, theo một chuyên gia phục hồi thể thao hàng đầu. Đắt xắt ra miếng: bảy tháng sau bạn đã chạy nước rút như chưa từng chấn thương.',
          effects: { asset: { lose: 'car' }, cure: true, health: 12, happy: 6, unflag: 'job_cauthu_daychang' },
          scene: { anim: 'run', fx: 'levelup', npcAnim: { doctor: 'clap' } } },
        { label: 'Chán nản, treo giày luôn',
          text: 'Bạn nhìn đầu gối chằng chịt sẹo và thấy mệt mỏi. Bạn ký giấy thanh lý hợp đồng, quyết định đi học bằng huấn luyện viên. Bóng đá vẫn còn đó, chỉ là ở bên kia đường biên.',
          effects: { happy: -6, smarts: 3, job: 'fire', flag: 'ex_athlete', unflag: 'job_cauthu_daychang' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { boss: 'nod' } } }
      ]
    },
    {
      id: 's_job_cauthu_bando', title: 'Lời mời bán độ', icon: '💰', age: [17, 35], weight: 1.5,
      req: { jobId: ['cauthu'], notFlag: 'job_cauthu_bando_hoi' },
      text: 'Tối trước trận gặp đội bét bảng, một người đàn ông lạ mời bạn cà phê. Ông ta đẩy qua bàn một chiếc phong bì dày: “{money:800000000}. Chỉ cần đội em thua cách biệt hai bàn. Em đá hậu vệ, sơ hở một chút là được.”',
      scene: { loc: 'cafe', time: 'night', weather: 'rain', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'sit', expr: 'neutral', say: 'Thua hai bàn. Không ai biết đâu.' }], fx: 'money', shot: 'dramatic' },
      choices: [
        { label: 'Cầm phong bì',
          text: 'Trận đấu, bạn trượt chân đúng lúc, phạm lỗi đúng chỗ. Đội thua 0–2. Đêm đó bạn đếm tiền mà tay run, còn nhóm Zalo của đội thì im phăng phắc.',
          effects: { money: 800000000, karma: -18, happy: -4, flag: ['job_cauthu_bando_hoi', 'job_cauthu_bando'], followUp: { id: 's_job_cauthu_dieutra', delay: 1 } },
          scene: { anim: 'think', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Từ chối và báo ngay cho Ban huấn luyện',
          outcomes: [
            { p: 0.7, text: 'Câu lạc bộ báo cơ quan chức năng, VFF gửi thư khen ngợi. Báo chí đưa tin “Cầu thủ trẻ từ chối {money:800000000}”, người hâm mộ nhắc tên bạn với sự kính trọng.',
              effects: { karma: 14, happy: 8, looks: 5, job: 'raise', flag: 'job_cauthu_bando_hoi' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'angry' } } },
            { p: 0.3, text: 'Bạn báo cáo, nhưng mọi chuyện bị “xử lý nội bộ” rồi chìm xuồng. Vài tuần sau, lốp xe máy của bạn bị rạch nát trước cổng nhà. Bạn biết đó là lời nhắn.',
              effects: { karma: 10, happy: -8, flag: 'job_cauthu_bando_hoi' },
              scene: { anim: 'scared', fx: 'sweat', loc: 'street', npcAnim: { stranger: 'point' } } }
          ] },
        { label: 'Giả vờ nhận lời, bí mật ghi âm nộp công an',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bản ghi âm rõ từng chữ. Công an phá được cả một đường dây cá độ liên tỉnh. Bạn được Bộ Công an khen thưởng, còn câu lạc bộ tăng lương và trao băng đội phó.',
              effects: { karma: 16, smarts: 3, looks: 6, happy: 10, job: 'promote', flag: 'job_cauthu_bando_hoi' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { stranger: 'scared' } } },
            { text: 'Ông ta phát hiện chiếc điện thoại đang ghi âm trong túi áo bạn. Tối hôm sau, hai gã lạ mặt chặn bạn ở bãi giữ xe. Bạn thoát được, nhưng phải nghỉ thi đấu ba tuần.',
              effects: { karma: 8, health: -10, happy: -10, illness: 'Chấn thương cơ', flag: 'job_cauthu_bando_hoi' },
              scene: { anim: 'scared', loc: 'street', fx: 'anger', npcAnim: { stranger: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_cauthu_dieutra', title: 'Cơ quan điều tra gõ cửa', icon: '🚔', age: [17, 40], chainOnly: true,
      req: { jobId: ['cauthu'], flag: 'job_cauthu_bando' },
      text: 'Đường dây cá độ bị triệt phá, trong điện thoại của ông trùm có tin nhắn Zalo với bạn. Sáng nay, hai cán bộ công an đến tận sân tập, mời bạn về trụ sở “làm việc”. Đồng đội đứng nhìn theo, không ai nói câu nào.',
      scene: { loc: 'stadium', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Mời cầu thủ {name} về trụ sở làm việc.' }, { role: 'boss', anim: 'facepalm' }, { role: 'coworker', anim: 'shake' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Thành khẩn khai báo, nộp lại tiền',
          text: 'Bạn khai hết, nộp lại toàn bộ {money:800000000}. Nhờ thành khẩn, bạn chỉ nhận án treo, nhưng VFF cấm thi đấu bóng đá chuyên nghiệp suốt đời. Câu lạc bộ chấm dứt hợp đồng ngay trong ngày.',
          effects: { money: -800000000, karma: 6, happy: -16, looks: -6, job: 'fire', unflag: 'job_cauthu_bando' },
          scene: { anim: 'cry', loc: 'office', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Chối đến cùng',
          outcomes: [
            { p: 0.2, text: 'Bằng chứng chưa đủ, bạn được cho về. Nhưng câu lạc bộ vẫn lặng lẽ thanh lý hợp đồng “vì lý do chuyên môn”. Không đội nào dám nhận bạn nữa.',
              effects: { karma: -6, happy: -10, job: 'fire', unflag: 'job_cauthu_bando' },
              scene: { anim: 'shrug', loc: 'office', fx: 'sweat', npcAnim: { police: 'shake' } } },
            { p: 0.8, text: 'Điều tra viên đặt lên bàn sao kê ngân hàng và ảnh chụp camera quán cà phê. Bạn bị khởi tố, phạt tiền nặng và cấm thi đấu suốt đời. Tên bạn thành chữ “bán độ” trên mọi mặt báo.',
              effects: { karma: -10, happy: -20, looks: -10, money: -1200000000, job: 'fire', unflag: 'job_cauthu_bando' },
              scene: { anim: 'sad', loc: 'office', fx: 'heartbreak', npcAnim: { police: 'point' } } }
          ] },
        { label: 'Khai ra cả đường dây để được giảm nhẹ',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn cung cấp tên những kẻ đứng sau và các cầu thủ khác bị mua chuộc. Nhờ lập công, bạn chỉ bị phạt hành chính, nộp lại tiền và treo giò năm năm. Sự nghiệp coi như dừng ở đây.',
              effects: { money: -800000000, karma: 2, happy: -12, smarts: 2, job: 'fire', unflag: 'job_cauthu_bando' },
              scene: { anim: 'talk', loc: 'office', fx: 'idea', npcAnim: { police: 'nod' } } },
            { text: 'Lời khai của bạn bị đường dây chối phăng, còn bạn thì bị gắn mác “kẻ phản bội”. Vẫn bị khởi tố, vẫn mất việc, lại thêm những cuộc gọi đe dọa lúc nửa đêm.',
              effects: { money: -800000000, karma: -4, happy: -18, health: -4, job: 'fire', unflag: 'job_cauthu_bando' },
              scene: { anim: 'scared', loc: 'office', fx: 'anger', npcAnim: { police: 'shrug' } } }
          ] }
      ]
    },
    {
      id: 's_job_cauthu_tuyenqg', title: 'Được gọi lên tuyển quốc gia', icon: '🇻🇳', age: [18, 34], weight: 1.4,
      req: { jobId: ['cauthu'], minStat: { health: 55 } },
      text: 'Danh sách tập trung đội tuyển quốc gia chuẩn bị cho AFF Cup vừa công bố, và tên bạn nằm ở dòng thứ mười bảy. Điện thoại réo liên tục, cả quê nhà ở {city} rần rần chia sẻ. Bạn xách vali lên trung tâm huấn luyện, khoác lên mình chiếc áo đỏ sao vàng.',
      scene: { loc: 'stadium', time: 'day', weather: 'clear', anim: 'cheer', expr: 'happy',
        npcs: [{ role: 'boss', gender: 'm', age: 55, anim: 'clap', say: 'Chào mừng em đến với đội tuyển.' }, { role: 'coworker', anim: 'wave' }, { role: 'crowd', anim: 'cheer' }], fx: 'fireworks', shot: 'orbit' },
      choices: [
        { label: 'Tập luyện hết mình, chờ cơ hội ra sân',
          success: { stat: 'health', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Trận chung kết lượt về, bạn vào sân từ ghế dự bị và đánh đầu ghi bàn quyết định. Cả nước đổ ra đường cổ vũ. Một doanh nghiệp tặng bạn chiếc ô tô thưởng nóng, còn huy chương vàng thì bạn treo ngay phòng khách.',
              effects: { happy: 18, looks: 10, money: 500000000, job: 'promote', asset: { add: { type: 'car', name: 'Ô tô thưởng nóng AFF Cup', value: 900000000 } } },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { crowd: 'jump', coworker: 'hug' }, npcSay: { crowd: 'Việt Nam vô địch!' } } },
            { text: 'Bạn ngồi dự bị suốt giải, chỉ được vào sân đúng tám phút. Nhưng tám phút ấy đủ để bạn hiểu khoảng cách với đẳng cấp châu lục, và quyết tâm tập gấp đôi.',
              effects: { happy: 2, smarts: 3, health: 3 },
              scene: { anim: 'sit', fx: 'idea', npcAnim: { boss: 'nod' } } }
          ] },
        { label: 'Khiêm tốn học hỏi các đàn anh',
          text: 'Bạn lặng lẽ xách nước, nhặt bóng, ở lại tập thêm sau giờ. Các đàn anh quý tính bạn, thầy tin bạn. Kết thúc đợt tập trung, câu lạc bộ chủ quản ký gia hạn với mức lương mới.',
          effects: { happy: 8, karma: 4, smarts: 2, job: 'raise' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { coworker: 'hug' } } },
        { label: 'Trốn trại đi bar ăn mừng',
          outcomes: [
            { p: 0.6, text: 'Một bức ảnh bạn cầm ly rượu lúc 2 giờ sáng lan khắp TikTok. Ban huấn luyện gạch tên bạn khỏi danh sách ngay hôm sau, kèm án kỷ luật từ câu lạc bộ.',
              effects: { happy: -12, looks: -5, karma: -4, money: -50000000 },
              scene: { anim: 'facepalm', loc: 'karaoke', time: 'night', fx: 'exclaim', npcAnim: { boss: 'angry' } } },
            { p: 0.4, text: 'Bạn lẻn về kịp trước giờ điểm danh, không ai hay biết. Nhưng sáng hôm sau tập thể lực, bạn hụt hơi thảm hại và mất suất đá chính.',
              effects: { happy: -2, health: -4 },
              scene: { anim: 'sick', fx: 'sweat', npcAnim: { boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_cauthu_nuocngoai', title: 'Lời mời chơi bóng nước ngoài', icon: '✈️', age: [19, 32], weight: 1.3,
      req: { jobId: ['cauthu'] },
      text: 'Người đại diện gọi bạn lúc nửa đêm, giọng hồ hởi: một câu lạc bộ J-League muốn mượn bạn một mùa, còn một đội Thai League thì trả lương gấp ba hiện tại. Chủ tịch câu lạc bộ nhà thì nhắn: “Ở lại đi em, mùa sau anh giao băng đội trưởng.”',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 38, anim: 'talk', say: 'Cơ hội đời người đấy em!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Sang Nhật thử thách bản thân',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Mùa đông lạnh cắt da, bạn tập như điên và giành được suất đá chính ở vòng hai. Báo Nhật khen bạn “nhỏ con mà lì lợm”. Trở về nước, giá trị chuyển nhượng của bạn tăng vọt.',
              effects: { happy: 12, looks: 6, smarts: 4, money: 1200000000, job: 'promote' },
              scene: { anim: 'cheer', loc: 'stadium', weather: 'snow', fx: 'levelup', npcAnim: { stranger: 'clap' } } },
            { text: 'Bạn ngồi dự bị gần hết mùa, có trận còn không được đăng ký. Bạn về nước với chút tiếng Nhật bập bõm và bài học đắt giá về thể lực, chuyên nghiệp.',
              effects: { happy: -8, smarts: 5, money: 200000000 },
              scene: { anim: 'sad', loc: 'stadium', weather: 'snow', fx: 'sweat' } }
          ] },
        { label: 'Sang Thái Lan, lương gấp ba',
          text: 'Bạn chọn Thai League. Lương cao, đội mạnh, sân lúc nào cũng kín khán giả. Sau một mùa, tài khoản dày lên trông thấy và bạn còn nói được dăm câu tiếng Thái.',
          effects: { happy: 8, money: 1500000000, looks: 3 },
          scene: { anim: 'cheer', loc: 'stadium', fx: 'money', npcAnim: { stranger: 'nod' } } },
        { label: 'Ở lại, nhận băng đội trưởng',
          text: 'Bạn từ chối cả hai lời mời. Ngày ra mắt mùa giải mới, chủ tịch tự tay đeo băng đội trưởng lên tay bạn. Khán đài giăng băng rôn: “Trung thành là vàng”.',
          effects: { happy: 6, karma: 5, looks: 3, job: 'raise' },
          scene: { anim: 'wave', loc: 'stadium', fx: 'confetti', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 's_job_cauthu_cuoicung', title: 'Trận đấu cuối cùng', icon: '👟', age: [32, 40], weight: 1.6,
      req: { jobId: ['cauthu'] },
      text: 'Ba mươi mấy tuổi, mỗi sáng thức dậy đầu gối lại kêu răng rắc. Đàn em mười chín tuổi chạy nhanh hơn bạn cả mét. Trước trận cuối mùa, ban lãnh đạo hỏi bạn: “Mùa sau em tính sao?”',
      scene: { loc: 'stadium', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Mùa sau em tính sao?' }, { role: 'coworker', anim: 'run' }, { role: 'crowd', anim: 'wave' }], fx: 'petals', shot: 'wide' },
      choices: [
        { label: 'Giải nghệ trong vòng tay khán giả, đi học bằng HLV',
          text: 'Phút 80 trận cuối, bạn được thay ra. Cả sân đứng dậy vỗ tay, đồng đội xếp hàng chào. Bạn cúi xuống hôn mặt cỏ, rồi cởi giày đặt lại bên đường biên. Tuần sau, bạn đăng ký khóa học bằng huấn luyện viên.',
          effects: { happy: 10, looks: 4, karma: 3, job: 'fire', flag: 'ex_athlete' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { crowd: 'clap', coworker: 'clap' }, npcSay: { crowd: 'Cảm ơn {name}!' } } },
        { label: 'Đá thêm một mùa nữa',
          outcomes: [
            { p: 0.5, text: 'Bạn ép cân, tập thêm buổi tối, và vẫn đá chính được nửa mùa. Không còn nhanh, nhưng bạn đọc trận đấu tốt hơn bất kỳ ai trên sân.',
              effects: { happy: 6, health: -4, smarts: 2 },
              scene: { anim: 'run', fx: 'sweat', npcAnim: { boss: 'nod' } } },
            { p: 0.5, text: 'Cơ đùi sau rách ngay trận thứ ba. Bác sĩ khuyên: “Cơ thể anh đang xin anh dừng lại rồi đấy.”',
              effects: { happy: -8, health: -10, illness: 'Chấn thương cơ' },
              scene: { anim: 'fall', fx: 'sick', npcAnim: { boss: 'facepalm' } } }
          ] },
        { label: 'Bán ô tô, mở lò đào tạo bóng đá trẻ', req: { asset: 'car' },
          text: 'Bạn bán chiếc ô tô, gom thêm tiền thưởng các năm để thuê một bãi đất ven sông làm sân. Lò đào tạo nhỏ khai giảng với hai mươi đứa trẻ chân đất. Bạn treo giày, nhưng còi vẫn trên cổ.',
          effects: { asset: { lose: 'car' }, happy: 12, karma: 10, job: 'fire', flag: 'ex_athlete' },
          scene: { anim: 'point', fx: 'sparkle', npcAnim: { crowd: 'run' } } },
        { label: 'Giải nghệ, chuyển sang kinh doanh',
          text: 'Bạn chia tay sân cỏ trong một buổi họp báo ngắn gọn rồi dùng tên tuổi của mình mở chuỗi cửa hàng đồ thể thao. Ngày khai trương, đồng đội cũ kéo đến chật cả vỉa hè.',
          effects: { happy: 6, smarts: 2, flag: 'ex_athlete', job: { hire: 'kinhdoanh' } },
          scene: { anim: 'wave', loc: 'market', fx: 'confetti', npcAnim: { crowd: 'clap' } } }
      ]
    },
    // ======================= VÕ SĨ =======================
    {
      id: 's_job_vdv_vo_chanthuong', title: 'Chấn thương nặng trên sàn', icon: '🥊', age: [17, 36], weight: 1.5,
      req: { jobId: ['vdv_vo'], notFlag: 'job_vdv_vo_chanthuong' },
      text: 'Hiệp ba, đối thủ tung cú đá quét thấp đúng lúc bạn dồn trọng tâm lên chân trước. Đầu gối bẻ ngoặt sang một bên, bạn đổ sập xuống sàn. Trọng tài cúi xuống đếm, khán đài gào thét, còn chân bạn thì không nghe lời nữa.',
      scene: { loc: 'ring', time: 'night', weather: 'clear', anim: 'fall', expr: 'sick',
        npcs: [{ role: 'stranger', gender: 'm', age: 27, anim: 'angry', say: 'Đứng dậy đi!' }, { role: 'coworker', anim: 'scared', say: 'Ném khăn đi thầy ơi!' }, { role: 'crowd', anim: 'cheer' }], fx: 'flash', shot: 'low' },
      choices: [
        { label: 'Ra hiệu xin dừng trận',
          text: 'Bạn đập tay xuống sàn. Ban tổ chức đưa bạn đi cấp cứu ngay trong đêm. Kết quả: đứt dây chằng chéo, phải mổ và nghỉ thi đấu gần một năm.',
          effects: { health: -10, happy: -10, illness: 'Đứt dây chằng', flag: 'job_vdv_vo_chanthuong', followUp: { id: 's_job_vdv_vo_phuchoi', delay: 1 } },
          scene: { anim: 'sick', loc: 'hospital', fx: 'tears', npcAnim: { coworker: 'sad' } } },
        { label: 'Gượng dậy, đánh nốt trận',
          outcomes: [
            { p: 0.3, text: 'Bạn đứng bằng một chân, chờ đối thủ lao vào rồi tung cú móc trái chí mạng. Knock-out! Bạn thắng trận trong tiếng hò reo, rồi được khiêng thẳng xuống xe cứu thương.',
              effects: { health: -12, happy: 8, looks: 6, money: 100000000, illness: 'Chấn thương cơ', flag: 'job_vdv_vo_chanthuong', followUp: { id: 's_job_vdv_vo_phuchoi', delay: 1 } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { crowd: 'jump', stranger: 'fall' } } },
            { p: 0.7, text: 'Bạn vừa đứng dậy, đối thủ đã nhắm đúng cái chân đau mà đá tiếp. Bạn gục hẳn. Thua knock-out, đầu gối tổn thương nặng hơn gấp bội.',
              effects: { health: -18, happy: -14, illness: 'Đứt dây chằng', flag: 'job_vdv_vo_chanthuong', followUp: { id: 's_job_vdv_vo_phuchoi', delay: 1 } },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { stranger: 'cheer', coworker: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_job_vdv_vo_phuchoi', title: 'Những tháng ngày tập hồi phục', icon: '🩼', age: [17, 42], chainOnly: true,
      req: { jobId: ['vdv_vo'], flag: 'job_vdv_vo_chanthuong' },
      text: 'Bạn chống nạng ra vào phòng vật lý trị liệu, nhìn đối thủ cũ khoe đai trên Facebook. Quản lý gọi điện: có trận đấu cát-xê cao vào tháng sau, “đánh được không em?”. Bác sĩ thì chỉ vào phim chụp, lắc đầu.',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'walk', expr: 'sad',
        npcs: [{ role: 'doctor', anim: 'shake', say: 'Ít nhất sáu tháng nữa mới được lên sàn.' }, { role: 'boss', anim: 'phone', say: 'Cát-xê cao lắm đấy em!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Nghe lời bác sĩ, tập hồi phục đủ thời gian',
          text: 'Bạn nhịn, tập từng động tác nhỏ nhất. Gần một năm sau, bạn bước lên sàn tập, tung cú đá đầu tiên. Đầu gối vững như chưa từng có chuyện gì.',
          effects: { cure: true, health: 8, happy: 6, smarts: 2, unflag: 'job_vdv_vo_chanthuong' },
          scene: { anim: 'jump', loc: 'ring', fx: 'sparkle', npcAnim: { doctor: 'clap' } } },
        { label: 'Nhận trận cát-xê cao dù chưa lành',
          success: { stat: 'health', base: 0.2, scale: 0.4 },
          outcomes: [
            { text: 'Bạn băng chặt gối, đánh phòng thủ chặt chẽ và thắng điểm sít sao. Cầm phong bì {money:250000000}, bạn tự hứa sẽ không liều như thế nữa.',
              effects: { cure: true, money: 250000000, happy: 6, health: -4, unflag: 'job_vdv_vo_chanthuong' },
              scene: { anim: 'cheer', loc: 'ring', fx: 'money', npcAnim: { boss: 'clap' } } },
            { text: 'Ngay hiệp một, đầu gối khuỵu xuống lần nữa. Bác sĩ kết luận: bạn không thể thi đấu đối kháng chuyên nghiệp được nữa. Chiếc găng treo lên tường từ đó.',
              effects: { health: -14, happy: -18, job: 'fire', flag: 'ex_athlete', unflag: 'job_vdv_vo_chanthuong' },
              scene: { anim: 'cry', loc: 'ring', fx: 'heartbreak', npcAnim: { boss: 'facepalm' } } }
          ] },
        { label: 'Bán xe máy lấy tiền chữa trị tốt nhất', req: { asset: 'motorbike' },
          text: 'Bạn bán chiếc xe máy yêu quý để theo phác đồ phục hồi ở một trung tâm y học thể thao tư nhân. Tiền nào của nấy: bạn trở lại sàn sớm hơn dự kiến ba tháng.',
          effects: { asset: { lose: 'motorbike' }, cure: true, health: 12, happy: 4, unflag: 'job_vdv_vo_chanthuong' },
          scene: { anim: 'lift', loc: 'ring', fx: 'levelup', npcAnim: { doctor: 'nod' } } },
        { label: 'Treo găng, mở lớp dạy võ',
          text: 'Bạn quyết định không liều nữa. Bạn thuê một góc nhà văn hóa, mở lớp võ cho trẻ con trong phường. Tiếng hô “Hây!” vang lên mỗi tối, và bạn thấy mình vẫn thuộc về võ đài.',
          effects: { happy: 4, karma: 5, job: 'fire', flag: 'ex_athlete', unflag: 'job_vdv_vo_chanthuong' },
          scene: { anim: 'point', loc: 'ring', fx: 'sparkle', npcAnim: { doctor: 'nod' } } }
      ]
    },
    {
      id: 's_job_vdv_vo_epthua', title: 'Bị ép thua độ', icon: '🎲', age: [17, 36], weight: 1.5,
      req: { jobId: ['vdv_vo'], notFlag: 'job_vdv_vo_epthua_hoi' },
      text: 'Đêm trước trận bán kết, hai gã xăm trổ chặn bạn ở bãi giữ xe nhà thi đấu. Một gã ném chiếc phong bì vào giỏ xe: “{money:300000000}. Hiệp hai nằm xuống. Không nghe thì từ giờ đi đường cẩn thận.”',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thug', gender: 'm', age: 35, anim: 'point', say: 'Hiệp hai nằm xuống. Hiểu chưa?' }, { role: 'stranger', gender: 'm', age: 30, anim: 'idle', expr: 'angry' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Cầm tiền, hiệp hai nằm xuống',
          text: 'Hiệp hai, bạn đỡ hờ một cú đấm rồi đổ xuống sàn, nằm im nghe trọng tài đếm đến mười. Khán giả la ó, huấn luyện viên nhìn bạn rất lâu. Tiền thì đã nằm trong tài khoản.',
          effects: { money: 300000000, karma: -18, happy: -8, flag: ['job_vdv_vo_epthua_hoi', 'job_vdv_vo_epthua'], followUp: { id: 's_job_vdv_vo_dieutra', delay: 1 } },
          scene: { anim: 'fall', loc: 'ring', fx: 'money', npcAnim: { thug: 'laugh' } } },
        { label: 'Báo công an ngay trong đêm',
          outcomes: [
            { p: 0.7, text: 'Công an vào cuộc, camera bãi xe ghi rõ mặt hai gã. Đường dây cá độ bị triệt phá, còn bạn bước lên sàn với cái đầu nhẹ tênh và thắng điểm thuyết phục.',
              effects: { karma: 14, happy: 10, looks: 4, job: 'raise', flag: 'job_vdv_vo_epthua_hoi' },
              scene: { anim: 'cheer', loc: 'ring', fx: 'sparkle', npcAnim: { thug: 'scared' } } },
            { p: 0.3, text: 'Hai gã kia biến mất trước khi công an tới. Mấy tuần sau, bạn nhận một tin nhắn ảnh chụp cổng nhà mình. Bạn phải chuyển nhà, sống trong lo sợ một thời gian.',
              effects: { karma: 10, happy: -10, moneyPct: -0.05, flag: 'job_vdv_vo_epthua_hoi' },
              scene: { anim: 'scared', fx: 'sweat', npcAnim: { thug: 'point' } } }
          ] },
        { label: 'Ném trả phong bì, lên sàn đánh thắng',
          success: { stat: 'health', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn knock-out đối thủ ngay hiệp hai, đúng hiệp mà bọn chúng muốn bạn nằm xuống. Cả nhà thi đấu đứng dậy. Bọn cá độ thua đậm, và từ đó chẳng ai dám gạ bạn nữa.',
              effects: { karma: 10, happy: 12, looks: 6, money: 80000000, flag: 'job_vdv_vo_epthua_hoi' },
              scene: { anim: 'cheer', loc: 'ring', fx: 'fireworks', npcAnim: { thug: 'angry' } } },
            { text: 'Bạn thua điểm trong một trận đấu khó. Tối đó, bạn bị đánh hội đồng ở đầu hẻm. Công an đang truy tìm, còn bạn phải nằm viện một tuần với chấn thương cơ.',
              effects: { karma: 8, health: -12, happy: -10, illness: 'Chấn thương cơ', flag: 'job_vdv_vo_epthua_hoi' },
              scene: { anim: 'sick', loc: 'hospital', fx: 'sick', npcAnim: { thug: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_vdv_vo_dieutra', title: 'Hồ sơ trận đấu bị mở lại', icon: '🚔', age: [17, 42], chainOnly: true,
      req: { jobId: ['vdv_vo'], flag: 'job_vdv_vo_epthua' },
      text: 'Liên đoàn võ thuật phối hợp với công an mở lại hồ sơ trận bán kết năm ngoái: video quay chậm cho thấy cú đấm “hạ gục” bạn chỉ sượt qua vai. Hai gã giang hồ năm xưa đã bị bắt, và chúng khai ra tên bạn.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Cú đấm này chỉ sượt vai thôi mà?' }, { role: 'boss', anim: 'facepalm' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Thừa nhận, kể rõ chuyện bị đe dọa',
          text: 'Bạn kể hết: lời đe dọa ở bãi xe, phong bì trong giỏ xe. Cơ quan điều tra ghi nhận tình tiết bị ép buộc, nhưng bạn vẫn phải nộp lại tiền và bị liên đoàn cấm thi đấu năm năm.',
          effects: { money: -300000000, karma: 6, happy: -14, looks: -4, job: 'fire', unflag: 'job_vdv_vo_epthua' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Khăng khăng nói mình bị đánh trúng thật',
          outcomes: [
            { p: 0.25, text: 'Không ai chứng minh được bạn cố tình. Hồ sơ khép lại, nhưng phòng tập không còn ai muốn làm đối tác với bạn. Hợp đồng thi đấu lặng lẽ không được gia hạn.',
              effects: { karma: -6, happy: -10, job: 'fire', unflag: 'job_vdv_vo_epthua' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { police: 'shake' } } },
            { p: 0.75, text: 'Sao kê tài khoản đặt lên bàn: {money:300000000} chuyển vào đúng đêm trước trận. Bạn bị khởi tố, phạt nặng và cấm thi đấu vĩnh viễn.',
              effects: { karma: -10, happy: -20, looks: -8, money: -450000000, job: 'fire', unflag: 'job_vdv_vo_epthua' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { police: 'point', boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_vdv_vo_tranhdai', title: 'Trận tranh đai vô địch', icon: '🏆', age: [19, 36], weight: 1.4,
      req: { jobId: ['vdv_vo'] },
      text: 'Sau chuỗi chín trận toàn thắng, bạn có trận tranh đai vô địch quốc gia với nhà đương kim vô địch ba năm liền. Buổi họp báo cân ký, đối thủ ghé sát tai bạn: “Đêm đó tao cho mày ngủ sớm.” Vé bán hết sạch trong hai tiếng.',
      scene: { loc: 'ring', time: 'night', weather: 'clear', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'stranger', gender: 'm', age: 30, anim: 'point', say: 'Đêm đó tao cho mày ngủ sớm.' }, { role: 'coworker', anim: 'clap', say: 'Bình tĩnh, theo đúng giáo án!' }, { role: 'crowd', anim: 'cheer' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Lao vào áp đảo ngay từ hiệp một',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Ba mươi giây cuối hiệp một, cú đấm thẳng của bạn làm nhà vô địch đổ gục. Trọng tài vung tay. Bạn ngửa mặt lên trần nhà thi đấu, chiếc đai vàng được quàng ngang hông.',
              effects: { happy: 18, looks: 8, money: 300000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { stranger: 'fall', crowd: 'jump', coworker: 'hug' } } },
            { text: 'Bạn lao lên quá hăng và dính một cú phản đòn đúng cằm. Lúc tỉnh dậy, bạn đang nằm trên băng ca, tai vẫn ù tiếng hò reo dành cho người khác.',
              effects: { happy: -12, health: -10, looks: -2 },
              scene: { anim: 'fall', fx: 'stars', npcAnim: { stranger: 'cheer', coworker: 'facepalm' } } }
          ] },
        { label: 'Đánh chậm, chờ đối thủ hụt hơi',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Năm hiệp, bạn né, lùi, phản đòn đúng nhịp. Đối thủ đuối dần trong khi bạn vẫn còn sung. Ba trọng tài cùng chấm bạn thắng. Nhà vô địch mới đã lên ngôi.',
              effects: { happy: 15, looks: 6, smarts: 3, money: 250000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { crowd: 'clap', coworker: 'jump' } } },
            { text: 'Bạn chờ mãi mà đối thủ không hụt hơi chút nào. Thua điểm sát nút, bạn ôm găng ngồi trong phòng thay đồ, nghe tiếng ăn mừng vọng qua vách.',
              effects: { happy: -8, health: -4, smarts: 2 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'cheer' } } }
          ] },
        { label: 'Đáp trả trash-talk trên TikTok cho nóng trận',
          outcomes: [
            { p: 0.5, text: 'Clip bạn đáp trả đạt năm triệu lượt xem, nhà tài trợ đổ xô tới. Dù thua điểm, bạn có hợp đồng quảng cáo béo bở và hàng vạn người theo dõi.',
              effects: { happy: 6, looks: 6, money: 400000000 },
              scene: { anim: 'phone', fx: 'money', npcAnim: { crowd: 'laugh' } } },
            { p: 0.5, text: 'Bạn nói quá đà, liên đoàn phạt vì phát ngôn thiếu văn hóa. Bị cư dân mạng ném đá, bạn mất bình tĩnh và thua knock-out hiệp hai.',
              effects: { happy: -10, karma: -4, looks: -4, health: -6, money: -30000000 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_vdv_vo_nuocngoai', title: 'Đấu ở nước ngoài', icon: '🌏', age: [19, 35], weight: 1.3,
      req: { jobId: ['vdv_vo'] },
      text: 'Một giải đấu võ tổng hợp lớn ở Bangkok gửi lời mời: đấu chính ở sự kiện truyền hình trực tiếp khắp châu Á, đối thủ là một võ sĩ Thái hạng top 10. Cát-xê {money:400000000}, nhưng sàn đấu bên đó chưa bao giờ dễ dàng với khách.',
      scene: { loc: 'ring', time: 'night', weather: 'clear', anim: 'lift', expr: 'neutral',
        npcs: [{ role: 'boss', anim: 'phone', say: 'Truyền hình khắp châu Á đấy!' }, { role: 'coworker', anim: 'think' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Nhận lời, mang cờ đỏ sao vàng lên sàn',
          success: { stat: 'health', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Trong nhà thi đấu toàn tiếng hò hét cho chủ nhà, bạn hạ đối thủ bằng cú đá xoay ở hiệp ba rồi khoác lá cờ Tổ quốc đi một vòng sàn. Clip lan khắp mạng xã hội trong nước.',
              effects: { happy: 15, looks: 8, money: 400000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { boss: 'jump', coworker: 'hug' } } },
            { text: 'Đối thủ người Thái quá lì đòn, những cú gối của anh ta làm bạn gục ở hiệp hai. Bạn vẫn nhận cát-xê, nhưng chuyến bay về nước dài như cả thế kỷ.',
              effects: { happy: -8, health: -10, money: 250000000, smarts: 2 },
              scene: { anim: 'sad', fx: 'dust', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Đòi thêm cát-xê rồi mới ký',
          outcomes: [
            { p: 0.5, text: 'Ban tổ chức chịu tăng thêm năm mươi phần trăm vì cần người Việt bán vé truyền hình. Bạn đánh thua điểm nhưng vẫn về nước với tài khoản đầy ắp.',
              effects: { money: 600000000, happy: 4, health: -6, smarts: 2 },
              scene: { anim: 'laugh', fx: 'money', npcAnim: { boss: 'clap' } } },
            { p: 0.5, text: 'Ban tổ chức gạt tên bạn, mời ngay một võ sĩ Philippines thay thế. Bạn ngồi xem trận đấu qua livestream và thấy tiếc.',
              effects: { happy: -6 },
              scene: { anim: 'facepalm', fx: 'question', npcAnim: { boss: 'facepalm' } } }
          ] },
        { label: 'Từ chối, tập trung giải trong nước',
          text: 'Bạn biết mình chưa sẵn sàng. Bạn ở lại, tập thêm kỹ thuật vật và giành thêm hai trận thắng ở giải quốc nội. Chậm mà chắc.',
          effects: { happy: 2, health: 3, smarts: 2 },
          scene: { anim: 'lift', fx: 'sweat', npcAnim: { coworker: 'nod' } } }
      ]
    },
    {
      id: 's_job_vdv_vo_cuoicung', title: 'Trận võ cuối cùng', icon: '🥋', age: [33, 42], weight: 1.6,
      req: { jobId: ['vdv_vo'] },
      text: 'Mỗi lần lên sàn, bạn mất lâu hơn để hồi phục; mỗi sáng thức dậy, vết thương cũ lại nhắc tên. Liên đoàn mời bạn một trận “chia tay” trước khán giả quê nhà ở {city}, còn đàn em ở phòng tập thì cứ hỏi: “Bao giờ thầy dạy bọn em?”',
      scene: { loc: 'ring', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'coworker', anim: 'talk', say: 'Bao giờ thầy dạy bọn em?' }, { role: 'kid', anim: 'jump' }, { role: 'boss', anim: 'nod' }], fx: 'petals', shot: 'wide' },
      choices: [
        { label: 'Đánh trận chia tay rồi chuyển sang làm HLV',
          text: 'Trận cuối, bạn thắng điểm trong tiếng hô vang tên mình. Bạn tháo găng, cúi chào bốn phía khán đài rồi treo găng lên tường phòng tập. Từ tuần sau, bạn cầm đích đỡ đòn cho lứa võ sĩ mới.',
          effects: { happy: 12, looks: 4, karma: 3, job: 'fire', flag: 'ex_athlete' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { coworker: 'clap', kid: 'cheer' } } },
        { label: 'Chưa, còn một trận tranh đai nữa',
          outcomes: [
            { p: 0.4, text: 'Bạn khiến tất cả bất ngờ khi vẫn trụ vững năm hiệp và thắng. Báo chí gọi bạn là “lão tướng không chịu già”.',
              effects: { happy: 10, looks: 4, health: -6, money: 150000000 },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { kid: 'jump' } } },
            { p: 0.6, text: 'Thân thể không còn theo kịp ý chí. Bạn thua knock-out, cơ bắp rách trong cú đỡ đòn cuối cùng.',
              effects: { happy: -10, health: -12, illness: 'Chấn thương cơ' },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Giải nghệ, mở phòng tập võ riêng',
          text: 'Bạn dồn toàn bộ tiền thưởng các năm để mở một phòng tập võ nhỏ. Tấm ảnh bạn ôm đai vô địch treo ngay cửa, và học viên kéo đến đông hơn bạn tưởng.',
          effects: { happy: 8, money: -200000000, smarts: 2, flag: 'ex_athlete', job: { hire: 'kinhdoanh' } },
          scene: { anim: 'wave', fx: 'confetti', npcAnim: { kid: 'cheer' } } }
      ]
    },
    // ======================= VẬN ĐỘNG VIÊN CẦU LÔNG =======================
    {
      id: 's_job_caulong_vai', title: 'Chấn thương vai', icon: '🏸', age: [16, 34], weight: 1.5,
      req: { jobId: ['caulong'], notFlag: 'job_caulong_vai' },
      text: 'Mấy tháng nay, mỗi cú đập cầu là vai phải lại nhói lên như bị kim châm. Hôm nay, ở game quyết định của giải vô địch quốc gia, bạn bật nhảy đập cầu và nghe vai “tách” một tiếng. Cây vợt rơi xuống sàn.',
      scene: { loc: 'court', time: 'day', weather: 'clear', anim: 'sick', expr: 'sick',
        npcs: [{ role: 'coworker', anim: 'run', say: 'Có sao không? Đừng cố!' }, { role: 'doctor', anim: 'run' }, { role: 'crowd', anim: 'idle' }], fx: 'flash', shot: 'close' },
      choices: [
        { label: 'Bỏ cuộc, đi chụp chiếu ngay',
          text: 'Bạn rút lui giữa trận, ôm vai rời sân. Bác sĩ kết luận: rách cơ chóp xoay vai, phải nghỉ thi đấu ít nhất nửa năm và tập phục hồi nghiêm ngặt.',
          effects: { health: -10, happy: -8, illness: 'Chấn thương cơ', flag: 'job_caulong_vai', followUp: { id: 's_job_caulong_phuchoi', delay: 1 } },
          scene: { anim: 'sad', loc: 'hospital', fx: 'tears', npcAnim: { doctor: 'talk' } } },
        { label: 'Đổi tay cầm vợt, đánh nốt bằng mọi giá',
          outcomes: [
            { p: 0.25, text: 'Bạn đánh bằng lối cài cầu, bỏ nhỏ, không đập một quả nào, và bằng cách nào đó thắng 21–19. Khán đài đứng dậy vỗ tay. Rồi bạn được dìu thẳng vào phòng y tế.',
              effects: { health: -12, happy: 8, looks: 5, illness: 'Chấn thương cơ', flag: 'job_caulong_vai', followUp: { id: 's_job_caulong_phuchoi', delay: 1 } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { crowd: 'clap' } } },
            { p: 0.75, text: 'Hai điểm sau, vai bạn không nâng lên nổi nữa. Thua trắng, và chấn thương nặng hơn gấp đôi vì cố gắng vô ích.',
              effects: { health: -16, happy: -12, illness: 'Chấn thương cơ', flag: 'job_caulong_vai', followUp: { id: 's_job_caulong_phuchoi', delay: 1 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_job_caulong_phuchoi', title: 'Cánh tay không nâng nổi vợt', icon: '🩹', age: [16, 40], chainOnly: true,
      req: { jobId: ['caulong'], flag: 'job_caulong_vai' },
      text: 'Phòng vật lý trị liệu, ngày thứ một trăm. Bạn vẫn chưa nâng nổi tay quá đầu. Giải vô địch châu Á sắp tới, huấn luyện viên trưởng nhắn hỏi có kịp không, còn bác sĩ thì dặn: “Rách lần nữa là phải mổ, có thể không đánh lại được.”',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'lift', expr: 'sad',
        npcs: [{ role: 'doctor', anim: 'shake', say: 'Rách lần nữa là phải mổ đấy.' }, { role: 'boss', anim: 'phone', say: 'Kịp giải châu Á không em?' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Bỏ giải châu Á, tập phục hồi cho đủ',
          text: 'Bạn nén tiếc nuối, ngồi nhà xem đồng đội thi đấu qua TV. Nửa năm sau, cú đập cầu đầu tiên của bạn lại vang “bốp” giòn tan. Vai lành hẳn.',
          effects: { cure: true, health: 8, happy: 4, smarts: 2, unflag: 'job_caulong_vai' },
          scene: { anim: 'jump', loc: 'court', fx: 'sparkle', npcAnim: { doctor: 'clap' } } },
        { label: 'Tiêm phong bế, ra sân giải châu Á',
          success: { stat: 'health', base: 0.2, scale: 0.4 },
          outcomes: [
            { text: 'Thuốc giữ được cơn đau đủ lâu để bạn vào tứ kết. Liên đoàn khen ngợi tinh thần, nhưng bác sĩ nhìn phim chụp sau giải và thở dài: lần này bạn may đấy.',
              effects: { cure: true, happy: 8, looks: 3, health: -5, unflag: 'job_caulong_vai' },
              scene: { anim: 'cheer', loc: 'court', fx: 'stars', npcAnim: { boss: 'clap' } } },
            { text: 'Ván đầu tiên, vai bạn rách hoàn toàn. Ca mổ thành công nhưng cánh tay không bao giờ đủ lực đập cầu ở đẳng cấp đỉnh cao nữa. Bạn chính thức chia tay đội tuyển.',
              effects: { health: -12, happy: -18, job: 'fire', flag: 'ex_athlete', unflag: 'job_caulong_vai' },
              scene: { anim: 'cry', loc: 'hospital', fx: 'heartbreak', npcAnim: { doctor: 'shake' } } }
          ] },
        { label: 'Chuyển sang đánh đôi để đỡ phải đập cầu',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn học lại từ đầu: chạy vị trí, bắt lưới, phối hợp. Một năm sau, cặp đôi của bạn vào top 3 quốc gia. Vai không còn phải gánh cả trận một mình.',
              effects: { cure: true, happy: 8, smarts: 4, unflag: 'job_caulong_vai' },
              scene: { anim: 'cheer', loc: 'court', fx: 'levelup', npcAnim: { boss: 'nod' } } },
            { text: 'Đánh đôi khó hơn bạn tưởng: bạn và đồng đội cứ va vào nhau, cãi nhau trên sân. Vai thì lành, nhưng thứ hạng tụt dốc thê thảm.',
              effects: { cure: true, happy: -6, unflag: 'job_caulong_vai' },
              scene: { anim: 'facepalm', loc: 'court', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 's_job_caulong_biloai', title: 'Bị loại khỏi đội tuyển', icon: '📋', age: [16, 34], weight: 1.4,
      req: { jobId: ['caulong'] },
      text: 'Danh sách đội tuyển mới dán trên bảng tin nhà thi đấu, và tên bạn không có trong đó. Chỗ của bạn thuộc về một tay vợt trẻ hơn, có thành tích kém hơn, nhưng nghe đồn là cháu của một vị trong liên đoàn. Huấn luyện viên tránh ánh mắt bạn.',
      scene: { loc: 'court', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'shrug', say: 'Quyết định của Ban huấn luyện.' }, { role: 'coworker', anim: 'sad' }], fx: 'heartbreak', shot: 'close' },
      choices: [
        { label: 'Tập gấp đôi, dùng thành tích để trả lời',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn tập sáng tập tối, tự bỏ tiền đi đánh giải mở rộng. Ba chức vô địch liên tiếp khiến Ban huấn luyện không thể làm ngơ. Bạn được triệu tập trở lại, lần này ở vị trí số một.',
              effects: { happy: 14, health: 4, looks: 4, job: 'promote' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { boss: 'clap' } } },
            { text: 'Bạn cố hết sức nhưng phong độ vẫn chập chờn. Một năm trôi qua, tên bạn vẫn vắng bóng trong danh sách, và thu nhập chỉ còn trông vào tiền giải.',
              effects: { happy: -8, health: -3, money: -20000000 },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Gửi đơn khiếu nại lên liên đoàn',
          outcomes: [
            { p: 0.4, text: 'Báo chí vào cuộc, so sánh thành tích hai tay vợt. Liên đoàn buộc phải tổ chức đánh tuyển chọn công khai, và bạn thắng áp đảo. Bạn trở lại đội tuyển.',
              effects: { happy: 10, karma: 4, smarts: 2 },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'facepalm' } } },
            { p: 0.6, text: 'Đơn khiếu nại bị “ghi nhận”. Từ đó, bạn bị gắn mác “khó bảo”, các giải đấu quan trọng đều không có suất cho bạn.',
              effects: { happy: -10, karma: 2 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { boss: 'point' } } }
          ] },
        { label: 'Xin chuyển về thi đấu cho tỉnh khác',
          text: 'Một tỉnh miền Trung sẵn sàng chiêu mộ bạn với chế độ tốt và hứa suất đánh chính. Bạn xách vali ra đi, mang theo chút tự ái và nhiều quyết tâm.',
          effects: { happy: 4, money: 100000000, job: 'raise' },
          scene: { anim: 'walk', loc: 'street', fx: 'idea' } },
        { label: 'Chán rồi, bỏ cầu lông đi làm sales',
          text: 'Bạn gác vợt, đi xin việc ở một công ty phân phối đồ thể thao. Đồng nghiệp mới chẳng ai biết bạn từng đánh giải quốc gia.',
          effects: { happy: -4, smarts: 2, job: { hire: 'banhang' } },
          scene: { anim: 'shrug', loc: 'office', fx: 'question' } }
      ]
    },
    {
      id: 's_job_caulong_seagames', title: 'Huy chương SEA Games', icon: '🥇', age: [17, 33], weight: 1.4,
      req: { jobId: ['caulong'] },
      text: 'Chung kết đơn SEA Games, đối thủ là tay vợt chủ nhà Indonesia, khán đài mười nghìn người đánh trống rầm rập. Hòa một ván đều. Ván ba, bạn đang bị dẫn 15–18 và bàn tay ướt đẫm mồ hôi.',
      scene: { loc: 'court', time: 'night', weather: 'clear', anim: 'jump', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'm', age: 25, anim: 'jump' }, { role: 'boss', anim: 'clap', say: 'Bình tĩnh! Đánh vào trái tay nó!' }, { role: 'crowd', anim: 'cheer' }], fx: 'sweat', shot: 'orbit' },
      choices: [
        { label: 'Liều đập cầu mạnh nhất có thể',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Năm cú đập liên tiếp như búa bổ, bạn lội ngược dòng thắng 22–20. Bạn nằm vật ra sân, khóc nức nở. Huy chương vàng, tiền thưởng nóng {money:350000000} và cả quê nhà đốt pháo hoa.',
              effects: { happy: 18, looks: 8, money: 350000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { boss: 'jump', stranger: 'sad' } } },
            { text: 'Hai cú đập đi ra ngoài. Bạn thua 17–21, nhận huy chương bạc với đôi mắt đỏ hoe. Vẫn là tấm huy chương, vẫn được thưởng, nhưng bạn biết vàng đã ở rất gần.',
              effects: { happy: -2, looks: 3, money: 120000000 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { stranger: 'cheer' } } }
          ] },
        { label: 'Đánh theo chiến thuật thầy dặn',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn kiên nhẫn đưa cầu vào trái tay đối thủ, từng điểm, từng điểm một. 21–19! Lá cờ đỏ sao vàng kéo lên giữa nhà thi đấu, bạn hát quốc ca mà nước mắt chảy dài.',
              effects: { happy: 16, looks: 6, smarts: 3, money: 350000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { boss: 'hug', crowd: 'clap' } } },
            { text: 'Đối thủ đọc được ý đồ và chặn đứng mọi đường cầu. Huy chương bạc. Thầy vỗ vai bạn: “Lần sau mình làm lại.”',
              effects: { happy: -2, smarts: 2, money: 120000000 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { boss: 'nod' } } }
          ] }
      ]
    },
    {
      id: 's_job_caulong_olympic', title: 'Tấm vé dự Olympic', icon: '🎟️', age: [18, 33], weight: 1.3,
      req: { jobId: ['caulong'] },
      text: 'Còn đúng một giải vòng loại cuối cùng để giành điểm Olympic. Nếu vào bán kết, bạn sẽ là tay vợt Việt Nam duy nhất góp mặt ở Thế vận hội năm nay. Đêm trước trận, bạn trằn trọc nhìn trần nhà khách sạn.',
      scene: { loc: 'court', time: 'day', weather: 'clear', anim: 'think', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Một trận nữa thôi. Một trận!' }, { role: 'stranger', gender: 'm', age: 26, anim: 'lift' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Dồn hết sức cho trận quyết định',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn thắng sau ba ván nghẹt thở. Liên đoàn xác nhận: bạn chính thức có vé dự Olympic. Ngày bước vào lễ khai mạc, bạn tự chụp một tấm ảnh với lá cờ Tổ quốc, gửi về cho cả nhà.',
              effects: { happy: 18, looks: 8, job: 'promote', money: 100000000 },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { boss: 'jump' } } },
            { text: 'Thua sát nút ở tứ kết, bạn lỡ tấm vé Olympic chỉ vì hai điểm. Bạn ngồi bất động trên ghế rất lâu sau khi đèn sân tắt.',
              effects: { happy: -12, health: -2 },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'sad' } } }
          ] },
        { label: 'Thuê chuyên gia tâm lý thể thao trước giải',
          text: 'Bạn bỏ tiền túi thuê một chuyên gia tâm lý. Bạn học cách thở, cách quên điểm vừa mất. Bạn vào bán kết một cách bình thản, giành vé Olympic trong sự ngỡ ngàng của chính mình.',
          effects: { money: -40000000, happy: 15, smarts: 4, looks: 5, job: 'promote' },
          scene: { anim: 'nod', fx: 'levelup', npcAnim: { boss: 'clap' } } },
        { label: 'Nhường suất cho đồng đội đang phong độ cao',
          text: 'Bạn biết vai mình chưa ổn. Bạn đề xuất liên đoàn dồn suất cho đồng đội đang lên. Người ấy giành vé và ôm chầm lấy bạn. Cả giới cầu lông nhắc mãi chuyện này.',
          effects: { karma: 12, happy: 2, looks: 2 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'cry' } } }
      ]
    },
    {
      id: 's_job_caulong_cuoicung', title: 'Giải đấu cuối cùng', icon: '🏸', age: [31, 40], weight: 1.6,
      req: { jobId: ['caulong'] },
      text: 'Lứa tay vợt mười tám tuổi đánh nhanh như máy, bạn bắt đầu thua những trận ngày xưa thắng dễ. Giải vô địch quốc gia năm nay có thể là giải cuối cùng. Thầy cũ gợi ý: “Về làm trợ lý cho thầy, dạy bọn trẻ đi.”',
      scene: { loc: 'court', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Về dạy bọn trẻ với thầy đi.' }, { role: 'kid', anim: 'jump' }, { role: 'crowd', anim: 'clap' }], fx: 'petals', shot: 'wide' },
      choices: [
        { label: 'Đánh trận cuối rồi về làm huấn luyện viên',
          text: 'Bạn đánh trận chia tay trong tiếng vỗ tay của cả nhà thi đấu, rồi đặt cây vợt lên giữa sân, cúi chào. Tuần sau, bạn đứng bên lưới với cái còi, hướng dẫn lứa năng khiếu đầu tiên của mình.',
          effects: { happy: 10, karma: 3, looks: 2, job: 'fire', flag: 'ex_athlete' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { crowd: 'clap', kid: 'cheer' } } },
        { label: 'Cố thêm một mùa giải',
          outcomes: [
            { p: 0.4, text: 'Kinh nghiệm bù cho tốc độ: bạn vào chung kết quốc gia, thua sát nút người kém mình mười tuổi. Ai cũng nể.',
              effects: { happy: 6, looks: 3, health: -4 },
              scene: { anim: 'cheer', fx: 'stars' } },
            { p: 0.6, text: 'Bắp chân bạn chuột rút rồi rách cơ ngay vòng một. Bạn ngồi trên băng ghế y tế, hiểu rằng cơ thể đã lên tiếng.',
              effects: { happy: -8, health: -10, illness: 'Chấn thương cơ' },
              scene: { anim: 'sick', fx: 'sick' } }
          ] },
        { label: 'Bán xe, mở câu lạc bộ cầu lông', req: { asset: 'car' },
          text: 'Bạn bán ô tô, thuê lại một nhà thi đấu cũ, lắp thảm và đèn mới. Câu lạc bộ mang tên bạn kín lịch từ sáng đến tối, cả trẻ con lẫn dân văn phòng đều đến tập.',
          effects: { asset: { lose: 'car' }, happy: 10, karma: 4, flag: 'ex_athlete', job: { hire: 'kinhdoanh' } },
          scene: { anim: 'wave', fx: 'confetti', npcAnim: { kid: 'cheer' } } }
      ]
    },
    // ======================= TUYỂN THỦ ESPORTS =======================
    {
      id: 's_job_esports_danxep', title: 'Bị dụ dàn xếp trận đấu', icon: '🕹️', age: [16, 30], weight: 1.5,
      req: { jobId: ['esports'], notFlag: 'job_esports_danxep_hoi' },
      text: 'Nửa đêm, một tài khoản Telegram ẩn danh nhắn cho bạn: “Trận tối mai, ván hai cho thua. Chết vài pha, mất rồng là được. {money:250000000}, chuyển trước một nửa.” Kèm theo là ảnh chụp sao kê, như để chứng minh họ chơi thật.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'coworker', anim: 'sleep' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Đồng ý, ván hai “phong độ kém”',
          text: 'Ván hai, bạn cầm tướng sở trường mà chết liền bốn mạng, đội mất rồng rồi mất luôn nhà chính. Bình luận viên gọi đó là “ngày thi đấu đáng quên”. Ví điện tử của bạn thì nhớ rất rõ.',
          effects: { money: 250000000, karma: -16, happy: -4, flag: ['job_esports_danxep_hoi', 'job_esports_danxep'], followUp: { id: 's_job_esports_dieutra', delay: 1 } },
          scene: { anim: 'type', fx: 'money', npcAnim: { coworker: 'facepalm' } } },
        { label: 'Chụp màn hình gửi Ban tổ chức',
          text: 'Bạn gửi toàn bộ tin nhắn cho quản lý đội và Ban tổ chức giải. Họ phối hợp với cơ quan chức năng, khóa tài khoản và mở điều tra. Cộng đồng game thủ dành cho bạn một tràng “GG” khen ngợi.',
          effects: { karma: 14, happy: 6, looks: 4, job: 'raise', flag: 'job_esports_danxep_hoi' },
          scene: { anim: 'phone', fx: 'sparkle' } },
        { label: 'Giả vờ đồng ý để gom bằng chứng',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn câu giờ, khai thác được số tài khoản và tên người đứng sau. Công an bắt cả nhóm. Đội tổ chức họp báo vinh danh bạn, nhà tài trợ còn tặng thêm hợp đồng quảng cáo.',
              effects: { karma: 14, smarts: 3, looks: 5, money: 100000000, job: 'promote', flag: 'job_esports_danxep_hoi' },
              scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Kẻ kia đánh hơi được, tung ảnh chụp tin nhắn bị cắt ghép lên mạng, vu bạn chủ động gạ bán độ. Bạn mất cả tháng giải trình, bị treo thi đấu hai tuần.',
              effects: { karma: 6, happy: -12, looks: -4, flag: 'job_esports_danxep_hoi' },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 's_job_esports_dieutra', title: 'Án cấm thi đấu', icon: '🚫', age: [16, 35], chainOnly: true,
      req: { jobId: ['esports'], flag: 'job_esports_danxep' },
      text: 'Ban tổ chức phân tích dữ liệu trận đấu: bốn mạng chết của bạn ở ván hai trùng khít với các cửa cược bất thường trên một nhà cái nước ngoài. Sáng nay, bạn được mời lên làm việc với Ban tổ chức và công an kinh tế.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Bốn mạng chết này giải thích sao?' }, { role: 'boss', anim: 'facepalm' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Thừa nhận, xin lỗi cộng đồng',
          text: 'Bạn đăng bài xin lỗi, nộp lại tiền. Ban tổ chức cấm bạn thi đấu chuyên nghiệp ba năm, đội chấm dứt hợp đồng. Livestream của bạn ngập bình luận “bán độ”.',
          effects: { money: -250000000, karma: 6, happy: -16, looks: -6, job: 'fire', unflag: 'job_esports_danxep' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { boss: 'shake' } } },
        { label: 'Đổ lỗi cho mạng lag',
          outcomes: [
            { p: 0.25, text: 'Không đủ chứng cứ kết luận. Nhưng đội vẫn lặng lẽ thanh lý hợp đồng, và không đội nào muốn ký với một cái tên “có vấn đề”.',
              effects: { karma: -6, happy: -10, job: 'fire', unflag: 'job_esports_danxep' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { police: 'shake' } } },
            { p: 0.75, text: 'Lịch sử chat Telegram được khôi phục, sao kê ngân hàng rõ từng đồng. Bạn bị cấm thi đấu vĩnh viễn, nộp phạt và bị khởi tố vì tổ chức đánh bạc.',
              effects: { karma: -10, happy: -20, looks: -8, money: -400000000, job: 'fire', unflag: 'job_esports_danxep' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_esports_tanra', title: 'Đội tan rã', icon: '💔', age: [17, 30], weight: 1.4,
      req: { jobId: ['esports'] },
      text: 'Nhà tài trợ chính rút vốn sau mùa giải tệ hại, chủ đội thông báo giải thể trong một cuộc gọi Discord dài đúng bốn phút. Gaming house trả lại vào cuối tháng, lương hai tháng chưa thanh toán. Cả đội ngồi im trước những chiếc màn hình đã tắt.',
      scene: { loc: 'office', time: 'night', weather: 'rain', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'phone', say: 'Anh xin lỗi các em, hết tiền rồi.' }, { role: 'coworker', anim: 'cry' }, { role: 'stranger', age: 19, anim: 'sad' }], fx: 'heartbreak', shot: 'wide' },
      choices: [
        { label: 'Gửi clip highlight tìm đội mới',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Clip highlight của bạn lan nhanh trong cộng đồng. Một đội top đầu gọi thử việc và ký hợp đồng chính thức chỉ sau một tuần, lương cao hơn đội cũ.',
              effects: { happy: 12, money: 80000000, job: 'raise' },
              scene: { anim: 'cheer', fx: 'levelup' } },
            { text: 'Chẳng đội nào cần thêm người giữa mùa. Bạn về quê ở tạm, cày rank một mình chờ kỳ chuyển nhượng sau.',
              effects: { happy: -10, money: -20000000 },
              scene: { anim: 'sad', loc: 'bedroom', fx: 'zzz' } }
          ] },
        { label: 'Bán ô tô, giữ đội lại tự vận hành', req: { asset: 'car' },
          outcomes: [
            { p: 0.55, text: 'Bạn bán xe trả lương cho anh em, tự đứng ra làm đội trưởng kiêm quản lý. Đội lội ngược dòng vào playoffs, một nhà tài trợ mới để mắt và ký hợp đồng. Anh em gọi bạn là “ông chủ”.',
              effects: { asset: { lose: 'car' }, happy: 14, karma: 10, looks: 4, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'hug' } } },
            { p: 0.45, text: 'Tiền bán xe chỉ đủ cầm cự ba tháng. Đội vẫn tan, nhưng anh em không ai quên bạn đã cố gắng đến cùng.',
              effects: { asset: { lose: 'car' }, happy: -6, karma: 10 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'hug' } } }
          ] },
        { label: 'Chuyển hẳn sang làm streamer',
          text: 'Bạn mua webcam, dựng phòng stream ở nhà. Fan cũ kéo sang ủng hộ, buổi live đầu tiên được hơn hai nghìn người xem. Thi đấu thì thôi, nhưng game thì vẫn là nghề.',
          effects: { happy: 4, looks: 2, flag: 'ex_athlete', job: { hire: 'streamer' } },
          scene: { anim: 'wave', loc: 'bedroom', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_job_esports_ckthegioi', title: 'Chung kết thế giới', icon: '🌍', age: [17, 30], weight: 1.3,
      req: { jobId: ['esports'] },
      text: 'Lần đầu tiên một đội Việt Nam vào đến chung kết thế giới. Nhà thi đấu ở Seoul chật kín hai vạn người, đèn sân khấu chiếu thẳng vào mặt, và ở nhà, hàng triệu người đang xem livestream. Ván năm, tỷ số 2–2.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'scared',
        npcs: [{ role: 'coworker', anim: 'type', say: 'Gọi rồng! Gọi rồng!' }, { role: 'boss', anim: 'pray' }, { role: 'crowd', anim: 'cheer' }], fx: 'flash', shot: 'orbit' },
      choices: [
        { label: 'Gọi team giao tranh tổng',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Pha giao tranh tổng của bạn quét sạch đối thủ. Nhà chính đối phương nổ tung, cả nhà thi đấu gào thét. Vô địch thế giới! Tiền thưởng {money:2000000000} và tên bạn lên top tìm kiếm cả nước.',
              effects: { happy: 20, looks: 10, money: 2000000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { coworker: 'jump', boss: 'cry', crowd: 'jump' } } },
            { text: 'Bạn gọi giao tranh sớm một nhịp, đội đối thủ đã đứng chờ sẵn. Thua. Bạn vẫn cầm cúp á quân, nhưng đêm đó cả đội không ai ngủ được.',
              effects: { happy: -6, looks: 4, money: 600000000, smarts: 2 },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Chơi chậm, chờ đối thủ mắc lỗi',
          success: { stat: 'smarts', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn kiên nhẫn farm, giữ tầm nhìn, chờ đúng khoảnh khắc đối thủ tách lẻ. Một pha bắt lẻ, một con rồng, rồi chiến thắng. Cả Việt Nam thức trắng ăn mừng.',
              effects: { happy: 18, looks: 8, smarts: 3, money: 2000000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { crowd: 'cheer' } } },
            { text: 'Đối thủ không mắc lỗi nào cả. Họ chơi hoàn hảo, còn bạn chỉ biết nhìn nhà chính mình sụp đổ. Á quân thế giới, vẫn là lịch sử, nhưng là lịch sử buồn.',
              effects: { happy: -5, looks: 4, money: 600000000 },
              scene: { anim: 'sad', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 's_job_esports_kietsuc', title: 'Kiệt sức vì luyện tập', icon: '😵', age: [16, 30], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['esports'] },
      text: 'Lịch tập của đội: mười bốn tiếng mỗi ngày, ăn mì gói trước màn hình, ngủ lúc bốn giờ sáng. Cổ tay bạn tê dại, mắt khô rát, lưng đau như ai đè. Sáng nay đứng dậy khỏi ghế gaming, mắt bạn tối sầm.',
      scene: { loc: 'office', time: 'dawn', weather: 'clear', anim: 'sick', expr: 'sleepy',
        npcs: [{ role: 'coworker', anim: 'type' }, { role: 'boss', anim: 'point', say: 'Còn 30 trận scrim nữa nhé!' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Xin nghỉ một tuần, đi khám và ngủ bù',
          text: 'Bạn ngủ một mạch mười hai tiếng, ra công viên chạy bộ, ăn cơm nhà. Rank tụt mất một bậc, nhưng khi quay lại, phản xạ của bạn nhanh hơn hẳn.',
          effects: { health: 8, happy: 5, smarts: 1 },
          scene: { anim: 'sleep', loc: 'bedroom', fx: 'zzz' } },
        { label: 'Nốc nước tăng lực, cày tiếp',
          outcomes: [
            { p: 0.5, text: 'Bạn cày tiếp, rank lên đỉnh máy chủ. Nhưng tim đập nhanh liên tục và dạ dày quặn thắt mỗi tối.',
              effects: { health: -8, happy: 2, illness: 'Đau dạ dày' },
              scene: { anim: 'drink', fx: 'sweat' } },
            { p: 0.5, text: 'Một buổi sáng, bạn không thể đứng thẳng lưng. Chụp phim: thoát vị đĩa đệm vì ngồi sai tư thế quá lâu. Bác sĩ cấm ngồi máy quá hai tiếng mỗi ngày.',
              effects: { health: -14, happy: -8, illness: 'Thoát vị đĩa đệm' },
              scene: { anim: 'sick', loc: 'hospital', fx: 'sick' } }
          ] },
        { label: 'Đề xuất đội thuê HLV thể lực và tâm lý',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Ban quản lý đồng ý. Cả đội bắt đầu tập gym buổi sáng, ngủ trước 1 giờ. Thành tích lên đều, và bạn được giao vai trò đội trưởng.',
              effects: { health: 6, happy: 6, karma: 3, job: 'promote' },
              scene: { anim: 'lift', loc: 'gym', fx: 'levelup' } },
            { text: 'Chủ đội cười khẩy: “Muốn nghỉ thì về đi, thiếu gì người thay.” Bạn im lặng quay lại ghế, lưng vẫn đau âm ỉ.',
              effects: { happy: -6, health: -3 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_esports_cuoicung', title: 'Mùa giải cuối cùng', icon: '🎧', age: [27, 35], weight: 1.6,
      req: { jobId: ['esports'] },
      text: 'Phản xạ của bạn chậm đi vài phần trăm giây, đủ để thua những đứa mười bảy tuổi trong các pha đối đầu. Ban huấn luyện đội hỏi bạn có muốn lui về làm huấn luyện viên. Mấy công ty livestream cũng gửi lời mời.',
      scene: { loc: 'office', time: 'dusk', weather: 'clear', anim: 'think', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Em lui về làm HLV cho đội nhé?' }, { role: 'coworker', anim: 'type' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Giải nghệ, làm huấn luyện viên cho đội',
          text: 'Trận cuối, bạn chơi tướng tủ và cả nhà thi đấu hô vang tên bạn. Bạn tháo tai nghe, cúi chào. Mùa sau, bạn ngồi ghế huấn luyện viên, cầm bảng chiến thuật thay vì chuột.',
          effects: { happy: 10, smarts: 3, looks: 2, job: 'fire', flag: 'ex_athlete' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { coworker: 'clap' } } },
        { label: 'Chuyển sang làm streamer toàn thời gian',
          text: 'Bạn ký hợp đồng với một nền tảng livestream, mỗi tối phát trực tiếp, vừa chơi vừa phân tích cho fan. Thu nhập còn cao hơn hồi thi đấu.',
          effects: { happy: 8, money: 200000000, flag: 'ex_athlete', job: { hire: 'streamer' } },
          scene: { anim: 'wave', loc: 'bedroom', fx: 'money' } },
        { label: 'Cố thêm một mùa nữa',
          outcomes: [
            { p: 0.35, text: 'Bạn đổi lối chơi, chuyển sang vị trí cần kinh nghiệm hơn tốc độ. Đội vào playoffs, và bạn là người chỉ huy trên bản đồ.',
              effects: { happy: 8, smarts: 3 },
              scene: { anim: 'cheer', fx: 'stars' } },
            { p: 0.65, text: 'Bạn ngồi dự bị gần hết mùa, nhìn đàn em thi đấu qua màn hình. Mệt mỏi, cổ tay đau, và chẳng còn nhiều niềm vui.',
              effects: { happy: -8, health: -4 },
              scene: { anim: 'sit', fx: 'sweat' } }
          ] }
      ]
    },
    // ======================= HUẤN LUYỆN VIÊN THỂ THAO =======================
    {
      id: 's_job_hlv_hoctro_bando', title: 'Học trò bị dụ bán độ', icon: '🕵️', age: [28, 65], weight: 1.5,
      req: { jobId: ['hlv'], notFlag: 'job_hlv_bando_hoi' },
      text: 'Xem lại băng hình trận thua tuần trước, bạn thấy cậu học trò cưng {stranger} mắc hai lỗi ngớ ngẩn đến khó tin. Tối nay, bạn bắt gặp cậu ấy ngồi trong ô tô với một người lạ ở bãi xe, tay cầm phong bì. Thấy bạn, {stranger} tái mặt.',
      scene: { loc: 'street', time: 'night', weather: 'cloudy', anim: 'point', expr: 'angry',
        npcs: [{ role: 'stranger', gender: 'm', age: 21, anim: 'scared', say: 'Thầy… thầy nghe em giải thích…' }, { role: 'thug', anim: 'drive' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Báo ngay cho liên đoàn và công an',
          outcomes: [
            { p: 0.7, text: 'Bạn báo cáo trong đêm. Đường dây bị triệt phá, {stranger} bị treo giò nhưng được giảm nhẹ vì hợp tác. Đội mất trụ cột, nhưng báo chí gọi bạn là “ông thầy thẳng như ruột ngựa”.',
              effects: { karma: 14, happy: -2, looks: 4, job: 'raise', flag: 'job_hlv_bando_hoi' },
              scene: { anim: 'phone', fx: 'sparkle', npcAnim: { stranger: 'cry', thug: 'run' } } },
            { p: 0.3, text: 'Bạn báo cáo, nhưng ban lãnh đạo đội muốn “giữ hình ảnh” và ém nhẹm vụ việc. Bạn bị cô lập trong phòng họp, chỉ còn vài cầu thủ trẻ đứng về phía mình.',
              effects: { karma: 12, happy: -10, flag: 'job_hlv_bando_hoi' },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { stranger: 'sad' } } }
          ] },
        { label: 'Nói chuyện riêng, khuyên cậu ấy ra tự thú',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: '{stranger} khóc như đứa trẻ, kể hết chuyện nợ cờ bạc của gia đình. Sáng hôm sau, bạn đưa cậu ấy đến cơ quan công an tự thú. Cậu bị treo giò một năm, nhưng giữ được tương lai.',
              effects: { karma: 16, happy: 4, flag: 'job_hlv_bando_hoi' },
              scene: { anim: 'hug', fx: 'tears', npcAnim: { stranger: 'cry' } } },
            { text: '{stranger} gật đầu hứa hẹn, rồi biến mất ngay đêm đó. Ít hôm sau, cả đội biết chuyện qua mặt báo, và người ta hỏi: sao thầy biết mà không báo?',
              effects: { karma: 4, happy: -10, looks: -3, flag: 'job_hlv_bando_hoi' },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Im lặng, giữ cậu ấy cho mùa giải',
          text: 'Bạn quay đi như chưa thấy gì. Đội cần {stranger} để đua vô địch, và bạn tự nhủ chuyện này chỉ một lần. Nhưng phong bì thì hiếm khi chỉ có một lần.',
          effects: { karma: -10, happy: -4, flag: ['job_hlv_bando_hoi', 'job_hlv_chegiau'], followUp: { id: 's_job_hlv_bando_lo', delay: 1 } },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { thug: 'laugh' } } },
        { label: 'Đòi chia phần với nhà cái',
          text: 'Bạn gõ cửa kính xe: “Muốn làm gì đội tôi thì phải qua tôi.” Gã nhà cái cười, đưa thêm một phong bì dày gấp đôi. Từ đó, đội bạn thua những trận không ai hiểu nổi.',
          effects: { money: 600000000, karma: -20, happy: -2, flag: ['job_hlv_bando_hoi', 'job_hlv_chegiau'], followUp: { id: 's_job_hlv_bando_lo', delay: 1 } },
          scene: { anim: 'laugh', fx: 'money', npcAnim: { thug: 'laugh', stranger: 'scared' } } }
      ]
    },
    {
      id: 's_job_hlv_bando_lo', title: 'Vụ bán độ bị phanh phui', icon: '🚔', age: [28, 70], chainOnly: true,
      req: { jobId: ['hlv'], flag: 'job_hlv_chegiau' },
      text: 'Cơ quan điều tra triệt phá đường dây cá độ, và {stranger} khai hết, kể cả chuyện thầy đã biết từ đầu. Phóng viên vây kín cổng sân tập, còn hai cán bộ công an đang chờ bạn trong phòng họp ban huấn luyện.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Anh biết chuyện từ đầu phải không?' }, { role: 'stranger', gender: 'm', age: 22, anim: 'sad' }, { role: 'crowd', anim: 'phone' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Nhận trách nhiệm, khai báo thành khẩn',
          text: 'Bạn thừa nhận đã bao che, nộp lại toàn bộ tiền bất chính nếu có. Liên đoàn cấm bạn hành nghề huấn luyện mười năm. Câu lạc bộ chấm dứt hợp đồng ngay trong buổi chiều.',
          effects: { moneyPct: -0.3, karma: 6, happy: -16, looks: -6, job: 'fire', unflag: 'job_hlv_chegiau' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Chối, đổ hết cho cầu thủ',
          outcomes: [
            { p: 0.25, text: 'Không có bằng chứng bạn nhận tiền, bạn thoát tội hình sự. Nhưng cả làng bóng đá đã biết, câu lạc bộ cho bạn nghỉ việc “theo nguyện vọng cá nhân”.',
              effects: { karma: -8, happy: -10, looks: -4, job: 'fire', unflag: 'job_hlv_chegiau' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { stranger: 'angry' } } },
            { p: 0.75, text: 'Tin nhắn, sao kê, cả camera bãi xe hôm ấy đều được đưa ra. Bạn bị khởi tố vì tổ chức đánh bạc, cấm hành nghề suốt đời và mất nửa số tài sản cho án phạt.',
              effects: { karma: -12, happy: -20, looks: -10, moneyPct: -0.5, job: 'fire', unflag: 'job_hlv_chegiau' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { police: 'point', stranger: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_hlv_chuoithua', title: 'Bị sa thải sau chuỗi thua', icon: '📉', age: [28, 70], weight: 1.4,
      req: { jobId: ['hlv'] },
      text: 'Bảy trận liền không thắng, đội rơi xuống nhóm cuối bảng xếp hạng. Cổ động viên giăng băng rôn “HLV từ chức!” trên khán đài, ông bầu thì nhắn Zalo đúng một câu: “Trận tới không thắng, anh tự hiểu.”',
      scene: { loc: 'stadium', time: 'dusk', weather: 'storm', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'angry', say: 'Trận tới không thắng, anh tự hiểu.' }, { role: 'crowd', anim: 'angry' }, { role: 'coworker', anim: 'shrug' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Thay đổi chiến thuật, tung toàn cầu thủ trẻ',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Đội hình trẻ chạy không biết mệt và thắng đội đầu bảng 3–1. Chuỗi trận bất bại kéo dài đến cuối mùa. Ông bầu gọi bạn lên, gia hạn hợp đồng với mức lương mới.',
              effects: { happy: 14, smarts: 3, looks: 4, job: 'raise' },
              scene: { anim: 'cheer', weather: 'clear', fx: 'confetti', npcAnim: { crowd: 'cheer', boss: 'clap' } } },
            { text: 'Canh bạc thất bại: thua 0–4 trên sân nhà. Sáng hôm sau, câu lạc bộ ra thông báo “chia tay theo thỏa thuận”. Bạn dọn đồ khỏi phòng thay đồ trong im lặng.',
              effects: { happy: -14, looks: -3, job: 'fire' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { crowd: 'angry', boss: 'point' } } }
          ] },
        { label: 'Chủ động từ chức trước khi bị đuổi',
          text: 'Bạn họp báo, nhận hết trách nhiệm và cảm ơn học trò. Giới chuyên môn đánh giá cao sự sòng phẳng. Vài tháng sau, một câu lạc bộ hạng dưới mời bạn về làm lại.',
          effects: { happy: -6, karma: 6, looks: 2, job: 'fire' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { coworker: 'clap' } } },
        { label: 'Đổ lỗi cho cầu thủ trên báo chí',
          outcomes: [
            { p: 0.3, text: 'Cầu thủ bị chạm tự ái, lao vào trận như lên đồng và thắng. Bạn tạm giữ được ghế, nhưng phòng thay đồ đã lạnh tanh với bạn.',
              effects: { happy: 2, karma: -5 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { coworker: 'angry' } } },
            { p: 0.7, text: 'Cả đội quay lưng, thua tiếp trận thứ tám. Ông bầu sa thải bạn ngay trong đêm, kèm một dòng trạng thái mỉa mai trên Facebook.',
              effects: { happy: -14, karma: -6, looks: -5, job: 'fire' },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { boss: 'point', crowd: 'laugh' } } }
          ] },
        { label: 'Mời thầy về cúng sân cho “giải hạn”',
          outcomes: [
            { p: 0.35, text: 'Không ai biết do lễ cúng hay do may mắn, đội thắng trận nhờ một bàn phản lưới phút bù giờ. Ông bầu tin sái cổ, còn bạn thì giữ được ghế.',
              effects: { happy: 6, smarts: -2, money: -20000000 },
              scene: { anim: 'pray', fx: 'smoke', npcAnim: { crowd: 'cheer' } } },
            { p: 0.65, text: 'Ảnh mâm cúng giữa sân lan khắp TikTok, đội vẫn thua. Bạn bị sa thải, kèm theo cả nghìn ảnh chế.',
              effects: { happy: -12, looks: -6, money: -20000000, job: 'fire' },
              scene: { anim: 'facepalm', fx: 'smoke', npcAnim: { crowd: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_hlv_vodich', title: 'Đưa đội lên ngôi vô địch', icon: '🏆', age: [28, 70], weight: 1.3,
      req: { jobId: ['hlv'] },
      text: 'Vòng đấu cuối cùng, đội bạn chỉ cần một trận hòa để lên ngôi vô địch lần đầu tiên sau hai mươi năm. Đối thủ là đội đang xếp thứ hai, sân khách, khán đài chật kín. Giờ nghỉ giữa hiệp, tỷ số 0–1, phòng thay đồ im phăng phắc nhìn bạn.',
      scene: { loc: 'stadium', time: 'night', weather: 'clear', anim: 'talk', expr: 'neutral',
        npcs: [{ role: 'coworker', anim: 'sit', expr: 'sad' }, { role: 'stranger', gender: 'm', age: 20, anim: 'sit' }, { role: 'boss', anim: 'pray' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Đánh thức tinh thần bằng một bài nói lửa',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn nói về những người hâm mộ đã chờ hai mươi năm. Hiệp hai, cả đội đá như lên đồng: 2–1! Học trò tung bạn lên trời, ông bầu thưởng nóng cả đội, còn bạn nhận thêm một căn hộ cùng hợp đồng dẫn dắt đội tuyển.',
              effects: { happy: 20, looks: 8, money: 500000000, job: 'promote', asset: { add: { type: 'house', name: 'Căn hộ thưởng vô địch', value: 2600000000 } } },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { coworker: 'jump', stranger: 'cheer', boss: 'cry' } } },
            { text: 'Bài nói hay, nhưng đối thủ còn hay hơn. Thua 0–2, đội về nhì. Bạn bắt tay từng học trò, hứa mùa sau sẽ quay lại.',
              effects: { happy: -8, smarts: 2 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'cry' } } }
          ] },
        { label: 'Tung tiền đạo trẻ vào sân, chơi tất tay',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Phút 88, cậu tiền đạo hai mươi tuổi sút xa, bóng chạm xà rồi bay vào lưới. 1–1, đủ để vô địch! Báo chí gọi bạn là “thầy phù thủy”. Câu lạc bộ thưởng lớn và nâng bạn lên chức HLV trưởng đội tuyển.',
              effects: { happy: 18, looks: 6, smarts: 3, money: 400000000, job: 'promote' },
              scene: { anim: 'jump', fx: 'confetti', npcAnim: { stranger: 'cheer', coworker: 'jump' } } },
            { text: 'Đội dâng cao, bị phản công thêm hai bàn. Mất chức vô địch ngay trên tay. Cả mạng xã hội gọi quyết định của bạn là “tự sát”.',
              effects: { happy: -12, looks: -3 },
              scene: { anim: 'facepalm', fx: 'heartbreak', npcAnim: { boss: 'facepalm' } } }
          ] },
        { label: 'Giữ chắc phòng ngự, chơi phản công',
          outcomes: [
            { p: 0.55, text: 'Đội lùi sâu, chờ cơ hội. Một pha phản công duy nhất, một bàn gỡ. 1–1 đến hết trận. Vô địch theo cách xấu xí nhất, nhưng cúp thì vẫn sáng lấp lánh.',
              effects: { happy: 15, looks: 4, money: 300000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { coworker: 'hug' } } },
            { p: 0.45, text: 'Đội chơi rụt rè suốt hiệp hai và thua 0–1. Cổ động viên chỉ trích lối chơi tiêu cực. Á quân, cùng bao nhiêu câu “giá như”.',
              effects: { happy: -8, looks: -2 },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] }
      ]
    }
  );
})();
