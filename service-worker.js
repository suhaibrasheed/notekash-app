const CACHE_VERSION = 'notekash-modular-v2.0.1';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './favicon.ico',
  './styles/main.css',
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
  './js/features/cursor-splash.js',
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
  './vendor/fuse.min.js',
  './vendor/katex.min.js',
  './vendor/auto-render.min.js',
  './vendor/pdf.min.js',
  './vendor/mammoth.browser.min.js',
  './vendor/Readability.min.js',
  './vendor/tesseract.min.js',
  './vendor/plyr.polyfilled.js',
  './vendor/plyr.css',
  './vendor/katex.min.css',
  './vendor/html-to-image.min.js',
  './vendor/d3.v7.min.js',
  './vendor/chart.umd.min.js',
  './vendor/jszip.min.js',
  './vendor/jspdf.umd.min.js',
  './vendor/pdfmake.min.js',
  './vendor/vfs_fonts.min.js',
  './vendor/html2canvas.min.js',
  './vendor/fonts/KaTeX_AMS-Regular.woff2',
  './vendor/fonts/KaTeX_Caligraphic-Bold.woff2',
  './vendor/fonts/KaTeX_Caligraphic-Regular.woff2',
  './vendor/fonts/KaTeX_Fraktur-Bold.woff2',
  './vendor/fonts/KaTeX_Fraktur-Regular.woff2',
  './vendor/fonts/KaTeX_Main-Bold.woff2',
  './vendor/fonts/KaTeX_Main-BoldItalic.woff2',
  './vendor/fonts/KaTeX_Main-Italic.woff2',
  './vendor/fonts/KaTeX_Main-Regular.woff2',
  './vendor/fonts/KaTeX_Math-BoldItalic.woff2',
  './vendor/fonts/KaTeX_Math-Italic.woff2',
  './vendor/fonts/KaTeX_SansSerif-Bold.woff2',
  './vendor/fonts/KaTeX_SansSerif-Italic.woff2',
  './vendor/fonts/KaTeX_SansSerif-Regular.woff2',
  './vendor/fonts/KaTeX_Script-Regular.woff2',
  './vendor/fonts/KaTeX_Size1-Regular.woff2',
  './vendor/fonts/KaTeX_Size2-Regular.woff2',
  './vendor/fonts/KaTeX_Size3-Regular.woff2',
  './vendor/fonts/KaTeX_Size4-Regular.woff2',
  './vendor/fonts/KaTeX_Typewriter-Regular.woff2',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32x32.png',
  './icons/favicon-16x16.png',
  './icons/screenshot-mobile.png',
  './icons/screenshot-desktop.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.warn(`SW Install: Skipped ${url} — HTTP ${response.status}`);
            }
          } catch (err) {
            console.warn(`SW Install: Failed to cache ${url} —`, err.message);
          }
        })
      );
    })
  );
});

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
});

// Network First strategy with Cache Fallback for dynamic updates
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const url = new URL(request.url);
        const requestPath = url.pathname + url.search;
        const isAppShellAsset = APP_SHELL.some(path => requestPath.endsWith(path.replace('./', '')));
        if (response.ok && url.origin === self.location.origin && isAppShellAsset) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          throw new Error('Offline and asset unavailable.');
        });
      })
  );
});
