'use strict';
// Escenarios: suelo pintado + edificios y objetos destruibles (cada uno con 3 estados: entero, dañado, ruina).
(function (G) {
  const R = G.R, Px = G.Px, A = G.A;
  const ell = (...a) => G.ell(...a), polyO = (...a) => G.polyO(...a), poly = (...a) => G.poly(...a), part = (...a) => G.part(...a);
  const OUT = '#1c1a22';
  const AW = G.AW = 800, AH = G.AH = 330;
  G.SPAWN = { v: { x: AW / 2 - 110, y: 252 }, h: { x: AW / 2 + 110, y: 252 } };

  // ---------- estilos de edificio ----------
  const BS = {
    glass: { wall: '#8b93a3', wallD: '#6b7383', win: '#4d6c96', winL: '#9cc2e6', roof: '#a8aaae', roofL: '#cbcdd2', roofD: '#85878c', wt: 'grid', rt: 'flat' },
    brick: { wall: '#a0533c', wallD: '#7a3b2b', win: '#33313f', winL: '#8592a8', roof: '#77716b', roofL: '#9a948c', roofD: '#5c5752', sill: '#dccbb0', wt: 'brick', rt: 'flat' },
    cream: { wall: '#dccb9f', wallD: '#b6a37a', win: '#4b5f7a', winL: '#9db2cc', roof: '#a69d8e', roofL: '#c6bdab', roofD: '#878072', sill: '#f4ecd6', wt: 'balc', rt: 'flat' },
    teal: { wall: '#4c8a87', wallD: '#386a68', win: '#21455a', winL: '#a6e4e4', roof: '#8f9d9b', roofL: '#b0bebc', roofD: '#727f7c', wt: 'strip', rt: 'flat' },
    white: { wall: '#e6e4de', wallD: '#c2c0b9', win: '#56799f', winL: '#b2d2ee', roof: '#bcbab3', roofL: '#dcdad3', roofD: '#9a9891', wt: 'thin', rt: 'flat' },
    warehouse: { wall: '#7d8a96', wallD: '#5e6a76', win: '#2e3640', winL: '#5a6878', roof: '#9aa4ae', roofL: '#bcc4cc', roofD: '#78828c', wt: 'corr', rt: 'corr' },
    warehouse2: { wall: '#3f6f8f', wallD: '#2e5470', win: '#1e2a36', winL: '#4a6a88', roof: '#a8b0b8', roofL: '#c8ced4', roofD: '#868e96', wt: 'corr', rt: 'corr' },
    cont_r: { wall: '#b8402e', wallD: '#8a2e20', roof: '#c85040', roofL: '#e07060', roofD: '#9a3428', wt: 'cont', rt: 'cont' },
    cont_b: { wall: '#2e5e9e', wallD: '#20447a', roof: '#3a70b0', roofL: '#5a90cc', roofD: '#284e86', wt: 'cont', rt: 'cont' },
    cont_g: { wall: '#3a8a4a', wallD: '#2a6a36', roof: '#48a058', roofL: '#68bc74', roofD: '#307a3e', wt: 'cont', rt: 'cont' },
    cont_o: { wall: '#d8862a', wallD: '#a8641c', roof: '#e89a3a', roofL: '#f8b85a', roofD: '#b8701e', wt: 'cont', rt: 'cont' },
    adobe: { wall: '#d8a86c', wallD: '#b8864e', win: '#3a2a20', winL: '#6a5040', roof: '#c89860', roofL: '#e0b47c', roofD: '#a87a48', sill: '#7a5030', wt: 'small', rt: 'adobe' },
    adobe2: { wall: '#c87a52', wallD: '#a45e3a', win: '#3a2420', winL: '#6a4438', roof: '#b86e48', roofL: '#d48c64', roofD: '#945434', sill: '#6a4028', wt: 'small', rt: 'adobe' },
    chalet: { wall: '#8a5a36', wallD: '#6a4224', win: '#ffd890', winL: '#fff4c8', roof: '#eef4fc', roofL: '#ffffff', roofD: '#b8c8e0', sill: '#5a3a1e', wt: 'chalet', rt: 'gable' },
    chalet2: { wall: '#a8452e', wallD: '#7e321e', win: '#ffd890', winL: '#fff4c8', roof: '#eef4fc', roofL: '#ffffff', roofD: '#b8c8e0', sill: '#5a2a1a', wt: 'chalet', rt: 'gable' },
    snowblock: { wall: '#8e9aaa', wallD: '#6e7a8a', win: '#3a5070', winL: '#a0c4e8', roof: '#eef4fc', roofL: '#ffffff', roofD: '#c0d0e4', wt: 'grid', rt: 'snow' },
    factory: { wall: '#8c7a6a', wallD: '#6c5a4a', win: '#4a5a6a', winL: '#8aa0b8', roof: '#7a7e86', roofL: '#9aa0a8', roofD: '#5a5e66', wt: 'factory', rt: 'saw' },
    factory2: { wall: '#6a7480', wallD: '#4e5864', win: '#3a4a5a', winL: '#7a90a8', roof: '#8a8e96', roofL: '#a8acb4', roofD: '#6a6e76', wt: 'factory', rt: 'saw' },
    hangar: { wall: '#5a6478', wallD: '#424a5a', win: '#40f0ff', winL: '#c0ffff', roof: '#8a94a8', roofL: '#b4bccc', roofD: '#5e6878', wt: 'hangar', rt: 'curved' },
    lab: { wall: '#c8ccd8', wallD: '#a0a6b4', win: '#1e3a4a', winL: '#40f0ff', roof: '#9aa0b0', roofL: '#bcc2d0', roofD: '#7a8090', wt: 'lab', rt: 'flat' },
  };

  function windows(s, x, fy, w, h, rr) {
    const bot = fy + h - 8;
    switch (s.wt) {
      case 'grid': for (let y = fy + 3; y + 5 <= bot; y += 6) for (let xx = x + 2; xx + 4 <= x + w - 3; xx += 5) { R(xx, y, 4, 5, s.win); if (((xx - x) + (y - fy) * 0.6) % 26 < 6) R(xx, y, 4, 5, '#7fa3cc'); Px(xx, y, s.winL); Px(xx + 1, y, s.winL); Px(xx, y + 1, s.winL); } break;
      case 'brick': for (let y = fy + 3; y + 5 <= bot; y += 8) for (let xx = x + 3; xx + 3 <= x + w - 3; xx += 7) { R(xx, y, 3, 4, s.win); Px(xx, y, s.winL); R(xx - 1, y + 4, 5, 1, s.sill); } break;
      case 'balc': for (let y = fy + 3; y + 5 <= bot; y += 7) for (let xx = x + 3; xx + 4 <= x + w - 3; xx += 7) { R(xx, y, 4, 4, s.win); Px(xx, y, s.winL); R(xx - 1, y + 4, 6, 1, s.sill); if (rr() < 0.3) R(xx, y, 4, 4, '#e8c98a'); } break;
      case 'strip': for (let y = fy + 3; y + 4 <= bot; y += 6) { R(x + 2, y, w - 5, 3, s.win); for (let xx = x + 2; xx < x + w - 3; xx += 9) Px(xx, y, s.winL); for (let xx = x + 6; xx < x + w - 3; xx += 6) R(xx, y, 1, 3, s.wallD); } break;
      case 'thin': for (let y = fy + 3; y + 3 <= bot; y += 5) { R(x + 2, y, w - 5, 2, s.win); for (let xx = x + 2; xx < x + w - 3; xx += 6) Px(xx, y, s.winL); } break;
      case 'corr': {
        for (let xx = x + 2; xx < x + w - 2; xx += 3) R(xx, fy + 1, 1, h - 1, s.wallD);
        const dw = Math.max(8, Math.round(w * 0.36)), dx = x + Math.round((w - dw) / 2), dh = Math.max(8, Math.round(h * 0.62));
        R(dx - 1, fy + h - dh - 1, dw + 2, dh + 1, OUT); R(dx, fy + h - dh, dw, dh, s.win);
        for (let y = fy + h - dh + 2; y < fy + h; y += 3) R(dx, y, dw, 1, s.winL);
        return true;
      }
      case 'cont': for (let xx = x + 2; xx < x + w - 2; xx += 3) R(xx, fy + 1, 1, h - 2, s.wallD); R(x + w - 5, fy + 2, 1, h - 4, '#dcdcdc'); R(x + w - 8, fy + 2, 1, h - 4, '#dcdcdc'); return true;
      case 'small': for (let y = fy + 4; y + 6 <= bot; y += 10) for (let xx = x + 4; xx + 4 <= x + w - 4; xx += 10) { if (rr() < 0.25) continue; R(xx, y, 4, 5, s.win); Px(xx, y, s.winL); R(xx - 1, y + 5, 6, 1, s.sill); } for (let xx = x + 3; xx < x + w - 3; xx += 7) R(xx, fy + 2, 2, 2, s.sill); break;
      case 'chalet':
        for (let y = fy + 2; y < fy + h; y += 3) R(x + 1, y, w - 3, 1, s.wallD);
        for (let y = fy + 4; y + 6 <= bot; y += 9) for (let xx = x + 4; xx + 5 <= x + w - 4; xx += 9) { R(xx - 1, y - 1, 7, 8, s.sill); R(xx, y, 5, 6, s.win); R(xx + 2, y, 1, 6, s.sill); R(xx, y + 3, 5, 1, s.sill); Px(xx, y, s.winL); }
        break;
      case 'factory':
        for (let xx = x + 3; xx + 4 <= x + w - 3; xx += 6) { R(xx, fy + 3, 4, 3, s.win); Px(xx, fy + 3, s.winL); }
        for (let xx = x; xx < x + w; xx += 4) { R(xx, fy + h - 3, 2, 3, '#e8c020'); R(xx + 2, fy + h - 3, 2, 3, '#2a2a2a'); }
        { const dw = Math.max(8, Math.round(w * 0.3)), dx = x + 4, dh = Math.round(h * 0.55); R(dx - 1, fy + h - dh - 4, dw + 2, dh + 1, OUT); R(dx, fy + h - dh - 3, dw, dh, '#4a4a50'); for (let y = fy + h - dh - 1; y < fy + h - 3; y += 3) R(dx, y, dw, 1, '#5e5e66'); }
        return true;
      case 'hangar': {
        R(x + 3, fy + 3, w - 6, 2, s.win); R(x + 3, fy + 3, w - 6, 1, s.winL);
        const dh = Math.round(h * 0.6); R(x + 4, fy + h - dh, w - 8, dh, '#2e3444');
        for (let xx = x + 4; xx < x + w - 4; xx += 6) R(xx, fy + h - dh, 1, dh, '#4a5266');
        R(x + 4, fy + h - dh, w - 8, 1, '#7a8498');
        return true;
      }
      case 'lab': for (let y = fy + 3; y + 3 <= bot; y += 6) { R(x + 2, y, w - 5, 3, s.win); R(x + 2, y + 1, w - 5, 1, s.winL); } break;
    }
    return false;
  }
  function roofTop(s, o, x, ry, w, d, rr) {
    R(x, ry, w, d, s.roof);
    switch (s.rt) {
      case 'flat': case 'snow': {
        R(x, ry, w, 1, s.roofL); R(x, ry, 1, d, s.roofL);
        R(x + 2, ry + 2, w - 4, 1, s.roofD); R(x + 2, ry + 2, 1, d - 4, s.roofD); R(x + w - 1, ry, 1, d, s.roofD);
        if (s.rt === 'snow') { for (let i = 0; i < w * d / 10; i++) Px(x + 2 + rr() * (w - 4), ry + 2 + rr() * (d - 4), '#d8e4f2'); break; }
        if (o.heli) {
          const cx = x + Math.round(w / 2), cy = ry + Math.round(d / 2);
          ell(cx, cy, 10, 8, '#4a4952'); ell(cx, cy, 9, 7, '#5d5c66');
          for (let i = -3; i <= 3; i++) { Px(cx - 3, cy + i, '#f2efe6'); Px(cx + 3, cy + i, '#f2efe6'); }
          for (let i = -2; i <= 2; i++) Px(cx + i, cy, '#f2efe6');
          for (let a = 0; a < 16; a++) { const an = (a / 16) * Math.PI * 2; Px(cx + Math.round(Math.cos(an) * 8), cy + Math.round(Math.sin(an) * 6), a % 2 ? '#f0c23a' : '#e9e6dc'); }
          break;
        }
        if (o.dish) { const cx = x + Math.round(w * 0.6), cy = ry + Math.round(d * 0.5); ell(cx + 2, cy + 2, 6, 3, '#000', 0.25); ell(cx, cy, 6, 4, OUT); ell(cx, cy, 5, 3, '#e8eaf0'); ell(cx + 1, cy + 1, 3, 2, '#b8bcc8'); }
        const n = Math.max(1, Math.floor(w * d / 220));
        for (let i = 0; i < n; i++) {
          const ax = x + 4 + Math.floor(rr() * (w - 12)), ay = ry + 4 + Math.floor(rr() * Math.max(1, d - 10));
          if (rr() < 0.6) { A(ax + 5, ay + 1, 2, 4, '#000', 0.25); R(ax - 1, ay - 1, 7, 6, OUT); R(ax, ay, 5, 4, '#d4d4d6'); R(ax, ay + 3, 5, 1, '#9a9aa0'); R(ax + 1, ay + 1, 3, 1, '#8a8a90'); }
          else { A(ax + 4, ay + 2, 3, 5, '#000', 0.25); ell(ax + 2, ay + 2, 3, 3, OUT); ell(ax + 2, ay + 2, 2, 2, '#8d8378'); Px(ax + 1, ay + 1, '#b8ad9f'); }
        }
        if (rr() < 0.5) { R(x + w - 6, ry + 3, 1, 6, OUT); Px(x + w - 6, ry + 2, '#e03a2a'); }
        break;
      }
      case 'gable': {
        const mid = ry + Math.round(d * 0.42);
        R(x, ry, w, mid - ry, s.roofD); R(x, ry, w, 1, s.roofL);
        R(x, mid, w, 1, '#8aa0bc');
        R(x, mid + 1, w, ry + d - mid - 1, s.roof);
        for (let i = 0; i < w * d / 12; i++) Px(x + rr() * w, mid + 2 + rr() * (ry + d - mid - 3), '#d8e4f2');
        R(x + Math.round(w * 0.7), ry - 4, 5, mid - ry + 4, OUT); R(x + Math.round(w * 0.7) + 1, ry - 3, 3, mid - ry + 2, '#7a3a2a'); R(x + Math.round(w * 0.7) + 1, ry - 3, 3, 1, '#ffffff');
        break;
      }
      case 'corr': case 'cont':
        for (let xx = x + 1; xx < x + w - 1; xx += 3) R(xx, ry + 1, 1, d - 2, s.roofD);
        R(x, ry, w, 1, s.roofL); R(x, ry + Math.round(d / 2), w, 1, s.roofL);
        if (s.rt === 'cont') { R(x, ry, 1, d, s.roofL); R(x + w - 1, ry, 1, d, s.roofD); }
        break;
      case 'adobe':
        R(x, ry, w, 2, s.roofL); R(x, ry, 2, d, s.roofL); R(x + 3, ry + 3, w - 6, d - 6, s.roofD); R(x + 4, ry + 4, w - 8, d - 8, s.roof);
        if (rr() < 0.5) { const tx = x + 5 + Math.floor(rr() * (w - 16)), ty = ry + 4; ell(tx + 4, ty + 4, 4, 3, OUT); ell(tx + 4, ty + 4, 3, 2, '#5a6a7a'); }
        break;
      case 'saw':
        for (let yy = ry; yy < ry + d; yy += 6) { R(x, yy, w, 4, s.roof); R(x, yy, w, 1, s.roofL); R(x, yy + 4, w, 2, '#3a5068'); R(x, yy + 4, w, 1, '#6a8aa8'); }
        R(x, ry, 1, d, s.roofL); R(x + w - 1, ry, 1, d, s.roofD);
        break;
      case 'curved':
        for (let yy = 0; yy < d; yy++) { const t = yy / d; R(x, ry + yy, w, 1, t < 0.25 ? s.roofL : t < 0.7 ? s.roof : s.roofD); }
        for (let xx = x + 4; xx < x + w - 2; xx += 8) R(xx, ry, 1, d, s.roofD);
        break;
    }
  }
  function drawBox(o, x, base, rr) {
    const s = BS[o.style]; const w = o.w, h = o.h, d = o.d; const fy = base - h, ry = fy - d;
    A(x + w + 1, ry + Math.round(d * 0.4), Math.round(h * 0.22) + 4, base - ry - Math.round(d * 0.4), '#000', 0.2);
    R(x - 1, ry - 1, w + 2, d + h + 2, OUT);
    roofTop(s, o, x, ry, w, d, rr);
    R(x, fy - 1, w, 1, s.roofD);
    R(x, fy, w, h, s.wall); R(x, fy, w, 1, s.wallD); R(x + w - 2, fy, 2, h, s.wallD); R(x, fy, 1, h, s.roofL);
    const noDoor = windows(s, x, fy, w, h, rr);
    if (s.rt === 'gable') { R(x - 2, fy - 2, w + 4, 4, OUT); R(x - 1, fy - 1, w + 2, 2, '#ffffff'); for (let i = 0; i < w; i += 3) R(x + i, fy + 2, 1, 1 + Math.floor(rr() * 3), '#dff0ff'); }
    if (s.rt === 'snow') { R(x, fy, w, 2, '#ffffff'); for (let i = 1; i < w; i += 3) R(x + i, fy + 2, 1, 1 + Math.floor(rr() * 3), '#dff0ff'); }
    if (!noDoor && h >= 14) {
      const dx = x + Math.round(w / 2) - 3;
      R(dx - 1, base - 8, 8, 2, o.aw || '#c0392b'); R(dx, base - 6, 6, 6, '#2a2830'); Px(dx + 1, base - 5, '#5d6a80');
    }
    if (o.cont2) { R(x, fy + Math.round(h / 2), w, 1, OUT); }
  }

  // ---------- objetos especiales ----------
  const TANKS = {
    oil: { l: '#fffaf0', b: '#e8e4dc', d: '#b8b0a4', o: '#8a8276', top: '#d8d2c6', topL: '#f4f0e8', acc: '#c03a2a' },
    gas: { l: '#eef2fa', b: '#c8ccd8', d: '#9aa0b0', o: '#6a7080', top: '#b8bccc', topL: '#dce0ec', acc: '#40c8e8' },
    rust: { l: '#c88a5a', b: '#a8683c', d: '#7e4a26', o: '#5a3218', top: '#9a6038', topL: '#b87a4c', acc: '#2a2a2a' },
    green: { l: '#8ac08a', b: '#5a9a5a', d: '#3e7a3e', o: '#2a5a2a', top: '#4e8a4e', topL: '#6eaa6e', acc: '#e8c020' },
  };
  function drawCyl(o, x, base, rr, tall) {
    const s = TANKS[o.tc || 'oil'], w = o.w, h = o.h, cx = x + w / 2, ry = Math.max(3, Math.round(w * 0.22));
    const fy = base - h;
    A(x + w, fy + ry, Math.round(h * 0.25) + 4, h - ry, '#000', 0.2);
    ell(cx, base - 1, w / 2 + 1, ry * 0.7 + 1, OUT);
    R(x - 1, fy, w + 2, h, OUT);
    for (let i = 0; i < w; i++) { const t = i / Math.max(1, w - 1); R(x + i, fy, 1, h, t < 0.15 ? s.l : t < 0.6 ? s.b : t < 0.86 ? s.d : s.o); }
    ell(cx, base - 1, w / 2, ry * 0.7, s.d);
    for (let i = 0; i < w; i++) { const t = i / Math.max(1, w - 1); R(x + i, base - 1 - ry * 0.7, 1, Math.round(ry * 0.7), t < 0.15 ? s.l : t < 0.6 ? s.b : t < 0.86 ? s.d : s.o); }
    if (tall) {
      for (let k = 0; k < 2; k++) { const by = fy + 3 + k * 7; for (let i = 0; i < w; i++) R(x + i, by, 1, 4, i / w < 0.6 ? '#e8e4dc' : '#b8b0a4'); }
      for (let k = 0; k < 2; k++) { const by = fy + 7 + k * 7; for (let i = 0; i < w; i++) R(x + i, by, 1, 3, i / w < 0.6 ? '#c83a2a' : '#8a2418'); }
      ell(cx, fy, w / 2 + 1, ry + 1, OUT); ell(cx, fy, w / 2, ry, '#3a3a40'); ell(cx, fy, w / 2 - 2, ry - 1, '#141418');
    } else {
      R(x, fy + Math.round(h * 0.35), w, 3, s.acc);
      for (let y = fy + 3; y < base - 4; y += 3) R(x + Math.round(w * 0.72), y, 3, 1, s.o);
      ell(cx, fy, w / 2 + 1, ry + 1, OUT); ell(cx, fy, w / 2, ry, s.top); ell(cx - 2, fy - 1, w / 2 - 4, Math.max(1, ry - 2), s.topL);
      R(cx - 1, fy - ry - 1, 3, 2, OUT);
    }
  }
  function drawCrane(o, x, base) {
    const col = '#e8b830', colD = '#a87810', colL = '#ffe070';
    const legH = o.h - 50, fy = base - legH;
    A(x + o.w, fy, 14, legH, '#000', 0.18);
    const cxm = x + Math.round(o.w / 2);
    R(cxm - 5, fy - 50, 10, 46, OUT); R(cxm - 4, fy - 49, 8, 44, col);
    for (let y = fy - 48; y < fy - 6; y += 6) G.line(cxm - 4, y, cxm + 3, y + 6, colD);
    R(cxm - 4, fy - 49, 1, 44, colL);
    for (const lx of [x + 3, x + o.w - 10]) {
      R(lx - 1, fy - 1, 8, legH + 1, OUT); R(lx, fy, 6, legH, col);
      for (let y = fy; y < base - 3; y += 6) G.line(lx, y, lx + 5, y + 6, colD);
      R(lx, fy, 1, legH, colL);
    }
    R(x - 1, fy - 9, o.w + 2, 11, OUT); R(x, fy - 8, o.w, 9, col); R(x, fy - 8, o.w, 1, colL);
    for (let xx = x; xx < x + o.w - 4; xx += 6) G.line(xx, fy - 8, xx + 5, fy, colD);
    part(cxm - 8, fy - 6, 16, 11, { o: OUT, d: '#8a1a1a', b: '#c83030', l: '#f06050', h: '#ffffff' }, 2);
    R(cxm - 5, fy - 3, 10, 3, '#2b3a4c');
    R(cxm, fy + 5, 1, 26, '#2a2a30'); R(cxm - 3, fy + 31, 7, 4, OUT);
  }
  function drawRocket(o, x, base) {
    R(x - 4, base - 7, o.w + 8, 7, OUT); R(x - 3, base - 6, o.w + 6, 5, '#5a6070'); R(x - 3, base - 6, o.w + 6, 1, '#8a90a0');
    const tx = x, th = o.h - 6;
    R(tx - 1, base - th - 1, 10, th, OUT); R(tx, base - th, 8, th - 6, '#c83a2a');
    for (let y = base - th; y < base - 8; y += 6) { G.line(tx, y, tx + 7, y + 6, '#7a2018'); }
    for (let y = base - th + 14; y < base - 20; y += 22) { R(tx + 8, y, 6, 2, OUT); }
    const rx = x + 14, rw = o.w - 14, top = base - o.h + 10;
    R(rx - 1, top, rw + 2, base - 6 - top, OUT);
    for (let i = 0; i < rw; i++) { const t = i / (rw - 1); R(rx + i, top, 1, base - 6 - top, t < 0.2 ? '#ffffff' : t < 0.65 ? '#e4e8f0' : '#a8b0c0'); }
    polyO([[rx, top], [rx + rw / 2, top - 14], [rx + rw, top]], '#d83a2a', OUT);
    poly([[rx + 1, top], [rx + rw / 2, top - 12], [rx + rw / 2, top]], '#f06a4a');
    polyO([[rx - 5, base - 7], [rx, base - 22], [rx, base - 7]], '#d83a2a', OUT);
    polyO([[rx + rw + 5, base - 7], [rx + rw, base - 22], [rx + rw, base - 7]], '#a82a1a', OUT);
    R(rx + 2, top + 18, rw - 4, 3, '#2a2a40'); R(rx + 2, top + 40, rw - 4, 2, '#40c8e8');
    ell(rx + rw / 2, top + 10, 2, 2, OUT); ell(rx + rw / 2, top + 10, 1, 1, '#40f0ff');
  }
  function drawDish(o, x, base) {
    const cx = x + Math.round(o.w / 2);
    A(cx + 6, base - 8, 16, 7, '#000', 0.2);
    part(cx - 7, base - 11, 14, 11, { o: OUT, d: '#6a7080', b: '#9aa0b0', l: '#c0c6d4', h: '#ffffff' }, 2);
    R(cx - 2, base - 24, 4, 14, OUT); R(cx - 1, base - 23, 2, 12, '#b8bcc8');
    ell(cx, base - 30, 16, 12, OUT); ell(cx, base - 30, 15, 11, '#e8eaf0'); ell(cx + 2, base - 29, 11, 8, '#c8ccd8'); ell(cx + 3, base - 28, 6, 4, '#a8aebc');
    G.line(cx + 2, base - 29, cx + 8, base - 42, '#3a3a44'); R(cx + 7, base - 44, 3, 3, '#e03a2a');
  }
  function drawDome(o, x, base) {
    const cx = x + o.w / 2, r = o.w / 2, dh = o.h;
    A(x + o.w - 4, base - dh * 0.6, 12, dh * 0.6, '#000', 0.2);
    const pts = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; pts.push([cx - Math.cos(a) * r, base - 5 - Math.sin(a) * dh]); }
    polyO(pts, '#c8ccd8', OUT);
    const p2 = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; p2.push([cx - 2 - Math.cos(a) * (r * 0.7), base - 7 - Math.sin(a) * dh * 0.82]); }
    poly(p2, '#e4e8f0');
    ell(cx - r * 0.35, base - dh * 0.75, r * 0.22, dh * 0.12, '#ffffff');
    R(x + 2, base - Math.round(dh * 0.42), o.w - 4, 3, OUT); R(x + 3, base - Math.round(dh * 0.42) + 1, o.w - 6, 1, '#40c8ff');
    R(x - 1, base - 6, o.w + 2, 6, OUT); R(x, base - 5, o.w, 4, '#7a8498'); R(x, base - 5, o.w, 1, '#a8b0c0');
  }
  function drawTower(o, x, base) {
    const cx = x + Math.round(o.w / 2);
    A(x + o.w, base - o.h + 20, 10, o.h - 20, '#000', 0.2);
    part(cx - 6, base - o.h + 16, 12, o.h - 16, { o: OUT, d: '#7a8090', b: '#a8aebc', l: '#d0d4e0', h: '#ffffff' }, 0);
    for (let y = base - o.h + 22; y < base - 4; y += 8) R(cx - 4, y, 8, 1, '#7a8090');
    part(x, base - o.h + 2, o.w, 16, { o: OUT, d: '#5a6070', b: '#8a90a0', l: '#b0b6c4', h: '#ffffff' }, 3);
    R(x + 2, base - o.h + 8, o.w - 4, 5, '#1e3a4a'); R(x + 2, base - o.h + 9, o.w - 4, 1, '#40f0ff');
    R(cx - 1, base - o.h - 8, 2, 10, OUT); R(cx - 1, base - o.h - 10, 3, 3, '#e03a2a');
  }
  function drawShip(o, x, base) {
    A(x - 2, base - 1, o.w + 10, 3, '#ffffff', 0.35);
    polyO([[x, base - 16], [x + o.w, base - 16], [x + o.w - 10, base], [x + 6, base]], '#7a2a2a', OUT);
    R(x + 3, base - 9, o.w - 10, 2, '#2a1a1a');
    R(x + 2, base - 24, o.w - 4, 8, OUT); R(x + 3, base - 23, o.w - 6, 6, '#b8b4a8');
    const cols = ['#b8402e', '#2e5e9e', '#3a8a4a', '#d8862a'];
    for (let i = 0, xx = x + 6; xx < x + o.w - 40; xx += 13, i++) { R(xx - 1, base - 33, 13, 11, OUT); R(xx, base - 32, 11, 9, cols[i % 4]); R(xx, base - 32, 11, 1, '#ffffff55'); for (let k = 2; k < 11; k += 3) R(xx + k, base - 31, 1, 8, '#00000033'); }
    part(x + o.w - 34, base - 44, 20, 22, { o: OUT, d: '#b8bcc4', b: '#e8eaee', l: '#ffffff', h: '#ffffff' }, 3);
    R(x + o.w - 32, base - 38, 16, 2, '#2b3a4c');
    R(x + o.w - 28, base - 54, 7, 11, OUT); R(x + o.w - 27, base - 53, 5, 9, '#c83030'); R(x + o.w - 27, base - 53, 5, 2, '#2a2a2a');
  }
  // ---------- atrezo pequeño ----------
  function drawProp(o, x, base, crushed, rr) {
    const k = o.style;
    if (crushed) {
      const c = k === 'tree' || k === 'pine' || k === 'palm' || k === 'cactus' ? '#3a5a2a' : (o.c || '#6a6a70');
      ell(x + o.w / 2, base - 2, o.w / 2 + 1, 2.5, OUT); ell(x + o.w / 2, base - 2, o.w / 2, 1.5, c);
      for (let i = 0; i < 5; i++) Px(x + rr() * o.w, base - 3 + rr() * 3, '#2a2a2a');
      return;
    }
    switch (k) {
      case 'tree': { const r = o.w / 2, cx = x + r, cy = base - r - 2; ell(cx + 2, base - 1, r, Math.max(2, r * 0.45), '#000', 0.25); R(cx - 1, cy + r - 2, 2, 4, '#5a3a20'); ell(cx, cy, r + 1, r * 0.85 + 1, '#1f3d17'); ell(cx, cy, r, r * 0.85, '#3f7d2a'); ell(cx - 1, cy - 1, r - 2, r * 0.85 - 2, '#5d9e3a'); ell(cx - 2, cy - 2, Math.max(1, r - 4), Math.max(1, r * 0.85 - 4), '#86c257'); Px(cx - 3, cy - 3, '#b6e47e'); break; }
      case 'pine': { const cx = x + o.w / 2; A(cx, base - 2, 10, 3, '#000', 0.2); R(cx - 1, base - 5, 3, 5, '#5a3a20'); for (let t = 0; t < 3; t++) { const ty = base - 5 - t * 6, tw = o.w / 2 - t * 2; polyO([[cx - tw, ty], [cx, ty - 10], [cx + tw, ty]], '#1f5a32', OUT); poly([[cx - tw + 2, ty - 1], [cx, ty - 9], [cx - 1, ty - 1]], '#2e7a44'); R(cx - tw + 1, ty - 1, tw * 2 - 2, 1, '#f4f8ff'); } Px(cx, base - 22, '#ffffff'); break; }
      case 'palm': { const cx = x + o.w / 2; A(cx + 2, base - 2, 12, 3, '#000', 0.2); for (let i = 0; i < 18; i++) { R(cx + Math.round(Math.sin(i / 6) * 2) - 1, base - i - 1, 3, 1, i % 3 ? '#8a6a3a' : '#6a4a22'); } const ty = base - 19, tx = cx + Math.round(Math.sin(3) * 2); for (const [dx, dy] of [[-9, 3], [-7, -4], [0, -7], [7, -4], [9, 3], [4, 5], [-4, 5]]) { G.line(tx, ty, tx + dx, ty + dy, '#2e7a2e'); G.line(tx, ty + 1, tx + dx, ty + dy + 1, '#1e5a1e'); } ell(tx, ty + 1, 2, 2, '#6a4a22'); break; }
      case 'cactus': { const cx = x + o.w / 2; A(cx + 1, base - 1, 8, 2, '#000', 0.2); R(cx - 3, base - 18, 6, 18, OUT); R(cx - 2, base - 17, 4, 17, '#3a9a3a'); R(cx - 2, base - 17, 1, 17, '#6ac46a'); R(cx - 8, base - 12, 6, 3, OUT); R(cx - 8, base - 17, 3, 8, OUT); R(cx - 7, base - 16, 1, 6, '#3a9a3a'); R(cx + 2, base - 9, 6, 3, OUT); R(cx + 5, base - 14, 3, 8, OUT); R(cx + 6, base - 13, 1, 6, '#3a9a3a'); break; }
      case 'car': { const c = o.c || '#d23b3b'; A(x + 2, base - 4, 12, 5, '#000', 0.25); R(x, base - 7, 12, 7, OUT); R(x + 1, base - 6, 10, 5, c); R(x + 3, base - 6, 5, 4, o.c2 || '#ffffff'); R(x + 2, base - 6, 1, 4, '#2b3a4c'); R(x + 8, base - 6, 1, 4, '#2b3a4c'); Px(x + 10, base - 5, '#fff6c0'); Px(x + 10, base - 3, '#fff6c0'); break; }
      case 'barrel': { const c = o.c || '#c83a2a'; A(x + 4, base - 3, 5, 3, '#000', 0.25); R(x, base - 10, 7, 10, OUT); R(x + 1, base - 9, 5, 9, c); R(x + 1, base - 9, 1, 9, '#ffffff66'); R(x + 1, base - 6, 5, 1, '#00000055'); R(x + 1, base - 3, 5, 1, '#00000055'); ell(x + 3.5, base - 10, 3, 1.5, OUT); break; }
      case 'crate': { A(x + 9, base - 7, 4, 7, '#000', 0.25); part(x, base - 12, 10, 12, { o: OUT, d: '#7a5428', b: '#b0844c', l: '#d4a868', h: '#f0cc90' }, 3); G.line(x + 2, base - 9, x + 7, base - 2, '#7a5428'); break; }
      case 'rock': { ell(x + o.w / 2 + 1, base - 2, o.w / 2, 3, '#000', 0.2); ell(x + o.w / 2, base - 4, o.w / 2, 4, OUT); ell(x + o.w / 2, base - 4, o.w / 2 - 1, 3, '#9a8a74'); ell(x + o.w / 2 - 1, base - 5, o.w / 2 - 3, 1.5, '#bcae96'); break; }
      case 'lamp': { R(x + 2, base - 18, 2, 18, OUT); R(x + 2, base - 18, 6, 2, OUT); R(x + 6, base - 17, 2, 1, '#fff6c0'); break; }
    }
  }

  // ---------- dibujo por estado (con caché) ----------
  const PADL = 8, PADR = 30, PADT = 26, PADB = 6;
  function drawObj(o, state) {
    const rr = G.rng(o.seed);
    const cw = o.w + PADL + PADR, chH = o.h + o.d + PADT + PADB;
    const cv = G.mkCanvas(cw, chH);
    const prev = G.ctx(); G.target(cv.x);
    const x = PADL, base = PADT + o.h + o.d;
    try {
      if (o.kind === 'prop') drawProp(o, x, base, state === 2, rr);
      else if (state === 2) drawRuin(o, x, base, rr);
      else {
        drawIntact(o, x, base, rr);
        if (state === 1) drawDamage(o, x, base, rr, cv.x);
      }
    } finally { G.target(prev); }
    return { c: cv.c, dx: -PADL, dy: -base };
  }
  function drawIntact(o, x, base, rr) {
    switch (o.kind) {
      case 'bld': drawBox(o, x, base, rr); break;
      case 'cyl': drawCyl(o, x, base, rr, false); break;
      case 'chimney': drawCyl(o, x, base, rr, true); break;
      case 'crane': drawCrane(o, x, base); break;
      case 'rocket': drawRocket(o, x, base); break;
      case 'dish': drawDish(o, x, base); break;
      case 'dome': drawDome(o, x, base); break;
      case 'tower': drawTower(o, x, base); break;
      case 'ship': drawShip(o, x, base); break;
    }
  }
  function drawDamage(o, x, base, rr, ctx) {
    const top = base - o.h - o.d;
    const side = rr() < 0.5 ? 0 : 1;
    const bw = Math.max(4, Math.round(o.w * (0.3 + rr() * 0.25)));
    const bx0 = side ? x + o.w - bw : x;
    const maxDepth = Math.round(Math.min(o.h * 0.5, o.d * 0.6 + 10));
    let jag = 0;
    for (let i = 0; i <= bw; i++) {
      const cx = bx0 + i, t = side ? i / bw : 1 - i / bw;
      jag += (rr() - 0.5) * 3; jag = G.clamp(jag, -3, 3);
      const depth = Math.max(1, Math.round(maxDepth * (0.35 + 0.65 * t) + jag));
      ctx.clearRect(cx - 1, 0, 2, top + depth);
      R(cx, top + depth, 1, 3, '#2b2229'); Px(cx, top + depth - 1, OUT);
    }
    const fy = base - o.h;
    for (let i = 0; i < Math.max(2, o.w * o.h / 160); i++) { const hx = x + 2 + rr() * (o.w - 6), hy = fy + 3 + rr() * Math.max(2, o.h - 10); R(hx, hy, 2 + rr() * 4, 2 + rr() * 3, '#1e1a22'); }
    for (let k = 0; k < 3; k++) {
      let cx = x + 3 + rr() * (o.w - 6), cy = fy + 2;
      for (let i = 0; i < o.h * 0.5; i++) { Px(cx, cy, '#2e2622'); cy += 1; cx += rr() < 0.5 ? -1 : (rr() < 0.5 ? 1 : 0); }
    }
    A(x, fy, o.w, Math.min(8, o.h), '#000000', 0.18);
  }
  function drawRuin(o, x, base, rr) {
    const s = BS[o.style] || { wall: '#8d877e', wallD: '#6f6a63', roof: '#a49e94', win: '#2a2a30' };
    const wall = o.kind === 'cyl' || o.kind === 'chimney' ? (TANKS[o.tc || 'oil'].b) : s.wall;
    const wallD = o.kind === 'cyl' || o.kind === 'chimney' ? (TANKS[o.tc || 'oil'].d) : s.wallD;
    const hmax = Math.max(5, Math.round(Math.min(o.h * 0.32, 22)));
    const dep = Math.max(6, Math.round(o.d * 0.7));
    A(x + o.w, base - hmax, 8, hmax, '#000', 0.2);
    let hc = hmax * 0.7;
    const hs = [];
    for (let i = 0; i < o.w; i++) { hc += (rr() - 0.5) * 4; hc = G.clamp(hc, 2, hmax); hs.push(Math.round(hc)); }
    for (let i = 0; i < o.w; i++) { R(x + i, base - hs[i] - 1, 1, hs[i] + 1, OUT); }
    for (let i = 0; i < o.w; i++) { R(x + i, base - hs[i], 1, hs[i], i % 7 === 3 ? wallD : wall); R(x + i, base - hs[i], 1, 2, '#2b2229'); }
    for (let y = base - hmax + 3; y < base - 3; y += 6) for (let xx = x + 3; xx < x + o.w - 4; xx += 6) if (base - hs[xx - x] < y) R(xx, y, 3, 2, '#1e1a22');
    const cols = [wall, wallD, s.roof || '#a49e94', '#8d877e', '#a49e94', '#6f6a63', '#55515a'];
    for (let i = 0; i < o.w * dep / 3; i++) {
      const rx = x + rr() * o.w, t = rr();
      const ry = base - t * (dep * 0.6 + hmax * 0.5) - 2;
      const sz = 1 + Math.floor(rr() * 3);
      R(rx - 1, ry - 1, sz + 2, sz + 1, OUT); R(rx, ry, sz, sz, cols[Math.floor(rr() * cols.length)]);
    }
    for (let i = 0; i < o.w; i += 4) if (rr() < 0.3) { const l = 2 + Math.floor(rr() * 5); R(x + i, base - hs[i] - l, 1, l, '#6e5a4c'); }
    A(x, base - hmax - dep * 0.5, o.w, hmax + dep * 0.5, '#000', 0.12);
  }
  G.objImg = function (o) {
    o.img = o.img || [];
    if (!o.img[o.state]) o.img[o.state] = drawObj(o, o.state);
    return o.img[o.state];
  };

  // ---------- suelos ----------
  function asphalt(rr, x, y, w, h, base, n1, n2) {
    R(x, y, w, h, base || '#55545f');
    for (let i = 0; i < (w * h) / 9; i++) Px(x + Math.floor(rr() * w), y + Math.floor(rr() * h), rr() < 0.5 ? (n1 || '#5f5e6a') : (n2 || '#4a4954'));
  }
  function tiles(c1, c2, sx, sy) { R(0, 0, AW, AH, c1); for (let y = 0; y < AH; y += sy) R(0, y, AW, 1, c2); for (let x = 0; x < AW; x += sx) R(x, 0, 1, AH, c2); }
  function hRoad(rr, y0, y1, opt) {
    opt = opt || {};
    asphalt(rr, 0, y0, AW, y1 - y0, opt.c, opt.n1, opt.n2);
    R(0, y0 - 2, AW, 1, opt.curbL || '#e6ddcd'); R(0, y0 - 1, AW, 1, opt.curbD || '#958c7d'); R(0, y1, AW, 1, opt.curbL || '#e6ddcd');
    const mid = Math.round((y0 + y1) / 2);
    if (opt.center !== false) for (let x = 0; x < AW; x += 1) { if (opt.gaps && opt.gaps.some((g) => x > g[0] - 12 && x < g[1] + 12)) continue; Px(x, mid - 2, opt.lineC || '#f0c23a'); Px(x, mid + 1, opt.lineC || '#f0c23a'); }
    if (opt.lanes !== false) for (let x = 0; x < AW; x += 14) { if (opt.gaps && opt.gaps.some((g) => x > g[0] - 12 && x < g[1] + 12)) continue; R(x, y0 + 11, 8, 1, '#e9e6dc'); R(x, y1 - 12, 8, 1, '#e9e6dc'); }
  }
  function vRoad(rr, x0, x1, ry0, ry1) {
    asphalt(rr, x0, 0, x1 - x0, AH);
    R(x0 - 1, 0, 1, AH, '#e6ddcd'); R(x1, 0, 1, AH, '#958c7d');
    asphalt(rr, x0, ry0, x1 - x0, ry1 - ry0);
    const mx = Math.round((x0 + x1) / 2);
    for (let y = 0; y < AH; y += 12) if (y < ry0 - 14 || y > ry1 + 12) R(mx, y, 1, 7, '#f0c23a');
    for (let y = ry0 + 3; y < ry1 - 2; y += 4) { R(x0 - 10, y, 7, 2, '#e9e6dc'); R(x1 + 4, y, 7, 2, '#e9e6dc'); }
    for (let x = x0 + 3; x < x1 - 2; x += 4) { R(x, ry0 - 10, 2, 7, '#e9e6dc'); R(x, ry1 + 4, 2, 7, '#e9e6dc'); }
  }
  function speckle(rr, n, cols) { for (let i = 0; i < n; i++) Px(rr() * AW, rr() * AH, cols[Math.floor(rr() * cols.length)]); }

  // ---------- definición de los 6 lugares ----------
  const RY0 = 200, RY1 = 242;
  G.STAGES = [
    {
      id: 'ciudad', name: 'CIUDAD', hero: 'voltar', music: 'ciudad', seed: 101,
      army: { body: '#6b7a4a', light: '#93a466', dark: '#4f5a36' },
      roads: [{ x: 0, y: RY0 - 2, w: AW, h: RY1 - RY0 + 4 }, { x: 250, y: 0, w: 40, h: AH }, { x: 550, y: 0, w: 40, h: AH }],
      paint(rr) {
        tiles('#c9bfae', '#bfb5a3', 8, 6);
        hRoad(rr, RY0, RY1, { gaps: [[250, 290], [550, 590]] });
        vRoad(rr, 250, 290, RY0, RY1); vRoad(rr, 550, 590, RY0, RY1);
      },
      back: { styles: ['glass', 'brick', 'cream', 'teal', 'white'], hmin: 40, hmax: 78, base: [100, 114] },
      mid: { styles: ['brick', 'cream', 'glass', 'teal', 'white', 'brick'], n: 10, hmin: 14, hmax: 30 },
      props: [['tree', 14], ['car', 10], ['lamp', 4]],
      front: ['cream', 'brick', 'glass', 'teal', 'white'],
    },
    {
      id: 'puerto', name: 'PUERTO', hero: 'blazer', music: 'puerto', seed: 202,
      army: { body: '#6a7482', light: '#8e98a6', dark: '#4a5462' },
      roads: [{ x: 0, y: 0, w: AW, h: 104 }, { x: 0, y: 292, w: AW, h: 14 }],
      paint(rr) {
        R(0, 0, AW, AH, '#a8a49a');
        for (let y = 0; y < AH; y += 20) R(0, y, AW, 1, '#9c988e');
        for (let x = 0; x < AW; x += 32) R(x, 104, 1, AH, '#9c988e');
        R(0, 0, AW, 96, '#1d4e7a');
        for (let y = 2; y < 94; y += 4) for (let x = (y * 7) % 23; x < AW; x += 23 + (y % 3) * 4) R(x, y, 6 + (x % 5), 1, y > 70 ? '#3a7aaa' : '#2a6292');
        for (let x = 0; x < AW; x += 3) Px(x, 92 + (x % 2), '#5a9aca');
        R(0, 96, AW, 3, '#cfcac0'); R(0, 99, AW, 5, '#5a5650'); R(0, 104, AW, 1, '#3a3630');
        for (let x = 20; x < AW; x += 60) { R(x, 100, 5, 5, OUT); R(x + 1, 100, 3, 3, '#e8c020'); }
        for (let x = 0; x < AW; x += 1) { if (x % 40 < 20) { Px(x, 140, '#e8c020'); Px(x, 290, '#e8c020'); } }
        for (let x = 0; x < AW; x += 6) R(x, 294, 3, 11, '#6a5a48');
        R(0, 296, AW, 2, '#8a8a92'); R(0, 302, AW, 2, '#8a8a92'); R(0, 296, AW, 1, '#c8c8d0'); R(0, 302, AW, 1, '#c8c8d0');
        speckle(rr, 900, ['#9a968c', '#b4b0a6', '#8e8a80']);
      },
      landmarks: [
        { kind: 'ship', x: 40, y: 82, w: 150, h: 24, d: 26, nohit: true }, { kind: 'ship', x: 520, y: 80, w: 130, h: 24, d: 26, nohit: true },
        { kind: 'crane', x: 230, y: 128, w: 56, h: 120, d: 14 }, { kind: 'crane', x: 690, y: 126, w: 56, h: 120, d: 14 },
      ],
      back: { styles: ['warehouse', 'warehouse2'], hmin: 26, hmax: 40, base: [122, 130], y0: 104 },
      mid: { styles: ['cont_r', 'cont_b', 'cont_g', 'cont_o', 'cont_r', 'cont_b', 'warehouse'], n: 14, hmin: 12, hmax: 24, cont: true },
      props: [['barrel', 10], ['crate', 12], ['car', 4]],
      front: ['warehouse', 'warehouse2'],
    },
    {
      id: 'desierto', name: 'DESIERTO', hero: 'sahara', music: 'desierto', seed: 303,
      army: { body: '#b89a6a', light: '#d8bc8a', dark: '#8a7048' },
      roads: [{ x: 0, y: 208, w: AW, h: 34 }],
      paint(rr) {
        R(0, 0, AW, AH, '#e2c38c');
        for (let y = 4; y < AH; y += 7) { const ph = rr() * 6; for (let x = 0; x < AW; x++) { const yy = y + Math.round(Math.sin(x / 18 + ph) * 2); Px(x, yy, '#d4b27a'); if (x % 3 === 0) Px(x, yy - 1, '#eed4a4'); } }
        asphalt(rr, 0, 210, AW, 30, '#6a6258', '#746c62', '#5e564c');
        for (let x = 0; x < AW; x += 18) R(x, 224, 9, 1, '#d8c8a0');
        for (let i = 0; i < 30; i++) { let cx = rr() * AW, cy = 211 + rr() * 28; for (let k = 0; k < 8; k++) { Px(cx, cy, '#4a443c'); cx += rr() < 0.5 ? 1 : -1; cy += rr() < 0.5 ? 1 : 0; } }
        for (let x = 0; x < AW; x += 2) { Px(x, 209 + (rr() < 0.5 ? 0 : 1), '#d4b27a'); Px(x, 240 + (rr() < 0.5 ? 0 : 1), '#d4b27a'); }
        speckle(rr, 700, ['#c8a470', '#f0d8a8', '#b89460']);
      },
      landmarks: [{ kind: 'cyl', tc: 'oil', x: 350, y: 112, w: 34, h: 30, d: 8 }, { kind: 'cyl', tc: 'oil', x: 392, y: 116, w: 30, h: 26, d: 8 }, { kind: 'cyl', tc: 'rust', x: 680, y: 170, w: 24, h: 22, d: 6 }],
      back: { styles: ['adobe', 'adobe2', 'adobe'], hmin: 22, hmax: 42, base: [100, 116] },
      mid: { styles: ['adobe', 'adobe2'], n: 9, hmin: 14, hmax: 26 },
      props: [['cactus', 12], ['palm', 7], ['rock', 9], ['barrel', 4]],
      front: ['adobe', 'adobe2'],
    },
    {
      id: 'nieve', name: 'NIEVE', hero: 'acero', music: 'nieve', seed: 404,
      army: { body: '#d8dee6', light: '#f4f8fc', dark: '#a8b0bc' },
      roads: [{ x: 0, y: 210, w: AW, h: 34 }, { x: 0, y: 0, w: 300, h: 92 }],
      paint(rr) {
        R(0, 0, AW, AH, '#e8eef6');
        speckle(rr, 2600, ['#d4deea', '#f8fbff', '#dbe4ef']);
        R(0, 0, 300, 90, '#a8d0ea'); for (let i = 0; i < 300; i += 1) Px(i, 90 + Math.round(Math.sin(i / 9) * 2), '#ffffff');
        for (let i = 0; i < 14; i++) { let cx = rr() * 290, cy = rr() * 84; for (let k = 0; k < 14; k++) { Px(cx, cy, '#e0f2ff'); cx += rr() < 0.6 ? 1 : -1; cy += rr() < 0.5 ? 1 : -1; } }
        asphalt(rr, 0, 212, AW, 30, '#8a94a4', '#949eae', '#808a9a');
        for (let x = 0; x < AW; x++) { Px(x, 218, '#a8b2c0'); Px(x, 236, '#a8b2c0'); if (rr() < 0.5) Px(x, 212, '#ffffff'); if (rr() < 0.5) Px(x, 241, '#ffffff'); }
        for (let i = 0; i < 40; i++) R(rr() * AW, 213 + rr() * 28, 2 + rr() * 6, 1, '#dce6f2');
      },
      landmarks: [{ kind: 'dome', x: 620, y: 112, w: 46, h: 28, d: 10 }],
      back: { styles: ['chalet', 'chalet2', 'snowblock', 'chalet'], hmin: 20, hmax: 44, base: [100, 116], x0: 304 },
      mid: { styles: ['chalet', 'chalet2', 'chalet'], n: 9, hmin: 14, hmax: 24 },
      props: [['pine', 24], ['car', 5]],
      front: ['chalet', 'chalet2', 'snowblock'],
    },
    {
      id: 'fabrica', name: 'FÁBRICA', hero: 'kodiak', music: 'fabrica', seed: 505,
      army: { body: '#6b7a4a', light: '#93a466', dark: '#4f5a36' },
      roads: [{ x: 0, y: 292, w: AW, h: 16 }],
      paint(rr) {
        tiles('#8a8a86', '#7e7e7a', 24, 16);
        for (let i = 0; i < 40; i++) ell(rr() * AW, rr() * AH, 3 + rr() * 8, 2 + rr() * 3, '#6a6a68', 0.6);
        for (let x = 0; x < AW; x += 8) { R(x, 150, 4, 3, '#e8c020'); R(x + 4, 150, 4, 3, '#2a2a2a'); R(x, 282, 4, 3, '#e8c020'); R(x + 4, 282, 4, 3, '#2a2a2a'); }
        for (let x = 0; x < AW; x += 6) R(x, 294, 3, 11, '#5a4a3a');
        R(0, 296, AW, 2, '#7a7a82'); R(0, 302, AW, 2, '#7a7a82'); R(0, 296, AW, 1, '#b8b8c0'); R(0, 302, AW, 1, '#b8b8c0');
        speckle(rr, 1200, ['#7e7e7a', '#969692', '#727270']);
      },
      landmarks: [
        { kind: 'chimney', x: 150, y: 116, w: 14, h: 96, d: 6, smoke: true }, { kind: 'chimney', x: 520, y: 118, w: 14, h: 104, d: 6, smoke: true },
        { kind: 'cyl', tc: 'green', x: 700, y: 172, w: 30, h: 30, d: 8 }, { kind: 'cyl', tc: 'rust', x: 60, y: 176, w: 26, h: 26, d: 8 },
      ],
      back: { styles: ['factory', 'factory2'], hmin: 34, hmax: 58, base: [102, 116] },
      mid: { styles: ['factory2', 'factory', 'cont_o', 'cont_b'], n: 8, hmin: 14, hmax: 26 },
      props: [['barrel', 16], ['crate', 12]],
      front: ['factory', 'factory2'],
    },
    {
      id: 'espacio', name: 'BASE ESPACIAL', hero: 'astron', music: 'espacio', seed: 606,
      army: { body: '#5a6478', light: '#8a94a8', dark: '#3a4256', hover: true },
      roads: [{ x: 0, y: 214, w: AW, h: 26 }],
      paint(rr) {
        R(0, 0, AW, AH, '#3a4256');
        for (let y = 0; y < AH; y += 14) R(0, y, AW, 1, '#2e3446');
        for (let x = 0; x < AW; x += 20) R(x, 0, 1, AH, '#2e3446');
        for (let y = 2; y < AH; y += 14) for (let x = 2; x < AW; x += 20) { Px(x, y, '#5a6478'); Px(x + 16, y + 10, '#4a5266'); }
        R(0, 216, AW, 22, '#2a3040'); for (let x = 0; x < AW; x += 24) { R(x, 226, 12, 2, '#e8e8f0'); }
        for (let x = 6; x < AW; x += 16) { Px(x, 216, '#40f0ff'); Px(x, 237, '#40f0ff'); }
        for (const [cx, cy] of [[400, 170], [120, 290], [680, 290]]) { ell(cx, cy, 30, 14, '#2a3040'); G.ring(cx, cy, 28, '#e8c020'); G.ring(cx, cy, 27, '#e8c020'); for (let i = -6; i <= 6; i++) { Px(cx - 5, cy + i * 0.8, '#e8c020'); Px(cx + 5, cy + i * 0.8, '#e8c020'); } R(cx - 5, cy, 11, 1, '#e8c020'); }
        for (let y = 0; y < 200; y += 1) if (y % 4 < 2) { Px(300, y, '#40f0ff'); }
      },
      landmarks: [{ kind: 'rocket', x: 220, y: 116, w: 34, h: 128, d: 10 }, { kind: 'tower', x: 560, y: 112, w: 28, h: 84, d: 10 }, { kind: 'dish', x: 640, y: 170, w: 34, h: 34, d: 16 }, { kind: 'dome', x: 40, y: 180, w: 44, h: 26, d: 10 }],
      back: { styles: ['hangar', 'lab', 'hangar'], hmin: 28, hmax: 46, base: [100, 112] },
      mid: { styles: ['lab', 'hangar'], n: 6, hmin: 14, hmax: 24, extra: [['cyl', 'gas', 4], ['dome', null, 3], ['dish', null, 2]] },
      props: [['crate', 10], ['barrel', 10]],
      front: ['lab', 'hangar'],
    },
  ];

  // ---------- generación de objetos ----------
  function overlaps(a, b, m) { return a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y0 < b.y1 + m && a.y1 + m > b.y0; }
  function fp(o) { return { x: o.x, w: o.w, y0: o.y - o.d - (o.kind === 'prop' ? 2 : 0), y1: o.y }; }
  function genObjects(st) {
    const rr = G.rng(st.seed);
    const objs = [];
    const roads = st.roads.map((r) => ({ x: r.x, w: r.w, y0: r.y, y1: r.y + r.h }));
    const blocked = (f, m) => roads.some((r) => overlaps(f, r, m)) || objs.some((o) => !o.nohit && overlaps(f, fp(o), m));
    const spawnClear = (f) => { for (const s of [G.SPAWN.v, G.SPAWN.h]) { if (f.x < s.x + 46 && f.x + f.w > s.x - 46 && f.y1 > s.y - 40 && f.y0 < s.y + 30) return false; } return true; };
    const add = (o) => {
      o.seed = Math.floor(rr() * 1e9); o.state = 0;
      o.max = o.hp = o.kind === 'prop' ? 1 : Math.round(40 + o.w * (o.h + o.d) * 0.09);
      o.wt = o.kind === 'prop' ? 0.15 : Math.max(1, (o.w * o.h) / 600);
      objs.push(o); return o;
    };
    (st.landmarks || []).forEach((l) => add(Object.assign({ style: l.kind === 'cyl' ? 'tank' : l.kind }, l)));
    // fila de atrás
    let x = st.back.x0 || 2;
    let guard = 0;
    while (x < AW - 24 && guard++ < 200) {
      const w = Math.round(40 + rr() * 46);
      const h = Math.round(st.back.hmin + rr() * (st.back.hmax - st.back.hmin));
      const d = Math.round(22 + rr() * 12);
      const base = Math.round(st.back.base[0] + rr() * (st.back.base[1] - st.back.base[0]));
      const o = { kind: 'bld', style: st.back.styles[Math.floor(rr() * st.back.styles.length)], x, y: base, w: Math.min(w, AW - 2 - x), h, d, aw: G.pick ? ['#c0392b', '#2e7d4a', '#3d6fd0', '#d9a21b'][Math.floor(rr() * 4)] : null };
      if (o.w < 24) break;
      if (st.back.styles.length && rr() < 0.12) o.heli = o.style === 'white' || o.style === 'glass';
      if (o.style === 'lab') o.dish = true;
      if (blocked(fp(o), 3)) { x += 8; continue; }
      add(o); x += o.w + 4 + Math.round(rr() * 6);
    }
    // centro
    const extra = [];
    (st.mid.extra || []).forEach(([k, tc, n]) => { for (let i = 0; i < n; i++) extra.push([k, tc]); });
    let placed = 0, tries = 0;
    while ((placed < st.mid.n || extra.length) && tries++ < 900) {
      let o;
      if (placed >= st.mid.n && extra.length) {
        const [k, tc] = extra[extra.length - 1];
        const sz = k === 'cyl' ? [22, 22, 6] : k === 'dome' ? [36, 22, 10] : [30, 30, 14];
        o = { kind: k, tc, style: k, x: Math.round(20 + rr() * (AW - 70)), y: Math.round(150 + rr() * 150), w: sz[0], h: sz[1], d: sz[2] };
        if (!blocked(fp(o), 8) && spawnClear(fp(o))) { add(o); extra.pop(); }
        continue;
      }
      const w = Math.round(st.mid.cont ? 26 + rr() * 10 : 28 + rr() * 26);
      const h = Math.round(st.mid.hmin + rr() * (st.mid.hmax - st.mid.hmin));
      const d = Math.round(st.mid.cont ? 12 + rr() * 4 : 14 + rr() * 8);
      o = { kind: 'bld', style: st.mid.styles[Math.floor(rr() * st.mid.styles.length)], x: Math.round(10 + rr() * (AW - 20 - w)), y: Math.round(150 + rr() * 150), w, h, d, aw: ['#c0392b', '#2e7d4a', '#3d6fd0', '#d9a21b'][Math.floor(rr() * 4)] };
      if (o.style.startsWith('cont')) { o.h = rr() < 0.5 ? 12 : 24; o.cont2 = o.h > 12; }
      if (blocked(fp(o), 10) || !spawnClear(fp(o))) continue;
      add(o); placed++;
    }
    // atrezo
    for (const [kind, n] of st.props) {
      let c = 0, t = 0;
      while (c < n && t++ < 400) {
        const w = kind === 'tree' ? 12 + Math.round(rr() * 4) : kind === 'car' ? 12 : kind === 'pine' ? 14 : kind === 'palm' ? 14 : kind === 'rock' ? 8 + Math.round(rr() * 6) : kind === 'cactus' ? 12 : 8;
        const o = { kind: 'prop', style: kind, x: Math.round(4 + rr() * (AW - 20)), y: Math.round(108 + rr() * 200), w, h: kind === 'pine' ? 22 : kind === 'palm' ? 24 : kind === 'cactus' ? 18 : kind === 'tree' ? 16 : 10, d: 4 };
        if (kind === 'car') { const cs = [['#d23b3b', '#ee7a6a'], ['#e9e6dc', '#ffffff'], ['#3d6fd0', '#79a3ee'], ['#f0c23a', '#ffe58a'], ['#2e9d5a', '#6fd08f']]; const p = cs[Math.floor(rr() * cs.length)]; o.c = p[0]; o.c2 = p[1]; }
        if (kind === 'barrel') o.c = ['#c83a2a', '#2e5e9e', '#e8c020', '#3a8a4a'][Math.floor(rr() * 4)];
        const f = fp(o);
        const onRoad = roads.some((r) => overlaps(f, r, 0));
        if (kind === 'car' ? !onRoad && st.id === 'ciudad' : onRoad) continue;
        if (objs.some((q) => overlaps(f, fp(q), 2))) continue;
        add(o); c++;
      }
    }
    // fila de delante (asoma por abajo)
    x = 0; guard = 0;
    while (x < AW && guard++ < 50) {
      const w = Math.round(50 + rr() * 50);
      const o = { kind: 'bld', style: st.front[Math.floor(rr() * st.front.length)], x, y: AH + 22, w: Math.min(w, AW - x), h: 22 + Math.round(rr() * 6), d: 30 + Math.round(rr() * 8), front: true };
      if (o.style.startsWith('cont')) o.style = 'warehouse';
      if (o.w > 20) add(o);
      x += o.w + 6 + Math.round(rr() * 30);
    }
    objs.forEach((o) => { o.key = o.y - o.d * 0.5; o.top = o.y - o.h - o.d; });
    return objs;
  }

  G.buildStage = function (idx) {
    const st = G.STAGES[idx];
    const bg = G.mkCanvas(AW, AH);
    const prev = G.ctx(); G.target(bg.x);
    try { st.paint(G.rng(st.seed + 7)); } finally { G.target(prev); }
    const objs = genObjects(st);
    return { st, bg: bg.c, objs };
  };
  // miniatura del escenario (para el menú)
  const thumbs = {};
  G.stageThumb = function (idx) {
    if (thumbs[idx]) return thumbs[idx];
    const S = G.buildStage(idx);
    const cv = G.mkCanvas(AW, AH);
    cv.x.drawImage(S.bg, 0, 0);
    const prev = G.ctx(); G.target(cv.x);
    try {
      S.objs.slice().sort((a, b) => a.key - b.key).forEach((o) => { const im = G.objImg(o); cv.x.drawImage(im.c, o.x + im.dx, o.y + im.dy); });
    } finally { G.target(prev); }
    thumbs[idx] = cv.c;
    return cv.c;
  };
})(window.G);
