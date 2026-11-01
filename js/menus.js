'use strict';
// Menús: portada, elegir villano, elegir lugar, VS, resultado, final y aviso de girar el móvil.
(function (G) {
  const R = G.R, A = G.A;
  const ell = (...a) => G.ell(...a);
  const GOLD = ['#fff6c2', '#ffe266', '#ffd23a', '#ffb020', '#ff8a1a', '#ff6a1a', '#e04a1a'];
  const FIRE = ['#ffffff', '#fff6c2', '#ffe266', '#ffd23a', '#ffb020', '#ff8a1a', '#ff5a1a'];

  // ---------- utilidades de interfaz ----------
  G.button = function (b, primary, hover) {
    const c1 = primary ? '#ffd23a' : '#3a2e52', c2 = primary ? '#b87d0c' : '#1e1630', tc = primary ? '#2a1a00' : '#ffffff';
    R(b.x - 1, b.y - 1, b.w + 2, b.h + 3, '#000');
    R(b.x, b.y, b.w, b.h, c2); R(b.x, b.y, b.w, b.h - 2, c1);
    R(b.x + 1, b.y + 1, b.w - 2, 1, primary ? '#fff6c2' : '#5a4a7a');
    G.text(b.label, b.x + b.w / 2, b.y + Math.round((b.h - 2) / 2) - 3, { c: tc, al: 'c' });
  };
  function bgGrid(t, c1, c2) {
    const W = G.W, H = G.H;
    R(0, 0, W, H, c1);
    const off = Math.floor((t * 12) % 16);
    for (let y = -16 + off; y < H; y += 16) A(0, y, W, 1, c2, 0.5);
    for (let x = 0; x < W; x += 16) A(x, 0, 1, H, c2, 0.5);
  }
  function backBtn() { return { x: G.safeL + 6, y: 6 + G.safeT, w: 20, h: 14, label: '◄' }; }
  G.run = null;

  // ---------- portada ----------
  const T = G.scenes.title = {};
  T.enter = function () { G.audio.play('title'); T.thumb = G.stageThumb(0); };
  T.down = function () { G.audio.unlock(); G.audio.sfx('ok'); G.go('select'); };
  T.key = function (k) { if (k === 'Enter' || k === 'Space') T.down(); };
  T.draw = function () {
    const W = G.W, H = G.H, g = G.ctx(), t = T.t;
    const th = T.thumb, sc = Math.max(1, H / 330);
    const ox = -((t * 10) % (800 * sc - W > 0 ? 800 * sc - W : 1));
    g.drawImage(th, 0, 0, 800, 330, Math.round(ox), Math.round((H - 330 * sc) / 2), Math.round(800 * sc), Math.round(330 * sc));
    A(0, 0, W, H, '#140a24', 0.55);
    for (let i = 0; i < 6; i++) A(0, H - 60 + i * 10, W, 10, '#000', 0.1 * i);
    const bob = Math.round(Math.sin(t * 2) * 2);
    G.drawSprite('demoledor', Math.floor(t * 2) % 2 ? 'idle1' : 'idle0', 1, Math.round(W * 0.2), H + 70 + bob, 2);
    G.drawSprite('voltar', Math.floor(t * 2 + 1) % 2 ? 'idle1' : 'idle0', -1, Math.round(W * 0.8), H + 70 - bob, 2);
    const s = W < 380 ? 4 : 5;
    G.text('ROBOTWARS', W / 2 + 3, 26 + 4, { s, c: '#2a0a3a', al: 'c' });
    G.text('ROBOTWARS', W / 2, 26, { s, c: FIRE, o: '#000', al: 'c' });
    G.text('¡ERES EL VILLANO! DESTRUYE LA CIUDAD', W / 2, 26 + 7 * s + 10, { c: '#c99bff', o: '#000', al: 'c' });
    if (Math.floor(t * 2) % 2 === 0) G.text('TOCA PARA EMPEZAR', W / 2, H - 34, { s: 2, c: '#ffffff', o: '#000', al: 'c' });
    G.text('V' + G.VERSION, W - G.safeR - 8, 8 + G.safeT, { s: 2, c: '#ffffff', o: '#000', al: 'r' });
  };

  // ---------- elegir villano ----------
  const SEL = G.scenes.select = {};
  SEL.enter = function () { SEL.sel = G.save.data.villain || 0; G.audio.play('select'); G.VILLAINS.forEach((v, i) => G.preload(G.villainId(i))); };
  function tallerBtn() { const b = goBtn(); return { x: b.x - 76, y: b.y, w: 68, h: 20, label: 'TALLER' }; }
  function cards() {
    const W = G.W, H = G.H, n = G.VILLAINS.length, gap = 4, x0 = G.safeL + 6, x1 = W - G.safeR - 6;
    const cw = Math.floor((x1 - x0 - gap * (n - 1)) / n), top = 30, ch = H - top - 34;
    return G.VILLAINS.map((v, i) => ({ x: x0 + i * (cw + gap), y: top, w: cw, h: ch, v, i }));
  }
  function goBtn() { const W = G.W, H = G.H, w = 120; return { x: Math.round(W / 2 - w / 2), y: H - 26 - G.safeB, w, h: 20, label: '¡A DESTRUIR!' }; }
  SEL.down = function (id, x, y) {
    if (G.inRect(x, y, backBtn(), 4)) { G.audio.sfx('back'); G.go('title'); return; }
    if (G.inRect(x, y, goBtn(), 3)) { pick(); return; }
    if (G.inRect(x, y, tallerBtn(), 3)) { G.save.data.villain = SEL.sel; G.save.write(); G.audio.sfx('ok'); G.go('taller'); return; }
    for (const c of cards()) if (G.inRect(x, y, c)) { if (SEL.sel === c.i && SEL.t > 0.3) { pick(); return; } SEL.sel = c.i; SEL.selT = SEL.t; G.audio.sfx('sel'); }
  };
  function pick() { G.save.data.villain = SEL.sel; G.save.write(); G.audio.sfx('ok'); G.go('map'); }
  SEL.key = function (k) {
    const n = G.VILLAINS.length;
    if (k === 'ArrowLeft' || k === 'KeyA') { SEL.sel = (SEL.sel + n - 1) % n; G.audio.sfx('sel'); }
    if (k === 'ArrowRight' || k === 'KeyD') { SEL.sel = (SEL.sel + 1) % n; G.audio.sfx('sel'); }
    if (k === 'Enter' || k === 'Space') pick();
    if (k === 'Escape') G.go('title');
  };
  SEL.draw = function () {
    const W = G.W, H = G.H, t = SEL.t;
    bgGrid(t, '#1a1030', '#3a2a5a');
    G.text('ELIGE TU VILLANO', W / 2, 9 + G.safeT, { s: 2, c: GOLD, o: '#000', al: 'c' });
    G.button(backBtn(), false);
    for (const c of cards()) {
      const sp = G.ROB[c.v], on = SEL.sel === c.i;
      R(c.x, c.y, c.w, c.h, on ? '#000' : '#00000066');
      R(c.x + 1, c.y + 1, c.w - 2, c.h - 2, on ? '#3a2a5a' : '#241838');
      if (on) { const pulse = Math.floor(t * 4) % 2 ? '#ffd23a' : '#ffb020'; R(c.x, c.y, c.w, 1, pulse); R(c.x, c.y + c.h - 1, c.w, 1, pulse); R(c.x, c.y, 1, c.h, pulse); R(c.x + c.w - 1, c.y, 1, c.h, pulse); }
      const cx = c.x + Math.round(c.w / 2) - 4, fy = c.y + Math.min(c.h - 52, 128);
      ell(cx + 4, fy, 24, 4, '#000', 0.35);
      const showVeh = on && Math.floor((t - (SEL.selT || 0)) / 1.4) % 2 === 1;
      const vid = G.villainId(c.i);
      if (showVeh) G.drawSprite(vid, 'veh' + (Math.floor(t * 8) % 2), 1, cx - 2, fy);
      else G.drawSprite(vid, on ? (Math.floor(t * 2) % 2 ? 'idle1' : 'idle0') : 'idle0', 1, cx, fy);
      if (!on) A(c.x + 1, c.y + 1, c.w - 2, c.h - 2, '#140a24', 0.35);
      let y = fy + 4;
      G.text(sp.name, c.x + c.w / 2, y, { c: on ? '#ffe266' : '#ffffff', o: '#000', al: 'c' }); y += 9;
      G.text(G.VEHNAME[sp.veh], c.x + c.w / 2, y, { c: '#c99bff', al: 'c' }); y += 10;
      const st = [['FUERZA', sp.stats.str], ['VELOC.', sp.stats.spd], ['DEFENSA', sp.stats.def], ['VUELO', sp.stats.fly]];
      const lx = c.x + 4, px = c.x + c.w - 4 - 5 * 5;
      for (const [lab, v] of st) {
        if (y > c.y + c.h - 8) break;
        G.text(c.w >= 84 ? lab : lab.slice(0, 3), lx, y, { c: '#a898c8' });
        for (let i = 0; i < 5; i++) { R(px + i * 5, y + 1, 4, 5, '#000'); R(px + i * 5, y + 1, 3, 4, i < v ? '#5effc0' : '#3a2e52'); }
        y += 8;
      }
    }
    const b = goBtn(); G.button(b, true);
    G.button(tallerBtn(), false);
    G.text(G.ROB[G.VILLAINS[SEL.sel]].desc, W / 2, b.y - 9, { c: '#ffffff', o: '#000', al: 'c' });
    G.text('PUNTOS ' + G.fmt(G.save.data.shop.wallet), W - G.safeR - 6, 11 + G.safeT, { c: '#ffe266', o: '#000', al: 'r' });
  };

  // ---------- elegir lugar ----------
  const MAP = G.scenes.map = {};
  MAP.enter = function () { G.audio.play('select'); MAP.thumbs = G.STAGES.map((s, i) => G.stageThumb(i)); };
  function tiles() {
    const W = G.W, H = G.H, gap = 6, x0 = G.safeL + 8, x1 = W - G.safeR - 8, top = 28, bottom = H - 30 - G.safeB;
    const tw = Math.floor((x1 - x0 - gap * 2) / 3);
    const th = Math.min(Math.floor((bottom - top - gap) / 2) - 20, Math.floor(tw * 0.5));
    const rowH = th + 22;
    const oy = top + Math.max(0, Math.floor((bottom - top - rowH * 2 - gap) / 2));
    return G.STAGES.map((s, i) => ({ x: x0 + (i % 3) * (tw + gap), y: oy + Math.floor(i / 3) * (rowH + gap), w: tw, h: th, i, s }));
  }
  const DIFS = ['FÁCIL', 'NORMAL', 'DIFÍCIL'];
  function difBtns() {
    const W = G.W, H = G.H, bw = 58, gap = 6, lw = 54;
    const x0 = Math.round(W / 2 - (lw + bw * 3 + gap * 2) / 2) + lw;
    return DIFS.map((label, i) => ({ i, label, x: x0 + i * (bw + gap), y: H - 24 - G.safeB, w: bw, h: 17 }));
  }
  MAP.down = function (id, x, y) {
    if (G.inRect(x, y, backBtn(), 4)) { G.audio.sfx('back'); G.go('select'); return; }
    for (const b of difBtns()) if (G.inRect(x, y, b, 3)) { G.save.data.dif = b.i; G.save.write(); G.audio.sfx('sel'); return; }
    for (const tl of tiles()) if (G.inRect(x, y, { x: tl.x, y: tl.y, w: tl.w, h: tl.h + 20 })) { startRun(tl.i); return; }
  };
  MAP.key = function (k) { if (k === 'Escape') G.go('select'); if (k === 'Enter') startRun(0); };
  function startRun(i) {
    G.audio.sfx('ok');
    const order = []; for (let k = 0; k < 6; k++) order.push((i + k) % 6);
    G.run = { villain: G.save.data.villain || 0, order, idx: 0, score: 0 };
    G.go('vs');
  }
  MAP.draw = function () {
    const W = G.W, t = MAP.t, g = G.ctx();
    bgGrid(t, '#10182a', '#22304a');
    G.text('ELIGE UN LUGAR', W / 2, 9 + G.safeT, { s: 2, c: GOLD, o: '#000', al: 'c' });
    G.button(backBtn(), false);
    const beaten = G.save.data.beaten;
    for (const tl of tiles()) {
      R(tl.x - 2, tl.y - 2, tl.w + 4, tl.h + 4, '#000'); R(tl.x - 1, tl.y - 1, tl.w + 2, tl.h + 2, '#ffffff');
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      const sw = 330 * (tl.w / tl.h);
      g.drawImage(MAP.thumbs[tl.i], Math.max(0, 400 - sw / 2), 0, Math.min(800, sw), 330, tl.x, tl.y, tl.w, tl.h);
      g.imageSmoothingEnabled = false;
      if (beaten[tl.i]) { A(tl.x, tl.y, tl.w, tl.h, '#000', 0.35); G.text('✓', tl.x + tl.w - 10, tl.y + 3, { s: 2, c: '#5effc0', o: '#000' }); }
      G.text(tl.s.name, tl.x + tl.w / 2, tl.y + tl.h + 4, { c: '#ffffff', o: '#000', al: 'c' });
      G.text('RIVAL: ' + G.ROB[tl.s.hero].name, tl.x + tl.w / 2, tl.y + tl.h + 13, { c: '#ffb020', o: '#000', al: 'c' });
    }
    const db = difBtns();
    G.text('ENEMIGO:', db[0].x - 6, db[0].y + 5, { c: '#ffffff', o: '#000', al: 'r' });
    for (const b of db) G.button(b, (G.save.data.dif || 0) === b.i);
  };

  // ---------- VS ----------
  const VS = G.scenes.vs = {};
  VS.enter = function () {
    const r = G.run; VS.stage = r.order[r.idx]; VS.level = r.idx + 1;
    VS.v = G.villainId(r.villain); VS.h = G.STAGES[VS.stage].hero;
    G.preload(VS.v); G.preload(VS.h);
    G.audio.play(G.STAGES[VS.stage].music); G.audio.sfx('fight');
  };
  function goFight() { G.go('fight', { stage: VS.stage, villain: G.run.villain, level: VS.level, score: G.run.score }); }
  VS.down = function () { if (VS.t > 0.4) goFight(); };
  VS.key = function () { if (VS.t > 0.4) goFight(); };
  VS.update = function () { if (VS.t > 3.2) goFight(); };
  VS.draw = function () {
    const W = G.W, H = G.H, t = VS.t;
    const vs = G.ROB[VS.v], hs = G.ROB[VS.h];
    R(0, 0, W, H, '#0c0814');
    const slant = 40, mid = W / 2;
    G.poly([[0, 0], [mid + slant / 2, 0], [mid - slant / 2, H], [0, H]], vs.main.d);
    G.poly([[mid + slant / 2 + 3, 0], [W, 0], [W, H], [mid - slant / 2 + 3, H]], hs.main.d);
    for (let y = (t * 60) % 8; y < H; y += 8) { A(0, y, W, 2, '#000', 0.12); }
    const k = Math.min(1, t * 3);
    G.drawSprite(VS.v, 'idle0', 1, Math.round(-80 + k * (W * 0.24 + 80)), H + 60, 2);
    G.drawSprite(VS.h, 'idle0', -1, Math.round(W + 80 - k * (W * 0.24 + 80)), H + 60, 2);
    G.text('NIVEL ' + VS.level + ' · ' + G.STAGES[VS.stage].name, W / 2, 8 + G.safeT, { s: 2, c: '#ffffff', o: '#000', al: 'c' });
    G.text('ENEMIGO: ' + DIFS[G.save.data.dif || 0], W / 2, 28 + G.safeT, { c: '#fff3a0', o: '#000', al: 'c' });
    G.text(vs.name, G.safeL + 10, 30, { s: 2, c: '#ffffff', o: '#000' });
    G.text('TÚ', G.safeL + 10, 48, { c: '#c99bff', o: '#000' });
    G.text(hs.name, W - G.safeR - 10, 30, { s: 2, c: '#ffffff', o: '#000', al: 'r' });
    G.text('RIVAL ' + VS.level + ' DE 6', W - G.safeR - 10, 48, { c: '#ffb020', o: '#000', al: 'r' });
    const s = t < 0.5 ? 7 : 5;
    G.text('VS', W / 2, H / 2 - s * 4, { s, c: FIRE, o: '#000', al: 'c' });
  };

  // ---------- resultado ----------
  const RES = G.scenes.result = {};
  RES.enter = function (p) {
    RES.p = p;
    const r = G.run;
    p.earned = Math.max(0, Math.round(p.earned || 0));
    G.save.data.shop.wallet += p.earned; G.save.write();
    if (p.win) {
      r.score = p.score;
      G.save.data.beaten[p.stage] = 1;
      if (p.score > G.save.data.best) G.save.data.best = p.score;
      G.save.write();
      G.audio.stop(); G.audio.sfx('win');
    } else { G.audio.stop(); G.audio.sfx('lose'); }
    RES.btns = p.win
      ? [{ id: 'next', label: r.idx >= 5 ? '¡FINAL!' : 'SIGUIENTE NIVEL' }, { id: 'menu', label: 'MENÚ' }]
      : [{ id: 'retry', label: 'REINTENTAR' }, { id: 'menu', label: 'MENÚ' }];
  };
  function resBtns() {
    const W = G.W, H = G.H, bw = 118, gap = 8, n = RES.btns.length;
    const x0 = Math.round(W / 2 - (bw * n + gap * (n - 1)) / 2);
    return RES.btns.map((b, i) => Object.assign({}, b, { x: x0 + i * (bw + gap), y: H - 28 - G.safeB, w: bw, h: 20 }));
  }
  function resAct(id) {
    G.audio.sfx('ok');
    const r = G.run;
    if (id === 'menu') G.go('map');
    else if (id === 'retry') G.go('vs');
    else if (id === 'next') { r.idx++; if (r.idx >= 6) G.go('ending'); else G.go('vs'); }
  }
  RES.down = function (id, x, y) { if (RES.t < 0.6) return; for (const b of resBtns()) if (G.inRect(x, y, b, 3)) resAct(b.id); };
  RES.key = function (k) { if (RES.t > 0.6 && (k === 'Enter' || k === 'Space')) resAct(RES.btns[0].id); };
  RES.draw = function () {
    const W = G.W, H = G.H, p = RES.p, t = RES.t;
    bgGrid(t, p.win ? '#2a1030' : '#141820', p.win ? '#4a2050' : '#262c38');
    const who = p.win ? p.villain : p.hero;
    ell(Math.round(W * 0.22), H - 30, 40, 7, '#000', 0.4);
    G.drawSprite(who, 'win', p.win ? 1 : -1, Math.round(W * 0.22), H - 30);
    const x = Math.round(W * 0.6);
    G.text(p.win ? '¡VICTORIA!' : 'DERROTA', x, 10 + G.safeT, { s: 4, c: p.win ? GOLD : ['#e0e4ec', '#c8ced8', '#b0b8c4', '#98a2b0', '#808c9c', '#6a7688', '#566274'], o: '#000', al: 'c' });
    let y = 56;
    const line = (a, b, c) => { G.text(a, x - 70, y, { c: '#c8bce0', o: '#000' }); G.text(b, x + 70, y, { c: c || '#ffffff', o: '#000', al: 'r' }); y += 12; };
    if (p.win) {
      G.text('NIVEL ' + p.level + ' SUPERADO', x, 48, { c: '#5effc0', o: '#000', al: 'c' }); y = 64;
      line('CIUDAD DESTRUIDA', p.pct + '%', '#ff9a3a');
      line('TIEMPO RESTANTE', p.time + ' S');
      line('BONUS', '+' + p.bonus, '#ffe266');
      line('PUNTOS', G.pad(p.score, 7), '#ffe266');
      line('PARA EL TALLER', '+' + G.fmt(p.earned), '#5effc0');
    } else {
      G.text(p.timeup ? 'SE ACABÓ EL TIEMPO' : G.ROB[p.hero].name + ' TE HA VENCIDO', x, 48, { c: '#ff9a8a', o: '#000', al: 'c' }); y = 64;
      line('CIUDAD DESTRUIDA', p.pct + '%', '#ff9a3a');
      line('PUNTOS', G.pad(p.base, 7), '#ffe266');
      line('PARA EL TALLER', '+' + G.fmt(p.earned), '#5effc0');
      G.text('¡LOS VILLANOS NUNCA SE RINDEN!', x, y + 6, { c: '#ffffff', o: '#000', al: 'c' });
    }
    if (t > 0.6) for (const b of resBtns()) G.button(b, b.id !== 'menu');
  };

  // ---------- final ----------
  const END = G.scenes.ending = {};
  END.enter = function () { G.audio.play('title'); G.audio.sfx('win'); };
  END.down = function () { if (END.t > 1.5) { G.audio.sfx('ok'); G.go('title'); } };
  END.key = END.down;
  END.draw = function () {
    const W = G.W, H = G.H, t = END.t, v = G.villainId(G.run ? G.run.villain : 0);
    R(0, 0, W, H, '#1a0820');
    for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 30 * (1 + i % 3)) % W, y = (i * 53) % H; A(x, y, 2, 2, '#ffe266', 0.6); }
    G.drawSprite(v, 'win', 1, Math.round(W / 2), H + 80, 2);
    G.text('¡EL MUNDO ES TUYO!', W / 2, 18 + G.safeT, { s: 3, c: GOLD, o: '#000', al: 'c' });
    G.text('HAS DERROTADO A LOS 6 RIVALES', W / 2, 48, { c: '#ffffff', o: '#000', al: 'c' });
    G.text('PUNTOS ' + G.pad(G.run ? G.run.score : 0, 7), W / 2, 60, { s: 2, c: '#ffe266', o: '#000', al: 'c' });
    if (t > 1.5 && Math.floor(t * 2) % 2) G.text('TOCA PARA VOLVER A JUGAR', W / 2, H - 20, { c: '#ffffff', o: '#000', al: 'c' });
  };

  // ---------- gira el móvil ----------
  G.drawRotate = function () {
    const W = G.W, H = G.H, t = G.time;
    R(0, 0, W, H, '#140a24');
    const cx = W / 2, cy = H / 2 - 20;
    const ang = Math.min(1, (t % 2.4) / 1.2) * Math.PI / 2;
    const X = G.ctx();
    X.save(); X.translate(cx, cy); X.rotate(-ang);
    X.fillStyle = '#ffffff'; X.fillRect(-16, -28, 32, 56); X.fillStyle = '#2a1a4a'; X.fillRect(-13, -23, 26, 44); X.fillStyle = '#ffd23a'; X.fillRect(-2, 23, 4, 2);
    X.restore();
    G.text('GIRA EL MÓVIL', cx, cy + 46, { s: 2, c: '#ffe266', o: '#000', al: 'c' });
    G.text('ROBOTWARS SE JUEGA EN HORIZONTAL', cx, cy + 66, { c: '#ffffff', al: 'c' });
  };
})(window.G);
