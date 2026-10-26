/* Một Kiếp Người — công tắc tiếng Anh (VI ⇄ EN).
   Cách làm: giữ nguyên toàn bộ mã tiếng Việt, khi chọn EN thì dịch chữ hiện trên màn hình bằng từ điển Việt → Anh:
   – văn bản trong DOM (nút, tiêu đề, nhãn, placeholder, aria-label, title) được dịch và tự dịch lại khi giao diện đổi;
   – chữ vẽ lên canvas (minigame, cảnh 3D) được dịch qua fillText;
   – chuỗi nào chưa có trong từ điển thì giữ nguyên tiếng Việt (không bao giờ mất chữ).
   Từ điển nằm ở js/lang_en_*.js, chỉ nạp khi chọn EN: KN.I18n.add({ 'Tiếng Việt': 'English', … }, [[regex, 'thay $1'], …]).
   Khóa có số: mọi số trong câu được thay bằng {n} khi tra từ điển ("Tuổi 25" → "Age {n}"). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const KEY = 'kn_lang', FILES = ['lang_en_ui', 'lang_en_data', 'lang_en_minigames', 'lang_en_events'];
  const store = { get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* */ } } };
  const dict = new Map(), pats = [], numDict = new Map();
  let lang = store.get() === 'en' ? 'en' : 'vi', loaded = {}, loading = false, observer = null, queue = new Set(), raf = 0, applying = false;
  const orig = new WeakMap(); // nút/nodes đã dịch → bản gốc tiếng Việt (để đổi lại VI)
  const ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  const NUM = /\d[\d.,]*/g, HASNUM = /\d/;
  const HAS_VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  // ---------------------------------------------------------------- từ điển
  function add(map, regs) {
    Object.keys(map || {}).forEach((k) => { dict.set(k, map[k]); if (HASNUM.test(k)) numDict.set(k.replace(NUM, '{n}'), map[k]); });
    (regs || []).forEach((r) => pats.push(r));
    if (lang === 'en') scheduleAll();
  }
  const fixMoney = (x) => x.replace(/(\d[\d.,]*)tr\b/g, '$1M').replace(/(\d[\d.,]*) tỷ\b/g, '$1B').replace(/\btriệu\b/g, 'M').replace(/\bnghìn\b/g, 'k').replace(/\bnăm\b/g, 'y').replace(/\btháng\b/g, 'mo').replace(/\btuổi\b/g, 'yrs').replace(/\bsức khỏe\b/gi, 'health').replace(/\bđiểm\b/g, 'pts').replace(/thưởng/g, 'bonus').replace(/trợ cấp/g, 'allowance').replace(/tự túc/g, 'self-funded').replace(/tới/g, 'up to');
  const unitFix = (s) => s.replace(/(\d[\d.,]*)\s*tỷ\b/g, '$1B').replace(/(\d[\d.,]*)\s*triệu\b/g, '$1M').replace(/(\d[\d.,]*)\s*nghìn\b/g, '$1k').replace(/\bđồng\b/g, 'VND');
  // trả về bản dịch hoặc null nếu không dịch được
  function tr(text) {
    if (lang !== 'en' || text == null) return null;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text); if (!m || !m[2]) return null;
    const core = m[2]; let out = look(core);
    if (out == null) return null;
    return m[1] + out + m[3];
  }
  function look(core) {
    let v = dict.get(core); if (v != null) return v;
    if (!HAS_VI.test(core) && core.length > 40) return null;
    // số → {n}
    const nums = HASNUM.test(core) ? core.match(NUM) : null;
    if (nums) { const key = core.replace(NUM, '{n}'); const t = numDict.get(key) || dict.get(key); if (t != null) { let i = 0; return t.replace(/\{n\}/g, () => nums[Math.min(i++, nums.length - 1)]); } }
    if (HAS_VI.test(core)) { for (let i = 0; i < pats.length; i++) { const r = pats[i]; const hit = r[0].test(core); r[0].lastIndex = 0; if (hit) return core.replace(r[0], r[1]); } }
    // tách theo dấu phân cách
    const parts = core.split(/( · | — | – | → |\n| \| |: )/);
    if (parts.length > 1) { let any = false; const o = parts.map((p, i) => { if (i % 2) return p; if (!p.trim()) return p; let t = look(p.trim()); if (t == null) { const m = /^(.*?)(\s*\([^)]*\))$/.exec(p.trim()); if (m) { const b = look(m[1]); if (b != null) t = b + fixMoney(m[2]); } } if (t != null) { any = true; return t; } return p; }); if (any) return o.join(''); }
    if (HAS_VI.test(core)) {
      for (let i = 0; i < pats.length; i++) { const r = pats[i]; if (r[0].test(core)) { r[0].lastIndex = 0; return core.replace(r[0], r[1]); } r[0].lastIndex = 0; }
      const u = unitFix(core); if (u !== core && !HAS_VI.test(u)) return u; // chỉ là số tiền
    }
    return null;
  }

  // ---------------------------------------------------------------- DOM
  function trText(node) {
    const v = node.nodeValue; if (!v || !v.trim()) return;
    const o = orig.get(node);
    if (o && o.en === v) return; // đã dịch xong, chưa đổi
    const t = tr(v); if (t != null && t !== v) { orig.set(node, { vi: v, en: t }); applying = true; node.nodeValue = t; applying = false; } else if (o) orig.delete(node);
  }
  function trAttrs(el) {
    for (let i = 0; i < ATTRS.length; i++) {
      const a = ATTRS[i], v = el.getAttribute && el.getAttribute(a); if (!v) continue;
      const key = '__i18n_' + a, saved = el[key];
      if (saved && saved.en === v) continue;
      const t = tr(v); if (t != null && t !== v) { el[key] = { vi: v, en: t }; applying = true; el.setAttribute(a, t); applying = false; } else if (saved) delete el[key];
    }
    if (el.tagName === 'INPUT' && /^(button|submit)$/i.test(el.type) && el.value) { const t = tr(el.value); if (t != null) el.value = t; }
  }
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|CANVAS|TEXTAREA|CODE|PRE)$/;
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { trText(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.tagName)) return;
    trAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeType === 1 && SKIP.test(n.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let n; while ((n = w.nextNode())) { if (n.nodeType === 3) trText(n); else trAttrs(n); }
  }
  function flush() { raf = 0; const items = Array.from(queue); queue.clear(); items.forEach((n) => { if (n.isConnected !== false) walk(n); }); }
  function schedule(n) { queue.add(n); if (!raf) raf = requestAnimationFrame(flush); }
  function scheduleAll() { schedule(document.body); if (document.head) { const t = document.querySelector('title'); if (t) schedule(t); } }
  function startObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver((muts) => {
      if (applying || lang !== 'en') return;
      for (const m of muts) {
        if (m.type === 'childList') m.addedNodes.forEach((n) => schedule(n));
        else if (m.type === 'characterData') schedule(m.target);
        else if (m.type === 'attributes') schedule(m.target);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function restore() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    applying = true; while ((n = w.nextNode())) { const o = orig.get(n); if (o && n.nodeValue === o.en) { n.nodeValue = o.vi; orig.delete(n); } }
    document.querySelectorAll('*').forEach((el) => ATTRS.forEach((a) => { const s = el['__i18n_' + a]; if (s && el.getAttribute(a) === s.en) { el.setAttribute(a, s.vi); delete el['__i18n_' + a]; } }));
    applying = false;
  }

  // ---------------------------------------------------------------- canvas (minigame, nhãn 3D)
  (function patchCanvas() {
    const P = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype; if (!P || P.__i18n) return; P.__i18n = true;
    ['fillText', 'strokeText'].forEach((fn) => { const f = P[fn]; P[fn] = function (t) { if (lang === 'en' && typeof t === 'string' && HAS_VI.test(t)) { const x = tr(t); if (x != null) { arguments[0] = x; } } return f.apply(this, arguments); }; });
  })();

  // ---------------------------------------------------------------- nạp từ điển và công tắc
  function loadFiles(cb) {
    if (loading) return; loading = true; let left = FILES.length;
    FILES.forEach((f) => {
      const s = document.createElement('script'); s.src = 'js/' + f + '.js' + (window.KN_BUILD ? '?v=' + window.KN_BUILD : ''); s.async = true;
      const fin = () => { loaded[f] = true; if (--left === 0) { loading = false; if (cb) cb(); } };
      s.onload = fin; s.onerror = fin; document.head.appendChild(s);
    });
  }
  function apply() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
    const b = document.getElementById('knLang'); if (b) { b.textContent = lang === 'en' ? 'VI' : 'EN'; b.setAttribute('aria-label', lang === 'en' ? 'Chuyển sang tiếng Việt' : 'Switch to English'); b.title = b.getAttribute('aria-label'); b.__i18n_title = null; }
    if (lang === 'en') { startObserver(); scheduleAll(); } else { restore(); }
  }
  function setLang(l) {
    lang = l === 'en' ? 'en' : 'vi'; store.set(lang);
    if (lang === 'en' && !Object.keys(loaded).length) { apply(); loadFiles(() => { apply(); try { window.dispatchEvent(new Event('kn-lang')); } catch (e) { /* */ } }); } else { apply(); try { window.dispatchEvent(new Event('kn-lang')); } catch (e) { /* */ } }
  }
  function mountButton() {
    if (document.getElementById('knLang')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'knLang'; b.className = 'kn-lang'; b.textContent = lang === 'en' ? 'VI' : 'EN';
    b.setAttribute('aria-label', lang === 'en' ? 'Chuyển sang tiếng Việt' : 'Switch to English'); b.title = b.getAttribute('aria-label');
    b.onclick = () => { try { KN.Audio && KN.Audio.sfx('click'); } catch (e) { /* */ } setLang(lang === 'en' ? 'vi' : 'en'); };
    document.body.appendChild(b);
  }
  function boot() { mountButton(); document.documentElement.lang = lang; if (lang === 'en') { startObserver(); loadFiles(() => { apply(); }); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  KN.I18n = { add, tr, t: (s) => { const x = tr(s); return x == null ? s : x; }, get lang() { return lang; }, setLang, files: FILES, stats: () => ({ exact: dict.size, patterns: pats.length }), missing: () => { const out = new Set(); const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const v = n.nodeValue; if (v && v.trim() && HAS_VI.test(v) && !SKIP.test(n.parentNode.tagName || '')) out.add(v.trim()); } return Array.from(out); } };
})();
