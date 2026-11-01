'use strict';
// TALLER: personalizar el robot (colores, accesorio, emblema, dibujo, estela) y gastar puntos en armas y vuelo.
(function (G) {
  const R = G.R, A = G.A;
  const ell = (...a) => G.ell(...a);
  const GOLD = ['#fff6c2', '#ffe266', '#ffd23a', '#ffb020', '#ff8a1a', '#ff6a1a', '#e04a1a'];

  G.WEAPONS = [
    { id: 'rayo', name: 'RAYO', pow: 1, price: 0, cool: 0.5 },
    { id: 'doble', name: 'DOBLE RAYO', pow: 2, price: 4000, cool: 0.5 },
    { id: 'plasma', name: 'BOLA DE PLASMA', pow: 3, price: 10000, cool: 0.75 },
    { id: 'misiles', name: 'TRIPLE MISIL', pow: 4, price: 18000, cool: 0.85 },
    { id: 'mega', name: 'MEGA LÁSER', pow: 5, price: 30000, cool: 1.0 },
  ];
  G.FLYPRICE = [3000, 8000, 15000];
  G.weapon = (id) => G.WEAPONS.find((w) => w.id === id) || G.WEAPONS[0];
  G.fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const T = G.scenes.taller = {};
  T.enter = function (p) {
    T.tab = (p && p.tab) || 'color'; T.msg = ''; T.msgT = 0; T.anim = 0;
    T.v = G.save.data.villain || 0; if (!G.isUnlocked(T.v)) T.v = 0;
    G.audio.play('select');
  };
  const shop = () => G.save.data.shop;
  const baseId = () => G.PLAYABLE[T.v];
  const custom = () => { const c = (shop().colors[baseId()] || []).slice(); while (c.length < 7) c.push(0); return c; };
  function setCustom(i, v) { const c = custom(); c[i] = v; shop().colors[baseId()] = c; G.save.write(); G.preload(G.villainId(T.v)); }
  function say(m, good) { T.msg = m; T.msgGood = good; T.msgT = T.t; }

  function layout() {
    const W = G.W, H = G.H, x0 = G.safeL + 6, x1 = W - G.safeR - 6;
    const pw = Math.max(110, Math.min(170, Math.round(W * 0.34)));
    const prev = { x: x0, y: 28, w: pw, h: H - 28 - 8 - G.safeB };
    const panel = { x: x0 + pw + 8, y: 28, w: x1 - (x0 + pw + 8), h: H - 28 - 8 - G.safeB };
    const ids = ['color', 'estilo', 'armas', 'vuelo'], names = ['COLOR', 'ESTILO', 'ARMAS', 'VUELO'];
    const tw = Math.floor((panel.w - 9) / 4);
    const tabs = ids.map((id, i) => ({ id, x: panel.x + i * (tw + 3), y: panel.y, w: tw, h: 17, label: names[i] }));
    const arrows = { l: { x: prev.x + 3, y: prev.y + prev.h - 22, w: 16, h: 16, label: '◄' }, r: { x: prev.x + prev.w - 19, y: prev.y + prev.h - 22, w: 16, h: 16, label: '►' } };
    return { W, H, prev, panel, tabs, arrows, cy: panel.y + 24 };
  }
  // pestaña COLOR: tres filas de muestras (cuerpo, luces, detalles)
  function swatches(L) {
    const out = [], sz = 14, gap = 3, per = Math.max(4, Math.floor((L.panel.w - 4) / (sz + gap)));
    const groups = [['m', 0, G.MAINPALS], ['a', 1, G.ACCPALS], ['d', 2, G.SECPALS]];
    let y = L.cy;
    const labels = [];
    for (const [kind, idx, pals] of groups) {
      labels.push({ idx, y });
      y += 10;
      pals.forEach((p, i) => out.push({ kind, idx, i, x: L.panel.x + 2 + (i % per) * (sz + gap), y: y + Math.floor(i / per) * (sz + gap), w: sz, h: sz }));
      y += Math.ceil(pals.length / per) * (sz + gap) + 6;
    }
    return { list: out, labels };
  }
  // pestañas ESTILO y VUELO: filas con ◄ valor ►
  function cyclers(L) {
    const rows = T.tab === 'estilo'
      ? [['ACCESORIO', 3, G.HATS], ['EMBLEMA', 4, G.EMBLEMS], ['DIBUJO', 5, G.PATTERNS]]
      : [['ESTELA', 6, G.TRAILS.map((t) => t.name)]];
    const y0 = T.tab === 'estilo' ? L.cy : L.cy + 96;
    return rows.map(([label, idx, names], r) => {
      const y = y0 + r * 30;
      return { label, idx, names, y, l: { x: L.panel.x, y: y + 9, w: 18, h: 16, label: '◄' }, r: { x: L.panel.x + L.panel.w - 18, y: y + 9, w: 18, h: 16, label: '►' } };
    });
  }
  function weaponRows(L) {
    const rh = Math.min(22, Math.floor((L.panel.h - 30) / G.WEAPONS.length) - 3);
    return G.WEAPONS.map((w, i) => ({ w, x: L.panel.x, y: L.cy + i * (rh + 3), wd: L.panel.w, h: rh }));
  }
  function flyBtn(L) { const w = Math.min(150, L.panel.w); return { x: L.panel.x + Math.round((L.panel.w - w) / 2), y: L.cy + 66, w, h: 20, label: '' }; }
  function stepRobot(d) {
    const n = G.PLAYABLE.length;
    let v = T.v;
    for (let i = 0; i < n; i++) { v = (v + d + n) % n; if (G.isUnlocked(v)) break; }
    T.v = v; G.save.data.villain = v; G.save.write(); G.preload(G.villainId(v)); G.audio.sfx('sel');
  }

  T.down = function (id, x, y) {
    const L = layout(), s = shop();
    if (G.inRect(x, y, { x: G.safeL + 6, y: 6 + G.safeT, w: 20, h: 14 }, 4)) { G.audio.sfx('back'); G.go('select'); return; }
    for (const t of L.tabs) if (G.inRect(x, y, t, 2)) { T.tab = t.id; G.audio.sfx('sel'); return; }
    if (G.inRect(x, y, L.arrows.l, 4)) { stepRobot(-1); return; }
    if (G.inRect(x, y, L.arrows.r, 4)) { stepRobot(1); return; }
    if (T.tab === 'color') {
      for (const sw of swatches(L).list) if (G.inRect(x, y, sw, 1)) {
        setCustom(sw.idx, sw.i); G.audio.sfx('ok');
        const names = sw.kind === 'm' ? G.MAINNAMES : sw.kind === 'a' ? G.ACCNAMES : G.SECNAMES;
        say(names[sw.i], true); return;
      }
    }
    if (T.tab === 'estilo' || T.tab === 'vuelo') {
      for (const c of cyclers(L)) {
        const d = G.inRect(x, y, c.l, 4) ? -1 : G.inRect(x, y, c.r, 4) ? 1 : 0;
        if (!d) continue;
        const n = c.names.length, v = (custom()[c.idx] + d + n) % n;
        setCustom(c.idx, v); G.audio.sfx('ok'); say(c.label + ': ' + c.names[v], true); T.anim = T.t; return;
      }
    }
    if (T.tab === 'armas') {
      for (const r of weaponRows(L)) if (G.inRect(x, y, { x: r.x, y: r.y, w: r.wd, h: r.h }, 1)) {
        const w = r.w;
        if (s.weapons.indexOf(w.id) >= 0) { s.weapon = w.id; G.save.write(); G.audio.sfx('ok'); say(w.name + ' EQUIPADO', true); T.anim = T.t; }
        else if (s.wallet >= w.price) { s.wallet -= w.price; s.weapons.push(w.id); s.weapon = w.id; G.save.write(); G.audio.sfx('win'); say('¡' + w.name + ' COMPRADO!', true); T.anim = T.t; }
        else { G.audio.sfx('back'); say('TE FALTAN ' + G.fmt(w.price - s.wallet) + ' PUNTOS', false); }
        return;
      }
    }
    if (T.tab === 'vuelo' && G.inRect(x, y, flyBtn(L), 3)) {
      const lv = s.flyLv;
      if (lv >= 3) { say('VUELO AL MÁXIMO', true); return; }
      const price = G.FLYPRICE[lv];
      if (s.wallet >= price) { s.wallet -= price; s.flyLv = lv + 1; G.save.write(); G.audio.sfx('win'); say('¡VUELO NIVEL ' + (lv + 2) + '!', true); }
      else { G.audio.sfx('back'); say('TE FALTAN ' + G.fmt(price - s.wallet) + ' PUNTOS', false); }
    }
  };
  T.key = function (k) { if (k === 'Escape') G.go('select'); };

  T.draw = function () {
    const L = layout(), s = shop(), t = T.t, W = L.W, c = custom();
    R(0, 0, W, L.H, '#16102a');
    const off = Math.floor((t * 12) % 16);
    for (let y = -16 + off; y < L.H; y += 16) A(0, y, W, 1, '#2e2450', 0.6);
    for (let x = 0; x < W; x += 16) A(x, 0, 1, L.H, '#2e2450', 0.6);
    G.text('TALLER', W / 2, 8 + G.safeT, { s: 2, c: GOLD, o: '#000', al: 'c' });
    G.button({ x: G.safeL + 6, y: 6 + G.safeT, w: 20, h: 14, label: '◄' }, false);
    G.text('PUNTOS ' + G.fmt(s.wallet), W - G.safeR - 6, 11 + G.safeT, { c: '#ffe266', o: '#000', al: 'r' });
    // vista previa
    const P = L.prev, vid = G.villainId(T.v), sp = G.ROB[vid];
    R(P.x, P.y, P.w, P.h, '#000'); R(P.x + 1, P.y + 1, P.w - 2, P.h - 2, '#241838');
    const cx = P.x + Math.round(P.w / 2) - 4, fy = P.y + P.h - 32;
    ell(cx + 4, fy, 26, 4, '#000', 0.4);
    const shooting = T.tab === 'armas' && (t - T.anim) % 1.6 < 0.5;
    const flying = T.tab === 'vuelo';
    const fr = shooting ? 'punch' : (flying ? 'fly' : (Math.floor(t * 2) % 2 ? 'idle1' : 'idle0'));
    const lift = flying ? Math.round(12 + Math.sin(t * 3) * 3) : 0;
    G.drawSprite(vid, fr, 1, cx, fy - lift);
    if (flying) {
      const tc = G.TRAILS[c[6] || 0].c, f = Math.floor(t * 14) % 3;
      for (const dx of [-7, 8]) { R(cx + dx - 2, fy - lift + 6, 5, 5 + f, tc[2]); R(cx + dx - 1, fy - lift + 6, 3, 3 + f, tc[1]); Px(cx + dx, fy - lift + 6, tc[0]); }
    }
    if (shooting) drawShot(s.weapon, cx + 34, fy - 66, (t - T.anim) % 1.6, sp);
    G.text(sp.name, P.x + P.w / 2, P.y + P.h - 18, { c: '#ffffff', o: '#000', al: 'c' });
    G.button(L.arrows.l, false); G.button(L.arrows.r, false);
    for (const tb of L.tabs) G.button(tb, T.tab === tb.id);
    const pnl = L.panel;
    if (T.tab === 'color') {
      const sw = swatches(L), base = G.ROB[baseId()];
      const lab = ['CUERPO: ' + G.MAINNAMES[c[0]], 'LUCES: ' + G.ACCNAMES[c[1]], 'DETALLES: ' + G.SECNAMES[c[2]]];
      sw.labels.forEach((l, i) => G.text(lab[i], pnl.x + 2, l.y, { c: '#c8bce0', o: '#000' }));
      for (const b of sw.list) {
        const pals = b.kind === 'm' ? G.MAINPALS : b.kind === 'a' ? G.ACCPALS : G.SECPALS;
        const pal = pals[b.i] || (b.kind === 'm' ? base.main : b.kind === 'a' ? base.acc : base.sec);
        const on = c[b.idx] === b.i;
        R(b.x - 2, b.y - 2, b.w + 4, b.h + 4, on ? '#ffd23a' : '#000');
        R(b.x - 1, b.y - 1, b.w + 2, b.h + 2, '#000');
        R(b.x, b.y, b.w, b.h, pal.b); R(b.x, b.y, b.w, 4, pal.l); R(b.x, b.y + b.h - 4, b.w, 4, pal.d);
        if (b.i === 0) R(b.x + 4, b.y + 5, 6, 3, '#ffffff');
      }
    } else if (T.tab === 'estilo' || T.tab === 'vuelo') {
      if (T.tab === 'vuelo') {
        const lv = s.flyLv, secs = 5 + G.ROB[baseId()].stats.fly + lv * 3;
        G.text('PODER DE VUELO', pnl.x + pnl.w / 2, L.cy, { c: '#ffffff', o: '#000', al: 'c' });
        const segW = Math.floor((pnl.w - 20) / 4);
        for (let i = 0; i < 4; i++) { const x = pnl.x + 10 + i * segW; R(x, L.cy + 12, segW - 4, 12, '#000'); R(x + 1, L.cy + 13, segW - 6, 10, i <= lv ? '#7ec8ff' : '#2a2442'); if (i <= lv) R(x + 1, L.cy + 13, segW - 6, 3, '#d8f0ff'); }
        G.text('NIVEL ' + (lv + 1) + ' DE 4 · VUELAS ' + secs + ' S', pnl.x + pnl.w / 2, L.cy + 30, { c: '#7ec8ff', o: '#000', al: 'c' });
        const b = flyBtn(L); b.label = lv >= 3 ? 'AL MÁXIMO' : 'MEJORAR · ' + G.fmt(G.FLYPRICE[lv]);
        G.button(b, lv < 3 && s.wallet >= G.FLYPRICE[lv]);
      }
      for (const cy of cyclers(L)) {
        G.text(cy.label, pnl.x + 2, cy.y, { c: '#c8bce0', o: '#000' });
        G.button(cy.l, false); G.button(cy.r, false);
        const bx = cy.l.x + cy.l.w + 4, bw = cy.r.x - 4 - bx;
        R(bx, cy.y + 9, bw, 16, '#000'); R(bx + 1, cy.y + 10, bw - 2, 14, '#2a2442');
        const val = cy.names[c[cy.idx]];
        const col = cy.idx === 6 ? G.TRAILS[c[6]].c[2] : (c[cy.idx] ? '#ffe266' : '#a898c8');
        G.text(val, bx + bw / 2, cy.y + 14, { c: col, al: 'c' });
      }
    } else if (T.tab === 'armas') {
      for (const r of weaponRows(L)) {
        const w = r.w, owned = s.weapons.indexOf(w.id) >= 0, on = s.weapon === w.id;
        R(r.x, r.y, r.wd, r.h, on ? '#ffd23a' : '#000'); R(r.x + 1, r.y + 1, r.wd - 2, r.h - 2, on ? '#3a2a10' : '#241838');
        G.text(w.name, r.x + 5, r.y + Math.round(r.h / 2) - 3, { c: owned ? '#ffffff' : '#a898c8' });
        const st = on ? 'PUESTA' : owned ? 'USAR' : G.fmt(w.price);
        const stc = on ? '#ffe266' : owned ? '#5effc0' : (s.wallet >= w.price ? '#ffe266' : '#ff7a6a');
        G.text(st, r.x + r.wd - 5, r.y + Math.round(r.h / 2) - 3, { c: stc, al: 'r' });
        if (r.wd > 200) for (let i = 0; i < 5; i++) { const px = r.x + r.wd - 50 - G.textW(st, 1) - 30 + i * 5; R(px, r.y + Math.round(r.h / 2) - 2, 4, 5, '#000'); R(px, r.y + Math.round(r.h / 2) - 2, 3, 4, i < w.pow ? '#ff9a3a' : '#3a2e52'); }
      }
    }
    if (T.msg && t - T.msgT < 2.5) G.text(T.msg, pnl.x + pnl.w / 2, L.H - 16 - G.safeB, { c: T.msgGood ? '#5effc0' : '#ff7a6a', o: '#000', al: 'c' });
  };
  const Px = G.Px;
  function drawShot(w, x, y, k, sp) {
    const c = sp.acc, d = Math.round(k * 120);
    if (w === 'misiles') { for (let i = -1; i <= 1; i++) { R(x + d - 4, y + i * 6 - 1, 9, 3, '#1c1a22'); R(x + d - 3, y + i * 6, 7, 1, '#e8e8f0'); R(x + d - 7, y + i * 6 - 1, 3, 3, '#ffc23a'); } }
    else if (w === 'plasma') { ell(x + d, y, 7, 7, c.d, 0.6); ell(x + d, y, 5, 5, c.b); ell(x + d - 1, y - 1, 2, 2, '#ffffff'); }
    else if (w === 'mega') { R(x, y - 4, 40 + d, 9, c.d); R(x, y - 3, 40 + d, 7, c.b); R(x, y - 1, 40 + d, 3, '#ffffff'); }
    else { const ys = w === 'doble' ? [-6, 6] : [0]; for (const yy of ys) { R(x + d - 9, y + yy - 2, 18, 5, c.d); R(x + d - 8, y + yy - 1, 16, 3, c.b); R(x + d - 6, y + yy, 12, 1, '#ffffff'); } }
  }
})(window.G);
