/* Một Kiếp Người — cộng đồng: dòng họ online (api/clan.js) và tiểu sử chia sẻ được qua link (api/story.js). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game, UI = () => KN.UI || {};
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (t, b, i) => UI().toast && UI().toast(t, b, i);
  const pid = () => { let p = KN.store.get('kn_pid', null); if (!p) { p = 'u' + Math.random().toString(36).slice(2, 12); KN.store.set('kn_pid', p); } return p; };
  const nick = () => KN.store.get('kn_online_name', '') || (G().hasLife() && G().view() ? G().view().name : '') || 'Ẩn danh';
  const money = (v) => (v >= 1e12 ? (v / 1e12).toFixed(1).replace('.0', '') + ' nghìn tỷ' : v >= 1e9 ? (v / 1e9).toFixed(1).replace('.0', '') + ' tỷ' : Math.round(v / 1e6) + ' triệu');
  async function api(url, body) {
    const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error({ notfound: 'Không tìm thấy', full: 'Dòng họ đã đủ 30 người', 'slow-down': 'Thao tác nhanh quá, thử lại sau ít giây', 'not-configured': 'Máy chủ chưa sẵn sàng', 'too-small': 'Góp ít nhất 1 triệu' }[j.error] || 'Lỗi mạng, thử lại nhé');
    return j;
  }

  // ------------------------------------------------------------------ dòng họ online
  const CKEY = 'kn_clan';
  const FUND_LV = [0, 1e9, 1e10, 1e11, 1e12];
  const PERKS = ['Chưa có quyền lợi', 'Học bổng tuổi 18: 50 triệu', 'Học bổng tuổi 18: 300 triệu', 'Học bổng tuổi 18: 1 tỷ', 'Học bổng tuổi 18: 5 tỷ'];
  const mine = () => KN.store.get(CKEY, null);
  const lvOf = (fund) => { let l = 0; FUND_LV.forEach((v, i) => { if (fund >= v) l = i; }); return l; };
  function level() { const c = mine(); return c ? lvOf(c.fund || 0) : 0; }
  function cache(code, c) { KN.store.set(CKEY, { code, name: c.name, fund: c.fund || 0, total: c.total || 0 }); }
  async function refresh() { const c = mine(); if (!c) return null; try { const j = await api('/api/clan?code=' + c.code + '&t=' + Date.now()); cache(c.code, j.clan); return j; } catch (e) { if (/Không tìm thấy/.test(e.message)) KN.store.set(CKEY, null); throw e; } }
  async function openClan() {
    const c = mine();
    UI().openModal('<div class="online"><h3>🏯 Dòng họ online</h3><p class="sub">⏳ Đang tải…</p></div>');
    let j = null, top = [];
    try { if (c) j = await refresh(); } catch (e) { /* hiện lỗi bên dưới */ }
    try { top = (await api('/api/clan?top=1')).list || []; } catch (e) { /* bỏ qua */ }
    const box = document.getElementById('modalBox'); if (!box || document.getElementById('modal').hidden) return;
    const topHtml = '<div class="sec-title">🏆 Bảng xếp hạng dòng họ</div>' + (top.length ? '<div class="ol-hist">' + top.slice(0, 15).map((x, i) => '<div>' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1 + '.') + ' <b>' + esc(x.name) + '</b> · ' + x.total + ' điểm' + (j && x.code === j.code ? ' ← dòng họ bạn' : '') + '</div>').join('') + '</div>' : '<p class="p-sub">Chưa có dòng họ nào. Hãy là người đầu tiên!</p>');
    if (!j) {
      UI().openModal('<div class="online"><h3>🏯 Dòng họ online</h3><p class="sub">Lập dòng họ với bạn bè: mỗi kiếp ai trong họ sống xong đều cộng điểm cho cả họ. Góp tiền trong game vào quỹ chung; quỹ càng lớn, con cháu mới sinh ra càng có học bổng to.</p>' +
        '<label class="ol-field">Tên dòng họ<input id="clName" maxlength="30" placeholder="VD: Họ Nguyễn làng Cổ Loa"></label><div class="btnrow"><button type="button" class="btn btn-primary" id="clCreate">➕ Lập dòng họ</button></div>' +
        '<div class="ol-join"><input id="clCode" maxlength="6" placeholder="Mã dòng họ (6 ký tự)" autocomplete="off"><button type="button" class="btn btn-ghost" id="clJoin">Gia nhập</button></div><p class="p-sub" id="clErr"></p>' + topHtml + '</div>');
      const err = (e) => { document.getElementById('clErr').textContent = '⚠️ ' + e.message; };
      document.getElementById('clCreate').onclick = async () => { const name = document.getElementById('clName').value.trim(); if (!name) return err(new Error('Nhập tên dòng họ trước đã')); try { const r = await api('/api/clan', { op: 'create', pid: pid(), nick: nick(), name }); cache(r.code, r.clan); toast('🏯 Đã lập dòng họ', 'Gửi mã ' + r.code + ' cho người thân để gia nhập.', '🏯'); openClan(); } catch (e) { err(e); } };
      document.getElementById('clJoin').onclick = async () => { const code = document.getElementById('clCode').value.trim().toUpperCase(); if (code.length !== 6) return err(new Error('Mã gồm 6 ký tự')); try { const r = await api('/api/clan', { op: 'join', pid: pid(), nick: nick(), code }); cache(r.code, r.clan); toast('🏯 Đã gia nhập', r.clan.name, '🏯'); openClan(); } catch (e) { err(e); } };
      return;
    }
    const cl = j.clan, mem = Object.keys(cl.members || {}).map((k) => Object.assign({ me: k === pid() }, cl.members[k])).sort((a, b) => b.total - a.total);
    const lv = lvOf(cl.fund || 0), next = FUND_LV[lv + 1];
    const v = G().hasLife() ? G().view() : null, canDonate = v && v.alive && (!G().getMode || G().getMode() === 'offline') && v.money >= 1e6;
    UI().openModal('<div class="online"><h3>🏯 ' + esc(cl.name) + '</h3><p class="sub">Mã dòng họ: <b class="ol-code">' + esc(j.code) + '</b> · ' + mem.length + ' thành viên · ' + (cl.lives || 0) + ' kiếp đã sống · <b>' + (cl.total || 0) + ' điểm</b></p>' +
      '<div class="card" style="display:block"><b>💰 Quỹ dòng họ: ' + money(cl.fund || 0) + '</b><div class="p-sub">Cấp ' + lv + ': ' + PERKS[lv] + (next ? ' · lên cấp ' + (lv + 1) + ' khi quỹ đạt ' + money(next) : ' · cấp cao nhất') + '. Học bổng trao cho mọi kiếp mới của thành viên khi tròn 18 tuổi.</div></div>' +
      '<div class="btnrow">' + (canDonate ? '<button type="button" class="btn btn-primary" id="clDonate">💸 Góp tiền của nhân vật hiện tại</button>' : '<span class="p-sub">Góp quỹ được khi đang sống một kiếp offline.</span>') + '</div>' +
      '<div class="sec-title">👥 Thành viên</div><div class="ol-hist">' + mem.map((m, i) => '<div>' + (i + 1) + '. <b>' + esc(m.nick) + '</b>' + (m.me ? ' (bạn)' : '') + ' · ' + m.lives + ' kiếp · tổng ' + m.total + ' · cao nhất ' + m.best + '</div>').join('') + '</div>' +
      '<div class="sec-title">📜 Nhật ký dòng họ</div><div class="ol-hist">' + (Array.isArray(cl.log) && cl.log.length ? cl.log.slice().reverse().slice(0, 12).map((x) => '<div>' + esc(x.text) + '</div>').join('') : '<div>Chưa có gì.</div>') + '</div>' +
      topHtml + '<div class="btnrow" style="margin-top:12px"><button type="button" class="btn btn-soft btn-sm" id="clLeave">Rời dòng họ</button></div></div>');
    const dn = document.getElementById('clDonate');
    if (dn) dn.onclick = async () => {
      const cash = Math.floor((G().view().money || 0) / 1e6);
      const n = Math.floor(Number(window.prompt('Góp bao nhiêu triệu vào quỹ dòng họ? (nhân vật đang có ' + cash + ' triệu)', String(Math.min(100, cash)))));
      if (!n || n < 1) return; if (n > cash) { toast('Không đủ tiền', 'Nhân vật chỉ có ' + cash + ' triệu.', '⛔'); return; }
      try { await api('/api/clan', { op: 'donate', pid: pid(), nick: nick(), code: j.code, amount: n * 1e6 }); G().onlineMoney(-n * 1e6, '🏯 Bạn góp ' + money(n * 1e6) + ' vào quỹ dòng họ ' + cl.name + '.', '🏯'); G().remoteEffect({ karma: Math.min(5, Math.ceil(n / 500)) }, 'Cả họ ghi nhận tấm lòng của bạn.', '🏯'); UI().render && UI().render(); toast('🏯 Đã góp quỹ', money(n * 1e6), '🏯'); openClan(); } catch (e) { toast('Chưa góp được', e.message, '⚠️'); }
    };
    document.getElementById('clLeave').onclick = async () => { if (!window.confirm('Rời dòng họ ' + cl.name + '?')) return; try { await api('/api/clan', { op: 'leave', pid: pid(), nick: nick(), code: j.code }); } catch (e) { /* vẫn rời trên máy */ } KN.store.set(CKEY, null); UI().closeModal(); toast('Đã rời dòng họ', cl.name, '🏯'); };
  }
  // một kiếp khép lại: cộng điểm cho dòng họ (mỗi kiếp chỉ gửi một lần)
  let sentFor = null;
  async function onDeath() {
    const c = mine(); const d = G().deathInfo && G().deathInfo(); if (!c || !d) return;
    const key = d.fullName + '|' + d.died; if (sentFor === key || KN.store.get('kn_clan_last', '') === key) return; sentFor = key; KN.store.set('kn_clan_last', key);
    try { const r = await api('/api/clan', { op: 'life', pid: pid(), nick: nick(), code: c.code, life: { name: d.fullName, age: d.age, score: d.score, note: d.rank } }); cache(r.code, r.clan); toast('🏯 Đã cộng ' + d.score + ' điểm', 'cho dòng họ ' + r.clan.name, '🏯'); } catch (e) { /* lặng lẽ bỏ qua */ }
  }

  // ------------------------------------------------------------------ tiểu sử chia sẻ được
  function bioHtml(b, shared) {
    return '<div class="bio"><div class="bio-head"><span>📜</span><div><h3>' + esc(b.name) + '</h3><small>' + b.born + ' – ' + b.died + ' · thọ ' + b.age + ' tuổi' + (b.city ? ' · ' + esc(b.city) : '') + (b.gen > 1 ? ' · đời thứ ' + b.gen : '') + '</small></div></div>' +
      b.paragraphs.map((p) => '<p>' + esc(p) + '</p>').join('') +
      (b.highlights && b.highlights.length ? '<div class="sec-title">Dấu mốc</div><ul class="bio-hl">' + b.highlights.map((h) => '<li>' + esc(h) + '</li>').join('') + '</ul>' : '') +
      (b.heirlooms && b.heirlooms.length ? '<p class="p-sub">🏺 ' + b.heirlooms.map(esc).join(' · ') + '</p>' : '') +
      '<p class="bio-rank">' + esc(b.rank || '') + ' · ' + (b.score || 0) + ' điểm' + (shared && b.nick ? ' · người chơi ' + esc(b.nick) : '') + '</p></div>';
  }
  function openBio() {
    const b = G().biography && G().biography(); if (!b) return;
    UI().openModal(bioHtml(b) + '<div class="btnrow"><button type="button" class="btn btn-primary" id="bioShare">🔗 Tạo link chia sẻ</button></div><div id="bioLink"></div>');
    document.getElementById('bioShare').onclick = async (e) => {
      const btn = e.currentTarget; btn.disabled = true; btn.textContent = '⏳ Đang tạo link…';
      try {
        const r = await api('/api/story', { pid: pid(), nick: nick(), story: b });
        const link = location.origin + location.pathname + '?story=' + r.id;
        document.getElementById('bioLink').innerHTML = '<div class="ol-join"><input id="bioUrl" readonly value="' + esc(link) + '"><button type="button" class="btn btn-ghost" id="bioCopy">Sao chép</button></div><p class="p-sub">Ai mở link này sẽ đọc được tiểu sử (lưu 180 ngày).</p>';
        btn.textContent = '✅ Đã tạo link';
        document.getElementById('bioCopy').onclick = async () => { try { await navigator.clipboard.writeText(link); toast('Đã sao chép link', '', '🔗'); } catch (x) { document.getElementById('bioUrl').select(); } };
        if (navigator.share) { try { await navigator.share({ title: b.title, text: b.paragraphs[0], url: link }); } catch (x) { /* người dùng huỷ */ } }
      } catch (err) { btn.disabled = false; btn.textContent = '🔗 Thử lại'; toast('Chưa tạo được link', err.message, '⚠️'); }
    };
  }
  // mở trang bằng link ?story=xxxx → hiện tiểu sử
  async function showShared() {
    const id = new URLSearchParams(location.search).get('story'); if (!id || !/^[a-z0-9]{8}$/.test(id)) return;
    try {
      const j = await api('/api/story?id=' + id);
      const wait = () => (UI().openModal ? UI().openModal(bioHtml(j.story, true) + '<div class="btnrow"><button type="button" class="btn btn-primary" data-close="1">▶ Tự sống một kiếp của riêng bạn</button></div>') : setTimeout(wait, 300));
      wait();
    } catch (e) { toast('Không mở được tiểu sử', e.message, '📜'); }
  }

  function init() {
    const b = document.getElementById('btnClan'); if (b) b.onclick = () => openClan();
    setTimeout(showShared, 1200);
    if (mine()) refresh().catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
  KN.Clan = { open: openClan, level, onDeath };
  KN.Social = { openBio, openClan };
})();
