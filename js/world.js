/* Một Kiếp Người — the 3D world orchestrator (KN.World). SPEC §2.3, §4.7 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const THREE = window.THREE;
  const U = KN.util;
  const resolved = () => Promise.resolve();
  const NOOP = {
    init() { return false; }, playScene: resolved, setLocation: resolved, setAmbience() {}, setPlayer() {}, playerAnim: resolved, npcAnim: resolved,
    setExpression() {}, setNPCs() {}, clearNPCs() {}, fx() {}, shot() {}, screenPos() { return { x: 0, y: 0, visible: false }; },
    setQuality() {}, setReducedMotion() {}, setPaused() {}, onFrame() {}, isReady() { return false; }, debug() { return {}; },
  };
  if (!THREE) { KN.World = NOOP; return; }
  const V3 = THREE.Vector3;

  let renderer, scene, camera, container, ro;
  let ready = false, paused = false, quality = 'high', reduced = false;
  let env = null, envId = null, envDecor = null, envTier = null;
  let player = null; // { ch, data, key }
  const npcs = new Map(); // id -> { ch, data, key, slot, anim }
  let fxSys = null, sun, hemi, amb, bgTex, bgCanvas, rain, snow, starPts, cloudGroup, rim = null, envOn = false;
  let timeOfDay = 'day', weather = 'clear', lightningT = 3, flashK = 0, shakeK = 0;
  const frameCbs = [];
  const tweens = [];
  let seq = 0, clockT = 0, lastNow = 0, fps = 60;
  const cam = { pos: new V3(8.5, 7.2, 12.5), target: new V3(0, 1, 0), fromP: new V3(), fromT: new V3(), toP: new V3(8.5, 7.2, 12.5), toT: new V3(0, 1, 0), k: 1, shot: 'wide', orbitA: 0, yawOff: 0, yawVel: 0, lastDrag: -10 };
  const tmpV = new V3(), tmpV2 = new V3(), headV = new V3();
  let lookTargetId = null;

  // ---------- presets ----------
  const TIME = {
    dawn: { top: '#8fa6e8', bottom: '#ffd1b0', w: 0.55, sun: '#ffc79a', sunI: 1.05, hemiSky: '#c6d4ff', hemiGround: '#a07a6a', hemiI: 0.62, sunPos: [6, 5, 7], exp: 1.02 },
    day: { top: null, bottom: null, w: 0, sun: '#fff3df', sunI: 1.65, hemiSky: '#dfeeff', hemiGround: '#b59a7a', hemiI: 0.78, sunPos: [5, 11, 6], exp: 1.05 },
    dusk: { top: '#45508f', bottom: '#ff9d6e', w: 0.75, sun: '#ff9560', sunI: 1.0, hemiSky: '#9aa2e0', hemiGround: '#7a5050', hemiI: 0.55, sunPos: [-7, 4, 6], exp: 1.0 },
    night: { top: '#0a1030', bottom: '#28356a', w: 0.92, sun: '#9fb4ff', sunI: 0.42, hemiSky: '#4a5aa8', hemiGround: '#1d1b2c', hemiI: 0.38, sunPos: [-5, 9, 4], exp: 1.0 },
  };
  const cur = { top: new THREE.Color('#9fd3ff'), bottom: new THREE.Color('#fff1dc'), sun: new THREE.Color('#fff3df'), sunI: 1.65, hemiSky: new THREE.Color('#dfeeff'), hemiGround: new THREE.Color('#b59a7a'), hemiI: 0.78, exp: 1.05, sunPos: new V3(5, 11, 6), grey: 0 };
  const goal = { top: new THREE.Color(), bottom: new THREE.Color(), sun: new THREE.Color(), sunI: 1.65, hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), hemiI: 0.78, exp: 1.05, sunPos: new V3(), grey: 0 };

  function computeGoal() {
    const meta = (env && env.meta) || { sky: ['#9fd3ff', '#fff1dc'] };
    const p = TIME[timeOfDay] || TIME.day;
    goal.top.set(meta.sky[0]); goal.bottom.set(meta.sky[1]);
    if (p.top) { goal.top.lerp(new THREE.Color(p.top), p.w); goal.bottom.lerp(new THREE.Color(p.bottom), p.w); }
    goal.sun.set(p.sun); goal.sunI = p.sunI; goal.hemiSky.set(p.hemiSky); goal.hemiGround.set(p.hemiGround); goal.hemiI = p.hemiI; goal.exp = p.exp;
    goal.sunPos.set(p.sunPos[0], p.sunPos[1], p.sunPos[2]);
    const wg = { clear: 0, cloudy: 0.45, rain: 0.62, storm: 0.8, fog: 0.5, snow: 0.35 }[weather] || 0;
    goal.grey = wg;
    if (wg) {
      const g = new THREE.Color(timeOfDay === 'night' ? '#2a2f44' : '#a9b2bf');
      goal.top.lerp(g, wg); goal.bottom.lerp(g.clone().offsetHSL(0, 0, 0.08), wg * 0.85);
      goal.sunI *= 1 - wg * 0.6; goal.hemiI *= 1 - wg * 0.2;
    }
  }
  function lerpAmbience(k) {
    cur.top.lerp(goal.top, k); cur.bottom.lerp(goal.bottom, k); cur.sun.lerp(goal.sun, k); cur.hemiSky.lerp(goal.hemiSky, k); cur.hemiGround.lerp(goal.hemiGround, k);
    cur.sunI += (goal.sunI - cur.sunI) * k; cur.hemiI += (goal.hemiI - cur.hemiI) * k; cur.exp += (goal.exp - cur.exp) * k; cur.sunPos.lerp(goal.sunPos, k);
    cur.grey += (goal.grey - cur.grey) * k;
  }
  function applyAmbience() {
    sun.color.copy(cur.sun); sun.intensity = cur.sunI + flashK * 3; sun.position.copy(cur.sunPos);
    hemi.color.copy(cur.hemiSky); hemi.groundColor.copy(cur.hemiGround); hemi.intensity = cur.hemiI * (envOn ? 0.62 : 1) + flashK * 1.5;
    if (rim) rim.intensity = (timeOfDay === 'night' ? 0.25 : 0.45) * (1 - cur.grey * 0.5);
    renderer.toneMappingExposure = cur.exp;
    drawSky();
    const night = timeOfDay === 'night' ? 1 : timeOfDay === 'dusk' ? 0.35 : 0;
    if (starPts) starPts.material.opacity = night * (1 - cur.grey);
    if (cloudGroup) { const cm = cloudGroup.children[0].children[0].material; cm.color.copy(cur.bottom).lerp(new THREE.Color('#ffffff'), 0.75 - cur.grey * 0.35 - night * 0.45); cm.opacity = 0.85 - night * 0.45; }
  }
  let skyKey = '';
  function drawSky() {
    const key = cur.top.getHexString() + cur.bottom.getHexString() + Math.round(flashK * 10);
    if (key === skyKey) return; skyKey = key;
    const g = bgCanvas.getContext('2d');
    const top = '#' + cur.top.clone().convertLinearToSRGB().getHexString(), bot = '#' + cur.bottom.clone().convertLinearToSRGB().getHexString();
    const gr = g.createLinearGradient(0, 0, 0, bgCanvas.height);
    gr.addColorStop(0, top); gr.addColorStop(0.62, U.mixHex(top, bot, 0.7)); gr.addColorStop(1, bot);
    g.fillStyle = gr; g.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    if (flashK > 0.05) { g.fillStyle = 'rgba(235,240,255,' + (flashK * 0.6).toFixed(2) + ')'; g.fillRect(0, 0, bgCanvas.width, bgCanvas.height); }
    bgTex.needsUpdate = true;
    scene.fog.color.copy(cur.bottom).lerp(cur.top, 0.25);
  }

  // ---------- setup ----------
  function init(el) {
    if (ready) { if (el && el !== container) { container = el; el.appendChild(renderer.domElement); resize(); ro && ro.observe(el); } return true; }
    container = el;
    try {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
    } catch (e) { console.warn('[KN.World] WebGL unavailable', e); Object.assign(KN.World, NOOP); return false; }
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    quality = coarse || Math.min(window.innerWidth, window.innerHeight) < 520 ? 'low' : 'high';
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(dprFor());
    const cv = renderer.domElement;
    cv.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;outline:none';
    el.appendChild(cv);

    scene = new THREE.Scene();
    bgCanvas = document.createElement('canvas'); bgCanvas.width = 4; bgCanvas.height = 256;
    bgTex = new THREE.CanvasTexture(bgCanvas); bgTex.encoding = THREE.sRGBEncoding;
    scene.background = bgTex;
    scene.fog = new THREE.Fog('#dfe9f5', 26, 70);
    camera = new THREE.PerspectiveCamera(35, 1.6, 0.1, 200);

    hemi = new THREE.HemisphereLight('#dfeeff', '#b59a7a', 0.78); scene.add(hemi);
    amb = new THREE.AmbientLight('#ffffff', 0.12); scene.add(amb);
    sun = new THREE.DirectionalLight('#fff3df', 1.65);
    sun.position.set(5, 11, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024);
    const sc = sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 0.5; sc.far = 40;
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
    scene.add(sun); scene.add(sun.target);
    // ánh sáng viền từ phía sau: tách nhân vật khỏi nền cho nổi khối
    rim = new THREE.DirectionalLight('#cfe3ff', 0.45); rim.position.set(-6, 5, -8); scene.add(rim);
    buildEnvLight();
    try { post = buildPost(); } catch (e) { console.warn('[KN.World] post init failed', e); post = null; }

    buildSkyDecor();
    buildWeather();
    try { fxSys = KN.FX ? KN.FX.create(scene, camera) : null; } catch (e) { console.warn('[KN.World] FX init failed', e); }

    computeGoal(); lerpAmbience(1); applyAmbience();
    // pointer drag → orbit a little
    let dragX = null;
    cv.addEventListener('pointerdown', (e) => { dragX = e.clientX; });
    window.addEventListener('pointerup', () => { dragX = null; });
    cv.addEventListener('pointermove', (e) => {
      if (dragX == null || (e.pointerType === 'mouse' && !(e.buttons & 1))) return;
      const dx = e.clientX - dragX; dragX = e.clientX;
      cam.yawOff = U.clamp(cam.yawOff - dx * 0.006, -1.1, 1.1); cam.lastDrag = clockT;
    });
    ro = new ResizeObserver(resize); ro.observe(el); resize();
    document.addEventListener('visibilitychange', () => { lastNow = performance.now(); });
    ready = true;
    lastNow = performance.now();
    requestAnimationFrame(loop);
    return true;
  }

  // bản đồ môi trường dựng từ một “phòng chụp” nhỏ: trời xanh, đất ấm, hai softbox — cho ánh sáng dịu và phản chiếu nhẹ
  function buildEnvLight() {
    try {
      const pm = new THREE.PMREMGenerator(renderer), s = new THREE.Scene();
      const sky = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
        uniforms: { top: { value: new THREE.Color('#9fc4ec') }, mid: { value: new THREE.Color('#e9e4da') }, bot: { value: new THREE.Color('#8a7660') } },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.7, h)) : mix(mid, bot, smoothstep(0.0, 0.4, -h)); gl_FragColor = vec4(c * 0.55, 1.0); }' });
      s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), sky));
      [[6, 7, 5, 3.2, '#fff6e6'], [-7, 4, 3, 2.4, '#e6f0ff']].forEach(([x, y, z, k, c]) => {
        const m = new THREE.MeshBasicMaterial({ color: c }); m.color.multiplyScalar(k);
        const p = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), m); p.position.set(x, y, z); p.lookAt(0, 0, 0); s.add(p);
      });
      const rt = pm.fromScene(s, 0.04); scene.environment = rt.texture; pm.dispose(); envOn = true;
    } catch (e) { console.warn('[KN.World] env light failed', e); }
  }
  function buildSkyDecor() {
    // stars
    const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, e = U.rand(0.12, 1.2), r = 80; pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starPts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 0.6, sizeAttenuation: true, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    scene.add(starPts);
    // clouds
    cloudGroup = new THREE.Group(); scene.add(cloudGroup);
    const geo = new THREE.SphereGeometry(1, 18, 12);
    for (let i = 0; i < 7; i++) {
      const c = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.88, fog: false, depthWrite: false });
      for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(geo, k ? m : m); b.position.set(k * 1.1 - 1.6, Math.sin(k * 2.1) * 0.3, Math.cos(k * 1.3) * 0.4); b.scale.setScalar(U.rand(0.8, 1.4)); c.add(b); }
      const a = Math.PI * 1.08 + (i / 6) * Math.PI * 0.84, r = U.rand(26, 34);
      c.position.set(Math.cos(a) * r, U.rand(3, 11), Math.sin(a) * r - 4); c.scale.setScalar(U.rand(1.4, 2.4)); c.userData.a = a; c.userData.a0 = a; c.userData.r = r; c.userData.sp = U.rand(0.03, 0.07);
      cloudGroup.add(c);
    }
  }
  function buildWeather() {
    const n = 900, p = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) { const x = U.rand(-8, 8), y = U.rand(0, 14), z = U.rand(-8, 8); p.set([x, y, z, x - 0.04, y - 0.38, z], i * 6); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#b8cde6', transparent: true, opacity: 0.55, depthWrite: false }));
    rain.visible = false; rain.frustumCulled = false; scene.add(rain);
    const sn = 500, sp = new Float32Array(sn * 3);
    for (let i = 0; i < sn; i++) sp.set([U.rand(-8, 8), U.rand(0, 14), U.rand(-8, 8)], i * 3);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const cv = document.createElement('canvas'); cv.width = cv.height = 32; const c2 = cv.getContext('2d');
    const rg = c2.createRadialGradient(16, 16, 0, 16, 16, 16); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); c2.fillStyle = rg; c2.fillRect(0, 0, 32, 32);
    const st = new THREE.CanvasTexture(cv);
    snow = new THREE.Points(sg, new THREE.PointsMaterial({ map: st, size: 0.16, transparent: true, depthWrite: false, color: '#ffffff' }));
    snow.visible = false; snow.frustumCulled = false; scene.add(snow);
  }
  function updateWeather(dt) {
    if (rain.visible) {
      const a = rain.geometry.attributes.position, arr = a.array, sp = (weather === 'storm' ? 17 : 11) * dt, slant = weather === 'storm' ? 0.12 : 0.04;
      for (let i = 0; i < arr.length; i += 6) {
        arr[i + 1] -= sp; arr[i + 4] -= sp; arr[i] -= slant * sp * 0.3; arr[i + 3] -= slant * sp * 0.3;
        if (arr[i + 4] < -0.6) { const x = U.rand(-8, 8), z = U.rand(-8, 8), y = U.rand(12, 15); arr[i] = x; arr[i + 1] = y; arr[i + 2] = z; arr[i + 3] = x - 0.04 - slant; arr[i + 4] = y - 0.38; arr[i + 5] = z; }
      }
      a.needsUpdate = true;
    }
    if (snow.visible) {
      const a = snow.geometry.attributes.position, arr = a.array;
      for (let i = 0; i < arr.length; i += 3) { arr[i + 1] -= dt * 0.9; arr[i] += Math.sin(clockT + i) * dt * 0.2; if (arr[i + 1] < 0) arr[i + 1] = 14; }
      a.needsUpdate = true;
    }
    if (weather === 'storm') {
      lightningT -= dt;
      if (lightningT <= 0) { flashK = 1; lightningT = U.rand(2.5, 7); if (KN.Audio && Math.random() < 0.5) try { KN.Audio.sfx('whoosh'); } catch (e) { /* */ } }
    }
    if (flashK > 0) { flashK = Math.max(0, flashK - dt * (flashK > 0.5 ? 6 : 2.5)); }
  }

  function resize() {
    if (!renderer || !container) return;
    const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    computeShot(cam.shot, true);
    if (post) sizePost();
  }

  // ---------- hậu kỳ điện ảnh: HDR → bloom (vầng sáng) → chỉnh màu, tương phản, vignette, hạt phim ----------
  // Dựng tay (không cần thư viện ngoài): cảnh vẽ vào một render target HDR có khử răng cưa MSAA,
  // vùng sáng được tách, làm mờ ở độ phân giải thấp rồi cộng lại; tone mapping ACES thực hiện ở pass cuối.
  let post = null, postOn = true;
  // máy yếu đã từng bị tự hạ cấp thì nhớ lại cho lần sau (0 = đủ, 1 = tắt hậu kỳ, 2 = tắt hậu kỳ + giảm độ phân giải)
  let perfTier = 0;
  try { perfTier = +localStorage.getItem('kn_perf_tier') || 0; } catch (e) { /* */ }
  if (perfTier >= 1) postOn = false;
  // độ phân giải: hậu kỳ (HDR + MSAA) rất tốn trên màn hình nét cao → giới hạn 1.25x; máy yếu về 1x
  function dprFor() {
    const dpr = window.devicePixelRatio || 1;
    if (perfTier >= 2 || quality !== 'high') return Math.min(dpr, perfTier >= 2 ? 1 : 1.25);
    return Math.min(dpr, postOn ? 1.25 : 1.75);
  }
  // tự hạ chất lượng khi khung hình tụt kéo dài (bỏ qua lúc tab ẩn / vừa chuyển cảnh nặng)
  const perf = { slow: 0, t: 0 };
  function perfWatch(dt) {
    if (document.hidden || dt <= 0 || dt >= 0.05) return; // dt bị chặn ở 0.05 → khung giật đơn lẻ (dựng cảnh) không tính
    perf.t += dt;
    if (dt > 1 / 38) perf.slow += dt; else perf.slow = Math.max(0, perf.slow - dt * 0.5);
    if (perf.slow > 2.5 && perfTier < 2) {
      perfTier++; perf.slow = 0;
      if (perfTier >= 1) postOn = false;
      try { localStorage.setItem('kn_perf_tier', String(perfTier)); } catch (e) { /* */ }
      renderer.setPixelRatio(dprFor()); resize();
      if (perfTier >= 2) { sun.shadow.mapSize.set(1024, 1024); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
      console.info('[KN.World] máy hơi yếu → tự giảm đồ hoạ, mức', perfTier);
    }
  }
  const FS_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  function buildPost() {
    if (!renderer.capabilities.isWebGL2) return null;
    const opt = { type: THREE.HalfFloatType, depthBuffer: false };
    const p = {
      scene: new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }),
      a: new THREE.WebGLRenderTarget(4, 4, opt), b: new THREE.WebGLRenderTarget(4, 4, opt),
      c: new THREE.WebGLRenderTarget(4, 4, opt), d: new THREE.WebGLRenderTarget(4, 4, opt),
      cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), sc: new THREE.Scene(),
      bloom: 0.16, punch: 0, letter: 0, letterTo: 0, shake: 0,
    };
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    p.quad = new THREE.Mesh(tri); p.quad.frustumCulled = false; p.sc.add(p.quad);
    p.bright = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, thr: { value: 1.25 }, knee: { value: 0.5 } }, vertexShader: FS_VERT, depthTest: false, depthWrite: false,
      fragmentShader: 'uniform sampler2D tex; uniform float thr; uniform float knee; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float s = clamp(l - thr + knee, 0.0, 2.0 * knee); s = s * s / (4.0 * knee + 1e-4); float w = max(s, l - thr) / max(l, 1e-4); gl_FragColor = vec4(c * w, 1.0); }' });
    p.blur = new THREE.ShaderMaterial({ uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: FS_VERT, depthTest: false, depthWrite: false,
      fragmentShader: 'uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 c = texture2D(tex, vUv).rgb * 0.227; c += texture2D(tex, vUv + dir * 1.385).rgb * 0.316; c += texture2D(tex, vUv - dir * 1.385).rgb * 0.316; c += texture2D(tex, vUv + dir * 3.231).rgb * 0.07; c += texture2D(tex, vUv - dir * 3.231).rgb * 0.07; gl_FragColor = vec4(c, 1.0); }' });
    p.final = new THREE.ShaderMaterial({
      uniforms: { tex: { value: null }, bl1: { value: null }, bl2: { value: null }, bloom: { value: 0.4 }, exposure: { value: 1 }, sat: { value: 1.12 }, vig: { value: 0.32 }, time: { value: 0 }, letter: { value: 0 }, punch: { value: 0 }, night: { value: 0 }, aspect: { value: 1.6 } },
      vertexShader: FS_VERT, depthTest: false, depthWrite: false,
      fragmentShader: [
        'uniform sampler2D tex; uniform sampler2D bl1; uniform sampler2D bl2; uniform float bloom; uniform float exposure; uniform float sat; uniform float vig; uniform float time; uniform float letter; uniform float punch; uniform float night; uniform float aspect; varying vec2 vUv;',
        // ACES giống hệt bản của three.js để giữ tông màu cũ
        'vec3 knFit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }',
        'vec3 knAces(vec3 color){ const mat3 ACESInputMat = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777)); const mat3 ACESOutputMat = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); color *= exposure / 0.6; color = ACESInputMat * color; color = knFit(color); color = ACESOutputMat * color; return clamp(color, 0.0, 1.0); }',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }',
        'void main(){',
        '  vec2 uv = vUv;',
        '  vec3 c = texture2D(tex, uv).rgb;',
        '  vec3 b = texture2D(bl1, uv).rgb * 0.6 + texture2D(bl2, uv).rgb * 0.9;',
        '  c += b * (bloom + punch * 0.5);',
        '  c = knAces(c);',
        '  c = pow(c, vec3(1.0 / 2.2));', // sRGB (xấp xỉ)
        '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
        '  c = mix(vec3(l), c, sat + punch * 0.15);', // độ bão hoà
        '  c = mix(c, c * c * (3.0 - 2.0 * c), 0.22);', // đường cong tương phản nhẹ
        '  c += mix(vec3(-0.012, 0.0, 0.025), vec3(0.03, 0.012, -0.02), smoothstep(0.15, 0.85, l)) * (1.0 - night * 0.5);', // tách tông: bóng xanh mát, sáng ấm
        '  vec2 q = (uv - 0.5) * vec2(aspect, 1.0) / max(aspect, 1.0);',
        '  c *= 1.0 - vig * smoothstep(0.38, 0.95, length(q) * 1.25) - punch * 0.12 * smoothstep(0.2, 0.8, length(q));',
        '  c += (hash(uv * 913.0) - 0.5) * 0.018;', // hạt phim rất nhẹ, chống loang dải màu
        '  float bar = letter * 0.115;', // dải đen điện ảnh cho cảnh kịch tính
        '  if (uv.y < bar || uv.y > 1.0 - bar) c = vec3(0.0);',
        '  gl_FragColor = vec4(c, 1.0);',
        '}'].join('\n'),
    });
    return p;
  }
  function sizePost() {
    const w = renderer.domElement.width, h = renderer.domElement.height;
    post.scene.setSize(w, h);
    const w2 = Math.max(2, w >> 2), h2 = Math.max(2, h >> 2), w3 = Math.max(2, w >> 3), h3 = Math.max(2, h >> 3);
    post.a.setSize(w2, h2); post.b.setSize(w2, h2); post.c.setSize(w3, h3); post.d.setSize(w3, h3);
    post.final.uniforms.aspect.value = w / h;
  }
  function pass(m, target) { post.quad.material = m; renderer.setRenderTarget(target); renderer.render(post.sc, post.cam); }
  function renderFrame(dt) {
    if (!post || !postOn || quality !== 'high') { renderer.render(scene, camera); return; }
    try {
      const p = post, U2 = p.final.uniforms;
      p.letter += (p.letterTo - p.letter) * Math.min(1, (dt || 0.016) * 3);
      p.punch = Math.max(0, p.punch - (dt || 0.016) * 1.6);
      renderer.setRenderTarget(p.scene); renderer.render(scene, camera);
      p.bright.uniforms.tex.value = p.scene.texture; pass(p.bright, p.a);
      p.blur.uniforms.tex.value = p.a.texture; p.blur.uniforms.dir.value.set(1 / p.a.width, 0); pass(p.blur, p.b);
      p.blur.uniforms.tex.value = p.b.texture; p.blur.uniforms.dir.value.set(0, 1 / p.a.height); pass(p.blur, p.a);
      p.blur.uniforms.tex.value = p.a.texture; p.blur.uniforms.dir.value.set(1 / p.c.width, 0); pass(p.blur, p.c);
      p.blur.uniforms.tex.value = p.c.texture; p.blur.uniforms.dir.value.set(0, 1 / p.c.height); pass(p.blur, p.d);
      U2.tex.value = p.scene.texture; U2.bl1.value = p.a.texture; U2.bl2.value = p.d.texture;
      const night = timeOfDay === 'night' ? 1 : timeOfDay === 'dusk' ? 0.5 : 0;
      U2.bloom.value = p.bloom * (1 + night * 2.2); U2.exposure.value = cur.exp; U2.time.value = clockT % 100;
      U2.letter.value = reduced ? 0 : p.letter; U2.punch.value = reduced ? 0 : p.punch; U2.night.value = night;
      pass(p.final, null);
    } catch (e) { console.warn('[KN.World] post disabled', e); postOn = false; renderer.setRenderTarget(null); renderer.render(scene, camera); }
  }

  // ---------- tweens ----------
  function tween(dur, fn, ease) {
    return new Promise((res) => { tweens.push({ t: 0, dur: Math.max(0.001, dur), fn, ease: ease || U.ease.inOutCubic, res }); });
  }
  function updateTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]; tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      try { tw.fn(tw.ease(k), k); } catch (e) { /* */ }
      if (k >= 1) { tweens.splice(i, 1); tw.res(); }
    }
  }

  // ---------- characters ----------
  const appKey = (d) => JSON.stringify(d.appearance || null) + '|' + (d.kind || 'human') + '|' + (d.petColor || '') + '|' + (d.gender || '');
  function makeChar(d) {
    if (!KN.Characters) return null;
    if (d.kind && !['human', 'dog', 'cat'].includes(d.kind)) return null; // vẹt, thỏ, cá… chưa có mô hình 3D: không vẽ trong cảnh
    try {
      const ch = KN.Characters.create({ kind: d.kind || 'human', appearance: d.appearance, age: d.age ?? 25, gender: d.gender, petColor: d.petColor, name: d.name });
      return ch;
    } catch (e) { console.warn('[KN.World] character create failed', e); return null; }
  }
  function setPlayer(pd) {
    if (!ready || !pd) return;
    const key = appKey(pd);
    if (!player || !player.ch) {
      const ch = makeChar(pd); if (!ch) return;
      player = { ch, data: pd, key };
      if (env) { env.group.add(ch.root); const s = playerSpotFor(stage.pAnim); moveTo(ch, s ? s.spot : env.playerSpot, true); }
      return;
    }
    if (player.key !== key) {
      const genderChanged = (player.data.gender || '') !== (pd.gender || '');
      if (genderChanged) { const old = player.ch, ch = makeChar(pd); if (!ch) return; if (old.root.parent) { old.root.parent.add(ch.root); ch.root.position.copy(old.root.position); ch.root.rotation.copy(old.root.rotation); } old.dispose(); player.ch = ch; ch.setAge(pd.age ?? 25); }
      else { player.ch.age = pd.age ?? player.ch.age; player.ch.gender = pd.gender || player.ch.gender; player.ch.setAppearance(pd.appearance); }
      player.key = key;
    } else if (pd.age != null && Math.round(pd.age) !== Math.round(player.ch.age)) player.ch.setAge(pd.age);
    player.data = pd;
  }
  // ---------- staging: where everyone stands ----------
  // Obstacles are measured once per diorama (group-local XZ boxes). NPCs are placed around the
  // player's real position (authored spot, seat or bed), never inside props, facing the player;
  // anyone who has to change place walks there (or poofs when the way is blocked / too far).
  const BOUND = 4.45, BODY_R = 0.26;
  const stage = { pAnim: 'idle', bedNpc: null };
  const isLying = (a) => !!(KN.Characters && KN.Characters.isLying && KN.Characters.isLying(a));
  const isSeated = (a) => !!(KN.Characters && KN.Characters.isSeated && KN.Characters.isSeated(a));
  const angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
  function buildObstacles(group) {
    const list = [];
    group.updateMatrixWorld(true);
    const m4 = new THREE.Matrix4(), bb = new THREE.Box3();
    group.traverse((o) => {
      if (!o.isMesh || !o.visible || o.userData.noCollide) return;
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      if (mat && (mat.blending === THREE.AdditiveBlending || (mat.transparent && mat.opacity < 0.6))) return;
      const g = o.geometry; if (!g) return;
      if (!g.boundingBox) g.computeBoundingBox();
      const add = (b) => {
        const sx = b.max.x - b.min.x, sz = b.max.z - b.min.z, sy = b.max.y - b.min.y;
        if ((b.max.y < 0.15 && sy < 0.12) || b.min.y > 1.85 || b.max.y < 0.08 || sx * sz > 30) return;
        list.push({ x0: b.min.x, x1: b.max.x, z0: b.min.z, z1: b.max.z, y1: b.max.y });
      };
      if (o.isInstancedMesh) { for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); m4.premultiply(o.matrixWorld); add(bb.copy(g.boundingBox).applyMatrix4(m4)); } }
      else add(bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld));
    });
    return list;
  }
  function blocked(x, z, r) {
    if (Math.abs(x) > BOUND || Math.abs(z) > BOUND) return true;
    const obs = env && env.obs; if (!obs) return false;
    for (let i = 0; i < obs.length; i++) { const o = obs[i]; if (x > o.x0 - r && x < o.x1 + r && z > o.z0 - r && z < o.z1 + r) return true; }
    return false;
  }
  function pathBlocked(from, to) {
    const d = Math.hypot(to.x - from.x, to.z - from.z), steps = Math.max(1, Math.floor(d / 0.3));
    for (let i = 1; i < steps; i++) {
      const t = i / steps, along = t * d;
      if (along < 0.5 || d - along < 0.5) continue;
      if (blocked(from.x + (to.x - from.x) * t, from.z + (to.z - from.z) * t, 0.16)) return true;
    }
    return false;
  }
  const ringPoint = (c, ang, r) => [c[0] + Math.sin(ang) * r, c[2] + Math.cos(ang) * r];
  // would a head at (x,z) be hidden from the wide camera by a prop or by someone standing closer?
  function hiddenFromCam(x, z, others) {
    // judged from a conservative camera: the wide shot's direction, but close-shot distance & height
    const w = (env.camera && env.camera.wide && env.camera.wide.pos) || [7, 5.9, 10.3];
    const dx = w[0] - x, dz = w[2] - z, d = Math.min(Math.hypot(dx, dz), 6.5), n = Math.hypot(dx, dz) || 1, y0 = 1.25, cy = Math.min(w[1], 2.7);
    for (let t = 0.45; t < d; t += 0.25) {
      const px = x + dx / n * t, pz = z + dz / n * t, ly = y0 + (cy - y0) * (t / d);
      const obs = env.obs || [];
      for (let i = 0; i < obs.length; i++) { const o = obs[i]; if (px > o.x0 && px < o.x1 && pz > o.z0 && pz < o.z1 && o.y1 > ly) return true; }
      for (let i = 0; i < others.length; i++) { const o = others[i]; if (Math.hypot(px - o[0], pz - o[1]) < 0.28 && o[2] > ly) return true; }
    }
    return false;
  }
  // is there a prop (curtain, shelf, wall…) between a standing spot and the focus? The furniture the
  // focus itself sits/lies on (bed, sofa) does not count: march out of it first.
  function sightBlocked(x, z, fc) {
    const dx = fc[0] - x, dz = fc[2] - z, d = Math.hypot(dx, dz);
    if (d < 0.8) return false;
    let inner = 0.3;
    while (inner < d - 0.3 && blocked(fc[0] - dx / d * inner, fc[2] - dz / d * inner, 0.04)) inner += 0.1;
    const end = d - Math.max(0.45, inner + 0.1);
    for (let t = 0.35; t < end; t += 0.22) if (blocked(x + dx / d * t, z + dz / d * t, 0.06)) return true;
    return false;
  }
  function camAz(c) { const w = (env && env.camera && env.camera.wide && env.camera.wide.pos) || [7, 5.9, 10.3]; return Math.atan2(w[0] - c[0], w[2] - c[2]); }
  // the first human NPC that lies down takes the bed (newborn, sick relative…) unless the player uses it
  function updateStage(list) {
    const A = (env && env.anchors) || {};
    const b = A.bed && !isLying(stage.pAnim) ? (list || []).find((d) => d && (d.kind || 'human') === 'human' && isLying(d.anim)) : null;
    stage.bedNpc = b ? b.id : null;
  }
  // stage "cheat": face the focus but open up a little toward the camera so faces read
  function cheatOut(x, z, fc) {
    const f = Math.atan2(fc[0] - x, fc[2] - z), w = (env.camera && env.camera.wide && env.camera.wide.pos) || [7, 5.9, 10.3];
    return f + angDiff(f, Math.atan2(w[0] - x, w[2] - z)) * 0.28;
  }
  function besideBed() {
    const b = env.anchors.bed, c = b.pos, az = camAz(c);
    const v = (b.visitors || []).find(([x, z]) => !blocked(x, z, 0.2));
    if (v) return { pos: [v[0], 0, v[1]], rotY: cheatOut(v[0], v[1], c) };
    for (const r of [1.3, 1.6, 1.95]) for (const a of [0.8, -0.8, 1.15, -1.15, 0.6, -0.6]) {
      const [x, z] = ringPoint(c, az + a, r);
      if (!blocked(x, z, BODY_R) && !sightBlocked(x, z, c)) return { pos: [x, 0, z], rotY: cheatOut(x, z, c) };
    }
    return env.playerSpot;
  }
  function playerSpotFor(anim) {
    if (!env) return null;
    const A = env.anchors || {};
    if (isLying(anim) && A.bed) return { spot: A.bed, noStool: false };
    if (isSeated(anim) && A.seat) return { spot: A.seat, noStool: true };
    if (stage.bedNpc && A.bed) return { spot: besideBed(), noStool: false };
    return { spot: env.playerSpot, noStool: false };
  }
  function footprint(spot, anim) {
    const p = spot.pos, ry = spot.rotY || 0, pts = [[p[0], p[2]]];
    if (isLying(anim)) [-0.9, -0.45, 0.45, 0.9].forEach((t) => pts.push([p[0] + Math.cos(ry) * t, p[2] - Math.sin(ry) * t]));
    else if (isSeated(anim)) pts.push([p[0] + Math.sin(ry) * 0.45, p[2] + Math.cos(ry) * 0.45]);
    else if (anim === 'drive') [-0.8, 0.8].forEach((t) => pts.push([p[0] + Math.sin(ry) * t, p[2] + Math.cos(ry) * t]));
    return pts;
  }
  // one slot per NPC around the focus (the player, or the bed when an NPC lies in it)
  function slotsFor(list, pSpot) {
    const out = [];
    if (!env || !list.length) return out;
    const A = env.anchors || {};
    const bedFocus = !!(stage.bedNpc && A.bed);
    const focus = bedFocus ? A.bed : pSpot, fc = focus.pos;
    const avoid = footprint(pSpot, stage.pAnim);
    if (bedFocus) avoid.push(...footprint(A.bed, 'sleep'));
    const face = (x, z) => cheatOut(x, z, fc);
    const taken = () => out.filter(Boolean);
    const az = camAz(fc), gen = [];
    // never stand in the camera's line of sight to the focus (within ±30° on the camera side)
    const inSight = (x, z) => Math.abs(angDiff(Math.atan2(x - fc[0], z - fc[2]), az)) < 0.52;
    const ok = (x, z, r, hand) => !blocked(x, z, r) && (hand || !inSight(x, z)) && avoid.every(([ax, az2]) => Math.hypot(x - ax, z - az2) >= 0.7) && taken().every((s) => Math.hypot(x - s.pos[0], z - s.pos[2]) >= 0.78) && !sightBlocked(x, z, fc);
    // around a bed, use the diorama's hand-placed visitor spots; otherwise authored spots near the focus
    const authored = focus === A.bed && A.bed.visitors ? A.bed.visitors.map(([x, z]) => ({ pos: [x, 0, z], rotY: cheatOut(x, z, fc) }))
      : env.npcSpots.filter((s) => Math.hypot(s.pos[0] - fc[0], s.pos[2] - fc[2]) <= 2.7);
    const useAuthoredRot = focus === env.playerSpot;
    for (const r of [1.2, 1.5, 1.85, 2.25, 2.7]) for (const a of [55, -55, 80, -80, 105, -105, 38, -38, 130, -130, 155, -155]) gen.push([r, a * Math.PI / 180]);
    list.forEach((d, i) => {
      if (bedFocus && stage.bedNpc === d.id) { out[i] = { pos: A.bed.pos.slice(), rotY: A.bed.rotY || 0, bed: true }; return; }
      const seated = isSeated(d.anim), r0 = d.kind && d.kind !== 'human' ? 0.2 : BODY_R;
      const fits = (x, z, ry, hand) => ok(x, z, r0, hand) && (!seated || !blocked(x + Math.sin(ry) * 0.45, z + Math.cos(ry) * 0.45, 0.15));
      // nobody may hide the player (or anyone placed earlier) from the camera, nor be hidden themselves
      const others = [[pSpot.pos[0], pSpot.pos[2], isLying(stage.pAnim) ? 0.9 : 1.6]].concat(taken().map((o) => [o.pos[0], o.pos[2], o.bed ? 0.9 : 1.5]));
      const tall = d.kind && d.kind !== 'human' ? 0.6 : 1.6;
      const covers = (x, z) => others.some(([ox, oz, oh]) => oh > 1 && hiddenFromCam(ox, oz, [[x, z, tall]]));
      for (const needVis of [true, false]) {
        const vis = (x, z) => !needVis || (!hiddenFromCam(x, z, others) && !covers(x, z));
        const s = authored.find((sp) => !taken().some((o) => o.src === sp) && fits(sp.pos[0], sp.pos[2], useAuthoredRot ? sp.rotY || 0 : face(sp.pos[0], sp.pos[2]), true) && vis(sp.pos[0], sp.pos[2]));
        if (s) { out[i] = { pos: [s.pos[0], s.pos[1] || 0, s.pos[2]], rotY: useAuthoredRot ? s.rotY || 0 : face(s.pos[0], s.pos[2]), src: s }; return; }
        for (const [r, a] of gen) {
          const [x, z] = ringPoint(fc, az + a, r), ry = face(x, z);
          if (fits(x, z, ry) && vis(x, z)) { out[i] = { pos: [x, 0, z], rotY: ry }; return; }
        }
      }
      for (let k = 0; k < 80; k++) { const x = U.rand(-3.9, 3.9), z = U.rand(-3.6, 3.9), ry = face(x, z); if (fits(x, z, ry)) { out[i] = { pos: [x, 0, z], rotY: ry }; return; } }
      out[i] = env.npcSpots[i % env.npcSpots.length];
    });
    return out;
  }
  // move a character to a spot: tiny moves slide, real moves walk, blocked/long ones poof.
  // `after` runs on arrival (used to start the destination anim, e.g. sitting down).
  function moveTo(ch, spot, instant, after, maxWalk) {
    if (!ch || !spot) return resolved();
    const p = spot.pos || [0, 0, 0.8], to = new V3(p[0], p[1] || 0, p[2]), tr = spot.rotY || 0;
    const tok = (ch._mv = (ch._mv || 0) + 1), live = () => ch._mv === tok;
    ch.walking = false;
    if (instant) { ch.root.position.copy(to); ch.root.rotation.y = tr; if (after) after(); return resolved(); }
    ch.root.scale.setScalar(1);
    const from = ch.root.position.clone(), fr = ch.root.rotation.y;
    const d = Math.hypot(to.x - from.x, to.z - from.z);
    if (d < 0.03 && Math.abs(to.y - from.y) < 0.03) {
      if (Math.abs(angDiff(fr, tr)) > 0.02) tween(0.3, (k) => { if (live()) ch.root.rotation.y = fr + angDiff(fr, tr) * k; });
      if (after) after(); return resolved();
    }
    if (d < 0.65 || reduced) {
      if (after) after();
      return tween(reduced ? 0.01 : 0.4, (k) => { if (!live()) return; ch.root.position.lerpVectors(from, to, k); ch.root.rotation.y = fr + angDiff(fr, tr) * k; });
    }
    if (d > (maxWalk || 3.6) || pathBlocked(from, to)) {
      return tween(0.18, (k) => { if (live()) ch.root.scale.setScalar(Math.max(0.001, 1 - k)); }, U.ease.inCubic).then(() => {
        if (!live()) return;
        ch.root.position.copy(to); ch.root.rotation.y = tr; if (after) after(); fxAt('dust', ch, true);
        return tween(0.32, (k) => { if (live()) ch.root.scale.setScalar(Math.max(0.001, k)); }, U.ease.outBack);
      });
    }
    const hd = Math.atan2(to.x - from.x, to.z - from.z), dur = U.clamp(d / 2.3, 0.45, 2.0);
    ch.walking = true; ch.play('walk');
    return tween(0.14, (k) => { if (live()) ch.root.rotation.y = fr + angDiff(fr, hd) * k; })
      .then(() => tween(dur, (k) => { if (live()) { ch.root.position.lerpVectors(from, to, k); ch.root.rotation.y = hd; } }, U.ease.linear))
      .then(() => {
        if (!live()) return;
        ch.walking = false; if (after) after();
        return tween(0.25, (k) => { if (live()) ch.root.rotation.y = hd + angDiff(hd, tr) * k; });
      });
  }
  function popIn(ch) {
    ch.root.scale.setScalar(0.001);
    tween(0.45, (k) => ch.root.scale.setScalar(Math.max(0.001, k)), U.ease.outBack);
    fxAt('dust', ch, true);
  }
  function playPlayer(anim, opts, instant) {
    if (!player || !player.ch) return resolved();
    anim = anim || 'idle'; stage.pAnim = anim;
    const s = playerSpotFor(anim);
    const play = () => player.ch.play(anim, Object.assign({ noStool: s ? s.noStool : false }, opts || {}));
    if (s && env && player.ch.root.parent === env.group) return moveTo(player.ch, s.spot, instant, play);
    return play();
  }
  function removeNpc(id, instant) {
    const n = npcs.get(id); if (!n) return;
    npcs.delete(id);
    if (instant || !n.ch.root.parent) { n.ch.dispose(); return; }
    const s0 = n.ch.root.scale.x;
    tween(0.3, (k) => n.ch.root.scale.setScalar(Math.max(0.001, s0 * (1 - k))), U.ease.inCubic).then(() => n.ch.dispose());
  }
  function updateNpcData(n, d) {
    const key = appKey(d);
    if (key !== n.key) { if ((n.data.kind || 'human') !== (d.kind || 'human')) { const old = n.ch; n.ch = makeChar(d) || old; if (n.ch !== old) { if (old.root.parent) old.root.parent.add(n.ch.root); n.ch.root.position.copy(old.root.position); old.dispose(); } } else { n.ch.age = d.age ?? n.ch.age; n.ch.setAppearance(d.appearance); } n.key = key; }
    if (d.age != null && Math.round(d.age) !== Math.round(n.ch.age)) n.ch.setAge(d.age);
    n.data = d;
  }
  // new NPC in the same location: walks in from the open front edge, or pops in if the way is blocked
  function walkIn(n, spot) {
    const ch = n.ch, p = spot.pos;
    const start = new V3(U.clamp(p[0] + (p[0] >= 0 ? 1.1 : -1.1), -4.2, 4.2), 0, 4.35), end = new V3(p[0], p[1] || 0, p[2]);
    if (spot.bed || pathBlocked(start, end) || blocked(start.x, start.z, 0.2)) { moveTo(ch, spot, true); ch.play(n.data.anim || 'idle'); popIn(ch); return resolved(); }
    ch.root.position.copy(start); ch.root.rotation.y = Math.atan2(end.x - start.x, end.z - start.z);
    n.entering = true;
    return moveTo(ch, spot, false, () => { n.entering = false; if (npcs.get(n.data.id) === n) ch.play(n.data.anim || 'idle'); }, 8);
  }
  // mode: 'walk' (same location) | 'place' (inside a new diorama) | 'pop'. Returns movement promises.
  function syncNPCs(list, mode) {
    list = (list || []).filter((d) => d && d.id).slice(0, 4);
    const keep = new Set(list.map((d) => d.id));
    Array.from(npcs.keys()).forEach((id) => { if (!keep.has(id)) removeNpc(id, mode === 'place'); });
    if (!env) return [];
    updateStage(list);
    const pSpot = (playerSpotFor(stage.pAnim) || {}).spot || env.playerSpot;
    const slots = slotsFor(list, pSpot);
    const moves = [];
    list.forEach((d, i) => {
      const spot = slots[i];
      let n = npcs.get(d.id);
      if (n) {
        updateNpcData(n, d);
        if (n.ch.root.parent !== env.group) env.group.add(n.ch.root);
        n.entering = false;
        const me = n;
        moves.push(moveTo(n.ch, spot, mode === 'place', () => { if (npcs.get(d.id) === me) me.ch.play(me.data.anim || 'idle'); }));
      } else {
        const ch = makeChar(d); if (!ch) return;
        n = { ch, data: d, key: appKey(d), slot: i };
        npcs.set(d.id, n);
        env.group.add(ch.root);
        if (mode === 'walk' && !reduced) moves.push(walkIn(n, spot));
        else { moveTo(ch, spot, true); ch.play(d.anim || 'idle'); if (mode !== 'place') popIn(ch); }
      }
      n.slot = i;
      n.ch.setExpression(d.expr || null);
    });
    updateLookTargets();
    return moves;
  }
  function updateLookTargets() {
    lookTargetId = null;
    const list = Array.from(npcs.entries());
    const speaker = list.find(([, n]) => n.data.say) || list.find(([, n]) => n.data.anim === 'talk');
    if (speaker) lookTargetId = speaker[0];
  }
  const NO_LOOK = new Set(['sleep', 'dead', 'crawl', 'study', 'type', 'phone', 'pray', 'cry', 'facepalm', 'swim', 'drive', 'lift', 'cook', 'eat', 'bow', 'sad']);
  function updateLooks() {
    if (!player || !player.ch) return;
    const pch = player.ch;
    const pAnim = pch.anim;
    pch.getHeadWorldPosition(headV);
    npcs.forEach((n) => {
      if (n.entering || n.ch.walking || NO_LOOK.has(n.ch.anim) || n.ch.kind !== 'human') { n.ch.lookAt(null); return; }
      n.ch.lookAt(headV);
    });
    if (NO_LOOK.has(pAnim)) { pch.lookAt(null); return; }
    const t = lookTargetId && npcs.get(lookTargetId);
    if (t && !t.entering) { t.ch.getHeadWorldPosition(tmpV2); pch.lookAt(tmpV2); }
    else { pch.lookAt(camera.position); }
  }

  // ---------- fx ----------
  function charById(id) {
    if (!id || id === 'player') return player && player.ch;
    const n = npcs.get(id); return n && n.ch;
  }
  function fxAt(name, ch, feet) {
    if (!fxSys || !ch) return;
    const p = new V3();
    if (feet || name === 'dust') { ch.root.getWorldPosition(p); p.y += 0.02; }
    else ch.getHeadWorldPosition(p);
    if (name === 'confetti' || name === 'fireworks' || name === 'petals') { p.y = Math.max(p.y, 1.6); }
    fxSys.spawn(name, p);
    // khoảnh khắc mạnh: loé sáng + rung máy (vui: bừng màu; sốc: rung)
    const PUNCH = { confetti: 0.8, fireworks: 1, stars: 0.5, flash: 1, exclaim: 0.4, hearts: 0.4 }, SHAKE = { flash: 0.9, exclaim: 0.35, anger: 0.4 };
    if (post && PUNCH[name]) post.punch = Math.max(post.punch, PUNCH[name]);
    if (SHAKE[name]) shakeK = Math.max(shakeK, SHAKE[name]);
  }

  // ---------- locations ----------
  async function setLocation(id, opts, npcList) {
    if (!ready || !KN.Env) return;
    opts = opts || {};
    const decor = opts.decor || null;
    const tier = id === 'home' ? (opts.tier || null) : null; // mức nhà theo tài sản (chỉ cảnh “Nhà”)
    if (env && id === envId && decor === envDecor && tier === envTier) return;
    let next;
    try { next = KN.Env.build(id, { decor, tier }); } catch (e) { console.warn('[KN.World] env build failed', e); }
    if (!next) return;
    const old = env;
    try { next.obs = buildObstacles(next.group); } catch (e) { next.obs = []; }
    env = next; envId = next.id; envDecor = decor; envTier = tier;
    env.setTime(timeOfDay);
    scene.add(env.group);
    // move characters into the new diorama — straight to where this scene needs them (no sliding while it rises)
    const list = npcList || Array.from(npcs.values()).map((n) => n.data);
    updateStage(list);
    if (player && player.ch) { env.group.add(player.ch.root); const s = playerSpotFor(stage.pAnim); moveTo(player.ch, s ? s.spot : env.playerSpot, true); }
    if (npcList) syncNPCs(npcList, 'place');
    else { const slots = slotsFor(list, (playerSpotFor(stage.pAnim) || {}).spot || env.playerSpot); Array.from(npcs.values()).forEach((n, i) => { env.group.add(n.ch.root); moveTo(n.ch, slots[i], true); }); }
    computeGoal();
    if (fxSys) fxSys.clear();
    const instant = opts.instant || reduced || !old;
    if (old) {
      const og = old.group;
      if (instant) { old.dispose(); }
      else tween(0.42, (k) => { og.position.y = -k * 3.2; og.scale.setScalar(1 - k * 0.18); }, U.ease.inCubic).then(() => old.dispose());
    }
    if (instant) { env.group.position.y = 0; env.group.scale.setScalar(1); return; }
    env.group.position.y = -5; env.group.scale.setScalar(0.88);
    const g = env.group;
    await U.sleep(200);
    await tween(0.78, (k) => { g.position.y = -5 * (1 - k); g.scale.setScalar(0.88 + 0.12 * k); }, U.ease.outBack);
  }

  function setAmbience(a) {
    if (!a) return;
    const t = TIME[a.time] ? a.time : timeOfDay, w = a.weather || weather;
    if (t === timeOfDay && w === weather) return;
    timeOfDay = t; weather = w;
    if (env) env.setTime(timeOfDay);
    rain.visible = weather === 'rain' || weather === 'storm';
    snow.visible = weather === 'snow';
    scene.fog.near = weather === 'fog' ? 9 : 26; scene.fog.far = weather === 'fog' ? 32 : 70;
    computeGoal();
  }

  // ---------- camera ----------
  function computeShot(name, instantRefresh) {
    if (!env) { cam.toP.set(8.5, 7.2, 12.5); cam.toT.set(0, 1, 0); return; }
    if (name === 'custom' && cam.custom) { cam.toP.fromArray(cam.custom[0]); cam.toT.fromArray(cam.custom[1]); return; }
    const S = env.camera[name] || env.camera.wide;
    const sp = new V3().fromArray(S.pos), st = new V3().fromArray(S.target);
    if ((name === 'close' || name === 'low' || name === 'dramatic') && player && player.ch) {
      const pp = player.ch.root.position, h = Math.max(0.5, player.ch.height);
      const scale = U.clamp(h / 1.65, 0.55, 1.1);
      const dir = sp.clone().sub(st).multiplyScalar(0.75 + scale * 0.25);
      st.set(pp.x, pp.y + h * 0.72, pp.z);
      if (npcs.size && name === 'close') { let cx = 0, cz = 0, c = 0; npcs.forEach((n) => { cx += n.ch.root.position.x; cz += n.ch.root.position.z; c++; }); st.x = U.lerp(st.x, cx / c, 0.3); st.z = U.lerp(st.z, cz / c, 0.3); dir.multiplyScalar(1.25); }
      sp.copy(st).add(dir);
    }
    if (name === 'orbit') { sp.fromArray(env.camera.wide.pos); st.fromArray(env.camera.wide.target); }
    const aspect = camera.aspect || 1.6;
    if (aspect < 1.45) { const dir = sp.clone().sub(st); sp.copy(st).add(dir.multiplyScalar(1 + (1.45 - aspect) * 1.05)); }
    sp.y = Math.max(sp.y, 0.45);
    cam.toP.copy(sp); cam.toT.copy(st);
    if (instantRefresh && cam.k >= 1) { cam.pos.copy(sp); cam.target.copy(st); }
  }
  function shot(name) {
    if (!ready) return;
    if (!['wide', 'close', 'low', 'top', 'dramatic', 'orbit'].includes(name)) name = 'wide';
    cam.shot = name;
    if (post) post.letterTo = name === 'dramatic' ? 1 : 0;
    cam.fromP.copy(cam.pos); cam.fromT.copy(cam.target);
    computeShot(name);
    cam.k = 0;
  }
  function updateCamera(dt) {
    if (cam.shot !== 'orbit' || cam.k < 1) computeShot(cam.shot);
    if (cam.k < 1) {
      cam.k = Math.min(1, cam.k + dt / (reduced ? 0.01 : 1.25));
      const e = U.ease.inOutCubic(cam.k);
      cam.pos.lerpVectors(cam.fromP, cam.toP, e); cam.target.lerpVectors(cam.fromT, cam.toT, e);
    } else {
      cam.pos.lerp(cam.toP, Math.min(1, dt * 2)); cam.target.lerp(cam.toT, Math.min(1, dt * 2));
    }
    if (clockT - cam.lastDrag > 2.5) cam.yawOff *= Math.max(0, 1 - dt * 1.2);
    let yaw = cam.yawOff;
    if (cam.shot === 'orbit') { cam.orbitA += dt * 0.12; yaw += cam.orbitA; }
    const off = tmpV.copy(cam.pos).sub(cam.target);
    if (yaw) off.applyAxisAngle(new V3(0, 1, 0), yaw);
    camera.position.copy(cam.target).add(off);
    if (!reduced) { camera.position.x += Math.sin(clockT * 0.31) * 0.12; camera.position.y += Math.sin(clockT * 0.23) * 0.07; }
    // rung máy quay khi có khoảnh khắc mạnh (chớp, pháo hoa, ngã...)
    if (shakeK > 0.001 && !reduced) { camera.position.x += (Math.random() - 0.5) * shakeK * 0.16; camera.position.y += (Math.random() - 0.5) * shakeK * 0.12; shakeK *= Math.max(0, 1 - dt * 4); } else shakeK = 0;
    camera.lookAt(cam.target);
  }

  // ---------- loop ----------
  function loop(now) {
    requestAnimationFrame(loop);
    if (!ready) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000)); lastNow = now;
    if (paused || document.hidden) return;
    step(dt);
    perfWatch(dt); // chỉ đo vòng lặp thật (advance() dùng cho test không tính)
  }
  function step(dt) {
    clockT += dt;
    fps = fps * 0.95 + (dt > 0 ? 1 / dt : 60) * 0.05;
    updateTweens(dt);
    lerpAmbience(Math.min(1, dt * 1.6));
    try { applyAmbience(); } catch (e) { /* */ }
    if (env) try { env.update(dt, clockT); } catch (e) { /* */ }
    try { updateLooks(); } catch (e) { /* */ }
    if (player && player.ch) try { player.ch.update(dt, clockT); } catch (e) { U.warnOnce('pupd', 'player update', e); }
    npcs.forEach((n) => { try { n.ch.update(dt, clockT); } catch (e) { U.warnOnce('nupd', 'npc update', e); } });
    if (fxSys) try { fxSys.update(dt); } catch (e) { /* */ }
    updateWeather(dt);
    if (cloudGroup) cloudGroup.children.forEach((c) => { c.userData.a = c.userData.a0 + Math.sin(clockT * c.userData.sp) * 0.12; c.position.x = Math.cos(c.userData.a) * c.userData.r; c.position.z = Math.sin(c.userData.a) * c.userData.r - 4; });
    updateCamera(dt);
    for (let i = 0; i < frameCbs.length; i++) { try { frameCbs[i](dt); } catch (e) { /* */ } }
    renderFrame(dt);
  }

  // ---------- public scene API ----------
  async function playScene(sc) {
    if (!ready || !sc) return;
    const my = ++seq;
    if (sc.time || sc.weather) setAmbience({ time: sc.time || timeOfDay, weather: sc.weather || weather });
    if (sc.player) { setPlayer(sc.player); stage.pAnim = sc.player.anim || 'idle'; }
    const loc = sc.loc && KN.Env && KN.Env.has(sc.loc) ? sc.loc : (sc.loc ? 'home' : envId);
    const decor = sc.decor === undefined ? envDecor : (sc.decor || null);
    const tier = loc === 'home' ? (sc.tier === undefined ? envTier : (sc.tier || null)) : null;
    const changed = !env || loc !== envId || decor !== envDecor || tier !== envTier;
    let moves = [];
    if (changed && loc) {
      await setLocation(loc, { decor, tier }, sc.npcs || []);
      if (my !== seq) return;
    } else if (sc.npcs) moves = syncNPCs(sc.npcs, 'walk') || [];
    if (sc.player) {
      if (player && player.ch) player.ch.root.visible = !sc.player.hidden;
      moves.push(playPlayer(sc.player.anim || 'idle', null, changed)); player && player.ch && player.ch.setExpression(sc.player.expr || null);
    }
    shot(sc.shot || 'wide');
    await U.sleep(changed ? 120 : 300);
    if (my !== seq) return;
    // let walkers arrive before effects and speech bubbles appear
    if (!changed) { await Promise.race([Promise.all(moves.map((m) => Promise.resolve(m).catch(() => {}))), U.sleep(1700)]); if (my !== seq) return; }
    [].concat(sc.fx || []).filter(Boolean).forEach((f) => fxAt(f, player && player.ch));
    if (sc.npcFx) Object.keys(sc.npcFx).forEach((id) => { const n = npcs.get(id); if (n && sc.npcFx[id]) fxAt(sc.npcFx[id], n.ch); });
    await U.sleep(changed ? 200 : 450);
  }

  KN.World = {
    init,
    playScene,
    setLocation: (id, o) => setLocation(id, o),
    setAmbience,
    setPlayer,
    playerAnim: (a, o) => playPlayer(a, o, false),
    npcAnim(id, a, o) { const n = npcs.get(id); if (!n) return resolved(); n.data = Object.assign({}, n.data, { anim: a }); return n.ch.play(a, o); },
    setExpression(id, e) { const c = charById(id); if (c) c.setExpression(e); },
    setNPCs: (list) => syncNPCs(list, 'walk'),
    clearNPCs() { Array.from(npcs.keys()).forEach((id) => removeNpc(id)); },
    fx(name, o) { const c = charById((o && o.target) || 'player'); if (c) fxAt(name, c); else if (fxSys) fxSys.spawn(name, new V3(0, 1.8, 0)); },
    shot,
    screenPos(id) {
      const c = charById(id);
      if (!ready || !c || !c.root.parent || !container) return { x: 0, y: 0, visible: false };
      c.getHeadWorldPosition(tmpV); tmpV.y += 0.22; tmpV.project(camera);
      const w = container.clientWidth, h = container.clientHeight;
      const x = (tmpV.x + 1) / 2 * w, y = (1 - tmpV.y) / 2 * h;
      return { x, y, visible: tmpV.z < 1 && x > -40 && x < w + 40 && y > -40 && y < h + 40 };
    },
    setQuality(q) {
      quality = q === 'low' ? 'low' : 'high';
      if (!renderer) return;
      renderer.setPixelRatio(dprFor());
      sun.castShadow = true;
      const s = quality === 'high' ? 2048 : 1024;
      if (sun.shadow.mapSize.x !== s) { sun.shadow.mapSize.set(s, s); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
      if (cloudGroup) cloudGroup.visible = quality === 'high';
      resize();
    },
    getQuality: () => quality,
    setPost(b) { postOn = !!b; if (renderer) { renderer.setPixelRatio(dprFor()); resize(); } },
    perfTier: () => perfTier,
    resetPerf() { perfTier = 0; postOn = true; try { localStorage.removeItem('kn_perf_tier'); } catch (e) { /* */ } if (renderer) { renderer.setPixelRatio(dprFor()); resize(); } },
    getPost: () => !!(post && postOn && quality === 'high'),
    // chụp khung hình hiện tại (album ảnh cuộc đời): vẽ lại một lần rồi đọc ngay, thu nhỏ thành JPEG
    snapshot(maxW) {
      if (!ready || !renderer) return null;
      try {
        renderFrame(0);
        const src = renderer.domElement, w = Math.min(maxW || 480, src.width), h = Math.round(src.height * w / src.width);
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(src, 0, 0, w, h);
        return cv.toDataURL('image/jpeg', 0.72);
      } catch (e) { return null; }
    },
    setReducedMotion(b) { reduced = !!b; },
    setPaused(b) { paused = !!b; },
    onFrame(cb) { if (typeof cb === 'function') frameCbs.push(cb); return () => { const i = frameCbs.indexOf(cb); if (i >= 0) frameCbs.splice(i, 1); }; },
    isReady: () => ready,
    lookFrom(pos, target) { cam.custom = [pos, target]; cam.shot = 'custom'; cam.fromP.copy(cam.pos); cam.fromT.copy(cam.target); computeShot('custom'); cam.k = 0; },
    advance(sec) { if (!ready) return; for (let i = 0; i < Math.round(sec * 30); i++) step(1 / 30); }, // testing aid (runs while the tab is hidden)
    current: () => ({ loc: envId, decor: envDecor, time: timeOfDay, weather }),
    _stage: () => ({ pAnim: stage.pAnim, bedNpc: stage.bedNpc, pSpot: (playerSpotFor(stage.pAnim) || {}).spot, slots: slotsFor(Array.from(npcs.values()).map((n) => n.data), (playerSpotFor(stage.pAnim) || {}).spot || env.playerSpot) }),
    probe: (x, z, r) => ({ blocked: blocked(x, z, r == null ? BODY_R : r), hits: ((env && env.obs) || []).filter((o) => x > o.x0 - (r == null ? BODY_R : r) && x < o.x1 + (r == null ? BODY_R : r) && z > o.z0 - (r == null ? BODY_R : r) && z < o.z1 + (r == null ? BODY_R : r)) }),
    // testing aid: where everyone stands and whether that point is inside a prop
    stageInfo() {
      const one = (ch) => { const p = ch.root.position; return { x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), rotY: +ch.root.rotation.y.toFixed(2), anim: ch.anim, inside: blocked(p.x, p.z, 0.12) && !(env.anchors && Object.values(env.anchors).some((a) => Math.hypot(a.pos[0] - p.x, a.pos[2] - p.z) < 0.05)) }; };
      return { loc: envId, bedNpc: stage.bedNpc, player: player && player.ch ? one(player.ch) : null, npcs: Array.from(npcs.entries()).map(([id, n]) => Object.assign({ id }, one(n.ch))) };
    },
    debug() { return renderer ? { fps: Math.round(fps), drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, npcs: npcs.size, fx: fxSys ? fxSys.count : 0, shot: cam.shot, k: +cam.k.toFixed(2), cam: camera.position.toArray().map((v) => +v.toFixed(2)), to: cam.toP.toArray().map((v) => +v.toFixed(2)) } : {}; },
  };
})();
