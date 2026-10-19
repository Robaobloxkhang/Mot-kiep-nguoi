/* Một Kiếp Người — static game data (KN.DATA). SPEC §3 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const U = KN.util;
  const TR = 1e6, TY = 1e9;

  function fmtNum(n, dec) {
    const s = (Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec);
    let [i, d] = s.split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (d && /^0+$/.test(d)) d = null;
    if (d) d = d.replace(/0+$/, '');
    return d ? i + ',' + d : i;
  }
  function fmtMoney(n) {
    n = Math.round(+n || 0);
    const neg = n < 0, a = Math.abs(n);
    let s;
    if (a >= TY) s = fmtNum(a / TY, a >= 100 * TY ? 0 : 1) + ' tỷ ₫';
    else if (a >= TR) s = fmtNum(a / TR, a >= 100 * TR ? 0 : 1) + ' triệu ₫';
    else s = fmtNum(a, 0) + ' ₫';
    return (neg ? '-' : '') + s;
  }
  function fmtShort(n) { return fmtMoney(n).replace(' triệu ₫', 'tr').replace(' tỷ ₫', ' tỷ').replace(' ₫', 'đ'); }

  const LAST = [['Nguyễn', 38], ['Trần', 11], ['Lê', 9.5], ['Phạm', 7], ['Hoàng', 5], ['Huỳnh', 3], ['Phan', 4.5], ['Vũ', 3.9], ['Võ', 3], ['Đặng', 2.1], ['Bùi', 2], ['Đỗ', 1.4], ['Hồ', 1.3], ['Ngô', 1.3], ['Dương', 1], ['Lý', 0.5], ['Đinh', 0.8], ['Trương', 0.9], ['Lâm', 0.5], ['Mai', 0.4]];
  const MID = { m: ['Văn', 'Đức', 'Minh', 'Quốc', 'Hữu', 'Thành', 'Gia', 'Hoàng', 'Công', 'Tuấn', 'Anh', 'Đăng', 'Bảo', 'Trọng'], f: ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Minh', 'Phương', 'Bảo', 'Khánh', 'Hồng', 'Kim', 'Mai', 'Diệu', 'Gia', 'Hà'] };
  const FIRST = {
    m: ['Minh', 'Huy', 'Khang', 'Bảo', 'Nam', 'Phúc', 'An', 'Đức', 'Hùng', 'Tuấn', 'Long', 'Dũng', 'Quân', 'Thắng', 'Hiếu', 'Kiên', 'Sơn', 'Tùng', 'Vinh', 'Trung', 'Hải', 'Phong', 'Khoa', 'Lâm', 'Nghĩa', 'Tâm', 'Thịnh', 'Tài', 'Lộc', 'Quang', 'Hoàng', 'Duy', 'Đạt', 'Khôi', 'Nhân', 'Thiện', 'Toàn', 'Việt', 'Tiến', 'Hưng', 'Cường', 'Thành', 'Hòa', 'Bình', 'Tú', 'Kiệt', 'Thái', 'Hậu', 'Lực', 'Mạnh', 'Phát', 'Sang', 'Trí', 'Vũ', 'Đông', 'Hiển', 'Nhật', 'Quý', 'Triều', 'Uy'],
    f: ['Anh', 'Lan', 'Hương', 'Linh', 'Trang', 'Ngọc', 'Mai', 'Hà', 'Thảo', 'Hoa', 'Hằng', 'Nhung', 'Phương', 'Thủy', 'Yến', 'Vy', 'Chi', 'Hạnh', 'Nga', 'Uyên', 'Trâm', 'Quỳnh', 'Nhi', 'Châu', 'My', 'Diệp', 'Thư', 'Hiền', 'Giang', 'Loan', 'Tâm', 'Dung', 'Huyền', 'Oanh', 'Ly', 'Ngân', 'Như', 'Thoa', 'Xuân', 'Đào', 'Hồng', 'Liên', 'Nguyệt', 'Thanh', 'Tuyết', 'Vân', 'Khánh', 'An', 'Bích', 'Duyên', 'Hảo', 'Kim', 'Lệ', 'Minh', 'Nhàn', 'Phượng', 'Thơ', 'Trinh', 'Uyển', 'Hân'],
  };
  function randomName(gender, lastName) {
    const g = gender === 'f' ? 'f' : 'm';
    return { firstName: U.pick(FIRST[g]), middleName: U.pick(MID[g]), lastName: lastName || U.weighted(LAST, (x) => x[1])[0] };
  }
  const CITIES = [{ id: 'hanoi', name: 'Hà Nội' }, { id: 'hcm', name: 'TP. Hồ Chí Minh' }, { id: 'danang', name: 'Đà Nẵng' }, { id: 'haiphong', name: 'Hải Phòng' }, { id: 'cantho', name: 'Cần Thơ' }, { id: 'hue', name: 'Huế' }, { id: 'dalat', name: 'Đà Lạt' }, { id: 'nhatrang', name: 'Nha Trang' }];
  const cityName = (id) => (CITIES.find((c) => c.id === id) || CITIES[0]).name;

  const SKIN_TONES = ['#f6d7c0', '#efc6a6', '#e6b48f', '#d9a27c', '#c98d64', '#a8704d', '#865639'];
  const HAIR_COLORS = ['#141010', '#24170f', '#3a2618', '#5a3a24', '#7a4f2e', '#a8683a', '#c9a36b', '#7d2b2b'];
  const HAIR_STYLES = [{ id: 'short', label: 'Ngắn' }, { id: 'long', label: 'Dài' }, { id: 'bob', label: 'Bob' }, { id: 'ponytail', label: 'Đuôi ngựa' }, { id: 'bun', label: 'Búi' }, { id: 'spiky', label: 'Dựng' }, { id: 'curly', label: 'Xoăn' }, { id: 'buzz', label: 'Húi cua' }, { id: 'bald', label: 'Trọc' }, { id: 'sidepart', label: 'Rẽ ngôi' }, { id: 'undercut', label: 'Undercut' }, { id: 'twintail', label: 'Hai bím' }, { id: 'wavy', label: 'Sóng dài' }, { id: 'pixie', label: 'Tém' }];
  const OUTFIT_COLORS = ['#d94f4f', '#e8833a', '#f2c14e', '#39a96b', '#2f9e9e', '#2d6cdf', '#5b5fc7', '#9b59b6', '#e46aa0', '#f5f1e8', '#3a3f4b', '#8a6a4f'];
  const BOTTOM_COLORS = ['#2f3b52', '#1f2d55', '#3a3f4b', '#5b4636', '#d8cdb8', '#4a5a3a', '#22252b', '#f2f2f0'];
  const TOP_STYLES = [{ id: 'tshirt', label: 'Áo phông' }, { id: 'shirt', label: 'Sơ mi' }, { id: 'polo', label: 'Polo' }, { id: 'hoodie', label: 'Hoodie' }, { id: 'dress', label: 'Váy' }, { id: 'aodai', label: 'Áo dài' }, { id: 'suit', label: 'Vest' }, { id: 'jacket', label: 'Áo khoác' }, { id: 'sweater', label: 'Áo len' }, { id: 'jersey', label: 'Áo đấu' }, { id: 'tank', label: 'Ba lỗ' }];

  function randomAppearance(gender, age, opts) {
    opts = opts || {};
    const f = gender === 'f';
    const par = (opts.parents || []).filter(Boolean);
    const inherit = (k, list) => (par.length && Math.random() < 0.8 ? U.pick(par)[k] : U.pick(list));
    const skin = par.length ? U.mixHex(par[0].skin, (par[1] || par[0]).skin, Math.random()) : U.weighted(SKIN_TONES, (c, i) => [1, 3, 5, 4, 2, 1, 0.5][SKIN_TONES.indexOf(c)]);
    let hair = inherit('hair', HAIR_COLORS.slice(0, 4));
    if (Math.random() < 0.05 && age >= 16) hair = U.pick(['#a8683a', '#c9a36b', '#7d2b2b', '#5b5fc7']);
    const kidColors = ['#ff6b6b', '#ffb347', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff', '#ff8fab'];
    const seniorColors = ['#7a6a5a', '#5f6b5a', '#8a7a6a', '#4f5d6b', '#9a8a7a', '#6b4f4f', '#b0a69a'];
    let top = age < 13 ? U.pick(kidColors) : age >= 60 ? U.pick(seniorColors) : U.pick(OUTFIT_COLORS);
    let topStyle = age < 2 ? 'tshirt' : U.weighted(f ? [['tshirt', 4], ['shirt', 2], ['dress', 2], ['polo', 1], ['hoodie', 1], ['sweater', 1], ['jacket', 1]] : [['tshirt', 4], ['shirt', 3], ['polo', 2], ['hoodie', 1], ['jacket', 1], ['sweater', 0.7], ['tank', age < 50 ? 0.5 : 0.2], ['jersey', age < 30 ? 0.6 : 0.1]], (x) => x[1])[0];
    let hat = null;
    if (age >= 60 && !f && Math.random() < 0.15) topStyle = 'shirt';
    const role = opts.role;
    if (role === 'doctor') topStyle = 'coat';
    else if (role === 'police') { topStyle = 'uniform'; top = '#4b6b3c'; }
    else if (role === 'teacher') { topStyle = f && Math.random() < 0.6 ? 'aodai' : 'shirt'; if (topStyle === 'aodai') top = U.pick(['#e9dff2', '#f7e1d7', '#d7eef2', '#f2d7e6', '#ffffff']); }
    else if (role === 'boss') { topStyle = 'suit'; top = U.pick(['#2b3445', '#3a3f4b', '#1f2d55', '#4a4a4a']); }
    else if (role === 'coworker') topStyle = U.pick(['shirt', 'polo', 'shirt']);
    else if (role === 'student' || role === 'classmate') topStyle = age >= 6 && age <= 17 ? 'school' : topStyle;
    else if (role === 'vendor') { if (Math.random() < 0.6) hat = 'conical'; top = U.pick(seniorColors.concat(['#c45c5c', '#5c8cc4'])); }
    else if (role === 'thief') { topStyle = 'hoodie'; top = U.pick(['#2b2b2b', '#33384a', '#3d3a36', '#1f2733']); hat = Math.random() < 0.5 ? 'cap' : 'helmet'; }
    else if (role === 'thug') { topStyle = U.pick(['tshirt', 'shirt']); top = U.pick(['#1c1c1c', '#3b2f2f', '#5a1f1f', '#2f2f3b']); }
    else if (role === 'bride') { topStyle = 'aodai'; top = '#d32f2f'; }
    else if (role === 'groom') { topStyle = 'suit'; top = '#1f2d55'; }
    if (age >= 16 && age <= 60 && !hat && Math.random() < 0.05) hat = 'cap';
    if (age >= 13 && age <= 35 && !hat && Math.random() < 0.04) hat = U.pick(['headphones', 'bucket']);
    const hairStyle = age < 2 ? 'short' : f
      ? U.weighted([['long', 5], ['ponytail', 3], ['bob', 2], ['bun', age > 40 ? 4 : 1], ['curly', 1], ['wavy', 2], ['twintail', age < 20 ? 2 : 0.2], ['pixie', 1]], (x) => x[1])[0]
      : U.weighted([['short', 6], ['spiky', age < 30 ? 2 : 0.3], ['buzz', 2], ['curly', 0.5], ['bald', age > 50 ? 2 : 0.05], ['sidepart', age >= 16 ? 3 : 1], ['undercut', age >= 14 && age < 40 ? 2 : 0.2]], (x) => x[1])[0];
    return {
      skin, hair, hairStyle, eyes: U.pick(['#2a1b12', '#1a120c', '#3b2a1c']), top, topStyle,
      bottom: topStyle === 'aodai' ? (Math.random() < 0.7 ? '#f5f5f2' : top) : U.pick(BOTTOM_COLORS),
      shoes: U.pick(['#2b2b2b', '#f2f2f2', '#6b4f3a', '#3a5a8a', '#b03a3a']),
      glasses: age >= 8 && Math.random() < (age > 45 ? 0.35 : 0.18), beard: !f && age >= 25 && Math.random() < 0.12,
      hat, build: U.clamp(U.rand(0.25, 0.75) + (age > 40 ? 0.1 : 0), 0, 1), height: U.rand(0.2, 0.8),
    };
  }

  const STAGES = { baby: 'Sơ sinh', child: 'Thiếu nhi', teen: 'Thiếu niên', adult: 'Trưởng thành', senior: 'Cao tuổi' };
  const stageOf = (age) => (age <= 2 ? 'baby' : age <= 10 ? 'child' : age <= 17 ? 'teen' : age <= 59 ? 'adult' : 'senior');

  const MAJORS = {
    cntt: { name: 'Công nghệ thông tin', years: 4, tuition: 28 * TR, diff: 62, icon: '💻' },
    yduoc: { name: 'Y dược', years: 6, tuition: 45 * TR, diff: 78, icon: '🩺' },
    supham: { name: 'Sư phạm', years: 4, tuition: 0, diff: 48, icon: '📚' },
    kinhte: { name: 'Kinh tế', years: 4, tuition: 30 * TR, diff: 55, icon: '📊' },
    kythuat: { name: 'Kỹ thuật xây dựng', years: 4, tuition: 25 * TR, diff: 55, icon: '🏗️' },
    luat: { name: 'Luật', years: 4, tuition: 26 * TR, diff: 60, icon: '⚖️' },
    baochi: { name: 'Báo chí', years: 4, tuition: 24 * TR, diff: 52, icon: '📰' },
    nghethuat: { name: 'Nghệ thuật', years: 4, tuition: 30 * TR, diff: 45, icon: '🎨' },
    ngoaingu: { name: 'Ngôn ngữ Anh', years: 4, tuition: 26 * TR, diff: 54, icon: '🗣️' },
    taichinh: { name: 'Tài chính – Ngân hàng', years: 4, tuition: 32 * TR, diff: 60, icon: '🏦' },
    kientruc: { name: 'Kiến trúc', years: 5, tuition: 34 * TR, diff: 64, icon: '📐' },
    duoc: { name: 'Dược học', years: 5, tuition: 40 * TR, diff: 70, icon: '💊' },
    dieuduong: { name: 'Điều dưỡng', years: 4, tuition: 22 * TR, diff: 46, icon: '🩹' },
    dulich: { name: 'Du lịch – Khách sạn', years: 4, tuition: 25 * TR, diff: 44, icon: '🧳' },
    anninh: { name: 'Học viện Cảnh sát', years: 4, tuition: 0, diff: 66, icon: '👮' },
    nongnghiep: { name: 'Nông nghiệp', years: 4, tuition: 16 * TR, diff: 38, icon: '🌾' },
  };

  // salary = monthly VND per level
  const CAREERS = {
    phucvu: { title: 'Phục vụ quán', icon: '🧋', minAge: 15, levels: [['Phục vụ', 4], ['Phục vụ lâu năm', 5.5], ['Quản lý ca', 8]], loc: 'cafe', style: 'polo' },
    shipper: { title: 'Shipper', icon: '🛵', minAge: 16, req: { asset: 'motorbike' }, levels: [['Shipper', 7], ['Shipper 5 sao', 9], ['Trưởng nhóm giao hàng', 12]], loc: 'street', style: 'tshirt' },
    congnhan: { title: 'Công nhân', icon: '🏭', minAge: 18, levels: [['Công nhân', 7], ['Tổ trưởng', 10], ['Quản đốc', 16]], loc: 'office', style: 'uniform' },
    taixe: { title: 'Tài xế công nghệ', icon: '🚗', minAge: 18, req: { asset: 'motorbike' }, levels: [['Tài xế', 9], ['Tài xế kỳ cựu', 12], ['Đội trưởng', 15]], loc: 'street', style: 'polo' },
    banhang: { title: 'Nhân viên bán hàng', icon: '🛍️', minAge: 18, req: { hs: true }, levels: [['Nhân viên', 7], ['Trưởng ca', 10], ['Cửa hàng trưởng', 16], ['Quản lý vùng', 28]], loc: 'market', style: 'polo' },
    thocattoc: { title: 'Thợ cắt tóc', icon: '💈', minAge: 18, levels: [['Thợ phụ', 5], ['Thợ chính', 10], ['Chủ tiệm tóc', 22]], loc: 'street', style: 'tshirt' },
    daubep: { title: 'Đầu bếp', icon: '👨‍🍳', minAge: 18, levels: [['Phụ bếp', 6], ['Đầu bếp', 12], ['Bếp trưởng', 25], ['Bếp trưởng điều hành', 45]], loc: 'street', style: 'coat' },
    laptrinh: { title: 'Lập trình viên', icon: '💻', minAge: 21, req: { major: ['cntt'] }, levels: [['Thực tập sinh', 6], ['Junior', 15], ['Senior', 35], ['Tech Lead', 55], ['Giám đốc công nghệ', 95]], loc: 'office', style: 'hoodie' },
    bacsi: { title: 'Bác sĩ', icon: '🩺', minAge: 24, req: { major: ['yduoc'] }, levels: [['Bác sĩ nội trú', 9], ['Bác sĩ', 18], ['Bác sĩ chuyên khoa', 35], ['Trưởng khoa', 55], ['Giám đốc bệnh viện', 85]], loc: 'hospital', style: 'coat' },
    giaovien: { title: 'Giáo viên', icon: '👩‍🏫', minAge: 22, req: { major: ['supham'] }, levels: [['Giáo viên tập sự', 7], ['Giáo viên', 11], ['Tổ trưởng chuyên môn', 15], ['Hiệu phó', 20], ['Hiệu trưởng', 26]], loc: 'school', style: 'shirt' },
    ketoan: { title: 'Kế toán', icon: '🧮', minAge: 22, req: { major: ['kinhte', 'taichinh'] }, levels: [['Kế toán viên', 10], ['Kế toán tổng hợp', 16], ['Kế toán trưởng', 30], ['Giám đốc tài chính', 70]], loc: 'office', style: 'shirt' },
    marketing: { title: 'Chuyên viên marketing', icon: '📣', minAge: 22, req: { major: ['kinhte', 'baochi', 'nghethuat', 'ngoaingu', 'dulich'] }, levels: [['Chuyên viên', 11], ['Trưởng nhóm', 20], ['Trưởng phòng', 35], ['Giám đốc marketing', 70]], loc: 'office', style: 'shirt' },
    kysu: { title: 'Kỹ sư xây dựng', icon: '🏗️', minAge: 22, req: { major: ['kythuat'] }, levels: [['Kỹ sư', 13], ['Kỹ sư chính', 22], ['Chỉ huy trưởng', 38], ['Giám đốc dự án', 65]], loc: 'street', style: 'uniform' },
    luatsu: { title: 'Luật sư', icon: '⚖️', minAge: 23, req: { major: ['luat'] }, levels: [['Trợ lý luật sư', 9], ['Luật sư', 22], ['Luật sư cộng sự', 45], ['Luật sư điều hành', 90]], loc: 'office', style: 'suit' },
    nhabao: { title: 'Nhà báo', icon: '📰', minAge: 22, req: { major: ['baochi'] }, levels: [['Phóng viên', 10], ['Biên tập viên', 16], ['Thư ký tòa soạn', 25], ['Tổng biên tập', 45]], loc: 'office', style: 'shirt' },
    thietke: { title: 'Nhà thiết kế', icon: '🎨', minAge: 21, req: { major: ['nghethuat', 'kientruc'] }, levels: [['Designer', 10], ['Senior Designer', 20], ['Art Director', 40]], loc: 'cafe', style: 'tshirt' },
    casi: { title: 'Ca sĩ', icon: '🎤', minAge: 16, req: { minStat: { looks: 65 } }, levels: [['Ca sĩ phòng trà', 6], ['Ca sĩ trẻ', 15], ['Ca sĩ nổi tiếng', 50], ['Diva', 140]], loc: 'karaoke', style: 'suit', fame: true },
    streamer: { title: 'Nhà sáng tạo nội dung', icon: '📱', minAge: 16, volatile: true, levels: [['Streamer tập sự', 2], ['Streamer', 10], ['KOL', 35], ['Siêu sao mạng', 90]], loc: 'bedroom', style: 'hoodie', fame: true },
    cauthu: { title: 'Cầu thủ bóng đá', icon: '⚽', minAge: 16, maxStart: 22, retireAt: 35, sport: true, injury: 0.14, req: { minStat: { health: 75 } }, levels: [['Học viên lò đào tạo', 0], ['Cầu thủ V-League', 30], ['Trụ cột câu lạc bộ', 60], ['Tuyển thủ quốc gia', 100]], prize: [[0, 10], [30, 200], [100, 600], [300, 2000]], selfFund: 0, loc: 'stadium', style: 'jersey', fame: true },
    kinhdoanh: { title: 'Chủ kinh doanh', icon: '🏪', minAge: 20, volatile: true, req: { minMoney: 200 * TR }, levels: [['Chủ quán nhỏ', 12], ['Chủ chuỗi cửa hàng', 30], ['Giám đốc công ty', 70], ['Chủ tịch tập đoàn', 160]], loc: 'cafe', style: 'shirt' },
    congchuc: { title: 'Công chức', icon: '🏛️', minAge: 22, req: { degree: true, minStat: { smarts: 55 } }, levels: [['Chuyên viên', 8], ['Chuyên viên chính', 12], ['Phó phòng', 17], ['Trưởng phòng', 24]], loc: 'office', style: 'shirt' },
    phiendich: { title: 'Biên phiên dịch', icon: '🗣️', minAge: 22, req: { major: ['ngoaingu'] }, levels: [['Phiên dịch viên', 11], ['Phiên dịch cao cấp', 22], ['Trưởng nhóm dịch thuật', 36]], loc: 'office', style: 'shirt' },
    nganhang: { title: 'Nhân viên ngân hàng', icon: '🏦', minAge: 22, req: { major: ['taichinh', 'kinhte'] }, levels: [['Giao dịch viên', 10], ['Chuyên viên tín dụng', 18], ['Trưởng phòng', 36], ['Giám đốc chi nhánh', 75]], loc: 'office', style: 'suit' },
    kientrucsu: { title: 'Kiến trúc sư', icon: '📐', minAge: 23, req: { major: ['kientruc'] }, levels: [['KTS tập sự', 9], ['Kiến trúc sư', 20], ['KTS chủ trì', 38], ['Giám đốc thiết kế', 70]], loc: 'office', style: 'shirt' },
    duocsi: { title: 'Dược sĩ', icon: '💊', minAge: 23, req: { major: ['duoc'] }, levels: [['Dược sĩ', 10], ['Dược sĩ chính', 17], ['Chủ chuỗi nhà thuốc', 45]], loc: 'hospital', style: 'coat' },
    dieuduong: { title: 'Điều dưỡng', icon: '🩹', minAge: 22, req: { major: ['dieuduong', 'yduoc'] }, levels: [['Điều dưỡng viên', 8], ['Điều dưỡng chính', 12], ['Điều dưỡng trưởng', 18]], loc: 'hospital', style: 'coat' },
    huongdanvien: { title: 'Hướng dẫn viên du lịch', icon: '🧳', minAge: 21, req: { major: ['dulich', 'ngoaingu'] }, levels: [['Hướng dẫn viên', 9], ['HDV quốc tế', 18], ['Giám đốc lữ hành', 42]], loc: 'beach', style: 'polo' },
    canhsat: { title: 'Cảnh sát', icon: '👮', minAge: 22, req: { major: ['anninh'], minStat: { health: 55 } }, levels: [['Chiến sĩ', 9], ['Trung úy', 14], ['Đại úy', 20], ['Trưởng công an phường', 28], ['Đại tá', 40]], loc: 'street', style: 'uniform' },
    kysunn: { title: 'Kỹ sư nông nghiệp', icon: '🌾', minAge: 22, req: { major: ['nongnghiep'] }, levels: [['Kỹ sư', 8], ['Kỹ sư chính', 14], ['Chủ trang trại', 45]], loc: 'countryside', style: 'polo' },
    // --- nghề mới
    vdv_vo: { title: 'Võ sĩ', icon: '🥊', minAge: 16, maxStart: 24, retireAt: 36, sport: true, injury: 0.16, req: { minStat: { health: 70 } }, levels: [['Võ sĩ nghiệp dư', 0], ['Võ sĩ đội tuyển tỉnh', 5], ['Nhà vô địch quốc gia', 9], ['Võ sĩ đấu trường quốc tế', 9]], prize: [[0, 8], [10, 120], [80, 700], [300, 3000]], selfFund: 30, loc: 'ring', style: 'tank', fame: true },
    caulong: { title: 'Vận động viên cầu lông', icon: '🏸', minAge: 15, maxStart: 22, retireAt: 34, sport: true, injury: 0.1, req: { minStat: { health: 70 } }, levels: [['VĐV năng khiếu', 0], ['VĐV đội tuyển tỉnh', 4], ['VĐV đội tuyển quốc gia', 9], ['Tay vợt top thế giới', 9]], prize: [[0, 5], [10, 80], [60, 500], [400, 3500]], selfFund: 25, loc: 'court', style: 'polo', fame: true },
    esports: { title: 'Tuyển thủ eSports', icon: '🎮', minAge: 16, maxStart: 24, retireAt: 30, sport: true, injury: 0.05, req: { minStat: { smarts: 50 } }, levels: [['Tuyển thủ dự bị', 5], ['Tuyển thủ chính thức', 18], ['Ngôi sao eSports', 50]], prize: [[0, 20], [20, 300], [150, 2000]], selfFund: 0, loc: 'studio', style: 'jacket', fame: true },
    bongro: { title: 'Cầu thủ bóng rổ', icon: '🏀', minAge: 16, maxStart: 22, retireAt: 34, sport: true, injury: 0.12, req: { minStat: { health: 72 } }, levels: [['Cầu thủ dự bị VBA', 8], ['Cầu thủ chính VBA', 20], ['Ngôi sao VBA', 45], ['Tuyển thủ quốc gia', 70]], prize: [[0, 10], [10, 120], [60, 400], [150, 1200]], selfFund: 0, loc: 'court', style: 'jersey', fame: true },
    chinhtri: { title: 'Cán bộ chính quyền', icon: '🏛️', minAge: 22, req: { degree: true, minStat: { smarts: 55 } }, levels: [['Cán bộ phường', 9], ['Phó chủ tịch phường', 13], ['Chủ tịch phường', 17], ['Chủ tịch quận', 26], ['Giám đốc sở', 35], ['Chủ tịch tỉnh', 50]], loc: 'office', style: 'suit' },
    boi: { title: 'Vận động viên bơi lội', icon: '🏊', minAge: 15, maxStart: 21, retireAt: 30, sport: true, injury: 0.06, req: { minStat: { health: 72 } }, levels: [['VĐV năng khiếu', 0], ['VĐV đội tuyển tỉnh', 5], ['VĐV đội tuyển quốc gia', 10], ['Kình ngư châu Á', 10]], prize: [[0, 5], [10, 90], [60, 500], [300, 2500]], selfFund: 20, loc: 'beach', style: 'tank', fame: true },
    dienkinh: { title: 'Vận động viên điền kinh', icon: '🏃', minAge: 15, maxStart: 22, retireAt: 32, sport: true, injury: 0.1, req: { minStat: { health: 72 } }, levels: [['VĐV năng khiếu', 0], ['VĐV đội tuyển tỉnh', 4], ['VĐV đội tuyển quốc gia', 9], ['Nữ hoàng / Vua tốc độ SEA Games', 9]], prize: [[0, 5], [8, 80], [50, 400], [200, 1500]], selfFund: 15, loc: 'stadium', style: 'tank', fame: true },
    bongchuyen: { title: 'Cầu thủ bóng chuyền', icon: '🏐', minAge: 16, maxStart: 22, retireAt: 33, sport: true, injury: 0.1, req: { minStat: { health: 70 } }, levels: [['Cầu thủ trẻ CLB', 6], ['Cầu thủ chính VĐQG', 15], ['Chủ công trụ cột', 30], ['Tuyển thủ quốc gia', 45]], prize: [[0, 8], [10, 80], [40, 250], [100, 800]], selfFund: 0, loc: 'court', style: 'jersey', fame: true },
    hoasi: { title: 'Họa sĩ', icon: '🎨', minAge: 18, volatile: true, req: { minStat: { smarts: 50 } }, levels: [['Họa sĩ vẽ thuê', 5], ['Họa sĩ có triển lãm', 14], ['Họa sĩ nổi tiếng', 40], ['Danh họa', 110]], loc: 'studio', style: 'shirt', fame: true },
    nhaccong: { title: 'Nhạc công', icon: '🎸', minAge: 16, req: { minStat: { smarts: 45 } }, levels: [['Nhạc công quán bar', 6], ['Nhạc công ban nhạc', 13], ['Nhạc công dàn nhạc giao hưởng', 22], ['Nhạc sĩ nổi tiếng', 60]], loc: 'karaoke', style: 'jacket', fame: true },
    hlv: { title: 'Huấn luyện viên thể thao', icon: '📋', minAge: 28, req: { flag: 'ex_athlete' }, levels: [['Trợ lý huấn luyện viên', 15], ['HLV trưởng câu lạc bộ', 40], ['HLV đội tuyển quốc gia', 90]], loc: 'stadium', style: 'polo' },
    dienvien: { title: 'Diễn viên', icon: '🎬', minAge: 16, req: { minStat: { looks: 60 } }, levels: [['Diễn viên quần chúng', 4], ['Diễn viên phụ', 15], ['Diễn viên chính', 55], ['Ngôi sao màn bạc', 120]], loc: 'studio', style: 'shirt', fame: true },
    nguoimau: { title: 'Người mẫu', icon: '📸', minAge: 16, maxStart: 26, retireAt: 40, req: { minStat: { looks: 75 } }, levels: [['Người mẫu ảnh', 6], ['Người mẫu sàn diễn', 25], ['Siêu mẫu', 90]], loc: 'studio', style: 'suit', fame: true },
    tiepvien: { title: 'Tiếp viên hàng không', icon: '🛫', minAge: 18, maxStart: 30, req: { hs: true, minStat: { looks: 65, health: 60 } }, levels: [['Tiếp viên', 18], ['Tiếp viên trưởng', 30], ['Quản lý đoàn tiếp viên', 45]], loc: 'airport', style: 'suit' },
    phicong: { title: 'Phi công', icon: '✈️', minAge: 22, maxStart: 35, fee: 1.8 * TY, req: { degree: true, minMoney: 1.8 * TY, minStat: { smarts: 65, health: 70 } }, levels: [['Học viên phi công', 20], ['Cơ phó', 90], ['Cơ trưởng', 180], ['Phi công huấn luyện', 240]], loc: 'airport', style: 'uniform' },
    cuuhoa: { title: 'Lính cứu hỏa', icon: '🚒', minAge: 18, maxStart: 30, req: { hs: true, minStat: { health: 65 } }, levels: [['Chiến sĩ PCCC', 8], ['Tiểu đội trưởng', 12], ['Đội trưởng cứu nạn', 18], ['Trưởng phòng PCCC', 26]], loc: 'street', style: 'uniform' },
    khoahoc: { title: 'Nhà khoa học', icon: '🔬', minAge: 24, req: { degree: true, minStat: { smarts: 80 } }, levels: [['Nghiên cứu viên', 12], ['Tiến sĩ', 25], ['Phó giáo sư', 40], ['Giáo sư đầu ngành', 65]], loc: 'university', style: 'coat' },
    nongdan: { title: 'Nông dân', icon: '🧑‍🌾', minAge: 16, levels: [['Làm ruộng thuê', 4], ['Chủ vườn', 9], ['Chủ trang trại', 28]], loc: 'countryside', style: 'tshirt' },
    giangho: { title: 'Dân anh chị', icon: '🦹', minAge: 15, volatile: true, req: { flag: 'gh_invite' }, levels: [['Đàn em', 6], ['Tay chân thân tín', 15], ['Đàn anh khu phố', 35], ['Đại ca', 80], ['Trùm giang hồ', 200]], loc: 'street', style: 'jacket' },
  };
  // nghề chỉ có từ một thời điểm (sống theo thời đại)
  Object.assign(CAREERS.laptrinh, { since: 1990 }); Object.assign(CAREERS.streamer, { since: 2012 }); Object.assign(CAREERS.esports, { since: 2012 });
  Object.assign(CAREERS.taixe, { since: 2015 }); Object.assign(CAREERS.shipper, { since: 2008 }); Object.assign(CAREERS.marketing, { since: 1995 });
  Object.assign(CAREERS.kinhdoanh, { since: 1986 }); Object.assign(CAREERS.nguoimau, { since: 1990 }); Object.assign(CAREERS.thietke, { since: 1995 });
  Object.assign(CAREERS.tiepvien, { since: 1956 }); Object.assign(CAREERS.phicong, { since: 1956 }); Object.assign(CAREERS.nganhang, { since: 1951 });
  // nội thất tự chọn: mỗi chỗ đặt một món, hiện trong cảnh “Nhà” (env_indoor.js furniture), cộng hạnh phúc mỗi năm
  const FURN_SLOTS = { rug: 'Thảm giữa nhà', plant: 'Cây cảnh', lamp: 'Đèn trang trí', art: 'Tranh treo tường', corner: 'Góc phòng', shelf: 'Kệ / tủ' };
  const FURNITURE = [
    { id: 'rug_long', slot: 'rug', name: 'Thảm lông trắng', icon: '🧶', price: 8 * TR, joy: 0.4 },
    { id: 'rug_batu', slot: 'rug', name: 'Thảm Ba Tư dệt tay', icon: '🟥', price: 45 * TR, joy: 0.9 },
    { id: 'plant_kimtien', slot: 'plant', name: 'Cây kim tiền', icon: '🪴', price: 1.5 * TR, joy: 0.3 },
    { id: 'plant_dao', slot: 'plant', name: 'Cây đào thế', icon: '🌸', price: 15 * TR, joy: 0.6 },
    { id: 'plant_bonsai', slot: 'plant', name: 'Bonsai tùng cổ', icon: '🌲', price: 60 * TR, joy: 1 },
    { id: 'lamp_hoian', slot: 'lamp', name: 'Đèn lồng Hội An', icon: '🏮', price: 2 * TR, joy: 0.3 },
    { id: 'lamp_bacau', slot: 'lamp', name: 'Đèn cây Bắc Âu', icon: '💡', price: 6 * TR, joy: 0.4 },
    { id: 'art_dongho', slot: 'art', name: 'Tranh Đông Hồ', icon: '🖼️', price: 3 * TR, joy: 0.4 },
    { id: 'art_truutuong', slot: 'art', name: 'Tranh trừu tượng', icon: '🎨', price: 25 * TR, joy: 0.6 },
    { id: 'art_sonmai', slot: 'art', name: 'Tranh sơn mài', icon: '🏯', price: 80 * TR, joy: 1 },
    { id: 'corner_aquarium', slot: 'corner', name: 'Bể cá cảnh', icon: '🐠', price: 6 * TR, joy: 0.6 },
    { id: 'corner_tuong', slot: 'corner', name: 'Tượng Phật Di Lặc', icon: '🗿', price: 35 * TR, joy: 0.8 },
    { id: 'corner_ruou', slot: 'corner', name: 'Tủ rượu vang', icon: '🍷', price: 90 * TR, joy: 0.9 },
    { id: 'corner_piano', slot: 'corner', name: 'Đàn piano đứng', icon: '🎹', price: 120 * TR, joy: 1.2 },
    { id: 'shelf_sach', slot: 'shelf', name: 'Kệ sách gỗ', icon: '📚', price: 10 * TR, joy: 0.5 },
    { id: 'shelf_cup', slot: 'shelf', name: 'Tủ cúp & kỷ niệm', icon: '🏆', price: 15 * TR, joy: 0.6 },
    { id: 'shelf_loa', slot: 'shelf', name: 'Dàn loa karaoke', icon: '🔊', price: 30 * TR, joy: 0.8 },
  ];
  // thú cưng: chó mèo có mô hình 3D; các loài khác chỉ hiện trong danh sách quan hệ
  const PET_SPECIES = [
    { id: 'chota', kind: 'dog', name: 'Chó ta', icon: '🐕', price: 0, life: 13, desc: 'Khôn, trung thành, giữ nhà giỏi.' },
    { id: 'phuquoc', kind: 'dog', name: 'Chó Phú Quốc', icon: '🐕', price: 6 * TR, life: 13, desc: 'Giống chó quý xoáy lưng, nhanh nhẹn.' },
    { id: 'corgi', kind: 'dog', name: 'Corgi', icon: '🐶', price: 25 * TR, life: 13, desc: 'Chân ngắn mông to, cưng xỉu.' },
    { id: 'husky', kind: 'dog', name: 'Husky', icon: '🐺', price: 15 * TR, life: 13, desc: 'Mặt ngáo, phá nhà cực đỉnh.' },
    { id: 'poodle', kind: 'dog', name: 'Poodle', icon: '🐩', price: 12 * TR, life: 15, desc: 'Lông xoăn, thông minh, dễ dạy.' },
    { id: 'muop', kind: 'cat', name: 'Mèo mướp', icon: '🐈', price: 0, life: 15, desc: 'Bắt chuột số một xóm.' },
    { id: 'aln', kind: 'cat', name: 'Mèo Anh lông ngắn', icon: '🐱', price: 20 * TR, life: 15, desc: 'Mặt tròn, lười, ngủ cả ngày.' },
    { id: 'batu', kind: 'cat', name: 'Mèo Ba Tư', icon: '🐱', price: 30 * TR, life: 14, desc: 'Lông dài sang chảnh, khó chiều.' },
    { id: 'vet', kind: 'bird', name: 'Vẹt Macaw', icon: '🦜', price: 40 * TR, life: 45, desc: 'Biết nói, sống lâu hơn cả chủ.' },
    { id: 'tho', kind: 'rabbit', name: 'Thỏ', icon: '🐇', price: 1 * TR, life: 9, desc: 'Gặm cà rốt, gặm luôn dây điện.' },
    { id: 'hamster', kind: 'hamster', name: 'Chuột hamster', icon: '🐹', price: 0.3 * TR, life: 3, desc: 'Chạy vòng quay cả đêm.' },
    { id: 'rua', kind: 'turtle', name: 'Rùa cảnh', icon: '🐢', price: 2 * TR, life: 80, desc: 'Chậm mà chắc, sống rất lâu.' },
    { id: 'carong', kind: 'fish', name: 'Cá rồng huyết long', icon: '🐉', price: 150 * TR, life: 20, desc: 'Cá phong thủy, “hút tài lộc” cho chủ làm ăn.' },
  ];
  // tính cách con cái (nuôi dạy con)
  const CHILD_TRAITS = {
    ngoan: { label: 'Ngoan ngoãn', icon: '😇', smart: 2, fate: 8 },
    hieuhoc: { label: 'Hiếu học', icon: '📖', smart: 6, fate: 10 },
    nghich: { label: 'Nghịch ngợm', icon: '😜', smart: 0, fate: 0 },
    nhaycam: { label: 'Nhạy cảm', icon: '🥺', smart: 2, fate: 2 },
    noiloan: { label: 'Nổi loạn', icon: '😤', smart: -2, fate: -10 },
    lamhbieng: { label: 'Lười biếng', icon: '🦥', smart: -5, fate: -8 },
    nangkhieu: { label: 'Có năng khiếu', icon: '🌟', smart: 3, fate: 12 },
  };
  // công ty riêng: vốn, biên lợi nhuận, độ biến động
  const INDUSTRIES = [
    { id: 'quan', name: 'Quán ăn – cà phê', icon: '☕', cost: 300 * TR, margin: 0.16, vol: 1, since: 1986, loc: 'cafe', prefix: 'Quán', desc: 'Vốn ít, dễ bắt đầu, cạnh tranh khốc liệt.' },
    { id: 'thoitrang', name: 'Thời trang', icon: '👗', cost: 800 * TR, margin: 0.14, vol: 1.1, since: 1990, loc: 'market', prefix: 'Thời trang', desc: 'Bắt trend thì lãi to, lỗi mốt thì ôm hàng.' },
    { id: 'xnk', name: 'Xuất nhập khẩu', icon: '🚢', cost: 2 * TY, margin: 0.12, vol: 1.1, since: 1990, loc: 'office', prefix: 'Công ty XNK', desc: 'Buôn bán với nước ngoài, ăn theo tỷ giá.' },
    { id: 'phanmem', name: 'Công ty phần mềm', icon: '💻', cost: 1.5 * TY, margin: 0.2, vol: 1.3, since: 1996, smarts: 65, loc: 'office', prefix: 'Công nghệ', desc: 'Cần đầu óc, tăng trưởng nhanh.' },
    { id: 'xaydung', name: 'Xây dựng', icon: '🏗️', cost: 5 * TY, margin: 0.12, vol: 1, since: 1990, loc: 'street', prefix: 'Xây dựng', desc: 'Dự án lớn, dòng tiền lớn, rủi ro nợ đọng.' },
    { id: 'batdongsan', name: 'Bất động sản', icon: '🏙️', cost: 20 * TY, margin: 0.15, vol: 1.5, since: 1993, loc: 'office', prefix: 'Địa ốc', desc: 'Sốt thì giàu nhanh, vỡ bong bóng thì trắng tay.' },
    { id: 'ai', name: 'Startup trí tuệ nhân tạo', icon: '🤖', cost: 3 * TY, margin: 0.22, vol: 1.8, since: 2023, smarts: 75, loc: 'office', prefix: 'AI', desc: 'Một là kỳ lân tỷ đô, hai là đóng cửa sau hai năm.' },
    // mở cơ sở riêng theo nghề: cần đang làm đúng nghề và đạt “Giỏi nghề” trở lên; danh tiếng nghề giúp cơ sở lớn nhanh
    { id: 'phongkham', name: 'Phòng khám tư', icon: '🏥', cost: 3 * TY, margin: 0.2, vol: 0.8, since: 1990, career: ['bacsi', 'duocsi', 'dieuduong'], loc: 'hospital', prefix: 'Phòng khám', desc: 'Bệnh nhân tin tay nghề của bạn. Ổn định, ít rủi ro.' },
    { id: 'trungtam', name: 'Trung tâm luyện thi', icon: '📚', cost: 600 * TR, margin: 0.2, vol: 0.9, since: 1990, career: ['giaovien', 'khoahoc', 'phiendich'], loc: 'school', prefix: 'Trung tâm', desc: 'Phụ huynh xếp hàng nếu học trò của bạn đỗ cao.' },
    { id: 'nhahang', name: 'Nhà hàng của bếp trưởng', icon: '🍲', cost: 1.2 * TY, margin: 0.17, vol: 1, since: 1986, career: ['daubep', 'phucvu'], loc: 'cafe', prefix: 'Nhà hàng', desc: 'Món ngon giữ khách, review tốt kéo khách.' },
    { id: 'vanphongluat', name: 'Văn phòng luật', icon: '⚖️', cost: 800 * TR, margin: 0.22, vol: 0.8, since: 1990, career: ['luatsu'], loc: 'office', prefix: 'Văn phòng luật', desc: 'Thắng vài vụ lớn là khách tự tìm đến.' },
    { id: 'salon', name: 'Salon tóc – làm đẹp', icon: '💈', cost: 400 * TR, margin: 0.18, vol: 1, since: 1990, career: ['thocattoc', 'nguoimau'], loc: 'street', prefix: 'Salon', desc: 'Tay nghề và mạng xã hội quyết định đông khách.' },
    { id: 'studio_tk', name: 'Studio thiết kế – kiến trúc', icon: '📐', cost: 1 * TY, margin: 0.2, vol: 1.1, since: 1995, career: ['thietke', 'kientrucsu', 'kysu'], loc: 'office', prefix: 'Studio', desc: 'Một công trình đẹp kéo theo mười hợp đồng.' },
    { id: 'lu_hanh', name: 'Công ty lữ hành', icon: '🧳', cost: 1.5 * TY, margin: 0.15, vol: 1.2, since: 1995, career: ['huongdanvien', 'tiepvien', 'phicong'], loc: 'beach', prefix: 'Du lịch', desc: 'Mùa cao điểm đắt khách, dịch bệnh thì trắng tay.' },
    { id: 'hocvien_tt', name: 'Học viện thể thao', icon: '🏟️', cost: 2 * TY, margin: 0.15, vol: 0.9, since: 2000, career: ['hlv', 'cauthu', 'bongro', 'vdv_vo', 'caulong', 'boi', 'dienkinh', 'bongchuyen'], loc: 'stadium', prefix: 'Học viện', desc: 'Tên tuổi của bạn chiêu sinh thay quảng cáo.' },
    { id: 'agency', name: 'Agency truyền thông', icon: '📣', cost: 1 * TY, margin: 0.2, vol: 1.3, since: 2010, career: ['marketing', 'streamer', 'nhabao', 'casi', 'dienvien'], loc: 'office', prefix: 'Agency', desc: 'Sống bằng các chiến dịch viral cho nhãn hàng.' },
    { id: 'trangtrai', name: 'Trang trại công nghệ cao', icon: '🌱', cost: 1.5 * TY, margin: 0.15, vol: 1, since: 2010, career: ['nongdan', 'kysunn'], loc: 'countryside', prefix: 'Nông trại', desc: 'Nông sản sạch bán giá cao, phụ thuộc thời tiết.' },
  ];
  // mô tả nghề + những biến cố có thể gặp (mỗi biến cố đều có tình huống thật trong events_career_*.js)
  const CAREER_INFO = {
    phucvu: ['Bưng bê, pha chế, chiều khách đủ kiểu.', ['Khách quỵt tiền', 'Bị chủ quán trừ lương', 'Được khách quen boa đậm']],
    shipper: ['Chạy xe khắp phố, nắng mưa không nghỉ.', ['Khách bom hàng', 'Va quẹt giữa đường', 'Đơn hàng bí ẩn lúc nửa đêm']],
    congnhan: ['Ca kíp, tăng ca, lương đều đặn.', ['Tai nạn lao động', 'Bị cắt giảm ca', 'Được lên tổ trưởng']],
    taixe: ['Chở khách đủ loại, mỗi chuyến một câu chuyện.', ['Khách say xỉn', 'Bị đánh giá 1 sao oan', 'Nhặt được đồ khách quên']],
    banhang: ['Đứng quầy, chốt đơn, chạy doanh số.', ['Khách khó tính làm loạn', 'Mất hàng cuối ca', 'Đạt doanh số được thưởng']],
    thocattoc: ['Kéo, lược và những câu chuyện của khách.', ['Cắt hỏng tóc khách', 'Mở tiệm riêng', 'Khách nổi tiếng ghé tiệm']],
    daubep: ['Bếp nóng, áp lực giờ cao điểm.', ['Bị bỏng trong bếp', 'Món ăn bị chê trên mạng', 'Thi nấu ăn truyền hình']],
    laptrinh: ['Code, họp, sửa lỗi lúc nửa đêm.', ['Lỗi sập hệ thống', 'Lời mời từ công ty nước ngoài', 'Làm việc quá sức']],
    bacsi: ['Cứu người, trực đêm, áp lực sinh tử.', ['Ca mổ khó lúc nửa đêm', 'Người nhà bệnh nhân hành hung', 'Phong bì cảm ơn']],
    giaovien: ['Đứng lớp, chấm bài, thương học trò.', ['Phụ huynh ép sửa điểm', 'Học trò cá biệt', 'Thư cảm ơn sau nhiều năm']],
    ketoan: ['Sổ sách, báo cáo, cuối tháng chạy deadline.', ['Sếp nhờ làm sổ sách hai mặt', 'Thanh tra thuế', 'Phát hiện thất thoát']],
    marketing: ['Ý tưởng, chiến dịch, số liệu.', ['Chiến dịch bị “bóc phốt”', 'Ý tưởng bị cướp công', 'Chiến dịch viral']],
    kysu: ['Công trường, bản vẽ, tiến độ.', ['Sự cố sập giàn giáo', 'Nhà thầu đưa phong bì rút ruột công trình', 'Bàn giao công trình lớn']],
    luatsu: ['Hồ sơ, phiên tòa, đạo đức nghề.', ['Thân chủ có tội nhưng trả giá cao', 'Bị đe dọa vì vụ án', 'Vụ án lớn đầu tiên']],
    nhabao: ['Săn tin, viết bài, đối mặt sự thật.', ['Bị mua chuộc để gỡ bài', 'Điều tra đường dây phạm pháp', 'Tin nóng nhưng chưa kiểm chứng']],
    thietke: ['Màu sắc, bố cục và khách hàng “sửa lần cuối”.', ['Khách sửa 20 lần', 'Bị đạo thiết kế', 'Giải thưởng thiết kế']],
    casi: ['Sân khấu, ánh đèn và áp lực nổi tiếng.', ['Hát nhép bị lộ', 'Scandal đời tư', 'Đêm nhạc riêng cháy vé']],
    streamer: ['Lên sóng mỗi tối, sống nhờ người xem.', ['Bị antifan tấn công', 'Nhà tài trợ “bẩn”', 'Livestream triệu view']],
    cauthu: ['Tập luyện khắc nghiệt, sự nghiệp ngắn mà rực rỡ. Giải nghệ khoảng 35 tuổi.', ['Đứt dây chằng', 'Lời mời bán độ', 'Được gọi lên tuyển quốc gia', 'Lời mời chơi bóng nước ngoài', 'Giải nghệ']],
    kinhdoanh: ['Tự làm chủ, lời ăn lỗ chịu.', ['Đối tác lừa đảo', 'Thanh tra đột xuất', 'Mở thêm chi nhánh']],
    giangho: ['Bảo kê, đòi nợ, tranh địa bàn. Tiền nhanh, đường ngắn.', ['Tranh địa bàn', 'Bị công an truy bắt', 'Đàn em phản bội', 'Vào tù']],
    congchuc: ['Ổn định, giờ hành chính, nhiều thủ tục.', ['Bị gợi ý nhận phong bì', 'Thi nâng ngạch', 'Bị điều chuyển công tác']],
    phiendich: ['Cầu nối giữa hai ngôn ngữ.', ['Dịch sai trong cuộc đàm phán lớn', 'Đi công tác nước ngoài', 'Bị AI cạnh tranh']],
    nganhang: ['Chỉ tiêu, hồ sơ vay, áp lực doanh số.', ['Áp chỉ tiêu bán bảo hiểm', 'Khách vay bỏ trốn', 'Phát hiện giao dịch gian lận']],
    kientrucsu: ['Vẽ nên những ngôi nhà người khác sống cả đời.', ['Chủ đầu tư ép sửa thiết kế', 'Thắng cuộc thi thiết kế', 'Công trình bị chậm tiến độ']],
    duocsi: ['Nhà thuốc, đơn thuốc, sức khỏe cộng đồng.', ['Bị ép bán thuốc không đơn', 'Thuốc giả trà trộn', 'Mở chuỗi nhà thuốc']],
    dieuduong: ['Chăm bệnh nhân, trực ca dài.', ['Bệnh nhân khó tính', 'Ca trực dịch bệnh căng thẳng', 'Được bệnh nhân nhớ ơn']],
    huongdanvien: ['Dẫn đoàn đi khắp nơi, xa nhà triền miên.', ['Khách lạc đoàn ở nước ngoài', 'Ép khách mua hàng để ăn hoa hồng', 'Tour trọn vẹn được khen']],
    canhsat: ['Giữ bình yên, đối mặt hiểm nguy.', ['Truy bắt tội phạm có vũ khí', 'Bị mời “bỏ qua” vi phạm', 'Lập chiến công']],
    kysunn: ['Đồng ruộng, giống cây, mùa vụ.', ['Mất mùa vì thiên tai', 'Giống lúa mới thành công', 'Thương lái ép giá']],
    vdv_vo: ['Lên sàn đấu, mồ hôi và máu. Giải nghệ khoảng 36 tuổi.', ['Chấn thương nặng trên sàn', 'Bị ép thua độ', 'Trận tranh đai vô địch', 'Đấu ở nước ngoài', 'Giải nghệ']],
    caulong: ['Tập luyện từ nhỏ, sân đấu quốc tế. Giải nghệ khoảng 34 tuổi.', ['Chấn thương vai', 'Bị loại khỏi đội tuyển', 'Huy chương SEA Games', 'Tấm vé dự Olympic', 'Giải nghệ']],
    esports: ['Phản xạ, chiến thuật, cày rank ngày đêm. Giải nghệ khoảng 30 tuổi.', ['Bị dụ dàn xếp trận đấu', 'Đội tan rã', 'Chung kết thế giới', 'Kiệt sức vì luyện tập', 'Giải nghệ']],
    bongro: ['Chiều cao, bật nhảy và những cú ném ba điểm. Giải nghệ khoảng 34 tuổi. Giỏi có thể sang ABL, Nhật, châu Âu, thậm chí NBA.', ['Chấn thương đầu gối', 'Lời mời thi đấu nước ngoài', 'Bị cắt hợp đồng', 'Lên tuyển quốc gia', 'Giải nghệ']],
    chinhtri: ['Từ cán bộ phường lên lãnh đạo tỉnh. Quyền lực càng lớn, cám dỗ càng nhiều.', ['Phong bì “cảm ơn” dự án', 'Tiếp dân khiếu nại đất đai', 'Chạy chức', 'Phiếu tín nhiệm', 'Chỉ đạo chống bão lũ', 'Bị thanh tra, điều tra']],
    boi: ['Sáng nào cũng 5 giờ xuống bể, mỗi ngày bơi hàng chục cây số. Giải nghệ khoảng 30 tuổi.', ['Chuột rút giữa đường đua', 'Phá kỷ lục quốc gia', 'Huy chương SEA Games', 'Giải nghệ']],
    dienkinh: ['Từng phần trăm giây là cả một năm khổ luyện. Giải nghệ khoảng 32 tuổi.', ['Chấn thương cơ đùi', 'Phá kỷ lục SEA Games', 'Bị dụ dùng doping', 'Giải nghệ']],
    bongchuyen: ['Bật nhảy, đập bóng, đội hình ăn ý. Giải nghệ khoảng 33 tuổi.', ['Chấn thương cổ chân', 'Được gọi lên tuyển', 'Sang Thái Lan thi đấu', 'Giải nghệ']],
    hoasi: ['Sống bằng màu vẽ: có năm bán tranh đắt như tôm tươi, có năm ăn mì gói.', ['Tranh bị đạo', 'Triển lãm cá nhân', 'Đại gia mua tranh giá cao', 'Bế tắc sáng tác']],
    nhaccong: ['Đêm nào cũng chạy show, ngón tay chai sạn. Có thể nổi tiếng nhờ một bản hit.', ['Chạy show xuyên đêm', 'Bản nhạc bị đạo', 'Bài hát thành hit', 'Mất hứng sáng tác']],
    hlv: ['Dẫn dắt thế hệ sau. Chỉ dành cho vận động viên đã giải nghệ.', ['Học trò bị dụ bán độ', 'Bị sa thải sau chuỗi thua', 'Đưa đội lên ngôi vô địch']],
    dienvien: ['Phim trường, vai diễn và ánh hào quang.', ['Bị gạ gẫm đổi vai', 'Phim bị khán giả chê', 'Vai diễn để đời']],
    nguoimau: ['Sàn diễn, ống kính, giữ dáng khắt khe. Giải nghệ khoảng 40 tuổi.', ['Bị ép giảm cân cấp tốc', 'Hợp đồng quảng cáo lớn', 'Diễn ở tuần lễ thời trang quốc tế']],
    tiepvien: ['Bay khắp nơi, phục vụ trên độ cao 10.000 m.', ['Hành khách gây rối', 'Chuyến bay gặp nhiễu động mạnh', 'Được xách hàng “nhờ”']],
    phicong: ['Phí đào tạo khoảng 1,8 tỷ, lương cao, trách nhiệm hàng trăm sinh mạng.', ['Sự cố động cơ trên không', 'Bay khi mệt mỏi', 'Lên cơ trưởng']],
    cuuhoa: ['Lao vào nơi người khác chạy ra.', ['Đám cháy chung cư lúc nửa đêm', 'Cứu người mắc kẹt', 'Hít phải khói độc']],
    khoahoc: ['Phòng thí nghiệm, bài báo, những đêm không ngủ.', ['Thí nghiệm thất bại liên tục', 'Bị đạo đề tài', 'Công trình được quốc tế công nhận']],
    nongdan: ['Một nắng hai sương, trông trời trông đất.', ['Mất mùa vì bão lũ', 'Được mùa mất giá', 'Bán hàng online thành công']],
  };
  Object.keys(CAREERS).forEach((id) => { const c = CAREERS[id]; c.id = id; c.levels = c.levels.map(([t, s]) => ({ title: t, salary: s * TR })); const inf = CAREER_INFO[id] || ['', []]; c.desc = inf[0]; c.incidents = inf[1]; });
  CAREERS.kinhdoanh.fee = 150 * TR;

  const SHOP = [
    { id: 'phone1', type: 'phone', name: 'Điện thoại phổ thông', price: 2 * TR, icon: '📱', happy: 2, desc: 'Nghe gọi, nhắn tin, chơi rắn săn mồi.' },
    { id: 'phone2', type: 'phone', name: 'Smartphone tầm trung', price: 8 * TR, icon: '📱', happy: 4, desc: 'Lướt mạng mượt, chụp ảnh đẹp.' },
    { id: 'phone3', type: 'phone', name: 'Điện thoại cao cấp', price: 32 * TR, icon: '📱', happy: 7, desc: 'Sang chảnh, ai nhìn cũng trầm trồ.' },
    { id: 'bike1', type: 'motorbike', name: 'Xe số 110cc', price: 22 * TR, icon: '🛵', happy: 5, desc: 'Bền bỉ, tiết kiệm xăng, chở được cả nhà.' },
    { id: 'bike2', type: 'motorbike', name: 'Xe tay ga', price: 48 * TR, icon: '🛵', happy: 7, desc: 'Cốp rộng, đi phố nhàn tênh.' },
    { id: 'bike3', type: 'motorbike', name: 'Mô tô phân khối lớn', price: 320 * TR, icon: '🏍️', happy: 10, desc: 'Tiếng pô làm cả xóm ngoái nhìn.' },
    { id: 'car1', type: 'car', name: 'Ô tô cỡ nhỏ', price: 520 * TR, icon: '🚗', happy: 10, desc: 'Che mưa che nắng, khỏi lo ngập nước.' },
    { id: 'car2', type: 'car', name: 'Sedan hạng trung', price: 950 * TR, icon: '🚘', happy: 13, desc: 'Êm ái, lịch lãm, đi đám cưới không ngại.' },
    { id: 'car3', type: 'car', name: 'SUV 7 chỗ', price: 1.6 * TY, icon: '🚙', happy: 16, desc: 'Chở cả đại gia đình về quê ăn Tết.' },
    { id: 'house1', type: 'house', name: 'Căn hộ chung cư', price: 2.6 * TY, icon: '🏢', happy: 18, desc: 'Có thang máy, có hồ bơi, có chỗ để xe.' },
    { id: 'house2', type: 'house', name: 'Nhà phố', price: 6.5 * TY, icon: '🏠', happy: 22, desc: 'Nhà mặt phố, bố làm to — à không, tự mình làm to.' },
    { id: 'house3', type: 'house', name: 'Biệt thự', price: 22 * TY, icon: '🏡', happy: 30, desc: 'Sân vườn, hồ cá Koi, cổng tự động.' },
    { id: 'land1', type: 'land', name: 'Đất nền ở quê', price: 900 * TR, icon: '🌾', happy: 6, desc: 'Để dành, biết đâu sau này lên giá.' },
    { id: 'gold1', type: 'gold', name: 'Một lượng vàng', price: 85 * TR, icon: '🪙', happy: 3, desc: 'Giá lên xuống theo năm. Của để dành.' },
    { id: 'watch1', type: 'luxury', name: 'Đồng hồ Thụy Sĩ', price: 450 * TR, icon: '⌚', happy: 8, desc: 'Máy cơ lộ tim, đeo vào tự thấy mình đẳng cấp.' },
    { id: 'bag1', type: 'luxury', name: 'Túi hiệu bản giới hạn', price: 600 * TR, icon: '👜', happy: 9, desc: 'Phải xếp hàng chờ nửa năm mới được mua.' },
    { id: 'art1', type: 'luxury', name: 'Tranh sơn mài nghệ nhân', price: 1.2 * TY, icon: '🖼️', happy: 7, desc: 'Treo phòng khách, khách đến ai cũng trầm trồ. Giá trị tăng dần theo năm.' },
    { id: 'car4', type: 'car', name: 'Siêu xe thể thao', price: 16 * TY, icon: '🏎️', happy: 22, desc: 'Tiếng máy gầm lên là cả phố ngoái nhìn.' },
    { id: 'house4', type: 'house', name: 'Penthouse view sông', price: 45 * TY, icon: '🌇', happy: 34, desc: 'Tầng thượng, hồ bơi riêng, ngắm pháo hoa từ phòng khách.' },
    { id: 'yacht1', type: 'luxury', name: 'Du thuyền riêng', price: 60 * TY, icon: '🛥️', happy: 30, desc: 'Cuối tuần ra vịnh Hạ Long, mời cả họ lên chơi.' },
  ];
  // lợi ích lâu dài khi sở hữu: joy = hạnh phúc nền mỗi năm, prestige = đẳng cấp, looksY = ngoại hình mỗi năm,
  // rent = lợi suất cho thuê mỗi năm (tỷ lệ giá trị), fam = gắn kết gia đình mỗi năm, unlock = hoạt động mở khóa
  const ASSET_PERKS = {
    phone1: { joy: 0.5 }, phone2: { joy: 1, smartsY: 0.5 }, phone3: { joy: 1.5, prestige: 1, smartsY: 0.5 },
    bike1: { joy: 1, unlock: 'phuot' }, bike2: { joy: 1.5, unlock: 'phuot' }, bike3: { joy: 3, prestige: 2, unlock: 'phuot' },
    car1: { joy: 2, prestige: 2, fam: 1, unlock: 'roadtrip' }, car2: { joy: 3, prestige: 3, fam: 1, unlock: 'roadtrip' }, car3: { joy: 3.5, prestige: 3, fam: 2, unlock: 'roadtrip' },
    car4: { joy: 5, prestige: 7, looksY: 1, unlock: 'roadtrip' },
    house1: { joy: 3, prestige: 3, fam: 2, rent: 0.04, unlock: 'housewarm' }, house2: { joy: 4, prestige: 5, fam: 2, rent: 0.035, unlock: 'housewarm' },
    house3: { joy: 6, prestige: 8, fam: 3, rent: 0.03, unlock: 'housewarm' }, house4: { joy: 7, prestige: 10, fam: 3, rent: 0.03, unlock: 'housewarm' },
    land1: { joy: 0.5, prestige: 1, rent: 0.015 }, gold1: {},
    watch1: { joy: 2, prestige: 2, looksY: 1 }, bag1: { joy: 2, prestige: 2, looksY: 1 }, art1: { joy: 1.5, prestige: 2, smartsY: 0.5 },
    yacht1: { joy: 6, prestige: 8, fam: 2, unlock: 'yachtparty' },
  };
  SHOP.forEach((it) => Object.assign(it, ASSET_PERKS[it.id] || {}));
  // đẳng cấp xã hội theo tổng điểm prestige
  const PRESTIGE_RANKS = [[0, 'Bình dân'], [3, 'Khá giả'], [8, 'Có của ăn của để'], [15, 'Đại gia'], [25, 'Giới thượng lưu']];

  // Quà tặng — likes: kid (<13) · teen (13–19) · adult · elder (≥55) · love (người yêu / vợ chồng) · pet
  const GIFTS = [
    { id: 'thiep', name: 'Thiệp tự vẽ', icon: '💌', price: 0, likes: ['kid', 'elder', 'love'], desc: 'Không tốn đồng nào, chỉ tốn tấm lòng.' },
    { id: 'keo', name: 'Túi kẹo bánh', icon: '🍬', price: 50e3, likes: ['kid'], desc: 'Kẹo dẻo, bánh quy, sô-cô-la.' },
    { id: 'trasua', name: 'Trà sữa full topping', icon: '🧋', price: 70e3, likes: ['teen', 'love'], desc: 'Trân châu đường đen, thêm pudding.' },
    { id: 'khanlen', name: 'Khăn len tự đan', icon: '🧣', price: 150e3, likes: ['elder', 'love'], desc: 'Đan ba tuần mới xong, hơi lệch một đường.' },
    { id: 'sach', name: 'Cuốn sách hay', icon: '📚', price: 200e3, likes: ['teen', 'adult'], desc: 'Kèm vài dòng đề tặng ở trang đầu.' },
    { id: 'banh', name: 'Hộp bánh ngọt', icon: '🍰', price: 300e3, likes: ['kid', 'elder'], desc: 'Bánh bông lan trứng muối, ai cũng thích.' },
    { id: 'hoa', name: 'Bó hoa hồng', icon: '💐', price: 400e3, likes: ['love', 'elder'], desc: 'Chín mươi chín bông thì không đủ tiền, chín bông thôi.' },
    { id: 'tra', name: 'Trà Thái Nguyên thượng hạng', icon: '🍵', price: 1.2e6, likes: ['elder'], desc: 'Cánh trà xoăn, nước xanh, hậu ngọt.' },
    { id: 'dochoi', name: 'Bộ đồ chơi xếp hình', icon: '🧸', price: 1.5e6, likes: ['kid'], desc: 'Hai nghìn mảnh, đủ chơi cả hè.' },
    { id: 'lixi', name: 'Phong bì lì xì', icon: '🧧', price: 2e6, likes: ['kid', 'teen', 'elder'], desc: 'Tiền mới cứng, gói trong phong bao đỏ.' },
    { id: 'son', name: 'Son môi hàng hiệu', icon: '💄', price: 1.8e6, likes: ['love'], fem: true, desc: 'Màu đỏ gạch đang hot.' },
    { id: 'giay', name: 'Giày thể thao', icon: '👟', price: 3.5e6, likes: ['teen', 'adult'], desc: 'Mẫu mới nhất, size vừa in.' },
    { id: 'nuochoa', name: 'Nước hoa Pháp', icon: '🌸', price: 4.5e6, likes: ['love', 'adult'], desc: 'Mùi hương khiến người ta nhớ mãi.' },
    { id: 'sam', name: 'Hộp sâm Hàn Quốc', icon: '🌿', price: 6e6, likes: ['elder'], desc: 'Bồi bổ sức khỏe, uống mỗi sáng.' },
    { id: 'tainghe', name: 'Tai nghe không dây', icon: '🎧', price: 6e6, likes: ['teen'], desc: 'Chống ồn, nghe nhạc cả ngày.' },
    { id: 'laptop', name: 'Laptop mới', icon: '💻', price: 28e6, likes: ['teen', 'adult'], desc: 'Học hành, làm việc, chơi game đều mượt.' },
    { id: 'vang', name: 'Dây chuyền vàng', icon: '📿', price: 30e6, likes: ['elder', 'love'], desc: 'Vàng 9999, có giấy kiểm định.' },
    { id: 'dienthoai', name: 'Điện thoại đời mới', icon: '📱', price: 32e6, likes: ['teen', 'adult'], desc: 'Vừa ra mắt tuần trước.' },
    { id: 'ghemassage', name: 'Ghế massage', icon: '💺', price: 45e6, likes: ['elder'], desc: 'Bấm nút là thư giãn từ cổ đến chân.' },
    { id: 'xemay', name: 'Xe tay ga', icon: '🛵', price: 50e6, likes: ['teen', 'adult'], minAge: 16, desc: 'Buộc nơ đỏ to đùng trên yên.' },
    { id: 'trangsuc', name: 'Nhẫn kim cương', icon: '💍', price: 80e6, likes: ['love'], desc: 'Lấp lánh dưới mọi ánh đèn.' },
    { id: 'dulich', name: 'Tour Nhật Bản cho hai người', icon: '✈️', price: 90e6, likes: ['love', 'elder', 'adult'], desc: 'Mùa hoa anh đào, khách sạn có suối nước nóng.' },
    { id: 'tui', name: 'Túi hiệu', icon: '👜', price: 120e6, likes: ['love', 'adult'], fem: true, desc: 'Logo nhìn từ xa đã biết hàng thật.' },
    { id: 'dongho', name: 'Đồng hồ Thụy Sĩ', icon: '⌚', price: 150e6, likes: ['adult', 'love'], desc: 'Máy cơ, mặt sapphire.' },
    { id: 'oto', name: 'Ô tô mới', icon: '🚗', price: 750e6, likes: ['adult', 'love'], minAge: 18, desc: 'Giao xe tận nhà, đeo hoa đỏ trên nắp capo.' },
    { id: 'nha', name: 'Căn hộ chung cư', icon: '🏢', price: 2.6e9, likes: ['adult', 'love'], minAge: 18, desc: 'Sổ hồng đứng tên người nhận.' },
    { id: 'pate', name: 'Pate và bánh thưởng', icon: '🦴', price: 120e3, likes: ['pet'], pet: true, desc: 'Món khoái khẩu nhất trần đời.' },
    { id: 'dochoipet', name: 'Đồ chơi cho thú cưng', icon: '🎾', price: 300e3, likes: ['pet'], pet: true, desc: 'Bóng cao su kêu chít chít.' },
    { id: 'spapet', name: 'Spa tắm tỉa lông', icon: '✂️', price: 600e3, likes: ['pet'], pet: true, desc: 'Thơm phức, lông mượt như nhung.' },
    { id: 'nhapet', name: 'Ổ nệm êm ái', icon: '🛏️', price: 1.5e6, likes: ['pet'], pet: true, desc: 'Ngủ say đến quên cả ăn.' },
  ];

  // Mức sống: phần thu nhập tiêu cho bản thân mỗi năm + ảnh hưởng tâm trạng/ngoại hình
  const LIFESTYLES = [
    { id: 'tietkiem', label: 'Tiết kiệm', icon: '🐷', share: 0.12, base: 0.85, happy: -3, looks: 0, desc: 'Ăn cơm nhà, ít đi chơi, dành dụm từng đồng.' },
    { id: 'binhthuong', label: 'Bình thường', icon: '🙂', share: 0.28, base: 1, happy: 0, looks: 0, desc: 'Sống vừa phải như phần đông mọi người.' },
    { id: 'thoaimai', label: 'Thoải mái', icon: '😎', share: 0.45, base: 1.15, happy: 3, looks: 1, desc: 'Cà phê mỗi sáng, cuối tuần đi chơi, quần áo đẹp.' },
    { id: 'sangchanh', label: 'Sang chảnh', icon: '💎', share: 0.65, base: 1.4, happy: 6, looks: 2, desc: 'Nhà hàng sang, hàng hiệu, du lịch liên miên.' },
  ];

  // Activities. effects: [min, max] ranges; scene: base scene; special handled by game.js
  const ACT_CATS = { body: 'Sức khỏe', mind: 'Trí tuệ', fun: 'Giải trí', love: 'Tình cảm', money: 'Tiền bạc', looks: 'Ngoại hình', soul: 'Tâm hồn' };
  const ACTIVITIES = [
    { id: 'gym', label: 'Tập gym', icon: '🏋️', cat: 'body', minAge: 14, cost: 300000, limit: 3, eff: { health: [3, 6], looks: [1, 3], happy: [1, 3] }, scene: { loc: 'gym', anim: 'lift', fx: 'sweat' }, texts: ['Bạn nâng tạ đến run cả tay, nhưng soi gương thấy bắp tay nhú lên một chút.', 'Một buổi tập "chân" đúng nghĩa: về nhà đi cầu thang như robot.', 'Huấn luyện viên khen bạn tiến bộ. Bạn giả vờ khiêm tốn nhưng cười tủm tỉm cả buổi.'] },
    { id: 'run', label: 'Chạy bộ công viên', icon: '🏃', cat: 'body', minAge: 8, cost: 0, limit: 3, eff: { health: [2, 4], happy: [1, 3] }, scene: { loc: 'park', anim: 'run', time: 'dawn' }, texts: ['Sáng sớm, bạn chạy ba vòng hồ. Không khí mát lạnh, đầu óc nhẹ tênh.', 'Bạn chạy cùng mấy cô chú tập dưỡng sinh. Họ còn khỏe hơn bạn!', 'Chạy xong, bạn thưởng cho mình một ly nước mía. Huề vốn calo.'] },
    { id: 'meditate', label: 'Thiền', icon: '🧘', cat: 'soul', minAge: 12, cost: 0, limit: 2, eff: { happy: [3, 6], health: [0, 2] }, scene: { loc: 'temple', anim: 'pray', fx: 'sparkle', time: 'dawn' }, texts: ['Bạn ngồi yên, nghe tiếng chuông chùa ngân xa. Mọi lo âu như tan đi.', 'Hít vào, thở ra. Lần đầu tiên trong tuần, bạn thấy mình thật sự nghỉ ngơi.'] },
    { id: 'doctor', label: 'Đi khám bệnh', icon: '🩺', cat: 'body', minAge: 0, cost: 800000, limit: 2, special: 'doctor', eff: { health: [3, 8] }, scene: { loc: 'hospital', anim: 'sit', npcs: [{ role: 'doctor', anim: 'talk' }] } },
    { id: 'read', label: 'Đọc sách', icon: '📚', cat: 'mind', minAge: 5, cost: 0, limit: 3, eff: { smarts: [2, 4], happy: [0, 2] }, scene: { loc: 'bedroom', anim: 'study', fx: 'idea' }, texts: ['Bạn đọc một mạch hết cuốn sách. Đèn bàn sáng đến khuya.', 'Một cuốn tiểu thuyết làm bạn khóc như mưa. Đáng đồng tiền bát gạo.', 'Bạn ghi chép được cả một cuốn sổ ý tưởng hay ho.'] },
    { id: 'english', label: 'Học tiếng Anh', icon: '🔤', cat: 'mind', minAge: 8, cost: 1000000, limit: 2, eff: { smarts: [2, 5] }, scene: { loc: 'cafe', anim: 'study', fx: 'idea' }, texts: ['"How are you?" — "I\'m fine, thank you, and you?" Bạn đã vượt qua câu thần chú quốc dân.', 'Bạn luyện nói với người nước ngoài ở phố đi bộ. Run, nhưng vui!', 'Từ vựng hôm nay: 50 từ. Nhớ được: 7 từ. Vẫn là tiến bộ!'] },
    { id: 'game', label: 'Chơi game', icon: '🎮', cat: 'fun', minAge: 6, cost: 0, limit: 3, eff: { happy: [3, 6], smarts: [-1, 1], health: [-1, 0] }, scene: { loc: 'bedroom', anim: 'type', fx: 'music' }, texts: ['Bạn leo rank thành công sau một đêm "cày" mệt nghỉ.', 'Đồng đội phá game. Bạn tắt máy trong cơn giận dỗi.', 'Bạn chơi với mấy đứa bạn đến tận nửa đêm, cười muốn rụng hàm.'] },
    { id: 'play', label: 'Đi chơi', icon: '🎈', cat: 'fun', minAge: 4, maxAge: 14, cost: 0, limit: 3, special: 'play', input: true, desc: 'Tự chọn hoặc gõ trò muốn chơi — sở thích sẽ định hướng nghề tương lai' },
    { id: 'cartoon', label: 'Xem hoạt hình', icon: '📺', cat: 'fun', minAge: 2, maxAge: 11, cost: 0, limit: 3, eff: { happy: [4, 7] }, scene: { loc: 'home', anim: 'laugh' }, texts: ['Bạn xem hoạt hình say mê đến quên cả ăn cơm.', 'Tập phim hôm nay hay quá, bạn kể lại cho cả nhà nghe ba lần.'] },
    { id: 'playfriends', label: 'Chơi với bạn bè', icon: '⚽', cat: 'fun', minAge: 4, maxAge: 14, cost: 0, limit: 3, eff: { happy: [3, 6], health: [1, 2] }, scene: { loc: 'park', anim: 'run', npcs: [{ role: 'kid', anim: 'run' }, { role: 'kid', anim: 'laugh' }] }, texts: ['Cả bọn chơi trốn tìm đến tối mịt mới chịu về.', 'Bạn đá bóng dép với lũ trẻ trong xóm. Thắng 3–2!', 'Nhảy dây, ô ăn quan, đánh chuyền… một buổi chiều không biết chán.'] },
    { id: 'cafe', label: 'Đi cà phê', icon: '☕', cat: 'fun', minAge: 15, cost: 60000, limit: 3, eff: { happy: [2, 4] }, scene: { loc: 'cafe', anim: 'drink' }, texts: ['Một ly cà phê sữa đá và một góc nhìn ra phố. Đủ để thấy đời đáng sống.', 'Bạn ngồi quán cả buổi chiều, nghe nhạc Trịnh, ngắm mưa.'] },
    { id: 'karaoke', label: 'Hát karaoke', icon: '🎤', cat: 'fun', minAge: 14, cost: 400000, limit: 2, eff: { happy: [4, 8] }, scene: { loc: 'karaoke', anim: 'sing', fx: 'music', time: 'night' }, texts: ['Bạn chiếm mic cả tối, hát hết các bản ballad buồn nhất có thể.', 'Máy chấm 98 điểm! Bạn tin mình có thể đi thi hát.', 'Cả nhóm gào thét bài hit mới nhất đến khản cả cổ.'] },
    { id: 'travel', label: 'Đi du lịch', icon: '✈️', cat: 'fun', minAge: 18, cost: 0, limit: 1, special: 'travel', eff: { happy: [6, 12], health: [0, 2] } },
    { id: 'beach', label: 'Đi biển', icon: '🏖️', cat: 'fun', minAge: 4, cost: 2000000, limit: 1, eff: { happy: [5, 8], health: [1, 2] }, scene: { loc: 'beach', anim: 'swim', fx: 'bubbles' }, texts: ['Bạn tắm biển đến khi da đỏ au, tối về ăn hải sản no nê.', 'Nằm trên bãi cát nghe sóng vỗ, bạn ngủ quên lúc nào không hay.'] },
    { id: 'dating', label: 'Hẹn hò qua app', icon: '💘', cat: 'love', minAge: 18, cost: 300000, limit: 2, special: 'dating' },
    { id: 'lottery', label: 'Mua vé số', icon: '🎟️', cat: 'money', minAge: 18, cost: 10000, limit: 3, special: 'lottery' },
    { id: 'sidejob', label: 'Làm thêm (part-time)', icon: '🛵', cat: 'money', minAge: 15, cost: 0, limit: 2, special: 'sidejob', input: 'parttime', desc: 'Chọn việc làm thêm: gia sư, phục vụ, chạy xe, PG…' },
    { id: 'stocks', label: 'Đầu tư chứng khoán', icon: '📈', cat: 'money', minAge: 20, cost: 0, limit: 1, special: 'stocks' },
    { id: 'livestream', label: 'Livestream bán hàng', icon: '📱', cat: 'money', minAge: 18, cost: 0, limit: 2, special: 'livestream' },
    { id: 'spa', label: 'Đi spa / làm tóc', icon: '💇', cat: 'looks', minAge: 14, cost: 500000, limit: 2, eff: { looks: [2, 4], happy: [1, 3] }, scene: { loc: 'cafe', anim: 'cheer', fx: 'sparkle' }, texts: ['Kiểu tóc mới khiến bạn tự tin hẳn. Ai gặp cũng khen.', 'Một buổi chăm sóc da thư giãn. Bạn thấy mình trẻ ra vài tuổi.'] },
    { id: 'surgery', label: 'Phẫu thuật thẩm mỹ', icon: '💉', cat: 'looks', minAge: 20, cost: 50000000, limit: 1, special: 'surgery' },
    { id: 'pagoda', label: 'Đi chùa', icon: '🛕', cat: 'soul', minAge: 4, cost: 0, limit: 2, eff: { happy: [2, 4], karma: [1, 3] }, scene: { loc: 'temple', anim: 'pray', fx: 'sparkle' }, texts: ['Bạn thắp nén nhang, cầu cho cả nhà bình an.', 'Ngày rằm, chùa đông nghịt. Bạn xin được một quẻ "đại cát".'] },
    { id: 'charity', label: 'Làm từ thiện', icon: '🤝', cat: 'soul', minAge: 16, cost: 0, limit: 2, special: 'charity' },
    { id: 'adopt', label: 'Nhận nuôi thú cưng', icon: '🐶', cat: 'love', minAge: 8, cost: 1500000, limit: 1, special: 'adopt' },
    { id: 'cook', label: 'Nấu ăn', icon: '🍳', cat: 'body', minAge: 12, cost: 150000, limit: 3, eff: { health: [1, 2], happy: [1, 3] }, scene: { loc: 'home', anim: 'cook', fx: 'steam' }, texts: ['Nồi canh chua bạn nấu được cả nhà khen nức nở.', 'Lần đầu làm nem rán, cháy mất một nửa. Nửa còn lại vẫn ngon!', 'Bạn nấu một nồi phở theo công thức "gia truyền" học trên mạng.'] },
    { id: 'garden', label: 'Trồng rau, chăm cây', icon: '🌱', cat: 'soul', minAge: 10, cost: 0, limit: 2, eff: { happy: [2, 4], health: [0, 2] }, scene: { loc: 'countryside', anim: 'idle' }, texts: ['Luống rau muống lên xanh mướt. Bữa tối nay có rau nhà trồng.', 'Bạn bắt sâu cả buổi sáng. Cây cối biết ơn — bạn tin thế.'] },
    { id: 'chess', label: 'Đánh cờ tướng', icon: '♟️', cat: 'mind', minAge: 35, cost: 0, limit: 2, eff: { smarts: [1, 2], happy: [2, 4] }, scene: { loc: 'park', anim: 'think', npcs: [{ role: 'neighbor', anim: 'think' }] }, texts: ['Bạn chiếu tướng ông hàng xóm, cả đám đứng xem vỗ tay rần rần.', 'Thua ba ván liền. Mai phục thù!'] },
    { id: 'shopping', label: 'Mua sắm hàng hiệu', icon: '🛍️', cat: 'looks', minAge: 16, cost: 15 * TR, limit: 2, eff: { looks: [2, 4], happy: [3, 6] }, scene: { loc: 'market', anim: 'cheer', fx: 'sparkle' }, texts: ['Bạn quẹt thẻ không chớp mắt. Tủ quần áo chật ních, ví thì nhẹ tênh.', 'Bộ cánh mới khiến bạn soi gương cả buổi. Đáng đồng tiền!', 'Nhân viên cửa hàng gọi bạn là "khách VIP". Bạn hơi ngượng, nhưng thích.'] },
    { id: 'finedining', label: 'Ăn nhà hàng sang trọng', icon: '🍷', cat: 'fun', minAge: 18, cost: 5 * TR, limit: 2, eff: { happy: [3, 6] }, scene: { loc: 'cafe', anim: 'eat', fx: 'steam', time: 'night' }, texts: ['Bò Wagyu, rượu vang, nến lung linh. Hóa đơn dài như sớ táo quân.', 'Món ăn bé tí trên cái đĩa to đùng, nhưng ngon thật.'] },
    { id: 'party', label: 'Tổ chức tiệc tùng', icon: '🥂', cat: 'fun', minAge: 20, cost: 30 * TR, limit: 1, eff: { happy: [5, 9], looks: [0, 1] }, scene: { loc: 'home', decor: 'birthday', anim: 'dance', fx: 'confetti', time: 'night', npcs: [{ role: 'crowd', anim: 'dance' }] }, texts: ['Bữa tiệc kéo dài đến nửa đêm, nhạc xập xình, bạn bè đến chật nhà.', 'Bạn thuê hẳn ban nhạc và đầu bếp. Ai đến cũng khen nức nở.'] },
    { id: 'resort', label: 'Nghỉ dưỡng resort 5 sao', icon: '🏝️', cat: 'fun', minAge: 18, cost: 60 * TR, limit: 1, eff: { happy: [8, 12], health: [2, 4] }, scene: { loc: 'beach', anim: 'swim', fx: 'sparkle' }, texts: ['Hồ bơi vô cực nhìn ra biển, bữa sáng buffet ăn đến trưa.', 'Ba ngày không điện thoại, không công việc. Bạn như được sinh ra lần nữa.'] },
    { id: 'golf', label: 'Chơi golf', icon: '🏌️', cat: 'body', minAge: 28, cost: 8 * TR, limit: 2, eff: { health: [1, 3], happy: [2, 4] }, scene: { loc: 'park', anim: 'point', fx: 'sparkle' }, texts: ['Cú đánh đầu tiên bay thẳng xuống hồ. Cú thứ hai cũng thế.', 'Bạn ký được một hợp đồng ngay trên sân golf. Đắt mà đáng.'] },
    { id: 'course', label: 'Học khóa kỹ năng / MBA', icon: '🎓', cat: 'mind', minAge: 22, cost: 40 * TR, limit: 1, eff: { smarts: [4, 7], happy: [0, 2] }, scene: { loc: 'university', anim: 'study', fx: 'idea' }, texts: ['Những buổi tối đi học sau giờ làm vất vả, nhưng đầu óc bạn sáng ra hẳn.', 'Bạn quen thêm cả lớp toàn giám đốc. Kiến thức có, quan hệ cũng có.'] },
    // mở khóa nhờ tài sản (needAsset = item id prefix hoặc loại tài sản)
    { id: 'roadtrip', label: 'Chở cả nhà đi chơi xa', icon: '🚗', cat: 'love', minAge: 18, cost: 4 * TR, limit: 1, needAsset: 'car', special: 'family', eff: { happy: [5, 9] }, scene: { loc: 'beach', anim: 'cheer', fx: 'sparkle' }, texts: ['Cả nhà chen chúc trên xe, hát karaoke suốt dọc đường. Đến nơi ai cũng mệt mà vui.', 'Bạn lái xe đưa cả nhà về quê ngoại. Bà ngoại đứng đợi ở đầu ngõ từ sáng.', 'Chuyến đi chơi cuối tuần có đủ ba thế hệ. Những tấm ảnh hôm ấy được in ra treo khắp nhà.'] },
    { id: 'phuot', label: 'Đi phượt bằng xe máy', icon: '🏍️', cat: 'fun', minAge: 16, cost: 2 * TR, limit: 1, needAsset: 'motorbike', eff: { happy: [5, 9], health: [-1, 2] }, scene: { loc: 'countryside', anim: 'drive', weather: 'fog', fx: 'sparkle' }, texts: ['Bạn chạy xe vượt đèo Mã Pí Lèng, gió lạnh táp vào mặt mà lòng thì nóng ran.', 'Một chuyến dọc bờ biển miền Trung, tối ngủ võng ở quán nước ven đường.', 'Xe thủng lốp giữa đèo, may có chú người Mông giúp vá. Chuyến đi đáng nhớ nhất đời.'] },
    { id: 'housewarm', label: 'Mở tiệc tân gia', icon: '🏠', cat: 'love', minAge: 18, cost: 25 * TR, limit: 1, needAsset: 'house', special: 'housewarm', eff: { happy: [6, 10] }, scene: { loc: 'home', anim: 'cheer', fx: 'confetti', npcs: [{ role: 'crowd', anim: 'clap' }] } },
    { id: 'yachtparty', label: 'Tiệc trên du thuyền', icon: '🛥️', cat: 'fun', minAge: 18, cost: 50 * TR, limit: 1, needAsset: 'yacht1', special: 'family', eff: { happy: [8, 12], looks: [1, 2] }, scene: { loc: 'beach', anim: 'dance', time: 'dusk', fx: 'fireworks', npcs: [{ role: 'crowd', anim: 'dance' }] }, texts: ['Du thuyền lướt giữa vịnh, cả họ lần đầu được ngắm hoàng hôn trên biển như trong phim.', 'Bữa tiệc hải sản trên boong kéo dài đến khuya. Ai cũng chụp ảnh khoe khắp mạng.'] },
    { id: 'baohiem', label: 'Mua bảo hiểm', icon: '🛡️', cat: 'money', minAge: 18, cost: 0, limit: 1, special: 'baohiem', desc: 'Bảo hiểm y tế, bảo hiểm sức khỏe & nhân thọ… hoặc huỷ hợp đồng đang có.' },
    { id: 'xaynha', label: 'Xây nhà, sửa nhà', icon: '🏗️', cat: 'money', minAge: 20, cost: 0, limit: 1, special: 'xaynha', desc: 'Xây trên đất của mình hoặc sửa, đập đi xây lại nhà đang ở.' },
    { id: 'grab', label: 'Chạy xe công nghệ', icon: '🚕', cat: 'money', minAge: 18, cost: 0, limit: 2, special: 'grab', desc: 'Đón khách, trả khách, giữ 5 sao. Cần xe máy hoặc ô tô.' },
    { id: 'cauca', label: 'Đi câu cá', icon: '🎣', cat: 'fun', minAge: 7, cost: 0, limit: 3, special: 'cauca', desc: 'Câu hồ hoặc thuê thuyền câu biển, sưu tầm cá hiếm.' },
    { id: 'sharktank', label: 'Lên Shark Tank gọi vốn', icon: '🦈', cat: 'money', minAge: 20, cost: 0, limit: 1, special: 'sharktank', desc: 'Cần công ty riêng. Thuyết trình trước các nhà đầu tư, 3 năm một lần.' },
    { id: 'xkld', label: 'Đi xuất khẩu lao động', icon: '✈️', cat: 'money', minAge: 18, maxAge: 40, cost: 0, limit: 1, special: 'xkld', desc: 'Nhật · Hàn · Đài Loan: phí môi giới cao, làm 3 năm gửi tiền về, coi chừng công ty ma.' },
    { id: 'dinhcu', label: 'Xin định cư nước ngoài', icon: '🗽', cat: 'money', minAge: 22, maxAge: 60, cost: 0, limit: 1, special: 'dinhcu', desc: 'Diện đầu tư (mất 2 tỷ) hoặc diện tay nghề (tiếng Anh ≥ 70 + bằng đại học).' },
    { id: 'trieuphu', label: 'Đi thi "Ai là triệu phú"', icon: '💰', cat: 'mind', minAge: 18, cost: 0, limit: 1, special: 'trieuphu', desc: '15 câu hỏi, 3 quyền trợ giúp, giải cao nhất 250 triệu. 3 năm thi một lần.' },
    { id: 'thihat', label: 'Đi thi hát truyền hình', icon: '🎤', cat: 'fun', minAge: 15, maxAge: 40, cost: 0, limit: 1, special: 'thihat', desc: 'Giọng Ca Vàng: giấu mặt → đối đầu → liveshow → chung kết. 2 năm thi một lần.' },
    { id: 'ielts', label: 'Luyện thi IELTS', icon: '🇬🇧', cat: 'mind', minAge: 15, cost: 15 * TR, limit: 1, special: 'ielts' },
    { id: 'masters', label: 'Du học thạc sĩ', icon: '🎓', cat: 'mind', minAge: 22, maxAge: 40, cost: 0, limit: 1, special: 'masters', needEnglish: 65, needDegree: true },
    { id: 'checkup', label: 'Khám sức khỏe tổng quát', icon: '🩻', cat: 'body', minAge: 18, cost: 3 * TR, limit: 1, special: 'checkup', scene: { loc: 'hospital', anim: 'sit', npcs: [{ role: 'doctor', anim: 'talk' }] } },
    { id: 'taichi', label: 'Tập dưỡng sinh', icon: '🧓', cat: 'body', minAge: 50, cost: 0, limit: 2, eff: { health: [2, 4], happy: [1, 3] }, scene: { loc: 'park', anim: 'dance', time: 'dawn', npcs: [{ role: 'neighbor', anim: 'dance' }, { role: 'neighbor', anim: 'dance' }] }, texts: ['Năm giờ sáng, bạn cùng hội người cao tuổi tập dưỡng sinh bên hồ.', 'Vươn vai, hít thở, vỗ tay. Xương khớp kêu răng rắc nhưng thấy khỏe hẳn.'] },
  ];

  const TRAVEL = [
    { name: 'Đà Lạt', cost: 5 * TR, loc: 'park', time: 'dawn', weather: 'fog', fx: 'petals', abroad: false },
    { name: 'Phú Quốc', cost: 9 * TR, loc: 'beach', fx: 'sparkle', abroad: false },
    { name: 'Sa Pa', cost: 7 * TR, loc: 'countryside', weather: 'fog', fx: 'sparkle', abroad: false },
    { name: 'Hội An', cost: 6 * TR, loc: 'street', time: 'night', decor: 'midautumn', fx: 'sparkle', abroad: false },
    { name: 'Hạ Long', cost: 6 * TR, loc: 'beach', fx: 'sparkle', abroad: false },
    { id: 'bangkok', name: 'Thái Lan', cost: 15 * TR, loc: 'bangkok', fx: 'sparkle', abroad: true },
    { id: 'seoul', name: 'Hàn Quốc', cost: 30 * TR, loc: 'seoul', time: 'dusk', fx: 'sparkle', abroad: true },
    { id: 'tokyo', name: 'Nhật Bản', cost: 38 * TR, loc: 'tokyo', fx: 'petals', abroad: true },
    { id: 'paris', name: 'Pháp', cost: 80 * TR, loc: 'paris', time: 'dusk', fx: 'sparkle', abroad: true },
    { name: 'Mỹ', cost: 120 * TR, loc: 'street', time: 'night', fx: 'sparkle', abroad: true },
    { name: 'Châu Âu 10 nước', cost: 160 * TR, loc: 'park', time: 'day', fx: 'petals', abroad: true },
    { name: 'Maldives', cost: 220 * TR, loc: 'beach', time: 'dusk', fx: 'sparkle', abroad: true },
  ];

  // esc: bỏ mặc không chữa ≥ after năm → mỗi năm có xác suất p (tăng dần) chuyển thành bệnh `to` (c_* = ung thư)
  // incurable: không thể chữa khỏi, chỉ điều trị duy trì cho đỡ
  const ILLNESSES = [
    { id: 'cam', name: 'Cảm cúm', drain: 4, chronic: false, cure: 0.95, cost: 300000, sym: 'ho khan, sốt âm ỉ mãi không dứt', esc: [{ to: 'viemphoi', after: 1, p: 0.14 }] },
    { id: 'sotxh', name: 'Sốt xuất huyết', drain: 12, chronic: false, cure: 0.85, cost: 3 * TR, sym: 'sốt cao, nổi chấm đỏ khắp người' },
    { id: 'daday', name: 'Đau dạ dày', drain: 5, chronic: false, cure: 0.8, cost: 1.5 * TR, sym: 'cứ đói là bụng cồn cào, ợ chua', esc: [{ to: 'loetdaday', after: 1, p: 0.25 }] },
    { id: 'loetdaday', name: 'Viêm loét dạ dày', drain: 8, chronic: false, cure: 0.6, cost: 6 * TR, sym: 'đau thượng vị dữ dội, có hôm nôn ra máu', esc: [{ to: 'c_daday', after: 2, p: 0.15 }] },
    { id: 'gaixuong', name: 'Gai cột sống', drain: 4, chronic: true, cure: 0.3, cost: 2 * TR, minAge: 40, sym: 'lưng đau buốt, cúi người cũng khó', esc: [{ to: 'thoatvi', after: 2, p: 0.12 }] },
    { id: 'thoatvi', name: 'Thoát vị đĩa đệm', drain: 7, chronic: true, cure: 0.45, cost: 60 * TR, sym: 'tê dọc xuống chân, đi lại khập khiễng' },
    { id: 'huyetap', name: 'Cao huyết áp', drain: 5, chronic: true, cure: 0.2, cost: 1 * TR, minAge: 45, sym: 'đau đầu, chóng mặt, mặt đỏ bừng', esc: [{ to: 'dotquy', after: 2, p: 0.08 }, { to: 'tim', after: 2, p: 0.08 }, { to: 'suythan', after: 3, p: 0.06 }] },
    { id: 'tieuduong', name: 'Tiểu đường', drain: 6, chronic: true, cure: 0.15, cost: 2 * TR, minAge: 45, sym: 'khát nước liên tục, vết thương lâu lành', esc: [{ to: 'suythan', after: 2, p: 0.12 }, { to: 'tim', after: 3, p: 0.07 }] },
    { id: 'tim', name: 'Bệnh tim', drain: 9, chronic: true, cure: 0.35, cost: 25 * TR, minAge: 50, sym: 'tức ngực, leo cầu thang là thở dốc', esc: [{ to: 'suytim', after: 2, p: 0.14 }] },
    { id: 'viemganb', name: 'Viêm gan B', drain: 3, chronic: true, cure: 0.1, cost: 3 * TR, minAge: 16, sym: 'mệt mỏi, chán ăn, da hơi vàng', esc: [{ to: 'xogan', after: 2, p: 0.12 }] },
    { id: 'viemphoi', name: 'Viêm phổi', drain: 8, chronic: false, cure: 0.85, cost: 8 * TR, sym: 'ho ra đờm, thở khò khè cả đêm', esc: [{ to: 'c_phoi', after: 2, p: 0.06 }] },
    { id: 'chanthuong', name: 'Chấn thương cơ', drain: 4, chronic: false, cure: 0.95, cost: 1 * TR, sym: 'cơ đau nhức, vận động là nhói' },
    { id: 'daychang', name: 'Đứt dây chằng', drain: 7, chronic: false, cure: 0.65, cost: 80 * TR, sym: 'đầu gối lỏng lẻo, chạy là khuỵu', esc: [{ to: 'thoaihoa', after: 2, p: 0.15 }] },
    // bệnh không thể chữa khỏi — hậu quả của việc bỏ mặc
    { id: 'thoaihoa', name: 'Thoái hóa khớp gối', drain: 5, chronic: true, incurable: true, cost: 10 * TR, minAge: 18, sym: 'gối sưng đau, trời trở là nhức' },
    { id: 'xogan', name: 'Xơ gan', drain: 11, chronic: true, incurable: true, cost: 20 * TR, minAge: 25, sym: 'bụng chướng, da vàng sậm', esc: [{ to: 'c_gan', after: 1, p: 0.14 }] },
    { id: 'suythan', name: 'Suy thận mạn', drain: 12, chronic: true, incurable: true, cost: 60 * TR, minAge: 30, sym: 'phù chân, tuần chạy thận ba buổi' },
    { id: 'suytim', name: 'Suy tim', drain: 13, chronic: true, incurable: true, cost: 40 * TR, minAge: 40, sym: 'khó thở cả khi nằm, phù hai chân' },
    { id: 'dotquy', name: 'Di chứng đột quỵ', drain: 10, chronic: true, incurable: true, cost: 30 * TR, minAge: 35, sym: 'nửa người yếu, nói ngọng' },
    // giữ lại cho tình huống cũ gọi 'Ung thư' — game sẽ chuyển thành một loại ung thư cụ thể
    { id: 'ungthu', name: 'Ung thư', drain: 16, chronic: false, cure: 0.45, cost: 120 * TR, minAge: 40, serious: true },
  ];
  // ung thư: phát hiện càng sớm càng dễ chữa. Giai đoạn 1–4; giai đoạn 4 không thể chữa khỏi.
  // Ung thư thường “âm thầm” — chỉ đi khám định kỳ mới phát hiện được trước khi có triệu chứng ở giai đoạn 3.
  const CANCERS = [
    { id: 'c_daday', name: 'Ung thư dạ dày', w: 2 },
    { id: 'c_gan', name: 'Ung thư gan', w: 2.5 },
    { id: 'c_phoi', name: 'Ung thư phổi', w: 2.5 },
    { id: 'c_daitrang', name: 'Ung thư đại tràng', w: 1.5 },
    { id: 'c_vu', name: 'Ung thư vú', w: 2, gender: 'f' },
    { id: 'c_tuyenlt', name: 'Ung thư tuyến tiền liệt', w: 1.2, gender: 'm', minAge: 50 },
    { id: 'c_mau', name: 'Ung thư máu', w: 0.6 },
  ];
  const CANCER_STAGE = { drain: [3, 8, 14, 22], cure: [0.9, 0.65, 0.3, 0], cost: [80 * TR, 160 * TR, 320 * TR, 60 * TR] };

  const ROLE_LABELS = { mother: 'Mẹ', father: 'Bố', sibling: 'Anh chị em', grandparent: 'Ông bà', friend: 'Bạn bè', partner: 'Người yêu', spouse: 'Bạn đời', child: 'Con', grandchild: 'Cháu', pet: 'Thú cưng', ex: 'Người yêu cũ', lover: 'Người tình' };
  const INTERACTIONS = {
    talk: { label: 'Trò chuyện', icon: '💬' }, flirt: { label: 'Tán tỉnh', icon: '😏' }, hug: { label: 'Ôm', icon: '🤗' }, meal: { label: 'Ăn cơm cùng', icon: '🍚' }, gift: { label: 'Tặng quà', icon: '🎁' },
    ask_money: { label: 'Xin tiền', icon: '🧧' }, argue: { label: 'Cãi nhau', icon: '💢' }, hangout: { label: 'Đi chơi', icon: '🎉' }, borrow: { label: 'Vay tiền', icon: '💸' },
    date: { label: 'Hẹn hò', icon: '🌹' }, love: { label: 'Âu yếm', icon: '💞' }, propose: { label: 'Cầu hôn', icon: '💍' }, breakup: { label: 'Chia tay', icon: '💔' },
    baby: { label: 'Sinh em bé', icon: '👶' }, divorce: { label: 'Ly hôn', icon: '📄' }, play: { label: 'Chơi cùng', icon: '🪁' }, teach: { label: 'Dạy học', icon: '✏️' },
    walk: { label: 'Dắt đi dạo', icon: '🦮' }, feed: { label: 'Cho ăn', icon: '🦴' }, care: { label: 'Chăm sóc', icon: '🫶' },
    leave: { label: 'Bỏ nhà theo người tình', icon: '🧳' }, train: { label: 'Huấn luyện', icon: '🎯' },
  };
  const ROLE_ACTIONS = {
    mother: ['talk', 'hug', 'meal', 'gift', 'ask_money', 'argue'], father: ['talk', 'hug', 'meal', 'gift', 'ask_money', 'argue'],
    grandparent: ['talk', 'hug', 'meal', 'gift', 'care'], sibling: ['talk', 'hangout', 'gift', 'argue', 'borrow'],
    friend: ['talk', 'hangout', 'gift', 'argue', 'borrow', 'flirt'], partner: ['date', 'gift', 'love', 'propose', 'breakup'],
    spouse: ['date', 'gift', 'love', 'baby', 'argue', 'divorce'], child: ['play', 'teach', 'gift', 'hug', 'argue'],
    grandchild: ['play', 'gift', 'hug', 'teach'], pet: ['play', 'walk', 'feed'], ex: ['talk', 'flirt'],
    lover: ['date', 'gift', 'love', 'leave', 'breakup'],
  };
  ROLE_ACTIONS.pet = ['play', 'walk', 'feed', 'train'];
  ROLE_ACTIONS.child = ['play', 'teach', 'gift', 'hug', 'argue', 'talk'];

  // skin trang phục đặc biệt: mở khoá bằng thành tích các kiếp đã sống (meta), hiện trong cảnh 3D từ 6 tuổi
  const SKINS = [
    { id: 'ngau', name: 'Ngầu lòi', icon: '😎', need: { lives: 0 }, needText: 'Có sẵn', app: { topStyle: 'jacket', top: '#16161d', bottom: '#2b2b33', acc: 'shades' } },
    { id: 'khunglong', name: 'Đồ ngủ khủng long', icon: '🦖', need: { lives: 2 }, needText: 'Sống hết 2 kiếp', app: { topStyle: 'hoodie', top: '#43a047', bottom: '#2f7d32', acc: 'spikes' } },
    { id: 'sieunhan', name: 'Siêu anh hùng', icon: '🦸', need: { ach: 'hero' }, needText: 'Thành tựu “Người hùng” (cứu người)', alt: { lives: 6 }, app: { topStyle: 'tshirt', top: '#1d4ed8', bottom: '#c1121f', acc: 'cape' } },
    { id: 'phihanh', name: 'Phi hành gia', icon: '👩‍🚀', need: { lives: 5 }, needText: 'Sống hết 5 kiếp', app: { topStyle: 'jacket', top: '#f4f6f8', bottom: '#e6e8ec', shoes: '#9aa0a6', acc: 'astro' } },
    { id: 'thienthan', name: 'Thiên thần', icon: '😇', need: { karmaLife: 90 }, needText: 'Một kiếp có phúc đức ≥ 90', app: { topStyle: 'shirt', top: '#ffffff', bottom: '#f1f1f1', acc: 'halo' } },
    { id: 'acquy', name: 'Ác quỷ', icon: '😈', need: { karmaLow: 15 }, needText: 'Một kiếp có phúc đức ≤ 15', app: { topStyle: 'jacket', top: '#1a0b0b', bottom: '#2b0f0f', acc: 'horns' } },
    { id: 'hoangde', name: 'Hoàng đế', icon: '👑', need: { best: 320 }, needText: 'Một kiếp đạt 320 điểm', app: { topStyle: 'aodai', top: '#e0a100', bottom: '#f5f5f2', acc: 'crown' } },
  ];
  const ACHIEVEMENTS = [
    ['first_word', 'Tiếng nói đầu đời', '🗣️', 'Nói được từ đầu tiên.'],
    ['legend_job', 'Huyền thoại trong nghề', '🎖️', 'Đạt danh tiếng nghề cao nhất nhờ những ca làm việc xuất sắc.'],
    ['kol_award', 'KOL của năm', '🏆', 'Lên nhận giải Nhà sáng tạo nội dung của năm.'],
    ['dating_app', 'Duyên số qua màn hình', '💘', 'Tìm được người yêu qua app hẹn hò.'],
    ['school_start', 'Ngày đầu đến lớp', '🎒', 'Chính thức trở thành học sinh lớp 1.'],
    ['honor', 'Học sinh giỏi', '🏅', 'Đạt thành tích học tập xuất sắc trong một năm.'],
    ['grade10', 'Đỗ vào lớp 10', '📝', 'Vượt qua kỳ thi vào lớp 10.'],
    ['uni', 'Tân sinh viên', '🎓', 'Đỗ đại học.'],
    ['degree', 'Cử nhân', '📜', 'Tốt nghiệp đại học.'],
    ['valedictorian', 'Thủ khoa', '🥇', 'Tốt nghiệp đại học loại xuất sắc.'],
    ['first_job', 'Lương tháng đầu', '💵', 'Nhận đồng lương đầu tiên.'],
    ['promoted', 'Thăng chức', '📈', 'Được thăng chức lần đầu.'],
    ['top_job', 'Đỉnh cao sự nghiệp', '👑', 'Đạt cấp bậc cao nhất trong nghề.'],
    ['doctor', 'Lương y như từ mẫu', '🩺', 'Trở thành bác sĩ.'],
    ['famous', 'Người nổi tiếng', '🌟', 'Trở thành ngôi sao được nhiều người biết đến.'],
    ['ty', 'Tỷ phú', '💰', 'Sở hữu 1 tỷ đồng.'],
    ['daigia', 'Đại gia', '💎', 'Sở hữu 10 tỷ đồng.'],
    ['sieudaigia', 'Siêu đại gia', '🏦', 'Sở hữu 100 tỷ đồng.'],
    ['first_love', 'Mối tình đầu', '💌', 'Có người yêu đầu tiên.'],
    ['married', 'Về chung một nhà', '💍', 'Kết hôn.'],
    ['parent', 'Lên chức bố mẹ', '👶', 'Đón đứa con đầu lòng.'],
    ['big_family', 'Đông con nhiều phúc', '👨‍👩‍👧‍👦', 'Có từ 3 người con trở lên.'],
    ['grandparent', 'Lên chức ông bà', '👵', 'Có cháu.'],
    ['house', 'An cư lạc nghiệp', '🏠', 'Sở hữu một ngôi nhà.'],
    ['car', 'Xế hộp', '🚗', 'Sở hữu ô tô.'],
    ['pet', 'Con sen chính hiệu', '🐾', 'Nuôi một bé thú cưng.'],
    ['traveler', 'Xê dịch', '🧳', 'Đi du lịch 5 lần.'],
    ['abroad', 'Công dân toàn cầu', '🌏', 'Du lịch nước ngoài.'],
    ['lottery', 'Trúng số độc đắc', '🎰', 'Trúng giải đặc biệt xổ số.'],
    ['saint', 'Bồ Tát sống', '🪷', 'Đạt điểm đức (karma) 95.'],
    ['villain', 'Ác nhân', '😈', 'Điểm đức tụt xuống dưới 10.'],
    ['gym10', 'Cơ bắp cuồn cuộn', '💪', 'Tập gym 10 lần.'],
    ['genius', 'Thiên tài', '🧠', 'Trí tuệ đạt 100.'],
    ['beauty', 'Vạn người mê', '✨', 'Ngoại hình đạt 95.'],
    ['age70', 'Thất thập cổ lai hy', '🎂', 'Sống đến 70 tuổi.'],
    ['age90', 'Thượng thọ', '🎋', 'Sống đến 90 tuổi.'],
    ['age100', 'Trăm tuổi', '💯', 'Sống đến 100 tuổi.'],
    ['survivor', 'Vượt qua bạo bệnh', '🎗️', 'Chữa khỏi một căn bệnh hiểm nghèo.'],
    ['divorce', 'Đường ai nấy đi', '📄', 'Ly hôn.'],
    ['retire', 'Về hưu an nhàn', '🪴', 'Nghỉ hưu.'],
    ['gen2', 'Nối dõi tông đường', '🌳', 'Tiếp tục cuộc đời qua người con.'],
    ['gen3', 'Tam đại đồng đường', '🏮', 'Chơi đến đời thứ ba.'],
    ['happy100', 'Hạnh phúc tròn đầy', '😊', 'Hạnh phúc đạt 100.'],
    ['charity5', 'Trái tim vàng', '💛', 'Làm từ thiện 5 lần.'],
    ['startup', 'Khởi nghiệp thành công', '🚀', 'Trở thành giám đốc công ty của chính mình.'],
    ['vien_man', 'Viên mãn', '🎯', 'Hoàn thành cả ba mục tiêu của một kiếp người.'],
    ['generous', 'Hào phóng', '🎁', 'Tặng một món quà trị giá từ 100 triệu.'],
    ['broke', 'Trắng tay', '📉', 'Nợ nần quá nửa tỷ đồng.'],
    ['landlord', 'Chủ nhà cho thuê', '🔑', 'Có thu nhập từ cho thuê nhà, đất.'],
    ['early_catch', 'Phát hiện kịp thời', '🩻', 'Phát hiện ung thư từ giai đoạn sớm nhờ đi khám.'],
  ].map(([id, name, icon, desc]) => ({ id, name, icon, desc }));

  // life goals: check(S) → bool (S = game state)
  const GOALS = [
    { id: 'live80', text: 'Sống đến 80 tuổi', check: (s) => s.player.age >= 80 },
    { id: 'live90', text: 'Sống đến 90 tuổi', check: (s) => s.player.age >= 90 },
    { id: 'degree', text: 'Tốt nghiệp đại học', check: (s) => s.edu.degrees.length > 0 },
    { id: 'ty', text: 'Có 1 tỷ đồng trong tài khoản', check: (s) => s.money >= TY },
    { id: 'ty10', text: 'Có 10 tỷ đồng', check: (s) => s.money >= 10 * TY },
    { id: 'married', text: 'Kết hôn', check: (s) => s.people.some((p) => p.role === 'spouse') },
    { id: 'kids2', text: 'Có 2 người con', check: (s) => s.people.filter((p) => p.role === 'child').length >= 2 },
    { id: 'grandkid', text: 'Có cháu bồng cháu bế', check: (s) => s.people.some((p) => p.role === 'grandchild') },
    { id: 'house', text: 'Mua được nhà', check: (s) => s.assets.some((a) => a.type === 'house') },
    { id: 'car', text: 'Sắm ô tô', check: (s) => s.assets.some((a) => a.type === 'car') },
    { id: 'doctor', text: 'Trở thành bác sĩ', check: (s) => s.job && s.job.id === 'bacsi' },
    { id: 'coder', text: 'Trở thành lập trình viên', check: (s) => s.job && s.job.id === 'laptrinh' },
    { id: 'teacher', text: 'Đứng trên bục giảng', check: (s) => s.job && s.job.id === 'giaovien' },
    { id: 'star', text: 'Trở thành người nổi tiếng', check: (s) => !!s.ach.famous },
    { id: 'abroad', text: 'Đi du lịch nước ngoài', check: (s) => (s.counters.abroad || 0) > 0 },
    { id: 'travel5', text: 'Đi du lịch 5 nơi', check: (s) => (s.counters.travel || 0) >= 5 },
    { id: 'pet', text: 'Nuôi một bé thú cưng', check: (s) => (s.counters.pets || 0) > 0 },
    { id: 'karma85', text: 'Sống tử tế (đức ≥ 85)', check: (s) => s.karma >= 85 },
    { id: 'honor3', text: 'Ba năm học sinh giỏi', check: (s) => (s.counters.honor || 0) >= 3 },
    { id: 'charity3', text: 'Làm từ thiện 3 lần', check: (s) => (s.counters.charity || 0) >= 3 },
    { id: 'boss', text: 'Làm sếp (thăng chức 2 lần)', check: (s) => (s.counters.promoted || 0) >= 2 },
    { id: 'fit', text: 'Sức khỏe 90+ ở tuổi 50', check: (s) => s.player.age >= 50 && s.stats.health >= 90 },
    { id: 'police', text: 'Trở thành cảnh sát', check: (s) => s.job && s.job.id === 'canhsat' },
    { id: 'architect', text: 'Trở thành kiến trúc sư', check: (s) => s.job && s.job.id === 'kientrucsu' },
    { id: 'banker', text: 'Làm giám đốc chi nhánh ngân hàng', check: (s) => s.job && s.job.id === 'nganhang' && s.job.level >= 3 },
    { id: 'luxury', text: 'Sở hữu một món đồ xa xỉ', check: (s) => s.assets.some((a) => a.type === 'luxury') },
    { id: 'generous', text: 'Tặng quà cho người thân 10 lần', check: (s) => (s.counters.gifts || 0) >= 10 },
    { id: 'bigspender', text: 'Chi 1 tỷ đồng mua quà tặng', check: (s) => (s.counters.giftMoney || 0) >= TY },
    { id: 'lavish', text: 'Sống sang chảnh 10 năm', check: (s) => (s.counters.lavishYears || 0) >= 10 },
    { id: 'comeback', text: 'Trắng tay rồi làm lại, có 1 tỷ', check: (s) => !!s.flags.wentBroke && s.money >= TY },
    { id: 'lovelong', text: 'Bên nhau trọn 40 năm', check: (s) => typeof s.flags.marriedYear === 'number' && s.people.some((p) => p.role === 'spouse' && p.alive) && s.year - s.flags.marriedYear >= 40 },
    { id: 'kids3', text: 'Có 3 người con', check: (s) => s.people.filter((p) => p.role === 'child').length >= 3 },
    { id: 'friends3', text: 'Có 3 người bạn thân', check: (s) => s.people.filter((p) => p.alive && p.role === 'friend' && p.relation >= 75).length >= 3 },
  ];
  // độ khó mục tiêu (1–3 sao) → quyết định điểm Phúc đức khi hoàn thành đủ cả ba
  const GOAL_DIFF = { live80: 2, live90: 3, degree: 1, ty: 2, ty10: 3, married: 1, kids2: 2, grandkid: 2, house: 2, car: 1, doctor: 3, coder: 2, teacher: 2, star: 3, abroad: 1, travel5: 2, pet: 1, karma85: 2, honor3: 2, charity3: 1, boss: 2, fit: 3, police: 2, architect: 2, banker: 3, luxury: 2, generous: 1, bigspender: 3, lavish: 3, comeback: 3, lovelong: 3, kids3: 2, friends3: 2 };
  GOALS.forEach((g) => { g.diff = GOAL_DIFF[g.id] || 2; });

  // Phúc phần — đổi bằng điểm Phúc đức ở màn tạo nhân vật.
  // kind 'life': dùng cho một kiếp (trừ điểm mỗi lần dùng) · kind 'unlock': mở khóa vĩnh viễn
  const PERKS = [
    { id: 'thongminh', kind: 'life', name: 'Thông minh bẩm sinh', icon: '🧠', cost: 1, desc: 'Trí tuệ khởi đầu +20.' },
    { id: 'dep', kind: 'life', name: 'Vẻ ngoài thu hút', icon: '✨', cost: 1, desc: 'Ngoại hình khởi đầu +20.' },
    { id: 'khoe', kind: 'life', name: 'Khỏe như vâm', icon: '💪', cost: 1, desc: 'Sức khỏe +15, ít ốm vặt.' },
    { id: 'emam', kind: 'life', name: 'Gia đình êm ấm', icon: '🏡', cost: 1, desc: 'Bố mẹ cực kỳ thương bạn, hạnh phúc khởi đầu cao.' },
    { id: 'giau', kind: 'life', name: 'Nhà có điều kiện', icon: '💰', cost: 2, desc: 'Tiền tiêu vặt gấp 4, tròn 18 tuổi được bố mẹ cho 600 triệu.' },
    { id: 'quynhan', kind: 'life', name: 'Quý nhân phù trợ', icon: '🍀', cost: 2, desc: 'Đức khởi đầu 70, mọi lựa chọn may rủi đều dễ thành công hơn.' },
    { id: 'thientai', kind: 'life', name: 'Thần đồng', icon: '🌟', cost: 3, desc: 'Trí tuệ +35 và học lực cực tốt ngay từ nhỏ.' },
    { id: 'tho', kind: 'life', name: 'Trường thọ', icon: '🎋', cost: 3, desc: 'Nguy cơ qua đời mỗi năm giảm gần một nửa.' },
    { id: 'tocdep', kind: 'unlock', name: 'Màu tóc nổi bật', icon: '🎨', cost: 1, desc: 'Mở khóa vĩnh viễn tóc bạch kim, hồng, xanh, tím, cam.' },
    { id: 'mu', kind: 'unlock', name: 'Tủ mũ nón', icon: '🧢', cost: 1, desc: 'Mở khóa vĩnh viễn mũ lưỡi trai, mũ len, mũ bảo hiểm.' },
  ];
  const SPECIAL_HAIR = ['#e9e4dc', '#ff8fb1', '#5ab0ff', '#a974ff', '#ff7a3d'];

  // ---- việc làm thêm (part-time): mỗi lần = làm vài tháng. pay: [min, max] triệu; need: điều kiện; eff: chỉ số
  const PARTTIME = [
    { id: 'phucvu', icon: '🧋', name: 'Phục vụ quán trà sữa', minAge: 15, pay: [3, 6], eff: { happy: [-2, 1], health: [-1, 0] }, loc: 'cafe', anim: 'walk', text: 'Bạn bưng bê ca tối ở quán trà sữa, cuối tuần đông đến mức chạy không kịp thở.' },
    { id: 'trongxe', icon: '🅿️', name: 'Trông giữ xe', minAge: 15, pay: [2, 4], eff: { happy: [-1, 1] }, loc: 'street', anim: 'sit', text: 'Bạn ngồi trông xe trước cổng siêu thị, ghi vé, dắt xe giùm khách, tranh thủ học bài.' },
    { id: 'toroi', icon: '📄', name: 'Phát tờ rơi', minAge: 15, pay: [1.5, 3], eff: { health: [-1, 0], happy: [-2, 0] }, loc: 'street', anim: 'walk', text: 'Bạn đứng ngã tư phát tờ rơi dưới nắng, bị từ chối cả trăm lần mỗi ngày.' },
    { id: 'cuoihoi', icon: '💒', name: 'Bưng bê tiệc cưới', minAge: 16, pay: [3, 6], eff: { health: [-2, 0] }, loc: 'wedding', anim: 'walk', text: 'Cuối tuần nào bạn cũng bưng mâm ở nhà hàng tiệc cưới, về đến nhà là nằm bẹp.' },
    { id: 'banonline', icon: '📦', name: 'Bán hàng online', minAge: 16, need: { phone: true }, pay: [-2, 12], eff: { smarts: [0, 2] }, loc: 'bedroom', anim: 'phone', text: 'Bạn nhập hàng về đăng bán trên mạng, chốt đơn đến khuya. Có tháng lãi, có tháng ôm hàng tồn.' },
    { id: 'pg', icon: '🎤', name: 'PG/PB sự kiện', minAge: 18, need: { looks: 60 }, pay: [6, 12], eff: { looks: [0, 1], health: [-1, 0] }, loc: 'studio', anim: 'wave', text: 'Bạn đứng quầy giới thiệu sản phẩm ở các sự kiện, cười đến mỏi cả miệng.' },
    { id: 'giasu', icon: '📚', name: 'Gia sư', minAge: 18, need: { smarts: 60 }, pay: [6, 12], eff: { smarts: [1, 3] }, loc: 'home', anim: 'talk', text: 'Bạn dạy kèm một cậu bé lớp 8 lười học. Tháng thứ ba, cậu được 8 điểm Toán và phụ huynh tăng lương cho bạn.' },
    { id: 'grab', icon: '🛵', name: 'Chạy xe công nghệ', minAge: 18, need: { motorbike: true }, pay: [8, 15], eff: { health: [-3, -1] }, risk: 0.08, loc: 'street', anim: 'drive', text: 'Bạn bật app chạy xe từ chiều đến khuya, khói bụi, nắng mưa, nhưng tiền về đều tay.' },
    { id: 'phuho', icon: '🧱', name: 'Phụ hồ', minAge: 18, need: { health: 60 }, pay: [8, 12], eff: { health: [-4, -1] }, loc: 'street', anim: 'lift', text: 'Bạn khuân gạch, trộn vữa ở công trình. Lưng đau như gãy, nhưng lương trả theo ngày.' },
    { id: 'dayboi', icon: '🏊', name: 'Dạy bơi mùa hè', minAge: 18, need: { health: 70 }, pay: [6, 10], eff: { health: [1, 3] }, loc: 'beach', anim: 'swim', text: 'Cả mùa hè bạn đứng dưới nước dạy bơi cho trẻ con, da cháy đen nhưng vui.' },
    { id: 'ctv', icon: '✍️', name: 'Cộng tác viên viết bài, dịch thuật', minAge: 18, need: { english: 50 }, pay: [6, 14], eff: { smarts: [1, 2] }, english: [1, 3], loc: 'cafe', anim: 'type', text: 'Bạn nhận dịch tài liệu và viết bài cho mấy trang tin, ngồi quán cà phê gõ phím cả ngày.' },
    { id: 'shipdo', icon: '🍜', name: 'Giao đồ ăn bằng xe đạp', minAge: 16, pay: [3, 6], eff: { health: [0, 2], happy: [-1, 1] }, risk: 0.04, loc: 'street', anim: 'run', text: 'Bạn đạp xe giao đồ ăn quanh các con hẻm, chân to ra trông thấy.' },
  ];

  // ---- kiểu cha mẹ (gán lúc chào đời) — ảnh hưởng tiền tiêu vặt, tâm lý, và cách bố mẹ phản ứng khi con thi trượt
  const PARENTING = [
    { id: 'apdat', label: 'Áp đặt', icon: '📏', w: 30, desc: 'Kỳ vọng rất cao, chọn trường chọn ngành thay con. Thi trượt hay cãi lời là có thể bị từ mặt.' },
    { id: 'danchu', label: 'Dân chủ', icon: '🤝', w: 30, desc: 'Lắng nghe và tôn trọng lựa chọn của con, luôn là chỗ dựa.' },
    { id: 'chieu', label: 'Nuông chiều', icon: '🍬', w: 20, desc: 'Cho tiền nhiều, ít đòi hỏi — con vui nhưng dễ ỷ lại, lười học.' },
    { id: 'thoo', label: 'Thờ ơ', icon: '📵', w: 20, desc: 'Bận mưu sinh, ít quan tâm, ít cho tiền — con phải tự lập sớm.' },
  ];
  // ngành bố mẹ áp đặt hay chọn
  const PARENT_MAJORS = ['yduoc', 'luat', 'taichinh', 'cntt', 'anninh', 'duoc'];

  // ---- sở thích tuổi thơ → thiên hướng nghề nghiệp. kw viết KHÔNG dấu (bộ phân tích bỏ dấu trước khi so khớp)
  const INTERESTS = {
    the: { label: 'Thể thao', icon: '⚽', loc: 'stadium', anim: 'run', stat: { health: [2, 5] },
      kw: ['bong da', 'da bong', 'da banh', 'sut', 'thu mon', 'chay', 'boi', 'hoc vo', 'vo thuat', 'danh vo', 'karate', 'taekwondo', 'kung fu', 'dam boc', 'boxing', 'cau long', 'bong ro', 'bong chuyen', 'da cau', 'nhay day', 'dap xe', 'xe dap', 'leo cay', 'the duc', 'the thao', 'danh nhau', 'da tran', 'keo co', 'truot', 'patin', 'bong ban'],
      careers: ['cauthu', 'bongro', 'vdv_vo', 'caulong', 'boi', 'dienkinh', 'bongchuyen', 'hlv', 'cuuhoa', 'canhsat'], route: 'Vào lò năng khiếu thể thao' },
    nghethuat: { label: 'Nghệ thuật', icon: '🎨', loc: 'studio', anim: 'dance', stat: { looks: [1, 3], happy: [3, 6] },
      kw: ['ve tranh', 've hinh', 'tap ve', 'to mau', 'hat', 'ca hat', 'nhac', 'choi dan', 'piano', 'guitar', 'mua hat', 'ba le', 'nhay mua', 'bieu dien', 'dien kich', 'dong kich', 'kich', 'dong phim', 'chup anh', 'quay phim', 'thoi trang', 'hoat hinh', 'xem phim', 'trang diem', 'lam dep', 'thu cong', 'nan', 'dat set', 'cat dan', 'lam tho', 'viet truyen', 'viet van', 'xep giay', 'origami', 'bup be', 'cosplay', 'idol', 'kpop'],
      careers: ['casi', 'dienvien', 'hoasi', 'nhaccong', 'nguoimau', 'thietke', 'kientrucsu', 'streamer'], route: 'Thi vào trường năng khiếu nghệ thuật' },
    khampha: { label: 'Khám phá', icon: '🧭', loc: 'countryside', anim: 'walk', stat: { happy: [3, 6], health: [1, 3] },
      kw: ['kham pha', 'phieu luu', 'cam trai', 'di rung', 'leo nui', 'bat ca', 'cau ca', 'bat de', 'con trung', 'bat buom', 'dom dom', 'cay', 'hai hoa', 'hoa la', 'vuon', 'dong vat', 'con cho', 'cun', 'meo', 'chim', 'con ca', 'con ga', 'du lich', 'bien', 'song', 'suoi', 'hang dong', 'ban do', 'may bay', 'tau', 'ngam sao', 'vi sao', 'vu tru', 'thien van', 'tha dieu', 'dieu'],
      careers: ['huongdanvien', 'phicong', 'tiepvien', 'nhabao', 'kysunn', 'nongdan'], route: 'Tham gia câu lạc bộ khám phá, du lịch, thiên nhiên' },
    tuduy: { label: 'Toán – khoa học', icon: '🧮', loc: 'school', anim: 'think', stat: { smarts: [3, 6] },
      kw: ['toan', 'giai do', 'do vui', 'rubik', 'co vua', 'co tuong', 'co ca ngua', 'sudoku', 'khoa hoc', 'thi nghiem', 'hoa hoc', 'vat ly', 'robot', 'lego', 'lap ghep', 'doc sach', 'sach', 'truyen tranh', 'bach khoa', 'tinh nham', 'dem so', 'con so', 'kinh lup', 'kinh hien vi', 'lap trinh', 'code', 'scratch', 'olympic'],
      careers: ['khoahoc', 'laptrinh', 'bacsi', 'ketoan', 'kysu', 'nganhang', 'duocsi', 'luatsu'], route: 'Ôn thi lớp chuyên Toán – Tin' },
    tayngh: { label: 'Tay nghề – máy móc', icon: '🔧', loc: 'home', anim: 'cook', stat: { smarts: [1, 3], happy: [2, 4] },
      kw: ['sua', 'thao', 'lap rap', 'may moc', 'dong co', 'xe may', 'o to', 'oto', 'dien', 'do dien', 'mo hinh', 'do go', 'dong do', 'nau', 'bep', 'lam banh', 'nau an', 'cat toc', 'tet toc', 'may vay', 'khau', 'dan len', 'trong rau', 'cay lua', 'han', 'dong dinh', 'cua go'],
      careers: ['daubep', 'thocattoc', 'congnhan', 'taixe', 'kysu', 'nongdan'], route: 'Học trường nghề sau lớp 9', voc: true },
    xahoi: { label: 'Giao tiếp – chăm sóc', icon: '🤝', loc: 'park', anim: 'talk', stat: { happy: [3, 5], karma: [1, 3] },
      kw: ['ban be', 'choi voi ban', 'choi voi em', 'trong em', 'giup', 'cham soc', 'ban hang', 'choi ban hang', 'nau com do', 'do hang', 'co giao', 'bac si', 'y ta', 'day hoc', 'lop truong', 'noi chuyen', 'ke chuyen', 'tro chuyen', 'tu thien', 'hang xom', 'ong ba', 'em be', 'dong vai', 'tieng anh', 'ngoai ngu', 'thuyet trinh', 'mc'],
      careers: ['giaovien', 'dieuduong', 'bacsi', 'luatsu', 'marketing', 'banhang', 'phiendich', 'congchuc'], route: 'Làm lớp trưởng, theo hướng sư phạm – y tế' },
    game: { label: 'Game – công nghệ', icon: '🎮', loc: 'bedroom', anim: 'type', stat: { happy: [3, 6], smarts: [0, 2] },
      kw: ['game', 'choi game', 'dien tu', 'may tinh', 'dien thoai', 'ipad', 'lien quan', 'free fire', 'minecraft', 'roblox', 'pubg', 'lol', 'esport', 'youtube', 'tiktok', 'livestream', 'stream', 'quay video', 'edit', 'internet', 'len mang'],
      careers: ['esports', 'streamer', 'laptrinh', 'thietke'], route: 'Thử sức đội tuyển eSports trẻ' },
  };
  // môn thể thao cụ thể (để biết nên cho vào lò nào)
  // lộ trình ngoại khóa → chuyên nghiệp (theo mô hình lò đào tạo trẻ ở Việt Nam). need = điểm rèn luyện, hp = sức khỏe tối thiểu
  const YOUTH_SPORT = {
    cauthu: { name: 'Bóng đá', icon: '⚽', loc: 'stadium', fee: 4e6, from: 6, pro: 'Ký hợp đồng chuyên nghiệp với CLB V-League',
      stages: [
        { name: 'Đội bóng ngoại khóa của trường', age: 6 },
        { name: 'Lò đào tạo trẻ CLB (U13)', age: 10, need: 12, hp: 55, odds: 0.45, test: 'Học viện bóng đá trẻ mở đợt tuyển sinh: chạy 30 mét, rê bóng qua cọc, đá đối kháng 7 người. Hàng nghìn đứa trẻ, chỉ lấy vài chục.' },
        { name: 'Đội trẻ U17 của CLB', age: 13, need: 28, hp: 65, odds: 0.4, test: 'Ban huấn luyện đánh giá cuối mùa: ai đủ tố chất lên đội U17, ai bị trả về địa phương.' },
        { name: 'Đội U19 / dự bị chuyên nghiệp', age: 16, need: 45, hp: 72, odds: 0.35, test: 'Giải U19 quốc gia là cơ hội cuối để lọt mắt xanh đội một. Tuyển trạch viên ngồi kín khán đài.' }
      ],
      seasons: ['Mùa giải năm nay bạn ghi {n} bàn cho đội.', 'Bạn đá chính {n} trận, được khen chạy không biết mệt.', 'Năm nay bạn ngồi dự bị khá nhiều, chỉ ra sân {n} trận.'] },
    vdv_vo: { name: 'Võ thuật', icon: '🥋', loc: 'ring', fee: 3e6, from: 6, pro: 'Vào đội tuyển võ thuật chuyên nghiệp của tỉnh',
      stages: [
        { name: 'CLB võ ngoại khóa ở nhà văn hóa', age: 6 },
        { name: 'Đội năng khiếu võ của quận', age: 10, need: 12, hp: 55, odds: 0.45, test: 'Thi lên đai và tuyển vào đội năng khiếu quận: quyền, đối kháng, thể lực.' },
        { name: 'Đội tuyển trẻ tỉnh', age: 13, need: 28, hp: 65, odds: 0.4, test: 'Giải trẻ toàn tỉnh: phải vào tới bán kết mới được gọi lên đội tuyển trẻ.' },
        { name: 'Đội tuyển trẻ quốc gia', age: 16, need: 45, hp: 72, odds: 0.3, test: 'Giải vô địch trẻ quốc gia: huy chương sẽ mở cửa vào đội tuyển trẻ quốc gia.' }
      ],
      seasons: ['Năm nay bạn thi {n} giải, lên thêm một đai.', 'Bạn đấu {n} trận đối kháng, mặt mũi bầm tím nhưng thắng nhiều hơn thua.', 'Năm nay bạn tập là chính, chỉ thi {n} giải nhỏ.'] },
    caulong: { name: 'Cầu lông', icon: '🏸', loc: 'court', fee: 3e6, from: 7, pro: 'Lên đội tuyển cầu lông chuyên nghiệp của tỉnh',
      stages: [
        { name: 'Lớp cầu lông ngoại khóa', age: 7 },
        { name: 'Đội năng khiếu cầu lông thành phố', age: 10, need: 12, hp: 55, odds: 0.45, test: 'Buổi tuyển chọn năng khiếu: phản xạ, bộ chân, đập cầu.' },
        { name: 'Đội tuyển trẻ tỉnh', age: 13, need: 28, hp: 62, odds: 0.4, test: 'Giải trẻ toàn quốc lứa U15: phải có huy chương mới được giữ lại đội tỉnh.' },
        { name: 'Đội tuyển trẻ quốc gia', age: 16, need: 45, hp: 70, odds: 0.3, test: 'Đợt tập trung đội tuyển trẻ quốc gia, chỉ giữ lại người xuất sắc nhất mỗi nội dung.' }
      ],
      seasons: ['Năm nay bạn thi {n} giải, có cả huy chương.', 'Bạn đánh {n} trận giải phong trào, thắng phần lớn.', 'Năm nay vợt gãy {n} lần vì tập quá hăng.'] },
    esports: { name: 'Thể thao điện tử', icon: '🎮', loc: 'studio', fee: 2e6, from: 11, stat: 'smarts', pro: 'Ký hợp đồng tuyển thủ với đội eSports chuyên nghiệp',
      stages: [
        { name: 'Đội game của trường', age: 11 },
        { name: 'Đội bán chuyên (giải học sinh – sinh viên)', age: 12, need: 12, hp: 0, odds: 0.45, test: 'Giải eSports học sinh toàn thành phố: đội phải vào top 8.' },
        { name: 'Học viện eSports (đội trẻ)', age: 14, need: 28, hp: 0, odds: 0.4, test: 'Học viện eSports tuyển học viên: leo top rank máy chủ Việt Nam và thử việc một tuần.' },
        { name: 'Đội dự bị chuyên nghiệp', age: 16, need: 45, hp: 0, odds: 0.35, test: 'Đội chuyên nghiệp mở thử việc cho đội dự bị: đấu tập với đội chính suốt một tháng.' }
      ],
      seasons: ['Năm nay bạn leo lên rank cao nhất, cày {n} trăm trận.', 'Đội bạn đánh {n} giải online, có giải vào chung kết.', 'Năm nay bạn chỉ chơi {n} giải, bố mẹ bắt giảm giờ chơi.'] }
  };
  YOUTH_SPORT.bongro = { name: 'Bóng rổ', icon: '🏀', loc: 'court', fee: 3e6, from: 8, pro: 'Ký hợp đồng với một đội bóng rổ chuyên nghiệp VBA',
    stages: [
      { name: 'Đội bóng rổ ngoại khóa của trường', age: 8 },
      { name: 'CLB bóng rổ trẻ thành phố', age: 11, need: 12, hp: 55, odds: 0.45, test: 'CLB bóng rổ trẻ tuyển quân: đo chiều cao, bật nhảy, ném rổ, đấu 3x3.' },
      { name: 'Đội tuyển trẻ U16', age: 13, need: 28, hp: 65, odds: 0.4, test: 'Giải bóng rổ học sinh toàn quốc: thành tích cá nhân quyết định suất lên U16.' },
      { name: 'Đội trẻ của CLB VBA', age: 16, need: 45, hp: 70, odds: 0.35, test: 'Trại tuyển chọn tài năng trẻ của giải VBA, tuyển trạch viên các đội có mặt đủ.' }
    ],
    seasons: ['Mùa này bạn ghi trung bình {n} điểm mỗi trận.', 'Bạn có {n} cú úp rổ, cả trường hò hét.', 'Năm nay bạn chủ yếu ngồi dự bị, ra sân {n} trận.'] };
  const ySport = (name, icon, loc, from, stages, pro, seasons) => ({ name, icon, loc, fee: 3e6, from, pro, seasons, stages: stages.map((s, i) => Object.assign({ name: s[0], age: s[1] }, i ? { need: [0, 12, 28, 45][i], hp: [0, 55, 64, 72][i], odds: [0, 0.45, 0.4, 0.33][i], test: s[2] } : {})) });
  YOUTH_SPORT.boi = ySport('Bơi lội', '🏊', 'beach', 6, [['Lớp bơi ngoại khóa', 6], ['Đội năng khiếu bơi', 9, 'Thi tuyển năng khiếu: bơi 50 mét tự do tính giờ, kiểm tra sải tay và sức bền.'], ['Đội tuyển trẻ tỉnh', 12, 'Giải bơi trẻ toàn quốc: phải vào chung kết mới được giữ lại đội tỉnh.'], ['Đội tuyển trẻ quốc gia', 15, 'Đợt tập trung đội tuyển trẻ quốc gia, chỉ lấy người có thành tích tốt nhất mỗi cự ly.']], 'Lên đội tuyển bơi chuyên nghiệp của tỉnh', ['Năm nay bạn bơi {n} giải, lần nào cũng phá thành tích cá nhân.', 'Sáng nào cũng xuống bể lúc 5 giờ, bạn bơi {n} cây số mỗi tuần.', 'Năm nay bạn chỉ thi {n} giải vì bị viêm tai.']);
  YOUTH_SPORT.dienkinh = ySport('Điền kinh', '🏃', 'stadium', 8, [['Đội điền kinh của trường', 8], ['Đội năng khiếu điền kinh', 11, 'Hội khỏe Phù Đổng cấp thành phố: chạy 100 mét, nhảy xa, ném bóng.'], ['Đội tuyển trẻ tỉnh', 13, 'Giải điền kinh trẻ toàn quốc: phải có huy chương mới được gọi lên đội tỉnh.'], ['Đội tuyển trẻ quốc gia', 16, 'Đợt tuyển chọn đội tuyển trẻ quốc gia, đo thành tích từng phần trăm giây.']], 'Lên đội tuyển điền kinh chuyên nghiệp của tỉnh', ['Năm nay bạn chạy {n} giải, cải thiện thành tích đáng kể.', 'Bạn tập {n} buổi một tuần trên đường chạy đất đỏ của trường.', 'Năm nay bạn bị đau cổ chân, chỉ thi được {n} giải.']);
  YOUTH_SPORT.bongchuyen = ySport('Bóng chuyền', '🏐', 'court', 10, [['Đội bóng chuyền của trường', 10], ['CLB bóng chuyền trẻ', 12, 'CLB bóng chuyền trẻ tuyển quân: đo chiều cao, bật nhảy, chuyền và đập bóng.'], ['Đội trẻ tỉnh', 14, 'Giải bóng chuyền trẻ toàn quốc, các đội VĐQG cử người xem.'], ['Đội trẻ của CLB VĐQG', 16, 'Trại tuyển chọn của CLB bóng chuyền VĐQG.']], 'Ký hợp đồng với CLB bóng chuyền VĐQG', ['Mùa này bạn có {n} cú đập ghi điểm mỗi trận.', 'Bạn đá chính {n} trận, chuyền hai cực ăn ý.', 'Năm nay bạn ngồi dự bị, vào sân {n} trận.']);
  // đội nước ngoài có thể chiêu mộ VĐV Việt (tier càng cao càng khó, mult = hệ số thu nhập)
  const FOREIGN_CLUBS = {
    cauthu: [
      { clubs: ['Buriram United', 'Port FC', 'BG Pathum United'], country: 'Thái Lan', mult: 2, minLv: 1 },
      { clubs: ['Yokohama F. Marinos', 'Ulsan HD', 'Cerezo Osaka'], country: 'Nhật Bản / Hàn Quốc', mult: 4, minLv: 2 },
      { clubs: ['Sint-Truiden', 'Real Sociedad', 'Feyenoord'], country: 'châu Âu', mult: 8, minLv: 3 },
      { clubs: ['Manchester United', 'Arsenal', 'Liverpool', 'Manchester City', 'Chelsea', 'Tottenham Hotspur'], country: 'Anh (Premier League)', mult: 25, minLv: 3, rare: true }
    ],
    bongro: [
      { clubs: ['Saigon Heat (ABL)', 'Hong Kong Eastern', 'Zamboanga Valientes'], country: 'giải ABL Đông Nam Á', mult: 2, minLv: 1 },
      { clubs: ['Chiba Jets', 'Alvark Tokyo', 'Seoul SK Knights'], country: 'Nhật Bản / Hàn Quốc', mult: 4, minLv: 2 },
      { clubs: ['Real Madrid Baloncesto', 'Fenerbahçe', 'Olympiacos'], country: 'châu Âu (EuroLeague)', mult: 9, minLv: 3 },
      { clubs: ['Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics', 'Miami Heat', 'Chicago Bulls'], country: 'Mỹ (NBA)', mult: 30, minLv: 3, rare: true }
    ],
    esports: [
      { clubs: ['Talon Esports', 'Team Secret', 'Bleed Esports'], country: 'Đông Nam Á', mult: 2, minLv: 1 },
      { clubs: ['Paper Rex', 'DRX', 'Gen.G'], country: 'châu Á – Thái Bình Dương', mult: 4, minLv: 1 },
      { clubs: ['G2 Esports', 'Sentinels', 'LOUD', 'Fnatic', 'Team Liquid', 'T1'], country: 'quốc tế', mult: 10, minLv: 2, rare: true }
    ],
    caulong: [
      { clubs: ['Bengaluru Raptors', 'Hyderabad Hunters'], country: 'Ấn Độ (Premier Badminton League)', mult: 2.5, minLv: 2 },
      { clubs: ['Đội tuyển BWF World Tour của Yonex', 'Đội tuyển BWF World Tour của Victor'], country: 'quốc tế', mult: 5, minLv: 3, rare: true }
    ],
    vdv_vo: [
      { clubs: ['ONE Championship', 'Lion Championship (Singapore)'], country: 'Singapore', mult: 3, minLv: 2 },
      { clubs: ['UFC', 'Bellator MMA'], country: 'Mỹ', mult: 10, minLv: 3, rare: true }
    ]
  };
  // độ khó: inc = thu nhập, ill = khả năng mắc bệnh, haz = rủi ro đời sống, mort = tử vong, exam = cộng/trừ tỉ lệ đỗ, score = hệ số điểm
  const DIFFICULTY = [
    { id: 'de', label: 'Dễ', icon: '🌱', desc: 'Lương cao hơn, ít bệnh, ít rủi ro. Điểm ×0,9.', inc: 1.25, ill: 0.6, haz: 0.6, mort: 0.75, exam: 0.08, score: 0.9 },
    { id: 'thuong', label: 'Thường', icon: '🌾', desc: 'Đời như đời thật.', inc: 1, ill: 1, haz: 1, mort: 1, exam: 0, score: 1 },
    { id: 'kho', label: 'Khó', icon: '🔥', desc: 'Lương thấp, bệnh nhiều, thi khó, rủi ro dày hơn. Điểm ×1,05.', inc: 0.85, ill: 1.35, haz: 1.4, mort: 1.25, exam: -0.06, score: 1.05 },
    { id: 'diangu', label: 'Địa ngục', icon: '💀', desc: 'Kiếm tiền rất khó, bệnh tật, tai nạn dồn dập. Sống được tới 70 là huyền thoại. Điểm ×1,1.', inc: 0.7, ill: 1.75, haz: 2, mort: 1.6, exam: -0.12, score: 1.1 },
  ];
  const SPORT_KW = { cauthu: ['bong da', 'da bong', 'da banh', 'sut', 'thu mon'], vdv_vo: ['hoc vo', 'vo thuat', 'danh vo', 'karate', 'taekwondo', 'kung fu', 'dam boc', 'boxing', 'danh nhau'], caulong: ['cau long', 'vot', 'bong ban'], bongro: ['bong ro', 'nem ro', 'up ro', 'basketball', 'nba'], boi: ['boi loi', 'di boi', 'be boi', 'hoc boi'], dienkinh: ['chay bo', 'dien kinh', 'chay nhanh', 'nhay xa', 'nhay cao'], bongchuyen: ['bong chuyen', 'dap bong'] };
  // trường nghề: học 2 năm, ra trường có bằng trung cấp và được ưu tiên vào nghề tương ứng
  const VOC_TRADES = [
    { id: 'nauan', name: 'Nấu ăn', career: 'daubep', kw: ['nau', 'bep', 'lam banh', 'nau an'] },
    { id: 'toc', name: 'Làm tóc – trang điểm', career: 'thocattoc', kw: ['toc', 'trang diem', 'lam dep', 'cat toc'] },
    { id: 'dien', name: 'Điện – cơ khí', career: 'congnhan', kw: ['dien', 'sua', 'may moc', 'lap rap', 'dong co', 'han', 'go'] },
    { id: 'oto', name: 'Sửa chữa ô tô – lái xe', career: 'taixe', kw: ['xe', 'o to', 'oto', 'xe may'] },
    { id: 'nong', name: 'Trồng trọt – chăn nuôi', career: 'nongdan', kw: ['trong cay', 'trong rau', 'cay', 'vuon', 'chan nuoi', 'con ga', 'lua'] },
    { id: 'banhang', name: 'Bán hàng – dịch vụ', career: 'banhang', kw: ['ban hang', 'do hang', 'di cho'] },
  ];

  // ---- xác suất biến cố đời sống (mỗi năm), dựa trên số liệu Việt Nam; “ước tính” = số liệu chính thức chỉ tính vụ được trình báo
  const HAZARDS = [
    { id: 'traffic', icon: '🛵', label: 'Va chạm, tai nạn giao thông', p: 0.012, age: [15, 80], events: ['s_crime_va_cham', 's_accident_suyt_xe_tai'], young: ['s_accident_dua_xe'],
      src: 'Cục CSGT (2024): 21.532 vụ tai nạn đường bộ, 9.954 người chết, 16.044 người bị thương. Va quẹt nhẹ không trình báo phổ biến hơn nhiều — ước tính ~1%/năm với người đi xe máy.' },
    { id: 'snatch', icon: '📱', label: 'Bị giật điện thoại, túi xách', p: 0.006, age: [16, 80], events: ['s_crime_giat_dt', 's_crime_moc_tui'],
      src: 'Bộ Công an: khoảng 42.000 vụ phạm tội về trật tự xã hội mỗi năm, chủ yếu cướp giật, trộm cắp, cố ý gây thương tích; nhiều vụ không được trình báo (ước tính). Thành phố lớn rủi ro cao hơn.' },
    { id: 'bike', icon: '🏍️', label: 'Mất trộm xe máy', p: 0.006, age: [18, 80], events: ['s_crime_mat_xe_cafe'], src: 'Ước tính từ thống kê trộm cắp tài sản của Bộ Công an; chỉ áp dụng khi bạn có xe máy.' },
    { id: 'burglary', icon: '🏚️', label: 'Trộm đột nhập nhà', p: 0.004, age: [18, 95], events: ['s_crime_trom_nha'], src: 'Ước tính từ thống kê trộm cắp tài sản (Bộ Công an).' },
    { id: 'scam', icon: '📞', label: 'Bị lừa đảo qua điện thoại, mạng', p: 0.006, age: [18, 95], events: ['s_crime_lua_con', 's_crime_viec_nhe', 's_crime_san_ao', 's_crime_gia_dien_luc'], src: 'Ước tính: lừa đảo trực tuyến tăng mạnh những năm gần đây, người lớn tuổi và người trẻ tìm việc là nhóm dễ bị nhắm tới.' },
    { id: 'drown', icon: '🌊', label: 'Gặp nạn khi tắm sông, suối', p: 0.008, age: [13, 25], events: ['s_accident_tam_song'], src: 'Khoảng 2.000 trẻ em tử vong do đuối nước mỗi năm (WHO, Cục Trẻ em). Nông thôn cao gấp ~4 lần thành thị.' },
    { id: 'fire', icon: '🔥', label: 'Cháy nhà, rò rỉ gas', p: 0.003, age: [13, 95], events: ['s_accident_chay_nha', 's_accident_ro_ga', 's_accident_o_dien'], src: 'Cục PCCC: khoảng 2.000–4.000 vụ cháy, nổ mỗi năm, hơn 100 người chết.' },
    { id: 'dog', icon: '🐕', label: 'Bị chó cắn', p: 0.004, age: [13, 85], events: ['s_accident_cho_can'], src: 'Ước tính: hàng trăm nghìn người phải tiêm phòng dại sau khi bị chó, mèo cắn mỗi năm.' },
    { id: 'stroke', icon: '🧠', label: 'Đột quỵ', age: [30, 120], src: 'Bộ Y tế (2024): khoảng 200.000 ca đột quỵ mỗi năm; nghiên cứu ở BV Bạch Mai: 78% do tăng huyết áp. Làm việc quá sức nhiều năm liền làm nguy cơ tăng mạnh, kể cả ở người trẻ. Gần một nửa tử vong, nhiều người sống sót mang di chứng.' },
    { id: 'cancer', icon: '🎗️', label: 'Ung thư', age: [20, 120], src: 'GLOBOCAN 2022: Việt Nam có 180.480 ca mới, 120.184 ca tử vong mỗi năm; nguy cơ mắc trước 75 tuổi khoảng 16%. Nhiều người phát hiện ở giai đoạn muộn.' },
  ];

  // bảng “Có gì mới” ở màn hình chính — mới nhất ở đầu, mỗi dòng thật ngắn
  const CHANGELOG = [
    { v: '1.65', date: '19/10/2026', items: [
      '✈️ Đi du lịch giờ được TỰ CHỌN điểm đến (trong nước / nước ngoài, giá tiền hiện rõ). 4 cảnh 3D mới: Tokyo (cổng torii, hoa anh đào, núi Phú Sĩ), Seoul (cổng cung điện, tháp Namsan, biển neon), Paris (tháp Eiffel, cà phê vỉa hè), Bangkok (chùa vàng, tuk-tuk, chợ nổi).',
      'Mỗi nước có chuyện riêng: lạc ga Shinjuku, gặp idol K-pop, bị móc túi ở Paris, bị tuk-tuk chặt chém… Đi cùng người yêu thì thân hơn; đi một mình có khi gặp được nửa kia.',
      '📜 Thừa kế: khi bố mẹ đều mất, cả nhà mở di chúc — chia đều theo luật, nhường hết cho anh chị em, đòi phần hơn (dễ thành kiện tụng ra toà) hoặc giữ nhà làm nơi thờ cúng.',
      '🌀 Thiên tai theo vùng: miền Trung bão lũ, miền Tây hạn mặn, Sài Gòn triều cường, miền Bắc rét đậm / nắng nóng, Đà Lạt sạt lở, và dịch bệnh. Chuẩn bị kỹ thì thiệt hại ít; chèo thuyền cứu người vùng lũ có thể thành người hùng.',
    ] },
    { v: '1.64', date: '19/10/2026', items: [
      '🏃 Haxball: giữ Shift để chạy nước rút (thanh thể lực vàng dưới chân, hết thì phải nghỉ cho hồi). Hai người một máy: Q / dấu chấm.',
      '🦵 Xoạc bóng bằng phím E (C): chạm bóng trước là xoạc sạch, xoạc thẳng vào người là phạm lỗi — người bị xoạc choáng 💫. 2 lỗi thẻ vàng, 4 lỗi thẻ đỏ rời sân. Hai người một máy: E / dấu phẩy.',
      '🚨 Phạm lỗi ngoài vòng cấm được đá phạt (đối phương phải lùi xa), trong vòng cấm là PHẠT ĐỀN: thủ môn đứng trên vạch, mọi người ra khỏi vòng cấm. Máy cũng biết chạy nước rút và xoạc.',
      '🏆 Cúp Hax: 8 đội đấu loại trực tiếp (tứ kết máy Dễ → bán kết Thường → chung kết Khó), sơ đồ nhánh đấu, đếm số cúp qua các mùa. Đang sống một cuộc đời thì có thưởng: bán kết 3 triệu, chung kết 8 triệu, vô địch 20 triệu.',
    ] },
    { v: '1.63', date: '19/10/2026', items: [
      '📖 Màn hướng dẫn trước mỗi minigame làm lại cho dễ hiểu: chia rõ 🎯 Mục tiêu · 🕹️ Cách chơi (từng bước, phím bấm hiện thành nút) · 💪 Chỉ số của bạn ảnh hưởng thế nào.',
      '🧪 Nút "Chơi thử" (phím T): chơi một lượt làm quen không tính điểm, xong quay lại màn hướng dẫn và cho biết lượt thử được bao nhiêu %. Chơi thử bao nhiêu lần cũng được.',
      '🆕 Lần đầu gặp một minigame sẽ có nhắc riêng để người mới không bị bỡ ngỡ.',
    ] },
    { v: '1.62', date: '19/10/2026', items: [
      '⚽ Trận bóng trong cuộc đời (cầu thủ, đá phủi, giải đấu…) dễ hơn hẳn: đối thủ tối đa mức Thường và chạy chậm hơn; bạn chạy nhanh hơn chút, sút mạnh hơn, tầm chạm bóng rộng hơn và bóng tự bẻ vào khung khi sút gần đúng hướng.',
      '🎉 Ăn mừng bàn thắng: người ghi bàn chạy ra góc sân ăn mừng (SIUUU, trượt gối, dang tay máy bay, nhảy, suỵt, bắn tim), đồng đội chạy tới ôm, đội thua lững thững về chỗ, pháo giấy bung khắp sân.',
    ] },
    { v: '1.61', date: '19/10/2026', items: [
      '😏 Chủ động ngoại tình: nút "Tán tỉnh" với bạn bè và người yêu cũ (từ 18 tuổi). Đang có vợ/chồng/người yêu mà tán đổ thì họ thành người tình bí mật; còn độc thân thì thành người yêu.',
      '💘 Đã có gia đình vẫn mở được app hẹn hò và hoạt động "Hẹn hò qua app" — hẹn thành công thì có người tình bí mật, nhưng mỗi lần lén hẹn đều có thể bị bắt quả tang.',
      'Ngoại tình khi chỉ đang yêu (chưa cưới) cũng có hậu quả: người yêu phát hiện thì chia tay; người tình chỉ thành người yêu chính thức khi bạn thật sự độc thân.',
    ] },
    { v: '1.60', date: '19/10/2026', items: [
      '⚽ Haxball đấu với máy giờ mặc định 3v3: bạn + 2 đồng đội máy đấu với 3 máy (vẫn chọn 1v1 được trong mục Số người).',
      '🔁 Máy đá kiểu TIKI-TAKA: chuyền ngắn khi bị áp sát, chỉ chuyền khi đường chuyền trống, chuyền vừa lực; đồng đội chạy chỗ tạo tam giác (một người dạt cánh phía trước, một người lùi làm điểm chuyền về).',
      'Đồng đội máy ưu tiên chuyền cho bạn, và tự chạy ra đón khi bạn chuyền cho họ. Bóng rổ cũng chuyền qua lại như vậy.',
    ] },
    { v: '1.59', date: '19/10/2026', items: [
      '⏳ Thêm màn hình loading khi mở game: thanh phần trăm, mẹo chơi, báo khi mạng chậm — không còn cảnh màn hình đứng im tưởng đơ máy.',
      '🎬 Trong lúc loading, game dựng sẵn các cảnh hay gặp (nhà, phòng ngủ, trường, phố, văn phòng, bệnh viện, quán cà phê, công viên) nên lúc chơi chuyển cảnh lần đầu đỡ khựng hẳn.',
    ] },
    { v: '1.58', date: '19/10/2026', items: [
      '⚡ Đỡ lag: khi mở minigame, Haxball, livestream, chụp ảnh… cảnh 3D phía sau tạm dừng vẽ (trước đây vẫn chạy ngầm, livestream còn vẽ thêm 1–2 cảnh 3D cùng lúc).',
      'Màn hình 120–144 Hz chỉ vẽ tối đa 60 khung/giây, đỡ một nửa tải card đồ hoạ. Livestream và trang trí nhà dùng độ phân giải vừa phải hơn.',
      'Sửa lỗi máy rất yếu (dưới 20 FPS) không tự giảm đồ hoạ. Thêm mức thấp nhất: bóng đổ đơn giản, độ phân giải thấp, khoảng 30 khung/giây cho mượt đều.',
      '🌐 Haxball / bóng rổ online: hỗ trợ máy chủ chuyển tiếp qua cổng 443, chơi được ở mạng trường / công ty chặn kết nối trực tiếp mà không cần VPN.',
      '⚽ Haxball dễ đá hơn: tầm chạm bóng rộng hơn, bấm sút sớm một chút vẫn ăn, sút gần đúng hướng thì bóng bẻ nhẹ vào khung thành; máy chạy chậm hơn một chút.',
    ] },
    { v: '1.57', date: '19/10/2026', items: [
      '🎓 Bán khoá học online bị giảm mạnh: ít fan mua thật hơn, trừ 40% phí nền tảng và thuế, mất tiền quay dựng và chạy quảng cáo, có thể lỗ.',
      'Mỗi khoá ra sau bán được khoảng một nửa khoá trước, và càng ra nhiều khoá càng dễ bị chê "lùa gà" (hoàn tiền, mất 20% người theo dõi).',
      '🏷️ Tung bộ sưu tập thương hiệu riêng và hợp đồng đại sứ thương hiệu cũng giảm, có trần thu nhập.',
    ] },
    { v: '1.56', date: '17/10/2026', items: [
      '📸 Đăng ảnh giờ là tự chụp thật: cầm máy kéo để xoay góc, zoom, nâng/hạ máy, chọn dáng (selfie, thả tim, vẫy tay…) và bộ lọc (Trắng sáng, Hàn Quốc, Film cũ…). Thanh "góc đẹp" mách bạn nên chỉnh gì.',
      '🎬 Chụp xong chọn mẫu CapCut giật giật: Giật beat, Glitch RGB, Zoom sốc, Lắc lư, Nháy đèn, Slow tình cảm — mỗi năm có một mẫu 🔥 HOT dễ lên xu hướng. Góc càng đẹp + đúng mẫu hot càng nhiều like.',
      '📱 Lướt MXH kiểu TikTok: vuốt / cuộn chuột / phím ↑↓ xem bài của KOL, người quen của bạn (thả tim tăng thân thiết), quảng cáo, tin tức… và cả quảng cáo lừa đảo — bấm vào là có thể mất tiền!',
      '🐢 Livestream chậm lại cho dễ theo dõi: bình luận, quà, câu hỏi hiện thưa hơn; phiên PK dài 90 giây.',
      '💬 Bình luận trong livestream kéo lên kéo xuống được (lăn chuột / vuốt); đang đọc bình luận cũ thì không bị nhảy xuống, có nút "↓ bình luận mới".',
      '🛠️ Sửa: sau khi tắt live, sự kiện "Giang hồ mạng" không còn bật lại khung livestream cũ trên màn hình nhà.',
    ] },
    { v: '1.55', date: '17/10/2026', items: [
      '⚔️ Live PK làm lại y như TikTok: màn hình chia đôi — bên trái là bạn, bên phải là KOL đối thủ (cả hai đều là nhân vật 3D đang live).',
      'Thanh điểm PK đỏ/xanh trên cùng, đếm ngược 3-2-1 rồi đấu 60 giây; mọi món quà người xem thả (🌹 hoa hồng tới 🚀 tên lửa) đều quy ra điểm.',
      'Chiêu gọi quà: 📣 Kêu gọi thả quà · 🎤 Hát · 💃 Nhảy · 😭 Diễn drama (dễ bị cắt clip) · ⚡ Nhân đôi điểm 10 giây (phím 1–5).',
      'Đối thủ cũng biết bật x2, hát kéo quà và dồn quà ở 12 giây cuối. Hết giờ bên thua chịu phạt; quà nhận được quy ra tiền (sàn chia 50%).',
      '🧑 Icon app mới: thay đèn lồng bằng gương mặt nhân vật 3D (tóc nâu, kính tròn, hoodie đen). Ai đã cài app có thể phải gỡ ra cài lại để thấy icon mới.',
    ] },
    { v: '1.54', date: '17/10/2026', items: [
      '🛋️ Đồ tự bày trong chế độ trang trí 3D giờ hiện đúng chỗ trong cảnh Nhà nơi nhân vật sống (thay cho đồ mặc định)',
      '🪙 Giá vàng có lên có xuống: dao động quanh giá trị thật, có năm sập mạnh, năm sốt giá, khủng hoảng thì vàng lên; mua bán chênh lệch 3%. Hết cảnh ôm vàng là giàu mãi',
    ] },
    { v: '1.53', date: '17/10/2026', items: [
      '🧹 Trong game gọn hơn: tab Tài sản chia thành Tổng quan · Mua sắm (lọc theo loại) · Nhà · Làm ăn; tab Học/Làm chia Công việc · Học vấn · Tìm việc · Khác; tab MXH chia Đăng bài · Tương tác · Hẹn hò · Xếp hạng',
    ] },
    { v: '1.52', date: '17/10/2026', items: [
      '🧹 Màn hình chính gọn gàng: 3 ô nhóm Chế độ chơi · Minigame · Online, bấm ô nào mở nhóm đó; tiện ích nhỏ dồn xuống một hàng',
      '✖ Mọi minigame có nút Thoát ở góc trên: bỏ dở giữa chừng thì để số phận quyết định; bỏ trò ném rổ cũ (Canh thời điểm), chỉ giữ trò Ném rổ đẹp hơn',
      '🕹️ Tổng hợp minigame: chơi thử cả 27 minigame trong game bất cứ lúc nào, chọn độ khó, lưu điểm cao nhất; vào Bóng đá/Bóng rổ Hax và Đua xe online từ cùng một chỗ',
    ] },
    { v: '1.51', date: '17/10/2026', items: [
      '🏀 Bóng rổ kiểu Hax: chọn môn Bóng rổ trong menu Hax, sân có rổ, vạch 3 điểm; ném lọt rổ 2 điểm, ngoài vạch 3 điểm; chơi với máy, 2 người 1 máy hoặc online tối đa 8 người',
      '🛋️ Trang trí nhà riêng 3D (tab Tài sản): 18 món nội thất từ sofa, TV, giường đến bàn thờ, bể cá, đàn piano; chạm để đặt, xoay, di chuyển, bán lại; nhà càng tiện nghi càng vui mỗi năm',
    ] },
    { v: '1.50', date: '17/10/2026', items: [
      '🌾 Nông dân theo mùa vụ: mỗi năm chọn trồng lúa, dưa hấu, thanh long, cà phê hay sầu riêng; thời tiết được mùa, hạn mặn, lũ lụt; được mùa mất giá thì phải giải cứu nông sản',
      '🏗️ Xây nhà trên đất của mình hoặc sửa, đập đi xây lại (tab Hoạt động): thợ ăn bớt vật liệu, tranh chấp ranh giới với hàng xóm',
      '🛡️ Bảo hiểm y tế, bảo hiểm sức khỏe & nhân thọ: trả bớt viện phí, nhưng có khi bị từ chối chi trả; cẩn thận bảo hiểm liên kết đầu tư người quen mời',
      '🏥 Bệnh hiểm nghèo không đủ tiền chữa: kêu gọi quyên góp trên mạng, bán nhà bán xe, vay họ hàng, hoặc bỏ điều trị',
    ] },
    { v: '1.49', date: '17/10/2026', items: [
      '🚕 Chạy xe công nghệ (tab Hoạt động, cần xe): minigame chạy trên lưới phố đón khách, trả khách, giữ 5 sao; ca ngày hoặc ca đêm giá cao mà rủi ro',
      '🔪 Bác sĩ phẫu thuật: minigame kéo dao mổ theo đường kẻ rồi khâu đúng nhịp, trong lúc nhịp tim bệnh nhân tụt dần',
      '🕵️ Cảnh sát phá án: minigame điều tra 4 nghi phạm bằng camera, dấu giày, nhân chứng, chứng cứ ngoại phạm rồi chỉ đúng thủ phạm',
      '🎣 Câu cá: quăng câu, giật cần, kéo dây không đứt; câu hồ hoặc câu biển, bộ sưu tập cá hiếm trong tab Học/Làm',
      '🦈 Shark Tank: công ty riêng lên sóng gọi vốn, trả lời các "cá mập" rồi thương lượng phần trăm cổ phần',
    ] },
    { v: '1.48', date: '17/10/2026', items: [
      '🏍️ Đua xe máy online (nút ở màn hình chính): 3 đường đua Phố cổ · Đường ven biển · Đèo Hải Vân, ô tăng tốc ⚡ và nitro, ổ gà, vũng dầu; đua với máy hoặc online tối đa 8 người',
      '✈️ Xuất khẩu lao động Nhật · Hàn · Đài Loan (tab Hoạt động): phí môi giới, công ty ma, bị chủ chèn ép, làm chui, yêu người bản xứ, 3 năm về nước mang vốn',
      '🗽 Xin định cư nước ngoài: diện đầu tư hoặc diện tay nghề, đủ 5 năm thì nhập quốc tịch',
      '🌐 Bạn bè là người chơi thật (tab Quan hệ): chia sẻ danh thiếp nhân vật lấy mã, nhập mã của bạn bè để nhân vật của họ thành bạn trong đời mình',
      '📰 Kiếp hay hôm nay: bảng tin những cuộc đời điểm cao nhất của người chơi khác, bấm vào đọc cả dòng đời; bia mộ online giờ lưu cả những cột mốc của đời người',
    ] },
    { v: '1.47', date: '17/10/2026', items: [
      '💰 Ai là triệu phú (tab Hoạt động): 15 câu, 3 quyền trợ giúp 50:50 · khán giả · gọi điện, mốc an toàn câu 5 và 10, giải cao nhất 250 triệu',
      '🎤 Thi hát truyền hình "Giọng Ca Vàng": minigame nốt nhạc 4 làn, HLV quay ghế, đi qua giấu mặt → đối đầu → liveshow → chung kết, quán quân thành ca sĩ',
      '🏪 Công ty: mở chi nhánh, bán nhượng quyền thu phí thương hiệu hằng năm — kèm biến cố quản lý ăn chặn, đối tác làm ẩu bị bóc phốt',
      '🏛️ Công chức, cảnh sát, giáo viên, chính trị: chuyện cơ quan — chia phe, phong bì, báo cáo thi đua, bị luân chuyển, lấy phiếu tín nhiệm để lên chức',
    ] },
    { v: '1.46', date: '17/10/2026', items: [
      '⚽ Mùa giải cho cầu thủ: bảng xếp hạng 8 đội 10 vòng trong tab Học/Làm, mỗi năm tự ra sân đá thật 3 vòng, vô địch và vua phá lưới có thưởng, bét bảng thì xuống hạng',
      '💥 Sút tích lực (giữ nút sút trước khi chạm bóng) và 🌀 sút xoáy (chạy ngang khi sút) — trong đời thì mở theo thể lực và trí tuệ',
      '🔁 Kỳ chuyển nhượng: CLB khác hỏi mua — sang đội mới lương cao, đòi tăng lương, hay ở lại vì tình yêu CLB',
      '⚽ Ghi bàn hiện tên người ghi, đếm bàn thắng của bạn trong mùa',
    ] },
    { v: '1.45', date: '17/10/2026', items: [
      '⚽ Bóng đá Hax: 6 bản đồ — Cổ điển, Futsal, Sân lớn, Sân băng (trơn trượt), Bãi biển (cát nặng), Sân hẻm',
      '⚽ Đá đội 2v2, 3v3, 4v4 với đồng đội máy biết phối hợp (người lên bóng, người lùi giữ)',
      '🌐 Online nhiều người: tối đa 8 người một phòng, phòng chờ chia đội Đỏ/Xanh, có thể thêm máy bù người',
      '⚡ Hết lag cho người vào phòng: máy bạn tự dự đoán chuyển động rồi khớp với chủ phòng, nhân vật phản hồi tức thì',
      '⚽ Làm cầu thủ: mọi trận bóng (trừ phạt đền) giờ đều đá thật kiểu Hax — chung kết/đội tuyển đá 3v3 sân lớn, trận chuyên nghiệp 2v2, đá phủi ở sân hẻm, đi biển ở bãi biển, trẻ con đá futsal',
      '⚔️ Thách đấu có thêm môn Đá bóng (Hax); menu Hax có ô nhập tên để bạn bè nhận ra trong phòng online',
    ] },
    { v: '1.44', date: '16/10/2026', items: [
      '⚽ Bóng đá Hax: đá bóng nhìn từ trên xuống kiểu HaxBall, vật lý thật. Đấu với máy (3 mức), 2 người 1 máy, hoặc ONLINE với bạn bè bằng mã phòng',
      '⚽ Làm cầu thủ: trận đấu trong sự nghiệp giờ có lúc được đá thật kiểu Hax 60 giây',
      '📱 Phòng Live mới: điện thoại quay thẳng mặt nhân vật, người xem hỏi — bạn trả lời (bấm nút hoặc tự gõ), nhận quà, hát, nhảy, xin quà, chốt đơn; chán thì bấm ⏹ Tắt live',
      '🐛 Sửa lỗi bình luận live bị lặp 2 tin nhắn giống nhau; giang hồ mạng có thêm nhiều câu mới',
    ] },
    { v: '1.43', date: '16/10/2026', items: [
      '⚔️ Kình địch nổi tiếng: mỗi đấu trường có một đối thủ truyền kiếp suốt đời, tỷ số đối đầu hiện ở tab Học/Làm và MXH',
      '⚽ Cầu thủ: cặp kình địch thế kỷ — đua Quả bóng vàng hằng năm, trận siêu kinh điển (sút penalty quyết định), fan hai phe khẩu chiến #GOAT, câu hỏi “ai hơn ai” ở họp báo, trận cuối đổi áo ôm nhau',
      '🎮 Streamer/game thủ: bị đối thủ tố hack (live quay tay chứng minh), showmatch 1 vs 1 ăn 200 triệu, lời mời collab làm hoà',
      '🥊 Giang hồ mạng: “Thầy Huân Hoa Giấy” vào live huấn luyện (nghe theo, cà khịa hay xin làm đệ tử), màn “Đm thằng đầu cắt moi, mày cho bố cái địa chỉ nhà!”, và ngày “thầy” bị bắt',
      '🎤 Ca sĩ: đua top trending cùng giờ ra MV, bị tố đạo nhạc'
    ] },
    { v: '1.42', date: '16/10/2026', items: [
      '✍️ Tự viết bình luận: ở tab MXH mỗi bình luận có ô “Tự viết câu trả lời” — game đọc giọng điệu câu bạn gõ (tử tế, hài hước hay gắt gỏng) để quyết định fan phản ứng ra sao',
      '💬 Trả lời ngay trong khung LIVE: bấm vào một bình luận để chọn 💗 Cảm ơn, 😂 Đáp hài, 😤 Đáp trả, 🚫 Chặn hoặc tự gõ; còn có ô “Nói gì đó với người xem” cho cả phòng live',
      '🥊 Giang hồ mạng tràn vào chat và bình luận: “ra đây solo không”, “nộp tiền bảo kê kênh chưa?” — đáp trả gắt thì drama hút view nhưng mất phúc đức, cả đám “đệ” kéo vào và có thể tìm tới bạn',
      '🥊 Kênh MXH mới “Giang hồ mạng”: lên fan cực nhanh nhưng hay bị báo cáo, phạt hành chính, bóp tương tác'
    ] },
    { v: '1.41', date: '16/10/2026', items: [
      '💬 Khung bình luận LIVE giờ chỉ hiện khi nhân vật thật sự đang livestream (live bán hàng, PK, trò chuyện, giang hồ mạng, ca làm việc của streamer) — không còn hiện lúc còn bé hay chưa có điện thoại; số người xem tính theo lượng theo dõi',
      '🎙️ Livestream trò chuyện: người xem hỏi “lương bao nhiêu”, “có người yêu chưa”, “phốt năm ngoái thật không”… — trả lời thật lòng, né khéo hay troll lại',
      '🥊 Giang hồ mạng: bị kéo fan vào phá live — chửi lại (có thể bị phạt, khoá kênh), hẹn “solo” ngoài đời (minigame đánh nhau, công an mời làm việc), đối chất văn minh, hoặc chặn và báo cáo',
      '🌙 Live tâm sự đêm khuya, và 😱 sự cố trên sóng: mẹ mặc đồ ngủ đi ngang, mất điện, mèo nhảy lên bàn phím…'
    ] },
    { v: '1.40.1', date: '16/10/2026', items: [
      '🛠️ Sửa lỗi màn hình tạo nhân vật: bấm chọn tóc, áo, phụ kiện… không còn bị nhảy ngược lên đầu trang'
    ] },
    { v: '1.40', date: '16/10/2026', items: [
      '🎬 Phim cuộc đời 30 giây: ở màn hình tiễn biệt, ghép các khoảnh khắc trong album 3D thành video dọc có zoom chậm, phụ đề và nhạc nền — tải về đăng TikTok, Reels, story',
      '🔮 Định mệnh ngày sinh: chọn ngày tháng sinh khi tạo nhân vật → cung hoàng đạo, nguyên tố, tuổi can chi, một lời “phán” và chút chỉ số khởi đầu',
      '⚔️ Thách bạn bè sống lại đời này: gửi link, bạn bè bắt đầu y hệt (tên, quê, năm sinh, ngoại hình, chỉ số); cuối đời hiện bảng so điểm ai sống tốt hơn',
      '🌐 Nghĩa trang online: đưa bia mộ lên nghĩa trang chung, người chơi khác thắp nhang và để lại lời nhắn; mở từ màn hình chính',
      '✨ Skin trang phục mở khoá: Ngầu lòi, Đồ ngủ khủng long, Siêu anh hùng (áo choàng), Phi hành gia (mũ kính), Thiên thần (vòng sáng, đôi cánh), Ác quỷ (sừng, đuôi), Hoàng đế (vương miện) — hiện trong cảnh 3D'
    ] },
    { v: '1.39', date: '16/10/2026', items: [
      '💘 App hẹn hò (tab MXH): quẹt trái/phải hồ sơ, match rồi chọn cách mở lời (hài hước, chân thành, thả thính) để đi hẹn — có thể thành người yêu, bị “seen” không rep, gặp tài khoản ảo hoặc lừa đảo tình cảm',
      '⚔️ Livestream PK: đấu quà với KOL khác bằng minigame, thắng thì nhận quà và fan, thua chịu phạt trên sóng',
      '👥 Hội nhóm Facebook: mẹ bỉm sữa, săn sale, phượt, review ăn uống, chứng khoán F0, yêu chó mèo — mỗi hội có drama riêng; đủ 5K fan thì tự lập hội làm admin, kiếm tiền đăng bài (và bị tố ăn chặn)',
      '👵 Mẹ chồng / mẹ vợ: cưới xong chọn ở chung hay ra riêng; ở chung thì có chiến tranh căn bếp, chuyện nuôi con, tiền nong, so sánh họ hàng',
      '🐯 Kiểu nuôi con: mẹ hổ (học giỏi nhưng xa cách, con kiệt sức, lớn lên trách bố mẹ), thả rông (vui nhưng dễ hư) hoặc dân chủ',
      '📸 Ngoại tình lộ qua MXH: ảnh check-in, story của người lạ làm lộ người tình; và chiều ngược lại — phát hiện vợ/chồng có dấu hiệu qua Facebook, có thể bóc phốt công khai'
    ] },
    { v: '1.38', date: '16/10/2026', items: [
      '📲 Tín dụng đen: vay nóng qua app (tab Tài sản) giải ngân 5 phút nhưng bị trừ 20% phí, nợ nhân ~1,6 lần mỗi năm; không trả là bị khủng bố danh bạ, sơn cửa, đổ mắm tôm — trả, vay app khác đắp vào, nhờ gia đình hay tố cáo công an. Cháy túi thì có tin nhắn “hỗ trợ tài chính” mời vay',
      '🧧 Chơi hụi với hàng xóm: góp hằng tháng 2 năm, hốt sớm chịu lãi, chờ cuối có lời — và nguy cơ VỠ HỤI khi chủ hụi ôm tiền bỏ trốn',
      '🔥 Sốt đất / vàng / coin: thị trường sốt thì cả xóm rủ nhau lướt sóng — ôm đất nền, đổ tiền vào coin “sắp lên sàn” (có thể bị rug pull về 0), xếp hàng mua vàng; bong bóng vỡ là “đu đỉnh”',
      '📰 Thị trường việc làm sống động: mỗi năm các ngành sốt tuyển hoặc sa thải hàng loạt (ảnh hưởng tỷ lệ đậu phỏng vấn), đang làm trong ngành sa thải có thể bị cắt giảm; từ 2030 AI thay thế dần kế toán, phiên dịch, marketing, tài xế…'
    ] },
    { v: '1.37', date: '16/10/2026', items: [
      '🏥 Mở cơ sở riêng theo nghề khi đạt “Giỏi nghề”: phòng khám tư, trung tâm luyện thi, nhà hàng của bếp trưởng, văn phòng luật, salon, studio thiết kế, công ty lữ hành, học viện thể thao, agency truyền thông, trang trại công nghệ cao — vừa hành nghề vừa làm chủ, danh tiếng nghề kéo khách',
      '🌀 12 cú twist hiếm gặp: phát hiện là con nuôi rồi đi tìm mẹ ruột, vé số trúng 2 tỷ trong túi quần đang giặt, người yêu cũ dắt con tới, bị trao nhầm ở nhà hộ sinh, cụ bán vé số để lại di chúc, bạn thân phản bội, gặp anh chị em song sinh thất lạc, ví tiền ảo quên mật khẩu, bí mật của bố, clip karaoke 10 năm trước thành trend, chẩn đoán nhầm ung thư',
      '📱 Nghề ↔ MXH: pha xử lý xuất sắc trong ca làm việc có thể bị quay lại và lan truyền; gian dối bị lộ thì clip bóc phốt lan nhanh'
    ] },
    { v: '1.36', date: '16/10/2026', items: [
      '💬 Bình luận ảo kiểu livestream: mỗi tình huống, khán giả ảo nhảy vào chat “chọn 1 điii”, “toang rồi ông giáo ạ 💀”, “QUÁ ĐỈNH 🔥”… số người xem tăng theo độ nổi tiếng của bạn (tắt/bật trong ⚙️)',
      '📤 Ảnh chia sẻ cuộc đời mới dạng dọc 9:16 (đăng story, TikTok): bia mộ, 4 khoảnh khắc từ album 3D, điểm, danh hiệu và dấu ấn cả đời',
      '⚙️ Cài đặt: thêm công tắc Hậu kỳ điện ảnh (máy yếu tắt cho mượt) và Bình luận ảo'
    ] },
    { v: '1.35', date: '16/10/2026', items: [
      '🎖️ Danh tiếng nghề: làm tốt các ca khó để lên Lành nghề → Giỏi nghề → Chuyên gia → Huyền thoại; mỗi bậc tăng lương, cấp trên chú ý; gian dối bị lộ thì tụt bậc',
      '⚽ Nghề thể thao có ca thi đấu riêng chơi bằng minigame: penalty phút bù giờ, ném rổ chung kết, tranh suất SEA Games, set quyết định, chung kết bơi/chạy, eSports lật kèo… và cả lời mời bán độ',
      '86 ca làm việc trên 48 nghề: thêm ca thứ hai cho hầu hết nghề (thuốc giả, giải cứu con tin, tin nóng chưa kiểm chứng, đình công, dưa bị ép giá, cảnh báo động cơ…)',
      'Kênh MXH “Chuyện nghề” lên nhanh hơn khi bạn có danh tiếng nghề cao'
    ] },
    { v: '1.34', date: '16/10/2026', items: [
      '💼 Công việc rõ ràng: 40 nghề có “ca làm việc” thật — bác sĩ mổ cấp cứu, giáo viên dự giờ, lập trình viên cứu hệ thống sập, chủ kinh doanh chốt đơn, cảnh sát truy đuổi, lính cứu hoả lao vào đám cháy… Nút mới trong tab Học/Làm, và công việc cũng tự tìm đến bạn mỗi năm',
      'Mỗi ca có lựa chọn rủi ro cao/chắc ăn/gian dối, nhiều lựa chọn chơi bằng minigame; kết quả ảnh hưởng thành tích (thăng chức), thưởng, nghiệp — gian dối có thể bị đuổi việc',
      '📱 MXH 2.0: chọn kênh chủ đề (hài, làm đẹp, ẩm thực, kiến thức, game, du lịch, gym, chuyện nghề, kinh doanh) — hợp nghề và thế mạnh thì lên nhanh',
      '13 kiểu nội dung: vlog, kể chuyện đời, thử thách mạo hiểm, review, livestream, bóc phốt, collab, từ thiện, bán khoá học, ra mắt thương hiệu riêng…; lịch sử bài đăng có lượt xem, lượt thích, nhãn VIRAL',
      '📩 Hộp thư: fan, nhãn hàng, link lừa đảo hack tài khoản, người lạ rủ hẹn hò (có thể thành người yêu), báo chí, gameshow, đại sứ thương hiệu; tích xanh, bảng xếp hạng KOL, tiền quảng cáo nền tảng hằng năm',
      'Biến cố MXH: bị hack, đề cử KOL của năm, bị KOL khác cà khịa, phát ngôn cũ bị đào lại, bị quay lén thành meme'
    ] },
    { v: '1.33', date: '16/10/2026', items: [
      '💸 “Phú không quá ba đời”: thừa kế phải trừ ma chay, bán gấp tài sản, chia cho cả bố/mẹ còn sống và nộp 10% thuế; nhà giàu tiêu xài theo của cải (không còn sống bằng 40 triệu/năm)',
      '🏢 Công ty thừa kế: con chưa từng điều hành thì hiệu quả thấp, phải tự tay quản lý nhiều năm mới chạy hết công suất; công ty càng to càng khó lớn, cổ tức chỉ chia một phần lợi nhuận',
      '💎 Cậu ấm cô chiêu: siêu xe, sòng bạc Macau, “dự án nghìn tỷ” của hội bạn, anh em kiện chia tài sản, bị bắt cóc tống tiền',
      '🤲 Giàu quá thì bị làm phiền liên tục: họ hàng vay tiền, đoàn xin tài trợ, cuộc gọi lừa đảo, thanh tra thuế. Nổi tiếng quá: paparazzi, fan cuồng, antifan bóc phốt, ra đường bị vây xin chụp ảnh',
      '⚡ Đỡ giật lag: giảm độ phân giải hậu kỳ trên màn hình nét cao, gộp ngọn tóc, sửa rò rỉ bộ nhớ khi đổi cảnh; máy yếu tự hạ đồ hoạ'
    ] },
    { v: '1.32', date: '16/10/2026', items: [
      '💇 Tóc mới: có lọn sáng tối và vệt bóng kiểu anime, mái và đuôi tóc lởm chởm tự nhiên thay vì tròn như mũ bảo hiểm',
      'Dáng người rõ nam nữ: nữ eo thon, ngực và hông có đường cong; nam vai rộng dáng chữ V',
      'Bàn tay có ngón cái và ngón khép, bóng mềm dưới chân cho nhân vật đứng vững trên sàn; cổ hết bị sáng trắng, thân tròn mịn hơn'
    ] },
    { v: '1.31', date: '16/10/2026', items: [
      '🧍 Nhân vật mới hoàn toàn: thân, tay, chân liền một khối có xương nên khuỷu tay, đầu gối, vai uốn mềm như nhân vật game thật (hết kiểu búp bê gỗ ghép khúc)',
      'Tỉ lệ dễ thương hơn: đầu to hơn chút, tay chân đầy đặn, viền sáng quanh người cho nổi bật khỏi nền',
      '🎬 Hậu kỳ điện ảnh: đèn neon, màn hình, pháo hoa phát sáng lan toả; màu đậm đà, vignette; cảnh kịch tính có dải đen điện ảnh và rung máy'
    ] },
    { v: '1.30', date: '16/10/2026', items: [
      '🏀 Minigame bóng rổ riêng “Ném rổ”: giữ Space để lấy lực, thả đúng vùng xanh. 6 cú ném gồm lên rổ, tầm trung, ba điểm, ném phạt, ba điểm có hậu vệ nhảy chắn và cú ném quyết định',
      'Nghề cầu thủ bóng rổ, lò năng khiếu bóng rổ và thách đấu online đều dùng minigame mới',
      'Sự kiện mới: kèo 3x3 ngoài công viên, thử việc đội bóng rổ trường, buzzer beater bán kết VBA, ném phạt giữa sân khách'
    ] },
    { v: '1.29', date: '16/10/2026', items: [
      '🏆 World Cup 4 năm một lần, đúng các năm thật (1958 … 2022, 2026, 2030…): chủ nhà và nhà vô địch thật trong quá khứ, tương lai do số phận định đoạt',
      '📺 Mỗi mùa World Cup chọn cách “đú”: thức trắng xem cùng hội bạn, cá độ đoán đội vô địch, mở quán chiếu bóng đá (minigame bán hàng) hoặc đi ngủ',
      '🇻🇳 Từ 2030 Việt Nam có thể giành vé dự World Cup → đi bão cả đêm; nếu bạn là tuyển thủ quốc gia thì được ra sân trận quyết định (minigame sút penalty); xa hơn nữa… có khi Việt Nam vô địch thế giới!',
    ] },
    { v: '1.28', date: '16/10/2026', items: [
      '♻️ Luân hồi theo nghiệp: hết một kiếp, nút “Đầu thai” xếp kiếp sau theo điểm nghiệp – 🌟 Phúc lớn (giàu, giỏi, khỏe, 18 tuổi được 2 tỷ), 🍀 Có phúc, ⚖️ Bình thường, 🌧️ Nghiệp nhẹ; nghiệp nặng phải sống một kiếp chó / trâu / gà để trả nghiệp trước. 4 tuổi có thể nhớ lại tiền kiếp',
      '🎬 Kịch bản đặc biệt (nút ở màn hình chính): Con nhà nghèo vượt khó, Thiếu gia phá sản, Sinh ra trong thời chiến (1955), Một đời cầu thủ, Con đường học thuật, Giang hồ hoàn lương, Gia đình trăm năm – mỗi kịch bản có hoàn cảnh và mục tiêu riêng, kết quả hiện ở cuối đời',
      '📌 Tab Nhật ký hiện rõ kịch bản đang chơi, án tù còn lại hoặc tình trạng truy nã',
    ] },
    { v: '1.27', date: '16/10/2026', items: [
      '👨‍👩‍👧 Online “Sống chung một nhà”: chủ phòng chọn chế độ ở sảnh chờ; cả phòng là anh chị em ruột – cùng họ, cùng quê, cùng năm sinh, cùng bố mẹ. Anh chị em hiện trong danh sách quan hệ với tuổi thật; bố mẹ mất thì cả nhà cùng chịu tang; có nút “💸 Cho anh/chị/em tiền”',
      '🏯 Dòng họ online (nút ở màn hình chính): lập hoặc gia nhập bằng mã 6 ký tự, tối đa 30 người; mỗi kiếp sống xong tự cộng điểm cho cả họ; góp tiền của nhân vật vào quỹ chung; quỹ càng lớn con cháu tròn 18 tuổi càng được học bổng to; bảng xếp hạng dòng họ',
      '📜 Tiểu sử chia sẻ được: khi qua đời bấm “Tiểu sử & link chia sẻ” để đọc tiểu sử viết thành văn, rồi tạo link gửi bạn bè; ai mở link cũng đọc được',
    ] },
    { v: '1.26', date: '16/10/2026', items: [
      '🌳 Gia phả nhiều đời (nút “Gia phả” ở màn hình chính và tab Quan hệ): mỗi đời có năm sinh – mất, nghề, vợ/chồng, con cái, tài sản, người nối dõi',
      '🏺 Đồ gia truyền: huân chương kháng chiến, huy chương Olympic, tủ sách giáo sư, nhà thờ họ, gậy trúc trăm tuổi, két sắt gia truyền… cộng chỉ số cho con cháu đời sau; người giàu trong họ được mời xây nhà thờ họ',
      '👶 Nuôi dạy con: mỗi con có tính cách và học lực riêng; chọn trường công/tư/quốc tế, cho học thêm hay theo năng khiếu; con nổi loạn bỏ nhà đi, nghiện game, yêu sớm; 18 tuổi đỗ/trượt đại học, 27 tuổi thành đạt (gửi tiền biếu) hoặc phá gia chi tử (nợ cờ bạc). Con nối dõi thừa hưởng học lực',
      '🛋️ Trang trí nhà (tab Tiền): thảm, cây cảnh, đèn, tranh, bể cá, tượng, tủ rượu, piano, kệ sách… hiện ngay trong cảnh 3D, cộng hạnh phúc mỗi năm, truyền lại cho con',
      '🐾 Thú cưng nâng cao (tab Quan hệ → “Nuôi thú cưng”): 13 loài – chó ta, Phú Quốc, Corgi, Husky, Poodle, mèo mướp, Anh lông ngắn, Ba Tư, vẹt Macaw, thỏ, hamster, rùa, cá rồng (giúp công ty làm ăn); mỗi loài tuổi thọ riêng; huấn luyện rồi đi thi tài năng; ốm, đi lạc, vẹt nói bậy',
    ] },
    { v: '1.25', date: '16/10/2026', items: [
      '⌨️ Minigame hiện hướng dẫn phím ngay khi chơi (dòng nhắc phím + nhãn phím trên từng nút); bơi dễ bắt nhịp hơn',
      '🕰️ Sống theo thời đại: chọn năm sinh 1945 → nay. Trải qua sơ tán tránh bom, ra trận, ngày thống nhất, tem phiếu, nuôi lợn trong nhà tắm, buôn chui, vượt biên, Đổi Mới, xe Cub, quán net, đi bão AFF 2008, smartphone, sốt đất, Covid, AI thay việc, robot giúp việc, taxi bay, du lịch sao Hỏa. Nghề nghiệp và mạng xã hội chỉ có khi đúng thời',
      '🏢 Tự làm chủ công ty (tab Tiền): 7 ngành từ quán cà phê đến startup AI; mỗi năm quyết định mở rộng, gọi vốn, niêm yết, bán; có thể khủng hoảng, phá sản; công ty truyền lại cho con',
      '🦹 Con đường giang hồ: được đại ca rủ, từ đàn em lên trùm; bảo kê, tranh địa bàn, đòi nợ, chở hàng cấm, đàn em phản bội, mẹ khóc khuyên hoàn lương. Bị bắt là vào tù',
      '⛓️ Nhà tù: thụ án theo năm, thăm nuôi, bạn tù, cải tạo giảm án, học nghề, đánh nhau, minigame 🌙 vượt ngục (đèn xanh – đèn đỏ), bị truy nã; ra tù có tiền án khó xin việc',
      '🎓 Học vấn sâu: đội tuyển học sinh giỏi quốc gia, Olympic quốc tế, săn học bổng du học, thạc sĩ, tiến sĩ, phong giáo sư (mỗi kỳ thi là một minigame)',
    ] },
    { v: '1.24', date: '16/10/2026', items: [
      '🏳️‍🌈 Sửa lỗi chọn dị tính nhưng vẫn có người yêu cùng giới (chuỗi “tin nhắn nửa đêm → bị phát hiện”)',
      '💞 Yêu ở mọi lứa tuổi: mẹ mai mối, tình công sở, phòng gym, chuyến xe Đà Lạt, bàn độc thân đám cưới, họp lớp, bố/mẹ đơn thân, bạn già ở CLB dưỡng sinh, được người yêu cầu hôn',
      '💎 Đào mỏ & đại gia: người đẹp kém chục tuổi bám đại gia (thử lòng bằng cách giả phá sản), lời đề nghị “bao nuôi”, bị đánh ghen, chọn tình hay tiền, lừa tình qua mạng',
      '🤫 Ngoại tình: có “người tình bí mật” trong danh sách quan hệ — hẹn hò lén, tặng quà, bỏ nhà theo người tình; mỗi năm tốn tiền, bào mòn hôn nhân, càng lâu càng dễ lộ: bị phát hiện, đánh ghen giữa phố, “em có bầu rồi”, bị tống tiền',
      '💍 Cầu hôn hiện rõ lý do khi chưa được (cần thân thiết ≥ 45%, đang có vợ/chồng)',
    ] },
    { v: '1.23', date: '15/10/2026', items: [
      '🎮 11 minigame mới: 🧤 bắt penalty, 🛵 lái xe né chướng ngại, 🏊 bơi giữ nhịp & thở, 🚓 rượt đuổi trộm, 💼 phỏng vấn, 🍜 bán hàng, 📈 lướt sóng cổ phiếu, 💘 tỏ tình, 🧧 mặc cả, 🫀 ép tim cấp cứu, 🃏 xì dách',
      '🥊 Thêm nhiều tình huống đánh nhau: bị chặn đường có dao, ẩu đả quán nhậu, bảo vệ người yêu, đàn anh bắt nạt, võ đài ngầm, trộm vào nhà, tranh chấp đất… mỗi kiểu đối thủ đánh một khác',
      '💼 Nộp đơn xin việc giờ phải qua phỏng vấn thật (nghề thể thao thì thi tuyển bằng môn đó); 💍 cầu hôn là màn tỏ tình; 🏠 mua nhà/xe được mặc cả giảm tới 15%',
      '📰 33 sự kiện mới: thi bằng lái, phóng xe về quê ăn Tết, đá phủi, cứu người đuối nước, bán hàng chợ Tết, xe bánh mì, cổ phiếu dậy sóng, chiếu bài mùng 2, ca trực cấp cứu…',
      '⚔️ Online: thách đấu minigame với đối thủ (cùng một đề), có thể đặt cược tiền — ai điểm cao hơn ăn hết',
    ] },
    { v: '1.22', date: '15/10/2026', items: [
      '🎮 Minigame kịch tính: lựa chọn có biểu tượng 🎮 sẽ cho bạn tự chơi để quyết định kết quả',
      '📝 Đi thi → làm bài kiểm tra (toán + kiến thức, có giờ); Thông minh cao được thêm thời gian và loại bớt đáp án sai',
      '⚽ Đá bóng → sút phạt đền (chốt hướng, độ cao, lực); 🏀 bóng rổ/bóng chuyền/cầu lông → canh thời điểm; 🏃 điền kinh/bơi → bấm ◀ ▶ chạy nước rút',
      '🥊 Đánh nhau → tự điều khiển đấm, đá, đỡ, né (←→ J K L Space hoặc nút trên màn hình); Sức khỏe cao đấm đau hơn, máu trâu hơn',
      '🎲 Không muốn chơi? Bấm “Để số phận quyết định” như cũ; tắt hẳn minigame trong ⚙️ Cài đặt',
    ] },
    { v: '1.21', date: '15/10/2026', items: [
      '🏠 Nhà cửa trong cảnh 3D đổi theo tài sản: phòng trọ → nhà bố mẹ → căn hộ → nhà phố (bể cá) → biệt thự (đèn chùm, piano) → penthouse view thành phố',
      '👴 Nhân vật già đi theo tuổi: nếp nhăn, chân chim, bọng mắt, đốm đồi mồi; tuổi dậy thì có mụn',
      '🧧 Mùa & lễ Tết: mỗi năm có Tết (lì xì thật), Trung thu, Giáng sinh; Hà Nội có sương mù mùa đông, Sài Gòn có mùa mưa',
      '📸 Album cuộc đời: tự chụp ảnh 3D ở các cột mốc lớn, xem lại và tải về khi nhân vật qua đời'
    ] },
    { v: '1.20', date: '15/10/2026', items: [
      '🪖 Nghĩa vụ quân sự: nam 18–27 tuổi nhận lệnh gọi, đi 2 năm (có sự kiện quân ngũ), sinh viên được tạm hoãn, trốn thì bị phạt',
      '🏛️ Nghề mới “Cán bộ chính quyền”: từ cán bộ phường lên Chủ tịch tỉnh, đối mặt phong bì, chạy chức, thanh tra, chống bão',
      '🏘️ Thị trường có chu kỳ: bình ổn → sốt → bong bóng vỡ → suy thoái; cổ phiếu thành danh mục giữ lâu dài; vay ngân hàng mua nhà (chậm trả bị siết nhà)',
      '🏊 Nghề mới: bơi lội, điền kinh, bóng chuyền (có lộ trình ngoại khóa), họa sĩ, nhạc công'
    ] },
    { v: '1.19', date: '15/10/2026', items: [
      '💍 Online: cầu hôn nhân vật của người chơi khác, cưới nhau thật trong game, ly hôn thì chia đôi tài sản',
      '🤝 Online: rủ nhau góp vốn làm ăn chung, cùng lãi hoặc cùng mất trắng',
      '🌐 Online: sự kiện chung cả phòng ở mỗi mốc 10 năm (bão, lũ, khủng hoảng, đại dịch, kinh tế bùng nổ, World Cup…)',
      '🎯 Thử thách hằng ngày: mỗi ngày một đề chung cho mọi người, có bảng xếp hạng riêng của ngày'
    ] },
    { v: '1.18', date: '15/10/2026', items: [
      '🎚️ Chọn độ khó khi tạo nhân vật: Dễ / Thường / Khó / Địa ngục (lương, bệnh tật, tai nạn, thi cử, tuổi thọ đều thay đổi)',
      '🏆 Bảng xếp hạng toàn server: điểm cao, sống thọ, giàu nhất · theo tuần và mọi thời đại',
      '📤 Chia sẻ cuộc đời: tạo ảnh “cáo phó” đẹp để đăng Facebook/Zalo',
      '📲 Cài game lên điện thoại như app, chơi offline không cần mạng'
    ] },
    { v: '1.17', date: '15/10/2026', items: [
      '🗂️ Tách riêng 2 phòng: chơi offline và trận online lưu ở 2 ô khác nhau. Vào offline giữa trận không còn làm mất nhân vật online',
      '⚔️ Nút “Tiếp tục trận online” ở màn hình chính và “Về trận” trên thanh online',
      '📬 Quà / khiêu khích nhận được lúc bạn đang chơi offline sẽ được cộng khi quay lại trận',
      '🔄 Lỡ tải lại trang hay đóng tab: mở lại game là tự vào lại phòng'
    ] },
    { v: '1.16', date: '15/10/2026', items: [
      '🌐 Sửa lỗi “Không tìm thấy phòng”: Solo online giờ chạy qua máy chủ riêng của game, vào được từ 4G và mọi loại wifi',
      '🔁 Rớt mạng giữa trận vẫn tự nối lại; phòng tự xoá sau 6 giờ'
    ] },
    { v: '1.15', date: '15/10/2026', items: [
      '🌐 Solo online: tạo phòng có mã, 2–6 người cùng sống một kiếp. Mỗi mốc 10 năm hiện bảng so sánh ai sống lâu hơn, giàu hơn',
      '💬 Chat & thả biểu cảm trong phòng · 🤝 tặng quà, chúc phúc, khiêu khích, đố vui đối thủ (mỗi năm một lần)',
      '📊 Bảng xếp hạng phòng trực tiếp + bảng chung cuộc + lịch sử thắng/thua trên máy',
      '📴 Chơi một mình vẫn chạy offline như cũ, chỉ kết nối mạng khi vào Solo online'
    ] },
    { v: '1.14', date: '15/10/2026', items: [
      '⚽ 18 sự kiện mới cho cầu thủ: trận ra mắt, bàn thắng đầu tiên, ngồi dự bị, CLB nợ lương / giải thể, CĐV sân khách quá khích, thẻ đỏ, trốn đi bar, doping trá hình, phí lót tay, quảng cáo, chung kết AFF Cup, SEA Games, băng đội trưởng, bão mạng, mẹ ốm trước trận, học bằng HLV, kèm đàn em',
      '📈 Các trận hay/dở giờ ảnh hưởng thật tới phong độ cầu thủ'
    ] },
    { v: '1.13', date: '15/10/2026', items: [
      '🎯 Thi tuyển thể thao khó hơn: bậc càng cao càng ít suất, trượt 2 lần ở một bậc là bị loại',
      '🎓 Thi đại học khó hơn: không còn đỗ 96% mọi ngành, ngành “hot” (Y, Dược) khó hẳn; thi lớp 10 cũng khó hơn',
      '⚽ Đã ký hợp đồng VĐV thì không bị bắt thi đại học nữa (vẫn có thể đăng ký học sau)',
      '🙂 Học/làm giỏi không còn bị trừ ngoại hình: chạm trần trí tuệ + ngoại hình thì chỉ ngừng tăng'
    ] },
    { v: '1.12', date: '15/10/2026', items: [
      '😊 Nhân vật đẹp hơn: mắt to có con ngươi & ánh sáng, mi, lông mày cong, miệng cười nhẹ, má hồng, mái tóc ôm trán, vai gọn, giày có đế',
      '💇 5 kiểu tóc mới: rẽ ngôi, undercut, hai bím, sóng dài, tém · 👕 4 kiểu áo mới: áo khoác, áo len, áo đấu có số, ba lỗ · 🎧 mũ tai nghe, mũ bucket',
      '⚽ Động tác & đạo cụ mới: tâng bóng, dẫn bóng rổ, vung vợt, đấm bốc, chơi game, đánh guitar',
      '🏋️ VĐV, nghệ sĩ, streamer, nông dân, shipper… có hành động nghề riêng (tập luyện, tìm nhà tài trợ, đòi tăng cát-xê…), không còn “tăng ca dự án, xin sếp tăng lương”'
    ] },
    { v: '1.11', date: '15/10/2026', items: [
      '🏅 Lộ trình ngoại khóa thể thao: đội trường → lò năng khiếu → đội trẻ → dự bị chuyên nghiệp → ký hợp đồng, có thi tuyển từng bậc (xem ở tab Học/Làm)',
      '🏀 Nghề mới: cầu thủ bóng rổ',
      '🛠️ Sửa lỗi: cầu thủ, VĐV, ca sĩ, streamer, chủ kinh doanh… không còn gặp chuyện công sở (sếp bắt sửa báo cáo, KPI, họp nửa đêm)',
      '🌍 Đội nước ngoài chiêu mộ: Premier League, NBA, EuroLeague, G2, Sentinels, LOUD, T1, UFC… thu nhập nhân nhiều lần, phong độ kém bị thanh lý về nước'
    ] },
    { v: '1.10', date: '15/10/2026', items: [
      '🧠 Sửa lỗi trí tuệ bị trừ khi làm gì cũng được cộng: giờ chỉ trí tuệ ↔ ngoại hình bù trừ nhau',
      '🔪 Nợ nhiều: xã hội đen tạt sơn, đánh hội đồng, truy lùng khi bỏ trốn, ép “chạy hàng” để xóa nợ',
      '🎰 Nổi tiếng: bị mời quảng cáo nhà cái, “thần dược”, tiền ảo lừa đảo, nhận là có ngày bị triệu tập'
    ] },
    { v: '1.9', date: '15/10/2026', items: [
      '🤰 Mang thai ngoài ý muốn: cưới chạy, nuôi con một mình, bị “bỏ rơi” hoặc bỏ rơi người khác, và nhiều năm sau gặp lại',
      '🍼 Nuôi con: đêm thức trắng, sữa ngoại hay nội, gửi nhà trẻ, con vào lớp Một, con bị bắt nạt',
      '⚡ Làm việc quá sức (tăng ca nhiều năm liền) làm tăng mạnh nguy cơ đột quỵ, đột tử',
      '🕯️ Thêm hơn 30 lý do qua đời, tùy tuổi, nghề nghiệp, lối sống và hoàn cảnh',
      '🎯 Sở thích định hướng nghề nghiệp giờ chỉ tăng chứ không tụt khi đi chơi'
    ] },
    { v: '1.8', date: '15/10/2026', items: [
      '💔 Ngoại tình: bị cám dỗ hoặc nghi ngờ vợ/chồng — bị phát hiện, tha thứ, ly hôn, mất nửa tài sản',
      '🛵 Làm thêm: 12 việc part-time (gia sư, phục vụ, chạy xe, PG, phụ hồ, dịch thuật…) mỗi việc có điều kiện riêng',
      '🐷 Trẻ con không còn cầm nhiều tiền: tiêu vặt ít đi, tiền nhiều thì “mẹ giữ hộ”, 18 tuổi trả lại một nửa',
    ] },    { v: '1.7', date: '15/10/2026', items: [
      '🔥 MXH có biến: bị bóc phốt, drama với KOL khác, đại chiến fan, bị hack, fan cuồng',
      '🇬🇧 Chỉ số tiếng Anh: cần cho du lịch nước ngoài, du học, đi làm ở nước ngoài (lương gấp đôi, xa nhà)',
      '🌏 Vận động viên thi đấu nước ngoài: họp báo tiếng Anh, nghi án doping, bị khán giả chủ nhà la ó',
      '🏳️‍🌈 Xu hướng tính dục: dị tính, đồng tính, song tính — tự nhận ra, công khai với bố mẹ, nhận con nuôi',
      '🍀 Sống có đức thì may mắn hơn một chút',
    ] },    { v: '1.6', date: '14/10/2026', items: [
      '😤 Game khó hơn: lương thấp hơn, thăng chức chậm, phải trả tiền thuê nhà, kinh doanh có năm lỗ, có năm phá sản',
      '⚖️ Không ai hoàn hảo: trí tuệ + ngoại hình tối đa 150, tổng 4 chỉ số tối đa 320 — tăng cái này thì cái kia tụt',
      '📏 Kiểu cha mẹ: áp đặt, dân chủ, nuông chiều, thờ ơ. Bố mẹ áp đặt chọn ngành thay bạn — trượt hay cãi lời có thể bị từ mặt',
      '📱 Tab MXH: đăng ảnh, bắt trend, livestream, nhận quảng cáo (cẩn thận hàng bẩn), trả lời bình luận, dính phốt',
    ] },    { v: '1.5', date: '14/10/2026', items: [
      '🎈 Hoạt động “Đi chơi” cho trẻ: gõ tự do trò muốn chơi, trợ lý hướng nghiệp đoán sở thích → 14 tuổi được tư vấn hướng nghiệp, có cả trường nghề',
      '🏟️ Bối cảnh 3D mới: sân bóng, nhà thi đấu, võ đài, sân bay, sàn diễn; ánh sáng đẹp hơn, sàn nhà hiện đúng màu',
      '🏅 Vận động viên không còn “lương”: tự túc, trợ cấp, sống bằng tiền thưởng giải đấu và tài trợ',
      '📊 Tai nạn, cướp giật, đột quỵ, ung thư… xảy ra theo xác suất thực ở Việt Nam — xem trong Nhật ký',
    ] },    { v: '1.4', date: '14/10/2026', items: [
      '⚽ 11 nghề mới: võ sĩ, cầu lông, eSports, diễn viên, người mẫu, phi công, lính cứu hỏa… Mỗi nghề ghi rõ biến cố có thể gặp',
      '🩺 Bệnh bỏ mặc sẽ chuyển nặng: ung thư, suy thận, suy tim… có bệnh không chữa được. Khám định kỳ để phát hiện sớm',
      '🏠 Tài sản có giá trị thật: hạnh phúc mỗi năm, đẳng cấp, cho thuê lấy tiền, mở hoạt động mới',
      '🔄 Game tự báo khi có bản mới để bạn tải lại trang',
    ] },
    { v: '1.3', date: '14/10/2026', items: [
      '📖 Gần 200 tình huống ngoại truyện nhiều chương',
      '🎓 16 ngành đại học · 🎁 tự chọn quà · 💰 mức sống và thuế',
      '🎯 Mục tiêu kiếp này và điểm Phúc đức',
      '💾 3 ô lưu và mã lưu chơi trên máy khác',
    ] },
  ];

  KN.DATA = {
    TR, TY, fmtMoney, fmtShort, randomName, CITIES, cityName, SKIN_TONES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, BOTTOM_COLORS, TOP_STYLES,
    randomAppearance, STAGES, stageOf, MAJORS, CAREERS, SHOP, ACT_CATS, ACTIVITIES, TRAVEL, ILLNESSES, CANCERS, CANCER_STAGE, ROLE_LABELS, INTERACTIONS, ROLE_ACTIONS,
    INDUSTRIES, FURN_SLOTS, FURNITURE, PET_SPECIES, CHILD_TRAITS, SKINS, ACHIEVEMENTS, GOALS, FIRST, MID, LAST, GIFTS, LIFESTYLES, PERKS, SPECIAL_HAIR, PRESTIGE_RANKS, CHANGELOG, INTERESTS, SPORT_KW, YOUTH_SPORT, FOREIGN_CLUBS, DIFFICULTY, VOC_TRADES, HAZARDS, PARENTING, PARENT_MAJORS, PARTTIME,
  };
})();
