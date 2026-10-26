/* Một Kiếp Người — lõi dữ liệu cho minigame Hầm ngục Dreadfall (js/dread.js):
   đọc mô hình GLB, dựng cảnh 3D, trang bị (độ hiếm, chỉ số phụ), kho đồ lưu trên máy, danh sách hầm ngục và bộ tạo bản đồ phòng ngẫu nhiên.
   Mô hình 3D lấy từ bộ DREADFALL — Dark Fantasy Dungeon Kit (assets/dread/*.glb, mô hình tĩnh, màu theo đỉnh). */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const BASE = 'assets/dread/';

  // ---------------------------------------------------------------- đọc tệp GLB (mô hình tĩnh, POSITION + COLOR_0 + chỉ số)
  const cache = {};
  function parseGlb(buf) {
    const dv = new DataView(buf), jl = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
    const bin = 20 + jl + 8;
    const read = (i) => {
      const a = json.accessors[i], bv = json.bufferViews[a.bufferView], off = bin + (bv.byteOffset || 0) + (a.byteOffset || 0), n = { SCALAR: 1, VEC3: 3, VEC4: 4 }[a.type];
      if (a.componentType === 5126) return { n, a: new Float32Array(buf.slice(off, off + a.count * n * 4)) };
      if (a.componentType === 5125) return { n, a: new Uint32Array(buf.slice(off, off + a.count * n * 4)) };
      if (a.componentType === 5123) return { n, a: new Uint16Array(buf.slice(off, off + a.count * n * 2)) };
      if (a.componentType === 5121) return { n, a: new Uint8Array(buf.slice(off, off + a.count * n)), norm: true };
      throw new Error('kiểu dữ liệu GLB chưa hỗ trợ');
    };
    const P = [], C = [], I = []; let base = 0;
    json.meshes.forEach((m) => m.primitives.forEach((p) => {
      const pos = read(p.attributes.POSITION), col = p.attributes.COLOR_0 != null ? read(p.attributes.COLOR_0) : null, cnt = pos.a.length / 3;
      for (let i = 0; i < pos.a.length; i++) P.push(pos.a[i]);
      for (let i = 0; i < cnt; i++) { if (col) { const k = col.n, s = col.norm ? 255 : 1; C.push(col.a[i * k] / s, col.a[i * k + 1] / s, col.a[i * k + 2] / s); } else C.push(0.7, 0.7, 0.7); }
      if (p.indices != null) { const ix = read(p.indices).a; for (let i = 0; i < ix.length; i++) I.push(ix[i] + base); } else for (let i = 0; i < cnt; i++) I.push(base + i);
      base += cnt;
    }));
    return { pos: new Float32Array(P), col: new Float32Array(C), idx: new Uint32Array(I) };
  }
  function loadGlb(name) {
    if (!cache[name]) { cache[name] = fetch(BASE + name + '.glb').then((r) => { if (!r.ok) throw new Error('404'); return r.arrayBuffer(); }).then(parseGlb); cache[name].catch(() => { delete cache[name]; }); }
    return cache[name];
  }
  const webgl = () => { try { const c = document.createElement('canvas'); return !!(window.THREE && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } };

  // ---------------------------------------------------------------- hầm ngục (5 hầm), mức độ khó
  const DUNGEONS = [
    { id: 'bone', name: 'Hành lang Xương', icon: '🦴', blurb: 'Bộ xương và yêu tinh lang thang trong hành lang cũ.', rooms: 6, mobs: ['goblin', 'skeleton'], boss: 'skeleton_king', theme: { floor: [0x4a3a46, 0x3b2d38], wall: 0x2c2230, trim: 0x7a4a3a, torch: 0xff9a4a, fog: 0x0b0810 }, lvl: 1, unlock: null, env: 'environment_bone_passage' },
    { id: 'sewer', name: 'Cổng Nguyền Rủa', icon: '👺', blurb: 'Bầy yêu tinh đông đúc, đánh nhanh nhưng yếu máu.', rooms: 7, mobs: ['goblin', 'goblin', 'skeleton'], boss: 'goblin_chief', theme: { floor: [0x2f4a38, 0x27402f], wall: 0x1c2e24, trim: 0x5a7a3a, torch: 0x9aff6a, fog: 0x07100b }, lvl: 2, unlock: 'bone' },
    { id: 'ash', name: 'Hầm mộ Tro', icon: '👻', blurb: 'Bóng ma bắn tia ma thuật từ xa, cần di chuyển liên tục.', rooms: 7, mobs: ['skeleton', 'wraith'], boss: 'wraith_queen', theme: { floor: [0x4a4558, 0x3d384a], wall: 0x262235, trim: 0x6a5aa0, torch: 0xb78bff, fog: 0x0a0912 }, lvl: 3, unlock: 'sewer', env: 'environment_crypt_of_ash' },
    { id: 'throne', name: 'Ngai Vua Rồng', icon: '👑', blurb: 'Quái hỗn hợp và trùm Hiệp sĩ Tro cùng bộ xương hộ vệ.', rooms: 8, mobs: ['skeleton', 'wraith', 'goblin'], boss: 'boss', theme: { floor: [0x50403a, 0x42342f], wall: 0x2e2220, trim: 0xa07a3a, torch: 0xffb347, fog: 0x0d0907 }, lvl: 4, unlock: 'ash', env: 'environment_hollow_throne' },
    { id: 'abyss', name: 'Vực Linh Hồn', icon: '🌀', blurb: 'Hầm ngục khó nhất: quái mạnh, hai trùm, chiến lợi phẩm huyền thoại.', rooms: 9, mobs: ['wraith', 'skeleton', 'wraith', 'goblin'], boss: 'boss', boss2: 'wraith_queen', theme: { floor: [0x2a2a4a, 0x22223e], wall: 0x15152b, trim: 0x4a6aff, torch: 0x5ac8ff, fog: 0x05060f }, lvl: 5, unlock: 'throne' },
  ];
  // bổ sung: cấp khuyến nghị, độ khó sao, mô hình môi trường dùng làm ảnh nhỏ, bảng rơi đồ (Thường→Thần thoại)
  const DG_EXTRA = { bone: { rec: 1, stars: 1, env: 'environment_bone_passage', loot: [62, 28, 8, 1.8, 0.2, 0.02] }, sewer: { rec: 3, stars: 2, env: null, loot: [50, 30, 14, 4.5, 0.5, 0.04] }, ash: { rec: 5, stars: 3, env: 'environment_crypt_of_ash', loot: [40, 30, 20, 8, 1.8, 0.1] }, throne: { rec: 8, stars: 4, env: 'environment_hollow_throne', loot: [30, 28, 26, 12, 3.5, 0.3] }, abyss: { rec: 11, stars: 5, env: null, loot: [20, 25, 30, 17, 6.5, 1.0] } };
  DUNGEONS.forEach((d) => Object.assign(d, DG_EXTRA[d.id]));
  const TIERS = [
    { id: 0, name: 'Thường', hp: 1, dmg: 1, gold: 1, rar: 0, money: 1 },
    { id: 1, name: 'Khó', hp: 1.5, dmg: 1.3, gold: 1.6, rar: 0.5, money: 1.8 },
    { id: 2, name: 'Ác mộng', hp: 2.3, dmg: 1.7, gold: 2.6, rar: 1.0, money: 3 },
  ];
  // quái: model GLB, chiều cao, chỉ số gốc
  const MOBS = {
    goblin: { model: 'monster_gutter_goblin', h: 1.6, hp: 70, speed: 3.4, dmg: 10, reach: 1.35, wind: 0.32, cd: 0.8, r: 0.45, name: 'Yêu tinh cống' },
    skeleton: { model: 'monster_bone_skeleton', h: 2.05, hp: 130, speed: 2.6, dmg: 15, reach: 1.55, wind: 0.5, cd: 1.05, r: 0.5, name: 'Bộ xương' },
    wraith: { model: 'monster_crypt_wraith', h: 1.8, hp: 125, speed: 2.2, dmg: 16, reach: 5.2, wind: 0.55, cd: 1.7, r: 0.5, ranged: true, float: 0.45, name: 'Bóng ma' },
    boss: { model: 'boss_ashen_knight', h: 3.4, hp: 900, speed: 2.4, dmg: 24, reach: 2.4, wind: 0.65, cd: 1.3, r: 1.0, boss: true, name: 'Hiệp sĩ Tro' },
    skeleton_king: { model: 'monster_bone_skeleton', h: 3.2, hp: 700, speed: 2.4, dmg: 20, reach: 2.2, wind: 0.6, cd: 1.2, r: 0.95, boss: true, tint: 0x553322, name: 'Vua Xương' },
    goblin_chief: { model: 'monster_gutter_goblin', h: 3.0, hp: 650, speed: 3.0, dmg: 18, reach: 2.0, wind: 0.5, cd: 1.0, r: 0.9, boss: true, tint: 0x663311, name: 'Yêu tinh chúa' },
    wraith_queen: { model: 'monster_crypt_wraith', h: 3.0, hp: 600, speed: 2.4, dmg: 20, reach: 6, wind: 0.6, cd: 1.5, r: 0.9, boss: true, ranged: true, float: 0.6, tint: 0x331166, name: 'Nữ hoàng Bóng ma' },
  };

  // ---------------------------------------------------------------- trang bị
  const RARITY = [
    { id: 0, name: 'Thường', color: '#c9c9d6', mul: 1, aff: 0 },
    { id: 1, name: 'Tốt', color: '#6cd88a', mul: 1.18, aff: 1 },
    { id: 2, name: 'Hiếm', color: '#5aa8ff', mul: 1.4, aff: 2 },
    { id: 3, name: 'Sử thi', color: '#c070ff', mul: 1.7, aff: 3 },
    { id: 4, name: 'Huyền thoại', color: '#ffb02e', mul: 2.1, aff: 4 },
    { id: 5, name: 'Thần thoại', color: '#ff4a5e', mul: 2.6, aff: 4 },
  ];
  // vũ khí gốc: model GLB (cận chiến) hoặc kiểu dựng tay (tầm xa)
  const WEAPONS = [
    { base: 'sword', name: 'Kiếm sắt', icon: '🗡️', model: 'weapon_iron_sword', h: 1.7, atk: 15, range: 1.9, cd: 0.62, melee: true },
    { base: 'axe', name: 'Rìu Mộ', icon: '🪓', model: 'weapon_grave_axe', h: 1.5, atk: 22, range: 2.1, cd: 0.78, melee: true },
    { base: 'fang', name: 'Nanh Đêm', icon: '⚔️', model: 'weapon_nightfang', h: 2.1, atk: 30, range: 2.4, cd: 0.66, melee: true, minLvl: 3 },
    { base: 'bow', name: 'Cung Cốt', icon: '🏹', proc: 'bow', atk: 11, range: 9, cd: 0.52, melee: false },
    { base: 'staff', name: 'Trượng Tro', icon: '🔮', proc: 'staff', atk: 13, range: 8, cd: 0.7, melee: false, minLvl: 2 },
  ];
  const ARMORS = [{ base: 'leather', name: 'Giáp da', hp: 18, def: 3 }, { base: 'rust', name: 'Giáp Rỉ', hp: 30, def: 6, minLvl: 2 }, { base: 'hollow', name: 'Giáp Rỗng', hp: 46, def: 9, minLvl: 4 }];
  const HELMETS = [{ base: 'cap', name: 'Mũ da', hp: 10, def: 2 }, { base: 'helm', name: 'Mũ Sắt', hp: 18, def: 4, minLvl: 2 }, { base: 'horn', name: 'Mũ Sừng Tro', hp: 26, def: 6, crit: 0.02, minLvl: 3 }];
  const BOOTS = [{ base: 'sandal', name: 'Dép Cỏ', hp: 6, speed: 0.04 }, { base: 'boots', name: 'Giày Da', hp: 10, def: 2, speed: 0.05, minLvl: 2 }, { base: 'greaves', name: 'Ống Chân Tro', hp: 16, def: 4, speed: 0.07, minLvl: 4 }];
  const OFFHANDS = [{ base: 'buckler', name: 'Khiên Gỗ', hp: 10, def: 4 }, { base: 'tower', name: 'Khiên Tháp', hp: 20, def: 8, minLvl: 2 }, { base: 'tome', name: 'Sách Tro', hp: 8, crit: 0.04, cdr: 0.06, minLvl: 3 }];
  const RINGS = [{ base: 'ember', name: 'Mặt dây Than', hp: 15 }, { base: 'soul', name: 'Nhẫn Linh hồn', crit: 0.05 }, { base: 'ash', name: 'Vòng Tro', speed: 0.05 }];
  // các ô trang bị (type = loại vật phẩm được phép đặt vào ô). Ô 'ring' giữ tên cũ để tương thích save cũ.
  const SLOTS = [
    { id: 'helmet', type: 'helmet', name: 'Mũ' }, { id: 'armor', type: 'armor', name: 'Giáp ngực' }, { id: 'boots', type: 'boots', name: 'Giày' },
    { id: 'weapon', type: 'weapon', name: 'Vũ khí' }, { id: 'offhand', type: 'offhand', name: 'Tay phụ' }, { id: 'ring', type: 'ring', name: 'Phụ kiện 1' }, { id: 'ring2', type: 'ring', name: 'Phụ kiện 2' },
  ];
  const TYPES = [{ id: 'weapon', name: 'Vũ khí', pool: WEAPONS }, { id: 'offhand', name: 'Tay phụ', pool: OFFHANDS }, { id: 'helmet', name: 'Mũ', pool: HELMETS }, { id: 'armor', name: 'Giáp', pool: ARMORS }, { id: 'boots', name: 'Giày', pool: BOOTS }, { id: 'ring', name: 'Phụ kiện', pool: RINGS }];
  const PRE = ['Gỉ sét', 'Cũ kỹ', 'Sắc bén', 'Tinh luyện', 'Cổ ngữ', 'Nguyền rủa', 'Thiêng liêng', 'Của Vua Rỗng'];
  const PRE_L = ['Bất diệt', 'Hoàng kim', 'Hắc ám', 'Của Vua Rồng', 'Thất truyền'];
  const AFFIX = [
    { k: 'crit', label: 'Chí mạng', fmt: (v) => '+' + Math.round(v * 100) + '% chí mạng', range: [0.03, 0.08] },
    { k: 'life', label: 'Hút máu', fmt: (v) => '+' + Math.round(v * 100) + '% hút máu', range: [0.02, 0.06] },
    { k: 'speed', label: 'Nhanh nhẹn', fmt: (v) => '+' + Math.round(v * 100) + '% tốc chạy', range: [0.04, 0.1] },
    { k: 'hp', label: 'Cứng cáp', fmt: (v) => '+' + Math.round(v) + ' máu', range: [8, 22] },
    { k: 'gold', label: 'Đa kim', fmt: (v) => '+' + Math.round(v * 100) + '% vàng', range: [0.1, 0.3] },
    { k: 'cdr', label: 'Hồi chiêu', fmt: (v) => '-' + Math.round(v * 100) + '% hồi kỹ năng', range: [0.08, 0.2] },
  ];
  // bảng rơi đồ: trọng số độ hiếm theo từng hầm ngục (Thường, Tốt, Hiếm, Sử thi, Huyền thoại, Thần thoại); độ khó nâng các bậc cao theo TIERS[].rar
  const lootWeights = (dg, tier) => { const base = (dg && dg.loot) || [60, 28, 9, 2.5, 0.5, 0.05]; return base.map((w, i) => w * (1 + (tier ? tier.rar : 0) * i * 0.7)); };
  const TYPE_W = { weapon: 3, offhand: 2, helmet: 2, armor: 2, boots: 2, ring: 2 };
  let uid = Date.now() % 1e6;
  function rollRarity(w) { const t = w.reduce((a, b) => a + b, 0); let r = Math.random() * t; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; } return 0; }
  function rollItem(lvl, tierBias, slot, minRar, weights) {
    let rar;
    if (weights) rar = rollRarity(weights);
    else { const r0 = Math.random() * (1 + lvl * 0.12), bias = (tierBias || 0) * 0.5 + lvl * 0.05; rar = r0 + bias < 0.55 ? 0 : r0 + bias < 0.85 ? 1 : r0 + bias < 1.12 ? 2 : r0 + bias < 1.35 ? 3 : 4; }
    rar = Math.min(RARITY.length - 1, Math.max(rar, minRar || 0));
    if (!slot) { const bag = []; TYPES.forEach((t) => { for (let i = 0; i < TYPE_W[t.id]; i++) bag.push(t.id); }); slot = pick(bag); }
    const R = RARITY[rar], T = TYPES.find((t) => t.id === slot) || TYPES[0], pool0 = T.pool.filter((b) => !b.minLvl || lvl >= b.minLvl), b = pick(pool0.length ? pool0 : T.pool);
    const it = { slot: T.id, base: b.base, name: b.name };
    ['atk', 'hp', 'def'].forEach((k) => { if (b[k]) it[k] = Math.round(b[k] * R.mul * rand(0.9, 1.1)); });
    ['crit', 'speed', 'cdr'].forEach((k) => { if (b[k]) it[k] = +(b[k] * R.mul).toFixed(3); });
    it.rar = rar; it.lvl = lvl; it.req = Math.max(1, Math.round(1 + (lvl - 1) * 1.3 + rar * 0.7)); it.id = 'i' + (uid++).toString(36) + Math.floor(Math.random() * 1e3).toString(36); it.aff = []; it.fav = false;
    const apool = AFFIX.filter((a) => !(it.slot === 'weapon' && a.k === 'hp') && (it[a.k] == null || !['crit', 'speed', 'hp', 'cdr'].includes(a.k)));
    for (let i = 0; i < R.aff && apool.length; i++) { const a = apool.splice(Math.floor(Math.random() * apool.length), 1)[0], v = a.k === 'hp' ? Math.round(rand(...a.range) * R.mul) : +(rand(...a.range) * R.mul).toFixed(3); it.aff.push({ k: a.k, v }); }
    if (rar >= 1) it.name = (rar >= 4 ? pick(PRE_L) : pick(PRE)) + ' ' + it.name;
    return it;
  }
  const baseOf = (it) => { const T = TYPES.find((t) => t.id === it.slot); return (T && T.pool.find((x) => x.base === it.base)) || null; };
  // danh sách chỉ số (để so sánh): [khóa, nhãn, giá trị, kiểu hiển thị]
  const STAT_DEFS = [['atk', 'Tấn công', 'n'], ['def', 'Giáp', 'n'], ['hp', 'Máu', 'n'], ['crit', 'Chí mạng', 'p'], ['life', 'Hút máu', 'p'], ['speed', 'Tốc chạy', 'p'], ['gold', 'Vàng nhặt', 'p'], ['cdr', 'Giảm hồi chiêu', 'p']];
  function statVals(it) { const v = {}; if (!it) return v; STAT_DEFS.forEach(([k]) => { let x = it[k] || 0; (it.aff || []).forEach((a) => { if (a.k === k) x += a.v; }); if (x) v[k] = x; }); return v; }
  const fmtStat = (k, x) => { const d = STAT_DEFS.find((s) => s[0] === k); return d && d[2] === 'p' ? Math.round(x * 100) + '%' : String(Math.round(x)); };
  const statsText = (it) => {
    const p = [], v = statVals(it);
    STAT_DEFS.forEach(([k, l]) => { if (v[k]) p.push(l + ' ' + (['atk', 'def', 'hp'].includes(k) ? '' : '+') + fmtStat(k, v[k])); });
    const wb = it.slot === 'weapon' ? baseOf(it) : null; if (wb) p.push(wb.melee ? 'Cận chiến · tầm ' + wb.range : 'Tầm xa · ' + wb.range + ' m');
    return p.join(' · ');
  };
  const sellValue = (it) => Math.round((it.atk || it.hp || it.def || 10) * (1 + it.rar * 1.2) * (4 + it.rar * 3) / 2);
  const buyPrice = (it) => sellValue(it) * 4;
  // tổng hợp chỉ số trang bị
  function gearStats(eq) {
    const g = { atk: 0, hp: 0, def: 0, crit: 0, life: 0, speed: 0, gold: 0, cdr: 0, weapon: null };
    SLOTS.forEach((s) => { const it = eq && eq[s.id]; if (!it) return; if (s.id === 'weapon') g.weapon = it; const v = statVals(it); Object.keys(v).forEach((k) => { g[k] += v[k]; }); });
    return g;
  }

  // ---------------------------------------------------------------- cấp độ, điểm kỹ năng
  const MAXLV = 30, xpNeed = (l) => 40 + 25 * l;
  function levelOf(xp) { let l = 1, x = xp || 0; while (l < MAXLV && x >= xpNeed(l)) { x -= xpNeed(l); l++; } return { level: l, cur: l >= MAXLV ? 0 : x, need: l >= MAXLV ? 0 : xpNeed(l) }; }
  const SKILLS = [
    { k: 'health', name: 'Sinh lực', per: 6, unit: ' máu', desc: '+6 máu tối đa mỗi điểm' },
    { k: 'phys', name: 'Sức mạnh vật lý', per: 1.5, unit: ' công', desc: '+1,5 sát thương vũ khí cận chiến mỗi điểm' },
    { k: 'spell', name: 'Phép thuật', per: 1.5, unit: ' công', desc: '+1,5 sát thương vũ khí tầm xa (cung, trượng) mỗi điểm' },
    { k: 'def', name: 'Phòng thủ', per: 1, unit: ' giáp', desc: '+1 giáp mỗi điểm' },
    { k: 'crit', name: 'Chí mạng', per: 0.005, unit: '%', pct: true, desc: '+0,5% tỉ lệ chí mạng mỗi điểm' },
    { k: 'speed', name: 'Tốc độ chạy', per: 0.008, unit: '%', pct: true, desc: '+0,8% tốc độ chạy mỗi điểm' },
  ];
  const SP_PER_LEVEL = 2;
  const spSpent = (m) => SKILLS.reduce((a, s) => a + ((m.sp && m.sp[s.k]) || 0), 0);
  const spFree = (m) => (levelOf(m.xp).level - 1) * SP_PER_LEVEL - spSpent(m);
  // chỉ số hiệu dụng của nhân vật: st = chỉ số cuộc đời {health, smarts}
  const STATB = { hp: 70, hpPerHealth: 0.7, def: 8, defPerHealth: 0.1, speed: 4.3, speedPerHealth: 0.006, crit: 0.08, critPerSmarts: 0.001 };
  function calcStats(meta, st) {
    const g = gearStats(meta.eq), sp = meta.sp || {}, w = g.weapon, wb = w ? baseOf(w) : null, melee = !wb || wb.melee;
    st = st || { health: 50, smarts: 50 };
    const v = { phys: (sp.phys || 0) * 1.5, spell: (sp.spell || 0) * 1.5 };
    return {
      level: levelOf(meta.xp).level, maxHP: Math.round(STATB.hp + st.health * STATB.hpPerHealth + g.hp + (sp.health || 0) * 6), def: STATB.def + st.health * STATB.defPerHealth + g.def + (sp.def || 0),
      atk: (w ? (g.atk || w.atk) : 12) + Math.round(st.smarts * 0.02) + (melee ? v.phys : v.spell), melee, spd: STATB.speed * (1 + (st.health - 50) * STATB.speedPerHealth) * (1 + g.speed + (sp.speed || 0) * 0.008),
      crit: STATB.crit + st.smarts * STATB.critPerSmarts + g.crit + (sp.crit || 0) * 0.005, life: g.life, goldMul: 1 + g.gold, cdr: Math.max(0, Math.min(0.5, g.cdr)), g,
    };
  }
  // điều kiện đặt vào ô: đúng loại + đủ cấp
  function canEquip(meta, it, slotId) {
    const s = SLOTS.find((x) => x.id === slotId); if (!s || s.type !== it.slot) return 'Sai loại ô trang bị';
    const need = it.req || 1, lv = levelOf(meta.xp).level; if (lv < need) return 'Cần cấp ' + need + ' (bạn cấp ' + lv + ')'; return '';
  }
  const slotsFor = (it) => SLOTS.filter((s) => s.type === it.slot).map((s) => s.id);
  // nhiệm vụ (tiến độ thật lấy từ số liệu lưu)
  const QUESTS = [
    { id: 'k25', name: 'Săn quái', desc: 'Hạ 25 quái trong hầm ngục', goal: 25, val: (m) => m.kills || 0, reward: 100 },
    { id: 'k150', name: 'Thợ săn lão luyện', desc: 'Hạ 150 quái', goal: 150, val: (m) => m.kills || 0, reward: 400 },
    { id: 'r10', name: 'Thám hiểm', desc: 'Dọn 10 phòng', goal: 10, val: (m) => m.rooms || 0, reward: 120 },
    { id: 'w1', name: 'Phá hầm đầu tiên', desc: 'Phá đảo 1 hầm ngục', goal: 1, val: (m) => m.wins || 0, reward: 150 },
    { id: 'w5', name: 'Kẻ chinh phục', desc: 'Phá đảo 5 lượt', goal: 5, val: (m) => m.wins || 0, reward: 500 },
    { id: 'rare', name: 'Mắt tinh', desc: 'Nhặt 1 món từ Hiếm trở lên', goal: 1, val: (m) => m.rareFound || 0, reward: 120 },
    { id: 'epic', name: 'Báu vật', desc: 'Nhặt 1 món Sử thi trở lên', goal: 1, val: (m) => m.epicFound || 0, reward: 300 },
  ];

  // ---------------------------------------------------------------- kho đồ + tiến trình lưu trên máy
  const KEY = 'kn_dread_v1';
  const startWeapon = () => ({ slot: 'weapon', base: 'sword', name: 'Kiếm sắt', atk: 15, rar: 0, lvl: 1, req: 1, id: 'start', aff: [], fav: true });
  const starter = () => ({ gold: 120, inv: [], eq: { weapon: startWeapon() }, clears: {}, runs: 0, kills: 0, bestGold: 0, claimed: 0, xp: 0, sp: {}, best: {}, quests: {}, rooms: 0, wins: 0, rareFound: 0, epicFound: 0, set: { dmg: true }, shop: null, extraPotions: 0 });
  function loadMeta() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && v.eq) { const m = Object.assign(starter(), v); m.eq = v.eq; m.sp = v.sp || {}; m.best = v.best || {}; m.quests = v.quests || {}; m.set = Object.assign({ dmg: true }, v.set || {}); m.inv = Array.isArray(v.inv) ? v.inv : []; m.inv.forEach((i) => { if (i.req == null) i.req = 1; }); Object.keys(m.eq).forEach((k) => { if (m.eq[k] && m.eq[k].req == null) m.eq[k].req = 1; }); return m; } } catch (e) { /* */ }
    return starter();
  }
  function saveMeta(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* */ } }
  const resetMeta = () => { try { localStorage.removeItem(KEY); } catch (e) { /* */ } return starter(); };
  const unlocked = (m, d) => !d.unlock || (m.clears[d.unlock] && m.clears[d.unlock][0]) > 0;

  // ---------------------------------------------------------------- bản đồ phòng ngẫu nhiên
  // lưới 3×3 hoặc 4×3: bắt đầu một góc, bước ngẫu nhiên, phòng xa nhất là phòng trùm; các phòng giữa xen kẽ chiến đấu / rương / nghỉ.
  function genMap(dg) {
    const W = dg.rooms > 7 ? 4 : 3, H = 3, key = (x, y) => x + ',' + y, cells = new Map();
    const start = { x: 0, y: Math.floor(Math.random() * H) }; cells.set(key(start.x, start.y), { x: start.x, y: start.y, d: 0 });
    let guard = 0, cur = start;
    while (cells.size < dg.rooms && guard++ < 400) {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: cur.x + dx, y: cur.y + dy })).filter((c) => c.x >= 0 && c.y >= 0 && c.x < W && c.y < H);
      const nx = pick(dirs); if (!nx) break;
      if (!cells.has(key(nx.x, nx.y))) cells.set(key(nx.x, nx.y), { x: nx.x, y: nx.y, d: (cells.get(key(cur.x, cur.y)).d || 0) + 1, from: key(cur.x, cur.y) });
      cur = Math.random() < 0.6 ? nx : pick([...cells.values()]);
    }
    const rooms = [...cells.values()];
    rooms.forEach((r) => { r.doors = { n: cells.has(key(r.x, r.y - 1)) && (r.from === key(r.x, r.y - 1) || cells.get(key(r.x, r.y - 1)).from === key(r.x, r.y)), s: cells.has(key(r.x, r.y + 1)) && (r.from === key(r.x, r.y + 1) || cells.get(key(r.x, r.y + 1)).from === key(r.x, r.y)), w: cells.has(key(r.x - 1, r.y)) && (r.from === key(r.x - 1, r.y) || cells.get(key(r.x - 1, r.y)).from === key(r.x, r.y)), e: cells.has(key(r.x + 1, r.y)) && (r.from === key(r.x + 1, r.y) || cells.get(key(r.x + 1, r.y)).from === key(r.x, r.y)) }; });
    // phòng trùm: sâu nhất cây
    const boss = rooms.reduce((a, b) => (b.d > a.d ? b : a), rooms[0]);
    rooms[0].type = 'start'; boss.type = 'boss';
    const mid = rooms.filter((r) => !r.type).sort(() => Math.random() - 0.5);
    mid.forEach((r) => { r.type = 'combat'; });
    if (mid.length >= 3) { mid[0].type = 'chest'; mid[1].type = 'rest'; } else if (mid.length >= 2) mid[0].type = 'chest';
    rooms.forEach((r) => { r.cleared = r.type !== 'combat' && r.type !== 'boss'; r.seen = r.type === 'start'; r.visited = r.type === 'start'; r.opened = false; });
    return { W, H, rooms, byKey: cells, key };
  }
  // cảnh thử: vị trí cửa theo hướng
  const DOORPOS = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };

  KN.DreadCore = { loadGlb, webgl, DUNGEONS, TIERS, MOBS, RARITY, WEAPONS, ARMORS, HELMETS, BOOTS, OFFHANDS, RINGS, SLOTS, TYPES, STAT_DEFS, SKILLS, SP_PER_LEVEL, QUESTS, MAXLV, rollItem, lootWeights, statsText, statVals, fmtStat, sellValue, buyPrice, gearStats, calcStats, levelOf, spFree, spSpent, canEquip, slotsFor, loadMeta, saveMeta, resetMeta, unlocked, genMap, DOORPOS, baseOf, clamp, rand, pick };
})();
