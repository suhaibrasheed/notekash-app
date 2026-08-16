const APP_VERSION = 'plain-modular-2026-08-15-02';

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');

      // Check for updates periodically
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('notekash:update-available', {
                detail: {
                  version: APP_VERSION,
                  apply: () => {
                    window.__NOTEKASH_UPDATE_ACCEPTED__ = true;
                    worker.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              }));
            }
          });
        });
      }

      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        if (window.__NOTEKASH_UPDATE_ACCEPTED__) {
          reloading = true;
          window.location.reload();
        }
      });
    } catch (error) {
      console.warn('[NoteKash] Service worker registration failed:', error);
    }
  });
}

export function installUpdatePromptBridge() {
  window.addEventListener('notekash:update-available', (event) => {
    const apply = event.detail?.apply;
    const app = window.App;

    if (app?.ui?.showToast) {
      app.ui.showToast('🚀 A new NoteKash version is ready!', {
        type: 'info',
        duration: 20000,
        action: {
          label: 'Update Now',
          callback: () => {
            if (typeof apply === 'function') {
              apply();
            } else {
              window.location.reload();
            }
          }
        }
      });
      return;
    }

    if (window.confirm('A new NoteKash version is available. Reload now to update?')) {
      apply?.();
    }
  });
}
