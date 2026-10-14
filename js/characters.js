/* Một Kiếp Người — procedural 3D people & pets (KN.Characters). See SPEC §4.1, §4.2, §4.4. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const THREE = window.THREE;
  const U = KN.util;

  const LOOPS = ['idle', 'walk', 'run', 'dance', 'cry', 'sad', 'talk', 'think', 'sit', 'sleep', 'eat', 'drink', 'study', 'type', 'phone', 'sick', 'crawl', 'lift', 'pray', 'swim', 'drive', 'cook', 'sing', 'dead'];
  const ONESHOTS = ['wave', 'cheer', 'jump', 'angry', 'laugh', 'shrug', 'hug', 'love', 'fall', 'bow', 'clap', 'point', 'facepalm', 'scared', 'nod', 'shake'];
  const ANIMS = LOOPS.concat(ONESHOTS);
  const EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'sleepy', 'love', 'sick', 'scared'];

  if (!THREE) { KN.Characters = { create() { return null; }, ANIMS, EXPRESSIONS }; return; }

  const SEATED = new Set(['sit', 'eat', 'drink', 'study', 'type']);
  const LYING = new Set(['sleep', 'dead']);
  const DEFAULT_EXPR = {
    cry: 'sad', sad: 'sad', laugh: 'happy', cheer: 'happy', dance: 'happy', jump: 'happy', clap: 'happy', sing: 'happy',
    love: 'love', angry: 'angry', sleep: 'sleepy', dead: 'sleepy', sick: 'sick', scared: 'scared', fall: 'scared',
    wave: 'happy', hug: 'happy', swim: 'happy', bow: 'happy', crawl: 'happy', facepalm: 'sad', eat: 'happy', drive: 'happy',
  };
  const DUR = { wave: 1.7, cheer: 1.9, jump: 1.15, angry: 1.9, laugh: 2.1, shrug: 1.4, hug: 2.3, love: 2.1, fall: 2.2, bow: 1.7, clap: 1.8, point: 1.5, facepalm: 1.9, scared: 1.9, nod: 1.1, shake: 1.2 };
  const BABY_OK = new Set(['crawl', 'sleep', 'cry', 'laugh', 'idle', 'cheer', 'dead']);
  const PET_OK = new Set(['idle', 'walk', 'run', 'sit', 'sleep', 'jump', 'cheer', 'dead']);

  // ---------- caches ----------
  const geoCache = new Map();
  function geo(key, make) { let g = geoCache.get(key); if (!g) { g = make(); geoCache.set(key, g); } return g; }
  const q = (v) => Math.max(0.002, Math.round(v * 400) / 400);
  const UNIT_SPHERE = () => geo('usph', () => new THREE.SphereGeometry(1, 24, 16));
  const LOW_SPHERE = () => geo('lsph', () => new THREE.SphereGeometry(1, 12, 8));
  const CAP_GEO = () => geo('hcap', () => new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.56));
  const BACK_SHELL = () => geo('bshell', () => new THREE.SphereGeometry(1, 22, 14, Math.PI - 0.55, Math.PI + 1.1, 0.25, Math.PI * 0.75));
  const capsule = (r, len) => geo(`cap|${q(r)}|${q(len)}`, () => new THREE.CapsuleGeometry(q(r), q(Math.max(0.001, len)), 6, 14));
  const cylG = (rt, rb, h, seg = 16, open = false) => geo(`cyl|${q(rt)}|${q(rb)}|${q(h)}|${seg}|${open}`, () => new THREE.CylinderGeometry(q(rt), q(rb), q(h), seg, 1, open));
  const boxG = (w, h, d) => geo(`box|${q(w)}|${q(h)}|${q(d)}`, () => new THREE.BoxGeometry(q(w), q(h), q(d)));
  const coneG = (r, h, seg = 20) => geo(`cone|${q(r)}|${q(h)}|${seg}`, () => new THREE.ConeGeometry(q(r), q(h), seg));
  const torusG = (r, t, arc) => geo(`tor|${q(r)}|${q(t)}|${arc.toFixed(3)}`, () => new THREE.TorusGeometry(q(r), q(t), 8, 20, arc));

  const matCache = new Map();
  function mat(color, o) {
    o = o || {};
    const key = color + '|' + (o.rough ?? 0.72) + '|' + (o.metal || 0) + '|' + (o.opacity ?? 1) + '|' + (o.emissive || '') + '|' + (o.side || 0);
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color), roughness: o.rough ?? 0.72, metalness: o.metal || 0,
        transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, side: o.side ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 0.8; }
      matCache.set(key, m);
    }
    return m;
  }
  function mesh(g, m, parent, x, y, z, shadow = true) {
    const o = new THREE.Mesh(g, m);
    o.position.set(x || 0, y || 0, z || 0);
    o.castShadow = shadow; o.receiveShadow = false;
    if (parent) parent.add(o);
    return o;
  }
  function ell(m, parent, sx, sy, sz, x, y, z, low) {
    const o = mesh(low ? LOW_SPHERE() : UNIT_SPHERE(), m, parent, x, y, z);
    o.scale.set(q(sx), q(sy), q(sz));
    return o;
  }
  function pivot(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); parent.add(g); return g; }

  const DEFAULT_APP = { skin: '#e6b48f', hair: '#1c1410', hairStyle: 'short', eyes: '#2a1b12', top: '#d9534f', topStyle: 'tshirt', bottom: '#2f3b52', shoes: '#2b2b2b', glasses: false, beard: false, hat: null, build: 0.5, height: 0.5 };

  // ---------- body dimensions by age ----------
  const HT = [[0, 0.62], [1, 0.76], [2, 0.88], [3, 0.97], [5, 1.1], [7, 1.22], [10, 1.38], [12, 1.5], [14, 1.6], [16, 1.65], [18, 1.67]];
  function dims(age, gender, app) {
    const a = Math.max(0, age || 0);
    let H = HT[HT.length - 1][1];
    for (let i = 0; i < HT.length - 1; i++) if (a >= HT[i][0] && a < HT[i + 1][0]) { H = U.lerp(HT[i][1], HT[i + 1][1], (a - HT[i][0]) / (HT[i + 1][0] - HT[i][0])); break; }
    const adult = U.clamp((a - 10) / 8, 0, 1);
    H += (gender === 'm' ? 0.05 : -0.04) * adult + ((app.height ?? 0.5) - 0.5) * 0.16 * Math.max(0.3, adult);
    if (a > 70) H -= Math.min(0.06, (a - 70) * 0.0025);
    const headRatio = a < 1 ? 0.27 : a < 3 ? 0.25 : a < 6 ? 0.215 : a < 10 ? 0.19 : a < 14 ? 0.17 : 0.152;
    const headH = H * headRatio;
    const legLen = H * (a < 2 ? 0.33 : a < 6 ? 0.41 : a < 12 ? 0.45 : 0.47);
    const neck = H * (a < 3 ? 0.02 : 0.034);
    const torso = H - legLen - headH - neck;
    const bw = 0.86 + (app.build ?? 0.5) * 0.36;
    const ws = Math.pow(H / 1.67, 0.82);
    const male = gender === 'm';
    const babyFat = a < 4 ? 1.18 : 1;
    const d = {
      H, age: a, adult, legLen, neck, torso, headR: headH * 0.5,
      shW: (male ? 0.4 : 0.35) * ws * bw * (0.86 + 0.14 * adult),
      hipW: (male ? 0.17 : 0.2) * ws * bw,
      chestR: (male ? 0.158 : 0.145) * ws * bw * babyFat,
      waistR: (male ? 0.138 : 0.125) * ws * bw * babyFat * (0.9 + (app.build ?? 0.5) * 0.25),
      uaR: 0.044 * ws * bw * babyFat, faR: 0.037 * ws * bw * babyFat,
      thR: 0.066 * ws * bw * babyFat, shR: 0.049 * ws * bw * babyFat,
      upperArm: torso * 0.56, forearm: torso * 0.48,
      thigh: legLen * 0.5, shin: legLen * 0.44, footH: legLen * 0.06,
      ws, senior: U.clamp((a - 58) / 25, 0, 1),
    };
    d.seatH = d.shin + d.footH * 1.4;
    return d;
  }

  // ---------- pose model ----------
  const K = ['by', 'bx', 'bz', 'lie', 'hrx', 'hry', 'hrz', 'srx', 'sry', 'srz', 'crx', 'cry', 'crz', 'nrx', 'nry', 'hdx', 'hdy', 'hdz',
    'sLx', 'sLy', 'sLz', 'sRx', 'sRy', 'sRz', 'eL', 'eR', 'tLx', 'tLz', 'tRx', 'tRz', 'kL', 'kR', 'fL', 'fR'];
  const I = {}; K.forEach((k, i) => (I[k] = i));
  const N = K.length;
  const S = Math.sin, C = Math.cos, PI = Math.PI;
  const pos = (v) => (v > 0 ? v : 0);

  function base(o) { o.fill(0); o[I.sLz] = 0.09; o[I.sRz] = -0.09; o[I.eL] = -0.14; o[I.eR] = -0.14; }
  function seat(o, d, t) {
    o[I.by] = d.seatH - d.legLen; o[I.tLx] = -1.52; o[I.tRx] = -1.52; o[I.kL] = 1.5; o[I.kR] = 1.5; o[I.tLz] = 0.07; o[I.tRz] = -0.07;
    o[I.crx] = S(t * 2) * 0.012; o[I.srx] = 0.05;
  }
  function lie(o, d) { o[I.lie] = 1; o[I.by] = d.chestR * 0.85 - d.legLen; o[I.sLz] = 0.12; o[I.sRz] = -0.12; o[I.eL] = -0.1; o[I.eR] = -0.1; }

  const POSES = {
    idle(o, t, d) {
      o[I.crx] = S(t * 1.9) * 0.018; o[I.hrz] = S(t * 0.45) * 0.022; o[I.bx] = S(t * 0.45) * 0.012;
      o[I.hdy] = S(t * 0.31) * 0.14 + S(t * 0.73) * 0.04; o[I.hdx] = S(t * 0.5) * 0.03;
      o[I.sLx] = S(t * 1.1) * 0.03; o[I.sRx] = S(t * 1.1 + 1) * 0.03;
      o[I.tLz] = 0.03; o[I.tRz] = -0.03; o[I.kL] = 0.04 + pos(S(t * 0.45)) * 0.06; o[I.kR] = 0.04 + pos(-S(t * 0.45)) * 0.06;
    },
    walk(o, t) {
      const w = t * 6.6;
      o[I.tLx] = -S(w) * 0.5; o[I.tRx] = S(w) * 0.5;
      o[I.kL] = pos(S(w - 1.4)) * 0.75 + 0.05; o[I.kR] = pos(S(w + PI - 1.4)) * 0.75 + 0.05;
      o[I.fL] = -S(w) * 0.15; o[I.fR] = S(w) * 0.15;
      o[I.sLx] = S(w) * 0.42; o[I.sRx] = -S(w) * 0.42; o[I.eL] = -0.25 - pos(-S(w)) * 0.35; o[I.eR] = -0.25 - pos(S(w)) * 0.35;
      o[I.by] = -Math.abs(C(w)) * 0.03 + 0.012; o[I.hry] = S(w) * 0.08; o[I.cry] = -S(w) * 0.1; o[I.hdx] = -0.03;
    },
    run(o, t) {
      const w = t * 10.5;
      o[I.tLx] = -S(w) * 0.85; o[I.tRx] = S(w) * 0.85;
      o[I.kL] = pos(S(w - 1.2)) * 1.3 + 0.15; o[I.kR] = pos(S(w + PI - 1.2)) * 1.3 + 0.15;
      o[I.sLx] = S(w) * 0.8; o[I.sRx] = -S(w) * 0.8; o[I.eL] = -1.4; o[I.eR] = -1.4;
      o[I.by] = Math.abs(S(w)) * 0.06 - 0.02; o[I.srx] = 0.18; o[I.hdx] = -0.12; o[I.hry] = S(w) * 0.12; o[I.cry] = -S(w) * 0.16;
    },
    dance(o, t) {
      const b = t * 6.2;
      o[I.by] = -Math.abs(S(b)) * 0.06; o[I.hrz] = S(b * 0.5) * 0.12; o[I.hry] = S(b * 0.25) * 0.3;
      o[I.sLz] = 0.6 + S(b) * 0.4; o[I.sRz] = -0.6 - S(b + PI) * 0.4; o[I.sLx] = -0.5 + S(b * 0.5) * 0.5; o[I.sRx] = -0.5 - S(b * 0.5) * 0.5;
      o[I.eL] = -1.3; o[I.eR] = -1.3; o[I.hdx] = S(b) * 0.1; o[I.hdz] = S(b * 0.5) * 0.12;
      o[I.tLx] = -pos(S(b * 0.5)) * 0.35; o[I.tRx] = -pos(-S(b * 0.5)) * 0.35; o[I.kL] = 0.15 + pos(S(b * 0.5)) * 0.5; o[I.kR] = 0.15 + pos(-S(b * 0.5)) * 0.5;
    },
    cry(o, t) {
      o[I.sLx] = -1.05; o[I.sLz] = -0.25; o[I.sRx] = -1.05; o[I.sRz] = 0.25; o[I.eL] = -2.15; o[I.eR] = -2.15;
      o[I.hdx] = 0.38; o[I.srx] = 0.16 + S(t * 13) * 0.02; o[I.crx] = 0.1 + S(t * 13) * 0.025; o[I.by] = S(t * 13) * 0.004;
      o[I.kL] = 0.08; o[I.kR] = 0.08;
    },
    sad(o, t) {
      o[I.hdx] = 0.45; o[I.srx] = 0.16; o[I.crx] = 0.12 + S(t * 1.2) * 0.02; o[I.sLx] = 0.06; o[I.sRx] = 0.06; o[I.sLz] = 0.04; o[I.sRz] = -0.04; o[I.eL] = -0.05; o[I.eR] = -0.05;
      o[I.hdy] = S(t * 0.4) * 0.08; o[I.kL] = 0.05; o[I.kR] = 0.05;
    },
    talk(o, t) {
      POSES.idle(o, t);
      o[I.sRx] = -0.55 + S(t * 2.6) * 0.25; o[I.sRz] = -0.22 + S(t * 1.3) * 0.08; o[I.eR] = -1.05 + S(t * 3.1) * 0.3;
      o[I.sLx] = -0.22 + S(t * 1.7 + 1) * 0.18; o[I.eL] = -0.6 + S(t * 2.2) * 0.2; o[I.hdx] = S(t * 4.2) * 0.06; o[I.hdy] = S(t * 1.3) * 0.12; o[I.hdz] = S(t * 0.9) * 0.05;
    },
    think(o, t) {
      o[I.sRx] = -0.95; o[I.sRz] = -0.12; o[I.eR] = -2.3; o[I.sLx] = -0.62; o[I.sLz] = -0.32; o[I.eL] = -1.55;
      o[I.hdz] = 0.14 + S(t * 0.7) * 0.04; o[I.hdx] = -0.06; o[I.hdy] = S(t * 0.5) * 0.15; o[I.hrz] = S(t * 0.6) * 0.03; o[I.crx] = S(t * 1.9) * 0.015;
    },
    sit(o, t, d) { seat(o, d, t); o[I.sLx] = -0.5; o[I.sRx] = -0.5; o[I.eL] = -0.55; o[I.eR] = -0.55; o[I.sLz] = 0.05; o[I.sRz] = -0.05; o[I.hdy] = S(t * 0.35) * 0.18; },
    sleep(o, t, d) { lie(o, d); o[I.crx] = S(t * 1.3) * 0.03; o[I.hdy] = 0.25; o[I.kL] = 0.12; o[I.tLx] = -0.1; },
    dead(o, t, d) { lie(o, d); o[I.sLx] = -0.85; o[I.sLz] = -0.55; o[I.eL] = -1.7; o[I.sRx] = -0.85; o[I.sRz] = 0.55; o[I.eR] = -1.7; },
    eat(o, t, d) {
      seat(o, d, t); o[I.sLx] = -0.75; o[I.eL] = -1.35; o[I.sLz] = -0.12;
      const c = pos(S(t * 2.6)); o[I.sRx] = -0.75 - c * 0.35; o[I.eR] = -1.6 - c * 0.6; o[I.sRz] = 0.1; o[I.hdx] = 0.15 - c * 0.12;
    },
    drink(o, t, d) {
      seat(o, d, t); const up = (t % 3.2) < 1.3 ? 1 : 0;
      o[I.sRx] = up ? -1.25 : -0.6; o[I.eR] = up ? -2.2 : -1.25; o[I.sRz] = 0.15; o[I.hdx] = up ? -0.2 : 0.05; o[I.sLx] = -0.45; o[I.eL] = -0.6;
    },
    study(o, t, d) {
      seat(o, d, t); o[I.sLx] = -0.85; o[I.sRx] = -0.85; o[I.eL] = -1.45; o[I.eR] = -1.45; o[I.sLz] = -0.22; o[I.sRz] = 0.22;
      o[I.hdx] = 0.38 + S(t * 0.8) * 0.03; o[I.hdy] = S(t * 0.6) * 0.06;
    },
    type(o, t, d) {
      seat(o, d, t); o[I.sLx] = -0.42; o[I.sRx] = -0.42; o[I.eL] = -1.15 + S(t * 19) * 0.04; o[I.eR] = -1.15 + S(t * 17 + 1) * 0.04;
      o[I.sLz] = -0.12; o[I.sRz] = 0.12; o[I.hdx] = 0.28; o[I.srx] = 0.12;
    },
    phone(o, t) {
      POSES.idle(o, t); o[I.sRx] = -0.72; o[I.eR] = -1.85; o[I.sRz] = 0.18; o[I.sLx] = -0.3; o[I.eL] = -1.2; o[I.sLz] = -0.2; o[I.hdx] = 0.32; o[I.hdy] = 0;
    },
    sick(o, t) {
      const cough = (t % 2.4) < 0.55 ? S(((t % 2.4) / 0.55) * PI) : 0;
      o[I.srx] = 0.28 + cough * 0.2; o[I.crx] = cough * 0.15; o[I.sLx] = -0.5; o[I.eL] = -1.5; o[I.sLz] = -0.32;
      o[I.sRx] = -1.0 - cough * 0.2; o[I.eR] = -2.2; o[I.sRz] = 0.12; o[I.hdx] = 0.2 + cough * 0.2; o[I.kL] = 0.12; o[I.kR] = 0.12; o[I.hrz] = S(t * 0.7) * 0.04;
    },
    crawl(o, t, d) {
      const w = t * 4.2;
      o[I.hrx] = 1.32; o[I.by] = d.thigh * 0.98 - d.legLen;
      o[I.tLx] = -1.32 + S(w) * 0.28; o[I.tRx] = -1.32 - S(w) * 0.28; o[I.kL] = 1.5; o[I.kR] = 1.5;
      o[I.sLx] = -1.32 - S(w) * 0.3; o[I.sRx] = -1.32 + S(w) * 0.3; o[I.eL] = 0; o[I.eR] = 0; o[I.sLz] = 0.05; o[I.sRz] = -0.05;
      o[I.nrx] = -0.35; o[I.hdx] = -0.75; o[I.hdy] = S(t * 0.8) * 0.2;
    },
    lift(o, t) {
      const c = 0.5 + 0.5 * S(t * 3.2);
      o[I.eL] = -0.2 - c * 1.95; o[I.eR] = -0.2 - (1 - c) * 1.95; o[I.sLx] = -0.12; o[I.sRx] = -0.12; o[I.sLz] = 0.18; o[I.sRz] = -0.18;
      o[I.by] = -0.02; o[I.kL] = 0.15; o[I.kR] = 0.15; o[I.tLz] = 0.12; o[I.tRz] = -0.12; o[I.hdx] = -0.05;
    },
    pray(o, t) {
      o[I.sLx] = -0.82; o[I.sLz] = -0.48; o[I.eL] = -1.65; o[I.sRx] = -0.82; o[I.sRz] = 0.48; o[I.eR] = -1.65;
      const b = pos(S(t * 1.25)); o[I.srx] = 0.06 + b * 0.14; o[I.hdx] = 0.22 + b * 0.1;
    },
    swim(o, t) {
      const w = t * 4;
      o[I.hrx] = 0.55; o[I.by] = S(t * 2) * 0.03 - 0.06; o[I.sLx] = -1.6 + S(w) * 1.45; o[I.sRx] = -1.6 - S(w) * 1.45; o[I.eL] = -0.3; o[I.eR] = -0.3;
      o[I.tLx] = S(w * 2) * 0.3; o[I.tRx] = -S(w * 2) * 0.3; o[I.hdx] = -0.45; o[I.hdy] = S(w) * 0.3;
    },
    drive(o, t, d) {
      o[I.by] = d.legLen * 0.1 + S(t * 9) * 0.006; o[I.tLx] = -1.2; o[I.tRx] = -1.2; o[I.kL] = 0.95; o[I.kR] = 0.95; o[I.tLz] = 0.14; o[I.tRz] = -0.14;
      o[I.sLx] = -1.0; o[I.sRx] = -1.0; o[I.eL] = -0.45; o[I.eR] = -0.45; o[I.sLz] = 0.16; o[I.sRz] = -0.16; o[I.srx] = 0.12; o[I.hdx] = -0.1;
    },
    cook(o, t) {
      o[I.sLx] = -0.62; o[I.eL] = -0.85; o[I.sLz] = 0.05; o[I.sRx] = -0.72 + S(t * 5) * 0.2; o[I.sRz] = 0.18 + C(t * 5) * 0.16; o[I.eR] = -1.3;
      o[I.hdx] = 0.32; o[I.srx] = 0.08; o[I.hrz] = S(t * 2.5) * 0.03;
    },
    sing(o, t) {
      o[I.sRx] = -1.12; o[I.eR] = -2.18; o[I.sRz] = 0.25; o[I.sLz] = 0.6 + S(t * 1.6) * 0.4; o[I.sLx] = -0.6; o[I.eL] = -0.45;
      o[I.hrz] = S(t * 2.1) * 0.07; o[I.by] = -Math.abs(S(t * 2.1)) * 0.025; o[I.hdz] = S(t * 1.05) * 0.12; o[I.hdx] = -0.1;
      o[I.kL] = 0.1 + pos(S(t * 2.1)) * 0.2; o[I.kR] = 0.1 + pos(-S(t * 2.1)) * 0.2;
    },
    // ---- one-shots ----
    wave(o, t) { POSES.idle(o, t); o[I.sRz] = -2.55; o[I.sRx] = -0.1; o[I.eR] = -0.55 + S(t * 11) * 0.35; o[I.sRy] = S(t * 11) * 0.2; o[I.hdz] = -0.1; },
    cheer(o, t) {
      o[I.sLz] = 2.65; o[I.sRz] = -2.65; o[I.eL] = -0.25 + S(t * 9) * 0.15; o[I.eR] = -0.25 + S(t * 9 + 1) * 0.15;
      const h = pos(S(t * 6.8)); o[I.by] = h * 0.13; o[I.kL] = 0.2 + (1 - h) * 0.3; o[I.kR] = 0.2 + (1 - h) * 0.3; o[I.tLx] = -0.1 - (1 - h) * 0.25; o[I.tRx] = -0.1 - (1 - h) * 0.25; o[I.hdx] = -0.22;
    },
    jump(o, t) {
      let y = 0, crouch = 0;
      if (t < 0.28) crouch = S((t / 0.28) * PI * 0.5);
      else if (t < 0.78) { const k = (t - 0.28) / 0.5; y = 4 * k * (1 - k) * 0.38; crouch = 0.35 * (1 - S(k * PI)); }
      else crouch = S(((t - 0.78) / 0.37) * PI) * 0.7;
      o[I.by] = y - crouch * 0.13; o[I.tLx] = -crouch * 0.8 - (y > 0 ? 0.4 : 0); o[I.tRx] = o[I.tLx]; o[I.kL] = crouch * 1.4 + (y > 0 ? 0.8 : 0); o[I.kR] = o[I.kL];
      o[I.sLz] = y > 0 ? 2.2 : 0.3; o[I.sRz] = y > 0 ? -2.2 : -0.3; o[I.sLx] = crouch * 0.6; o[I.sRx] = crouch * 0.6; o[I.srx] = crouch * 0.25;
    },
    angry(o, t) {
      o[I.sLx] = 0.15; o[I.sLz] = 0.42; o[I.eL] = -1.75; o[I.sRx] = 0.15; o[I.sRz] = -0.42; o[I.eR] = -1.75; o[I.srx] = 0.12; o[I.hdx] = 0.08;
      const st = t > 0.5 && t < 0.95 ? S(((t - 0.5) / 0.45) * PI) : 0; o[I.tRx] = -st * 0.5; o[I.kR] = st * 0.8; o[I.by] = -st * 0.02;
      o[I.hdy] = S(t * 11) * 0.09; o[I.crx] = S(t * 11) * 0.03;
    },
    laugh(o, t) {
      o[I.srx] = -0.16 + S(t * 15) * 0.035; o[I.hdx] = -0.28 + S(t * 15) * 0.04; o[I.sLx] = -0.45; o[I.eL] = -1.45; o[I.sLz] = -0.32;
      o[I.sRx] = -0.15; o[I.sRz] = -0.3; o[I.eR] = -0.5; o[I.by] = S(t * 15) * 0.008; o[I.hrz] = S(t * 3) * 0.05;
    },
    shrug(o, t) {
      const e = S(U.clamp(t / 1.4, 0, 1) * PI);
      o[I.sLz] = 0.15 + e * 0.35; o[I.sRz] = -0.15 - e * 0.35; o[I.eL] = -0.2 - e * 1.3; o[I.eR] = -0.2 - e * 1.3; o[I.sLy] = -e * 0.5; o[I.sRy] = e * 0.5;
      o[I.hdz] = e * 0.22; o[I.by] = e * 0.015; o[I.crx] = -e * 0.05;
    },
    hug(o, t) {
      o[I.sLx] = -1.3; o[I.sRx] = -1.3; o[I.sLz] = -0.32; o[I.sRz] = 0.32; o[I.eL] = -0.95; o[I.eR] = -0.95; o[I.srx] = 0.1;
      o[I.hry] = S(t * 2) * 0.1; o[I.hdz] = 0.15; o[I.hdx] = 0.05;
    },
    love(o, t) {
      o[I.sLx] = -0.6; o[I.sLz] = -0.52; o[I.eL] = -1.95; o[I.sRx] = -0.6; o[I.sRz] = 0.52; o[I.eR] = -1.95;
      o[I.hrz] = S(t * 2.5) * 0.08; o[I.hdz] = 0.18 + S(t * 2.5) * 0.05; o[I.by] = pos(S(t * 5)) * 0.015;
    },
    fall(o, t, d) {
      const k = U.clamp(t / 0.45, 0, 1), e = U.ease.outCubic(k);
      o[I.by] = -e * (d.legLen - d.thR * 1.3); o[I.tLx] = -e * 1.45; o[I.tRx] = -e * 1.4; o[I.kL] = e * 0.35; o[I.kR] = e * 0.5; o[I.tLz] = 0.12 * e; o[I.tRz] = -0.12 * e;
      o[I.sLx] = e * 0.65; o[I.sRx] = e * 0.65; o[I.sLz] = 0.3; o[I.sRz] = -0.3; o[I.eL] = 0; o[I.eR] = 0; o[I.srx] = -0.2 * e; o[I.hdy] = S(t * 7) * 0.2 * e;
    },
    bow(o, t) {
      const e = S(U.clamp(t / 1.7, 0, 1) * PI);
      o[I.srx] = e * 0.55; o[I.crx] = e * 0.12; o[I.hdx] = e * 0.25; o[I.sLx] = -0.25 * e; o[I.sRx] = -0.25 * e; o[I.sLz] = -0.18; o[I.sRz] = 0.18; o[I.eL] = -0.4; o[I.eR] = -0.4;
    },
    clap(o, t) {
      const c = S(t * 14);
      o[I.sLx] = -1.1; o[I.sRx] = -1.1; o[I.sLz] = -0.42 + c * 0.16; o[I.sRz] = 0.42 - c * 0.16; o[I.eL] = -0.95; o[I.eR] = -0.95; o[I.by] = pos(S(t * 7)) * 0.02; o[I.hdx] = -0.08;
    },
    point(o, t) { POSES.idle(o, t); o[I.sRx] = -1.45; o[I.eR] = -0.05; o[I.sRz] = -0.12; o[I.hdy] = -0.1; o[I.srx] = 0.05; o[I.hry] = -0.12; },
    facepalm(o, t) { o[I.sRx] = -1.25; o[I.eR] = -2.35; o[I.sRz] = 0.18; o[I.hdx] = 0.32; o[I.hdy] = S(t * 3) * 0.12; o[I.srx] = 0.1; o[I.sLz] = 0.05; },
    scared(o, t) {
      o[I.by] = -0.08; o[I.kL] = 0.45; o[I.kR] = 0.45; o[I.tLx] = -0.3; o[I.tRx] = -0.3; o[I.sLx] = -1.4; o[I.sRx] = -1.4; o[I.eL] = -1.95; o[I.eR] = -1.95;
      o[I.sLz] = -0.18; o[I.sRz] = 0.18; o[I.srx] = 0.25 + S(t * 30) * 0.015; o[I.hdx] = 0.2; o[I.bx] = S(t * 31) * 0.006;
    },
    nod(o, t) { POSES.idle(o, t); o[I.hdx] = S(t * 9) * 0.26 * S(U.clamp(t / 1.1, 0, 1) * PI); },
    shake(o, t) { POSES.idle(o, t); o[I.hdy] = S(t * 10) * 0.36 * S(U.clamp(t / 1.2, 0, 1) * PI); },
  };

  // ---------- props ----------
  function buildProps(c) {
    const d = c.d, s = d.ws, P = {};
    const hand = c.j.handR, handL = c.j.handL;
    const dark = mat('#26262b', { rough: 0.5 });
    // book
    P.book = new THREE.Group();
    mesh(boxG(0.17 * s, 0.23 * s, 0.035 * s), mat(U.pick(['#b23a48', '#2d6cdf', '#2f9e6e', '#e0a100'])), P.book);
    mesh(boxG(0.16 * s, 0.22 * s, 0.03 * s), mat('#f7f1e3'), P.book, 0.006 * s, 0, 0.004 * s);
    P.book.position.set(-0.05 * s, -0.09 * s, 0.07 * s); P.book.rotation.set(-1.0, 0.3, 0); hand.add(P.book);
    // phone
    P.phone = new THREE.Group();
    mesh(boxG(0.07 * s, 0.14 * s, 0.012 * s), dark, P.phone);
    mesh(boxG(0.062 * s, 0.125 * s, 0.002 * s), mat('#7fd3ff', { emissive: '#4fb8ff', ei: 0.9, rough: 0.3 }), P.phone, 0, 0, 0.007 * s);
    P.phone.position.set(0, -0.08 * s, 0.03 * s); P.phone.rotation.set(-1.2, 0, 0); hand.add(P.phone);
    // bowl + chopsticks
    P.bowl = new THREE.Group();
    const bowl = mesh(geo('bowl', () => new THREE.SphereGeometry(1, 16, 8, 0, PI * 2, PI / 2, PI / 2)), mat('#f4f4f0', { side: 1 }), P.bowl);
    bowl.scale.set(0.075 * s, 0.05 * s, 0.075 * s);
    ell(mat('#f2e3c0'), P.bowl, 0.066 * s, 0.012 * s, 0.066 * s, 0, -0.008 * s, 0, true);
    P.bowl.position.set(0, -0.06 * s, 0.07 * s); handL.add(P.bowl);
    P.chop = new THREE.Group();
    [-0.008, 0.008].forEach((x) => { const st = mesh(cylG(0.003 * s, 0.004 * s, 0.22 * s, 6), mat('#c9a06a'), P.chop, x * s, 0, 0); st.rotation.x = 0.2; });
    P.chop.position.set(0, -0.09 * s, 0.06 * s); P.chop.rotation.x = -1.1; hand.add(P.chop);
    // cup (cà phê sữa đá)
    P.cup = new THREE.Group();
    mesh(cylG(0.035 * s, 0.028 * s, 0.11 * s, 12), mat('#d9e8ef', { opacity: 0.7, rough: 0.2 }), P.cup);
    mesh(cylG(0.03 * s, 0.026 * s, 0.07 * s, 12), mat('#7a4a28'), P.cup, 0, -0.015 * s, 0);
    P.cup.position.set(0, -0.08 * s, 0.035 * s); hand.add(P.cup);
    // dumbbells
    P.dbL = new THREE.Group(); P.dbR = new THREE.Group();
    [P.dbL, P.dbR].forEach((g, i) => {
      const bar = mesh(cylG(0.012 * s, 0.012 * s, 0.24 * s, 8), mat('#9aa0a6', { metal: 0.6, rough: 0.35 }), g); bar.rotation.z = PI / 2;
      [-0.1, 0.1].forEach((x) => { const p = mesh(cylG(0.045 * s, 0.045 * s, 0.04 * s, 14), dark, g, x * s, 0, 0); p.rotation.z = PI / 2; });
      g.position.set(0, -0.06 * s, 0.02 * s); (i ? hand : handL).add(g);
    });
    // microphone
    P.mic = new THREE.Group();
    mesh(cylG(0.016 * s, 0.012 * s, 0.17 * s, 10), dark, P.mic);
    ell(mat('#b8bcc4', { metal: 0.5, rough: 0.35 }), P.mic, 0.032 * s, 0.032 * s, 0.032 * s, 0, 0.1 * s, 0, true);
    P.mic.position.set(0, -0.06 * s, 0.04 * s); P.mic.rotation.x = -0.5; hand.add(P.mic);
    // wok + spatula
    P.wok = new THREE.Group();
    const wk = mesh(geo('wok', () => new THREE.SphereGeometry(1, 16, 6, 0, PI * 2, PI * 0.62, PI * 0.38)), mat('#2c2c30', { metal: 0.5, rough: 0.4, side: 1 }), P.wok, 0, 0, 0.2 * s);
    wk.scale.setScalar(0.2 * s);
    const hd = mesh(cylG(0.012 * s, 0.012 * s, 0.18 * s, 6), mat('#5a3b22'), P.wok, 0, 0.0, 0.05 * s); hd.rotation.x = PI / 2;
    P.wok.position.set(0, -0.05 * s, 0); P.wok.rotation.x = -PI / 2 + 0.3; handL.add(P.wok);
    P.spat = new THREE.Group();
    mesh(cylG(0.006 * s, 0.006 * s, 0.26 * s, 6), mat('#5a3b22'), P.spat);
    mesh(boxG(0.06 * s, 0.05 * s, 0.006 * s), mat('#9aa0a6', { metal: 0.6 }), P.spat, 0, -0.14 * s, 0);
    P.spat.position.set(0, -0.06 * s, 0.03 * s); P.spat.rotation.x = -0.6; hand.add(P.spat);
    // incense
    P.incense = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      mesh(cylG(0.0025 * s, 0.0025 * s, 0.3 * s, 4), mat('#b3261e'), P.incense, (i - 1) * 0.01 * s, 0.1 * s, 0);
      mesh(boxG(0.006 * s, 0.01 * s, 0.006 * s), mat('#ff8a3d', { emissive: '#ff6a00', ei: 1.5 }), P.incense, (i - 1) * 0.01 * s, 0.25 * s, 0, false);
    }
    P.incense.position.set(0, -0.06 * s, 0.03 * s); P.incense.rotation.x = -1.4; hand.add(P.incense);
    // cane
    P.cane = new THREE.Group();
    mesh(cylG(0.012 * s, 0.012 * s, d.legLen * 0.95, 8), mat('#6b4a2f'), P.cane, 0, -d.legLen * 0.45, 0);
    const ch = mesh(torusG(0.04 * s, 0.012 * s, PI), mat('#6b4a2f'), P.cane, -0.04 * s, 0.02 * s, 0); ch.rotation.z = 0;
    P.cane.position.set(0, -0.05 * s, 0.02 * s); hand.add(P.cane);
    // laptop on lap (attached to hips)
    P.laptop = new THREE.Group();
    mesh(boxG(0.32 * s, 0.018 * s, 0.22 * s), mat('#b9bec7', { metal: 0.4, rough: 0.35 }), P.laptop);
    const scr = new THREE.Group(); scr.position.set(0, 0.009 * s, -0.11 * s); scr.rotation.x = -0.25; P.laptop.add(scr);
    mesh(boxG(0.32 * s, 0.21 * s, 0.012 * s), mat('#b9bec7', { metal: 0.4, rough: 0.35 }), scr, 0, 0.105 * s, 0);
    mesh(boxG(0.29 * s, 0.18 * s, 0.002 * s), mat('#9fd8ff', { emissive: '#5ab8ff', ei: 0.8, rough: 0.3 }), scr, 0, 0.105 * s, 0.007 * s);
    P.laptop.position.set(0, d.thR * 1.3, d.thigh * 0.62); P.laptop.rotation.x = 0; c.j.hips.add(P.laptop);
    // plastic stool (under the seat, on the body group = floor level)
    P.stool = new THREE.Group();
    const stc = mat(U.pick(['#d93a3a', '#2f80ed', '#d93a3a']), { rough: 0.45 });
    const sh = d.seatH - d.thR * 0.9;
    mesh(cylG(0.15 * s + 0.04, 0.17 * s + 0.04, 0.035, 16), stc, P.stool, 0, sh, 0);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * PI * 2 + PI / 4; mesh(boxG(0.035, sh, 0.035), stc, P.stool, C(a) * 0.13 * s, sh / 2, S(a) * 0.13 * s); }
    P.stool.position.set(0, 0, d.thigh * 0.15); c.body.add(P.stool);
    // scooter (xe máy) under the driver
    P.scooter = new THREE.Group();
    const sc = d.legLen / 0.785, bodyC = mat(U.pick(['#c0392b', '#1f4e8c', '#e8e8e8', '#2e7d32', '#222831']), { rough: 0.35, metal: 0.2 });
    const tire = mat('#1b1b1b', { rough: 0.9 });
    [0.6, -0.6].forEach((z) => { const w = mesh(torusG(0.25, 0.07, PI * 2), tire, P.scooter, 0, 0.3, z); w.rotation.y = PI / 2; const hb = mesh(cylG(0.09, 0.09, 0.09, 10), mat('#a4a9ad', { metal: 0.6 }), P.scooter, 0, 0.3, z); hb.rotation.z = PI / 2; });
    ell(bodyC, P.scooter, 0.19, 0.2, 0.52, 0, 0.55, -0.05);
    ell(mat('#2b2b2b'), P.scooter, 0.17, 0.07, 0.33, 0, 0.75, -0.12);
    ell(bodyC, P.scooter, 0.17, 0.33, 0.12, 0, 0.78, 0.5);
    const hbar = mesh(cylG(0.02, 0.02, 0.62, 8), mat('#3a3a3a'), P.scooter, 0, 1.06, 0.48); hbar.rotation.z = PI / 2;
    ell(mat('#fff6c8', { emissive: '#fff1a8', ei: 0.6 }), P.scooter, 0.06, 0.06, 0.04, 0, 0.98, 0.62, true);
    P.scooter.scale.setScalar(sc); P.scooter.position.set(0, 0, 0.12 * sc); c.body.add(P.scooter);
    Object.values(P).forEach((p) => (p.visible = false));
    return P;
  }
  const PROPS_FOR = {
    study: ['book'], type: ['laptop'], phone: ['phone'], eat: ['bowl', 'chop'], drink: ['cup'], lift: ['dbL', 'dbR'],
    sing: ['mic'], cook: ['wok', 'spat'], drive: ['scooter'], pray: ['incense'],
  };

  // ---------- human ----------
  function buildHuman(c) {
    const app = c.app, d = c.d, age = d.age;
    const baby = age < 2;
    const style = baby ? 'onesie' : (app.topStyle || 'tshirt');
    const skin = mat(app.skin || '#e6b48f', { rough: 0.62 });
    const hairColor = U.mixHex(app.hair || '#1c1410', age > 70 ? '#f0f0ee' : '#bdbdbd', d.senior);
    const hairM = mat(hairColor, { rough: 0.85 });
    let topC = app.top || '#d9534f', botC = app.bottom || '#2f3b52';
    if (style === 'school') { topC = '#f7f7f4'; botC = age < 11 ? '#1f2d55' : (app.bottom || '#1f2d55'); }
    if (style === 'coat') topC = '#f4f6f8';
    if (style === 'uniform') { topC = app.top && app.top !== '#d9534f' ? app.top : '#5b6b3a'; }
    const topM = mat(topC, { rough: style === 'suit' ? 0.55 : 0.8 });
    const botM = mat(botC, { rough: 0.8 });
    const shoeM = mat(app.shoes || '#2b2b2b', { rough: 0.5 });
    const longSleeve = ['shirt', 'hoodie', 'suit', 'coat', 'uniform', 'aodai', 'onesie'].includes(style);
    const skirt = style === 'dress';
    const legM = skirt ? skin : (style === 'onesie' ? topM : botM);

    const body = c.body, j = {};
    j.hips = pivot(body, 0, d.legLen, 0); j.hips.rotation.order = 'YXZ';
    ell(style === 'onesie' || style === 'dress' ? topM : botM, j.hips, d.waistR * 1.05, d.waistR * 0.8, d.waistR * 0.82, 0, d.waistR * 0.15, 0);
    j.spine = pivot(j.hips, 0, 0, 0);
    mesh(capsule(d.waistR, d.torso * 0.32), topM, j.spine, 0, d.torso * 0.26, 0).scale.set(1, 1, 0.84);
    j.chest = pivot(j.spine, 0, d.torso * 0.42, 0);
    const chest = mesh(capsule(d.chestR, d.torso * 0.28), topM, j.chest, 0, d.torso * 0.24, 0);
    chest.scale.set(1.12, 1, 0.76);
    // neck & head
    j.neck = pivot(j.chest, 0, d.torso * 0.58, 0);
    mesh(cylG(d.headR * 0.36, d.headR * 0.4, d.neck * 1.8, 12), skin, j.neck, 0, d.neck * 0.5, 0);
    j.head = pivot(j.neck, 0, d.neck, 0);
    const hr = d.headR, cy = hr * 0.98;
    ell(skin, j.head, hr * 0.92, hr * 1.04, hr * 0.98, 0, cy, 0);
    ell(skin, j.head, hr * 0.62, hr * 0.5, hr * 0.62, 0, cy - hr * 0.5, hr * 0.18);   // jaw
    ell(skin, j.head, hr * 0.11, hr * 0.19, hr * 0.08, hr * 0.9, cy - hr * 0.05, 0, true);
    ell(skin, j.head, hr * 0.11, hr * 0.19, hr * 0.08, -hr * 0.9, cy - hr * 0.05, 0, true);
    ell(mat(U.shadeHex(app.skin || '#e6b48f', -0.06), { rough: 0.6 }), j.head, hr * 0.09, hr * 0.12, hr * 0.1, 0, cy - hr * 0.15, hr * 0.95, true); // nose
    j.headTop = pivot(j.head, 0, cy + hr * 1.08, 0);
    // eyes
    const kid = U.clamp((14 - age) / 12, 0, 1);
    const er = hr * (0.16 + kid * 0.05), eyeY = cy - hr * (0.0 + kid * 0.08), eyeX = hr * 0.36, eyeZ = hr * 0.84;
    const white = mat('#fbfbf8', { rough: 0.3 }), iris = mat(app.eyes || '#2a1b12', { rough: 0.25 }), shine = mat('#ffffff', { emissive: '#ffffff', ei: 0.6 });
    c.eyes = [];
    [1, -1].forEach((sd) => {
      const g = pivot(j.head, sd * eyeX, eyeY, eyeZ);
      ell(white, g, er, er * 1.08, er * 0.55, 0, 0, 0, true);
      ell(iris, g, er * 0.64, er * 0.7, er * 0.3, 0, -er * 0.05, er * 0.36, true);
      ell(shine, g, er * 0.18, er * 0.18, er * 0.1, sd * er * 0.18, er * 0.22, er * 0.58, true);
      c.eyes.push(g);
    });
    c.brows = [1, -1].map((sd) => { const b = mesh(boxG(er * 2.1, er * 0.38, er * 0.45), mat(U.shadeHex(hairColor, -0.05)), j.head, sd * eyeX, eyeY + er * 1.85, eyeZ + er * 0.15); b.userData.side = sd; return b; });
    // mouth variants
    const lip = mat('#a8473f', { rough: 0.5 }), inner = mat('#5a1e1e', { rough: 0.6 });
    const my = cy - hr * 0.44, mz = hr * (app.beard ? 0.96 : 0.9);
    c.mouth = {
      smile: mesh(torusG(hr * 0.17, hr * 0.032, PI), lip, j.head, 0, my + hr * 0.1, mz),
      grin: new THREE.Group(),
      frown: mesh(torusG(hr * 0.15, hr * 0.03, PI), lip, j.head, 0, my - hr * 0.06, mz),
      open: ell(inner, j.head, hr * 0.12, hr * 0.13, hr * 0.06, 0, my, mz, true),
      flat: mesh(boxG(hr * 0.24, hr * 0.035, hr * 0.03), lip, j.head, 0, my, mz),
    };
    c.mouth.smile.rotation.z = PI;
    j.head.add(c.mouth.grin); c.mouth.grin.position.set(0, my, mz);
    const gt = ell(inner, c.mouth.grin, hr * 0.17, hr * 0.09, hr * 0.05, 0, -hr * 0.02, 0, true);
    gt.scale.y = hr * 0.09;
    ell(white, c.mouth.grin, hr * 0.14, hr * 0.03, hr * 0.052, 0, hr * 0.03, 0.002, true);
    Object.values(c.mouth).forEach((m) => (m.castShadow = false));
    const blushM = mat('#ff8fa3', { opacity: 0.55, rough: 0.8 });
    c.blush = [1, -1].map((sd) => { const b = ell(blushM, j.head, hr * 0.16, hr * 0.09, hr * 0.04, sd * hr * 0.52, cy - hr * 0.24, hr * 0.8, true); b.visible = false; b.castShadow = false; return b; });
    // hair
    buildHair(c, j.head, hairM, hr, cy, app.hairStyle || 'short', baby);
    if (app.beard && age >= 18) ell(hairM, j.head, hr * 0.6, hr * 0.42, hr * 0.5, 0, cy - hr * 0.6, hr * 0.38);
    if (app.glasses && age >= 5) {
      const gm = mat('#222', { rough: 0.3, metal: 0.4 });
      [1, -1].forEach((sd) => mesh(torusG(er * 1.45, er * 0.13, PI * 2), gm, j.head, sd * eyeX, eyeY, eyeZ + er * 0.75, false));
      mesh(boxG(eyeX * 0.75, er * 0.18, er * 0.18), gm, j.head, 0, eyeY + er * 0.3, eyeZ + er * 0.8, false);
    }
    let hat = app.hat;
    if (!hat && style === 'uniform' && age >= 18) hat = 'uniformcap';
    if (hat && !baby) buildHat(c, j.head, hat, hr, cy, topC);
    // collar / extras
    if (style === 'shirt' || style === 'polo' || style === 'school' || style === 'uniform' || style === 'suit') {
      [1, -1].forEach((sd) => { const cl = mesh(boxG(hr * 0.42, hr * 0.12, hr * 0.3), mat(style === 'suit' ? '#f7f7f4' : U.shadeHex(topC, 0.06)), j.chest, sd * hr * 0.2, d.torso * 0.56, d.chestR * 0.45); cl.rotation.z = sd * 0.5; });
    }
    if (style === 'suit') mesh(boxG(hr * 0.16, d.torso * 0.36, 0.01), mat('#9e1b2c'), j.chest, 0, d.torso * 0.36, d.chestR * 0.8);
    if (style === 'school' && age >= 6 && age <= 11) {
      const red = mat('#d32f2f', { rough: 0.6 });
      const k1 = mesh(boxG(d.chestR * 0.35, d.torso * 0.22, 0.012), red, j.chest, -d.chestR * 0.12, d.torso * 0.42, d.chestR * 0.78); k1.rotation.z = 0.25;
      const k2 = mesh(boxG(d.chestR * 0.35, d.torso * 0.2, 0.012), red, j.chest, d.chestR * 0.12, d.torso * 0.43, d.chestR * 0.8); k2.rotation.z = -0.3;
      ell(red, j.chest, d.chestR * 0.9, d.chestR * 0.18, d.chestR * 0.75, 0, d.torso * 0.56, 0, true);
    }
    if (style === 'hoodie') ell(topM, j.chest, d.chestR * 0.85, d.chestR * 0.45, d.chestR * 0.45, 0, d.torso * 0.56, -d.chestR * 0.55);
    if (style === 'uniform') [1, -1].forEach((sd) => mesh(boxG(d.chestR * 0.3, 0.012, d.chestR * 0.5), mat(U.shadeHex(topC, -0.15)), j.chest, sd * d.shW * 0.42, d.torso * 0.56, 0));
    // arms
    const armM = longSleeve ? topM : skin;
    const sleeveM = style === 'dress' ? skin : topM;
    ['L', 'R'].forEach((sd) => {
      const sx = sd === 'L' ? 1 : -1;
      const sh = pivot(j.chest, sx * d.shW / 2, d.torso * 0.5, 0);
      ell(sleeveM, sh, d.uaR * 1.35, d.uaR * 1.3, d.uaR * 1.3, 0, 0, 0, true);
      mesh(capsule(d.uaR, Math.max(0.01, d.upperArm - d.uaR * 2)), sleeveM, sh, 0, -d.upperArm / 2, 0);
      const el = pivot(sh, 0, -d.upperArm, 0);
      mesh(capsule(d.faR, Math.max(0.01, d.forearm - d.faR * 2)), armM, el, 0, -d.forearm / 2, 0);
      const hand = pivot(el, 0, -d.forearm, 0);
      ell(skin, hand, d.faR * 1.25, d.faR * 1.6, d.faR * 0.8, 0, -d.faR * 1.2, d.faR * 0.1, true);
      ell(skin, hand, d.faR * 0.45, d.faR * 0.8, d.faR * 0.45, sx * -d.faR * 0.9, -d.faR * 0.8, d.faR * 0.5, true);
      j['sh' + sd] = sh; j['el' + sd] = el; j['hand' + sd] = hand;
    });
    // legs
    ['L', 'R'].forEach((sd) => {
      const sx = sd === 'L' ? 1 : -1;
      const th = pivot(j.hips, sx * d.hipW / 2, 0, 0);
      mesh(capsule(d.thR, Math.max(0.01, d.thigh - d.thR)), legM, th, 0, -d.thigh / 2, 0);
      const kn = pivot(th, 0, -d.thigh, 0);
      mesh(capsule(d.shR, Math.max(0.01, d.shin - d.shR)), skirt ? skin : legM, kn, 0, -d.shin / 2, 0);
      const ft = pivot(kn, 0, -d.shin, 0);
      if (baby) ell(skin, ft, d.shR * 1.1, d.footH * 0.9, d.shR * 1.9, 0, -d.footH * 0.4, d.shR * 0.6);
      else ell(shoeM, ft, d.shR * 1.15, d.footH * 1.05, d.shR * 2.5, 0, -d.footH * 0.35, d.shR * 1.15);
      j['th' + sd] = th; j['kn' + sd] = kn; j['ft' + sd] = ft;
    });
    // skirts / tunics / coats
    c.flaps = [];
    if (skirt) {
      const sk = mesh(cylG(d.waistR * 1.02, d.waistR * 1.9, d.thigh * 1.05, 20, true), mat(topC, { side: 1 }), j.hips, 0, -d.thigh * 0.45, 0);
      sk.scale.z = 0.88;
    }
    if (style === 'aodai' && age >= 8) {
      const panM = mat(topC, { side: 1, rough: 0.6 });
      [1, -1].forEach((sd) => {
        const p = pivot(j.hips, 0, d.waistR * 0.2, sd * d.waistR * 0.72);
        mesh(boxG(d.hipW * 1.55, d.legLen * 0.9, 0.012), panM, p, 0, -d.legLen * 0.45, 0);
        c.flaps.push({ p, sd });
      });
    }
    if (style === 'coat') {
      const cm = mesh(cylG(d.waistR * 1.12, d.waistR * 1.45, d.thigh * 1.1, 18, true), mat('#f4f6f8', { side: 1 }), j.hips, 0, -d.thigh * 0.38, 0);
      cm.scale.z = 0.85;
    }
    c.j = j;
  }

  function buildHair(c, head, hm, hr, cy, style, baby) {
    if (baby) { ell(hm, head, hr * 0.35, hr * 0.18, hr * 0.35, 0, cy + hr * 0.93, 0.0, true); return; }
    if (style === 'bald') { const b = mesh(BACK_SHELL(), hm, head, 0, cy - hr * 0.1, -hr * 0.05); b.scale.set(hr * 0.97, hr * 0.55, hr * 1.0); return; }
    const capS = style === 'buzz' ? 1.015 : 1.07;
    const cap = mesh(CAP_GEO(), hm, head, 0, cy + hr * 0.02, -hr * 0.02);
    cap.scale.set(hr * 0.93 * capS, hr * 1.06 * capS, hr * 0.99 * capS); cap.rotation.x = -0.22;
    if (style === 'buzz') return;
    const back = mesh(BACK_SHELL(), hm, head, 0, cy - hr * 0.02, -hr * 0.03);
    back.scale.set(hr * 0.98, hr * (style === 'long' ? 1.55 : style === 'bob' ? 1.05 : 0.8), hr * 1.04);
    if (style === 'long') { back.position.y = cy - hr * 0.5; ell(hm, head, hr * 0.7, hr * 0.95, hr * 0.32, 0, cy - hr * 1.15, -hr * 0.55); }
    if (style === 'bob') back.position.y = cy - hr * 0.12;
    if (style === 'short' || style === 'spiky' || style === 'curly') { const fr = ell(hm, head, hr * 0.62, hr * 0.2, hr * 0.32, hr * 0.12, cy + hr * 0.72, hr * 0.62); fr.rotation.z = -0.25; }
    if (style === 'long' || style === 'bob' || style === 'ponytail' || style === 'bun') {
      const fr = ell(hm, head, hr * 0.7, hr * 0.18, hr * 0.3, -hr * 0.1, cy + hr * 0.74, hr * 0.6); fr.rotation.z = 0.2;
    }
    if (style === 'spiky') for (let i = 0; i < 7; i++) { const a = (i / 7) * PI * 2; const sp = mesh(coneG(hr * 0.16, hr * 0.42, 8), hm, head, C(a) * hr * 0.5, cy + hr * 0.95, S(a) * hr * 0.45); sp.rotation.set(S(a) * 0.5, 0, -C(a) * 0.5); }
    if (style === 'curly') for (let i = 0; i < 11; i++) { const a = (i / 11) * PI * 2; ell(hm, head, hr * 0.28, hr * 0.28, hr * 0.28, C(a) * hr * 0.72, cy + hr * 0.62 + S(i * 1.7) * hr * 0.1, S(a) * hr * 0.7, true); }
    if (style === 'bun') ell(hm, head, hr * 0.34, hr * 0.34, hr * 0.34, 0, cy + hr * 0.95, -hr * 0.55, true);
    if (style === 'ponytail') {
      ell(hm, head, hr * 0.16, hr * 0.16, hr * 0.16, 0, cy + hr * 0.45, -hr * 0.98, true);
      const p = pivot(head, 0, cy + hr * 0.42, -hr * 1.02);
      mesh(capsule(hr * 0.17, hr * 0.85), hm, p, 0, -hr * 0.55, -hr * 0.08);
      c.tail = p;
    }
  }

  function buildHat(c, head, hat, hr, cy, topC) {
    if (hat === 'conical') {
      const m = mat('#e8d39a', { rough: 0.9 });
      const cn = mesh(coneG(hr * 2.5, hr * 1.35, 28), m, head, 0, cy + hr * 1.32, 0);
      cn.rotation.x = -0.08;
      mesh(torusG(hr * 2.45, hr * 0.03, PI * 2), mat('#cdb67a'), head, 0, cy + hr * 0.66, 0).rotation.x = PI / 2;
    } else if (hat === 'helmet') {
      const m = mat(U.pick(['#f5c518', '#e53935', '#1e88e5', '#fafafa', '#43a047']), { rough: 0.35 });
      const h = mesh(CAP_GEO(), m, head, 0, cy + hr * 0.05, 0); h.scale.set(hr * 1.14, hr * 1.12, hr * 1.18); h.rotation.x = -0.15;
      const v = mesh(boxG(hr * 1.4, hr * 0.06, hr * 0.5), m, head, 0, cy + hr * 0.55, hr * 1.0); v.rotation.x = 0.25;
      mesh(boxG(hr * 0.05, hr * 0.9, hr * 0.05), mat('#222'), head, hr * 0.85, cy - hr * 0.35, hr * 0.2, false);
      mesh(boxG(hr * 0.05, hr * 0.9, hr * 0.05), mat('#222'), head, -hr * 0.85, cy - hr * 0.35, hr * 0.2, false);
    } else if (hat === 'beanie') {
      const m = mat(U.shadeHex(topC, -0.1), { rough: 0.95 });
      const h = mesh(CAP_GEO(), m, head, 0, cy + hr * 0.1, -hr * 0.02); h.scale.set(hr * 1.1, hr * 1.12, hr * 1.13); h.rotation.x = -0.18;
      ell(m, head, hr * 0.2, hr * 0.2, hr * 0.2, 0, cy + hr * 1.22, -hr * 0.1, true);
    } else { // cap & uniform cap
      const m = mat(hat === 'uniformcap' ? U.shadeHex(topC, -0.08) : U.pick(['#1e3a8a', '#b91c1c', '#111827', '#f8fafc']), { rough: 0.7 });
      const h = mesh(CAP_GEO(), m, head, 0, cy + hr * 0.12, 0); h.scale.set(hr * 1.06, hr * 0.95, hr * 1.1); h.rotation.x = -0.1;
      const b = mesh(cylG(hr * 0.6, hr * 0.6, hr * 0.05, 16), m, head, 0, cy + hr * 0.52, hr * 0.85); b.scale.z = 0.8; b.rotation.x = 0.15;
    }
  }

  // ---------- pets ----------
  function buildPet(c) {
    const cat = c.kind === 'cat', col = c.petColor || (cat ? '#e8a25a' : '#b07a43');
    const m = mat(col, { rough: 0.9 }), light = mat(U.shadeHex(col, 0.35), { rough: 0.9 }), black = mat('#151515', { rough: 0.3 });
    const s = (cat ? 0.75 : 1) * (0.7 + 0.3 * U.clamp(c.age / 2, 0, 1));
    const legH = 0.26 * s, j = {};
    j.torso = pivot(c.body, 0, legH + 0.1 * s, 0);
    const t = mesh(capsule(0.12 * s, 0.32 * s), m, j.torso); t.rotation.x = PI / 2; t.scale.set(cat ? 0.85 : 1, 1, 1);
    ell(light, j.torso, 0.09 * s, 0.08 * s, 0.17 * s, 0, -0.05 * s, 0.02 * s, true);
    j.head = pivot(j.torso, 0, 0.12 * s, 0.25 * s);
    ell(m, j.head, 0.12 * s, 0.11 * s, 0.11 * s, 0, 0.04 * s, 0);
    if (cat) {
      ell(light, j.head, 0.06 * s, 0.045 * s, 0.05 * s, 0, 0.0, 0.085 * s, true);
      [1, -1].forEach((sd) => { const e = mesh(coneG(0.045 * s, 0.09 * s, 8), m, j.head, sd * 0.065 * s, 0.15 * s, -0.01 * s); e.rotation.z = -sd * 0.25; });
    } else {
      ell(light, j.head, 0.065 * s, 0.055 * s, 0.09 * s, 0, -0.01 * s, 0.11 * s, true);
      [1, -1].forEach((sd) => { const e = ell(U.shadeHex(col, -0.2), j.head, 0.035 * s, 0.08 * s, 0.05 * s, sd * 0.1 * s, 0.06 * s, -0.01 * s, true); e.rotation.z = sd * 0.35; });
    }
    ell(black, j.head, 0.02 * s, 0.016 * s, 0.015 * s, 0, cat ? 0.02 * s : 0.02 * s, cat ? 0.13 * s : 0.2 * s, true);
    [1, -1].forEach((sd) => { ell(black, j.head, 0.02 * s, 0.024 * s, 0.012 * s, sd * 0.05 * s, 0.07 * s, 0.1 * s, true); ell(mat('#ffffff'), j.head, 0.006 * s, 0.006 * s, 0.004 * s, sd * 0.055 * s, 0.078 * s, 0.11 * s, true); });
    j.legs = [];
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([x, z]) => {
      const p = pivot(j.torso, x * 0.07 * s, -0.02 * s, z * 0.15 * s);
      mesh(capsule(0.033 * s, legH - 0.04 * s), m, p, 0, -legH / 2, 0);
      ell(light, p, 0.04 * s, 0.025 * s, 0.05 * s, 0, -legH + 0.02 * s, 0.015 * s, true);
      j.legs.push(p);
    });
    j.tail = pivot(j.torso, 0, 0.05 * s, -0.2 * s);
    const tl = mesh(capsule(cat ? 0.022 * s : 0.03 * s, cat ? 0.3 * s : 0.18 * s), m, j.tail, 0, cat ? 0.16 * s : 0.1 * s, 0);
    tl.rotation.x = 0;
    j.tail.rotation.x = cat ? -0.5 : -0.9;
    c.j = j; c.d = { H: legH + 0.35 * s, s, legH };
    c.eyes = []; c.brows = []; c.mouth = null; c.blush = [];
  }

  function petPose(c, anim, t) {
    const j = c.j, s = c.d.s, cat = c.kind === 'cat';
    let ty = c.d.legH + 0.1 * s, rx = 0, hx = 0, hy = S(t * 0.6) * 0.3, tailX = cat ? -0.5 : -0.9, tailY = S(t * (cat ? 1.5 : 7)) * (cat ? 0.3 : 0.5);
    const legs = [0, 0, 0, 0];
    if (anim === 'walk' || anim === 'run') {
      const f = anim === 'run' ? 13 : 7.5, a = anim === 'run' ? 0.75 : 0.45;
      legs[0] = S(t * f) * a; legs[3] = S(t * f) * a; legs[1] = -S(t * f) * a; legs[2] = -S(t * f) * a;
      ty += Math.abs(S(t * f)) * 0.02 * s; hy = 0; tailY = S(t * f) * 0.4;
    } else if (anim === 'sit') {
      rx = -0.45; ty -= 0.08 * s; legs[2] = -1.2; legs[3] = -1.2; legs[0] = 0.4; legs[1] = 0.4; hx = 0.35;
    } else if (anim === 'sleep' || anim === 'dead') {
      ty = 0.1 * s; legs[0] = -1.4; legs[1] = -1.4; legs[2] = 1.4; legs[3] = 1.4; hx = 0.35; hy = 0.5; tailY = 0.9; tailX = -1.4;
      j.torso.scale.y = 1 + S(t * 1.6) * 0.03;
    } else if (anim === 'jump' || anim === 'cheer') {
      const h = pos(S(t * 7)); ty += h * 0.18 * s; legs[0] = -h * 0.6; legs[1] = -h * 0.6; legs[2] = h * 0.6; legs[3] = h * 0.6; tailY = S(t * 18) * 0.7; hx = -0.2;
    } else { ty += S(t * 2) * 0.004; }
    j.torso.position.y = ty; j.torso.rotation.x = rx;
    j.head.rotation.set(hx, hy, 0);
    j.legs.forEach((l, i) => (l.rotation.x = legs[i]));
    j.tail.rotation.set(tailX, tailY, 0);
    if (!(anim === 'sleep' || anim === 'dead')) j.torso.scale.y = 1;
  }

  // ---------- expressions ----------
  const EXPR_FACE = {
    neutral: { mouth: 'flat', eye: 1, brow: 0, browY: 0 },
    happy: { mouth: 'smile', eye: 0.82, brow: 0.08, browY: 0.15 },
    sad: { mouth: 'frown', eye: 0.85, brow: -0.32, browY: 0.1 },
    angry: { mouth: 'flat', eye: 0.78, brow: 0.42, browY: -0.25 },
    surprised: { mouth: 'open', eye: 1.25, brow: 0, browY: 0.6 },
    sleepy: { mouth: 'flat', eye: 0.06, brow: 0, browY: -0.1 },
    love: { mouth: 'smile', eye: 0.55, brow: -0.1, browY: 0.2, blush: true },
    sick: { mouth: 'frown', eye: 0.6, brow: -0.25, browY: 0, tint: true },
    scared: { mouth: 'open', eye: 1.2, brow: -0.35, browY: 0.45 },
    laugh: { mouth: 'grin', eye: 0.45, brow: 0.05, browY: 0.2 },
  };

  // ---------- Character ----------
  class Character {
    constructor(opts) {
      this.kind = opts.kind === 'dog' || opts.kind === 'cat' ? opts.kind : 'human';
      this.app = Object.assign({}, DEFAULT_APP, opts.appearance || {});
      this.age = opts.age ?? 25; this.gender = opts.gender === 'f' ? 'f' : 'm'; this.petColor = opts.petColor; this.name = opts.name || '';
      this.root = new THREE.Group(); this.root.name = 'char:' + this.name;
      this.body = null;
      this.anim = 'idle'; this.loopAnim = 'idle'; this.animT = 0; this.speed = 1; this.oneShot = null; this.resolveFn = null;
      this.pose = new Float32Array(N); this.from = new Float32Array(N); this.target = new Float32Array(N); this.blend = 1;
      this.exprOverride = null; this.eyeS = 1; this.blinkT = U.rand(1, 4); this.blinkK = 0; this.browK = 0; this.browY = 0;
      this.look = null; this.lookYaw = 0; this.lookPitch = 0; this.noStool = false; this.phase = Math.random() * 10;
      this._v = new THREE.Vector3(); this._m = new THREE.Matrix4();
      this.build();
    }
    get height() { return this.d ? this.d.H : 1.6; }
    build() {
      if (this.body) { this.root.remove(this.body); }
      this.body = new THREE.Group(); this.root.add(this.body);
      this.tail = null; this.flaps = [];
      if (this.kind === 'human') {
        this.d = dims(this.age, this.gender, this.app);
        buildHuman(this);
        this.props = buildProps(this);
      } else {
        buildPet(this); this.props = {};
      }
      this.blend = 1; this.applyAnimSideEffects();
    }
    setAppearance(app) { this.app = Object.assign({}, DEFAULT_APP, app || {}); this.build(); }
    setAge(age) {
      const changed = Math.round(age) !== Math.round(this.age); this.age = age;
      if (changed) { this.build(); if (this.kind === 'human' && this.age < 2 && !BABY_OK.has(this.loopAnim)) this.loopAnim = 'idle'; }
    }
    mapAnim(name) {
      if (!ANIMS.includes(name)) { U.warnOnce('anim:' + name, 'unknown anim', name); name = 'idle'; }
      if (this.kind !== 'human') return PET_OK.has(name) ? name : 'idle';
      if (this.age < 2 && !BABY_OK.has(name)) {
        if (name === 'walk' || name === 'run' || name === 'jump' || name === 'dance') return 'crawl';
        if (name === 'sad' || name === 'angry' || name === 'scared' || name === 'sick' || name === 'fall') return 'cry';
        if (name === 'wave' || name === 'clap' || name === 'love' || name === 'hug' || name === 'eat') return 'laugh';
        if (name === 'sit' || name === 'study' || name === 'type') return 'idle';
        return name === 'pray' ? 'sleep' : 'idle';
      }
      return name;
    }
    play(name, opts) {
      opts = opts || {};
      name = this.mapAnim(name);
      this.noStool = !!opts.noStool; this.speed = opts.speed || (this.d && this.d.senior > 0.5 ? 0.8 : 1);
      if (this.resolveFn) { const r = this.resolveFn; this.resolveFn = null; r(); }
      const isOne = ONESHOTS.includes(name) && !opts.loop;
      if (!isOne) this.loopAnim = name;
      else if (opts.base) this.loopAnim = opts.base;
      else if (SEATED.has(this.loopAnim) || LYING.has(this.loopAnim) || ['drive', 'swim', 'lift', 'cook', 'sing', 'type', 'study'].includes(this.loopAnim)) this.loopAnim = 'idle';
      if (name !== this.anim || isOne) { this.from.set(this.pose); this.blend = 0; this.animT = 0; }
      this.anim = name; this.oneShot = isOne ? name : null;
      this.applyAnimSideEffects();
      return new Promise((res) => {
        this.resolveFn = res;
        this.resolveAt = isOne ? (DUR[name] || 1.5) : 0.6;
      });
    }
    applyAnimSideEffects() {
      if (!this.props) return;
      const want = new Set(PROPS_FOR[this.anim] || []);
      if (this.kind === 'human') {
        if (SEATED.has(this.anim) && !this.noStool) want.add('stool');
        if (this.d.age >= 75 && (this.anim === 'idle' || this.anim === 'walk' || this.anim === 'talk')) want.add('cane');
      }
      Object.keys(this.props).forEach((k) => (this.props[k].visible = want.has(k)));
    }
    setExpression(e) { this.exprOverride = e && EXPR_FACE[e] ? e : null; }
    lookAt(v) { this.look = v ? (this.look || new THREE.Vector3()).copy(v) : null; }
    getHeadWorldPosition(target) {
      target = target || new THREE.Vector3();
      if (this.kind === 'human' && this.j && this.j.headTop) return this.j.headTop.getWorldPosition(target);
      if (this.j && this.j.head) { this.j.head.getWorldPosition(target); target.y += 0.15; return target; }
      return this.root.getWorldPosition(target).add(new THREE.Vector3(0, this.height, 0));
    }
    exprName() {
      if (this.exprOverride) return this.exprOverride;
      if (this.anim === 'laugh' || this.anim === 'cheer' || this.anim === 'dance') return 'laugh';
      return DEFAULT_EXPR[this.anim] || 'neutral';
    }
    update(dt, t) {
      if (!this.body) return;
      dt = Math.min(dt, 0.1);
      this.animT += dt * this.speed;
      if (this.resolveFn && this.animT >= this.resolveAt) {
        const r = this.resolveFn; this.resolveFn = null; r();
        if (this.oneShot) { const back = this.loopAnim || 'idle'; this.oneShot = null; this.from.set(this.pose); this.blend = 0; this.anim = back; this.animT = 0; this.applyAnimSideEffects(); }
      }
      const tt = this.animT + (this.oneShot ? 0 : this.phase);
      if (this.kind !== 'human') { petPose(this, this.anim, tt); return; }
      const o = this.target; base(o);
      (POSES[this.anim] || POSES.idle)(o, tt, this.d);
      // senior posture
      if (this.d.senior > 0 && !LYING.has(this.anim) && this.anim !== 'crawl') { o[I.srx] += 0.14 * this.d.senior; o[I.crx] += 0.08 * this.d.senior; o[I.hdx] -= 0.12 * this.d.senior; o[I.kL] += 0.06 * this.d.senior; o[I.kR] += 0.06 * this.d.senior; }
      if (this.d.age >= 75 && (this.anim === 'idle' || this.anim === 'walk' || this.anim === 'talk')) { o[I.sRx] = -0.35; o[I.eR] = -0.25; o[I.sRz] = -0.15; }
      if (this.blend < 1) {
        this.blend = Math.min(1, this.blend + dt / 0.26);
        const k = U.ease.inOutSine(this.blend);
        for (let i = 0; i < N; i++) this.pose[i] = this.from[i] + (o[i] - this.from[i]) * k;
      } else this.pose.set(o);
      this.applyPose(dt, t);
      this.updateFace(dt);
    }
    applyPose(dt) {
      const p = this.pose, j = this.j, d = this.d;
      j.hips.position.set(p[I.bx], d.legLen + p[I.by], p[I.bz]);
      j.hips.rotation.set(p[I.hrx] - p[I.lie] * PI / 2, p[I.hry] + p[I.lie] * PI / 2, p[I.hrz]);
      j.spine.rotation.set(p[I.srx], p[I.sry], p[I.srz]);
      j.chest.rotation.set(p[I.crx], p[I.cry], p[I.crz]);
      // look-at (head turn toward a world point)
      let ly = 0, lp = 0;
      if (this.look && p[I.lie] < 0.2 && this.anim !== 'crawl') {
        this.root.updateMatrixWorld();
        this._v.copy(this.look); this.root.worldToLocal(this._v);
        const dx = this._v.x, dz = this._v.z, dy = this._v.y - d.H * 0.92;
        ly = U.clamp(Math.atan2(dx, dz), -0.95, 0.95); lp = U.clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.35, 0.4);
        if (Math.abs(Math.atan2(dx, dz)) > 2.3) ly = 0;
      }
      this.lookYaw += (ly - this.lookYaw) * Math.min(1, dt * 5); this.lookPitch += (lp - this.lookPitch) * Math.min(1, dt * 5);
      j.neck.rotation.set(p[I.nrx] + this.lookPitch * 0.3, p[I.nry] + this.lookYaw * 0.4, 0);
      j.head.rotation.set(p[I.hdx] + this.lookPitch * 0.6, p[I.hdy] * (this.look ? 0.3 : 1) + this.lookYaw * 0.6, p[I.hdz]);
      j.shL.rotation.set(p[I.sLx], p[I.sLy], p[I.sLz]); j.shR.rotation.set(p[I.sRx], p[I.sRy], p[I.sRz]);
      j.elL.rotation.x = p[I.eL]; j.elR.rotation.x = p[I.eR];
      j.thL.rotation.set(p[I.tLx], 0, p[I.tLz]); j.thR.rotation.set(p[I.tRx], 0, p[I.tRz]);
      j.knL.rotation.x = p[I.kL]; j.knR.rotation.x = p[I.kR];
      j.ftL.rotation.x = p[I.fL]; j.ftR.rotation.x = p[I.fR];
      if (this.tail) this.tail.rotation.set(0.15 + Math.sin(this.animT * 3) * 0.08 - p[I.srx] * 0.5, 0, Math.sin(this.animT * 2.3) * 0.12);
      for (let i = 0; i < this.flaps.length; i++) { const f = this.flaps[i]; f.p.rotation.x = f.sd * (0.04 + Math.max(0, -p[I.tLx] * f.sd, -p[I.tRx] * f.sd) * 0.6) + Math.sin(this.animT * 2 + i) * 0.03; }
    }
    updateFace(dt) {
      const e = EXPR_FACE[this.exprName()] || EXPR_FACE.neutral;
      // mouth (talking toggles open/flat)
      let mouth = e.mouth;
      if ((this.anim === 'talk' || this.anim === 'sing') && !this.exprOverride) mouth = Math.sin(this.animT * (this.anim === 'sing' ? 9 : 14)) > 0.1 ? 'open' : (this.anim === 'sing' ? 'grin' : 'smile');
      if (this.anim === 'cry') mouth = Math.sin(this.animT * 6) > 0.4 ? 'open' : 'frown';
      if (this.anim === 'eat' && Math.sin(this.animT * 2.6) > 0.6) mouth = 'open';
      for (const k in this.mouth) this.mouth[k].visible = k === mouth;
      this.blush.forEach((b) => (b.visible = !!e.blush || this.anim === 'love'));
      // eyes + blink
      this.blinkT -= dt;
      if (this.blinkT <= 0) { this.blinkK = 0.13; this.blinkT = U.rand(2.4, 5.2); }
      let blinkMul = 1;
      if (this.blinkK > 0) { this.blinkK -= dt; blinkMul = 0.1; }
      const tgt = e.eye * blinkMul;
      this.eyeS += (tgt - this.eyeS) * Math.min(1, dt * 18);
      for (let i = 0; i < this.eyes.length; i++) this.eyes[i].scale.y = Math.max(0.05, this.eyeS);
      this.browK += (e.brow - this.browK) * Math.min(1, dt * 10); this.browY += (e.browY - this.browY) * Math.min(1, dt * 10);
      for (let i = 0; i < this.brows.length; i++) {
        const b = this.brows[i]; b.rotation.z = -b.userData.side * this.browK;
        if (b.userData.y0 == null) b.userData.y0 = b.position.y;
        b.position.y = b.userData.y0 + this.browY * this.d.headR * 0.12;
      }
    }
    dispose() { if (this.root.parent) this.root.parent.remove(this.root); this.root.clear(); this.body = null; }
  }

  KN.Characters = {
    ANIMS, EXPRESSIONS, LOOPS, ONESHOTS,
    create(opts) {
      try { return new Character(opts || {}); }
      catch (e) { console.error('[KN.Characters] create failed', e); return new Character({ kind: 'human', age: 25 }); }
    },
    isSeated: (a) => SEATED.has(a), isLying: (a) => LYING.has(a),
  };
})();
