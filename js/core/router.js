// ==========================================================================
// NoteKash - js/core/router.js
// Phase 4 Extraction: SPA Router (App.router)
//
// ZERO REGRESSION POLICY: This file is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// Depends on: App.splitScreen, App.ui, App.loadLibrary, App.events, App.state
// These are available on window.App at the time any method here is called.
// ==========================================================================

// --------------------------------------------------------------------------
// App.router — Single-Page Application Navigation Controller
//
// Manages browser history (pushState), view activation, D3 lazy-loading
// for map views, and delegates rendering to App.ui.renderView().
// --------------------------------------------------------------------------
export const router = {
    async navigateTo(viewId, data = null, isPopState = false) {
        // FLUSH IN-FLIGHT EDITS: Ensure dirty article edits in Write Mode are saved before unmounting DOM
        if (typeof window !== 'undefined' && window.App && App.state && App.state.isArticleDirty && App.state.currentMode === 'write' && App.events?.saveArticle) {
            try {
                await App.events.saveArticle({ force: true, isAutosave: true });
            } catch (e) {
                console.warn("Error flushing in-flight autosave on navigation:", e);
            }
        }

        const isPricingRequested = (typeof window !== 'undefined') ? window.location.hash === '#pricing' : false;

        if (typeof window !== 'undefined' && window.App && App.ui) {
            if (App.ui.showViewTransition) App.ui.showViewTransition();
            if (App.ui.startLoadingProgress) App.ui.startLoadingProgress();
        }

        // Check if we're running inside an iframe in split mode - skip split screen deactivation
        const isInSplitIframe = document.body.classList.contains('split-iframe-mode');

        // Deactivate split screen overlay when navigating normally (but NOT if we're inside an iframe)
        if (!isInSplitIframe && App.splitScreen && App.splitScreen.state.isActive) {
            App.splitScreen.deactivate();
        }

        document.getElementById('welcome-view')?.classList.remove('fading-out');

        // Remove previous view classes and add current view class
        const viewClasses = Array.from(document.body.classList).filter(c => c.startsWith('view-'));
        viewClasses.forEach(c => document.body.classList.remove(c));
        document.body.classList.add(`view-${viewId}`);

        document.body.classList.remove('canvas-focus-mode', 'mobile-header-expanded', 'article-active');
        if (viewId === 'article') {
            document.body.classList.add('article-active');
        }

        // Manage browser history for a functional back button.
        // Skip history changes when in split iframe mode to prevent affecting parent window
        if (!isPopState && !isInSplitIframe) {
            const currentState = history.state || {};
            // Prevent pushing the same page onto the history stack twice.
            if (currentState.viewId !== viewId || JSON.stringify(currentState.data) !== JSON.stringify(data)) {
                const url = `#${viewId}`;
                history.pushState({ viewId, data }, '', url);
            }
        }

        App.state.libraryRender.isRendering = false;
        clearTimeout(App.state.libraryRender.searchTimeout);
        App.events.unmountViewListeners();
        if (window.App?.audio?.cleanup) {
            try { window.App.audio.cleanup(); } catch (e) { console.warn("Audio cleanup error:", e); }
        }

        // --- AI MAGIC TOGGLE LOGIC ---
        const aiToggleViews = ['category', 'visual-map', 'mindmap'];
        const aiMagicToggle = document.getElementById('ai-magic-toggle');
        if (aiMagicToggle) {
            aiMagicToggle.style.display = aiToggleViews.includes(viewId) ? 'flex' : 'none';
        }
        if (App.ui.aiMagicModal.state.isOpen && App.ui.aiMagicModal.state.mode === 'viewer') {
            App.ui.aiMagicModal.closeViewer(); // Automatically close the viewer when navigating away
        }

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById(`${viewId}-view`);

        const mainEl = document.querySelector('main');
        const root = document.documentElement;
        const body = document.body;

        const isMap = viewId === 'visual-map' || viewId === 'mindmap';
        if (isMap) {
            if (typeof d3 === 'undefined') {
                const toastId = App.ui?.showToast ? App.ui.showToast('Loading maps visualization engine...', { type: 'info', duration: 0 }) : null;
                try {
                    await App.loadLibrary('d3');
                } catch (e) {
                    console.error('Failed to load d3:', e);
                    if (App.ui?.showToast) App.ui.showToast('Visual Maps failed to load. Returning to Library.', { type: 'warning' });
                    if (toastId && App.ui?.hideToast) App.ui.hideToast(toastId);
                    return this.navigateTo('library');
                } finally {
                    if (toastId && App.ui?.hideToast) App.ui.hideToast(toastId);
                }
            }
            if (typeof d3 === 'undefined') {
                if (App.ui?.showToast) App.ui.showToast('Visual Maps are not available offline. Returning to Library.', { type: 'warning' });
                return this.navigateTo('library');
            }
            if (mainEl) {
                mainEl.style.height = '100vh';
                mainEl.style.overflow = 'hidden';
            }
            root.style.overflow = 'hidden';
            body.style.overflow = 'hidden';
        } else {
            if (mainEl) {
                mainEl.style.height = '';
                mainEl.style.overflow = '';
            }
            root.style.overflow = '';
            body.style.overflow = '';
        }

        try {
            if (view) {
                await App.ui.renderView(viewId, data, view);
                view.classList.add('active');
            } else {
                console.warn(`View #${viewId}-view not found. Falling back to library.`);
                const libView = document.getElementById('library-view');
                if (libView) {
                    await App.ui.renderView('library', null, libView);
                    libView.classList.add('active');
                }
            }
        } catch (renderError) {
            console.error(`[NoteKash] Failed to render view '${viewId}':`, renderError);
            const fallbackView = document.getElementById('library-view') || document.getElementById('welcome-view');
            if (fallbackView) {
                fallbackView.classList.add('active');
            }
            if (App.ui?.showToast) {
                App.ui.showToast('Could not load view. Displaying library.', { type: 'warning' });
            }
        }

        const articleControls = document.getElementById('article-controls');
        if (articleControls) {
            articleControls.style.display = viewId === 'article' ? 'flex' : 'none';
        }

        if (viewId !== 'article' && App.ui?.updateTheLine) {
            App.ui.updateTheLine(1);
        }

        if (App.ui?.updateHeaderState) App.ui.updateHeaderState();
        if (App.ui?.pulseProfileBadge) App.ui.pulseProfileBadge(5000);
        if (App.events?.mountViewListeners) App.events.mountViewListeners(viewId);

        // Smoothly dismiss the transition overlay and progress bar on the next animation frame
        if (window.App && App.ui) {
            if (App.ui.stopLoadingProgress) App.ui.stopLoadingProgress();
            if (App.ui.hideViewTransition) {
                const requestFrame = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
                    ? window.requestAnimationFrame
                    : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => setTimeout(fn, 0));
                requestFrame(() => {
                    App.ui.hideViewTransition();
                });
            }
        }

        if (isPricingRequested) {
            setTimeout(() => {
                if (window.App && App.ui && typeof App.ui.showAscensionModal === 'function') {
                    App.ui.showAscensionModal();
                }
            }, 300);
        }
    },

    getActiveView: () => document.querySelector('.view.active')?.id.replace('-view', ''),
    getActiveViewData: () => history.state?.data || null, // <-- FIX #1: Added missing function
};
