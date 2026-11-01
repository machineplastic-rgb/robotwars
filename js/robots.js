'use strict';
// Robots dibujados por código en pixel art (piezas con contorno y luz), con poses y vehículos.
// Diseños originales: 4 villanos para elegir y 6 rivales.
(function (G) {
  const R = G.R, Px = G.Px, A = G.A;
  const part = (...a) => G.part(...a), ell = (...a) => G.ell(...a), polyO = (...a) => G.polyO(...a), poly = (...a) => G.poly(...a);
  const OUT = '#120c18';
  const P = (o, d, b, l, h) => ({ o, d, b, l, h });
  const PAL = {
    purple: P('#140a1e', '#3b1d5e', '#5d309a', '#8152c4', '#ac84ea'),
    gunm: P('#140a1e', '#26242e', '#46444f', '#686674', '#8e8c9a'),
    green: P('#0e2a06', '#3fae12', '#8cff3c', '#d2ffa8', '#ffffff'),
    buckle: P('#140a1e', '#5c5a66', '#8a8896', '#b0aebb', '#d6d4de'),
    black: P('#08080c', '#1a1a22', '#2c2c38', '#464658', '#6a6a80'),
    red: P('#1e0606', '#8c1a1a', '#d2302a', '#f4644c', '#ffb0a0'),
    yellowg: P('#2a2000', '#c89a00', '#ffd820', '#fff080', '#ffffff'),
    steel: P('#0e1014', '#2c323c', '#48525e', '#6a7684', '#94a0ae'),
    orange: P('#1e0c00', '#a84a08', '#f07818', '#ffa452', '#ffd2a0'),
    toxic: P('#061a06', '#1f7a1a', '#3cc832', '#7aee5a', '#c4ffa8'),
    magenta: P('#1a0418', '#a0189a', '#f040e8', '#ff9cf8', '#ffffff'),
    yellow: P('#1f1606', '#b87d0c', '#f2c21e', '#ffe266', '#fff6c2'),
    grey: P('#1f1606', '#25252c', '#40404a', '#62626e', '#8a8a96'),
    cyan: P('#06222b', '#1890b0', '#46e3ff', '#bff8ff', '#ffffff'),
    white: P('#14141a', '#a8acb4', '#dcdfe4', '#f4f5f7', '#ffffff'),
    sand: P('#1e1608', '#a88a5a', '#d8c08c', '#f0dcb0', '#fff4dc'),
    lime: P('#0c2206', '#3a9a1a', '#7ae83a', '#c0ff90', '#ffffff'),
    bluesteel: P('#0a0e16', '#3a4a62', '#5a7090', '#8aa0bc', '#c0d0e4'),
    navy: P('#05070c', '#141a28', '#222c42', '#3a4862', '#5a6a88'),
    ice: P('#04121c', '#1c78b0', '#4cc4ff', '#b4ecff', '#ffffff'),
    brown: P('#1a0c04', '#7a3e14', '#b8642a', '#e08c48', '#ffc08a'),
    slate: P('#0a0c10', '#2a3038', '#3e4652', '#5c6674', '#808a98'),
    amber: P('#2a1400', '#c87800', '#ffb020', '#ffe080', '#ffffff'),
    chrome: P('#0c0e14', '#7c8696', '#b8c2d0', '#e0e6ee', '#ffffff'),
    indigo: P('#06061a', '#1c1c5a', '#2e2e8c', '#4a4ac0', '#7a7aee'),
    aqua: P('#03202a', '#10a0c0', '#40f0ff', '#c0ffff', '#ffffff'),
    gold: P('#2a1a00', '#a87810', '#e8b830', '#ffe070', '#fff8d0'),
  };
  G.RPAL = PAL;

  G.ROB = {
    demoledor: { name: 'DEMOLEDOR', side: 'v', veh: 'tanque', main: PAL.purple, sec: PAL.gunm, acc: PAL.green, thigh: 'main', head: 'crest', sh: 'pads', chest: 'core', legs: 'knees', buckle: 'face', stats: { str: 5, spd: 2, def: 5, fly: 2 }, desc: 'LENTO PERO BRUTAL' },
    tornado: { name: 'TORNADO', side: 'v', veh: 'avion', main: PAL.black, sec: PAL.red, acc: PAL.yellowg, thigh: 'sec', head: 'pointy', sh: 'wings', chest: 'intakes', legs: 'thrusters', stats: { str: 3, spd: 5, def: 2, fly: 5 }, desc: 'RÁPIDO Y VUELA MÁS' },
    triturador: { name: 'TRITURADOR', side: 'v', veh: 'camion', main: PAL.steel, sec: PAL.orange, acc: PAL.orange, thigh: 'main', head: 'helmet', sh: 'stacks', chest: 'grill', legs: 'wheels', stats: { str: 5, spd: 3, def: 4, fly: 2 }, desc: 'EMBISTE CON TODO' },
    veneno: { name: 'VENENO', side: 'v', veh: 'coche', main: PAL.toxic, sec: PAL.black, acc: PAL.magenta, thigh: 'sec', head: 'horns', sh: 'wheelsh', chest: 'lights', legs: 'stripes', stats: { str: 3, spd: 5, def: 3, fly: 3 }, desc: 'EL MÁS VELOZ' },
    furia: { name: 'FURIA', side: 'v', veh: 'coche', main: PAL.orange, sec: PAL.gunm, acc: P('#140a1e', '#5d309a', '#8a52d8', '#b48aff', '#e0ccff'), thigh: 'main', head: 'hair', sh: 'antpads', chest: 'windows', legs: 'rollers', arms: 'ribs', stats: { str: 4, spd: 4, def: 3, fly: 3 }, desc: 'FURIOSO Y CON RUEDAS' },
    voltar: { name: 'VOLTAR', side: 'h', veh: 'coche', main: PAL.yellow, sec: PAL.grey, acc: PAL.cyan, thigh: 'sec', head: 'ridge', sh: 'lights', chest: 'diamond', legs: 'wheels', stats: { str: 3, spd: 4, def: 3, fly: 3 } },
    blazer: { name: 'BLAZER', side: 'h', veh: 'avion', main: PAL.red, sec: PAL.white, acc: PAL.amber, visor: PAL.cyan, thigh: 'sec', head: 'fin', sh: 'wings', chest: 'flame', legs: 'thrusters', stats: { str: 4, spd: 4, def: 3, fly: 5 } },
    sahara: { name: 'SAHARA', side: 'h', veh: 'camion', main: PAL.sand, sec: PAL.white, acc: PAL.lime, thigh: 'sec', head: 'visor', sh: 'round', chest: 'plates', legs: 'wheels', stats: { str: 4, spd: 3, def: 4, fly: 2 } },
    acero: { name: 'ACERO', side: 'h', veh: 'tanque', main: PAL.bluesteel, sec: PAL.navy, acc: PAL.ice, thigh: 'sec', head: 'helmet', sh: 'blocks', chest: 'vents', legs: 'treads', stats: { str: 5, spd: 2, def: 5, fly: 2 } },
    kodiak: { name: 'KODIAK', side: 'h', veh: 'camion', main: PAL.brown, sec: PAL.slate, acc: PAL.amber, thigh: 'sec', head: 'jaw', sh: 'round', chest: 'grill', legs: 'pistons', stats: { str: 5, spd: 3, def: 4, fly: 3 } },
    astron: { name: 'ASTRÓN', side: 'h', veh: 'avion', main: PAL.chrome, sec: PAL.indigo, acc: PAL.aqua, thigh: 'sec', head: 'crown', sh: 'bigwings', chest: 'bigcore', legs: 'thrusters', stats: { str: 5, spd: 4, def: 5, fly: 5 }, boss: true },
  };
  for (const id in G.ROB) G.ROB[id].id = id;

  // ---------- personalización de colores (taller) ----------
  G.MAINPALS = [null, PAL.red, P('#05081e', '#1a2e8c', '#2e52d2', '#5a84f4', '#a8c4ff'), PAL.toxic, PAL.orange, PAL.black, PAL.white, PAL.gold,
    P('#1e0614', '#a01a6a', '#e83a9a', '#ff7ac4', '#ffc8e8'), PAL.purple, PAL.aqua];
  G.MAINNAMES = ['ORIGINAL', 'ROJO', 'AZUL', 'VERDE', 'NARANJA', 'NEGRO', 'BLANCO', 'DORADO', 'ROSA', 'MORADO', 'CIAN'];
  G.ACCPALS = [null, PAL.green, PAL.cyan, PAL.magenta, PAL.yellowg, P('#2a0404', '#b01a1a', '#ff3a3a', '#ff9a9a', '#ffffff'), PAL.orange, P('#1a1a22', '#b8bcc8', '#f4f6fa', '#ffffff', '#ffffff')];
  G.ACCNAMES = ['ORIGINAL', 'VERDE', 'CIAN', 'ROSA', 'AMARILLO', 'ROJO', 'NARANJA', 'BLANCO'];
  G.customId = function (id, m, a) {
    m = m || 0; a = a || 0;
    if (!m && !a) return id;
    const cid = id + '~' + m + '~' + a;
    if (!G.ROB[cid]) {
      const base = G.ROB[id];
      G.ROB[cid] = Object.assign({}, base, { id: cid, main: m ? G.MAINPALS[m] : base.main, acc: a ? G.ACCPALS[a] : base.acc });
    }
    return cid;
  };
  // id del villano con los colores que tenga guardados
  G.villainId = function (idx) {
    const id = G.VILLAINS[idx || 0];
    const c = (G.save.data.shop.colors || {})[id] || [0, 0];
    return G.customId(id, c[0], c[1]);
  };
  G.VILLAINS = ['demoledor', 'tornado', 'triturador', 'veneno', 'furia'];
  G.HEROES = ['voltar', 'blazer', 'sahara', 'acero', 'kodiak', 'astron'];
  G.VEHNAME = { tanque: 'TANQUE', avion: 'AVIÓN', camion: 'CAMIÓN', coche: 'COCHE' };

  const SW = 132, SH = 132, OX = 56, OY = 128;
  G.SPR = { W: SW, H: SH, OX, OY };

  // ---------- piezas comunes ----------
  function fist(x, y, w, h, k, horiz) {
    part(x, y, w, h, k, 2);
    if (horiz) for (let i = 0; i < 3; i++) R(x + 3, y + 4 + i * 4, w - 6, 1, k.d);
    else for (let i = 0; i < 2; i++) R(x + 3, y + 4 + i * 3, w - 6, 1, k.d);
  }
  function wheelV(x, y) {
    R(x, y, 7, 12, '#0a0a0d'); R(x + 1, y + 1, 5, 10, '#1e1e24');
    R(x + 2, y + 3, 3, 6, '#8a8a96'); Px(x + 3, y + 4, '#c8c8d2'); R(x + 1, y + 2, 1, 8, '#33333c');
  }
  function wheelS(cx, cy, r, f) {
    ell(cx, cy, r, r, OUT); ell(cx, cy, r - 1, r - 1, '#1e1e24'); ell(cx, cy, r - 3, r - 3, '#8a8a96'); ell(cx, cy, 1, 1, '#3a3a44');
    const a = f ? 0.8 : 0;
    Px(cx + Math.round(Math.cos(a) * (r - 3)), cy + Math.round(Math.sin(a) * (r - 3)), '#d8d8e0');
    Px(cx - Math.round(Math.cos(a) * (r - 3)), cy - Math.round(Math.sin(a) * (r - 3)), '#d8d8e0');
  }

  function backLayer(s, ox, oy) {
    const m = s.main, k = s.sec, a = s.acc;
    if (s.sh === 'wings' || s.sh === 'bigwings') {
      const big = s.sh === 'bigwings';
      const wl = big ? 60 : 48, wh = big ? 40 : 30;
      for (const d of [-1, 1]) {
        const rx = ox + d * 13, tx = ox + d * (13 + wl * 0.55), bx = ox + d * (13 + wl * 0.66);
        polyO([[rx, oy - 80], [tx, oy - 80 - wh], [bx, oy - 80 - wh + 7], [ox + d * 18, oy - 62]], m.b, OUT);
        poly([[rx, oy - 79], [tx, oy - 79 - wh + 1], [tx + d * 2, oy - 78 - wh + 4], [ox + d * 16, oy - 72]], m.l);
        G.line(rx + d, oy - 78, tx, oy - 78 - wh + 2, a.b);
        if (big) poly([[ox + d * 17, oy - 70], [bx - d * 3, oy - 80 - wh + 10], [bx, oy - 80 - wh + 8], [ox + d * 19, oy - 63]], PAL.gold.b);
      }
    }
    if (s.sh === 'stacks') {
      for (const sx of [ox - 33, ox + 27]) {
        R(sx, oy - 107, 7, 26, OUT); R(sx + 1, oy - 106, 5, 24, '#b8bec8'); R(sx + 1, oy - 106, 1, 24, '#ffffff');
        R(sx + 4, oy - 106, 1, 24, '#7a808a'); R(sx + 1, oy - 106, 5, 2, '#2a2a30');
      }
    }
    if (s.sh === 'wheelsh') {
      part(ox - 31, oy - 97, 62, 5, k, 1);
      R(ox - 21, oy - 92, 3, 9, OUT); R(ox + 18, oy - 92, 3, 9, OUT);
      R(ox - 29, oy - 96, 58, 1, a.b);
    }
  }

  // brazo con rayas (estilo 'ribs'): rayas horizontales en toda la pieza
  function ribs(s, x, y, w, h, horiz) {
    if (s.arms !== 'ribs') return;
    if (horiz) for (let i = x + 3; i < x + w - 2; i += 3) R(i, y + 2, 1, h - 4, s.main.o);
    else for (let i = y + 3; i < y + h - 2; i += 3) R(x + 2, i, w - 4, 1, s.main.o);
  }
  function rearArm(s, mode, ox, oy) {
    const m = s.main, k = s.sec;
    if (mode === 'up') { part(ox - 36, oy - 92, 13, 14, m); ribs(s, ox - 36, oy - 92, 13, 14); part(ox - 38, oy - 108, 14, 17, m, 2); ribs(s, ox - 38, oy - 108, 14, 17); R(ox - 35, oy - 102, 8, 1, m.d); fist(ox - 38, oy - 121, 15, 13, k); }
    else if (mode === 'back') { part(ox - 34, oy - 66, 13, 13, m); ribs(s, ox - 34, oy - 66, 13, 13); part(ox - 39, oy - 55, 15, 16, m, 2); ribs(s, ox - 39, oy - 55, 15, 16); R(ox - 36, oy - 49, 9, 1, m.d); fist(ox - 41, oy - 41, 14, 11, k); }
    else { part(ox - 34, oy - 66, 13, 13, m); ribs(s, ox - 34, oy - 66, 13, 13); part(ox - 37, oy - 54, 16, 17, m, 2); ribs(s, ox - 37, oy - 54, 16, 17); R(ox - 34, oy - 48, 10, 1, m.d); R(ox - 34, oy - 44, 10, 1, m.d); fist(ox - 36, oy - 38, 14, 11, k); }
  }
  function frontArm(s, mode, ox, oy) {
    const m = s.main, k = s.sec;
    switch (mode) {
      case 'punch': part(ox + 22, oy - 73, 15, 12, m); ribs(s, ox + 22, oy - 73, 15, 12, true); part(ox + 35, oy - 75, 21, 15, m, 3); ribs(s, ox + 35, oy - 75, 21, 15, true); R(ox + 40, oy - 70, 12, 1, m.d); R(ox + 40, oy - 66, 12, 1, m.d); fist(ox + 55, oy - 77, 15, 18, k, true); break;
      case 'wind': part(ox + 20, oy - 70, 13, 12, m); part(ox + 6, oy - 74, 17, 13, m, 2); ribs(s, ox + 6, oy - 74, 17, 13, true); fist(ox - 3, oy - 76, 13, 14, k, true); break;
      case 'up': part(ox + 23, oy - 92, 13, 14, m); ribs(s, ox + 23, oy - 92, 13, 14); part(ox + 24, oy - 108, 14, 17, m, 2); ribs(s, ox + 24, oy - 108, 14, 17); R(ox + 27, oy - 102, 8, 1, m.d); fist(ox + 23, oy - 121, 15, 13, k); break;
      case 'back': part(ox + 21, oy - 66, 13, 12, m); ribs(s, ox + 21, oy - 66, 13, 12); part(ox + 25, oy - 56, 15, 15, m, 2); ribs(s, ox + 25, oy - 56, 15, 15); fist(ox + 28, oy - 43, 13, 10, k); break;
      default: part(ox + 22, oy - 66, 13, 13, m); ribs(s, ox + 22, oy - 66, 13, 13); part(ox + 23, oy - 54, 16, 17, m, 2); ribs(s, ox + 23, oy - 54, 16, 17); R(ox + 26, oy - 48, 10, 1, m.d); R(ox + 26, oy - 44, 10, 1, m.d); fist(ox + 24, oy - 38, 14, 11, k);
    }
  }
  // pies con ruedas y puntera (estilo 'rollers')
  function feetX(s, x, y, w, h, left) {
    if (s.legs !== 'rollers') return;
    const tx = left ? x - 4 : x + w + 3;
    G.polyO([[left ? x + 1 : x + w - 1, y + 1], [tx, y + h], [left ? x + 1 : x + w - 1, y + h]], s.main.b, OUT);
    for (const wx of [x + 5, x + w - 6]) { ell(wx, y + h + 1, 3, 2.5, OUT); ell(wx, y + h + 1, 2, 1.5, '#5a5a66'); Px(wx, y + h + 1, '#c8c8d2'); }
  }
  function legDetail(s, x, y, w, h, left) {
    const a = s.acc, m = s.main;
    switch (s.legs) {
      case 'knees': R(x + 4, y + 3, 7, 5, a.o); R(x + 5, y + 4, 5, 3, a.b); Px(x + 5, y + 4, a.l); R(x + 6, y + 12, 2, Math.max(2, h - 17), m.d); break;
      case 'wheels': wheelV(left ? x - 5 : x + w - 2, y + 6); R(x + 4, y + 4, w - 8, 2, m.d); break;
      case 'thrusters': R(x + 3, y + 5, w - 6, 3, a.d); R(x + 3, y + 5, w - 6, 1, a.b); R(x + 5, y + 12, 2, Math.max(2, h - 17), m.d); R(x + w - 7, y + 12, 2, Math.max(2, h - 17), m.d); break;
      case 'treads': R(x + 2, y + 3, w - 4, h - 6, OUT); R(x + 3, y + 4, w - 6, h - 8, '#2a2a30'); for (let i = y + 5; i < y + h - 4; i += 3) R(x + 3, i, w - 6, 1, '#4c4c56'); break;
      case 'pistons': R(x + 5, y + 3, 5, h - 8, OUT); R(x + 6, y + 4, 3, h - 10, '#c8ccd4'); R(x + 6, y + 4, 1, h - 10, '#ffffff'); R(x + 5, y + 3, 5, 3, m.d); break;
      case 'stripes': for (let i = 0; i < 3 && 5 + i * 6 < h - 3; i++) R(x + 3, y + 5 + i * 6, w - 6, 2, a.b); break;
      case 'rollers': R(x + 3, y + 4, w - 6, 2, a.b); R(x + 3, y + 4, w - 6, 1, a.l); R(x + 5, y + 10, 2, Math.max(2, h - 15), m.d); break;
    }
  }
  function legs(s, L, cx, fy) {
    const m = s.main, k = s.sec, th = s.thigh === 'sec' ? k : m;
    if (L.legs === 'tuck') {
      for (const sx of [-17, 4]) { part(cx + sx, fy - 47, 13, 12, th); part(cx + sx - 2, fy - 38, 15, 18, m, 2); legDetail(s, cx + sx - 2, fy - 38, 15, 18, sx < 0); part(cx + sx - 5, fy - 22, 19, 8, k, 2); feetX(s, cx + sx - 5, fy - 22, 19, 8, sx < 0); }
      return;
    }
    if (L.legs === 'straight') {
      for (const sx of [-13, 2]) { part(cx + sx, fy - 45, 11, 15, th); part(cx + sx - 1, fy - 32, 13, 24, m, 2); legDetail(s, cx + sx - 1, fy - 32, 13, 24, sx < 0); part(cx + sx - 1, fy - 10, 13, 9, k, 2); R(cx + sx + 2, fy - 2, 7, 2, OUT); }
      return;
    }
    if (L.legs === 'crouch') {
      for (const [sx, d] of [[-18, -1], [5, 1]]) { part(cx + sx, fy - 38, 13, 10, th); part(cx + sx - 2 + d * 2, fy - 30, 15, 22, m, 2); legDetail(s, cx + sx - 2 + d * 2, fy - 30, 15, 22, d < 0); part(cx + sx - 5 + d * 2, fy - 8, 19, 8, k, 2); feetX(s, cx + sx - 5 + d * 2, fy - 8, 19, 8, d < 0); }
      return;
    }
    for (const [sx, lg] of [[-16, L.lL], [4, L.lR]]) {
      const dx = lg.dx, lf = lg.lift;
      part(cx + sx + dx, fy - 45, 12, 15, th);
      part(cx + sx - 3 + dx, fy - 32 - lf, 15, 26, m, 2); legDetail(s, cx + sx - 3 + dx, fy - 32 - lf, 15, 26, sx < 0);
      part(cx + sx - 6 + dx, fy - 8 - lf, 19, 8, k, 2); feetX(s, cx + sx - 6 + dx, fy - 8 - lf, 19, 8, sx < 0);
    }
  }
  function waist(s, x, y) {
    const k = s.sec, m = s.main, a = s.acc;
    part(x - 18, y - 53, 36, 10, k, 2);
    if (s.buckle === 'face') {
      const b = PAL.buckle;
      part(x - 7, y - 55, 14, 12, b, 2);
      Px(x - 3, y - 51, b.o); Px(x + 2, y - 51, b.o); Px(x - 3, y - 48, b.o); R(x - 2, y - 47, 4, 1, b.o); Px(x + 2, y - 48, b.o);
    } else { part(x - 6, y - 54, 12, 10, m, 2); R(x - 2, y - 51, 4, 3, a.b); Px(x - 2, y - 51, a.l); }
  }
  function torso(s, ox, oy) {
    const m = s.main, k = s.sec, a = s.acc;
    part(ox - 21, oy - 79, 42, 27, m, 4);
    R(ox - 19, oy - 74, 6, 20, m.l); R(ox + 13, oy - 74, 6, 20, m.d);
    switch (s.chest) {
      case 'core':
        A(ox - 10, oy - 76, 20, 15, a.b, 0.22); part(ox - 7, oy - 73, 14, 10, a, 2);
        R(ox - 13, oy - 61, 26, 2, m.o); R(ox - 13, oy - 58, 26, 2, m.o); break;
      case 'diamond': {
        part(ox - 13, oy - 75, 26, 15, { o: m.o, d: m.d, b: m.l, l: m.h, h: '#ffffff' }, 2);
        for (const sx of [ox - 17, ox + 14]) { R(sx, oy - 70, 3, 1, m.d); R(sx, oy - 67, 3, 1, m.d); }
        const kx = ox, ky = oy - 68;
        A(kx - 6, ky - 4, 13, 9, a.b, 0.25);
        [1, 3, 5, 3, 1].forEach((wd, i) => { R(kx - Math.floor(wd / 2) - 1, ky - 2 + i, wd + 2, 1, a.o); });
        [1, 3, 5, 3, 1].forEach((wd, i) => { R(kx - Math.floor(wd / 2), ky - 2 + i, wd, 1, a.b); });
        Px(kx, ky - 2, a.h); Px(kx - 1, ky - 1, a.h);
        for (const [dx, dy] of [[0, 0], [6, 0], [1, 1], [5, 1], [2, 2], [4, 2], [3, 3]]) Px(ox - 3 + dx, oy - 58 + dy, k.o);
        break;
      }
      case 'intakes':
        poly([[ox - 18, oy - 75], [ox - 4, oy - 75], [ox - 6, oy - 63], [ox - 18, oy - 63]], OUT);
        poly([[ox + 18, oy - 75], [ox + 4, oy - 75], [ox + 6, oy - 63], [ox + 18, oy - 63]], OUT);
        R(ox - 16, oy - 73, 9, 1, '#3a3a48'); R(ox + 8, oy - 73, 9, 1, '#3a3a48');
        R(ox - 2, oy - 77, 4, 22, k.b); R(ox - 2, oy - 77, 1, 22, k.l);
        R(ox - 1, oy - 60, 2, 2, a.b); break;
      case 'grill':
        part(ox - 12, oy - 75, 24, 14, k, 2);
        for (let i = 0; i < 6; i++) R(ox - 9 + i * 3, oy - 72, 1, 9, k.d);
        R(ox - 18, oy - 74, 4, 3, OUT); R(ox - 17, oy - 73, 2, 1, '#fff6c0');
        R(ox + 14, oy - 74, 4, 3, OUT); R(ox + 15, oy - 73, 2, 1, '#fff6c0');
        R(ox - 14, oy - 59, 28, 3, OUT); R(ox - 13, oy - 58, 26, 1, '#c8ccd4'); break;
      case 'lights':
        ell(ox - 11, oy - 70, 4, 3, OUT); ell(ox - 11, oy - 70, 3, 2, '#fffbe0'); ell(ox + 11, oy - 70, 4, 3, OUT); ell(ox + 11, oy - 70, 3, 2, '#fffbe0');
        for (let i = 0; i < 5; i++) { R(ox - 5 + i, oy - 76 + i * 2, 2, 2, a.b); R(ox + 3 - i, oy - 76 + i * 2, 2, 2, a.b); }
        R(ox - 13, oy - 60, 26, 2, m.o); break;
      case 'flame': {
        const rows = ['....#....', '...##....', '...###...', '..####.#.', '..#####..', '.###o###.', '.##ooo##.', '##ooyoo##', '#oooyyoo#', '.#oyyyo#.', '..#####..'];
        rows.forEach((r, j) => { for (let i = 0; i < 9; i++) { const c = r[i]; if (c === '.') continue; Px(ox - 4 + i, oy - 77 + j, c === '#' ? a.d : c === 'o' ? a.b : a.l); } });
        R(ox - 13, oy - 60, 26, 2, m.o); break;
      }
      case 'plates': {
        const pl = { o: m.o, d: m.d, b: m.l, l: m.h, h: '#ffffff' };
        part(ox - 17, oy - 77, 16, 13, pl, 2); part(ox + 1, oy - 77, 16, 13, pl, 2);
        R(ox - 3, oy - 61, 6, 3, a.o); R(ox - 2, oy - 60, 4, 1, a.b); break;
      }
      case 'windows':
        R(ox - 20, oy - 78, 40, 17, a.d);
        for (const wx of [ox - 19, ox + 1]) {
          R(wx, oy - 77, 18, 15, OUT); R(wx + 1, oy - 76, 16, 13, '#2b3a4c'); R(wx + 1, oy - 76, 16, 2, '#3e5470');
          for (const k of [0, 6]) G.line(wx + 3 + k, oy - 65, wx + 9 + k, oy - 75, '#8fb4dc');
        }
        R(ox - 1, oy - 77, 2, 15, a.b);
        for (let i = 0; i < 3; i++) { R(ox - 8, oy - 59 + i * 3, 16, 2, m.d); R(ox - 8, oy - 59 + i * 3, 16, 1, m.l); }
        break;
      case 'vents':
        for (let i = 0; i < 4; i++) R(ox - 14, oy - 75 + i * 4, 28, 2, m.o);
        R(ox - 4, oy - 60, 8, 3, a.o); R(ox - 3, oy - 59, 6, 1, a.b); break;
      case 'bigcore':
        A(ox - 12, oy - 77, 24, 20, a.b, 0.2);
        ell(ox, oy - 67, 9, 8, OUT); ell(ox, oy - 67, 8, 7, PAL.gold.b); ell(ox, oy - 67, 6, 5, a.d); ell(ox, oy - 67, 5, 4, a.b); ell(ox - 1, oy - 68, 2, 2, a.l);
        R(ox - 18, oy - 77, 36, 1, PAL.gold.l); break;
    }
  }
  function shoulders(s, ox, oy) {
    const m = s.main, k = s.sec, a = s.acc;
    switch (s.sh) {
      case 'pads': for (const sx of [ox - 40, ox + 17]) { part(sx, oy - 85, 23, 19, m, 5); for (const [rx, ry] of [[4, 8], [16, 8], [4, 14], [16, 14]]) R(sx + rx, oy - 85 + ry, 2, 2, m.o); } break;
      case 'blocks': for (const sx of [ox - 40, ox + 17]) { part(sx, oy - 86, 23, 18, m, 5); R(sx + 3, oy - 76, 17, 2, k.b); R(sx + 3, oy - 72, 17, 2, k.b); R(sx + 8, oy - 83, 7, 2, a.b); } break;
      case 'lights': for (const sx of [ox - 36, ox + 17]) { part(sx, oy - 84, 20, 16, m, 5); R(sx + 3, oy - 74, 5, 3, m.o); R(sx + 4, oy - 73, 3, 1, '#fffbe0'); R(sx + 12, oy - 74, 5, 3, m.o); R(sx + 13, oy - 73, 3, 1, '#fffbe0'); } break;
      case 'wings': case 'bigwings':
        for (const sx of [ox - 35, ox + 16]) { part(sx, oy - 84, 19, 15, m, 4); R(sx + 3, oy - 74, 13, 2, a.b); if (s.sh === 'bigwings') R(sx + 2, oy - 83, 15, 1, PAL.gold.l); }
        break;
      case 'stacks': for (const sx of [ox - 38, ox + 16]) { part(sx, oy - 84, 22, 17, m, 5); R(sx + 3, oy - 73, 16, 3, k.b); R(sx + 3, oy - 73, 16, 1, k.l); } break;
      case 'wheelsh': for (const [sx, wx] of [[ox - 36, ox - 43], [ox + 16, ox + 34]]) { wheelV(wx, oy - 86); part(sx, oy - 84, 20, 15, m, 4); R(sx + 3, oy - 74, 14, 2, a.b); } break;
      case 'antpads':
        for (const sx of [ox - 40, ox + 17]) {
          const ax = sx + 11;
          G.line(ax - 4, oy - 85, ax, oy - 97, OUT); G.line(ax + 4, oy - 85, ax, oy - 97, OUT);
          G.line(ax - 3, oy - 85, ax, oy - 95, k.l); G.line(ax + 3, oy - 85, ax, oy - 95, k.l);
          R(ax - 2, oy - 90, 5, 1, OUT); R(ax - 1, oy - 99, 3, 3, a.b);
          part(sx, oy - 85, 23, 19, m, 5);
          ell(sx + 11, oy - 75, 5, 5, OUT); ell(sx + 11, oy - 75, 4, 4, a.b); ell(sx + 10, oy - 76, 2, 2, a.l);
          G.line(sx + 9, oy - 77, sx + 13, oy - 73, OUT); G.line(sx + 13, oy - 77, sx + 9, oy - 73, OUT);
        }
        break;
      case 'round': for (const c of [ox - 29, ox + 28]) { ell(c, oy - 76, 12, 10, m.o); ell(c, oy - 76, 11, 9, m.b); ell(c - 2, oy - 79, 8, 5, m.l); ell(c - 3, oy - 81, 4, 2, m.h); R(c - 9, oy - 71, 18, 2, k.b); } break;
    }
  }
  function head(s, hx, hy) {
    const m = s.main, k = s.sec, a = s.acc, vis = s.visor || a;
    switch (s.head) {
      case 'crest':
        part(hx - 4, hy - 106, 8, 10, m, 2); R(hx - 4, hy - 109, 8, 5, a.o); R(hx - 3, hy - 108, 6, 3, a.b); Px(hx - 3, hy - 108, a.l);
        part(hx - 10, hy - 98, 20, 17, m, 3);
        R(hx - 8, hy - 92, 16, 5, '#0c0612'); R(hx - 7, hy - 91, 5, 3, a.b); R(hx + 2, hy - 91, 5, 3, a.b);
        Px(hx - 7, hy - 91, a.h); Px(hx + 2, hy - 91, a.h); Px(hx - 3, hy - 91, '#0c0612'); Px(hx + 2, hy - 91, '#0c0612');
        part(hx - 6, hy - 87, 12, 5, k); Px(hx - 4, hy - 85, k.o); Px(hx - 1, hy - 85, k.o); Px(hx + 2, hy - 85, k.o);
        break;
      case 'ridge':
        part(hx - 12, hy - 93, 4, 8, k); part(hx + 8, hy - 93, 4, 8, k);
        part(hx - 9, hy - 98, 18, 17, m, 3); R(hx - 1, hy - 101, 3, 6, m.o); R(hx, hy - 100, 1, 4, m.h);
        R(hx - 7, hy - 92, 14, 4, vis.o); R(hx - 6, hy - 91, 12, 2, vis.b); R(hx - 6, hy - 91, 4, 1, vis.h);
        part(hx - 5, hy - 87, 10, 5, k); R(hx - 3, hy - 85, 6, 1, k.o);
        break;
      case 'pointy':
        R(hx - 13, hy - 95, 4, 9, OUT); R(hx - 12, hy - 94, 2, 7, k.b); R(hx + 9, hy - 95, 4, 9, OUT); R(hx + 10, hy - 94, 2, 7, k.b);
        part(hx - 9, hy - 97, 18, 16, m, 2);
        polyO([[hx - 9, hy - 96], [hx, hy - 111], [hx + 9, hy - 96]], m.b, OUT);
        poly([[hx - 6, hy - 97], [hx, hy - 107], [hx - 1, hy - 97]], m.l);
        poly([[hx - 8, hy - 92], [hx + 8, hy - 92], [hx + 6, hy - 88], [hx, hy - 86], [hx - 6, hy - 88]], OUT);
        R(hx - 6, hy - 91, 5, 2, a.b); R(hx + 1, hy - 91, 5, 2, a.b); Px(hx - 6, hy - 91, a.h);
        R(hx - 4, hy - 85, 8, 2, k.d);
        break;
      case 'helmet':
        R(hx + 8, hy - 104, 2, 8, OUT); Px(hx + 8, hy - 105, a.b);
        part(hx - 11, hy - 97, 22, 16, m, 3);
        R(hx - 12, hy - 92, 24, 5, OUT); R(hx - 11, hy - 91, 22, 3, vis.b); R(hx - 11, hy - 91, 6, 1, vis.h);
        part(hx - 6, hy - 87, 12, 5, k); R(hx - 4, hy - 85, 8, 1, k.o);
        break;
      case 'horns':
        polyO([[hx - 8, hy - 96], [hx - 16, hy - 111], [hx - 12, hy - 111], [hx - 3, hy - 97]], k.b, OUT);
        polyO([[hx + 8, hy - 96], [hx + 16, hy - 111], [hx + 12, hy - 111], [hx + 3, hy - 97]], k.b, OUT);
        G.line(hx - 9, hy - 99, hx - 14, hy - 109, k.l); G.line(hx + 9, hy - 99, hx + 14, hy - 109, k.l);
        part(hx - 9, hy - 97, 18, 16, m, 3);
        R(hx - 7, hy - 91, 14, 3, OUT); R(hx - 6, hy - 90, 5, 1, a.b); R(hx + 1, hy - 90, 5, 1, a.b);
        R(hx - 5, hy - 86, 10, 3, k.b); Px(hx - 3, hy - 84, '#ffffff'); Px(hx + 2, hy - 84, '#ffffff');
        break;
      case 'fin':
        polyO([[hx - 2, hy - 97], [hx - 7, hy - 111], [hx - 2, hy - 111], [hx + 4, hy - 97]], k.b, OUT);
        part(hx - 9, hy - 98, 18, 17, m, 3);
        R(hx - 7, hy - 92, 14, 4, OUT); R(hx - 6, hy - 91, 12, 2, vis.b); R(hx - 6, hy - 91, 3, 1, '#ffffff');
        part(hx - 5, hy - 87, 10, 5, k); R(hx - 3, hy - 85, 6, 1, k.d);
        break;
      case 'visor':
        R(hx - 13, hy - 105, 3, 14, OUT); R(hx - 12, hy - 104, 1, 12, k.b); Px(hx - 12, hy - 106, a.b);
        part(hx - 10, hy - 97, 20, 16, m, 3);
        R(hx - 9, hy - 93, 18, 7, OUT); R(hx - 8, hy - 92, 16, 5, a.d); R(hx - 8, hy - 92, 16, 2, a.b); R(hx - 7, hy - 92, 4, 1, a.h);
        part(hx - 5, hy - 86, 10, 4, k);
        break;
      case 'jaw':
        part(hx - 13, hy - 95, 4, 7, k); part(hx + 9, hy - 95, 4, 7, k);
        part(hx - 10, hy - 97, 20, 14, m, 3);
        R(hx - 9, hy - 93, 18, 2, m.d);
        R(hx - 7, hy - 91, 5, 3, OUT); R(hx - 6, hy - 90, 3, 1, a.b); R(hx + 2, hy - 91, 5, 3, OUT); R(hx + 3, hy - 90, 3, 1, a.b);
        part(hx - 11, hy - 85, 22, 7, k, 2);
        for (let i = 0; i < 5; i++) R(hx - 8 + i * 4, hy - 84, 2, 3, '#e8e8e8');
        break;
      case 'hair': {
        const hc = '#2a2230', hl = '#4e4258';
        polyO([[hx - 13, hy - 90], [hx - 16, hy - 103], [hx - 10, hy - 100], [hx - 8, hy - 111], [hx - 3, hy - 103], [hx + 1, hy - 112], [hx + 5, hy - 103], [hx + 10, hy - 110], [hx + 11, hy - 100], [hx + 17, hy - 104], [hx + 14, hy - 90]], hc, OUT);
        G.line(hx - 7, hy - 103, hx - 8, hy - 108, hl); G.line(hx + 2, hy - 104, hx + 1, hy - 109, hl); G.line(hx + 9, hy - 102, hx + 10, hy - 107, hl);
        part(hx - 10, hy - 98, 20, 17, { o: OUT, d: '#b8a8b0', b: '#e0d4d8', l: '#f4ecee', h: '#ffffff' }, 2);
        poly([[hx - 11, hy - 99], [hx + 11, hy - 99], [hx + 11, hy - 95], [hx + 7, hy - 97], [hx + 3, hy - 94], [hx - 2, hy - 97], [hx - 6, hy - 94], [hx - 11, hy - 97]], hc);
        G.line(hx - 2, hy - 91, hx, hy - 96, a.d); G.line(hx, hy - 96, hx + 2, hy - 91, a.d); Px(hx - 1, hy - 93, a.d); Px(hx + 1, hy - 93, a.d);
        R(hx - 8, hy - 89, 6, 3, OUT); R(hx - 7, hy - 89, 4, 2, '#ffffff'); Px(hx - 5, hy - 88, OUT);
        R(hx + 2, hy - 89, 6, 3, OUT); R(hx + 3, hy - 89, 4, 2, '#ffffff'); Px(hx + 4, hy - 88, OUT);
        G.line(hx - 9, hy - 92, hx - 3, hy - 89, OUT); G.line(hx + 8, hy - 92, hx + 2, hy - 89, OUT);
        R(hx - 3, hy - 84, 6, 1, OUT); Px(hx - 4, hy - 83, OUT); Px(hx + 3, hy - 83, OUT);
        poly([[hx - 5, hy - 82], [hx + 5, hy - 82], [hx, hy - 78]], '#d8ccd0');
        break;
      }
      case 'crown': {
        const gd = PAL.gold;
        polyO([[hx - 10, hy - 97], [hx - 9, hy - 107], [hx - 5, hy - 97]], gd.b, OUT);
        polyO([[hx - 3, hy - 97], [hx, hy - 112], [hx + 3, hy - 97]], gd.b, OUT);
        polyO([[hx + 5, hy - 97], [hx + 9, hy - 107], [hx + 10, hy - 97]], gd.b, OUT);
        part(hx - 10, hy - 98, 20, 17, m, 3);
        R(hx - 8, hy - 92, 16, 4, OUT); R(hx - 7, hy - 91, 14, 2, a.b); R(hx - 7, hy - 91, 4, 1, a.h);
        part(hx - 6, hy - 87, 12, 5, k); R(hx - 1, hy - 86, 2, 3, a.b);
        break;
      }
    }
  }

  function layout(name) {
    const L = { bx: 0, by: 0, hx: 0, hy: 0, lL: { dx: 0, lift: 0 }, lR: { dx: 0, lift: 0 }, ra: 'down', fa: 'down', legs: 'stand' };
    switch (name) {
      case 'idle1': L.by = 1; break;
      case 'walk0': L.lL.dx = -3; L.lR.dx = 3; L.lR.lift = 3; L.by = -1; break;
      case 'walk2': L.lL.dx = 3; L.lL.lift = 3; L.lR.dx = -3; L.by = -1; break;
      case 'wind': L.fa = 'wind'; L.bx = -2; break;
      case 'punch': L.fa = 'punch'; L.bx = 2; L.ra = 'back'; break;
      case 'upper': L.fa = 'up'; L.by = -2; L.bx = 1; break;
      case 'jump': L.legs = 'tuck'; L.ra = 'up'; L.fa = 'up'; break;
      case 'dive': L.legs = 'tuck'; L.fa = 'punch'; L.ra = 'back'; L.bx = 2; break;
      case 'fly': L.legs = 'straight'; L.bx = 2; L.ra = 'back'; L.fa = 'back'; break;
      case 'flyp': L.legs = 'straight'; L.fa = 'punch'; L.ra = 'back'; L.bx = 3; break;
      case 'hit': L.bx = -3; L.hx = -2; L.hy = 1; L.ra = 'up'; L.fa = 'back'; break;
      case 'crouch': L.legs = 'crouch'; L.by = 7; break;
      case 'win': L.fa = 'up'; L.ra = 'up'; L.by = -1; break;
    }
    return L;
  }
  function drawRobot(s, name) {
    const L = layout(name);
    const cx = OX, fy = OY, ox = cx + L.bx, oy = fy + L.by;
    backLayer(s, ox, oy);
    rearArm(s, L.ra, ox, oy);
    legs(s, L, cx, fy);
    waist(s, cx + Math.round(L.bx / 2), fy + L.by);
    torso(s, ox, oy);
    R(ox - 6, oy - 83, 12, 5, OUT); R(ox - 5, oy - 82, 10, 3, s.sec.b);
    if (L.fa !== 'wind') frontArm(s, L.fa, ox, oy);
    shoulders(s, ox, oy);
    if (L.fa === 'wind') frontArm(s, L.fa, ox, oy);
    head(s, ox + L.hx, oy + L.hy);
  }

  // ---------- vehículos (miran a la derecha) ----------
  function drawVehicle(s, f) {
    const cx = OX + 4, fy = OY - 2, m = s.main, k = s.sec, a = s.acc;
    if (s.veh === 'tanque') {
      R(cx - 34, fy - 15, 68, 15, OUT); R(cx - 33, fy - 14, 66, 13, '#2a2a30');
      for (let i = 0; i < 6; i++) { ell(cx - 26 + i * 10.4, fy - 7, 4, 4, '#4a4a52'); ell(cx - 26 + i * 10.4, fy - 7, 2, 2, '#6a6a74'); }
      for (let x = cx - 32 + (f ? 2 : 0); x < cx + 32; x += 4) { R(x, fy - 14, 2, 1, '#5a5a64'); R(x, fy - 2, 2, 1, '#5a5a64'); }
      polyO([[cx + 26, fy - 25], [cx + 35, fy - 17], [cx + 26, fy - 13]], m.d, OUT);
      part(cx - 31, fy - 26, 58, 13, m, 3);
      R(cx - 27, fy - 18, 50, 2, a.b); R(cx - 27, fy - 18, 50, 1, a.l);
      part(cx - 12, fy - 37, 28, 13, m, 4); ell(cx - 2, fy - 33, 4, 2, m.d);
      R(cx + 15, fy - 33, 31, 6, OUT); R(cx + 16, fy - 32, 29, 4, k.b); R(cx + 16, fy - 32, 29, 1, k.l);
      R(cx + 43, fy - 35, 6, 9, OUT); R(cx + 44, fy - 34, 4, 7, k.d);
      R(cx + 9, fy - 32, 4, 3, a.o); R(cx + 10, fy - 31, 2, 1, a.b);
      for (const rx of [cx - 25, cx - 15, cx + 5, cx + 15]) R(rx, fy - 23, 2, 2, m.o);
    } else if (s.veh === 'camion') {
      R(cx - 38, fy - 13, 76, 6, OUT); R(cx - 37, fy - 12, 74, 4, '#2a2a30');
      part(cx - 38, fy - 38, 48, 27, k, 4);
      for (let x = cx - 34; x < cx + 8; x += 5) R(x, fy - 33, 1, 20, k.d);
      R(cx - 36, fy - 22, 44, 3, m.b); R(cx - 36, fy - 22, 44, 1, m.l);
      part(cx + 9, fy - 36, 27, 25, m, 4);
      R(cx + 26, fy - 33, 9, 11, OUT); R(cx + 27, fy - 32, 7, 9, '#2b3a4c'); R(cx + 28, fy - 32, 2, 4, '#7fa3cc');
      R(cx + 34, fy - 21, 4, 9, OUT); for (let y = fy - 20; y < fy - 13; y += 2) R(cx + 35, y, 2, 1, '#c8ccd4');
      R(cx + 34, fy - 23, 3, 2, '#fff6c0');
      R(cx + 10, fy - 47, 5, 13, OUT); R(cx + 11, fy - 46, 3, 11, '#c8ccd4'); R(cx + 11, fy - 46, 1, 11, '#ffffff');
      R(cx + 12, fy - 20, 20, 2, a.b);
      for (const wx of [cx - 28, cx - 14, cx + 24]) wheelS(wx, fy - 6, 6, f);
    } else if (s.veh === 'coche') {
      const body = [[cx - 35, fy - 8], [cx - 35, fy - 18], [cx - 25, fy - 21], [cx - 11, fy - 29], [cx + 12, fy - 29], [cx + 24, fy - 21], [cx + 37, fy - 18], [cx + 39, fy - 9], [cx + 35, fy - 6], [cx - 31, fy - 6]];
      polyO(body, m.b, OUT);
      poly([[cx - 33, fy - 18], [cx - 24, fy - 20], [cx + 24, fy - 20], [cx + 36, fy - 17], [cx + 36, fy - 15], [cx - 33, fy - 15]], m.l);
      poly([[cx - 9, fy - 27], [cx + 11, fy - 27], [cx + 20, fy - 21], [cx - 18, fy - 21]], '#2b3a4c');
      poly([[cx - 6, fy - 26], [cx - 1, fy - 26], [cx - 6, fy - 22], [cx - 11, fy - 22]], '#7fa3cc');
      R(cx + 1, fy - 27, 1, 6, m.b);
      R(cx - 31, fy - 13, 64, 2, a.b);
      R(cx - 39, fy - 25, 9, 3, OUT); R(cx - 38, fy - 24, 7, 1, k.l); R(cx - 35, fy - 22, 2, 4, OUT);
      R(cx + 35, fy - 16, 3, 2, '#fff6c0'); R(cx - 35, fy - 16, 2, 2, '#ff3030');
      wheelS(cx - 20, fy - 6, 7, f); wheelS(cx + 23, fy - 6, 7, f);
    } else { // avión
      polyO([[cx - 4, fy - 24], [cx - 18, fy - 37], [cx - 27, fy - 37], [cx - 19, fy - 24]], m.d, OUT);
      polyO([[cx - 37, fy - 26], [cx - 31, fy - 26], [cx - 37, fy - 40], [cx - 42, fy - 40]], m.b, OUT);
      polyO([[cx - 38, fy - 26], [cx + 26, fy - 26], [cx + 42, fy - 20], [cx + 26, fy - 15], [cx - 38, fy - 15]], m.b, OUT);
      R(cx - 36, fy - 25, 60, 1, m.l); R(cx - 36, fy - 17, 62, 1, m.d);
      poly([[cx + 10, fy - 26], [cx + 22, fy - 26], [cx + 29, fy - 22], [cx + 12, fy - 22]], '#2b3a4c');
      poly([[cx + 12, fy - 25], [cx + 17, fy - 25], [cx + 15, fy - 23], [cx + 12, fy - 23]], '#7fa3cc');
      R(cx - 22, fy - 21, 34, 2, a.b);
      polyO([[cx - 4, fy - 17], [cx - 20, fy - 4], [cx - 31, fy - 4], [cx - 19, fy - 17]], m.b, OUT);
      G.line(cx - 6, fy - 16, cx - 21, fy - 5, a.b);
      R(cx - 18, fy - 12, 11, 2, OUT); R(cx - 17, fy - 12, 9, 1, '#dcdcdc');
      R(cx - 43, fy - 24, 6, 7, OUT); R(cx - 42, fy - 23, 4, 5, '#3a3a44');
      const fl = f ? 9 : 6;
      R(cx - 43 - fl, fy - 23, fl, 5, '#ff7a1a'); R(cx - 43 - fl + 2, fy - 22, fl - 2, 3, '#ffc23a'); R(cx - 45, fy - 22, 2, 3, '#fff4b0');
    }
  }

  // ---------- caché de sprites ----------
  const cache = new Map();
  G.sprite = function (id, fr, face) {
    face = face < 0 ? -1 : 1;
    const key = id + '|' + fr + '|' + face;
    let c = cache.get(key);
    if (c) return c;
    const cv = G.mkCanvas(SW, SH);
    if (face < 0) {
      cv.x.translate(SW, 0); cv.x.scale(-1, 1); cv.x.drawImage(G.sprite(id, fr, 1), 0, 0);
    } else if (fr === 'down') {
      cv.x.translate(OX, OY - 21); cv.x.scale(1, 0.62); cv.x.rotate(-Math.PI / 2);
      cv.x.drawImage(G.sprite(id, 'hit', 1), -OX, -(OY - 56));
    } else {
      const prev = G.ctx();
      G.target(cv.x);
      try { if (fr.startsWith('veh')) drawVehicle(G.ROB[id], +fr[3] || 0); else drawRobot(G.ROB[id], fr); }
      finally { G.target(prev); }
    }
    c = cv.c; cache.set(key, c);
    return c;
  };
  G.spriteTint = function (id, fr, face, col) {
    const key = 'T' + col + '|' + id + '|' + fr + '|' + face;
    let c = cache.get(key);
    if (c) return c;
    const cv = G.mkCanvas(SW, SH);
    cv.x.drawImage(G.sprite(id, fr, face), 0, 0);
    cv.x.globalCompositeOperation = 'source-atop'; cv.x.fillStyle = col; cv.x.fillRect(0, 0, SW, SH);
    c = cv.c; cache.set(key, c);
    return c;
  };
  G.ROBOT_FRAMES = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'wind', 'punch', 'upper', 'jump', 'dive', 'fly', 'flyp', 'hit', 'crouch', 'win', 'down', 'veh0', 'veh1'];
  G.preload = function (id) { for (const fr of G.ROBOT_FRAMES) { G.sprite(id, fr, 1); G.sprite(id, fr, -1); } };
  // dibuja el sprite con su origen (pies) en x,y
  G.drawSprite = function (id, fr, face, x, y, scale, tint) {
    const c = tint ? G.spriteTint(id, fr, face, tint) : G.sprite(id, fr, face);
    const sc = scale || 1;
    const ox = face < 0 ? SW - OX : OX;
    G.ctx().drawImage(c, Math.round(x - ox * sc), Math.round(y - OY * sc), SW * sc, SH * sc);
  };
})(window.G);
