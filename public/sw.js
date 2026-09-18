// SHOMAR Protect Offline Service Worker
const CACHE_NAME = 'shomar-protect-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only cache same-origin assets
  if (url.origin !== self.location.origin) return;

  // Never intercept Vite internals, HMR, dev chunks, or API routes
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('vite') ||
    url.pathname.includes('node_modules') ||
    url.pathname.includes('virtual:')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If offline and requesting document, return cached root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
