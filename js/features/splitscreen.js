export const splitScreen = {
                state: {
                    isActive: false,
                    leftView: null,
                    rightView: null,
                    splitRatio: 50
                },

                supportedViews: ['library', 'flashcard', 'tags', 'stats-dashboard'],

                viewIcons: {
                    library: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10"/><path d="M2 10l10-7 10 7"/></svg>',
                    flashcard: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2v4"/><path d="M7 2v4"/><path d="M2 11h20"/></svg>',
                    tags: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
                    'stats-dashboard': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3 v9 h9"/></svg>'
                },

                viewNames: {
                    library: 'Library',
                    flashcard: 'Flashcards',
                    tags: 'Tags',
                    'stats-dashboard': 'Statistics'
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

                toggle() {
                    if (this.state.isActive) {
                        this.deactivate();
                    } else {
                        this.activate();
                    }
                },

                activate() {
                    const currentView = App.router.getActiveView();

                    if (!this.supportedViews.includes(currentView)) {
                        App.ui.showToast('Split screen works best from home', 'info');
                    }

                    this.state.isActive = true;
                    this.state.leftView = this.supportedViews.includes(currentView) ? currentView : 'library';
                    this.state.rightView = null;

                    document.body.classList.add('split-screen-active');
                    this.updateHeaderState();
                    this.render();
                },

                deactivate() {
                    this.state.isActive = false;
                    const overlay = this.getOverlay();
                    overlay.classList.remove('active');
                    overlay.innerHTML = '';
                    document.body.classList.remove('split-screen-active');
                    this.updateHeaderState();
                },

                ensureStructure() {
                    const overlay = this.getOverlay();
                    if (!overlay.querySelector('.split-panel')) {
                        overlay.innerHTML = '';
                        overlay.classList.add('active');

                        // Create left panel wrapper
                        const leftPanel = document.createElement('div');
                        leftPanel.className = 'split-panel';
                        leftPanel.id = 'split-panel-left';
                        leftPanel.style.flex = `0 0 ${this.state.splitRatio}%`;
                        leftPanel.innerHTML = `
                            <div class="split-panel-header">
                                <select onchange="App.splitScreen.changeLeftView(this.value)"></select>
                            </div>
                            <div class="split-panel-content">
                                <iframe title="Left Panel"></iframe>
                            </div>
                        `;

                        // Create resize handle
                        const resizeHandle = document.createElement('div');
                        resizeHandle.className = 'split-resize-handle';
                        resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
                        resizeHandle.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });

                        // Create right panel wrapper
                        const rightPanel = document.createElement('div');
                        rightPanel.className = 'split-panel';
                        rightPanel.id = 'split-panel-right';
                        rightPanel.style.flex = `0 0 ${100 - this.state.splitRatio - 1}%`;
                        rightPanel.innerHTML = `
                            <div class="split-panel-header"></div>
                            <div class="split-panel-content"></div>
                        `;

                        overlay.appendChild(leftPanel);
                        overlay.appendChild(resizeHandle);
                        overlay.appendChild(rightPanel);
                    }
                },

                render() {
                    this.ensureStructure();
                    const overlay = this.getOverlay();
                    if (!overlay.classList.contains('active')) overlay.classList.add('active');

                    // Update Left Panel
                    const leftSelect = overlay.querySelector('#split-panel-left select');
                    if (leftSelect) {
                        if (leftSelect.options.length !== this.supportedViews.length) {
                            leftSelect.innerHTML = this.supportedViews.map(v => `<option value="${v}">${this.viewNames[v]}</option>`).join('');
                        }
                        leftSelect.value = this.state.leftView;
                    }

                    const leftIframe = overlay.querySelector('#split-panel-left iframe');
                    if (leftIframe) {
                        const targetSrc = this.getIframeSrc(this.state.leftView);
                        if (leftIframe.getAttribute('src') !== targetSrc) {
                            leftIframe.src = targetSrc;
                        }
                    }


                    // Update Right Panel
                    const rightPanel = overlay.querySelector('#split-panel-right');
                    const rightHeader = rightPanel.querySelector('.split-panel-header');
                    const rightContent = rightPanel.querySelector('.split-panel-content');

                    if (this.state.rightView) {
                        rightHeader.innerHTML = `
                             <select onchange="App.splitScreen.changeRightView(this.value)">
                                ${this.supportedViews.map(v => `<option value="${v}" ${v === this.state.rightView ? 'selected' : ''}>${this.viewNames[v]}</option>`).join('')}
                            </select>
                            <button class="split-close-btn" onclick="App.splitScreen.deactivate()" title="Exit Split Screen">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        `;

                        let iframe = rightContent.querySelector('iframe');
                        if (!iframe) {
                            rightContent.innerHTML = `<iframe title="Split Panel"></iframe>`;
                            iframe = rightContent.querySelector('iframe');
                        } else {
                            if (rightContent.querySelector('.split-view-selector')) {
                                rightContent.innerHTML = `<iframe title="Split Panel"></iframe>`;
                                iframe = rightContent.querySelector('iframe');
                            }
                        }

                        const targetSrc = this.getIframeSrc(this.state.rightView);
                        if (iframe.getAttribute('src') !== targetSrc) {
                            iframe.src = targetSrc;
                        }

                    } else {
                        if (!rightContent.querySelector('.split-view-selector')) {
                            rightHeader.innerHTML = `
                                <span class="split-panel-label">Split Panel</span>
                                <button class="split-close-btn" onclick="App.splitScreen.deactivate()" title="Exit Split Screen">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                             `;

                            rightContent.innerHTML = `
                                <div class="split-view-selector">
                                    <h2>Split Panel</h2>
                                    <p>Search articles or select a view</p>
                                    <div class="split-search-container">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                        <input type="text" class="split-search-input" id="split-search-input" placeholder="Search articles..." oninput="App.splitScreen.handleSearch(this.value)">
                                        <div class="split-search-results" id="split-search-results"></div>
                                    </div>
                                    <div class="split-view-grid">
                                        ${this.supportedViews.map(v => `
                                            <div class="split-view-option" onclick="App.splitScreen.setRightView('${v}')">
                                                ${this.viewIcons[v]}
                                                <span>${this.viewNames[v]}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }
                    }
                },

                getIframeSrc(viewId) {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('splitView', viewId);
                    currentUrl.searchParams.set('splitMode', 'iframe');
                    return currentUrl.toString();
                },

                changeLeftView(viewId) {
                    this.state.leftView = viewId;
                    const leftIframe = document.querySelector('#split-panel-left iframe');
                    if (leftIframe) {
                        leftIframe.src = this.getIframeSrc(viewId);
                    } else {
                        // Fallback in case structure is missing
                        this.render();
                    }
                },

                changeRightView(viewId) {
                    this.state.rightView = viewId;
                    const rightIframe = document.querySelector('#split-panel-right iframe');
                    if (rightIframe) {
                        rightIframe.src = this.getIframeSrc(viewId);
                    } else {
                        // Fallback/Force render if we were in selector mode
                        this.render();
                    }
                },

                setRightView(viewId) {
                    this.state.rightView = viewId;
                    this.render();
                },

                startResize(e) {
                    e.preventDefault();
                    const handle = e.target.closest('.split-resize-handle');
                    if (!handle) return;
                    handle.classList.add('dragging');

                    const isMobile = window.innerWidth <= 768;
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
                    };

                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onEnd);
                    document.addEventListener('touchmove', onMove, { passive: false });
                    document.addEventListener('touchend', onEnd);
                },

                applySplitRatio() {
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

                // Called on iframe load to handle split mode - returns true if in split mode
                handleSplitMode() {
                    const params = new URLSearchParams(window.location.search);
                    if (params.get('splitMode') === 'iframe') {
                        // Set flag IMMEDIATELY (sync) so App.init() can check it
                        App.isSplitIframeMode = true;
                        document.body.classList.add('split-iframe-mode');
                        const viewId = params.get('splitView');
                        const articleId = params.get('id');

                        // Wait for app to be fully ready (including settings, hub, quiz AND verified data load)
                        const checkReady = setInterval(() => {
                            // Check for all components needed by different views
                            const isReady = App.state &&
                                App.state.isDataFullyLoaded && // Wait for our new flag
                                App.state.articles &&
                                App.state.settings &&
                                App.router &&
                                App.quiz;                   // For stats-dashboard

                            if (isReady) {
                                clearInterval(checkReady);

                                // For flashcard view, ensure category is set to 'All' so all cards display
                                if (viewId === 'flashcard') {
                                    if (!App.state.settings.flashcardCategory) {
                                        App.state.settings.flashcardCategory = 'All';
                                    }
                                }

                                if (viewId === 'article' && articleId) {
                                    App.router.navigateTo('article', { id: articleId });
                                } else if (viewId && this.supportedViews.includes(viewId)) {
                                    App.router.navigateTo(viewId);
                                } else {
                                    App.router.navigateTo('library');
                                }
                            }
                        }, 50);
                        return true;
                    }
                    return false;
                },

                // Simple, reliable Library search - just search notes by title and content
                handleSearch(query) {
                    const resultsContainer = document.getElementById('split-search-results');
                    if (!resultsContainer) return;

                    // Clear if query too short
                    if (!query || query.length < 2) {
                        resultsContainer.innerHTML = '';
                        return;
                    }

                    // Get articles from state
                    const articles = App.state?.articles || App.state?.savedArticles || [];
                    if (!articles.length) {
                        resultsContainer.innerHTML = `<div class="split-search-empty">No articles found</div>`;
                        return;
                    }

                    // Create simple Fuse.js instance for article search
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

                    // Render clean, simple results
                    resultsContainer.innerHTML = results.map(r => {
                        const article = r.item;
                        const title = (article.title || 'Untitled').substring(0, 50);
                        const preview = (article.plainText || article.content || '').replace(/<[^>]*>/g, '').substring(0, 60);

                        return `
                            <div class="split-search-item" onclick="App.splitScreen.openArticleInSplit('${article.id}')">
                                <div class="split-search-text">
                                    <strong>${title}</strong>
                                    <small>${preview}...</small>
                                </div>
                            </div>
                        `;
                    }).join('');
                },

                // Open an article in the right split panel
                openArticleInSplit(articleId) {
                    const rightPanel = document.getElementById('split-panel-right');
                    if (!rightPanel) return;

                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('splitView', 'article');
                    currentUrl.searchParams.set('splitMode', 'iframe');
                    currentUrl.searchParams.set('id', articleId);

                    this.state.rightView = 'article';

                    const rightHeader = rightPanel.querySelector('.split-panel-header');
                    const rightContent = rightPanel.querySelector('.split-panel-content');

                    // Update header to show 'Article' option
                    rightHeader.innerHTML = `
                         <select onchange="App.splitScreen.changeRightView(this.value)">
                            ${this.supportedViews.map(v => `<option value="${v}">${this.viewNames[v]}</option>`).join('')}
                            <option value="article" selected>Article</option>
                        </select>
                        <button class="split-close-btn" onclick="App.splitScreen.deactivate()" title="Exit Split Screen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    `;

                    // Update iframe safely
                    let iframe = rightContent.querySelector('iframe');
                    if (!iframe) {
                        // If we were in selector mode, clean up and create iframe
                        rightContent.innerHTML = `<iframe title="Split Panel"></iframe>`;
                        iframe = rightContent.querySelector('iframe');
                    }

                    iframe.src = currentUrl.toString();
                }
};
