// ==========================================================================
// NoteKash - js/main.js
// Modern Native ES Module Entry Point — Strangled legacy-app.js
//
// Boot order:
//  1. ES module imports (synchronous, hoisted before any script runs)
//  2. window.App declared with core modules & lifecycle handlers
//  3. All stubs defined (lightweight proxies/shapes)
//  4. PWA bridge + registration
//  5. DOMContentLoaded triggers App.init() and sub-component boot
//
// Zero Regression Policy:
//  - All stubs expose the exact same property shape as the real modules.
//  - hub stub keeps a live tasks/pomodoroStats reference so UI renders work.
//  - audio stub has a real initializePlayersIn() so article view never errors.
//  - mindMap/visualMap/pdf stubs are pure no-ops (only called on view activate).
// ==========================================================================

import { LazyLoader } from './core/lazy-loader.js';
import { installUpdatePromptBridge, registerPWA } from './core/pwa.js';
import config from './core/config.js';
import state from './core/state.js';

// Core Infrastructure Modules
import { indexedDBModule, browserStore } from './core/db.js';
import { fs } from './core/fs.js';
import { settings } from './core/settings.js';
import { router } from './core/router.js';
import { ui } from './core/ui.js';
import { events } from './core/events.js';
import { util } from './core/util.js';
import { services } from './core/services.js';
import { commandPalette } from './features/command-palette.js';
import { storage } from './core/storage.js';
import { splitScreen } from './features/splitscreen.js';
import { contentTools } from './core/content-tools.js';
import { globalSearch, find } from './features/search.js';

// Phase 9 Final Monolith Strangling Modules
import { license } from './core/license.js';
import { offline } from './core/offline.js';
import { InteractiveCursorSplash } from './features/cursor-splash.js';
import { supabase } from './core/supabase.js';

window.NoteKashModules = window.NoteKashModules || {};
window.NoteKashModules.lazyLoader = LazyLoader;

