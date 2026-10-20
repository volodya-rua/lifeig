// Lets LifeIG open without a connection. The app itself loads network-first so updates show up right away;
// fonts are cache-first. GitHub API calls are never cached.
const CACHE = 'lifeig-v1';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const keep = r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request, { ignoreSearch: true })));
  } else if (url.hostname.startsWith('fonts.')) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(keep)));
  }
});
