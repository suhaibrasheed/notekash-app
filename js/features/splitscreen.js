export const splitScreen = {
    SESSION_KEY: 'notekash_splitscreen_session',

    state: {
        isActive: false,
        isSingleWindow: false,
        leftView: null,
        rightView: null,
        splitRatio: 50,
        hostContext: null,
        rightArticleId: null
    },

    supportedViews: ['library', 'flashcard', 'tags', 'stats-dashboard'],

    viewIcons: {
        library: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="M2 10l10-7 10 7"/></svg>',
        flashcard: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2v4"/><path d="M7 2v4"/><path d="M2 11h20"/></svg>',
        tags: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        'stats-dashboard': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3 v9 h9"/></svg>',
        article: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
    },

    viewNames: {
        library: 'Library',
        flashcard: 'Flashcards',
        tags: 'Tags',
        'stats-dashboard': 'Statistics',
        article: 'Article'
    },

    getOverlay() {
        let overlay = document.getElementById('split-screen-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'split-screen-overlay';
            document.body.appendChild(overlay);
        }
        return overlay;
    },

    getArticleDisplayName(articleId) {
        if (!articleId) return 'Article';
        const articles = App.state?.articles || App.state?.savedArticles || [];
        const art = articles.find(a => a.id === articleId);
        if (!art || !art.title) return 'Article';
        return art.title.length > 20 ? art.title.substring(0, 18) + '…' : art.title;
    },

    saveSession() {
        try {
            const leftIframe = document.querySelector('#split-panel-left iframe');
            const rightIframe = document.querySelector('#split-panel-right iframe');

            let leftArticleId = this.state.hostContext?.articleId || null;
            let leftMode = this.state.hostContext?.mode || 'read';
            let leftScrollTop = this.state.hostContext?.scrollTop || 0;

            if (leftIframe && leftIframe.contentWindow?.App) {
                const app = leftIframe.contentWindow.App;
                if (app.state?.activeArticleId) leftArticleId = app.state.activeArticleId;
                if (app.state?.currentMode) leftMode = app.state.currentMode;
                const mainEl = leftIframe.contentWindow.document?.querySelector('main');
                if (mainEl) leftScrollTop = mainEl.scrollTop;
            }

            let rightArticleId = this.state.rightArticleId || null;
            let rightMode = 'read';
            let rightScrollTop = 0;

            if (rightIframe && rightIframe.contentWindow?.App) {
                const app = rightIframe.contentWindow.App;
                if (app.state?.activeArticleId) rightArticleId = app.state.activeArticleId;
                if (app.state?.currentMode) rightMode = app.state.currentMode;
                const mainEl = rightIframe.contentWindow.document?.querySelector('main');
                if (mainEl) rightScrollTop = mainEl.scrollTop;
            }

            const sessionData = {
                version: 1,
                timestamp: Date.now(),
                isSingleWindow: !!this.state.isSingleWindow,
                splitRatio: this.state.splitRatio || 50,
                leftView: this.state.leftView || 'library',
                leftArticleId: leftArticleId,
                leftMode: leftMode,
                leftScrollTop: leftScrollTop,
                rightView: this.state.rightView || null,
                rightArticleId: rightArticleId,
                rightMode: rightMode,
                rightScrollTop: rightScrollTop
            };

            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        } catch (e) {
            console.warn('Could not save split screen session:', e);
        }
    },

    loadSession() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            return data && typeof data === 'object' ? data : null;
        } catch (e) {
            return null;
        }
    },

    toggle() {
        if (this.state.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    },

    activate() {
        this.state.isActive = true;
        const overlay = this.getOverlay();

        // WARM STANDBY CHECK: If split overlay already exists in DOM, reveal instantaneously in 0ms!
        if (overlay.querySelector('.split-panel')) {
            overlay.style.display = 'flex';
            overlay.classList.add('active');
            document.body.classList.add('split-screen-active');
            this.updateHeaderState();
            this.applyWindowMode();
            return;
        }

        // COLD START: Load from saved session or current active view
        const currentView = App.router?.getActiveView ? App.router.getActiveView() : 'library';
        const isArticle = currentView === 'article';
        const activeArticleId = App.state?.activeArticleId || null;
        const currentMode = App.state?.currentMode || 'read';
        const mainEl = document.querySelector('main');
        const scrollTop = mainEl ? mainEl.scrollTop : 0;

        // Flush dirty edits in Write Mode before splitting
        if (isArticle && App.state?.isArticleDirty && App.events?.saveArticle) {
            try {
                App.events.saveArticle({ force: true, isAutosave: true });
            } catch (e) {
                console.warn('Autosave flush before split screen warning:', e);
            }
        }

        // Check for saved session
        const saved = this.loadSession();
        if (saved) {
            this.state.isSingleWindow = !!saved.isSingleWindow;
            this.state.splitRatio = saved.splitRatio || 50;
            this.state.leftView = saved.leftView || (isArticle ? 'article' : 'library');
            this.state.hostContext = {
                view: saved.leftView,
                articleId: saved.leftArticleId || activeArticleId,
                mode: saved.leftMode || currentMode,
                scrollTop: saved.leftScrollTop || 0
            };
            this.state.rightView = saved.rightView || null;
            this.state.rightArticleId = saved.rightArticleId || null;
        } else {
            this.state.hostContext = {
                view: currentView || 'library',
                articleId: activeArticleId,
                mode: currentMode,
                scrollTop: scrollTop
            };
            this.state.leftView = isArticle && activeArticleId ? 'article' : (this.supportedViews.includes(currentView) ? currentView : 'library');
            this.state.rightView = null;
            this.state.rightArticleId = null;
        }

        document.body.classList.add('split-screen-active');
        this.updateHeaderState();
        this.render();
    },

    deactivate(options = {}) {
        this.state.isActive = false;

        // Persist session before closing
        this.saveSession();

        const overlay = this.getOverlay();
        overlay.classList.remove('active');

        if (options && options.destroy) {
            overlay.innerHTML = '';
            overlay.style.display = 'none';
        } else {
            // WARM STANDBY: Keep DOM alive in memory for instantaneous (0ms) re-opening!
            overlay.style.display = 'none';
        }

        document.body.classList.remove('split-screen-active');
        this.updateHeaderState();
    },

    toggleSingleWindow() {
        this.state.isSingleWindow = !this.state.isSingleWindow;
        this.applyWindowMode();
        this.saveSession();
    },

    applyWindowMode() {
        const overlay = this.getOverlay();
        const leftPanel = overlay.querySelector('#split-panel-left');
        const rightPanel = overlay.querySelector('#split-panel-right');
        const handle = overlay.querySelector('.split-resize-handle');

        if (!leftPanel || !rightPanel) return;

        if (this.state.isSingleWindow) {
            overlay.classList.add('single-window-mode');
            leftPanel.style.flex = '1 1 100%';
            if (handle) handle.style.display = 'none';
            rightPanel.style.display = 'none';
        } else {
            overlay.classList.remove('single-window-mode');
            if (handle) handle.style.display = '';
            rightPanel.style.display = '';
            this.applySplitRatio();
        }

        this.renderHeaders();
    },

    setPanelLoading(panelName, isLoading, text) {
        const panel = document.getElementById(panelName === 'left' ? 'split-panel-left' : 'split-panel-right');
        if (!panel) return;
        const loader = panel.querySelector('.split-panel-loader');
        if (!loader) return;

        if (isLoading) {
            if (text) {
                const textEl = loader.querySelector('.split-loader-text');
                if (textEl) textEl.textContent = text;
            }
            loader.classList.add('active');
        } else {
            loader.classList.remove('active');
        }
    },

    notifyIframeReady(win) {
        const leftIframe = document.querySelector('#split-panel-left iframe');
        const rightIframe = document.querySelector('#split-panel-right iframe');
        if (leftIframe && leftIframe.contentWindow === win) {
            if (this._panelResolvers?.left) this._panelResolvers.left();
            else this.setPanelLoading('left', false);
        } else if (rightIframe && rightIframe.contentWindow === win) {
            if (this._panelResolvers?.right) this._panelResolvers.right();
            else this.setPanelLoading('right', false);
        }
    },

    syncChildState(win) {
        try {
            const leftIframe = document.querySelector('#split-panel-left iframe');
            const rightIframe = document.querySelector('#split-panel-right iframe');
            if (leftIframe && leftIframe.contentWindow === win) {
                const childApp = win.App;
                const view = childApp?.router?.getActiveView ? childApp.router.getActiveView() : null;
                if (view) {
                    this.state.leftView = view;
                    if (view === 'article' && childApp.state?.activeArticleId) {
                        if (!this.state.hostContext) this.state.hostContext = {};
                        this.state.hostContext.view = 'article';
                        this.state.hostContext.articleId = childApp.state.activeArticleId;
                        this.state.hostContext.mode = childApp.state.currentMode || 'read';
                    }
                    this.renderHeaders();
                    this.saveSession();
                }
            } else if (rightIframe && rightIframe.contentWindow === win) {
                const childApp = win.App;
                const view = childApp?.router?.getActiveView ? childApp.router.getActiveView() : null;
                if (view) {
                    this.state.rightView = view;
                    if (view === 'article' && childApp.state?.activeArticleId) {
                        this.state.rightArticleId = childApp.state.activeArticleId;
                    }
                    this.renderHeaders();
                    this.saveSession();
                }
            }
        } catch (e) {
            console.warn('Could not sync child state in split screen:', e);
        }
    },

    setIframeSrc(panelName, targetSrc, loadingText = 'Loading...') {
        const panel = document.getElementById(panelName === 'left' ? 'split-panel-left' : 'split-panel-right');
        if (!panel) return;
        const content = panel.querySelector('.split-panel-content');
        if (!content) return;

        let iframe = content.querySelector('iframe');
        let loader = content.querySelector('.split-panel-loader');

        if (!iframe) {
            content.innerHTML = `
                <iframe title="${panelName === 'left' ? 'Left' : 'Right'} Panel"></iframe>
                <div class="split-panel-loader active" id="split-loader-${panelName}">
                    <div class="split-loader-card">
                        <div class="split-loader-spinner"></div>
                        <div class="split-loader-text">${loadingText}</div>
                    </div>
                </div>
            `;
            iframe = content.querySelector('iframe');
            loader = content.querySelector('.split-panel-loader');
        } else if (!loader) {
            const loaderEl = document.createElement('div');
            loaderEl.className = 'split-panel-loader active';
            loaderEl.id = `split-loader-${panelName}`;
            loaderEl.innerHTML = `
                <div class="split-loader-card">
                    <div class="split-loader-spinner"></div>
                    <div class="split-loader-text">${loadingText}</div>
                </div>
            `;
            content.appendChild(loaderEl);
            loader = loaderEl;
        }

        this.setPanelLoading(panelName, true, loadingText);

        let isDone = false;
        const prevWin = iframe.contentWindow;
        let hasNavigated = false;

        const finish = () => {
            if (isDone) return;
            isDone = true;
            if (pollReady) clearInterval(pollReady);
            setTimeout(() => {
                this.setPanelLoading(panelName, false);
            }, 80);
        };

        this._panelResolvers = this._panelResolvers || {};
        this._panelResolvers[panelName] = finish;

        iframe.addEventListener('load', () => {
            hasNavigated = true;
        }, { once: true });

        // Active Watchdog: Wait for iframe navigation to start and target view to paint
        let pollCount = 0;
        const pollReady = setInterval(() => {
            pollCount++;
            if (isDone) {
                clearInterval(pollReady);
                return;
            }

            // If we are still looking at the previous window before navigation, do not prematurely resolve
            if (prevWin && iframe.contentWindow === prevWin && !hasNavigated) {
                if (pollCount >= 105) finish();
                return;
            }

            try {
                const childWin = iframe.contentWindow;
                const childDoc = childWin?.document;
                const activeView = childDoc?.querySelector('.view.active');
                if (activeView && childWin?.App?.router?.getActiveView) {
                    finish();
                    return;
                }
            } catch (e) {}

            // Safety timeout after ~3.2s
            if (pollCount >= 105) {
                finish();
            }
        }, 30);

        iframe.src = targetSrc;
    },

    async createNewNoteInPanel(panelName) {
        try {
            if (App.license && !App.license.isPremium() && App.state?.articles && App.config?.sparkTierLimit && App.state.articles.length >= App.config.sparkTierLimit) {
                if (App.ui?.showAscensionModal) App.ui.showAscensionModal('limit');
                if (App.ui?.showToast) App.ui.showToast('Note limit reached. Go Premium for unlimited notes.', 'warning');
                this.renderHeaders();
                return;
            }

            const defaultCategory = (App.settings?.get('userCategories')?.find(c => c.isDefault) || { name: 'General' }).name;
            const newArticleData = {
                id: 'note_' + Date.now(),
                title: 'Untitled Note',
                content: '<p><br></p>',
                category: defaultCategory,
                readCount: 0,
                readHistory: [],
                tags: [],
                flashcards: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            let newArticle = null;
            if (App.storage?.createArticle) {
                newArticle = await App.storage.createArticle(newArticleData);
            } else {
                newArticle = newArticleData;
                if (!App.state.articles) App.state.articles = [];
                App.state.articles.unshift(newArticle);
            }

            const articleId = newArticle?.id || newArticleData.id;

            if (panelName === 'left') {
                this.state.leftView = 'article';
                this.state.hostContext = {
                    view: 'article',
                    articleId: articleId,
                    mode: 'write',
                    scrollTop: 0
                };
                const targetUrl = this.getIframeSrc('article', true);
                this.setIframeSrc('left', targetUrl, 'Opening New Note...');
            } else {
                this.state.rightView = 'article';
                this.state.rightArticleId = articleId;
                const targetUrl = this.getIframeSrc('article', false);
                this.setIframeSrc('right', targetUrl, 'Opening New Note...');
            }

            this.renderHeaders();
            this.saveSession();

            if (App.ui?.showToast) {
                App.ui.showToast('📝 New note opened for editing!', { type: 'success' });
            }
        } catch (err) {
            console.error('Error creating new note in split panel:', err);
            if (App.ui?.showToast) {
                App.ui.showToast('Could not create new note', { type: 'error' });
            }
            this.renderHeaders();
        }
    },

    renderSelector(panelName, content) {
        if (!content) {
            const panel = document.getElementById(panelName === 'left' ? 'split-panel-left' : 'split-panel-right');
            content = panel?.querySelector('.split-panel-content');
        }
        if (!content) return;

        content.innerHTML = `
            <div class="split-panel-loader" id="split-loader-${panelName}">
                <div class="split-loader-card">
                    <div class="split-loader-spinner"></div>
                    <div class="split-loader-text">Loading...</div>
                </div>
            </div>
            <div class="split-view-selector">
                <h2>Split Panel</h2>
                <p>Search articles or select a view</p>
                <div class="split-search-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="split-search-input" id="split-search-input-${panelName}" placeholder="Search articles..." oninput="App.splitScreen.handleSearch(this.value, '${panelName}')">
                    <div class="split-search-results" id="split-search-results-${panelName}"></div>
                </div>
                <div class="split-view-grid">
                    ${this.supportedViews.map(v => `
                        <div class="split-view-option" onclick="App.splitScreen.change${panelName === 'left' ? 'Left' : 'Right'}View('${v}')">
                            ${this.viewIcons[v]}
                            <span>${this.viewNames[v]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderRightSelector(rightContent) {
        this.renderSelector('right', rightContent);
    },

    async swapViews() {
        if (App.ui?.showToast) {
            App.ui.showToast('Wait doing Swap...', { type: 'info', duration: 1200 });
        }

        // Live state snapshots from both iframes
        let leftSnapshot = {
            view: this.state.leftView || 'library',
            articleId: this.state.hostContext?.articleId || null,
            mode: this.state.hostContext?.mode || 'read',
            scrollTop: this.state.hostContext?.scrollTop || 0
        };

        let rightSnapshot = {
            view: this.state.rightView || null,
            articleId: this.state.rightArticleId || null,
            mode: 'read',
            scrollTop: 0
        };

        try {
            const leftIframe = document.querySelector('#split-panel-left iframe');
            if (leftIframe && leftIframe.contentWindow?.App) {
                const app = leftIframe.contentWindow.App;
                const view = app.router?.getActiveView ? app.router.getActiveView() : leftSnapshot.view;
                if (view) leftSnapshot.view = view;
                if (view === 'article' && app.state?.activeArticleId) {
                    leftSnapshot.articleId = app.state.activeArticleId;
                    leftSnapshot.mode = app.state.currentMode || 'read';
                    const mainEl = leftIframe.contentWindow.document?.querySelector('main');
                    if (mainEl) leftSnapshot.scrollTop = mainEl.scrollTop;
                }
            }

            const rightIframe = document.querySelector('#split-panel-right iframe');
            if (rightIframe && rightIframe.contentWindow?.App) {
                const app = rightIframe.contentWindow.App;
                const view = app.router?.getActiveView ? app.router.getActiveView() : rightSnapshot.view;
                if (view) rightSnapshot.view = view;
                if (view === 'article' && app.state?.activeArticleId) {
                    rightSnapshot.articleId = app.state.activeArticleId;
                    rightSnapshot.mode = app.state.currentMode || 'read';
                    const mainEl = rightIframe.contentWindow.document?.querySelector('main');
                    if (mainEl) rightSnapshot.scrollTop = mainEl.scrollTop;
                }
            }
        } catch (e) {
            console.warn('Could not inspect iframes during swap:', e);
        }

        // Swap target states
        const newLeftView = rightSnapshot.view || 'library';
        const newLeftArticleId = rightSnapshot.articleId;
        const newLeftMode = rightSnapshot.mode || 'read';
        const newLeftScrollTop = rightSnapshot.scrollTop || 0;

        const newRightView = leftSnapshot.view;
        const newRightArticleId = leftSnapshot.articleId;
        const newRightMode = leftSnapshot.mode || 'read';
        const newRightScrollTop = leftSnapshot.scrollTop || 0;

        this.state.leftView = newLeftView;
        this.state.hostContext = {
            view: newLeftView,
            articleId: newLeftArticleId,
            mode: newLeftMode,
            scrollTop: newLeftScrollTop
        };

        this.state.rightView = newRightView;
        this.state.rightArticleId = newRightArticleId;

        // Update Left Iframe with smooth ambient panel loader
        this.setIframeSrc('left', this.getIframeSrc(newLeftView, true), 'Swapping to Left...');

        // Update Right Iframe / Selector with smooth ambient panel loader
        const rightPanel = document.querySelector('#split-panel-right');
        if (rightPanel) {
            const rightContent = rightPanel.querySelector('.split-panel-content');
            if (newRightView) {
                this.setIframeSrc('right', this.getIframeSrc(newRightView, false), 'Swapping to Right...');
            } else if (rightContent) {
                this.renderRightSelector(rightContent);
            }
        }

        this.renderHeaders();
        this.saveSession();
    },

    async openScratchpad() {
        try {
            let scratchArticle = (App.state?.articles || []).find(a => a.id === 'nk_scratchpad' || a.title?.includes('Quick Scratchpad'));

            if (!scratchArticle) {
                const defaultCategory = (App.settings?.get('userCategories')?.find(c => c.isDefault) || { name: 'General' }).name;
                const newArticleData = {
                    id: 'scratch_' + Date.now(),
                    title: '⚡ Quick Scratchpad',
                    content: '<p>Jot down quick thoughts, references, or key takeaways...</p>',
                    category: defaultCategory,
                    readCount: 0,
                    readHistory: [],
                    tags: ['scratchpad'],
                    flashcards: {},
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                if (App.storage?.createArticle) {
                    scratchArticle = await App.storage.createArticle(newArticleData);
                } else {
                    scratchArticle = newArticleData;
                    if (!App.state.articles) App.state.articles = [];
                    App.state.articles.unshift(scratchArticle);
                }
            }

            if (this.state.isSingleWindow) {
                this.state.isSingleWindow = false;
            }

            const targetId = scratchArticle?.id || 'nk_scratchpad';
            this.openArticleInSplit(targetId, 'write');

            if (App.ui?.showToast) {
                App.ui.showToast('📝 Scratchpad note ready!', { type: 'success' });
            }
        } catch (err) {
            console.error('Error creating scratchpad:', err);
            if (App.ui?.showToast) {
                App.ui.showToast('Could not create scratchpad note', { type: 'error' });
            }
        }
    },

    ensureStructure() {
        const overlay = this.getOverlay();
        if (!overlay.querySelector('.split-panel')) {
            overlay.innerHTML = '';
            overlay.classList.add('active');

            // Left panel wrapper with ambient loader (active initially)
            const leftPanel = document.createElement('div');
            leftPanel.className = 'split-panel';
            leftPanel.id = 'split-panel-left';
            leftPanel.style.flex = `0 0 ${this.state.splitRatio}%`;
            leftPanel.innerHTML = `
                <div class="split-panel-header"></div>
                <div class="split-panel-content">
                    <iframe title="Left Panel"></iframe>
                    <div class="split-panel-loader active" id="split-loader-left">
                        <div class="split-loader-card">
                            <div class="split-loader-spinner"></div>
                            <div class="split-loader-text">Loading Left Panel...</div>
                        </div>
                    </div>
                </div>
            `;

            // Resize handle with double-click reset
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'split-resize-handle';
            resizeHandle.title = 'Drag to resize, double-click to reset 50/50';
            resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
            resizeHandle.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });
            resizeHandle.addEventListener('dblclick', () => {
                this.state.splitRatio = 50;
                this.applySplitRatio();
                this.saveSession();
            });

            // Right panel wrapper with ambient loader
            const rightPanel = document.createElement('div');
            rightPanel.className = 'split-panel';
            rightPanel.id = 'split-panel-right';
            rightPanel.style.flex = `0 0 ${100 - this.state.splitRatio - 1}%`;
            rightPanel.innerHTML = `
                <div class="split-panel-header"></div>
                <div class="split-panel-content">
                    <div class="split-panel-loader" id="split-loader-right">
                        <div class="split-loader-card">
                            <div class="split-loader-spinner"></div>
                            <div class="split-loader-text">Loading Right Panel...</div>
                        </div>
                    </div>
                </div>
            `;

            overlay.appendChild(leftPanel);
            overlay.appendChild(resizeHandle);
            overlay.appendChild(rightPanel);
        }
    },

    renderHeaders() {
        const overlay = this.getOverlay();
        const leftHeader = overlay.querySelector('#split-panel-left .split-panel-header');
        const rightHeader = overlay.querySelector('#split-panel-right .split-panel-header');

        // Render Left Header
        if (leftHeader) {
            const isLeftHomepage = !this.state.leftView || this.state.leftView === 'homepage';
            const isLeftArticle = !isLeftHomepage && this.state.leftView === 'article';

            leftHeader.innerHTML = `
                <select onmousedown="if (this.value) this.dataset.prevVal = this.value; this.value = '';"
                        ontouchstart="if (this.value) this.dataset.prevVal = this.value; this.value = '';"
                        onkeydown="if (event.key === ' ' || event.key === 'Enter') { if (this.value) this.dataset.prevVal = this.value; this.value = ''; }"
                        onchange="App.splitScreen.changeLeftView(this.value)"
                        onblur="if (!this.value) this.value = this.dataset.prevVal || '${isLeftHomepage ? 'homepage' : (isLeftArticle ? 'new-note' : (this.state.leftView || 'library'))}';">
                    <option value="homepage" ${isLeftHomepage ? 'selected' : ''}>Homepage</option>
                    <option value="new-note" ${isLeftArticle ? 'selected' : ''}>New Note</option>
                    <option value="library" ${!isLeftArticle && !isLeftHomepage && this.state.leftView === 'library' ? 'selected' : ''}>Library</option>
                    <option value="flashcard" ${!isLeftArticle && !isLeftHomepage && this.state.leftView === 'flashcard' ? 'selected' : ''}>Flashcards</option>
                    <option value="tags" ${!isLeftArticle && !isLeftHomepage && this.state.leftView === 'tags' ? 'selected' : ''}>Tags</option>
                    <option value="stats-dashboard" ${!isLeftArticle && !isLeftHomepage && this.state.leftView === 'stats-dashboard' ? 'selected' : ''}>Statistics</option>
                </select>
                ${this.state.isSingleWindow ? `
                <div class="split-panel-actions">
                    <button class="split-action-btn" onclick="App.splitScreen.toggleSingleWindow()" title="Split into 2 Panels">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>
                    </button>
                    <button class="split-close-btn" onclick="App.splitScreen.deactivate()" title="Minimize Split Screen (0ms Reopen)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>` : ''}
            `;
        }

        // Render Right Header
        if (rightHeader) {
            const isRightHomepage = !this.state.rightView || this.state.rightView === 'homepage';
            const isRightArticle = !isRightHomepage && this.state.rightView === 'article';

            rightHeader.innerHTML = `
                 <select onmousedown="if (this.value) this.dataset.prevVal = this.value; this.value = '';"
                         ontouchstart="if (this.value) this.dataset.prevVal = this.value; this.value = '';"
                         onkeydown="if (event.key === ' ' || event.key === 'Enter') { if (this.value) this.dataset.prevVal = this.value; this.value = ''; }"
                         onchange="App.splitScreen.changeRightView(this.value)"
                         onblur="if (!this.value) this.value = this.dataset.prevVal || '${isRightHomepage ? 'homepage' : (isRightArticle ? 'new-note' : (this.state.rightView || 'library'))}';">
                    <option value="homepage" ${isRightHomepage ? 'selected' : ''}>Homepage</option>
                    <option value="new-note" ${isRightArticle ? 'selected' : ''}>New Note</option>
                    <option value="library" ${!isRightArticle && !isRightHomepage && this.state.rightView === 'library' ? 'selected' : ''}>Library</option>
                    <option value="flashcard" ${!isRightArticle && !isRightHomepage && this.state.rightView === 'flashcard' ? 'selected' : ''}>Flashcards</option>
                    <option value="tags" ${!isRightArticle && !isRightHomepage && this.state.rightView === 'tags' ? 'selected' : ''}>Tags</option>
                    <option value="stats-dashboard" ${!isRightArticle && !isRightHomepage && this.state.rightView === 'stats-dashboard' ? 'selected' : ''}>Statistics</option>
                </select>
                <div class="split-panel-actions">
                    <button class="split-action-btn" onclick="App.splitScreen.swapViews()" title="Swap Panels">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
                    </button>
                    <button class="split-action-btn" onclick="App.splitScreen.toggleSingleWindow()" title="Single Window Mode">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </button>
                    <button class="split-close-btn" onclick="App.splitScreen.deactivate()" title="Minimize Split Screen (0ms Reopen)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            `;
        }
    },

    render() {
        this.ensureStructure();
        const overlay = this.getOverlay();
        if (!overlay.classList.contains('active')) overlay.classList.add('active');

        this.renderHeaders();

        // Update Left Panel Content
        const leftPanel = overlay.querySelector('#split-panel-left');
        const leftContent = leftPanel ? leftPanel.querySelector('.split-panel-content') : null;
        if (leftContent) {
            if (this.state.leftView === 'homepage') {
                if (!leftContent.querySelector('.split-view-selector')) {
                    this.renderSelector('left', leftContent);
                }
            } else {
                const targetLeftSrc = this.getIframeSrc(this.state.leftView || 'library', true);
                const leftIframe = leftContent.querySelector('iframe');
                if (!leftIframe || leftIframe.getAttribute('src') !== targetLeftSrc) {
                    const leftName = this.state.leftView === 'article'
                        ? this.getArticleDisplayName(this.state.hostContext?.articleId)
                        : (this.viewNames[this.state.leftView] || 'View');
                    this.setIframeSrc('left', targetLeftSrc, `Loading ${leftName}...`);
                }
            }
        }

        // Update Right Panel Content
        const rightPanel = overlay.querySelector('#split-panel-right');
        const rightContent = rightPanel ? rightPanel.querySelector('.split-panel-content') : null;

        if (rightContent) {
            if (this.state.rightView && this.state.rightView !== 'homepage') {
                const targetRightSrc = this.getIframeSrc(this.state.rightView, false);
                const rightIframe = rightContent.querySelector('iframe');
                if (!rightIframe || rightIframe.getAttribute('src') !== targetRightSrc) {
                    const rightName = this.state.rightView === 'article'
                        ? this.getArticleDisplayName(this.state.rightArticleId)
                        : (this.viewNames[this.state.rightView] || 'View');
                    this.setIframeSrc('right', targetRightSrc, `Loading ${rightName}...`);
                }
            } else {
                if (!rightContent.querySelector('.split-view-selector')) {
                    this.renderSelector('right', rightContent);
                }
            }
        }

        this.applyWindowMode();
    },

    getIframeSrc(viewId, isLeftPanel = false) {
        const currentUrl = new URL(window.location.origin + window.location.pathname);
        currentUrl.searchParams.set('splitView', viewId);
        currentUrl.searchParams.set('splitMode', 'iframe');

        if (viewId === 'article') {
            const articleId = isLeftPanel ? this.state.hostContext?.articleId : (this.state.rightArticleId || this.state.hostContext?.articleId);
            const mode = isLeftPanel ? (this.state.hostContext?.mode || 'read') : (this.state.rightArticleId ? 'write' : 'read');
            const scrollTop = isLeftPanel ? (this.state.hostContext?.scrollTop || 0) : 0;

            if (articleId) {
                currentUrl.searchParams.set('id', articleId);
                currentUrl.searchParams.set('mode', mode);
                if (scrollTop > 0) {
                    currentUrl.searchParams.set('scrollTop', String(Math.round(scrollTop)));
                }
            }
        }
        return currentUrl.toString();
    },

    changeLeftView(viewId) {
        if (viewId === 'homepage') {
            this.state.leftView = 'homepage';
            this.renderSelector('left');
            this.renderHeaders();
            this.saveSession();
            return;
        }
        if (viewId === 'new-note') {
            this.createNewNoteInPanel('left');
            return;
        }
        this.state.leftView = viewId;
        const targetSrc = this.getIframeSrc(viewId, true);
        const viewName = viewId === 'article'
            ? this.getArticleDisplayName(this.state.hostContext?.articleId)
            : (this.viewNames[viewId] || 'View');
        this.setIframeSrc('left', targetSrc, `Loading ${viewName}...`);
        this.renderHeaders();
        this.saveSession();
    },

    changeRightView(viewId) {
        if (viewId === 'homepage') {
            this.state.rightView = 'homepage';
            this.state.rightArticleId = null;
            this.renderSelector('right');
            this.renderHeaders();
            this.saveSession();
            return;
        }
        if (viewId === 'new-note') {
            this.createNewNoteInPanel('right');
            return;
        }
        this.state.rightView = viewId;
        if (viewId !== 'article') {
            this.state.rightArticleId = null;
        }
        const targetSrc = this.getIframeSrc(viewId, false);
        const viewName = viewId === 'article'
            ? this.getArticleDisplayName(this.state.rightArticleId)
            : (this.viewNames[viewId] || 'View');
        this.setIframeSrc('right', targetSrc, `Loading ${viewName}...`);
        this.renderHeaders();
        this.saveSession();
    },

    setRightView(viewId) {
        this.state.rightView = viewId;
        if (viewId !== 'article') {
            this.state.rightArticleId = null;
        }
        const targetSrc = this.getIframeSrc(viewId, false);
        const viewName = this.viewNames[viewId] || 'View';
        this.setIframeSrc('right', targetSrc, `Loading ${viewName}...`);
        this.renderHeaders();
        this.saveSession();
    },

    startResize(e) {
        if (this.state.isSingleWindow) return;
        e.preventDefault();
        const handle = e.target.closest('.split-resize-handle');
        if (!handle) return;
        handle.classList.add('dragging');

        // Matches responsive breakpoint at 612px
        const isMobile = window.innerWidth <= 612;
        const overlay = this.getOverlay();
        const startPos = isMobile ? (e.touches?.[0]?.clientY || e.clientY) : (e.touches?.[0]?.clientX || e.clientX);
        const overlayRect = overlay.getBoundingClientRect();
        const totalSize = isMobile ? overlayRect.height : overlayRect.width;
        const startRatio = this.state.splitRatio;

        // Disable iframe pointer events during resize
        document.querySelectorAll('#split-screen-overlay iframe').forEach(f => f.style.pointerEvents = 'none');

        const onMove = (moveEvent) => {
            const currentPos = isMobile
                ? (moveEvent.touches?.[0]?.clientY || moveEvent.clientY)
                : (moveEvent.touches?.[0]?.clientX || moveEvent.clientX);
            const delta = currentPos - startPos;
            const deltaPercent = (delta / totalSize) * 100;
            this.state.splitRatio = Math.max(25, Math.min(75, startRatio + deltaPercent));
            this.applySplitRatio();
        };

        const onEnd = () => {
            handle.classList.remove('dragging');
            document.querySelectorAll('#split-screen-overlay iframe').forEach(f => f.style.pointerEvents = '');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            this.saveSession();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    },

    applySplitRatio() {
        if (this.state.isSingleWindow) return;
        const leftPanel = document.getElementById('split-panel-left');
        const rightPanel = document.getElementById('split-panel-right');
        if (leftPanel && rightPanel) {
            leftPanel.style.flex = `0 0 ${this.state.splitRatio}%`;
            rightPanel.style.flex = `0 0 ${100 - this.state.splitRatio - 1}%`;
        }
    },

    updateHeaderState() {
        const btn = document.getElementById('split-screen-btn');
        if (btn) {
            btn.classList.toggle('split-active', this.state.isActive);
        }
    },

    handleSplitMode() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('splitMode') === 'iframe') {
            App.isSplitIframeMode = true;
            document.body.classList.add('split-iframe-mode');

            // Synchronously eradicate shell loader in split iframe mode
            const loader = document.getElementById('nk-shell-loader');
            if (loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }

            const viewId = params.get('splitView');
            const articleId = params.get('id');
            const mode = params.get('mode') || 'read';
            const scrollTopStr = params.get('scrollTop');
            const restoredScrollTop = scrollTopStr ? parseInt(scrollTopStr, 10) : undefined;

            // Global shortcut listeners inside iframe forwarded to parent window
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    try {
                        if (window.parent && window.parent.App?.splitScreen?.state?.isActive) {
                            window.parent.App.splitScreen.deactivate();
                            e.preventDefault();
                        }
                    } catch (err) {
                        console.warn('Could not forward Escape key to parent:', err);
                    }
                }
                if (e.altKey && e.key.toLowerCase() === 's') {
                    try {
                        if (window.parent && window.parent.App?.splitScreen) {
                            window.parent.App.splitScreen.toggle();
                            e.preventDefault();
                        }
                    } catch (err) {}
                }
            });

            // Fast-path initialization: check when state is ready
            let attempts = 0;
            const checkReady = setInterval(() => {
                attempts++;
                const isReady = App.state &&
                    (App.state.isInitialLoadComplete || App.state.isDataFullyLoaded || (App.state.articles && App.state.settings)) &&
                    App.router &&
                    App.ui;

                if (isReady || attempts >= 80) {
                    clearInterval(checkReady);

                    if (viewId === 'flashcard') {
                        if (!App.state?.settings?.flashcardCategory && App.state?.settings) {
                            App.state.settings.flashcardCategory = 'All';
                        }
                    }

                    const navPromise = (viewId === 'article' && articleId)
                        ? App.router?.navigateTo('article', { 
                            id: articleId, 
                            mode: mode, 
                            restoredScrollTop: restoredScrollTop 
                        })
                        : (viewId && this.supportedViews.includes(viewId))
                            ? App.router?.navigateTo(viewId)
                            : App.router?.navigateTo('library');

                    Promise.resolve(navPromise).then(() => {
                        const signalReady = () => {
                            try {
                                if (window.parent && window.parent !== window && window.parent.App?.splitScreen?.notifyIframeReady) {
                                    window.parent.App.splitScreen.notifyIframeReady(window);
                                }
                            } catch (e) {}
                        };
                        if (typeof requestAnimationFrame === 'function') {
                            requestAnimationFrame(() => setTimeout(signalReady, 40));
                        } else {
                            setTimeout(signalReady, 60);
                        }
                    });
                }
            }, 25);
            return true;
        }
        return false;
    },

    handleSearch(query, panelName = 'right') {
        const resultsContainer = document.getElementById(`split-search-results-${panelName}`) || document.getElementById('split-search-results');
        if (!resultsContainer) return;

        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const articles = App.state?.articles || App.state?.savedArticles || [];
        if (!articles.length) {
            resultsContainer.innerHTML = `<div class="split-search-empty">No articles found</div>`;
            return;
        }

        const fuse = App.offline.safeFuse(articles, {
            keys: ['title', 'plainText', 'content'],
            threshold: 0.4,
            includeScore: true
        });

        const results = fuse.search(query).slice(0, 8);

        if (results.length === 0) {
            resultsContainer.innerHTML = `<div class="split-search-empty">No matching articles</div>`;
            return;
        }

        resultsContainer.innerHTML = results.map(r => {
            const article = r.item;
            const title = (article.title || 'Untitled').substring(0, 50);
            const preview = (article.plainText || article.content || '').replace(/<[^>]*>/g, '').substring(0, 60);

            return `
                <div class="split-search-item" onclick="App.splitScreen.openArticleInPanel('${panelName}', '${article.id}')">
                    <div class="split-search-text">
                        <strong>${title}</strong>
                        <small>${preview}...</small>
                    </div>
                </div>
            `;
        }).join('');
    },

    openArticleInPanel(panelName, articleId, mode = 'read') {
        const panel = document.getElementById(panelName === 'left' ? 'split-panel-left' : 'split-panel-right');
        if (!panel) return;

        if (panelName === 'left') {
            this.state.leftView = 'article';
            this.state.hostContext = {
                view: 'article',
                articleId: articleId,
                mode: mode,
                scrollTop: 0
            };
            const currentUrl = this.getIframeSrc('article', true);
            const articleName = this.getArticleDisplayName(articleId);
            this.setIframeSrc('left', currentUrl, `Loading ${articleName}...`);
        } else {
            this.state.rightView = 'article';
            this.state.rightArticleId = articleId;
            const currentUrl = this.getIframeSrc('article', false);
            const articleName = this.getArticleDisplayName(articleId);
            this.setIframeSrc('right', currentUrl, `Loading ${articleName}...`);
        }

        this.renderHeaders();
        this.saveSession();
    },

    openArticleInSplit(articleId, mode = 'read') {
        this.openArticleInPanel('right', articleId, mode);
    }
};