// ==========================================================================
// DECLARE CORE APPLICATION NAMESPACE
// ==========================================================================
const App = {
  supabase,
  config,
  state,
  indexedDB: indexedDBModule,
  browserStore,
  fs,
  settings,
  router,
  ui,
  events,
  util,
  services,
  commandPalette,
  storage,
  splitScreen,
  contentTools,
  globalSearch,
  find,
  lazyLoader: LazyLoader,
  loadLibrary: (name) => LazyLoader.load(name),
  license,
  offline,
  isSplitIframeMode: false,

  // Stub placeholders
  whiteboard: null,
  hub: null,
  mindMap: null,
  visualMap: null,
  audio: null,
  annotationEngine: null,
  pdf: null,
  dropbox: null,
  quiz: null,

  handleMapAction(event, action) {
    events.handleMapAction(event, action);
  },

  Updater: {
    async nukeCacheAndReload() {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0'; overlay.style.left = '0';
      overlay.style.width = '100vw'; overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.85)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex'; overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';
      overlay.style.color = 'white';
      overlay.innerHTML = '<div style="font-size: 2rem; margin-bottom: 1rem;">🚀</div><h2>Updating NoteKash...</h2><p>The app will reload in a moment.</p>';
      document.body.appendChild(overlay);

      const isOnline = navigator.onLine;
      if (!isOnline) {
        overlay.innerHTML = '<div style="font-size: 2rem; margin-bottom: 1rem;">Offline update deferred</div><h2>Connect to the internet to apply updates safely.</h2><p>Please try again when you’re online.</p>';
        setTimeout(() => overlay.remove(), 3500);
        return;
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      setTimeout(() => window.location.reload(), 1000);
    }
  },

  pwa: {
    init() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').then(reg => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdatePrompt(newWorker);
              }
            });
          });
        }).catch(error => {
          console.error('Service Worker registration failed:', error);
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (window.__NOTEKASH_UPDATE_ACCEPTED__) {
            window.location.reload();
          }
        });
      }
    },
    handleInstallPrompt(e) {
      e.preventDefault();
      App.state.pwa.installPromptEvent = e;
      
      // Inject native-looking, subtle sliding PWA install banner if not already present
      if (!document.getElementById('pwa-install-banner')) {
        // Simple slideUp animation style injection if not already in document
        if (!document.getElementById('pwa-banner-style')) {
          const style = document.createElement('style');
          style.id = 'pwa-banner-style';
          style.textContent = `
            @keyframes pwaSlideUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pwaFadeOut {
              from { opacity: 1; transform: translateY(0); }
              to { opacity: 0; transform: translateY(20px); }
            }
          `;
          document.head.appendChild(style);
        }

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.style.cssText = `
          position: fixed;
          bottom: 24px;
          left: 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          z-index: 999999;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
          backdrop-filter: blur(10px);
        `;
        
        banner.innerHTML = `
          <div style="display: flex; gap: 12px; align-items: flex-start; position: relative;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: color-mix(in srgb, var(--primary-color) 10%, transparent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary-color);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div style="flex: 1; padding-right: 18px;">
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-primary); line-height: 1.45; font-weight: 600; font-family: var(--font-display);">Get NoteKash as Progressive App for native support and better performance.</p>
            </div>
            <button id="pwa-close-banner-btn" style="position: absolute; right: -4px; top: -4px; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 24px; height: 24px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-secondary)'">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <button id="pwa-action-install-btn" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover, #ff8c00)); border: none; color: white !important; padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.25s; box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 255, 69, 0), 0.2);" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(var(--primary-color-rgb, 255, 69, 0), 0.35)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(var(--primary-color-rgb, 255, 69, 0), 0.2)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: white !important;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline></svg>
            Install
          </button>
        `;
        document.body.appendChild(banner);
        
        const closeBanner = () => {
          banner.style.animation = 'pwaFadeOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          banner.addEventListener('animationend', () => banner.remove());
        };

        document.getElementById('pwa-close-banner-btn').addEventListener('click', closeBanner);
        
        document.getElementById('pwa-action-install-btn').addEventListener('click', async () => {
          await App.events.installPwa();
          closeBanner();
        });
      }
    },
    showUpdatePrompt(worker) {
      App.ui.showToast('A new version is available!', {
        type: 'info',
        duration: 10000,
        action: {
          label: 'Reload',
          callback: () => {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    }
  },

  async _startFileSystemSession() {

    // 1. ALWAYS load persistent settings from the connected folder on disk FIRST
    await App.settings.load();
    App.ui.applyTheme(App.settings.get('theme') || 'sepia', true);
    App.ui.applyFontSettings();

    const pendingRenamePlan = await App.fs.read('_category_rename_plan.json');
    if (pendingRenamePlan) {
      App.ui.showToast('Resuming interrupted category rename...', { type: 'warning', duration: 0 });
      await App.events.categories.executeOperationPlan(pendingRenamePlan);
    }

    const operationPlan = await App.fs.read('_category_operation_plan.json');
    if (operationPlan) {
      if (operationPlan.status === 'cancelled') {
        await App.fs.write('_category_operation_plan.json', null);
      } else {
        setTimeout(() => App.events.categories.executeOperationPlan(operationPlan), 500);
      }
    }

    const userCategories = App.settings.get('userCategories');
    if (!userCategories || (Array.isArray(userCategories) && (userCategories.length === 0 || typeof userCategories[0] === 'string' || userCategories[0].displayName === undefined))) {

      const categoryNames = Array.isArray(userCategories) && userCategories.length > 0 && typeof userCategories[0] === 'string'
        ? userCategories
        : (userCategories || App.config.categories).map(c => c.name || c);

      const migratedCategories = categoryNames.map((name, index) => ({
        name: name,
        displayName: name,
        colorIndex: userCategories?.find?.(c => c.name === name)?.colorIndex ?? index % App.util.getCategoryColorCount(),
        isDefault: name === 'General'
      }));

      await App.settings.set('userCategories', migratedCategories);
    }

    await App.loadInitialData(); // Load all other data
    App.checkAndNavigate('library');
  },

  checkAndNavigate(defaultView, defaultData = null) {
    if (App.isSplitIframeMode) return;
    const hash = window.location.hash.slice(1);
    const urlParams = new URLSearchParams(window.location.search);
    if (hash === 'login' || hash === 'signup' || urlParams.has('redirect_to')) {
      const targetSearch = window.location.search;
      const targetHash = hash ? `#${hash}` : '';
      window.location.href = `./login.html${targetSearch}${targetHash}`;
      return;
    } else {
      App.router.navigateTo(defaultView, defaultData);
      if (hash === 'pricing') {
        setTimeout(() => {
          if (typeof App.ui.showAscensionModal === 'function') {
            App.ui.showAscensionModal();
          }
        }, 350);
      }
    }
  },

  async init() {
    this.offline.init();

    if ('launchQueue' in window && typeof LaunchParams !== 'undefined' && 'files' in LaunchParams.prototype) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files || launchParams.files.length === 0) {
          return;
        }
        const fileHandles = launchParams.files;
        const files = await Promise.all(fileHandles.map(handle => handle.getFile()));
        App.ui.showToast(`Importing ${files.length} shared note(s)...`, { type: 'info' });
        App.services.backup.handleFileImport(files);
      });
    }

    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }
    this.pwa.init();
    this.events.setupGlobalListeners();

    try {
      await App.settings.load();
      this.ui.applyTheme(App.settings.get('theme') || 'sepia', true);
      this.ui.applyFontSettings();
    } catch (e) {
      console.error("Critical: Failed to load settings on initial boot.", e);
      this.ui.applyTheme('sepia', true);
      this.ui.applyFontSettings();
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      await App.dropbox.handleRedirect();
    }

    const mobileImportInput = document.getElementById('mobile-import-input');
    if (mobileImportInput) mobileImportInput.addEventListener('change', (e) => App.storage.handleMobileImport(e));

    try {
      let savedHandle = null;
      try {
        savedHandle = await this.indexedDB.getHandle('directory');
      } catch (dbErr) {
        console.warn('[NoteKash] IndexedDB getHandle non-fatal error:', dbErr);
      }

      if (savedHandle) {
        App.state.directoryHandle = savedHandle;
        App.state.storageMode = 'fileSystem';

        let permissionStatus = 'none';
        try {
          if (typeof savedHandle.queryPermission === 'function') {
            permissionStatus = await savedHandle.queryPermission({ mode: 'readwrite' });
          }
        } catch (permErr) {
          console.warn('[NoteKash] Permission query not supported or failed on device:', permErr);
        }

        if (permissionStatus === 'granted') {
          const tempToken = App.state.dropboxToken;
          await this._startFileSystemSession();
          if (tempToken) {
            App.state.dropboxToken = tempToken;
            await App.settings.set('dropboxToken', tempToken);
          }
          if (!App.isSplitIframeMode) {
            document.dispatchEvent(new CustomEvent('nk:ready'));
          }
        } else if (!App.isSplitIframeMode) {
          this.ui.applyTheme(App.settings.get('theme') || 'sepia', true);
          this.ui.applyFontSettings();
          this.checkAndNavigate('welcome', { permissionState: permissionStatus });
          document.dispatchEvent(new CustomEvent('nk:ready', { detail: { skip: true } }));
        }
      } else {
        this.ui.applyTheme(App.settings.get('theme') || 'sepia', true);
        this.ui.applyFontSettings();

        if (App.settings.get('lastStorageMode') === 'browser') {
          App.state.storageMode = 'browser';
          await App.settings.load();
          await this.loadInitialData();
          this.checkAndNavigate('library');
          if (!App.isSplitIframeMode) {
            document.dispatchEvent(new CustomEvent('nk:ready'));
          }
        } else if (!App.isSplitIframeMode) {
          this.checkAndNavigate('welcome', { permissionState: 'none' });
          document.dispatchEvent(new CustomEvent('nk:ready', { detail: { skip: true } }));
        }
      }
    } catch (error) {
      console.error("Initialization error:", error);
      this.ui.applyTheme(App.settings.get('theme') || 'sepia', true);
      this.ui.applyFontSettings();
      if (!App.isSplitIframeMode) {
        this.checkAndNavigate('welcome', { permissionState: 'none' });
        document.dispatchEvent(new CustomEvent('nk:ready', { detail: { skip: true } }));
      } else {
        document.dispatchEvent(new CustomEvent('nk:ready'));
      }
    }
  },

  async loadInitialData() {

    if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
      const indexFile = await App.fs.read('_index.json');
      if (indexFile && Array.isArray(indexFile)) {
        App.state.articles = indexFile.map(article => ({
          ...article,
          id: article.id,
          title: article.title || 'Untitled Article',
          category: article.category || 'General',
          tags: Array.isArray(article.tags) ? article.tags : [],
          readCount: article.readCount || 0,
          createdAt: article.createdAt || article.updatedAt || new Date(0).toISOString(),
          updatedAt: article.updatedAt || article.createdAt || new Date(0).toISOString(),
          wordCount: article.wordCount || 0
        })).filter(article => article.id);
      } else {
        console.warn('Missing or invalid _index.json. Opening library without full folder scan.');
        App.state.articles = [];
        App.state.needsIndexRebuild = true;
        if (App.ui) {
          App.ui.showToast('Folder index is missing. Library opened safely; create or import a note to rebuild the index.', { type: 'warning', duration: 10000 });
        }
      }
    } else {
      const articlesFromDB = await App.browserStore.getAllArticles();
      App.state.articles = articlesFromDB;
      App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    App.state.activeReaderTheme = App.settings.get('readerTheme') || 'default';

    if (!this.settings.get('hasSetViewPreference')) {
      if (window.innerWidth <= 768) await this.settings.set('mobileViewEnabled', true);
      await this.settings.set('hasSetViewPreference', true);
    }

    this.ui.applyMobileView();
    this.ui.applyFontSettings();
    document.documentElement.style.setProperty('--ui-opacity', App.settings.get('uiOpacity'));
    const blurValue = parseFloat(App.settings.get('uiOpacity')) === 0 ? '0px' : '8px';
    document.documentElement.style.setProperty('--blur-intensity', blurValue);

    // Schedule background hydration during idle time so splash screen and initial UI paint remain 100% fluid
    const scheduleIdle = typeof window.requestIdleCallback === 'function'
      ? (cb) => window.requestIdleCallback(cb, { timeout: 3000 })
      : (cb) => setTimeout(cb, 1000);

    scheduleIdle(() => {
      this.proactiveBackgroundLoader();
    });

    App.state.isInitialLoadComplete = true;
  },

  async proactiveBackgroundLoader() {
    if (App.state.isHydrated) return;
    App.state.isHydrated = true; // Set immediately before any await to prevent double-invocation race condition

    await App.license.loadState();
    let hydrationOccurred = false;

    if (App.state.directoryHandle && App.state.articles.length > 0 && App.state.articles[0].content === undefined) {
      const { articles: fullArticles } = await this.storage.getAll();
      App.state.articles = fullArticles;
      App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      hydrationOccurred = true;
    }

    await this.quiz.loadStats();
    App.state.tags = await App.fs.read('tags.json') || {};
    App.state.visualMapState = await App.fs.read('visual-map-state.json') || { snapshots: [], stickyNotes: {} };
    App.state.mindMapState = await App.fs.read('mind-map-state.json') || { snapshots: [] };

    App.globalSearch.buildIndex();

    if (hydrationOccurred && App.router.getActiveView() === 'library') {
      App.ui.filterAndRenderArticles();
    }

    App.ui.updateHeaderState();
    await this.offline.runWhenOnline(() => this.dropbox.init());
    if (!this.offline.isOffline && this.dropbox.isReady() && this.settings.get('enableDropboxSync')) this.dropbox.syncChanges(true);

    await App.util.reconcileCategories();

    const rIC = typeof requestIdleCallback === 'function' ? requestIdleCallback : (cb) => setTimeout(cb, 1000);
    rIC(() => App.contentTools.buildDataCache());

    App.state.isDataFullyLoaded = true;
  }
};

