/* Một Kiếp Người — biến cố nghề nghiệp: văn phòng & trí thức */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ============================ LUẬT SƯ ============================
    {
      id: 's_job_luatsu_thanchu', title: 'Thân chủ có tội nhưng trả giá cao', icon: '💼', age: [23, 65], weight: 1.6,
      req: { jobId: ['luatsu'] },
      text: 'Một doanh nhân đeo đồng hồ bạc tỷ ngồi đối diện bạn trong phòng họp kín. Ông ta bị khởi tố vì lừa đảo hàng trăm người mua nhà, và hồ sơ cho thấy ông ta có tội thật. Ông đẩy tờ séc sang: “Thù lao {money:3000000000}. Tôi chỉ cần trắng án, cách nào cũng được.”',
      scene: { loc: 'office', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 52, anim: 'talk', say: 'Cách nào cũng được. Tiền không thành vấn đề.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhận vụ, bào chữa đúng luật, không hơn',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bới ra từng sai sót tố tụng của bên điều tra, giúp thân chủ được giảm án đáng kể. Không trắng án, nhưng ông ta vẫn trả đủ tiền và giới luật sư bắt đầu nhắc tên bạn.',
              effects: { money: 1500000000, smarts: 3, happy: 5, looks: 2 },
              scene: { anim: 'nod', fx: 'money', npcAnim: { stranger: 'shrug' } } },
            { text: 'Chứng cứ quá rõ, thân chủ lĩnh án nặng. Ông ta chửi bạn “ăn hại”, chỉ trả nửa thù lao và nói xấu bạn khắp giới làm ăn.',
              effects: { money: 600000000, happy: -5 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { stranger: 'angry' }, npcSay: { stranger: 'Ăn hại! Tôi thuê anh làm gì?' } } }
          ] },
        { label: 'Nhận tiền, “xử lý” cả nhân chứng lẫn chứng cứ',
          text: 'Bạn gặp riêng từng nhân chứng, “hỗ trợ” họ sửa lời khai, và một tập hồ sơ quan trọng bỗng thất lạc. Thân chủ được tuyên trắng án vì không đủ chứng cứ. Tiền về tài khoản, nhưng đêm nào bạn cũng nghĩ về mấy trăm gia đình mất nhà.',
          effects: { money: 3000000000, karma: -18, happy: -2, flag: 'job_luatsu_gian', followUp: { id: 's_job_luatsu_lo', delay: 2 } },
          scene: { anim: 'drink', fx: 'money', npcAnim: { stranger: 'laugh' }, npcSay: { stranger: 'Luật sư giỏi đây rồi!' } } },
        { label: 'Khuyên ông ta nhận tội, bồi thường để giảm án',
          outcomes: [
            { p: 0.55, text: 'Ông ta cau có cả tuần rồi cũng nghe theo. Bị hại được bồi thường, án giảm một nửa. Một bà cụ trong số bị hại tìm đến tận văn phòng cảm ơn bạn.',
              effects: { money: 800000000, karma: 10, happy: 6 },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'nod' } } },
            { p: 0.45, text: 'Ông ta đứng phắt dậy: “Tôi thuê luật sư chứ không thuê thầy tu!” rồi đi thẳng sang hãng luật đối thủ.',
              effects: { karma: 5, happy: -3 },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { stranger: 'angry' } } }
          ] },
        { label: 'Từ chối thẳng, tiễn khách ra cửa',
          text: 'Bạn đẩy tờ séc trở lại. “Tôi bào chữa cho người, không bào chữa cho mọi giá.” Đồng nghiệp bảo bạn dại, nhưng tối đó bạn ngủ rất ngon.',
          effects: { karma: 12, happy: 3, smarts: 1 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'angry' } } }
      ]
    },
    {
      id: 's_job_luatsu_lo', title: 'Nhân chứng quay lại', icon: '🚨', age: [23, 70], chainOnly: true,
      req: { jobId: ['luatsu'], flag: 'job_luatsu_gian' },
      text: 'Hai năm sau vụ trắng án ồn ào, một nhân chứng cũ bị lương tâm cắn rứt đã đến cơ quan điều tra khai hết: ai đã “hướng dẫn” anh ta sửa lời khai. Sáng nay, hai {police.k} đứng chờ bạn ngay sảnh văn phòng.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Mời luật sư về trụ sở làm việc.' }, { role: 'police', anim: 'idle' }, { role: 'coworker', anim: 'phone', expr: 'surprised' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Thành khẩn khai báo, nộp lại tiền',
          text: 'Bạn khai hết và nộp lại toàn bộ thù lao. Nhờ thành khẩn, bạn chỉ bị án treo, nhưng Đoàn luật sư tước chứng chỉ hành nghề. Văn phòng xóa tên bạn khỏi biển hiệu.',
          effects: { money: -3000000000, karma: 8, happy: -15, looks: -5, job: 'fire', unflag: 'job_luatsu_gian' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { police: 'nod', coworker: 'shake' } } },
        { label: 'Chối bằng được, thuê luật sư giỏi nhất',
          success: { stat: 'money', base: 0.2, scale: 0.35 },
          outcomes: [
            { text: 'Đồng nghiệp đắt giá nhất thành phố cứu bạn thoát vì “lời khai mâu thuẫn”. Bạn mất gần hết số tiền năm xưa, và chẳng ai trong nghề còn tin bạn nữa.',
              effects: { money: -2000000000, happy: -8, karma: -5, looks: -3 },
              scene: { anim: 'think', fx: 'sweat', npcAnim: { police: 'shrug' } } },
            { text: 'Tòa tuyên bạn phạm tội “mua chuộc người làm chứng”, mất nghề, mất tiền và mất luôn tên tuổi. Ngày bạn bước ra khỏi tòa, phóng viên vây kín.',
              effects: { money: -3500000000, happy: -20, karma: -5, looks: -8, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'walk', coworker: 'phone' } } }
          ] }
      ]
    },
    {
      id: 's_job_luatsu_dedoa', title: 'Bị đe dọa vì vụ án', icon: '🔪', age: [23, 65], weight: 1.4,
      req: { jobId: ['luatsu'] },
      text: 'Bạn đang bảo vệ quyền lợi cho một nhóm hộ dân bị cưỡng chế đất trái luật. Tối nay vừa dắt xe ra khỏi văn phòng, một {thug.k} xăm trổ chặn đầu, gõ gõ lên yên xe: “Rút khỏi vụ đó đi. Nhà luật sư ở đâu bọn anh biết cả rồi.”',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thug', anim: 'point', say: 'Rút đi. Nhà em ở đâu anh biết rồi.' }, { role: 'thug', anim: 'idle' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Báo công an, vẫn theo vụ đến cùng',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Camera đầu phố ghi rõ mặt hai gã. Công an triệu tập, lần ra kẻ đứng sau. Bạn thắng kiện cho các hộ dân, báo chí gọi bạn là “luật sư không biết sợ”.',
              effects: { karma: 12, happy: 8, looks: 4, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', loc: 'office', time: 'day', npcAnim: { thug: 'scared' } } },
            { text: 'Vụ án thắng, nhưng một đêm kính xe bạn bị đập nát và bạn ngã trầy cả tay chân khi bỏ chạy. Công an vẫn đang truy tìm thủ phạm.',
              effects: { karma: 8, happy: -6, health: -8, illness: 'Chấn thương cơ' },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { thug: 'run' } } }
          ] },
        { label: 'Lặng lẽ rút khỏi vụ án',
          text: 'Bạn viện cớ sức khỏe để rút. Các hộ dân thua kiện, có người nhắn tin chỉ một chữ: “Hèn.” Bạn đọc đi đọc lại tin nhắn ấy suốt một tuần.',
          effects: { karma: -8, happy: -8 },
          scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { thug: 'laugh' } } },
        { label: 'Bật điện thoại quay thẳng mặt chúng',
          outcomes: [
            { p: 0.6, text: 'Bị ống kính chĩa vào mặt, hai gã chửi thề rồi bỏ đi. Đoạn video trở thành chứng cứ đanh thép trước tòa.',
              effects: { karma: 6, smarts: 3, happy: 4 },
              scene: { anim: 'phone', fx: 'flash', npcAnim: { thug: 'run' } } },
            { p: 0.4, text: 'Một gã giật phăng điện thoại đập xuống đường, đẩy bạn ngã sấp. Bạn mất máy, bầm tím cả tuần, nhưng càng quyết theo vụ đến cùng.',
              effects: { health: -10, happy: -5, karma: 4, money: -25000000 },
              scene: { anim: 'fall', fx: 'anger', npcAnim: { thug: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_luatsu_vuanlon', title: 'Vụ án lớn đầu tiên', icon: '⚖️', age: [23, 60], weight: 1.5,
      req: { jobId: ['luatsu'] },
      text: 'Lần đầu tiên bạn được giao bào chữa chính trong một vụ án cả nước theo dõi. Phòng xử chật kín, máy quay đặt kín hành lang. Đến lượt luật sư phát biểu, chủ tọa gật đầu với bạn.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'talk', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'm', age: 58, anim: 'sit', say: 'Mời luật sư bào chữa trình bày.' }, { role: 'crowd', anim: 'sit' }, { role: 'police', anim: 'idle' }], fx: 'exclaim', shot: 'orbit' },
      choices: [
        { label: 'Thức trắng ba đêm, chuẩn bị đến từng con chữ',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bản luận cứ của bạn chặt như đinh đóng cột, hội đồng xét xử chấp nhận gần hết đề nghị. Trên mạng, đoạn bạn phát biểu được chia sẻ hàng chục nghìn lần. Hãng luật đề bạt bạn ngay tuần sau.',
              effects: { smarts: 4, happy: 12, looks: 5, money: 200000000, job: 'promote' },
              scene: { anim: 'bow', fx: 'levelup', npcAnim: { crowd: 'clap' } } },
            { text: 'Đến giữa phần tranh luận, bạn khựng lại vì một câu hỏi bất ngờ của viện kiểm sát. Vụ án thua, nhưng bạn đã học được bài học đắt giá nhất đời luật sư.',
              effects: { smarts: 5, happy: -6, health: -3 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'shake' } } }
          ] },
        { label: 'Chơi bài cảm xúc, nói thật hay cho máy quay',
          outcomes: [
            { p: 0.45, text: 'Bài phát biểu nghẹn ngào khiến cả phòng xử lặng đi. Bạn nổi tiếng chỉ sau một đêm, khách hàng gọi đến cháy máy.',
              effects: { looks: 8, happy: 8, money: 150000000 },
              scene: { anim: 'talk', fx: 'stars', npcAnim: { crowd: 'clap' } } },
            { p: 0.55, text: 'Chủ tọa nhắc nhở: “Luật sư tập trung vào chứng cứ.” Cả phòng cười khúc khích, và clip đó lên mạng với tiêu đề không mấy dễ chịu.',
              effects: { looks: -3, happy: -6 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] }
      ]
    },
    // ============================ NHÀ BÁO ============================
    {
      id: 's_job_nhabao_gobai', title: 'Bị mua chuộc để gỡ bài', icon: '✉️', age: [22, 65], weight: 1.6,
      req: { jobId: ['nhabao'] },
      text: 'Bài điều tra của bạn về một nhà máy xả thải trộm ra sông vừa lên trang nhất. Chiều đó, giám đốc nhà máy hẹn bạn ra quán cà phê, đặt lên bàn một phong bì dày cộp: “{money:500000000}, chỉ cần bài biến mất trước tối nay.”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'cloudy', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'talk', say: 'Gỡ bài đi, anh em mình còn gặp nhau dài.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhận phong bì, xin tòa soạn gỡ bài',
          text: 'Bạn viện cớ “thông tin cần xác minh thêm” để gỡ bài. Phong bì nằm gọn trong cốp xe. Nhưng ông giám đốc kia có thói quen ghi âm mọi cuộc gặp.',
          effects: { money: 500000000, karma: -15, happy: 2, flag: 'job_nhabao_nhantien', followUp: { id: 's_job_nhabao_lo', delay: 2 } },
          scene: { anim: 'nod', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Từ chối, viết luôn bài số hai về vụ mua chuộc',
          success: { stat: 'karma', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bài số hai kèm ảnh chụp phong bì làm dư luận dậy sóng. Nhà máy bị đình chỉ, bạn nhận giải báo chí và được lên biên tập viên.',
              effects: { karma: 12, happy: 10, looks: 4, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', loc: 'office', npcAnim: { stranger: 'angry' } } },
            { text: 'Bài số hai bị cấp trên “treo” vì nhà máy là đối tác quảng cáo lớn. Bạn giữ được lương tâm, nhưng bị chuyển sang mảng tin giải trí.',
              effects: { karma: 10, happy: -6 },
              scene: { anim: 'sad', fx: 'heartbreak', loc: 'office' } }
          ] },
        { label: 'Lịch sự từ chối, nhắc ông ta đây là hối lộ',
          text: 'Bạn đẩy phong bì lại, nói rõ từng chữ rằng đây là hành vi đưa hối lộ. Ông ta tái mặt, cất phong bì và rời quán. Bài báo vẫn nằm yên trên trang nhất.',
          effects: { karma: 8, happy: 3 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'walk' } } }
      ]
    },
    {
      id: 's_job_nhabao_lo', title: 'File ghi âm định mệnh', icon: '🎙️', age: [22, 70], chainOnly: true,
      req: { jobId: ['nhabao'], flag: 'job_nhabao_nhantien' },
      text: 'Nhà máy năm xưa bị khởi tố vì tội gây ô nhiễm. Trong đống tài liệu thu giữ có một file ghi âm: giọng bạn, tiếng phong bì sột soạt và câu “Tối nay em gỡ”. Cơ quan điều tra mời bạn lên làm việc.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'talk', say: 'Đây là giọng của anh/chị phải không?' }, { role: 'boss', anim: 'facepalm' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Nhận hết, nộp lại tiền',
          text: 'Bạn nộp lại toàn bộ số tiền và bị thu hồi thẻ nhà báo. Tòa soạn ra thông báo chấm dứt hợp đồng. Tên bạn xuất hiện trên chính những tờ báo bạn từng viết.',
          effects: { money: -500000000, karma: 6, happy: -15, looks: -6, job: 'fire', unflag: 'job_nhabao_nhantien' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { boss: 'shake' } } },
        { label: 'Chối: “Đó là giọng người khác”',
          outcomes: [
            { p: 0.3, text: 'Giám định giọng nói không đủ kết luận. Bạn thoát tội, nhưng tòa soạn lặng lẽ cho bạn nghỉ, không ai dám thuê lại.',
              effects: { happy: -8, karma: -5, job: 'fire' },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.7, text: 'Giám định khớp 99%. Bạn lĩnh án vì “nhận hối lộ”, mất nghề, mất tiền, mất luôn những người bạn trong nghề.',
              effects: { money: -700000000, happy: -20, karma: -5, looks: -8, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_nhabao_duongday', title: 'Điều tra đường dây phạm pháp', icon: '🕵️', age: [22, 60], weight: 1.5,
      req: { jobId: ['nhabao'], notFlag: 'job_nhabao_duongday' },
      text: 'Một nguồn tin gửi cho bạn qua Zalo hàng loạt ảnh chụp: một đường dây tín dụng đen cho sinh viên vay lãi 300%/năm, đòi nợ bằng cách khủng bố người thân. Muốn có bằng chứng, chỉ còn cách đóng vai con nợ để thâm nhập.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'neutral',
        npcs: [{ role: 'boss', anim: 'think', say: 'Nguy hiểm lắm đấy. Em chắc chưa?' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Đóng vai con nợ, thâm nhập đường dây',
          text: 'Bạn mượn tên giả, vay {money:10000000} và đeo camera cúc áo đến “văn phòng tài chính” của bọn chúng. Ba tháng sau, trong tay bạn có hàng giờ video và sổ sách ghi nợ.',
          effects: { smarts: 4, happy: 2, flag: 'job_nhabao_duongday', followUp: { id: 's_job_nhabao_dedoa', delay: 0 } },
          scene: { anim: 'phone', fx: 'exclaim', loc: 'street', time: 'night', npcAnim: { boss: 'nod' } } },
        { label: 'Chuyển nguồn tin cho công an trước',
          outcomes: [
            { p: 0.6, text: 'Công an phối hợp với bạn, cho phép bạn đi cùng mũi tác nghiệp. Bạn có bài độc quyền mà không phải liều mạng.',
              effects: { karma: 6, smarts: 2, happy: 5, looks: 2 },
              scene: { anim: 'nod', fx: 'sparkle' } },
            { p: 0.4, text: 'Hồ sơ nằm chờ mãi. Ba tháng sau, một tờ báo khác đăng trước vụ việc, bạn chỉ còn biết tiếc.',
              effects: { karma: 3, happy: -5 },
              scene: { anim: 'facepalm', fx: 'question' } }
          ] },
        { label: 'Bỏ qua, chuyện này quá nguy hiểm',
          text: 'Bạn gửi lại nguồn tin một câu xin lỗi. Hai tháng sau, báo đưa tin một sinh viên bị đòi nợ đến mức phải bỏ học. Bạn đọc mà thấy nghẹn.',
          effects: { karma: -4, happy: -5 },
          scene: { anim: 'sad', fx: 'heartbreak' } }
      ]
    },
    {
      id: 's_job_nhabao_dedoa', title: 'Lời đe dọa trước ngày lên bài', icon: '⚠️', age: [22, 65], chainOnly: true,
      req: { jobId: ['nhabao'], flag: 'job_nhabao_duongday' },
      text: 'Đêm trước khi loạt bài lên khuôn, một {thug.k} chặn bạn ngay đầu hẻm, ném xuống chân bạn một con dao gọt hoa quả. “Bài đó mà lên, mày tự biết hậu quả.” Rồi hắn nổ máy phóng đi, để lại mùi xăng khét lẹt.',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thug', anim: 'point', say: 'Bài mà lên, mày tự biết hậu quả!' }, { role: 'thug', anim: 'idle' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Báo công an, vẫn cho bài lên đúng hẹn',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Loạt bài lên trang nhất cùng lúc công an ập vào đường dây. Mười bảy đối tượng bị bắt. Bạn nhận Giải Báo chí Quốc gia và được đề bạt ngay sau đó.',
              effects: { karma: 15, happy: 12, looks: 6, money: 100000000, job: 'promote', unflag: 'job_nhabao_duongday' },
              scene: { anim: 'cheer', fx: 'fireworks', loc: 'office', time: 'day', npcAnim: { thug: 'scared' } } },
            { text: 'Bài vẫn lên và đường dây bị triệt phá, nhưng bạn bị đánh hội đồng một đêm trên đường về. Vài tuần nằm viện, rồi bạn quay lại tòa soạn trong tiếng vỗ tay của cả phòng.',
              effects: { karma: 12, happy: 2, health: -15, looks: 3, illness: 'Chấn thương cơ', unflag: 'job_nhabao_duongday' },
              scene: { anim: 'sick', fx: 'stars', loc: 'hospital', npcAnim: { thug: 'run' } } }
          ] },
        { label: 'Đăng ẩn danh bằng bút danh khác',
          text: 'Bài lên dưới bút danh lạ, đường dây vẫn bị triệt phá. Không ai biết người viết là bạn, và bạn cũng chẳng cần ai biết.',
          effects: { karma: 10, smarts: 3, happy: 5, unflag: 'job_nhabao_duongday' },
          scene: { anim: 'type', fx: 'sparkle', loc: 'office', time: 'day' } },
        { label: 'Hủy bài, xóa hết dữ liệu',
          text: 'Bạn xóa sạch ổ cứng trong một đêm run rẩy. Đường dây vẫn hoạt động, và mỗi lần thấy tin sinh viên bị đòi nợ, bạn lại nhớ cái đêm đầu hẻm ấy.',
          effects: { karma: -8, happy: -10, unflag: 'job_nhabao_duongday' },
          scene: { anim: 'cry', fx: 'tears', loc: 'bedroom' } }
      ]
    },
    {
      id: 's_job_nhabao_tinnong', title: 'Tin nóng nhưng chưa kiểm chứng', icon: '🔥', age: [22, 65], weight: 1.4, once: false, cooldown: 3,
      req: { jobId: ['nhabao'] },
      text: 'Một nguồn tin quen gửi ảnh chụp “văn bản mật”: một ca sĩ nổi tiếng sắp bị khởi tố. Các trang khác chưa ai có. Thư ký tòa soạn giục: “Lên ngay đi em, chậm năm phút là mất view!”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'type', expr: 'surprised',
        npcs: [{ role: 'boss', anim: 'point', say: 'Lên bài ngay! Chậm là mất view!' }, { role: 'coworker', anim: 'phone' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Đăng ngay, giật tít thật kêu',
          outcomes: [
            { p: 0.4, text: 'Tin chính xác! Bài của bạn đạt hai triệu lượt đọc, cả tòa soạn ăn mừng. Bạn được thưởng nóng.',
              effects: { money: 30000000, happy: 8, looks: 3 },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { boss: 'clap' } } },
            { p: 0.6, text: 'Văn bản là giả. Ca sĩ kia kiện tòa soạn, bài bị gỡ kèm lời xin lỗi công khai. Bạn bị kỷ luật và trừ lương ba tháng.',
              effects: { money: -40000000, happy: -10, karma: -4, looks: -3 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Gọi xác minh ba nguồn rồi mới đăng',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn phát hiện văn bản bị cắt ghép. Trong khi mấy trang khác đăng rồi phải gỡ, tòa soạn bạn được khen “tỉnh táo”. Sếp nhìn bạn bằng con mắt khác.',
              effects: { smarts: 3, karma: 5, happy: 6, job: 'raise' },
              scene: { anim: 'nod', fx: 'idea', npcAnim: { boss: 'nod' } } },
            { text: 'Xác minh xong thì tin đã thật, nhưng trang khác đăng trước cả tiếng. Sếp càu nhàu cả buổi chiều.',
              effects: { smarts: 2, happy: -3 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Từ chối đăng tin đời tư chưa rõ ràng',
          text: 'Bạn nói thẳng: chưa kiểm chứng thì không đăng. Sếp lườm nguýt, nhưng sau vụ đó mấy đồng nghiệp trẻ bắt đầu hỏi bạn cách làm nghề.',
          effects: { karma: 6, happy: 1 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { boss: 'facepalm' } } }
      ]
    },
    // ========================== NGÂN HÀNG ==========================
    {
      id: 's_job_nganhang_baohiem', title: 'Áp chỉ tiêu bán bảo hiểm', icon: '📑', age: [22, 60], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['nganhang'] },
      text: 'Cuộc họp giao ban sáng thứ Hai: mỗi người phải bán đủ 15 hợp đồng bảo hiểm nhân thọ trong quý, “ai không đạt thì tự hiểu”. Đúng lúc đó, một bác nông dân vào quầy xin vay {money:200000000} để sửa nhà.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'neutral',
        npcs: [{ role: 'boss', anim: 'point', say: 'Quý này 15 hợp đồng, không bàn cãi!' }, { role: 'stranger', gender: 'm', age: 60, anim: 'sit', say: 'Cháu ơi, bác muốn vay sửa nhà.' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Gài bảo hiểm vào hồ sơ vay, “không mua khó duyệt lắm bác ạ”',
          text: 'Bác nông dân ký cả hai mà chẳng hiểu mình vừa mua gì. Bạn đạt chỉ tiêu sớm nhất phòng, nhận thưởng, nhưng nhìn dáng bác lom khom đi ra mà lòng thấy gợn.',
          effects: { money: 25000000, karma: -8, happy: 2, job: 'raise' },
          scene: { anim: 'type', fx: 'money', npcAnim: { stranger: 'nod', boss: 'clap' } } },
        { label: 'Tự bỏ tiền mua vài hợp đồng cho đủ số',
          text: 'Bạn mua ba hợp đồng đứng tên bố mẹ, anh chị. Chỉ tiêu đủ, nhưng tháng nào lương cũng bị trừ một khoản phí bảo hiểm to đùng.',
          effects: { money: -45000000, happy: -4 },
          scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'nod' } } },
        { label: 'Chỉ tư vấn đúng người cần, chấp nhận thiếu chỉ tiêu',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chịu khó tìm khách doanh nhân thực sự có nhu cầu. Hợp đồng ít nhưng giá trị lớn, cuối quý vẫn vượt chỉ tiêu mà không phải lừa ai.',
              effects: { karma: 6, smarts: 3, happy: 6, job: 'raise' },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { boss: 'clap' } } },
            { text: 'Cuối quý bạn chỉ đạt 6 trên 15. Bị xếp loại kém, cắt thưởng, nhưng bác nông dân thì vay được tiền mà không mất thêm đồng nào.',
              effects: { karma: 8, happy: -5, money: -15000000 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { boss: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_nganhang_bontron', title: 'Khách vay bỏ trốn', icon: '🏃', age: [22, 60], weight: 1.4,
      req: { jobId: ['nganhang'] },
      text: 'Khoản vay {money:3000000000} bạn thẩm định cho một chủ xưởng gỗ đã quá hạn ba kỳ. Bạn đến tận nơi thì xưởng đóng cửa, hàng xóm bảo ông ta đã “bay” sang nước ngoài từ tuần trước. Tài sản thế chấp hóa ra đã bị cầm cố ở một nơi khác.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'facepalm', expr: 'scared',
        npcs: [{ role: 'neighbor', anim: 'shrug', say: 'Ông ấy đi nước ngoài rồi, cả nhà luôn!' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Báo cáo trung thực, nhận phần trách nhiệm',
          text: 'Bạn viết báo cáo rõ ràng từng bước thẩm định và chỗ mình sơ suất. Bạn bị kỷ luật khiển trách, trừ thưởng cả năm, nhưng ban giám đốc ghi nhận sự thẳng thắn.',
          effects: { money: -60000000, karma: 6, happy: -6, smarts: 2 },
          scene: { anim: 'bow', fx: 'sweat', loc: 'office' } },
        { label: 'Lần theo dấu vết, tự đi đòi nợ',
          success: { stat: 'smarts', base: 0.3, scale: 0.45 },
          outcomes: [
            { text: 'Bạn lần ra ông ta còn một lô đất đứng tên em vợ. Ngân hàng khởi kiện, thu hồi được phần lớn khoản vay. Bạn được khen trước toàn chi nhánh.',
              effects: { smarts: 4, happy: 8, job: 'promote' },
              scene: { anim: 'cheer', fx: 'levelup', loc: 'office' } },
            { text: 'Bạn chạy khắp ba tỉnh mà không lần ra manh mối nào. Khoản nợ thành nợ xấu, bạn bị chuyển xuống làm giao dịch viên.',
              effects: { happy: -10, health: -3, money: -30000000 },
              scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Sửa lại hồ sơ thẩm định cho “đẹp” để thoát tội',
          outcomes: [
            { p: 0.5, text: 'Không ai phát hiện, cấp trên chịu trách nhiệm thay bạn. Bạn thoát, nhưng mỗi lần kiểm toán về, tim bạn lại đập thình thịch.',
              effects: { karma: -10, happy: -2 },
              scene: { anim: 'type', fx: 'sweat', loc: 'office' } },
            { p: 0.5, text: 'Kiểm toán nội bộ so file gốc trên hệ thống, phát hiện chỉnh sửa. Bạn bị buộc thôi việc vì “làm sai lệch hồ sơ tín dụng”.',
              effects: { karma: -10, happy: -15, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', loc: 'office' } }
          ] }
      ]
    },
    {
      id: 's_job_nganhang_gianlan', title: 'Phát hiện giao dịch gian lận', icon: '🔍', age: [22, 60], weight: 1.5,
      req: { jobId: ['nganhang'] },
      text: 'Đối soát cuối ngày, bạn thấy hàng chục lệnh rút tiền từ sổ tiết kiệm của các cụ già, đều do một người duyệt: {coworker}, trưởng nhóm của bạn. Chưa kịp nghĩ gì thì {coworker} đã kéo ghế ngồi cạnh, cười nhẹ: “Em thấy rồi hả? Chia em 20% nhé.”',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'surprised',
        npcs: [{ role: 'coworker', anim: 'talk', say: 'Chia em 20%. Im lặng là vàng.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Báo cáo ngay lên kiểm soát nội bộ',
          success: { stat: 'karma', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Kiểm soát nội bộ vào cuộc, {coworker} bị bắt, các cụ được hoàn lại tiền. Ngân hàng khen thưởng bạn và đưa bạn lên thay vị trí trưởng nhóm.',
              effects: { karma: 12, happy: 10, money: 50000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'scared' } } },
            { text: 'Hồ sơ bị chặn lại ở đâu đó. Một tháng sau, bạn bị điều xuống phòng giao dịch huyện “để luân chuyển cán bộ”. Nhưng ít ra các cụ đã được cảnh báo.',
              effects: { karma: 10, happy: -8 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { coworker: 'laugh' } } }
          ] },
        { label: 'Nhận phần chia, giữ im lặng',
          text: 'Mỗi tháng, một khoản {money:80000000} chảy vào tài khoản của người em họ bạn. Bạn mua được xe mới, nhưng chẳng dám nhìn thẳng vào mắt các cụ khi họ ra quầy.',
          effects: { money: 400000000, karma: -18, flag: 'job_nganhang_chia', followUp: { id: 's_job_nganhang_thanhtra', delay: 2 } },
          scene: { anim: 'nod', fx: 'money', npcAnim: { coworker: 'laugh' } } },
        { label: 'Giả vờ không thấy gì',
          text: 'Bạn tắt màn hình, về nhà sớm. Một năm sau đường dây bị phanh phui, và bạn bị kỷ luật vì “thiếu trách nhiệm trong đối soát”.',
          effects: { karma: -6, happy: -6, money: -20000000 },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { coworker: 'nod' } } }
      ]
    },
    {
      id: 's_job_nganhang_thanhtra', title: 'Thanh tra Ngân hàng Nhà nước', icon: '🚔', age: [22, 70], chainOnly: true,
      req: { jobId: ['nganhang'], flag: 'job_nganhang_chia' },
      text: 'Một cụ bà phát hiện sổ tiết kiệm trống trơn và làm đơn tố cáo. Thanh tra Ngân hàng Nhà nước cùng cơ quan điều tra vào chi nhánh, niêm phong máy tính. {coworker} đã bị bắt từ sáng, và anh ta đang khai.',
      scene: { loc: 'office', time: 'day', weather: 'storm', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Mời anh/chị theo chúng tôi về làm việc.' }, { role: 'police', anim: 'idle' }, { role: 'crowd', anim: 'phone' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Khai báo thành khẩn, nộp lại toàn bộ',
          text: 'Bạn nộp lại tiền, khai rõ mọi giao dịch. Nhờ tình tiết giảm nhẹ, bạn nhận án treo nhưng bị đuổi việc và cấm làm ngành ngân hàng.',
          effects: { money: -400000000, karma: 8, happy: -15, job: 'fire', unflag: 'job_nganhang_chia' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Đổ hết cho {coworker}',
          outcomes: [
            { p: 0.25, text: 'Dòng tiền đi qua tài khoản người em họ nên khó chứng minh. Bạn thoát tội hình sự, nhưng vẫn mất việc và mang tiếng cả đời.',
              effects: { karma: -6, happy: -10, job: 'fire' },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.75, text: 'Sao kê không biết nói dối. Bạn lĩnh án vì đồng phạm tham ô tài sản, mất việc, mất tiền và mất luôn tự do mấy năm trời.',
              effects: { money: -600000000, karma: -5, happy: -25, health: -5, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'walk' } } }
          ] }
      ]
    },
    // =========================== KẾ TOÁN ===========================
    {
      id: 's_job_ketoan_haimat', title: 'Sếp nhờ làm sổ sách hai mặt', icon: '📒', age: [22, 60], weight: 1.6,
      req: { jobId: ['ketoan'] },
      text: 'Giám đốc {boss} gọi bạn vào phòng, đóng cửa, kéo rèm. “Từ quý này em làm hai bộ sổ: một bộ nộp thuế, một bộ cho anh xem. Doanh thu khai bớt đi một nửa. Cuối năm anh thưởng em {money:200000000}.”',
      scene: { loc: 'office', time: 'dusk', weather: 'cloudy', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'boss', gender: 'm', age: 48, anim: 'talk', say: 'Hai bộ sổ. Chuyện này chỉ anh em mình biết.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Gật đầu, làm hai bộ sổ',
          text: 'Bạn mở thêm một file Excel tên “Nháp”. Mỗi tháng, hàng tỷ đồng doanh thu biến mất khỏi tờ khai. Cuối năm, phong bì thưởng dày đúng như lời hứa.',
          effects: { money: 200000000, karma: -14, flag: 'job_ketoan_haimat', followUp: { id: 's_job_ketoan_lo', delay: 2 } },
          scene: { anim: 'type', fx: 'money', npcAnim: { boss: 'laugh' } } },
        { label: 'Từ chối, giải thích rủi ro pháp lý cho sếp',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn chỉ cho sếp thấy mức phạt và án hình sự, rồi đưa ra phương án tối ưu thuế hợp pháp tiết kiệm được kha khá. Sếp gật gù, từ đó giao bạn lo toàn bộ tài chính.',
              effects: { smarts: 4, karma: 6, happy: 6, job: 'promote' },
              scene: { anim: 'point', fx: 'idea', npcAnim: { boss: 'nod' } } },
            { text: 'Sếp nghe xong lạnh lùng: “Em không làm thì có người khác làm.” Tháng sau, bạn nhận quyết định chấm dứt hợp đồng.',
              effects: { karma: 8, happy: -10, job: 'fire' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Giả vờ đồng ý, âm thầm giữ bằng chứng',
          text: 'Bạn làm theo nhưng lưu lại mọi chỉ đạo của sếp qua email và tin nhắn. Phong bì vẫn nhận, nhưng bạn biết mình đang đi trên dây.',
          effects: { money: 200000000, karma: -6, smarts: 3, flag: ['job_ketoan_haimat', 'job_ketoan_bangchung'], followUp: { id: 's_job_ketoan_lo', delay: 2 } },
          scene: { anim: 'phone', fx: 'sweat', npcAnim: { boss: 'nod' } } }
      ]
    },
    {
      id: 's_job_ketoan_lo', title: 'Cuốn sổ thứ hai', icon: '🧾', age: [22, 70], chainOnly: true,
      req: { jobId: ['ketoan'], flag: 'job_ketoan_haimat' },
      text: 'Cục Thuế đối chiếu hóa đơn điện tử và phát hiện doanh thu “bốc hơi” hàng chục tỷ. Đoàn thanh tra cùng công an kinh tế ập vào, yêu cầu bạn, kế toán, giải trình từng con số. Giám đốc {boss} thì đã “đi công tác” không liên lạc được.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Bộ sổ thứ hai để ở đâu?' }, { role: 'stranger', gender: 'f', age: 45, anim: 'type' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Nộp toàn bộ bằng chứng chỉ đạo của sếp', req: { flag: 'job_ketoan_bangchung' },
          text: 'Email, tin nhắn, ghi âm, tất cả đều chỉ về giám đốc {boss}. Bạn được xác định là người làm theo chỉ đạo, chỉ bị phạt hành chính và nộp lại tiền thưởng. Công ty sụp, nhưng bạn giữ được tự do.',
          effects: { money: -200000000, karma: 6, happy: -6, smarts: 2, job: 'fire', unflag: ['job_ketoan_haimat', 'job_ketoan_bangchung'] },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { police: 'nod' } } },
        { label: 'Khai thật mọi chuyện',
          text: 'Bạn khai hết, nộp lại tiền thưởng. Vì là người trực tiếp lập sổ, bạn vẫn bị truy cứu và nhận án treo, mất chứng chỉ hành nghề kế toán.',
          effects: { money: -200000000, karma: 6, happy: -15, looks: -3, job: 'fire', unflag: 'job_ketoan_haimat' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Xóa file, nói “em không biết gì”',
          outcomes: [
            { p: 0.2, text: 'May mắn, máy chủ cũ đã hỏng ổ cứng. Bạn thoát tội nhưng bị cho nghỉ việc vì công ty bị đình chỉ.',
              effects: { karma: -6, happy: -8, job: 'fire' },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.8, text: 'Chuyên gia khôi phục dữ liệu chỉ mất hai ngày. Bạn bị khởi tố thêm tội tiêu hủy chứng cứ, lĩnh án tù và mất trắng sự nghiệp.',
              effects: { money: -300000000, karma: -8, happy: -25, health: -5, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_ketoan_thanhtra', title: 'Thanh tra thuế', icon: '🗂️', age: [22, 60], weight: 1.5, once: false, cooldown: 4,
      req: { jobId: ['ketoan'] },
      text: 'Đoàn thanh tra thuế về làm việc đột xuất, yêu cầu giải trình chứng từ ba năm gần nhất. Kho lưu trữ thì ẩm mốc, vài bộ hóa đơn thất lạc. Một anh trong đoàn nói nhỏ: “Có cách cho nhanh gọn, em hiểu ý anh chứ?”',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'think', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 47, anim: 'talk', say: 'Có cách cho nhanh gọn, em hiểu chứ?' }, { role: 'boss', anim: 'facepalm' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Thức trắng một tuần, tìm lại đủ chứng từ',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn lục từng hộp hồ sơ, xin lại bản sao từ nhà cung cấp. Biên bản thanh tra sạch đẹp, sếp thưởng nóng và tăng lương cho bạn.',
              effects: { smarts: 3, health: -4, happy: 6, job: 'raise' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { boss: 'clap' } } },
            { text: 'Thiếu vài chứng từ, công ty bị truy thu {money:300000000} tiền thuế. Sếp không vui, nhưng ít ra mọi thứ minh bạch.',
              effects: { health: -5, happy: -6 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Chuẩn bị “phong bì” cho đoàn',
          outcomes: [
            { p: 0.55, text: 'Biên bản kết luận “không phát hiện sai phạm”. Sếp hài lòng, nhưng bạn biết mình vừa bước qua một lằn ranh.',
              effects: { karma: -10, happy: 2 },
              scene: { anim: 'nod', fx: 'money' } },
            { p: 0.45, text: 'Đúng hôm đó có thanh tra cấp trên đi kiểm tra chéo. Vụ đưa hối lộ bị lập biên bản, bạn bị đình chỉ công tác.',
              effects: { karma: -12, happy: -12, job: 'fire' },
              scene: { anim: 'scared', fx: 'flash', npcAnim: { stranger: 'scared' } } }
          ] },
        { label: 'Thành thật nhận thiếu sót, xin nộp bổ sung',
          text: 'Bạn thẳng thắn giải trình, xin gia hạn bổ sung chứng từ. Công ty nộp phạt nhẹ, đoàn thanh tra ghi nhận thái độ hợp tác.',
          effects: { karma: 5, happy: -2, smarts: 1 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'nod' } } }
      ]
    },
    {
      id: 's_job_ketoan_thatthoat', title: 'Phát hiện thất thoát', icon: '💸', age: [22, 60], weight: 1.4,
      req: { jobId: ['ketoan'] },
      text: 'Cộng sổ quỹ cuối năm, bạn thấy lệch gần {money:2000000000}. Lần theo từng phiếu chi, mọi dấu vết dẫn về {coworker}, thủ quỹ và là cháu ruột của giám đốc. Tối đó {coworker} nhắn: “Mai cà phê nói chuyện chút nhé.”',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'surprised',
        npcs: [{ role: 'coworker', anim: 'phone', expr: 'scared' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Lập báo cáo gửi thẳng hội đồng quản trị',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Hội đồng quản trị vào cuộc, tiền được thu hồi. Bạn được bổ nhiệm làm kế toán trưởng vì “trung thực và cẩn thận”.',
              effects: { karma: 10, happy: 10, smarts: 2, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'cry' } } },
            { text: 'Giám đốc bao che cho cháu, còn bạn bị gán tội “làm mất đoàn kết”. Bạn nghỉ việc, nhưng đi đâu cũng ngẩng cao đầu.',
              effects: { karma: 10, happy: -8, job: 'fire' },
              scene: { anim: 'sad', fx: 'heartbreak' } }
          ] },
        { label: 'Đi cà phê, “thỏa thuận” với {coworker}',
          outcomes: [
            { p: 0.5, text: '{coworker} đưa bạn {money:150000000} để im lặng. Sổ sách được “cân” lại khéo léo, mọi chuyện tạm êm.',
              effects: { money: 150000000, karma: -14 },
              scene: { anim: 'drink', fx: 'money', loc: 'cafe', npcAnim: { coworker: 'nod' } } },
            { p: 0.5, text: 'Năm sau kiểm toán độc lập phát hiện ra, bạn bị đuổi việc cùng {coworker} vì tội che giấu.',
              effects: { money: 150000000, karma: -14, happy: -12, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', loc: 'cafe', npcAnim: { coworker: 'cry' } } }
          ] },
        { label: 'Khuyên {coworker} tự hoàn trả trước khi quá muộn',
          outcomes: [
            { p: 0.6, text: '{coworker} òa khóc, kể chuyện nợ cờ bạc rồi bán nhà hoàn trả. Sổ sách cân lại, không ai phải vào tù. {coworker} nhắn cảm ơn bạn suốt nhiều năm.',
              effects: { karma: 12, happy: 5 },
              scene: { anim: 'hug', fx: 'sparkle', loc: 'cafe', npcAnim: { coworker: 'cry' } } },
            { p: 0.4, text: '{coworker} gật gù rồi biến mất cùng số tiền. Bạn là người chịu trận vì báo cáo chậm.',
              effects: { karma: 5, happy: -10, money: -50000000 },
              scene: { anim: 'facepalm', fx: 'question', loc: 'cafe' } }
          ] }
      ]
    },
    // ========================== MARKETING ==========================
    {
      id: 's_job_marketing_bocphot', title: 'Chiến dịch bị “bóc phốt”', icon: '💣', age: [22, 60], weight: 1.5,
      req: { jobId: ['marketing'] },
      text: 'Chiến dịch quảng cáo bạn phụ trách vừa lên sóng được hai ngày thì một tài khoản TikTok triệu follow “bóc”: khẩu hiệu bị cho là xúc phạm người miền Tây, còn hình ảnh thì giống y một quảng cáo nước ngoài. Bình luận chửi bới đổ về fanpage như thác lũ.',
      scene: { loc: 'office', time: 'night', weather: 'storm', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'angry', say: 'Hai mươi nghìn bình luận chửi! Xử lý ngay!' }, { role: 'coworker', anim: 'type', expr: 'scared' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Gỡ quảng cáo, đăng lời xin lỗi chân thành',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Lời xin lỗi viết khéo, kèm cam kết tài trợ cho một trường học ở Cần Thơ. Dư luận dịu xuống, báo chí còn khen thương hiệu “biết sai biết sửa”.',
              effects: { smarts: 3, karma: 5, happy: 4 },
              scene: { anim: 'type', fx: 'sparkle', npcAnim: { boss: 'nod' } } },
            { text: 'Lời xin lỗi bị chê “văn mẫu”, khủng hoảng kéo dài thêm hai tuần. Bạn bị cắt thưởng cả năm.',
              effects: { happy: -8, money: -30000000 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Thuê đội seeding vào “dập” dư luận',
          outcomes: [
            { p: 0.35, text: 'Hàng nghìn tài khoản ảo vào khen lấp đi những lời chê. Khủng hoảng trôi qua, nhưng bạn biết mình vừa dùng chiêu bẩn.',
              effects: { karma: -8, happy: 2 },
              scene: { anim: 'phone', fx: 'smoke' } },
            { p: 0.65, text: 'Cư dân mạng soi ra loạt tài khoản ảo bình luận y hệt nhau. Phốt chồng phốt, thương hiệu lên báo, còn bạn bị cho nghỉ việc để “nhận trách nhiệm”.',
              effects: { karma: -8, happy: -15, looks: -3, job: 'fire' },
              scene: { anim: 'cry', fx: 'anger', npcAnim: { boss: 'point' } } }
          ] },
        { label: 'Đổ hết lỗi cho agency bên ngoài',
          text: 'Thông cáo báo chí nói rõ “lỗi thuộc về đơn vị đối tác”. Công ty thoát, agency mất hợp đồng, và từ đó chẳng agency nào muốn làm việc với bạn nữa.',
          effects: { karma: -6, happy: -2, smarts: 1 },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { coworker: 'shake' } } }
      ]
    },
    {
      id: 's_job_marketing_cuopcong', title: 'Ý tưởng bị cướp công', icon: '🦊', age: [22, 60], weight: 1.4,
      req: { jobId: ['marketing'] },
      text: 'Ý tưởng chiến dịch Tết bạn ấp ủ cả tháng, chỉ kể với {coworker} trong giờ ăn trưa. Sáng nay, trong buổi họp với ban giám đốc, {coworker} đứng lên trình bày đúng ý tưởng đó, từng chữ, và nhận tràng pháo tay.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'angry',
        npcs: [{ role: 'coworker', anim: 'talk', say: 'Đây là ý tưởng em nghĩ suốt tuần qua ạ!' }, { role: 'boss', anim: 'clap' }, { role: 'crowd', anim: 'clap' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Mở file nháp có ngày tạo, chứng minh ngay tại chỗ',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bình tĩnh mở Google Docs, lịch sử chỉnh sửa ghi rõ từ một tháng trước. Cả phòng im phăng phắc. Giám đốc giao bạn làm trưởng dự án.',
              effects: { smarts: 3, happy: 10, job: 'promote' },
              scene: { anim: 'point', fx: 'levelup', npcAnim: { coworker: 'facepalm', boss: 'nod' } } },
            { text: 'Bạn lúng túng không tìm ra file, nói lắp bắp. Giám đốc nhíu mày: “Chuyện nội bộ hai em tự giải quyết.” Công lao vẫn thuộc về {coworker}.',
              effects: { happy: -8 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { coworker: 'laugh' } } }
          ] },
        { label: 'Nhịn, nhưng từ nay giữ kín mọi ý tưởng',
          text: 'Bạn nuốt cục tức. Từ đó, bạn chỉ trình bày ý tưởng trực tiếp với sếp, có email làm chứng. Một bài học đắt giá về văn phòng.',
          effects: { happy: -5, smarts: 3 },
          scene: { anim: 'sad', fx: 'idea' } },
        { label: 'Hỏi vặn {coworker} những chi tiết chỉ người nghĩ ra mới biết',
          outcomes: [
            { p: 0.6, text: '{coworker} trả lời ấp úng, mặt đỏ như gấc. Sếp hiểu ra mọi chuyện, cho bạn đứng tên chính trong dự án.',
              effects: { happy: 8, smarts: 2, karma: 2 },
              scene: { anim: 'laugh', fx: 'exclaim', npcAnim: { coworker: 'scared' } } },
            { p: 0.4, text: '{coworker} trả lời trơn tru vì đã học thuộc lời bạn kể. Bạn bị coi là ghen tị, không khí phòng căng như dây đàn.',
              effects: { happy: -6 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'shrug' } } }
          ] }
      ]
    },
    {
      id: 's_job_marketing_viral', title: 'Chiến dịch viral', icon: '🚀', age: [22, 60], weight: 1.4,
      req: { jobId: ['marketing'] },
      text: 'Đoạn clip quảng cáo kinh phí thấp bạn tự lên kịch bản bỗng thành trend: hàng triệu người trên TikTok nhảy theo, ca sĩ nổi tiếng cũng quay lại. Doanh số tăng gấp ba trong một tuần, điện thoại bạn rung không ngớt.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'cheer', expr: 'happy',
        npcs: [{ role: 'boss', anim: 'clap', say: 'Mười triệu view! Em là thiên tài!' }, { role: 'coworker', anim: 'dance' }, { role: 'crowd', anim: 'cheer' }], fx: 'confetti', shot: 'orbit' },
      choices: [
        { label: 'Tranh thủ đề xuất tăng lương ngay',
          success: { stat: 'smarts', base: 0.5, scale: 0.35 },
          outcomes: [
            { text: 'Đang lúc hưng phấn, giám đốc ký luôn quyết định thăng chức kèm tăng lương. Đúng là “rèn sắt khi còn nóng”.',
              effects: { happy: 12, money: 50000000, job: 'promote' },
              scene: { anim: 'jump', fx: 'money', npcAnim: { boss: 'nod' } } },
            { text: 'Giám đốc cười: “Để cuối năm xét em nhé.” Cuối năm, ngân sách bị cắt. Bạn chỉ nhận được một bằng khen.',
              effects: { happy: -3 },
              scene: { anim: 'shrug', fx: 'question', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Chia công cho cả team, mời mọi người đi ăn',
          text: 'Bạn nhường team lên nhận giải, bao cả phòng một bữa lẩu. Từ đó, ai trong phòng cũng sẵn sàng tăng ca cùng bạn.',
          effects: { karma: 8, happy: 8, money: -5000000 },
          scene: { anim: 'eat', fx: 'hearts', loc: 'cafe', npcAnim: { coworker: 'cheer', crowd: 'clap' } } },
        { label: 'Dùng cú viral làm hồ sơ, nhận lời agency lớn',
          text: 'Một agency đa quốc gia gọi ngay sau tuần đó. Bạn nộp đơn nghỉ và nhận chức trưởng nhóm với mức lương gấp rưỡi.',
          effects: { happy: 8, looks: 2, job: 'promote' },
          scene: { anim: 'wave', fx: 'sparkle', npcAnim: { boss: 'sad' } } }
      ]
    },
    // ========================= KIẾN TRÚC SƯ =========================
    {
      id: 's_job_kientrucsu_epsua', title: 'Chủ đầu tư ép sửa thiết kế', icon: '📏', age: [23, 65], weight: 1.5,
      req: { jobId: ['kientrucsu'] },
      text: 'Chủ đầu tư tòa chung cư đập bản vẽ xuống bàn: “Bỏ cái cầu thang thoát hiểm thứ hai đi, thêm hai tầng nữa, bán được thêm cả trăm tỷ. Giấy phép để anh lo.” Kèm theo là lời hứa thưởng {money:500000000} nếu bạn ký bản vẽ mới.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 55, anim: 'point', say: 'Bỏ cầu thang đó đi! Thêm hai tầng!' }, { role: 'boss', anim: 'shrug' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Ký bản vẽ mới, nhận thưởng',
          text: 'Bạn chỉnh bản vẽ trong một đêm. Tòa nhà cao thêm hai tầng, thiếu một lối thoát hiểm. Tiền thưởng về đủ, nhưng chữ ký của bạn nằm trên từng trang hồ sơ.',
          effects: { money: 500000000, karma: -15, flag: 'job_kientrucsu_vipham', followUp: { id: 's_job_kientrucsu_hauqua', delay: 2 } },
          scene: { anim: 'type', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Đề xuất phương án khác vừa lợi vừa an toàn',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn tối ưu lại mặt bằng, thêm được 30 căn hộ mà vẫn đủ hai cầu thang thoát hiểm. Chủ đầu tư phục sát đất, giao luôn dự án tiếp theo cho bạn chủ trì.',
              effects: { smarts: 4, happy: 10, karma: 4, job: 'promote' },
              scene: { anim: 'point', fx: 'idea', npcAnim: { stranger: 'clap' } } },
            { text: 'Chủ đầu tư phẩy tay: “Rườm rà!” rồi thuê văn phòng khác. Công ty mất hợp đồng lớn, sếp nhìn bạn đầy trách móc.',
              effects: { happy: -6, karma: 5 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'walk', boss: 'facepalm' } } }
          ] },
        { label: 'Từ chối thẳng: “Tôi không ký thứ có thể giết người”',
          text: 'Phòng họp im lặng. Chủ đầu tư bỏ về, công ty mất hợp đồng. Nhưng giới kiến trúc bắt đầu truyền tai nhau về người KTS “có chữ ký đáng tin”.',
          effects: { karma: 12, happy: 2, money: -20000000 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'angry' } } }
      ]
    },
    {
      id: 's_job_kientrucsu_hauqua', title: 'Công trình bị đình chỉ', icon: '🚧', age: [23, 70], chainOnly: true,
      req: { jobId: ['kientrucsu'], flag: 'job_kientrucsu_vipham' },
      text: 'Đoàn kiểm tra phòng cháy chữa cháy phát hiện tòa chung cư thiếu lối thoát hiểm và vượt hai tầng so với giấy phép. Công trình bị đình chỉ, cư dân căng băng rôn đòi quyền lợi. Cơ quan điều tra triệu tập người ký bản vẽ: là bạn.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'talk', say: 'Chữ ký trên bản vẽ này là của anh/chị?' }, { role: 'crowd', anim: 'angry' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Khai thật bị chủ đầu tư ép, nộp lại tiền thưởng',
          text: 'Bạn nộp lại tiền và khai rõ áp lực từ chủ đầu tư. Chủ đầu tư bị khởi tố, còn bạn bị thu hồi chứng chỉ hành nghề và mất việc.',
          effects: { money: -500000000, karma: 6, happy: -14, job: 'fire', unflag: 'job_kientrucsu_vipham' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Đổ cho nhân viên vẽ sai',
          outcomes: [
            { p: 0.3, text: 'Cậu nhân viên trẻ bị đuổi việc thay bạn. Bạn giữ được ghế, nhưng tiếng xấu thì lan khắp nghề.',
              effects: { karma: -12, happy: -5, looks: -3 },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.7, text: 'Bản gốc có chữ ký số của bạn. Bạn bị truy tố, phạt nặng và cấm hành nghề năm năm.',
              effects: { money: -800000000, karma: -6, happy: -20, looks: -5, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'point', crowd: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_kientrucsu_cuocthi', title: 'Thắng cuộc thi thiết kế', icon: '🏆', age: [23, 60], weight: 1.3,
      req: { jobId: ['kientrucsu'] },
      text: 'Thành phố mở cuộc thi thiết kế quảng trường trung tâm, hàng trăm phương án từ khắp nơi gửi về. Bạn có ba tuần và một ý tưởng: đưa hàng cây dầu cổ thụ và mặt nước vào giữa lòng phố.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'neutral',
        npcs: [{ role: 'coworker', anim: 'think', say: 'Ý tưởng hay đấy! Làm đi!' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Dốc hết sức, làm mô hình đến từng gốc cây',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Phương án của bạn đoạt giải Nhất! Ảnh bạn lên báo, giải thưởng {money:300000000} và tên bạn gắn với công trình biểu tượng của thành phố.',
              effects: { money: 300000000, happy: 15, looks: 5, smarts: 3, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', loc: 'park', time: 'day', npcAnim: { coworker: 'clap' } } },
            { text: 'Bạn lọt vào top 5 nhưng không có giải. Hội đồng ghi nhận ý tưởng, và vài văn phòng lớn bắt đầu để ý đến bạn.',
              effects: { happy: 2, smarts: 3, health: -3 },
              scene: { anim: 'shrug', fx: 'sparkle', npcAnim: { coworker: 'hug' } } }
          ] },
        { label: 'Lập nhóm với {coworker}, chia đều công sức',
          outcomes: [
            { p: 0.55, text: 'Hai cái đầu tốt hơn một. Nhóm bạn giành giải Nhì, chia đôi tiền thưởng, và thành đôi cộng sự ăn ý.',
              effects: { money: 100000000, happy: 10, karma: 3 },
              scene: { anim: 'hug', fx: 'confetti', npcAnim: { coworker: 'cheer' } } },
            { p: 0.45, text: 'Hai người cãi nhau về hướng thiết kế đến tận đêm cuối. Bản nộp nửa nạc nửa mỡ, trượt từ vòng gửi xe.',
              effects: { happy: -5 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_kientrucsu_chamtiendo', title: 'Công trình bị chậm tiến độ', icon: '⏳', age: [23, 65], weight: 1.4, once: false, cooldown: 3,
      req: { jobId: ['kientrucsu'] },
      text: 'Căn biệt thự bạn thiết kế trễ hạn bàn giao ba tháng: nhà thầu thiếu thợ, vật liệu nhập khẩu kẹt ở cảng. Chủ nhà gọi mỗi ngày năm cuộc, hôm nay ông đứng giữa công trường dọa kiện văn phòng bạn.',
      scene: { loc: 'street', time: 'day', weather: 'rain', anim: 'talk', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'angry', say: 'Ba tháng rồi! Tôi kiện các anh!' }, { role: 'coworker', anim: 'lift' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Đổi vật liệu tương đương có sẵn, ở luôn công trường',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn tìm được loại đá trong nước đẹp không kém, giám sát công trường ngày đêm. Bàn giao chỉ trễ thêm hai tuần, chủ nhà mừng rỡ giới thiệu thêm khách.',
              effects: { smarts: 3, health: -4, happy: 6, job: 'raise' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'clap' } } },
            { text: 'Vật liệu thay thế lệch màu, chủ nhà không chịu nghiệm thu. Văn phòng phải bồi thường, bạn bị trừ lương.',
              effects: { health: -4, happy: -6, money: -40000000 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'angry' } } }
          ] },
        { label: 'Đổ lỗi cho nhà thầu, “không phải việc của em”',
          text: 'Bạn chuyển hết cuộc gọi sang nhà thầu. Chủ nhà bực bội, sau khi xong việc thì đánh giá một sao cho văn phòng bạn trên mạng.',
          effects: { karma: -4, happy: -2, looks: -1 },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { stranger: 'angry' } } },
        { label: 'Thành thật xin lỗi, đề nghị giảm phí thiết kế',
          text: 'Bạn chủ động giảm 20% phí thiết kế để bù thiệt hại. Chủ nhà dịu giọng, cuối cùng còn mời bạn dự tiệc tân gia.',
          effects: { karma: 6, money: -30000000, happy: 3 },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { stranger: 'nod' } } }
      ]
    },
    // ======================== KỸ SƯ XÂY DỰNG ========================
    {
      id: 's_job_kysu_giangiao', title: 'Sự cố sập giàn giáo', icon: '🏗️', age: [22, 65], weight: 1.5,
      req: { jobId: ['kysu'], notFlag: 'job_kysu_suco' },
      text: 'Một buổi chiều gió giật, đoạn giàn giáo tầng 7 đổ sập kèm tiếng sắt thép rầm rầm. Bụi mù mịt, ba công nhân bị thương nằm dưới chân công trình. Tuần trước bạn đã ký biên bản nghiệm thu giàn giáo đó, dù đội thi công lắp thiếu chốt.',
      scene: { loc: 'street', time: 'dusk', weather: 'storm', anim: 'run', expr: 'scared',
        npcs: [{ role: 'coworker', anim: 'sick', expr: 'sick', say: 'Cứu với! Chân em kẹt rồi!' }, { role: 'crowd', anim: 'scared' }, { role: 'boss', anim: 'phone', say: 'Gọi 115 ngay!' }], fx: 'dust', shot: 'dramatic' },
      choices: [
        { label: 'Lao vào sơ cứu, gọi cấp cứu, phong tỏa hiện trường',
          text: 'Bạn chỉ huy mọi người kê ván, rút từng người ra, ép chặt vết thương cho đến khi xe cứu thương tới. Ba công nhân đều qua cơn nguy kịch. Nhưng câu hỏi “ai đã ký nghiệm thu?” vẫn chờ bạn.',
          effects: { karma: 10, health: -4, happy: -6, flag: ['job_kysu_suco', 'job_kysu_cuu'], followUp: { id: 's_job_kysu_trachnhiem', delay: 0 } },
          scene: { anim: 'lift', fx: 'sweat', npcAnim: { coworker: 'crawl', crowd: 'run' } } },
        { label: 'Lấy hồ sơ nghiệm thu, sửa lại ngày ký trước khi đoàn đến',
          text: 'Trong lúc mọi người hỗn loạn, bạn lặng lẽ về lán, sửa lại biên bản như thể giàn giáo được lắp sau khi bạn kiểm tra. Ngoài kia, tiếng còi cứu thương rền rĩ.',
          effects: { karma: -15, happy: -8, flag: ['job_kysu_suco', 'job_kysu_chegiau'], followUp: { id: 's_job_kysu_trachnhiem', delay: 0 } },
          scene: { anim: 'type', fx: 'smoke', loc: 'office', npcAnim: { boss: 'phone' } } },
        { label: 'Chạy ngay tới bệnh viện cùng người bị thương',
          text: 'Bạn nhảy lên xe cứu thương, ở lại bệnh viện cả đêm, ứng trước {money:60000000} viện phí cho các anh em. Sáng hôm sau, đoàn điều tra đã chờ ở công trường.',
          effects: { karma: 12, money: -60000000, happy: -4, flag: ['job_kysu_suco', 'job_kysu_cuu'], followUp: { id: 's_job_kysu_trachnhiem', delay: 0 } },
          scene: { anim: 'sit', fx: 'tears', loc: 'hospital', time: 'night', npcAnim: { coworker: 'sleep' } } }
      ]
    },
    {
      id: 's_job_kysu_trachnhiem', title: 'Hội đồng điều tra sự cố', icon: '📋', age: [22, 70], chainOnly: true,
      req: { jobId: ['kysu'], flag: 'job_kysu_suco' },
      text: 'Hội đồng điều tra sự cố lao động họp tại lán công trường. Trên bàn là biên bản nghiệm thu giàn giáo có chữ ký của bạn, ảnh chụp những chiếc chốt bị thiếu, và lời khai của đội thi công. Mọi ánh mắt đổ dồn về phía bạn.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'police', anim: 'talk', say: 'Ai ký nghiệm thu giàn giáo này?' }, { role: 'stranger', gender: 'm', age: 55, anim: 'think' }, { role: 'boss', anim: 'facepalm' }], fx: 'question', shot: 'dramatic' },
      choices: [
        { label: 'Nhận trách nhiệm, khai rõ đội thi công lắp thiếu chốt', req: { flag: 'job_kysu_cuu' },
          text: 'Bạn nhận phần sai vì đã ký khi chưa kiểm tra kỹ. Hội đồng ghi nhận bạn cứu người kịp thời: bạn bị kỷ luật cảnh cáo, hạ một bậc lương, nhưng giữ được nghề. Anh em công nhân gửi bạn giỏ trái cây cảm ơn.',
          effects: { karma: 8, happy: -4, money: -50000000, smarts: 3, unflag: 'job_kysu_suco' },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { police: 'nod', boss: 'nod' } } },
        { label: 'Khẳng định biên bản đã sửa là đúng', req: { flag: 'job_kysu_chegiau' },
          outcomes: [
            { p: 0.3, text: 'Đội thi công lãnh hết trách nhiệm. Bạn thoát, nhưng mỗi lần đi ngang công trường cũ, bạn lại thấy những chiếc chốt thiếu trong giấc mơ.',
              effects: { karma: -8, happy: -6, unflag: ['job_kysu_suco', 'job_kysu_chegiau'] },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.7, text: 'Dữ liệu nhật ký điện tử cho thấy biên bản bị sửa sau sự cố. Bạn bị khởi tố tội “vi phạm quy định về an toàn lao động”, mất việc, nhận án treo và bồi thường cho người bị nạn.',
              effects: { karma: -6, happy: -20, money: -400000000, looks: -4, job: 'fire', unflag: ['job_kysu_suco', 'job_kysu_chegiau'] },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'point' } } }
          ] },
        { label: 'Xin tự nguyện bồi thường cho công nhân bị thương',
          text: 'Bạn đề nghị trích lương bồi thường cho ba gia đình. Hội đồng vẫn kỷ luật bạn, chuyển sang làm giám sát hạng hai, nhưng gia đình các công nhân không ai trách bạn.',
          effects: { karma: 10, money: -150000000, happy: -6, unflag: ['job_kysu_suco', 'job_kysu_chegiau'] },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { stranger: 'nod' } } }
      ]
    },
    {
      id: 's_job_kysu_phongbi', title: 'Nhà thầu đưa phong bì rút ruột công trình', icon: '🧱', age: [22, 65], weight: 1.5,
      req: { jobId: ['kysu'] },
      text: 'Nhà thầu phụ hẹn bạn ra quán nhậu, rót bia rồi đẩy sang một túi giấy: “{money:800000000}. Thép phi 20 mình thay phi 16, xi măng bớt một bao mỗi khối. Anh chỉ cần ký nghiệm thu, không ai biết đâu.”',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'drink', say: 'Ký đi anh, chia đều mà. Ai biết!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Cầm túi tiền, ký nghiệm thu',
          text: 'Bạn ký. Tòa nhà mọc lên nhanh và đẹp, nhưng bên trong là thép mỏng, bê tông non. Túi tiền giúp bạn đặt cọc một căn hộ, còn giấc ngủ thì không mua lại được.',
          effects: { money: 800000000, karma: -18, flag: 'job_kysu_rutruot', followUp: { id: 's_job_kysu_thanhtra', delay: 2 } },
          scene: { anim: 'nod', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Từ chối, siết chặt kiểm tra vật liệu',
          outcomes: [
            { p: 0.6, text: 'Bạn bắt cưa mẫu thép, khoan lõi bê tông từng hạng mục. Nhà thầu phụ đành làm đúng thiết kế. Chủ đầu tư khen bạn là “kỹ sư thép”.',
              effects: { karma: 12, happy: 4, job: 'raise' },
              scene: { anim: 'point', fx: 'sparkle', npcAnim: { stranger: 'angry' } } },
            { p: 0.4, text: 'Nhà thầu có “ô dù”, tìm cách điều bạn sang dự án khác ở tỉnh xa. Lương không đổi, nhưng bạn xa nhà cả năm.',
              effects: { karma: 10, happy: -8 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Ghi âm cuộc gặp, nộp cho chủ đầu tư',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Đoạn ghi âm khiến nhà thầu phụ bị loại khỏi dự án và bị báo công an. Chủ đầu tư đưa bạn lên làm chỉ huy trưởng.',
              effects: { karma: 12, smarts: 3, happy: 8, job: 'promote' },
              scene: { anim: 'phone', fx: 'levelup', loc: 'office' } },
            { text: 'Ghi âm bị nhiễu, không đủ làm chứng cứ. Nhà thầu biết chuyện, công trường từ đó đầy những ánh mắt hằn học nhìn bạn.',
              effects: { karma: 6, happy: -6 },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 's_job_kysu_thanhtra', title: 'Mũi khoan kiểm định', icon: '🔩', age: [22, 70], chainOnly: true,
      req: { jobId: ['kysu'], flag: 'job_kysu_rutruot' },
      text: 'Hai năm sau, tòa nhà bạn từng ký nghiệm thu xuất hiện vết nứt chạy dọc cột tầng hầm. Thanh tra Bộ Xây dựng khoan mẫu kiểm định: thép nhỏ hơn thiết kế, bê tông không đạt mác. Công an kinh tế mời bạn lên làm việc.',
      scene: { loc: 'street', time: 'day', weather: 'rain', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Anh ký nghiệm thu mấy hạng mục này?' }, { role: 'crowd', anim: 'angry' }, { role: 'stranger', gender: 'm', age: 50, anim: 'lift' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Khai ra nhà thầu, nộp lại toàn bộ tiền',
          text: 'Bạn khai rõ đường đi của túi tiền và nộp lại {money:800000000}. Nhà thầu bị bắt, bạn được hưởng khoan hồng với án treo, nhưng mất việc và bị cấm hành nghề giám sát.',
          effects: { money: -800000000, karma: 8, happy: -15, looks: -3, job: 'fire', unflag: 'job_kysu_rutruot' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Im lặng, chờ nhà thầu “lo”',
          outcomes: [
            { p: 0.2, text: 'Nhà thầu lo được, hồ sơ chìm xuồng. Bạn thoát nhưng bị cho nghỉ việc trong im lặng, và tiếng xấu đi theo bạn khắp ngành.',
              effects: { karma: -6, happy: -10, job: 'fire' },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.8, text: 'Nhà thầu khai trước để lấy tình tiết giảm nhẹ. Bạn lĩnh án vì “nhận hối lộ” và “thiếu trách nhiệm gây hậu quả nghiêm trọng”, mất trắng mọi thứ.',
              effects: { money: -1200000000, karma: -8, happy: -25, health: -5, looks: -5, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'walk', crowd: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_kysu_bangiao', title: 'Bàn giao công trình lớn', icon: '🎉', age: [22, 65], weight: 1.4,
      req: { jobId: ['kysu'] },
      text: 'Sau ba năm bám công trường, cây cầu vượt sông mà bạn làm chỉ huy hiện trường chuẩn bị thông xe. Còn đúng một tuần, nhưng kết quả thử tải cho thấy một khe co giãn lệch vài milimét. Lễ khánh thành đã mời lãnh đạo thành phố.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Lễ cắt băng đã mời rồi, đừng có lùi!' }, { role: 'coworker', anim: 'lift' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Xin lùi lễ ba ngày để xử lý dứt điểm',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Đội của bạn làm xuyên đêm, khắc phục xong trước hạn. Cây cầu thông xe hoàn hảo, bạn được đề bạt và nhận bằng khen của thành phố.',
              effects: { happy: 14, smarts: 3, looks: 3, money: 150000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { boss: 'clap', coworker: 'cheer' } } },
            { text: 'Sửa xong thì lỡ lễ, sếp bị cấp trên trách, bạn bị cắt thưởng. Nhưng cây cầu vững chãi, và bạn biết mình đã làm đúng.',
              effects: { happy: -2, karma: 6 },
              scene: { anim: 'shrug', fx: 'sparkle', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Cứ bàn giao đúng hẹn, xử lý sau',
          outcomes: [
            { p: 0.6, text: 'Lễ thông xe tưng bừng, bạn được lên báo. Vài tháng sau khe co giãn bắt đầu kêu lạch cạch, nhưng bảo hành đã xử lý êm.',
              effects: { happy: 8, money: 100000000, karma: -3 },
              scene: { anim: 'clap', fx: 'confetti', npcAnim: { boss: 'cheer' } } },
            { p: 0.4, text: 'Một tuần sau thông xe, mặt cầu nứt nẻ đoạn khe co giãn, báo chí vào cuộc. Bạn bị kỷ luật vì bàn giao khi chưa đạt.',
              effects: { happy: -10, looks: -3, karma: -3, money: -50000000 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { boss: 'point' } } }
          ] },
        { label: 'Báo cáo trung thực, để chủ đầu tư quyết định',
          text: 'Bạn trình bày rõ rủi ro bằng số liệu. Chủ đầu tư chọn lùi lễ. Ngày thông xe, giám đốc dự án vỗ vai bạn: “Kỹ sư phải như cậu.”',
          effects: { karma: 6, happy: 8, job: 'raise' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'nod' } } }
      ]
    },
    // ========================= NHÀ KHOA HỌC =========================
    {
      id: 's_job_khoahoc_thatbai', title: 'Thí nghiệm thất bại liên tục', icon: '🧪', age: [24, 70], weight: 1.5,
      req: { jobId: ['khoahoc'] },
      text: 'Lần thử thứ 47, ống nghiệm lại đục ngầu thay vì trong vắt. Hạn nộp báo cáo đề tài cấp Nhà nước chỉ còn hai tháng, kinh phí sắp cạn. Cậu nghiên cứu sinh khẽ hỏi: “Hay mình… chỉnh số liệu một chút hả anh/chị?”',
      scene: { loc: 'university', time: 'night', weather: 'rain', anim: 'facepalm', expr: 'sad',
        npcs: [{ role: 'coworker', age: 26, anim: 'think', say: 'Hay mình chỉnh số liệu một chút?' }], fx: 'smoke', shot: 'close' },
      choices: [
        { label: 'Kiên trì, thử lại từ đầu với giả thuyết mới',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Lần thứ 52, bạn phát hiện nhiệt độ phòng thí nghiệm mới là thủ phạm. Kết quả đẹp như mơ, và lần này hoàn toàn thật. Bài báo được một tạp chí quốc tế nhận đăng.',
              effects: { smarts: 6, happy: 12, health: -4, flag: 'job_khoahoc_dotpha', job: 'promote' },
              scene: { anim: 'jump', fx: 'idea', npcAnim: { coworker: 'cheer' } } },
            { text: 'Đến hạn vẫn thất bại. Đề tài bị đánh giá “không đạt”, bạn phải giải trình kinh phí. Nhưng cuốn sổ ghi chép 52 lần thử là thứ quý giá nhất bạn có.',
              effects: { smarts: 4, happy: -8, health: -5 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: '“Làm đẹp” số liệu cho kịp hạn',
          text: 'Vài cú click trên phần mềm thống kê, đồ thị bỗng mượt mà. Đề tài nghiệm thu loại xuất sắc, bài báo lên tạp chí uy tín. Nhưng dữ liệu gốc vẫn nằm trên máy chủ của viện.',
          effects: { smarts: 1, happy: 4, karma: -14, money: 100000000, flag: 'job_khoahoc_giamao', followUp: { id: 's_job_khoahoc_rutbai', delay: 2 } },
          scene: { anim: 'type', fx: 'sweat', npcAnim: { coworker: 'shrug' } } },
        { label: 'Báo cáo trung thực: kết quả âm tính cũng là kết quả',
          text: 'Bạn viết báo cáo về những lần thất bại và lý do. Hội đồng tranh cãi, nhưng một giáo sư già nói: “Đây mới là khoa học.” Đề tài được gia hạn thêm một năm.',
          effects: { karma: 8, smarts: 3, happy: 2 },
          scene: { anim: 'talk', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_job_khoahoc_rutbai', title: 'Bài báo bị rút', icon: '📉', age: [24, 75], chainOnly: true,
      req: { jobId: ['khoahoc'], flag: 'job_khoahoc_giamao' },
      text: 'Một nhóm nghiên cứu ở Nhật làm lại thí nghiệm của bạn và không thu được kết quả tương tự. Trang PubPeer bắt đầu soi từng đồ thị, phát hiện các điểm dữ liệu “đẹp đến khó tin”. Tạp chí gửi email yêu cầu dữ liệu gốc trong 14 ngày.',
      scene: { loc: 'university', time: 'night', weather: 'storm', anim: 'type', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'angry', say: 'Dữ liệu gốc đâu? Viện mất mặt rồi!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Thừa nhận, tự xin rút bài',
          text: 'Bạn tự viết thư xin rút bài và xin lỗi cộng đồng khoa học. Viện kỷ luật, buộc bạn nghỉ việc và hoàn trả kinh phí đề tài. Một số đồng nghiệp vẫn gửi lời động viên vì bạn dám nhận.',
          effects: { karma: 8, happy: -14, money: -300000000, looks: -4, job: 'fire', unflag: 'job_khoahoc_giamao' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { boss: 'shake' } } },
        { label: 'Chối, nói dữ liệu gốc đã mất do hỏng ổ cứng',
          outcomes: [
            { p: 0.25, text: 'Tạp chí đăng “lưu ý quan ngại” nhưng chưa rút bài. Bạn sống tiếp trong nơm nớp, chẳng ai dám mời bạn hợp tác.',
              effects: { karma: -8, happy: -10, looks: -3 },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.75, text: 'Viện khôi phục được bản sao lưu: dữ liệu gốc khác hẳn dữ liệu công bố. Bài bị rút, bạn bị buộc thôi việc và lên báo với tiêu đề “gian lận khoa học”.',
              effects: { karma: -8, happy: -20, money: -300000000, looks: -8, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_khoahoc_daode', title: 'Bị đạo đề tài', icon: '🕳️', age: [24, 70], weight: 1.4,
      req: { jobId: ['khoahoc'] },
      text: 'Lật tạp chí chuyên ngành tháng này, bạn chết lặng: bài báo của giáo sư {boss}, người chấm luận án của bạn, trình bày đúng ý tưởng và cả bảng số liệu bạn từng gửi ông ấy “xem góp ý”. Tên bạn không có ở đâu cả.',
      scene: { loc: 'university', time: 'day', weather: 'cloudy', anim: 'study', expr: 'angry',
        npcs: [{ role: 'boss', gender: 'm', age: 62, anim: 'talk', say: 'Ý tưởng là của chung giới khoa học mà em.' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Gửi đơn kèm email gốc lên hội đồng đạo đức khoa học',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Email ghi rõ ngày giờ bạn gửi bản thảo. Hội đồng kết luận đạo văn, tạp chí đính chính và bổ sung bạn làm tác giả chính. Giới khoa học nể bạn hơn hẳn.',
              effects: { smarts: 3, karma: 8, happy: 10, looks: 3, job: 'promote' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { boss: 'facepalm' } } },
            { text: 'Hội đồng toàn người quen của giáo sư, kết luận “trùng hợp ý tưởng”. Bạn bị cô lập trong viện, các đề tài mới không ai muốn duyệt.',
              effects: { karma: 6, happy: -10 },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { boss: 'laugh' } } }
          ] },
        { label: 'Đăng bằng chứng lên mạng xã hội',
          outcomes: [
            { p: 0.5, text: 'Bài viết lan khắp các nhóm khoa học, báo chí vào cuộc. Giáo sư {boss} buộc phải xin lỗi công khai. Bạn thắng, dù phải trả giá bằng vài mối quan hệ.',
              effects: { karma: 5, happy: 6, looks: 4 },
              scene: { anim: 'phone', fx: 'exclaim', npcAnim: { boss: 'scared' } } },
            { p: 0.5, text: 'Bạn bị phản đòn là “bôi nhọ người có uy tín”, viện kỷ luật vì vi phạm quy chế phát ngôn. Sự thật vẫn đúng, nhưng bạn mất ghế.',
              effects: { happy: -12, job: 'fire' },
              scene: { anim: 'cry', fx: 'anger', npcAnim: { boss: 'point' } } }
          ] },
        { label: 'Im lặng, viết đề tài mới còn hay hơn',
          text: 'Bạn nuốt cục tức, khóa mọi bản thảo bằng mật khẩu và lao vào hướng nghiên cứu mới. Cơn giận biến thành động lực.',
          effects: { smarts: 5, happy: -5 },
          scene: { anim: 'study', fx: 'idea' } }
      ]
    },
    {
      id: 's_job_khoahoc_quocte', title: 'Công trình được quốc tế công nhận', icon: '🌏', age: [26, 75], weight: 1.2,
      req: { jobId: ['khoahoc'], minStat: { smarts: 70 } },
      text: 'Email từ một hội nghị khoa học quốc tế: công trình về giống lúa chịu mặn của bạn được chọn trình bày phiên toàn thể, kèm đề cử một giải thưởng danh giá. Cùng lúc, một tập đoàn nước ngoài ngỏ ý mua bản quyền với giá {money:5000000000}.',
      scene: { loc: 'university', time: 'day', weather: 'clear', anim: 'cheer', expr: 'happy',
        npcs: [{ role: 'coworker', anim: 'clap', say: 'Thầy/cô ơi, mình lên phiên toàn thể!' }, { role: 'crowd', anim: 'clap' }], fx: 'stars', shot: 'orbit' },
      choices: [
        { label: 'Lên phiên toàn thể, giữ bản quyền cho Việt Nam',
          text: 'Bài trình bày nhận tràng pháo tay đứng. Bạn nhận giải thưởng, bản quyền được chuyển giao miễn phí cho nông dân đồng bằng sông Cửu Long. Thầy cũ gọi điện, giọng run run tự hào.',
          effects: { smarts: 5, happy: 15, karma: 12, looks: 5, money: 500000000, job: 'promote' },
          scene: { anim: 'bow', fx: 'fireworks', npcAnim: { crowd: 'cheer' } } },
        { label: 'Bán bản quyền cho tập đoàn nước ngoài',
          text: 'Hợp đồng được ký, tài khoản bạn thêm năm tỷ. Vài năm sau, nông dân phải mua lại giống lúa đó với giá đắt gấp đôi. Báo chí chia làm hai phe.',
          effects: { money: 5000000000, happy: 8, karma: -8, looks: 2 },
          scene: { anim: 'nod', fx: 'money' } },
        { label: 'Chia công cho cả nhóm, đẩy học trò lên trình bày', req: { flag: 'job_khoahoc_dotpha' },
          text: 'Bạn để cậu nghiên cứu sinh từng thức trắng cùng bạn lên phiên toàn thể. Cậu ấy trình bày run run nhưng xuất sắc. Cả viện nói về một người thầy hiếm có.',
          effects: { karma: 14, happy: 12, smarts: 3, looks: 3, job: 'promote' },
          scene: { anim: 'clap', fx: 'hearts', npcAnim: { coworker: 'cry', crowd: 'cheer' } } }
      ]
    },
    // =========================== CÔNG CHỨC ===========================
    {
      id: 's_job_congchuc_phongbi', title: 'Bị gợi ý nhận phong bì', icon: '🧧', age: [22, 60], weight: 1.6,
      req: { jobId: ['congchuc'] },
      text: 'Bạn thụ lý hồ sơ xin cấp phép xây dựng cho một nhà hàng lớn, hồ sơ còn thiếu giấy tờ phòng cháy. Chủ nhà hàng kẹp vào tập hồ sơ một phong bì {money:50000000}. Anh đồng nghiệp bàn bên nháy mắt: “Ở đây ai cũng thế, cầm đi cho người ta yên tâm.”',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 46, anim: 'bow', say: 'Chút lòng thành, em giúp anh cho nhanh nhé.' }, { role: 'coworker', anim: 'nod', say: 'Cầm đi, ai cũng thế mà.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhận phong bì, ký duyệt cho nhanh',
          text: 'Bạn cất phong bì vào ngăn kéo và ký. Từ đó, khách “biết điều” cứ đến tìm bạn. Ngăn kéo ngày càng dày, và tên bạn bắt đầu được nhắc đến ở những chỗ không nên.',
          effects: { money: 50000000, karma: -12, flag: 'job_congchuc_phongbi', followUp: { id: 's_job_congchuc_thanhtra', delay: 2 } },
          scene: { anim: 'nod', fx: 'money', npcAnim: { stranger: 'laugh', coworker: 'laugh' } } },
        { label: 'Trả lại, hướng dẫn bổ sung giấy tờ',
          text: 'Bạn đẩy phong bì lại, ghi rõ danh sách giấy tờ còn thiếu. Chủ nhà hàng ngạc nhiên rồi gật đầu. Một tuần sau ông quay lại với bộ hồ sơ đủ, kèm lời khen gửi lãnh đạo phòng.',
          effects: { karma: 10, happy: 3 },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'nod', coworker: 'shrug' }, npcExpr: { stranger: 'surprised' } } },
        { label: 'Lập biên bản, nộp phong bì cho lãnh đạo',
          success: { stat: 'karma', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Lãnh đạo biểu dương bạn trước cơ quan, báo địa phương viết bài về “cán bộ trả phong bì”. Cuối năm bạn được xét nâng lương trước hạn.',
              effects: { karma: 12, happy: 6, looks: 2, job: 'raise' },
              scene: { anim: 'bow', fx: 'stars', npcAnim: { coworker: 'facepalm' } } },
            { text: 'Lãnh đạo nhận biên bản, rồi im lặng. Đồng nghiệp gọi bạn là “người lạ”, các bữa nhậu cơ quan không còn ai rủ bạn.',
              effects: { karma: 10, happy: -6 },
              scene: { anim: 'sad', fx: 'question', npcAnim: { coworker: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_congchuc_thanhtra', title: 'Đoàn thanh tra công vụ', icon: '🚨', age: [22, 70], chainOnly: true,
      req: { jobId: ['congchuc'], flag: 'job_congchuc_phongbi' },
      text: 'Một chủ hộ bị bạn “làm khó” vì không đưa phong bì đã gửi đơn tố cáo kèm đoạn clip quay lén. Đoàn thanh tra công vụ về làm việc, niêm phong ngăn kéo bàn bạn. Cả phòng nín thở.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', anim: 'point', say: 'Mời đồng chí giải trình đoạn clip này.' }, { role: 'boss', anim: 'facepalm' }, { role: 'coworker', anim: 'scared' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Thành khẩn nhận lỗi, nộp lại tiền',
          text: 'Bạn nộp lại toàn bộ số tiền đã nhận và viết bản kiểm điểm. Hội đồng kỷ luật buộc thôi việc. Mười mấy năm phấn đấu kết thúc bằng một tờ quyết định.',
          effects: { money: -150000000, karma: 6, happy: -15, job: 'fire', unflag: 'job_congchuc_phongbi' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod', boss: 'shake' } } },
        { label: 'Nhờ “quan hệ” chạy án',
          outcomes: [
            { p: 0.3, text: 'Mất thêm một khoản lớn cho “người quen”, bạn chỉ bị khiển trách và chuyển sang bộ phận khác, không còn cầm hồ sơ nữa.',
              effects: { money: -300000000, karma: -10, happy: -8 },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.7, text: 'Người nhận tiền chạy án hóa ra là kẻ lừa đảo. Bạn vừa mất tiền vừa bị khởi tố tội nhận hối lộ, lĩnh án tù.',
              effects: { money: -400000000, karma: -10, happy: -25, health: -5, job: 'fire' },
              scene: { anim: 'cry', fx: 'flash', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_congchuc_nangngach', title: 'Thi nâng ngạch', icon: '📝', age: [24, 58], weight: 1.4, once: false, cooldown: 4,
      req: { jobId: ['congchuc'] },
      text: 'Kỳ thi nâng ngạch chuyên viên chính sắp đến: ôn luật, tin học, ngoại ngữ, viết đề án. Chỉ tiêu ít, người thi đông. Một anh “có quan hệ” nhắn Zalo: “{money:80000000} trọn gói, bao đỗ, em yên tâm.”',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'study', expr: 'sleepy',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'phone', say: 'Trọn gói, bao đỗ, em yên tâm.' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Ôn thi nghiêm túc mỗi tối',
          success: { stat: 'smarts', base: 0.3, scale: 0.55 },
          outcomes: [
            { text: 'Ba tháng ôn luyện, bạn đỗ với điểm cao nhất đợt. Quyết định nâng ngạch ký ngay đầu quý, lương tăng, ghế cũng cao hơn.',
              effects: { smarts: 4, happy: 10, job: 'promote' },
              scene: { anim: 'cheer', fx: 'levelup', time: 'day' } },
            { text: 'Trượt môn ngoại ngữ vì thiếu 0,5 điểm. Bạn buồn mất một tuần, rồi lại đăng ký lớp tiếng Anh buổi tối.',
              effects: { smarts: 3, happy: -6 },
              scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Chi tiền “trọn gói” cho chắc',
          outcomes: [
            { p: 0.45, text: 'Bạn đỗ thật. Nhưng ngồi vào ghế mới mới biết mình không theo kịp công việc, ngày nào cũng lo bị phát hiện.',
              effects: { money: -80000000, karma: -10, happy: 2, job: 'promote' },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.55, text: 'Anh “quan hệ” cầm tiền rồi chặn Zalo. Bạn trượt, mất tiền mà không dám kêu với ai.',
              effects: { money: -80000000, karma: -6, happy: -10 },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Báo cáo tin nhắn mời “chạy” lên cơ quan',
          text: 'Bạn chụp màn hình gửi lên thanh tra sở. Kẻ môi giới bị điều tra, kỳ thi năm đó minh bạch hơn hẳn. Bạn đỗ vừa sát điểm, nhưng đỗ bằng sức mình.',
          effects: { karma: 10, smarts: 2, happy: 6, job: 'promote' },
          scene: { anim: 'phone', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_job_congchuc_dieuchuyen', title: 'Bị điều chuyển công tác', icon: '🚌', age: [24, 58], weight: 1.3,
      req: { jobId: ['congchuc'] },
      text: 'Quyết định đến bất ngờ: bạn được “luân chuyển” về một xã vùng sâu cách nhà 120 cây số, thời hạn ba năm. Ai cũng đoán là vì bạn từng không chịu ký một hồ sơ mà trưởng phòng {boss} gửi gắm.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Đây là tổ chức phân công, em chấp hành.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Vui vẻ nhận nhiệm vụ, xuống xã làm thật',
          outcomes: [
            { p: 0.6, text: 'Ở xã, bạn số hóa toàn bộ hồ sơ đất đai, người dân không còn phải đi lại chục lần. Ba năm sau, bạn trở về với bằng khen và chức phó phòng.',
              effects: { karma: 8, smarts: 3, happy: 6, job: 'promote' },
              scene: { anim: 'wave', fx: 'sparkle', loc: 'countryside', npcAnim: { boss: 'shrug' } } },
            { p: 0.4, text: 'Đường xa, xa gia đình, bạn sụt mấy cân và hay ốm vặt. Nhưng người dân xã quý bạn như con cháu trong nhà.',
              effects: { karma: 6, health: -6, happy: -3 },
              scene: { anim: 'sit', fx: 'hearts', loc: 'countryside' } }
          ] },
        { label: 'Làm đơn khiếu nại lên cấp trên',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chứng minh quyết định sai quy trình luân chuyển. Quyết định bị hủy, trưởng phòng {boss} bị nhắc nhở. Bạn ở lại, nhưng không khí phòng thì lạnh hẳn.',
              effects: { smarts: 3, happy: 4, karma: 3 },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { boss: 'angry' } } },
            { text: 'Đơn bị trả lời “đúng quy định”. Bạn vẫn phải đi, kèm theo tiếng “cứng đầu” trong hồ sơ.',
              effects: { happy: -8 },
              scene: { anim: 'sad', fx: 'sweat', loc: 'countryside' } }
          ] },
        { label: 'Xin nghỉ việc nhà nước, ra ngoài làm',
          text: 'Bạn nộp đơn xin thôi việc. Mẹ bạn tiếc đứt ruột vì “mất biên chế”, nhưng bạn thấy nhẹ cả người khi bước ra khỏi cổng cơ quan lần cuối.',
          effects: { happy: 4, job: 'fire', log: 'Xin thôi việc công chức sau quyết định điều chuyển.' },
          scene: { anim: 'wave', fx: 'sparkle', npcAnim: { boss: 'shrug' } } }
      ]
    },
    // ======================== BIÊN PHIÊN DỊCH ========================
    {
      id: 's_job_phiendich_dichsai', title: 'Dịch sai trong cuộc đàm phán lớn', icon: '🗯️', age: [22, 65], weight: 1.5,
      req: { jobId: ['phiendich'] },
      text: 'Cuộc đàm phán hợp đồng nghìn tỷ giữa một tập đoàn Việt Nam và đối tác Hàn Quốc đang đến hồi gay cấn. Bỗng bạn giật mình: năm phút trước, bạn đã dịch “giao hàng trong 30 ngày” thành “300 ngày”. Phía Hàn Quốc đang gật gù vì tưởng được nới thời hạn.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'talk', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 55, anim: 'nod', say: 'Ồ, 300 ngày thì quá tốt!' }, { role: 'boss', anim: 'sit' }, { role: 'crowd', anim: 'sit' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Xin dừng lại, đính chính ngay',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn cúi đầu xin lỗi cả hai bên, đính chính rõ ràng bằng cả hai thứ tiếng. Trưởng đoàn Hàn Quốc mỉm cười: “Người trung thực thì đáng tin.” Hợp đồng được ký, sếp còn khen bạn bản lĩnh.',
              effects: { karma: 6, smarts: 2, happy: 6, job: 'raise' },
              scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'nod', boss: 'clap' } } },
            { text: 'Phía Hàn Quốc nghi ngờ cả những gì bạn dịch trước đó, đòi thuê phiên dịch khác. Buổi đàm phán hoãn một tuần, sếp trừ thưởng bạn.',
              effects: { karma: 4, happy: -6, money: -20000000 },
              scene: { anim: 'facepalm', fx: 'question', npcAnim: { stranger: 'shake', boss: 'angry' } } }
          ] },
        { label: 'Lờ đi, hy vọng không ai để ý',
          outcomes: [
            { p: 0.35, text: 'Đến bản hợp đồng giấy, con số đã được luật sư sửa đúng. Không ai biết, bạn thở phào như vừa thoát chết.',
              effects: { happy: -2, karma: -3 },
              scene: { anim: 'think', fx: 'sweat' } },
            { p: 0.65, text: 'Ba tháng sau, phía đối tác viện dẫn biên bản ghi âm “300 ngày”. Tranh chấp nổ ra, công ty mất hàng chục tỷ và bạn bị chấm dứt hợp đồng.',
              effects: { happy: -15, karma: -4, looks: -3, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Khéo léo “hỏi lại” để cả hai bên tự nói lại con số',
          outcomes: [
            { p: 0.6, text: 'Bạn đề nghị hai bên “tóm tắt lại các điểm đã thống nhất”. Con số 30 ngày được nhắc lại và dịch chuẩn. Không ai biết bạn vừa tự cứu mình.',
              effects: { smarts: 4, happy: 5 },
              scene: { anim: 'talk', fx: 'idea', npcAnim: { stranger: 'nod' } } },
            { p: 0.4, text: 'Trưởng đoàn Hàn Quốc tinh ý nhận ra, nhíu mày nhìn bạn. Sếp phải xin lỗi thay, mặt đỏ bừng.',
              effects: { happy: -6 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 's_job_phiendich_congtac', title: 'Đi công tác nước ngoài', icon: '✈️', age: [22, 65], weight: 1.4, once: false, cooldown: 3,
      req: { jobId: ['phiendich'] },
      text: 'Bạn được cử theo đoàn doanh nghiệp sang Osaka một tuần làm phiên dịch. Lịch kín từ sáng đến tối, nhưng tối cuối cùng được tự do. Một doanh nhân trong đoàn còn ngỏ ý nhờ bạn dịch “riêng” một hợp đồng, trả {money:30000000}.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'walk', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'm', age: 48, anim: 'talk', say: 'Dịch riêng giúp anh, anh trả hậu!' }, { role: 'crowd', anim: 'walk' }], fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Tranh thủ giao lưu, học thêm thuật ngữ chuyên ngành',
          text: 'Bạn đi cùng các kỹ sư Nhật tham quan nhà máy, ghi chép kín một cuốn sổ thuật ngữ. Về nước, bạn thành phiên dịch được các tập đoàn lớn săn đón.',
          effects: { smarts: 5, happy: 6, job: 'raise' },
          scene: { anim: 'study', fx: 'idea', loc: 'office' } },
        { label: 'Nhận dịch riêng, kiếm thêm',
          outcomes: [
            { p: 0.6, text: 'Bạn thức đến 3 giờ sáng dịch xong, nhận tiền ngay. Doanh nhân kia còn xin số để hợp tác lâu dài.',
              effects: { money: 30000000, health: -3, happy: 4 },
              scene: { anim: 'type', fx: 'money', time: 'night' } },
            { p: 0.4, text: 'Hợp đồng đó cạnh tranh trực tiếp với công ty đang thuê bạn. Trưởng đoàn biết chuyện, bạn bị khiển trách vì vi phạm cam kết bảo mật.',
              effects: { money: 30000000, karma: -6, happy: -8 },
              scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Đi dạo phố, mua quà cho cả nhà',
          text: 'Bạn lang thang phố Dotonbori, ăn takoyaki, mua cả vali bánh kẹo. Ví mỏng đi nhiều, nhưng lòng thì nhẹ tênh.',
          effects: { money: -15000000, happy: 10 },
          scene: { anim: 'eat', fx: 'hearts' } }
      ]
    },
    {
      id: 's_job_phiendich_ai', title: 'Bị AI cạnh tranh', icon: '🤖', age: [22, 65], weight: 1.4,
      req: { jobId: ['phiendich'] },
      text: 'Công ty thông báo sẽ dùng phần mềm dịch AI cho toàn bộ tài liệu, chỉ giữ lại “vài người hậu kiểm”. Nửa phòng dịch thuật nhận email cắt giảm. Sếp gọi bạn vào: “Em muốn ở lại thì phải chứng minh mình hơn máy.”',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'point', say: 'Máy dịch 10 giây, em dịch 2 ngày.' }, { role: 'coworker', anim: 'sad', expr: 'sad' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Học dùng AI, chuyển sang hậu kiểm và văn phong',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Bạn biến AI thành trợ lý, năng suất gấp năm lần, bản dịch vẫn có hồn. Bạn được lên trưởng nhóm, quản lý cả quy trình dịch mới.',
              effects: { smarts: 5, happy: 8, job: 'promote' },
              scene: { anim: 'type', fx: 'levelup', npcAnim: { boss: 'nod' } } },
            { text: 'Bạn vật lộn với phần mềm mới, chậm hơn các bạn trẻ. Lương bị cắt 30% vì “khối lượng công việc giảm”.',
              effects: { happy: -8, money: -20000000 },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Chuyển hẳn sang phiên dịch cabin, thứ máy chưa làm được',
          outcomes: [
            { p: 0.55, text: 'Bạn ôn luyện cật lực, thi đỗ chứng chỉ phiên dịch hội nghị. Các hội nghị quốc tế trả công theo ngày, thu nhập còn cao hơn trước.',
              effects: { smarts: 4, happy: 8, money: 60000000, job: 'raise' },
              scene: { anim: 'talk', fx: 'music', npcAnim: { coworker: 'clap' } } },
            { p: 0.45, text: 'Phiên dịch cabin khắc nghiệt hơn bạn tưởng. Sau vài buổi run tay, bạn đành quay về dịch tài liệu với mức lương thấp hơn.',
              effects: { happy: -6, health: -2 },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Đứng lên phản đối, viết thư chung với đồng nghiệp',
          text: 'Lá thư chung chỉ đổi được thêm một tháng lương hỗ trợ cho người bị cắt giảm. Bạn vẫn ở lại, nhưng bị sếp liệt vào danh sách “khó bảo”.',
          effects: { karma: 6, happy: -3 },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { coworker: 'hug', boss: 'shake' } } }
      ]
    },
    // ========================== NHÀ THIẾT KẾ ==========================
    {
      id: 's_job_thietke_sua20', title: 'Khách sửa 20 lần', icon: '🔁', age: [21, 60], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['thietke'] },
      text: 'Logo cho chuỗi trà sữa đã qua bản sửa thứ 20. Khách nhắn lúc 1 giờ sáng: “Em làm logo to hơn nhưng nhỏ lại chút, màu đỏ mà xanh hơn, sang nhưng phải bình dân nha. Bản cuối thật luôn!”',
      scene: { loc: 'bedroom', time: 'night', weather: 'clear', anim: 'facepalm', expr: 'sleepy',
        npcs: [{ role: 'stranger', gender: 'f', age: 35, anim: 'phone', say: 'Bản cuối thật luôn nha em!' }], fx: 'steam', shot: 'close' },
      choices: [
        { label: 'Cắn răng sửa tiếp, chiều khách đến cùng',
          text: 'Bản sửa thứ 27 cuối cùng cũng được duyệt. Khách hài lòng, giới thiệu thêm ba mối mới. Còn bạn thì thâm quầng mắt và có vài sợi tóc bạc.',
          effects: { money: 15000000, health: -5, happy: -3 },
          scene: { anim: 'type', fx: 'zzz' } },
        { label: 'Gửi lại đúng bản số 1, đổi tên file thành “final_v21”',
          outcomes: [
            { p: 0.65, text: 'Khách reply sau năm phút: “Đấy! Bản này chuẩn rồi, sao không làm thế từ đầu?” Bạn cười đến chảy nước mắt.',
              effects: { happy: 10, money: 15000000, smarts: 2 },
              scene: { anim: 'laugh', fx: 'sparkle' } },
            { p: 0.35, text: 'Khách nhận ra ngay: “Bản này y bản đầu mà?” Họ hủy hợp đồng và đăng bài chê bạn trên group thiết kế.',
              effects: { happy: -6, looks: -2 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { stranger: 'angry' } } }
          ] },
        { label: 'Đặt quy định: từ lần sửa thứ 3 tính phí',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Khách hơi khó chịu nhưng chịu trả thêm. Từ đó họ góp ý gọn gàng hẳn, và bạn có thêm thu nhập lẫn thời gian ngủ.',
              effects: { money: 25000000, happy: 6, health: 2 },
              scene: { anim: 'nod', fx: 'money' } },
            { text: 'Khách bỏ đi, tìm người “dễ tính hơn”. Bạn mất mối, nhưng tối đó được ngủ một giấc tròn.',
              effects: { happy: 2, health: 3, money: -5000000 },
              scene: { anim: 'sleep', fx: 'zzz' } }
          ] }
      ]
    },
    {
      id: 's_job_thietke_dao', title: 'Bị đạo thiết kế', icon: '🖼️', age: [21, 60], weight: 1.4,
      req: { jobId: ['thietke'] },
      text: 'Đi ngang trung tâm thương mại, bạn sững người: poster của một thương hiệu thời trang lớn dùng y nguyên bộ minh họa bạn đăng trên Behance năm ngoái, chỉ đổi màu nền. Hàng nghìn tấm poster đang phủ khắp thành phố.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'point', expr: 'angry',
        npcs: [{ role: 'crowd', anim: 'walk' }, { role: 'coworker', anim: 'phone', say: 'Ơ, tranh của bạn mà?' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Đăng bài so sánh lên mạng xã hội',
          outcomes: [
            { p: 0.6, text: 'Bài so sánh viral, cộng đồng thiết kế đồng loạt lên tiếng. Thương hiệu phải xin lỗi, bồi thường {money:150000000} và mời bạn hợp tác chính thức.',
              effects: { money: 150000000, happy: 12, looks: 5, karma: 2 },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'clap' } } },
            { p: 0.4, text: 'Thương hiệu im lặng, rồi tung tin bạn “ăn theo”. Cuộc chiến trên mạng kéo dài khiến bạn mệt mỏi, mất ngủ cả tháng.',
              effects: { happy: -8, health: -3 },
              scene: { anim: 'sad', fx: 'anger' } }
          ] },
        { label: 'Thuê luật sư gửi thư yêu cầu bồi thường',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'File gốc có ngày tạo và đăng ký bản quyền đầy đủ. Thương hiệu chọn hòa giải, trả {money:300000000} để tránh ra tòa.',
              effects: { money: 280000000, happy: 10, smarts: 2 },
              scene: { anim: 'nod', fx: 'money', loc: 'office' } },
            { text: 'Bạn chưa đăng ký bản quyền, vụ việc kéo dài, chi phí luật sư đã ngốn {money:40000000} mà chưa thấy kết quả.',
              effects: { money: -40000000, happy: -6 },
              scene: { anim: 'facepalm', fx: 'sweat', loc: 'office' } }
          ] },
        { label: 'Bỏ qua, coi như họ quảng cáo giúp',
          text: 'Bạn chỉ lặng lẽ thêm watermark vào mọi tác phẩm từ nay. Chuyện cũ trôi đi, nhưng mỗi lần thấy tấm poster, bạn lại thấy nhói.',
          effects: { happy: -4, karma: 2 },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { coworker: 'shake' } } }
      ]
    },
    {
      id: 's_job_thietke_giaithuong', title: 'Giải thưởng thiết kế', icon: '🏅', age: [21, 60], weight: 1.3,
      req: { jobId: ['thietke'] },
      text: 'Bộ nhận diện bạn làm cho một làng gốm Bát Tràng lọt vào chung kết một giải thiết kế châu Á. Lễ trao giải tổ chức ở Singapore, ban tổ chức gửi vé mời. Cùng lúc, khách lớn nhất của bạn hối nộp dự án đúng tuần đó.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'phone', expr: 'happy',
        npcs: [{ role: 'coworker', anim: 'cheer', say: 'Chung kết châu Á! Đi đi chứ!' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Bay sang dự lễ, xin khách lùi hạn',
          success: { stat: 'looks', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bước lên sân khấu nhận giải Vàng giữa ánh đèn flash. Ảnh bạn lên báo, đơn đặt hàng từ nước ngoài đổ về, công ty đề bạt bạn lên vị trí cao hơn.',
              effects: { happy: 15, looks: 6, money: 100000000, job: 'promote' },
              scene: { anim: 'bow', fx: 'fireworks', loc: 'wedding', time: 'night', npcAnim: { coworker: 'clap' } } },
            { text: 'Bạn chỉ nhận bằng khen chung kết, còn khách lớn thì bực vì bị lùi hạn. Chuyến đi vẫn đáng giá, nhưng ví thì hơi đau.',
              effects: { happy: 2, money: -20000000, smarts: 2 },
              scene: { anim: 'shrug', fx: 'sparkle', loc: 'wedding', time: 'night' } }
          ] },
        { label: 'Ở nhà làm dự án, nhờ ban tổ chức nhận giải hộ',
          outcomes: [
            { p: 0.5, text: 'Bạn đoạt giải Bạc, xem lễ qua livestream lúc vẫn đang chỉnh file cho khách. Khách lớn cảm kích, ký thêm hợp đồng cả năm.',
              effects: { happy: 8, money: 80000000, job: 'raise' },
              scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.5, text: 'Không có giải. Dự án nộp đúng hạn, khách hài lòng, cuộc sống vẫn trôi như cũ.',
              effects: { happy: -2, money: 20000000 },
              scene: { anim: 'type', fx: 'question' } }
          ] }
      ]
    },
    // ========================= LẬP TRÌNH VIÊN =========================
    {
      id: 's_job_laptrinh_sale1111', title: 'Sập hệ thống giữa đêm sale 11.11', icon: '💥', age: [21, 60], weight: 1.4,
      req: { jobId: ['laptrinh'] },
      text: '0 giờ ngày 11.11, triệu người cùng bấm “Mua ngay”. Hệ thống thanh toán bạn phụ trách đỏ rực cảnh báo, rồi sập hẳn. Nhóm Zalo công ty nổ tung tin nhắn, CEO gọi thẳng vào máy bạn.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'type', expr: 'scared',
        npcs: [{ role: 'boss', anim: 'phone', say: 'Mỗi phút sập là mất cả tỷ! Sửa ngay!' }, { role: 'coworker', anim: 'type', expr: 'scared' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Bình tĩnh đọc log, tìm đúng nguyên nhân',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn lần ra một câu truy vấn khóa cả bảng đơn hàng, vá trong 17 phút. Hệ thống hồi sinh, doanh số đêm đó phá kỷ lục. Sáng ra, CEO gửi bạn thưởng nóng kèm thư thăng chức.',
              effects: { smarts: 4, happy: 12, money: 50000000, job: 'promote' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { boss: 'clap', coworker: 'hug' } } },
            { text: 'Ba tiếng loay hoay, hệ thống mới chạy lại được. Công ty mất hàng chục tỷ doanh thu, bạn phải viết bản báo cáo sự cố dài 12 trang.',
              effects: { happy: -8, health: -4, smarts: 3 },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Rollback ngay về phiên bản tuần trước',
          outcomes: [
            { p: 0.6, text: 'Rollback xong, hệ thống chạy lại sau 10 phút. Không hoa mỹ, nhưng hiệu quả. Sếp gật đầu: “Quyết đoán đấy.”',
              effects: { happy: 6, smarts: 2, job: 'raise' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { boss: 'nod' } } },
            { p: 0.4, text: 'Rollback làm mất tính năng mã giảm giá mới, hàng nghìn khách bức xúc lên mạng chửi. Sự cố chồng sự cố.',
              effects: { happy: -8, looks: -1 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Đổ lỗi cho đội hạ tầng trong nhóm chat',
          text: 'Bạn đăng ảnh biểu đồ CPU kèm câu “Bên hạ tầng xem lại server đi”. Đến sáng thì ai cũng thấy lỗi nằm ở code của bạn. Cả công ty nhớ mãi.',
          effects: { karma: -6, happy: -6, looks: -2 },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { coworker: 'angry' } } }
      ]
    },
    {
      id: 's_job_laptrinh_nuocngoai', title: 'Lời mời từ công ty nước ngoài', icon: '🌐', age: [22, 55], weight: 1.4,
      req: { jobId: ['laptrinh'], minStat: { smarts: 55 } },
      text: 'Một headhunter nhắn LinkedIn: công ty công nghệ ở Singapore muốn tuyển bạn, lương gấp ba hiện tại, có cả lựa chọn làm từ xa cho một startup ở Mỹ. Vòng phỏng vấn cuối là bài thuật toán trực tiếp với kỹ sư trưởng.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 32, anim: 'talk', say: 'Lương gấp ba, em cân nhắc nhé!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Phỏng vấn, chuyển hẳn sang Singapore',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn giải bài thuật toán trong 25 phút. Ba tháng sau bạn đã ở Singapore, lương nghìn đô mỗi tuần. Xa nhà, nhưng cánh cửa thế giới đã mở.',
              effects: { smarts: 4, happy: 8, money: 200000000, job: 'promote', flag: 'job_laptrinh_quocte' },
              scene: { anim: 'cheer', fx: 'confetti', loc: 'office' } },
            { text: 'Bạn bí ở câu hỏi cuối. Thư từ chối đến lịch sự, kèm lời mời “thử lại sau 12 tháng”.',
              effects: { happy: -5, smarts: 3 },
              scene: { anim: 'sad', fx: 'question' } }
          ] },
        { label: 'Làm từ xa cho startup Mỹ, ở lại Việt Nam',
          outcomes: [
            { p: 0.65, text: 'Ngày làm ở Việt Nam, tối họp với Mỹ. Lương đô, tiêu tiền đồng, sống thoải mái gần gia đình.',
              effects: { money: 150000000, happy: 8, health: -3, job: 'raise' },
              scene: { anim: 'type', fx: 'money', loc: 'bedroom', time: 'night' } },
            { p: 0.35, text: 'Startup cháy vốn sau sáu tháng, đóng cửa không báo trước. Bạn mất hai tháng lương và phải đi tìm việc lại.',
              effects: { money: -30000000, happy: -10 },
              scene: { anim: 'facepalm', fx: 'heartbreak', loc: 'bedroom' } }
          ] },
        { label: 'Đem lời mời ra đàm phán tăng lương ở công ty cũ',
          outcomes: [
            { p: 0.55, text: 'Sếp tái mặt, đồng ý tăng 50% lương và cho bạn lên dẫn dắt nhóm mới. Bạn ở lại với tâm thế hoàn toàn khác.',
              effects: { happy: 8, job: 'promote' },
              scene: { anim: 'nod', fx: 'money', loc: 'office' } },
            { p: 0.45, text: 'Sếp mỉm cười: “Vậy em đi đi.” Bạn ngớ người, lời mời bên kia cũng đã hết hạn.',
              effects: { happy: -8 },
              scene: { anim: 'facepalm', fx: 'sweat', loc: 'office' } }
          ] },
        { label: 'Từ chối, ở lại gần gia đình',
          text: 'Bạn cảm ơn headhunter và từ chối. Tối đó về nhà ăn cơm với bố mẹ, bạn thấy quyết định ấy không hề sai.',
          effects: { happy: 4, karma: 2 },
          scene: { anim: 'eat', fx: 'hearts', loc: 'home', time: 'dusk' } }
      ]
    },
    {
      id: 's_job_laptrinh_quasuc', title: 'Làm việc quá sức', icon: '😵', age: [21, 60], weight: 1.5,
      req: { jobId: ['laptrinh'], notFlag: 'job_laptrinh_kietsuc' },
      text: 'Dự án ra mắt ứng dụng bị dí deadline: ba tháng liền bạn làm đến 2 giờ sáng, cuối tuần cũng mở laptop. Cà phê thay nước lọc, mì gói thay cơm, lưng đau đến mức ngồi không yên. Sếp vẫn nhắn: “Cố thêm sprint này nữa thôi em.”',
      scene: { loc: 'office', time: 'night', weather: 'rain', anim: 'type', expr: 'sleepy',
        npcs: [{ role: 'boss', anim: 'phone', say: 'Cố thêm sprint này nữa thôi em!' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Gồng tiếp, xong dự án rồi nghỉ',
          text: 'Bạn uống thêm ly cà phê thứ năm trong ngày. Ứng dụng ra mắt đúng hạn, nhưng cơ thể bạn bắt đầu gửi những tín hiệu không thể làm ngơ.',
          effects: { health: -8, happy: -4, money: 20000000, flag: 'job_laptrinh_kietsuc', followUp: { id: 's_job_laptrinh_gucnga', delay: 1 } },
          scene: { anim: 'drink', fx: 'steam' } },
        { label: 'Thẳng thắn đề nghị giãn tiến độ',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn đưa bảng số liệu: làm đêm khiến lỗi tăng gấp đôi. Sếp đồng ý lùi hai tuần, cả nhóm thở phào. Sản phẩm ra mắt ít lỗi hơn hẳn.',
              effects: { health: 3, happy: 6, smarts: 2 },
              scene: { anim: 'talk', fx: 'idea', npcAnim: { boss: 'nod' } } },
            { text: 'Sếp lạnh lùng: “Không làm được thì có người khác.” Bạn bị đánh giá “thiếu cam kết” trong kỳ xét lương.',
              effects: { happy: -6 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Nghỉ phép một tuần, tắt hết thông báo',
          text: 'Bạn tắt Slack, về quê một tuần, ngủ mười tiếng mỗi đêm. Quay lại, đầu óc minh mẫn lạ thường, giải quyết trong một ngày cái bug cả nhóm vướng cả tuần.',
          effects: { health: 6, happy: 8, smarts: 2 },
          scene: { anim: 'sleep', fx: 'zzz', loc: 'countryside', time: 'day' } }
      ]
    },
    {
      id: 's_job_laptrinh_gucnga', title: 'Gục ngã trước màn hình', icon: '🚑', age: [21, 65], chainOnly: true,
      req: { jobId: ['laptrinh'], flag: 'job_laptrinh_kietsuc' },
      text: 'Một buổi sáng đứng dậy lấy nước, mắt bạn tối sầm rồi bạn ngã gục cạnh bàn làm việc. Tỉnh dậy trong bệnh viện, bác sĩ cầm phim chụp: cột sống thoái hóa, cơ thể suy kiệt vì làm việc quá sức kéo dài.',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'sick', expr: 'sick',
        npcs: [{ role: 'doctor', anim: 'talk', say: 'Cứ thế này thì không trụ nổi đâu.' }, { role: 'coworker', anim: 'sad' }], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Nghỉ dưỡng hẳn, tập lại thói quen sống',
          text: 'Bạn xin nghỉ ba tháng, tập vật lý trị liệu, đi bơi mỗi sáng. Quay lại, bạn đặt giới hạn giờ làm rõ ràng, và lạ thay, hiệu suất còn tốt hơn trước.',
          effects: { health: 6, happy: 4, money: -40000000, illness: 'Thoát vị đĩa đệm', unflag: 'job_laptrinh_kietsuc' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { doctor: 'nod' } } },
        { label: 'Đòi xuất viện sớm vì dự án mới',
          text: 'Bạn ký giấy xuất viện, ôm laptop về công ty ngay chiều đó. Cơn đau lưng thành bạn đồng hành lâu dài, và bác sĩ dặn đây chỉ là cảnh báo đầu tiên.',
          effects: { health: -10, happy: -6, illness: 'Thoát vị đĩa đệm', unflag: 'job_laptrinh_kietsuc' },
          scene: { anim: 'type', fx: 'sweat', npcAnim: { doctor: 'shake' } } },
        { label: 'Nộp đơn nghỉ việc, tìm chỗ làm nhẹ nhàng hơn',
          text: 'Bạn nghỉ việc, dành nửa năm hồi phục sức khỏe trước khi tính tiếp. Ví mỏng đi, nhưng lần đầu sau nhiều năm bạn ngủ ngon đến sáng.',
          effects: { health: 8, happy: 6, job: 'fire', log: 'Nghỉ việc lập trình để hồi phục sức khỏe.', unflag: 'job_laptrinh_kietsuc' },
          scene: { anim: 'wave', fx: 'sparkle', loc: 'home' } }
      ]
    }
  );
})();
