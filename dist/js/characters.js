/* Một Kiếp Người — procedural 3D people & pets (KN.Characters). See SPEC §4.1, §4.2, §4.4. */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const THREE = window.THREE;
  const U = KN.util;

  const LOOPS = ['idle', 'walk', 'run', 'dance', 'cry', 'sad', 'talk', 'think', 'sit', 'sleep', 'eat', 'drink', 'study', 'type', 'phone', 'sick', 'crawl', 'lift', 'pray', 'swim', 'drive', 'cook', 'sing', 'dead', 'kick', 'dribble', 'swing', 'gamepad', 'guitar', 'box'];
  const ONESHOTS = ['wave', 'cheer', 'jump', 'angry', 'laugh', 'shrug', 'hug', 'love', 'fall', 'bow', 'clap', 'point', 'facepalm', 'scared', 'nod', 'shake'];
  const ANIMS = LOOPS.concat(ONESHOTS);
  const EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'sleepy', 'love', 'sick', 'scared'];

  if (!THREE) { KN.Characters = { create() { return null; }, ANIMS, EXPRESSIONS }; return; }

  const SEATED = new Set(['sit', 'eat', 'drink', 'study', 'type', 'gamepad']);
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
  // dải vỏ cầu phía trước, phủ vùng trán (phi quanh trục Y, +Z là phía trước ứng với phi = π/2)
  const FRINGE_GEO = () => geo('fringe', () => new THREE.SphereGeometry(1, 26, 10, PI / 2 - 1.05, 2.1, PI * 0.12, PI * 0.26));
  const BACK_SHELL = () => geo('bshell', () => new THREE.SphereGeometry(1, 22, 14, Math.PI - 0.55, Math.PI + 1.1, 0.25, Math.PI * 0.75));
  const capsule = (r, len) => geo(`cap|${q(r)}|${q(len)}`, () => new THREE.CapsuleGeometry(q(r), q(Math.max(0.001, len)), 6, 14));
  const cylG = (rt, rb, h, seg = 16, open = false) => geo(`cyl|${q(rt)}|${q(rb)}|${q(h)}|${seg}|${open}`, () => new THREE.CylinderGeometry(q(rt), q(rb), q(h), seg, 1, open));
  const boxG = (w, h, d) => geo(`box|${q(w)}|${q(h)}|${q(d)}`, () => new THREE.BoxGeometry(q(w), q(h), q(d)));
  const coneG = (r, h, seg = 20) => geo(`cone|${q(r)}|${q(h)}|${seg}`, () => new THREE.ConeGeometry(q(r), q(h), seg));
  const torusG = (r, t, arc) => geo(`tor|${q(r)}|${q(t)}|${arc.toFixed(3)}`, () => new THREE.TorusGeometry(q(r), q(t), 8, 20, arc));

  const matCache = new Map();
  // viền sáng Fresnel kiểu phim hoạt hình: mép khối hắt sáng nhẹ (pha màu vật liệu) → nhân vật nổi lên khỏi nền như đồ chơi
  const RIM = { k: 0.2 };
  function addRim(m) {
    m.customProgramCacheKey = () => 'knrim';
    m.onBeforeCompile = (sh) => {
      sh.uniforms.rimK = RIM.u || (RIM.u = { value: RIM.k });
      sh.fragmentShader = 'uniform float rimK;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n{ float fr = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0); fr = fr * fr * fr * fr; totalEmissiveRadiance += mix(vec3(1.0, 0.96, 0.9), diffuseColor.rgb, 0.45) * fr * rimK; }');
    };
  }
  // viền nét vẽ (inverted hull): vỏ đen hơi phình, chỉ thấy mặt sau → đường viền mảnh quanh khối, đọc rõ dáng người dù ở xa
  const OUTLINE = { on: false, w: 0.0085 }; // tắt: viền từng khối làm lộ khớp tay chân như ma-nơ-canh
  let outlineM = null;
  const SKIP_GEO = new Set();
  function addOutline(root) {
    if (!OUTLINE.on) return;
    if (!outlineM) outlineM = new THREE.MeshBasicMaterial({ color: '#1d1420', side: THREE.BackSide });
    const list = [], box = new THREE.Vector3(), ws = new THREE.Vector3();
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (!o.isMesh || !o.castShadow || o.userData.outline || o.userData.noOutline) return;
      const m = o.material; if (!m || m.transparent || m.side !== THREE.FrontSide || m.emissive && m.emissiveIntensity > 0.5) return;
      const g = o.geometry, p = g.parameters || {};
      if (SKIP_GEO.has(g) || p.openEnded || (p.thetaLength != null && p.thetaLength < Math.PI - 0.01) || (p.phiLength != null && p.phiLength < Math.PI * 2 - 0.01)) return;
      if (!g.boundingBox) g.computeBoundingBox();
      g.boundingBox.getSize(box); o.getWorldScale(ws);
      const minDim = Math.min(box.x * ws.x, box.y * ws.y, box.z * ws.z);
      if (minDim < 0.014) return;
      list.push([o, U.clamp(OUTLINE.w * 2 / minDim, 0.015, 0.22)]);
    });
    list.forEach(([o, e]) => { const h = new THREE.Mesh(o.geometry, outlineM); h.scale.setScalar(1 + e); h.userData.outline = true; h.castShadow = false; h.raycast = () => {}; o.add(h); });
  }
  // tóc: texture vẽ tay bằng canvas — sợi tóc dọc sáng tối xen kẽ + vệt bóng “vòng thiên thần” kiểu anime; dùng cả làm bump cho có thớ
  let hairTex = null;
  function hairTexture() {
    if (hairTex) return hairTex;
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    g.fillStyle = '#e4e4e4'; g.fillRect(0, 0, 256, 256);
    let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    // lọn tóc: dải mềm rộng, tương phản rất thấp (kiểu hoạt hình, không phải sợi li ti)
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 256, w = 8 + rnd() * 14, dark = rnd() < 0.5;
      const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      const c0 = dark ? 'rgba(150,150,150,0)' : 'rgba(255,255,255,0)', c1 = dark ? 'rgba(150,150,150,0.35)' : 'rgba(255,255,255,0.55)';
      gr.addColorStop(0, c0); gr.addColorStop(0.5, c1); gr.addColorStop(1, c0);
      g.fillStyle = gr; g.fillRect(x - w / 2, 0, w, 256);
    }
    g.globalAlpha = 1;
    // vòng bóng: dải sáng ngang (uv.y≈0.72 ở phần chỏm), mép răng cưa theo sợi
    for (let x = 0; x < 256; x += 2) {
      const y0 = 62 + Math.sin(x * 0.11) * 4 + rnd() * 5, h = 10 + rnd() * 9;
      const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x, y0, 2, h);
    }
    hairTex = new THREE.CanvasTexture(cv); hairTex.encoding = THREE.sRGBEncoding; hairTex.wrapS = hairTex.wrapT = THREE.RepeatWrapping; hairTex.anisotropy = 4;
    return hairTex;
  }
  let blobM = null;
  function blobMat() {
    if (blobM) return blobM;
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(20,14,30,0.55)'); rg.addColorStop(0.55, 'rgba(20,14,30,0.28)'); rg.addColorStop(1, 'rgba(20,14,30,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    blobM = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    return blobM;
  }
  const hairCache = new Map();
  function hairMat(color) {
    let m = hairCache.get(color);
    if (!m) {
      const t = hairTexture();
      m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(1.12), map: t, roughness: 0.48, metalness: 0.05 });
      addRim(m); hairCache.set(color, m);
    }
    return m;
  }
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
      if (!o.emissive && (o.opacity ?? 1) >= 1) addRim(m);
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

  function lum(hex) { const n = parseInt(String(hex).replace('#', ''), 16) || 0; return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
  // số áo đấu: canvas texture (cache theo số + màu)
  const numCache = new Map();
  function numberMat(n, color) {
    const key = n + '|' + color; let m = numCache.get(key);
    if (!m) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 128;
      const g = cv.getContext('2d'); g.font = 'bold 92px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.strokeText(String(n), 64, 70); g.fillStyle = color; g.fillText(String(n), 64, 70);
      const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
      m = new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      numCache.set(key, m);
    }
    return m;
  }
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
    // tỉ lệ “bán chibi”: đầu to hơn người thật một chút cho dễ thương, mặt đọc rõ cảm xúc từ xa
    const headRatio = a < 1 ? 0.29 : a < 3 ? 0.27 : a < 6 ? 0.245 : a < 10 ? 0.225 : a < 14 ? 0.208 : 0.192;
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
      // tay chân đầy đặn (bản cũ mảnh như que, trông giống ma-nơ-canh)
      uaR: 0.053 * ws * bw * babyFat, faR: 0.045 * ws * bw * babyFat,
      thR: 0.078 * ws * bw * babyFat, shR: 0.058 * ws * bw * babyFat,
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
    // ---- thể thao & sở thích ----
    kick(o, t) { // tâng bóng bằng chân phải
      const k = pos(S(t * 4.6)); o[I.tRx] = -k * 0.95; o[I.kR] = k * 0.55; o[I.fR] = k * 0.3;
      o[I.kL] = 0.12; o[I.tLz] = 0.06; o[I.sLz] = 0.45; o[I.sRz] = -0.45; o[I.eL] = -0.4; o[I.eR] = -0.4;
      o[I.hdx] = 0.35; o[I.by] = -0.015; o[I.hrz] = -k * 0.04;
    },
    dribble(o, t) { // dẫn bóng rổ tay phải, khuỵu gối
      const b = S(t * 7); o[I.sRx] = -0.45 + b * 0.22; o[I.sRz] = 0.12; o[I.eR] = -0.55 - pos(-b) * 0.4;
      o[I.sLx] = -0.55; o[I.sLz] = 0.32; o[I.eL] = -0.9; o[I.by] = -0.05; o[I.kL] = 0.35; o[I.kR] = 0.35; o[I.tLx] = -0.25; o[I.tRx] = -0.25;
      o[I.srx] = 0.18; o[I.hdx] = -0.15; o[I.hry] = S(t * 1.2) * 0.15;
    },
    swing(o, t) { // vung vợt cầu lông
      const w = (t * 1.6) % 1, hit = w < 0.25 ? S((w / 0.25) * PI * 0.5) : 1 - (w - 0.25) / 0.75;
      o[I.sRz] = -0.6 - hit * 2.0; o[I.sRx] = -0.3 + hit * 0.3; o[I.eR] = -1.6 + hit * 1.4; o[I.cry] = -0.25 + hit * 0.45;
      o[I.sLx] = -0.9; o[I.sLz] = 0.3; o[I.eL] = -0.6; o[I.kL] = 0.25; o[I.kR] = 0.15; o[I.tLx] = -0.15; o[I.hdx] = -0.25;
      o[I.by] = -0.02 + pos(S(w * PI)) * 0.03;
    },
    gamepad(o, t, d) { // ngồi chơi game, ngón cái bấm liên tục
      seat(o, d, t); o[I.sLx] = -0.75; o[I.sRx] = -0.75; o[I.sLz] = -0.42; o[I.sRz] = 0.42; o[I.eL] = -1.25 + S(t * 21) * 0.03; o[I.eR] = -1.25 + S(t * 19 + 1) * 0.03;
      o[I.hdx] = 0.3; o[I.srx] = 0.16 + S(t * 0.6) * 0.03; o[I.hry] = S(t * 2.7) * 0.04;
    },
    guitar(o, t) { // ôm đàn: tay trái giữ cần, tay phải gảy
      POSES.idle(o, t); o[I.sLx] = -0.75; o[I.sLz] = 0.7; o[I.eL] = -0.45; o[I.sLy] = -0.2;
      o[I.sRx] = -0.45; o[I.sRz] = 0.3; o[I.eR] = -1.45 + S(t * 11) * 0.16; o[I.hdx] = 0.25; o[I.hdz] = S(t * 1.6) * 0.1;
      o[I.kL] = 0.08 + pos(S(t * 3.2)) * 0.12;
    },
    box(o, t) { // thủ thế + đấm thẳng luân phiên
      const p = (t * 2.2) % 2, jabL = p < 0.3 ? S((p / 0.3) * PI) : 0, jabR = p > 1 && p < 1.3 ? S(((p - 1) / 0.3) * PI) : 0;
      o[I.sLx] = -1.25 - jabL * 0.25; o[I.sLz] = -0.2; o[I.eL] = -2.1 + jabL * 2.0;
      o[I.sRx] = -1.2 - jabR * 0.25; o[I.sRz] = 0.25; o[I.eR] = -2.2 + jabR * 2.1;
      o[I.cry] = (jabR - jabL) * 0.35; o[I.by] = -0.04 + Math.abs(S(t * 6)) * 0.015; o[I.kL] = 0.3; o[I.kR] = 0.3; o[I.tLx] = -0.18; o[I.tRx] = 0.1; o[I.hdx] = 0.15;
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
    // bóng đá (trắng, mảng đen) — nảy trên mu bàn chân, vị trí cập nhật mỗi khung hình
    P.ball = new THREE.Group();
    ell(mat('#fafafa', { rough: 0.45 }), P.ball, 0.11 * s, 0.11 * s, 0.11 * s, 0, 0, 0);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2, b = i % 2 ? 0.5 : -0.4; ell(mat('#1d1d1d', { rough: 0.5 }), P.ball, 0.04 * s, 0.04 * s, 0.02 * s, C(a) * C(b) * 0.1 * s, S(b) * 0.1 * s, S(a) * C(b) * 0.1 * s, true).lookAt(0, 0, 0); }
    c.body.add(P.ball);
    // bóng rổ
    P.bball = new THREE.Group();
    ell(mat('#e8702a', { rough: 0.7 }), P.bball, 0.12 * s, 0.12 * s, 0.12 * s, 0, 0, 0);
    [0, PI / 2].forEach((r) => { const t = mesh(torusG(0.121 * s, 0.004 * s, PI * 2), mat('#2a1a10'), P.bball, 0, 0, 0, false); t.rotation.y = r; });
    mesh(torusG(0.121 * s, 0.004 * s, PI * 2), mat('#2a1a10'), P.bball, 0, 0, 0, false).rotation.x = PI / 2;
    c.body.add(P.bball);
    // vợt cầu lông
    P.racket = new THREE.Group();
    mesh(cylG(0.012 * s, 0.014 * s, 0.16 * s, 8), mat('#2b2b2b'), P.racket, 0, 0, 0);
    mesh(cylG(0.004 * s, 0.004 * s, 0.24 * s, 6), mat('#c9ccd1', { metal: 0.6, rough: 0.3 }), P.racket, 0, 0.2 * s, 0);
    const rh = mesh(torusG(0.1 * s, 0.008 * s, PI * 2), mat(U.pick(['#d62828', '#1f6feb', '#2a9d8f']), { rough: 0.4 }), P.racket, 0, 0.42 * s, 0); rh.scale.y = 1.3;
    const str = mesh(geo('rstr', () => new THREE.CircleGeometry(1, 20)), mat('#ffffff', { opacity: 0.35, side: 1 }), P.racket, 0, 0.42 * s, 0, false); str.scale.set(0.1 * s, 0.13 * s, 1);
    P.racket.position.set(0, -0.08 * s, 0.03 * s); P.racket.rotation.x = -1.2; P.racket.scale.setScalar(1.45); hand.add(P.racket);
    // tay cầm chơi game
    P.pad = new THREE.Group();
    const padM = mat(U.pick(['#2b2b2b', '#f2f2f0', '#3b5bdb']), { rough: 0.4 });
    mesh(boxG(0.16 * s, 0.035 * s, 0.07 * s), padM, P.pad);
    [-1, 1].forEach((x) => ell(padM, P.pad, 0.035 * s, 0.03 * s, 0.05 * s, x * 0.075 * s, -0.008 * s, -0.025 * s, true));
    [-1, 1].forEach((x) => ell(mat('#e03131', { emissive: '#ff3b3b', ei: 0.4 }), P.pad, 0.01 * s, 0.006 * s, 0.01 * s, x * 0.04 * s, 0.02 * s, 0.01 * s, true));
    P.pad.position.set(0.09 * s, -0.08 * s, 0.05 * s); P.pad.rotation.x = -0.4; hand.add(P.pad);
    // guitar ôm trước ngực
    P.guitar = new THREE.Group();
    const wood = mat('#b5651d', { rough: 0.45 }), dk = mat('#3b2412', { rough: 0.5 });
    ell(wood, P.guitar, 0.17 * s, 0.14 * s, 0.05 * s, 0, 0, 0); ell(wood, P.guitar, 0.13 * s, 0.11 * s, 0.05 * s, 0.17 * s, 0, 0);
    ell(dk, P.guitar, 0.045 * s, 0.045 * s, 0.01 * s, 0.09 * s, 0, 0.045 * s, true);
    mesh(boxG(0.42 * s, 0.035 * s, 0.025 * s), dk, P.guitar, 0.45 * s, 0, 0.01 * s);
    mesh(boxG(0.07 * s, 0.05 * s, 0.03 * s), dk, P.guitar, 0.68 * s, 0, 0.01 * s);
    P.guitar.position.set(-0.1 * s, d.torso * 0.12, d.chestR * 1.05); P.guitar.rotation.set(0, 0, 0.3); P.guitar.scale.setScalar(0.85); c.j.chest.add(P.guitar);
    // găng đấm bốc
    P.gloveL = new THREE.Group(); P.gloveR = new THREE.Group();
    const glM = mat(U.pick(['#c1121f', '#1d3557', '#111111']), { rough: 0.35 });
    [[P.gloveL, handL], [P.gloveR, hand]].forEach(([g, h]) => { ell(glM, g, d.faR * 1.9, d.faR * 2.2, d.faR * 1.9, 0, -d.faR * 1.3, d.faR * 0.2); mesh(cylG(d.faR * 1.3, d.faR * 1.3, d.faR * 1.2, 12), mat('#f2f2f0'), g, 0, 0, 0); h.add(g); });
    Object.values(P).forEach((p) => (p.visible = false));
    return P;
  }
  const PROPS_FOR = {
    study: ['book'], type: ['laptop'], phone: ['phone'], eat: ['bowl', 'chop'], drink: ['cup'], lift: ['dbL', 'dbR'],
    sing: ['mic'], cook: ['wok', 'spat'], drive: ['scooter'], pray: ['incense'],
    kick: ['ball'], dribble: ['bball'], swing: ['racket'], gamepad: ['pad'], guitar: ['guitar'], box: ['gloveL', 'gloveR'],
  };

  // ---------- human ----------
  function buildHuman(c) {
    const app = c.app, d = c.d, age = d.age;
    const baby = age < 2;
    const style = baby ? 'onesie' : (app.topStyle || 'tshirt');
    const female = c.gender === 'f';
    // da: ánh ấm nhẹ giả tán xạ dưới da cho đỡ “nhựa”
    const skin = mat(app.skin || '#e6b48f', { rough: 0.58, emissive: U.shadeHex(app.skin || '#e6b48f', -0.35), ei: 0.12 });
    const hairColor = U.mixHex(app.hair || '#1c1410', age > 70 ? '#f0f0ee' : '#bdbdbd', d.senior);
    const hairM = hairMat(hairColor);
    let topC = app.top || '#d9534f', botC = app.bottom || '#2f3b52';
    if (style === 'school') { topC = '#f7f7f4'; botC = age < 11 ? '#1f2d55' : (app.bottom || '#1f2d55'); }
    if (style === 'coat') topC = '#f4f6f8';
    if (style === 'uniform') { topC = app.top && app.top !== '#d9534f' ? app.top : '#5b6b3a'; }
    const topM = mat(topC, { rough: style === 'suit' ? 0.55 : 0.8 });
    const botM = mat(botC, { rough: 0.8 });
    const shoeM = mat(app.shoes || '#2b2b2b', { rough: 0.5 });
    const longSleeve = ['shirt', 'hoodie', 'suit', 'coat', 'uniform', 'aodai', 'onesie', 'jacket', 'sweater'].includes(style);
    const skirt = style === 'dress';
    const shorts = style === 'jersey' || style === 'tank';
    const legM = skirt ? skin : (style === 'onesie' ? topM : botM);

    const body = c.body, j = {};
    j.hips = pivot(body, 0, d.legLen, 0); j.hips.rotation.order = 'YXZ';
    j.spine = pivot(j.hips, 0, 0, 0);
    j.chest = pivot(j.spine, 0, d.torso * 0.42, 0);
    // neck & head
    j.neck = pivot(j.chest, 0, d.torso * 0.58, 0);
    // thân, cổ, tay, chân là các khối liền có xương (skinned) — dựng ở skinBody() sau khi đủ khớp
    j.head = pivot(j.neck, 0, d.neck, 0);
    const hr = d.headR, cy = hr * 0.98;
    ell(skin, j.head, hr * 0.92, hr * 1.04, hr * 0.98, 0, cy, 0);
    ell(skin, j.head, hr * 0.8, hr * 0.6, hr * 0.74, 0, cy - hr * 0.34, hr * 0.1);   // má + cằm tròn mềm
    // tai: vành + lõm trong
    const earIn = mat(U.shadeHex(app.skin || '#e6b48f', -0.12), { rough: 0.7 });
    [1, -1].forEach((sd) => {
      const e = ell(skin, j.head, hr * 0.12, hr * 0.2, hr * 0.09, sd * hr * 0.9, cy - hr * 0.06, -hr * 0.02, true); e.rotation.y = sd * 0.35;
      ell(earIn, j.head, hr * 0.06, hr * 0.12, hr * 0.04, sd * hr * 0.97, cy - hr * 0.06, hr * 0.02, true);
    });
    ell(mat(U.shadeHex(app.skin || '#e6b48f', -0.05), { rough: 0.55 }), j.head, hr * 0.085, hr * 0.11, hr * 0.1, 0, cy - hr * 0.2, hr * 0.95, true); // mũi
    j.headTop = pivot(j.head, 0, cy + hr * 1.08, 0);
    // mắt: to, tròng màu + con ngươi + 2 điểm sáng; nữ trưởng thành có mi
    const kid = U.clamp((14 - age) / 12, 0, 1);
    const er = hr * (0.215 + kid * 0.04), eyeY = cy - hr * (0.04 + kid * 0.08), eyeX = hr * 0.37, eyeZ = hr * 0.79;
    const white = mat('#fbfbf8', { rough: 0.3 }), iris = mat(app.eyes || '#2a1b12', { rough: 0.2 }), pupil = mat('#0b0705', { rough: 0.15 });
    const shine = mat('#ffffff', { emissive: '#ffffff', ei: 0.8 });
    const lashM = mat('#140d0a', { rough: 0.5 });
    c.eyes = [];
    [1, -1].forEach((sd) => {
      const g = pivot(j.head, sd * eyeX, eyeY, eyeZ);
      g.rotation.y = sd * 0.18;
      ell(white, g, er, er * 1.1, er * 0.6, 0, 0, 0, true);
      ell(iris, g, er * 0.74, er * 0.82, er * 0.32, 0, -er * 0.06, er * 0.4, true);
      ell(pupil, g, er * 0.38, er * 0.44, er * 0.2, 0, -er * 0.08, er * 0.52, true);
      ell(shine, g, er * 0.2, er * 0.2, er * 0.1, sd * er * 0.22, er * 0.26, er * 0.62, true);
      ell(shine, g, er * 0.09, er * 0.09, er * 0.06, -sd * er * 0.2, -er * 0.3, er * 0.6, true);
      // mí trên: viền tối (mi dày hơn ở nữ trưởng thành)
      const lid = mesh(torusG(er * 0.98, er * (female && age >= 14 ? 0.13 : 0.07), PI), lashM, g, 0, -er * 0.02, er * 0.18, false);
      lid.scale.set(1, 1.08, 0.6);
      if (female && age >= 14) { const fl = mesh(boxG(er * 0.5, er * 0.12, er * 0.1), lashM, g, sd * er * 1.0, er * 0.42, er * 0.18, false); fl.rotation.z = sd * 0.6; }
      c.eyes.push(g);
    });
    // lông mày cong
    const browM = mat(U.shadeHex(hairColor, -0.05), { rough: 0.8 });
    c.brows = [1, -1].map((sd) => {
      const b = pivot(j.head, sd * eyeX, eyeY + er * 1.55, eyeZ + er * 0.2);
      const arc = mesh(torusG(er * 1.15, er * (female ? 0.11 : 0.16), PI * 0.55), browM, b, 0, -er * 0.95, 0, false);
      arc.rotation.z = PI / 2 - PI * 0.275; arc.scale.z = 0.6;
      b.rotation.y = sd * 0.15; b.userData.side = sd; return b;
    });
    // mouth variants
    const lip = mat(female && age >= 14 ? '#c2525c' : '#b05a50', { rough: 0.45 }), inner = mat('#5a1e1e', { rough: 0.6 });
    const my = cy - hr * 0.46, mz = hr * (app.beard ? 0.96 : 0.9);
    c.mouth = {
      smile: mesh(torusG(hr * 0.17, hr * 0.032, PI), lip, j.head, 0, my + hr * 0.1, mz),
      grin: new THREE.Group(),
      frown: mesh(torusG(hr * 0.15, hr * 0.03, PI), lip, j.head, 0, my - hr * 0.06, mz),
      open: ell(inner, j.head, hr * 0.12, hr * 0.13, hr * 0.06, 0, my, mz, true),
      flat: mesh(boxG(hr * 0.2, hr * 0.035, hr * 0.03), lip, j.head, 0, my, mz),
      soft: mesh(torusG(hr * 0.12, hr * 0.028, PI * 0.7), lip, j.head, 0, my + hr * 0.07, mz),
    };
    c.mouth.smile.rotation.z = PI;
    c.mouth.soft.rotation.z = PI + PI * 0.15;
    // dấu vết thời gian: nếp nhăn trán (40+), chân chim & rãnh cười (55+), bọng mắt & đốm đồi mồi (65+); mụn tuổi dậy thì
    const wrinkM = mat(U.shadeHex(app.skin || '#e6b48f', -0.22), { rough: 0.8 });
    if (age >= 40) {
      const n = age >= 65 ? 3 : age >= 52 ? 2 : 1;
      for (let i = 0; i < n; i++) { const w = mesh(torusG(hr * (0.42 - i * 0.04), hr * 0.012, PI * 0.5), wrinkM, j.head, 0, cy + hr * (0.18 + i * 0.13) - hr * 0.4, hr * 0.9 - i * hr * 0.03, false); w.rotation.z = PI / 4; w.scale.z = 0.4; }
    }
    if (age >= 55) [1, -1].forEach((sd) => {
      for (let i = 0; i < 2; i++) { const cf = mesh(boxG(er * 0.6, hr * 0.012, hr * 0.01), wrinkM, j.head, sd * (eyeX + er * 1.35), eyeY - er * 0.1 + i * er * 0.35, eyeZ - er * 0.15, false); cf.rotation.z = sd * (i ? 0.35 : -0.2); cf.rotation.y = sd * 0.6; }
      const nl = mesh(torusG(hr * 0.22, hr * 0.013, PI * 0.35), wrinkM, j.head, sd * hr * 0.2, cy - hr * 0.42, hr * 0.86, false); nl.rotation.z = sd > 0 ? PI * 0.55 : PI * 0.1; nl.scale.z = 0.4;
    });
    if (age >= 65) {
      [1, -1].forEach((sd) => { const bag = ell(mat(U.shadeHex(app.skin || '#e6b48f', -0.1), { rough: 0.7 }), j.head, er * 0.9, er * 0.32, er * 0.3, sd * eyeX, eyeY - er * 1.05, eyeZ - er * 0.05, true); bag.castShadow = false; });
      const spotM = mat(U.shadeHex(app.skin || '#e6b48f', -0.3), { rough: 0.8 });
      [[0.45, 0.45], [-0.55, 0.3], [0.6, -0.1]].forEach(([x, y]) => { const sp = ell(spotM, j.head, hr * 0.05, hr * 0.04, hr * 0.02, x * hr, cy + y * hr, hr * 0.84, true); sp.castShadow = false; });
    }
    if (age >= 13 && age <= 18) {
      const acne = mat('#e57373', { rough: 0.6 }); let seed = (c.name || 'x').length * 7 + age;
      for (let i = 0; i < 3; i++) { seed = (seed * 9301 + 49297) % 233280; const a = seed / 233280; const sd = i % 2 ? 1 : -1; const pm = ell(acne, j.head, hr * 0.03, hr * 0.03, hr * 0.02, sd * hr * (0.35 + a * 0.25), cy - hr * (0.15 + a * 0.2), hr * 0.86, true); pm.castShadow = false; }
    }
    // má hồng nhẹ thường trực cho trẻ em & nữ
    if (kid > 0.3 || female) { const ck = mat('#ff9aa8', { opacity: 0.22, rough: 0.9 }); [1, -1].forEach((sd) => { const b = ell(ck, j.head, hr * 0.15, hr * 0.08, hr * 0.04, sd * hr * 0.5, cy - hr * 0.3, hr * 0.84, true); b.castShadow = false; }); }
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
    // phụ kiện của skin đặc biệt (mở bằng thành tựu)
    if (app.acc && age >= 6) buildAcc(c, j, app.acc, hr, cy, d, topC);
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
    // áo mới: khoác, len, áo đấu, ba lỗ
    const accent = lum(topC) > 0.6 ? U.shadeHex(topC, -0.45) : '#f5f5f2';
    if (style === 'jacket') {
      const inner = mat(lum(topC) > 0.6 ? '#3a3f4b' : U.pick(['#f5f5f2', '#ece7dc']), { rough: 0.85 });
      // vạt áo mở: lớp áo trong hình nêm hẹp dần xuống dưới
      const wedge = mesh(coneG(d.chestR * 0.3, d.torso * 0.62, 3), inner, j.chest, 0, d.torso * 0.24, d.chestR * 0.71, false);
      wedge.rotation.z = PI; wedge.scale.z = 0.12;
      mesh(boxG(0.006, d.torso * 0.6, 0.012), mat('#c9ccd1', { metal: 0.6, rough: 0.3 }), j.chest, d.chestR * 0.3, d.torso * 0.22, d.chestR * 0.76, false);
      mesh(torusG(d.headR * 0.48, d.headR * 0.09, PI * 2), topM, j.chest, 0, d.torso * 0.56, 0).rotation.x = PI / 2;
    }
    if (style === 'sweater') {
      const rib = mat(U.shadeHex(topC, -0.08), { rough: 0.95 });
      mesh(torusG(d.waistR * 1.0, d.waistR * 0.12, PI * 2), rib, j.hips, 0, d.waistR * 0.45, 0).rotation.x = PI / 2;
      mesh(torusG(d.headR * 0.42, d.headR * 0.1, PI * 2), rib, j.chest, 0, d.torso * 0.56, 0).rotation.x = PI / 2;
    }
    if (style === 'tshirt' || style === 'jersey' || style === 'tank') mesh(torusG(d.headR * 0.4, d.headR * 0.05, PI * 2), mat(style === 'jersey' ? accent : U.shadeHex(topC, -0.1)), j.chest, 0, d.torso * 0.555, d.chestR * 0.05, false).rotation.x = PI / 2 - 0.25;
    if (style === 'jersey') {
      // số áo trên lưng + sọc ngang ngực
      const num = c.app.number || (2 + Math.abs(Math.round(((c.name || 'x').charCodeAt(0) * 7) % 22)));
      const back = new THREE.Mesh(new THREE.PlaneGeometry(d.chestR * 1.3, d.chestR * 1.3), numberMat(num, accent));
      back.position.set(0, d.torso * 0.3, -d.chestR * 0.79); back.rotation.y = PI; j.chest.add(back);
      const front = new THREE.Mesh(new THREE.PlaneGeometry(d.chestR * 0.55, d.chestR * 0.55), numberMat(num, accent));
      front.position.set(d.chestR * 0.45, d.torso * 0.42, d.chestR * 0.76); j.chest.add(front);
      mesh(cylG(d.chestR * 1.02, d.chestR * 1.02, d.torso * 0.07, 20, true), mat(accent, { rough: 0.7, side: 1 }), j.chest, 0, d.torso * 0.12, 0, false).scale.set(1.12, 1, 0.77);
    }
    // arms
    ['L', 'R'].forEach((sd) => {
      const sx = sd === 'L' ? 1 : -1;
      const sh = pivot(j.chest, sx * d.shW * 0.46, d.torso * 0.5, 0);
      const shortSleeve = !longSleeve && style !== 'dress' && style !== 'tank';
      if (shortSleeve && style === 'jersey') mesh(torusG(d.uaR * 1.16, d.uaR * 0.1, PI * 2), mat(accent), sh, 0, -d.upperArm * 0.45, 0, false).rotation.x = PI / 2;
      const el = pivot(sh, 0, -d.upperArm, 0);
      if (longSleeve && style !== 'onesie' && style !== 'aodai') mesh(torusG(d.faR * 1.05, d.faR * 0.2, PI * 2), mat(U.shadeHex(topC, style === 'sweater' ? -0.1 : -0.04), { rough: 0.85 }), el, 0, -d.forearm + d.faR * 0.4, 0, false).rotation.x = PI / 2;
      const hand = pivot(el, 0, -d.forearm, 0);
      // bàn tay: lòng bàn tay dẹt + 4 ngón khép (khối bo) + ngón cái chếch ra trước
      ell(skin, hand, d.faR * 0.98, d.faR * 1.0, d.faR * 0.58, 0, -d.faR * 0.85, d.faR * 0.08, true);
      ell(skin, hand, d.faR * 0.9, d.faR * 0.75, d.faR * 0.5, 0, -d.faR * 1.75, d.faR * 0.16, true);
      const th1 = ell(skin, hand, d.faR * 0.32, d.faR * 0.62, d.faR * 0.34, sx * -d.faR * 0.82, -d.faR * 1.0, d.faR * 0.42, true); th1.rotation.z = sx * 0.45;
      j['sh' + sd] = sh; j['el' + sd] = el; j['hand' + sd] = hand;
    });
    // legs
    ['L', 'R'].forEach((sd) => {
      const sx = sd === 'L' ? 1 : -1;
      const th = pivot(j.hips, sx * d.hipW / 2, 0, 0);
      const kn = pivot(th, 0, -d.thigh, 0);
      const ft = pivot(kn, 0, -d.shin, 0);
      if (baby) ell(skin, ft, d.shR * 1.1, d.footH * 0.9, d.shR * 1.9, 0, -d.footH * 0.4, d.shR * 0.6);
      else {
        ell(shoeM, ft, d.shR * 1.15, d.footH * 1.05, d.shR * 2.5, 0, -d.footH * 0.3, d.shR * 1.15);
        ell(mat(style === 'suit' || style === 'aodai' ? '#1a1a1a' : '#f4f2ee', { rough: 0.6 }), ft, d.shR * 1.2, d.footH * 0.42, d.shR * 2.55, 0, -d.footH * 0.92, d.shR * 1.15, true); // đế giày
      }
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
    skinBody(c, { skin, topM, botM, legM, sockM: mat(style === 'jersey' ? topC : '#f2f2f0', { rough: 0.9 }), longSleeve, shorts: shorts && !baby, skirt, style });
  }

  // ---------- thân người liền khối có xương (SkinnedMesh) ----------
  // Mỗi phần (thân, 2 tay, 2 chân) là một ống tròn dựng từ các vòng elip dọc theo xương ở tư thế nghỉ (mọi xương thẳng đứng).
  // Vòng gần khớp được chia trọng số giữa hai xương nên khuỷu tay, đầu gối, vai, hông uốn cong mềm như nhân vật game thật,
  // không còn các khúc rời và “quả bóng” ở vai như búp bê gỗ.
  const RING = 24;
  function boneOf(pv) { if (!pv.userData.bone) { const b = new THREE.Bone(); pv.add(b); pv.userData.bone = b; } return pv.userData.bone; }
  function skinTube(c, rings, mats, bones, out) {
    // bo tròn hai đầu ống (khép vào trong bàn tay, giày, đầu, xương chậu)
    const R = rings.slice();
    const capOf = (r, dir) => { const k = Math.min(r.rx, r.rz); return [Object.assign({}, r, { y: r.y + dir * k * 0.6, rx: r.rx * 0.72, rz: r.rz * 0.72 }), Object.assign({}, r, { y: r.y + dir * k * 0.95, rx: r.rx * 0.08, rz: r.rz * 0.08 })]; };
    const d0 = Math.sign(R[0].y - R[1].y) || 1, d1 = Math.sign(R[R.length - 1].y - R[R.length - 2].y) || -1;
    R.unshift(...capOf(rings[0], d0).reverse()); R.push(...capOf(rings[rings.length - 1], d1));
    const nV = R.length * RING, pos = new Float32Array(nV * 3), si = new Uint16Array(nV * 4), sw = new Float32Array(nV * 4);
    R.forEach((r, i) => {
      const ws = r.w.map(([pv, w]) => [bones.indexOf(boneOf(pv)) >= 0 ? bones.indexOf(boneOf(pv)) : bones.push(boneOf(pv)) - 1, w]);
      const tot = ws.reduce((a, x) => a + x[1], 0) || 1;
      for (let k = 0; k < RING; k++) {
        const a = (k / RING) * PI * 2, v = i * RING + k;
        pos[v * 3] = (r.x || 0) + C(a) * r.rx; pos[v * 3 + 1] = r.y; pos[v * 3 + 2] = (r.z || 0) + S(a) * r.rz + (S(a) < 0 ? 0 : 0);
        for (let q = 0; q < 4; q++) { si[v * 4 + q] = ws[q] ? ws[q][0] : 0; sw[v * 4 + q] = ws[q] ? ws[q][1] / tot : 0; }
      }
    });
    const up = R[1].y > R[0].y, idx = [], g = new THREE.BufferGeometry();
    let gStart = 0, gMat = R[0].m || 0;
    for (let i = 0; i < R.length - 1; i++) {
      const m = R[i].m || 0;
      if (m !== gMat) { g.addGroup(gStart, idx.length - gStart, gMat); gStart = idx.length; gMat = m; }
      for (let k = 0; k < RING; k++) {
        const a = i * RING + k, b = i * RING + (k + 1) % RING, c2 = (i + 1) * RING + k, d2 = (i + 1) * RING + (k + 1) % RING;
        if (!up) idx.push(a, b, c2, b, d2, c2); else idx.push(a, c2, b, b, c2, d2);
      }
    }
    g.addGroup(gStart, idx.length - gStart, gMat);
    g.setIndex(idx); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    g.computeVertexNormals();
    const sm = new THREE.SkinnedMesh(g, mats); sm.castShadow = true; sm.frustumCulled = false; sm.userData.noOutline = true;
    c.body.add(sm); out.push(sm);
  }
  function skinBody(c, o) {
    const d = c.d, j = c.j, T = d.torso, yh = d.legLen, hr = d.headR;
    const bones = [], meshes = [];
    const grown = U.clamp((d.age - 12) / 6, 0, 1), fem = c.gender === 'f' ? grown : 0, male = c.gender === 'm' ? grown : 0;
    const ring = (y, rx, rz, w, m, x, z) => ({ y, rx, rz: rz == null ? rx : rz, w, m, x, z });
    // --- thân: xương chậu → eo → ngực → vai → cổ (đi lên)
    const full = o.style === 'onesie' || o.style === 'dress' || o.style === 'coat' || o.style === 'aodai';
    const lowM = full ? 1 : 2; // 0 da, 1 áo, 2 quần
    const hipRx = Math.max(d.waistR * 1.06, d.hipW * 0.5 + d.thR * 1.04);
    skinTube(c, [
      ring(yh - d.thR * 0.4, d.hipW * 0.5 + d.thR * 0.25, d.thR * 0.85, [[j.hips, 1]], lowM),
      ring(yh - d.thR * 0.05, hipRx, d.waistR * 0.88, [[j.hips, 1]], lowM),
      ring(yh + T * 0.1, d.waistR * 1.02 * (1 + fem * 0.06), d.waistR * 0.82, [[j.hips, 0.5], [j.spine, 0.5]], 1, 0, -d.waistR * 0.04 * fem),
      // eo thon hơn ở nữ, bụng phẳng hơn ở nam
      ring(yh + T * 0.3, d.waistR * (0.97 - fem * 0.1), d.waistR * (0.8 - fem * 0.04), [[j.spine, 1]], 1),
      ring(yh + T * 0.52, d.chestR * (1.1 - fem * 0.04), d.chestR * (0.8 + fem * 0.06), [[j.spine, 0.4], [j.chest, 0.6]], 1, 0, d.chestR * 0.05 * fem),
      // ngực: nữ nhô ra trước; nam rộng vai, ngực phẳng (dáng chữ V)
      ring(yh + T * 0.68, Math.max(d.chestR * 1.12, d.shW * (0.42 + male * 0.03)), d.chestR * (0.78 + fem * 0.14), [[j.chest, 1]], 1, 0, d.chestR * 0.1 * fem),
      ring(yh + T * 0.86, d.shW * (0.46 + male * 0.02), d.chestR * 0.68, [[j.chest, 1]], 1),
      ring(yh + T * 0.97, d.shW * 0.28, d.chestR * 0.5, [[j.chest, 1]], 1),
      // cổ áo: vòng kép cùng vị trí → mép cứng, pháp tuyến của cổ không bị “ngửa” theo bờ vai (cổ từng bị sáng trắng hơn mặt)
      ring(yh + T + d.neck * 0.1, hr * 0.4, hr * 0.38, [[j.chest, 0.5], [j.neck, 0.5]], 1),
      ring(yh + T + d.neck * 0.1, hr * 0.37, hr * 0.35, [[j.chest, 0.5], [j.neck, 0.5]], 1),
      ring(yh + T + d.neck * 0.1, hr * 0.37, hr * 0.35, [[j.chest, 0.5], [j.neck, 0.5]], 0), // bản sao trùng khít: tách pháp tuyến
      ring(yh + T + d.neck * 0.5, hr * 0.35, hr * 0.34, [[j.neck, 1]], 0),
      ring(yh + T + d.neck * 1.05, hr * 0.34, hr * 0.33, [[j.neck, 1]], 0),
    ], [o.skin, o.topM, o.botM], bones, meshes);
    // --- tay (đi xuống): vai → khuỷu → cổ tay
    ['L', 'R'].forEach((sd) => {
      const sx = sd === 'L' ? 1 : -1, x = sx * d.shW * 0.46, y0 = yh + T * 0.92, Ua = d.upperArm, Fa = d.forearm, ua = d.uaR, fa = d.faR;
      const sh = j['sh' + sd], el = j['el' + sd], hd = j['hand' + sd];
      const bare = o.style === 'tank' || o.style === 'dress', shortS = !o.longSleeve && !bare;
      const sl = o.longSleeve ? 1 : 0, loose = shortS ? 1.14 : 1;
      const R = [
        ring(y0 + ua * 0.15, ua * 1.0 * loose, null, [[j.chest, 0.6], [sh, 0.4]], bare ? 0 : 1, x),
        ring(y0 - ua * 0.5, ua * 1.1 * loose, null, [[sh, 0.85], [j.chest, 0.15]], bare ? 0 : 1, x),
      ];
      if (shortS) R.push(ring(y0 - Ua * 0.45, ua * 1.06 * loose, null, [[sh, 1]], 1, x), ring(y0 - Ua * 0.45, ua * 0.98, null, [[sh, 1]], 1, x), ring(y0 - Ua * 0.45, ua * 0.98, null, [[sh, 1]], 0, x));
      else R.push(ring(y0 - Ua * 0.45, ua, null, [[sh, 1]], sl, x));
      R.push(
        ring(y0 - Ua + ua * 0.9, ua * 0.95, null, [[sh, 0.8], [el, 0.2]], sl, x),
        ring(y0 - Ua, (ua + fa) * 0.5, null, [[sh, 0.5], [el, 0.5]], sl, x),
        ring(y0 - Ua - fa * 0.9, fa * 1.03, null, [[el, 0.8], [sh, 0.2]], sl, x),
        ring(y0 - Ua - Fa * 0.5, fa, null, [[el, 1]], sl, x),
        ring(y0 - Ua - Fa + fa * 0.5, fa * 0.8, fa * 0.72, [[el, 0.7], [hd, 0.3]], sl, x));
      skinTube(c, R, [o.skin, o.topM], bones, meshes);
    });
    // --- chân (đi xuống): háng → gối → cổ chân
    ['L', 'R'].forEach((sd) => {
      const sx = sd === 'L' ? 1 : -1, x = sx * d.hipW / 2, Th = d.thigh, Sh = d.shin, tr = d.thR, sr = d.shR;
      const th = j['th' + sd], kn = j['kn' + sd], ft = j['ft' + sd];
      const leg = o.skirt ? 0 : 1, below = o.shorts ? 0 : leg; // 0 da, 1 quần/ống, 2 tất
      const R = [
        ring(yh - tr * 0.1, tr * 1.0, null, [[j.hips, 0.6], [th, 0.4]], o.shorts ? 1 : leg, x),
        ring(yh - tr * 0.65, tr * 1.08 * (o.shorts ? 1.1 : 1), null, [[th, 0.8], [j.hips, 0.2]], o.shorts ? 1 : leg, x),
      ];
      if (o.shorts) R.push(ring(yh - Th * 0.55, tr * 1.12, null, [[th, 1]], 1, x), ring(yh - Th * 0.55, tr * 0.95, null, [[th, 1]], 1, x), ring(yh - Th * 0.55, tr * 0.95, null, [[th, 1]], 0, x));
      else R.push(ring(yh - Th * 0.5, tr * 0.98, null, [[th, 1]], leg, x));
      R.push(
        ring(yh - Th + sr * 0.9, tr * 0.88, null, [[th, 0.8], [kn, 0.2]], below, x),
        ring(yh - Th, (tr + sr) * 0.5, null, [[th, 0.5], [kn, 0.5]], below, x),
        ring(yh - Th - sr * 0.9, sr * 1.04, null, [[kn, 0.85], [th, 0.15]], below, x, -sr * 0.06));
      if (o.shorts) R.push(ring(yh - Th - Sh * 0.42, sr * 1.06, null, [[kn, 1]], 2, x, -sr * 0.08));
      else R.push(ring(yh - Th - Sh * 0.4, sr * 1.06, null, [[kn, 1]], below, x, -sr * 0.08));
      R.push(
        ring(yh - Th - Sh * 0.8, sr * 0.82, null, [[kn, 1]], o.shorts ? 2 : below, x),
        ring(yh - Th - Sh + sr * 0.3, sr * 0.74, null, [[kn, 0.5], [ft, 0.5]], o.shorts ? 2 : below, x));
      skinTube(c, R, [o.skin, o.legM === o.skin ? o.botM : o.legM, o.sockM], bones, meshes);
    });
    c.body.updateMatrixWorld(true);
    const skel = new THREE.Skeleton(bones);
    meshes.forEach((m) => m.bind(skel, m.matrixWorld));
    c.skinned = meshes;
  }

  // ngọn tóc: chuỗi chóp nhọn nhỏ dọc mép dưới của một vỏ tóc (toạ độ cầu đơn vị của chính vỏ đó) → mép tóc lởm chởm tự nhiên thay vì viền tròn như mũ bảo hiểm
  const TIP_GEO = () => geo('htip', () => new THREE.ConeGeometry(1, 1, 7, 1).rotateX(PI).translate(0, -0.5, 0));
  const _tv = new THREE.Vector3(), _down = new THREE.Vector3(0, -1, 0);
  // gộp tất cả ngọn của một mép tóc thành MỘT mesh (một lượt vẽ) — trước đây mỗi ngọn là một mesh riêng, ~20 lượt vẽ/người gây giật
  const _tm = new THREE.Matrix4(), _tq = new THREE.Quaternion(), _tp = new THREE.Vector3(), _ts = new THREE.Vector3(), _tnm = new THREE.Matrix3();
  function hairTips(shell, hm, theta, phi0, phi1, n, size, len, out) {
    const key = ['tips', theta.toFixed(3), phi0.toFixed(3), phi1.toFixed(3), n, size, q(len), out].join('|');
    const g = geo(key, () => {
      const src = TIP_GEO(), sp = src.attributes.position, sn = src.attributes.normal, si = src.index ? src.index.array : null;
      const nv = sp.count, pos = new Float32Array(nv * n * 3), nor = new Float32Array(nv * n * 3), idx = [];
      const st = Math.sin(theta), ct = Math.cos(theta), v = new THREE.Vector3();
      for (let i = 0; i < n; i++) {
        const f = n === 1 ? 0.5 : i / (n - 1), phi = phi0 + (phi1 - phi0) * f, j = Math.sin(i * 12.9898) * 0.5 + 0.5;
        _tp.set(-Math.cos(phi) * st * 0.97, ct * 0.97, Math.sin(phi) * st * 0.97);
        // hướng ngọn: xuôi theo mặt cầu đi xuống, chếch ra ngoài một chút (out)
        _tv.set(-Math.cos(phi) * ct, -st, Math.sin(phi) * ct).normalize();
        _tv.x += -Math.cos(phi) * out; _tv.z += Math.sin(phi) * out; _tv.y -= 0.25; _tv.normalize();
        _tq.setFromUnitVectors(_down, _tv); _ts.set(size * (0.85 + j * 0.3), len * (0.75 + j * 0.5), size * 0.75);
        _tm.compose(_tp, _tq, _ts); _tnm.getNormalMatrix(_tm);
        for (let k = 0; k < nv; k++) {
          v.fromBufferAttribute(sp, k).applyMatrix4(_tm); pos.set([v.x, v.y, v.z], (i * nv + k) * 3);
          v.fromBufferAttribute(sn, k).applyMatrix3(_tnm).normalize(); nor.set([v.x, v.y, v.z], (i * nv + k) * 3);
        }
        if (si) for (let k = 0; k < si.length; k++) idx.push(si[k] + i * nv);
      }
      const out2 = new THREE.BufferGeometry();
      out2.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out2.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      out2.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(nv * n * 2), 2));
      if (idx.length) out2.setIndex(idx);
      return out2;
    });
    mesh(g, hm, shell, 0, 0, 0, false);
  }
  function buildHair(c, head, hm, hr, cy, style, baby) {
    if (baby) { ell(hm, head, hr * 0.35, hr * 0.18, hr * 0.35, 0, cy + hr * 0.93, 0.0, true); return; }
    if (style === 'bald') { const b = mesh(BACK_SHELL(), hm, head, 0, cy - hr * 0.1, -hr * 0.05); b.scale.set(hr * 0.97, hr * 0.55, hr * 1.0); return; }
    const capS = style === 'buzz' || style === 'undercut' ? 1.015 : 1.07;
    // húi cua / undercut: phần cạo là lớp chân tóc lấm tấm (pha màu da)
    const stubble = style === 'undercut' ? mat(U.mixHex('#' + hm.color.getHexString(), c.app.skin || '#e6b48f', 0.45), { rough: 0.9 }) : hm;
    const cap = mesh(CAP_GEO(), stubble, head, 0, cy + hr * 0.02, -hr * 0.02);
    cap.scale.set(hr * 0.93 * capS, hr * 1.06 * capS, hr * 0.99 * capS); cap.rotation.x = -0.22;
    if (style === 'buzz') return;
    if (style === 'undercut') { // hai bên cạo, phần đỉnh dày vuốt ngược lên
      const top = ell(hm, head, hr * 0.72, hr * 0.4, hr * 0.95, 0, cy + hr * 0.88, -hr * 0.02); top.rotation.x = -0.15;
      const qf = ell(hm, head, hr * 0.62, hr * 0.36, hr * 0.38, 0, cy + hr * 1.02, hr * 0.5); qf.rotation.x = -0.75;
      return;
    }
    const longish = style === 'long' || style === 'wavy';
    const back = mesh(BACK_SHELL(), hm, head, 0, cy - hr * 0.02, -hr * 0.03);
    back.scale.set(hr * 0.98, hr * (longish ? 1.55 : style === 'bob' || style === 'twintail' ? 1.05 : style === 'pixie' ? 0.72 : 0.8), hr * 1.04);
    hairTips(back, hm, 0.25 + PI * 0.75, PI - 0.4, PI * 2 + 0.4, longish ? 13 : 11, longish ? 0.11 : 0.12, longish ? 0.16 : 0.13, 0.12);
    if (longish) { back.position.y = cy - hr * 0.5; ell(hm, head, hr * 0.74, hr * 0.98, hr * 0.34, 0, cy - hr * 1.15, -hr * 0.55); }
    if (style === 'bob' || style === 'twintail') back.position.y = cy - hr * 0.12;
    // mái: vỏ cong ôm trán (thay cho khối u trên đỉnh đầu trước đây)
    let fringeTips = false;
    const fringe = (len, sway, z0) => {
      if (c.d && c.d.age >= 60 && len < 0.5) return null; // người già tóc ngắn lộ trán (thấy nếp nhăn)
      const fr = mesh(FRINGE_GEO(), hm, head, 0, cy + hr * 0.04, -hr * (z0 || 0.02));
      fr.scale.set(hr * 1.0, hr * (1.04 + len * 0.1), hr * 1.07); fr.rotation.set(-0.1 - len * 0.18, sway, sway * 0.4);
      // ngọn mái: đặt trên mép trước của lớp tóc ôm đầu (ngang lông mày)
      if (!fringeTips) { fringeTips = true; hairTips(cap, hm, PI * 0.54, PI / 2 - 0.95, PI / 2 + 0.95, 9, 0.12, 0.09 + len * 0.07, 0.3); }
      return fr;
    };
    if (style === 'short' || style === 'curly' || style === 'spiky') fringe(0.2, -0.25);
    if (style === 'sidepart') { fringe(0.4, -0.45); const sw = ell(hm, head, hr * 0.5, hr * 0.26, hr * 0.62, hr * 0.32, cy + hr * 0.82, hr * 0.18); sw.rotation.z = -0.5; }
    if (style === 'pixie') { fringe(0.65, 0.35); ell(hm, head, hr * 0.3, hr * 0.42, hr * 0.32, -hr * 0.82, cy - hr * 0.08, hr * 0.12, true); ell(hm, head, hr * 0.3, hr * 0.42, hr * 0.32, hr * 0.82, cy - hr * 0.08, hr * 0.12, true); }
    if (longish || style === 'bob' || style === 'ponytail' || style === 'bun' || style === 'twintail') fringe(style === 'bob' || style === 'twintail' ? 0.9 : 0.6, style === 'ponytail' || style === 'bun' ? 0.25 : 0);
    // tóc dài/bob: hai lọn ôm má
    if (longish || style === 'bob') [1, -1].forEach((sd) => { const lk = ell(hm, head, hr * 0.24, hr * (longish ? 0.95 : 0.6), hr * 0.42, sd * hr * 0.84, cy - hr * (longish ? 0.55 : 0.32), hr * 0.18, true); lk.rotation.z = sd * 0.08; });
    if (style === 'wavy') for (let i = 0; i < 9; i++) { const a = PI * 0.15 + (i / 8) * PI * 0.7; ell(hm, head, hr * 0.26, hr * 0.3, hr * 0.26, -C(a) * hr * 0.82, cy - hr * 1.35 + S(i * 2.1) * hr * 0.08, -S(a) * hr * 0.5, true); }
    if (style === 'twintail') [1, -1].forEach((sd) => {
      ell(hm, head, hr * 0.15, hr * 0.15, hr * 0.15, sd * hr * 0.88, cy + hr * 0.35, -hr * 0.3, true);
      const p = pivot(head, sd * hr * 0.95, cy + hr * 0.3, -hr * 0.32); p.rotation.z = sd * 0.35;
      mesh(capsule(hr * 0.17, hr * 0.9), hm, p, 0, -hr * 0.6, 0);
      ell(hm, p, hr * 0.2, hr * 0.22, hr * 0.2, 0, -hr * 1.2, 0, true);
    });
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

  function buildAcc(c, j, acc, hr, cy, d, topC) {
    const gold = mat('#f2b705', { metal: 0.7, rough: 0.3 });
    if (acc === 'cape') {
      // áo choàng: tấm vải cong sau lưng, rủ từ vai xuống bắp chân
      const g = geo('cape', () => { const p = new THREE.PlaneGeometry(1, 1, 6, 8); const pos = p.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, -Math.cos(x * Math.PI) * 0.12 - (0.5 - y) * 0.18); pos.setX(i, x * (1 + (0.5 - y) * 0.45)); } p.computeVertexNormals(); return p; });
      const cape = new THREE.Mesh(g, mat('#c1121f', { side: 1, rough: 0.6 })); cape.castShadow = true;
      cape.scale.set(d.shW * 1.05, d.torso * 1.7, 1); cape.position.set(0, d.torso * 0.5 - d.torso * 0.85, -d.chestR * 0.85); j.chest.add(cape); c.cape = cape;
      mesh(torusG(d.headR * 0.5, d.headR * 0.06, PI * 2), gold, j.chest, 0, d.torso * 0.56, 0, false).rotation.x = PI / 2;
    } else if (acc === 'astro') {
      const glass = mat('#bfe3ff', { opacity: 0.28, rough: 0.05, metal: 0.2 });
      const b = mesh(UNIT_SPHERE(), glass, j.head, 0, cy, 0, false); b.scale.setScalar(hr * 1.55);
      mesh(torusG(hr * 1.05, hr * 0.14, PI * 2), mat('#e6e8ec', { rough: 0.5 }), j.head, 0, cy - hr * 1.15, 0, false).rotation.x = PI / 2;
      mesh(boxG(d.chestR * 1.1, d.torso * 0.35, d.chestR * 0.5), mat('#d9dde3', { rough: 0.6 }), j.chest, 0, d.torso * 0.25, -d.chestR * 0.95);
    } else if (acc === 'crown') {
      const base = mesh(cylG(hr * 0.62, hr * 0.66, hr * 0.26, 20, true), mat('#f2b705', { metal: 0.7, rough: 0.3, side: 1 }), j.head, 0, cy + hr * 1.0, 0); base.rotation.x = -0.1;
      for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; mesh(coneG(hr * 0.1, hr * 0.28, 6), gold, j.head, S(a) * hr * 0.62, cy + hr * 1.24, C(a) * hr * 0.62, false); ell(mat('#e63946', { rough: 0.2, metal: 0.3 }), j.head, hr * 0.06, hr * 0.06, hr * 0.06, S(a) * hr * 0.66, cy + hr * 1.02, C(a) * hr * 0.66, true); }
    } else if (acc === 'halo') {
      const h = mesh(torusG(hr * 0.62, hr * 0.06, PI * 2), mat('#ffe066', { emissive: '#ffd23f', ei: 1.4 }), j.head, 0, cy + hr * 1.5, 0, false); h.rotation.x = PI / 2 - 0.15; c.halo = h;
      [1, -1].forEach((sd) => { const w = ell(mat('#ffffff', { rough: 0.6 }), j.chest, d.chestR * 0.35, d.torso * 0.45, d.chestR * 0.12, sd * d.chestR * 0.75, d.torso * 0.45, -d.chestR * 0.95); w.rotation.z = sd * 0.5; w.rotation.y = sd * 0.4; });
    } else if (acc === 'horns') {
      [1, -1].forEach((sd) => { const h = mesh(coneG(hr * 0.13, hr * 0.42, 10), mat('#b5171d', { rough: 0.35 }), j.head, sd * hr * 0.45, cy + hr * 1.05, hr * 0.1, false); h.rotation.z = -sd * 0.45; });
      const tl = mesh(capsule(hr * 0.05, d.legLen * 0.5), mat('#b5171d', { rough: 0.35 }), j.hips, 0, -d.legLen * 0.15, -d.waistR * 0.9); tl.rotation.x = 0.9;
    } else if (acc === 'shades') {
      const blk = mat('#0b0b0f', { rough: 0.15, metal: 0.4 });
      const er = hr * 0.24, eyeY = cy - hr * 0.04, eyeX = hr * 0.37, eyeZ = hr * 0.84;
      [1, -1].forEach((sd) => { const l = mesh(boxG(er * 2.3, er * 1.5, er * 0.3), blk, j.head, sd * eyeX, eyeY, eyeZ + er * 0.5, false); l.rotation.y = sd * 0.12; });
      mesh(boxG(eyeX * 0.8, er * 0.25, er * 0.25), blk, j.head, 0, eyeY + er * 0.35, eyeZ + er * 0.55, false);
    } else if (acc === 'spikes') {
      const gm = mat('#2f9e44', { rough: 0.6 });
      for (let i = 0; i < 5; i++) { const t = i / 4; mesh(coneG(hr * 0.14, hr * 0.32, 8), gm, j.head, 0, cy + hr * (1.0 - t * 1.2), -hr * (0.2 + t * 0.75), false).rotation.x = -0.6 - t * 0.8; }
      for (let i = 0; i < 4; i++) mesh(coneG(d.chestR * 0.18, d.chestR * 0.4, 8), gm, j.chest, 0, d.torso * (0.5 - i * 0.2), -d.chestR * 0.85, false).rotation.x = -PI / 2;
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
    } else if (hat === 'headphones') {
      const m = mat(U.pick(['#111827', '#f8fafc', '#e11d48', '#2563eb']), { rough: 0.35 });
      const band = mesh(torusG(hr * 1.02, hr * 0.06, PI), m, head, 0, cy + hr * 0.05, 0, false); band.scale.set(1, 1.12, 1);
      [1, -1].forEach((sd) => { const cup = mesh(cylG(hr * 0.26, hr * 0.26, hr * 0.16, 18), m, head, sd * hr * 0.98, cy - hr * 0.08, 0); cup.rotation.z = PI / 2; mesh(cylG(hr * 0.2, hr * 0.2, hr * 0.05, 16), mat('#2b2b2b', { rough: 0.9 }), head, sd * hr * 0.9, cy - hr * 0.08, 0, false).rotation.z = PI / 2; });
    } else if (hat === 'bucket') {
      const col = U.pick(['#e9e3d0', '#1f2937', '#6b8f71', '#c2410c']), m = mat(col, { rough: 0.9 });
      const h = mesh(cylG(hr * 0.9, hr * 1.02, hr * 0.62, 22), m, head, 0, cy + hr * 0.62, -hr * 0.02);
      h.rotation.x = -0.12;
      const br = mesh(cylG(hr * 1.02, hr * 1.5, hr * 0.22, 24, true), mat(U.shadeHex(col, -0.06), { rough: 0.9, side: 1 }), head, 0, cy + hr * 0.24, -hr * 0.02);
      br.rotation.x = -0.12;
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
    neutral: { mouth: 'soft', eye: 1, brow: 0, browY: 0 },
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
      if (this.body) { this.freeSkin(); this.root.remove(this.body); }
      this.body = new THREE.Group(); this.root.add(this.body);
      this.tail = null; this.flaps = [];
      if (this.kind === 'human') {
        this.d = dims(this.age, this.gender, this.app);
        buildHuman(this);
        this.props = buildProps(this);
      } else {
        buildPet(this); this.props = {};
      }
      try { addOutline(this.body); } catch (e) { U.warnOnce('outline', 'outline', e); }
      // bóng tiếp đất mềm dưới chân: giúp nhân vật “đứng” hẳn trên sàn thay vì lơ lửng
      const bw = this.kind === 'human' ? Math.max(0.2, this.d.shW * 0.95) : 0.32 * (this.d.s || 1);
      const blob = new THREE.Mesh(geo('blob', () => new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2)), blobMat());
      blob.scale.set(bw * 1.5, 1, bw * (this.kind === 'human' ? 1.05 : 1.7)); blob.position.y = 0.012; blob.renderOrder = -1; blob.castShadow = false;
      this.body.add(blob); this.blob = blob;
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
      // bóng nảy theo nhịp động tác
      const P = this.props, d = this.d;
      if (P.ball && P.ball.visible) P.ball.position.set(-d.hipW * 0.5, 0.11 * d.ws + d.footH + Math.abs(S(tt * 2.3)) * d.legLen * 0.55, d.shR * 3.2);
      if (P.bball && P.bball.visible) P.bball.position.set(-(d.shW * 0.5 + 0.05), 0.12 * d.ws + Math.abs(C(tt * 3.5)) * d.legLen * 0.72, 0.2 * d.ws);
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
    // giải phóng GPU: khối thân có xương (hình học riêng từng người) + texture xương; hình học dùng chung trong cache thì giữ lại
    freeSkin() {
      if (this.skinned) { this.skinned.forEach((m) => { m.geometry.dispose(); if (m.skeleton && m.skeleton.dispose && m === this.skinned[0]) m.skeleton.dispose(); }); this.skinned = null; }
      if (this.body) this.body.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && o.material.map && o.geometry !== geoCache.get('blob')) o.geometry.dispose(); });
    }
    dispose() { this.freeSkin(); if (this.root.parent) this.root.parent.remove(this.root); this.root.clear(); this.body = null; }
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
