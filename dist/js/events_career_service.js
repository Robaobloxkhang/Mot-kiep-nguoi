/* Một Kiếp Người — biến cố nghề nghiệp: dịch vụ, y tế, an ninh, nông nghiệp */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= CẢNH SÁT =======================
    {
      id: 's_job_canhsat_truybat', title: 'Truy bắt tội phạm có vũ khí', icon: '🚨', age: [22, 60], weight: 1.6,
      req: { jobId: ['canhsat'], notFlag: 'job_canhsat_truybat' },
      text: 'Gần nửa đêm, bộ đàm rè rè: một tên cướp giật vừa đâm người ở chợ đêm, đang cầm dao chạy vào con hẻm cụt sau dãy trọ. Bạn và {coworker} đến đầu hẻm trước tiên. Bên trong, hắn đứng thở dốc, lưỡi dao loáng dưới ánh đèn đường.',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'point', expr: 'angry', say: 'Bỏ dao xuống!',
        npcs: [{ role: 'thief', gender: 'm', age: 27, anim: 'angry', say: 'Lại đây xem!' }, { role: 'coworker', anim: 'phone', expr: 'scared', say: 'Tổ 2 đang tới, năm phút nữa!' }, { role: 'crowd', anim: 'scared' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Phong tỏa đầu hẻm, chờ tổ hỗ trợ',
          success: { stat: 'smarts', base: 0.55, scale: 0.35 },
          outcomes: [
            { text: 'Bạn chặn lối ra, giữ khoảng cách, nói chuyện kéo dài thời gian. Năm phút sau tổ hỗ trợ ập vào, tên cướp bị khống chế mà không ai bị thương. Chỉ huy gật đầu: “Làm đúng bài, tốt lắm.”',
              effects: { happy: 6, smarts: 3, karma: 5, flag: ['job_canhsat_truybat', 'job_canhsat_congtrang'], followUp: { id: 's_job_canhsat_chiencong', delay: 1 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { thief: 'fall', coworker: 'clap', crowd: 'clap' } } },
            { text: 'Trong lúc chờ, hắn trèo qua bức tường sau hẻm và biến mất vào khu trọ. Cả tổ lùng sục đến sáng mới tóm được. Bạn bị nhắc nhở vì để lộ sơ hở.',
              effects: { happy: -4, smarts: 2, flag: 'job_canhsat_truybat' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { thief: 'run', coworker: 'shrug' } } }
          ] },
        { label: 'Thuyết phục hắn buông dao',
          success: { stat: 'karma', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn hạ giọng: “Em còn mẹ ở quê đúng không? Buông dao đi, tội còn nhẹ.” Hắn run lên, rồi con dao rơi keng xuống đất. Clip người dân quay được lan khắp mạng.',
              effects: { happy: 8, karma: 8, looks: 3, flag: ['job_canhsat_truybat', 'job_canhsat_congtrang'], followUp: { id: 's_job_canhsat_chiencong', delay: 1 } },
              scene: { anim: 'talk', fx: 'sparkle', npcAnim: { thief: 'cry', crowd: 'clap' }, npcSay: { thief: 'Em xin lỗi...' } } },
            { text: 'Hắn cười khẩy, bất ngờ lao tới. Bạn né được nhưng vẫn bị sượt một đường ở cánh tay trước khi {coworker} quật ngã hắn.',
              effects: { health: -8, happy: -3, illness: 'Chấn thương cơ', flag: 'job_canhsat_truybat' },
              scene: { anim: 'fall', fx: 'flash', npcAnim: { thief: 'fall', coworker: 'angry' } } }
          ] },
        { label: 'Một mình xông vào khống chế ngay',
          outcomes: [
            { p: 0.45, text: 'Bạn lao vào như tên bắn, bẻ quặt tay hắn trước khi hắn kịp phản ứng. Gan thì có gan, nhưng chỉ huy vừa khen vừa mắng: “Lần sau mà làm liều nữa là tôi kỷ luật!”',
              effects: { happy: 7, looks: 2, flag: ['job_canhsat_truybat', 'job_canhsat_congtrang'], followUp: { id: 's_job_canhsat_chiencong', delay: 1 } },
              scene: { anim: 'lift', fx: 'flash', npcAnim: { thief: 'fall', coworker: 'cheer' } } },
            { p: 0.47, text: 'Lưỡi dao vung lên trúng vai bạn. Hắn bị bắt, còn bạn nằm viện ba tuần, khâu mười hai mũi.',
              effects: { health: -15, happy: -8, illness: 'Chấn thương cơ', flag: 'job_canhsat_truybat' },
              scene: { anim: 'fall', expr: 'sick', fx: 'flash', loc: 'hospital', npcAnim: { coworker: 'scared' } } },
            { p: 0.08, text: 'Bạn không chờ đồng đội. Trong con hẻm tối, một nhát dao oan nghiệt đã cướp đi người chiến sĩ trẻ. Hôm đưa tiễn, cả phường đứng kín hai bên đường.',
              effects: { die: 'Hy sinh khi làm nhiệm vụ' },
              scene: { anim: 'dead', fx: 'tears', time: 'night', npcAnim: { coworker: 'cry', crowd: 'pray' } } }
          ] },
        { label: 'Đứng sau, để {coworker} xử lý',
          text: 'Bạn lùi lại “giữ hiện trường”. Tổ hỗ trợ tới bắt được người, nhưng cả đội nhìn bạn bằng ánh mắt khác hẳn.',
          effects: { happy: -3, karma: -3, flag: 'job_canhsat_truybat' },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { coworker: 'shake' } } }
      ]
    },
    {
      id: 's_job_canhsat_boqua', title: 'Bị mời “bỏ qua” vi phạm', icon: '💵', age: [22, 60], weight: 1.6,
      req: { jobId: ['canhsat'], notFlag: 'job_canhsat_boqua' },
      text: 'Chốt kiểm tra nồng độ cồn lúc 11 giờ đêm. Chiếc xe sang thổi ra mức kịch khung. Người lái hạ kính, dúi vào tay bạn một phong bì dày cỡ {money:20000000}: “Anh em cả, bỏ qua cho em lần này, chỗ này uống cà phê.”',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'talk', expr: 'happy', say: 'Anh em cả mà, uống cà phê thôi!' }, { role: 'coworker', anim: 'idle' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Trả phong bì, lập biên bản đúng luật',
          text: 'Bạn đẩy phong bì lại, lập biên bản, tạm giữ xe. Ông ta gọi điện khắp nơi, hăm dọa “mai cậu biết tay”. Nhưng sáng hôm sau, chỉ huy lại vỗ vai khen bạn trước toàn đội.',
          effects: { karma: 10, happy: 4, flag: ['job_canhsat_boqua', 'job_canhsat_congtrang'] },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'angry', coworker: 'nod' }, npcSay: { stranger: 'Cậu biết tôi là ai không?' } } },
        { label: 'Lập biên bản thêm tội đưa hối lộ',
          success: { stat: 'smarts', base: 0.5, scale: 0.3 },
          outcomes: [
            { text: 'Camera gắn ngực ghi rõ cảnh đưa phong bì. Vụ việc được báo lên trên, bạn được biểu dương là tấm gương liêm chính, kèm suất tăng lương sớm.',
              effects: { karma: 12, happy: 8, job: 'raise', flag: ['job_canhsat_boqua', 'job_canhsat_congtrang'], followUp: { id: 's_job_canhsat_chiencong', delay: 1 } },
              scene: { anim: 'point', fx: 'levelup', npcAnim: { stranger: 'scared', coworker: 'clap' } } },
            { text: 'Hóa ra ông ta quen biết rộng. Hồ sơ “thất lạc”, còn bạn bị điều ra trực chốt ngoại thành. Dù vậy, bạn ngủ ngon.',
              effects: { karma: 10, happy: -5, flag: 'job_canhsat_boqua' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'Nhận phong bì, cho xe đi',
          text: 'Phong bì nằm gọn trong túi áo. Chiếc xe lừ lừ chạy mất. {coworker} quay đi như không thấy gì, nhưng bạn không để ý bên kia đường có ai đó đang giơ điện thoại.',
          effects: { money: 20000000, karma: -15, happy: 2, flag: ['job_canhsat_boqua', 'job_canhsat_nhanhoilo'], followUp: { id: 's_job_canhsat_bilo', delay: 1 } },
          scene: { anim: 'idle', fx: 'money', npcAnim: { stranger: 'wave', coworker: 'shrug' } } }
      ]
    },
    {
      id: 's_job_canhsat_bilo', title: 'Đoạn clip ở chốt đêm', icon: '📹', age: [22, 65], chainOnly: true,
      req: { jobId: ['canhsat'] },
      text: 'Một đoạn clip 40 giây lan khắp TikTok: cảnh chiến sĩ nhận phong bì rồi cho chiếc xe vi phạm nồng độ cồn đi tiếp. Gương mặt bạn dù mờ nhưng ai trong đơn vị cũng nhận ra. Thanh tra công an gọi bạn lên làm việc.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'm', age: 52, anim: 'angry', say: 'Cậu giải thích đi.' }, { role: 'police', anim: 'type' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Nhận hết, nộp lại tiền', req: { flag: 'job_canhsat_nhanhoilo' },
          text: 'Bạn nộp lại số tiền và viết bản tường trình thật thà. Vì thành khẩn, bạn chỉ bị kỷ luật cảnh cáo, hạ bậc lương, nhưng vết nhơ đó theo bạn rất lâu.',
          effects: { money: -20000000, karma: 6, happy: -10, unflag: 'job_canhsat_nhanhoilo' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { boss: 'shake' } } },
        { label: 'Chối, nói đó chỉ là giấy tờ xe',
          success: { stat: 'smarts', base: 0.2, scale: 0.3 },
          outcomes: [
            { text: 'Góc quay quá xa, không chứng minh được gì. Vụ việc khép lại, nhưng bạn biết từ nay mình bị “để mắt”.',
              effects: { happy: -4, karma: -5 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'think' } } },
            { text: 'Người lái xe bị bắt vì vụ khác và khai ra tất cả. Bạn bị tước quân hàm, buộc thôi việc, còn bị điều tra tội nhận hối lộ.',
              effects: { happy: -18, karma: -8, money: -20000000, job: 'fire', log: 'Bị tước quân hàm, buộc thôi việc vì nhận hối lộ.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'point', police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_canhsat_chiencong', title: 'Lập chiến công', icon: '🎖️', age: [22, 65], weight: 1.3,
      req: { jobId: ['canhsat'], flag: 'job_canhsat_congtrang', notFlag: 'job_canhsat_chiencong' },
      text: 'Chuyên án ma túy bạn theo suốt nửa năm cuối cùng cũng phá được: 12 đối tượng, hơn chục bánh heroin. Trong buổi lễ, giám đốc công an tỉnh gắn huân chương lên ngực áo bạn. Phóng viên vây kín, chờ bạn nói vài lời.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'bow', expr: 'happy',
        npcs: [{ role: 'boss', gender: 'm', age: 55, anim: 'clap', say: 'Đồng chí xứng đáng!' }, { role: 'coworker', anim: 'clap' }, { role: 'crowd', anim: 'clap' }], fx: 'confetti', shot: 'orbit' },
      choices: [
        { label: 'Nhường công cho cả tổ',
          text: 'Bạn chỉ về phía đồng đội: “Chiến công này của cả tổ, của những đêm không ngủ.” Cả hội trường vỗ tay rền. Tháng sau, bạn được đề bạt.',
          effects: { happy: 10, karma: 6, job: 'promote', flag: 'job_canhsat_chiencong' },
          scene: { anim: 'point', fx: 'levelup', npcAnim: { coworker: 'cheer', crowd: 'clap' } } },
        { label: 'Trả lời phỏng vấn thật hoành tráng',
          text: 'Bạn kể vanh vách từng pha truy đuổi. Lên báo, lên truyền hình, ai cũng biết mặt. Đề bạt có, nhưng vài đồng đội thấy hơi chạnh lòng.',
          effects: { happy: 12, looks: 5, job: 'promote', flag: 'job_canhsat_chiencong' },
          scene: { anim: 'talk', fx: 'stars', npcAnim: { coworker: 'shrug' } } },
        { label: 'Lặng lẽ về thăm mẹ một đối tượng',
          text: 'Tối đó bạn mang túi gạo đến nhà một cậu thanh niên trong đường dây, nơi bà mẹ già đang khóc. Bạn hứa sẽ giúp cậu tìm việc khi mãn hạn. Chiến công lớn nhất có khi là thế.',
          effects: { happy: 6, karma: 12, job: 'raise', flag: 'job_canhsat_chiencong' },
          scene: { loc: 'countryside', time: 'dusk', anim: 'hug', fx: 'hearts', npcAnim: { crowd: 'cry' } } }
      ]
    },
    // ======================= LÍNH CỨU HỎA =======================
    {
      id: 's_job_cuuhoa_chungcu', title: 'Đám cháy chung cư lúc nửa đêm', icon: '🔥', age: [18, 55], weight: 1.7,
      req: { jobId: ['cuuhoa'], notFlag: 'job_cuuhoa_chungcu' },
      text: 'Hai giờ sáng, chuông báo động rú lên. Một chung cư mini chín tầng bốc cháy từ bãi xe tầng trệt, khói đen cuồn cuộn nuốt lấy cầu thang duy nhất. Trên các ô cửa sổ, đèn pin điện thoại chớp nháy, có tiếng trẻ con khóc.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'run', expr: 'scared', say: 'Kéo vòi lên! Nhanh!',
        npcs: [{ role: 'boss', gender: 'm', age: 45, anim: 'point', say: 'Tổ một vào cầu thang, tổ hai dựng thang!' }, { role: 'coworker', anim: 'run' }, { role: 'crowd', anim: 'scared', say: 'Cứu với!' }], fx: 'smoke', shot: 'dramatic' },
      choices: [
        { label: 'Theo lệnh: đeo bình dưỡng khí, mở đường cầu thang',
          success: { stat: 'health', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn và {coworker} dập lửa từng chiếu nghỉ, mở được lối thoát cho hơn ba mươi người. Lên tới tầng bảy, bộ đàm báo: còn hai mẹ con kẹt trên ban công.',
              effects: { happy: 5, karma: 6, flag: 'job_cuuhoa_chungcu', followUp: { id: 's_job_cuuhoa_macket', delay: 0 } },
              scene: { anim: 'lift', fx: 'smoke', npcAnim: { coworker: 'run', crowd: 'run' } } },
            { text: 'Nhiệt độ trong cầu thang quá cao, bạn trượt chân ngã đập vai xuống bậc. Vẫn cố gượng lên tầng bảy, nơi có hai mẹ con đang kẹt.',
              effects: { health: -8, illness: 'Chấn thương cơ', flag: 'job_cuuhoa_chungcu', followUp: { id: 's_job_cuuhoa_macket', delay: 0 } },
              scene: { anim: 'fall', fx: 'smoke', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Leo xe thang lên thẳng các tầng cao',
          text: 'Bạn đứng trên giỏ thang nâng, nhìn từng ô cửa qua làn khói. Mười hai người được đưa xuống an toàn. Ở tầng bảy, một bàn tay nhỏ thò qua song sắt “chuồng cọp”.',
          effects: { happy: 4, karma: 5, flag: 'job_cuuhoa_chungcu', followUp: { id: 's_job_cuuhoa_macket', delay: 0 } },
          scene: { anim: 'wave', fx: 'smoke', shot: 'low', npcAnim: { crowd: 'cheer' } } },
        { label: 'Ở dưới chỉ dẫn, trấn an cư dân',
          text: 'Bạn cầm loa hướng dẫn mọi người lấy khăn ướt bịt mũi, đóng cửa, ra ban công. Nhờ vậy không ai hoảng loạn nhảy xuống. Việc nhỏ, nhưng cứu nhiều mạng.',
          effects: { happy: 3, smarts: 3, karma: 4, flag: 'job_cuuhoa_chungcu' },
          scene: { anim: 'talk', fx: 'smoke', npcAnim: { boss: 'nod', crowd: 'nod' } } }
      ]
    },
    {
      id: 's_job_cuuhoa_macket', title: 'Cứu người mắc kẹt', icon: '🧯', age: [18, 60], chainOnly: true,
      req: { jobId: ['cuuhoa'] },
      text: 'Ban công tầng bảy bị bọc kín bởi khung sắt “chuồng cọp”. Một người mẹ ôm đứa con chừng năm tuổi, cả hai ho sặc sụa, lửa đã liếm tới cửa phòng sau lưng. Khung sắt hàn chặt, khói mỗi lúc một dày.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'lift', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 32, anim: 'cry', say: 'Cứu con tôi trước!' }, { role: 'kid', anim: 'cry' }, { role: 'coworker', anim: 'lift' }], fx: 'smoke', shot: 'close' },
      choices: [
        { label: 'Dùng kìm thủy lực cắt khung sắt',
          success: { stat: 'health', base: 0.5, scale: 0.35 },
          outcomes: [
            { text: 'Tiếng kim loại rít lên, khung sắt bung ra. Bạn ôm đứa bé, {coworker} dìu người mẹ, cả bốn trượt xuống giỏ thang vừa lúc phòng sau lưng bùng lửa. Dưới đường, người ta vỗ tay như sấm.',
              effects: { happy: 12, karma: 12, looks: 3, flag: 'job_cuuhoa_cuunguoi', followUp: { id: 's_job_cuuhoa_camon', delay: 2 } },
              scene: { anim: 'hug', fx: 'sparkle', npcAnim: { stranger: 'cry', kid: 'hug', coworker: 'cheer' } } },
            { text: 'Kìm kẹt giữa chừng, mất thêm ba phút quý giá. Cuối cùng cũng cứu được hai mẹ con, nhưng bạn hít quá nhiều khói và ngất ngay khi xuống tới đất.',
              effects: { health: -12, karma: 10, illness: 'Viêm phổi', flag: 'job_cuuhoa_cuunguoi', followUp: { id: 's_job_cuuhoa_camon', delay: 2 } },
              scene: { anim: 'fall', expr: 'sick', fx: 'smoke', npcAnim: { stranger: 'cry', kid: 'cry' } } }
          ] },
        { label: 'Tháo mặt nạ cho đứa bé thở',
          text: 'Bạn úp mặt nạ dưỡng khí lên mặt đứa nhỏ, nín thở cắt từng thanh sắt. Hai mẹ con an toàn. Bạn nằm viện hai tuần vì phổi bỏng khói, nhưng mỗi lần nhớ lại ánh mắt đứa bé, bạn không hối hận.',
          effects: { health: -14, karma: 15, happy: 6, illness: 'Viêm phổi', flag: 'job_cuuhoa_cuunguoi', followUp: { id: 's_job_cuuhoa_camon', delay: 2 } },
          scene: { anim: 'hug', expr: 'sick', fx: 'hearts', npcAnim: { kid: 'hug', stranger: 'pray' } } },
        { label: 'Chờ đội thang bên kia tiếp cận',
          outcomes: [
            { p: 0.6, text: 'Đội thang áp sát kịp, hai mẹ con được đưa ra theo cửa sổ bên. Bạn giữ an toàn cho mình và đồng đội, đúng điều lệnh.',
              effects: { happy: 4, karma: 4 },
              scene: { anim: 'nod', fx: 'smoke', npcAnim: { stranger: 'cry', kid: 'hug' } } },
            { p: 0.4, text: 'Thang bị vướng dây điện, phải vòng đường khác. Khi tới nơi, người mẹ đã ngất vì ngạt khói. Cô qua khỏi, nhưng bạn day dứt mãi về mấy phút đứng chờ.',
              effects: { happy: -8, karma: 2 },
              scene: { anim: 'sad', fx: 'smoke', npcAnim: { stranger: 'sleep', kid: 'cry' } } }
          ] }
      ]
    },
    {
      id: 's_job_cuuhoa_khoidoc', title: 'Hít phải khói độc', icon: '😷', age: [18, 55], weight: 1.5,
      req: { jobId: ['cuuhoa'], notFlag: 'job_cuuhoa_khoidoc' },
      text: 'Kho nhựa và hóa chất ở khu công nghiệp cháy suốt bốn tiếng. Khói vàng khè, cay xè mắt dù đã đeo mặt nạ. Mái tôn bắt đầu oằn xuống, chỉ huy ra lệnh rút toàn bộ ra ngoài. Đúng lúc đó, một công nhân hét lên rằng bạn của anh ta có thể vẫn còn trong kho.',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'run', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'm', age: 48, anim: 'point', say: 'Rút hết ra! Mái sắp sập!' }, { role: 'coworker', anim: 'run' }, { role: 'stranger', gender: 'm', age: 30, anim: 'cry', say: 'Thằng Tâm còn trong đó!' }], fx: 'smoke', shot: 'dramatic' },
      choices: [
        { label: 'Tuân lệnh rút ra, dùng flycam dò tìm',
          success: { stat: 'smarts', base: 0.5, scale: 0.35 },
          outcomes: [
            { text: 'Camera nhiệt trên flycam phát hiện người công nhân đang trốn sau bồn nước gần cửa sau. Cả đội cắt cửa đưa anh ra an toàn ngay trước khi mái kho đổ xuống.',
              effects: { happy: 8, smarts: 3, karma: 6, flag: 'job_cuuhoa_khoidoc', job: 'raise' },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'hug', boss: 'clap' } } },
            { text: 'Sau hai tiếng, người ta tìm thấy anh công nhân ở nhà trọ: anh đã về từ chiều mà không báo ai. Bạn chỉ bị ho mấy ngày vì khói.',
              effects: { health: -4, happy: 2, flag: 'job_cuuhoa_khoidoc' },
              scene: { anim: 'laugh', fx: 'smoke', npcAnim: { stranger: 'facepalm' } } }
          ] },
        { label: 'Tiếp tục phun nước dù bình khí đã báo cạn',
          text: 'Bạn bám vòi rồng thêm hai mươi phút, tháo mặt nạ khi bình cạn. Đám cháy được khống chế, nhưng đêm đó bạn ho ra đờm đen và phải nhập viện điều trị phổi.',
          effects: { health: -12, happy: -4, karma: 4, illness: 'Viêm phổi', flag: 'job_cuuhoa_khoidoc' },
          scene: { anim: 'sick', expr: 'sick', fx: 'smoke', loc: 'hospital', npcAnim: { coworker: 'scared' } } },
        { label: 'Trái lệnh, quay lại kho đang sập',
          outcomes: [
            { p: 0.32, text: 'Bạn tìm thấy anh Tâm ngất sau dãy kệ, cõng anh ra đúng lúc mái tôn đổ ập. Bạn được cứu một mạng người, nhưng cũng nhận kỷ luật vì trái lệnh chỉ huy.',
              effects: { karma: 12, happy: 6, health: -10, illness: 'Viêm phổi', flag: 'job_cuuhoa_khoidoc' },
              scene: { anim: 'lift', fx: 'smoke', npcAnim: { stranger: 'cry', boss: 'angry' }, npcSay: { boss: 'Cậu điên à!' } } },
            { p: 0.6, text: 'Trong kho không còn ai, chỉ có khói độc đặc quánh. Đồng đội phải lao vào kéo bạn ra trong tình trạng ngạt khói. Bạn nằm viện một tháng và bị đình chỉ công tác.',
              effects: { health: -18, happy: -10, illness: 'Viêm phổi', flag: 'job_cuuhoa_khoidoc' },
              scene: { anim: 'fall', expr: 'sick', fx: 'smoke', npcAnim: { coworker: 'run', boss: 'scared' } } },
            { p: 0.08, text: 'Bạn chạy ngược vào biển lửa. Vài giây sau, mái kho sụp xuống. Người lính cứu hỏa không trở ra nữa. Hôm tiễn đưa, cả đơn vị đứng nghiêm, nước mắt lặng lẽ rơi.',
              effects: { die: 'Hy sinh khi làm nhiệm vụ' },
              scene: { anim: 'dead', fx: 'tears', npcAnim: { coworker: 'cry', boss: 'bow', stranger: 'pray' } } }
          ] }
      ]
    },
    {
      id: 's_job_cuuhoa_camon', title: 'Bức tranh của cậu bé năm ấy', icon: '🖍️', age: [18, 65], chainOnly: true,
      req: { jobId: ['cuuhoa'] },
      text: 'Một buổi chiều, có hai mẹ con đứng chờ trước cổng đơn vị. Bạn nhận ra ngay: hai người bạn cứu khỏi đám cháy chung cư năm nào. Đứa nhỏ giờ đã lên lớp hai, rụt rè đưa bạn bức tranh vẽ chú lính cứu hỏa áo đỏ bế một em bé.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 34, anim: 'bow', say: 'Ơn này mẹ con em nhớ suốt đời.' }, { role: 'kid', anim: 'wave', say: 'Lớn lên con làm lính cứu hỏa!' }, { role: 'boss', anim: 'clap' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Bế bổng cậu bé lên',
          text: 'Bạn bế bổng cậu bé, đội mũ bảo hộ cho nó. Cả đơn vị ra chụp ảnh chung. Bức ảnh lên báo, và cuối năm bạn được đề bạt.',
          effects: { happy: 14, karma: 6, looks: 2, job: 'promote' },
          scene: { anim: 'hug', fx: 'confetti', npcAnim: { kid: 'cheer', stranger: 'cry', boss: 'clap' } } },
        { label: 'Dặn cậu bé học bơi, học thoát hiểm',
          text: 'Bạn ngồi xuống, nghiêm túc dạy cậu bé cách bịt mũi, bò thấp khi có khói. Tuần sau, bạn đề xuất mở lớp kỹ năng thoát hiểm cho trường của cậu và được cấp trên khen thưởng.',
          effects: { happy: 10, karma: 8, smarts: 2, job: 'raise' },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { kid: 'nod', stranger: 'clap' } } }
      ]
    },
    // ======================= BÁC SĨ =======================
    {
      id: 's_job_bacsi_camo', title: 'Ca mổ khó lúc nửa đêm', icon: '🔪', age: [24, 62], weight: 1.6,
      req: { jobId: ['bacsi'], notFlag: 'job_bacsi_camo' },
      text: 'Một giờ sáng, xe cấp cứu đưa vào một thanh niên tai nạn giao thông, vỡ lách, huyết áp tụt dần. Bác sĩ trưởng ca kẹt ở một ca khác, gọi mãi không được. Kíp gây mê đã sẵn sàng, tất cả nhìn về phía bạn.',
      scene: { loc: 'hospital', time: 'night', weather: 'rain', anim: 'think', expr: 'scared',
        npcs: [{ role: 'coworker', gender: 'f', anim: 'talk', say: 'Huyết áp 70 rồi bác sĩ ơi!' }, { role: 'stranger', gender: 'f', age: 50, anim: 'cry', say: 'Cứu con tôi với!' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Tự cầm dao mổ',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Ba tiếng căng như dây đàn. Khi bạn khâu mũi cuối, monitor đã đều nhịp trở lại. Sáng ra, trưởng khoa đọc biên bản ca mổ, gật gù: “Tay nghề chắc rồi đấy.”',
              effects: { happy: 12, smarts: 5, karma: 8, job: 'promote', flag: 'job_bacsi_camo' },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { coworker: 'clap', stranger: 'pray' }, npcSay: { stranger: 'Cảm ơn bác sĩ!' } } },
            { text: 'Bạn đã làm hết sức, nhưng tổn thương quá nặng. Bệnh nhân không qua khỏi. Bạn bước ra hành lang, chưa kịp tháo khẩu trang thì người nhà đã ùa tới.',
              effects: { happy: -12, smarts: 3, flag: 'job_bacsi_camo', followUp: { id: 's_job_bacsi_hanhhung', delay: 0 } },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { stranger: 'angry', coworker: 'sad' } } }
          ] },
        { label: 'Hội chẩn qua video với trưởng khoa',
          success: { stat: 'smarts', base: 0.55, scale: 0.35 },
          outcomes: [
            { text: 'Trưởng khoa đang ở nhà, mở video hướng dẫn từng bước. Ca mổ thành công. Bạn học được nhiều hơn cả một học kỳ ở trường.',
              effects: { happy: 8, smarts: 6, karma: 5, flag: 'job_bacsi_camo' },
              scene: { anim: 'phone', fx: 'idea', npcAnim: { coworker: 'nod', stranger: 'pray' } } },
            { text: 'Sóng điện thoại chập chờn, cuộc gọi đứt giữa chừng. Bạn phải tự xoay xở phần cuối. Bệnh nhân qua cơn nguy kịch nhưng nằm hồi sức rất lâu.',
              effects: { happy: 2, smarts: 4, health: -3, flag: 'job_bacsi_camo' },
              scene: { anim: 'think', fx: 'sweat', npcAnim: { coworker: 'scared' } } }
          ] },
        { label: 'Chuyển tuyến lên bệnh viện trung ương',
          outcomes: [
            { p: 0.55, text: 'Xe cấp cứu hú còi lao đi trong mưa. Ca mổ ở tuyến trên thành công. Bạn an toàn về chuyên môn, nhưng lòng vẫn hơi gợn: liệu mình có đủ can đảm?',
              effects: { happy: 1, karma: 2, flag: 'job_bacsi_camo' },
              scene: { anim: 'phone', fx: 'question', npcAnim: { stranger: 'run' } } },
            { p: 0.45, text: 'Bệnh nhân trụy mạch trên đường chuyển viện. Gia đình làm đơn khiếu nại, hội đồng chuyên môn xem xét trách nhiệm của bạn.',
              effects: { happy: -10, karma: -3, flag: 'job_bacsi_camo', followUp: { id: 's_job_bacsi_hanhhung', delay: 0 } },
              scene: { anim: 'sad', fx: 'exclaim', npcAnim: { stranger: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_bacsi_hanhhung', title: 'Người nhà bệnh nhân hành hung', icon: '👊', age: [24, 62], weight: 1.4,
      req: { jobId: ['bacsi'], notFlag: 'job_bacsi_hanhhung' },
      text: 'Hành lang khoa cấp cứu ồn ào. Một nhóm người nhà bệnh nhân xông vào, gã cầm đầu túm cổ áo bạn, gào lên rằng bệnh viện “giết người”. Điện thoại giơ lên tứ phía, có người đã bật livestream.',
      scene: { loc: 'hospital', time: 'night', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'thug', gender: 'm', age: 35, anim: 'angry', say: 'Mày giết người nhà tao!' }, { role: 'crowd', anim: 'phone' }, { role: 'coworker', gender: 'f', anim: 'scared', say: 'Gọi bảo vệ!' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Giữ bình tĩnh, mời vào phòng giải thích',
          success: { stat: 'karma', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn không giằng co, chỉ nói chậm rãi: “Anh có quyền được biết mọi chuyện. Mời anh vào phòng, tôi đưa hồ sơ cho anh xem.” Gã khựng lại, rồi òa khóc. Đoạn livestream được chia sẻ hàng nghìn lần với lời khen dành cho bạn.',
              effects: { happy: 4, karma: 10, looks: 2, flag: 'job_bacsi_hanhhung' },
              scene: { anim: 'talk', fx: 'sparkle', npcAnim: { thug: 'cry', crowd: 'clap' } } },
            { text: 'Gã không nghe, vung tay đấm thẳng vào mặt bạn. Bạn ngã đập đầu vào thành giường bệnh, phải khâu năm mũi trên trán.',
              effects: { health: -10, happy: -8, illness: 'Chấn thương phần mềm', flag: 'job_bacsi_hanhhung' },
              scene: { anim: 'fall', fx: 'flash', npcAnim: { thug: 'angry', coworker: 'scared' } } }
          ] },
        { label: 'Lùi lại, gọi bảo vệ và công an',
          text: 'Bạn lùi vào phòng cấp cứu, bấm chuông báo động. Công an phường có mặt sau mười phút, gã cầm đầu bị khởi tố tội gây rối. Bạn an toàn, nhưng mấy đêm liền vẫn giật mình vì tiếng hét.',
          effects: { happy: -5, smarts: 2, flag: 'job_bacsi_hanhhung' },
          scene: { anim: 'phone', fx: 'exclaim', npcAnim: { thug: 'angry', coworker: 'run' } } },
        { label: 'Đánh trả cho bõ tức',
          outcomes: [
            { p: 0.4, text: 'Bạn gạt tay hắn, đẩy mạnh. Hắn ngã chổng vó. Nhưng clip bị cắt đúng đoạn bạn ra tay, tiêu đề “Bác sĩ đánh người nhà bệnh nhân” lan khắp mạng. Bạn bị kỷ luật cảnh cáo.',
              effects: { happy: -10, karma: -6, looks: -3, flag: 'job_bacsi_hanhhung' },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { thug: 'fall', crowd: 'phone' } } },
            { p: 0.6, text: 'Một chọi bốn. Bạn bị đánh hội đồng ngay trong phòng trực, gãy hai xương sườn. Ngành y lại thêm một ngày buồn.',
              effects: { health: -15, happy: -10, illness: 'Gãy xương sườn', flag: 'job_bacsi_hanhhung' },
              scene: { anim: 'fall', expr: 'sick', fx: 'flash', npcAnim: { thug: 'angry', crowd: 'scared' } } }
          ] }
      ]
    },
    {
      id: 's_job_bacsi_phongbi', title: 'Phong bì cảm ơn', icon: '✉️', age: [24, 62], weight: 1.5,
      req: { jobId: ['bacsi'], notFlag: 'job_bacsi_phongbi' },
      text: 'Trước ca mổ tim của mẹ, anh con trai giám đốc kéo bạn ra góc cầu thang, nhét vào túi áo blouse một phong bì dày cộm cỡ {money:30000000}: “Em gửi anh chút lòng thành, mổ cho mẹ em kỹ kỹ nhé.” Camera hành lang ngay phía trên đầu.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 40, anim: 'talk', expr: 'happy', say: 'Chút lòng thành thôi anh!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Trả lại, hứa sẽ mổ như mọi ca',
          text: 'Bạn nhét phong bì lại vào tay anh ta: “Ai tôi cũng mổ kỹ như nhau, anh yên tâm.” Ca mổ thành công. Sau này anh ta gửi thư khen lên ban giám đốc, nhắc đúng chuyện cái phong bì bị trả lại.',
          effects: { karma: 12, happy: 6, job: 'raise', flag: 'job_bacsi_phongbi' },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'bow' } } },
        { label: 'Nhận, chuyển vào quỹ bệnh nhân nghèo',
          text: 'Bạn nhận, rồi chiều đó nộp nguyên phong bì vào quỹ “Bữa cơm 0 đồng” của bệnh viện, ghi tên người tặng. Ba bệnh nhân nghèo được hỗ trợ viện phí nhờ số tiền ấy.',
          effects: { karma: 10, happy: 5, flag: 'job_bacsi_phongbi' },
          scene: { anim: 'nod', fx: 'hearts', npcAnim: { stranger: 'clap' } } },
        { label: 'Bỏ túi, coi như lương mềm',
          text: 'Phong bì nằm yên trong túi áo. Ca mổ thuận lợi, ai cũng vui. Bạn tự nhủ “ai cũng thế cả”, mà quên rằng camera hành lang không biết nói dối.',
          effects: { money: 30000000, karma: -12, happy: 3, flag: ['job_bacsi_phongbi', 'job_bacsi_nhanphongbi'], followUp: { id: 's_job_bacsi_thanhtra', delay: 1 } },
          scene: { anim: 'idle', fx: 'money', npcAnim: { stranger: 'wave' } } }
      ]
    },
    {
      id: 's_job_bacsi_thanhtra', title: 'Đoạn camera hành lang', icon: '📼', age: [24, 65], chainOnly: true,
      req: { jobId: ['bacsi'] },
      text: 'Một tờ báo điện tử đăng loạt bài “Phong bì trong bệnh viện”, kèm ảnh cắt từ camera hành lang: bóng áo blouse nhận phong bì ở góc cầu thang. Sở Y tế lập đoàn thanh tra, và giám đốc gọi bạn lên phòng.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'm', age: 56, anim: 'angry', say: 'Người trong ảnh là cậu phải không?' }, { role: 'police', anim: 'type' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Thừa nhận, xin nộp lại tiền', req: { flag: 'job_bacsi_nhanphongbi' },
          text: 'Bạn thừa nhận, nộp lại toàn bộ số tiền. Hội đồng kỷ luật hạ bậc, cắt thi đua ba năm. Bạn vẫn được cầm dao mổ, nhưng ánh nhìn của đồng nghiệp đã khác.',
          effects: { money: -30000000, karma: 5, happy: -10, unflag: 'job_bacsi_nhanphongbi' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { boss: 'shake' } } },
        { label: 'Chối, nói đó chỉ là hồ sơ bệnh án',
          success: { stat: 'smarts', base: 0.25, scale: 0.3 },
          outcomes: [
            { text: 'Hình ảnh quá mờ, người tặng cũng không muốn làm to chuyện. Bạn thoát, nhưng từ nay mỗi khi thấy camera, tim lại thót một nhịp.',
              effects: { happy: -4, karma: -5 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'think' } } },
            { text: 'Người nhà bệnh nhân xác nhận đã đưa {money:30000000}. Bạn bị buộc thôi việc, chứng chỉ hành nghề bị đình chỉ.',
              effects: { happy: -18, karma: -8, money: -30000000, job: 'fire', log: 'Bị buộc thôi việc vì nhận phong bì của người nhà bệnh nhân.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    // ======================= ĐIỀU DƯỠNG =======================
    {
      id: 's_job_dieuduong_khotinh', title: 'Bệnh nhân khó tính', icon: '😠', age: [22, 60], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['dieuduong'] },
      text: 'Ông cụ giường số 7 lại hất đổ khay cơm, quát ầm cả phòng rằng cháo “như nước rửa bát”, tiêm thì “đau như bị đâm”. Con cái ông bận làm ăn, cả tuần chưa ai vào thăm. Bạn đứng giữa đống cháo vương vãi, ca trực còn sáu tiếng nữa.',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'idle', expr: 'sad',
        npcs: [{ role: 'stranger', gender: 'm', age: 78, anim: 'angry', say: 'Cút ra! Tao không ăn!' }, { role: 'coworker', gender: 'f', anim: 'shrug' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Ngồi xuống, kiên nhẫn trò chuyện',
          text: 'Bạn dọn sạch sàn, rồi kéo ghế ngồi cạnh giường, hỏi ông về quê, về thời trai trẻ. Ông im lặng hồi lâu rồi kể chuyện đi bộ đội. Bát cháo thứ hai, ông ăn hết.',
          effects: { happy: 4, karma: 8, health: -1, flag: 'job_dieuduong_tamhuyet', followUp: { id: 's_job_dieuduong_nhoon', delay: 2 } },
          scene: { anim: 'sit', fx: 'hearts', npcAnim: { stranger: 'talk' }, npcSay: { stranger: 'Hồi đó ông ở Quảng Trị...' } } },
        { label: 'Nhờ đồng nghiệp đổi phòng chăm sóc',
          text: '{coworker} nhận thay, bạn qua phòng bên. Nhẹ đầu được mấy hôm, nhưng điều dưỡng trưởng nhắc khéo: “Nghề mình đâu chọn được bệnh nhân, em.”',
          effects: { happy: 2, karma: -2 },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { coworker: 'sad' } } },
        { label: 'Đáp lại thẳng thừng',
          outcomes: [
            { p: 0.5, text: 'Bạn gắt lại một câu. Ông cụ gọi điện cho con trai, hôm sau đơn khiếu nại nằm trên bàn điều dưỡng trưởng. Bạn bị trừ thi đua tháng.',
              effects: { happy: -6, karma: -4, money: -1500000 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { stranger: 'phone' } } },
            { p: 0.5, text: 'Ông cụ khựng lại, rồi bật cười: “Đứa này được, cứng đấy!” Từ đó ông chịu ăn, chỉ tiêm khi có bạn.',
              effects: { happy: 5, karma: 1 },
              scene: { anim: 'laugh', fx: 'question', npcAnim: { stranger: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 's_job_dieuduong_dichbenh', title: 'Ca trực dịch bệnh căng thẳng', icon: '🦠', age: [22, 60], weight: 1.5,
      req: { jobId: ['dieuduong'], notFlag: 'job_dieuduong_dichbenh' },
      text: 'Dịch cúm biến chủng bùng phát, khoa hồi sức chật kín, giường kê ra tận hành lang. Bạn đã mặc đồ bảo hộ kín mít suốt mười bốn tiếng, mồ hôi đọng thành vũng trong ủng. Điều dưỡng trưởng hỏi: ai có thể trực tiếp ca đêm?',
      scene: { loc: 'hospital', time: 'night', weather: 'rain', anim: 'sit', expr: 'sleepy',
        npcs: [{ role: 'boss', gender: 'f', age: 48, anim: 'talk', say: 'Ai trụ được thêm ca đêm không?' }, { role: 'coworker', anim: 'sleep' }, { role: 'stranger', anim: 'sick' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Giơ tay xin trực tiếp',
          outcomes: [
            { p: 0.6, text: 'Bạn trụ thêm một đêm, cứu kịp hai bệnh nhân trở nặng lúc rạng sáng. Hết đợt dịch, bạn được tặng bằng khen và đề bạt.',
              effects: { health: -8, karma: 10, happy: 6, job: 'promote', flag: ['job_dieuduong_dichbenh', 'job_dieuduong_tamhuyet'], followUp: { id: 's_job_dieuduong_nhoon', delay: 2 } },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { boss: 'clap', stranger: 'nod' } } },
            { p: 0.4, text: 'Gần sáng, bạn sốt cao, ho không dứt. Kết quả xét nghiệm dương tính, bạn thành bệnh nhân ngay tại khoa mình.',
              effects: { health: -14, happy: -6, karma: 8, illness: 'Viêm phổi', flag: ['job_dieuduong_dichbenh', 'job_dieuduong_tamhuyet'] },
              scene: { anim: 'sick', expr: 'sick', fx: 'sick', npcAnim: { boss: 'scared', coworker: 'run' } } }
          ] },
        { label: 'Xin về nghỉ, sức khỏe là trên hết',
          text: 'Bạn thành thật nói mình không trụ nổi nữa. Điều dưỡng trưởng gật đầu, sắp xếp người khác. Về nhà, bạn ngủ một mạch mười hai tiếng, áy náy nhưng tỉnh táo.',
          effects: { health: 4, happy: -2, flag: 'job_dieuduong_dichbenh' },
          scene: { anim: 'sleep', loc: 'bedroom', fx: 'zzz' } },
        { label: 'Đề xuất chia ca xoay vòng hợp lý',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn lập bảng chia ca bốn tiếng, xoay vòng có nghỉ. Cả khoa đỡ kiệt sức hẳn, sai sót giảm rõ. Phòng điều dưỡng bệnh viện nhân rộng cách làm của bạn.',
              effects: { smarts: 5, happy: 5, karma: 5, job: 'raise', flag: 'job_dieuduong_dichbenh' },
              scene: { anim: 'type', fx: 'idea', npcAnim: { boss: 'nod', coworker: 'clap' } } },
            { text: 'Đề xuất hay, nhưng không đủ người để chia. Cuối cùng bạn vẫn phải trực tiếp, và lần này kiệt sức thật sự.',
              effects: { health: -8, happy: -4, flag: 'job_dieuduong_dichbenh' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { boss: 'shrug' } } }
          ] }
      ]
    },
    {
      id: 's_job_dieuduong_nhoon', title: 'Được bệnh nhân nhớ ơn', icon: '💐', age: [22, 65], weight: 1.3,
      req: { jobId: ['dieuduong'], flag: 'job_dieuduong_tamhuyet', notFlag: 'job_dieuduong_nhoon' },
      text: 'Một sáng, quầy trực khoa nhận được bó hoa và tấm thiệp viết tay gửi đích danh bạn. Người gửi là gia đình một bệnh nhân bạn từng chăm sóc những ngày khó khăn nhất. Họ còn viết thư khen lên giám đốc bệnh viện và đăng bài cảm ơn lên Facebook, hơn mười nghìn lượt thích.',
      scene: { loc: 'hospital', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 45, anim: 'bow', say: 'Nhờ em mà bố chị khỏe lại.' }, { role: 'boss', anim: 'clap' }, { role: 'coworker', anim: 'clap' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Nhận hoa, rưng rưng cảm ơn',
          text: 'Bạn cầm tấm thiệp mà nước mắt rơi lúc nào không biết. Những đêm trực mỏi rã rời bỗng thấy đáng giá. Cuối năm, bạn được bình chọn “Điều dưỡng tận tâm” toàn viện.',
          effects: { happy: 12, karma: 5, job: 'raise', flag: 'job_dieuduong_nhoon' },
          scene: { anim: 'cry', expr: 'happy', fx: 'hearts', npcAnim: { stranger: 'hug', coworker: 'cheer' } } },
        { label: 'Từ chối phong bì kèm theo',
          text: 'Trong thiệp có kẹp {money:5000000}. Bạn gửi trả lại, chỉ giữ bó hoa. Câu chuyện được bệnh viện đưa vào buổi chào cờ đầu tuần, bạn đỏ mặt suốt cả buổi.',
          effects: { happy: 8, karma: 10, looks: 1, flag: 'job_dieuduong_nhoon' },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'bow', boss: 'nod' } } }
      ]
    },
    // ======================= DƯỢC SĨ =======================
    {
      id: 's_job_duocsi_khongdon', title: 'Bị ép bán thuốc không đơn', icon: '💊', age: [23, 62], weight: 1.6,
      req: { jobId: ['duocsi'], notFlag: 'job_duocsi_khongdon' },
      text: 'Chủ nhà thuốc dặn đi dặn lại: “Khách hỏi kháng sinh, thuốc cảm có corticoid thì cứ bán, đơn từ gì, không bán thì nhà thuốc khác bán.” Chiều nay một bà mẹ trẻ bế con ba tuổi đến, xin “thuốc kháng sinh loại mạnh nhất” vì bé sốt hai hôm.',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'f', age: 27, anim: 'talk', say: 'Bán cho chị loại mạnh nhất nhé!' }, { role: 'kid', age: 3, anim: 'sick' }, { role: 'boss', anim: 'point', say: 'Bán đi em!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Từ chối, khuyên đưa bé đi khám',
          text: 'Bạn giải thích rằng sốt hai ngày chưa chắc đã cần kháng sinh, rồi chỉ đường tới phòng khám nhi gần nhất. Bà mẹ cảm ơn. Chủ nhà thuốc thì lườm bạn cả buổi và trừ thưởng doanh số tháng này.',
          effects: { karma: 10, happy: 2, money: -2000000, flag: 'job_duocsi_khongdon' },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { stranger: 'bow', boss: 'angry' } } },
        { label: 'Bán theo lệnh chủ',
          text: 'Bạn bán vỉ kháng sinh và gói thuốc hạ sốt có corticoid. Doanh số đẹp, chủ vui. Nhưng ba ngày sau, bà mẹ quay lại, mặt tái mét.',
          effects: { money: 1500000, karma: -8, flag: ['job_duocsi_khongdon', 'job_duocsi_banbua'], followUp: { id: 's_job_duocsi_hauqua', delay: 0 } },
          scene: { anim: 'idle', fx: 'money', npcAnim: { boss: 'nod', stranger: 'walk' } } },
        { label: 'Báo cáo lên Sở Y tế',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Đoàn thanh tra về làm việc, nhà thuốc bị phạt và chấn chỉnh. Một chuỗi nhà thuốc lớn biết chuyện, mời bạn về làm với mức lương cao hơn.',
              effects: { karma: 12, happy: 6, job: 'raise', flag: 'job_duocsi_khongdon' },
              scene: { anim: 'phone', fx: 'levelup', npcAnim: { boss: 'scared' } } },
            { text: 'Thanh tra chưa thấy đâu, chủ nhà thuốc đã biết ai báo. Bạn bị cho nghỉ việc với lý do “không phù hợp văn hóa”.',
              effects: { karma: 8, happy: -10, job: 'fire', flag: 'job_duocsi_khongdon' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_duocsi_hauqua', title: 'Đứa bé nổi mẩn khắp người', icon: '🚑', age: [23, 65], chainOnly: true,
      req: { jobId: ['duocsi'] },
      text: 'Đứa bé uống thuốc bạn bán thì nổi mẩn đỏ khắp người, phải nhập viện vì dị ứng kháng sinh. Bác sĩ hỏi thuốc mua ở đâu, có đơn không. Bà mẹ cầm vỏ vỉ thuốc đứng trước quầy, giọng run run.',
      scene: { loc: 'market', time: 'day', weather: 'cloudy', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 27, anim: 'cry', say: 'Con tôi suýt chết vì thuốc của các người!' }, { role: 'boss', anim: 'shrug', say: 'Tôi không biết gì đâu nhé.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Nhận trách nhiệm, vào viện lo cho bé', req: { flag: 'job_duocsi_banbua' },
          text: 'Bạn xin lỗi, chạy vào viện, ứng tiền viện phí {money:8000000}. Bé hồi phục sau một tuần. Bà mẹ không kiện, nhưng bạn tự hứa từ nay không bán kháng sinh thiếu đơn nữa, dù chủ nói gì.',
          effects: { money: -8000000, karma: 8, happy: -4, smarts: 3, unflag: 'job_duocsi_banbua' },
          scene: { anim: 'bow', loc: 'hospital', fx: 'tears', npcAnim: { stranger: 'cry' } } },
        { label: 'Đổ hết cho chủ nhà thuốc',
          outcomes: [
            { p: 0.5, text: 'Chủ nhà thuốc bị phạt nặng. Bạn thoát, nhưng bị đuổi việc ngay trong tuần, kèm lời đồn khắp giới dược rằng bạn “đâm sau lưng”.',
              effects: { happy: -8, karma: -3, job: 'fire' },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { boss: 'angry' } } },
            { p: 0.5, text: 'Thanh tra Sở Y tế xác định người trực tiếp bán là bạn. Bạn bị phạt tiền và tạm đình chỉ chứng chỉ hành nghề sáu tháng.',
              effects: { money: -20000000, happy: -12, karma: -4, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { stranger: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_duocsi_thuocgia', title: 'Thuốc giả trà trộn', icon: '🕵️', age: [23, 62], weight: 1.5,
      req: { jobId: ['duocsi'], notFlag: 'job_duocsi_thuocgia' },
      text: 'Lô thuốc tim mạch mới nhập từ một nhà phân phối lạ rẻ hơn thị trường 40%. Bạn soi kỹ: tem chống giả hơi nhòe, số lô in lệch, viên thuốc bẻ ra màu không đều. Gã nhân viên giao hàng cười: “Hàng xách tay chính hãng đấy, lấy thêm em chiết khấu cao.”',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'vendor', gender: 'm', age: 35, anim: 'talk', expr: 'happy', say: 'Chiết khấu 20% cho em!' }, { role: 'boss', anim: 'idle' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Niêm phong, báo quản lý thị trường',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Kết quả kiểm nghiệm: thuốc giả, gần như không có hoạt chất. Công an triệt phá cả đường dây cung cấp cho hơn trăm nhà thuốc. Bạn được báo chí gọi là “người dược sĩ cứu hàng nghìn trái tim”.',
              effects: { karma: 15, happy: 10, looks: 3, smarts: 3, job: 'promote', flag: 'job_duocsi_thuocgia' },
              scene: { anim: 'point', fx: 'levelup', npcAnim: { vendor: 'scared', boss: 'clap' } } },
            { text: 'Bạn báo, nhưng đường dây nhanh chân tẩu tán. Nhà thuốc bị đình chỉ nhập hàng hai tháng để điều tra, lương bạn bị cắt một nửa trong thời gian đó.',
              effects: { karma: 8, money: -6000000, happy: -4, flag: 'job_duocsi_thuocgia' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { vendor: 'run' } } }
          ] },
        { label: 'Lặng lẽ trả lại hàng, không làm to chuyện',
          text: 'Bạn trả lô hàng, không nhập nữa. Yên chuyện cho nhà thuốc mình, nhưng thỉnh thoảng bạn vẫn nghĩ đến những người già đang uống loại thuốc đó ở nơi khác.',
          effects: { karma: 2, happy: -2, flag: 'job_duocsi_thuocgia' },
          scene: { anim: 'shake', fx: 'question', npcAnim: { vendor: 'shrug' } } },
        { label: 'Nhập luôn, lãi gấp đôi',
          outcomes: [
            { p: 0.4, text: 'Thuốc bán chạy vì rẻ. Bạn bỏ túi khoản chiết khấu kha khá, nhưng mỗi lần có cụ già mua thuốc tim, bạn không dám nhìn thẳng.',
              effects: { money: 25000000, karma: -18, happy: -3, flag: 'job_duocsi_thuocgia' },
              scene: { anim: 'idle', fx: 'money', npcAnim: { vendor: 'laugh' } } },
            { p: 0.6, text: 'Ba tháng sau, đường dây bị triệt phá. Danh sách nhà thuốc nhập hàng có tên bạn. Bạn bị thu hồi chứng chỉ hành nghề và phạt {money:100000000}.',
              effects: { money: -100000000, karma: -18, happy: -15, job: 'fire', flag: 'job_duocsi_thuocgia' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_duocsi_chuoi', title: 'Mở chuỗi nhà thuốc', icon: '🏥', age: [27, 60], weight: 1.4,
      req: { jobId: ['duocsi'], minMoney: 300000000, notFlag: 'job_duocsi_chuoi' },
      text: 'Sau nhiều năm đứng quầy, bạn hiểu từng loại thuốc, từng con hẻm khách hay ghé. Một người bạn đại học rủ góp vốn mở nhà thuốc riêng, mục tiêu năm năm thành chuỗi mười cửa hàng. Vốn khởi đầu: {money:300000000} mỗi người.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'classmate', anim: 'talk', say: 'Làm đi, mình làm được mà!' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Góp vốn, làm chủ',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Nhà thuốc đầu tiên đông khách nhờ tư vấn tận tâm. Năm thứ ba, chuỗi đã có sáu cửa hàng, bạn chính thức thành chủ chuỗi nhà thuốc.',
              effects: { money: -300000000, happy: 12, smarts: 4, job: 'promote', flag: 'job_duocsi_chuoi', followUp: { id: 's_job_duocsi_chuoi_2', delay: 2 } },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { classmate: 'hug' } } },
            { text: 'Mặt bằng đắt, chuỗi lớn cạnh tranh khốc liệt. Hai năm sau, nhà thuốc phải sang nhượng, bạn mất gần nửa vốn.',
              effects: { money: -150000000, happy: -10, smarts: 3, flag: 'job_duocsi_chuoi' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { classmate: 'sad' } } }
          ] },
        { label: 'Nhận nhượng quyền của chuỗi lớn',
          text: 'Bạn chọn đường an toàn: nhượng quyền thương hiệu sẵn có. Lời ít hơn nhưng đều. Nhà thuốc nhỏ của bạn chạy ổn định, mỗi tháng có thêm thu nhập.',
          effects: { money: -200000000, happy: 6, job: 'raise', flag: 'job_duocsi_chuoi' },
          scene: { anim: 'nod', fx: 'money', npcAnim: { classmate: 'shrug' } } },
        { label: 'Thôi, làm công cho lành',
          text: 'Bạn từ chối. Lương tháng đều đặn, đêm ngủ ngon. Đôi khi đi ngang những nhà thuốc mới mở, bạn vẫn tự hỏi “giá như”.',
          effects: { happy: -1, flag: 'job_duocsi_chuoi' },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { classmate: 'sad' } } }
      ]
    },
    {
      id: 's_job_duocsi_chuoi_2', title: 'Lời đề nghị từ tập đoàn dược', icon: '🤝', age: [27, 70], chainOnly: true,
      req: { jobId: ['duocsi'] },
      text: 'Chuỗi nhà thuốc của bạn lọt vào mắt một tập đoàn dược lớn. Họ muốn mua lại 51% cổ phần với giá {money:3000000000}, kèm điều kiện ưu tiên bán thuốc của hãng họ trên mọi kệ hàng.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'talk', say: 'Ba tỷ, ký là có tiền ngay.' }, { role: 'classmate', anim: 'think' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Bán cổ phần, chốt lời',
          text: 'Bạn ký. Ba tỷ về tài khoản, bạn vẫn giữ vị trí điều hành, nhưng giờ kệ thuốc đầy hàng của hãng và mỗi quyết định phải xin ý kiến “bên trên”.',
          effects: { money: 3000000000, happy: 8, karma: -2 },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'clap', classmate: 'shrug' } } },
        { label: 'Từ chối, giữ chuỗi độc lập',
          text: 'Bạn lắc đầu: “Nhà thuốc của tôi bán thuốc đúng bệnh, không bán theo hãng.” Chuỗi lớn chậm hơn, nhưng khách tin như tin bác sĩ gia đình.',
          effects: { karma: 8, happy: 6, job: 'raise' },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'shrug', classmate: 'clap' } } }
      ]
    },
    // ======================= GIÁO VIÊN =======================
    {
      id: 's_job_giaovien_suadiem', title: 'Phụ huynh ép sửa điểm', icon: '📝', age: [22, 60], weight: 1.6,
      req: { jobId: ['giaovien'], notFlag: 'job_giaovien_suadiem' },
      text: 'Sát kỳ xét tốt nghiệp, một vị phụ huynh có chức có quyền hẹn bạn ra quán cà phê. Ông đẩy qua bàn một hộp quà, dưới đáy kẹp phong bì {money:15000000}: “Cháu nó thiếu có nửa điểm thôi. Nhờ thầy cô nâng đỡ chút, sau này có việc gì cứ tìm tôi.”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'talk', expr: 'happy', say: 'Nửa điểm thôi mà.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Từ chối, đề nghị phụ đạo thêm cho em',
          text: 'Bạn đẩy hộp quà lại: “Điểm thì em không sửa được, nhưng em sẵn sàng kèm cháu miễn phí hai tuần trước kỳ thi.” Ông ta hậm hực bỏ về. Nhưng cậu học trò thì đến lớp phụ đạo đều đặn, và tự mình đạt đủ điểm.',
          effects: { karma: 12, happy: 6, health: -2, flag: ['job_giaovien_suadiem', 'job_giaovien_tamhuyet'] },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'angry' } } },
        { label: 'Nhận quà, sửa nửa điểm',
          text: 'Chỉ là nửa điểm, bạn tự nhủ. Bút đỏ lướt nhẹ trên sổ điểm. Ông phụ huynh hài lòng ra mặt, nhưng một đồng nghiệp tình cờ thấy bảng điểm gốc và cau mày.',
          effects: { money: 15000000, karma: -12, flag: ['job_giaovien_suadiem', 'job_giaovien_suadiem_nhan'], followUp: { id: 's_job_giaovien_bilo', delay: 1 } },
          scene: { anim: 'type', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Ghi âm, báo hiệu trưởng',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Hiệu trưởng nghe đoạn ghi âm, báo lên Phòng Giáo dục. Vị phụ huynh bị nhắc nhở, còn bạn được nêu gương liêm chính trong hội nghị toàn ngành.',
              effects: { karma: 10, happy: 6, job: 'promote', flag: 'job_giaovien_suadiem' },
              scene: { anim: 'phone', fx: 'levelup', loc: 'school', npcAnim: { stranger: 'scared' } } },
            { text: 'Hiệu trưởng xua tay: “Thôi em, người ta là chỗ quen biết.” Năm sau, bạn bị chuyển xuống dạy điểm trường lẻ cách nhà ba mươi cây số.',
              effects: { karma: 8, happy: -10, flag: 'job_giaovien_suadiem' },
              scene: { anim: 'sad', fx: 'sweat', loc: 'countryside' } }
          ] }
      ]
    },
    {
      id: 's_job_giaovien_bilo', title: 'Bảng điểm gốc', icon: '📄', age: [22, 65], chainOnly: true,
      req: { jobId: ['giaovien'] },
      text: 'Đơn tố cáo nặc danh kèm ảnh chụp bảng điểm gốc được gửi lên Sở Giáo dục. Thanh tra về trường, rà từng cột điểm của lớp bạn chủ nhiệm. Đồng nghiệp tránh nhìn bạn trong phòng giáo viên.',
      scene: { loc: 'school', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'f', age: 54, anim: 'angry', say: 'Cột điểm này là sao đây?' }, { role: 'coworker', anim: 'think' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Thừa nhận và xin lỗi', req: { flag: 'job_giaovien_suadiem_nhan' },
          text: 'Bạn thừa nhận, nộp lại tiền. Hội đồng kỷ luật khiển trách, bạn mất danh hiệu thi đua và phải viết bản kiểm điểm trước tập thể. Bài học đắt giá, nhưng bạn vẫn được đứng lớp.',
          effects: { money: -15000000, karma: 6, happy: -10, unflag: 'job_giaovien_suadiem_nhan' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { boss: 'shake' } } },
        { label: 'Đổ cho lỗi nhập liệu',
          success: { stat: 'smarts', base: 0.3, scale: 0.3 },
          outcomes: [
            { text: 'Phần mềm quản lý điểm năm đó quả thật hay lỗi. Thanh tra chấp nhận giải thích. Bạn thoát, nhưng mất ngủ cả tháng.',
              effects: { happy: -5, karma: -4 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'think' } } },
            { text: 'Lịch sử chỉnh sửa trên hệ thống ghi rõ tài khoản và giờ sửa. Bạn bị buộc thôi việc, câu chuyện lên cả báo địa phương.',
              effects: { happy: -18, karma: -8, looks: -3, job: 'fire', log: 'Bị buộc thôi việc vì sửa điểm cho học sinh.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_giaovien_cabiet', title: 'Học trò cá biệt', icon: '🧒', age: [22, 60], weight: 1.6,
      req: { jobId: ['giaovien'], notFlag: 'job_giaovien_cabiet' },
      text: 'Thằng Tèo lớp bạn: trốn học đi net, đánh nhau, hôm qua còn vẽ bậy lên bảng. Cả trường đề nghị đuổi học. Nhưng bạn để ý, nó hay ngủ gục, áo đồng phục mặc mãi một chiếc, và chưa bao giờ có phụ huynh đến họp.',
      scene: { loc: 'school', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'kid', gender: 'm', age: 14, anim: 'angry', expr: 'angry', say: 'Kệ em! Đuổi luôn đi!' }, { role: 'boss', anim: 'point', say: 'Đuổi học cho xong.' }, { role: 'classmate', anim: 'laugh' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đến tận nhà tìm hiểu',
          text: 'Căn nhà trọ dột nát, mẹ nó đi làm xa, bố nằm liệt giường. Mỗi đêm nó phụ bốc vác ở chợ đầu mối. Bạn xin cho nó suất học bổng, kèm thêm buổi tối. Cuối năm, nó lên lớp, lần đầu tiên đứng thứ hai mươi thay vì bét lớp.',
          effects: { karma: 14, happy: 8, health: -2, money: -3000000, flag: ['job_giaovien_cabiet', 'job_giaovien_tamhuyet'], followUp: { id: 's_job_giaovien_thucamon', delay: 6 } },
          scene: { anim: 'hug', loc: 'home', fx: 'hearts', npcAnim: { kid: 'cry' }, npcSay: { kid: 'Đừng nói với ai nhé...' } } },
        { label: 'Thống nhất kỷ luật nghiêm',
          text: 'Bạn ký vào biên bản đề nghị đình chỉ học. Lớp yên tĩnh hẳn. Nửa năm sau, bạn nghe tin nó bỏ học hẳn, đi làm phụ hồ. Thỉnh thoảng, bạn vẫn nghĩ đến đôi mắt bướng bỉnh ấy.',
          effects: { happy: -4, karma: -4, flag: 'job_giaovien_cabiet' },
          scene: { anim: 'sad', fx: 'question', npcAnim: { kid: 'walk', boss: 'nod' } } },
        { label: 'Giao cho nó làm lớp trưởng',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Cả lớp ồ lên kinh ngạc. Nhưng được tin tưởng lần đầu, thằng Tèo gồng mình giữ trật tự, thậm chí còn bảo vệ các bạn nhỏ khỏi đám trường bên. Thầy cô bắt đầu gọi đây là “phép màu của lớp bạn”.',
              effects: { karma: 10, smarts: 3, happy: 8, flag: ['job_giaovien_cabiet', 'job_giaovien_tamhuyet'], followUp: { id: 's_job_giaovien_thucamon', delay: 6 } },
              scene: { anim: 'clap', fx: 'sparkle', npcAnim: { kid: 'cheer', classmate: 'clap' } } },
            { text: 'Nó lạm quyền bắt nạt cả lớp. Phụ huynh làm đơn phản ánh, bạn bị ban giám hiệu nhắc nhở vì “phương pháp thiếu nghiêm túc”.',
              effects: { happy: -6, flag: 'job_giaovien_cabiet' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { kid: 'laugh', classmate: 'cry' } } }
          ] }
      ]
    },
    {
      id: 's_job_giaovien_thucamon', title: 'Thư cảm ơn sau nhiều năm', icon: '💌', age: [26, 70], weight: 1.3,
      req: { jobId: ['giaovien'], flag: 'job_giaovien_tamhuyet', since: { job_giaovien_tamhuyet: 5 }, notFlag: 'job_giaovien_thucamon' },
      text: 'Ngày 20 tháng 11, giữa đống hoa và thiệp, có một lá thư viết tay dày ba trang. Người gửi là cậu học trò năm xưa bạn từng không bỏ cuộc. Giờ cậu đã là kỹ sư, viết rằng: “Nếu ngày ấy không có người thầy không bỏ cuộc với em, em đã không có ngày hôm nay.”',
      scene: { loc: 'school', time: 'day', weather: 'clear', decor: null, anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 26, anim: 'bow', say: 'Em về thăm trường đây ạ!' }, { role: 'kid', anim: 'clap' }, { role: 'coworker', anim: 'clap' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Đọc thư giữa lớp học',
          text: 'Bạn đọc to lá thư cho lớp hiện tại nghe. Đọc đến đoạn cuối thì nghẹn lại, cả lớp vỗ tay rào rào. Đó là món quà 20/11 đẹp nhất trong đời bạn.',
          effects: { happy: 15, karma: 5, flag: 'job_giaovien_thucamon' },
          scene: { anim: 'cry', expr: 'happy', fx: 'hearts', npcAnim: { kid: 'cheer', coworker: 'clap' } } },
        { label: 'Mời cậu ấy về nói chuyện với học trò',
          text: 'Cậu học trò năm xưa về trường kể chuyện đời mình, còn tài trợ năm suất học bổng mang tên bạn. Ban giám hiệu đề cử bạn danh hiệu Nhà giáo ưu tú, kèm suất đề bạt.',
          effects: { happy: 12, karma: 8, looks: 2, job: 'promote', flag: 'job_giaovien_thucamon' },
          scene: { anim: 'hug', fx: 'confetti', npcAnim: { stranger: 'hug', kid: 'clap' } } }
      ]
    },
    // ======================= THỢ CẮT TÓC =======================
    {
      id: 's_job_thocattoc_cathong', title: 'Cắt hỏng tóc khách', icon: '✂️', age: [18, 60], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['thocattoc'] },
      text: 'Cô khách mai cưới, dặn “tỉa nhẹ phần mái thôi em”. Bạn lỡ tay một nhát, phần mái ngắn cũn lệch hẳn một bên. Cô khách nhìn gương, im lặng ba giây, rồi mắt bắt đầu đỏ hoe.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 26, anim: 'cry', say: 'Mai em cưới rồi anh chị ơi!' }, { role: 'boss', anim: 'facepalm' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Xin lỗi, miễn phí, gọi thợ giỏi nhất sửa',
          text: 'Bạn cúi đầu nhận lỗi, không lấy tiền, còn mời thợ chính tạo kiểu mái bay che khéo phần lệch, tặng thêm gói gội dưỡng. Cô khách nguôi giận, hôm sau còn gửi ảnh cưới khoe đẹp.',
          effects: { karma: 6, happy: -2, money: -500000, smarts: 2 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { stranger: 'nod', boss: 'nod' } } },
        { label: 'Thuyết phục đây là kiểu mái “Hàn Quốc” đang hot',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn uốn lại, sấy phồng, chỉnh lệch thành “mái bất đối xứng” như idol. Cô khách soi gương mãi rồi bật cười: “Ơ, nhìn cũng sang ghê.” Ảnh cưới lên TikTok, tiệm có thêm chục khách hỏi kiểu tóc này.',
              effects: { happy: 6, looks: 2, money: 1000000, smarts: 2 },
              scene: { anim: 'laugh', fx: 'stars', npcAnim: { stranger: 'laugh' } } },
            { text: 'Cô khách không tin. Tối đó, bài review một sao kèm ảnh cận cảnh phần mái lệch lên group “Review làm đẹp”, hơn hai nghìn bình luận chê. Chủ tiệm trừ nửa tháng lương của bạn.',
              effects: { happy: -8, money: -3000000, looks: -2, karma: -2 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { stranger: 'angry', boss: 'angry' } } }
          ] },
        { label: 'Đổ cho khách cử động đầu',
          text: 'Bạn bảo cô khách quay đầu nên kéo lệch. Cô khách bỏ về không trả tiền, tiệm mất luôn một khách quen. Chủ tiệm nhìn bạn lắc đầu.',
          effects: { karma: -6, happy: -4, money: -500000 },
          scene: { anim: 'shrug', fx: 'anger', npcAnim: { stranger: 'angry', boss: 'shake' } } }
      ]
    },
    {
      id: 's_job_thocattoc_tiemrieng', title: 'Mở tiệm riêng', icon: '💈', age: [22, 55], weight: 1.4,
      req: { jobId: ['thocattoc'], minMoney: 80000000, notFlag: 'job_thocattoc_tiem' },
      text: 'Tay nghề đã vững, khách quen gọi đích danh. Đầu hẻm có mặt bằng nhỏ cho thuê, chủ nhà để giá mềm. Mở tiệm riêng tốn chừng {money:80000000} cho ghế, gương, máy sấy và tiền cọc.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'neighbor', gender: 'm', age: 60, anim: 'talk', say: 'Thuê đi cháu, chỗ này đông người qua lại.' }, { role: 'coworker', anim: 'think', say: 'Hay mình hùn vốn?' }], fx: 'idea', shot: 'wide' },
      choices: [
        { label: 'Liều mở tiệm',
          text: 'Bạn treo tấm biển tự tay thiết kế, khai trương bằng màn múa lân nhỏ. Khách quen kéo đến ủng hộ, nhưng thách thức thật mới chỉ bắt đầu.',
          effects: { money: -80000000, happy: 10, job: 'promote', flag: 'job_thocattoc_tiem', followUp: { id: 's_job_thocattoc_tiem_2', delay: 1 } },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { neighbor: 'clap' } } },
        { label: 'Hùn vốn với đồng nghiệp cho đỡ rủi ro',
          text: 'Bạn và {coworker} mỗi người một nửa. Tiệm mở nhỏ, lời chia đôi, nhưng có người gánh cùng những tháng vắng khách.',
          effects: { money: -40000000, happy: 6, job: 'raise', flag: 'job_thocattoc_tiem' },
          scene: { anim: 'hug', fx: 'sparkle', npcAnim: { neighbor: 'nod' } } },
        { label: 'Chưa vội, làm công thêm vài năm',
          text: 'Bạn quyết định tích thêm vốn và kinh nghiệm. Lương đều, không lo tiền mặt bằng. Tuần sau, mặt bằng ấy thành tiệm trà sữa.',
          effects: { happy: -2, smarts: 1 },
          scene: { anim: 'shrug', fx: 'question', npcAnim: { neighbor: 'shrug' } } }
      ]
    },
    {
      id: 's_job_thocattoc_tiem_2', title: 'Năm đầu làm chủ', icon: '📒', age: [22, 60], chainOnly: true,
      req: { jobId: ['thocattoc'] },
      text: 'Một năm sau khai trương, tiệm sống được nhưng chưa dư dả. Đối diện vừa mở một salon chuỗi lớn, cắt đồng giá 50 nghìn, phát voucher khắp phố. Khách quen bắt đầu ngập ngừng.',
      scene: { loc: 'street', time: 'day', weather: 'cloudy', anim: 'think', expr: 'sad',
        npcs: [{ role: 'crowd', anim: 'walk' }, { role: 'stranger', gender: 'm', age: 30, anim: 'talk', say: 'Bên kia đang giảm giá đó.' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Quay video TikTok dạy chăm tóc',
          success: { stat: 'looks', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Clip “cắt tóc cho cụ ông 90 tuổi” của bạn đạt hai triệu view. Khách từ khắp thành phố tìm tới, phải đặt lịch trước ba ngày.',
              effects: { happy: 12, money: 60000000, looks: 4 },
              scene: { anim: 'phone', fx: 'stars', npcAnim: { crowd: 'cheer' } } },
            { text: 'Video lẹt đẹt vài trăm lượt xem. Bạn vẫn sống được nhờ khách quen, nhưng không mở rộng nổi.',
              effects: { happy: -3, money: 5000000 },
              scene: { anim: 'shrug', fx: 'question' } }
          ] },
        { label: 'Giữ chất lượng, chăm sóc khách quen',
          text: 'Bạn nhớ tên từng khách, pha trà, hỏi han con cái họ. Salon bên kia rẻ thật, nhưng người ta quay về với bạn vì cảm giác như về nhà.',
          effects: { happy: 6, karma: 5, money: 20000000 },
          scene: { anim: 'talk', fx: 'hearts', npcAnim: { stranger: 'laugh' } } },
        { label: 'Sang nhượng tiệm, về làm thuê',
          text: 'Bạn sang tiệm, thu về được chút vốn. Về làm thợ chính cho một salon lớn, đỡ lo nghĩ, nhưng chiếc biển tên mình thì đã không còn.',
          effects: { money: 40000000, happy: -6 },
          scene: { anim: 'sad', fx: 'tears' } }
      ]
    },
    {
      id: 's_job_thocattoc_nguoinoitieng', title: 'Khách nổi tiếng ghé tiệm', icon: '🌟', age: [18, 60], weight: 1.4,
      req: { jobId: ['thocattoc'], notFlag: 'job_thocattoc_sao' },
      text: 'Chiếc xe bảy chỗ đỗ xịch trước cửa. Một nam ca sĩ đang nổi, đeo khẩu trang kín mít, bước vào tiệm vì salon quen đóng cửa. Anh cần tạo kiểu gấp cho buổi diễn tối nay, và nhờ “giữ kín giùm”.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 28, anim: 'sit', say: 'Giữ kín giùm anh nhé.' }, { role: 'coworker', anim: 'phone', expr: 'surprised' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Làm hết sức, giữ kín chuyện',
          text: 'Bạn tập trung hơn cả thi tay nghề. Tối đó, cả mạng xã hội khen kiểu tóc mới của anh. Tuần sau, quản lý của anh gọi điện: mời bạn làm thợ tóc riêng cho tour diễn.',
          effects: { happy: 10, karma: 5, money: 15000000, looks: 2, job: 'raise', flag: 'job_thocattoc_sao' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'clap' } } },
        { label: 'Xin chụp ảnh chung để quảng bá',
          text: 'Anh vui vẻ đồng ý. Bức ảnh đăng lên fanpage tiệm, fan kéo đến xin “ngồi đúng chiếc ghế ấy”. Doanh thu tháng tăng gấp đôi.',
          effects: { happy: 8, money: 10000000, looks: 3, flag: 'job_thocattoc_sao' },
          scene: { anim: 'phone', fx: 'stars', npcAnim: { stranger: 'wave' } } },
        { label: 'Lén chụp gửi trang tin showbiz',
          text: 'Bạn lén chụp gương mặt mộc của anh rồi bán cho một trang tin lá cải. Bài lên xu hướng. Quản lý của anh truy ra nguồn ảnh, cả giới showbiz rỉ tai nhau tránh tiệm bạn.',
          effects: { money: 5000000, karma: -12, happy: -4, flag: 'job_thocattoc_sao' },
          scene: { anim: 'phone', fx: 'anger', npcAnim: { stranger: 'angry' } } }
      ]
    },
    // ======================= NHÂN VIÊN BÁN HÀNG =======================
    {
      id: 's_job_banhang_khachloan', title: 'Khách khó tính làm loạn', icon: '🤬', age: [18, 60], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['banhang'] },
      text: 'Một chị khách mang trả chiếc váy đã mặc rõ ràng, mác cắt mất, còn vương mùi nước hoa. Bạn vừa nhắc chính sách đổi trả, chị ta đã bật livestream, la lớn giữa cửa hàng: “Mọi người xem này, bán hàng lừa đảo!”',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'scared', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 38, anim: 'phone', expr: 'angry', say: 'Cả nhà ơi, shop lừa đảo nè!' }, { role: 'crowd', anim: 'phone' }, { role: 'boss', anim: 'facepalm' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Bình tĩnh, mời ra quầy riêng giải quyết',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn mời chị ngồi, rót cốc nước, nhẹ nhàng đề nghị đổi sang voucher. Chị ta tắt livestream lúc nào không hay. Người xem chuyển sang khen thái độ của bạn, cửa hàng trưởng ghi tên bạn vào danh sách thưởng.',
              effects: { happy: 6, karma: 6, smarts: 2, job: 'raise' },
              scene: { anim: 'talk', fx: 'sparkle', npcAnim: { stranger: 'sit', boss: 'clap' } } },
            { text: 'Chị ta càng nói càng to, cuối cùng hất tung kệ hàng mới chịu về. Bạn mất cả buổi chiều dọn dẹp, còn đoạn livestream thì cắt ghép bạn thành “nhân viên thái độ”.',
              effects: { happy: -8, looks: -1 },
              scene: { anim: 'sad', fx: 'anger', npcAnim: { stranger: 'angry', crowd: 'laugh' } } }
          ] },
        { label: 'Bật camera an ninh cho mọi người xem',
          text: 'Bạn quay màn hình camera cho thấy chị khách mua váy từ hai tuần trước, kèm hóa đơn ghi rõ “không đổi trả hàng đã qua sử dụng”. Đám đông ồ lên. Chị ta tắt livestream, lủi thủi bỏ về.',
          effects: { happy: 5, smarts: 3 },
          scene: { anim: 'point', fx: 'idea', npcAnim: { stranger: 'facepalm', crowd: 'laugh' } } },
        { label: 'Cho đổi luôn cho êm chuyện',
          text: 'Bạn đổi váy mới cho khách. Chuyện êm, nhưng cuối ca cửa hàng trưởng trừ tiền chiếc váy vào lương bạn: “Chính sách là chính sách.”',
          effects: { money: -800000, happy: -3 },
          scene: { anim: 'shrug', fx: 'sweat', npcAnim: { stranger: 'laugh', boss: 'shake' } } }
      ]
    },
    {
      id: 's_job_banhang_mathang', title: 'Mất hàng cuối ca', icon: '📦', age: [18, 60], weight: 1.5,
      req: { jobId: ['banhang'], notFlag: 'job_banhang_mathang' },
      text: 'Kiểm kho cuối ca, thiếu ba chiếc tai nghe không dây, mỗi chiếc gần năm triệu. Ca này chỉ có bạn và {coworker}. Cửa hàng trưởng tuyên bố: “Không tìm ra thì hai đứa chia nhau đền.”',
      scene: { loc: 'market', time: 'night', weather: 'clear', anim: 'think', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'f', age: 40, anim: 'angry', say: 'Hai đứa chia nhau đền!' }, { role: 'coworker', anim: 'idle', expr: 'neutral' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Xin trích xuất camera',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Tua lại camera, mọi người lặng đi: chính {coworker} đã nhét hộp tai nghe vào túi áo khoác lúc bạn đang tính tiền. Bạn được minh oan, cửa hàng trưởng khen bạn bình tĩnh và cất nhắc làm trưởng ca.',
              effects: { happy: 6, smarts: 3, job: 'promote', flag: 'job_banhang_mathang' },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { coworker: 'scared', boss: 'angry' } } },
            { text: 'Camera góc đó hỏng từ tuần trước. Không ai chứng minh được gì, bạn vẫn phải đền nửa số tiền.',
              effects: { money: -7500000, happy: -7, flag: 'job_banhang_mathang' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { coworker: 'shrug' } } }
          ] },
        { label: 'Nhận đền cho xong chuyện',
          text: 'Bạn cắn răng chuyển khoản {money:7500000}, bằng gần nửa tháng lương. Cả tháng ăn mì gói. Từ đó, bạn kiểm hàng kỹ đến từng con ốc.',
          effects: { money: -7500000, happy: -8, smarts: 2, flag: 'job_banhang_mathang' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { boss: 'nod' } } },
        { label: 'Lục túi đồng nghiệp ngay tại chỗ',
          outcomes: [
            { p: 0.5, text: 'Ba chiếc tai nghe rơi ra từ ba lô của {coworker}. Sự thật lộ ra, nhưng cách bạn làm khiến cả cửa hàng sượng sùng.',
              effects: { happy: 2, karma: -2, flag: 'job_banhang_mathang' },
              scene: { anim: 'angry', fx: 'exclaim', npcAnim: { coworker: 'scared' } } },
            { p: 0.5, text: 'Ba lô không có gì. {coworker} òa khóc, nộp đơn khiếu nại vì bị xúc phạm. Bạn bị kỷ luật và vẫn phải đền.',
              effects: { money: -7500000, happy: -10, karma: -5, flag: 'job_banhang_mathang' },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { coworker: 'cry', boss: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_banhang_doanhso', title: 'Đạt doanh số được thưởng', icon: '🏆', age: [18, 60], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['banhang'] },
      text: 'Ngày cuối quý, bảng doanh số treo trên tường: bạn chỉ còn thiếu 30 triệu là chạm mốc thưởng nóng {money:15000000} và suất xét lên chức. Còn bốn tiếng nữa là đóng cửa.',
      scene: { loc: 'market', time: 'dusk', weather: 'clear', anim: 'phone', expr: 'happy',
        npcs: [{ role: 'boss', anim: 'point', say: 'Cố lên, còn 30 triệu nữa thôi!' }, { role: 'stranger', anim: 'walk' }, { role: 'coworker', gender: 'f', age: 29, anim: 'talk' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Gọi điện cho từng khách quen',
          success: { stat: 'looks', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn gọi hai mươi cuộc, nhắn tin cả trăm người. Đến phút thứ 59, một chị khách quen chốt đơn bộ nồi 32 triệu. Cả cửa hàng vỗ tay, bạn nhận thưởng và được đề bạt.',
              effects: { money: 15000000, happy: 12, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { boss: 'clap', coworker: 'clap' } } },
            { text: 'Thiếu đúng 4 triệu. Hụt thưởng, nhưng cửa hàng trưởng ghi nhận nỗ lực và hứa ưu tiên bạn quý sau.',
              effects: { happy: -4, smarts: 1 },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Tự mua đơn ảo rồi trả hàng sau',
          outcomes: [
            { p: 0.5, text: 'Bạn quẹt thẻ mua hàng 30 triệu, đạt mốc thưởng. Tuần sau trả hàng êm xuôi. Lời được ít tiền thưởng, nhưng bạn biết đó không phải tiền sạch.',
              effects: { money: 12000000, karma: -8, happy: 2 },
              scene: { anim: 'idle', fx: 'money' } },
            { p: 0.5, text: 'Phòng kiểm soát phát hiện đơn hàng trả lại bất thường. Bạn bị thu hồi thưởng và cho nghỉ việc vì gian lận doanh số.',
              effects: { karma: -10, happy: -12, job: 'fire' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { boss: 'point' } } }
          ] },
        { label: 'Nhường khách lớn cho đồng nghiệp sắp nghỉ',
          text: '{coworker} sắp nghỉ sinh, rất cần khoản thưởng. Bạn chuyển khách lớn sang cho {coworker}. Bạn hụt mốc, nhưng nhận về một người bạn thân thiết suốt nhiều năm.',
          effects: { karma: 10, happy: 4 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { coworker: 'cry' } } }
      ]
    },
    // ======================= HƯỚNG DẪN VIÊN DU LỊCH =======================
    {
      id: 's_job_huongdanvien_lacdoan', title: 'Khách lạc đoàn ở nước ngoài', icon: '🧭', age: [21, 60], weight: 1.6,
      req: { jobId: ['huongdanvien'], notFlag: 'job_huongdanvien_lacdoan' },
      text: 'Tour Bangkok năm ngày, chiều cuối cùng ở chợ đêm. Điểm danh lên xe ra sân bay: thiếu bác Sáu, 72 tuổi, không biết tiếng Anh, điện thoại hết pin. Chuyến bay cất cánh sau ba tiếng nữa, ba mươi khách còn lại bắt đầu sốt ruột.',
      scene: { loc: 'market', time: 'night', weather: 'clear', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'crowd', anim: 'talk', say: 'Trễ máy bay bây giờ!' }, { role: 'stranger', gender: 'f', age: 65, anim: 'cry', say: 'Ông nhà tôi đâu rồi?' }, { role: 'police', anim: 'idle' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Giao đoàn cho tài xế, tự đi tìm',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn nhờ cảnh sát du lịch phát loa, lần theo dãy hàng bác hay ghé. Bốn mươi phút sau, bác Sáu đang ngồi ăn xoài nếp, cười hề hề. Cả đoàn kịp chuyến bay, viết đánh giá năm sao kèm tên bạn.',
              effects: { happy: 10, karma: 8, smarts: 3, flag: ['job_huongdanvien_lacdoan', 'job_huongdanvien_tot'] },
              scene: { anim: 'hug', fx: 'confetti', npcAnim: { stranger: 'cry', crowd: 'clap', police: 'wave' } } },
            { text: 'Tìm mãi không thấy, đoàn lỡ chuyến bay. Gần nửa đêm bác Sáu mới được cảnh sát đưa về khách sạn. Công ty tốn {money:60000000} đổi vé, bạn bị trừ thưởng nặng.',
              effects: { happy: -10, money: -10000000, flag: 'job_huongdanvien_lacdoan' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'angry', police: 'talk' } } }
          ] },
        { label: 'Cho đoàn ra sân bay trước, ở lại một mình',
          text: 'Bạn gửi đoàn cho trưởng nhóm khách, ở lại tìm bác Sáu đến khuya, đổi vé bằng tiền túi. Hai bác cháu về nước muộn một ngày. Gia đình bác Sáu gửi thư cảm ơn, công ty hoàn lại tiền vé và tuyên dương bạn.',
          effects: { happy: 6, karma: 12, health: -3, flag: ['job_huongdanvien_lacdoan', 'job_huongdanvien_tot'] },
          scene: { anim: 'walk', fx: 'hearts', npcAnim: { stranger: 'bow', crowd: 'wave' } } },
        { label: 'Đưa cả đoàn đi, báo đại sứ quán lo',
          text: 'Bạn đưa đoàn ra sân bay đúng giờ, gọi đại sứ quán và cảnh sát địa phương. Bác Sáu được tìm thấy sáng hôm sau, an toàn nhưng hoảng sợ. Gia đình bác đăng đàn chỉ trích, công ty đình chỉ bạn một tháng.',
          effects: { happy: -8, karma: -6, money: -8000000, flag: 'job_huongdanvien_lacdoan' },
          scene: { anim: 'phone', fx: 'anger', npcAnim: { stranger: 'cry' } } }
      ]
    },
    {
      id: 's_job_huongdanvien_hoahong', title: 'Ép khách mua hàng để ăn hoa hồng', icon: '💎', age: [21, 60], weight: 1.5,
      req: { jobId: ['huongdanvien'], notFlag: 'job_huongdanvien_hoahong' },
      text: 'Lịch trình tour có ba điểm dừng “tham quan” cửa hàng yến sào, ngọc trai, thuốc bổ. Công ty dặn: mỗi đoàn phải đạt doanh số mua sắm, hướng dẫn viên ăn 15% hoa hồng. Hôm nay đoàn toàn các cụ hưu trí, ai cũng dè sẻn.',
      scene: { loc: 'market', time: 'day', weather: 'clear', anim: 'talk', expr: 'neutral',
        npcs: [{ role: 'vendor', gender: 'f', age: 40, anim: 'talk', expr: 'happy', say: 'Yến thật trăm phần trăm nha cô chú!' }, { role: 'crowd', anim: 'think' }, { role: 'stranger', gender: 'm', age: 70, anim: 'shrug', say: 'Đắt quá cháu ơi.' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Chèo kéo, “dọa” khách mua',
          outcomes: [
            { p: 0.4, text: 'Bạn kể chuyện “chỉ hôm nay giảm giá”, “không mua là tiếc cả đời”. Các cụ móc hầu bao. Bạn bỏ túi {money:12000000} hoa hồng, nhưng mấy ánh mắt nhìn bạn đã khác.',
              effects: { money: 12000000, karma: -10, flag: ['job_huongdanvien_hoahong', 'job_huongdanvien_choteo'] },
              scene: { anim: 'point', fx: 'money', npcAnim: { crowd: 'sad', vendor: 'cheer' } } },
            { p: 0.6, text: 'Bạn bỏ túi hoa hồng ngon lành. Nhưng một cụ ông lén quay lại toàn bộ màn chèo kéo, tối đó đăng lên Facebook.',
              effects: { money: 12000000, karma: -12, flag: ['job_huongdanvien_hoahong', 'job_huongdanvien_choteo'], followUp: { id: 's_job_huongdanvien_clip', delay: 0 } },
              scene: { anim: 'point', fx: 'money', npcAnim: { stranger: 'phone', vendor: 'cheer' } } }
          ] },
        { label: 'Giới thiệu sơ qua, ai thích thì mua',
          text: 'Bạn nói thật: “Cô chú cứ xem, không mua cũng không sao.” Doanh số lèo tèo, công ty nhắc nhở. Nhưng cuối tour, các cụ góp tiền boa cho bạn còn nhiều hơn hoa hồng.',
          effects: { karma: 6, happy: 5, money: 4000000, flag: ['job_huongdanvien_hoahong', 'job_huongdanvien_tot'] },
          scene: { anim: 'talk', fx: 'hearts', npcAnim: { crowd: 'clap', stranger: 'laugh' } } },
        { label: 'Bỏ hẳn điểm mua sắm, đưa đi chợ địa phương',
          success: { stat: 'karma', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Đoàn được ăn uống, mua đặc sản giá gốc ở chợ địa phương. Đánh giá năm sao bay về công ty, giám đốc bỏ qua chuyện doanh số và giao bạn dẫn các tour cao cấp.',
              effects: { karma: 8, happy: 8, job: 'raise', flag: ['job_huongdanvien_hoahong', 'job_huongdanvien_tot'] },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { crowd: 'cheer' } } },
            { text: 'Cửa hàng đối tác báo về công ty. Bạn bị cắt tour cả tháng vì “tự ý thay đổi lịch trình”.',
              effects: { karma: 5, happy: -8, money: -9000000, flag: 'job_huongdanvien_hoahong' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { vendor: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_huongdanvien_clip', title: 'Clip hướng dẫn viên chèo kéo', icon: '📱', age: [21, 65], chainOnly: true,
      req: { jobId: ['huongdanvien'] },
      text: 'Đoạn clip “Hướng dẫn viên ép các cụ mua yến giá cắt cổ” đạt nửa triệu lượt xem. Sở Du lịch yêu cầu công ty giải trình. Giám đốc gọi bạn lên, mặt hầm hầm.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'scared',
        npcs: [{ role: 'boss', gender: 'm', age: 48, anim: 'angry', say: 'Em làm mất mặt cả công ty!' }], fx: 'sweat', shot: 'dramatic' },
      choices: [
        { label: 'Xin lỗi công khai, trả lại hoa hồng', req: { flag: 'job_huongdanvien_choteo' },
          text: 'Bạn quay video xin lỗi, hoàn lại hoa hồng cho các cụ. Dư luận dịu bớt. Bạn giữ được thẻ hướng dẫn viên, nhưng bị chuyển sang dẫn tour nội địa ngắn ngày.',
          effects: { money: -12000000, karma: 6, happy: -8, unflag: 'job_huongdanvien_choteo' },
          scene: { anim: 'bow', fx: 'tears', npcAnim: { boss: 'nod' } } },
        { label: 'Đổ cho “chỉ đạo của công ty”',
          text: 'Bạn khẳng định chỉ làm theo chỉ tiêu được giao. Công ty bị phạt, còn bạn bị cho nghỉ việc ngay trong ngày. Thẻ hướng dẫn viên quốc tế bị thu hồi.',
          effects: { happy: -14, karma: -4, job: 'fire', log: 'Mất việc hướng dẫn viên sau clip chèo kéo khách mua hàng.' },
          scene: { anim: 'angry', fx: 'heartbreak', npcAnim: { boss: 'point' } } }
      ]
    },
    {
      id: 's_job_huongdanvien_tourkhen', title: 'Tour trọn vẹn được khen', icon: '🌅', age: [21, 60], weight: 1.4,
      req: { jobId: ['huongdanvien'], notFlag: 'job_huongdanvien_khen' },
      text: 'Tour xuyên Việt mười ngày khép lại ở bãi biển Nha Trang. Bạn thuộc lòng từng câu chuyện lịch sử, xử lý gọn một ca say xe, một ca mất hộ chiếu, và đêm nào cũng tổ chức hát hò. Đêm chia tay, cả đoàn đồng thanh gọi tên bạn.',
      scene: { loc: 'beach', time: 'dusk', weather: 'clear', anim: 'sing', expr: 'happy',
        npcs: [{ role: 'crowd', anim: 'clap', say: 'Hướng dẫn viên số một!' }, { role: 'stranger', gender: 'm', age: 55, anim: 'cheer' }], fx: 'music', shot: 'orbit' },
      choices: [
        { label: 'Hát tặng đoàn một bài',
          text: 'Bạn cầm micro hát “Biển nhớ”. Hôm sau, đoàn khách gửi thư khen lên công ty, trong đó có một vị giám đốc ngỏ ý đặt tour công ty cho ba trăm nhân viên, chỉ định đích danh bạn dẫn.',
          effects: { happy: 12, looks: 2, job: 'promote', flag: 'job_huongdanvien_khen' },
          scene: { anim: 'sing', fx: 'music', npcAnim: { crowd: 'dance', stranger: 'clap' } } },
        { label: 'Xin mọi người đánh giá trên mạng', req: { flag: 'job_huongdanvien_tot' },
          text: 'Những người khách cũ từng được bạn giúp đỡ cũng vào đánh giá. Trang của công ty ngập lời khen nhắc tên bạn, một hãng lữ hành quốc tế liên hệ mời bạn về với lương gấp đôi.',
          effects: { happy: 10, money: 10000000, job: 'raise', flag: 'job_huongdanvien_khen' },
          scene: { anim: 'phone', fx: 'stars', npcAnim: { crowd: 'phone' } } },
        { label: 'Lặng lẽ ngắm biển, nghĩ về nhà',
          text: 'Bạn tách ra ngồi một mình trên bãi cát. Ba tháng nay bạn chưa ăn một bữa cơm nhà. Nghề này đẹp, nhưng cũng cô đơn.',
          effects: { happy: 3, smarts: 2, flag: 'job_huongdanvien_khen' },
          scene: { anim: 'sit', fx: 'stars', time: 'night', npcAnim: { crowd: 'dance' } } }
      ]
    },
    // ======================= NÔNG DÂN =======================
    {
      id: 's_job_nongdan_baolu', title: 'Mất mùa vì bão lũ', icon: '🌊', age: [16, 75], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['nongdan'] },
      text: 'Đài báo cơn bão số 4 đổ bộ trong hai ngày tới, kèm mưa lớn và lũ trên sông. Ruộng lúa nhà bạn còn mười ngày nữa mới chín, bông lúa đang nặng hạt. Hàng xóm người gặt non, người đắp bờ, người ngồi nhìn trời.',
      scene: { loc: 'countryside', time: 'day', weather: 'storm', anim: 'think', expr: 'scared',
        npcs: [{ role: 'neighbor', gender: 'm', age: 60, anim: 'talk', say: 'Gặt non đi, còn hơn mất trắng!' }, { role: 'crowd', anim: 'lift' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Gặt non ngay trong đêm',
          text: 'Cả nhà soi đèn pin gặt đến sáng. Lúa non bán được nửa giá, nhưng ít ra không mất trắng. Hai hôm sau, nước lũ trắng đồng.',
          effects: { money: 8000000, health: -5, happy: -3, smarts: 2 },
          scene: { anim: 'lift', time: 'night', weather: 'rain', fx: 'sweat', npcAnim: { neighbor: 'lift', crowd: 'lift' } } },
        { label: 'Đắp bờ, cầu trời bão lệch hướng',
          outcomes: [
            { p: 0.35, text: 'Bão lệch hướng ra biển, chỉ mưa vài trận. Mười ngày sau bạn gặt lúa chín vàng, được mùa trong khi nhiều nhà đã gặt non.',
              effects: { money: 25000000, happy: 10 },
              scene: { anim: 'cheer', weather: 'clear', fx: 'sparkle', npcAnim: { neighbor: 'facepalm' } } },
            { p: 0.65, text: 'Nước lũ tràn qua bờ đất mới đắp. Ruộng lúa ngập sâu nửa mét, mất trắng. Bạn đứng trên bờ, nhìn mồ hôi cả vụ chìm trong nước đục.',
              effects: { money: -15000000, happy: -14, health: -3 },
              scene: { anim: 'cry', weather: 'rain', fx: 'tears', npcAnim: { neighbor: 'sad' } } }
          ] },
        { label: 'Đã mua bảo hiểm nông nghiệp từ đầu vụ',
          success: { stat: 'smarts', base: 0.5, scale: 0.35 },
          outcomes: [
            { text: 'Lũ cuốn sạch ruộng, nhưng bảo hiểm chi trả {money:20000000}. Bạn có vốn làm lại vụ sau, còn hàng xóm thì kéo nhau sang hỏi cách mua.',
              effects: { money: 20000000, happy: -2, smarts: 3 },
              scene: { anim: 'phone', weather: 'rain', fx: 'money', npcAnim: { neighbor: 'clap' } } },
            { text: 'Hồ sơ bồi thường bị trả về vì thiếu giấy tờ. Bạn chạy đi chạy lại xã mấy tháng mới được nhận một nửa.',
              effects: { money: 8000000, happy: -8 },
              scene: { anim: 'facepalm', weather: 'rain', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_job_nongdan_matgia', title: 'Được mùa mất giá', icon: '🍉', age: [16, 75], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['nongdan'] },
      text: 'Năm nay dưa hấu sai trĩu, trái nào cũng to tròn. Nhưng cửa khẩu ùn tắc, thương lái chỉ trả 1.500 đồng một ký, chưa đủ tiền phân. Xe tải đậu đầu bờ, gã thương lái hút thuốc: “Bán thì bán, không thì để thối.”',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'vendor', gender: 'm', age: 42, anim: 'shrug', say: 'Một ngàn rưỡi, không hơn.' }, { role: 'neighbor', anim: 'sad' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Đành bán rẻ cho thương lái',
          text: 'Bạn gật đầu bán. Cả vụ lỗ gần hai chục triệu, nhưng ít ra không phải nhìn dưa thối ngoài ruộng.',
          effects: { money: -18000000, happy: -10 },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { vendor: 'laugh' } } },
        { label: 'Lên mạng livestream bán dưa',
          outcomes: [
            { p: 0.6, text: 'Bạn dựng điện thoại giữa ruộng dưa, kể chuyện cả vụ mồ hôi. Người xem thương tình chia sẻ khắp nơi, hai ngày bán sạch sáu tấn dưa với giá 7.000 đồng một ký. Bạn bắt đầu nghĩ nghiêm túc về chuyện bán hàng online.',
              effects: { money: 12000000, happy: 10, smarts: 2, followUp: { id: 's_job_nongdan_online', delay: 1 } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { neighbor: 'clap', vendor: 'facepalm' } } },
            { p: 0.4, text: 'Phiên livestream đầu tiên chỉ có mười bảy người xem, phân nửa là người quen. Bán được vài chục trái, còn lại đành bán cho thương lái. Nhưng bạn chưa bỏ cuộc.',
              effects: { money: -10000000, happy: -4, smarts: 2, followUp: { id: 's_job_nongdan_online', delay: 1 } },
              scene: { anim: 'shrug', fx: 'question', npcAnim: { vendor: 'laugh' } } }
          ] },
        { label: 'Bỏ dưa lại, chờ giá lên',
          outcomes: [
            { p: 0.3, text: 'Một tuần sau cửa khẩu thông, giá dưa vọt lên 8.000 đồng. Bạn thắng đậm canh bạc với trời.',
              effects: { money: 30000000, happy: 10 },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { vendor: 'facepalm' } } },
            { p: 0.7, text: 'Giá không lên, dưa nứt rồi thối ngay trên ruộng. Bạn mất trắng cả vụ.',
              effects: { money: -25000000, happy: -12 },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { neighbor: 'sad' } } }
          ] },
        { label: 'Rủ cả xóm lập tổ hợp tác',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Mười hai hộ góp hàng, liên hệ thẳng một chuỗi siêu thị với giá 6.000 đồng một ký. Không ai lỗ, và từ năm sau tổ hợp tác có hợp đồng bao tiêu.',
              effects: { money: 15000000, happy: 10, karma: 8, job: 'promote' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { neighbor: 'hug' } } },
            { text: 'Mỗi nhà một ý, họp mãi không xong. Dưa chín rục ngoài ruộng, cuối cùng ai cũng phải bán tháo.',
              effects: { money: -12000000, happy: -8 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { neighbor: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_nongdan_online', title: 'Bán hàng online thành công', icon: '📲', age: [16, 75], weight: 1.3,
      req: { jobId: ['nongdan'], notFlag: 'job_nongdan_online' },
      text: 'Bạn mở TikTok, quay cảnh bình minh trên ruộng, cảnh tự tay hái nông sản, cảnh cả nhà ngồi ăn cơm giữa vườn. Lượt xem lúc đầu chỉ vài trăm, rồi một clip bỗng vọt lên hơn trăm nghìn. Tin nhắn đặt hàng nhảy liên tục.',
      scene: { loc: 'countryside', time: 'dawn', weather: 'clear', anim: 'phone', expr: 'happy', say: 'Cả nhà ơi, hàng tươi mới hái nè!',
        npcs: [{ role: 'neighbor', anim: 'lift' }, { role: 'vendor', gender: 'm', anim: 'drive' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Làm bài bản: đóng gói đẹp, ship toàn quốc',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Bạn thuê thêm người hái, in thùng có logo, hợp tác với hãng vận chuyển. Mỗi tháng bán vài tấn, giá gấp ba thương lái. Báo tỉnh về làm phóng sự “nông dân 4.0”.',
              effects: { money: 80000000, happy: 14, looks: 3, smarts: 3, job: 'promote', flag: 'job_nongdan_online' },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { neighbor: 'clap', vendor: 'wave' } } },
            { text: 'Đơn nhiều quá xoay không kịp, hàng giao chậm bị dập, khách để lại đánh giá xấu. Lời được ít, nhưng bạn học được bài học quý về vận hành.',
              effects: { money: 10000000, happy: 2, smarts: 4, flag: 'job_nongdan_online' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { neighbor: 'shrug' } } }
          ] },
        { label: 'Thu mua thêm hàng xóm bán cùng',
          text: 'Bạn bán cả nông sản của hàng xóm, giữ giá công bằng cho họ. Cả xóm thoát cảnh bị ép giá, gọi bạn là “bí thư TikTok”.',
          effects: { money: 40000000, karma: 10, happy: 10, job: 'raise', flag: 'job_nongdan_online' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { neighbor: 'cheer' } } },
        { label: 'Trộn hàng chợ đầu mối vào bán cho nhiều',
          outcomes: [
            { p: 0.4, text: 'Không ai phát hiện, lợi nhuận tăng vọt. Nhưng bạn biết, mỗi thùng hàng “vườn nhà” đó đều có một phần dối trá.',
              effects: { money: 60000000, karma: -12, flag: 'job_nongdan_online' },
              scene: { anim: 'idle', fx: 'money' } },
            { p: 0.6, text: 'Một khách phát hiện hàng có nhãn chợ đầu mối, quay clip bóc phốt. Kênh của bạn bị tẩy chay, đơn hàng về số không.',
              effects: { money: -10000000, karma: -10, happy: -12, looks: -3, flag: 'job_nongdan_online' },
              scene: { anim: 'cry', fx: 'heartbreak' } }
          ] }
      ]
    },
    // ======================= KỸ SƯ NÔNG NGHIỆP =======================
    {
      id: 's_job_kysunn_thientai', title: 'Mất mùa vì thiên tai', icon: '🏜️', age: [22, 62], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['kysunn'] },
      text: 'Hạn mặn lịch sử tràn vào đồng bằng, độ mặn trên kênh vượt 4 phần nghìn. Hàng trăm hecta lúa bạn phụ trách kỹ thuật đang làm đòng thì cháy lá. Nông dân xúm quanh bạn, ai cũng hỏi một câu: “Giờ tính sao kỹ sư?”',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'think', expr: 'scared',
        npcs: [{ role: 'crowd', anim: 'sad', say: 'Giờ tính sao kỹ sư ơi?' }, { role: 'neighbor', gender: 'm', age: 58, anim: 'cry' }, { role: 'boss', anim: 'phone' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Thức trắng đo mặn, hướng dẫn lấy nước đúng giờ',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn lập bảng đo mặn từng giờ, chỉ cho bà con đóng mở cống theo con nước ngọt hiếm hoi. Cứu được hơn nửa diện tích. Sở Nông nghiệp lấy mô hình của bạn nhân rộng cả tỉnh.',
              effects: { smarts: 5, karma: 8, health: -5, happy: 6, job: 'raise' },
              scene: { anim: 'point', fx: 'idea', npcAnim: { crowd: 'clap', neighbor: 'nod' } } },
            { text: 'Nước ngọt về quá ít, quá muộn. Phần lớn ruộng vẫn mất trắng. Bạn đi qua những bờ ruộng khô nứt, thấy mình bất lực trước trời.',
              effects: { health: -6, happy: -10, smarts: 3 },
              scene: { anim: 'sad', fx: 'tears', npcAnim: { crowd: 'sad' } } }
          ] },
        { label: 'Đề xuất chuyển sang mô hình tôm lúa',
          text: 'Bạn thuyết phục bà con: không chống mặn được thì sống chung với mặn. Vụ đầu vất vả, nhưng năm sau mô hình tôm lúa cho thu nhập gấp đôi trồng lúa thuần.',
          effects: { smarts: 4, karma: 5, happy: 4, money: 10000000 },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { crowd: 'think', neighbor: 'nod' } } },
        { label: 'Bán thuốc “chống mặn” của công ty quen ăn hoa hồng',
          text: 'Bạn giới thiệu loại phân bón “chống mặn thần tốc” mà chính bạn cũng không tin. Hoa hồng {money:20000000} về túi, lúa vẫn chết. Bà con bắt đầu xì xào sau lưng bạn.',
          effects: { money: 20000000, karma: -14, happy: -3 },
          scene: { anim: 'talk', fx: 'money', npcAnim: { crowd: 'angry' } } }
      ]
    },
    {
      id: 's_job_kysunn_giongmoi', title: 'Giống lúa mới thành công', icon: '🌾', age: [24, 62], weight: 1.4,
      req: { jobId: ['kysunn'], notFlag: 'job_kysunn_giong' },
      text: 'Năm năm lai tạo, hàng trăm ô ruộng thí nghiệm, vô số lần thất bại. Vụ này, dòng lúa chịu mặn mang mã số của bạn trổ bông đều tăm tắp, năng suất vượt giống cũ 20%. Hội đồng khoa học sắp xuống ruộng đánh giá.',
      scene: { loc: 'countryside', time: 'dawn', weather: 'clear', anim: 'cheer', expr: 'happy',
        npcs: [{ role: 'boss', gender: 'm', age: 58, anim: 'clap', say: 'Năm năm, đáng lắm!' }, { role: 'coworker', anim: 'cheer' }, { role: 'neighbor', anim: 'nod' }], fx: 'sparkle', shot: 'orbit' },
      choices: [
        { label: 'Công nhận giống, chuyển giao miễn phí cho nông dân',
          text: 'Giống lúa được công nhận cấp quốc gia. Bạn đề nghị chuyển giao giá gốc cho bà con vùng mặn. Tên bạn được đặt cho dòng lúa, và bạn được đề bạt.',
          effects: { happy: 14, karma: 12, smarts: 4, job: 'promote', flag: 'job_kysunn_giong', followUp: { id: 's_job_kysunn_banquyen', delay: 1 } },
          scene: { anim: 'bow', fx: 'confetti', npcAnim: { boss: 'clap', neighbor: 'cheer' } } },
        { label: 'Đăng ký bảo hộ, bán bản quyền',
          text: 'Bạn đăng ký bảo hộ giống cây trồng đứng tên mình. Một công ty giống trả trước {money:500000000} cho quyền sản xuất. Đồng nghiệp trong viện có người chúc mừng, có người bảo bạn “ăn mảnh”.',
          effects: { money: 500000000, happy: 10, smarts: 3, flag: 'job_kysunn_giong', followUp: { id: 's_job_kysunn_banquyen', delay: 1 } },
          scene: { anim: 'cheer', fx: 'money', npcAnim: { coworker: 'shrug' } } },
        { label: 'Ghi công cả nhóm, chia đều thành quả',
          text: 'Bạn đứng tên cùng cả nhóm nghiên cứu. Giống lúa được công nhận, cả nhóm cùng được khen thưởng. Mọi người coi bạn là chỗ dựa của cả viện.',
          effects: { happy: 10, karma: 8, money: 50000000, job: 'raise', flag: 'job_kysunn_giong', followUp: { id: 's_job_kysunn_banquyen', delay: 1 } },
          scene: { anim: 'hug', fx: 'confetti', npcAnim: { coworker: 'hug' } } }
      ]
    },
    {
      id: 's_job_kysunn_banquyen', title: 'Hạt giống bị tuồn ra ngoài', icon: '🌱', age: [24, 65], chainOnly: true,
      req: { jobId: ['kysunn'] },
      text: 'Một năm sau, bạn phát hiện giống lúa của mình được bán tràn lan dưới cái tên khác, bao bì in chữ nước ngoài. Trong lúc đó, một doanh nhân lạ hẹn gặp, đặt lên bàn phong bì {money:200000000}: chỉ cần bạn “quên” hồ sơ gốc.',
      scene: { loc: 'cafe', time: 'day', weather: 'cloudy', anim: 'sit', expr: 'angry',
        npcs: [{ role: 'stranger', gender: 'm', age: 47, anim: 'talk', expr: 'happy', say: 'Hai trăm triệu, chỉ cần im lặng.' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Từ chối, khởi kiện bảo vệ giống',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Hồ sơ lai tạo năm năm của bạn là bằng chứng không thể chối cãi. Tòa buộc bên kia bồi thường và chấm dứt bán giống nhái. Báo chí gọi bạn là “người giữ hạt giống”.',
              effects: { money: 150000000, karma: 10, happy: 10, looks: 2 },
              scene: { anim: 'cheer', fx: 'levelup', npcAnim: { stranger: 'angry' } } },
            { text: 'Vụ kiện kéo dài ba năm, tốn kém và mệt mỏi. Cuối cùng chỉ hòa, nhưng ít ra giống lúa vẫn mang tên bạn.',
              effects: { money: -60000000, health: -5, happy: -5, karma: 6 },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Nhận tiền, coi như xong',
          outcomes: [
            { p: 0.5, text: 'Bạn cầm phong bì, xếp hồ sơ vào kho. Giống nhái tràn khắp, chất lượng kém dần. Nông dân trách “giống của kỹ sư dỏm”, mà không biết sự thật.',
              effects: { money: 200000000, karma: -15, happy: -6 },
              scene: { anim: 'idle', fx: 'money', npcAnim: { stranger: 'laugh' } } },
            { p: 0.5, text: 'Thanh tra Bộ vào cuộc điều tra đường dây giống lậu, lần ra khoản tiền bạn nhận. Bạn bị kỷ luật buộc thôi việc, mất luôn danh tiếng tác giả.',
              effects: { money: -50000000, karma: -15, happy: -15, job: 'fire', log: 'Bị buộc thôi việc vì nhận tiền bao che giống lúa lậu.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { stranger: 'run' } } }
          ] }
      ]
    },
    {
      id: 's_job_kysunn_thuonglai', title: 'Thương lái ép giá', icon: '⚖️', age: [22, 62], weight: 1.5,
      req: { jobId: ['kysunn'], notFlag: 'job_kysunn_thuonglai' },
      text: 'Vùng sầu riêng bạn hướng dẫn kỹ thuật được mùa lớn. Nhóm thương lái bắt tay nhau dìm giá xuống còn một nửa, rồi tìm gặp riêng bạn: “Kỹ sư nói bà con bán sớm đi, hàng năm nay kém chất lượng. Mỗi tấn được năm trăm nghìn.”',
      scene: { loc: 'countryside', time: 'day', weather: 'clear', anim: 'think', expr: 'angry',
        npcs: [{ role: 'vendor', gender: 'm', age: 45, anim: 'talk', say: 'Mỗi tấn năm trăm, anh em mình cùng có lợi.' }, { role: 'neighbor', anim: 'lift' }, { role: 'crowd', anim: 'think' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Kết nối doanh nghiệp xuất khẩu trực tiếp',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Bạn gửi mẫu kiểm định đạt chuẩn xuất khẩu, mời một công ty về ký hợp đồng bao tiêu. Giá cao hơn thương lái 40%. Cả vùng mở tiệc mừng, xã đề nghị khen thưởng bạn.',
              effects: { karma: 12, happy: 10, smarts: 3, job: 'promote', flag: 'job_kysunn_thuonglai' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { neighbor: 'hug', vendor: 'angry', crowd: 'cheer' } } },
            { text: 'Doanh nghiệp chỉ nhận được một phần sản lượng. Phần còn lại bà con vẫn phải bán giá thấp, nhưng ít ra không bị ép đến cùng.',
              effects: { karma: 6, happy: 2, flag: 'job_kysunn_thuonglai' },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { vendor: 'laugh' } } }
          ] },
        { label: 'Nhận tiền, nói theo thương lái',
          outcomes: [
            { p: 0.5, text: 'Bà con tin lời bạn, bán tháo. Bạn bỏ túi {money:60000000}. Một tháng sau giá sầu riêng tăng gấp đôi, ánh mắt bà con nhìn bạn khiến bạn cúi gằm.',
              effects: { money: 60000000, karma: -16, happy: -4, flag: 'job_kysunn_thuonglai' },
              scene: { anim: 'idle', fx: 'money', npcAnim: { crowd: 'angry' } } },
            { p: 0.5, text: 'Một bác nông dân ghi âm được cuộc trao đổi, gửi lên huyện. Bạn bị kỷ luật, cho thôi việc, cả vùng không ai muốn nhìn mặt.',
              effects: { money: 30000000, karma: -18, happy: -14, job: 'fire', flag: 'job_kysunn_thuonglai' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { neighbor: 'point', crowd: 'angry' } } }
          ] },
        { label: 'Khuyên bà con trữ hàng, chờ giá',
          outcomes: [
            { p: 0.55, text: 'Nhóm thương lái hết cách, phải nâng giá. Bà con bán được giá hợp lý, gửi bạn mấy trái sầu riêng ngon nhất vườn.',
              effects: { karma: 8, happy: 6, flag: 'job_kysunn_thuonglai' },
              scene: { anim: 'laugh', fx: 'hearts', npcAnim: { neighbor: 'cheer' } } },
            { p: 0.45, text: 'Trời mưa liên tục, trái chín rụng, nứt vỏ. Bà con lỗ nặng hơn, có người trách bạn xúi dại.',
              effects: { karma: 2, happy: -8, flag: 'job_kysunn_thuonglai' },
              scene: { anim: 'sad', weather: 'rain', fx: 'tears', npcAnim: { neighbor: 'angry' } } }
          ] }
      ]
    },
    // ======================= ĐẦU BẾP =======================
    {
      id: 's_job_daubep_bong', title: 'Bị bỏng trong bếp', icon: '🔥', age: [18, 60], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['daubep'] },
      text: 'Tối thứ Bảy, nhà hàng kín bàn, phiếu order dán dài như câu đối. Giữa lúc lật chảo, dầu sôi bắn tung lên mu bàn tay bạn, da đỏ rộp ngay lập tức. Bếp trưởng vẫn gào: “Bàn 12 giục lần ba rồi!”',
      scene: { loc: 'cafe', time: 'night', weather: 'clear', anim: 'cook', expr: 'sick', say: 'Á!',
        npcs: [{ role: 'boss', gender: 'm', age: 42, anim: 'angry', say: 'Bàn 12 giục lần ba rồi!' }, { role: 'coworker', anim: 'cook' }], fx: 'steam', shot: 'close' },
      choices: [
        { label: 'Xả nước mát, rồi mới làm tiếp',
          text: 'Bạn bỏ chảo, xả vòi nước lạnh đúng hai mươi phút như được học. {coworker} đứng bếp thay. Vết bỏng lành nhanh, không để sẹo. Bếp trưởng càu nhàu nhưng cuối ca vẫn đưa bạn tuýp thuốc mỡ.',
          effects: { health: -3, smarts: 2 },
          scene: { anim: 'idle', fx: 'bubbles', npcAnim: { coworker: 'cook', boss: 'shrug' } } },
        { label: 'Cắn răng nấu tiếp cho kịp',
          text: 'Bạn quấn tạm khăn, nấu hết ca. Đêm đó tay sưng phồng, nhiễm trùng, phải nghỉ hai tuần không lương. Bếp trưởng có khen “chịu khó”, nhưng tiền viện phí thì bạn tự trả.',
          effects: { health: -10, money: -4000000, happy: -5, illness: 'Bỏng tay' },
          scene: { anim: 'cook', expr: 'sick', fx: 'steam', npcAnim: { boss: 'nod' } } },
        { label: 'Đề xuất trang bị găng chống nhiệt cả bếp',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Sau buổi hôm đó, bạn viết đề xuất an toàn bếp: găng chống nhiệt, tủ sơ cứu, quy trình xử lý bỏng. Chủ nhà hàng duyệt ngay, còn tăng lương cho bạn vì “có tư duy quản lý”.',
              effects: { health: -3, smarts: 3, karma: 4, job: 'raise' },
              scene: { anim: 'talk', fx: 'idea', npcAnim: { boss: 'nod' } } },
            { text: 'Chủ nhà hàng gạt đi: “Bếp nào chẳng bỏng, làm lâu quen tay.” Bạn đành tự mua đôi găng riêng.',
              effects: { health: -3, money: -300000, happy: -2 },
              scene: { anim: 'shrug', fx: 'sweat', npcAnim: { boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_job_daubep_biche', title: 'Món ăn bị chê trên mạng', icon: '📉', age: [18, 60], weight: 1.5,
      req: { jobId: ['daubep'], notFlag: 'job_daubep_biche' },
      text: 'Một tài khoản review ẩm thực trăm nghìn người theo dõi đăng clip chê món bò lúc lắc của bạn “dai như dép, mặn như muối”. Clip lên xu hướng, nhà hàng vắng hẳn. Bạn xem lại, thấy hôm đó đúng là bạn nêm vội.',
      scene: { loc: 'cafe', time: 'day', weather: 'cloudy', anim: 'phone', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'angry', say: 'Cả tuần nay vắng hoe!' }, { role: 'coworker', anim: 'phone' }], fx: 'heartbreak', shot: 'close' },
      choices: [
        { label: 'Nhận lỗi, mời reviewer quay lại ăn thử',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bình luận nhận lỗi, sửa công thức, mời reviewer quay lại. Clip thứ hai “đầu bếp cầu thị, món ăn lột xác” còn nhiều view hơn clip đầu. Nhà hàng đông gấp đôi.',
              effects: { happy: 10, smarts: 3, looks: 2, job: 'raise', flag: 'job_daubep_biche' },
              scene: { anim: 'cook', fx: 'stars', npcAnim: { boss: 'clap' } } },
            { text: 'Reviewer không trả lời. Bạn lặng lẽ sửa món, khách quay lại chậm nhưng chắc. Mất ba tháng nhà hàng mới đông như cũ.',
              effects: { happy: -3, smarts: 3, flag: 'job_daubep_biche' },
              scene: { anim: 'cook', fx: 'steam' } }
          ] },
        { label: 'Đăng bài đáp trả gay gắt',
          text: 'Bạn viết dài ba trang, gọi reviewer là “ăn chực”. Cư dân mạng xâu xé, nhà hàng bị đánh giá một sao hàng loạt. Chủ nhà hàng bắt bạn gỡ bài và trừ lương tháng.',
          effects: { happy: -10, karma: -5, money: -5000000, looks: -2, flag: 'job_daubep_biche' },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { boss: 'facepalm' } } },
        { label: 'Thuê người viết review ảo dìm clip',
          outcomes: [
            { p: 0.4, text: 'Hàng trăm review năm sao ảo lấp đi clip chê. Tạm ổn, nhưng món ăn vẫn chưa sửa, khách thật vẫn ít.',
              effects: { money: -5000000, karma: -6, flag: 'job_daubep_biche' },
              scene: { anim: 'type', fx: 'money' } },
            { p: 0.6, text: 'Reviewer phát hiện, quay clip vạch trần “dàn review ảo”. Lần này cả nhà hàng thành trò cười, bạn bị cho nghỉ việc.',
              effects: { money: -5000000, karma: -8, happy: -12, job: 'fire', flag: 'job_daubep_biche' },
              scene: { anim: 'facepalm', fx: 'heartbreak', npcAnim: { boss: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_daubep_thinau', title: 'Thi nấu ăn truyền hình', icon: '📺', age: [20, 55], weight: 1.4,
      req: { jobId: ['daubep'], notFlag: 'job_daubep_thinau' },
      text: 'Bạn lọt vào vòng trong một cuộc thi nấu ăn truyền hình giờ vàng. Thử thách hôm nay: nấu món quê nhà trong sáu mươi phút trước ba giám khảo khó tính, máy quay chĩa sát tận nồi.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'cook', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'think', say: 'Còn ba mươi phút!' }, { role: 'crowd', anim: 'clap' }, { role: 'coworker', anim: 'cook' }], fx: 'steam', shot: 'orbit' },
      choices: [
        { label: 'Nấu canh chua cá lóc của mẹ',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Giám khảo húp một thìa, im lặng, rồi bảo: “Món này có ký ức.” Bạn vào chung kết, cả nước biết mặt.',
              effects: { happy: 10, looks: 4, flag: 'job_daubep_thinau', followUp: { id: 's_job_daubep_chungket', delay: 0 } },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'nod', crowd: 'cheer' } } },
            { text: 'Cá chưa kịp chín tới, giám khảo lắc đầu. Bạn dừng chân ở vòng này, nhưng lời khen tinh thần thì nhận đủ.',
              effects: { happy: -5, smarts: 3, looks: 2, flag: 'job_daubep_thinau' },
              scene: { anim: 'sad', fx: 'steam', npcAnim: { stranger: 'shake' } } }
          ] },
        { label: 'Liều làm món fusion thật “ảo”',
          outcomes: [
            { p: 0.45, text: 'Phở cuốn sốt phô mai khói của bạn khiến giám khảo trầm trồ. Vào chung kết với biệt danh “kẻ phá luật”.',
              effects: { happy: 12, looks: 5, flag: 'job_daubep_thinau', followUp: { id: 's_job_daubep_chungket', delay: 0 } },
              scene: { anim: 'dance', fx: 'stars', npcAnim: { crowd: 'cheer' } } },
            { p: 0.55, text: 'Món ăn trông đẹp nhưng vị hỗn loạn. Giám khảo nhận xét gay gắt, clip lên mạng thành meme.',
              effects: { happy: -8, looks: -2, flag: 'job_daubep_thinau' },
              scene: { anim: 'facepalm', fx: 'question', npcAnim: { stranger: 'facepalm' } } }
          ] },
        { label: 'Giúp đối thủ bị đứt tay',
          text: 'Thí sinh bên cạnh cắt phải tay, bạn bỏ dở nồi của mình để băng bó, phụ đối thủ hoàn thành món. Bạn bị loại, nhưng clip này được xem nhiều nhất mùa thi, một nhà hàng lớn mời bạn về làm bếp chính.',
          effects: { karma: 12, happy: 6, looks: 3, job: 'promote', flag: 'job_daubep_thinau' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { coworker: 'cry', crowd: 'clap' } } }
      ]
    },
    {
      id: 's_job_daubep_chungket', title: 'Đêm chung kết', icon: '🏆', age: [20, 60], chainOnly: true,
      req: { jobId: ['daubep'] },
      text: 'Đêm chung kết truyền hình trực tiếp. Đối thủ của bạn là một đầu bếp khách sạn năm sao. Đề bài: một thực đơn ba món kể câu chuyện đời mình. Giải nhất {money:300000000} và hợp đồng mở nhà hàng riêng.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'cook', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'm', age: 50, anim: 'think' }, { role: 'crowd', anim: 'cheer', say: 'Cố lên!' }, { role: 'coworker', gender: 'm', age: 38, anim: 'cook' }], fx: 'steam', shot: 'dramatic' },
      choices: [
        { label: 'Kể chuyện bằng món ăn tuổi thơ',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Món cuối là bát cơm cháy chan nước mắm gừng, như mẹ từng làm. Giám khảo rưng rưng. Bạn đăng quang, pháo giấy rợp trường quay.',
              effects: { money: 300000000, happy: 18, looks: 6, job: 'promote' },
              scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { crowd: 'cheer', stranger: 'clap' } } },
            { text: 'Bạn thua sát nút nửa điểm. Á quân, {money:50000000}, và vài lời mời hợp tác. Cũng đủ để đời thay đổi.',
              effects: { money: 50000000, happy: 6, looks: 4, job: 'raise' },
              scene: { anim: 'clap', fx: 'confetti', npcAnim: { coworker: 'cheer' } } }
          ] },
        { label: 'Mua chuộc trợ lý để biết trước đề phụ',
          outcomes: [
            { p: 0.4, text: 'Bạn chuẩn bị trước, thắng thuyết phục. Tiền thưởng về túi, nhưng mỗi lần ai khen “thiên tài”, bạn lại chột dạ.',
              effects: { money: 300000000, happy: 6, karma: -15, looks: 4 },
              scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.6, text: 'Tin nhắn bị lộ ngay sau đêm chung kết. Bạn bị tước danh hiệu, nhà hàng chấm dứt hợp đồng, báo chí đưa tin rầm rộ.',
              effects: { happy: -16, karma: -15, looks: -5, job: 'fire', log: 'Bị tước giải và mất việc vì gian lận cuộc thi nấu ăn.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { crowd: 'angry' } } }
          ] }
      ]
    },
    // ======================= PHỤC VỤ QUÁN =======================
    {
      id: 's_job_phucvu_quyt', title: 'Khách quỵt tiền', icon: '🏃', age: [15, 50], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['phucvu'] },
      text: 'Bàn sáu thanh niên gọi lẩu, bia, mồi hết {money:1800000}. Bạn quay vào lấy hóa đơn, quay ra thì bàn trống trơn, tiếng xe máy rồ ga ở đầu hẻm. Chủ quán nhìn bạn: “Bàn em phụ trách đấy nhé.”',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'run', expr: 'surprised', say: 'Ơ, chưa thanh toán mà!',
        npcs: [{ role: 'thug', gender: 'm', age: 22, anim: 'drive', say: 'Té lẹ!' }, { role: 'boss', gender: 'f', age: 45, anim: 'angry', say: 'Bàn em phụ trách đấy!' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Đuổi theo ghi biển số',
          outcomes: [
            { p: 0.5, text: 'Bạn chạy hụt hơi nhưng kịp chụp được biển số. Công an phường mời nhóm thanh niên lên làm việc, họ phải quay lại trả đủ tiền và xin lỗi.',
              effects: { happy: 6, health: -2, smarts: 2 },
              scene: { anim: 'phone', fx: 'sparkle', npcAnim: { boss: 'clap' } } },
            { p: 0.5, text: 'Bạn vấp ổ gà ngã sấp, trầy hết đầu gối. Bọn chúng đi mất, còn bạn vừa đau vừa phải đền tiền.',
              effects: { health: -6, money: -1800000, happy: -6 },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { boss: 'facepalm' } } }
          ] },
        { label: 'Đăng camera lên nhóm Facebook khu phố',
          success: { stat: 'smarts', base: 0.45, scale: 0.35 },
          outcomes: [
            { text: 'Clip camera quán được chia sẻ chóng mặt. Chưa đầy một ngày, phụ huynh của một cậu trong nhóm dẫn con tới trả tiền, xin lỗi rối rít.',
              effects: { happy: 6, smarts: 2 },
              scene: { anim: 'phone', fx: 'idea', npcAnim: { boss: 'nod' } } },
            { text: 'Clip mờ, không ai nhận ra. Bạn vẫn phải đền một nửa, chủ quán chịu một nửa.',
              effects: { money: -900000, happy: -4 },
              scene: { anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Lặng lẽ đền tiền',
          text: 'Bạn móc ví đền đủ, gần nửa tháng lương. Cả tuần ăn cơm với trứng. Chủ quán thấy tội, cuối tháng bù lại cho bạn ba trăm nghìn.',
          effects: { money: -1500000, happy: -6, karma: 2 },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { boss: 'sad' } } }
      ]
    },
    {
      id: 's_job_phucvu_truluong', title: 'Bị chủ quán trừ lương', icon: '💸', age: [15, 50], weight: 1.5,
      req: { jobId: ['phucvu'], notFlag: 'job_phucvu_truluong' },
      text: 'Ngày nhận lương, phong bì mỏng dính. Chủ quán liệt kê: đi trễ năm phút trừ 100 nghìn, vỡ hai cái ly trừ 300 nghìn, “thái độ chưa tươi” trừ 500 nghìn. Tổng cộng mất gần một phần tư tháng lương.',
      scene: { loc: 'cafe', time: 'dusk', weather: 'cloudy', anim: 'idle', expr: 'angry',
        npcs: [{ role: 'boss', gender: 'm', age: 48, anim: 'point', say: 'Nội quy là nội quy!' }, { role: 'coworker', anim: 'sad' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Im lặng nhận cho qua',
          text: 'Bạn cầm phong bì, cố mỉm cười. Đêm đó bạn tính lại: làm thêm một tháng nữa chắc chỉ còn đủ tiền trọ.',
          effects: { happy: -6, flag: 'job_phucvu_truluong' },
          scene: { anim: 'sad', fx: 'tears', npcAnim: { boss: 'nod' } } },
        { label: 'Lật Bộ luật Lao động ra nói chuyện',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Bạn chỉ rõ: phạt tiền thay kỷ luật là trái luật. Chủ quán đỏ mặt, trả lại đủ tiền, còn nâng bạn lên trưởng ca vì “cái miệng biết lý lẽ”.',
              effects: { happy: 8, smarts: 3, karma: 3, job: 'promote', flag: 'job_phucvu_truluong' },
              scene: { anim: 'point', fx: 'idea', npcAnim: { boss: 'facepalm', coworker: 'clap' } } },
            { text: 'Chủ quán trả lại tiền, nhưng tuần sau thông báo bạn “không cần đi làm nữa”.',
              effects: { happy: -8, karma: 3, job: 'fire', flag: 'job_phucvu_truluong' },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Rủ cả quán đình công một buổi',
          outcomes: [
            { p: 0.5, text: 'Sáng thứ Bảy, cả quán không ai đi làm. Chủ quán hoảng, bỏ hẳn nội quy phạt tiền, tăng lương mỗi người năm trăm nghìn.',
              effects: { happy: 10, karma: 4, job: 'raise', flag: 'job_phucvu_truluong' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'cheer', boss: 'facepalm' } } },
            { p: 0.5, text: 'Đến giờ hẹn, chỉ có mình bạn nghỉ. Hôm sau bạn bị đuổi việc, còn đồng nghiệp tránh mặt.',
              effects: { happy: -10, job: 'fire', flag: 'job_phucvu_truluong' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { coworker: 'shrug' } } }
          ] }
      ]
    },
    {
      id: 's_job_phucvu_boa', title: 'Được khách quen boa đậm', icon: '💰', age: [15, 50], weight: 1.5,
      req: { jobId: ['phucvu'] },
      text: 'Ông cụ Việt kiều sáng nào cũng ngồi bàn góc, gọi cà phê sữa đá, kể chuyện Sài Gòn xưa. Hôm nay trước khi về nước, ông dúi vào tay bạn {money:5000000}: “Cảm ơn con đã nghe ông nói chuyện cả năm nay.”',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'idle', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 76, anim: 'talk', expr: 'happy', say: 'Ông cảm ơn con nhiều lắm.' }, { role: 'boss', anim: 'idle' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhận và ôm ông thật chặt',
          text: 'Bạn ôm ông, mắt cay xè. Ông hứa năm sau về sẽ ghé. Món tiền đủ đóng học phí cả kỳ, và cảm giác được trân trọng thì còn quý hơn thế.',
          effects: { money: 5000000, happy: 10, karma: 3 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'hug' } } },
        { label: 'Chỉ nhận một phần, chia cho cả ca',
          text: 'Bạn chia đều cho mọi người trong ca, “vì ai cũng chăm ông”. Cả quán nể bạn, chủ quán đề bạt bạn lên phục vụ lâu năm với mức lương cao hơn.',
          effects: { money: 1500000, happy: 8, karma: 8, job: 'promote' },
          scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { stranger: 'clap', boss: 'nod' } } },
        { label: 'Từ chối, tặng ông gói cà phê làm quà',
          text: 'Bạn xua tay, tặng lại ông gói cà phê rang xay của quán. Ông cười rưng rưng. Một tháng sau, quán nhận được bưu kiện từ Mỹ: một lá thư khen và tấm séc gửi riêng cho bạn.',
          effects: { money: 8000000, happy: 10, karma: 10 },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { stranger: 'cry' } } }
      ]
    },
    // ======================= SHIPPER =======================
    {
      id: 's_job_shipper_bomhang', title: 'Khách bom hàng', icon: '📵', age: [16, 50], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['shipper'] },
      text: 'Đơn COD chiếc điện thoại {money:6500000}, bạn đã ứng tiền trước cho shop. Đến nơi gọi mười cuộc không ai nghe, nhắn Zalo thì bị chặn. Ông bảo vệ chung cư lắc đầu: “Tháng này cô đó bom ba shipper rồi.”',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'phone', expr: 'angry',
        npcs: [{ role: 'neighbor', gender: 'm', age: 60, anim: 'shrug', say: 'Tháng này bom ba người rồi đó.' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Hoàn hàng về shop, đòi lại tiền ứng',
          success: { stat: 'smarts', base: 0.5, scale: 0.35 },
          outcomes: [
            { text: 'Bạn chụp đủ bằng chứng cuộc gọi, tin nhắn, gửi shop và tổng đài. Shop hoàn tiền ứng, còn chặn số khách. Bạn mất một buổi chiều, nhưng không mất tiền.',
              effects: { happy: -2, smarts: 2 },
              scene: { anim: 'type', fx: 'idea' } },
            { text: 'Shop đổ cho bạn giao sai giờ, chỉ hoàn một nửa tiền ứng. Bạn cắn răng chạy thêm đêm để bù.',
              effects: { money: -3250000, happy: -6, health: -2 },
              scene: { anim: 'sad', fx: 'sweat', time: 'night' } }
          ] },
        { label: 'Bóc phốt lên hội shipper',
          text: 'Bạn đăng ảnh, địa chỉ, số điện thoại lên hội shipper hai trăm nghìn thành viên. Cả hội vào cảnh báo nhau. Hôm sau, cô khách nhắn tin xin lỗi, nhận hàng kèm hai trăm nghìn tiền xăng.',
          effects: { happy: 5, money: 200000, karma: -1 },
          scene: { anim: 'phone', fx: 'exclaim', npcAnim: { neighbor: 'laugh' } } },
        { label: 'Đứng chờ dưới sảnh tới tối',
          outcomes: [
            { p: 0.4, text: 'Bảy giờ tối, cô khách đi làm về, gặp bạn đứng chờ thì ngượng chín mặt, nhận hàng trả tiền.',
              effects: { happy: 3, health: -2 },
              scene: { anim: 'idle', time: 'dusk', fx: 'sparkle' } },
            { p: 0.6, text: 'Đợi đến chín giờ tối vẫn không thấy ai. Bạn mất trắng một buổi chạy đơn, bụng đói meo.',
              effects: { happy: -6, health: -3, money: -300000 },
              scene: { anim: 'sit', time: 'night', fx: 'zzz' } }
          ] }
      ]
    },
    {
      id: 's_job_shipper_vaquet', title: 'Va quẹt giữa đường', icon: '💥', age: [16, 50], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['shipper'] },
      text: 'Giờ cao điểm, bạn len qua hàng ô tô để kịp đơn. Một chiếc xe máy bất ngờ chuyển làn, hai xe quẹt nhau, cô gái kia ngã xuống đường, xước tay. Đơn hàng trà sữa văng tung tóe. Người đi đường bắt đầu dừng lại xem.',
      scene: { loc: 'street', time: 'dusk', weather: 'clear', anim: 'fall', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'f', age: 24, anim: 'sit', expr: 'sick', say: 'Anh chị chạy kiểu gì vậy!' }, { role: 'crowd', anim: 'phone' }], fx: 'dust', shot: 'dramatic' },
      choices: [
        { label: 'Đỡ người ta dậy, đưa đi sơ cứu',
          text: 'Bạn bỏ dở đơn, đưa cô gái vào trạm y tế gần nhất, trả tiền băng bó. Hai bên bắt tay vui vẻ. Bạn bị khách hủy đơn trà sữa, nhưng cô gái còn để lại đánh giá năm sao cho bạn trên app.',
          effects: { money: -800000, karma: 8, happy: 2 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'nod', crowd: 'clap' } } },
        { label: 'Cãi tay đôi xem ai sai',
          outcomes: [
            { p: 0.4, text: 'Camera hành trình của xe ô tô bên cạnh cho thấy cô gái tạt đầu. Mọi người đứng về phía bạn, cô gái xin lỗi rồi đi.',
              effects: { happy: 3, smarts: 1 },
              scene: { anim: 'point', fx: 'idea', npcAnim: { stranger: 'bow' } } },
            { p: 0.6, text: 'Cãi qua cãi lại, đám đông quay clip đăng lên mạng với tiêu đề “Shipper hung hăng”. Công ty khóa tài khoản bạn ba ngày.',
              effects: { happy: -8, karma: -4, money: -1000000 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { crowd: 'phone' } } }
          ] },
        { label: 'Vặn ga chạy luôn',
          outcomes: [
            { p: 0.4, text: 'Bạn chạy thoát, giao kịp đơn. Nhưng cả đêm nằm nghĩ tới cô gái ngã trên đường.',
              effects: { karma: -10, happy: -4 },
              scene: { anim: 'drive', fx: 'sweat' } },
            { p: 0.6, text: 'Người đi đường chặn xe bạn lại. Công an giao thông tới lập biên bản bỏ trốn sau va chạm, bạn bị phạt nặng và tạm giữ xe.',
              effects: { karma: -10, happy: -10, money: -6000000 },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { crowd: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_shipper_nuademu', title: 'Đơn hàng bí ẩn lúc nửa đêm', icon: '📦', age: [16, 50], weight: 1.4,
      req: { jobId: ['shipper'], notFlag: 'job_shipper_bian' },
      text: '23 giờ 40, một đơn hàng hiện lên: lấy gói đồ quấn băng keo kín mít ở một căn nhà hoang, giao tới bãi đất trống ven sông. Phí ship {money:2000000}, gấp hai mươi lần bình thường. Người gửi dặn: “Đừng mở, đừng hỏi.”',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'thug', gender: 'm', age: 33, anim: 'idle', say: 'Đừng mở, đừng hỏi.' }], fx: 'question', shot: 'dramatic' },
      choices: [
        { label: 'Từ chối đơn',
          text: 'Bạn bấm hủy, chạy thẳng về phòng trọ. Tiền nhiều thật, nhưng có những thứ không đáng đánh đổi. Ba hôm sau, bạn đọc báo thấy một shipper khác bị bắt vì vận chuyển ma túy.',
          effects: { happy: 2, karma: 4, flag: 'job_shipper_bian' },
          scene: { anim: 'drive', fx: 'sweat', npcAnim: { thug: 'angry' } } },
        { label: 'Nhận đơn rồi báo công an',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chạy thẳng đến đồn, công an phục kích ở điểm giao. Đường dây buôn ma túy bị triệt phá, bạn được khen thưởng và công ty vinh danh “shipper dũng cảm”.',
              effects: { karma: 12, happy: 10, money: 5000000, looks: 2, job: 'promote', flag: 'job_shipper_bian' },
              scene: { anim: 'cheer', fx: 'levelup', loc: 'street', npcAnim: { thug: 'fall' } } },
            { text: 'Bọn chúng phát hiện có công an, bỏ trốn. Gói hàng đúng là ma túy, bạn được cảm ơn, nhưng mấy tuần liền có số lạ gọi đe dọa. Bạn đành chuyển trọ.',
              effects: { karma: 10, happy: -6, money: -2000000, flag: 'job_shipper_bian' },
              scene: { anim: 'scared', fx: 'exclaim', npcAnim: { thug: 'phone' } } }
          ] },
        { label: 'Nhận đơn, không hỏi gì',
          text: 'Bạn giao xong, hai triệu tiền mặt nằm trong túi. Lần thứ hai, thứ ba, người đó đặt tiếp, tiền nhiều hơn. Cho đến một đêm, đèn pin công an rọi thẳng vào mặt bạn.',
          effects: { money: 6000000, karma: -12, flag: ['job_shipper_bian', 'job_shipper_chohang'], followUp: { id: 's_job_shipper_bibat', delay: 1 } },
          scene: { anim: 'drive', fx: 'money', npcAnim: { thug: 'laugh' } } }
      ]
    },
    {
      id: 's_job_shipper_bibat', title: 'Đèn pin giữa bãi sông', icon: '🚔', age: [16, 55], chainOnly: true,
      req: { jobId: ['shipper'] },
      text: 'Bãi đất ven sông, 1 giờ sáng. Bạn vừa đưa gói hàng thì tiếng còi rú lên, đèn pin chiếu tứ phía. Công an ập tới, gói hàng mở ra là ma túy tổng hợp. Bạn bị đưa về đồn lấy lời khai.',
      scene: { loc: 'street', time: 'night', weather: 'fog', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 40, anim: 'point', say: 'Đứng im! Giơ tay lên!' }, { role: 'thug', anim: 'run' }], fx: 'flash', shot: 'dramatic' },
      choices: [
        { label: 'Khai thật, hợp tác điều tra', req: { flag: 'job_shipper_chohang' },
          text: 'Bạn khai hết: ai đặt đơn, giao mấy lần, nhận bao nhiêu. Thông tin giúp công an bắt được cả đường dây. Bạn được xác định không biết bản chất hàng hóa, chỉ bị phạt hành chính, nhưng app khóa tài khoản vĩnh viễn.',
          effects: { money: -6000000, karma: 6, happy: -12, job: 'fire', unflag: 'job_shipper_chohang', log: 'Mất việc shipper sau khi vô tình chở hàng cấm.' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'nod' } } },
        { label: 'Chối, nói không biết gì',
          success: { stat: 'karma', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Lịch sử đơn hàng trên app chứng minh bạn chỉ là người chở thuê. Bạn được thả sau hai ngày, nhưng công ty vẫn chấm dứt hợp đồng.',
              effects: { happy: -10, job: 'fire', log: 'Bị cho nghỉ việc shipper sau vụ chở hàng cấm.' },
              scene: { anim: 'sad', fx: 'sweat', npcAnim: { police: 'shrug' } } },
            { text: 'Tin nhắn trong máy cho thấy bạn đã nghi ngờ mà vẫn nhận. Bạn bị khởi tố, nhận án treo và mất việc.',
              effects: { happy: -18, karma: -6, money: -20000000, job: 'fire', log: 'Nhận án treo vì tiếp tay vận chuyển hàng cấm.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    // ======================= TÀI XẾ CÔNG NGHỆ =======================
    {
      id: 's_job_taixe_say', title: 'Khách say xỉn', icon: '🍺', age: [18, 60], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['taixe'] },
      text: 'Một giờ sáng, cuốc xe từ quán nhậu. Ông khách lảo đảo leo lên yên sau, mùi bia nồng nặc, vừa đi vừa hát, chốc chốc lại ngả nghiêng suýt kéo cả xe đổ. Đến giữa cầu, ông đòi dừng lại “ngắm sông”.',
      scene: { loc: 'street', time: 'night', weather: 'clear', anim: 'drive', expr: 'scared',
        npcs: [{ role: 'stranger', gender: 'm', age: 45, anim: 'drink', expr: 'happy', say: 'Dừng lại! Cho anh ngắm sông!' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Kiên nhẫn chở về tận nhà',
          text: 'Bạn bắt ông ôm chặt eo, chạy chậm như rùa, vừa đi vừa nói chuyện để ông khỏi ngủ gật. Đến nơi, vợ ông ra đón, rối rít cảm ơn và boa thêm {money:200000}.',
          effects: { money: 200000, happy: 3, karma: 5 },
          scene: { anim: 'drive', fx: 'sparkle', npcAnim: { stranger: 'sleep' } } },
        { label: 'Gọi người nhà ra đón giữa đường',
          success: { stat: 'smarts', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Bạn lục được số “Vợ yêu” trong máy ông, gọi chị ra đầu cầu đón. Mọi chuyện êm đẹp, chị còn đặt tài khoản bạn làm tài xế quen.',
              effects: { happy: 4, smarts: 2, money: 100000 },
              scene: { anim: 'phone', fx: 'idea', npcAnim: { stranger: 'sit' } } },
            { text: 'Không ai nghe máy. Ông khách nổi cáu vì bị “lục điện thoại”, đánh giá bạn một sao kèm khiếu nại.',
              effects: { happy: -5, money: -200000 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { stranger: 'angry' } } }
          ] },
        { label: 'Thả khách xuống, hủy chuyến',
          outcomes: [
            { p: 0.5, text: 'Bạn dừng xe ở cây xăng sáng đèn, nhờ bảo vệ trông giùm rồi hủy chuyến. An toàn cho bạn, nhưng mất tiền cuốc và bị trừ điểm hủy.',
              effects: { happy: -2, money: -100000 },
              scene: { anim: 'shrug', fx: 'sweat' } },
            { p: 0.5, text: 'Ông khách say lao vào túm áo bạn, hai người ngã nhào. Bạn bị trẹo cổ tay, nghỉ chạy cả tuần.',
              effects: { health: -8, money: -2000000, happy: -6, illness: 'Chấn thương cơ' },
              scene: { anim: 'fall', fx: 'dust', npcAnim: { stranger: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_taixe_motsao', title: 'Bị đánh giá 1 sao oan', icon: '⭐', age: [18, 60], weight: 1.5,
      req: { jobId: ['taixe'], notFlag: 'job_taixe_motsao' },
      text: 'Chở khách đúng giờ, đúng đường, còn đưa áo mưa. Vậy mà tối đó app báo: một sao, kèm nhận xét “tài xế thái độ, đi đường vòng”. Điểm của bạn tụt dưới ngưỡng, app khóa tài khoản chờ xét duyệt. Không chạy được ngày nào là mất ngày đó.',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'phone', expr: 'angry',
        npcs: [{ role: 'coworker', gender: 'm', age: 40, anim: 'shrug', say: 'Kháng cáo đi, có camera mà.' }], fx: 'anger', shot: 'close' },
      choices: [
        { label: 'Gửi video camera hành trình kháng cáo',
          success: { stat: 'smarts', base: 0.5, scale: 0.35 },
          outcomes: [
            { text: 'Video và lịch sử GPS cho thấy bạn đi đúng tuyến ngắn nhất. Hãng gỡ đánh giá, mở khóa, tặng thêm điểm thưởng vì “tài xế chuẩn mực”.',
              effects: { happy: 6, smarts: 2, flag: 'job_taixe_motsao' },
              scene: { anim: 'cheer', fx: 'sparkle', npcAnim: { coworker: 'clap' } } },
            { text: 'Tổng đài trả lời tự động, ba tuần sau mới xét. Bạn mất gần một tháng thu nhập.',
              effects: { money: -6000000, happy: -8, flag: 'job_taixe_motsao' },
              scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Lên group tài xế xả bức xúc',
          text: 'Bài viết của bạn được hàng nghìn tài xế chia sẻ, ai cũng từng bị oan. Báo chí vào cuộc, hãng phải sửa chính sách đánh giá. Bạn thành người hùng của anh em tài xế.',
          effects: { happy: 8, karma: 4, looks: 1, flag: 'job_taixe_motsao' },
          scene: { anim: 'phone', fx: 'exclaim', npcAnim: { coworker: 'cheer' } } },
        { label: 'Tìm nhà khách để “nói chuyện”',
          text: 'Bạn mò đến địa chỉ đón khách, gõ cửa đòi gỡ đánh giá. Khách báo công an quấy rối. Hãng khóa tài khoản vĩnh viễn.',
          effects: { happy: -12, karma: -6, job: 'fire', flag: 'job_taixe_motsao' },
          scene: { anim: 'angry', fx: 'anger', loc: 'street', npcAnim: { coworker: 'facepalm' } } }
      ]
    },
    {
      id: 's_job_taixe_hoso', title: 'Nhặt được đồ khách quên', icon: '🎒', age: [18, 60], weight: 1.5,
      req: { jobId: ['taixe'], notFlag: 'job_taixe_hoso' },
      text: 'Sáng ngày thi tốt nghiệp, bạn vừa thả một cậu học sinh trước cổng trường thì thấy chiếc túi nilon trên yên: căn cước, giấy báo dự thi, bút thước. Còn hai mươi phút nữa là đóng cổng phòng thi, trong khi app đang nổ một cuốc xe sân bay giá cao.',
      scene: { loc: 'school', time: 'dawn', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'kid', gender: 'm', age: 17, anim: 'run', expr: 'scared', say: 'Giấy báo thi của em đâu rồi!' }, { role: 'crowd', anim: 'walk' }, { role: 'teacher', anim: 'idle' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Bỏ cuốc sân bay, lao vào tìm cậu bé',
          text: 'Bạn chen qua đám đông, gọi tên in trên giấy báo thi. Cậu bé chạy ra, khóc òa khi nhận lại túi đồ, kịp vào phòng thi trước khi trống điểm. Clip phụ huynh quay được lan khắp mạng, hãng xe tặng bạn thưởng nóng.',
          effects: { karma: 12, happy: 10, looks: 2, money: 2000000, flag: 'job_taixe_hoso' },
          scene: { anim: 'run', fx: 'hearts', npcAnim: { kid: 'hug', crowd: 'clap', teacher: 'clap' } } },
        { label: 'Gửi đồ cho giám thị ở cổng',
          text: 'Bạn đưa túi đồ cho giám thị, ghi lại số điện thoại rồi chạy cuốc sân bay. Cậu bé nhận được đồ kịp giờ. Tối đó, bạn nhận được tin nhắn cảm ơn dài cả trang.',
          effects: { karma: 6, happy: 5, money: 300000, flag: 'job_taixe_hoso' },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { teacher: 'nod' } } },
        { label: 'Để đó, chạy cuốc sân bay trước',
          text: 'Bạn nghĩ “chắc nó tự quay lại tìm”. Chạy về đến nơi đã quá giờ thi. Mấy ngày sau, bạn thấy bài đăng tìm “tài xế mặc áo xanh” của gia đình cậu bé, và không dám nhận.',
          effects: { money: 300000, karma: -10, happy: -8, flag: 'job_taixe_hoso' },
          scene: { anim: 'drive', fx: 'sweat', npcAnim: { kid: 'cry' } } }
      ]
    },
    // ======================= CÔNG NHÂN =======================
    {
      id: 's_job_congnhan_tainan', title: 'Tai nạn lao động', icon: '⚙️', age: [18, 60], weight: 1.5,
      req: { jobId: ['congnhan'], notFlag: 'job_congnhan_tainan' },
      text: 'Để kịp đơn hàng xuất khẩu, quản đốc cho tháo tấm chắn an toàn của máy dập “cho nhanh tay”. Ca đêm thứ ba liên tiếp, mắt bạn díp lại. Máy dập chạy rầm rập, chỉ cần chậm tay nửa giây là chuyện lớn.',
      scene: { loc: 'office', time: 'night', weather: 'clear', anim: 'lift', expr: 'sleepy',
        npcs: [{ role: 'boss', gender: 'm', age: 46, anim: 'point', say: 'Nhanh tay lên, đơn gấp!' }, { role: 'coworker', anim: 'lift' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Dừng máy, đòi lắp lại tấm chắn',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn bấm nút dừng khẩn cấp, cả chuyền ngừng lại. Bạn viết phản ánh lên công đoàn. Tấm chắn được lắp lại, công ty còn khen bạn trong buổi họp an toàn lao động.',
              effects: { karma: 8, happy: 5, smarts: 2, flag: 'job_congnhan_tainan' },
              scene: { anim: 'point', fx: 'exclaim', npcAnim: { boss: 'facepalm', coworker: 'clap' } } },
            { text: 'Quản đốc ghi tên bạn vì “làm chậm tiến độ”, cắt thưởng chuyên cần. Nhưng tấm chắn vẫn được lắp lại sau đó vài hôm.',
              effects: { karma: 6, money: -1500000, happy: -4, flag: 'job_congnhan_tainan' },
              scene: { anim: 'shrug', fx: 'anger', npcAnim: { boss: 'angry' } } }
          ] },
        { label: 'Cố làm cho xong ca',
          outcomes: [
            { p: 0.55, text: 'Bạn gồng qua ca đêm an toàn, nhận tiền tăng ca. Nhưng đêm nào nằm ngủ, tiếng máy dập vẫn văng vẳng trong đầu.',
              effects: { money: 1500000, health: -3, flag: 'job_congnhan_tainan' },
              scene: { anim: 'lift', fx: 'sweat' } },
            { p: 0.45, text: 'Chỉ một giây lơ đãng, máy dập kẹp trúng hai đầu ngón tay. Bạn được đưa đi cấp cứu, nghỉ việc ba tháng. Công ty chi trả bảo hiểm tai nạn lao động sau khi bạn khiếu nại.',
              effects: { health: -15, happy: -12, money: 15000000, illness: 'Dập ngón tay', flag: 'job_congnhan_tainan' },
              scene: { anim: 'fall', expr: 'sick', fx: 'flash', npcAnim: { coworker: 'scared', boss: 'scared' } } }
          ] },
        { label: 'Xin đổi sang vị trí khác',
          text: 'Bạn xin chuyển sang khâu đóng gói, lương thấp hơn một chút nhưng an toàn. Tuần sau, người thay bạn ở máy dập bị tai nạn. Bạn rùng mình, rồi cùng anh em viết đơn tập thể lên công đoàn.',
          effects: { money: -1000000, happy: -2, karma: 4, flag: 'job_congnhan_tainan' },
          scene: { anim: 'walk', fx: 'question', npcAnim: { coworker: 'sad' } } }
      ]
    },
    {
      id: 's_job_congnhan_catca', title: 'Bị cắt giảm ca', icon: '📉', age: [18, 60], weight: 1.5, once: false, cooldown: 3,
      req: { jobId: ['congnhan'] },
      text: 'Đơn hàng sụt giảm, công ty thông báo cắt hết tăng ca, mỗi tuần chỉ làm bốn ngày. Thu nhập tụt gần một nửa, trong khi tiền trọ, tiền gửi về quê vẫn thế. Bảng tin dán thêm danh sách “dự kiến cắt giảm lao động” vào cuối quý.',
      scene: { loc: 'office', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'coworker', gender: 'f', age: 35, anim: 'cry', say: 'Tháng này lấy gì gửi về cho con...' }, { role: 'crowd', anim: 'sad' }, { role: 'boss', anim: 'shrug' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Chạy thêm xe ôm công nghệ buổi tối',
          text: 'Ngày làm nhà máy, tối chạy xe đến khuya. Thu nhập tạm đủ, nhưng người gầy rộc, mắt thâm quầng.',
          effects: { money: 3000000, health: -6, happy: -3 },
          scene: { anim: 'drive', loc: 'street', time: 'night', fx: 'sweat' } },
        { label: 'Học thêm nghề vận hành máy tự động',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Những ngày nghỉ, bạn học khóa vận hành máy CNC. Cuối quý, người khác bị cắt giảm, còn bạn được chuyển sang chuyền tự động với lương cao hơn.',
              effects: { smarts: 6, happy: 8, job: 'raise' },
              scene: { anim: 'study', fx: 'levelup', npcAnim: { boss: 'nod' } } },
            { text: 'Học được nửa khóa thì tiền học hết. Bạn vẫn giữ được chỗ làm, nhưng chưa đổi đời như mong muốn.',
              effects: { smarts: 3, money: -3000000, happy: -2 },
              scene: { anim: 'study', fx: 'question' } }
          ] },
        { label: 'Nhường suất ở lại cho chị đồng nghiệp đơn thân',
          text: 'Bạn tình nguyện ghi tên vào danh sách nghỉ, để chị {coworker} có con nhỏ được ở lại. Nhận trợ cấp thôi việc, bạn khăn gói đi tìm chỗ mới, lòng nhẹ tênh.',
          effects: { karma: 14, happy: 2, money: 12000000, job: 'fire', log: 'Tình nguyện nghỉ việc để đồng nghiệp đơn thân giữ chỗ làm.' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { coworker: 'cry' } } }
      ]
    },
    {
      id: 's_job_congnhan_totruong', title: 'Được lên tổ trưởng', icon: '🦺', age: [20, 60], weight: 1.4,
      req: { jobId: ['congnhan'], notFlag: 'job_congnhan_totruong' },
      text: 'Quản đốc gọi bạn lên văn phòng: tổ trưởng cũ nghỉ hưu, bạn được đề cử thay vì tay nghề chắc, ít sai sót. Nhưng anh {coworker}, người làm lâu năm nhất tổ, cũng nhắm chiếc ghế này từ lâu.',
      scene: { loc: 'office', time: 'day', weather: 'clear', anim: 'idle', expr: 'happy',
        npcs: [{ role: 'boss', gender: 'm', age: 50, anim: 'talk', say: 'Tổ này giao cho em nhé.' }, { role: 'coworker', gender: 'm', age: 45, anim: 'angry', expr: 'angry' }], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Nhận lời, mời anh làm tổ phó',
          text: 'Bạn nhận chức, việc đầu tiên là mời anh {coworker} làm tổ phó, giao phần đào tạo người mới. Anh bất ngờ, rồi bắt tay bạn thật chặt. Tổ của bạn năm đó đạt năng suất cao nhất xưởng.',
          effects: { happy: 10, karma: 6, job: 'promote', flag: 'job_congnhan_totruong' },
          scene: { anim: 'hug', fx: 'levelup', npcAnim: { coworker: 'nod', boss: 'clap' } } },
        { label: 'Nhận lời, siết kỷ luật ngay',
          text: 'Bạn lên chức và siết giờ giấc, phạt nặng ai đi trễ. Năng suất tăng, quản đốc hài lòng, nhưng giờ cơm không còn ai ngồi cạnh bạn.',
          effects: { happy: 4, job: 'promote', flag: 'job_congnhan_totruong' },
          scene: { anim: 'point', fx: 'levelup', npcAnim: { coworker: 'angry' } } },
        { label: 'Nhường cho anh lâu năm hơn',
          text: 'Bạn đề xuất anh {coworker}: “Anh làm lâu, anh em nể.” Anh bất ngờ, từ đó coi bạn như em ruột. Quản đốc ghi nhận, hứa suất tổ trưởng sau sẽ là của bạn.',
          effects: { happy: 3, karma: 10, flag: 'job_congnhan_totruong' },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { coworker: 'hug' } } }
      ]
    },
    // ======================= CHỦ KINH DOANH =======================
    {
      id: 's_job_kinhdoanh_luadao', title: 'Đối tác lừa đảo', icon: '🦊', age: [22, 65], weight: 1.5,
      req: { jobId: ['kinhdoanh'], notFlag: 'job_kinhdoanh_luadao' },
      text: 'Một “đối tác” áo vest, đồng hồ vàng, nói giọng ngọt như mía lùi, đề nghị bạn nhập lô hàng gia dụng nhập khẩu giá chỉ bằng 60% thị trường. Điều kiện: đặt cọc {money:500000000} trong tuần này, “hàng hot lắm, chậm là người khác lấy”.',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'sit', expr: 'happy',
        npcs: [{ role: 'stranger', gender: 'm', age: 42, anim: 'talk', expr: 'happy', say: 'Cơ hội ngàn năm có một đó!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Chuyển cọc ngay, sợ lỡ cơ hội',
          text: 'Bạn chuyển khoản nửa tỷ, nhận lại bản hợp đồng đóng dấu đỏ chót. Đối tác hẹn hai tuần sau hàng về cảng.',
          effects: { money: -500000000, happy: 4, flag: ['job_kinhdoanh_luadao', 'job_kinhdoanh_dacoc'], followUp: { id: 's_job_kinhdoanh_luadao_2', delay: 0 } },
          scene: { anim: 'phone', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Thẩm định kỹ: tra mã số thuế, xuống tận kho',
          success: { stat: 'smarts', base: 0.5, scale: 0.4 },
          outcomes: [
            { text: 'Mã số thuế của công ty đã ngừng hoạt động, “kho hàng” chỉ là bãi đất trống. Bạn rút lui, còn báo cho công an. Ba tháng sau đọc báo, gã bị bắt vì lừa hơn hai mươi chủ cửa hàng.',
              effects: { smarts: 5, happy: 6, karma: 4, flag: 'job_kinhdoanh_luadao' },
              scene: { anim: 'think', fx: 'idea', npcAnim: { stranger: 'scared' } } },
            { text: 'Giấy tờ trông đều hợp lệ, bạn yên tâm đặt cọc một phần. Rồi điện thoại đối tác bắt đầu thuê bao.',
              effects: { money: -200000000, happy: -4, flag: ['job_kinhdoanh_luadao', 'job_kinhdoanh_dacoc'], followUp: { id: 's_job_kinhdoanh_luadao_2', delay: 0 } },
              scene: { anim: 'phone', fx: 'question', npcAnim: { stranger: 'wave' } } }
          ] },
        { label: 'Từ chối, làm ăn chậm mà chắc',
          text: 'Bạn mỉm cười lắc đầu: “Thứ gì rẻ bất thường thì bất thường thật.” Gã đối tác chép miệng bỏ đi, bạn quay về với các nhà cung cấp quen.',
          effects: { happy: 1, smarts: 2, flag: 'job_kinhdoanh_luadao' },
          scene: { anim: 'shake', fx: 'sparkle', npcAnim: { stranger: 'shrug' } } }
      ]
    },
    {
      id: 's_job_kinhdoanh_luadao_2', title: 'Kho hàng trống rỗng', icon: '🕳️', age: [22, 70], chainOnly: true,
      req: { jobId: ['kinhdoanh'] },
      text: 'Hai tuần trôi qua, không có hàng. Số điện thoại đối tác thuê bao, văn phòng công ty đã trả mặt bằng. Hợp đồng đóng dấu đỏ hóa ra là dấu giả. Khoản tiền cọc đã bốc hơi.',
      scene: { loc: 'office', time: 'day', weather: 'rain', anim: 'phone', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 38, anim: 'type', say: 'Anh chị kể lại từ đầu nhé.' }, { role: 'crowd', anim: 'angry' }], fx: 'heartbreak', shot: 'dramatic' },
      choices: [
        { label: 'Trình báo công an, liên kết các nạn nhân', req: { flag: 'job_kinhdoanh_dacoc' },
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Bạn lập nhóm Zalo với mười chín nạn nhân khác, gom bằng chứng nộp công an. Nửa năm sau, gã bị bắt ở cửa khẩu, bạn được hoàn lại một phần tiền.',
              effects: { money: 150000000, smarts: 4, happy: 4, karma: 4, unflag: 'job_kinhdoanh_dacoc' },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { police: 'nod', crowd: 'cheer' } } },
            { text: 'Gã đã trốn ra nước ngoài. Hồ sơ treo đó, tiền mất trắng. Bạn phải vay nóng để xoay vòng vốn cho cửa hàng.',
              effects: { happy: -12, health: -4, money: -50000000, unflag: 'job_kinhdoanh_dacoc' },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { police: 'shrug' } } }
          ] },
        { label: 'Thuê giang hồ đi đòi nợ',
          outcomes: [
            { p: 0.3, text: 'Đám đòi nợ thuê lùng ra gã, ép trả lại một nửa. Bạn lấy lại được tiền, nhưng giờ dính dáng tới những người không nên dính.',
              effects: { money: 150000000, karma: -12, happy: -2 },
              scene: { anim: 'idle', fx: 'money', npcAnim: { crowd: 'angry' } } },
            { p: 0.7, text: 'Đám giang hồ cầm tiền công rồi biến mất, còn bạn bị công an mời lên vì liên quan đến vụ đe dọa người khác.',
              effects: { money: -50000000, karma: -12, happy: -12 },
              scene: { anim: 'facepalm', fx: 'anger', npcAnim: { police: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_job_kinhdoanh_thanhtra', title: 'Thanh tra đột xuất', icon: '📋', age: [22, 65], weight: 1.6, once: false, cooldown: 3,
      req: { jobId: ['kinhdoanh'] },
      text: 'Sáng thứ Hai, đoàn liên ngành ập vào kiểm tra phòng cháy, vệ sinh an toàn thực phẩm và hóa đơn chứng từ. Họ chỉ ra bình chữa cháy hết hạn, vài hóa đơn đầu vào thiếu. Trưởng đoàn hạ giọng: “Chuyện này to nhỏ là do mình cả thôi.”',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'police', gender: 'm', age: 50, anim: 'point', say: 'To nhỏ là do mình cả thôi.' }, { role: 'coworker', anim: 'scared' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Nhận lỗi, nộp phạt, khắc phục ngay',
          text: 'Bạn ký biên bản, nộp phạt {money:30000000}, thay toàn bộ bình chữa cháy, thuê kế toán rà lại sổ sách. Tốn kém, nhưng từ đó bạn ngủ ngon.',
          effects: { money: -30000000, happy: -3, karma: 6, smarts: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { police: 'nod' } } },
        { label: 'Dúi phong bì cho êm',
          outcomes: [
            { p: 0.5, text: 'Phong bì {money:50000000} đổi lấy biên bản “không phát hiện vi phạm”. Bạn thở phào, nhưng từ đó cứ vài tháng lại có người đến “thăm hỏi”.',
              effects: { money: -50000000, karma: -12, flag: 'job_kinhdoanh_hoilo' },
              scene: { anim: 'idle', fx: 'money', npcAnim: { police: 'laugh' } } },
            { p: 0.5, text: 'Đoàn có người của thanh tra nội bộ. Bạn bị lập biên bản thêm tội đưa hối lộ, cửa hàng bị đình chỉ kinh doanh một tháng.',
              effects: { money: -120000000, karma: -12, happy: -14, log: 'Cửa hàng bị đình chỉ một tháng vì đưa hối lộ đoàn thanh tra.' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { police: 'point' } } }
          ] },
        { label: 'Đối chất từng điều khoản luật',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Bạn chứng minh hóa đơn thiếu là do nhà cung cấp gửi chậm, đã có biên bản. Mức phạt giảm còn một phần ba, đoàn kiểm tra nhìn bạn bằng ánh mắt nể nang.',
              effects: { money: -10000000, smarts: 4, happy: 4 },
              scene: { anim: 'point', fx: 'idea', npcAnim: { police: 'think' } } },
            { text: 'Càng cãi càng sai. Đoàn lập biên bản thêm lỗi “cản trở kiểm tra”, mức phạt tăng gấp đôi.',
              effects: { money: -60000000, happy: -8 },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { police: 'angry' } } }
          ] }
      ]
    },
    {
      id: 's_job_kinhdoanh_chinhanh', title: 'Mở thêm chi nhánh', icon: '🏬', age: [24, 65], weight: 1.4,
      req: { jobId: ['kinhdoanh'], minMoney: 500000000, notFlag: 'job_kinhdoanh_chinhanh' },
      text: 'Cửa hàng đầu tiên đã có lãi đều ba năm. Một mặt bằng góc ngã tư bên quận mới được rao cho thuê, vốn đầu tư khoảng {money:800000000}. Kế toán lo ngại dòng tiền, còn quản lý cửa hàng thì háo hức.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'think', expr: 'happy',
        npcs: [{ role: 'coworker', gender: 'f', age: 30, anim: 'cheer', say: 'Mở đi anh chị, chắc chắn đông!' }, { role: 'stranger', gender: 'm', age: 55, anim: 'talk', say: 'Góc ngã tư, giá này là hời.' }], fx: 'idea', shot: 'wide' },
      choices: [
        { label: 'Mở chi nhánh ngay',
          success: { stat: 'smarts', base: 0.4, scale: 0.45 },
          outcomes: [
            { text: 'Chi nhánh mới đông khách từ tuần đầu. Một năm sau đã hoàn vốn, bạn chính thức có chuỗi cửa hàng của riêng mình.',
              effects: { money: -800000000, happy: 12, smarts: 3, job: 'promote', flag: 'job_kinhdoanh_chinhanh', followUp: { id: 's_job_kinhdoanh_chinhanh_2', delay: 1 } },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { coworker: 'cheer' } } },
            { text: 'Khu mới chưa đông dân như quảng cáo. Chi nhánh lỗ liên tục, một năm sau phải đóng cửa, mang theo hơn nửa số vốn.',
              effects: { money: -500000000, happy: -12, smarts: 4, flag: 'job_kinhdoanh_chinhanh' },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { coworker: 'sad' } } }
          ] },
        { label: 'Khảo sát ba tháng rồi mới quyết',
          text: 'Bạn cho người đứng đếm lượt khách qua ngã tư suốt ba tháng. Số liệu tốt, bạn mở chi nhánh với quy mô vừa phải. Lãi không nhanh, nhưng chắc.',
          effects: { money: -500000000, happy: 6, smarts: 4, job: 'raise', flag: 'job_kinhdoanh_chinhanh' },
          scene: { anim: 'type', fx: 'idea', npcAnim: { coworker: 'nod' } } },
        { label: 'Nhượng quyền thay vì tự mở',
          text: 'Bạn đóng gói thương hiệu, bán nhượng quyền cho người khác mở. Không tốn vốn, mỗi tháng thu phí đều. Nhưng chất lượng chi nhánh nhượng quyền không phải lúc nào cũng như ý.',
          effects: { money: 150000000, happy: 5, smarts: 2, flag: 'job_kinhdoanh_chinhanh' },
          scene: { anim: 'talk', fx: 'money', npcAnim: { stranger: 'nod' } } }
      ]
    },
    {
      id: 's_job_kinhdoanh_chinhanh_2', title: 'Quản lý chi nhánh ôm tiền', icon: '💼', age: [24, 70], chainOnly: true,
      req: { jobId: ['kinhdoanh'] },
      text: 'Chuỗi cửa hàng đang lên thì kế toán báo: doanh thu chi nhánh mới bị khai khống, ba tháng thất thoát gần {money:200000000}. Người quản lý chi nhánh, người bạn tin nhất, bắt đầu né tránh các cuộc gọi.',
      scene: { loc: 'office', time: 'night', weather: 'rain', anim: 'type', expr: 'angry',
        npcs: [{ role: 'coworker', gender: 'f', age: 30, anim: 'scared', say: 'Em... em sẽ trả lại mà.' }, { role: 'stranger', gender: 'm', age: 45, anim: 'point', say: 'Sổ sách lệch hết rồi.' }], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Báo công an xử lý theo luật',
          text: 'Bạn nộp đơn tố giác. Quản lý bị khởi tố, bạn thu hồi được phần lớn số tiền. Từ đó bạn lắp phần mềm quản lý bán hàng cho toàn chuỗi, không để một kẽ hở nào.',
          effects: { money: 150000000, smarts: 4, happy: -4 },
          scene: { anim: 'phone', fx: 'exclaim', npcAnim: { coworker: 'cry' } } },
        { label: 'Cho trả góp, giữ kín chuyện',
          outcomes: [
            { p: 0.6, text: 'Cô ấy khóc, kể chuyện mẹ bệnh nặng. Bạn cho trả góp, chuyển sang vị trí khác. Hai năm sau, cô trả đủ từng đồng và trở thành nhân viên trung thành nhất.',
              effects: { karma: 12, happy: 6, money: 200000000 },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { coworker: 'cry' } } },
            { p: 0.4, text: 'Một tháng sau, cô ta nghỉ việc, chặn mọi liên lạc. Tiền mất, lòng tin cũng mất.',
              effects: { karma: 4, happy: -10 },
              scene: { anim: 'facepalm', fx: 'heartbreak' } }
          ] }
      ]
    }
  );
})();
