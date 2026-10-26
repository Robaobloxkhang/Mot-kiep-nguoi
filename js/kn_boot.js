/* Một Kiếp Người — shared bootstrap: namespace, color management, small utilities, safe storage. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  KN.VERSION = '1.0.0';

  // Accurate sRGB colors with three r149: hex colors are converted to linear, output re-encoded to sRGB.
  if (window.THREE && THREE.ColorManagement && 'legacyMode' in THREE.ColorManagement) {
    THREE.ColorManagement.legacyMode = false;
  }

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1)); // inclusive
  const pick = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined);
  const chance = (p) => Math.random() < p;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // weighted pick: items[], weightFn(item) -> number >= 0
  function weighted(items, weightFn) {
    let total = 0;
    const ws = items.map((it) => { const w = Math.max(0, +weightFn(it) || 0); total += w; return w; });
    if (total <= 0) return undefined;
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  let uidN = 0;
  const uid = (p = 'id') => p + '_' + Date.now().toString(36) + (uidN++).toString(36) + Math.floor(Math.random() * 1e4).toString(36);

  // deterministic RNG (mulberry32) — use for stable dioramas / per-year choices
  function seeded(seed) {
    let a = (typeof seed === 'string' ? hash(seed) : seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  const ease = {
    linear: (t) => t,
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    outQuad: (t) => 1 - (1 - t) * (1 - t),
  };

  function hexToRgb(hex) {
    let h = String(hex || '#000000').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    const c = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  }
  function mixHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t));
  }
  function shadeHex(hex, amt) { // amt -1..1 (darken..lighten)
    return amt >= 0 ? mixHex(hex, '#ffffff', amt) : mixHex(hex, '#000000', -amt);
  }

  const warned = new Set();
  function warnOnce(key, ...msg) { if (warned.has(key)) return; warned.add(key); console.warn('[KN]', ...msg); }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  KN.util = { clamp, lerp, rand, randi, pick, chance, shuffle, weighted, uid, seeded, hash, ease,
    hexToRgb, rgbToHex, mixHex, shadeHex, warnOnce, sleep };

  // localStorage wrapper — never throws (private mode, blocked storage, thumbnails…)
  KN.store = {
    get(key, fallback = null) {
      try { const v = window.localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    del(key) { try { window.localStorage.removeItem(key); return true; } catch (e) { return false; } },
  };

  // ---------------------------------------------------------------- nạp trễ các tệp tình huống (js/events_*.js, khoảng 40 phần trăm dung lượng)
  // Tình huống chỉ cần khi bắt đầu/tiếp tục một cuộc đời, không cần để hiện màn hình chính. Sau khi trang tải xong, trình duyệt nhàn rỗi thì nạp nền
  // (giữ đúng thứ tự); nếu người chơi bấm vào game quá sớm, game.js gọi ensureSync() để nạp ngay (đồng bộ) trước khi đọc KN.EVENTS.
  // Khóa ?v= lấy từ KN_BUILD (do bản dựng đặt) để bộ nhớ đệm đúng phiên bản.
  const LAZY_EVENTS = ['events_early', 'events_adult', 'events_mature', 'events_story_love', 'events_story_crime', 'events_story_money', 'events_story_accident', 'events_story_family', 'events_story_school', 'events_story_work', 'events_story_life', 'events_story_parenting', 'events_story_football', 'events_story_society', 'events_story_action', 'events_story_romance', 'events_story_era', 'events_story_giangho', 'events_story_study', 'events_story_twist', 'events_career_sport', 'events_career_star', 'events_career_office', 'events_career_service', 'events_global', 'events_holiday'];
  const lazy = KN.lazy = { done: false, started: false, sync: false, files: LAZY_EVENTS.slice() };
  const lazyUrl = (f) => 'js/' + f + '.js' + (window.KN_BUILD ? '?v=' + window.KN_BUILD : '');
  const lazyFinish = () => { lazy.done = true; try { window.dispatchEvent(new Event('kn-events-ready')); } catch (e) { /* */ } };
  lazy.start = function () {
    if (lazy.started || lazy.done) return; lazy.started = true;
    if (KN.EVENTS && KN.EVENTS.length) { lazyFinish(); return; } // trang kiểm tra / bản cũ đã nạp tĩnh
    // tải trước song song (ưu tiên thấp), nhưng CHẠY lần lượt từng tệp, nghỉ giữa các tệp để không làm giật màn hình chính
    LAZY_EVENTS.forEach((f) => { const l = document.createElement('link'); l.rel = 'preload'; l.as = 'script'; l.href = lazyUrl(f); document.head.appendChild(l); });
    let i = 0;
    const yieldThen = (fn) => { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 250 }); else setTimeout(fn, 20); };
    const next = () => {
      if (lazy.sync || lazy.done) return; // người chơi bấm sớm: ensureSync đã nạp hết, dừng chuỗi nền để không trùng
      if (i >= LAZY_EVENTS.length) { lazyFinish(); return; }
      const f = LAZY_EVENTS[i++], s = document.createElement('script'); s.src = lazyUrl(f);
      s.onload = () => yieldThen(next); s.onerror = () => { console.warn('[KN.lazy] không nạp được', f); yieldThen(next); };
      document.head.appendChild(s);
    };
    next();
  };
  // dự phòng: nạp đồng bộ khi cần ngay. Các tệp nạp nền chưa chạy xong vẫn sẽ chạy sau đó, nên đọc danh sách phải khử trùng id (xem evList trong game.js).
  lazy.ensureSync = function () {
    if (lazy.done) return;
    if (KN.EVENTS && KN.EVENTS.length && !lazy.started && !lazy.sync) { lazyFinish(); return; }
    if (lazy.sync) return;
    lazy.sync = true;
    LAZY_EVENTS.forEach((f) => {
      try { const x = new XMLHttpRequest(); x.open('GET', lazyUrl(f), false); x.send(); if (x.status === 200) (0, eval)(x.responseText + '\n//# sourceURL=' + f + '.js'); } catch (e) { console.warn('[KN.lazy] nạp đồng bộ lỗi', f, e); }
    });
    lazyFinish();
  };
  const kick = () => { const go = () => lazy.start(); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 600); };
  if (document.readyState === 'complete') kick(); else window.addEventListener('load', kick);
})();
