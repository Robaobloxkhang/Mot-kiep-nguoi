/* Một Kiếp Người — events_mature.js
 * Situations for ages 40–100 (trung niên → tuổi già). Every id is prefixed 'm_'.
 * DSL: SPEC.md §5.
 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];

  // Defensive age filter for a relationship role (e.g. only teen children).
  // If the state shape is unknown, it never blocks the event.
  function roleAged(role, min, max) {
    return function (s) {
      try {
        let list = s && (s.people || s.persons || s.relations || s.family);
        if (list && !Array.isArray(list) && typeof list === 'object') list = Object.values(list);
        if (!Array.isArray(list)) return true;
        let found = false;
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          if (!p || p.role !== role || p.alive === false) continue;
          if (typeof p.age !== 'number') return true;
          found = true;
          if (p.age >= min && p.age <= max) return true;
        }
        return !found;
      } catch (e) {
        return true;
      }
    };
  }

  KN.EVENTS.push(
    // ───────────────────────────── TRUNG NIÊN ─────────────────────────────
    {
      id: 'm_midlife_crisis',
      title: 'Khủng hoảng tuổi 40',
      icon: '🏍️',
      age: [40, 47],
      text: 'Sáng nay soi gương, bạn phát hiện bụng mình đã thành "bụng bia", tóc mai lốm đốm bạc. Bốn mươi tuổi rồi mà cảm giác như chưa sống được bao nhiêu. Một tiếng nói trong đầu thì thầm: "Làm gì đó điên rồ đi!"',
      scene: { loc: 'home', time: 'dawn', weather: 'clear', anim: 'think', expr: 'sad', say: 'Mình già thật rồi sao?', npcs: [], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Mua một chiếc mô tô phân khối lớn', req: { minMoney: 150000000 },
          text: 'Bạn dắt về một con xe bóng loáng, tiếng pô rền cả hẻm. Hàng xóm nhìn bạn như nhìn người lạ, còn bạn thấy mình trẻ lại mười tuổi.',
          effects: { money: -150000000, happy: 12, asset: { add: { type: 'motorbike', name: 'Mô tô phân khối lớn', value: 150000000 } } },
          scene: { loc: 'street', time: 'day', anim: 'drive', fx: 'dust', shot: 'low' } },
        { label: 'Học đàn guitar, mơ lại giấc mơ ban nhạc',
          success: { stat: 'smarts', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Ba tháng sau bạn đàn trọn một bản tình ca. Cả nhà vỗ tay rần rần, con mèo cũng ngồi nghe.', effects: { happy: 10, smarts: 3, money: -3000000 }, scene: { anim: 'sing', expr: 'happy', fx: 'music' } },
            { text: 'Ngón tay sưng vù, dây đàn đứt hai lần. Cây guitar giờ thành giá treo áo đắt nhất nhà.', effects: { happy: -2, money: -3000000 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Bỏ việc, đi phượt xuyên Việt', req: { job: true },
          outcomes: [
            { p: 0.5, text: 'Một tháng rong ruổi từ đèo cao đến biển xanh, bạn trở về đen nhẻm nhưng thanh thản lạ. Công việc mới rồi sẽ tìm được.', effects: { job: 'fire', happy: 15, health: 3, money: -20000000 }, scene: { loc: 'countryside', time: 'day', anim: 'cheer', fx: 'sparkle', shot: 'wide' } },
            { p: 0.5, text: 'Đi được ba ngày thì đau lưng, nằm bẹp ở nhà nghỉ. Về nhà, ghế cũ ở công ty đã có người ngồi.', effects: { job: 'fire', happy: -8, health: -3, money: -8000000 }, scene: { anim: 'sick', fx: 'sweat' } }
          ] },
        { label: 'Chấp nhận, đi chạy bộ cho bớt bụng',
          text: 'Bạn mua đôi giày mới, mỗi sáng chạy ba vòng hồ. Bụng bia chưa đi đâu, nhưng tinh thần thì khá hẳn.',
          effects: { health: 6, happy: 4, money: -1200000 },
          scene: { loc: 'park', time: 'dawn', anim: 'run', fx: 'sweat' } }
      ]
    },
    {
      id: 'm_teen_rebel',
      title: 'Con tuổi nổi loạn',
      icon: '🎧',
      age: [40, 56],
      req: { has: ['child'], cond: roleAged('child', 13, 18) },
      text: '{child.K} {child} đi học về với mái tóc nhuộm xanh lè, khóa trái cửa phòng, đeo tai nghe suốt ngày. Hỏi gì cũng chỉ "Dạ", "Không", "Kệ con".',
      scene: { loc: 'home', time: 'dusk', anim: 'point', expr: 'surprised', say: 'Tóc con làm sao thế kia?',
        npcs: [{ role: 'child', anim: 'shrug', expr: 'neutral', say: 'Kệ con!' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Quát một trận, bắt nhuộm lại ngay',
          outcomes: [
            { p: 0.5, text: 'Con nhuộm lại tóc đen, nhưng giận bạn cả tháng không nói câu nào.', effects: { rel: { child: -12 }, happy: -5 }, scene: { anim: 'angry', fx: 'anger', npcAnim: { child: 'cry' } } },
            { p: 0.5, text: 'Con đóng sầm cửa, bỏ sang nhà bạn ngủ. Nửa đêm bạn chạy xe đi tìm con khắp các con hẻm.', effects: { rel: { child: -15 }, happy: -8 }, scene: { loc: 'street', time: 'night', anim: 'run', fx: 'sweat', npcAnim: { child: 'sad' } } }
          ] },
        { label: 'Ngồi xuống nghe con nói',
          success: { stat: 'karma', base: 0.45, scale: 0.4 },
          outcomes: [
            { text: 'Hóa ra con bị bạn bè trêu là "nhà quê". Hai người nói chuyện đến khuya, lần đầu tiên sau nhiều tháng.', effects: { rel: { child: 12 }, happy: 6, karma: 3 }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { child: 'hug' }, npcSay: { child: 'Con xin lỗi...' } } },
            { text: 'Con vẫn đeo tai nghe trong lúc bạn nói. Bạn thấy mình như đang tâm sự với bức tường.', effects: { rel: { child: 2 }, happy: -3 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Nhuộm tóc xanh giống con cho vui',
          text: 'Sáng hôm sau bạn đi làm với mái tóc xanh lá. Đồng nghiệp sốc, nhưng con bật cười lần đầu tiên sau mấy tháng.',
          effects: { rel: { child: 15 }, happy: 6, looks: -3 },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { child: 'laugh' }, npcSay: { child: 'Trời ơi, ngầu quá!' } } }
      ]
    },
    {
      id: 'm_child_crush',
      title: 'Con yêu sớm',
      icon: '💌',
      age: [40, 56],
      req: { has: ['child'], cond: roleAged('child', 13, 18) },
      text: 'Giặt áo cho {child}, bạn lôi ra một lá thư gấp hình trái tim, ký tên "Người ấy". Mấy tối nay con cứ ôm điện thoại cười tủm tỉm, còn điểm toán thì tụt dốc không phanh.',
      scene: { loc: 'bedroom', time: 'night', anim: 'think', expr: 'surprised', say: '"Người ấy" là ai đây ta?',
        npcs: [{ role: 'child', anim: 'phone', expr: 'love' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Tịch thu điện thoại, cấm tiệt',
          outcomes: [
            { p: 0.5, text: 'Con ngoan ngoãn nộp máy, rồi lén mượn máy của bạn cùng lớp. Bạn thắng một trận, thua cả cuộc chiến.', effects: { rel: { child: -10 }, happy: -3 }, scene: { anim: 'angry', npcAnim: { child: 'sad' } } },
            { p: 0.5, text: 'Con khóc cả đêm. Tuần sau điểm toán còn tụt sâu hơn.', effects: { rel: { child: -12 }, happy: -6 }, scene: { anim: 'sad', fx: 'tears', npcAnim: { child: 'cry' } } }
          ] },
        { label: 'Kể chuyện mối tình đầu của mình cho con nghe',
          text: 'Bạn kể chuyện ngày xưa đạp xe cọc cạch đi đưa thư tình. Con cười ngặt nghẽo, rồi tự hứa giữ điểm trên 8. Hai người có một bí mật chung.',
          effects: { rel: { child: 14 }, happy: 6 },
          scene: { anim: 'laugh', fx: 'hearts', npcAnim: { child: 'laugh' }, npcSay: { child: 'Ngày xưa mà cũng lãng mạn ghê!' } } },
        { label: 'Đọc trộm tin nhắn để "điều tra"',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: '"Người ấy" là một bạn học giỏi, lễ phép. Bạn thở phào, giả vờ như chưa biết gì.', effects: { happy: 4, karma: -3 }, scene: { anim: 'nod', fx: 'idea' } },
            { text: 'Con bắt quả tang bạn đang lướt tin nhắn. Cả tuần cửa phòng con khóa trái.', effects: { rel: { child: -18 }, happy: -5 }, scene: { anim: 'scared', fx: 'exclaim', npcAnim: { child: 'angry' }, npcSay: { child: 'Sao lại đọc trộm của con!' } } }
          ] }
      ]
    },
    {
      id: 'm_child_motorbike',
      title: 'Con đòi xe máy',
      icon: '🛵',
      age: [42, 58],
      req: { has: ['child'], cond: roleAged('child', 16, 19) },
      text: 'Mười bảy tuổi, {child} nói cả lớp ai cũng có xe máy, chỉ mình con còn đạp xe, "nhục lắm". Con năn nỉ suốt bữa cơm, mắt long lanh như hồi bé đòi kẹo.',
      scene: { loc: 'home', time: 'dusk', anim: 'eat', expr: 'neutral',
        npcs: [{ role: 'child', anim: 'talk', say: 'Mua cho con chiếc xe đi mà!' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Mua xe số mới, dặn đi cẩn thận', req: { minMoney: 30000000 },
          outcomes: [
            { p: 0.75, text: 'Con chạy xe đi học, ngày nào cũng nhắn "con tới rồi". Bạn yên tâm, con cũng chững chạc hẳn.', effects: { money: -30000000, rel: { child: 12 }, happy: 4 }, scene: { loc: 'street', time: 'day', anim: 'wave', fx: 'sparkle', npcAnim: { child: 'drive' } } },
            { p: 0.25, text: 'Tuần đầu con đã phóng nhanh, bị thổi phạt. Bạn đi nộp phạt mà muốn độn thổ.', effects: { money: -32000000, rel: { child: 6 }, happy: -6 }, scene: { loc: 'street', time: 'day', anim: 'facepalm', fx: 'sweat', npcAnim: { child: 'sad' } } }
          ] },
        { label: 'Đưa đón con thêm một năm nữa',
          text: 'Mỗi sáng hai người chung một xe, con ngồi sau càu nhàu. Nhưng nhiều năm sau, đó lại là những buổi sáng con nhớ nhất.',
          effects: { rel: { child: 4 }, happy: 3, health: -1 },
          scene: { loc: 'street', time: 'dawn', anim: 'drive', npcAnim: { child: 'shrug' } } },
        { label: 'Ra điều kiện: học kỳ này trên 8 phẩy',
          outcomes: [
            { p: 0.5, text: 'Con cày ngày cày đêm, được 8,3. Bạn giữ lời, con giữ được cả điểm số lẫn chiếc xe.', effects: { money: -30000000, rel: { child: 10 }, happy: 6 }, scene: { anim: 'clap', fx: 'confetti', npcAnim: { child: 'jump' } } },
            { p: 0.5, text: 'Con được 7,9 và lập luận "làm tròn là 8". Bạn đang suy nghĩ rất nghiêm túc.', effects: { rel: { child: -2 }, happy: 2 }, scene: { anim: 'think', fx: 'question', npcAnim: { child: 'talk' }, npcSay: { child: 'Làm tròn là 8 mà!' } } }
          ] }
      ]
    },
    {
      id: 'm_child_uni_exam',
      title: 'Mùa thi của con',
      icon: '📚',
      age: [43, 60],
      req: { has: ['child'], cond: roleAged('child', 17, 18) },
      text: 'Còn một tháng nữa là {child} thi tốt nghiệp. Cả nhà nín thở: TV tắt, bạn cắt nhậu, mâm cơm toàn món "bổ não". Con thức đến 2 giờ sáng, mắt thâm như gấu trúc.',
      scene: { loc: 'bedroom', time: 'night', anim: 'talk', say: 'Uống ly sữa rồi học tiếp con.',
        npcs: [{ role: 'child', anim: 'study', expr: 'sleepy' }], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Thuê gia sư luyện thi cấp tốc', req: { minMoney: 15000000 },
          outcomes: [
            { p: 0.6, text: 'Gia sư giỏi thật. Con đỗ nguyện vọng 1, cả họ gọi điện chúc mừng.', effects: { money: -15000000, happy: 12, rel: { child: 8 } }, scene: { anim: 'cheer', fx: 'confetti', npcAnim: { child: 'jump' } } },
            { p: 0.4, text: 'Con đỗ nguyện vọng 3, hơi buồn nhưng vẫn được đi học. Bạn bảo: "Trường nào cũng là trường."', effects: { money: -15000000, happy: 2, rel: { child: 5 } }, scene: { anim: 'hug', npcAnim: { child: 'sad' } } }
          ] },
        { label: 'Đi chùa cầu cho con',
          outcomes: [
            { p: 0.5, text: 'Bạn khấn vái từ chùa này sang chùa khác. Con đỗ, bạn tin chắc là nhờ phúc đức ông bà.', effects: { happy: 10, karma: 2, money: -500000 }, scene: { loc: 'temple', time: 'day', anim: 'pray', fx: 'sparkle' } },
            { p: 0.5, text: 'Con đỗ, điểm vừa sát nút. Bạn thề năm sau phải đi lễ tạ cho đủ.', effects: { happy: 5, money: -500000 }, scene: { loc: 'temple', time: 'day', anim: 'bow', fx: 'sweat' } }
          ] },
        { label: 'Để con tự lo, đừng tạo áp lực',
          outcomes: [
            { p: 0.7, text: 'Bạn chỉ nấu cơm và hỏi "con mệt không". Con bảo đó là điều con cần nhất. Kết quả ra, con đỗ đúng trường mình thích.', effects: { rel: { child: 12 }, happy: 8 }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { child: 'hug' } } },
            { p: 0.3, text: 'Con lơ là, trượt nguyện vọng 1, phải vào trường tư học phí cao. Bạn thở dài, mở sổ tiết kiệm.', effects: { money: -20000000, rel: { child: 4 }, happy: -4 }, scene: { anim: 'sad', npcAnim: { child: 'cry' } } }
          ] }
      ]
    },
    {
      id: 'm_reunion20',
      title: 'Họp lớp 20 năm',
      icon: '🍻',
      age: [40, 46],
      text: 'Nhóm lớp cấp ba rủ họp lớp kỷ niệm 20 năm ra trường. Người thì làm giám đốc, người đã có cháu ngoại, có đứa tóc rụng gần hết. Lớp trưởng cầm micro: "Mỗi người kể một câu về đời mình!"',
      scene: { loc: 'karaoke', time: 'night', anim: 'clap',
        npcs: [{ role: 'classmate', gender: 'm', anim: 'sing', say: 'Hai mươi năm rồi đó cả lớp ơi!' }, { role: 'crowd', anim: 'cheer' }], fx: 'music', shot: 'wide' },
      choices: [
        { label: 'Khoe thành tích, "nổ" cho oai',
          outcomes: [
            { p: 0.5, text: 'Cả lớp trầm trồ, bạn sướng rơn. Về nhà mới nhớ ra mình còn đang trả góp cái xe.', effects: { happy: 6, karma: -2 }, scene: { anim: 'laugh', fx: 'stars', npcAnim: { crowd: 'clap' } } },
            { p: 0.5, text: 'Có đứa hỏi thẳng lương thật bao nhiêu, bạn ấp úng. Cả lớp cười ồ.', effects: { happy: -5 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] },
        { label: 'Hát tặng cả lớp bài hát năm cuối cấp',
          success: { stat: 'happy', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Giọng bạn lạc mất hai nốt nhưng cả lớp vẫn hát theo, có đứa khóc. Đêm đó ai cũng thấy mình mười tám.', effects: { happy: 12 }, scene: { anim: 'sing', fx: 'music', npcAnim: { crowd: 'clap', classmate: 'cry' } } },
            { text: 'Bạn quên lời giữa chừng, đứng hình ba mươi giây. Video lan khắp nhóm lớp.', effects: { happy: -3 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] },
        { label: 'Kêu gọi góp quỹ thăm cô chủ nhiệm',
          text: 'Cô giáo cũ đang ốm. Cả lớp góp tiền mua quà đến thăm, cô cầm tay từng đứa, run run gọi đúng tên.',
          effects: { money: -2000000, karma: 8, happy: 8 },
          scene: { anim: 'bow', fx: 'hearts', npcAnim: { classmate: 'nod' } } },
        { label: 'Viện cớ đau đầu, về sớm',
          text: 'Bạn chuồn về sớm vì ngại. Nằm nhà xem ảnh nhóm lớp đến khuya, tự nhiên thấy tiếc.',
          effects: { happy: -3 },
          scene: { loc: 'home', anim: 'phone', expr: 'sad' } }
      ]
    },
    {
      id: 'm_friend_loan',
      title: 'Bạn cũ hỏi vay tiền',
      icon: '💸',
      age: [40, 72],
      req: { has: ['friend'], minMoney: 50000000 },
      text: '{friend}, người bạn thân từ thời đi học, lâu lắm mới gọi điện hẹn ra quán cà phê. Ngồi một lúc thì thở dài: làm ăn thua lỗ, cần vay {money:100000000}, "ba tháng trả đủ".',
      scene: { loc: 'cafe', time: 'day', anim: 'drink', expr: 'neutral',
        npcs: [{ role: 'friend', anim: 'sad', say: 'Giúp tớ lần này thôi...' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Cho vay đủ, tình bạn là trên hết', req: { minMoney: 100000000 },
          outcomes: [
            { p: 0.5, text: 'Đúng ba tháng sau, {friend} mang tiền đến trả, kèm một giỏ trái cây. Bạn thấy mình không nhìn lầm người.', effects: { rel: { friend: 15 }, happy: 6, karma: 5 }, scene: { anim: 'hug', fx: 'sparkle', npcAnim: { friend: 'bow' }, npcSay: { friend: 'Cảm ơn cậu, thật lòng!' } } },
            { p: 0.5, text: 'Ba tháng, rồi một năm. {friend} đổi số điện thoại. Bạn mất cả tiền lẫn bạn.', effects: { money: -100000000, rel: { friend: -40 }, happy: -12 }, scene: { anim: 'sad', fx: 'heartbreak', npcAnim: { friend: 'walk' } } }
          ] },
        { label: 'Đưa một ít, coi như cho luôn',
          text: 'Bạn đưa {money:30000000}, bảo không cần trả. {friend} rưng rưng. Mất tiền, nhưng lòng nhẹ tênh.',
          effects: { money: -30000000, rel: { friend: 12 }, karma: 8, happy: 2 },
          scene: { anim: 'nod', fx: 'hearts', npcAnim: { friend: 'cry' } } },
        { label: 'Từ chối khéo',
          text: 'Bạn bảo sổ tiết kiệm chưa đến hạn. {friend} gật đầu, nhưng những cuộc gọi sau đó thưa dần.',
          effects: { rel: { friend: -10 }, happy: -2 },
          scene: { anim: 'shrug', npcAnim: { friend: 'shrug' } } }
      ]
    },
    {
      id: 'm_young_boss',
      title: 'Sếp mới kém mười lăm tuổi',
      icon: '👔',
      age: [40, 56],
      req: { job: true },
      text: 'Công ty bổ nhiệm sếp mới cho phòng bạn: một cậu 27 tuổi, du học về, nói câu nào cũng chêm tiếng Anh. Buổi họp đầu tiên, cậu ta cười ngọt xớt rồi giao cho bạn gấp đôi việc.',
      scene: { loc: 'office', time: 'day', anim: 'type', expr: 'surprised',
        npcs: [{ role: 'boss', gender: 'm', age: 27, anim: 'point', say: 'Deadline thứ Sáu nhé, okay?' }, { role: 'coworker', anim: 'shrug' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Hợp tác, chia sẻ kinh nghiệm',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Sếp trẻ học được từ bạn cách xử lý khách khó tính. Cuối năm cậu ta tự đề xuất tăng lương cho bạn.', effects: { job: 'raise', happy: 6 }, scene: { anim: 'nod', fx: 'levelup', npcAnim: { boss: 'clap' } } },
            { text: 'Cậu ta nghe xong rồi làm ngược lại. Bạn mệt, nhưng ít ra mình đã cố.', effects: { happy: -3 }, scene: { anim: 'shrug', npcAnim: { boss: 'talk' } } }
          ] },
        { label: 'Ngấm ngầm "dằn mặt" cho biết tay',
          outcomes: [
            { p: 0.4, text: 'Dự án đầu tiên của sếp trượt. Bạn hả hê được một tuần, rồi bị chuyển xuống bộ phận kho.', effects: { karma: -8, happy: -4 }, scene: { anim: 'laugh', fx: 'smoke', npcAnim: { boss: 'angry' } } },
            { p: 0.6, text: 'Sếp biết hết. Bạn bị nhắc nhở ngay trước cả phòng.', effects: { karma: -6, happy: -8 }, scene: { anim: 'sad', fx: 'anger', npcAnim: { boss: 'angry', coworker: 'facepalm' } } }
          ] },
        { label: 'Học thêm công nghệ mới cho khỏi lạc hậu',
          text: 'Bạn đăng ký khóa học online buổi tối, mắt cay xè nhưng dần dần thạo mấy phần mềm mới. Sếp trẻ bắt đầu hỏi ý kiến bạn.',
          effects: { smarts: 6, happy: 3, money: -3000000 },
          scene: { anim: 'type', fx: 'idea', npcAnim: { boss: 'nod' } } }
      ]
    },
    {
      id: 'm_early_layoff',
      title: 'Nghỉ việc sớm',
      icon: '📦',
      age: [46, 58],
      weight: 0.8,
      req: { job: true },
      text: 'Công ty "tái cấu trúc". Phòng nhân sự mời bạn vào, đẩy tới một tờ giấy: nghỉ việc sớm, nhận {money:120000000} hỗ trợ. Mười mấy năm gắn bó gói gọn trong một thùng các-tông.',
      scene: { loc: 'office', time: 'day', anim: 'think', expr: 'sad',
        npcs: [{ role: 'boss', anim: 'talk', say: 'Công ty rất tiếc...' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Ký, cầm tiền làm lại từ đầu',
          text: 'Bạn ký, ôm thùng đồ ra về. Tối đó nằm nhìn trần nhà mãi, nhưng sáng hôm sau đã bắt đầu tính chuyện mới.',
          effects: { money: 120000000, job: 'fire', happy: -8 },
          scene: { loc: 'street', time: 'dusk', anim: 'walk', expr: 'sad', fx: 'tears' } },
        { label: 'Lấy tiền đền bù mở quán cà phê',
          outcomes: [
            { p: 0.45, text: 'Quán nhỏ đầu hẻm đông khách, bạn bận rộn mà vui. Ai bảo bốn mươi mấy tuổi là hết thời?', effects: { money: 20000000, job: { hire: 'kinhdoanh' }, happy: 10 }, scene: { loc: 'cafe', anim: 'cheer', fx: 'money' } },
            { p: 0.55, text: 'Quán vắng hoe, sáu tháng sau phải sang nhượng. Tiền đền bù bay gần hết.', effects: { money: 20000000, job: 'fire', happy: -12 }, scene: { loc: 'cafe', anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Xin ở lại, chấp nhận giảm lương',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Sếp đồng ý giữ bạn lại, lương giảm 30%. Ít tiền hơn, nhưng vẫn còn chỗ đứng.', effects: { happy: -4 }, scene: { anim: 'bow', npcAnim: { boss: 'nod' } } },
            { text: 'Không có ngoại lệ. Bạn vẫn phải nghỉ, và mất thêm chút tự trọng.', effects: { money: 120000000, job: 'fire', happy: -12 }, scene: { anim: 'cry', fx: 'tears', npcAnim: { boss: 'shake' } } }
          ] }
      ]
    },
    {
      id: 'm_mother_frail',
      title: 'Mẹ già yếu',
      icon: '👵',
      age: [40, 70],
      req: { has: ['mother'] },
      text: '{mother.K} {mother} dạo này đi đứng run run, ăn ít, hay gọi nhầm tên con cháu. Bác sĩ dặn cần có người ở bên thường xuyên. Bạn nhìn lịch làm việc kín mít, rồi nhìn mái tóc mẹ đã bạc trắng.',
      scene: { loc: 'home', time: 'day', anim: 'talk', expr: 'sad',
        npcs: [{ role: 'mother', anim: 'sick', say: 'Mẹ không sao, con cứ đi làm đi.' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Đón mẹ về ở cùng',
          text: 'Nhà chật hơn, sáng nào cũng có tiếng mẹ niệm Phật. Bạn mệt hơn, nhưng tối nào cũng được ăn bát canh mẹ nêm.',
          effects: { rel: { mother: 15 }, happy: 4, money: -10000000, karma: 8 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug' } } },
        { label: 'Thuê người giúp việc chăm mẹ', req: { minMoney: 60000000 },
          outcomes: [
            { p: 0.6, text: 'Cô giúp việc chu đáo, mẹ khỏe ra trông thấy. Cuối tuần bạn về, mẹ khoe được nấu cháo ngon.', effects: { money: -60000000, rel: { mother: 6 }, happy: 3 }, scene: { anim: 'nod', fx: 'sparkle', npcAnim: { mother: 'laugh' } } },
            { p: 0.4, text: 'Người giúp việc làm hai tháng thì bỏ về quê. Mẹ lại ở một mình, giận bạn ra mặt.', effects: { money: -20000000, rel: { mother: -8 }, happy: -5 }, scene: { anim: 'facepalm', npcAnim: { mother: 'sad' } } }
          ] },
        { label: 'Gửi anh chị em lo, mình gửi tiền',
          text: 'Bạn chuyển tiền đều đặn mỗi tháng, gọi điện mỗi tối. Mẹ nói "con bận thì thôi", nhưng giọng buồn buồn.',
          effects: { money: -30000000, rel: { mother: -5 }, karma: -2, happy: -3 },
          scene: { anim: 'phone', expr: 'sad', npcAnim: { mother: 'sad' } } }
      ]
    },
    {
      id: 'm_father_hospital',
      title: 'Bố nhập viện',
      icon: '🏥',
      age: [40, 72],
      req: { has: ['father'] },
      text: 'Nửa đêm điện thoại réo: {father.K} {father} lên cơn đau ngực, đang ở phòng cấp cứu. Bạn phóng xe đi trong đêm, đầu óc trống rỗng.',
      scene: { loc: 'hospital', time: 'night', anim: 'scared', expr: 'scared',
        npcs: [{ role: 'father', anim: 'sick', expr: 'sick' }, { role: 'doctor', anim: 'talk', say: 'Cần đặt stent sớm, gia đình quyết nhé.' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Chọn phương án tốt nhất, bao nhiêu cũng chịu', req: { minMoney: 150000000 },
          text: 'Ca can thiệp thành công. Bố tỉnh dậy, câu đầu tiên là hỏi tốn bao nhiêu tiền.',
          effects: { money: -150000000, rel: { father: 15 }, happy: 8, karma: 5 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { father: 'talk' }, npcSay: { father: 'Hết bao nhiêu tiền thế con?' } } },
        { label: 'Thức trắng túc trực bên giường bố',
          text: 'Ba đêm liền bạn ngồi ghế nhựa cạnh giường. Bố khỏe dần, nắm tay bạn kể chuyện hồi bạn còn bé tí.',
          effects: { health: -5, rel: { father: 18 }, happy: 4, money: -20000000 },
          scene: { anim: 'sit', fx: 'zzz', npcAnim: { father: 'talk' } } },
        { label: 'Gọi anh chị em họp bàn chia tiền viện phí',
          outcomes: [
            { p: 0.5, text: 'Mọi người góp đủ, thay phiên nhau trực. Bố bảo nhà mình thế là có phúc.', effects: { money: -40000000, rel: { father: 8 }, happy: 4 }, scene: { anim: 'nod', fx: 'hearts' } },
            { p: 0.5, text: 'Cuộc họp biến thành cãi vã ai góp nhiều ai góp ít ngay hành lang bệnh viện. Bố nghe thấy hết.', effects: { money: -60000000, rel: { father: -6 }, happy: -8 }, scene: { anim: 'angry', fx: 'anger', npcAnim: { father: 'sad' } } }
          ] }
      ]
    },
    {
      id: 'm_land_dispute',
      title: 'Mảnh đất hương hỏa',
      icon: '📜',
      age: [45, 75],
      req: { has: ['sibling'] },
      text: 'Mảnh đất ông bà để lại ở quê bỗng lên giá vì có đường mới mở. {sibling.K} {sibling} gọi cả nhà về họp, tuyên bố mình giữ bàn thờ nên phải được phần hơn. Mâm cơm lạnh tanh.',
      scene: { loc: 'countryside', time: 'day', anim: 'think', expr: 'angry',
        npcs: [{ role: 'sibling', anim: 'point', say: 'Ai thờ cúng thì người đó hưởng!' }, { role: 'relative', gender: 'm', age: 75, anim: 'shake', say: 'Thôi, anh em cả mà...' }], fx: 'anger', shot: 'wide' },
      choices: [
        { label: 'Nhường cho {sibling.k}, giữ tình anh em',
          text: 'Bạn ký giấy nhường phần. Người nhà tiếc đứt ruột, nhưng Tết năm ấy cả nhà vẫn ngồi chung một mâm.',
          effects: { karma: 12, rel: { sibling: 15 }, happy: -2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { sibling: 'hug', relative: 'clap' } } },
        { label: 'Kiện ra tòa đòi chia đều',
          outcomes: [
            { p: 0.5, text: 'Sau hai năm đi tòa, bạn được chia đúng phần, trừ tiền luật sư còn {money:300000000}. Nhưng {sibling.k} không bao giờ nhìn mặt bạn nữa.', effects: { money: 300000000, rel: { sibling: -40 }, happy: -5, karma: -3 }, scene: { anim: 'shrug', fx: 'money', npcAnim: { sibling: 'angry' } } },
            { p: 0.5, text: 'Hồ sơ đất lằng nhằng, tòa trả về. Bạn mất {money:50000000} tiền luật sư và một người thân.', effects: { money: -50000000, rel: { sibling: -35 }, happy: -10 }, scene: { anim: 'facepalm', fx: 'heartbreak', npcAnim: { sibling: 'angry' } } }
          ] },
        { label: 'Đề xuất bán đất, chia đều, lập quỹ giỗ chung',
          success: { stat: 'smarts', base: 0.35, scale: 0.45 },
          outcomes: [
            { text: 'Ai cũng thấy hợp lý. Đất bán được giá, mỗi người một phần, quỹ giỗ đủ cúng lễ cả chục năm.', effects: { money: 400000000, rel: { sibling: 5 }, happy: 8, karma: 4 }, scene: { anim: 'clap', fx: 'money', npcAnim: { sibling: 'nod', relative: 'clap' } } },
            { text: 'Ai cũng nghi người kia ăn chênh lệch. Đất chưa bán mà tình anh em đã sứt mẻ.', effects: { rel: { sibling: -15 }, happy: -6 }, scene: { anim: 'sad', fx: 'anger', npcAnim: { sibling: 'shake' } } }
          ] }
      ]
    },
    {
      id: 'm_health_check',
      title: 'Khám sức khỏe định kỳ',
      icon: '🩺',
      age: [40, 62],
      once: false,
      cooldown: 6,
      text: 'Đợt khám sức khỏe định kỳ, bác sĩ cầm tờ kết quả nhíu mày: mỡ máu cao, huyết áp 150, men gan "hơi nhỉnh". Lời dặn quen thuộc: bớt nhậu, bớt mặn, chịu khó vận động.',
      scene: { loc: 'hospital', time: 'day', anim: 'think', expr: 'scared',
        npcs: [{ role: 'doctor', gender: 'f', anim: 'point', say: 'Mỡ máu cao rồi, bớt nhậu đi nhé!' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Bỏ nhậu, ăn rau, đi bộ mỗi tối',
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Sáu tháng sau tái khám, chỉ số đẹp như sách giáo khoa. Bạn tự thưởng một bát phở... không hành mỡ.', effects: { health: 10, happy: 5 }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { doctor: 'clap' } } },
            { text: 'Được ba tuần thì bạn bè rủ "một ly thôi". Một ly thành một thùng, huyết áp lại vọt lên.', effects: { health: -4, happy: 2, illness: 'Cao huyết áp' }, scene: { loc: 'street', time: 'night', anim: 'drink', fx: 'sweat' } }
          ] },
        { label: 'Uống thuốc là được, nhậu vẫn nhậu',
          text: 'Bạn uống thuốc đều, bia cũng đều. Huyết áp lúc lên lúc xuống như giá vàng.',
          effects: { health: -6, happy: 3, illness: 'Cao huyết áp' },
          scene: { loc: 'street', time: 'night', anim: 'drink', fx: 'sweat' } },
        { label: 'Bỏ ngoài tai, chắc máy đo sai',
          text: 'Bạn vo tờ kết quả nhét túi quần. Tối đó nó bị giặt cùng cái quần, như chưa từng tồn tại.',
          effects: { health: -8, happy: 1, illness: 'Mỡ máu cao' },
          scene: { anim: 'shrug', npcAnim: { doctor: 'facepalm' } } }
      ]
    },
    {
      id: 'm_buy_hometown_land',
      title: 'Mua đất về quê',
      icon: '🌾',
      age: [45, 66],
      req: { minMoney: 800000000 },
      text: 'Một người họ hàng gọi lên: ở quê có mảnh vườn 500 m² cạnh sông, giá {money:800000000}. Bạn nhắm mắt là thấy cảnh về già ngồi hiên nhà, nuôi gà, trồng rau, nghe ếch kêu.',
      scene: { loc: 'countryside', time: 'dusk', anim: 'think', expr: 'love',
        npcs: [{ role: 'relative', gender: 'm', age: 60, anim: 'point', say: 'Đất này vài năm nữa lên gấp ba!' }], fx: 'idea', shot: 'wide' },
      choices: [
        { label: 'Chốt luôn, xuống cọc',
          outcomes: [
            { p: 0.6, text: 'Bạn ra sổ đỏ đàng hoàng. Mấy năm sau đường liên xã mở, đất lên giá, bạn cười tủm tỉm.', effects: { money: -800000000, asset: { add: { type: 'land', name: 'Vườn ven sông ở quê', value: 1200000000 } }, happy: 12 }, scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.4, text: 'Mua xong mới biết nửa mảnh đất nằm trong quy hoạch hành lang sông. Sổ đỏ chỉ ghi được 200 m².', effects: { money: -800000000, asset: { add: { type: 'land', name: 'Mảnh vườn dính quy hoạch', value: 350000000 } }, happy: -10 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'shrug' } } }
          ] },
        { label: 'Về tận nơi kiểm tra giấy tờ đã',
          text: 'Bạn ra xã tra quy hoạch, thuê người đo đạc lại. Đất sạch, thương lượng còn {money:700000000}.',
          effects: { money: -700000000, asset: { add: { type: 'land', name: 'Vườn ven sông ở quê', value: 900000000 } }, happy: 8, smarts: 2 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { relative: 'bow' } } },
        { label: 'Thôi, cứ để tiền gửi tiết kiệm',
          text: 'Bạn gửi tiết kiệm, lãi đều đều. Thỉnh thoảng nhìn ảnh mảnh vườn, vẫn thấy hơi tiếc.',
          effects: { money: 40000000, happy: -1 },
          scene: { anim: 'shrug', npcAnim: { relative: 'shake' } } }
      ]
    },
    {
      id: 'm_anniversary20',
      title: 'Hai mươi năm ngày cưới',
      icon: '💍',
      age: [42, 62],
      req: { married: true },
      text: 'Hôm nay tròn 20 năm ngày cưới. Sáng ra {spouse.k} bạn vẫn đi chợ, nấu cơm như mọi ngày, chẳng nhắc gì. Nhưng bạn bắt gặp {spouse.k} lén mở album ảnh cưới cũ, cười một mình.',
      scene: { loc: 'home', time: 'day', anim: 'think',
        npcs: [{ role: 'spouse', anim: 'sit', expr: 'love' }], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Bày bữa tối nến, tặng hoa bất ngờ',
          text: 'Bạn bày bàn nến, ôm bó hoa hồng to bằng cái thúng. {spouse.K} bạn mắng "phí tiền" mà mắt đỏ hoe.',
          effects: { money: -3000000, rel: { spouse: 15 }, happy: 10 },
          scene: { time: 'night', anim: 'love', fx: 'hearts', npcAnim: { spouse: 'love' } } },
        { label: 'Đi Đà Lạt như hồi trăng mật', req: { minMoney: 20000000 },
          text: 'Hai người ngồi đúng chiếc ghế đá bên hồ năm xưa, ăn bánh tráng nướng, cãi nhau xem ai tỏ tình trước.',
          effects: { money: -15000000, rel: { spouse: 18 }, happy: 14 },
          scene: { loc: 'park', time: 'dusk', weather: 'fog', anim: 'laugh', fx: 'petals', npcAnim: { spouse: 'laugh' } } },
        { label: 'Quên béng, đi nhậu với bạn',
          text: 'Bạn về lúc 11 giờ đêm, thấy mâm cơm úp lồng bàn và một chiếc bánh kem đã chảy. Cả tuần nhà lạnh như tủ đá.',
          effects: { rel: { spouse: -20 }, happy: -10, karma: -3 },
          scene: { time: 'night', anim: 'facepalm', fx: 'anger', npcAnim: { spouse: 'angry' }, npcSay: { spouse: 'Hai mươi năm đấy!' } } },
        { label: 'Viết một lá thư tay',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Ba trang giấy, nét chữ run run. {spouse.K} bạn đọc xong ôm bạn khóc như đứa trẻ.', effects: { rel: { spouse: 20 }, happy: 10 }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { spouse: 'cry' } } },
            { text: 'Lá thư sai chính tả bốn chỗ. {spouse.K} bạn lấy bút đỏ sửa lại, rồi cười lăn.', effects: { rel: { spouse: 10 }, happy: 6 }, scene: { anim: 'laugh', npcAnim: { spouse: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 'm_in_laws',
      title: 'Gặp mặt thông gia',
      icon: '🤝',
      age: [46, 70],
      req: { has: ['child'], cond: roleAged('child', 22, 45) },
      text: '{child.K} {child} dẫn người yêu về ra mắt, tuần sau nhà bên kia sang dạm ngõ. Ông bà thông gia khen nhà bạn "giản dị" theo kiểu khiến bạn chột dạ. Chuyện cưới xin bắt đầu được bàn.',
      scene: { loc: 'home', time: 'day', anim: 'bow',
        npcs: [{ role: 'relative', gender: 'm', age: 58, anim: 'talk', say: 'Nhà mình giản dị quá nhỉ!' }, { role: 'stranger', gender: 'f', age: 56, anim: 'nod' }, { role: 'child', anim: 'idle', expr: 'scared' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Lo đám cưới thật hoành tráng', req: { minMoney: 200000000 },
          text: 'Bạn đặt hẳn trung tâm tiệc cưới 50 mâm. Thông gia gật gù hài lòng, còn bạn ngồi bấm máy tính đến sáng.',
          effects: { money: -200000000, rel: { child: 10 }, happy: 6 },
          scene: { loc: 'wedding', time: 'night', anim: 'clap', fx: 'confetti', npcAnim: { all: 'cheer' } } },
        { label: 'Đề nghị tổ chức đơn giản, ấm cúng',
          success: { stat: 'karma', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Hóa ra thông gia cũng nghĩ thế, chỉ ngại không dám nói. Hai bên bắt tay, cười xòa.', effects: { money: -60000000, rel: { child: 8 }, happy: 8, karma: 3 }, scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { relative: 'laugh', stranger: 'laugh', child: 'cheer' } } },
            { text: 'Bà thông gia mặt nặng mày nhẹ. Không khí đặc quánh, cuối cùng vẫn phải làm to.', effects: { money: -100000000, happy: -6, rel: { child: -3 } }, scene: { anim: 'sad', fx: 'sweat', npcSay: { stranger: 'Con nhà tôi cưới có một lần!' }, npcAnim: { stranger: 'angry' } } }
          ] },
        { label: 'Kể chuyện cười cho đỡ căng',
          outcomes: [
            { p: 0.5, text: 'Ông thông gia cười sặc nước trà, hóa ra cũng mê chuyện tiếu lâm. Hai nhà thân nhau từ đó.', effects: { happy: 8, rel: { child: 5 } }, scene: { anim: 'laugh', fx: 'music', npcAnim: { relative: 'laugh' } } },
            { p: 0.5, text: 'Câu chuyện cười của bạn đụng trúng... nghề của ông thông gia. Im lặng kéo dài mười giây.', effects: { happy: -5 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'angry', child: 'facepalm' } } }
          ] }
      ]
    },
    {
      id: 'm_gray_hair',
      title: 'Tóc bạc',
      icon: '🪞',
      age: [40, 50],
      text: 'Đứng trước gương dưới ánh đèn, bạn phát hiện không phải một mà cả chục sợi tóc bạc. Sáng nay đứa bé nhà bên còn lễ phép gọi bạn là "bác". Ừ, đến lúc rồi.',
      scene: { loc: 'bedroom', time: 'dawn', anim: 'think', expr: 'surprised', say: 'Ơ... cả chục sợi!', npcs: [], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Nhổ từng sợi một',
          text: 'Bạn nhổ đến sợi thứ ba mươi thì mỏi tay. Truyền thuyết nói nhổ một sợi mọc ba sợi.',
          effects: { looks: -1, happy: -1 },
          scene: { anim: 'facepalm', fx: 'sweat' } },
        { label: 'Đi nhuộm cho trẻ trung',
          outcomes: [
            { p: 0.6, text: 'Thợ nhuộm khéo tay, bạn trẻ ra năm tuổi. Ra đường có người hỏi "năm nay bao nhiêu rồi?"', effects: { looks: 5, happy: 6, money: -600000 }, scene: { loc: 'street', anim: 'cheer', fx: 'sparkle' } },
            { p: 0.4, text: 'Thuốc lên màu đỏ cam rực như ngọn đuốc. Cả nhà nhìn bạn rồi quay đi chỗ khác cười.', effects: { looks: -3, happy: -3, money: -600000 }, scene: { loc: 'street', anim: 'facepalm', fx: 'flash' } }
          ] },
        { label: 'Để bạc tự nhiên, ra dáng chín chắn',
          text: 'Bạn để nguyên. Ở chỗ làm bỗng nhiều người hỏi ý kiến bạn hơn, như thể tóc bạc là một loại bằng cấp.',
          effects: { happy: 3, smarts: 1 },
          scene: { anim: 'nod', fx: 'stars' } }
      ]
    },
    {
      id: 'm_family_chat',
      title: 'Nhóm chat đại gia đình',
      icon: '📱',
      age: [45, 85],
      text: 'Nhóm chat họ hàng 87 thành viên reo inh ỏi từ 5 giờ sáng: ảnh hoa sen "chúc buổi sáng an lành", tin "nước chanh muối chữa bách bệnh", và một bài kêu gọi chia sẻ "kẻo mất may mắn".',
      scene: { loc: 'home', time: 'dawn', anim: 'phone', expr: 'sleepy', say: 'Mới 5 giờ sáng mà...', npcs: [], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Gửi lại ảnh hoa sen cho phải phép',
          text: 'Bạn gửi một bông sen hồng kèm "Chúc cả nhà an lành". Mười phút sau nhận về 32 bông sen khác. Hòa khí được giữ vững.',
          effects: { happy: 2, karma: 1 },
          scene: { anim: 'laugh', fx: 'petals' } },
        { label: 'Đính chính tin chữa bệnh vô căn cứ',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn giải thích nhẹ nhàng, kèm lời bác sĩ. Mấy cô chú cảm ơn, còn khen "học cao hiểu rộng".', effects: { smarts: 2, karma: 4, happy: 3 }, scene: { anim: 'nod', fx: 'idea' } },
            { text: 'Ông chú họ cho rằng bạn "dạy đời", rời nhóm trong phẫn nộ. Cả họ nhắn riêng hỏi có chuyện gì.', effects: { happy: -4, karma: 2 }, scene: { anim: 'facepalm', fx: 'anger' } }
          ] },
        { label: 'Tắt thông báo, ngủ tiếp',
          text: 'Bạn có giấc ngủ ngon nhất tháng. Tuần sau mới biết mình lỡ mất lời mời ăn giỗ.',
          effects: { happy: 3, health: 1 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_side_hustle',
      title: 'Bán hàng online buổi tối',
      icon: '🛍️',
      age: [40, 60],
      text: 'Lương tháng chỉ vừa đủ tiêu, bạn quyết định bán thêm đặc sản quê nhà qua mạng: mắm tép, hạt điều, khô cá. Tối nào cũng livestream đến khuya, câu "bà con cô bác ơi" luyện đến khàn giọng.',
      scene: { loc: 'home', time: 'night', anim: 'phone', say: 'Chốt đơn nha cả nhà ơi!', npcs: [], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Làm nghiêm túc, nhập thêm hàng',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Khách quen kéo đến, tháng nào cũng lãi thêm vài triệu. Hũ mắm tép của bạn có cả khách ở nước ngoài.', effects: { money: 30000000, happy: 8, smarts: 2 }, scene: { anim: 'cheer', fx: 'money' } },
            { text: 'Hàng tồn chất đầy góc nhà, mùi khô cá ám cả tháng.', effects: { money: -15000000, happy: -6 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Bán lai rai cho vui',
          text: 'Bạn bán cho người quen, thu về vài triệu và vô số lời khen "mắm ngon".',
          effects: { money: 5000000, happy: 4 },
          scene: { anim: 'laugh', fx: 'money' } },
        { label: 'Thôi, đi ngủ sớm cho khỏe',
          text: 'Bạn tắt điện thoại lúc 10 giờ, ngủ một giấc ngon lành. Tiền không thêm nhưng mắt bớt thâm.',
          effects: { health: 3, happy: 2 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_wedding_season',
      title: 'Mùa cưới',
      icon: '💒',
      age: [40, 78],
      weight: 1.2,
      once: false,
      cooldown: 3,
      text: 'Tháng này bạn nhận liền năm tấm thiệp đỏ: con đồng nghiệp, cháu họ xa, con hàng xóm, và một người... bạn không nhớ là ai. Phong bì xếp hàng trong ví như chờ duyệt binh.',
      scene: { loc: 'wedding', time: 'night', anim: 'clap',
        npcs: [{ role: 'crowd', anim: 'cheer' }, { role: 'stranger', age: 30, anim: 'bow', say: 'Cảm ơn bác đã đến chung vui!' }], fx: 'confetti', shot: 'wide' },
      choices: [
        { label: 'Đi đủ cả năm đám',
          text: 'Bạn ăn năm mâm cỗ trong ba tuần, mặc mãi một bộ đồ. Ví mỏng hẳn, nhưng ai cũng quý.',
          effects: { money: -2500000, happy: 2, karma: 3, health: -1 },
          scene: { anim: 'eat', fx: 'confetti' } },
        { label: 'Gửi phong bì nhờ người cầm hộ',
          text: 'Bạn gửi tiền mừng qua đồng nghiệp, ở nhà xem phim. Tiết kiệm được năm buổi tối quý giá.',
          effects: { money: -1500000, happy: 3 },
          scene: { loc: 'home', anim: 'sit', fx: 'zzz' } },
        { label: 'Đi cả đám "người lạ" để xem là ai',
          outcomes: [
            { p: 0.5, text: 'Hóa ra đó là con của bạn học cũ thời cấp hai. Hai người nhận ra nhau, ôm nhau cười chảy nước mắt.', effects: { money: -500000, happy: 8 }, scene: { anim: 'hug', fx: 'sparkle', npcAnim: { stranger: 'hug' } } },
            { p: 0.5, text: 'Bạn ngồi nhầm bàn nhà gái trong khi thiệp là nhà trai. Cả bàn quay sang hỏi bạn là người bên nào.', effects: { money: -500000, happy: -2 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { crowd: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 'm_insurance_relative',
      title: 'Người quen bán bảo hiểm',
      icon: '📋',
      age: [40, 62],
      text: 'Cô em họ lâu không gặp bỗng nhắn tin hỏi thăm rất ân cần, rủ đi cà phê. Ly cà phê chưa tan đá, tập hồ sơ bảo hiểm nhân thọ dày cộp đã nằm trên bàn.',
      scene: { loc: 'cafe', time: 'day', anim: 'drink',
        npcs: [{ role: 'relative', gender: 'f', age: 30, anim: 'talk', say: 'Giúp em đạt chỉ tiêu tháng này nha!' }], fx: 'sweat', shot: 'close' },
      choices: [
        { label: 'Đọc kỹ, mua một gói vừa túi tiền',
          text: 'Bạn đọc từng điều khoản, chọn gói vừa sức. Mỗi năm đóng phí hơi xót, nhưng ngủ ngon hơn.',
          effects: { money: -18000000, happy: 2, karma: 2, flag: 'm_insured' },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { relative: 'cheer' } } },
        { label: 'Ký luôn cho em vui, khỏi đọc',
          outcomes: [
            { p: 0.5, text: 'Hợp đồng ổn, chỉ là phí cao gấp đôi bạn tưởng.', effects: { money: -36000000, happy: -2 }, scene: { anim: 'shrug', fx: 'money' } },
            { p: 0.5, text: 'Hai năm sau mới biết gói bạn mua chủ yếu là... đầu tư, bảo hiểm chẳng bao nhiêu.', effects: { money: -40000000, happy: -6, smarts: 1 }, scene: { anim: 'facepalm', fx: 'sweat' } }
          ] },
        { label: 'Từ chối thẳng',
          text: 'Bạn nói thật là chưa có nhu cầu. Cô em cười gượng. Từ đó nhóm họ hàng bớt đi một người hay nhắn hỏi thăm.',
          effects: { happy: 1 },
          scene: { anim: 'shrug', npcAnim: { relative: 'sad' } } }
      ]
    },
    {
      id: 'm_parent_meeting',
      title: 'Họp phụ huynh',
      icon: '🏫',
      age: [40, 54],
      req: { has: ['child'], cond: roleAged('child', 10, 17) },
      text: 'Buổi họp phụ huynh cuối kỳ, cô {teacher} đọc tên những học sinh "cần lưu ý". Tên {child} vang lên đầu tiên: ngủ gật trong giờ, quên vở, và vẽ chân dung cô lên bảng... rất giống.',
      scene: { loc: 'school', time: 'day', anim: 'sit', expr: 'surprised',
        npcs: [{ role: 'teacher', gender: 'f', anim: 'point', say: 'Phụ huynh em {child} ở lại nhé!' }, { role: 'crowd', anim: 'sit' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Ở lại xin lỗi cô, hứa kèm con',
          text: 'Cô {teacher} dịu giọng, còn khen con vẽ có năng khiếu. Về nhà, thay vì mắng, bạn đăng ký cho con một lớp vẽ.',
          effects: { rel: { child: 8 }, happy: 4, money: -2000000 },
          scene: { anim: 'bow', fx: 'idea', npcAnim: { teacher: 'nod' } } },
        { label: 'Về nhà mắng con một trận',
          text: 'Con cúi đầu nghe hết rồi lẳng lặng vào phòng. Tối đó bạn thấy một bức chân dung mới: chính bạn, rất giống, với hai cái sừng.',
          effects: { rel: { child: -8 }, happy: -3 },
          scene: { loc: 'home', time: 'night', anim: 'angry', fx: 'anger' } },
        { label: 'Cười phá lên vì bức tranh giống thật',
          text: 'Cả phòng phụ huynh cười theo, cô {teacher} cũng không nhịn được. Không khí nhẹ hẳn, nhưng bạn vẫn bị giao nhiệm vụ kèm con.',
          effects: { happy: 5, rel: { child: 4 } },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { teacher: 'laugh', crowd: 'laugh' } } }
      ]
    },
    {
      id: 'm_spouse_snore',
      title: 'Tiếng ngáy như sấm',
      icon: '😴',
      age: [45, 88],
      req: { married: true },
      text: 'Mấy năm gần đây {spouse.k} bạn ngáy to đến mức con mèo nhà bên cũng giật mình. Đêm nay tiếng ngáy đạt đỉnh mới, chiếc quạt trần như rung theo nhịp.',
      scene: { loc: 'bedroom', time: 'night', anim: 'think', expr: 'sleepy', say: 'Trời ơi, ai ngủ nổi...',
        npcs: [{ role: 'spouse', anim: 'sleep' }], fx: 'zzz', shot: 'top' },
      choices: [
        { label: 'Thu âm lại làm bằng chứng',
          text: 'Sáng ra bạn bật bản ghi âm. {spouse.K} bạn chối đây đẩy, rồi bò ra cười. Cả nhà góp tiền mua cho {spouse.k} cái gối chống ngáy.',
          effects: { happy: 6, rel: { spouse: 6 }, money: -400000 },
          scene: { time: 'day', loc: 'home', anim: 'laugh', fx: 'music', npcAnim: { spouse: 'laugh' } } },
        { label: 'Ôm gối ra phòng khách ngủ',
          text: 'Bộ ghế gỗ cứng như phản, muỗi đốt tơi bời. Sáng ra lưng đau ê ẩm.',
          effects: { health: -2, happy: -3 },
          scene: { loc: 'home', anim: 'sleep', fx: 'zzz' } },
        { label: 'Đưa {spouse.k} đi khám',
          outcomes: [
            { p: 0.6, text: 'Bác sĩ phát hiện viêm xoang, điều trị xong {spouse.k} bạn hết ngáy. Cả hai ngủ ngon như thời trăng mật.', effects: { money: -3000000, rel: { spouse: 10 }, happy: 6, health: 2 }, scene: { loc: 'hospital', time: 'day', anim: 'nod', fx: 'sparkle', npcAnim: { spouse: 'cheer' } } },
            { p: 0.4, text: 'Bác sĩ bảo nguyên nhân là... thừa cân. {spouse.K} bạn giận vì bị "chê béo" cả tuần.', effects: { money: -500000, rel: { spouse: -5 }, happy: -2 }, scene: { loc: 'hospital', time: 'day', anim: 'shrug', fx: 'anger', npcAnim: { spouse: 'angry' } } }
          ] }
      ]
    },
    {
      id: 'm_badminton_club',
      title: 'Hội cầu lông 5 giờ sáng',
      icon: '🏸',
      age: [40, 66],
      text: 'Ông hàng xóm rủ bạn vào hội cầu lông 5 giờ sáng ở công viên. Trong hội toàn cao thủ U60, đập cầu như trời giáng, và có một luật bất thành văn: thua thì bao cà phê.',
      scene: { loc: 'park', time: 'dawn', anim: 'jump',
        npcs: [{ role: 'neighbor', gender: 'm', age: 62, anim: 'jump', say: 'Đỡ này! Thua bao cà phê nhé!' }, { role: 'crowd', anim: 'clap' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Vào hội, tập nghiêm túc',
          success: { stat: 'health', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Ba tháng sau bạn thắng được ông hàng xóm một séc. Cân nặng giảm 4 kg, hội có thêm thành viên trung thành.', effects: { health: 8, happy: 8 }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { neighbor: 'clap' } } },
            { text: 'Buổi thứ hai bạn trẹo cổ chân, tập tễnh cả tháng. Tiền cà phê thì đã bao năm lần.', effects: { health: -4, money: -300000, happy: -3 }, scene: { anim: 'fall', fx: 'stars', npcAnim: { neighbor: 'scared' } } }
          ] },
        { label: 'Chỉ đến ngồi xem và tám chuyện',
          text: 'Bạn thành "bình luận viên" của hội, chuyện gì trong phường cũng biết. Cầu thì chưa đánh trái nào.',
          effects: { happy: 5 },
          scene: { anim: 'laugh', npcAnim: { crowd: 'laugh' } } },
        { label: 'Từ chối, 5 giờ sáng là giờ để ngủ',
          text: 'Bạn ngủ tiếp. Ông hàng xóm từ đó gọi bạn là "thanh niên lười".',
          effects: { happy: 1, health: -1 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_child_work_abroad',
      title: 'Con đi làm nước ngoài',
      icon: '🛫',
      age: [46, 68],
      weight: 0.7,
      req: { has: ['child'], notFlag: 'm_child_abroad', cond: roleAged('child', 20, 35) },
      text: '{child} được nhận làm kỹ sư ở Nhật, hợp đồng năm năm. Tối trước ngày bay, con ngồi xếp đồ, còn bạn cứ đi ra đi vào nhét thêm gói mắm, gói chè, vỉ thuốc cảm.',
      scene: { loc: 'home', time: 'night', anim: 'talk', say: 'Mang thêm gói mắm này nữa con!',
        npcs: [{ role: 'child', anim: 'laugh', say: 'Vali hết chỗ rồi mà!' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Dặn dò con cả đêm',
          text: 'Bạn dặn từ chuyện ăn uống đến chuyện giữ ấm. Ở sân bay, con ôm bạn lâu thật lâu.',
          effects: { rel: { child: 10 }, happy: -2, flag: 'm_child_abroad' },
          scene: { anim: 'hug', fx: 'tears', npcAnim: { child: 'hug' } } },
        { label: 'Vui vẻ tiễn con, về nhà mới khóc',
          text: 'Bạn cười suốt buổi tiễn. Về nhà, mở tủ lạnh thấy hộp sữa chua con để quên, bạn ngồi khóc ngon lành.',
          effects: { happy: -5, rel: { child: 6 }, flag: 'm_child_abroad' },
          scene: { anim: 'cry', fx: 'tears', npcAnim: { child: 'wave' } } },
        { label: 'Giao nhiệm vụ: Tết nào cũng gửi quà về',
          text: 'Con cười, hứa sẽ gửi. Tết năm sau, một thùng quà to bằng cái tủ lạnh về tới nhà.',
          effects: { happy: 4, rel: { child: 8 }, money: 5000000, flag: 'm_child_abroad' },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { child: 'laugh' } } }
      ]
    },
    {
      id: 'm_noisy_neighbor',
      title: 'Hàng xóm hát karaoke',
      icon: '🎤',
      age: [40, 92],
      once: false,
      cooldown: 5,
      text: 'Nhà bên mới sắm dàn loa kéo, tối nào cũng mở nhạc hết công suất đến 11 giờ đêm. Kính cửa nhà bạn rung bần bật theo từng nốt luyến láy.',
      scene: { loc: 'street', time: 'night', anim: 'think', expr: 'angry',
        npcs: [{ role: 'neighbor', gender: 'm', age: 50, anim: 'sing', say: 'Một hai ba... dô! Hát tiếp nàooo!' }], fx: 'music', shot: 'wide' },
      choices: [
        { label: 'Sang gõ cửa nói chuyện nhẹ nhàng',
          success: { stat: 'karma', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Ông hàng xóm gãi đầu xin lỗi, hứa chỉ hát đến 9 giờ. Hôm sau còn mang sang biếu bạn đĩa xôi.', effects: { happy: 5, karma: 3 }, scene: { anim: 'talk', fx: 'sparkle', npcAnim: { neighbor: 'bow' } } },
            { text: 'Ông ấy bảo "nhà tôi, tôi hát". Hai nhà từ đó không chào nhau.', effects: { happy: -5 }, scene: { anim: 'angry', fx: 'anger', npcAnim: { neighbor: 'angry' } } }
          ] },
        { label: 'Mang loa nhà mình ra "đấu" lại',
          text: 'Hai nhà hát đối đáp đến nửa đêm. Tổ dân phố lên nhắc nhở cả hai, ai cũng bị phạt.',
          effects: { money: -1000000, happy: 3, karma: -3 },
          scene: { anim: 'sing', fx: 'music', npcAnim: { neighbor: 'sing' } } },
        { label: 'Sang song ca luôn cho vui',
          outcomes: [
            { p: 0.6, text: 'Bạn cầm micro song ca một bài, cả xóm vỗ tay. Từ đó bạn là "ca sĩ khách mời" thường trực.', effects: { happy: 8 }, scene: { anim: 'sing', fx: 'music', npcAnim: { neighbor: 'clap' } } },
            { p: 0.4, text: 'Bạn hát xong, ông hàng xóm lặng lẽ tắt loa. Hóa ra giọng bạn còn đáng sợ hơn.', effects: { happy: 3 }, scene: { anim: 'shrug', fx: 'sweat', npcAnim: { neighbor: 'facepalm' } } }
          ] },
        { label: 'Đeo nút tai, chịu đựng',
          text: 'Bạn mua nút tai chống ồn. Ngủ được, nhưng sáng hôm sau không nghe thấy chuông báo thức.',
          effects: { happy: -2, health: -1 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_storm',
      title: 'Bão về',
      icon: '🌀',
      age: [40, 100],
      once: false,
      cooldown: 6,
      text: 'Đài báo bão lớn đổ bộ đêm nay. Gió rít qua khe cửa, mái tôn nhà bên kêu loảng xoảng, nước dưới hẻm đã dâng ngang mắt cá chân.',
      scene: { loc: 'street', time: 'night', weather: 'storm', anim: 'scared',
        npcs: [{ role: 'neighbor', gender: 'm', age: 45, anim: 'run', say: 'Chằng mái lại đi bác ơi!' }], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Chằng chống nhà cửa, kê đồ lên cao',
          text: 'Bạn với hàng xóm hì hục chằng dây, kê đồ đến 2 giờ sáng. Bão qua, nhà chỉ ướt góc bếp.',
          effects: { health: -2, happy: 3, money: -1000000 },
          scene: { anim: 'point', fx: 'sweat', npcAnim: { neighbor: 'nod' } } },
        { label: 'Mở cửa cho nhà thấp sang trú',
          text: 'Ba gia đình chen chúc trong phòng khách, nấu chung nồi mì, kể chuyện cho bọn trẻ đến sáng.',
          effects: { karma: 10, happy: 5, money: -500000 },
          scene: { loc: 'home', anim: 'cook', fx: 'steam', npcAnim: { neighbor: 'eat' } } },
        { label: 'Chạy ra quay video bão',
          outcomes: [
            { p: 0.4, text: 'Đoạn video cây đổ của bạn được đài địa phương xin phát. Bạn nổi tiếng được ba ngày.', effects: { happy: 6 }, scene: { anim: 'phone', fx: 'flash' } },
            { p: 0.6, text: 'Một cành cây bay sượt qua đầu. Bạn ướt như chuột lột, điện thoại vào nước.', effects: { health: -6, money: -5000000, happy: -4 }, scene: { anim: 'fall', fx: 'flash', npcAnim: { neighbor: 'scared' } } }
          ] }
      ]
    },
    {
      id: 'm_tet_reunion',
      title: 'Tết đoàn viên',
      icon: '🧧',
      age: [40, 100],
      weight: 1.2,
      once: false,
      cooldown: 3,
      text: 'Ba mươi Tết, cả nhà quây quần bên nồi bánh chưng sôi lục bục. Bọn trẻ chạy quanh đòi lì xì, mâm ngũ quả đã bày, ngoài ngõ ai đó đốt pháo hoa sớm.',
      scene: { loc: 'home', time: 'night', decor: 'tet', anim: 'clap',
        npcs: [{ role: 'kid', anim: 'jump', say: 'Lì xì cho cháu đi ạ!' }, { role: 'relative', anim: 'eat' }], fx: 'fireworks', shot: 'wide' },
      choices: [
        { label: 'Lì xì rộng tay cho cả họ',
          text: 'Bạn phát hết hai chục phong bao đỏ. Bọn trẻ reo hò, người lớn khen "năm nay làm ăn được nhỉ".',
          effects: { money: -5000000, happy: 8, karma: 4 },
          scene: { anim: 'cheer', fx: 'confetti', npcAnim: { kid: 'cheer' } } },
        { label: 'Ngồi canh nồi bánh chưng thâu đêm',
          text: 'Bạn ngồi bên bếp lửa, kể chuyện Tết xưa cho bọn nhỏ. Bánh chín rền, chuyện kể vẫn chưa hết.',
          effects: { happy: 7, health: -1 },
          scene: { anim: 'talk', fx: 'steam', npcAnim: { kid: 'sit' } } },
        { label: 'Đón nhận "màn thẩm vấn" đầu năm',
          outcomes: [
            { p: 0.5, text: 'Họ hàng hỏi đủ thứ: lương bao nhiêu, sao dạo này béo. Bạn hỏi lại y hệt từng câu. Cả mâm cười nghiêng ngả.', effects: { happy: 4 }, scene: { anim: 'laugh', fx: 'music', npcAnim: { relative: 'laugh' } } },
            { p: 0.5, text: 'Câu hỏi nào cũng trúng chỗ đau. Mới mùng Một mà bạn đã mong đến mùng Bốn.', effects: { happy: -4 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { relative: 'talk' } } }
          ] }
      ]
    },
    {
      id: 'm_charity_flood',
      title: 'Hướng về miền Trung',
      icon: '🤲',
      age: [40, 95],
      once: false,
      cooldown: 4,
      text: 'TV chiếu cảnh bà con miền Trung ngồi trên mái nhà giữa biển nước. Tổ dân phố đặt thùng quyên góp ở đầu hẻm, mấy bà hàng xóm gom quần áo cũ, mì gói thành từng bao.',
      scene: { loc: 'street', time: 'day', weather: 'rain', anim: 'think', expr: 'sad',
        npcs: [{ role: 'neighbor', gender: 'f', age: 60, anim: 'talk', say: 'Góp chút gì gửi bà con không?' }], fx: 'tears', shot: 'wide' },
      choices: [
        { label: 'Ủng hộ {money:10000000}', req: { minMoney: 30000000 },
          text: 'Bạn bỏ phong bì vào thùng, không ghi tên. Đêm đó ngủ ngon lạ.',
          effects: { money: -10000000, karma: 12, happy: 6 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { neighbor: 'bow' } } },
        { label: 'Tự chở hàng ra tận vùng lũ', req: { minStat: { health: 40 } },
          outcomes: [
            { p: 0.7, text: 'Một tuần lội nước phát quà, bạn đen nhẻm và mệt rã rời. Một bà cụ nắm tay bạn mãi không buông.', effects: { money: -8000000, karma: 18, happy: 10, health: -5 }, scene: { loc: 'countryside', weather: 'rain', anim: 'hug', fx: 'hearts' } },
            { p: 0.3, text: 'Xe sa lầy giữa đường, phải nhờ người dân kéo ra. Quà vẫn đến tay bà con, còn bạn cảm cúm cả tuần.', effects: { money: -8000000, karma: 14, health: -10, happy: 3, illness: 'Cảm cúm' }, scene: { loc: 'countryside', weather: 'rain', anim: 'sick', fx: 'sick' } }
          ] },
        { label: 'Góp quần áo cũ và mì gói',
          text: 'Bạn dọn tủ, gửi đi ba bao đồ. Tủ gọn hẳn, lòng nhẹ hẳn.',
          effects: { karma: 6, happy: 3, money: -300000 },
          scene: { anim: 'nod', fx: 'hearts', npcAnim: { neighbor: 'clap' } } },
        { label: 'Bấm chia sẻ là đủ rồi',
          text: 'Bạn chia sẻ bài viết kèm dòng "thương lắm miền Trung ơi", rồi lướt sang video mèo.',
          effects: { karma: -1 },
          scene: { anim: 'phone', npcAnim: { neighbor: 'shake' } } }
      ]
    },
    {
      id: 'm_death_anniversary',
      title: 'Đám giỗ họ',
      icon: '🕯️',
      age: [45, 95],
      once: false,
      cooldown: 4,
      text: 'Giỗ cụ tổ, cả họ về đông đủ. Mâm trên bàn chuyện gia phả, dưới bếp tất bật khói lửa, bọn trẻ con chạy rông. Ông trưởng họ gọi bạn lên mâm trên vì "có việc hệ trọng".',
      scene: { loc: 'home', time: 'day', anim: 'bow',
        npcs: [{ role: 'relative', gender: 'm', age: 78, anim: 'talk', say: 'Năm sau đến lượt nhà cháu lo giỗ.' }, { role: 'crowd', anim: 'eat' }], fx: 'smoke', shot: 'wide' },
      choices: [
        { label: 'Nhận lo giỗ năm sau thật chu đáo',
          text: 'Cả họ khen nhà bạn "biết trước biết sau". Năm sau bạn tất bật cả tháng, tốn kém nhưng nở mày nở mặt.',
          effects: { money: -15000000, karma: 6, happy: 4 },
          scene: { anim: 'bow', fx: 'sparkle', npcAnim: { relative: 'nod' } } },
        { label: 'Góp tiền tu sửa nhà thờ họ', req: { minMoney: 30000000 },
          text: 'Tên bạn được ghi trên bảng công đức. Ông trưởng họ nắm tay bạn, cảm động không nói nên lời.',
          effects: { money: -20000000, karma: 8, happy: 6 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { relative: 'hug' } } },
        { label: 'Lẩn xuống bếp phụ nấu, trốn chuyện gia phả',
          text: 'Bạn đứng thái hành, nghe được đủ thứ chuyện còn hay hơn gia phả. Ông trưởng họ tìm mãi không thấy bạn đâu.',
          effects: { happy: 5 },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { crowd: 'laugh' } } }
      ]
    },
    {
      id: 'm_grave_sweeping',
      title: 'Tảo mộ tiết Thanh minh',
      icon: '🌿',
      age: [45, 95],
      once: false,
      cooldown: 5,
      text: 'Tiết Thanh minh, bạn về quê cùng họ hàng ra nghĩa trang làng. Cỏ mọc um tùm, nắng tháng Ba chói chang, người cầm liềm, người cầm chổi, người cầm nắm hương.',
      scene: { loc: 'countryside', time: 'day', anim: 'pray',
        npcs: [{ role: 'relative', anim: 'pray' }, { role: 'kid', anim: 'run', say: 'Mộ cụ ở đâu hả bác?' }], fx: 'smoke', shot: 'wide' },
      choices: [
        { label: 'Cắt cỏ, sửa sang mộ thật kỹ',
          text: 'Bạn cặm cụi cả buổi, mồ hôi ướt đẫm lưng áo. Ngôi mộ sạch tinh, lòng bạn thanh thản lạ.',
          effects: { karma: 6, happy: 4, health: -1 },
          scene: { anim: 'nod', fx: 'sweat' } },
        { label: 'Kể cho đứa cháu nghe về các cụ',
          text: 'Bạn chỉ từng ngôi mộ, kể cụ này đi kháng chiến, cụ kia nấu rượu ngon nhất làng. Thằng bé nghe say sưa.',
          effects: { happy: 6, karma: 3, smarts: 1 },
          scene: { anim: 'talk', fx: 'sparkle', npcAnim: { kid: 'sit' } } },
        { label: 'Thắp nhang, chụp ảnh rồi về sớm',
          text: 'Bạn chạy về thành phố cho kịp cuộc hẹn. Ông trưởng họ nhìn theo, lắc đầu.',
          effects: { karma: -3, happy: 1 },
          scene: { anim: 'phone', npcAnim: { relative: 'shake' } } }
      ]
    },
    {
      id: 'm_retire_bored',
      title: 'Rảnh đến phát ốm',
      icon: '🛋️',
      age: [58, 76],
      req: { job: false },
      text: 'Không còn đi làm, sáng nào bạn cũng dậy lúc 5 giờ theo thói quen rồi... chẳng biết làm gì. Bạn đã lau bàn thờ ba lần, tưới cây bốn lần, thuộc lòng bản tin thời tiết của mọi tỉnh thành.',
      scene: { loc: 'home', time: 'day', anim: 'sit', expr: 'sad', say: 'Hôm nay làm gì nhỉ...', npcs: [], fx: 'zzz', shot: 'close' },
      choices: [
        { label: 'Đăng ký học thư pháp',
          success: { stat: 'smarts', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Chữ "Nhẫn" đầu tiên của bạn được treo trang trọng ở phòng khách. Bạn tìm được một niềm vui mới.', effects: { happy: 10, smarts: 4, money: -2000000 }, scene: { anim: 'study', fx: 'sparkle' } },
            { text: 'Thầy khen chữ bạn "có hồn" với vẻ mặt rất khó hiểu. Bạn vẫn đến lớp đều vì vui.', effects: { happy: 4, smarts: 1, money: -2000000 }, scene: { anim: 'laugh', fx: 'sweat' } }
          ] },
        { label: 'Nhận làm tổ phó tổ dân phố',
          text: 'Bạn lo từ bóng đèn đường đến chuyện chó nhà ai cắn ai. Bận rộn, nhưng thấy mình còn có ích.',
          effects: { happy: 8, karma: 6 },
          scene: { loc: 'street', anim: 'talk', fx: 'levelup' } },
        { label: 'Xem TV cả ngày',
          text: 'Bạn thuộc lòng lịch phát sóng mọi bộ phim truyền hình. Lưng thì mỏi, mắt thì mờ dần.',
          effects: { happy: -3, health: -3 },
          scene: { anim: 'sit', fx: 'zzz' } },
        { label: 'Xin đi làm bảo vệ cho có việc',
          text: 'Bạn nhận trực ca ở tòa nhà gần nhà. Lương chẳng bao nhiêu, nhưng ngày nào cũng có người để chuyện trò.',
          effects: { money: 24000000, happy: 4 },
          scene: { loc: 'office', anim: 'sit', fx: 'sparkle' } }
      ]
    },
    {
      id: 'm_park_exercise',
      title: 'Thể dục buổi sáng',
      icon: '🌅',
      age: [55, 92],
      weight: 1.2,
      once: false,
      cooldown: 4,
      text: '5 giờ sáng ở công viên ven hồ: nhóm dưỡng sinh vỗ tay rần rần, nhóm dân vũ mở nhạc xập xình, một ông cụ đi giật lùi quanh hồ "cho khỏe gối". Cô trưởng nhóm vẫy bạn vào hàng.',
      scene: { loc: 'park', time: 'dawn', anim: 'wave',
        npcs: [{ role: 'neighbor', gender: 'f', age: 66, anim: 'dance', say: 'Vào nhảy cùng cho vui nào!' }, { role: 'crowd', anim: 'dance' }], fx: 'music', shot: 'wide' },
      choices: [
        { label: 'Nhảy dân vũ hết mình',
          text: 'Bạn lắc hông theo điệu cha-cha-cha, sai nhịp liên tục nhưng cười không ngớt. Đầu gối kêu răng rắc mà lòng thì trẻ ra.',
          effects: { health: 5, happy: 8 },
          scene: { anim: 'dance', fx: 'music', npcAnim: { all: 'dance' } } },
        { label: 'Tập dưỡng sinh, vỗ tay một trăm cái',
          text: 'Bạn vỗ tay, xoa bụng, hít thở theo thầy. Lòng bàn tay đỏ ửng, người nhẹ hẳn.',
          effects: { health: 6, happy: 4 },
          scene: { anim: 'clap', fx: 'sparkle', npcAnim: { all: 'clap' } } },
        { label: 'Thử đi giật lùi như ông cụ',
          outcomes: [
            { p: 0.5, text: 'Bạn đi lùi được ba vòng hồ, thấy đầu gối nhẹ hẳn. Ông cụ gật gù nhận bạn làm "đệ tử".', effects: { health: 4, happy: 5 }, scene: { anim: 'walk', fx: 'stars' } },
            { p: 0.5, text: 'Bạn đi lùi đâm sầm vào gánh xôi. Xin lỗi rối rít, mua luôn ba gói xôi.', effects: { money: -60000, happy: 2, health: -1 }, scene: { anim: 'fall', fx: 'stars', npcAnim: { crowd: 'laugh' } } }
          ] },
        { label: 'Đứng xem rồi đi ăn phở',
          text: 'Bạn đứng xem mọi người tập nửa tiếng, coi như vận động mắt, rồi đi ăn bát phở nóng.',
          effects: { happy: 3, health: -1 },
          scene: { loc: 'street', anim: 'eat', fx: 'steam' } }
      ]
    },
    {
      id: 'm_chinese_chess',
      title: 'Ván cờ tướng vỉa hè',
      icon: '♟️',
      age: [55, 98],
      once: false,
      cooldown: 5,
      text: 'Dưới gốc bàng đầu ngõ là bàn cờ "bất bại" của ông {neighbor}. Quanh bàn lúc nào cũng có năm sáu "quân sư quạt mo" đứng chỉ trỏ. Hôm nay ông ấy thách bạn một ván, cược ly trà đá.',
      scene: { loc: 'street', time: 'day', anim: 'sit',
        npcs: [{ role: 'neighbor', gender: 'm', age: 75, anim: 'sit', say: 'Chiếu tướng! Hết đường chạy nhé!' }, { role: 'crowd', anim: 'point' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đánh nghiêm túc, tính từng nước',
          success: { stat: 'smarts', base: 0.25, scale: 0.6 },
          outcomes: [
            { text: 'Nước pháo trống của bạn khiến ông {neighbor} ôm đầu. Đám đông vỗ tay, bạn được mời trà cả tuần.', effects: { happy: 10, smarts: 2 }, scene: { anim: 'cheer', fx: 'stars', npcAnim: { neighbor: 'facepalm', crowd: 'clap' } } },
            { text: 'Mười nước bạn đã mất xe. Ông {neighbor} cười khà khà, hẹn mai đánh tiếp.', effects: { happy: -2, smarts: 1, money: -10000 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { neighbor: 'laugh' } } }
          ] },
        { label: 'Làm "quân sư" đứng ngoài chỉ trỏ',
          text: 'Bạn chỉ nước cho người khác, nước nào cũng... thua. Nhưng cả buổi chiều cười ra nước mắt.',
          effects: { happy: 6 },
          scene: { anim: 'point', fx: 'sweat', npcAnim: { crowd: 'laugh' } } },
        { label: 'Lén đổi chỗ quân cờ khi ông ấy quay đi',
          outcomes: [
            { p: 0.3, text: 'Không ai phát hiện. Bạn thắng, nhưng ly trà đá đắng nghét.', effects: { happy: 1, karma: -5 }, scene: { anim: 'laugh', fx: 'sweat' } },
            { p: 0.7, text: 'Mười cặp mắt quân sư đều thấy hết. Bạn bị "cấm cửa" bàn cờ một tháng.', effects: { happy: -6, karma: -5 }, scene: { anim: 'scared', fx: 'anger', npcAnim: { neighbor: 'angry', crowd: 'shake' } } }
          ] }
      ]
    },
    {
      id: 'm_full_moon_temple',
      title: 'Đi chùa ngày rằm',
      icon: '🪷',
      age: [50, 100],
      weight: 1.2,
      once: false,
      cooldown: 3,
      text: 'Rằm tháng Giêng, chùa đông nghịt người. Khói hương nghi ngút, tiếng mõ đều đều. Bạn chen mãi mới tới được trước chính điện, tay cầm nắm hương, lòng có bao điều muốn khấn.',
      scene: { loc: 'temple', time: 'day', anim: 'pray',
        npcs: [{ role: 'crowd', anim: 'pray' }, { role: 'stranger', gender: 'f', age: 70, anim: 'bow', say: 'Nam mô A Di Đà Phật.' }], fx: 'smoke', shot: 'wide' },
      choices: [
        { label: 'Cầu bình an cho con cháu',
          text: 'Bạn khấn cho từng người trong nhà, tên nào cũng nhớ. Ra về thấy nhẹ lòng như vừa đặt xuống một gánh nặng.',
          effects: { happy: 6, karma: 3 },
          scene: { anim: 'bow', fx: 'sparkle' } },
        { label: 'Cúng dường, phóng sinh chim',
          text: 'Bạn đặt phong bì công đức và mở một lồng chim sẻ. Có con bay vút đi, có con đậu lại trên mái chùa như chào bạn.',
          effects: { money: -1000000, karma: 6, happy: 5 },
          scene: { anim: 'wave', fx: 'petals' } },
        { label: 'Xin một quẻ xăm',
          outcomes: [
            { p: 0.5, text: 'Quẻ thượng cát: gia đạo bình an, hậu vận hanh thông. Bạn cất kỹ trong ví.', effects: { happy: 8 }, scene: { anim: 'cheer', fx: 'stars' } },
            { p: 0.5, text: 'Quẻ khuyên "cẩn thận lời ăn tiếng nói". Bạn ngậm miệng suốt ba ngày, cả nhà tưởng bạn ốm.', effects: { happy: -2, karma: 2 }, scene: { anim: 'think', fx: 'question' } }
          ] }
      ]
    },
    {
      id: 'm_songbird',
      title: 'Chú chim chào mào',
      icon: '🐦',
      age: [55, 90],
      text: 'Ông bạn già tặng bạn một chú chim chào mào mào đỏ, hót lảnh lót từ 5 giờ sáng. Ở xóm có hẳn một hội chơi chim, sáng nào cũng treo lồng ở quán cà phê để "so giọng".',
      scene: { loc: 'cafe', time: 'dawn', anim: 'drink',
        npcs: [{ role: 'neighbor', gender: 'm', age: 68, anim: 'point', say: 'Con này giọng hay đấy, chăm kỹ vào!' }], fx: 'music', shot: 'close' },
      choices: [
        { label: 'Chăm chim thật kỹ, đi thi hội chim',
          success: { stat: 'happy', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Chú chào mào đoạt giải Ba hội thi của phường. Bạn treo giấy khen ngay cạnh bàn thờ gia tiên.', effects: { happy: 12, money: 1000000 }, scene: { anim: 'cheer', fx: 'confetti', npcAnim: { neighbor: 'clap' } } },
            { text: 'Hôm thi, chim im như thóc. Về đến nhà thì hót váng cả xóm.', effects: { happy: 2 }, scene: { anim: 'facepalm', fx: 'music', npcAnim: { neighbor: 'laugh' } } }
          ] },
        { label: 'Mở lồng thả chim về trời',
          text: 'Chú chim đậu trên cành một lúc rồi bay vút đi. Tự do của nó làm bạn vui hơn mọi tiếng hót.',
          effects: { karma: 8, happy: 4 },
          scene: { loc: 'park', anim: 'wave', fx: 'sparkle', npcAnim: { neighbor: 'shrug' } } },
        { label: 'Ngồi quán nghe chim, tám chuyện cả sáng',
          text: 'Cà phê, tiếng chim, chuyện thời sự trong xóm... Bạn chợt hiểu vì sao các cụ ngày xưa mê thú vui này.',
          effects: { happy: 6, money: -200000 },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { neighbor: 'laugh' } } }
      ]
    },
    {
      id: 'm_balcony_garden',
      title: 'Vườn rau ban công',
      icon: '🥬',
      age: [55, 92],
      text: 'Bạn biến cái ban công chật chội thành vườn rau: thùng xốp trồng cải, chai nhựa trồng hành, giàn mướp leo kín lan can. Sáng nay mở cửa ra thì... một đàn sâu đang mở tiệc trên luống cải.',
      scene: { loc: 'home', time: 'day', anim: 'think', expr: 'surprised', say: 'Sâu ở đâu ra lắm thế này!', npcs: [], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Bắt sâu bằng tay, không phun thuốc',
          text: 'Bạn ngồi bắt từng con cả buổi sáng. Rau lỗ chỗ nhưng sạch, bát canh cải chiều nay ngọt lịm.',
          effects: { health: 3, happy: 6 },
          scene: { anim: 'sit', fx: 'sparkle' } },
        { label: 'Mang rau biếu hàng xóm',
          text: 'Hàng xóm được rau sạch, đáp lễ bằng đĩa bánh cuốn. Cả dãy nhà giờ gọi bạn là "nông dân phố".',
          effects: { karma: 5, happy: 6 },
          scene: { loc: 'street', anim: 'talk', fx: 'hearts' } },
        { label: 'Phun thuốc diệt sâu thật mạnh',
          text: 'Sâu chết sạch, mấy con ong ghé giàn mướp cũng chết theo. Rau xanh mướt mà bạn chẳng dám ăn.',
          effects: { happy: -3, karma: -2, health: -1 },
          scene: { anim: 'shrug', fx: 'smoke' } }
      ]
    },
    {
      id: 'm_babysit_grandchild',
      title: 'Trông cháu',
      icon: '👶',
      age: [50, 85],
      req: { has: ['grandchild'], cond: roleAged('grandchild', 1, 6) },
      text: 'Con cái đi làm, gửi bé {grandchild} cho bạn trông cả ngày. Cháu đòi ăn, cháu đòi chơi, cháu trèo lên ghế với bàn thờ, cháu khóc vì cái kẹo màu đỏ chứ không phải màu xanh. Mới 10 giờ sáng bạn đã muốn nằm.',
      scene: { loc: 'home', time: 'day', anim: 'walk', expr: 'surprised',
        npcs: [{ role: 'grandchild', anim: 'run', say: 'Chơi nữa, chơi nữaaa!' }], fx: 'sweat', shot: 'wide' },
      choices: [
        { label: 'Bò làm ngựa cho cháu cưỡi',
          text: 'Bạn bò quanh nhà làm ngựa, cháu cười khanh khách. Lưng đau ê ẩm, nhưng tiếng cười ấy đáng giá hơn mọi thuốc bổ.',
          effects: { happy: 10, health: -2, rel: { grandchild: 15 } },
          scene: { anim: 'crawl', fx: 'hearts', npcAnim: { grandchild: 'laugh' } } },
        { label: 'Bật hoạt hình cho cháu xem cả ngày',
          text: 'Cháu ngồi im thin thít trước màn hình. Bạn được yên, nhưng tối về cháu chỉ nói toàn câu thoại trong phim.',
          effects: { happy: 3, rel: { grandchild: 2 } },
          scene: { anim: 'sit', fx: 'zzz', npcAnim: { grandchild: 'sit' } } },
        { label: 'Dạy cháu hát đồng dao',
          text: 'Bạn dạy cháu mấy bài đồng dao ngày xưa. Tối bố mẹ cháu về, cháu hát líu lo, bạn tự hào ra mặt.',
          effects: { rel: { grandchild: 12 }, happy: 8, smarts: 1 },
          scene: { anim: 'sing', fx: 'music', npcAnim: { grandchild: 'clap' } } }
      ]
    },
    {
      id: 'm_smartphone_lesson',
      title: 'Cháu dạy dùng điện thoại',
      icon: '📲',
      age: [60, 96],
      req: { has: ['grandchild'], cond: roleAged('grandchild', 8, 40) },
      text: 'Cháu {grandchild} mua tặng bạn chiếc điện thoại thông minh, kiên nhẫn ngồi dạy: vuốt lên là mở, bấm vào nút xanh là gọi video. Mười phút sau bạn đã vô tình chụp 47 tấm ảnh trần nhà.',
      scene: { loc: 'home', time: 'day', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'grandchild', anim: 'laugh', say: 'Không phải nút đó ạ!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Học nghiêm túc, ghi chép vào sổ',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Một tuần sau bạn đã biết gọi video, gửi ảnh, thả tim. Hội bạn già phục bạn sát đất.', effects: { smarts: 4, happy: 8, rel: { grandchild: 10 } }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { grandchild: 'clap' } } },
            { text: 'Cuốn sổ dày ba trang, nhưng nửa đêm bạn vẫn bấm nhầm gọi video cho cả nhóm họ hàng.', effects: { happy: -2, rel: { grandchild: 4 } }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { grandchild: 'laugh' } } }
          ] },
        { label: 'Chỉ cần biết nghe gọi là đủ',
          text: 'Bạn dán băng dính lên mọi nút, chỉ chừa nút nghe. Đơn giản là hạnh phúc.',
          effects: { happy: 3, rel: { grandchild: 3 } },
          scene: { anim: 'laugh', npcAnim: { grandchild: 'facepalm' } } },
        { label: 'Mê xem video ngắn đến khuya',
          text: 'Bạn khám phá thế giới video ngắn và thức đến 1 giờ sáng xem người ta nấu ăn. Sáng hôm sau mắt đỏ như mắt thỏ.',
          effects: { happy: 5, health: -2 },
          scene: { loc: 'bedroom', time: 'night', anim: 'phone', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_video_call',
      title: 'Cuộc gọi từ phương xa',
      icon: '📹',
      age: [50, 96],
      once: false,
      cooldown: 4,
      req: { has: ['child'], flag: 'm_child_abroad' },
      text: 'Chín giờ tối, điện thoại reo: {child} gọi video từ nửa vòng trái đất. Hình hơi giật, tiếng hơi rè, nhưng bạn vẫn nhận ra con gầy đi.',
      scene: { loc: 'home', time: 'night', anim: 'phone', expr: 'love', say: 'Con ăn cơm chưa?', npcs: [], fx: 'hearts', shot: 'close' },
      choices: [
        { label: 'Kể chuyện nhà, chuyện xóm cả tiếng',
          text: 'Bạn kể từ chuyện con mèo đẻ đến chuyện giá rau tăng. Con nghe, cười, rồi im lặng một lúc lâu: "Con nhớ nhà quá."',
          effects: { happy: 6, rel: { child: 10 } },
          scene: { anim: 'talk', fx: 'tears' } },
        { label: 'Giục con về nước',
          outcomes: [
            { p: 0.5, text: 'Con hứa cuối năm sẽ về hẳn. Bạn đếm ngày trên tờ lịch treo tường.', effects: { happy: 8, rel: { child: 3 } }, scene: { anim: 'cheer', fx: 'sparkle' } },
            { p: 0.5, text: 'Con ậm ừ rồi lảng sang chuyện khác. Bạn hiểu con đã có cuộc sống bên ấy.', effects: { happy: -5, rel: { child: -2 } }, scene: { anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Giấu chuyện ốm, bảo nhà vẫn khỏe',
          text: 'Bạn cười tươi, bảo ở nhà "khỏe như vâm". Cúp máy, bạn ho khù khụ. Có những điều cha mẹ nào cũng giấu.',
          effects: { happy: -2, rel: { child: 4 }, karma: 2 },
          scene: { anim: 'sick', fx: 'sweat' } }
      ]
    },
    {
      id: 'm_child_study_abroad',
      title: 'Con muốn đi du học',
      icon: '✈️',
      age: [44, 62],
      req: { has: ['child'], notFlag: 'm_child_abroad', cond: roleAged('child', 17, 24) },
      text: '{child} mang về một tập hồ sơ: học bổng 50% ở một trường đại học bên Úc, phần còn lại cần khoảng {money:900000000} cho ba năm. Con nói khẽ: "Nếu nhà mình khó thì con ở lại cũng được."',
      scene: { loc: 'home', time: 'night', anim: 'think',
        npcs: [{ role: 'child', anim: 'talk', expr: 'scared', say: 'Con được học bổng một nửa ạ.' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Rút hết tiết kiệm, cho con đi', req: { minMoney: 900000000 },
          text: 'Bạn tiễn con ở sân bay. Về nhà, phòng con trống trơn, bạn ngồi ôm cái gối con hay nằm.',
          effects: { money: -900000000, rel: { child: 20 }, happy: -2, flag: 'm_child_abroad' },
          scene: { anim: 'wave', fx: 'tears', npcAnim: { child: 'wave' } } },
        { label: 'Vay ngân hàng cho con đi',
          outcomes: [
            { p: 0.6, text: 'Con học giỏi, năm hai được học bổng toàn phần. Khoản vay nhẹ đi một nửa.', effects: { money: -400000000, rel: { child: 18 }, happy: 10, flag: 'm_child_abroad' }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { child: 'hug' } } },
            { p: 0.4, text: 'Lãi suất tăng, bạn làm thêm cả cuối tuần để trả nợ. Con biết, gọi về lúc nào cũng nói "con ổn".', effects: { money: -700000000, rel: { child: 15 }, health: -5, happy: -4, flag: 'm_child_abroad' }, scene: { anim: 'sad', fx: 'sweat', npcAnim: { child: 'hug' } } }
          ] },
        { label: 'Khuyên con học trong nước trước',
          text: 'Con gật đầu, nhưng tối đó bạn nghe tiếng con khóc trong phòng. Con cất tập hồ sơ vào ngăn kéo, dặn lòng sẽ tự xin học bổng thạc sĩ.',
          effects: { rel: { child: -4 }, happy: -3 },
          scene: { anim: 'sad', npcAnim: { child: 'cry' } } }
      ]
    },
    // ───────────────────────────── TUỔI GIÀ ─────────────────────────────
    {
      id: 'm_supplement_scam',
      title: 'Hội thảo tặng quà',
      icon: '💊',
      age: [60, 95],
      weight: 1.1,
      text: 'Mấy thanh niên lễ phép mời bạn dự "hội thảo sức khỏe" miễn phí, có ăn trưa và tặng nồi cơm điện. Trong hội trường, một "giáo sư" giới thiệu lọ thuốc thần chữa từ đau lưng đến tiểu đường, giá chỉ {money:12000000}.',
      scene: { loc: 'office', time: 'day', anim: 'sit',
        npcs: [{ role: 'stranger', gender: 'm', age: 35, anim: 'point', say: 'Uống ba tháng, khỏi hẳn tiểu đường!' }, { role: 'crowd', anim: 'clap' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Mua hai liệu trình cho chắc',
          text: 'Bạn khệ nệ mang về hai thùng "thần dược". Con cháu đọc nhãn mới biết chỉ là bột ngũ cốc pha đường. Tiền mất, đường huyết còn tăng.',
          effects: { money: -24000000, health: -3, happy: -8, smarts: 1 },
          scene: { loc: 'home', anim: 'facepalm', fx: 'sweat' } },
        { label: 'Ăn trưa, nhận nồi cơm điện rồi chuồn',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Bạn khéo léo ra về cùng chiếc nồi cơm điện. Cả xóm phục "kinh nghiệm trận mạc" của bạn.', effects: { happy: 6 }, scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { stranger: 'facepalm' } } },
            { text: 'Họ chặn cửa, bảo nồi chỉ tặng người mua thuốc. Bạn ngượng ngùng để lại chiếc nồi và cả buổi trưa.', effects: { happy: -4 }, scene: { anim: 'shrug', fx: 'sweat', npcAnim: { stranger: 'shake' } } }
          ] },
        { label: 'Gọi công an phường đến kiểm tra',
          outcomes: [
            { p: 0.6, text: 'Công an tới, nhóm "giáo sư" giải tán trong năm phút. Bạn được khen trong buổi họp tổ dân phố.', effects: { karma: 10, happy: 6 }, scene: { anim: 'point', fx: 'exclaim', npcAnim: { stranger: 'run', crowd: 'clap' } } },
            { p: 0.4, text: 'Khi công an tới thì họ đã dọn sạch. Nhưng ít ra hôm đó không ai mua thêm lọ nào.', effects: { karma: 6, happy: 2 }, scene: { anim: 'shrug', npcAnim: { crowd: 'nod' } } }
          ] }
      ]
    },
    {
      id: 'm_elder_club',
      title: 'Hội người cao tuổi',
      icon: '🎖️',
      age: [60, 95],
      text: 'Hội người cao tuổi phường chuẩn bị văn nghệ mừng ngày Quốc tế Người cao tuổi. Chi hội trưởng, một cụ ông 80 tuổi giọng sang sảng, chỉ thẳng vào bạn.',
      scene: { loc: 'park', time: 'day', anim: 'nod', expr: 'surprised',
        npcs: [{ role: 'neighbor', gender: 'm', age: 80, anim: 'point', say: 'Năm nay nhất định phải góp tiết mục!' }, { role: 'crowd', anim: 'clap' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'Hát một bài dân ca',
          success: { stat: 'happy', base: 0.35, scale: 0.4 },
          outcomes: [
            { text: 'Giọng bạn run run mà ngọt. Cả hội vỗ tay, có bà cụ ngồi hàng đầu lau nước mắt.', effects: { happy: 12, karma: 2 }, scene: { anim: 'sing', fx: 'music', npcAnim: { crowd: 'clap' } } },
            { text: 'Micro rè, bạn hát lạc tông, nhưng cả hội vẫn vỗ tay động viên. Ai mà chẳng từng thế.', effects: { happy: 4 }, scene: { anim: 'laugh', fx: 'sweat', npcAnim: { crowd: 'clap' } } }
          ] },
        { label: 'Múa quạt cùng cả hội',
          text: 'Bạn cầm quạt múa sai một nhịp mà ai cũng khen "có duyên". Tiết mục đoạt giải khuyến khích.',
          effects: { happy: 9, health: 2 },
          scene: { anim: 'dance', fx: 'petals', npcAnim: { crowd: 'dance' } } },
        { label: 'Ứng cử chi hội phó',
          outcomes: [
            { p: 0.5, text: 'Bạn trúng cử với 100% phiếu bầu... vì không ai khác ứng cử. Từ đó bận như thời còn đi làm.', effects: { happy: 6, karma: 4 }, scene: { anim: 'cheer', fx: 'levelup', npcAnim: { neighbor: 'clap' } } },
            { p: 0.5, text: 'Bạn thua một cụ bà 85 tuổi. Bà cụ bắt tay bạn: "Lần sau nhé!"', effects: { happy: -2 }, scene: { anim: 'laugh', npcAnim: { crowd: 'laugh' } } }
          ] }
      ]
    },
    {
      id: 'm_old_friend_passes',
      title: 'Chiếc ghế trống',
      icon: '🕊️',
      age: [65, 100],
      weight: 0.8,
      once: false,
      cooldown: 6,
      text: 'Người bạn già hay ngồi đánh cờ với bạn ở gốc bàng vừa ra đi trong giấc ngủ. Chiếc ghế nhựa quen thuộc của ông ấy giờ trống trơn, chén trà còn úp trên khay.',
      scene: { loc: 'street', time: 'dusk', anim: 'sit', expr: 'sad', npcs: [], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Đến thắp nén nhang tiễn bạn',
          text: 'Bạn đứng lặng trước di ảnh, kể với con cháu ông ấy về những ván cờ ngày trước. Họ cảm ơn bạn mãi.',
          effects: { karma: 5, happy: -4 },
          scene: { loc: 'temple', anim: 'pray', fx: 'smoke' } },
        { label: 'Ngồi một mình bên bàn cờ cũ',
          text: 'Bạn bày cờ ra, đi một nước, rồi chờ. Chẳng ai đi nước tiếp theo. Gió thổi xào xạc qua tán lá.',
          effects: { happy: -6 },
          scene: { anim: 'sit', fx: 'tears', shot: 'wide' } },
        { label: 'Gọi điện cho những người bạn còn lại',
          text: 'Bạn mở danh bạ, gọi từng người, hẹn cuối tuần uống trà. Đời ngắn lắm, gặp được nhau lúc nào quý lúc đó.',
          effects: { happy: 3, karma: 2 },
          scene: { anim: 'phone', fx: 'hearts' } }
      ]
    },
    {
      id: 'm_write_will',
      title: 'Viết di chúc',
      icon: '✍️',
      age: [65, 96],
      req: { has: ['child'] },
      text: 'Sau trận ốm vừa rồi, bạn nghĩ đến chuyện viết di chúc. Ngồi trước tờ giấy trắng, bạn tính: căn nhà, cuốn sổ tiết kiệm, mấy chỉ vàng, và cả cái tủ gỗ đứa con nào cũng thích.',
      scene: { loc: 'home', time: 'night', anim: 'study', say: 'Chia thế nào cho công bằng đây...', npcs: [], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Chia đều cho các con, công chứng đàng hoàng',
          text: 'Mọi thứ rõ ràng giấy trắng mực đen. Gọi các con về đọc, ai cũng gật đầu. Bạn ngủ một giấc thật yên.',
          effects: { money: -2000000, happy: 6, karma: 4, rel: { child: 5 }, flag: 'm_will' },
          scene: { anim: 'nod', fx: 'sparkle' } },
        { label: 'Để phần hơn cho đứa con chăm mình',
          outcomes: [
            { p: 0.5, text: 'Các con hiểu và đồng ý. Đứa con hay chăm bạn ôm bạn khóc.', effects: { happy: 4, rel: { child: 6 }, flag: 'm_will' }, scene: { anim: 'hug', fx: 'tears' } },
            { p: 0.5, text: 'Một đứa thấy thiệt, mặt nặng mày nhẹ suốt mấy tháng. Bữa cơm gia đình bỗng ít tiếng cười.', effects: { happy: -6, rel: { child: -6 }, flag: 'm_will' }, scene: { anim: 'sad', fx: 'anger' } }
          ] },
        { label: 'Lập quỹ khuyến học ở quê', req: { minMoney: 200000000 },
          text: 'Bạn dành một khoản lập quỹ khuyến học mang tên cha mẹ mình. Mỗi năm có mười đứa trẻ quê được nhận học bổng.',
          effects: { money: -100000000, karma: 18, happy: 8, flag: 'm_will' },
          scene: { anim: 'cheer', fx: 'sparkle' } },
        { label: 'Thôi, còn khỏe chán, để sau',
          text: 'Bạn cất tờ giấy vào ngăn kéo, tự nhủ "còn khỏe chán", rồi đi ngủ.',
          effects: { happy: 1 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_back_pain',
      title: 'Cái lưng biểu tình',
      icon: '🦴',
      age: [55, 92],
      once: false,
      cooldown: 5,
      text: 'Cúi xuống nhặt chiếc dép, bạn nghe "rắc" một tiếng và không đứng thẳng lên được nữa. Cả nhà xúm lại, mỗi người một phương thuốc: cao dán, dầu gió, lá ngải, ông lang bấm huyệt.',
      scene: { loc: 'home', time: 'day', anim: 'sick', expr: 'sick', say: 'Ối giời ơi cái lưng!',
        npcs: [{ role: 'relative', gender: 'f', age: 60, anim: 'point', say: 'Đắp lá ngải là khỏi ngay!' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Đi bệnh viện chụp phim',
          text: 'Bác sĩ bảo thoát vị nhẹ, kê thuốc và dặn tập vật lý trị liệu. Hai tuần sau bạn đã cúi được, cẩn thận hơn.',
          effects: { money: -3000000, health: 5, happy: 2 },
          scene: { loc: 'hospital', anim: 'nod', fx: 'sparkle' } },
        { label: 'Nghe lời mách, đi bấm huyệt',
          outcomes: [
            { p: 0.5, text: 'Ông lang bấm vài cái, bạn đứng thẳng được ngay. Phép màu, hay may mắn?', effects: { money: -500000, health: 4, happy: 5 }, scene: { anim: 'cheer', fx: 'sparkle' } },
            { p: 0.5, text: 'Bấm xong còn đau hơn, phải nằm bẹp cả tuần.', effects: { money: -500000, health: -5, happy: -5 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'sweat' } }
          ] },
        { label: 'Nằm nghỉ, kệ nó tự khỏi',
          text: 'Bạn nằm ba ngày, xem hết hai bộ phim truyền hình. Lưng đỡ hơn, nhưng cứ trở trời là nhói.',
          effects: { health: -2, happy: -1 },
          scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }
      ]
    },
    {
      id: 'm_bad_eyes',
      title: 'Mắt kém',
      icon: '👓',
      age: [55, 96],
      text: 'Đọc tin nhắn phải đưa điện thoại ra xa tít tắp, xâu kim thì mười lần trượt chín. Hôm qua bạn còn rót nhầm nước mắm vào ấm trà vì hai cái chai giống nhau.',
      scene: { loc: 'home', time: 'day', anim: 'phone', expr: 'surprised', say: 'Chữ gì mà bé tí thế này...', npcs: [], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Đi cắt kính lão tử tế',
          text: 'Thế giới bỗng sắc nét trở lại. Bạn đọc hết cả tờ báo, phát hiện cái đồng hồ treo tường chạy sai năm phút từ bao giờ.',
          effects: { money: -1500000, happy: 6, smarts: 1 },
          scene: { anim: 'cheer', fx: 'sparkle' } },
        { label: 'Mua kính vỉa hè cho rẻ',
          outcomes: [
            { p: 0.5, text: 'Kính 50 nghìn mà nhìn rõ phết. Bạn đi khoe khắp xóm.', effects: { money: -50000, happy: 4 }, scene: { loc: 'street', anim: 'laugh', fx: 'stars' } },
            { p: 0.5, text: 'Đeo một tuần thì đau đầu, chóng mặt. Cuối cùng vẫn phải đi cắt kính mới.', effects: { money: -1550000, health: -2, happy: -2 }, scene: { anim: 'sick', fx: 'sweat' } }
          ] },
        { label: 'Mổ mắt cho dứt điểm', req: { minMoney: 30000000 },
          success: { stat: 'health', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Ca mổ thành công. Lần đầu sau nhiều năm bạn thấy rõ từng nếp nhăn trên mặt mình... và hơi tiếc.', effects: { money: -25000000, health: 4, happy: 8 }, scene: { loc: 'hospital', anim: 'laugh', fx: 'sparkle' } },
            { text: 'Mổ xong mắt vẫn hơi mờ, phải tái khám nhiều lần mới ổn định.', effects: { money: -30000000, health: -2, happy: -3 }, scene: { loc: 'hospital', anim: 'sick', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 'm_forgetful',
      title: 'Hay quên',
      icon: '🔑',
      age: [65, 100],
      once: false,
      cooldown: 5,
      text: 'Bạn lục tung cả nhà tìm cặp kính suốt nửa tiếng, rồi đứa trẻ nhà bên chỉ lên đầu bạn. Tuần này bạn đã quên tắt bếp hai lần, gọi nhầm tên con cháu năm lần, và quên mất mình định đi chợ mua gì.',
      scene: { loc: 'home', time: 'day', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'kid', anim: 'point', say: 'Kính ở trên đầu kìa!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Cười trừ, dán giấy nhớ khắp nhà',
          text: 'Tủ lạnh, cửa, gương... đâu cũng có giấy nhớ. Có tờ ghi "nhớ đọc giấy nhớ". Vậy mà hiệu quả bất ngờ!',
          effects: { happy: 5, smarts: 1 },
          scene: { anim: 'laugh', fx: 'idea', npcAnim: { kid: 'laugh' } } },
        { label: 'Đi khám trí nhớ',
          text: 'Bác sĩ bảo chỉ là lão hóa bình thường, khuyên chơi cờ, đọc sách, đi bộ. Bạn về mua ngay bộ cờ tướng.',
          effects: { money: -1000000, happy: 4, smarts: 2 },
          scene: { loc: 'hospital', anim: 'nod', fx: 'sparkle' } },
        { label: 'Tập giải ô chữ mỗi ngày',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Ba tháng sau bạn giải ô chữ báo cuối tuần nhanh hơn cả lũ trẻ. Trí nhớ khá lên trông thấy.', effects: { smarts: 5, happy: 5 }, scene: { anim: 'study', fx: 'levelup' } },
            { text: 'Bạn quên mất là mình đã giải ô chữ đó rồi, và giải lại lần thứ ba.', effects: { happy: 2, smarts: 1 }, scene: { anim: 'facepalm', fx: 'question' } }
          ] }
      ]
    },
    {
      id: 'm_bathroom_fall',
      title: 'Ngã trong nhà tắm',
      icon: '🛁',
      age: [70, 100],
      weight: 0.8,
      once: false,
      cooldown: 6,
      text: 'Sàn nhà tắm trơn, bạn trượt chân ngã đánh "uỵch". Nằm dưới sàn, bạn nghĩ: gọi ai bây giờ, và liệu có ai nghe thấy?',
      scene: { loc: 'home', time: 'day', anim: 'sick', expr: 'scared', say: 'Ối... có ai không?', npcs: [], fx: 'stars', shot: 'dramatic' },
      choices: [
        { label: 'Gọi thật to cầu cứu',
          outcomes: [
            { p: 0.7, text: 'Hàng xóm nghe tiếng chạy sang, đưa bạn đi viện. Chỉ bong gân cổ tay, may quá.', effects: { health: -6, money: -2000000, happy: -3 }, scene: { loc: 'hospital', anim: 'sick', fx: 'sweat' } },
            { p: 0.3, text: 'Không ai nghe thấy. Đến chiều con cháu về mới phát hiện. Rạn xương hông, phải nằm viện cả tháng.', effects: { health: -20, money: -30000000, happy: -12 }, scene: { loc: 'hospital', anim: 'sleep', fx: 'tears' } }
          ] },
        { label: 'Tự gượng dậy, không muốn phiền ai',
          success: { stat: 'health', base: 0.2, scale: 0.6 },
          outcomes: [
            { text: 'Bạn bám thành tường, từ từ đứng dậy. Chỉ bầm tím, và bạn giấu cả nhà.', effects: { health: -4, happy: -2 }, scene: { anim: 'idle', fx: 'sweat' } },
            { text: 'Bạn gượng dậy rồi ngã thêm lần nữa. Lần này đau thật, phải nằm cả tuần.', effects: { health: -14, happy: -8 }, scene: { anim: 'fall', fx: 'stars' } }
          ] },
        { label: 'Bò ra gọi điện, rồi lắp tay vịn khắp nhà',
          text: 'Bạn gọi được con đến đưa đi khám. Tuần sau cả nhà lắp tay vịn, thảm chống trơn, đèn cảm ứng. Nhà an toàn hẳn.',
          effects: { health: -5, money: -5000000, happy: 2 },
          scene: { anim: 'crawl', fx: 'exclaim' } }
      ]
    },
    {
      id: 'm_longevity_party',
      title: 'Tiệc mừng thọ',
      icon: '🎂',
      age: [70, 100],
      once: false,
      cooldown: 9,
      req: { has: ['child'] },
      text: 'Con cháu tổ chức tiệc mừng thọ {age} tuổi cho bạn. Phòng khách treo chữ "Thọ" đỏ chót, bánh kem ba tầng, đứa cháu nhỏ nhất đọc bài chúc học thuộc lòng từ cả tuần trước.',
      scene: { loc: 'home', time: 'day', decor: 'birthday', anim: 'clap', expr: 'happy',
        npcs: [{ role: 'child', anim: 'cheer', say: 'Cả nhà chúc mừng thọ ạ!' }, { role: 'kid', anim: 'bow', say: 'Cháu chúc sống lâu trăm tuổi ạ!' }, { role: 'crowd', anim: 'clap' }], fx: 'confetti', shot: 'orbit' },
      choices: [
        { label: 'Phát biểu vài lời',
          text: 'Bạn cầm micro, nói được ba câu thì nghẹn. Cả nhà vỗ tay, đứa con lớn quay đi lau nước mắt.',
          effects: { happy: 12, rel: { child: 8 } },
          scene: { anim: 'cry', expr: 'happy', fx: 'tears', npcAnim: { child: 'cry', crowd: 'clap' } } },
        { label: 'Hát bài ru ngày xưa tặng con cháu',
          text: 'Bạn hát lại bài ru từng hát cho các con thuở bé. Đứa nào cũng còn thuộc, cả nhà đồng ca.',
          effects: { happy: 12, rel: { child: 6 } },
          scene: { anim: 'sing', fx: 'music', npcAnim: { all: 'clap' } } },
        { label: 'Lì xì cho từng đứa cháu',
          text: 'Bạn mở chiếc hộp gỗ, phát phong bao cho từng đứa, dặn "học cho giỏi". Đứa nào cũng sà vào ôm bạn.',
          effects: { money: -5000000, happy: 10, karma: 4 },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { kid: 'hug' } } }
      ]
    },
    {
      id: 'm_old_stories',
      title: 'Ngày xưa ấy',
      icon: '📻',
      age: [65, 100],
      once: false,
      cooldown: 5,
      req: { has: ['grandchild'] },
      text: 'Mất điện, cả nhà ra hiên hóng mát. Cháu {grandchild} ngồi sát lại: "Ngày xưa không có điện thoại thì chơi gì ạ?" Bạn nhìn lên trời sao, bắt đầu kể.',
      scene: { loc: 'home', time: 'night', anim: 'talk',
        npcs: [{ role: 'grandchild', anim: 'sit', expr: 'happy', say: 'Kể nữa đi, kể nữa đi!' }], fx: 'stars', shot: 'close' },
      choices: [
        { label: 'Kể chuyện thời tem phiếu',
          text: 'Chuyện xếp hàng mua gạo từ 3 giờ sáng, chiếc xe đạp là cả gia tài. Cháu tròn mắt: "Thật hả?"',
          effects: { happy: 7, rel: { grandchild: 10 } },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { grandchild: 'think' } } },
        { label: 'Kể chuyện ma cây gạo đầu làng',
          text: 'Giọng bạn hạ thấp dần... rồi "Hù!" Cháu hét lên, ôm chặt lấy bạn, rồi đòi kể tiếp.',
          effects: { happy: 9, rel: { grandchild: 12 } },
          scene: { anim: 'jump', fx: 'exclaim', npcAnim: { grandchild: 'scared' } } },
        { label: 'Thêm mắm thêm muối cho hoành tráng',
          text: 'Trong chuyện của bạn, ngày xưa bạn từng một mình đuổi cả đàn trâu điên. Cháu đem kể ở lớp, cô giáo gọi điện hỏi thăm.',
          effects: { happy: 6, karma: -1, rel: { grandchild: 8 } },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { grandchild: 'cheer' } } }
      ]
    },
    {
      id: 'm_hometown_visit',
      title: 'Về thăm quê',
      icon: '🏡',
      age: [58, 92],
      text: 'Mấy chục năm rồi bạn mới về lại quê cũ. Đường đất giờ đã đổ bê tông, cây đa đầu làng vẫn còn, nhưng những gương mặt quen thì thưa dần. Một bà cụ móm mém nheo mắt nhìn bạn.',
      scene: { loc: 'countryside', time: 'dusk', anim: 'wave',
        npcs: [{ role: 'stranger', gender: 'f', age: 88, anim: 'wave', say: 'Có phải {name} đấy không con?' }], fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Ngồi lại ăn bát cơm quê',
          text: 'Bà cụ hóa ra là bạn học của mẹ bạn. Bát canh cua, đĩa cà pháo, và những câu chuyện về chính bạn hồi cởi truồng tắm sông.',
          effects: { happy: 12 },
          scene: { anim: 'eat', fx: 'hearts', npcAnim: { stranger: 'talk' } } },
        { label: 'Góp tiền sửa lại trường làng', req: { minMoney: 100000000 },
          text: 'Bạn góp một khoản xây lại lớp học cũ. Ngày khánh thành, cả làng ra đón, bạn cắt băng mà tay run run.',
          effects: { money: -50000000, karma: 15, happy: 10 },
          scene: { anim: 'clap', fx: 'confetti', npcAnim: { stranger: 'clap' } } },
        { label: 'Đi một vòng làng một mình',
          text: 'Bạn đi qua bờ ao, lũy tre, nền nhà cũ nay là ruộng ngô. Đứng đó rất lâu, bạn mới hiểu hết hai chữ "quê hương".',
          effects: { happy: 4, smarts: 1 },
          scene: { anim: 'think', expr: 'sad', fx: 'petals', npcAnim: { stranger: 'walk' } } }
      ]
    },
    {
      id: 'm_first_love',
      title: 'Gặp lại mối tình đầu',
      icon: '🌸',
      age: [58, 86],
      weight: 0.6,
      text: 'Ở buổi họp hội đồng hương, bạn bất ngờ chạm mặt người yêu đầu tiên năm mười bảy tuổi. Tóc đã bạc, nhưng nụ cười thì vẫn y như cũ.',
      scene: { loc: 'cafe', time: 'day', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', age: 66, anim: 'laugh', say: 'Còn nhớ cái xe đạp cọc cạch không?' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Ngồi ôn chuyện cũ một buổi',
          text: 'Hai người kể chuyện con cháu, chuyện bệnh tật, cười những lá thư ngô nghê ngày ấy. Chia tay, lòng ấm áp mà không tiếc gì.',
          effects: { happy: 10 },
          scene: { anim: 'laugh', fx: 'sparkle', npcAnim: { stranger: 'laugh' } } },
        { label: 'Hỏi câu đã giấu mấy chục năm',
          outcomes: [
            { p: 0.5, text: 'Người ấy kể ngày đó gia đình chuyển đi đột ngột, thư gửi không tới. Bạn nhẹ lòng như gỡ được nút thắt bốn mươi năm.', effects: { happy: 8 }, scene: { anim: 'nod', fx: 'tears', npcAnim: { stranger: 'sad' } } },
            { p: 0.5, text: 'Người ấy ngẩn ra: "Ơ, mình từng yêu nhau à?" Bạn cười đến chảy nước mắt.', effects: { happy: 5 }, scene: { anim: 'laugh', fx: 'sweat', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Hẹn sáng mai đi bộ quanh hồ', req: { married: false },
          success: { stat: 'happy', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Sáng nào hai người cũng đi bộ quanh hồ, rồi thành bạn đồng hành tuổi xế chiều.', effects: { happy: 12, addPerson: { role: 'partner', fromScene: 'stranger' } }, scene: { loc: 'park', time: 'dawn', anim: 'love', fx: 'hearts', npcAnim: { stranger: 'love' } } },
            { text: 'Hẹn mãi rồi thôi, mỗi người một nhịp sống. Nhưng gặp lại được là vui rồi.', effects: { happy: 3 }, scene: { anim: 'wave', npcAnim: { stranger: 'wave' } } }
          ] }
      ]
    },
    {
      id: 'm_live_with_kids',
      title: 'Ở với con hay ở riêng',
      icon: '🏠',
      age: [68, 94],
      req: { has: ['child'] },
      text: 'Các con họp gia đình, đề nghị bạn dọn lên ở cùng cho tiện chăm sóc. Nhưng ở căn nhà này bạn có giàn hoa giấy, có hàng xóm quen, có cái ghế mây ngồi mỗi chiều.',
      scene: { loc: 'home', time: 'day', anim: 'think',
        npcs: [{ role: 'child', anim: 'talk', say: 'Lên ở với con cho con yên tâm!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Dọn lên ở với con',
          outcomes: [
            { p: 0.6, text: 'Có cháu quấn quýt, cơm có người nấu. Chỉ là thỉnh thoảng nhớ tiếng gà gáy sáng.', effects: { happy: 6, rel: { child: 10 }, health: 3 }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { child: 'hug' } } },
            { p: 0.4, text: 'Nhà con chật, giờ giấc lệch nhau, bạn thấy mình như khách. Ba tháng sau xin về.', effects: { happy: -6, rel: { child: -3 } }, scene: { anim: 'sad', npcAnim: { child: 'sad' } } }
          ] },
        { label: 'Ở lại nhà cũ, con cháu về thăm',
          text: 'Bạn giữ nếp sống quen. Cuối tuần các con về, căn nhà lại rộn ràng. Bạn thích cái nhịp ấy.',
          effects: { happy: 6, rel: { child: 2 } },
          scene: { anim: 'sit', fx: 'sparkle', npcAnim: { child: 'nod' } } },
        { label: 'Vào viện dưỡng lão có bạn bè', req: { minMoney: 100000000 },
          text: 'Bạn chọn một viện dưỡng lão tử tế ở ngoại thành: có bạn đánh cờ, có người tập dưỡng sinh. Các con áy náy, rồi yên tâm khi thấy bạn vui.',
          effects: { money: -60000000, happy: 8, health: 4, rel: { child: -2 } },
          scene: { loc: 'park', anim: 'wave', fx: 'sparkle', npcAnim: { child: 'wave' } } }
      ]
    },
    {
      id: 'm_grandchild_gaming',
      title: 'Cháu mê game',
      icon: '🎮',
      age: [58, 90],
      req: { has: ['grandchild'], cond: roleAged('grandchild', 9, 17) },
      text: 'Cháu {grandchild} về chơi cả tuần mà mắt dán vào màn hình, gọi ăn cơm năm lần mới "dạ". Bạn đứng sau lưng nửa tiếng vẫn không hiểu mấy người tí hon trong đó đánh nhau vì cái gì.',
      scene: { loc: 'bedroom', time: 'day', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'grandchild', anim: 'type', say: 'Chờ cháu tí, sắp thắng rồi!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Nhờ cháu dạy chơi cùng',
          success: { stat: 'smarts', base: 0.3, scale: 0.4 },
          outcomes: [
            { text: 'Bạn chơi dở tệ nhưng thành "đồng đội" của cháu. Cháu khoe cả lớp là nhà có game thủ U80.', effects: { happy: 10, rel: { grandchild: 15 } }, scene: { anim: 'cheer', fx: 'stars', npcAnim: { grandchild: 'laugh' } } },
            { text: 'Bạn bấm nhầm nút, làm cháu thua ván quan trọng. Cháu giận dỗi, rồi cũng phì cười.', effects: { happy: 4, rel: { grandchild: 4 } }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { grandchild: 'angry' } } }
          ] },
        { label: 'Kéo cháu ra ao câu cá',
          outcomes: [
            { p: 0.5, text: 'Cháu càu nhàu, nhưng lúc câu được con cá rô đầu tiên thì reo như bắt được vàng.', effects: { happy: 8, rel: { grandchild: 8 } }, scene: { loc: 'countryside', anim: 'cheer', fx: 'sparkle', npcAnim: { grandchild: 'jump' } } },
            { p: 0.5, text: 'Cháu giận, gọi điện mách bố mẹ. Cả buổi tối không ai nói với ai câu nào.', effects: { happy: -4, rel: { grandchild: -8 } }, scene: { anim: 'sad', npcAnim: { grandchild: 'cry' } } }
          ] },
        { label: 'Kệ, cháu về chơi thì để cháu vui',
          text: 'Bạn mang đĩa trái cây gọt sẵn vào tận nơi. Cháu thương bạn nhất nhà, nhưng mắt cháu thì ngày càng cận.',
          effects: { rel: { grandchild: 8 }, happy: 2, karma: -1 },
          scene: { anim: 'nod', npcAnim: { grandchild: 'type' } } }
      ]
    },
    {
      id: 'm_grandchild_uni',
      title: 'Cháu đỗ đại học',
      icon: '🎓',
      age: [62, 96],
      weight: 0.8,
      req: { has: ['grandchild'], cond: roleAged('grandchild', 17, 20) },
      text: 'Cháu {grandchild} gọi điện, giọng run run: "Cháu đỗ rồi!" Cháu là đứa đầu tiên trong họ đỗ vào trường y. Cả nhà định mở một bữa tiệc nhỏ.',
      scene: { loc: 'home', time: 'day', anim: 'cheer',
        npcs: [{ role: 'grandchild', anim: 'jump', say: 'Cháu đỗ rồi! Đỗ thật rồi!' }], fx: 'confetti', shot: 'wide' },
      choices: [
        { label: 'Tặng cháu {money:20000000} làm vốn', req: { minMoney: 40000000 },
          text: 'Cháu cầm phong bì, ôm bạn thật chặt. Bạn dặn: "Học thành người tử tế trước, thành tài sau."',
          effects: { money: -20000000, rel: { grandchild: 15 }, happy: 10 },
          scene: { anim: 'hug', fx: 'money', npcAnim: { grandchild: 'hug' } } },
        { label: 'Tặng chiếc đồng hồ cũ của mình',
          text: 'Chiếc đồng hồ bạn đeo từ thời trẻ, vẫn chạy đúng từng giây. Cháu đeo vào, hứa sẽ giữ cả đời.',
          effects: { rel: { grandchild: 12 }, happy: 8 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { grandchild: 'bow' } } },
        { label: 'Mổ gà, nấu xôi mời cả xóm',
          text: 'Cả xóm sang mừng. Cháu ngượng đỏ mặt, còn bạn thì khoe từ đầu ngõ đến cuối ngõ.',
          effects: { money: -5000000, happy: 12, rel: { grandchild: 5 } },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { grandchild: 'facepalm' } } }
      ]
    },
    {
      id: 'm_dentures',
      title: 'Hàm răng giả',
      icon: '🦷',
      age: [65, 98],
      text: 'Chiếc răng hàm cuối cùng đã "nghỉ hưu", bữa cơm giờ chỉ toàn cháo với canh. Nha sĩ tư vấn làm hàm giả, còn ông bạn già thì khoe hàm cấy ghép "nhai được cả xương".',
      scene: { loc: 'hospital', time: 'day', anim: 'think',
        npcs: [{ role: 'doctor', gender: 'f', anim: 'talk', say: 'Làm hàm mới là nhai ngon ngay!' }], fx: 'question', shot: 'close' },
      choices: [
        { label: 'Làm hàm giả tháo lắp',
          text: 'Hàm mới hơi cấn, nhưng tối đó bạn ăn được miếng thịt kho đầu tiên sau nửa năm. Ngon muốn khóc.',
          effects: { money: -5000000, happy: 8, health: 2 },
          scene: { loc: 'home', anim: 'eat', fx: 'sparkle' } },
        { label: 'Cấy ghép cho chắc ăn', req: { minMoney: 80000000 },
          text: 'Đắt xắt ra miếng, nhưng giờ bạn cắn được cả mía. Ông bạn già hết đường khoe.',
          effects: { money: -60000000, happy: 10, health: 3, looks: 3 },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { doctor: 'clap' } } },
        { label: 'Thôi, ăn cháo cũng sống được',
          text: 'Bạn tập yêu cháo: cháo gà, cháo cá, cháo sườn... Thực đơn phong phú bất ngờ, chỉ hơi nhớ vị giòn của bánh đa.',
          effects: { happy: -3, health: -2 },
          scene: { loc: 'home', anim: 'eat', fx: 'steam' } }
      ]
    },
    {
      id: 'm_midautumn',
      title: 'Trung thu cùng cháu',
      icon: '🏮',
      age: [55, 95],
      once: false,
      cooldown: 4,
      req: { has: ['grandchild'] },
      text: 'Đêm rằm tháng Tám, cháu {grandchild} chạy sang khoe chiếc đèn lồng. Bạn chợt nhớ ngày xưa tự tay vót tre, dán giấy bóng kính làm đèn ông sao cho các con.',
      scene: { loc: 'street', time: 'night', decor: 'midautumn', anim: 'wave',
        npcs: [{ role: 'grandchild', anim: 'run', say: 'Đi rước đèn thôi!' }, { role: 'kid', anim: 'jump' }], fx: 'sparkle', shot: 'wide' },
      choices: [
        { label: 'Tự tay làm đèn ông sao cho cháu',
          text: 'Tay bị nan tre cứa mấy đường, nhưng chiếc đèn ông sao đỏ rực. Cháu giơ cao đi khắp xóm, khoe "đèn nhà cháu tự làm đấy!"',
          effects: { happy: 10, rel: { grandchild: 12 } },
          scene: { anim: 'clap', fx: 'sparkle', npcAnim: { grandchild: 'cheer', kid: 'clap' } } },
        { label: 'Bày mâm cỗ bánh nướng bánh dẻo',
          text: 'Mâm cỗ đủ bánh, bưởi, hồng, chuối. Cháu tạo hình con chó bằng múi bưởi, cả nhà cười nghiêng ngả.',
          effects: { money: -800000, happy: 8, rel: { grandchild: 8 } },
          scene: { loc: 'home', anim: 'eat', fx: 'music', npcAnim: { grandchild: 'laugh' } } },
        { label: 'Ngồi hiên ngắm trăng, kể chuyện chú Cuội',
          text: 'Cháu hỏi chú Cuội ở một mình trên trăng có buồn không. Bạn chưa biết trả lời sao, chỉ ôm cháu chặt hơn.',
          effects: { happy: 7, rel: { grandchild: 10 } },
          scene: { anim: 'hug', fx: 'stars', npcAnim: { grandchild: 'hug' } } }
      ]
    },
    {
      id: 'm_blood_pressure',
      title: 'Huyết áp lên xuống',
      icon: '🩸',
      age: [60, 96],
      once: false,
      cooldown: 6,
      text: 'Sáng ra đầu óc quay cuồng, bạn lấy máy đo: 170/100. Con gọi điện hỏi thăm, bạn nói "không sao", rồi ngồi thừ ra trên ghế.',
      scene: { loc: 'home', time: 'dawn', anim: 'sick', expr: 'sick', say: 'Chóng mặt quá...', npcs: [], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Đi viện kiểm tra ngay',
          text: 'Bác sĩ chỉnh lại thuốc, dặn ăn nhạt, bớt lo nghĩ. Bạn về với túi thuốc và một tờ thực đơn toàn rau luộc.',
          effects: { money: -1500000, health: 6, happy: 1, cure: true },
          scene: { loc: 'hospital', anim: 'nod', fx: 'sparkle' } },
        { label: 'Uống thêm viên thuốc, nằm nghỉ',
          outcomes: [
            { p: 0.6, text: 'Huyết áp hạ dần. Bạn tự nhủ phải bỏ cái nết ăn mặn.', effects: { health: -2, happy: -1 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } },
            { p: 0.4, text: 'Đến trưa vẫn không đỡ, con phải chạy về đưa đi cấp cứu. Cả nhà một phen hú vía.', effects: { health: -10, money: -5000000, happy: -6, illness: 'Cao huyết áp' }, scene: { loc: 'hospital', anim: 'sick', fx: 'exclaim' } }
          ] },
        { label: 'Uống nước chanh muối theo lời mách trên mạng',
          text: 'Huyết áp chẳng giảm, mà còn tăng vì muối. Bạn rút ra bài học về các "bác sĩ mạng".',
          effects: { health: -6, happy: -3, smarts: 1, illness: 'Cao huyết áp' },
          scene: { anim: 'facepalm', fx: 'sweat' } }
      ]
    },
    {
      id: 'm_old_couple_walk',
      title: 'Tình già',
      icon: '👴',
      age: [65, 98],
      req: { married: true },
      text: 'Chiều nào hai người cũng nắm tay đi một vòng quanh hồ, bước chậm như đếm. Hôm nay {spouse.k} bạn bỗng dừng lại, hỏi một câu chẳng ai ngờ.',
      scene: { loc: 'park', time: 'dusk', anim: 'walk',
        npcs: [{ role: 'spouse', anim: 'walk', expr: 'love', say: 'Được chọn lại, có lấy tôi nữa không?' }], fx: 'petals', shot: 'wide' },
      choices: [
        { label: 'Có, chọn lại vẫn chọn mình',
          text: 'Bạn nắm chặt tay {spouse.k}. Hai mái đầu bạc lặng im bên hồ, nắng chiều vàng như mật.',
          effects: { rel: { spouse: 15 }, happy: 10 },
          scene: { anim: 'love', fx: 'hearts', npcAnim: { spouse: 'love' } } },
        { label: 'Đùa: "Để suy nghĩ đã"',
          outcomes: [
            { p: 0.6, text: '{spouse.K} bạn đấm nhẹ vào vai, hai người cười như hồi mới yêu.', effects: { rel: { spouse: 8 }, happy: 8 }, scene: { anim: 'laugh', fx: 'hearts', npcAnim: { spouse: 'laugh' } } },
            { p: 0.4, text: '{spouse.K} bạn giận thật, đi về trước. Bạn phải mua chè dỗ cả buổi tối.', effects: { rel: { spouse: -4 }, happy: -2, money: -50000 }, scene: { anim: 'facepalm', fx: 'anger', npcAnim: { spouse: 'angry' } } }
          ] },
        { label: 'Không trả lời, chỉ hát một câu tình ca cũ',
          text: 'Giọng bạn khàn khàn, sai cả lời. {spouse.K} bạn quay mặt đi, lau vội khóe mắt.',
          effects: { rel: { spouse: 14 }, happy: 8 },
          scene: { anim: 'sing', fx: 'music', npcAnim: { spouse: 'cry' } } }
      ]
    },
    {
      id: 'm_tea_morning',
      title: 'Ấm trà buổi sớm',
      icon: '🍵',
      age: [60, 100],
      once: false,
      cooldown: 4,
      text: 'Sáng sớm, bạn pha ấm trà sen, ngồi bên hiên nghe chim hót. Ông hàng xóm sang chơi, mang theo gói trà mới "hàng tuyển" và một bụng chuyện trong phường.',
      scene: { loc: 'home', time: 'dawn', anim: 'drink',
        npcs: [{ role: 'neighbor', gender: 'm', age: 75, anim: 'drink', say: 'Trà này phải pha nước 90 độ nhé!' }], fx: 'steam', shot: 'close' },
      choices: [
        { label: 'Ngồi đàm đạo đến trưa',
          text: 'Từ chuyện giá vàng đến chuyện cây sấu trước cổng, hai người nói không biết chán. Ấm trà nhạt dần, câu chuyện thì đậm dần.',
          effects: { happy: 7 },
          scene: { anim: 'laugh', fx: 'music', npcAnim: { neighbor: 'laugh' } } },
        { label: 'Thách nhau nếm trà đoán vùng',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Bạn đoán trúng ba lần liên tiếp. Ông hàng xóm phục lăn, hứa mai mang trà ngon hơn sang.', effects: { happy: 8, smarts: 2 }, scene: { anim: 'cheer', fx: 'stars', npcAnim: { neighbor: 'clap' } } },
            { text: 'Bạn khen "trà vùng cao thượng hạng", hóa ra là trà túi lọc của đứa cháu.', effects: { happy: 4 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { neighbor: 'laugh' } } }
          ] },
        { label: 'Mời thêm mấy cụ quanh xóm',
          text: 'Hiên nhà bạn thành "câu lạc bộ trà sáng", cười nói rôm rả. Có bạn, tuổi già như đi chậm lại.',
          effects: { happy: 8, karma: 3 },
          scene: { anim: 'clap', fx: 'music', npcAnim: { neighbor: 'nod' } } }
      ]
    },
    {
      id: 'm_old_photos',
      title: 'Album ảnh cũ',
      icon: '📷',
      age: [55, 100],
      once: false,
      cooldown: 8,
      text: 'Dọn tủ, bạn tìm thấy cuốn album ảnh đen trắng đã ố vàng. Ảnh bạn tuổi đôi mươi: quần ống loe, tóc bồng bềnh, cười ngạo nghễ như thể cả thế giới là của mình.',
      scene: { loc: 'bedroom', time: 'day', anim: 'study', expr: 'happy', say: 'Trời, hồi đó mình đẹp thế!', npcs: [], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Nhờ con cháu phục chế ảnh',
          text: 'Tấm ảnh được phục chế, in khổ lớn treo phòng khách. Khách đến chơi ai cũng hỏi "diễn viên nào đây?"',
          effects: { happy: 8, money: -500000 },
          scene: { loc: 'home', anim: 'laugh', fx: 'stars' } },
        { label: 'Ngồi xem một mình, nhớ người xưa',
          text: 'Mỗi tấm ảnh là một người đã đi xa. Bạn ngồi đến tối, khép album lại, lòng vừa buồn vừa ấm.',
          effects: { happy: 1, karma: 1 },
          scene: { time: 'dusk', anim: 'sad', fx: 'tears' } },
        { label: 'Đăng ảnh lên mạng thách bạn bè đoán',
          text: 'Bạn cũ vào bình luận rần rần, có người còn nhận ra chính mình trong ảnh. Một nhóm bạn xưa được nối lại.',
          effects: { happy: 9 },
          scene: { anim: 'phone', fx: 'hearts' } }
      ]
    },
    // ─────────────────────────── HIẾM & KỲ LẠ ───────────────────────────
    {
      id: 'm_lottery_dream',
      title: 'Giấc mơ con rắn trắng',
      icon: '🐍',
      age: [40, 100],
      weight: 0.3,
      once: false,
      cooldown: 10,
      text: 'Đêm qua bạn mơ thấy một con rắn trắng cuộn tròn trên nóc tủ, nhìn bạn rồi đọc rõ từng con số. Sáng ra, bà bán vé số quen ghé ngang cổng như có ai sắp đặt.',
      scene: { loc: 'street', time: 'day', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'vendor', gender: 'f', age: 60, anim: 'wave', say: 'Mua giùm tờ vé số đi cô chú ơi!' }], fx: 'idea', shot: 'close' },
      choices: [
        { label: 'Mua đúng số trong mơ, mười tờ',
          outcomes: [
            { p: 0.04, text: 'TRÚNG ĐẶC BIỆT! Bạn ngồi phịch xuống bậc cửa, tim đập như trống hội. Con rắn trong mơ được cả nhà thắp hương cảm tạ.', effects: { money: 2000000000, happy: 25 }, scene: { anim: 'jump', fx: ['money', 'fireworks'], shot: 'orbit', npcAnim: { vendor: 'cheer' } } },
            { p: 0.26, text: 'Trúng giải an ủi! Đủ tiền mời cả xóm chè đỗ đen.', effects: { money: 1500000, happy: 6 }, scene: { anim: 'cheer', fx: 'money', npcAnim: { vendor: 'clap' } } },
            { p: 0.7, text: 'Trượt sạch. Con rắn trong mơ hóa ra đọc số của tỉnh khác.', effects: { money: -100000, happy: -2 }, scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { vendor: 'shrug' } } }
          ] },
        { label: 'Mua giúp bà một tờ cho vui',
          text: 'Bạn mua vì thương bà đứng nắng. Không trúng, nhưng bà cười móm mém cảm ơn mãi.',
          effects: { money: -10000, karma: 3, happy: 2 },
          scene: { anim: 'nod', fx: 'hearts', npcAnim: { vendor: 'bow' } } },
        { label: 'Mơ là mơ, kể cho hội bạn nghe',
          text: 'Bạn kể giấc mơ cho mấy người bạn. Mỗi người giải một kiểu, cãi nhau đến tận trưa.',
          effects: { happy: 4 },
          scene: { loc: 'cafe', anim: 'laugh', fx: 'question' } }
      ]
    },
    {
      id: 'm_viral_dance',
      title: 'Nổi tiếng bất đắc dĩ',
      icon: '🕺',
      age: [60, 95],
      weight: 0.3,
      text: 'Một bạn trẻ quay lại cảnh bạn nhảy dân vũ ở công viên, đăng lên mạng với dòng "phong độ tuổi {age}". Sáng ra clip đạt hai triệu lượt xem, có người còn tìm đến xin chụp ảnh chung.',
      scene: { loc: 'park', time: 'day', anim: 'dance',
        npcs: [{ role: 'crowd', anim: 'phone' }, { role: 'stranger', gender: 'f', age: 22, anim: 'wave', say: 'Cho cháu chụp chung một kiểu ạ!' }], fx: 'stars', shot: 'orbit' },
      choices: [
        { label: 'Tận hưởng, nhận lời quay thêm clip',
          text: 'Bạn thành người nổi tiếng của phường, một cơ sở dầu gió địa phương mời quay quảng cáo. Tiền ít, vui nhiều.',
          effects: { money: 10000000, happy: 14, looks: 2 },
          scene: { anim: 'dance', fx: ['music', 'stars'], npcAnim: { stranger: 'cheer' } } },
        { label: 'Ngượng, nhờ người ta gỡ clip',
          text: 'Clip được gỡ, nhưng mạng thì không quên. Ra chợ vẫn có người chỉ trỏ: "Phải người nhảy trong clip không?"',
          effects: { happy: -2 },
          scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'shrug' } } },
        { label: 'Mở lớp dạy nhảy miễn phí cho người già',
          text: 'Lớp của bạn đông dần, mỗi sáng ba chục người. Bạn chẳng còn nổi tiếng nữa, nhưng có thêm ba chục người bạn.',
          effects: { karma: 10, happy: 12, health: 4 },
          scene: { anim: 'clap', fx: 'music', npcAnim: { crowd: 'dance', stranger: 'dance' } } }
      ]
    },
    {
      id: 'm_stray_dog',
      title: 'Vị khách bốn chân',
      icon: '🐕',
      age: [45, 92],
      weight: 0.35,
      req: { lacks: ['pet'] },
      text: 'Một con chó vàng gầy nhom lẽo đẽo theo bạn từ chợ về tận nhà, nằm chờ trước cổng cả buổi chiều. Bạn bước ra, nó vẫy đuôi như đã quen bạn từ kiếp trước.',
      scene: { loc: 'street', time: 'dusk', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', kind: 'dog', anim: 'sit' }], fx: 'question', shot: 'low' },
      choices: [
        { label: 'Nhận nuôi luôn',
          text: 'Bạn tắm cho nó, cho ăn bát cơm chan canh. Từ hôm đó, sáng nào nó cũng lon ton theo bạn ra công viên.',
          effects: { happy: 10, karma: 6, addPerson: { role: 'pet', fromScene: 'stranger', kind: 'dog' } },
          scene: { anim: 'cheer', fx: 'hearts', npcAnim: { stranger: 'cheer' } } },
        { label: 'Cho ăn rồi đăng tin tìm chủ',
          outcomes: [
            { p: 0.5, text: 'Hai hôm sau chủ nó tìm đến, cảm ơn rối rít, biếu bạn hộp bánh.', effects: { karma: 6, happy: 4 }, scene: { anim: 'wave', fx: 'sparkle', npcAnim: { stranger: 'run' } } },
            { p: 0.5, text: 'Không ai nhận. Ngày nào nó cũng ngồi trước cổng. Cuối cùng bạn mở cổng cho nó vào nhà.', effects: { karma: 5, happy: 8, addPerson: { role: 'pet', fromScene: 'stranger', kind: 'dog' } }, scene: { anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'jump' } } }
          ] },
        { label: 'Đuổi đi, nuôi chó mệt lắm',
          text: 'Con chó cụp đuôi bỏ đi, ngoái lại nhìn mấy lần. Tối đó bạn thấy hơi áy náy.',
          effects: { karma: -4, happy: -2 },
          scene: { anim: 'shake', npcAnim: { stranger: 'walk' } } }
      ]
    },
    {
      id: 'm_tv_gameshow',
      title: 'Lên truyền hình',
      icon: '📺',
      age: [60, 90],
      weight: 0.3,
      text: 'Đài truyền hình mời bạn tham gia một gameshow đố vui dành cho người cao tuổi. Câu hỏi cuối cùng, trị giá {money:50000000}: "Năm 1986, giá một bát phở ở Hà Nội là bao nhiêu?"',
      scene: { loc: 'office', time: 'night', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'm', age: 35, anim: 'point', say: 'Câu hỏi cuối! Bác chắc chưa ạ?' }, { role: 'crowd', anim: 'clap' }], fx: 'question', shot: 'dramatic' },
      choices: [
        { label: 'Lục lại trí nhớ, trả lời chắc nịch',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Chính xác! Pháo giấy bay đầy trường quay, bạn ôm tấm séc khổng lồ mà tay run run.', effects: { money: 50000000, happy: 15 }, scene: { anim: 'jump', fx: ['confetti', 'money'], npcAnim: { stranger: 'clap', crowd: 'cheer' } } },
            { text: 'Sai một chút thôi. Bạn ra về với phần quà khuyến khích và một bụng chuyện kể cả năm.', effects: { money: 2000000, happy: 6 }, scene: { anim: 'laugh', fx: 'sweat', npcAnim: { crowd: 'clap' } } }
          ] },
        { label: 'Dừng cuộc chơi, giữ tiền thưởng',
          text: 'Bạn mang về {money:20000000} và lời khen "biết điểm dừng". Đáp án hóa ra đúng như bạn nghĩ, nhưng thôi.',
          effects: { money: 20000000, happy: 6 },
          scene: { anim: 'bow', fx: 'money', npcAnim: { stranger: 'nod' } } },
        { label: 'Kể chuyện bát phở năm ấy thay cho đáp án',
          text: 'Bạn kể say sưa về bát phở đầu tiên ăn cùng người thương. Cả trường quay lặng đi rồi vỗ tay. Đoạn đó được chiếu lại nhiều nhất.',
          effects: { happy: 10, karma: 2 },
          scene: { anim: 'talk', fx: 'hearts', npcAnim: { crowd: 'clap', stranger: 'cry' } } }
      ]
    },
    {
      id: 'm_centenarian',
      title: 'Bí quyết sống lâu',
      icon: '💯',
      age: [93, 100],
      weight: 0.5,
      text: 'Đài truyền hình tỉnh về quay phóng sự "Những cụ già sống thọ". Phóng viên trẻ chìa micro, cả nhà nín thở chờ câu trả lời của bạn.',
      scene: { loc: 'home', time: 'day', anim: 'sit',
        npcs: [{ role: 'stranger', gender: 'f', age: 25, anim: 'talk', say: 'Bí quyết sống lâu của cụ là gì ạ?' }, { role: 'crowd', anim: 'idle' }], fx: 'question', shot: 'close' },
      choices: [
        { label: '"Ăn ít, ngủ sớm, không giận ai"',
          text: 'Câu trả lời giản dị được phát trên bản tin tối. Con cháu chép lại, dán lên tủ lạnh.',
          effects: { happy: 10, karma: 3 },
          scene: { anim: 'nod', fx: 'sparkle', npcAnim: { stranger: 'nod' } } },
        { label: '"Mỗi tối nhấp một chén rượu thuốc"',
          text: 'Cả nhà giật mình. Phóng sự cắt đoạn ấy, nhưng clip hậu trường thì lan khắp mạng.',
          effects: { happy: 8 },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { stranger: 'laugh', crowd: 'facepalm' } } },
        { label: '"Bí quyết là... đừng có chết"',
          text: 'Phóng viên cười gập người. Câu nói thành câu cửa miệng của cả xã.',
          effects: { happy: 12 },
          scene: { anim: 'laugh', fx: 'confetti', npcAnim: { all: 'laugh' } } }
      ]
    }
  );
})();
