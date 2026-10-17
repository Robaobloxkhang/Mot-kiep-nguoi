/* Một Kiếp Người — ngoại truyện: công sở & nghề nghiệp (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: SẾP MỚI TOXIC =======================
    {
      id: 's_work_toxic_new', title: 'Sếp mới về phòng', icon: '😤', age: [22, 55], weight: 1.3,
      req: { job: true, notFlag: 's_work_toxic' },
      text: 'Phòng bạn có sếp mới: {boss}, nổi tiếng “chiến thần KPI”. Mới hai tuần, nhóm Zalo đã nhận việc lúc 11 giờ đêm kèm câu “trong 30 phút nhé”. Sáng nay giữa cuộc họp, sếp đập bàn vì một lỗi chính tả trong slide của bạn, trước mặt cả phòng.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'm', age: 44, anim: 'angry', say: 'Lỗi chính tả! Học lại lớp Một đi!' }, { role: 'coworker', anim: 'sit', expr: 'scared' }, { role: 'crowd', anim: 'sit' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Cúi đầu xin lỗi, nhẫn nhịn cho qua',
          text: 'Bạn lí nhí xin lỗi, về chỗ sửa slide mà hai tai còn nóng ran. Tối đó, nhóm Zalo lại sáng đèn lúc 23 giờ 47. Bạn tự nhủ: “Ráng thêm chút nữa.”',
          effects: { happy: -6, health: -2, flag: ['s_work_toxic', 's_work_toxic_endure'], followUp: { id: 's_work_toxic_report', delay: 1 } },
          scene: { anim: 'bow', fx: 'sweat', npcAnim: { boss: 'point', coworker: 'sad' } } },
        { label: 'Đứng dậy phản bác ngay giữa họp',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn bình tĩnh chỉ ra: slide đó sếp đã duyệt từ hôm qua, lỗi nằm ở đoạn sếp tự sửa. Cả phòng nín thở, rồi lẻ tẻ vài tiếng vỗ tay. Sếp {boss} đỏ mặt cho tan họp, nhưng ánh mắt thì đã ghim bạn.',
              effects: { happy: 4, karma: 3, flag: ['s_work_toxic', 's_work_toxic_rebel'], followUp: { id: 's_work_toxic_report', delay: 1 } },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { boss: 'facepalm', coworker: 'clap', crowd: 'clap' } } },
            { text: 'Bạn vừa mở miệng, sếp {boss} đã gầm lên: “Cậu dạy tôi làm việc à? Họp xong lên phòng tôi!” Từ hôm đó, bạn thành cái gai trong mắt sếp.',
              effects: { happy: -7, flag: 's_work_toxic', followUp: { id: 's_work_toxic_squeeze', delay: 0 } },
              scene: { anim: 'scared', fx: 'anger', npcAnim: { boss: 'angry', coworker: 'scared' }, npcSay: { boss: 'Cậu dạy tôi làm việc à?' } } }
          ] },
        { label: 'Âm thầm ghi âm, chụp lại mọi tin nhắn',
          text: 'Bạn không cãi, chỉ lặng lẽ bật ghi âm trong túi áo. Từ hôm đó, mỗi tin nhắn nửa đêm, mỗi câu mắng giữa họp đều nằm gọn trong một thư mục tên “Bằng chứng”.',
          effects: { smarts: 3, happy: -2, flag: ['s_work_toxic', 's_work_toxic_proof'], followUp: { id: 's_work_toxic_report', delay: 1 } },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { boss: 'angry' } } },
        { label: 'Cập nhật CV ngay dưới gầm bàn',
          text: 'Sếp còn đang mắng, tay bạn đã lướt điện thoại dưới gầm bàn, cập nhật CV và gửi đi mười lăm chỗ. Đời còn dài, sếp tốt còn nhiều.',
          effects: { happy: 2, smarts: 1, flag: 's_work_toxic', followUp: { id: 's_work_toxic_newjob', delay: 0 } },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { boss: 'angry', coworker: 'laugh' } } }
      ]
    },
    {
      id: 's_work_toxic_report', title: 'Lá đơn gửi lên trên', icon: '📨', age: [22, 65], chainOnly: true,
      req: { job: true },
      text: 'Mấy tháng nay, sếp {boss} vẫn chứng nào tật nấy: giao việc nửa đêm, mắng người giữa họp, ba người trong phòng đã xin nghỉ. Chiều nay, {coworker} kéo bạn ra cầu thang thoát hiểm, thì thầm: “Phải làm gì đó thôi, không thì cả phòng chết chung.”',
      scene: { loc: 'office', time: 'dusk', weather: 'cloudy', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'coworker', anim: 'talk', say: 'Mình gửi đơn lên Ban Giám đốc đi!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Gửi đơn tập thể, cả phòng cùng ký',
          success: { stat: 'karma', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Mười hai chữ ký, một lá đơn, gửi thẳng Ban Giám đốc. Một tháng sau, sếp {boss} bị điều về chi nhánh tỉnh. Giám đốc gọi bạn lên: “Em tạm quyền trưởng nhóm nhé.”',
              effects: { happy: 12, karma: 5, job: 'promote', flag: 's_work_toxic_won', followUp: { id: 's_work_toxic_twist', delay: 2 } },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'hug' } } },
            { text: 'Đến phút chót, nửa phòng rút tên vì sợ. Lá đơn lọt vào tay sếp {boss} trước khi tới Ban Giám đốc, và ông ta biết rõ ai cầm đầu.',
              effects: { happy: -8, followUp: { id: 's_work_toxic_squeeze', delay: 0 } },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { coworker: 'facepalm' } } }
          ] },
        { label: 'Nộp kèm file ghi âm và ảnh chụp tin nhắn', req: { flag: 's_work_toxic_proof' },
          outcomes: [
            { p: 0.8, text: 'Phòng Nhân sự nghe hết 47 file ghi âm, mặt tái dần. Sếp {boss} bị kỷ luật và cho nghỉ việc. Bạn được tăng lương vì “dũng cảm bảo vệ văn hóa công ty”.',
              effects: { happy: 12, karma: 4, smarts: 2, job: 'raise', flag: 's_work_toxic_won', followUp: { id: 's_work_toxic_twist', delay: 2 } },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { coworker: 'clap' } } },
            { p: 0.2, text: 'Nhân sự gật gù “sẽ xem xét”, rồi im bặt. Tuần sau, sếp {boss} đi ngang bàn bạn, cười nhạt: “Nghe nói em thích ghi âm lắm hả?”',
              effects: { happy: -8, followUp: { id: 's_work_toxic_squeeze', delay: 0 } },
              scene: { anim: 'scared', fx: 'sweat', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Đăng bài bóc phốt lên group review công ty',
          outcomes: [
            { p: 0.4, text: 'Bài viết đạt hai nghìn lượt chia sẻ, công ty buộc phải lên tiếng và cho sếp {boss} nghỉ việc. Bạn thắng, nhưng bị coi là “người hay làm to chuyện”, và bắt đầu thấy chỗ này chật chội.',
              effects: { happy: 6, karma: 2, flag: 's_work_toxic_won', followUp: { id: 's_work_toxic_newjob', delay: 1 } },
              scene: { anim: 'phone', fx: 'exclaim', npcAnim: { coworker: 'clap' } } },
            { p: 0.6, text: 'Bộ phận pháp chế gửi thư yêu cầu gỡ bài, “nếu không sẽ xử lý theo quy định”. Bạn gỡ bài mà tay run lẩy bẩy, còn sếp {boss} thì biết tỏng tác giả là ai.',
              effects: { happy: -9, karma: -1, followUp: { id: 's_work_toxic_squeeze', delay: 0 } },
              scene: { anim: 'scared', fx: 'sweat', npcAnim: { coworker: 'facepalm' } } }
          ] },
        { label: 'Thôi, rút lui cho lành',
          text: '{coworker} nhìn bạn thất vọng rồi lặng lẽ quay đi. Bạn nhẫn nhịn thêm nửa năm, cho đến một đêm mất ngủ, bạn mở laptop và bắt đầu viết lại CV.',
          effects: { happy: -6, health: -3, flag: 's_work_toxic_endure', followUp: { id: 's_work_toxic_newjob', delay: 1 } },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'shake' } } }
      ]
    },
    {
      id: 's_work_toxic_squeeze', title: 'Chiếc bàn cạnh nhà vệ sinh', icon: '🚽', age: [22, 65], chainOnly: true,
      req: { job: true },
      text: 'Sếp {boss} bắt đầu “xử” bạn: bàn làm việc bị dời ra sát cửa nhà vệ sinh, tên bạn biến khỏi mọi dự án, KPI thì tăng gấp đôi. Bản đánh giá giữa năm: loại D, kèm dòng nhận xét “thái độ chưa phù hợp”.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'point', say: 'Từ mai bàn của em ở đằng kia nhé.' }, { role: 'coworker', anim: 'type', expr: 'sad' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Nộp đơn nghỉ, nhảy việc cho xong',
          text: 'Bạn đặt lá đơn lên bàn sếp, cúi chào rất lễ phép rồi về chỗ gửi CV. Cảm giác nhẹ nhõm như vừa đặt xuống bao gạo năm mươi ký.',
          effects: { happy: 5, followUp: { id: 's_work_toxic_newjob', delay: 0 } },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { boss: 'shrug', coworker: 'wave' } } },
        { label: 'Khiếu nại lên công đoàn và Phòng Lao động',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn nộp đủ hồ sơ: lịch sử giao việc, bản đánh giá vô lý, cả ảnh chiếc bàn cạnh nhà vệ sinh. Thanh tra vào cuộc, công ty phải xin lỗi và điều chuyển sếp {boss}. Bạn được trả lại chỗ ngồi cũ, cạnh cửa sổ.',
              effects: { happy: 10, karma: 4, smarts: 2, flag: 's_work_toxic_won', followUp: { id: 's_work_toxic_twist', delay: 2 } },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { boss: 'sad', coworker: 'clap' } } },
            { text: 'Hồ sơ bị trả về vì “chưa đủ căn cứ”. Cuối tháng, công ty thông báo không gia hạn hợp đồng: bạn còn đúng ba mươi ngày để tìm chỗ mới.',
              effects: { happy: -8, followUp: { id: 's_work_toxic_newjob', delay: 0 } },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { boss: 'laugh' } } }
          ] },
        { label: 'Gồng tiếp, chờ ông ta tự đi',
          outcomes: [
            { p: 0.35, text: 'Bạn cắn răng chịu thêm một năm. Rồi một sáng, cả phòng nhận email: sếp {boss} chuyển công tác. Căn phòng như vừa được mở toang cửa sổ, ai cũng thở được.',
              effects: { happy: 8, health: -3, flag: 's_work_toxic_won' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { boss: 'walk', coworker: 'dance' } } },
            { p: 0.65, text: 'Bạn mất ngủ triền miên, cứ sáng thứ Hai là đau quặn dạ dày. Bác sĩ lắc đầu: “Bệnh này do áp lực công việc.” Cầm tờ đơn thuốc, bạn biết mình không thể ở đây thêm nữa.',
              effects: { happy: -10, health: -8, illness: 'Đau dạ dày', followUp: { id: 's_work_toxic_newjob', delay: 1 } },
              scene: { anim: 'sick', fx: 'sick', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_work_toxic_newjob', title: 'Câu hỏi khó ở buổi phỏng vấn', icon: '🧳', age: [22, 65], chainOnly: true,
      req: { job: true },
      text: 'Bạn ngồi trước hội đồng phỏng vấn của một công ty khác, sơ mi là phẳng, tim đập thình thịch. Chị trưởng phòng nhân sự lật CV, nhìn thẳng vào bạn: “Vì sao em muốn rời chỗ cũ?”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 38, anim: 'talk', say: 'Vì sao em muốn rời chỗ cũ?' }, { role: 'stranger', gender: 'm', age: 46, anim: 'think' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Kể thật hết về sếp cũ',
          outcomes: [
            { p: 0.45, text: 'Chị trưởng phòng gật gù: “Chị hiểu. Ở đây bọn chị không làm việc kiểu đó.” Một tuần sau, thư mời nhận việc về hộp thư, lương cao hơn chỗ cũ.',
              effects: { happy: 10, job: 'raise', flag: 's_work_toxic_left', followUp: { id: 's_work_toxic_twist', delay: 2 } },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { stranger: 'nod' } } },
            { p: 0.55, text: 'Bạn kể say sưa mười lăm phút. Hội đồng liếc nhau, ghi vào sổ: “Hay nói xấu công ty cũ.” Bạn ra về tay trắng, đành quay lại chiếc bàn quen thuộc.',
              effects: { happy: -6, flag: 's_work_toxic_endure' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'shake' } } }
          ] },
        { label: 'Trả lời khéo: “Em tìm thử thách mới”',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn kể về dự án mình tâm đắc, về điều muốn học thêm, không một lời than phiền. Hội đồng mỉm cười. Thư mời đến kèm mức lương cao hơn 25%.',
              effects: { happy: 10, smarts: 2, job: 'raise', flag: 's_work_toxic_left', followUp: { id: 's_work_toxic_twist', delay: 2 } },
              scene: { anim: 'bow', fx: 'levelup', npcAnim: { stranger: 'clap' } } },
            { text: 'Câu trả lời trơn tru quá, nghe như học thuộc. Bạn chờ mãi không thấy email, đành tiếp tục rải CV, mỗi lần nhận thư “Cảm ơn bạn đã quan tâm” lại thở dài một tiếng.',
              effects: { happy: -5 },
              scene: { anim: 'sad', fx: 'question', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Chọn chỗ nhỏ lương thấp mà sếp tử tế',
          text: 'Lương thấp hơn một chút, văn phòng chật hơn một chút, nhưng sếp mới đón bạn bằng ly cà phê sữa đá và câu “Có gì khó cứ hỏi anh”. Lần đầu sau nhiều tháng, bạn ngủ một mạch đến sáng.',
          effects: { happy: 12, health: 4, money: -10000000, flag: 's_work_toxic_left', followUp: { id: 's_work_toxic_twist', delay: 2 } },
          scene: { loc: 'cafe', anim: 'drink', fx: 'sparkle', npcAnim: { stranger: 'wave' } } }
      ]
    },
    {
      id: 's_work_toxic_twist', title: 'Ứng viên quen mặt', icon: '🔄', age: [22, 70], chainOnly: true,
      req: { job: true },
      text: 'Hai năm sau, bạn được giao phỏng vấn tuyển người cho nhóm. Hồ sơ tiếp theo: {boss.full}. Cánh cửa mở ra, người sếp từng đập bàn mắng bạn giữa họp bước vào, tóc bạc đi nhiều, tay cầm tập hồ sơ hơi run.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'boss', anim: 'bow', expr: 'scared', say: 'Lâu rồi không gặp... Dạo này khỏe chứ?' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Phỏng vấn công bằng như mọi ứng viên',
          text: 'Bạn hỏi đúng chuyên môn, chấm đúng năng lực. {boss} trả lời tốt hơn bạn tưởng. Cuối buổi, ông ta đứng dậy cúi đầu: “Ngày đó anh sai rồi.” Bạn nhận ra mình đã thật sự bước qua chuyện cũ.',
          effects: { karma: 8, happy: 8, smarts: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'bow' }, npcSay: { boss: 'Ngày đó anh sai rồi.' } } },
        { label: 'Hỏi lại đúng câu ông ta từng mắng',
          text: 'Bạn chỉ vào một lỗi đánh máy trong CV của {boss}: “Lỗi chính tả này... chắc anh nên học lại lớp Một?” Ông ta đỏ mặt tía tai. Bạn bật cười trước, rồi cả hai cùng cười. Hả dạ, mà cũng thấy thương thương.',
          effects: { happy: 10, karma: -2 },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { boss: 'facepalm' } } },
        { label: 'Nhận vào, cho ông ấy một cơ hội',
          outcomes: [
            { p: 0.6, text: '{boss} làm việc chăm chỉ, lễ phép với cả thực tập sinh. Có hôm ông ấy mua trà sữa cho cả nhóm, kèm mẩu giấy: “Từ một người từng là sếp tồi.”',
              effects: { karma: 12, happy: 8 },
              scene: { anim: 'clap', fx: 'hearts', npcAnim: { boss: 'bow' } } },
            { p: 0.4, text: 'Được ba tháng, {boss} lại bắt đầu nhắn việc cho thực tập sinh lúc 11 giờ đêm. Bạn thở dài, mời ông ta vào phòng nói chuyện. Có những người không đổi được.',
              effects: { karma: 6, happy: -4 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Từ chối thẳng, không cần suy nghĩ',
          text: 'Bạn gấp hồ sơ lại: “Cảm ơn anh đã quan tâm.” {boss} lặng lẽ ra về. Ông ta xứng đáng với câu đó, vậy mà tối về bạn vẫn nghĩ mãi.',
          effects: { happy: 3, karma: -3 },
          scene: { anim: 'shake', fx: 'question', npcAnim: { boss: 'sad' } } }
      ]
    },

    // ======================= ARC 2: ĐỒNG NGHIỆP CHƠI XẤU =======================
    {
      id: 's_work_snake_lunch', title: 'Cạ cứng giờ cơm trưa', icon: '🍱', age: [22, 55], weight: 1.2,
      req: { job: true, notFlag: 's_work_snake' },
      text: '{coworker} là cạ cứng giờ cơm trưa của bạn: chia nhau hộp cơm tấm, buôn đủ chuyện trên trời dưới biển. Bạn vừa thức ba đêm hoàn thiện bản đề xuất cho khách hàng lớn nhất năm. {coworker} vỗ vai: “Để mình gửi giám đốc giùm cho, ông ấy quý mình lắm!”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'eat', expr: 'happy',
        npcs: [{ role: 'coworker', anim: 'eat', say: 'Để mình gửi giám đốc giùm cho!' }], fx: 'steam', shot: 'close' },
      choices: [
        { label: 'Tin bạn, chuyển file cho {coworker}',
          text: 'Bạn chuyển file, còn cảm ơn rối rít. {coworker} nháy mắt: “Chuyện nhỏ!” rồi gắp cho bạn miếng sườn to nhất hộp.',
          effects: { happy: 3, flag: 's_work_snake', followUp: { id: 's_work_snake_credit', delay: 0 } },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { coworker: 'laugh' } } },
        { label: 'Tự gửi, CC cả nhóm cho chắc',
          text: 'Bạn cười: “Thôi để mình gửi luôn, CC cả nhóm cho tiện.” {coworker} khựng lại nửa giây rồi cười xòa. Nửa giây ấy, bạn nhớ mãi.',
          effects: { smarts: 2, flag: ['s_work_snake', 's_work_snake_proof'], followUp: { id: 's_work_snake_blame', delay: 1 } },
          scene: { anim: 'type', fx: 'question', npcAnim: { coworker: 'shrug' } } },
        { label: 'Nhờ gửi, nhưng lén cài tên mình vào file',
          text: 'Bạn gật đầu, nhưng trước đó đã kịp ghi tên mình vào phần thông tin tác giả của file và gửi một bản vào email riêng. Cẩn tắc vô áy náy.',
          effects: { smarts: 3, flag: ['s_work_snake', 's_work_snake_proof'], followUp: { id: 's_work_snake_credit', delay: 0 } },
          scene: { anim: 'type', fx: 'idea', npcAnim: { coworker: 'eat' } } }
      ]
    },
    {
      id: 's_work_snake_credit', title: 'Email cảm ơn từ giám đốc', icon: '📧', age: [22, 65], chainOnly: true,
      text: 'Thứ Hai, cả công ty nhận email của giám đốc: “Cảm ơn {coworker} đã một mình xây dựng bản đề xuất xuất sắc, giúp công ty ký hợp đồng 5 tỷ.” Tên bạn không xuất hiện ở bất cứ đâu. Ở bàn bên, {coworker} đang nhận lời chúc mừng, không dám nhìn sang.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'type', expr: 'angry',
        npcs: [{ role: 'coworker', anim: 'laugh', say: 'Cảm ơn mọi người, may mắn thôi mà!' }, { role: 'crowd', anim: 'clap' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Lục lại email gốc và lịch sử chỉnh sửa',
          text: 'Bạn ngồi đến 9 giờ tối, chụp lại từng dòng lịch sử: 312 lần chỉnh sửa, tất cả mang tên bạn, lúc 1 giờ, 2 giờ, 3 giờ sáng. Bạn gửi email xin gặp giám đốc.',
          effects: { smarts: 3, happy: -2, flag: 's_work_snake_proof', followUp: { id: 's_work_snake_confront', delay: 0 } },
          scene: { time: 'night', anim: 'type', fx: 'idea', npcAnim: { coworker: 'walk', crowd: 'walk' } } },
        { label: 'Hỏi thẳng {coworker} ở góc pha cà phê',
          outcomes: [
            { p: 0.4, text: '{coworker} đỏ mặt, lí nhí: “Mình xin lỗi, lúc đó mình hám danh quá.” Chiều đó, giám đốc nhận thêm một email đính chính, tên bạn đứng đầu.',
              effects: { happy: 8, karma: 3, flag: 's_work_snake_fixed' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { coworker: 'bow' }, npcSay: { coworker: 'Mình xin lỗi, để mình đính chính.' } } },
            { p: 0.6, text: '{coworker} nhún vai: “Mình có ghi tên bạn mà, chắc giám đốc quên.” Tuần sau, bạn nghe phong thanh {coworker} kể với mọi người rằng bạn “làm chậm, phải gánh giùm”.',
              effects: { happy: -6, followUp: { id: 's_work_snake_blame', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'shrug' }, npcSay: { coworker: 'Chắc giám đốc quên thôi mà.' } } }
          ] },
        { label: 'Nuốt cục tức, để thời gian trả lời',
          text: 'Bạn nuốt cục tức xuống cùng ly trà đá. Từ đó bữa trưa bạn ăn một mình, còn {coworker} được giao thêm dự án mới — và cần thêm người để “gánh”.',
          effects: { happy: -5, karma: 2, followUp: { id: 's_work_snake_blame', delay: 1 } },
          scene: { anim: 'sad', fx: 'sweat', npcAnim: { coworker: 'walk' } } },
        { label: 'Thả meme “tự vỗ tay” vào nhóm chat công ty',
          outcomes: [
            { p: 0.5, text: 'Tấm ảnh con mèo tự vỗ tay cho mình khiến cả công ty hiểu ra. Nhóm chat nổ tung, giám đốc nhắn riêng: “Mai lên phòng anh, mang theo file gốc.”',
              effects: { happy: 5, followUp: { id: 's_work_snake_confront', delay: 0 } },
              scene: { anim: 'laugh', fx: 'exclaim', npcAnim: { crowd: 'laugh', coworker: 'facepalm' } } },
            { p: 0.5, text: 'Chẳng ai hiểu ý bạn, trừ trưởng phòng — người nhắc bạn “giữ tác phong chuyên nghiệp”. {coworker} thả một biểu tượng cười ha ha.',
              effects: { happy: -5, followUp: { id: 's_work_snake_blame', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { coworker: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_work_snake_blame', title: 'Báo giá thiếu một số 0', icon: '🧾', age: [22, 65], chainOnly: true,
      req: { job: true },
      text: 'Khách hàng nổi giận: bản báo giá gửi đi thiếu đúng một số 0, công ty lỗ gần 300 triệu. Trong cuộc họp khẩn, {coworker} nói không chớp mắt: “File đó {name} làm, em chỉ bấm gửi.” Sếp {boss} từ từ quay sang nhìn bạn.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'coworker', anim: 'point', say: 'File đó {name} làm, em chỉ bấm gửi.' }, { role: 'boss', anim: 'angry' }, { role: 'crowd', anim: 'sit' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Mở lịch sử chỉnh sửa lên máy chiếu', req: { flag: 's_work_snake_proof' },
          text: 'Bạn cắm laptop vào máy chiếu, mở lịch sử phiên bản. Dòng cuối hiện rõ: “{coworker} đã sửa ô đơn giá — 17:58”. Cả phòng im phăng phắc. Sếp {boss} gập sổ: “Hai người, lên phòng họp nhỏ.”',
          effects: { smarts: 2, happy: 4, followUp: { id: 's_work_snake_confront', delay: 0 } },
          scene: { anim: 'point', fx: 'flash', npcAnim: { coworker: 'scared', boss: 'think' } } },
        { label: 'Xin một ngày để chứng minh',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn nhờ anh IT trích xuất nhật ký máy chủ đến nửa đêm. 8 giờ sáng hôm sau, bằng chứng nằm trên bàn sếp: người sửa file lần cuối là {coworker}.',
              effects: { smarts: 3, health: -1, flag: 's_work_snake_proof', followUp: { id: 's_work_snake_confront', delay: 0 } },
              scene: { time: 'night', anim: 'type', fx: 'idea', npcAnim: { boss: 'idle' } } },
            { text: 'Bạn lục tung cả đêm nhưng file đã bị ghi đè, lịch sử trống trơn. Sáng ra, bạn bước vào phòng họp với hai bàn tay không.',
              effects: { happy: -5, health: -2, followUp: { id: 's_work_snake_confront', delay: 0 } },
              scene: { time: 'night', anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Nhận lỗi thay cho êm chuyện',
          text: 'Bạn cúi đầu nhận lỗi, bị trừ {money:15000000} tiền thưởng và thêm một vết đen trong hồ sơ. {coworker} đi ngang bàn bạn, khẽ nói: “Cảm ơn nha.” Lần đầu tiên bạn thấy ghê sợ một nụ cười.',
          effects: { money: -15000000, happy: -10, karma: 3, flag: 's_work_snake_lost' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'laugh', boss: 'shake' } } },
        { label: 'Đập bàn, tố {coworker} trước cả phòng',
          text: 'Bạn đứng bật dậy: “Đây không phải lần đầu đâu nhé!” rồi kể hết những lần {coworker} chơi xấu. Phòng họp như chợ vỡ. Sếp {boss} đập bàn: “Đủ rồi! Chiều nay cả hai gặp tôi!”',
          effects: { happy: 2, followUp: { id: 's_work_snake_confront', delay: 0 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'scared', boss: 'angry', crowd: 'scared' } } }
      ]
    },
    {
      id: 's_work_snake_confront', title: 'Phòng họp kín', icon: '⚖️', age: [22, 65], chainOnly: true,
      text: 'Phòng họp nhỏ, rèm kéo kín. Sếp {boss} ngồi giữa, chị nhân sự cầm sổ ghi chép, {coworker} ngồi đối diện bạn, mặt trắng bệch nhưng vẫn cố cười. Sếp gõ bút xuống bàn: “Tôi muốn nghe sự thật.”',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'neutral',
        npcs: [{ role: 'boss', anim: 'think', say: 'Tôi muốn nghe sự thật.' }, { role: 'coworker', anim: 'sit', expr: 'scared' }, { role: 'stranger', gender: 'f', age: 36, anim: 'type' }], fx: 'question', shot: 'dramatic' },
      choices: [
        { label: 'Trình bày toàn bộ bằng chứng', req: { flag: 's_work_snake_proof' },
          text: 'Bạn bày ra từng thứ: email gốc, lịch sử chỉnh sửa, giờ gửi file. {coworker} cúi gằm, không nói được câu nào. Tuần sau, {coworker} thu dọn đồ rời công ty, còn bạn nhận quyết định thăng chức.',
          effects: { happy: 12, smarts: 2, karma: 2, job: 'promote', flag: 's_work_snake_won' },
          scene: { anim: 'point', fx: 'levelup', npcAnim: { coworker: 'cry', boss: 'nod' } } },
        { label: 'Bình tĩnh kể lại từ đầu đến cuối',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn kể mạch lạc, nhớ đến từng ngày giờ. {coworker} trả lời lắp bắp, mỗi lúc một mâu thuẫn. Sếp {boss} kết luận: {coworker} bị kỷ luật, bạn được tăng lương bù cho những gì đã chịu.',
              effects: { happy: 9, job: 'raise', flag: 's_work_snake_won' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { coworker: 'facepalm', boss: 'nod' } } },
            { text: 'Lời bạn chống lời {coworker}, chẳng ai có bằng chứng. Sếp {boss} chọn tin người khéo ăn nói hơn. Bạn nhận quyết định chấm dứt hợp đồng, ôm thùng giấy ra về giữa trưa nắng.',
              effects: { happy: -12, job: 'fire', flag: 's_work_snake_lost' },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'shrug', boss: 'shake' } } }
          ] },
        { label: 'Cho {coworker} một cơ hội tự nhận',
          success: { stat: 'karma', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn nói: “Mình chỉ cần {coworker} nói thật.” Im lặng rất lâu, rồi {coworker} bật khóc thừa nhận tất cả. Sếp {boss} giữ {coworker} lại kèm một bản kỷ luật, còn bạn được giao dẫn dắt dự án mới.',
              effects: { happy: 9, karma: 8, job: 'promote', flag: 's_work_snake_won' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { coworker: 'cry', boss: 'clap' } } },
            { text: '{coworker} chộp lấy cơ hội ấy để kể một phiên bản khác, trong đó bạn là người cẩu thả. Sếp {boss} gật gù. Lòng tốt của bạn hôm đó phải trả giá bằng chính công việc.',
              effects: { happy: -12, karma: 2, job: 'fire', flag: 's_work_snake_lost' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { coworker: 'shrug', boss: 'shake' } } }
          ] },
        { label: 'Trút hết uất ức, không cần giữ lời',
          outcomes: [
            { p: 0.3, text: 'Bạn nói như súng liên thanh. Đến lúc bạn nhắc một chi tiết chỉ người làm mới biết, {coworker} chột dạ buột miệng cãi lại — và tự lộ. Sếp {boss} hiểu ra tất cả.',
              effects: { happy: 6, job: 'raise', flag: 's_work_snake_won' },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { coworker: 'facepalm', boss: 'nod' } } },
            { p: 0.7, text: 'Bạn lớn tiếng đến mức chị nhân sự phải can. Sếp {boss} lạnh lùng: “Thái độ thế này thì đúng sai cũng không quan trọng nữa.” Bạn bị cho nghỉ việc.',
              effects: { happy: -12, job: 'fire', flag: 's_work_snake_lost' },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { boss: 'shake', stranger: 'scared' } } }
          ] }
      ]
    },

    // ======================= ARC 3: CÔNG TY NỢ LƯƠNG =======================
    {
      id: 's_work_salary_late', title: 'Ba tháng chưa thấy lương', icon: '💸', age: [20, 60], weight: 1.2,
      req: { job: true, notFlag: 's_work_salary' },
      text: 'Đã ba tháng, điện thoại bạn chưa “ting ting” đồng lương nào. Giám đốc {boss} họp toàn công ty, mắt rưng rưng: “Công ty đang khó, anh em ráng chút, quý sau có hợp đồng lớn, anh trả đủ cả lãi.” Trong khi đó, tiền trọ đã trễ hai tuần và gói mì cuối cùng nằm chỏng chơ trong tủ.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'boss', gender: 'm', age: 50, anim: 'talk', say: 'Anh em ráng thêm chút, quý sau anh trả đủ!' }, { role: 'coworker', anim: 'facepalm' }, { role: 'crowd', anim: 'sit' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Tin lời sếp, cố bám trụ thêm',
          text: 'Bạn gật đầu cùng mọi người. Giám đốc bắt tay từng người, còn hứa Tết này thưởng tháng mười bốn. Tối về, bạn mở app vay tiêu dùng để trả tiền nhà.',
          effects: { happy: -4, karma: 2, money: -15000000, flag: ['s_work_salary', 's_work_salary_trust'], followUp: { id: 's_work_salary_promise', delay: 1 } },
          scene: { anim: 'nod', fx: 'sweat', npcAnim: { boss: 'bow', coworker: 'shrug', crowd: 'clap' } } },
        { label: 'Rủ cả công ty đình công',
          text: 'Giờ nghỉ trưa, bạn đứng lên giữa căng tin, nói một câu khiến cả phòng im phăng phắc: “Không lương thì mai mình không làm nữa!” Hơn năm mươi cánh tay giơ lên.',
          effects: { happy: 3, karma: 1, flag: ['s_work_salary', 's_work_salary_strike'], followUp: { id: 's_work_salary_strike', delay: 0 } },
          scene: { anim: 'point', fx: 'exclaim', npcAnim: { coworker: 'cheer', crowd: 'cheer', boss: 'scared' } } },
        { label: 'Âm thầm rải CV đi chỗ khác',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn tranh thủ giờ nghỉ trưa đi phỏng vấn. Ba tuần sau, thư mời từ công ty khác về hộp thư, lương còn cao hơn. Bạn nộp đơn nghỉ, kèm một dòng in đậm: “Đề nghị thanh toán ba tháng lương còn nợ.”',
              effects: { happy: 8, job: 'raise', flag: ['s_work_salary', 's_work_salary_left'], followUp: { id: 's_work_salary_news', delay: 1 } },
              scene: { loc: 'cafe', anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'wave', boss: 'shrug' } } },
            { text: 'Thị trường đang khó, bạn rải sáu mươi bộ CV, nhận về đúng hai cuộc gọi... mời mua bảo hiểm. Bạn đành ở lại, cầu trời công ty qua khỏi.',
              effects: { happy: -5, flag: ['s_work_salary', 's_work_salary_trust'], followUp: { id: 's_work_salary_promise', delay: 1 } },
              scene: { anim: 'phone', fx: 'sweat', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Tối chạy Grab cho qua cơn đói',
          text: 'Năm giờ chiều tan làm, sáu giờ bạn đã khoác áo xanh lá, chạy xe đến mười một giờ đêm. Mệt rã người, nhưng ít ra tháng này vẫn đóng được tiền trọ.',
          effects: { health: -5, happy: -2, money: 6000000, flag: ['s_work_salary', 's_work_salary_trust'], followUp: { id: 's_work_salary_promise', delay: 1 } },
          scene: { loc: 'street', time: 'night', anim: 'drive', fx: 'sweat', npcAnim: { boss: 'walk', coworker: 'wave', crowd: 'walk' } } }
      ]
    },
    {
      id: 's_work_salary_strike', title: 'Ngồi trước cổng công ty', icon: '✊', age: [20, 65], chainOnly: true,
      req: { job: true },
      text: 'Sáng hôm sau, cả trăm người ngồi kín trước cổng công ty, băng rôn viết tay: “Trả lương cho chúng tôi”. Giám đốc {boss} đứng trên bậc thềm, mồ hôi nhễ nhại, vài anh công an phường đứng nhìn. Một phóng viên báo mạng đã dựng máy quay, còn giám đốc thì ra hiệu muốn nói chuyện riêng với “người cầm đầu” — tức là bạn.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'sit', expr: 'angry',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Em vào đây nói chuyện riêng với anh!' }, { role: 'crowd', anim: 'cheer' }, { role: 'police', anim: 'idle' }, { role: 'stranger', gender: 'f', age: 29, anim: 'phone' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Đàm phán đàng hoàng, đòi giấy cam kết',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn ngồi với giám đốc ba tiếng, có cả đại diện công đoàn. Kết quả: trả ngay một tháng lương, hai tháng còn lại có giấy cam kết đóng dấu đỏ. Anh em vỗ tay rần rần.',
              effects: { happy: 8, karma: 4, money: 15000000, flag: 's_work_salary_paper', followUp: { id: 's_work_salary_collapse', delay: 1 } },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { crowd: 'clap', boss: 'shrug', police: 'nod' } } },
            { text: 'Giám đốc hứa hươu hứa vượn, bạn ra truyền đạt lại thì bị anh em chửi “ăn tiền của sếp rồi”. Cuộc đình công tan rã trong lủng củng.',
              effects: { happy: -7, karma: -1, followUp: { id: 's_work_salary_collapse', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { crowd: 'angry', boss: 'laugh' } } }
          ] },
        { label: 'Kể hết cho phóng viên',
          outcomes: [
            { p: 0.55, text: 'Bài báo “Hàng trăm người lao động bị nợ lương” lên trang nhất, Sở Lao động vào cuộc ngay trong tuần. Công ty phải trả hai tháng lương, còn tên bạn thì vào “sổ đen” của giám đốc.',
              effects: { happy: 6, karma: 3, money: 30000000, flag: 's_work_salary_paper', followUp: { id: 's_work_salary_collapse', delay: 1 } },
              scene: { anim: 'talk', fx: 'flash', npcAnim: { stranger: 'nod', crowd: 'cheer', boss: 'facepalm' } } },
            { p: 0.45, text: 'Clip của bạn lên TikTok, triệu lượt xem, nhưng bình luận toàn cãi nhau chuyện khác. Hôm sau, công ty dán thông báo: bạn bị cho nghỉ vì “gây rối trật tự”.',
              effects: { happy: -6, job: 'fire', followUp: { id: 's_work_salary_collapse', delay: 1 } },
              scene: { anim: 'sad', fx: 'exclaim', npcAnim: { stranger: 'phone', boss: 'point' } } }
          ] },
        { label: 'Vào phòng riêng nghe sếp “nói nhỏ”',
          text: 'Giám đốc đóng cửa, đẩy sang một phong bì {money:20000000}: “Em giải tán anh em giùm anh, tháng sau anh lên chức cho em.” Bạn cầm phong bì, ra bảo mọi người về. Đêm đó bạn không tài nào ngủ được.',
          effects: { money: 20000000, karma: -12, happy: -3, flag: 's_work_salary_bribed', followUp: { id: 's_work_salary_collapse', delay: 1 } },
          scene: { anim: 'think', fx: 'money', npcAnim: { boss: 'laugh', crowd: 'sad' } } },
        { label: 'Rút về, để người khác đứng mũi chịu sào',
          text: 'Bạn lặng lẽ lùi ra sau hàng người rồi tìm cớ về sớm. Đình công kéo dài ba ngày, công ty trả mỗi người nửa tháng lương cho xong chuyện.',
          effects: { happy: -2, money: 7000000, followUp: { id: 's_work_salary_collapse', delay: 1 } },
          scene: { anim: 'walk', fx: 'sweat', npcAnim: { crowd: 'angry' } } }
      ]
    },
    {
      id: 's_work_salary_promise', title: 'Lời đề nghị lúc nửa đêm', icon: '🤝', age: [20, 65], chainOnly: true,
      req: { job: true },
      text: 'Một năm trôi qua, lương vẫn trả nhỏ giọt, nợ cũ vẫn treo. Tối nay giám đốc {boss} hẹn riêng bạn ra quán cà phê, giọng thì thầm: “Công ty sắp ký hợp đồng trăm tỷ, chỉ thiếu vốn đối ứng. Em cho anh vay {money:200000000}, ba tháng sau anh trả gấp rưỡi, kèm chức trưởng phòng.”',
      scene: { loc: 'cafe', time: 'night', weather: 'rain', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Ba tháng thôi, anh trả gấp rưỡi!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Tin sếp, rút sổ tiết kiệm cho vay',
          text: 'Bạn rút sổ tiết kiệm, vay thêm người quen cho đủ số. Giám đốc ôm bạn thật chặt: “Anh không quên ơn em đâu.” Bạn về nhà, lòng phơi phới như sắp lên trưởng phòng.',
          effects: { money: -200000000, happy: 3, flag: 's_work_salary_lent', followUp: { id: 's_work_salary_collapse', delay: 1 } },
          scene: { anim: 'hug', fx: 'money', npcAnim: { boss: 'hug' } } },
        { label: 'Cho vay ít, bắt ký giấy có công chứng',
          text: 'Bạn chỉ đưa {money:50000000}, nhưng bắt giám đốc ký giấy vay có công chứng, ghi rõ tài sản đảm bảo. Giám đốc cười gượng: “Em cẩn thận quá.”',
          effects: { money: -50000000, smarts: 2, flag: ['s_work_salary_lent', 's_work_salary_paper'], followUp: { id: 's_work_salary_collapse', delay: 1 } },
          scene: { anim: 'type', fx: 'idea', npcAnim: { boss: 'shrug' } } },
        { label: 'Từ chối, và nộp đơn nghỉ luôn',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn đặt ly cà phê xuống: “Em xin lỗi anh, em nghỉ.” Một tháng sau, bạn đã ngồi ở công ty mới, lương đúng hạn từng ngày. Chỉ có ba tháng lương cũ là vẫn bặt tăm.',
              effects: { happy: 6, job: 'raise', flag: 's_work_salary_left', followUp: { id: 's_work_salary_news', delay: 1 } },
              scene: { anim: 'wave', fx: 'sparkle', npcAnim: { boss: 'angry' } } },
            { text: 'Bạn nghỉ trong một phút nóng giận, rồi nửa năm liền không tìm được chỗ nào. Mỗi sáng mở Zalo, nhóm công ty cũ vẫn đều đặn hô hào: “Sắp có tiền rồi anh em ơi!”',
              effects: { happy: -6, job: 'fire', followUp: { id: 's_work_salary_collapse', delay: 1 } },
              scene: { anim: 'sad', fx: 'question', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Hỏi khéo xem hợp đồng trăm tỷ ở đâu',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn hỏi tên đối tác, số hợp đồng, ngày ký. Giám đốc trả lời ấp úng, mỗi câu một kiểu. Bạn hiểu ra tất cả, về nhà gửi CV ngay trong đêm và một tháng sau đã đổi chỗ làm.',
              effects: { smarts: 3, happy: 4, job: 'raise', flag: 's_work_salary_left', followUp: { id: 's_work_salary_news', delay: 1 } },
              scene: { anim: 'think', fx: 'idea', npcAnim: { boss: 'facepalm' } } },
            { text: 'Giám đốc trả lời trơn tru, còn mở điện thoại cho xem ảnh ký kết bắt tay rạng rỡ. Bạn bị thuyết phục, chuyển khoản {money:100000000} lúc nào không hay.',
              effects: { money: -100000000, flag: 's_work_salary_lent', followUp: { id: 's_work_salary_collapse', delay: 1 } },
              scene: { anim: 'phone', fx: 'money', npcAnim: { boss: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_work_salary_collapse', title: 'Cánh cổng khóa trái', icon: '🔒', age: [20, 70], chainOnly: true,
      text: 'Sáng thứ Hai, cổng công ty khóa trái, dán tờ giấy A4: “Tạm ngừng hoạt động”. Giám đốc {boss} đã bay ra nước ngoài từ tuần trước, số điện thoại thuê bao, Facebook khóa. Hàng trăm người đứng trước cổng, người khóc, người chửi; ai từng cho giám đốc vay tiền thì coi như mất trắng.',
      scene: { loc: 'street', time: 'day', weather: 'rain', anim: 'scared', expr: 'sad',
        npcs: [{ role: 'coworker', anim: 'cry', say: 'Ổng trốn rồi! Ổng trốn thật rồi!' }, { role: 'crowd', anim: 'angry' }, { role: 'police', anim: 'talk' }], fx: 'tears', shot: 'dramatic' },
      choices: [
        { label: 'Cùng anh em làm đơn gửi công an, tòa án',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Một năm đi lại mòn cả dép, tòa tuyên phát mại tài sản công ty để trả lương. Mỗi người nhận lại được một nửa số nợ. Không nhiều, nhưng là lẽ phải.',
              effects: { happy: 6, karma: 4, money: 25000000, job: 'fire', flag: 's_work_salary_end' },
              scene: { weather: 'clear', anim: 'nod', fx: 'sparkle', npcAnim: { coworker: 'hug', police: 'nod', crowd: 'clap' } } },
            { text: 'Hồ sơ dày cộp, đi lại hàng chục lần, nhưng tài sản công ty đã bị tẩu tán sạch. Cuối cùng, bạn nhận được một tờ giấy: “Không còn tài sản để thi hành án.”',
              effects: { happy: -6, health: -2, job: 'fire', flag: 's_work_salary_end' },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'sad', police: 'shrug' } } }
          ] },
        { label: 'Mang giấy tờ có dấu đỏ ra tòa', req: { flag: 's_work_salary_paper' },
          outcomes: [
            { p: 0.75, text: 'Tờ giấy có dấu đỏ và chữ ký trở thành bằng chứng vàng. Tòa buộc phát mại chiếc ô tô của giám đốc, phần của bạn được trả trước tiên: {money:60000000}.',
              effects: { money: 60000000, happy: 8, smarts: 2, job: 'fire', flag: 's_work_salary_end' },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { coworker: 'clap', police: 'nod' } } },
            { p: 0.25, text: 'Có giấy cũng chẳng làm gì được khi người ký đã ở bên kia đại dương. Bạn cất tờ giấy vào ngăn kéo, như cất một bài học đắt giá.',
              effects: { happy: -5, smarts: 2, job: 'fire', flag: 's_work_salary_end' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Tìm đến tận nhà giám đốc đòi tiền',
          outcomes: [
            { p: 0.3, text: 'Vợ giám đốc ra mở cổng, mắt đỏ hoe: chính chị cũng bị chồng bỏ lại cùng đống nợ. Chị tháo chiếc lắc vàng đưa bạn: “Coi như trả một phần.” Bạn cầm mà lòng nặng trĩu.',
              effects: { money: 30000000, karma: -2, happy: -3, job: 'fire', flag: 's_work_salary_end' },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'sad', crowd: 'sad' } } },
            { p: 0.7, text: 'Cổng nhà dán đầy giấy đòi nợ, hàng xóm bảo căn nhà đã bán từ tháng trước. Bạn đứng giữa trời mưa, nhận ra mình chỉ là một trong rất nhiều chủ nợ.',
              effects: { happy: -8, job: 'fire', flag: 's_work_salary_end' },
              scene: { weather: 'storm', anim: 'sad', fx: 'tears', npcAnim: { coworker: 'cry', crowd: 'sad' } } }
          ] },
        { label: 'Coi như của đi thay người, tìm việc mới',
          text: 'Bạn chụp một tấm ảnh cánh cổng khóa trái làm kỷ niệm, rồi về nhà mở laptop tìm việc. Tiền mất thì còn kiếm lại được, thời gian thì không.',
          effects: { happy: -4, smarts: 2, job: 'fire', flag: 's_work_salary_end' },
          scene: { anim: 'phone', fx: 'idea', npcAnim: { coworker: 'wave' } } }
      ]
    },
    {
      id: 's_work_salary_news', title: 'Tin dữ từ công ty cũ', icon: '📰', age: [20, 70], chainOnly: true,
      text: 'Bạn đang ăn sáng thì nhóm Zalo “Hội nạn nhân công ty cũ” nổ tung: công ty phá sản, giám đốc {boss} đã trốn ra nước ngoài, hàng trăm người mất trắng lương. Ba tháng lương của bạn, gần {money:45000000}, cũng nằm trong số đó. {coworker} nhắn riêng: “May cho mày, nhảy kịp!”',
      scene: { loc: 'cafe', time: 'dawn', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'coworker', anim: 'phone', expr: 'sad', say: 'May cho mày, nhảy kịp!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Góp tiền giúp anh em còn kẹt lại',
          text: 'Bạn chuyển {money:5000000} vào quỹ chung, rủ thêm mấy người đã nhảy việc cùng góp. Số tiền đủ để vài gia đình qua tháng. {coworker} gửi lại một sticker ôm thật chặt.',
          effects: { money: -5000000, karma: 8, happy: 4 },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { coworker: 'cry' } } },
        { label: 'Đứng tên chung trong đơn kiện',
          outcomes: [
            { p: 0.4, text: 'Hai năm sau tòa xử, bạn nhận lại {money:20000000}. Ít, nhưng cầm số tiền đó, bạn thấy lẽ phải vẫn còn.',
              effects: { money: 20000000, happy: 5, karma: 2 },
              scene: { anim: 'nod', fx: 'money', npcAnim: { coworker: 'clap' } } },
            { p: 0.6, text: 'Đơn kiện lòng vòng qua bao nhiêu phòng ban rồi chìm nghỉm. Ba tháng lương ấy, bạn coi như học phí cho bài học “đọc vị sếp”.',
              effects: { happy: -3, smarts: 2 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Đăng status khoe mình “thánh nhảy việc”',
          text: 'Status được ba trăm lượt thích, và vài chục bình luận trách bạn vô tâm khi đồng nghiệp cũ đang khốn đốn. Bạn lặng lẽ xóa bài, mặt nóng ran.',
          effects: { happy: -2, karma: -4 },
          scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { coworker: 'angry' } } }
      ]
    },

    // ======================= ARC 4: XUẤT KHẨU LAO ĐỘNG =======================
    {
      id: 's_work_xkld_ad', title: 'Giấc mơ xứ người', icon: '✈️', age: [20, 40], weight: 1.0,
      req: { notFlag: 's_work_xkld', maxMoney: 1000000000 },
      text: 'Thằng em họ đi Nhật ba năm về, xây nhà hai tầng, mua xe tay ga cho cả bố lẫn mẹ, cả xóm xôn xao. Hôm nay, một chị môi giới tìm đến tận nhà bạn, mở điện thoại khoe ảnh nhà máy sáng choang: “Nhật, Hàn hay Đài em chọn đi, lương ba bốn chục triệu một tháng, chị lo hết!”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 42, anim: 'talk', say: 'Lương ba bốn chục triệu, chị lo hết!' }, { role: 'relative', gender: 'm', age: 55, anim: 'nod', say: 'Đi đi cháu, đời được mấy lần!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Đi Nhật qua công ty phái cử có giấy phép',
          text: 'Bạn chọn công ty có giấy phép đàng hoàng: học tiếng sáu tháng, khám sức khỏe, đóng phí {money:220000000} — phần lớn là tiền vay ngân hàng, thế chấp sổ đỏ của nhà. Ngày bay, cả nhà ra sân bay tiễn, ai cũng khóc.',
          effects: { money: -220000000, smarts: 2, happy: 2, job: { hire: 'congnhan' }, flag: ['s_work_xkld', 's_work_xkld_legit'], followUp: { id: 's_work_xkld_arrive', delay: 1 } },
          scene: { anim: 'wave', fx: 'tears', npcAnim: { relative: 'cry', stranger: 'clap' } } },
        { label: 'Đi Đài Loan qua “cò” quen, phí rẻ hơn',
          outcomes: [
            { p: 0.5, text: 'Chị môi giới cầm {money:150000000} tiền mặt, hẹn ba tháng nữa có visa. Ba tháng, rồi năm tháng... số điện thoại của chị bắt đầu “không liên lạc được”.',
              effects: { money: -150000000, flag: ['s_work_xkld', 's_work_xkld_cheated'], followUp: { id: 's_work_xkld_scam', delay: 0 } },
              scene: { anim: 'phone', fx: 'question', npcAnim: { stranger: 'wave', relative: 'think' } } },
            { p: 0.5, text: 'Rẻ mà bay được thật! Bốn tháng sau, bạn xách va li sang Đài Trung làm công nhân nhà máy điện tử, trong túi là địa chỉ ký túc xá và lọ muối ớt mẹ dúi vào phút chót.',
              effects: { money: -150000000, job: { hire: 'congnhan' }, flag: 's_work_xkld', followUp: { id: 's_work_xkld_arrive', delay: 1 } },
              scene: { anim: 'wave', fx: 'sparkle', npcAnim: { stranger: 'clap', relative: 'cry' } } }
          ] },
        { label: 'Tự ôn tiếng Hàn, thi chương trình EPS',
          success: { stat: 'smarts', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Một năm vừa làm vừa học, bạn đỗ kỳ thi tiếng Hàn với điểm cao. Tổng chi phí chưa tới {money:30000000}; chị môi giới nhìn bạn như nhìn người ngoài hành tinh.',
              effects: { money: -30000000, smarts: 5, happy: 8, job: { hire: 'congnhan' }, flag: ['s_work_xkld', 's_work_xkld_lang'], followUp: { id: 's_work_xkld_arrive', delay: 1 } },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { stranger: 'facepalm', relative: 'clap' } } },
            { text: 'Bạn trượt kỳ thi, thiếu đúng hai điểm. Sách vở dồn vào góc tủ, giấc mơ xứ Hàn để dành cho năm sau, hoặc chẳng bao giờ.',
              effects: { money: -8000000, happy: -5, smarts: 3, flag: 's_work_xkld' },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { relative: 'shrug' } } }
          ] },
        { label: 'Thôi, ở nhà ăn rau muống còn hơn',
          text: 'Bạn tiễn chị môi giới ra ngõ. Ở nhà lương thấp, nhưng tối nào cũng có cơm mẹ nấu, cuối tuần có bạn bè rủ đi cà phê vỉa hè.',
          effects: { happy: 3, flag: 's_work_xkld' },
          scene: { anim: 'wave', fx: 'sparkle', npcAnim: { stranger: 'shrug', relative: 'shake' } } }
      ]
    },
    {
      id: 's_work_xkld_scam', title: 'Văn phòng cửa đóng then cài', icon: '🚪', age: [20, 45], chainOnly: true,
      text: 'Bạn tìm đến văn phòng của chị {stranger}: biển hiệu đã gỡ, cửa cuốn đóng im lìm. Trước cửa, hơn ba chục người đứng ngồi lố nhố, ai cũng cầm biên nhận. Một bác nông dân ngồi bệt xuống vỉa hè, giọng lạc đi: “Tôi bán cả hai sào ruộng đấy...”',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'neighbor', gender: 'm', age: 62, anim: 'cry', say: 'Tôi bán cả hai sào ruộng đấy...' }, { role: 'crowd', anim: 'angry' }, { role: 'police', anim: 'think' }], fx: 'tears', shot: 'wide' },
      choices: [
        { label: 'Cùng mọi người làm đơn tố cáo',
          outcomes: [
            { p: 0.4, text: 'Tám tháng sau, công an bắt được chị {stranger} ở một nhà nghỉ ven biển. Bạn được trả lại {money:90000000}; phần còn lại chị ta đã nướng sạch vào cờ bạc.',
              effects: { money: 90000000, happy: 6, karma: 3 },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { police: 'nod', crowd: 'clap', neighbor: 'hug' } } },
            { p: 0.6, text: 'Đơn nộp rồi, hồ sơ mở rồi, nhưng người thì bặt tăm. Tháng nào bạn cũng phải trả lãi ngân hàng cho một chuyến bay không bao giờ cất cánh.',
              effects: { happy: -8, health: -2 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { police: 'shrug', neighbor: 'sad' } } }
          ] },
        { label: 'Vay thêm, đi lại qua công ty có giấy phép',
          text: 'Bạn nghiến răng vay thêm {money:200000000}, lần này kiểm tra từng con dấu, từng giấy phép. Một năm sau, bạn thật sự đặt chân lên đất Nhật, gánh trên vai món nợ gấp đôi.',
          effects: { money: -200000000, smarts: 3, job: { hire: 'congnhan' }, flag: 's_work_xkld_legit', followUp: { id: 's_work_xkld_arrive', delay: 1 } },
          scene: { anim: 'nod', fx: 'sweat', npcAnim: { crowd: 'shake', neighbor: 'wave' } } },
        { label: 'Lên Facebook bóc phốt, cảnh báo người khác',
          text: 'Bài viết kèm ảnh biên nhận của bạn được chia sẻ mười nghìn lần. Bạn không lấy lại được đồng nào, nhưng hàng chục người nhắn tin cảm ơn vì đã kịp dừng tay trước khi đóng tiền.',
          effects: { karma: 8, happy: 2 },
          scene: { anim: 'phone', fx: 'exclaim', npcAnim: { crowd: 'nod', neighbor: 'nod' } } },
        { label: 'Ngồi bệt xuống cạnh bác nông dân mà khóc',
          text: 'Bạn ngồi xuống cạnh bác, nước mắt cứ thế chảy. Bác vỗ vai bạn: “Còn người là còn của, cháu ạ.” Hai con người, hai thế hệ, cùng khóc giữa phố đông.',
          effects: { happy: -10, karma: 2 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { neighbor: 'hug', crowd: 'sad' } } }
      ]
    },
    {
      id: 's_work_xkld_arrive', title: 'Mùa đông đầu tiên xứ người', icon: '🏭', age: [20, 50], chainOnly: true,
      text: 'Một năm nơi xứ người: sáng đạp xe ra xưởng trong gió lạnh cắt da, đứng máy mười tiếng, tối về phòng ký túc sáu người, chia nhau nồi mì gói. Tổ trưởng {boss} nói nhanh như súng liên thanh, bạn hiểu được ba câu thì hai câu là mắng. Đêm nào bạn cũng mở ảnh nhà ra xem, rồi úp mặt vào gối.',
      scene: { loc: 'bedroom', time: 'night', weather: 'cloudy', anim: 'eat', expr: 'sad',
        npcs: [{ role: 'coworker', anim: 'eat', say: 'Mai tăng ca nữa đó, ăn nhanh mà ngủ!' }, { role: 'crowd', anim: 'sleep' }], fx: 'steam', shot: 'close' },
      choices: [
        { label: 'Nhận hết ca tăng, cày tiền trả nợ',
          text: 'Bạn nhận mọi ca tăng, cả Chủ nhật lẫn ngày lễ. Cuối năm, khoản nợ phí môi giới đã trả xong, tài khoản còn dư kha khá, nhưng lưng đau như có ai đóng đinh.',
          effects: { money: 450000000, health: -10, happy: -2, flag: 's_work_xkld_ot', followUp: { id: 's_work_xkld_tet', delay: 1 } },
          scene: { anim: 'lift', fx: 'sweat', npcAnim: { coworker: 'lift' } } },
        { label: 'Đêm nào cũng học tiếng, tính đường dài',
          text: 'Mỗi tối, khi cả phòng lướt TikTok, bạn ngồi chép chữ. Sáu tháng sau, bạn nói chuyện trôi chảy với tổ trưởng {boss}, được chuyển sang khâu kiểm hàng nhẹ hơn, lương cao hơn.',
          effects: { money: 320000000, smarts: 8, happy: 3, flag: 's_work_xkld_lang', followUp: { id: 's_work_xkld_tet', delay: 1 } },
          scene: { anim: 'study', fx: 'idea', npcAnim: { coworker: 'phone' } } },
        { label: 'Bỏ trốn ra ngoài làm “chui” lương cao',
          outcomes: [
            { p: 0.4, text: 'Bạn theo một người quen trốn khỏi xưởng, làm “chui” ở công trường, lương gấp rưỡi. Ngày nào cũng thấp thỏm, giật mình mỗi lần thấy xe cảnh sát, nhưng tiền gửi về đều đặn.',
              effects: { money: 550000000, karma: -4, happy: -3, health: -4, flag: 's_work_xkld_chui', followUp: { id: 's_work_xkld_tet', delay: 1 } },
              scene: { loc: 'street', anim: 'run', fx: 'sweat', npcAnim: { coworker: 'run' } } },
            { p: 0.6, text: 'Được bốn tháng thì công trường bị kiểm tra. Bạn bị bắt giữa ca làm, giữ mấy tuần rồi bị trục xuất về nước. Tiền lương tháng cuối chưa kịp nhận, nợ ở quê vẫn còn nguyên. Bạn về làng với hai bàn tay trắng.',
              effects: { money: -30000000, happy: -15, health: -3, job: 'fire', flag: ['s_work_xkld_chui', 's_work_xkld_deported'] },
              scene: { loc: 'street', anim: 'scared', fx: 'flash', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Gọi video về nhà mỗi tối cho đỡ nhớ',
          text: 'Chín giờ tối nào bạn cũng gọi về: mẹ khoe vườn rau, bố khoe con gà mới nở, đứa cháu nhỏ hát cho nghe. Ngày làm vẫn cực, nhưng đêm về có một khung hình ấm áp chờ sẵn.',
          effects: { money: 280000000, happy: 6, flag: 's_work_xkld_call', followUp: { id: 's_work_xkld_tet', delay: 1 } },
          scene: { anim: 'phone', fx: 'hearts', npcAnim: { coworker: 'sleep' } } }
      ]
    },
    {
      id: 's_work_xkld_tet', title: 'Cái Tết không có bánh chưng', icon: '🧧', age: [21, 50], chainOnly: true,
      text: 'Đêm Giao thừa, xứ người vẫn là một ngày làm việc bình thường. Tan ca lúc mười giờ đêm, bạn mở video call: cả nhà quây quần bên mâm cỗ, mẹ cố cười mà mắt đỏ hoe, bố hỏi “Bên đó có lạnh không con?”. Phòng ký túc treo mấy cành mai giấy, ai nấy đều im lặng.',
      scene: { loc: 'bedroom', time: 'night', weather: 'cloudy', decor: 'tet', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'coworker', anim: 'sit', say: 'Ăn tạm bánh chưng hút chân không nè!' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Gửi hết tiền thưởng về sửa nhà',
          text: 'Bạn chuyển khoản {money:120000000} về quê. Tháng sau, mẹ gửi ảnh mái nhà mới lợp tôn đỏ au, kèm dòng tin nhắn: “Con đừng làm quá sức nghe con.”',
          effects: { money: -120000000, karma: 8, happy: 6, followUp: { id: 's_work_xkld_return', delay: 1 } },
          scene: { anim: 'cry', fx: 'hearts', npcAnim: { coworker: 'hug' } } },
        { label: 'Mua vé bay về ăn Tết, đắt mấy cũng mua',
          text: 'Vé máy bay mùa Tết {money:25000000}, mất thêm cả tuần lương. Nhưng khoảnh khắc mẹ ôm chầm lấy bạn ở cổng nhà, bạn biết mình chẳng tiếc đồng nào.',
          effects: { money: -25000000, happy: 12, followUp: { id: 's_work_xkld_return', delay: 1 } },
          scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'hug', fx: 'petals', npcAnim: { coworker: 'hug' } } },
        { label: 'Rủ cả phòng gói bánh chưng bằng lá chuối',
          text: 'Lá chuối mua ở chợ châu Á thay lá dong, nồi cơm điện thay nồi đồng, sáu đứa xa nhà ngồi canh nồi bánh đến sáng. Bánh méo xệch, nhưng là cái Tết ấm nhất đời bạn.',
          effects: { money: -2000000, happy: 8, karma: 2, followUp: { id: 's_work_xkld_return', delay: 1 } },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { coworker: 'laugh' } } },
        { label: 'Không chịu nổi nữa, xin về nước luôn',
          text: 'Bạn xin chấm dứt hợp đồng sớm. Ngày về, va li nhẹ tênh, tiền dành dụm chỉ đủ trả nốt món nợ phí môi giới. Có những thứ đắt hơn tiền, và bạn đã chọn chúng.',
          effects: { money: -60000000, happy: 4, job: 'fire', flag: 's_work_xkld_home' },
          scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'hug', fx: 'tears', npcAnim: { coworker: 'wave' } } }
      ]
    },
    {
      id: 's_work_xkld_return', title: 'Ngày về với va li đầy', icon: '🧳', age: [22, 55], chainOnly: true,
      text: 'Hết hợp đồng, bạn về nước với làn da sạm đi, đôi tay chai sạn và một tài khoản kha khá. Họ hàng kéo đến chật nhà: người hỏi mua gì, người hỏi vay bao nhiêu, người giới thiệu ngay một mảnh đất “sắp lên giá”. Câu hỏi lớn nhất: số vốn ba năm mồ hôi này sẽ làm gì?',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'sit', expr: 'happy',
        npcs: [{ role: 'relative', anim: 'talk', say: 'Giờ cháu tính làm gì với số vốn đó?' }, { role: 'crowd', anim: 'clap' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Mở quán cơm tấm kiểu Nhật – Việt',
          outcomes: [
            { p: 0.55, text: 'Quán đông nghịt dân văn phòng, món cơm tấm sườn sốt teriyaki thành đặc sản cả khu. Lần đầu tiên, bạn làm chủ chính cuộc đời mình.',
              effects: { money: 60000000, happy: 10, job: { hire: 'kinhdoanh' }, flag: 's_work_xkld_shop' },
              scene: { loc: 'market', anim: 'cook', fx: 'money', npcAnim: { relative: 'eat', crowd: 'eat' } } },
            { p: 0.45, text: 'Mặt bằng đắt, khách thưa, món lạ quá người ta không dám thử. Mười tháng sau bạn sang lại quán, mất gần nửa số vốn mang về.',
              effects: { money: -180000000, happy: -10, job: 'fire', flag: 's_work_xkld_shop' },
              scene: { loc: 'market', anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'shake' } } }
          ] },
        { label: 'Làm phiên dịch, dẫn đường cho người đi sau', req: { flag: 's_work_xkld_lang' },
          text: 'Vốn tiếng bạn chắt chiu từng đêm giờ thành nghề. Bạn làm phiên dịch cho một công ty phái cử có giấy phép, và lúc nào cũng dặn người đi sau: “Đừng bao giờ đưa tiền cho cò.”',
          effects: { smarts: 3, happy: 8, karma: 6, job: { hire: 'phiendich' } },
          scene: { loc: 'office', anim: 'talk', fx: 'sparkle', npcAnim: { relative: 'clap', crowd: 'nod' } } },
        { label: 'Mua mảnh đất nhỏ, còn lại gửi tiết kiệm',
          text: 'Bạn mua một mảnh đất nhỏ đầu làng, phần còn lại gửi ngân hàng. Không giàu lên nhanh, nhưng đêm nào cũng ngủ ngon.',
          effects: { money: -300000000, happy: 6, job: 'fire', asset: { add: { type: 'land', name: 'Mảnh đất đầu làng', value: 350000000 } } },
          scene: { loc: 'countryside', anim: 'nod', fx: 'sparkle', npcAnim: { relative: 'nod', crowd: 'clap' } } },
        { label: 'Mua ô tô, mở tiệc khao cả xóm',
          text: 'Chiếc ô tô bóng loáng đậu chật cả ngõ, tiệc khao ba ngày ba đêm. Một năm sau, tiền tiêu gần hết, xe phải bán lại lỗ trăm triệu. Ba năm mồ hôi bay hơi nhanh hơn bạn tưởng.',
          effects: { money: -400000000, happy: 6, looks: 2, karma: -2, job: 'fire' },
          scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { relative: 'drink', crowd: 'cheer' } } }
      ]
    },

    // ======================= ARC 5: KHỞI NGHIỆP VỚI BẠN ĐẠI HỌC =======================
    {
      id: 's_work_startup_pitch', title: 'Ý tưởng lúc mười giờ đêm', icon: '💡', age: [22, 35], weight: 1.0,
      req: { job: true, degree: true, notFlag: 's_work_startup' },
      text: '{classmate}, bạn cùng phòng ký túc xá thời đại học, hẹn bạn ra quán cà phê lúc mười giờ đêm rồi mở laptop: một ứng dụng đặt cơm tấm, bún bò từ các quán vỉa hè, giao trong mười lăm phút. “Tao lo công nghệ, mày lo kinh doanh. Mỗi đứa góp ba trăm triệu, năm năm nữa mình lên truyền hình gọi vốn!”',
      scene: { loc: 'cafe', time: 'night', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'classmate', anim: 'talk', say: 'Mày lo kinh doanh, tao lo công nghệ!' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Nghỉ việc, dốc hết vốn làm toàn thời gian',
          text: 'Bạn nộp đơn nghỉ ngay sáng hôm sau, rút sạch sổ tiết kiệm, vay thêm cho đủ {money:300000000}. Hai đứa thuê một văn phòng mười lăm mét vuông, dán lên tường tờ giấy: “Không thành công cũng thành... người có kinh nghiệm.”',
          effects: { money: -300000000, happy: 8, job: 'fire', flag: ['s_work_startup', 's_work_startup_all'], followUp: { id: 's_work_startup_office', delay: 1 } },
          scene: { loc: 'office', anim: 'cheer', fx: 'confetti', npcAnim: { classmate: 'cheer' } } },
        { label: 'Góp ít vốn, làm buổi tối và cuối tuần',
          text: 'Bạn góp {money:100000000}, ban ngày vẫn đi làm, tối về mở laptop đến hai giờ sáng. {classmate} hơi phụng phịu: “Mày một chân trong một chân ngoài thế à?”',
          effects: { money: -100000000, health: -3, happy: 3, flag: ['s_work_startup', 's_work_startup_half'], followUp: { id: 's_work_startup_office', delay: 1 } },
          scene: { anim: 'type', fx: 'zzz', npcAnim: { classmate: 'shrug' } } },
        { label: 'Phản biện từng lỗ hổng trong kế hoạch',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn chỉ ra phí giao hàng sẽ ăn hết lãi, rồi cùng {classmate} sửa mô hình thành phần mềm quản lý bán hàng cho quán ăn nhỏ. Kế hoạch mới chắc chắn hẳn, bạn góp {money:150000000} trong niềm tin.',
              effects: { money: -150000000, smarts: 4, happy: 5, flag: ['s_work_startup', 's_work_startup_smart'], followUp: { id: 's_work_startup_office', delay: 1 } },
              scene: { anim: 'point', fx: 'idea', npcAnim: { classmate: 'nod' } } },
            { text: 'Bạn hỏi dồn đến mức {classmate} gập laptop: “Thôi, tao tìm người khác.” Một năm sau, bạn thấy ảnh nó trên báo, đứng cạnh một người đồng sáng lập mới, cười rất tươi.',
              effects: { happy: -6, flag: 's_work_startup' },
              scene: { anim: 'shrug', fx: 'question', npcAnim: { classmate: 'angry' } } }
          ] },
        { label: 'Từ chối: “Đời đâu phải phim”',
          text: 'Bạn vỗ vai {classmate}: “Tao ủng hộ tinh thần, còn tiền thì... tao cũng ủng hộ tinh thần.” Hai đứa cười phá lên rồi gọi thêm hai ly bạc xỉu.',
          effects: { happy: 2, flag: 's_work_startup' },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { classmate: 'laugh' } } }
      ]
    },
    {
      id: 's_work_startup_office', title: 'Văn phòng mười lăm mét vuông', icon: '🚀', age: [22, 45], chainOnly: true,
      text: 'Một năm khởi nghiệp: bạn và {classmate} ngủ trên ghế xếp ở văn phòng, ăn mì ly thay cơm, sửa sản phẩm ba lần, có hai mươi nghìn người dùng. Tài khoản công ty chỉ còn đủ trả lương ba nhân viên đúng hai tháng. Sáng mai là buổi gọi vốn với quỹ đầu tư của chị {stranger}.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'sleepy',
        npcs: [{ role: 'classmate', anim: 'sleep', say: 'Zzz... thêm nút đặt hàng...' }], fx: 'zzz', shot: 'top' },
      choices: [
        { label: 'Thức trắng chuốt từng slide, pitch hết mình',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn trình bày hai mươi phút, đỡ gọn mọi câu hỏi hóc búa. Chị {stranger} gập laptop: “Quỹ rót năm triệu đô, đổi hai mươi phần trăm cổ phần.” {classmate} ôm chầm lấy bạn ngay giữa phòng họp.',
              effects: { happy: 15, smarts: 3, flag: 's_work_startup_funded', followUp: { id: 's_work_startup_exit', delay: 2 } },
              scene: { time: 'day', anim: 'cheer', fx: 'fireworks', npcAnim: { classmate: 'hug' } } },
            { text: 'Chị {stranger} lắc đầu: “Các em chưa có doanh thu, chưa có lợi thế cạnh tranh.” Vừa bước ra khỏi phòng họp, {classmate} trách bạn trình bày dở. Bạn cãi lại. Lần đầu tiên hai đứa to tiếng.',
              effects: { happy: -8, followUp: { id: 's_work_startup_fight', delay: 0 } },
              scene: { time: 'day', anim: 'angry', fx: 'anger', npcAnim: { classmate: 'angry' } } }
          ] },
        { label: 'Vay nóng thêm, cầm cự sáu tháng nữa',
          outcomes: [
            { p: 0.4, text: 'Đúng tháng thứ năm, một chuỗi cà phê lớn ký hợp đồng dùng phần mềm của bạn cho ba trăm cửa hàng. Doanh thu tăng vọt, các quỹ đầu tư bắt đầu tự tìm đến.',
              effects: { money: -200000000, happy: 12, flag: 's_work_startup_funded', followUp: { id: 's_work_startup_exit', delay: 2 } },
              scene: { anim: 'jump', fx: 'confetti', npcAnim: { classmate: 'dance' } } },
            { p: 0.6, text: 'Sáu tháng trôi qua, tiền hết, người dùng không tăng, lãi vay nóng thì tăng từng ngày. {classmate} bắt đầu đi sớm về khuya, nghe điện thoại lén lút ngoài hành lang.',
              effects: { money: -200000000, happy: -8, health: -4, followUp: { id: 's_work_startup_fight', delay: 0 } },
              scene: { anim: 'think', fx: 'sweat', npcAnim: { classmate: 'phone' } } }
          ] },
        { label: 'Tự ý đổi hướng sang AI cho hợp trend',
          text: 'Bạn thức trắng viết lại bản pitch: “Nền tảng AI cho quán ăn”, không bàn với ai. Sáng hôm sau, {classmate} đọc slide trước giờ họp, mặt đỏ gay: “Mày quyết định mà không thèm hỏi tao à?”',
          effects: { happy: -3, smarts: 1, followUp: { id: 's_work_startup_fight', delay: 0 } },
          scene: { anim: 'type', fx: 'anger', npcAnim: { classmate: 'angry' } } },
        { label: 'Buông, quay lại đi làm thuê',
          text: 'Bạn nhìn {classmate} ngủ gục trên bàn rất lâu, rồi viết một lá thư dài xin rút. Vốn góp coi như học phí. Sáng hôm sau, bạn lặng lẽ cập nhật CV, lòng vừa nhẹ vừa đau.',
          effects: { happy: -8, smarts: 3, karma: -2, flag: 's_work_startup_quit' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { classmate: 'sleep' } } }
      ]
    },
    {
      id: 's_work_startup_fight', title: 'Cuộc cãi vã trong văn phòng trống', icon: '💥', age: [22, 50], chainOnly: true,
      text: 'Mười giờ đêm, văn phòng chỉ còn hai người. {classmate} ném tập hồ sơ xuống bàn: “Tao viết từng dòng code, mày chỉ biết nói! Chia năm mươi–năm mươi là không công bằng!” Nhân viên đã nghỉ gần hết, ngoài trời mưa tầm tã, và tình bạn mười năm đang đứng bên mép vực.',
      scene: { loc: 'office', time: 'night', weather: 'rain', anim: 'angry', expr: 'angry',
        npcs: [{ role: 'classmate', anim: 'angry', say: 'Năm mươi–năm mươi là không công bằng!' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Nhường bớt cổ phần, giữ lấy tình bạn',
          text: 'Bạn im lặng rất lâu, rồi ký nhượng cho {classmate} thêm mười phần trăm. Nó bật khóc, hai đứa ôm nhau giữa văn phòng bừa bộn. Công ty sống tiếp, nghèo nhưng đồng lòng.',
          effects: { happy: 4, karma: 6, flag: 's_work_startup_peace', followUp: { id: 's_work_startup_exit', delay: 2 } },
          scene: { anim: 'hug', fx: 'tears', npcAnim: { classmate: 'cry' } } },
        { label: 'Giành quyền điều hành, ai không phục thì đi',
          success: { stat: 'smarts', base: 0.25, scale: 0.45 },
          outcomes: [
            { text: 'Bạn thuyết phục được các cổ đông nhỏ và nhân viên chủ chốt. {classmate} ôm thùng đồ ra đi, không một lời chào. Công ty còn sống, nhưng chiếc bàn bên cạnh bạn lạnh tanh.',
              effects: { happy: -2, karma: -4, flag: 's_work_startup_solo', followUp: { id: 's_work_startup_exit', delay: 2 } },
              scene: { anim: 'point', fx: 'flash', npcAnim: { classmate: 'walk' } } },
            { text: 'Không ai đứng về phía bạn. Chính bạn mới là người ôm thùng đồ ra đi, mang theo chút cổ phần vô giá trị và một mối hận khó gọi tên.',
              effects: { happy: -12, karma: -2, flag: 's_work_startup_broke' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { classmate: 'shake' } } }
          ] },
        { label: 'Giải tán, chia đồ, mỗi đứa một ngả',
          text: 'Hai đứa thanh lý bàn ghế, chia nhau mấy cái màn hình cũ, gánh chung khoản nợ còn lại. Ngày trả văn phòng, {classmate} nói mà không nhìn bạn: “Xin lỗi nhé.” Bạn mất trắng vốn góp, và một người bạn.',
          effects: { money: -20000000, happy: -10, flag: 's_work_startup_broke' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { classmate: 'sad' } } },
        { label: 'Kéo nó ra quán nhậu, nói chuyện thật lòng',
          outcomes: [
            { p: 0.5, text: 'Ba chai bia, hai đĩa ốc, rồi cả hai cùng khóc như hồi thi trượt môn năm hai. Sáng hôm sau, hai đứa viết lại hợp đồng, rạch ròi từng phần trăm, và chiến tiếp.',
              effects: { happy: 8, karma: 3, flag: 's_work_startup_peace', followUp: { id: 's_work_startup_exit', delay: 2 } },
              scene: { loc: 'street', anim: 'drink', fx: 'tears', npcAnim: { classmate: 'drink' } } },
            { p: 0.5, text: 'Rượu vào lời ra, chuyện cũ chuyện mới lôi ra hết. Hai đứa đường ai nấy đi, công ty khép lại bằng đúng một tin nhắn: “Thôi, giải thể đi.”',
              effects: { happy: -10, health: -2, flag: 's_work_startup_broke' },
              scene: { loc: 'street', anim: 'angry', fx: 'heartbreak', npcAnim: { classmate: 'walk' } } }
          ] }
      ]
    },
    {
      id: 's_work_startup_exit', title: 'Lời đề nghị trên tầng 40', icon: '🏢', age: [24, 55], chainOnly: true,
      text: 'Hai năm sau, phần mềm của bạn đã có mặt ở năm nghìn quán ăn khắp cả nước. Một tập đoàn lớn gửi lời đề nghị mua lại toàn bộ công ty với cái giá đủ để cả đời bạn không phải lo cơm áo. Ông chủ tịch tập đoàn hẹn gặp ở tầng 40, chỉ tay xuống thành phố: “Bán đi, rồi đi du lịch vòng quanh thế giới.”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'boss', gender: 'm', age: 60, anim: 'point', say: 'Bán đi, rồi đi vòng quanh thế giới!' }, { role: 'crowd', anim: 'type' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Bán toàn bộ, nghỉ hưu sớm',
          text: 'Bạn ký. Tiền về tài khoản nhiều đến mức bạn đếm số 0 tới ba lần. Tối đó bạn về hẻm cũ, gọi một đĩa cơm tấm sườn bì chả — vẫn ngon y như hồi chưa có gì.',
          effects: { money: 12000000000, happy: 15, job: 'fire', flag: 's_work_startup_sold' },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { boss: 'clap', crowd: 'clap' } } },
        { label: 'Bán một nửa, ở lại làm cố vấn',
          text: 'Bạn bán năm mươi phần trăm, nhận về {money:5000000000}, ký hợp đồng ở lại cố vấn ba năm. Văn phòng mới có máy pha cà phê lẫn ghế massage, chỉ có điều giờ bạn lại có sếp.',
          effects: { money: 5000000000, happy: 8, smarts: 2, flag: 's_work_startup_sold' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'nod' } } },
        { label: 'Từ chối, mơ ngày lên sàn chứng khoán',
          outcomes: [
            { p: 0.35, text: 'Bạn từ chối. Ba năm sau, công ty gọi vốn vòng mới với định giá gấp ba. Bạn bán bớt một phần cổ phần và nhận về {money:25000000000}, đủ để các quỹ gọi bạn là “kỳ lân”.',
              effects: { money: 25000000000, happy: 15, smarts: 2, flag: 's_work_startup_sold' },
              scene: { anim: 'jump', fx: 'fireworks', npcAnim: { boss: 'facepalm', crowd: 'cheer' } } },
            { p: 0.65, text: 'Bạn từ chối. Năm sau, một đối thủ nước ngoài tràn vào, đốt tiền khuyến mãi không ngừng. Công ty cạn vốn, cuối cùng phải bán với giá bằng một phần mười lời đề nghị năm xưa.',
              effects: { money: 1200000000, happy: -10, flag: 's_work_startup_sold' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'laugh' } } }
          ] },
        { label: 'Đòi chia thưởng cho cả đội ngũ rồi mới ký',
          text: 'Bạn thêm một điều khoản: mỗi nhân viên từng gắn bó được nhận một khoản thưởng tương xứng. Phần của bạn bớt đi, nhưng hôm ký, cả văn phòng ôm nhau khóc. Giới khởi nghiệp nhắc mãi về “người sáng lập chịu chia”.',
          effects: { money: 9000000000, happy: 14, karma: 12, flag: 's_work_startup_sold' },
          scene: { anim: 'hug', fx: 'confetti', npcAnim: { boss: 'clap', crowd: 'cheer' } } }
      ]
    },
  );
})();
