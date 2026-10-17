/* Một Kiếp Người — 🌐 BẠN BÈ LÀ NGƯỜI CHƠI THẬT (api/people.js)
   Chia sẻ "danh thiếp" nhân vật của mình → nhận mã 6 ký tự gửi bạn bè. Nhập mã của bạn bè → nhân vật của họ trở thành bạn
   trong đời mình (đi chơi, nhờ vả, yêu đương… như mọi người khác). Hoặc gặp ngẫu nhiên nhân vật của người chơi khắp nơi. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game, UI = () => KN.UI || {};
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (t, b, i) => UI().toast && UI().toast(t, b, i);
  const ERR = { 'slow-down': 'Thao tác nhanh quá, thử lại sau ít phút', 'not-configured': 'Máy chủ chưa sẵn sàng', notfound: 'Không tìm thấy mã này (sai mã hoặc đã hết hạn 90 ngày)', 'bad-code': 'Mã gồm 6 ký tự chữ và số', 'bad-name': 'Tên nhân vật không hợp lệ' };
  async function api(url, body) {
    const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(ERR[j.error] || 'Lỗi mạng, thử lại nhé');
    return j;
  }
  const cardHtml = (c, btn) => '<div class="ppl-card"><span class="ppl-av">' + (c.gender === 'f' ? '👩' : '👨') + '</span><span><b>' + esc(c.name) + '</b> <small>' + (c.age || '?') + ' tuổi</small><br><small class="p-sub">' + esc([c.job, c.city].filter(Boolean).join(' · ')) + '</small>' + (c.bio ? '<br><small class="p-sub">' + esc(c.bio) + '</small>' : '') + '</span>' + (btn || '') + '</div>';
  function add(card, how) { UI().closeModal && UI().closeModal(); UI().doAction(() => G().addRealFriend(card, how)); }
  function open() {
    if (!G().hasLife || !G().hasLife() || G().isDead()) { toast('Chưa có cuộc đời nào', 'Hãy bắt đầu một kiếp người trước.', '🌐'); return; }
    const code = G().myCardCode && G().myCardCode();
    UI().openModal('<div class="online ppl"><h3>🌐 Bạn bè là người chơi thật</h3><p class="sub">Kết bạn với nhân vật trong kiếp người của người chơi khác. Họ sẽ xuất hiện trong đời bạn như một người bạn thật sự.</p>' +
      '<div class="sec-title">📇 Danh thiếp của bạn</div>' + (code ? '<p>Mã bạn bè của bạn: <b class="ppl-code">' + esc(code) + '</b> <button type="button" class="btn btn-soft btn-sm" id="pplCopy">📋 Chép</button></p><p class="p-sub">Gửi mã cho bạn bè, họ nhập vào đây để kết bạn với nhân vật của bạn.</p>' : '<p class="p-sub">Chia sẻ để nhận mã bạn bè (chỉ gồm tên, tuổi, ngoại hình, nghề và thành phố của nhân vật — không có thông tin cá nhân của bạn).</p><button type="button" class="btn btn-primary btn-sm" id="pplShare">📇 Chia sẻ nhân vật của tôi</button>') +
      '<div class="sec-title">➕ Thêm bạn bằng mã</div><div class="ol-join"><input id="pplCode" maxlength="6" placeholder="Mã 6 ký tự" autocomplete="off" style="text-transform:uppercase"><button type="button" class="btn btn-soft" id="pplFind">Tìm</button></div><div id="pplFound"></div>' +
      '<div class="sec-title">🎲 Gặp người chơi ngẫu nhiên</div><button type="button" class="btn btn-soft btn-sm" id="pplRand">🎲 Xem vài nhân vật vừa được chia sẻ</button><div id="pplList"></div><p class="p-sub" id="pplErr"></p></div>');
    const $ = (s) => document.getElementById(s), err = (t) => ($('pplErr').textContent = t ? '⚠️ ' + t : '');
    if ($('pplCopy')) $('pplCopy').onclick = async () => { try { await navigator.clipboard.writeText(code); toast('Đã chép mã', code, '📋'); } catch (e) { window.prompt('Chép mã này:', code); } };
    if ($('pplShare')) $('pplShare').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = '⏳ Đang chia sẻ…';
      try { const r = await api('/api/people', { op: 'publish', card: G().myCard() }); G().setMyCardCode(r.code); open(); toast('📇 Đã chia sẻ nhân vật', 'Mã bạn bè: ' + r.code, '🌐'); }
      catch (x) { err(x.message); e.target.disabled = false; e.target.textContent = '📇 Chia sẻ nhân vật của tôi'; }
    };
    $('pplFind').onclick = async () => {
      const c = $('pplCode').value.trim().toUpperCase(); if (!/^[A-Z2-9]{6}$/.test(c)) { err('Mã gồm 6 ký tự chữ và số'); return; }
      err(''); $('pplFound').innerHTML = '<p class="p-sub">⏳ Đang tìm…</p>';
      try { const { card } = await api('/api/people?code=' + c); $('pplFound').innerHTML = cardHtml(card, '<button type="button" class="btn btn-primary btn-sm" id="pplAdd">🤝 Kết bạn</button>'); $('pplAdd').onclick = () => add(card, 'code'); }
      catch (x) { $('pplFound').innerHTML = ''; err(x.message); }
    };
    $('pplCode').onkeydown = (e) => { if (e.key === 'Enter') $('pplFind').click(); };
    $('pplRand').onclick = async () => {
      err(''); $('pplList').innerHTML = '<p class="p-sub">⏳ Đang tải…</p>';
      try {
        const { cards } = await api('/api/people?get=random&n=5&t=' + Date.now());
        const list = (cards || []).filter((c) => c.code !== code);
        $('pplList').innerHTML = list.length ? list.map((c, i) => cardHtml(c, '<button type="button" class="btn btn-soft btn-sm" data-pi="' + i + '">👋 Làm quen</button>')).join('') : '<p class="p-sub">Chưa có ai chia sẻ nhân vật. Hãy là người đầu tiên!</p>';
        $('pplList').querySelectorAll('[data-pi]').forEach((b) => (b.onclick = () => add(list[+b.dataset.pi], 'random')));
      } catch (x) { $('pplList').innerHTML = ''; err(x.message); }
    };
  }
  KN.People = { open };
})();
