/* Một Kiếp Người — life simulation core (KN.Game). SPEC §2, §3, §5 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const U = KN.util;
  const D = KN.DATA;
  const SAVE = 'kn_save_v1', META = 'kn_meta_v1';
  const REL_ROLES = ['mother', 'father', 'sibling', 'grandparent', 'friend', 'partner', 'spouse', 'child', 'grandchild', 'pet', 'ex', 'lover'];
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
  // hai ô lưu tách biệt: chơi một mình (offline) và trận solo online — vào cái này không đè cái kia
  let MODE = 'offline';
  const keyOf = (m) => (m === 'online' ? 'kn_save_online_v1' : SAVE);
  function save() { if (S) KN.store.set(keyOf(MODE), S); KN.store.set(META, meta); }
  function setMode(m, opts) {
    m = m === 'online' ? 'online' : 'offline';
    const fresh = !!(opts && opts.fresh);
    if (m === MODE && !fresh) return MODE;
    if (S) KN.store.set(keyOf(MODE), S); // cất kiếp đang chơi vào đúng ô của nó
    MODE = m; S = null;
    if (fresh) KN.store.set(keyOf(m), null); else adopt(KN.store.get(keyOf(m), null));
    emit('change', S);
    return MODE;
  }
  // xem nhanh ô lưu của một chế độ mà không chuyển sang
  function peekSave(m) {
    const st = m === MODE ? S : KN.store.get(keyOf(m), null);
    if (!st || !st.player) return null;
    return { name: st.player.firstName, age: st.dead ? st.dead.age : st.player.age, alive: !st.dead };
  }
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
      case 'lover': return 'người tình';
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
      case 'lover': return 'Người tình (bí mật)';
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
  function statVal(stat) { return stat === 'money' ? moneyStat() : stat === 'karma' ? S.karma : stat === 'english' ? (S.english || 0) : S.stats[stat] ?? 50; }

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
      } else c.set(key, tempPerson(role, counts[role] === 1 && romanceRoles(def).has(role) ? Object.assign({}, n, { gender: loveGender() }) : n), true);
    }
    for (const role of rolesOf(def)) {
      if (c.map[role] || role === 'crowd') continue;
      if (REL_ROLES.includes(role)) { const cand = alive(role).filter((p) => !used.has(p.id)); if (!cand.length) return null; const p = U.pick(cand); used.add(p.id); c.set(role, p); }
      else if (role !== 'deceased') c.set(role, tempPerson(role, romanceRoles(def).has(role) ? { gender: loveGender() } : {}), true);
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
        case 'estate': return fmtMoney(S.flags.estate || 0);
        case 'job': return S.job ? D.CAREERS[S.job.id].levels[S.job.level].title.toLowerCase() : 'công việc';
        case 'school': return (EDU_NAMES[S.edu.level] || 'trường').toLowerCase();
        case 'weddingnote': { const pt = alive('partner')[0]; return pt && pt.gender === P().gender ? ' Pháp luật Việt Nam chưa công nhận hôn nhân cùng giới, nhưng hai bạn vẫn làm lễ trước sự chứng kiến của những người thương mình.' : ''; }
        case 'pmajor': return D.MAJORS[S.flags.parentMajor] ? D.MAJORS[S.flags.parentMajor].name : 'Y';
        case 'ys.sport': case 'ys.stage': case 'ys.next': case 'ys.test': case 'ys.pro': {
          const Y = S.ys && D.YOUTH_SPORT[S.ys.id]; if (!Y) return '';
          if (t === 'ys.sport') return Y.name.toLowerCase();
          if (t === 'ys.pro') return Y.pro;
          const st = Y.stages[t === 'ys.stage' ? S.ys.stage : Math.min(S.ys.stage + 1, Y.stages.length - 1)];
          return t === 'ys.test' ? st.test || '' : st.name;
        }
        case 'fo.club': return (S.flags.foreignOffer || {}).club || 'một đội nước ngoài';
        case 'fo.country': return (S.flags.foreignOffer || {}).country || 'nước ngoài';
        case 'ill': case 'ill.sym': case 'ill.years': case 'ill.next': case 'ill.cost': {
          const i = symIll(); if (!i) return 'bệnh cũ';
          if (t === 'ill') return illLabel(i).toLowerCase();
          if (t === 'ill.years') return String(Math.max(1, neglectOf(i)));
          if (t === 'ill.cost') return fmtMoney(i.cost || 0);
          if (t === 'ill.sym') { const d = D.ILLNESSES.find((x) => x.id === i.id); return (d && d.sym) || (i.cancer ? 'người gầy rộc, đau âm ỉ không dứt' : 'người mệt rã rời'); }
          const nx = escNames(i); return nx.length ? nx.join(', ') : 'bệnh nặng hơn';
        }
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
  const hasDegree = () => S.edu.degrees.some((d) => d !== 'THPT' && !/^Trung cấp/.test(d));
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
    // job: true = chuyện công sở (sếp, KPI, họp, đồng nghiệp…) → không áp cho VĐV, nghệ sĩ, người tự làm chủ. job: 'any' = mọi nghề
    if (q.job === true && S.job && fieldJob(S.job.id)) return false;
    if (q.jobId && !(S.job && arr(q.jobId).includes(S.job.id))) return false;
    if (q.minMoney != null && S.money < q.minMoney) return false;
    if (q.minEnglish != null && (S.english || 0) < q.minEnglish) return false;
    if (q.minFollowers != null && ((S.social && S.social.followers) || 0) < q.minFollowers) return false;
    if (q.abroad != null && !!S.abroad !== !!q.abroad) return false;
    if (q.maxMoney != null && S.money > q.maxMoney) return false;
    if (q.minStat && Object.keys(q.minStat).some((k) => statVal(k) < q.minStat[k])) return false;
    if (q.maxStat && Object.keys(q.maxStat).some((k) => statVal(k) > q.maxStat[k])) return false;
    if (q.asset && !arr(q.asset).some((t) => S.assets.some((a) => a.type === t))) return false;
    if (q.noAsset && arr(q.noAsset).some((t) => S.assets.some((a) => a.type === t))) return false;
    if (q.married != null && has('spouse') !== !!q.married) return false;
    if (q.minKarma != null && S.karma < q.minKarma) return false;
    if (q.maxKarma != null && S.karma > q.maxKarma) return false;
    if (q.city && !arr(q.city).includes(S.city)) return false;
    if (q.minYear != null && S.year < q.minYear) return false;
    if (q.maxYear != null && S.year > q.maxYear) return false;
    if (q.jail != null && !!S.jail !== !!q.jail) return false;
    if (q.illness != null && (S.illnesses.some((i) => !i.hidden)) !== !!q.illness) return false;
    if (q.cond) { try { if (!q.cond(S, helpers)) return false; } catch (e) { return false; } }
    return true;
  }
  function reqReason(q) {
    if (!q) return null;
    if (q.minMoney) return 'Cần ít nhất ' + fmtMoney(q.minMoney);
    if (q.minEnglish) return 'Cần tiếng Anh ≥ ' + q.minEnglish + ' (' + englishLabel(q.minEnglish) + ')';
    if (q.minFollowers) return 'Cần ' + q.minFollowers + ' người theo dõi';
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
  // cảnh “Nhà” đổi theo chỗ ở: phòng trọ → nhà bố mẹ → căn hộ → nhà phố → biệt thự / penthouse
  function homeTier() {
    if (!S || !S.player) return null;
    const own = S.assets.filter((a) => a.type === 'house' && !a.rented).map((a) => a.itemId);
    if (own.includes('house4')) return 'penthouse';
    if (own.includes('house3')) return 'bietthu';
    if (own.includes('house2')) return 'nhapho';
    if (own.includes('house1')) return 'canho';
    const pa = P().age;
    return pa < 18 || (parentsBack() && pa < 27 && !S.flags.marriedYear) ? 'nha' : 'tro';
  }
  // mức nhà + đồ nội thất đã mua (vd 'canho|plant_bonsai,art_son') → môi trường 3D tự dựng lại khi đổi đồ
  function sceneTier() {
    const t = homeTier(); if (!t) return t;
    const f = S.furn ? Object.keys(S.furn).sort().map((k) => S.furn[k]).filter(Boolean) : [];
    // đồ tự bày trong chế độ trang trí 3D → hiện đúng chỗ trong cảnh Nhà (thay cho đồ mặc định)
    const dc = (S.decor || []).filter((x) => DECOR[x.k]);
    const dcs = dc.length ? decorSize().join('x') + ':' + dc.map((x) => [x.k, x.x, x.z, x.r, DECOR[x.k][4], DECOR[x.k][5]].join('.')).join(',') : '';
    return t + (f.length || dcs ? '|' + f.join(',') : '') + (dcs ? '|' + dcs : '');
  }
  function resolveScene(base, ctx) {
    base = base || {};
    const loc = base.loc || (S.daily && S.daily.loc) || 'home';
    const sc = { loc, tier: loc === 'home' ? sceneTier() : null, decor: base.decor || null, time: base.time || 'day', weather: base.weather || 'clear', player: playerOf(loc, base.anim, base.expr, fmt(base.say, ctx)), npcs: [], fx: base.fx || null, npcFx: null, shot: base.shot || null };
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
    const sc = { loc, tier: loc === 'home' ? sceneTier() : null, decor: opts.decor || null, time: opts.time || 'day', weather: opts.weather || 'clear', player: playerOf(loc, opts.anim, opts.expr, opts.say), npcs: [], fx: opts.fx || null, npcFx: null, shot: opts.shot || 'wide' };
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
    // trần bù trừ: trí tuệ + ngoại hình tối đa PAIR_CAP. Chạm trần thì chỉ số đó không tăng thêm,
    // KHÔNG kéo chỉ số kia xuống (làm tốt/học giỏi không bao giờ bị trừ ngoại hình)
    if (v > 0 && (k === 'smarts' || k === 'looks')) v = Math.min(v, Math.max(0, PAIR_CAP - S.stats.smarts - S.stats.looks));
    if (!v) return;
    const b = S.stats[k]; S.stats[k] = r100(b + v); deltas[k] = (deltas[k] || 0) + (S.stats[k] - b);
  }
  // không ai hoàn hảo: trí tuệ + ngoại hình tối đa PAIR_CAP; SUM_CAP chỉ áp khi tạo nhân vật
  const PAIR_CAP = 150, SUM_CAP = 320;
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
    const romance = role === 'partner' || role === 'lover' || role === 'spouse';
    if (src && src.temp && !(romance && !loveOk(src.gender))) {
      p = Object.assign({}, src); delete p.temp; p.id = U.uid(p.kind === 'human' ? 'p' : 'pet'); p.role = role; p.relation = U.randi(55, 75); p.since = S.year;
    } else if (role === 'pet') { p = newPet(spec.kind); }
    else if (role === 'sibling') { p = newPerson('sibling', U.pick(['m', 'f']), 0, { lastName: P().lastName, parents: [alive('mother')[0], alive('father')[0]].filter(Boolean).map((x) => x.appearance) }); }
    else if (role === 'child') { return makeBaby(); }
    else {
      // người yêu sai giới tính so với xu hướng (VD nhân vật phụ trong tình huống trước) → thay bằng người hợp
      const g = romance ? (src && src.temp && !loveOk(src.gender) ? U.pick(loveGenders()) : loveGender()) : U.pick(['m', 'f']);
      const age = role === 'lover' ? U.clamp(P().age - U.randi(3, 15), 19, 99) : src && src.age ? src.age : U.clamp(P().age + U.randi(-3, 3), 3, 99);
      p = newPerson(role, g, age);
    }
    if (role === 'partner') { alive('partner').forEach((x) => (x.role = 'ex')); unlock('first_love'); }
    if (role === 'lover') { alive('lover').forEach((x) => (x.role = 'ex')); p.relation = U.randi(60, 80); if (p.age >= P().age || p.age < 19) p.age = U.clamp(P().age - U.randi(3, 15), 19, 99); }
    if (role === 'pet') { S.counters.pets = (S.counters.pets || 0) + 1; unlock('pet'); }
    S.people.push(p);
    return p;
  }
  function makeBaby() {
    const other = alive('spouse')[0] || alive('partner')[0];
    const g = U.pick(['m', 'f']);
    const lastName = P().gender === 'm' ? P().lastName : (other ? other.lastName : P().lastName);
    const p = newPerson('child', g, 0, { lastName, parents: [P().appearance, other && other.appearance].filter(Boolean), relation: 90 });
    initChild(p);
    S.people.push(p);
    unlock('parent');
    return p;
  }
  function addIllness(name) {
    if (/^ung thư$/i.test(String(name).trim())) return addCancer({ hidden: false, stage: 1 + (Math.random() < 0.4 ? 1 : 0) });
    const cd = D.CANCERS.find((c) => c.name === name);
    if (cd) return addCancer({ id: cd.id, hidden: false, stage: 1 });
    const def = D.ILLNESSES.find((i) => i.name === name) || { id: 'x' + U.hash(name), name, drain: 6, chronic: false, cure: 0.8, cost: 2e6 };
    return addIllnessDef(def);
  }
  function addIllnessDef(def) {
    const old = S.illnesses.find((i) => i.name === def.name);
    if (old) return old;
    const i = { id: def.id, name: def.name, drain: def.drain, chronic: !!def.chronic, incurable: !!def.incurable, cure: def.incurable ? 0 : def.cure, cost: def.cost, serious: !!(def.serious || def.incurable), since: S.year, care: S.year };
    S.illnesses.push(i);
    return i;
  }
  // ung thư: stage 1–4, có thể “âm thầm” (hidden) cho đến khi khám tầm soát hoặc trở nặng
  function addCancer(o) {
    o = o || {};
    const pa = P().age, g = P().gender;
    let cd = o.id && D.CANCERS.find((c) => c.id === o.id);
    if (!cd) cd = U.weighted(D.CANCERS.filter((c) => (!c.gender || c.gender === g) && (!c.minAge || pa >= c.minAge)), (c) => c.w);
    const old = S.illnesses.find((i) => i.id === cd.id);
    if (old) return old;
    const i = { id: cd.id, name: cd.name, cancer: true, stage: U.clamp(o.stage || 1, 1, 4), hidden: o.hidden !== false, serious: true, chronic: false, since: S.year, care: S.year };
    syncCancer(i); S.illnesses.push(i);
    return i;
  }
  function syncCancer(i) {
    const k = i.stage - 1, T = D.CANCER_STAGE;
    i.drain = T.drain[k]; i.cure = T.cure[k]; i.cost = T.cost[k]; i.incurable = i.stage >= 4;
  }
  const illLabel = (i) => i.cancer ? i.name + ' (giai đoạn ' + i.stage + ')' : i.name;
  const neglectOf = (i) => Math.max(0, S.year - (i.care ?? i.since ?? S.year));
  // máu đã mất mỗi năm: bệnh càng để lâu càng hao sức
  function illDrain(i) {
    if (i.hidden) return i.stage >= 2 ? 2 : 1;
    const n = Math.min(4, neglectOf(i));
    return i.drain * (i.chronic && !i.incurable ? 0.5 : 1) * (1 + 0.06 * n);
  }
  const visibleIlls = () => S.illnesses.filter((i) => !i.hidden);
  const worstIll = (list) => (list || S.illnesses).slice().sort((a, b) => illDrain(b) - illDrain(a))[0];
  // bệnh này mà bỏ mặc thì sẽ thành gì (để cảnh báo người chơi)
  function escNames(i) {
    if (i.cancer) return i.stage >= 4 ? [] : ['ung thư giai đoạn ' + (i.stage + 1)];
    const def = D.ILLNESSES.find((d) => d.id === i.id);
    return ((def && def.esc) || []).map((e) => { const t = e.to.startsWith('c_') ? D.CANCERS.find((c) => c.id === e.to) : D.ILLNESSES.find((d) => d.id === e.to); return t ? t.name.toLowerCase() : null; }).filter(Boolean);
  }
  // điều trị một bệnh (dùng chung cho đi khám & tình huống triệu chứng)
  function treatIllness(i, deltas) {
    const kidPaid = isKid() && parentsBack();
    let cost = kidPaid ? 0 : i.cost || 0, insText = '';
    // 71. bảo hiểm: BHYT trả 50% (tối đa 200 triệu), bảo hiểm sức khỏe trả 80% bệnh nặng (tối đa 2 tỷ) — đôi khi bị từ chối chi trả
    const ins = S.ins || {};
    if (cost && ins.bhyt) { const cv = Math.min(Math.round(cost * 0.5), 2e8); cost -= cv; insText += ' BHYT chi trả ' + fmtMoney(cv) + '.'; }
    if (cost && ins.life && (i.serious || i.cancer)) {
      if (!ins.denied && Math.random() < 0.15) { ins.denied = S.year; S.flags.bhClaim = cost; insText += ' Công ty bảo hiểm từ chối chi trả vì "khai không trung thực tiền sử bệnh"!'; queueMilestone('ms_bh_tuchoi'); }
      else { const cv = Math.min(Math.round(cost * 0.8), 2e9); cost -= cv; insText += ' Bảo hiểm sức khỏe chi trả ' + fmtMoney(cv) + '.'; }
    }
    // bệnh nặng mà không đủ tiền chữa → phải xoay xở (quyên góp, bán tài sản, vay mượn)
    if (cost > Math.max(0, S.money) && (i.serious || i.cancer) && S.flags.qgYear !== S.year) { S.flags.qgYear = S.year; S.flags.qgCost = cost - Math.max(0, S.money); queueMilestone('ms_quyengop'); }
    if (cost) addMoney(-cost, deltas);
    i.care = S.year;
    const paid = insText + (kidPaid ? ' Bố mẹ lo hết viện phí.' : cost ? (insText ? ' Phần bạn tự trả: ' : ' Viện phí ') + fmtMoney(cost) + '.' : '');
    if (i.incurable) {
      i.drain = Math.max(3, Math.round(i.drain * 0.8)); rollEff({ health: [1, 3] }, 1, deltas);
      return { ok: false, text: illLabel(i) + ' không thể chữa khỏi hoàn toàn. Bác sĩ cho điều trị duy trì để giảm triệu chứng, dặn tái khám đều đặn.' + paid };
    }
    const pr = U.clamp(i.cure + (S.flags.perk_quynhan ? 0.05 : 0) - (i.cancer ? 0 : Math.min(0.3, neglectOf(i) * 0.05)), 0.02, 0.97);
    if (Math.random() < pr) {
      S.illnesses = S.illnesses.filter((x) => x !== i); rollEff({ health: [4, 10] }, 1, deltas);
      if (i.serious) unlock('survivor');
      return { ok: true, text: 'Sau đợt điều trị, bạn đã khỏi ' + illLabel(i).toLowerCase() + '!' + (i.cancer ? ' Phát hiện ' + (i.stage <= 2 ? 'sớm' : 'kịp') + ' đã cứu bạn một mạng.' : ' Bác sĩ dặn giữ gìn sức khỏe.') + paid };
    }
    if (!i.cancer) i.drain = Math.max(2, Math.round(i.drain * 0.7));
    rollEff({ health: [1, 4] }, 1, deltas);
    return { ok: false, text: 'Bệnh ' + illLabel(i).toLowerCase() + ' cần điều trị lâu dài. Bác sĩ kê đơn, bệnh đã thuyên giảm phần nào — nhớ tái khám, đừng bỏ dở.' + paid };
  }
  const FIELD_JOBS = new Set(['streamer', 'casi', 'dienvien', 'nguoimau', 'nongdan', 'kinhdoanh', 'shipper', 'taixe', 'giangho']);
  function fieldJob(id) { const c = D.CAREERS[id]; return !!(c && (c.sport || FIELD_JOBS.has(id))); }
  function hire(id) {
    const c = D.CAREERS[id]; if (!c) return;
    if (S.job && S.job.club) S.abroad = null;
    if (S.job && S.job.clubName) S.flags.lastClub = S.job.clubName;
    S.job = { id, level: 0, perf: 55, years: 0, mult: 1 }; S.flags.kolFull = false; S.flags.perfWarn = 0;
    S.retired = false;
    if (!S.flags.had_job) { S.flags.had_job = true; S.flags.firstjob_pending = true; }
  }
  function applyEffects(eff, ctx, deltas, relDeltas) {
    if (!eff) return;
    STATS.forEach((k) => addStat(k, eff[k], deltas));
    addStat('karma', eff.karma, deltas);
    if (eff.money) { const pa0 = P().age; addMoney(eff.money > 0 && pa0 < 18 ? Math.min(eff.money * (pa0 < 16 ? 0.3 : 0.5), pa0 < 16 ? 3e6 : 10e6) : eff.money, deltas); }
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
      if (p) { if (role === 'partner' || role === 'lover') p.role = 'ex'; else if (role === 'spouse') { p.role = 'ex'; p.wasSpouse = true; } else { p.alive = false; p.gone = true; } }
    }
    if (eff.kill) {
      const p = (ctx && ctx.get(eff.kill) && !ctx.get(eff.kill).temp ? ctx.get(eff.kill) : null) || alive(eff.kill)[0];
      if (p) { p.alive = false; p.deathYear = S.year; addLog(cap(kin(p)) + ' ' + p.firstName + ' đã qua đời.', 'bad', '🕯️'); }
    }
    if (eff.marry) { const p = alive('partner')[0]; if (p) { p.role = 'spouse'; S.flags.marriedYear = S.year; S.flags.wedCode = null; unlock('married'); (KN.Weekly && KN.Weekly.track('marry')); } }
    if (eff.divorce) { const p = alive('spouse')[0]; if (p) { p.role = 'ex'; p.wasSpouse = true; if (S.money > 0) addMoney(-S.money * 0.4, deltas); unlock('divorce'); } }
    if (eff.baby && (eff.baby === 'solo' || has('spouse') || has('partner'))) { const b = makeBaby(); addLog('Bạn đón con ' + b.firstName + ' chào đời!', 'milestone', '👶'); }
    if (eff.perf && S.job) S.job.perf = r100(S.job.perf + eff.perf); // phong độ / hiệu suất công việc
    if (eff.job) {
      if (eff.job === 'fire' && S.job) { if (D.CAREERS[S.job.id].sport) S.flags.ex_athlete = S.flags.ex_athlete || S.year; S.job = null; }
      else if (eff.job === 'promote' && S.job) promote();
      else if (eff.job === 'raise' && S.job) S.job.mult = (S.job.mult || 1) * 1.12;
      else if (typeof eff.job === 'object' && eff.job.hire) hire(eff.job.hire);
    }
    if (eff.jail) sendToJail(+eff.jail, eff.jailReason || 'phạm tội');
    if (eff.school === 'expel' || eff.school === 'dropout') { S.edu.inSchool = false; S.edu.dropped = true; }
    if (eff.school === 'honor') { S.counters.honor = (S.counters.honor || 0) + 1; unlock('honor'); S.edu.perf = r100(S.edu.perf + 10); }
    if (eff.asset) {
      if (eff.asset.add) S.assets.push({ id: U.uid('a'), itemId: null, type: eff.asset.add.type, name: eff.asset.add.name, value: eff.asset.add.value || 0, icon: ({ phone: '📱', motorbike: '🛵', car: '🚗', house: '🏠', land: '🌾', gold: '🪙', luxury: '💎' })[eff.asset.add.type] || '🎁' });
      if (eff.asset.lose === 'all') S.assets = [];
      else if (eff.asset.lose) [].concat(eff.asset.lose).forEach((t) => { const i = S.assets.findIndex((a) => a.type === t); if (i >= 0) S.assets.splice(i, 1); });
    }
    if (eff.illness) addIllness(eff.illness);
    if (eff.cure) S.illnesses = S.illnesses.filter((i) => i.chronic || i.cancer);
    if (eff.achievement) unlock(eff.achievement);
    if (eff.english) { const b = S.english || 0; S.english = r100(b + eff.english); deltas.english = (deltas.english || 0) + (S.english - b); }
    if (eff.followers && S.social) { const f0 = S.social.followers; S.social.followers = Math.max(0, Math.round(f0 * (1 + eff.followers))); deltas.followers = S.social.followers - f0; }
    if (eff.abroad === 'home' && S.abroad) { S.abroad = null; addLog('Bạn về nước, kết thúc những năm làm việc xa nhà.', 'milestone', '🛬'); }
    if (eff.die) die(eff.die);
  }
  // điều kiện thăng chức: đủ năm ở cấp hiện tại (3, 5, 7… năm) và đủ năng lực cho cấp cao
  function promoGate() {
    const c = D.CAREERS[S.job.id], lv = S.job.level, top = lv + 1 >= c.levels.length - 1;
    if ((S.job.levelYears || 0) < 3 + lv * 2) return false;
    if (top && (c.fame ? S.stats.looks < 70 : S.stats.smarts < 68)) return false;
    return true;
  }
  function promote() {    const c = D.CAREERS[S.job.id];
    if (S.job.level < c.levels.length - 1) { S.job.level++; S.job.perf = 55; S.job.levelYears = 0; S.counters.promoted = (S.counters.promoted || 0) + 1; unlock('promoted'); return true; }
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
      { label: 'Vào trường nghề, học một cái nghề', fn: () => { S.edu.level = 'vocational'; S.edu.grade = 1; S.edu.inSchool = true; S.edu.voc = topPick(S.tradePick) || 'dien'; return { text: 'Bạn vào trường nghề. "Một nghề cho chín còn hơn chín nghề", ông bà dặn vậy.', effects: { happy: 1 }, scene: { anim: 'idle' } }; } },
      { label: 'Nghỉ học, đi làm phụ giúp gia đình', fn: () => { S.edu.inSchool = false; S.edu.dropped = true; S.edu.level = 'done'; return { text: 'Bạn xếp sách vở lại. Đời bắt đầu dạy bạn những bài học khác.', effects: { happy: -3, smarts: -1 }, scene: { anim: 'sad' } }; } },
    ] });
  function examOutcome(bonus, extra) {
    const p = U.clamp(dif('exam') + 0.28 + (S.stats.smarts - 50) / 85 + (S.edu.perf - 50) / 130 + bonus, 0.07, 0.88);
    if (miniWin(p)) {
      S.edu.level = 'highschool'; S.edu.grade = 10; S.edu.inSchool = true; unlock('grade10');
      return { text: 'Bạn đỗ vào lớp 10 công lập! Cả nhà mở tiệc nhỏ, {mother.k} khoe khắp xóm.' + parentReact(true, null), effects: Object.assign({ happy: 8, rel: { mother: 4, father: 4 } }, extra), scene: { anim: 'cheer', fx: 'confetti', npcAnim: { classmate: 'clap', teacher: 'clap' } }, tone: 'milestone' };
    }
    return { text: 'Bạn trượt nguyện vọng 1. Tối đó bạn khóc thút thít trong phòng.' + parentReact(false, null), effects: Object.assign({ happy: -8 }, extra), scene: { anim: 'cry', fx: 'tears' }, tone: 'bad', followUp: { id: 'ms_grade10_fail', delay: 0 } };
  }
  // đỗ đại học: ngành “hot” khó hơn hẳn; dù giỏi cũng không bao giờ chắc chắn (điểm chuẩn mỗi năm một khác)
  const uniChance = (m) => U.clamp(dif('exam') + 0.32 +(S.stats.smarts - m.diff) / 75 + (S.edu.perf - 55) / 140 - Math.max(0, m.diff - 60) / 120, 0.04, m.diff >= 70 ? 0.72 : m.diff >= 60 ? 0.8 : 0.88);
  function uniHint(major) {
    const m = D.MAJORS[major], p = uniChance(m);
    const jobs = Object.values(D.CAREERS).filter((c) => c.req && c.req.major && c.req.major.includes(major)).map((c) => c.title);
    return (S.flags.parentMajor === major && !S.flags.disowned ? '👪 Bố mẹ muốn · ' : '') + 'Đỗ ~' + Math.round(p * 100) + '% · ' + m.years + ' năm · ' + (m.tuition ? D.fmtShort(m.tuition) + '/năm' : 'miễn học phí') + (jobs.length ? ' · ra làm ' + jobs.slice(0, 2).join(', ') : '');
  }
  function uniChoice(major) {
    const m = D.MAJORS[major];
    return { label: m.icon + ' ' + m.name, hint: uniHint(major), fn: () => {
      const p = uniChance(m);
      S.edu.degrees.includes('THPT') || S.edu.degrees.push('THPT');
      if (miniWin(p)) {
        S.edu.level = 'university'; S.edu.major = major; S.edu.uniYear = 1; S.edu.grade = 1; S.edu.inSchool = true; S.edu.perf = r100(50 + U.rand(-5, 10)); delete S.flags.retake;
        unlock('uni');
        return { text: 'Bạn đỗ ngành ' + m.name + '! Cầm giấy báo nhập học mà tay run run. Cả họ gọi điện chúc mừng.' + parentReact(true, major), effects: { happy: 12, smarts: 2 }, scene: { loc: 'university', anim: 'cheer', fx: 'fireworks', npcAnim: { mother: 'clap', father: 'cheer' } }, tone: 'milestone' };
      }
      return { text: 'Thiếu ' + (U.rand(0.25, 2).toFixed(2).replace('.', ',')) + ' điểm. Bạn trượt ngành ' + m.name + '.' + parentReact(false, major), effects: { happy: -10 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad', followUp: { id: 'ms_uni_fail', delay: 0 } };
    } };
  }
  // du học đại học: cần tiếng Anh; học phí rất đắt trừ khi có học bổng
  function duHoc() {
    const country = U.pick(ABROAD);
    const sch = S.stats.smarts >= 85 ? 'full' : S.stats.smarts >= 75 && Math.random() < 0.5 ? 'half' : null;
    const rich = parentsBack() && (S.flags.perk_giau || S.money >= 700e6);
    if (!sch && !rich && S.money < 700e6) return { text: 'Hồ sơ du học ' + country + ' được chấp nhận, nhưng không có học bổng mà gia đình cũng không kham nổi 700 triệu mỗi năm. Bạn đành ở lại học trong nước.', effects: { happy: -8 }, scene: { anim: 'sad', fx: 'tears' }, tone: 'bad', followUp: { id: 'ms_uni_fail', delay: 0 } };
    const majors = Object.keys(D.MAJORS).filter((m) => !['anninh', 'supham'].includes(m)).sort((a, b) => uniChance(D.MAJORS[b]) - uniChance(D.MAJORS[a]));
    const major = majors[0];
    S.edu.level = 'university'; S.edu.major = major; S.edu.uniYear = 1; S.edu.grade = 1; S.edu.inSchool = true; S.edu.perf = r100(55); S.edu.abroad = { country, sch, paidBy: sch === 'full' ? 'hb' : rich ? 'parents' : 'self' };
    S.edu.degrees.includes('THPT') || S.edu.degrees.push('THPT'); unlock('uni'); unlock('abroad');
    return { text: 'Bạn bay sang ' + country + ' du học ngành ' + D.MAJORS[major].name + (sch === 'full' ? ' với học bổng toàn phần!' : sch === 'half' ? ', được học bổng một nửa.' : rich ? ', bố mẹ dốc hết tiền dành dụm lo học phí.' : ', tự trả học phí bằng số tiền tích cóp.') + ' Sân bay hôm ấy cả nhà khóc như mưa.' + parentReact(true, S.flags.parentMajor === major ? major : null), effects: { happy: 10 }, scene: { loc: 'airport', anim: 'wave', fx: 'sparkle', npcAnim: { mother: 'cry', father: 'wave' } }, tone: 'milestone' };
  }  function uniEventDef(id, title, text) {
    const pool = Object.keys(D.MAJORS);
    return { id, title, icon: '🎓', age: [17, 40], text: text + ' Có ' + pool.length + ' ngành để chọn — hãy cân nhắc sức học và túi tiền.', many: true,
      scene: { loc: 'school', anim: 'think', npcs: [{ role: 'mother', anim: 'talk', say: 'Con thích ngành nào thì cứ chọn.' }, { role: 'father', anim: 'idle' }] },
      choicesFn: () => pool.slice().sort((a, b) => uniChance(D.MAJORS[b]) - uniChance(D.MAJORS[a])).concat(['abroad', 'work']).map(byKey),
      choiceByKey: (k) => byKey(k) };
    function byKey(k) {
      if (k === 'abroad') return { key: 'abroad', label: '✈️ Du học nước ngoài', hint: 'Cần tiếng Anh ≥ 60 · ~700 triệu/năm (học bổng nếu trí tuệ ≥ 85) · bằng nước ngoài dễ xin việc, lương cao', req: { minEnglish: 60 }, fn: duHoc };
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
      { label: 'Đi học nghề', fn: () => { S.edu.level = 'vocational'; S.edu.grade = 1; S.edu.inSchool = true; S.edu.voc = topPick(S.tradePick) || 'dien'; return { text: 'Bạn chọn học nghề. Đôi tay khéo léo cũng nuôi được cả nhà.', effects: { happy: 2 }, scene: { anim: 'nod' } }; } },
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
  // 💍 người yêu chủ động cầu hôn mình (không phải lúc nào mình cũng là người quỳ xuống)
  ms({ id: 'ms_bi_cauhon', title: 'Được cầu hôn', icon: '💍', age: [18, 99],
    text: 'Bữa tối kỷ niệm, {partner} bỗng đứng dậy, quỳ một chân xuống và mở hộp nhẫn: “Mình đã nghĩ kỹ rồi. Lấy mình nhé?” Cả nhà hàng im phăng phắc chờ câu trả lời của bạn.',
    scene: { loc: 'park', time: 'night', anim: 'scared', expr: 'surprised', npcs: [{ role: 'partner', anim: 'love', say: 'Lấy mình nhé?' }, { role: 'crowd', anim: 'clap' }], fx: 'hearts', shot: 'close' },
    choices: [
      { label: '💍 Đồng ý!', fn: () => { const p = alive('partner').find((x) => x.id === S.flags.cauhonBy) || alive('partner')[0]; if (!p) return { text: 'Người ấy đã không còn ở bên bạn.' }; p.relation = r100(p.relation + 10); const nx = instantiate(MS.ms_wedding, { partner: p }); if (nx) S.pending.unshift(nx); return { text: 'Bạn bật khóc gật đầu. Cả nhà hàng vỡ oà vỗ tay. Hai bên gia đình bắt đầu bàn chuyện cưới xin ngay tuần sau.', effects: { happy: 12 }, scene: { anim: 'cry', fx: ['hearts', 'fireworks'] }, tone: 'milestone' }; } },
      { label: '⏳ Mình chưa sẵn sàng, đợi thêm nhé', fn: () => { const p = alive('partner')[0]; if (p) p.relation = r100(p.relation - 8); return { text: 'Bạn nắm tay người ấy: “Cho mình thêm thời gian.” Người ấy cười gượng, cất hộp nhẫn vào túi. Về nhà cả hai đều im lặng.', effects: { happy: -3 }, scene: { anim: 'sad' }, tone: 'neutral' }; } },
      { label: '💔 Từ chối, mình không muốn cưới người này', fn: () => { const p = alive('partner')[0]; if (p) { p.role = 'ex'; } return { text: 'Bạn lắc đầu. Không khí đóng băng. Người ấy lặng lẽ đứng dậy rời đi — mối tình khép lại từ tối hôm đó.', effects: { happy: -8 }, scene: { anim: 'shake', fx: 'heartbreak' }, tone: 'bad' }; } },
    ] });
  ms({ id: 'ms_wedding', title: 'Đám cưới', icon: '💍', age: [16, 99],
    text: 'Ngày trọng đại đã đến. {partner} trong bộ đồ cưới rạng rỡ, hai họ tề tựu đông đủ. Bạn hồi hộp đến mức quên cả lời phát biểu.{weddingnote}',
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
  // ---- xu hướng tính dục ----------------------------------------------------------------------
  // straight: yêu khác giới · gay: yêu cùng giới (đồng tính nam/nữ) · bi: song tính
  function loveGenders() {
    const g = P().gender, other = g === 'm' ? 'f' : 'm', o = S.orientation || 'straight';
    return o === 'gay' ? [g] : o === 'bi' ? [g, other] : [other];
  }
  const loveGender = () => U.pick(loveGenders());
  const loveOk = (g) => loveGenders().includes(g);
  // những vai trong tình huống sẽ trở thành người yêu/người tình → tạo đúng giới tính ngay từ đầu
  // (dò cả các tình huống nối tiếp: người đồng nghiệp nhắn tin hôm nay có thể thành người yêu ở chương sau)
  const ROMANCE = new Map();
  function romanceRoles(def) {
    if (def.id && ROMANCE.has(def.id)) return ROMANCE.get(def.id);
    const set = new Set(), seen = new Set([def.id]);
    const scan = (o, d) => {
      if (!o || typeof o !== 'object' || d > 10) return;
      if (o.addPerson && ['partner', 'lover', 'spouse'].includes(o.addPerson.role) && o.addPerson.fromScene) set.add(o.addPerson.fromScene);
      if (o.followUp && o.followUp.id && !seen.has(o.followUp.id)) { seen.add(o.followUp.id); const nx = evDef(o.followUp.id); if (nx && Array.isArray(nx.choices)) scan(nx.choices, d + 1); }
      Object.values(o).forEach((v) => { if (v && typeof v === 'object') scan(v, d + 1); });
    };
    try { if (Array.isArray(def.choices)) scan(def.choices, 0); } catch (e) { /* bỏ qua */ }
    if (def.id) ROMANCE.set(def.id, set);
    return set;
  }
  const ORIENT_LABEL = { straight: 'Dị tính', gay: 'Đồng tính', bi: 'Song tính' };
  ms({ id: 'ms_lgbt_aware', title: 'Một cảm xúc khác lạ', icon: '🏳️‍🌈', age: [12, 20],
    text: 'Dạo này tim bạn cứ đập loạn mỗi khi {classmate} cười với mình — một người bạn cùng giới. Bạn bè xung quanh toàn bàn chuyện “crush” khác giới, còn bạn thì lặng im, vừa bối rối vừa sợ ai đó nhìn thấu.',
    scene: { loc: 'school', anim: 'think', expr: 'surprised', npcs: [{ role: 'classmate', anim: 'laugh' }], fx: 'question' },
    choices: [
      { label: 'Tự nhủ: “Mình là mình, không có gì sai”', fn: () => { S.flags.lgbt_aware = S.year; S.flags.lgbtAge = P().age + 2; return { text: 'Bạn tìm đọc những câu chuyện của cộng đồng LGBT và biết rằng mình không hề lạc loài. Lần đầu tiên bạn thấy nhẹ nhõm khi gọi được tên cảm xúc của mình.', effects: { happy: 6, smarts: 2 }, scene: { anim: 'nod', fx: 'sparkle' }, tone: 'good' }; } },
      { label: 'Tâm sự với một người bạn thân', fn: () => { S.flags.lgbt_aware = S.year; S.flags.lgbtAge = P().age + 2; const ok = Math.random() < 0.75; return { text: ok ? 'Bạn thân nghe xong thì ôm chầm lấy bạn: “Mày vẫn là mày thôi, có gì đâu.” Có người hiểu mình, mọi thứ bớt nặng nề hẳn.' : 'Bạn thân im lặng hơi lâu rồi bảo “Ờ… để tao nghĩ đã”. Mấy hôm sau mọi chuyện mới trở lại bình thường, nhưng bạn học được cách chọn người để tin.', effects: ok ? { happy: 6 } : { happy: -3 }, scene: { anim: ok ? 'hug' : 'sad', fx: ok ? 'hearts' : 'question' } }; } },
      { label: 'Cố gắng giấu thật kỹ', fn: () => { S.flags.lgbt_aware = S.year; S.flags.lgbt_hidden = S.year; S.flags.lgbtAge = P().age + 4; return { text: 'Bạn gạt cảm xúc sang một bên, còn cố tỏ ra thích người khác giới như bạn bè. Ngoài mặt thì yên ổn, nhưng trong lòng mệt mỏi vô cùng.', effects: { happy: -6 }, scene: { anim: 'sad', fx: 'sweat' }, tone: 'bad' }; } },
    ] });
  ms({ id: 'ms_comeout', title: 'Nói với bố mẹ', icon: '🏳️‍🌈', age: [15, 60],
    text: 'Bữa cơm tối, mẹ lại hỏi: “Bao giờ dẫn người yêu về ra mắt?” Bạn đặt đũa xuống. Đã đến lúc nói thật về con người mình chưa?',
    scene: { loc: 'home', time: 'night', anim: 'think', npcs: [{ role: 'mother', anim: 'talk', say: 'Bao giờ dẫn người yêu về?' }, { role: 'father', anim: 'eat' }], fx: 'question' },
    choices: [
      { label: 'Nói thật: “Con thích người cùng giới”', fn: () => {
        S.flags.lgbt_told = S.year; delete S.flags.lgbt_hidden;
        const st = S.parenting, r = Math.random();
        const relAll = (v) => ['mother', 'father'].forEach((k) => alive(k).forEach((x) => (x.relation = r100(x.relation + v))));
        if (st === 'danchu' || (st === 'chieu' && r < 0.7) || (st === 'thoo' && r < 0.5)) { relAll(8); return { text: 'Cả nhà im lặng một lúc. Rồi mẹ nắm tay bạn: “Con là con của mẹ. Mẹ chỉ mong con hạnh phúc.” Bố gật đầu, gắp cho bạn miếng thịt to nhất.', effects: { happy: 12 }, scene: { anim: 'hug', fx: 'hearts', npcAnim: { mother: 'hug', father: 'nod' } }, tone: 'good' }; }
        if (st === 'apdat' && r < 0.3 && !S.flags.disowned) { S.flags.disowned = S.year; ['mother', 'father'].forEach((k) => alive(k).forEach((x) => (x.relation = Math.min(x.relation, 5)))); addLog('Bố mẹ không chấp nhận con người thật của bạn và từ mặt bạn.', 'bad', '🚪'); return { text: 'Bố đập bàn đứng dậy: “Nhà này không chấp nhận chuyện đó!” Đêm ấy bạn xách ba lô ra khỏi nhà. Một ngày nào đó có thể bố mẹ sẽ hiểu — nhưng không phải hôm nay.', effects: { happy: -15 }, scene: { anim: 'cry', fx: 'heartbreak', npcAnim: { father: 'angry', mother: 'cry' } }, tone: 'bad' }; }
        relAll(-10); return { text: 'Mẹ khóc, bố bỏ ra hiên ngồi một mình. Mấy tháng liền bố mẹ không nhắc lại chuyện này — nhưng mẹ bắt đầu đọc báo về người LGBT, và bạn coi đó là một khởi đầu.', effects: { happy: -4, karma: 2 }, scene: { anim: 'sad', fx: 'tears', npcAnim: { mother: 'cry', father: 'walk' } } };
      } },
      { label: 'Chưa sẵn sàng, để sau', fn: () => { S.flags.lgbtAge = P().age + 3; return { text: 'Bạn cười trừ: “Con còn bận lắm mẹ ơi.” Câu chuyện trôi qua. Bí mật vẫn nằm đó, chờ một ngày đủ can đảm.', effects: { happy: -3 }, scene: { anim: 'shrug', fx: 'sweat' } }; } },
    ] });
  // ---- bố mẹ áp đặt
  ms({ id: 'ms_parent_major', title: 'Bố mẹ đã chọn ngành cho con', icon: '📏', age: [14, 20],
    text: 'Tối nay bố mẹ gọi bạn ra phòng khách. Trên bàn là bộ hồ sơ đã điền sẵn: ngành {pmajor}. Bố gõ tay xuống bàn: “Bố mẹ quyết rồi. Con cứ thế mà ôn, thi trượt thì đừng nhìn mặt bố mẹ.”',
    scene: { loc: 'home', time: 'night', anim: 'sad', npcs: [{ role: 'father', anim: 'point', say: 'Ngành {pmajor}, không bàn nữa!' }, { role: 'mother', anim: 'talk', say: 'Bố mẹ chỉ muốn tốt cho con.' }] },
    choices: [
      { label: 'Vâng lời, ôn thi ngành bố mẹ chọn', fn: () => ({ text: 'Bạn cúi đầu “dạ”. Từ tối đó, góc học tập dán kín lịch ôn thi ngành {pmajor}. Bố mẹ hài lòng, nhưng bạn thấy như đang sống cuộc đời của người khác.', effects: { happy: -4, smarts: 2, rel: { mother: 5, father: 5 } }, scene: { anim: 'study', fx: 'sweat' } }) },
      { label: 'Xin được chọn ngành mình thích', fn: () => {
        if (Math.random() < 0.35) { delete S.flags.parentMajor; return { text: 'Bạn trình bày cả tiếng đồng hồ, có cả bảng so sánh ngành nghề. Mẹ đỏ mắt, bố im lặng rất lâu rồi thở dài: “Thôi, con lớn rồi, tự chịu trách nhiệm.”', effects: { happy: 8, smarts: 1 }, scene: { anim: 'hug', fx: 'sparkle', npcAnim: { mother: 'hug', father: 'nod' } }, tone: 'good' }; }
        return { text: 'Bố gạt phăng: “Bàn nữa là bố không đóng học phí!” Cuộc nói chuyện kết thúc bằng tiếng cửa đóng sầm.', effects: { happy: -6, rel: { mother: -6, father: -10 } }, scene: { anim: 'cry', fx: 'anger', npcAnim: { father: 'angry' } }, tone: 'bad' };
      } },
      { label: 'Cãi lại: “Đời con, con tự quyết!”', fn: () => { S.flags.parentRebel = S.year; return { text: 'Câu nói làm cả nhà chết lặng. Bố đứng phắt dậy: “Được, để xem mày tự quyết thế nào!” Từ hôm đó, bố mẹ coi như không có đứa con này — trừ khi bạn đỗ đúng ngành họ muốn.', effects: { happy: 2, rel: { mother: -15, father: -20 } }, scene: { anim: 'angry', fx: 'anger', npcAnim: { father: 'angry', mother: 'cry' } }, tone: 'bad' }; } },
    ] });
  ms({ id: 'ms_reconcile', title: 'Cuộc gọi sau nhiều năm', icon: '📞', age: [18, 99],
    text: 'Đã mấy năm kể từ ngày bố mẹ từ mặt. Tối nay điện thoại hiện số nhà cũ. Giọng mẹ run run: “Bố con dạo này yếu lắm… con có về được không?”',
    scene: { loc: 'home', time: 'night', anim: 'phone', fx: 'tears' },
    choices: [
      { label: 'Về nhà, làm lành với bố mẹ', fn: () => { delete S.flags.disowned; ['mother', 'father'].forEach((r) => alive(r).forEach((x) => (x.relation = Math.max(x.relation, 45)))); return { text: 'Bạn về đến cổng thì bố đã đứng chờ, tóc bạc trắng. Không ai nói lời xin lỗi, nhưng bữa cơm tối hôm ấy ai cũng gắp thức ăn cho nhau.', effects: { happy: 12, karma: 5 }, scene: { anim: 'hug', fx: 'hearts' }, tone: 'good' }; } },
      { label: 'Chưa sẵn sàng tha thứ', fn: () => ({ text: 'Bạn im lặng hồi lâu rồi nói “Con bận lắm”. Đầu dây bên kia chỉ còn tiếng thở dài. Bạn ngồi bất động rất lâu sau khi cúp máy.', effects: { happy: -5 }, scene: { anim: 'sad', fx: 'tears' } }) },
    ] });  // ---- bệnh bỏ mặc: mỗi lần tái phát, người chơi chọn chữa hay tiếp tục lờ đi
  function symIll() { return S && S.illnesses.find((i) => i.id === S.symIll && !i.hidden); }
  function symTreat() {
    const i = symIll(); if (!i) return { text: 'Bệnh đã thuyên giảm từ lúc nào không hay.', effects: {} };
    const deltas = {}; const r = treatIllness(i, deltas);
    return { text: r.text, effects: { log: 'Đi viện điều trị: ' + r.text }, scene: { loc: 'hospital', anim: r.ok ? 'cheer' : 'sit', fx: r.ok ? 'sparkle' : 'sweat' }, tone: r.ok ? 'good' : 'neutral' };
  }
  ms({ id: 'ms_symptom', title: 'Bệnh cũ hành hạ', icon: '🤒', age: [0, 120],
    text: 'Đã {ill.years} năm bạn bỏ mặc {ill}. Dạo này {ill.sym}. Bác sĩ từng cảnh báo: để lâu có thể biến chứng thành {ill.next}.',
    scene: { loc: 'home', time: 'night', anim: 'sick', expr: 'sick', fx: 'sweat', shot: 'close' },
    choices: [
      { label: '🏥 Vào viện điều trị dứt điểm ({ill.cost})', fn: symTreat },
      { label: '💊 Ra hiệu thuốc mua thuốc uống tạm', fn: () => { const i = symIll(); if (i) { i.selfMed = S.year; i.drain = Math.max(2, Math.round(i.drain * 0.9)); } return { text: 'Cô dược sĩ bán cho vỉ thuốc giảm đau. Đỡ được vài hôm, nhưng bệnh vẫn nằm đó chờ dịp.', effects: { money: isKid() ? 0 : -200000, happy: 1 }, scene: { loc: 'street', anim: 'walk', fx: 'question' } }; } },
      { label: '😶 Kệ đi, chắc tự khỏi', fn: () => ({ text: 'Bạn nghiến răng chịu đựng, tự nhủ “chắc tại thời tiết”. Bệnh không biết nói, nhưng nó không quên.', effects: { happy: -2, health: -1 }, scene: { anim: 'shrug', fx: 'sweat' }, tone: 'bad' }) },
      { label: '🌿 Uống thuốc nam theo lời mách', fn: () => {
        const i = symIll(), r = Math.random();
        if (i && r < 0.3) { i.drain = Math.max(2, Math.round(i.drain * 0.8)); return { text: 'Mấy thang thuốc nam đắng nghét làm bạn thấy dễ chịu hơn. Có điều, “dễ chịu” chưa phải là “khỏi”.', effects: { money: -500000, happy: 2 }, scene: { anim: 'drink', fx: 'steam' } }; }
        if (i && r < 0.55) { i.since = Math.min(i.since, (i.care ?? i.since)); i.care = (i.care ?? S.year) - 1; return { text: 'Thuốc không rõ nguồn gốc làm bạn nổi mẩn, nôn thốc nôn tháo. Bệnh cũ chưa đi, bệnh mới đã tới.', effects: { money: -500000, health: -5, happy: -3 }, scene: { anim: 'sick', fx: 'sick' }, tone: 'bad' }; }
        return { text: 'Uống hết ba túi lá, chẳng thấy đỡ mà cũng chẳng thấy nặng thêm. Tiền thì đã mất.', effects: { money: -500000 }, scene: { anim: 'shrug', fx: 'question' } };
      } },
    ] });
  ms({ id: 'ms_sym_incurable', title: 'Căn bệnh không thể chữa khỏi', icon: '🩺', age: [0, 120],
    text: '{ill} không thể chữa khỏi. Đã {ill.years} năm bạn bỏ điều trị duy trì và dạo này {ill.sym}. Bác sĩ nói thẳng: bỏ thuốc thêm nữa thì bệnh sẽ nặng rất nhanh.',
    scene: { loc: 'home', time: 'night', anim: 'sick', expr: 'sick', fx: 'sweat', shot: 'close' },
    choices: [
      { label: '🏥 Quay lại điều trị duy trì ({ill.cost}/năm)', fn: symTreat },
      { label: '🙏 Chấp nhận, sống vui những ngày còn lại', fn: () => ({ text: 'Bạn thôi chạy chữa, dành thời gian cho những người thương. Đau thì vẫn đau, nhưng lòng thì nhẹ.', effects: { happy: 4, karma: 2, health: -4, rel: { all: 4 } }, scene: { loc: 'park', anim: 'sit', fx: 'petals' } }) },
      { label: '😶 Bỏ thuốc vì tốn kém quá', fn: () => ({ text: 'Bạn cất đơn thuốc vào ngăn kéo. Tiết kiệm được ít tiền, nhưng mỗi sáng thức dậy lại thấy người nặng thêm một chút.', effects: { health: -5, happy: -3 }, scene: { anim: 'sad', fx: 'sweat' }, tone: 'bad' }) },
    ] });
  // ---- giải nghệ (vận động viên, người mẫu)
  function retireTo(id, lv, model) {
    if (!model) S.flags.ex_athlete = S.flags.ex_athlete || S.year;
    if (id) { hire(id); if (lv) S.job.level = Math.min(lv, D.CAREERS[id].levels.length - 1); } else S.job = null;
  }
  ms({ id: 'ms_athlete_retire', title: 'Đến lúc giải nghệ', icon: '🏁', age: [25, 50],
    text: 'Cơ thể không còn nghe lời như trước: những pha bứt tốc chậm đi, chấn thương lâu lành hơn. Ban huấn luyện mời bạn nói chuyện về trận đấu chia tay. Sau tiếng còi cuối cùng, bạn sẽ làm gì?',
    scene: { loc: 'park', time: 'dusk', anim: 'think', fx: 'petals', npcs: [{ role: 'boss', anim: 'talk', say: 'Cả đội muốn tri ân em một trận thật đẹp.' }, { role: 'crowd', anim: 'clap' }] },
    choices: [
      { label: '📋 Ở lại làm huấn luyện viên', fn: () => { retireTo('hlv'); return { text: 'Bạn khoác áo huấn luyện viên, đứng bên đường biên chỉ đạo lứa đàn em. Hóa ra dạy người khác thắng cũng sướng chẳng kém tự mình ghi bàn.', effects: { happy: 8 }, scene: { anim: 'point', fx: 'sparkle', npcAnim: { crowd: 'cheer' } }, tone: 'milestone' }; } },
      { label: '🎙️ Làm bình luận viên thể thao', fn: () => { retireTo('nhabao', 1); return { text: 'Nhà đài mời bạn ngồi ghế bình luận. Giọng bạn vang lên trong mọi trận cầu lớn, khán giả quen đến mức nghe là nhận ra.', effects: { happy: 7, looks: 2 }, scene: { loc: 'office', anim: 'talk', fx: 'music' }, tone: 'milestone' }; } },
      { label: '🏪 Mở cửa hàng đồ thể thao (300 triệu)', req: { minMoney: 300000000 }, fn: () => { retireTo('kinhdoanh'); return { text: 'Bạn mở cửa hàng đồ thể thao mang tên mình. Người hâm mộ kéo đến chụp ảnh, mua giày, xin chữ ký.', effects: { money: -300000000, happy: 6 }, scene: { loc: 'market', anim: 'cheer', fx: 'money' }, tone: 'milestone' }; } },
      { label: '📱 Treo giày, làm KOL / streamer thể thao toàn thời gian', fn: () => { retireTo(null); S.flags.kolFull = true; if (S.social) S.social.followers += 3000 + Math.round((S.social.followers || 0) * 0.1); return { text: 'Bạn mở kênh riêng: hậu trường phòng thay đồ, bình luận trận đấu, dạy kỹ thuật cho trẻ con. Fan cũ kéo sang theo dõi đông nghịt. Từ nay mạng xã hội là “sân cỏ” mới của bạn.', effects: { happy: 6 }, scene: { loc: 'bedroom', anim: 'phone', fx: 'sparkle' } }; } },
      { label: '💪 Chưa! Tôi còn đá thêm một mùa nữa', fn: () => { const c = S.job && D.CAREERS[S.job.id]; if (!c) return { text: 'Bạn đã rời sân rồi.' }; S.job.perf = r100(S.job.perf - 8); return { text: 'Bạn xin ban huấn luyện thêm một mùa. Tập gấp đôi, ăn kiêng khắt khe hơn. Ai cũng nể ý chí ấy — nhưng cơ thể sẽ nhắc bạn mỗi sáng thức dậy. (Năm sau sẽ được hỏi lại.)', effects: { happy: 3, health: -3 }, scene: { loc: 'gym', anim: 'lift', fx: 'sparkle' } }; } },
      { label: '🌅 Nghỉ hẳn, sống cho gia đình', fn: () => { retireTo(null); return { text: 'Bạn treo giày sau trận chia tay đầy nước mắt. Sáng mai không còn tập lúc 5 giờ — bạn ngủ một giấc thật dài.', effects: { happy: 5, health: 3 }, scene: { anim: 'wave', fx: 'tears', npcAnim: { crowd: 'clap' } }, tone: 'milestone' }; } },
    ] });
  // 🚪 tự nghỉ việc / giải nghệ: chọn lý do và bước tiếp theo
  ms({ id: 'ms_quit', title: 'Nghỉ việc?', icon: '🚪', age: [15, 120],
    text: 'Bạn đang tính chuyện nghỉ công việc hiện tại. Nghỉ rồi thì làm gì tiếp đây?',
    scene: { loc: 'office', anim: 'think', fx: 'question' },
    choicesFn: () => { const k = ['rest']; if (S.social && S.social.followers >= 10000) k.unshift('kol'); if (S.job && D.CAREERS[S.job.id].sport) k.push('coach'); k.push('stay'); return k.map(quitChoice); }, choiceByKey: quitChoice });
  function quitChoice(k) {
    const c = S.job && D.CAREERS[S.job.id], sport = !!(c && c.sport), tl = c ? c.title.toLowerCase() : 'công việc cũ';
    const leave = () => { if (sport) S.flags.ex_athlete = S.flags.ex_athlete || S.year; S.job = null; };
    if (k === 'kol') return { key: k, label: '📱 Nghỉ để làm KOL / streamer toàn thời gian (' + (S.social ? fmtF(S.social.followers) : 0) + ' theo dõi)', fn: () => { if (!S.job) return { text: 'Bạn đã nghỉ rồi.' }; leave(); S.flags.kolFull = true; S.social.followers += Math.round(S.social.followers * 0.08); return { text: 'Bạn ' + (sport ? 'tuyên bố giải nghệ' : 'nộp đơn nghỉ ' + tl) + ' ngay trên livestream: “Từ hôm nay, mạng xã hội là công việc chính của mình!” Video thông báo lên xu hướng. Làm KOL toàn thời gian: được đăng nhiều bài hơn mỗi năm và tiền quảng cáo tăng 60% — nhưng không còn lương cứng.', effects: { happy: 6 }, scene: { loc: 'bedroom', anim: 'phone', fx: 'sparkle' }, tone: 'good' }; } };
    if (k === 'coach') return { key: k, label: '📋 Giải nghệ, chuyển sang làm huấn luyện viên', fn: () => { if (!S.job) return { text: 'Bạn đã nghỉ rồi.' }; retireTo('hlv'); return { text: 'Bạn treo giày và nhận lời dẫn dắt đội trẻ. Tiếng còi tập vẫn vang lên mỗi sáng — chỉ là giờ bạn đứng bên đường biên.', effects: { happy: 5 }, scene: { loc: 'stadium', anim: 'talk', fx: 'sparkle' }, tone: 'good' }; } };
    if (k === 'rest') return { key: k, label: sport ? '🌅 Giải nghệ, nghỉ ngơi một thời gian' : '🌅 Nghỉ việc, nghỉ ngơi rồi tính tiếp', fn: () => { if (!S.job) return { text: 'Bạn đã nghỉ rồi.' }; leave(); return { text: sport ? 'Bạn tổ chức trận chia tay, cởi áo đấu tặng cổ động viên rồi treo giày. Sáng mai không còn tập lúc 5 giờ.' : 'Bạn nộp đơn nghỉ ' + tl + '. Đồng nghiệp làm bữa chia tay nho nhỏ. Tự do, nhưng cũng hơi chênh vênh.', effects: { happy: 4, health: 2 }, scene: { loc: sport ? 'stadium' : 'street', anim: 'wave' }, tone: 'neutral' }; } };
    return { key: 'stay', label: '↩️ Thôi, chưa nghỉ nữa', fn: () => ({ text: 'Bạn đóng file đơn xin nghỉ lại. Cứ làm thêm một thời gian nữa xem sao.', effects: {}, scene: { anim: 'shrug' }, tone: 'neutral' }) };
  }
  // ⚠️ hiệu suất quá thấp: cảnh cáo trước một năm rồi mới cho thôi việc
  ms({ id: 'ms_job_warn', title: 'Bị cảnh cáo', icon: '⚠️', age: [15, 120],
    text: 'Sếp gọi bạn vào phòng, đặt bản đánh giá lên bàn: “Hiệu suất của em đang rất thấp. Nếu năm sau không cải thiện, công ty sẽ phải cho em nghỉ.”',
    scene: { loc: 'office', anim: 'scared', expr: 'scared', npcs: [{ role: 'boss', anim: 'point', say: 'Năm sau là cơ hội cuối.' }], shot: 'dramatic' },
    choices: [
      { label: '💪 Hứa sẽ cố gắng gấp đôi', fn: () => { if (S.job) S.job.perf = r100(S.job.perf + 14); return { text: 'Bạn đi làm sớm nhất, về muộn nhất. Hiệu suất nhích lên rõ rệt. (Nhớ dùng nút “Làm việc chăm chỉ” để giữ phong độ.)', effects: { happy: -2, health: -2 }, scene: { loc: 'office', anim: 'type' } }; } },
      { label: '🚪 Tự nộp đơn nghỉ trước cho đẹp', fn: () => { if (S.job) { if (D.CAREERS[S.job.id].sport) S.flags.ex_athlete = S.flags.ex_athlete || S.year; S.job = null; } S.flags.perfWarn = 0; return { text: 'Bạn chủ động xin nghỉ, giữ được hồ sơ sạch đẹp. Sếp bắt tay: “Chúc em tìm được chỗ phù hợp hơn.”', effects: { happy: 1 }, scene: { loc: 'street', anim: 'shrug' } }; } },
      { label: '😶 Im lặng, làm tiếp như cũ', fn: () => ({ text: 'Bạn gật đầu cho qua. Năm sau mà vẫn thế thì…', effects: { happy: -3 }, scene: { loc: 'office', anim: 'sad' } }) },
    ] });
  ms({ id: 'ms_model_retire', title: 'Rời sàn diễn', icon: '👠', age: [30, 60],
    text: 'Những show diễn lớn bắt đầu gọi các gương mặt trẻ hơn. Công ty quản lý ngỏ ý kết thúc hợp đồng một cách êm đẹp. Bước tiếp theo của bạn là gì?',
    scene: { loc: 'wedding', time: 'night', anim: 'think', fx: 'sparkle', npcs: [{ role: 'boss', anim: 'talk', say: 'Em đã có một thập kỷ rực rỡ.' }] },
    choices: [
      { label: '🎬 Chuyển sang đóng phim', fn: () => { retireTo('dienvien', 1, true); return { text: 'Đạo diễn quen mời bạn một vai phụ. Ống kính điện ảnh hóa ra cũng thương bạn như ống kính thời trang.', effects: { happy: 6 }, scene: { loc: 'street', anim: 'cheer', fx: 'flash' }, tone: 'milestone' }; } },
      { label: '🏢 Mở học viện người mẫu (300 triệu)', req: { minMoney: 300000000 }, fn: () => { retireTo('kinhdoanh', 0, true); return { text: 'Bạn mở học viện đào tạo người mẫu. Lứa học trò đầu tiên bước lên sàn diễn, bạn đứng cánh gà mà rưng rưng.', effects: { money: -300000000, happy: 7 }, scene: { anim: 'clap', fx: 'sparkle' }, tone: 'milestone' }; } },
      { label: '🌅 Nghỉ ngơi, sống chậm lại', fn: () => { retireTo(null, 0, true); return { text: 'Bạn tẩy trang lần cuối ở hậu trường. Không còn ăn kiêng, không còn giày cao gót — chỉ còn bát phở nóng lúc 7 giờ sáng.', effects: { happy: 6 }, scene: { loc: 'home', anim: 'eat', fx: 'steam' }, tone: 'milestone' }; } },
    ] });
  function retire() {
    if (!S.job) return;
    S.pension = Math.round(monthly() * 0.45); S.job = null; S.retired = true; unlock('retire');
  }
  // hệ số theo độ khó đã chọn khi tạo nhân vật
  function dif(k) { const d = D.DIFFICULTY && (D.DIFFICULTY.find((x) => x.id === (S && S.diff)) || D.DIFFICULTY[1]); return d ? d[k] : k === 'exam' ? 0 : 1; }
  function monthly() { if (!S.job) return 0; const c = D.CAREERS[S.job.id]; return Math.round(c.levels[S.job.level].salary * (S.job.mult || 1) * (S.abroad ? 2.3 : 1) * dif('inc') * (1 + repTier(repN()) * 0.06)); }

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
    if (def.live) inst.live = true; // đang livestream → giao diện bật khung bình luận trực tiếp
    if (def.many || inst.choices.length > 4) inst.many = true;
    delete inst.defs;
    return inst;
  }
  const MODERN_RE = /(điện thoại|smartphone|facebook|tiktok|zalo|mạng xã hội|livestream|\bapp\b|ứng dụng|grab|shopee|online|internet|wifi|laptop|nhắn tin|tin nhắn|crypto|coin|youtube|instagram|kol|streamer|selfie|email|google|camera|chụp màn hình|viral|trend|hot girl|bóc phốt|antifan|story)/i;
  const MODERN = new Map();
  function modernEv(def) {
    if (def.minYear || (def.req && def.req.minYear) || def.internal) return false;
    if (!MODERN.has(def.id)) { let s = ''; try { s = JSON.stringify([def.title, def.text, (def.choices || []).map((c) => [c.label, c.text, (c.outcomes || []).map((o) => o.text)])]); } catch (e) { /* */ } MODERN.set(def.id, MODERN_RE.test(s)); }
    return MODERN.get(def.id);
  }
  function eligible(def, age) {
    if (!def || !def.age || def.chainOnly || age < def.age[0] || age > def.age[1]) return false;
    if (HAZ_EVENTS.has(def.id)) return false;
    // sinh ở thời xưa: chưa có điện thoại thông minh, mạng xã hội, ứng dụng…
    if (S.year < 2009 && modernEv(def)) return false;
    // đang ngồi tù: chỉ còn những chuyện trong trại giam
    if (S.jail && !(def.req && def.req.jail)) return false;
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
    if (pa <= 2) {
      // em bé: mỗi năm một khung cảnh khác cho đỡ chán (ở nhà, phòng ngủ, công viên, quê ngoại, chợ, biển, chùa)
      loc = wt([['home', 3], ['bedroom', 1.2], ['park', 1.5], ['countryside', 1.2], ['market', 0.8], ['beach', 0.7], ['temple', 0.5]]);
      anim = loc === 'bedroom' ? pk(['sleep', 'crawl', 'laugh']) : loc === 'home' ? pk(['crawl', 'laugh', 'crawl', 'sleep']) : pk(['laugh', 'idle', 'crawl']);
      add('mother'); add(loc === 'countryside' || loc === 'temple' ? 'grandparent' : 'father'); if (loc === 'home' || loc === 'park') add('pet');
      if (loc === 'bedroom') time = pk(['night', 'day']); else if (loc === 'market' || loc === 'temple') time = 'dawn'; else if (time === 'night') time = 'dusk';
    }
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
      stats: { happy: U.randi(60, 92), health: U.randi(45, 100), smarts: U.randi(12, 95), looks: U.randi(12, 95) }, karma: 50, money: 0,
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
    // sống chung một nhà (online): cả phòng là anh chị em ruột — cùng họ, cùng quê, cùng năm sinh, cùng bố mẹ
    const fam = opts.family && typeof opts.family === 'object' ? opts.family : null;
    const scn = opts.scenario ? SCENARIOS.find((x) => x.id === opts.scenario) : null;
    if (scn) { opts.born = scn.born; if (scn.city) opts.city = scn.city; }
    if (fam) { if (fam.lastName) opts.lastName = fam.lastName; if (fam.city) opts.city = fam.city; if (fam.born) opts.born = fam.born; }
    const gender = opts.gender === 'f' || opts.gender === 'm' ? opts.gender : U.pick(['m', 'f']);
    const nm = D.randomName(gender, opts.lastName);
    const city = D.CITIES.some((c) => c.id === opts.city) ? opts.city : U.pick(D.CITIES).id;
    const born = U.clamp(Math.round(+opts.born || 2026), 1940, 2026);
    S = baseState(1, born, city);
    S.dyn = U.uid('d'); S.heirlooms = [];
    meta.totalLives = (meta.totalLives || 0) + 1;
    const app = Object.assign(D.randomAppearance(gender, 20), opts.appearance || {});
    S.player = { id: 'player', role: 'player', firstName: opts.firstName || nm.firstName, middleName: opts.middleName ?? nm.middleName, lastName: opts.lastName || nm.lastName, gender, age: 0, alive: true, appearance: app, kind: 'human' };
    const fAge = fam && fam.father ? fam.father.age : U.randi(24, 38), mAge = fam && fam.mother ? fam.mother.age : U.clamp(fAge - U.randi(-2, 6), 21, 40);
    const father = newPerson('father', 'm', fAge, Object.assign({ lastName: S.player.lastName, relation: U.randi(70, 92) }, fam && fam.father && fam.father.firstName ? { firstName: fam.father.firstName, middleName: fam.father.middleName } : {}));
    father.appearance.skin = U.mixHex(app.skin, father.appearance.skin, 0.35); father.appearance.hair = app.hair;
    const mother = newPerson('mother', 'f', mAge, Object.assign({ relation: U.randi(75, 96) }, fam && fam.mother && fam.mother.firstName ? { firstName: fam.mother.firstName, middleName: fam.mother.middleName } : {}));
    S.fam = fam ? { host: !!opts.familyHost } : null;
    if (opts.clanLevel) S.flags.clanLevel = U.clamp(+opts.clanLevel, 0, 4);
    mother.appearance.skin = U.mixHex(app.skin, mother.appearance.skin, 0.3);
    S.people.push(mother, father);
    if (Math.random() < 0.75) { const g = U.pick(['m', 'f']); S.people.push(newPerson('grandparent', g, U.randi(55, 72), { lastName: g === 'm' ? S.player.lastName : undefined, relation: U.randi(70, 95) })); }
    if (Math.random() < 0.35) { const g = g2(); S.people.push(newPerson('grandparent', g, U.randi(58, 75), { relation: U.randi(65, 90) })); }
    if (!fam && Math.random() < 0.38) S.people.push(newPerson('sibling', U.pick(['m', 'f']), U.randi(2, 8), { lastName: S.player.lastName, parents: [mother.appearance, father.appearance], relation: U.randi(55, 85) }));
    if (Math.random() < 0.2) { const pet = newPet(); pet.age = U.randi(1, 4); S.people.push(pet); }
    S.goals = pickGoals(opts.goals);
    S.lifestyle = 'binhthuong';
    S.diff = D.DIFFICULTY && D.DIFFICULTY.some((x) => x.id === opts.diff) ? opts.diff : 'thuong';
    applyPerks(opts.perks);
    S.parenting = S.flags.perk_emam ? 'danchu' : U.weighted(D.PARENTING, (x) => x.w).id;
    S.orientation = ['straight', 'gay', 'bi'].includes(opts.orientation) ? opts.orientation : U.weighted([['straight', 90], ['gay', 5], ['bi', 5]], (x) => x[1])[0];
    clampStartStats();
    if (opts.rebirth && opts.rebirth.tier) applyRebirth(opts.rebirth);
    // 17. định mệnh ngày sinh: cung hoàng đạo + can chi → chỉ số khởi đầu & lời “phán”
    if (opts.birthday && opts.birthday.d && opts.birthday.m) { const dn = destiny(+opts.birthday.d, +opts.birthday.m, born); S.destiny = dn; Object.keys(dn.eff).forEach((k) => { if (k === 'karma') S.karma = r100(S.karma + dn.eff[k]); else S.stats[k] = r100(S.stats[k] + dn.eff[k]); }); addLog('🔮 Lá số: ' + dn.zodiac.icon + ' ' + dn.zodiac.name + ' · tuổi ' + dn.canchi + ' ' + dn.animal + '. ' + dn.text, 'milestone', '🔮'); }
    // 18. “cùng xuất phát”: nhận lời thách đấu → chép y nguyên chỉ số khởi đầu của bạn bè
    if (opts.same && typeof opts.same === 'object') { const c = opts.same; if (c.st) Object.keys(S.stats).forEach((k) => { if (typeof c.st[k] === 'number') S.stats[k] = r100(c.st[k]); }); if (typeof c.k === 'number') S.karma = r100(c.k); if (c.par && D.PARENTING.some((x) => x.id === c.par)) S.parenting = c.par; if (typeof c.mo === 'number') S.money = U.clamp(c.mo, -1e9, 1e12); S.dare = { from: String(c.from || '').slice(0, 30), score: +c.score || 0, age: +c.age || 0, rank: String(c.rank || '').slice(0, 24) }; addLog('⚔️ Thách đấu cùng xuất phát với ' + (S.dare.from || 'bạn bè') + ': cùng tên, cùng quê, cùng năm sinh, cùng chỉ số. Đời người ta đạt ' + S.dare.score + ' điểm — đến lượt bạn!', 'milestone', '⚔️'); }
    S.startCfg = { g: gender, fn: S.player.firstName, mn: S.player.middleName, ln: S.player.lastName, c: city, b: born, ap: app, st: Object.assign({}, S.stats), k: S.karma, d: S.diff, pk: (opts.perks || []).slice(0, 4), o: S.orientation, par: S.parenting, mo: S.money, bd: opts.birthday || null };
    if (scn) { S.scn = { id: scn.id }; try { scn.init(); } catch (e) { /* */ } addLog('🎬 Kịch bản: ' + scn.name + ' — mục tiêu: ' + scn.goal + '.', 'milestone', scn.icon); }
    const when = U.pick(['sáng mùa xuân', 'chiều mưa phùn', 'đêm trăng rằm', 'trưa hè oi ả', 'sớm mùa thu se lạnh']);
    const era = born < 2026 ? ' năm ' + born + (eraOf(born).born ? ' — ' + eraOf(born).born : '') : '';
    const text = 'Bạn chào đời vào một ' + when + era + ' tại ' + D.cityName(city) + '. Bố ' + fullName(father) + ' và mẹ ' + fullName(mother) + ' rơm rớm nước mắt hạnh phúc. Một cuộc đời mới bắt đầu — một trong tám tỷ, nhưng là duy nhất.';
    addLog('Bạn chào đời tại ' + D.cityName(city) + '. Bố ' + father.firstName + ', mẹ ' + mother.firstName + '.', 'milestone', '👶');
    const scene = sceneFor('hospital', { anim: 'sleep', fx: 'sparkle', time: 'day', shot: 'close', people: [{ p: mother, anim: 'love', say: 'Con của mẹ đây rồi…' }, { p: father, anim: 'cheer', say: 'Chào con trai… à, con yêu!'.replace('con trai… à, ', gender === 'f' ? 'con gái… à, ' : 'con trai… à, ') }].concat(alive('grandparent').slice(0, 1).map((p) => ({ p, anim: 'clap' }))) });
    if (scene.npcs[1]) scene.npcs[1].say = gender === 'f' ? 'Công chúa của bố!' : 'Hoàng tử của bố!';
    checkProgress(); changed();
    return result({ title: 'Chào đời', icon: '👶', text, tone: 'milestone', scene });
    function g2() { return U.pick(['m', 'f']); }
  }

  // ------------------------------------------------------------------ định mệnh ngày sinh (tử vi vui, không mê tín 😄)
  const ZODIAC = [
    { name: 'Ma Kết', icon: '♑', from: [12, 22], el: 'dat' }, { name: 'Bảo Bình', icon: '♒', from: [1, 20], el: 'khi' }, { name: 'Song Ngư', icon: '♓', from: [2, 19], el: 'nuoc' },
    { name: 'Bạch Dương', icon: '♈', from: [3, 21], el: 'lua' }, { name: 'Kim Ngưu', icon: '♉', from: [4, 20], el: 'dat' }, { name: 'Song Tử', icon: '♊', from: [5, 21], el: 'khi' },
    { name: 'Cự Giải', icon: '♋', from: [6, 21], el: 'nuoc' }, { name: 'Sư Tử', icon: '♌', from: [7, 23], el: 'lua' }, { name: 'Xử Nữ', icon: '♍', from: [8, 23], el: 'dat' },
    { name: 'Thiên Bình', icon: '♎', from: [9, 23], el: 'khi' }, { name: 'Bọ Cạp', icon: '♏', from: [10, 23], el: 'nuoc' }, { name: 'Nhân Mã', icon: '♐', from: [11, 22], el: 'lua' },
  ];
  const ELEM = { lua: { name: 'Lửa', eff: { health: 4, happy: 2 } }, dat: { name: 'Đất', eff: { smarts: 3, karma: 2 } }, khi: { name: 'Khí', eff: { looks: 3, happy: 2 } }, nuoc: { name: 'Nước', eff: { karma: 3, happy: 1, looks: 1 } } };
  const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
  const CHI = [['Thân', '🐒'], ['Dậu', '🐓'], ['Tuất', '🐕'], ['Hợi', '🐖'], ['Tý', '🐀'], ['Sửu', '🐃'], ['Dần', '🐅'], ['Mão', '🐈'], ['Thìn', '🐉'], ['Tỵ', '🐍'], ['Ngọ', '🐎'], ['Mùi', '🐐']];
  const FORTUNE = ['Tiền vận vất vả, hậu vận an nhàn, càng về già càng có phúc.', 'Đường tình duyên lận đận, nhưng đến muộn thì bền.', 'Có số làm chủ, không hợp đi làm thuê lâu dài.', 'Quý nhân phù trợ, gặp nạn hoá lành.', 'Tài lộc đến từ tay nghề, càng chăm càng giàu.', 'Số xuất ngoại, đi càng xa càng gặp may.', 'Miệng lưỡi khéo léo, hợp nghề buôn bán, nói chuyện.', 'Tính tình thẳng thắn, dễ mất lòng nhưng được tin tưởng.', 'Con cái hiếu thảo, tuổi già được nhờ con.', 'Nóng vội dễ hỏng việc, chậm mà chắc thì thành.', 'Có duyên với nghệ thuật, dễ nổi tiếng nếu dám thử.', 'Phải tự lực cánh sinh, nhưng tay trắng làm nên.'];
  function destiny(d, m, year) {
    d = U.clamp(Math.round(d) || 1, 1, 31); m = U.clamp(Math.round(m) || 1, 1, 12);
    // cung = cung bắt đầu trong tháng này nếu đã qua ngày bắt đầu, ngược lại là cung của tháng trước
    const idx = ZODIAC.findIndex((x) => x.from[0] === m), cur = ZODIAC[idx], prev = ZODIAC[(idx + 11) % 12];
    const z = d >= cur.from[1] ? cur : prev;
    const can = CAN[((year % 10) + 10) % 10], chi = CHI[((year % 12) + 12) % 12], el = ELEM[z.el];
    const text = FORTUNE[(d * 7 + m * 13 + year) % FORTUNE.length];
    return { zodiac: { name: z.name, icon: z.icon }, element: el.name, canchi: can + ' ' + chi[0], animal: chi[1], text, eff: Object.assign({}, el.eff) };
  }
  function destinyPreview(d, m, year) { const x = destiny(d, m, year || 2026); return Object.assign(x, { effText: Object.keys(x.eff).map((k) => ({ health: 'Sức khỏe', happy: 'Hạnh phúc', smarts: 'Trí tuệ', looks: 'Ngoại hình', karma: 'Phúc đức' }[k] + ' +' + x.eff[k])).join(', ') }); }
  // skin trang phục: kiểm tra điều kiện mở khoá từ lịch sử các kiếp
  function skinsView() {
    const L = meta.lives || [], best = L.reduce((m, x) => Math.max(m, x.score || 0), meta.best || 0), ach = meta.achievements || {};
    const ok = (n) => !n || ((n.lives == null || L.length >= n.lives) && (!n.ach || !!ach[n.ach]) && (n.best == null || best >= n.best) && (n.karmaLife == null || L.some((x) => (x.karma || 0) >= n.karmaLife)) && (n.karmaLow == null || L.some((x) => x.karma != null && x.karma <= n.karmaLow)));
    return (D.SKINS || []).map((s) => ({ id: s.id, name: s.name, icon: s.icon, needText: s.needText, app: s.app, ok: ok(s.need) || (s.alt ? ok(s.alt) : false) }));
  }
  // thách đấu: mã chia sẻ khởi đầu + kết quả đời của mình
  function dareCode() {
    if (!S || !S.startCfg) return null;
    const info = S.dead ? deathInfo() : null;
    const c = Object.assign({}, S.startCfg, { from: fullName(P()), score: info ? info.score : 0, age: P().age, rank: info ? info.rank : '' });
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(c)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return null; }
  }
  function dareDecode(code) {
    try { const s = decodeURIComponent(escape(atob(String(code).replace(/-/g, '+').replace(/_/g, '/')))); const c = JSON.parse(s); return c && c.st ? c : null; } catch (e) { return null; }
  }
  function dareResult() { if (!S || !S.dare || !S.dead) return null; const info = deathInfo(); return { from: S.dare.from, theirScore: S.dare.score, theirAge: S.dare.age, theirRank: S.dare.rank, myScore: info.score, myAge: P().age, win: info.score > S.dare.score }; }

  // ------------------------------------------------------------------ thời đại: năm sinh quyết định bối cảnh
  const ERAS = [
    { from: 1940, to: 1954, name: 'Kháng chiến chống Pháp', born: 'giữa những năm kháng chiến' },
    { from: 1955, to: 1975, name: 'Chiến tranh, đất nước chia cắt', born: 'giữa thời chiến tranh' },
    { from: 1976, to: 1985, name: 'Thời bao cấp', born: 'thời bao cấp, tem phiếu' },
    { from: 1986, to: 1999, name: 'Thời Đổi Mới', born: 'những năm đầu Đổi Mới' },
    { from: 2000, to: 2009, name: 'Thời hội nhập', born: 'thời hội nhập' },
    { from: 2010, to: 2026, name: 'Thời mạng xã hội', born: '' },
    { from: 2027, to: 2049, name: 'Thời trí tuệ nhân tạo', born: 'thời trí tuệ nhân tạo' },
    { from: 2050, to: 9999, name: 'Tương lai xa', born: 'ở tương lai xa' },
  ];
  const eraOf = (y) => ERAS.find((e) => y >= e.from && y <= e.to) || ERAS[5];
  const ERA_MARKS = {
    1954: 'Chiến thắng Điện Biên Phủ “lừng lẫy năm châu, chấn động địa cầu”. Cả làng đốt đuốc mừng chiến thắng.',
    1965: 'Máy bay Mỹ bắt đầu ném bom miền Bắc. Nhà nhà đào hầm trú ẩn, trường học sơ tán về nông thôn.',
    1972: 'Mười hai ngày đêm B-52 rải thảm Hà Nội. Tiếng còi báo động vang lên mỗi đêm.',
    1975: '30/4/1975: Đất nước thống nhất. Người người đổ ra đường, cờ hoa rợp trời.',
    1979: 'Chiến tranh biên giới phía Bắc nổ ra. Thanh niên khắp nơi lại lên đường nhập ngũ.',
    1986: 'Đại hội VI mở ra công cuộc Đổi Mới. Chợ búa, hàng quán tư nhân bắt đầu mọc lên.',
    1989: 'Bỏ tem phiếu, giá cả theo thị trường. Hàng hóa bắt đầu đầy ắp các sạp chợ.',
    1995: 'Việt Nam bình thường hóa quan hệ với Hoa Kỳ và gia nhập ASEAN.',
    1997: 'Internet chính thức vào Việt Nam. Quán “net” mở khắp các phố.',
    2003: 'SEA Games 22 tổ chức tại sân Mỹ Đình. Cả nước cổ vũ đến khản giọng.',
    2007: 'Việt Nam gia nhập WTO. Hàng ngoại tràn về, nhà máy mọc lên khắp nơi.',
    2008: 'Đội tuyển vô địch AFF Cup. Cả nước đổ ra đường “đi bão” đến sáng.',
    2010: 'Đại lễ 1000 năm Thăng Long – Hà Nội.',
    2018: 'U23 Việt Nam á quân châu Á, trận chung kết tuyết trắng Thường Châu.',
    2020: 'Đại dịch Covid-19: giãn cách, khẩu trang, học online.',
    2023: 'Trí tuệ nhân tạo bùng nổ, ai cũng nói chuyện với “chatbot”.',
    2035: 'Xe điện tự lái phủ kín phố, người trẻ không còn thi bằng lái.',
    2045: 'Việt Nam trở thành nước thu nhập cao, metro chạy khắp các thành phố lớn.',
    2060: 'Chuyến bay thương mại đầu tiên đưa khách du lịch lên sao Hỏa.',
  };
  // ------------------------------------------------------------------ World Cup: 4 năm một lần (đúng các năm thật)
  const WC_REAL = { 1958: 'Brazil', 1962: 'Brazil', 1966: 'Anh', 1970: 'Brazil', 1974: 'Tây Đức', 1978: 'Argentina', 1982: 'Ý', 1986: 'Argentina', 1990: 'Tây Đức', 1994: 'Brazil', 1998: 'Pháp', 2002: 'Brazil', 2006: 'Ý', 2010: 'Tây Ban Nha', 2014: 'Đức', 2018: 'Pháp', 2022: 'Argentina' };
  const WC_HOST = { 1958: 'Thụy Điển', 1962: 'Chile', 1966: 'Anh', 1970: 'Mexico', 1974: 'Tây Đức', 1978: 'Argentina', 1982: 'Tây Ban Nha', 1986: 'Mexico', 1990: 'Ý', 1994: 'Mỹ', 1998: 'Pháp', 2002: 'Hàn Quốc – Nhật Bản', 2006: 'Đức', 2010: 'Nam Phi', 2014: 'Brazil', 2018: 'Nga', 2022: 'Qatar', 2026: 'Mỹ – Canada – Mexico', 2030: 'Tây Ban Nha – Bồ Đào Nha – Morocco', 2034: 'Ả Rập Xê Út' };
  const WC_TEAMS = ['Brazil', 'Argentina', 'Pháp', 'Đức', 'Tây Ban Nha', 'Anh', 'Bồ Đào Nha', 'Hà Lan', 'Ý', 'Bỉ', 'Croatia', 'Uruguay', 'Morocco', 'Nhật Bản', 'Hàn Quốc', 'Mỹ', 'Mexico', 'Senegal'];
  const isWcYear = (y) => y >= 1950 && y % 4 === 2;
  function wcInfo(y) {
    // năm tương lai: chủ nhà & nhà vô địch được gieo theo năm để ai chơi cũng thấy giống nhau
    const r = U.seeded(y * 97 + 13);
    const FUT = ['Trung Quốc', 'Úc', 'Anh', 'Brazil', 'Ai Cập', 'Nhật Bản', 'Ấn Độ', 'Canada', 'Đức', 'Indonesia', 'Việt Nam – Thái Lan'];
    const host = WC_HOST[y] || FUT[Math.floor(r() * FUT.length)];
    // Việt Nam dự World Cup: chưa từng trước 2026, sau đó cơ hội tăng dần
    const vn = y >= 2030 && r() < U.clamp(0.12 + (y - 2030) * 0.012, 0, 0.55);
    const vnChamp = vn && y >= 2050 && r() < 0.08;
    const champ = vnChamp ? 'Việt Nam' : WC_REAL[y] || WC_TEAMS[Math.floor(r() * WC_TEAMS.length)];
    return { host, vn, champ };
  }
  function worldCupYear(L) {
    if (!isWcYear(S.year) || P().age < 5 || S.dead) return;
    const w = wcInfo(S.year);
    S.wc = { year: S.year, vn: w.vn, champ: w.champ, host: w.host, first: w.vn && !S.flags.wcVn };
    if (w.vn) S.flags.wcVn = (S.flags.wcVn || 0) + 1;
    if (!S.jail) queueMilestone('ms_worldcup');
    L('🏆 World Cup ' + S.year + ' tại ' + w.host + (w.vn ? ' — CÓ VIỆT NAM!' : '.') + ' ' + (w.champ === 'Việt Nam' ? '🇻🇳 VIỆT NAM VÔ ĐỊCH THẾ GIỚI!!! Cả nước không ai ngủ.' : w.champ + ' lên ngôi vô địch.'), w.vn ? 'milestone' : 'neutral', '🏆');
    if (w.champ === 'Việt Nam') addStat('happy', 15, {});
  }
  function wcChoice(k) {
    const w = S.wc || { year: S.year, champ: 'Brazil', vn: false }, pa = P().age;
    const player = S.job && S.job.id === 'cauthu' && S.job.level >= 3;
    if (k === 'play') { const p = U.clamp(0.3 + S.stats.health / 250, 0.25, 0.7); return { key: k, label: '⚽ Ra sân trận quyết định cùng tuyển Việt Nam', mini: 'penalty', odds: () => p, fn: () => { if (miniWin(p)) { S.flags.wcHero = S.year; return { text: 'Phút 89, bạn ghi bàn quyết định! Cả sân vận động ' + w.host + ' vỡ òa, quê nhà đốt pháo sáng khắp phố. Tên bạn thành huyền thoại.', effects: { happy: 20, money: 3000000000, followers: 1, perf: 20 }, scene: { loc: 'stadium', time: 'night', anim: 'cheer', fx: ['fireworks', 'confetti'] }, tone: 'milestone' }; } return { text: 'Cú sút của bạn dội cột dọc phút cuối. Việt Nam dừng bước, nhưng cả nước vẫn tự hào về các bạn.', effects: { happy: -6, money: 500000000, followers: 0.3 }, scene: { loc: 'stadium', time: 'night', anim: 'cry', fx: 'tears' } }; } }; }
    if (k === 'bao') return { key: k, label: '🇻🇳 Đổ ra đường đi bão cổ vũ Việt Nam', fn: () => ({ text: (w.champ === 'Việt Nam' ? 'Việt Nam VÔ ĐỊCH THẾ GIỚI' : w.first ? 'Việt Nam lần đầu đá World Cup' : 'Việt Nam lại góp mặt ở World Cup') + '! Bạn quấn cờ, vẽ mặt, hò hét cùng cả triệu người đến sáng. Khàn giọng cả tuần mà vẫn sướng.', effects: { happy: w.champ === 'Việt Nam' ? 18 : 12, health: -1 }, scene: { loc: 'street', time: 'night', anim: 'cheer', npcs: [{ role: 'crowd', anim: 'cheer' }, { role: 'friend', anim: 'jump' }], fx: ['fireworks', 'confetti'] } }) };
    if (k === 'xem') return { key: k, label: '📺 Thức trắng xem cùng hội bạn', fn: () => ({ text: 'Mì tôm, bia lạnh, hét khản cổ lúc 2 giờ sáng. Hôm sau đi ' + (pa < 18 ? 'học' : 'làm') + ' mắt thâm như gấu trúc, nhưng nhớ mãi mùa World Cup ' + w.year + '. ' + w.champ + ' vô địch!', effects: { happy: 7, health: -2 }, scene: { loc: 'home', time: 'night', anim: 'cheer', npcs: [{ role: 'friend', anim: 'cheer' }], fx: 'music' } }) };
    if (k === 'cado') return { key: k, label: '🎲 Cá độ đoán đội vô địch với hội bạn', req: { minMoney: 2000000 }, fn: () => { const team = U.pick(WC_TEAMS.slice(0, 8)); const win = team === w.champ || Math.random() < 0.12; return win ? { text: 'Bạn đặt cửa ' + team + ' và… trúng! Cả hội phải móc ví trả bạn. Hên thôi, đừng ghiền nhé.', effects: { money: 10000000, happy: 6, karma: -2 }, scene: { anim: 'cheer', fx: 'money' } } : { text: 'Bạn đặt cửa ' + team + '. ' + w.champ + ' mới là nhà vô địch. Mất tiền, lại bị cả hội trêu cả tháng.', effects: { money: -8000000, happy: -4, karma: -2 }, scene: { anim: 'facepalm' } }; } };
    if (k === 'quan') { const p = U.clamp(0.4 + S.stats.smarts / 300, 0.3, 0.8); return { key: k, label: '🍻 Mở quán chiếu bóng đá kiếm tiền', mini: 'cook', odds: () => p, req: { minMoney: 20000000 }, fn: () => miniWin(p) ? { text: 'Kê màn hình lớn, bán bia lạc rang cả tháng. Trận nào cũng kín chỗ, bạn lãi đậm.', effects: { money: 60000000, happy: 6, health: -2 }, scene: { loc: 'cafe', time: 'night', anim: 'cook', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'money' }, tone: 'good' } : { text: 'Quán vắng vì ai cũng xem ở nhà. Lỗ tiền thuê màn hình.', effects: { money: -15000000, happy: -3 }, scene: { loc: 'cafe', anim: 'sad' } } }; }
    return { key: 'ngu', label: '😴 Đi ngủ sớm, sáng đọc tin kết quả', fn: () => ({ text: 'Bạn ngủ ngon giữa tiếng hò hét của hàng xóm. Sáng ra mới biết ' + w.champ + ' vô địch.', effects: { health: 1 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }) };
  }
  ms({ id: 'ms_worldcup', title: 'Mùa World Cup', icon: '🏆', age: [5, 120],
    text: 'World Cup đã đến! Cả nước sống theo giờ bóng lăn: quán xá treo cờ, đâu đâu cũng bàn chuyện tỉ số, dân văn phòng ngáp ngắn ngáp dài mỗi sáng.',
    scene: { loc: 'street', time: 'night', anim: 'cheer', npcs: [{ role: 'friend', anim: 'cheer', say: 'Vàooooo!' }, { role: 'crowd', anim: 'cheer' }], fx: 'confetti' },
    choicesFn: () => { const w = S.wc || {}, pa = P().age, ks = []; if (S.job && S.job.id === 'cauthu' && S.job.level >= 3 && w.vn) ks.push('play'); if (w.vn) ks.push('bao'); ks.push('xem'); if (pa >= 18) ks.push('cado'); if (pa >= 20) ks.push('quan'); ks.push('ngu'); return ks.map(wcChoice); },
    choiceByKey: wcChoice });
  function eraYear(L) {
    worldCupYear(L);
    const m = ERA_MARKS[S.year]; if (m && P().age >= 3) L('📅 Năm ' + S.year + ': ' + m, 'milestone', '📅');
    scenarioYear(L);
    if (S.flags.past && P().age === 4 && !S.flags.pastAsked) { S.flags.pastAsked = S.year; queueMilestone('ms_tienkiep'); }
    if (S.flags.rebirthGift && P().age === 18 && !S.flags.rebirthGot) { S.flags.rebirthGot = S.year; addMoney(S.flags.rebirthGift, {}); L('💰 Tròn 18 tuổi, bố mẹ trao cho bạn ' + fmtMoney(S.flags.rebirthGift) + ' để lập nghiệp.', 'milestone', '💰'); }
    // dòng họ online: quỹ chung trao học bổng cho con cháu tròn 18 tuổi
    if (S.flags.clanLevel && P().age === 18 && !S.flags.clanGift) { const g = [0, 50e6, 300e6, 1e9, 5e9][S.flags.clanLevel] || 0; if (g) { S.flags.clanGift = S.year; addMoney(g, {}); S.karma = r100(S.karma + S.flags.clanLevel * 2); L('🏯 Quỹ dòng họ trao học bổng tuổi 18 cho bạn: ' + fmtMoney(g) + '.', 'milestone', '🏯'); } }
    // người thành đạt trong họ được mời đứng ra xây nhà thờ họ
    if (!S.flags.nhathoho && !S.jail && P().age >= 50 && P().age <= 85 && S.money >= 3e9 && (!S.flags.nhathoho_ask || S.year - S.flags.nhathoho_ask >= 10) && Math.random() < 0.15) { S.flags.nhathoho_ask = S.year; queueMilestone('ms_nhathoho'); }
  }

  // ------------------------------------------------------------------ công ty riêng
  const CO_LV = [['Hộ kinh doanh', 0, 4], ['Công ty nhỏ', 4e9, 20], ['Công ty vừa', 25e9, 90], ['Doanh nghiệp lớn', 150e9, 450], ['Tập đoàn', 1e12, 3000], ['Tập đoàn niêm yết', Infinity, 15000]];
  const coInd = (id) => D.INDUSTRIES.find((x) => x.id === id);
  function companyView() {
    const c = S && S.company; if (!c) return null; const ind = coInd(c.ind);
    return { name: c.name, icon: ind.icon, ind: ind.name, level: CO_LV[c.lv][0], staff: c.staff, valueText: fmtMoney(c.val), ownText: Math.round(c.own * 100) + '%', stakeText: fmtMoney(c.val * c.own), profitText: fmtMoney(c.lastProfit || 0), profit: c.lastProfit || 0, years: S.year - c.founded, listed: c.listed };
  }
  function companyOptions() {
    if (!S) return [];
    return D.INDUSTRIES.filter((ind) => !ind.career || (S.job && ind.career.includes(S.job.id))).map((ind) => {
      let reason = null;
      if (S.company) reason = 'Bạn đã có công ty';
      else if (P().age < 20) reason = 'Từ 20 tuổi';
      else if (S.jail) reason = 'Đang ngồi tù';
      else if (S.year < ind.since) reason = 'Ngành này chưa có (từ khoảng ' + ind.since + ')';
      else if (ind.smarts && S.stats.smarts < ind.smarts) reason = 'Cần trí tuệ ≥ ' + ind.smarts;
      else if (ind.career && !(S.job && ind.career.includes(S.job.id))) reason = 'Dành cho người làm nghề ' + ind.career.slice(0, 3).map((id) => (D.CAREERS[id] || {}).title || id).join(', ').toLowerCase();
      else if (ind.career && repTier(repN()) < 2) reason = 'Cần đạt danh tiếng “Giỏi nghề” (làm tốt các ca làm việc)';
      else if (S.money < ind.cost) reason = 'Cần vốn ' + fmtMoney(ind.cost);
      return { id: ind.id, name: ind.name, icon: ind.icon, desc: ind.desc + (ind.career ? ' 🎖️ Mở theo nghề' : ''), costText: fmtMoney(ind.cost), ok: !reason, reason, career: !!ind.career };
    });
  }
  function foundCompany(indId, name) {
    if (!S || S.dead) return fail('Không thể làm điều này.');
    const o = companyOptions().find((x) => x.id === indId); if (!o) return fail('Ngành không tồn tại.'); if (!o.ok) return fail(o.reason);
    const ind = coInd(indId), deltas = {};
    addMoney(-ind.cost, deltas);
    const nm = String(name || '').trim().slice(0, 40) || ind.prefix + ' ' + P().lastName;
    S.company = { name: nm, ind: indId, lv: 0, val: ind.cost, own: 1, staff: 4, founded: S.year, listed: false, lastProfit: 0, bad: 0, boost: 0, rep: ind.career ? repTier(repN()) : 0 };
    addStat('happy', 6, deltas); S.counters.companies = (S.counters.companies || 0) + 1;
    const text = 'Bạn bỏ ' + fmtMoney(ind.cost) + ' thành lập “' + nm + '” (' + ind.name.toLowerCase() + '). Ngày khai trương có lẵng hoa, có pháo giấy, có cả mẹ đứng cười rạng rỡ. Giờ bạn là sếp, lời ăn lỗ chịu.';
    addLog('Thành lập công ty ' + nm + '.', 'milestone', ind.icon); checkProgress(); changed();
    return result({ title: 'Thành lập ' + nm, icon: ind.icon, text, tone: 'milestone', deltas, scene: sceneFor(ind.loc || 'office', { anim: 'cheer', fx: 'confetti', people: alive('mother').concat(alive('spouse')).slice(0, 2).map((p) => ({ p, anim: 'clap' })) }) });
  }
  function companyYear(L, deltas) {
    const c = S.company; if (!c) return;
    const ind = coInd(c.ind), ph = market().phase;
    let g = U.rand(-0.14, 0.3) * ind.vol + (S.stats.smarts - 50) / 400 + (S.job ? -0.03 : 0.02) + (c.boost || 0) + ({ sot: 0.07, vo: -0.12, suy: -0.06 }[ph] || 0) + (S.jail ? -0.15 : 0) + (alive('pet').some((x) => x.species === 'carong') ? 0.03 : 0);
    c.boost = 0;
    // cơ sở mở theo nghề: chủ vẫn hành nghề (bác sĩ vẫn khám ở phòng khám mình) thì không bị trừ, danh tiếng nghề kéo khách
    if (ind.career) { if (S.job && ind.career.includes(S.job.id)) g += 0.03; g += (c.rep || 0) * 0.012 + (S.job && ind.career.includes(S.job.id) ? repTier(repN()) * 0.01 : 0); }
    // càng to càng khó lớn (thị trường bão hoà, đối thủ, bộ máy cồng kềnh) — không còn tăng theo cấp số nhân mãi
    g -= 0.04 * Math.log10(Math.max(1, c.val / 1e9));
    // công ty thừa kế: người con chưa từng điều hành → cổ đông, nhân sự cũ chưa phục, hiệu quả thấp; tăng dần theo số năm tự tay quản lý.
    // Đi làm chỗ khác hoặc còn quá trẻ thì công ty do người làm thuê điều hành: lợi nhuận bị “rút ruột” bớt.
    let mg = 1;
    if (c.heir) {
      const pa = P().age, hands = !S.job && pa >= 20 && !S.jail;
      mg = U.clamp(0.28 + (c.run || 0) * 0.12 + (S.stats.smarts - 50) / 160 + karmaLuck() - (hands ? 0 : 0.18) - (S.lifestyle === 'sangchanh' ? 0.1 : 0), 0.12, 1);
      g -= (1 - mg) * 0.12; // điều hành kém thì công ty cũng teo dần
      if (hands) c.run = (c.run || 0) + 1;
      if (mg >= 0.95) c.heir = false; // đã thật sự làm chủ
    }
    c.val = Math.max(Math.round(ind.cost * 0.08), Math.round(c.val * (1 + g)));
    // cổ tức: chỉ ~40% lợi nhuận được chia, phần còn lại giữ lại tái đầu tư; trả thêm 5% thuế cổ tức
    const profit = Math.round(c.val * ind.margin * U.rand(0.4, 1.1) * (g > 0 ? 1 : 0.2) * c.own * mg * 0.4 * 0.95 / 1e5) * 1e5;
    c.lastProfit = profit; if (profit > 0) addMoney(profit, deltas);
    if (mg < 1) L('🏢 Bạn mới tiếp quản ' + c.name + ' — hiệu quả điều hành ~' + Math.round(mg * 100) + '%' + (S.job ? ' (bạn còn đi làm chỗ khác, công ty giao cho người làm thuê)' : P().age < 20 ? ' (bạn còn quá trẻ, người giám hộ điều hành)' : '') + '.', 'neutral', '🧑‍💼');
    while (c.lv < 4 && c.val >= CO_LV[c.lv + 1][1]) { c.lv++; L('🏢 ' + c.name + ' lớn mạnh thành ' + CO_LV[c.lv][0].toLowerCase() + '!', 'milestone', '🏢'); addStat('happy', 5, deltas); }
    c.staff = Math.max(2, Math.round(CO_LV[c.lv][2] * U.rand(0.7, 1.3)));
    L('🏢 ' + c.name + ': định giá ' + fmtMoney(c.val) + ' (' + (g >= 0 ? '+' : '') + Math.round(g * 100) + '%), cổ tức về túi bạn ' + fmtMoney(profit) + '.', g >= 0 ? 'good' : 'bad', ind.icon);
    c.bad = g < -0.05 ? (c.bad || 0) + 1 : 0;
    if (c.bad >= 3 || c.val < ind.cost * 0.2) queueMilestone('ms_co_crisis');
    else if (!S.jail && P().age < 85 && Math.random() < 0.55) queueMilestone('ms_company');
  }

  // ------------------------------------------------------------------ cậu ấm cô chiêu: giàu sẵn thì có cám dỗ & tai hoạ riêng
  // "Phú không quá ba đời": tiền thừa kế không tự sinh sôi, con nhà giàu bị bủa vây bởi ăn chơi, bạn xấu, anh em tranh chấp, kẻ bắt cóc.
  function richYear() {
    const pa = P().age, rich = S.money + assetsValue();
    if (!S.flags.richkid || pa < 16 || S.jail || S.pending.length > 2) return;
    if (rich < 1.5e9) { if (pa >= 18 && !S.flags.richkid_broke) { S.flags.richkid_broke = S.year; addLog('Gia sản bố mẹ để lại đã tiêu tan gần hết. Từ giờ bạn phải tự đứng trên đôi chân mình.', 'bad', '🕳️'); } return; }
    const sib = alive('sibling').length;
    if (sib && !S.flags.tranhchap && S.year - (S.flags.heirOf || S.year) <= 4 && Math.random() < 0.35) { S.flags.tranhchap = S.year; queueMilestone('ms_tranhchap'); return; }
    if (rich > 8e9 && Math.random() < 0.05) { queueMilestone('ms_batcoc'); return; }
    if (pa <= 50 && Math.random() < 0.42) queueMilestone('ms_cauam');
  }
  const richMoney = () => Math.max(0, S.money);

  // ------------------------------------------------------------------ giàu quá / nổi tiếng quá: bị làm phiền thường xuyên
  // Ai cũng có thể dính (không chỉ con nhà giàu): càng giàu, càng nổi, càng nhiều người tìm đến — họ hàng vay tiền, lừa đảo,
  // thanh tra thuế, xin tài trợ; paparazzi, fan cuồng, antifan bóc phốt, ra đường bị vây xin chụp ảnh.
  const isFamous = () => { const f = (S.social && S.social.followers) || 0, c = S.job && D.CAREERS[S.job.id]; return f >= 300000 || !!(c && c.fame && S.job.level >= 2); };
  function nuisanceYear() {
    const pa = P().age; if (pa < 18 || S.jail || S.pending.length > 2) return;
    const rich = S.money + assetsValue(), pool = [];
    const pr = rich >= 200e9 ? 0.85 : rich >= 30e9 ? 0.65 : rich >= 5e9 ? 0.45 : 0;
    if (pr && Math.random() < pr) pool.push(...['ms_vaytien', 'ms_tuthien', 'ms_luadao', 'ms_thue', 'ms_vaytien'].filter((id) => !(S.flags['nz_' + id] >= S.year - 1)));
    if (isFamous() && Math.random() < 0.6) pool.push(...['ms_paparazzi', 'ms_fancuong', 'ms_bocphot', 'ms_xinchup'].filter((id) => !(S.flags['nz_' + id] >= S.year - 1)));
    if (!pool.length) return;
    const n = pool.length >= 4 && Math.random() < 0.4 ? 2 : 1; // vừa giàu vừa nổi: có năm bị làm phiền hai lần
    U.shuffle(Array.from(new Set(pool))).slice(0, n).forEach((id) => { S.flags['nz_' + id] = S.year; queueMilestone(id); });
  }
  const pct = (k, min) => Math.round(Math.max(min || 0, richMoney() * k) / 1e6) * 1e6;
  const NZ = {
    ms_vaytien: (k) => {
      const amt = pct(0.04, 2e8);
      if (k === 'cho') return { key: k, label: '💵 Cho vay ' + fmtMoney(amt) + ' (chắc gì đã đòi được)', req: { minMoney: amt }, fn: () => Math.random() < 0.3
        ? { text: 'Hai năm sau người ta trả đủ, còn biếu thêm thùng quà Tết. Hoá ra trên đời vẫn có người tử tế.', effects: { karma: 4, happy: 3 }, scene: { loc: 'home', anim: 'hug' }, tone: 'good' }
        : { text: 'Cầm tiền xong, người ta ít gọi hẳn. Hỏi đến thì “đang khó khăn, để tháng sau”. Tháng sau nữa thì chặn luôn số bạn.', effects: { money: -amt, happy: -4, karma: 2 }, scene: { loc: 'home', anim: 'facepalm', fx: 'sweat' }, tone: 'bad' } };
      if (k === 'tu') return { key: k, label: '🙅 Từ chối thẳng', fn: () => ({ text: 'Bạn lắc đầu. Hôm sau cả họ đồn ầm lên: “Giàu mà keo, quên cả gốc gác.” Đám giỗ năm nay chẳng ai mời bạn.', effects: { happy: -3, rel: { all: -4 } }, scene: { loc: 'home', anim: 'shrug', npcs: [{ role: 'stranger', anim: 'angry', say: 'Giàu mà keo thế!' }] }, tone: 'bad' }) };
      return { key: 'tang', label: '🎁 Cho hẳn một nửa, không cần trả (' + fmtMoney(Math.round(amt / 2)) + ')', req: { minMoney: Math.round(amt / 2) }, fn: () => ({ text: 'Bạn đưa tiền, dặn: “Khỏi trả, lo cho tụi nhỏ đi học.” Người ta khóc nghẹn. Mấy hôm sau, thêm ba người nữa gọi đến “có chút chuyện muốn nhờ”.', effects: { money: -Math.round(amt / 2), karma: 5, happy: 2 }, scene: { loc: 'home', anim: 'hug', fx: 'sparkle' }, tone: 'good' }) };
    },
    ms_tuthien: (k) => {
      const amt = pct(0.012, 1e8);
      if (k === 'gop') return { key: k, label: '🙏 Tài trợ ' + fmtMoney(amt), req: { minMoney: amt }, fn: () => ({ text: 'Tấm bia ghi tên bạn được dựng ở đầu làng. Báo địa phương đưa tin, người dân tận tay mang biếu bạn mấy chục quả trứng gà.', effects: { money: -amt, karma: 7, happy: 5, followers: 0.03 }, scene: { loc: 'countryside', anim: 'bow', fx: 'sparkle', npcs: [{ role: 'neighbor', anim: 'clap' }] }, tone: 'good' }) };
      if (k === 'sao') return { key: k, label: '📸 Góp ít thôi nhưng livestream thật to', req: { minMoney: Math.round(amt / 5) }, fn: () => Math.random() < 0.5
        ? { text: 'Clip “trao quà từ thiện” hút triệu view. Bạn được khen hết lời — cho đến khi có người soi ra số tiền thật.', effects: { money: -Math.round(amt / 5), followers: 0.06, karma: -2 }, scene: { loc: 'street', anim: 'wave', fx: 'sparkle' }, tone: 'neutral' }
        : { text: 'Cộng đồng mạng sao kê từng đồng, cả nước biết bạn “từ thiện” có 1/5 số đã hứa. Bạn bị gọi là “nhà hảo tâm bằng mồm”.', effects: { money: -Math.round(amt / 5), followers: -0.12, karma: -5, happy: -8 }, scene: { loc: 'home', anim: 'facepalm', fx: 'sweat' }, tone: 'bad' } };
      return { key: 'thoi', label: '🚪 Đóng cửa, không tiếp', fn: () => ({ text: 'Bạn bảo người giúp việc nói vắng nhà. Đoàn người đứng chờ ngoài cổng cả buổi chiều rồi lặng lẽ về.', effects: { karma: -3, happy: -1 }, scene: { loc: 'home', anim: 'sad' } }) };
    },
    ms_luadao: (k) => {
      const amt = pct(0.08, 3e8), p = U.clamp(0.4 + (S.stats.smarts - 50) / 120 + karmaLuck(), 0.15, 0.9);
      if (k === 'tin') return { key: k, label: '😰 Làm theo, chuyển tiền “xác minh tài khoản”', fn: () => ({ text: 'Giọng “cán bộ” nghiêm khắc, giấy tờ có cả con dấu đỏ. Bạn chuyển ' + fmtMoney(amt) + '. Mười phút sau số điện thoại không liên lạc được nữa.', effects: { money: -amt, happy: -12 }, scene: { loc: 'home', anim: 'cry', fx: 'tears' }, tone: 'bad' }) };
      if (k === 'xet') return { key: k, label: '🕵️ Vặn hỏi lại cho ra lẽ', mini: 'quiz', odds: () => p, fn: () => miniWin(p)
        ? { text: 'Bạn hỏi số hiệu, tên đơn vị, rồi gọi thẳng lên tổng đài công an. Kẻ lừa đảo cúp máy. Bạn còn giúp công an lần ra cả ổ nhóm.', effects: { happy: 5, smarts: 2, karma: 2 }, scene: { loc: 'home', anim: 'point', fx: 'idea' }, tone: 'good' }
        : { text: 'Chúng trả lời trơn tru đến mức bạn xiêu lòng, lỡ chuyển một nửa rồi mới tỉnh ra: mất ' + fmtMoney(Math.round(amt / 2)) + '.', effects: { money: -Math.round(amt / 2), happy: -8 }, scene: { loc: 'home', anim: 'facepalm' }, tone: 'bad' } };
      return { key: 'cup', label: '📵 Cúp máy, chặn số', fn: () => ({ text: 'Bạn cúp máy ngay. Tuần đó có thêm bốn cuộc gọi “trúng thưởng”, “con bạn bị tai nạn”, “nợ thuế”... Giàu cũng mệt.', effects: { happy: -1 }, scene: { loc: 'home', anim: 'phone' } }) };
    },
    ms_thue: (k) => {
      const due = pct(0.03, 2e8), p = U.clamp(0.5 + (S.stats.smarts - 50) / 160 + karmaLuck(), 0.2, 0.8);
      if (k === 'nop') return { key: k, label: '🧾 Hợp tác, nộp truy thu ' + fmtMoney(due), fn: () => ({ text: 'Đoàn thanh tra làm việc ba tuần, soi từng hoá đơn. Bạn nộp đủ truy thu và phạt chậm nộp. Hồ sơ sạch, ngủ ngon.', effects: { money: -due, karma: 3, happy: -3 }, scene: { loc: 'office', anim: 'nod', npcs: [{ role: 'police', anim: 'nod' }] }, tone: 'neutral' }) };
      if (k === 'ls') return { key: k, label: '⚖️ Thuê luật sư thuế giỏi (' + fmtMoney(Math.round(due / 3)) + ')', mini: 'interview', odds: () => p, fn: () => miniWin(p)
        ? { text: 'Luật sư chỉ ra các khoản đã được miễn giảm hợp pháp. Bạn chỉ mất tiền thuê luật sư.', effects: { money: -Math.round(due / 3), happy: 2 }, scene: { loc: 'office', anim: 'cheer' }, tone: 'good' }
        : { text: 'Đoàn thanh tra không chấp nhận giải trình. Bạn vừa nộp truy thu gấp đôi vừa mất phí luật sư.', effects: { money: -Math.round(due * 2.3), happy: -8 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' } };
      return { key: 'lot', label: '🧧 “Bôi trơn” cho xong chuyện', fn: () => Math.random() < 0.55
        ? { text: 'Phong bì dày cộp đổi lấy biên bản “không phát hiện sai phạm”. Nhưng từ đó, mỗi dịp lễ Tết lại có người “ghé thăm”.', effects: { money: -Math.round(due / 2), karma: -8 }, scene: { loc: 'office', anim: 'shrug' }, tone: 'neutral' }
        : { text: 'Vị cán bộ bị điều tra và khai ra cả bạn. Tội đưa hối lộ chồng lên truy thu thuế, báo chí đưa tin rầm rộ.', effects: { money: -Math.round(due * 3), karma: -10, happy: -15, followers: -0.1 }, scene: { loc: 'office', anim: 'scared', fx: 'exclaim', shot: 'dramatic', npcs: [{ role: 'police', anim: 'point' }] }, tone: 'bad' } };
    },
    ms_paparazzi: (k) => {
      if (k === 'ke') return { key: k, label: '🙈 Kệ, đi tiếp', fn: () => ({ text: 'Hôm sau, ảnh bạn mặt mộc, dép tổ ong đi chợ lên trang nhất: “Sao X xuống sắc không nhận ra”. Bạn bực cả tuần.', effects: { happy: -4 }, scene: { loc: 'market', anim: 'sad', npcs: [{ role: 'stranger', anim: 'point' }] }, tone: 'bad' }) };
      if (k === 'dap') return { key: k, label: '😡 Giật máy ảnh đập luôn', fn: () => ({ text: 'Đã tay được một giây. Clip bạn “hành hung phóng viên” lan khắp mạng, bạn phải bồi thường và lên xin lỗi công khai.', effects: { money: -8e7, karma: -4, happy: -6, followers: -0.08 }, scene: { loc: 'street', anim: 'angry', fx: 'anger', npcs: [{ role: 'stranger', anim: 'scared', say: 'Ơ kìa!' }] }, tone: 'bad' }) };
      return { key: 'tao', label: '😎 Tạo dáng cho họ chụp luôn', fn: () => ({ text: 'Bạn quay lại cười tươi, tạo dáng chuẩn tạp chí. Bức ảnh “thân thiện hết nấc” được chia sẻ ầm ầm.', effects: { happy: 2, followers: 0.04, looks: 1 }, scene: { loc: 'street', anim: 'wave', fx: 'sparkle' }, tone: 'good' }) };
    },
    ms_fancuong: (k) => {
      if (k === 'vs') return { key: k, label: '🕶️ Thuê vệ sĩ 24/24 (' + fmtMoney(4e8) + '/năm)', fn: () => ({ text: 'Từ nay đi đâu cũng có hai anh vệ sĩ to như hộ pháp. An toàn, nhưng chẳng còn được tự do đi ăn bát phở vỉa hè.', effects: { money: -4e8, happy: -1 }, scene: { loc: 'street', anim: 'idle', npcs: [{ role: 'police', anim: 'idle' }] }, tone: 'neutral' }) };
      if (k === 'ca') return { key: k, label: '🚓 Báo công an', fn: () => ({ text: 'Công an mời người fan đó lên làm việc, cấm lại gần bạn. Bạn yên tâm hơn, nhưng thỉnh thoảng vẫn thấy bóng người lấp ló đầu ngõ.', effects: { happy: -2 }, scene: { loc: 'office', anim: 'nod', npcs: [{ role: 'police', anim: 'nod' }] }, tone: 'neutral' }) };
      return { key: 'noi', label: '🗣️ Gặp nói chuyện cho rõ', fn: () => Math.random() < 0.5
        ? { text: 'Hoá ra đó là một cô bé cô đơn, coi bạn là chỗ dựa tinh thần. Bạn nói chuyện nhẹ nhàng, khuyên em đi gặp chuyên gia. Mấy năm sau em gửi thư cảm ơn.', effects: { karma: 5, happy: 3 }, scene: { loc: 'cafe', anim: 'talk', fx: 'sparkle' }, tone: 'good' }
        : { text: 'Người đó lao tới ôm chặt rồi giật tóc bạn làm “kỷ niệm”. Bạn bị xây xước, mất ngủ cả tháng.', effects: { health: -6, happy: -10 }, scene: { loc: 'street', anim: 'scared', fx: 'exclaim' }, tone: 'bad' } };
    },
    ms_bocphot: (k) => {
      const p = U.clamp(0.45 + (S.stats.smarts - 50) / 200 + (S.karma - 50) / 300, 0.15, 0.8);
      if (k === 'live') return { key: k, label: '📱 Livestream giải thích', mini: 'interview', odds: () => p, fn: () => miniWin(p)
        ? { text: 'Bạn bình tĩnh đưa bằng chứng, nói chân thành. Dư luận quay xe, antifan bị ném đá ngược.', effects: { followers: 0.08, happy: 5 }, scene: { loc: 'home', anim: 'talk', fx: 'sparkle' }, tone: 'good' }
        : { text: 'Bạn càng nói càng rối, lỡ lời thêm câu mới. Clip cắt ghép đoạn đó lên xu hướng, nhãn hàng huỷ hợp đồng.', effects: { followers: -0.15, money: -pct(0.02, 1e8), happy: -12 }, scene: { loc: 'home', anim: 'cry', fx: 'tears' }, tone: 'bad' } };
      if (k === 'kien') return { key: k, label: '⚖️ Kiện tội vu khống', fn: () => ({ text: 'Vụ kiện kéo dài, tốn tiền luật sư. Bạn thắng, nhưng mọi người chỉ nhớ cái tin đồn ban đầu.', effects: { money: -1.5e8, happy: -3 }, scene: { loc: 'office', anim: 'nod' }, tone: 'neutral' }) };
      return { key: 'im', label: '🤐 Im lặng chờ bão qua', fn: () => ({ text: 'Bạn khoá bình luận, tạm dừng mạng xã hội. Một tháng sau chuyện lắng xuống, nhưng lượng theo dõi tụt hẳn.', effects: { followers: -0.1, happy: -5 }, scene: { loc: 'home', anim: 'sad' }, tone: 'bad' }) };
    },
    ms_xinchup: (k) => {
      if (k === 'chup') return { key: k, label: '🤳 Vui vẻ chụp với mọi người', fn: () => ({ text: 'Bạn chụp ảnh với hơn trăm người, đến lúc ăn thì bát phở đã nguội ngắt. Nhưng ai cũng về khen bạn dễ thương.', effects: { happy: -1, followers: 0.03, karma: 1 }, scene: { loc: 'street', anim: 'wave', npcs: [{ role: 'stranger', anim: 'cheer', say: 'Cho em xin kiểu ảnh!' }, { role: 'stranger', anim: 'phone' }] }, tone: 'good' }) };
      return { key: 'tron', label: '😷 Đeo khẩu trang, kính đen, chuồn lẹ', mini: 'chase', odds: () => 0.6, fn: () => miniWin(0.6)
        ? { text: 'Bạn lách qua đám đông, nhảy lên taxi thoát êm. Lần sau chắc phải ăn ở nhà.', effects: { happy: 1 }, scene: { loc: 'street', anim: 'run' }, tone: 'neutral' }
        : { text: 'Có người nhận ra, hét to tên bạn. Đám đông ùa tới, bạn bị xô ngã trầy cả gối, clip “sao chạy trốn fan” lại lên xu hướng.', effects: { health: -3, happy: -5, followers: 0.02 }, scene: { loc: 'street', anim: 'fall', fx: 'dust' }, tone: 'bad' } };
    },
  };
  const NZ_DEF = {
    ms_vaytien: ['Họ hàng xa đến vay tiền', '🤲', 'Một người tự xưng là “cháu của bác họ bên ngoại” đến tận nhà, kể lể hoàn cảnh suốt hai tiếng rồi mới vào chuyện chính: vay tiền làm ăn.', { loc: 'home', anim: 'think', npcs: [{ role: 'stranger', anim: 'cry', say: 'Giúp em lần này thôi...' }] }, ['cho', 'tu', 'tang']],
    ms_tuthien: ['Người xin tài trợ kéo đến', '🏮', 'Sáng ra cổng nhà đã có một đoàn: xin xây cầu, đúc chuông chùa, tài trợ giải bóng đá xã. Ai cũng nói “anh chị có điều kiện mà”.', { loc: 'home', anim: 'idle', npcs: [{ role: 'neighbor', anim: 'bow', say: 'Mong anh chị hảo tâm...' }, { role: 'stranger', anim: 'idle' }] }, ['gop', 'sao', 'thoi']],
    ms_luadao: ['Cuộc gọi từ “công an”', '📞', 'Số lạ gọi đến, giọng nghiêm nghị: “Tài khoản của anh chị liên quan đường dây rửa tiền. Phải chuyển toàn bộ tiền sang tài khoản tạm giữ để xác minh, nếu không sẽ bị bắt.”', { loc: 'home', anim: 'phone', expr: 'scared', fx: 'question' }, ['tin', 'xet', 'cup']],
    ms_thue: ['Thanh tra thuế gõ cửa', '🧾', 'Giấy mời làm việc của cơ quan thuế: tài sản tăng quá nhanh so với thu nhập kê khai, đề nghị giải trình nguồn gốc.', { loc: 'office', anim: 'scared', npcs: [{ role: 'police', anim: 'talk', say: 'Đề nghị giải trình.' }], fx: 'sweat' }, ['nop', 'ls', 'lot']],
    ms_paparazzi: ['Paparazzi bám đuôi', '📸', 'Đi chợ mua mớ rau cũng thấy ống kính dài ngoẵng chĩa vào mình từ bên kia đường.', { loc: 'market', anim: 'scared', npcs: [{ role: 'stranger', anim: 'phone' }], fx: 'flash' }, ['ke', 'dap', 'tao']],
    ms_fancuong: ['Fan cuồng theo dõi', '👁️', 'Một người lạ đứng trước cổng nhà bạn ba đêm liền, gửi hàng trăm tin nhắn mỗi ngày, biết cả giờ bạn đi ngủ.', { loc: 'street', time: 'night', anim: 'scared', npcs: [{ role: 'stranger', anim: 'wave', say: 'Em yêu anh/chị mà!' }], fx: 'exclaim', shot: 'dramatic' }, ['vs', 'ca', 'noi']],
    ms_bocphot: ['Antifan bóc phốt', '🔥', 'Một tài khoản ẩn danh tung loạt “bằng chứng” về quá khứ của bạn. Sáng ngủ dậy, tên bạn đứng top tìm kiếm cùng chữ “phốt”.', { loc: 'home', anim: 'phone', expr: 'sad', fx: 'anger' }, ['live', 'kien', 'im']],
    ms_xinchup: ['Ra đường không yên', '🤳', 'Bạn chỉ định ra quán phở đầu ngõ ăn sáng. Năm phút sau, cả quán đứng dậy xếp hàng xin chụp ảnh.', { loc: 'street', anim: 'eat', npcs: [{ role: 'stranger', anim: 'phone', say: 'Đúng là anh/chị ấy rồi!' }, { role: 'vendor', anim: 'clap' }] }, ['chup', 'tron']],
  };
  Object.keys(NZ_DEF).forEach((id) => { const [title, icon, text, scene, keys] = NZ_DEF[id];
    ms({ id, title, icon, age: [18, 99], text, scene, choicesFn: () => keys.map(NZ[id]), choiceByKey: NZ[id] }); });
  function cauamChoice(k) {
    const m = richMoney();
    if (k === 'xe') {
      const cost = Math.round(U.clamp(m * 0.3, 6e9, 25e9) / 1e8) * 1e8;
      return { key: k, label: '🏎️ Tậu siêu xe cho “bằng bạn bằng bè” (' + fmtMoney(cost) + ')', req: { minMoney: cost },
        fn: () => ({ text: 'Chiếc siêu xe gầm rú trên phố đêm, cả hội bạn quay clip đăng mạng. Một tuần sau bạn chán. Ba tháng sau nó nằm phủ bạt trong gara, mỗi năm tốn cả trăm triệu bảo dưỡng và mất giá từng ngày.', effects: { money: -cost, happy: 9, looks: 2, asset: { add: { type: 'car', name: 'Siêu xe', value: Math.round(cost * 0.6) } } }, scene: { loc: 'street', time: 'night', anim: 'cheer', fx: 'money', npcs: [{ role: 'stranger', anim: 'clap', say: 'Đỉnh quá đại ca!' }] }, tone: 'neutral' }) };
    }
    if (k === 'casino') {
      const bet = Math.round(Math.max(1e9, m * 0.3) / 1e8) * 1e8, p = U.clamp(0.36 + karmaLuck(), 0.2, 0.55);
      return { key: k, label: '🎰 Bay sang Macau “thử vận may” (cược ' + fmtMoney(bet) + ')', req: { minMoney: bet }, mini: 'cards', odds: () => p,
        fn: () => miniWin(p) ? { text: 'Bạn thắng một ván lớn, ôm về ' + fmtMoney(Math.round(bet * 0.5)) + '. Sòng bạc tặng phòng VIP và vé máy bay hạng nhất — họ biết bạn sẽ quay lại.', effects: { money: Math.round(bet * 0.5), happy: 8, karma: -3 }, scene: { loc: 'karaoke', time: 'night', anim: 'cheer', fx: 'money' }, tone: 'good' }
          : { text: 'Ván đầu thắng, ván sau gỡ, rạng sáng bạn bước ra khỏi sòng bạc với hai bàn tay trắng: mất ' + fmtMoney(bet) + '. Cả nhà gọi điện mà bạn không dám nghe máy.', effects: { money: -bet, happy: -14, karma: -4 }, scene: { loc: 'street', time: 'dawn', anim: 'cry', fx: 'tears' }, tone: 'bad' } };
    }
    if (k === 'duan') {
      const amt = Math.round(Math.max(8e8, m * 0.35) / 1e8) * 1e8, p = U.clamp(0.22 + (S.stats.smarts - 50) / 220 + karmaLuck(), 0.1, 0.5);
      return { key: k, label: '📈 Rót vốn vào “dự án nghìn tỷ” của hội bạn (' + fmtMoney(amt) + ')', req: { minMoney: amt }, mini: 'haggle', odds: () => p,
        fn: () => miniWin(p) ? { text: 'Bất ngờ là dự án có thật và chạy được. Sau một năm bạn thu về gấp rưỡi, lần đầu tiên thấy mình kiếm ra tiền chứ không chỉ tiêu tiền.', effects: { money: Math.round(amt * 0.55), happy: 8, smarts: 2 }, scene: { loc: 'office', anim: 'cheer', fx: 'money' }, tone: 'good' }
          : { text: '“Dự án” chỉ có bản vẽ đẹp và một văn phòng thuê ngắn hạn. Sáu tháng sau, ông bạn thân biến mất cùng ' + fmtMoney(Math.round(amt * 0.85)) + ' của bạn. Công an nói khả năng thu hồi rất thấp.', effects: { money: -Math.round(amt * 0.85), happy: -12 }, scene: { loc: 'office', anim: 'facepalm', fx: 'sweat' }, tone: 'bad' } };
    }
    if (k === 'tiec') {
      const cost = Math.round(Math.max(3e8, m * 0.08) / 1e7) * 1e7;
      return { key: k, label: '🥂 Mở tiệc du thuyền, bao cả hội (' + fmtMoney(cost) + ')', req: { minMoney: cost },
        fn: () => ({ text: 'Ba ngày ba đêm trên du thuyền: DJ, rượu ngoại, người đẹp. Ảnh bạn tràn ngập mạng xã hội. Lúc tỉnh dậy, bạn không nhớ nổi tên nửa số người đã đến.', effects: { money: -cost, happy: 10, health: -4, followers: 0.05 }, scene: { loc: 'beach', time: 'night', anim: 'dance', fx: ['fireworks', 'music'] }, tone: 'neutral' }) };
    }
    return { key: 'hoc', label: '📚 Từ chối, tập làm ăn từ những việc nhỏ',
      fn: () => { if (S.company && S.company.heir) S.company.run = (S.company.run || 0) + 1; return { text: 'Bạn tắt điện thoại, cắt bớt hội bạn ăn chơi, xin vào làm từ vị trí thấp nhất' + (S.company ? ' trong chính công ty của gia đình' : '') + '. Lương ba cọc ba đồng, nhưng lần đầu tiên bạn hiểu đồng tiền làm ra khó thế nào.', effects: { happy: -3, smarts: 3, karma: 3 }, scene: { loc: 'office', anim: 'type', fx: 'idea' }, tone: 'good' }; } };
  }
  ms({ id: 'ms_cauam', title: 'Cám dỗ của cậu ấm, cô chiêu', icon: '💎', age: [16, 60],
    text: 'Tài khoản lúc nào cũng nhiều số 0, nên bạn bè vây quanh không thiếu. Tối nay điện thoại lại rung liên tục: “Ra đây đi, có kèo hay lắm!”',
    scene: { loc: 'karaoke', time: 'night', anim: 'phone', npcs: [{ role: 'stranger', anim: 'wave', say: 'Đi chơi đi, tiền nhiều để làm gì!' }], fx: 'money' },
    choicesFn: () => { const ks = U.shuffle(['xe', 'casino', 'duan', 'tiec']).slice(0, 3); ks.push('hoc'); return ks.map(cauamChoice); }, choiceByKey: cauamChoice });
  function tranhchapChoice(k) {
    const m = richMoney();
    if (k === 'chia') { const give = Math.round(m * 0.3 / 1e6) * 1e6; return { key: k, label: '🤝 Chia thêm cho anh chị em cho êm (' + fmtMoney(give) + ')', fn: () => ({ text: 'Bạn ngồi lại với anh chị em, chia thêm một phần lớn. Bữa cơm giỗ năm ấy lần đầu tiên không ai to tiếng.', effects: { money: -give, karma: 6, happy: 2, rel: { sibling: 20 } }, scene: { loc: 'home', anim: 'hug', npcs: [{ role: 'sibling', anim: 'hug' }] }, tone: 'good' }) }; }
    if (k === 'toa') { const p = U.clamp(0.45 + (S.stats.smarts - 50) / 200 + karmaLuck(), 0.2, 0.75), fee = Math.round(Math.max(2e8, m * 0.06) / 1e6) * 1e6; return { key: k, label: '⚖️ Ra toà, thuê luật sư giỏi nhất (' + fmtMoney(fee) + ')', mini: 'interview', odds: () => p,
      fn: () => miniWin(p) ? { text: 'Sau hai năm kiện tụng, toà phán bạn giữ nguyên phần thừa kế. Bạn thắng kiện, nhưng mất luôn anh chị em ruột.', effects: { money: -fee, happy: -4, rel: { sibling: -45 } }, scene: { loc: 'office', anim: 'nod', npcs: [{ role: 'sibling', anim: 'angry' }] }, tone: 'neutral' }
        : { text: 'Toà tuyên chia lại di sản. Bạn mất gần nửa gia tài cộng tiền luật sư, và anh chị em vẫn không nhìn mặt bạn.', effects: { money: -Math.round(m * 0.42 + fee), happy: -12, rel: { sibling: -40 } }, scene: { loc: 'office', anim: 'facepalm', npcs: [{ role: 'sibling', anim: 'point' }] }, tone: 'bad' } }; }
    return { key: 'lo', label: '🙈 Lờ đi, “của bố mẹ cho tôi”', fn: () => { const lose = Math.round(m * 0.18 / 1e6) * 1e6; return { text: 'Anh chị em đưa chuyện lên báo, cả họ chia phe. Để dập tin đồn và giữ uy tín, bạn vẫn phải chi ' + fmtMoney(lose) + '.', effects: { money: -lose, karma: -4, happy: -6, rel: { sibling: -30 } }, scene: { loc: 'home', anim: 'angry', npcs: [{ role: 'sibling', anim: 'angry', say: 'Bố mẹ đâu chỉ có mình mày!' }] }, tone: 'bad' }; } };
  }
  // ⚖️ THỪA KẾ của bố mẹ (đời thường): căn nhà + sổ tiết kiệm; có anh chị em thì phải chia
  function parentEstate() {
    const big = ['hanoi', 'hcm', 'danang', 'haiphong'].includes(S.city) ? 1.6 : 1, r = Math.random();
    const v = r < 0.7 ? U.rand(1.5e8, 9e8) : r < 0.95 ? U.rand(1e9, 4e9) : U.rand(5e9, 12e9);
    return Math.round(v * big / 1e7) * 1e7;
  }
  function dichucChoice(k) {
    const est = S.flags.estate || 3e8, sibs = alive('sibling'), n = sibs.length + 1, share = Math.round(est / n / 1e6) * 1e6;
    if (k === 'deu') return { key: k, label: '⚖️ Chia đều theo luật (mỗi người ' + fmtMoney(share) + ')', fn: () => { const sour = Math.random() < 0.25; return { text: 'Cả nhà thống nhất chia đều theo luật. Bạn nhận ' + fmtMoney(share) + '.' + (sour ? ' Dù vậy, một người anh chị em vẫn lẩm bẩm rằng mình chăm bố mẹ nhiều hơn, bữa giỗ năm ấy hơi gượng.' : ' Bữa cơm sau đó ấm cúng, ai cũng thấy nhẹ lòng.'), effects: { money: share, happy: 2, rel: { sibling: sour ? -8 : 4 } }, scene: { loc: 'home', anim: 'nod', npcs: [{ role: 'sibling', anim: sour ? 'shrug' : 'nod' }] }, tone: 'neutral' }; } };
    if (k === 'nhuong') return { key: k, label: '🤝 Nhường hết phần mình cho anh chị em', fn: () => ({ text: 'Bạn ký giấy nhường toàn bộ phần thừa kế: “Em/anh chị còn khó khăn hơn mình.” Cả nhà rưng rưng. Bố mẹ trên trời chắc cũng mỉm cười.', effects: { karma: 10, happy: 4, rel: { sibling: 22 } }, scene: { loc: 'home', anim: 'hug', npcs: [{ role: 'sibling', anim: 'cry' }], fx: 'hearts' }, tone: 'good' }) };
    if (k === 'doi') { const p = U.clamp(0.38 + (S.stats.smarts - 50) / 200 + karmaLuck(), 0.15, 0.7), fee = Math.round(Math.max(3e7, est * 0.08) / 1e6) * 1e6;
      return { key: k, label: '😤 Đòi phần hơn: “Mình chăm bố mẹ nhiều nhất”', mini: 'interview', odds: () => p, fn: () => miniWin(p)
        ? { text: 'Bạn đưa ra hoá đơn viện phí, giấy tờ chăm sóc mấy năm trời. Anh chị em đành đồng ý chia cho bạn phần lớn hơn: ' + fmtMoney(Math.round(share * 1.6)) + '. Nhưng từ đó mỗi người một nơi.', effects: { money: Math.round(share * 1.6), karma: -4, rel: { sibling: -25 } }, scene: { loc: 'home', anim: 'point', npcs: [{ role: 'sibling', anim: 'angry' }], fx: 'anger' }, tone: 'neutral' }
        : { text: 'Anh chị em không chịu, đưa nhau ra toà. Hai năm kiện tụng, toà vẫn chia đều; trừ tiền luật sư ' + fmtMoney(fee) + ' bạn chỉ còn ' + fmtMoney(Math.max(0, share - fee)) + ', và anh chị em không còn nhìn mặt nhau.', effects: { money: Math.max(0, share - fee), happy: -10, karma: -6, rel: { sibling: -40 } }, scene: { loc: 'office', anim: 'facepalm', npcs: [{ role: 'sibling', anim: 'angry', say: 'Gặp nhau ở toà!' }] }, tone: 'bad' } }; }
    if (k === 'giu') return { key: k, label: '🏡 Giữ lại căn nhà làm nhà thờ tổ, chỉ nhận tiền tiết kiệm', fn: () => ({ text: 'Bạn quyết không bán căn nhà của bố mẹ, giữ làm nơi thờ cúng, Tết về sum họp. Nhận phần tiền tiết kiệm ' + fmtMoney(Math.round(est * 0.3 / 1e6) * 1e6) + '.', effects: { money: Math.round(est * 0.3 / 1e6) * 1e6, karma: 5, happy: 4, rel: { sibling: 6 } }, scene: { loc: 'countryside', anim: 'pray', fx: 'sparkle' }, tone: 'good' }) };
    return { key: 'all', label: '📜 Nhận toàn bộ thừa kế (' + fmtMoney(est) + ')', fn: () => ({ text: 'Là con một, bạn nhận toàn bộ căn nhà và sổ tiết kiệm bố mẹ để lại, tổng cộng ' + fmtMoney(est) + '. Cầm tờ sổ đỏ, bạn thấy nặng trĩu: đó là cả đời dành dụm của bố mẹ.', effects: { money: est, happy: -2 }, scene: { loc: 'home', anim: 'sad', fx: 'sparkle' }, tone: 'neutral' }) };
  }
  ms({ id: 'ms_dichuc', title: 'Đọc di chúc', icon: '📜', age: [18, 99],
    text: 'Sau lễ 49 ngày, cả nhà ngồi quanh bàn thờ mở tờ di chúc. Bố mẹ để lại căn nhà và cuốn sổ tiết kiệm, ước tính khoảng {estate}. Ai cũng im lặng nhìn nhau…',
    scene: { loc: 'home', anim: 'think', npcs: [{ role: 'sibling', anim: 'think' }, { role: 'spouse', anim: 'sad' }], shot: 'dramatic' },
    choicesFn: () => (alive('sibling').length ? ['deu', 'nhuong', 'doi', 'giu'] : ['all', 'giu']).map(dichucChoice), choiceByKey: dichucChoice });
  // 🌀 THIÊN TAI & THỜI TIẾT theo vùng: miền Trung bão lũ, miền Tây hạn mặn, miền Bắc rét đậm / nắng nóng, Đà Lạt sạt lở…
  const REGION_DIS = { hanoi: ['ret', 'nong', 'bao', 'dich'], haiphong: ['bao', 'ret', 'dich'], danang: ['bao', 'lu', 'lu', 'dich'], hue: ['lu', 'lu', 'bao', 'dich'], nhatrang: ['bao', 'lu', 'dich'], dalat: ['salo', 'ret', 'dich'], hcm: ['ngap', 'nong', 'dich'], cantho: ['han', 'ngap', 'dich'] };
  function disasterYear() {
    const pa = P().age; if (pa < 6 || S.jail || S.abroad || S.pending.length > 2) return;
    if (S.flags.disYear && S.year - S.flags.disYear < 3) return; // không dồn dập
    if (Math.random() > 0.07) return;
    const k = U.pick(REGION_DIS[S.city] || ['bao', 'lu', 'dich']);
    if (k === 'dich' && Math.random() < 0.6) return; // dịch hiếm hơn
    S.flags.disYear = S.year; queueMilestone('ms_dis_' + k);
  }
  const homeLoss = (base) => Math.round(Math.max(base, (S.money > 0 ? S.money : 0) * 0.02) * (S.assets && S.assets.some((a) => a.type === 'house') ? 1.6 : 1) / 1e6) * 1e6;
  ms({ id: 'ms_dis_bao', title: 'Bão lớn đổ bộ', icon: '🌀', age: [6, 120],
    text: 'Đài báo siêu bão cấp 13 sẽ đổ bộ vào {city} đêm nay. Gió bắt đầu rít qua khe cửa, siêu thị cháy hàng mì gói và nến.',
    scene: { loc: 'street', time: 'dusk', weather: 'storm', anim: 'scared', expr: 'scared', npcs: [{ role: 'neighbor', anim: 'run' }], shot: 'dramatic' },
    choices: [
      { label: '🔨 Chằng chống nhà cửa, tích trữ đồ ăn (5 triệu)', fn: () => { const l = Math.round(homeLoss(1e7) * 0.25 / 1e6) * 1e6; return { text: 'Bạn bao cát lên mái tôn, dán băng dính kính cửa, mua đủ nước và đèn pin. Bão qua, nhà chỉ tốc vài tấm ngói, sửa hết ' + fmtMoney(l) + '. Hàng xóm sang mượn đèn, cảm ơn rối rít.', effects: { money: -5e6 - l, happy: -2, karma: 2 }, scene: { loc: 'home', weather: 'rain', anim: 'nod' }, tone: 'neutral' }; } },
      { label: '🏫 Sơ tán theo chính quyền', fn: () => { const l = Math.round(homeLoss(2e7) * 0.6 / 1e6) * 1e6; return { text: 'Cả nhà ôm đồ lên trường học kiên cố trú bão, ngủ chen chúc trên bàn học. Sáng ra về nhà: mái tôn bay mất, đồ đạc ướt hết, thiệt hại ' + fmtMoney(l) + '. Nhưng ai cũng an toàn.', effects: { money: -l, happy: -5, health: -1 }, scene: { loc: 'school', anim: 'sit', weather: 'rain' }, tone: 'bad' }; } },
      { label: '🏠 Ở lại giữ nhà, “bão năm nào chẳng có”', fn: () => { const l = homeLoss(3e7); if (Math.random() < 0.35) return { text: 'Nửa đêm một cành cây lớn đổ sập mái, bạn bị thương ở đầu phải đi cấp cứu. Thiệt hại ' + fmtMoney(l) + ' và một bài học nhớ đời.', effects: { money: -l, health: -15, happy: -10 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' }, tone: 'bad' }; return { text: 'Bạn thức trắng giữ cửa. May mà bão suy yếu khi vào bờ, nhà chỉ tốc mái nhẹ, thiệt hại ' + fmtMoney(Math.round(l / 2 / 1e6) * 1e6) + '.', effects: { money: -Math.round(l / 2 / 1e6) * 1e6, happy: -3 }, scene: { loc: 'home', weather: 'storm', anim: 'scared' }, tone: 'neutral' }; } },
    ] });
  ms({ id: 'ms_dis_lu', title: 'Nước lũ dâng cao', icon: '🌊', age: [6, 120],
    text: 'Mưa ba ngày không dứt, nước sông tràn bờ. Nước ngập tới đầu gối rồi lên tới bậc thang. Loa phường gọi người dân lên chỗ cao.',
    scene: { loc: 'countryside', weather: 'rain', time: 'dusk', anim: 'scared', npcs: [{ role: 'neighbor', anim: 'wave', say: 'Lên gác đi!' }], shot: 'dramatic' },
    choices: [
      { label: '📦 Kê đồ đạc lên cao, sơ tán người già trẻ nhỏ', fn: () => { const l = Math.round(homeLoss(1.2e7) * 0.5 / 1e6) * 1e6; return { text: 'Bạn kê tủ lạnh, ti vi lên gác, đưa ông bà lên nhà văn hoá. Lũ rút, bùn ngập nửa nhà, thiệt hại ' + fmtMoney(l) + '. Cả xóm xắn tay dọn bùn cùng nhau.', effects: { money: -l, happy: -4, karma: 2 }, scene: { loc: 'home', anim: 'lift' }, tone: 'neutral' }; } },
      { label: '🛶 Chèo thuyền đi cứu người mắc kẹt', mini: 'swim', odds: () => U.clamp(0.4 + (S.stats.health - 50) / 120, 0.2, 0.8), fn: () => { const p = U.clamp(0.4 + (S.stats.health - 50) / 120, 0.2, 0.8); if (miniWin(p)) { unlockSafe('hero'); if (S.social && S.social.followers != null) S.social.followers += 5000; return { text: 'Bạn mượn chiếc thuyền nhôm, chèo trong đêm đưa được 7 người già và trẻ em lên chỗ cao. Báo chí đăng ảnh bạn ướt sũng ôm một em bé. Cả nước gọi bạn là người hùng vùng lũ!', effects: { karma: 15, happy: 8, health: -4 }, scene: { loc: 'countryside', weather: 'rain', anim: 'cheer', fx: 'sparkle' }, tone: 'good' }; } return { text: 'Thuyền lật giữa dòng nước xiết. Bạn bám được ngọn cây, đội cứu hộ kéo lên sau hai tiếng, người lạnh cóng và bị thương.', effects: { health: -18, happy: -6, karma: 6 }, scene: { loc: 'hospital', anim: 'sick' }, tone: 'bad' }; } },
      { label: '💝 Quyên góp cho bà con vùng lũ (10 triệu)', fn: () => ({ text: 'Bạn chuyển khoản ủng hộ, kèm mấy thùng mì và áo phao gửi đoàn từ thiện. Nhà bạn ở chỗ cao nên không sao.', effects: { money: -1e7, karma: 8, happy: 3 }, scene: { loc: 'home', anim: 'phone', fx: 'hearts' }, tone: 'good' }) },
    ] });
  ms({ id: 'ms_dis_ngap', title: 'Triều cường ngập phố', icon: '🌧️', age: [6, 120],
    text: 'Mưa lớn trùng đỉnh triều cường, cả con đường thành sông. Xe máy chết máy nằm la liệt, nước tràn vào nhà.',
    scene: { loc: 'street', weather: 'rain', anim: 'facepalm', npcs: [{ role: 'neighbor', anim: 'walk' }] },
    choices: [
      { label: '🛵 Dắt xe lội nước về, sửa xe sau', fn: () => ({ text: 'Bạn lội nước ngang đùi dắt xe về. Xe vào nước phải thay nhớt, súc máy hết 1,5 triệu. Hôm sau còn bị cảm.', effects: { money: -1.5e6, health: -3, happy: -3 }, scene: { loc: 'street', weather: 'rain', anim: 'walk' }, tone: 'neutral' }) },
      { label: '🧱 Xây bờ chắn, nâng nền nhà (40 triệu)', fn: () => ({ text: 'Bạn thuê thợ nâng nền, xây bậc chắn nước. Từ năm sau, cả xóm ngập còn nhà bạn khô ráo.', effects: { money: -4e7, happy: 3 }, scene: { loc: 'home', anim: 'nod' }, tone: 'good' }) },
    ] });
  ms({ id: 'ms_dis_han', title: 'Hạn mặn miền Tây', icon: '🏜️', age: [6, 120],
    text: 'Nước mặn xâm nhập sâu chưa từng thấy. Ruộng lúa cháy vàng, vườn sầu riêng héo lá, nước máy có vị mặn chát.',
    scene: { loc: 'countryside', time: 'day', anim: 'sad', fx: 'dust', npcs: [{ role: 'neighbor', anim: 'shake' }] },
    choices: [
      { label: '🛢️ Mua bồn trữ nước ngọt, máy lọc (8 triệu)', fn: () => ({ text: 'Bạn lắp bồn 2 khối và máy lọc RO, chia nước ngọt cho mấy nhà hàng xóm có người già.', effects: { money: -8e6, karma: 4, happy: 1 }, scene: { loc: 'home', anim: 'nod' }, tone: 'good' }) },
      { label: '😮‍💨 Cầm cự qua mùa khô', fn: () => ({ text: 'Cả nhà dùng nước tiết kiệm từng gáo, mua nước bình để nấu ăn. Mùa khô năm ấy dài như cả năm.', effects: { money: -3e6, happy: -4, health: -2 }, scene: { loc: 'countryside', anim: 'sad' }, tone: 'bad' }) },
    ] });
  ms({ id: 'ms_dis_ret', title: 'Rét đậm rét hại', icon: '🥶', age: [6, 120],
    text: 'Đợt rét đậm kéo dài hai tuần, nhiệt độ xuống 6 độ. Trường cho học sinh nghỉ, bệnh viện kín người già viêm phổi.',
    scene: { loc: 'street', time: 'dawn', weather: 'fog', anim: 'sad', npcs: [{ role: 'neighbor', anim: 'walk' }] },
    choices: [
      { label: '🧥 Mua máy sưởi, áo ấm cho cả nhà (4 triệu)', fn: () => ({ text: 'Cả nhà quây quần bên máy sưởi, uống trà gừng. Không ai ốm.', effects: { money: -4e6, happy: 2 }, scene: { loc: 'home', anim: 'sit', time: 'night' }, tone: 'good' }) },
      { label: '🥶 Cố chịu, mặc thêm áo', fn: () => ({ text: 'Bạn mặc ba lớp áo vẫn run cầm cập. Cuối đợt rét bạn bị viêm họng nặng.', effects: { health: P().age >= 60 ? -10 : -4, happy: -3 }, scene: { loc: 'bedroom', anim: 'sick' }, tone: 'bad' }) },
      { label: '🍲 Nấu cháo phát cho người vô gia cư', fn: () => ({ text: 'Tối nào bạn cũng nấu một nồi cháo lớn mang ra gầm cầu. Nhiều người nắm tay bạn cảm ơn không nói nên lời.', effects: { money: -2e6, karma: 8, happy: 4 }, scene: { loc: 'street', time: 'night', anim: 'hug', fx: 'hearts' }, tone: 'good' }) },
    ] });
  ms({ id: 'ms_dis_nong', title: 'Nắng nóng kỷ lục', icon: '🔥', age: [6, 120],
    text: 'Nhiệt độ ngoài trời 41 độ. Điện cắt luân phiên, đêm nào cũng nóng như lò bát quái.',
    scene: { loc: 'street', time: 'day', anim: 'facepalm', fx: 'sparkle' },
    choices: [
      { label: '❄️ Lắp điều hoà (12 triệu)', fn: () => ({ text: 'Bạn lắp điều hoà inverter. Cả nhà ngủ ngon, chỉ có hoá đơn điện là “nóng”.', effects: { money: -1.2e7, happy: 4, health: 2 }, scene: { loc: 'bedroom', anim: 'sit' }, tone: 'good' }) },
      { label: '🌳 Ra công viên hóng gió, uống nhiều nước', fn: () => ({ text: 'Tối nào cả xóm cũng ra công viên trải chiếu. Bạn quen thêm vài người hàng xóm mới.', effects: { happy: 1, health: -2 }, scene: { loc: 'park', time: 'night', anim: 'sit' }, tone: 'neutral' }) },
    ] });
  ms({ id: 'ms_dis_salo', title: 'Sạt lở đất', icon: '⛰️', age: [6, 120],
    text: 'Mưa lớn nhiều ngày, sườn đồi sau nhà nứt một đường dài. Đêm qua có tiếng đất đá lăn rào rào.',
    scene: { loc: 'countryside', weather: 'rain', time: 'dusk', anim: 'scared', expr: 'scared', shot: 'dramatic' },
    choices: [
      { label: '🚚 Dọn đi ngay trong đêm', fn: () => ({ text: 'Bạn thuê xe chở đồ đi trong đêm. Hai hôm sau, cả mảng đồi đổ sập lên căn nhà cũ. Mất nhà, nhưng còn người.', effects: { money: -homeLoss(3e7), happy: -8 }, scene: { loc: 'street', time: 'night', anim: 'walk', weather: 'rain' }, tone: 'bad' }) },
      { label: '🏠 Chờ thêm xem sao', fn: () => Math.random() < 0.5 ? { text: 'Trời tạnh, vết nứt không rộng thêm. Bạn thở phào, gọi người đến kè lại sườn đồi.', effects: { money: -1.5e7, happy: -2 }, scene: { loc: 'home', anim: 'nod' }, tone: 'neutral' } : { text: 'Nửa đêm đất trượt, tường sau đổ sập. Bạn kịp chạy ra nhưng bị đá đè gãy chân, nhà hư hỏng nặng.', effects: { money: -homeLoss(5e7), health: -20, happy: -12 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' }, tone: 'bad' } },
    ] });
  ms({ id: 'ms_dis_dich', title: 'Dịch bệnh bùng phát', icon: '🦠', age: [6, 120],
    text: 'Một loại virus mới lây lan nhanh. Thành phố giãn cách, trường học đóng cửa, ai cũng đeo khẩu trang.',
    scene: { loc: 'home', anim: 'phone', time: 'night' },
    choices: [
      { label: '💉 Tiêm vắc-xin sớm, ở nhà làm việc', fn: () => ({ text: 'Bạn tiêm đủ mũi, làm việc online. Chỉ hơi buồn chán vì không được gặp ai.', effects: { happy: -4, money: -1e6 }, scene: { loc: 'bedroom', anim: 'phone' }, tone: 'neutral' }) },
      { label: '🙈 Kệ, vẫn đi chơi bình thường', fn: () => Math.random() < 0.55 ? { text: 'Bạn dính bệnh, sốt cao một tuần, ho kéo dài cả tháng. Cả nhà cũng bị lây.', effects: { health: P().age >= 60 ? -20 : -10, happy: -6, rel: { all: -3 } }, scene: { loc: 'hospital', anim: 'sick' }, tone: 'bad' } : { text: 'May mắn bạn không bị nhiễm. Nhưng cả xóm nhìn bạn bằng ánh mắt không mấy thiện cảm.', effects: { happy: 1, karma: -3 }, scene: { loc: 'street', anim: 'shrug' }, tone: 'neutral' } },
      { label: '🧑‍⚕️ Đăng ký làm tình nguyện viên tuyến đầu', fn: () => ({ text: 'Bạn khoác bộ đồ bảo hộ trắng, đi phát thực phẩm và hỗ trợ xét nghiệm. Mệt nhoài nhưng thấy đời mình có ích.', effects: { karma: 12, happy: 4, health: -4 }, scene: { loc: 'hospital', anim: 'nod', fx: 'sparkle' }, tone: 'good' }) },
    ] });
  ms({ id: 'ms_tranhchap', title: 'Anh em tranh chấp thừa kế', icon: '⚖️', age: [16, 99],
    text: 'Giỗ đầu bố mẹ chưa xong, anh chị em đã gửi đơn ra toà: di chúc không công bằng, đòi chia lại toàn bộ tài sản.',
    scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'sibling', anim: 'angry', say: 'Phải chia lại cho công bằng!' }], fx: 'anger', shot: 'dramatic' },
    choicesFn: () => ['chia', 'toa', 'lo'].map(tranhchapChoice), choiceByKey: tranhchapChoice });
  function batcocChoice(k) {
    const m = richMoney(), ransom = Math.round(Math.max(2e9, m * 0.15) / 1e8) * 1e8;
    if (k === 'tra') return { key: k, label: '💰 Trả tiền chuộc (' + fmtMoney(ransom) + ')', fn: () => ({ text: 'Người nhà chuyển đủ tiền. Ba ngày sau bạn được thả ở một bãi đất trống ngoại thành, người đầy vết thâm. Từ đó bạn thuê vệ sĩ đi theo 24/24.', effects: { money: -ransom - 6e8, happy: -12, health: -6 }, scene: { loc: 'countryside', time: 'night', anim: 'scared', fx: 'tears' }, tone: 'bad' }) };
    const p = U.clamp(0.38 + (S.stats.health - 50) / 200 + karmaLuck(), 0.15, 0.7);
    return { key: 'tron', label: '🏃 Liều tìm cách trốn thoát', mini: 'sneak', odds: () => p,
      fn: () => miniWin(p) ? { text: 'Đêm thứ hai, bạn cạy được dây trói, trèo qua cửa sổ rồi chạy một mạch ra quốc lộ. Bọn bắt cóc bị bắt ngay tuần sau. Báo chí gọi bạn là “cậu ấm gan dạ”.', effects: { happy: 6, health: -5, followers: 0.05 }, scene: { loc: 'street', time: 'night', anim: 'run', fx: 'exclaim' }, tone: 'good' }
        : { text: 'Bạn bị phát hiện giữa chừng. Trận đòn hôm đó khiến bạn nằm viện cả tháng, và gia đình vẫn phải trả tiền chuộc gấp rưỡi.', effects: { money: -Math.round(ransom * 1.5), health: -25, happy: -15 }, scene: { loc: 'hospital', anim: 'sick', fx: 'tears' }, tone: 'bad' } };
  }
  ms({ id: 'ms_batcoc', title: 'Bị bắt cóc tống tiền', icon: '🚐', age: [12, 80],
    text: 'Một chiếc xe 7 chỗ dán kính đen ép sát. Mấy gã bịt mặt lôi bạn lên xe. Chúng biết rõ bạn là ai, và biết nhà bạn có bao nhiêu tiền.',
    scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Lên xe! Im mồm!' }], fx: 'exclaim', shot: 'dramatic' },
    choicesFn: () => ['tra', 'tron'].map(batcocChoice), choiceByKey: batcocChoice });
  const coMini = (c) => ({ quan: 'cook', thoitrang: 'cook', phanmem: 'interview', ai: 'interview', xnk: 'haggle', batdongsan: 'haggle', xaydung: 'interview', phongkham: 'cpr', trungtam: 'quiz', nhahang: 'cook', vanphongluat: 'interview', salon: 'interview', studio_tk: 'quiz', lu_hanh: 'haggle', hocvien_tt: 'interview', agency: 'interview', trangtrai: 'haggle' }[c.ind] || 'interview');
  const coP = (base) => U.clamp(base + (S.stats.smarts - 50) / 150 + karmaLuck(), 0.1, 0.9);
  function coChoice(k) {
    const c = S.company; if (!c) return { key: k, label: '—', fn: () => ({ text: 'Công ty không còn nữa.' }) };
    const ind = coInd(c.ind);
    if (k === 'grow') {
      const cost = Math.round(c.val * 0.12 / 1e6) * 1e6, p = coP(0.45);
      return { key: k, label: '📈 Mở rộng: thêm chi nhánh, tuyển người (' + fmtMoney(cost) + ')', req: { minMoney: cost }, mini: coMini(c), odds: () => p,
        fn: () => { if (miniWin(p)) { c.val = Math.round(c.val * 1.35); c.boost = 0.05; return { text: 'Chi nhánh mới đông khách ngay tuần đầu. ' + c.name + ' tăng định giá lên ' + fmtMoney(c.val) + '.', effects: { money: -cost, happy: 6 }, scene: { loc: ind.loc, anim: 'cheer', fx: 'money' }, tone: 'good' }; }
          c.val = Math.round(c.val * 0.92); return { text: 'Mở rộng quá nhanh, quản lý không xuể, chi nhánh mới lỗ triền miên. Tiền đổ vào coi như mất.', effects: { money: -cost, happy: -5 }, scene: { loc: ind.loc, anim: 'facepalm', fx: 'sweat' }, tone: 'bad' }; } };
    }
    if (k === 'raise') {
      const p = coP(0.5);
      return { key: k, label: '🤝 Gọi vốn nhà đầu tư (bán 20% cổ phần)', mini: 'haggle', odds: () => p,
        fn: () => { if (miniWin(p)) { c.val = Math.round(c.val * 1.4); c.own = Math.round(c.own * 0.8 * 100) / 100; c.boost = 0.08; return { text: 'Quỹ đầu tư rót vốn, định giá ' + c.name + ' vọt lên ' + fmtMoney(c.val) + '. Bạn còn nắm ' + Math.round(c.own * 100) + '% cổ phần.', effects: { happy: 7 }, scene: { loc: 'office', anim: 'cheer', fx: 'money' }, tone: 'good' }; }
          return { text: 'Nhà đầu tư lắc đầu: “Mô hình chưa thuyết phục.” Bạn ra về tay trắng.', effects: { happy: -4 }, scene: { loc: 'office', anim: 'sad' }, tone: 'bad' }; } };
    }
    if (k === 'ipo') {
      const p = coP(0.45);
      return { key: k, label: '🔔 Niêm yết lên sàn chứng khoán', mini: 'stock', odds: () => p,
        fn: () => { if (miniWin(p)) { c.val = Math.round(c.val * 1.8); c.listed = true; c.lv = 5; S.counters.ipo = (S.counters.ipo || 0) + 1; return { text: 'Tiếng cồng khai trương phiên giao dịch đầu tiên. Cổ phiếu ' + c.name + ' tăng trần ba phiên liền. Bạn chính thức vào danh sách người giàu nhất sàn chứng khoán.', effects: { happy: 12, followers: 0.2 }, scene: { loc: 'office', anim: 'cheer', fx: ['fireworks', 'money'] }, tone: 'milestone' }; }
          c.val = Math.round(c.val * 0.85); return { text: 'Phiên chào sàn ảm đạm, cổ phiếu giảm sàn ngay ngày đầu. Báo chí gọi đó là “màn IPO thảm họa”.', effects: { happy: -8 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }; } };
    }
    if (k === 'sell') {
      const get = Math.round(c.val * c.own * 0.9 / 1e6) * 1e6;
      return { key: k, label: '🏷️ Bán công ty, nhận ' + fmtMoney(get), fn: () => { const nm = c.name; S.company = null; return { text: 'Bạn ký hợp đồng bán ' + nm + '. Tiền về tài khoản: ' + fmtMoney(get) + '. Một chương đời khép lại.', effects: { money: get, happy: 4 }, scene: { loc: 'office', anim: 'bow', fx: 'money' }, tone: 'good' }; } };
    }
    return { key: 'steady', label: '🛡️ Giữ nhịp an toàn, chăm khách cũ', fn: () => { c.val = Math.round(c.val * 1.03); return { text: 'Bạn giữ công ty chạy đều, không mạo hiểm. Nhân viên gắn bó, khách quen quay lại.', effects: { happy: 2 }, scene: { loc: ind.loc, anim: 'nod' } }; } };
  }
  ms({ id: 'ms_company', title: 'Quyết định của giám đốc', icon: '🏢', age: [20, 99],
    text: 'Cuối năm, kế toán đặt bản báo cáo lên bàn bạn. Công ty đang ở ngã rẽ: mạnh tay hay giữ nhịp?',
    scene: { loc: 'office', anim: 'think', npcs: [{ role: 'coworker', anim: 'talk', say: 'Sếp quyết đi ạ.' }], fx: 'idea' },
    choicesFn: () => { const c = S.company; if (!c) return [coChoice('steady')]; const ks = ['grow', 'steady']; if (c.lv >= 1 && c.own > 0.45) ks.push('raise'); if (c.lv >= 4 && !c.listed) ks.push('ipo'); ks.push('sell'); return ks.map(coChoice); },
    choiceByKey: coChoice });
  ms({ id: 'ms_co_crisis', title: 'Công ty khủng hoảng', icon: '📉', age: [20, 99],
    text: 'Ba năm thua lỗ liên tiếp, nhà cung cấp đòi nợ, nhân viên lục tục xin nghỉ. Ngân hàng gửi thư nhắc nợ lần cuối.',
    scene: { loc: 'office', anim: 'facepalm', npcs: [{ role: 'boss', anim: 'angry', say: 'Bao giờ trả nợ?' }], fx: 'sweat', shot: 'dramatic' },
    choicesFn: () => ['save', 'restructure', 'bankrupt'].map(crisisChoice), choiceByKey: crisisChoice });
  function crisisChoice(k) {
    const c = S.company;
    if (!c) return { key: k, label: '—', fn: () => ({ text: 'Mọi chuyện đã qua.' }) };
    if (k === 'save') { const cost = Math.round(Math.max(c.val * 0.3, coInd(c.ind).cost * 0.3) / 1e6) * 1e6, p = coP(0.4); return { key: k, label: '💸 Bơm tiền cứu công ty (' + fmtMoney(cost) + ')', req: { minMoney: cost }, mini: coMini(c), odds: () => p, fn: () => { c.bad = 0; if (miniWin(p)) { c.val = Math.round(c.val * 1.6 + cost); return { text: 'Bạn dồn hết vốn liếng, tự mình đi gặp từng khách hàng lớn. Công ty sống lại, năm sau bắt đầu có lãi.', effects: { money: -cost, happy: 6 }, scene: { anim: 'cheer' }, tone: 'good' }; } return { text: 'Tiền đổ vào như muối bỏ biển. Công ty vẫn thoi thóp.', effects: { money: -cost, happy: -8 }, scene: { anim: 'cry' }, tone: 'bad' }; } }; }
    if (k === 'restructure') return { key: k, label: '✂️ Tái cấu trúc, cắt giảm một nửa nhân sự', fn: () => { c.bad = 0; c.val = Math.round(c.val * 0.85); c.boost = 0.04; return { text: 'Bạn phải tự tay nói lời chia tay với những người đã gắn bó nhiều năm. Công ty gọn lại, đứng vững được.', effects: { happy: -6, karma: -2 }, scene: { anim: 'sad' } }; } };
    return { key: 'bankrupt', label: '📄 Tuyên bố phá sản', fn: () => { const nm = c.name; S.company = null; return { text: nm + ' chính thức phá sản. Tấm biển công ty được tháo xuống. Bạn mất trắng, nhưng ít ra không còn nợ.', effects: { happy: -15 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }; } };
  }

  // ------------------------------------------------------------------ nhà tù & giang hồ
  function sendToJail(years, reason) {
    years = Math.max(1, Math.round(years));
    S.jail = { until: S.year + years, since: S.year, total: years, reason: reason || 'phạm tội' };
    S.flags.tienan = S.year; S.flags.truyna = 0;
    if (S.job) S.job = null;
    if (S.edu.inSchool) { S.edu.inSchool = false; S.edu.dropped = true; }
    alive('partner').forEach((p) => { if (Math.random() < 0.45) p.role = 'ex'; });
    alive('lover').forEach((p) => (p.role = 'ex'));
    addLog('⛓️ Bạn bị kết án ' + years + ' năm tù vì ' + reason + '.', 'bad', '⛓️');
  }
  function jailYear(L, deltas) {
    const j = S.jail;
    if (!j) {
      // đang bị truy nã: mỗi năm có thể bị phát hiện
      if (S.flags.truyna && Math.random() < 0.3) queueMilestone('ms_truyna');
      return;
    }
    if (j.camp) return campYear(L, deltas);
    if (S.year >= j.until) { S.jail = null; L('🔓 Bạn mãn hạn tù sau ' + (S.year - j.since) + ' năm. Cánh cổng trại giam mở ra, nắng chói chang. Bạn hít một hơi thật sâu.', 'milestone', '🔓'); addStat('happy', 10, deltas); return; }
    addStat('happy', -U.rand(3, 7), deltas); addStat('health', -U.rand(0, 2), deltas); addStat('karma', 1, deltas);
    L('⛓️ Năm thứ ' + (S.year - j.since) + '/' + j.total + ' trong trại giam.', 'bad', '⛓️');
    queueMilestone('ms_jail');
  }
  function gangYear(L, deltas) {
    if (!S.job || S.job.id !== 'giangho') return;
    addStat('karma', -U.rand(1, 4), deltas);
    const lv = S.job.level;
    // dân giang hồ năm nào cũng phải ra tay: ép ít nhất một trận đánh nhau
    const FIGHTS = ['s_gh_hon_chien', 's_gh_phuc_kich', 's_gh_dam_cuoi', 's_gh_vo_duong', 's_gh_bao_ke'].concat(lv >= 1 ? ['s_gh_solo', 's_gh_cuu_em', 's_gh_dia_ban'] : []);
    const fresh = FIGHTS.filter((id) => S.usedEvents[id] !== S.year - 1 && !S.forced.some((f) => (f.id || f) === id));
    if (fresh.length && Math.random() < 0.85) S.forced.push({ id: U.pick(fresh), at: S.year });
    if (Math.random() < 0.05 + lv * 0.03) {
      const y = 2 + lv * 2 + U.randi(0, 2);
      L('🚨 Công an triệt phá băng nhóm. Bạn bị bắt ngay tại ổ.', 'bad', '🚨');
      sendToJail(y, lv >= 3 ? 'cầm đầu băng nhóm tội phạm' : 'tham gia băng nhóm gây rối trật tự');
      addStat('happy', -10, deltas);
    }
  }
  function jailChoice(k) {
    const j = S.jail;
    if (k === 'good') { const p = U.clamp(0.35 + S.karma / 200, 0.2, 0.85); return { key: k, label: '🙏 Cải tạo tốt, xin giảm án', odds: () => p, fn: () => { if (j && miniWin(p)) { j.until = Math.max(S.year + 1, j.until - 1); return { text: 'Bạn chấp hành nghiêm, được ghi nhận “cải tạo tốt”. Hội đồng xét giảm cho bạn một năm án.', effects: { karma: 4, happy: 4 }, scene: { anim: 'nod' }, tone: 'good' }; } return { text: 'Bạn cố gắng, nhưng đợt xét giảm án năm nay chưa có tên bạn.', effects: { karma: 2 }, scene: { anim: 'sad' } }; } }; }
    if (k === 'learn') return { key: k, label: '🔧 Học nghề trong trại (mộc, may, điện)', fn: () => { S.flags.hocnghe_tu = S.year; return { text: 'Bạn học nghề mộc với một bạn tù lớn tuổi. Đôi tay quen dần với cái bào, cái đục. Ra tù, ít nhất có nghề kiếm sống.', effects: { smarts: 3, happy: 2 }, scene: { anim: 'lift' } }; } };
    if (k === 'fight') { const p = U.clamp(0.25 + S.stats.health / 200, 0.2, 0.8); return { key: k, label: '👊 Dằn mặt “đại ca” buồng giam', mini: 'fight', foe: 'gang', odds: () => p, fn: () => { if (miniWin(p)) return { text: 'Bạn hạ gục tay đầu gấu buồng giam. Từ đó chẳng ai dám bắt nạt bạn nữa, nhưng cán bộ ghi thêm một lần vi phạm.', effects: { happy: 4, karma: -3 }, scene: { anim: 'cheer', fx: 'stars' } }; if (j) j.until += 1; return { text: 'Bạn bị cả nhóm đánh hội đồng, nằm trạm xá cả tháng, còn bị cộng thêm một năm án vì gây rối.', effects: { health: -12, happy: -6 }, scene: { anim: 'sick', fx: 'tears' }, tone: 'bad' }; } }; }
    const p = U.clamp(0.2 + S.stats.health / 400 + S.stats.smarts / 400, 0.15, 0.6);
    return { key: 'escape', label: '🌙 Vượt ngục trong đêm', mini: 'sneak', odds: () => p, fn: () => {
      if (miniWin(p)) { const left = j ? j.until - S.year : 2; S.jail = null; S.flags.truyna = S.year; S.flags.truynaLeft = left; return { text: 'Bạn lách qua hàng rào lúc đổi ca gác, chạy xuyên đêm qua cánh đồng. Tự do, nhưng từ giờ tên bạn nằm trong danh sách truy nã.', effects: { happy: 6, karma: -6 }, scene: { loc: 'countryside', time: 'night', anim: 'run', fx: 'dust' }, tone: 'milestone' }; }
      if (j) j.until += 3; return { text: 'Đèn pha rọi thẳng vào bạn giữa bãi đất trống. Bạn bị bắt lại, bị cộng thêm ba năm tù và biệt giam một tháng.', effects: { happy: -10, health: -4 }, scene: { anim: 'sad', fx: 'exclaim' }, tone: 'bad' }; } };
  }
  ms({ id: 'ms_jail', title: 'Một năm sau song sắt', icon: '⛓️', age: [12, 99],
    text: 'Năm nữa trôi qua trong trại giam. Bốn giờ sáng kẻng báo thức, ngày lao động, tối điểm danh. Bạn sẽ sống năm tới thế nào?',
    scene: { loc: 'office', time: 'dawn', anim: 'sit', npcs: [{ role: 'police', anim: 'point', say: 'Điểm danh!' }], fx: 'question' },
    choicesFn: () => ['good', 'learn', 'fight', 'escape'].map(jailChoice), choiceByKey: jailChoice });
  function wantedChoice(k) {
    if (k === 'run') { const p = U.clamp(0.3 + S.stats.health / 250, 0.25, 0.75); return { key: k, label: '🏃 Bỏ chạy, trốn tiếp', mini: 'chase', odds: () => p, fn: () => { if (miniWin(p)) return { text: 'Bạn nhảy qua mấy mái tôn, lẩn vào chợ đông người. Thoát lần này, nhưng không biết còn bao lâu nữa.', effects: { happy: -4 }, scene: { loc: 'market', anim: 'run', fx: 'dust' } }; sendToJail((S.flags.truynaLeft || 2) + 4, 'trốn khỏi nơi giam giữ'); return { text: 'Hai chiến sĩ công an quật ngã bạn ở đầu hẻm. Còng tay lạnh ngắt. Bản án cũ cộng thêm tội trốn trại.', effects: { happy: -12 }, scene: { loc: 'street', anim: 'sad', fx: 'exclaim' }, tone: 'bad' }; } }; }
    return { key: 'surrender', label: '🙇 Ra đầu thú', fn: () => { sendToJail(Math.max(1, (S.flags.truynaLeft || 2) - 1), 'trốn khỏi nơi giam giữ (đã đầu thú)'); return { text: 'Bạn mệt mỏi với cảnh trốn chui trốn nhủi, tự đến công an đầu thú. Nhờ thành khẩn, bạn được giảm nhẹ.', effects: { karma: 6, happy: 2 }, scene: { loc: 'office', anim: 'bow', npcs: [{ role: 'police', anim: 'nod' }] } }; } };
  }
  ms({ id: 'ms_truyna', title: 'Bị nhận ra', icon: '🚨', age: [12, 99],
    text: 'Đang ăn bát phở đầu ngõ, bạn thấy hai chiến sĩ công an nhìn chằm chằm vào mặt mình, rồi lại nhìn tờ giấy trên tay. Tờ lệnh truy nã.',
    scene: { loc: 'street', anim: 'scared', expr: 'scared', npcs: [{ role: 'police', anim: 'point', say: 'Đứng lại!' }], fx: 'exclaim', shot: 'dramatic' },
    choicesFn: () => ['run', 'surrender'].map(wantedChoice), choiceByKey: wantedChoice });

  // ------------------------------------------------------------------ thú cưng nâng cao
  const petSpecies = (p) => D.PET_SPECIES.find((s) => s.id === p.species) || D.PET_SPECIES.find((s) => s.kind === p.kind) || D.PET_SPECIES[0];
  function petShop() {
    if (!S || !S.player) return [];
    const n = alive('pet').length, kidPay = isKid() && parentsBack();
    return D.PET_SPECIES.map((s) => {
      let reason = null;
      if (P().age < 6) reason = 'Từ 6 tuổi';
      else if (n >= 3) reason = 'Nhà đã đủ 3 bé rồi';
      else if (S.jail) reason = 'Đang ngồi tù';
      else if (s.price && !(kidPay && s.price <= 2e6) && s.price > S.money) reason = 'Chưa đủ tiền';
      return { id: s.id, name: s.name, icon: s.icon, desc: s.desc, priceText: s.price ? fmtMoney(s.price) : 'Xin về nuôi', life: s.life, ok: !reason, reason };
    });
  }
  function buyPet(id, name) {
    if (!S || S.dead) return fail('Không thể làm điều này.');
    const o = petShop().find((x) => x.id === id); if (!o) return fail('Không có loài này.'); if (!o.ok) return fail(o.reason);
    const s = D.PET_SPECIES.find((x) => x.id === id), deltas = {};
    if (s.price && !(isKid() && parentsBack() && s.price <= 2e6)) addMoney(-s.price, deltas);
    const p = newPet(s.kind === 'cat' || s.kind === 'dog' ? s.kind : s.kind);
    p.species = s.id; p.skill = 0; p.age = ['fish', 'turtle'].includes(s.kind) ? U.randi(1, 3) : 0;
    if (name && String(name).trim()) p.firstName = String(name).trim().slice(0, 16);
    S.people.push(p); S.counters.pets = (S.counters.pets || 0) + 1; unlock('pet'); addStat('happy', 6, deltas);
    const text = 'Nhà có thêm thành viên mới: ' + s.name.toLowerCase() + ' tên ' + p.firstName + '! ' + s.desc + (s.id === 'carong' ? ' Người ta bảo nuôi cá rồng thì làm ăn phát đạt.' : '');
    addLog('Nuôi ' + s.name.toLowerCase() + ' “' + p.firstName + '”.', 'good', s.icon); checkProgress(); changed();
    return result({ title: s.icon + ' ' + p.firstName, icon: s.icon, text, tone: 'good', deltas, scene: sceneFor('home', { anim: 'cheer', fx: 'hearts', people: s.kind === 'dog' || s.kind === 'cat' ? [{ p, anim: 'jump' }] : [] }) });
  }
  function petDeathRate(x) { const life = petSpecies(x).life; return x.age >= life - 1 ? 0.3 : x.age >= life * 0.75 ? 0.08 : 0.01; }
  function petYear(x) {
    const sp = petSpecies(x);
    if ((x.skill || 0) >= 40 && ['dog', 'cat', 'bird'].includes(sp.kind) && Math.random() < 0.22 && P().age >= 8 && !S.jail) { S.flags.petSkill = x.skill; queueMilestone('ms_pet_contest', { pet: x }); }
    else if (Math.random() < 0.06 && x.age >= 2) queueMilestone('ms_pet_sick', { pet: x });
    else if (['dog', 'cat'].includes(sp.kind) && Math.random() < 0.04) queueMilestone('ms_pet_lost', { pet: x });
    else if (sp.kind === 'bird' && !x.talked && Math.random() < 0.3) { x.talked = true; queueMilestone('ms_pet_parrot', { pet: x }); }
  }
  ms({ id: 'ms_pet_contest', title: 'Cuộc thi thú cưng', icon: '🏅', age: [6, 99],
    text: 'Câu lạc bộ thú cưng thành phố mở cuộc thi tài năng. Bé {pet} nhà bạn giờ đã biết khối trò, hàng xóm ai cũng khuyên đi thi.',
    scene: { loc: 'park', anim: 'point', npcs: [{ role: 'pet', anim: 'jump' }, { role: 'crowd', anim: 'clap' }], fx: 'stars' },
    choices: [
      { label: 'Đăng ký thi, ra lệnh thật chuẩn', odds: () => U.clamp(0.25 + (S.flags.petSkill || 40) / 150, 0.2, 0.9),
        fn: (ctx) => { const p = ctx.get('pet'), pr = U.clamp(0.25 + ((p && p.skill) || 40) / 150, 0.2, 0.9); if (miniWin(pr)) { const prize = U.randi(5, 30) * 1e6; if (p) p.relation = r100(p.relation + 10); return { text: 'Bé ' + (p ? p.firstName : '') + ' trình diễn không sai một nhịp, ẵm giải Nhất! Ảnh hai “thầy trò” lên cả báo địa phương.', effects: { money: prize, happy: 8, followers: 0.02 }, scene: { anim: 'cheer', fx: 'confetti' }, tone: 'good' }; } return { text: 'Đứng trước đám đông, bé ' + (p ? p.firstName : '') + ' sợ quá, quên sạch bài, chạy vòng vòng rồi… tè ra sân. Cả khán đài cười ầm.', effects: { happy: -1 }, scene: { anim: 'facepalm' } }; } },
      { label: 'Thôi, nuôi để thương thôi', text: 'Bạn không cho bé đi thi. Tối đó cả nhà ngồi xem bé làm trò trong phòng khách.', effects: { happy: 2 }, scene: { loc: 'home', anim: 'laugh' } },
    ] });
  ms({ id: 'ms_pet_sick', title: 'Thú cưng ốm', icon: '🩺', age: [3, 99],
    text: 'Mấy hôm nay bé {pet} bỏ ăn, nằm lì một chỗ, mắt lờ đờ. Phòng khám thú y báo giá xét nghiệm và điều trị không hề rẻ.',
    scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'pet', anim: 'sleep' }], fx: 'sick' },
    choices: [
      { label: 'Đưa đi bác sĩ thú y (5 triệu)', req: { minMoney: 5000000 }, text: 'Bác sĩ chẩn đoán kịp thời. Một tuần sau bé lại chạy nhảy tung tăng.', effects: { money: -5000000, happy: 3 }, scene: { loc: 'hospital', anim: 'hug', fx: 'hearts' } },
      { label: 'Chữa mẹo ở nhà', fn: (ctx) => { const p = ctx.get('pet'); if (Math.random() < 0.5) return { text: 'Cháo trứng với vài ngày nghỉ ngơi, bé khỏe lại thật. Hên!', effects: { happy: 2 }, scene: { anim: 'cheer' } }; if (p) { p.alive = false; p.deathYear = S.year; } return { text: 'Bé không qua khỏi. Bạn ôm bé suốt đêm cuối, tự trách mình mãi.', effects: { happy: -10 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }; } },
    ] });
  ms({ id: 'ms_pet_lost', title: 'Thú cưng đi lạc', icon: '🔎', age: [3, 99],
    text: 'Cổng nhà quên đóng, bé {pet} chạy mất từ chiều. Có người thấy bé chạy về phía chợ, nơi đám bắt trộm chó mèo hay lảng vảng.',
    scene: { loc: 'street', anim: 'scared', npcs: [{ role: 'neighbor', anim: 'point', say: 'Nó chạy hướng kia!' }], fx: 'exclaim' },
    choices: [
      { label: 'Chạy đi tìm ngay', mini: 'chase', odds: () => 0.55,
        fn: (ctx) => { const p = ctx.get('pet'); if (miniWin(0.55)) return { text: 'Bạn chạy khắp ba con phố, cuối cùng thấy bé run rẩy dưới gầm xe bán bánh mì. Hai “đứa” ôm nhau như gặp lại sau mười năm.', effects: { happy: 6 }, scene: { anim: 'hug', fx: 'hearts' }, tone: 'good' }; if (p) { p.alive = false; p.gone = true; } return { text: 'Bạn tìm suốt đêm, dán thông báo khắp phường, nhưng bé không bao giờ trở về.', effects: { happy: -12 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }; } },
      { label: 'Đăng tin lên nhóm cư dân, chờ', fn: (ctx) => { const p = ctx.get('pet'); if (Math.random() < 0.45) return { text: 'Hai ngày sau có người nhắn tin: bé đang ở nhà họ, ăn no ngủ kỹ. Bạn mang quà sang cảm ơn.', effects: { happy: 4, money: -500000 }, scene: { anim: 'hug' } }; if (p) { p.alive = false; p.gone = true; } return { text: 'Tin đăng chìm nghỉm. Bé không về nữa.', effects: { happy: -10 }, scene: { anim: 'sad', fx: 'tears' }, tone: 'bad' }; } },
    ] });
  ms({ id: 'ms_pet_parrot', title: 'Con vẹt lắm mồm', icon: '🦜', age: [6, 99],
    text: 'Đang bữa cơm có họ hàng, con vẹt {pet} bỗng nhại y giọng bạn câu nói bạn lỡ buông lúc cáu: “Nhà này toàn người phiền phức!”. Cả mâm cơm đứng hình.',
    scene: { loc: 'home', anim: 'facepalm', npcs: [{ role: 'mother', anim: 'angry' }], fx: 'exclaim' },
    choices: [
      { label: 'Cười trừ: “Nó học trên tivi đấy ạ!”', text: 'Không ai tin, nhưng cả nhà phá lên cười. Từ đó bạn cẩn thận lời ăn tiếng nói hơn trước mặt con vẹt.', effects: { happy: 3, rel: { mother: -2 } }, scene: { anim: 'laugh' } },
      { label: 'Dạy vẹt nói câu khác cho “chữa cháy”', text: 'Một tháng sau, con vẹt chào khách bằng câu “Chúc cả nhà mạnh khỏe!”. Họ hàng thích mê.', effects: { happy: 4, karma: 1 }, scene: { anim: 'point', fx: 'sparkle' } },
    ] });

  // ------------------------------------------------------------------ trang trí nhà
  const decorJoy = () => (S.furn ? Object.values(S.furn).reduce((s, id) => s + ((D.FURNITURE.find((x) => x.id === id) || {}).joy || 0), 0) : 0);
  function furnitureView() {
    if (!S || !S.player) return [];
    const f = S.furn || {};
    return Object.keys(D.FURN_SLOTS).map((slot) => ({ slot, label: D.FURN_SLOTS[slot], current: f[slot] || null,
      items: D.FURNITURE.filter((x) => x.slot === slot).map((x) => { const reason = f[slot] === x.id ? 'Đang dùng' : P().age < 18 ? 'Từ 18 tuổi' : S.jail ? 'Đang ngồi tù' : S.money < x.price ? 'Chưa đủ tiền' : null; return { id: x.id, name: x.name, icon: x.icon, priceText: fmtMoney(x.price), owned: f[slot] === x.id, ok: !reason, reason }; }) }));
  }
  function buyFurniture(id) {
    if (!S || S.dead) return fail('Không thể làm điều này.');
    const it = D.FURNITURE.find((x) => x.id === id); if (!it) return fail('Không có món này.');
    const v = furnitureView().find((s) => s.slot === it.slot).items.find((x) => x.id === id); if (!v.ok) return fail(v.reason);
    S.furn = S.furn || {}; const old = S.furn[it.slot]; S.furn[it.slot] = it.id;
    const deltas = {}; addMoney(-it.price, deltas); addStat('happy', 2 + it.joy * 3, deltas);
    const text = 'Bạn sắm ' + it.name.toLowerCase() + ' cho phòng khách' + (old ? ', thay cho ' + D.FURNITURE.find((x) => x.id === old).name.toLowerCase() : '') + '. Nhìn quanh nhà, thấy ấm cúng hẳn. Khách đến chơi ai cũng khen.';
    addLog('Trang trí nhà: ' + it.name + '.', 'good', it.icon); changed();
    return result({ title: it.icon + ' ' + it.name, icon: it.icon, text, tone: 'good', deltas, scene: sceneFor('home', { anim: 'cheer', fx: 'sparkle', shot: 'wide' }) });
  }

  // ------------------------------------------------------------------ nuôi dạy con
  const SCHOOLS = { cong: { label: 'Trường công', cost: 3e6, bonus: 0.6 }, tu: { label: 'Trường tư thục', cost: 60e6, bonus: 1.4 }, quocte: { label: 'Trường quốc tế', cost: 350e6, bonus: 2.2 } };
  function initChild(x) {
    if (x.smart != null) return;
    const keys = Object.keys(D.CHILD_TRAITS);
    x.trait = x.trait || U.weighted(keys, (k) => (k === 'nangkhieu' ? 0.5 : 1));
    const other = alive('spouse')[0] || alive('partner')[0];
    x.smart = r100(U.clamp((S.stats.smarts + (other ? 55 : 50)) / 2 + U.rand(-15, 15) + D.CHILD_TRAITS[x.trait].smart, 5, 95));
  }
  function childInfo(x) {
    if (x.smart == null) return null;
    const tr = D.CHILD_TRAITS[x.trait] || {};
    return tr.icon + ' ' + tr.label + ' · học lực ' + Math.round(x.smart) + (x.school ? ' · ' + SCHOOLS[x.school].label.toLowerCase() : '') + (x.uni ? ' · đỗ đại học' : '') + (x.fate === 'thanhdat' ? ' · 🌟 thành đạt' : x.fate === 'phagia' ? ' · 💸 phá gia chi tử' : '');
  }
  function childYear(x, L, deltas) {
    initChild(x);
    try { raiseYear(x); adultChildYear(x); } catch (e) { U.warnOnce('raise', 'raise', e); }
    const tr = D.CHILD_TRAITS[x.trait] || {};
    if (x.age >= 6 && x.age <= 18) {
      const sc = SCHOOLS[x.school || 'cong'];
      x.smart = r100(x.smart + sc.bonus + (tr.smart || 0) / 10 + (x.extra ? 0.8 : 0) + U.rand(-1, 1.2));
      if (sc.cost > 3e6) addMoney(-sc.cost, deltas);
      if (x.extra) addMoney(-30e6, deltas);
    }
    if (S.jail) return;
    if (x.age === 6 && !x.school) queueMilestone('ms_child_school', { child: x });
    else if (x.age >= 10 && x.age <= 14 && !x.extraAsked && Math.random() < 0.35) { x.extraAsked = true; queueMilestone('ms_child_extra', { child: x }); }
    else if (x.age >= 13 && x.age <= 17 && !x.teen && Math.random() < 0.3) { x.teen = true; queueMilestone(['noiloan', 'nghich'].includes(x.trait) ? 'ms_child_rebel' : x.trait === 'lamhbieng' ? 'ms_child_game' : 'ms_child_crush', { child: x }); }
    if (x.age === 18 && !x.uniDone) {
      x.uniDone = true; x.uni = x.smart + U.rand(-12, 12) >= 62;
      L(x.uni ? '🎓 Con ' + x.firstName + ' đỗ đại học' + (x.smart >= 85 ? ' với số điểm cao ngất!' : '!') : '📄 Con ' + x.firstName + ' trượt đại học, đi học nghề.', x.uni ? 'milestone' : 'neutral', '🎓');
      if (x.uni) addStat('happy', 6, deltas);
    }
    if (x.age === 27 && !x.fate) {
      const sc = x.smart * 0.5 + x.relation * 0.3 + (x.uni ? 12 : 0) + (tr.fate || 0) + U.rand(-15, 15);
      x.fate = sc >= 72 ? 'thanhdat' : sc < 36 ? 'phagia' : 'binhthuong';
      if (x.fate === 'thanhdat') { L('🌟 Con ' + x.firstName + ' thành đạt: ' + U.pick(['làm giám đốc một công ty lớn', 'thành bác sĩ giỏi', 'mở chuỗi cửa hàng riêng', 'làm kỹ sư ở nước ngoài', 'thành giảng viên đại học']) + '. Bạn tự hào lắm.', 'milestone', '🌟'); addStat('happy', 10, deltas); }
      else if (x.fate === 'phagia') queueMilestone('ms_child_prodigal', { child: x });
    }
    if (x.fate === 'thanhdat' && P().age >= 55 && Math.random() < 0.6) { const g = U.randi(20, 120) * 1e6; addMoney(g, deltas); L('🧧 Con ' + x.firstName + ' gửi biếu bố mẹ ' + fmtMoney(g) + '.', 'good', '🧧'); }
  }
  const kidOf = (ctx) => ctx.get('child') || alive('child')[0] || {};
  function schoolChoice(k) {
    const s = SCHOOLS[k];
    return { key: k, label: { cong: '🏫 Trường công gần nhà (rẻ)', tu: '🏢 Trường tư thục (60 triệu/năm)', quocte: '🌐 Trường quốc tế (350 triệu/năm)' }[k], req: s.cost > 3e6 ? { minMoney: s.cost * 2 } : null,
      fn: (ctx) => { const x = kidOf(ctx); x.school = k; return { text: { cong: 'Con vào trường công gần nhà. Lớp đông, nhưng cô giáo tận tâm.', tu: 'Con vào trường tư: lớp ít người, nhiều hoạt động ngoại khóa. Học phí mỗi năm không nhỏ.', quocte: 'Con vào trường quốc tế: học bằng tiếng Anh, bạn bè khắp thế giới. Hóa đơn học phí làm bạn chóng mặt.' }[k], effects: { happy: 3 }, scene: { loc: 'school', anim: 'wave', npcs: [{ role: 'child', anim: 'wave' }] } }; } };
  }
  ms({ id: 'ms_child_school', title: 'Chọn trường cho con', icon: '🎒', age: [20, 99],
    text: 'Bé {child} sắp vào lớp 1. Cả nhà bàn mãi: trường công gần nhà, trường tư hiện đại, hay trường quốc tế? Trường tốt thì con học giỏi lên, nhưng tiền học phí thì năm nào cũng phải đóng.',
    scene: { loc: 'home', anim: 'think', npcs: [{ role: 'child', anim: 'jump', say: 'Con muốn có nhiều bạn!' }], fx: 'question' },
    choicesFn: () => ['cong', 'tu', 'quocte'].map(schoolChoice), choiceByKey: schoolChoice });
  ms({ id: 'ms_child_extra', title: 'Cho con học thêm?', icon: '✏️', age: [25, 99],
    text: 'Cô giáo gợi ý cho {child} đi học thêm buổi tối. Bên cạnh đó con lại mê vẽ, mê đàn, mê bóng đá…',
    scene: { loc: 'home', anim: 'think', npcs: [{ role: 'child', anim: 'study', expr: 'sleepy' }], fx: 'question' },
    choices: [
      { label: 'Học thêm đủ các môn (30 triệu/năm)', fn: (ctx) => { const x = kidOf(ctx); x.extra = true; x.relation = r100(x.relation - 4); return { text: 'Lịch học kín từ sáng đến tối. Điểm số đi lên, nhưng con ít cười hơn hẳn.', effects: {}, scene: { anim: 'nod', npcs: [{ role: 'child', anim: 'study' }] } }; } },
      { label: 'Cho con theo năng khiếu', fn: (ctx) => { const x = kidOf(ctx); x.talent = true; x.relation = r100(x.relation + 6); if (x.trait === 'nghich') x.trait = 'nangkhieu'; return { text: 'Con đi học vẽ, học đàn, mắt sáng rỡ mỗi lần tan lớp. Có khi con sẽ thành nghệ sĩ cũng nên.', effects: { money: -10000000, happy: 4 }, scene: { anim: 'clap', npcs: [{ role: 'child', anim: 'guitar' }] } }; } },
      { label: 'Để con chơi, tuổi thơ chỉ có một lần', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation + 8); x.smart = r100(x.smart - 2); return { text: 'Con chạy nhảy cả chiều, đen nhẻm mà vui. Điểm số thì… bình thường.', effects: { happy: 3 }, scene: { loc: 'park', anim: 'laugh', npcs: [{ role: 'child', anim: 'run' }] } }; } },
    ] });
  ms({ id: 'ms_child_rebel', title: 'Con bỏ nhà đi', icon: '🚪', age: [28, 99],
    text: 'Sau trận cãi nhau to, {child} xách ba lô bỏ đi lúc nửa đêm, tắt điện thoại. Tuổi mới lớn, cái tôi to hơn cả nhà.',
    scene: { loc: 'street', time: 'night', anim: 'scared', npcs: [], fx: 'exclaim', shot: 'dramatic' },
    choices: [
      { label: 'Đi tìm con khắp nơi', mini: 'chase', odds: () => 0.6,
        fn: (ctx) => { const x = kidOf(ctx); if (miniWin(0.6)) { x.relation = r100(x.relation + 12); if (x.trait === 'noiloan') x.trait = 'nhaycam'; return { text: 'Bạn tìm thấy con ngồi co ro ở quán net đầu phố. Không mắng, bạn chỉ ôm con thật chặt. Con khóc òa.', effects: { happy: 4 }, scene: { anim: 'hug', fx: 'tears', npcs: [{ role: 'child', anim: 'cry' }] }, tone: 'good' }; } x.relation = r100(x.relation - 10); return { text: 'Ba ngày sau con tự về, gầy rộc, không nói một lời. Khoảng cách hai bố/mẹ con xa thêm.', effects: { happy: -6 }, scene: { loc: 'home', anim: 'sad' } }; } },
      { label: 'Chờ con tự về, rồi ngồi nói chuyện như bạn', odds: () => U.clamp(0.4 + S.karma / 200, 0.3, 0.85),
        fn: (ctx) => { const x = kidOf(ctx), p = U.clamp(0.4 + S.karma / 200, 0.3, 0.85); if (miniWin(p)) { x.relation = r100(x.relation + 15); x.trait = 'ngoan'; return { text: 'Con về, bạn nấu món con thích, lắng nghe con kể hết những ấm ức. Từ hôm đó, con mở lòng hơn với bố mẹ.', effects: { happy: 6, karma: 2 }, scene: { loc: 'home', anim: 'hug', fx: 'hearts' }, tone: 'good' }; } x.relation = r100(x.relation - 6); return { text: 'Cuộc nói chuyện lại thành cãi nhau. Con đóng sầm cửa phòng.', effects: { happy: -4 }, scene: { loc: 'home', anim: 'angry' } }; } },
    ] });
  ms({ id: 'ms_child_game', title: 'Con nghiện game', icon: '🎮', age: [28, 99],
    text: '{child} chơi game thâu đêm, bỏ bữa, điểm số tụt dốc. Cô giáo gọi điện lần thứ ba trong tháng.',
    scene: { loc: 'bedroom', time: 'night', anim: 'angry', npcs: [{ role: 'child', anim: 'gamepad', say: 'Đợi con hết trận!' }], fx: 'anger' },
    choices: [
      { label: 'Tịch thu máy, cắt mạng', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation - 12); x.smart = r100(x.smart + 4); return { text: 'Con giận cả tháng không nói chuyện, nhưng điểm số dần hồi phục.', effects: { happy: -2 }, scene: { anim: 'angry' } }; } },
      { label: 'Chơi cùng con, thỏa thuận giờ giấc', mini: 'quiz', odds: () => 0.55, fn: (ctx) => { const x = kidOf(ctx); if (miniWin(0.55)) { x.relation = r100(x.relation + 10); x.smart = r100(x.smart + 3); x.trait = 'ngoan'; return { text: 'Bạn thắng con một ván, đổi lại con hứa chỉ chơi một tiếng mỗi tối. Lần đầu tiên hai bố/mẹ con cười với nhau vì game.', effects: { happy: 5 }, scene: { anim: 'gamepad', fx: 'stars' }, tone: 'good' }; } x.relation = r100(x.relation + 3); return { text: 'Bạn thua con sấp mặt. Con cười, nhưng thỏa thuận thì… không ai giữ.', effects: { happy: 1 }, scene: { anim: 'facepalm' } }; } },
      { label: 'Kệ, lớn rồi tự biết', fn: (ctx) => { const x = kidOf(ctx); x.smart = r100(x.smart - 8); return { text: 'Con tiếp tục cày game. Kỳ thi cuối cấp đến gần mà sách vở vẫn còn nguyên.', effects: {}, scene: { anim: 'shrug' } }; } },
    ] });
  ms({ id: 'ms_child_crush', title: 'Con yêu sớm', icon: '💌', age: [28, 99],
    text: 'Bạn vô tình đọc được tin nhắn trong điện thoại {child}: “Mai đi học sớm, tớ chờ ở cổng trường nhé ❤️”.',
    scene: { loc: 'home', anim: 'phone', npcs: [{ role: 'child', anim: 'scared' }], fx: 'hearts' },
    choices: [
      { label: 'Cấm tuyệt đối, tập trung học', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation - 10); return { text: 'Con khóc, hứa chia tay. Nhưng từ đó con giấu bố mẹ mọi chuyện.', effects: { happy: -2 }, scene: { anim: 'angry' } }; } },
      { label: 'Làm bạn với con, dặn dò khéo léo', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation + 10); return { text: 'Bạn kể chuyện tình đầu của mình hồi xưa, dặn con giữ gìn bản thân và việc học. Con cười, ôm bạn: “Bố/mẹ tâm lý nhất!”', effects: { happy: 4 }, scene: { anim: 'hug', fx: 'hearts' } }; } },
    ] });
  ms({ id: 'ms_child_prodigal', title: 'Phá gia chi tử', icon: '💸', age: [40, 99],
    text: 'Chủ nợ gọi điện tận nhà: {child} nợ cờ bạc hơn một tỷ, hạn trả trong tuần, không thì “đừng trách”. Con quỳ trước mặt bạn khóc lóc xin cứu.',
    scene: { loc: 'home', anim: 'facepalm', npcs: [{ role: 'child', anim: 'cry', say: 'Bố mẹ cứu con!' }, { role: 'thug', anim: 'angry' }], fx: 'money', shot: 'dramatic' },
    choices: [
      { label: 'Bán tài sản trả nợ cho con', req: { minMoney: 1200000000 }, fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation + 6); if (Math.random() < 0.5) x.fate = 'binhthuong'; return { text: 'Bạn trả hết nợ, bắt con hứa bỏ cờ bạc. Có thể con sẽ đổi, có thể không, nhưng con vẫn là con.', effects: { money: -1200000000, happy: -8 }, scene: { anim: 'sad', fx: 'money' } }; } },
      { label: 'Để con tự chịu trách nhiệm', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation - 25); return { text: 'Bạn lắc đầu. Con bỏ trốn khỏi thành phố. Nhiều năm sau mới nghe tin con làm thuê ở miền Nam, sống tạm ổn.', effects: { happy: -10 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }; } },
      { label: 'Báo công an xử lý chủ nợ', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100(x.relation - 5); return { text: 'Đường dây cho vay nặng lãi bị triệt phá. Con thoát nợ, nhưng cũng phải ra tòa vì tội đánh bạc, chịu án treo.', effects: { happy: -6, karma: 3 }, scene: { anim: 'nod', npcs: [{ role: 'police', anim: 'talk' }] } }; } },
    ] });

  // ------------------------------------------------------------------ gia phả & đồ gia truyền
  const HEIRLOOMS = [
    { id: 'huanchuong', name: 'Huân chương kháng chiến', icon: '🎖️', bonus: { karma: 4 }, desc: 'Con cháu lớn lên với niềm tự hào', cond: (s) => s.flags.veteran },
    { id: 'olympic', name: 'Huy chương vàng Olympic', icon: '🥇', bonus: { smarts: 4 }, desc: 'Con cháu ham học', cond: (s) => s.flags.olympic_vang },
    { id: 'tusach', name: 'Tủ sách giáo sư', icon: '📚', bonus: { smarts: 5 }, desc: 'Cả nhà mê đọc sách', cond: (s) => s.flags.giaosu || s.flags.phd },
    { id: 'nhathoho', name: 'Nhà thờ họ', icon: '⛩️', bonus: { karma: 5, happy: 3 }, desc: 'Dòng họ có nơi tụ họp', cond: (s) => s.flags.nhathoho },
    { id: 'gaytruc', name: 'Gậy trúc trăm tuổi', icon: '🦯', bonus: { health: 5 }, desc: 'Gen sống thọ', cond: (s) => s.player && s.player.age >= 95 },
    { id: 'ketsat', name: 'Két sắt gia truyền', icon: '💰', bonus: { happy: 3 }, desc: 'Dòng họ có của ăn của để', cond: (s) => s.money + assetsValue(s) >= 100e9 },
    { id: 'cupvang', name: 'Cúp vàng nghệ thuật', icon: '🏆', bonus: { looks: 4 }, desc: 'Dòng máu nghệ sĩ', cond: (s) => s.job && D.CAREERS[s.job.id] && D.CAREERS[s.job.id].fame && s.job.level >= D.CAREERS[s.job.id].levels.length - 1 },
    { id: 'sotay', name: 'Cuốn sổ tay của ông bà', icon: '📔', bonus: { karma: 2, smarts: 2 }, desc: 'Lời dạy truyền đời', cond: (s) => s.karma >= 85 },
  ];
  function heirloomsOf(st) { return (st.heirlooms || []).map((id) => HEIRLOOMS.find((h) => h.id === id)).filter(Boolean); }
  ms({ id: 'ms_nhathoho', title: 'Xây nhà thờ họ', icon: '⛩️', age: [45, 95],
    text: 'Các cụ trong họ họp bàn: dòng họ chưa có nhà thờ để con cháu tụ về mỗi dịp giỗ chạp. Ai cũng nhìn về phía bạn, người thành đạt nhất họ.',
    scene: { loc: 'temple', anim: 'think', npcs: [{ role: 'relative', gender: 'm', age: 75, anim: 'talk', say: 'Trông cả vào cháu đấy.' }, { role: 'crowd', anim: 'idle' }], fx: 'question' },
    choices: [
      { label: 'Bỏ tiền xây nhà thờ họ (2 tỷ)', req: { minMoney: 2000000000 }, text: 'Ngày khánh thành, con cháu khắp nơi tụ về, hương khói nghi ngút. Tên bạn được khắc trên bia công đức. Nhà thờ họ sẽ là của để lại cho muôn đời sau.', effects: { money: -2000000000, karma: 8, happy: 10, flag: 'nhathoho' }, scene: { anim: 'pray', fx: ['sparkle', 'petals'] } },
      { label: 'Góp một phần, để cả họ cùng góp', text: 'Bạn góp một khoản kha khá. Nhà thờ họ xây chậm hơn, nhưng là của chung cả họ.', effects: { money: -300000000, karma: 4, happy: 3 }, scene: { anim: 'nod' } },
    ] });
  function familyTree() {
    const lives = (meta.lives || []).slice().reverse(); // cũ → mới
    const map = new Map();
    lives.forEach((l) => { const k = l.dyn || 'x_' + (l.fullName || '') + l.born; if (!map.has(k)) map.set(k, []); map.get(k).push(l); });
    if (S && S.player && !S.dead) { const k = S.dyn || 'now'; if (!map.has(k)) map.set(k, []); map.get(k).push({ fullName: fullName(P()), born: S.born, died: null, age: P().age, generation: S.generation, gender: P().gender, job: occupation(), living: true, heirlooms: (S.heirlooms || []).slice() }); }
    return Array.from(map.entries()).map(([dyn, ls]) => {
      ls.sort((a, b) => (a.generation || 1) - (b.generation || 1));
      const last = ls[ls.length - 1];
      return { dyn, surname: (last.fullName || '').split(' ')[0], city: last.cityName || '', gens: ls.length, total: ls.reduce((s, l) => s + (l.score || 0), 0), heirlooms: (last.heirlooms || []).map((id) => HEIRLOOMS.find((h) => h.id === id)).filter(Boolean).map((h) => ({ name: h.name, icon: h.icon, desc: h.desc })), lives: ls, latest: Math.max(...ls.map((l) => l.died || 9999)) };
    }).sort((a, b) => b.latest - a.latest);
  }

  // ------------------------------------------------------------------ luân hồi theo nghiệp
  const REBIRTH = {
    phuclon: { label: 'Phúc lớn', icon: '🌟', desc: 'Kiếp trước sống tử tế: đầu thai vào nhà khá giả, sáng dạ, khỏe mạnh, đẹp người. Tròn 18 tuổi được bố mẹ cho 2 tỷ lập nghiệp.', stat: 12, karma: 70, gift: 2e9 },
    cophuc: { label: 'Có phúc', icon: '🍀', desc: 'Kiếp trước ăn ở được: gia đình êm ấm, chỉ số khởi đầu tốt hơn. Tròn 18 tuổi được cho 300 triệu.', stat: 6, karma: 60, gift: 3e8 },
    binhthuong: { label: 'Bình thường', icon: '⚖️', desc: 'Nghiệp nào trả nấy, kiếp này khởi đầu như bao người.', stat: 0, karma: 50, gift: 0 },
    nghiepnhe: { label: 'Nghiệp nhẹ', icon: '🌧️', desc: 'Kiếp trước còn nợ: sinh ra thiếu thốn, chỉ số khởi đầu thấp hơn. Sống tốt để trả nghiệp.', stat: -8, karma: 40, gift: 0 },
    nghiepnang: { label: 'Nghiệp nặng', icon: '⛓️', desc: 'Kiếp trước gây nhiều tội lỗi: phải đầu thai làm con vật một kiếp ngắn để trả nghiệp, rồi mới được làm người.', stat: -4, karma: 45, gift: 0 },
  };
  function rebirthPreview() {
    if (!S || !S.dead) return null;
    const k = S.karma, tier = k >= 85 ? 'phuclon' : k >= 65 ? 'cophuc' : k >= 40 ? 'binhthuong' : k >= 20 ? 'nghiepnhe' : 'nghiepnang';
    if (!S.dead.animal) S.dead.animal = U.pick(['cho', 'trau', 'ga']); // cố định để màn hình không đổi mỗi lần vẽ lại
    return Object.assign({}, REBIRTH[tier], { tier, karma: Math.round(k), animal: tier === 'nghiepnang' ? S.dead.animal : null, past: { name: fullName(P()), born: S.born, died: S.year, city: D.cityName(S.city), cause: S.dead.cause, job: S.job ? D.CAREERS[S.job.id].title : '' } });
  }
  function applyRebirth(rb) {
    const R = REBIRTH[rb.tier] || REBIRTH.binhthuong;
    ['health', 'smarts', 'looks'].forEach((k) => (S.stats[k] = r100(U.clamp(S.stats[k] + R.stat + U.rand(-3, 3), 5, 100))));
    S.karma = R.karma; S.flags.past = rb.past || null; S.flags.rebirthTier = rb.tier; if (R.gift) S.flags.rebirthGift = R.gift;
    meta.reborn = (meta.reborn || 0) + 1;
    if (rb.past) addLog('♻️ ' + R.icon + ' ' + R.label + ': bạn là kiếp sau của ' + rb.past.name + ' (' + rb.past.born + '–' + rb.past.died + ')' + (rb.animal ? ', sau một kiếp làm ' + ({ cho: 'chó', trau: 'trâu', ga: 'gà' }[rb.animal] || 'con vật') + ' để trả nghiệp' : '') + '.', 'milestone', '♻️');
  }
  function pastChoice(k) {
    const pst = S.flags.past || {};
    if (k === 'tell') return { key: k, label: '🗣️ Kể hết cho bố mẹ nghe', fn: () => ({ text: 'Bạn bi bô: “Hồi trước con tên là ' + pst.name + ', con sống ở ' + pst.city + ', con ' + (pst.job ? 'làm ' + pst.job.toLowerCase() : 'già lắm rồi') + '…” Bố mẹ nhìn nhau rợn tóc gáy, rồi bật cười: “Thằng/con bé này mơ ngủ à?”', effects: { happy: 3, smarts: 2 }, scene: { anim: 'talk', npcs: [{ role: 'mother', anim: 'scared' }] } }) };
    return { key: 'forget', label: '🌙 Ngủ một giấc, quên dần', fn: () => ({ text: 'Những hình ảnh mơ hồ về ' + pst.name + ' nhạt dần theo từng giấc ngủ. Lớn lên, bạn chỉ thỉnh thoảng thấy quen quen khi đi qua ' + pst.city + '.', effects: { happy: 1 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } }) };
  }
  ms({ id: 'ms_tienkiep', title: 'Ký ức tiền kiếp', icon: '♻️', age: [3, 7],
    text: 'Tối nay trước khi ngủ, bạn bỗng nhớ ra rất rõ: một cái tên khác, một thành phố khác, một cuộc đời khác. Mẹ hỏi sao con cứ ngồi thẫn thờ.',
    scene: { loc: 'bedroom', time: 'night', anim: 'think', npcs: [{ role: 'mother', anim: 'talk', say: 'Con nghĩ gì thế?' }], fx: 'question' },
    choicesFn: () => ['tell', 'forget'].map(pastChoice), choiceByKey: pastChoice });

  // ------------------------------------------------------------------ kịch bản đặc biệt
  const SCENARIOS = [
    { id: 'ngheo', name: 'Con nhà nghèo vượt khó', icon: '🌾', desc: 'Sinh ra ở vùng quê nghèo, bố mẹ làm thuê, nhà không có gì.', goal: 'Có tài sản từ 10 tỷ trước tuổi 50', deadline: 50, born: 2026, city: null,
      init: () => { S.stats.health = r100(Math.max(S.stats.health, 72)); S.stats.smarts = r100(Math.max(S.stats.smarts, 65)); S.lifestyle = 'tietkiem'; S.flags.ngheo = 1; }, check: () => S.money + assetsValue() >= 10e9 },
    { id: 'thieugia', name: 'Thiếu gia phá sản', icon: '💸', desc: 'Sinh ra ngậm thìa vàng, nhưng 25 tuổi gia đình phá sản, mất trắng.', goal: 'Gây dựng lại 30 tỷ trước tuổi 60', deadline: 60, born: 2026,
      init: () => { S.stats.looks = r100(Math.max(S.stats.looks, 70)); S.flags.thieugia = 1; S.flags.rebirthGift = 5e9; }, check: () => S.flags.scnPhasan && S.money + assetsValue() >= 30e9 },
    { id: 'thoichien', name: 'Sinh ra trong thời chiến', icon: '🎖️', desc: 'Năm 1955, Hà Nội. Tuổi thơ trong tiếng bom, tuổi trẻ có thể phải ra trận.', goal: 'Sống qua chiến tranh và thọ từ 80 tuổi', deadline: 125, born: 1955, city: 'hanoi',
      init: () => { S.stats.health = r100(Math.max(S.stats.health, 70)); }, check: () => P().age >= 80 },
    { id: 'cauthu', name: 'Một đời cầu thủ', icon: '⚽', desc: 'Sinh ra với đôi chân vàng và thể lực hơn người.', goal: 'Khoác áo đội tuyển quốc gia', deadline: 40, born: 2026,
      init: () => { S.stats.health = r100(Math.max(S.stats.health, 92)); S.flags.scnFootball = 1; }, check: () => !!(S.job && S.job.id === 'cauthu' && S.job.level >= 3) || !!S.flags.nationalTeam },
    { id: 'hocthuat', name: 'Con đường học thuật', icon: '🎓', desc: 'Thông minh từ bé, cả dòng họ đặt hết hy vọng vào bạn.', goal: 'Được phong hàm giáo sư', deadline: 75, born: 2026,
      init: () => { S.stats.smarts = r100(Math.max(S.stats.smarts, 86)); S.edu.perf = r100(Math.max(S.edu.perf, 70)); }, check: () => !!S.flags.giaosu },
    { id: 'giangho', name: 'Giang hồ hoàn lương', icon: '🦹', desc: 'Lớn lên ở khu phố toàn dân anh chị. Con đường giang hồ mở sẵn trước mặt.', goal: 'Lên làm đại ca rồi hoàn lương, sống đến 60 tuổi', deadline: 125, born: 2026,
      init: () => { S.karma = 35; S.flags.scnGang = 1; }, check: () => !!S.flags.ghBoss && !(S.job && S.job.id === 'giangho') && !S.jail && P().age >= 60 },
    { id: 'tramnam', name: 'Gia đình trăm năm', icon: '👨‍👩‍👧‍👦', desc: 'Một đời vun vén cho tổ ấm.', goal: 'Cưới một lần không ly hôn, có từ 3 con, thọ từ 85 tuổi', deadline: 125, born: 2026,
      init: () => {}, check: () => has('spouse') && !S.people.some((x) => x.wasSpouse) && S.people.filter((x) => x.role === 'child').length >= 3 && P().age >= 85 },
  ];
  const scnDef = () => (S && S.scn ? SCENARIOS.find((x) => x.id === S.scn.id) : null);
  function scenarioYear(L) {
    const sc = scnDef(); if (!sc || S.scn.done || S.scn.failed) return;
    if (S.job && S.job.id === 'giangho' && S.job.level >= 3) S.flags.ghBoss = S.year;
    if (sc.id === 'thieugia' && P().age === 25 && !S.flags.scnPhasan) queueMilestone('ms_scn_phasan');
    if (sc.id === 'giangho' && P().age === 16 && !S.flags.gh_invite) { S.forced.push({ id: 's_gh_moi', at: S.year }); }
    let ok = false; try { ok = !!sc.check(); } catch (e) { ok = false; }
    if (ok && P().age <= sc.deadline) { S.scn.done = S.year; meta.scnDone = meta.scnDone || {}; meta.scnDone[sc.id] = (meta.scnDone[sc.id] || 0) + 1; L('🎬 HOÀN THÀNH KỊCH BẢN “' + sc.name + '”: ' + sc.goal + '!', 'milestone', '🏆'); addStat('happy', 12, {}); }
    else if (P().age > sc.deadline) { S.scn.failed = S.year; L('🎬 Kịch bản “' + sc.name + '” thất bại: đã quá hạn (' + sc.goal.toLowerCase() + ').', 'bad', '🎬'); }
  }
  // ------------------------------------------------------------------ CON ĐƯỜNG CỦA BẠN: hiện rõ hướng đi đang theo + từng bước tiếp theo
  function pathView() {
    if (!S || S.dead) return null;
    const pa = P().age, job = S.job ? D.CAREERS[S.job.id] : null, top = job ? S.job.level >= job.levels.length - 1 : false;
    const thpt = S.edu.degrees.includes('THPT');
    const mk = (name, icon, steps, extra) => { const i = steps.findIndex((x) => !x.done); steps.forEach((x, k) => (x.cur = k === i)); return Object.assign({ name, icon, steps, next: i < 0 ? '🏁 Bạn đã đi hết con đường này!' : steps[i].hint, pct: Math.round((100 * steps.filter((x) => x.done).length) / steps.length) }, extra || {}); };
    const sc = scnDef();
    if (sc && !S.scn.done && !S.scn.failed) {
      const ST = {
        giangho: [
          { t: 'Nhận lời đại ca', done: !!S.flags.gh_invite, hint: 'Khoảng 16 tuổi đại ca sẽ tìm đến mời bạn — nhận tiền và theo anh ấy.' },
          { t: 'Đánh nhau lên chức (đàn em → tay chân → trùm)', done: !!S.flags.ghBoss, hint: 'Mỗi năm đều có trận đánh nhau: thắng các trận 👊 để tăng hiệu suất và lên chức.' },
          { t: 'Hoàn lương', done: !!S.flags.ghBoss && !(S.job && S.job.id === 'giangho'), hint: 'Khi đã làm trùm, vào mục Sự nghiệp bấm Nghỉ việc để hoàn lương.' },
          { t: 'Sống đến 60 tuổi, không ngồi tù', done: pa >= 60 && !S.jail, hint: 'Giữ sức khoẻ, tránh vào tù cho tới 60 tuổi.' }],
        ngheo: [
          { t: 'Học hết THPT', done: thpt, hint: 'Chăm học để tốt nghiệp THPT.' },
          { t: 'Có việc làm ổn định', done: !!S.job, hint: 'Vào mục Sự nghiệp tìm việc.' },
          { t: 'Tài sản 1 tỷ', done: S.money + assetsValue() >= 1e9, hint: 'Tiết kiệm, đầu tư, mở công ty để có tỷ đầu tiên.' },
          { t: 'Tài sản 10 tỷ trước 50 tuổi', done: S.money + assetsValue() >= 10e9, hint: 'Đầu tư nhà đất, chứng khoán, kinh doanh để đạt 10 tỷ trước 50 tuổi.' }],
        thieugia: [
          { t: 'Trải qua biến cố phá sản', done: !!S.flags.scnPhasan, hint: 'Năm 25 tuổi gia đình sẽ phá sản.' },
          { t: 'Gây dựng lại 1 tỷ', done: !!S.flags.scnPhasan && S.money + assetsValue() >= 1e9, hint: 'Làm lại từ đầu: đi làm, tiết kiệm, khởi nghiệp.' },
          { t: 'Có lại 30 tỷ trước 60 tuổi', done: !!S.flags.scnPhasan && S.money + assetsValue() >= 30e9, hint: 'Mở công ty, đầu tư để chạm mốc 30 tỷ.' }],
        thoichien: [
          { t: 'Sống qua chiến tranh (1975)', done: S.year >= 1975, hint: 'Giữ mạng sống qua những năm chiến tranh.' },
          { t: 'Thọ 80 tuổi', done: pa >= 80, hint: 'Sống lành mạnh, đi khám bệnh đều đặn.' }],
        cauthu: [
          { t: 'Vào đội năng khiếu', done: !!(S.ys || S.flags.talent_cauthu), hint: 'Chơi bóng đá thường xuyên, buổi hướng nghiệp chọn đội năng khiếu bóng đá.' },
          { t: 'Ký hợp đồng chuyên nghiệp', done: !!(S.job && S.job.id === 'cauthu'), hint: 'Vào mục Sự nghiệp xin làm cầu thủ.' },
          { t: 'Khoác áo đội tuyển quốc gia', done: !!S.flags.nationalTeam || !!(S.job && S.job.id === 'cauthu' && S.job.level >= 3), hint: 'Đá tốt các trận để lên tuyển.' }],
        hocthuat: [
          { t: 'Tốt nghiệp đại học', done: hasDegree(), hint: 'Học giỏi, thi đỗ đại học.' },
          { t: 'Học thạc sĩ / tiến sĩ', done: !!S.flags.master || S.edu.degrees.some((d) => /Thạc sĩ|Tiến sĩ/.test(d)), hint: 'Vào mục Học tập học lên cao học.' },
          { t: 'Phong hàm giáo sư', done: !!S.flags.giaosu, hint: 'Làm giảng viên, nghiên cứu để được phong giáo sư.' }],
        tramnam: [
          { t: 'Kết hôn', done: has('spouse'), hint: 'Hẹn hò rồi cầu hôn người thương.' },
          { t: 'Có 3 con', done: S.people.filter((x) => x.role === 'child').length >= 3, hint: 'Sinh thêm con cùng vợ/chồng.' },
          { t: 'Không ly hôn, thọ 85 tuổi', done: has('spouse') && !S.people.some((x) => x.wasSpouse) && pa >= 85, hint: 'Giữ gìn hạnh phúc gia đình và sức khoẻ.' }],
      }[sc.id];
      if (ST) return mk('Kịch bản: ' + sc.name, sc.icon, ST, { goal: sc.goal });
    }
    const route = S.flags.route, I = route && D.INTERESTS[route];
    if (I) {
      if (route === 'the') {
        const sp = Object.keys(S.flags).filter((k) => /^talent_/.test(k)).map((k) => k.slice(7)).find((c) => D.CAREERS[c] && D.CAREERS[c].sport) || 'cauthu', C = D.CAREERS[sp];
        return mk(I.route + ': ' + C.title.toLowerCase(), I.icon, [
          { t: 'Chọn hướng thể thao', done: true },
          { t: 'Tập luyện ở đội năng khiếu', done: !!(S.ys && S.ys.stage >= 1) || !!(S.job && S.job.id === sp), hint: 'Mỗi năm vào mục Học tập → Tập luyện để tích điểm rèn luyện.' },
          { t: 'Thi đấu chuyên nghiệp', done: !!(S.job && S.job.id === sp), hint: 'Đủ tuổi thì vào mục Sự nghiệp xin làm ' + C.title.toLowerCase() + '.' },
          { t: 'Lên đội tuyển quốc gia', done: !!(S.job && S.job.id === sp && top) || !!S.flags.nationalTeam, hint: 'Thi đấu tốt, giữ thể lực để lên cấp cao nhất.' }]);
      }
      if (route === 'tayngh') {
        const v = D.VOC_TRADES.find((x) => x.id === (S.flags.voc_plan || S.edu.voc)) || D.VOC_TRADES[0], C = D.CAREERS[v.career];
        return mk('Học nghề ' + v.name.toLowerCase(), I.icon, [
          { t: 'Học hết lớp 9', done: pa >= 15 || thpt, hint: 'Học hết lớp 9 rồi vào trường nghề.' },
          { t: 'Học trường nghề ' + v.name.toLowerCase(), done: !!S.flags['voc_' + v.career], hint: 'Hai năm học nghề sau lớp 9.' },
          { t: 'Đi làm ' + C.title.toLowerCase(), done: !!(S.job && S.job.id === v.career), hint: 'Vào mục Sự nghiệp xin làm ' + C.title.toLowerCase() + '.' },
          { t: 'Lên thợ cả / mở tiệm riêng', done: !!(S.job && S.job.id === v.career && top), hint: 'Làm tốt để lên cấp cao nhất.' }]);
      }
      const fit = job && I.careers.includes(S.job.id);
      return mk(I.route, I.icon, [
        { t: 'Chọn hướng ' + I.label.toLowerCase(), done: true },
        { t: 'Tốt nghiệp THPT', done: thpt, hint: 'Chăm học, giữ điểm số để tốt nghiệp THPT.' },
        { t: 'Học đại học / cao đẳng', done: hasDegree(), hint: 'Thi đại học ngành gần với ' + I.label.toLowerCase() + '.' },
        { t: 'Làm nghề hợp: ' + I.careers.slice(0, 3).map((c) => D.CAREERS[c].title.toLowerCase()).join(', '), done: !!fit, hint: 'Vào mục Sự nghiệp xin làm một trong các nghề: ' + I.careers.slice(0, 4).map((c) => D.CAREERS[c].title.toLowerCase()).join(', ') + '.' },
        { t: 'Lên đỉnh nghề', done: !!(fit && top), hint: 'Làm tốt, giữ hiệu suất cao để thăng chức.' }]);
    }
    if (pa < 14) return mk('Chưa chọn hướng đi', '🧭', [
      { t: 'Đi chơi, khám phá sở thích', done: interestProfile().length > 0 && (interestProfile()[0].pct >= 18), hint: 'Bấm “Đi chơi” trong mục Hoạt động để lộ ra sở thích của bạn.' },
      { t: 'Buổi hướng nghiệp năm 14 tuổi', done: false, hint: 'Năm 14 tuổi sẽ có buổi tư vấn để chọn hướng đi.' }]);
    if (job) return mk('Nghề ' + job.title.toLowerCase(), job.icon || '💼', job.levels.map((l, k) => ({ t: l[0], done: S.job.level >= k, hint: 'Làm tốt (hiệu suất cao) để lên ' + l[0].toLowerCase() + '.' })));
    return null;
  }
  function scenarioView() { const sc = scnDef(); if (!sc) return null; return { id: sc.id, name: sc.name, icon: sc.icon, goal: sc.goal, status: S.scn.done ? 'done' : S.scn.failed ? 'failed' : 'progress' }; }
  ms({ id: 'ms_scn_phasan', title: 'Gia đình phá sản', icon: '📉', age: [20, 40],
    text: 'Tập đoàn của bố vỡ nợ chỉ sau một đêm. Ngân hàng niêm phong biệt thự, siết toàn bộ tài khoản. Bố mẹ ngồi lặng trong căn phòng trọ thuê vội. Mọi thứ của bạn cũng đi theo.',
    scene: { loc: 'street', time: 'night', anim: 'cry', npcs: [{ role: 'father', anim: 'sad', say: 'Bố xin lỗi con…' }], fx: 'tears', shot: 'dramatic' },
    choices: [
      { label: 'Ôm bố: “Mình làm lại từ đầu”', fn: () => { S.flags.scnPhasan = S.year; const lost = Math.max(0, S.money); S.money = 0; S.assets = []; S.company = null; return { text: 'Bạn mất ' + fmtMoney(lost) + ' cùng toàn bộ tài sản. Đêm đó cả nhà ngủ trên chiếc nệm mỏng. Nhưng lần đầu tiên bạn thấy mình phải tự đứng lên.', effects: { happy: -10, karma: 6, rel: { father: 15 } }, scene: { anim: 'hug', fx: 'tears' }, tone: 'bad' }; } },
      { label: 'Giận dữ bỏ nhà đi', fn: () => { S.flags.scnPhasan = S.year; S.money = 0; S.assets = []; S.company = null; return { text: 'Bạn đập cửa bỏ đi, mang theo đúng chiếc ba lô. Từ thiếu gia thành kẻ trắng tay chỉ trong một tuần.', effects: { happy: -14, rel: { father: -20, mother: -10 } }, scene: { anim: 'angry', fx: 'anger' }, tone: 'bad' }; } },
    ] });

  // ------------------------------------------------------------------ sống chung một nhà (online)
  function onlineSibling(o) {
    if (!S || !S.player || !S.fam || !o || !o.pid) return;
    let p = S.people.find((x) => x.pid === o.pid);
    if (!p) {
      p = newPerson('sibling', o.gender === 'f' ? 'f' : 'm', U.clamp(+o.age || P().age, 0, 120), { lastName: P().lastName, firstName: String(o.name || 'Anh em').split(' ').pop(), relation: 75, parents: [alive('mother')[0], alive('father')[0]].filter(Boolean).map((x) => x.appearance) });
      p.pid = o.pid; p.online = true; S.people.push(p);
      addLog('Anh chị em ruột của bạn trong nhà: ' + p.firstName + ' (người chơi ' + (o.nick || '') + ').', 'neutral', '👨‍👩‍👧');
    }
    p.age = U.clamp(+o.age || p.age, 0, 120);
    if (o.alive === false && p.alive) { p.alive = false; p.deathYear = S.year; addLog((p.age > P().age ? (p.gender === 'f' ? 'Chị ' : 'Anh ') : 'Em ') + p.firstName + ' đã qua đời ở tuổi ' + p.age + '.', 'bad', '🕯️'); addStat('happy', -10, {}); }
    changed();
  }
  function onlineParentDied(role) {
    if (!S || !S.player || S.dead) return null;
    const x = alive(role)[0]; if (!x) return null;
    x.alive = false; x.deathYear = S.year;
    const deltas = {}; addStat('happy', -(closeness[role] || 15) * (0.5 + x.relation / 200), deltas);
    addLog(cap(kin(x)) + ' ' + x.firstName + ' qua đời ở tuổi ' + x.age + '. Anh chị em trong nhà cùng về chịu tang.', 'bad', '🕯️');
    queueMilestone('ms_funeral', { deceased: x }); changed();
    return { title: '🕯️ ' + cap(kin(x)) + ' ' + x.firstName + ' qua đời', text: 'Cả nhà cùng chịu tang.' };
  }
  // ------------------------------------------------------------------ tiểu sử (để chia sẻ)
  function biography() {
    if (!S || !S.dead) return null;
    const p = P(), f = S.flags, he = p.gender === 'f' ? (S.dead.age >= 50 ? 'Bà' : 'Chị') : (S.dead.age >= 50 ? 'Ông' : 'Anh');
    const dad = S.people.find((x) => x.role === 'father'), mom = S.people.find((x) => x.role === 'mother');
    const P1 = fullName(p) + ' (' + S.born + ' – ' + S.year + ') sinh ra tại ' + D.cityName(S.city) + (eraOf(S.born).born ? ', ' + eraOf(S.born).born : '') + (dad && mom ? ', là con của ông ' + fullName(dad) + ' và bà ' + fullName(mom) : '') + '.' + (S.generation > 1 ? ' ' + he + ' là đời thứ ' + S.generation + ' của dòng họ.' : '');
    const edu = [];
    if (f.olympic_vang) edu.push('giành Huy chương Vàng Olympic quốc tế'); else if (f.hsg_qg) edu.push('đoạt giải học sinh giỏi quốc gia');
    if (f.duhoc || f.hoc_bong) edu.push('đi du học bằng học bổng');
    const deg = S.edu.degrees.filter((d) => d !== 'THPT'); if (deg.length) edu.push('tốt nghiệp ' + deg[deg.length - 1].toLowerCase());
    if (f.phd) edu.push('bảo vệ học vị tiến sĩ'); if (f.giaosu) edu.push('được phong hàm giáo sư');
    const P2 = edu.length ? 'Thời đi học, ' + he.toLowerCase() + ' ' + edu.join(', ') + '.' : (S.edu.degrees.includes('THPT') ? he + ' học hết cấp ba rồi sớm bước vào đời.' : he + ' không có nhiều cơ hội đến trường.');
    const job = S.job ? D.CAREERS[S.job.id] : null, car = [];
    if (f.veteran) car.push('từng khoác áo lính ra trận');
    if (job) car.push('làm ' + job.levels[S.job.level].title.toLowerCase() + (job.levels[S.job.level].title.includes(job.title) ? '' : ' (' + job.title.toLowerCase() + ')'));
    else if (S.retired) car.push('nghỉ hưu an nhàn');
    if (S.company) car.push('gây dựng ' + S.company.name + ' thành ' + CO_LV[S.company.lv][0].toLowerCase() + ' trị giá ' + fmtMoney(S.company.val));
    if (f.tienan) car.push('có thời gian lầm lỡ, từng ngồi tù' + (f.hocnghe_tu ? ' rồi học nghề hoàn lương' : ''));
    const P3 = car.length ? 'Cuộc đời ' + he.toLowerCase() + ' ' + car.join('; ') + '.' : '';
    const sp = alive('spouse')[0] || S.people.find((x) => x.role === 'spouse') || S.people.find((x) => x.wasSpouse);
    const kids = S.people.filter((x) => x.role === 'child');
    const P4 = (sp ? he + ' kết hôn với ' + fullName(sp) + (sp.wasSpouse && sp.role === 'ex' ? ', nhưng hai người sau này chia tay' : '') + '. ' : he + ' sống độc thân. ') + (kids.length ? he + ' có ' + kids.length + ' người con: ' + kids.map((k) => k.firstName + (k.fate === 'thanhdat' ? ' (thành đạt)' : '')).join(', ') + '.' : 'Không có con cái.');
    const worth = S.money + assetsValue();
    const P5 = 'Khi ra đi, ' + he.toLowerCase() + ' để lại ' + (worth > 0 ? 'khối tài sản khoảng ' + fmtMoney(worth) : 'không nhiều tài sản') + '.' + (heirloomsOf(S).length ? ' Đồ gia truyền: ' + heirloomsOf(S).map((h) => h.name.toLowerCase()).join(', ') + '.' : '');
    const P6 = he + ' qua đời năm ' + S.year + ', hưởng thọ ' + S.dead.age + ' tuổi. ' + S.dead.cause + '. ' + (S.dead.epitaph ? 'Trên bia mộ khắc: “' + S.dead.epitaph.replace(/[.。]+$/, '') + '”.' : '');
    const info = deathInfo();
    return { name: fullName(p), born: S.born, died: S.year, age: S.dead.age, gender: p.gender, city: D.cityName(S.city), cause: S.dead.cause, rank: S.dead.rank, score: S.dead.score, gen: S.generation, epitaph: S.dead.epitaph,
      title: 'Tiểu sử ' + fullName(p), paragraphs: [P1, P2, P3, P4, P5, P6].filter(Boolean), highlights: (info.highlights || []).slice(0, 8), heirlooms: heirloomsOf(S).map((h) => h.icon + ' ' + h.name) };
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
    // làm việc quá sức nhiều năm liền → tích lũy nguy cơ đột quỵ, tim mạch
    const workedHard = !!(S.yearActs && S.yearActs.job_workhard);
    S.overwork = workedHard ? (S.overwork || 0) + 1 : Math.max(0, (S.overwork || 0) - 1);
    S.yearActs = {}; S.yearInter = {}; S.daily = null;
    S.people.forEach((x) => { if (x.alive) x.age++; });

    // --- stats drift
    const ill = S.illnesses.reduce((s, i) => s + illDrain(i), 0);
    const dh = pa < 25 ? U.rand(0, 2) : pa < 40 ? U.rand(-1, 1) : pa < 55 ? -U.rand(0.5, 2) : pa < 70 ? -U.rand(1, 3) : -U.rand(2, 4.5);
    addStat('health', dh - ill, deltas);
    addStat('looks', pa < 14 ? U.rand(0, 2) : pa < 26 ? U.rand(-1, 2) : pa < 45 ? U.rand(-1.5, 0.5) : -U.rand(0.5, 2), deltas);
    addStat('smarts', S.edu.inSchool && pa >= 3 ? U.rand(0.5, 2.5) : pa >= 65 ? -U.rand(0, 1.5) : U.rand(-0.5, 0.8), deltas);
    // --- education
    eduYear(L);
    englishYear();
    parentingYear(L, deltas);
    youthYear(L, deltas);
    armyYear(L, deltas);
    festivalYear(L, deltas);
    if (S.abroad && S.abroad.sport && !(S.job && S.job.club)) { S.abroad = null; L('Hợp đồng ở nước ngoài kết thúc, bạn về nước.', 'neutral', '🛬'); }
    abroadYear(L, deltas);
    // --- money
    moneyYear(L, deltas);
    assetsYear(L, deltas);
    socialYear(L);
    eraYear(L);
    companyYear(L, deltas);
    try { richYear(); nuisanceYear(); disasterYear(); } catch (e) { U.warnOnce('richYear', 'richYear', e); }
    try { insYear(L, deltas); farmYear(L, deltas); decorYear(L, deltas); } catch (e) { U.warnOnce('batchE', 'ins/farm', e); }
    try { xkYear(L, deltas); if (S.abroad && S.abroad.settled && S.year - S.abroad.since === 5 && !S.flags.citizen) queueMilestone('ms_quoctich'); } catch (e) { U.warnOnce('xk', 'xk', e); }
    try { officeYear(L); if (S.company) chainYear(L, deltas); } catch (e) { U.warnOnce('batchB2', 'office/chain', e); }
    try { groupsYear(L); familyBYear(L); rivalYear(L); } catch (e) { U.warnOnce('famB', 'family batch B', e); }
    try { blackDebtYear(L); huiYear(L, deltas); fomoYear(L); jobMarketYear(L); debtYear(L, deltas); lowStatYear(L); campRiskYear(); } catch (e) { U.warnOnce('moneyA', 'money batch A', e); }
    // công việc tự tìm đến: mỗi năm có khả năng gặp một ca làm việc nổi bật của nghề
    try { if (S.job && !S.jail && S.pending.length < 2 && Math.random() < 0.4) { const ev = jobTaskEvent(); if (ev) S.pending.push(ev); } } catch (e) { U.warnOnce('jt', 'jobtask', e); }
    jailYear(L, deltas);
    // --- job
    if (S.job) {
      S.job.years++; S.job.levelYears = (S.job.levelYears || 0) + 1; S.job.perf = r100(S.job.perf + U.rand(-9, 5) + (S.stats.smarts - 55) / 25);
      if (S.flags.firstjob_pending) { delete S.flags.firstjob_pending; unlock('first_job'); queueMilestone('ms_firstpay'); }
      if (S.job.perf > 75 && promoGate() && Math.random() < 0.25) { if (promote()) { L('Bạn được thăng chức: ' + D.CAREERS[S.job.id].levels[S.job.level].title + '!', 'milestone', '📈'); addStat('happy', 6, deltas); } }
      else if (S.job.perf < 22 && Math.random() < 0.5) {
        if (!S.flags.perfWarn) { S.flags.perfWarn = S.year; queueMilestone('ms_job_warn'); }
        else if (S.year - S.flags.perfWarn >= 1) { L('Sau lần cảnh cáo năm ngoái, hiệu suất vẫn không khá hơn. Bạn bị cho thôi việc.', 'bad', '📦'); if (D.CAREERS[S.job.id].sport) S.flags.ex_athlete = S.flags.ex_athlete || S.year; S.job = null; S.flags.perfWarn = 0; addStat('happy', -10, deltas); }
      } else if (S.job.perf >= 35 && S.flags.perfWarn) S.flags.perfWarn = 0;
      const cj = S.job && D.CAREERS[S.job.id];
      if (cj && cj.prize) { try { leagueYear(L, deltas); } catch (e) { U.warnOnce('league', 'league', e); } sportYear(L, deltas); }
      // vận động viên: chấn thương là chuyện thường ngày
      if (cj && cj.injury && Math.random() < cj.injury * (S.stats.health < 60 ? 1.5 : 1) * (pa >= (cj.retireAt || 40) - 4 ? 1.4 : 1)) {
        const bad = Math.random() < 0.3;
        addIllness(bad ? 'Đứt dây chằng' : 'Chấn thương cơ'); S.job.perf = r100(S.job.perf - (bad ? 22 : 10)); addStat('happy', bad ? -8 : -3, deltas);
        L(bad ? 'Bạn bị đứt dây chằng trong một pha va chạm, phải nghỉ thi đấu dài hạn. Không chữa dứt điểm thì sự nghiệp có thể khép lại.' : 'Bạn bị chấn thương cơ khi tập luyện, phải ngồi ngoài vài tuần.', 'bad', '🩼');
      }
      // giải nghệ: thể thao và người mẫu có tuổi nghề
      if (cj && cj.retireAt && pa >= cj.retireAt - (S.illnesses.some((i) => i.id === 'daychang' || i.id === 'thoaihoa') ? 3 : 0) && S.flags.retireAthAsked !== S.year) {
        S.flags.retireAthAsked = S.year; queueMilestone(cj.sport ? 'ms_athlete_retire' : 'ms_model_retire');
      }
      // 📋 HLV: tổng kết mùa giải của đội mình dẫn dắt
      if (S.job && S.job.id === 'hlv' && S.mgr && KN.Manager && S.mgr.season < S.year) {
        try {
          const r = KN.Manager.endSeason(S.mgr);
          if (r) {
            L(r.text, r.champ ? 'milestone' : r.goalOk ? 'good' : 'bad', r.champ ? '🏆' : '📋');
            if (r.bonus) { addMoney(r.bonus, deltas); L('Tiền thưởng thành tích mùa giải: ' + fmtMoney(r.bonus) + '.', 'good', '💰'); }
            S.job.perf = r100(S.job.perf + r.perf); addStat('happy', r.happy, deltas);
            if (r.champ) { unlockSafe('hlv_champ'); if (S.job.level < 2 && Math.random() < 0.6 && promote()) L('Sau chức vô địch, bạn được bổ nhiệm làm ' + D.CAREERS.hlv.levels[S.job.level].title + '!', 'milestone', '📈'); }
            if (r.sack) { S.job.perf = Math.min(S.job.perf, 15); L('Ban lãnh đạo mất kiên nhẫn sau mùa giải tệ hại. Ghế HLV của bạn đang rất nóng.', 'bad', '🔥'); }
          }
        } catch (e) { U.warnOnce('mgrEnd', 'manager season end', e); }
      }
      if (S.job && !(cj && cj.retireAt) && pa >= 60 && (!S.flags.retireAsked || S.year - S.flags.retireAsked >= 4)) { S.flags.retireAsked = S.year; queueMilestone('ms_retire'); }
    } else if (pa >= 18 && pa < 60 && !S.edu.inSchool && !S.retired && !S.jail) addStat('happy', -2, deltas);
    gangYear(L, deltas);
    // --- people
    peopleYear(L, deltas, relDeltas);
    // --- illness
    illnessYear(L);
    // --- rủi ro đời sống theo số liệu thực
    if (!S.dead) hazardYear(L, deltas);
    trackMilestones();
    // --- happiness baseline
    const close = alive().filter((x) => ['mother', 'father', 'spouse', 'partner', 'child', 'friend'].includes(x.role));
    const avgRel = close.length ? close.reduce((s, x) => s + x.relation, 0) / close.length : 40;
    const vis = visibleIlls();
    const B = 44 + (avgRel - 50) * 0.25 + (S.stats.health - 50) * 0.15 + (S.job ? 4 : 0) + (has('spouse') || has('partner') ? 6 : 0) + (S.money < 0 ? -8 : Math.min(8, moneyStat() * 0.08)) + (vis.length ? -4 : 0) + (vis.some((i) => i.incurable) ? -4 : 0) + (pa >= 18 ? lifestyleDef().happy * 1.5 : 0) + Math.min(12, S.assetJoy || 0) + Math.min(6, decorJoy() * 1.2);
    addStat('happy', (B - S.stats.happy) * 0.25 + U.rand(-3, 3), deltas);
    // --- death check
    // chỉ bệnh có thể gây tử vong mới được ghi là nguyên nhân (không ai chết vì cảm cúm hay đau khớp)
    const lethal = S.illnesses.filter((i) => (i.incurable && i.id !== 'thoaihoa') || i.cancer || ['tim', 'xogan', 'suythan', 'suytim', 'dotquy', 'viemphoi', 'viemganb', 'tieuduong', 'huyetap', 'loetdaday'].includes(i.id));
    const wi = lethal.length ? worstIll(lethal) : null;
    if (S.stats.health <= 0) die(wi ? (wi.cancer && wi.stage >= 4 ? illLabel(wi).replace(/\(giai đoạn 4\)/, 'giai đoạn cuối') : 'Bệnh ' + wi.name.toLowerCase() + ' trở nặng') : wasteCause(pa));
    else {
      const terminal = S.illnesses.filter((i) => (i.incurable && i.id !== 'thoaihoa') || (i.cancer && i.stage >= 3)).length;
      const q = dif('mort') * mort(pa) * (1 + Math.max(0, 55 - S.stats.health) / 22) * (S.stats.health > 85 ? 0.6 : 1) * (S.flags.perk_tho ? 0.55 : 1) + terminal * 0.025;
      if (Math.random() < q) die(wi && (terminal || Math.random() < 0.5) ? 'Biến chứng ' + illLabel(wi).toLowerCase() : deathCause(pa));
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
      let n = pa <= 2 ? 1 + (Math.random() < 0.3 ? 1 : 0) : pa <= 5 ? 1 : 1 + (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.1 ? 1 : 0);
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
    const fest = S.fest; // dịp lễ của năm (tính trong festivalYear)
    if (fest === 'tet') { sc.loc = 'home'; sc.tier = sceneTier(); sc.decor = 'tet'; sc.fx = 'confetti'; }
    else if (fest === 'midautumn') { sc.decor = 'midautumn'; sc.time = 'night'; }
    else if (fest === 'christmas') { sc.decor = 'christmas'; sc.time = 'night'; }
    // thời tiết theo vùng miền
    if (!fest && S.city === 'hanoi' && Math.random() < 0.25) { sc.weather = 'fog'; sc.time = 'dawn'; }
    else if (!fest && (S.city === 'hcm' || S.city === 'cantho') && Math.random() < 0.3) sc.weather = 'rain';
    return sc;
  }
  // mỗi năm một dịp lễ: Tết (lì xì), Trung thu (trẻ em), Giáng sinh — có tiền mừng tuổi thật
  function festivalYear(L, deltas) {
    const pa = P().age, r = Math.random();
    S.fest = r < 0.4 ? 'tet' : r < 0.55 && (pa <= 12 || S.people.some((x) => x.alive && x.role === 'child' && x.age <= 12)) ? 'midautumn' : r < 0.65 && pa >= 6 ? 'christmas' : null;
    if (S.fest === 'tet') {
      if (pa >= 3 && pa < 18) {
        const lx = Math.round(U.rand(2, 6) * (pa < 10 ? 1 : 2) * 1e5 * (S.flags.perk_giau ? 2 : 1) / 1e4) * 1e4;
        addMoney(lx, deltas); addStat('happy', 3, deltas);
        L('🧧 Tết đến! Bạn mặc áo mới đi chúc Tết họ hàng, thu về ' + fmtMoney(lx) + ' tiền lì xì.', 'good', '🧧');
      } else if (pa >= 18) {
        const kids = S.people.filter((x) => x.alive && ['child', 'grandchild', 'sibling'].includes(x.role) && x.age < 18).length + U.randi(2, 6);
        const give = Math.round(kids * (S.job ? U.rand(1, 5) : U.rand(0.5, 1.5)) * 1e5 / 1e4) * 1e4;
        if (S.money > give * 2) addMoney(-give, deltas);
        addStat('happy', 2, deltas);
        L('🧧 Tết ' + (S.year) + ': bánh chưng, hoa đào, về quê sum họp. Bạn mừng tuổi ' + kids + ' đứa trẻ hết ' + fmtMoney(give) + '.' + (S.abroad ? ' Năm nay ăn Tết xa nhà, gọi video về mà rưng rưng.' : ''), 'good', '🧧');
      }
    } else if (S.fest === 'midautumn') L('🏮 Tết Trung thu: ' + (pa <= 12 ? 'bạn rước đèn ông sao, phá cỗ cùng lũ bạn trong xóm.' : 'bạn mua lồng đèn, bánh nướng cho bọn trẻ, nhìn chúng rước đèn mà nhớ tuổi thơ.'), 'good', '🏮');
    else if (S.fest === 'christmas' && pa >= 13 && pa <= 40) L('🎄 Đêm Giáng sinh, phố phường lung linh. Bạn ' + (has('partner') || has('spouse') ? 'cùng người thương' : 'cùng đám bạn') + ' chen chúc đi chơi Noel.', 'neutral', '🎄');
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
      if (pa <= 14) { e.grade = Math.min(9, pa - 5); L('Bạn lên lớp ' + e.grade + '.', 'neutral', '📗'); if (pa === 14 && interestProfile().length && !S.flags.route) queueMilestone('ms_huongnghiep'); }
      else if (S.flags.voc_plan) { const v = D.VOC_TRADES.find((x) => x.id === S.flags.voc_plan); e.level = 'vocational'; e.grade = 1; e.voc = v.id; L('Học xong lớp 9, bạn vào trường nghề ngành ' + v.name.toLowerCase() + ' như đã định.', 'milestone', '🛠️'); }
      else queueMilestone('ms_grade10');
    } else if (e.level === 'highschool') {
      if (e.grade < 12) { e.grade++; L('Bạn lên lớp ' + e.grade + '.', 'neutral', '📙'); if (S.flags.private_school && P().age >= 18) {} }
      else {
        e.degrees.includes('THPT') || e.degrees.push('THPT'); e.inSchool = false; e.level = 'done';
        L('Bạn tốt nghiệp THPT. Mười hai năm đèn sách khép lại.', 'milestone', '🎓');
        // đã ký hợp đồng VĐV / đang theo nghề thì không bị lôi vào kỳ thi đại học (muốn học sau vẫn đăng ký được)
        if (S.job && D.CAREERS[S.job.id].sport) L('Bạn đã là ' + D.CAREERS[S.job.id].title.toLowerCase() + ' chuyên nghiệp nên không thi đại học, dồn sức cho sự nghiệp thi đấu. Sau này muốn đi học vẫn có thể đăng ký.', 'neutral', '⚽');
        else if (S.ys && !S.ys.done && S.ys.stage >= 3) L('Bạn tạm gác chuyện đại học để chờ hợp đồng chuyên nghiệp từ ' + D.YOUTH_SPORT[S.ys.id].stages[S.ys.stage].name + '.', 'neutral', D.YOUTH_SPORT[S.ys.id].icon);
        else queueMilestone('ms_uni');
      }
    } else if (e.level === 'vocational') {
      e.grade++;
      if (e.grade > 2) {
        const v = D.VOC_TRADES.find((x) => x.id === (e.voc || topPick(S.tradePick) || 'dien')) || D.VOC_TRADES[2];
        e.inSchool = false; e.level = 'done'; e.degrees.push('Trung cấp nghề ' + v.name.toLowerCase()); S.flags['voc_' + v.career] = S.year;
        L('Bạn tốt nghiệp trường nghề ngành ' + v.name.toLowerCase() + '. Nhà trường giới thiệu việc làm: ' + D.CAREERS[v.career].title.toLowerCase() + ' — ứng tuyển gần như chắc chắn đậu.', 'milestone', '🛠️');
      }
    } else if (e.level === 'university') {
      const m = D.MAJORS[e.major];
      e.uniYear++; e.grade = e.uniYear;
      if (e.uniYear > (m ? m.years : 4)) {
        e.inSchool = false; e.level = 'done'; e.degrees.push('Cử nhân ' + (e.abroad ? '(du học) ' : '') + (m ? m.name : '')); if (e.abroad) S.flags.duhoc = S.year;
        unlock('degree'); if (e.perf >= 88) unlock('valedictorian');
        L('Bạn tốt nghiệp đại học ngành ' + (m ? m.name : '') + (e.perf >= 88 ? ' — loại xuất sắc!' : '!'), 'milestone', '🎓');
        queueMilestone('ms_graduate');
      } else L('Bạn lên năm ' + e.uniYear + ' đại học.', 'neutral', '🎓');
    }
  }
  function assetsValue(st) { st = st || S; return st.assets.reduce((s, a) => s + (a.value || 0), 0) + (st.company ? Math.round(st.company.val * st.company.own) : 0); }
  function lifestyleDef() { return D.LIFESTYLES.find((x) => x.id === (S.lifestyle || 'binhthuong')) || D.LIFESTYLES[1]; }
  // thuế thu nhập cá nhân theo tháng (giảm trừ 11 triệu + 4,4 triệu mỗi con nhỏ), biểu lũy tiến 5–35%
  function pit(m) {
    const dep = S.people.filter((p) => p.alive && p.role === 'child' && p.age < 18).length;
    const t = Math.max(0, m - 11e6 - dep * 4.4e6);
    let tax = 0, prev = 0;
    for (const [capV, r] of [[5e6, 0.05], [10e6, 0.1], [18e6, 0.15], [32e6, 0.2], [52e6, 0.25], [80e6, 0.3], [Infinity, 0.35]]) { if (t <= prev) break; tax += (Math.min(t, capV) - prev) * r; prev = capV; }
    return Math.round(tax);
  }
  // vận động viên: không lương cố định — trợ cấp (nếu có) + tiền thưởng giải đấu theo phong độ + tài trợ theo độ nổi tiếng;
  // giai đoạn nghiệp dư phải tự túc tiền tập, thuê HLV, đi giải
  const pay = (v) => Math.round(v / 1e5) * 1e5;
  function sportYear(L, deltas) {
    const c = D.CAREERS[S.job.id], lv = S.job.level;
    const [mn, mx] = c.prize[Math.min(lv, c.prize.length - 1)];
    const injured = S.illnesses.some((i) => !i.hidden && (i.id === 'daychang' || i.id === 'chanthuong'));
    const club = S.job.club, cm = club ? club.mult : 1;
    // thi đấu ở nước ngoài: phong độ kém thì bị đem cho mượn / thanh lý hợp đồng
    if (club) {
      if (S.job.perf < 45 || (S.english || 0) < 25 && Math.random() < 0.25) {
        L('Phong độ sa sút, ' + club.name + ' thanh lý hợp đồng. Bạn xách vali về nước thi đấu.', 'bad', '🛬');
        S.job.club = null; S.abroad = null; addStat('happy', -8, deltas);
      } else if (Math.random() < 0.3) L('Ở ' + club.name + ': ' + U.pick(['bạn ngồi dự bị gần nửa mùa, chỉ được vào sân những phút cuối.', 'bạn ghi dấu ấn trong trận lớn, truyền thông quốc tế nhắc tên bạn.', 'cả mùa chật vật thích nghi với lối chơi và thời tiết xứ người.', 'người hâm mộ Việt kéo nhau sang cổ vũ, khán đài rợp cờ đỏ sao vàng.']), 'neutral', '🌍');
    }
    let prize = pay(U.rand(mn, mx) * 1e6 * (0.4 + S.job.perf / 100) * (injured ? 0.3 : 1) * (S.job.club ? cm : (S.job.contract || 1)));
    const sponsor = lv >= 1 ? pay(Math.max(0, S.stats.looks - 40) / 60 * lv * lv * U.rand(8, 40) * 1e6 * (S.job.club ? Math.sqrt(cm) : 1)) : 0;
    if (!S.job.club) foreignOfferCheck();
    let cost = lv === 0 && c.selfFund ? pay(c.selfFund * U.rand(0.7, 1.3) * 1e6) : 0;
    const tax = pay((prize + sponsor) * 0.1);
    let who = '';
    if (cost && parentsBack() && P().age < 23) { who = ' Bố mẹ chu cấp tiền tập ' + fmtMoney(cost) + '.'; cost = 0; }
    addMoney(prize + sponsor - tax - cost, deltas);
    S.job.lastPrize = prize + sponsor;
    S.counters.prizeMoney = (S.counters.prizeMoney || 0) + prize;
    const parts = [];
    if (prize) parts.push('tiền thưởng giải đấu ' + fmtMoney(prize));
    if (sponsor) parts.push('tài trợ ' + fmtMoney(sponsor));
    L((parts.length ? 'Năm nay bạn nhận ' + parts.join(' và ') + (tax ? ' (thuế 10%)' : '') + '.' : 'Năm nay không có giải thưởng nào.') + (cost ? ' Tự túc tiền tập luyện, đi giải: ' + fmtMoney(cost) + '.' : '') + who + (injured ? ' Chấn thương khiến bạn lỡ nhiều giải.' : ''), prize + sponsor > cost ? 'good' : 'neutral', '🏅');
  }
  // ================================================================== MÙA GIẢI + CHUYỂN NHƯỢNG (cầu thủ bóng đá chuyên nghiệp)
  // mỗi năm một mùa 10 vòng, 8 đội. Bạn tự ra sân tối đa 3 vòng (đá thật kiểu Hax), các vòng còn lại tính theo phong độ.
  const VN_CLUBS = ['Thủ Đô FC', 'Sông Hàn FC', 'Phố Núi FC', 'Cảng Biển FC', 'Sài Gòn Xanh', 'Xứ Nghệ FC', 'Thành Nam FC', 'Đất Võ FC', 'Miền Tây United', 'Hoa Ban FC'];
  const FOREIGN_TEAMS = {
    'Thái Lan': ['Buriram United', 'Port FC', 'BG Pathum United', 'Bangkok United', 'Muangthong United', 'Chiang Rai United', 'Chonburi FC', 'Ratchaburi FC'],
    'Nhật Bản / Hàn Quốc': ['Yokohama F. Marinos', 'Ulsan HD', 'Cerezo Osaka', 'Kawasaki Frontale', 'Jeonbuk Hyundai', 'Urawa Reds', 'Pohang Steelers', 'Vissel Kobe'],
    'châu Âu': ['Sint-Truiden', 'Real Sociedad', 'Feyenoord', 'Ajax', 'Celtic', 'Porto', 'Club Brugge', 'Benfica'],
  };
  const LEAGUE_ROUNDS = 10, LEAGUE_HAX = 3;
  const leagueOn = () => !!(S && S.job && S.job.id === 'cauthu' && S.job.level >= 1 && !S.jail);
  function leagueName() { const c = S.job.club; if (!c) return 'V-League 1'; return { 'Thái Lan': 'Thai League 1', 'Nhật Bản / Hàn Quốc': 'J-League / K-League', 'châu Âu': 'Giải VĐQG châu Âu' }[c.country] || 'Giải VĐQG ' + c.country; }
  function myClub() { if (S.job.club) return S.job.club.name; if (!S.job.clubName) S.job.clubName = U.pick(VN_CLUBS); return S.job.clubName; }
  const myStr = () => U.clamp(42 + S.job.perf * 0.32 + S.job.level * 3 + (S.stats.health - 60) / 8, 35, 90);
  function ensureLeague() {
    if (!leagueOn()) return null;
    const me = myClub();
    if (S.league && S.league.year === S.year && S.league.me === me) return S.league;
    const pool = (S.job.club ? FOREIGN_TEAMS[S.job.club.country] || VN_CLUBS : VN_CLUBS).filter((n) => n !== me);
    const names = U.shuffle(pool.slice()).slice(0, 7);
    const teams = [{ name: me, me: true, str: 0 }].concat(names.map((n) => ({ name: n, str: U.randi(42, 80) }))).map((t) => Object.assign(t, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
    S.league = { year: S.year, me, name: leagueName(), teams, round: 0, hax: 0, goals: 0, apps: 0, log: [], pend: null };
    return S.league;
  }
  const poisson = (l) => { let k = 0, p = Math.exp(-l), s = p; const u = Math.random(); while (u > s && k < 9) { k++; p *= l / k; s += p; } return k; };
  function lgRecord(a, b, ga, gb) {
    a.p++; b.p++; a.gf += ga; a.ga += gb; b.gf += gb; b.ga += ga;
    if (ga > gb) { a.w++; b.l++; a.pts += 3; } else if (ga < gb) { b.w++; a.l++; b.pts += 3; } else { a.d++; b.d++; a.pts++; b.pts++; }
  }
  function lgAuto(a, b) { const sa = a.me ? myStr() : a.str, sb = b.me ? myStr() : b.str; return [poisson(2.6 * sa / (sa + sb)), poisson(2.6 * sb / (sa + sb))]; }
  // một vòng: đội của bạn gặp `foe` (nếu đã đá thật thì truyền kết quả), các đội còn lại ghép cặp ngẫu nhiên
  function lgRound(Lg, foe, res) {
    const me = Lg.teams[0], rest = Lg.teams.slice(1).filter((t) => t !== foe);
    const opp = foe || rest.splice(U.randi(0, rest.length - 1), 1)[0];
    const [gf, ga] = res || lgAuto(me, opp);
    lgRecord(me, opp, gf, ga);
    let mine = res ? res[2] : 0;
    if (!res) for (let i = 0; i < gf; i++) if (Math.random() < 0.22 + S.job.perf / 450) mine++;
    Lg.goals += mine; Lg.apps++;
    Lg.log.push({ r: Lg.round + 1, foe: opp.name, gf, ga, mine, real: !!res });
    U.shuffle(rest);
    for (let i = 0; i + 1 < rest.length; i += 2) { const [x, y] = lgAuto(rest[i], rest[i + 1]); lgRecord(rest[i], rest[i + 1], x, y); }
    Lg.round++;
    return { opp, gf, ga, mine };
  }
  const lgSorted = (Lg) => Lg.teams.slice().sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
  function leagueView() {
    const Lg = ensureLeague(); if (!Lg) return null;
    const rank = lgSorted(Lg).findIndex((t) => t.me) + 1;
    return { name: Lg.name, club: Lg.me, round: Lg.round, rounds: LEAGUE_ROUNDS, haxLeft: Math.max(0, Math.min(LEAGUE_HAX - Lg.hax, LEAGUE_ROUNDS - Lg.round)), goals: Lg.goals, apps: Lg.apps, rank,
      table: lgSorted(Lg).map((t, i) => ({ pos: i + 1, name: t.name, me: !!t.me, p: t.p, w: t.w, d: t.d, l: t.l, gd: t.gf - t.ga, pts: t.pts })),
      log: Lg.log.slice(-4).reverse().map((x) => 'Vòng ' + x.r + ': ' + Lg.me + ' ' + x.gf + '–' + x.ga + ' ' + x.foe + (x.mine ? ' (bạn ghi ' + x.mine + ')' : '') + (x.real ? ' ⚽' : '')),
      contract: S.job.club ? null : Math.round((S.job.contract || 1) * 100) / 100, hist: (S.leagueHist || []).slice(-5).reverse() };
  }
  // ra sân vòng tới: trả về đối thủ + độ khó để giao diện mở trận Hax
  function leagueNext() {
    const Lg = ensureLeague(); if (!Lg) return fail('Chỉ cầu thủ chuyên nghiệp mới có mùa giải.');
    if (Lg.round >= LEAGUE_ROUNDS) return fail('Mùa giải năm nay đã đá xong.');
    if (Lg.hax >= LEAGUE_HAX) return fail('Năm nay bạn đã tự ra sân đủ ' + LEAGUE_HAX + ' trận, các vòng còn lại tính theo phong độ.');
    if (S.illnesses.some((i) => !i.hidden && (i.id === 'daychang' || i.id === 'chanthuong'))) return fail('Bạn đang chấn thương, chưa ra sân được.');
    const others = Lg.teams.slice(1), sorted = lgSorted(Lg), top = sorted.slice(0, 2).filter((t) => !t.me);
    const foe = Lg.round >= LEAGUE_ROUNDS - 2 && top.length ? top[0] : U.pick(others);
    Lg.pend = foe.name;
    const big = sorted.indexOf(foe) <= 1 || Lg.round >= LEAGUE_ROUNDS - 2;
    changed();
    return { ok: true, foe: foe.name, round: Lg.round + 1, title: Lg.name + ' · vòng ' + (Lg.round + 1) + ': ' + Lg.me + ' – ' + foe.name, need: U.clamp((foe.str - myStr()) / 60 + 0.45, 0.2, 0.85), map: big ? 'big' : 'classic', size: 4, skills: { charge: S.stats.health >= 55, curve: S.stats.smarts >= 55 || S.job.level >= 2 }, big };
  }
  function leagueResult(gf, ga, mine) {
    const Lg = ensureLeague(); if (!Lg || !Lg.pend) return fail('Không có trận nào đang chờ.');
    const foe = Lg.teams.find((t) => t.name === Lg.pend); Lg.pend = null; if (!foe) return fail('Đối thủ không còn.');
    gf = U.clamp(Math.round(gf || 0), 0, 20); ga = U.clamp(Math.round(ga || 0), 0, 20); mine = U.clamp(Math.round(mine || 0), 0, gf);
    Lg.hax++;
    lgRound(Lg, foe, [gf, ga, mine]);
    const deltas = {}, win = gf > ga, draw = gf === ga;
    S.job.perf = r100(S.job.perf + (win ? 5 : draw ? 1 : -4) + mine * 2);
    addStat('happy', win ? 5 : draw ? 1 : -3, deltas);
    if (mine >= 3) { addStat('happy', 4, deltas); if (S.social) S.social.followers += 2000 + Math.round(S.social.followers * 0.03); }
    const rank = lgSorted(Lg).findIndex((t) => t.me) + 1;
    const text = 'Vòng ' + Lg.round + ': ' + Lg.me + ' ' + gf + '–' + ga + ' ' + foe.name + '. ' + (mine >= 3 ? 'HAT-TRICK! Bạn ghi ' + mine + ' bàn, báo chí gọi bạn là "người hùng của vòng đấu". ' : mine ? 'Bạn ghi ' + mine + ' bàn. ' : '') + (win ? 'Ba điểm quý giá!' : draw ? 'Chia điểm.' : 'Trận thua đáng tiếc, HLV không hài lòng.') + ' ' + Lg.me + ' đang đứng thứ ' + rank + '/' + Lg.teams.length + '.';
    addLog('⚽ ' + text, win ? 'good' : draw ? 'neutral' : 'bad', '⚽'); changed();
    return result({ title: '⚽ ' + Lg.name + ' · vòng ' + Lg.round, icon: '⚽', text, tone: win ? 'good' : draw ? 'neutral' : 'bad', deltas, scene: sceneFor('stadium', { anim: win ? 'cheer' : draw ? 'shrug' : 'sad', fx: win ? 'confetti' : null }) });
  }
  // cuối năm: đá nốt các vòng, xếp hạng, thưởng, rồi mở kỳ chuyển nhượng
  function leagueYear(L, deltas) {
    if (!leagueOn()) { S.league = null; return; }
    const Lg = ensureLeague(); if (!Lg) return;
    Lg.pend = null;
    while (Lg.round < LEAGUE_ROUNDS) lgRound(Lg);
    const tab = lgSorted(Lg), rank = tab.findIndex((t) => t.me) + 1, cm = S.job.club ? S.job.club.mult : (S.job.contract || 1);
    const topOther = U.randi(6, 12);
    L('Kết thúc ' + Lg.name + ': ' + Lg.me + ' xếp thứ ' + rank + '/' + tab.length + ' với ' + tab[rank - 1].pts + ' điểm. Bạn ra sân ' + Lg.apps + ' trận, ghi ' + Lg.goals + ' bàn.', rank <= 3 ? 'good' : 'neutral', '📊');
    if (rank === 1) { const b = pay(U.rand(2e8, 6e8) * cm); addMoney(b, deltas); addStat('happy', 10, deltas); S.job.perf = r100(S.job.perf + 8); S.counters.leagueTitles = (S.counters.leagueTitles || 0) + 1; if (S.social) S.social.followers += 20000 + Math.round(S.social.followers * 0.1); L('🏆 VÔ ĐỊCH ' + Lg.name.toUpperCase() + '! Bạn nâng cúp giữa pháo hoa, thưởng vô địch ' + fmtMoney(b) + '.', 'milestone', '🏆'); }
    if (Lg.goals >= topOther) { const b = pay(U.rand(1e8, 3e8) * cm); addMoney(b, deltas); addStat('happy', 6, deltas); S.counters.topScorer = (S.counters.topScorer || 0) + 1; L('👟 Vua phá lưới ' + Lg.name + ' với ' + Lg.goals + ' bàn! Thưởng ' + fmtMoney(b) + '.', 'milestone', '👟'); }
    if (rank === tab.length && !S.job.club) { S.job.perf = r100(S.job.perf - 6); addStat('happy', -6, deltas); L(Lg.me + ' xếp bét bảng và phải xuống hạng. Ban lãnh đạo cắt giảm lương cả đội.', 'bad', '📉'); S.job.contract = Math.max(0.6, (S.job.contract || 1) * 0.85); }
    S.leagueHist = (S.leagueHist || []).concat([{ year: S.year, club: Lg.me, league: Lg.name, rank, goals: Lg.goals }]).slice(-12);
    transferCheck(rank, Lg.goals, tab.length);
  }
  // ---- 44. KỲ CHUYỂN NHƯỢNG: CLB khác hỏi mua → sang đội mới, đòi tăng lương, hay ở lại vì tình yêu CLB
  function transferCheck(rank, goals, n) {
    if (S.job.club || S.pending.length >= 3 || P().age > 33) return;
    const perf = S.job.perf, p = 0.12 + Math.max(0, perf - 55) / 120 + (rank <= 2 ? 0.15 : 0) + goals / 60 + (rank === n ? 0.2 : 0);
    if (Math.random() > p) return;
    const cur = myClub(), club = U.pick(VN_CLUBS.filter((c) => c !== cur)), mult = Math.round((S.job.contract || 1) * U.rand(1.3, 2.1) * 100) / 100;
    S.flags.transfer = { club, mult, fee: pay(U.rand(3e8, 1.5e9) * mult), bonus: pay(U.rand(5e7, 2.5e8) * mult) };
    queueMilestone('ms_transfer');
  }
  // sự kiện được tạo lúc còn đá bóng; tới lúc bấm chọn mà đã giải nghệ / thất nghiệp thì lời mời không còn hiệu lực
  function transferChoice(k) {
    const gone = () => ({ text: 'Khi bạn gọi lại cho người đại diện thì đã muộn: bạn không còn khoác áo cầu thủ chuyên nghiệp nữa, và ' + ((S.flags.transfer && S.flags.transfer.club) || 'CLB kia') + ' đã rút lại lời mời. Bạn thở dài nhìn đôi giày đá bóng treo trên tường.', effects: { happy: -2 }, scene: { loc: 'home', anim: 'sad' }, tone: 'neutral' });
    if (!S.job || S.job.id !== 'cauthu') return { key: k, label: k === 'di' ? '✍️ Nhận lời mời chuyển nhượng' : k === 'gia' ? '💰 Đòi tăng lương' : '❤️ Ở lại', fn: gone };
    const c = transferChoice0(k), f = c.fn;
    c.fn = () => (S.job && S.job.id === 'cauthu' ? f() : gone());
    return c;
  }
  function transferChoice0(k) {
    const o = S.flags.transfer || { club: 'một CLB lớn', mult: 1.5, fee: 5e8, bonus: 1e8 }, cur = (S.job && S.job.id === 'cauthu' && myClub()) || 'đội bóng cũ';
    if (k === 'di') return { key: k, label: '✍️ Sang ' + o.club + ' (lương ×' + String(o.mult).replace('.', ',') + ', thưởng ký ' + fmtMoney(o.bonus) + ')', fn: () => {
      S.job.clubName = o.club; S.job.contract = o.mult; S.job.perf = r100(Math.max(S.job.perf, 58)); S.league = null;
      if (S.social) S.social.followers += 5000 + Math.round(S.social.followers * 0.05);
      return { text: 'Thương vụ được chốt với mức phí ' + fmtMoney(o.fee) + '. Bạn ra mắt ' + o.club + ' trong vòng tay của hàng nghìn cổ động viên. Một số fan ' + cur + ' đốt áo bạn trên mạng, gọi bạn là "kẻ phản bội".', effects: { money: o.bonus, happy: 8 }, scene: { loc: 'stadium', anim: 'wave', fx: 'confetti' }, tone: 'good' }; } };
    if (k === 'gia') { const p = U.clamp(0.35 + (S.job.perf - 60) / 80, 0.15, 0.85); return { key: k, label: '💰 Dùng lời mời để đòi ' + cur + ' tăng lương', mini: 'haggle', odds: () => p, fn: () => miniWin(p)
      ? (S.job.contract = Math.round((S.job.contract || 1) * 1.35 * 100) / 100, { text: cur + ' sợ mất bạn, đồng ý tăng lương 35% và đưa bạn lên làm phó đội trưởng. Bạn ở lại với hợp đồng mới tốt hơn hẳn.', effects: { happy: 6 }, scene: { loc: 'office', anim: 'cheer' }, tone: 'good' })
      : (S.job.perf = r100(S.job.perf - 6), { text: 'Ban lãnh đạo ' + cur + ' phật ý vì bị "ép giá", còn ' + o.club + ' thì đã quay sang mua người khác. Bạn ở lại, nhưng bị HLV cho dự bị vài trận.', effects: { happy: -6 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }) }; }
    return { key: 'o', label: '❤️ Ở lại vì tình yêu với ' + cur, fn: () => { if (S.social) S.social.followers += 3000; S.karma = r100(S.karma + 2); return { text: 'Bạn từ chối ' + o.club + '. Khi tin được công bố, khán đài sân nhà treo băng rôn "Mãi là người của chúng ta". Lương không tăng, nhưng bạn có thứ tiền không mua được.', effects: { happy: 5 }, scene: { loc: 'stadium', anim: 'love', fx: 'hearts' }, tone: 'good' }; } };
  }
  ms({ id: 'ms_transfer', title: 'Kỳ chuyển nhượng', icon: '🔁', age: [17, 36],
    text: 'Người đại diện gọi điện lúc nửa đêm: một CLB khác vừa gửi đề nghị chính thức để mua bạn. Mức lương cao hơn hẳn, nhưng bạn đã gắn bó với đội bóng hiện tại, với khán đài quen thuộc.',
    scene: { loc: 'stadium', anim: 'phone', expr: 'surprised', fx: 'sparkle' },
    choicesFn: () => (S.job && S.job.id === 'cauthu' ? ['di', 'gia', 'o'] : ['o']).map(transferChoice), choiceByKey: transferChoice });
  // ================================================================== ĐỢT B (17/10): truyền hình · chuỗi cửa hàng · leo chức trong cơ quan
  // ---- 54. AI LÀ TRIỆU PHÚ: qua vòng sơ tuyển thì lên ghế nóng (minigame 'millionaire' trả về số câu giữ được / 15)
  const TP_PRIZES = [0, 2e5, 4e5, 6e5, 1e6, 2e6, 3e6, 6e6, 1e7, 1.4e7, 2.2e7, 3e7, 4e7, 8e7, 1.5e8, 2.5e8];
  ms({ id: 'ms_trieuphu', title: 'Ai là triệu phú', icon: '💰', age: [18, 99],
    text: 'Đèn trường quay bật sáng, nhạc hiệu vang lên. MC mỉm cười: "Xin mời bạn ngồi vào ghế nóng!" 15 câu hỏi đang chờ, giải cao nhất 250 triệu đồng. Cả nhà đang ngồi xem trước màn hình.',
    scene: { loc: 'studio', anim: 'sit', fx: 'sparkle', shot: 'close', npcs: [{ role: 'stranger', anim: 'talk', say: 'Bạn đã sẵn sàng chưa?' }, { role: 'crowd', anim: 'clap' }] },
    choices: [
      { label: '💺 Ngồi vào ghế nóng', mini: 'millionaire', odds: () => U.clamp(0.25 + (S.stats.smarts - 50) / 90, 0.1, 0.9), fn: () => {
        let idx;
        if (MINI != null) idx = Math.round(MINI * 15);
        else { idx = 0; let safe = 0; for (let q = 1; q <= 15; q++) { const p = U.clamp(0.97 - q * 0.045 + (S.stats.smarts - 60) / 150, 0.2, 0.98); if (p < 0.55 && q > 5) break; if (Math.random() < p) { idx = q; if (q === 5 || q === 10) safe = q; } else { idx = safe; break; } } }
        const prize = TP_PRIZES[U.clamp(idx, 0, 15)], s = soc();
        if (idx >= 10) s.followers += 3000 + idx * 1500;
        if (idx >= 15) unlockSafe('millionaire');
        S.counters.tpBest = Math.max(S.counters.tpBest || 0, idx);
        return { text: idx >= 15 ? 'BẠN LÀ TRIỆU PHÚ! Mưa giấy vàng rơi đầy trường quay. 250 triệu đồng, và cả nước biết mặt bạn.' : idx >= 10 ? 'Bạn vượt qua mốc 10 câu, mang về ' + fmtMoney(prize) + '. Hàng xóm kéo nhau sang nhà chúc mừng.' : idx >= 5 ? 'Bạn qua được mốc an toàn đầu tiên, mang về ' + fmtMoney(prize) + '. Không nhiều, nhưng là một kỷ niệm đáng nhớ.' : 'Bạn dừng chân sớm' + (prize ? ', mang về ' + fmtMoney(prize) : ' và ra về tay trắng') + '. Ít ra cũng được lên tivi một lần!', effects: { money: prize, happy: idx >= 10 ? 10 : idx >= 5 ? 4 : -2, smarts: 1 }, scene: { loc: 'studio', anim: idx >= 10 ? 'cheer' : idx >= 5 ? 'clap' : 'facepalm', fx: idx >= 10 ? ['confetti', 'money'] : null }, tone: idx >= 15 ? 'milestone' : idx >= 5 ? 'good' : 'neutral' };
      } },
      { label: '😰 Run quá, xin rút lui trước giờ quay', fn: () => ({ text: 'Bạn xin lỗi ban tổ chức rồi lặng lẽ ra về. Tối đó xem chương trình, bạn trả lời đúng cả 5 câu đầu… ở nhà.', effects: { happy: -3 }, scene: { loc: 'home', anim: 'facepalm' } }) },
    ] });
  // ---- 53. THI HÁT TRUYỀN HÌNH "Giọng Ca Vàng": giấu mặt → đối đầu → liveshow → chung kết (minigame 'sing')
  const SING_R = [['Vòng giấu mặt', 'Bạn đứng sau tấm màn, bốn chiếc ghế xoay lưng về phía bạn. Chỉ có giọng hát mới khiến họ quay lại.'], ['Vòng đối đầu', 'Bạn và một thí sinh khác cùng hát trên một sân khấu hình võ đài. Chỉ một người đi tiếp.'], ['Liveshow', 'Sân khấu lớn, khán giả bình chọn qua tin nhắn. Mỗi tuần một người ra về.'], ['Đêm chung kết', 'Đêm chung kết truyền hình trực tiếp. Hàng triệu người đang xem, bố mẹ bạn ngồi hàng ghế đầu.']];
  const singP = (r) => U.clamp(0.42 + (S.stats.happy + S.stats.looks - 110) / 260 + (S.job && ['casi', 'nhaccong'].includes(S.job.id) ? 0.12 : 0) - r * 0.07, 0.15, 0.85);
  function singChoice(r) {
    return (k) => {
      if (k === 'bo') return { key: k, label: '🏳️ Rút lui', fn: () => ({ text: 'Bạn rút khỏi cuộc thi. Ê-kíp tiếc, khán giả tiếc, nhưng bạn thấy nhẹ lòng.', effects: { happy: -2 }, scene: { loc: 'studio', anim: 'bow' } }) };
      const p = singP(r), style = k === 'bolero' ? 'bolero' : 'nhạc trẻ';
      return { key: k, label: k === 'bolero' ? '🎻 Hát bolero sâu lắng' : '🎸 Hát nhạc trẻ sôi động', mini: 'sing', odds: () => p, fn: () => {
        const s = soc(), win = miniWin(p);
        if (!win) { s.followers += 300 * (r + 1); return { text: SING_R[r][0] + ': bạn hát ' + style + ' nhưng ' + (r === 0 ? 'không huấn luyện viên nào quay ghế.' : 'dừng chân tại đây.') + ' Clip phần thi vẫn được chia sẻ, có người khen "giọng có màu".', effects: { happy: r ? 2 : -4 }, scene: { loc: 'studio', anim: r ? 'bow' : 'sad' }, tone: r ? 'neutral' : 'bad' }; }
        s.followers += [2000, 6000, 20000, 0][r];
        if (r < 3) { queueMilestone('ms_hat_' + (r + 1)); return { text: SING_R[r][0] + ': bạn hát ' + style + ' cực kỳ cảm xúc' + (r === 0 ? ', cả bốn ghế lần lượt quay lại!' : ', giành vé đi tiếp!') + ' Vòng tiếp theo đang chờ.', effects: { happy: 6 }, scene: { loc: 'studio', time: 'night', anim: 'sing', fx: 'music' }, tone: 'good' }; }
        const prize = 5e8; s.followers += 200000 + Math.round(s.followers * 0.3); S.flags.singStar = S.year; unlockSafe('sing_champ');
        let extra = '';
        if (!S.job && P().age >= 16) { hire('casi'); S.job.level = 1; extra = ' Một công ty giải trí ký hợp đồng ngay trong đêm: bạn chính thức thành ca sĩ!'; }
        else if (S.job && S.job.id === 'casi') { S.job.perf = r100(S.job.perf + 20); extra = ' Sự nghiệp ca hát của bạn sang một trang mới.'; }
        else extra = ' Các công ty giải trí gọi điện mời ký hợp đồng (ứng tuyển ca sĩ giờ dễ như trở bàn tay).';
        return { text: '🏆 QUÁN QUÂN GIỌNG CA VÀNG! Pháo giấy phủ kín sân khấu, bạn nâng cúp trong nước mắt. Giải thưởng 500 triệu đồng.' + extra, effects: { money: prize, happy: 18 }, scene: { loc: 'studio', time: 'night', anim: 'cheer', fx: ['confetti', 'fireworks'] }, tone: 'milestone' };
      } };
    };
  }
  SING_R.forEach(([name, text], r) => ms({ id: 'ms_hat_' + r, title: 'Giọng Ca Vàng · ' + name, icon: '🎤', age: [15, 45], text,
    scene: { loc: 'studio', time: 'night', anim: 'sing', fx: 'music', shot: r === 3 ? 'dramatic' : 'close', npcs: [{ role: 'crowd', anim: 'clap' }] },
    choicesFn: () => ['tre', 'bolero', 'bo'].map(singChoice(r)), choiceByKey: singChoice(r) }));
  // ---- 55. CHUỖI CHI NHÁNH + NHƯỢNG QUYỀN cho công ty riêng
  function chainInfo() {
    const c = S && S.company; if (!c) return null; const ind = coInd(c.ind);
    const br = c.branches || 1, fr = c.franchise || 0;
    const cost = pay(ind.cost * 0.55 * (1 + (br - 1) * 0.2));
    return { branches: br, franchise: fr, branchCost: cost, branchCostText: fmtMoney(cost), canBranch: br < 30 && S.money >= cost && !S.jail, canFranchise: br >= 3 && fr < br * 4 && !S.jail, feeText: fmtMoney(pay(ind.cost * 0.04)), why: br >= 30 ? 'Đã đủ 30 chi nhánh' : S.money < cost ? 'Cần ' + fmtMoney(cost) : null, frWhy: br < 3 ? 'Cần ít nhất 3 chi nhánh tự vận hành để có thương hiệu' : null };
  }
  function chainAction(kind) {
    const c = S && S.company, inf = chainInfo(); if (!c || !inf) return fail('Bạn chưa có công ty.');
    const ind = coInd(c.ind), deltas = {};
    if ((S.yearActs.chain || 0) >= 2) return fail('Mỗi năm chỉ mở rộng được 2 lần, kẻo vỡ bộ máy.');
    if (kind === 'branch') {
      if (!inf.canBranch) return fail(inf.why || 'Chưa mở được chi nhánh.');
      S.yearActs.chain = (S.yearActs.chain || 0) + 1;
      addMoney(-inf.branchCost, deltas); c.branches = inf.branches + 1; c.val += Math.round(inf.branchCost * 0.85); c.staff += 6;
      changed();
      return result({ title: '🏪 Mở chi nhánh thứ ' + c.branches, icon: '🏪', text: 'Bạn bỏ ' + fmtMoney(inf.branchCost) + ' mở chi nhánh thứ ' + c.branches + ' của ' + c.name + '. Càng nhiều chi nhánh thì doanh thu càng lớn, nhưng cũng càng khó quản: quản lý ăn chặn, chất lượng không đều…', tone: 'good', deltas, scene: sceneFor(ind.loc || 'office', { anim: 'cheer', fx: 'confetti', npcs: [{ role: 'crowd', anim: 'clap' }] }) });
    }
    if (kind === 'franchise') {
      if (!inf.canFranchise) return fail(inf.frWhy || 'Chưa bán nhượng quyền được.');
      S.yearActs.chain = (S.yearActs.chain || 0) + 1;
      const n = U.randi(1, 3) + Math.floor(inf.branches / 5), fee = pay(ind.cost * 0.12 * n);
      c.franchise = inf.franchise + n; addMoney(fee, deltas); changed();
      return result({ title: '🤝 Bán nhượng quyền', icon: '🤝', text: n + ' đối tác mua nhượng quyền thương hiệu ' + c.name + ', trả phí ban đầu ' + fmtMoney(fee) + '. Từ nay mỗi năm họ nộp phí thương hiệu cho bạn — nhưng nếu họ làm ăn ẩu, tiếng xấu sẽ đổ lên đầu bạn.', tone: 'good', deltas, scene: sceneFor('office', { anim: 'bow', fx: 'money' }) });
    }
    return fail('Không rõ thao tác.');
  }
  function chainYear(L, deltas) {
    const c = S.company; if (!c) return;
    const ind = coInd(c.ind), br = c.branches || 1, fr = c.franchise || 0;
    if (br > 1) { const extra = Math.round(c.val * ind.margin * 0.02 * (br - 1) * U.rand(0.5, 1.3) * c.own / 1e5) * 1e5; if (extra > 0) { addMoney(extra, deltas); L('🏪 ' + br + ' chi nhánh của ' + c.name + ' mang về thêm ' + fmtMoney(extra) + '.', 'good', '🏪'); } }
    if (fr) { const fee = pay(ind.cost * 0.04 * fr * U.rand(0.7, 1.2)); addMoney(fee, deltas); L('🤝 Phí thương hiệu từ ' + fr + ' cửa hàng nhượng quyền: ' + fmtMoney(fee) + '.', 'good', '🤝'); }
    if ((br >= 3 || fr >= 2) && !S.jail && S.pending.length < 3 && Math.random() < 0.3) { S.flags.chainEv = fr >= 2 && Math.random() < 0.5 ? 'fr' : 'ql'; if (MS.ms_chain) MS.ms_chain.text = S.flags.chainEv === 'fr' ? 'Một cửa hàng nhượng quyền mang tên bạn bị khách quay clip: đồ ăn ôi thiu, nhân viên thái độ. Clip đang có hàng triệu lượt xem, ai cũng gắn tên thương hiệu của bạn.' : 'Doanh thu một chi nhánh giảm mạnh dù khách vẫn đông. Kế toán nghi quản lý chi nhánh đang ăn chặn tiền hàng.'; queueMilestone('ms_chain'); }
  }
  function chainChoice(k) {
    const c = S.company || { name: 'công ty', val: 0, branches: 1 }, frEv = S.flags.chainEv === 'fr';
    if (frEv) {
      if (k === 'cat') return { key: k, label: '✂️ Cắt hợp đồng, công khai xin lỗi khách', fn: () => { c.franchise = Math.max(0, (c.franchise || 1) - 1); return { text: 'Bạn chấm dứt hợp đồng với đối tác làm ăn ẩu và đăng lời xin lỗi khách hàng. Khách cảm kích vì sự minh bạch, thương hiệu giữ được uy tín.', effects: { happy: 2, karma: 2 }, scene: { loc: 'office', anim: 'bow' }, tone: 'good' }; } };
      if (k === 'dao') return { key: k, label: '🎓 Cử người xuống đào tạo lại', fn: () => Math.random() < 0.6 ? { text: 'Sau hai tháng đào tạo lại, cửa hàng nhượng quyền đạt chuẩn. Đối tác còn mở thêm điểm mới.', effects: { happy: 3 }, scene: { loc: 'office', anim: 'nod' }, tone: 'good' } : (c.val = Math.round(c.val * 0.93), { text: 'Đào tạo xong vẫn chứng nào tật nấy. Thêm một clip bóc phốt nữa, định giá công ty giảm 7%.', effects: { happy: -5 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }) };
      return { key: 'lo', label: '🙈 Lờ đi, đằng nào họ cũng nộp phí đủ', fn: () => { c.val = Math.round(c.val * 0.85); return { text: 'Phốt lan rộng: "Chuỗi ' + c.name + ' bán đồ kém chất lượng". Khách tẩy chay cả các chi nhánh của bạn. Định giá giảm 15%.', effects: { happy: -8, karma: -3 }, scene: { loc: 'office', anim: 'facepalm', fx: 'anger' }, tone: 'bad' }; } };
    }
    if (k === 'cat') return { key: k, label: '🔍 Cho kiểm toán, sa thải quản lý', fn: () => ({ text: 'Kiểm toán phát hiện quản lý chi nhánh khai khống nhập hàng suốt một năm. Bạn sa thải và đòi lại được một phần tiền.', effects: { money: pay(c.val * 0.004), happy: 2 }, scene: { loc: 'office', anim: 'angry' }, tone: 'good' }) };
    if (k === 'dao') return { key: k, label: '🤝 Cho cổ phần để giữ chân người giỏi', fn: () => { c.own = Math.max(0.3, c.own - 0.03); return { text: 'Bạn chia 3% cổ phần cho các quản lý chi nhánh. Họ coi công ty như của mình, tình trạng thất thoát giảm hẳn.', effects: { happy: 4 }, scene: { loc: 'office', anim: 'hug' }, tone: 'good' }; } };
    return { key: 'lo', label: '🙈 Làm ngơ, miễn có lãi', fn: () => { c.val = Math.round(c.val * 0.92); return { text: 'Thất thoát âm thầm lan sang các chi nhánh khác. Cuối năm sổ sách thủng một lỗ lớn, định giá giảm 8%.', effects: { happy: -4 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }; } };
  }
  ms({ id: 'ms_chain', title: 'Chuỗi cửa hàng có biến', icon: '🏪', age: [20, 99],
    text: 'Báo cáo từ các chi nhánh gửi về khiến bạn nhíu mày: có điều gì đó không ổn trong chuỗi cửa hàng của mình.',
    scene: { loc: 'office', anim: 'phone', expr: 'worried', fx: 'question' },
    choicesFn: () => {
      return ['cat', 'dao', 'lo'].map(chainChoice);
    }, choiceByKey: chainChoice });
  // ---- 56. LEO CHỨC TRONG CƠ QUAN: phe phái, thi đua, phong bì, điều chuyển, lấy phiếu tín nhiệm
  const OFFICE_JOBS = ['congchuc', 'chinhtri', 'canhsat', 'giaovien', 'cuuhoa'];
  const BOSSES = [['anh Hùng', 'Phó giám đốc Hùng, năng nổ, quan hệ rộng'], ['chị Lan', 'Phó giám đốc Lan, cẩn trọng, được lòng cấp trên']];
  const offOn = () => !!(S && S.job && OFFICE_JOBS.includes(S.job.id) && !S.jail);
  function office() { if (!S.office || S.office.job !== S.job.id) S.office = { job: S.job.id, phe: null, pheYear: 0, winner: null, tin: 50, bribes: 0, moved: false }; return S.office; }
  function officeView() {
    if (!offOn()) return null; const o = office();
    return { tin: Math.round(o.tin), phe: o.phe > 0 ? BOSSES[o.phe - 1][0] : null, winner: o.winner > 0 ? BOSSES[o.winner - 1][0] : null, moved: o.moved, bribes: o.bribes, level: D.CAREERS[S.job.id].levels[S.job.level].title || '' };
  }
  function officeYear(L) {
    if (!offOn() || S.pending.length >= 3) return;
    const o = office();
    o.tin = U.clamp(o.tin + (S.job.perf - 55) / 15 + (S.karma - 50) / 40, 0, 100);
    // phe phái phân thắng bại sau 2 năm
    if (o.phe && !o.winner && S.year - o.pheYear >= 2) { o.winner = Math.random() < 0.5 ? 1 : 2; if (o.phe === o.winner) { o.tin = U.clamp(o.tin + 20, 0, 100); S.job.perf = r100(S.job.perf + 10); L('🏛️ ' + BOSSES[o.winner - 1][0] + ' lên làm giám đốc. Là "người của sếp", bạn được tin dùng hẳn.', 'good', '🏛️'); } else if (o.phe > 0) { o.tin = U.clamp(o.tin - 20, 0, 100); queueMilestone('ms_cq_dieuchuyen'); return; } }
    const r = Math.random();
    if (!o.phe && S.job.years >= 1 && r < 0.3) queueMilestone('ms_cq_phe');
    else if (r < 0.5) queueMilestone('ms_cq_phongbi');
    else if (r < 0.68) queueMilestone('ms_cq_thidua');
    else if (r < 0.85 && S.job.level < D.CAREERS[S.job.id].levels.length - 1 && S.job.levelYears >= 2) queueMilestone('ms_cq_phieu');
  }
  const tinAdd = (v) => { if (S.office) S.office.tin = U.clamp(S.office.tin + v, 0, 100); };
  ms({ id: 'ms_cq_phe', title: 'Chia phe trong cơ quan', icon: '🏛️', age: [20, 65],
    text: 'Giám đốc sắp nghỉ hưu. Hai phó giám đốc ngấm ngầm tranh ghế: ' + BOSSES[0][1] + ', và ' + BOSSES[1][1] + '. Cả cơ quan chia làm hai phe, ai cũng nhìn xem bạn đứng về đâu.',
    scene: { loc: 'office', anim: 'think', fx: 'question', npcs: [{ role: 'boss', anim: 'talk', say: 'Em thấy thế nào?' }, { role: 'coworker', anim: 'phone' }] },
    choices: [
      { label: '🤝 Theo ' + BOSSES[0][0], fn: () => { const o = office(); o.phe = 1; o.pheYear = S.year; return { text: 'Bạn ở lại nhậu với nhóm ' + BOSSES[0][0] + ' sau giờ làm. Từ hôm đó bạn được giao nhiều việc "quan trọng" hơn. Giờ chỉ mong sếp mình thắng.', effects: { happy: 1 }, scene: { loc: 'cafe', anim: 'drink' } }; } },
      { label: '🤝 Theo ' + BOSSES[1][0], fn: () => { const o = office(); o.phe = 2; o.pheYear = S.year; return { text: 'Bạn chủ động giúp ' + BOSSES[1][0] + ' hoàn thiện báo cáo gửi cấp trên. Chị ấy nhớ tên bạn. Giờ chỉ mong sếp mình thắng.', effects: { happy: 1 }, scene: { loc: 'office', anim: 'type' } }; } },
      { label: '😐 Đứng giữa, chỉ lo làm việc', fn: () => { const o = office(); o.phe = -1; o.pheYear = S.year; o.winner = -1; tinAdd(5); return { text: 'Bạn không theo ai. Không ai kéo bạn lên, nhưng cũng chẳng ai nỡ dìm bạn xuống. Đồng nghiệp tin bạn hơn vì sự công tâm.', effects: { happy: 1, karma: 1 }, scene: { loc: 'office', anim: 'type' } }; } },
    ] });
  ms({ id: 'ms_cq_dieuchuyen', title: 'Bị điều chuyển', icon: '🚌', age: [20, 65],
    text: 'Sếp của bạn thua cuộc. Giám đốc mới ký quyết định "luân chuyển cán bộ": bạn về công tác ở một huyện miền núi cách nhà 200 cây số, thời hạn ba năm.',
    scene: { loc: 'office', anim: 'sad', expr: 'sad', fx: 'rain' },
    choices: [
      { label: '🎒 Chấp nhận, đi rèn luyện', fn: () => { const o = office(); o.moved = true; o.tin = U.clamp(o.tin + 15, 0, 100); return { text: 'Bạn khăn gói lên huyện. Ba năm vất vả nhưng bạn làm được nhiều việc thật cho dân bản. Hồ sơ của bạn dày thêm những thành tích không ai chối được.', effects: { happy: -6, health: -2, karma: 3 }, scene: { loc: 'countryside', anim: 'walk' }, tone: 'neutral' }; } },
      { label: '💸 "Chạy" để được ở lại', fn: () => { const cost = pay(U.rand(2e8, 6e8)); if (Math.random() < 0.65) return { text: 'Bạn gửi ' + fmtMoney(cost) + ' qua một "người quen". Quyết định được rút lại kỳ diệu. Nhưng từ giờ bạn mắc nợ một ân tình mờ ám.', effects: { money: -cost, karma: -5 }, scene: { loc: 'cafe', anim: 'phone' }, tone: 'neutral' }; return { text: 'Người nhận tiền bị bắt vì một vụ khác, khai ra cả bạn. Bạn mất ' + fmtMoney(cost) + ' và bị kỷ luật khiển trách.', effects: { money: -cost, karma: -6, happy: -10, perf: -20 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }; } },
      { label: '📝 Nộp đơn nghỉ việc', fn: () => { S.job = null; return { text: 'Bạn nộp đơn xin nghỉ. Gần chục năm "chạy" theo con đường công chức khép lại, nhưng bạn thấy nhẹ cả người.', effects: { happy: 3 }, scene: { loc: 'home', anim: 'sit' }, tone: 'neutral' }; } },
    ] });
  ms({ id: 'ms_cq_phongbi', title: 'Chiếc phong bì', icon: '✉️', age: [20, 65],
    text: 'Một người đến nhờ bạn "xem xét nhanh" hồ sơ của họ. Lúc ra về, họ để lại trên bàn một chiếc phong bì dày cộp, cười: "Chút quà cảm ơn thôi ạ."',
    scene: { loc: 'office', anim: 'think', fx: 'money', npcs: [{ role: 'stranger', anim: 'bow', say: 'Mong anh/chị giúp đỡ ạ.' }] },
    choices: [
      { label: '💰 Nhận, "ai cũng thế mà"', fn: () => { const o = office(), v = pay(U.rand(1e7, 8e7) * (1 + S.job.level)); o.bribes++; if (Math.random() < 0.08 * o.bribes) { S.job = null; return { text: 'Thanh tra vào cuộc, lần ra hàng loạt "chiếc phong bì". Bạn bị buộc thôi việc, khai trừ, tên xuất hiện trên báo.', effects: { happy: -20, karma: -10 }, scene: { loc: 'office', anim: 'cry', fx: 'tears' }, tone: 'bad' }; } return { text: 'Bạn lặng lẽ cất phong bì vào ngăn kéo: ' + fmtMoney(v) + '. Hồ sơ kia được "ưu tiên". Đêm đó bạn ngủ không ngon lắm.', effects: { money: v, karma: -5 }, scene: { loc: 'office', anim: 'phone' }, tone: 'neutral' }; } },
      { label: '🙅 Từ chối, trả lại tận tay', fn: () => { tinAdd(6); return { text: 'Bạn chạy theo trả lại phong bì: "Hồ sơ đủ thì em giải quyết đúng hẹn, không cần thế này." Người kia ngượng ngùng cảm ơn. Chuyện lan ra, ai cũng nể bạn.', effects: { karma: 5, happy: 2 }, scene: { loc: 'office', anim: 'shake' }, tone: 'good' }; } },
      { label: '📢 Báo cáo lên trên', fn: () => { tinAdd(Math.random() < 0.6 ? 10 : -10); return { text: 'Bạn lập biên bản, báo cáo lãnh đạo. Có người khen bạn liêm chính, có người bĩu môi "làm màu", và bạn có thêm vài kẻ thù ngầm trong cơ quan.', effects: { karma: 4 }, scene: { loc: 'office', anim: 'type' }, tone: 'good' }; } },
    ] });
  ms({ id: 'ms_cq_thidua', title: 'Báo cáo thi đua cuối năm', icon: '📑', age: [20, 65],
    text: 'Cơ quan tổng kết thi đua. Mỗi người tự viết báo cáo thành tích để xét danh hiệu "Lao động tiên tiến". Chỉ tiêu có hạn, ai cũng muốn có tên.',
    scene: { loc: 'office', anim: 'type', fx: 'idea' },
    choices: [
      { label: '📝 Viết đúng sự thật', fn: () => { const ok = S.job.perf >= 60; tinAdd(ok ? 6 : 2); return { text: ok ? 'Báo cáo khiêm tốn nhưng số liệu thật, bạn được bình bầu danh hiệu. Bằng khen treo trên tường.' : 'Báo cáo trung thực nhưng thành tích chưa nổi bật, năm nay bạn không có tên.', effects: { happy: ok ? 4 : 0, karma: 1, perf: ok ? 4 : 0 }, scene: { loc: 'office', anim: ok ? 'cheer' : 'shrug' }, tone: ok ? 'good' : 'neutral' }; } },
      { label: '✨ Tô hồng số liệu', fn: () => Math.random() < 0.6 ? (tinAdd(3), { text: 'Báo cáo bóng bẩy, đầy con số ấn tượng. Bạn có bằng khen, kèm chút tiền thưởng.', effects: { money: pay(5e6), happy: 3, karma: -2, perf: 3 }, scene: { loc: 'office', anim: 'cheer' }, tone: 'good' }) : (tinAdd(-12), { text: 'Một đồng nghiệp chỉ ra số liệu "ảo". Bạn bị nhắc nhở trước cuộc họp toàn cơ quan. Muối mặt.', effects: { happy: -8, karma: -3, perf: -6 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }) },
      { label: '🤲 Nhường suất cho đồng nghiệp khó khăn', fn: () => { tinAdd(10); return { text: 'Bạn đề xuất nhường danh hiệu cho chị đồng nghiệp đang nuôi con một mình. Cả phòng vỗ tay, sếp ghi nhận "tinh thần tập thể".', effects: { karma: 4, happy: 3 }, scene: { loc: 'office', anim: 'clap' }, tone: 'good' }; } },
    ] });
  ms({ id: 'ms_cq_phieu', title: 'Lấy phiếu tín nhiệm', icon: '🗳️', age: [20, 65],
    text: 'Cơ quan lấy phiếu tín nhiệm để bổ nhiệm vị trí cao hơn, tên bạn nằm trong danh sách. Kết quả phụ thuộc vào uy tín bạn tích lũy bấy lâu — và cả việc bạn có "vận động" hay không.',
    scene: { loc: 'office', anim: 'think', fx: 'question', npcs: [{ role: 'coworker', anim: 'talk' }, { role: 'boss', anim: 'idle' }] },
    choicesFn: () => {
      const o = office(), p = U.clamp(0.2 + o.tin / 150 + (S.job.perf - 50) / 200 + (o.phe > 0 && o.phe === o.winner ? 0.15 : 0) + (o.moved ? 0.1 : 0), 0.08, 0.92);
      return [
        { label: '🙏 Để mọi người tự đánh giá', odds: () => p, fn: () => miniWin(p) ? (promote(), tinAdd(5), { text: 'Bạn đạt tỷ lệ phiếu cao. Quyết định bổ nhiệm được trao tại hội nghị: bạn chính thức lên chức ' + D.CAREERS[S.job.id].levels[S.job.level].title.toLowerCase() + '!', effects: { happy: 10 }, scene: { loc: 'office', anim: 'cheer', fx: 'confetti', npcs: [{ role: 'crowd', anim: 'clap' }] }, tone: 'milestone' }) : { text: 'Số phiếu của bạn chưa đủ quá bán. Lần này người khác được bổ nhiệm. Bạn tự nhủ sẽ cố gắng thêm.', effects: { happy: -5 }, scene: { loc: 'office', anim: 'sad' }, tone: 'bad' } },
        { label: '🍻 Đi "vận động" từng người', odds: () => U.clamp(p + 0.15, 0, 0.95), fn: () => { const ok = Math.random() < U.clamp(p + 0.15, 0, 0.95), cost = pay(U.rand(2e7, 8e7)); if (ok) { promote(); return { text: 'Một tuần liền mời cơm, tặng quà. Phiếu bầu của bạn cao vút, bạn lên chức ' + D.CAREERS[S.job.id].levels[S.job.level].title.toLowerCase() + '. Cái giá: ' + fmtMoney(cost) + ' và một chút lương tâm.', effects: { money: -cost, happy: 6, karma: -3 }, scene: { loc: 'cafe', anim: 'drink', fx: 'confetti' }, tone: 'good' }; } return { text: 'Tốn ' + fmtMoney(cost) + ' tiền "vận động" mà phiếu vẫn không đủ. Có người còn kể lại chuyện bạn đi gõ cửa từng nhà.', effects: { money: -cost, happy: -8, karma: -3 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }; } },
        { label: '🙅 Xin rút tên, nhường người trẻ', fn: () => { tinAdd(8); return { text: 'Bạn xin rút tên để nhường cơ hội cho một đồng nghiệp trẻ. Ai cũng bất ngờ. Năm sau, tên bạn được nhắc đến đầu tiên.', effects: { karma: 3, happy: 1 }, scene: { loc: 'office', anim: 'bow' }, tone: 'good' }; } },
      ];
    } });
  // ================================================================== ĐỢT C: 51. XUẤT KHẨU LAO ĐỘNG + ĐỊNH CƯ
  const XK = {
    nhat: { name: 'Nhật Bản', icon: '🇯🇵', fee: 1.8e8, pay: 3.0e7, word: 'thực tập sinh kỹ năng', names: ['Yuki', 'Hana', 'Kenji', 'Sakura', 'Haruto', 'Aoi'] },
    han: { name: 'Hàn Quốc', icon: '🇰🇷', fee: 1.0e8, pay: 4.0e7, word: 'lao động EPS', exam: true, names: ['Min-ji', 'Ji-woo', 'Seo-yeon', 'Hyun-woo', 'Do-yoon', 'Ha-eun'] },
    dai: { name: 'Đài Loan', icon: '🇹🇼', fee: 1.5e8, pay: 2.2e7, word: 'lao động nhà máy', names: ['Mei', 'Wei', 'Yu-ting', 'Chen', 'Hsin', 'Ling'] },
  };
  const SETTLE = ['Mỹ', 'Canada', 'Úc', 'Đức', 'New Zealand'];
  function xkView() {
    const x = S && S.xk; if (!x) return null; const c = XK[x.c];
    return { country: c.icon + ' ' + c.name, word: c.word, years: x.years, debtText: x.debt > 0 ? fmtMoney(x.debt) : '', sentText: fmtMoney(x.sent || 0), chui: !!x.chui };
  }
  function xkChoice(k) {
    if (k === 'bo') return { key: k, label: '🏠 Thôi, ở nhà làm ăn', fn: () => ({ text: 'Bạn cảm ơn công ty môi giới rồi ra về. Mẹ thở phào: "Ở nhà rau cháo có nhau con ạ."', effects: { happy: 1 }, scene: { loc: 'home', anim: 'hug' } }) };
    const c = XK[k], fee = c.fee, p = U.clamp(0.45 + (S.stats.smarts - 50) / 80, 0.15, 0.9);
    const go = () => {
      const deltas0 = Math.min(fee, Math.max(0, S.money)), debt = fee - deltas0;
      if (Math.random() < 0.1) { S.flags.xkScam = S.year; return { text: 'Công ty môi giới "biến mất" sau khi nhận đủ ' + fmtMoney(fee) + (debt ? ' (trong đó ' + fmtMoney(debt) + ' bạn vay họ hàng)' : '') + '. Trụ sở chỉ còn tấm biển cho thuê. Hàng chục người cùng cảnh khóc ngất trước cửa.', effects: { money: -deltas0, happy: -18 }, scene: { loc: 'street', anim: 'cry', fx: 'tears' }, tone: 'bad' }; }
      if (S.job) S.job = null;
      S.xk = { c: k, since: S.year, years: 0, debt, sent: 0, chui: false }; unlock('abroad');
      return { text: 'Bạn nộp ' + fmtMoney(fee) + ' phí (' + (debt ? 'vay thêm ' + fmtMoney(debt) + ', ' : '') + 'học tiếng 6 tháng ở trung tâm), rồi lên máy bay sang ' + c.name + ' làm ' + c.word + '. Ở sân bay, mẹ dúi vào tay bạn gói ruốc và mấy củ hành khô.', effects: { money: -deltas0, happy: -3 }, scene: { loc: 'airport', anim: 'wave', fx: 'tears' }, tone: 'milestone' };
    };
    const o = { key: k, label: c.icon + ' ' + c.name + ' — ' + c.word + ' (phí ' + fmtMoney(fee) + ', lương ~' + fmtMoney(c.pay) + '/tháng)', fn: () => {
      if (c.exam && !miniWin(p)) return { text: 'Kỳ thi tiếng Hàn EPS-TOPIK khó hơn bạn tưởng. Bạn trượt, phải chờ đợt thi năm sau.', effects: { happy: -5, money: -2e6 }, scene: { loc: 'school', anim: 'facepalm' }, tone: 'bad' };
      return go();
    } };
    if (c.exam) { o.mini = 'quiz'; o.odds = () => p; o.label += ' · cần thi tiếng'; }
    return o;
  }
  ms({ id: 'ms_xkld', title: 'Đi xuất khẩu lao động', icon: '✈️', age: [18, 45],
    text: 'Công ty môi giới trải tờ rơi lên bàn: "Thu nhập 30–40 triệu một tháng, ba năm về xây nhà!" Phí đi không rẻ, nhiều nhà phải vay mượn, cầm sổ đỏ. Bạn chọn đi đâu?',
    scene: { loc: 'office', anim: 'think', fx: 'question', npcs: [{ role: 'stranger', anim: 'talk', say: 'Đi ba năm, về đổi đời!' }] },
    choicesFn: () => ['nhat', 'han', 'dai', 'bo'].map(xkChoice), choiceByKey: xkChoice });
  function xkYear(L, deltas) {
    const x = S.xk; if (!x) return; const c = XK[x.c];
    x.years++;
    const income = Math.round(c.pay * 12 * U.rand(0.8, 1.2) * (x.chui ? 1.25 : 1) / 1e5) * 1e5, save = Math.round(income * 0.55 / 1e5) * 1e5;
    let toHome = save;
    if (x.debt > 0) { const d = Math.min(x.debt, save); x.debt -= d; toHome -= d; }
    if (toHome > 0) addMoney(toHome, deltas);
    x.sent = (x.sent || 0) + save;
    addStat('happy', x.years <= 2 ? -4 : -2, deltas); addStat('health', x.chui ? -3 : -2, deltas);
    L('✈️ Năm thứ ' + x.years + ' ở ' + c.name + (x.chui ? ' (làm chui)' : '') + ': làm ca đêm, tăng ca cuối tuần, dành dụm được ' + fmtMoney(save) + (x.debt > 0 ? ', còn nợ ' + fmtMoney(x.debt) : (toHome > 0 ? ', gửi về nhà ' + fmtMoney(toHome) : '')) + '.', 'neutral', c.icon);
    if (x.chui && Math.random() < 0.18) { S.xk = null; S.flags.xkBan = S.year; addStat('happy', -12, deltas); L('🚨 Cảnh sát ' + c.name + ' kiểm tra nhà trọ. Bạn bị bắt vì cư trú bất hợp pháp và bị trục xuất về nước, cấm nhập cảnh 5 năm.', 'bad', '🚨'); return; }
    if (S.pending.length >= 3) return;
    if (x.years === 3 && !x.chui) queueMilestone('ms_xk_het');
    else if (Math.random() < 0.3) queueMilestone('ms_xk_boclot');
    else if (Math.random() < 0.25 && !has('partner') && !has('spouse')) queueMilestone('ms_xk_yeu');
  }
  function xkHome() {
    const x = S && S.xk; if (!x) return fail('Bạn không ở nước ngoài.');
    const c = XK[x.c], deltas = {}; S.xk = null; S.flags.xkDone = S.year; addStat('happy', 8, deltas); changed();
    return result({ title: '🛬 Về nước', icon: '🛬', text: 'Sau ' + x.years + ' năm ở ' + c.name + ', bạn xách vali về quê. Tổng cộng dành dụm được ' + fmtMoney(x.sent || 0) + (x.debt > 0 ? ', vẫn còn nợ ' + fmtMoney(x.debt) + ' chưa trả hết' : '') + '. Bữa cơm đầu tiên ở nhà, bạn ăn ba bát.', tone: 'milestone', deltas, scene: sceneFor('airport', { anim: 'hug', fx: 'hearts' }) });
  }
  ms({ id: 'ms_xk_het', title: 'Hết hợp đồng lao động', icon: '📅', age: [18, 60],
    text: 'Ba năm hợp đồng đã hết. Vé máy bay về nước đã được công ty đặt sẵn. Nhưng mấy người quen rỉ tai: "Ở lại làm chui, lương cao hơn, ai biết đâu."',
    scene: { loc: 'airport', anim: 'think', fx: 'question' },
    choices: [
      { label: '🛬 Về nước, mang vốn về làm ăn', fn: () => { const x = S.xk; S.xk = null; S.flags.xkDone = S.year; return { text: 'Bạn về nước với ' + fmtMoney((x && x.sent) || 0) + ' dành dụm sau ba năm. Đủ để sửa nhà, hoặc mở một tiệm nhỏ. Bố mẹ già đi nhiều, nhưng cười rất tươi.', effects: { happy: 10 }, scene: { loc: 'home', anim: 'hug', fx: 'hearts' }, tone: 'milestone' }; } },
      { label: '📝 Xin gia hạn hợp đồng 2 năm', fn: () => { const x = S.xk; if (Math.random() < 0.55 && x) { x.years = 1; return { text: 'Chủ xưởng quý bạn chăm chỉ, đồng ý gia hạn hợp đồng hợp pháp thêm 2 năm.', effects: { happy: 2 }, scene: { loc: 'office', anim: 'nod' }, tone: 'good' }; } S.xk = null; S.flags.xkDone = S.year; return { text: 'Chủ xưởng đang cắt giảm, không gia hạn. Bạn đành về nước theo lịch.', effects: { happy: 2 }, scene: { loc: 'airport', anim: 'shrug' } }; } },
      { label: '🏃 Bỏ trốn ở lại làm chui', fn: () => { if (S.xk) S.xk.chui = true; return { text: 'Bạn xé vé máy bay, theo một người quen lên vùng khác làm chui. Lương cao hơn, nhưng mỗi lần thấy xe cảnh sát là tim đập thình thịch.', effects: { happy: -3, karma: -3 }, scene: { loc: 'street', anim: 'run', time: 'night' }, tone: 'neutral' }; } },
    ] });
  ms({ id: 'ms_xk_boclot', title: 'Bị chủ chèn ép', icon: '😣', age: [18, 60],
    text: 'Chủ xưởng bắt làm thêm giờ không trả lương, giữ hộ chiếu của bạn "cho an toàn". Mấy đồng nghiệp cùng quê đã có người ngất xỉu vì kiệt sức.',
    scene: { loc: 'office', anim: 'sad', expr: 'sad', fx: 'sweat' },
    choices: [
      { label: '😔 Cắn răng chịu đựng', fn: () => ({ text: 'Bạn nhẫn nhịn, tự nhủ còn nợ phải trả. Lưng đau, mắt thâm, nhưng tiền vẫn đều đặn gửi về.', effects: { happy: -5, health: -3 }, scene: { anim: 'sad' }, tone: 'neutral' }) },
      { label: '📞 Báo nghiệp đoàn, tổ chức hỗ trợ', fn: () => Math.random() < 0.55 ? { text: 'Tổ chức hỗ trợ người lao động vào cuộc. Chủ xưởng bị phạt, phải trả đủ tiền làm thêm cho cả nhóm và trả lại hộ chiếu.', effects: { money: pay(U.rand(3e7, 8e7)), happy: 6, karma: 2 }, scene: { anim: 'cheer' }, tone: 'good' } : { text: 'Bạn được chuyển sang xưởng khác ở tận vùng núi, lương thấp hơn. Ít ra không còn bị chèn ép.', effects: { happy: -2 }, scene: { anim: 'shrug' }, tone: 'neutral' } },
      { label: '🏃 Bỏ trốn ra ngoài làm chui', fn: () => { if (S.xk) S.xk.chui = true; return { text: 'Một đêm mưa, bạn trèo tường bỏ trốn. Từ nay bạn thành lao động bất hợp pháp, tự lo thân nơi đất khách.', effects: { happy: -4, karma: -1 }, scene: { loc: 'street', anim: 'run', time: 'night', weather: 'rain' }, tone: 'bad' }; } },
    ] });
  ms({ id: 'ms_xk_yeu', title: 'Tình yêu nơi đất khách', icon: '💘', age: [18, 50],
    text: 'Có một người bản xứ hay ghé quán ăn gần xưởng, lần nào cũng cố nói vài câu tiếng Việt bập bẹ với bạn. Hôm nay họ rủ bạn đi xem pháo hoa.',
    scene: { loc: 'street', time: 'night', anim: 'love', fx: 'hearts' },
    choices: [
      { label: '💘 Nhận lời', fn: () => { const c = XK[(S.xk && S.xk.c) || 'nhat'], g = U.pick(loveGenders()), p = newPerson('partner', g, U.clamp(P().age + U.randi(-3, 3), 18, 60), { relation: 66 }); p.firstName = U.pick(c.names); p.lastName = ''; p.middleName = ''; p.foreign = c.name; S.people.push(p); return { text: 'Đêm pháo hoa ấy, hai người nắm tay nhau giữa phố đông. ' + p.firstName + ' là người yêu đầu tiên của bạn nơi đất khách. Rào cản ngôn ngữ thì có, nhưng tình cảm thì chẳng cần phiên dịch.', effects: { happy: 10 }, scene: { anim: 'love', fx: ['hearts', 'fireworks'] }, tone: 'good' }; } },
      { label: '🙅 Giữ khoảng cách, tập trung kiếm tiền', fn: () => ({ text: 'Bạn lịch sự từ chối. Sang đây là để kiếm tiền trả nợ, không phải để yêu đương.', effects: { happy: -1 }, scene: { anim: 'shrug' } }) },
    ] });
  // định cư: đầu tư (≥ 3 tỷ) hoặc diện tay nghề (tiếng Anh ≥ 70 + bằng đại học)
  function settleRoute() {
    if (S.money >= 3e9) return 'invest';
    if ((S.english || 0) >= 70 && hasDegree()) return 'skill';
    return null;
  }
  ms({ id: 'ms_quoctich', title: 'Nhập quốc tịch', icon: '🛂', age: [25, 99],
    text: 'Đủ 5 năm sống ở nước ngoài, bạn được mời làm thủ tục nhập quốc tịch. Hộ chiếu mới đi được khắp thế giới, nhưng có người bảo "thế là thành người nước ngoài rồi".',
    scene: { loc: 'office', anim: 'think', fx: 'question' },
    choices: [
      { label: '🛂 Nhập quốc tịch, vẫn giữ gốc Việt trong tim', fn: () => { S.flags.citizen = S.year; return { text: 'Bạn tuyên thệ nhập quốc tịch ' + (S.abroad && S.abroad.country) + '. Tối hôm đó bạn nấu nồi phở, gọi video cho cả nhà ở Việt Nam.', effects: { happy: 6 }, scene: { anim: 'cheer', fx: 'sparkle' }, tone: 'milestone' }; } },
      { label: '🇻🇳 Chỉ giữ thẻ thường trú', fn: () => ({ text: 'Bạn giữ thẻ thường trú, vẫn mang hộ chiếu Việt Nam. Đi lại hơi phiền, nhưng lòng thấy yên.', effects: { happy: 2 }, scene: { anim: 'nod' } }) },
    ] });
  // ================================================================== 57. BẠN BÈ LÀ NGƯỜI CHƠI THẬT
  // danh thiếp nhân vật của mình (để chia sẻ) + thêm nhân vật của người chơi khác vào đời mình thành bạn bè thật
  function myCard() {
    if (!S || S.dead) return null; const p = P();
    return { name: fullName(p), gender: p.gender, age: p.age, city: (D.CITIES.find((c) => c.id === S.city) || {}).name || '', job: S.job ? D.CAREERS[S.job.id].title : P().age < 18 ? 'Học sinh' : 'Tự do', bio: 'Đang sống kiếp người năm ' + S.year + (S.social && S.social.followers >= 1000 ? ', ' + fmtF(S.social.followers) + ' người theo dõi' : ''), app: p.appearance || {} };
  }
  function addRealFriend(card, how) {
    if (!S || S.dead) return fail('Cuộc đời đã khép lại.');
    if (!card || !card.code || !card.name) return fail('Danh thiếp không hợp lệ.');
    if (S.flags.myCardCode === card.code) return fail('Đây là nhân vật của chính bạn mà!');
    if (S.people.some((p) => p.real && p.real.code === card.code && p.alive)) return fail(card.name + ' đã là bạn của bạn rồi.');
    if (alive('friend').length >= 25) return fail('Danh sách bạn bè đã quá đông.');
    const parts = String(card.name).trim().split(/\s+/), g = card.gender === 'f' ? 'f' : 'm';
    const age = U.clamp(Math.round(card.age || P().age), 0, 110);
    const pr = newPerson('friend', g, age, { firstName: parts[parts.length - 1], lastName: parts.length > 1 ? parts[0] : '', middleName: parts.slice(1, -1).join(' '), appearance: card.app && Object.keys(card.app).length ? Object.assign(D.randomAppearance(g, age), card.app) : undefined, relation: how === 'random' ? 45 : 62 });
    pr.real = { code: card.code, city: card.city || '', job: card.job || '' };
    S.people.push(pr);
    const deltas = {}; addStat('happy', 3, deltas);
    addLog('🌐 Kết bạn với ' + card.name + (card.job ? ' (' + card.job.toLowerCase() + ')' : '') + ' — nhân vật của một người chơi thật.', 'good', '🌐'); changed();
    return result({ title: '🌐 Bạn mới: ' + card.name, icon: '🌐', text: (how === 'random' ? 'Một lần lướt mạng, bạn tình cờ làm quen với ' : 'Bạn kết bạn với ') + card.name + ', ' + age + ' tuổi' + (card.city ? ', ở ' + card.city : '') + (card.job ? ', làm ' + card.job.toLowerCase() : '') + '. Đây là nhân vật trong kiếp người của một người chơi thật! Từ nay họ xuất hiện trong đời bạn như một người bạn: đi chơi, nhờ vả, cả cưới hỏi nếu có duyên.', tone: 'good', deltas, scene: sceneFor('cafe', { anim: 'wave', people: [{ p: pr, anim: 'wave', say: 'Chào bạn!' }] }) });
  }
  // ================================================================== ĐỢT D: chạy xe công nghệ · câu cá · Shark Tank
  ms({ id: 'ms_grab', title: 'Chạy xe công nghệ', icon: '🚕', age: [18, 70],
    text: 'Bạn bật ứng dụng gọi xe, đội mũ bảo hiểm, cắm sạc dự phòng. Thông báo cuốc đầu tiên đã kêu "ting ting".',
    scene: { loc: 'street', anim: 'drive', fx: 'sparkle' },
    choices: [
      { label: '📱 Chạy ban ngày', mini: 'ride', odds: () => U.clamp(0.4 + (S.stats.health - 50) / 120, 0.2, 0.85), fn: () => {
        const sc = MINI != null ? MINI : U.rand(0.35, 0.8), earn = pay(2e5 + sc * 1.1e6);
        return { text: 'Một ngày chạy app: ' + (sc >= 0.7 ? 'toàn khách 5 sao, có người còn bo thêm. ' : sc >= 0.4 ? 'khách khen khéo, đi đúng giờ. ' : 'kẹt xe, khách huỷ cuốc, bị đánh giá 2 sao. ') + 'Cuối ngày bạn kiếm được ' + fmtMoney(earn) + '.', effects: { money: earn, health: -1, happy: sc >= 0.6 ? 2 : -1 }, scene: { loc: 'street', anim: sc >= 0.5 ? 'cheer' : 'facepalm', fx: 'money' }, tone: sc >= 0.5 ? 'good' : 'neutral' };
      } },
      { label: '🌙 Chạy cuốc đêm (giá cao, rủi ro)', mini: 'ride', odds: () => U.clamp(0.35 + (S.stats.health - 50) / 120, 0.15, 0.8), fn: () => {
        const sc = MINI != null ? MINI : U.rand(0.3, 0.8), earn = pay(3e5 + sc * 1.8e6);
        if (Math.random() < 0.12) return { text: 'Gần 2 giờ sáng, hai vị khách bắt bạn chạy vào đường vắng rồi rút dao cướp xe, cướp sạch tiền. May mà bạn giữ được tính mạng.', effects: { health: -8, happy: -12 }, scene: { loc: 'street', time: 'night', anim: 'scared', fx: 'exclaim' }, tone: 'bad' };
        return { text: 'Đêm nay thành phố vẫn thức, khách từ quán bar, sân bay gọi liên tục. Bạn kiếm được ' + fmtMoney(earn) + ', về nhà khi trời đã hửng sáng.', effects: { money: earn, health: -2 }, scene: { loc: 'street', time: 'night', anim: 'drive', fx: 'money' }, tone: 'good' };
      } },
    ] });
  // 🎣 câu cá: minigame trả về cỡ cá (score × 5 = bậc 1..5); bộ sưu tập cá lưu trong S.fishing
  const FISH = {
    ho: [null, ['cá rô', 'cá diếc', 'chiếc dép tổ ong'], ['cá chép', 'cá rô phi'], ['cá trắm cỏ', 'cá lóc bông'], ['cá lăng', 'cá chình'], ['cá koi vàng', 'cá hô khổng lồ']],
    bien: [null, ['cá cơm', 'cá nục'], ['cá thu nhỏ', 'mực ống'], ['cá thu', 'cá hồng'], ['cá ngừ đại dương', 'cá mú đỏ'], ['cá cờ xanh', 'cá mú khổng lồ']],
  };
  const FISH_PRICE = [0, 3e4, 9e4, 3e5, 1.2e6, 6e6];
  function fishChoice(k) {
    const sea = k === 'bien';
    return { key: k, label: sea ? '⛵ Thuê thuyền câu biển (500 nghìn)' : '🏞️ Câu ở hồ gần nhà', mini: 'fishing', odds: () => U.clamp(0.4 + (S.stats.health - 50) / 150, 0.2, 0.8), fn: () => {
      let tier = MINI != null ? Math.round(MINI * 5) : (Math.random() < 0.7 ? U.randi(1, 3) : 0);
      if (sea && tier > 0 && tier < 5 && Math.random() < 0.4) tier++;
      const cost = sea ? 5e5 : 0, f = S.fishing = S.fishing || { n: 0, best: 0, bestName: '', coll: {} };
      if (!tier) return { text: (sea ? 'Lênh đênh cả buổi trên biển' : 'Ngồi cả buổi chiều bên hồ') + ' mà không được con nào. Nhưng gió mát, nắng nhẹ, đầu óc thảnh thơi hẳn.', effects: { money: -cost, happy: 2 }, scene: { loc: sea ? 'beach' : 'park', anim: 'sit' }, tone: 'neutral' };
      const name = U.pick(FISH[sea ? 'bien' : 'ho'][tier]), junk = name.startsWith('chiếc'), price = junk ? 0 : pay(FISH_PRICE[tier] * U.rand(0.7, 1.4));
      f.n++; f.coll[name] = (f.coll[name] || 0) + 1; if (tier > f.best) { f.best = tier; f.bestName = name; }
      if (tier >= 5) unlockSafe('fish_legend');
      if (tier >= 4 && S.social && S.social.followers) S.social.followers += 500 + tier * 300;
      return { text: junk ? 'Cần câu oằn xuống, bạn hồi hộp kéo lên… một chiếc dép tổ ong! Cả hồ cười ồ.' : 'Bạn câu được ' + name + (tier >= 4 ? ' — con cá to nhất mà dân câu quanh đây từng thấy! Ai cũng xin chụp ảnh.' : '!') + (price ? ' Bán cho nhà hàng được ' + fmtMoney(price) + '.' : ''), effects: { money: price - cost, happy: 2 + tier }, scene: { loc: sea ? 'beach' : 'park', anim: tier >= 4 ? 'cheer' : junk ? 'facepalm' : 'laugh', fx: tier >= 4 ? 'confetti' : 'sparkle' }, tone: tier >= 4 ? 'milestone' : 'good' };
    } };
  }
  // ✈️ DU LỊCH: chọn điểm đến; mỗi nước có chuyện riêng (Tokyo, Seoul, Paris, Bangkok có cảnh 3D riêng)
  const TRIP_STORY = {
    tokyo: [
      { w: 3, text: 'Bạn ngắm hoa anh đào nở trắng bên cổng torii đỏ, ăn sushi băng chuyền và tắm suối nước nóng. Nhật Bản sạch đến mức bạn ngại vứt cả vỏ kẹo.', eff: { happy: 10 } },
      { w: 2, text: 'Bạn lạc giữa ga Shinjuku hơn hai tiếng — 200 lối ra, không ai nói tiếng Anh. Cuối cùng một bà cụ dắt tay bạn đi tận nơi rồi cúi chào.', eff: { happy: 5, karma: 1 } },
      { w: 1, text: 'Bạn “cháy túi” ở Akihabara: máy ảnh, mô hình, mỹ phẩm. Về nước mới thấy thẻ tín dụng kêu cứu.', eff: { happy: 8, money: -8e6 } },
    ],
    seoul: [
      { w: 3, text: 'Bạn mặc hanbok dạo cung Gyeongbokgung, chiều lên tháp Namsan móc khoá tình yêu, tối ăn gà rán uống bia ở Hongdae.', eff: { happy: 10, looks: 1 } },
      { w: 2, text: 'Đứng chờ trước công ty giải trí cả buổi, bạn được một nhóm nhạc K-pop vẫy tay chào! Clip bạn quay đạt mấy chục nghìn lượt xem.', eff: { happy: 12 }, fans: 3000 },
      { w: 1, text: 'Bạn tranh thủ đi “thẩm mỹ du lịch” ở Gangnam. Mũi cao hơn hẳn, ví thì mỏng hẳn.', eff: { looks: 6, money: -25e6, health: -2 } },
    ],
    paris: [
      { w: 3, text: 'Bạn ngồi cà phê vỉa hè ngắm tháp Eiffel lên đèn, dạo bảo tàng Louvre và bờ sông Seine. Paris lãng mạn đúng như phim.', eff: { happy: 11 } },
      { w: 2, text: 'Ở ga tàu điện, một nhóm “xin chữ ký” vây quanh rồi lấy mất ví của bạn. Mất tiền, mất cả buổi ở đồn cảnh sát.', eff: { happy: -3, money: -10e6 } },
      { w: 1, text: 'Bạn học nấu món Pháp ở một lớp nhỏ trong khu Montmartre. Về nhà làm bánh crepe cho cả nhà ăn thử.', eff: { happy: 8, smarts: 2 } },
    ],
    bangkok: [
      { w: 3, text: 'Bạn đi chợ nổi, lên chùa vàng, ngồi tuk-tuk len lỏi khắp phố. Đồ ăn đường phố ngon rẻ, xoài nếp ăn mãi không chán.', eff: { happy: 10 } },
      { w: 2, text: 'Tài xế tuk-tuk chở bạn vòng vèo “ghé tiệm đá quý của người quen” rồi chặt chém gấp năm lần giá. Bài học nhớ đời.', eff: { happy: -2, money: -3e6 } },
      { w: 1, text: 'Ăn món cay cấp độ 5 ở chợ đêm, bạn đau bụng nằm khách sạn hai ngày.', eff: { happy: -2, health: -4 } },
    ],
  };
  function tripChoice(k) {
    const t0 = D.TRAVEL.find((x) => (x.id || x.name) === k) || D.TRAVEL[0], t = Object.assign({}, t0, { cost: KN.Weekly && KN.Weekly.bonus('travel') ? Math.round(t0.cost * 0.7 / 1e5) * 1e5 : t0.cost });
    const pp = alive('spouse')[0] || alive('partner')[0];
    return { key: k, label: (t.abroad ? '✈️ ' : '🚌 ') + t.name + ' · ' + fmtMoney(t.cost) + (pp ? ' (đi cùng ' + pp.firstName + ')' : ''), fn: () => {
      if (S.money < t.cost) return { text: 'Tới lúc thanh toán thì thẻ không đủ tiền. Chuyến đi đành hoãn.', effects: { happy: -2 }, tone: 'bad' };
      if (t.abroad && (S.english || 0) < 30 && Math.random() < 0.3) { return { text: 'Tiếng Anh còn kém (dưới 30), bạn khai sai giấy tờ nhập cảnh và bị giữ lại hỏi chuyện cả tiếng. Chuyến đi vẫn vui, nhưng lần sau nên học thêm tiếng Anh.', effects: { money: -t.cost, happy: 4 }, scene: { loc: 'airport', anim: 'facepalm' }, tone: 'neutral' }; }
      S.counters.travel = (S.counters.travel || 0) + 1; if (t.abroad) { S.counters.abroad = (S.counters.abroad || 0) + 1; unlock('abroad'); } (KN.Weekly && KN.Weekly.track('travel'));
      const list = TRIP_STORY[t.id], st = list ? U.weighted(list, (x) => x.w) : { text: U.pick(['Bạn xách ba lô lên đường đến ' + t.name + '. Những ngày tuyệt vời, ảnh chụp đầy điện thoại.', t.name + ' đẹp hơn cả trong ảnh. Bạn ước thời gian ngừng trôi.']), eff: { happy: 8 } };
      const eff = Object.assign({}, st.eff, { money: -t.cost + (st.eff.money || 0) });
      let text = st.text;
      if (pp) { pp.relation = r100(pp.relation + U.randi(6, 12)); text += ' Chuyến đi khiến bạn và ' + pp.firstName + ' gần nhau hơn hẳn.'; }
      else if (P().age >= 18 && P().age <= 50 && Math.random() < 0.12) { const g = U.pick(loveGenders()), np = newPerson('partner', g, U.clamp(P().age + U.randi(-4, 4), 18, 60), { relation: U.randi(55, 70) }); np.metTrip = t.name; S.people.push(np); text += ' Ở ' + t.name + ', bạn quen một người Việt cũng đi du lịch một mình: ' + np.firstName + '. Về nước hai người vẫn nhắn tin mỗi ngày… rồi thành người yêu!'; }
      if (st.fans && S.social && S.social.followers != null) S.social.followers += st.fans;
      if (t.abroad && P().age >= 18 && P().age <= 45 && !S.jail && !S.flags.campGuard && Math.random() < (/bangkok|thái|campuchia|phnom|angkor|siem/i.test((t.id || '') + ' ' + t.name) ? 0.09 : 0.03)) queueMilestone('ms_camp_moi_trip');
      if (Math.random() < 0.04) { eff.money -= 5e6; text += ' Trước hôm về, bạn đánh rơi hộ chiếu, phải lên đại sứ quán làm lại giấy tờ, tốn thêm 5 triệu.'; }
      return { text, effects: eff, scene: { loc: t.loc, time: t.time || 'day', weather: t.weather, decor: t.decor, anim: (st.eff.happy || 0) > 0 ? 'cheer' : 'facepalm', fx: (st.eff.happy || 0) > 0 ? t.fx : null }, tone: (st.eff.happy || 0) > 0 ? 'good' : 'bad' };
    } };
  }
  ms({ id: 'ms_travel', title: 'Đi du lịch', icon: '✈️', age: [16, 99], text: 'Bạn mở app đặt vé, lướt qua hàng chục điểm đến. Năm nay đi đâu đây?',
    scene: { loc: 'airport', anim: 'phone', fx: 'sparkle' },
    choicesFn: () => { const ok = D.TRAVEL.filter((t) => S.money >= t.cost); const intl = ok.filter((t) => t.abroad && t.id), dom = ok.filter((t) => !t.abroad); const pick = U.shuffle(intl).slice(0, 3).concat(U.shuffle(dom).slice(0, intl.length >= 3 ? 1 : 4 - Math.min(3, intl.length))); return (pick.length ? pick : D.TRAVEL.slice(0, 1)).map((t) => tripChoice(t.id || t.name)); },
    choiceByKey: tripChoice });
  ms({ id: 'ms_cauca', title: 'Đi câu cá', icon: '🎣', age: [7, 99], text: 'Bạn chuẩn bị cần câu, hộp mồi giun và chiếc ghế xếp. Hôm nay đi câu ở đâu đây?',
    scene: { loc: 'park', anim: 'sit', fx: 'sparkle' }, choicesFn: () => ['ho', 'bien'].map(fishChoice), choiceByKey: fishChoice });
  function fishView() { const f = S && S.fishing; if (!f || !f.n) return null; return { n: f.n, best: f.bestName, kinds: Object.keys(f.coll).length, list: Object.keys(f.coll).map((k) => k + ' ×' + f.coll[k]) }; }
  // 🦈 Shark Tank: công ty riêng lên sóng gọi vốn
  ms({ id: 'ms_shark', title: 'Shark Tank Việt Nam', icon: '🦈', age: [20, 80],
    text: 'Đèn sân khấu bật sáng. Bốn "cá mập" ngồi trước mặt bạn, lật hồ sơ công ty. Một người hỏi: "Bạn cần bao nhiêu tiền, đổi lấy bao nhiêu phần trăm?"',
    scene: { loc: 'studio', anim: 'talk', fx: 'sparkle', shot: 'close', npcs: [{ role: 'boss', anim: 'think' }, { role: 'boss', anim: 'idle' }] },
    choices: [
      { label: '🎤 Thuyết trình gọi vốn', mini: 'pitch', odds: () => U.clamp(0.3 + (S.stats.smarts - 50) / 90, 0.15, 0.85), fn: () => {
        const c = S.company; if (!c) return { text: 'Công ty không còn để gọi vốn nữa.', effects: {} };
        const sc = MINI != null ? MINI : U.clamp(0.3 + (S.stats.smarts - 50) / 100 + U.rand(-0.2, 0.25), 0, 1), s = soc();
        s.followers += 5000 + Math.round(sc * 30000);
        if (sc < 0.5) { c.boost = (c.boost || 0) + 0.04; return { text: 'Các shark lần lượt từ chối. Nhưng tập phát sóng giúp ' + c.name + ' được cả nước biết tên, đơn hàng tăng vọt mấy tuần liền.', effects: { happy: -3 }, scene: { loc: 'studio', anim: 'bow' }, tone: 'neutral' }; }
        const inv = pay(c.val * (0.12 + (sc - 0.5) * 0.5)), eq = U.clamp(Math.round((0.42 - (sc - 0.5) * 0.5) * 20) / 20, 0.1, 0.45);
        c.own = Math.max(0.1, c.own * (1 - eq)); c.val += inv; c.boost = (c.boost || 0) + 0.08; c.shark = S.year;
        return { text: 'Thoả thuận! Một shark rót ' + fmtMoney(inv) + ' vào ' + c.name + ', đổi lấy ' + Math.round(eq * 100) + '% cổ phần. Có "cá mập" chống lưng, công ty được mở đường vào siêu thị và các kênh bán lớn.', effects: { happy: 12 }, scene: { loc: 'studio', anim: 'cheer', fx: ['confetti', 'money'] }, tone: 'milestone' };
      } },
      { label: '😬 Run quá, xin rút', fn: () => ({ text: 'Bạn xin rút ngay trước giờ ghi hình. Ê-kíp tiếc nuối, bạn thì nhẹ người.', effects: { happy: -2 }, scene: { loc: 'studio', anim: 'shrug' } }) },
    ] });
  // ================================================================== ĐỢT E: bảo hiểm · bệnh hiểm nghèo · xây sửa nhà · nông dân mùa vụ
  // ---- 71. BẢO HIỂM
  const INS = { bhyt: ['Bảo hiểm y tế', 1.2e6], life: ['Bảo hiểm sức khỏe & nhân thọ', 2.4e7] };
  function insView() { const i = S && S.ins; if (!i || (!i.bhyt && !i.life)) return null; return { list: Object.keys(INS).filter((k) => i[k]).map((k) => INS[k][0] + ' (' + fmtMoney(INS[k][1]) + '/năm)'), since: i.since }; }
  function insYear(L, deltas) {
    const i = S.ins; if (!i) return;
    Object.keys(INS).forEach((k) => { if (!i[k]) return; const fee = INS[k][1]; if (S.money < fee && !(isKid() && parentsBack())) { i[k] = false; L('⚠️ Không đủ tiền đóng phí, hợp đồng ' + INS[k][0].toLowerCase() + ' bị huỷ.', 'bad', '📄'); } else if (!isKid()) addMoney(-fee, deltas); });
    if (i.invest && S.year - i.invest >= 3 && !i.investDone) { i.investDone = true; if (Math.random() < 0.35) queueMilestone('ms_bh_dautu'); }
  }
  function insChoice(k) {
    if (k === 'bhyt') return { key: k, label: '🏥 Mua bảo hiểm y tế (' + fmtMoney(INS.bhyt[1]) + '/năm, trả 50% viện phí)', fn: () => { S.ins = Object.assign(S.ins || {}, { bhyt: true, since: S.year }); return { text: 'Bạn đăng ký bảo hiểm y tế. Từ nay đi viện được chi trả một nửa viện phí (tối đa 200 triệu mỗi lần).', effects: { money: -INS.bhyt[1] }, scene: { loc: 'hospital', anim: 'nod' }, tone: 'good' }; } };
    if (k === 'life') return { key: k, label: '🛡️ Mua bảo hiểm sức khỏe & nhân thọ (' + fmtMoney(INS.life[1]) + '/năm)', fn: () => { S.ins = Object.assign(S.ins || {}, { life: true, since: S.year }); return { text: 'Bạn ký hợp đồng bảo hiểm sức khỏe: bệnh hiểm nghèo được chi trả 80% (tối đa 2 tỷ). Nhân viên tư vấn dặn đi dặn lại: "Anh/chị nhớ khai đúng tiền sử bệnh nhé."', effects: { money: -INS.life[1], happy: 2 }, scene: { loc: 'office', anim: 'nod' }, tone: 'good' }; } };
    if (k === 'invest') return { key: k, label: '📈 Mua "bảo hiểm liên kết đầu tư" người quen giới thiệu (300 triệu)', fn: () => { S.ins = Object.assign(S.ins || {}, { invest: S.year }); return { text: 'Người quen vẽ ra viễn cảnh "vừa được bảo vệ vừa sinh lời 12%/năm". Bạn ký luôn, đóng 300 triệu.', effects: { money: -3e8 }, scene: { loc: 'cafe', anim: 'phone', fx: 'money' }, tone: 'neutral' }; } };
    if (k === 'huy') return { key: k, label: '✂️ Huỷ các hợp đồng đang có', fn: () => { S.ins = null; return { text: 'Bạn huỷ hết hợp đồng bảo hiểm, đỡ được khoản phí hằng năm. Mong là không có chuyện gì.', effects: {}, scene: { loc: 'office', anim: 'shrug' } }; } };
    return { key: 'thoi', label: '🙅 Thôi, để tiền tiêu', fn: () => ({ text: 'Bạn cảm ơn và từ chối. "Khoẻ re mà, cần gì bảo hiểm."', effects: {}, scene: { anim: 'shrug' } }) };
  }
  ms({ id: 'ms_baohiem', title: 'Mua bảo hiểm', icon: '🛡️', age: [16, 99], text: 'Nhân viên tư vấn bảo hiểm trải bảng quyền lợi lên bàn. Ốm đau bất ngờ có thể quét sạch tiền tiết kiệm cả đời — hay là mua cho yên tâm?',
    scene: { loc: 'office', anim: 'think', npcs: [{ role: 'stranger', anim: 'talk', say: 'Phòng bệnh hơn chữa bệnh ạ!' }] },
    choicesFn: () => { const i = S.ins || {}, ks = []; if (!i.bhyt) ks.push('bhyt'); if (!i.life) ks.push('life'); if (!i.invest && S.money >= 3e8) ks.push('invest'); if (i.bhyt || i.life) ks.push('huy'); ks.push('thoi'); return ks.map(insChoice); }, choiceByKey: insChoice });
  ms({ id: 'ms_bh_tuchoi', title: 'Bảo hiểm từ chối chi trả', icon: '📄', age: [16, 99], text: 'Đang nằm viện thì nhận thư của công ty bảo hiểm: từ chối chi trả với lý do bạn "không khai báo đầy đủ tiền sử bệnh" — một lần khám dạ dày từ 10 năm trước.',
    scene: { loc: 'hospital', anim: 'angry', expr: 'angry', fx: 'anger' },
    choices: [
      { label: '⚖️ Thuê luật sư kiện', fn: () => { const v = pay((S.flags.bhClaim || 1e8) * 0.8); return Math.random() < 0.55 ? { text: 'Toà xử bạn thắng: lần khám cũ không liên quan đến bệnh hiện tại. Công ty bảo hiểm phải trả ' + fmtMoney(v) + '.', effects: { money: v - pay(3e7), happy: 6 }, scene: { loc: 'office', anim: 'cheer' }, tone: 'good' } : { text: 'Vụ kiện kéo dài hai năm rồi bạn thua vì điều khoản hợp đồng. Mất thêm tiền luật sư.', effects: { money: -pay(5e7), happy: -8 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }; } },
      { label: '📢 Đăng mạng xã hội bóc phốt', fn: () => { const v = pay((S.flags.bhClaim || 1e8) * 0.8); return Math.random() < 0.5 ? { text: 'Bài viết lan khắp mạng. Công ty bảo hiểm vội "xem xét lại hồ sơ" và chi trả ' + fmtMoney(v) + '.', effects: { money: v, happy: 5 }, scene: { anim: 'phone', fx: 'sparkle' }, tone: 'good' } : { text: 'Bài viết chìm nghỉm, còn bị công ty doạ kiện vì "vu khống".', effects: { happy: -6 }, scene: { anim: 'sad' }, tone: 'bad' }; } },
      { label: '😮‍💨 Thôi, tự xoay xở', fn: () => ({ text: 'Bạn mệt mỏi, không còn sức tranh cãi. Từ nay bạn đọc kỹ từng dòng chữ nhỏ trong mọi hợp đồng.', effects: { happy: -5 }, scene: { anim: 'sad' }, tone: 'bad' }) },
    ] });
  ms({ id: 'ms_bh_dautu', title: 'Bảo hiểm "đầu tư" mất vốn', icon: '📉', age: [16, 99], text: 'Ba năm sau, bạn muốn rút tiền từ hợp đồng "bảo hiểm liên kết đầu tư" — và phát hiện giá trị hoàn lại chỉ còn chưa đến một nửa số đã đóng. Hàng trăm người cùng cảnh đang kéo nhau lên trụ sở.',
    scene: { loc: 'office', anim: 'angry', fx: 'anger', npcs: [{ role: 'crowd', anim: 'angry' }] },
    choices: [
      { label: '✊ Cùng mọi người khiếu nại tập thể', fn: () => Math.random() < 0.5 ? { text: 'Sau nhiều tháng khiếu nại, cơ quan chức năng vào cuộc, công ty buộc phải hoàn trả gần đủ tiền gốc.', effects: { money: pay(2.6e8), happy: 4 }, scene: { anim: 'cheer' }, tone: 'good' } : { text: 'Khiếu nại mãi không xong. Bạn chỉ lấy lại được 120 triệu.', effects: { money: pay(1.2e8), happy: -8 }, scene: { anim: 'sad' }, tone: 'bad' } },
      { label: '💸 Chấp nhận rút, bỏ của chạy lấy người', fn: () => ({ text: 'Bạn rút về 140 triệu, mất 160 triệu. Một bài học đắt giá về "người quen bán bảo hiểm".', effects: { money: pay(1.4e8), happy: -6 }, scene: { anim: 'facepalm' }, tone: 'bad' }) },
    ] });
  // ---- bệnh hiểm nghèo không đủ tiền chữa
  ms({ id: 'ms_quyengop', title: 'Không đủ tiền chữa bệnh', icon: '🏥', age: [0, 120], text: 'Bác sĩ nói cần một khoản điều trị rất lớn, hơn hẳn số tiền bạn có. Cả nhà ngồi lặng trong hành lang bệnh viện.',
    scene: { loc: 'hospital', anim: 'cry', expr: 'sad', fx: 'tears' },
    choicesFn: () => ['mxh', 'ban', 'vay', 'bo'].map(qgChoice), choiceByKey: qgChoice });
  function qgChoice(k) {
    const need = pay(S.flags.qgCost || 2e8);
    if (k === 'mxh') return { key: k, label: '📱 Kêu gọi quyên góp trên mạng xã hội', fn: () => { const f = (S.social && S.social.followers) || 0, got = pay(Math.min(need * 1.5, 2e7 + f * U.rand(300, 1200) + (S.karma - 40) * 2e6)); if (S.karma < 45 && Math.random() < 0.3) return { text: 'Bạn kêu gọi được ' + fmtMoney(got) + ', nhưng có người đòi "sao kê", nghi bạn làm giả bệnh án. Bạn phải công khai từng hoá đơn mới yên.', effects: { money: got, happy: -4 }, scene: { anim: 'phone' }, tone: 'neutral' }; return { text: 'Câu chuyện của bạn chạm đến hàng nghìn người lạ. Cộng đồng góp được ' + fmtMoney(got) + '. Có cả những tờ 20 nghìn kèm lời nhắn "Cố lên nhé!".', effects: { money: got, happy: 6, karma: 1 }, scene: { anim: 'cry', fx: 'hearts' }, tone: 'good' }; } };
    if (k === 'ban') return { key: k, label: '🏠 Bán nhà, bán xe để chữa bệnh', fn: () => { const a = S.assets.filter((x) => ['house', 'car', 'land', 'motorbike'].includes(x.type)).sort((x, y) => (y.value || 0) - (x.value || 0))[0]; if (!a) return { text: 'Bạn chẳng còn tài sản gì đáng giá để bán.', effects: { happy: -6 }, scene: { anim: 'sad' }, tone: 'bad' }; const v = pay((a.value || 0) * 0.8); S.assets = S.assets.filter((x) => x !== a); return { text: 'Bạn bán vội ' + a.name.toLowerCase() + ' với giá ' + fmtMoney(v) + ', rẻ hơn thị trường. Mất của, nhưng còn người là còn tất cả.', effects: { money: v, happy: -8 }, scene: { anim: 'sad' }, tone: 'neutral' }; } };
    if (k === 'vay') return { key: k, label: '🤲 Vay họ hàng, bạn bè', fn: () => { const got = pay(need * U.rand(0.5, 1)); S.people.filter((p) => p.alive && ['sibling', 'friend', 'relative'].includes(p.role)).forEach((p) => (p.relation = Math.max(0, p.relation - 4))); S.flags.familyDebt = (S.flags.familyDebt || 0) + got; return { text: 'Bạn gọi điện cho từng người. Người góp 10 triệu, người 50 triệu, gom được ' + fmtMoney(got) + '. Món nợ ân tình này, bạn hứa sẽ trả.', effects: { money: got }, scene: { anim: 'phone' }, tone: 'neutral' }; } };
    return { key: 'bo', label: '🏚️ Bỏ điều trị, về nhà', fn: () => ({ text: 'Bạn xin về nhà, không muốn cả nhà khánh kiệt vì mình. Những ngày sau đó bạn chỉ uống thuốc nam, sức khỏe sa sút nhanh.', effects: { health: -15, happy: -10 }, scene: { loc: 'home', anim: 'sick' }, tone: 'bad' }) };
  }
  // ---- 70. XÂY NHÀ, SỬA NHÀ
  const BUILD = { ong: ['Nhà ống 3 tầng', 1.6e9], bt: ['Biệt thự sân vườn', 5.5e9], sua: ['Sửa sang, nâng cấp nhà', 3e8], dap: ['Đập đi xây lại', 2.2e9] };
  function buildChoice(k) {
    if (k === 'bo') return { key: k, label: '⏳ Để sau, chưa đủ tiền', fn: () => ({ text: 'Bạn cất bản vẽ vào ngăn kéo. "Năm sau tính."', effects: {}, scene: { anim: 'shrug' } }) };
    const [name, cost0] = BUILD[k], cost = pay(cost0 * (market().re || 1));
    return { key: k, label: (k === 'sua' ? '🔨 ' : '🏗️ ') + name + ' (' + fmtMoney(cost) + ')', fn: () => {
      if (S.money < cost) return { text: 'Tính đi tính lại, bạn còn thiếu ' + fmtMoney(cost - S.money) + '. Đành hoãn lại.', effects: {}, scene: { anim: 'facepalm' }, tone: 'bad' };
      const land = S.assets.find((x) => x.type === 'land'), house = S.assets.find((x) => x.type === 'house' && !x.rented);
      let text;
      if ((k === 'ong' || k === 'bt') && land) { land.type = 'house'; land.itemId = null; land.icon = '🏠'; land.name = name + ' (tự xây)'; land.value = Math.round((land.value || 0) + cost * 0.95); land.built = S.year; text = 'Sau 8 tháng thi công, căn ' + name.toLowerCase() + ' mọc lên trên mảnh đất của bạn. Ngày cất nóc, cả họ đến ăn mừng.'; }
      else if (house) { house.value = Math.round((house.value || 0) + cost * (k === 'dap' ? 0.9 : 0.8)); house.reno = S.year; if (k === 'dap') house.name = 'Nhà xây mới'; text = k === 'sua' ? 'Nhà được sơn lại, lát sàn gỗ, thay cửa kính. Bước vào cứ như nhà mới.' : 'Căn nhà cũ được đập đi, xây lại khang trang gấp mấy lần.'; }
      else return { text: 'Bạn chưa có đất hay nhà để xây sửa.', effects: {}, scene: { anim: 'shrug' } };
      if (Math.random() < 0.65) queueMilestone('ms_xn_tho');
      if (Math.random() < 0.35) queueMilestone('ms_xn_ranh');
      return { text, effects: { money: -cost, happy: k === 'sua' ? 5 : 12 }, scene: { loc: 'home', anim: 'cheer', fx: 'confetti', npcs: [{ role: 'neighbor', anim: 'clap' }] }, tone: k === 'sua' ? 'good' : 'milestone' };
    } };
  }
  ms({ id: 'ms_xaynha', title: 'Xây nhà, sửa nhà', icon: '🏗️', age: [20, 99], text: 'Thầy phong thủy xem hướng, bản vẽ đã có, đội thợ đã hẹn. "Làm nhà là việc cả đời" — bạn quyết định làm thế nào?',
    scene: { loc: 'home', anim: 'think', fx: 'idea', npcs: [{ role: 'stranger', anim: 'point', say: 'Hướng này hợp tuổi anh/chị đấy!' }] },
    choicesFn: () => { const ks = []; if (S.assets.some((x) => x.type === 'land')) ks.push('ong', 'bt'); if (S.assets.some((x) => x.type === 'house' && !x.rented)) ks.push('sua', 'dap'); ks.push('bo'); return ks.map(buildChoice); }, choiceByKey: buildChoice });
  ms({ id: 'ms_xn_tho', title: 'Thợ xây ăn bớt', icon: '🧱', age: [20, 99], text: 'Ra công trình, bạn thấy bao xi măng ghi "PCB40" mà màu lạ lạ, sắt thép thì mỏng hơn hợp đồng. Hàng xóm thì thầm: "Đội thợ này hay rút ruột lắm đấy."',
    scene: { loc: 'home', anim: 'think', expr: 'worried', fx: 'question', npcs: [{ role: 'stranger', anim: 'shrug', say: 'Vật liệu chuẩn mà anh/chị!' }] },
    choices: [
      { label: '👀 Tự ra công trình giám sát hằng ngày', fn: () => ({ text: 'Nắng mưa gì bạn cũng ra đứng xem. Đội thợ không dám làm ẩu, căn nhà chắc chắn như ý.', effects: { health: -2, happy: 2 }, scene: { loc: 'home', anim: 'point' }, tone: 'good' }) },
      { label: '🦺 Thuê kỹ sư giám sát (50 triệu)', fn: () => ({ text: 'Kỹ sư phát hiện thép mỏng, bắt đội thợ thay toàn bộ. Tốn tiền mà an tâm.', effects: { money: -5e7 }, scene: { loc: 'home', anim: 'nod' }, tone: 'good' }) },
      { label: '🙈 Kệ, tin thợ cho xong', fn: () => { if (Math.random() < 0.6) { const h = S.assets.find((x) => x.type === 'house'); if (h) h.value = Math.round(h.value * 0.88); return { text: 'Hai năm sau tường nứt, mái thấm dột. Sửa lại tốn kém, giá trị căn nhà cũng giảm hẳn.', effects: { money: -pay(1.5e8), happy: -8 }, scene: { loc: 'home', anim: 'facepalm', weather: 'rain' }, tone: 'bad' }; } return { text: 'May mắn là đội thợ làm đàng hoàng. Lo xa quá rồi.', effects: { happy: 1 }, scene: { loc: 'home', anim: 'shrug' } }; } },
    ] });
  ms({ id: 'ms_xn_ranh', title: 'Tranh chấp ranh giới đất', icon: '📏', age: [20, 99], text: 'Đang đổ móng thì nhà bên cạnh sang chặn lại: "Nhà anh/chị lấn sang đất tôi 30 phân!" Hai bên to tiếng, cả xóm kéo ra xem.',
    scene: { loc: 'street', anim: 'angry', fx: 'anger', npcs: [{ role: 'neighbor', anim: 'angry', say: 'Đất nhà tôi đến cột này!' }] },
    choices: [
      { label: '⚖️ Mời địa chính đo đạc, kiện nếu cần', fn: () => Math.random() < 0.55 ? { text: 'Địa chính đo lại: đất của bạn đúng như sổ đỏ. Nhà bên lặng lẽ rút lui.', effects: { money: -pay(2e7), happy: 3 }, scene: { anim: 'nod' }, tone: 'good' } : { text: 'Vụ việc kéo dài hơn một năm, công trình bị đình lại. Cuối cùng toà chia đôi phần tranh chấp.', effects: { money: -pay(1.2e8), happy: -8 }, scene: { anim: 'facepalm' }, tone: 'bad' } },
      { label: '🤝 Hoà giải, nhường vài phân cho êm', fn: () => ({ text: 'Bạn mang chai rượu sang nhà bên: "Hàng xóm với nhau, em lùi vào 20 phân." Từ đó hai nhà thân như ruột thịt.', effects: { happy: 3, karma: 4 }, scene: { anim: 'hug' }, tone: 'good' }) },
      { label: '🧱 Cứ xây, kệ họ', fn: () => Math.random() < 0.45 ? { text: 'Nhà bên gửi đơn lên phường. Công trình bị đình chỉ, bạn bị phạt và phải đập phần lấn chiếm.', effects: { money: -pay(1.5e8), happy: -10, karma: -4 }, scene: { anim: 'cry' }, tone: 'bad' } : { text: 'Bạn xây xong, nhà bên ấm ức nhưng không làm gì được. Từ đó hai nhà không nhìn mặt nhau.', effects: { happy: -2, karma: -4 }, scene: { anim: 'shrug' }, tone: 'neutral' } },
    ] });
  // ---- 75. NÔNG DÂN THEO MÙA VỤ: chọn cây trồng mỗi năm, thời tiết, giá cả, giải cứu nông sản
  const CROPS = {
    lua: { name: 'Lúa', icon: '🌾', base: 6e7, vol: 0.15, cost: 2.5e7, desc: 'ổn định, lãi thấp' },
    duahau: { name: 'Dưa hấu', icon: '🍉', base: 1.2e8, vol: 0.55, cost: 4e7, desc: 'vụ ngắn, giá lên xuống thất thường' },
    thanhlong: { name: 'Thanh long', icon: '🐉', base: 1.8e8, vol: 0.5, cost: 6e7, desc: 'phụ thuộc thương lái xuất khẩu' },
    caphe: { name: 'Cà phê', icon: '☕', base: 2.2e8, vol: 0.35, cost: 8e7, desc: 'giá theo thị trường thế giới' },
    saurieng: { name: 'Sầu riêng', icon: '🍈', base: 5e8, vol: 0.4, cost: 1.5e8, desc: 'vốn lớn, 3 năm mới cho trái, lãi cao' },
  };
  const WEATHER = [['được mùa, mưa thuận gió hoà', 1.25, '☀️'], ['thời tiết bình thường', 1, '⛅'], ['hạn mặn kéo dài', 0.5, '🏜️'], ['lũ lụt cuốn trôi một phần', 0.4, '🌊'], ['sâu bệnh tràn đồng', 0.65, '🐛']];
  const farmOn = () => !!(S && S.job && S.job.id === 'nongdan' && !S.jail);
  function farm() { if (!S.farm) S.farm = { crop: 'lua', area: 1, since: S.year, planted: S.year, last: null }; return S.farm; }
  function farmView() { if (!farmOn()) return null; const f = farm(), c = CROPS[f.crop]; return { crop: c.icon + ' ' + c.name, desc: c.desc, area: f.area, young: f.crop === 'saurieng' && S.year - f.planted < 3, last: f.last }; }
  function farmChoice(k) {
    const c = CROPS[k]; if (!c) return null;
    return { key: k, label: c.icon + ' Trồng ' + c.name.toLowerCase() + ' (' + c.desc + ')', fn: () => { const f = farm(), same = f.crop === k; f.crop = k; if (!same) f.planted = S.year; const cost = same ? 0 : pay(c.cost * f.area * 0.5); return { text: same ? 'Bạn giữ nguyên ' + c.name.toLowerCase() + ' như mọi năm. Quen tay, quen đất.' : 'Bạn chuyển ' + f.area + ' ha sang trồng ' + c.name.toLowerCase() + ', tốn ' + fmtMoney(cost) + ' tiền giống và cải tạo đất.' + (k === 'saurieng' ? ' Phải 3 năm nữa cây mới cho trái.' : ''), effects: { money: -cost }, scene: { loc: 'countryside', anim: 'lift', fx: 'sparkle' }, tone: 'neutral' }; } };
  }
  ms({ id: 'ms_farm_vu', title: 'Vào vụ mới', icon: '🌱', age: [16, 90], text: 'Đầu năm, cả xóm bàn tán trồng gì cho vụ tới. Nghe nói năm nay thương lái thu mua thanh long, sầu riêng giá cao, nhưng năm ngoái dưa hấu phải "giải cứu".',
    scene: { loc: 'countryside', anim: 'think', fx: 'question', npcs: [{ role: 'neighbor', anim: 'talk', say: 'Năm nay trồng sầu riêng đi!' }] },
    choicesFn: () => Object.keys(CROPS).map(farmChoice), choiceByKey: farmChoice });
  function farmYear(L, deltas) {
    if (!farmOn()) return;
    const f = farm(), c = CROPS[f.crop];
    if (f.crop === 'saurieng' && S.year - f.planted < 3) { addMoney(-pay(c.cost * f.area * 0.3), deltas); L('🍈 Vườn sầu riêng chưa cho trái, bạn vẫn phải bỏ tiền chăm bón.', 'neutral', '🍈'); }
    else {
      const w = U.pick(WEATHER), price = Math.max(0.2, 1 + U.rand(-1, 1) * c.vol), y = w[1] * U.rand(0.85, 1.15);
      const rev = pay(c.base * f.area * y * price), cost = pay(c.cost * f.area), net = rev - cost;
      addMoney(net, deltas); f.last = { year: S.year, weather: w[0], price: Math.round(price * 100), net };
      L(w[2] + ' Vụ ' + c.name.toLowerCase() + ' năm nay ' + w[0] + ', giá bán ' + (price >= 1.15 ? 'cao' : price <= 0.75 ? 'rớt thê thảm' : 'bình thường') + '. ' + (net >= 0 ? 'Lãi ' + fmtMoney(net) : 'Lỗ ' + fmtMoney(-net)) + '.', net >= 0 ? 'good' : 'bad', c.icon);
      if (y > 1.05 && price < 0.7 && S.pending.length < 3) { S.flags.giaicuu = f.crop; queueMilestone('ms_giaicuu'); }
    }
    if (S.pending.length < 3 && Math.random() < 0.6) queueMilestone('ms_farm_vu');
  }
  ms({ id: 'ms_giaicuu', title: 'Được mùa mất giá', icon: '🚛', age: [16, 90], text: 'Được mùa mà mất giá: nông sản chín rộ đầy vườn, thương lái lặn mất tăm, xe hàng nằm chờ ở cửa khẩu cả tuần. Báo đài bắt đầu kêu gọi "giải cứu".',
    scene: { loc: 'countryside', anim: 'sad', expr: 'sad', fx: 'sweat' },
    choices: [
      { label: '📱 Livestream bán trực tiếp', fn: () => { const f = (S.social && S.social.followers) || 0, v = pay(3e7 + f * U.rand(200, 900) + S.stats.looks * 5e5); return Math.random() < 0.6 ? { text: 'Phiên live "giải cứu nông sản" của bạn hút hàng nghìn đơn. Bán được ' + fmtMoney(v) + ', giá còn cao hơn thương lái.', effects: { money: v, happy: 6 }, scene: { anim: 'phone', fx: 'money' }, tone: 'good' } : { text: 'Ít người xem, chỉ bán được vài chục đơn. Phần còn lại chín rục ngoài vườn.', effects: { money: pay(v * 0.2), happy: -5 }, scene: { anim: 'sad' }, tone: 'bad' }; } },
      { label: '🏭 Làm sấy khô, nước ép bán dần', fn: () => ({ text: 'Bạn cùng mấy hộ trong xóm góp tiền mua máy sấy. Nông sản sấy khô bán được quanh năm, giá ổn định.', effects: { money: pay(4e7), happy: 3, smarts: 1 }, scene: { anim: 'cook' }, tone: 'good' }) },
      { label: '😞 Bán rẻ cho thương lái', fn: () => ({ text: 'Bạn bán cả vườn với giá chỉ bằng một phần ba vốn bỏ ra. Đắng lòng, nhưng còn hơn để thối.', effects: { money: pay(1e7), happy: -6 }, scene: { anim: 'sad' }, tone: 'bad' }) },
    ] });
  // ================================================================== 82. TRANG TRÍ NHÀ RIÊNG 3D
  // đồ nội thất: [tên, biểu tượng, giá, điểm tiện nghi, rộng × sâu (ô 1m)]; tiện nghi cao → hạnh phúc mỗi năm
  const DECOR = {
    thamtrai: ['Thảm trải sàn', '🟫', 2e6, 1, 2, 2], sofa: ['Sofa', '🛋️', 1.5e7, 4, 2, 1], banTra: ['Bàn trà', '🪵', 3e6, 1, 1, 1], tv: ['TV và kệ', '📺', 2e7, 4, 2, 1],
    giuong: ['Giường đôi', '🛏️', 1.2e7, 4, 2, 2], tu: ['Tủ quần áo', '🚪', 8e6, 2, 1, 1], banHoc: ['Bàn học, máy tính', '💻', 1.5e7, 3, 1, 1], banAn: ['Bàn ăn 4 ghế', '🍽️', 1e7, 3, 2, 1],
    tuLanh: ['Tủ lạnh', '🧊', 1.2e7, 2, 1, 1], cay: ['Chậu cây cảnh', '🪴', 1.5e6, 2, 1, 1], den: ['Đèn cây', '💡', 2.5e6, 1, 1, 1], beCa: ['Bể cá cảnh', '🐠', 9e6, 3, 1, 1],
    banTho: ['Bàn thờ gia tiên', '🏮', 2e7, 4, 1, 1], piano: ['Đàn piano', '🎹', 6e7, 5, 2, 1], game: ['Góc chơi game', '🎮', 2.5e7, 4, 1, 1], gauBong: ['Gấu bông khổng lồ', '🧸', 2e6, 1, 1, 1],
    tranh: ['Tranh treo tường', '🖼️', 5e6, 2, 1, 1], ghematxa: ['Ghế mát-xa', '💺', 4e7, 5, 1, 1],
  };
  function decorSize() { const h = S.assets.find((a) => a.type === 'house' && !a.rented); if (!h) return [5, 4]; return (h.value || 0) >= 1e10 ? [10, 8] : (h.value || 0) >= 3e9 ? [8, 6] : [6, 5]; }
  function decorView() {
    if (!S) return null; const sz = decorSize(), items = (S.decor || []).filter((d) => DECOR[d.k]);
    const comfort = items.reduce((s, d) => s + DECOR[d.k][3], 0);
    return { size: sz, home: S.assets.some((a) => a.type === 'house' && !a.rented), items: items.map((d) => Object.assign({}, d)), comfort, joy: Math.round(Math.min(8, comfort / 4) * 10) / 10, money: S.money, catalog: Object.keys(DECOR).map((k) => { const [name, icon, price, cf, w, dd] = DECOR[k]; return { k, name, icon, price, priceText: fmtMoney(price), comfort: cf, w, d: dd }; }) };
  }
  function decorFits(k, x, z, r, skip) {
    const [, , , , w0, d0] = DECOR[k], w = r % 2 ? d0 : w0, d = r % 2 ? w0 : d0, [SX, SZ] = decorSize();
    if (x < 0 || z < 0 || x + w > SX || z + d > SZ) return false;
    return !(S.decor || []).some((o, i) => { if (i === skip || !DECOR[o.k] || o.k === 'thamtrai' || k === 'thamtrai') return false; const ow = o.r % 2 ? DECOR[o.k][5] : DECOR[o.k][4], od = o.r % 2 ? DECOR[o.k][4] : DECOR[o.k][5]; return x < o.x + ow && x + w > o.x && z < o.z + od && z + d > o.z; });
  }
  function decorBuy(k, x, z, r) {
    if (!S || S.dead) return fail('Không thể làm điều này.'); const it = DECOR[k]; if (!it) return fail('Món đồ không có.');
    x = Math.round(x); z = Math.round(z); r = ((Math.round(r) % 4) + 4) % 4;
    if ((S.decor || []).length >= 40) return fail('Nhà chật quá rồi, không kê thêm được.');
    if (!decorFits(k, x, z, r)) return fail('Chỗ này không đủ rộng hoặc bị vướng đồ khác.');
    if (S.money < it[2]) return fail('Cần ' + fmtMoney(it[2]) + ' để mua ' + it[0].toLowerCase() + '.');
    S.money -= it[2]; S.decor = (S.decor || []).concat([{ k, x, z, r }]); changed();
    return { ok: true, money: S.money };
  }
  function decorMove(i, x, z, r) {
    const d = (S.decor || [])[i]; if (!d) return fail('Không tìm thấy món đồ.');
    x = Math.round(x); z = Math.round(z); r = ((Math.round(r) % 4) + 4) % 4;
    if (!decorFits(d.k, x, z, r, i)) return fail('Chỗ này không đủ rộng hoặc bị vướng đồ khác.');
    d.x = x; d.z = z; d.r = r; changed(); return { ok: true };
  }
  function decorSell(i) {
    const d = (S.decor || [])[i]; if (!d) return fail('Không tìm thấy món đồ.');
    const back = Math.round(DECOR[d.k][2] * 0.5 / 1e4) * 1e4; S.money += back; S.decor.splice(i, 1); changed();
    return { ok: true, money: S.money, back: fmtMoney(back) };
  }
  function decorYear(L, deltas) {
    const v = decorView(); if (!v || !v.items.length) return;
    if (v.joy >= 0.5) { addStat('happy', v.joy, deltas); if (v.comfort >= 25 && Math.random() < 0.25) L('🛋️ Căn nhà bạn bày biện ấm cúng, bạn bè đến chơi ai cũng khen.', 'good', '🛋️'); }
  }
  // ---- kiểu cha mẹ -------------------------------------------------------------------------
  // bố mẹ còn sống và chưa từ mặt con thì mới chu cấp
  function parentsBack() { return (has('mother') || has('father')) && !S.flags.disowned; }
  function parentingDef() { return D.PARENTING.find((x) => x.id === S.parenting) || D.PARENTING[1]; }
  function clampStartStats() {
    const st = S.stats, pair = st.smarts + st.looks;
    if (pair > PAIR_CAP) { const k = PAIR_CAP / pair; st.smarts = Math.round(st.smarts * k); st.looks = Math.round(st.looks * k); }
    const sum = STATS.reduce((s, x) => s + st[x], 0);
    if (sum > SUM_CAP) { const k = SUM_CAP / sum; STATS.forEach((x) => (st[x] = Math.round(st[x] * k))); }
  }
  function parentingYear(L, deltas) {
    const pa = P().age; if (pa >= 18 || !parentsBack()) return;
    const id = S.parenting;
    if (id === 'apdat') { if (pa >= 6) { addStat('smarts', U.rand(0, 1.2), deltas); addStat('happy', -U.rand(0.5, 2), deltas); } }
    else if (id === 'chieu') { addStat('happy', U.rand(0, 1.5), deltas); if (pa >= 6) addStat('smarts', -U.rand(0, 1), deltas); }
    else if (id === 'thoo') { addStat('happy', -U.rand(0, 1.5), deltas); ['mother', 'father'].forEach((r) => alive(r).forEach((x) => (x.relation = r100(x.relation - U.rand(0, 1.5))))); }
    else addStat('happy', U.rand(0, 0.8), deltas);
    if (S.orientation && S.orientation !== 'straight' && pa === 14 && !S.flags.lgbt_aware) queueMilestone('ms_lgbt_aware', { classmate: tempPerson('classmate', { gender: P().gender }) });
    if (S.flags.lgbt_aware && !S.flags.lgbt_told && pa >= 16 && pa === Math.max(16, S.flags.lgbtAge || 17)) queueMilestone('ms_comeout');
    // bố mẹ áp đặt chọn ngành từ năm 16 tuổi
    if (id === 'apdat' && pa === 16 && !S.flags.parentMajor) { S.flags.parentMajor = U.pick(D.PARENT_MAJORS); queueMilestone('ms_parent_major'); }
    if (S.flags.disowned && S.year - S.flags.disowned >= 4 && Math.random() < 0.15) queueMilestone('ms_reconcile');
  }
  // ---- lộ trình ngoại khóa thể thao: đội trường → năng khiếu → đội trẻ → dự bị chuyên nghiệp → hợp đồng
  function youthYear(L, deltas) {
    const pa = P().age;
    if (!S.ys) {
      if (pa > 13 || S.flags.ys_no) return;
      const sportPlays = Object.values(S.sportPick || {}).reduce((s, n) => s + n, 0);
      const askAt = S.flags.ys_asked ? null : pa === 7 || (pa >= 8 && sportPlays >= 2) ? true : null;
      if (askAt) { S.flags.ys_asked = S.year; queueMilestone('ms_ys_join'); }
      return;
    }
    const Y = D.YOUTH_SPORT[S.ys.id]; if (!Y || S.ys.done) return;
    if (pa >= 19) { S.ys.done = true; if (!S.job && !S.edu.inSchool && S.edu.level === 'done' && S.edu.degrees.includes('THPT') && !S.edu.major) queueMilestone('ms_uni'); return; }
    const ys = S.ys, stat = Y.stat ? S.stats[Y.stat] : S.stats.health;
    // điểm rèn luyện: chăm tập (gym/chạy/đi chơi thể thao) + thể lực + một chút may mắn
    const extra = ['gym', 'run', 'play'].reduce((s, a) => s + (S.yearActs[a] ? 1.5 : 0), 0);
    let gain = 4 + U.rand(0, 4) + (stat - 60) / 12 + extra + (S.parenting === 'chieu' ? -1 : 0);
    if (Math.random() < 0.04 * (ys.stage + 1) && !Y.stat) { gain -= 6; addStat('health', -4, deltas); L('Bạn bị chấn thương trong lúc tập ' + Y.name.toLowerCase() + ', phải nghỉ mấy tháng.', 'bad', '🤕'); }
    ys.xp = Math.max(0, Math.round((ys.xp + gain) * 10) / 10);
    if (Y.stat) addStat('smarts', U.rand(0, 1), deltas); else addStat('health', U.rand(0.5, 2), deltas);
    if (ys.stage >= 1 && S.edu.inSchool) S.edu.perf = r100(S.edu.perf - ys.stage * U.rand(0.8, 1.8)); // tập nhiều, học ít
    if (!parentsBack() && pa < 18) addMoney(-Y.fee * (ys.stage + 1) * 0.5, deltas);
    L(Y.icon + ' ' + Y.stages[ys.stage].name + ': ' + U.pick(Y.seasons).replace('{n}', U.randi(2, 14)) + ' (điểm rèn luyện ' + Math.round(ys.xp) + ')', 'neutral', Y.icon);
    const nx = Y.stages[ys.stage + 1];
    if (nx) {
      if (pa >= nx.age && ys.xp >= nx.need && ys.triedAt !== S.year) queueMilestone('ms_ys_tryout');
      else if (pa >= nx.age + 4 && !ys.closed) { ys.closed = true; L('Bạn đã quá tuổi để lên ' + nx.name + '. Cánh cửa chuyên nghiệp khép lại, ' + Y.name.toLowerCase() + ' giờ chỉ còn là niềm vui.', 'bad', Y.icon); }
    } else if (pa >= 17 && !ys.proAsked) { ys.proAsked = S.year; queueMilestone('ms_ys_pro'); }
    if (S.parenting === 'apdat' && parentsBack() && ys.stage >= 2 && pa >= 15 && !S.flags.ys_parent) { S.flags.ys_parent = S.year; queueMilestone('ms_ys_parent'); }
  }
  function youthView() {
    if (!S || !S.ys) return null;
    const Y = D.YOUTH_SPORT[S.ys.id]; if (!Y) return null;
    const nx = Y.stages[S.ys.stage + 1];
    const tiers = D.FOREIGN_CLUBS[S.ys.id] || [];
    return {
      icon: Y.icon, name: Y.name, xp: Math.round(S.ys.xp), done: !!S.ys.done, closed: !!S.ys.closed,
      stages: Y.stages.map((s, i) => ({ name: s.name, age: s.age, need: s.need || 0, cur: i === S.ys.stage, passed: i < S.ys.stage })),
      next: nx && !S.ys.done ? 'Thi tuyển lên ' + nx.name + ': cần từ ' + nx.age + ' tuổi, điểm rèn luyện ≥ ' + nx.need + (nx.hp ? ', sức khỏe tốt (≥ ' + nx.hp + ')' : ', trí tuệ cao') + ' · tỉ lệ đỗ hiện tại ~' + Math.round(ysOdds() * 100) + '%' + (S.ys.fails ? ' · ⚠️ đã trượt 1 lần, trượt nữa là bị loại' : ' · trượt 2 lần là bị loại') : null,
      pro: Y.pro + ' (từ 17 tuổi, khi đã lên bậc cuối)',
      abroad: tiers.length ? 'Thành ngôi sao có thể được ' + tiers.map((t) => t.clubs.slice(0, 2).join(', ')).join(' → ') + ' chiêu mộ' : ''
    };
  }
  // ---- nghĩa vụ quân sự: nam 18–27 tuổi; sinh viên được tạm hoãn; trốn thì bị phạt
  function armyYear(L, deltas) {
    const pa = P().age, A = S.army || (S.army = {});
    if (A.until) {
      if (S.year >= A.until) {
        delete A.until; A.done = S.year; S.flags.veteran = S.year;
        addStat('health', 4, deltas); addStat('karma', 4, deltas);
        L('🎖️ Bạn hoàn thành nghĩa vụ quân sự, xuất ngũ về nhà. Da sạm nắng, người rắn rỏi, ăn ngủ đúng giờ hơn hẳn. Xin vào công an, cứu hỏa sẽ được ưu tiên.', 'milestone', '🎖️');
      } else {
        addStat('health', U.rand(1, 3), deltas); addStat('happy', -U.rand(0, 2), deltas);
        L(U.pick(['🪖 Một năm trong quân ngũ: dậy lúc 5 giờ, gấp chăn vuông như bánh chưng, hành quân 20 cây số.', '🪖 Đơn vị đi giúp dân gặt lúa, sửa đường. Bà con mang khoai luộc ra tận nơi mời bộ đội.', '🪖 Bạn được khen thưởng vì bắn súng giỏi, lần đầu được về phép thăm nhà.', '🪖 Những đêm gác dưới trời mưa, nhớ cơm mẹ nấu mà rơm rớm nước mắt.']), 'neutral', '🪖');
      }
      return;
    }
    if (P().gender !== 'm' || A.done || A.exempt || pa < 18 || pa > 27) return;
    if (S.edu.inSchool && (S.edu.level === 'university' || S.edu.level === 'highschool' || S.edu.level === 'vocational')) {
      if (pa >= 18 && !A.deferred) { A.deferred = S.year; L('📄 Bạn được tạm hoãn gọi nhập ngũ vì đang đi học. Học xong mà chưa quá 27 tuổi thì vẫn có thể bị gọi.', 'neutral', '📄'); }
      return;
    }
    if (A.calledAt === S.year) return;
    // không phải ai cũng bị gọi: chỉ tiêu mỗi năm có hạn
    if (Math.random() < (pa <= 19 ? 0.55 : 0.3) * (A.dodged ? 1.5 : 1)) { A.calledAt = S.year; queueMilestone('ms_army'); }
  }
  ms({ id: 'ms_army', title: 'Lệnh gọi nhập ngũ', icon: '🪖', age: [18, 27],
    text: 'Phường gửi giấy gọi khám tuyển nghĩa vụ quân sự. Mẹ cầm tờ giấy mà tay run: “Con đi hai năm, mẹ nhớ chết mất.” Bố thì vỗ vai: “Đàn ông phải đi một lần cho biết.”',
    scene: { loc: 'home', anim: 'think', npcs: [{ role: 'mother', anim: 'cry', say: 'Con đi mẹ nhớ lắm…' }, { role: 'father', anim: 'nod', say: 'Đi cho cứng cáp con ạ.' }], fx: 'exclaim' },
    choices: [
      { label: '🪖 Lên đường nhập ngũ', fn: () => {
        if (S.stats.health < 45) { S.army.exempt = S.year; return { text: 'Khám tuyển, bác sĩ lắc đầu: sức khỏe không đạt loại 1, 2, 3. Bạn được miễn nghĩa vụ. Mẹ thở phào, còn bạn thấy hơi tiếc.', effects: { happy: 1 }, scene: { loc: 'hospital', anim: 'shrug', npcs: [{ role: 'doctor', anim: 'shake', say: 'Sức khỏe chưa đạt em ạ.' }] } }; }
        S.army.until = S.year + 2; S.flags.army = S.year;
        let note = '';
        if (S.job) { note = ' Bạn tạm nghỉ việc ' + D.CAREERS[S.job.id].title.toLowerCase() + ' để lên đường.'; S.job = null; }
        return { text: 'Sáng hôm ấy cả xóm ra tiễn. Bạn khoác ba lô, cài hoa đỏ trên ngực áo, lên xe về đơn vị. Hai năm tới, doanh trại là nhà.' + note, effects: { happy: -3, karma: 6, rel: { mother: 6, father: 8 } }, scene: { loc: 'street', anim: 'wave', fx: 'confetti', npcs: [{ role: 'mother', anim: 'cry' }, { role: 'crowd', anim: 'clap' }] }, tone: 'milestone' };
      } },
      { label: '🏃 Trốn khám tuyển', fn: () => {
        S.army.dodged = (S.army.dodged || 0) + 1;
        if (Math.random() < 0.55) return { text: 'Bạn lánh về quê ngoại cả tháng. Công an phường lập biên bản, bạn bị phạt hành chính vì trốn khám nghĩa vụ, tên bị đọc trên loa phường. Bố giận không nói chuyện cả tuần.', effects: { money: -40000000, karma: -10, happy: -6, rel: { father: -15 } }, scene: { loc: 'office', anim: 'facepalm', fx: 'anger', npcs: [{ role: 'police', anim: 'point', say: 'Phạt theo quy định!' }] }, tone: 'bad' };
        return { text: 'Bạn trốn biệt đợt này. Năm sau giấy gọi vẫn sẽ về, và hàng xóm bắt đầu xì xào.', effects: { karma: -6, happy: -2 }, scene: { anim: 'run', fx: 'sweat' }, tone: 'bad' };
      } },
    ] });
  function ysOdds() {
    const Y = D.YOUTH_SPORT[S.ys.id], nx = Y.stages[S.ys.stage + 1], stat = Y.stat ? S.stats[Y.stat] : S.stats.health;
    // điểm rèn luyện vượt chuẩn chỉ giúp một phần: lò đào tạo chỉ lấy vài suất, bậc càng cao càng khó
    const cap = [0, 0.6, 0.45, 0.32][S.ys.stage + 1] || 0.32;
    return U.clamp(nx.odds - 0.08 + Math.min(0.2, (S.ys.xp - nx.need) / 120) + (Y.stat ? (stat - 60) / 150 : (stat - nx.hp) / 120) + karmaLuck(), 0.06, cap);
  }
  function ysJoinChoice(id) {
    const Y = D.YOUTH_SPORT[id];
    return { key: id, label: Y.icon + ' ' + Y.stages[0].name, hint: 'Lộ trình: ' + Y.stages.slice(1).map((s) => s.name).join(' → ') + ' → ' + Y.pro, fn: () => {
      if (S.parenting === 'apdat' && parentsBack() && S.edu.perf < 60 && Math.random() < 0.5) { S.flags.ys_no = true; return { text: 'Bố gạt đi: “Học còn chưa xong mà đòi đá với đấm! Ở nhà ôn bài.” Bạn đứng nhìn các bạn tập qua hàng rào trường.', effects: { happy: -6 }, scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'father', anim: 'shake', say: 'Lo học trước đã!' }] }, tone: 'bad' }; }
      S.ys = { id, stage: 0, xp: 3, fails: 0, since: S.year };
      S.sportPick = S.sportPick || {}; S.sportPick[id] = (S.sportPick[id] || 0) + 2;
      return { text: 'Bạn đăng ký vào ' + Y.stages[0].name + '. Buổi tập đầu tiên mệt bở hơi tai nhưng vui hết cỡ. Từ giờ mỗi năm bạn sẽ tích điểm rèn luyện; đủ điểm và đủ tuổi thì được đi thi tuyển lên bậc cao hơn.', effects: { happy: 5, health: 2 }, scene: { loc: Y.loc, anim: 'cheer', fx: 'sparkle' }, tone: 'milestone' };
    } };
  }
  ms({ id: 'ms_ys_join', title: 'Đăng ký ngoại khóa', icon: '🏅', age: [6, 14],
    text: 'Trường phát phiếu đăng ký môn thể thao ngoại khóa. Thầy thể dục bảo: “Nhiều tuyển thủ quốc gia bắt đầu từ chính đội ngoại khóa của trường đấy.” Bạn muốn theo môn nào?',
    scene: { loc: 'school', anim: 'think', npcs: [{ role: 'teacher', gender: 'm', anim: 'talk', say: 'Em thích môn nào?' }] },
    choicesFn: () => Object.keys(D.YOUTH_SPORT).filter((k) => P().age >= D.YOUTH_SPORT[k].from).map(ysJoinChoice).concat([{ key: 'none', label: '📚 Thôi, em tập trung học', fn: () => { S.flags.ys_no = true; return { text: 'Bạn gấp phiếu đăng ký lại. Thể thao để xem trên TV là được rồi.', effects: { smarts: 1 }, scene: { anim: 'nod' } }; } }]),
    choiceByKey: (k) => (k === 'none' ? { key: 'none', label: 'none', fn: () => { S.flags.ys_no = true; return { text: 'Bạn chọn tập trung học.', effects: {} }; } } : ysJoinChoice(k)) });
  ms({ id: 'ms_ys_tryout', title: 'Ngày thi tuyển', icon: '🎯', age: [8, 19],
    text: '{ys.test} Nếu đỗ, bạn sẽ lên {ys.next}.',
    scene: { loc: 'stadium', anim: 'think', expr: 'surprised', npcs: [{ role: 'teacher', gender: 'm', anim: 'talk', say: 'Thể hiện hết mình đi em!' }], fx: 'exclaim' },
    choices: [
      { label: '🔥 Dốc hết sức thi tuyển', fn: () => {
        const Y = D.YOUTH_SPORT[S.ys.id], nx = Y.stages[S.ys.stage + 1]; S.ys.triedAt = S.year;
        if (miniWin(ysOdds())) {
          S.ys.stage++; S.ys.fails = 0; S.flags['talent_' + S.ys.id] = S.year;
          return { text: 'Tên bạn nằm trong danh sách trúng tuyển! Bạn chính thức lên ' + nx.name + '.' + (S.ys.stage >= 2 ? ' Lịch tập dày hơn, học trên lớp sẽ vất vả hơn.' : ''), effects: { happy: 12 }, scene: { loc: Y.loc, anim: 'cheer', fx: 'confetti' }, tone: 'good' };
        }
        S.ys.fails = (S.ys.fails || 0) + 1; S.ys.xp = Math.max(0, S.ys.xp - 3);
        if (S.ys.fails >= 2) { S.ys.closed = true; S.ys.done = true; return { text: 'Trượt lần thứ hai. Ban huấn luyện gửi thư cảm ơn: suất ở ' + nx.name + ' đã có người khác. Con đường chuyên nghiệp khép lại, ' + Y.name.toLowerCase() + ' giờ chỉ còn là đam mê.', effects: { happy: -14 }, scene: { loc: Y.loc, anim: 'cry', fx: 'heartbreak' }, tone: 'bad' }; }
        return { text: 'Bạn chơi tốt nhưng chưa đủ. Huấn luyện viên vỗ vai: “Năm sau thử lại, nhưng đó là cơ hội cuối đấy.” Đêm đó bạn khóc ướt gối, sáng ra lại xách giày đi tập.', effects: { happy: -8 }, scene: { loc: Y.loc, anim: 'sad', fx: 'tears' }, tone: 'bad' };
      } },
      { label: '⏳ Chưa sẵn sàng, năm sau thi', fn: () => { S.ys.triedAt = S.year; S.ys.xp += 2; return { text: 'Bạn xin hoãn một năm để tập thêm.', effects: {}, scene: { anim: 'nod' } }; } },
      { label: '📚 Bỏ tập, tập trung học', fn: () => { S.ys.done = true; S.edu.perf = r100(S.edu.perf + 6); return { text: 'Bạn treo đôi giày lên đinh. Thể thao khép lại, sách vở mở ra.', effects: { happy: -4, smarts: 2 }, scene: { anim: 'sad' } }; } }
    ] });
  ms({ id: 'ms_ys_pro', title: 'Bản hợp đồng đầu tiên', icon: '✍️', age: [16, 20],
    text: 'Sau bao năm từ {ys.stage}, một đội chuyên nghiệp đưa bạn bản hợp đồng: {ys.pro}. Ký là bỏ dở đại học, đặt cược tuổi trẻ vào đôi chân (hoặc đôi tay) của mình.',
    scene: { loc: 'office', anim: 'think', npcs: [{ role: 'boss', anim: 'talk', say: 'Ký đi, tương lai của em ở đây.' }], fx: 'sparkle' },
    choices: [
      { label: '✍️ Ký hợp đồng chuyên nghiệp', fn: () => { const id = S.ys.id; hire(id); S.job.perf = 62; S.ys.done = true; const lv = id === 'esports' ? 0 : 1; S.job.level = lv; return { text: 'Bạn đặt bút ký. Từ hôm nay bạn là ' + D.CAREERS[id].levels[lv].title.toLowerCase() + '. Thu nhập: ' + payLabel(D.CAREERS[id], lv) + '. Giỏi nữa thì các đội nước ngoài sẽ để mắt tới.', effects: { happy: 15 }, scene: { anim: 'cheer', fx: 'confetti' }, tone: 'milestone' }; } },
      { label: '🎓 Từ chối, học đại học (vẫn giữ năng khiếu)', fn: () => { S.ys.done = true; if (!S.edu.inSchool && S.edu.level === 'done' && S.edu.degrees.includes('THPT') && !S.edu.major) queueMilestone('ms_uni'); return { text: 'Bạn chọn con đường học hành. Năng khiếu vẫn còn đó: sau này ứng tuyển nghề thể thao vẫn được cộng điểm.', effects: { smarts: 2 }, scene: { anim: 'nod' } }; } }
    ] });
  ms({ id: 'ms_ys_parent', title: 'Bố mẹ bắt bỏ tập', icon: '🚫', age: [14, 18],
    text: 'Học lực tụt, bố mẹ đập bàn: “Thể thao không nuôi nổi mày! Bỏ {ys.sport} ngay, ở nhà ôn thi đại học.”',
    scene: { loc: 'home', time: 'night', anim: 'sad', npcs: [{ role: 'father', anim: 'angry', say: 'Bỏ ngay!' }] },
    choices: [
      { label: 'Nghe lời, bỏ tập', fn: () => { S.ys.done = true; S.edu.perf = r100(S.edu.perf + 8); return { text: 'Bạn trả lại áo đấu cho đội. Huấn luyện viên tiếc lắm, còn bạn thì không dám nhìn lại.', effects: { happy: -10, rel: { father: 5, mother: 5 } }, scene: { anim: 'cry', fx: 'tears' } }; } },
      { label: 'Cãi lại, vẫn đi tập', fn: () => { S.flags.parentRebel = S.year; return { text: 'Bạn trốn đi tập mỗi chiều. Bố mẹ cắt tiền tiêu vặt, nhưng bạn vẫn đi.', effects: { happy: 2, rel: { father: -15, mother: -10 } }, scene: { anim: 'run', fx: 'anger' }, tone: 'bad' }; } }
    ] });
  // ---- đội nước ngoài chiêu mộ
  function foreignOfferCheck() {
    const tiers = D.FOREIGN_CLUBS[S.job.id]; if (!tiers || S.job.club || S.flags.foreignAsked === S.year) return;
    const lv = S.job.level, perf = S.job.perf, pa = P().age;
    if (lv < 1 || perf < 60 || pa > 31) return;
    const ok = tiers.filter((t) => lv >= t.minLv && (!t.rare || (perf >= 85 && Math.random() < 0.25)));
    if (!ok.length || Math.random() > 0.1 + lv * 0.04 + (perf - 60) / 200) return;
    const t = ok[ok.length - 1];
    S.flags.foreignAsked = S.year;
    S.flags.foreignOffer = { club: U.pick(t.clubs), country: t.country, mult: t.mult };
    queueMilestone('ms_foreign_offer');
  }
  ms({ id: 'ms_foreign_offer', title: 'Lời mời từ nước ngoài', icon: '🌍', age: [16, 40],
    text: 'Người đại diện gọi lúc nửa đêm, giọng run run: “{fo.club} ({fo.country}) muốn ký với bạn!” Thu nhập gấp nhiều lần hiện tại, nhưng phải sang đó một mình, tranh suất với những người giỏi nhất thế giới.',
    scene: { loc: 'airport', anim: 'phone', expr: 'surprised', fx: 'sparkle', shot: 'close' },
    choices: [
      { label: '✈️ Ký hợp đồng, sang thi đấu', fn: () => {
        const o = S.flags.foreignOffer; S.job.club = { name: o.club, country: o.country, mult: o.mult }; S.abroad = { country: o.country, since: S.year, sport: true }; unlock('abroad');
        if (S.social) S.social.followers = Math.round(S.social.followers * 1.5 + 50000 * o.mult);
        const en = S.english || 0;
        return { text: 'Bạn chính thức khoác áo ' + o.club + '! Báo chí trong nước gọi đây là “cột mốc lịch sử”.' + (en < 40 ? ' Tiếng Anh còn yếu, mọi buổi họp chiến thuật bạn phải nhờ phiên dịch, hòa nhập sẽ khó.' : ' Tiếng Anh tốt giúp bạn hòa nhập nhanh với đồng đội.'), effects: { happy: 15 }, scene: { loc: 'airport', anim: 'wave', fx: 'confetti' }, tone: 'milestone' };
      } },
      { label: '🏠 Ở lại trong nước', fn: () => ({ text: 'Bạn từ chối. Người hâm mộ quê nhà treo băng rôn cảm ơn, nhưng đôi lúc bạn vẫn tự hỏi “nếu như…”.', effects: { happy: -2, karma: 2 }, scene: { anim: 'nod', fx: 'hearts' } }) }
    ] });
  // phản ứng của bố mẹ khi có kết quả thi: ok = đỗ, major = ngành con chọn (null nếu là thi lớp 10)
  function parentReact(ok, major) {
    if (S.parenting !== 'apdat' || !(has('mother') || has('father')) || S.flags.disowned) return '';
    const want = S.flags.parentMajor, defied = major && want && major !== want;
    if (ok && !defied) { ['mother', 'father'].forEach((r) => alive(r).forEach((x) => (x.relation = r100(x.relation + 8)))); return ' Bố mẹ nở mày nở mặt, đi khoe khắp họ hàng.'; }
    const pDisown = !major ? 0.25 : ok ? 0.15 : defied || S.flags.parentRebel ? 0.7 : 0.45;
    ['mother', 'father'].forEach((r) => alive(r).forEach((x) => (x.relation = r100(x.relation - (ok ? 15 : 22)))));
    if (Math.random() < pDisown) {
      S.flags.disowned = S.year; ['mother', 'father'].forEach((r) => alive(r).forEach((x) => (x.relation = Math.min(x.relation, 5))));
      addLog('Bố mẹ tuyên bố từ mặt bạn: không chu cấp, không cho về nhà.', 'bad', '🚪');
      return ok ? ' Bố đập bàn: “Đã không nghe lời thì tự mà lo lấy!” Từ hôm đó, bố mẹ từ mặt bạn — không tiền, không nhà, không một cuộc gọi.' : ' Bố mẹ lạnh lùng: “Nhà này không có đứa con vô dụng.” Bạn bị từ mặt, phải dọn ra ở trọ và tự lo mọi thứ.';
    }
    return ok ? ' Bố mẹ giận vì bạn không theo ngành ' + (D.MAJORS[want] ? D.MAJORS[want].name : 'đã chọn') + ', cả tháng không nói chuyện.' : ' Bố mẹ thất vọng tràn trề, mắng bạn suốt bữa cơm. Không khí trong nhà nặng như chì.';
  }  // ---- việc làm thêm
  function partTimeWhy(g) {
    const pa = P().age, n = g.need || {};
    if (pa < g.minAge) return 'Từ ' + g.minAge + ' tuổi';
    if (n.phone && !S.assets.some((a) => a.type === 'phone')) return 'Cần điện thoại';
    if (n.motorbike && !S.assets.some((a) => a.type === 'motorbike')) return 'Cần xe máy';
    if (n.looks && S.stats.looks < n.looks) return 'Cần ngoại hình ≥ ' + n.looks;
    if (n.smarts && S.stats.smarts < n.smarts) return 'Cần trí tuệ ≥ ' + n.smarts;
    if (n.health && S.stats.health < n.health) return 'Cần sức khỏe ≥ ' + n.health;
    if (n.english && (S.english || 0) < n.english) return 'Cần tiếng Anh ≥ ' + n.english;
    return null;
  }
  function partTimeOptions() {
    if (!S) return [];
    return D.PARTTIME.map((g) => { const why = partTimeWhy(g); return { id: g.id, icon: g.icon, name: g.name, payText: (g.pay[0] < 0 ? 'lỗ ' + Math.abs(g.pay[0]) + 'tr – lãi ' : g.pay[0] + '–') + g.pay[1] + ' triệu/đợt', available: !why, reason: why }; });
  }  // ---- tiếng Anh, du học, làm việc ở nước ngoài ------------------------------------------------
  function englishLabel(v) { return v < 20 ? 'gần như mù tiếng Anh' : v < 40 ? 'giao tiếp cơ bản' : v < 55 ? 'khá, IELTS ~5.0' : v < 70 ? 'tốt, IELTS ~6.5' : v < 85 ? 'rất tốt, IELTS ~7.5' : 'thành thạo như người bản xứ'; }
  function englishYear() {
    const pa = P().age, e = S.edu; let d = 0;
    if (e.inSchool && pa >= 8 && pa <= 18) d = U.rand(1, 3.5) * (0.5 + S.stats.smarts / 100) * (S.parenting === 'apdat' ? 1.2 : S.parenting === 'thoo' ? 0.6 : 1);
    else if (e.inSchool && e.level === 'university') d = e.major === 'ngoaingu' ? U.rand(5, 9) : U.rand(1, 3) + (e.abroad ? 8 : 0);
    else if (S.abroad) d = U.rand(2, 5);
    else if (pa > 22 && (S.english || 0) > 20) d = -U.rand(0, 1.2); // không dùng thì quên dần
    S.english = r100((S.english || 0) + d);
  }
  const ABROAD = ['Nhật Bản', 'Hàn Quốc', 'Singapore', 'Úc', 'Đức', 'Mỹ', 'Canada', 'Anh'];
  function abroadYear(L, deltas) {
    if (!S.abroad) return;
    const yrs = S.year - S.abroad.since;
    if (yrs <= 2) { addStat('happy', -U.rand(1, 4), deltas); if (yrs === 1) L('Năm đầu ở ' + S.abroad.country + ': nhớ nhà, nhớ cơm mẹ nấu, tối nào cũng gọi video về.', 'neutral', '🌏'); }
    ['mother', 'father', 'sibling', 'friend'].forEach((r) => alive(r).forEach((x) => (x.relation = r100(x.relation - U.rand(0, 2)))));
  }  function setLifestyle(id) {
    if (!S || S.dead) return fail('Không thể đổi.');
    const ls = D.LIFESTYLES.find((x) => x.id === id); if (!ls) return fail('Mức sống không hợp lệ.');
    if (P().age < 18) return fail('Từ 18 tuổi mới tự quyết mức sống.');
    S.lifestyle = id; addLog('Bạn chuyển sang lối sống ' + ls.label.toLowerCase() + '.', 'neutral', ls.icon); changed();
    return result({ title: 'Mức sống: ' + ls.label, icon: ls.icon, text: ls.desc, tone: 'neutral' });
  }
  // ---- thị trường nhà đất & chứng khoán: chạy theo chu kỳ bình thường → sốt → vỡ bong bóng → suy thoái
  const MARKET = {
    // tăng trưởng dài hạn ~2%/năm (lương trong game không trượt giá nên nhà không được tăng quá nhanh)
    binh: { label: 'Bình ổn', icon: '🏘️', re: [0.01, 0.04], st: [-0.05, 0.13] },
    sot: { label: 'Sốt nóng', icon: '🔥', re: [0.1, 0.22], st: [0.1, 0.4] },
    vo: { label: 'Bong bóng vỡ', icon: '💥', re: [-0.28, -0.12], st: [-0.42, -0.18] },
    suy: { label: 'Suy thoái', icon: '🥶', re: [-0.05, 0.01], st: [-0.12, 0.05] },
  };
  function market() { return S.market || (S.market = { re: 1, st: 1, phase: 'binh', since: S.year }); }
  function marketYear(L) {
    const m = market(), yrs = S.year - m.since, r = Math.random();
    let next = m.phase;
    if (m.phase === 'binh' && r < 0.14) next = 'sot';
    else if (m.phase === 'sot' && yrs >= 1 && r < 0.3 + yrs * 0.15) next = 'vo';
    else if (m.phase === 'vo' && yrs >= 1) next = 'suy';
    else if (m.phase === 'suy' && yrs >= 1 && r < 0.4) next = 'binh';
    if (next !== m.phase) {
      m.phase = next; m.since = S.year;
      if (P().age >= 16) L({ sot: '🔥 Thị trường bất động sản và chứng khoán đang sốt! Giá đất, cổ phiếu tăng vùn vụt, ai cũng bàn chuyện “lướt sóng”.', vo: '💥 Bong bóng vỡ! Giá đất, cổ phiếu lao dốc, nhiều người vay nợ mua đỉnh trắng tay.', suy: '🥶 Thị trường bước vào suy thoái: nhà khó bán, cổ phiếu đi ngang ảm đạm.', binh: '🏘️ Thị trường dần ổn định trở lại.' }[next], next === 'vo' ? 'bad' : 'neutral', MARKET[next].icon);
    }
    const P0 = MARKET[m.phase];
    m.reK = 1 + U.rand(P0.re[0], P0.re[1]); m.stK = 1 + U.rand(P0.st[0], P0.st[1]);
    m.re *= m.reK; m.st *= m.stK;
  }
  // vay ngân hàng mua nhà: trả trước 30%, góp 20 năm lãi 10%/năm
  const LOAN_RATE = 0.1, LOAN_YEARS = 20;
  const annuity = (p, r, n) => Math.round(p * r / (1 - Math.pow(1 + r, -n)));
  function loansYear(L, deltas) {
    if (!S.loans || !S.loans.length) return;
    S.loans.forEach((ln) => {
      const interest = ln.left * (ln.rate || LOAN_RATE), pay = Math.min(ln.pay, Math.round(ln.left + interest));
      addMoney(-pay, deltas); ln.left = Math.max(0, Math.round(ln.left + interest - pay)); ln.years--;
    });
    const done = S.loans.filter((ln) => ln.left <= 0 || ln.years <= 0);
    done.forEach((ln) => L(ln.cash ? '🏦 Bạn đã trả hết ' + ln.name.toLowerCase() + '. Nhẹ cả người!' : '🏦 Bạn đã trả hết khoản vay mua ' + ln.name.toLowerCase() + '. Sổ hồng giờ hoàn toàn đứng tên bạn!', 'milestone', '🏡'));
    S.loans = S.loans.filter((ln) => !done.includes(ln));
    // trả không nổi 2 năm liền → ngân hàng siết nhà
    if (S.money < 0 && S.loans.length) {
      S.loanLate = (S.loanLate || 0) + 1;
      if (S.loanLate >= 2 && !S.loans.some((l) => l.assetId)) {
        // vay tín chấp không có nhà để siết → thành nợ xấu, bị ghi tên lên trung tâm tín dụng
        if (!S.flags.noxau) L('🏦 Nợ quá hạn hai năm, khoản vay tín chấp thành NỢ XẤU. Từ nay ngân hàng không cho bạn vay nữa.', 'bad', '📛');
        S.flags.noxau = S.year; addStat('happy', -6, deltas); S.loanLate = 0;
      } else if (S.loanLate >= 2) {
        const i0 = S.loans.findIndex((l) => l.assetId); const ln = S.loans.splice(i0, 1)[0], i = S.assets.findIndex((a) => a.id === ln.assetId);
        if (i >= 0) { const a = S.assets[i]; S.assets.splice(i, 1); const rest = Math.max(0, a.value * 0.8 - ln.left); addMoney(rest, deltas); L('🏦 Nợ quá hạn hai năm, ngân hàng siết ' + a.name.toLowerCase() + ' và bán đấu giá. ' + (rest > 0 ? 'Trừ nợ xong bạn nhận lại ' + fmtMoney(rest) + '.' : 'Bạn trắng tay.'), 'bad', '🏦'); }
        addStat('happy', -15, deltas); S.loanLate = 0;
      } else L('🏦 Ngân hàng gửi thư nhắc nợ: bạn đang chậm trả góp nhà. Thêm một năm nữa là bị siết nhà.', 'bad', '📨');
    } else S.loanLate = 0;
  }
  const loanLeft = () => (S.loans || []).reduce((s, l) => s + l.left, 0);

  // ------------------------------------------------------------------ BỊ BẮT SANG CAMPUCHIA (lừa đảo việc nhẹ lương cao): hỏi han kỹ + cảnh giác thì tránh được
  function campRiskYear() {
    if (!S || S.dead || S.jail || S.flags.campGuard || S.pending.length >= 2) return;
    const pa = P().age;
    if (pa < 18 || pa > 40 || !(S.edu.abroad && S.edu.inSchool) || (S.flags.campLure && S.year - S.flags.campLure < 3)) return;
    if (Math.random() < 0.035) { S.flags.campLure = S.year; queueMilestone('ms_camp_moi_study'); }
  }
  function campCapture(how) {
    const lost = Math.max(0, S.money);
    S.money = 0; S.job = null; if (S.edu.inSchool) { S.edu.inSchool = false; S.edu.dropped = true; }
    const kind = Math.random() < 0.45 ? 'ransom' : 'scam';
    S.camp = { kind, since: S.year, amount: kind === 'ransom' ? Math.round(U.randi(80, 300) / 10) * 10 * 1e6 : 0, signal: 0, how };
    S.jail = { until: S.year + 9999, since: S.year, total: 0, reason: 'bị bắt giữ ở Campuchia', camp: true };
    S.flags.campVictim = S.year;
    S.abroad = null;
    addLog('🚨 Bạn bị bắt giữ ở Campuchia. Hộ chiếu, điện thoại và toàn bộ ' + (lost ? fmtMoney(lost) + ' tiền ' : 'tiền ') + 'đều bị tịch thu.', 'bad', '🚨');
    return kind;
  }
  function campLureChoice(src) {
    const where = src === 'trip' ? 'trên chuyến đi' : 'ở nơi du học';
    return (k) => {
      if (k === 'go') return { key: k, label: src === 'trip' ? '🚗 Đi cùng cho biết, nghe vui đấy' : '💼 Nhận lời, kiếm thêm tiền', fn: () => { campCapture('go'); return { text: 'Chiếc xe chạy rất lâu, băng qua mấy chốt kiểm soát vắng vẻ. Khi cổng sắt đóng lại sau lưng, bạn mới hiểu mình không còn ở nơi du lịch nữa. “Mày nợ tụi tao rồi, đừng có nghĩ chuyện về.” Hộ chiếu, điện thoại, toàn bộ tiền bạc bị lấy sạch ngay trong đêm đầu tiên.', effects: { happy: -15, health: -4 }, scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Vào!' }, { role: 'thug', anim: 'point' }], fx: 'exclaim', shot: 'dramatic' }, tone: 'bad' }; } };
      if (k === 'ask') { const p = U.clamp(0.4 + S.stats.smarts / 200 + (S.english || 0) / 400, 0.3, 0.85); return { key: k, label: '🤔 Hỏi kỹ: công ty nào, địa chỉ ở đâu, hợp đồng đâu?', hint: 'Cảnh giác tăng khả năng thoát', odds: () => p, fn: () => { if (miniWin(p)) { S.flags.campGuard = S.year; return { text: 'Càng hỏi, đối phương càng ấp úng: không có địa chỉ, không hợp đồng, chỉ có “qua biên giới là có việc”. Bạn lặng lẽ chặn số rồi báo cho người thân. Vài ngày sau tin tức đưa về một nhóm người bị lừa y như vậy. Bạn đã thoát trong gang tấc.', effects: { happy: 2, smarts: 2, karma: 1 }, scene: { anim: 'think', fx: 'idea' } }; } campCapture('ask'); return { text: 'Bạn hỏi nhiều nhưng đối phương trả lời trơn tru đến bất ngờ, còn mời bạn ly nước “cho bớt căng thẳng”. Ly nước ấy là thứ cuối cùng bạn nhớ. Khi tỉnh lại, bạn đang ở một nơi hoàn toàn xa lạ và cánh cửa đã khoá chặt từ bên ngoài.', effects: { happy: -15, health: -6 }, scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry' }], fx: 'exclaim', shot: 'dramatic' }, tone: 'bad' }; } }; }
      const p = 0.82; return { key: k, label: '🙅 Từ chối thẳng, đi chỗ khác', hint: 'Phần lớn thoát, nhưng chưa chắc', odds: () => p, fn: () => { if (miniWin(p)) { S.flags.campGuard = S.year; return { text: 'Bạn từ chối rồi bỏ đi. Người kia nhún vai, quay sang tìm “con mồi” khác. Về sau bạn mới biết nhiều người nhận lời đã không bao giờ liên lạc được nữa.', effects: { happy: 1, karma: 1 }, scene: { anim: 'shake', fx: 'sparkle' } }; } campCapture('forced'); return { text: 'Bạn từ chối, nhưng chúng không chịu thôi: một chiếc xe chặn đường, vài người đàn ông lực lưỡng lôi bạn lên xe giữa ban ngày ' + where + '. Bạn la hét nhưng chẳng ai kịp phản ứng.', effects: { happy: -18, health: -8 }, scene: { loc: 'street', time: 'night', anim: 'scared', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Im mồm!' }], fx: 'exclaim', shot: 'dramatic' }, tone: 'bad' }; } };
    };
  }
  const campLureTrip = campLureChoice('trip'), campLureStudy = campLureChoice('study');
  ms({ id: 'ms_camp_moi_trip', title: 'Người bạn mới quen', icon: '🤝', age: [18, 60],
    text: 'Ở quán cà phê, một người nói tiếng Việt, ăn mặc sang trọng bắt chuyện rất thân thiện. Nghe bạn đi chơi một mình, người đó cười: “Qua Campuchia chơi một chuyến đi! Bao xe, bao ăn ở, tụi anh có việc nhẹ lương 2.000 đô, rảnh thì làm, không thì thôi.”',
    scene: { loc: 'cafe', time: 'day', anim: 'idle', npcs: [{ role: 'stranger', gender: 'm', anim: 'talk', say: 'Đi với anh, bao hết nhé!' }], fx: 'money', shot: 'close' },
    choicesFn: () => ['go', 'ask', 'no'].map(campLureTrip), choiceByKey: campLureTrip });
  ms({ id: 'ms_camp_moi_study', title: 'Việc làm thêm lương cao', icon: '💼', age: [18, 45],
    text: 'Một người đồng hương trong nhóm sinh viên nhắn riêng cho bạn: “Anh có việc làm thêm cuối tuần, chỉ gõ máy tính, lương 3.000 đô một tháng, ở Campuchia, có xe đón. Cả bọn em đi rồi, ai cũng khen.”',
    scene: { loc: 'university', time: 'day', anim: 'phone', npcs: [{ role: 'stranger', gender: 'm', anim: 'talk', say: 'Việc nhẹ lương cao, đi không?' }], fx: 'money', shot: 'close' },
    choicesFn: () => ['go', 'ask', 'no'].map(campLureStudy), choiceByKey: campLureStudy });

  // ---- sống trong khu lừa đảo
  const campPayer = () => alive('mother').concat(alive('father'), alive('spouse'), alive('sibling'), alive('grandparent')).filter((p) => (p.relation ?? 60) >= 25).sort((a, b) => (b.relation ?? 60) - (a.relation ?? 60))[0] || null;
  function campRelease(how) {
    const kind = S.camp ? S.camp.kind : 'scam', yrs = S.jail ? S.year - S.jail.since : 0;
    S.jail = null; S.camp = null; S.money = Math.max(0, S.money); S.flags.scamSurvivor = S.year; S.flags.campGuard = S.year;
    addStat('happy', -10, {}); addStat('health', -6, {});
    addLog((how === 'ransom' ? '🏠 Gia đình đóng tiền chuộc, bạn được thả về nước. ' : how === 'escape' ? '🏃 Bạn trốn thoát khỏi khu lừa đảo. ' : '🚁 Bạn được lực lượng chức năng giải cứu. ') + 'Sau ' + yrs + ' năm bạn trở về, gầy rộc và còn nguyên ám ảnh. Hộ chiếu, tiền bạc, quãng thời gian — tất cả đã mất.', 'milestone', '🕊️');
    void kind;
  }
  function campYear(L, deltas) {
    const c = S.camp || (S.camp = { kind: 'scam', since: S.jail.since, amount: 0, signal: 0 }), yrs = S.year - S.jail.since + 1;
    S.money = Math.max(0, S.money); addStat('happy', -U.rand(4, 8), deltas); addStat('health', -U.rand(2, 5), deltas);
    const base = c.kind === 'ransom' ? 0.07 : 0.05 + 0.025 * yrs, p = Math.min(0.85, base + (c.signal || 0) * 0.15 + (campPayer() ? 0.04 : 0));
    if (Math.random() < p) { campRelease('rescue'); return; }
    L(c.kind === 'ransom' ? '⛓️ Năm thứ ' + yrs + ' bị giam: bọn bắt cóc đòi tiền chuộc ' + fmtMoney(c.amount) + '.' : '⛓️ Năm thứ ' + yrs + ' trong khu lừa đảo: ngày nào cũng phải ngồi gõ máy, nhắn tin dụ dỗ người khác, không đạt chỉ tiêu là bị đánh.', 'bad', '⛓️');
    if (!S.pending.some((e) => e.id === 'ms_camp')) queueMilestone('ms_camp');
  }
  function campChoice(k) {
    const c = S.camp || { kind: 'scam', amount: 0 }, pay = campPayer();
    if (k === 'ransom') return { key: k, label: '📞 Xin gia đình chuộc (' + fmtMoney(c.amount) + ')', _ok: c.kind === 'ransom' && !!pay, hint: pay ? 'Tiền của ' + (nameOf(pay)) + ', không phải tiền của bạn — bạn đã mất hết' : 'Không còn người thân nào để nhờ',
      fn: () => { const rich = pay.role === 'spouse' ? 'hai vợ chồng' : nameOf(pay); S.flags.famDebt = (S.flags.famDebt || 0) + c.amount; addRel(pay, 6, []); campRelease('ransom'); return { text: 'Bạn run run đọc số điện thoại người thân. ' + nameOf(pay).replace(/^./, (x) => x.toUpperCase()) + ' nghe tin mà khóc nức nở, lập tức bán đất, vay mượn khắp họ hàng để gom đủ ' + fmtMoney(c.amount) + ' chuyển cho chúng. Vài ngày sau bạn được thả ở cửa khẩu. Món nợ ân tình ấy, ' + rich + ' gánh thay bạn.', effects: { happy: 3 }, scene: { loc: 'airport', anim: 'hug', npcs: [{ role: pay.role, anim: 'cry', say: 'Con về là tốt rồi…' }], fx: 'tears' } }; } };
    if (k === 'work') { const p = U.clamp(0.4 + S.stats.smarts / 300 + (S.stats.looks - 50) / 400, 0.25, 0.75); return { key: k, label: '💬 Bị ép nhắn tin / gọi điện dụ nạn nhân', hint: 'Đủ chỉ tiêu thì bớt bị đánh, nhưng mất lương tâm. Bạn cũng có thể lén cảnh báo nạn nhân', _ok: c.kind === 'scam', mini: 'scamchat', odds: () => p, fn: () => {
      const out = KN.Mini && KN.Mini.lastOut; if (KN.Mini) KN.Mini.lastOut = null;
      if (out && out.warned && !out.caught) { addStat('karma', 6, {}); S.camp.signal = (S.camp.signal || 0) + 0; S.flags.scamSaved = (S.flags.scamSaved || 0) + 1; return { text: 'Bạn lén gõ vội một dòng cảnh báo giữa lúc quản lý quay đi. ' + out.victim + ' hiểu ra, chặn số ngay. Bạn bị phạt vì không đủ chỉ tiêu, nhưng đêm đó bạn ngủ được. Cứu được một người, cũng là cứu một phần chính mình.', effects: { karma: 6, happy: 2, health: -3 }, scene: { loc: 'office', time: 'night', anim: 'nod', expr: 'sad', npcs: [{ role: 'thug', anim: 'angry', say: 'Sao hôm nay ít thế?!' }], fx: 'sparkle' } }; }
      if (out && out.caught) return { text: out.warned ? 'Quản lý phát hiện bạn lén cảnh báo nạn nhân. Chúng đánh bạn bằng ống nhựa, điện giật, nhốt bạn vào phòng tối mấy ngày. Nạn nhân đã kịp thoát, nhưng bạn trả giá rất đắt.' : 'Bạn làm việc lề mề nên bị quản lý đánh một trận cảnh cáo.', effects: { health: out.warned ? -20 : -9, happy: -6, karma: out.warned ? 5 : 0 }, scene: { anim: 'fall', fx: 'dust', npcs: [{ role: 'thug', anim: 'angry' }] }, tone: 'bad' };
      const win = out ? out.scammed : miniWin(p);
      if (win) { const n = out ? 1 : U.randi(8, 30); addStat('karma', -6, {}); S.flags.scamMade = (S.flags.scamMade || 0) + n; return { text: 'Bạn dùng lời ngọt dụ được ' + (out ? out.victim : n + ' người xa lạ') + ' chuyển tiền. Quản lý vỗ tay, còn bạn thấy buồn nôn: một người nữa đã bị hại, và bạn không có lựa chọn nào khác. Không đạt chỉ tiêu thì bị đánh, nhưng lương tâm cắn rứt.', effects: { karma: -6, happy: -4, health: -1 }, scene: { loc: 'office', time: 'night', anim: 'type', expr: 'sad', npcs: [{ role: 'thug', anim: 'cheer', say: 'Khá lắm!' }], fx: 'sweat' }, tone: 'bad' }; }
      return { text: 'Hôm nay bạn không dụ được ai. Không đủ chỉ tiêu nên bị quản lý đánh và phạt nhịn đói.', effects: { health: -8, happy: -4 }, scene: { anim: 'sad', fx: 'tears', npcs: [{ role: 'thug', anim: 'angry' }] }, tone: 'bad' }; } }; }
    if (k === 'resist') return { key: k, label: '✊ Chống đối, không chịu lừa ai', hint: 'Giữ lương tâm nhưng bị trừng phạt nặng', fn: () => ({ text: c.kind === 'scam' ? 'Bạn nhất quyết không lừa người vô tội. Bọn chúng nhốt bạn vào phòng tối, đánh đòn, bỏ đói mấy ngày liền. Bạn kiệt sức nhưng lòng thanh thản.' : 'Bạn cãi lại bọn bắt cóc. Chúng trói bạn lại, đánh một trận nhừ tử để cảnh cáo.', effects: { health: -14, happy: -5, karma: 3 }, scene: { anim: 'fall', fx: 'dust', npcs: [{ role: 'thug', anim: 'angry' }] }, tone: 'bad' }) };
    if (k === 'signal') { const p = U.clamp(0.3 + S.stats.smarts / 300, 0.2, 0.65); return { key: k, label: '📱 Lén báo tin cho gia đình / cơ quan chức năng', hint: 'Nếu bị phát hiện sẽ bị trừng phạt rất nặng', odds: () => p, fn: () => { if (miniWin(p)) { S.camp.signal = (S.camp.signal || 0) + 1; return { text: 'Bạn lén mượn được một chiếc điện thoại trong giây lát, gửi vội vị trí và ảnh khu nhà cho người thân. Họ báo ngay cho cơ quan chức năng. Hy vọng được giải cứu lớn hơn rồi.', effects: { happy: 4, karma: 1 }, scene: { loc: 'office', time: 'night', anim: 'phone', expr: 'scared', fx: 'idea' } }; } return { text: 'Bạn bị phát hiện đang cầm điện thoại. Cả đêm bọn chúng đánh bạn đến ngất đi, điện giật, nhốt thêm một tháng không thấy ánh sáng.', effects: { health: -22, happy: -8 }, scene: { anim: 'fall', fx: 'tears', npcs: [{ role: 'thug', anim: 'angry' }] }, tone: 'bad' }; } }; }
    // escape
    const p = U.clamp(0.12 + S.stats.health / 400 + S.stats.smarts / 600, 0.1, 0.4);
    return { key: 'escape', label: '🏃 Liều mạng bỏ trốn', hint: 'Rất nguy hiểm: bị bắt lại sẽ bị trừng phạt nặng', odds: () => p, fn: () => { if (miniWin(p)) { campRelease('escape'); return { text: 'Giữa đêm mưa, bạn trèo qua hàng rào thép gai, chạy băng qua ruộng và rừng tới khi thấy ánh đèn của đồn biên phòng. Bạn thoát! Đôi bàn chân rớm máu, nhưng bạn đã sống.', effects: { happy: 6 }, scene: { loc: 'countryside', time: 'night', weather: 'rain', anim: 'run', fx: 'sweat' } }; } if (c.kind === 'ransom' && Math.random() < 0.3) { c.kind = 'scam'; c.amount = 0; } return { text: 'Bạn bị bắt lại ngay sát hàng rào. Chúng đánh bạn gãy xương sườn' + (c.kind === 'scam' ? ', và bán bạn sang một khu lừa đảo khác nghiêm ngặt hơn' : '') + '.', effects: { health: -25, happy: -10 }, scene: { anim: 'fall', fx: 'tears', npcs: [{ role: 'thug', anim: 'angry' }] }, tone: 'bad' }; } };
  }
  ms({ id: 'ms_camp', title: 'Một năm trong bóng tối', icon: '⛓️', age: [16, 120],
    text: 'Lại thêm một năm nữa trôi qua. Cửa sổ có chấn song, cổng có lính canh, ngày nào cũng giống ngày nào. Bạn chỉ còn hai chọn lựa: chịu đựng, hoặc tìm cách thoát ra. Năm nay bạn làm gì?',
    scene: { loc: 'office', time: 'night', anim: 'sad', expr: 'sad', npcs: [{ role: 'thug', anim: 'point', say: 'Làm việc đi!' }], fx: 'tears', shot: 'dramatic' },
    choicesFn: () => ['ransom', 'work', 'resist', 'signal', 'escape'].map(campChoice).filter((c) => c._ok !== false), choiceByKey: campChoice });

  // ------------------------------------------------------------------ CHỈ SỐ QUÁ THẤP: đến ngưỡng thì xã hội, bố mẹ, thầy cô phản ứng và buộc bạn chọn cách đối mặt
  function lowStatYear(L) {
    if (!S || S.dead || S.jail || S.pending.length >= 2) return;
    const pa = P().age, st = S.stats, due = (f, gap) => !S.flags[f] || S.year - S.flags[f] >= gap;
    const cand = [];
    if (st.happy < 22 && pa >= 10 && due('lsHappy', 3)) cand.push(['ms_ls_tram', 'lsHappy', 3]);
    if (st.looks < 30 && pa >= 8 && pa <= 55 && due('lsLooks', 4)) cand.push(['ms_ls_xau', 'lsLooks', 4]);
    if (st.smarts < 30 && pa >= 6 && pa <= 17 && S.edu.inSchool && due('lsSmart', 3)) cand.push(['ms_ls_dot', 'lsSmart', 3]);
    if (st.health < 32 && pa >= 5 && due('lsHealth', 3)) cand.push(['ms_ls_yeu', 'lsHealth', 3]);
    if (!cand.length || Math.random() > 0.65) return;
    const c = U.pick(cand); S.flags[c[1]] = S.year; queueMilestone(c[0]);
  }
  ms({ id: 'ms_ls_xau', title: 'Lời chê bai về ngoại hình', icon: '🪞', age: [8, 55],
    text: 'Dạo này đi đâu bạn cũng nghe những lời xì xào về ngoại hình của mình: bạn bè trêu đặt biệt danh, người quen nói thẳng “trông không được ưa nhìn”. Soi gương, bạn thở dài.',
    scene: { loc: 'bedroom', time: 'night', anim: 'sad', expr: 'sad', fx: 'tears', shot: 'close' },
    choices: [
      { label: '💪 Mặc kệ, sống tự tin', text: 'Bạn tự nhủ giá trị con người không nằm ở khuôn mặt. Những lời chê vẫn còn đó, nhưng bạn không để chúng quyết định mình là ai.', effects: { happy: 2, karma: 2 }, scene: { anim: 'nod', fx: 'sparkle' } },
      { label: '💄 Chăm chút bản thân (500 nghìn)', req: { minMoney: 500000 }, text: 'Bạn đổi kiểu tóc, học cách ăn mặc, tập thể dục đều đặn. Sau vài tháng, người quen bảo trông bạn khác hẳn.', effects: { money: -500000, looks: 4, happy: 3, health: 1 }, scene: { loc: 'street', anim: 'dance', fx: 'sparkle' } },
      { label: '🏥 Đi thẩm mỹ (50 triệu, từ 18 tuổi)', req: { minMoney: 50000000 }, fn: () => { if (P().age < 18) return { text: 'Bạn chưa đủ 18 tuổi, bố mẹ không đồng ý cho can thiệp thẩm mỹ.', effects: { happy: -2, rel: { mother: -2 } }, scene: { anim: 'sad' } }; return { text: 'Ca phẫu thuật thành công, bạn nhìn mình trong gương với ánh mắt khác. Tiền hết, nhưng lòng tự tin quay lại.', effects: { money: -50e6, looks: 12, happy: 4 }, scene: { loc: 'hospital', anim: 'cheer', fx: 'sparkle' } }; } },
      { label: '😶 Thu mình, tránh gặp người khác', text: 'Bạn đeo khẩu trang, né những buổi gặp mặt. Sự tự ti nuốt dần niềm vui của bạn.', effects: { happy: -5, health: -1 }, scene: { anim: 'sad', fx: 'tears' } },
    ] });
  ms({ id: 'ms_ls_dot', title: 'Học dốt bị mắng', icon: '📉', age: [6, 17],
    text: 'Bảng điểm lại toàn điểm kém. Thầy cô gọi bạn lên nhắc nhở trước lớp, về nhà bố mẹ ngồi chờ sẵn với cuốn sổ liên lạc. “Sao mày dốt thế hả con?”',
    scene: { loc: 'home', time: 'night', anim: 'sad', expr: 'sad', npcs: [{ role: 'father', anim: 'angry', say: 'Học hành kiểu gì thế này!' }, { role: 'mother', anim: 'sad' }], fx: 'anger', shot: 'close' },
    choices: [
      { label: '📚 Hứa sẽ cố gắng, xin học thêm', text: 'Bạn xin được đi học thêm, bố mẹ gật đầu. Những tối sau đó, bạn ngồi cặm cụi giải bài đến khuya. Chậm mà chắc, điểm số nhích dần lên.', effects: { smarts: 4, happy: -2, rel: { mother: 2, father: 2 } }, scene: { loc: 'bedroom', anim: 'study', fx: 'idea' } },
      { label: '😤 Cãi lại: “Con không hợp học!”', text: 'Bạn cãi lại rồi bỏ vào phòng đóng sầm cửa. Cả nhà căng thẳng suốt tuần, điểm số vẫn đứng yên.', effects: { happy: -3, rel: { father: -6, mother: -4 } }, scene: { anim: 'angry', fx: 'anger' } },
      { label: '🙇 Nhận lỗi, im lặng chịu mắng', text: 'Bạn cúi đầu nghe hết. Lòng buồn rười rượi, tự thấy mình kém cỏi, nhưng ít nhất bố mẹ cũng nguôi giận.', effects: { happy: -4, rel: { father: 1 } }, scene: { anim: 'sad', fx: 'tears' } },
      { label: '🗣️ Nói thật là bạn học không theo kịp', text: 'Bạn lấy hết can đảm nói thật. Bố mẹ im lặng rất lâu, rồi mẹ nắm tay bạn: “Vậy mình cùng tìm cách.” Cả nhà thuê gia sư kèm cho bạn.', effects: { smarts: 3, happy: 2, money: -3000000, rel: { mother: 5, father: 3 } }, scene: { anim: 'hug', fx: 'hearts' } },
    ] });
  ms({ id: 'ms_ls_yeu', title: 'Cơ thể suy nhược', icon: '🩺', age: [5, 100],
    text: 'Bạn thường xuyên mệt mỏi, hụt hơi chỉ sau vài bước chân. Người thân nhìn bạn xanh xao mà lo lắng: “Con/bạn phải đi khám ngay thôi.”',
    scene: { loc: 'home', anim: 'sick', expr: 'sick', fx: 'sweat', shot: 'close' },
    choices: [
      { label: '🏥 Đi khám tổng quát (2 triệu)', req: { minMoney: 2000000 }, text: 'Bác sĩ dặn nghỉ ngơi, ăn uống đủ chất, tập nhẹ mỗi ngày. Bạn làm theo, thể trạng khá lên thấy rõ.', effects: { money: -2000000, health: 8, happy: 2 }, scene: { loc: 'hospital', anim: 'nod', fx: 'sparkle' } },
      { label: '🛌 Nghỉ ngơi dài ngày', text: 'Bạn xin nghỉ một thời gian, ngủ nhiều hơn, ăn cháo bồi bổ. Sức khoẻ khá lên chút ít.', effects: { health: 4, happy: -1 }, scene: { loc: 'bedroom', anim: 'sleep', fx: 'zzz' } },
      { label: '🙈 Cứ để đó, chắc không sao', text: 'Bạn gạt đi, tiếp tục sống như cũ. Cơ thể càng lúc càng kêu cứu.', effects: { health: -4 }, scene: { anim: 'sick', fx: 'sweat' } },
    ] });
  ms({ id: 'ms_ls_tram', title: 'Những ngày u tối', icon: '🌧️', age: [10, 100],
    text: 'Đã rất lâu rồi bạn không thấy vui. Mọi thứ đều xám xịt, bạn mệt mỏi, mất ngủ, chẳng muốn làm gì. Có lúc trong đầu bạn thoáng qua những ý nghĩ tiêu cực về chính mình.',
    scene: { loc: 'bedroom', time: 'night', weather: 'rain', anim: 'sad', expr: 'sad', fx: 'tears', shot: 'close' },
    choices: [
      { label: '🗣️ Nói với người thân', text: 'Bạn lấy hết can đảm kể ra. Người thân lặng đi, rồi ôm chặt bạn: “Có chuyện thế mà sao con/bạn không nói sớm.” Gánh nặng như vơi đi một nửa. Nói ra không phải yếu đuối — đó là bước dũng cảm nhất.', effects: { happy: 8, health: 2, rel: { mother: 4, father: 2 } }, scene: { loc: 'home', anim: 'hug', fx: 'hearts' } },
      { label: '🩺 Đi gặp bác sĩ tâm lý (1,5 triệu)', req: { minMoney: 1500000 }, text: 'Bác sĩ giải thích đây là một căn bệnh thật sự chứ không phải “yếu đuối hay nghĩ nhiều”. Sau các buổi trị liệu, bạn dần thấy nhẹ hơn.', effects: { money: -1500000, happy: 12, health: 2, smarts: 1 }, scene: { loc: 'hospital', anim: 'nod', fx: 'sparkle' } },
      { label: '🌳 Ra ngoài vận động, gặp bạn bè', text: 'Bạn ép mình ra công viên, gọi cho một người bạn cũ. Từng bước nhỏ, cảm giác nặng nề cũng dịu bớt phần nào.', effects: { happy: 6, health: 3, rel: { friend: 3 } }, scene: { loc: 'park', anim: 'walk', fx: 'sparkle' } },
      { label: '🤐 Giữ trong lòng, chịu đựng một mình', fn: () => { const p = U.clamp(0.04 + (30 - S.stats.happy) / 400, 0.02, 0.12); if (S.stats.happy < 12 && Math.random() < p) return { text: 'Bạn không kể với ai. Nỗi buồn chồng chất qua từng đêm, đến một ngày bạn cạn kiệt hết sức lực… Giá như đã có ai đó biết để cùng gánh. Nếu ngoài đời bạn có những ý nghĩ như vậy, hãy nói với người thân hoặc gọi đường dây hỗ trợ tại nơi bạn sống — bạn không đơn độc.', effects: { die: 'Kiệt quệ vì trầm cảm không được chữa trị' }, scene: { anim: 'sad', fx: 'tears' }, tone: 'bad' }; return { text: 'Bạn nuốt hết vào trong. Vẻ ngoài vẫn bình thường nhưng mỗi ngày trôi qua nặng nề hơn. Chịu đựng một mình thật sự rất mệt…', effects: { happy: -6, health: -3 }, scene: { anim: 'sad', fx: 'tears' }, tone: 'bad' }; } },
    ] });

  // ------------------------------------------------------------------ ÂM TIỀN: dưới 18 tuổi bố mẹ trả thay; từ 18 tuổi bắt buộc phải vay / bán đồ để trả
  const CASH_RATE = 0.15, CASH_YEARS = 5;
  const debtNeed = () => Math.ceil((-S.money * 1.05) / 1e6) * 1e6;
  function debtYear(L, deltas) {
    if (S.money >= 0 || S.dead) return;
    const pa = P().age, owe = -S.money;
    if (pa < 18) {
      const payer = alive('mother')[0] || alive('father')[0] || alive('grandparent')[0] || alive('sibling')[0];
      S.money = 0; deltas.money = (deltas.money || 0) + owe;
      if (payer) { addRel(payer, -Math.min(12, 3 + owe / 2e6), []); L('👪 Bạn đang nợ ' + fmtMoney(owe) + '. Chưa đủ 18 tuổi nên ' + nameOf(payer) + ' phải trả thay, mắng cho một trận nên thân.', 'bad', '💸'); }
      else L('🤝 Bạn đang nợ ' + fmtMoney(owe) + '. Chưa đủ 18 tuổi, họ hàng góp tiền trả giúp.', 'neutral', '💸');
      addStat('happy', -3, deltas);
      return;
    }
    if (S.jail) return;
    if (!S.pending.some((e) => e.id === 'ms_no_am')) queueMilestone('ms_no_am');
  }
  function nameOf(p) { const r = { mother: 'mẹ', father: 'bố', grandparent: p.gender === 'f' ? 'bà' : 'ông', sibling: p.gender === 'f' ? 'chị' : 'anh' }[p.role]; return r || p.firstName || p.name || 'người thân'; }
  function debtChoice(k) {
    const need = debtNeed(), payTxt = fmtMoney(need);
    if (k === 'bank') {
      const ok = !S.flags.noxau && (S.job || assetsValue() > need) && P().age <= 65;
      const pay = annuity(need, CASH_RATE, CASH_YEARS);
      return { key: k, label: '🏦 Vay ngân hàng tín chấp ' + payTxt, hint: ok ? 'Lãi ' + CASH_RATE * 100 + '%/năm, góp ' + fmtMoney(pay) + '/năm × ' + CASH_YEARS + ' năm' : S.flags.noxau ? 'Bạn đang có nợ xấu, ngân hàng từ chối' : 'Cần có việc làm hoặc tài sản đảm bảo', _ok: ok,
        fn: () => { S.loans = S.loans || []; S.loans.push({ assetId: null, cash: true, name: 'Khoản vay tín chấp', left: need, pay, rate: CASH_RATE, years: CASH_YEARS, since: S.year }); return { text: 'Bạn ký hợp đồng vay ' + payTxt + ' để lấp khoản âm. Mỗi năm phải góp ' + fmtMoney(pay) + ' trong ' + CASH_YEARS + ' năm. Thoát nợ trước mắt, nhưng đeo nợ dài hạn.', effects: { money: need, happy: -3 }, scene: { loc: 'office', anim: 'type', fx: 'money', npcs: [{ role: 'stranger', anim: 'talk', say: 'Anh/chị ký vào đây nhé.' }] } }; } };
    }
    if (k === 'fam') {
      const fam = alive('mother').concat(alive('father'), alive('spouse'), alive('sibling')).filter((p) => (p.relation ?? 60) >= 30);
      const p = fam[0];
      return { key: k, label: '🙏 Hỏi vay người thân ' + payTxt, hint: p ? 'Không lãi nhưng mất lòng · ' + nameOf(p) + ' sẽ cho vay' : 'Không còn người thân nào chịu cho vay', _ok: !!p,
        fn: () => { addRel(p, -8, []); S.flags.famDebt = (S.flags.famDebt || 0) + need; return { text: nameOf(p).replace(/^./, (c) => c.toUpperCase()) + ' thở dài rồi chuyển cho bạn ' + payTxt + ': “Lần này thôi đấy.” Món nợ ân tình này còn nặng hơn nợ ngân hàng.', effects: { money: need, happy: -4 }, scene: { loc: 'home', anim: 'bow', npcs: [{ role: p.role, anim: 'sad', say: 'Lo mà làm ăn đi con.' }], fx: 'sweat' } }; } };
    }
    if (k === 'sell') {
      const a = S.assets.slice().sort((x, y) => y.value - x.value)[0];
      return { key: k, label: a ? '🏷️ Bán gấp ' + a.name.toLowerCase() : '🏷️ Bán tài sản', hint: a ? 'Bán rẻ 85% giá, thu ' + fmtMoney(Math.round(a.value * 0.85)) : 'Không có tài sản nào để bán', _ok: !!a,
        fn: () => { const i = S.assets.indexOf(a); if (i >= 0) S.assets.splice(i, 1); const li = (S.loans || []).findIndex((l) => l.assetId === a.id); const owed = li >= 0 ? S.loans.splice(li, 1)[0].left : 0; const got = Math.round(a.value * 0.85) - owed; return { text: 'Cần tiền gấp nên bạn bán tháo ' + a.name.toLowerCase() + ', bị ép giá còn ' + fmtMoney(Math.round(a.value * 0.85)) + (owed ? ', trừ nợ ngân hàng ' + fmtMoney(owed) : '') + '. Tiếc đứt ruột.', effects: { money: got, happy: -6 }, scene: { loc: 'street', anim: 'sad', fx: 'money' } }; } };
    }
    // vay app (tín dụng đen): luôn vay được, nhưng lãi cắt cổ
    const amt = [10e6, 50e6, 200e6].find((v) => v * 0.8 >= need) || 200e6;
    return { key: 'app', label: '📲 Vay app online ' + fmtMoney(amt), hint: 'Duyệt 5 phút, nhận ' + fmtMoney(amt * 0.8) + ' · lãi cắt cổ, nợ năm sau thành ' + fmtMoney(amt * TDD_RATE), fn: () => { blackLoan(amt); return { text: 'Không ai cho vay, bạn đành bấm vay app. Tiền về tài khoản sau 5 phút, kèm một hợp đồng chẳng ai đọc nổi.', effects: { happy: -3 }, scene: { loc: 'bedroom', anim: 'phone', fx: 'money' }, tone: 'bad' }; } };
  }
  ms({ id: 'ms_no_am', title: 'Tài khoản bị âm', icon: '💸', age: [18, 120], many: true,
    text: 'Cuối năm kiểm lại sổ sách: bạn đang ÂM tiền. Chủ nhà, điện nước, thẻ tín dụng réo liên tục. Không thể khất thêm được nữa — phải tìm cách lấp khoản âm ngay.',
    scene: { loc: 'bedroom', time: 'night', anim: 'think', fx: 'sweat', shot: 'close' },
    choicesFn: () => ['bank', 'fam', 'sell', 'app'].map(debtChoice).filter((c) => c._ok !== false), choiceByKey: debtChoice });

  // ------------------------------------------------------------------ TÍN DỤNG ĐEN (vay nóng qua app): giải ngân 5 phút, lãi cắt cổ, đòi nợ khủng bố
  const TDD_RATE = 1.6; // nợ nhân lên mỗi năm (lãi + “phí” ≈ 160%/năm)
  function blackLoanView() {
    const d = S.blackDebt;
    return { debt: d ? d.left : 0, debtText: d ? fmtMoney(d.left) : '', level: d ? d.level : 0, can: P().age >= 18 && !S.jail && !(S.blackDebt && S.blackDebt.left > 5e8),
      amounts: [10e6, 50e6, 200e6].map((v) => ({ v, text: fmtMoney(v), get: fmtMoney(Math.round(v * 0.8)) })) };
  }
  function blackLoan(amount) {
    if (!S || S.dead || P().age < 18) return fail('Từ 18 tuổi mới vay được.');
    amount = [10e6, 50e6, 200e6].includes(+amount) ? +amount : 10e6;
    const got = Math.round(amount * 0.8), deltas = {}; // “phí hồ sơ, bảo hiểm” trừ thẳng 20%
    S.blackDebt = S.blackDebt || { left: 0, level: 0, since: S.year, apps: 0 };
    S.blackDebt.left += amount; S.blackDebt.apps++;
    addMoney(got, deltas); S.counters.blackLoans = (S.counters.blackLoans || 0) + 1;
    const text = 'App “' + U.pick(['Vay Nhanh 24h', 'Tiền Ơi', 'Ví Vàng', 'DongTien Pro', 'Cash365']) + '” giải ngân sau 5 phút, không cần thế chấp. Ghi nợ ' + fmtMoney(amount) + ' nhưng tiền về tài khoản chỉ ' + fmtMoney(got) + ' (“phí hồ sơ, bảo hiểm khoản vay”). Bạn bấm đồng ý cho app đọc toàn bộ danh bạ mà không để ý.';
    addLog('📲 ' + text, 'bad', '📲'); changed();
    return result({ title: '📲 Vay nóng qua app', icon: '📲', text, tone: 'bad', deltas, scene: sceneFor('bedroom', { anim: 'phone', fx: 'money' }) });
  }
  function blackRepay() {
    const d = S.blackDebt; if (!d || d.left <= 0) return fail('Bạn không nợ app nào.');
    if (S.money < d.left) return fail('Cần ' + fmtMoney(d.left) + ' để tất toán.');
    const deltas = {}, amt = d.left; addMoney(-amt, deltas); S.blackDebt = null; addStat('happy', 8, deltas);
    const text = 'Bạn tất toán ' + fmtMoney(amt) + ' cho các app vay. Gỡ app, đổi số điện thoại, cảm giác như trút được tảng đá khỏi ngực.';
    addLog('✅ ' + text, 'good', '🧾'); changed();
    return result({ title: '🧾 Trả hết nợ app', icon: '🧾', text, tone: 'good', deltas, scene: sceneFor('home', { anim: 'cheer', fx: 'sparkle' }) });
  }
  function blackDebtYear(L) {
    const d = S.blackDebt; if (!d || d.left <= 0) return;
    d.left = Math.round(d.left * TDD_RATE / 1e5) * 1e5;
    d.level = Math.min(3, d.level + 1);
    L('📲 Nợ app vay nóng đã thành ' + fmtMoney(d.left) + ' (lãi chồng lãi).', 'bad', '📲');
    if (S.pending.length < 3) queueMilestone('ms_tdd_doino');
  }
  function tddChoice(k) {
    const d = S.blackDebt || { left: 0, level: 1 };
    if (k === 'tra') return { key: k, label: '💸 Gom tiền trả hết (' + fmtMoney(d.left) + ')', req: { minMoney: d.left }, fn: () => { const amt = d.left; S.blackDebt = null; return { text: 'Bạn trả sạch ' + fmtMoney(amt) + '. Điện thoại im lặng lần đầu sau nhiều tháng.', effects: { money: -amt, happy: 6 }, scene: { anim: 'nod', fx: 'sparkle' }, tone: 'good' }; } };
    if (k === 'dap') return { key: k, label: '📲 Vay app khác đắp vào', fn: () => { const n = Math.round(d.left * 0.5); d.left = Math.round(d.left * 1.5); d.apps++; return { text: 'Bạn vay thêm ' + d.apps + ' app để trả lãi app cũ. Vòng xoáy mới bắt đầu: tổng nợ giờ là ' + fmtMoney(d.left) + '.', effects: { money: Math.round(n * 0.2), happy: -6 }, scene: { anim: 'phone', fx: 'sweat' }, tone: 'bad' }; } };
    if (k === 'nha') return { key: k, label: '🙏 Thú thật với gia đình, nhờ trả giúp', fn: () => { const amt = d.left; S.blackDebt = null; return { text: 'Bạn quỳ xuống thú nhận. Cả nhà giận đến tím mặt, rồi vẫn gom góp, bán cả vàng cưới của mẹ để trả ' + fmtMoney(amt) + '. Bạn hứa không bao giờ tái phạm.', effects: { happy: -6, karma: 2, rel: { all: -12 } }, scene: { loc: 'home', anim: 'cry', fx: 'tears' }, tone: 'neutral' }; } };
    const p = U.clamp(0.45 + karmaLuck() + (S.stats.smarts - 50) / 200, 0.2, 0.75);
    return { key: 'ca', label: '🚓 Tố cáo với công an (lãi suất trái luật)', mini: 'interview', odds: () => p, fn: () => miniWin(p)
      ? (S.blackDebt = null, { text: 'Bạn nộp đủ bằng chứng tin nhắn đe doạ. Công an triệt phá đường dây cho vay nặng lãi, khoản nợ phi pháp bị huỷ. Bạn chỉ phải trả gốc.', effects: { money: -Math.round(d.left / TDD_RATE / 2), happy: 10, karma: 3 }, scene: { loc: 'office', anim: 'cheer', npcs: [{ role: 'police', anim: 'nod' }] }, tone: 'good' })
      : { text: 'Đơn tố cáo chưa có kết quả, còn bọn đòi nợ biết chuyện. Tối đó cửa nhà bạn bị tạt sơn đỏ chữ “QUỴT NỢ”.', effects: { happy: -12, health: -3, rel: { all: -5 } }, scene: { loc: 'street', time: 'night', anim: 'scared', fx: 'anger' }, tone: 'bad' } };
  }
  const TDD_TEXT = ['Điện thoại reo liên tục. Tin nhắn gửi tới cả danh bạ: “' + 'Người này nợ tiền không trả, ai quen nhắc giùm”. Sếp, đồng nghiệp, cả cô giáo cũ của bạn đều nhận được.',
    'Sáng ra cửa nhà bạn bị sơn chữ đỏ, đổ mắm tôm. Hàng xóm xì xào. Bọn đòi nợ nhắn: “Lần sau không chỉ là mắm tôm.”',
    'Hai gã xăm trổ chặn bạn ở đầu ngõ, giật điện thoại, doạ “xử” nếu cuối tuần không có tiền. Cả nhà sống trong sợ hãi.'];
  ms({ id: 'ms_tdd_doino', title: 'Đòi nợ kiểu khủng bố', icon: '📵', age: [18, 99],
    text: 'Khoản vay nóng đã đến hạn mà bạn không trả nổi.',
    scene: { loc: 'home', anim: 'phone', expr: 'scared', npcs: [{ role: 'thug', anim: 'angry', say: 'Trả tiền đây!' }], fx: 'exclaim', shot: 'dramatic' },
    choicesFn: () => ['tra', 'dap', 'nha', 'ca'].map(tddChoice), choiceByKey: tddChoice });
  // lời mời vay khi túng thiếu
  ms({ id: 'ms_tdd_moi', title: 'Tin nhắn “hỗ trợ tài chính”', icon: '💬', age: [18, 70],
    text: 'Đang cháy túi thì một tin nhắn hiện lên: “Vay 50 triệu chỉ cần CCCD, duyệt 5 phút, không thẩm định, lãi 0,03%/ngày.” Nghe… rẻ thật.',
    scene: { loc: 'bedroom', anim: 'phone', fx: 'money' },
    choices: [
      { label: '📲 Vay thử 50 triệu', fn: () => { blackLoan(50e6); return { text: 'Bạn bấm “Đồng ý” và tiền về ngay. “0,03%/ngày” hoá ra chưa tính phí dịch vụ, phí tư vấn, phí bảo hiểm…', effects: { happy: 2 }, scene: { anim: 'phone' }, tone: 'bad' }; } },
      { label: '🗑️ Xoá tin nhắn, chặn số', text: 'Bạn xoá tin nhắn. Thiếu thì ăn mì tôm vậy, còn hơn dính vào app vay.', effects: { karma: 1 }, scene: { anim: 'shrug' } }
    ] });

  // ------------------------------------------------------------------ CHƠI HỤI: góp tiền hằng tháng với hàng xóm; hốt sớm thì chịu lãi, chờ cuối thì có lời; chủ hụi có thể ôm tiền bỏ trốn
  const HUI_LEVELS = [2e6, 5e6, 20e6];
  function huiView() {
    const h = S.hui;
    return { open: P().age >= 18 && !S.jail, h: h ? { per: fmtMoney(h.per), paid: fmtMoney(h.paid), years: h.years, taken: !!h.taken, host: h.host, potEarly: fmtMoney(Math.round(h.per * 12 * 2 * 0.82)), potEnd: fmtMoney(Math.round(h.per * 12 * 2 * 1.12)) } : null,
      levels: HUI_LEVELS.map((v) => ({ v, text: fmtMoney(v) + '/tháng' })) };
  }
  function huiJoin(per) {
    if (!S || S.dead || P().age < 18) return fail('Từ 18 tuổi mới chơi hụi được.');
    if (S.hui) return fail('Bạn đang chơi một dây hụi rồi.');
    per = HUI_LEVELS.includes(+per) ? +per : HUI_LEVELS[0];
    const host = U.pick(['bà Tư bán tạp hoá', 'cô Sáu đầu hẻm', 'chị Hai bán vải', 'bác Ba tổ trưởng']);
    S.hui = { per, paid: 0, years: 2, taken: false, host, risk: U.rand(0.04, 0.12) + (per >= 20e6 ? 0.05 : 0) };
    changed();
    return result({ title: '🧧 Tham gia dây hụi', icon: '🧧', text: 'Bạn vào dây hụi của ' + host + ': mỗi tháng góp ' + fmtMoney(per) + ', chơi 2 năm. Cần tiền gấp thì “hốt” sớm (chịu lãi), kiên nhẫn chờ đến cuối thì được cả gốc lẫn lời. Chỉ mong chủ hụi đừng… ôm tiền chạy.', tone: 'neutral', scene: sceneFor('street', { anim: 'talk', people: [] }) });
  }
  function huiTake() {
    const h = S.hui; if (!h || h.taken) return fail('Không hốt hụi được.');
    const pot = Math.round(h.per * 12 * 2 * 0.82), deltas = {}; h.taken = true; addMoney(pot, deltas);
    const text = 'Bạn bỏ thăm cao nhất, hốt hụi sớm được ' + fmtMoney(pot) + '. Từ giờ vẫn phải góp đều mỗi tháng (gọi là “hụi chết”) cho tới hết dây.';
    addLog('🧧 ' + text, 'neutral', '🧧'); changed();
    return result({ title: '🧧 Hốt hụi', icon: '🧧', text, tone: 'good', deltas, scene: sceneFor('street', { anim: 'cheer', fx: 'money' }) });
  }
  function huiYear(L, deltas) {
    const h = S.hui; if (!h) return;
    // chủ hụi vỡ hụi, ôm tiền bỏ trốn
    if (!h.taken && Math.random() < h.risk) { const lost = h.paid; S.hui = null; S.flags.vohui = S.year; L('💥 VỠ HỤI! ' + cap(h.host) + ' ôm tiền của cả xóm bỏ trốn trong đêm. Bạn mất trắng ' + fmtMoney(lost) + ' đã góp.', 'bad', '💥'); addStat('happy', -12, deltas); if (S.pending.length < 3) queueMilestone('ms_hui_vo'); return; }
    const y = h.per * 12; addMoney(-y, deltas); h.paid += y; h.years--;
    L('🧧 Góp hụi năm nay: ' + fmtMoney(y) + '.', 'neutral', '🧧');
    if (h.years <= 0) { if (!h.taken) { const pot = Math.round(h.per * 12 * 2 * 1.12); addMoney(pot, deltas); L('🧧 Mãn dây hụi! Bạn hốt cuối, nhận ' + fmtMoney(pot) + ' — cả gốc lẫn lời.', 'good', '🧧'); } else L('🧧 Dây hụi kết thúc, bạn đã góp đủ phần “hụi chết”.', 'neutral', '🧧'); S.hui = null; }
  }
  ms({ id: 'ms_hui_vo', title: 'Vỡ hụi!', icon: '💥', age: [18, 99],
    text: 'Cả xóm kéo đến nhà chủ hụi thì chỉ còn căn nhà trống. Người khóc, người chửi, có cụ già mất cả tiền dưỡng già.',
    scene: { loc: 'street', anim: 'angry', npcs: [{ role: 'neighbor', anim: 'cry', say: 'Tiền dưỡng già của tôi…' }, { role: 'neighbor', anim: 'angry' }], fx: 'anger', shot: 'dramatic' },
    choices: [
      { label: '🔎 Cùng mọi người truy tìm chủ hụi', mini: 'chase', success: { stat: 'smarts', base: 0.25, scale: 0.4 },
        outcomes: [
          { text: 'Lần theo Facebook con gái chủ hụi, cả xóm tìm ra bà ta trốn ở quê. Công an vào cuộc, bạn đòi lại được một nửa số tiền.', effects: { money: 30000000, happy: 6, karma: 2 }, scene: { anim: 'cheer' } },
          { text: 'Chủ hụi đã cao chạy xa bay. Bạn mất ngủ nhiều tuần.', effects: { happy: -6 }, scene: { anim: 'sad' } }
        ] },
      { label: '⚖️ Làm đơn tố cáo tập thể', text: 'Cả xóm cùng ký đơn. Vụ án kéo dài nhiều năm, nhưng ít ra bạn không ôm hận một mình.', effects: { karma: 2, happy: -2 }, scene: { loc: 'office', anim: 'nod' } },
      { label: '😮‍💨 Coi như của đi thay người', text: 'Bạn thở dài. Từ nay chỉ gửi tiết kiệm ngân hàng thôi.', effects: { happy: -3, smarts: 1 }, scene: { anim: 'shrug' } }
    ] });

  // ------------------------------------------------------------------ SỐT ĐẤT / VÀNG / COIN: thị trường sốt thì cả xóm rủ nhau đầu tư; vỡ thì đu đỉnh
  function fomoChoice(k) {
    const m = Math.max(0, S.money), amt = Math.round(Math.max(5e7, m * 0.5) / 1e6) * 1e6;
    if (k === 'dat') return { key: k, label: '🏞️ Ôm đất nền dự án (' + fmtMoney(amt) + ')', req: { minMoney: amt }, fn: () => ({ text: 'Bạn cọc lô đất nền “sắp lên sổ, gần sân bay tương lai”. Môi giới cam kết một năm x2.', effects: { money: -amt, happy: 4, asset: { add: { type: 'land', name: 'Đất nền dự án', value: Math.round(amt * 0.95) } }, flag: 'fomo_dat' }, scene: { loc: 'countryside', anim: 'cheer', fx: 'money', npcs: [{ role: 'stranger', anim: 'talk', say: 'Mua đi, mai lên giá!' }] }, tone: 'neutral' }) };
    if (k === 'coin') return { key: k, label: '🪙 Đổ tiền vào coin “sắp lên sàn” (' + fmtMoney(amt) + ')', req: { minMoney: amt }, fn: () => ({ text: 'Bạn vào nhóm Telegram “hội nhà giàu”, mua một đồng coin mới mà “đội dev toàn người Singapore”. Biểu đồ xanh lè, ai cũng hô “to the moon”.', effects: { money: -amt, happy: 5, asset: { add: { type: 'coin', name: 'Coin ' + U.pick(['MoonDoge', 'VinaToken', 'SafeLambo', 'PhởCoin']), value: amt } }, flag: 'fomo_coin' }, scene: { loc: 'bedroom', anim: 'type', fx: 'money' }, tone: 'neutral' }) };
    if (k === 'vang') { const g = Math.round(amt / 2 / 1e6) * 1e6; return { key: k, label: '🪙 Xếp hàng mua vàng tích trữ (' + fmtMoney(g) + ')', req: { minMoney: g }, fn: () => ({ text: 'Bạn xếp hàng từ 5 giờ sáng ở tiệm vàng, chen lấn mới mua được mấy chỉ. Ai cũng sợ vàng còn lên nữa.', effects: { money: -g, happy: 2, asset: { add: { type: 'luxury', name: 'Vàng tích trữ', value: Math.round(g * 0.95) } } }, scene: { loc: 'market', anim: 'cheer', npcs: [{ role: 'crowd', anim: 'idle' }] }, tone: 'neutral' }) }; }
    return { key: 'thoi', label: '🧘 Đứng ngoài, không đu', fn: () => ({ text: 'Bạn đứng ngoài nhìn cả xóm “lướt sóng”. Có người khoe lãi gấp đôi, bạn hơi tiếc… nhưng ngủ ngon.', effects: { smarts: 1 }, scene: { anim: 'shrug' } }) };
  }
  ms({ id: 'ms_fomo', title: 'Cả xóm rủ nhau “lướt sóng”', icon: '🔥', age: [20, 80],
    text: 'Thị trường đang sốt. Bà hàng xóm vừa lãi 2 tỷ nhờ một lô đất, thằng em họ khoe coin x10 trong một tuần. Ở quán cà phê, ai cũng bàn chuyện đầu tư.',
    scene: { loc: 'cafe', anim: 'think', npcs: [{ role: 'neighbor', anim: 'talk', say: 'Không mua là mất cơ hội đấy!' }, { role: 'relative', anim: 'phone' }], fx: 'money' },
    choicesFn: () => ['dat', 'coin', 'vang', 'thoi'].map(fomoChoice), choiceByKey: fomoChoice });
  function fomoYear(L) {
    const ph = market().phase, pa = P().age;
    if (pa < 20 || S.jail || S.pending.length > 2) return;
    if (ph === 'sot' && S.money > 1e8 && Math.random() < 0.45) queueMilestone('ms_fomo');
    // coin “rug pull”: đội dev ôm tiền bỏ chạy
    S.assets.filter((a) => a.type === 'coin').forEach((a) => { if (Math.random() < 0.12) { L('🪙 ' + a.name + ' bị “rug pull”: đội phát triển rút hết tiền rồi biến mất. Giá về 0.', 'bad', '💀'); a.value = 0; } });
    S.assets = S.assets.filter((a) => !(a.type === 'coin' && a.value < 1e5));
    if (ph === 'vo' && (S.flags.fomo_dat || S.flags.fomo_coin) && !S.flags.dudinh) { S.flags.dudinh = S.year; L('📉 “Đu đỉnh” rồi! Thứ bạn mua lúc sốt giờ mất giá thảm hại. Cả xóm nhìn nhau ngao ngán.', 'bad', '📉'); addStat('happy', -6, {}); }
  }

  // ------------------------------------------------------------------ THỊ TRƯỜNG VIỆC LÀM sống động: mỗi năm mỗi ngành một khác — sốt tuyển, bình thường, sa thải; thời AI một số nghề bị thay thế
  const FIELDS = {
    it: { name: 'Công nghệ', icon: '💻', jobs: ['laptrinh', 'thietke', 'esports'] },
    taichinh: { name: 'Tài chính – ngân hàng', icon: '🏦', jobs: ['nganhang', 'ketoan'] },
    xaydung: { name: 'Xây dựng – bất động sản', icon: '🏗️', jobs: ['kysu', 'kientrucsu', 'congnhan'] },
    dichvu: { name: 'Dịch vụ – du lịch', icon: '🧳', jobs: ['phucvu', 'huongdanvien', 'tiepvien', 'phicong', 'daubep', 'thocattoc', 'banhang'] },
    truyenthong: { name: 'Truyền thông', icon: '📣', jobs: ['marketing', 'nhabao', 'phiendich', 'streamer'] },
    giaothong: { name: 'Giao hàng – vận tải', icon: '🛵', jobs: ['shipper', 'taixe'] },
  };
  const AI_RISK = ['ketoan', 'phiendich', 'marketing', 'thietke', 'nganhang', 'congnhan', 'taixe', 'nhabao'];
  function fieldOf(id) { return Object.keys(FIELDS).find((k) => FIELDS[k].jobs.includes(id)) || null; }
  function jmState() { return S.jobMarket || (S.jobMarket = {}); }
  function jobMarketYear(L) {
    const jm = jmState(), ph = market().phase;
    Object.keys(FIELDS).forEach((k) => {
      let r = Math.random() + (k === 'xaydung' ? ({ sot: 0.25, vo: -0.35, suy: -0.2 }[ph] || 0) : 0) + (k === 'dichvu' && S.flags.covid === S.year ? -0.5 : 0);
      jm[k] = r > 0.82 ? 'hot' : r < 0.14 ? 'layoff' : 'normal';
    });
    if (P().age >= 18 && P().age < 65) {
      const hot = Object.keys(jm).filter((k) => jm[k] === 'hot').map((k) => FIELDS[k].icon + ' ' + FIELDS[k].name), cold = Object.keys(jm).filter((k) => jm[k] === 'layoff').map((k) => FIELDS[k].icon + ' ' + FIELDS[k].name);
      if (hot.length || cold.length) L('📰 Thị trường việc làm: ' + (hot.length ? 'đang khát nhân lực ' + hot.join(', ') : '') + (hot.length && cold.length ? '; ' : '') + (cold.length ? 'sa thải hàng loạt ở ' + cold.join(', ') : '') + '.', 'neutral', '📰');
    }
    // đang làm trong ngành bị sa thải → có thể mất việc; thời AI (từ 2030) một số nghề bị thay thế dần
    if (S.job && !S.jail) {
      const f = fieldOf(S.job.id), aiYear = S.year >= 2030 && AI_RISK.includes(S.job.id);
      const risk = (f && jm[f] === 'layoff' ? 0.3 : 0) + (aiYear ? Math.min(0.25, (S.year - 2029) * 0.015) : 0) - (S.job.perf - 50) / 300 - repTier(repN()) * 0.04;
      if (risk > 0 && Math.random() < risk && S.pending.length < 3) queueMilestone('ms_layoff');
      if (f && jm[f] === 'hot') S.job.perf = r100(S.job.perf + 2);
    }
  }
  function jmHire(id) { const jm = S && S.jobMarket, f = fieldOf(id); if (!jm || !f) return 0; return jm[f] === 'hot' ? 0.12 : jm[f] === 'layoff' ? -0.15 : 0; }
  function jobMarketView() { const jm = S.jobMarket || {}; return Object.keys(FIELDS).filter((k) => jm[k] && jm[k] !== 'normal').map((k) => ({ name: FIELDS[k].name, icon: FIELDS[k].icon, state: jm[k], label: jm[k] === 'hot' ? 'đang sốt tuyển (+12% đậu)' : 'đang sa thải (−15% đậu)' })); }
  ms({ id: 'ms_layoff', title: 'Danh sách cắt giảm nhân sự', icon: '📉', age: [18, 70],
    text: 'Phòng nhân sự mời bạn lên “nói chuyện riêng”. Công ty đang tái cấu trúc, tên bạn nằm trong danh sách cắt giảm.',
    scene: { loc: 'office', anim: 'scared', npcs: [{ role: 'boss', anim: 'shrug', say: 'Anh/chị thông cảm, công ty khó khăn…' }], fx: 'sweat', shot: 'dramatic' },
    choices: [
      { label: '📝 Ký nhận trợ cấp thôi việc', fn: () => { const sev = pay(monthly() * U.randi(3, 6)); const tl = S.job ? D.CAREERS[S.job.id].title : ''; S.job = null; return { text: 'Bạn ôm thùng các-tông bước ra khỏi toà nhà, nhận ' + fmtMoney(sev) + ' trợ cấp. Từ mai không còn là ' + tl.toLowerCase() + ' nữa.', effects: { money: sev, happy: -10 }, scene: { loc: 'street', anim: 'sad', fx: 'tears' }, tone: 'bad' }; } },
      { label: '💪 Xin ở lại, chấp nhận giảm lương', mini: 'interview', odds: () => U.clamp(0.35 + (S.stats.smarts - 50) / 125, 0.15, 0.8), fn: () => { const p = U.clamp(0.35 + (S.stats.smarts - 50) / 125, 0.15, 0.8); if (miniWin(p)) { if (S.job) { S.job.mult = (S.job.mult || 1) * 0.8; S.job.perf = r100(S.job.perf + 5); } return { text: 'Bạn trình bày kế hoạch cắt giảm chi phí cho chính bộ phận mình. Sếp gật gù giữ bạn lại, lương giảm 20% nhưng còn việc.', effects: { happy: -2 }, scene: { anim: 'nod' }, tone: 'neutral' }; } S.job = null; return { text: 'Quyết định đã ký. Bạn vẫn phải ra đi, tay trắng không trợ cấp vì đã xin ở lại quá muộn.', effects: { happy: -10 }, scene: { anim: 'sad' }, tone: 'bad' }; } },
      { label: '🎓 Đi học nghề mới ngay', fn: () => { const tl = S.job ? D.CAREERS[S.job.id].title : ''; S.job = null; return { text: 'Bạn coi đây là cơ hội làm lại. Rời vị trí ' + tl.toLowerCase() + ', bạn đăng ký khoá học nghề mới, đọc sách mỗi tối.', effects: { happy: -4, smarts: 4 }, scene: { loc: 'university', anim: 'study', fx: 'idea' }, tone: 'neutral' }; } }
    ] });
  // 🪙 giá vàng: dao động quanh "giá trị thật" chỉ nhích ~1%/năm (lương, giá đồ trong game không lạm phát),
  // có năm sập, năm sốt; khủng hoảng thì vàng lên (trú ẩn), kinh tế sốt nóng thì vàng hạ nhiệt.
  function goldYear(L, mk) {
    const fair = 85e6 * Math.pow(1.01, Math.max(0, S.year - 2026));
    let dev = S.goldPrice / fair;
    dev = dev * 0.65 + 0.35 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.16; // kéo dần về mức thật + nhiễu
    const r = Math.random();
    if (r < 0.08) dev *= U.rand(0.68, 0.82); else if (r < 0.14) dev *= U.rand(1.18, 1.35);
    dev *= ({ vo: 1.08, suy: 1.04, sot: 0.95 }[mk.phase] || 1);
    const old = S.goldPrice;
    S.goldPrice = Math.round(fair * U.clamp(dev, 0.55, 1.75) / 1e5) * 1e5;
    const ch = S.goldPrice / old - 1, n = S.assets.filter((a) => a.type === 'gold').length;
    if (n && Math.abs(ch) >= 0.03) L('🪙 Giá vàng năm nay ' + (ch > 0 ? 'tăng ' : 'giảm ') + Math.round(Math.abs(ch) * 100) + '%, còn ' + fmtMoney(S.goldPrice) + '/lượng.' + (ch <= -0.15 ? ' Ai ôm vàng lúc đỉnh giờ khóc ròng.' : ch >= 0.15 ? ' Tiệm vàng xếp hàng dài.' : ''), ch > 0 ? 'good' : 'bad', '🪙');
  }
  function moneyYear(L, deltas) {
    const pa = P().age;
    marketYear(L);
    const mk = market();
    goldYear(L, mk);
    S.assets.forEach((a) => {
      const k = { phone: 0.7, motorbike: 0.88, car: 0.9, house: mk.reK * U.rand(0.99, 1.02), land: mk.reK * U.rand(0.96, 1.08), stock: mk.stK * U.rand(0.88, 1.12), gold: null, luxury: a.itemId === 'art1' ? 1.05 : 0.93, coin: { sot: U.rand(1.3, 3.2), vo: U.rand(0.05, 0.35), suy: U.rand(0.45, 1.05), binh: U.rand(0.6, 1.8) }[mk.phase] }[a.type];
      a.value = a.type === 'gold' ? Math.round(S.goldPrice * 0.97) : Math.round(a.value * (k || 1));
    });
    loansYear(L, deltas);
    // tiền tiêu vặt: phần lớn tiêu vào quà vặt, chỉ để dành được chút ít
    if (pa >= 6 && pa < 18 && parentsBack()) { const pm = Math.round((pa < 12 ? U.randi(1, 4) : U.randi(2, 10)) * 1e5 * (S.flags.perk_giau ? 3 : 1) * ({ chieu: 1.8, thoo: 0.4 }[S.parenting] || 1) / 1e4) * 1e4; addMoney(pm, deltas); L('💵 Cả năm để dành được ' + fmtMoney(pm) + ' tiền tiêu vặt ' + (has('mother') ? 'mẹ' : 'bố') + ' cho.', 'neutral', '💵'); }
    // “mẹ giữ hộ”: trẻ con cầm nhiều tiền thì bố mẹ cất giùm — lớn lên mới trả lại (một phần)
    if (pa < 16 && parentsBack()) {
      const cap = 3e5 + Math.max(0, pa - 5) * 2e5;
      const who = has('mother') ? 'mẹ' : 'bố';
      if (S.money > cap) { const ex = S.money - cap; S.kidSaved = (S.kidSaved || 0) + ex; addMoney(-ex, deltas); if (ex >= 1e6) L(who.charAt(0).toUpperCase() + who.slice(1) + ' “giữ hộ” ' + fmtMoney(ex) + ' tiền của bạn: “Để ' + who + ' cất cho, lớn ' + who + ' trả.”', 'neutral', '🐷'); }
    }
    if (pa === 18 && S.kidSaved) {
      const back = parentsBack() ? Math.round(S.kidSaved * 0.5 / 1e5) * 1e5 : 0;
      const who = has('mother') ? 'mẹ' : 'bố';
      if (back) { addMoney(back, deltas); L('Tròn 18 tuổi, ' + who + ' đưa lại ' + fmtMoney(back) + ' “tiền ' + who + ' giữ hộ”. Phần còn lại ' + who + ' bảo đã… đóng học phí và mua quần áo cho bạn.', 'neutral', '🐷'); }
      S.kidSaved = 0;
    }
    // tiền thừa kế của con chưa đủ 18 tuổi: gửi trong tài khoản đứng tên con, đủ tuổi thì nhận đủ
    if (pa >= 18 && S.trust) { addMoney(S.trust, deltas); L('Tròn 18 tuổi, bạn chính thức nhận toàn bộ ' + fmtMoney(S.trust) + ' tiền thừa kế được gửi giữ theo luật từ khi bố/mẹ mất.', 'milestone', '📜'); S.trust = 0; }
    if (pa === 18 && S.flags.perk_giau && !S.flags.giau_paid && parentsBack()) { S.flags.giau_paid = S.year; addMoney(600e6, deltas); L('Tròn 18 tuổi, bố mẹ trao cho bạn 600 triệu làm vốn vào đời.', 'good', '💰'); }
    if (pa < 18) return;
    const parentsAlive = parentsBack();
    const ls = lifestyleDef();
    let income = 0, cost = 0, tax = 0;
    let bizLoss = 0;
    if (S.job) {
      const c = D.CAREERS[S.job.id];
      if (c.volatile) {
        // làm chủ / sáng tạo nội dung: thu nhập lên xuống thất thường, có năm lỗ, có năm sập
        let yr = Math.round(monthly() * 12 * U.rand(-0.4, 1.7));
        if (Math.random() < 0.06 + (S.job.perf < 40 ? 0.08 : 0)) {
          const hit = Math.round(Math.max(0, S.money) * U.rand(0.15, 0.4));
          yr = -hit - monthly() * 6; S.job.level = Math.max(0, S.job.level - 1); S.job.perf = r100(S.job.perf - 20);
          L(c.id === 'kinhdoanh' ? 'Làm ăn thua lỗ nặng: thị trường đóng băng, khách bỏ đi, bạn phải thu hẹp quy mô và mất ' + fmtMoney(-yr) + '.' : 'Năm nay bị thuật toán “bóp”, mất hợp đồng quảng cáo, thu nhập lao dốc.', 'bad', '📉');
        }
        if (yr >= 0) { income += yr; tax = Math.round(yr * 0.07); } else bizLoss = -yr;
      } else { const m = monthly(); income += m * 12; tax = pit(m) * 12; }
    }
    if (S.retired && S.pension) income += S.pension * 12;
    if (has('spouse') && alive('spouse')[0].age < 62) income += 45e6;
    const student = S.edu.inSchool;
    // chưa có thu nhập mà còn bố mẹ: ở nhà bố mẹ nuôi, chỉ tốn chút tiền tiêu vặt
    const atHome = parentsAlive && income === 0 && pa < 30 && !S.retired;
    if (atHome && !student) cost += 6e6 * ls.base;
    else if (!(student && parentsAlive)) {
      const big = S.city === 'hanoi' || S.city === 'hcm';
      // sinh hoạt + tiền thuê nhà (nếu không có nhà riêng) — mặt bằng giá thành phố lớn đắt hơn nhiều
      let base = S.abroad ? 260e6 : (big ? 80e6 : 60e6) + (hasHome() ? 0 : big ? 72e6 : 42e6);
      if (income <= 0) base = Math.min(base, 40e6); // thất nghiệp: ở ghép, ăn uống tằn tiện
      // khoản bắt buộc: con cái (sữa bỉm, học hành), nuôi tài sản (xăng xe, phí quản lý, bảo dưỡng)
      let must = 0;
      S.people.filter((x) => x.alive && x.role === 'child' && x.age < 23).forEach((x) => { must += x.age < 6 ? 36e6 : x.age < 18 ? 48e6 : 40e6; });
      S.assets.forEach((a) => { must += a.type === 'car' ? Math.max(15e6, a.value * 0.05) : a.type === 'house' ? a.value * 0.004 : a.type === 'luxury' ? a.value * 0.015 : a.type === 'motorbike' ? 3e6 : 0; });
      // phụng dưỡng bố mẹ già — chỉ khi còn dư sau khoản bắt buộc
      const olds = S.people.filter((x) => x.alive && (x.role === 'mother' || x.role === 'father') && x.age >= 60);
      if (pa >= 25 && income - tax - must > base && olds.length) { must += 18e6 * olds.length; olds.forEach((x) => (x.relation = r100(x.relation + 1))); }
      // chi tiêu cá nhân theo mức sống; người có thu nhập thì tiêu trong khả năng (tiết kiệm được một phần), riêng sang chảnh thì vung tay quá trán
      let disc = base * ls.base + Math.max(0, income - tax) * ls.share;
      if (income > 0) disc = Math.min(disc, Math.max(25e6, (income - tax - must) * ({ tietkiem: 0.72, binhthuong: 0.86, thoaimai: 0.96, sangchanh: 1.15 }[ls.id] || 0.86)));
      cost += must + disc;      if (S.retired) cost *= 0.8;
      if (ls.id === 'sangchanh') S.counters.lavishYears = (S.counters.lavishYears || 0) + 1;
      if (ls.looks) addStat('looks', U.rand(0, ls.looks), deltas);
    }
    if (student && S.edu.level === 'university') {
      const ab = S.edu.abroad;
      const t = ab ? (ab.sch === 'full' ? 0 : ab.sch === 'half' ? 350e6 : 700e6) : (D.MAJORS[S.edu.major] || {}).tuition || 0;
      if (t) { if (ab ? ab.paidBy !== 'parents' || !parentsAlive : S.money >= t) cost += t; else if (parentsAlive) L('Bố mẹ dành dụm đóng ' + fmtMoney(t) + ' học phí cho bạn.', 'neutral', '🏦'); else cost += t; }
    }
    if (S.flags.private_school && student && S.edu.level === 'highschool' && !parentsAlive) cost += 30e6;
    // tiền nhiều thì tiêu nhiều: nhà giàu không sống bằng 40 triệu/năm. Chi tiêu kéo theo khối tiền mặt
    // (nhà cửa, xe, người giúp việc, ăn uống, du lịch, quà cáp, “phí” quan hệ); con nhà giàu quen tay tiêu mạnh hơn
    let wealthCost = 0;
    const liquid = Math.max(0, S.money);
    if (liquid > 6e8 && !(student && parentsAlive && pa < 22)) {
      const rate = ({ tietkiem: 0.006, binhthuong: 0.016, thoaimai: 0.032, sangchanh: 0.065 }[ls.id] || 0.016) * (S.flags.richkid && !S.flags.richkid_broke ? 1.6 : 1);
      wealthCost = Math.round((liquid - 6e8) * rate / 1e6) * 1e6;
      cost += wealthCost;
    }
    cost = Math.round(cost / 1e5) * 1e5;
    const net = income - tax - cost - bizLoss;
    addMoney(net, deltas);
    if (income > 0) L('Thu nhập năm nay ' + fmtMoney(income) + (tax ? ' (thuế ' + fmtMoney(tax) + ')' : '') + ', chi tiêu ' + fmtMoney(cost) + ' — mức sống ' + ls.label.toLowerCase() + '.', net >= 0 ? 'neutral' : 'bad', '💰');
    else if (wealthCost > 0) L('Không đi làm nhưng tiêu xài theo kiểu nhà giàu: ' + fmtMoney(cost) + ' bay khỏi tài khoản năm nay — mức sống ' + ls.label.toLowerCase() + '.', 'bad', '💸');
    if (S.money < -20e6) { addStat('happy', -4, deltas); if (Math.random() < 0.5) L('Nợ nần chồng chất, đêm nào bạn cũng trằn trọc.', 'bad', '💸'); }
  }
  function peopleYear(L, deltas, relDeltas) {
    const pa = P().age;
    let funeral = false;
    S.people.forEach((x) => {
      if (!x.alive) return;
      const drift = { mother: pa < 12 ? U.rand(0, 2) : -U.rand(0, 2.5), father: pa < 12 ? U.rand(0, 2) : -U.rand(0, 2.5), grandparent: -U.rand(0, 2), sibling: -U.rand(0, 3), friend: -U.rand(1, 5), partner: -U.rand(1, 4), spouse: -U.rand(0, 3), child: -U.rand(0, 2), grandchild: -U.rand(0, 1.5), pet: -U.rand(0, 1), ex: -U.rand(0, 3), lover: -U.rand(2, 6) }[x.role] || 0;
      x.relation = r100(x.relation + drift);
      // deaths
      let q = x.kind === 'human' ? (x.age < 30 ? 0.0004 : mort(x.age)) : petDeathRate(x);
      // sống chung một nhà: bố mẹ chung do máy chủ phòng quyết định, người khác nhận tin qua mạng
      if (S.fam && (x.role === 'mother' || x.role === 'father')) { if (!S.fam.host && x.age < 96) q = 0; } // chủ phòng rời trận thì bố mẹ vẫn “đến tuổi” mà đi
      if (x.online) q = 0; // anh chị em là người chơi thật
      if (Math.random() < q) {
        x.alive = false; x.deathYear = S.year;
        if (S.fam && S.fam.host && (x.role === 'mother' || x.role === 'father')) emit('famParentDied', x.role);
        if (x.kind !== 'human') { L('Bé ' + x.firstName + ' đã rời xa bạn, sau ' + x.age + ' năm làm bạn. Bạn chôn bé dưới gốc cây sau nhà.', 'bad', '🐾'); addStat('happy', -8, deltas); return; }
        L(cap(kin(x)) + ' ' + x.firstName + ' qua đời ở tuổi ' + x.age + '.', 'bad', '🕯️');
        addStat('happy', -(closeness[x.role] || 5) * (0.5 + x.relation / 200), deltas);
        if (!funeral && ['mother', 'father', 'grandparent', 'spouse', 'sibling', 'child'].includes(x.role)) { funeral = true; queueMilestone('ms_funeral', { deceased: x }); }
        // bố mẹ đều đã mất → đọc di chúc, chia tài sản (có thể sinh tranh chấp)
        if ((x.role === 'mother' || x.role === 'father') && !has('mother') && !has('father') && P().age >= 18 && !S.flags.dichuc && !S.flags.richkid) { S.flags.dichuc = S.year; S.flags.estate = parentEstate(); queueMilestone('ms_dichuc', { deceased: x }); }
        return;
      }
      if (x.role === 'partner' && x.relation >= 68 && P().age >= 20 && x.age >= 20 && !has('spouse') && !S.pending.some((e) => e.id === 'ms_bi_cauhon') && (!S.flags.cauhonAsked || S.year - S.flags.cauhonAsked >= 2) && Math.random() < (x.gender === 'm' ? 0.28 : 0.14)) { S.flags.cauhonAsked = S.year; S.flags.cauhonBy = x.id; queueMilestone('ms_bi_cauhon', { partner: x }); }
      if (x.role === 'partner' && x.relation < 22 && Math.random() < 0.35) { x.role = 'ex'; L(x.firstName + ' nói lời chia tay. Bạn khóc cả đêm.', 'bad', '💔'); addStat('happy', -8, deltas); }
      if (x.role === 'spouse' && x.relation < 12 && Math.random() < 0.2) { x.role = 'ex'; x.wasSpouse = true; L('Bạn và ' + x.firstName + ' ra tòa ly hôn.', 'bad', '📄'); if (S.money > 0) addMoney(-S.money * 0.4, deltas); unlock('divorce'); addStat('happy', -12, deltas); }
      if (x.role === 'friend' && x.relation < 10) { x.alive = false; x.gone = true; L('Bạn và ' + x.firstName + ' dần mất liên lạc.', 'neutral', '🍂'); }
      // người tình bí mật: tốn tiền, bào mòn hôn nhân, càng lâu càng dễ lộ
      if (x.role === 'lover') {
        if (!has('spouse') && !has('partner')) { x.role = 'partner'; L('Không còn phải lén lút nữa: ' + x.firstName + ' chính thức thành người yêu của bạn.', 'neutral', '💞'); }
        else if (!has('spouse')) {
          // đang yêu mà còn “bắt cá hai tay”
          const pt = alive('partner')[0]; pt.relation = r100(pt.relation - U.rand(3, 8)); S.flags.loverHeat = (S.flags.loverHeat || 0) + 1;
          if (Math.random() < 0.18 + S.flags.loverHeat * 0.08) { pt.role = 'ex'; x.role = 'partner'; S.flags.loverHeat = 0; addStat('happy', -8, deltas); addStat('karma', -4, deltas); L(pt.firstName + ' phát hiện bạn “bắt cá hai tay” với ' + x.firstName + ', chia tay trong nước mắt và kể cho cả nhóm bạn. Giờ ' + x.firstName + ' thành người yêu chính thức của bạn.', 'bad', '💔'); }
          else L('Bạn vẫn lén lút qua lại với ' + x.firstName + ' sau lưng ' + pt.firstName + '.', 'neutral', '🤫');
        }
        else if (x.relation < 25 && Math.random() < 0.4) { x.role = 'ex'; L(x.firstName + ' chán cảnh làm “người trong bóng tối”, lặng lẽ rời đi.', 'bad', '💔'); addStat('happy', -4, deltas); }
        else {
          const cost = Math.round(Math.max(12e6, Math.min(Math.max(0, S.money) * 0.04, 300e6)) / 1e6) * 1e6;
          addMoney(-cost, deltas); alive('spouse').forEach((s) => (s.relation = r100(s.relation - U.rand(2, 6))));
          L('Một năm “hai nhà”: quà cáp, nhà nghỉ, những lần nói dối về muộn vì ' + x.firstName + ' tốn ' + fmtMoney(cost) + '.', 'neutral', '🤫');
          S.flags.loverHeat = (S.flags.loverHeat || 0) + 1;
          if (!S.forced.some((f) => f.id === 's_lover_lo') && Math.random() < 0.12 + S.flags.loverHeat * 0.07) S.forced.push({ id: 's_lover_lo', at: S.year + 1 });
        }
      }
      if (x.role === 'pet') petYear(x);
      if (x.role === 'child') {
        childYear(x, L, deltas);
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
  // ---- rủi ro đời sống: xác suất mỗi năm dựa trên số liệu Việt Nam (data.js → HAZARDS) ------------------
  const HAZ_EVENTS = new Set(); D.HAZARDS.forEach((h) => [].concat(h.events || [], h.young || []).forEach((id) => HAZ_EVENTS.add(id)));
  // sống có đức thì may mắn hơn chút xíu: tối đa ±5% cơ hội thành công, ±10% rủi ro — không đủ để lạm dụng
  const karmaLuck = () => U.clamp((S.karma - 50) / 1000, -0.05, 0.05);
  function hazardRate(h) { return hazardBase(h) * dif('haz'); }
  function hazardBase(h) {
    const pa = P().age, has2 = (t) => S.assets.some((a) => a.type === t);
    if (pa < h.age[0] || pa > h.age[1]) return 0;
    const big = S.city === 'hanoi' || S.city === 'hcm', rural = S.city !== 'hanoi' && S.city !== 'hcm' && S.city !== 'danang';
    switch (h.id) {
      case 'traffic': return h.p * (pa < 25 ? 1.8 : pa > 65 ? 1.3 : 1) * (has2('motorbike') ? 1.3 : has2('car') ? 0.8 : pa >= 18 ? 0.6 : 0.4) * (S.flags.s_accident_bo_ruou ? 0.8 : 1);
      case 'snatch': return h.p * (big ? 1.8 : 0.8) * (has2('phone') ? 1.2 : 0.6);
      case 'bike': return has2('motorbike') ? h.p * (big ? 1.5 : 0.8) : 0;
      case 'burglary': return h.p * (S.assets.some((a) => a.type === 'house' || a.type === 'luxury') ? 1.5 : 1);
      case 'scam': return h.p * (pa >= 55 ? 1.6 : pa < 30 ? 1.3 : 1) * (S.stats.smarts > 75 ? 0.6 : 1);
      case 'drown': return h.p * (rural ? 2 : 0.6) * (S.flags.s_accident_biet_boi ? 0.3 : 1);
      case 'fire': return h.p * (big ? 1.3 : 1);
      case 'dog': return h.p * (rural ? 1.6 : 0.8);
      case 'stroke': return Math.max(pa >= 25 && (S.overwork || 0) >= 3 ? 0.004 * S.overwork : 0, (pa < 40 ? 0.0003 : pa < 60 ? 0.002 : pa < 75 ? 0.007 : 0.014) * (1 + (S.overwork || 0) * 0.6)) * (S.illnesses.some((i) => i.id === 'huyetap' && !i.hidden) ? (neglectOf(S.illnesses.find((i) => i.id === 'huyetap')) >= 1 ? 4 : 2) : 1) * (S.flags.perk_khoe ? 0.7 : 1);
      case 'cancer': return pa >= 30 ? 0.0006 * Math.exp((pa - 30) / 16) : 0.0002;
      default: return h.p || 0;
    }
  }
  function hazardYear(L, deltas) {
    const pa = P().age;
    // đột quỵ: xử lý trực tiếp (bệnh + nguy cơ tử vong), không qua tình huống
    const st = D.HAZARDS.find((h) => h.id === 'stroke');
    if ((S.overwork || 0) >= 3 && pa >= 25 && Math.random() < 0.5) L('Sau những tháng tăng ca liên miên, bạn hay đau đầu, tê tay, có lúc chóng mặt phải bám vào bàn. Bác sĩ cảnh báo: làm việc quá sức kéo dài làm tăng mạnh nguy cơ đột quỵ.', 'bad', '⚠️');
    if (Math.random() < hazardRate(st) && !S.illnesses.some((i) => i.id === 'dotquy')) {
      S.counters.hazards = (S.counters.hazards || 0) + 1;
      if (Math.random() < 0.3) { die((S.overwork || 0) >= 3 ? 'Đột quỵ do làm việc quá sức' : 'Đột quỵ'); return; }
      addIllnessDef(D.ILLNESSES.find((i) => i.id === 'dotquy')); addStat('health', -15, deltas); addStat('happy', -10, deltas);
      L((S.overwork || 0) >= 3 ? 'Bạn gục xuống bàn làm việc lúc nửa đêm — đột quỵ vì làm việc quá sức. Đồng nghiệp gọi cấp cứu kịp, bạn giữ được mạng sống nhưng để lại di chứng.' : 'Bạn bị đột quỵ giữa đêm. Được đưa vào viện kịp thời nên giữ được mạng sống, nhưng để lại di chứng.', 'bad', '🧠'); S.overwork = 0;
    }
    // các rủi ro khác: tối đa một tình huống mỗi năm, thứ tự ngẫu nhiên
    for (const h of U.shuffle(D.HAZARDS.filter((x) => x.events))) {
      if (Math.random() >= hazardRate(h) * (1 - karmaLuck() * 2)) continue;
      const pool = (pa <= 19 && h.young ? h.young.concat(h.events) : h.events).map(evDef).filter((d) => d && pa >= d.age[0] && pa <= d.age[1] && !(S.usedEvents[d.id] != null && d.once !== false) && (!d.req || checkReq(d.req)));
      const d = U.pick(pool); if (!d) continue;
      const inst = instantiate(d); if (!inst) continue;
      S.pending.push(inst); S.usedEvents[d.id] = S.year; S.counters.hazards = (S.counters.hazards || 0) + 1;
      return;
    }
  }
  function riskReport() {
    if (!S || !S.player) return [];
    return D.HAZARDS.map((h) => ({ id: h.id, icon: h.icon, label: h.label, src: h.src, pct: Math.round(hazardRate(h) * 10000) / 100 }));
  }  function illnessYear(L) {
    const pa = P().age, khoe = S.flags.perk_khoe ? 0.65 : 1;
    // 1) bệnh bỏ mặc chuyển nặng; ung thư tiến triển nếu năm qua không điều trị
    S.illnesses.slice().forEach((i) => {
      if (!S.illnesses.includes(i)) return;
      const n = neglectOf(i);
      if (i.cancer) {
        if (i.care >= S.year - 1 && !i.hidden) return; // đang điều trị → khối u được khống chế
        if (i.stage < 4 && Math.random() < (i.hidden ? 0.33 : 0.3 + 0.12 * n) * khoe) {
          i.stage++; syncCancer(i);
          if (!i.hidden) L('Vì không điều trị, ' + i.name.toLowerCase() + ' đã chuyển sang giai đoạn ' + i.stage + (i.stage >= 4 ? ' — giai đoạn cuối, không thể chữa khỏi.' : '.'), 'bad', '🎗️');
        }
        if (i.hidden && i.stage >= 3) { i.hidden = false; i.care = S.year - 1; S.flags.cancerFound = S.year; L('Bạn sụt cân nhanh, đau âm ỉ mãi không hết. Đi khám mới biết mình bị ' + illLabel(i).toLowerCase() + '. Giá như phát hiện sớm hơn…', 'bad', '🎗️'); }
        return;
      }
      if (i.hidden) return;
      const def = D.ILLNESSES.find((d) => d.id === i.id);
      const rules = ((def && def.esc) || []).filter((e) => n >= e.after);
      for (const e of rules) {
        const p = Math.min(0.6, e.p * (1 + 0.5 * (n - e.after)) * (i.selfMed === S.year - 1 ? 0.5 : 1) * khoe);
        if (Math.random() >= p) continue;
        const target = e.to.startsWith('c_') ? addCancer({ id: e.to, hidden: Math.random() < 0.55, stage: 1 }) : addIllnessDef(D.ILLNESSES.find((d) => d.id === e.to));
        if (!target) break;
        if (!i.chronic) S.illnesses = S.illnesses.filter((x) => x !== i); // bệnh cấp tính “biến” thành bệnh mới
        if (!target.hidden) L('Vì ' + n + ' năm bỏ mặc không chữa, ' + i.name.toLowerCase() + ' đã biến chứng thành ' + illLabel(target).toLowerCase() + (target.incurable ? ' — bệnh không thể chữa khỏi.' : '.'), 'bad', '⚠️');
        break;
      }
    });
    // 2) bệnh nhẹ tự khỏi (khó hơn khi đã để lâu)
    S.illnesses = S.illnesses.filter((i) => {
      if (i.chronic || i.serious || i.cancer || i.hidden) return true;
      if (Math.random() < (i.id === 'sotxh' ? 0.7 : 0.42) - Math.min(0.25, neglectOf(i) * 0.08)) { L('Bạn đã khỏi ' + i.name.toLowerCase() + '.', 'good', '💊'); return false; }
      return true;
    });
    // 3) nhiều bệnh để lâu → nguy cơ ung thư âm thầm
    const longNeglect = visibleIlls().reduce((s, i) => s + Math.max(0, neglectOf(i) - 2), 0);
    const pC = (pa >= 30 ? 0.0006 * Math.exp((pa - 30) / 16) : 0.0002) + longNeglect * 0.025 + (S.illnesses.some((i) => i.id === 'xogan' || i.id === 'viemganb') ? 0.01 : 0);
    if (Math.random() < pC * khoe * dif('ill')) addCancer({ hidden: true, stage: 1 });
    // 4) mắc bệnh mới
    const pCatch = (0.05 + (pa > 50 ? 0.06 : 0) + (S.stats.health < 40 ? 0.08 : 0) - (pa < 3 ? 0.02 : 0)) * (S.flags.perk_khoe ? 0.6 : 1) * dif('ill');
    if (Math.random() < pCatch) {
      const w = { cam: 6, sotxh: 1, daday: pa > 15 ? 2 : 0, gaixuong: 1.5, huyetap: 2, tieuduong: 1.5, tim: 0.8, chanthuong: 0.5, viemganb: 0.6 };
      const list = D.ILLNESSES.filter((i) => w[i.id] && (!i.minAge || pa >= i.minAge) && !S.illnesses.some((x) => x.id === i.id));
      const pick = U.weighted(list, (i) => w[i.id]);
      if (pick) { addIllnessDef(pick); L('Bạn mắc ' + pick.name.toLowerCase() + '. Nhớ đi khám — bệnh để lâu sẽ chuyển nặng.', 'bad', '🤒'); }
    }
    // 5) bệnh đã để ≥ 1 năm không chữa → tình huống triệu chứng (mỗi năm tối đa một lần)
    // mỗi bệnh nhắc tối đa 2 năm một lần, để người chơi không bị làm phiền liên tục
    const nag = visibleIlls().filter((i) => neglectOf(i) >= 1 && (!i.nag || S.year - i.nag >= 2)).sort((a, b) => neglectOf(b) - neglectOf(a) || illDrain(b) - illDrain(a))[0];
    if (nag && !S.dead) { nag.nag = S.year; S.symIll = nag.id; queueMilestone(nag.incurable ? 'ms_sym_incurable' : 'ms_symptom'); }
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
  // ---- minigame: điểm 0..1 người chơi vừa đạt thay cho tung xúc xắc
  // ngưỡng cần đạt tùy độ khó: việc dễ (p cao) cần ít điểm, việc khó (p thấp) cần nhiều điểm
  let MINI = null;
  const miniNeed = (p) => U.clamp(1.05 - p, 0.3, 0.85);
  function miniWin(p) { return MINI != null ? MINI >= miniNeed(p) : Math.random() < p; }
  function choose(uid, index, extra) {
    MINI = extra && typeof extra.mini === 'number' ? U.clamp(extra.mini, 0, 1) : null;
    try { return chooseInner(uid, index); } finally { MINI = null; }
  }
  // xác suất thành công của một lựa chọn (để giao diện biết minigame cần đạt bao nhiêu điểm)
  function choiceOdds(uid, index) {
    const inst = S && S.pending.find((e) => e.uid === uid); const def = inst && evDef(inst.id); if (!def) return null;
    const choices = def.choiceByKey && inst.dynKeys ? inst.dynKeys.map(def.choiceByKey) : choicesOf(def);
    const c = choices[index]; if (!c) return null;
    let p = null;
    if (c.odds) { try { p = U.clamp(c.odds(), 0.05, 0.95); } catch (e) { p = null; } }
    else if (c.success) p = U.clamp((c.success.base ?? 0.5) + (c.success.scale ?? 0.5) * statVal(c.success.stat) / 100 + (S.flags.perk_quynhan ? 0.07 : 0) + karmaLuck(), 0.05, 0.95);
    else if (inst.id === 'ms_ys_tryout' && S.ys && index === 0) p = ysOdds();
    else if (inst.id === 'ms_grade10') p = U.clamp(dif('exam') + 0.28 + (S.stats.smarts - 50) / 85 + (S.edu.perf - 50) / 130, 0.07, 0.88);
    else if (/^ms_(uni|retake|uni_late)$/.test(inst.id) && D.MAJORS[c.key]) p = uniChance(D.MAJORS[c.key]);
    // lựa chọn theo xác suất (không dựa chỉ số): kết cục đầu tiên là kết cục “thắng”
    else if (!c.fn && c.outcomes && c.outcomes.length >= 2) p = outcomeP0(c);
    return p == null ? null : { p, need: miniNeed(p), stat: c.success ? c.success.stat : null, label: c.label, key: c.key, mini: c.mini || null, foe: c.foe || null, weighted: !c.success };
  }
  function outcomeP0(c) { const tot = c.outcomes.reduce((s, o) => s + (o.p ?? 1), 0) || 1; return U.clamp((c.outcomes[0].p ?? 1) / tot, 0.05, 0.95); }
  function chooseInner(uid, index) {
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
        if (c.success && c.outcomes.length >= 2) { const pr = U.clamp((c.success.base ?? 0.5) + (c.success.scale ?? 0.5) * statVal(c.success.stat) / 100 + (S.flags.perk_quynhan ? 0.07 : 0) + karmaLuck(), 0.05, 0.95); out = miniWin(pr) ? c.outcomes[0] : c.outcomes[1]; }
        else if (MINI != null && c.outcomes.length >= 2) out = miniWin(outcomeP0(c)) ? c.outcomes[0] : U.weighted(c.outcomes.slice(1), (o) => o.p ?? 1);
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
    if (!S.dead && S.stats.health <= 0) die(wasteCause(P().age));
    checkProgress();
    if (S.dead) scene = deathScene();
    changed();
    return result({ title: inst.title, icon: inst.icon, text, tone, deltas, relDeltas, scene, event: next, live: !!def.live });
  }
  // ------------------------------------------------------------------ activities
  function payCost(cost) {
    if (!cost) return { ok: true, by: null };
    if (isKid() && parentsBack() && cost <= 3e6) return { ok: true, by: 'parents' };
    if (S.money >= cost) { S.money -= cost; return { ok: true, by: 'self' }; }
    return { ok: false };
  }
  function actDef(id) { return D.ACTIVITIES.find((a) => a.id === id); }
  function actAvail(a) {
    const pa = P().age;
    if (S.dead) return 'Cuộc đời đã khép lại';
    if (S.jail && !['tapthe', 'docsach', 'thien', 'read', 'meditate'].includes(a.id)) return 'Đang ngồi tù';
    if (pa < a.minAge) return 'Từ ' + a.minAge + ' tuổi';
    if (a.maxAge && pa > a.maxAge) return 'Không còn hợp tuổi';
    if ((S.yearActs[a.id] || 0) >= (a.limit || 3)) return 'Đã làm đủ trong năm nay';
    if (a.id === 'dating' && (has('partner') || has('spouse')) && has('lover')) return 'Bạn đang có người tình rồi';
    if (a.id === 'adopt' && alive('pet').length >= 2) return 'Đủ thú cưng rồi';
    if (a.id === 'stocks' && S.money < 10e6) return 'Cần ít nhất 10 triệu';
    if (a.id === 'doctor' && pa < 18 && !has('mother') && !has('father') && S.money < a.cost) return 'Không đủ tiền';
    if (a.id === 'xaynha' && !S.assets.some((x) => x.type === 'land' || (x.type === 'house' && !x.rented))) return 'Cần có mảnh đất hoặc căn nhà của mình';
    if (a.id === 'grab' && !S.assets.some((x) => x.type === 'motorbike' || x.type === 'car')) return 'Cần có xe máy hoặc ô tô';
    if (a.id === 'sharktank' && !S.company) return 'Cần có công ty riêng';
    if (a.id === 'sharktank' && S.flags.sharkYear && S.year - S.flags.sharkYear < 3) return 'Chương trình chỉ nhận lại sau 3 năm';
    if (a.id === 'xkld' && (S.xk || S.abroad)) return 'Bạn đang ở nước ngoài';
    if (a.id === 'xkld' && S.flags.xkBan && S.year - S.flags.xkBan < 5) return 'Đang bị cấm nhập cảnh (5 năm)';
    if (a.id === 'dinhcu' && S.abroad && S.abroad.settled) return 'Bạn đã định cư rồi';
    if (a.id === 'dinhcu' && !settleRoute()) return 'Cần ≥ 3 tỷ (diện đầu tư) hoặc tiếng Anh ≥ 70 + bằng đại học (diện tay nghề)';
    if (a.id === 'trieuphu' && S.flags.tpYear && S.year - S.flags.tpYear < 3) return 'Ban tổ chức chỉ cho thi lại sau 3 năm';
    if (a.id === 'thihat' && S.flags.sgYear && S.year - S.flags.sgYear < 2) return 'Mỗi mùa thi cách nhau 2 năm';
    if (a.needEnglish && (S.english || 0) < a.needEnglish) return 'Cần tiếng Anh ≥ ' + a.needEnglish;
    if (a.needDegree && !hasDegree()) return 'Cần bằng đại học';
    if (a.needAsset && !S.assets.some((x) => !x.rented && (x.type === a.needAsset || x.itemId === a.needAsset))) return 'Cần có ' + ({ car: 'ô tô', motorbike: 'xe máy', house: 'nhà riêng (không cho thuê)', yacht1: 'du thuyền' }[a.needAsset] || 'tài sản phù hợp');
    const cost = a.cost || 0;
    if (cost && !(isKid() && parentsBack() && cost <= 3e6) && S.money < cost) return 'Cần ' + fmtMoney(cost);
    return null;
  }
  function activities() {
    if (!S) return [];
    return D.ACTIVITIES.filter((a) => P().age >= a.minAge - 2 && (!a.maxAge || P().age <= a.maxAge)).map((a) => {
      const reason = actAvail(a);
      return { id: a.id, input: a.input || false, label: a.label, icon: a.icon, category: a.cat, categoryLabel: D.ACT_CATS[a.cat], desc: a.desc || '', costText: a.cost ? (isKid() && a.cost <= 3e6 && parentsBack() ? 'Bố mẹ trả' : fmtMoney(a.cost)) : 'Miễn phí', available: !reason, reason };
    });
  }
  // ---- sở thích → thiên hướng nghề nghiệp ------------------------------------------------
  // bộ phân tích tiếng Việt chạy ngay trong trình duyệt: bỏ dấu, tách từ, so khớp cụm từ khóa theo từng nhóm sở thích
  const fold = (s) => ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  function hitCount(text, kws) { let n = 0; const hits = []; kws.forEach((k) => { if (text.includes(' ' + k + ' ')) { n += k.includes(' ') ? 2 : 1; hits.push(k); } }); return { n, hits }; }
  function analyzeInterest(raw) {
    const t = fold(raw), scores = {}, hits = {};
    Object.keys(D.INTERESTS).forEach((k) => { const r = hitCount(t, D.INTERESTS[k].kw); if (r.n) { scores[k] = r.n; hits[k] = r.hits; } });
    let sport = null, best = 0;
    Object.keys(D.SPORT_KW).forEach((k) => { const r = hitCount(t, D.SPORT_KW[k]); if (r.n > best) { best = r.n; sport = k; } });
    if (!sport && hitCount(t, D.INTERESTS.game.kw).n) sport = 'esports';
    let trade = null; best = 0;
    D.VOC_TRADES.forEach((v) => { const r = hitCount(t, v.kw); if (r.n > best) { best = r.n; trade = v.id; } });
    const top = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    return { scores, hits, top, sport, trade };
  }
  function addInterest(cat, v, extra) {
    if (!S.interests) S.interests = {};
    S.interests[cat] = Math.round(((S.interests[cat] || 0) + v) * 10) / 10;
    if (extra && extra.sport) { S.sportPick = S.sportPick || {}; S.sportPick[extra.sport] = (S.sportPick[extra.sport] || 0) + 1; }
    if (extra && extra.trade) { S.tradePick = S.tradePick || {}; S.tradePick[extra.trade] = (S.tradePick[extra.trade] || 0) + 1; }
  }
  function interestProfile() {
    const it = S.interests || {}, tot = Object.values(it).reduce((a, b) => a + b, 0);
    // mức độ tuyệt đối (0–100), chỉ tăng — chơi môn khác không làm môn này tụt
    void tot;
    return Object.keys(it).filter((k) => it[k] > 0).sort((a, b) => it[b] - it[a]).map((k) => ({ id: k, label: D.INTERESTS[k].label, icon: D.INTERESTS[k].icon, pct: Math.min(100, Math.round(it[k] * 6)) }));
  }
  const topPick = (m) => { const k = Object.keys(m || {}).sort((a, b) => m[b] - m[a])[0]; return k || null; };
  function careerFit(id) {
    const pr = interestProfile().slice(0, 2);
    return pr.some((x) => D.INTERESTS[x.id].careers.includes(id) && x.pct >= 18);
  }
  // các hoạt động thường ngày cũng nuôi sở thích (trẻ dưới 18 tuổi)
  const ACT_INTEREST = { gym: 'the', run: 'the', playfriends: 'the', read: 'tuduy', english: 'xahoi', chess: 'tuduy', game: 'game', karaoke: 'nghethuat', garden: 'khampha', beach: 'khampha', cook: 'tayngh', pagoda: 'xahoi', cartoon: 'nghethuat', spa: 'nghethuat', adopt: 'khampha', sidejob: 'tayngh' };
  const PLAY_TEXTS = {
    the: ['Bạn chạy nhảy khắp sân đến ướt đẫm mồ hôi, về nhà ăn hết ba bát cơm.', 'Cả buổi chiều bạn tập luyện không biết mệt. Người lớn bảo: “Đứa này có chân thể thao.”'],
    nghethuat: ['Bạn mải mê đến quên cả giờ ăn, xong khoe với cả nhà “tác phẩm” của mình.', 'Bạn biểu diễn cho cả xóm xem, ai cũng vỗ tay rần rần.'],
    khampha: ['Bạn lang thang khám phá đến tận chiều, túi áo đầy “kho báu” nhặt được.', 'Bạn hỏi bố mẹ cả trăm câu “tại sao” về những thứ vừa nhìn thấy.'],
    tuduy: ['Bạn ngồi im cả tiếng đồng hồ để giải cho bằng được. Khi làm xong, bạn reo lên sung sướng.', 'Bạn hỏi thầy cô thêm bài khó hơn. Đầu óc cứ như được mở thêm một cánh cửa.'],
    tayngh: ['Bạn tháo tung mọi thứ ra rồi lắp lại, lần này… thừa đúng một con ốc.', 'Đôi tay bạn khéo léo lạ thường. Người lớn trầm trồ: “Sau này sống bằng nghề được đấy!”'],
    xahoi: ['Bạn kéo cả đám bạn vào chơi chung, ai cũng nghe bạn phân vai.', 'Bạn chăm lo cho mấy đứa nhỏ như người lớn thật sự.'],
    game: ['Bạn chơi đến khi mẹ gọi lần thứ năm mới chịu tắt máy.', 'Bạn leo hạng một mạch, còn tự quay lại video những pha “xử lý” đẹp nhất.'],
  };
  function doPlay(arg, deltas) {
    const raw = String((arg && arg.text) || '').slice(0, 160).trim();
    const pick = arg && arg.pick && D.INTERESTS[arg.pick] ? arg.pick : null;
    const an = analyzeInterest(raw);
    let cats = an.top.slice(0, 2);
    if (pick && !cats.includes(pick)) cats.unshift(pick);
    let guessed = false;
    if (!cats.length) { cats = [U.pick(Object.keys(D.INTERESTS))]; guessed = true; }
    cats.forEach((c, i) => addInterest(c, i === 0 ? 3 : 1.5, i === 0 ? { sport: an.sport || (c === 'the' && pick ? null : null), trade: an.trade } : null));
    const main = D.INTERESTS[cats[0]];
    rollEff(main.stat, 1, deltas); rollEff({ happy: [2, 4] }, 1, deltas);
    S.counters.play = (S.counters.play || 0) + 1;
    const said = raw ? '“' + raw.slice(0, 60) + (raw.length > 60 ? '…' : '') + '” — ' : '';
    const words = an.hits[cats[0]] ? an.hits[cats[0]].slice(0, 3).join(', ') : null;
    const text = said + U.pick(PLAY_TEXTS[cats[0]]) +
      ' 🤖 Trợ lý hướng nghiệp ghi nhận: ' + (guessed ? 'chưa rõ sở thích, tạm đoán là ' : 'sở thích nghiêng về ') + main.icon + ' ' + main.label.toLowerCase() + (words && !guessed ? ' (từ khóa: ' + words + ')' : '') + (cats[1] ? ', có cả ' + D.INTERESTS[cats[1]].label.toLowerCase() : '') + '.';
    const friend = alive('friend')[0] || alive('sibling')[0];
    const scene = actScene({ loc: main.loc, anim: main.anim, fx: 'sparkle', npcs: [{ role: 'kid', anim: main.anim === 'type' ? 'laugh' : main.anim }] }, friend ? { people: [{ p: friend, anim: 'laugh' }] } : null);
    return { text, scene, title: 'Đi chơi: ' + main.icon + ' ' + main.label };
  }
  // định hướng nghề lúc 14 tuổi: tư vấn dựa trên hồ sơ sở thích
  function huongNghiepDef() {
    const SPORT_ICON = { cauthu: '⚽', bongro: '🏀', caulong: '🏸', boi: '🏊', dienkinh: '🏃', bongchuyen: '🏐', vdv_vo: '🥋' };
    // môn thể thao để chọn: môn bạn hay chơi nhất trước, rồi thêm vài môn khác (tối đa 4)
    const sportOptions = () => { const all = ['cauthu', 'bongro', 'caulong', 'boi', 'dienkinh', 'bongchuyen', 'vdv_vo'].filter((c) => D.CAREERS[c]); const fav = Object.keys(S.sportPick || {}).filter((c) => all.includes(c)).sort((a, b) => S.sportPick[b] - S.sportPick[a]); return fav.concat(all.filter((c) => !fav.includes(c))).slice(0, 4); };
    const routeChoice = (key) => {
      // 'the:caulong' = hướng thể thao, môn cầu lông (mỗi môn một lựa chọn riêng)
      const [cat, sp] = String(key).split(':');
      const I = D.INTERESTS[cat];
      let label = I.icon + ' ' + I.route, hint = 'Hợp với: ' + I.careers.slice(0, 3).map((c) => D.CAREERS[c].title.toLowerCase()).join(', ');
      const sport = cat === 'the' ? (sp && D.CAREERS[sp] ? sp : topPick(S.sportPick) || 'cauthu') : null;
      const trade = cat === 'tayngh' ? D.VOC_TRADES.find((v) => v.id === (topPick(S.tradePick) || 'dien')) : null;
      if (sport) { label = (SPORT_ICON[sport] || I.icon) + ' ' + I.route + ': ' + D.CAREERS[sport].title.toLowerCase(); hint = 'Lộ trình năng khiếu → chuyên nghiệp → đội tuyển quốc gia môn ' + D.CAREERS[sport].title.toLowerCase(); }
      if (trade) { label = I.icon + ' Vào trường nghề ' + trade.name.toLowerCase() + ' sau lớp 9'; hint = '2 năm, ra trường làm ' + D.CAREERS[trade.career].title.toLowerCase() + ' · không cần thi đại học'; }
      return { key: cat, label, hint, fn: () => {
        S.flags.route = cat; S.flags['route_' + cat] = S.year;
        if (sport) S.flags['talent_' + sport] = S.year;
        if (cat === 'game') S.flags.talent_esports = S.year;
        if (trade) S.flags.voc_plan = trade.id;
        const fx = { the: { health: 4 }, nghethuat: { looks: 3, happy: 3 }, khampha: { happy: 4, health: 2 }, tuduy: { smarts: 5 }, tayngh: { smarts: 2, happy: 3 }, xahoi: { karma: 4, happy: 2 }, game: { smarts: 2, happy: 3 } }[cat];
        if (cat === 'tuduy') S.edu.perf = r100(S.edu.perf + 8);
        return { text: 'Bạn chọn hướng đi: ' + I.route.toLowerCase() + '. ' + (trade ? 'Học hết lớp 9, bạn sẽ vào trường nghề ' + trade.name.toLowerCase() + '.' : sport ? 'Huấn luyện viên đồng ý nhận bạn vào đội năng khiếu.' : 'Thầy cô ghi tên bạn vào danh sách, bố mẹ gật đầu ủng hộ.'), effects: fx, scene: { loc: I.loc, anim: 'cheer', fx: 'sparkle' }, tone: 'milestone' };
      } };
    };
    return { id: 'ms_huongnghiep', title: 'Buổi tư vấn hướng nghiệp', icon: '🧭', age: [12, 16], many: true,
      text: 'Cuối năm lớp 8, trường mời chuyên gia về tư vấn hướng nghiệp. Cô xem lại những trò bạn thích chơi từ nhỏ rồi nói: “Mỗi người có một thế mạnh riêng. Em muốn đi theo hướng nào?”',
      scene: { loc: 'school', anim: 'think', npcs: [{ role: 'teacher', gender: 'f', anim: 'talk', say: 'Em thích nhất điều gì?' }, { role: 'mother', anim: 'idle' }] },
      choicesFn: () => { const ks = []; interestProfile().slice(0, 3).forEach((x) => { if (x.id === 'the') sportOptions().forEach((sp) => ks.push('the:' + sp)); else ks.push(x.id); }); return ks.concat(['none']).map(byKey); },
      choiceByKey: (k) => byKey(k) };
    function byKey(k) {
      if (k !== 'none') return Object.assign(routeChoice(k), { key: k });
      return { key: 'none', label: '📚 Học đều các môn, để sau hẵng tính', hint: 'Giữ nguyên lộ trình THPT → đại học', fn: () => ({ text: 'Bạn quyết định học đều, chưa vội chọn. Còn nhiều thời gian để hiểu mình.', effects: { smarts: 1 }, scene: { anim: 'nod' } }) };
    }
  }
  MS.ms_huongnghiep = Object.assign(huongNghiepDef(), { internal: true, once: false });
  function rollEff(eff, k, deltas) { Object.keys(eff || {}).forEach((s) => { const [a, b] = eff[s]; addStat(s, U.rand(a, b) * k, deltas); }); }
  function actScene(base, extra) {
    const ctx = bind({ id: '_act_' + Math.random(), scene: base }) || new Ctx();
    const sc = resolveScene(Object.assign({}, base), ctx);
    if (extra && extra.people) { extra.people.forEach((x) => { if (sc.npcs.length < 4) sc.npcs.push(npcOf(x.p, { anim: x.anim, say: x.say }, sc.loc)); }); if (sc.npcs.length) sc.shot = 'close'; }
    return sc;
  }
  function doActivity(id, arg) {
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
    if (P().age < 18 && ACT_INTEREST[id]) addInterest(ACT_INTEREST[id], 0.5);
    switch (a.special) {
      case 'play': {
        const r = doPlay(arg, deltas); text = r.text; scene = r.scene; title = r.title;
        break;
      }
      case 'doctor': {
        const sick = visibleIlls();
        if (!sick.length) {
          rollEff({ health: [1, 3] }, 1, deltas); text = 'Bác sĩ khám qua và gật gù: "Khỏe re! Cứ giữ lối sống này nhé."';
          const h = S.illnesses.find((i) => i.hidden);
          if (h && Math.random() < 0.25) { h.hidden = false; h.care = S.year; text = 'Bác sĩ thấy chỉ số lạ, cho làm thêm xét nghiệm. Kết quả: ' + illLabel(h).toLowerCase() + '. May mà phát hiện được — hãy điều trị ngay.'; if (h.stage <= 2) unlock('early_catch'); tone = 'bad'; }
        } else {
          // khám và kê đơn cho mọi bệnh đang mắc, điều trị chính bệnh nặng nhất
          const i = worstIll(sick);
          sick.forEach((x) => { if (x !== i) { x.care = S.year; if (!isKid()) addMoney(-Math.min(x.cost || 0, 2e6), deltas); } });
          text = treatIllness(i, deltas).text;
          if (sick.length > 1) text += ' Các bệnh khác cũng được kê đơn theo dõi.';
        }
        scene = actScene({ loc: 'hospital', anim: 'sit', npcs: [{ role: 'doctor', anim: 'talk', say: sick.length ? 'Bệnh này phải điều trị đến nơi đến chốn.' : 'Há miệng ra nào… "aaa"!' }] });
        break;
      }
      case 'baohiem': { queueMilestone('ms_baohiem'); text = 'Bạn hẹn gặp một nhân viên tư vấn bảo hiểm ở quán cà phê.'; scene = actScene({ loc: 'cafe', anim: 'talk' }); break; }
      case 'xaynha': { queueMilestone('ms_xaynha'); text = 'Bạn mời thầy phong thủy và kiến trúc sư đến xem đất, bàn chuyện làm nhà.'; scene = actScene({ loc: 'home', anim: 'think', fx: 'idea' }); break; }
      case 'grab': { queueMilestone('ms_grab'); text = 'Bạn đăng ký làm tài xế công nghệ, nhận áo đồng phục và mũ bảo hiểm có logo.'; scene = actScene({ loc: 'street', anim: 'drive' }); break; }
      case 'cauca': { queueMilestone('ms_cauca'); text = 'Bạn soạn đồ nghề câu cá, mua thêm hộp mồi ngoài chợ.'; scene = actScene({ loc: 'park', anim: 'walk', time: 'dawn' }); break; }
      case 'sharktank': { S.flags.sharkYear = S.year; queueMilestone('ms_shark'); text = 'Hồ sơ của ' + S.company.name + ' lọt vào vòng ghi hình Shark Tank! Bạn thức trắng mấy đêm tập thuyết trình.'; scene = actScene({ loc: 'office', anim: 'type', fx: 'idea' }); break; }
      case 'xkld': {
        queueMilestone('ms_xkld');
        text = 'Bạn tìm đến một công ty xuất khẩu lao động có tiếng trong huyện. Nhân viên tư vấn mời nước, trải ra đủ loại hợp đồng.';
        scene = actScene({ loc: 'office', anim: 'talk', fx: 'question' });
        break;
      }
      case 'dinhcu': {
        const route = settleRoute(), country = U.pick(SETTLE);
        const ok = route === 'invest' ? Math.random() < 0.8 : Math.random() < 0.35 + (S.stats.smarts - 50) / 120 + (S.flags.master ? 0.15 : 0);
        if (route === 'invest') addMoney(-2e9, deltas);
        if (ok) {
          S.abroad = { country, since: S.year, settled: true }; S.flags.settled = S.year; unlock('abroad');
          rollEff({ happy: [3, 8] }, 1, deltas);
          text = (route === 'invest' ? 'Hồ sơ đầu tư 2 tỷ của bạn được duyệt. ' : 'Hồ sơ định cư diện tay nghề được chấp thuận. ') + 'Bạn cùng gia đình chuyển sang ' + country + ' sinh sống. Lương cao hơn, không khí trong lành hơn, nhưng mùa đông đầu tiên bạn nhớ tiếng rao "bánh mì đây" đến nao lòng.';
          scene = actScene({ loc: 'airport', anim: 'wave', fx: 'sparkle' }); tone = 'milestone';
        } else {
          text = route === 'invest' ? 'Hồ sơ bị từ chối vì không chứng minh rõ nguồn tiền. Bạn chỉ lấy lại được một phần, mất 2 tỷ phí luật sư, phí dịch vụ và tiền đặt cọc dự án.' : 'Hồ sơ định cư bị từ chối: điểm tay nghề chưa đủ. Bạn có thể nộp lại năm sau.';
          scene = actScene({ loc: 'office', anim: 'facepalm' }); tone = 'bad';
        }
        break;
      }
      case 'trieuphu': {
        S.flags.tpYear = S.year;
        const ok = S.stats.smarts >= 45 || Math.random() < 0.5;
        if (ok) { queueMilestone('ms_trieuphu'); text = 'Bạn vượt qua vòng sơ tuyển (trả lời nhanh 10 câu trong 1 phút). Ban tổ chức hẹn tuần sau lên trường quay ghi hình!'; tone = 'good'; }
        else { text = 'Vòng sơ tuyển: 10 câu trong 1 phút, bạn đúng có 4. Ban tổ chức cảm ơn và hẹn gặp lại sau 3 năm.'; tone = 'bad'; }
        scene = actScene({ loc: 'studio', anim: ok ? 'cheer' : 'facepalm', fx: ok ? 'sparkle' : null });
        break;
      }
      case 'thihat': {
        S.flags.sgYear = S.year;
        queueMilestone('ms_hat_0');
        text = 'Bạn nộp clip dự tuyển "Giọng Ca Vàng" và được gọi đi casting. Vòng giấu mặt sắp bắt đầu, tim đập thình thịch.';
        tone = 'good'; scene = actScene({ loc: 'studio', time: 'night', anim: 'sing', fx: 'music' });
        break;
      }
      case 'ielts': {
        const g = U.rand(7, 13) * (0.6 + S.stats.smarts / 100); S.english = r100((S.english || 0) + g); deltas.english = Math.round(g); rollEff({ smarts: [1, 3], happy: [-2, 0] }, 1, deltas);
        const band = S.english >= 85 ? '8.0' : S.english >= 70 ? '7.0' : S.english >= 60 ? '6.0' : S.english >= 50 ? '5.5' : S.english >= 40 ? '4.5' : '3.5';
        if (S.english >= 60) S.flags.ielts = S.year;
        text = 'Ba tháng luyện đề đến khàn giọng. Bạn thi thử được IELTS ' + band + (S.english >= 60 ? ' — đủ điều kiện du học, làm việc ở nước ngoài!' : '. Còn phải cố thêm.');
        scene = actScene({ loc: 'school', anim: 'study', fx: S.english >= 60 ? 'levelup' : 'idea', npcs: [{ role: 'teacher', anim: 'talk', say: 'Speaking part 2, please!' }] });
        break;
      }
      case 'masters': {
        if (S.flags.master) { S.yearActs[id]--; return fail('Bạn đã có bằng thạc sĩ rồi'); }
        const sch = S.stats.smarts >= 80 && Math.random() < 0.6, cost = sch ? 0 : 900e6;
        if (!sch && S.money < cost) { S.yearActs[id]--; return fail('Cần 900 triệu, hoặc trí tuệ ≥ 80 để xin học bổng'); }
        addMoney(-cost, deltas); S.flags.master = S.year; S.edu.degrees.push('Thạc sĩ (nước ngoài)'); S.english = r100((S.english || 0) + 12);
        const quitNote = S.job ? ' Bạn đã nghỉ việc ' + D.CAREERS[S.job.id].title.toLowerCase() + ' để lên đường du học.' : '';
        if (S.job) S.job = null;
        rollEff({ smarts: [5, 9], happy: [3, 6] }, 1, deltas); unlock('abroad');
        text = (sch ? 'Bạn giành học bổng toàn phần! ' : 'Bạn dốc 900 triệu tiền dành dụm. ') + 'Hai năm thạc sĩ ở ' + U.pick(ABROAD) + ': thư viện đến nửa đêm, làm thêm cuối tuần, bạn bè khắp thế giới. Bằng thạc sĩ nước ngoài giúp xin việc dễ hơn, lương cao hơn.';
        text += quitNote;
        scene = actScene({ loc: 'university', anim: 'cheer', fx: 'confetti' });
        break;
      }
      case 'checkup': {
        // tầm soát: phát hiện ung thư âm thầm khi còn sớm
        S.counters.checkups = (S.counters.checkups || 0) + 1;
        const found = S.illnesses.filter((i) => i.hidden && Math.random() < (i.stage >= 2 ? 0.9 : 0.75));
        const warn = visibleIlls().filter((i) => neglectOf(i) >= 1);
        if (found.length) {
          found.forEach((i) => { i.hidden = false; i.care = S.year; });
          const early = found.some((i) => i.stage <= 2); if (early) unlock('early_catch');
          rollEff({ happy: [-6, -3] }, 1, deltas); tone = 'bad';
          text = 'Kết quả tầm soát: phát hiện ' + found.map((i) => illLabel(i).toLowerCase()).join(', ') + '. ' + (early ? 'Bác sĩ trấn an: phát hiện sớm thế này, khả năng chữa khỏi rất cao nếu điều trị ngay.' : 'Bác sĩ nói khó, nhưng vẫn còn hy vọng nếu điều trị ngay.');
        } else {
          rollEff({ health: [1, 3], happy: [1, 3] }, 1, deltas);
          text = 'Xét nghiệm máu, siêu âm, chụp X-quang… mọi chỉ số đều ổn. Bác sĩ dặn mỗi năm khám một lần cho chắc.' + (warn.length ? ' Riêng ' + warn.map((i) => i.name.toLowerCase()).join(', ') + ' thì phải điều trị ngay, để lâu sẽ biến chứng.' : '');
        }
        scene = actScene({ loc: 'hospital', anim: found.length ? 'sad' : 'nod', fx: found.length ? 'exclaim' : 'sparkle', npcs: [{ role: 'doctor', anim: 'talk', say: found.length ? 'Phát hiện sớm là còn hy vọng.' : 'Các chỉ số đều đẹp!' }] });
        break;
      }
      case 'family': {
        rollEff(a.eff, 1, deltas);
        const fam = alive().filter((x) => ['spouse', 'partner', 'child', 'mother', 'father', 'grandchild', 'grandparent'].includes(x.role));
        fam.forEach((x) => addRel(x, U.randi(3, 7), relDeltas));
        text = U.pick(a.texts || ['Cả nhà có một ngày thật vui.']) + (fam.length ? '' : ' Đi một mình cũng vui, nhưng giá có ai đi cùng thì hơn.');
        scene = actScene(a.scene, { people: fam.slice(0, 3).map((p) => ({ p, anim: 'cheer' })) });
        break;
      }
      case 'housewarm': {
        const house = S.assets.find((x) => x.type === 'house' && !x.rented);
        if (house && house.warmed) { S.yearActs[id]--; return fail('Ngôi nhà này đã làm tân gia rồi'); }
        if (house) house.warmed = S.year;
        rollEff(a.eff, 1, deltas); rollEff({ karma: [1, 3] }, 1, deltas);
        alive().filter((x) => ['friend', 'spouse', 'partner', 'mother', 'father', 'sibling'].includes(x.role)).forEach((x) => addRel(x, U.randi(4, 8), relDeltas));
        const gift = U.randi(5, 25) * 1e6; addMoney(gift, deltas);
        text = 'Tiệc tân gia ' + (house ? house.name.toLowerCase() : 'nhà mới') + ' đông vui, bạn bè họ hàng đến chật nhà, phong bì mừng nhà mới được ' + fmtMoney(gift) + '. Ai về cũng khen nhà đẹp.';
        scene = actScene(a.scene, { people: alive('friend').concat(alive('spouse'), alive('mother')).slice(0, 3).map((p) => ({ p, anim: 'clap' })) });
        break;
      }
      case 'travel': {
        // tự chọn điểm đến (trong nước / nước ngoài) → chuyến đi có sự kiện riêng mỗi nơi
        if (S.money < D.TRAVEL[0].cost) { S.yearActs[id]--; return fail('Cần ít nhất ' + fmtMoney(D.TRAVEL[0].cost) + ' để đi du lịch'); }
        queueMilestone('ms_travel');
        text = 'Bạn mở app đặt vé, lướt qua hàng chục điểm đến. Năm nay đi đâu đây?';
        scene = actScene({ loc: 'airport', anim: 'phone' });
        break;
      }
      case 'dating': {
        const p = U.clamp(0.25 + (S.stats.looks - 50) / 90 + (S.stats.happy - 50) / 200 + Math.min(0.15, prestige() * 0.012) + (KN.Weekly && KN.Weekly.bonus('love') ? 0.1 : 0), 0.08, 0.88);
        const base = { loc: 'cafe', time: 'dusk', anim: 'talk', npcs: [{ role: 'stranger', gender: loveGender(), age: U.clamp(P().age + U.randi(-4, 3), 18, 99), anim: 'talk' }] };
        const ctx = bind({ id: '_date', scene: base });
        if (Math.random() < p) {
          const main = alive('spouse')[0] || alive('partner')[0];
          const np = addPersonFrom({ role: main ? 'lover' : 'partner', fromScene: 'stranger' }, ctx);
          rollEff({ happy: [6, 10] }, 1, deltas);
          text = 'Bạn gặp ' + np.firstName + ' qua ứng dụng hẹn hò. Buổi cà phê đầu tiên kéo dài đến tận khuya. Hai người quyết định tìm hiểu nhau!';
          if (main) { addStat('karma', -6, deltas); S.flags.loverHeat = S.flags.loverHeat || 0; text = 'Bạn lén cài app hẹn hò, giấu kỹ trong thư mục ẩn. ' + np.firstName + ' nhắn tin rất hợp, buổi cà phê đầu tiên kéo dài đến nửa đêm. Từ nay, ' + np.firstName + ' là người tình bí mật của bạn — còn ' + main.firstName + ' vẫn chưa biết gì. 🤫'; if (Math.random() < 0.12) { addRel(main, -20, []); S.flags.loverHeat += 2; text += ' Nhưng điện thoại bạn rung lên lúc nửa đêm, và ' + main.firstName + ' đã kịp nhìn thấy tên người gửi…'; } }
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
        const gig = arg && D.PARTTIME.find((x) => x.id === arg.gig);
        if (gig) {
          const why = partTimeWhy(gig); if (why) { S.yearActs[id]--; return fail(why); }
          const tired = S.job ? 0.7 : 1; // đã có việc chính thì làm thêm được ít hơn, mệt hơn
          const earn = Math.round(U.rand(gig.pay[0], gig.pay[1]) * 1e6 * tired / 1e4) * 1e4;
          addMoney(earn, deltas); rollEff(gig.eff, 1, deltas); if (S.job) addStat('health', -1, deltas);
          if (gig.english) { S.english = r100((S.english || 0) + U.rand(gig.english[0], gig.english[1])); }
          text = gig.text + (earn >= 0 ? ' Kiếm được ' + fmtMoney(earn) + '.' : ' Lỗ ' + fmtMoney(-earn) + ' tiền hàng.');
          if (gig.risk && Math.random() < gig.risk) { addIllness('Chấn thương cơ'); addStat('health', -5, deltas); text += ' Một hôm trời mưa, bạn bị ngã xe, trầy xước phải nghỉ mấy tuần.'; }
          S.counters.parttime = (S.counters.parttime || 0) + 1;
          title = gig.icon + ' ' + gig.name;
          scene = actScene({ loc: gig.loc, anim: gig.anim, fx: earn > 0 ? 'money' : 'sweat' });
          break;
        }
        const earn = Math.round((P().age < 18 ? U.rand(0.8, 2.5) : U.rand(1.5, 5)) * 1e6 / 1e4) * 1e4;
        addMoney(earn, deltas); rollEff(a.eff, 1, deltas);
        text = U.pick(['Bạn chạy giao hàng cả cuối tuần, kiếm được ' + fmtMoney(earn) + '.', 'Bạn phụ quán bún bò, lưng mỏi nhừ nhưng túi rủng rỉnh ' + fmtMoney(earn) + '.', 'Bạn nhận dạy kèm, kiếm thêm ' + fmtMoney(earn) + '.']);
        scene = actScene({ loc: 'street', anim: P().age >= 16 ? 'drive' : 'idle', fx: 'money' });
        break;
      }
      case 'stocks': {
        // mua vào danh mục cổ phiếu (giữ lâu dài, lên xuống theo chu kỳ thị trường; bán ở mục Tài sản)
        const amt = Math.round(S.money * 0.25), mk = market(), ph = MARKET[mk.phase];
        let pf = S.assets.find((a) => a.type === 'stock');
        if (!pf) { pf = { id: U.uid('a'), itemId: null, type: 'stock', name: 'Danh mục cổ phiếu', value: 0, icon: '📈', bought: S.year }; S.assets.push(pf); }
        addMoney(-amt, deltas); pf.value += Math.round(amt * 0.997); // phí giao dịch 0,3%
        rollEff({ happy: [1, 3] }, 1, deltas);
        text = 'Bạn mua thêm ' + fmtMoney(amt) + ' cổ phiếu, danh mục giờ trị giá ' + fmtMoney(pf.value) + '. Thị trường đang ' + ph.icon + ' ' + ph.label.toLowerCase() + '.' +
          (mk.phase === 'sot' ? ' Ai cũng lãi, nhưng coi chừng mua đúng đỉnh!' : mk.phase === 'vo' ? ' Giá đang rẻ, gan thì “bắt đáy”.' : mk.phase === 'suy' ? ' Thị trường ảm đạm, cần kiên nhẫn.' : '') + ' Muốn chốt lời thì bán ở mục Tài sản.';
        scene = actScene({ loc: 'office', anim: 'type', fx: 'money' });
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
        if (KN.Weekly) { KN.Weekly.track('charity'); if (KN.Weekly.bonus('kind')) addStat('karma', 6, deltas); }
        text = U.pick(['Bạn quyên góp ' + fmtMoney(amt) + ' cho đồng bào vùng lũ miền Trung.', 'Bạn nấu cơm từ thiện cho bệnh nhân nghèo, tặng kèm ' + fmtMoney(amt) + '.', 'Bạn ủng hộ ' + fmtMoney(amt) + ' xây trường cho trẻ em vùng cao.']);
        scene = actScene({ loc: 'street', anim: 'bow', fx: 'hearts', npcs: [{ role: 'crowd', anim: 'clap' }] });
        break;
      }
      case 'adopt': {
        const pet = addPersonFrom({ role: 'pet', kind: U.pick(['dog', 'cat']) }); pet.species = pet.kind === 'dog' ? 'chota' : 'muop'; pet.skill = 0;
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
        if (a.id === 'english') { const g = U.rand(2, 5) * (0.5 + S.stats.smarts / 100) * (k < 1 ? 0.6 : 1); S.english = r100((S.english || 0) + g); deltas.english = Math.round(g); text += ' (Tiếng Anh: ' + englishLabel(S.english) + ')'; }
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
      else if (id === 'propose' && p.relation < 45) reason = 'Cần thân thiết ≥ 45% (hiện ' + Math.round(p.relation) + '%) — hẹn hò, tặng quà thêm';
      else if (id === 'propose' && has('spouse')) reason = 'Bạn đang có vợ/chồng';
      else if (id === 'leave' && !has('spouse')) reason = 'Bạn đang độc thân';
      else if (id === 'walk' && p.kind !== 'dog') reason = 'Bé không đi dạo được';
      else if (id === 'train' && pa < 6) reason = 'Từ 6 tuổi';
      else if (id === 'baby') { const f = P().gender === 'f' ? P() : p; if (f.age > 46) reason = 'Đã qua tuổi sinh con'; else if (alive('child').filter((c) => c.age === 0).length) reason = 'Bé út còn quá nhỏ'; }
      else if ((id === 'date' || id === 'love') && pa < 14) reason = 'Còn quá nhỏ';
      else if (id === 'flirt') { if (pa < 18) reason = 'Từ 18 tuổi'; else if (p.age < 18) reason = 'Người này chưa đủ 18 tuổi'; else if (!loveGenders().includes(p.gender)) reason = 'Không hợp xu hướng tình cảm của bạn'; else if (has('lover')) reason = 'Bạn đang có một người tình rồi'; else if (S.jail) reason = 'Đang ở tù'; }
      return { id, label: meta2.label, icon: meta2.icon, disabled: !!reason, reason };
    });
  }
  // ---- quà tặng
  function giftTags(p) {
    if (p.kind && p.kind !== 'human') return ['pet'];
    const t = [p.age < 13 ? 'kid' : p.age < 20 ? 'teen' : p.age >= 55 ? 'elder' : 'adult'];
    if (p.role === 'partner' || p.role === 'spouse' || p.role === 'lover') t.push('love');
    return t;
  }
  function giftLiked(g, p) {
    const tags = giftTags(p);
    if (g.fem && p.gender !== 'f') return false;
    if (!g.likes.some((l) => tags.includes(l))) return false;
    // mỗi người một gu: chỉ khoảng 40% món hợp lứa tuổi là món họ thật sự mê
    let h = 7; const k = p.id + '|' + g.id;
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
    return h % 100 < 40;
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
  const proposeChance = (p) => U.clamp(0.25 + p.relation / 110 + (S.stats.looks - 50) / 400, 0.1, 0.95);
  const miniOr = (extra, p) => (extra && typeof extra.mini === 'number' ? extra.mini >= miniNeed(p) : Math.random() < p);
  // minigame cho tương tác: hiện chỉ có cầu hôn
  function interactOdds(personId, action) {
    if (!S || action !== 'propose') return null;
    const p = byId(personId); if (!p) return null;
    const a = actionsFor(p).find((x) => x.id === action); if (!a || a.disabled) return null;
    const pr = proposeChance(p); return { p: pr, need: miniNeed(pr), name: p.firstName, gender: p.gender, relation: p.relation };
  }
  function interact(personId, action, arg, extra) {
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
        if (p.role === 'lover') {
          addRel(p, U.randi(6, 12), relDeltas); addStat('happy', U.rand(3, 7), deltas); addStat('karma', -2, deltas);
          S.flags.loverHeat = (S.flags.loverHeat || 0) + 1;
          text = U.pick(['Bạn báo nhà “đi tiếp khách”, rồi lái xe ra ngoại thành gặp ' + name + '. Điện thoại để chế độ im lặng suốt buổi.', 'Hai người hẹn ở quán cà phê kín đáo cuối hẻm, ngồi góc khuất nhất. Mỗi lần cửa mở, bạn lại giật mình.', name + ' rủ đi Đà Lạt hai ngày. Bạn nói dối là đi công tác. Vui thì vui, nhưng tim cứ thắt lại mỗi khi điện thoại rung.']);
          scene = S1(U.pick(['cafe', 'beach', 'park']), 'love', 'love', { fx: 'hearts', time: 'night', say: 'Bao giờ anh/em mới thuộc về em/anh?' });
          if (Math.random() < 0.08 + (S.flags.loverHeat || 0) * 0.02 && !S.forced.some((f) => f.id === 's_lover_lo')) { S.forced.push({ id: 's_lover_lo', at: S.year + 1 }); text += ' Bạn không để ý một người quen của ' + (alive('spouse')[0] ? kin(alive('spouse')[0]) : 'gia đình') + ' vừa đi ngang qua…'; }
          break;
        }
        const loc = U.pick(['cafe', 'park', 'beach']);
        addRel(p, U.randi(5, 12), relDeltas); addStat('happy', U.rand(4, 8), deltas);
        text = { cafe: 'Hẹn hò ở quán cà phê nhỏ, nắm tay nhau dưới ánh đèn vàng.', park: 'Hai người dạo quanh hồ lúc hoàng hôn, kể nhau nghe những ước mơ.', beach: 'Một buổi tối ngắm biển, gió mát và tiếng sóng rì rào.' }[loc];
        scene = S1(loc, 'love', 'love', { fx: 'hearts', time: 'dusk', say: sayL.replace('anh/em', P().gender === 'm' ? 'anh' : 'em') }); break;
      }
      case 'love':
        addRel(p, U.randi(6, 10), relDeltas); addStat('happy', U.rand(4, 6), deltas);
        text = 'Một buổi tối bình yên bên nhau. ' + name + ' tựa đầu vào vai bạn.'; scene = S1(famLoc, 'hug', 'hug', { fx: 'hearts', time: 'night' }); break;
      case 'propose': {
        const ok = miniOr(extra, proposeChance(p));
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
      case 'flirt': {
        // tán tỉnh bạn bè / người yêu cũ: độc thân → người yêu; đang có đôi → người tình bí mật (ngoại tình)
        const main = alive('spouse')[0] || alive('partner')[0], mk = main ? kin(main) + ' ' + main.firstName : '';
        const pr = U.clamp(0.18 + (p.relation - 50) / 110 + (S.stats.looks - 50) / 160 + (p.role === 'ex' ? 0.1 : 0), 0.06, 0.75);
        if (Math.random() < pr) {
          addStat('happy', 6, deltas); addRel(p, 12, relDeltas);
          if (main) {
            p.role = 'lover'; p.loverSince = S.year; S.flags.loverHeat = S.flags.loverHeat || 0; addStat('karma', -6, deltas);
            text = 'Những tin nhắn “chúc ngủ ngon” ngày một dài hơn. Rồi một tối, ' + name + ' không về nhà ngay sau buổi cà phê… Từ hôm đó, hai người thành một bí mật. Bạn vẫn về nhà ăn cơm với ' + mk + ' như chưa có gì xảy ra.';
            scene = S1('cafe', 'love', 'love', { fx: 'hearts', time: 'night', say: 'Đừng để ai biết nhé…' }); tone = 'neutral';
            if (Math.random() < 0.1) { addRel(main, -18, relDeltas); S.flags.loverHeat += 2; text += ' Nhưng tối đó ' + mk + ' thấy tin nhắn hiện trên màn hình khoá, hỏi “Ai đấy?”. Bạn chối là bạn cũ, nhưng ánh mắt ấy không còn tin bạn nữa.'; tone = 'bad'; }
          } else {
            p.role = 'partner';
            text = 'Bạn rủ ' + name + ' đi ăn tối, ánh mắt nói nhiều hơn lời. Cuối buổi, ' + name + ' nắm tay bạn: “Mình thử yêu nhau nhé?” Từ bạn thành người yêu!';
            scene = S1('cafe', 'love', 'love', { fx: 'hearts', time: 'dusk', say: 'Mình thử nhé?' }); tone = 'good';
          }
        } else {
          addStat('happy', -4, deltas); addRel(p, -12, relDeltas);
          text = name + ' bật cười ngượng: “Thôi, mình coi nhau là bạn thôi.” Không khí bỗng gượng gạo hẳn.';
          scene = S1('cafe', 'facepalm', 'shake', { time: 'dusk' }); tone = 'bad';
          if (main && Math.random() < 0.25) { addRel(main, -15, relDeltas); text += ' Tệ hơn, ' + name + ' kể chuyện này với người quen, và tin đồn đến tai ' + mk + '.'; }
        }
        break;
      }
      case 'leave': {
        const sp = alive('spouse')[0];
        if (sp) { sp.role = 'ex'; sp.wasSpouse = true; addRel(sp, -30, relDeltas); }
        if (S.money > 0) addMoney(-S.money * 0.4, deltas);
        p.role = 'partner'; addRel(p, 10, relDeltas); S.flags.loverHeat = 0; unlock('divorce');
        alive('child').forEach((c) => addRel(c, -U.randi(15, 30), relDeltas));
        addStat('happy', -4, deltas); addStat('karma', -10, deltas);
        text = 'Bạn xếp vali, để lại lá đơn ly hôn trên bàn rồi dọn sang sống với ' + name + '. Tài sản chia đôi, ' + (alive('child').length ? 'các con không nghe máy, ' : '') + 'họ hàng bàn tán khắp nơi. Giờ thì không còn phải lén lút nữa.';
        scene = S1('street', 'walk', 'love', { fx: 'heartbreak', time: 'night' }); tone = 'bad'; break;
      }
      case 'breakup':
        if (p.role === 'lover') {
          p.role = 'ex'; S.flags.loverHeat = 0; addStat('happy', -U.rand(2, 6), deltas); addStat('karma', 3, deltas);
          alive('spouse').forEach((s) => addRel(s, 2, relDeltas));
          text = 'Bạn hẹn ' + name + ' ra nói lời cuối: “Mình dừng lại thôi.” Về nhà, bạn ngồi ăn cơm với gia đình, thấy nhẹ lòng mà cũng trống trải.';
          scene = S1('cafe', 'sad', 'cry', { fx: 'tears', time: 'dusk' }); break;
        }
        p.role = 'ex'; addStat('happy', -U.rand(5, 10), deltas); addRel(p, -20, relDeltas);
        text = 'Bạn nói lời chia tay với ' + name + '. Có những người đi cùng mình một đoạn đường thôi.'; scene = S1('cafe', 'sad', 'cry', { fx: 'heartbreak', time: 'dusk' }); break;
      case 'baby': {
        if (p.gender === P().gender) {
          // cặp đôi cùng giới: nhận con nuôi
          if (Math.random() < 0.45) { const b = makeBaby(); b.adopted = true; addMoney(-20e6, deltas); addRel(p, 8, relDeltas); text = 'Sau gần một năm làm thủ tục, hai bạn nhận nuôi bé ' + b.firstName + ' từ một trung tâm bảo trợ. Ngày đón con về, cả hai khóc như mưa.'; addLog('Nhận nuôi bé ' + b.firstName + '.', 'milestone', '👶'); scene = S1('home', 'love', 'hug', { fx: 'hearts' }); tone = 'milestone'; }
          else { addStat('happy', -3, deltas); text = 'Hồ sơ nhận con nuôi của hai bạn bị trả về vì “chưa đủ điều kiện”. Con đường làm cha mẹ của các cặp đôi cùng giới còn nhiều thủ tục.'; scene = S1(famLoc, 'sad', 'hug'); }
          break;
        }
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
        if (p.role === 'child' && p.smart != null && p.age < 22) p.smart = r100(p.smart + U.rand(1.5, 3.5) + (S.stats.smarts - 50) / 40);
        text = 'Bạn kèm ' + kin(p) + ' ' + name + ' học bài. Bài toán khó cuối cùng cũng được giải.' + (p.role === 'child' && p.smart != null ? ' (Học lực của con: ' + Math.round(p.smart) + ')' : ''); scene = S1('bedroom', 'talk', 'study', { fx: 'idea' }); break;
      case 'train': {
        const sp = petSpecies(p), gain = U.randi(8, 16);
        p.skill = U.clamp((p.skill || 0) + gain, 0, 100); addRel(p, U.randi(3, 7), relDeltas); addStat('happy', U.rand(1, 3), deltas);
        const tricks = { dog: ['ngồi', 'bắt tay', 'nằm xuống', 'nhặt bóng', 'đứng hai chân', 'giả chết'], cat: ['đập tay', 'đi vệ sinh đúng chỗ', 'nhảy qua vòng', 'đến khi gọi tên'], bird: ['nói “xin chào”', 'hát bài “Happy Birthday”', 'gọi tên chủ', 'huýt sáo'], rabbit: ['nhảy qua rào', 'đến khi gọi'], hamster: ['chạy mê cung'], turtle: ['bò tới khi gọi'], fish: ['ăn trên tay'] }[sp.kind] || ['nghe lời'];
        const tr = U.pick(tricks);
        text = 'Bạn kiên nhẫn dạy bé ' + name + ' “' + tr + '”. ' + (p.skill >= 70 ? 'Giờ bé làm được cả chục trò, đủ sức đi thi!' : 'Bé học được rồi! (kỹ năng ' + p.skill + '/100)');
        scene = S1('park', 'point', sp.kind === 'dog' || sp.kind === 'cat' ? 'jump' : 'idle', { fx: 'stars' }); break;
      }
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
    if (S.jail) return 'Đang ngồi tù';
    if (c.since && S.year < c.since) return 'Nghề này chưa xuất hiện (từ khoảng năm ' + c.since + ')';
    if (c.until && S.year > c.until) return 'Nghề này đã không còn';
    if (S.army && S.army.until) return 'Đang thực hiện nghĩa vụ quân sự';
    if (c.maxStart && pa > c.maxStart) return 'Quá tuổi bắt đầu nghề này';
    if (S.edu.inSchool && !['phucvu', 'shipper', 'streamer'].includes(c.id) && !(c.sport && S.flags['talent_' + c.id])) return 'Đang đi học';
    if (q.major && !(S.edu.major && q.major.includes(S.edu.major) && hasDegree())) return 'Cần bằng ' + q.major.map((m) => D.MAJORS[m].name).join(' / ');
    if (q.degree && !hasDegree()) return 'Cần bằng đại học';
    if (q.hs && !S.edu.degrees.includes('THPT')) return 'Cần bằng THPT';
    if (q.asset && !S.assets.some((a) => a.type === q.asset)) return 'Cần có xe máy';
    if (q.minMoney && S.money < q.minMoney) return (c.fee ? 'Cần ' + fmtMoney(q.minMoney) + ' phí đào tạo' : 'Cần vốn ' + fmtMoney(q.minMoney));
    if (q.flag && !S.flags[q.flag]) return q.flag === 'ex_athlete' ? 'Chỉ dành cho vận động viên đã giải nghệ' : 'Chưa đủ điều kiện';
    if (q.minStat) { const k = Object.keys(q.minStat).find((s) => S.stats[s] < q.minStat[s]); if (k) return 'Cần ' + ({ looks: 'ngoại hình', health: 'sức khỏe', smarts: 'trí tuệ' }[k] || k) + ' ≥ ' + q.minStat[k]; }
    if (S.job && S.job.id === c.id) return 'Bạn đang làm nghề này';
    return null;
  }
  function jobListings() {
    if (!S || P().age < 14) return [];
    return Object.values(D.CAREERS).filter((c) => (c.id !== 'giangho' || S.flags.gh_invite) && !(c.since && S.year < c.since - 15)).map((c) => {
      const reason = jobEligible(c);
      return Object.assign({ id: c.id, title: c.title, icon: c.icon, salaryText: payLabel(c, 0), reqText: reqTextOf(c), eligible: !reason, reason, talent: !!S.flags['talent_' + c.id] }, careerInfo(c));
    }).sort((a, b) => (b.eligible ? 1 : 0) - (a.eligible ? 1 : 0) || (b.talent ? 1 : 0) - (a.talent ? 1 : 0));
  }
  // mô tả, lộ trình thăng tiến và những biến cố có thể gặp — để người chơi biết mình đang chọn gì
  function payLabel(c, lv, base) {
    const b = base != null ? base : c.levels[lv].salary;
    if (!c.prize) return D.fmtShort(b) + '/tháng';
    const [mn, mx] = c.prize[Math.min(lv, c.prize.length - 1)];
    return (b ? (c.id === 'cauthu' || c.id === 'esports' ? 'Lương CLB ' : 'Trợ cấp ') + D.fmtShort(b) + '/tháng' : (c.selfFund ? 'Tự túc' : 'Bao ăn ở, không lương')) + ' + thưởng ' + (mn ? D.fmtShort(mn * 1e6) + '–' : 'tới ') + D.fmtShort(mx * 1e6) + '/năm';
  }
  function careerInfo(c) {
    const path = c.levels.map((l, i) => l.title + ' (' + (c.prize ? (l.salary ? 'trợ cấp ' + D.fmtShort(l.salary) : 'tự túc') + ', thưởng ' + (c.prize[i][0] ? D.fmtShort(c.prize[i][0] * 1e6) + '–' : 'tới ') + D.fmtShort(c.prize[i][1] * 1e6) + '/năm' : D.fmtShort(l.salary)) + ')').join(' → ');
    const notes = [];
    if (c.retireAt) notes.push('Giải nghệ khoảng ' + c.retireAt + ' tuổi');
    if (c.injury) notes.push('Dễ chấn thương');
    if (c.fee) notes.push('Phí đào tạo ' + fmtMoney(c.fee));
    if (c.fame) notes.push('Có thể nổi tiếng');
    if (c.prize) notes.push('Không có lương cố định: sống bằng tiền thưởng giải đấu và tài trợ' + (c.selfFund ? ', giai đoạn đầu phải tự túc tiền tập' : ''));
    return { desc: c.desc || '', path, incidents: c.incidents || [], notes: notes.join(' · ') };
  }
  function reqTextOf(c) {
    const q = c.req || {}, parts = ['Từ ' + c.minAge + ' tuổi' + (c.maxStart ? ' (bắt đầu trước ' + (c.maxStart + 1) + ')' : '')];
    if (q.major) parts.push('Bằng ' + q.major.map((m) => D.MAJORS[m].name).join('/'));
    if (q.degree) parts.push('Bằng đại học');
    if (q.hs) parts.push('Bằng THPT');
    if (q.asset) parts.push('Có xe máy');
    if (q.flag === 'ex_athlete') parts.push('Từng là vận động viên');
    if (q.minMoney) parts.push((c.fee ? 'Phí ' : 'Vốn ') + fmtMoney(q.minMoney));
    if (q.minStat) Object.keys(q.minStat).forEach((k) => parts.push(({ looks: 'Ngoại hình', health: 'Sức khỏe', smarts: 'Trí tuệ' }[k]) + ' ≥ ' + q.minStat[k]));
    return parts.join(' · ');
  }
  function jobChance(id) {
    const c = D.CAREERS[id];
    const talent = S.flags['talent_' + id] ? 0.35 : 0;
    const status = c.fame || id === 'kinhdoanh' ? Math.min(0.12, prestige() * 0.01) : 0;
    const sportFit = c.sport ? (S.stats.health - 70) / 120 : 0;
    const fitBonus = (id === 'dienvien' && S.edu.major === 'dienanh' ? 0.3 : 0) + (S.flags.veteran && ['canhsat', 'cuuhoa', 'chinhtri'].includes(id) ? 0.2 : 0) + (S.flags.duhoc || S.flags.master ? 0.12 : 0) + (careerFit(id) ? 0.1 : 0) + (S.flags.route && D.INTERESTS[S.flags.route].careers.includes(id) ? 0.12 : 0) + (S.flags['voc_' + id] ? 0.4 : 0);
    const record = S.flags.tienan && id !== 'giangho' ? (S.flags.hocnghe_tu && ['congnhan', 'nongdan', 'phucvu', 'shipper'].includes(id) ? -0.05 : -0.2) : 0; // có tiền án thì khó xin việc
    return U.clamp((c.fame ? 0.25 : 0.55) + (S.stats.smarts - 50) / 150 + (S.stats.looks - 50) / (c.fame ? 120 : 300) + (S.edu.perf - 50) / 300 + talent + status + sportFit + fitBonus + record + (S.flags.phd ? 0.08 : 0) + jmHire(id), 0.08, 0.95);
  }
  // để giao diện mở minigame phỏng vấn trước khi nộp đơn
  function jobOdds(id) {
    const c = S && D.CAREERS[id]; if (!c || jobEligible(c) || (S.yearActs['apply'] || 0) >= 3) return null;
    const p = jobChance(id); return { p, need: miniNeed(p), title: c.title, sport: !!c.sport, fame: !!c.fame };
  }
  function applyJob(id, extra) {
    if (!S || S.dead) return fail('Không thể ứng tuyển.');
    const c = D.CAREERS[id]; if (!c) return fail('Nghề không tồn tại.');
    const why = jobEligible(c); if (why) return fail(why);
    if ((S.yearActs['apply'] || 0) >= 3) return fail('Bạn đã đi phỏng vấn quá nhiều trong năm nay');
    S.yearActs['apply'] = (S.yearActs['apply'] || 0) + 1;
    const deltas = {};
    const talent = S.flags['talent_' + id] ? 0.35 : 0;
    const p = jobChance(id);
    const boss = tempPerson('boss', {});
    let text, scene, tone;
    const mini = extra && typeof extra.mini === 'number' ? extra.mini : null;
    if (mini != null ? mini >= miniNeed(p) : Math.random() < p) {
      if (S.job) addLog('Bạn nghỉ việc ' + D.CAREERS[S.job.id].title.toLowerCase() + ' để chuyển nghề.', 'neutral', '🔁');
      if (c.fee) addMoney(-c.fee, deltas);
      hire(id); addStat('happy', 6, deltas); if (S.flags.duhoc || S.flags.master) S.job.mult = 1.25;
      text = 'Bạn trúng tuyển vị trí ' + c.levels[0].title + ' (' + c.title + ')! ' + (c.prize ? 'Thu nhập: ' + payLabel(c, 0) + '.' : 'Lương khởi điểm ' + D.fmtShort(c.levels[0].salary) + '/tháng.') + (c.fee ? ' Phí đào tạo ' + fmtMoney(c.fee) + ' đã được trừ.' : '') + (talent ? ' Năng khiếu từ nhỏ đã giúp bạn nổi bật.' : '') + (c.incidents && c.incidents.length ? ' Nghề này có thể gặp: ' + c.incidents.slice(0, 3).join(', ').toLowerCase() + '…' : '');
      scene = sceneFor(c.loc, { anim: 'cheer', fx: 'confetti', people: [{ p: boss, anim: 'clap', say: 'Chào mừng đến với công ty!' }] }); tone = 'good';
    } else {
      addStat('happy', -3, deltas);
      text = mini != null ? 'Buổi phỏng vấn không như ý. Nhà tuyển dụng hẹn "sẽ liên lạc lại"… rồi im luôn.' : U.pick(['Nhà tuyển dụng hẹn "sẽ liên lạc lại". Bạn đợi mãi…', 'Bạn trả lời phỏng vấn lắp bắp. Trượt rồi.', 'Họ tuyển được người khác có kinh nghiệm hơn.']);
      scene = sceneFor('office', { anim: 'sad', people: [{ p: boss, anim: 'shake', say: 'Rất tiếc…' }] }); tone = 'bad';
    }
    addLog(text, tone, c.icon); checkProgress(); changed();
    return result({ title: 'Ứng tuyển: ' + c.title, icon: c.icon, text, tone, deltas, scene });
  }
  // lời thoại theo loại nghề: VĐV không “tăng ca dự án”, ca sĩ không “xin sếp tăng lương”
  const WORK_FLAVOR = {
    cauthu: { work: 'Tập luyện cật lực', anim: 'kick', texts: ['Bạn ở lại sân tập thêm một tiếng mỗi chiều, sút phạt đến khi trời tối.', 'Cả mùa giải bạn không bỏ một buổi tập nào, HLV bắt đầu xếp bạn đá chính.', 'Bạn tập thể lực với chuyên gia riêng, chạy không biết mệt suốt 90 phút.'] },
    bongro: { work: 'Tập luyện cật lực', anim: 'dribble', texts: ['Mỗi sáng bạn ném 500 quả trước khi cả đội tới sân.', 'Bạn tập bật nhảy và phòng ngự cả mùa hè, HLV tăng thời gian thi đấu cho bạn.', 'Bạn xem lại băng hình từng trận để sửa lỗi di chuyển.'] },
    vdv_vo: { work: 'Tập luyện cật lực', anim: 'box', texts: ['Bạn đấm bao cát đến rách găng, chạy bộ 10 cây số mỗi sáng.', 'Bạn sparring với các võ sĩ hạng trên, mặt mũi bầm dập nhưng phản xạ nhanh hẳn.', 'Bạn ép cân khắc nghiệt để kịp hạng cân thi đấu.'] },
    caulong: { work: 'Tập luyện cật lực', anim: 'swing', texts: ['Bạn tập bộ chân đến chuột rút, đập cầu hàng nghìn quả mỗi ngày.', 'Bạn tập cùng tay vợt nước ngoài, học được nhiều miếng đánh mới.', 'Cả năm bạn không về quê Tết để tập trung cho giải lớn.'] },
    esports: { work: 'Cày rank xuyên đêm', anim: 'gamepad', texts: ['Bạn tập scrim với đội 12 tiếng mỗi ngày, leo lên top server.', 'Bạn nghiên cứu meta mới đến 3 giờ sáng, cả đội phục chiến thuật của bạn.', 'Bạn xem lại từng pha thua để sửa lỗi, phản xạ nhanh hơn hẳn.'] },
    boi: { work: 'Tập luyện cật lực', anim: 'swim', texts: ['Bạn bơi 10 cây số mỗi ngày, vai mỏi nhừ nhưng thành tích cải thiện rõ.', 'Bạn tập cùng chuyên gia nước ngoài, sửa từng nhịp quạt tay.', 'Cả năm bạn không bỏ buổi tập nào, kể cả Tết.'] },
    dienkinh: { work: 'Tập luyện cật lực', anim: 'run', texts: ['Bạn chạy hàng chục vòng sân mỗi chiều, đôi giày mòn vẹt.', 'Bạn tập sức bật với tạ, từng phần trăm giây được rút ngắn.', 'Bạn lên cao nguyên tập luyện sức bền ba tháng.'] },
    bongchuyen: { work: 'Tập luyện cật lực', anim: 'jump', texts: ['Bạn tập bật nhảy đến mức chân run, cú đập mạnh hẳn lên.', 'Bạn tập phối hợp với chuyền hai đến khi ăn ý như một.', 'Bạn ở lại sân tập thêm một tiếng mỗi tối.'] },
    hoasi: { work: 'Miệt mài sáng tác', anim: 'study', raise: 'Nâng giá bán tranh', texts: ['Bạn vẽ một loạt tranh mới, phòng tranh nhận treo thử.', 'Bạn đi ký họa khắp miền núi phía Bắc, về vẽ say sưa.', 'Bạn thức trắng hoàn thành bức tranh khổ lớn cho triển lãm.'] },
    nhaccong: { work: 'Chạy show, luyện đàn', anim: 'guitar', raise: 'Đòi tăng cát-xê', texts: ['Bạn chạy ba show mỗi tối, ngón tay chai sạn.', 'Bạn sáng tác một giai điệu mới, cả ban nhạc khen hay.', 'Bạn luyện đàn mỗi sáng sáu tiếng liền.'] },
    chinhtri: { work: 'Sâu sát cơ sở', anim: 'talk', raise: 'Xin bổ nhiệm chức vụ cao hơn', texts: ['Bạn xuống tận từng tổ dân phố nghe dân phản ánh, giải quyết dứt điểm vụ ngập nước kéo dài.', 'Bạn họp liên miên, ký hàng trăm văn bản, đêm về vẫn nghe điện thoại dân gọi.', 'Bạn chỉ đạo dọn rác, sửa đường, phường được khen là “văn minh đô thị”.'] },
    casi: { work: 'Chạy show, tập luyện', anim: 'sing', raise: 'Đòi tăng cát-xê', texts: ['Bạn chạy ba show một tối, giọng khàn nhưng khán giả nhớ tên bạn.', 'Bạn luyện thanh mỗi sáng và ra mắt bài hát mới.', 'Bạn tập vũ đạo đến khuya cho đêm diễn lớn.'] },
    dienvien: { work: 'Nhập vai hết mình', anim: 'talk', raise: 'Đòi tăng cát-xê', texts: ['Bạn giảm 5 cân để vào vai, đạo diễn gật gù hài lòng.', 'Bạn quay đêm liên tục ba tuần ở phim trường.', 'Bạn học thoại kỹ đến mức diễn một lần là “OK”.'] },
    nguoimau: { work: 'Giữ dáng, chạy show', anim: 'walk', raise: 'Đòi tăng cát-xê', texts: ['Bạn tập catwalk mỗi ngày và giữ chế độ ăn khắt khe.', 'Bạn chạy show liên tục ở tuần lễ thời trang.', 'Bạn chụp hình cho ba nhãn hàng trong một tuần.'] },
    streamer: { work: 'Livestream xuyên đêm', anim: 'type', raise: 'Đàm phán hợp đồng quảng cáo', texts: ['Bạn live 10 tiếng mỗi tối, người xem tăng đều.', 'Bạn làm series video mới, có clip lên xu hướng.', 'Bạn trả lời từng bình luận, cộng đồng fan gắn bó hơn.'] },
    kinhdoanh: { work: 'Dồn sức cho việc kinh doanh', anim: 'phone', raise: 'Mở rộng mối làm ăn', texts: ['Bạn tự đứng quầy, tự đi lấy hàng, doanh thu nhích lên.', 'Bạn ký được hợp đồng với đối tác lớn.', 'Bạn cắt giảm chi phí và cải tiến sản phẩm.'] },
    nongdan: { work: 'Chăm ruộng vườn', anim: 'lift', raise: 'Đàm phán giá với thương lái', texts: ['Bạn ra đồng từ tờ mờ sáng, vụ này lúa trĩu bông.', 'Bạn học kỹ thuật trồng mới trên mạng, năng suất tăng hẳn.', 'Bạn cải tạo vườn, trồng thêm giống cây bán được giá.'] },
    shipper: { work: 'Chạy thêm đơn', anim: 'drive', raise: 'Chạy giờ cao điểm ăn thưởng', texts: ['Bạn chạy từ sáng đến tối, đơn nào cũng giao đúng giờ.', 'Bạn được khách đánh giá 5 sao liên tục.', 'Bạn thuộc từng con hẻm, giao nhanh nhất khu.'] },
    taixe: { work: 'Chạy thêm cuốc', anim: 'drive', raise: 'Chạy giờ cao điểm ăn thưởng', texts: ['Bạn chạy xuyên đêm dịp lễ, cuốc nào cũng kín khách.', 'Bạn giữ xe sạch sẽ, khách khen hết lời.', 'Bạn thuộc đường như lòng bàn tay, không bao giờ lạc.'] },
  };
  const flavorOf = (id) => WORK_FLAVOR[id] || null;
  function jobActions() {
    if (!S.job) return S.retired ? [] : [];
    const used = (id) => (S.yearActs['job_' + id] || 0) > 0;
    const fl = flavorOf(S.job.id), sport = D.CAREERS[S.job.id].sport;
    const jt = (KN.JOB_TASKS || {})[S.job.id], nTask = S.yearActs.job_task || 0;
    const out = [];
    if (jt) out.push({ id: 'task', label: jt.act[1], icon: jt.act[0], hint: 'Ca làm việc cụ thể của nghề: tình huống thật, lựa chọn thật', disabled: nTask >= 2 || !!S.pending.length, reason: nTask >= 2 ? 'Đã làm 2 ca nổi bật năm nay' : S.pending.length ? 'Giải quyết tình huống đang chờ trước' : null });
    out.push(
      { id: 'workhard', label: fl ? fl.work : 'Làm việc chăm chỉ', icon: sport ? '🏋️' : '💪', disabled: used('workhard'), reason: used('workhard') ? 'Đã cố gắng năm nay' : null },
      { id: 'raise', label: sport ? 'Tìm nhà tài trợ' : fl && fl.raise ? fl.raise : 'Xin tăng lương', icon: sport ? '🤝' : '💹', disabled: used('raise'), reason: used('raise') ? 'Đã thử năm nay' : null },
      { id: 'quit', label: sport ? 'Rời đội / giải nghệ' : 'Nghỉ việc', icon: '🚪', disabled: false, reason: null });
    if (S.job.id === 'hlv' && KN.Manager) out.unshift({ id: 'mgr', label: 'Phòng HLV: đội hình, chiến thuật, chuyển nhượng, đá giải', icon: '🧠', hint: 'Quản lý đội bóng như game FC Manager', disabled: false, reason: null });
    if (P().age >= 55) out.push({ id: 'retire', label: 'Nghỉ hưu', icon: '🪴', disabled: false, reason: null });
    const c = D.CAREERS[S.job.id];
    if (!S.abroad && !c.sport && !c.fame && c.id !== 'kinhdoanh') { const why = (S.english || 0) < 55 ? 'Cần tiếng Anh ≥ 55' : !hasDegree() ? 'Cần bằng đại học' : used('abroad') ? 'Đã thử năm nay' : null; out.push({ id: 'abroad', label: 'Xin việc ở nước ngoài', icon: '🌏', disabled: !!why, reason: why }); }
    if (S.abroad) out.push({ id: 'home', label: 'Về nước', icon: '🛬', disabled: false, reason: null });
    return out;
  }
  function jobAction(id) {
    if (!S || !S.job || S.dead) return fail('Bạn chưa có việc làm.');
    const a = jobActions().find((x) => x.id === id);
    if (!a) return fail('Không thể làm điều này.');
    if (a.disabled) return fail(a.reason);
    if (id === 'mgr') { if (KN.Manager) setTimeout(() => KN.Manager.open(), 0); return { ok: true, silent: true, text: '' }; }
    if (id === 'task') {
      const ev = jobTaskEvent(); if (!ev) return fail('Hôm nay không có việc gì nổi bật.');
      S.yearActs.job_task = (S.yearActs.job_task || 0) + 1;
      S.pending.unshift(ev); changed();
      return result({ title: a.label, icon: a.icon, text: 'Bạn bắt đầu ca làm việc. Một tình huống đang chờ bạn xử lý…', tone: 'neutral', scene: sceneFor(D.CAREERS[S.job.id].loc, { anim: 'nod' }), event: ev });
    }
    S.yearActs['job_' + id] = 1;
    const c = D.CAREERS[S.job.id], deltas = {};
    const boss = tempPerson('boss', {});
    let text, scene, tone;
    if (id === 'workhard') {
      S.job.perf = r100(S.job.perf + U.randi(4, 9)); addStat('health', -1.5, deltas); addStat('happy', -1.5, deltas);
      const fl = flavorOf(c.id);
      text = U.pick(fl ? fl.texts : ['Bạn tăng ca cả tháng, dự án về đích đúng hạn.', 'Bạn đến sớm về muộn. Sếp bắt đầu để ý tới bạn.', 'Bạn đề xuất một ý tưởng hay, cả phòng vỗ tay.']) + ((S.overwork || 0) >= 2 ? (c.sport ? ' ⚠️ Đã ' + (S.overwork + 1) + ' năm liền tập quá sức — cơ thể bắt đầu quá tải, dễ chấn thương và đột quỵ.' : ' ⚠️ Đã ' + (S.overwork + 1) + ' năm liền làm việc quá sức — cơ thể bắt đầu lên tiếng, coi chừng đột quỵ.') : '');
      scene = sceneFor(c.loc, { anim: fl ? fl.anim : c.loc === 'office' ? 'type' : 'idle', fx: 'sweat' });
    } else if (id === 'raise' && c.sport) {
      // VĐV không có “sếp tăng lương”: đi tìm nhà tài trợ, phụ thuộc phong độ + ngoại hình + cấp độ
      const p = 0.1 + S.job.level * 0.12 + Math.max(0, S.job.perf - 50) / 150 + Math.max(0, S.stats.looks - 50) / 200;
      if (Math.random() < p) { const amt = pay(U.rand(20, 80) * (S.job.level + 1) * (S.job.level + 1) * 1e6 * (S.job.club ? Math.sqrt(S.job.club.mult) : 1)); addMoney(amt, deltas); addStat('happy', 5, deltas); text = 'Một thương hiệu đồ thể thao ký hợp đồng tài trợ với bạn: ' + fmtMoney(amt) + ' cho một năm.'; scene = sceneFor(c.loc, { anim: 'cheer', fx: 'money' }); tone = 'good'; }
      else { addStat('happy', -3, deltas); text = 'Người đại diện gõ cửa cả chục nhãn hàng, ai cũng bảo: “Thành tích thêm chút nữa rồi tính.”'; scene = sceneFor(c.loc, { anim: 'sad' }); tone = 'bad'; }
    } else if (id === 'raise' && flavorOf(c.id) && flavorOf(c.id).raise) {
      const fl = flavorOf(c.id);
      if (Math.random() < 0.08 + Math.max(0, S.job.perf - 50) / 110) { S.job.mult = (S.job.mult || 1) * U.rand(1.05, 1.15); addStat('happy', 5, deltas); text = fl.raise + ': thành công! Thu nhập từ nay tăng lên.'; scene = sceneFor(c.loc, { anim: 'cheer', fx: 'money' }); tone = 'good'; }
      else { S.job.perf = r100(S.job.perf - 3); addStat('happy', -3, deltas); text = fl.raise + ': không thành. Phía bên kia lắc đầu, bảo thị trường đang khó.'; scene = sceneFor(c.loc, { anim: 'sad' }); tone = 'bad'; }
    } else if (id === 'raise') {
      if (Math.random() < 0.05 + Math.max(0, S.job.perf - 50) / 120) { S.job.mult = (S.job.mult || 1) * U.rand(1.05, 1.12); addStat('happy', 5, deltas); text = 'Sếp gật đầu: "Em xứng đáng." Lương tăng ngay từ tháng sau!'; scene = sceneFor(c.loc, { anim: 'cheer', fx: 'money', people: [{ p: boss, anim: 'nod', say: 'Được, tăng lương!' }] }); tone = 'good'; }
      else { S.job.perf = r100(S.job.perf - 4); addStat('happy', -3, deltas); text = 'Sếp cười trừ: "Công ty đang khó khăn, em thông cảm."'; scene = sceneFor(c.loc, { anim: 'sad', people: [{ p: boss, anim: 'shrug', say: 'Khó khăn chung mà em…' }] }); tone = 'bad'; }
    } else if (id === 'quit' && !S.pending.length) {
      queueMilestone('ms_quit');
      text = c.sport ? 'Bạn ngồi một mình trong phòng thay đồ, nghĩ về chuyện treo giày…' : 'Bạn mở file đơn xin nghỉ việc, con trỏ nhấp nháy rất lâu…';
      scene = sceneFor(c.loc, { anim: 'think' });
    } else if (id === 'quit') {
      text = c.sport ? 'Bạn rời đội, treo giày/găng/vợt. Sân đấu khép lại, một chương mới bắt đầu.' : 'Bạn nộp đơn nghỉ việc ' + c.title.toLowerCase() + '. Tự do, nhưng cũng hơi chênh vênh.';
      if (c.sport) S.flags.ex_athlete = S.flags.ex_athlete || S.year;
      S.job = null; addStat('happy', 2, deltas);
      scene = sceneFor('street', { anim: 'shrug' });
    } else if (id === 'abroad') {
      if (Math.random() < 0.3 + (S.english - 55) / 80 + (S.flags.master ? 0.15 : 0) + (S.edu.abroad ? 0.15 : 0)) {
        S.abroad = { country: U.pick(ABROAD), since: S.year }; unlock('abroad'); addStat('happy', 5, deltas);
        text = 'Một công ty ở ' + S.abroad.country + ' nhận bạn! Lương gấp hơn 2 lần, nhưng chi phí sinh hoạt cũng đắt gấp mấy lần, và bạn sẽ xa gia đình.'; scene = sceneFor('airport', { anim: 'wave', fx: 'sparkle' }); tone = 'milestone';
      } else { addStat('happy', -3, deltas); text = 'Buổi phỏng vấn online với công ty nước ngoài không suôn sẻ: họ cần người nói tiếng Anh trôi chảy hơn và có kinh nghiệm quốc tế.'; scene = sceneFor('office', { anim: 'sad' }); tone = 'bad'; }
    } else if (id === 'home') {
      text = 'Bạn khép lại những năm ở ' + S.abroad.country + ', về nước làm việc. Lương thấp hơn, nhưng được ăn cơm nhà mỗi tối.'; S.abroad = null; addStat('happy', 6, deltas); scene = sceneFor('airport', { anim: 'hug', fx: 'hearts' }); tone = 'milestone';
    } else if (id === 'retire') {
      retire(); addStat('happy', 6, deltas); text = 'Bạn chính thức nghỉ hưu, nhận lương hưu ' + D.fmtShort(S.pension) + '/tháng.'; scene = sceneFor('park', { anim: 'cheer', fx: 'sparkle' }); tone = 'milestone';
    }
    tone = tone || toneOf(deltas);
    addLog(text, tone, a.icon); checkProgress(); changed();
    return result({ title: a.label, icon: a.icon, text, tone, deltas, scene });
  }

  // ------------------------------------------------------------------ ca làm việc cụ thể (js/jobs_tasks.js)
  // Mỗi nghề có các tình huống nghề nghiệp thật: bác sĩ mổ cấp cứu, giáo viên dự giờ, lập trình viên cứu hệ thống sập…
  // Kết quả ảnh hưởng thành tích (perf → thăng chức), thưởng, nghiệp; lựa chọn gian dối thì tiền nhanh nhưng dễ “toang”.
  const JT_REWARD = {
    big: { win: { perf: 12, bonus: 2, happy: 6, karma: 2 }, lose: { perf: -10, happy: -8 } },
    mid: { win: { perf: 7, bonus: 1, happy: 4, karma: 1 }, lose: { perf: -5, happy: -4 } },
    safe: { win: { perf: 2, happy: 0 }, lose: { perf: 0, happy: -1 } },
    shady: { win: { perf: 3, bonus: 4, happy: 2, karma: -8 }, lose: { perf: -25, bonus: -3, happy: -12, karma: -10, fire: 0.45 } },
  };
  // danh tiếng nghề: số ca làm việc xuất sắc → danh hiệu, cộng lương & hiệu suất; gian dối bị phát hiện thì mất uy tín
  const REP_TIERS = [[0, 'Mới vào nghề'], [3, 'Lành nghề'], [6, 'Giỏi nghề'], [10, 'Chuyên gia'], [15, 'Huyền thoại trong nghề']];
  const repN = () => (S && S.job ? ((S.jobRep || {})[S.job.id] || 0) : 0);
  function repTier(n) { let t = 0; REP_TIERS.forEach(([k], i) => { if (n >= k) t = i; }); return t; }
  function repInfo() { if (!S || !S.job) return null; const n = repN(), t = repTier(n), nx = REP_TIERS[t + 1]; return { n, tier: t, title: REP_TIERS[t][1], next: nx ? nx[0] - n : 0 }; }
  function addRep(d) {
    if (!S.job) return '';
    S.jobRep = S.jobRep || {}; const cid = S.job.id, t0 = repTier(repN());
    S.jobRep[cid] = Math.max(0, (S.jobRep[cid] || 0) + d);
    const t1 = repTier(repN());
    if (t1 > t0) { S.job.perf = r100(S.job.perf + 10); addLog('🎖️ Bạn được công nhận: ' + REP_TIERS[t1][1].toLowerCase() + ' (' + D.CAREERS[cid].title.toLowerCase() + '). Lương tăng, cấp trên để mắt tới bạn.', 'milestone', '🎖️'); if (t1 >= 4) unlockSafe('legend_job'); if (t1 === 2) { const ci = D.INDUSTRIES.find((x) => x.career && x.career.includes(cid)); if (ci && !S.company) addLog('💡 Đủ uy tín để mở ' + ci.name.toLowerCase() + ' của riêng mình (tab Tài sản → Tự làm chủ).', 'milestone', ci.icon); } return ' 🎖️ Danh hiệu mới: ' + REP_TIERS[t1][1] + '!'; }
    if (t1 < t0) return ' Danh tiếng nghề tụt xuống “' + REP_TIERS[t1][1] + '”.';
    return '';
  }
  const unlockSafe = (id) => { try { if (D.ACHIEVEMENTS.some((a) => a.id === id || a[0] === id)) unlock(id); } catch (e) { /* */ } };
  function jtChoice(cid, ti, k) {
    const t = ((KN.JOB_TASKS || {})[cid] || { tasks: [] }).tasks[ti], ch = t && t.c[k];
    if (!ch) return { key: 'c' + k, label: '—', fn: () => ({ text: 'Ca làm việc đã kết thúc.' }) };
    const [label, stat, base, mini, winT, loseT, kind] = ch;
    const job = S.job, lvl = job ? job.level : 0;
    const p = kind === 'safe' ? 1 : U.clamp(base + (stat ? (S.stats[stat] - 50) / 150 : 0) + ((job ? job.perf : 50) - 50) / 300 + lvl * 0.025 + karmaLuck(), 0.08, 0.93);
    const out = { key: 'c' + k, label, fn: () => {
      const win = kind === 'safe' ? true : miniWin(p);
      const r = JT_REWARD[kind][win ? 'win' : 'lose'], eff = {};
      if (r.happy) eff.happy = r.happy; if (r.karma) eff.karma = r.karma;
      if (r.bonus && S.job) eff.money = pay(monthly() * r.bonus);
      if (!win && kind === 'big' && stat === 'health') eff.health = -8;
      if (S.job) S.job.perf = r100(S.job.perf + (r.perf || 0));
      S.counters.jobTasks = (S.counters.jobTasks || 0) + 1; if (win && kind !== 'safe') S.counters.jobWins = (S.counters.jobWins || 0) + 1;
      let text = win ? winT : loseT;
      if (r.bonus > 0 && S.job) text += ' (Thưởng ' + fmtMoney(eff.money) + ')';
      if (kind !== 'safe') text += win ? ' 📈 Thành tích công việc tăng.' : ' 📉 Thành tích công việc giảm.';
      if (win && (kind === 'big' || kind === 'mid')) text += addRep(kind === 'big' ? 2 : 1);
      // nghề ↔ MXH: pha xử lý xuất sắc bị quay lại và lan truyền; gian dối bị lộ thì clip “bóc phốt” lan nhanh hơn
      try {
        if (socOpen() && kind === 'big' && win && Math.random() < 0.3) { const s = soc(), g = Math.round((U.randi(2000, 30000) + s.followers * 0.08) * satur(s.followers)); s.followers += g; text += ' 📱 Ai đó quay lại khoảnh khắc ấy, clip lan khắp mạng: +' + fmtF(g) + ' người theo dõi.'; addPost('🎖️', t.t + ' (clip lan truyền)', g * 25, g * 4, { viral: true }); }
        else if (socOpen() && kind === 'shady' && !win && soc().followers > 2000) { const s = soc(); s.followers = Math.round(s.followers * 0.8); s.scandals++; text += ' 📱 Clip bóc phốt bạn lan khắp mạng xã hội, mất 20% người theo dõi.'; }
      } catch (e) { U.warnOnce('jtsoc', 'job→social', e); }
      if (!win && kind === 'shady') text += addRep(-3);
      if (r.fire && S.job && Math.random() < r.fire) { const tl = D.CAREERS[S.job.id].title; S.job = null; text += ' Bạn bị buộc thôi việc ' + tl.toLowerCase() + '.'; }
      if (kind === 'shady' && !win) S.flags.shadyCaught = (S.flags.shadyCaught || 0) + 1;
      const anim = win ? (kind === 'shady' ? 'shrug' : 'cheer') : 'facepalm';
      return { text, effects: eff, scene: { anim, fx: win ? (kind === 'shady' ? 'money' : 'stars') : 'sweat' }, tone: kind === 'safe' ? 'neutral' : win ? (kind === 'shady' ? 'neutral' : 'good') : 'bad' };
    } };
    if (kind !== 'safe') { out.odds = () => p; if (mini) out.mini = mini; }
    out.hint = kind === 'shady' ? '⚠️ Gian dối: tiền nhanh, mất nghiệp, dễ bị phát hiện' : kind === 'big' ? '🎲 Rủi ro cao, thưởng lớn' : kind === 'safe' ? '🛡️ Chắc ăn' : null;
    return out;
  }
  (function registerJobTasks() {
    const J = KN.JOB_TASKS || {};
    Object.keys(J).forEach((cid) => J[cid].tasks.forEach((t, ti) => {
      const c = D.CAREERS[cid]; if (!c) return;
      const npcs = t.npc ? [{ role: t.npc[0], anim: t.npc[1], say: t.npc[2] || null }] : [];
      ms({ id: 'jt_' + cid + '_' + ti, title: t.t, icon: t.i || '💼', age: [15, 99], internal: true, live: cid === 'streamer', text: t.x,
        scene: { loc: t.loc || c.loc, anim: t.a || 'idle', npcs, fx: 'question' },
        choicesFn: () => t.c.map((_, k) => jtChoice(cid, ti, k)), choiceByKey: (key) => jtChoice(cid, ti, +String(key).slice(1)) });
    }));
  })();
  function jobTaskEvent() {
    if (!S.job) return null;
    const J = (KN.JOB_TASKS || {})[S.job.id]; if (!J || !J.tasks.length) return null;
    // xoay vòng, tránh lặp lại ca vừa gặp
    const seen = S.flags.jtSeen || (S.flags.jtSeen = {});
    const idx = J.tasks.map((_, i) => i).sort((a, b) => (seen[S.job.id + a] || 0) - (seen[S.job.id + b] || 0) || Math.random() - 0.5)[0];
    seen[S.job.id + idx] = S.year;
    return instantiate(MS['jt_' + S.job.id + '_' + idx]);
  }

  // ------------------------------------------------------------------ shop
  // ---- mạng xã hội ----------------------------------------------------------------------------
  // mở khi ≥ 13 tuổi và có smartphone. Người nổi tiếng / KOL có lượng theo dõi lớn → quảng cáo, livestream, drama.
  const SOC_RANKS = [[0, 'Người dùng thường'], [1000, 'Nano influencer'], [10000, 'Micro KOL'], [100000, 'KOL'], [1000000, 'Siêu sao mạng']];
  const NICKS = ['bé_mây', 'trà_sữa_fan', 'anh_shipper', 'hoa_hướng_dương', 'mèo_ú', 'gió_đông', 'tý_nị', 'chị_đẹp_92', 'coder_đêm', 'mẹ_bỉm_sữa', 'thánh_soi', 'người_qua_đường', 'cô_ba_sài_gòn', 'hà_nội_mùa_thu', 'fan_cứng'];
  const COMMENTS = {
    fan: ['Đẹp quá trời ơi 😍', 'Ngày nào cũng hóng bài của bạn!', 'Xinh như tiên luôn á', 'Truyền động lực ghê 💪', 'Fan cứng điểm danh!!!'],
    hater: ['Làm lố quá, xem phát ngán', 'Ảnh photoshop dữ vậy?', 'Nổi tiếng nhờ ăn may thôi', 'Content nhạt như nước ốc', 'Ai cho bạn tự tin vậy 🙄'],
    troll: ['Ủa rồi sao? 🤡', 'Hóng drama', 'Cho xin link mua áo', 'Ăn cơm chưa?', 'Seen'],
    friend: ['Ê nhớ tao không 😂', 'Mai cà phê không?', 'Đi đâu mà đẹp vậy', 'Tag tao vô với!'],
    giangho: ['Ra đây solo không em 👊', 'Nói xấu đại ca là xác định nhé', 'Anh em đâu, vào đây xử lý thằng này', 'Biết nhà mày rồi đấy, cẩn thận', 'Nộp tiền bảo kê kênh chưa?'],
  };
  const BRANDS = [
    { name: 'Trà sữa Mây', item: 'trà sữa', shady: false }, { name: 'Shopee Mall', item: 'sàn thương mại điện tử', shady: false }, { name: 'Ví điện tử Sen', item: 'ví điện tử', shady: false },
    { name: 'Mỹ phẩm Ngọc Trai', item: 'kem dưỡng da', shady: false }, { name: 'Xe điện VinTech', item: 'xe điện', shady: false }, { name: 'Khóa học tiếng Anh Sao Mai', item: 'khóa học tiếng Anh', shady: false },
    { name: 'Kem trộn “Trắng Cấp Tốc”', item: 'kem trộn không rõ nguồn gốc', shady: true }, { name: 'Sàn coin XBit', item: 'sàn tiền ảo', shady: true }, { name: 'Nhà cái K8', item: 'web cá độ', shady: true }, { name: 'Thực phẩm chức năng “Thần Dược”', item: 'thuốc giảm cân thần tốc', shady: true },
  ];
  // càng đông người theo dõi càng khó tăng thêm (bão hòa quanh vài triệu)
  const satur = (f) => 1 / (1 + f / 1.5e6);
  function soc() { if (!S.social) S.social = { followers: 0, feed: [], offers: [], posts: 0, scandals: 0 }; return S.social; }
  function socRank(f) { let r = SOC_RANKS[0][1]; SOC_RANKS.forEach(([k, n]) => { if (f >= k) r = n; }); return r; }
  function socOpen() { return S && !S.dead && S.year >= 2009 && !S.jail && P().age >= 13 && S.assets.some((a) => a.type === 'phone' && a.itemId !== 'phone1'); }
  const fmtF = (n) => n >= 1e6 ? (Math.round(n / 1e5) / 10 + 'M').replace('.', ',') : n >= 1e3 ? (Math.round(n / 100) / 10 + 'K').replace('.', ',') : String(n);
  function genComments(n, mood) {
    const s = soc(); const out = [];
    for (let i = 0; i < n; i++) {
      const kind = U.weighted(['fan', 'hater', 'troll', 'friend', 'giangho'], (k) => ({ fan: 4 + mood, hater: 2 + (s.followers > 50000 ? 2 : 0) - mood * 0.5, troll: 2, friend: s.followers < 5000 ? 3 : 0.5, giangho: s.niche === 'giangho' ? 2.5 : s.followers > 20000 ? 0.6 : 0.1 }[k]));
      out.push({ id: U.uid('c'), kind, user: U.pick(NICKS) + (Math.random() < 0.4 ? '_' + U.randi(1, 99) : ''), text: U.pick(COMMENTS[kind]), likes: Math.round(U.rand(0, 1) * (10 + s.followers * 0.002)), replied: false });
    }
    s.feed = out.concat(s.feed).slice(0, 8);
  }
  function socialYear(L) {
    if (!socOpen()) return;
    const s = soc(), c = S.job && D.CAREERS[S.job.id];
    // người nổi tiếng tự có người theo dõi; ai bỏ bê MXH thì tụt dần
    if (c && c.fame) s.followers += Math.round((S.job.level + 1) ** 2 * U.randi(1500, 9000) * (0.5 + S.stats.looks / 100) * satur(s.followers));
    s.followers = Math.round(s.followers * (s.lastYear !== S.year - 1 ? 0.85 : 0.95)); // người xem chán dần, không đăng là tụt nhanh
    s.offers = [];
    if (s.followers >= 10000) {
      const n = s.followers >= 100000 ? 3 : 2;
      U.shuffle(BRANDS.slice()).slice(0, n).forEach((b) => s.offers.push({ id: U.uid('o'), brand: b.name, item: b.item, shady: b.shady, pay: Math.round(Math.min(b.shady ? 1.2e9 : 5e8, Math.max(2e6, s.followers * U.rand(15, 80) * (b.shady ? 2.5 : 1))) / 1e5) * 1e5 }));
    }
    if (s.followers >= 1e6) unlock('famous');
    // tiền quảng cáo từ nền tảng (chỉ khi còn đăng bài đều và đủ 10K theo dõi để bật kiếm tiền)
    s.adIncome = 0;
    if (s.followers >= 10000 && s.lastYear >= S.year - 1) {
      s.adIncome = pay(s.followers * U.rand(120, 520) * (nicheOf() ? 1.2 : 1) * (s.verified ? 1.15 : 1) * (kolFull() ? 1.6 : 1));
      addMoney(s.adIncome, {});
      L('💸 Tiền quảng cáo nền tảng năm nay: ' + fmtMoney(s.adIncome) + ' (' + fmtF(s.followers) + ' người theo dõi).', 'good', '📲');
    }
    if (s.brand) { const rev = pay(s.followers * U.rand(20, 90) * satur(s.followers) * (s.scandals > 3 ? 0.5 : 1)); if (rev > 0) { addMoney(rev, {}); L('🏷️ Thương hiệu ' + s.brand + ' mang về ' + fmtMoney(rev) + ' năm nay.', 'good', '🏷️'); } }
    genInbox(s.followers >= 100000 ? 3 : s.followers >= 5000 ? 2 : 1);
    // biến cố MXH
    if (S.pending.length < 3) {
      const f = s.followers, r = Math.random();
      if (f >= 10000 && r < (s.verified ? 0.03 : 0.08)) queueMilestone('ms_soc_hack');
      else if (f >= 500000 && r < 0.3) queueMilestone('ms_soc_award');
      else if (f >= 50000 && r < 0.42) queueMilestone('ms_soc_beef');
      else if (f >= 100000 && r < 0.52) queueMilestone('ms_soc_cancel');
      else if (r > 0.95) queueMilestone('ms_soc_meme');
    }
    // phốt cũ bị đào lại
    if (s.shadyDeals && Math.random() < 0.3) {
      s.shadyDeals--; s.scandals++; const lost = Math.round(s.followers * U.rand(0.25, 0.5)); s.followers -= lost;
      addStat('happy', -10, {}); S.karma = r100(S.karma - 6);
      genComments(4, -3);
      L('Bị bóc phốt vì từng quảng cáo sản phẩm bẩn: mất ' + fmtF(lost) + ' người theo dõi, hộp thư ngập tin nhắn chửi bới.', 'bad', '🔥');
    }
  }
  // ---- MXH 2.0: kênh chủ đề, nhiều kiểu nội dung, lịch sử bài đăng, hộp thư, tích xanh, bảng xếp hạng, tiền quảng cáo nền tảng
  const NICHES = [
    { id: 'hai', icon: '😂', name: 'Hài hước', stat: 'happy', desc: 'Tiểu phẩm, chế meme, kể chuyện đời thường' },
    { id: 'lamdep', icon: '💄', name: 'Làm đẹp – thời trang', stat: 'looks', desc: 'Makeup, phối đồ, review mỹ phẩm' },
    { id: 'amthuc', icon: '🍜', name: 'Ẩm thực – review quán', stat: 'happy', desc: 'Ăn sập phố, nấu ăn, chấm điểm quán' },
    { id: 'giaoduc', icon: '📚', name: 'Kiến thức – giáo dục', stat: 'smarts', desc: 'Giải thích khoa học, mẹo học, sức khoẻ' },
    { id: 'gaming', icon: '🎮', name: 'Game', stat: 'smarts', desc: 'Stream game, hướng dẫn, leo rank' },
    { id: 'dulich', icon: '✈️', name: 'Du lịch – vlog', stat: 'looks', desc: 'Đi khắp nơi, vlog đời sống' },
    { id: 'gym', icon: '💪', name: 'Thể hình – sức khoẻ', stat: 'health', desc: 'Tập luyện, ăn kiêng, thay đổi bản thân' },
    { id: 'nghe', icon: '💼', name: 'Chuyện nghề', stat: 'smarts', desc: 'Kể chuyện nghề của bạn — càng giỏi nghề càng hút' },
    { id: 'kinhdoanh', icon: '💰', name: 'Kinh doanh – làm giàu', stat: 'smarts', desc: 'Chia sẻ làm ăn, tài chính cá nhân' },
    { id: 'giangho', icon: '🥊', name: 'Giang hồ mạng', stat: 'health', desc: 'Chửi bới, dằn mặt, khoe xăm trổ — lên fan cực nhanh nhưng dễ bị phạt, khoá kênh' },
  ];
  const CAREER_NICHE = { bacsi: 'giaoduc', duocsi: 'giaoduc', dieuduong: 'giaoduc', giaovien: 'giaoduc', khoahoc: 'giaoduc', daubep: 'amthuc', phucvu: 'amthuc', thocattoc: 'lamdep', nguoimau: 'lamdep', thietke: 'lamdep', esports: 'gaming', laptrinh: 'gaming', huongdanvien: 'dulich', tiepvien: 'dulich', phicong: 'dulich', hlv: 'gym', cauthu: 'gym', bongro: 'gym', vdv_vo: 'gym', boi: 'gym', dienkinh: 'gym', caulong: 'gym', bongchuyen: 'gym', kinhdoanh: 'kinhdoanh', nganhang: 'kinhdoanh', ketoan: 'kinhdoanh', casi: 'hai', dienvien: 'hai', streamer: 'hai', nhaccong: 'hai' };
  const nicheOf = () => NICHES.find((n) => n.id === soc().niche) || null;
  // hệ số “hợp kênh”: chỉ số chủ đạo của kênh, cộng thêm nếu kênh hợp nghề / kể chuyện nghề khi lên chức cao
  function socK() {
    const n = nicheOf(); if (!n) return S.stats.looks / 60;
    let k = (S.stats[n.stat] * 0.75 + S.stats.looks * 0.25) / 60;
    if (S.job && CAREER_NICHE[S.job.id] === n.id) k *= 1.3;
    if (n.id === 'giangho') k *= 1.6;
    if (n.id === 'nghe') k *= S.job ? (1 + S.job.level * 0.18) * (1 + repTier(repN()) * 0.15) : 0.6;
    if (soc().verified) k *= 1.1;
    return k;
  }
  function addPost(icon, title, views, likes, extra) {
    const s = soc(); s.hist = s.hist || [];
    s.hist.unshift(Object.assign({ id: U.uid('p'), icon, title, views: Math.max(0, Math.round(views)), likes: Math.max(0, Math.round(likes)), year: S.year, age: P().age }, extra || {}));
    s.hist = s.hist.slice(0, 8);
  }
  const SOC_ACTS = [
    { id: 'photo', icon: '📸', label: 'Đăng ảnh đời thường', min: 0 },
    { id: 'vlog', icon: '🎥', label: 'Làm video theo kênh', min: 0, niche: true },
    { id: 'trend', icon: '🎬', label: 'Quay clip bắt trend', min: 0 },
    { id: 'story', icon: '🕯️', label: 'Kể chuyện đời mình', min: 500 },
    { id: 'challenge', icon: '🔥', label: 'Thử thách mạo hiểm', min: 1000 },
    { id: 'review', icon: '⭐', label: 'Review thật lòng một quán/sản phẩm', min: 3000 },
    { id: 'live', icon: '🔴', label: 'Livestream bán hàng', min: 5000 },
    { id: 'qa', icon: '🎙️', label: 'Livestream trò chuyện, trả lời câu hỏi', min: 500 },
    { id: 'khuya', icon: '🌙', label: 'Live tâm sự đêm khuya', min: 2000 },
    { id: 'giangho', icon: '🥊', label: 'Live dằn mặt antifan (giang hồ mạng)', min: 5000 },
    { id: 'drama', icon: '🍿', label: 'Bóc phốt một KOL khác', min: 5000 },
    { id: 'collab', icon: '🤝', label: 'Collab với KOL khác', min: 10000 },
    { id: 'pk', icon: '⚔️', label: 'Livestream PK với KOL khác', min: 20000 },
    { id: 'charity', icon: '💝', label: 'Kêu gọi từ thiện', min: 20000 },
    { id: 'course', icon: '🎓', label: 'Bán khoá học online', min: 100000 },
    { id: 'brand', icon: '🏷️', label: 'Ra mắt thương hiệu riêng', min: 300000 },
    { id: 'detox', icon: '🧘', label: 'Tạm nghỉ MXH', min: 0 },
  ];
  const SOC_PER_YEAR = 4;
  const kolFull = () => !!(S.flags.kolFull && !S.job);
  const socPerYear = () => SOC_PER_YEAR + (kolFull() ? 3 : 0); // KOL / streamer toàn thời gian: đăng 7 bài mỗi năm
  // bảng xếp hạng KOL (người ảo, cố định theo năm) + vị trí của bạn
  const KOL_NAMES = ['Mây Review', 'Thánh Ăn Đường Phố', 'Coder Đêm Khuya', 'Chị Bảy Bán Hàng', 'Bác Sĩ Tâm Sự', 'Gymer Hà Thành', 'Nấm Lùn Du Ký', 'Thầy Giáo Vật Lý Vui', 'Game Thủ Tí Hon', 'Cô Ba Sài Gòn', 'Lão Nông Tiktok', 'Hot Girl Trà Sữa', 'Anh Shipper Hài', 'Mẹ Bỉm Kể Chuyện', 'Thánh Soi Phốt'];
  function kolBoard() {
    let seed = S.year * 31; const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const list = KOL_NAMES.map((name, i) => ({ name, f: Math.round(9e6 * Math.pow(0.72, i) * (0.8 + r() * 0.4)), me: false }));
    list.push({ name: fullName(S.player) + ' (bạn)', f: soc().followers, me: true });
    list.sort((a, b) => b.f - a.f);
    const pos = list.findIndex((x) => x.me) + 1;
    return { top: list.slice(0, 8).map((x, i) => ({ rank: i + 1, name: x.name, f: fmtF(x.f), me: x.me })), pos, total: 1000 + Math.round(soc().followers / 50) };
  }
  function socialView() {
    if (!S || !S.player) return { open: false };
    const s = soc(), used = S.yearActs.soc || 0, n = nicheOf();
    return { open: socOpen(), reason: P().age < 13 ? 'Từ 13 tuổi' : S.year < 2009 ? 'Mạng xã hội chưa phổ biến ở thời của bạn' : 'Cần một chiếc smartphone (mua ở tab Tài sản)', followers: s.followers, followersText: fmtF(s.followers), rank: socRank(s.followers), postsLeft: Math.max(0, SOC_PER_YEAR - used), scandals: s.scandals,
      verified: !!s.verified, canVerify: !s.verified && s.followers >= 100000 && !(s.verifyTried >= S.year),
      niche: n ? { id: n.id, icon: n.icon, name: n.name } : null, niches: NICHES.map((x) => ({ id: x.id, icon: x.icon, name: x.name, desc: x.desc, fit: (S.job && CAREER_NICHE[S.job.id] === x.id) || false })),
      income: s.adIncome ? fmtMoney(s.adIncome) : '', brand: s.brand || null,
      actions: SOC_ACTS.map((a) => ({ id: a.id, icon: a.icon, label: a.niche && n ? a.label.replace('theo kênh', n.name.split(' – ')[0].toLowerCase()) : a.label, available: used < socPerYear() && s.followers >= a.min && !(a.niche && !n), reason: a.niche && !n ? 'Chọn kênh chủ đề trước' : s.followers < a.min ? 'Cần ' + fmtF(a.min) + ' theo dõi' : used >= socPerYear() ? 'Đã đăng đủ năm nay' : null })),
      offers: s.offers.map((o) => ({ id: o.id, brand: o.brand, item: o.item, payText: fmtMoney(o.pay), shady: o.shady })),
      posts: (s.hist || []).map((p) => ({ id: p.id, icon: p.icon, title: p.title, views: fmtF(p.views), likes: fmtF(p.likes), viral: !!p.viral, flop: !!p.flop, when: p.year === S.year ? 'năm nay' : (S.year - p.year) + ' năm trước' })),
      inbox: (s.inbox || []).map((m) => ({ id: m.id, kind: m.kind, icon: m.icon, from: m.from, text: m.text, a: m.a })),
      board: s.followers >= 1000 ? kolBoard() : null,
      feed: s.feed.map((c) => ({ id: c.id, kind: c.kind, user: c.user, text: c.text, likes: c.likes, replied: c.replied, myReply: c.myReply || '' })) };
  }
  function socialNiche(id) {
    const s = soc(), n = NICHES.find((x) => x.id === id); if (!n) return fail('Không có kênh này.');
    const had = !!s.niche; s.niche = id;
    if (had) s.followers = Math.round(s.followers * 0.8); // đổi kênh: một phần người xem cũ bỏ đi
    changed();
    return result({ title: n.icon + ' Kênh ' + n.name, icon: n.icon, text: had ? 'Bạn đổi hướng kênh sang ' + n.name.toLowerCase() + '. Khoảng 20% người theo dõi cũ bỏ đi vì không còn đúng gu.' : 'Bạn định hướng kênh: ' + n.name.toLowerCase() + '. ' + n.desc + '. Nội dung đúng chủ đề sẽ lên nhanh hơn.' + (S.job && CAREER_NICHE[S.job.id] === id ? ' Kênh rất hợp với nghề của bạn!' : ''), tone: 'neutral' });
  }
  function socialVerify() {
    const s = soc(); if (s.verified || s.followers < 100000) return fail('Chưa đủ điều kiện xác minh.');
    s.verifyTried = S.year;
    const ok = Math.random() < 0.55 + (s.scandals ? -0.2 : 0.15);
    if (ok) s.verified = true; changed();
    return result({ title: '✅ Xác minh tài khoản', icon: '✅', text: ok ? 'Tích xanh đã về! Tài khoản của bạn được nền tảng xác minh: khó bị giả mạo hơn, nội dung được ưu tiên đề xuất.' : 'Hồ sơ xác minh bị từ chối: “chưa đủ mức độ quan tâm của công chúng” — năm sau thử lại.', tone: ok ? 'good' : 'bad', scene: sceneFor('bedroom', { anim: ok ? 'cheer' : 'sad', fx: ok ? 'stars' : null }) });
  }
  // hộp thư: tin nhắn có hậu quả thật
  const DM = {
    fan: { icon: '💌', from: () => '@' + U.pick(NICKS), text: () => U.pick(['Em xem hết video của anh/chị rồi, nhờ anh/chị mà em vượt qua thời gian khó khăn nhất 🥺', 'Fan cứng từ hồi mới có 100 follow nè, tự hào ghê!', 'Cho em xin chữ ký online được không ạ?']), a: ['💗 Trả lời', '🙈 Bơ'] },
    scam: { icon: '🎁', from: () => 'Admin_Ho_Tro_' + U.randi(10, 99), text: () => U.pick(['Chúc mừng tài khoản của bạn được chọn nhận tích xanh MIỄN PHÍ. Bấm link và đăng nhập để kích hoạt!', 'Tài khoản của bạn vi phạm bản quyền, sẽ bị khoá sau 24h. Bấm vào đây để kháng nghị.']), a: ['🔗 Bấm link', '🗑️ Xoá'] },
    brand: { icon: '🤝', from: () => U.pick(BRANDS.filter((b) => !b.shady)).name, text: () => 'Chào bạn, bên mình muốn mời bạn làm một video hợp tác, cát-xê thương lượng.', a: ['✍️ Nhận lời', '✋ Từ chối'] },
    date: { icon: '💘', from: () => '@' + U.pick(['nắng_sớm', 'mưa_phùn', 'café_sữa', 'người_lạ_dễ_thương', 'sao_đêm']) + '_' + U.randi(1, 99), text: () => 'Ảnh bạn đăng hôm qua đẹp quá. Mình ở gần đây, cuối tuần cà phê không?', a: ['☕ Đi gặp', '🙅 Từ chối'] },
    press: { icon: '📰', from: () => U.pick(['Báo Tuổi Trẻ Online', 'Kênh14', 'VnExpress Giải trí', 'Zing News']), text: () => 'Toà soạn muốn thực hiện bài phỏng vấn chân dung về hành trình làm sáng tạo nội dung của bạn.', a: ['🎤 Nhận phỏng vấn', '✋ Từ chối'] },
    tv: { icon: '📺', from: () => 'Đài truyền hình', text: () => U.pick(['Mời bạn tham gia gameshow “Ai là triệu phú” phiên bản người nổi tiếng.', 'Mời bạn tham gia show thực tế “Đi đâu cũng được”, quay 2 tháng.']), a: ['✅ Tham gia', '✋ Từ chối'] },
    threat: { icon: '☠️', from: () => '@ẩn_danh_' + U.randi(100, 999), text: () => 'Tao biết nhà mày ở đâu. Cẩn thận đấy.', a: ['🚓 Báo công an', '🚫 Chặn'] },
    old: { icon: '👋', from: () => '@' + U.pick(['bạn_cấp_3', 'thằng_bạn_cũ', 'con_bạn_thân_cũ']), text: () => 'Ê nhớ tao không? Thấy mày nổi tiếng quá, bao giờ về quê họp lớp?', a: ['🍻 Hẹn gặp', '😅 Để sau'] },
    ambassador: { icon: '👑', from: () => U.pick(['Tập đoàn VinTech', 'Hãng hàng không Sen Vàng', 'Ngân hàng Sao Mai']), text: () => 'Chúng tôi muốn mời bạn làm đại sứ thương hiệu một năm.', a: ['🤝 Ký hợp đồng', '✋ Từ chối'] },
  };
  function genInbox(n) {
    const s = soc(), f = s.followers; s.inbox = s.inbox || [];
    const pool = ['fan', 'fan', 'scam', 'old'];
    if (f >= 3000) pool.push('brand');
    if (f >= 2000 && P().age >= 18 && P().age <= 45 && !alive('spouse').length && !alive('partner').length) pool.push('date', 'date');
    if (f >= 50000) pool.push('press', 'threat');
    if (f >= 200000) pool.push('tv');
    if (f >= 500000) pool.push('ambassador');
    for (let i = 0; i < n; i++) { const k = U.pick(pool), d = DM[k]; s.inbox.unshift({ id: U.uid('m'), kind: k, icon: d.icon, from: d.from(), text: d.text(), a: d.a }); }
    s.inbox = s.inbox.slice(0, 5);
  }
  function socialInbox(id, ans) {
    const s = soc(), i = (s.inbox || []).findIndex((m) => m.id === id); if (i < 0) return fail('Tin nhắn không còn.');
    const m = s.inbox.splice(i, 1)[0], yes = ans === 0, deltas = {}, f0 = s.followers;
    let text = '', tone = 'neutral', scene = null;
    const moneyAdd = (v) => { addMoney(v, deltas); };
    if (m.kind === 'fan') { if (yes) { s.followers += Math.round(3 + f0 * 0.004); S.karma = r100(S.karma + 1); addStat('happy', 3, deltas); text = 'Bạn trả lời dài và chân thành. Fan chụp màn hình đăng lên, ai cũng khen bạn tử tế.'; tone = 'good'; } else text = 'Tin nhắn chìm giữa hàng trăm tin khác.'; }
    else if (m.kind === 'scam') { if (yes) { if (Math.random() < 0.7) { const lost = Math.round(f0 * U.rand(0.25, 0.6)); s.followers -= lost; const cash = pct(0.03, 0); if (cash) moneyAdd(-cash); addStat('happy', -10, deltas); text = 'Đường link giả lấy mất mật khẩu. Kẻ gian đổi tên kênh, đăng quảng cáo cờ bạc' + (cash ? ', còn rút ' + fmtMoney(cash) + ' trong ví liên kết' : '') + '. Mất ' + fmtF(lost) + ' người theo dõi trước khi lấy lại được tài khoản.'; tone = 'bad'; } else text = 'Trang web báo lỗi. May mà bạn kịp tỉnh ra, đổi mật khẩu ngay.'; } else { text = 'Bạn xoá tin nhắn. Cảnh giác là đúng.'; } }
    else if (m.kind === 'brand') { if (yes) { const pay2 = pay(Math.max(2e6, f0 * U.rand(20, 70))); moneyAdd(pay2); text = m.from + ' gửi sản phẩm, bạn làm video hợp tác, nhận cát-xê ' + fmtMoney(pay2) + '.'; tone = 'good'; addPost('🤝', 'Video hợp tác ' + m.from, f0 * U.rand(1, 3), f0 * U.rand(0.05, 0.15)); } else text = 'Bạn lịch sự từ chối.'; }
    else if (m.kind === 'date') {
      if (yes) { const r = Math.random();
        if (r < 0.45) { const g = U.pick(loveGenders()); const p = newPerson('partner', g, U.clamp(P().age + U.randi(-4, 4), 18, 60), { relation: U.randi(55, 70) }); p.metOnline = S.year; S.people.push(p); addStat('happy', 8, deltas); text = 'Buổi cà phê kéo dài đến tối. Ngoài đời ' + p.firstName + ' còn dễ thương hơn trên mạng. Hai người chính thức hẹn hò!'; tone = 'good'; scene = sceneFor('cafe', { anim: 'love', fx: 'hearts' }); }
        else if (r < 0.75) { addStat('happy', -6, deltas); text = 'Người đến gặp khác hẳn ảnh đại diện, còn rủ bạn đầu tư tiền ảo. Bạn kiếm cớ về sớm.'; tone = 'bad'; scene = sceneFor('cafe', { anim: 'facepalm' }); }
        else { text = 'Hai người nói chuyện vui vẻ nhưng không có “tia lửa”. Làm bạn thôi.'; scene = sceneFor('cafe', { anim: 'talk' }); } }
      else text = 'Bạn không trả lời. Người lạ mà, cẩn thận vẫn hơn.'; }
    else if (m.kind === 'press') { if (yes) { s.followers += Math.round(f0 * U.rand(0.03, 0.08)); addStat('happy', 4, deltas); text = 'Bài phỏng vấn của ' + m.from + ' lên trang nhất mục giải trí. Nhiều người mới biết đến bạn.'; tone = 'good'; } else text = 'Bạn từ chối, giữ sự riêng tư.'; }
    else if (m.kind === 'tv') { if (yes) { const fee = pay(Math.max(5e7, f0 * U.rand(30, 90))); moneyAdd(fee); if (Math.random() < 0.25) { s.followers = Math.round(f0 * 0.9); s.scandals++; text = 'Bạn tham gia show, nhận ' + fmtMoney(fee) + ', nhưng bị cắt ghép thành “nhân vật phản diện”. Dân mạng chửi bạn cả tuần.'; tone = 'bad'; } else { s.followers += Math.round(f0 * U.rand(0.08, 0.2)); addStat('happy', 6, deltas); text = 'Bạn toả sáng trên sóng truyền hình, cát-xê ' + fmtMoney(fee) + '. Lượt theo dõi tăng vọt.'; tone = 'good'; } scene = sceneFor('studio', { anim: 'wave', fx: 'stars' }); } else text = 'Bạn từ chối vì lịch kín.'; }
    else if (m.kind === 'threat') { if (yes) { text = 'Công an truy ra chủ tài khoản là một antifan tuổi teen, mời lên làm việc và xin lỗi bạn.'; tone = 'good'; } else { addStat('happy', -3, deltas); text = 'Bạn chặn, nhưng mấy đêm liền vẫn giật mình khi nghe tiếng xe dừng trước cửa.'; } }
    else if (m.kind === 'old') { if (yes) { addStat('happy', 5, deltas); if (Math.random() < 0.5) S.people.push(newPerson('friend', U.pick(['m', 'f']), P().age, { relation: 70 })); text = 'Buổi gặp lại ồn ào như thời đi học. Có những tình bạn chẳng cần follow vẫn còn đó.'; tone = 'good'; scene = sceneFor('street', { anim: 'laugh', time: 'night' }); } else text = 'Bạn hẹn “để sau” — rồi quên luôn.'; }
    else if (m.kind === 'ambassador') { if (yes) { const fee = pay(Math.min(5e9, Math.max(3e8, f0 * U.rand(80, 250)))); moneyAdd(fee); s.followers += Math.round(f0 * 0.05); addStat('happy', 8, deltas); text = 'Bạn chính thức thành đại sứ thương hiệu của ' + m.from + ', hợp đồng ' + fmtMoney(fee) + '. Biển quảng cáo có mặt bạn phủ khắp các ngả đường.'; tone = 'milestone'; scene = sceneFor('studio', { anim: 'cheer', fx: ['money', 'stars'] }); } else text = 'Bạn từ chối vì không tin dùng sản phẩm đó. Fan khen bạn có tâm.'; }
    deltas.followers = s.followers - f0;
    addLog('📩 ' + m.from + ': ' + text, tone, m.icon); checkProgress(); changed();
    return result({ title: m.icon + ' Tin nhắn từ ' + m.from, icon: m.icon, text, tone, deltas, scene: scene || sceneFor('bedroom', { anim: 'phone', fx: tone === 'good' ? 'sparkle' : null }) });
  }
  function socialAction(id) {
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const s = soc(), a = SOC_ACTS.find((x) => x.id === id); if (!a) return fail('Không có thao tác này.');
    if ((S.yearActs.soc || 0) >= socPerYear()) return fail('Năm nay bạn đã đăng đủ rồi.');
    if (s.followers < a.min) return fail('Cần ' + fmtF(a.min) + ' người theo dõi.');
    if (a.niche && !nicheOf()) return fail('Chọn kênh chủ đề trước đã.');
    if (KN.Weekly) KN.Weekly.track('post');
    if (LIVE_EV[id]) { const ev = liveEvent(LIVE_EV[id]); if (!ev) return fail('Chưa mở được buổi live.'); S.yearActs.soc = (S.yearActs.soc || 0) + 1; s.lastYear = S.year; s.posts++; S.pending.unshift(ev); changed(); return result({ title: a.icon + ' ' + a.label, icon: a.icon, text: 'Bạn bấm “Phát trực tiếp”. Đèn đỏ LIVE sáng lên, người xem bắt đầu vào…', tone: 'neutral', scene: sceneFor('bedroom', { anim: 'talk', fx: 'music' }), event: ev, live: true }); }
    if (id === 'pk') { const ev = instantiate(MS.ms_soc_pk); if (!ev) return fail('Chưa mở được phiên PK.'); S.yearActs.soc = (S.yearActs.soc || 0) + 1; s.lastYear = S.year; s.posts++; S.flags.pkFoe = U.pick(KOL_NAMES); S.pending.unshift(ev); changed(); return result({ title: '⚔️ Livestream PK', icon: '⚔️', text: 'Bạn mời ' + S.flags.pkFoe + ' vào phiên PK. Đếm ngược 3… 2… 1…', tone: 'neutral', scene: sceneFor('bedroom', { anim: 'talk', fx: 'music' }), event: ev, live: true }); }
    S.yearActs.soc = (S.yearActs.soc || 0) + 1; s.lastYear = S.year; s.posts++;
    const deltas = {}, f0 = s.followers, k = socK(), n = nicheOf();
    let text, tone, mood = 0, anim = 'phone', fx = 'sparkle', loc = 'street';
    const grow = (base, mul) => Math.round((base + f0 * mul) * k * U.rand(0.5, 1.4) * satur(f0));
    if (id === 'photo') { const g = grow(15, 0.012); s.followers += g; addStat('happy', 2, deltas); const likes = g * U.rand(3, 8); text = 'Bức ảnh nhận ' + fmtF(Math.round(likes)) + ' lượt thích, thêm ' + fmtF(g) + ' người theo dõi.'; mood = 1; addPost('📸', U.pick(['Sáng nay trời đẹp ghê', 'Outfit đi làm hôm nay', 'Bữa cơm nhà', 'Một ngày bình yên']), likes * 4, likes); }
    else if (id === 'vlog') {
      const viral = Math.random() < (0.06 + k * 0.05) * satur(f0);
      const g = viral ? Math.round((f0 * 0.3 + U.randi(5000, 40000) * k) * satur(f0)) : grow(40, 0.03);
      s.followers += g; addStat('happy', viral ? 8 : 3, deltas);
      const topic = { hai: 'Tiểu phẩm “Khi mẹ bảo dọn phòng”', lamdep: 'Makeup đi đám cưới 5 phút', amthuc: 'Ăn thử 10 món vỉa hè dưới 30 nghìn', giaoduc: 'Vì sao bầu trời màu xanh?', gaming: 'Leo rank Thách Đấu trong 24 giờ', dulich: 'Một ngày ở chợ nổi Cái Răng', gym: 'Hành trình giảm 10 cân', nghe: 'Một ngày làm ' + (S.job ? D.CAREERS[S.job.id].title.toLowerCase() : 'người thất nghiệp'), kinhdoanh: 'Tôi kiếm 100 triệu đầu tiên thế nào', giangho: U.pick(['Dằn mặt đứa nói xấu tao', 'Một ngày đi đòi nợ thuê', 'Khoe hình xăm mới 50 triệu', 'Gửi lời tới mấy thằng anti']) }[n.id];
      const views = viral ? g * U.rand(15, 40) : (f0 + g) * U.rand(0.3, 1.2);
      text = viral ? 'Video “' + topic + '” VIRAL: ' + fmtF(Math.round(views)) + ' lượt xem, +' + fmtF(g) + ' theo dõi!' : 'Video “' + topic + '” được ' + fmtF(Math.round(views)) + ' lượt xem, +' + fmtF(g) + ' theo dõi.' + (k > 1.3 ? ' Nội dung rất hợp với thế mạnh của bạn.' : k < 0.8 ? ' Người xem thấy bạn chưa thật sự giỏi chủ đề này.' : '');
      if (viral) { fx = 'fireworks'; anim = 'cheer'; mood = 2; tone = 'good'; } else mood = 1;
      addPost(n.icon, topic, views, views * U.rand(0.04, 0.12), { viral });
      loc = { amthuc: 'street', gym: 'gym', dulich: 'beach', gaming: 'bedroom', giaoduc: 'bedroom', nghe: S.job ? D.CAREERS[S.job.id].loc : 'office', lamdep: 'bedroom', kinhdoanh: 'office', hai: 'home', giangho: 'street' }[n.id] || 'street';
    }
    else if (id === 'trend') {
      if (Math.random() < (0.07 + k * 0.03) * satur(f0)) { const g = Math.round((f0 * 0.25 + U.randi(3000, 25000) * k) * satur(f0)); s.followers += g; addStat('happy', 8, deltas); text = 'Clip VIRAL! Hơn ' + fmtF(g * 20) + ' lượt xem, bạn có thêm ' + fmtF(g) + ' người theo dõi chỉ sau một đêm.'; fx = 'fireworks'; anim = 'dance'; mood = 2; tone = 'good'; addPost('🎬', 'Bắt trend nhảy “' + U.pick(['See Tình', 'Bống Bống Bang Bang', 'Waiting For You', 'Ếch Ngoài Đáy Giếng']) + '”', g * 20, g * 3, { viral: true }); }
      else { const g = Math.round((5 + f0 * 0.01) * U.rand(0, 1.2)); s.followers += g; text = 'Clip được vài trăm lượt xem rồi chìm nghỉm. Thuật toán hôm nay không thương bạn.' + (g ? ' (+' + fmtF(g) + ' theo dõi)' : ''); mood = -1; anim = 'dance'; addPost('🎬', 'Bắt trend (flop)', 300 + f0 * 0.2, 20 + f0 * 0.01, { flop: true }); }
    } else if (id === 'story') {
      // kể chuyện đời: càng nhiều biến cố (mất người thân, phá sản, ly hôn, ngồi tù, khỏi bệnh...) càng chạm lòng người
      const drama = (S.flags.richkid_broke ? 1 : 0) + (S.flags.shadyCaught ? 1 : 0) + S.people.filter((p) => !p.alive && ['mother', 'father', 'spouse', 'child'].includes(p.role)).length + (S.counters.jail || 0) + (S.flags.divorced ? 1 : 0) + (S.illnesses.length ? 1 : 0);
      const p2 = U.clamp(0.25 + drama * 0.12, 0.25, 0.85);
      if (Math.random() < p2) { const g = Math.round((f0 * 0.18 + U.randi(2000, 15000) * k) * satur(f0)); s.followers += g; S.karma = r100(S.karma + 2); addStat('happy', 6, deltas); text = 'Bạn kể lại những năm tháng khó khăn nhất đời mình. Hàng chục nghìn bình luận động viên: “Cảm ơn vì đã sống tiếp”. +' + fmtF(g) + ' theo dõi.'; tone = 'good'; mood = 2; fx = 'hearts'; anim = 'cry'; addPost('🕯️', 'Chuyện chưa kể về tôi', g * 12, g * 2.5, { viral: g > f0 * 0.15 }); }
      else { s.followers += Math.round(f0 * 0.01); addStat('happy', -2, deltas); text = 'Bạn dốc lòng kể chuyện đời mình, nhưng vài người lại bảo “kể khổ câu view”. Bạn hơi chạnh lòng.'; mood = -1; anim = 'sad'; addPost('🕯️', 'Tâm sự đêm khuya', f0 * 0.5, f0 * 0.03); }
      loc = 'bedroom';
    } else if (id === 'challenge') {
      const p2 = U.clamp(0.45 + (S.stats.health - 50) / 120, 0.2, 0.85);
      if (Math.random() < p2) { const g = Math.round((f0 * 0.15 + U.randi(1500, 12000) * k) * satur(f0)); s.followers += g; addStat('happy', 6, deltas); text = U.pick(['Thử thách ăn 20 trái ớt cay nhất thế giới', 'Thử thách 24 giờ sống trong ô tô', 'Nhảy cầu từ độ cao 10 mét', 'Thử thách chạy 42 km không nghỉ']) + ': thành công! Clip triệu view, +' + fmtF(g) + ' theo dõi.'; tone = 'good'; fx = 'fireworks'; anim = 'cheer'; mood = 2; addPost('🔥', 'Thử thách cực đại', g * 25, g * 3, { viral: true }); }
      else { addStat('health', -U.randi(6, 14), deltas); s.followers = Math.round(f0 * 0.97); text = 'Thử thách thất bại, bạn phải vào viện cấp cứu. Cư dân mạng chê “câu view bất chấp”.'; tone = 'bad'; anim = 'sick'; fx = 'tears'; mood = -2; addPost('🔥', 'Thử thách thất bại', f0 * 2, f0 * 0.05, { flop: true }); loc = 'hospital'; }
    } else if (id === 'review') {
      const honest = Math.random() < 0.75;
      if (honest) { const g = grow(80, 0.04); s.followers += g; S.karma = r100(S.karma + 1); text = 'Bài review thật lòng của bạn được chia sẻ khắp các hội nhóm. Quán tốt đông khách hẳn, quán dở thì sửa sai. +' + fmtF(g) + ' theo dõi.'; tone = 'good'; mood = 1; addPost('⭐', 'Review không quảng cáo', g * 10, g * 1.5); }
      else { const fine = pay(U.rand(3e7, 1.5e8)); addMoney(-fine, deltas); addStat('happy', -6, deltas); text = 'Chủ quán bị chê kiện bạn tội xúc phạm danh dự. Hoà giải xong bạn mất ' + fmtMoney(fine) + ' và phải gỡ bài.'; tone = 'bad'; mood = -1; addPost('⭐', 'Review (đã gỡ)', f0 * 0.8, f0 * 0.05, { flop: true }); }
      loc = 'cafe'; anim = 'eat';
    } else if (id === 'live') {
      const earn = Math.round(Math.min(5e8, f0 * U.rand(15, 120) * k) / 1e4) * 1e4, cost = Math.round(earn * 0.4);
      addMoney(earn - cost, deltas); addStat('health', -1, deltas); s.followers += Math.round(f0 * U.rand(0, 0.05));
      text = 'Livestream 4 tiếng, khàn cả giọng. Doanh thu ' + fmtMoney(earn) + ', trừ tiền hàng và phí sàn còn lãi ' + fmtMoney(earn - cost) + '.'; anim = 'talk'; fx = 'money'; loc = 'bedroom';
      addPost('🔴', 'Live xả kho giá sốc', f0 * U.rand(0.3, 1.5), f0 * 0.05);
    } else if (id === 'drama') {
      if (Math.random() < 0.5) { const g = Math.round((f0 * 0.2 + U.randi(3000, 20000)) * satur(f0)); s.followers += g; S.karma = r100(S.karma - 4); text = 'Bạn tung loạt bằng chứng bóc phốt “' + U.pick(KOL_NAMES) + '”. Cả mạng xã hội hóng, +' + fmtF(g) + ' theo dõi. Nhưng bạn cũng có thêm kẻ thù.'; tone = 'neutral'; mood = 0; fx = 'anger'; addPost('🍿', 'Sự thật về ' + U.pick(KOL_NAMES), g * 30, g * 4, { viral: true }); }
      else { s.followers = Math.round(f0 * 0.78); s.scandals++; const fine = pay(U.rand(1e8, 5e8)); addMoney(-fine, deltas); addStat('happy', -10, deltas); text = 'Đối phương tung bằng chứng ngược lại, bạn thành kẻ vu khống. Bị kiện, đền ' + fmtMoney(fine) + ' và mất 22% người theo dõi.'; tone = 'bad'; mood = -3; anim = 'facepalm'; addPost('🍿', 'Bóc phốt (bị phản dame)', f0 * 3, f0 * 0.1, { flop: true }); }
      loc = 'bedroom';
    } else if (id === 'collab') {
      const g = grow(500, 0.08); s.followers += g; addStat('happy', 4, deltas); const kol = U.pick(KOL_NAMES); text = 'Video collab với ' + kol + ' giúp hai kênh “đổi fan” cho nhau: +' + fmtF(g) + ' theo dõi.'; tone = 'good'; mood = 1; anim = 'laugh'; addPost('🤝', 'Collab cùng ' + kol, g * 15, g * 2); loc = 'cafe';
    } else if (id === 'charity') {
      const raised = Math.round(f0 * U.rand(2000, 9000) / 1e5) * 1e5; addStat('happy', 4, deltas); S.karma = r100(S.karma + 6); deltas.karma = 6;
      if (S.karma < 55 && Math.random() < 0.35) { s.scandals++; s.followers = Math.round(s.followers * 0.7); text = 'Bạn kêu gọi được ' + fmtMoney(raised) + '… rồi cộng đồng mạng đòi sao kê vì nghi bạn ăn chặn. Mất 30% người theo dõi.'; mood = -3; tone = 'bad'; }
      else { s.followers += Math.round(f0 * 0.05); text = 'Bạn kêu gọi được ' + fmtMoney(raised) + ' cho bà con vùng lũ, sao kê minh bạch từng đồng. Cộng đồng nể phục.'; mood = 2; }
      fx = 'hearts'; loc = 'countryside'; addPost('💝', 'Chung tay vì miền Trung', f0 * 2, f0 * 0.2);
    } else if (id === 'course') {
      // khoá học: fan mua thật rất ít, càng ra nhiều khoá càng ế và càng dễ bị chê "lùa gà"
      const nc = s.courses = (s.courses || 0) + 1, price = U.pick([299e3, 499e3, 999e3]);
      const buyers = Math.round(f0 * U.rand(0.0004, 0.0018) * Math.min(k, 1.4) * satur(f0) * Math.pow(0.55, nc - 1));
      const cost = pay(U.rand(3e7, 1.2e8) + buyers * 4e4), rev = buyers * price;
      if (Math.random() < Math.max(0.35, 0.75 - (nc - 1) * 0.12)) { const net = pay(rev * 0.6) - cost; addMoney(net, deltas); text = 'Khoá học online của bạn có ' + buyers.toLocaleString('vi-VN') + ' học viên. Trừ 40% phí nền tảng, thuế và ' + fmtMoney(cost) + ' quay dựng, chạy quảng cáo, bạn ' + (net >= 0 ? 'lãi ' + fmtMoney(net) : 'lỗ ' + fmtMoney(-net)) + '.' + (nc > 1 ? ' Khoá thứ ' + nc + ' nên fan mua ít hơn hẳn.' : ''); tone = net > 0 ? 'good' : 'bad'; fx = net > 0 ? 'money' : null; }
      else { const net = pay(rev * 0.15) - cost; addMoney(net, deltas); s.scandals++; s.followers = Math.round(f0 * 0.8); text = 'Học viên chê khoá học “lùa gà”, đòi hoàn tiền tập thể và đăng bài tố khắp hội nhóm. Sau khi hoàn tiền, bạn ' + (net >= 0 ? 'chỉ còn ' + fmtMoney(net) : 'lỗ ' + fmtMoney(-net)) + ', mất 20% người theo dõi.'; tone = 'bad'; mood = -2; }
      anim = 'talk'; loc = 'bedroom'; addPost('🎓', 'Ra mắt khoá học “Từ số 0 đến chuyên gia”', f0 * 0.8, f0 * 0.04);
    } else if (id === 'brand') {
      if (s.brand) { const rev = pay(Math.min(3e9, f0 * U.rand(30, 120) * Math.min(k, 1.4) * satur(f0))); addMoney(rev, deltas); text = 'Bạn tung bộ sưu tập mới của ' + s.brand + '. Fan săn đơn, doanh thu đợt này ' + fmtMoney(rev) + '.'; tone = 'good'; fx = 'money'; }
      else { const cost = 2e9; if (S.money < cost) { S.yearActs.soc--; return fail('Cần ' + fmtMoney(cost) + ' vốn để ra mắt thương hiệu.'); } addMoney(-cost, deltas); s.brand = U.pick(['Nhà ', 'Tiệm ', 'Studio ', '']) + P().firstName + ' ' + U.pick(['Beauty', 'Food', 'Store', 'Official', 'House']); text = 'Bạn đầu tư ' + fmtMoney(cost) + ' ra mắt thương hiệu riêng “' + s.brand + '”. Từ nay mỗi năm thương hiệu tự mang về doanh thu theo lượng fan.'; tone = 'milestone'; fx = ['fireworks', 'money']; anim = 'cheer'; }
      addPost('🏷️', 'Ra mắt ' + (s.brand || 'thương hiệu'), f0 * 1.2, f0 * 0.1); loc = 'studio';
    } else { s.followers = Math.round(f0 * 0.9); addStat('happy', 6, deltas); addStat('health', 2, deltas); text = 'Bạn xóa app một tháng, ngủ đủ giấc, đọc được hai cuốn sách. Mất ít người theo dõi nhưng tinh thần nhẹ hẳn.'; anim = 'sit'; fx = 'zzz'; loc = 'home'; }
    // kênh giang hồ mạng: nội dung phản cảm dễ bị phạt hành chính, khoá kênh; hút “đệ tử” lẫn anti-fan
    if (n && n.id === 'giangho' && id !== 'detox' && id !== 'charity' && Math.random() < 0.22) { s.followers = Math.round(s.followers * 0.82); S.karma = r100(S.karma - 4); addMoney(-7500000, deltas); s.scandals++; text += ' 🚨 Clip bị báo cáo hàng loạt: bạn bị phạt hành chính 7,5 triệu vì nội dung phản cảm, kênh bị bóp tương tác.'; tone = 'bad'; mood = -2; }
    else if (n && n.id === 'giangho' && id !== 'detox') S.karma = r100(S.karma - 1);
    genComments(id === 'detox' ? 1 : 3, mood);
    if (id !== 'detox' && Math.random() < 0.4) genInbox(1);
    deltas.followers = s.followers - f0;
    addLog('MXH: ' + text, tone || toneOf(deltas), a.icon); checkProgress(); changed();
    // sự cố bất ngờ trên sóng live (chỉ khi đang phát trực tiếp)
    if (id === 'live' && Math.random() < 0.18 && S.pending.length < 3) { const ev = liveEvent('ms_live_suco'); if (ev) S.pending.push(ev); }
    return result({ title: a.icon + ' ' + a.label, icon: a.icon, text, tone: tone || toneOf(deltas), deltas, scene: sceneFor(loc, { anim, fx }), live: id === 'live' });
  }
  function socialOffer(offerId, accept) {
    const s = soc(), i = s.offers.findIndex((o) => o.id === offerId); if (i < 0) return fail('Lời mời đã hết hạn.');
    const o = s.offers.splice(i, 1)[0], deltas = {};
    if (!accept) { changed(); return result({ title: 'Từ chối ' + o.brand, icon: '✋', text: o.shady ? 'Bạn từ chối quảng cáo ' + o.item + '. Tiền thì tiếc, nhưng lương tâm thì nhẹ.' : 'Bạn lịch sự từ chối lời mời của ' + o.brand + '.', tone: 'neutral', deltas: o.shady ? { karma: 0 } : {} }); }
    const net = Math.round(o.pay * 0.9); addMoney(net, deltas);
    let text = 'Bạn nhận quảng cáo ' + o.item + ' cho ' + o.brand + ', cát-xê ' + fmtMoney(o.pay) + ' (sau thuế ' + fmtMoney(net) + ').';
    if (o.shady) { S.karma = r100(S.karma - 8); deltas.karma = -8; s.shadyDeals = (s.shadyDeals || 0) + 1; text += ' Tiền về nhanh, nhưng bình luận bắt đầu có người hỏi: “Sản phẩm này có giấy phép không?”'; genComments(2, -2); }
    else s.followers = Math.round(s.followers * U.rand(0.98, 1.02));
    addLog('MXH: ' + text, o.shady ? 'bad' : 'good', '🤝'); changed();
    return result({ title: 'Hợp đồng quảng cáo', icon: '🤝', text, tone: o.shady ? 'bad' : 'good', deltas, scene: sceneFor('cafe', { anim: 'phone', fx: 'money' }) });
  }
  // biến cố MXH: bị hack, giải thưởng, cà khịa, phát ngôn cũ bị đào, bị quay lén thành meme
  const SOCF = (k) => { const s = soc(); const f0 = s.followers; return { s, f0 }; };
  const SOC_EV = {
    ms_soc_hack: (k) => {
      const { s, f0 } = SOCF(), p = U.clamp(0.4 + (S.stats.smarts - 50) / 120, 0.15, 0.85), ransom = pay(Math.max(2e7, f0 * 30));
      if (k === 'ht') return { key: k, label: '🛠️ Gửi yêu cầu hỗ trợ, chứng minh chính chủ', mini: 'quiz', odds: () => p, fn: () => miniWin(p)
        ? { text: 'Sau ba ngày gửi giấy tờ, bạn lấy lại được tài khoản, xoá hết bài quảng cáo cờ bạc kẻ gian đăng.', effects: { happy: 2 }, scene: { loc: 'bedroom', anim: 'cheer' }, tone: 'good' }
        : (s.followers = Math.round(f0 * 0.5), { text: 'Hỗ trợ trả lời bằng thư tự động. Kẻ gian dùng kênh của bạn lừa fan chuyển tiền, rồi kênh bị khoá vĩnh viễn. Bạn lập kênh mới, chỉ một nửa fan quay lại.', effects: { happy: -14 }, scene: { loc: 'bedroom', anim: 'cry', fx: 'tears' }, tone: 'bad' }) };
      if (k === 'chuoc') return { key: k, label: '💸 Trả tiền chuộc cho hacker (' + fmtMoney(ransom) + ')', fn: () => Math.random() < 0.6
        ? { text: 'Hacker trả lại mật khẩu thật. Bạn mất tiền nhưng giữ được kênh.', effects: { money: -ransom, happy: -5 }, scene: { loc: 'bedroom', anim: 'shrug' }, tone: 'neutral' }
        : (s.followers = Math.round(f0 * 0.55), { text: 'Nhận tiền xong hacker… đòi thêm, rồi bán kênh của bạn cho người khác. Mất cả tiền lẫn kênh.', effects: { money: -ransom, happy: -15 }, scene: { loc: 'bedroom', anim: 'cry' }, tone: 'bad' }) };
      return { key: 'moi', label: '🆕 Bỏ, lập kênh mới từ đầu', fn: () => { s.followers = Math.round(f0 * 0.35); return { text: 'Bạn lập kênh mới, kêu gọi fan chuyển sang. Chỉ khoảng một phần ba theo kịp.', effects: { happy: -8 }, scene: { loc: 'bedroom', anim: 'sad' }, tone: 'bad' }; } };
    },
    ms_soc_award: (k) => {
      const { s, f0 } = SOCF(), p = U.clamp(0.5 + (S.stats.looks - 50) / 150 + (S.stats.smarts - 50) / 200, 0.2, 0.85);
      if (k === 'len') return { key: k, label: '🏆 Lên nhận giải, phát biểu', mini: 'interview', odds: () => p, fn: () => miniWin(p)
        ? (s.followers = Math.round(f0 * 1.1), unlockSafe('kol_award'), { text: 'Bài phát biểu ngắn mà xúc động của bạn được cắt thành clip triệu view. “KOL của năm” — danh hiệu xứng đáng.', effects: { happy: 12 }, scene: { loc: 'studio', time: 'night', anim: 'cheer', fx: ['confetti', 'stars'] }, tone: 'milestone' })
        : { text: 'Bạn run quá, nói vấp liên tục, còn quên cảm ơn mẹ. Clip “phát biểu thảm hoạ” thành meme.', effects: { happy: -4 }, scene: { loc: 'studio', time: 'night', anim: 'facepalm' }, tone: 'bad' } };
      return { key: 'vang', label: '🙈 Không đến, nhờ người nhận hộ', fn: () => ({ text: 'Bạn vẫn có giải, nhưng khán giả tiếc vì không được thấy bạn trên sân khấu.', effects: { happy: 4 }, scene: { loc: 'home', anim: 'phone' } }) };
    },
    ms_soc_beef: (k) => {
      const { s, f0 } = SOCF(), kol = U.pick(KOL_NAMES);
      if (k === 'dap') return { key: k, label: '🎬 Làm clip đáp trả cực gắt', fn: () => Math.random() < 0.5
        ? (s.followers = Math.round(f0 * 1.15), { text: 'Clip đáp trả của bạn thông minh, hài hước, dân mạng đứng hẳn về phía bạn. ' + kol + ' phải xoá bài.', effects: { happy: 6, karma: -2 }, scene: { loc: 'bedroom', anim: 'laugh', fx: 'stars' }, tone: 'good' })
        : (s.followers = Math.round(f0 * 0.85), s.scandals++, { text: 'Cuộc chiến leo thang, hai bên tung ảnh đời tư của nhau. Cả hai cùng mất fan, nhãn hàng tránh xa.', effects: { happy: -10, karma: -4 }, scene: { loc: 'bedroom', anim: 'angry', fx: 'anger' }, tone: 'bad' }) };
      if (k === 'hoa') return { key: k, label: '🤝 Chủ động làm lành, rủ collab', fn: () => { s.followers = Math.round(f0 * 1.06); return { text: 'Bạn nhắn riêng xin làm hoà, rồi hai người làm hẳn một video “giải hoà”. Fan hai bên đều vui.', effects: { happy: 5, karma: 3 }, scene: { loc: 'cafe', anim: 'hug' }, tone: 'good' }; } };
      return { key: 'im', label: '🤐 Im lặng, không phản hồi', fn: () => { s.followers = Math.round(f0 * 0.97); return { text: 'Bạn im lặng. Drama tự nguội sau một tuần, bạn mất ít fan nhưng giữ được hình ảnh.', effects: { happy: -2 }, scene: { loc: 'home', anim: 'idle' } }; } };
    },
    ms_soc_cancel: (k) => {
      const { s, f0 } = SOCF();
      if (k === 'xl') return { key: k, label: '🙇 Đăng clip xin lỗi chân thành', fn: () => { s.followers = Math.round(f0 * 0.9); return { text: 'Bạn nhận lỗi, không biện minh. Một phần người xem bỏ đi, nhưng đa số chấp nhận lời xin lỗi.', effects: { happy: -5, karma: 2 }, scene: { loc: 'bedroom', anim: 'bow' }, tone: 'neutral' }; } };
      if (k === 'cai') return { key: k, label: '😤 Cãi lý: “Lúc đó tôi còn trẻ!”', fn: () => Math.random() < 0.35
        ? (s.followers = Math.round(f0 * 1.04), { text: 'Bất ngờ là nhiều người đồng cảm: ai mà chẳng từng nông nổi. Chuyện qua nhanh.', effects: { happy: 2 }, scene: { loc: 'bedroom', anim: 'talk' }, tone: 'good' })
        : (s.followers = Math.round(f0 * 0.62), s.scandals++, { text: 'Lời biện minh như đổ thêm dầu vào lửa. Nhãn hàng huỷ hợp đồng, bạn mất gần 40% người theo dõi.', effects: { happy: -14, money: -pct(0.03, 5e7) }, scene: { loc: 'bedroom', anim: 'cry', fx: 'tears' }, tone: 'bad' }) };
      return { key: 'lan', label: '🌫️ Lặn mất tăm một thời gian', fn: () => { s.followers = Math.round(f0 * 0.78); return { text: 'Bạn biến mất khỏi mạng. Sóng gió qua đi, nhưng người xem cũng quên dần bạn.', effects: { happy: 2, health: 2 }, scene: { loc: 'countryside', anim: 'sit' }, tone: 'neutral' }; } };
    },
    ms_soc_meme: (k) => {
      const { s, f0 } = SOCF();
      if (k === 'trend') return { key: k, label: '😎 Tận dụng, tự làm trend luôn', fn: () => { const g = Math.round((U.randi(5000, 60000) + f0 * 0.2) * satur(f0)); s.followers += g; return { text: 'Bạn đăng lại clip kèm câu “Vâng, người đó là tôi 🙃”. Cả nước cười, +' + fmtF(g) + ' theo dõi.', effects: { happy: 6 }, scene: { loc: 'street', anim: 'laugh', fx: 'stars' }, tone: 'good' }; } };
      return { key: 'go', label: '😡 Đòi người quay gỡ clip', fn: () => ({ text: 'Người quay gỡ clip, nhưng bản sao đã lan khắp nơi. Bạn bực mình mấy tuần.', effects: { happy: -5 }, scene: { loc: 'street', anim: 'angry' }, tone: 'bad' }) };
    },
  };
  const SOC_EV_DEF = {
    ms_soc_hack: ['Tài khoản bị hack', '🔓', 'Sáng ngủ dậy, bạn không đăng nhập được nữa. Kênh của bạn đang livestream… quảng cáo cờ bạc, kèm lời “nhắn riêng để nhận quà”.', { loc: 'bedroom', anim: 'scared', expr: 'scared', fx: 'exclaim', shot: 'dramatic' }, ['ht', 'chuoc', 'moi']],
    ms_soc_award: ['Đề cử KOL của năm', '🏆', 'Ban tổ chức gửi thư mời: bạn lọt top 5 “Nhà sáng tạo nội dung của năm”. Lễ trao giải truyền hình trực tiếp.', { loc: 'studio', time: 'night', anim: 'cheer', fx: 'sparkle' }, ['len', 'vang']],
    ms_soc_beef: ['Bị KOL khác cà khịa', '🥊', 'Một KOL nổi tiếng quay clip nhại lại bạn, kèm caption mỉa mai. Cả cộng đồng mạng đang chờ xem bạn phản ứng thế nào.', { loc: 'bedroom', anim: 'phone', expr: 'angry', fx: 'anger' }, ['dap', 'hoa', 'im']],
    ms_soc_cancel: ['Phát ngôn cũ bị đào lại', '⛏️', 'Ai đó đào lại bài viết từ nhiều năm trước của bạn — một câu nói vô duyên, giờ đọc lại thấy “toang” thật sự. Hashtag tẩy chay đang lên top.', { loc: 'bedroom', anim: 'scared', fx: 'sweat', shot: 'dramatic' }, ['xl', 'cai', 'lan']],
    ms_soc_meme: ['Bị quay lén thành meme', '🤳', 'Cảnh bạn trượt chân ngã sấp mặt ở chợ bị ai đó quay lại, ghép nhạc vui nhộn. Sáng nay nó đã có 3 triệu lượt xem.', { loc: 'market', anim: 'facepalm', fx: 'dust' }, ['trend', 'go']],
  };
  Object.keys(SOC_EV_DEF).forEach((id) => { const [title, icon, text, scene, keys] = SOC_EV_DEF[id]; ms({ id, title, icon, age: [13, 99], text, scene, choicesFn: () => keys.map(SOC_EV[id]), choiceByKey: SOC_EV[id] }); });
  // ================================================================== ĐỢT B: livestream PK · hội nhóm · app hẹn hò · mẹ chồng nàng dâu · kiểu nuôi con · ngoại tình lộ qua MXH
  // ---- 9. Livestream PK: đấu điểm quà tặng với một KOL khác
  function pkChoice(k) {
    const s = soc(), f = s.followers, foe = S.flags.pkFoe || 'Mây Review';
    const p = U.clamp(0.4 + Math.log10(Math.max(10, f)) * 0.03 + (S.stats.happy - 50) / 250 + (s.verified ? 0.05 : 0), 0.2, 0.85);
    if (k === 'fan') return { key: k, label: '📣 Kêu gọi fan “thả quà” dồn dập', mini: 'sprint', odds: () => p, fn: () => { const gift = pay(Math.max(2e6, f * U.rand(4, 14))); if (miniWin(p)) { s.followers += Math.round(f * U.rand(0.04, 0.1)); return { text: 'Phút cuối, fan cứng thả liền ba “vũ trụ”. Bạn thắng PK trước ' + foe + ', quà quy ra ' + fmtMoney(gift) + '. Đối thủ phải chịu phạt ăn trái ớt cay nhất thế giới trên sóng!', effects: { money: gift, happy: 8 }, scene: { loc: 'bedroom', anim: 'cheer', fx: ['confetti', 'money'] }, tone: 'good' }; } s.followers = Math.round(f * 0.98); return { text: foe + ' lội ngược dòng giây cuối. Bạn thua, phải chịu phạt bôi son đỏ chót livestream thêm một tiếng. Vẫn nhận được ' + fmtMoney(Math.round(gift / 3)) + ' quà.', effects: { money: Math.round(gift / 3), happy: -3 }, scene: { loc: 'bedroom', anim: 'facepalm' }, tone: 'neutral' }; } };
    if (k === 'drama') return { key: k, label: '😭 Diễn drama khóc lóc xin quà', fn: () => Math.random() < 0.45 ? (s.followers += Math.round(f * 0.05), { text: 'Giọt nước mắt “đúng lúc” khiến fan mềm lòng, quà đổ về như mưa. Bạn thắng — dù trong lòng hơi ngượng.', effects: { money: pay(f * U.rand(6, 16)), karma: -2, happy: 3 }, scene: { loc: 'bedroom', anim: 'cry', fx: 'money' }, tone: 'neutral' }) : (s.followers = Math.round(f * 0.9), s.scandals++, { text: 'Có người cắt clip bạn vừa khóc vừa liếc màn hình đếm quà. Cả mạng gọi bạn là “diễn viên hạng A”.', effects: { happy: -8, karma: -3 }, scene: { loc: 'bedroom', anim: 'facepalm', fx: 'anger' }, tone: 'bad' }) };
    return { key: 'vui', label: '😄 Chơi cho vui, chủ động nhận phạt', fn: () => { s.followers += Math.round(f * 0.02); return { text: 'Bạn thua vui vẻ, chịu phạt nhảy “con công” trên sóng. Fan cười ngặt nghẽo, khen bạn dễ thương.', effects: { happy: 5 }, scene: { loc: 'bedroom', anim: 'dance', fx: 'music' }, tone: 'good' }; } };
  }
  ms({ id: 'ms_soc_pk', title: 'Livestream PK', icon: '⚔️', age: [13, 99], live: true,
    text: 'Bạn mở phiên PK với một KOL khác: 5 phút, bên nào nhận nhiều quà hơn thì thắng, bên thua chịu phạt. Thanh điểm đang ngang ngửa, chat chạy như thác.',
    scene: { loc: 'bedroom', anim: 'talk', fx: 'music' },
    choicesFn: () => ['fan', 'drama', 'vui'].map(pkChoice), choiceByKey: pkChoice });

  // ---- các buổi LIVESTREAM (chỉ những tình huống này mới bật khung bình luận trực tiếp)
  const LIVE_EV = { qa: 'ms_live_qa', khuya: 'ms_live_khuya', giangho: 'ms_live_giangho' };
  const LIVE_Q = [
    ['Lương tháng bao nhiêu vậy? Kể thật đi!', 'money'], ['Có người yêu chưa? Cho xem mặt đi!', 'love'], ['Sao dạo này tăng cân thế 🐷', 'body'],
    ['Phốt năm ngoái là thật hay giả?', 'scandal'], ['Bí quyết làm giàu là gì vậy idol?', 'tip'], ['Hát một bài đi mà!', 'sing'], ['Ghét ai nhất trong giới KOL?', 'drama'],
  ];
  const SUCO = ['Đang live thì mẹ bạn mặc đồ ngủ đi ngang, hét to: “Ăn cơm! Live live suốt ngày!”', 'Đang live thì cả khu mất điện, màn hình tối om giữa lúc hàng nghìn người đang xem.', 'Camera vô tình quay trúng căn phòng bừa bộn như bãi chiến trường, cả chat cười rần rần.', 'Con mèo nhảy lên bàn phím, bấm nhầm… tắt mic giữa lúc bạn đang nói hăng say.'];
  function liveEvent(id, after) {
    const ev = instantiate(MS[id]); if (!ev) return null;
    // xảy ra SAU buổi live (đã tắt máy): không bật khung chat livestream nữa
    if (after) { ev.live = false; if (id === 'ms_live_giangho') ev.text = 'Buổi live hôm trước bạn lỡ đụng chạm một “giang hồ mạng” đông fan. Giờ hắn livestream chửi bạn, kêu gọi “anh em” vào trang cá nhân của bạn chửi bới, nhắn tin đe doạ.'; }
    if (id === 'ms_live_qa') { const q = U.pick(LIVE_Q); S.flags.liveQ = q[1]; ev.text = 'Bạn mở live trò chuyện. Người xem hỏi dồn dập, câu được thả tim nhiều nhất là: “' + q[0] + '”'; }
    if (id === 'ms_live_suco') ev.text = U.pick(SUCO);
    if (id === 'ms_live_giangho') S.flags.ghMet = S.year;
    return ev;
  }
  const liveFol = (k) => { const s = soc(); s.followers = Math.max(0, Math.round(s.followers * k)); };
  ms({ id: 'ms_live_qa', title: 'Livestream trả lời câu hỏi', icon: '🎙️', age: [13, 99], live: true, text: 'Bạn mở live trò chuyện với người xem.',
    scene: { loc: 'bedroom', anim: 'talk', fx: 'question' },
    choices: [
      { label: '😇 Trả lời thật lòng', fn: () => { const q = S.flags.liveQ; if (q === 'sing') return Math.random() < 0.5 ? (liveFol(1.06), { text: 'Bạn cầm micro hát luôn một bài. Giọng không hay nhưng rất có tâm, chat thả tim kín màn hình.', effects: { happy: 6 }, scene: { anim: 'sing', fx: 'music' }, tone: 'good' }) : (liveFol(0.99), { text: 'Bạn hát lạc tông từ câu đầu. Clip “thảm hoạ âm nhạc” bị cắt ra lan khắp nơi — nhưng ít ra ai cũng cười.', effects: { happy: 1 }, scene: { anim: 'sing', fx: 'sweat' }, tone: 'neutral' }); return Math.random() < 0.62 ? (liveFol(1.05), { text: 'Bạn trả lời thẳng thắn, không màu mè. Người xem khen bạn “thật quá trời”, lượng theo dõi tăng.', effects: { happy: 4, karma: 1 }, scene: { anim: 'laugh' }, tone: 'good' }) : (liveFol(0.95), { text: 'Câu trả lời thật lòng bị cắt ghép, giật tít câu view. Bạn mất một ít fan vì “nói quá thật”.', effects: { happy: -5 }, scene: { anim: 'facepalm' }, tone: 'bad' }); } },
      { label: '😏 Né khéo, đổi chủ đề', fn: () => { liveFol(1.01); return { text: 'Bạn cười cười, khéo léo lái sang chuyện khác. Không ai giận, cũng chẳng ai nhớ.', effects: { happy: 1 }, scene: { anim: 'shrug' }, tone: 'neutral' }; } },
      { label: '🤡 Troll lại người hỏi', fn: () => Math.random() < 0.5 ? (liveFol(1.08), { text: 'Câu đáp “cà khịa” của bạn khiến cả chat cười lăn, clip được cắt lên xu hướng.', effects: { happy: 5 }, scene: { anim: 'laugh', fx: 'stars' }, tone: 'good' }) : (liveFol(0.93), { text: 'Người hỏi là fan lâu năm, bị troll thì tự ái, quay sang bóc phốt bạn “thái độ”.', effects: { happy: -6 }, scene: { anim: 'facepalm' }, tone: 'bad' }) }
    ] });
  ms({ id: 'ms_live_giangho', title: 'Giang hồ mạng', icon: '🥊', age: [16, 99], live: true,
    text: 'Một “giang hồ mạng” đông fan livestream chửi bạn, kêu gọi “anh em” tràn vào phá live của bạn. Khung chat ngập lời tục tĩu, đe doạ.',
    scene: { loc: 'bedroom', anim: 'angry', expr: 'angry', fx: 'anger', shot: 'dramatic' },
    choices: [
      { label: '🤬 Chửi lại cho “máu”', fn: () => { if (Math.random() < 0.45) { liveFol(0.8); return { text: 'Hai bên văng tục suốt hai tiếng, view tăng vọt… rồi cơ quan chức năng vào cuộc. Bạn bị phạt hành chính vì phát ngôn thô tục trên mạng, kênh bị khoá 30 ngày.', effects: { money: -7500000, karma: -6, happy: -8 }, scene: { anim: 'scared', npcs: [{ role: 'police', anim: 'point' }] }, tone: 'bad' }; } liveFol(1.15); return { text: 'Màn “khẩu chiến” hút hàng chục nghìn người xem. Bạn nổi hơn hẳn — nhưng hình ảnh cũng “giang hồ” hơn hẳn.', effects: { karma: -5, happy: 2 }, scene: { anim: 'angry', fx: 'anger' }, tone: 'neutral' }; } },
      { label: '👊 Hẹn ra “solo” ngoài đời', mini: 'fight', odds: () => U.clamp(0.35 + (S.stats.health - 50) / 120, 0.15, 0.75), fn: () => miniWin(U.clamp(0.35 + (S.stats.health - 50) / 120, 0.15, 0.75)) ? (liveFol(1.1), { text: 'Bạn thắng trận “solo” trước ống kính của cả chục người quay. Chưa kịp ăn mừng thì cả hai bị công an phường mời lên làm việc vì gây rối trật tự.', effects: { money: -5000000, karma: -4, happy: 2, health: -4 }, scene: { loc: 'street', anim: 'box', npcs: [{ role: 'police', anim: 'point' }] }, tone: 'neutral' }) : (liveFol(0.9), { text: 'Gã giang hồ mạng mang theo cả đám đệ. Bạn bị đánh bầm dập, clip bị tung lên kèm dòng “dạy dỗ thành công”.', effects: { health: -14, happy: -12 }, scene: { loc: 'street', anim: 'fall', fx: 'dust' }, tone: 'bad' }) },
      { label: '🗣️ Mời lên live đối chất văn minh', mini: 'interview', odds: () => U.clamp(0.4 + (S.stats.smarts - 50) / 130, 0.15, 0.8), fn: () => miniWin(U.clamp(0.4 + (S.stats.smarts - 50) / 130, 0.15, 0.8)) ? (liveFol(1.12), { text: 'Bạn bình tĩnh đưa lý lẽ, không văng một câu tục nào. Gã giang hồ mạng cứng họng, cộng đồng mạng quay sang khen bạn “văn minh, đẳng cấp”.', effects: { happy: 8, karma: 4 }, scene: { anim: 'talk', fx: 'stars' }, tone: 'good' }) : (liveFol(0.95), { text: 'Đối phương cắt ghép đoạn bạn lúng túng, tung lên “vạch mặt”. Bạn mất ngủ mấy đêm.', effects: { happy: -6 }, scene: { anim: 'facepalm' }, tone: 'bad' }) },
      { label: '🚫 Chặn và báo cáo', fn: () => { liveFol(0.98); return { text: 'Bạn chặn hàng loạt tài khoản và gửi báo cáo. Vài ngày sau mọi chuyện lắng xuống.', effects: { karma: 2, happy: -2 }, scene: { anim: 'phone' }, tone: 'neutral' }; } }
    ] });
  ms({ id: 'ms_live_khuya', title: 'Live tâm sự đêm khuya', icon: '🌙', age: [16, 99], live: true,
    text: 'Một giờ sáng, bạn mở live tâm sự nhẹ nhàng. Giữa những dòng chat vui, một bạn nhắn: “Em mệt mỏi quá, không muốn cố gắng nữa…”',
    scene: { loc: 'bedroom', time: 'night', anim: 'sit', fx: 'question' },
    choices: [
      { label: '🤍 Dừng lại, nói chuyện với bạn ấy thật nhẹ nhàng', fn: () => { liveFol(1.06); return { text: 'Bạn gác mọi thứ, trò chuyện với bạn ấy suốt nửa tiếng, khuyên hãy nói với người thân và tìm tới chuyên gia tâm lý. Cả phòng live cùng gửi lời động viên. Sáng hôm sau bạn nhận tin nhắn: “Cảm ơn anh/chị, em ổn hơn rồi.”', effects: { karma: 8, happy: 6 }, scene: { anim: 'talk', fx: 'hearts' }, tone: 'good' }; } },
      { label: '🛒 Lướt qua, tiếp tục giới thiệu sản phẩm', fn: () => { liveFol(0.96); return { text: 'Bạn lướt qua tin nhắn để chốt đơn. Vài người xem lặng lẽ thoát live, có người chụp màn hình trách bạn vô tâm.', effects: { karma: -4, happy: -3, money: 3000000 }, scene: { anim: 'phone' }, tone: 'bad' }; } }
    ] });
  ms({ id: 'ms_live_suco', title: 'Sự cố trên sóng live', icon: '😱', age: [13, 99], live: true, text: 'Sự cố bất ngờ giữa lúc đang livestream!',
    scene: { loc: 'bedroom', anim: 'scared', expr: 'scared', fx: 'exclaim' },
    choices: [
      { label: '😂 Cười trừ, biến sự cố thành content', fn: () => { const s = soc(), g = Math.round((U.randi(300, 8000) + s.followers * 0.04) * satur(s.followers)); s.followers += g; return { text: 'Bạn cười ngặt nghẽo, tự trêu chính mình. Đoạn sự cố được cắt ra thành clip hài, thêm ' + fmtF(g) + ' người theo dõi.', effects: { happy: 5 }, scene: { anim: 'laugh', fx: 'stars' }, tone: 'good' }; } },
      { label: '🙈 Tắt live ngay lập tức', fn: () => { liveFol(0.99); return { text: 'Bạn bấm tắt live, mặt đỏ bừng. Lần sau nhất định khoá cửa phòng.', effects: { happy: -2 }, scene: { anim: 'facepalm' }, tone: 'neutral' }; } }
    ] });

  // ================================================================== KÌNH ĐỊCH NỔI TIẾNG (drama kiểu “Rô – Si”, streamer đấu nhau, giang hồ mạng, diva đua top)
  // Tên nhân vật đều là tên nhại hư cấu. Mỗi đấu trường có một đối thủ cố định suốt đời, gặp nhau qua nhiều năm.
  const RIVAL_ARENAS = {
    bd: { name: 'Bóng đá', icon: '⚽', nicks: ['Xi Lùn', 'Rô Đen', 'Ney Tóc Xù', 'Mbap Tốc Độ', 'Ha Lăng Máy Ủi'], cond: () => S.job && S.job.id === 'cauthu' && S.job.level >= 1 },
    gm: { name: 'Game – stream', icon: '🎮', nicks: ['Hi Mát', 'Su Bi Pi', 'Rồng Lửa TV', 'Bé Chanh Gaming', 'Độc Cô Cầu Bại'], cond: () => (S.job && ['esports', 'streamer'].includes(S.job.id)) || (S.social && S.social.niche === 'gaming' && S.social.followers >= 20000) },
    gh: { name: 'Giang hồ mạng', icon: '🥊', nicks: ['Thầy Huân Hoa Giấy'], cond: () => S.social && socOpen() && (S.social.niche === 'giangho' || (S.social.followers >= 30000 && S.flags.ghMet)) },
    ms: { name: 'Âm nhạc', icon: '🎤', nicks: ['Nữ hoàng Tóp Tóp', 'Hoàng tử Ballad Lê Ken', 'Diva Mì Tôm'], cond: () => S.job && S.job.id === 'casi' && S.job.level >= 1 },
  };
  function rivalOf(ar) {
    S.rivals = S.rivals || {};
    if (!S.rivals[ar]) { const A = RIVAL_ARENAS[ar], g = U.pick(['m', 'f']), nm = D.randomName(g); S.rivals[ar] = { nick: U.pick(A.nicks), name: nm.firstName, gender: g, me: 0, them: 0, since: S.year }; }
    return S.rivals[ar];
  }
  const RV = (ar) => rivalOf(ar).nick;
  const fanBoost = (k) => { if (S.social) S.social.followers = Math.max(0, Math.round(S.social.followers * k + (k > 1 ? 500 : 0))); };
  const rvScore = (ar, win) => { const r = rivalOf(ar); if (win) r.me++; else r.them++; };
  // mỗi tình huống: [id, đấu trường, tiêu đề, mô tả (§R = tên đối thủ), cảnh, các lựa chọn (hàm trả về kết quả)]
  const RIVAL_EV = [
    ['ms_rv_bd_derby', 'bd', 'Siêu kinh điển: đối đầu §R', 'Cả thế giới chờ trận này: bạn đối đầu §R — kình địch của cả sự nghiệp. Phút 89, tỷ số 1-1, trọng tài chỉ tay vào chấm phạt đền cho đội bạn.', { loc: 'stadium', time: 'night', anim: 'kick', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'flash', shot: 'dramatic' }, [
      { label: '⚽ Tự mình sút quả quyết định', mini: 'penalty', odds: () => U.clamp(0.45 + (S.stats.health - 50) / 150, 0.2, 0.85), fn: () => { const p = U.clamp(0.45 + (S.stats.health - 50) / 150, 0.2, 0.85); if (miniWin(p)) { rvScore('bd', true); fanBoost(1.12); if (S.job) S.job.perf = r100(S.job.perf + 10); return { text: 'Bóng găm thẳng góc cao! Bạn chạy về phía khán đài, làm động tác “im lặng” ngay trước mặt §R. Bức ảnh ấy lên trang nhất toàn thế giới.', effects: { happy: 12 }, scene: { anim: 'cheer', fx: ['confetti', 'fireworks'] }, tone: 'milestone' }; } rvScore('bd', false); fanBoost(0.97); return { text: 'Thủ môn đổ đúng hướng. Phút bù giờ §R ghi bàn quyết định rồi chạy tới… vỗ vai bạn. Đau hơn cả thua.', effects: { happy: -10 }, scene: { anim: 'sad', fx: 'tears' }, tone: 'bad' }; } },
      { label: '🤝 Nhường đồng đội sút', fn: () => ({ text: 'Đồng đội sút thành công, đội bạn thắng. Báo chí khen bạn “vì tập thể”, còn fan §R thì chế ảnh bạn “sợ trách nhiệm”.', effects: { happy: 4, karma: 2 }, scene: { anim: 'clap' }, tone: 'neutral' }) }]],
    ['ms_rv_bd_fanwar', 'bd', 'Fan hai phe khẩu chiến', 'Hashtag #GOAT chia đôi cõi mạng: phe bạn và phe §R chửi nhau từ bình luận đến hội nhóm, có người còn hẹn “ra sân vận động nói chuyện”.', { loc: 'bedroom', anim: 'phone', fx: 'anger' }, [
      { label: '🕊️ Đăng bài kêu gọi fan văn minh', fn: () => { fanBoost(1.03); return { text: 'Bài đăng “Chúng tôi là đối thủ trên sân, không phải kẻ thù” được chia sẻ hàng triệu lần. Cả §R cũng thả tim.', effects: { karma: 5, happy: 3 }, scene: { anim: 'nod', fx: 'hearts' }, tone: 'good' }; } },
      { label: '😏 Cà khịa thêm cho máu', fn: () => { fanBoost(1.1); return { text: 'Bạn đăng ảnh bàn chân trái kèm caption “có người tập cả đời không bằng”. Fan phe bạn hả hê, fan §R điên tiết. Lượt theo dõi tăng vọt.', effects: { karma: -4, happy: 5 }, scene: { anim: 'laugh', fx: 'anger' }, tone: 'neutral' }; } },
      { label: '🤐 Im lặng, tập trung đá bóng', fn: () => ({ text: 'Bạn tắt điện thoại, ra sân tập. Chuyện trên mạng rồi cũng qua.', effects: { happy: 1 }, scene: { anim: 'kick' } }) }]],
    ['ms_rv_bd_interview', 'bd', 'Câu hỏi muôn thuở', 'Họp báo trước trận, phóng viên hỏi thẳng: “Anh/chị nghĩ mình hay §R mới là người giỏi nhất?” Cả khán phòng nín thở.', { loc: 'office', anim: 'think', npcs: [{ role: 'crowd', anim: 'idle' }], fx: 'question' }, [
      { label: '😎 “Tôi là số một. Không có ai hơn.”', fn: () => { fanBoost(1.08); return { text: 'Câu nói tự tin của bạn thành meme toàn cầu. Fan mê bạn càng mê, anti-fan có thêm chuyện để chửi.', effects: { happy: 4, karma: -1 }, scene: { anim: 'point', fx: 'stars' }, tone: 'neutral' }; } },
      { label: '🙏 “Bóng đá là tập thể, §R rất giỏi.”', fn: () => { fanBoost(1.04); return { text: 'Câu trả lời khiêm tốn khiến cả §R cũng phải khen bạn trên trang cá nhân.', effects: { karma: 4, happy: 2 }, scene: { anim: 'bow', fx: 'hearts' }, tone: 'good' }; } },
      { label: '😂 “Hỏi câu khác đi anh ơi”', fn: () => ({ text: 'Cả khán phòng cười rần rần. Một câu né khéo mà ai cũng nhớ.', effects: { happy: 3 }, scene: { anim: 'laugh' } }) }]],
    ['ms_rv_bd_last', 'bd', 'Trận cuối cùng của hai huyền thoại', 'Bạn và §R đều đã ngoài ba mươi. Đây có lẽ là lần cuối hai người còn đối đầu trên sân cỏ.', { loc: 'stadium', time: 'dusk', anim: 'idle', npcs: [{ role: 'coworker', anim: 'hug' }], fx: 'sparkle' }, [
      { label: '👕 Đổi áo, ôm nhau giữa sân', fn: () => { fanBoost(1.06); return { text: 'Hai cựu kình địch đổi áo, ôm nhau rất lâu giữa sân. Cả sân vận động đứng dậy vỗ tay. Bức ảnh ấy được gọi là “cái kết đẹp nhất của bóng đá”.', effects: { happy: 12, karma: 5 }, scene: { anim: 'hug', fx: ['hearts', 'confetti'] }, tone: 'milestone' }; } },
      { label: '🔥 Đá hết mình để thắng lần cuối', mini: 'penalty', odds: () => 0.5, fn: () => miniWin(0.5) ? (rvScore('bd', true), { text: 'Bạn ghi bàn quyết định trong trận cuối. Thống kê đối đầu chung cuộc nghiêng về bạn — tranh cãi muôn đời có thêm lý lẽ.', effects: { happy: 10 }, scene: { anim: 'cheer', fx: 'fireworks' }, tone: 'good' }) : (rvScore('bd', false), { text: '§R thắng trận cuối. Bạn mỉm cười chạy tới bắt tay — có đối thủ như vậy cũng là may mắn.', effects: { happy: -2, karma: 3 }, scene: { anim: 'nod' }, tone: 'neutral' }) }]],
    ['ms_rv_gm_hack', 'gm', '§R tố bạn dùng hack', 'Streamer §R đăng clip “bằng chứng” bạn bắn xuyên tường, kéo tâm quá nhanh. Hai triệu lượt xem chỉ sau một đêm, bình luận ngập chữ “hack”.', { loc: 'bedroom', anim: 'gamepad', expr: 'angry', fx: 'anger', shot: 'dramatic' }, [
      { label: '🎥 Live quay tay, chơi trên máy lạ để chứng minh', mini: 'quiz', odds: () => U.clamp(0.45 + (S.stats.smarts - 50) / 140, 0.2, 0.85), fn: () => { if (miniWin(U.clamp(0.45 + (S.stats.smarts - 50) / 140, 0.2, 0.85))) { rvScore('gm', true); fanBoost(1.15); return { text: 'Bạn quay tay, chơi trên máy của ban tổ chức và vẫn “gánh team” 20 mạng. §R phải lên tiếng xin lỗi. Bạn thắng đậm cả trận lẫn drama.', effects: { happy: 10 }, scene: { anim: 'cheer', fx: 'stars' }, tone: 'good' }; } rvScore('gm', false); fanBoost(0.85); return { text: 'Hôm đó tay run, bạn chơi tệ hẳn. Cộng đồng càng tin bạn “hết hack nên gà”. Mất 15% người theo dõi.', effects: { happy: -10 }, scene: { anim: 'facepalm' }, tone: 'bad' }; } },
      { label: '⚖️ Gửi luật sư, kiện tội vu khống', fn: () => { fanBoost(0.98); return { text: 'Luật sư gửi văn bản, §R gỡ clip nhưng không xin lỗi. Bạn mất một khoản phí luật sư và cả tháng bực bội.', effects: { money: -30000000, happy: -3 }, scene: { loc: 'office', anim: 'nod' }, tone: 'neutral' }; } },
      { label: '😏 Đáp lại: “Hack đâu, tại mày gà”', fn: () => { fanBoost(1.08); return { text: 'Câu cà khịa của bạn thành trend. Hai kênh cùng tăng view vì drama, fan hai bên chửi nhau suốt tuần.', effects: { karma: -3, happy: 4 }, scene: { anim: 'laugh', fx: 'anger' }, tone: 'neutral' }; } }]],
    ['ms_rv_gm_show', 'gm', 'Showmatch 1 vs 1 với §R', 'Nhà tài trợ mở showmatch 1 đấu 1 giữa bạn và §R, thắng nhận 200 triệu, hơn trăm nghìn người xem trực tiếp.', { loc: 'studio', anim: 'gamepad', npcs: [{ role: 'crowd', anim: 'cheer' }], fx: 'flash', shot: 'dramatic' }, [
      { label: '🎯 Đánh nhanh thắng nhanh, liều lĩnh', mini: 'quiz', odds: () => U.clamp(0.42 + (S.stats.smarts - 50) / 150, 0.2, 0.8), fn: () => miniWin(U.clamp(0.42 + (S.stats.smarts - 50) / 150, 0.2, 0.8)) ? (rvScore('gm', true), fanBoost(1.1), { text: 'Ba phút, ba lần hạ gục §R. Bạn ôm 200 triệu và danh hiệu “vua 1 vs 1”.', effects: { money: 200000000, happy: 10 }, scene: { anim: 'cheer', fx: ['confetti', 'money'] }, tone: 'good' }) : (rvScore('gm', false), fanBoost(0.96), { text: 'Liều quá hoá dại, §R bắt bài bạn từ ván đầu. Thua trắng 0-3.', effects: { happy: -8 }, scene: { anim: 'facepalm' }, tone: 'bad' }) },
      { label: '🧠 Chơi chắc, đọc lối đánh đối thủ', mini: 'quiz', odds: () => U.clamp(0.5 + (S.stats.smarts - 50) / 160, 0.2, 0.85), fn: () => miniWin(U.clamp(0.5 + (S.stats.smarts - 50) / 160, 0.2, 0.85)) ? (rvScore('gm', true), fanBoost(1.06), { text: 'Bạn kiên nhẫn chờ §R mắc lỗi rồi trừng phạt. Thắng 3-2 nghẹt thở.', effects: { money: 200000000, happy: 8 }, scene: { anim: 'cheer', fx: 'money' }, tone: 'good' }) : (rvScore('gm', false), { text: 'Ván quyết định, §R lật kèo phút cuối. Thua 2-3.', effects: { happy: -6 }, scene: { anim: 'sad' }, tone: 'bad' }) }]],
    ['ms_rv_gm_collab', 'gm', 'Lời mời collab làm hoà', 'Sau bao năm “war” nhau, §R bất ngờ nhắn riêng: “Hay là làm một video chung đi, fan hai bên đòi mãi.”', { loc: 'bedroom', anim: 'phone', fx: 'question' }, [
      { label: '🤝 Đồng ý, làm video “bắt tay lịch sử”', fn: () => { fanBoost(1.18); return { text: 'Video collab “hai kẻ thù không đội trời chung” đạt 10 triệu view sau một tuần. Fan hai bên khóc như mưa trong phần bình luận.', effects: { happy: 10, karma: 4, money: 50000000 }, scene: { anim: 'hug', fx: ['hearts', 'confetti'] }, tone: 'good' }; } },
      { label: '🙅 Từ chối: “War là thương hiệu rồi”', fn: () => { fanBoost(1.02); return { text: 'Bạn từ chối. Drama tiếp tục — và view cũng tiếp tục.', effects: { karma: -1 }, scene: { anim: 'shrug' } }; } }]],
    ['ms_rv_gh_huan', 'gh', '§R vào live “huấn luyện”', 'Đang live thì §R — giang hồ mạng có tiếng — nhảy vào, giọng sang sảng: “Không làm mà đòi có ăn thì chỉ có ăn… cám! Thanh niên phải đi làm, nghe chưa?” Cả chat dậy sóng.', { loc: 'bedroom', anim: 'scared', npcs: [{ role: 'thug', anim: 'point', say: 'Nghe thầy nói đây!' }], fx: 'exclaim' }, [
      { label: '🙇 “Dạ con nghe ạ”, rồi đi làm ăn chân chính', fn: () => { fanBoost(1.06); return { text: 'Bạn nghe “thầy” huấn luyện một tiếng, cả chat cười lăn. Clip “được thầy dạy dỗ” lên xu hướng — và bạn đi xin việc thật.', effects: { karma: 4, happy: 4 }, scene: { anim: 'bow', fx: 'stars' }, tone: 'good' }; } },
      { label: '😂 Cà khịa lại “thầy”', fn: () => { S.flags.ghMet = S.year; fanBoost(1.12); return { text: 'Bạn hỏi lại: “Thế thầy làm nghề gì ạ?” Cả chat nổ tung. §R tức tối hứa “gặp ngoài đời rồi biết”.', effects: { karma: -2, happy: 5 }, scene: { anim: 'laugh', fx: 'anger' }, tone: 'neutral' }; } },
      { label: '🙏 Xin làm “đệ tử” của thầy', fn: () => { S.flags.ghDetu = S.year; fanBoost(1.15); return { text: 'Bạn xin làm đệ tử. §R nhận lời, từ đó hai thầy trò livestream “dạy đời” hút hàng chục nghìn người xem. Nhưng ai cũng biết “thầy” không sạch sẽ gì…', effects: { karma: -5, happy: 4 }, scene: { anim: 'cheer' }, tone: 'neutral' }; } }]],
    ['ms_rv_gh_diachi', 'gh', '“Cho bố cái địa chỉ nhà!”', 'Một giang hồ mạng bị bạn cà khịa, mặt đỏ gay gào lên trên sóng: “Đm thằng đầu cắt moi, mày cho bố cái địa chỉ nhà!” Hàng chục nghìn người đang xem chờ bạn phản ứng.', { loc: 'bedroom', anim: 'phone', expr: 'surprised', npcs: [{ role: 'thug', anim: 'angry', say: 'Cho bố cái địa chỉ!' }], fx: 'anger', shot: 'dramatic' }, [
      { label: '📍 Gửi địa chỉ… trụ sở công an phường', fn: () => { fanBoost(1.2); return { text: 'Bạn gửi luôn địa chỉ công an phường kèm câu “mời anh qua, có người đón”. Cả mạng xã hội cười nghiêng ngả, clip được cắt thành meme khắp nơi.', effects: { happy: 10, karma: 2 }, scene: { anim: 'laugh', fx: 'stars' }, tone: 'good' }; } },
      { label: '🏠 Gửi địa chỉ thật, “ngon thì qua”', mini: 'fight', odds: () => U.clamp(0.35 + (S.stats.health - 50) / 120, 0.15, 0.7), fn: () => miniWin(U.clamp(0.35 + (S.stats.health - 50) / 120, 0.15, 0.7)) ? (fanBoost(1.1), { text: 'Hắn đến thật, dẫn theo hai đệ. Bạn đứng vững trước cổng, cả xóm ra hóng. Cuối cùng hắn là người bỏ chạy — nhưng công an vẫn mời cả hai lên làm việc.', effects: { money: -5000000, health: -5, karma: -3 }, scene: { loc: 'street', anim: 'box', npcs: [{ role: 'thug', anim: 'run' }, { role: 'police', anim: 'point' }] }, tone: 'neutral' }) : { text: 'Ba người đến đập phá cổng nhà, cả gia đình hoảng loạn. Bạn bị đánh bầm dập và hối hận vì một phút nóng giận.', effects: { health: -15, happy: -14, rel: { all: -8 } }, scene: { loc: 'street', anim: 'fall', fx: 'dust', npcs: [{ role: 'thug', anim: 'angry' }] }, tone: 'bad' } },
      { label: '🎞️ Cắt clip đó làm meme, “cảm ơn anh đã cho content”', fn: () => { fanBoost(1.15); return { text: 'Bạn ghép nhạc vào clip “cho bố cái địa chỉ nhà”, câu nói ấy thành trend cả nước. Bạn là người hưởng lợi nhất.', effects: { happy: 8 }, scene: { anim: 'laugh', fx: 'music' }, tone: 'good' }; } }]],
    ['ms_rv_gh_bat', 'gh', '§R bị bắt', 'Tin nóng: §R bị bắt vì tổ chức cho vay nặng lãi, đòi nợ thuê. Công an đang rà soát những người thường xuyên livestream cùng hắn.', { loc: 'office', anim: 'scared', npcs: [{ role: 'police', anim: 'talk', say: 'Mời anh/chị lên làm việc.' }], fx: 'sweat', shot: 'dramatic' }, [
      { label: '🚓 Lên làm việc, khai thật mọi chuyện', fn: () => ({ text: 'Bạn khai thật: chỉ live “cho vui”, không dính tiền bạc. Công an nhắc nhở rồi cho về, nhưng nhãn hàng thì lặng lẽ huỷ hợp đồng.', effects: { happy: -6, karma: 2 }, scene: { anim: 'nod' }, tone: 'neutral' }) },
      { label: '🧽 Xoá sạch clip cũ, “cải tà quy chính”', fn: () => { fanBoost(0.85); if (S.social) S.social.niche = null; return { text: 'Bạn xoá hết clip “giang hồ”, đăng thư xin lỗi và đổi hướng kênh. Mất nhiều fan nhưng nhẹ người.', effects: { karma: 5, happy: 2 }, scene: { anim: 'sad' }, tone: 'neutral' }; } }]],
    ['ms_rv_ms_trend', 'ms', 'Đua top trending với §R', 'MV mới của bạn và của §R ra mắt cùng một giờ. Fan hai bên thức trắng “cày view”, mạng xã hội gọi đây là “trận chiến top trending”.', { loc: 'studio', anim: 'sing', fx: 'music' }, [
      { label: '🔥 Tung thêm bản dance, kêu gọi fan cày view', mini: 'love', odds: () => U.clamp(0.45 + (S.stats.looks - 50) / 150, 0.2, 0.8), fn: () => miniWin(U.clamp(0.45 + (S.stats.looks - 50) / 150, 0.2, 0.8)) ? (rvScore('ms', true), fanBoost(1.12), { text: 'MV của bạn giữ top 1 trending suốt 5 ngày. §R phải gửi lời chúc mừng.', effects: { happy: 10, money: 100000000 }, scene: { anim: 'dance', fx: ['confetti', 'music'] }, tone: 'good' }) : (rvScore('ms', false), fanBoost(0.97), { text: '§R giữ top 1, MV bạn dừng ở top 3. Fan bạn khóc trong phần bình luận.', effects: { happy: -6 }, scene: { anim: 'sad' }, tone: 'bad' }) },
      { label: '🎤 Rủ §R song ca bản remix chung', fn: () => { fanBoost(1.15); return { text: 'Bản remix song ca thành hit lớn nhất năm. Hai “kình địch” hoá ra là cặp đôi ăn ý nhất làng nhạc.', effects: { happy: 9, karma: 3, money: 80000000 }, scene: { anim: 'sing', fx: 'hearts' }, tone: 'good' }; } }]],
    ['ms_rv_ms_daonhac', 'ms', 'Bị tố đạo nhạc', 'Fan của §R tung clip so sánh: đoạn điệp khúc bài hit mới của bạn “giống tới 80%” một bài nhạc nước ngoài.', { loc: 'studio', anim: 'scared', fx: 'anger', shot: 'dramatic' }, [
      { label: '🎼 Công bố bản thu demo và nhạc sĩ chứng minh', mini: 'interview', odds: () => U.clamp(0.5 + (S.karma - 50) / 200, 0.2, 0.8), fn: () => miniWin(U.clamp(0.5 + (S.karma - 50) / 200, 0.2, 0.8)) ? (fanBoost(1.06), { text: 'Bản demo có từ hai năm trước, chuyên gia xác nhận chỉ trùng vòng hợp âm phổ biến. Bạn được minh oan, bài hát còn hot hơn.', effects: { happy: 8 }, scene: { anim: 'cheer' }, tone: 'good' }) : (fanBoost(0.8), { text: 'Giải thích của bạn không thuyết phục. Bài hát bị gỡ khỏi các nền tảng, bạn mất 20% người theo dõi.', effects: { happy: -12, money: -50000000 }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' }) },
      { label: '🙇 Nhận lỗi “vô tình ảnh hưởng”', fn: () => { fanBoost(0.92); return { text: 'Bạn xin lỗi, chia tiền bản quyền cho tác giả gốc. Mất fan nhưng giữ được nghề.', effects: { karma: 3, happy: -4, money: -30000000 }, scene: { anim: 'bow' }, tone: 'neutral' }; } }]],
  ];
  RIVAL_EV.forEach(([id, ar, title, text, scene, choices]) => ms({ id, title, icon: RIVAL_ARENAS[ar].icon, age: [14, 99], text, scene, choices: choices.map((c) => Object.assign({}, c, { fn: () => { const out = c.fn(); if (out && out.text) out.text = out.text.replace(/§R/g, RV(ar)); return out; } })) }));
  const rvArenaOf = (id) => (RIVAL_EV.find((x) => x[0] === id) || [])[1];
  function rivalEvent(id) { const ev = instantiate(MS[id]); if (!ev) return null; const ar = rvArenaOf(id), n = RV(ar); ev.title = ev.title.replace(/§R/g, n); ev.text = ev.text.replace(/§R/g, n); ev.choices.forEach((c) => (c.label = c.label.replace(/§R/g, n))); if (ar === 'gh' || ar === 'gm') ev.live = true; return ev; }
  function rivalYear(L) {
    if (S.jail || S.pending.length >= 3) return;
    const ars = Object.keys(RIVAL_ARENAS).filter((k) => { try { return RIVAL_ARENAS[k].cond(); } catch (e) { return false; } });
    if (!ars.length) return;
    // Quả bóng vàng: cầu thủ cấp cao đua với kình địch mỗi năm
    if (ars.includes('bd') && S.job.level >= 2 && Math.random() < 0.6) {
      const r = rivalOf('bd'), me = S.job.perf + S.job.level * 12 + U.rand(-20, 20), them = 70 + Math.min(30, (S.year - r.since) * 2) + U.rand(-20, 20);
      if (me > them) { r.me++; S.counters.ballon = (S.counters.ballon || 0) + 1; fanBoost(1.08); addStat('happy', 10, {}); L('🏆 QUẢ BÓNG VÀNG! Bạn vượt qua kình địch ' + r.nick + ' để nhận danh hiệu cầu thủ xuất sắc nhất năm (lần thứ ' + S.counters.ballon + ').', 'milestone', '🏆'); }
      else { r.them++; addStat('happy', -3, {}); L('🥈 Quả bóng vàng năm nay thuộc về ' + r.nick + '. Bạn xếp thứ hai, fan phe bạn kêu “bất công”.', 'neutral', '🥈'); }
    }
    if (Math.random() > 0.42) return;
    const ar = U.pick(ars), pool = RIVAL_EV.filter((x) => x[1] === ar && (x[0] !== 'ms_rv_bd_last' || P().age >= 32) && (x[0] !== 'ms_rv_gh_bat' || S.flags.ghDetu) && !(S.flags['rv_' + x[0]] >= S.year - 2));
    if (!pool.length) return;
    const pick = U.pick(pool); S.flags['rv_' + pick[0]] = S.year;
    if (pick[0] === 'ms_rv_bd_last') S.flags.rv_ms_rv_bd_last = 9999;
    const ev = rivalEvent(pick[0]); if (ev) S.pending.push(ev);
    rivalOf(ar);
  }
  function rivalsView() { if (!S || !S.rivals) return []; return Object.keys(S.rivals).map((k) => ({ arena: RIVAL_ARENAS[k].name, icon: RIVAL_ARENAS[k].icon, nick: S.rivals[k].nick, me: S.rivals[k].me || 0, them: S.rivals[k].them || 0 })); }

  // ---- 10. Hội nhóm Facebook
  const GROUPS = {
    mebim: { name: 'Hội Mẹ Bỉm Sữa Thông Thái', icon: '🍼', desc: 'Chia sẻ nuôi con, review sữa bỉm' },
    sansale: { name: 'Hội Săn Sale Giá Sốc', icon: '🛍️', desc: 'Deal hời, mã giảm giá' },
    phuot: { name: 'Hội Phượt Thủ Việt', icon: '🏍️', desc: 'Rủ nhau đi Hà Giang, Tây Bắc' },
    review: { name: 'Hội Review Ăn Uống', icon: '🍜', desc: 'Khen chê quán xá thẳng thắn' },
    f0: { name: 'Hội Đầu Tư Chứng Khoán F0', icon: '📈', desc: 'Phím hàng, khoe lãi, ôm lỗ' },
    chomeo: { name: 'Hội Yêu Chó Mèo', icon: '🐾', desc: 'Khoe boss, cứu hộ chó mèo' },
  };
  function groupsView() { const s = soc(); return Object.keys(GROUPS).map((id) => ({ id, name: GROUPS[id].name, icon: GROUPS[id].icon, desc: GROUPS[id].desc, joined: (s.groups || []).includes(id), admin: s.myGroup === id })); }
  function groupJoin(id) {
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const s = soc(), g = GROUPS[id]; if (!g) return fail('Không có hội này.');
    s.groups = s.groups || [];
    if (s.groups.includes(id)) { s.groups = s.groups.filter((x) => x !== id); if (s.myGroup === id) s.myGroup = null; changed(); return result({ title: 'Rời ' + g.name, icon: g.icon, text: 'Bạn rời nhóm. Bảng tin bớt ồn ào hẳn.', tone: 'neutral' }); }
    if (s.groups.length >= 3) return fail('Tham gia tối đa 3 hội cùng lúc.');
    s.groups.push(id); changed();
    return result({ title: g.icon + ' Vào ' + g.name, icon: g.icon, text: 'Bạn được duyệt vào “' + g.name + '”. Hàng trăm bài mới mỗi ngày. Thỉnh thoảng sẽ có chuyện để bạn hóng (hoặc dính vào).', tone: 'neutral' });
  }
  function groupCreate(id) {
    const s = soc(), g = GROUPS[id]; if (!g) return fail('Không có hội này.');
    if (s.followers < 5000) return fail('Cần 5K người theo dõi mới lập hội nổi.');
    if (s.myGroup) return fail('Bạn đang làm admin một hội rồi.');
    s.myGroup = id; s.groups = Array.from(new Set((s.groups || []).concat(id))).slice(-3); s.groupSize = Math.round(s.followers * U.rand(0.2, 0.5)); changed();
    return result({ title: '👑 Lập ' + g.name, icon: g.icon, text: 'Bạn lập nhóm “' + g.name + '” và làm admin. Ngày đầu đã có ' + fmtF(s.groupSize) + ' thành viên. Nhóm đông sẽ có nhãn hàng xin đăng bài… và có cả drama nội bộ.', tone: 'milestone', scene: sceneFor('bedroom', { anim: 'cheer', fx: 'sparkle' }) });
  }
  const GRP_EV = {
    mebim: ['Tranh cãi nảy lửa trong hội mẹ bỉm', 'Một bài đăng “cho con uống nước lá thay thuốc” khiến hội chia hai phe chửi nhau. Có người tag cả bạn vào hỏi ý kiến.', [['🩺 Đăng bài khuyên đưa con đi khám bác sĩ', { karma: 4, happy: 2 }, 'Bài viết tỉnh táo của bạn được ghim, nhiều mẹ cảm ơn.'], ['🍿 Ngồi hóng, không ý kiến', { happy: 1 }, 'Bạn hóng drama đến 2 giờ sáng.']]],
    sansale: ['Deal sốc giảm 90%', 'Trong hội có người share link: “Nồi chiên không dầu xịn giảm 90%, chỉ còn 150 nghìn, nhanh tay kẻo hết!”', [['🛒 Đặt ngay 2 cái', 'sale', ''], ['🤨 Kiểm tra kỹ link', { smarts: 1 }, 'Link là trang giả mạo. Bạn đăng cảnh báo, cứu được cả trăm người.']]],
    phuot: ['Rủ nhau đi Hà Giang', 'Hội phượt rủ đi Hà Giang cuối tuần: đèo Mã Pì Lèng, chợ phiên, ngủ homestay.', [['🏍️ Đi luôn!', 'phuot', ''], ['🏠 Ở nhà xem ảnh mọi người', { happy: -1 }, 'Bạn lướt ảnh mọi người check-in mà thấy tiếc hùi hụi.']]],
    review: ['Quán bị cả hội tẩy chay', 'Một thành viên đăng ảnh bát phở có con gián ở quán quen của bạn. Cả hội kêu gọi tẩy chay.', [['🔎 Đến tận quán xem thực hư', { karma: 3 }, 'Hoá ra ảnh là ghép, đối thủ chơi xấu. Bạn đăng bài minh oan, chủ quán rưng rưng cảm ơn.'], ['🙅 Tẩy chay luôn', { happy: -1 }, 'Bạn bỏ quán quen. Sau này mới biết ảnh là ghép.']]],
    f0: ['“Phím hàng” trong hội F0', 'Admin hội F0 khẳng định: “Mã ABC tuần sau x3, ai không múc là tiếc cả đời!”', [['📈 Múc theo 30% tài khoản', 'f0', ''], ['🙄 Kệ, toàn lùa gà', { smarts: 1 }, 'Một tuần sau mã ABC giảm sàn 5 phiên liền. Bạn thở phào.']]],
    chomeo: ['Cứu hộ chú chó bị bỏ rơi', 'Có người đăng ảnh một chú chó bị bỏ rơi dưới mưa, bị thương ở chân, gần nhà bạn.', [['🐕 Đến cứu, đưa đi thú y', 'cuuho', ''], ['💸 Chuyển khoản ủng hộ nhóm cứu hộ', { karma: 3, money: -500000 }, 'Bạn góp 500 nghìn, nhóm cứu hộ đã đưa chú chó đi chữa trị.']]],
  };
  function grpChoice(gid, k) {
    const [title, , opts] = GRP_EV[gid], o = opts[k]; if (!o) return { key: 'c' + k, label: '—', fn: () => ({ text: '…' }) };
    return { key: 'c' + k, label: o[0], fn: () => {
      if (o[1] === 'sale') return Math.random() < 0.6 ? { text: 'Hai tuần sau bưu kiện tới: một cái nồi nhựa đồ chơi trẻ con. Shop đã “bay màu”.', effects: { money: -300000, happy: -4 }, scene: { loc: 'home', anim: 'facepalm' }, tone: 'bad' } : { text: 'Không thể tin được: hàng thật! Bạn khoe khắp hội.', effects: { money: -300000, happy: 6 }, scene: { loc: 'home', anim: 'cheer' }, tone: 'good' };
      if (o[1] === 'phuot') return Math.random() < 0.85 ? { text: 'Ba ngày trên cung đường đá tai mèo, mây trắng bồng bềnh dưới chân. Bạn quen thêm một nhóm bạn mới.', effects: { happy: 10, health: 1, money: -3500000 }, scene: { loc: 'countryside', anim: 'cheer', fx: 'sparkle' }, tone: 'good' } : { text: 'Xe trượt bánh ở khúc cua đèo, bạn ngã trầy xước khắp người. May mà không nặng.', effects: { happy: -4, health: -8, money: -3500000 }, scene: { loc: 'countryside', anim: 'fall', fx: 'dust' }, tone: 'bad' };
      if (o[1] === 'f0') { const amt = Math.round(Math.max(0, S.money) * 0.3 / 1e5) * 1e5; return Math.random() < 0.3 ? { text: 'Không ngờ mã ABC tăng trần thật! Bạn lãi ' + fmtMoney(amt) + ' và bắt đầu nghĩ mình là thiên tài chứng khoán.', effects: { money: amt, happy: 8 }, scene: { loc: 'office', anim: 'cheer', fx: 'money' }, tone: 'good' } : { text: 'Bạn múc đúng đỉnh. Mã ABC giảm sàn liên tục, admin lặng lẽ xoá bài. Mất ' + fmtMoney(Math.round(amt * 0.6)) + '.', effects: { money: -Math.round(amt * 0.6), happy: -8 }, scene: { loc: 'office', anim: 'facepalm' }, tone: 'bad' }; }
      if (o[1] === 'cuuho') return { text: 'Bạn bế chú chó run rẩy đến phòng khám. Ba tuần sau nó khoẻ lại, bám chân bạn không rời. Bạn quyết định giữ nó lại.', effects: { happy: 8, karma: 6, money: -2000000, addPerson: { role: 'pet', kind: 'dog' } }, scene: { loc: 'street', anim: 'hug', fx: 'hearts' }, tone: 'good' };
      return { text: o[2], effects: o[1], scene: { anim: 'phone' }, tone: 'neutral' };
    } };
  }
  Object.keys(GRP_EV).forEach((gid) => { const [title, text, opts] = GRP_EV[gid];
    ms({ id: 'ms_grp_' + gid, title, icon: GROUPS[gid].icon, age: [13, 99], text, scene: { loc: 'bedroom', anim: 'phone', fx: 'question' },
      choicesFn: () => opts.map((_, k) => grpChoice(gid, k)), choiceByKey: (key) => grpChoice(gid, +String(key).slice(1)) }); });
  // admin hội: tiền quảng cáo + drama nội bộ
  ms({ id: 'ms_grp_admin', title: 'Drama nội bộ hội nhóm', icon: '👑', age: [13, 99],
    text: 'Một thành viên kỳ cựu tố bạn — admin — nhận tiền nhãn hàng để duyệt bài quảng cáo, xoá bài chê. Cả nhóm đang đòi minh bạch.',
    scene: { loc: 'bedroom', anim: 'phone', expr: 'angry', fx: 'anger' },
    choices: [
      { label: '📊 Công khai thu chi quỹ nhóm', text: 'Bạn công khai từng đồng. Thành viên nể phục, nhóm còn đông hơn.', effects: { karma: 4, happy: 2 }, scene: { anim: 'nod' } },
      { label: '🚫 Kick thành viên đó ra khỏi nhóm', text: 'Bạn kick “kẻ gây rối”. Anh ta lập nhóm mới, kéo theo một nửa thành viên.', effects: { karma: -3, happy: -4 }, scene: { anim: 'angry' } }
    ] });
  function groupsYear(L) {
    const s = S.social; if (!s || !socOpen()) return;
    if (s.myGroup) { s.groupSize = Math.round((s.groupSize || 1000) * U.rand(1.05, 1.4)); const inc = pay(s.groupSize * U.rand(80, 300)); if (inc > 0) { addMoney(inc, {}); L('👑 Hội “' + GROUPS[s.myGroup].name + '” của bạn có ' + fmtF(s.groupSize) + ' thành viên, nhãn hàng trả ' + fmtMoney(inc) + ' tiền đăng bài.', 'good', '👑'); } if (Math.random() < 0.15 && S.pending.length < 3) queueMilestone('ms_grp_admin'); }
    (s.groups || []).forEach((gid) => { if (S.pending.length < 3 && Math.random() < 0.3) queueMilestone('ms_grp_' + gid); });
  }

  // ---- 11. App hẹn hò: quẹt trái / phải, mở lời, đi hẹn
  const DATE_BIOS = ['Thích đi phượt, ghét người trễ hẹn', 'Mê mèo, cà phê và nhạc Trịnh', 'Gymer, tìm người tập cùng', 'Đang tìm người nghiêm túc, không “thả thính”', 'Thích nấu ăn, chưa có ai ăn cùng', 'Dân IT, nói chuyện hơi khô', 'Hay cười, dễ thương, hơi nhây', 'Làm ngân hàng, cuối tuần mới rảnh', 'Thích du lịch một mình', 'Chỉ thích người cao trên 1m7 😌'];
  const DATE_JOBS = ['Nhân viên văn phòng', 'Giáo viên', 'Dân IT', 'Bác sĩ', 'Kinh doanh tự do', 'Sinh viên', 'Kế toán', 'Thiết kế', 'Tiếp viên hàng không', 'Kiến trúc sư', 'Đầu bếp'];
  function datingOpen() { const pa = P().age; return socOpen() && pa >= 18 && pa <= 55 && !S.jail && !((has('spouse') || has('partner')) && has('lover')); }
  const datingSneak = () => has('spouse') || has('partner'); // đã có đôi mà vẫn dùng app = lén lút
  function datingView() {
    if (!datingOpen()) return { open: false, reason: has('lover') ? 'Bạn đang có người tình rồi' : 'Từ 18 tuổi, cần smartphone' };
    const d = S.dating && S.dating.year === S.year ? S.dating : (S.dating = { year: S.year, swipes: 0, deck: [], matches: [] });
    if (!d.deck.length && d.swipes < 12) {
      for (let i = 0; i < 6; i++) { const g = U.pick(loveGenders()), age = U.clamp(P().age + U.randi(-6, 6), 18, 60), nm = D.randomName(g); d.deck.push({ id: U.uid('dt'), g, age, name: nm.firstName, job: U.pick(DATE_JOBS), bio: U.pick(DATE_BIOS), looks: U.randi(30, 95), catfish: Math.random() < 0.15, scam: Math.random() < 0.08 }); }
    }
    return { open: true, sneak: datingSneak(), swipesLeft: Math.max(0, 12 - d.swipes), deck: d.deck.slice(0, 1).map((p) => ({ id: p.id, name: p.name, age: p.age, job: p.job, bio: p.bio, hot: p.looks >= 80, icon: p.g === 'f' ? '👩' : '👨' })), matches: d.matches.map((m) => ({ id: m.id, name: m.name, age: m.age, job: m.job, icon: m.g === 'f' ? '👩' : '👨', dated: !!m.dated })) };
  }
  function datingSwipe(id, like) {
    if (!datingOpen()) return fail('Không dùng được app hẹn hò lúc này.');
    const d = S.dating; const i = d.deck.findIndex((x) => x.id === id); if (i < 0) return fail('Hồ sơ không còn.');
    const p = d.deck.splice(i, 1)[0]; d.swipes++;
    if (!like) { changed(); return { ok: true, match: false, text: 'Quẹt trái. Người tiếp theo!' }; }
    const chance = U.clamp(0.35 + (S.stats.looks - p.looks) / 120 + (S.social && S.social.verified ? 0.1 : 0) + (KN.Weekly && KN.Weekly.bonus('love') ? 0.1 : 0), 0.08, 0.85);
    const match = p.catfish || Math.random() < chance; // tài khoản ảo thì “match” với tất cả
    if (match) d.matches.push(p);
    changed();
    return { ok: true, match, text: match ? 'It’s a match! 💘 ' + p.name + ' cũng thích bạn.' : 'Quẹt phải… nhưng chưa có hồi âm.' };
  }
  function datingDate(id, opener) {
    const d = S.dating, m = d && d.matches.find((x) => x.id === id); if (!m || m.dated) return fail('Không có cuộc hẹn này.');
    m.dated = true; const deltas = {};
    const op = ['hai', 'chan', 'thinh'][opener] || 'chan';
    const fit = { hai: S.stats.happy, chan: S.stats.smarts, thinh: S.stats.looks }[op];
    let text, tone = 'neutral', scene;
    if (m.scam) { const lost = pct(0.05, 2e6); addMoney(-lost, deltas); addStat('happy', -10, deltas); text = m.name + ' nói chuyện ngọt như mía lùi suốt hai tuần, rồi rủ bạn “đầu tư sàn vàng quốc tế cùng anh/em”. Bạn chuyển ' + fmtMoney(lost) + '… và tài khoản ấy biến mất. Lừa đảo tình cảm.'; tone = 'bad'; scene = sceneFor('bedroom', { anim: 'cry', fx: 'tears' }); }
    else if (m.catfish) { addStat('happy', -5, deltas); text = 'Người đến buổi hẹn trông khác hẳn ảnh — hình như lớn hơn 15 tuổi và ảnh toàn dùng app làm đẹp. Bạn uống vội ly nước rồi xin về.'; scene = sceneFor('cafe', { anim: 'facepalm' }); }
    else if (Math.random() < U.clamp(0.25 + (fit - 50) / 120, 0.1, 0.75)) {
      const sneak = datingSneak(), main = alive('spouse')[0] || alive('partner')[0];
      const p = newPerson(sneak ? 'lover' : 'partner', m.g, m.age, { relation: U.randi(58, 72) }); p.firstName = m.name; p.metApp = S.year; if (sneak) p.age = m.age; S.people.push(p);
      addStat('happy', 10, deltas); unlockSafe('dating_app');
      if (sneak) {
        addStat('karma', -6, deltas); S.flags.loverHeat = S.flags.loverHeat || 0;
        text = 'Bạn nói dối ' + kin(main) + ' ' + main.firstName + ' là đi tiếp khách, rồi lén gặp ' + m.name + '. Buổi hẹn kéo dài đến nửa đêm. Từ hôm nay, ' + m.name + ' là người tình bí mật của bạn. 🤫';
        if (Math.random() < 0.12) { main.relation = r100(main.relation - 20); S.flags.loverHeat += 2; text += ' Về nhà, ' + main.firstName + ' ngửi thấy mùi nước hoa lạ trên áo bạn, im lặng nhìn rất lâu…'; }
        addLog('💘 ' + text, 'neutral', '🤫'); checkProgress(); changed();
        return result({ title: '🤫 Hẹn hò lén với ' + m.name, icon: '🤫', text, tone: 'neutral', deltas, scene: sceneFor('cafe', { anim: 'love', fx: 'hearts', time: 'night' }) });
      }
      text = { hai: 'Câu mở lời hài hước làm ' + m.name + ' cười cả buổi.', chan: 'Bạn mở lời chân thành, hai người nói chuyện đến khuya.', thinh: 'Câu thả thính “ngọt lịm” của bạn trúng ngay tim đen.' }[op] + ' Buổi hẹn đầu tiên kéo dài sang tận buổi tối. ' + m.name + ' chính thức thành người yêu của bạn!'; tone = 'good'; scene = sceneFor('cafe', { anim: 'love', fx: 'hearts' });
    } else { addStat('happy', -3, deltas); text = U.pick([m.name + ' “seen” tin nhắn của bạn… rồi không bao giờ trả lời nữa.', 'Buổi hẹn khá ngượng ngùng. Về nhà, bạn nhận được tin: “Mình nghĩ tụi mình hợp làm bạn hơn.”', m.name + ' đến muộn 40 phút, cắm mặt vào điện thoại cả buổi. Thôi bỏ đi.']); scene = sceneFor('cafe', { anim: 'sad' }); }
    addLog('💘 ' + text, tone, '💘'); checkProgress(); changed();
    return result({ title: '💘 Hẹn hò với ' + m.name, icon: '💘', text, tone, deltas, scene });
  }

  // ---- 23. Mẹ chồng / mẹ vợ: ở chung hay ra riêng
  const inlawName = () => { const sp = alive('spouse')[0]; return !sp ? 'mẹ chồng' : P().gender === 'f' && sp.gender === 'm' ? 'mẹ chồng' : P().gender === 'm' && sp.gender === 'f' ? 'mẹ vợ' : 'mẹ của ' + sp.firstName; };
  ms({ id: 'ms_inlaw_live', title: 'Ở chung hay ra riêng?', icon: '🏠', age: [18, 70],
    text: 'Cưới xong, câu hỏi lớn nhất: về ở chung với {spouse.k} và bố mẹ bên ấy, hay thuê nhà ra ở riêng? Ở chung thì đỡ tiền, có người trông con. Ở riêng thì tự do… nhưng tốn kém.',
    scene: { loc: 'home', anim: 'think', npcs: [{ role: 'spouse', anim: 'shrug' }, { role: 'relative', gender: 'f', anim: 'talk', say: 'Về ở với mẹ cho vui cửa vui nhà!' }], fx: 'question' },
    choices: [
      { label: '🏡 Về ở chung với gia đình bên ấy', text: 'Bạn dọn về ở chung. Bữa cơm đông vui, nhưng cũng bắt đầu có những ánh mắt soi xét từ căn bếp.', effects: { happy: 2, money: 20000000, flag: 'inlaw_chung' }, scene: { anim: 'nod' } },
      { label: '🔑 Thuê nhà ra ở riêng', text: 'Hai vợ chồng thuê một căn nhỏ. Tự do, thoải mái, tiền nhà mỗi tháng thì không nhỏ.', effects: { happy: 4, money: -30000000, flag: 'inlaw_rieng' }, scene: { anim: 'cheer' } }
    ] });
  const INLAW_TEXTS = [
    ['Chiến tranh trong căn bếp', 'Bà chê món canh bạn nấu “nhạt như nước ốc”, rồi đổ đi nấu lại ngay trước mặt cả nhà.'],
    ['Cách nuôi con', 'Bà cho cháu ăn dặm bằng cháo nhai mớm, còn bảo “ngày xưa mẹ nuôi chồng con thế mà vẫn lớn”.'],
    ['Chuyện tiền nong', 'Bà hỏi thẳng: “Lương tháng này đưa mẹ giữ bao nhiêu?”, trong khi bạn đang để dành mua nhà.'],
    ['Họ hàng so sánh', 'Trong đám giỗ, bà khen nàng dâu/chàng rể nhà bên “vừa giỏi vừa ngoan”, rồi liếc nhìn bạn.'],
  ];
  function inlawChoice(k) {
    if (k === 'nhin') return { key: k, label: '🤐 Nhịn cho êm cửa êm nhà', fn: () => ({ text: 'Bạn nuốt cục tức vào trong. Cả nhà yên ổn, nhưng tối đó bạn khóc thầm.', effects: { happy: -5, karma: 2 }, scene: { anim: 'sad' }, tone: 'neutral' }) };
    if (k === 'noi') return { key: k, label: '🗣️ Nói thẳng nhưng nhẹ nhàng', mini: 'interview', odds: () => U.clamp(0.4 + (S.stats.smarts - 50) / 150, 0.15, 0.8), fn: () => miniWin(U.clamp(0.4 + (S.stats.smarts - 50) / 150, 0.15, 0.8)) ? { text: 'Bạn nói khéo léo, có lý có tình. Bất ngờ là bà gật đầu: “Ừ, thời mẹ khác, thời các con khác.” Quan hệ dễ chịu hẳn.', effects: { happy: 6, rel: { spouse: 4 } }, scene: { anim: 'hug' }, tone: 'good' } : { text: 'Bà dỗi, bỏ cơm hai bữa, gọi điện kể khắp họ hàng là bạn “hỗn”. {spouse.k} kẹt ở giữa, khổ sở.', effects: { happy: -8, rel: { spouse: -8 } }, scene: { anim: 'facepalm' }, tone: 'bad' } };
    if (k === 'nho') return { key: k, label: '🙏 Nhờ {spouse.k} đứng ra nói giúp', fn: () => Math.random() < 0.5 ? { text: '{spouse.k} khéo léo nói chuyện với mẹ. Mọi chuyện êm xuôi, bạn thấy mình được bảo vệ.', effects: { happy: 4, rel: { spouse: 8 } }, scene: { anim: 'hug' }, tone: 'good' } : { text: '{spouse.k} gạt đi: “Mẹ già rồi, em chịu khó chút.” Bạn thấy mình cô đơn ngay trong nhà mình.', effects: { happy: -6, rel: { spouse: -10 } }, scene: { anim: 'sad' }, tone: 'bad' } };
    return { key: 'ra', label: '🧳 Quyết dọn ra ở riêng', fn: () => { delete S.flags.inlaw_chung; S.flags.inlaw_rieng = S.year; return { text: 'Bạn thu xếp đồ đạc ra ở riêng. Hôm đi, bà đứng nhìn theo, mắt đỏ hoe. Từ đó cuối tuần mới về thăm, quan hệ lại dễ chịu hơn.', effects: { happy: 5, money: -40000000, rel: { spouse: -2 } }, scene: { anim: 'wave' }, tone: 'neutral' }; } };
  }
  INLAW_TEXTS.forEach(([title, text], i) => ms({ id: 'ms_inlaw_' + i, title, icon: '👵', age: [18, 75], text, scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'relative', gender: 'f', anim: 'angry', say: 'Ngày xưa mẹ làm thế này cơ!' }, { role: 'spouse', anim: 'shrug' }], fx: 'anger' },
    choicesFn: () => ['nhin', 'noi', 'nho', 'ra'].map(inlawChoice), choiceByKey: inlawChoice }));

  // ---- 24. Kiểu nuôi con của bạn: mẹ hổ / thả rông / dân chủ
  const RAISE = {
    ho: { label: '🐯 Mẹ hổ / bố hổ', desc: 'Học thêm kín lịch, điểm 9 là chưa đủ', smart: 1.3, rel: -2.2, rebel: 0.18 },
    tharong: { label: '🌾 Thả rông', desc: 'Con tự lớn, tự chơi, tự chịu', smart: -0.4, rel: 0.6, rebel: 0.05 },
    danchu: { label: '🤝 Dân chủ', desc: 'Lắng nghe, đặt luật rõ ràng', smart: 0.6, rel: 1.2, rebel: 0.04 },
  };
  ms({ id: 'ms_raise_style', title: 'Bạn sẽ nuôi con kiểu gì?', icon: '👶', age: [16, 99],
    text: 'Đứa con đầu lòng chào đời. Đêm đó bạn nằm nghĩ mãi: nghiêm khắc để con thành tài, hay để con được tự do lớn lên?',
    scene: { loc: 'home', anim: 'think', npcs: [{ role: 'child', anim: 'sleep' }], fx: 'question' },
    choicesFn: () => Object.keys(RAISE).map(raiseChoice), choiceByKey: raiseChoice });
  function raiseChoice(k) { const r = RAISE[k]; return { key: k, label: r.label + ' — ' + r.desc, fn: () => { S.raise = k; return { text: { ho: 'Bạn mua sẵn bộ sách luyện thi từ lớp 1 và lên kế hoạch học thêm cho con đến năm 18 tuổi.', tharong: 'Bạn quyết định để con lớn lên tự nhiên: leo cây, nghịch đất, tự vấp tự đứng dậy.', danchu: 'Bạn muốn làm bạn với con: lắng nghe, giải thích, và đặt ra những nguyên tắc rõ ràng.' }[k], effects: { happy: 3 }, scene: { anim: 'hug', fx: 'hearts' }, tone: 'neutral' }; } }; }
  ms({ id: 'ms_child_tiger', title: 'Con kiệt sức vì học', icon: '📚', age: [25, 99],
    text: '{child} học 5 lớp học thêm mỗi tuần. Tối qua con ngủ gục trên bàn lúc 1 giờ sáng, sáng nay nôn ra khi chuẩn bị đi thi.',
    scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'child', anim: 'cry', say: 'Con mệt lắm rồi…' }], fx: 'sweat' },
    choices: [
      { label: '📉 Cắt bớt lớp học thêm, cho con nghỉ ngơi', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100((x.relation || 60) + 12); return { text: 'Bạn ôm con, gạch bớt nửa lịch học. Lần đầu sau nhiều tháng, con cười to ở bàn ăn.', effects: { happy: 4, karma: 2 }, scene: { anim: 'hug' }, tone: 'good' }; } },
      { label: '💪 “Cố lên, sau này con sẽ cảm ơn bố mẹ”', fn: (ctx) => { const x = kidOf(ctx); x.smart = r100((x.smart || 50) + 4); x.relation = r100((x.relation || 60) - 15); x.burnout = true; return { text: 'Con lặng lẽ cầm cặp đi thi. Điểm vẫn cao, nhưng con nói chuyện với bạn ít dần.', effects: { happy: -2 }, scene: { anim: 'sad' }, tone: 'bad' }; } }
    ] });
  ms({ id: 'ms_child_reproach', title: 'Lời trách móc của con', icon: '💬', age: [40, 99],
    text: 'Bữa cơm Tết, {child} — giờ đã trưởng thành — bất ngờ nói: “Cả tuổi thơ con chỉ có học và bị so sánh. Bố mẹ có bao giờ hỏi con muốn gì không?”',
    scene: { loc: 'home', anim: 'sad', npcs: [{ role: 'child', anim: 'angry', say: 'Bố mẹ có hiểu con đâu!' }], fx: 'tears', shot: 'dramatic' },
    choices: [
      { label: '🙇 Xin lỗi con', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100((x.relation || 50) + 20); return { text: 'Bạn nghẹn ngào: “Bố/mẹ xin lỗi, bố/mẹ đã sai.” Con oà khóc ôm lấy bạn. Có những vết thương cần một lời xin lỗi để lành.', effects: { happy: 4, karma: 4 }, scene: { anim: 'hug', fx: 'hearts' }, tone: 'good' }; } },
      { label: '😤 “Không có bố mẹ thì con được như hôm nay à?”', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100((x.relation || 50) - 20); return { text: 'Con đứng dậy bỏ đi giữa bữa. Năm đó con không về ăn Tết nữa.', effects: { happy: -10 }, scene: { anim: 'angry' }, tone: 'bad' }; } }
    ] });
  ms({ id: 'ms_child_wild', title: 'Con “thả rông” quá đà', icon: '🌪️', age: [28, 99],
    text: 'Cô giáo gọi điện: {child} trốn học cả tuần đi chơi điện tử, còn rủ cả lớp. Bạn mới nhận ra lâu rồi chẳng biết con đi đâu, chơi với ai.',
    scene: { loc: 'school', anim: 'facepalm', npcs: [{ role: 'teacher', anim: 'talk', say: 'Phụ huynh phải quan tâm hơn!' }, { role: 'child', anim: 'shrug' }], fx: 'sweat' },
    choices: [
      { label: '🤝 Ngồi xuống nói chuyện, đặt luật mới', fn: (ctx) => { const x = kidOf(ctx); x.smart = r100((x.smart || 50) + 3); S.raise = 'danchu'; return { text: 'Hai bố/mẹ con nói chuyện đến khuya, cùng viết “hợp đồng gia đình”. Con hứa đi học đầy đủ — và giữ lời.', effects: { happy: 3 }, scene: { anim: 'talk' }, tone: 'good' }; } },
      { label: '🔥 Tịch thu điện thoại, cấm túc', fn: (ctx) => { const x = kidOf(ctx); x.relation = r100((x.relation || 60) - 10); return { text: 'Con chấp hành trong ấm ức. Nhà yên được vài tháng.', effects: { happy: -2 }, scene: { anim: 'angry' }, tone: 'neutral' }; } }
    ] });
  function raiseYear(x) {
    if (!S.raise || x.age < 3 || x.age > 18) return;
    const r = RAISE[S.raise];
    x.smart = r100((x.smart || 50) + r.smart); x.relation = r100((x.relation || 60) + r.rel);
    if (S.pending.length >= 3) return;
    if (S.raise === 'ho' && x.age >= 9 && x.age <= 17 && !x.tigerEv && Math.random() < 0.25) { x.tigerEv = true; queueMilestone('ms_child_tiger', { child: x }); }
    if (S.raise === 'tharong' && x.age >= 11 && x.age <= 16 && !x.wildEv && Math.random() < 0.22) { x.wildEv = true; queueMilestone('ms_child_wild', { child: x }); }
  }
  function adultChildYear(x) { if (x.age >= 22 && x.age <= 35 && !x.reproachEv && (S.raise === 'ho' || x.burnout) && (x.relation || 60) < 55 && Math.random() < 0.25 && S.pending.length < 3) { x.reproachEv = true; queueMilestone('ms_child_reproach', { child: x }); } }

  // ---- 25. Ngoại tình lộ qua mạng xã hội (cả hai chiều)
  ms({ id: 'ms_affair_mxh', title: 'Bị lộ vì một tấm ảnh', icon: '📸', age: [18, 90],
    text: '{spouse.k} mở điện thoại, giơ trước mặt bạn một bức ảnh: ai đó đăng story check-in nhà hàng, góc ảnh có rõ bạn đang nắm tay {lover}. Còn kèm dòng “anh/em ấy chu đáo ghê 💕”.',
    scene: { loc: 'home', anim: 'scared', expr: 'scared', npcs: [{ role: 'spouse', anim: 'angry', say: 'Giải thích đi!' }], fx: 'exclaim', shot: 'dramatic' },
    choices: [
      { label: '🙈 Chối: “Ảnh ghép đấy!”', fn: () => Math.random() < 0.25 ? { text: '{spouse.k} nhìn bạn rất lâu rồi im lặng. Nghi ngờ đã gieo vào, chẳng bao giờ hết.', effects: { happy: -4, rel: { spouse: -15 } }, scene: { anim: 'shrug' }, tone: 'neutral' } : { text: '{spouse.k} mở tiếp chục tấm ảnh nữa, cả tin nhắn. Bạn cứng họng. Đêm đó {spouse.k} ôm đồ về nhà ngoại.', effects: { happy: -10, rel: { spouse: -35 } }, scene: { anim: 'cry', fx: 'tears' }, tone: 'bad' } },
      { label: '🙇 Thú nhận, xin tha thứ, cắt đứt', text: 'Bạn thú nhận tất cả và chặn liên lạc với {lover}. {spouse.k} khóc suốt đêm, nói cần thời gian. Gia đình lung lay nhưng chưa vỡ.', effects: { happy: -8, karma: 3, rel: { spouse: -12 }, removePerson: 'lover' }, scene: { anim: 'cry', fx: 'tears' } },
      { label: '💔 Chấp nhận ly hôn', text: 'Bạn không chối, cũng không níu. Tờ đơn ly hôn được ký nhanh hơn bạn nghĩ.', effects: { happy: -12, divorce: true }, scene: { anim: 'sad' } }
    ] });
  ms({ id: 'ms_spouse_cheat_mxh', title: 'Phát hiện qua mạng xã hội', icon: '🔍', age: [20, 90],
    text: 'Lướt Facebook, bạn thấy một tài khoản lạ thả tim liên tục mọi ảnh của {spouse.k}, có ảnh check-in cùng chỗ, cùng giờ với lúc {spouse.k} bảo “đi công tác”.',
    scene: { loc: 'bedroom', anim: 'phone', expr: 'angry', fx: 'anger', shot: 'dramatic' },
    choices: [
      { label: '🗣️ Đối chất thẳng mặt', fn: () => Math.random() < 0.5 ? { text: '{spouse.k} thừa nhận, khóc xin bạn tha thứ. Bạn chưa biết phải làm gì với trái tim mình.', effects: { happy: -10, rel: { spouse: -25 } }, scene: { anim: 'angry', fx: 'tears' }, tone: 'bad' } : { text: 'Hoá ra là đồng nghiệp cùng đoàn công tác, bạn đã hiểu lầm. {spouse.k} buồn vì bị nghi ngờ.', effects: { happy: -2, rel: { spouse: -6 } }, scene: { anim: 'facepalm' }, tone: 'neutral' } },
      { label: '📢 Bóc phốt công khai lên mạng', fn: () => { if (S.social) S.social.followers = Math.round(S.social.followers * 1.15 + 500); return { text: 'Bài “bóc phốt” của bạn được chia sẻ hàng nghìn lượt, cả họ hàng biết chuyện. Bạn hả giận, nhưng con cái thì xấu hổ không dám đến trường.', effects: { happy: -4, karma: -4, rel: { spouse: -40, child: -10 } }, scene: { anim: 'phone', fx: 'anger' }, tone: 'bad' }; } },
      { label: '🤫 Âm thầm theo dõi thêm', text: 'Bạn chưa nói gì, lặng lẽ thu thập thêm bằng chứng. Mỗi tối nằm cạnh {spouse.k} mà như hai người xa lạ.', effects: { happy: -6, smarts: 1 }, scene: { anim: 'think', time: 'night' } }
    ] });
  function familyBYear(L) {
    const pa = P().age;
    if (S.pending.length >= 3) return;
    // vừa cưới: hỏi chuyện ở chung / ra riêng
    if (has('spouse') && !S.flags.inlaw_chung && !S.flags.inlaw_rieng && S.flags.marriedYear && S.year - S.flags.marriedYear <= 2 && pa < 45 && Math.random() < 0.6) { queueMilestone('ms_inlaw_live'); return; }
    if (has('spouse') && S.flags.inlaw_chung && Math.random() < 0.35) { const ev = instantiate(MS['ms_inlaw_' + U.randi(0, INLAW_TEXTS.length - 1)]); if (ev) { ev.title = cap(inlawName()) + ': ' + ev.title.toLowerCase(); S.pending.push(ev); } return; }
    // con đầu lòng: chọn kiểu nuôi con
    if (!S.raise && alive('child').some((c) => c.age <= 2) && Math.random() < 0.8) { queueMilestone('ms_raise_style'); return; }
    // người tình bị lộ qua MXH
    if (has('lover') && has('spouse') && socOpen() && Math.random() < 0.2) { queueMilestone('ms_affair_mxh'); return; }
    if (has('spouse') && socOpen() && !S.flags.spouseCheat && Math.random() < 0.035) { S.flags.spouseCheat = S.year; queueMilestone('ms_spouse_cheat_mxh'); }
  }
  // đọc giọng điệu câu người chơi tự gõ: tục/gắt → 'harsh', đùa → 'funny', còn lại (lịch sự, cảm ơn) → 'kind'
  const RUDE_RE = /(đm|đ[ịi]t|đ[ée]o|ngu|óc ch[óo]|cút|câm|im mồm|vô học|mất dạy|lồn|cặc|chó|khùng|điên|xấu như|biến đi|thằng|con kia|mày|tao|\bvcl\b|\bvl\b|fuck|shit)/i;
  const FUN_RE = /(haha|hihi|hehe|kk+|=\)\)|:\)\)|😂|🤣|😆|😜|🤪|lol|vui|đùa|chọc|cười)/i;
  const KIND_RE = /(cảm ơn|cám ơn|thank|yêu|thương|❤|💗|💖|🥰|quý|xin lỗi|góp ý|cố gắng|chúc|mong|hiểu)/i;
  function replyMood(text) { const t = String(text || ''); if (RUDE_RE.test(t)) return 'harsh'; if (FUN_RE.test(t)) return 'funny'; if (KIND_RE.test(t)) return 'kind'; return t.length > 60 ? 'kind' : 'funny'; }
  const cleanTyped = (t) => String(t || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  function socialReply(commentId, mode, typed) {
    const s = soc(), c = s.feed.find((x) => x.id === commentId); if (!c || c.replied) return fail('Không trả lời được bình luận này.');
    const my = cleanTyped(typed);
    if (typed != null) { if (my.length < 2) return fail('Viết gì đó đã nhé.'); mode = replyMood(my); c.myReply = my; }
    c.replied = true; const deltas = {}, f0 = s.followers; let text;
    if (mode === 'kind') { s.followers += Math.round(5 + f0 * 0.01); S.karma = r100(S.karma + 1); text = c.kind === 'hater' ? 'Bạn trả lời nhẹ nhàng, cảm ơn góp ý. Chính người chê cũng bất ngờ, còn fan thì khen bạn tinh tế.' : 'Bạn trả lời ' + c.user + ' bằng một trái tim. Họ chụp màn hình khoe khắp nơi.'; }
    else if (mode === 'funny') { if (Math.random() < 0.6) { s.followers += Math.round(10 + f0 * 0.03); addStat('happy', 2, deltas); text = 'Câu trả lời “cà khịa” duyên dáng của bạn được ghim top, hàng nghìn lượt thích.'; } else { s.followers = Math.round(f0 * 0.97); text = 'Câu đùa bị hiểu nhầm, vài trang tin chụp lại giật tít “thái độ”.'; } }
    else { if (Math.random() < 0.5) { s.followers += Math.round(f0 * 0.05); S.karma = r100(S.karma - 3); text = 'Bạn đáp trả gay gắt. Drama nổ ra, lượt xem tăng vọt nhưng hình ảnh bạn xấu đi.'; } else { s.followers = Math.round(f0 * 0.92); s.scandals++; addStat('happy', -6, deltas); text = 'Bạn đáp trả gay gắt và bị chụp màn hình lan khắp các hội nhóm. Mất ' + fmtF(f0 - s.followers) + ' người theo dõi.'; } }
    if (my) text = 'Bạn trả lời @' + c.user + ': “' + my + '”. ' + text;
    changed();
    return result({ title: 'Trả lời bình luận', icon: '💬', text, tone: s.followers >= f0 ? 'good' : 'bad', deltas, mood: mode });
  }
  // ================================================================== PHÒNG LIVE: livestream thật — camera trước mặt, người xem hỏi, mình trả lời, quà tặng, chán thì tắt live
  const ROOM_KIND = {
    qa: { title: 'Live trò chuyện', icon: '🎙️', gh: 0.05, hater: 0.07 },
    khuya: { title: 'Live tâm sự đêm khuya', icon: '🌙', gh: 0.03, hater: 0.05 },
    giangho: { title: 'Live dằn mặt antifan', icon: '🥊', gh: 0.32, hater: 0.14 },
    live: { title: 'Live bán hàng', icon: '🛍️', gh: 0.03, hater: 0.08 },
  };
  const ROOM_GIFTS = [['🌹', 'Hoa hồng', 1000, 40], ['🍦', 'Kem ốc quế', 5000, 25], ['💌', 'Thư tình', 25000, 14], ['🎩', 'Mũ ảo thuật', 100000, 8], ['🚀', 'Tên lửa', 2500000, 2.5], ['🦁', 'Sư tử', 7000000, 0.8], ['🌌', 'Vũ trụ', 15000000, 0.25]];
  const ROOM_INC = [
    ['Mẹ bạn mặc đồ ngủ đi ngang camera, hét to: "Ăn cơm! Live live suốt ngày!"', 2, '😂'],
    ['Con mèo nhảy lên bàn, đứng chắn kín ống kính. Chat đồng loạt: "cho xem mèo tiếp đi!"', 3, '🐱'],
    ['Mạng chập chờn, hình đứng im 10 giây với khuôn mặt méo xệch của bạn. Có người kịp chụp màn hình…', -1, '📶'],
    ['Hàng xóm bật karaoke "Đắp mộ cuộc tình" hết cỡ, át cả tiếng bạn.', 0, '🎤'],
    ['Camera quay trúng đống quần áo bừa bộn sau lưng, chat cười rần rần.', 1, '🧺'],
  ];
  function roomQuestions(id) {
    const job = S.job && D.CAREERS[S.job.id] ? D.CAREERS[S.job.id].title.toLowerCase() : null;
    const pool = [
      ['Idol năm nay bao nhiêu tuổi rồi?', 'age'], [job ? 'Làm ' + job + ' có vất vả không ạ?' : 'Dạo này đang làm gì vậy?', 'job'], ['Có người yêu chưa? Cho xem mặt đi!', 'love'],
      ['Thu nhập bao nhiêu vậy? Kể thật đi!', 'money'], ['Bí quyết sống vui là gì vậy idol?', 'tip'], ['Hát một bài đi mà!', 'sing'], ['Ghét ai nhất trong giới KOL?', 'drama'],
      ['Ăn tối chưa idol?', 'chill'], ['Cho em xin lời khuyên, em đang buồn lắm 🥺', 'advice'], ['Sao dạo này tăng cân thế 🐷', 'body'], ['Nuôi chó hay mèo vậy?', 'chill'], ['Ước mơ lớn nhất của idol là gì?', 'tip'],
    ];
    if (soc().scandals) pool.push(['Phốt năm ngoái là thật hay giả?', 'scandal']);
    if (id === 'khuya') pool.push(['Có bao giờ thấy cô đơn không?', 'advice'], ['Kỷ niệm buồn nhất đời là gì?', 'advice'], ['Mất ngủ quá, nói chuyện với em đi', 'advice']);
    if (id === 'live') pool.push(['Áo này còn size L không shop?', 'sell'], ['Có freeship không ạ?', 'sell'], ['Hàng thật hay hàng chợ vậy?', 'scandal'], ['Chốt cho em 2 cái!', 'sell']);
    if (id === 'giangho') pool.push(['Dám solo không mà nói to thế?', 'drama'], ['Sao lại đi chửi người ta trên live?', 'scandal'], ['Có "anh em" chống lưng à?', 'drama']);
    return U.shuffle(pool).slice(0, 8);
  }
  // ⚔️ PK kiểu TikTok: chia đôi màn hình với một KOL khác, quà người xem quy ra điểm, hết giờ bên ít điểm chịu phạt
  const PK_PUNISH = ['ăn trái ớt cay nhất thế giới', 'bôi son đỏ chót suốt một tiếng', 'nhảy điệu "con công" trước camera', 'đội tóc giả hát karaoke', 'đắp mặt nạ dưa leo đọc thơ', 'gọi điện tỏ tình người yêu cũ trên sóng'];
  function pkStart() {
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const s = soc(), a = SOC_ACTS.find((x) => x.id === 'pk');
    if ((S.yearActs.soc || 0) >= socPerYear()) return fail('Năm nay bạn đã đăng đủ rồi.');
    if (s.followers < a.min) return fail('Cần ' + fmtF(a.min) + ' người theo dõi.');
    S.yearActs.soc = (S.yearActs.soc || 0) + 1; s.lastYear = S.year; s.posts++;
    const foe = U.pick(KOL_NAMES), g = U.pick(['m', 'f']), age = U.clamp(P().age + U.randi(-6, 6), 18, 50), foeF = Math.round(s.followers * U.rand(0.6, 1.9));
    S.flags.pkFoe = foe; S.pkSess = { foe, foeF, t0: Date.now() }; changed();
    const sc = sceneFor('bedroom', { anim: 'talk' }), st = S.stats;
    return { ok: true, name: fullName(S.player), first: S.player.firstName, followers: s.followers, followersText: fmtF(s.followers), verified: !!s.verified, player: sc.player,
      foe: { name: foe, followersText: fmtF(foeF), player: { id: 'foe', name: foe, appearance: D.randomAppearance(g, age), age, gender: g } },
      myStr: Math.sqrt(s.followers / 2000) * (0.75 + st.looks / 250 + st.happy / 400) * (s.verified ? 1.1 : 1), foeStr: Math.sqrt(foeF / 2000),
      singP: U.clamp(0.3 + (st.happy + st.looks) / 300, 0.25, 0.85), danceP: U.clamp(0.3 + st.health / 160, 0.25, 0.85), gh: 0.04, hater: 0.08 };
  }
  function pkEnd(my, foePts, o) {
    o = o || {}; const L = S.pkSess; S.pkSess = null; if (!L) return fail('Không có phiên PK nào.');
    const s = soc(), f0 = s.followers, deltas = {}, foe = L.foe;
    my = Math.max(0, Math.round(my || 0)); foePts = Math.max(0, Math.round(foePts || 0));
    const win = !o.forfeit && my > foePts, punish = U.pick(PK_PUNISH);
    const gift = pay(Math.min(5e9, my * 125)); // 1 điểm ≈ 1 xu ≈ 250đ, sàn chia 50%
    if (gift) addMoney(gift, deltas);
    let text;
    if (o.forfeit) { s.followers = Math.round(f0 * 0.98); addStat('happy', -5, deltas); text = 'Bạn tắt live giữa phiên PK. ' + foe + ' thắng mặc định, fan hai bên chê bạn "bỏ chạy".'; }
    else if (win) { s.followers += Math.round(f0 * U.rand(0.04, 0.1)); addStat('happy', 8, deltas); text = 'Bạn THẮNG PK trước ' + foe + ' với tỷ số ' + fmtF(my) + ' – ' + fmtF(foePts) + ' điểm! ' + foe + ' phải ' + punish + '. Cả chat cười lăn.'; }
    else { s.followers += Math.round(f0 * 0.01); addStat('happy', -3, deltas); text = 'Bạn thua PK ' + fmtF(my) + ' – ' + fmtF(foePts) + ' điểm. Theo luật, bạn phải ' + punish + ' ngay trên sóng. Fan vừa thương vừa cười.'; }
    if (gift) text += ' Quà nhận được quy ra ' + fmtMoney(gift) + ' (sau khi sàn chia 50%).';
    if (o.drama && Math.random() < 0.35) { s.followers = Math.round(s.followers * 0.9); s.scandals++; S.karma = r100(S.karma - 3); addStat('happy', -6, deltas); text += ' Nhưng clip bạn khóc lóc xin quà bị cắt ra lan khắp mạng: "diễn viên hạng A". Mất 10% người theo dõi.'; }
    addPost('⚔️', 'PK với ' + foe + (win ? ' (thắng)' : ' (thua)'), f0 * U.rand(0.5, 2), f0 * U.rand(0.05, 0.2), { viral: win && my > foePts * 2 });
    genComments(2, win ? 2 : -1);
    deltas.followers = s.followers - f0;
    addLog('MXH: ' + text, win ? 'good' : 'bad', '⚔️'); checkProgress(); changed();
    return result({ title: '⚔️ Kết thúc PK với ' + foe, icon: '⚔️', text, tone: win ? 'good' : 'bad', deltas, scene: sceneFor('bedroom', { anim: win ? 'cheer' : 'facepalm', fx: win ? ['confetti', 'money'] : 'sweat' }) });
  }
  // 📸 Studio ảnh: tự cầm máy căn góc, chụp, chọn mẫu CapCut rồi đăng. Mẫu "hot" đổi theo năm.
  const CAPCUT = [
    { id: 'giat', icon: '⚡', name: 'Giật beat', song: 'Bùm Bùm Remix' },
    { id: 'glitch', icon: '📺', name: 'Glitch RGB', song: 'Lỗi Hệ Thống (Phonk)' },
    { id: 'zoom', icon: '🔍', name: 'Zoom sốc', song: 'Ơ Kìa Ai Đây' },
    { id: 'lac', icon: '🌀', name: 'Lắc lư', song: 'Say Nắng Lofi' },
    { id: 'flash', icon: '💥', name: 'Nháy đèn', song: 'Đêm Nay Quẩy Thôi' },
    { id: 'slow', icon: '🌸', name: 'Slow tình cảm', song: 'Thương Mấy Cũng Là Người Dưng (Speed Up)' },
  ];
  const hotTpl = () => CAPCUT[(S.year * 7 + 3) % CAPCUT.length].id;
  function photoStart() {
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const s = soc();
    if ((S.yearActs.soc || 0) >= socPerYear()) return fail('Năm nay bạn đã đăng đủ rồi.');
    const night = Math.random() < 0.3;
    return { ok: true, name: fullName(S.player), first: S.player.firstName, followersText: fmtF(s.followers), player: sceneFor('bedroom', { anim: 'idle' }).player, night, templates: CAPCUT, hot: hotTpl(), looks: S.stats.looks };
  }
  // q: điểm căn góc 0..1 · tpl: mẫu CapCut (null = ảnh tĩnh) · filter: bộ lọc · caption: chú thích tự gõ
  function photoPost(o) {
    o = o || {};
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const s = soc(); if ((S.yearActs.soc || 0) >= socPerYear()) return fail('Năm nay bạn đã đăng đủ rồi.');
    S.yearActs.soc = (S.yearActs.soc || 0) + 1; s.lastYear = S.year; s.posts++;
    const deltas = {}, f0 = s.followers, k = socK(), q = U.clamp(+o.q || 0, 0, 1), tpl = CAPCUT.find((t) => t.id === o.tpl) || null, hot = tpl && tpl.id === hotTpl();
    const cap = String(o.caption || '').replace(/[<>]/g, '').trim().slice(0, 80) || U.pick(['Một ngày bình yên', 'Hôm nay xinh/đẹp trai không', 'Mood hôm nay ✨', 'Chill thôi']);
    const qual = 0.4 + q * 0.9 + (tpl ? 0.25 : 0) + (hot ? 0.4 : 0) + (o.filter && o.filter !== 'none' ? 0.08 : 0);
    const viral = Math.random() < (tpl ? 0.03 + q * 0.06 + (hot ? 0.1 : 0) : 0.01 + q * 0.03) * satur(f0);
    let g = Math.round((15 + f0 * (tpl ? 0.02 : 0.012)) * k * qual * U.rand(0.6, 1.3) * satur(f0));
    if (viral) g = Math.round((f0 * 0.2 + U.randi(2000, 20000) * k) * satur(f0));
    s.followers += g; const likes = Math.round((g + f0 * 0.02) * U.rand(3, 8) * qual);
    addStat('happy', viral ? 7 : q > 0.7 ? 3 : 1, deltas);
    if (q > 0.75) addStat('looks', 1, deltas);
    const how = q > 0.8 ? 'Góc chụp quá đỉnh, ai cũng hỏi "chụp bằng máy gì vậy?". ' : q > 0.55 ? 'Ảnh khá ổn. ' : q > 0.3 ? 'Góc chụp hơi kỳ, vài người bảo "ảnh dìm". ' : 'Ảnh mờ, lệch khung, bạn bè thả haha. ';
    let text = how + (tpl ? 'Ghép mẫu CapCut "' + tpl.name + '" nhạc ' + tpl.song + (hot ? ' (mẫu đang hot nhất năm!)' : '') + '. ' : '') + (viral ? 'VIRAL! ' : '') + '"' + cap + '" nhận ' + fmtF(likes) + ' lượt thích, +' + fmtF(g) + ' người theo dõi.';
    addPost(tpl ? '🎬' : '📸', cap, likes * (tpl ? 8 : 4), likes, { viral });
    genComments(2, q > 0.6 ? 2 : q < 0.3 ? -1 : 0);
    deltas.followers = s.followers - f0;
    addLog('MXH: ' + text, viral || q > 0.7 ? 'good' : 'neutral', tpl ? '🎬' : '📸'); checkProgress(); changed();
    return result({ title: (tpl ? '🎬 Đăng clip CapCut' : '📸 Đăng ảnh'), icon: tpl ? '🎬' : '📸', text, tone: viral || q > 0.7 ? 'good' : q < 0.3 ? 'bad' : 'neutral', deltas, scene: sceneFor('bedroom', { anim: viral ? 'cheer' : 'phone', fx: viral ? ['confetti', 'stars'] : 'sparkle' }) });
  }
  // 📱 Lướt MXH: bảng tin dọc kiểu TikTok gồm KOL, người quen, quảng cáo, tin tức, lừa đảo
  const FEED_KOL = ['Hôm nay thử món mới nè 🍜', 'Outfit đi chơi cuối tuần', 'Ai cũng có một thời như vậy 🥲', 'Đố mọi người đây là đâu?', 'Tập xong buổi sáng, sảng khoái 💪', 'Vừa được tăng lương 🎉', 'Review quán cà phê mới mở', 'Bắt trend cùng hội bạn thân', 'Mèo nhà mình hôm nay', 'Một mình đi du lịch, có ai giống mình không?'];
  const FEED_ADS = [['🧴', 'Kem trắng da thần tốc 7 ngày', 'ad'], ['📚', 'Khoá học tiếng Anh giao tiếp giảm 50%', 'ad'], ['🛵', 'Xe máy trả góp 0%', 'ad'], ['💹', 'Đầu tư lãi 30%/tháng, rút tiền mỗi ngày!!!', 'scam'], ['🎁', 'Bạn đã trúng iPhone, bấm nhận ngay', 'scam'], ['💼', 'Việc nhẹ lương cao, làm tại nhà 2 triệu/ngày', 'scam']];
  const FEED_NEWS = ['Giá vàng hôm nay biến động mạnh', 'Dự báo: cuối tuần mưa lớn diện rộng', 'Đội tuyển Việt Nam thắng kịch tính', 'Phát hiện chiêu lừa đảo mới qua mạng', 'Xu hướng nghề nghiệp năm ' + '%Y', 'Giá nhà tăng 10% so với năm ngoái'];
  function feedStart() {
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const items = [], s = soc();
    const ppl = S.people.filter((p) => p.alive && p.kind === 'human' && p.appearance && (p.age || 0) >= 13 && p.role !== 'grandparent' && p.role !== 'pet');
    const bgs = ['#ffb347', '#ff7eb6', '#7cc0e8', '#39cf98', '#c792ff', '#ffd23f', '#f2785c', '#5c8dff'];
    for (let i = 0; i < 40; i++) {
      const r = Math.random(), bg = U.pick(bgs);
      if (ppl.length && r < 0.28) { const p = U.pick(ppl); items.push({ id: 'f' + i, kind: 'friend', pid: p.id, name: fullName(p), tag: roleLabel(p), app: p.appearance, age: p.age, gender: p.gender, cap: U.pick(FEED_KOL), likes: U.randi(5, 300), bg }); }
      else if (r < 0.62) { const g = U.pick(['m', 'f']), a = U.randi(18, 40); items.push({ id: 'f' + i, kind: 'kol', name: U.pick(KOL_NAMES), tag: fmtF(U.randi(20, 3000) * 1000) + ' theo dõi', app: D.randomAppearance(g, a), age: a, gender: g, cap: U.pick(FEED_KOL), likes: U.randi(1000, 900000), bg }); }
      else if (r < 0.78) { const g = U.pick(['m', 'f']), a = U.randi(15, 60); items.push({ id: 'f' + i, kind: 'user', name: U.pick(NICKS) + '_' + U.randi(1, 99), tag: 'Gợi ý cho bạn', app: D.randomAppearance(g, a), age: a, gender: g, cap: U.pick(FEED_KOL), likes: U.randi(10, 50000), bg }); }
      else if (r < 0.9) { const ad = U.pick(FEED_ADS); items.push({ id: 'f' + i, kind: ad[2], name: ad[2] === 'scam' ? U.pick(['Cơ Hội Vàng', 'Tài Chính 4.0', 'Quà Tặng Tri Ân']) : 'Được tài trợ', tag: 'Quảng cáo', icon: ad[0], cap: ad[1], likes: U.randi(10, 2000), bg: '#222' }); }
      else items.push({ id: 'f' + i, kind: 'news', name: 'Báo Mạng 24h', tag: 'Tin tức', icon: '📰', cap: U.pick(FEED_NEWS).replace('%Y', S.year), likes: U.randi(500, 20000), bg: '#0e1120' });
    }
    S.feedSess = { n: 0, liked: {}, t0: Date.now() }; changed();
    return { ok: true, items, name: fullName(S.player), followersText: fmtF(s.followers) };
  }
  function feedAct(id, act, pid) {
    const L = S.feedSess; if (!L) return fail('Không đang lướt.');
    if (act === 'seen') { L.n++; return { ok: true }; }
    if (act === 'like' && pid && !L.liked[pid]) { L.liked[pid] = 1; const p = S.people.find((x) => x.id === pid); if (p) { p.relation = r100(p.relation + 2); return { ok: true, note: p.firstName + ' vui vì bạn thả tim 💗 (+thân thiết)' }; } }
    if (act === 'open' && !L.clicked) {
      L.clicked = 1;
      if (Math.random() < 0.55) { const lost = pay(Math.max(1e5, Math.min(S.money * 0.05, U.rand(5e5, 2e7)))); if (lost > 0 && S.money > 0) { const d = {}; addMoney(-Math.min(lost, S.money), d); addStat('happy', -6, d); addLog('📱 Bấm vào quảng cáo lừa đảo trên mạng, mất ' + fmtMoney(Math.min(lost, S.money)) + '.', 'bad', '🎣'); changed(); return { ok: true, bad: true, note: 'Trang giả mạo lấy thông tin thẻ của bạn! Mất ' + fmtMoney(Math.min(lost, S.money)) + '.' }; } }
      return { ok: true, note: 'Bạn thấy đáng ngờ nên thoát ra kịp. Suýt nữa!' };
    }
    return { ok: true };
  }
  function feedEnd() {
    const L = S.feedSess; S.feedSess = null; if (!L) return null;
    const deltas = {}, n = L.n, first = !S.yearActs.feed; S.yearActs.feed = (S.yearActs.feed || 0) + 1;
    let text = 'Bạn lướt ' + n + ' bài. ';
    if (first && n >= 3) addStat('happy', Math.min(4, Math.ceil(n / 5)), deltas);
    if (n >= 30) { addStat('smarts', -1, deltas); addStat('health', -1, deltas); text += 'Ngẩng lên đã 2 giờ sáng, mắt cay xè… lướt hơi quá đà.'; }
    else if (n >= 3) text += first ? 'Giải trí chút cho đầu óc thư giãn.' : 'Lướt mãi cũng chẳng có gì mới.';
    else text += 'Chán, tắt máy.';
    changed();
    return Object.keys(deltas).length ? { text, deltas } : { text, deltas: null };
  }
  function liveStart(id) {
    if (!ROOM_KIND[id]) return fail('Không có kiểu live này.');
    if (!socOpen()) return fail('Chưa dùng được mạng xã hội.');
    const s = soc(), a = SOC_ACTS.find((x) => x.id === id);
    if ((S.yearActs.soc || 0) >= socPerYear()) return fail('Năm nay bạn đã đăng đủ rồi.');
    if (s.followers < a.min) return fail('Cần ' + fmtF(a.min) + ' người theo dõi.');
    S.yearActs.soc = (S.yearActs.soc || 0) + 1; s.lastYear = S.year; s.posts++;
    const k = ROOM_KIND[id], qs = roomQuestions(id).map((q, i) => ({ id: 'q' + i, text: q[0], topic: q[1] }));
    S.liveSess = { id, f0: s.followers, karma0: S.karma, hype: 0, gifts: 0, giftN: 0, sold: 0, peak: 0, qs, ans: {}, acts: {}, inc: false, t0: Date.now() };
    changed();
    const sc = sceneFor('bedroom', { anim: 'talk', time: id === 'khuya' ? 'night' : 'day' });
    return { ok: true, id, title: k.title, icon: k.icon, gh: k.gh, hater: k.hater, followers: s.followers, followersText: fmtF(s.followers), name: fullName(S.player), first: S.player.firstName, verified: !!s.verified, player: sc.player, night: id === 'khuya', questions: qs.map((q) => ({ id: q.id, text: q.text })), sell: id === 'live' };
  }
  const roomViewers = (L) => Math.max(3, Math.round((6 + L.f0 * 0.012) * (1 + U.clamp(L.hype, -5, 30) * 0.06) * Math.min(1, 0.35 + (Date.now() - L.t0) / 40000)));
  function liveTick() {
    const L = S.liveSess; if (!L) return fail('Không đang live.');
    const v = Math.round(roomViewers(L) * U.rand(0.9, 1.1)); L.peak = Math.max(L.peak, v);
    let gift = null, inc = null;
    if (Math.random() < U.clamp(0.22 + L.hype * 0.03, 0.05, 0.75)) {
      const tot = ROOM_GIFTS.reduce((t, g) => t + g[3] * (g[2] >= 2e6 ? Math.min(1, L.f0 / 2e5) : 1), 0); let r = Math.random() * tot, g = ROOM_GIFTS[0];
      for (const x of ROOM_GIFTS) { r -= x[3] * (x[2] >= 2e6 ? Math.min(1, L.f0 / 2e5) : 1); if (r <= 0) { g = x; break; } }
      const n = g[2] >= 1e5 ? 1 : Math.max(1, Math.round(U.rand(1, 3) * Math.sqrt(v / 30)));
      const val = g[2] * n; L.gifts = Math.min(8e8, L.gifts + val); L.giftN += n;
      gift = { icon: g[0], name: g[1], n, big: g[2] >= 2e6, valueText: fmtMoney(val) };
    }
    if (!L.inc && Date.now() - L.t0 > 25000 && Math.random() < 0.08) { L.inc = true; const x = U.pick(ROOM_INC); L.hype += x[1]; inc = { text: x[0], icon: x[2] }; }
    return { ok: true, viewers: v, viewersText: fmtF(v), hype: Math.round(L.hype * 10) / 10, gift, inc, giftsText: fmtMoney(Math.round(L.gifts * 0.5)) };
  }
  // trả lời câu hỏi đang ghim: mode that | ne | troll | gat (gõ chữ thì tự đoán giọng điệu)
  function liveAnswer(qid, mode, typed) {
    const L = S.liveSess; if (!L) return fail('Không đang live.');
    const q = L.qs.find((x) => x.id === qid); if (!q) return fail('Câu hỏi không còn.'); if (L.ans[qid]) return fail('Bạn trả lời câu này rồi.');
    let reply = typed != null ? cleanTyped(typed) : null;
    if (typed != null) { if (reply.length < 2) return fail('Viết gì đó đã nhé.'); mode = { kind: 'that', funny: 'troll', harsh: 'gat' }[replyMood(reply)]; }
    L.ans[qid] = mode;
    const p = alive('spouse')[0] || alive('partner')[0], job = S.job && D.CAREERS[S.job.id] ? D.CAREERS[S.job.id].title.toLowerCase() : null;
    const HONEST = { age: 'Mình ' + P().age + ' tuổi rồi nha mọi người 😄', job: job ? 'Mình đang làm ' + job + ', vất vả nhưng mà vui lắm!' : 'Nói thật là mình đang thất nghiệp 😅', love: p ? 'Có rồi nha, tên là ' + p.firstName + ' 💘' : 'Vẫn ế bền vững nè 😭', money: 'Nói thật nha: trong tài khoản đang có ' + fmtMoney(S.money) + '.', tip: 'Ngủ đủ, thương người nhà, đừng so sánh mình với ai cả.', sing: 'Ok hát luôn! 🎤', drama: 'Mình không ghét ai hết, ai cũng có cái hay.', chill: 'Ăn rồi nè, cơm mẹ nấu 🍚', advice: 'Thương bạn lắm. Cứ khóc đi, mai trời lại sáng 🫂', body: 'Ừ tăng 3 cân thật, Tết mà 😂', scandal: 'Mình xin nói thật: có chuyện đó, mình đã sai và đã sửa.', sell: 'Còn đủ size nha, freeship đơn từ 2 cái!' };
    const TROLL = { age: '18 tuổi… cộng thêm vài năm kinh nghiệm 😏', money: 'Đủ mua trà sữa full topping mỗi ngày 😎', love: 'Người yêu mình là cái điện thoại này nè 📱', body: 'Không phải béo, là phiên bản mở rộng 😌', sing: 'Hát xong mất fan đó, chắc chưa? 🤣', scandal: 'Phốt gì? Mình chỉ biết phốt-pho 🧪' };
    const NE = ['Bí mật nha 🤫', 'Câu này để buổi sau trả lời nhé hihi', 'Ơ kìa, chat nhìn con mèo kìa 🐱'];
    if (!reply) reply = mode === 'that' ? HONEST[q.topic] || 'Nói thật lòng thì…' : mode === 'troll' ? TROLL[q.topic] || U.pick(['Hỏi khó thế, cho mình gọi trợ giúp 😂', 'Câu này 10 điểm, trả lời 0 điểm 🤪']) : mode === 'ne' ? U.pick(NE) : 'Hỏi gì vô duyên thế? 😤';
    let react = '', note = '', tone = 'neutral', anim = 'talk', ghWave = false;
    if (mode === 'that') {
      const risky = ['money', 'scandal', 'drama'].includes(q.topic);
      if (risky && Math.random() < 0.3) { L.hype -= 1; react = 'cắt clip câu này đăng group liền 📸'; note = 'Câu trả lời thật bị cắt ghép giật tít…'; tone = 'bad'; anim = 'facepalm'; if (q.topic === 'money' && S.money > 5e9 && !S.pending.some((x) => x.id === 'ms_vaytien') && MS.ms_vaytien) { const ev = instantiate(MS.ms_vaytien); if (ev) { S.pending.push(ev); note += ' · Họ hàng xa vừa xem live…'; } } }
      else { L.hype += typed != null && reply.length >= 25 ? 3 : 2; S.karma = r100(S.karma + 0.5); react = U.pick(['thật quá trời, thích idol ghê 🥹', 'trả lời có tâm ghê', 'ủa dễ thương vậy 💗', 'chân thành quá, follow liền']); note = 'Người xem thích sự thật lòng · độ hot tăng'; tone = 'good'; anim = q.topic === 'sing' ? 'sing' : q.topic === 'advice' ? 'hug' : 'laugh'; }
    } else if (mode === 'ne') { L.hype += 0.5; react = U.pick(['né khéo ghê 😏', 'trả lời như không 😂']); anim = 'shrug'; }
    else if (mode === 'troll') { if (Math.random() < 0.6) { L.hype += 3; react = U.pick(['cười đau bụng 🤣', 'cà khịa đỉnh quá', 'mod ghim câu này đi']); note = 'Câu đùa được cả chat hưởng ứng'; tone = 'good'; anim = 'laugh'; } else { L.hype -= 2; react = 'đùa nhạt thế 🙄'; note = 'Câu đùa hơi nhạt…'; tone = 'bad'; anim = 'facepalm'; } }
    else { S.karma = r100(S.karma - 2); if (Math.random() < 0.4) { L.hype += 2; react = 'gắt ghê, drama rồi 🍿'; note = 'Lượt xem tăng vì drama · phúc đức giảm'; anim = 'angry'; } else { L.hype -= 3; react = 'thái độ quá idol, out'; note = 'Mất cảm tình người xem · phúc đức giảm'; tone = 'bad'; anim = 'angry'; } if (L.id === 'giangho' || Math.random() < 0.3) ghWave = true; }
    if (typed != null) addLog('🔴 Trên live, có người hỏi "' + q.text + '", bạn đáp: "' + reply + '".', tone, '💬');
    changed();
    return { ok: true, reply, react, note, tone, anim, ghWave, hype: Math.round(L.hype * 10) / 10 };
  }
  // hành động trên sóng: hát · nhảy · xin quà · chốt đơn (mỗi thứ tối đa 2 lần một buổi)
  function liveAct(act) {
    const L = S.liveSess; if (!L) return fail('Không đang live.');
    if (!['sing', 'dance', 'beg', 'sell'].includes(act) || (act === 'sell' && L.id !== 'live')) return fail('Không làm được.');
    L.acts[act] = (L.acts[act] || 0) + 1; if (L.acts[act] > 2) return fail('Làm hoài người xem chán đó 😅');
    const st = S.stats; let ok, text, react, anim, fx = null, tone;
    if (act === 'sing') { ok = Math.random() < U.clamp(0.3 + (st.happy + st.looks) / 300, 0.25, 0.85); L.hype += ok ? 3 : -1; text = ok ? 'Bạn cầm mic hát một bài, chat thả tim kín màn hình.' : 'Bạn hát lạc tông từ câu đầu. Chat cười, có người bấm out.'; react = ok ? 'giọng hay vậy trời 😍' : 'tai tôi… 🙉'; anim = 'sing'; fx = 'music'; }
    else if (act === 'dance') { ok = Math.random() < U.clamp(0.3 + st.health / 160, 0.25, 0.85); L.hype += ok ? 3 : -1; text = ok ? 'Bạn nhảy theo trend, cả chat spam 🔥🔥.' : 'Bạn trượt chân suýt ngã, may mà cười trừ được.'; react = ok ? 'nhảy cuốn quá 🔥' : 'ối dồi ôi 💀'; anim = 'dance'; fx = 'music'; }
    else if (act === 'beg') { ok = Math.random() < 0.6; S.karma = r100(S.karma - 0.5); if (ok) { const n = Math.max(1, Math.round(roomViewers(L) / 40)), val = Math.min(2e8, n * U.pick([25000, 100000])); L.gifts += val; L.giftN += n; text = 'Bạn chắp tay xin quà, fan cứng thả liền một tràng quà (' + fmtMoney(val) + ').'; react = 'tặng nè idol ơi 🎁'; } else { L.hype -= 1.5; text = 'Chưa nói được gì đã đòi quà, nhiều người bấm thoát live.'; react = 'live để xin tiền à 🙄'; } anim = ok ? 'bow' : 'shrug'; }
    else { const k = socK(), orders = Math.max(1, Math.round((roomViewers(L) * U.rand(0.02, 0.08) + L.hype) * k)); ok = orders > 2; L.sold += orders; L.hype += 1; text = 'Bạn giơ sản phẩm sát camera: "Chốt đơn nào cả nhà!" — ' + orders + ' đơn mới!'; react = 'chốt 1 cái ạ 🙋'; anim = 'point'; fx = 'money'; }
    tone = ok ? 'good' : 'bad';
    changed();
    return { ok: true, text, react, anim, fx, tone, hype: Math.round(L.hype * 10) / 10 };
  }
  function liveEnd() {
    const L = S.liveSess; if (!L) return fail('Không đang live.');
    S.liveSess = null;
    const s = soc(), deltas = {}, k = socK(), sec = (Date.now() - L.t0) / 1000, dur = U.clamp(sec / 100, 0.15, 1.5), f0 = s.followers;
    const peak = Math.max(L.peak, roomViewers(L)), nAns = Object.keys(L.ans).length;
    let g = Math.round((4 + L.f0 * (0.004 + U.clamp(L.hype, -6, 25) * 0.0035)) * dur * k * satur(L.f0));
    if (sec < 20) g = Math.min(g, 0);
    s.followers = Math.max(0, f0 + g);
    const giftNet = Math.round(L.gifts * 0.5);
    let sell = 0; if (L.sold) { const unit = U.pick([89000, 149000, 199000, 299000]); sell = Math.round(L.sold * unit * 0.35); }
    if (giftNet + sell) addMoney(giftNet + sell, deltas);
    const mood = L.hype >= 6 ? 2 : L.hype >= 2 ? 1 : L.hype <= -3 ? -2 : 0;
    addStat('happy', mood * 2 + (L.id === 'khuya' ? 1 : 0), deltas); if (L.id === 'khuya' || sec > 240) addStat('health', -1, deltas);
    const mm = Math.floor(sec / 60), ss = Math.round(sec % 60), dt = (mm ? mm + ' phút ' : '') + ss + ' giây';
    let text = sec < 20 ? 'Bạn bật live được ' + dt + ' thì tắt vì chán. Chưa kịp ai vào xem.' : 'Buổi live kéo dài ' + dt + ', đông nhất ' + fmtF(peak) + ' người xem cùng lúc, trả lời ' + nAns + ' câu hỏi.';
    if (L.giftN) text += ' Nhận ' + L.giftN + ' món quà, quy ra ' + fmtMoney(giftNet) + ' sau khi sàn chia 50%.';
    if (L.sold) text += ' Chốt được ' + L.sold + ' đơn hàng, lãi ' + fmtMoney(sell) + '.';
    text += g > 0 ? ' +' + fmtF(g) + ' người theo dõi.' : g < 0 ? ' Mất ' + fmtF(-g) + ' người theo dõi.' : '';
    text += L.hype >= 8 ? ' Buổi live cực cháy, clip được cắt lên xu hướng!' : L.hype <= -3 ? ' Không khí buổi live khá tệ, nhiều người bỏ về sớm.' : '';
    const ROOM_ICON = { qa: '🎙️', khuya: '🌙', giangho: '🥊', live: '🔴' };
    addPost(ROOM_ICON[L.id], ROOM_KIND[L.id].title + (L.hype >= 8 ? ' (cháy!)' : ''), peak * U.rand(3, 8), peak * U.rand(0.3, 1), { viral: L.hype >= 10 });
    genComments(2, mood); if (Math.random() < 0.35) genInbox(1);
    if (L.id === 'giangho') { S.flags.ghMet = S.year; if (Math.random() < 0.25 && MS.ms_live_giangho && !S.pending.some((x) => x.id === 'ms_live_giangho')) { const ev = liveEvent('ms_live_giangho', true); if (ev) S.pending.push(ev); } }
    deltas.followers = s.followers - f0;
    const tone = L.hype >= 8 ? 'good' : L.hype <= -3 ? 'bad' : toneOf(deltas);
    addLog('MXH: ' + text, tone, ROOM_ICON[L.id]); checkProgress(); changed();
    return result({ title: '⏹️ Kết thúc ' + ROOM_KIND[L.id].title.toLowerCase(), icon: ROOM_ICON[L.id], text, tone, deltas, scene: sceneFor('bedroom', { anim: mood > 0 ? 'cheer' : mood < 0 ? 'sad' : 'phone', time: L.id === 'khuya' ? 'night' : 'day', fx: L.gifts ? 'money' : null }) });
  }
  // trả lời bình luận ngay trong khung LIVE (kind: fan | hater | giangho; mode: tim | hai | gat | chan | text)
  const LR = {
    fan: { tim: ['Cảm ơn bạn nhiều nha 💗', 'Yêu cả nhà 🥰'], hai: ['Bình tĩnh, idol đang hồi hộp hơn bạn đó 😂', 'Gửi bạn 1 nụ cười miễn phí 😆'], gat: ['Ý kiến của bạn chưa được duyệt 🙄', 'Ai hỏi đâu 😤'] },
    hater: { tim: ['Cảm ơn góp ý, mình sẽ cố hơn ạ 🙏', 'Không thích thì vẫn chúc bạn một ngày vui nha'], hai: ['Ghét mà vẫn ngồi xem 2 tiếng là fan cứng rồi 😂', 'Bạn chê thì mình chịu, nhưng nhớ bấm follow nhé 🤪'], gat: ['Không thích thì out, cửa không khoá 😤', 'Nhìn lại mình trước đi bạn'] },
    giangho: { tim: ['Anh ơi bình tĩnh, có gì từ từ nói ạ 🙏', 'Em xin phép không tranh cãi, chúc anh vui'], hai: ['Solo thì solo… cờ caro nhé anh 😂', 'Đại ca ơi, bảo kê kênh em được thêm lượt view không 🤣'], gat: ['Ngon thì nhắn địa chỉ đi, đừng núp sau bàn phím!', 'Tao không sợ đâu, đi mà doạ trẻ con'] },
  };
  function liveReply(kind, mode, user, typed) {
    if (!S || S.dead || !socOpen()) return fail('Không trả lời được lúc này.');
    kind = LR[kind] ? kind : 'fan';
    const s = soc(), f0 = s.followers;
    let reply = typed != null ? cleanTyped(typed) : null;
    if (typed != null) { if (reply.length < 2) return fail('Viết gì đó đã nhé.'); mode = { kind: 'tim', funny: 'hai', harsh: 'gat' }[replyMood(reply)]; }
    if (mode === 'chan') {
      if (kind === 'giangho') S.karma = r100(S.karma + 1);
      if (kind === 'fan') s.followers = Math.round(f0 * 0.998);
      changed();
      return { ok: true, reply: '(đã chặn @' + user + ')', note: kind === 'fan' ? '😶 Chặn nhầm fan? Vài người xem thấy hơi kỳ.' : '🚫 Đã chặn. Chat sạch sẽ hơn hẳn.', tone: kind === 'fan' ? 'bad' : 'good' };
    }
    if (!reply) reply = U.pick(LR[kind][mode] || LR[kind].tim);
    let note = '', react = '', reactKind = 'fan', tone = 'neutral', ghWave = false;
    const g = (k) => { const v = Math.max(1, Math.round((3 + f0 * k) * satur(f0))); s.followers += v; return v; };
    if (mode === 'tim') { const v = g(kind === 'fan' ? 0.003 : 0.006); S.karma = r100(S.karma + (kind === 'fan' ? 0.5 : 1)); react = kind === 'fan' ? 'aaaa idol rep em 😭💗' : kind === 'hater' ? 'ủa hiền vậy, thôi follow 😳' : 'thằng này cũng biết điều đấy'; reactKind = kind === 'giangho' ? 'giangho' : 'fan'; note = '+' + fmtF(v) + ' theo dõi · phúc đức tăng nhẹ'; tone = 'good'; }
    else if (mode === 'hai') { if (Math.random() < 0.62) { const v = g(0.012); react = U.pick(['cười đau bụng 🤣', 'cà khịa đỉnh quá', 'ghim cmt này lên đi mod']); note = '+' + fmtF(v) + ' theo dõi · câu đùa được ghim'; tone = 'good'; } else { s.followers = Math.round(f0 * 0.99); react = 'đùa nhạt thế 🙄'; reactKind = 'hater'; note = 'Câu đùa hơi nhạt…'; tone = 'bad'; if (kind === 'giangho') ghWave = true; } }
    else {
      if (kind === 'giangho') { ghWave = true; if (Math.random() < 0.5) { const v = g(0.025); S.karma = r100(S.karma - 3); react = 'căng quá, drama rồi 🍿🍿'; note = '+' + fmtF(v) + ' theo dõi vì drama · phúc đức giảm · cả đám “đệ” đang kéo vào'; tone = 'neutral'; } else { s.followers = Math.round(f0 * 0.96); S.karma = r100(S.karma - 4); react = 'live toàn chửi nhau, out'; reactKind = 'hater'; note = 'Mất fan vì khẩu chiến · phúc đức giảm'; tone = 'bad'; }
        if (Math.random() < 0.3 && !S.pending.some((p) => p.id === 'ms_live_giangho')) { const ev = liveEvent('ms_live_giangho', true); if (ev) { S.pending.push(ev); note += ' · ⚠️ giang hồ mạng sẽ tìm tới bạn!'; } } }
      else { if (Math.random() < 0.4) { const v = g(0.015); S.karma = r100(S.karma - 2); react = 'đáp gắt ghê, thích 😎'; note = '+' + fmtF(v) + ' theo dõi · phúc đức giảm'; } else { s.followers = Math.round(f0 * (kind === 'fan' ? 0.95 : 0.97)); S.karma = r100(S.karma - 2); react = kind === 'fan' ? 'fan cứng mà bị chửi, unfollow luôn 💔' : 'thái độ quá idol'; reactKind = 'hater'; note = 'Mất fan vì thái độ'; tone = 'bad'; } }
    }
    if (typed != null) addLog('🔴 Trên live, bạn trả lời @' + user + ': “' + reply + '”.', tone, '💬');
    changed();
    return { ok: true, reply, react, reactKind, note, tone, ghWave };
  }  function priceOf(it) { return it.type === 'gold' ? S.goldPrice : it.type === 'house' || it.type === 'land' ? Math.round(it.price * market().re / 1e6) * 1e6 : it.price; }
  // ---- giá trị lâu dài của tài sản
  const TYPE_PERKS = { house: { joy: 3, prestige: 3, fam: 2, rent: 0.035, unlock: 'housewarm' }, car: { joy: 2, prestige: 2, fam: 1, unlock: 'roadtrip' }, land: { joy: 0.5, prestige: 1, rent: 0.015 }, motorbike: { joy: 1, unlock: 'phuot' }, phone: { joy: 0.5 }, luxury: { joy: 1, prestige: 1 }, gold: {} };
  function assetPerk(a) { return (a.itemId && D.SHOP.find((x) => x.id === a.itemId)) || TYPE_PERKS[a.type] || {}; }
  function prestige() { return S ? Math.round(S.assets.reduce((s, a) => s + (assetPerk(a).prestige || 0), 0)) : 0; }
  function prestigeRank(n) { let r = D.PRESTIGE_RANKS[0][1]; D.PRESTIGE_RANKS.forEach(([k, t]) => { if (n >= k) r = t; }); return r; }
  const hasHome = () => S.assets.some((a) => a.type === 'house' && !a.rented);
  function perkText(k, value) {
    const parts = [];
    if (k.joy) parts.push('+' + String(k.joy).replace('.', ',') + ' hạnh phúc/năm');
    if (k.prestige) parts.push('đẳng cấp +' + k.prestige);
    if (k.looksY) parts.push('ngoại hình tăng dần');
    if (k.smartsY) parts.push('trí tuệ tăng dần');
    if (k.fam) parts.push('gia đình gắn kết hơn');
    if (k.rent) parts.push('cho thuê ~' + D.fmtShort(Math.round((value || 0) * k.rent / 12)) + '/tháng');
    if (k.unlock) { const a = actDef(k.unlock); if (a) parts.push('mở: ' + a.label.toLowerCase()); }
    if (k.type === 'house' || k.unlock === 'housewarm') parts.push('không tốn tiền thuê nhà');
    return parts.join(' · ');
  }
  function assetsYear(L, deltas) {
    const pa = P().age; let joy = 0, looks = 0, smarts = 0, fam = 0, rentIncome = 0;
    const byType = {};
    S.assets.forEach((a) => {
      const k = assetPerk(a);
      if (a.rented) { rentIncome += Math.round((a.value || 0) * (k.rent || 0)); return; }
      (byType[a.type] = byType[a.type] || []).push(k);
    });
    // món tốt nhất mỗi loại tính đủ, món thứ hai trở đi chỉ tính 30%
    Object.values(byType).forEach((list) => { list.sort((x, y) => (y.joy || 0) - (x.joy || 0)); list.forEach((k, i) => { const w = i ? 0.3 : 1; joy += (k.joy || 0) * w; looks += (k.looksY || 0) * w; smarts += (k.smartsY || 0) * w; fam = Math.max(fam, k.fam || 0); }); });
    S.assetJoy = Math.round(joy * 10) / 10; S.prestige = prestige();
    if (pa < 12) return;
    if (looks) addStat('looks', U.rand(0, looks), deltas);
    if (smarts) addStat('smarts', U.rand(0, smarts), deltas);
    if (fam) alive().filter((x) => ['spouse', 'child', 'mother', 'father', 'partner', 'grandchild'].includes(x.role)).forEach((x) => (x.relation = r100(x.relation + U.rand(0, fam))));
    if (rentIncome > 0) {
      const tax = Math.round(rentIncome * 0.1); addMoney(rentIncome - tax, deltas);
      S.counters.rentYears = (S.counters.rentYears || 0) + 1; unlock('landlord');
      L('Tiền cho thuê năm nay: ' + fmtMoney(rentIncome) + ' (đã nộp thuế ' + fmtMoney(tax) + ').', 'good', '🔑');
    }
  }
  function rentAsset(id) {
    if (!S || S.dead) return fail('Không thể làm điều này.');
    const a = S.assets.find((x) => x.id === id); if (!a) return fail('Không tìm thấy tài sản.');
    const k = assetPerk(a); if (!k.rent) return fail('Tài sản này không cho thuê được.');
    if (P().age < 18) return fail('Từ 18 tuổi mới tự cho thuê được.');
    a.rented = !a.rented;
    const month = Math.round((a.value || 0) * k.rent / 12);
    const text = a.rented
      ? 'Bạn cho thuê ' + a.name.toLowerCase() + ', mỗi tháng thu khoảng ' + fmtMoney(month) + '.' + (a.type === 'house' && !hasHome() ? ' Giờ bạn phải đi thuê chỗ khác để ở nên chi phí sinh hoạt tăng, và mất niềm vui “nhà mình”.' : '')
      : 'Bạn lấy lại ' + a.name.toLowerCase() + ' để tự dùng. Không còn tiền thuê, nhưng ' + (a.type === 'house' ? 'cả nhà lại có tổ ấm.' : 'đất là của mình.');
    addLog(text, 'neutral', '🔑'); changed();
    return result({ title: a.rented ? 'Cho thuê ' + a.name : 'Thôi cho thuê', icon: '🔑', text, tone: 'neutral', scene: sceneFor(a.type === 'land' ? 'countryside' : 'home', { anim: a.rented ? 'nod' : 'cheer', fx: a.rented ? 'money' : 'sparkle' }) });
  }
  function shopItems() {
    if (!S || P().age < 12) return [];
    return D.SHOP.map((it) => {
      const price = priceOf(it), owned = S.assets.some((a) => a.itemId === it.id);
      const ageOk = P().age >= (it.type === 'phone' ? 12 : it.type === 'motorbike' ? 16 : 18);
      const down = Math.round(price * 0.3), canLoan = it.type === 'house' && !owned && P().age >= 22 && !!S.job && S.money >= down && S.money < price && !(S.loans || []).length;
      return { id: it.id, type: it.type, name: it.name, price, priceText: fmtMoney(price), icon: it.icon, desc: it.desc, perkText: perkText(Object.assign({ type: it.type }, it), price), affordable: S.money >= price && ageOk, owned: owned && it.type !== 'gold', reason: !ageOk ? 'Chưa đủ tuổi' : S.money < price ? 'Chưa đủ tiền' : null,
        loanable: canLoan, loanText: canLoan ? 'Trả trước ' + fmtMoney(down) + ', góp ' + fmtMoney(annuity(price - down, LOAN_RATE, LOAN_YEARS)) + '/năm × ' + LOAN_YEARS + ' năm' : null };
    });
  }
  // món mặc cả được: nhà, đất, xe (trả giá thành công giảm tối đa 15%)
  const HAGGLE_TYPES = ['house', 'land', 'car', 'motorbike'];
  function haggleInfo(itemId) {
    const it = S && D.SHOP.find((x) => x.id === itemId); if (!it || !HAGGLE_TYPES.includes(it.type)) return null;
    const view = shopItems().find((x) => x.id === itemId); if (!view || view.owned || !view.affordable) return null;
    return { price: priceOf(it), name: it.name, type: it.type };
  }
  function buy(itemId, extra) {
    if (!S || S.dead) return fail('Không thể mua.');
    const it = D.SHOP.find((x) => x.id === itemId); if (!it) return fail('Món đồ không tồn tại.');
    const view = shopItems().find((x) => x.id === itemId);
    if (view.owned) return fail('Bạn đã có món này rồi.');
    if (!view.affordable) return fail(view.reason || 'Chưa đủ tiền');
    const off = extra && HAGGLE_TYPES.includes(it.type) ? U.clamp(+extra.discount || 0, 0, 0.15) : 0;
    const full = priceOf(it), price = Math.round(full * (1 - off) / 1e4) * 1e4, deltas = { money: -price };
    S.money -= price;
    S.assets.push({ id: U.uid('a'), itemId: it.id, type: it.type, name: it.name, value: Math.round(price * (it.type === 'gold' ? 0.97 : it.type === 'house' || it.type === 'land' ? 0.97 : 0.85)), icon: it.icon, bought: S.year });
    addStat('happy', it.happy, deltas);
    const text = U.pick(['Bạn tậu ' + it.name.toLowerCase() + '. ', 'Chính thức sở hữu ' + it.name.toLowerCase() + '! ']) + it.desc + (off >= 0.005 ? ' Nhờ mặc cả khéo, bạn bớt được ' + fmtMoney(full - price) + ' (' + Math.round(off * 100) + '%).' : '');
    const loc = it.type === 'house' ? 'home' : it.type === 'land' ? 'countryside' : it.type === 'motorbike' || it.type === 'car' ? 'street' : 'home';
    const scene = sceneFor(loc, { anim: it.type === 'motorbike' ? 'drive' : 'cheer', fx: it.type === 'house' ? 'confetti' : 'sparkle', people: (alive('spouse').concat(alive('partner'), alive('child'))).slice(0, 2).map((p) => ({ p, anim: 'clap' })) });
    addLog('Mua ' + it.name + ' (' + fmtMoney(price) + ').', 'good', it.icon); checkProgress(); changed();
    return result({ title: 'Mua ' + it.name, icon: it.icon, text, tone: 'good', deltas, scene });
  }
  function buyLoan(itemId) {
    if (!S || S.dead) return fail('Không thể mua.');
    const it = D.SHOP.find((x) => x.id === itemId); const v = shopItems().find((x) => x.id === itemId);
    if (!it || !v || !v.loanable) return fail('Chưa đủ điều kiện vay (cần đi làm, từ 22 tuổi, có 30% tiền trả trước, chưa có khoản vay nào).');
    const price = priceOf(it), down = Math.round(price * 0.3), deltas = { money: -down };
    S.money -= down;
    const asset = { id: U.uid('a'), itemId: it.id, type: it.type, name: it.name, value: Math.round(price * 0.97), icon: it.icon, bought: S.year };
    S.assets.push(asset);
    S.loans = S.loans || [];
    S.loans.push({ assetId: asset.id, name: it.name, left: price - down, pay: annuity(price - down, LOAN_RATE, LOAN_YEARS), years: LOAN_YEARS, since: S.year });
    addStat('happy', it.happy, deltas);
    const text = 'Bạn vay ngân hàng ' + fmtMoney(price - down) + ' (lãi ' + LOAN_RATE * 100 + '%/năm, ' + LOAN_YEARS + ' năm) để mua ' + it.name.toLowerCase() + '. Mỗi năm phải góp ' + fmtMoney(S.loans[S.loans.length - 1].pay) + '. Có nhà rồi, giờ đến lượt… “làm thuê cho ngân hàng”.';
    addLog('Vay mua ' + it.name + ' (trả trước ' + fmtMoney(down) + ').', 'good', '🏦'); checkProgress(); changed();
    return result({ title: 'Vay mua ' + it.name, icon: '🏦', text, tone: 'good', deltas, scene: sceneFor('home', { anim: 'cheer', fx: 'confetti' }) });
  }
  function sell(assetId) {
    if (!S) return fail('Không thể bán.');
    const i = S.assets.findIndex((a) => a.id === assetId); if (i < 0) return fail('Tài sản không tồn tại.');
    const a = S.assets[i]; S.assets.splice(i, 1); S.money += a.value;
    // nhà đang vay: bán thì phải tất toán khoản vay trước
    const li = (S.loans || []).findIndex((l) => l.assetId === a.id);
    let extra = '';
    if (li >= 0) { const ln = S.loans.splice(li, 1)[0]; S.money -= ln.left; extra = ' Trả nốt ' + fmtMoney(ln.left) + ' nợ ngân hàng, còn lại ' + fmtMoney(a.value - ln.left) + '.'; }
    const text = 'Bạn bán ' + a.name.toLowerCase() + ', thu về ' + fmtMoney(a.value) + '.' + extra;
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
    return Math.max(0, Math.round(s * dif('score')));
  }
  // ---- chế độ online: ảnh chụp nhân vật gửi đối thủ + nhận tác động nhỏ từ đối thủ
  function onlineSnapshot() {
    if (!S || !S.player) return null;
    const p = P();
    return {
      name: p.firstName, fullName: fullName(p), gender: p.gender, age: S.dead ? S.dead.age : p.age, alive: !S.dead,
      worth: Math.round(S.money + assetsValue() - loanLeft()), job: S.job ? D.CAREERS[S.job.id].levels[S.job.level].title : S.retired ? 'Nghỉ hưu' : S.edu.inSchool ? 'Đi học' : S.flags.kolFull ? 'KOL / Streamer' : 'Thất nghiệp',
      stats: { happy: Math.round(S.stats.happy), health: Math.round(S.stats.health), smarts: Math.round(S.stats.smarts), looks: Math.round(S.stats.looks) },
      karma: Math.round(S.karma), score: S.dead ? S.dead.score : score(), cause: S.dead ? S.dead.cause : null,
      married: has('spouse'), kids: S.people.filter((x) => x.role === 'child' && x.alive).length, followers: (S.social && S.social.followers) || 0,
      diff: S.diff || 'thuong', gen: S.generation || 1, rank: S.dead ? S.dead.rank : rankOf(score()), born: S.born, year: S.year,
    };
  }
  // tác động từ người chơi khác: chỉ cộng/trừ nhỏ, có giới hạn để không phá game
  // 💒 thiệp cưới online: dữ liệu cô dâu chú rể (ngoại hình đồ cưới) để bạn bè vào dự; khách dự thì thấy chính nhân vật của mình
  // 📋 PHÒNG HLV (js/manager.js): đội bóng mình dẫn dắt; lên HLV đội tuyển thì chuyển sang dẫn dắt tuyển quốc gia
  function mgrState() {
    if (!S || S.dead || !S.job || S.job.id !== 'hlv' || !KN.Manager) return null;
    const nat = S.job.level >= 2;
    if (!S.mgr || !!S.mgr.national !== nat) { const old = S.mgr; S.mgr = KN.Manager.init({ level: S.job.level, club: S.flags.lastClub, year: S.year }); if (old) { S.mgr.trophies = old.trophies || 0; S.mgr.history = old.history || []; } }
    return S.mgr;
  }
  function mgrSave() { changed(); }
  function mgrNews(t) { addLog(t, 'neutral', '📋'); changed(); }
  function weddingCard() {
    if (!S || S.dead) return null; const sp = alive('spouse')[0]; if (!sp) return null;
    return { a: playerOf('wedding', 'love'), b: npcOf(sp, { anim: 'love' }, 'wedding'), year: S.flags.marriedYear || S.year, place: D.cityName(S.city), married: S.flags.marriedYear || null, code: S.flags.wedCode || null };
  }
  function weddingSetCode(c) { if (S && !S.dead) { S.flags.wedCode = c; changed(); } }
  function weddingGuest() { if (!S || S.dead || !S.player) return null; return playerOf('wedding', 'clap'); }
  function remoteEffect(eff, text, icon) {
    if (!S || S.dead || !eff) return false;
    const deltas = {};
    ['happy', 'health', 'karma'].forEach((k) => { if (eff[k]) addStat(k, U.clamp(eff[k], -5, 5), deltas); });
    if (eff.money) addMoney(U.clamp(eff.money, -2e7, Math.max(2e7, S.money * 0.05)), deltas);
    addLog(text || 'Đối thủ vừa tương tác với bạn.', eff.happy < 0 ? 'bad' : 'good', icon || '🌐');
    changed();
    return deltas;
  }
  // ---- online: kết hôn với nhân vật của người chơi khác (mỗi bên có một “bạn đời online” trong game của mình)
  function onlineMarry(o) {
    if (!S || S.dead || P().age < 18) return { ok: false, reason: 'Chưa đủ tuổi kết hôn.' };
    if (has('spouse')) return { ok: false, reason: 'Bạn đang có vợ/chồng.' };
    const old = alive('partner')[0]; if (old) { old.role = 'ex'; addLog('Bạn chia tay ' + old.firstName + ' để đến với người mới.', 'neutral', '💔'); }
    const parts = String(o.name || 'Bạn đời').trim().split(/\s+/);
    const sp = newPerson('spouse', o.gender === 'f' ? 'f' : 'm', U.clamp(Math.round(o.age || P().age), 18, 99), { firstName: parts.pop(), lastName: parts[0] || undefined, middleName: parts.slice(1).join(' '), relation: 88 });
    sp.onlineId = o.pid; sp.onlineNick = o.nick;
    S.people.push(sp); S.flags.marriedYear = S.year; S.flags.wedCode = null; unlock('married'); (KN.Weekly && KN.Weekly.track('marry'));
    const deltas = {}; addStat('happy', 12, deltas);
    addLog('💍 Bạn kết hôn với ' + fullName(sp) + ' (người chơi ' + (o.nick || '?') + ')! Hai kiếp người giờ chung một mái nhà.', 'milestone', '💍');
    changed(); return { ok: true };
  }
  function onlineDivorce(pid, text) {
    if (!S || S.dead) return false;
    const sp = S.people.find((x) => x.alive && x.role === 'spouse' && x.onlineId === pid); if (!sp) return false;
    sp.role = 'ex'; sp.wasSpouse = true; const deltas = {};
    if (S.money > 0) addMoney(-S.money * 0.25, deltas);
    addStat('happy', -10, deltas); unlock('divorce');
    addLog(text || 'Bạn và ' + sp.firstName + ' ly hôn, chia đôi tài sản chung.', 'bad', '💔');
    changed(); return true;
  }
  const onlineSpouse = () => { const sp = S && S.people.find((x) => x.alive && x.role === 'spouse' && x.onlineId); return sp ? sp.onlineId : null; };
  // làm ăn chung / sự kiện chung: cộng trừ tiền lớn (không giới hạn ±20tr như quà)
  function onlineMoney(delta, text, icon) {
    if (!S || S.dead) return false;
    const deltas = {}; addMoney(delta, deltas);
    addLog(text, delta >= 0 ? 'good' : 'bad', icon || '🤝');
    changed(); return true;
  }
  // sự kiện chung cả phòng (do chủ phòng phát ở mỗi mốc 10 năm)
  const WORLD = {
    bao: { icon: '🌀', title: 'Siêu bão quét qua', text: 'Một siêu bão quét qua cả nước. Nhà cửa tốc mái, cây đổ ngổn ngang.', fx: () => ({ moneyPct: -0.06, money: -15e6, happy: -5 }) },
    lu: { icon: '🌊', title: 'Lũ lịch sử', text: 'Lũ lớn nhất trăm năm. Cả nước hướng về vùng lũ.', fx: () => ({ moneyPct: -0.04, happy: -4, karma: 2 }) },
    khunghoang: { icon: '📉', title: 'Khủng hoảng kinh tế', text: 'Kinh tế suy thoái: chứng khoán sập, nhiều công ty cắt giảm nhân sự.', fx: () => ({ moneyPct: -0.15, happy: -6 }) },
    dich: { icon: '🦠', title: 'Đại dịch', text: 'Một đại dịch bùng phát: giãn cách, khẩu trang, xét nghiệm.', fx: () => ({ health: -8, happy: -6, moneyPct: -0.05 }) },
    bung: { icon: '📈', title: 'Kinh tế bùng nổ', text: 'Kinh tế tăng trưởng nóng, đất lên giá, việc làm dồi dào.', fx: () => ({ moneyPct: 0.12, happy: 5 }) },
    worldcup: { icon: '⚽', title: 'Việt Nam dự World Cup', text: 'Đội tuyển Việt Nam lần đầu giành vé dự World Cup! Cả nước đổ ra đường đi bão.', fx: () => ({ happy: 10 }) },
    tet: { icon: '🧧', title: 'Thưởng Tết kỷ lục', text: 'Năm nay doanh nghiệp làm ăn được, thưởng Tết kỷ lục.', fx: () => ({ money: S.job ? monthly() * 3 : 0, happy: 6 }) },
    nangnong: { icon: '🔥', title: 'Nắng nóng kỷ lục', text: 'Đợt nắng nóng kỷ lục, nhiều người già nhập viện vì sốc nhiệt.', fx: () => ({ health: P().age >= 60 ? -8 : -3, happy: -3 }) },
  };
  function worldEvent(kind) {
    const w = WORLD[kind]; if (!S || S.dead || !w) return null;
    const e = w.fx(), deltas = {};
    if (e.moneyPct && S.money > 0) addMoney(S.money * e.moneyPct, deltas);
    if (e.money) addMoney(e.money, deltas);
    ['happy', 'health', 'karma'].forEach((k) => { if (e[k]) addStat(k, e[k], deltas); });
    addLog(w.icon + ' ' + w.title + ': ' + w.text, e.happy >= 0 && !(e.moneyPct < 0) ? 'good' : 'bad', w.icon);
    changed();
    return { title: w.title, icon: w.icon, text: w.text, deltas };
  }
  // ---- thử thách hằng ngày: kiểm tra khi nhân vật qua đời
  const CHALLENGES = {
    tho80_nodh: { icon: '🎓', text: 'Sống tới 80 tuổi mà không có bằng đại học', ok: () => P().age >= 80 && !hasDegree() },
    ty10_40: { icon: '💰', text: 'Có tài sản 10 tỷ trước tuổi 40', ok: () => S.flags.rich10At != null && S.flags.rich10At < 40 },
    con3_tho70: { icon: '👨‍👩‍👧‍👦', text: 'Có từ 3 người con và sống tới 70 tuổi', ok: () => S.people.filter((x) => x.role === 'child').length >= 3 && P().age >= 70 },
    karma90: { icon: '☯️', text: 'Qua đời với Đức từ 90 trở lên', ok: () => S.karma >= 90 },
    docthan_giau: { icon: '🧍', text: 'Không bao giờ kết hôn mà vẫn có tài sản 5 tỷ', ok: () => !S.flags.marriedYear && S.money + assetsValue() >= 5e9 },
    tuyenqg: { icon: '🏅', text: 'Trở thành tuyển thủ quốc gia ở bất kỳ môn thể thao nào', ok: () => !!S.flags.nationalTeam },
    bacsi60: { icon: '🩺', text: 'Làm bác sĩ và sống tới 60 tuổi', ok: () => !!S.flags.wasDoctor && P().age >= 60 },
    diangu60: { icon: '💀', text: 'Chơi độ khó Địa ngục và sống tới 60 tuổi', ok: () => S.diff === 'diangu' && P().age >= 60 },
    vuive: { icon: '😊', text: 'Qua đời khi hạnh phúc từ 85 trở lên', ok: () => S.stats.happy >= 85 },
    xaxu: { icon: '✈️', text: 'Từng sống ở nước ngoài và sống tới 65 tuổi', ok: () => !!S.flags.livedAbroad && P().age >= 65 },
  };
  function dayKey(d) { const t = new Date((d || new Date()).getTime() + 7 * 3600e3); return t.toISOString().slice(0, 10); }
  function dailyChallenge(d) {
    const key = dayKey(d), ids = Object.keys(CHALLENGES);
    let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const id = ids[h % ids.length];
    return { id, day: key, icon: CHALLENGES[id].icon, text: CHALLENGES[id].text };
  }
  function setChallenge(c) { if (S && c) { S.challenge = { id: c.id, day: c.day }; changed(); } }
  function challengeResult() {
    if (!S || !S.challenge || !CHALLENGES[S.challenge.id]) return null;
    const c = CHALLENGES[S.challenge.id];
    let ok = false; try { ok = !!c.ok(); } catch (e) { ok = false; }
    return { id: S.challenge.id, day: S.challenge.day, icon: c.icon, text: c.text, ok, done: !!S.dead };
  }
  // theo dõi các cột mốc dùng cho thử thách (gọi mỗi năm)
  function trackMilestones() {
    const w = S.money + assetsValue(), pa = P().age;
    if (w >= 1e10 && S.flags.rich10At == null) S.flags.rich10At = pa;
    if (S.job && D.CAREERS[S.job.id].sport && S.job.level >= D.CAREERS[S.job.id].levels.length - 1) S.flags.nationalTeam = S.flags.nationalTeam || S.year;
    if (S.job && S.job.id === 'bacsi') S.flags.wasDoctor = S.flags.wasDoctor || S.year;
    if (S.abroad) S.flags.livedAbroad = S.flags.livedAbroad || S.year;
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
  // lý do ra đi đột ngột, có trọng số theo tuổi, nghề, lối sống, hoàn cảnh
  function deathCause(pa) {
    const pool = [];
    const add = (w, t) => { if (w > 0) pool.push([w, t]); };
    const jid = S.job && S.job.id, ls = S.lifestyle || 'binhthuong', st = S.stats;
    const ow = S.overwork || 0;
    if (pa >= 75) {
      add(8, 'Tuổi già, ra đi thanh thản trong giấc ngủ');
      add(3, 'Viêm phổi khi trời trở lạnh');
      add(3, 'Suy tim tuổi già');
      add(2, 'Ngã trong nhà tắm, gãy cổ xương đùi rồi biến chứng');
      add(1.5, 'Hóc thức ăn trong bữa cơm');
      add(1, 'Suy đa tạng tuổi già');
      add(has('spouse') ? 0 : 1, 'Ra đi lặng lẽ một mình, mấy hôm sau hàng xóm mới biết');
    }
    if (pa < 75) {
      add(4, 'Tai nạn giao thông');
      add(pa >= 35 ? 3 + ow : 0.5 + ow, 'Nhồi máu cơ tim');
      add(pa >= 40 ? 3 + ow : 0.4 + ow, 'Đột quỵ');
      add(1, 'Đuối nước khi đi tắm sông');
      add(0.6, 'Điện giật khi sửa đồ điện trong nhà');
      add(0.6, 'Ngộ độc thực phẩm nặng');
      add(0.6, 'Sốt xuất huyết biến chứng');
      add(0.4, 'Cháy nhà lúc nửa đêm');
      add(0.3, 'Sét đánh khi trú mưa dưới gốc cây');
      add(0.3, 'Bị chó dại cắn, không tiêm phòng kịp');
      add(0.3, 'Sốc phản vệ do dị ứng thuốc');
      add(0.2, 'Ngạt khí than khi đóng kín cửa sưởi ấm');
      add(0.15, 'Biển quảng cáo đổ trúng trong cơn bão');
      add(pa < 40 ? 0.8 : 0.2, 'Tai nạn khi đi phượt đèo');
      add(pa >= 18 && ls === 'sangchanh' ? 1.5 : 0, 'Say rượu lái xe sau bữa tiệc');
      add(pa >= 18 ? 0.8 : 0, 'Ngộ độc rượu pha cồn công nghiệp');
      add(S.money < 0 ? 1.5 : 0, 'Bị xã hội đen đòi nợ hành hung');
      add(st.health < 30 ? 2 : 0, 'Cơ thể suy kiệt, gục ngã giữa đường');
      add(ow >= 2 ? 3 : 0, 'Đột tử khi đang tăng ca lúc 2 giờ sáng');
      add(S.abroad ? 1.5 : 0, 'Tai nạn lao động nơi đất khách');
      add(S.social && S.social.followers > 5e5 ? 0.6 : 0, 'Tai nạn khi quay clip mạo hiểm câu view');
    }
    const J = {
      cuuhoa: 'Hy sinh khi lao vào đám cháy cứu người', phicong: 'Tai nạn máy bay', vdv_vo: 'Chấn thương sọ não sau một trận đấu',
      esports: 'Đột tử sau nhiều ngày thức trắng luyện game', streamer: 'Đột tử sau phiên livestream 20 tiếng', nongdan: 'Ngộ độc thuốc trừ sâu khi phun thuốc',
      xaydung: 'Ngã từ giàn giáo công trình', taixe: 'Tai nạn khi chạy xe đêm', canhsat: 'Hy sinh khi truy bắt tội phạm', bacsi: 'Kiệt sức sau ca trực 36 tiếng',
      kinhdoanh: 'Nhồi máu cơ tim giữa buổi đàm phán', caulong: 'Đột tử trên sân tập', tiepvien: 'Tai nạn máy bay'
    };
    if (jid && J[jid] && pa < 70) add(jid === 'cuuhoa' || jid === 'canhsat' ? 4 : 2.5, J[jid]);
    let r = Math.random() * pool.reduce((s, p) => s + p[0], 0);
    for (const p of pool) { r -= p[0]; if (r <= 0) return p[1]; }
    return 'Đột quỵ';
  }
  // khi sức khỏe về 0 mà không có bệnh cụ thể
  function wasteCause(pa) {
    if ((S.overwork || 0) >= 2) return 'Kiệt sức vì làm việc quá sức';
    if (S.stats.happy < 15) return 'Suy kiệt vì trầm cảm kéo dài, không ai hay biết';
    if (S.jail && S.jail.camp) return 'Kiệt sức, bị đánh đập trong khu lừa đảo ở Campuchia';
    if (S.money < 0) return 'Suy kiệt vì lao lực trả nợ';
    if (pa >= 75) return 'Tuổi già sức yếu, suy đa tạng';
    return U.pick(['Sức khỏe suy kiệt', 'Suy dinh dưỡng và kiệt sức', 'Cơ thể suy sụp sau nhiều năm không chăm sóc']);
  }
  function die(cause) {
    if (!S || S.dead) return;
    const pa = P().age;
    P().alive = false; S.pending = [];
    const sc = score();
    S.dead = { cause, age: pa, year: S.year, score: sc, rank: rankOf(sc), epitaph: epitaph() };
    addLog('Bạn qua đời ở tuổi ' + pa + '. ' + cause + '.', 'bad', '🕯️');
    // đồ gia truyền mới để lại cho con cháu
    S.heirlooms = S.heirlooms || [];
    const gained = HEIRLOOMS.filter((h) => !S.heirlooms.includes(h.id) && (() => { try { return !!h.cond(S); } catch (e) { return false; } })());
    gained.forEach((h) => S.heirlooms.push(h.id));
    S.dead.heirlooms = gained.map((h) => h.icon + ' ' + h.name);
    const sp = alive('spouse')[0], kids = S.people.filter((x) => x.role === 'child');
    meta.lives.unshift({ fullName: fullName(P()), born: S.born, died: S.year, age: pa, cause, score: sc, rank: S.dead.rank, generation: S.generation,
      dyn: S.dyn || null, gender: P().gender, cityName: D.cityName(S.city), job: S.job ? D.CAREERS[S.job.id].levels[S.job.level].title : (S.retired ? 'Nghỉ hưu' : ''), worth: Math.round(S.money + assetsValue()),
      spouse: sp ? fullName(sp) : (S.people.find((x) => x.wasSpouse) ? fullName(S.people.find((x) => x.wasSpouse)) + ' (đã ly hôn)' : null), kids: kids.map((k) => k.firstName + (k.alive ? '' : ' †')), heirlooms: S.heirlooms.slice(), company: S.company ? S.company.name : null, karma: S.karma });
    meta.lives = meta.lives.slice(0, 120);
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
      kidsCount: S.people.filter((p) => p.role === 'child').length, spouseName: (() => { const sp = S.people.find((p) => p.role === 'spouse'); return sp ? fullName(sp) : ''; })(),
      achievements: Object.keys(S.ach).map((id) => ACH[id]).filter(Boolean).map((a) => ({ id: a.id, name: a.name, icon: a.icon })),
      goals: S.goals.map((g) => ({ text: (D.GOALS.find((x) => x.id === g.id) || {}).text || g.id, done: g.done })),
      heirs: S.people.filter((p) => p.alive && p.role === 'child').map((p) => ({ id: p.id, name: p.firstName, age: p.age, gender: p.gender, info: childInfo(p) })),
      generation: S.generation, heirlooms: S.dead.heirlooms || [], allHeirlooms: heirloomsOf(S).map((h) => h.icon + ' ' + h.name),
      scenario: scenarioView(), rebirth: rebirthPreview(), afterlife: afterlifeOf(),
    };
  }
  // phán xét cuối đời: nhiều đức (nghiệp ≥ 65) lên thiên đàng, ít đức (< 35) xuống địa ngục, ở giữa thì chờ đầu thai
  function afterlifeOf() {
    if (!S || !S.dead) return null;
    const k = Math.round(S.karma);
    if (k >= 65) return { kind: 'heaven', karma: k, icon: '☁️', title: 'Lên thiên đàng', text: 'Một đời sống tử tế, giúp người nhiều hơn hại người. Cửa thiên đàng mở rộng, ánh sáng vàng ấm áp đón linh hồn bạn.' };
    if (k < 35) return { kind: 'hell', karma: k, icon: '🔥', title: 'Xuống địa ngục', text: 'Nghiệp ác chất chồng. Quỷ sứ đầu trâu mặt ngựa áp giải linh hồn bạn qua cầu Nại Hà, vạc dầu đang sôi sùng sục chờ sẵn.' };
    return { kind: 'limbo', karma: k, icon: '🌫️', title: 'Lơ lửng cõi trung ấm', text: 'Công tội ngang nhau, chưa đủ để lên thiên đàng cũng chưa tới mức xuống địa ngục. Linh hồn bạn lang thang trong sương chờ ngày đầu thai.' };
  }
  function afterlifeScene() {
    const a = afterlifeOf(); if (!a) return null;
    if (a.kind === 'heaven') return sceneFor('heaven', { time: 'day', anim: 'cheer', expr: 'happy', fx: 'sparkle', shot: 'orbit', say: 'Thanh thản quá…' });
    if (a.kind === 'hell') return sceneFor('hell', { time: 'night', anim: 'scared', expr: 'scared', fx: 'smoke', shot: 'dramatic', say: 'Tha cho tôi!' });
    return sceneFor('temple', { time: 'night', weather: 'fog', anim: 'pray', expr: 'sad', fx: 'smoke', shot: 'wide', say: 'Mình đang ở đâu thế này…' });
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
    const estate = Math.max(0, old.money + assetsValue(old) - (old.company ? Math.round(old.company.val * old.company.own) : 0)); // công ty truyền nguyên vẹn, không chia
    // di sản: trừ ma chay + phí công chứng/định giá, chia đều cho các con VÀ vợ/chồng còn sống (luật thừa kế hàng thứ nhất),
    // rồi nộp thuế 10% trên phần vượt 10 triệu; tài sản bán gấp bị ép giá
    const spouseLeft = old.people.find((p) => p.alive && p.role === 'spouse');
    const firesale = Math.round((assetsValue(old) - (old.company ? Math.round(old.company.val * old.company.own) : 0)) * 0.12);
    const funeral = Math.min(estate, Math.round((U.rand(80e6, 200e6) + estate * 0.015) / 1e6) * 1e6);
    const pool = Math.max(0, estate - funeral - firesale), each = pool / (heirs.length + (spouseLeft ? 1 : 0));
    const inhTax = Math.max(0, Math.round((each - 10e6) * 0.1 / 1e6) * 1e6);
    const share = Math.max(0, Math.round(each - inhTax));
    S = baseState(old.generation + 1, old.year, old.city);
    S.diff = old.diff || 'thuong'; // con cháu chơi tiếp cùng độ khó
    S.born = old.year - heir.age;
    S.player = { id: 'player', role: 'player', firstName: heir.firstName, middleName: heir.middleName, lastName: heir.lastName, gender: heir.gender, age: heir.age, alive: true, appearance: heir.appearance, kind: 'human' };
    const deadParent = Object.assign({}, old.player, { id: U.uid('p'), role: old.player.gender === 'f' ? 'mother' : 'father', alive: false, relation: heir.relation });
    S.people.push(deadParent);
    const other = old.people.find((p) => p.alive && p.role === 'spouse');
    if (other) S.people.push(Object.assign({}, other, { role: other.gender === 'f' ? 'mother' : 'father', relation: U.randi(60, 90) }));
    heirs.filter((p) => p !== heir).forEach((p) => S.people.push(Object.assign({}, p, { role: 'sibling', relation: U.randi(50, 85) })));
    old.people.filter((p) => p.alive && p.role === 'pet').forEach((p) => S.people.push(Object.assign({}, p)));
    // cơ nghiệp gia đình: công ty truyền lại cho người con nối dõi
    if (old.company) { S.company = Object.assign({}, old.company, { bad: 0, boost: 0, inherited: (old.company.inherited || 0) + 1, heir: true, run: 0 }); S.flags.co_heir = S.year; }
    // cậu ấm cô chiêu: lớn lên trong nhung lụa → cám dỗ, anh em tranh chấp, kẻ xấu nhòm ngó (xem richYear)
    if (share + (S.company ? S.company.val * S.company.own : 0) >= 3e9) { S.flags.richkid = true; S.flags.heirOf = S.year; }
    // dòng họ: cùng gia phả, giữ đồ gia truyền và căn nhà đã trang trí
    S.dyn = old.dyn || U.uid('d'); S.heirlooms = (old.heirlooms || []).slice(); S.furn = old.furn ? Object.assign({}, old.furn) : null;
    if (old.flags.nhathoho) S.flags.nhathoho = old.flags.nhathoho;
    if (meta.lives[0] && meta.lives[0].dyn === S.dyn) meta.lives[0].heir = heir.firstName;
    S.reborn = null;
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
    // con chưa đủ 18 tuổi: tiền thừa kế gửi giữ trong tài khoản riêng, 18 tuổi mới nhận — không ai “giữ hộ” rồi tiêu mất
    if (heir.age < 18 && share > 0) { S.trust = share; S.money = 0; }
    // con nối dõi thừa hưởng học lực từ cách bố mẹ nuôi dạy, cộng phúc từ đồ gia truyền
    if (heir.smart != null) S.stats.smarts = r100(S.stats.smarts * 0.4 + heir.smart * 0.6);
    const hl = heirloomsOf(S);
    hl.forEach((h) => Object.keys(h.bonus).forEach((k) => { if (k === 'karma') S.karma = r100(S.karma + h.bonus[k]); else S.stats[k] = r100(S.stats[k] + h.bonus[k]); }));
    if (hl.length) addLog('Đồ gia truyền của dòng họ: ' + hl.map((h) => h.icon + ' ' + h.name).join(', ') + '.', 'milestone', '🏺');
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
    if (estate > 0) addLog('Di sản ' + fmtMoney(estate) + ': ma chay ' + fmtMoney(funeral) + (firesale > 0 ? ', bán gấp nhà đất bị ép giá mất ' + fmtMoney(firesale) : '') + ', chia ' + (heirs.length + (spouseLeft ? 1 : 0)) + ' phần (' + heirs.length + ' người con' + (spouseLeft ? ' + ' + (old.player.gender === 'f' ? 'bố' : 'mẹ') + ' bạn' : '') + '), thuế thừa kế 10% ' + fmtMoney(inhTax) + '.', 'neutral', '📜');
    if (S.company) addLog('Bạn tiếp quản ' + S.company.name + ', nhưng cổ đông và nhân viên cũ chưa phục. Phải tự tay điều hành nhiều năm thì công ty mới chạy hết công suất.', 'neutral', '🏢');
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
    if (S.jail) return '⛓️ Đang thụ án (còn ' + (S.jail.until - S.year) + ' năm)';
    if (S.job) { const c = D.CAREERS[S.job.id]; return c.levels[S.job.level].title + (c.levels[S.job.level].title.includes(c.title) ? '' : ' · ' + c.title); }
    if (S.edu.inSchool) { if (S.edu.level === 'university') return 'Sinh viên năm ' + S.edu.uniYear; if (S.edu.level === 'preschool') return 'Bé mẫu giáo'; if (S.edu.level === 'vocational') return 'Học viên trường nghề'; return 'Học sinh lớp ' + S.edu.grade; }
    if (pa < 3) return 'Em bé';
    if (pa < 6) return 'Trẻ con';
    if (S.retired) return 'Nghỉ hưu';
    if (pa >= 60) return 'Người cao tuổi';
    if (S.flags.kolFull && pa >= 16) return '📱 KOL / Streamer';
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
      era: eraOf(S.year).name, jail: S.jail ? (S.jail.camp ? { camp: true, kind: S.camp ? S.camp.kind : 'scam', years: S.year - S.jail.since, reason: S.jail.reason } : { left: S.jail.until - S.year, reason: S.jail.reason, total: S.jail.total }) : null, wanted: !!S.flags.truyna && !S.jail,
      company: companyView(), scenario: scenarioView(),
      education: { label: eduLabel(), level: S.edu.level, grade: S.edu.grade, performance: S.edu.perf, inSchool: S.edu.inSchool, degrees: S.edu.degrees.slice(), actions: S.dead ? [] : eduActions() },
      job: S.job ? (() => { const c = D.CAREERS[S.job.id]; return { id: c.id, title: c.title, icon: c.icon, levelTitle: c.levels[S.job.level].title + (S.job.club ? ' · ' + S.job.club.name : ''), club: S.job.club ? S.job.club.name + ' (' + S.job.club.country + ', thu nhập ×' + S.job.club.mult + ')' : null, level: S.job.level, maxLevel: c.levels.length - 1, salaryText: c.prize ? payLabel(c, S.job.level, monthly()) + (S.job.lastPrize ? ' · năm qua thưởng ' + D.fmtShort(S.job.lastPrize) : '') : D.fmtShort(monthly()) + '/tháng', performance: S.job.perf, years: S.job.years, rep: repInfo(), actions: S.dead ? [] : jobActions(), incidents: c.incidents || [], desc: c.desc || '' }; })() : null,
      retired: S.retired, pensionText: S.pension ? D.fmtShort(S.pension) + '/tháng' : null,
      people: S.people.filter((x) => x.alive || (!x.gone && x.deathYear && S.year - x.deathYear < 3)).map((x) => ({
        id: x.id, name: x.firstName, fullName: x.kind === 'human' ? fullName(x) : x.firstName, role: x.role, roleLabel: roleLabel(x) + (x.real ? ' 🌐 người chơi thật' : '') + (x.foreign ? ' · ' + x.foreign : ''), age: x.age, alive: x.alive, relation: x.relation,
        kind: x.kind || 'human', gender: x.gender, appearance: x.appearance, petColor: x.petColor || null, actions: actionsFor(x),
        info: x.role === 'child' ? childInfo(x) : x.role === 'pet' ? (() => { const s = petSpecies(x); return s.icon + ' ' + s.name + ' · ' + x.age + '/' + s.life + ' năm tuổi thọ · kỹ năng ' + (x.skill || 0) + '/100'; })() : null,
        petIcon: x.role === 'pet' ? petSpecies(x).icon : null,
      })),
      assets: S.assets.map((a) => { const k = assetPerk(a); return { id: a.id, type: a.type, name: a.name, value: a.value, valueText: fmtMoney(a.value), icon: a.icon, rented: !!a.rented, canRent: !!k.rent, rentText: k.rent ? '~' + D.fmtShort(Math.round(a.value * k.rent / 12)) + '/tháng' : '', perkText: a.rented ? 'Đang cho thuê' : perkText(Object.assign({ type: a.type }, k, { rent: 0 }), a.value) }; }),
      prestige: prestige(), prestigeRank: prestigeRank(prestige()), assetJoy: S.assetJoy || 0,
      market: (() => { const m = market(), ph = MARKET[m.phase]; return { phase: m.phase, label: ph.label, icon: ph.icon, re: Math.round((m.re - 1) * 100), st: Math.round((m.st - 1) * 100) }; })(),
      loans: (S.loans || []).map((l) => ({ name: l.name, leftText: fmtMoney(l.left), payText: fmtMoney(l.pay), years: l.years })), loanLate: S.loanLate || 0,
      orientation: S.flags.lgbt_aware || (S.orientation || 'straight') === 'straight' ? ORIENT_LABEL[S.orientation || 'straight'] : null, lgbtOut: !!S.flags.lgbt_told,
      english: Math.round(S.english || 0), englishText: englishLabel(S.english || 0), abroadText: S.xk ? XK[S.xk.c].name + ' (xuất khẩu lao động)' : S.abroad ? S.abroad.country + (S.abroad.settled ? ' (định cư)' : '') : S.edu.abroad && S.edu.inSchool ? 'du học ' + S.edu.abroad.country : null,
      parenting: Object.assign({}, parentingDef()), disowned: !!S.flags.disowned, parentMajor: S.flags.parentMajor && D.MAJORS[S.flags.parentMajor] ? D.MAJORS[S.flags.parentMajor].name : null,
      interests: interestProfile().slice(0, 4).map((x) => Object.assign(x, { careers: D.INTERESTS[x.id].careers.slice(0, 4).map((c) => D.CAREERS[c].title) })), route: S.flags.route ? D.INTERESTS[S.flags.route].route : null, path: (() => { try { return pathView(); } catch (e) { return null; } })(), youth: youthView(), vocTrade: S.edu.voc ? (D.VOC_TRADES.find((v) => v.id === S.edu.voc) || {}).name : null,
      illnesses: visibleIlls().map((i) => ({ id: i.id, name: illLabel(i), severity: Math.round(illDrain(i)), incurable: !!i.incurable, cancer: !!i.cancer, neglect: neglectOf(i), risk: escNames(i).join(', ') })),
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
    return adopt(KN.store.get(keyOf(MODE), null));
  }
  function adopt(s) {
    if (!(s && s.v === 1 && s.player && s.stats)) { if (s === null) S = null; return false; }
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
    newLife, ageUp, choose, activities, doActivity, interact, eduAction, jobAction, jobListings, applyJob, shopItems, buy, buyLoan, sell, rentAsset,
    deathInfo, deathScene, afterlifeScene, continueAs, demoScene, view, onlineSnapshot, remoteEffect, setMode, peekSave, getMode: () => MODE,
    choiceOdds,
    jobOdds, interactOdds, haggleInfo, miniNeed, companyOptions, foundCompany, eras: () => ERAS.slice(),
    petShop, buyPet, furnitureView, buyFurniture, familyTree, onlineSibling, onlineParentDied, biography,
    rebirthPreview, scenarioView, scenarios: () => SCENARIOS.map((s) => ({ id: s.id, name: s.name, icon: s.icon, desc: s.desc, goal: s.goal, born: s.born, done: (meta.scnDone || {})[s.id] || 0 })),
    miniContext: () => (S && S.player ? { jobId: S.job ? S.job.id : null, ys: S.ys ? S.ys.id : null, age: P().age, gender: P().gender, stats: Object.assign({}, S.stats), appearance: P().appearance, name: P().firstName, eduLevel: S.edu.level, major: S.edu.major } : null),
    mgrState, mgrSave, mgrNews, weddingCard, weddingSetCode, weddingGuest, onlineMarry, onlineDivorce, onlineSpouse, onlineMoney, worldEvent, worldKinds: () => Object.keys(WORLD), dailyChallenge, setChallenge, challengeResult,
    hasLife: () => !!(S && S.player),
    isDead: () => !!(S && S.dead),
    pending: () => (S ? S.pending.slice() : []),
    currentScene: () => (S ? (S.dead ? deathScene() : dailyScene()) : demoScene(0)),
    meta: () => JSON.parse(JSON.stringify(meta)),
    save, load, slots, saveSlot, loadSlot, deleteSlot, exportCode, importCode,
    giftOptions, setLifestyle, buyUnlock, riskReport, partTimeOptions, socialView, socialAction, socialOffer, socialReply, liveReply, leagueView: () => (S ? leagueView() : null), leagueNext, leagueResult, chainInfo: () => (S ? chainInfo() : null), chainAction, xkView: () => (S ? xkView() : null), xkHome, fishView: () => (S ? fishView() : null), insView: () => (S ? insView() : null), decorView: () => (S ? decorView() : null), homeScene: () => (S ? sceneFor('home', { anim: 'idle' }) : null), decorBuy, decorMove, decorSell, farmView: () => (S ? farmView() : null), myCard, addRealFriend, setMyCardCode: (c) => { if (S) { S.flags.myCardCode = c; changed(); } }, myCardCode: () => (S && S.flags.myCardCode) || null, officeView: () => (S ? officeView() : null), liveStart, liveTick, liveAnswer, liveAct, liveEnd, pkStart, pkEnd, photoStart, photoPost, feedStart, feedAct, feedEnd, liveActive: () => !!(S && S.liveSess), socialNiche, socialVerify, socialInbox, blackLoanView, blackLoan, blackRepay, huiView, huiJoin, huiTake, jobMarketView, rivalsView, destinyPreview, dareCode, dareDecode, dareResult, skinsView, groupsView, groupJoin, groupCreate, datingView, datingSwipe, datingDate, interestProfile: () => (S ? interestProfile() : []), analyzeInterest,
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
