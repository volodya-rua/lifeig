// Lets LifeIG open without a connection. Everything loads network-first so updates show up right away.
// GitHub API calls are never cached.
const CACHE = 'lifeig-v3';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'fonts/fonts.css',
  ...['FamiljenGrotesk-normal', 'FamiljenGrotesk-italic', 'MartianMono-normal', 'Newsreader-normal', 'Newsreader-italic']
    .flatMap(f => [`fonts/${f}-latin.woff2`, `fonts/${f}-latin-ext.woff2`])];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const keep = r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  if (url.origin === location.origin) {
    // no-cache: always ask GitHub Pages for the latest (a cheap 304 when unchanged) instead of its 10-minute browser cache
    e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then(keep).catch(() => caches.match(e.request, { ignoreSearch: true })));
  }
});
