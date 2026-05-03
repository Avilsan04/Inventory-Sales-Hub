/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE = 'ish-v1';
const PRECACHE = ['/'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  void self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  void self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass API calls through — do not cache
  if (e.request.url.includes('/api/')) return;

  e.respondWith(caches.match(e.request).then((cached) => cached ?? fetch(e.request)));
});