window.App = App;

installUpdatePromptBridge();
registerPWA();

// ==========================================================================
// WHITEBOARD LAZY-STUB PROXY
// ==========================================================================
const whiteboardStub = {
  state: { isOpen: false },
  init() {},
  async _loadReal() {
    try {
      const { default: realWhiteboard } = await import('./features/whiteboard.js');
      window.App.whiteboard = realWhiteboard;
      realWhiteboard.init();
      return realWhiteboard;
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load whiteboard:', err);
      if (window.App?.ui?.showToast) {
        window.App.ui.showToast('Whiteboard module could not be loaded.', { type: 'warning' });
      }
      throw err;
    }
  },
  async open(insertMode, articleId) {
    const real = await this._loadReal();
    return real.open(insertMode, articleId);
  },
  async openWithScreenshot(dataUrl, width, height, articleId, isOcclusion) {
    const real = await this._loadReal();
    return real.openWithScreenshot(dataUrl, width, height, articleId, isOcclusion);
  },
  async reopenFromEmbed(container) {
    const real = await this._loadReal();
    return real.reopenFromEmbed(container);
  },
  async initImageAnnotation(container) {
    const real = await this._loadReal();
    return real.initImageAnnotation(container);
  },
  close() {}
};

// ==========================================================================
// MINDMAP STUB
// ==========================================================================
const mindMapStub = {
  svg: null, g: null, zoom: null, simulation: null,
  width: 0, height: 0, resizeObserver: null, isInitialLoad: true,
  mindmapRoots: [], currentMindmapIndex: -1, nodeStates: {}, layoutMode: 'Force',
  currentSnapshotIndex: -1, currentMindmapSearchResults: [], currentMindmapSearchIndex: -1,
  _loaded: false,
  async _loadReal() {
    if (this._loaded && window.App.mindMap && window.App.mindMap !== this) return window.App.mindMap;
    try {
      const { mindMap: realMindMap } = await import('./features/graph-maps.js');
      window.App.mindMap = realMindMap;
      this._loaded = true;
      return realMindMap;
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load MindMap:', err);
      this._loaded = false;
      if (window.App?.ui?.showToast) {
        window.App.ui.showToast('Mind Map could not be loaded. Please check network.', { type: 'warning' });
      }
      throw err;
    }
  },
  async init() {
    const real = await this._loadReal();
    return real.init();
  },
  destroy() {
    if (window.App.mindMap !== this && window.App.mindMap.destroy) {
      window.App.mindMap.destroy();
    }
  },
  triggerResize() {
    if (window.App.mindMap !== this && window.App.mindMap.triggerResize) {
      window.App.mindMap.triggerResize();
    }
  }
};

