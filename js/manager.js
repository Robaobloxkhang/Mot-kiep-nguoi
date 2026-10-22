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
  function valueOf(p) { const age = p.age <= 23 ? 1.4 : p.age <= 28 ? 1.15 : p.age <= 31 ? 0.8 : 0.45; return Math.round(Math.pow(Math.max(30, p.ovr) - 30, 2.25) * 1.6e5 * age / 1e6) * 1e6; }
  function makePlayer(pos, ovr, age, foreign) {
    const p = { id: pid(), name: foreign ? pick(FOREIGN) : vnName(), pos, ovr: Math.round(U.clamp(ovr, 35, 92)), age, pot: Math.round(U.clamp(ovr + (age < 23 ? R(3, 16) : age < 27 ? R(0, 5) : 0), 35, 94)), morale: RI(60, 80), goals: 0, apps: 0, foreign: !!foreign };
    p.val = Math.max(5e7, valueOf(p)); return p;
  }
  function makeSquad(level) {
    const base = 52 + level * 7, out = [], per = { DF: 4, MF: 5, FW: 3 };
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
    return names.map((n) => ({ name: n, str: m.national ? strong[n] + R(-3, 3) : 52 + m.level * 6 + R(-7, 10), style: pick(Object.keys(STYLES)) }));
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
    m.fixtures = fixturesFor(all.length, !m.national); m.log = []; m.lastMatch = null; m.done = false;
    m.goal = m.national ? (m.level >= 2 ? 'title' : 'top4') : m.board < 40 ? 'avoid' : m.squadStr > 66 ? 'title' : m.squadStr > 58 ? 'top4' : 'mid';
    m.market = marketList(m); m.window = true;
    m.squad.forEach((p) => { p.goals = 0; p.apps = 0; });
  }
  function marketList(m) {
    if (m.national) return nationalPool(m.season).slice(0, 18);
    const lv = 54 + m.level * 6, out = [];
    for (let i = 0; i < 12; i++) out.push(makePlayer(pick(['DF', 'DF', 'MF', 'MF', 'FW', 'FW']), lv + R(-10, 16), RI(17, 34), Math.random() < 0.25));
    return out.sort((a, b) => b.ovr - a.ovr);
  }
  function init(info) {
    const level = Math.min(2, info.level || 0), national = level >= 2;
    const m = { v: 1, club: national ? 'Đội tuyển Việt Nam' : info.club || pick(CLUBS), national, level, board: 60, budget: national ? 0 : Math.round((8e9 + level * 1.2e10) / 1e8) * 1e8, squad: national ? nationalPool().slice(0, 12) : makeSquad(level), tactic: { form: '1-2-1', style: 'balanced', press: 50 }, history: [], trophies: 0 };
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
    return xi.slice(0, 4);
  }
  const avg = (a) => (a.length ? a.reduce((s, p) => s + p.ovr * (0.9 + p.morale / 500), 0) / a.length : 40);
  function squadStr(m) { const xi = lineup(m); return Math.round(avg(xi)); }
  function power(m) {
    const xi = lineup(m), by = (pos) => xi.filter((p) => p.pos === pos), f = FORMS[m.tactic.form], st = STYLES[m.tactic.style];
    const miss = 4 - xi.length; // thiếu người (chấn thương)
    const all4 = avg(xi), att = (by('FW').length ? avg(by('FW')) : all4) * 0.5 + (by('MF').length ? avg(by('MF')) : all4) * 0.35 + all4 * 0.15 + f.att + st.att + (m.tactic.press - 50) / 12 - miss * 4;
    const def = (by('DF').concat(by('GK')).length ? avg(by('DF').concat(by('GK'))) : all4) * 0.6 + all4 * 0.4 + f.def + st.def - (m.tactic.press - 50) / 20 - miss * 4;
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
    if (Math.random() < (m.tactic.style === 'press' ? 0.12 : 0.05) + (m.tactic.press > 70 ? 0.06 : 0)) { const p = pick(me.xi.filter((x) => x.pos !== 'GK')); if (p) { p.inj = RI(1, 4); ev.push({ min: h * 45 + RI(5, 45), t: 'inj', me: true, who: p.name }); } }
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
    if (!m.national) m.budget += Math.round((prize + 3e9 + m.level * 3e9) / 1e8) * 1e8;
    if (champ) m.trophies++;
    m.history.push({ season: m.season, pos, goal: m.goal, ok: goalOk, champ });
    const top = m.squad.slice().sort((a, b) => b.goals - a.goals)[0];
    // phát triển cầu thủ + giải nghệ + đôn lên từ đội trẻ
    m.squad.forEach((p) => { p.age++; p.ovr = Math.round(U.clamp(p.ovr + (p.age <= 23 ? R(1, 5) * (p.pot > p.ovr ? 1 : 0.3) : p.age <= 29 ? R(-1, 2) : R(-5, 0)), 35, 94)); p.val = Math.max(5e7, valueOf(p)); p.inj = 0; p.lock = p.lock === 'start' ? 'start' : null; });
    const retired = m.squad.filter((p) => p.age >= 35 || (p.age >= 33 && Math.random() < 0.4));
    m.squad = m.squad.filter((p) => !retired.includes(p));
    if (!m.national) for (let i = 0; i < 2; i++) m.squad.push(makePlayer(pick(POS.slice(1)), 48 + m.level * 5 + R(-4, 8), 17));
    const bonus = Math.round((champ ? 5e8 : goalOk ? 1.5e8 : 0) * (1 + m.level * 0.6) / 1e7) * 1e7;
    const text = '📋 Mùa giải ' + m.season + ' khép lại: ' + m.club + ' xếp thứ ' + pos + '/' + n + (champ ? ' — VÔ ĐỊCH! 🏆' : '') + '. Mục tiêu ban lãnh đạo (' + GOAL_TXT[m.goal] + '): ' + (goalOk ? 'đạt ✅' : 'không đạt ❌') + '.' + (top && top.goals ? ' Vua phá lưới của đội: ' + top.name + ' (' + top.goals + ' bàn).' : '') + (retired.length ? ' Giải nghệ: ' + retired.map((p) => p.name).slice(0, 3).join(', ') + '.' : '');
    const res = { text, bonus, champ, goalOk, pos, perf: champ ? 20 : goalOk ? 10 : -18, happy: champ ? 10 : goalOk ? 4 : -6, sack: m.board < 20 };
    m.squadStr = squadStr(m); newSeason(m, m.season + 1);
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
    const res = gf > ga ? 1 : gf < ga ? -1 : 0;
    m.squad.forEach((p) => { if (p.inj > 0) p.inj--; });
    lineup(m).forEach((p) => { p.apps++; p.morale = U.clamp(p.morale + res * 4, 30, 100); });
    m.squad.filter((p) => !lineup(m).includes(p)).forEach((p) => (p.morale = U.clamp(p.morale - 1, 30, 100)));
    m.board = U.clamp(m.board + res * 2, 0, 100);
  }

  // ------------------------------------------------------------------ giao diện
  let root = null, tab = 'squad';
  const st = () => (G() && G().mgrState ? G().mgrState() : null);
  function close() { if (root) { root.remove(); root = null; } try { KN.UI && KN.UI.render && KN.UI.render(); } catch (e) { /* */ } }
  function open(t) {
    const m = st(); if (!m) return;
    if (t) tab = t;
    if (!root) { root = document.createElement('div'); root.className = 'hax mgr'; document.body.appendChild(root); root.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') close(); }); }
    const pos = myPos(m), n = m.table.length;
    root.innerHTML = '<div class="hax-box mgr-box"><div class="mgr-top"><div><b>📋 ' + esc(m.club) + '</b><small>' + (m.national ? 'AFF Cup ' : 'V-League ') + m.season + ' · vòng ' + Math.min(m.round + 1, m.fixtures.length) + '/' + m.fixtures.length + ' · hạng ' + pos + '/' + n + ' · 🏆×' + m.trophies + '</small></div>' +
      '<div class="mgr-kpi"><span>💰 ' + (m.national ? '—' : money(m.budget)) + '</span><span>👔 Ban lãnh đạo ' + Math.round(m.board) + '%</span><span>🎯 ' + GOAL_TXT[m.goal] + '</span></div><button type="button" class="icon-btn" data-x>✕</button></div>' +
      '<div class="cm-tabs mgr-tabs">' + [['squad', '👥 Đội hình'], ['tactic', '🧠 Chiến thuật'], ['market', m.national ? '📝 Triệu tập' : '💸 Chuyển nhượng'], ['league', '🏆 Giải đấu']].map(([k, l]) => '<button type="button" data-tab="' + k + '" class="' + (tab === k ? 'on' : '') + '">' + l + '</button>').join('') + '</div><div class="mgr-body" id="mgrBody">' + body(m) + '</div></div>';
    root.querySelector('[data-x]').onclick = close;
    root.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { sfx('click'); open(b.dataset.tab); }));
    bind(m);
  }
  function pRow(p, xi, extra) {
    const inXi = xi && xi.includes(p);
    return '<tr class="' + (inXi ? 'xi' : '') + (p.inj ? ' inj' : '') + '"><td>' + POS_IC[p.pos] + ' ' + p.pos + '</td><td class="nm">' + esc(p.name) + (p.foreign ? ' 🌍' : '') + (p.inj ? ' 🩼' + p.inj : '') + '</td><td><b class="ovr o' + Math.floor(p.ovr / 10) + '">' + p.ovr + '</b></td><td>' + p.age + '</td><td>' + (p.pot > p.ovr + 3 ? '↗' + p.pot : '') + '</td><td>' + (p.morale >= 75 ? '😄' : p.morale >= 55 ? '🙂' : '😟') + '</td><td>' + money(p.val) + '</td><td>' + (p.goals || '') + '</td><td>' + (extra || '') + '</td></tr>';
  }
  const TH = '<tr><th>VT</th><th>Tên</th><th>CS</th><th>Tuổi</th><th>Tiềm năng</th><th>TT</th><th>Giá trị</th><th>⚽</th><th></th></tr>';
  function body(m) {
    if (tab === 'squad') {
      const xi = lineup(m), pw = power(m);
      return '<p class="p-sub">Đá 4 người như Haxball · sơ đồ <b>' + m.tactic.form + '</b> · đá chính ' + xi.length + '/4 người · tấn công <b>' + Math.round(pw.att) + '</b> · phòng ngự <b>' + Math.round(pw.def) + '</b>. Hàng sáng là đá chính (tự chọn người tốt nhất theo chỉ số + tinh thần). Bấm 📌 để luôn cho đá chính, 💺 để cho dự bị.</p>' +
        '<div class="mgr-scroll"><table class="mgr-t">' + TH + m.squad.slice().sort((a, b) => POS.indexOf(a.pos) - POS.indexOf(b.pos) || b.ovr - a.ovr).map((p) => pRow(p, xi, '<button type="button" class="mini-b' + (p.lock === 'start' ? ' on' : '') + '" data-lock="' + p.id + '" data-v="start" title="Luôn đá chính">📌</button><button type="button" class="mini-b' + (p.lock === 'bench' ? ' on' : '') + '" data-lock="' + p.id + '" data-v="bench" title="Cho dự bị">💺</button>' + (m.national ? '' : '<button type="button" class="mini-b" data-sell="' + p.id + '" title="Bán">💸</button>'))).join('') + '</table></div>';
    }
    if (tab === 'tactic') {
      const t = m.tactic;
      return '<div class="mgr-tac"><h4>Sơ đồ</h4><div class="hax-set">' + Object.keys(FORMS).map((f) => '<button type="button" data-form="' + f + '" class="' + (t.form === f ? 'on' : '') + '" title="' + FORMS[f].desc + '">' + f + '</button>').join('') + '</div><p class="p-sub">' + FORMS[t.form].desc + '</p>' +
        '<h4>Lối chơi</h4><div class="hax-set">' + Object.keys(STYLES).map((s) => '<button type="button" data-style="' + s + '" class="' + (t.style === s ? 'on' : '') + '">' + STYLES[s].name + '</button>').join('') + '</div>' +
        '<p class="p-sub">Khắc chế: 🔥 Pressing thắng 🎯 Kiểm soát bóng · 🎯 Kiểm soát thắng 🚌 Xe buýt · 🚌 Xe buýt thắng ⚡ Phản công · ⚡ Phản công thắng 🔥 Pressing. Xem lối chơi của đối thủ trước trận ở tab Giải đấu.</p>' +
        '<h4>Cường độ pressing: <b id="mgrPv">' + t.press + '</b></h4><input type="range" min="10" max="95" value="' + t.press + '" id="mgrPress" class="mgr-range"><p class="p-sub">Pressing cao: tấn công mạnh hơn nhưng hở phía sau và dễ chấn thương.</p></div>';
    }
    if (tab === 'market') {
      const xi = lineup(m);
      if (m.national) return '<p class="p-sub">Đội tuyển không mua bán. Triệu tập những cầu thủ Việt Nam đang có phong độ tốt nhất (tối đa 12 người) — loại bớt người trong đội hình ở tab Đội hình bằng nút ❌.</p><div class="mgr-scroll"><table class="mgr-t">' + TH + m.market.filter((p) => !m.squad.some((q) => q.name === p.name)).map((p) => pRow(p, null, '<button type="button" class="btn btn-soft btn-sm" data-call="' + p.id + '">Triệu tập</button>')).join('') + '</table></div><h4>Đang trong đội (' + m.squad.length + '/12)</h4><div class="mgr-scroll"><table class="mgr-t">' + TH + m.squad.map((p) => pRow(p, xi, '<button type="button" class="mini-b" data-drop="' + p.id + '">❌</button>')).join('') + '</table></div>';
      return '<p class="p-sub">' + (m.window ? '🟢 Kỳ chuyển nhượng đang mở' : '🔴 Kỳ chuyển nhượng đóng (mở lại đầu mùa và giữa mùa)') + ' · Ngân sách ' + money(m.budget) + ' · Đội hình ' + m.squad.length + '/14. Trả giá thấp hơn 20% có thể bị từ chối.</p>' +
        '<div class="mgr-scroll"><table class="mgr-t">' + TH + m.market.map((p) => pRow(p, null, m.window ? '<button type="button" class="btn btn-primary btn-sm" data-buy="' + p.id + '">Mua</button><button type="button" class="btn btn-soft btn-sm" data-bid="' + p.id + '">Trả giá −20%</button>' : '')).join('') + '</table></div><p class="cm-err" id="mgrErr"></p>';
    }
    // giải đấu
    const rd = m.fixtures[m.round], mine = rd && rd.find(([a, b]) => a === 0 || b === 0), home = mine && mine[0] === 0, opp = mine && m.teams[(home ? mine[1] : mine[0]) - 1];
    return (m.lastMatch ? '<div class="mgr-last">' + m.lastMatch + '</div>' : '') +
      (opp ? '<div class="mgr-next"><b>Trận tới (vòng ' + (m.round + 1) + '):</b> ' + (home ? esc(m.club) + ' 🆚 ' + esc(opp.name) + ' (sân nhà)' : esc(opp.name) + ' 🆚 ' + esc(m.club) + ' (sân khách)') + '<br><small>Đối thủ: sức mạnh ~' + Math.round(opp.str) + ' · lối chơi ' + STYLES[opp.style].name + (BEATS[m.tactic.style] === opp.style ? ' · ✅ lối chơi của bạn đang khắc chế họ' : BEATS[opp.style] === m.tactic.style ? ' · ⚠️ họ đang khắc chế lối chơi của bạn' : '') + '</small><div class="btnrow"><button type="button" class="btn btn-primary" id="mgrPlay">▶ Xem & chỉ đạo trận (Haxball 4 đấu 4)</button><button type="button" class="btn btn-soft" id="mgrQuick">⏩ Chỉ xem kết quả</button><button type="button" class="btn btn-ghost" id="mgrSeason">⏭️ Đá hết mùa</button></div></div>' : '<div class="mgr-next">✅ Mùa giải đã đá xong. Sang năm mới (bấm +1 tuổi) để tổng kết và bắt đầu mùa sau.</div>') +
      '<table class="mgr-t mgr-tab"><tr><th>#</th><th>Đội</th><th>Tr</th><th>T</th><th>H</th><th>B</th><th>HS</th><th>Đ</th></tr>' + sorted(m).map((r, k) => '<tr class="' + (r.i === 0 ? 'me' : '') + '"><td>' + (k + 1) + '</td><td class="nm">' + esc(r.name) + '</td><td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + (r.gf - r.ga) + '</td><td><b>' + r.pts + '</b></td></tr>').join('') + '</table>' +
      (m.history.length ? '<p class="p-sub">Lịch sử: ' + m.history.slice(-5).map((h) => h.season + ': hạng ' + h.pos + (h.champ ? ' 🏆' : '')).join(' · ') + '</p>' : '');
  }
  function bind(m) {
    const $ = (s) => root.querySelector(s), all = (s) => root.querySelectorAll(s), err = (t) => { const e = $('#mgrErr'); if (e) e.textContent = t; };
    all('[data-lock]').forEach((b) => (b.onclick = () => { const p = m.squad.find((x) => x.id === b.dataset.lock); p.lock = p.lock === b.dataset.v ? null : b.dataset.v; open(); }));
    all('[data-sell]').forEach((b) => (b.onclick = () => { const p = m.squad.find((x) => x.id === b.dataset.sell); if (!m.window) { alert('Kỳ chuyển nhượng đang đóng.'); return; } if (m.squad.length <= 6) { alert('Đội hình tối thiểu 6 người.'); return; } const price = Math.round(p.val * R(0.8, 1.1) / 1e6) * 1e6; if (!confirm('Bán ' + p.name + ' (' + p.ovr + ') với giá ' + money(price) + '?')) return; m.squad = m.squad.filter((x) => x !== p); m.budget += price; sfx('coin'); open(); }));
    const buy = (p, price) => { if (m.squad.length >= 14) return err('Đội hình đã đủ 14 người, bán bớt trước.'); if (m.budget < price) return err('Không đủ ngân sách (cần ' + money(price) + ').'); m.budget -= price; m.market = m.market.filter((x) => x !== p); p.morale = 75; m.squad.push(p); sfx('cheer'); try { G().mgrNews('✍️ ' + m.club + ' chiêu mộ ' + p.name + ' (' + POS_VN[p.pos] + ', chỉ số ' + p.ovr + ') với giá ' + money(price) + '.'); } catch (e) { /* */ } open(); };
    all('[data-buy]').forEach((b) => (b.onclick = () => { const p = m.market.find((x) => x.id === b.dataset.buy); buy(p, p.val); }));
    all('[data-bid]').forEach((b) => (b.onclick = () => { const p = m.market.find((x) => x.id === b.dataset.bid); if (Math.random() < 0.45) buy(p, Math.round(p.val * 0.8 / 1e6) * 1e6); else { m.market = m.market.filter((x) => x !== p); err('❌ CLB chủ quản từ chối lời đề nghị, ' + p.name + ' đã sang đội khác.'); open(); err('❌ CLB chủ quản từ chối, ' + p.name + ' đã sang đội khác.'); } }));
    all('[data-call]').forEach((b) => (b.onclick = () => { if (m.squad.length >= 12) { alert('Tối đa 12 người, loại bớt trước.'); return; } const p = m.market.find((x) => x.id === b.dataset.call); m.squad.push(Object.assign({}, p, { id: pid() })); open(); }));
    all('[data-drop]').forEach((b) => (b.onclick = () => { if (m.squad.length <= 6) { alert('Cần ít nhất 6 người.'); return; } m.squad = m.squad.filter((x) => x.id !== b.dataset.drop); open(); }));
    all('[data-form]').forEach((b) => (b.onclick = () => { m.tactic.form = b.dataset.form; open(); }));
    all('[data-style]').forEach((b) => (b.onclick = () => { m.tactic.style = b.dataset.style; open(); }));
    const pr = $('#mgrPress'); if (pr) { pr.oninput = () => { $('#mgrPv').textContent = pr.value; }; pr.onchange = () => { m.tactic.press = +pr.value; }; }
    const pl = $('#mgrPlay'); if (pl) pl.onclick = () => (KN.Hax && KN.Hax.watch ? watchHax(m) : live(m));
    const qk = $('#mgrQuick'); if (qk) qk.onclick = () => { const before = m.table[0].pts, gf0 = m.table[0].gf, ga0 = m.table[0].ga; quickRound(m); const d = m.table[0].pts - before; m.lastMatch = 'Vòng ' + m.round + ': ' + (d === 3 ? '✅ Thắng' : d === 1 ? '🤝 Hoà' : '❌ Thua') + ' ' + (m.table[0].gf - gf0) + '–' + (m.table[0].ga - ga0); save(); open(); };
    const ss = $('#mgrSeason'); if (ss) ss.onclick = () => { if (!confirm('Đá nhanh toàn bộ các vòng còn lại?')) return; while (m.round < m.fixtures.length) quickRound(m); m.lastMatch = 'Đã đá hết mùa: hạng ' + myPos(m) + '/' + m.table.length + '.'; save(); open(); };
  }
  const save = () => { try { G().mgrSave(); } catch (e) { /* */ } };

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
    const prevStyle = m.tactic.style;
    if (root) root.style.display = 'none';
    const r = await KN.Hax.watch({ home: home ? me : them, away: home ? them : me, coachTeam: home ? 0 : 1, dur: 90, map: m.national ? 'big' : 'classic', title: (m.national ? 'AFF Cup' : 'V-League') + ' vòng ' + (m.round + 1) });
    if (root) root.style.display = '';
    r.scorers.forEach((s) => { const p = m.squad.find((x) => x.id === s.id); if (p) p.goals += s.n; });
    rd.forEach(([a, bb]) => { if (a === 0 || bb === 0) record(m, a, bb, home ? r.gf : r.ga, home ? r.ga : r.gf); else { const [x, y] = simAI(m, a, bb); record(m, a, bb, x, y); } });
    afterMatch(m, r.gf, r.ga); m.round++; updWindow(m); m.tactic.style = prevStyle;
    const res = r.gf > r.ga ? '✅ THẮNG' : r.gf < r.ga ? '❌ THUA' : '🤝 HOÀ';
    m.lastMatch = 'Vòng ' + m.round + ': ' + res + ' ' + r.gf + '–' + r.ga + ' trước ' + esc(opp.name) + (r.scorers.length ? ' · ghi bàn: ' + r.scorers.map((s) => esc(s.name.split(' ').pop()) + (s.n > 1 ? ' ×' + s.n : '')).join(', ') : '') + '.';
    if (r.gf > r.ga && KN.Weekly) KN.Weekly.track('haxwin');
    save(); open('league');
  }
  KN.Manager = { init, open, close, endSeason, power, STYLES, FORMS, _sim: { quickRound, myPos, lineup } };
})();
