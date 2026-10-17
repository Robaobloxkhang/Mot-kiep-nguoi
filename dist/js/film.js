/* Một Kiếp Người — PHIM CUỘC ĐỜI 30 GIÂY (KN.Film): ghép các khoảnh khắc trong album 3D thành video dọc 9:16
   có hiệu ứng zoom chậm (Ken Burns), phụ đề, nhạc nền tự sinh bằng WebAudio, quay bằng MediaRecorder rồi tải về / chia sẻ. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const G = () => KN.Game, UI = () => KN.UI || {};
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const W = 720, H = 1280, FPS = 30;
  const albumItems = () => { try { const mode = (G().getMode && G().getMode()) || 'offline'; const a = KN.store.get('kn_album_' + mode, null); return (a && a.items) || []; } catch (e) { return []; } };
  function pickMime() {
    const list = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return list.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
  }
  // nhạc nền: hợp âm C – G – Am – F rải nốt nhẹ (kiểu piano) + nốt trầm
  function music(ctx, dest, dur) {
    const chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
    const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const master = ctx.createGain(); master.gain.value = 0.22; master.connect(dest);
    const t0 = ctx.currentTime + 0.1, beat = 60 / 76;
    for (let i = 0, t = t0; t < t0 + dur; i++, t += beat / 2) {
      const ch = chords[Math.floor(i / 8) % 4], n = ch[i % 3] + (i % 6 >= 3 ? 12 : 0);
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = hz(n);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 1.6);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + beat * 1.7);
      if (i % 8 === 0) { const b = ctx.createOscillator(), bg = ctx.createGain(); b.type = 'sine'; b.frequency.value = hz(ch[0] - 24); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.6, t + 0.05); bg.gain.exponentialRampToValueAtTime(0.0001, t + beat * 4); b.connect(bg); bg.connect(master); b.start(t); b.stop(t + beat * 4.1); }
    }
    master.gain.setValueAtTime(0.22, t0 + dur - 2); master.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  }
  function wrap(c, text, x, y, maxW, lh, maxLines) {
    const words = String(text || '').split(' '); let line = '', n = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (c.measureText(test).width > maxW && line) { c.fillText(line, x, y); y += lh; line = words[i]; if (++n >= (maxLines || 3) - 1) { const rest = words.slice(i).join(' '); let l2 = rest; while (c.measureText(l2 + '…').width > maxW && l2.length > 3) l2 = l2.slice(0, -1); c.fillText(l2 + (l2 !== rest ? '…' : ''), x, y); return y + lh; } }
      else line = test;
    }
    if (line) c.fillText(line, x, y);
    return y + lh;
  }
  async function build(onProgress) {
    const info = G().deathInfo && G().deathInfo(); if (!info) throw new Error('Chỉ làm phim khi một đời đã khép lại.');
    const items = albumItems();
    let pics = []; const n = Math.min(8, items.length);
    for (let i = 0; i < n; i++) pics.push(items[Math.round(i * (items.length - 1) / Math.max(1, n - 1))]);
    pics = pics.filter((x, i, a) => x && a.indexOf(x) === i);
    const imgs = await Promise.all(pics.map((p) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = p.img; })));
    try { await document.fonts.load('800 60px "Baloo 2"'); await document.fonts.load('400 30px "Be Vietnam Pro"'); } catch (e) { /* */ }
    // dòng thời gian: mở đầu 3s · mỗi ảnh 2,6s · kết 4,5s
    const scenes = [{ type: 'intro', dur: 3 }].concat(pics.map((p, i) => ({ type: 'pic', p, im: imgs[i], dur: 2.6 }))).concat([{ type: 'outro', dur: 4.5 }]);
    const total = scenes.reduce((s, x) => s + x.dur, 0);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const draw = (t) => {
      let acc = 0, sc = scenes[0], lt = 0;
      for (const s of scenes) { if (t < acc + s.dur) { sc = s; lt = t - acc; break; } acc += s.dur; sc = s; lt = s.dur; }
      const k = lt / sc.dur, fade = Math.min(1, lt / 0.45, (sc.dur - lt) / 0.45);
      c.globalAlpha = 1; c.fillStyle = '#0b0e1c'; c.fillRect(0, 0, W, H);
      c.textAlign = 'center';
      if (sc.type === 'pic') {
        c.globalAlpha = fade;
        if (sc.im) { const z = 1.08 + k * 0.14, cover = Math.max(W / sc.im.width, H * 0.62 / sc.im.height) * z, w = sc.im.width * cover, h = sc.im.height * cover, px = (W - w) / 2 + (k - 0.5) * 40, py = 160 + (H * 0.62 - h) / 2; c.save(); c.beginPath(); c.rect(0, 160, W, H * 0.62); c.clip(); c.drawImage(sc.im, px, py, w, h); c.restore(); }
        const gr = c.createLinearGradient(0, H * 0.62, 0, H * 0.62 + 200); gr.addColorStop(0, 'rgba(11,14,28,0)'); gr.addColorStop(1, '#0b0e1c'); c.fillStyle = gr; c.fillRect(0, H * 0.55, W, 220);
        c.fillStyle = '#ffb347'; c.font = '800 64px "Baloo 2", sans-serif'; c.fillText(sc.p.age + ' tuổi', W / 2, H * 0.8);
        c.fillStyle = '#f2ede4'; c.font = '600 34px "Be Vietnam Pro", sans-serif'; wrap(c, sc.p.title, W / 2, H * 0.8 + 60, W - 100, 44, 2);
        c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '500 26px "Be Vietnam Pro", sans-serif'; c.fillText('năm ' + (sc.p.year || ''), W / 2, H * 0.8 + 160);
      } else if (sc.type === 'intro') {
        c.globalAlpha = fade;
        const glow = c.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, 420); glow.addColorStop(0, 'rgba(255,170,70,.35)'); glow.addColorStop(1, 'rgba(255,170,70,0)'); c.fillStyle = glow; c.fillRect(0, 0, W, H);
        c.fillStyle = '#a8a6bd'; c.font = '600 30px "Be Vietnam Pro", sans-serif'; c.fillText('MỘT KIẾP NGƯỜI', W / 2, H * 0.34);
        c.fillStyle = '#f2ede4'; c.font = '800 76px "Baloo 2", sans-serif'; const y = wrap(c, info.fullName, W / 2, H * 0.34 + 110, W - 80, 84, 2);
        c.fillStyle = '#ffb347'; c.font = '600 38px "Be Vietnam Pro", sans-serif'; c.fillText(info.born + ' – ' + info.died, W / 2, y + 20);
      } else {
        c.globalAlpha = fade;
        c.fillStyle = '#a8a6bd'; c.font = '600 30px "Be Vietnam Pro", sans-serif'; c.fillText('Hưởng thọ ' + info.age + ' tuổi', W / 2, H * 0.24);
        c.fillStyle = '#ff9b9b'; c.font = '500 30px "Be Vietnam Pro", sans-serif'; wrap(c, info.cause, W / 2, H * 0.24 + 52, W - 120, 40, 2);
        c.fillStyle = '#f2ede4'; c.font = 'italic 38px "Be Vietnam Pro", sans-serif'; wrap(c, '“' + info.epitaph + '”', W / 2, H * 0.4, W - 120, 52, 3);
        c.fillStyle = '#ffb347'; c.font = '800 120px "Baloo 2", sans-serif'; c.fillText(String(info.score), W / 2, H * 0.64);
        c.fillStyle = '#39cf98'; c.font = '800 48px "Baloo 2", sans-serif'; c.fillText(info.rank, W / 2, H * 0.64 + 70);
        c.fillStyle = '#ffb347'; c.font = '700 36px "Baloo 2", sans-serif'; c.fillText('🏮 Bạn sẽ sống kiếp người thế nào?', W / 2, H - 150);
        c.fillStyle = '#a8a6bd'; c.font = '600 28px "Be Vietnam Pro", sans-serif'; c.fillText('mot-kiep-nguoi.vercel.app', W / 2, H - 100);
      }
      c.globalAlpha = 1;
      // thanh tiến độ mảnh ở đỉnh như story
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(30, 40, W - 60, 6); c.fillStyle = '#ffb347'; c.fillRect(30, 40, (W - 60) * Math.min(1, t / total), 6);
    };
    const mime = pickMime(); if (!window.MediaRecorder || !cv.captureStream) throw new Error('Trình duyệt chưa hỗ trợ quay video (hãy dùng Chrome hoặc Edge).');
    const stream = cv.captureStream(FPS);
    let actx = null;
    try { const AC = window.AudioContext || window.webkitAudioContext; actx = new AC(); const dest = actx.createMediaStreamDestination(); music(actx, dest, total); dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr)); } catch (e) { actx = null; }
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 5e6 } : undefined);
    const chunks = []; rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise((res) => (rec.onstop = res));
    draw(0); rec.start(250);
    const t0 = performance.now();
    await new Promise((res) => { const tick = () => { const t = (performance.now() - t0) / 1000; draw(Math.min(t, total)); onProgress && onProgress(Math.min(1, t / total), cv); if (t < total + 0.2) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
    rec.stop(); await done; try { actx && actx.close(); } catch (e) { /* */ }
    const type = (mime || 'video/webm').split(';')[0];
    return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm', name: info.fullName };
  }
  async function open() {
    const n = albumItems().length;
    UI().openModal('<div class="online film"><h3>🎬 Phim cuộc đời 30 giây</h3><p class="sub">Ghép ' + Math.min(8, n) + ' khoảnh khắc từ album 3D thành video dọc kèm nhạc nền, để đăng TikTok, Reels, Facebook story. ' + (n ? '' : '⚠️ Album đời này chưa có ảnh nào nên phim chỉ có phần mở đầu và kết.') + '</p><div class="film-stage"><canvas id="filmPrev" width="180" height="320"></canvas></div><div class="meter"><i id="filmBar" style="width:0%"></i></div><p class="p-sub" id="filmMsg">Giữ tab này mở trong lúc quay (~' + Math.round(3 + Math.min(8, n) * 2.6 + 4.5) + ' giây).</p><div class="btnrow" id="filmBtns"><button type="button" class="btn btn-primary" id="filmGo">🎬 Quay phim</button></div></div>');
    const go = document.getElementById('filmGo');
    go.onclick = async () => {
      go.disabled = true; go.textContent = '⏺ Đang quay…';
      const prev = document.getElementById('filmPrev').getContext('2d');
      try {
        const out = await build((p, cv) => { const bar = document.getElementById('filmBar'); if (bar) bar.style.width = Math.round(p * 100) + '%'; try { prev.drawImage(cv, 0, 0, 180, 320); } catch (e) { /* */ } });
        const url = URL.createObjectURL(out.blob), fname = 'kiep-nguoi-' + String(out.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-') + '.' + out.ext;
        const btns = document.getElementById('filmBtns'), msg = document.getElementById('filmMsg');
        if (!btns) return;
        msg.textContent = '✅ Xong! ' + (out.ext === 'webm' ? 'Video dạng .webm — TikTok/Facebook trên máy tính đều nhận; nếu điện thoại không mở được, hãy đổi sang Chrome.' : 'Video .mp4 sẵn sàng đăng.');
        btns.innerHTML = '<a class="btn btn-primary" id="filmDl" href="' + url + '" download="' + esc(fname) + '">⬇️ Tải video</a>' + (navigator.canShare ? '<button type="button" class="btn btn-soft" id="filmShare">📤 Chia sẻ</button>' : '') + '<button type="button" class="btn btn-ghost" id="filmAgain">↻ Quay lại</button>';
        const sh = document.getElementById('filmShare');
        if (sh) sh.onclick = async () => { const file = new File([out.blob], fname, { type: out.blob.type }); if (navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Một Kiếp Người', text: 'Phim cuộc đời mình trong Một Kiếp Người 🏮 mot-kiep-nguoi.vercel.app' }); } catch (e) { /* huỷ */ } } else document.getElementById('filmDl').click(); };
        document.getElementById('filmAgain').onclick = () => open();
      } catch (e) { const msg = document.getElementById('filmMsg'); if (msg) msg.textContent = '⚠️ ' + e.message; go.disabled = false; go.textContent = '🎬 Thử lại'; }
    };
  }
  KN.Film = { open, build };
})();