// ==========================================================================
// VISUALMAP STUB
// ==========================================================================
const visualMapStub = {
  svg: null, g: null, zoom: null, simulation: null, link: null, node: null,
  width: 0, height: 0, resizeObserver: null,
  currentFilter: 'all', currentCategoryIndex: -1, nodeStates: {}, layoutMode: 'Force',
  selectedNodes: new Set(), currentZoom: { k: 1, x: 0, y: 0 },
  currentSearchResults: [], currentSearchIndex: -1,
  _loaded: false,
  async _loadReal() {
    if (this._loaded && window.App.visualMap && window.App.visualMap !== this) return window.App.visualMap;
    try {
      const { visualMap: realVisualMap } = await import('./features/graph-maps.js');
      window.App.visualMap = realVisualMap;
      this._loaded = true;
      return realVisualMap;
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load VisualMap:', err);
      this._loaded = false;
      if (window.App?.ui?.showToast) {
        window.App.ui.showToast('Visual Map could not be loaded. Please check network.', { type: 'warning' });
      }
      throw err;
    }
  },
  async init() {
    const real = await this._loadReal();
    return real.init();
  },
  destroy() {
    if (window.App.visualMap !== this && window.App.visualMap.destroy) {
      window.App.visualMap.destroy();
    }
  },
  triggerResize() {
    if (window.App.visualMap !== this && window.App.visualMap.triggerResize) {
      window.App.visualMap.triggerResize();
    }
  }
};

