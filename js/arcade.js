/* Một Kiếp Người — màn hình chính gọn gàng + 🕹️ TỔNG HỢP MINIGAME (KN.Arcade)
   - 3 ô nhóm ở màn hình chính (Chế độ chơi · Minigame · Online): bấm để mở nhóm, mỗi lúc chỉ mở một nhóm, nhớ nhóm mở lần trước.
   - "Chơi thử mọi minigame": lưới tất cả minigame trong game, chọn độ khó, lưu điểm cao nhất của từng trò (trên máy này). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sfx = (n) => { try { KN.Audio && KN.Audio.sfx(n); } catch (e) { /* */ } };
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } };
  // ---------------------------------------------------------------- 3 ô nhóm ở màn hình chính
  function bindHub() {
    const tiles = document.querySelectorAll('.hub-tile[data-hub]'); if (!tiles.length) return;
    document.querySelectorAll('.hub-tile[data-go]').forEach((t) => (t.onclick = () => { sfx('click'); const b = document.getElementById(t.dataset.go); if (b) b.click(); }));
    const show = (id) => {
      document.querySelectorAll('.hub-panel').forEach((p) => (p.hidden = p.dataset.panel !== id));
      tiles.forEach((t) => { const on = t.dataset.hub === id; t.classList.toggle('on', on); t.setAttribute('aria-expanded', on ? 'true' : 'false'); });
      set('kn_title_hub', id || '');
    };
    tiles.forEach((t) => (t.onclick = () => { sfx('click'); show(t.classList.contains('on') ? null : t.dataset.hub); }));
    show(get('kn_title_hub', '') || null);
    const ar = document.getElementById('btnArcade'); if (ar) ar.onclick = () => { sfx('click'); open(); };
  }
  // ---------------------------------------------------------------- chơi thử minigame
  const GROUPS = [
    ['Thể thao', ['hax', 'penalty', 'keeper', 'hoops', 'sprint', 'swim', 'race']],
    ['Hành động', ['fight', 'chase', 'drive', 'sneak', 'ride', 'aim', 'clutch', 'land', 'dread']],
    ['Trí tuệ', ['quiz', 'millionaire', 'detective', 'interview', 'pitch', 'stock', 'cards']],
    ['Tiếng Anh · IELTS', ['ielts_vocab', 'ielts_read', 'ielts_grammar', 'ielts_listen', 'ielts_speak']],
    ['Đời sống & nghề', ['cook', 'haggle', 'love', 'cpr', 'surgery', 'fishing', 'sing', 'paint', 'fix']],
  ];
  const EXTRA = { haggle: { mode: 'buy', price: 3.5e7, item: 'Chiếc xe máy cũ' }, love: { partnerName: 'Lan' }, fight: { foe: 'thug' } };
  const LV = [['Dễ', 0.3], ['Thường', 0.5], ['Khó', 0.72]];
  let ui = { q: '', cat: 'all', sort: 'default' };
  const MM = () => KN.MiniMeta;
  function short(t) { const h = (KN.Mini.HOWTO || {})[t] || ''; const m = h.match(/^[^.!?]*[.!?]/); const x = (m ? m[0] : h).trim(); return x.length > 90 ? x.slice(0, 88) + '…' : x; }
  function open() {
    if (!KN.Mini || !KN.UI || !KN.UI.openModal) return;
    const mm = MM(), names = KN.Mini.NAME || {}, lv = get('kn_arcade_lv', 1), dc = mm && mm.daily(), data = mm ? mm.get() : { stats: {}, ach: {}, daily: {}, fav: {} };
    const st = (t) => (mm ? mm.stat(t) : { plays: 0, best: 0 });
    const dState = dc ? data.daily[dc.key] || {} : {};
    const cats = [['all', 'Tất cả'], ['fav', '⭐ Yêu thích']].concat(GROUPS.map(([g]) => [g, g]));
    const all = GROUPS.flatMap(([g, list]) => list.filter((t) => names[t]).map((t) => ({ t, g })));
    const nrm = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    let list = all.filter((x) => (ui.cat === 'all' || (ui.cat === 'fav' ? data.fav[x.t] : x.g === ui.cat)) && (!ui.q || nrm(names[x.t] + ' ' + short(x.t)).includes(nrm(ui.q))));
    if (ui.sort === 'best') list.sort((a, b) => st(b.t).best - st(a.t).best); else if (ui.sort === 'least') list.sort((a, b) => st(a.t).plays - st(b.t).plays); else if (ui.sort === 'quick') list.sort((a, b) => (mm ? mm.DUR[a.t] || 60 : 60) - (mm ? mm.DUR[b.t] || 60 : 60));
    const card = ({ t }) => {
      const nm = names[t], ic = nm.split(' ')[0], label = nm.replace(/^\S+\s/, ''), s = st(t), dur = mm ? mm.DUR[t] : 0, isNew = mm && mm.NEWV.includes(t), fav = data.fav[t], isD = dc && dc.type === t;
      return '<div class="arc-card2' + (isD ? ' daily' : '') + '"><button type="button" class="arc-fav" data-fav="' + t + '" title="Yêu thích" aria-label="Yêu thích">' + (fav ? '⭐' : '☆') + '</button><button type="button" class="arc-go" data-mg="' + t + '"><span class="arc-ic">' + ic + '</span><b>' + esc(label) + (isNew ? ' <em>MỚI</em>' : '') + (isD ? ' <em class="d">HÔM NAY</em>' : '') + '</b><small>' + esc(short(t)) + '</small><span class="arc-meta">' + (dur ? '⏱ ~' + (dur >= 90 ? Math.round(dur / 60) + ' phút' : dur + 's') : '') + (s.plays ? ' · 🏅 ' + s.best + '% · ' + s.plays + ' lượt' : ' · chưa chơi') + '</span></button></div>';
    };
    // sổ từ vựng IELTS (js/ielts.js): hiện khi xem nhóm Tiếng Anh hoặc tất cả
    let nbCard = '';
    if (KN.Ielts && (ui.cat === 'all' || ui.cat === 'Tiếng Anh · IELTS')) { const nb = KN.Ielts.notebook(); nbCard = '<div class="arc-daily"><div><b>📓 Sổ từ vựng IELTS</b><small>' + nb.total + ' từ đã gặp · ' + nb.mastered + ' từ đã thuộc · <b>' + nb.due + '</b> từ cần ôn hôm nay</small></div><button type="button" class="btn btn-primary btn-sm" data-review ' + (nb.due ? '' : 'disabled title="Chưa có từ nào đến hạn ôn"') + '>Ôn ngay</button></div>'; }
    const nAch = mm ? Object.keys(data.ach).length : 0;
    const daily = dc ? '<div class="arc-daily' + (dState.done ? ' done' : '') + '"><div><b>🎯 Thử thách hôm nay</b><small>Đạt từ <b>' + dc.target + '%</b> ở <b>' + esc(names[dc.type] || dc.type) + '</b> · thưởng ' + mm.fmt(dc.reward) + (mm.lifeOn() ? '' : ' (nhận khi đang sống một cuộc đời)') + '</small></div>' + (dState.done ? (dState.claimed ? '<span class="arc-ok">✔ Đã nhận</span>' : '<button type="button" class="btn btn-primary" data-claim="daily">Nhận thưởng</button>') : '<button type="button" class="btn btn-soft" data-mg="' + dc.type + '" data-daily="1">Chơi ngay</button>') + '</div>' : '';
    KN.UI.openModal('<div class="online arcade"><h3>🕹️ Minigame</h3><p class="sub">Chơi lại mọi minigame bất cứ lúc nào — kỷ lục và thành tựu lưu trên máy này. Chơi thử không thay đổi cuộc đời đang sống (trừ phần thưởng bạn chủ động nhận).</p>' + daily +
      '<div class="arc-tools"><input type="search" id="arcQ" placeholder="🔍 Tìm minigame…" value="' + esc(ui.q) + '"><select id="arcS"><option value="default"' + (ui.sort === 'default' ? ' selected' : '') + '>Sắp xếp: mặc định</option><option value="best"' + (ui.sort === 'best' ? ' selected' : '') + '>Kỷ lục cao nhất</option><option value="least"' + (ui.sort === 'least' ? ' selected' : '') + '>Chơi ít nhất</option><option value="quick"' + (ui.sort === 'quick' ? ' selected' : '') + '>Ngắn nhất</option></select><button type="button" class="btn btn-soft" data-book>📒 Thành tựu ' + nAch + '/' + (mm ? mm.ACH.length : 0) + '</button></div>' +
      '<div class="arc-cats">' + cats.map(([k, l]) => '<button type="button" data-cat="' + k + '" class="' + (ui.cat === k ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
      '<div class="arc-lv"><span>Độ khó</span>' + LV.map(([l], i) => '<button type="button" data-lv="' + i + '" class="' + (i === lv ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
      nbCard +
      (list.length ? '<div class="arc-grid2">' + list.map(card).join('') + '</div>' : '<p class="sub">Không có minigame nào khớp.' + (ui.cat === 'fav' ? ' Bấm ☆ ở thẻ để thêm vào yêu thích.' : '') + '</p>') +
      '<div class="sec-title">Chơi với bạn bè</div><div class="arc-grid"><button type="button" class="arc-card wide" data-on="hax"><span class="arc-ic">⚽</span><b>Bóng đá & bóng rổ Hax</b><small>online tối đa 8 người</small></button><button type="button" class="arc-card wide" data-on="race"><span class="arc-ic">🏍️</span><b>Đua xe máy</b><small>online tối đa 8 người</small></button></div></div>');
    const box = document.getElementById('modalBox');
    const q = box.querySelector('#arcQ'); q.oninput = () => { ui.q = q.value; const pos = q.selectionStart; open(); const n = document.getElementById('arcQ'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } };
    box.querySelector('#arcS').onchange = (e) => { ui.sort = e.target.value; open(); };
    box.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => { ui.cat = b.dataset.cat; sfx('click'); open(); }));
    box.querySelectorAll('[data-fav]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); mm && mm.toggleFav(b.dataset.fav); sfx('click'); open(); }));
    box.querySelectorAll('[data-lv]').forEach((b) => (b.onclick = () => { set('kn_arcade_lv', +b.dataset.lv); sfx('click'); open(); }));
    box.querySelectorAll('[data-on]').forEach((b) => (b.onclick = () => { KN.UI.closeModal(); if (b.dataset.on === 'hax') KN.Hax && KN.Hax.open(); else KN.Race && KN.Race.open(); }));
    box.querySelectorAll('[data-claim]').forEach((b) => (b.onclick = () => { const r = mm.claim(b.dataset.claim); sfx(r.ok ? 'coin' : 'bad'); if (KN.UI.toast) KN.UI.toast(r.ok ? 'Đã nhận thưởng' : 'Chưa nhận được', r.text, r.ok ? '🎯' : 'ℹ️'); open(); }));
    const rv = box.querySelector('[data-review]'); if (rv) rv.onclick = async () => { KN.UI.closeModal(); sfx('click'); await KN.Mini.test('ielts_vocab', 0.5, null, { title: 'Ôn từ vựng', label: 'Sổ từ vựng IELTS', review: true }); open(); };
    const bk = box.querySelector('[data-book]'); if (bk) bk.onclick = () => { sfx('click'); book(); };
    box.querySelectorAll('[data-mg]').forEach((b) => (b.onclick = async () => {
      const t = b.dataset.mg, isDaily = b.dataset.daily ? dc.key : null; KN.UI.closeModal(); sfx('click');
      const level = isDaily ? [0.3, 0.5, 0.72][(dc.target - 50) / 10] : LV[lv][1];
      const sc = await KN.Mini.test(t, level, null, Object.assign({ title: 'Chơi thử', label: names[t], daily: isDaily }, EXTRA[t] || {}));
      if (typeof sc === 'number') { const pct = Math.round(sc * 100), bb = get('kn_arcade_best', {}); if (bb[t] == null || pct > bb[t]) { bb[t] = pct; set('kn_arcade_best', bb); } }
      open();
    }));
  }
  // ---------------------------------------------------------------- 📒 thành tựu minigame
  function book() {
    const mm = MM(), data = mm.get(), names = KN.Mini.NAME || {};
    const rows = mm.ACH.map((a) => { const st = data.ach[a.id]; return '<div class="ach-row' + (st ? ' on' : '') + '"><span class="ach-ic">' + (st ? a.icon : '🔒') + '</span><div><b>' + esc(a.name) + '</b><small>' + esc(a.desc) + ' · thưởng ' + mm.fmt(mm.rewardOf(a)) + '</small></div>' + (st ? (st.claimed ? '<span class="arc-ok">✔ Đã nhận</span>' : '<button type="button" class="btn btn-soft" data-claim="' + a.id + '">Nhận</button>') : '<span class="arc-lock">Chưa đạt</span>') + '</div>'; }).join('');
    const stats = Object.keys(data.stats).filter((t) => names[t] && data.stats[t].plays).sort((a, b) => data.stats[b].best - data.stats[a].best).map((t) => { const s = data.stats[t]; return '<tr><td>' + esc(names[t]) + '</td><td>' + s.best + '%</td><td>' + (s.avg || 0) + '%</td><td>' + s.wins + '/' + s.plays + '</td><td>' + s.bestStreak + '</td></tr>'; }).join('');
    KN.UI.openModal('<div class="online arcade"><h3>📒 Sổ minigame</h3><p class="sub">Chuỗi thắng dài nhất: <b>' + (data.bestStreak || 0) + '</b> · Thử thách hằng ngày đã xong: <b>' + (data.dailyDone || 0) + '</b>' + (mm.lifeOn() ? '' : ' · <i>Hãy sống một cuộc đời để nhận thưởng tiền.</i>') + '</p><div class="sec-title">Thành tựu</div>' + rows + '<div class="sec-title">Kỷ lục từng trò</div>' + (stats ? '<table class="arc-tab"><tr><th>Trò</th><th>Cao nhất</th><th>TB</th><th>Đạt/lượt</th><th>Chuỗi</th></tr>' + stats + '</table>' : '<p class="sub">Chưa có lượt chơi nào.</p>') + '<div class="mini-btns"><button type="button" class="btn btn-soft" data-back>◀ Quay lại</button></div></div>');
    const box = document.getElementById('modalBox');
    box.querySelector('[data-back]').onclick = () => { sfx('click'); open(); };
    box.querySelectorAll('[data-claim]').forEach((b) => (b.onclick = () => { const r = mm.claim(b.dataset.claim); sfx(r.ok ? 'coin' : 'bad'); if (KN.UI.toast) KN.UI.toast(r.ok ? 'Đã nhận thưởng' : 'Chưa nhận được', r.text, r.ok ? '🏆' : 'ℹ️'); book(); }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindHub); else bindHub();
  KN.Arcade = { open, book };
})();
