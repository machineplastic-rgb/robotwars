'use strict';
// Arranque. Parámetros de prueba: ?go=fight&v=0&s=0&lv=1&auto=1&sim=5
(function (G) {
  G.save.load();
  G.resize();
  const q = G.params;
  if (q.get('go') === 'fight') {
    const s = +(q.get('s') || 0), v = +(q.get('v') || 0), lv = +(q.get('lv') || 1);
    G.run = { villain: v, order: [0, 1, 2, 3, 4, 5].map((k) => (s + k) % 6), idx: lv - 1, score: 0 };
    G.go('fight', { stage: s, villain: v, level: lv, score: 0 });
  } else if (q.get('go')) {
    G.run = { villain: 0, order: [0, 1, 2, 3, 4, 5], idx: 0, score: 0 };
    G.go(q.get('go'), { win: true, score: 12345, base: 9000, bonus: 3345, pct: 47, time: 41, stage: 0, level: 1, villain: 'demoledor', hero: 'voltar' });
  } else G.go('title');
  const sim = +(q.get('sim') || 0);
  if (sim) G.simulate(sim);
  G.start();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !q.get('nosw')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
})(window.G);