// ==========================================================================
// AUDIO STUB
// ==========================================================================
const audioStub = {
  isRecording: false,
  isTranscribing: false,
  recorder: null,
  transcriptionWorker: null,
  audioChunks: [],
  activePlayer: null,
  transcriptionToasts: new Map(),
  audioContext: null,
  analyser: null,
  animationFrameId: null,
  recordingToast: null,
  modelDB: null,
  _loaded: false,
  cleanup() {},

  async _loadReal() {
    if (this._loaded && window.App.audio && window.App.audio !== this) return window.App.audio;
    try {
      const { audio: realAudio } = await import('./features/audio-engine.js');
      realAudio.isRecording = window.App.audio.isRecording;
      realAudio.activePlayer = window.App.audio.activePlayer;
      window.App.audio = realAudio;
      this._loaded = true;
      return realAudio;
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load Audio Engine:', err);
      this._loaded = false;
      if (window.App?.ui?.showToast) {
        window.App.ui.showToast('Audio Engine could not be loaded.', { type: 'warning' });
      }
      throw err;
    }
  },

  initializePlayersIn(container) {
    if (!container) return;
    container.querySelectorAll('.nk-audio-player').forEach(player => {
      if (player.dataset.initialized) return;
      const audio = player.querySelector('audio');
      const playPauseBtn = player.querySelector('.play-pause-btn');
      const progressBar = player.querySelector('.progress-bar');
      const currentTimeEl = player.querySelector('.current-time');
      const durationEl = player.querySelector('.duration');
      if (!audio || !playPauseBtn || !progressBar) return;
      const fmt = s => {
        const m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
      };
      const updateDisplay = () => {
        if (currentTimeEl) currentTimeEl.textContent = fmt(audio.currentTime);
        if (progressBar) progressBar.value = audio.currentTime;
      };
      audio.addEventListener('loadedmetadata', () => {
        progressBar.max = audio.duration;
        if (durationEl) durationEl.textContent = fmt(audio.duration);
      });
      audio.addEventListener('timeupdate', updateDisplay);
      audio.addEventListener('play', () => playPauseBtn.classList.add('playing'));
      audio.addEventListener('pause', () => {
        playPauseBtn.classList.remove('playing');
        if (this.activePlayer === audio) this.activePlayer = null;
      });
      audio.addEventListener('ended', () => {
        playPauseBtn.classList.remove('playing');
        audio.currentTime = 0;
        updateDisplay();
        if (this.activePlayer === audio) this.activePlayer = null;
      });
      progressBar.addEventListener('input', () => {
        audio.currentTime = progressBar.value;
        updateDisplay();
      });
      player.dataset.initialized = 'true';
    });
  },

  async toggleRecording() {
    const real = await this._loadReal();
    return real.toggleRecording();
  },
  async handlePlayPause(button) {
    const real = await this._loadReal();
    return real.handlePlayPause(button);
  },
  async handleSpeedChange(button) {
    const real = await this._loadReal();
    return real.handleSpeedChange(button);
  },
  async transcribeAudioBlock(buttonEl) {
    const real = await this._loadReal();
    return real.transcribeAudioBlock(buttonEl);
  },
  async downloadTranscriptionModel(modelName) {
    const real = await this._loadReal();
    return real.downloadTranscriptionModel(modelName);
  },
  async deleteTranscriptionModels() {
    const real = await this._loadReal();
    return real.deleteTranscriptionModels();
  },
  async updateModelStatusUI() {
    const real = await this._loadReal();
    return real.updateModelStatusUI();
  }
};

