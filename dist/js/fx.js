/* Một Kiếp Người — particle effects (KN.FX). Sprites with procedurally drawn canvas textures. SPEC §4.5 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const THREE = window.THREE;
  const U = KN.util;
  const NAMES = ['confetti', 'hearts', 'heartbreak', 'money', 'sparkle', 'tears', 'zzz', 'fireworks', 'smoke', 'anger', 'question', 'exclaim', 'idea', 'sweat', 'music', 'stars', 'petals', 'bubbles', 'levelup', 'sick', 'steam', 'flash', 'dust'];
  if (!THREE) { KN.FX = { NAMES, create() { return { spawn() {}, update() {}, clear() {}, dispose() {} }; } }; return; }

  const texCache = new Map();
  function tex(key, size, draw) {
    let t = texCache.get(key);
    if (t) return t;
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const g = cv.getContext('2d'); draw(g, size);
    t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    texCache.set(key, t);
    return t;
  }
  function heartPath(g, s, cx, cy) {
    g.beginPath(); g.moveTo(cx, cy + s * 0.32);
    g.bezierCurveTo(cx - s * 0.55, cy - s * 0.05, cx - s * 0.32, cy - s * 0.5, cx, cy - s * 0.2);
    g.bezierCurveTo(cx + s * 0.32, cy - s * 0.5, cx + s * 0.55, cy - s * 0.05, cx, cy + s * 0.32);
    g.closePath();
  }
  const T = {
    heart: () => tex('heart', 128, (g, n) => {
      const gr = g.createLinearGradient(0, 20, 0, 110); gr.addColorStop(0, '#ff8fb8'); gr.addColorStop(1, '#ff3b6b');
      heartPath(g, n * 0.9, n / 2, n / 2 + 6); g.fillStyle = gr; g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(n * 0.36, n * 0.36, 9, 6, -0.6, 0, Math.PI * 2); g.fill();
    }),
    halfHeart: (side) => tex('hh' + side, 128, (g, n) => {
      g.save(); g.beginPath();
      if (side < 0) { g.moveTo(0, 0); g.lineTo(64, 0); g.lineTo(54, 40); g.lineTo(70, 64); g.lineTo(58, 90); g.lineTo(64, 128); g.lineTo(0, 128); }
      else { g.moveTo(128, 0); g.lineTo(64, 0); g.lineTo(54, 40); g.lineTo(70, 64); g.lineTo(58, 90); g.lineTo(64, 128); g.lineTo(128, 128); }
      g.closePath(); g.clip(); heartPath(g, n * 0.9, n / 2, n / 2 + 6); g.fillStyle = '#e8365d'; g.fill(); g.restore();
    }),
    star: () => tex('star', 128, (g, n) => {
      const c = n / 2, rg = g.createRadialGradient(c, c, 0, c, c, c);
      rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.18, 'rgba(255,240,180,.95)'); rg.addColorStop(0.45, 'rgba(255,210,100,.25)'); rg.addColorStop(1, 'rgba(255,200,80,0)');
      g.fillStyle = rg; g.fillRect(0, 0, n, n);
      g.fillStyle = '#fff'; g.beginPath();
      for (let i = 0; i < 8; i++) { const r = i % 2 ? 7 : 56, a = (i / 8) * Math.PI * 2; g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); }
      g.closePath(); g.fill();
    }),
    soft: () => tex('soft', 64, (g, n) => {
      const c = n / 2, rg = g.createRadialGradient(c, c, 0, c, c, c);
      rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(0.5, 'rgba(255,255,255,.45)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(0, 0, n, n);
    }),
    square: () => tex('sq', 16, (g, n) => { g.fillStyle = '#fff'; g.fillRect(2, 2, n - 4, n - 4); }),
    coin: () => tex('coin', 64, (g, n) => {
      const c = n / 2, rg = g.createRadialGradient(c - 8, c - 8, 2, c, c, c);
      rg.addColorStop(0, '#fff6c2'); rg.addColorStop(0.5, '#ffcf3f'); rg.addColorStop(1, '#c98a0b');
      g.fillStyle = rg; g.beginPath(); g.arc(c, c, c - 3, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#a86f06'; g.lineWidth = 3; g.beginPath(); g.arc(c, c, c - 10, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#a86f06'; g.font = 'bold 26px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('₫', c, c + 1);
    }),
    note: () => tex('note', 128, (g, n) => {
      g.fillStyle = '#2f9e6e'; g.fillRect(4, 34, 120, 60);
      g.fillStyle = '#5ccf95'; g.fillRect(10, 40, 108, 48);
      g.fillStyle = '#1e6b49'; g.beginPath(); g.arc(64, 64, 17, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e8fff2'; g.font = 'bold 22px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('đ', 64, 65);
      g.font = 'bold 12px system-ui'; g.fillText('500.000', 98, 82); g.fillText('500.000', 30, 50);
    }),
    drop: (col) => tex('drop' + col, 64, (g, n) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(32, 6); g.bezierCurveTo(52, 30, 50, 56, 32, 58); g.bezierCurveTo(14, 56, 12, 30, 32, 6); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(26, 40, 4, 7, 0.3, 0, Math.PI * 2); g.fill();
    }),
    ring: () => tex('ring', 128, (g, n) => {
      const c = n / 2; g.strokeStyle = 'rgba(255,220,120,1)'; g.lineWidth = 8; g.shadowColor = '#ffd36b'; g.shadowBlur = 16;
      g.beginPath(); g.arc(c, c, c - 14, 0, Math.PI * 2); g.stroke();
    }),
    petal: () => tex('petal', 64, (g) => {
      const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, '#ffd1e0'); gr.addColorStop(1, '#ff8fb1');
      g.fillStyle = gr; g.beginPath(); g.ellipse(32, 32, 14, 24, 0.5, 0, Math.PI * 2); g.fill();
    }),
    bubble: () => tex('bubble', 64, (g) => {
      g.strokeStyle = 'rgba(200,240,255,.9)'; g.lineWidth = 3; g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(180,230,255,.18)'; g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(22, 22, 5, 0, Math.PI * 2); g.fill();
    }),
    glyph: (ch, color) => tex('gl' + ch + (color || ''), 128, (g, n) => {
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (color) {
        g.font = '900 96px "Baloo 2", "Be Vietnam Pro", system-ui, sans-serif';
        g.lineWidth = 12; g.strokeStyle = 'rgba(20,20,40,.55)'; g.strokeText(ch, n / 2, n / 2 + 4);
        g.fillStyle = color; g.fillText(ch, n / 2, n / 2 + 4);
      } else {
        g.font = '92px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        g.fillText(ch, n / 2, n / 2 + 6);
      }
    }),
  };

  const CONFETTI = ['#ff5c7a', '#ffcf4d', '#39cf98', '#5cc8ff', '#c792ff', '#ff9f43', '#ffffff'];
  const FIRE = ['#ff5c7a', '#ffd166', '#5cc8ff', '#7cf29a', '#c792ff', '#ff9f43'];

  function create(scene, camera) {
    const group = new THREE.Group(); group.name = 'fx'; group.renderOrder = 10;
    scene.add(group);
    const pool = [], live = [];
    const MAX = 600;
    const tmp = new THREE.Vector3();

    function sprite() {
      let s = pool.pop();
      if (!s) {
        s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
        s.userData.p = {};
      }
      s.visible = true; group.add(s);
      return s;
    }
    function emit(o) {
      if (live.length >= MAX) return null;
      const s = sprite(), m = s.material;
      m.map = o.map; m.color.set(o.color || '#ffffff'); m.blending = o.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      m.rotation = o.rot || 0; m.opacity = 0; m.depthTest = o.depthTest !== false; m.needsUpdate = true;
      s.position.copy(o.pos);
      const p = s.userData.p;
      p.vx = o.vx || 0; p.vy = o.vy || 0; p.vz = o.vz || 0; p.g = o.g || 0; p.drag = o.drag ?? 0.6;
      p.life = o.life || 1.5; p.age = -(o.delay || 0); p.s0 = o.s0 ?? 0.2; p.s1 = o.s1 ?? p.s0; p.spin = o.spin || 0;
      p.alpha = o.alpha ?? 1; p.fadeIn = o.fadeIn ?? 0.12; p.wob = o.wob || 0; p.wobF = o.wobF || 3; p.ph = Math.random() * 6.28;
      p.orbit = o.orbit || null; p.pop = !!o.pop; p.sx = o.sx || 1; p.floor = o.floor ?? -1;
      s.scale.set(0.0001, 0.0001, 1);
      live.push(s);
      return s;
    }
    const R = U.rand;

    const recipes = {
      confetti(pos) { for (let i = 0; i < 70; i++) emit({ map: T.square(), color: U.pick(CONFETTI), pos: tmp.set(pos.x + R(-1.2, 1.2), pos.y + R(0.6, 1.6), pos.z + R(-1, 1)).clone(), vx: R(-0.6, 0.6), vy: R(-0.2, 1.4), vz: R(-0.6, 0.6), g: -1.6, drag: 1.4, life: R(2.2, 3.2), s0: R(0.05, 0.09), s1: 0.06, spin: R(-8, 8), wob: 0.6, wobF: R(4, 8), delay: R(0, 0.3), floor: 0.02, sx: R(0.5, 1.6) }); },
      hearts(pos) { for (let i = 0; i < 9; i++) emit({ map: T.heart(), pos: tmp.set(pos.x + R(-0.25, 0.25), pos.y + R(-0.1, 0.1), pos.z + R(-0.2, 0.2)).clone(), vy: R(0.45, 0.8), vx: R(-0.15, 0.15), life: R(1.6, 2.4), s0: 0.05, s1: R(0.18, 0.28), wob: 0.25, wobF: 3, delay: i * 0.12, pop: true }); },
      heartbreak(pos) {
        const p0 = pos.clone().add(new THREE.Vector3(0, 0.35, 0));
        emit({ map: T.halfHeart(-1), pos: p0.clone().add(new THREE.Vector3(-0.03, 0, 0)), vx: -0.35, vy: 0.4, g: -2.6, life: 1.8, s0: 0.38, s1: 0.32, spin: 1.5, delay: 0.35 });
        emit({ map: T.halfHeart(1), pos: p0.clone().add(new THREE.Vector3(0.03, 0, 0)), vx: 0.35, vy: 0.4, g: -2.6, life: 1.8, s0: 0.38, s1: 0.32, spin: -1.5, delay: 0.35 });
        emit({ map: T.heart(), pos: p0, life: 0.45, s0: 0.1, s1: 0.4, pop: true });
      },
      money(pos) {
        for (let i = 0; i < 26; i++) { const note = i % 3 !== 0; emit({ map: note ? T.note() : T.coin(), pos: pos.clone().add(new THREE.Vector3(R(-0.2, 0.2), 0.2, R(-0.2, 0.2))), vx: R(-1.4, 1.4), vy: R(1.6, 3.2), vz: R(-1.2, 1.2), g: -5.5, drag: note ? 1.6 : 0.3, life: R(1.6, 2.4), s0: note ? 0.3 : 0.15, spin: R(-5, 5), wob: note ? 0.4 : 0, wobF: 5, delay: R(0, 0.25), floor: 0.05 }); }
      },
      sparkle(pos) { for (let i = 0; i < 16; i++) emit({ map: T.star(), pos: pos.clone().add(new THREE.Vector3(R(-0.6, 0.6), R(-0.5, 0.5), R(-0.5, 0.5))), vy: R(0.05, 0.3), life: R(0.7, 1.3), s0: 0.02, s1: R(0.18, 0.32), additive: true, delay: R(0, 0.6), pop: true, spin: R(-2, 2) }); },
      tears(pos) { for (let i = 0; i < 14; i++) { const sd = i % 2 ? 1 : -1; emit({ map: T.drop('#6ec6ff'), pos: pos.clone().add(new THREE.Vector3(sd * 0.07, -0.12, 0.1)), vx: sd * R(0.3, 0.6), vy: R(0.6, 1.0), vz: R(0.2, 0.5), g: -4.5, life: 0.9, s0: 0.07, s1: 0.05, delay: i * 0.12, floor: 0.02 }); } },
      zzz(pos) { for (let i = 0; i < 4; i++) emit({ map: T.glyph('Z', '#cfe6ff'), pos: pos.clone().add(new THREE.Vector3(0.15, 0.05, 0)), vx: 0.18, vy: 0.35, life: 2.0, s0: 0.08, s1: 0.22 + i * 0.03, wob: 0.15, wobF: 2, delay: i * 0.55 }); },
      fireworks(pos) {
        for (let b = 0; b < 3; b++) {
          const c = pos.clone().add(new THREE.Vector3(R(-1.6, 1.6), R(1.4, 2.6), R(-1.2, 0.6))), col = U.pick(FIRE), d0 = b * 0.45;
          emit({ map: T.soft(), color: '#fff3c4', pos: c.clone().add(new THREE.Vector3(0, -1.6, 0)), vy: 3.2, life: 0.5, s0: 0.12, s1: 0.06, additive: true, delay: d0 });
          for (let i = 0; i < 34; i++) { const a = Math.random() * Math.PI * 2, e = Math.acos(R(-1, 1)), sp = R(1.4, 2.2); emit({ map: T.star(), color: col, pos: c.clone(), vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, g: -1.4, drag: 1.8, life: R(1.0, 1.5), s0: 0.16, s1: 0.04, additive: true, delay: d0 + 0.5 }); }
        }
      },
      smoke(pos) { for (let i = 0; i < 14; i++) emit({ map: T.soft(), color: '#9aa0aa', pos: pos.clone().add(new THREE.Vector3(R(-0.2, 0.2), -0.2, R(-0.2, 0.2))), vy: R(0.3, 0.7), vx: R(-0.2, 0.2), life: R(1.6, 2.4), s0: 0.2, s1: R(0.7, 1.0), alpha: 0.55, delay: R(0, 0.5) }); },
      anger(pos) { for (let i = 0; i < 3; i++) emit({ map: T.glyph('💢'), pos: pos.clone().add(new THREE.Vector3(0.22 * (i % 2 ? 1 : -1), 0.08 + i * 0.05, 0.05)), life: 0.9, s0: 0.1, s1: 0.3, pop: true, delay: i * 0.35, wob: 0.05, wobF: 20 }); },
      question(pos) { emit({ map: T.glyph('?', '#ffcf4d'), pos: pos.clone().add(new THREE.Vector3(0.12, 0.2, 0)), life: 1.8, s0: 0.1, s1: 0.38, pop: true, wob: 0.04, wobF: 3 }); },
      exclaim(pos) { emit({ map: T.glyph('!', '#ff5c5c'), pos: pos.clone().add(new THREE.Vector3(0.1, 0.22, 0)), life: 1.4, s0: 0.1, s1: 0.42, pop: true }); },
      idea(pos) { emit({ map: T.glyph('💡'), pos: pos.clone().add(new THREE.Vector3(0, 0.3, 0)), life: 1.8, s0: 0.1, s1: 0.42, pop: true }); recipes.sparkle(pos.clone().add(new THREE.Vector3(0, 0.3, 0))); },
      sweat(pos) { emit({ map: T.drop('#9fd8ff'), pos: pos.clone().add(new THREE.Vector3(0.16, -0.05, 0.05)), vy: -0.12, life: 1.6, s0: 0.06, s1: 0.13, pop: true }); emit({ map: T.drop('#9fd8ff'), pos: pos.clone().add(new THREE.Vector3(-0.18, -0.1, 0.05)), vy: -0.15, life: 1.4, s0: 0.05, s1: 0.1, pop: true, delay: 0.3 }); },
      music(pos) { for (let i = 0; i < 6; i++) emit({ map: T.glyph(i % 2 ? '♪' : '♫', U.pick(['#ffcf4d', '#5cc8ff', '#ff7eb6', '#39cf98'])), pos: pos.clone().add(new THREE.Vector3(R(-0.2, 0.2), 0, 0.1)), vx: R(-0.3, 0.3), vy: R(0.35, 0.6), life: 2.0, s0: 0.08, s1: 0.22, wob: 0.2, wobF: 3, delay: i * 0.3 }); },
      stars(pos) { for (let i = 0; i < 5; i++) emit({ map: T.star(), color: '#ffe27a', pos: pos.clone(), orbit: { c: pos.clone().add(new THREE.Vector3(0, 0.05, 0)), r: 0.28, w: 5, a: (i / 5) * Math.PI * 2 }, life: 2.4, s0: 0.14, s1: 0.14, additive: true }); },
      petals(pos) { for (let i = 0; i < 26; i++) emit({ map: T.petal(), pos: pos.clone().add(new THREE.Vector3(R(-1.6, 1.6), R(0.8, 1.8), R(-1.2, 1.2))), vx: R(0.1, 0.4), vy: R(-0.2, -0.05), g: -0.25, drag: 1.2, life: R(3, 4.2), s0: 0.08, s1: 0.1, spin: R(-2, 2), wob: 0.5, wobF: R(1.5, 3), delay: R(0, 1.2), floor: 0.02 }); },
      bubbles(pos) { for (let i = 0; i < 14; i++) emit({ map: T.bubble(), pos: pos.clone().add(new THREE.Vector3(R(-0.4, 0.4), R(-0.6, 0), R(-0.3, 0.3))), vy: R(0.25, 0.55), life: R(1.6, 2.6), s0: 0.05, s1: R(0.1, 0.2), wob: 0.2, wobF: 3, delay: R(0, 0.8) }); },
      levelup(pos) {
        const base = pos.clone(); base.y = Math.max(0.05, pos.y - 1.7);
        for (let k = 0; k < 3; k++) { const s = emit({ map: T.ring(), pos: base.clone(), vy: 0.9, life: 1.3, s0: 0.6, s1: 1.1, additive: true, delay: k * 0.25 }); if (s) s.userData.p.flat = true; }
        for (let i = 0; i < 18; i++) emit({ map: T.star(), color: '#ffe27a', pos: base.clone().add(new THREE.Vector3(R(-0.4, 0.4), R(0, 1.6), R(-0.4, 0.4))), vy: R(0.6, 1.2), life: 1.2, s0: 0.15, s1: 0.02, additive: true, delay: R(0, 0.6) });
      },
      sick(pos) { emit({ map: T.glyph('🤒'), pos: pos.clone().add(new THREE.Vector3(0.18, 0.18, 0)), life: 1.8, s0: 0.1, s1: 0.32, pop: true }); for (let i = 0; i < 8; i++) emit({ map: T.soft(), color: '#8fdc6a', pos: pos.clone().add(new THREE.Vector3(R(-0.2, 0.2), -0.1, 0.1)), vy: R(0.15, 0.35), vx: R(-0.15, 0.15), life: 1.6, s0: 0.08, s1: 0.22, alpha: 0.5, delay: R(0, 0.6) }); },
      steam(pos) { for (let i = 0; i < 10; i++) emit({ map: T.soft(), color: '#ffffff', pos: pos.clone().add(new THREE.Vector3(R(-0.1, 0.1), -0.3, 0.2)), vy: R(0.25, 0.45), vx: R(-0.06, 0.06), life: R(1.6, 2.2), s0: 0.06, s1: R(0.3, 0.45), alpha: 0.45, wob: 0.1, wobF: 2, delay: i * 0.18 }); },
      flash(pos) { emit({ map: T.soft(), color: '#ffffff', pos: pos.clone(), life: 0.35, s0: 0.5, s1: 3.5, additive: true, fadeIn: 0.02, depthTest: false }); recipes.sparkle(pos); },
      dust(pos) { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; emit({ map: T.soft(), color: '#e8dcc8', pos: pos.clone().add(new THREE.Vector3(Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15)), vx: Math.cos(a) * 0.8, vz: Math.sin(a) * 0.8, vy: 0.15, drag: 2.5, life: 0.8, s0: 0.12, s1: 0.35, alpha: 0.6 }); } },
    };

    return {
      spawn(name, pos, opts) {
        if (!pos) pos = new THREE.Vector3(0, 1.8, 0);
        const fn = recipes[name] || recipes.sparkle;
        if (!recipes[name]) U.warnOnce('fx:' + name, 'unknown fx', name);
        try { fn(pos.clone ? pos.clone() : new THREE.Vector3(pos.x, pos.y, pos.z), opts || {}); } catch (e) { console.warn('[KN.FX]', name, e); }
      },
      update(dt) {
        dt = Math.min(dt, 0.1);
        for (let i = live.length - 1; i >= 0; i--) {
          const s = live[i], p = s.userData.p;
          p.age += dt;
          if (p.age < 0) { s.material.opacity = 0; continue; }
          const k = p.age / p.life;
          if (k >= 1) { s.visible = false; group.remove(s); pool.push(s); live.splice(i, 1); continue; }
          if (p.orbit) {
            const o = p.orbit; o.a += o.w * dt;
            s.position.set(o.c.x + Math.cos(o.a) * o.r, o.c.y + Math.sin(o.a * 2) * 0.03, o.c.z + Math.sin(o.a) * o.r);
          } else {
            p.vy += p.g * dt;
            const dr = Math.max(0, 1 - p.drag * dt);
            p.vx *= dr; p.vz *= dr; if (p.g === 0) p.vy *= dr;
            s.position.x += (p.vx + (p.wob ? Math.cos(p.age * p.wobF + p.ph) * p.wob : 0)) * dt;
            s.position.y += p.vy * dt;
            s.position.z += p.vz * dt;
            if (p.floor >= 0 && s.position.y < p.floor) { s.position.y = p.floor; p.vx *= 0.5; p.vz *= 0.5; p.vy = 0; p.g = 0; }
          }
          s.material.rotation += p.spin * dt;
          let sc = p.s0 + (p.s1 - p.s0) * (p.pop ? U.ease.outBack(Math.min(1, k * 3.5)) : k);
          s.scale.set(sc * p.sx, sc, 1);
          const fadeOut = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
          s.material.opacity = p.alpha * Math.min(1, p.age / Math.max(0.01, p.fadeIn)) * fadeOut;
        }
      },
      clear() { for (const s of live) { s.visible = false; group.remove(s); pool.push(s); } live.length = 0; },
      dispose() { this.clear(); pool.forEach((s) => s.material.dispose()); pool.length = 0; scene.remove(group); },
      get count() { return live.length; },
    };
  }

  KN.FX = { NAMES, create };
})();
