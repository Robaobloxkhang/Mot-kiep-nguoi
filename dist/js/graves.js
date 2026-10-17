/* Một Kiếp Người — NGHĨA TRANG ONLINE (api/grave.js): đưa bia mộ của mình lên, thắp nhang và để lại lời nhắn cho người chơi khác. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game, UI = () => KN.UI || {};
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (t, b, i) => UI().toast && UI().toast(t, b, i);
  const ERR = { 'slow-down': 'Thao tác nhanh quá, thử lại sau ít phút', 'not-configured': 'Máy chủ chưa sẵn sàng', notfound: 'Bia mộ không còn', empty: 'Lời nhắn trống' };
  async function api(url, body) {
    const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(ERR[j.error] || 'Lỗi mạng, thử lại nhé');
    return j;
  }
  const posted = () => KN.store.get('kn_graves_posted', {}) || {};
  const ago = (t) => { const d = (Date.now() - t) / 1000; return d < 3600 ? Math.max(1, Math.round(d / 60)) + ' phút trước' : d < 86400 ? Math.round(d / 3600) + ' giờ trước' : Math.round(d / 86400) + ' ngày trước'; };
  // đưa bia mộ của đời vừa khép lại lên nghĩa trang chung
  async function postGrave(btn) {
    const info = G().deathInfo && G().deathInfo(); if (!info) return;
    const key = info.fullName + '|' + info.born; const map = posted();
    if (map[key]) { openGrave(map[key]); return; }
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang dựng bia…'; }
    try {
      const v = G().view() || {};
      const r = await api('/api/grave', { action: 'add', grave: { name: info.fullName, born: info.born, died: info.died, age: info.age, gender: v.gender, cause: info.cause, epitaph: info.epitaph, rank: info.rank, score: info.score, job: v.occupation || '', city: v.cityName || '', worth: info.moneyText || '', kids: info.kidsCount || 0, spouse: info.spouseName || '', story: (info.highlights || []).slice(0, 10) } });
      map[key] = r.id; KN.store.set('kn_graves_posted', map);
      toast('🕯️ Đã dựng bia mộ', 'Người chơi khác có thể thắp nhang cho ' + info.fullName + '.', '🕯️');
      openGrave(r.id);
    } catch (e) { toast('Chưa dựng được bia', e.message, '⚠️'); if (btn) { btn.disabled = false; btn.textContent = '🌐 Đưa lên nghĩa trang online'; } }
  }
  async function openGraves() {
    UI().openModal('<div class="online"><h3>🌐 Nghĩa trang online</h3><p class="sub">⏳ Đang tải…</p></div>');
    let list = [];
    try { list = (await api('/api/grave?t=' + Date.now())).graves || []; } catch (e) { UI().openModal('<div class="online"><h3>🌐 Nghĩa trang online</h3><p class="sub">⚠️ ' + esc(e.message) + '</p></div>'); return; }
    const mine = Object.values(posted());
    UI().openModal('<div class="online"><h3>🌐 Nghĩa trang online</h3><p class="sub">Những kiếp người vừa khép lại của người chơi khắp nơi. Bấm vào một bia mộ để thắp nén nhang hoặc để lại lời nhắn. Khi một đời của bạn kết thúc, bấm “Đưa lên nghĩa trang online” ở màn hình tiễn biệt.</p>' +
      (list.length ? '<div class="gv-list">' + list.map((g) => '<button type="button" class="gv-stone' + (mine.includes(g.id) ? ' mine' : '') + '" data-gv="' + g.id + '"><span class="gv-cross">' + (g.gender === 'f' ? '🌸' : '🕯️') + '</span><b>' + esc(g.name) + '</b><small>' + g.born + ' – ' + g.died + ' · ' + g.age + ' tuổi</small><small class="gv-ep">“' + esc(g.epitaph || '') + '”</small><small>🪔 ' + (g.incense || 0) + ' nén nhang · ' + esc(g.rank || '') + '</small>' + (mine.includes(g.id) ? '<em>của bạn</em>' : '') + '</button>').join('') + '</div>'
        : '<p class="p-sub">Nghĩa trang còn trống. Hãy là người đầu tiên dựng bia.</p>') + '</div>');
    document.querySelectorAll('#modalBox [data-gv]').forEach((b) => (b.onclick = () => openGrave(b.dataset.gv)));
  }
  async function openGrave(id, back) {
    UI().openModal('<div class="online"><h3>🕯️ Bia mộ</h3><p class="sub">⏳ Đang tải…</p></div>');
    let j;
    try { j = await api('/api/grave?id=' + encodeURIComponent(id) + '&t=' + Date.now()); } catch (e) { UI().openModal('<div class="online"><h3>🕯️ Bia mộ</h3><p class="sub">⚠️ ' + esc(e.message) + '</p></div>'); return; }
    const g = j.grave, link = location.origin + location.pathname + '?grave=' + g.id;
    UI().openModal('<div class="online gv-one"><div class="gv-big"><div class="gv-cross">' + (g.gender === 'f' ? '🌸' : '🕯️') + '</div><h3>' + esc(g.name) + '</h3><p>' + g.born + ' – ' + g.died + ' · hưởng thọ ' + g.age + ' tuổi</p>' + (g.job ? '<p class="p-sub">' + esc(g.job) + (g.city ? ' · ' + esc(g.city) : '') + '</p>' : '') + '<p class="gv-cause">' + esc(g.cause || '') + '</p><p class="gv-ep">“' + esc(g.epitaph || '') + '”</p><p class="p-sub">' + esc(g.rank || '') + ' · ' + (g.score || 0) + ' điểm' + (g.worth ? ' · để lại ' + esc(g.worth) : '') + (g.kids ? ' · ' + g.kids + ' người con' : '') + (g.spouse ? ' · bạn đời ' + esc(g.spouse) : '') + '</p></div>' +
      (g.story && g.story.length ? '<div class="sec-title">📜 Một đời người</div><ol class="gv-story">' + g.story.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol>' : '') +
      '<div class="btnrow" style="justify-content:center"><button type="button" class="btn btn-primary" id="gvInc">🪔 Thắp nén nhang (' + j.incense + ')</button><button type="button" class="btn btn-soft" id="gvLink">🔗 Chép link</button><button type="button" class="btn btn-ghost" id="gvBack">← Nghĩa trang</button></div>' +
      '<div class="sec-title">💬 Lời nhắn (' + j.msgs.length + ')</div><div class="ol-join"><input id="gvMsg" maxlength="100" placeholder="Viết vài lời tưởng nhớ…" autocomplete="off"><button type="button" class="btn btn-soft" id="gvSend">Gửi</button></div><p class="p-sub" id="gvErr"></p>' +
      '<div class="ol-hist" id="gvMsgs">' + (j.msgs.length ? j.msgs.map((m) => '<div><b>' + esc(m.nick) + '</b>: ' + esc(m.text) + ' <small class="p-sub">· ' + ago(m.at) + '</small></div>').join('') : '<div>Chưa có lời nhắn nào.</div>') + '</div></div>');
    const $ = (s) => document.getElementById(s);
    $('gvBack').onclick = () => (back === 'feed' ? openFeed() : openGraves());
    $('gvLink').onclick = async () => { try { await navigator.clipboard.writeText(link); toast('Đã chép link', 'Gửi cho bạn bè để cùng thắp nhang.', '🔗'); } catch (e) { window.prompt('Chép link này:', link); } };
    $('gvInc').onclick = async (e) => { e.target.disabled = true; try { const r = await api('/api/grave', { action: 'incense', id: g.id }); e.target.textContent = '🪔 ' + (r.already ? 'Bạn đã thắp nhang rồi' : 'Đã thắp') + ' (' + r.incense + ')'; try { KN.Audio && KN.Audio.sfx('bell'); } catch (x) { /* */ } } catch (x) { e.target.disabled = false; toast('Chưa thắp được', x.message, '⚠️'); } };
    $('gvSend').onclick = async () => {
      const text = $('gvMsg').value.trim(); if (text.length < 2) { $('gvErr').textContent = '⚠️ Viết ít nhất vài chữ nhé'; return; }
      const nick = KN.store.get('kn_online_name', '') || (G().hasLife() && G().view() ? G().view().name : '') || 'Người qua đường';
      try { const r = await api('/api/grave', { action: 'msg', id: g.id, nick, text }); $('gvMsg').value = ''; $('gvErr').textContent = ''; $('gvMsgs').innerHTML = r.msgs.map((m) => '<div><b>' + esc(m.nick) + '</b>: ' + esc(m.text) + ' <small class="p-sub">· ' + ago(m.at) + '</small></div>').join(''); } catch (x) { $('gvErr').textContent = '⚠️ ' + x.message; }
    };
  }
  // 📰 60. BẢNG TIN CÁC KIẾP HAY NHẤT: đời người điểm cao nhất của người chơi khác trong 48 giờ qua, bấm vào để đọc cả dòng đời
  async function openFeed() {
    UI().openModal('<div class="online"><h3>📰 Kiếp hay hôm nay</h3><p class="sub">⏳ Đang tải…</p></div>');
    let j;
    try { j = await api('/api/grave?feed=1&t=' + Math.floor(Date.now() / 30000)); } catch (e) { UI().openModal('<div class="online"><h3>📰 Kiếp hay hôm nay</h3><p class="sub">⚠️ ' + esc(e.message) + '</p></div>'); return; }
    const list = j.lives || [], mine = Object.values(posted());
    UI().openModal('<div class="online"><h3>📰 Kiếp hay hôm nay</h3><p class="sub">' + (j.fresh ? 'Những cuộc đời điểm cao nhất của người chơi khắp nơi trong 48 giờ qua.' : 'Những cuộc đời điểm cao nhất gần đây.') + ' Bấm vào để đọc cả dòng đời, thắp nhang, để lại lời nhắn. Muốn đời mình lên bảng: khi khép lại một đời, bấm “Đưa lên nghĩa trang online”.</p>' +
      (list.length ? '<div class="feed">' + list.map((g, i) => '<button type="button" class="feed-row' + (mine.includes(g.id) ? ' mine' : '') + '" data-fd="' + g.id + '"><span class="feed-n">' + (i + 1) + '</span><span class="feed-b"><b>' + esc(g.name) + '</b> <small>' + g.age + ' tuổi · ' + esc(g.rank || '') + ' · ' + (g.score || 0) + ' điểm</small><br><small class="p-sub">' + esc([g.job, g.city, g.worth ? 'để lại ' + g.worth : '', g.cause].filter(Boolean).join(' · ')) + '</small>' + (g.story && g.story.length ? '<br><small class="feed-hl">“' + esc(g.story[Math.min(1, g.story.length - 1)]) + '”</small>' : '') + '</span><span class="feed-i">🪔 ' + (g.incense || 0) + '</span></button>').join('') + '</div>'
        : '<p class="p-sub">Chưa có đời người nào được chia sẻ. Hãy là người đầu tiên!</p>') + '</div>');
    document.querySelectorAll('#modalBox [data-fd]').forEach((b) => (b.onclick = () => openGrave(b.dataset.fd, 'feed')));
  }
  // mở thẳng một bia mộ từ link chia sẻ (?grave=xxxxxxxx)
  function boot() { try { const id = new URLSearchParams(location.search).get('grave'); if (id && /^[a-z0-9]{8}$/.test(id)) setTimeout(() => openGrave(id), 900); } catch (e) { /* */ } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  KN.Graves = { openGraves, openGrave, postGrave, openFeed };
})();