// ==========================================================================
// ANNOTATION ENGINE STUB & PDF STUB
// ==========================================================================
const annotationEngineStub = {
  state: {
    context: null, isActive: false, isDrawing: false, tool: 'rect',
    colors: ['#ef4444', '#f97316', '#f0b70c', '#00ff00', '#22c55e', '#06b6d4',
             '#0000ff', '#8b5cf6', '#ff00ff', '#8b4513', '#64748b', '#7fffd4'],
    thicknesses: [1, 2, 3, 5, 6, 8, 10, 12, 15, 22],
    colorIndex: 0, thicknessIndex: 0, lastPos: { x: 0, y: 0 },
    currentPath: null
  },
  init() {
    this.state = { ...this.state, context: null, isActive: false, isDrawing: false, tool: 'rect', currentPath: null };
  },
  toggle(context) {
    pdfStub._loadReal().then(({ annotationEngine: real }) => {
      window.App.annotationEngine = real;
      real.toggle(context);
    }).catch(err => console.warn(err));
  },
  undo() {
    pdfStub._loadReal().then(({ annotationEngine: real }) => {
      window.App.annotationEngine = real;
      real.undo();
    }).catch(err => console.warn(err));
  },
  clear() {
    pdfStub._loadReal().then(({ annotationEngine: real }) => {
      window.App.annotationEngine = real;
      real.clear();
    }).catch(err => console.warn(err));
  }
};

