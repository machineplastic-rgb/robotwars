// Service worker: siempre carga primero lo último de internet; la copia guardada solo se usa sin conexión.
const CACHE_NAME = 'robotwars-v7';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'js/core.js', 'js/font.js', 'js/audio.js', 'js/robots.js', 'js/stages.js', 'js/fight.js', 'js/shop.js', 'js/menus.js', 'js/main.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' = descarga fresca, sin usar la caché del navegador
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const fresh = req.mode === 'navigate' ? new Request(req.url, { cache: 'no-cache' }) : new Request(req, { cache: 'no-cache' });
  e.respondWith(
    fetch(fresh)
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.open(CACHE_NAME).then((c) => c.match(req, { ignoreSearch: true })))
  );
});
