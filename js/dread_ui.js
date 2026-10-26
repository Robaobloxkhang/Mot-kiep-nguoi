/* Một Kiếp Người — thành phần giao diện cho minigame Hầm ngục Dreadfall (chỉ trình bày, không giữ trạng thái trận):
   bộ biểu tượng SVG, ảnh nhỏ 3D vẽ từ chính các mô hình GLB (cùng góc máy, ánh sáng; lưu đệm), thẻ vật phẩm, bảng chi tiết + so sánh trang bị.
   Trạng thái (kho đồ, vàng, cấp độ…) nằm ở KN.DreadCore và js/dread.js. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const core = () => KN.DreadCore;

  // ---------------------------------------------------------------- biểu tượng SVG (nét 2px, viewBox 24)
  const P = {
    sword: '<path d="M20.5 3.5l-9.2 9.2"/><path d="M14 4h6.5V10.5"/><path d="M9 11l4 4"/><path d="M6.5 14.5l3 3"/><path d="M5.5 15.5L3.5 20.5l5-2"/>',
    axe: '<path d="M6 20L17 5"/><path d="M13 4c3.5-1 6.5 0 7.5 1.5-.5 3-3 5.5-6 6z"/>',
    fang: '<path d="M21 3c-6 1-12 6-15 14l2.5 2.5C16 16.5 20 10 21 3z"/><path d="M5 19l-2 2"/><path d="M8 14l3 3"/>',
    bow: '<path d="M6 3c9 3 9 15 0 18"/><path d="M6 3v18" stroke-width="1"/><path d="M9.5 12H21"/><path d="M18 9l3 3-3 3"/>',
    staff: '<path d="M6 21L15 9"/><circle cx="16.5" cy="6.5" r="3.5"/><path d="M16.5 3v-1.5M20 6.5h1.5M13 6.5h-1.5" stroke-width="1.5"/>',
    armor: '<path d="M8 3.5L3.5 7l2 4.5L8 10.5V20.5h8V10.5l2.5 1L20.5 7 16 3.5c-.7 1.5-2.2 2.5-4 2.5s-3.300-1-4-2.5z"/>',
    helmet: '<path d="M4.5 15a7.500 7.500 0 0115 0v5h-15z"/><path d="M4.500 15h15"/><path d="M12 7.500V15"/>',
    boots: '<path d="M8 3.500h6.500V12l5.500 3.500v4.500H5.500v-4.500L8 14z"/><path d="M5.500 17h14.500" stroke-width="1.500"/>',
    offhand: '<path d="M12 3l7.500 3v6c0 4.500-3.200 7.800-7.500 9.500C7.700 19.800 4.500 16.500 4.500 12V6z"/><path d="M12 7v10" stroke-width="1.500"/>',
    tome: '<path d="M5.500 4h11A2.500 2.500 0 0119 6.500V20H8a2.500 2.500 0 01-2.500-2.500z"/><path d="M5.500 17.500A2.500 2.500 0 018 15h11"/><path d="M11 8.500l1.200 1.700 1.800.300-1.200 1.400.300 1.800-2.100-1-2.100 1 .400-1.800-1.300-1.400 1.900-.300z" stroke-width="1"/>',
    ring: '<circle cx="12" cy="14.500" r="5.500"/><path d="M9 7.500L12 3l3 4.500-3 1.500z"/>',
    coin: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500v9M9.500 10c0-1.200 1.200-2 2.500-2s2.500.8 2.500 2-1.200 1.800-2.500 2-2.500.8-2.500 2 1.200 2 2.500 2 2.500-.8 2.500-2" stroke-width="1.500"/>',
    heart: '<path d="M12 20.500S3.500 15 3.500 9A4.500 4.500 0 0112 7a4.500 4.500 0 018.500 2c0 6-8.500 11.500-8.500 11.500z"/>',
    bolt: '<path d="M13 2.500L5 13.500h6l-1 8 8-11h-6z"/>',
    potion: '<path d="M9.500 3h5M10.500 3v5l-5 9a2.500 2.500 0 002.200 3.500h8.600a2.500 2.500 0 002.200-3.500l-5-9V3"/><path d="M8 15h8" stroke-width="1.500"/>',
    bag: '<path d="M8 7V6a4 4 0 018 0v1"/><path d="M5.500 7h13l1 13.500h-15z"/><path d="M9 11.500a3 3 0 006 0"/>',
    lock: '<rect x="5.500" y="10.500" width="13" height="10" rx="2"/><path d="M8.500 10.500V7.500a3.500 3.500 0 017 0v3"/>',
    star: '<path d="M12 3.500l2.600 5.300 5.800.800-4.200 4.100 1 5.800L12 16.800l-5.200 2.700 1-5.800-4.200-4.100 5.800-.800z"/>',
    skull: '<path d="M12 3.500c-4.500 0-7.500 3-7.500 7 0 2.500 1.200 4 2.500 5v3.500h10V15.500c1.300-1 2.500-2.500 2.500-5 0-4-3-7-7.500-7z"/><circle cx="9" cy="11" r="1.500"/><circle cx="15" cy="11" r="1.500"/><path d="M10.500 19v-2.500M13.500 19v-2.500" stroke-width="1.500"/>',
    scroll: '<path d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H8a3 3 0 01-3-3V6a2 2 0 012-2z"/><path d="M9 9h7M9 13h7" stroke-width="1.500"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M5.300 18.700l2.100-2.100M16.600 7.400l2.100-2.100"/>',
    shop: '<path d="M4 9l1.500-5h13L20 9"/><path d="M4 9a2.700 2.700 0 005.300 0 2.700 2.700 0 005.400 0A2.700 2.700 0 0020 9"/><path d="M5.500 12.500V20.500h13V12.500"/>',
    map: '<path d="M3.500 6l5.500-2.500 6 2.500 5.500-2.500v14L15 20.500l-6-2.500-5.500 2.500z"/><path d="M9 3.500V18M15 6v14.500" stroke-width="1.500"/>',
    zoomin: '<circle cx="10.500" cy="10.500" r="6"/><path d="M15 15l5.500 5.500M10.500 8v5M8 10.500h5"/>',
    zoomout: '<circle cx="10.500" cy="10.500" r="6"/><path d="M15 15l5.500 5.500M8 10.500h5"/>',
    reset: '<path d="M4 12a8 8 0 108-8H8"/><path d="M8 1.500L4.500 4.500 8 7.500"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    exit: '<path d="M10 4H5.500v16H10M14 8l4 4-4 4M18 12H9"/>',
    check: '<path d="M4.500 12.500l5 5L20 7"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8.500 20.500h7"/>',
    dash: '<path d="M4 8h9M2 12h13M5 16h9"/><path d="M15 6l6 6-6 6"/>',
    spin: '<path d="M20 12a8 8 0 11-3-6.200"/><path d="M20 3.500V8h-4.500"/>',
  };
  const ico = (n, cls, sz) => '<svg class="dri ' + (cls || '') + '" viewBox="0 0 24 24" width="' + (sz || 18) + '" height="' + (sz || 18) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || P.bag) + '</svg>';
  const iconName = (it) => (it.slot === 'weapon' ? (['sword', 'axe', 'fang', 'bow', 'staff'].includes(it.base) ? it.base : 'sword') : it.slot);
  // ảnh nhỏ 3D chỉ có cho vũ khí cận chiến (có mô hình GLB); còn lại dùng biểu tượng
  const WTHUMB = { sword: 'weapon_iron_sword', axe: 'weapon_grave_axe', fang: 'weapon_nightfang' };
  const thumbSpec = (it) => (it.slot === 'weapon' && WTHUMB[it.base] ? { model: WTHUMB[it.base], rz: -0.75 } : null);
  const thumbAttr = (s) => (s ? ' data-th="' + esc(s.model) + '|' + (s.tint || 0) + '|' + (s.rz || 0) + '|' + (s.ry || 0) + '|' + (s.fit || 1) + '"' : '');

  // ---------------------------------------------------------------- hình học GLB dùng chung (cảnh chính + ảnh nhỏ)
  const geos = {};
  function geo(name) {
    if (!geos[name]) {
      const T = window.THREE;
      geos[name] = core().loadGlb(name).then((g) => {
        const bg = new T.BufferGeometry();
        bg.setAttribute('position', new T.BufferAttribute(g.pos, 3)); bg.setAttribute('color', new T.BufferAttribute(g.col, 3)); bg.setIndex(new T.BufferAttribute(g.idx, 1)); bg.computeVertexNormals(); bg.computeBoundingBox(); bg.computeBoundingSphere(); bg.userData.parts = g.parts;
        return bg;
      });
      geos[name].catch(() => { delete geos[name]; });
    }
    return geos[name];
  }
  // ---------------------------------------------------------------- ảnh nhỏ: một bộ vẽ chung, cùng góc máy và ánh sáng, kết quả lưu đệm
  const thumbCache = {}; let tr = null, tsc = null, tcam = null, chain = Promise.resolve();
  function thumbInit() {
    const T = window.THREE; if (tr) return;
    tr = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); tr.setSize(256, 160, false); tr.setPixelRatio(1); tr.setClearColor(0x000000, 0);
    tsc = new T.Scene(); tsc.add(new T.HemisphereLight(0xdfe3ff, 0x4a3a30, 1.15)); const d = new T.DirectionalLight(0xfff0d8, 0.9); d.position.set(-3, 5, 4); tsc.add(d);
    tcam = new T.PerspectiveCamera(30, 1.6, 0.1, 200);
  }
  function thumb(key) {
    if (thumbCache[key]) return thumbCache[key];
    const [model, tint, rz, ry, fit] = key.split('|');
    const job = chain.then(async () => {
      const T = window.THREE; thumbInit(); const g = await geo(model);
      const m = new T.MeshLambertMaterial({ vertexColors: true, flatShading: true }); if (+tint) m.color.setHex(+tint);
      const mesh = new T.Mesh(g, m), grp = new T.Group(), c = g.boundingSphere.center; mesh.position.set(-c.x, -c.y, -c.z); grp.add(mesh); grp.rotation.set(0, +ry, +rz); tsc.add(grp);
      const r = g.boundingSphere.radius / (+fit || 1), dist = r / Math.sin(tcam.fov * Math.PI / 360) * 1.04;
      tcam.position.set(dist * 0.42, dist * 0.34, dist * 0.84); tcam.lookAt(0, 0, 0); tr.render(tsc, tcam);
      const url = tr.domElement.toDataURL('image/png'); tsc.remove(grp); m.dispose(); return url;
    }).catch(() => '');
    chain = job.then(() => 0, () => 0); thumbCache[key] = job; return job;
  }
  function hydrate(root) { if (!root || !window.THREE || !core().webgl()) return; root.querySelectorAll('img[data-th]').forEach((im) => { if (im.dataset.done) return; im.dataset.done = '1'; thumb(im.dataset.th).then((u) => { if (u && im.isConnected) { im.src = u; im.classList.add('ok'); } }); }); }
  function disposeThumbs() { try { if (tr) { tr.dispose(); tr = null; tsc = null; tcam = null; } } catch (e) { /* */ } }

  // ---------------------------------------------------------------- thẻ vật phẩm
  const SHORT = { atk: 'Công', def: 'Giáp', hp: 'Máu', crit: 'Chí mạng', life: 'Hút máu', speed: 'Tốc chạy', gold: 'Vàng', cdr: 'Hồi chiêu' };
  function keyStats(it, n) {
    const c = core(), v = c.statVals(it), out = [];
    c.STAT_DEFS.forEach(([k]) => { if (v[k] && out.length < (n || 2)) out.push(SHORT[k] + ' ' + (['atk', 'def', 'hp'].includes(k) ? '' : '+') + c.fmtStat(k, v[k])); });
    return out;
  }
  const iconBox = (it, big) => { const sp = thumbSpec(it); return '<span class="ib' + (big ? ' big' : '') + '">' + (sp ? '<img alt="" data-th-wrap' + thumbAttr(sp) + '>' : '') + ico(iconName(it), sp ? 'under' : '', big ? 34 : 24) + '</span>'; };
  // opts: { sel, equipped, price, afford, onlyBuy }
  function card(it, o) {
    o = o || {}; const c = core(), R = c.RARITY[it.rar] || c.RARITY[0], ks = keyStats(it, 2), lock = !!it.fav;
    return '<button type="button" class="dc' + (o.sel ? ' sel' : '') + (o.equipped ? ' eqd' : '') + '" style="--rc:' + R.color + '" data-id="' + esc(it.id) + '" aria-pressed="' + !!o.sel + '" aria-label="' + esc(it.name + ', ' + R.name + ', cấp yêu cầu ' + (it.req || 1) + (o.equipped ? ', đang trang bị' : '') + (lock ? ', đã khóa' : '')) + '">' +
      iconBox(it) + '<span class="nm">' + esc(it.name) + '</span><span class="lv">Cấp ' + (it.req || 1) + ' · ' + esc(R.name) + '</span><span class="st">' + ks.map(esc).join('<br>') + '</span>' +
      (o.price != null ? '<span class="pr' + (o.afford ? '' : ' no') + '">' + ico('coin', '', 13) + ' ' + o.price + '</span>' : '') +
      '<span class="fl">' + (o.equipped ? '<b class="e" title="Đang trang bị">E</b>' : '') + (lock ? '<b class="f" title="Đã khóa / yêu thích">' + ico('lock', '', 11) + '</b>' : '') + '</span></button>';
  }
  // ô trang bị: một hàng gọn (biểu tượng, nhãn ngắn, tên món); độ hiếm chỉ thể hiện bằng vạch màu bên trái
  function slot(s, it, o) {
    const c = core(), R = it ? c.RARITY[it.rar] : null;
    return '<button type="button" class="ds' + (o && o.sel ? ' sel' : '') + (it ? '' : ' empty') + '" data-slot="' + s.id + '" style="--rc:' + (R ? R.color : 'transparent') + '" aria-pressed="' + !!(o && o.sel) + '" aria-label="' + esc(s.name + ': ' + (it ? it.name + ', ' + R.name : 'trống')) + '">' +
      (it ? iconBox(it) : '<span class="ib">' + ico(s.type, 'ph', 22) + '</span>') + '<span class="tx"><small>' + esc(s.name) + '</small><b>' + esc(it ? it.name : 'Trống') + '</b></span></button>';
  }
  // bảng chi tiết + so sánh với món đang mặc
  // ctx: { meta, equippedSlot (id ô đang mặc món này hoặc ''), target (id ô đích), actions: 'inv'|'shop', price, afford, lvl }
  function detail(it, ctx) {
    const c = core(), R = c.RARITY[it.rar] || c.RARITY[0], T = c.TYPES.find((t) => t.id === it.slot), v = c.statVals(it), meta = ctx.meta;
    const cur = ctx.equippedSlot ? null : meta.eq[ctx.target];
    const cv = cur ? c.statVals(cur) : {}, keys = c.STAT_DEFS.map((d) => d[0]).filter((k) => v[k] || (cur && cv[k]));
    const lvlOk = c.levelOf(meta.xp).level >= (it.req || 1);
    let rows = keys.map((k) => {
      const lab = c.STAT_DEFS.find((d) => d[0] === k)[1], nv = v[k] || 0, ov = cv[k] || 0, d = nv - ov, pct = ['crit', 'life', 'speed', 'gold', 'cdr'].includes(k);
      let cmp = '';
      if (cur) { const ds = (pct ? Math.round(Math.abs(d) * 100) + '%' : String(Math.round(Math.abs(d)))); const same = Math.abs(d) < (pct ? 0.005 : 0.5); cmp = same ? '<em class="cz">= không đổi</em>' : d > 0 ? '<em class="cu">▲ +' + ds + '</em>' : '<em class="cd">▼ −' + ds + '</em>'; }
      return '<li><span>' + esc(lab) + '</span><b>' + (nv ? (pct ? '+' : '') + c.fmtStat(k, nv) : '0') + '</b>' + cmp + '</li>';
    }).join('');
    const wb = it.slot === 'weapon' ? c.baseOf(it) : null;
    const eff = (it.aff || []).map((a) => { const d = (c.AFFIX || []).find((x) => x.k === a.k); return ''; }).join('');
    const aff = (it.aff || []).length ? '<p class="dfx"><b>Hiệu ứng đặc biệt</b><br>' + it.aff.map((a) => esc(affText(a))).join('<br>') + '</p>' : '';
    const label = ctx.equippedSlot ? 'Đang trang bị' : cur ? 'So với: ' + esc(cur.name) : (ctx.target && !meta.eq[ctx.target] ? 'Ô ' + esc(c.SLOTS.find((s) => s.id === ctx.target).name) + ' đang trống' : '');
    let acts = '';
    if (ctx.actions === 'shop') acts = '<button type="button" class="btn btn-primary btn-sm" data-act="buy"' + (ctx.afford ? '' : ' disabled') + '>' + (ctx.afford ? 'Mua · ' + ctx.price + ' vàng' : 'Thiếu ' + (ctx.price - meta.gold) + ' vàng') + '</button>';
    else {
      const slots = c.slotsFor(it);
      if (ctx.equippedSlot) acts += '<button type="button" class="btn btn-soft btn-sm" data-act="unequip">Tháo ra</button>';
      else slots.forEach((sid) => { const sn = c.SLOTS.find((s) => s.id === sid).name; const why = c.canEquip(meta, it, sid); acts += '<button type="button" class="btn btn-primary btn-sm" data-act="equip" data-slot="' + sid + '"' + (why ? ' disabled title="' + esc(why) + '"' : '') + '>' + (slots.length > 1 ? 'Mang vào ' + esc(sn) : 'Trang bị') + '</button>'; });
      acts += '<button type="button" class="btn btn-soft btn-sm" data-act="fav" aria-pressed="' + !!it.fav + '">' + ico('lock', '', 14) + (it.fav ? ' Bỏ khóa' : ' Khóa/Yêu thích') + '</button>';
      if (!ctx.equippedSlot) acts += '<button type="button" class="btn btn-ghost btn-sm" data-act="sell"' + (it.fav ? ' disabled title="Món đã khóa, bỏ khóa trước khi bán"' : '') + '>Bán ' + c.sellValue(it) + ' vàng</button>';
    }
    const warn = !lvlOk ? '<p class="dwarn">Cần cấp ' + (it.req || 1) + ' để trang bị (bạn đang cấp ' + c.levelOf(meta.xp).level + ').</p>' : '';
    return '<div class="dd" style="--rc:' + R.color + '"><div class="dh">' + iconBox(it, true) + '<div><h4>' + esc(it.name) + '</h4><p><span class="rb">' + esc(R.name) + '</span> ' + esc(T ? T.name : '') + (wb ? ' · ' + (wb.melee ? 'Cận chiến' : 'Tầm xa') : '') + '</p><p class="dreq' + (lvlOk ? '' : ' bad') + '">Yêu cầu cấp ' + (it.req || 1) + '</p></div></div>' +
      (label ? '<p class="dcmp">' + label + '</p>' : '') + '<ul class="dst">' + (rows || '<li><span>Không có chỉ số</span></li>') + '</ul>' + aff + warn + '<div class="dact">' + acts + '</div></div>';
  }
  function affText(a) { const f = { crit: (v) => '+' + Math.round(v * 100) + '% chí mạng', life: (v) => '+' + Math.round(v * 100) + '% hút máu', speed: (v) => '+' + Math.round(v * 100) + '% tốc chạy', hp: (v) => '+' + Math.round(v) + ' máu', gold: (v) => '+' + Math.round(v * 100) + '% vàng nhặt', cdr: (v) => '−' + Math.round(v * 100) + '% hồi chiêu kỹ năng' }[a.k]; return f ? f(a.v) : a.k; }

  KN.DreadUI = { ico, iconName, thumbSpec, thumbAttr, thumb, hydrate, disposeThumbs, geo, card, slot, detail, keyStats, esc };
})();