const pdfStub = {
  state: {
    isInitialized: false, pdfDoc: null, currentPageText: null, pageNum: 1,
    pageRendering: false, pageNumPending: null, scale: 1.5,
    currentAttachment: null, annotationsByPage: {}, isPanMode: false
  },
  highlights: {
    add(text, className) {
      return pdfStub._loadReal().then(({ pdf: real }) => real.highlights.add(text, className));
    },
    apply() {
      if (window.App.pdf !== pdfStub) return window.App.pdf.highlights.apply();
      return pdfStub._loadReal().then(({ pdf: real }) => real.highlights.apply());
    },
    copyPage() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.highlights.copyPage());
    },
    copyAll() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.highlights.copyAll());
    },
    clearPage() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.highlights.clearPage());
    }
  },
  viewer: {
    open(attachmentId) {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.open(attachmentId));
    },
    toggleMoreMenu(forceClose) {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.toggleMoreMenu(forceClose));
    },
    togglePanMode() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.togglePanMode());
    },
    cycleTextViewFontSize() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.cycleTextViewFontSize());
    },
    applyTextViewFontSize() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.applyTextViewFontSize());
    },
    cycleTextViewTheme() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.cycleTextViewTheme());
    },
    applyTextViewTheme() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.applyTextViewTheme());
    },
    applyTextViewHighlight() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.applyTextViewHighlight());
    },
    toggleTextView() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.toggleTextView());
    },
    capturePage() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.capturePage());
    },
    onPrevPage() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.onPrevPage());
    },
    onNextPage() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.onNextPage());
    },
    goToPage(pageNum) {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.goToPage(pageNum));
    },
    zoom(delta) {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.zoom(delta));
    },
    toggleThumbnails() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.toggleThumbnails());
    },
    toggleFullscreen() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.toggleFullscreen());
    },
    close() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.close());
    },
    share() {
      return pdfStub._loadReal().then(({ pdf: real }) => real.viewer.share());
    }
  },
  _loaded: false,
  async _loadReal() {
    if (this._loaded && window.App.pdf && window.App.pdf !== this) return { pdf: window.App.pdf, annotationEngine: window.App.annotationEngine };
    try {
      const { pdf: realPdf, annotationEngine: realAnnotationEngine } = await import('./features/pdf-tools.js');
      realPdf.state = { ...pdfStub.state, ...realPdf.state };
      realAnnotationEngine.state = { ...annotationEngineStub.state, ...realAnnotationEngine.state };
      window.App.pdf = realPdf;
      window.App.annotationEngine = realAnnotationEngine;
      this._loaded = true;
      return { pdf: realPdf, annotationEngine: realAnnotationEngine };
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load PDF tools:', err);
      this._loaded = false;
      if (window.App?.ui?.showToast) {
        window.App.ui.showToast('PDF tools could not be loaded. Check network or reload.', { type: 'warning' });
      }
      throw err;
    }
  },
  init() {
    return this._loadReal().then(({ pdf: real }) => real.init());
  },
  triggerImport() {
    return this._loadReal().then(({ pdf: real }) => real.triggerImport());
  }
};

