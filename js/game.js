/* Một Kiếp Người — life simulation core (KN.Game). SPEC §2, §3, §5 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const U = KN.util;
  const D = KN.DATA;
  const SAVE = 'kn_save_v1', META = 'kn_meta_v1';
  const REL_ROLES = ['mother', 'father', 'sibling', 'grandparent', 'friend', 'partner', 'spouse', 'child', 'grandchild', 'pet', 'ex'];
  const GEN_ROLES = ['stranger', 'kid', 'baby', 'teacher', 'classmate', 'boss', 'coworker', 'doctor', 'police', 'vendor', 'neighbor', 'relative', 'crowd', 'deceased', 'thief', 'thug'];
  const STATS = ['happy', 'health', 'smarts', 'looks'];
  const PET_NAMES = ['Mực', 'Vàng', 'Mít', 'Bông', 'Miu', 'Mướp', 'Lu', 'Cún', 'Bơ', 'Na', 'Sữa', 'Ổi', 'Tôm', 'Xoài'];
  const EDU_NAMES = { none: 'Chưa đi học', preschool: 'Mầm non', primary: 'Tiểu học', secondary: 'THCS', highschool: 'THPT', university: 'Đại học', vocational: 'Trường nghề', done: 'Đã ra trường' };

  let S = null;
  const SLOTS = 'kn_slots_v1';
  const freshMeta = () => ({ lives: [], achievements: {}, bestScore: 0, totalLives: 0, phuc: 0, unlocks: {} });
  let meta = Object.assign(freshMeta(), KN.store.get(META, {}) || {});
  meta.unlocks = meta.unlocks || {}; meta.phuc = meta.phuc || 0;
  const listeners = {};
  function emit(evt, data) { (listeners[evt] || []).forEach((fn) => { try { fn(data); } catch (e) { console.warn(e); } }); }
  function save() { if (S) KN.store.set(SAVE, S); KN.store.set(META, meta); }
  function changed() { save(); emit('change', S); }

  // ------------------------------------------------------------------ helpers
  const r100 = (v) => U.clamp(Math.round(v), 0, 100);
  const rr = (a, b) => Math.round(U.rand(a, b));
  const P = () => S.player;
  const fullName = (p) => [p.lastName, p.middleName, p.firstName].filter(Boolean).join(' ');
  const alive = (role) => S.people.filter((p) => p.alive && (!role || p.role === role));
  const byId = (id) => (id === 'player' ? S.player : S.people.find((p) => p.id === id));
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const fmtMoney = (n) => D.fmtMoney(n);
  const isKid = () => P().age < 18;

  function kinByAge(p) {
    const pa = P().age, d = p.age - pa;
    if (p.age <= 12 && pa > p.age + 4) return 'bé';
    if (d >= 38) return p.gender === 'f' ? 'bà' : 'ông';
    if (d >= 16) return p.gender === 'f' ? 'cô' : 'chú';
    if (d >= 3) return p.gender === 'f' ? 'chị' : 'anh';
    if (d <= -3) return 'em';
    return 'bạn';
  }
  function kin(p, role) {
    role = (role || p.role || '').split('#')[0];
    switch (role) {
      case 'mother': return 'mẹ';
      case 'father': return 'bố';
      case 'sibling': return p.age > P().age ? (p.gender === 'f' ? 'chị' : 'anh') : 'em';
      case 'grandparent': return p.gender === 'f' ? 'bà' : 'ông';
      case 'spouse': return p.gender === 'f' ? 'vợ' : 'chồng';
      case 'partner': return 'người yêu';
      case 'child': return 'con';
      case 'grandchild': return 'cháu';
      case 'friend': return 'bạn';
      case 'pet': return 'bé';
      case 'ex': return 'người cũ';
      case 'teacher': return p.gender === 'f' ? 'cô' : 'thầy';
      case 'boss': return 'sếp';
      case 'doctor': return 'bác sĩ';
      case 'police': return p.age - P().age > 15 ? 'chú công an' : 'anh công an';
      case 'kid': case 'baby': return 'bé';
      case 'thief': return 'kẻ gian';
      case 'thug': return 'gã giang hồ';
      default: return kinByAge(p);
    }
  }
  function roleLabel(p) {
    switch (p.role) {
      case 'mother': return 'Mẹ';
      case 'father': return 'Bố';
      case 'sibling': return p.age > P().age ? (p.gender === 'f' ? 'Chị gái' : 'Anh trai') : (p.gender === 'f' ? 'Em gái' : 'Em trai');
      case 'grandparent': return p.gender === 'f' ? 'Bà' : 'Ông';
      case 'friend': return p.relation >= 75 ? 'Bạn thân' : 'Bạn bè';
      case 'partner': return 'Người yêu';
      case 'spouse': return p.gender === 'f' ? 'Vợ' : 'Chồng';
      case 'child': return p.gender === 'f' ? 'Con gái' : 'Con trai';
      case 'grandchild': return p.gender === 'f' ? 'Cháu gái' : 'Cháu trai';
      case 'pet': return p.kind === 'cat' ? 'Mèo cưng' : 'Chó cưng';
      case 'ex': return p.wasSpouse ? (p.gender === 'f' ? 'Vợ cũ' : 'Chồng cũ') : 'Người yêu cũ';
      default: return D.ROLE_LABELS[p.role] || p.role;
    }
  }

  function newPerson(role, gender, age, opts) {
    opts = opts || {};
    const nm = D.randomName(gender, opts.lastName);
    return {
      id: U.uid('p'), role, firstName: opts.firstName || nm.firstName, middleName: opts.middleName ?? nm.middleName, lastName: opts.lastName || nm.lastName,
      gender, age, alive: true, relation: opts.relation ?? U.randi(55, 85), kind: 'human',
      appearance: opts.appearance || D.randomAppearance(gender, age, { parents: opts.parents, role: opts.appRole || role }), since: S ? S.year : 2026,
    };
  }
  function newPet(kind) {
    return { id: U.uid('pet'), role: 'pet', firstName: U.pick(PET_NAMES), middleName: '', lastName: '', gender: U.pick(['m', 'f']), age: U.randi(0, 2), alive: true, relation: 75, kind: kind || U.pick(['dog', 'cat']), appearance: null, petColor: U.pick(['#c08040', '#e8a25a', '#f2efe8', '#3a3a3a', '#8a6a4f', '#d9b38c']), since: S.year };
  }
  function addLog(text, tone, icon) {
    const e = { age: P().age, year: S.year, text, tone: tone || 'neutral', icon: icon || '•' };
    S.log.push(e);
    if (S.log.length > 600) S.log.splice(0, S.log.length - 600);
    return e;
  }
  function moneyStat() { return U.clamp((Math.log10(Math.max(S.money, 1)) - 5) * 20, 0, 100); }
  function statVal(stat) { return stat === 'money' ? moneyStat() : stat === 'karma' ? S.karma : S.stats[stat] ?? 50; }

  // ------------------------------------------------------------------ binding context
  class Ctx {
    constructor() { this.map = {}; this.temps = {}; }
    get(key) { return this.map[key] || this.map[(key || '').split('#')[0]] || null; }
    set(key, p, temp) { this.map[key] = p; if (temp) this.temps[key] = p; }
    ids() { const o = {}; Object.keys(this.map).forEach((k) => { if (!this.temps[k]) o[k] = this.map[k].id; }); return o; }
    static restore(inst) {
      const c = new Ctx();
      Object.keys(inst.bind || {}).forEach((k) => { const p = byId(inst.bind[k]); if (p) c.map[k] = p; });
      Object.keys(inst.temps || {}).forEach((k) => { c.map[k] = inst.temps[k]; c.temps[k] = inst.temps[k]; });
      return c;
    }
  }
  function tempPerson(role, hint) {
    hint = hint || {};
    const pa = P().age;
    let age, gender = hint.gender || U.pick(['m', 'f']), appRole = role;
    switch (role) {
      case 'kid': age = U.randi(5, 11); break;
      case 'baby': age = U.randi(0, 1); break;
      case 'teacher': age = U.randi(27, 55); if (!hint.gender) gender = Math.random() < 0.7 ? 'f' : 'm'; break;
      case 'classmate': age = U.clamp(pa + U.randi(-1, 1), 4, 30); appRole = pa <= 17 ? 'classmate' : 'stranger'; break;
      case 'boss': age = U.randi(36, 58); break;
      case 'coworker': age = U.clamp(pa + U.randi(-6, 8), 20, 60); break;
      case 'doctor': age = U.randi(30, 60); break;
      case 'police': age = U.randi(24, 45); if (!hint.gender) gender = 'm'; break;
      case 'vendor': age = U.randi(35, 68); if (!hint.gender) gender = Math.random() < 0.75 ? 'f' : 'm'; break;
      case 'neighbor': age = U.randi(35, 72); break;
      case 'relative': age = U.randi(35, 68); break;
      case 'thief': age = U.randi(17, 34); if (!hint.gender) gender = Math.random() < 0.85 ? 'm' : 'f'; break;
      case 'thug': age = U.randi(24, 46); if (!hint.gender) gender = 'm'; break;
      default: age = U.randi(18, 65); appRole = 'stranger';
    }
    if (hint.age != null) age = hint.age;
    const p = newPerson(role, gender, age, { appRole });
    p.id = 'tmp_' + role + '_' + Math.floor(Math.random() * 1e8).toString(36);
    p.temp = true;
    if (hint.kind === 'dog' || hint.kind === 'cat') { Object.assign(p, newPet(hint.kind)); p.id = 'tmp_pet_' + Math.floor(Math.random() * 1e8).toString(36); p.temp = true; }
    return p;
  }

  // roles referenced by an event definition (cached)
  const roleCache = new Map();
  function rolesOf(def) {
    if (roleCache.has(def.id)) return roleCache.get(def.id);
    const set = new Set();
    const scan = (s) => { if (typeof s !== 'string') return; const re = /\{([a-z_]+)(\.[kK]|\.full)?\}/g; let m; while ((m = re.exec(s))) if (REL_ROLES.includes(m[1]) || GEN_ROLES.includes(m[1])) set.add(m[1]); };
    scan(def.title); scan(def.text); scan(def.scene && def.scene.say);
    ((def.scene && def.scene.npcs) || []).forEach((n) => { if (n.role) set.add(n.role); scan(n.say); });
    (def.choices || []).forEach((c) => {
      scan(c.label); scan(c.text); c.scene && scan(c.scene.say); c.scene && c.scene.npcSay && Object.values(c.scene.npcSay).forEach(scan);
      (c.outcomes || []).forEach((o) => { scan(o.text); o.scene && scan(o.scene.say); o.scene && o.scene.npcSay && Object.values(o.scene.npcSay).forEach(scan); });
    });
    const arr = Array.from(set);
    roleCache.set(def.id, arr);
    return arr;
  }
  function bind(def, preset) {
    const c = new Ctx();
    if (preset) Object.keys(preset).forEach((k) => c.set(k, preset[k], !!preset[k].temp));
    const npcs = (def.scene && def.scene.npcs) || [];
    const counts = {};
    const used = new Set(Object.values(c.map).map((p) => p.id));
    // scene npc slots first (distinct people per slot)
    for (const n of npcs) {
      const role = n.role; if (!role || role === 'crowd') continue;
      counts[role] = (counts[role] || 0) + 1;
      const key = counts[role] > 1 ? role + '#' + counts[role] : role;
      if (c.map[key]) continue;
      if (REL_ROLES.includes(role)) {
        const cand = alive(role).filter((p) => !used.has(p.id) && (!n.kind || p.kind === n.kind));
        if (!cand.length) { if (counts[role] > 1) continue; return null; }
        const p = U.pick(cand); used.add(p.id); c.set(key, p);
      } else c.set(key, tempPerson(role, n), true);
    }
    for (const role of rolesOf(def)) {
      if (c.map[role] || role === 'crowd') continue;
      if (REL_ROLES.includes(role)) { const cand = alive(role).filter((p) => !used.has(p.id)); if (!cand.length) return null; const p = U.pick(cand); used.add(p.id); c.set(role, p); }
      else if (role !== 'deceased') c.set(role, tempPerson(role, {}), true);
    }
    return c;
  }

  // ------------------------------------------------------------------ text tokens
  function fmt(str, ctx) {
    if (str == null) return str;
    return String(str).replace(/\{([^}]+)\}/g, (m, t) => {
      switch (t) {
        case 'name': return P().firstName;
        case 'fullname': return fullName(P());
        case 'age': return String(P().age);
        case 'city': return D.cityName(S.city);
        case 'job': return S.job ? D.CAREERS[S.job.id].levels[S.job.level].title.toLowerCase() : 'công việc';
        case 'school': return (EDU_NAMES[S.edu.level] || 'trường').toLowerCase();
        default: break;
      }
      if (t.startsWith('money:')) return fmtMoney(+t.slice(6));
      const [role, sub] = t.split('.');
      const p = ctx && ctx.get(role);
      if (!p) { const any = alive(role)[0]; if (!any) return sub === 'K' ? 'Ai đó' : 'ai đó'; return sub === 'k' ? kin(any, role) : sub === 'K' ? cap(kin(any, role)) : sub === 'full' ? fullName(any) : any.firstName; }
      if (sub === 'k') return kin(p, role);
      if (sub === 'K') return cap(kin(p, role));
      if (sub === 'full') return fullName(p);
      return p.firstName;
    });
  }

  // ------------------------------------------------------------------ requirements
  const has = (role) => alive(role).length > 0;
  const hasDegree = () => S.edu.degrees.some((d) => d !== 'THPT');
  function checkReq(q, ctx) {
    if (!q) return true;
    const pa = P().age, stage = D.stageOf(pa);
    const arr = (v) => (Array.isArray(v) ? v : [v]);
    if (q.stage && !arr(q.stage).includes(stage)) return false;
    if (q.gender && P().gender !== q.gender) return false;
    if (q.has && !arr(q.has).every((r) => has(r))) return false;
    if (q.lacks && arr(q.lacks).some((r) => has(r))) return false;
    if (q.flag && !arr(q.flag).every((f) => S.flags[f])) return false;
    if (q.notFlag && arr(q.notFlag).some((f) => S.flags[f])) return false;
    if (q.since && Object.keys(q.since).some((f) => !S.flags[f] || typeof S.flags[f] !== 'number' || S.year - S.flags[f] < q.since[f])) return false;
    if (q.school != null && !!S.edu.inSchool !== !!q.school) return false;
    if (q.eduLevel && !(S.edu.inSchool && arr(q.eduLevel).includes(S.edu.level))) return false;
    if (q.degree != null && hasDegree() !== !!q.degree) return false;
    if (q.job != null && !!S.job !== !!q.job) return false;
    if (q.jobId && !(S.job && arr(q.jobId).includes(S.job.id))) return false;
    if (q.minMoney != null && S.money < q.minMoney) return false;
    if (q.maxMoney != null && S.money > q.maxMoney) return false;
    if (q.minStat && Object.keys(q.minStat).some((k) => statVal(k) < q.minStat[k])) return false;
    if (q.maxStat && Object.keys(q.maxStat).some((k) => statVal(k) > q.maxStat[k])) return false;
    if (q.asset && !arr(q.asset).some((t) => S.assets.some((a) => a.type === t))) return false;
    if (q.noAsset && arr(q.noAsset).some((t) => S.assets.some((a) => a.type === t))) return false;
    if (q.married != null && has('spouse') !== !!q.married) return false;
    if (q.minKarma != null && S.karma < q.minKarma) return false;
    if (q.maxKarma != null && S.karma > q.maxKarma) return false;
    if (q.city && !arr(q.city).includes(S.city)) return false;
    if (q.illness != null && (S.illnesses.length > 0) !== !!q.illness) return false;
    if (q.cond) { try { if (!q.cond(S, helpers)) return false; } catch (e) { return false; } }
    return true;
  }
  function reqReason(q) {
    if (!q) return null;
    if (q.minMoney) return 'Cần ít nhất ' + fmtMoney(q.minMoney);
    if (q.minStat) { const k = Object.keys(q.minStat)[0]; return 'Cần ' + ({ happy: 'hạnh phúc', health: 'sức khỏe', smarts: 'trí tuệ', looks: 'ngoại hình', karma: 'điểm đức', money: 'tiền' }[k] || k) + ' ≥ ' + q.minStat[k]; }
    if (q.asset) return 'Bạn chưa có ' + ({ motorbike: 'xe máy', car: 'ô tô', house: 'nhà', phone: 'điện thoại', land: 'đất', gold: 'vàng' }[[].concat(q.asset)[0]] || 'tài sản này');
    if (q.has) return 'Không có người phù hợp';
    if (q.job) return 'Bạn cần có việc làm';
    return 'Chưa đủ điều kiện';
  }

  // ------------------------------------------------------------------ scenes
  function outfitFor(p, loc, isPlayer) {
    if (!p.appearance) return null;
    const a = Object.assign({}, p.appearance);
    const age = p.age;
    if (age >= 6 && age <= 17 && (loc === 'school' || (isPlayer && S.edu.inSchool && (loc === 'school')))) a.topStyle = 'school';
    if (isPlayer && S.job && !S.retired && age >= 18) {
      const c = D.CAREERS[S.job.id];
      if (c && c.loc === loc && c.style) a.topStyle = c.style;
      if (S.job.id === 'bacsi' && loc === 'hospital') a.topStyle = 'coat';
    }
    if (age < 6 && (a.topStyle === 'suit' || a.topStyle === 'aodai' || a.topStyle === 'coat')) a.topStyle = 'tshirt';
    return a;
  }
  function npcOf(p, n, loc) {
    return {
      id: p.id, name: p.firstName, kind: p.kind || 'human', appearance: (p.kind || 'human') === 'human' ? outfitFor(p, loc, false) : null,
      petColor: p.petColor || null, age: p.age, gender: p.gender, anim: (n && n.anim) || 'idle', expr: (n && n.expr) || null, say: (n && n.say) || null, _role: n && n._role,
    };
  }
  function playerOf(loc, anim, expr, say) {
    const p = P();
    return { id: 'player', name: p.firstName, appearance: outfitFor(p, loc, true), age: p.age, gender: p.gender, anim: anim || 'idle', expr: expr || null, say: say || null };
  }
  function resolveScene(base, ctx) {
    base = base || {};
    const loc = base.loc || (S.daily && S.daily.loc) || 'home';
    const sc = { loc, decor: base.decor || null, time: base.time || 'day', weather: base.weather || 'clear', player: playerOf(loc, base.anim, base.expr, fmt(base.say, ctx)), npcs: [], fx: base.fx || null, npcFx: null, shot: base.shot || null };
    const counts = {};
    for (const n of base.npcs || []) {
      if (sc.npcs.length >= 4) break;
      if (n.role === 'crowd') {
        const k = 4 - sc.npcs.length, m = Math.min(k, U.randi(2, 3));
        for (let i = 0; i < m; i++) {
          const key = 'crowd#' + (i + 1);
          let t = ctx && ctx.map[key];
          if (!t) { t = tempPerson('stranger', {}); if (ctx) ctx.set(key, t, true); }
          sc.npcs.push(Object.assign(npcOf(t, n, loc), { _role: 'crowd', say: null }));
        }
        continue;
      }
      counts[n.role] = (counts[n.role] || 0) + 1;
      const key = counts[n.role] > 1 ? n.role + '#' + counts[n.role] : n.role;
      const p = ctx && ctx.map[key];
      if (!p) continue;
      if (sc.npcs.some((x) => x.id === p.id)) continue;
      sc.npcs.push(Object.assign(npcOf(p, n, loc), { _role: n.role, say: fmt(n.say, ctx) || null }));
    }
    if (!sc.shot) sc.shot = sc.npcs.length ? 'close' : 'wide';
    if (base.npcFx) { sc.npcFx = {}; Object.keys(base.npcFx).forEach((r) => sc.npcs.filter((x) => x._role === r).forEach((x) => (sc.npcFx[x.id] = base.npcFx[r]))); }
    return sc;
  }
  function mergeScene(sc, o, ctx) {
    const out = JSON.parse(JSON.stringify(sc));
    out.player.say = null; out.npcs.forEach((n) => (n.say = null)); out.fx = null; out.npcFx = null;
    if (!o) { out.player.anim = out.player.anim || 'idle'; return out; }
    if (o.loc) out.loc = o.loc;
    ['time', 'weather', 'decor', 'shot', 'fx'].forEach((k) => { if (o[k] !== undefined) out[k] = o[k]; });
    if (o.anim) out.player.anim = o.anim;
    if (o.expr !== undefined) out.player.expr = o.expr;
    if (o.say) out.player.say = fmt(o.say, ctx);
    if (o.npcs) { const extra = resolveScene({ loc: out.loc, npcs: o.npcs }, ctx).npcs; out.npcs = extra; }
    const apply = (map, fn) => { if (!map) return; Object.keys(map).forEach((r) => out.npcs.forEach((n) => { if (r === 'all' || n._role === r || (n._role || '').split('#')[0] === r) fn(n, map[r]); })); };
    apply(o.npcAnim, (n, v) => (n.anim = v));
    apply(o.npcExpr, (n, v) => (n.expr = v));
    apply(o.npcSay, (n, v) => (n.say = fmt(v, ctx)));
    if (o.npcFx) { out.npcFx = {}; apply(o.npcFx, (n, v) => (out.npcFx[n.id] = v)); }
    // refresh outfits if the location changed
    out.player.appearance = outfitFor(P(), out.loc, true);
    return out;
  }
  function sceneFor(loc, opts) {
    opts = opts || {};
    const sc = { loc, decor: opts.decor || null, time: opts.time || 'day', weather: opts.weather || 'clear', player: playerOf(loc, opts.anim, opts.expr, opts.say), npcs: [], fx: opts.fx || null, npcFx: null, shot: opts.shot || 'wide' };
    (opts.people || []).slice(0, 4).forEach((x) => { const p = x.p || x; if (!p) return; sc.npcs.push(npcOf(p, { anim: x.anim || 'idle', expr: x.expr || null, say: x.say || null }, loc)); });
    if (opts.npcFx) { sc.npcFx = {}; Object.keys(opts.npcFx).forEach((id) => (sc.npcFx[id] = opts.npcFx[id])); }
    if (!opts.shot && sc.npcs.length) sc.shot = 'close';
    return sc;
  }
  // ------------------------------------------------------------------ achievements & goals
  const ACH = {}; D.ACHIEVEMENTS.forEach((a) => (ACH[a.id] = a));
  let fresh = { ach: [], goals: [] };
  function unlock(id) {
    if (!ACH[id] || S.ach[id] != null) return;
    S.ach[id] = P().age; meta.achievements[id] = true;
    fresh.ach.push(ACH[id]);
    addLog('Thành tựu mới: ' + ACH[id].name + ' ' + ACH[id].icon, 'milestone', '🏆');
    emit('achievement', ACH[id]);
  }
  function checkProgress() {
    if (!S || !S.player) return;
    const m = S.money, pa = P().age, kids = S.people.filter((p) => p.role === 'child').length;
    if (m >= 1e9) unlock('ty'); if (m >= 1e10) unlock('daigia'); if (m >= 1e11) unlock('sieudaigia');
    if (S.karma >= 95) unlock('saint'); if (S.karma <= 10) unlock('villain');
    if (S.stats.smarts >= 100) unlock('genius'); if (S.stats.looks >= 95) unlock('beauty'); if (S.stats.happy >= 100) unlock('happy100');
    if (pa >= 70) unlock('age70'); if (pa >= 90) unlock('age90'); if (pa >= 100) unlock('age100');
    if (S.assets.some((a) => a.type === 'house')) unlock('house'); if (S.assets.some((a) => a.type === 'car')) unlock('car');
    if (kids >= 1) unlock('parent'); if (kids >= 3) unlock('big_family'); if (S.people.some((p) => p.role === 'grandchild')) unlock('grandparent');
    if ((S.counters.gym || 0) >= 10) unlock('gym10'); if ((S.counters.travel || 0) >= 5) unlock('traveler'); if ((S.counters.charity || 0) >= 5) unlock('charity5');
    if (S.job) {
      const c = D.CAREERS[S.job.id];
      if (S.job.level >= c.levels.length - 1) unlock('top_job');
      if (c.fame && S.job.level >= 2) unlock('famous');
      if (S.job.id === 'bacsi') unlock('doctor');
      if (S.job.id === 'kinhdoanh' && S.job.level >= 2) unlock('startup');
    }
    if (S.generation >= 2) unlock('gen2'); if (S.generation >= 3) unlock('gen3');
    S.goals.forEach((g) => {
      if (g.done) return;
      const def = D.GOALS.find((x) => x.id === g.id);
      let ok = false; try { ok = def && def.check(S); } catch (e) { ok = false; }
      if (ok) { g.done = true; g.age = pa; fresh.goals.push({ id: g.id, text: def.text }); addLog('Hoàn thành mục tiêu: ' + def.text, 'milestone', '🎯'); emit('goal', def); }
    });
    if (!S.flags.allGoals && S.goals.length && S.goals.every((g) => g.done)) {
      S.flags.allGoals = S.year;
      const sum = S.goals.reduce((t, g) => t + ((D.GOALS.find((x) => x.id === g.id) || {}).diff || 2), 0);
      const gain = 2 + Math.floor(sum / 2);
      meta.phuc = (meta.phuc || 0) + gain; fresh.phuc = (fresh.phuc || 0) + gain;
      unlock('vien_man');
      addLog('Viên mãn! Bạn hoàn thành cả ba mục tiêu và nhận ' + gain + ' điểm Phúc đức để dùng cho kiếp sau.', 'milestone', '🌟');
    }
    if (S.money <= -5e8 && !S.flags.wentBroke) { S.flags.wentBroke = S.year; unlock('broke'); }
  }
  function takeFresh() { const f = fresh; fresh = { ach: [], goals: [], phuc: 0 }; return f; }

  // ------------------------------------------------------------------ effects
  function addStat(k, v, deltas) {
    if (!v) return;
    if (k === 'karma') { const b = S.karma; S.karma = r100(S.karma + v); deltas.karma = (deltas.karma || 0) + (S.karma - b); return; }
    const b = S.stats[k]; S.stats[k] = r100(b + v); deltas[k] = (deltas[k] || 0) + (S.stats[k] - b);
  }
  function addMoney(v, deltas) { v = Math.round(v); if (!v) return; S.money += v; deltas.money = (deltas.money || 0) + v; }
  function addRel(p, v, relDeltas) {
    if (!p || p.temp || !v) return;
    const b = p.relation; p.relation = r100(p.relation + v);
    const d = p.relation - b; if (d) relDeltas.push({ personId: p.id, name: p.firstName, delta: d });
  }
  function addPersonFrom(spec, ctx) {
    const role = spec.role || 'friend';
    let p = null;
    const src = spec.fromScene && ctx && ctx.get(spec.fromScene);
    if (src && src.temp) {
      p = Object.assign({}, src); delete p.temp; p.id = U.uid(p.kind === 'human' ? 'p' : 'pet'); p.role = role; p.relation = U.randi(55, 75); p.since = S.year;
    } else if (role === 'pet') { p = newPet(spec.kind); }
    else if (role === 'sibling') { p = newPerson('sibling', U.pick(['m', 'f']), 0, { lastName: P().lastName, parents: [alive('mother')[0], alive('father')[0]].filter(Boolean).map((x) => x.appearance) }); }
    else if (role === 'child') { return makeBaby(); }
    else {
      const pg = P().gender, g = role === 'partner' ? (Math.random() < 0.92 ? (pg === 'm' ? 'f' : 'm') : pg) : U.pick(['m', 'f']);
      p = newPerson(role, g, U.clamp(P().age + U.randi(-3, 3), 3, 99));
    }
    if (role === 'partner') { alive('partner').forEach((x) => (x.role = 'ex')); unlock('first_love'); }
    if (role === 'pet') { S.counters.pets = (S.counters.pets || 0) + 1; unlock('pet'); }
    S.people.push(p);
    return p;
  }
  function makeBaby() {
    const other = alive('spouse')[0] || alive('partner')[0];
    const g = U.pick(['m', 'f']);
    const lastName = P().gender === 'm' ? P().lastName : (other ? other.lastName : P().lastName);
    const p = newPerson('child', g, 0, { lastName, parents: [P().appearance, other && other.appearance].filter(Boolean), relation: 90 });
    S.people.push(p);
    unlock('parent');
    return p;
  }
  function addIllness(name) {
    const def = D.ILLNESSES.find((i) => i.name === name) || { id: 'x' + U.hash(name), name, drain: 6, chronic: false, cure: 0.8, cost: 2e6 };
    if (S.illnesses.some((i) => i.name === def.name)) return;
    S.illnesses.push({ id: def.id, name: def.name, drain: def.drain, chronic: !!def.chronic, cure: def.cure, cost: def.cost, serious: !!def.serious, since: S.year });
  }
  function hire(id) {
    const c = D.CAREERS[id]; if (!c) return;
    S.job = { id, level: 0, perf: 55, years: 0, mult: 1 };
    S.retired = false;
    if (!S.flags.had_job) { S.flags.had_job = true; S.flags.firstjob_pending = true; }
  }
  function applyEffects(eff, ctx, deltas, relDeltas) {
    if (!eff) return;
    STATS.forEach((k) => addStat(k, eff[k], deltas));
    addStat('karma', eff.karma, deltas);
    if (eff.money) addMoney(eff.money, deltas);
    if (eff.moneyPct && S.money > 0) addMoney(S.money * eff.moneyPct, deltas);
    if (eff.rel) Object.keys(eff.rel).forEach((role) => {
      const v = eff.rel[role];
      if (role === 'all') { const ps = ctx ? Object.values(ctx.map).filter((p) => !p.temp && p.id !== 'player') : []; (ps.length ? ps : alive().filter((p) => ['mother', 'father', 'spouse', 'child'].includes(p.role))).forEach((p) => addRel(p, v, relDeltas)); return; }
      const p = (ctx && ctx.get(role)) || U.pick(alive(role));
      addRel(p, v, relDeltas);
    });
    [].concat(eff.flag || []).forEach((f) => (S.flags[f] = S.year));
    [].concat(eff.unflag || []).forEach((f) => delete S.flags[f]);
    if (eff.addPerson) addPersonFrom(eff.addPerson, ctx);
    if (eff.removePerson) {
      const role = typeof eff.removePerson === 'string' ? eff.removePerson : eff.removePerson.role;
      const p = (ctx && ctx.get(role) && !ctx.get(role).temp ? ctx.get(role) : null) || alive(role)[0];
      if (p) { if (role === 'partner') p.role = 'ex'; else if (role === 'spouse') { p.role = 'ex'; p.wasSpouse = true; } else { p.alive = false; p.gone = true; } }
    }
    if (eff.kill) {
      const p = (ctx && ctx.get(eff.kill) && !ctx.get(eff.kill).temp ? ctx.get(eff.kill) : null) || alive(eff.kill)[0];
      if (p) { p.alive = false; p.deathYear = S.year; addLog(cap(kin(p)) + ' ' + p.firstName + ' đã qua đời.', 'bad', '🕯️'); }
    }
    if (eff.marry) { const p = alive('partner')[0]; if (p) { p.role = 'spouse'; S.flags.marriedYear = S.year; unlock('married'); } }
    if (eff.divorce) { const p = alive('spouse')[0]; if (p) { p.role = 'ex'; p.wasSpouse = true; if (S.money > 0) addMoney(-S.money * 0.4, deltas); unlock('divorce'); } }
    if (eff.baby && (has('spouse') || has('partner'))) { const b = makeBaby(); addLog('Bạn đón con ' + b.firstName + ' chào đời!', 'milestone', '👶'); }
    if (eff.job) {
      if (eff.job === 'fire' && S.job) { S.job = null; }
      else if (eff.job === 'promote' && S.job) promote();
      else if (eff.job === 'raise' && S.job) S.job.mult = (S.job.mult || 1) * 1.12;
      else if (typeof eff.job === 'object' && eff.job.hire) hire(eff.job.hire);
    }
    if (eff.school === 'expel' || eff.school === 'dropout') { S.edu.inSchool = false; S.edu.dropped = true; }
    if (eff.school === 'honor') { S.counters.honor = (S.counters.honor || 0) + 1; unlock('honor'); S.edu.perf = r100(S.edu.perf + 10); }
    if (eff.asset) {
      if (eff.asset.add) S.assets.push({ id: U.uid('a'), itemId: null, type: eff.asset.add.type, name: eff.asset.add.name, value: eff.asset.add.value || 0, icon: ({ phone: '📱', motorbike: '🛵', car: '🚗', house: '🏠', land: '🌾', gold: '🪙', luxury: '💎' })[eff.asset.add.type] || '🎁' });
      if (eff.asset.lose === 'all') S.assets = [];
      else if (eff.asset.lose) [].concat(eff.asset.lose).forEach((t) => { const i = S.assets.findIndex((a) => a.type === t); if (i >= 0) S.assets.splice(i, 1); });
    }
    if (eff.illness) addIllness(eff.illness);
    if (eff.cure) S.illnesses = S.illnesses.filter((i) => i.chronic);
    if (eff.achievement) unlock(eff.achievement);
    if (eff.die) die(eff.die);
  }
  function promote() {
    const c = D.CAREERS[S.job.id];
    if (S.job.level < c.levels.length - 1) { S.job.level++; S.job.perf = 55; S.counters.promoted = (S.counters.promoted || 0) + 1; unlock('promoted'); return true; }
    return false;
  }
  function toneOf(deltas, given) {
    if (given) return given;
    const t = (deltas.happy || 0) + (deltas.health || 0) * 0.8 + (deltas.smarts || 0) * 0.4 + (deltas.looks || 0) * 0.4 + (deltas.karma || 0) * 0.25 + (deltas.money ? Math.sign(deltas.money) * Math.min(6, Math.log10(Math.abs(deltas.money) + 1) - 4) : 0);
    return t > 1.5 ? 'good' : t < -1.5 ? 'bad' : 'neutral';
  }
  function result(o) {
    const f = takeFresh();
    return Object.assign({ ok: true, reason: null, title: '', icon: '✨', text: '', tone: 'neutral', deltas: {}, relDeltas: [], scene: null, event: null, achievements: f.ach, goals: f.goals, died: !!(S && S.dead) }, o, { achievements: f.ach, goals: f.goals, phuc: f.phuc || 0, died: !!(S && S.dead) });
  }
  const fail = (reason) => ({ ok: false, reason, title: '', icon: '⛔', text: reason, tone: 'neutral', deltas: {}, relDeltas: [], scene: null, event: null, achievements: [], goals: [], died: false });

  // ------------------------------------------------------------------ milestone events (internal, same DSL + fn handlers)
  const MS = {};
  function ms(def) { def.internal = true; def.once = false; MS[def.id] = def; }
  ms({ id: 'ms_school1', title: 'Ngày đầu tiên đi học', icon: '🎒', age: [6, 6],
    text: 'Sáng nay {mother.k} dậy sớm thắt khăn quàng, đeo cặp mới cho bạn. Cổng trường đông nghịt, trống trường vang lên "tùng tùng". Cô giáo {teacher} đứng ở cửa lớp, mỉm cười chờ bạn.',
    scene: { loc: 'school', anim: 'scared', npcs: [{ role: 'mother', anim: 'wave', say: 'Con vào lớp ngoan nhé!' }, { role: 'teacher', gender: 'f', anim: 'wave', say: 'Chào con, vào đây với cô!' }, { role: 'classmate', anim: 'idle' }] },
    choices: [
      { label: 'Ôm chặt mẹ, khóc không chịu vào', text: 'Bạn khóc ầm ĩ. Cô giáo dỗ mãi, cuối cùng bạn cũng vào lớp với đôi mắt đỏ hoe — và quên khóc ngay khi được phát bút chì màu.', effects: { happy: -2, rel: { mother: 4 } }, scene: { anim: 'cry', npcAnim: { mother: 'hug', teacher: 'talk' }, fx: 'tears' } },
      { label: 'Mạnh dạn chào cô giáo', text: '"Con chào cô ạ!" Cô khen bạn ngoan, cho bạn ngồi bàn đầu. Bạn thấy mình lớn hẳn.', effects: { happy: 4, smarts: 2 }, scene: { anim: 'bow', npcAnim: { teacher: 'clap' }, npcSay: { teacher: 'Giỏi quá!' }, fx: 'sparkle' } },
      { label: 'Làm quen bạn ngồi cạnh', text: 'Bạn chia cho {classmate} nửa cái bánh. Từ hôm đó hai đứa thành bạn thân.', effects: { happy: 5, addPerson: { role: 'friend', fromScene: 'classmate' } }, scene: { anim: 'laugh', npcAnim: { classmate: 'laugh' }, fx: 'hearts' } },
    ] });
  ms({ id: 'ms_grade10', title: 'Kỳ thi vào lớp 10', icon: '📝', age: [15, 15],
    text: 'Kỳ thi vào lớp 10 công lập đã cận kề. Cả nhà ăn đỗ, kiêng trứng, {mother.k} còn đi chùa xin bùa. Áp lực đè nặng lên vai bạn.',
    scene: { loc: 'school', anim: 'study', npcs: [{ role: 'classmate', anim: 'study' }, { role: 'teacher', anim: 'talk', say: 'Làm bài cẩn thận nhé các em!' }] },
    choices: [
      { label: 'Ôn thi ngày đêm', fn: (c) => examOutcome(0.18, { health: -4, happy: -3 }) },
      { label: 'Học vừa sức, ngủ đủ giấc', fn: (c) => examOutcome(0.05, { happy: 1 }) },
      { label: 'Đi thi tùy duyên', fn: (c) => examOutcome(-0.15, { happy: 3 }) },
    ] });
  ms({ id: 'ms_grade10_fail', title: 'Trượt lớp 10 công lập', icon: '😞', age: [15, 16],
    text: 'Điểm thi không đủ vào trường công. Bạn ngồi thừ người trước bảng điểm. Giờ phải tính đường khác.',
    scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'mother', anim: 'talk', say: 'Không sao con, mình tính tiếp.' }] },
    choices: [
      { label: 'Học trường tư (tốn kém hơn)', fn: () => { S.edu.level = 'highschool'; S.edu.grade = 10; S.edu.inSchool = true; S.flags.private_school = S.year; return { text: 'Bố mẹ chạy vạy đóng học phí trường tư cho bạn. Bạn tự hứa sẽ học thật chăm.', effects: { happy: 2, rel: { mother: 3, father: 3 } }, scene: { anim: 'nod' } }; } },
      { label: 'Vào trường nghề, học một cái nghề', fn: () => { S.edu.level = 'vocational'; S.edu.grade = 1; S.edu.inSchool = true; return { text: 'Bạn vào trường nghề. "Một nghề cho chín còn hơn chín nghề", ông bà dặn vậy.', effects: { happy: 1 }, scene: { anim: 'idle' } }; } },
      { label: 'Nghỉ học, đi làm phụ giúp gia đình', fn: () => { S.edu.inSchool = false; S.edu.dropped = true; S.edu.level = 'done'; return { text: 'Bạn xếp sách vở lại. Đời bắt đầu dạy bạn những bài học khác.', effects: { happy: -3, smarts: -1 }, scene: { anim: 'sad' } }; } },
    ] });
  function examOutcome(bonus, extra) {
    const p = U.clamp(0.3 + (S.stats.smarts - 50) / 70 + (S.edu.perf - 50) / 120 + bonus, 0.07, 0.96);
    if (Math.random() < p) {
      S.edu.level = 'highschool'; S.edu.grade = 10; S.edu.inSchool = true; unlock('grade10');
      return { text: 'Bạn đỗ vào lớp 10 công lập! Cả nhà mở tiệc nhỏ, {mother.k} khoe khắp xóm.', effects: Object.assign({ happy: 8, rel: { mother: 4, father: 4 } }, extra), scene: { anim: 'cheer', fx: 'confetti', npcAnim: { classmate: 'clap', teacher: 'clap' } }, tone: 'milestone' };
    }
    return { text: 'Bạn trượt nguyện vọng 1. Tối đó bạn khóc thút thít trong phòng.', effects: Object.assign({ happy: -8 }, extra), scene: { anim: 'cry', fx: 'tears' }, tone: 'bad', followUp: { id: 'ms_grade10_fail', delay: 0 } };
  }
  const uniChance = (m) => U.clamp(0.5 + (S.stats.smarts - m.diff) / 45 + (S.edu.perf - 50) / 150, 0.06, 0.96);
  function uniHint(major) {
    const m = D.MAJORS[major], p = uniChance(m);
    const jobs = Object.values(D.CAREERS).filter((c) => c.req && c.req.major && c.req.major.includes(major)).map((c) => c.title);
    return 'Đỗ ~' + Math.round(p * 100) + '% · ' + m.years + ' năm · ' + (m.tuition ? D.fmtShort(m.tuition) + '/năm' : 'miễn học phí') + (jobs.length ? ' · ra làm ' + jobs.slice(0, 2).join(', ') : '');
  }
  function uniChoice(major) {
    const m = D.MAJORS[major];
    return { label: m.icon + ' ' + m.name, hint: uniHint(major), fn: () => {
      const p = uniChance(m);
      S.edu.degrees.includes('THPT') || S.edu.degrees.push('THPT');
      if (Math.random() < p) {
        S.edu.level = 'university'; S.edu.major = major; S.edu.uniYear = 1; S.edu.grade = 1; S.edu.inSchool = true; S.edu.perf = r100(50 + U.rand(-5, 10)); delete S.flags.retake;
        unlock('uni');
        return { text: 'Bạn đỗ ngành ' + m.name + '! Cầm giấy báo nhập học mà tay run run. Cả họ gọi điện chúc mừng.', effects: { happy: 12, smarts: 2 }, scene: { loc: 'university', anim: 'cheer', fx: 'fireworks', npcAnim: { mother: 'clap', father: 'cheer' } }, tone: 'milestone' };
      }
      return { text: 'Thiếu ' + (U.rand(0.25, 2).toFixed(2).replace('.', ',')) + ' điểm. Bạn trượt ngành ' + m.name + '.', effects: { happy: -10 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad', followUp: { id: 'ms_uni_fail', delay: 0 } };
    } };
  }
  function uniEventDef(id, title, text) {
    const pool = Object.keys(D.MAJORS);
    return { id, title, icon: '🎓', age: [17, 40], text: text + ' Có ' + pool.length + ' ngành để chọn — hãy cân nhắc sức học và túi tiền.', many: true,
      scene: { loc: 'school', anim: 'think', npcs: [{ role: 'mother', anim: 'talk', say: 'Con thích ngành nào thì cứ chọn.' }, { role: 'father', anim: 'idle' }] },
      choicesFn: () => pool.slice().sort((a, b) => uniChance(D.MAJORS[b]) - uniChance(D.MAJORS[a])).concat(['work']).map(byKey),
      choiceByKey: (k) => byKey(k) };
    function byKey(k) {
      if (k !== 'work') return Object.assign({ key: k }, uniChoice(k));
      return { key: 'work', label: '💼 Không học đại học, đi làm luôn', hint: 'Tự lập sớm · có thể thi lại sau', fn: () => { S.edu.inSchool = false; S.edu.level = 'done'; S.edu.degrees.includes('THPT') || S.edu.degrees.push('THPT'); return { text: 'Bạn quyết định đi làm sớm, tự lập từ hôm nay.', effects: { happy: 2 }, scene: { anim: 'shrug' } }; } };
    }
  }
  ms(uniEventDef('ms_uni', 'Kỳ thi THPT & chọn ngành đại học', 'Bạn vừa tốt nghiệp THPT. Bàn học ngập hồ sơ xét tuyển, cả nhà họp bàn mỗi tối. Một lựa chọn sẽ rẽ hướng cả cuộc đời.'));
  ms(uniEventDef('ms_retake', 'Thi lại đại học', 'Một năm ôn luyện đã qua. Lần này bạn quyết tâm hơn bao giờ hết.'));
  ms(uniEventDef('ms_uni_late', 'Đăng ký thi đại học', 'Bạn quyết định đi học lại. Không bao giờ là quá muộn để thay đổi.'));
  ms({ id: 'ms_uni_fail', title: 'Trượt đại học', icon: '📮', age: [17, 40],
    text: 'Giấy báo trượt. Bạn bè đăng ảnh nhập học khắp mạng xã hội. Bạn phải chọn bước tiếp theo.',
    scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'mother', anim: 'hug', say: 'Thất bại là mẹ thành công con ạ.' }] },
    choices: [
      { label: 'Ôn thi lại một năm', fn: () => { S.flags.retake = S.year; S.edu.inSchool = false; S.edu.level = 'done'; return { text: 'Bạn đăng ký lò luyện thi. Năm sau sẽ khác!', effects: { happy: 1, smarts: 2 }, scene: { anim: 'study' } }; } },
      { label: 'Đi học nghề', fn: () => { S.edu.level = 'vocational'; S.edu.grade = 1; S.edu.inSchool = true; return { text: 'Bạn chọn học nghề. Đôi tay khéo léo cũng nuôi được cả nhà.', effects: { happy: 2 }, scene: { anim: 'nod' } }; } },
      { label: 'Đi làm luôn', fn: () => { S.edu.inSchool = false; S.edu.level = 'done'; return { text: 'Bạn xách ba lô đi xin việc. Trường đời bắt đầu.', effects: { happy: 0 }, scene: { anim: 'shrug' } }; } },
    ] });
  ms({ id: 'ms_graduate', title: 'Lễ tốt nghiệp', icon: '🎓', age: [20, 60],
    text: 'Bạn khoác áo cử nhân, đội mũ có tua rua. Hội trường vang tiếng vỗ tay khi tên bạn được xướng lên.',
    scene: { loc: 'university', anim: 'cheer', fx: 'confetti', npcs: [{ role: 'mother', anim: 'clap', say: 'Con giỏi quá!' }, { role: 'father', anim: 'clap' }, { role: 'friend', anim: 'cheer' }] },
    choices: [
      { label: 'Chụp ảnh kỷ niệm với bố mẹ', text: 'Tấm ảnh cả nhà rạng rỡ được treo trang trọng ở phòng khách.', effects: { happy: 6, rel: { mother: 8, father: 8 } }, scene: { anim: 'love', fx: 'flash', npcAnim: { all: 'love' } } },
      { label: 'Tung mũ ăn mừng với bạn bè', text: 'Cả lớp tung mũ lên trời. Mũ của bạn rơi trúng đầu thầy hiệu trưởng.', effects: { happy: 8 }, scene: { anim: 'jump', fx: 'confetti', npcAnim: { all: 'laugh' } } },
    ] });
  ms({ id: 'ms_firstpay', title: 'Tháng lương đầu tiên', icon: '💵', age: [14, 70],
    text: 'Tin nhắn ngân hàng "ting ting": tháng lương đầu tiên của bạn đã về. Bạn nhìn con số mãi không chán.',
    scene: { loc: 'home', anim: 'phone', fx: 'money', npcs: [{ role: 'mother', anim: 'idle' }] },
    choices: [
      { label: 'Biếu bố mẹ một nửa', fn: () => ({ text: '{mother.K} cầm phong bì, quay đi lau nước mắt. "Con lớn thật rồi."', effects: { happy: 6, karma: 5, money: -Math.round(monthly() * 0.5), rel: { mother: 12, father: 10 } }, scene: { anim: 'hug', npcAnim: { mother: 'cry' }, fx: 'hearts' } }) },
      { label: 'Tự thưởng một món đồ xịn', fn: () => ({ text: 'Bạn mua đôi giày mơ ước bấy lâu. Đi đâu cũng ngắm chân mình.', effects: { happy: 7, looks: 2, money: -Math.round(monthly() * 0.6) }, scene: { anim: 'cheer', fx: 'sparkle' } }) },
      { label: 'Gửi tiết kiệm hết', text: 'Bạn mở sổ tiết kiệm. Cảm giác người lớn thật sự.', effects: { happy: 2, smarts: 1 }, scene: { anim: 'nod' } },
    ] });
  ms({ id: 'ms_wedding', title: 'Đám cưới', icon: '💍', age: [16, 99],
    text: 'Ngày trọng đại đã đến. {partner} trong bộ đồ cưới rạng rỡ, hai họ tề tựu đông đủ. Bạn hồi hộp đến mức quên cả lời phát biểu.',
    scene: { loc: 'wedding', anim: 'love', fx: 'petals', npcs: [{ role: 'partner', anim: 'love' }, { role: 'mother', anim: 'clap' }, { role: 'father', anim: 'clap' }, { role: 'friend', anim: 'cheer' }] },
    choices: [
      { label: 'Tiệc cưới linh đình 50 mâm', fn: () => ({ text: 'Tiệc cưới hoành tráng, cả xóm nhắc mãi. Phong bì mừng cưới bù lại được kha khá.', effects: { marry: true, happy: 12, money: -Math.min(Math.max(S.money * 0.3, 0), 250e6) + U.randi(60, 180) * 1e6, rel: { all: 6 } }, scene: { anim: 'cheer', fx: 'fireworks', npcAnim: { all: 'clap', partner: 'love' } }, tone: 'milestone' }) },
      { label: 'Cưới nhỏ ấm cúng', text: 'Một đám cưới nhỏ, chỉ người thân và bạn bè thân thiết. Ai cũng nói đây là đám cưới ấm áp nhất.', effects: { marry: true, happy: 10, money: -40e6, rel: { all: 4 } }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { all: 'clap', partner: 'hug' } }, tone: 'milestone' },
      { label: 'Chỉ đăng ký kết hôn rồi đi du lịch', text: 'Hai bạn ký giấy kết hôn rồi xách vali đi Phú Quốc. Họ hàng hơi phật ý, nhưng hai bạn thì hạnh phúc.', effects: { marry: true, happy: 9, money: -25e6, rel: { mother: -3, partner: 6 } }, scene: { loc: 'beach', anim: 'love', fx: 'hearts', npcAnim: { partner: 'love' } }, tone: 'milestone' },
    ] });
  ms({ id: 'ms_newborn', title: 'Chào đón thành viên mới', icon: '👶', age: [16, 70],
    text: 'Tiếng khóc oe oe vang lên trong phòng sinh. Bé {child} nằm gọn trong vòng tay, đỏ hỏn và bé xíu.',
    scene: { loc: 'hospital', anim: 'love', fx: 'sparkle', npcs: [{ role: 'child', anim: 'sleep' }, { role: 'spouse', anim: 'love' }, { role: 'mother', anim: 'clap' }] },
    choices: [
      { label: 'Ôm con vào lòng', text: 'Bạn bế con lần đầu. Mọi mệt mỏi tan biến. Từ giây phút này, bạn có một lý do mới để sống.', effects: { happy: 12, rel: { child: 10 } }, scene: { anim: 'hug', fx: 'hearts' }, tone: 'milestone' },
      { label: 'Khóc vì hạnh phúc', text: 'Nước mắt cứ thế rơi. Bạn nắm bàn tay bé xíu và hứa sẽ cho con cả thế giới.', effects: { happy: 10, karma: 3, rel: { child: 8 } }, scene: { anim: 'cry', fx: 'hearts' }, tone: 'milestone' },
    ] });
  ms({ id: 'ms_funeral', title: 'Lời tiễn biệt', icon: '🕯️', age: [0, 120],
    text: '{deceased.K} {deceased} đã ra đi mãi mãi. Khói hương nghi ngút, tiếng kèn đám ma tiễn biệt nghe sao não lòng.',
    scene: { loc: 'temple', decor: 'funeral', time: 'dusk', anim: 'cry', npcs: [{ role: 'mother', anim: 'cry' }, { role: 'father', anim: 'sad' }, { role: 'spouse', anim: 'sad' }] },
    choices: [
      { label: 'Lo hậu sự chu đáo', fn: () => ({ text: 'Bạn lo liệu mọi thứ chu toàn. Ai cũng khen bạn hiếu nghĩa.', effects: { happy: -6, karma: 5, money: isKid() ? 0 : -15e6 }, scene: { anim: 'pray', fx: 'sparkle' } }) },
      { label: 'Ngồi bên di ảnh suốt đêm', text: 'Bạn thức trắng bên di ảnh, nhớ lại những ngày xưa. Có những người đi rồi mới thấy thương.', effects: { happy: -10, karma: 3 }, scene: { anim: 'cry', fx: 'tears' } },
      { label: 'Gạt nước mắt, mạnh mẽ vì cả nhà', text: 'Bạn ôm lấy mọi người. Phải sống tiếp, sống thật tốt — như người đã khuất mong muốn.', effects: { happy: -4, rel: { all: 5 } }, scene: { anim: 'hug', npcAnim: { all: 'hug' } } },
    ] });
  ms({ id: 'ms_retire', title: 'Tuổi nghỉ hưu', icon: '🪴', age: [55, 99],
    text: 'Công ty tổ chức tiệc chia tay. Sếp {boss} trao cho bạn bó hoa và hỏi: "Anh chị có muốn nghỉ hưu không, hay ở lại thêm vài năm?"',
    scene: { loc: 'office', anim: 'think', npcs: [{ role: 'boss', anim: 'talk' }, { role: 'coworker', anim: 'clap' }] },
    choices: [
      { label: 'Nghỉ hưu, vui với con cháu', fn: () => { retire(); return { text: 'Bạn nghỉ hưu. Sáng tập thể dục, chiều chăm cây, tối xem thời sự. Đời nhẹ tênh.', effects: { happy: 8 }, scene: { loc: 'park', anim: 'cheer', fx: 'sparkle' }, tone: 'milestone' }; } },
      { label: 'Làm thêm vài năm nữa', text: 'Bạn ở lại. "Còn sức thì còn cống hiến!"', effects: { happy: -1, health: -2 }, scene: { anim: 'nod' } },
    ] });
  function retire() {
    if (!S.job) return;
    S.pension = Math.round(monthly() * 0.45); S.job = null; S.retired = true; unlock('retire');
  }
  function monthly() { if (!S.job) return 0; const c = D.CAREERS[S.job.id]; return Math.round(c.levels[S.job.level].salary * (S.job.mult || 1)); }

  // ------------------------------------------------------------------ event instances
  let EVMAP = null;
  function evDef(id) {
    if (MS[id]) return MS[id];
    if (!EVMAP) { EVMAP = {}; (KN.EVENTS || []).forEach((e) => { if (e && e.id) EVMAP[e.id] = e; }); }
    return EVMAP[id] || null;
  }
  function choicesOf(def) { return def.choicesFn ? def.choicesFn() : def.choices || []; }
  function instantiate(def, preset) {
    const ctx = bind(def, preset);
    if (!ctx) return null;
    const choices = choicesOf(def);
    if (!choices.length) return null;
    const inst = { uid: U.uid('ev'), id: def.id, icon: def.icon || '✨', bind: null, temps: null, title: fmt(def.title, ctx), text: fmt(def.text, ctx), choices: [], scene: null, defs: def.choicesFn ? choices.map((c) => c.label) : null };
    inst.choices = choices.map((c, i) => { const ok = !c.req || checkReq(c.req, ctx); return { index: i, label: fmt(c.label, ctx), disabled: !ok, reason: ok ? null : reqReason(c.req), hint: c.hint || null }; });
    if (!inst.choices.some((c) => !c.disabled)) return null;
    inst.scene = resolveScene(def.scene, ctx);
    inst.bind = ctx.ids(); inst.temps = ctx.temps;
    if (def.choicesFn) inst.dynKeys = choices.map((c) => c.key); // functions are not serialised; rebuilt from keys
    if (def.many || inst.choices.length > 4) inst.many = true;
    delete inst.defs;
    return inst;
  }
  function eligible(def, age) {
    if (!def || !def.age || def.chainOnly || age < def.age[0] || age > def.age[1]) return false;
    const last = S.usedEvents[def.id];
    if (last != null) { if (def.once !== false) return false; if (S.year - last < (def.cooldown || 3)) return false; }
    if (!checkReq(def.req)) return false;
    return true;
  }
  function pickEvents(n) {
    const list = (KN.EVENTS || []).filter((e) => eligible(e, P().age));
    const out = [];
    let guard = 0;
    while (out.length < n && list.length && guard++ < 30) {
      const def = U.weighted(list, (e) => e.weight ?? 1);
      list.splice(list.indexOf(def), 1);
      const inst = instantiate(def);
      if (inst) { out.push(inst); S.usedEvents[def.id] = S.year; }
    }
    return out;
  }
  function queueMilestone(id, preset) {
    const def = MS[id]; if (!def) return null;
    const inst = instantiate(def, preset);
    if (inst) S.pending.push(inst);
    return inst;
  }

  // ------------------------------------------------------------------ daily ("calm") scene, stable per year
  function pickDaily() {
    const pa = P().age, r = U.seeded(S.year * 31 + pa * 7 + S.generation);
    const pk = (arr) => arr[Math.floor(r() * arr.length)];
    const wt = (pairs) => { let t = 0; pairs.forEach((p) => (t += p[1])); let x = r() * t; for (const p of pairs) { x -= p[1]; if (x <= 0) return p[0]; } return pairs[0][0]; };
    const fam = [], add = (role, n) => alive(role).slice(0, n || 1).forEach((p) => fam.push(p.id));
    let loc = 'home', anim = 'idle', time = wt([['day', 6], ['dusk', 2], ['night', 1.5], ['dawn', 0.6]]);
    const weather = wt([['clear', 7], ['cloudy', 2], ['rain', 1.2], ['fog', 0.3]]);
    if (pa <= 2) { loc = 'home'; anim = pk(['crawl', 'sleep', 'laugh', 'crawl']); add('mother'); add('father'); add('pet'); time = 'day'; }
    else if (pa <= 5) { loc = pk(['home', 'park', 'home']); anim = pk(['run', 'laugh', 'idle', 'dance']); add('mother'); add('grandparent'); add('pet'); }
    else if (pa <= 17) {
      loc = S.edu.inSchool ? wt([['school', 4], ['home', 3], ['bedroom', 2], ['park', 1], ['street', 1]]) : wt([['home', 3], ['street', 2], ['park', 1]]);
      anim = loc === 'school' ? pk(['study', 'idle', 'talk']) : loc === 'bedroom' ? pk(['study', 'type', 'phone']) : loc === 'home' ? pk(['sit', 'phone', 'idle', 'eat']) : pk(['idle', 'run', 'phone']);
      if (loc === 'home') { add('mother'); add('sibling'); add('pet'); } else if (loc !== 'bedroom') add('friend', 2);
      if (loc === 'school') time = 'day';
    } else if (pa < 60) {
      const job = S.job && D.CAREERS[S.job.id];
      if (job && r() < 0.5) { loc = job.loc; anim = loc === 'office' ? 'type' : loc === 'karaoke' ? 'sing' : loc === 'bedroom' ? 'type' : 'idle'; time = loc === 'karaoke' ? 'night' : 'day'; }
      else if (S.edu.inSchool && S.edu.level === 'university' && r() < 0.5) { loc = 'university'; anim = pk(['study', 'idle', 'talk']); add('friend', 2); time = 'day'; }
      else { loc = wt([['home', 4], ['cafe', 2], ['street', 1.5], ['park', 1]]); anim = loc === 'home' ? pk(['sit', 'idle', 'phone', 'cook']) : loc === 'cafe' ? 'drink' : pk(['idle', 'phone']); }
      if (loc === 'home') { add('spouse'); add('partner'); add('child', 2); add('pet'); if (fam.length < 2) add('mother'); }
      else if (loc === 'cafe' || loc === 'street' || loc === 'park') { add('partner'); add('friend'); }
    } else {
      loc = wt([['park', 3], ['home', 3], ['temple', 1], ['countryside', 1]]);
      anim = loc === 'park' ? pk(['dance', 'idle', 'sit']) : loc === 'temple' ? 'pray' : loc === 'home' ? pk(['sit', 'idle', 'drink']) : 'idle';
      if (loc === 'park' || loc === 'temple') time = pk(['dawn', 'day']);
      add('spouse'); if (loc === 'home') { add('grandchild', 2); add('child'); add('pet'); }
    }
    return { loc, anim, time, weather, people: Array.from(new Set(fam)).slice(0, 3) };
  }
  function dailyScene(extra) {
    if (!S.daily) S.daily = pickDaily();
    const d = S.daily;
    const ppl = d.people.map((id) => byId(id)).filter((p) => p && p.alive);
    const anims = ['idle', 'talk', 'idle', 'sit'];
    return sceneFor(d.loc, Object.assign({ anim: d.anim, time: d.time, weather: d.weather, shot: 'wide', people: ppl.map((p, i) => ({ p, anim: p.kind !== 'human' ? U.pick(['sit', 'idle', 'sleep']) : P().age <= 2 ? 'love' : anims[i % anims.length] })) }, extra || {}));
  }
  // ------------------------------------------------------------------ state creation
  function baseState(gen, year, city) {
    return {
      v: 1, generation: gen || 1, year: year || 2026, born: year || 2026, city: city || 'hanoi', player: null,
      stats: { happy: U.randi(70, 92), health: U.randi(72, 100), smarts: U.randi(30, 90), looks: U.randi(30, 90) }, karma: 50, money: 0,
      edu: { level: 'none', grade: 0, perf: U.randi(45, 70), inSchool: false, major: null, uniYear: 0, degrees: [], dropped: false },
      job: null, retired: false, pension: 0, people: [], assets: [], illnesses: [], flags: {}, log: [], goals: [], ach: {}, usedEvents: {},
      yearActs: {}, yearInter: {}, pending: [], forced: [], counters: {}, daily: null, dead: null, goldPrice: 85e6,
    };
  }
  function pickGoals(ids) {
    const chosen = [];
    (Array.isArray(ids) ? ids : []).forEach((id) => { if (chosen.length < 3 && !chosen.includes(id) && D.GOALS.some((x) => x.id === id)) chosen.push(id); });
    U.shuffle(D.GOALS).forEach((x) => { if (chosen.length < 3 && !chosen.includes(x.id)) chosen.push(x.id); });
    return chosen.map((id) => ({ id, done: false }));
  }
  // Phúc phần: life perks chosen in the creator (paid with meta.phuc)
  function applyPerks(ids) {
    const list = [];
    let budget = meta.phuc || 0;
    (Array.isArray(ids) ? ids : []).forEach((id) => {
      const pk = D.PERKS.find((x) => x.id === id && x.kind === 'life');
      if (!pk || list.includes(id) || pk.cost > budget) return;
      budget -= pk.cost; list.push(id);
    });
    meta.phuc = budget;
    const st = S.stats;
    list.forEach((id) => {
      S.flags['perk_' + id] = S.year;
      if (id === 'thongminh') st.smarts = r100(st.smarts + 20);
      if (id === 'dep') st.looks = r100(st.looks + 20);
      if (id === 'khoe') st.health = r100(st.health + 15);
      if (id === 'emam') { st.happy = r100(Math.max(st.happy, 94)); S.people.forEach((p) => { if (['mother', 'father', 'grandparent'].includes(p.role)) p.relation = r100(Math.max(p.relation, 92)); }); }
      if (id === 'quynhan') S.karma = Math.max(S.karma, 70);
      if (id === 'thientai') { st.smarts = r100(st.smarts + 35); S.edu.perf = r100(S.edu.perf + 20); }
    });
    S.perks = list;
    return list;
  }
  function buyUnlock(id) {
    const pk = D.PERKS.find((x) => x.id === id && x.kind === 'unlock');
    if (!pk) return { ok: false, reason: 'Không có phúc phần này.' };
    if (meta.unlocks[id]) return { ok: false, reason: 'Bạn đã mở khóa rồi.' };
    if ((meta.phuc || 0) < pk.cost) return { ok: false, reason: 'Cần ' + pk.cost + ' điểm Phúc đức.' };
    meta.phuc -= pk.cost; meta.unlocks[id] = true; save();
    return { ok: true, reason: null };
  }
  function newLife(opts) {
    opts = opts || {};
    const gender = opts.gender === 'f' || opts.gender === 'm' ? opts.gender : U.pick(['m', 'f']);
    const nm = D.randomName(gender, opts.lastName);
    const city = D.CITIES.some((c) => c.id === opts.city) ? opts.city : U.pick(D.CITIES).id;
    S = baseState(1, 2026, city);
    meta.totalLives = (meta.totalLives || 0) + 1;
    const app = Object.assign(D.randomAppearance(gender, 20), opts.appearance || {});
    S.player = { id: 'player', role: 'player', firstName: opts.firstName || nm.firstName, middleName: opts.middleName ?? nm.middleName, lastName: opts.lastName || nm.lastName, gender, age: 0, alive: true, appearance: app, kind: 'human' };
    const fAge = U.randi(24, 38), mAge = U.clamp(fAge - U.randi(-2, 6), 21, 40);
    const father = newPerson('father', 'm', fAge, { lastName: S.player.lastName, relation: U.randi(70, 92) });
    father.appearance.skin = U.mixHex(app.skin, father.appearance.skin, 0.35); father.appearance.hair = app.hair;
    const mother = newPerson('mother', 'f', mAge, { relation: U.randi(75, 96) });
    mother.appearance.skin = U.mixHex(app.skin, mother.appearance.skin, 0.3);
    S.people.push(mother, father);
    if (Math.random() < 0.75) { const g = U.pick(['m', 'f']); S.people.push(newPerson('grandparent', g, U.randi(55, 72), { lastName: g === 'm' ? S.player.lastName : undefined, relation: U.randi(70, 95) })); }
    if (Math.random() < 0.35) { const g = g2(); S.people.push(newPerson('grandparent', g, U.randi(58, 75), { relation: U.randi(65, 90) })); }
    if (Math.random() < 0.38) S.people.push(newPerson('sibling', U.pick(['m', 'f']), U.randi(2, 8), { lastName: S.player.lastName, parents: [mother.appearance, father.appearance], relation: U.randi(55, 85) }));
    if (Math.random() < 0.2) { const pet = newPet(); pet.age = U.randi(1, 4); S.people.push(pet); }
    S.goals = pickGoals(opts.goals);
    S.lifestyle = 'binhthuong';
    applyPerks(opts.perks);
    const when = U.pick(['sáng mùa xuân', 'chiều mưa phùn', 'đêm trăng rằm', 'trưa hè oi ả', 'sớm mùa thu se lạnh']);
    const text = 'Bạn chào đời vào một ' + when + ' tại ' + D.cityName(city) + '. Bố ' + fullName(father) + ' và mẹ ' + fullName(mother) + ' rơm rớm nước mắt hạnh phúc. Một cuộc đời mới bắt đầu — một trong tám tỷ, nhưng là duy nhất.';
    addLog('Bạn chào đời tại ' + D.cityName(city) + '. Bố ' + father.firstName + ', mẹ ' + mother.firstName + '.', 'milestone', '👶');
    const scene = sceneFor('hospital', { anim: 'sleep', fx: 'sparkle', time: 'day', shot: 'close', people: [{ p: mother, anim: 'love', say: 'Con của mẹ đây rồi…' }, { p: father, anim: 'cheer', say: 'Chào con trai… à, con yêu!'.replace('con trai… à, ', gender === 'f' ? 'con gái… à, ' : 'con trai… à, ') }].concat(alive('grandparent').slice(0, 1).map((p) => ({ p, anim: 'clap' }))) });
    if (scene.npcs[1]) scene.npcs[1].say = gender === 'f' ? 'Công chúa của bố!' : 'Hoàng tử của bố!';
    checkProgress(); changed();
    return result({ title: 'Chào đời', icon: '👶', text, tone: 'milestone', scene });
    function g2() { return U.pick(['m', 'f']); }
  }

  // ------------------------------------------------------------------ yearly simulation
  const mort = (age) => 0.00003 * Math.exp(0.095 * age);
  const closeness = { mother: 20, father: 20, spouse: 22, child: 25, sibling: 14, grandparent: 12, friend: 8, partner: 15, grandchild: 15, ex: 2 };
  function ageUp() {
    if (!S || !S.player) return fail('Chưa có cuộc đời nào.');
    if (S.dead) return fail('Cuộc đời này đã khép lại.');
    if (S.pending.length) return fail('Hãy giải quyết các tình huống đang chờ trước đã.');
    const logs = [], deltas = {}, relDeltas = [];
    const L = (t, tone, icon) => logs.push(addLog(t, tone, icon));
    S.year++; const p = P(); p.age++; const pa = p.age;
    S.yearActs = {}; S.yearInter = {}; S.daily = null;
    S.people.forEach((x) => { if (x.alive) x.age++; });

    // --- stats drift
    const ill = S.illnesses.reduce((s, i) => s + i.drain * (i.chronic ? 0.5 : 1), 0);
    const dh = pa < 25 ? U.rand(0, 2) : pa < 40 ? U.rand(-1, 1) : pa < 55 ? -U.rand(0.5, 2) : pa < 70 ? -U.rand(1, 3) : -U.rand(2, 4.5);
    addStat('health', dh - ill, deltas);
    addStat('looks', pa < 14 ? U.rand(0, 2) : pa < 26 ? U.rand(-1, 2) : pa < 45 ? U.rand(-1.5, 0.5) : -U.rand(0.5, 2), deltas);
    addStat('smarts', S.edu.inSchool && pa >= 3 ? U.rand(0.5, 2.5) : pa >= 65 ? -U.rand(0, 1.5) : U.rand(-0.5, 0.8), deltas);
    // --- education
    eduYear(L);
    // --- money
    moneyYear(L, deltas);
    // --- job
    if (S.job) {
      S.job.years++; S.job.perf = r100(S.job.perf + U.rand(-8, 6) + (S.stats.smarts - 50) / 25);
      if (S.flags.firstjob_pending) { delete S.flags.firstjob_pending; unlock('first_job'); queueMilestone('ms_firstpay'); }
      if (S.job.perf > 72 && S.job.years >= 2 && Math.random() < 0.35) { if (promote()) { L('Bạn được thăng chức: ' + D.CAREERS[S.job.id].levels[S.job.level].title + '!', 'milestone', '📈'); addStat('happy', 6, deltas); } }
      else if (S.job.perf < 22 && Math.random() < 0.4) { L('Bạn bị cho thôi việc vì hiệu suất kém.', 'bad', '📦'); S.job = null; addStat('happy', -10, deltas); }
      if (S.job && pa >= 60 && (!S.flags.retireAsked || S.year - S.flags.retireAsked >= 4)) { S.flags.retireAsked = S.year; queueMilestone('ms_retire'); }
    } else if (pa >= 18 && pa < 60 && !S.edu.inSchool && !S.retired) addStat('happy', -2, deltas);
    // --- people
    peopleYear(L, deltas, relDeltas);
    // --- illness
    illnessYear(L);
    // --- happiness baseline
    const close = alive().filter((x) => ['mother', 'father', 'spouse', 'partner', 'child', 'friend'].includes(x.role));
    const avgRel = close.length ? close.reduce((s, x) => s + x.relation, 0) / close.length : 40;
    const B = 44 + (avgRel - 50) * 0.25 + (S.stats.health - 50) * 0.15 + (S.job ? 4 : 0) + (has('spouse') || has('partner') ? 6 : 0) + (S.money < 0 ? -8 : Math.min(8, moneyStat() * 0.08)) + (S.illnesses.length ? -4 : 0) + (pa >= 18 ? lifestyleDef().happy * 1.5 : 0);
    addStat('happy', (B - S.stats.happy) * 0.25 + U.rand(-3, 3), deltas);
    // --- death check
    if (S.stats.health <= 0) die(S.illnesses[0] ? 'Bệnh ' + S.illnesses[0].name.toLowerCase() + ' trở nặng' : 'Sức khỏe suy kiệt');
    else {
      const q = mort(pa) * (1 + Math.max(0, 55 - S.stats.health) / 22) * (S.stats.health > 85 ? 0.6 : 1) * (S.flags.perk_tho ? 0.55 : 1);
      if (Math.random() < q) die(pa >= 75 ? 'Tuổi già, ra đi thanh thản trong giấc ngủ' : S.illnesses.length ? 'Biến chứng ' + S.illnesses[0].name.toLowerCase() : U.pick(['Tai nạn giao thông', 'Đột quỵ', 'Nhồi máu cơ tim']));
    }
    // --- events
    let scene;
    if (!S.dead) {
      // scheduled follow-ups ("ngoại truyện" chapters): legacy string ids or { id, at, bind, temps }
      const later = [];
      S.forced.splice(0).forEach((f) => {
        const o = typeof f === 'string' ? { id: f, at: S.year } : f;
        if (o.at > S.year) { later.push(o); return; }
        const d = evDef(o.id);
        if (!d || (d.req && !checkReq(d.req))) return;
        const inst = instantiate(d, presetOf(o));
        if (inst) { S.pending.push(inst); S.usedEvents[o.id] = S.year; }
      });
      S.forced = later;
      let n = pa <= 2 ? (Math.random() < 0.5 ? 1 : 0) : pa <= 5 ? 1 : 1 + (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.1 ? 1 : 0);
      n = Math.max(0, n - S.pending.length);
      S.pending.push(...pickEvents(n));
      scene = birthdayScene(pa);
    } else scene = deathScene();
    checkProgress();
    const title = S.dead ? 'Vĩnh biệt' : 'Bạn tròn ' + pa + ' tuổi';
    const text = S.dead ? 'Bạn đã ra đi ở tuổi ' + pa + '. ' + S.dead.cause + '.' : birthdayText(pa);
    changed();
    const r = result({ title, icon: S.dead ? '🕯️' : '🎂', text, tone: S.dead ? 'bad' : 'neutral', deltas, relDeltas, scene });
    r.logs = logs.map((l) => ({ text: l.text, tone: l.tone, icon: l.icon }));
    r.events = S.pending.slice();
    return r;
  }
  function birthdayText(pa) {
    const t = {
      1: 'Thôi nôi! Bạn đã một tuổi, chập chững những bước đầu tiên.', 3: 'Ba tuổi — tuổi của những câu hỏi "tại sao?" không hồi kết.', 6: 'Sáu tuổi, chuẩn bị vào lớp 1!', 10: 'Mười tuổi, tròn một thập kỷ cuộc đời.',
      13: 'Mười ba tuổi, bắt đầu tuổi dậy thì đầy bão giông.', 16: 'Mười sáu, trăng tròn. Mọi thứ đều có thể.', 18: 'Mười tám tuổi — chính thức trưởng thành!', 25: 'Hai mươi lăm, một phần tư thế kỷ.',
      30: 'Ba mươi tuổi. "Tam thập nhi lập".', 40: 'Bốn mươi — "tứ thập nhi bất hoặc".', 50: 'Năm mươi tuổi, nửa thế kỷ đi qua.', 60: 'Sáu mươi, "lục thập nhi nhĩ thuận".',
      70: 'Bảy mươi — "thất thập cổ lai hy"!', 80: 'Tám mươi tuổi, con cháu về mừng thọ.', 90: 'Chín mươi tuổi! Bạn là niềm tự hào của cả dòng họ.', 100: 'Một trăm tuổi! Một thế kỷ cuộc đời.',
    };
    return t[pa] || U.pick(['Một năm nữa trôi qua.', 'Thời gian trôi nhanh như chó chạy ngoài đồng.', 'Thêm một tuổi, thêm một chút trải nghiệm.', 'Năm mới, những câu chuyện mới.', 'Bạn thổi nến, ước một điều thật nhỏ.']);
  }
  function birthdayScene(pa) {
    const milestone = [1, 6, 10, 16, 18, 30, 40, 50, 60, 70, 80, 90, 100].includes(pa);
    if (milestone) {
      const fam = ['mother', 'father', 'spouse', 'child', 'grandchild', 'sibling', 'partner'].flatMap((r) => alive(r)).filter((x) => x.kind === 'human').slice(0, 3);
      return sceneFor('home', { decor: 'birthday', anim: pa <= 2 ? 'laugh' : 'cheer', fx: 'confetti', time: 'dusk', shot: 'close', people: fam.map((x, i) => ({ p: x, anim: i === 0 ? 'clap' : U.pick(['clap', 'cheer', 'laugh']), say: i === 0 ? 'Chúc mừng sinh nhật!' : null })) });
    }
    const sc = dailyScene();
    if (sc.player.anim === 'idle' || sc.player.anim === 'sit') sc.player.anim = pa <= 2 ? 'laugh' : 'cheer';
    sc.fx = 'sparkle';
    if (Math.random() < 0.12 && sc.loc === 'home') sc.decor = 'tet';
    return sc;
  }
  function eduYear(L) {
    const e = S.edu, pa = P().age;
    if (S.flags.retake && S.year - S.flags.retake >= 1 && !e.inSchool) { delete S.flags.retake; queueMilestone('ms_retake'); }
    if (pa === 3 && e.level === 'none') { e.level = 'preschool'; e.inSchool = true; L('Bạn bắt đầu đi nhà trẻ. Ngày đầu khóc như mưa.', 'neutral', '🧸'); return; }
    if (pa === 6 && (e.level === 'preschool' || e.level === 'none')) { e.level = 'primary'; e.grade = 1; e.inSchool = true; unlock('school_start'); queueMilestone('ms_school1'); return; }
    if (!e.inSchool) return;
    if (['primary', 'secondary', 'highschool', 'vocational', 'university'].includes(e.level)) {
      e.perf = r100(e.perf + U.rand(-7, 7) + (S.stats.smarts - 55) / 12);
      if (e.perf >= 88 && e.level !== 'vocational') { S.counters.honor = (S.counters.honor || 0) + 1; unlock('honor'); L('Bạn đạt danh hiệu Học sinh giỏi! Giấy khen được dán lên tường.', 'good', '🏅'); }
    }
    if (e.level === 'primary') {
      if (pa <= 10) { e.grade = pa - 5; L('Bạn lên lớp ' + e.grade + '.', 'neutral', '📘'); }
      else { e.level = 'secondary'; e.grade = 6; L('Bạn lên cấp 2 — lớp 6, trường mới, bạn mới.', 'milestone', '🏫'); }
    } else if (e.level === 'secondary') {
      if (pa <= 14) { e.grade = Math.min(9, pa - 5); L('Bạn lên lớp ' + e.grade + '.', 'neutral', '📗'); }
      else queueMilestone('ms_grade10');
    } else if (e.level === 'highschool') {
      if (e.grade < 12) { e.grade++; L('Bạn lên lớp ' + e.grade + '.', 'neutral', '📙'); if (S.flags.private_school && P().age >= 18) {} }
      else {
        e.degrees.includes('THPT') || e.degrees.push('THPT'); e.inSchool = false; e.level = 'done';
        L('Bạn tốt nghiệp THPT. Mười hai năm đèn sách khép lại.', 'milestone', '🎓');
        queueMilestone('ms_uni');
      }
    } else if (e.level === 'vocational') {
      e.grade++;
      if (e.grade > 2) { e.inSchool = false; e.level = 'done'; e.degrees.push('Trung cấp nghề'); L('Bạn tốt nghiệp trường nghề, có tay nghề vững vàng.', 'milestone', '🛠️'); }
    } else if (e.level === 'university') {
      const m = D.MAJORS[e.major];
      e.uniYear++; e.grade = e.uniYear;
      if (e.uniYear > (m ? m.years : 4)) {
        e.inSchool = false; e.level = 'done'; e.degrees.push('Cử nhân ' + (m ? m.name : ''));
        unlock('degree'); if (e.perf >= 88) unlock('valedictorian');
        L('Bạn tốt nghiệp đại học ngành ' + (m ? m.name : '') + (e.perf >= 88 ? ' — loại xuất sắc!' : '!'), 'milestone', '🎓');
        queueMilestone('ms_graduate');
      } else L('Bạn lên năm ' + e.uniYear + ' đại học.', 'neutral', '🎓');
    }
  }
  function assetsValue(st) { return (st || S).assets.reduce((s, a) => s + (a.value || 0), 0); }
  function lifestyleDef() { return D.LIFESTYLES.find((x) => x.id === (S.lifestyle || 'binhthuong')) || D.LIFESTYLES[1]; }
  // thuế thu nhập cá nhân theo tháng (giảm trừ 11 triệu + 4,4 triệu mỗi con nhỏ), biểu lũy tiến 5–35%
  function pit(m) {
    const dep = S.people.filter((p) => p.alive && p.role === 'child' && p.age < 18).length;
    const t = Math.max(0, m - 11e6 - dep * 4.4e6);
    let tax = 0, prev = 0;
    for (const [capV, r] of [[5e6, 0.05], [10e6, 0.1], [18e6, 0.15], [32e6, 0.2], [52e6, 0.25], [80e6, 0.3], [Infinity, 0.35]]) { if (t <= prev) break; tax += (Math.min(t, capV) - prev) * r; prev = capV; }
    return Math.round(tax);
  }
  function setLifestyle(id) {
    if (!S || S.dead) return fail('Không thể đổi.');
    const ls = D.LIFESTYLES.find((x) => x.id === id); if (!ls) return fail('Mức sống không hợp lệ.');
    if (P().age < 18) return fail('Từ 18 tuổi mới tự quyết mức sống.');
    S.lifestyle = id; addLog('Bạn chuyển sang lối sống ' + ls.label.toLowerCase() + '.', 'neutral', ls.icon); changed();
    return result({ title: 'Mức sống: ' + ls.label, icon: ls.icon, text: ls.desc, tone: 'neutral' });
  }
  function moneyYear(L, deltas) {
    const pa = P().age;
    S.goldPrice = Math.round(S.goldPrice * U.rand(0.92, 1.2));
    S.assets.forEach((a) => {
      const k = { phone: 0.7, motorbike: 0.88, car: 0.9, house: 1.04, land: U.rand(0.97, 1.12), gold: null, luxury: a.itemId === 'art1' ? 1.05 : 0.93 }[a.type];
      a.value = a.type === 'gold' ? S.goldPrice : Math.round(a.value * (k || 1));
    });
    if (pa >= 6 && pa < 18) { const pm = U.randi(3, 15) * 1e5 * (S.flags.perk_giau ? 4 : 1); addMoney(pm, deltas); }
    if (pa === 18 && S.flags.perk_giau && !S.flags.giau_paid && (has('mother') || has('father'))) { S.flags.giau_paid = S.year; addMoney(600e6, deltas); L('Tròn 18 tuổi, bố mẹ trao cho bạn 600 triệu làm vốn vào đời.', 'good', '💰'); }
    if (pa < 18) return;
    const parentsAlive = has('mother') || has('father');
    const ls = lifestyleDef();
    let income = 0, cost = 0, tax = 0;
    if (S.job) { const m = monthly(); income += m * 12; tax = pit(m) * 12; }
    if (S.retired && S.pension) income += S.pension * 12;
    if (has('spouse') && alive('spouse')[0].age < 62) income += 45e6;
    const student = S.edu.inSchool;
    if (!(student && parentsAlive)) {
      const big = S.city === 'hanoi' || S.city === 'hcm';
      cost += ((big ? 70e6 : 52e6) - (S.assets.some((a) => a.type === 'house') ? 24e6 : 0)) * ls.base;
      // con cái: sữa bỉm, học hành, học thêm
      S.people.filter((x) => x.alive && x.role === 'child' && x.age < 23).forEach((x) => { cost += x.age < 6 ? 36e6 : x.age < 18 ? 48e6 : 40e6; });
      // phụng dưỡng bố mẹ già
      if (pa >= 25 && income > 0) S.people.filter((x) => x.alive && (x.role === 'mother' || x.role === 'father') && x.age >= 60).forEach((x) => { cost += 18e6; x.relation = r100(x.relation + 1); });
      // chi phí nuôi tài sản: xăng xe, bảo hiểm, phí quản lý, bảo dưỡng
      S.assets.forEach((a) => { cost += a.type === 'car' ? Math.max(15e6, a.value * 0.05) : a.type === 'house' ? a.value * 0.004 : a.type === 'luxury' ? a.value * 0.015 : a.type === 'motorbike' ? 3e6 : 0; });
      // mức sống: phần thu nhập sau thuế tiêu cho bản thân
      cost += Math.max(0, income - tax) * ls.share;
      if (S.retired) cost *= 0.8;
      if (ls.id === 'sangchanh') S.counters.lavishYears = (S.counters.lavishYears || 0) + 1;
      if (ls.looks) addStat('looks', U.rand(0, ls.looks), deltas);
    }
    if (student && S.edu.level === 'university') {
      const t = (D.MAJORS[S.edu.major] || {}).tuition || 0;
      if (t) { if (S.money >= t) cost += t; else if (parentsAlive) L('Bố mẹ dành dụm đóng ' + fmtMoney(t) + ' học phí cho bạn.', 'neutral', '🏦'); else cost += t; }
    }
    if (S.flags.private_school && student && S.edu.level === 'highschool' && !parentsAlive) cost += 30e6;
    cost = Math.round(cost / 1e5) * 1e5;
    const net = income - tax - cost;
    addMoney(net, deltas);
    if (income > 0) L('Thu nhập năm nay ' + fmtMoney(income) + (tax ? ' (thuế ' + fmtMoney(tax) + ')' : '') + ', chi tiêu ' + fmtMoney(cost) + ' — mức sống ' + ls.label.toLowerCase() + '.', net >= 0 ? 'neutral' : 'bad', '💰');
    if (S.money < -20e6) { addStat('happy', -4, deltas); if (Math.random() < 0.5) L('Nợ nần chồng chất, đêm nào bạn cũng trằn trọc.', 'bad', '💸'); }
  }
  function peopleYear(L, deltas, relDeltas) {
    const pa = P().age;
    let funeral = false;
    S.people.forEach((x) => {
      if (!x.alive) return;
      const drift = { mother: pa < 12 ? U.rand(0, 2) : -U.rand(0, 2.5), father: pa < 12 ? U.rand(0, 2) : -U.rand(0, 2.5), grandparent: -U.rand(0, 2), sibling: -U.rand(0, 3), friend: -U.rand(1, 5), partner: -U.rand(1, 4), spouse: -U.rand(0, 3), child: -U.rand(0, 2), grandchild: -U.rand(0, 1.5), pet: -U.rand(0, 1), ex: -U.rand(0, 3) }[x.role] || 0;
      x.relation = r100(x.relation + drift);
      // deaths
      let q = x.kind === 'human' ? (x.age < 30 ? 0.0004 : mort(x.age)) : (x.age >= 10 ? 0.18 : 0.01);
      if (Math.random() < q) {
        x.alive = false; x.deathYear = S.year;
        if (x.kind !== 'human') { L('Bé ' + x.firstName + ' đã rời xa bạn, sau ' + x.age + ' năm làm bạn. Bạn chôn bé dưới gốc cây sau nhà.', 'bad', '🐾'); addStat('happy', -8, deltas); return; }
        L(cap(kin(x)) + ' ' + x.firstName + ' qua đời ở tuổi ' + x.age + '.', 'bad', '🕯️');
        addStat('happy', -(closeness[x.role] || 5) * (0.5 + x.relation / 200), deltas);
        if (!funeral && ['mother', 'father', 'grandparent', 'spouse', 'sibling', 'child'].includes(x.role)) { funeral = true; queueMilestone('ms_funeral', { deceased: x }); }
        return;
      }
      if (x.role === 'partner' && x.relation < 22 && Math.random() < 0.35) { x.role = 'ex'; L(x.firstName + ' nói lời chia tay. Bạn khóc cả đêm.', 'bad', '💔'); addStat('happy', -8, deltas); }
      if (x.role === 'spouse' && x.relation < 12 && Math.random() < 0.2) { x.role = 'ex'; x.wasSpouse = true; L('Bạn và ' + x.firstName + ' ra tòa ly hôn.', 'bad', '📄'); if (S.money > 0) addMoney(-S.money * 0.4, deltas); unlock('divorce'); addStat('happy', -12, deltas); }
      if (x.role === 'friend' && x.relation < 10) { x.alive = false; x.gone = true; L('Bạn và ' + x.firstName + ' dần mất liên lạc.', 'neutral', '🍂'); }
      if (x.role === 'child') {
        if (x.age === 18) L('Con ' + x.firstName + ' tròn 18 tuổi. Thời gian trôi nhanh quá!', 'milestone', '🎈');
        if (x.age >= 24 && !x.married && Math.random() < 0.16) { x.married = true; L('Con ' + x.firstName + ' lập gia đình. Bạn vừa vui vừa rưng rưng.', 'milestone', '💒'); addStat('happy', 4, deltas); }
        if (x.married && x.age >= 24 && x.age <= 42 && Math.random() < 0.18 && alive('grandchild').length < 5) {
          const g = U.pick(['m', 'f']);
          const gc = newPerson('grandchild', g, 0, { lastName: x.gender === 'm' ? x.lastName : undefined, parents: [x.appearance], relation: 85 });
          S.people.push(gc); L('Bạn lên chức ' + (P().gender === 'f' ? 'bà' : 'ông') + '! Cháu ' + gc.firstName + ' chào đời.', 'milestone', '👶'); addStat('happy', 6, deltas);
        }
      }
    });
    const mom = alive('mother')[0];
    if (pa >= 1 && pa <= 9 && mom && mom.age <= 41 && alive('sibling').length < 3 && Math.random() < 0.13) {
      const sib = newPerson('sibling', U.pick(['m', 'f']), 0, { lastName: P().lastName, parents: [mom.appearance, (alive('father')[0] || mom).appearance], relation: 70 });
      S.people.push(sib); L('Bạn có thêm một ' + (sib.gender === 'f' ? 'em gái' : 'em trai') + ': bé ' + sib.firstName + '!', 'milestone', '🍼'); addStat('happy', 3, deltas);
    }
    if ([8, 12, 16, 19, 23].includes(pa) && alive('friend').length < 2 && Math.random() < 0.7) {
      const f = newPerson('friend', U.pick(['m', 'f']), U.clamp(pa + U.randi(-1, 1), 5, 99), { relation: U.randi(55, 75) });
      S.people.push(f); L('Bạn kết thân với ' + f.firstName + '.', 'good', '🤝');
    }
  }
  function illnessYear(L) {
    const pa = P().age;
    S.illnesses = S.illnesses.filter((i) => { if (!i.chronic && !i.serious && Math.random() < 0.45) { L('Bạn đã khỏi ' + i.name.toLowerCase() + '.', 'good', '💊'); return false; } return true; });
    const pCatch = (0.05 + (pa > 50 ? 0.06 : 0) + (S.stats.health < 40 ? 0.08 : 0) - (pa < 3 ? 0.02 : 0)) * (S.flags.perk_khoe ? 0.6 : 1);
    if (Math.random() < pCatch) {
      const list = D.ILLNESSES.filter((i) => (!i.minAge || pa >= i.minAge) && !S.illnesses.some((x) => x.id === i.id));
      const w = { cam: 6, sotxh: 1, daday: pa > 15 ? 2 : 0, gaixuong: 1.5, huyetap: 2, tieuduong: 1.5, tim: 0.8, ungthu: 0.35, chanthuong: 0.5 };
      const pick = U.weighted(list, (i) => w[i.id] ?? 1);
      if (pick) { addIllness(pick.name); L('Bạn mắc ' + pick.name.toLowerCase() + '.', 'bad', '🤒'); }
    }
  }

  // ------------------------------------------------------------------ choose
  function presetFrom(ctx) { const o = {}; Object.keys(ctx.map).forEach((k) => (o[k] = ctx.map[k])); return o; }
  // rebuild a binding saved with a scheduled follow-up; people who died or changed role since are dropped
  function presetOf(o) {
    const pre = {};
    Object.keys(o.bind || {}).forEach((k) => { const p = byId(o.bind[k]); if (p && p.alive && (k === 'player' || p.role === k.split('#')[0])) pre[k] = p; });
    Object.keys(o.temps || {}).forEach((k) => { pre[k] = o.temps[k]; });
    return pre;
  }
  function choose(uid, index) {
    if (!S) return fail('Chưa có cuộc đời nào.');
    const i = S.pending.findIndex((e) => e.uid === uid);
    if (i < 0) return fail('Tình huống này đã qua rồi.');
    const inst = S.pending[i], def = evDef(inst.id);
    if (!def) { S.pending.splice(i, 1); changed(); return fail('Tình huống này không còn nữa.'); }
    const ctx = Ctx.restore(inst);
    const choices = def.choiceByKey && inst.dynKeys ? inst.dynKeys.map(def.choiceByKey) : choicesOf(def);
    const c = choices[index];
    if (!c) return fail('Lựa chọn không hợp lệ.');
    if (c.req && !checkReq(c.req, ctx)) return fail(reqReason(c.req));
    S.pending.splice(i, 1);
    let out;
    try {
      if (c.fn) out = c.fn(ctx) || {};
      else if (c.outcomes && c.outcomes.length) {
        if (c.success && c.outcomes.length >= 2) { const pr = U.clamp((c.success.base ?? 0.5) + (c.success.scale ?? 0.5) * statVal(c.success.stat) / 100 + (S.flags.perk_quynhan ? 0.07 : 0), 0.05, 0.95); out = Math.random() < pr ? c.outcomes[0] : c.outcomes[1]; }
        else out = U.weighted(c.outcomes, (o) => o.p ?? 1);
      } else out = c;
    } catch (e) { console.warn('[KN.Game] choice failed', inst.id, e); out = { text: 'Mọi chuyện rồi cũng qua.' }; }
    const deltas = {}, relDeltas = [];
    try { applyEffects(out.effects, ctx, deltas, relDeltas); } catch (e) { console.warn('[KN.Game] effects failed', inst.id, e); }
    const text = fmt(out.text || '', ctx);
    const tone = toneOf(deltas, out.tone);
    addLog(out.effects && out.effects.log ? fmt(out.effects.log, ctx) : inst.title + ' — ' + text, tone, inst.icon);
    let scene = mergeScene(inst.scene, out.scene, ctx);
    let next = null;
    const fu = out.followUp || (out.effects && out.effects.followUp);
    if (fu && !S.dead) {
      const fd = evDef(fu.id);
      const dl = Math.max(0, Math.round(fu.delay || 0));
      if (fd) {
        if (dl >= 1) S.forced.push({ id: fu.id, at: S.year + dl, bind: ctx.ids(), temps: ctx.temps });
        else { const ni = instantiate(fd, presetFrom(ctx)); if (ni) { S.pending.unshift(ni); next = ni; S.usedEvents[fu.id] = S.year; } }
      }
    }
    if (!S.dead && S.stats.health <= 0) die('Sức khỏe suy kiệt');
    checkProgress();
    if (S.dead) scene = deathScene();
    changed();
    return result({ title: inst.title, icon: inst.icon, text, tone, deltas, relDeltas, scene, event: next });
  }
  // ------------------------------------------------------------------ activities
  function payCost(cost) {
    if (!cost) return { ok: true, by: null };
    if (isKid() && (has('mother') || has('father')) && cost <= 3e6) return { ok: true, by: 'parents' };
    if (S.money >= cost) { S.money -= cost; return { ok: true, by: 'self' }; }
    return { ok: false };
  }
  function actDef(id) { return D.ACTIVITIES.find((a) => a.id === id); }
  function actAvail(a) {
    const pa = P().age;
    if (S.dead) return 'Cuộc đời đã khép lại';
    if (pa < a.minAge) return 'Từ ' + a.minAge + ' tuổi';
    if (a.maxAge && pa > a.maxAge) return 'Không còn hợp tuổi';
    if ((S.yearActs[a.id] || 0) >= (a.limit || 3)) return 'Đã làm đủ trong năm nay';
    if (a.id === 'dating' && (has('partner') || has('spouse'))) return 'Bạn đang có đôi';
    if (a.id === 'adopt' && alive('pet').length >= 2) return 'Đủ thú cưng rồi';
    if (a.id === 'stocks' && S.money < 10e6) return 'Cần ít nhất 10 triệu';
    if (a.id === 'doctor' && pa < 18 && !has('mother') && !has('father') && S.money < a.cost) return 'Không đủ tiền';
    const cost = a.cost || 0;
    if (cost && !(isKid() && (has('mother') || has('father')) && cost <= 3e6) && S.money < cost) return 'Cần ' + fmtMoney(cost);
    return null;
  }
  function activities() {
    if (!S) return [];
    return D.ACTIVITIES.filter((a) => P().age >= a.minAge - 2 && (!a.maxAge || P().age <= a.maxAge)).map((a) => {
      const reason = actAvail(a);
      return { id: a.id, label: a.label, icon: a.icon, category: a.cat, categoryLabel: D.ACT_CATS[a.cat], desc: a.desc || '', costText: a.cost ? (isKid() && a.cost <= 3e6 && (has('mother') || has('father')) ? 'Bố mẹ trả' : fmtMoney(a.cost)) : 'Miễn phí', available: !reason, reason };
    });
  }
  function rollEff(eff, k, deltas) { Object.keys(eff || {}).forEach((s) => { const [a, b] = eff[s]; addStat(s, U.rand(a, b) * k, deltas); }); }
  function actScene(base, extra) {
    const ctx = bind({ id: '_act_' + Math.random(), scene: base }) || new Ctx();
    const sc = resolveScene(Object.assign({}, base), ctx);
    if (extra && extra.people) { extra.people.forEach((x) => { if (sc.npcs.length < 4) sc.npcs.push(npcOf(x.p, { anim: x.anim, say: x.say }, sc.loc)); }); if (sc.npcs.length) sc.shot = 'close'; }
    return sc;
  }
  function doActivity(id) {
    if (!S) return fail('Chưa có cuộc đời nào.');
    const a = actDef(id); if (!a) return fail('Hoạt động không tồn tại.');
    const why = actAvail(a); if (why) return fail(why);
    const k = (S.yearActs[id] || 0) ? 0.6 : 1;
    const pay = payCost(a.cost);
    if (!pay.ok) return fail('Không đủ tiền');
    S.yearActs[id] = (S.yearActs[id] || 0) + 1;
    S.counters[id] = (S.counters[id] || 0) + 1;
    const deltas = {}, relDeltas = [];
    if (a.cost && pay.by === 'self') deltas.money = -a.cost;
    let text, scene, tone, title = a.label;
    const friend = alive('friend')[0], partner = alive('partner')[0] || alive('spouse')[0];
    switch (a.special) {
      case 'doctor': {
        const sick = S.illnesses.slice();
        if (!sick.length) { rollEff({ health: [1, 3] }, 1, deltas); text = 'Bác sĩ khám tổng quát và gật gù: "Khỏe re! Cứ giữ lối sống này nhé."'; }
        else {
          const i = U.pick(sick);
          const extra = i.cost && !isKid() ? Math.min(i.cost, Math.max(0, S.money)) : 0; if (extra) addMoney(-extra, deltas);
          if (Math.random() < i.cure) { S.illnesses = S.illnesses.filter((x) => x !== i); rollEff({ health: [4, 10] }, 1, deltas); text = 'Sau đợt điều trị, bạn đã khỏi ' + i.name.toLowerCase() + '! Bác sĩ dặn giữ gìn sức khỏe.'; if (i.serious) unlock('survivor'); }
          else { i.drain = Math.max(2, Math.round(i.drain * 0.7)); rollEff({ health: [1, 4] }, 1, deltas); text = 'Bệnh ' + i.name.toLowerCase() + ' cần điều trị lâu dài. Bác sĩ kê đơn, bệnh đã thuyên giảm phần nào.'; }
        }
        scene = actScene({ loc: 'hospital', anim: 'sit', npcs: [{ role: 'doctor', anim: 'talk', say: 'Há miệng ra nào… "aaa"!' }] });
        break;
      }
      case 'travel': {
        const opts = D.TRAVEL.filter((t) => S.money >= t.cost);
        if (!opts.length) { S.yearActs[id]--; return fail('Cần ít nhất ' + fmtMoney(D.TRAVEL[0].cost) + ' để đi du lịch'); }
        const t = U.pick(opts);
        addMoney(-t.cost, deltas); rollEff(a.eff, 1, deltas);
        S.counters.travel = (S.counters.travel || 0) + 1; if (t.abroad) { S.counters.abroad = (S.counters.abroad || 0) + 1; unlock('abroad'); }
        title = 'Du lịch ' + t.name;
        text = U.pick(['Bạn xách ba lô lên đường đến ' + t.name + '. Những ngày tuyệt vời, ảnh chụp đầy điện thoại.', t.name + ' đẹp hơn cả trong ảnh. Bạn ước thời gian ngừng trôi.', 'Chuyến đi ' + t.name + ' cho bạn thấy thế giới thật rộng lớn.']);
        scene = actScene({ loc: t.loc, time: t.time, weather: t.weather, decor: t.decor, anim: 'cheer', fx: t.fx }, partner ? { people: [{ p: partner, anim: 'love' }] } : null);
        break;
      }
      case 'dating': {
        const p = U.clamp(0.25 + (S.stats.looks - 50) / 90 + (S.stats.happy - 50) / 200, 0.08, 0.85);
        const base = { loc: 'cafe', time: 'dusk', anim: 'talk', npcs: [{ role: 'stranger', gender: P().gender === 'm' ? 'f' : 'm', age: U.clamp(P().age + U.randi(-4, 3), 18, 99), anim: 'talk' }] };
        const ctx = bind({ id: '_date', scene: base });
        if (Math.random() < p) {
          const np = addPersonFrom({ role: 'partner', fromScene: 'stranger' }, ctx);
          rollEff({ happy: [6, 10] }, 1, deltas);
          text = 'Bạn gặp ' + np.firstName + ' qua ứng dụng hẹn hò. Buổi cà phê đầu tiên kéo dài đến tận khuya. Hai người quyết định tìm hiểu nhau!';
          scene = resolveScene(Object.assign({}, base, { anim: 'love', fx: 'hearts' }), ctx); scene.npcs.forEach((n) => { n.id = np.id; n.anim = 'love'; n.say = 'Mình gặp lại nhé?'; });
        } else {
          rollEff({ happy: [-4, -1] }, 1, deltas);
          text = U.pick(['Người ấy đến muộn 45 phút, dùng điện thoại suốt buổi rồi xin về sớm.', 'Ảnh hồ sơ khác người thật đến… ba bộ lọc. Bạn lịch sự uống hết ly nước rồi chào tạm biệt.', 'Hai người nói chuyện như hai cái máy. Không có "tia lửa" nào cả.']);
          scene = resolveScene(Object.assign({}, base, { anim: 'facepalm' }), ctx); scene.npcs.forEach((n) => (n.anim = 'phone'));
        }
        break;
      }
      case 'lottery': {
        const r = Math.random();
        const base = { loc: 'street', anim: 'think', npcs: [{ role: 'vendor', anim: 'talk', say: 'Vé số đây, mua giùm cô tờ!' }] };
        if (r < 1 / 1800) { addMoney(2e9, deltas); unlock('lottery'); text = 'KHÔNG THỂ TIN NỔI! Bạn trúng giải đặc biệt 2 tỷ đồng! Tay bạn run đến mức suýt làm rơi tờ vé.'; scene = actScene(Object.assign({}, base, { anim: 'jump', fx: ['money', 'fireworks'] })); tone = 'milestone'; }
        else if (r < 0.03) { const w = U.pick([5e5, 1e6, 2e6, 1e7]); addMoney(w, deltas); rollEff({ happy: [4, 7] }, 1, deltas); text = 'Trúng giải ' + fmtMoney(w) + '! Bạn mời cả xóm ly trà đá.'; scene = actScene(Object.assign({}, base, { anim: 'cheer', fx: 'money' })); }
        else { rollEff({ happy: [-1, 0] }, 1, deltas); text = U.pick(['Trật lất. Lệch đúng một số!', 'Không trúng. Thôi coi như ủng hộ cô bán vé số.', 'Bạn dò đi dò lại ba lần. Vẫn không trúng.']); scene = actScene(Object.assign({}, base, { anim: 'shrug' })); }
        break;
      }
      case 'sidejob': {
        const earn = Math.round((P().age < 18 ? U.rand(0.8, 2.5) : U.rand(1.5, 5)) * 1e6 / 1e4) * 1e4;
        addMoney(earn, deltas); rollEff(a.eff, 1, deltas);
        text = U.pick(['Bạn chạy giao hàng cả cuối tuần, kiếm được ' + fmtMoney(earn) + '.', 'Bạn phụ quán bún bò, lưng mỏi nhừ nhưng túi rủng rỉnh ' + fmtMoney(earn) + '.', 'Bạn nhận dạy kèm, kiếm thêm ' + fmtMoney(earn) + '.']);
        scene = actScene({ loc: 'street', anim: P().age >= 16 ? 'drive' : 'idle', fx: 'money' });
        break;
      }
      case 'stocks': {
        const amt = Math.round(S.money * 0.25);
        const mult = U.weighted([[0.55, 1], [0.8, 2], [1.0, 2], [1.25, 2], [1.6, 1], [2.2, 0.3]], (x) => x[1])[0] * U.rand(0.95, 1.05);
        const gain = Math.round(amt * (mult - 1));
        addMoney(gain, deltas); rollEff({ happy: gain >= 0 ? [2, 6] : [-6, -2] }, 1, deltas);
        text = gain >= 0 ? 'Bạn rót ' + fmtMoney(amt) + ' vào cổ phiếu. Thị trường xanh mướt — lãi ' + fmtMoney(gain) + '!' : 'Bạn rót ' + fmtMoney(amt) + ' vào cổ phiếu. Thị trường đỏ lửa — lỗ ' + fmtMoney(-gain) + '. Bạn tự nhủ: "Đầu tư dài hạn…"';
        scene = actScene({ loc: 'office', anim: gain >= 0 ? 'cheer' : 'facepalm', fx: gain >= 0 ? 'money' : 'sweat' });
        break;
      }
      case 'livestream': {
        const v = Math.round(U.rand(-1, 6) * (1 + S.stats.looks / 100) * 1e6 / 1e4) * 1e4;
        addMoney(v, deltas); rollEff({ happy: v > 0 ? [2, 5] : [-3, -1] }, 1, deltas);
        text = v > 0 ? 'Livestream "xả kho" thu về ' + fmtMoney(v) + '. Mắt cay xè vì đèn ring light.' : 'Livestream được 7 người xem, trong đó 3 người là họ hàng. Lỗ tiền hàng ' + fmtMoney(-v) + '.';
        scene = actScene({ loc: 'bedroom', anim: 'phone', fx: v > 0 ? 'money' : 'sweat' });
        break;
      }
      case 'surgery': {
        if (Math.random() < 0.82) { rollEff({ looks: [8, 15], happy: [4, 8] }, 1, deltas); text = 'Ca phẫu thuật thành công mỹ mãn. Gương mặt mới khiến bạn tự tin hẳn.'; scene = actScene({ loc: 'hospital', anim: 'cheer', fx: 'sparkle', npcs: [{ role: 'doctor', anim: 'clap' }] }); }
        else { rollEff({ looks: [-12, -6], health: [-12, -6], happy: [-12, -8] }, 1, deltas); text = 'Ca phẫu thuật gặp biến chứng. Bạn phải nằm viện cả tháng và ân hận vô cùng.'; scene = actScene({ loc: 'hospital', anim: 'cry', fx: 'tears', npcs: [{ role: 'doctor', anim: 'facepalm' }] }); }
        break;
      }
      case 'charity': {
        const amt = Math.max(5e5, Math.round(Math.max(0, S.money) * 0.05 / 1e5) * 1e5);
        if (S.money < amt) { S.yearActs[id]--; return fail('Cần ít nhất ' + fmtMoney(amt)); }
        addMoney(-amt, deltas); rollEff({ karma: [5, 10], happy: [3, 6] }, 1, deltas); S.counters.charity = (S.counters.charity || 0) + 1;
        text = U.pick(['Bạn quyên góp ' + fmtMoney(amt) + ' cho đồng bào vùng lũ miền Trung.', 'Bạn nấu cơm từ thiện cho bệnh nhân nghèo, tặng kèm ' + fmtMoney(amt) + '.', 'Bạn ủng hộ ' + fmtMoney(amt) + ' xây trường cho trẻ em vùng cao.']);
        scene = actScene({ loc: 'street', anim: 'bow', fx: 'hearts', npcs: [{ role: 'crowd', anim: 'clap' }] });
        break;
      }
      case 'adopt': {
        const pet = addPersonFrom({ role: 'pet', kind: U.pick(['dog', 'cat']) });
        rollEff({ happy: [6, 10] }, 1, deltas);
        text = 'Bạn đón bé ' + pet.firstName + ' (' + (pet.kind === 'dog' ? 'một chú chó' : 'một bé mèo') + ') về nhà. Cả nhà ai cũng mê!';
        scene = sceneFor('home', { anim: 'cheer', fx: 'hearts', people: [{ p: pet, anim: 'cheer' }] });
        break;
      }
      default: {
        rollEff(a.eff, k, deltas);
        text = U.pick(a.texts || ['Bạn ' + a.label.toLowerCase() + '.']);
        const extra = (a.id === 'cafe' || a.id === 'karaoke') && (partner || friend) ? { people: [{ p: partner || friend, anim: a.id === 'karaoke' ? 'dance' : 'talk' }] } : null;
        scene = actScene(a.scene || { loc: 'home', anim: 'idle' }, extra);
        if (a.id === 'gym' && Math.random() < 0.05) { addIllness('Chấn thương cơ'); text += ' Ối! Bạn bị chấn thương cơ vì tập quá sức.'; }
        if (a.id === 'game' && (S.counters.game || 0) >= 8) S.flags.ghien_game = S.flags.ghien_game || S.year;
      }
    }
    if (pay.by === 'parents' && a.cost) text += ' (Bố mẹ trả tiền.)';
    tone = tone || toneOf(deltas);
    addLog(title + ': ' + text, tone, a.icon);
    checkProgress(); changed();
    return result({ title, icon: a.icon, text, tone, deltas, relDeltas, scene });
  }

  // ------------------------------------------------------------------ relationships
  const SAY = {
    mother: ['Con ăn cơm chưa?', 'Dạo này con gầy quá!', 'Nhớ mặc thêm áo nghe con.', 'Mẹ tự hào về con lắm.'],
    father: ['Có gì khó cứ nói bố.', 'Học hành, làm ăn sao rồi?', 'Đàn ông con trai phải… à mà thôi.', 'Bố tin con.'],
    grandparent: ['Ngày xưa ông bà khổ lắm…', 'Cháu ngoan, ăn thêm miếng nữa.', 'Lại đây bà xem nào!'],
    sibling: ['Trả cái sạc cho tao!', 'Đi ăn chè không?', 'Mẹ mắng mày kìa!'],
    friend: ['Kể nghe chuyện này hay lắm!', 'Lâu quá không gặp!', 'Cuối tuần đi đâu chơi đi!'],
    partner: ['Nhớ anh/em quá…', 'Hôm nay đi đâu đây?', 'Thương lắm á!'], spouse: ['Tối nay ăn gì đây mình?', 'Vất vả rồi, nghỉ đi.', 'Có mình là đủ.'],
    child: ['Bố mẹ ơi chơi với con!', 'Con được điểm 10 nè!', 'Kể chuyện cổ tích đi!'], grandchild: ['Ông bà ơi!', 'Cháu muốn ăn kem!', 'Kể chuyện ngày xưa đi ạ!'],
    ex: ['Dạo này ổn không?', 'Ừ… lâu rồi nhỉ.'],
  };
  function actionsFor(p) {
    const pa = P().age, list = D.ROLE_ACTIONS[p.role] || ['talk'];
    if (!p.alive || S.dead) return [];
    return list.map((id) => {
      const meta2 = D.INTERACTIONS[id] || { label: id, icon: '•' };
      let reason = null;
      const used = S.yearInter[p.id + ':' + id] || 0;
      if (used >= (id === 'talk' ? 2 : 1)) reason = 'Đã làm năm nay';
      else if (pa < 3 && id !== 'hug' && id !== 'play') reason = 'Bạn còn quá nhỏ';
      else if (id === 'ask_money' && pa < 5) reason = 'Bạn còn quá nhỏ';
      else if (id === 'borrow' && pa < 16) reason = 'Từ 16 tuổi';
      else if (id === 'propose' && pa < 18) reason = 'Từ 18 tuổi';
      else if (id === 'propose' && p.relation < 45) reason = 'Tình cảm chưa đủ sâu đậm';
      else if (id === 'baby') { const f = P().gender === 'f' ? P() : p; if (f.age > 46) reason = 'Đã qua tuổi sinh con'; else if (alive('child').filter((c) => c.age === 0).length) reason = 'Bé út còn quá nhỏ'; }
      else if ((id === 'date' || id === 'love') && pa < 14) reason = 'Còn quá nhỏ';
      return { id, label: meta2.label, icon: meta2.icon, disabled: !!reason, reason };
    });
  }
  // ---- quà tặng
  function giftTags(p) {
    if (p.kind && p.kind !== 'human') return ['pet'];
    const t = [p.age < 13 ? 'kid' : p.age < 20 ? 'teen' : p.age >= 55 ? 'elder' : 'adult'];
    if (p.role === 'partner' || p.role === 'spouse') t.push('love');
    return t;
  }
  function giftLiked(g, p) {
    const tags = giftTags(p);
    if (g.fem && p.gender !== 'f') return false;
    return g.likes.some((l) => tags.includes(l));
  }
  function giftOptions(personId) {
    if (!S) return [];
    const p = byId(personId); if (!p || !p.alive) return [];
    const pet = p.kind && p.kind !== 'human';
    return D.GIFTS.filter((g) => !!g.pet === !!pet && (!g.minAge || p.age >= g.minAge)).map((g) => {
      const reason = g.price > S.money ? 'Chưa đủ tiền' : null;
      return { id: g.id, name: g.name, icon: g.icon, price: g.price, priceText: g.price ? fmtMoney(g.price) : 'Miễn phí', desc: g.desc, liked: giftLiked(g, p), affordable: !reason, reason };
    });
  }
  function giveGift(p, giftId, deltas, relDeltas) {
    const pet = p.kind && p.kind !== 'human';
    let g = D.GIFTS.find((x) => x.id === giftId && !!x.pet === !!pet && (!x.minAge || p.age >= x.minAge));
    if (!g) g = pet ? D.GIFTS.find((x) => x.id === 'pate') : D.GIFTS.find((x) => x.id === 'thiep');
    if (g.price > S.money) g = pet ? D.GIFTS.find((x) => x.pet && x.price <= S.money) || null : D.GIFTS.find((x) => x.id === 'thiep');
    if (!g) return null;
    if (g.price) addMoney(-g.price, deltas);
    const liked = giftLiked(g, p), tags = giftTags(p);
    let gain = g.price ? 3 + 2.6 * Math.log10(Math.max(g.price, 2e4) / 5e4) : (tags.some((t) => ['kid', 'elder', 'love'].includes(t)) ? 5 : 3);
    gain += liked ? 4 : -2;
    const stingy = g.price > 0 && S.money > 2e9 && g.price < S.money * 0.0004;
    if (stingy) gain -= 2;
    gain = U.clamp(Math.round(gain + U.rand(-1, 1)), 1, 26);
    addRel(p, gain, relDeltas);
    addStat('happy', U.rand(1, 3) + (g.price >= 5e7 && tags.includes('love') ? 3 : 0), deltas);
    if (g.price >= 3e7) addStat('karma', 1, deltas);
    S.counters.gifts = (S.counters.gifts || 0) + 1;
    S.counters.giftMoney = (S.counters.giftMoney || 0) + g.price;
    if (g.price >= 1e8) unlock('generous');
    return { g, liked, stingy, gain };
  }
  function interact(personId, action, arg) {
    if (!S) return fail('Chưa có cuộc đời nào.');
    const p = byId(personId);
    if (!p || !p.alive || p.id === 'player') return fail('Người này không còn ở bên bạn.');
    const a = actionsFor(p).find((x) => x.id === action);
    if (!a) return fail('Không thể làm điều này.');
    if (a.disabled) return fail(a.reason);
    S.yearInter[p.id + ':' + action] = (S.yearInter[p.id + ':' + action] || 0) + 1;
    const deltas = {}, relDeltas = [];
    const name = p.firstName, K = cap(kin(p));
    const sayL = U.pick(SAY[p.role] || ['…']);
    const pet = p.kind !== 'human';
    let text = '', scene = null, title = (D.INTERACTIONS[action] || {}).label || action, icon = (D.INTERACTIONS[action] || {}).icon || '💬', tone, next = null;
    const famLoc = 'home';
    const S1 = (loc, pAnim, nAnim, o) => sceneFor(loc, Object.assign({ anim: pAnim, people: [{ p, anim: nAnim, say: o && o.say !== undefined ? o.say : null }] }, o || {}));
    switch (action) {
      case 'talk':
        addRel(p, U.randi(3, 8), relDeltas); addStat('happy', U.rand(1, 3), deltas);
        text = U.pick(['Bạn và ' + kin(p) + ' ' + name + ' trò chuyện rôm rả cả buổi.', K + ' ' + name + ' kể cho bạn nghe một câu chuyện cũ. Hai người cười mãi.', 'Một cuộc nói chuyện nhỏ, nhưng làm hai người gần nhau hơn.']);
        scene = S1(['friend', 'ex'].includes(p.role) ? 'cafe' : famLoc, 'talk', 'talk', { say: sayL }); break;
      case 'hug':
        addRel(p, U.randi(4, 9), relDeltas); addStat('happy', U.rand(2, 4), deltas);
        text = 'Bạn ôm ' + kin(p) + ' ' + name + ' thật chặt. Không cần nói gì cả.'; scene = S1(famLoc, 'hug', 'hug', { fx: 'hearts' }); break;
      case 'meal':
        addRel(p, U.randi(4, 9), relDeltas); addStat('happy', U.rand(2, 4), deltas); addStat('health', 1, deltas);
        text = 'Bữa cơm nhà với canh chua, cá kho. ' + K + ' ' + name + ' gắp cho bạn miếng ngon nhất.'; scene = S1(famLoc, 'eat', 'eat', { say: 'Ăn nhiều vào!', fx: 'steam' }); break;
      case 'gift': {
        const gv = giveGift(p, arg, deltas, relDeltas);
        if (!gv) { S.yearInter[p.id + ':' + action]--; return fail('Bạn chưa đủ tiền mua món quà này.'); }
        const { g, liked, stingy } = gv;
        title = 'Tặng ' + g.name.toLowerCase(); icon = g.icon;
        const big = g.price >= 3e7, love = p.role === 'partner' || p.role === 'spouse';
        const react = pet ? U.pick(['Bé vẫy đuôi tít mù, quấn lấy chân bạn không rời!', 'Bé hít hà món quà rồi lăn ra sung sướng.'])
          : stingy ? K + ' ' + name + ' cảm ơn, nhưng thoáng nghĩ: "Giàu thế mà tặng có thế này thôi à?"'
          : !liked ? K + ' ' + name + ' cảm ơn bạn, dù món quà có vẻ không hợp lắm.'
          : big && love ? K + ' ' + name + ' sững người mấy giây rồi ôm chầm lấy bạn, mắt rưng rưng.'
          : big ? K + ' ' + name + ' không tin vào mắt mình: "Trời ơi, sao phải tốn kém thế này!"'
          : U.pick([K + ' ' + name + ' mừng rỡ ra mặt!', K + ' ' + name + ' cười tít mắt, khoe với cả nhà.', K + ' ' + name + ' cảm động, nói mãi lời cảm ơn.']);
        text = 'Bạn tặng ' + kin(p) + ' ' + name + ' ' + g.name.toLowerCase() + (g.price ? ' (' + fmtMoney(g.price) + ')' : '') + '. ' + react;
        const giftLoc = ['xemay', 'oto'].includes(g.id) ? 'street' : g.id === 'nha' ? 'home' : famLoc;
        scene = S1(giftLoc, liked && !stingy ? (big ? 'hug' : 'idle') : 'shrug', pet ? 'jump' : !liked || stingy ? 'nod' : big && love ? 'love' : 'cheer',
          { fx: pet ? 'hearts' : big ? ['sparkle', 'hearts'] : liked ? 'sparkle' : 'sweat', say: pet ? null : !liked || stingy ? 'Ừ… cảm ơn nhé.' : big ? 'Thật hả? Cho mình thật á?' : 'Ôi, cảm ơn nhé!' });
        break;
      }
      case 'ask_money': {
        const ok = Math.random() < 0.3 + p.relation / 150;
        if (ok) { const amt = Math.round((P().age < 18 ? U.rand(1, 5) * 1e5 : U.rand(1, 10) * 1e6) / 1e4) * 1e4; addMoney(amt, deltas); addRel(p, -2, relDeltas); text = K + ' ' + name + ' dúi vào tay bạn ' + fmtMoney(amt) + '. "Tiêu pha cẩn thận nghe chưa!"'; scene = S1(famLoc, 'cheer', 'talk', { fx: 'money', say: 'Cầm lấy mà tiêu!' }); }
        else { addRel(p, -4, relDeltas); addStat('happy', -2, deltas); text = K + ' ' + name + ' từ chối: "Tiền đâu ra mà xin hoài vậy?"'; scene = S1(famLoc, 'sad', 'angry', { say: 'Lại xin tiền à?', fx: null }); }
        break;
      }
      case 'argue':
        addRel(p, -U.randi(8, 15), relDeltas); addStat('happy', -U.rand(2, 5), deltas);
        text = 'Bạn và ' + kin(p) + ' ' + name + ' cãi nhau to tiếng. Cửa đóng sầm, cả nhà im phăng phắc.'; scene = S1(famLoc, 'angry', 'angry', { fx: 'anger', say: 'Không nói nữa!' }); break;
      case 'hangout': {
        const loc = U.pick(['cafe', 'karaoke', 'park', 'street']);
        addRel(p, U.randi(5, 10), relDeltas); addStat('happy', U.rand(3, 6), deltas);
        text = { cafe: 'Hai người ngồi cà phê, tám chuyện trên trời dưới biển.', karaoke: 'Đi hát karaoke, gào thét đến khản cả cổ.', park: 'Đi dạo bờ hồ, ăn kem, chụp ảnh.', street: 'Đi ăn vặt khắp phố: bánh tráng nướng, chè, ốc luộc.' }[loc] + ' Vui hết nấc với ' + name + '!';
        scene = S1(loc, loc === 'karaoke' ? 'sing' : loc === 'cafe' ? 'laugh' : 'walk', loc === 'karaoke' ? 'dance' : 'laugh', { fx: loc === 'karaoke' ? 'music' : 'sparkle', time: loc === 'karaoke' ? 'night' : 'dusk' }); break;
      }
      case 'borrow': {
        const ok = Math.random() < 0.25 + p.relation / 140;
        if (ok) { const amt = U.randi(2, 20) * 1e6; addMoney(amt, deltas); addRel(p, -6, relDeltas); S.flags.debt_friend = S.year; text = name + ' cho bạn vay ' + fmtMoney(amt) + '. "Có thì trả nhé, không gấp."'; scene = S1('cafe', 'bow', 'talk', { fx: 'money' }); }
        else { addRel(p, -5, relDeltas); text = name + ' gãi đầu: "Dạo này tớ cũng kẹt lắm…"'; scene = S1('cafe', 'sad', 'shrug'); }
        break;
      }
      case 'date': {
        const loc = U.pick(['cafe', 'park', 'beach']);
        addRel(p, U.randi(5, 12), relDeltas); addStat('happy', U.rand(4, 8), deltas);
        text = { cafe: 'Hẹn hò ở quán cà phê nhỏ, nắm tay nhau dưới ánh đèn vàng.', park: 'Hai người dạo quanh hồ lúc hoàng hôn, kể nhau nghe những ước mơ.', beach: 'Một buổi tối ngắm biển, gió mát và tiếng sóng rì rào.' }[loc];
        scene = S1(loc, 'love', 'love', { fx: 'hearts', time: 'dusk', say: sayL.replace('anh/em', P().gender === 'm' ? 'anh' : 'em') }); break;
      }
      case 'love':
        addRel(p, U.randi(6, 10), relDeltas); addStat('happy', U.rand(4, 6), deltas);
        text = 'Một buổi tối bình yên bên nhau. ' + name + ' tựa đầu vào vai bạn.'; scene = S1(famLoc, 'hug', 'hug', { fx: 'hearts', time: 'night' }); break;
      case 'propose': {
        const ok = Math.random() < U.clamp(0.25 + p.relation / 110, 0.1, 0.95);
        if (ok) {
          addStat('happy', 10, deltas); addRel(p, 10, relDeltas);
          text = 'Bạn quỳ xuống, mở hộp nhẫn. ' + name + ' bật khóc: "Em/anh đồng ý!"'.replace('Em/anh', p.gender === 'f' ? 'Em' : 'Anh');
          scene = S1('park', 'love', 'cry', { fx: ['hearts', 'fireworks'], time: 'night', say: 'Đồng ý!' }); tone = 'milestone';
          next = instantiate(MS.ms_wedding, { partner: p }); if (next) S.pending.unshift(next);
        } else {
          addStat('happy', -10, deltas); addRel(p, -15, relDeltas);
          text = name + ' ngập ngừng: "Mình… chưa sẵn sàng." Chiếc nhẫn nằm im trong hộp.';
          scene = S1('park', 'sad', 'shake', { fx: 'heartbreak', time: 'night' });
          if (Math.random() < 0.3) { p.role = 'ex'; text += ' Vài tuần sau, hai người chia tay.'; }
        }
        break;
      }
      case 'breakup':
        p.role = 'ex'; addStat('happy', -U.rand(5, 10), deltas); addRel(p, -20, relDeltas);
        text = 'Bạn nói lời chia tay với ' + name + '. Có những người đi cùng mình một đoạn đường thôi.'; scene = S1('cafe', 'sad', 'cry', { fx: 'heartbreak', time: 'dusk' }); break;
      case 'baby': {
        const f = P().gender === 'f' ? P() : p;
        const ok = Math.random() < U.clamp(0.75 - Math.max(0, f.age - 30) * 0.04, 0.1, 0.8);
        if (ok) { const b = makeBaby(); addRel(p, 8, relDeltas); text = 'Tin vui! Gia đình nhỏ đón thêm thành viên mới: bé ' + b.firstName + '.'; addLog('Bé ' + b.firstName + ' chào đời.', 'milestone', '👶'); next = instantiate(MS.ms_newborn, { child: b, spouse: p }); if (next) S.pending.unshift(next); scene = S1('hospital', 'love', 'love', { fx: 'sparkle' }); tone = 'milestone'; }
        else { addStat('happy', -2, deltas); text = 'Hai bạn cố gắng cả năm nhưng chưa có tin vui. "Con cái là lộc trời cho" — mẹ bảo vậy.'; scene = S1(famLoc, 'think', 'hug'); }
        break;
      }
      case 'divorce':
        p.role = 'ex'; p.wasSpouse = true; if (S.money > 0) addMoney(-S.money * 0.4, deltas); addStat('happy', -12, deltas); unlock('divorce');
        text = 'Bạn và ' + name + ' ký đơn ly hôn. Căn nhà bỗng trở nên trống trải.'; scene = S1(famLoc, 'sad', 'cry', { fx: 'heartbreak' }); break;
      case 'play':
        addRel(p, U.randi(6, 10), relDeltas); addStat('happy', U.rand(3, 6), deltas);
        text = pet ? 'Bạn chơi ném bóng với bé ' + name + ' cả buổi chiều.' : 'Bạn chơi trốn tìm, thả diều với ' + kin(p) + ' ' + name + '. Tiếng cười vang cả xóm.';
        scene = S1('park', pet ? 'run' : 'laugh', pet ? 'run' : 'jump', { fx: 'sparkle' }); break;
      case 'teach':
        addRel(p, U.randi(3, 7), relDeltas); addStat('smarts', 1, deltas);
        text = 'Bạn kèm ' + kin(p) + ' ' + name + ' học bài. Bài toán khó cuối cùng cũng được giải.'; scene = S1('bedroom', 'talk', 'study', { fx: 'idea' }); break;
      case 'walk':
        addRel(p, U.randi(5, 9), relDeltas); addStat('happy', U.rand(2, 4), deltas); addStat('health', 1, deltas);
        text = 'Bạn dắt bé ' + name + ' đi dạo quanh hồ. Bé hít ngửi mọi gốc cây.'; scene = S1('park', 'walk', 'walk', { fx: null }); break;
      case 'feed':
        addRel(p, U.randi(4, 8), relDeltas); addStat('happy', U.rand(1, 3), deltas);
        text = 'Bé ' + name + ' ăn ngấu nghiến rồi lăn ra ngủ cạnh chân bạn.'; scene = S1(famLoc, 'idle', 'sleep', { fx: 'hearts' }); break;
      case 'care':
        addRel(p, U.randi(6, 10), relDeltas); addStat('happy', U.rand(1, 3), deltas); addStat('karma', 2, deltas);
        text = 'Bạn đấm lưng, pha trà cho ' + kin(p) + ' ' + name + '. "Có đứa cháu hiếu thảo thế này là phúc."'; scene = S1(famLoc, 'talk', 'love', { say: 'Ngoan quá!' }); break;
      default: return fail('Không thể làm điều này.');
    }
    tone = tone || toneOf(deltas);
    addLog(text, tone, icon);
    checkProgress(); changed();
    return result({ title: title + ' · ' + name, icon, text, tone, deltas, relDeltas, scene, event: next });
  }
  // ------------------------------------------------------------------ education & jobs
  function eduActions() {
    const e = S.edu, pa = P().age, out = [];
    const used = (id) => (S.yearActs['edu_' + id] || 0) > 0;
    if (e.inSchool && pa >= 6) {
      out.push({ id: 'study', label: 'Học chăm hơn', icon: '📚', disabled: used('study'), reason: used('study') ? 'Đã cố gắng năm nay' : null });
      if (pa >= 9 && e.level !== 'university') out.push({ id: 'cheat', label: 'Quay cóp', icon: '🙈', disabled: used('cheat'), reason: used('cheat') ? 'Đã thử năm nay' : null });
      if (pa >= 11) out.push({ id: 'skip', label: 'Trốn học', icon: '🏃', disabled: used('skip'), reason: used('skip') ? 'Đã trốn năm nay' : null });
      if (pa >= 15) out.push({ id: 'dropout', label: 'Bỏ học', icon: '🚪', disabled: false, reason: null });
    } else if (pa >= 18 && pa <= 45 && !hasDegree() && e.degrees.includes('THPT') && !S.pending.length) {
      out.push({ id: 'uni_apply', label: 'Thi đại học', icon: '🎓', disabled: used('uni_apply'), reason: used('uni_apply') ? 'Chờ năm sau' : null });
    }
    return out;
  }
  function eduAction(id) {
    if (!S || S.dead) return fail('Không thể làm điều này.');
    const a = eduActions().find((x) => x.id === id);
    if (!a) return fail('Không thể làm điều này.');
    if (a.disabled) return fail(a.reason);
    S.yearActs['edu_' + id] = 1;
    const deltas = {}, relDeltas = [];
    const e = S.edu, inUni = e.level === 'university';
    const loc = inUni ? 'university' : 'school';
    let text, scene, tone, next = null;
    if (id === 'study') {
      e.perf = r100(e.perf + U.randi(8, 15)); addStat('smarts', U.rand(1, 3), deltas); addStat('happy', -1, deltas);
      text = U.pick(['Bạn cày đề đến khuya, vở ghi chép kín mít.', 'Bạn lên thư viện mỗi chiều. Điểm số khởi sắc thấy rõ.', 'Bạn lập nhóm học cùng bạn bè. Học vui mà hiệu quả.']);
      scene = sceneFor(inUni ? 'university' : 'bedroom', { anim: 'study', fx: 'idea' });
    } else if (id === 'cheat') {
      if (Math.random() < 0.55) { e.perf = r100(e.perf + 8); addStat('karma', -5, deltas); text = 'Bạn chép phao trót lọt. Điểm cao, nhưng trong lòng hơi gợn.'; scene = sceneFor('school', { anim: 'think', fx: 'sweat', people: [{ p: tempPerson('teacher', {}), anim: 'idle' }] }); }
      else { e.perf = r100(e.perf - 12); addStat('happy', -6, deltas); addStat('karma', -3, deltas); alive('mother').concat(alive('father')).forEach((x) => addRel(x, -5, relDeltas)); text = 'Cô giáo bắt quả tang! Bạn bị đánh dấu bài thi và mời phụ huynh lên gặp.'; scene = sceneFor('school', { anim: 'scared', fx: 'exclaim', people: [{ p: tempPerson('teacher', { gender: 'f' }), anim: 'angry', say: 'Em đưa cô tờ giấy kia!' }] }); }
    } else if (id === 'skip') {
      e.perf = r100(e.perf - 8); addStat('happy', U.rand(3, 6), deltas);
      if (Math.random() < 0.3) { alive('mother').concat(alive('father')).forEach((x) => addRel(x, -8, relDeltas)); text = 'Bạn trốn học đi net… và gặp ngay bố đi ngang qua. Về nhà ăn một trận đòn nhớ đời.'; scene = sceneFor('street', { anim: 'scared', fx: 'exclaim', people: alive('father').slice(0, 1).map((p) => ({ p, anim: 'angry', say: 'Về nhà ngay!' })) }); }
      else { text = 'Bạn trốn học đi chơi một buổi. Vui thì vui, nhưng bài vở bị bỏ lỡ.'; scene = sceneFor('cafe', { anim: 'laugh' }); }
    } else if (id === 'dropout') {
      e.inSchool = false; e.dropped = true; if (e.level !== 'university') e.level = 'done'; else e.level = 'done';
      addStat('happy', 2, deltas); alive('mother').concat(alive('father')).forEach((x) => addRel(x, -10, relDeltas));
      text = 'Bạn quyết định bỏ học. Bố mẹ thở dài thườn thượt.'; scene = sceneFor('home', { anim: 'shrug', people: alive('mother').slice(0, 1).map((p) => ({ p, anim: 'cry' })) });
    } else if (id === 'uni_apply') {
      next = instantiate(MS.ms_uni_late);
      if (next) S.pending.unshift(next);
      text = 'Bạn nộp hồ sơ thi đại học. Quyết tâm đi học lại!'; scene = sceneFor('university', { anim: 'cheer', fx: 'sparkle' }); tone = 'good';
    }
    tone = tone || toneOf(deltas);
    addLog(text, tone, a.icon); checkProgress(); changed();
    return result({ title: a.label, icon: a.icon, text, tone, deltas, relDeltas, scene, event: next });
  }
  function jobEligible(c) {
    const pa = P().age, q = c.req || {};
    if (pa < c.minAge) return 'Từ ' + c.minAge + ' tuổi';
    if (pa >= 65) return 'Đã quá tuổi lao động';
    if (c.maxStart && pa > c.maxStart) return 'Quá tuổi bắt đầu nghề này';
    if (S.edu.inSchool && !['phucvu', 'shipper', 'streamer'].includes(c.id)) return 'Đang đi học';
    if (q.major && !(S.edu.major && q.major.includes(S.edu.major) && hasDegree())) return 'Cần bằng ' + q.major.map((m) => D.MAJORS[m].name).join(' / ');
    if (q.degree && !hasDegree()) return 'Cần bằng đại học';
    if (q.hs && !S.edu.degrees.includes('THPT')) return 'Cần bằng THPT';
    if (q.asset && !S.assets.some((a) => a.type === q.asset)) return 'Cần có xe máy';
    if (q.minMoney && S.money < q.minMoney) return 'Cần vốn ' + fmtMoney(q.minMoney);
    if (q.minStat) { const k = Object.keys(q.minStat).find((s) => S.stats[s] < q.minStat[s]); if (k) return 'Cần ' + ({ looks: 'ngoại hình', health: 'sức khỏe', smarts: 'trí tuệ' }[k] || k) + ' ≥ ' + q.minStat[k]; }
    if (S.job && S.job.id === c.id) return 'Bạn đang làm nghề này';
    return null;
  }
  function jobListings() {
    if (!S || P().age < 14) return [];
    return Object.values(D.CAREERS).map((c) => {
      const reason = jobEligible(c);
      return { id: c.id, title: c.title, icon: c.icon, salaryText: D.fmtShort(c.levels[0].salary) + '/tháng', reqText: reqTextOf(c), eligible: !reason, reason };
    }).sort((a, b) => (b.eligible ? 1 : 0) - (a.eligible ? 1 : 0));
  }
  function reqTextOf(c) {
    const q = c.req || {}, parts = ['Từ ' + c.minAge + ' tuổi'];
    if (q.major) parts.push('Bằng ' + q.major.map((m) => D.MAJORS[m].name).join('/'));
    if (q.degree) parts.push('Bằng đại học');
    if (q.hs) parts.push('Bằng THPT');
    if (q.asset) parts.push('Có xe máy');
    if (q.minMoney) parts.push('Vốn ' + fmtMoney(q.minMoney));
    if (q.minStat) Object.keys(q.minStat).forEach((k) => parts.push(({ looks: 'Ngoại hình', health: 'Sức khỏe', smarts: 'Trí tuệ' }[k]) + ' ≥ ' + q.minStat[k]));
    return parts.join(' · ');
  }
  function applyJob(id) {
    if (!S || S.dead) return fail('Không thể ứng tuyển.');
    const c = D.CAREERS[id]; if (!c) return fail('Nghề không tồn tại.');
    const why = jobEligible(c); if (why) return fail(why);
    if ((S.yearActs['apply'] || 0) >= 3) return fail('Bạn đã đi phỏng vấn quá nhiều trong năm nay');
    S.yearActs['apply'] = (S.yearActs['apply'] || 0) + 1;
    const deltas = {};
    const p = U.clamp((c.fame ? 0.25 : 0.55) + (S.stats.smarts - 50) / 150 + (S.stats.looks - 50) / (c.fame ? 120 : 300) + (S.edu.perf - 50) / 300, 0.08, 0.92);
    const boss = tempPerson('boss', {});
    let text, scene, tone;
    if (Math.random() < p) {
      if (S.job) addLog('Bạn nghỉ việc ' + D.CAREERS[S.job.id].title.toLowerCase() + ' để chuyển nghề.', 'neutral', '🔁');
      if (c.id === 'kinhdoanh') addMoney(-150e6, deltas);
      hire(id); addStat('happy', 6, deltas);
      text = 'Bạn trúng tuyển vị trí ' + c.levels[0].title + ' (' + c.title + ')! Lương khởi điểm ' + D.fmtShort(c.levels[0].salary) + '/tháng.';
      scene = sceneFor(c.loc, { anim: 'cheer', fx: 'confetti', people: [{ p: boss, anim: 'clap', say: 'Chào mừng đến với công ty!' }] }); tone = 'good';
    } else {
      addStat('happy', -3, deltas);
      text = U.pick(['Nhà tuyển dụng hẹn "sẽ liên lạc lại". Bạn đợi mãi…', 'Bạn trả lời phỏng vấn lắp bắp. Trượt rồi.', 'Họ tuyển được người khác có kinh nghiệm hơn.']);
      scene = sceneFor('office', { anim: 'sad', people: [{ p: boss, anim: 'shake', say: 'Rất tiếc…' }] }); tone = 'bad';
    }
    addLog(text, tone, c.icon); checkProgress(); changed();
    return result({ title: 'Ứng tuyển: ' + c.title, icon: c.icon, text, tone, deltas, scene });
  }
  function jobActions() {
    if (!S.job) return S.retired ? [] : [];
    const used = (id) => (S.yearActs['job_' + id] || 0) > 0;
    const out = [
      { id: 'workhard', label: 'Làm việc chăm chỉ', icon: '💪', disabled: used('workhard'), reason: used('workhard') ? 'Đã cố gắng năm nay' : null },
      { id: 'raise', label: 'Xin tăng lương', icon: '💹', disabled: used('raise'), reason: used('raise') ? 'Đã xin năm nay' : null },
      { id: 'quit', label: 'Nghỉ việc', icon: '🚪', disabled: false, reason: null },
    ];
    if (P().age >= 55) out.push({ id: 'retire', label: 'Nghỉ hưu', icon: '🪴', disabled: false, reason: null });
    return out;
  }
  function jobAction(id) {
    if (!S || !S.job || S.dead) return fail('Bạn chưa có việc làm.');
    const a = jobActions().find((x) => x.id === id);
    if (!a) return fail('Không thể làm điều này.');
    if (a.disabled) return fail(a.reason);
    S.yearActs['job_' + id] = 1;
    const c = D.CAREERS[S.job.id], deltas = {};
    const boss = tempPerson('boss', {});
    let text, scene, tone;
    if (id === 'workhard') {
      S.job.perf = r100(S.job.perf + U.randi(8, 16)); addStat('health', -2, deltas); addStat('happy', -1, deltas);
      text = U.pick(['Bạn tăng ca cả tháng, dự án về đích đúng hạn.', 'Bạn đến sớm về muộn. Sếp bắt đầu để ý tới bạn.', 'Bạn đề xuất một ý tưởng hay, cả phòng vỗ tay.']);
      scene = sceneFor(c.loc, { anim: c.loc === 'office' ? 'type' : 'idle', fx: 'sweat' });
    } else if (id === 'raise') {
      if (Math.random() < 0.15 + S.job.perf / 140) { S.job.mult = (S.job.mult || 1) * U.rand(1.08, 1.2); addStat('happy', 5, deltas); text = 'Sếp gật đầu: "Em xứng đáng." Lương tăng ngay từ tháng sau!'; scene = sceneFor(c.loc, { anim: 'cheer', fx: 'money', people: [{ p: boss, anim: 'nod', say: 'Được, tăng lương!' }] }); tone = 'good'; }
      else { S.job.perf = r100(S.job.perf - 4); addStat('happy', -3, deltas); text = 'Sếp cười trừ: "Công ty đang khó khăn, em thông cảm."'; scene = sceneFor(c.loc, { anim: 'sad', people: [{ p: boss, anim: 'shrug', say: 'Khó khăn chung mà em…' }] }); tone = 'bad'; }
    } else if (id === 'quit') {
      text = 'Bạn nộp đơn nghỉ việc ' + c.title.toLowerCase() + '. Tự do, nhưng cũng hơi chênh vênh.'; S.job = null; addStat('happy', 2, deltas);
      scene = sceneFor('street', { anim: 'shrug' });
    } else if (id === 'retire') {
      retire(); addStat('happy', 6, deltas); text = 'Bạn chính thức nghỉ hưu, nhận lương hưu ' + D.fmtShort(S.pension) + '/tháng.'; scene = sceneFor('park', { anim: 'cheer', fx: 'sparkle' }); tone = 'milestone';
    }
    tone = tone || toneOf(deltas);
    addLog(text, tone, a.icon); checkProgress(); changed();
    return result({ title: a.label, icon: a.icon, text, tone, deltas, scene });
  }

  // ------------------------------------------------------------------ shop
  function priceOf(it) { return it.type === 'gold' ? S.goldPrice : it.price; }
  function shopItems() {
    if (!S || P().age < 12) return [];
    return D.SHOP.map((it) => {
      const price = priceOf(it), owned = S.assets.some((a) => a.itemId === it.id);
      const ageOk = P().age >= (it.type === 'phone' ? 12 : it.type === 'motorbike' ? 16 : 18);
      return { id: it.id, type: it.type, name: it.name, price, priceText: fmtMoney(price), icon: it.icon, desc: it.desc, affordable: S.money >= price && ageOk, owned: owned && it.type !== 'gold', reason: !ageOk ? 'Chưa đủ tuổi' : S.money < price ? 'Chưa đủ tiền' : null };
    });
  }
  function buy(itemId) {
    if (!S || S.dead) return fail('Không thể mua.');
    const it = D.SHOP.find((x) => x.id === itemId); if (!it) return fail('Món đồ không tồn tại.');
    const view = shopItems().find((x) => x.id === itemId);
    if (view.owned) return fail('Bạn đã có món này rồi.');
    if (!view.affordable) return fail(view.reason || 'Chưa đủ tiền');
    const price = priceOf(it), deltas = { money: -price };
    S.money -= price;
    S.assets.push({ id: U.uid('a'), itemId: it.id, type: it.type, name: it.name, value: Math.round(price * (it.type === 'gold' ? 1 : it.type === 'house' || it.type === 'land' ? 0.97 : 0.85)), icon: it.icon, bought: S.year });
    addStat('happy', it.happy, deltas);
    const text = U.pick(['Bạn tậu ' + it.name.toLowerCase() + '. ', 'Chính thức sở hữu ' + it.name.toLowerCase() + '! ']) + it.desc;
    const loc = it.type === 'house' ? 'home' : it.type === 'land' ? 'countryside' : it.type === 'motorbike' || it.type === 'car' ? 'street' : 'home';
    const scene = sceneFor(loc, { anim: it.type === 'motorbike' ? 'drive' : 'cheer', fx: it.type === 'house' ? 'confetti' : 'sparkle', people: (alive('spouse').concat(alive('partner'), alive('child'))).slice(0, 2).map((p) => ({ p, anim: 'clap' })) });
    addLog('Mua ' + it.name + ' (' + fmtMoney(price) + ').', 'good', it.icon); checkProgress(); changed();
    return result({ title: 'Mua ' + it.name, icon: it.icon, text, tone: 'good', deltas, scene });
  }
  function sell(assetId) {
    if (!S) return fail('Không thể bán.');
    const i = S.assets.findIndex((a) => a.id === assetId); if (i < 0) return fail('Tài sản không tồn tại.');
    const a = S.assets[i]; S.assets.splice(i, 1); S.money += a.value;
    const text = 'Bạn bán ' + a.name.toLowerCase() + ', thu về ' + fmtMoney(a.value) + '.';
    addLog(text, 'neutral', a.icon); changed();
    return result({ title: 'Bán ' + a.name, icon: a.icon, text, tone: 'neutral', deltas: { money: a.value }, scene: sceneFor('street', { anim: 'shrug', fx: 'money' }) });
  }

  // ------------------------------------------------------------------ death & legacy
  function score() {
    const pa = P().age;
    const kids = S.people.filter((p) => p.role === 'child').length, gk = S.people.filter((p) => p.role === 'grandchild').length;
    const close = S.people.filter((p) => p.relation >= 60 && p.kind === 'human').length;
    let s = Math.min(pa, 100) * 1.1 + S.stats.happy * 0.6 + S.stats.smarts * 0.25 + S.stats.looks * 0.15;
    s += moneyStat() * 0.55 + Math.min(10, close) * 4 + Math.min(30, kids * 6) + Math.min(15, gk * 3);
    s += Object.keys(S.ach).length * 4 + S.goals.filter((g) => g.done).length * 18 + (S.karma - 50) * 0.4;
    s += hasDegree() ? 10 : 0;
    return Math.max(0, Math.round(s));
  }
  const rankOf = (s) => (s >= 400 ? 'Huyền thoại' : s >= 320 ? 'Đáng nhớ' : s >= 250 ? 'Trọn vẹn' : s >= 170 ? 'Bình dị' : 'Lận đận');
  function epitaph() {
    const kids = S.people.filter((p) => p.role === 'child').length;
    if (S.karma >= 85) return 'Sống tử tế, ra đi thanh thản.';
    if (S.money >= 1e10) return 'Một đời bươn chải, để lại cơ nghiệp cho con cháu.';
    if (kids >= 3) return 'Con đàn cháu đống, phúc đức đầy nhà.';
    if (P().age >= 90) return 'Sống trọn một đời dài, như cây cổ thụ đầu làng.';
    if (S.karma <= 20) return 'Có những điều chưa kịp sửa, có những người chưa kịp xin lỗi.';
    if (P().age < 30) return 'Như ngọn nến cháy vội, nhưng đã kịp sáng.';
    return U.pick(['Đã sống, đã yêu, đã thương.', 'Một kiếp người bình dị mà ấm áp.', 'Đi qua bao mùa mưa nắng, nay về với đất trời.']);
  }
  function die(cause) {
    if (!S || S.dead) return;
    const pa = P().age;
    P().alive = false; S.pending = [];
    const sc = score();
    S.dead = { cause, age: pa, year: S.year, score: sc, rank: rankOf(sc), epitaph: epitaph() };
    addLog('Bạn qua đời ở tuổi ' + pa + '. ' + cause + '.', 'bad', '🕯️');
    meta.lives.unshift({ fullName: fullName(P()), born: S.born, died: S.year, age: pa, cause, score: sc, rank: S.dead.rank, generation: S.generation });
    meta.lives = meta.lives.slice(0, 60);
    meta.bestScore = Math.max(meta.bestScore || 0, sc);
    emit('death', S.dead);
  }
  function deathInfo() {
    if (!S || !S.dead) return null;
    const hl = S.log.filter((l) => l.tone === 'milestone' && !/^Thành tựu|^Hoàn thành mục tiêu/.test(l.text));
    const pickHl = hl.length > 6 ? [hl[0]].concat(U.shuffle(hl.slice(1, -1)).slice(0, 4), [hl[hl.length - 1]]).sort((a, b) => a.age - b.age) : hl;
    return {
      fullName: fullName(P()), name: P().firstName, born: S.born, died: S.year, age: S.dead.age, cause: S.dead.cause, score: S.dead.score, rank: S.dead.rank, epitaph: S.dead.epitaph,
      stats: Object.assign({}, S.stats, { karma: S.karma }), moneyText: fmtMoney(S.money + assetsValue()),
      highlights: pickHl.map((l) => l.age + ' tuổi — ' + l.text),
      achievements: Object.keys(S.ach).map((id) => ACH[id]).filter(Boolean).map((a) => ({ id: a.id, name: a.name, icon: a.icon })),
      goals: S.goals.map((g) => ({ text: (D.GOALS.find((x) => x.id === g.id) || {}).text || g.id, done: g.done })),
      heirs: S.people.filter((p) => p.alive && p.role === 'child').map((p) => ({ id: p.id, name: p.firstName, age: p.age, gender: p.gender })),
      generation: S.generation,
    };
  }
  function deathScene() {
    const mourners = ['spouse', 'child', 'mother', 'father', 'grandchild', 'sibling', 'friend'].flatMap((r) => alive(r)).filter((p) => p.kind === 'human').slice(0, 4);
    const sc = sceneFor('temple', { decor: 'funeral', time: 'dusk', weather: Math.random() < 0.4 ? 'rain' : 'clear', anim: 'idle', shot: 'wide', people: mourners.map((p, i) => ({ p, anim: i % 2 ? 'sad' : 'cry' })) });
    sc.player.hidden = true;
    sc.fx = null;
    return sc;
  }
  function continueAs(personId) {
    if (!S || !S.dead) return fail('Cuộc đời hiện tại vẫn đang tiếp diễn.');
    const heir = S.people.find((p) => p.id === personId && p.alive && p.role === 'child');
    if (!heir) return fail('Không tìm thấy người con này.');
    const old = S;
    const heirs = old.people.filter((p) => p.alive && p.role === 'child');
    const estate = Math.max(0, old.money + assetsValue(old));
    const share = Math.round(estate / heirs.length);
    S = baseState(old.generation + 1, old.year, old.city);
    S.born = old.year - heir.age;
    S.player = { id: 'player', role: 'player', firstName: heir.firstName, middleName: heir.middleName, lastName: heir.lastName, gender: heir.gender, age: heir.age, alive: true, appearance: heir.appearance, kind: 'human' };
    const deadParent = Object.assign({}, old.player, { id: U.uid('p'), role: old.player.gender === 'f' ? 'mother' : 'father', alive: false, relation: heir.relation });
    S.people.push(deadParent);
    const other = old.people.find((p) => p.alive && p.role === 'spouse');
    if (other) S.people.push(Object.assign({}, other, { role: other.gender === 'f' ? 'mother' : 'father', relation: U.randi(60, 90) }));
    heirs.filter((p) => p !== heir).forEach((p) => S.people.push(Object.assign({}, p, { role: 'sibling', relation: U.randi(50, 85) })));
    old.people.filter((p) => p.alive && p.role === 'pet').forEach((p) => S.people.push(Object.assign({}, p)));
    const pa = heir.age;
    if (heir.married || (pa >= 26 && Math.random() < 0.6)) {
      const sp = newPerson('spouse', heir.gender === 'm' ? 'f' : 'm', U.clamp(pa + U.randi(-4, 3), 18, 99), { relation: U.randi(60, 85) });
      S.people.push(sp);
      old.people.filter((p) => p.alive && p.role === 'grandchild').forEach((g, i) => { if (i % heirs.length === heirs.indexOf(heir) % heirs.length) S.people.push(Object.assign({}, g, { role: 'child', relation: U.randi(70, 90), lastName: heir.gender === 'm' ? heir.lastName : g.lastName })); });
    }
    if (pa < 25) S.people.push(newPerson('friend', U.pick(['m', 'f']), U.clamp(pa + U.randi(-1, 1), 5, 99)));
    S.stats = { happy: U.randi(45, 70), health: r100(100 - Math.max(0, pa - 30) * 0.7 - U.randi(0, 10)), smarts: U.randi(35, 85), looks: U.randi(35, 85) };
    S.karma = r100(50 + (old.karma - 50) * 0.3);
    S.money = share;
    // education / job by age
    const e = S.edu;
    if (pa < 3) e.level = 'none';
    else if (pa <= 5) { e.level = 'preschool'; e.inSchool = true; }
    else if (pa <= 10) { e.level = 'primary'; e.grade = pa - 5; e.inSchool = true; }
    else if (pa <= 14) { e.level = 'secondary'; e.grade = pa - 5; e.inSchool = true; }
    else if (pa <= 17) { e.level = 'highschool'; e.grade = pa - 5; e.inSchool = true; }
    else {
      e.level = 'done'; e.degrees.push('THPT');
      if (Math.random() < 0.55) { e.major = U.pick(Object.keys(D.MAJORS)); e.degrees.push('Cử nhân ' + D.MAJORS[e.major].name); }
      if (pa >= 22 && pa < 60) {
        const opts = Object.values(D.CAREERS).filter((c) => !jobEligible(c) && !c.fame && c.id !== 'kinhdoanh');
        if (opts.length) { const c = U.pick(opts); S.job = { id: c.id, level: Math.min(c.levels.length - 1, Math.floor((pa - 22) / 7)), perf: 55, years: Math.max(0, pa - 23), mult: 1 }; S.flags.had_job = S.year; }
      } else if (pa >= 60) { S.retired = true; S.pension = 6e6; }
    }
    S.goals = pickGoals();
    const K = old.player.gender === 'f' ? 'mẹ' : 'bố';
    addLog('Bạn là ' + fullName(S.player) + ', ' + pa + ' tuổi, tiếp nối cuộc đời sau khi ' + K + ' ' + old.player.firstName + ' qua đời.' + (share ? ' Bạn được thừa kế ' + fmtMoney(share) + '.' : ''), 'milestone', '🌳');
    checkProgress(); changed();
    const scene = dailyScene({ anim: 'pray', fx: 'sparkle' });
    return result({ title: 'Thế hệ thứ ' + S.generation, icon: '🌳', text: 'Bạn là ' + fullName(S.player) + ', ' + pa + ' tuổi. ' + cap(K) + ' ' + old.player.firstName + ' đã đi xa, nhưng câu chuyện của gia đình vẫn tiếp tục — qua bạn.' + (share ? ' Bạn được thừa kế ' + fmtMoney(share) + '.' : ''), tone: 'milestone', scene });
  }

  // ------------------------------------------------------------------ title-screen showcase
  const DEMO = [
    ['street', 'eat', [['vendor', 'cook', 'Phở nóng đây, ăn đi con!', 'f', 55]], 'day', 'steam'],
    ['home', 'sit', [['grandma', 'talk', 'Ăn thêm bát nữa đi cháu!', 'f', 72], ['kid', 'run', null, 'm', 6], ['dog', 'jump']], 'dusk', null],
    ['school', 'wave', [['teacher', 'talk', 'Cả lớp chú ý nào!', 'f', 34], ['kid', 'study', null, 'f', 8]], 'day', null, 8],
    ['karaoke', 'sing', [['friend', 'dance', 'Hát hay quá trời!', 'f', 24], ['friend', 'clap', null, 'm', 25]], 'night', 'music'],
    ['office', 'type', [['boss', 'point', 'Deadline sáng mai nhé!', 'm', 45], ['coworker', 'facepalm', null, 'f', 27]], 'day', 'sweat'],
    ['park', 'run', [['elder', 'dance', 'Hít vào… thở ra…', 'f', 66], ['elder', 'dance', null, 'm', 70]], 'dawn', null],
    ['wedding', 'love', [['bride', 'love', 'Em đồng ý!', 'f', 27], ['guest', 'clap', null, 'm', 50], ['guest', 'clap', null, 'f', 48]], 'dusk', 'petals', 28, 'groom'],
    ['hospital', 'sleep', [['doctor', 'talk', 'Nghỉ ngơi vài hôm là khỏe.', 'm', 50], ['mother', 'sad', null, 'f', 55]], 'day', null],
    ['cafe', 'drink', [['friend', 'laugh', 'Kể tiếp đi, rồi sao nữa?', 'f', 30]], 'dusk', null],
    ['market', 'talk', [['vendor', 'talk', 'Ba chục một ký thôi con!', 'f', 58]], 'day', null, 35, null, 'Bao nhiêu một ký hả cô?'],
    ['countryside', 'wave', [['elder', 'talk', 'Về quê chơi lâu lâu nghe!', 'm', 75], ['dog', 'run']], 'day', null],
    ['beach', 'cheer', [['kid', 'jump', null, 'f', 7], ['partner', 'love', 'Biển đẹp quá anh ơi!', 'f', 30]], 'day', 'sparkle'],
    ['temple', 'pray', [['elder', 'pray', null, 'f', 68]], 'dawn', 'sparkle'],
    ['university', 'cheer', [['friend', 'cheer', 'Tốt nghiệp rồi!!!', 'm', 22], ['friend', 'jump', null, 'f', 22]], 'day', 'confetti', 22],
    ['gym', 'lift', [['friend', 'cheer', 'Cố lên, thêm cái nữa!', 'm', 26]], 'day', 'sweat'],
    ['bedroom', 'study', [['mother', 'talk', 'Học khuya thế con?', 'f', 45], ['cat', 'sleep']], 'night', 'idea', 16],
  ];
  function demoScene(n) {
    const d = DEMO[((n % DEMO.length) + DEMO.length) % DEMO.length];
    const [loc, anim, ppl, time, fx, pAge, pRole, pSay] = d;
    const g = U.pick(['m', 'f']), age = pAge || U.randi(20, 34);
    const pg = pRole === 'groom' ? 'm' : g;
    const app = D.randomAppearance(pg, age, { role: pRole || (age <= 17 && loc === 'school' ? 'student' : null) });
    if (age <= 11 && loc === 'school') app.topStyle = 'school';
    const nm = D.randomName(pg);
    const roleMap = { grandma: 'stranger', elder: 'stranger', guest: 'stranger', mother: 'stranger', partner: 'stranger', friend: 'stranger', bride: 'bride', kid: 'stranger' };
    const npcs = ppl.map((x, i) => {
      const [role, a, say, gg, ag] = x;
      if (role === 'dog' || role === 'cat') return { id: 'demo' + n + '_' + i, name: U.pick(PET_NAMES), kind: role, appearance: null, petColor: U.pick(['#c08040', '#e8a25a', '#f2efe8', '#3a3a3a']), age: 3, gender: 'm', anim: a, expr: null, say: null };
      const gen = gg || U.pick(['m', 'f']), aa = ag || U.randi(20, 60);
      return { id: 'demo' + n + '_' + i, name: D.randomName(gen).firstName, kind: 'human', appearance: D.randomAppearance(gen, aa, { role: roleMap[role] || role }), petColor: null, age: aa, gender: gen, anim: a, expr: null, say: say || null };
    });
    return { loc, decor: null, time, weather: 'clear', player: { id: 'player', name: nm.firstName, appearance: app, age, gender: pg, anim, expr: null, say: pSay || null }, npcs, fx: fx || null, npcFx: null, shot: npcs.length ? 'close' : 'wide' };
  }

  // ------------------------------------------------------------------ view model
  function eduLabel() {
    const e = S.edu, pa = P().age;
    if (e.inSchool) {
      if (e.level === 'preschool') return 'Mầm non';
      if (e.level === 'primary' || e.level === 'secondary' || e.level === 'highschool') return EDU_NAMES[e.level] + ' — lớp ' + e.grade;
      if (e.level === 'university') return 'Đại học năm ' + e.uniYear + ' — ' + (D.MAJORS[e.major] || {}).name;
      if (e.level === 'vocational') return 'Trường nghề năm ' + e.grade;
    }
    if (pa < 3) return 'Chưa đi học';
    return e.degrees.length ? e.degrees[e.degrees.length - 1] : (e.dropped ? 'Đã nghỉ học' : 'Chưa có bằng cấp');
  }
  function occupation() {
    const pa = P().age;
    if (S.dead) return 'Đã khuất';
    if (S.job) { const c = D.CAREERS[S.job.id]; return c.levels[S.job.level].title + (c.levels[S.job.level].title.includes(c.title) ? '' : ' · ' + c.title); }
    if (S.edu.inSchool) { if (S.edu.level === 'university') return 'Sinh viên năm ' + S.edu.uniYear; if (S.edu.level === 'preschool') return 'Bé mẫu giáo'; if (S.edu.level === 'vocational') return 'Học viên trường nghề'; return 'Học sinh lớp ' + S.edu.grade; }
    if (pa < 3) return 'Em bé';
    if (pa < 6) return 'Trẻ con';
    if (S.retired) return 'Nghỉ hưu';
    if (pa >= 60) return 'Người cao tuổi';
    return pa < 18 ? 'Ở nhà' : 'Thất nghiệp';
  }
  function view() {
    if (!S || !S.player) return null;
    const p = P();
    return {
      alive: !S.dead, generation: S.generation, year: S.year, born: S.born,
      name: p.firstName, fullName: fullName(p), gender: p.gender, age: p.age, stage: D.stageOf(p.age), stageLabel: D.STAGES[D.stageOf(p.age)],
      city: S.city, cityName: D.cityName(S.city), stats: Object.assign({}, S.stats), karma: S.karma, money: S.money, moneyText: fmtMoney(S.money),
      occupation: occupation(), appearance: Object.assign({}, p.appearance),
      education: { label: eduLabel(), level: S.edu.level, grade: S.edu.grade, performance: S.edu.perf, inSchool: S.edu.inSchool, degrees: S.edu.degrees.slice(), actions: S.dead ? [] : eduActions() },
      job: S.job ? (() => { const c = D.CAREERS[S.job.id]; return { id: c.id, title: c.title, icon: c.icon, levelTitle: c.levels[S.job.level].title, level: S.job.level, maxLevel: c.levels.length - 1, salaryText: D.fmtShort(monthly()) + '/tháng', performance: S.job.perf, years: S.job.years, actions: S.dead ? [] : jobActions() }; })() : null,
      retired: S.retired, pensionText: S.pension ? D.fmtShort(S.pension) + '/tháng' : null,
      people: S.people.filter((x) => x.alive || (!x.gone && x.deathYear && S.year - x.deathYear < 3)).map((x) => ({
        id: x.id, name: x.firstName, fullName: x.kind === 'human' ? fullName(x) : x.firstName, role: x.role, roleLabel: roleLabel(x), age: x.age, alive: x.alive, relation: x.relation,
        kind: x.kind || 'human', gender: x.gender, appearance: x.appearance, petColor: x.petColor || null, actions: actionsFor(x),
      })),
      assets: S.assets.map((a) => ({ id: a.id, type: a.type, name: a.name, value: a.value, valueText: fmtMoney(a.value), icon: a.icon })),
      illnesses: S.illnesses.map((i) => ({ id: i.id, name: i.name, severity: i.drain })),
      log: S.log.slice(), goals: S.goals.map((g) => ({ id: g.id, text: (D.GOALS.find((x) => x.id === g.id) || {}).text || g.id, done: g.done })),
      achievements: D.ACHIEVEMENTS.map((a) => ({ id: a.id, name: a.name, icon: a.icon, desc: a.desc, unlocked: !!meta.achievements[a.id], thisLife: S.ach[a.id] != null })),
      pendingCount: S.pending.length,
      lifestyle: S.lifestyle || 'binhthuong', lifestyles: D.LIFESTYLES.map((x) => ({ id: x.id, label: x.label, icon: x.icon, desc: x.desc })),
      perks: (S.perks || []).map((id) => D.PERKS.find((x) => x.id === id)).filter(Boolean).map((x) => ({ id: x.id, name: x.name, icon: x.icon })),
      phuc: meta.phuc || 0,
    };
  }

  // ------------------------------------------------------------------ persistence & API
  function load() {
    return adopt(KN.store.get(SAVE, null));
  }
  function adopt(s) {
    if (!(s && s.v === 1 && s.player && s.stats)) return false;
    S = s; S.forced = S.forced || []; S.counters = S.counters || {}; S.ach = S.ach || {}; S.lifestyle = S.lifestyle || 'binhthuong';
    EVMAP = null;
    S.pending = (S.pending || []).filter((e) => evDef(e.id));
    return true;
  }
  // ---- ô lưu thủ công (3 ô) + mã lưu để chuyển máy
  const slotMeta = (st, savedAt) => ({ name: fullName(st.player), age: st.player.age, year: st.year, generation: st.generation, dead: !!st.dead, moneyText: fmtMoney(st.money), savedAt });
  function slots() {
    const all = KN.store.get(SLOTS, {}) || {};
    return [1, 2, 3].map((n) => (all[n] && all[n].state ? Object.assign({ n, empty: false }, slotMeta(all[n].state, all[n].savedAt)) : { n, empty: true }));
  }
  function saveSlot(n, savedAt) {
    if (!S || !S.player) return { ok: false, reason: 'Chưa có cuộc đời nào để lưu.' };
    const all = KN.store.get(SLOTS, {}) || {};
    all[n] = { savedAt: savedAt || 0, state: S };
    if (!KN.store.set(SLOTS, all)) return { ok: false, reason: 'Trình duyệt không cho lưu thêm (bộ nhớ đầy hoặc bị chặn).' };
    return { ok: true, reason: null };
  }
  function loadSlot(n) {
    const all = KN.store.get(SLOTS, {}) || {};
    const st = all[n] && all[n].state;
    if (!st || !adopt(JSON.parse(JSON.stringify(st)))) return { ok: false, reason: 'Ô lưu trống hoặc hỏng.' };
    changed();
    return { ok: true, reason: null };
  }
  function deleteSlot(n) { const all = KN.store.get(SLOTS, {}) || {}; delete all[n]; KN.store.set(SLOTS, all); return { ok: true }; }
  const b64 = { enc: (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }, dec: (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)) };
  async function pipeBytes(bytes, stream) { const out = new Response(new Blob([bytes]).stream().pipeThrough(stream)); return new Uint8Array(await out.arrayBuffer()); }
  // mã lưu gồm kiếp đang chơi + nghĩa trang, thành tựu, Phúc đức
  async function exportCode() {
    const json = JSON.stringify({ k: 'kn', v: 1, state: S, meta });
    const raw = new TextEncoder().encode(json);
    if (typeof CompressionStream === 'function') { try { return 'KN1z.' + b64.enc(await pipeBytes(raw, new CompressionStream('gzip'))); } catch (e) { /* fall back */ } }
    return 'KN1.' + b64.enc(raw);
  }
  async function importCode(code) {
    try {
      code = String(code || '').trim().replace(/\s+/g, '');
      let bytes;
      if (code.startsWith('KN1z.')) { if (typeof DecompressionStream !== 'function') return { ok: false, reason: 'Trình duyệt này không đọc được mã nén.' }; bytes = await pipeBytes(b64.dec(code.slice(5)), new DecompressionStream('gzip')); }
      else if (code.startsWith('KN1.')) bytes = b64.dec(code.slice(4));
      else return { ok: false, reason: 'Mã lưu không đúng định dạng (phải bắt đầu bằng KN1).' };
      const data = JSON.parse(new TextDecoder().decode(bytes));
      if (!data || data.k !== 'kn') return { ok: false, reason: 'Mã lưu không hợp lệ.' };
      if (data.meta) { meta = Object.assign(freshMeta(), data.meta); meta.unlocks = meta.unlocks || {}; }
      if (data.state) { if (!adopt(data.state)) return { ok: false, reason: 'Dữ liệu kiếp người trong mã bị hỏng.' }; } else S = null;
      changed();
      return { ok: true, reason: null, hasLife: !!S };
    } catch (e) { return { ok: false, reason: 'Không đọc được mã lưu. Hãy sao chép lại đầy đủ.' }; }
  }
  const helpers = { has, alive, age: () => P().age, flag: (f) => !!S.flags[f], money: () => S.money, stat: statVal, kin, fullName };

  KN.Game = {
    newLife, ageUp, choose, activities, doActivity, interact, eduAction, jobAction, jobListings, applyJob, shopItems, buy, sell,
    deathInfo, deathScene, continueAs, demoScene, view,
    hasLife: () => !!(S && S.player),
    isDead: () => !!(S && S.dead),
    pending: () => (S ? S.pending.slice() : []),
    currentScene: () => (S ? (S.dead ? deathScene() : dailyScene()) : demoScene(0)),
    meta: () => JSON.parse(JSON.stringify(meta)),
    save, load, slots, saveSlot, loadSlot, deleteSlot, exportCode, importCode,
    giftOptions, setLifestyle, buyUnlock,
    goalsList: () => D.GOALS.map((g) => ({ id: g.id, text: g.text, diff: g.diff })),
    perks: () => D.PERKS.map((p) => ({ id: p.id, kind: p.kind, name: p.name, icon: p.icon, cost: p.cost, desc: p.desc, owned: p.kind === 'unlock' && !!meta.unlocks[p.id] })),
    phuc: () => meta.phuc || 0,
    unlocked: (id) => !!meta.unlocks[id],
    reset() { S = null; KN.store.del(SAVE); emit('change', null); },
    wipeAll() { S = null; meta = freshMeta(); KN.store.del(SAVE); KN.store.del(META); KN.store.del(SLOTS); emit('change', null); },
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return () => { listeners[evt] = (listeners[evt] || []).filter((f) => f !== fn); }; },
    helpers, fmt: (s) => fmt(s, null),
    _state: () => S,
  };
})();
