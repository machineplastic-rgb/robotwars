'use strict';
// ROBOTWARS — núcleo: pantalla apaisada pixel-perfect, bucle fijo a 60 Hz, escenas,
// entrada táctil multitoque + teclado, guardado y utilidades de dibujo.
window.G = window.G || {};
(function (G) {
  const scr = document.getElementById('screen');
  const sg = scr.getContext('2d', { alpha: false });
  const cv = document.createElement('canvas');
  const g = cv.getContext('2d', { alpha: false });
  G.scr = scr; G.cv = cv; G.g = g;
  G.W = 480; G.H = 270; G.P = 1; G.dpr = 1; G.portrait = false;
  G.safeL = 0; G.safeR = 0; G.safeT = 0; G.safeB = 0;
  G.time = 0; G.frame = 0;
  G.VERSION = 5; // súbelo en cada entrega (igual que el ZIP y el CACHE_NAME de sw.js)
  G.params = new URLSearchParams(location.search);

  // ---------- utilidades ----------
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  G.lerp = (a, b, t) => a + (b - a) * t;
  G.rand = (a, b) => a + Math.random() * (b - a);
  G.irand = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  G.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  G.chance = (p) => Math.random() < p;
  G.sign = (v) => (v < 0 ? -1 : 1);
  G.rng = function (seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  G.pad = (n, l) => String(Math.max(0, Math.floor(n))).padStart(l, '0');
  G.mkCanvas = function (w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return { c, x }; };
  G.vibrate = function (ms) { try { if (G.save.data.settings.vib && navigator.vibrate) navigator.vibrate(ms); } catch (e) { } };
  G.inRect = (x, y, r, pad) => { pad = pad || 0; return x >= r.x - pad && x < r.x + r.w + pad && y >= r.y - pad && y < r.y + r.h + pad; };

  const listeners = {};
  G.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
  G.emit = (ev, a) => (listeners[ev] || []).forEach((fn) => fn(a));

  G.err = function (e) {
    console.error(e);
    const d = document.getElementById('log');
    if (d) d.textContent += String((e && e.stack) || e) + '\n';
  };
  window.addEventListener('error', (e) => G.err(e.error || e.message));

  // ---------- dibujo (sobre el lienzo activo) ----------
  let X = g;
  const rnd = Math.round;
  G.target = (c) => { X = c; X.imageSmoothingEnabled = false; };
  G.ctx = () => X;
  G.R = function (x, y, w, h, c) { if (w <= 0 || h <= 0) return; X.fillStyle = c; X.fillRect(rnd(x), rnd(y), rnd(w), rnd(h)); };
  G.Px = function (x, y, c) { X.fillStyle = c; X.fillRect(rnd(x), rnd(y), 1, 1); };
  G.A = function (x, y, w, h, c, a) { X.globalAlpha = a; G.R(x, y, w, h, c); X.globalAlpha = 1; };
  G.ell = function (cx, cy, rx, ry, c, a) {
    X.globalAlpha = a === undefined ? 1 : a; X.fillStyle = c;
    const n = Math.floor(ry);
    for (let y = -n; y <= n; y++) {
      const k = 1 - (y * y) / (ry * ry); if (k < 0) continue;
      const hw = rnd(rx * Math.sqrt(k));
      X.fillRect(rnd(cx - hw), rnd(cy + y), hw * 2 + 1, 1);
    }
    X.globalAlpha = 1;
  };
  G.poly = function (pts, c) { // relleno por líneas: bordes nítidos
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
    X.fillStyle = c;
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const yy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) { const x0 = rnd(xs[i]), x1 = rnd(xs[i + 1]); if (x1 > x0) X.fillRect(x0, y, x1 - x0, 1); }
    }
  };
  G.polyO = function (pts, c, o) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) G.poly(pts.map((p) => [p[0] + dx, p[1] + dy]), o);
    G.poly(pts, c);
  };
  G.line = function (x0, y0, x1, y1, c) {
    x0 = rnd(x0); y0 = rnd(y0); x1 = rnd(x1); y1 = rnd(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy; X.fillStyle = c;
    for (let i = 0; i < 2000; i++) {
      X.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  // pieza con contorno, luz arriba/izquierda y sombra abajo/derecha. p = {o,d,b,l,h}
  G.part = function (x, y, w, h, p, top) {
    top = top || 0;
    G.R(x, y, w, h, p.o); G.R(x + 1, y + 1, w - 2, h - 2, p.b);
    if (top) { G.R(x + 1, y + 1, w - 2, top, p.l); G.R(x + 1, y + 1, w - 2, 1, p.h); } else G.R(x + 1, y + 1, w - 2, 1, p.l);
    G.R(x + 1, y + 1, 1, h - 2, p.l);
    G.R(x + w - 3, y + 1 + top, 2, h - 2 - top, p.d);
    G.R(x + 1, y + h - 2, w - 2, 1, p.d);
  };
  G.disc = function (cx, cy, r, c, a) { G.ell(cx, cy, r, r, c, a); };
  G.ring = function (cx, cy, r, c, a) {
    X.globalAlpha = a === undefined ? 1 : a; X.fillStyle = c;
    const n = Math.max(12, Math.floor(r * 6.3));
    let lx = null, ly = null;
    for (let i = 0; i <= n; i++) {
      const an = (i / n) * Math.PI * 2, px = rnd(cx + Math.cos(an) * r), py = rnd(cy + Math.sin(an) * r);
      if (px !== lx || py !== ly) X.fillRect(px, py, 1, 1);
      lx = px; ly = py;
    }
    X.globalAlpha = 1;
  };

  // ---------- pantalla: escala entera = píxeles nítidos ----------
  G.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cw = window.innerWidth, ch = window.innerHeight;
    const dw = Math.round(cw * dpr), dh = Math.round(ch * dpr);
    scr.width = dw; scr.height = dh;
    scr.style.width = cw + 'px'; scr.style.height = ch + 'px';
    G.portrait = ch > cw * 1.05;
    const P = Math.max(1, Math.floor(Math.min(dw, dh) / 250));
    G.P = P; G.dpr = dpr;
    G.W = Math.ceil(dw / P); G.H = Math.ceil(dh / P);
    cv.width = G.W; cv.height = G.H;
    g.imageSmoothingEnabled = false; sg.imageSmoothingEnabled = false;
    const cs = getComputedStyle(document.getElementById('safe'));
    const k = dpr / P;
    G.safeL = Math.ceil((parseFloat(cs.paddingLeft) || 0) * k);
    G.safeR = Math.ceil((parseFloat(cs.paddingRight) || 0) * k);
    G.safeT = Math.ceil((parseFloat(cs.paddingTop) || 0) * k);
    G.safeB = Math.ceil((parseFloat(cs.paddingBottom) || 0) * k);
    G.emit('resize');
    if (G.scene && G.scene.resize) G.scene.resize();
  };

  // ---------- efectos de pantalla ----------
  G.fx = { shake: 0, flash: 0, flashCol: '#ffffff', fade: 0 };
  G.shake = (v) => { G.fx.shake = Math.max(G.fx.shake, v); };
  G.flash = (v, c) => { G.fx.flash = Math.max(G.fx.flash, v); G.fx.flashCol = c || '#ffffff'; };
  function decay(dt) {
    const f = G.fx;
    f.shake = Math.max(0, f.shake - dt * 30);
    f.flash = Math.max(0, f.flash - dt * 4);
    f.fade = Math.max(0, f.fade - dt * 4);
  }
  function present() {
    const f = G.fx, P = G.P;
    let sx = 0, sy = 0;
    if (f.shake > 0.5) { sx = rnd((Math.random() - 0.5) * f.shake) * P; sy = rnd((Math.random() - 0.5) * f.shake) * P; }
    if (sx || sy) { sg.fillStyle = '#000'; sg.fillRect(0, 0, scr.width, scr.height); }
    sg.drawImage(cv, 0, 0, G.W, G.H, sx, sy, G.W * P, G.H * P);
    if (f.flash > 0) { sg.globalAlpha = Math.min(1, f.flash); sg.fillStyle = f.flashCol; sg.fillRect(0, 0, scr.width, scr.height); sg.globalAlpha = 1; }
    if (f.fade > 0) { sg.globalAlpha = Math.min(1, f.fade); sg.fillStyle = '#000'; sg.fillRect(0, 0, scr.width, scr.height); sg.globalAlpha = 1; }
  }

  // ---------- escenas ----------
  G.scenes = {};
  G.scene = null;
  G.go = function (name, params) {
    const prev = G.scene;
    if (prev && prev.exit) prev.exit();
    const sc = G.scenes[name];
    if (!sc) { G.err('escena? ' + name); return; }
    G.input.ptrs.clear();
    G.scene = sc; G.sceneName = name; sc.t = 0;
    G.fx.fade = 1;
    if (sc.enter) sc.enter(params || {});
  };

  // ---------- bucle con paso fijo ----------
  const STEP = 1 / 60;
  G.STEP = STEP;
  let acc = 0, last = performance.now();
  function tick(dt) {
    G.time += dt; G.frame++;
    decay(dt);
    if (!G.portrait) {
      const sc = G.scene;
      if (sc) { sc.t = (sc.t || 0) + dt; if (sc.update) sc.update(dt); }
    }
    G.input.pressed.clear();
  }
  function render() {
    G.target(g); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    try {
      if (G.portrait) G.drawRotate();
      else if (G.scene && G.scene.draw) G.scene.draw();
    } catch (e) { G.err(e); }
    present();
  }
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.25) dt = 0.25; if (dt < 0) dt = 0;
    acc += dt;
    let n = 0;
    try { while (acc >= STEP && n < 6) { tick(STEP); acc -= STEP; n++; } } catch (e) { G.err(e); acc = 0; }
    if (n === 6) acc = 0;
    render();
  }
  G.start = function () { requestAnimationFrame((t) => { last = t; frame(t); }); };
  G.simulate = function (sec) { const n = Math.round(sec / STEP); for (let i = 0; i < n; i++) tick(STEP); render(); };
  G.renderNow = render;

  // ---------- entrada ----------
  G.input = { ptrs: new Map(), keys: new Set(), pressed: new Set() };
  function toLogical(e) {
    const r = scr.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * G.dpr) / G.P, y: ((e.clientY - r.top) * G.dpr) / G.P };
  }
  scr.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (G.audio) G.audio.unlock();
    try { scr.setPointerCapture(e.pointerId); } catch (_) { }
    if (G.portrait) return;
    const p = toLogical(e);
    G.input.ptrs.set(e.pointerId, p);
    const sc = G.scene; if (sc && sc.down) sc.down(e.pointerId, p.x, p.y);
  }, { passive: false });
  scr.addEventListener('pointermove', (e) => {
    if (!G.input.ptrs.has(e.pointerId)) return;
    const p = toLogical(e);
    G.input.ptrs.set(e.pointerId, p);
    const sc = G.scene; if (sc && sc.drag) sc.drag(e.pointerId, p.x, p.y);
  });
  const up = (e) => {
    if (!G.input.ptrs.has(e.pointerId)) return;
    G.input.ptrs.delete(e.pointerId);
    const p = toLogical(e);
    const sc = G.scene; if (sc && sc.up) sc.up(e.pointerId, p.x, p.y);
  };
  scr.addEventListener('pointerup', up);
  scr.addEventListener('pointercancel', up);
  scr.addEventListener('lostpointercapture', up);
  window.addEventListener('keydown', (e) => {
    if (G.audio) G.audio.unlock();
    if (!e.repeat) {
      G.input.keys.add(e.code); G.input.pressed.add(e.code);
      const sc = G.scene; if (sc && sc.key && !G.portrait) sc.key(e.code);
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => G.input.keys.delete(e.code));
  window.addEventListener('blur', () => G.input.keys.clear());
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('resize', () => G.resize());
  window.addEventListener('orientationchange', () => setTimeout(G.resize, 250));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (G.scene && G.scene.blur) G.scene.blur(); if (G.audio) G.audio.suspend(); }
    else if (G.audio) G.audio.resume();
  });

  // ---------- guardado ----------
  const KEY = 'robotwars.save.v1';
  G.save = {
    data: null,
    defaults() { return { beaten: {}, best: 0, villain: 0, dif: 0, shop: { wallet: 0, colors: {}, weapons: ['rayo'], weapon: 'rayo', flyLv: 0 }, settings: { music: 1, sfx: 1, vib: 1 } }; },
    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
      const def = this.defaults();
      if (!d || typeof d !== 'object') d = def;
      d.settings = Object.assign(def.settings, d.settings || {});
      d.beaten = d.beaten || {};
      d.best = d.best || 0;
      d.villain = G.clamp(d.villain || 0, 0, 4);
      d.dif = G.clamp(d.dif || 0, 0, 2);
      d.shop = Object.assign(def.shop, d.shop || {});
      if (!Array.isArray(d.shop.weapons) || !d.shop.weapons.length) d.shop.weapons = ['rayo'];
      if (d.shop.weapons.indexOf(d.shop.weapon) < 0) d.shop.weapon = 'rayo';
      d.shop.flyLv = G.clamp(d.shop.flyLv || 0, 0, 3);
      d.shop.wallet = Math.max(0, Math.floor(d.shop.wallet || 0));
      d.shop.colors = d.shop.colors || {};
      this.data = d;
    },
    write() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { } },
  };
})(window.G);