// ==========================================================================
// DROPBOX STUB & QUIZ STUB
// ==========================================================================
const dropboxStub = {
  isReady() {
    return !!window.App.state.isDropboxReady;
  },
  _loaded: false,
  async _loadReal() {
    if (this._loaded && window.App.dropbox && window.App.dropbox !== this) return window.App.dropbox;
    try {
      const { dropbox: realDropbox } = await import('./features/dropbox.js');
      window.App.dropbox = realDropbox;
      this._loaded = true;
      return realDropbox;
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load Dropbox:', err);
      this._loaded = false;
      throw err;
    }
  },
  init() {
    return this._loadReal().then(real => real.init());
  },
  syncChanges(force, articleId) {
    return this._loadReal().then(real => real.syncChanges(force, articleId));
  },
  connect() {
    return this._loadReal().then(real => real.connect());
  },
  disconnect() {
    return this._loadReal().then(real => real.disconnect());
  },
  handleRedirect() {
    return this._loadReal().then(real => real.handleRedirect());
  }
};

const quizStub = {
  stats: { lastScore: 0, bestScore: 0, totalScore: 0, totalQuizzes: 0, avgScore: 0 },
  session: {},
  _loaded: false,
  async _loadReal() {
    if (this._loaded && window.App.quiz && window.App.quiz !== this) return window.App.quiz;
    try {
      const { quiz: realQuiz } = await import('./features/quiz.js');
      realQuiz.stats = this.stats;
      realQuiz.session = this.session;
      window.App.quiz = realQuiz;
      this._loaded = true;
      return realQuiz;
    } catch (err) {
      console.error('[NoteKash] Failed to dynamically load Quiz module:', err);
      this._loaded = false;
      throw err;
    }
  },
  loadStats() {
    return this._loadReal().then(real => real.loadStats());
  },
  saveStats() {
    return this._loadReal().then(real => real.saveStats());
  },
  getStats() {
    return this.stats;
  },
  start(options) {
    this._loadReal().then(real => real.start(options));
  },
  calculateAndShowResults(cards) {
    this._loadReal().then(real => real.calculateAndShowResults(cards));
  },
  handleMcqAnswer(isUserCorrect, card) {
    return this._loadReal().then(real => real.handleMcqAnswer(isUserCorrect, card));
  },
  handleKeyboard(e) {
    this._loadReal().then(real => real.handleKeyboard(e));
  }
};

// ==========================================================================
// WIRE UP STUBS
// ==========================================================================
App.whiteboard = whiteboardStub;
App.mindMap = mindMapStub;
App.visualMap = visualMapStub;
App.audio = audioStub;
App.annotationEngine = annotationEngineStub;
App.pdf = pdfStub;
App.dropbox = dropboxStub;
App.quiz = quizStub;

// ==========================================================================
// INITIALIZE ON DOM LOAD
// ==========================================================================
const bootApp = () => {
  const handleResize = () => {
    const isMobile = window.innerWidth <= 612; // Optimized for maximum density before switching
    document.body.classList.toggle('mobile-view', isMobile);
  };
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial check

  if (App.splitScreen.handleSplitMode()) {
  }

  App.init();
  App.globalSearch.init();
  App.commandPalette.init();
  App.whiteboard.init();
  App.find.init();

  App.globalSearch._initCheckboxListener();

  if (App.ui.aiMagicModal) App.ui.aiMagicModal.init();

  // Initialize cursor splash
  window.cursorSplash = new InteractiveCursorSplash();

  // Listen to live hash changes to trigger the pricing/ascension modal
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#pricing') {
      if (window.App && App.ui && typeof App.ui.showAscensionModal === 'function') {
        App.ui.showAscensionModal();
      }
    }
  });
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

