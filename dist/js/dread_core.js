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
    { id: 'sewer', name: 'Cống Yêu Tinh', icon: '👺', blurb: 'Bầy yêu tinh đông đúc, đánh nhanh nhưng yếu máu.', rooms: 7, mobs: ['goblin', 'goblin', 'skeleton'], boss: 'goblin_chief', theme: { floor: [0x2f4a38, 0x27402f], wall: 0x1c2e24, trim: 0x5a7a3a, torch: 0x9aff6a, fog: 0x07100b }, lvl: 2, unlock: 'bone' },
    { id: 'ash', name: 'Hầm Tro', icon: '👻', blurb: 'Bóng ma bắn tia ma thuật từ xa, cần di chuyển liên tục.', rooms: 7, mobs: ['skeleton', 'wraith'], boss: 'wraith_queen', theme: { floor: [0x4a4558, 0x3d384a], wall: 0x262235, trim: 0x6a5aa0, torch: 0xb78bff, fog: 0x0a0912 }, lvl: 3, unlock: 'sewer', env: 'environment_crypt_of_ash' },
    { id: 'throne', name: 'Ngai của Vua Rỗng', icon: '👑', blurb: 'Quái hỗn hợp và trùm Hiệp sĩ Tro cùng bộ xương hộ vệ.', rooms: 8, mobs: ['skeleton', 'wraith', 'goblin'], boss: 'boss', theme: { floor: [0x50403a, 0x42342f], wall: 0x2e2220, trim: 0xa07a3a, torch: 0xffb347, fog: 0x0d0907 }, lvl: 4, unlock: 'ash', env: 'environment_hollow_throne' },
    { id: 'abyss', name: 'Vực Linh Hồn', icon: '🌀', blurb: 'Hầm ngục khó nhất: quái mạnh, hai trùm, chiến lợi phẩm huyền thoại.', rooms: 9, mobs: ['wraith', 'skeleton', 'wraith', 'goblin'], boss: 'boss', boss2: 'wraith_queen', theme: { floor: [0x2a2a4a, 0x22223e], wall: 0x15152b, trim: 0x4a6aff, torch: 0x5ac8ff, fog: 0x05060f }, lvl: 5, unlock: 'throne' },
  ];
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
  ];
  // vũ khí gốc: model GLB (cận chiến) hoặc kiểu dựng tay (tầm xa)
  const WEAPONS = [
    { base: 'sword', name: 'Kiếm sắt', icon: '🗡️', model: 'weapon_iron_sword', h: 1.7, atk: 15, range: 1.9, cd: 0.62, melee: true },
    { base: 'axe', name: 'Rìu Mộ', icon: '🪓', model: 'weapon_grave_axe', h: 1.5, atk: 22, range: 2.1, cd: 0.78, melee: true },
    { base: 'fang', name: 'Nanh Đêm', icon: '⚔️', model: 'weapon_nightfang', h: 2.1, atk: 30, range: 2.4, cd: 0.66, melee: true, minLvl: 3 },
    { base: 'bow', name: 'Cung Cốt', icon: '🏹', proc: 'bow', atk: 11, range: 9, cd: 0.52, melee: false },
    { base: 'staff', name: 'Trượng Tro', icon: '🔮', proc: 'staff', atk: 13, range: 8, cd: 0.7, melee: false, minLvl: 2 },
  ];
  const ARMORS = [{ base: 'leather', name: 'Giáp da', icon: '🥋', hp: 18, def: 3 }, { base: 'rust', name: 'Giáp Rỉ', icon: '🛡️', hp: 30, def: 6, minLvl: 2 }, { base: 'hollow', name: 'Giáp Rỗng', icon: '🧥', hp: 46, def: 9, minLvl: 4 }];
  const RINGS = [{ base: 'ember', name: 'Mặt dây Than', icon: '📿', hp: 15 }, { base: 'soul', name: 'Nhẫn Linh hồn', icon: '💍', crit: 0.05 }, { base: 'ash', name: 'Vòng Tro', icon: '⭕', speed: 0.05 }];
  const PRE = ['Gỉ sét', 'Cũ kỹ', 'Sắc bén', 'Tinh luyện', 'Cổ ngữ', 'Nguyền rủa', 'Thiêng liêng', 'Của Vua Rỗng'];
  const AFFIX = [
    { k: 'crit', label: 'Chí mạng', fmt: (v) => '+' + Math.round(v * 100) + '% chí mạng', range: [0.03, 0.08] },
    { k: 'life', label: 'Hút máu', fmt: (v) => '+' + Math.round(v * 100) + '% hút máu', range: [0.02, 0.06] },
    { k: 'speed', label: 'Nhanh nhẹn', fmt: (v) => '+' + Math.round(v * 100) + '% tốc chạy', range: [0.04, 0.1] },
    { k: 'hp', label: 'Cứng cáp', fmt: (v) => '+' + Math.round(v) + ' máu', range: [8, 22] },
    { k: 'gold', label: 'Đa kim', fmt: (v) => '+' + Math.round(v * 100) + '% vàng', range: [0.1, 0.3] },
    { k: 'cdr', label: 'Hồi chiêu', fmt: (v) => '-' + Math.round(v * 100) + '% hồi kỹ năng', range: [0.08, 0.2] },
  ];
  let uid = Date.now() % 1e6;
  function rollItem(lvl, tierBias, slot, minRar) {
    // độ hiếm: ngẫu nhiên có trọng số, nâng bởi tầng hầm ngục + độ khó + (tùy chọn) mức tối thiểu
    const r0 = Math.random() * (1 + lvl * 0.12), bias = (tierBias || 0) * 0.5 + lvl * 0.05;
    let rar = r0 + bias < 0.55 ? 0 : r0 + bias < 0.85 ? 1 : r0 + bias < 1.12 ? 2 : r0 + bias < 1.35 ? 3 : 4; rar = Math.max(rar, minRar || 0); rar = Math.min(4, rar);
    if (!slot) slot = pick(['weapon', 'weapon', 'armor', 'ring']);
    const R = RARITY[rar]; let it;
    if (slot === 'weapon') { const pool = WEAPONS.filter((w) => !w.minLvl || lvl >= w.minLvl), b = pick(pool.length ? pool : WEAPONS); it = { slot, base: b.base, name: b.name, icon: b.icon, atk: Math.round(b.atk * R.mul * rand(0.92, 1.1)) }; }
    else if (slot === 'armor') { const pool = ARMORS.filter((a) => !a.minLvl || lvl >= a.minLvl), b = pick(pool.length ? pool : ARMORS); it = { slot, base: b.base, name: b.name, icon: b.icon, hp: Math.round(b.hp * R.mul), def: Math.round(b.def * R.mul) }; }
    else { const b = pick(RINGS); it = { slot, base: b.base, name: b.name, icon: b.icon }; ['hp', 'crit', 'speed'].forEach((k) => { if (b[k]) it[k] = k === 'hp' ? Math.round(b[k] * R.mul) : +(b[k] * R.mul).toFixed(3); }); }
    it.rar = rar; it.lvl = lvl; it.id = 'i' + (uid++).toString(36) + Math.floor(Math.random() * 1e3).toString(36); it.aff = [];
    const pool = AFFIX.filter((a) => !(slot === 'weapon' && a.k === 'hp') && (it[a.k] == null || !['crit', 'speed', 'hp'].includes(a.k))); // tránh trùng chỉ số gốc
    for (let i = 0; i < R.aff && pool.length; i++) { const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0], v = a.k === 'hp' ? Math.round(rand(...a.range) * R.mul) : +(rand(...a.range) * R.mul).toFixed(3); it.aff.push({ k: a.k, v }); }
    if (rar >= 1) it.name = (rar >= 4 ? 'Huyền thoại ' : pick(PRE) + ' ') + it.name;
    return it;
  }
  const baseOf = (it) => (it.slot === 'weapon' ? WEAPONS : it.slot === 'armor' ? ARMORS : RINGS).find((x) => x.base === it.base) || null;
  const statsText = (it) => {
    const p = [];
    if (it.atk) p.push('Tấn công ' + it.atk); if (it.def) p.push('Giáp ' + it.def); if (it.hp) p.push('+' + it.hp + ' máu'); if (it.crit) p.push('+' + Math.round(it.crit * 100) + '% chí mạng'); if (it.speed) p.push('+' + Math.round(it.speed * 100) + '% tốc chạy');
    const wb = it.slot === 'weapon' ? baseOf(it) : null; if (wb) p.push(wb.melee ? 'Cận chiến · tầm ' + wb.range : 'Tầm xa · ' + wb.range + ' m');
    (it.aff || []).forEach((a) => { const d = AFFIX.find((x) => x.k === a.k); if (d) p.push(d.fmt(a.v)); });
    return p.join(' · ');
  };
  const sellValue = (it) => Math.round((it.atk || it.hp || it.def || 10) * (1 + it.rar * 1.2) * (4 + it.rar * 3) / 2);
  // tổng hợp chỉ số trang bị
  function gearStats(eq) {
    const g = { atk: 0, hp: 0, def: 0, crit: 0, life: 0, speed: 0, gold: 0, cdr: 0, weapon: null };
    ['weapon', 'armor', 'ring'].forEach((s) => { const it = eq && eq[s]; if (!it) return; if (s === 'weapon') { g.weapon = it; g.atk = it.atk || 0; } g.hp += it.hp || 0; g.def += it.def || 0; g.crit += it.crit || 0; g.speed += it.speed || 0; (it.aff || []).forEach((a) => { g[a.k] = (g[a.k] || 0) + a.v; }); });
    return g;
  }

  // ---------------------------------------------------------------- kho đồ + tiến trình lưu trên máy
  const KEY = 'kn_dread_v1';
  const starter = () => ({ gold: 120, inv: [], eq: { weapon: { slot: 'weapon', base: 'sword', name: 'Kiếm sắt', icon: '🗡️', atk: 15, rar: 0, lvl: 1, id: 'start', aff: [] }, armor: null, ring: null }, clears: {}, runs: 0, kills: 0, bestGold: 0, claimed: 0 });
  function loadMeta() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && v.eq) return Object.assign(starter(), v); } catch (e) { /* */ } return starter(); }
  function saveMeta(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* */ } }
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

  KN.DreadCore = { loadGlb, webgl, DUNGEONS, TIERS, MOBS, RARITY, WEAPONS, ARMORS, RINGS, rollItem, statsText, sellValue, gearStats, loadMeta, saveMeta, unlocked, genMap, DOORPOS, baseOf, clamp, rand, pick };
})();
