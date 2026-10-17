/* Một Kiếp Người — mang thai ngoài ý muốn & nuôi con (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  const kidAge = (a, b) => (s) => s.people.some((p) => p.alive && p.role === 'child' && p.age >= a && p.age <= b);
  const hetero = (s) => s.people.some((p) => p.alive && p.role === 'partner' && p.gender !== s.player.gender);
  KN.EVENTS.push(
    // ======================= MANG THAI NGOÀI Ý MUỐN (nhân vật nữ) =======================
    {
      id: 's_preg_nu', title: 'Hai vạch', icon: '🤰', age: [17, 38], weight: 0.9,
      req: { gender: 'f', has: ['partner'], married: false, notFlag: 's_preg', cond: hetero },
      text: 'Mấy hôm nay bạn mệt lả, ngửi mùi cơm là buồn nôn. Bạn mua que thử ở hiệu thuốc đầu ngõ, ngồi trong nhà vệ sinh nhìn chằm chằm: hai vạch đỏ rõ mồn một. Tay bạn run lên khi mở Zalo, gõ rồi lại xóa tin nhắn gửi {partner}.',
      scene: { loc: 'bedroom', time: 'night', anim: 'scared', expr: 'scared', npcs: [], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Nói với {partner}, cùng quyết định giữ con',
          outcomes: [
            { p: 0.6, text: '{partner} im lặng một lúc lâu, rồi nắm chặt tay bạn: “Mình cưới nhé. Mình sẽ cùng nuôi con.” Đám cưới chạy được tổ chức vội trong một tháng.',
              effects: { happy: 4, marry: true, baby: true, money: -40000000, rel: { partner: 10 }, flag: ['s_preg', 's_preg_giu'], followUp: { id: 's_preg_namdau', delay: 1 } },
              scene: { anim: 'hug', fx: 'hearts', npcs: [{ role: 'partner', anim: 'hug' }] } },
            { p: 0.4, text: '{partner} bảo “chưa sẵn sàng”, rồi chặn liên lạc. Bạn quyết định vẫn giữ con, một mình.',
              effects: { happy: -12, removePerson: 'partner', baby: 'solo', flag: ['s_preg', 's_preg_giu', 's_single_parent'], followUp: { id: 's_single_me', delay: 1 } },
              scene: { anim: 'cry', fx: 'heartbreak' } }
          ] },
        { label: 'Kể với bố mẹ trước',
          outcomes: [
            { p: 0.55, text: 'Mẹ khóc, bố im lặng hút thuốc cả đêm. Nhưng sáng hôm sau, mẹ nấu cho bạn bát cháo và nói: “Có chuyện gì cả nhà cùng lo.” Bố mẹ sang nhà {partner} nói chuyện người lớn.',
              effects: { happy: 2, marry: true, baby: true, money: -30000000, rel: { mother: 6 }, flag: ['s_preg', 's_preg_giu'], followUp: { id: 's_preg_namdau', delay: 1 } },
              scene: { loc: 'home', anim: 'hug', fx: 'tears', npcs: [{ role: 'mother', anim: 'hug' }] } },
            { p: 0.45, text: 'Bố đập bàn: “Con gái con lứa mà…” Cả nhà mấy tuần không ai nói chuyện với ai. Cuối cùng bố mẹ vẫn giúp lo đám cưới, nhưng ánh mắt thì không còn như xưa.',
              effects: { happy: -8, marry: true, baby: true, money: -30000000, rel: { mother: -10, father: -15 }, flag: ['s_preg', 's_preg_giu'], followUp: { id: 's_preg_namdau', delay: 1 } },
              scene: { loc: 'home', anim: 'cry', fx: 'anger', npcs: [{ role: 'father', anim: 'angry' }] } }
          ] },
        { label: 'Giữ con nhưng chưa cưới, tự lo', req: { minMoney: 20000000 },
          text: 'Bạn quyết định giữ con mà không vội cưới. Những tháng bầu bí vừa đi làm vừa tự đi khám thai, vất vả nhưng bạn thấy mình mạnh mẽ hơn bao giờ hết.',
          effects: { happy: -2, baby: 'solo', money: -20000000, flag: ['s_preg', 's_preg_giu', 's_single_parent'], followUp: { id: 's_single_me', delay: 1 } },
          scene: { loc: 'hospital', anim: 'sit', fx: 'sparkle', npcs: [{ role: 'doctor', anim: 'talk', say: 'Em bé khỏe lắm.' }] } },
        { label: 'Đến bệnh viện xin tư vấn, quyết định chưa giữ', req: { stage: 'adult' },
          text: 'Bạn đến bệnh viện phụ sản, bác sĩ tư vấn kỹ lưỡng. Sau nhiều đêm suy nghĩ, bạn quyết định chưa giữ. Cơ thể hồi phục sau vài tuần, nhưng có những điều lặng lẽ ở lại rất lâu trong lòng.',
          effects: { happy: -10, health: -5, money: -5000000, flag: 's_preg' },
          scene: { loc: 'hospital', anim: 'sad', fx: 'tears', npcs: [{ role: 'doctor', anim: 'talk', say: 'Em cứ suy nghĩ thật kỹ.' }] } }
      ]
    },
    // ======================= MANG THAI NGOÀI Ý MUỐN (nhân vật nam) =======================
    {
      id: 's_preg_nam', title: '“Em có thai rồi”', icon: '🤰', age: [17, 40], weight: 0.9,
      req: { gender: 'm', has: ['partner'], married: false, notFlag: 's_preg', cond: hetero },
      text: '{partner} hẹn bạn ra quán cà phê, mắt đỏ hoe, đặt que thử thai lên bàn: “Em có thai rồi. Anh tính sao?” Ly cà phê trước mặt bạn nguội dần.',
      scene: { loc: 'cafe', time: 'dusk', anim: 'scared', expr: 'surprised', npcs: [{ role: 'partner', anim: 'cry', say: 'Anh tính sao?' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Nắm tay: “Mình cưới. Anh chịu trách nhiệm”',
          text: 'Bạn nói chắc nịch. {partner} bật khóc. Hai bên gia đình gặp nhau, đám cưới chạy tổ chức gọn trong tháng. Bạn bắt đầu làm thêm buổi tối để lo sữa bỉm.',
          effects: { happy: 2, karma: 8, marry: true, baby: true, money: -40000000, rel: { partner: 12 }, flag: ['s_preg', 's_preg_giu'], followUp: { id: 's_preg_namdau', delay: 1 } },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { partner: 'hug' } } },
        { label: 'Đề nghị nghĩ thêm vài ngày',
          outcomes: [
            { p: 0.5, text: 'Ba ngày suy nghĩ, bạn quay lại với một bó hoa và bản kế hoạch chi tiêu cho gia đình nhỏ. {partner} gật đầu.',
              effects: { happy: 3, marry: true, baby: true, money: -35000000, rel: { partner: 6 }, flag: ['s_preg', 's_preg_giu'], followUp: { id: 's_preg_namdau', delay: 1 } },
              scene: { anim: 'nod', fx: 'sparkle', npcAnim: { partner: 'hug' } } },
            { p: 0.5, text: 'Ba ngày im lặng của bạn là quá đủ để {partner} hiểu. Cô ấy nói sẽ tự nuôi con, không cần bạn nữa. Bạn mất cả người yêu lẫn cơ hội làm bố.',
              effects: { happy: -10, karma: -6, removePerson: 'partner', flag: ['s_preg', 's_preg_vang'] },
              scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { partner: 'walk' } } }
          ] },
        { label: 'Chặn liên lạc, “biến mất”',
          text: 'Bạn tắt điện thoại, chuyển chỗ trọ. Bạn bè chung dần dần không ai muốn chơi với bạn nữa. Nhiều năm sau, bạn vẫn giật mình mỗi lần thấy một đứa trẻ trạc tuổi ấy.',
          effects: { happy: -6, karma: -20, removePerson: 'partner', flag: ['s_preg', 's_preg_vang'], followUp: { id: 's_preg_con_tim', delay: 4 } },
          scene: { loc: 'street', time: 'night', anim: 'walk', fx: 'dust', npcAnim: { partner: 'cry' } } }
      ]
    },
    {
      id: 's_preg_con_tim', title: 'Đứa trẻ ở cổng trường', icon: '🧒', age: [21, 60], chainOnly: true,
      req: { flag: 's_preg_vang' },
      text: 'Một chiều đi ngang trường tiểu học, bạn nhìn thấy người yêu cũ đang đón một đứa bé có đôi mắt giống hệt bạn. Đứa bé ngước lên nhìn bạn, tò mò, rồi quay đi.',
      scene: { loc: 'school', time: 'dusk', anim: 'sad', expr: 'sad', npcs: [{ role: 'ex', anim: 'idle' }, { role: 'kid', anim: 'wave' }], fx: 'tears' },
      choices: [
        { label: 'Tiến lại, xin được nhận con',
          success: { stat: 'karma', base: 0.2, scale: 0.5 },
          outcomes: [
            { text: 'Người cũ im lặng rất lâu, rồi cho phép bạn đón con mỗi cuối tuần, với điều kiện góp tiền nuôi con đầy đủ. Lần đầu nghe con gọi “bố”, bạn quay đi lau nước mắt.',
              effects: { happy: 10, karma: 10, money: -30000000, baby: 'solo', unflag: 's_preg_vang' },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { kid: 'hug' } } },
            { text: '“Muộn rồi. Con có bố dượng thương nó lắm.” Cánh cổng trường khép lại. Bạn hiểu có những thứ đã mất là mất mãi.',
              effects: { happy: -10, unflag: 's_preg_vang' },
              scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { ex: 'shake' } } }
          ] },
        { label: 'Lặng lẽ quay đi',
          text: 'Bạn bước nhanh qua, tim đập thình thịch. Đêm đó bạn chuyển khoản ẩn danh một khoản tiền vào tài khoản người cũ, không kèm lời nhắn.',
          effects: { happy: -6, karma: 3, money: -20000000, unflag: 's_preg_vang' },
          scene: { anim: 'walk', fx: 'tears' } }
      ]
    },
    {
      id: 's_preg_namdau', title: 'Năm đầu làm bố mẹ trẻ', icon: '🍼', age: [18, 45], chainOnly: true,
      req: { has: ['child'] },
      text: 'Con đầy năm. Một năm qua là chuỗi đêm thức trắng, tiền sữa bỉm, những lần cãi nhau vì mệt. Bạn bè cùng tuổi đi du lịch, đi học, còn bạn đếm từng đồng cho hộp sữa tiếp theo.',
      scene: { loc: 'home', time: 'night', anim: 'sleep', expr: 'sleepy', npcs: [{ role: 'child', anim: 'cry' }], fx: 'zzz' },
      choices: [
        { label: 'Bảo lưu việc học, đi làm toàn thời gian',
          text: 'Bạn gác giấc mơ học hành, đi làm cả ngày lẫn tối. Tiền không dư dả, nhưng con không thiếu sữa. Nhìn con ngủ, bạn thấy mọi hy sinh đều đáng.',
          effects: { happy: -2, health: -4, money: 30000000, school: 'dropout', rel: { child: 8 } },
          scene: { loc: 'office', anim: 'type', fx: 'sweat' } },
        { label: 'Nhờ ông bà trông con để tiếp tục học, làm',
          outcomes: [
            { p: 0.7, text: 'Ông bà đón cháu về quê, bạn tranh thủ học xong và đi làm. Mỗi cuối tuần về thăm con, con lại lớn thêm một chút.',
              effects: { happy: 3, smarts: 2, rel: { child: -3, mother: 5 } },
              scene: { loc: 'countryside', anim: 'hug', fx: 'hearts' } },
            { p: 0.3, text: 'Ông bà già yếu, trông cháu không xuể. Con ốm liên miên, bạn lại phải đón về tự lo.',
              effects: { happy: -6, money: -15000000 },
              scene: { loc: 'hospital', anim: 'sad', fx: 'sweat' } }
          ] },
        { label: 'Chia ca với nửa kia, ai cũng phải nhường', req: { married: true },
          success: { stat: 'happy', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Hai người dán lịch chia ca lên tủ lạnh: ai trông đêm, ai đi chợ, ai cho con đi tiêm. Mệt, nhưng là mệt cùng nhau. Tình cảm lại khăng khít hơn.',
              effects: { happy: 5, rel: { spouse: 10, child: 6 } },
              scene: { anim: 'hug', fx: 'hearts' } },
            { text: 'Lịch chia ca chẳng ai giữ được. Cãi nhau chuyện ai thức đêm nhiều hơn thành chuyện cơm bữa.',
              effects: { happy: -6, rel: { spouse: -10 } },
              scene: { anim: 'angry', fx: 'anger' } }
          ] }
      ]
    },
    {
      id: 's_single_me', title: 'Một mình nuôi con', icon: '👩‍👧', age: [18, 50], chainOnly: true,
      req: { flag: 's_single_parent', has: ['child'] },
      text: 'Làm bố/mẹ đơn thân: sáng đưa con đi nhà trẻ, trưa ăn vội ổ bánh mì, chiều chạy về đón con trước 5 giờ kẻo cô giáo gọi. Tháng này tiền nhà, tiền sữa, tiền học cộng lại vượt quá lương.',
      scene: { loc: 'street', time: 'dusk', anim: 'run', expr: 'sleepy', npcs: [{ role: 'child', anim: 'wave' }], fx: 'sweat' },
      choices: [
        { label: 'Nhận thêm việc làm buổi tối',
          text: 'Bạn nhận dạy kèm, đóng hàng online sau khi con ngủ. Thu nhập đủ trang trải, nhưng mắt lúc nào cũng thâm quầng.',
          effects: { money: 25000000, health: -6, happy: -3, rel: { child: 4 } },
          scene: { loc: 'home', time: 'night', anim: 'type', fx: 'zzz' } },
        { label: 'Đưa con về sống cùng ông bà',
          text: 'Về ở với bố mẹ, có người phụ trông con, đỡ được tiền nhà. Đổi lại là những lời “góp ý” không ngớt về chuyện chồng con.',
          effects: { money: 15000000, happy: 2, rel: { mother: 5, child: 6 } },
          scene: { loc: 'home', anim: 'hug', fx: 'hearts', npcs: [{ role: 'mother', anim: 'hug' }] } },
        { label: 'Kiện đòi tiền cấp dưỡng',
          outcomes: [
            { p: 0.6, text: 'Tòa buộc người kia cấp dưỡng mỗi tháng. Không nhiều, nhưng đủ tiền sữa và học phí.',
              effects: { money: 30000000, happy: 4, unflag: 's_single_parent' },
              scene: { loc: 'office', anim: 'nod', fx: 'money' } },
            { p: 0.4, text: 'Người kia trốn tránh, chuyển việc liên tục. Đơn kiện nằm đó, còn bạn vẫn một mình.',
              effects: { money: -5000000, happy: -5 },
              scene: { loc: 'office', anim: 'sad', fx: 'sweat' } }
          ] }
      ]
    },

    // ======================= NUÔI CON =======================
    {
      id: 's_nuoi_dem_trang', title: 'Đêm thứ một trăm không ngủ', icon: '😵', age: [18, 55], weight: 1.4,
      req: { cond: kidAge(0, 1), notFlag: 's_nuoi_dem' },
      text: 'Bé khóc dạ đề từ 11 giờ đêm đến 3 giờ sáng, đêm nào cũng như đêm nào. Bạn bế con đi vòng quanh phòng, mắt díp lại, tay mỏi rã rời. Sáng mai vẫn phải đi làm.',
      scene: { loc: 'bedroom', time: 'night', anim: 'sleep', expr: 'sleepy', npcs: [{ role: 'baby', anim: 'cry' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Thay ca với nửa kia', req: { married: true },
          text: 'Hai người chia đôi đêm: bạn trông đến 2 giờ, người kia trông đến sáng. Vẫn mệt, nhưng còn ngủ được vài tiếng.',
          effects: { health: -2, happy: 1, rel: { spouse: 5 }, flag: 's_nuoi_dem' },
          scene: { anim: 'hug', fx: 'hearts' } },
        { label: 'Thuê người giúp việc ban đêm', req: { minMoney: 30000000 },
          text: 'Bạn thuê cô giúp việc trông đêm, {money:8000000} mỗi tháng. Lần đầu sau nhiều tháng bạn ngủ trọn giấc.',
          effects: { money: -30000000, health: 3, happy: 4, flag: 's_nuoi_dem' },
          scene: { anim: 'sleep', fx: 'zzz' } },
        { label: 'Cắn răng chịu, tự lo hết',
          text: 'Bạn gồng mình đến khi con qua giai đoạn dạ đề. Sụt 4 cân, quầng mắt thâm sì, nhưng sáng nào con cũng cười toe khi thấy bạn.',
          effects: { health: -6, happy: -3, rel: { child: 8 }, flag: 's_nuoi_dem' },
          scene: { anim: 'sad', fx: 'sweat' } }
      ]
    },
    {
      id: 's_nuoi_sua', title: 'Sữa ngoại hay sữa nội?', icon: '🍼', age: [18, 55], weight: 1.1,
      req: { cond: kidAge(0, 3), notFlag: 's_nuoi_sua' },
      text: 'Hộp sữa ngoại mấy chục ngàn một muỗng, cả nhóm mẹ bỉm trên Facebook đều khen. Sữa nội rẻ bằng một nửa, bác sĩ nhi bảo dinh dưỡng chẳng kém. Họ hàng thì bảo: “Phải sữa ngoại con mới thông minh!”',
      scene: { loc: 'market', anim: 'think', npcs: [{ role: 'vendor', anim: 'talk', say: 'Sữa Nhật xách tay chị ơi!' }], fx: 'question' },
      choices: [
        { label: 'Mua sữa ngoại xịn nhất',
          text: 'Mỗi tháng tiền sữa ngốn gần nửa lương. Con vẫn bụ bẫm như bao đứa trẻ khác, còn ví bạn thì xẹp lép.',
          effects: { money: -40000000, happy: 1, flag: 's_nuoi_sua' },
          scene: { anim: 'cheer', fx: 'money' } },
        { label: 'Nghe bác sĩ, dùng sữa nội phù hợp',
          text: 'Bạn chọn loại sữa bác sĩ khuyên. Con lớn đều, cân nặng đạt chuẩn. Tiết kiệm được kha khá để mở sổ tiết kiệm cho con.',
          effects: { money: -12000000, smarts: 2, flag: 's_nuoi_sua' },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Mua sữa “xách tay” giá rẻ trên mạng',
          outcomes: [
            { p: 0.6, text: 'Rẻ thật, và có vẻ cũng ổn. Bạn tiết kiệm được kha khá.',
              effects: { money: -10000000, flag: 's_nuoi_sua' },
              scene: { anim: 'phone', fx: 'money' } },
            { p: 0.4, text: 'Con bị tiêu chảy mấy ngày, đi khám mới biết lô sữa là hàng giả. Vừa mất tiền vừa xót con.',
              effects: { money: -18000000, happy: -8, flag: 's_nuoi_sua' },
              scene: { loc: 'hospital', anim: 'cry', fx: 'tears', npcs: [{ role: 'doctor', anim: 'shake' }] } }
          ] }
      ]
    },
    {
      id: 's_nuoi_nha_tre', title: 'Gửi con đi đâu?', icon: '🧸', age: [18, 55], weight: 1.2,
      req: { cond: kidAge(1, 3), notFlag: 's_nuoi_nhatre' },
      text: 'Hết thời gian nghỉ sinh, phải đi làm lại. Nhà trẻ tư gần nhà {money:5000000} một tháng, trường công thì hết chỗ. Ông bà ở quê bảo: “Đưa cháu về đây bà trông.”',
      scene: { loc: 'school', anim: 'think', npcs: [{ role: 'teacher', gender: 'f', anim: 'wave', say: 'Lớp còn đúng một chỗ!' }, { role: 'baby', anim: 'cry' }], fx: 'question' },
      choices: [
        { label: 'Gửi nhà trẻ tư có camera',
          text: 'Bạn chọn trường có camera xem qua điện thoại. Giờ nghỉ trưa nào cũng mở ra xem con ăn ngủ. Tốn tiền nhưng yên tâm.',
          effects: { money: -45000000, happy: 2, flag: 's_nuoi_nhatre' },
          scene: { anim: 'phone', fx: 'sparkle' } },
        { label: 'Gửi về quê cho ông bà trông',
          text: 'Con về quê với ông bà, chạy nhảy ngoài vườn, da rám nắng, nói giọng quê. Mỗi lần gọi video con lại hỏi “Bao giờ bố mẹ về?”.',
          effects: { money: -10000000, happy: -3, rel: { child: -6, mother: 6 }, flag: 's_nuoi_nhatre' },
          scene: { loc: 'countryside', anim: 'wave', fx: 'tears' } },
        { label: 'Gửi người trông trẻ tại nhà rẻ',
          outcomes: [
            { p: 0.65, text: 'Cô trông trẻ hiền lành, con quấn cô như người nhà.',
              effects: { money: -25000000, happy: 3, flag: 's_nuoi_nhatre' },
              scene: { anim: 'nod', fx: 'hearts' } },
            { p: 0.35, text: 'Camera lén lắp trong phòng cho thấy cô quát mắng, bỏ con khóc một mình. Bạn cho nghỉ ngay, báo công an phường, xót con cả tháng.',
              effects: { money: -15000000, happy: -10, flag: 's_nuoi_nhatre' },
              scene: { anim: 'cry', fx: 'anger', npcs: [{ role: 'police', anim: 'talk' }] } }
          ] }
      ]
    },
    {
      id: 's_nuoi_lop1', title: 'Con vào lớp Một', icon: '✏️', age: [22, 60], weight: 1.3,
      req: { cond: kidAge(5, 7), notFlag: 's_nuoi_lop1' },
      text: 'Con sắp vào lớp Một. Phụ huynh trong nhóm Zalo lớp rần rần cho con “học trước” chữ và toán từ hè, có lớp luyện viết {money:3000000} một tháng. Con thì chỉ thích đá bóng và nghịch cát.',
      scene: { loc: 'school', anim: 'think', npcs: [{ role: 'kid', anim: 'run' }, { role: 'neighbor', gender: 'f', anim: 'talk', say: 'Không học trước là thua đấy!' }], fx: 'question' },
      choices: [
        { label: 'Cho con học trước như mọi người',
          text: 'Con vào lớp Một đọc làu làu, cô khen giỏi. Nhưng cả mùa hè con không được chơi, ngồi vào bàn học là khóc.',
          effects: { money: -9000000, happy: -2, rel: { child: -5 }, flag: 's_nuoi_lop1' },
          scene: { anim: 'study', fx: 'sweat' } },
        { label: 'Để con chơi hết hè, vào lớp mới học',
          outcomes: [
            { p: 0.6, text: 'Tháng đầu con theo hơi chậm, nhưng hào hứng đi học vì cái gì cũng mới. Đến giữa năm con đã đọc trơn như các bạn.',
              effects: { happy: 4, rel: { child: 8 }, flag: 's_nuoi_lop1' },
              scene: { anim: 'cheer', fx: 'sparkle' } },
            { p: 0.4, text: 'Cô giáo nhắn: “Cháu theo không kịp lớp, gia đình kèm thêm nhé.” Tối nào bạn cũng ngồi kèm con đến 9 giờ.',
              effects: { happy: -4, health: -2, flag: 's_nuoi_lop1' },
              scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Tự dạy con mỗi tối, vừa học vừa chơi',
          text: 'Bạn biến bảng chữ cái thành trò chơi, đếm số bằng kẹo. Mất công, nhưng con vào lớp Một vừa biết chữ vừa thích học.',
          effects: { happy: 5, smarts: 1, rel: { child: 10 }, flag: 's_nuoi_lop1' },
          scene: { loc: 'home', anim: 'talk', fx: 'idea' } }
      ]
    },
    {
      id: 's_nuoi_bat_nat', title: 'Con bị bắt nạt', icon: '🥺', age: [25, 65], weight: 1.2,
      req: { cond: kidAge(7, 13), notFlag: 's_nuoi_batnat' },
      text: 'Con đi học về, áo rách một mảng, cặp sách bị vẽ bậy, cứ lủi thủi vào phòng. Gặng mãi con mới kể: mấy bạn cùng lớp chặn đường trêu chọc, giật đồ của con suốt cả tháng nay.',
      scene: { loc: 'home', time: 'dusk', anim: 'sad', npcs: [{ role: 'kid', anim: 'cry' }], fx: 'tears' },
      choices: [
        { label: 'Gặp cô chủ nhiệm và phụ huynh các bạn kia',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Buổi gặp được nhà trường xử lý nghiêm túc, các bạn kia xin lỗi con trước lớp. Con lại vui vẻ đến trường.',
              effects: { happy: 6, karma: 3, rel: { child: 10 }, flag: 's_nuoi_batnat' },
              scene: { loc: 'school', anim: 'talk', fx: 'sparkle', npcs: [{ role: 'teacher', anim: 'nod' }] } },
            { text: 'Phụ huynh bên kia gạt đi: “Trẻ con đùa nhau thôi.” Nhà trường chỉ nhắc nhở chiếu lệ. Bạn tính chuyện xin chuyển lớp cho con.',
              effects: { happy: -5, flag: 's_nuoi_batnat' },
              scene: { loc: 'school', anim: 'angry', fx: 'anger' } }
          ] },
        { label: 'Cho con đi học võ để tự tin hơn',
          text: 'Con đi học võ ba buổi một tuần. Không phải để đánh ai, mà để biết đứng thẳng lưng. Vài tháng sau, chẳng ai dám trêu con nữa.',
          effects: { money: -6000000, happy: 4, rel: { child: 6 }, flag: 's_nuoi_batnat' },
          scene: { loc: 'gym', anim: 'clap', fx: 'levelup' } },
        { label: 'Bảo con: “Đứa nào đánh thì đánh lại!”',
          text: 'Hôm sau con đánh nhau thật, bị mời phụ huynh, ghi vào sổ kỷ luật. Con hỏi bạn: “Bố mẹ bảo con làm thế mà?” Bạn không biết trả lời sao.',
          effects: { happy: -6, karma: -3, rel: { child: -4 }, flag: 's_nuoi_batnat' },
          scene: { loc: 'school', anim: 'facepalm', fx: 'anger' } }
      ]
    }
  );
})();
