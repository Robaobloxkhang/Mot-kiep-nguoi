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
    const tiles = document.querySelectorAll('.hub-tile'); if (!tiles.length) return;
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
    ['Hành động', ['fight', 'chase', 'drive', 'sneak', 'ride']],
    ['Trí tuệ', ['quiz', 'millionaire', 'detective', 'interview', 'pitch', 'stock', 'cards']],
    ['Đời sống & nghề', ['cook', 'haggle', 'love', 'cpr', 'surgery', 'fishing', 'sing']],
  ];
  const EXTRA = { haggle: { mode: 'buy', price: 3.5e7, item: 'Chiếc xe máy cũ' }, love: { partnerName: 'Lan' }, fight: { foe: 'thug' } };
  const LV = [['Dễ', 0.3], ['Thường', 0.5], ['Khó', 0.72]];
  function open() {
    if (!KN.Mini || !KN.UI || !KN.UI.openModal) return;
    const best = get('kn_arcade_best', {}), lv = get('kn_arcade_lv', 1), names = KN.Mini.NAME || {};
    const known = (t) => names[t];
    const card = (t) => { const nm = names[t], ic = nm.split(' ')[0], label = nm.replace(/^\S+\s/, ''), b = best[t]; return '<button type="button" class="arc-card" data-mg="' + t + '"><span class="arc-ic">' + ic + '</span><b>' + esc(label) + '</b><small>' + (b != null ? '🏅 ' + b + '%' : 'Chưa chơi') + '</small></button>'; };
    KN.UI.openModal('<div class="online arcade"><h3>🕹️ Chơi thử minigame</h3><p class="sub">Chơi lại mọi minigame trong game bất cứ lúc nào, không ảnh hưởng tới cuộc đời đang sống. Điểm cao nhất được lưu trên máy này.</p>' +
      '<div class="arc-lv"><span>Độ khó</span>' + LV.map(([l], i) => '<button type="button" data-lv="' + i + '" class="' + (i === lv ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
      GROUPS.map(([g, list]) => { const ok = list.filter(known); return ok.length ? '<div class="sec-title">' + g + '</div><div class="arc-grid">' + ok.map(card).join('') + '</div>' : ''; }).join('') +
      '<div class="sec-title">Chơi với bạn bè</div><div class="arc-grid"><button type="button" class="arc-card wide" data-on="hax"><span class="arc-ic">⚽</span><b>Bóng đá & bóng rổ Hax</b><small>online tối đa 8 người</small></button><button type="button" class="arc-card wide" data-on="race"><span class="arc-ic">🏍️</span><b>Đua xe máy</b><small>online tối đa 8 người</small></button></div></div>');
    const box = document.getElementById('modalBox');
    box.querySelectorAll('[data-lv]').forEach((b) => (b.onclick = () => { set('kn_arcade_lv', +b.dataset.lv); sfx('click'); open(); }));
    box.querySelectorAll('[data-on]').forEach((b) => (b.onclick = () => { KN.UI.closeModal(); if (b.dataset.on === 'hax') KN.Hax && KN.Hax.open(); else KN.Race && KN.Race.open(); }));
    box.querySelectorAll('[data-mg]').forEach((b) => (b.onclick = async () => {
      const t = b.dataset.mg; KN.UI.closeModal(); sfx('click');
      const sc = await KN.Mini.test(t, LV[lv][1], null, Object.assign({ title: 'Chơi thử', label: names[t] }, EXTRA[t] || {}));
      if (typeof sc === 'number') { const pct = Math.round(sc * 100), bb = get('kn_arcade_best', {}); if (bb[t] == null || pct > bb[t]) { bb[t] = pct; set('kn_arcade_best', bb); } }
      open();
    }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindHub); else bindHub();
  KN.Arcade = { open };
})();
