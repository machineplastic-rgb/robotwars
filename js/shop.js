'use strict';
// TALLER: cambiar colores del villano y gastar puntos en armas de disparo y poder de vuelo.
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
  T.enter = function (p) { T.tab = (p && p.tab) || 'color'; T.v = G.save.data.villain || 0; T.msg = ''; T.msgT = 0; T.anim = 0; G.audio.play('select'); };
  const shop = () => G.save.data.shop;
  function say(m, good) { T.msg = m; T.msgGood = good; T.msgT = T.t; }

  function layout() {
    const W = G.W, H = G.H, x0 = G.safeL + 6, x1 = W - G.safeR - 6;
    const pw = Math.max(110, Math.min(170, Math.round(W * 0.34)));
    const prev = { x: x0, y: 28, w: pw, h: H - 28 - 8 - G.safeB };
    const panel = { x: x0 + pw + 8, y: 28, w: x1 - (x0 + pw + 8), h: H - 28 - 8 - G.safeB };
    const tw = Math.floor((panel.w - 8) / 3);
    const tabs = ['color', 'armas', 'vuelo'].map((id, i) => ({ id, x: panel.x + i * (tw + 4), y: panel.y, w: tw, h: 17, label: id === 'color' ? 'COLOR' : id === 'armas' ? 'ARMAS' : 'VUELO' }));
    const arrows = { l: { x: prev.x + 3, y: prev.y + prev.h - 22, w: 16, h: 16, label: '◄' }, r: { x: prev.x + prev.w - 19, y: prev.y + prev.h - 22, w: 16, h: 16, label: '►' } };
    return { W, H, prev, panel, tabs, arrows, cy: panel.y + 24 };
  }
  function swatches(L) {
    const out = [], sz = 15, gap = 4, per = Math.max(4, Math.floor((L.panel.w - 4) / (sz + gap)));
    let y = L.cy + 10;
    G.MAINPALS.forEach((p, i) => out.push({ kind: 'm', i, x: L.panel.x + 2 + (i % per) * (sz + gap), y: y + Math.floor(i / per) * (sz + gap), w: sz, h: sz }));
    y += Math.ceil(G.MAINPALS.length / per) * (sz + gap) + 14;
    G.ACCPALS.forEach((p, i) => out.push({ kind: 'a', i, x: L.panel.x + 2 + (i % per) * (sz + gap), y: y + Math.floor(i / per) * (sz + gap), w: sz, h: sz }));
    return { list: out, accY: y - 10 };
  }
  function weaponRows(L) {
    const rh = Math.min(22, Math.floor((L.panel.h - 30) / G.WEAPONS.length) - 3);
    return G.WEAPONS.map((w, i) => ({ w, x: L.panel.x, y: L.cy + i * (rh + 3), wd: L.panel.w, h: rh }));
  }
  function flyBtn(L) { const w = Math.min(150, L.panel.w); return { x: L.panel.x + Math.round((L.panel.w - w) / 2), y: L.cy + 70, w, h: 20, label: '' }; }

  T.down = function (id, x, y) {
    const L = layout(), s = shop();
    if (G.inRect(x, y, { x: G.safeL + 6, y: 6 + G.safeT, w: 20, h: 14 }, 4)) { G.audio.sfx('back'); G.go('select'); return; }
    for (const t of L.tabs) if (G.inRect(x, y, t, 2)) { T.tab = t.id; G.audio.sfx('sel'); return; }
    const nv = G.VILLAINS.length;
    if (G.inRect(x, y, L.arrows.l, 4)) { T.v = (T.v + nv - 1) % nv; G.save.data.villain = T.v; G.save.write(); G.audio.sfx('sel'); return; }
    if (G.inRect(x, y, L.arrows.r, 4)) { T.v = (T.v + 1) % nv; G.save.data.villain = T.v; G.save.write(); G.audio.sfx('sel'); return; }
    const vid = G.VILLAINS[T.v];
    if (T.tab === 'color') {
      for (const sw of swatches(L).list) if (G.inRect(x, y, sw, 2)) {
        const c = (s.colors[vid] || [0, 0]).slice();
        if (sw.kind === 'm') c[0] = sw.i; else c[1] = sw.i;
        s.colors[vid] = c; G.save.write(); G.audio.sfx('ok');
        G.preload(G.villainId(T.v));
        say(sw.kind === 'm' ? 'CUERPO: ' + G.MAINNAMES[sw.i] : 'LUCES: ' + G.ACCNAMES[sw.i], true);
        return;
      }
    } else if (T.tab === 'armas') {
      for (const r of weaponRows(L)) if (G.inRect(x, y, { x: r.x, y: r.y, w: r.wd, h: r.h }, 1)) {
        const w = r.w;
        if (s.weapons.indexOf(w.id) >= 0) { s.weapon = w.id; G.save.write(); G.audio.sfx('ok'); say(w.name + ' EQUIPADO', true); T.anim = T.t; }
        else if (s.wallet >= w.price) { s.wallet -= w.price; s.weapons.push(w.id); s.weapon = w.id; G.save.write(); G.audio.sfx('win'); say('¡' + w.name + ' COMPRADO!', true); T.anim = T.t; }
        else { G.audio.sfx('back'); say('TE FALTAN ' + G.fmt(w.price - s.wallet) + ' PUNTOS', false); }
        return;
      }
    } else if (T.tab === 'vuelo') {
      if (G.inRect(x, y, flyBtn(L), 3)) {
        const lv = s.flyLv;
        if (lv >= 3) { say('VUELO AL MÁXIMO', true); return; }
        const price = G.FLYPRICE[lv];
        if (s.wallet >= price) { s.wallet -= price; s.flyLv = lv + 1; G.save.write(); G.audio.sfx('win'); say('¡VUELO NIVEL ' + (lv + 2) + '!', true); }
        else { G.audio.sfx('back'); say('TE FALTAN ' + G.fmt(price - s.wallet) + ' PUNTOS', false); }
      }
    }
  };
  T.key = function (k) { if (k === 'Escape') G.go('select'); };

  T.draw = function () {
    const L = layout(), s = shop(), t = T.t, W = L.W;
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
    const fr = shooting ? 'punch' : (T.tab === 'vuelo' ? 'fly' : (Math.floor(t * 2) % 2 ? 'idle1' : 'idle0'));
    const lift = T.tab === 'vuelo' ? Math.round(10 + Math.sin(t * 3) * 3) : 0;
    G.drawSprite(vid, fr, 1, cx, fy - lift);
    if (T.tab === 'vuelo') for (const dx of [-7, 8]) { const f = Math.floor(t * 14) % 3; R(cx + dx - 2, fy - lift + 6, 5, 4 + f, '#ffc23a'); R(cx + dx - 1, fy - lift + 6, 3, 2 + f, '#fff4b0'); }
    if (shooting) drawShot(s.weapon, cx + 34, fy - 66, (t - T.anim) % 1.6, sp);
    G.text(sp.name, P.x + P.w / 2, P.y + P.h - 18, { c: '#ffffff', o: '#000', al: 'c' });
    G.button(L.arrows.l, false); G.button(L.arrows.r, false);
    // pestañas
    for (const tb of L.tabs) G.button(tb, T.tab === tb.id);
    const pnl = L.panel;
    if (T.tab === 'color') {
      const sw = swatches(L), c = s.colors[G.VILLAINS[T.v]] || [0, 0];
      G.text('CUERPO: ' + G.MAINNAMES[c[0]], pnl.x + 2, L.cy, { c: '#c8bce0', o: '#000' });
      G.text('LUCES: ' + G.ACCNAMES[c[1]], pnl.x + 2, sw.accY, { c: '#c8bce0', o: '#000' });
      const base = G.ROB[G.VILLAINS[T.v]];
      for (const b of sw.list) {
        const pal = b.kind === 'm' ? (G.MAINPALS[b.i] || base.main) : (G.ACCPALS[b.i] || base.acc);
        const on = (b.kind === 'm' ? c[0] : c[1]) === b.i;
        R(b.x - 2, b.y - 2, b.w + 4, b.h + 4, on ? '#ffd23a' : '#000');
        R(b.x - 1, b.y - 1, b.w + 2, b.h + 2, '#000');
        R(b.x, b.y, b.w, b.h, pal.b); R(b.x, b.y, b.w, 4, pal.l); R(b.x, b.y + b.h - 4, b.w, 4, pal.d);
        if (b.i === 0) R(b.x + 5, b.y + 6, 5, 3, '#ffffff');
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
    } else {
      const lv = s.flyLv, secs = 5 + G.ROB[G.VILLAINS[T.v]].stats.fly + lv * 3;
      G.text('PODER DE VUELO', pnl.x + pnl.w / 2, L.cy, { c: '#ffffff', o: '#000', al: 'c' });
      const segW = Math.floor((pnl.w - 20) / 4);
      for (let i = 0; i < 4; i++) { const x = pnl.x + 10 + i * segW; R(x, L.cy + 14, segW - 4, 14, '#000'); R(x + 1, L.cy + 15, segW - 6, 12, i <= lv ? '#7ec8ff' : '#2a2442'); if (i <= lv) R(x + 1, L.cy + 15, segW - 6, 3, '#d8f0ff'); }
      G.text('NIVEL ' + (lv + 1) + ' DE 4', pnl.x + pnl.w / 2, L.cy + 34, { c: '#7ec8ff', o: '#000', al: 'c' });
      G.text('VUELAS ' + secs + ' SEGUNDOS', pnl.x + pnl.w / 2, L.cy + 46, { c: '#c8bce0', o: '#000', al: 'c' });
      G.text('Y MÁS RÁPIDO', pnl.x + pnl.w / 2, L.cy + 56, { c: '#c8bce0', o: '#000', al: 'c' });
      const b = flyBtn(L); b.label = lv >= 3 ? 'AL MÁXIMO' : 'MEJORAR · ' + G.fmt(G.FLYPRICE[lv]);
      G.button(b, lv < 3 && s.wallet >= G.FLYPRICE[lv]);
    }
    if (T.msg && t - T.msgT < 2.5) G.text(T.msg, pnl.x + pnl.w / 2, L.H - 16 - G.safeB, { c: T.msgGood ? '#5effc0' : '#ff7a6a', o: '#000', al: 'c' });
  };
  // dibujo de cada arma (también lo usa el combate)
  function drawShot(w, x, y, k, sp) {
    const c = sp.acc, d = Math.round(k * 120);
    if (w === 'misiles') { for (let i = -1; i <= 1; i++) { R(x + d - 4, y + i * 6 - 1, 9, 3, '#1c1a22'); R(x + d - 3, y + i * 6, 7, 1, '#e8e8f0'); R(x + d - 7, y + i * 6 - 1, 3, 3, '#ffc23a'); } }
    else if (w === 'plasma') { ell(x + d, y, 7, 7, c.d, 0.6); ell(x + d, y, 5, 5, c.b); ell(x + d - 1, y - 1, 2, 2, '#ffffff'); }
    else if (w === 'mega') { R(x, y - 4, 40 + d, 9, c.d); R(x, y - 3, 40 + d, 7, c.b); R(x, y - 1, 40 + d, 3, '#ffffff'); }
    else { const ys = w === 'doble' ? [-6, 6] : [0]; for (const yy of ys) { R(x + d - 9, y + yy - 2, 18, 5, c.d); R(x + d - 8, y + yy - 1, 16, 3, c.b); R(x + d - 6, y + yy, 12, 1, '#ffffff'); } }
  }
})(window.G);
