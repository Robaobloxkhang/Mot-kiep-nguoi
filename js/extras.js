/* Một Kiếp Người — tiện ích: bảng xếp hạng toàn server, chia sẻ cuộc đời, cài như app (PWA) (KN.Extras) */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game, UI = () => KN.UI, D = () => KN.DATA;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => (D().fmtShort ? D().fmtShort(n) : String(n));
  const SITE = 'https://mot-kiep-nguoi.vercel.app';
  const toast = (t, b, i) => UI() && UI().toast && UI().toast(t, b, i);
  const pid = () => { let p = KN.store.get('kn_pid', null); if (!p) { p = 'u' + Math.random().toString(36).slice(2, 12); KN.store.set('kn_pid', p); } return p; };
  const diffOf = (id) => (D().DIFFICULTY || []).find((x) => x.id === id) || { icon: '🌾', label: 'Thường' };

  // ------------------------------------------------------------------ bảng xếp hạng
  const LB = { by: 'score', period: 'week', cache: {} };
  const BY = { score: ['🏅', 'Điểm cao'], age: ['🕯️', 'Sống thọ'], worth: ['💰', 'Giàu nhất'] };
  const dailyLine = () => { const c = G().dailyChallenge(); return c.icon + ' ' + c.text; };
  async function fetchBoard(by, period) {
    if (period === 'day') by = 'score';
    const k = by + '|' + period, c = LB.cache[k];
    if (c && Date.now() - c.at < 30000) return c.data;
    const r = await fetch('api/leaderboard?by=' + by + '&period=' + period + (period === 'day' ? '&day=' + G().dailyChallenge().day : ''));
    if (!r.ok) throw new Error(r.status === 503 ? 'Máy chủ chưa bật.' : 'Không tải được bảng xếp hạng.');
    const data = await r.json();
    LB.cache[k] = { at: Date.now(), data };
    return data;
  }
  async function openBoard(by, period) {
    LB.by = by || LB.by; LB.period = period || LB.period;
    const head = '<h3>🏆 Bảng xếp hạng toàn server</h3>' +
      '<div class="seg lb-tabs">' + Object.keys(BY).map((k) => '<button type="button" data-lbby="' + k + '" aria-pressed="' + (LB.by === k) + '">' + BY[k][0] + ' ' + BY[k][1] + '</button>').join('') + '</div>' +
      '<div class="seg lb-tabs">' + [['day', '🎯 Thử thách hôm nay'], ['week', '📅 Tuần này'], ['all', '♾️ Mọi thời đại']].map(([k, l]) => '<button type="button" data-lbp="' + k + '" aria-pressed="' + (LB.period === k) + '">' + l + '</button>').join('') + '</div>' +
      (LB.period === 'day' ? '<p class="p-sub">' + esc(dailyLine()) + ' · chỉ tính những cuộc đời hoàn thành thử thách, xếp theo điểm.</p>' : '');
    UI().openModal('<div class="online lb">' + head + '<div class="lb-body"><p class="sub">⏳ Đang tải…</p></div></div>');
    bindTabs();
    try {
      const d = await fetchBoard(LB.by, LB.period);
      const mine = pid();
      const body = document.querySelector('#modalBox .lb-body'); if (!body) return;
      body.innerHTML = d.list.length ? '<div class="lb-list">' + d.list.map((e, i) => '<div class="lb-row' + (String(e.id || '').startsWith(mine + '.') ? ' me' : '') + '"><span class="lb-n">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><span class="lb-who"><b>' + esc(e.name) + '</b><small>' + esc(e.nick) + ' · ' + diffOf(e.diff).icon + ' ' + esc(diffOf(e.diff).label) + (e.gen > 1 ? ' · đời thứ ' + e.gen : '') + '</small><small>' + esc(e.age + ' tuổi · ' + (e.cause || '') + (e.job ? ' · ' + e.job : '')) + '</small></span><span class="lb-v">' + (LB.by === 'worth' ? money(e.worth) : LB.by === 'age' ? e.age + ' tuổi' : e.score + ' đ') + '</span></div>').join('') + '</div>' +
        '<p class="p-sub">' + d.total + ' cuộc đời trên bảng' + (LB.period === 'week' ? ' tuần ' + esc(d.week) : '') + '. Khi nhân vật qua đời, bấm “Gửi lên bảng xếp hạng” để góp mặt.</p>'
        : '<p class="sub">Chưa có ai trên bảng ' + (LB.period === 'week' ? 'tuần này' : '') + '. Hãy là người đầu tiên!</p>';
    } catch (e) { const body = document.querySelector('#modalBox .lb-body'); if (body) body.innerHTML = '<p class="sub">⚠️ ' + esc(e.message) + '</p>'; }
  }
  function bindTabs() {
    document.querySelectorAll('#modalBox [data-lbby]').forEach((b) => (b.onclick = () => openBoard(b.dataset.lbby)));
    document.querySelectorAll('#modalBox [data-lbp]').forEach((b) => (b.onclick = () => openBoard(null, b.dataset.lbp)));
  }
  // gửi cuộc đời vừa kết thúc
  async function submitLife(btn) {
    const s = G().onlineSnapshot && G().onlineSnapshot();
    if (!s || s.alive) return;
    const sentKey = 'kn_lb_sent', sent = KN.store.get(sentKey, []) || [];
    const sig = s.fullName + '|' + s.born + '|' + s.year;
    if (sent.includes(sig)) { toast('Đã gửi rồi', 'Cuộc đời này đã có trên bảng xếp hạng.', '🏆'); return; }
    let nick = KN.store.get('kn_lb_nick', '') || KN.store.get('kn_online_name', '') || '';
    nick = (window.prompt('Tên hiển thị trên bảng xếp hạng (bỏ trống = Ẩn danh):', nick) ?? null);
    if (nick === null) return;
    nick = nick.trim().slice(0, 20); KN.store.set('kn_lb_nick', nick);
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang gửi…'; }
    try {
      const ch = G().challengeResult && G().challengeResult();
      const r = await fetch('api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid: pid(), nick, life: { fullName: s.fullName, age: s.age, worth: s.worth, score: s.score, cause: s.cause, job: s.job, diff: s.diff, gen: s.gen, rank: s.rank }, challenge: ch ? { id: ch.id, day: ch.day, ok: ch.ok } : null }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(r.status === 429 ? 'Gửi nhanh quá, đợi một phút nhé.' : 'Không gửi được, thử lại sau.');
      sent.unshift(sig); KN.store.set(sentKey, sent.slice(0, 50));
      LB.cache = {};
      toast('Đã lên bảng xếp hạng!', (j.rankDay ? '🎯 Hạng ' + j.rankDay + ' thử thách hôm nay · ' : '') + 'Hạng ' + (j.rankWeek || '?') + ' tuần này · hạng ' + (j.rankAll || '?') + ' mọi thời đại (theo điểm).', '🏆');
      if (btn) { btn.textContent = '✅ Đã gửi · hạng ' + (j.rankWeek || '?') + ' tuần này'; }
    } catch (e) { toast('Chưa gửi được', e.message, '⚠️'); if (btn) { btn.disabled = false; btn.textContent = '🏆 Gửi lên bảng xếp hạng'; } }
  }

  // ------------------------------------------------------------------ chia sẻ cuộc đời (ảnh cáo phó vui)
  function wrap(ctx, text, x, y, maxW, lh, maxLines) {
    const words = String(text).split(' '); let line = '', n = 0;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++n >= maxLines - 1) { line = line + '…'; break; } } else line = t;
    }
    ctx.fillText(line, x, y); return y + lh;
  }
  // ảnh chia sẻ dạng 9:16 (đăng story/TikTok): bia mộ + 4 khoảnh khắc từ album 3D + điểm + dấu ấn
  async function shareImage() {
    const info = G().deathInfo && G().deathInfo(); const s = G().onlineSnapshot && G().onlineSnapshot();
    if (!info || !s) return null;
    try { await document.fonts.load('700 60px "Baloo 2"'); await document.fonts.load('400 30px "Be Vietnam Pro"'); } catch (e) { /* */ }
    const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d2342'); g.addColorStop(1, '#0b0e1c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W / 2, 240, 20, W / 2, 240, 460); glow.addColorStop(0, 'rgba(255,170,70,.35)'); glow.addColorStop(1, 'rgba(255,170,70,0)'); c.fillStyle = glow; c.fillRect(0, 0, W, 760);
    c.textAlign = 'center';
    c.font = '110px serif'; c.fillText('🕯️', W / 2, 190);
    c.font = '600 34px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a8a6bd'; c.fillText('MỘT KIẾP NGƯỜI', W / 2, 262);
    c.font = '800 80px "Baloo 2", sans-serif'; c.fillStyle = '#f2ede4'; let y = wrap(c, info.fullName, W / 2, 350, W - 120, 84, 2);
    c.font = '400 34px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a8a6bd';
    c.fillText(info.born + ' – ' + info.died + ' · hưởng thọ ' + info.age + ' tuổi', W / 2, y + 10);
    c.fillStyle = '#ff9b9b'; y = wrap(c, info.cause, W / 2, y + 62, W - 160, 44, 2);
    c.font = 'italic 34px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#f2ede4'; y = wrap(c, '“' + info.epitaph + '”', W / 2, y + 40, W - 180, 46, 2);
    // 4 khoảnh khắc từ album (chọn rải đều cả đời)
    const items = album().items; let pics = [];
    if (items.length) { const n = Math.min(4, items.length); for (let i = 0; i < n; i++) pics.push(items[Math.round(i * (items.length - 1) / Math.max(1, n - 1))]); pics = pics.filter((x, i, a) => a.indexOf(x) === i); }
    const top = Math.max(y + 30, 720), cw = 450, ch = 300, gap = 30, x0 = (W - cw * 2 - gap) / 2;
    if (pics.length) {
      const imgs = await Promise.all(pics.map((p) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = p.img; })));
      imgs.forEach((im, i) => {
        const px = x0 + (i % 2) * (cw + gap), py = top + Math.floor(i / 2) * (ch + 70);
        c.save(); c.beginPath(); c.roundRect ? c.roundRect(px, py, cw, ch, 22) : c.rect(px, py, cw, ch); c.clip();
        if (im) { const k = Math.max(cw / im.width, ch / im.height), w2 = im.width * k, h2 = im.height * k; c.drawImage(im, px + (cw - w2) / 2, py + (ch - h2) / 2, w2, h2); } else { c.fillStyle = '#2a3156'; c.fillRect(px, py, cw, ch); }
        c.restore();
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 3; c.beginPath(); c.roundRect ? c.roundRect(px, py, cw, ch, 22) : c.rect(px, py, cw, ch); c.stroke();
        c.font = '700 26px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#ffb347'; c.textAlign = 'left';
        const cap = pics[i].age + ' tuổi · ' + pics[i].title; c.fillText(cap.length > 30 ? cap.slice(0, 29) + '…' : cap, px + 4, py + ch + 40);
      });
      y = top + Math.ceil(pics.length / 2) * (ch + 70) + 20;
    } else y = top;
    c.textAlign = 'center';
    // khung điểm
    c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect ? c.roundRect(110, y, W - 220, 180, 28) : c.rect(110, y, W - 220, 180); c.fill();
    c.font = '800 96px "Baloo 2", sans-serif'; c.fillStyle = '#ffb347'; c.fillText(String(info.score), W / 2 - 180, y + 112);
    c.font = '600 30px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a8a6bd'; c.fillText('điểm kiếp người', W / 2 - 180, y + 150);
    c.font = '800 54px "Baloo 2", sans-serif'; c.fillStyle = '#39cf98'; c.fillText(info.rank, W / 2 + 190, y + 90);
    c.font = '600 30px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a8a6bd'; c.fillText(diffOf(s.diff).icon + ' ' + diffOf(s.diff).label + ' · ' + money(s.worth), W / 2 + 190, y + 145);
    // dấu ấn
    c.textAlign = 'left'; c.font = '400 31px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#f2ede4';
    y += 250;
    const hl = info.highlights || [];
    (hl.length > 5 ? [hl[0]].concat(hl.slice(-4)) : hl).forEach((h) => { if (y < H - 170) y = wrap(c, '• ' + h, 120, y, W - 240, 42, 2); });
    c.textAlign = 'center'; c.font = '700 36px "Baloo 2", sans-serif'; c.fillStyle = '#ffb347';
    c.fillText('🏮 Bạn sẽ sống kiếp người thế nào?', W / 2, H - 110);
    c.font = '600 30px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a8a6bd'; c.fillText('mot-kiep-nguoi.vercel.app', W / 2, H - 60);
    return new Promise((res) => cv.toBlob((b) => res(b), 'image/png'));
  }  async function shareLife(btn) {
    const info = G().deathInfo && G().deathInfo(); if (!info) return;
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang tạo ảnh…'; }
    try {
      const blob = await shareImage();
      const text = 'Kiếp này mình là ' + info.fullName + ', sống ' + info.age + ' tuổi, ' + info.score + ' điểm (' + info.rank + '). Bạn thử sống một kiếp xem sao!';
      const file = blob && new File([blob], 'mot-kiep-nguoi.png', { type: 'image/png' });
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Một Kiếp Người', text: text + ' ' + SITE });
      } else if (blob) {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mot-kiep-nguoi-' + info.name + '.png'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        try { await navigator.clipboard.writeText(text + ' ' + SITE); toast('Đã lưu ảnh', 'Ảnh đã tải về máy và lời giới thiệu đã được chép. Dán lên Facebook/Zalo nhé!', '📤'); } catch (e) { toast('Đã lưu ảnh', 'Ảnh đã tải về máy, đăng lên Facebook/Zalo nhé!', '📤'); }
      }
    } catch (e) { if (e && e.name !== 'AbortError') toast('Chưa chia sẻ được', 'Thử lại nhé.', '⚠️'); }
    finally { if (btn) { btn.disabled = false; btn.textContent = '📤 Chia sẻ cuộc đời'; } }
  }

  // ------------------------------------------------------------------ cài như app (PWA)
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; const b = document.getElementById('btnInstall'); if (b) b.hidden = false; });
  window.addEventListener('appinstalled', () => { installEvt = null; const b = document.getElementById('btnInstall'); if (b) b.hidden = true; toast('Đã cài xong!', 'Mở game từ biểu tượng 🏮 ngoài màn hình nhé.', '📲'); });
  async function install() {
    if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) { /* */ } installEvt = null; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    UI().openModal('<div class="online"><h3>📲 Cài game lên điện thoại</h3>' + (ios
      ? '<p class="sub">Trên iPhone/iPad (Safari): bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên) → <b>Thêm vào MH chính</b> → <b>Thêm</b>.</p>'
      : '<p class="sub">Trên Android (Chrome): bấm menu <b>⋮</b> → <b>Cài đặt ứng dụng</b> (hoặc <b>Thêm vào màn hình chính</b>).<br>Trên máy tính (Chrome/Edge): bấm biểu tượng cài đặt ở cuối thanh địa chỉ.</p>') +
      '<p class="p-sub">Sau khi cài, game mở toàn màn hình như app và chơi offline được không cần mạng (trừ chế độ online).</p></div>');
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* không sao */ }); });
  }
  const standalone = () => window.matchMedia && matchMedia('(display-mode: standalone)').matches;

  // ------------------------------------------------------------------ thử thách hằng ngày
  let pendingChallenge = null;
  function openDaily() {
    const c = G().dailyChallenge();
    UI().openModal('<div class="online"><h3>🎯 Thử thách hôm nay</h3><p class="ch-big">' + c.icon + ' ' + esc(c.text) + '</p>' +
      '<p class="sub">Ai cũng nhận cùng một đề trong ngày ' + esc(c.day.split('-').reverse().join('/')) + '. Hoàn thành rồi gửi lên bảng xếp hạng thử thách để so điểm với mọi người. Chơi ở “phòng” offline, không ảnh hưởng trận online.</p>' +
      '<div class="btnrow" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" id="chBoard">🏆 Bảng hôm nay</button><button type="button" class="btn btn-primary" id="chGo">Nhận thử thách →</button></div></div>');
    document.getElementById('chBoard').onclick = () => openBoard('score', 'day');
    document.getElementById('chGo').onclick = () => {
      if (G().getMode && G().getMode() !== 'offline') G().setMode('offline');
      const has = G().hasLife() && G().view() && G().view().alive;
      const go = () => { pendingChallenge = c; UI().closeModal(); UI().openCreator(); };
      if (has && !window.confirm('Bắt đầu kiếp mới cho thử thách sẽ thay kiếp offline đang chơi dở (' + G().view().name + ', ' + G().view().age + ' tuổi). Muốn giữ thì lưu vào ô “💾 Lưu & tải” trước. Tiếp tục?')) return;
      go();
    };
  }
  // gọi sau khi tạo nhân vật xong
  function onLifeStart() {
    resetAlbum();
    if (!pendingChallenge || (G().getMode && G().getMode() !== 'offline')) { pendingChallenge = null; return; }
    G().setChallenge(pendingChallenge);
    toast('🎯 Đã nhận thử thách', pendingChallenge.text, pendingChallenge.icon);
    pendingChallenge = null;
  }

  // ------------------------------------------------------------------ album ảnh cuộc đời
  // lưu theo từng cuộc đời (tên + năm sinh), mỗi chế độ (offline/online) một album, tối đa 16 ảnh
  const albumKey = () => 'kn_album_' + ((G().getMode && G().getMode()) || 'offline');
  function lifeSig() { const s = G().onlineSnapshot && G().onlineSnapshot(); return s ? s.fullName + '|' + s.born : null; }
  function album() { const a = KN.store.get(albumKey(), null); const sig = lifeSig(); return a && a.sig === sig ? a : { sig, items: [] }; }
  function capture(title) {
    if (!KN.World || !KN.World.snapshot || !G().hasLife()) return;
    const img = KN.World.snapshot(420); if (!img || img.length < 2000) return;
    const v = G().view(), a = album();
    if (a.items.some((x) => x.title === title && x.age === v.age)) return;
    a.items.push({ age: v.age, year: v.year, title: String(title || '').slice(0, 60), img });
    // quá 16 ảnh: bỏ bớt ảnh ở giữa, luôn giữ ảnh chào đời
    while (a.items.length > 16) a.items.splice(1 + Math.floor((a.items.length - 2) / 2), 1);
    if (!KN.store.set(albumKey(), a)) { a.items.splice(1, 2); KN.store.set(albumKey(), a); }
  }
  function openAlbum() {
    const a = album(), v = G().view();
    UI().openModal('<div class="online album"><h3>📸 Album cuộc đời' + (v ? ' — ' + esc(v.name) : '') + '</h3>' +
      (a.items.length ? '<p class="sub">' + a.items.length + ' khoảnh khắc đáng nhớ. Bấm vào ảnh để tải về.</p><div class="al-grid">' + a.items.map((x, i) => '<figure class="al-it" data-al="' + i + '"><img src="' + x.img + '" alt="' + esc(x.title) + '" loading="lazy"><figcaption><b>' + x.age + ' tuổi</b> · ' + esc(x.title) + '</figcaption></figure>').join('') + '</div>'
        : '<p class="sub">Chưa có ảnh nào. Album tự chụp lại những cột mốc lớn: chào đời, đi học, tốt nghiệp, cưới, có con…</p>') + '</div>');
    document.querySelectorAll('#modalBox [data-al]').forEach((f) => (f.onclick = () => { const x = a.items[+f.dataset.al]; const l = document.createElement('a'); l.href = x.img; l.download = 'album-' + x.age + 'tuoi.jpg'; document.body.appendChild(l); l.click(); l.remove(); }));
  }
  // kiếp mới: xoá album cũ của chế độ đó
  function resetAlbum() { KN.store.set(albumKey(), { sig: lifeSig(), items: [] }); }

  // ------------------------------------------------------------------ thách đấu “cùng xuất phát”
  function dareResult() {
    const r = G().dareResult && G().dareResult(); if (!r) return '';
    return '<div class="dare-res ' + (r.win ? 'win' : 'lose') + '"><b>' + (r.win ? '🏆 Bạn đã sống tốt hơn ' : '😅 Bạn thua ') + esc(r.from || 'bạn bè') + '!</b><div class="dare-vs"><span><small>' + esc(r.from || 'Người thách') + '</small><b>' + r.theirScore + '</b><small>' + r.theirAge + ' tuổi</small></span><em>VS</em><span><small>Bạn</small><b>' + r.myScore + '</b><small>' + r.myAge + ' tuổi</small></span></div></div>';
  }
  function openDare() {
    const code = G().dareCode && G().dareCode(); if (!code) return;
    const link = location.origin + location.pathname + '?dare=' + code;
    const info = G().deathInfo && G().deathInfo();
    UI().openModal('<div class="online"><h3>⚔️ Thách bạn bè sống lại đời này</h3><p class="sub">Bạn bè mở link sẽ bắt đầu <b>y hệt khởi đầu của bạn</b>: cùng tên, quê, năm sinh, ngoại hình và chỉ số. Đời bạn đạt <b>' + (info ? info.score : 0) + ' điểm</b> — xem họ có làm tốt hơn không. Cuối đời họ sẽ thấy bảng so kết quả.</p>' +
      '<div class="ol-join"><input id="dareLink" value="' + esc(link) + '" readonly><button type="button" class="btn btn-primary" id="dareCopy">Chép link</button></div>' +
      (navigator.share ? '<div class="btnrow"><button type="button" class="btn btn-soft" id="dareShare">📤 Gửi qua Messenger, Zalo…</button></div>' : '') + '</div>');
    const msg = 'Mình sống kiếp này được ' + (info ? info.score : 0) + ' điểm. Cùng xuất phát y hệt, bạn có sống tốt hơn không? 👉';
    document.getElementById('dareCopy').onclick = async () => { try { await navigator.clipboard.writeText(msg + ' ' + link); toast('Đã chép link thách đấu', 'Dán vào Messenger, Zalo cho bạn bè nhé.', '⚔️'); } catch (e) { document.getElementById('dareLink').select(); } };
    const sh = document.getElementById('dareShare'); if (sh) sh.onclick = () => navigator.share({ title: 'Một Kiếp Người — thách đấu', text: msg, url: link }).catch(() => {});
  }
  function bootDare() {
    let code = null; try { code = new URLSearchParams(location.search).get('dare'); } catch (e) { /* */ }
    if (!code) return;
    const c = G().dareDecode && G().dareDecode(code); if (!c) return;
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* */ }
    setTimeout(() => {
      UI().openModal('<div class="online"><h3>⚔️ Bạn nhận được lời thách đấu!</h3><p class="sub"><b>' + esc(c.from || 'Một người bạn') + '</b> đã sống kiếp <b>' + esc([c.ln, c.mn, c.fn].filter(Boolean).join(' ')) + '</b> (sinh năm ' + c.b + ') được <b>' + (c.age || '?') + ' tuổi, ' + (c.score || 0) + ' điểm</b>' + (c.rank ? ' — ' + esc(c.rank) : '') + '.</p><p class="sub">Bạn sẽ bắt đầu y hệt: cùng tên, quê, năm sinh, ngoại hình và chỉ số. Phần còn lại tuỳ lựa chọn của bạn.</p><div class="btnrow"><button type="button" class="btn btn-primary" id="dareGo">⚔️ Nhận lời thách đấu</button><button type="button" class="btn btn-ghost" id="dareNo">Để sau</button></div></div>');
      document.getElementById('dareNo').onclick = () => UI().closeModal();
      document.getElementById('dareGo').onclick = () => { UI().closeModal(); UI().openCreator({ gender: c.g, firstName: c.fn, middleName: c.mn, lastName: c.ln, city: c.c, born: c.b, app: c.ap, perks: c.pk || [], diff: c.d, orientation: c.o, birthday: c.bd || null, same: c }); };
    }, 1200);
  }

  // ------------------------------------------------------------------ gắn vào giao diện
  function hookDeath() {
    const box = document.getElementById('viewDeath'); if (!box) return;
    const obs = new MutationObserver(() => {
      const acts = box.querySelector('.death-actions');
      if (!acts || acts.querySelector('[data-lbsend]') || box.querySelector('.death-share')) return;
      const row = document.createElement('div'); row.className = 'death-share';
      const ch = G().challengeResult && G().challengeResult();
      row.innerHTML = (ch ? '<div class="ch-result ' + (ch.ok ? 'ok' : 'fail') + '">' + (ch.ok ? '✅ Hoàn thành thử thách: ' : '❌ Chưa đạt thử thách: ') + ch.icon + ' ' + esc(ch.text) + '</div>' : '') +
        '<button type="button" class="btn btn-soft" data-bio>📜 Tiểu sử & link chia sẻ</button><button type="button" class="btn btn-soft" data-album>📸 Album cuộc đời</button><button type="button" class="btn btn-soft" data-lbsend>🏆 Gửi lên bảng xếp hạng</button><button type="button" class="btn btn-soft" data-share>📤 Ảnh chia sẻ</button><button type="button" class="btn btn-soft" data-tree>🌳 Gia phả</button>' +
        '<button type="button" class="btn btn-primary" data-film>🎬 Phim cuộc đời 30 giây</button><button type="button" class="btn btn-soft" data-gvpost>🌐 Đưa lên nghĩa trang online</button><button type="button" class="btn btn-soft" data-dare>⚔️ Thách bạn bè sống lại đời này</button>' + dareResult();
      acts.parentNode.insertBefore(row, acts);
      row.querySelector('[data-film]').onclick = () => KN.Film && KN.Film.open();
      row.querySelector('[data-gvpost]').onclick = (e) => KN.Graves && KN.Graves.postGrave(e.currentTarget);
      row.querySelector('[data-dare]').onclick = () => openDare();
      row.querySelector('[data-bio]').onclick = () => KN.Social && KN.Social.openBio();
      row.querySelector('[data-tree]').onclick = () => KN.UI.openFamilyTree && KN.UI.openFamilyTree();
      if (KN.Clan) KN.Clan.onDeath();
      row.querySelector('[data-lbsend]').onclick = (e) => submitLife(e.currentTarget);
      row.querySelector('[data-album]').onclick = () => openAlbum();
      row.querySelector('[data-share]').onclick = (e) => shareLife(e.currentTarget);
    });
    obs.observe(box, { childList: true, subtree: true });
  }
  function init() {
    hookDeath();
    bootDare();
    const gv = document.getElementById('btnGraveOnline'); if (gv) gv.onclick = () => KN.Graves && KN.Graves.openGraves();
    const hx = document.getElementById('btnHax'); if (hx) hx.onclick = () => KN.Hax && KN.Hax.open();
    const fd = document.getElementById('btnFeed'); if (fd) fd.onclick = () => KN.Graves && KN.Graves.openFeed();
    const rc = document.getElementById('btnRace'); if (rc) rc.onclick = () => KN.Race && KN.Race.open();
    const lb = document.getElementById('btnBoard'); if (lb) lb.onclick = () => openBoard();
    const dc = document.getElementById('btnDaily'); if (dc) { const c = G().dailyChallenge(); dc.textContent = '🎯 Thử thách hôm nay: ' + c.icon; dc.title = c.text; dc.onclick = openDaily; }
    const ins = document.getElementById('btnInstall'); if (ins) { ins.hidden = standalone(); ins.onclick = install; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);

  KN.Extras = { openBoard, submitLife, shareLife, shareImage, install, openDaily, onLifeStart, capture, openAlbum };
})();
