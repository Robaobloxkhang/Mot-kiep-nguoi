/* Một Kiếp Người — KN.Audio: procedural WebAudio sound effects + soft generative pentatonic music.
 *
 *   KN.Audio.unlock()            call on the first user gesture (creates/resumes the AudioContext)
 *   KN.Audio.sfx(name)           click, hover, age, good, bad, coin, achievement, birth, death, pop, whoosh,
 *                                love, fail, cheer, tick, notify, page   (unknown → 'click', warned once)
 *   KN.Audio.setSfx(bool) / setMusic(bool)
 *   KN.Audio.mood('calm'|'happy'|'sad'|'tense'|'festive')
 *   KN.Audio.state() -> { supported, unlocked, sfx, music, mood }   (extra helper)
 *   KN.Audio.setVolume(0..1)                                        (extra helper, master volume)
 *
 * Everything is synthesized (oscillators, filtered noise, a procedural reverb impulse). Fails soft: with no
 * AudioContext every call is a harmless no-op.
 */
(function () {
  'use strict';
  const KN = (window.KN = window.KN || {});
  const U = KN.util || {};
  const warnOnce = U.warnOnce || function (k) { console.warn('[KN]', ...Array.prototype.slice.call(arguments, 1)); };
  const AC = window.AudioContext || window.webkitAudioContext || null;

  let ctx = null;
  let master = null, comp = null, sfxBus = null, musicBus = null, verbIn = null, verbOut = null;
  let noiseBuf = null;
  let sfxOn = true, musicOn = true, unlocked = false, failed = false;
  let masterVol = 0.85;
  let curMood = 'calm';
  const lastAt = Object.create(null);

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ------------------------------------------------------------------ graph
  function ensure() {
    if (ctx) return ctx;
    if (!AC || failed) return null;
    try {
      ctx = new AC({ latencyHint: 'interactive' });
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 24; comp.ratio.value = 3.2;
      comp.attack.value = 0.006; comp.release.value = 0.28;
      master = ctx.createGain(); master.gain.value = masterVol;
      master.connect(comp); comp.connect(ctx.destination);

      sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 0.9 : 0; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.0001; musicBus.connect(master);

      // soft procedural hall reverb (shared send)
      const verb = ctx.createConvolver();
      verb.buffer = makeImpulse(2.4, 2.8);
      verbIn = ctx.createGain(); verbIn.gain.value = 1;
      verbOut = ctx.createGain(); verbOut.gain.value = 0.42;
      const verbTone = ctx.createBiquadFilter(); verbTone.type = 'lowpass'; verbTone.frequency.value = 4200;
      verbIn.connect(verb); verb.connect(verbTone); verbTone.connect(verbOut); verbOut.connect(master);

      noiseBuf = makeNoise(2);
    } catch (e) {
      warnOnce('audio-init', 'KN.Audio: AudioContext unavailable', e);
      ctx = null; failed = true;
    }
    return ctx;
  }

  function makeImpulse(seconds, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (i < rate * 0.012 ? i / (rate * 0.012) : 1);
      }
    }
    return buf;
  }
  function makeNoise(seconds) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(1, len, rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // output with optional reverb send
  function out(node, dest, wet) {
    node.connect(dest);
    if (wet > 0 && verbIn) {
      const s = ctx.createGain(); s.gain.value = wet;
      node.connect(s); s.connect(verbIn);
    }
  }

  // ------------------------------------------------------------------ voices
  // tone: one oscillator with an exponential AD envelope
  function tone(freq, t, o) {
    o = o || {};
    const type = o.type || 'sine';
    const gain = o.gain != null ? o.gain : 0.08;
    const attack = o.attack != null ? o.attack : 0.006;
    const release = o.release != null ? o.release : 0.3;
    const dest = o.dest || sfxBus;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.glide), t + (o.glideTime || attack + release * 0.6));
    if (o.detune) osc.detune.value = o.detune;
    if (o.vibrato) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = o.vibrato.rate || 5.5; lg.gain.value = o.vibrato.depth || 6;
      lfo.connect(lg); lg.connect(osc.detune);
      lfo.start(t); lfo.stop(t + attack + release + 0.1);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
    if (o.hold) g.gain.setValueAtTime(Math.max(0.0002, gain), t + attack + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + (o.hold || 0) + release);
    let node = osc;
    if (o.filter) {
      const f = ctx.createBiquadFilter();
      f.type = o.filter.type || 'lowpass';
      f.frequency.setValueAtTime(o.filter.freq || 2000, t);
      if (o.filter.to) f.frequency.exponentialRampToValueAtTime(o.filter.to, t + attack + release);
      f.Q.value = o.filter.q || 0.7;
      osc.connect(f); node = f;
    }
    node.connect(g);
    out(g, dest, o.wet != null ? o.wet : 0.12);
    osc.start(t);
    osc.stop(t + attack + (o.hold || 0) + release + 0.06);
  }

  // filtered noise burst (whooshes, sparkles, paper)
  function noise(t, o) {
    o = o || {};
    const dur = o.dur || 0.3;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 0.9;
    const g = ctx.createGain();
    const peak = o.gain != null ? o.gain : 0.05;
    const atk = o.attack != null ? o.attack : Math.min(0.08, dur * 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g);
    out(g, o.dest || sfxBus, o.wet != null ? o.wet : 0.1);
    const off = Math.random() * 1.2;
    src.start(t, off, dur + 0.05);
  }

  // bell: sine partials with inharmonic ratios and staggered decays
  function bell(freq, t, o) {
    o = o || {};
    const dur = o.dur || 1.4;
    const gain = o.gain != null ? o.gain : 0.05;
    const ratios = o.ratios || [1, 2.0, 2.76, 4.07, 5.43];
    const amps = o.amps || [1, 0.45, 0.32, 0.14, 0.07];
    ratios.forEach((r, i) => {
      tone(freq * r, t, {
        type: 'sine', gain: gain * amps[i], attack: 0.003 + i * 0.001,
        release: dur / (1 + i * 0.55), dest: o.dest || sfxBus, wet: o.wet != null ? o.wet : 0.35,
        filter: o.filter,
      });
    });
  }

  // music-box / plucked note
  function pluck(freq, t, o) {
    o = o || {};
    const gain = o.gain != null ? o.gain : 0.05;
    const dur = o.dur || 0.9;
    tone(freq, t, { type: 'triangle', gain, attack: 0.004, release: dur, dest: o.dest, wet: o.wet != null ? o.wet : 0.3,
      filter: { type: 'lowpass', freq: o.bright || 3200, to: 700, q: 0.5 } });
    tone(freq * 2, t, { type: 'sine', gain: gain * 0.28, attack: 0.002, release: dur * 0.45, dest: o.dest, wet: o.wet != null ? o.wet : 0.3 });
  }

  // ------------------------------------------------------------------ sound effects
  const MIN_GAP = { hover: 0.07, tick: 0.035, click: 0.03, pop: 0.05 };

  const SFX = {
    click(t) {
      tone(1150, t, { type: 'sine', gain: 0.05, attack: 0.002, release: 0.06, glide: 720, glideTime: 0.05, wet: 0.02 });
      noise(t, { type: 'highpass', freq: 3200, dur: 0.025, gain: 0.012, wet: 0 });
    },
    hover(t) {
      tone(1680, t, { type: 'sine', gain: 0.012, attack: 0.004, release: 0.05, wet: 0.05 });
    },
    tick(t) {
      tone(rnd(1750, 2050), t, { type: 'sine', gain: 0.01, attack: 0.002, release: 0.025, wet: 0 });
    },
    pop(t) {
      tone(360, t, { type: 'sine', gain: 0.075, attack: 0.004, release: 0.1, glide: 980, glideTime: 0.07, wet: 0.08 });
    },
    page(t) {
      noise(t, { type: 'bandpass', freq: 1100, to: 2900, q: 0.8, dur: 0.17, gain: 0.04, wet: 0.05 });
    },
    whoosh(t) {
      noise(t, { type: 'bandpass', freq: 320, to: 2300, q: 1.1, dur: 0.48, attack: 0.16, gain: 0.06, wet: 0.2 });
    },
    good(t) {
      tone(mtof(79), t, { type: 'triangle', gain: 0.06, release: 0.32, wet: 0.25 });
      tone(mtof(84), t + 0.085, { type: 'triangle', gain: 0.065, release: 0.45, wet: 0.3 });
      tone(mtof(72), t + 0.085, { type: 'sine', gain: 0.03, release: 0.5, wet: 0.2 });
    },
    bad(t) {
      tone(150, t, { type: 'sine', gain: 0.14, attack: 0.006, release: 0.34, glide: 82, glideTime: 0.26, wet: 0.08,
        filter: { type: 'lowpass', freq: 420 } });
      tone(mtof(57), t + 0.05, { type: 'triangle', gain: 0.04, attack: 0.02, release: 0.75, wet: 0.3, filter: { type: 'lowpass', freq: 900 } });
      tone(mtof(60), t + 0.05, { type: 'triangle', gain: 0.035, attack: 0.02, release: 0.75, wet: 0.3, filter: { type: 'lowpass', freq: 900 } });
    },
    fail(t) {
      tone(mtof(76), t, { type: 'triangle', gain: 0.05, release: 0.16, wet: 0.12, filter: { type: 'lowpass', freq: 2000 } });
      tone(mtof(72), t + 0.12, { type: 'triangle', gain: 0.05, release: 0.3, wet: 0.15, filter: { type: 'lowpass', freq: 1800 } });
    },
    coin(t) {
      tone(mtof(83), t, { type: 'square', gain: 0.03, attack: 0.002, release: 0.07, wet: 0.1, filter: { type: 'lowpass', freq: 3600 } });
      tone(mtof(88), t + 0.065, { type: 'square', gain: 0.034, attack: 0.002, release: 0.36, wet: 0.2, filter: { type: 'lowpass', freq: 3800, to: 1600 } });
      [96, 100, 103, 105, 108].forEach((m, i) => {
        if (i > 0 && Math.random() < 0.3) return;
        tone(mtof(m), t + 0.11 + i * 0.045, { type: 'sine', gain: 0.018, attack: 0.002, release: 0.22, wet: 0.45 });
      });
    },
    achievement(t) {
      [72, 76, 79, 84].forEach((m, i) => {
        tone(mtof(m), t + i * 0.085, { type: 'triangle', gain: 0.06, release: 0.32, wet: 0.25 });
        tone(mtof(m + 12), t + i * 0.085, { type: 'sine', gain: 0.018, release: 0.25, wet: 0.3 });
      });
      [84, 88, 91].forEach((m) => bell(mtof(m), t + 0.37, { gain: 0.03, dur: 1.5, wet: 0.45 }));
      tone(mtof(60), t + 0.37, { type: 'triangle', gain: 0.04, attack: 0.02, release: 1.1, wet: 0.3, filter: { type: 'lowpass', freq: 1400 } });
      for (let i = 0; i < 5; i++) tone(mtof(pickOne([96, 98, 100, 103, 105, 108])), t + 0.45 + i * 0.07, { type: 'sine', gain: 0.012, release: 0.25, wet: 0.5 });
    },
    age(t) {
      noise(t, { type: 'bandpass', freq: 260, to: 1900, q: 1.0, dur: 0.62, attack: 0.26, gain: 0.05, wet: 0.25 });
      bell(mtof(79), t + 0.34, { gain: 0.04, dur: 1.4, wet: 0.45 });
      bell(mtof(84), t + 0.46, { gain: 0.04, dur: 1.5, wet: 0.45 });
      bell(mtof(88), t + 0.58, { gain: 0.035, dur: 1.7, wet: 0.5 });
      tone(mtof(60), t + 0.34, { type: 'sine', gain: 0.035, attack: 0.05, release: 1.3, wet: 0.3 });
    },
    birth(t) {
      const notes = [84, 88, 91, 88, 93, 91, 88, 86, 84];
      notes.forEach((m, i) => bell(mtof(m), t + i * 0.17, { gain: 0.028, dur: 1.1, wet: 0.5,
        ratios: [1, 3.0, 4.2, 6.3], amps: [1, 0.25, 0.12, 0.05] }));
      [60, 64, 67].forEach((m) => tone(mtof(m), t, { type: 'sine', gain: 0.018, attack: 0.4, hold: 0.8, release: 1.4, wet: 0.4 }));
    },
    death(t) {
      bell(98, t, { gain: 0.11, dur: 4.2, wet: 0.55, filter: { type: 'lowpass', freq: 1300 } });
      bell(196.5, t + 0.015, { gain: 0.035, dur: 3.0, wet: 0.55, filter: { type: 'lowpass', freq: 1500 } });
      [45, 48, 52].forEach((m) => tone(mtof(m), t + 0.2, { type: 'sine', gain: 0.02, attack: 0.8, hold: 0.8, release: 2.4, wet: 0.45 }));
    },
    love(t) {
      tone(mtof(69), t, { type: 'sine', gain: 0.065, attack: 0.02, release: 0.55, wet: 0.35, vibrato: { rate: 5.2, depth: 7 } });
      tone(mtof(76), t + 0.19, { type: 'sine', gain: 0.07, attack: 0.02, release: 0.85, wet: 0.4, vibrato: { rate: 5.2, depth: 8 } });
      tone(mtof(57), t, { type: 'triangle', gain: 0.025, attack: 0.08, release: 1.0, wet: 0.3, filter: { type: 'lowpass', freq: 900 } });
      tone(mtof(88), t + 0.25, { type: 'sine', gain: 0.012, release: 0.6, wet: 0.5 });
    },
    cheer(t) {
      [79, 83, 86, 91].forEach((m, i) => tone(mtof(m), t + i * 0.05, { type: 'triangle', gain: 0.045, release: 0.22, wet: 0.25 }));
      noise(t + 0.05, { type: 'highpass', freq: 4200, dur: 0.3, gain: 0.02, wet: 0.3 });
      bell(mtof(91), t + 0.22, { gain: 0.025, dur: 0.9, wet: 0.4 });
    },
    notify(t) {
      bell(mtof(79), t, { gain: 0.035, dur: 0.8, wet: 0.3 });
      bell(mtof(86), t + 0.11, { gain: 0.035, dur: 1.0, wet: 0.35 });
    },
  };

  function sfx(name) {
    if (!sfxOn || !unlocked) return;
    if (!ensure()) return;
    let fn = SFX[name];
    if (!fn) { warnOnce('audio-sfx-' + name, 'KN.Audio: unknown sfx "' + name + '"'); fn = SFX.click; name = 'click'; }
    try {
      if (ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(function () {});
      const now = ctx.currentTime;
      const gap = MIN_GAP[name] != null ? MIN_GAP[name] : 0.025;
      if (lastAt[name] != null && now - lastAt[name] < gap) return;
      lastAt[name] = now;
      fn(now + 0.012);
    } catch (e) {
      warnOnce('audio-sfx-err-' + name, 'KN.Audio sfx failed', e);
    }
  }

  // ------------------------------------------------------------------ generative music
  // Chord voicings are semitone offsets from the mood root; melodies stay on the pentatonic scale.
  const MOODS = {
    calm:    { root: 48, scale: [0, 2, 4, 7, 9],  bpm: 68,  density: 0.36, prog: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], bright: 2400, pad: 0.026, swing: 0.06 },
    happy:   { root: 43, scale: [0, 2, 4, 7, 9],  bpm: 90,  density: 0.5,  prog: [[0, 4, 7], [7, 11, 14], [-3, 0, 4], [5, 9, 12]], bright: 3200, pad: 0.022, swing: 0.1 },
    sad:     { root: 45, scale: [0, 3, 5, 7, 10], bpm: 58,  density: 0.3,  prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], bright: 1700, pad: 0.03, swing: 0.02 },
    tense:   { root: 40, scale: [0, 3, 5, 7, 10], bpm: 82,  density: 0.42, prog: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [-2, 2, 5]],  bright: 1500, pad: 0.026, swing: 0, staccato: true },
    festive: { root: 50, scale: [0, 2, 4, 7, 9],  bpm: 106, density: 0.6,  prog: [[0, 4, 7], [7, 11, 14], [-3, 0, 4], [5, 9, 12]], bright: 3600, pad: 0.02, swing: 0.12, perc: true },
  };

  let schedTimer = null, nextTime = 0, step = 0, melIdx = 5, lastChord = -1;

  function startMusic() {
    if (!ctx || !musicOn || !unlocked || schedTimer) return;
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), now);
    musicBus.gain.linearRampToValueAtTime(0.55, now + 3);
    nextTime = now + 0.12; step = 0; lastChord = -1;
    schedTimer = setInterval(schedule, 90);
    schedule();
  }
  function stopMusic(fast) {
    if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
    if (!ctx || !musicBus) return;
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), now);
    musicBus.gain.linearRampToValueAtTime(0.0001, now + (fast ? 0.25 : 1.2));
  }

  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const M = MOODS[curMood] || MOODS.calm;
    const eighth = 60 / M.bpm / 2;
    // never let the scheduler fall far behind (e.g. after a suspended tab)
    if (nextTime < ctx.currentTime - 0.2) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.35) {
      const sw = (step % 2 === 1) ? eighth * M.swing : 0;
      playStep(M, step, nextTime + sw, eighth);
      nextTime += eighth;
      step++;
    }
  }

  function playStep(M, s, t, eighth) {
    const bar = Math.floor(s / 8);
    const inBar = s % 8;
    const chordI = Math.floor(bar / 2) % M.prog.length;
    const chord = M.prog[chordI];
    const dest = musicBus;

    // pad: a new chord every 2 bars
    if (s % 16 === 0 && chordI !== lastChord) {
      lastChord = chordI;
      const len = eighth * 16;
      chord.forEach((off, k) => {
        const f = mtof(M.root + 12 + off);
        [-7, 7].forEach((dt) => tone(f, t, { type: 'triangle', gain: M.pad * (k === 0 ? 1 : 0.8), attack: 1.4, hold: Math.max(0.2, len - 2.2),
          release: 2.2, dest, wet: 0.4, detune: dt, filter: { type: 'lowpass', freq: M.bright * 0.35 } }));
      });
    } else if (s % 16 === 0) {
      lastChord = -1;
    }
    // soft bass on beat 1 (and beat 3 for upbeat moods)
    if (inBar === 0 || (inBar === 4 && M.bpm > 85)) {
      tone(mtof(M.root + chord[0] - (chord[0] > 4 ? 12 : 0)), t, { type: 'sine', gain: inBar === 0 ? 0.075 : 0.05, attack: 0.02,
        release: M.staccato ? 0.5 : 1.4, dest, wet: 0.12 });
    }
    // melody: random walk on the pentatonic scale
    const strong = inBar % 2 === 0;
    const p = M.density * (strong ? 1.15 : 0.6);
    if (Math.random() < p) {
      const stepBy = pickOne([-2, -1, -1, 0, 1, 1, 2, 3, -3]);
      melIdx = Math.max(0, Math.min(10, melIdx + stepBy));
      if (melIdx === 0 || melIdx === 10) melIdx = 5;
      const oct = Math.floor(melIdx / M.scale.length);
      const deg = M.scale[melIdx % M.scale.length];
      const midi = M.root + 24 + oct * 12 + deg;
      const vel = (strong ? 0.042 : 0.03) * rnd(0.75, 1.05);
      pluck(mtof(midi), t, { gain: vel, dur: M.staccato ? 0.45 : rnd(0.8, 1.4), dest, wet: 0.38, bright: M.bright });
      // occasional echo a fifth/octave up, very soft
      if (Math.random() < 0.12) pluck(mtof(midi + 12), t + eighth * 3, { gain: vel * 0.4, dur: 0.9, dest, wet: 0.5, bright: M.bright });
    }
    // festive percussion: woodblock on the off-beats
    if (M.perc && inBar % 2 === 1 && Math.random() < 0.75) {
      tone(rnd(780, 820), t, { type: 'sine', gain: 0.02, attack: 0.001, release: 0.06, dest, wet: 0.08 });
    }
    if (M.perc && inBar === 0) noise(t, { type: 'highpass', freq: 6000, dur: 0.08, gain: 0.012, dest, wet: 0.1 });
  }

  // ------------------------------------------------------------------ public API
  function unlock() {
    if (!ensure()) return false;
    try {
      if (ctx.state === 'suspended') ctx.resume().catch(function () {});
      if (!unlocked) {
        // iOS: play a silent buffer inside the gesture
        const b = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource(); src.buffer = b; src.connect(ctx.destination); src.start(0);
      }
    } catch (e) { warnOnce('audio-unlock', 'KN.Audio unlock failed', e); }
    unlocked = true;
    if (musicOn) startMusic();
    return true;
  }

  function setSfx(on) {
    sfxOn = !!on;
    if (ctx && sfxBus) {
      const now = ctx.currentTime;
      sfxBus.gain.cancelScheduledValues(now);
      sfxBus.gain.setTargetAtTime(sfxOn ? 0.9 : 0, now, 0.03);
    }
  }

  function setMusic(on) {
    musicOn = !!on;
    if (!ctx) return;
    if (musicOn) startMusic(); else stopMusic(false);
  }

  function mood(name) {
    if (!MOODS[name]) { warnOnce('audio-mood-' + name, 'KN.Audio: unknown mood "' + name + '"'); name = 'calm'; }
    if (name === curMood) return;
    curMood = name;
    // jump to the next bar boundary so the new key/tempo lands quickly but musically
    if (ctx && schedTimer) {
      step = Math.ceil(step / 16) * 16;
      lastChord = -1;
      const now = ctx.currentTime;
      musicBus.gain.cancelScheduledValues(now);
      musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), now);
      musicBus.gain.linearRampToValueAtTime(0.3, now + 0.4);
      musicBus.gain.linearRampToValueAtTime(0.55, now + 2.6);
    }
  }

  function setVolume(v) {
    masterVol = Math.max(0, Math.min(1, +v || 0));
    if (ctx && master) master.gain.setTargetAtTime(masterVol, ctx.currentTime, 0.05);
  }

  function state() {
    return { supported: !!AC && !failed, unlocked, sfx: sfxOn, music: musicOn, mood: curMood };
  }

  // pause everything while the tab is hidden; resume afterwards
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    try {
      if (document.hidden) { if (ctx.state === 'running') ctx.suspend().catch(function () {}); }
      else if (unlocked) { ctx.resume().catch(function () {}); }
    } catch (e) { /* ignore */ }
  });

  KN.Audio = { unlock, sfx, setSfx, setMusic, mood, setVolume, state };
})();
