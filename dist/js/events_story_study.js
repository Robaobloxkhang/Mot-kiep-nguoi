/* Một Kiếp Người — học vấn & thi cử: học sinh giỏi quốc gia, Olympic quốc tế, học bổng du học, thạc sĩ, tiến sĩ, giáo sư.
   Mỗi kỳ thi lớn là một minigame (mini: 'quiz' / 'interview'). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.EVENTS = KN.EVENTS || [];
  KN.EVENTS.push(
    {
      id: 's_edu_hsg', title: 'Đội tuyển học sinh giỏi quốc gia', icon: '🏅', age: [15, 17], weight: 2.5,
      req: { school: true, minStat: { smarts: 72 }, notFlag: 's_edu_hsg' },
      text: 'Thầy chủ nhiệm gọi bạn lên văn phòng: “Em được chọn vào đội tuyển học sinh giỏi quốc gia của tỉnh. Ba tháng ôn luyện cường độ cao, em có theo được không?”',
      scene: { loc: 'school', anim: 'think', expr: 'surprised', npcs: [{ role: 'teacher', anim: 'talk', say: 'Thầy tin em.' }], fx: 'idea' },
      choices: [
        { label: 'Vào đội tuyển, ôn thi ngày đêm', mini: 'quiz',
          success: { stat: 'smarts', base: 0.1, scale: 0.55 },
          outcomes: [
            { text: 'Bạn đoạt giải Nhất quốc gia! Tên bạn được đọc trên loa trường, ảnh treo ở bảng vàng. Bạn được tuyển thẳng đại học và vào vòng chọn đội tuyển Olympic quốc tế.', effects: { smarts: 5, happy: 12, flag: ['s_edu_hsg', 'hsg_qg'], rel: { mother: 6, father: 6 }, followUp: { id: 's_edu_olympic', delay: 1 } }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Bạn chỉ được giải Khuyến khích. Hơi tiếc, nhưng ba tháng ôn luyện giúp bạn học vượt hẳn các bạn cùng lớp.', effects: { smarts: 4, happy: 2, flag: 's_edu_hsg' }, scene: { anim: 'nod' } }
          ] },
        { label: 'Từ chối, học vừa sức',
          text: 'Bạn xin thầy cho học bình thường, còn thời gian đá bóng, đi chơi với bạn bè.',
          effects: { happy: 3, flag: 's_edu_hsg' }, scene: { anim: 'shrug' } }
      ]
    },
    {
      id: 's_edu_olympic', title: 'Olympic quốc tế', icon: '🌏', age: [16, 19], chainOnly: true,
      req: { flag: 'hsg_qg' },
      text: 'Bạn lọt vào đội tuyển Olympic quốc tế. Đoàn Việt Nam bay sang dự thi cùng hơn trăm quốc gia. Năm tiếng làm bài, sáu bài toán.',
      scene: { loc: 'university', anim: 'study', npcs: [{ role: 'teacher', anim: 'clap', say: 'Cố lên em!' }], fx: 'idea', shot: 'dramatic' },
      choices: [
        { label: 'Bước vào phòng thi', mini: 'quiz',
          success: { stat: 'smarts', base: 0.05, scale: 0.55 },
          outcomes: [
            { text: 'HUY CHƯƠNG VÀNG! Bạn đứng trên bục nhận huy chương, quốc kỳ Việt Nam tung bay. Về nước, cả sân bay đón. Hàng loạt đại học danh tiếng thế giới gửi thư mời kèm học bổng toàn phần.', effects: { smarts: 6, happy: 18, followers: 0.3, english: 10, flag: ['olympic_vang', 'hoc_bong'] }, scene: { loc: 'airport', anim: 'cheer', fx: ['fireworks', 'confetti'] } },
            { text: 'Bạn giành Huy chương Đồng. Không phải vàng, nhưng là niềm tự hào của cả trường.', effects: { smarts: 3, happy: 8, english: 5, flag: 'olympic_dong' }, scene: { anim: 'cheer', fx: 'stars' } }
          ] }
      ]
    },
    {
      id: 's_edu_hoc_bong', title: 'Săn học bổng du học', icon: '🎓', age: [17, 24], weight: 1.6,
      req: { minStat: { smarts: 70 }, minEnglish: 45, notFlag: 's_edu_hoc_bong' },
      text: 'Một trường đại học top đầu nước ngoài mở vòng phỏng vấn học bổng toàn phần. Hội đồng tuyển sinh sẽ hỏi trực tiếp bằng tiếng Anh.',
      scene: { loc: 'office', anim: 'think', npcs: [{ role: 'boss', anim: 'talk', say: 'Tell us about yourself.' }], fx: 'question' },
      choices: [
        { label: 'Nộp hồ sơ, vào phỏng vấn', mini: 'interview',
          success: { stat: 'smarts', base: 0.15, scale: 0.5 },
          outcomes: [
            { text: 'Email báo đỗ học bổng toàn phần đến lúc nửa đêm. Bạn hét lên đánh thức cả nhà. Bằng nước ngoài sau này sẽ mở ra rất nhiều cánh cửa.', effects: { happy: 14, english: 15, flag: ['s_edu_hoc_bong', 'hoc_bong', 'duhoc'] }, scene: { loc: 'home', anim: 'jump', fx: 'confetti' } },
            { text: '“Chúng tôi rất tiếc…” Bạn đọc đi đọc lại email, rồi tự nhủ năm sau sẽ thử lại.', effects: { happy: -5, english: 3, flag: 's_edu_hoc_bong' }, scene: { loc: 'bedroom', anim: 'sad' } }
          ] },
        { label: 'Thôi, học trong nước',
          text: 'Bạn chọn ở lại, gần gia đình.',
          effects: { flag: 's_edu_hoc_bong' }, scene: { anim: 'nod' } }
      ]
    },
    {
      id: 's_edu_thac_si', title: 'Học thạc sĩ', icon: '📘', age: [22, 40], weight: 1.4,
      req: { degree: true, notFlag: ['master', 's_edu_thac_si'], minMoney: 120000000, jail: false },
      text: 'Đồng nghiệp rủ cùng đăng ký học thạc sĩ buổi tối. Hai năm vừa đi làm vừa đi học, học phí hơn trăm triệu, nhưng có bằng thì dễ thăng tiến.',
      scene: { loc: 'university', time: 'night', anim: 'study', npcs: [{ role: 'coworker', anim: 'study', say: 'Học cùng cho vui!' }], fx: 'idea' },
      choices: [
        { label: 'Đăng ký học, bảo vệ luận văn', mini: 'quiz',
          success: { stat: 'smarts', base: 0.3, scale: 0.5 },
          outcomes: [
            { text: 'Sau hai năm thức khuya, bạn bảo vệ luận văn loại Giỏi. Tấm bằng thạc sĩ được đóng khung treo giữa phòng khách.', effects: { money: -120000000, smarts: 4, happy: 6, health: -2, perf: 8, flag: ['master', 's_edu_thac_si'] }, scene: { loc: 'university', anim: 'cheer', fx: 'confetti' } },
            { text: 'Luận văn bị hội đồng yêu cầu làm lại. Bạn mất thêm một năm và ít tóc hơn, nhưng cuối cùng cũng xong.', effects: { money: -150000000, smarts: 3, happy: -2, health: -3, flag: ['master', 's_edu_thac_si'] }, scene: { anim: 'facepalm' } }
          ] },
        { label: 'Đi làm thôi, kinh nghiệm quan trọng hơn',
          text: 'Bạn dồn sức cho công việc. Bằng cấp không phải tất cả.',
          effects: { perf: 4, flag: 's_edu_thac_si' }, scene: { anim: 'type' } }
      ]
    },
    {
      id: 's_edu_tien_si', title: 'Con đường tiến sĩ', icon: '🎓', age: [25, 50], weight: 1.4,
      req: { flag: 'master', notFlag: ['phd', 's_edu_tien_si'], minStat: { smarts: 70 }, jail: false },
      text: 'Giáo sư hướng dẫn hồi học thạc sĩ mời bạn làm nghiên cứu sinh: bốn năm, lương ít, công trình phải đăng tạp chí quốc tế. Đổi lại là chữ “Tiến sĩ” trước tên.',
      scene: { loc: 'university', anim: 'think', npcs: [{ role: 'teacher', gender: 'm', anim: 'talk', say: 'Em có tố chất làm khoa học.' }], fx: 'idea' },
      choices: [
        { label: 'Theo đuổi học vị tiến sĩ', mini: 'quiz',
          success: { stat: 'smarts', base: 0.15, scale: 0.55 },
          outcomes: [
            { text: 'Bài báo của bạn được đăng trên tạp chí khoa học hàng đầu. Lễ bảo vệ luận án, cả hội đồng đứng dậy bắt tay. Từ nay bạn là Tiến sĩ.', effects: { smarts: 6, happy: 12, money: -80000000, flag: ['phd', 's_edu_tien_si'], followers: 0.05 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Thí nghiệm thất bại liên tiếp, đề tài đổ bể sau ba năm. Bạn bỏ dở, mang theo chút cay đắng và nhiều kiến thức.', effects: { smarts: 4, happy: -8, money: -60000000, flag: 's_edu_tien_si' }, scene: { anim: 'sad' } }
          ] },
        { label: 'Cảm ơn thầy, em chọn đi làm',
          text: 'Bạn từ chối khéo. Thầy tiếc, nhưng vẫn viết thư giới thiệu cho bạn.',
          effects: { flag: 's_edu_tien_si' }, scene: { anim: 'bow' } }
      ]
    },
    {
      id: 's_edu_giao_su', title: 'Xét phong giáo sư', icon: '👨‍🏫', age: [38, 70], weight: 2,
      req: { flag: 'phd', notFlag: 's_edu_giao_su', jobId: ['khoahoc', 'giaovien', 'bacsi', 'luatsu', 'kysu'] },
      text: 'Hội đồng giáo sư nhà nước mở đợt xét phong chức danh. Hồ sơ của bạn có hơn ba mươi công trình khoa học. Hôm nay bạn phải trình bày trước hội đồng.',
      scene: { loc: 'university', anim: 'talk', npcs: [{ role: 'teacher', anim: 'think' }, { role: 'crowd', anim: 'idle' }], fx: 'question', shot: 'dramatic' },
      choices: [
        { label: 'Trình bày trước hội đồng', mini: 'interview',
          success: { stat: 'smarts', base: 0.25, scale: 0.5 },
          outcomes: [
            { text: 'Bạn được phong hàm Giáo sư. Học trò cũ khắp nơi gửi hoa chúc mừng. Trên bia mộ sau này sẽ có thêm chữ “GS.TS.”', effects: { happy: 15, karma: 4, perf: 15, flag: ['giaosu', 's_edu_giao_su'], followers: 0.1 }, scene: { anim: 'cheer', fx: 'confetti' } },
            { text: 'Hội đồng chưa thông qua, cần thêm công trình quốc tế. Bạn hẹn lại kỳ sau.', effects: { happy: -6, flag: 's_edu_giao_su' }, scene: { anim: 'sad' } }
          ] }
      ]
    }
  );
})();
