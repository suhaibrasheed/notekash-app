const CACHE_VERSION = 'notekash-v2.3.0';

const CORE_APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './favicon.ico',
  './styles/themes.css',
  './styles/base.css',
  './styles/editor.css',
  './styles/presentation-mode.css',
  './styles/whiteboard.css',
  './styles/flashcards.css',
  './styles/layout.css',
  './styles/ai-magic.css',
  './styles/mcq-study.css',
  './styles/welcome-screen.css',
  './styles/mobile.css',
  './styles/ascension.css',
  './styles/audio-write.css',
  './styles/pdf-viewer.css',
  './styles/pro-presenter.css',
  './js/main.js',
  './js/core/lazy-loader.js',
  './js/core/pwa.js',
  './js/core/config.js',
  './js/core/state.js',
  './js/core/license.js',
  './js/core/offline.js',
  './js/core/supabase.js',
  './js/core/db.js',
  './js/core/fs.js',
  './js/core/settings.js',
  './js/core/router.js',
  './js/core/ui.js',
  './js/core/events.js',
  './js/core/util.js',
  './js/core/services.js',
  './js/core/storage.js',
  './js/core/content-tools.js',
  './js/features/command-palette.js',
  './js/features/dropbox.js',
  './js/features/splitscreen.js',
  './js/features/quiz.js',
  './js/features/search.js',
  './js/features/whiteboard.js',
  './js/features/graph-maps.js',
  './js/features/pdf-tools.js',
  './js/features/audio-engine.js',
  './js/features/cursor-splash.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/favicon-32x32.png',
  './icons/favicon-16x16.png'
];

// Install: Cache essential core shell with individual item fault-tolerance
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Robust pre-caching: never let a single missing asset reject the whole install
      const cachePromises = CORE_APP_SHELL.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.ok) {
            await cache.put(url, res);
          }
        } catch (err) {
          console.warn('[SW Install] Pre-cache item failed:', url, err);
        }
      });
      await Promise.all(cachePromises);
    })
  );
});

// Activate: Eradicate all obsolete/legacy caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'NUKE_CACHE') {
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
  }
});

// Resilient Fetch Strategy:
// 1. Navigation requests (HTML): Network-First (with 1.5s timeout) -> Fallback to Cache.
//    Ensures online users immediately get the newest version without cache lag, while offline users load instantly.
// 2. Static Assets: Stale-While-Revalidate with background cache refresh.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Ignore non-http requests (e.g. extensions, data URLs)
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    // Navigation: Network first with fast 1.5s timeout fallback to cached shell
    event.respondWith(
      new Promise((resolve) => {
        let hasResolved = false;
        const timer = setTimeout(async () => {
          if (!hasResolved) {
            hasResolved = true;
            const cached = (await caches.match('./index.html')) || (await caches.match('./'));
            if (cached) resolve(cached);
          }
        }, 1500);

        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            if (!hasResolved) {
              hasResolved = true;
              clearTimeout(timer);
              resolve(networkResponse);
            }
          })
          .catch(async () => {
            if (!hasResolved) {
              hasResolved = true;
              clearTimeout(timer);
              const cached = (await caches.match('./index.html')) || (await caches.match('./'));
              resolve(cached || new Response('Offline', { status: 503 }));
            }
          });
      })
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        // Background network revalidation
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });

        // Instant return from cache if present; otherwise wait for network
        return cachedResponse || networkFetch;
      })
    );
  } else {
    // Cross-origin assets (Google Fonts, CDN libraries)
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.ok && (request.url.includes('fonts.gstatic.com') || request.url.includes('cdnjs.cloudflare.com'))) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => new Response('', { status: 408 }));
      })
    );
  }
});
