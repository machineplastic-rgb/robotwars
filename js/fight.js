'use strict';
// Combate: robots, IA, ejército, destrucción, partículas, marcador y controles táctiles.
(function (G) {
  const AW = G.AW, AH = G.AH;
  const R = G.R, Px = G.Px, A = G.A;
  const ell = (...a) => G.ell(...a);
  const OUT = '#1c1a22';
  const YMIN = 116, YMAX = AH - 16;
  let S = null;
  G.fightState = () => S;

  // ---------- cachés de efectos ----------
  const cache = new Map();
  function cached(key, w, h, fn) {
    let c = cache.get(key); if (c) return c;
    const cv = G.mkCanvas(w, h); const prev = G.ctx(); G.target(cv.x);
    try { fn(); } finally { G.target(prev); }
    cache.set(key, cv.c); return cv.c;
  }
  const SMOKE = [['#57525c', '#726d78', '#938e99'], ['#3a3640', '#4f4a56', '#6a6572'], ['#b8ac98', '#d0c6b2', '#e8e0d0'], ['#c8d4e2', '#e4ecf6', '#ffffff']];
  function puffImg(r, ci) {
    r = Math.max(2, Math.round(r));
    return cached('p' + r + '|' + ci, r * 2 + 3, r * 2 + 3, () => {
      const c = SMOKE[ci], cx = r + 1, cy = r + 1;
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
        const d = x * x + y * y; if (d > r * r) continue;
        if (d > (r - 1) * (r - 1) && ((x + y) & 1)) continue;
        const l = (-x - y) / (r * 1.4);
        Px(cx + x, cy + y, l > 0.35 ? c[2] : l > -0.25 ? c[1] : c[0]);
      }
    });
  }
  function sparkImg(r) {
    r = Math.max(3, Math.round(r));
    return cached('s' + r, r * 2 + 3, r * 2 + 3, () => {
      const cx = r + 1, cy = r + 1;
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
        const a = Math.atan2(y, x) + 0.2, d = Math.sqrt(x * x + y * y);
        const rr = r * (0.42 + 0.58 * Math.pow(Math.abs(Math.cos(a * 4)), 5));
        if (d <= rr) { const k = d / rr; Px(cx + x, cy + y, k < 0.35 ? '#ffffff' : k < 0.62 ? '#fff3a0' : k < 0.85 ? '#ffc23a' : '#ff6a1a'); }
      }
    });
  }
  function flameImg(s, f) {
    return cached('f' + s + '|' + f, s * 2 + 3, s * 3 + 2, () => {
      const rr = G.rng(s * 31 + f * 7), cx = s + 1, by = s * 3 + 1;
      for (let i = -s; i <= s; i++) {
        const hh = Math.round(s * 2.5 * (1 - Math.abs(i) / (s + 1)) * (0.6 + rr() * 0.7));
        for (let j = 0; j < hh; j++) { const k = j / hh + Math.abs(i) / (s * 2.5); Px(cx + i, by - j, k < 0.3 ? '#fff4b0' : k < 0.55 ? '#ffc23a' : k < 0.85 ? '#ff7a1a' : '#d8341a'); }
      }
    });
  }
  function drawFlame(sx, sy, s, f) { const im = flameImg(s, f % 3); G.ctx().drawImage(im, Math.round(sx - s - 1), Math.round(sy - s * 3 - 1)); }
  function armyTankImg(pal, face) {
    return cached('t' + pal.body + face, 40, 26, () => {
      const X = G.ctx();
      if (face < 0) { X.translate(40, 0); X.scale(-1, 1); }
      const x = 6, y = 6;
      if (!pal.hover) { R(x - 1, y + 8, 28, 9, OUT); R(x, y + 9, 26, 7, '#3a3d33'); for (let i = 1; i < 26; i += 3) R(x + i, y + 9, 1, 7, '#4f5345'); }
      else { R(x + 1, y + 10, 24, 4, OUT); R(x + 2, y + 11, 22, 2, '#40f0ff'); }
      R(x + 1, y + 2, 24, 8, OUT); R(x + 2, y + 3, 22, 6, pal.body); R(x + 2, y + 3, 22, 1, pal.light); R(x + 22, y + 3, 2, 6, pal.dark);
      R(x + 6, y - 2, 12, 7, OUT); R(x + 7, y - 1, 10, 5, pal.body); R(x + 7, y - 1, 10, 1, pal.light);
      R(x + 17, y, 14, 4, OUT); R(x + 17, y + 1, 13, 2, pal.dark); R(x + 17, y + 1, 13, 1, pal.light);
      X.setTransform(1, 0, 0, 1, 0, 0);
    });
  }
  function heliImg(pal, face, f) {
    return cached('h' + pal.body + face + f, 48, 24, () => {
      const X = G.ctx();
      if (face > 0) { X.translate(48, 0); X.scale(-1, 1); }
      const x = 10, y = 8;
      if (!pal.hover) {
        R(x + 14, y + 3, 15, 3, OUT); R(x + 14, y + 4, 14, 1, pal.body); R(x + 27, y - 1, 3, 7, OUT); R(x + 28, y, 1, 5, pal.body);
        ell(x + 8, y + 5, 9, 5, OUT); ell(x + 8, y + 5, 8, 4, pal.body); ell(x + 7, y + 4, 6, 2, pal.light); R(x + 1, y + 3, 4, 4, '#8fc4e0'); Px(x + 2, y + 3, '#e0f4ff');
        R(x + 2, y + 11, 14, 1, OUT); Px(x + 5, y + 10, OUT); Px(x + 12, y + 10, OUT);
        if (f) ell(x + 9, y - 1, 19, 2, '#e6e6e6', 0.45); else { R(x - 9, y - 1, 36, 1, '#2a2a30'); }
        R(x + 8, y - 1, 2, 2, OUT);
      } else {
        for (const [dx, dy] of [[-2, -2], [20, -2], [-2, 10], [20, 10]]) { ell(x + dx + 2, y + dy + 1, 4, 1.5, f ? '#c0ffff' : '#2a2a30', f ? 0.5 : 1); }
        R(x + 2, y + 2, 18, 6, OUT); R(x + 3, y + 3, 16, 4, pal.body); R(x + 3, y + 3, 16, 1, pal.light);
        R(x + 4, y + 5, 4, 2, '#ff3a3a'); R(x + 9, y + 8, 4, 2, OUT);
      }
      X.setTransform(1, 0, 0, 1, 0, 0);
    });
  }

  // ---------- robots ----------
  function mkRobot(id, side, x, y, face, lvl, dif) {
    const sp = G.ROB[id], st = sp.stats;
    const hpMul = side === 'v' ? 1.3 : (0.55 + 0.06 * lvl) * (sp.boss ? 1.15 : 1) * [0.8, 1, 1.25][dif || 0];
    const max = Math.round(1000 * hpMul);
    return {
      id, sp, side, x, y, z: 0, vx: 0, vy: 0, vz: 0, face, hp: max, max, shadowHp: max, rep: 35,
      mode: 'robot', state: 'idle', st: 0, anim: 0, combo: 0, queued: false, hitDone: false, hitFlash: 0, invul: 0, lastHurt: 9,
      fly: 5 + st.fly, flyMax: 5 + st.fly, flying: false, cool: 0, healT: 0,
      ctrl: { mx: 0, my: 0, golpe: false, disparar: false, salto: false, volar: false, transf: false },
      ai: { t: 0.5, plan: 'approach', dur: 0, sdir: 1 },
    };
  }
  const walkSpd = (r) => (r.side === 'v' ? 100 : 70) + r.sp.stats.spd * 12;
  const VEHSPD = { tanque: 115, camion: 145, coche: 185, avion: 165 };
  const strMul = (r) => 0.75 + r.sp.stats.str * 0.1;

  // ---------- partículas ----------
  function addP(k, x, y, z, o) { const p = Object.assign({ k, x, y, z, vx: 0, vy: 0, vz: 0, t: 0, life: 1, s: 4 }, o || {}); S.parts.push(p); return p; }
  function spark(x, y, z, s) { addP('spark', x, y + 1, z, { life: 0.16, s: s || 10 }); }
  function debris(x, y, z, n, cols, pow) {
    pow = pow || 1;
    for (let i = 0; i < n; i++) addP('deb', x + G.rand(-6, 6), y + G.rand(-3, 3), z + G.rand(0, 8), { vx: G.rand(-90, 90) * pow, vy: G.rand(-18, 18), vz: G.rand(60, 210) * pow, life: G.rand(1, 1.8), c: G.pick(cols), s: G.irand(1, 3) });
  }
  function smoke(x, y, z, s, ci, life) { addP('smoke', x + G.rand(-3, 3), y, z, { vx: G.rand(-6, 6) + 4, vz: G.rand(12, 24), life: life || G.rand(1.6, 2.6), s: s || 5, ci: ci || 0 }); }
  function boom(x, y, z, s) {
    addP('boom', x, y + 1, z, { life: 0.45, s: s || 12 });
    for (let i = 0; i < 4; i++) smoke(x + G.rand(-8, 8), y, z + G.rand(0, 10), (s || 12) * 0.5, 1);
    debris(x, y, z, 6, ['#3a3a40', '#ff9a3a', '#6a6a70'], 0.9);
  }
  function dust(x, y, s) { addP('dust', x, y, 0, { life: 0.5, s: s || 20 }); }
  function floater(txt, x, y, z, c) { addP('txt', x, y + 2, z, { life: 1.0, txt, c: c || '#ffffff', vz: 26 }); }
  const DUSTC = { nieve: 3, desierto: 2 };

  // ---------- objetos (destrucción) ----------
  function objFootHit(o, x0, x1, y0, y1) { return o.state !== 2 && x1 > o.x && x0 < o.x + o.w && y1 > o.y - o.d - 2 && y0 < o.y + 1; }
  function damageObj(o, dmg, by) {
    if (o.state === 2 || o.front) return;
    if (o.nohit && !(by && by.explosive)) return;
    o.hp -= dmg;
    const cols = ['#8d877e', '#a49e94', '#6f6a63', '#55515a'];
    if (o.hp <= 0) {
      o.state = 2; o.hp = 0;
      S.destroyed += o.wt;
      const cx = o.x + o.w / 2;
      if (o.kind === 'prop') {
        G.audio.sfx('crunch'); debris(cx, o.y, 4, 4, ['#3a3a40', '#6a6a70', o.c || '#5a8a3a'], 0.5);
        addScore(50, cx, o.y, 10);
        if (o.style === 'car' || o.style === 'barrel') boom(cx, o.y, 4, 7);
      } else {
        G.audio.sfx('crumble'); G.shake(5);
        for (let i = 0; i < Math.min(10, 3 + o.w / 8); i++) smoke(o.x + Math.random() * o.w, o.y - Math.random() * o.d, G.rand(2, o.h * 0.4), G.rand(5, 10), DUSTC[S.st.id] || 2, G.rand(1.2, 2.2));
        debris(cx, o.y - o.d / 2, o.h * 0.5, 14, cols, 1.2);
        o.fires = []; const nf = o.w > 30 ? 2 : 1;
        for (let i = 0; i < nf; i++) o.fires.push({ x: o.x + o.w * (0.25 + 0.5 * Math.random()), y: o.y - 2, z: G.rand(4, 10), s: G.irand(3, 5) });
        o.smokeT = 7; o.fireT = 5;
        addScore(Math.round(100 * o.wt), cx, o.y - o.d / 2, o.h * 0.6);
        if (S.p) S.p.rep = Math.min(100, S.p.rep + 6);
        if (o.kind === 'cyl' || o.kind === 'chimney' || o.kind === 'rocket') { boom(cx, o.y, 10, 18); G.audio.sfx('boom'); }
      }
    } else if (o.state === 0 && o.hp < o.max * 0.5 && o.kind !== 'prop') {
      o.state = 1; G.audio.sfx('crunch');
      o.fires = [{ x: o.x + o.w * (0.2 + 0.6 * Math.random()), y: o.y - 1, z: o.h * 0.75 + o.d * 0.4, s: G.irand(3, 5) }];
      debris(o.x + o.w / 2, o.y - o.d / 2, o.h * 0.6, 8, cols, 1);
    } else if (Math.random() < 0.3) debris(o.x + Math.random() * o.w, o.y - o.d / 2, o.h * 0.5, 2, cols, 0.6);
  }
  function areaObj(x, y, r, dmg, by) { for (const o of S.objs) if (objFootHit(o, x - r, x + r, y - r * 0.5, y + r * 0.5)) damageObj(o, dmg, by); }
  function addScore(n, x, y, z) { S.score += n; if (x !== undefined && n >= 100) floater('+' + n, x, y, z || 30, '#ffe266'); }

  // ---------- golpes ----------
  function hurt(att, def, dmg, heavy, px, pz) {
    if (!def || def.invul > 0 || def.state === 'down' || def.state === 'ko' || def.state === 'getup' || S.phase !== 'fight') return false;
    let d = dmg * (1.25 - def.sp.stats.def * 0.08);
    if (att && att.side === 'h') d *= (0.4 + S.level * 0.05) * [0.7, 1, 1.35][S.dif];
    if (att && att.side === 'v') d *= 1.25;
    def.hp -= d; def.lastHurt = 0; def.hitFlash = 0.12;
    if (att && att.side === 'v') addScore(Math.round(d), undefined);
    const kdir = att ? G.sign(def.x - att.x) : -def.face;
    if (def.mode === 'veh' && heavy) { def.mode = 'robot'; def.z = Math.min(def.z, 20); G.audio.sfx('xback'); }
    if (def.flying && heavy) def.flying = false;
    G.shake(heavy ? 7 : 3);
    S.hitstop = heavy ? 0.1 : 0.05;
    spark(px !== undefined ? px : def.x - kdir * 10, def.y, pz !== undefined ? pz : def.z + 62, heavy ? 15 : 10);
    debris(def.x, def.y, def.z + 60, heavy ? 6 : 3, [def.sp.main.b, def.sp.sec.b, '#ffe266'], 0.8);
    G.audio.sfx(heavy ? 'heavy' : 'hit');
    G.vibrate(heavy ? 40 : 15);
    if (def.hp <= 0) {
      def.hp = 0; def.state = 'ko'; def.st = 0; def.vz = 230; def.vx = kdir * 170; def.flying = false; def.mode = 'robot';
      startKO(def);
    } else if (heavy) { def.state = 'down'; def.st = 0; def.vz = 190; def.vx = kdir * 165; def.combo = 0; }
    else { def.state = 'hit'; def.st = 0; def.vx = kdir * 70; def.combo = 0; }
    return true;
  }
  function inReach(r, o, reach, dyMax, dzMax) {
    const dx = (o.x - r.x) * r.face;
    return dx > -8 && dx < reach && Math.abs(o.y - r.y) < dyMax && Math.abs(o.z - r.z) < dzMax;
  }
  function melee(r, reach, dmg, heavy, hz) {
    const o = r === S.p ? S.e : S.p;
    let hit = false;
    if (inReach(r, o, reach, 16, 46)) hit = hurt(r, o, dmg * strMul(r), heavy, r.x + r.face * reach * 0.62, r.z + (hz || 62));
    const bx = r.x + r.face * reach * 0.55;
    for (const ob of S.objs) if (objFootHit(ob, bx - reach * 0.45, bx + reach * 0.45, r.y - 10, r.y + 6)) { damageObj(ob, dmg * 1.4, r); if (!hit) { spark(bx, ob.y, Math.min(ob.h, 40), 7); } }
    if (r.side === 'v') for (const u of S.army) if (!u.dead && Math.abs(u.x - bx) < reach * 0.6 && Math.abs(u.y - r.y) < 18 && Math.abs(u.z - (r.z + 40)) < 60) killUnit(u);
    if (!hit) G.audio.sfx('whoosh'); else G.audio.sfx('punch');
    return hit;
  }

  // ---------- proyectiles ----------
  function shoot(owner, kind, x, y, z, face, extra) {
    const spd = kind === 'shell' ? 300 : kind === 'missile' ? 250 : kind === 'bullet' ? 330 : kind === 'beam' ? 360 : 280;
    const dmg = kind === 'shell' ? 62 : kind === 'missile' ? 34 : kind === 'bullet' ? 9 : kind === 'beam' ? 32 : 26;
    const k = owner === 'p' ? 1 : 0.6; // los disparos enemigos van más lentos: se pueden esquivar
    S.proj.push(Object.assign({ owner, kind, x, y, z, vx: face * spd * k, vy: 0, vz: 0, face, dmg, t: 0, life: owner === 'p' ? 2.2 : 3.2 }, extra || {}));
  }
  function explode(p, x, y, z) {
    boom(x, y, z, p.kind === 'bullet' ? 5 : p.kind === 'beam' ? 8 : p.kind === 'missile' ? 10 : 13);
    G.audio.sfx(p.kind === 'bullet' ? 'crunch' : 'boom');
    if (p.kind !== 'bullet') { areaObj(x, y, p.kind === 'shell' ? 22 : 16, p.kind === 'shell' ? 70 : 45, { explosive: true }); G.shake(4); }
  }
  function updProj(dt) {
    for (const p of S.proj) {
      p.t += dt;
      if (p.kind === 'missile' && p.target) { p.vy = G.clamp((p.target.y - p.y) * 3, -60, 60); p.vz = G.clamp((p.target.z + 50 - p.z) * 2, -80, 80); if (p.t % 0.06 < dt) smoke(p.x - p.face * 6, p.y, p.z, 3, 0, 0.6); }
      if (p.kind === 'beam' && p.owner === 'p' && p.target) { p.vy = G.clamp((p.target.y - p.y) * 5, -90, 90); p.vz = G.clamp((p.target.z + 60 - p.z) * 3, -140, 140); }
      if (p.kind === 'bomb') p.vz -= 400 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.t > p.life || p.x < -20 || p.x > AW + 20) { p.dead = true; continue; }
      if (p.z <= 0) { p.dead = true; explode(p, p.x, p.y, 0); continue; }
      const targets = p.owner === 'army' ? [S.p] : p.owner === 'p' ? [S.e] : [S.p];
      for (const t of targets) {
        if (Math.abs(t.x - p.x) < 18 && Math.abs(t.y - p.y) < 15 && p.z >= t.z - 4 && p.z <= t.z + (t.mode === 'veh' ? 34 : 100)) {
          if (t.state !== 'ko' && t.state !== 'down' && t.invul <= 0) {
            const att = p.owner === 'p' ? S.p : p.owner === 'e' ? S.e : null;
            hurt(att, t, p.owner === 'army' ? p.dmg * (0.45 + S.level * 0.05) : p.dmg * (att ? strMul(att) : 1), p.kind === 'shell', p.x, p.z);
            p.dead = true; explode(p, p.x, p.y, p.z); break;
          }
        }
      }
      if (p.dead) continue;
      if (p.z < 60) for (const o of S.objs) {
        if (o.state === 2 || o.kind === 'prop' || o.front) continue;
        if (p.x > o.x && p.x < o.x + o.w && p.y > o.y - o.d - 4 && p.y < o.y + 2 && p.z < o.h + 4) { p.dead = true; explode(p, p.x, p.y, p.z); damageObj(o, 60, { explosive: true }); break; }
      }
      if (p.dead) continue;
      if (p.owner === 'p') for (const u of S.army) if (!u.dead && Math.abs(u.x - p.x) < 14 && Math.abs(u.y - p.y) < 14 && Math.abs(u.z + 6 - p.z) < 20) { killUnit(u); p.dead = true; explode(p, p.x, p.y, p.z); break; }
    }
    S.proj = S.proj.filter((p) => !p.dead);
  }

  // ---------- ejército ----------
  function spawnUnit() {
    const p = S.p, heli = Math.random() < 0.4;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = G.clamp(S.cam.x + (side < 0 ? -30 : G.W + 30), 10, AW - 10);
    const y = G.clamp(p.y + G.rand(-60, 60), YMIN + 10, YMAX - 4);
    S.army.push({ kind: heli ? 'heli' : 'tank', x, y, z: heli ? 72 : 0, face: x < p.x ? 1 : -1, t: 0, fire: G.rand(1.5, 2.5), dead: false, dist: G.rand(110, 170) });
  }
  function killUnit(u) {
    if (u.dead) return; u.dead = true;
    boom(u.x, u.y, u.z + 6, u.kind === 'heli' ? 14 : 12); G.audio.sfx('boom'); G.shake(4);
    addScore(u.kind === 'heli' ? 500 : 300, u.x, u.y, u.z + 20);
    S.p.rep = Math.min(100, S.p.rep + 5);
  }
  function updArmy(dt) {
    if (S.phase !== 'fight') return;
    S.armyT -= dt;
    const maxU = 1 + Math.floor(S.level / 3);
    if (S.armyT <= 0) { S.armyT = G.rand(11, 15) - S.level * 0.5; if (S.army.filter((u) => !u.dead).length < maxU) spawnUnit(); }
    const p = S.p;
    for (const u of S.army) {
      if (u.dead) continue;
      u.t += dt;
      const dx = p.x - u.x;
      u.face = dx > 0 ? 1 : -1;
      if (Math.abs(dx) > u.dist) u.x += u.face * (u.kind === 'heli' ? 55 : 32) * dt;
      else if (Math.abs(dx) < u.dist - 40) u.x -= u.face * 30 * dt;
      u.y += G.clamp(p.y - u.y, -1, 1) * (u.kind === 'heli' ? 26 : 12) * dt;
      u.y = G.clamp(u.y, YMIN, YMAX);
      if (u.kind === 'heli') u.z = 72 + Math.sin(u.t * 3) * 3;
      u.fire -= dt;
      if (u.fire <= 0 && Math.abs(dx) < 240 && p.state !== 'ko') {
        u.fire = G.rand(2.2, 3.2) - S.level * 0.12;
        if (u.kind === 'tank') { shoot('army', 'shell', u.x + u.face * 18, u.y, 14, u.face, { dmg: 22 }); spark(u.x + u.face * 22, u.y, 14, 4); G.audio.sfx('shot'); }
        else { for (let i = 0; i < 3; i++) shoot('army', 'bullet', u.x + u.face * 12, u.y, u.z - 2, u.face, { dmg: 7, t: -i * 0.1, vz: ((p.z + 50) - u.z) / (Math.abs(dx) / 198 + 0.01) }); G.audio.sfx('gun'); }
      }
      // aplastar tanques al pisarlos
      if (u.kind === 'tank' && p.z < 8 && Math.abs(u.x - p.x) < 20 && Math.abs(u.y - p.y) < 8) killUnit(u);
    }
    S.army = S.army.filter((u) => !u.dead);
  }

  // ---------- control ----------
  function aiCtrl(r, o, dt) {
    const c = r.ctrl, ai = r.ai, lvl = S.level;
    c.golpe = c.disparar = c.salto = c.volar = c.transf = false;
    if (S.phase !== 'fight' || ['hit', 'down', 'ko', 'getup', 'xform'].includes(r.state)) { c.mx = c.my = 0; return; }
    const dx = o.x - r.x, dy = o.y - r.y, adx = Math.abs(dx), ady = Math.abs(dy);
    // dificultad: 0 fácil, 1 normal, 2 difícil (el rival); el jugador automático juega fuerte
    const hero = r.side === 'h', dif = S.dif;
    const aggr = hero ? Math.min(0.75, [0.1, 0.22, 0.38][dif] + lvl * 0.04) : 0.7;
    const react = hero ? Math.max(0.2, [1.0, 0.7, 0.45][dif] - lvl * 0.04) : 0.2;
    ai.t -= dt; ai.dur -= dt;
    if (ai.t <= 0 && ai.plan !== 'vehicle') {
      ai.t = react * (0.7 + Math.random() * 0.6);
      const roll = Math.random();
      if (r.mode === 'veh') ai.plan = 'vehicle';
      else if (o.state === 'down' || o.state === 'getup') ai.plan = adx < 70 ? 'backoff' : 'wait';
      else if (r.hp < r.max * 0.3 && r.rep > 25 && roll < 0.35) { ai.plan = 'retreat'; ai.dur = 2.2; }
      else if (o.flying && !r.flying && r.fly > 2 && roll < 0.35) ai.plan = 'fly';
      else if (adx > 150 && roll < 0.2) ai.plan = 'transform';
      else if (adx > 80 && ady < 16 && roll < aggr * 0.8) ai.plan = 'shoot';
      else if (adx < 60 && ady < 14 && roll < aggr) ai.plan = 'attack';
      else if (roll < 0.12) { ai.plan = 'sidestep'; ai.dur = 0.5; ai.sdir = Math.random() < 0.5 ? -1 : 1; }
      else if (r.flying && (r.fly < 1 || !o.flying)) ai.plan = 'land';
      else if (hero && roll < [0.5, 0.3, 0.12][dif]) { ai.plan = 'wait'; ai.t *= 1.5; }
      else ai.plan = 'approach';
    }
    c.mx = 0; c.my = 0;
    switch (ai.plan) {
      case 'approach': c.mx = adx > 44 ? G.sign(dx) : 0; c.my = ady > 5 ? G.sign(dy) * 0.9 : 0; if (adx <= 50 && ady <= 12) ai.plan = 'attack'; break;
      case 'attack':
        c.my = ady > 5 ? G.sign(dy) : 0;
        if (adx > 62) { ai.plan = 'approach'; break; }
        if (r.state !== 'atk' && adx < 58 && ady < 14 && Math.random() < 0.08 + aggr * 0.4) c.golpe = true;
        else if (r.state === 'atk' && Math.random() < aggr * 0.25) c.golpe = true;
        break;
      case 'backoff': c.mx = -G.sign(dx); break;
      case 'wait': break;
      case 'retreat': c.mx = -G.sign(dx); c.my = G.sign(230 - r.y) * 0.5; if (ai.dur <= 0) ai.plan = 'approach'; break;
      case 'sidestep': c.my = ai.sdir; if (ai.dur <= 0) ai.plan = 'approach'; break;
      case 'shoot':
        c.my = ady > 4 ? G.sign(dy) : 0;
        if (r.cool <= 0 && ady < 14 && (r.state === 'idle' || r.state === 'walk')) { c.disparar = true; ai.plan = 'wait'; ai.t = react * 1.5; }
        break;
      case 'fly':
        if (!r.flying) { c.volar = true; break; }
        c.mx = adx > 30 ? G.sign(dx) : 0; c.my = ady > 5 ? G.sign(dy) : 0;
        if (adx < 50 && ady < 14 && Math.random() < 0.03 + aggr * 0.05) c.golpe = true;
        else if (adx > 70 && ady < 14 && r.cool <= 0 && Math.random() < aggr * 0.05) c.disparar = true;
        if (r.fly < 1) { c.volar = true; ai.plan = 'approach'; }
        break;
      case 'land': if (r.flying) c.volar = true; ai.plan = 'approach'; break;
      case 'transform': c.transf = true; ai.plan = 'vehicle'; ai.dur = 3 + Math.random() * 3; break;
      case 'vehicle': {
        if (r.mode !== 'veh') { if (r.state !== 'xform') ai.plan = 'approach'; break; }
        const v = r.sp.veh;
        c.my = ady > 4 ? G.sign(dy) : 0;
        if (v === 'tanque' || v === 'avion') {
          if (adx < 90) c.mx = -G.sign(dx); else if (adx > 210) c.mx = G.sign(dx); else c.mx = (r.face === G.sign(dx)) ? 0 : G.sign(dx);
          if (ady < 12 && r.face === G.sign(dx) && r.cool <= 0 && Math.random() < 0.1 + aggr * 0.2) c.disparar = true;
        } else {
          c.mx = r.face === G.sign(dx) ? 0 : G.sign(dx);
          if (adx > 230) c.mx = G.sign(dx);
          if (ady < 10 && adx < 240 && r.face === G.sign(dx) && r.state !== 'ram' && Math.random() < 0.05 + aggr * 0.15) c.golpe = true;
        }
        if (ai.dur <= 0 && r.state !== 'ram') { c.transf = true; ai.plan = 'approach'; ai.t = 0.4; }
        break;
      }
    }
  }
  const K = (codes) => codes.some((k) => G.input.keys.has(k));
  const KP = (codes) => codes.some((k) => G.input.pressed.has(k));
  function playerCtrl(r) {
    const c = r.ctrl, C = S.ctl;
    let mx = 0, my = 0;
    if (C.joy) {
      const dx = C.joy.x - C.joy.bx, dy = C.joy.y - C.joy.by, d = Math.hypot(dx, dy), rad = C.jr;
      if (d > rad * 0.18) { const k = Math.min(1, d / (rad * 0.55)); mx = (dx / d) * k; my = (dy / d) * k; }
    }
    if (K(['ArrowLeft', 'KeyA'])) mx = -1; if (K(['ArrowRight', 'KeyD'])) mx = 1;
    if (K(['ArrowUp', 'KeyW'])) my = -1; if (K(['ArrowDown', 'KeyS'])) my = 1;
    c.mx = Math.abs(mx) > 0.2 ? mx : 0; c.my = Math.abs(my) > 0.2 ? my : 0;
    const B = C.btn;
    c.golpe = B.golpe.pressed || KP(['KeyJ', 'KeyZ', 'Space']);
    c.disparar = B.disparar.pressed || KP(['KeyK', 'KeyX']);
    c.salto = false;
    c.volar = B.volar.pressed || KP(['KeyL', 'KeyC']);
    c.transf = B.transf.pressed || KP(['KeyI', 'KeyV', 'ShiftLeft', 'ShiftRight']);
    for (const k in B) B[k].pressed = false;
  }

  // ---------- física y estados ----------
  function startState(r, s) { r.state = s; r.st = 0; r.hitDone = false; }
  function updRobot(r, o, dt) {
    r.st += dt; r.anim += dt;
    r.hitFlash = Math.max(0, r.hitFlash - dt); r.invul = Math.max(0, r.invul - dt); r.lastHurt += dt; r.cool = Math.max(0, r.cool - dt);
    r.shadowHp = r.shadowHp > r.hp ? Math.max(r.hp, r.shadowHp - r.max * 0.25 * dt) : r.hp;
    const c = r.ctrl, alive = r.state !== 'ko';
    // autorreparación
    if (alive && S.phase === 'fight') {
      const pv = r.side === 'v';
      r.rep = Math.min(100, r.rep + dt * (pv ? 5 : 2 + S.level * 0.15 + S.dif * 0.5));
      if (r.lastHurt > (pv ? 1.6 : 2.6) && r.hp < r.max && r.rep > 0.5 && r.state !== 'down') {
        r.hp = Math.min(r.max, r.hp + dt * r.max * (pv ? 0.05 : 0.03)); r.rep = Math.max(0, r.rep - dt * 14);
        r.healT -= dt; if (r.healT <= 0) { r.healT = 0.18; addP('heal', r.x + G.rand(-22, 22), r.y + 1, r.z + G.rand(20, 90), { vz: 28, life: 0.7 }); if (Math.random() < 0.3) G.audio.sfx('heal'); }
      }
    }
    if (r.flying) { r.fly -= dt; if (r.fly <= 0) { r.flying = false; } } else r.fly = Math.min(r.flyMax, r.fly + dt * 0.7);
    const canAct = S.phase === 'fight';
    const free = r.state === 'idle' || r.state === 'walk';
    const veh = r.mode === 'veh';

    if (free && canAct) {
      if (c.transf && r.state !== 'xform') { startState(r, 'xform'); r.flying = false; G.audio.sfx(veh ? 'xback' : 'xform'); dust(r.x, r.y, 26); return integrate(r, o, dt); }
      const who = r === S.p ? 'p' : 'e';
      if (!veh) {
        if (c.volar) {
          if (r.flying) r.flying = false;
          else if (r.fly > 1) { r.flying = true; G.audio.sfx('fly'); dust(r.x, r.y, 24); }
        }
        if (c.golpe) {
          if (r.flying && r.z > 30) { startState(r, 'fdive'); r.flying = false; r.vz = -60; G.audio.sfx('whoosh'); }
          else { r.combo = 0; startState(r, 'atk'); }
        } else if (c.disparar && r.cool <= 0) { startState(r, 'shoot'); r.cool = 0.5; }
      } else {
        const v = r.sp.veh;
        const missiles = () => { for (const k of [0, 1]) shoot(who, 'missile', r.x + r.face * 20, r.y + (k ? 4 : -4), r.z + 10, r.face, { target: o, t: -k * 0.08 }); r.cool = 0.9; G.audio.sfx('missile'); };
        if (c.disparar && r.cool <= 0) {
          if (v === 'tanque' || v === 'camion') { shoot(who, 'shell', r.x + r.face * 46, r.y, v === 'tanque' ? 30 : 24, r.face); spark(r.x + r.face * 50, r.y, 30, 6); r.cool = 0.7; G.audio.sfx('shot'); r.vx = -r.face * 40; }
          else missiles();
        } else if (c.golpe && r.cool <= 0) {
          if (v === 'avion') missiles();
          else { startState(r, 'ram'); r.cool = 1.0; G.audio.sfx('whoosh'); }
        }
      }
    }
    switch (r.state) {
      case 'idle': case 'walk': {
        let mx = canAct ? c.mx : 0, my = canAct ? c.my : 0;
        const spd = veh ? VEHSPD[r.sp.veh] : walkSpd(r) * (r.flying ? 1.25 : 1);
        r.vx = mx * spd; r.vy = my * spd * 0.75;
        r.state = (mx || my) ? 'walk' : 'idle';
        if (veh) { if (mx) r.face = G.sign(mx); }
        else r.face = G.sign(o.x - r.x) || r.face;
        const tz = veh ? (r.sp.veh === 'avion' ? 46 : 0) : (r.flying ? 72 + Math.sin(r.anim * 3) * 3 : 0);
        if (r.z !== tz) { r.z += (tz - r.z) * Math.min(1, dt * 6); if (Math.abs(r.z - tz) < 0.5) { if (tz === 0 && r.z > 2) land(r, false); r.z = tz; } }
        if (!veh && !r.flying && r.state === 'walk') { r.stepT = (r.stepT || 0) - dt; if (r.stepT <= 0) { r.stepT = 0.34; G.audio.sfx('step'); if (Math.random() < 0.5) smoke(r.x + G.rand(-10, 10), r.y + 1, 0, 3, DUSTC[S.st.id] || 2, 0.6); } }
        break;
      }
      case 'atk': {
        const wind = 0.08, act = 0.1, rec = 0.17;
        r.vx *= 0.8; r.vy *= 0.8;
        if (c.golpe && r.st > 0.04) r.queued = true;
        if (r.st >= wind && !r.hitDone) { r.hitDone = true; r.vx = r.face * 70; melee(r, 54, r.combo === 2 ? 64 : 36, r.combo === 2, r.combo === 2 ? 80 : 62); }
        if (r.st >= wind + act + rec) {
          if (r.queued && r.combo < 2) { r.combo++; r.queued = false; startState(r, 'atk'); }
          else { r.combo = 0; r.queued = false; startState(r, 'idle'); }
        }
        break;
      }
      case 'jump':
        r.vx = (canAct ? c.mx : 0) * walkSpd(r) * 0.9; r.vy = (canAct ? c.my : 0) * walkSpd(r) * 0.5;
        if (c.golpe && canAct) { startState(r, 'dive'); r.vz = Math.min(r.vz, 40); r.vx = r.face * 150; }
        break;
      case 'dive':
        r.vz -= 500 * dt; r.vx = r.face * 150;
        if (!r.hitDone && inReach(r, o, 50, 18, 60)) { r.hitDone = true; hurt(r, o, 70 * strMul(r), true, r.x + r.face * 30, r.z + 40); }
        break;
      case 'flyatk':
        r.vx = r.face * 230; r.vy = (canAct ? c.my : 0) * 40;
        r.z += ((o.z) - r.z) * Math.min(1, dt * 4);
        if (r.st > 0.06 && !r.hitDone && inReach(r, o, 56, 16, 50)) { r.hitDone = true; hurt(r, o, 58 * strMul(r), true, r.x + r.face * 40, r.z + 62); }
        if (r.st > 0.06 && !r.hitDone) for (const u of S.army) if (!u.dead && u.kind === 'heli' && Math.abs(u.x - r.x) < 40 && Math.abs(u.y - r.y) < 18 && Math.abs(u.z - (r.z + 40)) < 50) killUnit(u);
        if (r.st > 0.34) { startState(r, 'idle'); if (r.fly <= 0.2) r.flying = false; }
        break;
      case 'shoot':
        r.vx *= 0.7; r.vy *= 0.7;
        if (!r.hitDone && r.st > 0.06) { r.hitDone = true; shoot(r === S.p ? 'p' : 'e', 'beam', r.x + r.face * 30, r.y, r.z + 66, r.face, { target: o, col: r.sp.acc }); G.audio.sfx('laser'); }
        if (r.st > 0.22) startState(r, 'idle');
        break;
      case 'fdive':
        r.vx = r.face * 170; r.vy = (canAct ? c.my : 0) * 40;
        if (!r.hitDone && inReach(r, o, 52, 18, 70)) { r.hitDone = true; hurt(r, o, 70 * strMul(r), true, r.x + r.face * 30, r.z + 40); }
        break;
      case 'ram': {
        const v = r.sp.veh;
        const sp = v === 'camion' ? 250 : v === 'tanque' ? 200 : 310;
        r.vx = r.face * sp; r.vy = (canAct ? c.my : 0) * 30;
        if (!r.hitDone && Math.abs(o.x - r.x) < 44 && Math.abs(o.y - r.y) < 14 && o.z < 40) { r.hitDone = true; hurt(r, o, (v === 'coche' ? 66 : 84) * strMul(r), true, r.x + r.face * 30, 26); }
        if (r.st > (v === 'coche' ? 0.36 : 0.45)) startState(r, 'idle');
        break;
      }
      case 'xform':
        r.vx *= 0.7; r.vy *= 0.7;
        if (r.st > 0.36) { r.mode = r.mode === 'veh' ? 'robot' : 'veh'; startState(r, 'idle'); if (r.mode === 'veh' && r.sp.veh !== 'avion') r.z = 0; r.cool = 0.2; }
        break;
      case 'hit': r.vx *= Math.pow(0.02, dt); r.vy = 0; if (r.st > 0.28) startState(r, 'idle'); break;
      case 'down': case 'ko':
        r.vy = 0;
        if (r.z <= 0 && r.vz <= 0) { r.vx *= Math.pow(0.004, dt); }
        if (r.state === 'down' && r.st > 1.05) { startState(r, 'getup'); r.invul = 0.7; }
        break;
      case 'getup': r.vx = 0; if (r.st > 0.32) startState(r, 'idle'); break;
      case 'win': r.vx = r.vy = 0; break;
    }
    integrate(r, o, dt);
  }
  function land(r, big) {
    dust(r.x, r.y, big ? 40 : 26); G.audio.sfx('land'); G.shake(big ? 6 : 3);
    if (big) {
      dust(r.x, r.y, 64);
      const o = r === S.p ? S.e : S.p;
      if (!r.hitDone && Math.abs(o.x - r.x) < 58 && Math.abs(o.y - r.y) < 24 && o.z < 24) hurt(r, o, 50 * strMul(r), true, o.x, 30);
    }
    areaObj(r.x, r.y, big ? 32 : 20, big ? 110 : 45, r);
    if (r.side === 'v') for (const u of S.army) if (!u.dead && u.kind === 'tank' && Math.abs(u.x - r.x) < (big ? 40 : 26) && Math.abs(u.y - r.y) < 14) killUnit(u);
  }
  function integrate(r, o, dt) {
    const airborne = r.state === 'jump' || r.state === 'dive' || r.state === 'fdive' || ((r.state === 'down' || r.state === 'ko') && (r.z > 0 || r.vz > 0));
    if (airborne) {
      r.vz -= 760 * dt; r.z += r.vz * dt;
      if (r.z <= 0) {
        r.z = 0;
        if (r.state === 'jump' || r.state === 'dive' || r.state === 'fdive') { const big = r.state !== 'jump'; land(r, big); r.vz = 0; startState(r, big ? 'getup' : 'idle'); if (big) r.st = 0.1; }
        else if (r.vz < -100) { r.vz = -r.vz * 0.25; dust(r.x, r.y, 34); G.audio.sfx('land'); G.shake(5); areaObj(r.x, r.y, 30, 120, r); }
        else r.vz = 0;
      }
    }
    // pisar y aplastar
    let slow = 1;
    if (r.z < 8) {
      const veh = r.mode === 'veh';
      const fx0 = r.x - (veh ? 30 : 15), fx1 = r.x + (veh ? 30 : 15);
      const sliding = (r.state === 'down' || r.state === 'ko') && Math.abs(r.vx) > 50;
      const moving = Math.abs(r.vx) + Math.abs(r.vy) > 5 || sliding;
      for (const ob of S.objs) {
        if (!objFootHit(ob, fx0, fx1, r.y - 5, r.y + 3)) continue;
        if (ob.kind === 'prop') { damageObj(ob, 5, r); continue; }
        if (!moving) continue;
        let dps = veh ? (r.sp.veh === 'tanque' ? 190 : r.sp.veh === 'camion' ? 160 : 110) : 110;
        if (r.state === 'ram') dps *= 4; if (sliding) dps = 420;
        damageObj(ob, dps * dt, r);
        if (ob.state < 2 && !sliding && r.state !== 'ram') slow = r.mode === 'veh' && r.sp.veh === 'tanque' ? 0.85 : 0.6;
        if (Math.random() < dt * 6) debris(r.x + r.face * 10, r.y, 6, 1, ['#8d877e', '#a49e94'], 0.5);
      }
    }
    r.x += r.vx * slow * dt; r.y += r.vy * slow * dt;
    r.x = G.clamp(r.x, 26, AW - 26); r.y = G.clamp(r.y, YMIN, YMAX);
    const maxSep = Math.max(160, G.W - 110);
    if (Math.abs(r.x - o.x) > maxSep) r.x = o.x + G.sign(r.x - o.x) * maxSep;
  }

  // ---------- KO y fin ----------
  function startKO(def) {
    S.phase = 'ko'; S.phaseT = 0; S.slow = 0.35;
    G.audio.sfx('ko'); G.flash(0.6);
    S.winner = def === S.e ? 'v' : 'h';
  }
  function finish() {
    const win = S.winner === 'v';
    const pct = Math.round(Math.min(100, (S.destroyed / S.goalWt) * 100));
    let bonus = 0;
    if (win) bonus = 5000 + Math.ceil(S.time) * 50 + pct * 40;
    G.go('result', { win, score: S.score + bonus, base: S.score, bonus, pct, time: Math.ceil(S.time), stage: S.stageIdx, level: S.level, villain: S.vid, hero: S.hid, timeup: S.timeup });
  }

  // ---------- escena ----------
  const F = G.scenes.fight = {};
  F.enter = function (p) {
    const B = G.buildStage(p.stage);
    const v = G.VILLAINS[p.villain], h = G.STAGES[p.stage].hero;
    G.preload(v); G.preload(h);
    S = {
      stageIdx: p.stage, st: B.st, bg: B.bg, objs: B.objs, level: p.level || 1, vid: v, hid: h,
      army: [], proj: [], parts: [], time: 99, phase: 'intro', phaseT: 0, score: p.score || 0, destroyed: 0,
      totalWt: B.objs.filter((o) => !o.front && !o.nohit).reduce((a, o) => a + o.wt, 0), hitstop: 0, slow: 1, armyT: 10, paused: false, dif: G.clamp(G.save.data.dif || 0, 0, 2), auto: G.params.get('auto') === '1',
      cam: { x: AW / 2 - G.W / 2, y: 0 }, ctl: { joy: null, jr: 26, btn: {} }, t: 0,
    };
    S.goalWt = S.totalWt * 0.6;
    S.p = mkRobot(v, 'v', G.SPAWN.v.x, G.SPAWN.v.y, 1, S.level, S.dif);
    S.e = mkRobot(h, 'h', G.SPAWN.h.x, G.SPAWN.h.y, -1, S.level, S.dif);
    layoutControls();
    snapCam();
    G.audio.play(B.st.music);
  };
  F.resize = function () { if (S) layoutControls(); };
  function layoutControls() {
    const W = G.W, H = G.H, C = S.ctl;
    const sr = W - G.safeR - 8, sb = H - G.safeB - 6;
    const cx = sr - 62, cy = sb - 60;
    const d = 38;
    C.btn = {
      transf: { x: cx, y: cy - d, r: 18, label: 'TRANSF.', c: '#d9a21b', d: '#8a6408' },
      volar: { x: cx - d, y: cy, r: 18, label: 'VOLAR', c: '#3fa45a', d: '#1e6a34' },
      disparar: { x: cx + d, y: cy, r: 18, label: 'DISPARAR', c: '#3d7fd0', d: '#1e4a8a' },
      golpe: { x: cx, y: cy + d, r: 21, label: 'GOLPE', c: '#cf3a3a', d: '#8a1a1a' },
    };
    for (const k in C.btn) Object.assign(C.btn[k], { id: null, pressed: false, held: false });
    C.jhome = { x: G.safeL + 46, y: sb - 42 };
    C.pause = { x: Math.round(W / 2) + 20, y: 4, w: 14, h: 14 };
  }
  function snapCam() { const t = camTarget(); S.cam.x = t.x; S.cam.y = t.y; }
  function camTarget() {
    const p = S.p, e = S.e, W = G.W, H = G.H;
    const mx = (p.x + e.x) / 2, my = (p.y + e.y) / 2 - (p.z + e.z) / 4;
    const x = G.clamp(mx - W / 2, 0, Math.max(0, AW - W));
    let y = my - 44 - H * 0.5;
    y = AH >= H ? G.clamp(y, 0, AH - H) : (AH - H) / 2;
    return { x, y };
  }
  F.down = function (id, x, y) {
    if (!S) return;
    const C = S.ctl;
    if (S.paused) { pauseTap(x, y); return; }
    if (G.inRect(x, y, C.pause, 6)) { S.paused = true; G.audio.sfx('sel'); return; }
    if (S.phase === 'end') return;
    let best = null, bd = 1e9;
    for (const k in C.btn) { const b = C.btn[k]; const d = Math.hypot(x - b.x, y - b.y); if (d < b.r + 9 && d < bd) { bd = d; best = b; } }
    if (best) { best.id = id; best.pressed = true; best.held = true; return; }
    if (x < G.W * 0.5 && !C.joy) {
      C.joy = { id, bx: G.clamp(x, G.safeL + 30, G.W * 0.4), by: G.clamp(y, G.H * 0.38, G.H - 30), x, y };
    }
  };
  F.drag = function (id, x, y) { if (S && S.ctl.joy && S.ctl.joy.id === id) { S.ctl.joy.x = x; S.ctl.joy.y = y; } };
  F.up = function (id) {
    if (!S) return;
    const C = S.ctl;
    if (C.joy && C.joy.id === id) C.joy = null;
    for (const k in C.btn) if (C.btn[k].id === id) { C.btn[k].id = null; C.btn[k].held = false; }
  };
  F.key = function (code) {
    if (!S) return;
    if (code === 'Escape' || code === 'KeyP') { S.paused = !S.paused; return; }
    if (S.paused && (code === 'Enter')) S.paused = false;
  };
  F.blur = function () { if (S && S.phase === 'fight') S.paused = true; };
  function pauseButtons() {
    const W = G.W, H = G.H, bw = 120, x = Math.round(W / 2 - bw / 2);
    const s = G.save.data.settings;
    return [
      { id: 'seguir', x, y: Math.round(H / 2 - 44), w: bw, h: 18, label: 'SEGUIR' },
      { id: 'music', x, y: Math.round(H / 2 - 20), w: bw, h: 18, label: 'MÚSICA: ' + (s.music ? 'SÍ' : 'NO') },
      { id: 'sfx', x, y: Math.round(H / 2 + 4), w: bw, h: 18, label: 'SONIDO: ' + (s.sfx ? 'SÍ' : 'NO') },
      { id: 'salir', x, y: Math.round(H / 2 + 28), w: bw, h: 18, label: 'SALIR AL MENÚ' },
    ];
  }
  function pauseTap(x, y) {
    for (const b of pauseButtons()) {
      if (!G.inRect(x, y, b, 3)) continue;
      G.audio.sfx('sel');
      const s = G.save.data.settings;
      if (b.id === 'seguir') S.paused = false;
      else if (b.id === 'music') { s.music = s.music ? 0 : 1; G.save.write(); G.audio.apply(); }
      else if (b.id === 'sfx') { s.sfx = s.sfx ? 0 : 1; G.save.write(); G.audio.apply(); }
      else if (b.id === 'salir') { S.paused = false; G.go('map'); }
    }
  }

  F.update = function (dt) {
    if (!S || S.paused) return;
    S.t += dt;
    if (S.hitstop > 0) { S.hitstop -= dt; return; }
    const sdt = dt * S.slow;
    S.phaseT += dt;
    if (S.phase === 'intro' && S.phaseT > 1.7) { S.phase = 'fight'; S.phaseT = 0; }
    if (S.phase === 'intro' && S.phaseT > 0.75 && !S.fightSfx) { S.fightSfx = true; G.audio.sfx('fight'); }
    if (S.phase === 'fight') {
      S.time -= dt;
      if (S.time <= 0) {
        S.time = 0; S.timeup = true;
        S.winner = S.p.hp / S.p.max >= S.e.hp / S.e.max ? 'v' : 'h';
        S.phase = 'ko'; S.phaseT = 0; G.audio.sfx('alarm');
        const loser = S.winner === 'v' ? S.e : S.p; loser.state = 'ko'; loser.st = 0; loser.vz = 160; loser.vx = 0;
      }
    }
    if (S.phase === 'ko') {
      if (S.phaseT > 0.9) S.slow = 1;
      if (S.phaseT > 1.6) { const w = S.winner === 'v' ? S.p : S.e; if (w.state === 'idle' || w.state === 'walk') { w.mode = 'robot'; w.flying = false; startState(w, 'win'); } }
      if (S.phaseT > 3.4) { S.phase = 'end'; finish(); return; }
    }
    // control
    if (S.auto) aiCtrl(S.p, S.e, dt); else playerCtrl(S.p);
    aiCtrl(S.e, S.p, dt);
    if (S.phase === 'ko') { for (const r of [S.p, S.e]) { r.ctrl.golpe = r.ctrl.salto = r.ctrl.volar = r.ctrl.transf = false; r.ctrl.mx = r.ctrl.my = 0; } }
    updRobot(S.p, S.e, sdt);
    updRobot(S.e, S.p, sdt);
    updArmy(sdt);
    updProj(sdt);
    // objetos: fuego y humo
    for (const o of S.objs) {
      if (!o.fires) continue;
      if (o.state === 2) { o.smokeT -= sdt; o.fireT -= sdt; if (o.fireT <= 0) o.fires = o.fires.filter(() => false); }
      for (const f of o.fires) { f.t = (f.t || 0) - sdt; if (f.t <= 0) { f.t = G.rand(0.35, 0.6); smoke(f.x, f.y, f.z + f.s * 2, G.rand(4, 7), 1); } }
      if (o.state === 2 && o.smokeT > 0 && Math.random() < sdt * 2) smoke(o.x + Math.random() * o.w, o.y - 2, 6, G.rand(4, 8), DUSTC[S.st.id] || 0);
    }
    for (const o of S.objs) if (o.smoke && o.state < 2) { o.smT = (o.smT || 0) - sdt; if (o.smT <= 0) { o.smT = 0.5; smoke(o.x + o.w / 2, o.y, o.h + 4, 5, 0, 3.2); } }
    // partículas
    for (const p of S.parts) {
      p.t += sdt;
      if (p.k === 'deb') { p.vz -= 520 * sdt; p.z += p.vz * sdt; p.x += p.vx * sdt; p.y += p.vy * sdt; if (p.z < 0) { p.z = 0; p.vz *= -0.3; p.vx *= 0.5; p.vy *= 0.5; } }
      else if (p.k === 'smoke') { p.z += p.vz * sdt; p.x += p.vx * sdt; }
      else if (p.k === 'heal' || p.k === 'txt') p.z += p.vz * sdt;
    }
    S.parts = S.parts.filter((p) => p.t < p.life);
    if (S.parts.length > 260) S.parts.splice(0, S.parts.length - 260);
    // cámara
    const t = camTarget();
    S.cam.x += (t.x - S.cam.x) * Math.min(1, dt * 5); S.cam.y += (t.y - S.cam.y) * Math.min(1, dt * 4);
  };

  // ---------- dibujo ----------
  function drawRobot(r, cx, cy) {
    const sx = Math.round(r.x - cx), gy = Math.round(r.y - cy), sy = Math.round(r.y - cy - r.z);
    const veh = r.mode === 'veh';
    const sw = veh ? 30 : 26 - Math.min(10, r.z / 8);
    ell(sx + 2, gy, Math.max(10, sw), Math.max(3, 5 - r.z / 30), '#000', 0.32);
    let fr = 'idle0';
    const flyAnim = Math.floor(r.anim * 10) % 2;
    switch (r.state) {
      case 'idle': fr = veh ? 'veh' + (Math.floor(r.anim * 4) % 2) : (r.flying ? 'fly' : (Math.floor(r.anim * 2) % 2 ? 'idle1' : 'idle0')); break;
      case 'walk': fr = veh ? 'veh' + (Math.floor(r.anim * 10) % 2) : (r.flying ? 'fly' : ['walk0', 'walk1', 'walk2', 'walk1'][Math.floor(r.anim * 7) % 4]); break;
      case 'atk': fr = r.st < 0.08 ? 'wind' : (r.combo === 2 ? 'upper' : 'punch'); break;
      case 'jump': fr = 'jump'; break;
      case 'dive': case 'fdive': fr = 'dive'; break;
      case 'shoot': fr = 'punch'; break;
      case 'flyatk': fr = 'flyp'; break;
      case 'ram': fr = 'veh' + flyAnim; break;
      case 'xform': fr = Math.floor(r.st * 22) % 2 ? 'crouch' : 'veh0'; if (r.mode === 'veh') fr = Math.floor(r.st * 22) % 2 ? 'veh0' : 'crouch'; break;
      case 'hit': fr = 'hit'; break;
      case 'down': case 'ko': fr = r.z > 6 ? 'hit' : 'down'; break;
      case 'getup': fr = 'crouch'; break;
      case 'win': fr = 'win'; break;
    }
    if (r.state === 'xform' && Math.floor(r.st * 30) % 2) { G.drawSprite(r.id, fr, r.face, sx, sy, 1, '#ffffff'); }
    else if (r.hitFlash > 0) G.drawSprite(r.id, fr, r.face, sx, sy, 1, '#ffffff');
    else if (r.invul > 0 && Math.floor(r.invul * 20) % 2) { G.ctx().globalAlpha = 0.5; G.drawSprite(r.id, fr, r.face, sx, sy); G.ctx().globalAlpha = 1; }
    else G.drawSprite(r.id, fr, r.face, sx, sy);
    // propulsores
    if (!veh && (r.flying || r.state === 'flyatk') && r.z > 4) {
      const f = Math.floor(r.anim * 14) % 3;
      for (const dx of [-7, 8]) drawFlame(sx + dx * r.face, sy + 7 + f, 3, f);
    }
    if (r.state === 'ram') for (let i = 0; i < 4; i++) A(sx - r.face * (40 + i * 7), sy - 8 - i * 6, 14, 1, '#ffffff', 0.6);
    if (r.state === 'atk' && r.st > 0.08 && r.st < 0.2) for (const yy of [-80, -60, -66]) A(sx + r.face * 18 - (r.face < 0 ? 26 : 0), sy + yy, 26, 1, '#ffffff', 0.5);
  }
  function drawUnit(u, cx, cy) {
    const sx = Math.round(u.x - cx), gy = Math.round(u.y - cy), sy = Math.round(u.y - cy - u.z);
    const pal = S.st.army;
    if (u.kind === 'tank') { ell(sx, gy + 1, 15, 3, '#000', 0.3); G.ctx().drawImage(armyTankImg(pal, u.face), sx - 20, sy - 21); }
    else { ell(sx, gy, 10, 3, '#000', 0.22); G.ctx().drawImage(heliImg(pal, u.face, Math.floor(S.t * 20) % 2), sx - 24, sy - 12); }
  }
  function drawProj(p, cx, cy) {
    const sx = Math.round(p.x - cx), sy = Math.round(p.y - cy - p.z), gy = Math.round(p.y - cy);
    if (p.t < 0) return;
    if (p.kind === 'bullet') { R(sx - 2, sy - 1, 5, 3, OUT); R(sx - 1, sy, 3, 1, '#fff3a0'); return; }
    if (p.kind === 'beam') {
      const c = p.col || { d: '#3fae12', b: '#8cff3c', l: '#d2ffa8' };
      ell(sx, gy, 4, 1, '#000', 0.25);
      A(sx - p.face * 18 - 7, sy - 1, 14, 3, c.b, 0.35);
      R(sx - 9, sy - 2, 18, 5, c.d); R(sx - 8, sy - 1, 16, 3, c.b); R(sx - 6, sy, 12, 1, '#ffffff');
      return;
    }
    ell(sx, gy, 3, 1, '#000', 0.25);
    if (p.kind === 'shell') { R(sx - 3, sy - 1, 6, 3, OUT); R(sx - 2, sy, 4, 1, '#ffe266'); A(sx - p.face * 10 - 4, sy, 10, 1, '#ffffff', 0.5); }
    else { R(sx - 4, sy - 1, 9, 3, OUT); R(sx - 3, sy, 7, 1, '#e8e8f0'); Px(sx + p.face * 4, sy, '#e03a2a'); drawFlame(sx - p.face * 6, sy + 2, 2, Math.floor(p.t * 20)); }
  }
  function drawPart(p, cx, cy) {
    const sx = Math.round(p.x - cx), sy = Math.round(p.y - cy - p.z), k = p.t / p.life;
    const X = G.ctx();
    switch (p.k) {
      case 'spark': { const im = sparkImg(p.s * (1 - k * 0.4)); X.drawImage(im, sx - im.width / 2 | 0, sy - im.height / 2 | 0); break; }
      case 'deb': R(sx - 1, sy - 1, p.s + 2, p.s + 2, OUT); R(sx, sy, p.s, p.s, p.c); break;
      case 'smoke': { const im = puffImg(p.s * (0.6 + k * 0.9), p.ci); if (k > 0.75) X.globalAlpha = (1 - k) * 4; X.drawImage(im, sx - im.width / 2 | 0, sy - im.height / 2 | 0); X.globalAlpha = 1; break; }
      case 'boom': { const r = p.s * (0.45 + k * 0.8); ell(sx, sy, r, r, k < 0.3 ? '#ffffff' : k < 0.6 ? '#ffe266' : '#ff7a1a', 1 - k * 0.6); ell(sx, sy, r * 0.6, r * 0.6, k < 0.5 ? '#ffffff' : '#ffc23a', 1 - k); break; }
      case 'dust': { const r = p.s * (0.4 + k * 0.9); ell(sx, Math.round(p.y - cy), r, r * 0.32, '#e8dcc4', 0.45 * (1 - k)); break; }
      case 'heal': A(sx - 1, sy, 3, 1, '#7dffb0', 1 - k); A(sx, sy - 1, 1, 3, '#7dffb0', 1 - k); break;
      case 'txt': G.text(p.txt, sx, sy, { c: p.c, o: '#000', al: 'c', a: k > 0.7 ? (1 - k) * 3 : 1 }); break;
    }
  }
  function drawObjFires(o, cx, cy) {
    if (!o.fires) return;
    const f = Math.floor(S.t * 10);
    for (const fi of o.fires) drawFlame(fi.x - cx, fi.y - cy - fi.z, fi.s, f + Math.round(fi.x));
  }

  F.draw = function () {
    if (!S) return;
    const g = G.ctx(), W = G.W, H = G.H;
    const cx = Math.round(S.cam.x), cy = Math.round(S.cam.y);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.drawImage(S.bg, -cx, -cy);
    const list = [];
    for (const o of S.objs) { if (o.x + o.w + 30 < cx || o.x - 30 > cx + W) continue; list.push({ k: o.key, t: 0, o }); }
    list.push({ k: S.p.y + 0.1, t: 1, o: S.p }); list.push({ k: S.e.y, t: 1, o: S.e });
    for (const u of S.army) list.push({ k: u.y, t: 2, o: u });
    for (const p of S.proj) list.push({ k: p.y, t: 3, o: p });
    for (const p of S.parts) list.push({ k: p.k === 'smoke' || p.k === 'txt' || p.k === 'heal' ? p.y + 400 : p.y + 0.2, t: 4, o: p });
    list.sort((a, b) => a.k - b.k);
    for (const it of list) {
      if (it.t === 0) { const o = it.o, im = G.objImg(o); g.drawImage(im.c, Math.round(o.x + im.dx - cx), Math.round(o.y + im.dy - cy)); drawObjFires(o, cx, cy); }
      else if (it.t === 1) drawRobot(it.o, cx, cy);
      else if (it.t === 2) drawUnit(it.o, cx, cy);
      else if (it.t === 3) drawProj(it.o, cx, cy);
      else drawPart(it.o, cx, cy);
    }
    drawHUD();
    if (!S.auto) drawControls();
    drawBanner();
    if (S.paused) drawPause();
  };
  function bar(x, y, w, h, v, sh, right, col) {
    R(x - 2, y - 2, w + 4, h + 4, '#000'); R(x - 1, y - 1, w + 2, h + 2, '#ffffff'); R(x, y, w, h, '#1a1424');
    const fw = Math.round(w * G.clamp(v, 0, 1)), sw = Math.round(w * G.clamp(sh, 0, 1));
    if (!right) { R(x, y, sw, h, '#c0212e'); R(x, y, fw, h, col); R(x, y, fw, Math.max(1, Math.round(h * 0.34)), '#ffffff88'); }
    else { R(x + w - sw, y, sw, h, '#c0212e'); R(x + w - fw, y, fw, h, col); R(x + w - fw, y, fw, Math.max(1, Math.round(h * 0.34)), '#ffffff88'); }
    for (let i = x + 10; i < x + w; i += 10) A(i, y, 1, h, '#000', 0.3);
  }
  function drawHUD() {
    const W = G.W, p = S.p, e = S.e;
    const sl = G.safeL + 6, sr = W - G.safeR - 6, top = 5 + G.safeT;
    const bw = Math.max(70, Math.min(180, Math.floor(W / 2) - 40 - Math.max(sl, W - sr)));
    bar(sl, top, bw, 8, p.hp / p.max, p.shadowHp / p.max, false, '#ffd23a');
    bar(sr - bw, top, bw, 8, e.hp / e.max, e.shadowHp / e.max, true, '#ffd23a');
    const rw = Math.round(bw * 0.55);
    bar(sl, top + 13, rw, 2, p.rep / 100, 0, false, '#5effc0');
    bar(sr - rw, top + 13, rw, 2, e.rep / 100, 0, true, '#5effc0');
    if (W > 420) { G.text('AUTORREPARAR', sl + rw + 5, top + 11, { c: '#5effc0', o: '#000' }); G.text('AUTORREPARAR', sr - rw - 5, top + 11, { c: '#5effc0', o: '#000', al: 'r' }); }
    G.text(p.sp.name, sl, top + 20, { c: '#ffffff', o: '#000' });
    G.text('PUNTOS ' + G.pad(S.score, 6), sl, top + 30, { c: '#ffe266', o: '#000' });
    G.text(e.sp.name, sr, top + 20, { c: '#ffffff', o: '#000', al: 'r' });
    G.text('RIVAL ' + S.level + ' DE 6', sr, top + 30, { c: '#fff3a0', o: '#000', al: 'r' });
    const tx = Math.round(W / 2);
    R(tx - 15, top - 3, 30, 20, '#000'); R(tx - 14, top - 2, 28, 18, '#ffffff'); R(tx - 13, top - 1, 26, 16, '#14101c');
    G.text(G.pad(Math.ceil(S.time), 2), tx, top + 1, { c: S.time < 10 && Math.floor(S.t * 4) % 2 ? '#ff5a4a' : '#ffffff', s: 2, al: 'c' });
    G.text('NIVEL ' + S.level + ' · ' + S.st.name, tx, top + 21, { c: '#ffffff', o: '#000', al: 'c' });
    const pct = Math.min(100, Math.round((S.destroyed / S.goalWt) * 100));
    const dw = 44, dx = tx - dw / 2;
    R(dx - 1, top + 31, dw + 2, 5, '#000'); R(dx, top + 32, dw, 3, '#3a1a10'); R(dx, top + 32, Math.round(dw * pct / 100), 3, '#ff7a1a');
    if (W >= 440) G.text('DESTRUCCIÓN', dx - 4, top + 30, { c: '#ff9a3a', o: '#000', al: 'r' });
    G.text(pct + '%', dx + dw + 4, top + 30, { c: '#ff9a3a', o: '#000' });
    const pb = S.ctl.pause;
    R(pb.x, pb.y + G.safeT, pb.w, pb.h, '#000'); R(pb.x + 1, pb.y + 1 + G.safeT, pb.w - 2, pb.h - 2, '#2a2436');
    R(pb.x + 4, pb.y + 4 + G.safeT, 2, 6, '#ffffff'); R(pb.x + 8, pb.y + 4 + G.safeT, 2, 6, '#ffffff');
  }
  function drawControls() {
    const C = S.ctl, X = G.ctx();
    const j = C.joy || { bx: C.jhome.x, by: C.jhome.y, x: C.jhome.x, y: C.jhome.y };
    const r = C.jr;
    ell(j.bx, j.by, r + 1, r + 1, '#000', 0.25); ell(j.bx, j.by, r, r, '#ffffff', 0.16); G.ring(j.bx, j.by, r, '#ffffff', 0.55);
    let kx = j.x - j.bx, ky = j.y - j.by; const d = Math.hypot(kx, ky); if (d > r) { kx = kx / d * r; ky = ky / d * r; }
    ell(j.bx + kx, j.by + ky, 12, 12, '#d8d8e0', C.joy ? 0.8 : 0.55); ell(j.bx + kx - 3, j.by + ky - 3, 5, 5, '#ffffff', 0.5);
    for (const k in C.btn) {
      const b = C.btn[k], pr = b.held ? 1 : 0;
      ell(b.x + 1, b.y + 2, b.r, b.r, '#000', 0.4);
      ell(b.x, b.y + pr, b.r, b.r, b.d, 0.9);
      ell(b.x, b.y + pr - 1, b.r - 1, b.r - 1, b.c, 0.88);
      ell(b.x - b.r * 0.3, b.y + pr - b.r * 0.35, b.r * 0.45, b.r * 0.3, '#ffffff', 0.3);
      G.ring(b.x, b.y + pr, b.r, '#ffffff', 0.7);
      G.text(b.label, b.x, b.y - 3 + pr, { c: '#ffffff', o: '#00000099', al: 'c' });
    }
    // energía de vuelo alrededor del botón VOLAR
    const vb = C.btn.volar, fr = G.clamp(S.p.fly / S.p.flyMax, 0, 1);
    for (let i = 0; i < 72 * fr; i++) {
      const an = -Math.PI / 2 + (i / 72) * Math.PI * 2;
      for (const rr of [vb.r + 2, vb.r + 3]) G.Px(vb.x + Math.cos(an) * rr, vb.y + Math.sin(an) * rr, S.p.flying ? '#bff8ff' : '#7ec8ff');
    }
    X.globalAlpha = 1;
  }
  function drawBanner() {
    const W = G.W, H = G.H, cx = Math.round(W / 2), cy = Math.round(H * 0.42);
    if (S.phase === 'intro') {
      if (S.phaseT < 0.75) G.text('NIVEL ' + S.level, cx, cy - 10, { s: 3, c: ['#fff6c2', '#ffe266', '#ffd23a', '#ffb020', '#ff8a1a', '#ff6a1a', '#e04a1a'], o: '#000', al: 'c' });
      else { const k = Math.min(1, (S.phaseT - 0.75) * 6); G.text('¡LUCHA!', cx, cy - 12, { s: k < 1 ? 5 : 4, c: ['#ffffff', '#fff6c2', '#ffe266', '#ffd23a', '#ffb020', '#ff8a1a', '#ff5a1a'], o: '#000', al: 'c' }); }
    }
    if (S.phase === 'ko' || S.phase === 'end') {
      const txt = S.timeup ? '¡TIEMPO!' : 'K.O.';
      G.text(txt, cx, cy - 14, { s: 5, c: ['#ffffff', '#ffe0e0', '#ffb0a0', '#ff7a6a', '#f04a3a', '#d8301a', '#a81a10'], o: '#000', al: 'c' });
      if (S.phaseT > 1.6) G.text(S.winner === 'v' ? '¡VICTORIA!' : 'DERROTA', cx, cy + 26, { s: 2, c: S.winner === 'v' ? '#ffe266' : '#a8b0c0', o: '#000', al: 'c' });
    }
  }
  function drawPause() {
    const W = G.W, H = G.H;
    A(0, 0, W, H, '#000', 0.6);
    G.text('PAUSA', W / 2, H / 2 - 70, { s: 3, c: '#ffffff', o: '#000', al: 'c' });
    for (const b of pauseButtons()) G.button(b, b.id === 'seguir');
  }
})(window.G);
