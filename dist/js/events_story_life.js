/* Một Kiếp Người — ngoại truyện: đời thường phiêu lưu (SPEC §5.1) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    // ======================= ARC 1: NỔI TIẾNG TRÊN MẠNG =======================
    {
      id: 's_life_viral_phong_van', title: 'Câu nói triệu view', icon: '🎤', age: [16, 45], weight: 1.2,
      req: { notFlag: 's_life_viral' },
      text: 'Trưa 39 độ, bạn đang đứng chờ đèn đỏ thì một nhóm làm nội dung chìa micro hỏi: “Trời nóng vầy bạn thấy sao?” Bạn lau mồ hôi, buột miệng: “Nóng tới mức cục đá trong ly trà đá cũng xin nghỉ phép!” Ba ngày sau, câu đó thành âm thanh trend trên TikTok với hơn 5 triệu lượt dùng.',
      scene: { loc: 'street', time: 'day', weather: 'clear', decor: null, anim: 'talk', expr: 'surprised', say: 'Cục đá cũng xin nghỉ phép!',
        npcs: [{ role: 'stranger', gender: 'f', age: 24, anim: 'laugh', say: 'Trời ơi, quá đỉnh luôn!' }, { role: 'crowd', anim: 'phone' }], fx: 'exclaim', shot: 'close' },
      choices: [
        { label: 'Lập kênh, quay tiếp series “than nóng”',
          success: { stat: 'looks', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Video thứ hai đạt 2 triệu view, kênh vọt lên 300 nghìn người theo dõi. Ra đường bắt đầu có người chỉ trỏ: “Ủa, cục đá xin nghỉ phép kìa!”',
              effects: { happy: 10, looks: 2, flag: ['s_life_viral', 's_life_viral_kenh'], followUp: { id: 's_life_viral_quang_cao', delay: 0 } },
              scene: { anim: 'cheer', fx: 'stars', npcAnim: { crowd: 'clap', stranger: 'clap' } } },
            { text: 'Video thứ hai được... 312 view, 200 trong số đó là bạn tự xem lại. Nhưng nhờ cái trend cũ, tài khoản vẫn kịp có 80 nghìn người theo dõi.',
              effects: { happy: 2, flag: ['s_life_viral', 's_life_viral_kenh'], followUp: { id: 's_life_viral_quang_cao', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { stranger: 'shrug' } } }
          ] },
        { label: 'Mặc kệ, mạng xã hội mau quên lắm',
          text: 'Bạn tắt thông báo, sống tiếp như chưa có gì xảy ra. Chỉ có điều bà bán xôi đầu hẻm giờ gọi bạn là “cục đá” và lần nào cũng cho thêm nhúm hành phi.',
          effects: { happy: 3, flag: 's_life_viral' },
          scene: { loc: 'market', anim: 'laugh', fx: 'question' } },
        { label: 'Đòi nhóm quay phim trả tiền bản quyền',
          outcomes: [
            { p: 0.4, text: 'Nhóm kia vui vẻ chuyển khoản {money:3000000} kèm lời mời hợp tác lâu dài. Lần đầu tiên bạn kiếm được tiền nhờ... cái miệng của mình.',
              effects: { money: 3000000, happy: 5, flag: ['s_life_viral', 's_life_viral_kenh'], followUp: { id: 's_life_viral_quang_cao', delay: 0 } },
              scene: { anim: 'phone', fx: 'money', npcAnim: { stranger: 'nod' } } },
            { p: 0.6, text: 'Họ trả lời bằng một biểu tượng cười rồi chặn bạn. Dân mạng chia phe cãi nhau ầm ĩ, tên bạn càng nổi, mà nổi theo kiểu không hay lắm.',
              effects: { happy: -3, flag: ['s_life_viral', 's_life_viral_kenh'], followUp: { id: 's_life_viral_boc_phot', delay: 1 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { stranger: 'laugh' } } }
          ] },
        { label: 'In áo thun câu nói, bán trên Shopee',
          outcomes: [
            { p: 0.5, text: 'Tám trăm chiếc áo “Cục đá xin nghỉ phép” bán sạch trong một tuần, bạn lời {money:12000000}. Hàng xóm mặc, shipper mặc, cả thầy dạy thêm cũng mặc.',
              effects: { money: 12000000, happy: 7, smarts: 1, flag: ['s_life_viral', 's_life_viral_kenh'], followUp: { id: 's_life_viral_quang_cao', delay: 1 } },
              scene: { anim: 'cheer', fx: 'money' } },
            { p: 0.5, text: 'Áo vừa lên kệ thì hàng nhái tràn khắp các sàn, rẻ hơn một nửa. Bạn ôm 300 chiếc áo tồn, lỗ {money:4000000}, mặc thay đồ ngủ đến hết đời.',
              effects: { money: -4000000, happy: -4, flag: 's_life_viral' },
              scene: { loc: 'home', anim: 'facepalm', fx: 'sweat' } }
          ] }
      ]
    },
    {
      id: 's_life_viral_quang_cao', title: 'Hộp thư đầy lời mời', icon: '📩', age: [16, 46], chainOnly: true,
      req: { flag: 's_life_viral_kenh' },
      text: 'Hộp thư của bạn ngập tin nhắn “Hợp tác nha!”. Một hãng trà sữa mời quay clip với giá {money:15000000}. Cùng lúc, một bên bán “kem trộn trắng da cấp tốc” trả hẳn {money:120000000} cho ba video, kèm lời dặn: “Cứ nói là dùng thấy trắng liền nha.”',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'phone', expr: 'surprised',
        npcs: [{ role: 'stranger', gender: 'f', age: 28, anim: 'talk', say: 'Bên em làm hợp đồng liền nha!' }], fx: 'money', shot: 'close' },
      choices: [
        { label: 'Nhận trà sữa, quay cho tử tế',
          text: 'Bạn uống thử bảy ly, chọn đúng vị mình thích rồi mới quay. Clip vừa vui vừa thật, nhãn hàng ký tiếp hợp đồng ba tháng, tổng cộng {money:45000000}.',
          effects: { money: 45000000, happy: 6, karma: 3, flag: 's_life_viral_qc_sach', followUp: { id: 's_life_viral_boc_phot', delay: 1 } },
          scene: { anim: 'drink', fx: 'sparkle', npcAnim: { stranger: 'clap' } } },
        { label: 'Nhận kem trộn, tiền là tiền',
          text: 'Ba video ra lò, tài khoản nhận {money:120000000}. Bình luận toàn hỏi “Kem này mua ở đâu?”. Bạn cười, cố không nghĩ tới hai chữ “cấp tốc”.',
          effects: { money: 120000000, karma: -10, happy: 3, flag: 's_life_viral_qc_ban', followUp: { id: 's_life_viral_boc_phot', delay: 1 } },
          scene: { anim: 'laugh', fx: 'money', npcAnim: { stranger: 'laugh' } } },
        { label: 'Từ chối hết, chỉ làm nội dung vui',
          outcomes: [
            { p: 0.5, text: 'Không quảng cáo, kênh tăng chậm nhưng ai cũng quý. Một tờ báo viết về bạn với tựa đề: “Người làm nội dung sạch hiếm hoi”.',
              effects: { happy: 5, karma: 5, smarts: 1, followUp: { id: 's_life_viral_nga_ba', delay: 2 } },
              scene: { anim: 'type', fx: 'sparkle', npcAnim: { stranger: 'shrug' } } },
            { p: 0.5, text: 'Không có thu nhập, bạn quay clip tới hai giờ sáng mà cuối tháng vẫn âm tiền mạng, tiền điện, tiền đèn livestream. Bắt đầu thấy mệt.',
              effects: { happy: -4, health: -3, money: -5000000, followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
              scene: { loc: 'bedroom', time: 'night', anim: 'sleep', fx: 'zzz' } }
          ] },
        { label: 'Đòi giá gấp đôi cho “xứng tầm”',
          success: { stat: 'looks', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Nhãn hàng xuống tiền ngay {money:30000000} cho đúng một clip. Lần đầu tiên bạn thấy mình “có giá”.',
              effects: { money: 30000000, happy: 6, flag: 's_life_viral_qc_sach', followUp: { id: 's_life_viral_boc_phot', delay: 1 } },
              scene: { anim: 'cheer', fx: 'money', npcAnim: { stranger: 'nod' } } },
            { text: 'Họ “đã xem” rồi chuyển sang mời một bạn khác vừa nổi tuần trước. Trend trôi qua còn nhanh hơn bạn tưởng.',
              effects: { happy: -5, followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
              scene: { anim: 'sad', fx: 'question', npcAnim: { stranger: 'walk' } } }
          ] }
      ]
    },
    {
      id: 's_life_viral_boc_phot', title: 'Bị bóc phốt', icon: '🔥', age: [17, 50], chainOnly: true,
      req: { flag: 's_life_viral' },
      text: 'Sáng ngủ dậy, điện thoại nóng ran: một trang chuyên “bóc phốt” đăng bài dài 3.000 chữ về bạn, kèm ảnh chụp bình luận cũ từ hồi lớp 9 và một clip bị cắt ghép. Dưới bài là 20 nghìn bình luận, đa số chưa đọc hết đã chửi.',
      scene: { loc: 'bedroom', time: 'dawn', weather: 'cloudy', anim: 'phone', expr: 'scared', npcs: [], fx: 'anger', shot: 'dramatic' },
      choices: [
        { label: 'Livestream xin lỗi, trả lại tiền quảng cáo kem', req: { flag: 's_life_viral_qc_ban' },
          text: 'Bạn lên live mặt mộc, cúi đầu nhận sai, chuyển toàn bộ {money:120000000} tiền quảng cáo vào quỹ hỗ trợ người bị kích ứng da. Người ta vẫn chửi, nhưng tiếng chửi nhỏ dần.',
          effects: { money: -120000000, karma: 12, happy: -6, unflag: 's_life_viral_qc_ban', followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
          scene: { anim: 'bow', fx: 'tears' } },
        { label: 'Đăng bài đính chính kèm bằng chứng',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn đăng clip gốc dài nguyên vẹn và lời xác nhận của bạn học cũ. Cư dân mạng quay xe nhanh như lúc chửi: “Thương bạn ấy quá!”',
              effects: { happy: 8, karma: 3, smarts: 2, followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
              scene: { anim: 'cheer', fx: 'sparkle' } },
            { text: 'Bài đính chính bị soi ra lỗi chính tả, thành drama mới: “Đã sai còn cãi”. Bạn tắt máy, trùm chăn nằm cả ngày.',
              effects: { happy: -10, health: -3, followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
              scene: { anim: 'cry', fx: 'tears' } }
          ] },
        { label: 'Thuê công ty xử lý khủng hoảng',
          text: 'Một công ty truyền thông báo giá {money:80000000} để “gỡ bài, đẩy tin tích cực”. Hai tuần sau, phốt chìm xuống. Ví của bạn cũng vậy.',
          effects: { money: -80000000, happy: 2, followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
          scene: { loc: 'office', time: 'day', anim: 'sit', fx: 'money' } },
        { label: 'Khóa bình luận, trốn lên Đà Lạt',
          text: 'Bạn khóa bình luận, đặt phòng homestay Đà Lạt một tuần không mạng. Lúc quay về, dân mạng đã kéo nhau đi chửi người khác.',
          effects: { happy: 4, money: -8000000, followUp: { id: 's_life_viral_nga_ba', delay: 1 } },
          scene: { loc: 'countryside', time: 'day', weather: 'fog', anim: 'walk', fx: 'petals' } }
      ]
    },
    {
      id: 's_life_viral_nga_ba', title: 'Ngã ba mạng xã hội', icon: '📱', age: [17, 52], chainOnly: true,
      req: { flag: 's_life_viral' },
      text: 'Đã hơn một năm kể từ câu nói “cục đá xin nghỉ phép”. Kênh của bạn vẫn còn đông người theo dõi, nhưng sáng nào mở mắt ra cũng phải nghĩ “hôm nay đăng gì?”. Một công ty quản lý KOL mời bạn ký hợp đồng ba năm, còn người nhà thì bảo: “Sống đời thật đi.”',
      scene: { loc: 'cafe', time: 'dusk', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'boss', gender: 'm', age: 38, anim: 'talk', say: 'Ký đi, sang năm em là hot KOL!' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Ký hợp đồng, làm KOL toàn thời gian', req: { stage: ['adult'] },
          success: { stat: 'looks', base: 0.35, scale: 0.5 },
          outcomes: [
            { text: 'Bạn bỏ việc cũ, quay show, chạy sự kiện, livestream bán hàng. Thu nhập tháng đầu bằng cả năm lương trước kia. Tài khoản của bạn giờ có tích xanh.',
              effects: { job: { hire: 'streamer' }, money: 150000000, happy: 10, looks: 3, flag: 's_life_viral_kol' },
              scene: { anim: 'cheer', fx: 'confetti', npcAnim: { boss: 'clap' } } },
            { text: 'Hợp đồng toàn điều khoản phạt. Sau sáu tháng làm việc như cái máy, bạn phải đền {money:200000000} để được thoát ra. Bài học đắt giá về một chữ ký.',
              effects: { money: -200000000, happy: -10, health: -5, flag: 's_life_viral_bo' },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { boss: 'shrug' } } }
          ] },
        { label: 'Xóa app, sống đời thật',
          text: 'Bạn đăng bài cảm ơn cuối cùng rồi xóa sạch ứng dụng. Tuần đầu tay cứ vô thức đi tìm điện thoại. Tuần thứ ba, bạn đọc hết một cuốn sách và ngủ đủ tám tiếng.',
          effects: { happy: 8, health: 5, smarts: 3, flag: 's_life_viral_bo' },
          scene: { loc: 'park', anim: 'sit', fx: 'sparkle', npcAnim: { boss: 'shake' } } },
        { label: 'Giữ kênh làm nghề tay trái',
          text: 'Mỗi tuần một clip, không ép mình chạy theo trend. Thu nhập phụ đều đặn {money:40000000} một năm, đủ trả tiền trà sữa và thỉnh thoảng một chuyến đi chơi.',
          effects: { money: 40000000, happy: 5, flag: 's_life_viral_tay_trai' },
          scene: { anim: 'type', fx: 'idea', npcAnim: { boss: 'shrug' } } },
        { label: 'Dùng tiếng tăm để gây quỹ từ thiện',
          text: 'Bạn tự bỏ trước {money:30000000}, rồi dùng kênh kêu gọi xây lại lớp học cho một điểm trường vùng cao. Người xem góp gấp mười lần. Lần đầu tiên, mấy triệu lượt xem có ý nghĩa thật sự.',
          effects: { money: -30000000, karma: 15, happy: 8, flag: 's_life_viral_tu_thien' },
          scene: { loc: 'countryside', anim: 'wave', fx: 'hearts', npcAnim: { boss: 'clap' } } }
      ]
    },
    // ======================= ARC 2: THÚ CƯNG =======================
    {
      id: 's_life_pet_nhat', title: 'Cún con trong thùng giấy', icon: '🐶', age: [10, 60], weight: 1.2,
      req: { lacks: ['pet'], notFlag: 's_life_pet' },
      text: 'Chiều mưa tầm tã, đi ngang gầm cầu gần chợ, bạn nghe tiếng ư ử trong một thùng mì tôm ướt sũng. Bên trong là một chú cún con lông vàng gầy nhom, run cầm cập, cổ còn buộc sợi dây thun đỏ. Nó ngước lên nhìn bạn bằng đôi mắt tròn xoe như hai hạt nhãn.',
      scene: { loc: 'street', time: 'dusk', weather: 'rain', anim: 'think', expr: 'sad',
        npcs: [{ role: 'stranger', kind: 'dog', anim: 'sit' }, { role: 'vendor', gender: 'f', age: 55, anim: 'shake', say: 'Ai bỏ nó ở đây từ sáng rồi.' }], fx: 'tears', shot: 'low' },
      choices: [
        { label: 'Ôm về nhà, đặt tên, nuôi luôn',
          text: 'Bạn cởi áo khoác quấn nó lại rồi chạy một mạch về nhà. Tắm nước ấm, ăn chén cháo, chú cún ngủ khò trong lòng bạn. Từ nay nhà có thêm một thành viên bốn chân.',
          effects: { happy: 10, karma: 6, money: -300000, flag: 's_life_pet', addPerson: { role: 'pet', fromScene: 'stranger', kind: 'dog' }, followUp: { id: 's_life_pet_om', delay: 1 } },
          scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'sleep', vendor: 'clap' } } },
        { label: 'Đăng nhóm cứu hộ tìm người nhận nuôi',
          outcomes: [
            { p: 0.6, text: 'Một nhóm cứu hộ đến đón, hai tuần sau bé có gia đình mới. Họ gửi ảnh bé mập ú, bạn xem đi xem lại cả chục lần.',
              effects: { happy: 5, karma: 6, flag: 's_life_pet' },
              scene: { anim: 'phone', fx: 'sparkle', npcAnim: { stranger: 'jump' } } },
            { p: 0.4, text: 'Không ai nhận. Ba ngày ở tạm nhà bạn, nó đã học được cách nằm chờ bạn trước cửa. Thôi thì... ở lại luôn.',
              effects: { happy: 8, karma: 5, money: -300000, flag: 's_life_pet', addPerson: { role: 'pet', fromScene: 'stranger', kind: 'dog' }, followUp: { id: 's_life_pet_om', delay: 1 } },
              scene: { loc: 'home', anim: 'laugh', fx: 'hearts', npcAnim: { stranger: 'cheer' } } }
          ] },
        { label: 'Để lại hộp sữa rồi đi',
          text: 'Bạn đặt hộp sữa và mấy cái bánh vào thùng, che thêm tấm bìa cho khỏi ướt. Đi được một đoạn vẫn nghe tiếng ư ử sau lưng. Tối đó bạn ngủ không ngon.',
          effects: { karma: 2, happy: -3, money: -30000, flag: 's_life_pet' },
          scene: { anim: 'walk', fx: 'tears', npcAnim: { stranger: 'sit', vendor: 'shake' } } }
      ]
    },
    {
      id: 's_life_pet_om', title: 'Bé bị ốm', icon: '🏥', age: [11, 70], chainOnly: true,
      req: { has: ['pet'] },
      text: 'Sáng nay {pet} không thèm đụng tới chén cơm, nằm lả bên chân bàn, nôn cả ra bọt vàng. Bác sĩ thú y lắc đầu: “Bé bị Parvo rồi, phải truyền dịch, nằm viện ít nhất một tuần, chi phí tầm {money:6000000}.”',
      scene: { loc: 'hospital', time: 'day', weather: 'cloudy', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'pet', anim: 'sleep' }, { role: 'doctor', gender: 'm', age: 40, anim: 'shake', say: 'Phải nằm viện thôi, để lâu nguy lắm.' }], fx: 'sick', shot: 'close' },
      choices: [
        { label: 'Chữa bằng mọi giá',
          outcomes: [
            { p: 0.8, text: 'Bảy ngày truyền dịch, chiều nào bạn cũng ghé thăm. Sáng ngày thứ tám, {pet} vẫy đuôi lia lịa, liếm khắp mặt bạn. Tiền mất, nhưng bé còn.',
              effects: { money: -6000000, happy: 8, rel: { pet: 15 }, flag: 's_life_pet_benh', followUp: { id: 's_life_pet_lac', delay: 2 } },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { pet: 'cheer', doctor: 'clap' } } },
            { p: 0.2, text: 'Bệnh trở nặng, phải điều trị thêm {money:3000000} nữa. Cuối cùng {pet} cũng qua khỏi, gầy trơ xương nhưng ánh mắt vẫn tinh nghịch như cũ.',
              effects: { money: -9000000, happy: 4, rel: { pet: 15 }, flag: 's_life_pet_benh', followUp: { id: 's_life_pet_lac', delay: 2 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { pet: 'sit', doctor: 'nod' } } }
          ] },
        { label: 'Đăng Facebook kêu gọi giúp đỡ',
          outcomes: [
            { p: 0.6, text: 'Bài đăng kèm ảnh {pet} truyền dịch được chia sẻ hai nghìn lần. Người lạ góp đủ viện phí chỉ trong một đêm. Bạn khóc vì lòng tốt của thiên hạ.',
              effects: { happy: 8, karma: 3, rel: { pet: 10 }, followUp: { id: 's_life_pet_lac', delay: 2 } },
              scene: { anim: 'phone', fx: 'hearts', npcAnim: { pet: 'sit' } } },
            { p: 0.4, text: 'Vài người góp, vài người vào chửi “nuôi không nổi thì đừng nuôi”. Bạn tự bù phần còn thiếu {money:4000000}, nuốt cục tức xuống bụng.',
              effects: { money: -4000000, happy: -3, rel: { pet: 10 }, followUp: { id: 's_life_pet_lac', delay: 2 } },
              scene: { anim: 'angry', fx: 'anger', npcAnim: { pet: 'sleep' } } }
          ] },
        { label: 'Mang về tự chăm theo mẹo trên mạng',
          outcomes: [
            { p: 0.45, text: 'Bạn thức trắng ba đêm, đút từng thìa nước đường muối. Kỳ diệu thay, {pet} gượng dậy được. Bạn sụt hai ký, bé lên một ký.',
              effects: { money: -500000, health: -4, happy: 6, rel: { pet: 20 }, followUp: { id: 's_life_pet_lac', delay: 2 } },
              scene: { loc: 'home', time: 'night', anim: 'sit', fx: 'sparkle', npcAnim: { pet: 'jump' } } },
            { p: 0.55, text: 'Mẹo trên mạng không cứu được. Ngày thứ ba bạn phải ôm {pet} quay lại phòng khám, lúc này bệnh nặng hơn và tốn gần gấp đôi.',
              effects: { money: -10000000, happy: -6, rel: { pet: 5 }, followUp: { id: 's_life_pet_lac', delay: 2 } },
              scene: { anim: 'facepalm', fx: 'sweat', npcAnim: { pet: 'sleep', doctor: 'shake' } } }
          ] }
      ]
    },
    {
      id: 's_life_pet_lac', title: 'Bé đi lạc', icon: '📄', age: [12, 75], chainOnly: true,
      req: { has: ['pet'] },
      text: 'Đêm giao thừa, pháo hoa nổ đì đùng, cánh cổng lại quên khóa. Sáng mùng Một, cái ổ của {pet} trống trơn, chén cơm còn nguyên. Bạn đi khắp hẻm gọi tên đến khản cổ, chỉ có chó nhà khác sủa đáp lại.',
      scene: { loc: 'street', time: 'dawn', weather: 'cloudy', decor: 'tet', anim: 'run', expr: 'scared', say: '{pet} ơi! Về đây!',
        npcs: [{ role: 'neighbor', gender: 'f', age: 50, anim: 'point', say: 'Tối qua thấy nó chạy ra đầu hẻm.' }], fx: 'exclaim', shot: 'wide' },
      choices: [
        { label: 'In 500 tờ rơi, treo thưởng {money:5000000}',
          outcomes: [
            { p: 0.65, text: 'Ba ngày sau, chị bán hủ tiếu gọi: “Con chó giống trong hình đang nằm trước quán chị!” Bạn phóng xe tới, {pet} lao vào lòng bạn, ư ử như trách sao giờ mới tới.',
              effects: { money: -5500000, happy: 15, rel: { pet: 20 }, flag: 's_life_pet_tim_thay' },
              scene: { loc: 'market', anim: 'hug', fx: 'hearts', npcAnim: { neighbor: 'clap' } } },
            { p: 0.35, text: 'Tờ rơi dán kín cột điện, điện thoại reo liên tục nhưng toàn chó nhà khác, có cả kẻ gọi lừa đòi chuyển khoản trước. {pet} không về nữa.',
              effects: { money: -1500000, happy: -15, removePerson: 'pet', flag: 's_life_pet_mat', followUp: { id: 's_life_pet_tin_nhan', delay: 1 } },
              scene: { anim: 'cry', fx: 'tears', npcAnim: { neighbor: 'sad' } } }
          ] },
        { label: 'Đăng khắp các hội nhóm Facebook, Zalo',
          success: { stat: 'smarts', base: 0.4, scale: 0.4 },
          outcomes: [
            { text: 'Một bạn học sinh nhắn tin kèm ảnh: {pet} đang được nhà bạn ấy cho ăn ở phường bên. Bạn mang bánh mứt sang cảm ơn rối rít rồi ôm bé về.',
              effects: { money: -500000, happy: 14, karma: 2, rel: { pet: 15 }, flag: 's_life_pet_tim_thay' },
              scene: { anim: 'hug', fx: 'hearts', npcAnim: { neighbor: 'clap' } } },
            { text: 'Bài đăng trôi tuột giữa hàng nghìn bài chúc Tết. Hết Tết, cái ổ vẫn trống. Bạn cất chén cơm của {pet} vào tủ, không nỡ vứt đi.',
              effects: { happy: -15, removePerson: 'pet', flag: 's_life_pet_mat', followUp: { id: 's_life_pet_tin_nhan', delay: 1 } },
              scene: { loc: 'home', anim: 'sad', fx: 'tears' } }
          ] },
        { label: 'Lùng sục mọi ngóc ngách suốt đêm',
          outcomes: [
            { p: 0.5, text: 'Ba giờ sáng, bạn soi đèn pin vào gầm một sạp hàng ở chợ và thấy hai đốm mắt sáng. {pet} run rẩy bò ra. Bạn ôm bé ngồi bệt giữa chợ, khóc như đứa trẻ.',
              effects: { health: -3, happy: 15, rel: { pet: 25 }, flag: 's_life_pet_tim_thay' },
              scene: { loc: 'market', time: 'night', anim: 'hug', fx: 'tears' } },
            { p: 0.5, text: 'Bạn đi đến sáng, mòn cả đế dép, cảm lạnh mất ba ngày. {pet} vẫn bặt tăm.',
              effects: { health: -6, happy: -15, removePerson: 'pet', flag: 's_life_pet_mat', followUp: { id: 's_life_pet_tin_nhan', delay: 1 } },
              scene: { time: 'night', weather: 'rain', anim: 'sad', fx: 'tears' } }
          ] }
      ]
    },
    {
      id: 's_life_pet_tin_nhan', title: 'Tin nhắn từ trạm cứu hộ', icon: '📞', age: [13, 80], chainOnly: true,
      req: { flag: 's_life_pet_mat', lacks: ['pet'] },
      text: 'Gần một năm sau cái Tết buồn ấy, một trạm cứu hộ nhắn tin: “Bên em vừa nhận một bé lông vàng, giống hệt ảnh trên tờ rơi của mình.” Bạn chạy xe như bay tới. Không phải bé nhà mình. Nhưng chú chó lạ cứ dụi đầu vào tay bạn mãi không thôi.',
      scene: { loc: 'street', time: 'day', weather: 'clear', anim: 'sad', expr: 'sad',
        npcs: [{ role: 'stranger', kind: 'dog', anim: 'cheer' }, { role: 'doctor', gender: 'f', age: 26, anim: 'talk', say: 'Bé này hiền lắm, chưa ai nhận cả.' }], fx: 'question', shot: 'low' },
      choices: [
        { label: 'Nhận nuôi chú chó lạ',
          text: 'Bạn đóng phí tiêm phòng, ký giấy nhận nuôi rồi chở bé về. Cái ổ cũ có chủ mới. Bạn tin rằng ở đâu đó, bé cũ của mình cũng đang được ai đó thương như thế.',
          effects: { happy: 12, karma: 8, money: -1000000, addPerson: { role: 'pet', fromScene: 'stranger', kind: 'dog' }, unflag: 's_life_pet_mat', flag: 's_life_pet_moi' },
          scene: { anim: 'hug', fx: 'hearts', npcAnim: { stranger: 'jump', doctor: 'clap' } } },
        { label: 'Góp tiền cho trạm rồi về',
          text: 'Bạn chưa sẵn sàng thương thêm ai. Bạn chuyển khoản {money:2000000} cho trạm, xoa đầu chú chó lần cuối rồi lặng lẽ ra về.',
          effects: { money: -2000000, karma: 6, happy: -2 },
          scene: { anim: 'wave', fx: 'tears', npcAnim: { stranger: 'sit', doctor: 'bow' } } },
        { label: 'Đăng ký làm tình nguyện viên cuối tuần',
          text: 'Chủ nhật nào bạn cũng tới tắm cho chó mèo, dọn chuồng, chụp ảnh đăng tìm chủ. Một năm trôi qua, bạn đã giúp 37 bé tìm được nhà mới.',
          effects: { karma: 12, happy: 8, health: 2, flag: 's_life_pet_tinh_nguyen' },
          scene: { anim: 'lift', fx: 'sparkle', npcAnim: { stranger: 'run', doctor: 'clap' } } }
      ]
    },
    {
      id: 's_life_pet_gia', title: 'Bé đã già', icon: '🦴', age: [18, 95], weight: 1.5,
      req: { has: ['pet'], flag: 's_life_pet', since: { s_life_pet: 9 }, notFlag: 's_life_pet_gia' },
      text: 'Mõm {pet} đã bạc trắng, đôi mắt mờ đục. Mỗi lần bạn về nhà, bé không còn chạy ào ra cổng mà chỉ nằm vẫy đuôi thật chậm. Bác sĩ bảo bé đã rất già rồi, giờ chỉ cần ăn ngon, ngủ yên và có người bên cạnh.',
      scene: { loc: 'home', time: 'dusk', weather: 'clear', anim: 'sit', expr: 'sad',
        npcs: [{ role: 'pet', anim: 'sleep' }], fx: 'petals', shot: 'close' },
      choices: [
        { label: 'Đưa bé đi biển lần cuối',
          text: 'Bạn thuê xe chở {pet} ra biển. Bé không chạy nổi nữa, chỉ nằm trên cát hít hà mùi gió, thỉnh thoảng ngẩng lên nhìn bạn. Hoàng hôn hôm ấy đẹp đến nao lòng.',
          effects: { money: -3000000, happy: 8, rel: { pet: 15 }, flag: 's_life_pet_gia', followUp: { id: 's_life_pet_tien_biet', delay: 1 } },
          scene: { loc: 'beach', time: 'dusk', anim: 'sit', fx: 'sparkle', npcAnim: { pet: 'sit' } } },
        { label: 'Nấu cho bé những món ngon nhất',
          text: 'Ngày nào bạn cũng hầm xương, xé thịt gà, nấu cháo thơm phức. {pet} ăn từng chút một, rồi gác cằm lên chân bạn ngủ ngon lành.',
          effects: { money: -1500000, happy: 6, rel: { pet: 12 }, flag: 's_life_pet_gia', followUp: { id: 's_life_pet_tien_biet', delay: 1 } },
          scene: { anim: 'cook', fx: 'steam', npcAnim: { pet: 'sleep' } } },
        { label: 'Chụp một bộ ảnh kỷ niệm',
          text: 'Bạn thuê thợ chụp một bộ ảnh hai đứa: bạn đội nón lá, {pet} đeo nơ đỏ. Tấm đẹp nhất được in thật to, treo ngay giữa phòng khách.',
          effects: { money: -2000000, happy: 7, rel: { pet: 10 }, flag: 's_life_pet_gia', followUp: { id: 's_life_pet_tien_biet', delay: 1 } },
          scene: { anim: 'laugh', fx: 'stars', npcAnim: { pet: 'sit' } } }
      ]
    },
    {
      id: 's_life_pet_tien_biet', title: 'Lời tạm biệt', icon: '🌈', age: [19, 96], chainOnly: true,
      req: { has: ['pet'] },
      text: 'Một buổi sáng yên ả, {pet} không dậy nữa. Bé nằm trong cái ổ quen thuộc, đầu gối lên chiếc áo cũ của bạn, như chỉ đang ngủ một giấc thật dài. Bao nhiêu năm qua, chưa ngày nào bé thôi chờ bạn về.',
      scene: { loc: 'home', time: 'dawn', weather: 'cloudy', anim: 'cry', expr: 'sad',
        npcs: [{ role: 'pet', anim: 'sleep' }], fx: 'tears', shot: 'close' },
      choices: [
        { label: 'Chôn bé dưới gốc cây',
          text: 'Bạn đào một cái hố dưới gốc cây, đặt bé xuống cùng món đồ chơi gặm đã sờn. Mùa sau, cây trổ đầy hoa trắng. Bạn tin đó là bé gửi lời chào.',
          effects: { happy: -12, karma: 3, removePerson: 'pet' },
          scene: { loc: 'park', time: 'day', anim: 'pray', fx: 'petals' } },
        { label: 'Hỏa táng, giữ tro trong chiếc hũ nhỏ',
          text: 'Bạn đưa bé đến dịch vụ hỏa táng thú cưng, tốn {money:3000000}. Chiếc hũ nhỏ đặt cạnh tấm ảnh, sáng nào ra khỏi nhà bạn cũng quen miệng chào bé một câu.',
          effects: { money: -3000000, happy: -10, removePerson: 'pet' },
          scene: { anim: 'pray', fx: 'tears' } },
        { label: 'Viết một bài tiễn biệt lên mạng',
          text: 'Bạn viết về {pet} suốt đêm: lần đầu cắn nát dép, những trận ốm, những chiều nằm chờ ở cổng. Hàng nghìn người lạ để lại lời chia buồn, kèm ảnh thú cưng đã mất của chính họ.',
          effects: { happy: -8, smarts: 1, removePerson: 'pet' },
          scene: { time: 'night', anim: 'type', fx: 'tears' } }
      ]
    },
    // ======================= ARC 3: TRÚNG SỐ ĐỘC ĐẮC =======================
    {
      id: 's_life_so_doc_dac', title: 'Trúng độc đắc', icon: '🎰', age: [20, 80], weight: 0.25,
      req: { notFlag: 's_life_so' },
      text: 'Bảy năm nay, tuần nào bạn cũng mua đúng một cặp vé số dãy ngày sinh của mình, coi như “nuôi hy vọng”. Tối nay dò kết quả, bạn so đi so lại đến lần thứ mười một: trúng cả hai giải độc đắc, tổng cộng {money:4000000000}. Tay bạn run tới mức làm rơi điện thoại vào nồi canh.',
      scene: { loc: 'home', time: 'night', weather: 'clear', anim: 'scared', expr: 'surprised', say: 'Trúng... trúng thật rồi!!!', npcs: [], fx: 'exclaim', shot: 'dramatic' },
      choices: [
        { label: 'Giữ bí mật, trùm kín mặt đi lĩnh thưởng',
          text: 'Bạn đeo khẩu trang, kính râm, mũ trùm kín như đi cướp ngân hàng, lĩnh thưởng xong (đã trừ 10% thuế) rồi lẳng lặng về. Đêm đó bạn ngủ ôm khư khư cái thẻ ATM.',
          effects: { money: 3600000000, happy: 15, flag: ['s_life_so', 's_life_so_bi_mat'], followUp: { id: 's_life_so_ho_hang', delay: 1 } },
          scene: { loc: 'office', time: 'day', anim: 'walk', fx: 'sweat' } },
        { label: 'Khoe Facebook, mở tiệc 50 mâm ăn mừng',
          text: 'Bạn đăng ảnh tấm vé kèm dòng “Trời thương!!!”, rồi đặt 50 mâm cỗ, thuê ban nhạc sống, bắn pháo giấy mời cả xóm. Tiệc tốn {money:250000000}, và tin bạn trúng số bay xa hơn cả tiếng loa.',
          effects: { money: 3350000000, happy: 18, flag: ['s_life_so', 's_life_so_khoe'], followUp: { id: 's_life_so_ho_hang', delay: 0 } },
          scene: { loc: 'wedding', time: 'night', anim: 'dance', fx: 'fireworks' } },
        { label: 'Việc đầu tiên: biếu cô bán vé quen',
          text: 'Bạn tìm ra cô bán vé số quen ở đầu chợ, dúi vào tay cô {money:100000000}. Cô bật khóc, nói sẽ sửa lại cái mái nhà dột mười năm nay. Phần còn lại bạn lặng lẽ cất đi.',
          effects: { money: 3500000000, karma: 12, happy: 14, flag: ['s_life_so', 's_life_so_bi_mat'], followUp: { id: 's_life_so_ho_hang', delay: 1 } },
          scene: { loc: 'market', time: 'day', anim: 'bow', fx: 'sparkle' } }
      ]
    },
    {
      id: 's_life_so_ho_hang', title: 'Bà con mười tám đời', icon: '👪', age: [20, 82], chainOnly: true,
      req: { flag: 's_life_so' },
      text: 'Không biết ai lộ tin, nhưng tuần này nhà bạn đông như Tết. Ông chú họ xa chưa gặp bao giờ cần {money:500000000} “mở xưởng”, bà cô bên ngoại muốn vay xây nhà, đứa cháu nào đó xin tiền mua xe đi học. Ai cũng mở đầu bằng một câu: “Người trong nhà cả mà...”',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'think', expr: 'surprised',
        npcs: [{ role: 'relative', gender: 'm', age: 56, anim: 'talk', say: 'Người trong nhà cả mà, cháu!' }, { role: 'crowd', anim: 'talk' }], fx: 'question', shot: 'wide' },
      choices: [
        { label: 'Ai hỏi cũng cho, coi như làm phúc',
          text: 'Bạn phát tiền như ông già Noel. Hết tháng, {money:1200000000} đã “đi vay” và chẳng ai nhắc tới chuyện trả. Họ hàng khen bạn hết lời... trước mặt.',
          effects: { money: -1200000000, karma: 4, happy: -2, followUp: { id: 's_life_so_tieu_tien', delay: 1 } },
          scene: { anim: 'shrug', fx: 'money', npcAnim: { relative: 'cheer', crowd: 'cheer' } } },
        { label: 'Lập quỹ khuyến học cho con cháu trong họ',
          text: 'Bạn không cho ai vay, nhưng trích {money:300000000} lập quỹ khuyến học: đứa nào đỗ đại học có thưởng. Ông chú họ hậm hực bỏ về, còn các cụ trong họ gật gù: “Thế mới là biết lo.”',
          effects: { money: -300000000, karma: 10, smarts: 2, happy: 3, followUp: { id: 's_life_so_tieu_tien', delay: 1 } },
          scene: { anim: 'talk', fx: 'idea', npcAnim: { relative: 'angry', crowd: 'nod' } } },
        { label: 'Từ chối thẳng, đóng cổng không tiếp',
          text: 'Bạn khóa cổng, tắt chuông, chặn hết số lạ. Nhóm Zalo dòng họ bắt đầu xuất hiện những bài “giàu mà ích kỷ thì chẳng ai thương”. Tiền còn nguyên, nhưng Tết năm sau sẽ hơi lạnh.',
          effects: { happy: -4, karma: -3, followUp: { id: 's_life_so_tieu_tien', delay: 1 } },
          scene: { anim: 'angry', fx: 'anger', npcAnim: { relative: 'angry', crowd: 'angry' } } },
        { label: 'Giả vờ đã bị lừa mất sạch tiền',
          outcomes: [
            { p: 0.5, text: 'Bạn kể chuyện bị lừa “đầu tư tiền ảo” với vẻ mặt thảm thương. Họ hàng an ủi rồi rút lui hết. Bạn suýt bật cười khi bà cô dúi cho {money:200000} “đi xe ôm”.',
              effects: { money: 200000, happy: 6, karma: -4, followUp: { id: 's_life_so_tieu_tien', delay: 1 } },
              scene: { anim: 'cry', fx: 'sweat', npcAnim: { relative: 'sad', crowd: 'sad' } } },
            { p: 0.5, text: 'Đúng lúc đó ngân hàng gọi tới mời bạn lên hạng khách VIP, loa ngoài bật to rõ mồn một. Cả phòng im phăng phắc. Từ hôm ấy bạn có biệt danh “thánh diễn”.',
              effects: { happy: -6, karma: -5, followUp: { id: 's_life_so_tieu_tien', delay: 1 } },
              scene: { anim: 'facepalm', fx: 'flash', npcAnim: { relative: 'angry', crowd: 'point' } } }
          ] }
      ]
    },
    {
      id: 's_life_so_tieu_tien', title: 'Tiền nhiều để làm gì?', icon: '💸', age: [21, 83], chainOnly: true,
      req: { flag: 's_life_so' },
      text: 'Một năm sau tấm vé, bạn bè cũ bắt đầu gọi bạn là “đại gia”, đi ăn lần nào cũng chờ bạn trả. Nhân viên ngân hàng gọi mời đầu tư mỗi ngày. Trong đầu bạn cứ vang lên một câu: “Phải làm gì đó với số tiền này.”',
      scene: { loc: 'cafe', time: 'day', weather: 'clear', anim: 'think', expr: 'neutral',
        npcs: [{ role: 'stranger', gender: 'f', age: 30, anim: 'talk', say: 'Gói này dành riêng cho khách VIP ạ!' }, { role: 'crowd', anim: 'drink' }], fx: 'money', shot: 'wide' },
      choices: [
        { label: 'Sống như đại gia: xe sang, hàng hiệu, du thuyền',
          text: 'Bạn tậu xe sang, đồng hồ Thụy Sĩ, bao cả hội bạn đi du thuyền Hạ Long, tiệc tùng mỗi tối. Mười hai tháng rực rỡ nhất đời, tài khoản vơi nhanh như nước xả bồn. Chiếc xe vừa lăn bánh đã mất giá một nửa.',
          effects: { money: -2500000000, happy: 15, looks: 4, health: -4, asset: { add: { type: 'car', name: 'Xe sang mua bằng tiền trúng số', value: 900000000 } }, flag: 's_life_so_hoang', followUp: { id: 's_life_so_trang_tay', delay: 2 } },
          scene: { loc: 'beach', time: 'night', anim: 'dance', fx: 'fireworks', npcAnim: { crowd: 'dance', stranger: 'cheer' } } },
        { label: 'Mua căn hộ cho thuê, gửi tiết kiệm phần còn lại',
          text: 'Bạn ngồi cả buổi với một chuyên viên tài chính độc lập, mua một căn hộ nhỏ cho thuê, gửi tiết kiệm, để riêng quỹ dự phòng. Cuộc sống chẳng đổi mấy, chỉ là bạn ngủ ngon hơn.',
          effects: { money: -1800000000, smarts: 4, happy: 6, asset: { add: { type: 'house', name: 'Căn hộ cho thuê', value: 1800000000 } }, flag: 's_life_so_khon', followUp: { id: 's_life_so_ve_sau', delay: 3 } },
          scene: { loc: 'office', anim: 'nod', fx: 'idea', npcAnim: { stranger: 'clap' } } },
        { label: 'Xây một cây cầu cho xã nghèo',
          text: 'Bạn về một xã vùng sâu, nơi lũ trẻ phải đu dây qua suối để đi học, góp {money:1500000000} xây cây cầu bê tông. Ông trưởng bản nắm tay bạn rất lâu, không nói được câu nào.',
          effects: { money: -1500000000, karma: 25, happy: 12, flag: 's_life_so_thien', followUp: { id: 's_life_so_ve_sau', delay: 3 } },
          scene: { loc: 'countryside', anim: 'hug', fx: 'sparkle' } },
        { label: 'Xách ba lô đi vòng quanh thế giới',
          text: 'Bạn đi 30 nước trong một năm: ngắm cực quang, ăn pizza ở Ý, lạc trong chợ Marrakech, tiêu hết {money:1200000000}. Về nhà, tiền vơi một nửa, nhưng chuyện để kể thì đủ dùng tới già.',
          effects: { money: -1200000000, happy: 18, smarts: 4, health: 2, flag: 's_life_so_di', followUp: { id: 's_life_so_ve_sau', delay: 3 } },
          scene: { loc: 'street', time: 'dusk', anim: 'cheer', fx: 'stars' } }
      ]
    },
    {
      id: 's_life_so_trang_tay', title: 'Trắng tay', icon: '📉', age: [22, 86], chainOnly: true,
      req: { flag: 's_life_so_hoang' },
      text: 'Hai năm sau, tiền trúng số đã bốc hơi gần hết, thẻ tín dụng thì đỏ lòm. Hội bạn “du thuyền” năm nào giờ đọc tin nhắn mà không trả lời. Bạn ngồi một mình giữa đêm mưa, nhìn ra con hẻm cũ nơi mọi chuyện bắt đầu.',
      scene: { loc: 'street', time: 'night', weather: 'rain', anim: 'sad', expr: 'sad', npcs: [], fx: 'tears', shot: 'dramatic' },
      choices: [
        { label: 'Bán xe sang, làm lại từ đầu', req: { asset: 'car' },
          text: 'Bạn bán chiếc xe, trả sạch nợ thẻ, quay lại cuộc sống như bảy năm trước. Lạ thay, ly cà phê sữa đá vỉa hè sáng hôm sau ngon hơn mọi bữa tiệc trên du thuyền.',
          effects: { asset: { lose: 'car' }, money: 600000000, happy: 4, smarts: 4, karma: 2 },
          scene: { time: 'day', weather: 'clear', anim: 'drink', fx: 'sparkle' } },
        { label: 'Quẹt thẻ tiếp để giữ sĩ diện',
          text: 'Bạn mở thêm hai thẻ tín dụng để tiếp tục đăng ảnh sang chảnh như chưa có gì. Lãi chồng lãi, hết năm đã nợ thêm {money:200000000}. Đêm nào nghe chuông điện thoại bạn cũng giật mình.',
          effects: { money: -200000000, happy: -8, health: -5, karma: -2 },
          scene: { anim: 'phone', fx: 'sweat' } },
        { label: 'Kể lại chuyện mình như một bài học',
          text: 'Bạn viết bài “Tôi đã tiêu hết tiền trúng số như thế nào”. Bài viết lan khắp mạng, người cười, người cảm ơn vì bạn dám nói thật. Ít nhất, sai lầm của bạn có ích cho ai đó.',
          effects: { happy: 3, smarts: 5, karma: 5 },
          scene: { loc: 'home', anim: 'type', fx: 'idea' } },
        { label: 'Mua tiếp vé số, biết đâu trúng lần nữa',
          outcomes: [
            { p: 0.95, text: 'Bạn mua mỗi ngày 20 tờ “để gỡ”. Một năm, {money:73000000} bay theo những tờ giấy, không trúng nổi một giải an ủi.',
              effects: { money: -73000000, happy: -6 },
              scene: { anim: 'facepalm', fx: 'money' } },
            { p: 0.05, text: 'Sau một năm mua vé mỗi ngày, bạn trúng giải khuyến khích {money:6000000}. Đủ bù được... gần một phần mười số tiền đã mua.',
              effects: { money: -67000000, happy: 2 },
              scene: { anim: 'shrug', fx: 'question' } }
          ] }
      ]
    },
    {
      id: 's_life_so_ve_sau', title: 'Mấy năm sau tấm vé', icon: '✉️', age: [23, 88], chainOnly: true,
      req: { flag: 's_life_so' },
      text: 'Ba năm đã qua kể từ đêm làm rơi điện thoại vào nồi canh. Bạn vẫn ở khu cũ, vẫn ăn cơm tấm đầu hẻm, chỉ là giờ gọi thêm trứng ốp la mà không cần nhìn giá. Sáng nay, có mấy lá thư được gửi tới nhà.',
      scene: { loc: 'home', time: 'day', weather: 'clear', anim: 'study', expr: 'happy', npcs: [], fx: 'sparkle', shot: 'close' },
      choices: [
        { label: 'Đọc thư của lũ trẻ bên kia cây cầu', req: { flag: 's_life_so_thien' },
          text: 'Nét chữ nắn nót: “Tụi con cảm ơn người đã xây cầu. Giờ mùa lũ tụi con vẫn đi học được.” Kèm theo là bức tranh cây cầu, có hình bạn đứng giữa, to hơn cả ngọn núi.',
          effects: { happy: 12, karma: 5 },
          scene: { anim: 'cry', fx: 'hearts' } },
        { label: 'Đọc thư của người thuê căn hộ', req: { flag: 's_life_so_khon' },
          text: 'Cặp vợ chồng trẻ thuê căn hộ viết thư xin ở tiếp, vì “con bé nhà em bập bẹ tiếng đầu tiên ở đây”. Bạn giữ nguyên giá thuê. Tiền nhà đều đặn mỗi tháng, năm nay thu về {money:120000000}.',
          effects: { money: 120000000, happy: 6, karma: 4 },
          scene: { anim: 'laugh', fx: 'money' } },
        { label: 'Đọc thư mời góp vốn của “bạn cũ”',
          success: { stat: 'smarts', base: 0.3, scale: 0.6 },
          outcomes: [
            { text: 'Bạn nhờ luật sư kiểm tra “dự án nghỉ dưỡng”, phát hiện ra công ty ma. Bạn từ chối khéo, cười thầm: giữ tiền còn khó hơn trúng tiền.',
              effects: { smarts: 3, happy: 3 },
              scene: { anim: 'shake', fx: 'idea' } },
            { text: 'Bạn góp {money:500000000} vào “dự án nghỉ dưỡng” của người bạn cũ. Sáu tháng sau, người bạn ấy đổi số điện thoại.',
              effects: { money: -500000000, happy: -10 },
              scene: { anim: 'facepalm', fx: 'heartbreak' } }
          ] },
        { label: 'Mở tiệc tri ân những người thời khó khăn',
          text: 'Bạn mời cô bán vé số, bà bán cơm tấm, hàng xóm cũ và bạn bè thời khó đi ăn một bữa thật sang, mỗi người thêm một phong bì nhỏ. Tốn {money:150000000}, nhưng ai ra về cũng ấm lòng.',
          effects: { money: -150000000, happy: 10, karma: 8 },
          scene: { loc: 'wedding', time: 'night', anim: 'clap', fx: 'confetti' } }
      ]
    },
  );
})();
