'use strict';
// Sonido 100 % sintetizado por código (WebAudio): efectos + música chiptune original.
(function (G) {
  const A = G.audio = { ctx: null, cur: null, pending: null };
  let ctx = null, master, sfxG, musG, noiseBuf;
  const lastPlay = {};

  A.unlock = function () {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { ctx = A.ctx = new AC(); } catch (e) { return; }
      master = ctx.createGain(); master.gain.value = 0.9;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      master.connect(comp); comp.connect(ctx.destination);
      sfxG = ctx.createGain(); sfxG.connect(master);
      musG = ctx.createGain(); musG.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      A.apply();
      setInterval(sched, 25);
      if (A.pending) { const p = A.pending; A.pending = null; A.cur = null; A.play(p); }
    }
    if (ctx.state === 'suspended') ctx.resume();
  };
  A.suspend = () => { if (ctx) ctx.suspend(); };
  A.resume = () => { if (ctx) ctx.resume(); };
  A.apply = function () {
    if (!ctx) return;
    const s = G.save.data.settings;
    sfxG.gain.value = s.sfx ? 0.55 : 0;
    musG.gain.value = s.music ? 0.26 : 0;
  };

  function osc(type, f0, f1, t, dur, vol, dest) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(vol, t + 0.005);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(dest || sfxG);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, vol, type, f0, f1, q, dest) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'lowpass';
    f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    f.Q.value = q || 0.8;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(dest || sfxG);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
  }

  const S = {
    punch(t) { noise(t, 0.09, 0.5, 'bandpass', 900, 380, 1.2); osc('sine', 150, 50, t, 0.13, 0.7); },
    hit(t) { noise(t, 0.2, 0.75, 'lowpass', 2600, 260); osc('square', 120, 40, t, 0.16, 0.22); osc('sine', 95, 30, t, 0.22, 0.75); },
    heavy(t) { noise(t, 0.35, 0.9, 'lowpass', 3000, 120); osc('sine', 80, 22, t, 0.4, 0.9); osc('square', 200, 40, t, 0.2, 0.2); },
    whoosh(t) { noise(t, 0.16, 0.22, 'bandpass', 420, 1900, 2); },
    jump(t) { osc('square', 170, 420, t, 0.14, 0.1); noise(t, 0.12, 0.15, 'bandpass', 800, 2400, 2); },
    land(t) { osc('sine', 95, 28, t, 0.3, 0.8); noise(t, 0.3, 0.4, 'lowpass', 600, 70); },
    step(t) { osc('sine', 75, 38, t, 0.1, 0.32); noise(t, 0.08, 0.12, 'lowpass', 400, 80); },
    crumble(t) {
      noise(t, 0.8, 0.6, 'lowpass', 1000, 110); osc('sine', 60, 24, t, 0.55, 0.45);
      for (let i = 0; i < 7; i++) noise(t + i * 0.07 + Math.random() * 0.04, 0.06, 0.28, 'bandpass', 900 + Math.random() * 1800, null, 3);
    },
    crunch(t) { noise(t, 0.12, 0.35, 'bandpass', 1400, 500, 2); osc('square', 220, 80, t, 0.08, 0.08); },
    boom(t) { noise(t, 0.9, 0.85, 'lowpass', 2600, 55); osc('sine', 72, 20, t, 0.75, 0.85); },
    shot(t) { osc('square', 680, 90, t, 0.12, 0.16); noise(t, 0.16, 0.45, 'lowpass', 3000, 300); osc('sine', 120, 40, t, 0.15, 0.5); },
    missile(t) { osc('sawtooth', 260, 900, t, 0.3, 0.08); noise(t, 0.32, 0.22, 'bandpass', 2200, 600, 2); },
    gun(t) { for (let i = 0; i < 3; i++) { noise(t + i * 0.065, 0.045, 0.22, 'highpass', 2600); osc('square', 300, 120, t + i * 0.065, 0.03, 0.05); } },
    xform(t) {
      [0, 4, 7, 12, 16, 19].forEach((s, i) => { osc('square', 196 * Math.pow(2, s / 12), null, t + i * 0.045, 0.07, 0.09); noise(t + i * 0.045, 0.025, 0.25, 'highpass', 3500); });
      osc('sawtooth', 70, 260, t, 0.32, 0.07);
    },
    xback(t) {
      [19, 16, 12, 7, 4, 0].forEach((s, i) => { osc('square', 196 * Math.pow(2, s / 12), null, t + i * 0.04, 0.06, 0.08); noise(t + i * 0.04, 0.025, 0.22, 'highpass', 3500); });
    },
    fly(t) { noise(t, 0.4, 0.2, 'bandpass', 600, 2400, 1.5); osc('sawtooth', 110, 240, t, 0.35, 0.05); },
    ko(t) { osc('square', 620, 45, t, 1.0, 0.22); noise(t, 1.0, 0.45, 'lowpass', 1600, 90); },
    heal(t) { osc('sine', 660, 1320, t, 0.14, 0.06); },
    sel(t) { osc('square', 660, null, t, 0.06, 0.1); },
    ok(t) { osc('square', 523, null, t, 0.07, 0.11); osc('square', 784, null, t + 0.07, 0.11, 0.11); },
    back(t) { osc('square', 392, 262, t, 0.1, 0.1); },
    fight(t) { [0, 0.18].forEach((d) => { osc('square', 220, null, t + d, 0.14, 0.14); osc('square', 330, null, t + d, 0.14, 0.1); noise(t + d, 0.12, 0.4, 'lowpass', 1800); }); osc('square', 440, null, t + 0.36, 0.45, 0.14); osc('square', 660, null, t + 0.36, 0.45, 0.1); },
    win(t) { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => osc('square', f, null, t + i * 0.11, i === 5 ? 0.5 : 0.16, 0.12)); },
    lose(t) { [392, 349, 311, 262, 196].forEach((f, i) => osc('triangle', f, null, t + i * 0.2, 0.3, 0.3)); },
    alarm(t) { for (let i = 0; i < 2; i++) { osc('square', 880, 660, t + i * 0.22, 0.2, 0.08); } },
  };
  A.sfx = function (name) {
    if (!ctx || !G.save.data.settings.sfx) return;
    const now = ctx.currentTime;
    if (lastPlay[name] && now - lastPlay[name] < 0.035) return;
    lastPlay[name] = now;
    try { S[name](now + 0.005); } catch (e) { }
  };

  // ---------- música ----------
  const SC = {
    minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], phryg: [0, 1, 4, 5, 7, 8, 10],
    harm: [0, 2, 3, 5, 7, 8, 11], major: [0, 2, 4, 5, 7, 9, 11],
  };
  // compositor determinista: progresión + ritmo → melodía de notas del acorde
  function compose(o) {
    const r = G.rng(o.seed);
    const bars = o.prog.length, lead = [], bass = [];
    let cur = 7;
    for (let b = 0; b < bars; b++) {
      const ch = o.prog[b];
      const rh = o.rhythm[b % o.rhythm.length];
      for (let i = 0; i < 16; i++) {
        if (rh[i] === 'x') {
          const tones = [ch, ch + 2, ch + 4, ch + 7, ch + 9, ch + 11].filter((t) => Math.abs(t - cur) <= 4);
          const pass = r() < 0.25 ? cur + (r() < 0.5 ? 1 : -1) : null;
          cur = pass !== null ? pass : (tones.length ? tones[Math.floor(r() * tones.length)] : ch + 7);
          if (cur < 3) cur += 7; if (cur > 13) cur -= 7;
          lead.push(cur);
        } else lead.push(null);
        const bp = o.bassPat[i];
        bass.push(bp === 'r' ? ch : bp === 'o' ? ch + 7 : bp === 'f' ? ch + 4 : null);
      }
    }
    return { bpm: o.bpm, root: o.root, scale: SC[o.scale], lead, bass, drums: o.drums, len: bars * 16, lw: o.lw || 'square', bw: o.bw || 'triangle' };
  }
  const T = (s) => s.split('').map((c) => (c === '.' ? null : c === 'b' ? 'b' : +c));
  const SONGS = {
    title: {
      bpm: 126, root: 45, scale: SC.minor, len: 64, lw: 'square', bw: 'triangle',
      lead: [4, null, null, null, 4, null, 3, null, 4, null, null, null, 2, null, null, null,
        0, null, null, null, 2, null, 3, null, 4, null, null, null, null, null, null, null,
        5, null, null, null, 5, null, 4, null, 3, null, null, null, 4, null, 5, null,
        4, null, null, null, 2, null, null, null, 0, null, null, null, null, null, null, null],
      bass: [0, null, 0, 0, 0, null, 0, null, 0, null, 0, 0, 7, null, 6, null,
        5, null, 5, 5, 5, null, 5, null, 6, null, 6, 6, 6, null, 4, null],
      drums: 'k.h.s.h.k.k.s.h.',
    },
    select: compose({ seed: 7, bpm: 112, root: 40, scale: 'dorian', prog: [0, 3, 4, 3], rhythm: ['x..x..x...x.x...', 'x...x..x..x.....'], bassPat: 'r..r..o.r..r..o.', drums: 'k...s..hk.k.s...' }),
    ciudad: compose({ seed: 11, bpm: 150, root: 45, scale: 'minor', prog: [0, 5, 3, 4, 0, 5, 6, 4], rhythm: ['x.x.x..xx.x.x...', 'x..x..x.x.xx....'], bassPat: 'r.ror.ror.ror.ro', drums: 'k.hks.h.k.hks.hh' }),
    puerto: compose({ seed: 23, bpm: 140, root: 38, scale: 'dorian', prog: [0, 3, 0, 4, 0, 3, 5, 4], rhythm: ['x..x.x..x.x.x...', 'x.x...x.x..x.x..'], bassPat: 'r..rr.o.r..rr.o.', drums: 'k.h.s.hkk.h.s.h.' }),
    desierto: compose({ seed: 37, bpm: 136, root: 40, scale: 'phryg', prog: [0, 1, 0, 6, 0, 1, 3, 4], rhythm: ['x.xxx...x.x.xx..', 'x...x.x.x.xx....'], bassPat: 'r.rr..o.r.rr..f.', drums: 'k..hs.k.k..hs.hh' }),
    nieve: compose({ seed: 41, bpm: 128, root: 47, scale: 'minor', prog: [0, 5, 2, 6, 0, 5, 3, 4], rhythm: ['x...x.x.x...x.x.', 'x.x.x...x...x...'], bassPat: 'r...r.o.r...r.o.', drums: 'k.h.s.h.k.hks.h.' }),
    fabrica: compose({ seed: 53, bpm: 156, root: 36, scale: 'minor', prog: [0, 0, 5, 4, 0, 0, 6, 4], rhythm: ['x.x.xx.x.x.xx.x.', 'xx.x.x..x.x.x...'], bassPat: 'rrorrrorrrorrror', drums: 'kkhks.hkk.hks.hh', bw: 'square' }),
    espacio: compose({ seed: 67, bpm: 146, root: 42, scale: 'harm', prog: [0, 5, 3, 4, 0, 5, 1, 4], rhythm: ['x.x.x.x.x.x.xx..', 'x..x..x.x.x.x.x.'], bassPat: 'r.o.r.o.r.o.r.o.', drums: 'k.hhs.hkk.hhs.hk' }),
  };
  A.SONGS = SONGS;
  let step = 0, nextT = 0;
  function freq(s, deg, oct) {
    const n = s.scale.length, o = Math.floor(deg / n), i = ((deg % n) + n) % n;
    return 440 * Math.pow(2, (s.root + (oct + o) * 12 + s.scale[i] - 69) / 12);
  }
  function tone(type, f, t, dur, vol) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(vol, t + 0.008);
    gn.gain.setValueAtTime(vol, t + dur * 0.6); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(musG); o.start(t); o.stop(t + dur + 0.03);
  }
  function playStep(s, i, t, spb) {
    const b = s.bass[i % s.bass.length];
    if (b !== null && b !== undefined) tone(s.bw, freq(s, b, 0), t, spb * 1.7, s.bw === 'square' ? 0.18 : 0.42);
    const l = s.lead[i % s.lead.length];
    if (l !== null && l !== undefined) {
      let d = 1; while (d < 4 && s.lead[(i + d) % s.lead.length] === null) d++;
      tone(s.lw, freq(s, l, 2), t, spb * d * 0.92, 0.11);
      tone('triangle', freq(s, l, 1), t, spb * d * 0.92, 0.05);
    }
    const dc = s.drums[i % 16];
    if (dc === 'k') { osc('sine', 130, 40, t, 0.16, 0.7, musG); }
    else if (dc === 's') { noise(t, 0.14, 0.4, 'highpass', 1200, null, 0.7, musG); osc('triangle', 220, 120, t, 0.06, 0.2, musG); }
    else if (dc === 'h') { noise(t, 0.035, 0.18, 'highpass', 6500, null, 0.7, musG); }
  }
  function sched() {
    if (!ctx || !A.cur || ctx.state !== 'running') return;
    const s = SONGS[A.cur]; if (!s) return;
    const spb = 60 / s.bpm / 4;
    if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
    while (nextT < ctx.currentTime + 0.15) {
      if (G.save.data.settings.music) playStep(s, step, nextT, spb);
      nextT += spb; step = (step + 1) % s.len;
    }
  }
  A.play = function (name) {
    if (!ctx) { A.pending = name; return; }
    if (A.cur === name) return;
    A.cur = name; step = 0; nextT = ctx.currentTime + 0.08;
  };
  A.stop = function () { A.cur = null; A.pending = null; };
})(window.G);
