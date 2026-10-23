/* Một Kiếp Người — PHÒNG HLV (KN.Manager): làm huấn luyện viên kiểu game quản lý bóng đá.
   Đội hình 22 cầu thủ (chỉ số, tuổi, giá trị, tinh thần) · sơ đồ + lối chơi + pressing · chuyển nhượng mua/bán/trả giá
   · V-League 10 đội đá 2 lượt (18 vòng), xem trận trực tiếp có bình luận, nghỉ giữa hiệp được đổi chiến thuật
   · ban lãnh đạo đặt mục tiêu, cuối năm tổng kết mùa (thưởng, phong độ, bị sa thải / được thăng chức).
   Lên HLV đội tuyển quốc gia thì đá AFF Cup và TRIỆU TẬP cầu thủ thay vì mua. Dữ liệu nằm trong đời sống (S.mgr) nên được lưu cùng save. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const U = KN.util, D = () => KN.DATA, G = () => KN.Game;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const money = (v) => (D() && D().fmtMoney ? D().fmtMoney(v) : Math.round(v) + 'đ');
  const R = (a, b) => a + Math.random() * (b - a), RI = (a, b) => Math.floor(R(a, b + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)];

  const CLUBS = ['Thủ Đô FC', 'Sông Hàn FC', 'Phố Núi FC', 'Cảng Biển FC', 'Sài Gòn Xanh', 'Xứ Nghệ FC', 'Thành Nam FC', 'Đất Võ FC', 'Miền Tây United', 'Hoa Ban FC', 'Núi Ngự FC', 'Biển Xanh FC'];
  // mỗi CLB thuộc một tầng: tầng càng cao thì quỹ chuyển nhượng, doanh thu và kỳ vọng càng lớn, đối thủ cũng mạnh hơn
  const CLUB_TIER = { 'Thủ Đô FC': 3, 'Sông Hàn FC': 3, 'Sài Gòn Xanh': 3, 'Phố Núi FC': 2, 'Cảng Biển FC': 2, 'Xứ Nghệ FC': 2, 'Thành Nam FC': 2, 'Đất Võ FC': 2, 'Miền Tây United': 1, 'Hoa Ban FC': 1, 'Núi Ngự FC': 1, 'Biển Xanh FC': 1 };
  const TIERS = { 1: { name: 'CLB nhỏ', budget: 6e9, rev: 4.5e9, str: 54, hint: 'Quỹ ít, kỳ vọng thấp: giữ trụ hạng là thành công' }, 2: { name: 'CLB tầm trung', budget: 16e9, rev: 10e9, str: 60, hint: 'Cần vào top 4, áp lực vừa phải' }, 3: { name: 'CLB lớn', budget: 38e9, rev: 22e9, str: 67, hint: 'Quỹ lớn nhưng chỉ chấp nhận vô địch; thua vài trận là bị réo tên' } };
  const DIFF = [['Dễ', 0], ['Thường', 2], ['Khó', 6]];
  const TRAIN = { tact: ['Chiến thuật', 'Cả đội phối hợp ăn ý hơn: +1 tấn công và phòng ngự'], tech: ['Kỹ thuật', 'Cầu thủ trẻ có cơ hội tăng chỉ số sau mỗi trận'], fit: ['Thể lực', 'Giảm gần một nửa nguy cơ chấn thương'], rest: ['Hồi phục', 'Tinh thần cả đội tăng, người chấn thương mau lành'] };
  const tierOf = (m) => (m.national ? 4 : m.tier || CLUB_TIER[m.club] || Math.min(3, (m.level || 0) + 1));
  const dAdd = (m) => DIFF[m.diff == null ? 1 : m.diff][1];
  const NATIONS = ['Việt Nam', 'Thái Lan', 'Indonesia', 'Malaysia', 'Philippines', 'Singapore', 'Myanmar', 'Campuchia'];
  const FOREIGN = ['Rafaelson', 'Gustavo', 'Lucão', 'Diogo', 'Pedro Paulo', 'Kim Min-ho', 'Oseni', 'Samson', 'Alexandre', 'Jhon Cley', 'Hoàng Vũ Samson', 'Geovane'];
  const POS = ['GK', 'DF', 'MF', 'FW'], POS_VN = { GK: 'Thủ môn', DF: 'Hậu vệ', MF: 'Tiền vệ', FW: 'Tiền đạo' }, POS_IC = { GK: '🧤', DF: '🛡️', MF: '⚙️', FW: '⚡' };
  // đá 4 người (giống Haxball): số hậu vệ – tiền vệ – tiền đạo; thủ môn không ra sân (ai lùi sâu nhất sẽ bắt bóng)
  const FORMS = {
    '1-2-1': { n: [0, 1, 2, 1], att: 0, def: 0, desc: 'Kim cương: cân bằng, dễ chơi' },
    '2-1-1': { n: [0, 2, 1, 1], att: -2, def: 3, desc: 'Hai trung vệ chắc chắn, phản công' },
    '1-1-2': { n: [0, 1, 1, 2], att: 3, def: -2, desc: 'Hai tiền đạo, ép sân đối phương' },
    '2-2': { n: [0, 2, 0, 2], att: 1, def: 1, desc: 'Hai tầng rõ ràng: thủ chắc, công nhanh' },
    '1-3': { n: [0, 1, 3, 0], att: 1, def: 0, desc: 'Không tiền đạo cắm, tiki-taka luân chuyển' },
  };
  const ROLE = { GK: 'def', DF: 'def', MF: null, FW: 'att' };
  const STYLES = {
    balanced: { name: '⚖️ Cân bằng', att: 0, def: 0 },
    possession: { name: '🎯 Kiểm soát bóng (tiki-taka)', att: 2, def: 1 },
    press: { name: '🔥 Gegenpressing', att: 3, def: -1, tire: 1 },
    counter: { name: '⚡ Phòng ngự phản công', att: -1, def: 3 },
    park: { name: '🚌 Dựng xe buýt', att: -6, def: 6 },
  };
  // khắc chế: lối chơi bên trái thắng lối chơi bên phải (+4 sức mạnh)
  const BEATS = { press: 'possession', possession: 'park', park: 'counter', counter: 'press' };

  // ------------------------------------------------------------------ tạo cầu thủ / đội
  let uid = 0;
  const pid = () => 'p' + Date.now().toString(36) + (uid++).toString(36);
  function vnName() { const n = D().randomName('m'); return n.lastName + ' ' + n.middleName + ' ' + n.firstName; }
  function valueOf(p) { const age = p.age <= 23 ? 1.4 : p.age <= 28 ? 1.15 : p.age <= 31 ? 0.8 : 0.45; return Math.round(Math.pow(Math.max(30, p.ovr) - 30, 2.25) * 4.8e5 * age / 1e7) * 1e7; }
  function makePlayer(pos, ovr, age, foreign) {
    const p = { id: pid(), name: foreign ? pick(FOREIGN) : vnName(), pos, ovr: Math.round(U.clamp(ovr, 35, 92)), age, pot: Math.round(U.clamp(ovr + (age < 23 ? R(3, 16) : age < 27 ? R(0, 5) : 0), 35, 94)), morale: RI(60, 80), goals: 0, apps: 0, foreign: !!foreign };
    p.val = Math.max(1.5e8, valueOf(p)); return p;
  }
  function makeSquad(tier) {
    const base = 50 + tier * 3, out = [], per = { DF: 4, MF: 5, FW: 3 };
    Object.keys(per).forEach((pos) => { for (let i = 0; i < per[pos]; i++) out.push(makePlayer(pos, base + R(-8, 9) - (i > 3 ? 3 : 0), RI(18, 33), pos === 'FW' && i === 0 && Math.random() < 0.7)); });
    return out;
  }
  function nationalPool(year) {
    // cầu thủ Việt Nam giỏi nhất hiện tại để triệu tập
    const out = []; ['DF', 'MF', 'FW'].forEach((pos) => { for (let i = 0; i < 8; i++) out.push(makePlayer(pos, 62 + R(-6, 14), RI(19, 32))); });
    return out.sort((a, b) => b.ovr - a.ovr);
  }
  function makeTeams(m) {
    const names = m.national ? NATIONS.filter((n) => n !== 'Việt Nam') : U.shuffle(CLUBS.filter((c) => c !== m.club)).slice(0, 9);
    const strong = { 'Thái Lan': 76, Indonesia: 70, Malaysia: 67, Philippines: 60, Singapore: 58, Myanmar: 55, Campuchia: 50 };
    const creep = Math.min(8, Math.max(0, (m.season || 0) - (m.first || m.season || 0)) * 0.8); // đối thủ mạnh dần theo năm
    return names.map((n) => ({ name: n, tier: m.national ? 0 : CLUB_TIER[n] || 2, str: m.national ? strong[n] + R(-3, 3) + dAdd(m) : TIERS[CLUB_TIER[n] || 2].str + R(-5, 6) + dAdd(m) + creep, style: pick(Object.keys(STYLES)) }));
  }
  function fixturesFor(n, double) {
    // vòng tròn (thuật toán xếp lịch Berger); đội 0 là đội mình
    const ids = Array.from({ length: n }, (_, i) => i), rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const pairs = []; for (let i = 0; i < n / 2; i++) { const a = ids[i], b = ids[n - 1 - i]; pairs.push(r % 2 ? [b, a] : [a, b]); }
      rounds.push(pairs); ids.splice(1, 0, ids.pop());
    }
    return double ? rounds.concat(rounds.map((rd) => rd.map(([a, b]) => [b, a]))) : rounds;
  }
  function newSeason(m, year) {
    m.season = year; m.round = 0; m.teams = makeTeams(m);
    const all = [m.club].concat(m.teams.map((t) => t.name));
    m.table = all.map((name) => ({ name, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
    m.fixtures = fixturesFor(all.length, !m.national); m.log = []; m.results = []; m.news = []; m.lastMatch = null; m.done = false;
    const mine = squadStr(m), stronger = m.teams.filter((t) => t.str > mine).length; // kỳ vọng của ban lãnh đạo tuỳ vị thế CLB và sức mạnh đội so với các đối thủ
    m.goal = m.national ? (m.level >= 2 ? 'title' : 'top4') : tierOf(m) === 3 ? (stronger <= 1 ? 'title' : 'top4') : stronger <= 1 ? 'top4' : stronger <= 4 ? 'mid' : 'avoid';
    m.streak = 0;
    m.market = marketList(m); m.window = true;
    m.squad.forEach((p) => { p.goals = 0; p.apps = 0; });
  }
  function marketList(m) {
    if (m.national) return nationalPool(m.season).slice(0, 18);
    const lv = 52 + tierOf(m) * 5, out = [];
    for (let i = 0; i < 12; i++) out.push(makePlayer(pick(['DF', 'DF', 'MF', 'MF', 'FW', 'FW']), lv + R(-10, 16), RI(17, 34), Math.random() < 0.25));
    return out.sort((a, b) => b.ovr - a.ovr);
  }
  function init(info) {
    const level = Math.min(2, info.level || 0), national = level >= 2;
    const club = national ? 'Đội tuyển Việt Nam' : info.club || pick(CLUBS.filter((c) => (CLUB_TIER[c] || 2) <= (level === 0 ? 1 : 2)));
    const tier = national ? 4 : CLUB_TIER[club] || 2;
    const m = { v: 2, club, tier, national, level, board: 60, budget: national ? 0 : TIERS[tier].budget, squad: national ? nationalPool().slice(0, 12) : makeSquad(tier), tactic: { form: '1-2-1', style: 'balanced', press: 50 }, history: [], trophies: 0, rep: 8 + level * 14, pick: !national, diff: info.diff == null ? 1 : info.diff, train: 'tact', first: info.year, joined: info.year, career: [], results: [], news: [] };
    m.squadStr = squadStr(m); newSeason(m, info.year); return m;
  }

  // ------------------------------------------------------------------ đội hình & sức mạnh
  function lineup(m) {
    if (!FORMS[m.tactic.form]) m.tactic.form = '1-2-1'; // save cũ (đội hình 11 người)
    const f = FORMS[m.tactic.form], xi = [], score = (a) => (a.lock === 'start' ? 1000 : 0) + a.ovr + a.morale / 10;
    const free = m.squad.filter((p) => !p.inj && p.lock !== 'bench');
    POS.forEach((pos, i) => { const list = free.filter((p) => (p.pos === pos || (pos === 'DF' && p.pos === 'GK')) && !xi.includes(p)).sort((a, b) => score(b) - score(a)); xi.push(...list.slice(0, f.n[i])); });
    // thiếu người đúng vị trí thì lấy người tốt nhất còn lại
    free.filter((p) => !xi.includes(p)).sort((a, b) => score(b) - score(a)).forEach((p) => { if (xi.length < 4) xi.push(p); });
    const auto = xi.slice(0, 4);
    // đội hình do bạn kéo thả: giữ đúng vị trí đã đặt; ai chấn thương / bị cho dự bị thì máy chọn người thay
    if (m.xi && m.xi.length) {
      const ov = m.xi.map((id) => { const p = m.squad.find((x) => x.id === id); return p && !p.inj && p.lock !== 'bench' ? p : null; });
      const pool = auto.filter((p) => !ov.includes(p)).concat(free.filter((p) => !auto.includes(p) && !ov.includes(p)).sort((a, b) => score(b) - score(a)));
      const out = ov.map((p) => p || pool.shift()).filter(Boolean);
      if (out.length) return out.slice(0, 4);
    }
    return auto;
  }
  const avg = (a) => (a.length ? a.reduce((s, p) => s + p.ovr * (0.9 + p.morale / 500), 0) / a.length : 40);
  function squadStr(m) { const xi = lineup(m); return Math.round(avg(xi)); }
  function power(m) {
    const xi = lineup(m), by = (pos) => xi.filter((p) => p.pos === pos), f = FORMS[m.tactic.form], st = STYLES[m.tactic.style];
    const miss = 4 - xi.length; // thiếu người (chấn thương)
    const all4 = avg(xi), att = (by('FW').length ? avg(by('FW')) : all4) * 0.5 + (by('MF').length ? avg(by('MF')) : all4) * 0.35 + all4 * 0.15 + f.att + st.att + (m.tactic.press - 50) / 12 - miss * 4 + (m.train === 'tact' ? 1 : 0);
    const def = (by('DF').concat(by('GK')).length ? avg(by('DF').concat(by('GK'))) : all4) * 0.6 + all4 * 0.4 + f.def + st.def - (m.tactic.press - 50) / 20 - miss * 4 + (m.train === 'tact' ? 1 : 0);
    return { att, def, xi };
  }
  const teamPow = (t) => ({ att: t.str + (STYLES[t.style].att) + R(-2, 2), def: t.str + STYLES[t.style].def + R(-2, 2) });
  function poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  function lam(att, def, home, edge) { return U.clamp(1.25 + (att - def) / 11 + (home ? 0.22 : 0) + edge * 0.06, 0.15, 4.2); }

  // trận giữa hai đội máy
  function simAI(m, a, b) {
    const ta = m.teams[a - 1], tb = m.teams[b - 1], pa = teamPow(ta), pb = teamPow(tb);
    return [poisson(lam(pa.att, pb.def, true, 0)), poisson(lam(pb.att, pa.def, false, 0))];
  }
  function record(m, a, b, ga, gb) {
    const A = m.table[a], B = m.table[b];
    A.p++; B.p++; A.gf += ga; A.ga += gb; B.gf += gb; B.ga += ga;
    if (ga > gb) { A.w++; B.l++; A.pts += 3; } else if (ga < gb) { B.w++; A.l++; B.pts += 3; } else { A.d++; B.d++; A.pts++; B.pts++; }
  }
  const sorted = (m) => m.table.map((r, i) => Object.assign({ i }, r)).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf);
  const myPos = (m) => sorted(m).findIndex((r) => r.i === 0) + 1;

  // trận của mình: tạo diễn biến từng hiệp (để nghỉ giữa hiệp đổi chiến thuật)
  function half(m, opp, home, h, my) {
    const me = power(m), op = teamPow(opp), edge = (BEATS[m.tactic.style] === opp.style ? 4 : BEATS[opp.style] === m.tactic.style ? -4 : 0);
    const gMe = poisson(lam(me.att, op.def, home, edge) / 2), gOp = poisson(lam(op.att, me.def, !home, -edge) / 2), ev = [];
    const shooters = me.xi.filter((p) => p.pos !== 'GK'), w = (p) => (p.pos === 'FW' ? 5 : p.pos === 'MF' ? 2.2 : 0.6) * p.ovr;
    for (let i = 0; i < gMe; i++) { const s = U.weighted(shooters, w); ev.push({ min: h * 45 + RI(1, 45), t: 'goal', me: true, who: s ? s.name : '?', pid: s && s.id }); }
    for (let i = 0; i < gOp; i++) ev.push({ min: h * 45 + RI(1, 45), t: 'goal', me: false });
    for (let i = 0; i < RI(2, 5); i++) { const mine = Math.random() < 0.5 + (me.att - op.def) / 80; const s = mine ? U.weighted(shooters, w) : null; ev.push({ min: h * 45 + RI(1, 45), t: 'chance', me: mine, who: s ? s.name : opp.name }); }
    if (Math.random() < 0.25 + (m.tactic.style === 'press' ? 0.15 : 0)) { const p = pick(me.xi); ev.push({ min: h * 45 + RI(5, 45), t: 'card', me: true, who: p.name }); }
    if (Math.random() < ((m.tactic.style === 'press' ? 0.12 : 0.05) + (m.tactic.press > 70 ? 0.06 : 0)) * (m.train === 'fit' ? 0.55 : 1)) { const p = pick(me.xi.filter((x) => x.pos !== 'GK')); if (p) { p.inj = RI(1, 4); ev.push({ min: h * 45 + RI(5, 45), t: 'inj', me: true, who: p.name }); } }
    return ev.sort((a, b) => a.min - b.min);
  }
  // cầu thủ đá chính → cầu thủ máy trong Haxball (chỉ số quyết định tốc độ & độ khôn, vị trí quyết định chỗ đứng)
  const haxTeam = (name, xi) => ({ name, players: xi.map((p) => ({ id: p.id, name: p.name, ovr: p.ovr * (0.9 + p.morale / 500), role: ROLE[p.pos] })) });
  function oppXI(opp) { return ['DF', 'MF', 'MF', 'FW'].map((pos, i) => ({ id: 'o' + i, name: vnName(), ovr: opp.str + R(-6, 6), role: ROLE[pos] })); }
  const LINES = {
    goal: ['VÀOOO! {who} dứt điểm tung lưới!', 'BÀN THẮNG! {who} đánh đầu cận thành!', '{who} sút xa căng như kẻ chỉ — vào!', 'Phối hợp đẹp mắt, {who} đệm bóng cận thành!'],
    goalOp: ['Bàn thua… {opp} tận dụng sai lầm của hàng thủ.', '{opp} phản công nhanh và ghi bàn.', 'Thủ môn bó tay trước cú sút của {opp}.'],
    chance: ['{who} sút trúng xà ngang! Tiếc quá!', 'Cơ hội cho {who}, thủ môn đối phương cứu thua xuất sắc.', '{who} dứt điểm chệch cột dọc trong gang tấc.'],
    chanceOp: ['{opp} ép sân, may mà thủ môn ta đã đổ người cứu thua.', 'Pha bóng nguy hiểm của {opp}, bóng đi ra ngoài.'],
    card: ['🟨 {who} nhận thẻ vàng vì pha vào bóng quá quyết liệt.'], inj: ['🩼 {who} dính chấn thương, phải rời sân!'],
  };
  const line = (e, opp) => pick(LINES[e.t + (e.me || e.t === 'card' || e.t === 'inj' ? '' : 'Op')] || LINES.chance).replace('{who}', esc(e.who || '')).replace('{opp}', esc(opp));

  // ------------------------------------------------------------------ cuối mùa (gọi từ game.js khi sang năm)
  function endSeason(m) {
    if (!m) return null;
    while (m.round < m.fixtures.length) quickRound(m);
    const pos = myPos(m), n = m.table.length, champ = pos === 1;
    const goalOk = { title: pos === 1, top4: pos <= 4, mid: pos <= 6, avoid: pos <= n - 2 }[m.goal];
    m.board = U.clamp(m.board + (goalOk ? 15 : -20) + (champ ? 10 : 0), 0, 100);
    const prize = m.national ? (champ ? 3e9 : pos <= 2 ? 1e9 : 0) : [6e9, 3e9, 1.5e9, 8e8][pos - 1] || 0;
    // tài chính cả mùa: doanh thu (vé, tài trợ, giải thưởng) trừ quỹ lương; chi quá tay thì ngân sách âm và ban lãnh đạo nổi giận
    const tr = tierOf(m), wages = m.national ? 0 : Math.round(m.squad.reduce((a, q) => a + q.val * 0.18, 0) / 1e8) * 1e8, rev = m.national ? 0 : Math.round((TIERS[tr].rev * (0.85 + (1 - (pos - 1) / n) * 0.3) + prize) / 1e8) * 1e8;
    m.fin = { rev, wages, net: rev - wages, season: m.season }; if (!m.national) { m.budget += rev - wages; if (m.budget < 0) m.board = U.clamp(m.board - 8, 0, 100); }
    m.rep = U.clamp((m.rep || 0) + (champ ? 12 : goalOk ? 5 : -4), 0, 100);
    if (champ) m.trophies++;
    m.history.push({ season: m.season, pos, goal: m.goal, ok: goalOk, champ });
    const top = m.squad.slice().sort((a, b) => b.goals - a.goals)[0];
    // phát triển cầu thủ + giải nghệ + đôn lên từ đội trẻ
    m.squad.forEach((p) => { p.age++; p.ovr = Math.round(U.clamp(p.ovr + (p.age <= 23 ? R(1, 5) * (p.pot > p.ovr ? 1 : 0.3) : p.age <= 29 ? R(-1, 2) : R(-5, 0)), 35, 94)); p.val = Math.max(1.5e8, valueOf(p)); p.inj = 0; p.lock = p.lock === 'start' ? 'start' : null; });
    const retired = m.squad.filter((p) => p.age >= 35 || (p.age >= 33 && Math.random() < 0.4));
    m.squad = m.squad.filter((p) => !retired.includes(p));
    if (!m.national) for (let i = 0; i < 2; i++) m.squad.push(makePlayer(pick(POS.slice(1)), 44 + tierOf(m) * 3 + R(-4, 8), 17));
    const bonus = Math.round((champ ? 5e8 : goalOk ? 1.5e8 : 0) * (1 + m.level * 0.6) / 1e7) * 1e7;
    const text = '📋 Mùa giải ' + m.season + ' khép lại: ' + m.club + ' xếp thứ ' + pos + '/' + n + (champ ? ' — VÔ ĐỊCH! 🏆' : '') + '. Mục tiêu ban lãnh đạo (' + GOAL_TXT[m.goal] + '): ' + (goalOk ? 'đạt ✅' : 'không đạt ❌') + '.' + (top && top.goals ? ' Vua phá lưới của đội: ' + top.name + ' (' + top.goals + ' bàn).' : '') + (retired.length ? ' Giải nghệ: ' + retired.map((p) => p.name).slice(0, 3).join(', ') + '.' : '');
    const res = { text, bonus, champ, goalOk, pos, perf: champ ? 20 : goalOk ? 10 : -18, happy: champ ? 10 : goalOk ? 4 : -6, sack: m.board < 20 };
    m.squadStr = squadStr(m); newSeason(m, m.season + 1);
    if (res.sack && !m.sacked) { m.sacked = true; m.rep = U.clamp((m.rep || 0) - 12, 0, 100); }
    return res;
  }
  const GOAL_TXT = { title: 'vô địch', top4: 'vào top 4', mid: 'nửa trên bảng xếp hạng', avoid: 'trụ hạng' };
  function quickRound(m) {
    const rd = m.fixtures[m.round]; if (!rd) return;
    rd.forEach(([a, b]) => {
      if (a === 0 || b === 0) { const home = a === 0, opp = m.teams[(home ? b : a) - 1]; const ev = half(m, opp, home, 0).concat(half(m, opp, home, 1)); const gm = ev.filter((e) => e.t === 'goal' && e.me), go = ev.filter((e) => e.t === 'goal' && !e.me).length; gm.forEach((e) => { const p = m.squad.find((x) => x.id === e.pid); if (p) p.goals++; }); record(m, a, b, home ? gm.length : go, home ? go : gm.length); afterMatch(m, gm.length, go); }
      else { const [x, y] = simAI(m, a, b); record(m, a, b, x, y); }
    });
    m.round++; updWindow(m);
  }
  // kỳ chuyển nhượng: 2 vòng đầu mùa và 2 vòng giữa mùa (giữa mùa có danh sách cầu thủ mới)
  function updWindow(m) { const h = Math.floor(m.fixtures.length / 2); if (m.round === h) m.market = marketList(m); m.window = m.round < 2 || m.round === h || m.round === h + 1; }
  function afterMatch(m, gf, ga) {
    const fx0 = m.fixtures[m.round] && m.fixtures[m.round].find(([x, y]) => x === 0 || y === 0);
    if (fx0) { const hm = fx0[0] === 0; (m.results = m.results || []).push({ r: m.round + 1, opp: m.teams[(hm ? fx0[1] : fx0[0]) - 1].name, home: hm, gf, ga }); }
    const res = gf > ga ? 1 : gf < ga ? -1 : 0;
    m.squad.forEach((p) => { if (p.inj > 0) p.inj--; });
    lineup(m).forEach((p) => { p.apps++; p.morale = U.clamp(p.morale + res * 4, 30, 100); });
    m.squad.filter((p) => !lineup(m).includes(p)).forEach((p) => (p.morale = U.clamp(p.morale - 1, 30, 100)));
    // ban lãnh đạo: thắng thì yên tâm, thua thì sốt ruột; thua liền mạch hoặc thua đội yếu hơn bị trừ nặng. Đủ thấp là bị sa thải giữa mùa
    m.streak = res > 0 ? Math.max(1, (m.streak || 0) + 1) : res < 0 ? Math.min(-1, (m.streak || 0) - 1) : 0;
    const opp0 = fx0 && m.teams[((fx0[0] === 0 ? fx0[1] : fx0[0])) - 1], weaker = opp0 && opp0.str + 4 < squadStr(m);
    let d = res > 0 ? 2.5 : res < 0 ? -4.5 : -0.5;
    if (res < 0 && weaker) d -= 3; if (m.streak <= -3) d -= 3; if (m.streak >= 4) d += 1;
    m.games = (m.games || 0) + 1; m.board = U.clamp(m.board + d, 0, 100);
    if (m.board < 25 && m.games <= 4) m.board = 25; // vài trận đầu nhiệm kỳ chưa bị sa thải
    if (m.board <= 12 && !m.sacked) { m.sacked = true; m.rep = U.clamp((m.rep || 0) - 12, 0, 100); try { G().mgrNews('Ban lãnh đạo ' + m.club + ' sa thải bạn sau chuỗi kết quả tệ hại.'); } catch (e) { /* */ } }
    // buổi tập: mỗi loại có một tác dụng thật
    if (m.train === 'tech') { const y = m.squad.filter((p) => p.age <= 26 && p.ovr < p.pot); if (y.length && Math.random() < 0.35) { const p = pick(y); p.ovr = Math.min(p.pot, p.ovr + 1); p.val = Math.max(1.5e8, valueOf(p)); } }
    if (m.train === 'rest') m.squad.forEach((p) => { p.morale = U.clamp(p.morale + 2, 30, 100); if (p.inj > 0) p.inj--; });
    if (m.train === 'fit') m.squad.forEach((p) => { p.morale = U.clamp(p.morale + 0.5, 30, 100); });
  }

  // ------------------------------------------------------------------ giao diện (thiết kế mới: header CLB · thanh điều hướng · sân 4 người · ngăn kéo hồ sơ)
  let root = null, tab = 'home';
  const st = () => (G() && G().mgrState ? G().mgrState() : null);
  const ui = { sel: null, ctx: 'squad', q: '', pos: 'all', sort: 'ovr', mq: '', mpos: 'all', mage: 99, mmin: 0, mmax: 0, list: false, saved: null };
  const GOAL_NEED = (m) => ({ title: 1, top4: 4, mid: 6, avoid: m.table.length - 2 }[m.goal]);
  const ICON = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    squad: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M16 14.2c3 .2 5 2.3 5 5.3"/>',
    tactic: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.6"/>',
    market: '<path d="M4 8h13l-2.5-3M20 16H7l2.5 3"/><path d="M17 8l3 3-3 3M7 16l-3-3 3-3" opacity=".0"/>',
    league: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v4M8 20h8"/>',
    club: '<path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M7 4l13 8-13 8z"/>', fast: '<path d="M4 5l8 7-8 7zM13 5l8 7-8 7z"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>', check: '<path d="M5 12l5 5 9-10"/>',
  };
  const ic = (n, s) => '<svg class="mx-ic" width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || '') + '</svg>';
  const hue = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; };
  const initials = (s) => { const w = String(s).replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean); return ((w.length > 1 ? w[0][0] + w[w.length - 1][0] : (w[0] || '?').slice(0, 2))).toUpperCase(); };
  // huy hiệu CLB (tự vẽ theo tên) và chân dung cầu thủ (tự vẽ theo tên) — không dùng hình bản quyền
  const badge = (name, s) => { const h = hue(name); return '<svg class="mx-badge" width="' + (s || 44) + '" height="' + (s || 44) + '" viewBox="0 0 48 52" aria-hidden="true"><path d="M24 2l19 6v18c0 11-8 19-19 24C13 45 5 37 5 26V8z" fill="hsl(' + h + ' 55% 32%)" stroke="#FFB547" stroke-width="2"/><path d="M24 2l19 6v8H5V8z" fill="hsl(' + h + ' 60% 44%)" opacity=".55"/><text x="24" y="35" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="inherit">' + esc(initials(name)) + '</text></svg>'; };
  const avatar = (p, s) => { const h = hue(p.name), skin = ['#f1c7a0', '#e0a97c', '#c98e63', '#f5d4b3'][h % 4], hair = ['#1c1410', '#3a2415', '#0e0e12', '#5a3a1c'][(h >> 2) % 4]; return '<svg class="mx-av' + (p.inj ? ' inj' : '') + '" width="' + (s || 36) + '" height="' + (s || 36) + '" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="hsl(' + h + ' 40% 24%)"/><path d="M6 36c1-8 7-11 14-11s13 3 14 11a20 20 0 0 1-28 0z" fill="hsl(' + ((h + 40) % 360) + ' 55% 42%)"/><circle cx="20" cy="16" r="7" fill="' + skin + '"/><path d="M13 15c0-5 3-8 7-8s7 3 7 8c-2-3-5-4-7-4s-5 1-7 4z" fill="' + hair + '"/></svg>'; };
  const ovrCls = (v) => (v >= 75 ? 'o-top' : v >= 65 ? 'o-good' : v >= 55 ? 'o-mid' : 'o-low');
  const moodTxt = (v) => (v >= 75 ? 'Rất tốt' : v >= 55 ? 'Ổn định' : 'Thấp');
  const bar = (v, cls) => '<span class="mx-bar ' + (cls || '') + '"><i style="width:' + Math.max(0, Math.min(100, v)) + '%"></i></span>';
  const findP = (m, id) => m.squad.find((x) => x.id === id) || m.market.find((x) => x.id === id);
  const myFix = (m, r) => { const rd = m.fixtures[r]; const f = rd && rd.find(([a, b]) => a === 0 || b === 0); if (!f) return null; const home = f[0] === 0; return { home, opp: m.teams[(home ? f[1] : f[0]) - 1] }; };
  const resOf = (m) => (m.results || []).slice();
  const wdl = (r) => (r.gf > r.ga ? 'W' : r.gf < r.ga ? 'L' : 'D');
  const formDots = (m, n) => '<span class="mx-form" title="Phong độ các trận gần nhất">' + (resOf(m).slice(-(n || 5)).map((r) => '<i class="f' + wdl(r) + '">' + ({ W: 'T', D: 'H', L: 'B' })[wdl(r)] + '</i>').join('') || '<small>Chưa đá trận nào</small>') + '</span>';
  const avgOvr = (m) => { const xi = lineup(m); return xi.length ? Math.round(xi.reduce((s, p) => s + p.ovr, 0) / xi.length) : 0; };
  const moodAvg = (m) => Math.round(m.squad.reduce((s, p) => s + p.morale, 0) / Math.max(1, m.squad.length));
  const save = () => { try { G().mgrSave(); ui.saved = new Date(); const e = root && root.querySelector('#mxSaved'); if (e) e.textContent = savedTxt(); } catch (e) { /* */ } };
  const savedTxt = () => (ui.saved ? 'Đã lưu ' + String(ui.saved.getHours()).padStart(2, '0') + ':' + String(ui.saved.getMinutes()).padStart(2, '0') : 'Tự động lưu');
  function news(m, t) { m.news = (m.news || []); m.news.unshift({ t, s: m.season, r: m.round }); m.news.length = Math.min(m.news.length, 12); try { G().mgrNews(t); } catch (e) { /* */ } }

  function toast(t, kind) {
    if (!root) return; const box = root.querySelector('.mx-toasts'); if (!box) return;
    const d = document.createElement('div'); d.className = 'mx-toast ' + (kind || ''); d.setAttribute('role', 'status'); d.textContent = t; box.appendChild(d); setTimeout(() => d.remove(), 3600);
  }
  function confirmBox(title, text, okLabel, fn, danger) {
    const w = document.createElement('div'); w.className = 'mx-dlg'; w.innerHTML = '<div class="mx-dlg-box" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p><div class="mx-dlg-act"><button type="button" class="mx-btn" data-no>Huỷ</button><button type="button" class="mx-btn ' + (danger ? 'danger' : 'pri') + '" data-ok>' + esc(okLabel) + '</button></div></div>';
    const done = (ok) => { w.remove(); if (ok) fn(); };
    w.querySelector('[data-no]').onclick = () => done(false); w.querySelector('[data-ok]').onclick = () => done(true);
    w.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } });
    root.appendChild(w); w.querySelector('[data-no]').focus();
  }

  // --- sân 4 người (Haxball): các hàng dọc theo sơ đồ, tấn công về bên phải
  function pitchHtml(m, form, xi, opts) {
    opts = opts || {}; const f = FORMS[form], rows = [1, 2, 3].filter((i) => f.n[i] > 0), sorted2 = xi;
    const slots = []; rows.forEach((ri, k) => { for (let j = 0; j < f.n[ri]; j++) slots.push({ pos: POS[ri], x: 22 + (rows.length === 1 ? 28 : (k * 56) / (rows.length - 1)), y: ((j + 1) * 100) / (f.n[ri] + 1) }); });
    const marks = sorted2.slice(0, slots.length).map((p, i) => { const s = slots[i], off = p.pos !== s.pos && p.pos !== 'GK';
      return '<button type="button" class="mx-pm' + (off ? ' off' : '') + (ui.sel === p.id ? ' sel' : '') + '" style="left:' + s.x + '%;top:' + s.y + '%" data-act="sel" data-id="' + p.id + '" data-slot="' + i + '" data-ctx="squad" title="' + esc(p.name) + ' · ' + POS_VN[p.pos] + (off ? ' (đang đá lệch vị trí)' : '') + '">' + '<span class="mx-pm-c ' + ovrCls(p.ovr) + '">' + p.ovr + '</span><span class="mx-pm-n">' + esc(p.name.split(' ').slice(-1)[0]) + '</span><span class="mx-pm-p">' + p.pos + '</span></button>'; }).join('');
    return '<div class="mx-pitch' + (opts.mini ? ' mini' : '') + '"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><rect x="3" y="3" width="194" height="94" rx="4" class="pl"/><path d="M100 3v94" class="pl"/><circle cx="100" cy="50" r="13" class="pl"/><path d="M3 30h14v40H3M197 30h-14v40h14" class="pl"/><rect x="0" y="40" width="3" height="20" class="gl"/><rect x="197" y="40" width="3" height="20" class="gl"/></svg><span class="mx-pitch-g">Thủ môn tự động: người lùi sâu nhất</span>' + marks + '<span class="mx-pitch-d">Tấn công →</span></div>';
  }
  const rowHtml = (m, p, xi, ctx) => '<button type="button" class="mx-row' + (xi && xi.includes(p) ? ' xi' : '') + (p.inj ? ' inj' : '') + (ui.sel === p.id ? ' sel' : '') + '" data-act="sel" data-id="' + p.id + '" data-ctx="' + ctx + '">' + avatar(p, 30) + '<span class="mx-rn"><b>' + esc(p.name) + '</b><small>' + POS_VN[p.pos] + (p.foreign ? ' · ngoại binh' : '') + (xi ? (xi.includes(p) ? ' · <u>Đá chính</u>' : ' · Dự bị') : '') + (p.inj ? ' · chấn thương ' + p.inj + ' vòng' : '') + '</small></span><span class="mx-n ' + ovrCls(p.ovr) + '" title="Chỉ số tổng">' + p.ovr + '</span><span class="mx-n" title="Tuổi">' + p.age + '</span><span class="mx-n" title="Tiềm năng">' + (p.pot > p.ovr + 3 ? '<em>' + p.pot + '</em>' : p.pot) + '</span><span class="mx-n" title="Tinh thần: ' + p.morale + '">' + bar(p.morale, p.morale >= 75 ? 'g' : p.morale >= 55 ? '' : 'r') + '</span><span class="mx-n val" title="Giá trị">' + money(p.val) + '</span></button>';
  const rowHead = '<div class="mx-row-h"><span></span><span class="mx-rn">Cầu thủ</span><span title="Chỉ số tổng">CS</span><span>Tuổi</span><span title="Tiềm năng">TN</span><span title="Tinh thần">TT</span><span>Giá trị</span></div>';
  function sortBy(a, b) { const k = ui.sort; return k === 'age' ? a.age - b.age : k === 'val' ? b.val - a.val : k === 'pot' ? b.pot - a.pot : b.ovr - a.ovr; }
  function squadListHtml(m) {
    const xi = lineup(m), q = ui.q.trim().toLowerCase();
    const arr = m.squad.filter((p) => (ui.pos === 'all' || p.pos === ui.pos) && (!q || p.name.toLowerCase().includes(q))).sort(sortBy);
    if (!arr.length) return '<p class="mx-empty">Không có cầu thủ phù hợp bộ lọc.</p>';
    return rowHead + POS.filter((pos) => arr.some((p) => p.pos === pos)).map((pos) => '<div class="mx-grp">' + POS_VN[pos] + '</div>' + arr.filter((p) => p.pos === pos).map((p) => rowHtml(m, p, xi, 'squad')).join('')).join('');
  }
  function marketRows(m) {
    const q = ui.mq.trim().toLowerCase();
    return m.market.filter((p) => (ui.mpos === 'all' || p.pos === ui.mpos) && p.age <= ui.mage && p.ovr >= ui.mmin && (!ui.mmax || p.val <= ui.mmax) && (!q || p.name.toLowerCase().includes(q)) && !(m.national && m.squad.some((x) => x.name === p.name))).sort(sortBy);
  }
  function marketListHtml(m) {
    const arr = marketRows(m);
    if (!arr.length) return '<p class="mx-empty">Không có cầu thủ nào khớp bộ lọc.</p>';
    return arr.map((p) => '<div class="mx-card' + (ui.sel === p.id ? ' sel' : '') + '">' + '<button type="button" class="mx-card-main" data-act="sel" data-id="' + p.id + '" data-ctx="market">' + avatar(p, 44) + '<span class="mx-rn"><b>' + esc(p.name) + '</b><small>' + POS_VN[p.pos] + ' · ' + p.age + ' tuổi' + (p.foreign ? ' · ngoại binh' : '') + '</small></span><span class="mx-n big ' + ovrCls(p.ovr) + '" title="Chỉ số tổng">' + p.ovr + '</span></button>' +
      '<div class="mx-card-m"><span title="Tiềm năng">TN <b>' + p.pot + '</b></span><span title="Tinh thần">TT <b>' + moodTxt(p.morale) + '</b></span><span class="val">' + (m.national ? 'Triệu tập' : money(p.val)) + '</span></div>' +
      '<div class="mx-card-a">' + (m.national ? '<button type="button" class="mx-btn pri sm" data-act="call" data-id="' + p.id + '">Triệu tập</button>' : m.window ? '<button type="button" class="mx-btn pri sm" data-act="buy" data-id="' + p.id + '">Mua</button><button type="button" class="mx-btn sm" data-act="bid" data-id="' + p.id + '" title="Trả giá thấp hơn 20%, có thể bị từ chối">Trả giá −20%</button>' : '<span class="mx-closed">Kỳ chuyển nhượng đóng</span>') + '</div></div>').join('');
  }

  // --- ngăn kéo hồ sơ cầu thủ
  function drawerHtml(m) {
    const p = ui.sel && findP(m, ui.sel); if (!p) return '';
    const inSq = m.squad.includes(p), xi = lineup(m), on = inSq && xi.includes(p);
    const dev = p.age <= 23 && p.pot > p.ovr + 2 ? 'Đang phát triển — còn khoảng +' + (p.pot - p.ovr) + ' chỉ số' : p.age >= 31 ? 'Đang xuống sức theo tuổi, giá trị giảm dần' : 'Ở độ chín, ít thay đổi';
    const act = inSq ? '<button type="button" class="mx-btn' + (p.lock === 'start' ? ' pri' : '') + '" data-act="lock" data-id="' + p.id + '" data-v="start">' + (p.lock === 'start' ? 'Đang ghim đá chính' : 'Ghim đá chính') + '</button><button type="button" class="mx-btn' + (p.lock === 'bench' ? ' pri' : '') + '" data-act="lock" data-id="' + p.id + '" data-v="bench">' + (p.lock === 'bench' ? 'Đang cho dự bị' : 'Cho dự bị') + '</button>' + (m.national ? '<button type="button" class="mx-btn danger" data-act="drop" data-id="' + p.id + '">Loại khỏi đội</button>' : '<button type="button" class="mx-btn danger" data-act="sell" data-id="' + p.id + '">Rao bán</button>')
      : m.national ? '<button type="button" class="mx-btn pri" data-act="call" data-id="' + p.id + '">Triệu tập</button>' : m.window ? '<button type="button" class="mx-btn pri" data-act="buy" data-id="' + p.id + '">Mua ' + money(p.val) + '</button><button type="button" class="mx-btn" data-act="bid" data-id="' + p.id + '">Trả giá −20%</button>' : '<span class="mx-closed">Kỳ chuyển nhượng đang đóng</span>';
    return '<div class="mx-dr-h">' + avatar(p, 56) + '<div><h3>' + esc(p.name) + '</h3><small>' + POS_VN[p.pos] + ' · ' + p.age + ' tuổi' + (p.foreign ? ' · ngoại binh' : '') + '</small></div><button type="button" class="mx-x" data-act="drx" aria-label="Đóng hồ sơ">' + ic('close', 18) + '</button></div>' +
      '<div class="mx-dr-ovr"><div><small>Chỉ số tổng</small><b class="' + ovrCls(p.ovr) + '">' + p.ovr + '</b></div><div><small>Tiềm năng</small><b>' + p.pot + '</b></div></div>' +
      '<dl class="mx-dl"><dt title="Tinh thần ảnh hưởng sức mạnh thi đấu">Tinh thần</dt><dd>' + bar(p.morale, p.morale >= 75 ? 'g' : p.morale >= 55 ? '' : 'r') + ' ' + moodTxt(p.morale) + ' (' + p.morale + ')</dd><dt>Thể trạng</dt><dd>' + (p.inj ? '<span class="bad">Chấn thương, nghỉ ' + p.inj + ' vòng</span>' : 'Sẵn sàng thi đấu') + '</dd><dt>Giá trị</dt><dd>' + money(p.val) + '</dd><dt>Mùa này</dt><dd>' + (p.goals || 0) + ' bàn · ' + (p.apps || 0) + ' trận</dd>' + (p.rts && p.rts.length ? '<dt title="Điểm trung bình các trận gần nhất (thang 10)">Điểm gần đây</dt><dd><b>' + (p.rts.reduce((a, b) => a + b, 0) / p.rts.length).toFixed(1) + '</b> · trận gần nhất ' + p.rts[p.rts.length - 1].toFixed(1) + (p.mvps ? ' · ⭐ MVP ×' + p.mvps : '') + '</dd>' : '') + '<dt>Phát triển</dt><dd>' + dev + '</dd>' + (inSq ? '<dt>Vai trò</dt><dd>' + (on ? 'Đá chính' : 'Dự bị') + (p.lock ? ' (do bạn chọn)' : ' (tự chọn theo chỉ số)') + '</dd>' : '') + '</dl><div class="mx-dr-act">' + act + '</div>';
  }
  function drawer() { const d = root.querySelector('#mxDrawer'); if (!d) return; const m = st(); d.innerHTML = m ? drawerHtml(m) : ''; d.classList.toggle('open', !!(m && ui.sel && findP(m, ui.sel))); }

  // --- các màn hình
  const statCard = (label, val, sub, tip) => '<div class="mx-stat" title="' + esc(tip || '') + '"><small>' + label + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
  function fixtureCard(m, r, hl) {
    const fx = myFix(m, r), res = (m.results || []).find((x) => x.r === r + 1); if (!fx) return '';
    return '<div class="mx-fx' + (hl ? ' next' : '') + '"><small>Vòng ' + (r + 1) + (fx.home ? ' · Sân nhà' : ' · Sân khách') + '</small><div>' + badge(fx.opp.name, 26) + '<b>' + esc(fx.opp.name) + '</b>' + (res ? '<span class="mx-sc ' + wdl(res) + '">' + res.gf + '–' + res.ga + '</span>' : '<em>sức mạnh ~' + Math.round(fx.opp.str) + '</em>') + '</div></div>';
  }
  function tableHtml(m, full) {
    const rows = sorted(m); const my = resOf(m);
    return '<div class="mx-scroll"><table class="mx-tb"><thead><tr><th>#</th><th>Đội</th><th title="Số trận">Tr</th><th title="Thắng">T</th><th title="Hoà">H</th><th title="Thua">B</th><th title="Hiệu số bàn thắng">HS</th><th title="Điểm">Đ</th>' + (full ? '<th>Phong độ</th>' : '') + '</tr></thead><tbody>' + rows.slice(0, full ? 99 : 6).map((r, k) => '<tr class="' + (r.i === 0 ? 'me' : '') + (k < 4 ? ' top' : '') + '"><td>' + (k + 1) + '</td><td class="nm">' + badge(r.name, 18) + ' ' + esc(r.name) + '</td><td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + (r.gf - r.ga > 0 ? '+' : '') + (r.gf - r.ga) + '</td><td><b>' + r.pts + '</b></td>' + (full ? '<td>' + (r.i === 0 ? formDots(m, 5) : '') + '</td>' : '') + '</tr>').join('') + '</tbody></table></div>';
  }
  const matchBtns = (m) => (m.round < m.fixtures.length ? '<button type="button" class="mx-btn pri lg" data-act="play">' + ic('play', 18) + ' Vào trận (Haxball 4v4)</button><button type="button" class="mx-btn" data-act="quick" title="Đá nhanh vòng này, chỉ xem kết quả">' + ic('fast', 16) + ' Xem kết quả</button>' : '<button type="button" class="mx-btn pri lg" data-act="cont">' + ic('check', 18) + ' Tiếp tục sự nghiệp</button>');
  function body(m) {
    const xi = lineup(m), pos = myPos(m), n = m.table.length, need = GOAL_NEED(m), left = m.fixtures.length - m.round;
    if (tab === 'home') {
      const fx = myFix(m, m.round), last = resOf(m).slice(-5).reverse();
      return '<div class="mx-hero"><div class="mx-hero-bg" aria-hidden="true"></div><div class="mx-hero-in">' + badge(m.club, 72) + '<div><small>' + (m.national ? 'AFF Cup ' : 'V-League ') + m.season + '</small><h2>' + esc(m.club) + '</h2><p>Hạng <b>' + pos + '/' + n + '</b> · mục tiêu: ' + GOAL_TXT[m.goal] + ' · còn ' + left + ' vòng</p></div></div></div>' +
        '<div class="mx-grid g2"><section class="mx-panel"><h4>Trận tiếp theo</h4>' + (fx ? '<div class="mx-next"><div class="mx-vs">' + badge(m.club, 40) + '<b>VS</b>' + badge(fx.opp.name, 40) + '</div><div><b>' + esc(fx.opp.name) + '</b><small>Vòng ' + (m.round + 1) + ' · ' + (fx.home ? 'sân nhà' : 'sân khách') + ' · lối chơi ' + STYLES[fx.opp.style].name + '</small>' + (BEATS[m.tactic.style] === fx.opp.style ? '<span class="mx-tag g">Lối chơi của bạn khắc chế họ</span>' : BEATS[fx.opp.style] === m.tactic.style ? '<span class="mx-tag r">Họ khắc chế lối chơi của bạn</span>' : '') + '</div></div>' : '<p class="mx-empty">Mùa giải đã đá xong. Bấm tiếp tục để tổng kết và sang mùa mới.</p>') + '<div class="mx-acts">' + matchBtns(m) + '</div></section>' +
        '<section class="mx-panel"><h4>Kết quả gần đây</h4>' + (m.lastRate && m.lastRate.length ? '<div class="mx-rate"><small>Chấm điểm trận gần nhất</small>' + m.lastRate.slice().sort((a, b) => b.r - a.r).map((x, i) => '<div class="' + (i === 0 ? 'mvp' : '') + '"><span>' + (i === 0 ? '⭐ ' : '') + esc(x.name) + (x.g ? ' ⚽' + x.g : '') + (x.a ? ' 🅰' + x.a : '') + '</span><b class="' + (x.r >= 8 ? 'o-top' : x.r >= 6.5 ? 'o-good' : x.r < 5.5 ? 'o-low' : '') + '">' + x.r.toFixed(1) + '</b></div>').join('') + '</div>' : '') + (last.length ? '<ul class="mx-res">' + last.map((r) => '<li><i class="f' + wdl(r) + '">' + ({ W: 'T', D: 'H', L: 'B' })[wdl(r)] + '</i><span>' + (r.home ? 'Nhà' : 'Khách') + ' · ' + esc(r.opp) + '</span><b>' + r.gf + '–' + r.ga + '</b></li>').join('') + '</ul>' + formDots(m, 5) : '<p class="mx-empty">Chưa có trận nào trong mùa này.</p>') + '</section></div>' +
        '<div class="mx-stats">' + statCard('Ngân sách', m.national ? '—' : money(m.budget), m.national ? 'Đội tuyển không mua bán' : m.window ? 'Kỳ chuyển nhượng đang mở' : 'Kỳ chuyển nhượng đóng', 'Tiền dùng để mua cầu thủ') + statCard('Ban lãnh đạo', Math.round(m.board) + '%', bar(m.board, m.board < 35 ? 'r' : 'g'), 'Dưới 20% có nguy cơ bị sa thải cuối mùa') + statCard('Sức mạnh đội hình', squadStr(m), 'CS trung bình ' + avgOvr(m), 'Tính từ 4 cầu thủ đá chính và tinh thần') + statCard('Tinh thần toàn đội', moodAvg(m) + '', moodTxt(moodAvg(m)), 'Thắng tăng, thua giảm tinh thần') + '</div>' +
        '<div class="mx-grid g2"><section class="mx-panel"><h4>Bảng xếp hạng</h4>' + tableHtml(m, false) + '</section><section class="mx-panel"><h4>Tin tức CLB</h4>' + (((m.news || []).length) ? '<ul class="mx-news">' + m.news.slice(0, 5).map((x) => '<li>' + esc(x.t) + '</li>').join('') + '</ul>' : '<p class="mx-empty">Chưa có tin mới. Mua bán cầu thủ và kết quả trận đấu sẽ xuất hiện ở đây.</p>') + (m.lastMatch ? '<p class="mx-last">' + m.lastMatch + '</p>' : '') + '</section></div>';
    }
    if (tab === 'squad') {
      const bench = m.squad.filter((p) => !xi.includes(p)).sort(sortBy);
      return '<div class="mx-split"><div class="mx-left"><section class="mx-panel"><h4>Đội hình ' + m.tactic.form + ' <small>· đá chính ' + xi.length + '/4</small></h4>' + pitchHtml(m, m.tactic.form, xi) + '<h5>Dự bị (' + bench.length + ')</h5><div class="mx-bench">' + (bench.map((p) => '<button type="button" class="mx-bp' + (p.inj ? ' inj' : '') + (ui.sel === p.id ? ' sel' : '') + '" data-act="sel" data-id="' + p.id + '" data-ctx="squad">' + avatar(p, 28) + '<span><b>' + esc(p.name.split(' ').slice(-1)[0]) + '</b><small>' + p.pos + ' · ' + p.ovr + '</small></span></button>').join('') || '<p class="mx-empty">Không có dự bị.</p>') + '</div><p class="mx-hint"><b>Kéo thả</b> cầu thủ để sắp đội hình: thả dự bị lên sân để thay người, thả hai cầu thủ lên nhau để đổi chỗ, kéo người trên sân xuống khu dự bị để cho nghỉ. Bấm vào cầu thủ để xem hồ sơ (trên điện thoại: giữ một chút rồi kéo).</p>' + (m.xi ? '<button type="button" class="mx-btn sm" data-act="autoxi">Để máy tự chọn lại</button>' : '') + '</section></div>' +
        '<div class="mx-right"><button type="button" class="mx-btn mx-listtog" data-act="listtog">' + ic('squad', 16) + ' Danh sách cầu thủ (' + m.squad.length + ')</button><section class="mx-panel mx-list' + (ui.list ? ' open' : '') + '"><div class="mx-filters"><label class="mx-search">' + ic('search', 16) + '<input type="search" data-q placeholder="Tìm cầu thủ" value="' + esc(ui.q) + '" aria-label="Tìm cầu thủ"></label><select data-sort aria-label="Sắp xếp">' + [['ovr', 'Chỉ số'], ['age', 'Tuổi'], ['val', 'Giá trị'], ['pot', 'Tiềm năng']].map(([k, l]) => '<option value="' + k + '"' + (ui.sort === k ? ' selected' : '') + '>Xếp theo ' + l + '</option>').join('') + '</select></div><div class="mx-chips">' + [['all', 'Tất cả']].concat(POS.slice(1).map((p) => [p, POS_VN[p]])).map(([k, l]) => '<button type="button" class="' + (ui.pos === k ? 'on' : '') + '" data-act="pos" data-v="' + k + '">' + l + '</button>').join('') + '</div><div class="mx-rows" id="mxList">' + squadListHtml(m) + '</div></section></div></div>';
    }
    if (tab === 'tactic') {
      const t = m.tactic, pw = power(m), fx = myFix(m, m.round);
      const info = { balanced: ['Ổn định, ít bị khắc chế', 'Không có điểm nhấn'], possession: ['Giữ nhịp trận, phòng ngự tốt hơn bình thường', 'Dễ bị Gegenpressing ép sân'], press: ['Tấn công mạnh nhất', 'Hở sau lưng, dễ chấn thương, kém khi bị phản công'], counter: ['Hàng thủ chắc, tận dụng khoảng trống', 'Ít chủ động tấn công, bị Xe buýt bóp nghẹt'], park: ['Phòng ngự chắc nhất', 'Gần như không tấn công, hay bị Kiểm soát bóng áp đảo'] };
      const counterOf = (s) => Object.keys(BEATS).find((k) => BEATS[k] === s);
      return '<div class="mx-split t"><div class="mx-left"><section class="mx-panel"><h4>Sơ đồ ' + t.form + '</h4>' + pitchHtml(m, t.form, xi) + '<p class="mx-hint">' + FORMS[t.form].desc + '</p><div class="mx-forms">' + Object.keys(FORMS).map((f) => '<button type="button" class="mx-fm' + (t.form === f ? ' on' : '') + '" data-act="form" data-v="' + f + '" aria-pressed="' + (t.form === f) + '" title="' + FORMS[f].desc + '"><b>' + f + '</b><small>công ' + (FORMS[f].att >= 0 ? '+' : '') + FORMS[f].att + ' · thủ ' + (FORMS[f].def >= 0 ? '+' : '') + FORMS[f].def + '</small></button>').join('') + '</div></section></div>' +
        '<div class="mx-right"><section class="mx-panel"><h4>Lối chơi</h4><div class="mx-styles">' + Object.keys(STYLES).map((s) => { const S2 = STYLES[s]; return '<button type="button" class="mx-sty' + (t.style === s ? ' on' : '') + '" data-act="style" data-v="' + s + '" aria-pressed="' + (t.style === s) + '"><b>' + S2.name.replace(/^\S+\s/, '') + '</b><span><small>Công</small>' + bar(50 + S2.att * 8, 'a') + '<small>Thủ</small>' + bar(50 + S2.def * 8, 'g') + '</span><small class="s">+ ' + info[s][0] + '</small><small class="w">− ' + info[s][1] + '</small><small>' + (BEATS[s] ? 'Khắc chế: ' + STYLES[BEATS[s]].name.replace(/^\S+\s/, '') + ' · Bị khắc chế bởi: ' + STYLES[counterOf(s)].name.replace(/^\S+\s/, '') : 'Không khắc chế và không bị khắc chế bởi lối chơi nào') + '</small></button>'; }).join('') + '</div>' +
        '<h4>Cường độ pressing: <b id="mgrPv">' + t.press + '</b></h4><input type="range" min="10" max="95" value="' + t.press + '" id="mgrPress" class="mx-range" aria-label="Cường độ pressing" title="Cao: tấn công mạnh hơn, hở phía sau, dễ chấn thương"><p class="mx-hint">Pressing cao: tấn công mạnh hơn nhưng hở phía sau và dễ chấn thương.</p>' +
        '<h4>Buổi tập giữa các trận</h4><div class="mx-chips">' + Object.keys(TRAIN).map((k) => '<button type="button" class="' + ((m.train || 'tact') === k ? 'on' : '') + '" data-act="train" data-v="' + k + '" title="' + TRAIN[k][1] + '">' + TRAIN[k][0] + '</button>').join('') + '</div><p class="mx-hint">' + TRAIN[m.train || 'tact'][1] + '.</p>' +
        '<div class="mx-pw"><span>Tấn công <b id="pwA">' + Math.round(pw.att) + '</b></span><span>Phòng ngự <b id="pwD">' + Math.round(pw.def) + '</b></span>' + (fx ? '<span>Đối thủ tới: ' + esc(fx.opp.name) + ' · ' + STYLES[fx.opp.style].name + '</span>' : '') + '</div></section></div></div>';
    }
    if (tab === 'market') {
      const pills = '<div class="mx-chips">' + [['all', 'Tất cả']].concat(POS.slice(1).map((p) => [p, POS_VN[p]])).map(([k, l]) => '<button type="button" class="' + (ui.mpos === k ? 'on' : '') + '" data-act="mpos" data-v="' + k + '">' + l + '</button>').join('') + '</div>';
      return '<div class="mx-stats s3">' + statCard('Ngân sách', m.national ? '—' : money(m.budget), '', 'Tiền còn lại để chiêu mộ') + statCard('Kỳ chuyển nhượng', m.national ? 'Triệu tập' : m.window ? 'Đang mở' : 'Đóng', m.national ? 'Tối đa 12 người' : 'Mở đầu mùa và giữa mùa', '') + statCard('Đội hình', m.squad.length + '/' + (m.national ? 12 : 14), 'Tối thiểu 6 người', '') + '</div>' +
        '<section class="mx-panel"><div class="mx-filters wide"><label class="mx-search">' + ic('search', 16) + '<input type="search" data-mq placeholder="Tìm cầu thủ" value="' + esc(ui.mq) + '" aria-label="Tìm cầu thủ"></label><select data-sort aria-label="Sắp xếp">' + [['ovr', 'Chỉ số'], ['age', 'Tuổi'], ['val', 'Giá'], ['pot', 'Tiềm năng']].map(([k, l]) => '<option value="' + k + '"' + (ui.sort === k ? ' selected' : '') + '>Xếp theo ' + l + '</option>').join('') + '</select><select data-mage aria-label="Tuổi tối đa">' + [[99, 'Mọi tuổi'], [23, '≤ 23 tuổi'], [28, '≤ 28 tuổi'], [31, '≤ 31 tuổi']].map(([v, l]) => '<option value="' + v + '"' + (ui.mage === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select><select data-mmin aria-label="Chỉ số tối thiểu">' + [[0, 'Mọi chỉ số'], [60, 'CS ≥ 60'], [70, 'CS ≥ 70'], [80, 'CS ≥ 80']].map(([v, l]) => '<option value="' + v + '"' + (ui.mmin === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' + (m.national ? '' : '<select data-mmax aria-label="Giá tối đa">' + [[0, 'Mọi mức giá'], [5e8, '≤ 500 triệu'], [2e9, '≤ 2 tỷ'], [5e9, '≤ 5 tỷ']].map(([v, l]) => '<option value="' + v + '"' + (ui.mmax === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>') + '</div>' + pills + '<div class="mx-cards" id="mxList">' + marketListHtml(m) + '</div></section>';
    }
    if (tab === 'league') {
      const h = m.fixtures.length, cur = m.round;
      return '<div class="mx-split lg"><section class="mx-panel"><h4>Bảng xếp hạng ' + (m.national ? 'AFF Cup ' : 'V-League ') + m.season + '</h4>' + tableHtml(m, true) + '<p class="mx-hint">Xếp theo điểm, hiệu số, rồi số bàn thắng. Tô sáng là CLB của bạn; 4 đội đầu là nhóm dẫn đầu.</p></section>' +
        '<div class="mx-right"><section class="mx-panel"><h4>Tiến trình mùa giải</h4><div class="mx-time" role="list">' + Array.from({ length: h }, (_, r) => { const res = (m.results || []).find((x) => x.r === r + 1); return '<span role="listitem" class="' + (res ? 'f' + wdl(res) : r === cur ? 'now' : '') + '" title="Vòng ' + (r + 1) + (res ? ': ' + res.gf + '–' + res.ga : '') + '">' + (r + 1) + '</span>'; }).join('') + '</div><div class="mx-acts">' + matchBtns(m) + '</div></section>' +
        '<section class="mx-panel"><h4>Lịch thi đấu</h4><div class="mx-fxs">' + [cur - 2, cur - 1, cur, cur + 1, cur + 2].filter((r) => r >= 0 && r < h).map((r) => fixtureCard(m, r, r === cur)).join('') + '</div></section></div></div>';
    }
    // quản lý CLB
    const hist = m.history.slice().reverse();
    return '<div class="mx-stats">' + statCard('Ban lãnh đạo', Math.round(m.board) + '%', bar(m.board, m.board < 35 ? 'r' : 'g'), 'Đạt mục tiêu cuối mùa thì tăng, không đạt thì giảm mạnh') + statCard('Mục tiêu mùa', GOAL_TXT[m.goal], 'Hiện hạng ' + pos + ' · cần ≤ ' + need, '') + statCard('Danh hiệu', '×' + m.trophies, '', '') + statCard('Ngân sách', m.national ? '—' : money(m.budget), '', '') + '</div>' +
      '<div class="mx-grid g2"><section class="mx-panel"><h4>Tiến độ mục tiêu</h4>' + bar(pos <= need ? 100 : Math.max(5, 100 - ((pos - need) / Math.max(1, n - need)) * 100), pos <= need ? 'g' : 'r') + '<p class="mx-hint">' + (pos <= need ? 'Bạn đang đạt mục tiêu của ban lãnh đạo.' : 'Bạn đang kém mục tiêu ' + (pos - need) + ' bậc.') + ' Còn ' + left + ' vòng.</p><div class="mx-acts"><button type="button" class="mx-btn danger" data-act="season"' + (left ? '' : ' disabled') + '>' + ic('fast', 16) + ' Đá hết mùa</button></div><p class="mx-hint">Đá hết mùa sẽ mô phỏng toàn bộ vòng còn lại, bạn không điều khiển trận nào.</p></section>' +
      '<section class="mx-panel"><h4>Lịch sử các mùa</h4>' + (hist.length ? '<div class="mx-scroll"><table class="mx-tb"><thead><tr><th>Mùa</th><th>Hạng</th><th>Mục tiêu</th><th>Kết quả</th></tr></thead><tbody>' + hist.map((x) => '<tr><td>' + x.season + '</td><td>' + x.pos + '</td><td>' + GOAL_TXT[x.goal] + '</td><td>' + (x.champ ? 'Vô địch' : x.ok ? 'Đạt' : 'Không đạt') + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="mx-empty">Chưa kết thúc mùa nào.</p>') + '</section></div>' + clubExtra(m);
  }
  // danh sách mọi CLB để chọn: CLB lớn cần uy tín HLV đủ cao (khoá nếu chưa đủ); bị sa thải thì không thể lên tầng cao hơn CLB cũ
  const NEED_REP = { 1: 0, 2: 18, 3: 40 };
  function clubLock(m, c, sacked) {
    const t = CLUB_TIER[c], rep = m.rep || 0, cur = tierOf(m) === 4 ? 2 : tierOf(m);
    if (rep < NEED_REP[t]) return 'Cần uy tín ≥ ' + NEED_REP[t] + ' (bạn ' + Math.round(rep) + ')';
    if (sacked && t > cur) return 'Vừa bị sa thải, chưa ai dám giao CLB lớn hơn';
    return '';
  }
  function offersHtml(m, sacked) {
    const pick = !!(ui.offers && ui.offers.pick), rep = m.rep || 0;
    const o = Object.keys(CLUB_TIER).filter((c) => pick || c !== m.club).sort((x, y) => CLUB_TIER[y] - CLUB_TIER[x] || (x < y ? -1 : 1));
    return '<section class="mx-panel"><h4>' + (pick ? 'Chọn CLB để dẫn dắt' : sacked ? 'Các CLB còn muốn dùng bạn' : 'Chuyển sang CLB khác') + '</h4><p class="mx-hint">Uy tín HLV của bạn: <b>' + Math.round(rep) + '/100</b>. Từ 18 điểm được dẫn CLB tầm trung, từ 40 điểm được dẫn CLB lớn. Uy tín tăng khi đạt mục tiêu và giành cúp, giảm khi bị sa thải. Mỗi CLB có đội hình, quỹ và kỳ vọng riêng; danh hiệu và uy tín đi theo bạn.</p><div class="mx-cards">' +
      o.map((c) => { const t = CLUB_TIER[c], T = TIERS[t], exp = t === 3 ? 'Phải vô địch' : t === 2 ? 'Vào top 4' : 'Giữ trụ hạng', lock = clubLock(m, c, sacked); return '<div class="mx-card' + (lock ? ' locked' : '') + '"><div class="mx-card-main" style="cursor:default">' + badge(c, 44) + '<span class="mx-rn"><b>' + esc(c) + '</b><small>' + T.name + ' · ' + exp + (c === m.club ? ' · CLB hiện tại' : '') + '</small></span></div><div class="mx-card-m"><span>Quỹ <b>' + money(T.budget) + '</b></span><span>Doanh thu <b>' + money(T.rev) + '/mùa</b></span></div><p class="mx-hint" style="margin:0">' + (lock || T.hint) + '</p><div class="mx-card-a"><button type="button" class="mx-btn pri sm" data-act="club-pick" data-name="' + esc(c) + '"' + (lock ? ' disabled' : '') + '>' + (c === m.club ? 'Ở lại CLB này' : 'Nhận lời dẫn dắt') + '</button></div></div>'; }).join('') + '</div>' +
      '<div class="mx-acts">' + (sacked || pick ? '' : '<button type="button" class="mx-btn" data-act="club-cancel">Ở lại ' + esc(m.club) + '</button>') + '<button type="button" class="mx-btn danger" data-act="club-quit">Nghỉ làm huấn luyện viên</button></div></section>';
  }
  function sackedHtml(m) {
    const r = m.results || [], w = r.filter((x) => x.gf > x.ga).length, d = r.filter((x) => x.gf === x.ga).length, l = r.length - w - d;
    if (!ui.offers) ui.offers = { sacked: true };
    return '<section class="mx-panel mx-sack"><h4>Bị sa thải</h4><p style="font-size:15px;line-height:1.6;margin:0 0 8px">Ban lãnh đạo <b>' + esc(m.club) + '</b> đã mất kiên nhẫn: mùa này đội bạn thắng ' + w + ', hoà ' + d + ', thua ' + l + ', xếp hạng ' + myPos(m) + '/' + m.table.length + ' và độ tin tưởng chỉ còn ' + Math.round(m.board) + '%. Uy tín của bạn giảm. Nếu không nhận lời CLB nào, sang năm bạn sẽ thất nghiệp.</p></section>' + offersHtml(m, true);
  }
  function clubExtra(m) {
    const tr = tierOf(m), wagesNow = Math.round(m.squad.reduce((a, q) => a + q.val * 0.18, 0) / 1e8) * 1e8, fin = m.fin;
    const car = (m.career || []).slice().reverse();
    return '<div class="mx-grid g2"><section class="mx-panel"><h4>Hồ sơ huấn luyện viên</h4><div class="mx-kv"><span>Uy tín</span><b>' + Math.round(m.rep || 0) + '/100</b></div>' + bar(m.rep || 0, 'g') + '<div class="mx-kv"><span>CLB hiện tại</span><b>' + esc(m.club) + (m.national ? '' : ' · ' + TIERS[tr].name) + '</b></div><div class="mx-kv"><span>Danh hiệu</span><b>×' + m.trophies + '</b></div>' +
      '<h5>Độ khó đối thủ</h5><div class="mx-chips">' + DIFF.map(([l], i) => '<button type="button" class="' + ((m.diff == null ? 1 : m.diff) === i ? 'on' : '') + '" data-act="diff" data-v="' + i + '">' + l + '</button>').join('') + '</div>' +
      (car.length ? '<h5>Các CLB đã dẫn dắt</h5>' + car.map((x) => '<div class="mx-kv"><span>' + esc(x.club) + '</span><b>' + x.from + '–' + x.to + '</b></div>').join('') : '') +
      '<div class="mx-acts"><button type="button" class="mx-btn danger" data-act="resign">Từ chức, xem lời mời CLB khác</button></div></section>' +
      '<section class="mx-panel"><h4>Tài chính CLB</h4>' + (m.national ? '<p class="mx-empty">Đội tuyển quốc gia không có ngân sách riêng.</p>' : '<div class="mx-kv"><span>Ngân sách</span><b>' + money(m.budget) + '</b></div><div class="mx-kv"><span>Quỹ lương hiện tại</span><b>' + money(wagesNow) + '/mùa</b></div><div class="mx-kv"><span>Doanh thu dự kiến</span><b>khoảng ' + money(TIERS[tr].rev) + '/mùa + thưởng thứ hạng</b></div>' + (fin ? '<div class="mx-kv"><span>Mùa ' + fin.season + '</span><b>' + (fin.net >= 0 ? '+' : '') + money(fin.net) + ' (thu ' + money(fin.rev) + ', lương ' + money(fin.wages) + ')</b></div>' : '') + '<p class="mx-hint">Mua cầu thủ giỏi làm quỹ lương phình to. Ngân sách âm cuối mùa sẽ khiến ban lãnh đạo nổi giận. Thua nhiều, độ tin tưởng về dưới 12% là bị sa thải ngay giữa mùa.</p>') + '</section></div>';
  }
  const TABS = [['home', 'Tổng quan'], ['squad', 'Đội hình'], ['tactic', 'Chiến thuật'], ['market', 'Chuyển nhượng'], ['league', 'Giải đấu'], ['club', 'Quản lý CLB']];
  function open(t) {
    const m = st(); if (!m) return;
    if (t) { if (t !== tab) ui.sel = null; tab = t; }
    if (m.pick && !m.sacked && !(ui.offers && ui.offers.pick)) ui.offers = { pick: true };
    const old = root && root.querySelector('.mx-main'), sc = old ? old.scrollTop : 0;
    if (!root) { root = document.createElement('div'); root.className = 'hax mgr mx'; document.body.appendChild(root); root.addEventListener('keydown', onKey); root.addEventListener('pointerdown', onPD); root.addEventListener('click', onClick); root.addEventListener('input', onInput); root.addEventListener('change', onChange); }
    const pos = myPos(m), n = m.table.length, need = GOAL_NEED(m), okNow = pos <= need;
    root.innerHTML = '<div class="mx-shell"><header class="mx-head">' + badge(m.club, 46) + '<div class="mx-id"><h1>' + esc(m.club) + '</h1><small>' + (m.national ? 'AFF Cup ' : 'V-League ') + m.season + ' · vòng ' + Math.min(m.round + 1, m.fixtures.length) + '/' + m.fixtures.length + ' · hạng ' + pos + '/' + n + '</small></div>' +
      '<div class="mx-kpis"><span title="Ngân sách chuyển nhượng"><small>Ngân sách</small><b>' + (m.national ? '—' : money(m.budget)) + '</b></span><span title="Độ tin tưởng của ban lãnh đạo"><small>Ban lãnh đạo</small><b>' + Math.round(m.board) + '%</b></span><span class="obj" title="Mục tiêu mùa: ' + GOAL_TXT[m.goal] + '"><small>Mục tiêu · ' + GOAL_TXT[m.goal] + '</small>' + bar(okNow ? 100 : Math.max(5, 100 - ((pos - need) / Math.max(1, n - need)) * 100), okNow ? 'g' : 'r') + '</span></div>' +
      '<div class="mx-tools"><small id="mxSaved">' + savedTxt() + '</small><button type="button" class="mx-x" data-act="close" aria-label="Đóng phòng HLV">' + ic('close', 20) + '</button></div></header>' +
      '<nav class="mx-nav" role="tablist" aria-label="Phòng huấn luyện">' + TABS.map(([k, l]) => '<button type="button" role="tab" aria-selected="' + (tab === k) + '" class="' + (tab === k ? 'on' : '') + '" data-act="tab" data-v="' + k + '">' + ic(k === 'tactic' ? 'tactic' : k === 'market' ? 'market' : k, 18) + '<span>' + (m.national && k === 'market' ? 'Triệu tập' : l) + '</span></button>').join('') + '</nav>' +
      '<main class="mx-main" id="mgrBody">' + (m.sacked ? sackedHtml(m) : ui.offers ? offersHtml(m, false) : body(m)) + '</main><aside class="mx-drawer" id="mxDrawer" aria-label="Hồ sơ cầu thủ"></aside><div class="mx-toasts" aria-live="polite"></div></div>';
    const mn = root.querySelector('.mx-main'); if (mn) mn.scrollTop = sc;
    drawer();
  }

  // --- kéo thả sắp đội hình (chuột: kéo ngay; cảm ứng: giữ một chút rồi kéo để không cản việc cuộn danh sách)
  const dr = { on: false, id: null, slot: -1, sx: 0, sy: 0, ghost: null, timer: 0, touch: false, last: null };
  const noScroll = (e) => { if (dr.on) e.preventDefault(); };
  function dragStart() {
    const m = st(), p = m && findP(m, dr.id); if (!p) return dragEnd();
    dr.on = true; dr.ghost = document.createElement('div'); dr.ghost.className = 'mx-ghost'; dr.ghost.innerHTML = avatar(p, 34) + '<b>' + esc(p.name.split(' ').slice(-1)[0]) + '</b><span>' + p.pos + ' · ' + p.ovr + '</span>';
    root.appendChild(dr.ghost); root.classList.add('mx-dragging'); root.querySelectorAll('[data-id="' + dr.id + '"]').forEach((x) => x.classList.add('dragging'));
    window.addEventListener('touchmove', noScroll, { passive: false }); dragMove({ clientX: dr.sx, clientY: dr.sy });
  }
  function dropTarget(x, y) {
    const el = document.elementFromPoint(x, y); if (!el || !root.contains(el)) return null;
    const pm = el.closest('.mx-pm'); if (pm) return { kind: 'slot', slot: +pm.dataset.slot, el: pm };
    const pit = el.closest('.mx-pitch'); if (pit) { let best = -1, bd = 1e9; pit.querySelectorAll('.mx-pm').forEach((q) => { const r = q.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); if (d < bd) { bd = d; best = +q.dataset.slot; } }); return best >= 0 ? { kind: 'slot', slot: best, el: pit.querySelector('.mx-pm[data-slot="' + best + '"]') } : null; }
    const bp = el.closest('.mx-bp,.mx-row'); if (bp && bp.dataset.id) return { kind: 'bench', id: bp.dataset.id, el: bp };
    const bz = el.closest('.mx-bench,.mx-list'); if (bz) return { kind: 'bench', id: null, el: bz };
    return null;
  }
  function dragMove(e) {
    if (!dr.on) return; dr.ghost.style.left = e.clientX + 'px'; dr.ghost.style.top = e.clientY + 'px';
    const t = dropTarget(e.clientX, e.clientY); if (dr.last && dr.last !== (t && t.el)) dr.last.classList.remove('drop'); dr.last = t && t.el; if (dr.last) dr.last.classList.add('drop');
  }
  function dragEnd() {
    clearTimeout(dr.timer); window.removeEventListener('touchmove', noScroll);
    if (dr.ghost) dr.ghost.remove(); if (dr.last) dr.last.classList.remove('drop');
    if (root) { root.classList.remove('mx-dragging'); root.querySelectorAll('.dragging').forEach((x) => x.classList.remove('dragging')); }
    dr.on = false; dr.ghost = null; dr.last = null; dr.id = null;
  }
  function dragDrop(x, y) {
    const m = st(), p = m && findP(m, dr.id), t = dropTarget(x, y); if (!p || !t || !m.squad.includes(p)) return;
    const xi = lineup(m).map((q) => q.id), from = xi.indexOf(p.id); let note = '';
    if (t.kind === 'slot') {
      if (t.slot >= xi.length) return;
      if (from >= 0) { if (from === t.slot) return; const tmp = xi[t.slot]; xi[t.slot] = xi[from]; xi[from] = tmp; note = 'Đã đổi chỗ hai cầu thủ trên sân.'; }
      else {
        if (p.inj) return toast(p.name + ' đang chấn thương, chưa thể ra sân.', 'bad');
        const out = m.squad.find((q) => q.id === xi[t.slot]); xi[t.slot] = p.id; if (out && out.lock === 'start') out.lock = null; note = esc(p.name) + ' vào sân thay ' + (out ? esc(out.name) : 'đồng đội') + '.';
      }
      if (p.lock === 'bench') p.lock = null;
    } else {
      if (from < 0) return;
      const tp = t.id && findP(m, t.id); let rep = tp && m.squad.includes(tp) && !xi.includes(tp.id) ? tp : null;
      if (!rep) rep = m.squad.filter((q) => !xi.includes(q.id) && !q.inj && q.lock !== 'bench').sort((a, b) => b.ovr - a.ovr)[0];
      if (!rep || rep.inj) return toast('Không còn dự bị khoẻ mạnh để thay người.', 'bad');
      xi[from] = rep.id; if (rep.lock === 'bench') rep.lock = null; if (p.lock === 'start') p.lock = null; note = esc(p.name) + ' xuống dự bị, ' + esc(rep.name) + ' vào sân.';
    }
    m.xi = xi; save(); ui.sel = null; open(); sfx('click'); toast(note.replace(/&amp;/g, '&'), 'ok');
  }
  function onPD(e) {
    if (e.button > 0 || (tab !== 'squad' && tab !== 'tactic')) return;
    const el = e.target.closest('.mx-pm,.mx-bp,.mx-row'); if (!el || !el.dataset.id) return;
    dr.id = el.dataset.id; dr.sx = e.clientX; dr.sy = e.clientY; dr.touch = e.pointerType === 'touch' || e.pointerType === 'pen';
    if (dr.touch) dr.timer = setTimeout(() => { if (dr.id) dragStart(); }, 230);
    const mv = (ev) => {
      if (!dr.on) { const d = Math.hypot(ev.clientX - dr.sx, ev.clientY - dr.sy); if (dr.touch) { if (d > 9) { fin(); } } else if (d > 5) dragStart(); }
      if (dr.on) { ev.preventDefault(); dragMove(ev); }
    };
    const fin = (ev) => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      const was = dr.on; if (was && ev && ev.type === 'pointerup') { dragDrop(ev.clientX, ev.clientY); const stop = (c) => { c.stopPropagation(); c.preventDefault(); }; window.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => window.removeEventListener('click', stop, true), 80); }
      dragEnd();
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  }
  function close() { if (root) { root.remove(); root = null; } try { KN.UI && KN.UI.render && KN.UI.render(); } catch (e) { /* */ } }
  function onKey(e) { e.stopPropagation(); if (e.key !== 'Escape') return; if (root.querySelector('.mx-dlg')) return; if (ui.sel) { ui.sel = null; drawer(); root.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel')); } else close(); }
  function refreshList() { const m = st(), l = root && root.querySelector('#mxList'); if (m && l) l.innerHTML = tab === 'market' ? marketListHtml(m) : squadListHtml(m); }
  function onInput(e) {
    const m = st(), t = e.target; if (!m) return;
    if (t.matches('[data-q]')) { ui.q = t.value; refreshList(); } else if (t.matches('[data-mq]')) { ui.mq = t.value; refreshList(); }
    else if (t.id === 'mgrPress') { root.querySelector('#mgrPv').textContent = t.value; const keep = m.tactic.press; m.tactic.press = +t.value; const pw = power(m); m.tactic.press = keep; root.querySelector('#pwA').textContent = Math.round(pw.att); root.querySelector('#pwD').textContent = Math.round(pw.def); }
  }
  function onChange(e) {
    const m = st(), t = e.target; if (!m) return;
    if (t.id === 'mgrPress') { m.tactic.press = +t.value; save(); toast('Pressing ' + t.value + ' đã áp dụng cho các trận tới'); return; }
    if (t.matches('[data-sort]')) ui.sort = t.value; else if (t.matches('[data-mage]')) ui.mage = +t.value; else if (t.matches('[data-mmin]')) ui.mmin = +t.value; else if (t.matches('[data-mmax]')) ui.mmax = +t.value; else return;
    refreshList();
  }
  // lời dặn trước trận: mỗi cách nói có lợi và có hại riêng, tác động thật lên chỉ số cầu thủ trong trận
  const TALKS = {
    hype: ['Động viên, truyền lửa', 'Cả đội hưng phấn: +2 chỉ số mọi cầu thủ, tinh thần tăng.', { all: 2, att: 0, def: 0 }],
    calm: ['Giữ bình tĩnh, chắc phòng ngự', 'Kỷ luật hàng thủ: +3 chỉ số cầu thủ phòng ngự, tiền đạo bớt máu lửa.', { all: 0, att: -1, def: 3 }],
    press: ['Gây áp lực, đòi phải thắng', 'Tấn công bùng nổ: +4 chỉ số tiền đạo, −2 hậu vệ; có nguy cơ làm vài cầu thủ nặng đầu.', { all: 0, att: 4, def: -2 }],
  };
  function talkBox(m, go) {
    const fx = myFix(m, m.round), w = document.createElement('div'); w.className = 'mx-dlg';
    w.innerHTML = '<div class="mx-dlg-box" role="dialog" aria-modal="true" aria-label="Lời dặn trước trận"><h3>Lời dặn trước trận</h3><p>Phòng thay đồ đang chờ bạn' + (fx ? ' trước trận gặp <b>' + esc(fx.opp.name) + '</b>' : '') + '. Bạn nói gì?</p><div class="mx-talks">' + Object.keys(TALKS).map((k) => '<button type="button" class="mx-sty" data-talk="' + k + '"><b>' + TALKS[k][0] + '</b><small>' + TALKS[k][1] + '</small></button>').join('') + '</div><div class="mx-dlg-act"><button type="button" class="mx-btn" data-talk="none">Không nói gì, vào sân luôn</button></div></div>';
    w.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); w.remove(); } });
    w.querySelectorAll('[data-talk]').forEach((b) => (b.onclick = () => {
      const k = b.dataset.talk; w.remove();
      if (TALKS[k]) {
        m.talk = Object.assign({}, TALKS[k][2]);
        if (k === 'hype') m.squad.forEach((q) => { q.morale = U.clamp(q.morale + 3, 30, 100); });
        if (k === 'press' && Math.random() < 0.3) { const q = pick(m.squad); q.morale = U.clamp(q.morale - 6, 30, 100); toast(q.name + ' bị áp lực nặng và có vẻ mất tự tin.', 'bad'); }
        sfx('click');
      } else delete m.talk;
      go();
    }));
    root.appendChild(w); w.querySelector('[data-talk]').focus();
  }
  function buy(m, p, price, label) {
    if (!p || !m.market.includes(p) || m.squad.includes(p)) return toast('Cầu thủ này không còn trên thị trường.', 'bad');
    if (!m.window) return toast('Kỳ chuyển nhượng đang đóng.', 'bad');
    if (m.squad.length >= 14) return toast('Đội hình đã đủ 14 người, hãy bán bớt trước.', 'bad');
    if (m.budget < price) return toast('Không đủ ngân sách: cần ' + money(price) + ', còn ' + money(m.budget) + '.', 'bad');
    m.budget -= price; m.market = m.market.filter((x) => x !== p); p.morale = 75; m.squad.push(p); sfx('cheer');
    news(m, 'Chiêu mộ ' + p.name + ' (' + POS_VN[p.pos] + ', chỉ số ' + p.ovr + ') với giá ' + money(price) + (label || '') + '.'); ui.sel = null; save(); open(); toast('Ký hợp đồng thành công: ' + p.name + ' (' + money(price) + ')', 'ok');
  }
  function onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) return; const m = st(); if (!m) return; const a = el.dataset.act, id = el.dataset.id, v = el.dataset.v, p = id && findP(m, id);
    if (a === 'close') return close();
    if (a === 'tab') { sfx('click'); ui.offers = null; return open(v); }
    if (a === 'sel') { ui.sel = id; ui.ctx = el.dataset.ctx; root.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel')); root.querySelectorAll('[data-id="' + id + '"]').forEach((x) => (x.closest('.mx-row,.mx-card,.mx-bp,.mx-pm') || x).classList.add('sel')); return drawer(); }
    if (a === 'drx') { ui.sel = null; root.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel')); return drawer(); }
    if (a === 'listtog') { ui.list = !ui.list; return root.querySelector('.mx-list').classList.toggle('open', ui.list); }
    if (a === 'pos') { ui.pos = v; root.querySelectorAll('[data-act=pos]').forEach((x) => x.classList.toggle('on', x.dataset.v === v)); return refreshList(); }
    if (a === 'mpos') { ui.mpos = v; root.querySelectorAll('[data-act=mpos]').forEach((x) => x.classList.toggle('on', x.dataset.v === v)); return refreshList(); }
    if (a === 'lock' && p) { p.lock = p.lock === v ? null : v; delete m.xi; save(); return open(); }
    if (a === 'resign') return confirmBox('Từ chức ở ' + m.club + '?', 'Bạn rời CLB này và xem lời mời từ nơi khác. Đội hình, quỹ và bảng đấu của CLB cũ không mang theo; danh hiệu và uy tín vẫn giữ. Mùa giải đang đá dở sẽ bị huỷ.', 'Xem lời mời', () => { ui.offers = { sacked: false }; open(); }, true);
    if (a === 'club-cancel') { ui.offers = null; return open(); }
    if (a === 'club-pick') { const nm = el.dataset.name; if (nm === m.club && m.pick) { delete m.pick; ui.offers = null; save(); open(); return toast('Bạn dẫn dắt ' + nm + '.', 'ok'); } ui.offers = null; ui.sel = null; const nm2 = G().mgrClub ? G().mgrClub(nm, { demote: m.national }) : null; tab = 'home'; open(); return toast(nm2 ? 'Bạn chính thức dẫn dắt ' + nm + '.' : 'Không đổi được CLB.', nm2 ? 'ok' : 'bad'); }
    if (a === 'club-quit') return confirmBox('Nghỉ làm huấn luyện viên?', 'Bạn rời ghế HLV và trở thành người không nghề nghiệp. Có thể ứng tuyển lại sau, nhưng sẽ bắt đầu lại với một CLB mới.', 'Nghỉ việc', () => { ui.offers = null; close(); try { G().mgrQuit(); } catch (e) { /* */ } }, true);
    if (a === 'diff') { m.diff = +v; save(); open(); return toast('Độ khó: ' + DIFF[+v][0] + '. Áp dụng từ mùa giải kế tiếp cho đối thủ mới.', 'ok'); }
    if (a === 'train') { m.train = v; save(); open(); return toast('Buổi tập: ' + TRAIN[v][0], 'ok'); }
    if (a === 'autoxi') { delete m.xi; save(); open(); return toast('Đã trả về tự chọn đội hình theo chỉ số và tinh thần.', 'ok'); }
    if (a === 'form') { m.tactic.form = v; save(); return open(); }
    if (a === 'style') { m.tactic.style = v; save(); return open(); }
    if (a === 'sell' && p) {
      if (!m.window) return toast('Kỳ chuyển nhượng đang đóng.', 'bad');
      if (m.squad.length <= 6) return toast('Đội hình tối thiểu 6 người.', 'bad');
      const price = Math.round(p.val * R(0.8, 1.1) / 1e6) * 1e6;
      return confirmBox('Rao bán ' + p.name + '?', 'Một CLB đồng ý trả ' + money(price) + ' (chỉ số ' + p.ovr + ', ' + p.age + ' tuổi). Đây là giá cuối cùng.', 'Đồng ý bán', () => { if (!m.squad.includes(p)) return; m.squad = m.squad.filter((x) => x !== p); m.budget += price; sfx('coin'); news(m, 'Bán ' + p.name + ' cho CLB khác với giá ' + money(price) + '.'); ui.sel = null; save(); open(); toast('Đã bán ' + p.name + ' ' + money(price), 'ok'); }, true);
    }
    if (a === 'buy' && p) return confirmBox('Mua ' + p.name + '?', POS_VN[p.pos] + ' · chỉ số ' + p.ovr + ' · ' + p.age + ' tuổi. Giá ' + money(p.val) + ' (ngân sách còn ' + money(m.budget) + ').', 'Ký hợp đồng', () => buy(m, p, p.val));
    if (a === 'bid' && p) return confirmBox('Trả giá ' + p.name + '?', 'Bạn đề nghị ' + money(Math.round(p.val * 0.8 / 1e6) * 1e6) + ' (thấp hơn 20%). CLB chủ quản có thể từ chối, khi đó cầu thủ sẽ sang đội khác.', 'Gửi đề nghị', () => {
      if (!m.market.includes(p)) return;
      if (Math.random() < 0.45) buy(m, p, Math.round(p.val * 0.8 / 1e6) * 1e6, ' (trả giá thành công)');
      else { m.market = m.market.filter((x) => x !== p); ui.sel = null; save(); open(); toast('CLB chủ quản từ chối đề nghị, ' + p.name + ' đã sang đội khác.', 'bad'); }
    });
    if (a === 'call' && p) { if (m.squad.length >= 12) return toast('Tối đa 12 người, hãy loại bớt trước.', 'bad'); if (m.squad.some((x) => x.name === p.name)) return toast('Cầu thủ này đã có trong đội.', 'bad'); m.squad.push(Object.assign({}, p, { id: pid() })); ui.sel = null; save(); open(); return toast('Đã triệu tập ' + p.name, 'ok'); }
    if (a === 'drop' && p) { if (m.squad.length <= 6) return toast('Cần ít nhất 6 người.', 'bad'); return confirmBox('Loại ' + p.name + ' khỏi đội?', 'Cầu thủ sẽ rời danh sách triệu tập.', 'Loại', () => { m.squad = m.squad.filter((x) => x.id !== p.id); ui.sel = null; save(); open(); }, true); }
    if (a === 'play') return KN.Hax && KN.Hax.watch ? talkBox(m, () => watchHax(m)) : (open('league'), live(m));
    if (a === 'quick') { const before = m.table[0].pts, gf0 = m.table[0].gf, ga0 = m.table[0].ga; quickRound(m); const d = m.table[0].pts - before; m.lastMatch = 'Vòng ' + m.round + ': ' + (d === 3 ? 'Thắng' : d === 1 ? 'Hoà' : 'Thua') + ' ' + (m.table[0].gf - gf0) + '–' + (m.table[0].ga - ga0); save(); return open(); }
    if (a === 'season') return confirmBox('Đá hết mùa?', 'Mô phỏng nhanh toàn bộ ' + (m.fixtures.length - m.round) + ' vòng còn lại. Bạn sẽ không điều khiển trận nào.', 'Đá hết mùa', () => { while (m.round < m.fixtures.length && !m.sacked) quickRound(m); m.lastMatch = 'Đã đá hết mùa: hạng ' + myPos(m) + '/' + m.table.length + '.'; save(); open(); }, true);
    if (a === 'cont') { close(); const b = document.getElementById('btnAge'); if (b && !b.disabled) b.click(); }
  }

  // trận đấu trực tiếp: dòng bình luận chạy theo phút, nghỉ giữa hiệp được đổi lối chơi
  function live(m) {
    const rd = m.fixtures[m.round], mine = rd.find(([a, b]) => a === 0 || b === 0), home = mine[0] === 0, opp = m.teams[(home ? mine[1] : mine[0]) - 1];
    const b = root.querySelector('#mgrBody');
    let score = [0, 0], evs = half(m, opp, home, 0), minute = 0, hIdx = 0, timer = 0, all = [];
    const head = () => '<div class="mgr-score"><span>' + esc(home ? m.club : opp.name) + '</span><b>' + (home ? score[0] : score[1]) + ' – ' + (home ? score[1] : score[0]) + '</b><span>' + esc(home ? opp.name : m.club) + '</span></div><div class="mgr-min" id="mgrMin">' + minute + "'</div>";
    b.innerHTML = head() + '<div class="mgr-feed" id="mgrFeed"></div><div class="btnrow" id="mgrCtl"></div>';
    const feed = () => b.querySelector('#mgrFeed'), add = (t, cls) => { const d = document.createElement('div'); d.className = cls || ''; d.innerHTML = t; feed().prepend(d); };
    add('🏟️ Trọng tài nổi còi khai cuộc. ' + STYLES[m.tactic.style].name + ' · ' + m.tactic.form + ' vs ' + STYLES[opp.style].name + '.');
    const tick = () => {
      minute++;
      evs.filter((e) => e.min === minute).forEach((e) => {
        if (e.t === 'goal') { if (e.me) score[0]++; else score[1]++; sfx(e.me ? 'cheer' : 'bad'); }
        add('<b>' + minute + "'</b> " + line(e, opp.name), e.t === 'goal' ? (e.me ? 'g-me' : 'g-op') : ''); all.push(e);
      });
      const sc = b.querySelector('.mgr-score'); if (sc) sc.outerHTML = head().split('<div class="mgr-min"')[0];
      const mn = b.querySelector('#mgrMin'); if (mn) mn.textContent = minute + "'";
      if (minute === 45 && hIdx === 0) { clearInterval(timer); halftime(); }
      else if (minute >= 90) { clearInterval(timer); fulltime(); }
    };
    const run = () => { timer = setInterval(tick, 110); };
    function halftime() {
      add('⏸️ Hết hiệp 1. Phòng thay đồ — bạn có muốn đổi lối chơi?');
      const c = b.querySelector('#mgrCtl');
      c.innerHTML = Object.keys(STYLES).map((s) => '<button type="button" class="btn btn-soft btn-sm' + (m.tactic.style === s ? ' on' : '') + '" data-ht="' + s + '">' + STYLES[s].name + '</button>').join('') + '<button type="button" class="btn btn-primary btn-sm" id="mgrGo">▶ Đá hiệp 2</button>';
      c.querySelectorAll('[data-ht]').forEach((x) => (x.onclick = () => { m.tactic.style = x.dataset.ht; c.querySelectorAll('[data-ht]').forEach((y) => y.classList.toggle('on', y === x)); }));
      c.querySelector('#mgrGo').onclick = () => { c.innerHTML = ''; hIdx = 1; evs = half(m, opp, home, 1); add('▶ Hiệp 2 bắt đầu với ' + STYLES[m.tactic.style].name + '.'); run(); };
    }
    function fulltime() {
      // ghi kết quả + các trận khác trong vòng
      all.filter((e) => e.t === 'goal' && e.me).forEach((e) => { const p = m.squad.find((x) => x.id === e.pid); if (p) p.goals++; });
      rd.forEach(([a, bb]) => { if (a === 0 || bb === 0) record(m, a, bb, home ? score[0] : score[1], home ? score[1] : score[0]); else { const [x, y] = simAI(m, a, bb); record(m, a, bb, x, y); } });
      afterMatch(m, score[0], score[1]); m.round++; updWindow(m);
      const r = score[0] > score[1] ? '✅ THẮNG' : score[0] < score[1] ? '❌ THUA' : '🤝 HOÀ';
      m.lastMatch = 'Vòng ' + m.round + ': ' + r + ' ' + score[0] + '–' + score[1] + ' trước ' + esc(opp.name) + '.';
      add('🏁 Hết giờ! ' + r + ' ' + score[0] + '–' + score[1] + '.', score[0] > score[1] ? 'g-me' : score[0] < score[1] ? 'g-op' : '');
      sfx(score[0] > score[1] ? 'cheer' : score[0] < score[1] ? 'fail' : 'notify');
      if (score[0] > score[1] && KN.Weekly) KN.Weekly.track('haxwin');
      save();
      b.querySelector('#mgrCtl').innerHTML = '<button type="button" class="btn btn-primary" id="mgrBack">Về bảng xếp hạng</button>';
      b.querySelector('#mgrBack').onclick = () => open('league');
    }
    run();
  }

  // xem trận bằng Haxball: 4 cầu thủ đá chính của bạn (máy điều khiển) đấu 4 người của đối thủ, bạn chỉ đạo từ đường biên
  async function watchHax(m) {
    const rd = m.fixtures[m.round], mine = rd.find(([a, b]) => a === 0 || b === 0), home = mine[0] === 0, opp = m.teams[(home ? mine[1] : mine[0]) - 1];
    const xi = lineup(m), me = haxTeam(m.club, xi), them = { name: opp.name, players: oppXI(opp) };
    // lời dặn trước trận + buổi tập chiến thuật tác động trực tiếp lên chỉ số thi đấu
    const tk = m.talk || { all: 0, att: 0, def: 0 }, tb = m.train === 'tact' ? 1 : 0;
    me.players.forEach((pl) => { pl.ovr += tk.all + tb + (pl.role === 'att' ? tk.att : 0) + (pl.role === 'def' ? tk.def : 0); });
    delete m.talk;
    const prevStyle = m.tactic.style;
    if (root) root.style.display = 'none';
    const r = await KN.Hax.watch({ home: home ? me : them, away: home ? them : me, coachTeam: home ? 0 : 1, dur: 90, map: 'big', title: (m.national ? 'AFF Cup' : 'V-League') + ' vòng ' + (m.round + 1) });
    if (root) root.style.display = '';
    r.scorers.forEach((s) => { const p = m.squad.find((x) => x.id === s.id); if (p) p.goals += s.n; });
    // chấm điểm từng cầu thủ (từ thống kê thật trong trận): ảnh hưởng tinh thần, lưu điểm gần đây và số lần được chọn MVP
    m.lastRate = (r.ratings || []).map((x) => ({ id: x.id, name: x.name, r: x.r, g: x.g, a: x.a }));
    (r.ratings || []).forEach((x) => { const p = m.squad.find((q) => q.id === x.id); if (!p) return; p.rts = (p.rts || []).slice(-4).concat(x.r); p.morale = U.clamp(p.morale + (x.r >= 8 ? 4 : x.r >= 7 ? 2 : x.r < 5.5 ? -3 : 0), 30, 100); });
    if (r.mvp && r.mvp.mine) { const mp = m.squad.find((q) => q.id === r.mvp.id); if (mp) { mp.mvps = (mp.mvps || 0) + 1; news(m, 'Cầu thủ xuất sắc nhất trận: ' + mp.name + ' (' + r.mvp.r.toFixed(1) + ' điểm).'); } }
    rd.forEach(([a, bb]) => { if (a === 0 || bb === 0) record(m, a, bb, home ? r.gf : r.ga, home ? r.ga : r.gf); else { const [x, y] = simAI(m, a, bb); record(m, a, bb, x, y); } });
    afterMatch(m, r.gf, r.ga); m.round++; updWindow(m); m.tactic.style = prevStyle;
    const res = r.gf > r.ga ? '✅ THẮNG' : r.gf < r.ga ? '❌ THUA' : '🤝 HOÀ';
    m.lastMatch = 'Vòng ' + m.round + ': ' + res + ' ' + r.gf + '–' + r.ga + ' trước ' + esc(opp.name) + (r.mvp ? ' · MVP trận: ' + esc(r.mvp.name) + ' (' + r.mvp.r.toFixed(1) + ')' : '') + (r.scorers.length ? ' · ghi bàn: ' + r.scorers.map((s) => esc(s.name.split(' ').pop()) + (s.n > 1 ? ' ×' + s.n : '')).join(', ') : '') + '.';
    if (r.gf > r.ga && KN.Weekly) KN.Weekly.track('haxwin');
    save(); open('league');
  }
  KN.Manager = { init, open, close, endSeason, power, STYLES, FORMS, _sim: { quickRound, myPos, lineup } };
})();
