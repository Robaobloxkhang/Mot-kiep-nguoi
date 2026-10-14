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
  const HAIR_STYLES = [{ id: 'short', label: 'Ngắn' }, { id: 'long', label: 'Dài' }, { id: 'bob', label: 'Bob' }, { id: 'ponytail', label: 'Đuôi ngựa' }, { id: 'bun', label: 'Búi' }, { id: 'spiky', label: 'Dựng' }, { id: 'curly', label: 'Xoăn' }, { id: 'buzz', label: 'Húi cua' }, { id: 'bald', label: 'Trọc' }];
  const OUTFIT_COLORS = ['#d94f4f', '#e8833a', '#f2c14e', '#39a96b', '#2f9e9e', '#2d6cdf', '#5b5fc7', '#9b59b6', '#e46aa0', '#f5f1e8', '#3a3f4b', '#8a6a4f'];
  const BOTTOM_COLORS = ['#2f3b52', '#1f2d55', '#3a3f4b', '#5b4636', '#d8cdb8', '#4a5a3a', '#22252b', '#f2f2f0'];
  const TOP_STYLES = [{ id: 'tshirt', label: 'Áo phông' }, { id: 'shirt', label: 'Sơ mi' }, { id: 'polo', label: 'Polo' }, { id: 'hoodie', label: 'Hoodie' }, { id: 'dress', label: 'Váy' }, { id: 'aodai', label: 'Áo dài' }, { id: 'suit', label: 'Vest' }];

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
    let topStyle = age < 2 ? 'tshirt' : U.weighted(f ? [['tshirt', 4], ['shirt', 2], ['dress', 2], ['polo', 1], ['hoodie', 1]] : [['tshirt', 4], ['shirt', 3], ['polo', 2], ['hoodie', 1]], (x) => x[1])[0];
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
    const hairStyle = age < 2 ? 'short' : f
      ? U.weighted([['long', 5], ['ponytail', 3], ['bob', 2], ['bun', age > 40 ? 4 : 1], ['curly', 1]], (x) => x[1])[0]
      : U.weighted([['short', 6], ['spiky', age < 30 ? 2 : 0.3], ['buzz', 2], ['curly', 0.5], ['bald', age > 50 ? 2 : 0.05]], (x) => x[1])[0];
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
    casi: { title: 'Ca sĩ', icon: '🎤', minAge: 16, req: { minStat: { looks: 65 } }, levels: [['Ca sĩ phòng trà', 6], ['Ca sĩ trẻ', 20], ['Ca sĩ nổi tiếng', 80], ['Diva', 250]], loc: 'karaoke', style: 'suit', fame: true },
    streamer: { title: 'Nhà sáng tạo nội dung', icon: '📱', minAge: 16, levels: [['Streamer tập sự', 3], ['Streamer', 12], ['KOL', 45], ['Siêu sao mạng', 150]], loc: 'bedroom', style: 'hoodie', fame: true },
    cauthu: { title: 'Cầu thủ bóng đá', icon: '⚽', minAge: 17, maxStart: 26, req: { minStat: { health: 75 } }, levels: [['Cầu thủ trẻ', 8], ['Cầu thủ chuyên nghiệp', 40], ['Tuyển thủ quốc gia', 120]], loc: 'park', style: 'tshirt', fame: true },
    kinhdoanh: { title: 'Chủ kinh doanh', icon: '🏪', minAge: 20, req: { minMoney: 200 * TR }, levels: [['Chủ quán nhỏ', 12], ['Chủ chuỗi cửa hàng', 40], ['Giám đốc công ty', 120], ['Chủ tịch tập đoàn', 400]], loc: 'cafe', style: 'shirt' },
    congchuc: { title: 'Công chức', icon: '🏛️', minAge: 22, req: { degree: true, minStat: { smarts: 55 } }, levels: [['Chuyên viên', 8], ['Chuyên viên chính', 12], ['Phó phòng', 17], ['Trưởng phòng', 24]], loc: 'office', style: 'shirt' },
    phiendich: { title: 'Biên phiên dịch', icon: '🗣️', minAge: 22, req: { major: ['ngoaingu'] }, levels: [['Phiên dịch viên', 11], ['Phiên dịch cao cấp', 22], ['Trưởng nhóm dịch thuật', 36]], loc: 'office', style: 'shirt' },
    nganhang: { title: 'Nhân viên ngân hàng', icon: '🏦', minAge: 22, req: { major: ['taichinh', 'kinhte'] }, levels: [['Giao dịch viên', 10], ['Chuyên viên tín dụng', 18], ['Trưởng phòng', 36], ['Giám đốc chi nhánh', 75]], loc: 'office', style: 'suit' },
    kientrucsu: { title: 'Kiến trúc sư', icon: '📐', minAge: 23, req: { major: ['kientruc'] }, levels: [['KTS tập sự', 9], ['Kiến trúc sư', 20], ['KTS chủ trì', 38], ['Giám đốc thiết kế', 70]], loc: 'office', style: 'shirt' },
    duocsi: { title: 'Dược sĩ', icon: '💊', minAge: 23, req: { major: ['duoc'] }, levels: [['Dược sĩ', 10], ['Dược sĩ chính', 17], ['Chủ chuỗi nhà thuốc', 45]], loc: 'hospital', style: 'coat' },
    dieuduong: { title: 'Điều dưỡng', icon: '🩹', minAge: 22, req: { major: ['dieuduong', 'yduoc'] }, levels: [['Điều dưỡng viên', 8], ['Điều dưỡng chính', 12], ['Điều dưỡng trưởng', 18]], loc: 'hospital', style: 'coat' },
    huongdanvien: { title: 'Hướng dẫn viên du lịch', icon: '🧳', minAge: 21, req: { major: ['dulich', 'ngoaingu'] }, levels: [['Hướng dẫn viên', 9], ['HDV quốc tế', 18], ['Giám đốc lữ hành', 42]], loc: 'beach', style: 'polo' },
    canhsat: { title: 'Cảnh sát', icon: '👮', minAge: 22, req: { major: ['anninh'], minStat: { health: 55 } }, levels: [['Chiến sĩ', 9], ['Trung úy', 14], ['Đại úy', 20], ['Trưởng công an phường', 28], ['Đại tá', 40]], loc: 'street', style: 'uniform' },
    kysunn: { title: 'Kỹ sư nông nghiệp', icon: '🌾', minAge: 22, req: { major: ['nongnghiep'] }, levels: [['Kỹ sư', 8], ['Kỹ sư chính', 14], ['Chủ trang trại', 45]], loc: 'countryside', style: 'polo' },
  };
  Object.keys(CAREERS).forEach((id) => { const c = CAREERS[id]; c.id = id; c.levels = c.levels.map(([t, s]) => ({ title: t, salary: s * TR })); });

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
    { id: 'cartoon', label: 'Xem hoạt hình', icon: '📺', cat: 'fun', minAge: 2, maxAge: 11, cost: 0, limit: 3, eff: { happy: [4, 7] }, scene: { loc: 'home', anim: 'laugh' }, texts: ['Bạn xem hoạt hình say mê đến quên cả ăn cơm.', 'Tập phim hôm nay hay quá, bạn kể lại cho cả nhà nghe ba lần.'] },
    { id: 'playfriends', label: 'Chơi với bạn bè', icon: '⚽', cat: 'fun', minAge: 4, maxAge: 14, cost: 0, limit: 3, eff: { happy: [3, 6], health: [1, 2] }, scene: { loc: 'park', anim: 'run', npcs: [{ role: 'kid', anim: 'run' }, { role: 'kid', anim: 'laugh' }] }, texts: ['Cả bọn chơi trốn tìm đến tối mịt mới chịu về.', 'Bạn đá bóng dép với lũ trẻ trong xóm. Thắng 3–2!', 'Nhảy dây, ô ăn quan, đánh chuyền… một buổi chiều không biết chán.'] },
    { id: 'cafe', label: 'Đi cà phê', icon: '☕', cat: 'fun', minAge: 15, cost: 60000, limit: 3, eff: { happy: [2, 4] }, scene: { loc: 'cafe', anim: 'drink' }, texts: ['Một ly cà phê sữa đá và một góc nhìn ra phố. Đủ để thấy đời đáng sống.', 'Bạn ngồi quán cả buổi chiều, nghe nhạc Trịnh, ngắm mưa.'] },
    { id: 'karaoke', label: 'Hát karaoke', icon: '🎤', cat: 'fun', minAge: 14, cost: 400000, limit: 2, eff: { happy: [4, 8] }, scene: { loc: 'karaoke', anim: 'sing', fx: 'music', time: 'night' }, texts: ['Bạn chiếm mic cả tối, hát hết các bản ballad buồn nhất có thể.', 'Máy chấm 98 điểm! Bạn tin mình có thể đi thi hát.', 'Cả nhóm gào thét bài hit mới nhất đến khản cả cổ.'] },
    { id: 'travel', label: 'Đi du lịch', icon: '✈️', cat: 'fun', minAge: 18, cost: 0, limit: 1, special: 'travel', eff: { happy: [6, 12], health: [0, 2] } },
    { id: 'beach', label: 'Đi biển', icon: '🏖️', cat: 'fun', minAge: 4, cost: 2000000, limit: 1, eff: { happy: [5, 8], health: [1, 2] }, scene: { loc: 'beach', anim: 'swim', fx: 'bubbles' }, texts: ['Bạn tắm biển đến khi da đỏ au, tối về ăn hải sản no nê.', 'Nằm trên bãi cát nghe sóng vỗ, bạn ngủ quên lúc nào không hay.'] },
    { id: 'dating', label: 'Hẹn hò qua app', icon: '💘', cat: 'love', minAge: 18, cost: 300000, limit: 2, special: 'dating' },
    { id: 'lottery', label: 'Mua vé số', icon: '🎟️', cat: 'money', minAge: 18, cost: 10000, limit: 3, special: 'lottery' },
    { id: 'sidejob', label: 'Làm thêm', icon: '🛵', cat: 'money', minAge: 15, cost: 0, limit: 2, special: 'sidejob', eff: { happy: [-1, 1], health: [-1, 0] }, scene: { loc: 'street', anim: 'drive' } },
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
    { id: 'taichi', label: 'Tập dưỡng sinh', icon: '🧓', cat: 'body', minAge: 50, cost: 0, limit: 2, eff: { health: [2, 4], happy: [1, 3] }, scene: { loc: 'park', anim: 'dance', time: 'dawn', npcs: [{ role: 'neighbor', anim: 'dance' }, { role: 'neighbor', anim: 'dance' }] }, texts: ['Năm giờ sáng, bạn cùng hội người cao tuổi tập dưỡng sinh bên hồ.', 'Vươn vai, hít thở, vỗ tay. Xương khớp kêu răng rắc nhưng thấy khỏe hẳn.'] },
  ];

  const TRAVEL = [
    { name: 'Đà Lạt', cost: 5 * TR, loc: 'park', time: 'dawn', weather: 'fog', fx: 'petals', abroad: false },
    { name: 'Phú Quốc', cost: 9 * TR, loc: 'beach', fx: 'sparkle', abroad: false },
    { name: 'Sa Pa', cost: 7 * TR, loc: 'countryside', weather: 'fog', fx: 'sparkle', abroad: false },
    { name: 'Hội An', cost: 6 * TR, loc: 'street', time: 'night', decor: 'midautumn', fx: 'sparkle', abroad: false },
    { name: 'Hạ Long', cost: 6 * TR, loc: 'beach', fx: 'sparkle', abroad: false },
    { name: 'Thái Lan', cost: 15 * TR, loc: 'temple', fx: 'sparkle', abroad: true },
    { name: 'Hàn Quốc', cost: 30 * TR, loc: 'street', time: 'night', weather: 'snow', fx: 'sparkle', abroad: true },
    { name: 'Nhật Bản', cost: 38 * TR, loc: 'temple', fx: 'petals', abroad: true },
    { name: 'Pháp', cost: 80 * TR, loc: 'park', time: 'dusk', fx: 'sparkle', abroad: true },
    { name: 'Mỹ', cost: 120 * TR, loc: 'street', time: 'night', fx: 'sparkle', abroad: true },
    { name: 'Châu Âu 10 nước', cost: 160 * TR, loc: 'park', time: 'day', fx: 'petals', abroad: true },
    { name: 'Maldives', cost: 220 * TR, loc: 'beach', time: 'dusk', fx: 'sparkle', abroad: true },
  ];

  const ILLNESSES = [
    { id: 'cam', name: 'Cảm cúm', drain: 4, chronic: false, cure: 0.95, cost: 300000 },
    { id: 'sotxh', name: 'Sốt xuất huyết', drain: 12, chronic: false, cure: 0.85, cost: 3 * TR },
    { id: 'daday', name: 'Đau dạ dày', drain: 5, chronic: false, cure: 0.8, cost: 1.5 * TR },
    { id: 'gaixuong', name: 'Gai cột sống', drain: 4, chronic: true, cure: 0.3, cost: 2 * TR, minAge: 40 },
    { id: 'huyetap', name: 'Cao huyết áp', drain: 5, chronic: true, cure: 0.2, cost: 1 * TR, minAge: 45 },
    { id: 'tieuduong', name: 'Tiểu đường', drain: 6, chronic: true, cure: 0.15, cost: 2 * TR, minAge: 45 },
    { id: 'tim', name: 'Bệnh tim', drain: 9, chronic: true, cure: 0.35, cost: 25 * TR, minAge: 50 },
    { id: 'ungthu', name: 'Ung thư', drain: 16, chronic: false, cure: 0.45, cost: 120 * TR, minAge: 40, serious: true },
    { id: 'chanthuong', name: 'Chấn thương cơ', drain: 4, chronic: false, cure: 0.95, cost: 1 * TR },
  ];

  const ROLE_LABELS = { mother: 'Mẹ', father: 'Bố', sibling: 'Anh chị em', grandparent: 'Ông bà', friend: 'Bạn bè', partner: 'Người yêu', spouse: 'Bạn đời', child: 'Con', grandchild: 'Cháu', pet: 'Thú cưng', ex: 'Người yêu cũ' };
  const INTERACTIONS = {
    talk: { label: 'Trò chuyện', icon: '💬' }, hug: { label: 'Ôm', icon: '🤗' }, meal: { label: 'Ăn cơm cùng', icon: '🍚' }, gift: { label: 'Tặng quà', icon: '🎁' },
    ask_money: { label: 'Xin tiền', icon: '🧧' }, argue: { label: 'Cãi nhau', icon: '💢' }, hangout: { label: 'Đi chơi', icon: '🎉' }, borrow: { label: 'Vay tiền', icon: '💸' },
    date: { label: 'Hẹn hò', icon: '🌹' }, love: { label: 'Âu yếm', icon: '💞' }, propose: { label: 'Cầu hôn', icon: '💍' }, breakup: { label: 'Chia tay', icon: '💔' },
    baby: { label: 'Sinh em bé', icon: '👶' }, divorce: { label: 'Ly hôn', icon: '📄' }, play: { label: 'Chơi cùng', icon: '🪁' }, teach: { label: 'Dạy học', icon: '✏️' },
    walk: { label: 'Dắt đi dạo', icon: '🦮' }, feed: { label: 'Cho ăn', icon: '🦴' }, care: { label: 'Chăm sóc', icon: '🫶' },
  };
  const ROLE_ACTIONS = {
    mother: ['talk', 'hug', 'meal', 'gift', 'ask_money', 'argue'], father: ['talk', 'hug', 'meal', 'gift', 'ask_money', 'argue'],
    grandparent: ['talk', 'hug', 'meal', 'gift', 'care'], sibling: ['talk', 'hangout', 'gift', 'argue', 'borrow'],
    friend: ['talk', 'hangout', 'gift', 'argue', 'borrow'], partner: ['date', 'gift', 'love', 'propose', 'breakup'],
    spouse: ['date', 'gift', 'love', 'baby', 'argue', 'divorce'], child: ['play', 'teach', 'gift', 'hug', 'argue'],
    grandchild: ['play', 'gift', 'hug', 'teach'], pet: ['play', 'walk', 'feed'], ex: ['talk'],
  };

  const ACHIEVEMENTS = [
    ['first_word', 'Tiếng nói đầu đời', '🗣️', 'Nói được từ đầu tiên.'],
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

  KN.DATA = {
    TR, TY, fmtMoney, fmtShort, randomName, CITIES, cityName, SKIN_TONES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, BOTTOM_COLORS, TOP_STYLES,
    randomAppearance, STAGES, stageOf, MAJORS, CAREERS, SHOP, ACT_CATS, ACTIVITIES, TRAVEL, ILLNESSES, ROLE_LABELS, INTERACTIONS, ROLE_ACTIONS,
    ACHIEVEMENTS, GOALS, FIRST, MID, LAST, GIFTS, LIFESTYLES, PERKS, SPECIAL_HAIR,
  };
})();
