export const ui = {



                async renderView(viewId, data, view) {
                    // First, handle special cases like maps that have a unique setup.
                    if (viewId === 'visual-map' || viewId === 'mindmap') {
                        if (!view.hasChildNodes()) {
                            const mapType = viewId.split('-')[0];
                            const controlsId = `${mapType}-map-controls`;
                            const containerId = `${mapType}-map-container`;
                            const focusLineId = `${mapType === 'visual' ? 'vm' : 'mm'}-focus-line`;
                            const controlsPlaceholder = document.createElement('div');
                            controlsPlaceholder.id = controlsId;
                            const focusLinePlaceholder = document.createElement('div');
                            focusLinePlaceholder.id = focusLineId;
                            focusLinePlaceholder.className = 'canvas-focus-line';
                            focusLinePlaceholder.title = 'Toggle Focus Mode (Esc)';
                            const containerPlaceholder = document.createElement('div');
                            containerPlaceholder.id = containerId;
                            containerPlaceholder.tabIndex = 0;
                            view.appendChild(controlsPlaceholder);
                            view.appendChild(focusLinePlaceholder);
                            view.appendChild(containerPlaceholder);
                        }

                        if (viewId === 'visual-map') setTimeout(() => App.visualMap.init(), 50);
                        if (viewId === 'mindmap') setTimeout(() => App.mindMap.init(), 50);
                        return;
                    }

                    // MEMORY OP: Clear previous view's heavy data before rendering new one
                    App.util.freeMemory();

                    view.innerHTML = ''; // Clear the view first

                    switch (viewId) {
                        case 'welcome': this.renderWelcomeView(view, data); break;
                        case 'library': this.renderLibraryView(view); break;
                        case 'article': await this.renderArticleView(view, data); break;
                        case 'category': this.renderCategoryView(view, data); break;
                        case 'tags': this.renderTagsView(view); break;
                        case 'flashcard': this.renderFlashcardView(view, data); break;
                        case 'stats-dashboard': await this.renderStatsDashboardView(view, data); break;
                    }
                },

                renderWelcomeView(container, data) {
                    const { permissionState } = data || {};

                    // RATIONALE: All icon definitions are moved here for consistency and easy access.
                    const folderIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`;
                    const browserIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
                    const resumeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`;

                    const headerHTML = `
                    <div class="welcome-hero">
                        <div class="welcome-eyebrow"><span class="dot"></span> Your Second Brain</div>
                        <h1 class="library-title">NoteKash</h1>
                        <p id="welcome-subtitle"></p>
                    </div>
                    <div class="welcome-divider"><span>Choose your storage</span></div>`;

                    let choicesHTML = '';

                    if (permissionState === 'prompt') {
                        choicesHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 0;">
                            <div class="welcome-card recommended single-card" id="resume-btn" onclick="App.events.requestStoredPermission()">
                                <div class="welcome-card-header">
                                    <div class="card-icon">${resumeIcon}</div>
                                    <h3 class="card-title">Resume Session</h3>
                                </div>
                                <p class="card-description">Grant access to your previously selected folder to continue where you left off.</p>
                            </div>
                            <div class="welcome-prompt-alternatives">
                                <a href="#" onclick="event.preventDefault(); App.events.selectDirectory(true)">Choose a New Folder</a>
                                <span>&bull;</span>
                                <a href="#" onclick="event.preventDefault(); App.events.useBrowserStorage()">Use Browser Instead</a>
                            </div>
                        </div>`;
                    } else {
                        const isFPIsupported = 'showDirectoryPicker' in window;
                        const folderCardClass = isFPIsupported ? 'recommended' : 'disabled';
                        const folderCardTitle = isFPIsupported ? 'Best for privacy & data ownership.' : 'Your browser does not support this feature.';
                        const folderCardOnClick = isFPIsupported ? `App.events.selectDirectory()` : '';

                        choicesHTML = `
                        <div class="welcome-choices">
                            <div class="welcome-card ${folderCardClass}" id="select-folder-btn" onclick="${folderCardOnClick}" title="${folderCardTitle}">
                                <div class="welcome-card-header">
                                    <div class="card-icon">${folderIcon}</div>
                                    <h3 class="card-title">On My Device</h3>
                                </div>
                                <p class="card-description">Store notes privately on your device. Ideal for privacy, reliability &amp; ownership.</p>
                            </div>
                            <div class="welcome-card" onclick="App.events.useBrowserStorage()" title="Easiest setup, works on all browsers.">
                                <div class="welcome-card-header">
                                    <div class="card-icon">${browserIcon}</div>
                                    <h3 class="card-title">In the Browser</h3>
                                </div>
                                <p class="card-description">Store notes inside your browser's database. No folder setup required.</p>
                            </div>
                        </div>`;
                    }
                    container.innerHTML = `<div class="welcome-container">${headerHTML}${choicesHTML}</div>`;

                    const subtitleEl = document.getElementById('welcome-subtitle');
                    if (subtitleEl) {
                        // Short delay to let the subtitle fade-in animation settle, then type fast
                        setTimeout(() => App.util.typewriter(subtitleEl, "Turn notes into lasting knowledge.", 28), 420);
                    }

                    if (permissionState === 'denied') {
                        container.querySelector('.welcome-hero p').insertAdjacentHTML('afterend',
                            `<p style="color:var(--danger-color); font-weight: 500; margin-top: -0.5rem; margin-bottom: 1.5rem;">Access was denied. Please select a folder again or use the alternatives below.</p>`
                        );
                    }
                },

                async showSsoModal() {
                    let session = null;
                    try {
                        const { data } = await App.supabase.auth.getSession();
                        session = data.session;
                    } catch (e) {
                        console.error(e);
                    }

                    let contentHTML = '';
                    if (session) {
                        const email = session.user.email;
                        const name = session.user.user_metadata?.full_name || 'NoteKash User';
                        contentHTML = `
                            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem;">
                                <div style="font-size: 3rem;">☁️</div>
                                <h4>Logged In as ${App.util.escapeHtml(name)}</h4>
                                <p style="font-size: 0.9rem; color: var(--text-secondary);">${App.util.escapeHtml(email)}</p>
                                <div style="display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 1.5rem;">
                                    <button class="btn btn-danger" onclick="App.ui.handleSignOut()">Log Out</button>
                                    <button class="btn btn-secondary" onclick="App.ui.closeModal(); App.ui.showSettingsModal();">Back</button>
                                </div>
                            </div>
                        `;
                    } else {
                        contentHTML = `
                            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem;">
                                <div style="font-size: 3rem;">☁️</div>
                                <h4>Single Sign-On (SSO)</h4>
                                <p style="font-size: 0.9rem; color: var(--text-secondary);">Connect your NoteKash Suite account to sync pro membership status and focus analytics across applications.</p>
                                <div style="display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 1.5rem;">
                                    <button class="btn btn-primary" onclick="window.location.href='./login.html'">Log In / Sign Up</button>
                                    <button class="btn btn-secondary" onclick="App.ui.closeModal(); App.ui.showSettingsModal();">Back</button>
                                </div>
                            </div>
                        `;
                    }

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div class="modal-content ui-card" style="max-width: 400px; padding: 2rem;" onclick="event.stopPropagation()">
                            ${contentHTML}
                        </div>
                    </div>`;
                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                async handleSignOut() {
                    try {
                        const { error } = await App.supabase.auth.signOut();
                        if (error) throw error;
                        App.ui.showToast('Logged out successfully', 'info');
                        App.ui.closeModal();
                        const activeViewId = App.router.getActiveView();
                        if (activeViewId) App.router.navigateTo(activeViewId);
                    } catch (e) {
                        App.ui.showToast(`Log out failed: ${e.message}`, 'error');
                    }
                },

                renderLibraryView(container) {
                    const userCategoryObjects = App.settings.get('userCategories') || [];
                    const nameStyle = App.settings.get('categoryNameStyle') || 'full';
                    const activeCat = App.state.activeLibraryCategory || 'All';

                    // --- Theme-aware icon selection logic for category name toggle ---
                    const currentTheme = App.settings.get('theme') || 'sepia';
                    const customBase = App.settings.get('customThemeBase');
                    let toggleIcon;

                    switch (currentTheme) {
                        case 'sepia':
                            toggleIcon = '🟤';
                            break;
                        case 'dark':
                            toggleIcon = '🟠';
                            break;
                        case 'custom':
                            toggleIcon = (customBase === 'dark') ? '🟠' : '🟢';
                            break;
                        case 'light':
                        default:
                            toggleIcon = '🟢';
                            break;
                    }

                    const toggleButtonHTML = `
                    <button class="category-chip category-action-btn" id="category-name-toggle" title="Toggle Category Name Length" onclick="App.events.toggleCategoryNameStyle()">
                        ${toggleIcon}
                    </button>
                    `;

                    // Distinct Action Capsules with SVG icons (Tags, Flash, Snippet)
                    const actionButtonsHTML = `
                    <button class="category-chip category-action-btn action-secondary" onclick="App.router.navigateTo('tags')" title="Tags">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>Tags
                    </button>
                    <button class="category-chip category-action-btn action-primary" onclick="App.router.navigateTo('flashcard')" title="Flashcards">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>Flash
                    </button>
                    <button class="category-chip category-action-btn action-tertiary" onclick="App.router.navigateTo('category', 'All')" title="Snippets Reel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>Snippet
                    </button>
                    `;

                    // In-place Category Filter Capsules
                    const allButtonHTML = `
                    <button class="category-chip ${activeCat === 'All' ? 'active' : ''}" data-category="All" onclick="App.events.changeLibraryCategory('All')" title="All Articles">All</button>
                    `;

                    const categoryPillsHTML = userCategoryObjects.map(catObj => {
                        const isActive = activeCat === catObj.name;
                        const titleText = App.util.getCategoryDisplayName(catObj.name);
                        const buttonText = (nameStyle === 'full') ? titleText : titleText.substring(0, 4);
                        const backgroundColor = `var(--cat-color-${catObj.colorIndex}-bg)`;
                        const textColor = `var(--category-pill-text)`;
                        const style = `style="background-color: ${backgroundColor}; color: ${textColor};"`;
                        return `<button class="category-chip ${isActive ? 'active' : ''}" ${style} data-category="${App.util.escapeHtml(catObj.name)}" onclick="App.events.changeLibraryCategory('${App.util.escapeHtml(catObj.name)}')" title="${titleText}">${buttonText}</button>`;
                    }).join('');

                    const libraryTitle = App.util.escapeHtml(App.settings.get('libraryTitle') || 'My Library');

                    container.innerHTML = `
                    <div class="library-main">
                        <div class="library-header">
                            <h1 class="library-title">${libraryTitle}</h1>
                        </div>
                        <div class="search-and-filter-bar">
                            <div class="search-bar-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                                <input type="text" id="search-input" placeholder="Search by titles, snippets, '*category', read count e.g *law, 0 (unread)" aria-label="Search articles" autocomplete="off">
                            </div>
                            <select id="sort-filter" class="btn btn-secondary" aria-label="Sort articles by">
                                <option value="updatedAt">Sort by Newest</option>
                                <option value="createdAt">Sort by Oldest</option>
                                <option value="title">Sort by Title</option>
                                <option value="unread">Sort by Unread</option>
                                <option value="read">Sort by Read</option>
                                <option value="random">Sort by Random</option>
                            </select>
                        </div>
                        <div class="category-filters">
                            ${toggleButtonHTML}
                            ${actionButtonsHTML}
                            ${allButtonHTML}
                            ${categoryPillsHTML}
                        </div>
                        <hr style="width:100%; border-color: var(--border-color); margin: 0;">
                        <div id="article-grid-container">
                            <div class="article-grid" id="article-grid">
                                <div class="empty-state" style="grid-column: 1 / -1;"><div class="spin">${App.util.icons.cycle}</div><h3>Loading Library...</h3></div>
                            </div>
                            <div id="library-sentinel" style="height: 20px; width: 100%; margin-top: 20px;"></div>
                        </div>
                    </div>`;

                    setTimeout(() => App.ui.filterAndRenderArticles(), 50);
                },

                filterAndRenderArticles() {
                    const grid = document.getElementById('article-grid');
                    if (!grid) return;

                    const searchTerm = document.getElementById('search-input')?.value || '';
                    let articlesToDisplay = [...App.state.articles];
                    let currentSearchTerm = searchTerm.trim();

                    const sortBy = App.settings.get('librarySortBy') || 'updatedAt';
                    switch (sortBy) {
                        case 'createdAt':
                            articlesToDisplay.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                            break;
                        case 'title':
                            articlesToDisplay.sort((a, b) => a.title.localeCompare(b.title));
                            break;
                        case 'unread':
                            articlesToDisplay.sort((a, b) => (a.readCount || 0) - (b.readCount || 0));
                            break;
                        case 'read':
                            articlesToDisplay.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
                            break;
                        case 'random':
                            articlesToDisplay.sort(() => Math.random() - 0.5);
                            break;
                        case 'updatedAt':
                        default:
                            articlesToDisplay.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                            break;
                    }

                    const readCountMatch = currentSearchTerm.match(/^(\d+)\s*(.*)/);
                    let readCountFilter = null;
                    if (readCountMatch) {
                        readCountFilter = parseInt(readCountMatch[1], 10);
                        currentSearchTerm = readCountMatch[2].trim();
                        if (readCountFilter === 0) {
                            articlesToDisplay = articlesToDisplay.filter(a => !a.readCount || a.readCount === 0);
                        } else {
                            articlesToDisplay = articlesToDisplay.filter(a => a.readCount === readCountFilter);
                        }
                    }

                    const categoryMatch = currentSearchTerm.match(/^\*(\w*)\s*/);
                    if (categoryMatch) {
                        const prefix = categoryMatch[1].toLowerCase();
                        const userCategories = App.settings.get('userCategories'); // Get the category objects

                        if (prefix && userCategories) { // Add a check for userCategories
                            const matchingCategoryNames = userCategories
                                .filter(catObj => // Filter the objects directly
                                    catObj.name.toLowerCase().startsWith(prefix) ||
                                    (App.util.getCategoryDisplayName(catObj.name) || '').toLowerCase().startsWith(prefix)
                                )
                                .map(catObj => catObj.name); // Then get the names

                            const matchingCategorySet = new Set(matchingCategoryNames);
                            if (matchingCategorySet.size > 0) {
                                articlesToDisplay = articlesToDisplay.filter(a => matchingCategorySet.has(a.category));
                            }
                        }
                        currentSearchTerm = currentSearchTerm.replace(/^\*(\w*)\s*/, '').trim();
                    }

                    // In-place Active Library Category Filter
                    const activeCategory = App.state.activeLibraryCategory || 'All';
                    if (activeCategory !== 'All') {
                        articlesToDisplay = articlesToDisplay.filter(a => a.category === activeCategory);
                    }

                    if (currentSearchTerm) {
                        // --- OPTIMIZATION: Global Fuse Caching + Intersection ---
                        let keywordFilteredIds = null;
                        const totalArticles = App.state.articles.length;

                        // Rebuild Index if missing, dirty, or size changed (add/delete)
                        if (!App.state.globalSearchIndex || App.state.searchIndexDirty || App.state.globalSearchIndex.size !== totalArticles) {
                            const searchableData = App.state.articles.map(article => ({
                                id: article.id,
                                title: article.title,
                                tags: (article.tags || []).join(' '),
                                snippets: App.util.extractSnippets(article, 'highlight').map(s => s.text)
                            }));

                            App.state.globalSearchIndex = App.offline.safeFuse(searchableData, {
                                keys: [{ name: 'title', weight: 0.6 }, { name: 'tags', weight: 0.3 }, { name: 'snippets', weight: 0.1 }],
                                includeScore: true, threshold: 0.4
                            });
                            App.state.globalSearchIndex.size = totalArticles;
                            App.state.searchIndexDirty = false;
                        }

                        const results = App.state.globalSearchIndex.search(currentSearchTerm);
                        const filteredIds = new Set(results.map(r => r.item.id));
                        articlesToDisplay = articlesToDisplay.filter(a => filteredIds.has(a.id));
                    }

                    // Hide the "Searching..." toast if it exists
                    const searchingToast = document.getElementById('search-feedback-toast');
                    if (searchingToast) App.ui.hideToast(searchingToast);

                    let finalHTML = '';

                    if (!App.license.isPremium()) {
                        const articlesUsed = App.state.articles.length;
                        const articleLimit = App.config.sparkTierLimit;
                        const percentageUsed = Math.min(100, Math.round((articlesUsed / articleLimit) * 100));

                        finalHTML += `
                        <div class="article-card library-premium-card" title="A message from the developer...">
                            <div class="card-category-badge premium-badge">✨ Spark Tier</div>
                            <h3 class="card-title">You've used ${percentageUsed}% Quota (${articlesUsed} of ${articleLimit} notes)</h3>
                            <div class="card-footer premium-card-footer">
                                <div class="premium-progress-bar">
                                    <div class="premium-progress" style="width: ${percentageUsed}%;"></div>
                                </div>
                                <span class="premium-cta-text">Click to see what's possible →</span>
                            </div>
                        </div>`;
                    }

                    if (articlesToDisplay.length === 0) {
                        if (App.state.articles.length === 0) {
                            finalHTML += `<div class="empty-state" style="grid-column: 1 / -1;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
                            <h3>Your Second Brain Awaits!</h3>
                            <p>Click the <strong>+</strong> button in the top right to create your first note.</p>
                        </div>`;
                        } else if (activeCategory !== 'All' && !currentSearchTerm && readCountFilter === null && !categoryMatch) {
                            finalHTML += `<div class="empty-state" style="grid-column: 1 / -1;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            <h3>No Notes in ${App.util.escapeHtml(App.util.getCategoryDisplayName(activeCategory))}</h3>
                            <p>Click <strong>+</strong> in the top header or assign existing notes to this category.</p>
                        </div>`;
                        } else {
                            finalHTML += `<div class="empty-state" style="grid-column: 1 / -1;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><h3>Ouch, No Results Found</h3><p>Try a different title, tag, or filter combination.</p></div>`;
                        }
                    }
                    grid.innerHTML = finalHTML;
                    App.state.libraryRender.filteredArticles = articlesToDisplay;
                    App.state.libraryRender.currentIndex = 0;

                    if (App.state.libraryObserver) App.state.libraryObserver.disconnect();

                    if (articlesToDisplay.length > 0) {
                        this.renderArticleBatch(20);

                        const sentinel = document.getElementById('library-sentinel');
                        if (sentinel) {
                            App.state.libraryObserver = new IntersectionObserver((entries) => {
                                if (entries[0].isIntersecting && App.state.libraryRender.currentIndex < App.state.libraryRender.filteredArticles.length) {
                                    this.renderArticleBatch(20);
                                }
                            }, { rootMargin: '400px' });
                            App.state.libraryObserver.observe(sentinel);
                        }
                    }

                    const visibleCards = Array.from(grid.querySelectorAll('.article-card:not(.library-premium-card)'));
                    const shouldHighlight = !!currentSearchTerm || readCountFilter !== null || !!categoryMatch;
                    visibleCards.forEach(card => card.classList.toggle('search-highlight-card', shouldHighlight));
                    document.querySelectorAll('.search-selected-card').forEach(c => c.classList.remove('search-selected-card'));
                    App.state.libraryRender.searchResults = visibleCards;
                    App.state.libraryRender.selectedIndex = -1;
                    if (shouldHighlight && visibleCards.length > 0) {
                        App.state.libraryRender.selectedIndex = 0;
                        visibleCards[0].classList.add('search-selected-card');
                        if (document.activeElement.id === 'sort-filter') {
                            visibleCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                },

                async startLibraryRender() {
                    const grid = document.getElementById('article-grid');
                    if (!grid) return;

                    App.state.libraryRender.isRendering = true;
                    // Reset index
                    App.state.libraryRender.currentIndex = 0;
                    grid.innerHTML = '';
                    window.scrollTo(0, 0);

                    // Check for empty state *before* rendering batches
                    if (App.state.libraryRender.filteredArticles.length === 0) {
                        let emptyMessage = `<div class="empty-state" style="grid-column: 1 / -1;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><h3>No Articles Found</h3><p>Try adjusting your search or create a new article.</p></div>`;
                        if (!App.state.directoryHandle) {
                            emptyMessage = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding: 4rem 1rem;"><p>Please select a folder to begin.</p></div>`
                        }
                        grid.innerHTML = emptyMessage;
                        App.state.libraryRender.isRendering = false;
                        return;
                    }

                    // 1. Render Initial Batch
                    this.renderArticleBatch(20);

                    // 2. Setup Infinite Scroll (Virtualization Lite)
                    const sentinel = document.getElementById('library-sentinel');
                    if (sentinel) {
                        if (App.state.libraryObserver) App.state.libraryObserver.disconnect();

                        App.state.libraryObserver = new IntersectionObserver((entries) => {
                            if (entries[0].isIntersecting) {
                                // Load next chunk
                                if (App.state.libraryRender.currentIndex < App.state.libraryRender.filteredArticles.length) {
                                    this.renderArticleBatch(20);
                                }
                            }
                        }, { rootMargin: '400px' }); // Pre-load well before reaching bottom

                        App.state.libraryObserver.observe(sentinel);
                    }
                },


                renderArticleBatch(count) {
                    const grid = document.getElementById('article-grid');
                    if (!grid) return;

                    const { filteredArticles, currentIndex } = App.state.libraryRender;
                    const endIndex = Math.min(currentIndex + count, filteredArticles.length);

                    let articlesHTML = '';
                    for (let i = currentIndex; i < endIndex; i++) {
                        articlesHTML += this.getArticleCardHTML(filteredArticles[i]);
                    }

                    grid.insertAdjacentHTML('beforeend', articlesHTML);
                    App.state.libraryRender.currentIndex = endIndex;
                },

                getArticleCardHTML(article) {
                    // Find the category object to get its colorIndex
                    const categoryObj = App.settings.get('userCategories').find(c => c.name === article.category) || { name: article.category, colorIndex: 0 };
                    const backgroundColor = App.util.getCategoryColor(categoryObj.colorIndex);

                    const readCount = article.readCount || 0;
                    const progressColorVar = `var(${App.util.getReadProgressColorVar(readCount)})`;
                    const borderStyle = `border-left-color: ${progressColorVar};`;

                    const heartTitle = `Read ${readCount} time(s)`;
                    let heartSVG;
                    if (readCount === 0) {
                        heartSVG = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="${progressColorVar}"/></svg>`;
                    } else {
                        const masteryGlow = readCount >= 10 ? `filter: drop-shadow(0 0 5px ${progressColorVar});` : '';
                        heartSVG = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" style="${masteryGlow}"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${progressColorVar}"/></svg>`;
                    }

                    const readCountBadgeHTML = `<div title="${heartTitle}" style="display: flex; align-items: center; justify-content: center; height: 24px; width: 24px;">${heartSVG}</div>`;
                    const wordCountHTML = `<span class="card-word-count">${article.wordCount || 0} words</span>`;
                    const date = new Date(article.updatedAt);
                    const dateHTML = `<span class="card-date">${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>`;

                    // UPDATED: Note the inline style for background-color and removal of data-category
                    return `<div class="article-card ui-card" tabindex="0" data-id="${article.id}" style="${borderStyle}">
                    <div class="card-header-info">
                        <div class="card-category-badge category-pill" style="background-color: ${backgroundColor};">${App.util.getCategoryDisplayName(categoryObj.name)}</div>
                        ${readCountBadgeHTML}
                    </div>
                    <h3 class="card-title">${article.title}</h3>
                    <div class="card-footer">${wordCountHTML}${dateHTML}</div>
                </div>`;
                },

                // New Helper for Native-like Inputs
                showInputModal(title, placeholder, defaultValue, onConfirm) {
                    this.closeModal(); // Ensure no stacking

                    const modalId = `input-modal-${Date.now()}`;
                    const modalHTML = `
                    <div id="${modalId}" class="modal-backdrop" style="animation: fadeIn 0.2s ease-out; z-index: 20000; background-color: rgba(0,0,0,0.6);">
                        <div class="modal-content ui-card" style="max-width: 400px; transform-origin: center center; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                            <h3 style="margin-top:0;">${title}</h3>
                            <input type="text" id="${modalId}-input" class="text-input" placeholder="${placeholder}" value="${defaultValue || ''}" style="width: 100%; margin-top: 10px; margin-bottom: 20px;">
                            <div class="modal-buttons" style="margin-top: 0; justify-content: flex-end; gap: 10px;">
                                <button class="btn btn-secondary" id="${modalId}-cancel">Cancel</button>
                                <button class="btn btn-primary" id="${modalId}-confirm">Confirm</button>
                            </div>
                        </div>
                    </div>`;

                    document.body.insertAdjacentHTML('beforeend', modalHTML);
                    const modalEl = document.getElementById(modalId);
                    const inputEl = document.getElementById(`${modalId}-input`);
                    const cancelBtn = document.getElementById(`${modalId}-cancel`);
                    const confirmBtn = document.getElementById(`${modalId}-confirm`);

                    inputEl.focus();
                    if (defaultValue) inputEl.select();

                    const cleanup = () => modalEl.remove();

                    // Actions
                    const handleConfirm = () => {
                        const val = inputEl.value.trim();
                        if (val) onConfirm(val);
                        cleanup();
                    };

                    confirmBtn.onclick = handleConfirm;
                    cancelBtn.onclick = cleanup;

                    // Allow Enter to confirm, Esc to cancel
                    inputEl.onkeydown = (e) => {
                        if (e.key === 'Enter') handleConfirm();
                        if (e.key === 'Escape') cleanup();
                    };

                    // Close on backdrop click
                    modalEl.onclick = (e) => {
                        if (e.target === modalEl) cleanup();
                    };
                },

                showExportBrandModal(onExport, exportType = 'PDF') {
                    const isPremium = App.license.isPremium();
                    const savedBrandName = App.settings.get('brandName') || '';
                    const savedBrandLink = App.settings.get('brandLink') || '';
                    const modalId = `export-brand-modal-${Date.now()}`;
                    const lockHint = isPremium ? '' : `
                        <div style="display:flex;align-items:center;gap:6px;margin-top:6px;padding:7px 10px;border-radius:8px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.18);">
                            <span style="font-size:13px;">🔒</span>
                            <span style="font-size:14px;color:var(--text-muted);">Upgrade to <strong style="color:#6366F1;cursor:pointer;" onclick="App.ui.closeModal(); App.ui.showAscensionModal();">Premium</strong> to add your Brand & remove all watermarks</span>
                        </div>`;
                    const inputStyle = `width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:14px;box-sizing:border-box;${isPremium ? '' : 'opacity:0.45;cursor:not-allowed;'}`;
                    const modalHTML = `
                    <div id="${modalId}" class="modal-backdrop" style="animation:fadeIn 0.2s ease-out;z-index:20000;background-color:rgba(0,0,0,0.6);">
                        <div class="modal-content ui-card" style="max-width:400px;animation:popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275);">
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                                <span style="font-size:22px;">📄</span>
                                <h3 style="margin:0;font-size:1.1rem;">Export Brand Settings</h3>
                            </div>
                            <p style="margin:0 0 14px;font-size:13px;color:var(--text-muted);line-height:1.5;">You can add your Brand name in the <strong>${exportType} footer</strong>. Leave blank to keep the default layout.</p>
                            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">Brand Name</label>
                            <input type="text" id="${modalId}-name" class="text-input" value="${App.util.escapeHtml(savedBrandName)}" placeholder="${isPremium ? 'e.g. My Study Notes' : 'Premium feature'}" style="${inputStyle}" ${isPremium ? '' : 'disabled'} maxlength="40">
                            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin:12px 0 4px;text-transform:uppercase;letter-spacing:.5px;">Brand Link <span style="font-weight:400;text-transform:none;font-size:11px;">(optional)</span></label>
                            <input type="url" id="${modalId}-link" class="text-input" value="${App.util.escapeHtml(savedBrandLink)}" placeholder="${isPremium ? 'https://yoursite.com' : 'Premium feature'}" style="${inputStyle}" ${isPremium ? '' : 'disabled'}>
                            ${lockHint}
                            <div class="modal-buttons" style="margin-top:18px;justify-content:flex-end;gap:10px;">
                                <button class="btn btn-secondary" id="${modalId}-cancel">Cancel</button>
                                <button class="btn btn-primary" id="${modalId}-confirm" style="gap:6px;">
                                    <span>Export ${exportType}</span> 
                                </button>
                            </div>
                        </div>
                    </div>`;
                    document.body.insertAdjacentHTML('beforeend', modalHTML);
                    const modalEl = document.getElementById(modalId);
                    const nameEl = document.getElementById(`${modalId}-name`);
                    const linkEl = document.getElementById(`${modalId}-link`);
                    const cancelEl = document.getElementById(`${modalId}-cancel`);
                    const confirmEl = document.getElementById(`${modalId}-confirm`);
                    if (isPremium && nameEl) nameEl.focus();
                    const cleanup = () => modalEl.remove();
                    const doExport = () => {
                        const brandName = isPremium ? (nameEl?.value?.trim() || '') : '';
                        const brandLink = isPremium ? (linkEl?.value?.trim() || '') : '';
                        cleanup();
                        onExport(brandName, brandLink);
                    };
                    confirmEl.onclick = doExport;
                    cancelEl.onclick = cleanup;
                    modalEl.onclick = (e) => { if (e.target === modalEl) cleanup(); };
                    modalEl.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') doExport();
                        if (e.key === 'Escape') cleanup();
                    });
                },

                showAscensionModal(featureKey) {
                    // ── CONTEXT-AWARE FEATURE MESSAGES ──────────────────────────────────
                    const featureContextMap = {
                        ocr: { emoji: '🔍', headline: 'OCR is an Ascension Superpower.', sub: 'Extract text from any image instantly — no more manual typing. This magic is reserved for Ascension users.' },
                        proPresenter: { emoji: '✨', headline: 'Pro-Presenter Mode is Ascension-Exclusive.', sub: 'The Living Cell aura, fluid cursor effects and full-screen mastery are built for Ascension users who demand the best.' },
                        export_txt: { emoji: '📄', headline: 'Export (.TXT) is locked for Spark users.', sub: 'Your knowledge is valuable — take it anywhere. Ascension lets you export every note as plain text, PDF, HTML & Anki TSV.' },
                        export_html: { emoji: '🌐', headline: 'Export (.HTML) needs Ascension.', sub: 'Share beautifully formatted notes as web pages. Ascension users own their knowledge in every format.' },
                        export_tsv: { emoji: '🃏', headline: 'Anki Export (.TSV) is an Ascension feature.', sub: 'Power your Anki decks directly from NoteKash. Spaced repetition at its finest — for Ascension users.' },
                        ai_summary: { emoji: '🧠', headline: 'AI Summary requires Ascension.', sub: 'Let AI condense hours of reading into sharp, actionable summaries. Your time is worth more than manual notes.' },
                        ai_curate: { emoji: '🪄', headline: 'Kash Curate is an Ascension AI tool.', sub: '"Neural Link" AI structures your scattered thoughts into a masterpiece — 5x faster than standard note-taking.' },
                        ai_highlight: { emoji: '🎨', headline: 'AI Auto-Highlight needs Ascension.', sub: 'Ascension AI reads your notes and highlights what actually matters. No more re-reading everything.' },
                        ai_mcq: { emoji: '❓', headline: 'AI MCQ Generator is Ascension-only.', sub: 'Turn any note into a full MCQ practice set in seconds. Ascension users study smarter, not harder.' },
                        ai_generic: { emoji: '💎', headline: 'This AI tool requires Ascension.', sub: 'Over 25 specialized AI tools are waiting for you — from mnemonics to debate tables to video scripts.' },
                        timeline: { emoji: '⏳', headline: 'Timeline Blocks need Ascension.', sub: 'Map history visually with interactive timelines. Turn complex chronologies into clear, beautiful narratives.' },
                        mcq_block: { emoji: '🧩', headline: 'MCQ Blocks are Ascension-only.', sub: 'Embed interactive multiple-choice questions directly in your notes. Self-test as you revise.' },
                        textile: { emoji: '📝', headline: 'Text Tiles need Ascension.', sub: 'Modular, colourful, structured — Decktiles and Text Tiles transform how you organize complex information.' },
                        accordion: { emoji: '🗂️', headline: 'Accordion Cards need Ascension.', sub: 'Hide answers and reveal them on demand. Ascension users turn their notes into interactive study material.' },
                        code_block: { emoji: '</>', headline: 'Code Blocks need Ascension.', sub: 'Syntax-highlighted, beautifully formatted code blocks for technical notes. Because developers deserve Ascension too.' },
                        cloud_sync: { emoji: '☁️', headline: 'Cloud Sync is an Ascension feature.', sub: "Don't just take notes. Own them — everywhere. Ascension syncs your second brain across all your devices." },
                        visual_map: { emoji: '🗺️', headline: 'Advanced Visual Map tools need Ascension.', sub: 'Lasso, Gather, Snapshots — master your knowledge graph with pro-level controls.' },
                        mindmap: { emoji: '🕸️', headline: 'Advanced MindMap tools need Ascension.', sub: 'Expand, collapse, snapshot and colour-rotate your mind maps. Your thinking, elevated.' },
                        limit: { emoji: '🚀', headline: 'Your Second Brain is Growing Fast!', sub: "You've hit the 100-note Spark limit. Your ideas deserve infinite space — time to Ascend." },
                        themes: { emoji: '🎨', headline: 'Premium Themes need Ascension.', sub: 'Dark, Midnight Deep Work, Sepia — curated themes that match your mood and protect your eyes.' },
                        fonts: { emoji: '✒️', headline: 'Premium Fonts need Ascension.', sub: 'Playfair Display, DM Sans, Outfit — beautiful typography that makes your notes a pleasure to read.' },
                        checkbox: { emoji: '✅', headline: 'Checkbox To-dos need Ascension.', sub: 'Track tasks right inside your notes. Ascension turns your note editor into a full productivity system.' },
                        lasso: { emoji: '🔲', headline: 'Lasso Select needs Ascension.', sub: 'Select, group and organise multiple knowledge nodes at once. Power-user map control for Ascension.' },
                        snapshot: { emoji: '📸', headline: 'Snapshots need Ascension.', sub: 'Capture your Visual Map or MindMap as a timestamped image. Never lose a moment of insight.' },
                    };

                    // ── SMART FOMO SPOTLIGHT (data-driven) ─────────────────────────────
                    const articles = App.state.articles || [];
                    const totalNotes = articles.length;
                    const topCategory = (() => {
                        const freq = {};
                        articles.forEach(a => { if (a.category) freq[a.category] = (freq[a.category] || 0) + 1; });
                        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
                    })();
                    const hour = new Date().getHours();
                    const isLateNight = hour >= 22 || hour < 5;
                    const catNote = topCategory ? `You have notes in <strong>${topCategory}</strong>. ` : '';

                    const fomoMessages = [
                        `${catNote}Ascension users auto-generate AI revision tables for entire categories — saving hours every week.`,
                        `You've created <strong>${totalNotes} notes</strong>. Ascension's AI Curate can structure all of them into a perfect study guide in one click.`,
                        `Ascension users export to <strong>Anki TSV</strong> and supercharge their spaced repetition — your notes becoming flashcards automatically.`,
                        `Did you know? Ascension's <strong>Cloud Sync</strong> means your second brain is always with you — phone, tablet, laptop, everywhere.`,
                        `<strong>KashMindmap AI</strong> can scan any note and build a visual mind map in seconds. Ascension users study 3x faster with it.`,
                        isLateNight
                            ? `Late night study session? Ascension's <strong>Midnight Deep Work</strong> themes reduce eye strain so you can focus longer.`
                            : `Ascension's <strong>Pro-Presenter mode</strong> turns your notes into a stunning live presentation — perfect for teaching and sharing.`,
                        `<strong>KashMCQ Generator</strong> creates practice questions from any article. Ascension users never have to write test questions manually again.`,
                        `Ascension users get <strong>OCR</strong> -- point your camera at any printed text and it becomes a searchable, editable note instantly.`,
                        `<strong>KashSummary AI</strong> condenses a 30-minute read into a 2-minute brief. Ascension users read more, remember more, spend less time.`
                    ];
                    const fomoMsg = fomoMessages[Math.floor(Math.random() * fomoMessages.length)];

                    // ── RESOLVE CONTEXT ─────────────────────────────────────────────────
                    const ctx = featureContextMap[featureKey] || null;
                    const maybeLaterText = App.util.getRandomMessage(App.util.maybeLaterMessages);

                    // ── BADGE TIERS WITH CUT-OFF PRICING & USD CAPSULES ────────────────
                    const badgeTiers = [
                        {
                            name: 'Spark',
                            tierKey: 'spark',
                            duration: 'Free Tier',
                            subtext: 'Core Suite',
                            price: 0,
                            origPrice: null,
                            usdPrice: '$0',
                            perMonth: 'Forever Free',
                            badge: null,
                            isCurrent: App.license.state.tier === 'Spark',
                            accentColor: '#94a3b8'
                        },
                        {
                            name: 'Bronze',
                            tierKey: 'bronze',
                            duration: '3 Months',
                            subtext: 'Quarterly Pass',
                            price: 299,
                            origPrice: 499,
                            usdPrice: '$3',
                            perMonth: '₹99/mo eq.',
                            badge: null,
                            isCurrent: App.license.state.tier === 'Bronze',
                            accentColor: '#f59e0b'
                        },
                        {
                            name: 'Silver',
                            tierKey: 'silver',
                            duration: '6 Months',
                            subtext: 'Semester Pass',
                            price: 399,
                            origPrice: 699,
                            usdPrice: '$4',
                            perMonth: '₹66/mo eq.',
                            badge: null,
                            isCurrent: App.license.state.tier === 'Silver',
                            accentColor: '#cbd5e1'
                        },
                        {
                            name: 'Gold',
                            tierKey: 'gold',
                            duration: '1 Year',
                            subtext: 'Annual All-Access',
                            price: 499,
                            origPrice: 999,
                            usdPrice: '$5',
                            perMonth: '₹41/mo eq.',
                            badge: '⭐ MOST POPULAR',
                            isCurrent: App.license.state.tier === 'Gold',
                            accentColor: '#fbbf24'
                        },
                        {
                            name: 'Diamond',
                            tierKey: 'diamond',
                            duration: 'Lifetime',
                            subtext: 'Forever Unlocked',
                            price: 999,
                            origPrice: 2999,
                            usdPrice: '$12',
                            perMonth: 'One-time pay',
                            badge: '💎 BEST VALUE',
                            isCurrent: App.license.state.tier === 'Diamond',
                            accentColor: '#38bdf8'
                        }
                    ];

                    const badgesHTML = badgeTiers.map(tier => {
                        const badgeHTML = App.util.getTierBadgeHTML(tier.name, 64);
                        const isClickable = !tier.isCurrent && tier.price > 0;
                        const clickAttr = isClickable ? `onclick="App.ui.initiateRazorpayPayment('${tier.name}', ${tier.price})"` : '';
                        
                        return `
                        <div class="ascension-tier-card tier-${tier.tierKey} ${tier.isCurrent ? 'is-current-tier' : ''} ${tier.badge ? 'has-badge' : ''}"
                            ${clickAttr}>
                            ${tier.isCurrent ? `<div class="ascension-current-ribbon"><span>ACTIVE</span></div>` : (tier.badge ? `<div class="ascension-featured-pill">${tier.badge}</div>` : '')}
                            <div class="ascension-badge-glow-ring">
                                ${badgeHTML}
                            </div>
                            <div class="ascension-card-title-group">
                                <span class="ascension-tier-title">${tier.name}</span>
                                <span class="ascension-tier-duration">${tier.duration}</span>
                            </div>
                            <div class="ascension-card-pricing-box">
                                ${tier.price === 0 ? `
                                    <div class="ascension-price-row single">
                                        <span class="ascension-price-free">Free</span>
                                    </div>
                                    <div class="ascension-price-meta">
                                        <span class="ascension-cadence">${tier.perMonth}</span>
                                    </div>
                                ` : `
                                    <div class="ascension-price-row">
                                        <span class="ascension-orig-price">₹${tier.origPrice}</span>
                                        <span class="ascension-price-main">₹${tier.price}</span>
                                    </div>
                                    <div class="ascension-price-meta">
                                        <span class="ascension-usd-pill">${tier.usdPrice}</span>
                                        <span class="ascension-cadence">${tier.perMonth}</span>
                                    </div>
                                `}
                            </div>
                            <div class="ascension-card-action">
                                ${tier.isCurrent ? `<span class="action-label active-plan">Current Plan</span>` : (tier.price === 0 ? `<span class="action-label default-plan">Free Included</span>` : `<span class="action-label upgrade-plan">Ascend Now &rarr;</span>`)}
                            </div>
                        </div>`;
                    }).join('');

                    const mailtoLink = 'mailto:learningmarvel@gmail.com';

                    // ── CONTEXT HERO BLOCK (shown only when a featureKey is passed) ────
                    const heroHTML = ctx ? `
                        <div class="ascension-hero-block">
                            <div class="ascension-hero-emoji">${ctx.emoji}</div>
                            <div class="ascension-hero-text">
                                <span class="ascension-exclusive-pill">⭐ Ascension Exclusive</span>
                                <p class="ascension-hero-headline">${ctx.headline}</p>
                                <p class="ascension-hero-sub">${ctx.sub}</p>
                            </div>
                        </div>` : '';

                    const modalHTML = `
                        <div class="ascension-backdrop-dark" onclick="if(event.target===this)App.ui.closeModal()">
                            <div class="ascension-modal-dark" onclick="event.stopPropagation()">
                                <button class="ascension-dark-close-btn" onclick="App.ui.closeModal()" title="Close (Esc)">&times;</button>

                                <div class="ascension-modal-inner">
                                    ${heroHTML}

                                    <div class="ascension-header-wrap">
                                        <h4 class="ascension-master-title">Choose Your Ascension</h4>
                                        <div class="ascension-multiapp-pill">
                                            <span class="multiapp-sparkle">✦</span> One Subscription, Multiple Apps
                                        </div>
                                        <div class="ascension-deal-pill">
                                            <span class="deal-sparkle">⚡</span> Early-bird pricing ending soon — lock in your Ascension rate before prices increase!
                                        </div>
                                    </div>

                                    <div class="ascension-tier-grid">
                                        ${badgesHTML}
                                    </div>
                                    
                                    <div class="ascension-fomo-card">
                                        <span class="ascension-fomo-label"><span class="ascension-fomo-spark">⚡</span> DID YOU KNOW?</span>
                                        <p class="ascension-fomo-msg">${fomoMsg}</p>
                                    </div>

                                    <div class="ascension-features-section">
                                        <div class="ascension-features-header">
                                            <div class="ascension-features-header-line"></div>
                                            <span class="ascension-features-header-text">✦ EVERYTHING UNLOCKED</span>
                                            <div class="ascension-features-header-line"></div>
                                        </div>
                                        <div class="ascension-feature-grid">
                                            <div class="ascension-feature-tile" style="--tile-accent:#6366f1">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">♾️</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">Unlimited Experience</div>
                                                    <div class="ascension-feature-desc">Unlimited Notes, Flashcards &amp; MCQ Quizzes</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#8b5cf6">
                                                <span class="tile-badge">25+</span>
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">🧠</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">All AI Tools</div>
                                                    <div class="ascension-feature-desc">Curate, MCQ, Mnemonic, Auto-Highlight &amp; more</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#06b6d4">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">📸</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">OCR Scanner</div>
                                                    <div class="ascension-feature-desc">Extract text from any image instantly</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#10b981">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">🗺️</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">Visual Map</div>
                                                    <div class="ascension-feature-desc">Lasso, Gather, Snapshots &amp; Force Layouts</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#f59e0b">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">🕸️</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">Mind Maps</div>
                                                    <div class="ascension-feature-desc">AI-generated, colour-rotate &amp; visual hierarchy</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#ec4899">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">✨</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">Pro-Presenter</div>
                                                    <div class="ascension-feature-desc">Luminescent Ethereal Aura &amp; Zen Fullscreen</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#3b82f6">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">📤</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">Full Pro Export</div>
                                                    <div class="ascension-feature-desc">PDF, HTML, Plain TXT, Anki TSV</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#a855f7">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">🎨</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">Aesthetics &amp; Branding</div>
                                                    <div class="ascension-feature-desc">Personalized Watermark &amp; Premium typography</div>
                                                </div>
                                            </div>
                                            <div class="ascension-feature-tile" style="--tile-accent:#14b8a6">
                                                <div class="ascension-feature-icon-wrap"><div class="ascension-feature-icon">🌐</div></div>
                                                <div class="ascension-feature-info">
                                                    <div class="ascension-feature-name">One Pro, All Apps</div>
                                                    <div class="ascension-feature-desc">Get One Membership across our all Kash App Ecosystem</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="ascension-modal-footer">
                                        <button class="ascension-maybe-later-btn" onclick="App.ui.closeModal()">${maybeLaterText}</button>
                                    </div>
                                </div>
                            </div>
                        </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                // Razorpay Dynamic Loader and Trigger
                async initiateRazorpayPayment(tierName, priceInRupees) {
                    let session = null;
                    try {
                        const { data } = await App.supabase.auth.getSession();
                        session = data.session;
                    } catch (e) {
                        console.error(e);
                    }

                    if (!session) {
                        App.ui.showToast("Please log in to your Cloud SSO Account to upgrade.", "warning");
                        App.ui.closeModal();
                        setTimeout(() => window.location.href = './login.html', 1000);
                        return;
                    }

                    // Dynamically load Razorpay SDK
                    const loadSDK = () => {
                        return new Promise((resolve) => {
                            if (window.Razorpay) {
                                resolve(true);
                                return;
                            }
                            const script = document.createElement('script');
                            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                            script.onload = () => resolve(true);
                            script.onerror = () => resolve(false);
                            document.body.appendChild(script);
                        });
                    };

                    App.ui.showToast("Contacting payment gateway...", "info");
                    const ok = await loadSDK();
                    if (!ok) {
                        App.ui.showToast("Failed to load payment gateway SDK.", "error");
                        return;
                    }

                    const options = {
                        key: "rzp_live_SxuAK5B53kL3qS", // Set key
                        amount: priceInRupees * 100, // paise
                        currency: "INR",
                        name: "NoteKash Suite",
                        description: `Upgrade to ${tierName} League`,
                        image: "/favicon.ico",
                        notes: {
                            user_id: session.user.id,
                            tier: tierName
                        },
                        prefill: {
                            name: session.user.user_metadata?.full_name || '',
                            email: session.user.email
                        },
                        handler: async function(response) {
                            App.ui.showToast("Payment captured! Activating your membership...", "info");
                            
                            // Save to local storage for pending recovery in case of network drops
                            const pendingTx = {
                                payment_id: response.razorpay_payment_id,
                                tier: tierName,
                                user_id: session.user.id,
                                timestamp: Date.now()
                            };
                            try {
                                const currentPending = JSON.parse(localStorage.getItem('notekash_pending_transactions') || '[]');
                                currentPending.push(pendingTx);
                                localStorage.setItem('notekash_pending_transactions', JSON.stringify(currentPending));
                            } catch (err) {
                                console.warn("Failed to persist pending transaction locally:", err);
                            }

                            try {
                                const { data: { session: currentSession } } = await App.supabase.auth.getSession();
                                const activeSession = currentSession || session;
                                const supabaseUrl = 'https://axzwfwjgndqjajabvscd.supabase.co';
                                const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4endmd2pnbmRxamFqYWJ2c2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTAzNDksImV4cCI6MjA5OTg2NjM0OX0.6N2mFFDcQW9rwrbNHZyXpoldbZNX-0RripH5Web3y-U';
                                
                                const res = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${activeSession.access_token}`,
                                        'apikey': supabaseAnonKey
                                    },
                                    body: JSON.stringify({
                                        payment_id: response.razorpay_payment_id,
                                        tier: tierName
                                    })
                                });
                                const data = await res.json();
                                if (res.ok && data.success) {
                                    // Remove from pending storage on successful verification
                                    try {
                                        const currentPending = JSON.parse(localStorage.getItem('notekash_pending_transactions') || '[]');
                                        const filtered = currentPending.filter(t => t.payment_id !== response.razorpay_payment_id);
                                        if (filtered.length > 0) {
                                            localStorage.setItem('notekash_pending_transactions', JSON.stringify(filtered));
                                        } else {
                                            localStorage.removeItem('notekash_pending_transactions');
                                        }
                                    } catch (cleanupErr) {
                                        console.warn("Cleanup error:", cleanupErr);
                                    }

                                    App.ui.showToast(`🎉 ${data.message || 'Payment verified'}! Welcome to ${tierName} tier.`, "success");
                                    await App.license.loadState();
                                    App.ui.closeModal();
                                } else {
                                    App.ui.showToast(`Payment registered (${response.razorpay_payment_id}). Syncing status...`, "warning");
                                    console.error("Activation response:", data);
                                }
                            } catch (e) {
                                App.ui.showToast(`Payment received! Receipt: ${response.razorpay_payment_id}. We will auto-activate upon reconnect.`, "info");
                                console.error("Activation network error:", e);
                            }
                        },
                        theme: {
                            color: "#ff4500"
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                },

                closeAscensionModal() {
                    const modal = document.getElementById('ascension-modal-backdrop');
                    if (modal) modal.style.display = 'none';
                    App.ui.closeModal();
                },

                async renderArticleView(container, data) {
                    const { id, mode, articleObject, scrollToSnippetId, overrideContent, restoredScrollTop, isPreviewing } = data; // Added isPreviewing
                    let article = articleObject ? articleObject : App.storage.getArticle(id);

                    if (!article) { App.router.navigateTo('library'); return; }

                    // ... (keep the existing content loading logic here) ...
                    if (article.content === undefined && !articleObject && !overrideContent) {
                        const fullArticleData = App.state.storageMode === 'browser'
                            ? await App.browserStore.getArticle(article.id)
                            : await App.fs.read(`${article.id}.json`);
                        if (fullArticleData) {
                            Object.assign(article, fullArticleData);
                        } else {
                            App.ui.showToast(`Error: Could not load article content for ${article.title}.`, 'error');
                            App.router.navigateTo('library');
                            return;
                        }
                    }

                    App.state.activeArticleId = article.id;
                    App.state.currentMode = mode;
                    document.body.classList.remove('read-mode', 'write-mode');
                    document.body.classList.add(`${mode}-mode`);
                    if (App.settings.get('theme') === 'custom') { document.body.classList.add('image-theme-active'); }
                    App.ui.applyFontSettings();

                    const finalContent = overrideContent ?? article.content;

                    container.innerHTML = `<div class="article-view-wrapper">
                <div class="article-container ui-card">
                    <div class="article-tags-display"></div>
                    <input type="text" class="article-title-input" value="${App.util.escapeHtml(article.title)}" id="article-title" readonly>
                    <div class="article-metadata-bar">
                        <span id="word-count-display"></span>
                        <span id="creation-date-display"></span>
                    </div>
                    <hr class="title-divider">
                    <div id="article-content" spellcheck="false" data-placeholder="Start writing here..."></div>
                </div>
            </div>`;

                    // --- FIX: Apply the preview class if we are in a preview state ---
                    if (isPreviewing) {
                        const articleContainer = container.querySelector('.article-container');
                        if (articleContainer) {
                            articleContainer.classList.add('is-in-preview-mode');
                        }
                    }

                    // ... (The rest of the function remains identical) ...
                    this.updateArticleMetadata(finalContent, article.createdAt);
                    this.renderArticleControls(article);
                    this.updateArticleViewForMode({ ...article, content: finalContent });

                    if (typeof restoredScrollTop === 'number') {
                        setTimeout(() => {
                            const mainEl = document.querySelector('main');
                            if (mainEl) mainEl.scrollTop = restoredScrollTop;
                        }, 50);
                    }

                    if (scrollToSnippetId) {
                        setTimeout(() => {
                            let targetElement = document.getElementById(scrollToSnippetId);
                            // NEW: Check if it's a PDF pill
                            if (!targetElement && scrollToSnippetId.startsWith('pdf_')) {
                                targetElement = document.querySelector(`.pdf-attachment-pill[data-pdf-id="${scrollToSnippetId}"]`);
                            }
                            if (targetElement) {
                                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                targetElement.style.transition = 'background-color 0.5s, box-shadow 0.5s, border-color 0.5s';
                                targetElement.style.boxShadow = `0 0 15px 5px var(--hl-1-border)`;
                                targetElement.style.borderColor = 'var(--hl-1-border)'; // For PDF pills
                                setTimeout(() => { targetElement.style.boxShadow = ''; targetElement.style.borderColor = ''; }, 2500);
                            }
                        }, 100);
                    }

                    setTimeout(() => App.events.updateReadingProgress(), 100);
                    const contentDiv = document.getElementById('article-content');
                    if (contentDiv) {
                        contentDiv.querySelectorAll('canvas[data-chart-config]').forEach(canvas => {
                            App.ui.renderChartOnCanvas(canvas);
                        });
                    }

                    const wrapper = container.querySelector('.article-view-wrapper');
                    const controls = document.getElementById('article-controls');
                    if (wrapper && controls) {
                        wrapper.appendChild(controls);
                    }
                    this.applyReaderTheme();

                },


                updateArticleMetadata(content = '', createdAt = '') {
                    const wordCountEl = document.getElementById('word-count-display');
                    const dateEl = document.getElementById('creation-date-display');

                    if (wordCountEl) {
                        const words = App.util.calculateWordCount(content);
                        wordCountEl.textContent = `${words} words`;
                    }

                    if (dateEl && createdAt) {
                        const date = new Date(createdAt);
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };
                        dateEl.textContent = `Created on ${date.toLocaleDateString(undefined, options)}`;
                    }
                },

                updateArticleViewForMode(article) {
                    const titleInput = document.getElementById('article-title');
                    const contentDiv = document.getElementById('article-content');
                    const tagsContainer = document.querySelector('.article-tags-display');
                    const isWriteMode = App.state.currentMode === 'write';


                    titleInput.readOnly = !isWriteMode;
                    contentDiv.contentEditable = isWriteMode;

                    // --- OPTIMIZATION: Skip unnecessary re-renders in Read Mode ---
                    const currentMode = isWriteMode ? 'write' : 'read';

                    const contentHash = App.util.hashString(article.content + article.title + (article.attachments ? JSON.stringify(article.attachments) : ''));

                    if (!isWriteMode &&
                        contentDiv.dataset.renderMode === 'read' &&
                        contentDiv.dataset.renderHash === contentHash &&
                        contentDiv.innerHTML.trim() !== '') {
                        return;
                    }

                    // Update render state tracking
                    contentDiv.dataset.renderMode = currentMode;
                    contentDiv.dataset.renderHash = contentHash;
                    // -------------------------------------------------------------

                    if (isWriteMode) {
                        const normalizedWriteContent = App.util.normalizeRenderedClozeToTokens(article.content || '');
                        if (normalizedWriteContent !== article.content) {
                            article.content = normalizedWriteContent;
                            App.state.isArticleDirty = true;
                        }
                        contentDiv.innerHTML = normalizedWriteContent;
                        const isEffectivelyEmpty = normalizedWriteContent.trim() === '' || normalizedWriteContent.trim() === '<p><br></p>';
                        contentDiv.classList.toggle('is-empty', isEffectivelyEmpty);
                        contentDiv.setAttribute('data-placeholder', "Start writing... Use [[tags]] for Visual Map, ==keywords== for Highlights, or {{c1::cloze}} for flashcards or {{m1::sentence}} for Mind Maps (further m2, m3 for sub nodes).");

                        // Migration: Add resize handles to existing visual flashcards and image containers
                        setTimeout(() => {
                            contentDiv.querySelectorAll('.nk-visual-flashcard, .image-container').forEach(container => {
                                if (!container.querySelector('.resize-handle')) {
                                    const handle = document.createElement('div');
                                    handle.className = 'resize-handle resize-handle-se';
                                    container.appendChild(handle);
                                }
                            });
                        }, 10);

                        // RATIONALE (WRITE MODE): A short timeout is necessary here. The browser needs a moment
                        setTimeout(() => {
                            App.audio.initializePlayersIn(contentDiv);
                            App.util.initPlyr(contentDiv);
                        }, 50);

                        // FIX: Restore MCQ Editability in Write Mode
                        setTimeout(() => {
                            contentDiv.querySelectorAll('.nk-mcq-block').forEach(block => {
                                block.contentEditable = "false"; // Protect the container itself from being deleted easily
                                const editables = block.querySelectorAll('.nk-mcq-question, .nk-mcq-option-text, .nk-mcq-explanation, .nk-mcq-hint-content');
                                editables.forEach(el => el.contentEditable = "true");
                            });
                        }, 60);

                    } else {
                        let parsedContent = App.util.parseShortcuts(article.content);
                        let finalContent = App.util.renderClozeForDisplay(parsedContent);
                        finalContent = finalContent.replaceAll(' contenteditable="true"', '');
                        finalContent = finalContent.replaceAll(" contenteditable='true'", '');
                        // If the article has attachments, verify and render them
                        if (article.attachments) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = finalContent;
                            tempDiv.querySelectorAll('.pdf-attachment-pill[data-pdf-id]').forEach(pill => {
                                const attachment = article.attachments.find(a => a.id === pill.dataset.pdfId);
                                if (!attachment) {
                                    pill.outerHTML = '[Invalid PDF Attachment]';
                                }
                            });
                            finalContent = tempDiv.innerHTML;
                        }

                        contentDiv.innerHTML = App.util.sanitizeHTML(finalContent);

                        // RESET MCQ STATE: Remove previous answer states so users can re-interact with MCQs
                        contentDiv.querySelectorAll('.nk-mcq-block').forEach(mcqBlock => {
                            mcqBlock.removeAttribute('data-answered');
                            mcqBlock.removeAttribute('data-user-incorrect');
                            mcqBlock.querySelectorAll('.nk-mcq-option').forEach(option => {
                                option.classList.remove('correct', 'incorrect');
                            });
                        });

                        contentDiv.querySelectorAll('.nk-text-tile').forEach(tile => {
                            if (tile.textContent.trim() === '') {
                                App.util.unwrapNode(tile);
                            }
                        });

                        contentDiv.querySelectorAll('.nk-accordion').forEach(accordion => {
                            const hintEditor = accordion.querySelector('.nk-accordion-hint-editor');
                            if (hintEditor && (hintEditor.textContent.trim() || hintEditor.querySelector('.nk-accordion-hint-content')?.innerHTML.trim())) {
                                const hintBtn = accordion.querySelector('.nk-accordion-hint-btn');
                                if (hintBtn) hintBtn.style.display = 'flex';
                                hintEditor.style.display = 'none';
                            }
                        });

                        App.contentTools.autoSuggestTags(contentDiv);

                        App.audio.initializePlayersIn(contentDiv);
                        App.util.initPlyr(contentDiv);
                        App.util.renderMathInElement(contentDiv);

                        App.util.parseAllMcqMetadata();
                        if (App.state.currentMode === 'read') App.util.renderMcqCapsules();
                    }

                    const categoryObj = App.settings.get('userCategories').find(c => c.name === article.category) || { name: article.category, colorIndex: 0 };
                    const categoryPillHTML = `<span class="category-pill" style="background-color: ${App.util.getCategoryColor(categoryObj.colorIndex)}; cursor: pointer;" onclick="App.router.navigateTo('category', '${article.category}')">${App.util.getCategoryDisplayName(categoryObj.name)}</span>`;

                    const tagsHTML = (article.tags || []).map(tag => `<span class="tag-item" onclick="App.events.showTagModal('${tag}')">${App.state.tags[tag]?.displayName || tag}</span>`).join('');

                    tagsContainer.innerHTML = isWriteMode ? tagsHTML : categoryPillHTML + tagsHTML;
                },


                renderArticleControls(article) {
                    const controlsContainer = document.getElementById('article-controls');
                    if (!controlsContainer) return;

                    if (article.isDummy) {
                        controlsContainer.innerHTML = `
                    <div class="controls-wrapper" style="display: flex; justify-content: center; gap: 1rem;">
                        <button class="btn btn-primary btn-gradient-text tutorial-btn" style="font-weight: 700; border: 2px solid transparent; border-radius: var(--border-radius-lg); background-image: linear-gradient(90deg, #0d9488, #581c87, #be185d, #0d9488), linear-gradient(var(--bg-secondary), var(--bg-secondary)), linear-gradient(90deg, #0d9488, #581c87, #be185d, #0d9488); background-origin: border-box; background-clip: text, padding-box, border-box;" onclick="window.open('https://studyrecapped.com/general/the-official-notekash-guide-art-of-building-a-second-brain/', '_blank')">
                            📚 Tutorial
                        </button>
                        <button class="btn btn-primary btn-gradient-text tutorial-btn" style="font-weight: 700; border: 2px solid transparent; border-radius: var(--border-radius-lg); background-image: linear-gradient(90deg, #0d9488, #581c87, #be185d, #0d9488), linear-gradient(var(--bg-secondary), var(--bg-secondary)), linear-gradient(90deg, #0d9488, #581c87, #be185d, #0d9488); background-origin: border-box; background-clip: text, padding-box, border-box;" onclick="App.ui.showAscensionModal()">
                            💎 Unlock Pro
                        </button>
                    </div>
                `;
                        return;
                    }

                    const readCount = article.readCount || 0;
                    const progressColorVar = `var(${App.util.getReadProgressColorVar(readCount)})`;

                    const newHeartButtonHTML = `
                <button class="btn-icon"
                        id="unified-heart-btn" 
                        title="Click to advance read count (S).. Double-click to reset (SS)." 
                        aria-label="Mark as finished or reset count">
                    <svg width="28" height="28" viewBox="0 0 24 24" style="transform: scale(1.35);">
                        <defs>
                            <filter id="heart-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.2"/>
                            </filter>
                            <filter id="badge-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0.5" dy="1" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.35"/>
                            </filter>
                        </defs>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${progressColorVar}" style="pointer-events: none;" filter="url(#heart-shadow)"></path>
                        ${readCount > 0 ? `
                        <g transform="translate(18, 6.5)" style="pointer-events: none;" filter="url(#badge-shadow)">
                            <circle r="5.5" fill="#f8f9fa" stroke="${progressColorVar}" stroke-width="1"></circle>
                            <text x="0" y="0.5" text-anchor="middle" dominant-baseline="central" fill="${progressColorVar}" font-size="8px" font-weight="bold" font-family="var(--font-body)">
                                ${readCount}
                            </text>
                        </g>
                        ` : ''}
                    </svg>
                </button>
            `;

                    const categoryOptions = App.settings.get('userCategories').map(cat =>
                        `<option value="${cat.name}" ${article.category === cat.name ? 'selected' : ''}>${App.util.getCategoryDisplayName(cat.name)}</option>`
                    ).join('');

                    // --- NEW DYNAMIC BUTTON LOGIC (Enhanced Picker) ---
                    const textColors = ['text-red', 'text-green', 'text-blue', 'text-magenta', 'text-orange', 'text-teal', 'text-slate'];
                    const currentTextColorIndex = App.settings.get('textColorCycleIndex') || 0;
                    const colorToShowCssVar = `var(--${textColors[currentTextColorIndex]})`;

                    const colorOptionsHTML = textColors.map((color, index) => `
                        <div class="color-circle-btn ${index === currentTextColorIndex ? 'active' : ''}"
                             style="background-color: var(--${color})"
                             onmousedown="event.preventDefault()"
                             onclick="App.events.selectTextColor('${color}')"
                             title="${color.replace('text-', '')}">
                        </div>
                    `).join('');

                    const textColorButtonHTML = `
                <div class="color-picker-group" id="text-color-picker-group">
                    <button class="btn-icon" onmousedown="event.preventDefault()" onclick="App.events.toggleTextColorPopover(event)" title="Text Color Picker (Hover/Click)" aria-label="Text Color Picker">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="${colorToShowCssVar}" stroke="var(--border-color)" stroke-width="1.5"></circle>
                        </svg>
                    </button>
                    <div class="color-picker-popover" id="text-color-popover" onmousedown="event.preventDefault()" onclick="event.stopPropagation()">
                        ${colorOptionsHTML}
                    </div>
                </div>
            `;

                    const shareButtonHTML = navigator.share ? `
                <button class="btn-icon" data-action="shareArticle" title="Share Article">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
            ` : '';

                    controlsContainer.innerHTML = `
                <div class="controls-wrapper read-mode-controls" style="gap:6px; padding: 0 8px;">
                    <!-- 1. Category & Modes Popover (Left) -->
                    <div class="control-group-popover">
                        <button class="btn-icon" onclick="this.nextElementSibling.classList.toggle('show'); event.stopPropagation();" title="Category & Modes" aria-label="Category and modes">
                            ${App.util.icons.category}
                        </button>
                        <div class="popover-menu" style="min-width: auto; padding: 6px; gap: 4px; display: flex; flex-direction: column;">
                            <!-- A. Category View -->
                            <button class="btn-icon" onclick="App.router.navigateTo('category', { category: '${article.category || 'All'}', articleId: '${article.id}' })" title="Category View">
                                ${App.util.icons.list}
                            </button>
                            
                            <!-- B. Presentation Mode -->
                            <button class="btn-icon" onclick="App.events.enterFocusMode('${article.id}')" title="Presentation Mode">
                                ${App.util.icons.present}
                            </button>
                            
                            <!-- Pro Presenter Read Mode -->
                            <button class="btn-icon" 
                                onclick="App.events.enterProPresenterReadMode('${article.id}')" 
                                title="Pro Presenter (Premium)"
                                style="position: relative;">
                                ${App.util.icons.proPresent}
                                ${!App.license.isPremium() ? '<span style="position:absolute; top:-2px; right:-2px; font-size:10px;">👑</span>' : ''}
                            </button>
                            
                            <!-- C. Study Flashcards -->
                            <button class="btn-icon" onclick="const allCards = App.util.getAllFlashcards(); const articleCards = allCards.filter(c => c.articleId === '${article.id}'); if(articleCards.length) { App.events.study.start({ quizCards: articleCards, mode: 'custom' }); } else { App.ui.showToast('No flashcards in this article', 'info'); }" title="Study Article Flashcards">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7l10-5 10 5-10 5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 2. Cycle (Ambiance) - Left of Whiteboard -->
                    <button class="btn-icon" onclick="App.events.cycleReaderTheme()" oncontextmenu="event.preventDefault(); App.events.cycleReaderTheme(true)" ondblclick="event.preventDefault(); App.events.resetReaderTheme()" title="Cycle Ambiance (C, Right-click back, Double-click reset)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>
                    </button>

                    <!-- 3. Whiteboard (Left of Heart) -->
                     <button class="btn-icon" onclick="App.whiteboard.open('end')" title="Quick Sketch / Whiteboard" aria-label="Open whiteboard annotation">
                        <i class="fa-solid fa-pen-nib"></i>
                    </button>

                    <!-- 4. Heart (Center) -->
                    ${newHeartButtonHTML}

                    <!-- 5. Edit (Right of Heart) -->
                    <button class="btn-icon" data-action="switchToWrite" title="Edit Article (E)" aria-label="Edit article">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>

                    <!-- 6. Export Popover -->
                    <div class="control-group-popover">
                        <button class="btn-icon" id="export-popover-btn" title="Export Options" aria-label="Export options">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>
                        </button>
                        <div class="popover-menu">
                            <button class="btn-icon" data-action="copyHighlights" title="Copy Title &amp; Highlights">${App.util.icons.copy}</button>
                            <button class="btn-icon" data-action="exportHtml" title="Export as HTML File">${App.util.icons.html}</button>
                            ${shareButtonHTML}
                            <button class="btn-icon" data-action="exportNoteKash" title="Export as .notekash File">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                                </svg>
                            </button>
                            <button class="btn-icon" data-action="exportPdf" title="Export as PDF Document">${App.util.icons.pdfExport}</button>
                            <button class="btn-icon" data-action="printArticle" title="Print / Save PDF (Browser)" aria-label="Print or Save PDF">${App.util.icons.print}</button>
                            <button class="btn-icon" data-action="deleteArticle" title="Delete Article" aria-label="Delete article"><i class="fa-solid fa-trash-can" style="font-size: 17px; color: #ef4444;"></i></button>
                        </div>
                    </div>

                    <!-- 7. Immersive (Rightmost & Polished) -->
                    <button class="btn-icon" data-action="toggleFocusMode" title="Fullscreen Read Mode (F)" aria-label="Toggle fullscreen read mode">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M12 9a3 3 0 100 6 3 3 0 000-6z" />
                        </svg>
                    </button>
                </div>
                <div class="controls-wrapper write-mode-controls">
                    <!-- 1. Microphone -->
                    <button class="btn-icon" id="record-audio-btn" onclick="App.audio.toggleRecording()" title="Start/Stop Recording" aria-label="Start or stop audio recording">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    </button>

                    <!-- 2. AI Flash -->
                    <button class="btn-icon" onclick="App.events.openCommandPaletteFromButton()" title="Open Command Palette (/)" aria-label="Open command palette">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"/></svg>
                    </button>

                    <!-- 3. Color Circle -->
                    ${textColorButtonHTML}

                    <!-- 4. Insert Group (Table, Accordion, Gallery) -->
                    <div class="insert-toolbar-group" id="insert-group">
                        <button class="btn-icon" title="Insert Items" aria-label="Insert items">
                            <i class="fa-solid fa-layer-group" style="font-size: 18px;"></i>
                        </button>
                        <div class="insert-popover">
                            
                            <button class="btn-icon" title="Find in Article (Ctrl+F)" onmousedown="event.preventDefault()" onclick="App.find.open()" aria-label="Find in article" id="insert-find-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            </button>
                            <button class="btn-icon" title="Manage Table" data-action="manageTable" onmousedown="event.preventDefault()" aria-label="Insert or modify table">${App.util.icons.table}</button>
                            <button class="btn-icon" title="Insert Accordion Card" data-action="insertAccordion" onmousedown="event.preventDefault()" aria-label="Insert accordion card">${App.util.icons.accordion}</button>
                            <button class="btn-icon" title="Insert Image from Gallery" onmousedown="event.preventDefault()" onclick="document.getElementById('write-mode-image-input').click()" aria-label="Insert image from gallery">${App.util.icons.image}</button>
                            <button class="btn-icon" title="Import PDF" onmousedown="event.preventDefault()" onclick="App.pdf.triggerImport()" aria-label="Import PDF">${App.util.icons.pdf}</button>
                            
                            <button class="btn-icon" title="Whiteboard / Sketch" onmousedown="event.preventDefault()" onclick="App.whiteboard.open('cursor')" aria-label="Open whiteboard sketch">
                                <i class="fa-solid fa-pen-nib" style="font-size:17px;"></i>
                            </button>
                            <button class="btn-icon" data-action="toggleFocusMode" title="Focus Mode" onmousedown="event.preventDefault()" aria-label="Toggle focus mode">${App.util.icons.pen}</button>
                           
                            
                        </div>
                    </div>
                    <input type="file" id="write-mode-image-input" accept="image/*" style="display:none" onchange="App.events.handleWriteModeImageUpload(event)">

                    <!-- Divider -->
                    <div class="control-divider"></div>

                    <!-- 6. Save/Read (Brown Bookmark Circle - Masterpiece) -->
                    <button class="btn-icon btn-save-circle" data-action="saveAndRead" title="Done Editing (Finish & Read)" aria-label="Save and switch to read mode">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"> <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/> </svg>
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                    
                    <!-- 7. Category Selector -->
                    <div class="category-select-wrapper">
                        <select id="category-selector" class="category-pill-select" aria-label="Select article category">${categoryOptions}</select>
                    </div>

                    <!-- 8. Trash -->
                    <button class="btn-icon" data-action="deleteArticle" title="Delete Article" aria-label="Delete article"><i class="fa-solid fa-trash-can" style="font-size: 17px;"></i></button>

                    <!-- Divider -->
                    <div class="control-divider"></div>

                    <!-- 9. List Group -->
                    <div class="list-toolbar-group" id="list-group">
                        <button class="btn-icon" title="List Styles" aria-label="List formatting options"><i class="fa-solid fa-list-check" style="font-size: 17px;"></i></button>
                        <div class="list-popover">
                            <button class="btn-icon" title="Bulleted List" data-action="execCommand" data-value="insertUnorderedList" onmousedown="event.preventDefault()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg></button>
                            <button class="btn-icon" title="Numbered List (1,2,3)" data-action="execCommand" data-value="insertOrderedList" onmousedown="event.preventDefault()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 1.222V2.5h1V.5H.5v.722zM1.354 4.08V3.34h-.843v.74h.843zM1.354 5.21V4.47h-.843v.74h.843zm.353 1.63h-.843V6.1h.843v.74zm-.002 1.144h-.843v.74h.843v-.74zM1.354 9.17V8.43h-.843v.74h.843zm.353 1.63h-.843v-.74h.843v.74zm0 1.144h-.843v.74h.843v-.74z"/><path d="M5.5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM5.5 7.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/></svg></button>
                            <button class="btn-icon" title="Lettered List (a,b,c)" data-action="applyListStyle" data-value="ordered-alpha" onmousedown="event.preventDefault()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.286 14H3.945L1.81 7.643h1.39l1.412 4.158h.053l1.412-4.158h1.39L5.286 14zM13.385 7.643h-1.39L10.58 4h1.42l1.385 3.643zM11.95 5.07c.053.15.1.32.14.51h.053c.04-.19.087-.36.14-.51L12.89 3.5h-1.8L11.95 5.07zM12 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0-1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg></button>
                            <button class="btn-icon" title="Triangle Bullet" data-action="applyListStyle" data-value="bullet-triangle" onmousedown="event.preventDefault()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m13.142 8.285-9.428 5.443a.5.5 0 0 1-.715-.434V2.706a.5.5 0 0 1 .715-.434l9.428 5.443a.5.5 0 0 1 0 .868z"/></svg></button>
                            <button class="btn-icon" title="Circle Bullet" data-action="applyListStyle" data-value="bullet-empty-circle" onmousedown="event.preventDefault()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg></button>
                            <button class="btn-icon" title="Square Bullet" data-action="applyListStyle" data-value="bullet-square" onmousedown="event.preventDefault()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z"/></svg></button>
                        </div>
                    </div>

                    <!-- 10. Format Group (Restored Paragraph Icon) -->
                    <div class="format-toolbar-group" id="format-group">
                        <button class="btn-icon" title="Text Formatting" aria-label="Text formatting options">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"></path><path d="M17 4v16"></path><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"></path></svg>
                        </button>
                        <div class="format-popover" id="format-popover">
                                <button class="btn-icon" title="Bold (Cmd/Ctrl+B)" data-action="execCommand" data-value="bold" onmousedown="event.preventDefault()" aria-label="Bold text"><b>B</b></button>
                                <button class="btn-icon" title="Italic (Cmd/Ctrl+I)" data-action="execCommand" data-value="italic" onmousedown="event.preventDefault()" aria-label="Italicize text"><i>I</i></button>
                                <button class="btn-icon" title="Underline (Cmd/Ctrl+U)" data-action="execCommand" data-value="underline" onmousedown="event.preventDefault()" aria-label="Underline text"><u>U</u></button>
                                <button class="btn-icon" title="Insert Checkbox" data-action="insertCheckbox" onmousedown="event.preventDefault()" aria-label="Insert Checkbox"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><polyline points="9 11 12 14 22 4"></polyline></svg></button>
                                <button class="btn-icon" title="Mind Map Node (Cmd/Ctrl+Shift+M)" onmousedown="event.preventDefault(); App.events.wrapMindMapNode()" aria-label="Create Mind Map Node"><i class="fa-solid fa-sitemap"></i></button>
                        </div>
                    </div>

                    </div>
                </div>
            `;
                    if (App.audio.isRecording) {
                        const recordBtn = controlsContainer.querySelector('#record-audio-btn');
                        if (recordBtn) recordBtn.classList.add('is-recording');
                    }
                    const heartButton = controlsContainer.querySelector('#unified-heart-btn');
                    if (heartButton) {
                        let clickTimer = null;

                        heartButton.addEventListener('click', () => {
                            clearTimeout(clickTimer);
                            clickTimer = setTimeout(() => {
                                App.events.finishArticle();
                            }, 450);
                        });

                        heartButton.addEventListener('dblclick', () => {
                            clearTimeout(clickTimer);
                            App.events.resetReadCount();
                        });
                        heartButton.addEventListener('contextmenu', (event) => {
                            event.preventDefault();
                        });
                    }
                },

                renderCategoryView(container, data) {
                    const category = (typeof data === 'string' ? data : (data?.category || 'All')) || 'All';
                    const articleIdToFocus = typeof data === 'object' ? data?.articleId : null;
                    const isAllCategory = category === 'All';
                    const layoutMode = App.settings.get('categoryLayout') || 'list';
                    const highlightsVisible = App.settings.get('categoryHighlightsVisible') !== false;
                    const sortBy = App.settings.get('categorySortBy') || 'updatedAt';

                    const sortedArticles = App.services.export.getSortedArticlesForCategory(category);

                    if (layoutMode === 'timeline') {
                        if (sortBy === 'updatedAt') {
                            sortedArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        } else {
                            sortedArticles.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                        }
                    }

                    // OPTIMIZATION: Fast Filter using String Search instead of full DOM parsing
                    const articlesToRender = sortedArticles.filter(article => {
                        const c = article.content || '';
                        return c.includes('highlight-') || c.includes('==') || c.includes('nk-mcq') || c.includes('nk-timeline');
                    });

                    // Store rendering state for Virtualization
                    App.state.categoryRender = {
                        articles: articlesToRender, // Raw articles, snippets extract JIT
                        currentIndex: 0,
                        layoutMode,
                        isRendering: true
                    };

                    const userCategoryObjects = App.settings.get('userCategories') || [];
                    const nameStyle = App.settings.get('categoryNameStyle') || 'full';
                    const allCategoryNames = ['All', ...userCategoryObjects.map(c => c.name)];

                    const categoryChipsHTML = allCategoryNames.map(catName => {
                        const isActive = category === catName;
                        let buttonText;
                        const fullDisplayName = App.util.getCategoryDisplayName(catName);
                        if (catName === 'All') {
                            buttonText = 'All';
                        } else {
                            buttonText = (nameStyle === 'full') ? fullDisplayName : fullDisplayName.substring(0, 4);
                        }

                        const titleText = (catName === 'All') ? 'All Snippets' : fullDisplayName;
                        const categoryObj = userCategoryObjects.find(c => c.name === catName);
                        const colorIndex = categoryObj ? categoryObj.colorIndex : 0;

                        const style = catName === 'All'
                            ? ''
                            : `style="background-color: var(--cat-color-${colorIndex}-bg); color: var(--category-pill-text);"`;

                        return `<button class="category-chip ${isActive ? 'active' : ''} ${catName === 'All' ? 'category-action-btn action-primary' : ''}" ${style} data-category="${App.util.escapeHtml(catName)}" onclick="App.events.changeSnippetCategory('${App.util.escapeHtml(catName)}')" title="${titleText}">${buttonText}</button>`;
                    }).join('');

                    const emptyStateTitle = isAllCategory ? 'No Highlights in Your Library' : `No Highlights in ${App.util.getCategoryDisplayName(category)}`;
                    const emptyStateDesc = isAllCategory 
                        ? 'Use ==highlights== or color highlighters in your notes to collect key takeaways here.' 
                        : `Highlight key concepts in your ${App.util.getCategoryDisplayName(category)} notes to collect them here.`;

                    container.innerHTML = `
            <div class="category-view-container ${!highlightsVisible ? 'hide-snippet-colors' : ''} ${layoutMode === 'grid' ? 'grid-mode-active' : ''}" data-category="${category}">
                <div class="category-controls-hub">
                    <h2 style="margin:0;">${isAllCategory ? 'All Snippets' : `Category: ${App.util.getCategoryDisplayName(category)}`}</h2>
                    <div class="category-controls-group">
                        <button class="btn-icon" title="Present Category" onclick="App.events.enterFocusModeForCategory('${category}')">
                            ${App.util.icons.present}
                        </button>
                        <div class="layout-toggle-btn">
                            <button class="btn-icon ${layoutMode === 'list' ? 'active' : ''}" id="layout-btn-list" title="List View"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg></button>
                            <button class="btn-icon ${layoutMode === 'grid' ? 'active' : ''}" id="layout-btn-grid" title="Grid View"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25H15.75A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H15.75A2.25 2.25 0 0113.5 18v-2.25z" /></svg></button>
                            <button class="btn-icon ${layoutMode === 'timeline' ? 'active' : ''}" id="layout-btn-timeline" title="Timeline View"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg></button>
                        </div>
                        <select id="category-sort-filter" class="btn btn-secondary" aria-label="Sort snippets by">
                            <option value="updatedAt">Last Created</option>
                            <option value="createdAt">First Created</option>
                            <option value="read">Read</option>
                            <option value="unread">Unread</option>
                            <option value="random">Random</option>
                        </select>
                        <div class="toggle-switch" id="highlight-toggle" title="Toggle Highlight Colors"></div>
                        <div class="export-dropdown-container">
                            <button class="btn btn-primary" onclick="this.nextElementSibling.classList.toggle('show'); event.stopPropagation();">Export</button>
                            <div class="export-dropdown-menu">
                                <button class="btn btn-secondary" onclick="App.services.export.copyCategoryContent('${category}')">Copy Text</button>
                                <button class="btn btn-secondary" onclick="App.services.export.copyCategoryContentAsMarkdown('${category}')">Copy MD</button>
                                <button class="btn btn-secondary ${!App.license.isPremium() ? 'premium-feature-locked' : ''}" onclick="if(App.license.isPremium()) App.services.export.categoryAsText('${category}'); else App.ui.showAscensionModal('export_txt');">.TXT</button>
                                <button class="btn btn-secondary ${!App.license.isPremium() ? 'premium-feature-locked' : ''}" onclick="if(App.license.isPremium()) App.services.export.exportCategoryAsHtml('${category}'); else App.ui.showAscensionModal('export_html');">.HTML</button>
                                <button class="btn btn-secondary" onclick="App.ui.showExportBrandModal((bn,bl) => App.services.export.categoryAsPdf('${category}', bn, bl), 'PDF')">PDF Output</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="category-filters" style="width: 100%; margin: 6px 0 16px 0;">${categoryChipsHTML}</div>
                <div class="sectional-card-container ${layoutMode === 'timeline' ? 'is-timeline' : ''}" id="category-card-container">
                    ${articlesToRender.length === 0 ? `<div class="empty-state" style="grid-column: 1 / -1;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg><h3>${emptyStateTitle}</h3><p>${emptyStateDesc}</p></div>` : ''}
                </div>
                <!-- Sentinel for Infinite Scroll -->
                <div id="category-sentinel" style="height: 20px; width: 100%; margin-top: 20px;"></div>
            </div>`;

                    if (articlesToRender.length > 0) {
                        let initialBatchCount = 10;
                        if (articleIdToFocus) {
                            const targetIndex = articlesToRender.findIndex(a => a.id === articleIdToFocus);
                            if (targetIndex >= 0) {
                                initialBatchCount = targetIndex + 5;
                            }
                        }

                        this.renderCategoryBatch(initialBatchCount);

                        // FIXED: Restore scroll-to-article functionality with visual highlight
                        if (articleIdToFocus) {
                            setTimeout(() => {
                                const targetCard = document.getElementById(`summary-${articleIdToFocus}`);
                                if (targetCard) {
                                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Visual highlight pulse
                                    targetCard.classList.add('pulse-highlight');
                                    targetCard.style.transition = 'box-shadow 0.5s ease, transform 0.3s ease';
                                    const originalTransform = targetCard.style.transform;
                                    targetCard.style.transform = 'scale(1.02)';
                                    targetCard.style.boxShadow = '0 0 0 3px var(--primary-color, #d4a373)';
                                    setTimeout(() => {
                                        targetCard.style.boxShadow = '';
                                        targetCard.style.transform = originalTransform;
                                        targetCard.classList.remove('pulse-highlight');
                                    }, 2000);
                                }
                            }, 150);
                        }

                        const sentinel = document.getElementById('category-sentinel');
                        if (sentinel) {
                            if (App.state.categoryObserver) App.state.categoryObserver.disconnect();
                            App.state.categoryObserver = new IntersectionObserver((entries) => {
                                if (entries[0].isIntersecting && App.state.categoryRender.currentIndex < App.state.categoryRender.articles.length) {
                                    this.renderCategoryBatch(10); // Render next 10
                                }
                            }, { rootMargin: '400px' });
                            App.state.categoryObserver.observe(sentinel);
                        }
                    }

                    document.getElementById('category-sort-filter').value = sortBy;
                    document.getElementById('category-sort-filter').addEventListener('change', (e) => App.events.changeCategorySort(e, category));

                    const highlightToggle = document.getElementById('highlight-toggle');
                    highlightToggle.addEventListener('click', App.events.toggleCategoryHighlights);
                    const isHiding = container.classList.contains('hide-snippet-colors');
                    highlightToggle.classList.toggle('active', !isHiding);

                    document.getElementById('layout-btn-list').addEventListener('click', () => App.events.setCategoryLayout('list'));
                    document.getElementById('layout-btn-grid').addEventListener('click', () => App.events.setCategoryLayout('grid'));
                    document.getElementById('layout-btn-timeline').addEventListener('click', () => App.events.setCategoryLayout('timeline'));

                    document.addEventListener('click', (e) => {
                        const dropdown = document.querySelector('.export-dropdown-menu');
                        if (dropdown && dropdown.classList.contains('show') && !e.target.closest('.export-dropdown-container')) {
                            dropdown.classList.remove('show');
                        }
                    }, { once: true });

                    if (articleIdToFocus) {
                        setTimeout(() => {
                            const targetCard = document.getElementById(`summary-${articleIdToFocus}`);
                            if (targetCard) {
                                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                targetCard.style.transition = 'box-shadow 0.5s ease-in-out';
                                targetCard.style.boxShadow = `0 0 20px 5px var(--primary-color)`;
                                setTimeout(() => { targetCard.style.boxShadow = ''; }, 2500);
                            }
                        }, 100);
                    }
                },

                renderCategoryBatch(targetCount = 10) {
                    const container = document.getElementById('category-card-container');
                    if (!container) return;

                    const state = App.state.categoryRender;
                    if (!state || !state.articles || state.currentIndex >= state.articles.length) return;
                    if (state.isBatchLoading) return;
                    state.isBatchLoading = true;

                    let html = '';
                    let renderedCount = 0;

                    const buildSectionalCardHTML = (article) => {
                        // JIT Snippet Extraction
                        if (!article.snippets) {
                            let snippets = App.util.extractSnippets(article, ['highlight', 'mcq', 'blocks', 'cloze'], true);
                            snippets = snippets.filter(s => !s.html.includes('class="rendered-tag"'));
                            article.snippets = snippets;
                        }

                        if (!article.snippets || article.snippets.length === 0) return '';

                        const displaySnippets = article.snippets.filter(s => s.type === 'snippet');
                        if (displaySnippets.length === 0) return '';

                        const snippetHTML = displaySnippets.map(s => `<div class="snippet" style="cursor: pointer;" onclick="App.router.navigateTo('article', {id: '${s.articleId}', mode: 'read', scrollToSnippetId: '${s.id}'})">${s.html}</div>`).join('');

                        return `<div class="sectional-card-header">
                                <h3 class="sectional-card-title" onclick="App.router.navigateTo('article', {id: '${article.id}', mode: 'read'})">${App.util.escapeHtml(article.title)}</h3>
                                <div class="category-controls-group">
                                    <button class="btn-icon" title="Present Article" onclick="App.events.enterFocusMode('${article.id}')">
                                        ${App.util.icons.present}
                                    </button>
                                </div>
                            </div>
                            <div class="sectional-card-body">${snippetHTML}</div>`;
                    };

                    while (state.currentIndex < state.articles.length && renderedCount < targetCount) {
                        const article = state.articles[state.currentIndex];
                        state.currentIndex++;

                        const cardContent = buildSectionalCardHTML(article);
                        if (cardContent) {
                            renderedCount++;
                            if (state.layoutMode === 'timeline') {
                                const formattedDate = new Date(article.createdAt || Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                                html += `<div class="timeline-entry">
                                    <div class="timeline-marker">
                                        <div class="timeline-date">${formattedDate}</div>
                                    </div>
                                    <div class="sectional-card" id="summary-${article.id}">
                                        ${cardContent}
                                    </div>
                                </div>`;
                            } else {
                                html += `<div class="sectional-card" id="summary-${article.id}">${cardContent}</div>`;
                            }
                        }
                    }

                    if (html) {
                        container.insertAdjacentHTML('beforeend', html);
                    }

                    state.isBatchLoading = false;

                    // If all articles have been processed, disconnect observer
                    if (state.currentIndex >= state.articles.length && App.state.categoryObserver) {
                        App.state.categoryObserver.disconnect();
                    }
                },

                renderTagsView(container) {
                    const sortBy = App.settings.get('tagSortBy');

                    container.innerHTML = `
                <div class="tags-view-container ui-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; flex-wrap: wrap; gap: 1rem;">
                        <div class="search-bar-container" style="flex-basis: 300px; flex-grow: 1;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                            <input type="text" id="tag-search-input" placeholder="Search tags..." aria-label="Search tags">
                        </div>
                        <select id="tag-sort-filter" class="btn btn-secondary" aria-label="Sort tags by">
                            <option value="alpha" ${sortBy === 'alpha' ? 'selected' : ''}>Alphabetical</option>
                            <option value="date-new" ${sortBy === 'date-new' ? 'selected' : ''}>Newest</option>
                            <option value="date-old" ${sortBy === 'date-old' ? 'selected' : ''}>Oldest</option>
                            <option value="random" ${sortBy === 'random' ? 'selected' : ''}>Random</option>
                        </select>
                    </div>
                    <div id="tag-cloud-container"></div>
                </div>`;
                    App.events.filterAndRenderTags();
                },

                renderFlashcardView(container) {
                    const category = App.settings.get('flashcardCategory') || 'All';
                    const sortBy = App.settings.get('flashcardSortBy');

                    const nameStyle = App.settings.get('categoryNameStyle') || 'full';

                    const userCategories = App.settings.get('userCategories');
                    const allCategoryNames = ['All', ...userCategories.map(c => c.name)];

                    const categoryChips = allCategoryNames.map(catName => {
                        const isActive = category === catName;
                        let buttonText;
                        const fullDisplayName = App.util.getCategoryDisplayName(catName);
                        if (catName === 'All') {
                            buttonText = 'All';
                        } else {
                            buttonText = (nameStyle === 'full') ? fullDisplayName : fullDisplayName.substring(0, 4);
                        }

                        const titleText = (catName === 'All') ? 'All' : fullDisplayName;
                        const categoryObj = userCategories.find(c => c.name === catName);
                        const colorIndex = categoryObj ? categoryObj.colorIndex : 0;

                        const style = catName === 'All'
                            ? ''
                            : `style="background-color: var(--cat-color-${colorIndex}-bg); color: var(--category-pill-text);"`;

                        return `<button class="btn category-chip ${isActive ? 'active' : ''}" ${style} onclick="App.events.changeFlashcardCategory('${catName}')" title="${titleText}">${buttonText}</button>`;
                    }).join('');

                    container.innerHTML = `
                <div class="flashcard-view-header">
                    <div style="display: flex; align-items: stretch; gap: 0.75rem; flex-wrap: wrap; width: 100%;">
                        <div style="display: flex; align-items: stretch; ">
                            <button class="btn btn-primary" onclick="App.events.study.start()">Study Session</button>
                        </div>
                        <button class="btn btn-secondary" onclick="App.events.study.start({ mode: 'allDue' })" title="Study ALL due cards without a limit">S-Due Cards</button>
                        <button class="btn btn-secondary" onclick="App.events.study.start({ mode: 'mcqOnly' })" title="Study only Multiple-Choice Questions from this deck">S-MCQ</button>
                        <button class="btn btn-primary btn-quiz" onclick="App.quiz.start()">Recall Quiz</button>
                        <button class="btn btn-primary btn-quiz" onclick="App.quiz.start({ mode: 'mcq' })">MCQ Quiz</button>
                        <button class="btn btn-danger" onclick="App.events.resetFilteredFlashcardsConfirmation()" title="Reset progress for all cards in the current filter">Reset</button>
                        <button class="btn-icon" onclick="App.ui.showFlashcardSettingsModal()" title="Flashcard Settings">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1 0 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105 0l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.31-.17a1.464 1.464 0 0 1 2.105-.872l-.1-.34c.413-1.4 2.397-1.4 2.81 0l.1.34a1.464 1.464 0 0 1 2.105.872l.31.17c1.283.698-2.686-.705-1.987-1.987l-.169-.311a1.464 1.464 0 0 1 0-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105 0l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.31.17a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>
                        </button>
                    </div>
                    <div class="category-filters" style="width: 100%;">${categoryChips}</div>
                </div>
                <div style="display:flex; gap: 1rem; align-items:center; margin-bottom: 1.5rem;">
                    <div class="search-bar-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <input type="text" id="flashcard-search-input" placeholder="Search flashcards (Press 'S' to focus)..." aria-label="Search flashcards">
                    </div>
                    <select id="flashcard-sort" class="btn btn-secondary" aria-label="Sort flashcards by">
                        <option value="sm2" ${sortBy === 'sm2' ? 'selected' : ''}>Sort by SRS</option>
                        <option value="mcq" ${sortBy === 'mcq' ? 'selected' : ''}>Sort by MCQ</option>
                        <option value="random" ${sortBy === 'random' ? 'selected' : ''}>Sort by Random</option>
                        <option value="createdAt-desc" ${sortBy === 'createdAt-desc' ? 'selected' : ''}>Sort by Newest</option>
                        <option value="createdAt-asc" ${sortBy === 'createdAt-asc' ? 'selected' : ''}>Sort by Oldest</option>
                        <option value="read" ${sortBy === 'read' ? 'selected' : ''}>Sort by Read</option>
                        <option value="unread" ${sortBy === 'unread' ? 'selected' : ''}>Sort by Unread</option>
                        <option value="leeches" ${sortBy === 'leeches' ? 'selected' : ''}>Sort by Leeches</option>
                    </select>
                    <div class="export-dropdown-container">
                        <button class="btn btn-primary" onclick="this.nextElementSibling.classList.toggle('show'); event.stopPropagation();">Export</button>
                        <div class="export-dropdown-menu">
                                <button class="btn btn-secondary" style="width:100%;" onclick="if(App.license.isPremium()) App.services.export.exportFlashcardsAsTsv(); else { App.ui.showAscensionModal(); this.parentElement.parentElement.classList.remove('show'); }">.TSV (Anki)</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flashcard-grid" id="flashcard-grid"></div>
            `;
                    this.filterAndRenderFlashcards();
                },


                filterAndRenderFlashcards() {
                    const grid = document.getElementById('flashcard-grid');
                    if (!grid) return;

                    const searchTerm = document.getElementById('flashcard-search-input')?.value || '';
                    let filteredFlashcards = App.util.getSortedFlashcardsForDisplay(searchTerm);

                    const isPremium = App.license.isPremium();
                    const flashcardLimit = App.config.sparkTierLimit;
                    const totalFlashcards = App.util.getAllFlashcards().length;

                    if (!isPremium) {
                        // If the user is not premium, ALWAYS add the upsell tile first.
                        filteredFlashcards.unshift({
                            type: 'premium-upsell-tile',
                            used: totalFlashcards,
                            limit: flashcardLimit
                        });

                        // Then, slice the array of actual flashcards to enforce the limit.
                        filteredFlashcards = filteredFlashcards.slice(0, flashcardLimit + 1); // +1 to keep the upsell tile
                    }

                    if (filteredFlashcards.length === 0) {
                        grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg><h3>No Flashcards Found</h3><p>Create flashcards using {{c1::your text}} or accordions in an article.</p></div>`;
                    } else {
                        grid.innerHTML = filteredFlashcards.map(this.getFlashcardTileHTML).join('');
                    }

                    const visibleCards = Array.from(grid.querySelectorAll('.flashcard-tile'));
                    const isSearching = searchTerm.trim() !== '';

                    visibleCards.forEach(card => card.classList.toggle('search-highlight-card', isSearching));
                    document.querySelectorAll('.flashcard-tile.search-selected-card').forEach(c => c.classList.remove('search-selected-card'));

                    App.state.flashcardRender.searchResults = isSearching ? visibleCards : [];
                    App.state.flashcardRender.selectedIndex = -1;

                    if (isSearching && visibleCards.length > 0) {
                        App.state.flashcardRender.selectedIndex = 0;
                        visibleCards[0].classList.add('search-selected-card');
                    }
                },


                getFlashcardTileHTML(flashcard) {
                    if (flashcard.type === 'premium-upsell-tile') {
                        const actualUsed = flashcard.used;
                        const limit = flashcard.limit;
                        const displayUsed = Math.min(actualUsed, limit);
                        const percentageUsed = Math.min(100, Math.round((actualUsed / limit) * 100));

                        return `
                    <div class="flashcard-tile premium-upsell-tile" onclick="App.ui.showAscensionModal()">
                        <div class="upsell-badge">✨ Spark Tier</div>
                        <div class="upsell-content">
                            <h4>Unlock Unlimited Cards</h4>
                            <p>Quota used: <strong>${percentageUsed}%</strong> <i> (${displayUsed} of ${limit} flashcards) </i>. Go Premium to Go Unlimited!</p>
                            <div class="upsell-progress-bar">
                                <div class="upsell-progress" style="width: ${percentageUsed}%;"></div>
                            </div>
                        </div>
                        <div class="upsell-cta">Go Premium</div>
                    </div>`;
                    }

                    const color = App.util.sm2.getRatingColor(flashcard.rating);
                    let cardFront, cardBack;

                    // ✨ NEW: Leech indicator logic.
                    const leechIndicator = (flashcard.lapses || 0) >= App.config.sm2.leechThreshold
                        ? '<span title="Leech Card: This card is difficult for you. Consider rephrasing it." style="cursor: help;">🩸</span> '
                        : '';

                    if (flashcard.type === 'collapsible') {
                        const reversibleIndicator = flashcard.isReversed ? `<span class="reversible-indicator" title="Reversible Card (Answer Side)">${App.util.icons.reversible}</span>` : '';
                        cardFront = leechIndicator + flashcard.frontText + reversibleIndicator;
                        cardBack = flashcard.backText;
                    } else if (flashcard.type === 'mcq') {
                        cardFront = leechIndicator + flashcard.question;
                        const correctOption = flashcard.options.find(opt => opt.isCorrect);
                        const answerText = correctOption ? correctOption.text : 'N/A';
                        let explanationHTML = '';
                        if (flashcard.explanation) {
                            explanationHTML = `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 0.85em; color: var(--text-secondary);">${flashcard.explanation}</div>`;
                        }
                        cardBack = `<p><b>Correct:</b> ${answerText}</p>${explanationHTML}`;
                    } else if (flashcard.type === 'image-occlusion') {
                        // Image Occlusion: show front (with tape) and back (revealed)
                        const occlusionIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor"/><rect x="13" y="13" width="4" height="4" rx="1" fill="currentColor"/></svg>`;
                        cardFront = `${leechIndicator}<div class="vfc-tile-image"><img src="${flashcard.frontImage}" alt="Question" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain;"></div><span class="vfc-badge" title="Image Occlusion Card">${occlusionIcon}</span>`;
                        cardBack = `<div class="vfc-tile-image"><img src="${flashcard.backImage}" alt="Answer" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain;"></div>`;
                    } else { // Default to legacy cloze
                        const parsedFullText = App.util.parseShortcuts(flashcard.fullText);
                        // FIX: Updated regex to [\s\S]*?
                        // FIX: Safe Regex with Negative Lookahead to prevent runaway matching
                        cardFront = leechIndicator + parsedFullText.replace(/{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g, '<strong class="cloze-hidden">[……?]</strong>');
                        cardBack = parsedFullText.replace(/{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g, '<span class="cloze-revealed-wrapper"><strong class="cloze-revealed">$1</strong></span>');
                    }

                    let reviewInfo = 'New Card';
                    if (flashcard.nextReviewDue) {
                        const nextDate = new Date(flashcard.nextReviewDue);
                        const now = new Date();
                        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                        if (nextDate > now) {
                            reviewInfo = `Next: ${nextDate.toLocaleString('en-GB', options)}`;
                        } else {
                            reviewInfo = 'Review Due!';
                        }
                    }

                    return `
                <div class="flashcard-tile" style="border-left-color: ${color};" 
                    onclick="this.classList.toggle('is-flipped')" 
                    oncontextmenu="App.events.flashcardContextMenu(event, '${flashcard.id}')"
                    title="Click to flip, right-click for options">
                    <div class="flashcard-tile-flipper">
                        <div class="flashcard-tile-face flashcard-tile-front">
                            <div class="flashcard-tile-content">${cardFront}</div>
                            <div class="flashcard-tile-footer">
                                <button class="btn-icon" title="Go to Source Article" onclick="event.stopPropagation(); App.router.navigateTo('article', {id: '${flashcard.articleId}', mode: 'read'})">${App.util.icons.article}</button>
                                <button class="btn-icon" title="Delete Card" onclick="event.stopPropagation(); App.events.deleteFlashcardConfirmation('${flashcard.id}')">${App.util.icons.trash}</button>
                                <button class="btn-icon" title="Reset Card Progress" onclick="event.stopPropagation(); App.events.resetFlashcard('${flashcard.id}')">${App.util.icons.reset}</button>
                                <button class="btn-icon" title="Review 1 Day Earlier" onclick="event.stopPropagation(); App.events.nudgeReviewDate('${flashcard.id}', -1)">${App.util.icons.minus}</button>
                                <button class="btn-icon" title="Review 1 Day Later" onclick="event.stopPropagation(); App.events.nudgeReviewDate('${flashcard.id}', 1)">${App.util.icons.plus}</button>
                            </div>
                        </div>
                        <div class="flashcard-tile-face flashcard-tile-back">
                            <div class="flashcard-tile-content">${cardBack}</div>
                            <div class="flashcard-tile-footer" style="justify-content:flex-end;">
                                <small>${reviewInfo}</small>
                            </div>
                        </div>
                    </div>
                </div>`;
                },

                renderStudyView(session) {
                    const container = document.getElementById('study-view-container');
                    document.documentElement.style.setProperty('--study-card-font-size', App.settings.get('studyCardFontSize') || '1.6rem');
                    if (!session.isActive || session.cards.length === 0) {
                        container.innerHTML = '';
                        document.body.classList.remove('study-mode-active', 'read-mode');
                        return;
                    }
                    document.body.classList.add('study-mode-active', 'read-mode');

                    const card = session.cards[session.currentIndex];
                    const borderColor = App.util.sm2.getRatingColor(card.rating);
                    let cardFront, cardBack, contentBoxClass = '';

                    let controlsHTML = '';
                    const isFirstCard = session.currentIndex === 0;
                    const isLastCard = session.currentIndex === session.cards.length - 1;

                    const prevButtonIcon = `<button class="btn-icon-nav" onclick="App.events.study.prev()" ${isFirstCard ? 'disabled' : ''} title="Previous Card (←)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>`;
                    const nextButtonIcon = `<button class="btn-icon-nav" onclick="App.events.study.next()" ${isLastCard ? 'disabled' : ''} title="Next Card (→)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>`;
                    const exitButtonIcon = `<button class="btn-icon-nav btn-exit-study" onclick="App.events.study.exit()" title="Exit Session (Esc)">${App.util.icons.close}</button>`;
                    const currentFontSize = App.settings.get('studyCardFontSize') || '1.6rem';
                    const fontSizeButton = `<button class="btn-icon-nav" onclick="App.events.study.toggleFontSize(this)" title="Cycle Font Size">
                <span style="font-weight: 700; font-size: 1rem;">${currentFontSize.replace('rem', '')}</span>
            </button>`;
                    const themeButtonIcon = `<button class="btn-icon-nav" title="Cycle Ambiance (C, Right-click to go back)" oncontextmenu="event.preventDefault(); App.events.study.cycleStudyTheme(true);" onclick="App.events.study.cycleStudyTheme()">${App.util.icons.theme}</button>`;

                    if (session.quizType === 'mcq') {
                        controlsHTML = `
                    <div class="study-nav-and-ratings">
                        ${prevButtonIcon}
                        ${themeButtonIcon}
                        ${nextButtonIcon}
                    </div>
                    <div class="mcq-controls-right-group">
                        ${fontSizeButton}
                        ${exitButtonIcon}
                    </div>
                `;
                    } else {
                        // New layout for SRS with corrected grouping
                        controlsHTML = `
                    <div class="study-nav-and-ratings">
                        ${prevButtonIcon}
                        ${themeButtonIcon}
                        ${nextButtonIcon}
                    </div>
                    <div class="srs-rating-group">
                        <button class="btn btn-study-rating btn-again" onclick="App.events.study.rate('Again')">Again</button>
                        <button class="btn btn-study-rating btn-hard" onclick="App.events.study.rate('Hard')">Hard</button>
                        <button class="btn btn-study-rating btn-hold" onclick="App.events.study.rate('Hold')" title="Snooze this card until tomorrow">Bury</button>
                        <button class="btn btn-study-rating btn-good" onclick="App.events.study.rate('Good')">Good</button>
                        <button class="btn btn-study-rating btn-easy" onclick="App.events.study.rate('Easy')">Easy</button>
                    </div>
                    <div class="mcq-controls-right-group">
                        ${fontSizeButton}
                        ${exitButtonIcon}
                    </div>
                `;
                    }

                    if (card.type === 'collapsible') {
                        const reversibleIndicator = card.isReversed ? `<span class="reversible-indicator" title="Reversible Card (Answer Side)">${App.util.icons.reversible}</span>` : '';
                        const hintArea = card.hint ? `<div class="study-hint-container"><button class="btn btn-secondary study-hint-btn">Show Hint</button><div class="study-hint-content" style="display: none;">${card.hint}</div></div>` : '';
                        cardFront = card.frontText + reversibleIndicator + hintArea;
                        cardBack = card.backText;
                    } else if (card.type === 'mcq') {
                        contentBoxClass = 'mcq-type';
                        const optionsHtml = card.options.map(opt => `<div class="nk-mcq-option" data-is-correct="${opt.isCorrect}">${opt.text}</div>`).join('');
                        cardFront = `<div class="nk-mcq-block" data-quiz-mode="${session.quizType}"><div class="nk-mcq-question">${card.question}</div><div class="nk-mcq-options">${optionsHtml}</div></div>`;
                        const correctOption = card.options.find(opt => opt.isCorrect);
                        let answerHTML = `<strong>Answer:</strong> <span style="color: var(--success-color);">${correctOption ? correctOption.text : 'N/A'}</span>`;
                        if (card.explanation) {
                            answerHTML += `<hr style="margin: 1rem 0;"><div class="nk-mcq-explanation" style="font-size: 0.8em; color: var(--text-secondary);">${card.explanation}</div>`;
                        }
                        cardBack = `<div class="nk-mcq-block" data-quiz-mode="${session.quizType}"><div><strong>Question:</strong> ${card.question}</div><hr style="margin: 1.5rem 0;"><div>${answerHTML}</div></div>`;
                    } else if (card.type === 'image-occlusion') {
                        // Image Occlusion: show front (with tape) and back (revealed) images
                        contentBoxClass = 'image-occlusion-type';
                        cardFront = `<div class="study-vfc-image"><img src="${card.frontImage}" alt="Question - Click to reveal"></div>`;
                        cardBack = `<div class="study-vfc-image"><img src="${card.backImage}" alt="Answer"></div>`;
                    } else {
                        const parsedFullText = App.util.parseShortcuts(card.fullText);
                        // FIX: Updated regex to [\s\S]*?
                        // FIX: Safe Regex with Negative Lookahead to prevent runaway matching
                        cardFront = parsedFullText.replace(/{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g, '<strong class="cloze-hidden">[……?]</strong>');
                        cardBack = parsedFullText.replace(/{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g, '<span class="cloze-revealed-wrapper"><strong class="cloze-revealed">$1</strong></span>');
                    }

                    const activeTheme = session.activeTheme || 'default';
                    const activeThemeClass = activeTheme !== 'default' ? `ambiance-${activeTheme}` : '';
                    const globalTheme = App.settings.get('theme');
                    let backgroundStyle = (activeTheme === 'default' && globalTheme === 'custom' && App.settings.get('backgroundImage'))
                        ? `background-image: url(${App.settings.get('backgroundImage')});`
                        : '';

                    container.innerHTML = `<div class="study-view ${activeThemeClass}" role="dialog" aria-modal="true" aria-label="Study Session">
                <div class="study-background" style="${backgroundStyle}"></div>
                <div class="study-content-container">
                    <div class="study-card" onclick="if (this.querySelector('.nk-mcq-block') && !this.querySelector('.nk-mcq-block[data-answered=true]')) return; this.classList.toggle('is-flipped')" tabindex="0" aria-label="Flashcard, press Space to flip">
                        <div class="study-card-face study-card-front"><div class="study-card-content-box ${contentBoxClass}" style="border-color: ${borderColor};">${cardFront}</div></div>
                        <div class="study-card-face study-card-back"><div class="study-card-content-box" style="border-color: ${borderColor};">${cardBack}</div></div>
                    </div>
                </div>
                <div class="study-controls-container">
                    <div class="study-progress-wrapper">
                        <progress id="study-progress-bar" class="study-progress-bar" value="${session.currentIndex + 1}" max="${session.cards.length}"></progress>
                        <div class="study-progress-counter">${session.currentIndex + 1} / ${session.cards.length}</div>
                    </div>
                    <div class="study-controls">${controlsHTML}</div>
                </div>
            </div>`;

                    // FIX #1: Add manual wheel event listener to enable scrolling on long flashcards.
                    const studyViewOverlay = container.querySelector('.study-view');
                    if (studyViewOverlay) {
                        studyViewOverlay.addEventListener('wheel', (e) => {
                            const studyCard = studyViewOverlay.querySelector('.study-card');
                            if (!studyCard) return;

                            const isFlipped = studyCard.classList.contains('is-flipped');
                            const activeFaceSelector = isFlipped ? '.study-card-back' : '.study-card-front';
                            const contentBox = studyViewOverlay.querySelector(`${activeFaceSelector} .study-card-content-box`);

                            if (contentBox && contentBox.scrollHeight > contentBox.clientHeight) {
                                e.preventDefault();
                                contentBox.scrollTop += e.deltaY;
                            }
                        }, { passive: false });
                    }

                    if (card.type === 'mcq') { container.querySelector('.study-card-front .study-card-content-box')?.addEventListener('click', (e) => App.events.handleMcqAnswer(e, true)); }
                    if (card.type === 'collapsible' && card.hint) { const hintBtn = container.querySelector('.study-hint-btn'); if (hintBtn) { hintBtn.addEventListener('click', (e) => { e.stopPropagation(); const hintContent = hintBtn.nextElementSibling; const isHidden = hintContent.style.display === 'none'; hintContent.style.display = isHidden ? 'block' : 'none'; hintBtn.textContent = isHidden ? 'Hide Hint' : 'Show Hint'; }); } }

                    const studyCardEl = container.querySelector('.study-card');
                    if (studyCardEl && card.type !== 'mcq') {
                        App.events.study.setupCardGestures(studyCardEl);
                    }

                    const keyboardHandler = session.quizType === 'mcq' ? App.quiz.handleKeyboard : App.events.study.handleKeyboard;
                    document.addEventListener('keydown', keyboardHandler.bind(App.quiz), { once: true });
                    App.util.trapFocus(container.querySelector('.study-view'));

                    // Parse and render MCQ capsules on the study card
                    setTimeout(() => {
                        const studyView = container.querySelector('.study-view');
                        if (studyView) {
                            studyView.querySelectorAll('.nk-mcq-explanation').forEach(el => App.util.parseMcqExplanationMeta(el));
                            App.util.renderMcqCapsules(studyView);
                        }
                    }, 120);
                },

                async renderStatsDashboardView(container, data) {
                    if (typeof Chart === 'undefined' && App.loadLibrary) {
                        try {
                            await App.loadLibrary('chartjs');
                        } catch (e) {
                            console.error('Failed to lazy load ChartJS for dashboard:', e);
                        }
                    }
                    const today = new Date();
                    const selectedMonth = data?.month !== undefined ? data.month : today.getMonth();
                    const selectedYear = data?.year !== undefined ? data.year : today.getFullYear();

                    container.innerHTML = `
                <div class="stats-dashboard-view">
                    <div class="stats-header">
                        <h1 class="library-title">Stats Dashboard</h1>
                    </div>
                    <div id="stats-content-area"></div>
                </div>
            `;
                    this.renderStatsContent(document.getElementById('stats-content-area'), selectedMonth, selectedYear);

                    const readingData = App.util.getReadingChartData(selectedMonth, selectedYear);
                    const flashcardData = App.util.getFlashcardChartData(selectedMonth, selectedYear);

                    const baseColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
                    const baseColorRgb = App.util.colorToRgb(baseColor);
                    const chartFillColor = baseColorRgb ? `rgba(${baseColorRgb.join(',')}, 0.2)` : '#cccccc';

                    const readCtx = document.getElementById('readingActivityChart')?.getContext('2d');
                    if (readCtx) {
                        if (App.state.chartInstances.reading) App.state.chartInstances.reading.destroy();
                        App.state.chartInstances.reading = App.offline.safeChart(readCtx, {
                            type: 'line', data: { labels: readingData.labels, datasets: [{ label: `Articles Completed`, data: readingData.data, borderColor: baseColor, borderWidth: 2, tension: 0.4, fill: true, backgroundColor: chartFillColor }] },
                            options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
                        });
                    }

                    const flashCtx = document.getElementById('flashcardActivityChart')?.getContext('2d');
                    if (flashCtx) {
                        if (App.state.chartInstances.flashcard) App.state.chartInstances.flashcard.destroy();
                        App.state.chartInstances.flashcard = App.offline.safeChart(flashCtx, {
                            type: 'bar', data: { labels: flashcardData.labels, datasets: [{ label: `Flashcards Reviewed`, data: flashcardData.data, backgroundColor: baseColor }] },
                            options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
                        });
                    }
                    // ✨ NEW & CORRECTED: Render Flashcard Forecast Chart
                    const forecastCtx = document.getElementById('flashcardForecastChart')?.getContext('2d');
                    if (forecastCtx) {
                        if (App.state.chartInstances.forecast) App.state.chartInstances.forecast.destroy();
                        const forecastData = App.util.getFlashcardForecastData();
                        App.state.chartInstances.forecast = App.offline.safeChart(forecastCtx, {
                            type: 'bar',
                            data: {
                                labels: Array.from({ length: 30 }, (_, i) => `+${i}d`),
                                datasets: [{
                                    label: 'Cards Due',
                                    data: forecastData,
                                    backgroundColor: chartFillColor, // Uses the correctly defined color from the parent function
                                    borderColor: baseColor,        // Uses the correctly defined color from the parent function
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                scales: { y: { beginAtZero: true, ticks: { stepSize: 5 } } },
                                plugins: { legend: { display: false } }
                            }
                        });
                    }

                    // ✨ NEW & CORRECTED: Render Card Ease Distribution Chart
                    const easeCtx = document.getElementById('cardEaseDistributionChart')?.getContext('2d');
                    if (easeCtx) {
                        if (App.state.chartInstances.ease) App.state.chartInstances.ease.destroy();
                        const easeData = App.util.getCardEaseDistributionData();
                        App.state.chartInstances.ease = App.offline.safeChart(easeCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Leech', 'Hard', 'Normal', 'Easy', 'New'],
                                datasets: [{
                                    label: 'Card Distribution',
                                    data: [easeData.Leech, easeData.Hard, easeData.Normal, easeData.Easy, easeData.New],
                                    // ✨ FIX: Get the computed color values directly to fix the display bug
                                    backgroundColor: [
                                        getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim(),      // Leech
                                        getComputedStyle(document.documentElement).getPropertyValue('--warning-color').trim(),     // Hard
                                        getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),     // Normal
                                        getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),     // Easy
                                        getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()   // New
                                    ],
                                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    }
                                }
                            }
                        });
                    }
                    const monthSelect = document.getElementById('stats-month-select');
                    const yearSelect = document.getElementById('stats-year-select');

                    const updateView = () => {
                        const newMonth = parseInt(monthSelect.value);
                        const newYear = parseInt(yearSelect.value);
                        App.router.navigateTo('stats-dashboard', { month: newMonth, year: newYear });
                    };

                    monthSelect?.addEventListener('change', updateView);
                    yearSelect?.addEventListener('change', updateView);
                },



                renderStatsContent(container, currentMonth, currentYear) {
                    const readingStats = App.util.getReadingStats();
                    const flashcardStats = App.util.getFlashcardStats();
                    const quizStats = App.quiz.getStats();
                    const dailyStreak = App.util.calculateQuizStreak();
                    const weekCompletionData = App.util.getWeekCompletionData();
                    const todayFlashcards = App.util.getFlashcardStatsForPeriod('today').reviewed;
                    const yesterdayFlashcards = App.util.getFlashcardStatsForPeriod('yesterday').reviewed;
                    const todayArticles = App.util.getReadingStatsForPeriod('today').read;
                    const yesterdayArticles = App.util.getReadingStatsForPeriod('yesterday').read;
                    const today = new Date();
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                    const { firstYear, firstMonth } = App.util.getAppStartDate();
                    const yearOptions = [];
                    for (let y = today.getFullYear(); y >= firstYear; y--) {
                        yearOptions.push(`<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`);
                    }
                    const monthOptions = Array.from({ length: 12 }, (_, i) => {
                        const date = new Date(currentYear, i);
                        const isDisabled = currentYear === firstYear && i < firstMonth;
                        return `<option value="${i}" ${i === currentMonth ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>${date.toLocaleString('default', { month: 'long' })}</option>`;
                    }).join('');

                    const weeklyCalendarHTML = weekCompletionData.map(day => `
                <div class="week-day ${day.isCompleted ? 'completed' : ''} ${day.isToday ? 'today' : ''}">
                    <span class="day-letter">${day.dayLetter}</span>
                    <span class="date-number">${day.dateNumber}</span>
                </div>
            `).join('');

                    const quizTotalSessions = quizStats.totalQuizzes || 0;
                    const statsExportBtn = (key, aria) => `<button type="button" class="btn-icon stats-export-btn" title="Export for sharing" aria-label="${aria}" onclick="App.ui.exportStatsBrag('${key}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button>`;

                    container.innerHTML = `
                <div class="stats-section-title-row"><div class="stats-section-title">Cards Quiz Stats</div>${statsExportBtn('quiz', 'Export quiz stats')}</div>
                <div id="stats-export-quiz" class="stats-export-block"><div class="quiz-stats-container">
                    <div class="streak-container">
                        <div class="streak-display daily" title="${dailyStreak > 0 ? `You're on a ${dailyStreak}-day streak!` : 'Complete a quiz today to start a streak!'}">
                            <div class="streak-value">${dailyStreak}</div>
                            <div class="streak-label">Day Streak 🔥</div>
                        </div>
                        <div class="weekly-streak-calendar" title="Your quiz activity for the current week.">
                            ${weeklyCalendarHTML}
                        </div>
                    </div>
                    <div class="sub-stats-grid">
                        <div class="stat-card"><div class="stat-card-value">${quizStats.lastScore.toFixed(1)}</div><div class="stat-card-label">Last Score</div></div>
                        <div class="stat-card"><div class="stat-card-value">${quizStats.bestScore.toFixed(1)}</div><div class="stat-card-label">Best Score</div></div>
                        <div class="stat-card"><div class="stat-card-value">${quizStats.avgScore.toFixed(2)}</div><div class="stat-card-label">Avg. Score</div></div>
                        <div class="stat-card" title="Every quiz session builds recall — keep the habit going"><div class="stat-card-value">${quizTotalSessions}</div><div class="stat-card-label">Quizzes done</div></div>
                    </div>
                </div></div>
                <div class="stats-section-title-row"><div class="stats-section-title">Flashcard Spaced Repetition</div>${statsExportBtn('flashchart', 'Export flashcard activity chart')}</div>
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));">
                    <div class="stat-card"><div class="stat-card-value">${flashcardStats.total}</div><div class="stat-card-label">Total Cards</div></div>
                    <div class="stat-card"><div class="stat-card-value">${flashcardStats.due}</div><div class="stat-card-label">To Study</div></div>
                    ${App.config.sm2.ratings.map(r => `<div class="stat-card"><div class="stat-card-value">${flashcardStats.ratings[r] || 0}</div><div class="stat-card-label">${r}</div></div>`).join('')}
                    <div class="stat-card"><div class="stat-card-value">${flashcardStats.ratings['New'] || 0}</div><div class="stat-card-label">New Cards</div></div>
                    <div class="stat-card"><div class="stat-card-value">${yesterdayFlashcards}</div><div class="stat-card-label">Yesterday</div></div>
                    <div class="stat-card"><div class="stat-card-value" style="color:var(--success-color);">${todayFlashcards}</div><div class="stat-card-label">Today</div></div>
                </div>
                <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div id="stats-export-flashchart" class="stats-export-block" style="padding:8px;"><canvas id="flashcardActivityChart" style="margin-top: 1rem;"></canvas></div>
                </div>
                <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div>
                        <h4 style="text-align: center;">Upcoming Reviews (Next 30 Days)</h4>
                        <canvas id="flashcardForecastChart"></canvas>
                    </div>
                </div>
                <div style="margin-top: 2rem;">
                    <h4 style="text-align: center;">Card Difficulty Distribution</h4>
                    <div style="max-width: 400px; margin: 0 auto;">
                        <canvas id="cardEaseDistributionChart"></canvas>
                    </div>
                </div>
                <div class="stats-section-title-row"><div class="stats-section-title">Reading Stats</div>${statsExportBtn('readingchart', 'Export reading activity chart')}</div>
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));">
                    <div class="stat-card"><div class="stat-card-value">${readingStats.total}</div><div class="stat-card-label">Total Articles</div></div>
                    <div class="stat-card"><div class="stat-card-value">${readingStats.completed}</div><div class="stat-card-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-card-value">${readingStats.unread}</div><div class="stat-card-label">Unread</div></div>
                    ${Object.entries(readingStats.stages).map(([stage, count]) => `<div class="stat-card"><div class="stat-card-value">${count}</div><div class="stat-card-label">Read ${stage}${stage === '5' ? '+' : ''}x</div></div>`).join('')}
                    <div class="stat-card"><div class="stat-card-value">${yesterdayArticles}</div><div class="stat-card-label">Yesterday</div></div>
                    <div class="stat-card"><div class="stat-card-value" style="color:var(--success-color);">${todayArticles}</div><div class="stat-card-label">Today</div></div>
                </div>
                <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div id="stats-export-readingchart" class="stats-export-block" style="padding:8px;"><canvas id="readingActivityChart" style="margin-top: 1rem;"></canvas></div>
                </div>
                <div class="stats-section-title" style="margin-top: 3rem; text-align:center; border:none;">View Historical Data</div>
                <div style="display:flex; justify-content:center; gap: 1rem; margin-top: -0.5rem;">
                    <select id="stats-month-select" class="btn btn-secondary">${monthOptions}</select>
                    <select id="stats-year-select" class="btn btn-secondary">${yearOptions.join('')}</select>
                </div>
            `;
                },

                renderFocusMode() {
                    const session = App.state.focusSession;
                    if (!session.isActive) {
                        const aiMagicToggle = document.getElementById('ai-magic-toggle');
                        if (aiMagicToggle) aiMagicToggle.style.display = 'none';
                        return;
                    }

                    // JIT: Ensure snippets are ready for the current article
                    if (!session.articles[session.currentIndex].snippets) {
                        if (App.events.prepareFocusArticle) {
                            App.events.prepareFocusArticle(session.currentIndex);
                        }
                    }

                    // PRE-FETCH: Lazy load the next article's snippets in the background
                    setTimeout(() => {
                        if (session.isActive && App.events.prepareFocusArticle && session.currentIndex + 1 < session.articles.length) {
                            App.events.prepareFocusArticle(session.currentIndex + 1);
                        }
                    }, 500);

                    const aiMagicToggle2 = document.getElementById('ai-magic-toggle');
                    if (aiMagicToggle2) aiMagicToggle2.style.display = 'flex';

                    let overlay = document.getElementById('focus-mode-overlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'focus-mode-overlay';
                        document.body.appendChild(overlay);
                    }

                    overlay.className = `focus-mode-overlay ${session.isStageMode ? 'stage-mode-active' : ''} ${session.activeTheme && session.activeTheme !== 'default' ? 'ambiance-' + session.activeTheme : ''}`;
                    if (session.isProPresenterActive) {
                        overlay.classList.add('is-pro-presenter-active');
                    }

                    // SYNC: Apply ambiance theme to body so Pro Presenter elements on body inherit theme variables
                    document.body.className = document.body.className.replace(/\bambiance-\S+/g, '').trim();
                    if (session.activeTheme && session.activeTheme !== 'default') {
                        document.body.classList.add(`ambiance-${session.activeTheme}`);
                    }

                    const highlightsVisible = App.settings.get('categoryHighlightsVisible') !== false;
                    const currentArticle = session.articles[session.currentIndex];
                    const fontSize = App.settings.get('focusModeFontSize') || '1.1rem';

                    const sigmaMode = session.sigmaMode || 'presentation';
                    overlay.classList.toggle('sigma-mode-article', sigmaMode === 'article');

                    // REVERT: NON-PERSISTENT STRUCTURE (Simpler, Robust)
                    let contentHTML = '';

                    if (sigmaMode === 'article') {
                        // SIGMA MODE: FULL ARTICLE - Render like Read Mode (not raw editor tokens)
                        let parsedContent = App.util.parseShortcuts(currentArticle.content);
                        let finalContent = App.util.renderClozeForDisplay(parsedContent);
                        // Mirror Read Mode: remove any write-time contenteditable markers
                        finalContent = finalContent
                            .replaceAll(' contenteditable="true"', '')
                            .replaceAll(" contenteditable='true'", '');
                        contentHTML = `<div class="article-content-wrapper">${App.util.sanitizeHTML(finalContent)}</div>`;
                    } else {
                        // SIGMA MODE: PRESENTATION (Snippets)
                        contentHTML = currentArticle.snippets.map(item => {
                            if (item.type === 'mcq' || item.type === 'timeline' || item.type === 'chart' || item.type === 'accordion' || item.type === 'video') {
                                let finalHtml = item.html.replace(/contenteditable="true"/g, 'contenteditable="false"');

                                if (item.type === 'mcq') finalHtml = finalHtml.replace('class="nk-mcq-block"', 'class="nk-mcq-block" tabindex="0"');
                                if (item.type === 'timeline') finalHtml = finalHtml.replace('class="nk-timeline-block"', 'class="nk-timeline-block" tabindex="0"');
                                if (item.type === 'chart') finalHtml = finalHtml.replace('class="chart-container"', 'class="chart-container" tabindex="0"');
                                if (item.type === 'accordion') {
                                    const accordionWithTabindex = finalHtml.replace('class="nk-accordion"', 'class="nk-accordion" tabindex="0"');
                                    finalHtml = `<div>${accordionWithTabindex}</div>`;
                                }
                                if (item.type === 'video') {
                                    // Ensure video is not contenteditable and has focusability
                                    finalHtml = finalHtml.replace('class="nk-video-embed"', 'class="nk-video-embed" tabindex="0"');
                                    // Wrapper for layout preservation
                                    return `<div class="snippet video-snippet-wrapper" style="width: 100%; display: flex; justify-content: center; background: transparent; padding: 0;">${finalHtml}</div>`;
                                }
                                return finalHtml;
                            } else {
                                let snippetHtml = item.html;
                                if (snippetHtml && snippetHtml.includes('cloze-flashcard')) {
                                    snippetHtml = snippetHtml.replace(/<span class="cloze-flashcard">(.*?)<\/span>/g,
                                        (match, content) => {
                                            return `<span class="focus-cloze" 
                                                    onclick="event.stopPropagation(); this.classList.toggle('revealed')" 
                                                    title="Click to reveal cloze">
                                                <span class="focus-cloze-hidden">[...]</span>
                                                <span class="focus-cloze-revealed">${content}</span>
                                            </span>`;
                                        }
                                    );
                                }

                                return `<div class="snippet" tabindex="0" onclick="App.events.toggleSnippetVisibility(event)">${snippetHtml}</div>`;
                            }
                        }).join('');
                    }

                    // Toggle Overlay Classes
                    if (overlay) {
                        overlay.classList.toggle('articulator-active', sigmaMode === 'article');
                        overlay.classList.remove('sigma-web'); // Ensure web class is gone
                    }

                    overlay.innerHTML = `
                <div id="blackout-screen"></div> <div id="whiteboard-screen"></div> 
                <div class="laser-pointer" id="laser-pointer" style="display: none;"></div>
                <div class="focus-mode-content" tabindex="-1">
                    <h1 class="focus-mode-title" onclick="App.events.exitFocusMode(); App.router.navigateTo('article', {id: '${currentArticle.id}', mode: 'read'})">${currentArticle.title}</h1>
                    <div class="focus-mode-body ${!highlightsVisible ? 'hide-snippet-colors' : ''}" style="--focus-mode-font-size: ${fontSize};">
                        <canvas id="annotation-canvas"></canvas> 
                        ${contentHTML}
                    </div>
                </div>
                <div class="focus-mode-controls" id="focus-controls-container"></div>`;

                    overlay.querySelectorAll('canvas[data-chart-config]').forEach(canvas => {
                        App.ui.renderChartOnCanvas(canvas);
                    });
                    App.util.renderMathInElement(overlay.querySelector('.focus-mode-body'));

                    // Pro Presenter: Refresh listeners/re-bind scroll if active
                    if (session.isProPresenterActive && App.events.presentation?._initProPresenter) {
                        setTimeout(() => App.events.presentation._initProPresenter(), 50);
                    }

                    if (session.isStageMode) {
                        setTimeout(() => {
                            const bodyEl = overlay.querySelector('.focus-mode-body');
                            if (bodyEl) {
                                const sigmaMode = session.sigmaMode || 'presentation';

                                // STAGE MODE INNOVATIONS (only for Sigma Presentation mode)
                                if (sigmaMode === 'presentation') {
                                    // Innovation 1: Prepare Bento layouts
                                    this._prepareStageModeBentoLayouts(bodyEl);

                                    // Innovation 2: Prepare list build animations
                                    this._prepareListBuildAnimations(bodyEl);

                                    // Innovation 3: 2D Camera viewport (optional feature flag)
                                    // Enable by setting session.use2DCamera = true before entering Stage Mode
                                    if (session.use2DCamera) {
                                        this._prepare2DCameraViewport(bodyEl);
                                    }
                                }

                                // Use camera map if available, otherwise use scroll stops
                                if (session.cameraMap && session.cameraMap.positions.length > 0) {
                                    session.scrollStops = session.cameraMap.positions.map((_, i) => i);
                                    this._navigate2DCamera(bodyEl, 0, 0);
                                } else {
                                    session.scrollStops = this._calculateScrollStops(bodyEl);
                                    bodyEl.scrollTo({ top: session.scrollStops[session.currentSlideIndex], behavior: 'auto' });
                                }

                                // Get all observable elements for smart blur logic
                                const allElements = bodyEl.querySelectorAll('.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-accordion, .nk-text-tile, .stage-bento-split, .stage-bento-split-alt, .stage-hero-image');
                                const totalItems = allElements.length;

                                // Smart blur: If very few items or only one slide, disable blur
                                if (totalItems <= 3 || session.scrollStops.length <= 1) {
                                    bodyEl.classList.add('smart-blur-disabled');
                                }

                                const observer = new IntersectionObserver((entries) => {
                                    let visibleCount = 0;
                                    entries.forEach(entry => {
                                        const isVisible = entry.isIntersecting;
                                        entry.target.classList.toggle('is-visible', isVisible);
                                        if (isVisible) visibleCount++;
                                        if (isVisible && session.isCinematicActive && !entry.target.querySelector('img')) {
                                            App.events.typewriter.setup(entry.target);
                                        } else if (!isVisible && entry.target === App.events.typewriter.currentSnippet) {
                                            App.events.typewriter.reset();
                                        }
                                    });

                                    // Smart blur: Check if all or most items are visible
                                    const allVisibleItems = bodyEl.querySelectorAll('.is-visible').length;
                                    if (allVisibleItems >= totalItems || totalItems <= 3) {
                                        bodyEl.classList.add('smart-blur-disabled');
                                    } else {
                                        bodyEl.classList.remove('smart-blur-disabled');
                                    }
                                }, { root: bodyEl, threshold: 0.8 });

                                allElements.forEach(el => observer.observe(el));
                            }
                            this.renderFocusModeControls();
                            // Fix: Initialize video players in Stage Mode
                            App.util.initPlyr(bodyEl);
                        }, 100);
                    } else {
                        this.renderFocusModeControls();
                    }

                    overlay.addEventListener('click', App.events.handleContentClick);
                    const bodyEl = overlay.querySelector('.focus-mode-body');
                    if (bodyEl) {
                        const canvas = overlay.querySelector('#annotation-canvas');
                        canvas.width = bodyEl.offsetWidth;
                        canvas.height = bodyEl.scrollHeight;
                        bodyEl.addEventListener('scroll', () => { if (App.annotationEngine.state.isActive && App.annotationEngine.state.context === 'focus') App.annotationEngine.redrawPageAnnotations(); });
                        bodyEl.addEventListener('mouseover', App.events.handleSpotlight);
                        bodyEl.addEventListener('mouseout', App.events.handleSpotlight);
                    }
                    overlay.querySelector('.focus-mode-content').focus();

                    // RE-INIT PRO PRESENTER if active (Ensures elements and listeners are correct for new layout)
                    if (session.isProPresenterActive) {
                        App.events.presentation._initProPresenter();
                    }

                    // Parse and render MCQ capsules in Focus Mode
                    setTimeout(() => {
                        const contentBody = overlay.querySelector('.focus-mode-body');
                        if (contentBody) {
                            contentBody.querySelectorAll('.nk-mcq-explanation').forEach(el => App.util.parseMcqExplanationMeta(el));
                            App.util.renderMcqCapsules(contentBody);
                        }
                    }, 120);
                },

                renderFocusModeControls() {
                    const session = App.state.focusSession;
                    const container = document.getElementById('focus-controls-container');
                    if (!container) return;

                    const isPremium = App.license.isPremium();
                    const premiumLockClass = App.license.isPremium() ? '' : 'premium-feature-locked';

                    let controlsHTML = '';
                    const isStageMode = session.isStageMode;
                    const highlightsVisible = App.settings.get('categoryHighlightsVisible') !== false;
                    const themeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>`;
                    const stageModeToggleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 17H6v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>`;
                    const highlighterIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 012.829-5.185l7.423-2.119a2.25 2.25 0 001.624-1.624l2.119-7.423a4.5 4.5 0 015.185-2.829l2.846.813L15.904 9.813a2.25 2.25 0 00-1.624 1.624l-2.119 7.423z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.5h2.25a2.25 2.25 0 002.25-2.25V6.75" /></svg>`;

                    if (isStageMode) {
                        const slideCount = session.scrollStops ? session.scrollStops.length : 0;
                        let progressDots = '';

                        if (slideCount <= 4) {
                            progressDots = Array.from({ length: slideCount }, (_, i) =>
                                `<div class="progress-dot ${i === session.currentSlideIndex ? 'active' : ''}" onclick="App.state.focusSession.currentSlideIndex=${i}; App.events.navigateStageSlide(0);"></div>`
                            ).join('');
                        } else {
                            const isFirst = session.currentSlideIndex === 0;
                            const isLast = session.currentSlideIndex === slideCount - 1;
                            const isMiddle = !isFirst && !isLast;

                            progressDots += `<div class="progress-dot ${isFirst ? 'active' : ''}" onclick="App.state.focusSession.currentSlideIndex=0; App.events.navigateStageSlide(0);"></div>`;
                            progressDots += `<div class="progress-dot ${isMiddle ? 'active' : ''}" onclick="App.state.focusSession.currentSlideIndex=${Math.floor((slideCount - 1) / 2)}; App.events.navigateStageSlide(0);"></div>`;
                            progressDots += `<div class="progress-dot ${isLast ? 'active' : ''}" onclick="App.state.focusSession.currentSlideIndex=${slideCount - 1}; App.events.navigateStageSlide(0);"></div>`;
                        }

                        container.className = 'stage-mode-controls';

                        // --- NEW: Icons for Stage Mode More Menu ---
                        const sigmaMode = session.sigmaMode || 'presentation';
                        const sigmaIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" class="sigma-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v2H7.66l6.63 6-6.63 6H19v2H5v-2l7-7-7-7V4z"/></svg>`;
                        const isActive = sigmaMode !== 'presentation';
                        const moreIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`;
                        const cinematicIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 6 3 3 3-3 3 3 3-3 3 3 3-3"/><path d="M2 12l3 3 3-3 3 3 3-3 3 3 3-3"/><path d="M2 18l3 3 3-3 3 3 3-3 3 3 3-3"/></svg>`;

                        const cinematicActive = session.isCinematicActive;
                        const cinematicOnClick = isPremium ? "App.events.presentation.toggleCinematicMotion(this)" : "App.ui.showToast('Cinematic Reveal is a Premium feature.', 'info')";
                        const annotationOnClick = isPremium ? "App.annotationEngine.toggle('focus')" : "App.ui.showToast('Live Annotation is a Premium feature.', 'info')";
                        const exportOnClick = isPremium ? "App.events.exportCurrentSlide()" : "App.ui.showToast('Copying slides is a Premium feature.', 'info')";


                        controlsHTML = `
                    <button class="btn-icon" onclick="App.events.navigateStageSlide(-1)" title="Previous Slide (←)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                    <div class="stage-progress-indicator" title="Jump to slide">${progressDots}</div>
                    <button class="btn-icon" onclick="App.events.navigateStageSlide(1)" title="Next Slide (→)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
                    <div class="control-divider"></div>
                    
                    <button class="btn-icon" id="teleprompter-toggle-btn" onclick="App.events.presentation.toggleTeleprompter()" title="Toggle Teleprompter (i)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M6 3h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1v-1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1V2H4z"/><path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/></svg>
                    </button>
                    <button class="btn-icon ${highlightsVisible ? 'active' : ''}" onclick="App.events.toggleStageModeHighlights(this)" title="Toggle Highlight Colors (H)">${highlighterIcon}</button>

                    <div class="${premiumLockClass}">
                        <button class="btn-icon ${cinematicActive ? 'active' : ''}" onclick="${cinematicOnClick}" title="Toggle Cinematic Reveal">${cinematicIcon}</button>
                    </div>
                <div class="${premiumLockClass}">
                        <button class="btn-icon annotation-btn" onclick="${annotationOnClick}" title="Toggle Annotation (D)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                        </button>
                    </div>
                    
                    
                    <div class="stage-more-menu-container">
                        <button class="btn-icon" title="More Options" onclick="this.closest('.stage-more-menu-container').classList.toggle('active')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="2" />
                                <rect x="14" y="3" width="7" height="7" rx="2" />
                                <rect x="14" y="14" width="7" height="7" rx="2" />
                                <rect x="3" y="14" width="7" height="7" rx="2" />
                            </svg>
                        </button>
                        <div class="stage-more-popup">
                             <!-- Mobile-only duplicates of hidden toolbar buttons -->
                             <button class="btn-icon mobile-only-option" onclick="App.events.presentation.toggleTeleprompter()" title="Toggle Teleprompter (i)">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M6 3h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1v-1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1V2H4z"/><path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/></svg>
                             </button>
                             <button class="btn-icon mobile-only-option ${highlightsVisible ? 'active' : ''}" onclick="App.events.toggleStageModeHighlights(this)" title="Toggle Highlight Colors (H)">${highlighterIcon}</button>
                
                             <!-- Regular More Options items -->
                             <button id="focus-mode-immersive-toggle" class="btn-icon" onclick="App.events.toggleFocusModeControls()" title="Toggle Immersive Mode (F)">${App.util.icons.expand}</button>
                             <div class="${premiumLockClass}" style="display: contents;">
                                <button class="btn-icon" onclick="${exportOnClick}" title="Screenshot (P)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                                </button>
                                <button class="btn-icon ${session.isProPresenterActive ? 'active' : ''}" id="pro-presenter-toggle-btn" onclick="App.events.presentation.toggleProPresenter()" title="Pro Presenter Mode">
                                    ${App.util.icons.proPresent}
                                </button>
                             </div>
                             <button class="btn-icon" id="laser-pointer-toggle" title="Toggle Laser Pointer (L)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25a8.25 8.25 0 00-8.25 8.25c0 1.721.576 3.322 1.568 4.675A8.25 8.25 0 0012 21.75a8.25 8.25 0 008.25-8.25c0-4.556-3.694-8.25-8.25-8.25z" /></svg></button>
                             <button class="btn-icon" onclick="App.events.annotation.toggleWhiteboard()" title="Whiteboard (W)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg></button>
                             <button class="btn-icon ${isActive ? 'active' : ''}" onclick="App.events.toggleSigmaMode(this)" title="Sigma Mode: Pres -> Article -> Web">${sigmaIcon}</button>
                             <button class="btn-icon" onclick="App.events.stageTimer.toggle()" title="Stage Timer (T)" style="animation: fadeIn 0.3s ease 0.1s both;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></button>
                        </div>
                    </div>

                    <button class="btn-icon" onclick="App.events.toggleStageMode()" title="Exit Stage Mode (Esc)">${stageModeToggleIcon}</button>
                    <!-- Top Right Exit Immersive Button -->
                    <button id="immersive-exit-btn" onclick="App.events.toggleFocusModeControls()" title="Exit Immersive Mode (F)">
                        ${App.util.icons.compress}
                    </button>
                `;
                    } else { // Standard Focus Mode
                        const fontSize = App.settings.get('focusModeFontSize') || '1.1rem';
                        const isControlsHidden = document.querySelector('.focus-mode-overlay')?.classList.contains('controls-hidden');
                        const stageModeToggleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>`;
                        container.className = 'focus-mode-controls';
                        controlsHTML = `
                    <button id="focus-mode-immersive-toggle" class="btn-icon immersive-toggle-btn" onclick="App.events.toggleFocusModeControls()" title="${isControlsHidden ? 'Show Controls' : 'Hide Controls'}">${isControlsHidden ? App.util.icons.compress : App.util.icons.expand}</button>    
                    <button class="btn-icon" onclick="App.events.toggleStageMode()" title="Enter Stage Mode">${stageModeToggleIcon}</button>
                    <button class="btn-icon" onclick="App.events.presentation.cycleAmbiance()" oncontextmenu="event.preventDefault(); App.events.presentation.cycleAmbiance(true);" title="Cycle Ambiance (C, Right-click to go back)">${themeIcon}</button>

                    <button id="focus-font-size-btn" class="btn-icon" onclick="App.events.toggleFocusModeFontSize(this)" title="Cycle Font Size (F)"><span style="font-weight: 700; font-size: 1rem;">${fontSize.replace('rem', '')}</span></button>
                    <button class="btn-icon ${highlightsVisible ? 'active' : ''}" onclick="App.events.toggleFocusModeHighlights(this)" title="Toggle Highlight Colors (s)">${highlighterIcon}</button>
                    <button class="btn-icon" onclick="App.events.navigateFocusMode(-1)" title="Previous Article (←)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                    <button class="btn-icon" onclick="App.events.navigateFocusMode(1)" title="Next Article (→)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
                    <button class="btn-icon btn-danger" onclick="App.events.exitFocusMode()" title="Exit Focus Mode (Esc)">${App.util.icons.close}</button>
                    
                `;
                    }
                    container.innerHTML = controlsHTML;
                    const laserToggle = document.getElementById('laser-pointer-toggle');
                    if (laserToggle) {
                        laserToggle.onclick = () => App.events.toggleSharedLaser('stage');
                        laserToggle.classList.toggle('active', document.querySelector('.focus-mode-overlay.laser-active') !== null);
                    }
                },

                _calculateScrollStops(bodyEl) {

                    const elements = Array.from(bodyEl.querySelectorAll('.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-accordion'));

                    if (elements.length === 0) return [0];

                    const containerHeight = bodyEl.clientHeight;
                    const scrollStops = [];
                    let currentPageElements = [];
                    let currentPageHeight = 0;
                    const verticalMargin = 16;

                    elements.forEach((el) => {
                        const elHeight = el.offsetHeight;
                        if (elHeight > containerHeight) {
                            if (currentPageElements.length > 0) { scrollStops.push(currentPageElements[0].offsetTop); }
                            scrollStops.push(el.offsetTop);
                            currentPageElements = []; currentPageHeight = 0; return;
                        }
                        if (currentPageHeight + elHeight + (currentPageElements.length > 0 ? verticalMargin : 0) > containerHeight) {
                            scrollStops.push(currentPageElements[0].offsetTop);
                            currentPageElements = [el]; currentPageHeight = elHeight;
                        } else {
                            currentPageElements.push(el);
                            currentPageHeight += elHeight + (currentPageElements.length > 1 ? verticalMargin : 0);
                        }
                    });

                    if (currentPageElements.length > 0) { scrollStops.push(currentPageElements[0].offsetTop); }
                    if (scrollStops.length > 0) { scrollStops[0] = 0; }

                    return scrollStops.length > 0 ? scrollStops : [0];
                },

                // --- STAGE MODE INNOVATIONS ---

                /**
                 * Innovation 1: Intelligent "Bento" Slide Layouts
                 * Scans DOM for patterns and wraps them in CSS Grid containers
                 */
                _prepareStageModeBentoLayouts(bodyEl) {
                    if (!bodyEl) return;

                    // Optimization: Use a single pass and minimal DOM manipulation
                    const snippets = Array.from(bodyEl.querySelectorAll('.snippet'));
                    let alternateLayout = false;

                    for (let i = 0; i < snippets.length - 2; i++) {
                        const snippet = snippets[i];

                        // Skip if already processed
                        if (snippet.closest('.stage-bento-split, .stage-bento-split-alt, .stage-hero-image')) continue;

                        const nextSnippet = snippets[i + 1];
                        const nextNextSnippet = snippets[i + 2];

                        // Safety: Don't mess with videos in the Bento grouping logic if they are sensitive
                        if (snippet.querySelector('.nk-video-embed') ||
                            nextSnippet.querySelector('.nk-video-embed') ||
                            nextNextSnippet.querySelector('.nk-video-embed')) {
                            continue;
                        }

                        // Pattern 1: "Split Slide" - Header + Image + Text
                        const headerMatch = snippet.querySelector('h1, h2, h3');
                        const hasImage = nextSnippet.querySelector('.image-container, img');
                        const hasText = nextNextSnippet.querySelector('p, ul, ol');

                        if (headerMatch && hasImage && hasText) {
                            // Valid Pattern Found
                            const wrapper = document.createElement('div');
                            // Use text direction class for alternate layout
                            wrapper.className = alternateLayout ? 'stage-bento-split-alt' : 'stage-bento-split';
                            wrapper.dataset.bentoWrapper = 'true';

                            // Insert wrapper at the position of the first element
                            snippet.parentNode.insertBefore(wrapper, snippet);

                            // Construction:
                            // 1. Header (snippet) always goes first/top-left
                            wrapper.appendChild(snippet);

                            // 2. Arrange Image and Text based on layout
                            if (alternateLayout) {
                                // For alt layout, we wrap text to target it specifically with CSS order
                                const textWrapper = document.createElement('div');
                                textWrapper.className = 'bento-text-content';
                                textWrapper.appendChild(nextNextSnippet);
                                wrapper.appendChild(nextSnippet); // Image
                                wrapper.appendChild(textWrapper); // Text
                            } else {
                                wrapper.appendChild(nextSnippet); // Image
                                wrapper.appendChild(nextNextSnippet); // Text
                            }

                            alternateLayout = !alternateLayout;
                            i += 2; // Advanced index
                        }
                    }

                    // Separate pass for Hero Images to avoid complex nested loops
                    const remainingSnippets = bodyEl.querySelectorAll('.snippet > .image-container');
                    remainingSnippets.forEach(imgContainer => {
                        const snippet = imgContainer.closest('.snippet');
                        if (!snippet || snippet.closest('[data-bento-wrapper="true"]')) return;

                        // Check if it's "standalone" (mostly image)
                        const textContent = snippet.textContent.trim();
                        // Loose check: clearly less than 100 chars of text, mostly just the image
                        if (textContent.length < 100) {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'stage-hero-image';
                            wrapper.dataset.bentoWrapper = 'true';
                            snippet.parentNode.insertBefore(wrapper, snippet);
                            wrapper.appendChild(snippet);
                        }
                    });
                },


                _cleanupStageModeBentoLayouts(bodyEl) {
                    if (!bodyEl) return;

                    // Find all bento wrappers and unwrap them
                    const wrappers = bodyEl.querySelectorAll('[data-bento-wrapper="true"]');
                    wrappers.forEach(wrapper => {
                        // Unwrap text wrappers first
                        const textWrappers = wrapper.querySelectorAll('.bento-text-content');
                        textWrappers.forEach(tw => {
                            while (tw.firstChild) {
                                tw.parentNode.insertBefore(tw.firstChild, tw);
                            }
                            tw.remove();
                        });

                        // Move children out of wrapper
                        while (wrapper.firstChild) {
                            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                        }
                        wrapper.remove();
                    });
                },

                /**
                 * Innovation 2: List Build Animations
                 * Sets up list items for progressive reveal
                 */
                _prepareListBuildAnimations(bodyEl) {
                    if (!bodyEl) return;

                    const lists = bodyEl.querySelectorAll('ul, ol');
                    lists.forEach(list => {
                        const items = list.querySelectorAll('li');
                        items.forEach((item, index) => {
                            if (index === 0) {
                                // First item is visible
                                item.classList.add('stage-build-visible');
                                item.classList.remove('stage-build-hidden');
                            } else {
                                // Other items start hidden
                                item.classList.add('stage-build-hidden');
                                item.classList.remove('stage-build-visible');
                            }
                        });
                    });
                },

                /**
                 * Reveals the next hidden list item in the current visible snippet
                 * Returns true if an item was revealed, false if all items are visible
                 */
                _revealNextListItem(bodyEl) {
                    if (!bodyEl) return false;

                    // Find the currently visible snippet
                    const visibleSnippet = bodyEl.querySelector('.snippet.is-visible, .stage-bento-split.is-visible, .stage-hero-image.is-visible');
                    if (!visibleSnippet) return false;

                    // Find the first hidden list item
                    const hiddenItem = visibleSnippet.querySelector('li.stage-build-hidden');
                    if (!hiddenItem) return false;

                    // Reveal it
                    hiddenItem.classList.remove('stage-build-hidden');
                    hiddenItem.classList.add('stage-build-visible');

                    return true;
                },

                /**
                 * Checks if there are still hidden list items in the current visible snippet
                 */
                _hasHiddenListItems(bodyEl) {
                    if (!bodyEl) return false;
                    const visibleSnippet = bodyEl.querySelector('.snippet.is-visible, .stage-bento-split.is-visible, .stage-hero-image.is-visible');
                    if (!visibleSnippet) return false;
                    return visibleSnippet.querySelector('li.stage-build-hidden') !== null;
                },

                /**
                 * Innovation 3: 2D "Camera" Transitions
                 * Calculates a 2D grid map for slides using a snaking pattern
                 * Returns: { positions: [{x, y, width, height}], gridWidth, gridHeight }
                 */
                _calculate2DScrollMap(bodyEl) {
                    if (!bodyEl) return { positions: [], gridWidth: 0, gridHeight: 0 };

                    const elements = Array.from(bodyEl.querySelectorAll('.snippet, .nk-mcq-block, .nk-timeline-block, .chart-container, .nk-accordion, .stage-bento-split, .stage-bento-split-alt, .stage-hero-image'));
                    if (elements.length === 0) return { positions: [], gridWidth: 0, gridHeight: 0 };

                    const viewportWidth = bodyEl.clientWidth;
                    const viewportHeight = bodyEl.clientHeight;

                    // Calculate how many slides fit per row (2-3 based on content density)
                    const slidesPerRow = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(elements.length))));

                    const positions = [];
                    let currentRow = 0;
                    let currentCol = 0;
                    let goingRight = true;

                    elements.forEach((el, index) => {
                        // Snaking pattern: row 0 goes right, row 1 goes left, etc.
                        if (goingRight) {
                            positions.push({
                                x: currentCol * viewportWidth,
                                y: currentRow * viewportHeight,
                                width: viewportWidth,
                                height: viewportHeight,
                                element: el
                            });
                            currentCol++;
                            if (currentCol >= slidesPerRow) {
                                currentRow++;
                                currentCol = slidesPerRow - 1;
                                goingRight = false;
                            }
                        } else {
                            positions.push({
                                x: currentCol * viewportWidth,
                                y: currentRow * viewportHeight,
                                width: viewportWidth,
                                height: viewportHeight,
                                element: el
                            });
                            currentCol--;
                            if (currentCol < 0) {
                                currentRow++;
                                currentCol = 0;
                                goingRight = true;
                            }
                        }
                    });

                    const gridWidth = slidesPerRow * viewportWidth;
                    const gridHeight = (currentRow + 1) * viewportHeight;

                    return { positions, gridWidth, gridHeight };
                },

                /**
                 * Navigates the 2D camera to a specific position
                 * Uses CSS transform for smooth GPU-accelerated animation
                 */
                _navigate2DCamera(bodyEl, targetX, targetY) {
                    if (!bodyEl) return;

                    const canvas = bodyEl.querySelector('.stage-camera-canvas');
                    if (!canvas) return;

                    // Use negative values to translate canvas in opposite direction
                    canvas.style.transform = `translate3d(${-targetX}px, ${-targetY}px, 0)`;
                },

                /**
                 * Prepares the 2D camera viewport structure
                 * Wraps content in a transformable canvas
                 */
                _prepare2DCameraViewport(bodyEl) {
                    if (!bodyEl) return;

                    // Check if already prepared
                    if (bodyEl.querySelector('.stage-camera-canvas')) return;

                    const map = this._calculate2DScrollMap(bodyEl);
                    if (map.positions.length === 0) return;

                    // Create the camera canvas
                    const canvas = document.createElement('div');
                    canvas.className = 'stage-camera-canvas';
                    canvas.style.width = `${map.gridWidth}px`;
                    canvas.style.height = `${map.gridHeight}px`;

                    // Move all elements into the canvas and position them absolutely
                    map.positions.forEach((pos, index) => {
                        const el = pos.element;
                        if (el && el.parentNode === bodyEl) {
                            // Wrap element in a positioned container
                            const slideContainer = document.createElement('div');
                            slideContainer.className = 'stage-camera-slide';
                            slideContainer.style.cssText = `
                                position: absolute;
                                left: ${pos.x}px;
                                top: ${pos.y}px;
                                width: ${pos.width}px;
                                height: ${pos.height}px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-sizing: border-box;
                                padding: 2rem;
                            `;

                            // Move element into slide container
                            bodyEl.removeChild(el);
                            slideContainer.appendChild(el);
                            canvas.appendChild(slideContainer);
                        }
                    });

                    // Add canvas to body
                    bodyEl.appendChild(canvas);
                    bodyEl.classList.add('stage-camera-active');

                    // Store map in session for navigation
                    App.state.focusSession.cameraMap = map;

                    // Navigate to first slide
                    this._navigate2DCamera(bodyEl, 0, 0);
                },

                /**
                 * Cleans up the 2D camera viewport
                 */
                _cleanup2DCameraViewport(bodyEl) {
                    if (!bodyEl) return;

                    const canvas = bodyEl.querySelector('.stage-camera-canvas');
                    if (!canvas) return;

                    // Move all elements back to body
                    const slides = canvas.querySelectorAll('.stage-camera-slide');
                    slides.forEach(slide => {
                        while (slide.firstChild) {
                            bodyEl.insertBefore(slide.firstChild, canvas);
                        }
                    });

                    canvas.remove();
                    bodyEl.classList.remove('stage-camera-active');
                    delete App.state.focusSession.cameraMap;
                },

                migrationScreen: {
                    state: { isCancelled: false },

                    show(title = "Migrating Data") {
                        this.state.isCancelled = false; // Reset cancellation state on every new operation
                        const overlay = document.createElement('div');
                        overlay.id = 'migration-overlay';
                        overlay.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(var(--bg-primary-rgb), 0.8); backdrop-filter: blur(4px);
                    z-index: 100000; display: flex; align-items: center; justify-content: center;
                    animation: fadeIn 0.3s;
                `;

                        const dynamicStyles = `
                    
                `;

                        overlay.innerHTML = `
                    ${dynamicStyles}
                    <div class="ui-card migration-card-glowing" style="width: 90%; max-width: 450px; padding: 2rem; text-align: center; display: flex; flex-direction: column; gap: 1rem;">
                        <div id="migration-spinner" class="spin" style="font-size: 2rem; color: var(--primary-color); margin: 0 auto;">
                            ${App.util.icons.cycle}
                        </div>
                        
                        <h2 id="migration-title" class="migration-title-gradient" style="font-family: var(--font-display); font-size: 1.75rem; margin: -0.5rem 0 0 0;">${title}</h2>
                        
                        <p id="migration-status" style="color: var(--text-secondary); min-height: 1.5em;"></p>
                        
                        <div style="width: 100%; background: var(--bg-tertiary); border-radius: 8px; overflow: hidden; margin-top: 0.5rem;">
                            <div id="migration-progress-bar" class="migration-progress-gradient" style="width: 0%; height: 8px; transition: width 0.45s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 0 10px color-mix(in srgb, var(--primary-color) 40%, transparent);"></div>
                        </div>

                        <button id="migration-cancel-btn" class="btn migration-cancel-btn-styled" style="margin-top: 1.5rem; width: 50%; align-self: center;">Cancel</button>
                    </div>
                `;
                        document.body.appendChild(overlay);

                        document.getElementById('migration-cancel-btn').onclick = async () => {
                            this.state.isCancelled = true;
                            App.ui.showToast('Operation cancelled by user.', 'warning');

                            // Update the plan file to reflect the cancellation
                            try {
                                const plan = await App.fs.read('_category_operation_plan.json');
                                if (plan) {
                                    plan.status = 'cancelled';
                                    await App.fs.write('_category_operation_plan.json', plan);
                                }
                            } catch (e) {
                                console.error("Could not update operation plan to 'cancelled':", e);
                            }

                            this.hide();
                        };
                    },

                    update(progress, statusText) {
                        const bar = document.getElementById('migration-progress-bar');
                        const status = document.getElementById('migration-status');
                        if (bar) bar.style.width = `${progress}%`;
                        if (status) status.textContent = statusText;
                    },

                    hide() {
                        const overlay = document.getElementById('migration-overlay');
                        if (overlay) overlay.remove();
                    }
                },


                applyTheme(theme, isInitialLoad = false) {
                    const isCustom = theme === 'custom';
                    const baseTheme = App.settings.get('customThemeBase');
                    document.documentElement.setAttribute('data-theme', isCustom ? baseTheme : theme);

                    const bgImage = App.settings.get('backgroundImage');
                    const hasBgImage = isCustom && !!bgImage;
                    document.body.classList.toggle('image-theme-active', hasBgImage);
                    document.getElementById('app-background').style.backgroundImage = hasBgImage ? `url(${bgImage})` : 'none';

                    const opacity = App.settings.get('uiOpacity');
                    document.documentElement.style.setProperty('--ui-opacity', opacity);
                    const blurIntensity = parseFloat(opacity) === 0 ? '0px' : '8px';
                    document.documentElement.style.setProperty('--blur-intensity', blurIntensity);
                    document.documentElement.classList.toggle('zero-opacity-active', parseFloat(opacity) === 0);

                    if (!isInitialLoad) {
                        App.settings.set('theme', theme);
                    }

                    setTimeout(async () => {
                        const primaryBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
                        const secondaryBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
                        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
                        const primaryRgb = App.util.colorToRgb(primaryBg);
                        const secondaryRgb = App.util.colorToRgb(secondaryBg);
                        const primaryColorRgb = App.util.colorToRgb(primaryColor);
                        if (primaryRgb) document.documentElement.style.setProperty('--bg-primary-rgb', primaryRgb.join(','));
                        if (secondaryRgb) document.documentElement.style.setProperty('--bg-secondary-rgb', secondaryRgb.join(','));
                        if (primaryColorRgb) document.documentElement.style.setProperty('--primary-color-rgb', primaryColorRgb.join(','));
 
                        const activeView = App.router.getActiveView();
                        if (activeView === 'library') {
                            const toggleButton = document.getElementById('category-name-toggle');
                            if (toggleButton) {
                                let newIcon;
                                switch (theme) {
                                    case 'sepia': newIcon = '🟤'; break;
                                    case 'dark': newIcon = '🟠'; break;
                                    case 'custom':
                                        const customBase = App.settings.get('customThemeBase');
                                        newIcon = (customBase === 'dark') ? '🟠' : '🟢';
                                        break;
                                    case 'light': default: newIcon = '🟢'; break;
                                }
                                toggleButton.innerHTML = newIcon;
                            }
                        }
 
                        // --- FIX: Typo corrected below (currentAactiveView -> currentActiveView) ---
                        const currentActiveView = App.router.getActiveView();
 
                        if (currentActiveView === 'article') {
                            const contentDiv = document.getElementById('article-content');
                            if (contentDiv) {
                                contentDiv.querySelectorAll('canvas[data-chart-config]').forEach(canvas => App.ui.renderChartOnCanvas(canvas));
                            }
                        } else if (currentActiveView === 'stats-dashboard') {
                            const viewContainer = document.getElementById('stats-dashboard-view');
                            const monthSelect = document.getElementById('stats-month-select');
                            const yearSelect = document.getElementById('stats-year-select');
                            if (viewContainer && monthSelect && yearSelect) {
                                const currentMonth = parseInt(monthSelect.value);
                                const currentYear = parseInt(yearSelect.value);
                                await App.ui.renderStatsDashboardView(viewContainer, { month: currentMonth, year: currentYear });
                            }
                        }
                    }, 50);
                },

                applyMobileView() {
                    const enabled = App.settings.get('mobileViewEnabled');
                    document.body.classList.toggle('mobile-view', enabled);

                    const toggleSwitch = document.getElementById('mobile-view-toggle');
                    const labelContainer = document.getElementById('mobile-view-label-container');

                    if (toggleSwitch) {
                        toggleSwitch.classList.toggle('active', enabled);
                    }
                    if (labelContainer) {
                        // NEW: More intuitive labels
                        const label = enabled ? 'Switch to Desktop View' : 'Switch to Mobile View';
                        const description = enabled ? 'For utilizing full power of App' : 'Optimized for small screens & touch.';
                        labelContainer.innerHTML = `<b>${label}</b><small>${description}</small>`;
                    }
                },

                applyFontSettings() {
                    const family = App.settings.get('fontFamily');
                    const size = App.settings.get('fontSize');
                    const lineHeight = App.settings.get('lineHeight');
                    document.documentElement.style.setProperty('--article-font-family', family);
                    document.documentElement.style.setProperty('--article-font-size', size);
                    document.documentElement.style.setProperty('--article-line-height', lineHeight);
                },

                updateHeaderState() {
                    const newArticleBtn = document.getElementById('new-article-btn');
                    if (!newArticleBtn) return;

                    if (App.state.storageMode === 'fileSystem' && !App.state.directoryHandle) {
                        newArticleBtn.disabled = true;
                        newArticleBtn.classList.remove('limit-reached');
                        newArticleBtn.title = 'Select a folder to begin';
                        return;
                    }

                    newArticleBtn.disabled = false;
                    const isPremium = App.license.isPremium();
                    const articleLimit = App.config.sparkTierLimit;
                    const articlesUsed = App.state.articles.length;
                    const canCreateArticle = isPremium || articlesUsed < articleLimit;

                    newArticleBtn.classList.toggle('limit-reached', !canCreateArticle);

                    if (!canCreateArticle) {
                        newArticleBtn.title = `Spark plan limit of ${articleLimit} notes reached. Go Premium for unlimited notes.`;
                        newArticleBtn.onclick = () => App.ui.showAscensionModal('limit');
                    } else {
                        newArticleBtn.title = 'New Article (Alt+Shift+N)';
                        newArticleBtn.onclick = () => App.events.createNewArticle();
                    }
                },

                pulseProfileBadge(duration = 5000) {
                    const profileBadge = document.getElementById('profile-badge');
                    if (!profileBadge) return;
                    profileBadge.classList.add('is-animating');
                    if (this._badgeAnimationTimer) {
                        clearTimeout(this._badgeAnimationTimer);
                    }
                    this._badgeAnimationTimer = setTimeout(() => {
                        profileBadge.classList.remove('is-animating');
                        this._badgeAnimationTimer = null;
                    }, duration);
                },

                applyReaderTheme() {
                    const wrapper = document.querySelector('.article-view-wrapper');
                    if (!wrapper) return;
                    const theme = App.state.activeReaderTheme;
                    wrapper.className = wrapper.className.replace(/\bambiance-\S+/g, '').trim();

                    if (theme !== 'default') {
                        wrapper.classList.add(`ambiance-${theme}`);
                    }
                },
                applyStudyTheme() {
                    const studyView = document.querySelector('.study-view');
                    if (!studyView) return;
                    const theme = App.state.studySession.activeTheme;

                    studyView.className = studyView.className.replace(/\bambiance-\S+/g, '').trim();

                    if (theme !== 'default') {
                        studyView.classList.add(`ambiance-${theme}`);
                    }
                },

                showSelectionToolbar(range) {
                    const toolbar = document.getElementById('selection-toolbar');

                    const icons = {
                        format: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"></path><path d="M17 4v16"></path><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"></path></svg>`,
                        drag: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
                        palette: `<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>`,
                        tag: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
                        cloze: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><path d="M2 12h20"/><path d="M17 2v5"/><path d="M7 2v5"/></svg>`,
                        aiMagic: `<svg viewBox="0 0 24 24" width="20" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2.35M10.15 6.344l-1.493-1.493M6.344 10.15l-2.187-2.187M3 12h2.35M6.344 13.85l-2.187 2.187M10.15 17.656l-1.493 1.493M12 21v-2.35M13.85 17.656l1.493 1.493M17.656 13.85l2.187 2.187M21 12h-2.35M17.656 10.15l2.187-2.187M13.85 6.344l1.493-1.493"/><circle cx="12" cy="12" r="2.35"/></svg>`,
                        clear: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 12.5h10.5M11 12.5a5 5 0 0 1-5-5V4.5"/><path d="M4 4.5h10.5"/><path d="M4 19.5h10.5"/><path d="m18 10-2-2 2-2"/><path d="m21 17-2-2 2-2"/></svg>`,
                        orientation: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`
                    };

                    const highlightButtons = App.config.highlightClasses.slice(0, 6).map((cls, i) =>
                        `<button class="btn-icon highlight-btn" 
                    style="background-color:var(--${cls.replace('highlight-', 'hl-')}-bg); border:1px solid var(--${cls.replace('highlight-', 'hl-')}-border);" 
                    title="Highlight (Cmd+Shift+${i + 2})" onmousedown="event.preventDefault(); App.events.applyFormatting('class', '${cls}')"></button>`
                    ).join('');


                    toolbar.innerHTML = `
                        <div class="toolbar-wrapper">
                            <div class="toolbar-drag-handle" title="Drag Toolbar or Double click to Lock">${icons.drag}</div>
                            <button id="ai-magic-btn" class="btn-icon" title="AI Magic ✨ (Ctrl+J)">${icons.aiMagic}</button>
                            <div class="control-divider"></div>
                            
                            <div class="format-toolbar-group" style="position: relative;">
                                <button class="btn-icon" title="Text Formatting" onmousedown="event.preventDefault()">${icons.format}</button>
                                <div class="format-popover" style="bottom: 110%;">
                                    <button class="btn-icon" title="Bold (Cmd/Ctrl+B)" onmousedown="event.preventDefault(); document.execCommand('bold', false, null);" aria-label="Bold text"><b>B</b></button>
                                    <button class="btn-icon" title="Italic (Cmd/Ctrl+I)" onmousedown="event.preventDefault(); document.execCommand('italic', false, null);" aria-label="Italicize text"><i>I</i></button>
                                    <button class="btn-icon" title="Underline (Cmd/Ctrl+U)" onmousedown="event.preventDefault(); document.execCommand('underline', false, null);" aria-label="Underline text"><u>U</u></button>
                                    <button class="btn-icon" title="Insert Checkbox" data-action="insertCheckbox" onmousedown="event.preventDefault(); App.events.handleArticleControlsClick({ target: { closest: () => ({ dataset: { action: 'insertCheckbox' } }) } })" aria-label="Insert checkbox"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><polyline points="9 11 12 14 22 4"></polyline></svg></button>
                                    <button class="btn-icon" title="Create Mind Map Node (Cmd/Ctrl+Shift+M)" onmousedown="event.preventDefault(); App.events.wrapMindMapNode()"><i class="fa-solid fa-sitemap"></i></button>
                                </div>
                            </div>
                            ${highlightButtons}
                            <div class="control-divider"></div>
                            <button class="btn-icon" title="Create Tag [[...]]" onmousedown="event.preventDefault(); App.contentTools.tagSelection()">${icons.tag}</button>
                            <button class="btn-icon" title="Create Cloze Flashcard" onmousedown="event.preventDefault(); App.events.applyFormatting('cloze')">${icons.cloze}</button>
                            <button class="btn-icon" title="Remove Formatting" onmousedown="event.preventDefault(); App.events.removeFormatting()">${icons.clear}</button>
                            <button class="btn-icon" id="toolbar-orientation-toggle" title="Toggle Layout">${icons.orientation}</button>
                        </div>
                    `;

                    const rect = range.getBoundingClientRect();
                    toolbar.style.display = 'block';
                    const isMobileView = document.body.classList.contains('mobile-view');
                    const toolbarHeight = toolbar.offsetHeight || 50;
                    const toolbarWidth = toolbar.offsetWidth || 300;
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const MARGIN = 10;
                    const GAP = 10;

                    const wrapper = toolbar.querySelector('.toolbar-wrapper');
                    const dragHandle = toolbar.querySelector('.toolbar-drag-handle');
                    const toggleBtn = document.getElementById('toolbar-orientation-toggle');

                    // Load State
                    let savedOrientation = 'horizontal';
                    let savedX = null, savedY = null;
                    try {
                        const savedState = JSON.parse(localStorage.getItem('noteKashToolbarState'));
                        if (savedState) {
                            savedOrientation = savedState.orientation ?? 'horizontal';
                            savedX = savedState.x;
                            savedY = savedState.y;
                        }
                    } catch (e) { }

                    // Check for Locked State
                    let isLocked = false;
                    let lockedX = null, lockedY = null;
                    try {
                        const lockState = JSON.parse(localStorage.getItem('noteKashToolbarLock'));
                        if (lockState && lockState.isLocked) {
                            isLocked = true;
                            lockedX = lockState.x;
                            lockedY = lockState.y;
                        }
                    } catch (e) { }

                    const isVertical = savedOrientation === 'vertical';

                    // --- POSITIONING LOGIC ---
                    if (isLocked && lockedX !== null && lockedY !== null) {
                        // === LOCKED MODE: Always Fixed Position ===
                        toolbar.style.position = 'fixed';
                        // Maintain current orientation style, but force fixed pos
                        if (isVertical) {
                            wrapper.classList.add('vertical');
                            toggleBtn.querySelector('svg').style.transform = 'rotate(90deg)';
                        } else {
                            wrapper.classList.remove('vertical');
                            toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
                        }

                        toolbar.style.left = `${lockedX}px`;
                        toolbar.style.top = `${lockedY}px`;
                        dragHandle.classList.add('locked');

                    } else if (isVertical) {
                        // VERTICAL MODE: FIXED POSITION (Screen Relative)
                        toolbar.style.position = 'fixed';
                        wrapper.classList.add('vertical');
                        toggleBtn.querySelector('svg').style.transform = 'rotate(90deg)';
                        dragHandle.classList.remove('locked');

                        let topPos, leftPos;

                        // Check if saved position is valid (within current viewport)
                        // Note: We're interpreting savedX/Y as viewport coords for vertical mode
                        const isValid = savedX !== null && savedY !== null &&
                            savedX >= MARGIN && savedX + toolbarWidth <= viewportWidth - MARGIN &&
                            savedY >= MARGIN && savedY + toolbarHeight <= viewportHeight - MARGIN;

                        if (isValid) {
                            leftPos = savedX;
                            topPos = savedY;
                        } else {
                            // Default to unobtrusive position near selection if possible
                            leftPos = rect.right + GAP;
                            topPos = rect.top;

                            // Adjust if off screen
                            if (leftPos + toolbarWidth > viewportWidth - MARGIN) {
                                leftPos = rect.left - toolbarWidth - GAP; // Try left
                            }
                            if (leftPos < MARGIN) {
                                leftPos = viewportWidth - toolbarWidth - MARGIN; // right dock
                            }
                            if (topPos + toolbarHeight > viewportHeight - MARGIN) {
                                topPos = viewportHeight - toolbarHeight - MARGIN;
                            }
                            if (topPos < MARGIN) topPos = MARGIN;
                        }

                        toolbar.style.left = `${leftPos}px`;
                        toolbar.style.top = `${topPos}px`;

                    } else {
                        // HORIZONTAL MODE: ABSOLUTE POSITION (Document Relative)
                        toolbar.style.position = 'absolute';
                        wrapper.classList.remove('vertical');
                        toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
                        dragHandle.classList.remove('locked');

                        let topPos = rect.bottom + window.scrollY + GAP;
                        let leftPos = rect.left + window.scrollX + (rect.width / 2) - (toolbarWidth / 2);

                        // Clamp Horizontal
                        if (leftPos < window.scrollX + MARGIN) leftPos = window.scrollX + MARGIN;
                        if (leftPos + toolbarWidth > window.scrollX + viewportWidth - MARGIN) {
                            leftPos = window.scrollX + viewportWidth - toolbarWidth - MARGIN;
                        }

                        // Flip if bottom overflow
                        if (rect.bottom + GAP + toolbarHeight > viewportHeight) {
                            const topSpace = rect.top - MARGIN;
                            if (topSpace > toolbarHeight) {
                                topPos = rect.top + window.scrollY - toolbarHeight - GAP;
                            }
                        }

                        toolbar.style.left = `${leftPos}px`;
                        toolbar.style.top = `${topPos}px`;
                    }

                    // --- HELPERS ---
                    const saveState = () => {
                        // Only save routine state if NOT locked. 
                        // If locked, we don't want to overwrite the 'normal' preferred position with the locked one necessarily, but user might expect it.
                        // Actually, let's keep them separate.
                        const style = window.getComputedStyle(toolbar);
                        const isVert = wrapper.classList.contains('vertical');
                        const x = parseFloat(style.left);
                        const y = parseFloat(style.top);

                        localStorage.setItem('noteKashToolbarState', JSON.stringify({
                            x: x, y: y,
                            orientation: isVert ? 'vertical' : 'horizontal'
                        }));

                        // If locked, update lock coordinates too so dragging works while locked
                        if (dragHandle.classList.contains('locked')) {
                            // For locked, we need Viewport coordinates.
                            // If position is fixed, x/y are already viewport.
                            // If position is absolute, we must subtract scroll.
                            let vx = x, vy = y;
                            if (toolbar.style.position === 'absolute') {
                                vx -= window.scrollX;
                                vy -= window.scrollY;
                            }
                            localStorage.setItem('noteKashToolbarLock', JSON.stringify({ isLocked: true, x: vx, y: vy }));
                        }
                    };

                    document.getElementById('ai-magic-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        App.ui.hideSelectionToolbar();
                        App.ui.aiMagicModal.open();
                    });

                    // TOGGLE ORIENTATION
                    toggleBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const isVertNow = wrapper.classList.toggle('vertical');
                        toggleBtn.querySelector('svg').style.transform = isVertNow ? 'rotate(90deg)' : 'rotate(0deg)';

                        const rectBefore = toolbar.getBoundingClientRect();

                        // If locked, we just stay fixed but rotate.
                        // If unlocked, we switch positioning modes.
                        if (!dragHandle.classList.contains('locked')) {
                            if (isVertNow) {
                                // Switch to Fixed (Viewport)
                                toolbar.style.position = 'fixed';
                                toolbar.style.left = rectBefore.left + 'px';
                                toolbar.style.top = rectBefore.top + 'px';
                            } else {
                                // Switch to Absolute (Document)
                                toolbar.style.position = 'absolute';
                                toolbar.style.left = (rectBefore.left + window.scrollX) + 'px';
                                toolbar.style.top = (rectBefore.top + window.scrollY) + 'px';
                            }
                        }
                        saveState();
                    });

                    // LOCK TOGGLE
                    dragHandle.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const isLockedNow = dragHandle.classList.toggle('locked');
                        if (isLockedNow) {
                            const r = toolbar.getBoundingClientRect();
                            // Lock to current viewport coordinates
                            toolbar.style.position = 'fixed';
                            toolbar.style.left = r.left + 'px';
                            toolbar.style.top = r.top + 'px';

                            localStorage.setItem('noteKashToolbarLock', JSON.stringify({ isLocked: true, x: r.left, y: r.top }));
                            App.ui.showToast("Toolbar Position Locked 🔒", { type: 'success' });
                        } else {
                            localStorage.removeItem('noteKashToolbarLock');
                            App.ui.showToast("Toolbar Position Unlocked 🔓", { type: 'info' });
                            // We don't immediately jump; next selection will reset, or user can drag/toggle.
                            // But let's revert to 'smart' behavior if we are horizontal?
                            // Actually, let's just leave it where it is until next selection or interaction.
                        }
                    });

                    // DRAG LOGIC
                    let offsetX, offsetY;
                    const move = (e) => {
                        const cx = e.touches ? e.touches[0].clientX : e.clientX;
                        const cy = e.touches ? e.touches[0].clientY : e.clientY;

                        let newX = cx - offsetX;
                        let newY = cy - offsetY;

                        if (toolbar.style.position === 'absolute') {
                            newX += window.scrollX;
                            newY += window.scrollY;
                        }

                        toolbar.style.left = `${newX}px`;
                        toolbar.style.top = `${newY}px`;
                    };

                    const up = () => {
                        document.removeEventListener('mousemove', move);
                        document.removeEventListener('mouseup', up);
                        document.removeEventListener('touchmove', move);
                        document.removeEventListener('touchend', up);
                        saveState();
                    };

                    const down = (e) => {
                        e.preventDefault();
                        const r = toolbar.getBoundingClientRect();
                        const cx = e.touches ? e.touches[0].clientX : e.clientX;
                        const cy = e.touches ? e.touches[0].clientY : e.clientY;

                        offsetX = cx - r.left;
                        offsetY = cy - r.top;

                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', up);
                        document.addEventListener('touchmove', move);
                        document.addEventListener('touchend', up);
                    };

                    dragHandle.addEventListener('mousedown', down);
                    dragHandle.addEventListener('touchstart', down, { passive: false });
                },


                hideSelectionToolbar() { document.getElementById('selection-toolbar').style.display = 'none'; },


                showImageToolbar(imageContainer) {
                    const toolbar = document.getElementById('image-toolbar');
                    const isHighlighted = imageContainer.classList.contains('highlighted-image');
                    const isWriteMode = App.state.currentMode === 'write';
                    const isWhiteboardEmbed = imageContainer.classList.contains('wb-embed');

                    // Whiteboard buttons (moved to popover)
                    const editWhiteboardBtn = isWhiteboardEmbed ? `
                        <button class="btn-icon" title="Edit Whiteboard" onmousedown="event.preventDefault(); App.whiteboard.reopenFromEmbed(App.state.selectedImageContainer);" style="color: var(--primary-color); font-weight: 600;">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                    ` : '';

                    const annotateBtn = `
                        <button class="btn-icon" title="Annotate / Whiteboard" onmousedown="event.preventDefault(); App.whiteboard.initImageAnnotation(App.state.selectedImageContainer);">
                            <i class="fa-solid fa-pen-nib"></i>
                        </button>
                    `;

                    const toolsPopover = `
                <div class="list-toolbar-group" id="image-tools-group">
                    <button class="btn-icon" title="More Image Tools" aria-label="More image tools">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="list-popover">
                        ${editWhiteboardBtn}
                        ${annotateBtn}
                        <button class="btn-icon ${!App.license.isPremium() ? 'premium-feature-locked' : ''}" data-feature-key="ocr" title="Extract Text from Image (OCR)" onmousedown="event.preventDefault(); if (App.license.isPremium()) App.services.image.runOCR(); else App.ui.showAscensionModal('ocr');">
                            <i class="fa-solid fa-file-pen"></i>
                        </button>
                        <button class="btn-icon" title="Copy Image" onmousedown="event.preventDefault(); App.services.image.copy(App.state.selectedImageContainer);">${App.util.icons.copy}</button>
                        <button class="btn-icon" title="Reset Size" onmousedown="event.preventDefault(); App.events.handleImageAlignment('reset-size');">${App.util.icons.reset}</button>
                        ${isWriteMode ? `<button class="btn-icon" title="Delete Image" onmousedown="event.preventDefault(); App.services.image.delete(App.state.selectedImageContainer);">${App.util.icons.trash}</button>` : ''}
                    </div>
                </div>
            `;

                    const toolbarButtons = `
                <button class="btn-icon" title="Align Left" onmousedown="event.preventDefault(); App.events.handleImageAlignment('align-left');">${App.util.icons.alignLeft}</button>
                <button class="btn-icon" title="Align Center" onmousedown="event.preventDefault(); App.events.handleImageAlignment('align-center');">${App.util.icons.alignCenter}</button>
                <button class="btn-icon" title="Align Right" onmousedown="event.preventDefault(); App.events.handleImageAlignment('align-right');">${App.util.icons.alignRight}</button>
                <div class="control-divider"></div>
                <button class="btn-icon" title="Highlight Image" onmousedown="event.preventDefault(); App.events.highlightImage();" style="color: ${isHighlighted ? 'var(--primary-color)' : 'inherit'}">${isHighlighted ? App.util.icons.star : App.util.icons.starOutline}</button>
                <button class="btn-icon" title="View Fullscreen" onmousedown="event.preventDefault(); App.ui.imageLightbox.open(App.state.selectedImageContainer);">${App.util.icons.expand}</button>
                ${isWriteMode ? `<button class="btn-icon" title="Add/Edit Caption" onmousedown="event.preventDefault(); App.events.addImageCaption();">${App.util.icons.caption}</button>` : ''}
                <div class="control-divider"></div>
                ${toolsPopover}
            `;

                    toolbar.innerHTML = `<div class="toolbar-wrapper">${toolbarButtons}</div>`;
                    const rect = imageContainer.getBoundingClientRect();
                    toolbar.style.display = 'block';
                    toolbar.style.left = `${rect.left + window.scrollX + rect.width / 2 - toolbar.offsetWidth / 2}px`;
                    toolbar.style.top = `${rect.top + window.scrollY - toolbar.offsetHeight - 8}px`;
                },
                hideImageToolbar() { document.getElementById('image-toolbar').style.display = 'none'; },

                aiMagic: {
                    show(range) { /* Safe stub - no operation needed */ },
                    hide() { /* Safe stub - no operation needed */ }
                },

                aiMagicModal: {
                    state: {
                        isOpen: false,
                        savedRange: null,
                        commands: [],
                        filteredCommands: [],
                        selectedIndex: 0,
                        fuse: null,
                        selectedFormat: 'auto',
                        // Viewer mode state
                        mode: 'modal',        // 'modal' (Write) or 'viewer' (Presentation/PDF)
                        viewerHistory: [],     // Chat messages [{role:'user'|'ai', content:'...'}]
                        viewerContext: null,   // 'presentation' | 'pdf'
                        isPinned: false,
                        isResizing: false,
                    },

                    init() {
                        this._handleKeyDown = this._handleKeyDown.bind(this);
                    },

                    // ===== VIEWER MODE (Presentation/PDF Sidebar) =====

                    openAsViewer(context) {
                        if (this.state.isOpen && this.state.mode === 'viewer') {
                            // Already open as viewer, just toggle
                            this.closeViewer();
                            return;
                        }
                        if (this.state.isOpen && this.state.mode === 'modal') this.close();

                        this.state.isOpen = true;
                        this.state.mode = 'viewer';
                        this.state.viewerContext = context;

                        const panelHTML = `
                        <div class="ai-magic-viewer-panel">
                            <div class="ai-viewer-resize-handle"></div>
                            <div class="ai-viewer-header">
                                <span class="witty-gradient-text" style="font-size: 1.1rem;">NoteKash AI</span>
                                <div class="ai-viewer-header-actions">
                                    <button class="btn-icon" title="Clear Conversation" onclick="App.ui.aiMagicModal.clearViewerHistory()">
                                        <i class="fa-solid fa-broom"></i>
                                    </button>
                                    <button class="btn-icon" title="Save as Note" onclick="App.ui.aiMagicModal.saveViewerAsNote()">
                                        <i class="fa-solid fa-floppy-disk"></i>
                                    </button>
                                    <button class="btn-icon" title="Close (Esc)" onclick="App.ui.aiMagicModal.closeViewer()">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="ai-viewer-conversation" id="ai-viewer-conversation"></div>
                            
                            <div class="ai-viewer-input-container">
                                <!-- Bookmark Popover moved inside for better positioning -->
                                <div class="ai-viewer-bookmarks-popover" id="ai-viewer-bookmarks-popover"></div>

                                <button class="btn-icon" id="ai-viewer-bookmarks-btn" title="Saved Prompts" onclick="App.ui.aiMagicModal._toggleViewerBookmarks()">
                                    <i class="fa-solid fa-book-bookmark"></i>
                                </button>
                                
                                <textarea class="ai-viewer-input" id="ai-viewer-input" placeholder="Ask about this ${context === 'pdf' ? 'PDF page' : 'slide'}..." rows="1"></textarea>
                                
                                <button class="btn-icon" id="ai-viewer-save-prompt-btn" title="Save Prompt" onclick="App.ui.aiMagicModal._saveViewerPrompt()">
                                    <i class="fa-regular fa-bookmark"></i>
                                </button>

                                <button class="btn-icon btn-primary ai-viewer-send-btn" id="ai-viewer-send-btn" title="Send">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                </button>
                            </div>
                        </div>`;

                        document.getElementById('modal-container').innerHTML = panelHTML;
                        this._renderViewerConversation();
                        this._addViewerListeners();
                        document.addEventListener('keydown', this._handleKeyDown, true);

                        // Auto-focus the input
                        setTimeout(() => document.getElementById('ai-viewer-input')?.focus(), 100);
                    },

                    closeViewer() {
                        if (!this.state.isOpen || this.state.mode !== 'viewer') return;
                        this.state.isOpen = false;
                        this.state.mode = 'modal';
                        document.getElementById('modal-container').innerHTML = '';
                        document.removeEventListener('keydown', this._handleKeyDown, true);
                        if (!this.state.isPinned) {
                            this.state.viewerHistory = [];
                        }
                    },

                    _getViewerContext() {
                        try {
                            if (this.state.viewerContext === 'pdf') {
                                // Get text content from visible PDF page
                                const pageContainer = document.querySelector('.pdf-page-container.active, .pdf-page-container');
                                if (pageContainer) {
                                    const textLayer = pageContainer.querySelector('.textLayer');
                                    if (textLayer && textLayer.textContent.trim()) return textLayer.textContent.trim();
                                }
                                // Fallback: get page number info
                                const pageNum = App.pdf?.state?.pageNum || 1;
                                const totalPages = App.pdf?.state?.pdfDoc?.numPages || '?';
                                return `[PDF Viewer - Page ${pageNum} of ${totalPages}. Text extraction unavailable for this page.]`;
                            } else if (this.state.viewerContext === 'category' || this.state.viewerContext === 'mindmap' || this.state.viewerContext === 'visual-map') {
                                return `[${this.state.viewerContext.toUpperCase()} VIEW] The user is currently exploring their notes in the ${this.state.viewerContext} view. Provide a helpful conceptual explanation.`;
                            } else {
                                // Presentation / Focus mode: get current slide content
                                const overlay = document.getElementById('focus-mode-overlay');
                                if (overlay) {
                                    const body = overlay.querySelector('.focus-mode-body');
                                    if (body && body.textContent.trim()) return body.textContent.trim();
                                }
                                // Fallback
                                const session = App.state.focusSession;
                                if (session?.isActive && session.articles?.[session.currentIndex]) {
                                    const article = session.articles[session.currentIndex];
                                    return article.content || article.title || '[Presentation mode - no text available]';
                                }
                                return '[Presentation mode - no content available]';
                            }
                        } catch (e) {
                            console.error('Error getting viewer context:', e);
                            return '[Could not gather context from current view]';
                        }
                    },

                    async _sendViewerMessage(text) {
                        if (!text || !text.trim()) return;
                        text = text.trim();

                        if (!App.license.isPremium()) {
                            App.ui.showAscensionModal();
                            return;
                        }

                        // Add user message
                        this.state.viewerHistory.push({ role: 'user', content: text });
                        this._renderViewerConversation();

                        // Clear input
                        const input = document.getElementById('ai-viewer-input');
                        if (input) { input.value = ''; input.style.height = 'auto'; }

                        // Show thinking indicator
                        this.state.viewerHistory.push({ role: 'ai', content: null, isThinking: true });
                        this._renderViewerConversation();

                        try {
                            const context = this._getViewerContext();

                            // Build conversation history as text for the API
                            const historyText = this.state.viewerHistory
                                .filter(m => !m.isThinking)
                                .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                                .join('\n');

                            const systemPrompt = `You are NoteKash AI, a brilliant and charming study companion. 
                                    Your mission: Explain the current slide/page content to the user in a way that is insightful, easy to grasp, and visually stunning.

                                    Current Context (${this.state.viewerContext === 'pdf' ? 'PDF Page' : 'Presentation Slide'}):
                                    ---
                                    ${context}
                                    ---

                                    Rules for your response:
                                    1. **Be Concise & engaging**: Don't just dump text. Use a conversational, encouraging tone.
                                    2. **Visual Hierarchy is King**:
                                       - **Headings & Questions**: ALWAYS use <h3 class="text-red"> for headings and <strong class="text-red"> for questions.
                                       - **Key Terms**: Use <strong class="text-blue">, <strong class="text-green">, <strong class="text-orange">, <strong class="text-magenta">, <strong class="text-teal">, or <strong class="text-slate"> for critical keywords/dates/terms/ or some other things, to make them pop! and make overall presentation lively and colorful (Rotate colors for variety and aesthetics except Red color which is used for Questions/headings/sub-headings etc.).
                                       - **Nuance**: Use <em> for interesting side-notes.
                                    3. **Structure**: Use bullet points (<ul>/<li>) frequently to break down complex ideas.
                                    4. **The "Wow" Factor**: Don't be boring. Make the user feel like they just learned something amazing. If the content is dry, spice it up with a practical example or a quick "Pro Tip".
                                    
                                    Make it look beautiful and structured appropriately for a sidebar study notes assistant. Return CLEAN HTML.`;

                            const userPrompt = historyText ? `${historyText}\nUser: ${text}` : text;

                            const result = await App.services.ai.queryGenerativeAI(systemPrompt, userPrompt);

                            // Remove thinking indicator
                            this.state.viewerHistory = this.state.viewerHistory.filter(m => !m.isThinking);

                            if (result && result.trim()) {
                                this.state.viewerHistory.push({ role: 'ai', content: result.trim().replace(/^```(html)?\n?/, '').replace(/\n?```$/, '') });
                            } else {
                                this.state.viewerHistory.push({ role: 'ai', content: '<em>No response received. Please try again.</em>' });
                            }
                        } catch (err) {
                            console.error('AI Viewer error:', err);
                            this.state.viewerHistory = this.state.viewerHistory.filter(m => !m.isThinking);
                            const errorMsg = err?.message?.includes('quota') || err?.message?.includes('429')
                                ? '⚠️ API quota exceeded. Please try again later.'
                                : `⚠️ Error: ${err.message || 'Something went wrong.'}`;
                            this.state.viewerHistory.push({ role: 'ai', content: errorMsg });
                        }

                        this._renderViewerConversation();
                    },

                    _toggleViewerBookmarks() {
                        const popover = document.getElementById('ai-viewer-bookmarks-popover');
                        if (!popover) return;

                        if (popover.classList.contains('active')) {
                            popover.classList.remove('active');
                            return;
                        }

                        // Populate popover with Header (Close Button)
                        try {
                            const prompts = JSON.parse(localStorage.getItem('noteKashCustomPrompts') || '[]');
                            const headerHTML = `
                                <div class="ai-viewer-bookmarks-header">
                                    <span>Saved Prompts</span>
                                    <button class="btn-icon" onclick="App.ui.aiMagicModal._toggleViewerBookmarks()" style="width:24px; height:24px;" title="Close">
                                        <i class="fa-solid fa-xmark"></i>
                                    </button>
                                </div>`;

                            if (prompts.length === 0) {
                                popover.innerHTML = headerHTML + '<div style="padding: 1rem; text-align: center; color: var(--text-secondary); height: 100px; display: flex; align-items: center; justify-content: center;">No saved prompts yet.</div>';
                            } else {
                                popover.innerHTML = headerHTML + prompts.map((p, index) => `
                                    <div class="ai-viewer-bookmark-item">
                                        <div class="ai-viewer-bookmark-content" onclick="App.ui.aiMagicModal._useViewerBookmark('${p.text.replace(/'/g, "\\'")}')">
                                            <i class="fa-solid fa-bookmark"></i>
                                            <span>${p.name || (p.text.length > 25 ? p.text.substring(0, 25) + '...' : p.text)}</span>
                                        </div>
                                        <button class="ai-viewer-bookmark-delete" onclick="App.ui.aiMagicModal._deleteViewerBookmark(event, ${index})" title="Delete Prompt">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('');
                            }
                            popover.classList.add('active');
                        } catch (e) { console.error('Error loading bookmarks', e); }
                    },

                    _deleteViewerBookmark(event, index) {
                        event.stopPropagation();
                        try {
                            const prompts = JSON.parse(localStorage.getItem('noteKashCustomPrompts') || '[]');
                            if (index >= 0 && index < prompts.length) {
                                prompts.splice(index, 1);
                                localStorage.setItem('noteKashCustomPrompts', JSON.stringify(prompts));
                                App.ui.showToast('Prompt deleted!', 'success');
                                // Refresh the list
                                const popover = document.getElementById('ai-viewer-bookmarks-popover');
                                if (popover && popover.classList.contains('active')) {
                                    popover.classList.remove('active'); // Close to reset state (or we could just re-render)
                                    setTimeout(() => this._toggleViewerBookmarks(), 50); // Re-open to refresh
                                }
                            }
                        } catch (e) { console.error('Error deleting bookmark', e); }
                    },

                    _useViewerBookmark(text) {
                        const input = document.getElementById('ai-viewer-input');
                        if (input) {
                            input.value = text;
                            input.focus();
                            // Auto-resize
                            input.style.height = 'auto';
                            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
                        }
                        const popover = document.getElementById('ai-viewer-bookmarks-popover');
                        if (popover) popover.classList.remove('active');
                    },

                    _saveViewerPrompt() {
                        const input = document.getElementById('ai-viewer-input');
                        if (!input || !input.value.trim()) {
                            App.ui.showToast("Type something to save!", "warning");
                            return;
                        }
                        const text = input.value.trim();
                        // Use existing logic
                        this._saveCustomPrompt(text);
                    },

                    _renderViewerConversation() {
                        const area = document.getElementById('ai-viewer-conversation');
                        if (!area) return;

                        if (this.state.viewerHistory.length === 0) {
                            // Empty state with prompt starters
                            const contextLabel = this.state.viewerContext === 'pdf' ? 'PDF Page' : 'Slide';
                            const starters = this.state.viewerContext === 'pdf'
                                ? [
                                    { icon: 'fa-solid fa-file-lines', label: 'Summarize', text: 'Summarize this page for me' },
                                    { icon: 'fa-solid fa-lightbulb', label: 'Explain', text: 'Explain the key concepts on this page' },
                                    { icon: 'fa-solid fa-clipboard-question', label: 'Quiz Me', text: 'Generate quiz questions from this page' },
                                ]
                                : [
                                    { icon: 'fa-solid fa-file-lines', label: 'Summarize', text: 'Summarize this slide' },
                                    { icon: 'fa-solid fa-lightbulb', label: 'Explain', text: 'Explain the content on this slide in detail' },
                                    { icon: 'fa-solid fa-brain', label: 'Key Points', text: 'What are the key takeaways from this slide?' },
                                ];

                            area.innerHTML = `
                                <div class="ai-viewer-empty-state">
                                    <div class="ai-viewer-centered-header">
                                        <h2 class="witty-gradient-text">AI Magic</h2>
                                        <p>Ask me anything about this ${contextLabel.toLowerCase()}</p>
                                    </div>
                                    <div class="ai-viewer-prompt-grid">
                                        ${starters.map(s => `
                                            <div class="ai-viewer-prompt-card" onclick="App.ui.aiMagicModal._sendViewerMessage('${s.text}')">
                                                <i class="${s.icon}"></i>
                                                ${s.label}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>`;
                            return;
                        }

                        area.innerHTML = this.state.viewerHistory.map(msg => {
                            if (msg.isThinking) {
                                return `
                                    <div class="ai-viewer-message ai">
                                        <div class="ai-viewer-message-bubble ai-viewer-thinking">
                                            <div class="thinking-dots"><span></span><span></span><span></span></div>
                                        </div>
                                    </div>`;
                            }
                            const bubbleContent = msg.role === 'user'
                                ? App.util.escapeHtml ? App.util.escapeHtml(msg.content) : msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                : msg.content;

                            const actions = msg.role === 'ai' ? `
                                <div class="ai-viewer-bubble-actions">
                                    <button class="btn btn-sm btn-ghost" onclick="App.ui.aiMagicModal._copyBubble(this)">
                                        ${App.util.icons?.copy || '<i class="fa-solid fa-copy"></i>'} Copy
                                    </button>
                                    <button class="btn btn-sm btn-ghost" onclick="App.ui.aiMagicModal._insertBubbleAsTextile(this)">
                                        <i class="fa-solid fa-paste"></i> Insert
                                    </button>
                                </div>` : '';

                            return `
                                <div class="ai-viewer-message ${msg.role}">
                                    <div class="ai-viewer-message-bubble">
                                        ${bubbleContent}
                                        ${actions}
                                    </div>
                                </div>`;
                        }).join('');

                        // Auto-scroll to bottom
                        area.scrollTop = area.scrollHeight;
                    },

                    _addViewerListeners() {
                        const input = document.getElementById('ai-viewer-input');
                        const sendBtn = document.getElementById('ai-viewer-send-btn');
                        const resizeHandle = document.querySelector('.ai-viewer-resize-handle');

                        // Close bookmark popover on click outside
                        document.addEventListener('click', (e) => {
                            const popover = document.getElementById('ai-viewer-bookmarks-popover');
                            const toggleBtn = document.getElementById('ai-viewer-bookmarks-btn');

                            if (popover && popover.classList.contains('active')) {
                                // If click is NOT inside popover AND NOT on the toggle button
                                if (!popover.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
                                    popover.classList.remove('active');
                                }
                            }
                        });

                        if (sendBtn) {
                            sendBtn.addEventListener('click', () => {
                                const text = input?.value;
                                if (text) this._sendViewerMessage(text);
                            });
                        }

                        if (input) {
                            input.addEventListener('keydown', (e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const text = input.value;
                                    if (text) this._sendViewerMessage(text);
                                }
                            });
                            // Auto-resize textarea
                            input.addEventListener('input', () => {
                                input.style.height = 'auto';
                                input.style.height = Math.min(input.scrollHeight, 150) + 'px';
                            });
                        }

                        // Resize handle
                        if (resizeHandle) {
                            const panel = document.querySelector('.ai-magic-viewer-panel');
                            let startX, startWidth;

                            const onMouseMove = (e) => {
                                if (!this.state.isResizing) return;
                                const dx = startX - e.clientX;
                                const newWidth = Math.max(300, Math.min(startWidth + dx, window.innerWidth * 0.75));
                                panel.style.width = newWidth + 'px';
                            };
                            const onMouseUp = () => {
                                this.state.isResizing = false;
                                resizeHandle.classList.remove('resizing');
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', onMouseUp);
                            };

                            resizeHandle.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                this.state.isResizing = true;
                                startX = e.clientX;
                                startWidth = panel.offsetWidth;
                                resizeHandle.classList.add('resizing');
                                document.addEventListener('mousemove', onMouseMove);
                                document.addEventListener('mouseup', onMouseUp);
                            });
                        }
                    },

                    _copyBubble(btn) {
                        if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                            App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                            return;
                        }
                        const bubble = btn.closest('.ai-viewer-message-bubble');
                        if (!bubble) return;
                        // Get content without the actions div
                        const clone = bubble.cloneNode(true);
                        clone.querySelector('.ai-viewer-bubble-actions')?.remove();
                        const html = clone.innerHTML;
                        const text = clone.textContent;

                        try {
                            navigator.clipboard.write([new ClipboardItem({
                                'text/html': new Blob([html], { type: 'text/html' }),
                                'text/plain': new Blob([text], { type: 'text/plain' })
                            })]).then(() => {
                                const orig = btn.innerHTML;
                                btn.innerHTML = `${App.util.icons?.check || '✓'} Copied`;
                                setTimeout(() => btn.innerHTML = orig, 2000);
                            });
                        } catch (e) {
                            navigator.clipboard.writeText(text).then(() => {
                                const orig = btn.innerHTML;
                                btn.innerHTML = '✓ Copied';
                                setTimeout(() => btn.innerHTML = orig, 2000);
                            });
                        }
                    },

                    _insertBubbleAsTextile(btn) {
                        if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                            App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                            return;
                        }
                        const bubble = btn.closest('.ai-viewer-message-bubble');
                        if (!bubble) return;
                        const clone = bubble.cloneNode(true);
                        clone.querySelector('.ai-viewer-bubble-actions')?.remove();
                        const html = clone.innerHTML;

                        // Create a new note with this content or append to current article
                        const articleContent = document.getElementById('article-content');
                        if (articleContent && App.state.currentMode === 'write') {
                            articleContent.focus();
                            document.execCommand('insertHTML', false, '<p><br></p>' + html);
                            App.state.isArticleDirty = true;
                            App.ui.showToast('Inserted into note!', { type: 'success' });
                        } else {
                            // Copy to clipboard as fallback
                            navigator.clipboard.writeText(bubble.textContent).then(() => {
                                App.ui.showToast('Copied to clipboard! Paste it into any note.', { type: 'info' });
                            });
                        }
                    },

                    _updateLastViewerMessage(html) {
                        this.state.viewerHistory = this.state.viewerHistory.filter(m => !m.isThinking);
                        this.state.viewerHistory.push({ role: 'ai', content: html });
                        this._renderViewerConversation();
                    },

                    clearViewerHistory() {
                        this.state.viewerHistory = [];
                        this._renderViewerConversation();
                        App.ui.showToast('Conversation cleared.', { type: 'info' });
                    },

                    async saveViewerAsNote() {
                        if (this.state.viewerHistory.length === 0) {
                            App.ui.showToast('No conversation to save.', { type: 'warning' });
                            return;
                        }

                        const htmlContent = this.state.viewerHistory
                            .filter(m => !m.isThinking)
                            .map(m => {
                                if (m.role === 'user') return `<p><b style="color: var(--primary-color);">You:</b> ${m.content}</p>`;
                                return `<div>${m.content}</div><hr>`;
                            }).join('');

                        if (!htmlContent) {
                            App.ui.showToast('Conversation content is empty.', { type: 'warning' });
                            return;
                        }

                        const contextLabel = this.state.viewerContext === 'pdf' ? 'PDF' : 'Presentation';
                        const title = `AI Chat — ${contextLabel} — ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

                        // Create note object manually
                        const newNote = {
                            id: 'note_' + Date.now(),
                            title: title,
                            content: htmlContent,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            tags: ['#ai-chat'],
                            readCount: 0,
                            readHistory: [],
                            flashcards: {}
                        };

                        if (newNote) {
                            // Save directly to storage first (bypassing router navigation)
                            if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
                                // For filesystem mode, we might need special handling, but let's try pushing to state first
                                App.state.articles.push(newNote);
                                // Trigger a save - typically saveArticle saves the ACTIVE article. 
                                // We might need a direct save method. Assuming App.persistence.saveArticle(newNote) works or similar
                                // Let's try activating it then saving.
                            } else {
                                App.state.articles.push(newNote);
                            }

                            // To be safe, let's just create it properly via event then update it.
                            // But since createNewArticle is void, we can't chain easily without modifying it.
                            // Better approach: mimic createNewArticle but persist it.

                            // Let's use the persistence layer saving if available.
                            // Fallback: Just push to array and save all? expensive.

                            // ACTUALLY: Let's just use router to open it, and then inject content into DOM after a small delay?
                            // No, that's flaky.

                            // Re-reading createNewArticle: it just navigates with `articleObject`.
                            // So we can navigate with OUR object!
                            App.router.navigateTo('article', { articleObject: newNote, mode: 'read' });

                            // And try to trigger save
                            setTimeout(() => {
                                App.events.saveArticle({ isAutosave: false });
                            }, 500);

                            App.ui.showToast('Conversation saved as Note!', {
                                type: 'success',
                                action: {
                                    label: 'View',
                                    callback: () => App.router.navigateTo('article', { id: newNote.id, mode: 'read' })
                                }
                            });
                        } else {
                            App.ui.showToast('Failed to create new note.', { type: 'error' });
                        }
                    },

                    // ===== MODAL MODE (Write) =====

                    open() {
                        this.state.selectedFormat = 'auto'; // Reset format on open
                        if (this.state.isOpen) return;

                        // Auto-detect context: if in Presentation or PDF, open as viewer
                        if (App.state.isFullscreen || App.state.focusSession?.isActive) {
                            this.openAsViewer('presentation');
                            return;
                        }
                        if (document.body.classList.contains('pdf-viewer-active')) {
                            this.openAsViewer('pdf');
                            return;
                        }

                        const selection = window.getSelection();
                        this.state.savedRange = (selection && !selection.isCollapsed && selection.rangeCount > 0)
                            ? selection.getRangeAt(0).cloneRange()
                            : null;

                        this.state.isOpen = true;
                        this.state.commands = this._getCommands();
                        this.state.fuse = App.offline.safeFuse(this.state.commands.filter(c => c.type !== 'separator'), { keys: ['title', 'desc', 'id'], threshold: 0.4 });
                        this.state.filteredCommands = this.state.commands;
                        this.state.selectedIndex = -1;

                        const modalHTML = `
                    <div class="ai-magic-backdrop">
                        <div class="ai-magic-modal">
                            <div class="ai-magic-header">
                                <h3 class="ai-magic-title witty-gradient-text">NoteKash AI Magic</h3>
                                <div class="ai-magic-prompt-container">
                                    <input type="text" id="ai-magic-prompt-input" placeholder="Search or Ask AI anything ..." autocomplete="off">
                                    <button id="ai-magic-prompt-save" class="btn-icon" title="Save this Prompt for later" style="margin-right: 4px;">
                                        ${App.util.icons.bookmark || '<i class="fa-solid fa-bookmark"></i>'}
                                    </button>
                                    <button id="ai-magic-prompt-send" class="btn-icon btn-primary" title="Ask AI">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="ai-format-chips-container" id="ai-format-chips">
                                    <!-- Chips injected by JS -->
                                </div>
                            </div>
                            <div id="ai-magic-command-list"></div>
                        </div>
                    </div>`;

                        document.getElementById('modal-container').innerHTML = modalHTML;

                        // THE FIX: Add the event listener ONLY when the modal opens.
                        document.addEventListener('keydown', this._handleKeyDown, true);

                        this._renderCommands();
                        this._addListeners();
                        document.getElementById('ai-magic-prompt-input').focus();
                    },

                    close() {
                        if (!this.state.isOpen) return;
                        this.state.isOpen = false;
                        this.state.savedRange = null;
                        document.getElementById('modal-container').innerHTML = '';

                        document.removeEventListener('keydown', this._handleKeyDown, true);
                    },

                    _showUpsellCard() {
                        const commandListEl = document.getElementById('ai-magic-command-list');
                        if (!commandListEl) return;
                        const promptContainer = document.querySelector('.ai-magic-prompt-container');
                        if (promptContainer) promptContainer.style.display = 'none';

                        const wittyMessage = App.util.getRandomMessage(App.util.wittyDeveloperMessages);
                        const diamondBadgeHTML = App.util.getTierBadgeHTML('Diamond');

                        const upsellHTML = `
                    <div class="ai-upsell-card">
                        ${diamondBadgeHTML}
                        <h4>Unlock Your Thinking Partner</h4>
                        <p>Go Premium to use all 25+ specialized AI tools. Turn raw notes into structured knowledge, get instant insights, and write faster than ever before.</p>
                        <button class="btn btn-primary" onclick="App.ui.showAscensionModal(); App.ui.aiMagicModal.close();">Unlock Full AI Power</button>
                        <p class="witty-gradient-text"><em>"${wittyMessage}"</em></p>
                    </div>
                `;

                        commandListEl.innerHTML = upsellHTML;
                    },

                    _saveCustomPrompt(text) {
                        try {
                            if (!text || !text.trim()) return;
                            text = text.trim();

                            // Use Native-like Modal
                            App.ui.showInputModal(
                                "Name this Bookmark",
                                "E.g., Summarize cleanly...",
                                text.length > 20 ? text.substring(0, 20) + "..." : text,
                                (name) => {
                                    if (!name) return;
                                    name = name.trim() || text.substring(0, 20); // Fallback

                                    const prompts = JSON.parse(localStorage.getItem('noteKashCustomPrompts') || '[]');
                                    // Check duplicate text to avoid redundancy (optional, but good)
                                    if (prompts.some(p => p.text === text)) {
                                        App.ui.showToast("This prompt is already saved.", { type: 'info' });
                                        return;
                                    }

                                    // Ensure format is captured as string, fallback to current state, fallback to auto
                                    let formatToSave = 'auto';
                                    try {
                                        formatToSave = App.ui.aiMagicModal.state.selectedFormat || 'auto';
                                    } catch (e) { console.error("Could not read format state", e); }


                                    prompts.unshift({
                                        id: 'custom_' + Date.now(),
                                        name: name,
                                        text: text,
                                        format: formatToSave
                                    });
                                    localStorage.setItem('noteKashCustomPrompts', JSON.stringify(prompts));
                                    App.ui.showToast("Prompt Saved! 💾", { type: 'success' });

                                    // Refresh list
                                    this.state.commands = this._getCommands();
                                    this.state.fuse = App.offline.safeFuse(this.state.commands.filter(c => c.type !== 'separator'), { keys: ['title', 'desc', 'id'], threshold: 0.4 });
                                    this.state.filteredCommands = this.state.commands;
                                    this._renderCommands();
                                }
                            );
                        } catch (e) { console.error(e); }
                    },

                    _deleteCustomPrompt(id) {
                        try {
                            const prompts = JSON.parse(localStorage.getItem('noteKashCustomPrompts') || '[]');
                            const newPrompts = prompts.filter(p => p.id !== id);
                            localStorage.setItem('noteKashCustomPrompts', JSON.stringify(newPrompts));
                            App.ui.showToast("Prompt Deleted", { type: 'info' });

                            // Refresh list
                            this.state.commands = this._getCommands();
                            this.state.fuse = App.offline.safeFuse(this.state.commands.filter(c => c.type !== 'separator'), { keys: ['title', 'desc', 'id'], threshold: 0.4 });
                            // If we were filtering, we might want to maintain filter?
                            // Simplest to reset or just update filtered if search is empty
                            const searchInput = document.getElementById('ai-magic-prompt-input');
                            if (searchInput && searchInput.value.trim()) {
                                // Re-run search
                                this.state.filteredCommands = this.state.fuse.search(searchInput.value.trim()).map(r => r.item);
                            } else {
                                this.state.filteredCommands = this.state.commands;
                            }
                            this._renderCommands();

                        } catch (e) { console.error(e); }
                    },

                    _editCustomPrompt(id) {
                        try {
                            const prompts = JSON.parse(localStorage.getItem('noteKashCustomPrompts') || '[]');
                            const promptItem = prompts.find(p => p.id === id);
                            if (!promptItem) return;

                            const newName = window.prompt("Edit Name:", promptItem.name || promptItem.text.substring(0, 20));
                            if (newName === null) return;

                            const newText = window.prompt("Edit Prompt:", promptItem.text);
                            if (newText === null) return;

                            if (newName.trim() !== "" && newText.trim() !== "") {
                                promptItem.name = newName.trim();
                                promptItem.text = newText.trim();
                                localStorage.setItem('noteKashCustomPrompts', JSON.stringify(prompts));
                                App.ui.showToast("Prompt Updated", { type: 'success' });

                                // Refresh
                                this.state.commands = this._getCommands();
                                this.state.fuse = App.offline.safeFuse(this.state.commands.filter(c => c.type !== 'separator'), { keys: ['title', 'desc', 'id'], threshold: 0.4 });

                                const searchInput = document.getElementById('ai-magic-prompt-input');
                                if (searchInput && searchInput.value.trim()) {
                                    this.state.filteredCommands = this.state.fuse.search(searchInput.value.trim()).map(r => r.item);
                                } else {
                                    this.state.filteredCommands = this.state.commands;
                                }
                                this._renderCommands();
                            }
                        } catch (e) { console.error(e); }
                    },

                    async _executeCustomPrompt(text) {
                        if (!App.license.isPremium()) {
                            this._showUpsellCard();
                            return;
                        }
                        const commandListEl = document.getElementById('ai-magic-command-list');
                        if (commandListEl) {
                            commandListEl.classList.remove('compact-grid'); // Reset grid
                            commandListEl.innerHTML = `
                            <div class="ai-thinking-state" style="justify-content: center; text-align: center; padding: 2rem;">
                                <div class="spin" style="font-size: 2.5rem; color: var(--primary-color);">${App.util.icons.cycle}</div>
                                <h4 class="witty-gradient-text" style="margin-top: 1rem;">Your Second Brain is thinking...</h4>
                            </div>`;
                        }

                        if (this.state.savedRange) {
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(this.state.savedRange);
                        }
                        const selection = window.getSelection();
                        const context = (selection && !selection.isCollapsed) ? selection.toString() : document.getElementById('article-content').innerText;

                        // Use the Improved Wrapper
                        const fullPrompt = `Context:\n${context}\n\nUser Request: ${text}\n\nPlease satisfy the User Request based on the Context.`;

                        // IMPORTANT: Pass the selected format!
                        await App.events.ai.executeKashAskOnModal(fullPrompt, this.state.selectedFormat || 'auto');
                    },

                    _getCommands() {
                        const hasSelection = !!this.state.savedRange;
                        let allCommands = [
                            // Selection Commands
                            { id: 'kashwriting', title: 'Improve Writing', desc: 'Refine the selected text', icon: 'fa-solid fa-wand-sparkles', action: () => App.events.ai.executeImproveWriting(), selection: true },
                            { id: 'kashgrammar', title: 'Fix Grammar', desc: 'Correct spelling and Grammar ', icon: 'fa-solid fa-pen-nib', action: () => App.events.ai.executeFixGrammar(), selection: true },
                            { id: 'kashexplain', title: 'Explain This', desc: 'Explain the selected concept', icon: 'fa-solid fa-lightbulb', action: () => App.events.ai.executeKashExplain(), selection: true },
                            { id: 'kashflash', title: 'Generate Flashcard', desc: 'Create a cloze from selection', icon: 'fa-solid fa-clone', action: () => App.events.ai.executeKashFlash(), selection: true },
                            { id: 'kashmnemonic', title: 'Create Mnemonic', desc: 'Generate a memory aid', icon: 'fa-solid fa-brain', action: () => App.events.ai.executeKashMnemonic(), selection: true },
                            { id: 'convertMcq', title: 'Convert to MCQ', desc: 'Turn selection into an MCQ block', icon: 'fa-solid fa-list-check', action: () => App.commandPalette.convertSelectionToMcq(), selection: true },
                            { id: 'kashmcqreviser', title: 'Revise MCQs', desc: 'Colorize & Format selected MCQs', icon: 'fa-solid fa-paintbrush', action: () => App.events.ai.executeKashMcqReviser(), selection: true },
                            { id: 'kashtranslate', title: 'Translate...', desc: 'Translate selection to another language', icon: 'fa-solid fa-earth-americas', action: () => { const lang = prompt('Translate to language:'); if (lang) App.events.ai.executeKashTranslate(lang); }, selection: true },
                            { id: 'kashlist', title: 'Convert to List', desc: 'Restructure selection as a list', icon: 'fa-solid fa-list-ul', action: () => App.events.ai.executeKashListify(), selection: true },
                            { id: 'kashtable', title: 'Convert to Table', desc: 'Restructure selection into a table', icon: 'fa-solid fa-table-cells', action: () => App.events.ai.executeKashTable(), selection: true },
                            { id: 'kashmindmap', title: 'Generate Mindmap', desc: 'Scan article and generate a mindmap hierarchy', icon: 'fa-solid fa-network-wired', action: () => App.events.ai.executeKashMindmap() },

                            // Article-wide Commands
                            { id: 'kashpresent', title: 'Create Presentation', desc: 'Create a presentation script from this note', icon: 'fa-solid fa-microphone-lines', action: () => App.events.ai.executeKashPresent() },
                            { id: 'template', title: 'Insert Template...', desc: 'Open Template Hub', icon: 'fa-solid fa-file-invoice', action: () => App.ui.showTemplateHubModal() },
                            { id: 'kashexpand', title: 'Continue Writing', desc: 'Let AI continue from your cursor', icon: 'fa-solid fa-pen-fancy', action: () => App.events.ai.executeKashExpand() },
                            { id: 'kashsummary', title: 'Summarize Article', desc: 'Generate a summary of the entire note', icon: 'fa-solid fa-file-lines', action: () => App.events.ai.executeKashSummary() },
                            { id: 'kashcurate', title: 'Curate & Beautify', desc: 'Let AI structure and format the note', icon: 'fa-solid fa-wand-magic-sparkles', action: () => App.events.ai.executeKashCurate() },
                            { id: 'kashaccordion', title: 'Generate Q&A', desc: 'Create Q&A accordions from the note', icon: 'fa-solid fa-clipboard-question', action: () => App.events.ai.executeKashAccordion() },
                            { id: 'kashmcq', title: 'Generate MCQs', desc: 'Create multiple-choice questions', icon: 'fa-solid fa-list-check', action: () => App.events.ai.executeKashMcqGenerator() },
                            { id: 'kashhighlight', title: 'Auto-Highlight', desc: 'Highlight key parts of the note', icon: 'fa-solid fa-highlighter', action: () => App.events.ai.executeKashHighlight() },
                            { id: 'kashtags', title: 'Auto-Tag', desc: 'Automatically generate and apply tags', icon: 'fa-solid fa-tags', action: () => App.events.ai.executeKashTags() },
                            { id: 'kashkeywords', title: 'Extract Key Concepts', desc: 'Pull out main ideas into a Deck', icon: 'fa-solid fa-key', action: () => App.events.ai.executeKashKeywords() },
                            { id: 'kashtimeline', title: 'Create Timeline', desc: 'Generate a timeline from the note', icon: 'fa-solid fa-timeline', action: () => App.events.ai.executeKashTimeline() },

                            // --- NEWLY ADDED COMMANDS ---
                            { id: 'kashcraft', title: 'KashCraft Analysis', desc: 'Transform note into a structured analysis', icon: 'fa-solid fa-graduation-cap', action: () => App.events.ai.executeKashCraft() },
                            { id: 'kashextract', title: 'Extract Topic...', desc: 'Extract a specific topic from the note', icon: 'fa-solid fa-magnifying-glass-chart', action: () => { const topic = prompt('What topic do you want to extract? (e.g., key arguments, dates)'); if (topic) App.events.ai.executeKashExtract(topic); } },
                            { id: 'kashlink', title: 'Create & Link Note...', desc: 'Generate a new note on a topic and link it', icon: 'fa-solid fa-link', action: () => { const topic = prompt('What topic for the new note?'); if (topic) App.events.ai.executeKashLink(topic); } },
                            { id: 'kashlong', title: 'Detailed Summary', desc: 'Generate a long, detailed summary of the note', icon: 'fa-solid fa-file-export', action: () => App.events.ai.executeKashLong() },
                            { id: 'kashoutline', title: 'Generate Outline...', desc: 'Create an outline for a new topic', icon: 'fa-solid fa-list-ol', action: () => { const topic = prompt('What topic do you want an outline for?'); if (topic) App.events.ai.executeKashOutline(topic); } },
                            // --- END OF NEW COMMANDS ---

                            { id: 'kashsplit', title: 'Split Note', desc: 'Intelligently split this note into two', icon: 'fa-solid fa-scissors', action: () => App.events.ai.executeKashSplit() },
                            { id: 'kashquote', title: 'Find a Quote', desc: 'Add a relevant quote to your note', icon: 'fa-solid fa-quote-left', action: () => App.events.ai.executeKashQuote() },
                            { id: 'kashstory', title: 'Write a Story', desc: 'Turn the note into a memorable story', icon: 'fa-solid fa-book-open', action: () => App.events.ai.executeKashStory() },
                            { id: 'kashscript', title: 'Write a Script', desc: 'Generate a short video script', icon: 'fa-solid fa-clapperboard', action: () => App.events.ai.executeKashScript() },
                            { id: 'kashcomedy', title: 'Make it Funny', desc: 'Turn the note into a comedy routine', icon: 'fa-solid fa-masks-theater', action: () => App.events.ai.executeKashComedy() },
                            { id: 'kashquestion', title: 'Generate Questions', desc: 'Create study questions from the note', icon: 'fa-solid fa-circle-question', action: () => App.events.ai.executeKashQuestion() },
                            { id: 'kashdebate', title: 'Create a Debate', desc: 'Generate a pros and cons table', icon: 'fa-solid fa-scale-balanced', action: () => App.events.ai.executeKashDebate() },
                        ];

                        const selectionCommands = allCommands.filter(cmd => cmd.selection);
                        const articleCommands = allCommands.filter(cmd => !cmd.selection);

                        let finalCommands = [];
                        if (hasSelection) {
                            finalCommands = [...selectionCommands, { type: 'separator' }, ...articleCommands];
                        } else {
                            finalCommands = [...articleCommands];
                        }

                        // --- CUSTOM PROMPTS (Moved to End) ---
                        try {
                            const customPrompts = JSON.parse(localStorage.getItem('noteKashCustomPrompts') || '[]');
                            if (customPrompts.length > 0) {
                                const customCommands = customPrompts.map(p => ({
                                    id: p.id,
                                    title: p.name || (p.text.length > 20 ? p.text.substring(0, 20) + '...' : p.text),
                                    desc: p.text,
                                    icon: 'fa-solid fa-bookmark',
                                    action: () => {
                                        // CHANGED: Populate input instead of executing
                                        const input = document.getElementById('ai-magic-prompt-input');
                                        if (input) {
                                            input.value = p.text;

                                            // RESELECT FORMAT
                                            if (p.format) {
                                                // Use explicit global reference to be safe
                                                try {
                                                    App.ui.aiMagicModal.state.selectedFormat = p.format;
                                                    const chipsContainer = document.getElementById('ai-format-chips');
                                                    if (chipsContainer) {
                                                        const formats = [
                                                            { id: 'auto', label: 'Auto ✨' },
                                                            { id: 'mcq', label: 'MCQ 📝' },
                                                            { id: 'cloze', label: 'Cloze 🧩' },
                                                            { id: 'accordion', label: 'Accordion 🔽' },
                                                            { id: 'table', label: 'Table 📊' },
                                                            { id: 'timeline', label: 'Timeline ⏳' },
                                                            { id: 'decktile', label: 'Decktile 🗂️' },
                                                        ];
                                                        chipsContainer.innerHTML = formats.map(f =>
                                                            `<div class="ai-format-chip ${p.format === f.id ? 'active' : ''}" data-format="${f.id}">${f.label}</div>`
                                                        ).join('');
                                                    }
                                                } catch (err) { console.error("Error applying format", err); }
                                            } else {
                                                console.warn("No format found for prompt, keeping current.");
                                            }
                                            input.focus();
                                        }
                                    }
                                    ,
                                    custom: true,
                                    keepOpen: true, // NEW: Prevent closing
                                    fullText: p.text
                                }));
                                finalCommands.push({ type: 'separator', label: 'My Custom Prompts' });
                                finalCommands = [...finalCommands, ...customCommands];
                            }
                        } catch (e) { console.error("Error loading custom prompts", e); }

                        return finalCommands;
                    },

                    _renderCommands() {
                        const listEl = document.getElementById('ai-magic-command-list');
                        if (!listEl) return;


                        const numColumns = Math.floor(listEl.offsetWidth / 195); // Approx width of a tile + gap
                        const isCompact = this.state.filteredCommands.length < numColumns && this.state.filteredCommands.length > 0;
                        listEl.classList.toggle('compact-grid', isCompact);

                        const html = this.state.filteredCommands.map((cmd, index) => {
                            if (cmd.type === 'separator') {
                                return `<div class="ai-magic-separator">${cmd.label || ''}</div>`;
                            }
                            const isSelected = this.state.selectedIndex === index; // Check against visual index

                            // ACTIONS for Custom Prompts
                            let actionsHTML = '';
                            if (cmd.custom) {
                                actionsHTML = `
                                    <div class="ai-custom-actions">
                                        <button class="btn-icon btn-sm" title="Delete" onmousedown="event.stopPropagation(); App.ui.aiMagicModal._deleteCustomPrompt('${cmd.id}');"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                `;
                            }

                            const itemHTML = `
                        <div class="ai-magic-command-item ${isSelected ? 'selected' : ''}" data-visual-index="${index}" title="${cmd.desc}">
                            <i class="command-icon ${cmd.icon}"></i>
                            <div class="command-text">
                                <div class="command-title">${cmd.title}</div>
                            </div>
                            ${actionsHTML}
                        </div>
                    `;
                            return itemHTML;
                        }).join('');

                        listEl.innerHTML = html;
                    },

                    _addListeners() {
                        const backdrop = document.querySelector('.ai-magic-backdrop');
                        const searchInput = document.getElementById('ai-magic-prompt-input');
                        const sendBtn = document.getElementById('ai-magic-prompt-send');
                        const saveBtn = document.getElementById('ai-magic-prompt-save');
                        const commandList = document.getElementById('ai-magic-command-list');

                        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this.close(); });

                        const renderChips = () => {
                            const chipsContainer = document.getElementById('ai-format-chips');
                            if (!chipsContainer) return;
                            const formats = [
                                { id: 'auto', label: 'Auto ✨' },
                                { id: 'mcq', label: 'MCQ 📝' },
                                { id: 'cloze', label: 'Cloze 🧩' },
                                { id: 'accordion', label: 'Accordion 🔽' },
                                { id: 'table', label: 'Table 📊' },
                                { id: 'timeline', label: 'Timeline ⏳' },
                                { id: 'decktile', label: 'Decktile 🗂️' },
                            ];
                            chipsContainer.innerHTML = formats.map(f =>
                                `<div class="ai-format-chip ${this.state.selectedFormat === f.id ? 'active' : ''}" data-format="${f.id}">${f.label}</div>`
                            ).join('');
                        };

                        // Initial render of chips
                        renderChips();

                        // Listener for chips
                        const chipsContainer = document.getElementById('ai-format-chips');
                        if (chipsContainer) {
                            chipsContainer.addEventListener('click', (e) => {
                                const chip = e.target.closest('.ai-format-chip');
                                if (chip) {
                                    const format = chip.dataset.format;
                                    // Toggle logic: if clicking active non-auto, revert to auto. If clicking different, set it.
                                    if (this.state.selectedFormat === format && format !== 'auto') {
                                        this.state.selectedFormat = 'auto';
                                    } else {
                                        this.state.selectedFormat = format;
                                    }
                                    renderChips();
                                    document.getElementById('ai-magic-prompt-input').focus();
                                }
                            });
                        }

                        // SAVE BUTTON LISTENER
                        if (saveBtn) {
                            saveBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const text = searchInput.value;
                                if (text && text.trim()) {
                                    this._saveCustomPrompt(text);
                                } else {
                                    App.ui.showToast("Type something to save!", { type: 'warning' });
                                }
                            });
                        }


                        const handlePrompt = async () => {
                            if (!App.license.isPremium()) {
                                this._showUpsellCard();
                                return;
                            }
                            let query = searchInput.value.trim();
                            if (query) {

                                const commandListEl = document.getElementById('ai-magic-command-list');
                                if (commandListEl) {
                                    commandListEl.classList.remove('compact-grid'); // Reset grid
                                    commandListEl.innerHTML = `
                            <div class="ai-thinking-state" style="justify-content: center; text-align: center; padding: 2rem;">
                                <div class="spin" style="font-size: 2.5rem; color: var(--primary-color);">${App.util.icons.cycle}</div>
                                <h4 class="witty-gradient-text" style="margin-top: 1rem;">Your Second Brain is thinking...</h4>
                            </div>`;
                                }


                                // --- SHORTCUT PARSING LOGIC ---
                                // Check for *mcq, *table, etc.
                                let explicitFormat = this.state.selectedFormat;

                                const shortcuts = {
                                    '*mcq': 'mcq',
                                    '*cloze': 'cloze',
                                    '*accordion': 'accordion',
                                    '*acc': 'accordion',
                                    '*table': 'table',
                                    '*timeline': 'timeline',
                                    '*decktile': 'decktile',
                                    '*deck': 'decktile',
                                    '*cards': 'decktile'
                                };

                                const lowerQuery = query.toLowerCase();
                                // Sort by length descending to match longest shortcuts first (*accordion before *acc)
                                const sortedKeys = Object.keys(shortcuts).sort((a, b) => b.length - a.length);

                                for (const key of sortedKeys) {
                                    if (lowerQuery.includes(key)) {
                                        explicitFormat = shortcuts[key];
                                        this.state.selectedFormat = explicitFormat;
                                        renderChips();

                                        query = query.replace(new RegExp(App.util.escapeRegex(key), 'ig'), '').trim();
                                        break;
                                    }
                                }

                                if (this.state.savedRange) {
                                    const selection = window.getSelection();
                                    selection.removeAllRanges();
                                    selection.addRange(this.state.savedRange);
                                }
                                const selection = window.getSelection();
                                const context = (selection && !selection.isCollapsed) ? selection.toString() : document.getElementById('article-content').innerText;

                                // NEW PROMPT WRAPPER
                                const fullPrompt = `Context:\n${context}\n\nUser Request: ${query}\n\nPlease satisfy the User Request based on the Context.`;

                                await App.events.ai.executeKashAskOnModal(fullPrompt, explicitFormat);
                            }
                        };

                        sendBtn.addEventListener('click', handlePrompt);
                        searchInput.addEventListener('input', () => {
                            const query = searchInput.value;
                            if (query) {
                                this.state.filteredCommands = this.state.fuse.search(query).map(r => r.item);
                            } else {
                                this.state.filteredCommands = this._getCommands();
                            }
                            this.state.selectedIndex = -1;
                            this._renderCommands();
                        });

                        commandList.addEventListener('click', (e) => {
                            const itemEl = e.target.closest('.ai-magic-command-item');
                            if (itemEl) {
                                if (!App.license.isPremium()) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this._showUpsellCard();
                                    return;
                                }
                                this.state.selectedIndex = parseInt(itemEl.dataset.visualIndex, 10);
                                this._executeSelected();
                            }
                        });
                    },

                    _handleKeyDown(e) {
                        // CORRECTED: The internal reference must also use the correct name.
                        if (!App.ui.aiMagicModal.state.isOpen) return;
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.state.mode === 'viewer') this.closeViewer();
                            else this.close();
                            return;
                        }
                        const items = Array.from(document.querySelectorAll('.ai-magic-command-item'));
                        if (items.length === 0 && e.key !== 'Enter') return;
                        const isInputFocused = document.activeElement.id === 'ai-magic-prompt-input';
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (isInputFocused) {
                                document.getElementById('ai-magic-prompt-send').click();
                            } else {
                                this._executeSelected();
                            }
                            return;
                        }
                        // Arrow key navigation logic remains the same.
                        if (e.key === 'ArrowUp' && this.state.selectedIndex !== -1) {
                            e.preventDefault();
                            const numColumns = getComputedStyle(document.getElementById('ai-magic-command-list')).gridTemplateColumns.split(' ').length;
                            const newIndex = this.state.selectedIndex - numColumns;
                            if (newIndex < 0) {
                                this.state.selectedIndex = -1;
                                document.getElementById('ai-magic-prompt-input').focus();
                                this._updateSelection();
                            } else {
                                this.state.selectedIndex = newIndex;
                                this._updateSelection();
                            }
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const numColumns = getComputedStyle(document.getElementById('ai-magic-command-list')).gridTemplateColumns.split(' ').length;
                            if (isInputFocused) {
                                this.state.selectedIndex = 0;
                            } else {
                                this.state.selectedIndex = Math.min(this.state.selectedIndex + numColumns, items.length - 1);
                            }
                            this._updateSelection();
                        } else if (e.key === 'ArrowLeft' && !isInputFocused) {
                            e.preventDefault();
                            this.state.selectedIndex = Math.max(0, this.state.selectedIndex - 1);
                            this._updateSelection();
                        } else if (e.key === 'ArrowRight' && !isInputFocused) {
                            e.preventDefault();
                            this.state.selectedIndex = Math.min(this.state.selectedIndex + 1, items.length - 1);
                            this._updateSelection();
                        }
                    },

                    _updateSelection() {
                        const items = document.querySelectorAll('.ai-magic-command-item');
                        items.forEach((item) => {
                            const visualIndex = parseInt(item.dataset.visualIndex, 10);
                            const isSelected = visualIndex === this.state.selectedIndex;
                            item.classList.toggle('selected', isSelected);
                            if (isSelected) {
                                item.scrollIntoView({ block: 'nearest' });
                            }
                        });
                    },

                    renderResponse(htmlContent) {
                        const listEl = document.getElementById('ai-magic-command-list');
                        if (!listEl) return;

                        listEl.classList.add('response-mode');
                        listEl.innerHTML = `
                            <div class="ai-magic-response-content">${htmlContent}</div>
                            <div class="ai-magic-response-actions">
                                <div class="ai-feedback-group" style="margin-right: auto; display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-ghost" title="Good Response" onclick="App.ui.aiMagicModal._submitFeedback('positive', this)">
                                        <i class="fa-solid fa-thumbs-up"></i>
                                    </button>
                                    <button class="btn btn-sm btn-ghost" title="Bad Response" onclick="App.ui.aiMagicModal._submitFeedback('negative', this)">
                                        <i class="fa-solid fa-thumbs-down"></i>
                                    </button>
                                </div>
                                <button class="btn btn-sm btn-ghost" onclick="App.ui.aiMagicModal._copyResponseToClipboard(this)">
                                    ${App.util.icons.copy} Copy
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="App.ui.aiMagicModal._insertResponseToNote('replace')">
                                    Replace
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="App.ui.aiMagicModal._insertResponseToNote('insert')">
                                    Insert
                                </button>
                            </div>
                        `;

                        // Store response for insertion
                        this.state.lastResponse = htmlContent;
                    },

                    _submitFeedback(type, btn) {
                        // Visual feedback
                        const group = btn.parentElement;
                        const buttons = group.querySelectorAll('button');
                        buttons.forEach(b => b.classList.remove('active', 'text-success', 'text-danger'));

                        btn.classList.add('active');
                        if (type === 'positive') {
                            btn.classList.add('text-success');
                            App.ui.showToast("Thanks! We're glad you liked it. 👍", "success");
                        } else {
                            btn.classList.add('text-danger');
                            App.ui.showToast("We'll try to do better. 👎", "info");
                        }

                        // In a real app, we would send this to the server
                    },

                    _copyResponseToClipboard(btn) {
                        const content = this.state.lastResponse;
                        if (!content) return;

                        const temp = document.createElement('div');
                        temp.innerHTML = content;
                        const textContent = temp.innerText;

                        try {
                            const blobHtml = new Blob([content], { type: 'text/html' });
                            const blobText = new Blob([textContent], { type: 'text/plain' });
                            const data = [new ClipboardItem({
                                'text/html': blobHtml,
                                'text/plain': blobText
                            })];
                            navigator.clipboard.write(data).then(() => {
                                const originalText = btn.innerHTML;
                                btn.innerHTML = `${App.util.icons.check} Copied`;
                                setTimeout(() => btn.innerHTML = originalText, 2000);
                            });
                        } catch (e) {
                            navigator.clipboard.writeText(textContent).then(() => {
                                const originalText = btn.innerHTML;
                                btn.innerHTML = `${App.util.icons.check} Copied`;
                                setTimeout(() => btn.innerHTML = originalText, 2000);
                            });
                        }
                    },

                    _insertResponseToNote(mode = 'insert') {
                        const content = this.state.lastResponse;
                        if (!content) return;

                        if (this.state.savedRange) {
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(this.state.savedRange);

                            if (mode === 'replace') {
                                document.execCommand('insertHTML', false, content);
                            } else {
                                // Intelligent Insert AFTER logic
                                const range = selection.getRangeAt(0);
                                let node = range.commonAncestorContainer;
                                if (node.nodeType === 3) node = node.parentNode; // Get element if text node

                                const trapSelector = 'table, ul, ol, blockquote, .nk-mcq-container, pre, .card';
                                const trapElement = node.closest(trapSelector);

                                if (trapElement) {
                                    const newRange = document.createRange();
                                    newRange.setStartAfter(trapElement);
                                    newRange.collapse(true);

                                    selection.removeAllRanges();
                                    selection.addRange(newRange);

                                    // Insert with some spacing
                                    document.execCommand('insertHTML', false, '<p><br></p>' + content);
                                } else {
                                    // Standard text paragraph - just append
                                    selection.collapseToEnd();
                                    document.execCommand('insertHTML', false, content);
                                }
                            }
                        } else {
                            // No selection logic: just append or insert at cursor
                            document.execCommand('insertHTML', false, content);
                        }

                        this.close();
                        App.state.isArticleDirty = true;
                    },

                    _executeSelected() {
                        const command = this.state.filteredCommands[this.state.selectedIndex];
                        if (command && command.action) {

                            // Restore selection if needed
                            if (this.state.savedRange) {
                                const selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(this.state.savedRange);
                            }

                            command.action();

                            if (!command.keepOpen) {
                                this.close();
                            }
                        }
                    }
                },


                imageLightbox: {
                    state: {
                        scale: 1,
                        isDragging: false,
                        startPos: { x: 0, y: 0 },
                        translatePos: { x: 0, y: 0 }
                    },

                    open(imageContainer) {
                        if (!imageContainer) return;
                        const img = imageContainer.querySelector('img');
                        if (!img) return;

                        this.state = { scale: 1, isDragging: false, startPos: { x: 0, y: 0 }, translatePos: { x: 0, y: 0 } };

                        const lightboxHTML = `
                    <div id="image-lightbox-overlay" class="modal-backdrop" style="z-index: 25000; background-color: rgba(0,0,0,0.8);">
                        <div class="lightbox-image-wrapper">
                            <img src="${img.src}" class="lightbox-image" alt="Lightbox image">
                        </div>
                        <div class="lightbox-controls">
                            <button class="btn-icon" id="lightbox-zoom-in" title="Zoom In (+)">${App.util.icons.zoomIn}</button>
                            <button class="btn-icon" id="lightbox-zoom-out" title="Zoom Out (-)">${App.util.icons.zoomOut}</button>
                            <button class="btn-icon" id="lightbox-reset" title="Reset View (R)">${App.util.icons.reset}</button>
                            <button class="btn-icon" id="lightbox-close" title="Close (Esc)">${App.util.icons.close}</button>
                        </div>
                    </div>
                `;
                        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
                        this.addListeners();
                    },
                    showAiContextMenu(range) {
                        this.hideContextMenu(); // Ensure no other context menus are open
                        const rect = range.getBoundingClientRect();
                        const x = rect.left + window.scrollX;
                        const y = rect.top + window.scrollY - 38; // Position it just above the selection

                        const menuHtml = `
                    <button onclick="App.events.ai.executeImproveWriting()">Improve Writing</button>
                    <button onclick="App.events.ai.executeFixGrammar()">Fix Grammar & Spelling</button>
                `;

                        this.showContextMenu(x, y, menuHtml);
                    },
                    close() {
                        const overlay = document.getElementById('image-lightbox-overlay');
                        if (overlay) overlay.remove();
                        document.removeEventListener('keydown', this.handleKeyDown);
                    },

                    addListeners() {
                        const overlay = document.getElementById('image-lightbox-overlay');
                        const imageWrapper = overlay.querySelector('.lightbox-image-wrapper');

                        document.getElementById('lightbox-zoom-in').addEventListener('click', () => this.zoom(1));
                        document.getElementById('lightbox-zoom-out').addEventListener('click', () => this.zoom(-1));
                        document.getElementById('lightbox-reset').addEventListener('click', () => this.reset());
                        document.getElementById('lightbox-close').addEventListener('click', () => this.close());

                        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });

                        imageWrapper.addEventListener('mousedown', (e) => this.startPan(e));
                        imageWrapper.addEventListener('mousemove', (e) => this.pan(e));
                        imageWrapper.addEventListener('mouseup', () => this.endPan());
                        imageWrapper.addEventListener('mouseleave', () => this.endPan());
                        imageWrapper.addEventListener('wheel', (e) => {
                            e.preventDefault();
                            this.zoom(e.deltaY > 0 ? -1 : 1);
                        }, { passive: false });

                        document.addEventListener('keydown', this.handleKeyDown.bind(this));
                    },

                    updateTransform() {
                        const wrapper = document.querySelector('.lightbox-image-wrapper');
                        if (wrapper) {
                            wrapper.style.transform = `translate(${this.state.translatePos.x}px, ${this.state.translatePos.y}px) scale(${this.state.scale})`;
                        }
                    },

                    zoom(direction) {
                        const zoomFactor = 1.2;
                        this.state.scale *= (direction > 0) ? zoomFactor : (1 / zoomFactor);
                        this.state.scale = Math.max(0.5, Math.min(this.state.scale, 8)); // Clamp zoom level

                        if (this.state.scale <= 1) this.reset();
                        else this.updateTransform();
                    },

                    reset() {
                        this.state.scale = 1;
                        this.state.translatePos = { x: 0, y: 0 };
                        this.updateTransform();
                    },

                    startPan(e) {
                        if (this.state.scale <= 1) return;
                        e.preventDefault();
                        this.state.isDragging = true;
                        this.state.startPos = { x: e.clientX - this.state.translatePos.x, y: e.clientY - this.state.translatePos.y };
                        const wrapper = document.querySelector('.lightbox-image-wrapper');
                        if (wrapper) wrapper.style.cursor = 'grabbing';
                    },

                    pan(e) {
                        if (!this.state.isDragging) return;
                        this.state.translatePos.x = e.clientX - this.state.startPos.x;
                        this.state.translatePos.y = e.clientY - this.state.startPos.y;
                        this.updateTransform();
                    },

                    endPan() {
                        this.state.isDragging = false;
                        const wrapper = document.querySelector('.lightbox-image-wrapper');
                        if (wrapper) wrapper.style.cursor = 'grab';
                    },

                    handleKeyDown(e) {
                        switch (e.key) {
                            case 'Escape': this.close(); break;
                            case '+': case '=': this.zoom(1); break;
                            case '-': this.zoom(-1); break;
                            case 'r': case '0': this.reset(); break;
                        }
                    }
                },
                showContextMenu(x, y, menuHtml) {
                    this.hideContextMenu();
                    const container = document.getElementById('context-menu-container');
                    container.innerHTML = `<div class="context-menu" style="left: ${x}px; top: ${y}px;">${menuHtml}</div>`;
                },
                hideContextMenu() { document.getElementById('context-menu-container').innerHTML = ''; },

                _roundRectPath(ctx, x, y, w, h, r) {
                    const rr = Math.min(r, w / 2, h / 2);
                    ctx.beginPath();
                    ctx.moveTo(x + rr, y);
                    ctx.arcTo(x + w, y, x + w, y + h, rr);
                    ctx.arcTo(x + w, y + h, x, y + h, rr);
                    ctx.arcTo(x, y + h, x, y, rr);
                    ctx.arcTo(x, y, x + w, y, rr);
                    ctx.closePath();
                },

                async exportStatsBrag(key) {
                    const map = { focus: 'stats-export-focus', quiz: 'stats-export-quiz', flashchart: 'stats-export-flashchart', readingchart: 'stats-export-readingchart' };
                    const id = map[key];
                    if (!id) return;
                    const el = document.getElementById(id);
                    if (!el) { this.showToast('Nothing to export yet.', 'warning'); return; }
                    const h2c = typeof html2canvas === 'function' ? html2canvas : (typeof window !== 'undefined' && window.html2canvas);
                    if (typeof h2c !== 'function') { this.showToast('Image export unavailable (html2canvas not loaded).', 'warning'); return; }
                    const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#fdf6e3';
                    const bgSecondary = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#f5f0e6';
                    const onclone = (clonedDoc) => {
                        const node = clonedDoc.getElementById(id);
                        if (!node) return;
                        node.style.boxSizing = 'border-box';
                        node.style.width = '440px';
                        node.style.maxWidth = '440px';
                        node.style.margin = '0';
                        node.style.padding = key === 'focus' ? '16px 18px 20px' : '18px 20px 22px';
                        node.style.borderRadius = '16px';
                        node.style.backgroundColor = bgSecondary;
                        node.style.border = '1px solid rgba(93, 74, 52, 0.14)';
                        node.style.boxShadow = '0 6px 28px rgba(0,0,0,0.08)';
                        if (key === 'quiz') {
                            const qz = node.querySelector('.quiz-stats-container');
                            if (qz) { qz.style.alignItems = 'stretch'; qz.style.width = '100%'; qz.style.gap = '1rem'; }
                            const streak = node.querySelector('.streak-container');
                            if (streak) {
                                streak.style.width = '100%';
                                streak.style.justifyContent = 'space-between';
                                streak.style.alignItems = 'center';
                                streak.style.flexWrap = 'nowrap';
                                streak.style.gap = '14px';
                            }
                            const cal = node.querySelector('.weekly-streak-calendar');
                            if (cal) { cal.style.maxWidth = 'none'; cal.style.flex = '1'; cal.style.minWidth = '0'; cal.style.height = '128px'; }
                            const grid = node.querySelector('.sub-stats-grid');
                            if (grid) { grid.style.width = '100%'; grid.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))'; grid.style.gap = '10px'; }
                            const circle = node.querySelector('.streak-display.daily');
                            if (circle) { circle.style.width = '132px'; circle.style.height = '132px'; circle.style.flexShrink = '0'; }
                        }
                        if (key === 'flashchart' || key === 'readingchart') {
                            node.style.padding = '16px';
                        }
                    };
                    try {
                        const canvas = await h2c(el, {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            backgroundColor: bgPrimary,
                            onclone,
                        });
                        const band = Math.round(Math.max(48, canvas.height * 0.065));
                        const out = document.createElement('canvas');
                        out.width = canvas.width;
                        out.height = canvas.height + band;
                        const octx = out.getContext('2d');
                        octx.fillStyle = bgPrimary;
                        octx.fillRect(0, 0, out.width, out.height);
                        octx.drawImage(canvas, 0, 0);
                        const fs = Math.max(14, Math.round(out.width / 38));
                        const wm = 'notekash.com';
                        octx.font = `600 ${fs}px system-ui, -apple-system, "Segoe UI", sans-serif`;
                        const tw = octx.measureText(wm).width;
                        const padX = 12;
                        const padY = 7;
                        const pillW = tw + padX * 2;
                        const pillH = fs + padY * 2;
                        const px = out.width - pillW - 16;
                        const py = out.height - pillH - 10;
                        octx.fillStyle = 'rgba(55, 42, 32, 0.9)';
                        this._roundRectPath(octx, px, py, pillW, pillH, 8);
                        octx.fill();
                        octx.fillStyle = 'rgba(255, 252, 248, 0.96)';
                        octx.textBaseline = 'middle';
                        octx.fillText(wm, px + padX, py + pillH / 2);
                        const filename = `notekash-${key}.png`;
                        const blob = await new Promise((resolve, reject) => {
                            out.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
                        });
                        const file = new File([blob], filename, { type: 'image/png' });
                        let usedShare = false;
                        try {
                            if (navigator.share) {
                                const ok = !navigator.canShare || navigator.canShare({ files: [file] });
                                if (ok) {
                                    await navigator.share({ files: [file], title: 'NoteKash', text: 'My stats from NoteKash' });
                                    usedShare = true;
                                }
                            }
                        } catch (e) {
                            if (e.name === 'AbortError') return;
                        }
                        if (!usedShare) {
                            const u = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.download = filename;
                            a.href = u;
                            a.click();
                            setTimeout(() => URL.revokeObjectURL(u), 5000);
                        }
                        this.showToast(usedShare ? 'Pick an app to share.' : 'Image saved.', 'success');
                    } catch (err) {
                        console.error('exportStatsBrag', err);
                        this.showToast('Could not create image.', 'error');
                    }
                },

                showToast(message, options = {}) {
                    if (typeof options === 'string') { options = { type: options }; }
                    const { type = 'info', duration = 4000, action = null, id = null } = options;

                    const container = document.getElementById('toast-container');
                    const toast = document.createElement('div');
                    toast.className = `toast ${type}`;
                    toast.id = id || `toast-${crypto.randomUUID()}`; // Assign a unique ID for updating

                    // Intelligently handle HTML content vs. plain text.
                    if (/<[a-z][\s\S]*>/i.test(message)) {
                        toast.innerHTML = message;
                    } else {
                        const messageSpan = document.createElement('span');
                        messageSpan.textContent = message;
                        toast.appendChild(messageSpan);
                    }

                    if (action && action.label && action.callback) {
                        const actionButton = document.createElement('button');
                        actionButton.className = 'btn btn-secondary';
                        actionButton.textContent = action.label;
                        actionButton.onclick = () => { action.callback(); this.hideToast(toast); };
                        actionButton.style.marginLeft = 'auto';
                        toast.appendChild(actionButton);
                    }

                    container.appendChild(toast);
                    setTimeout(() => toast.classList.add('show'), 10);

                    if (duration > 0) {
                        setTimeout(() => {
                            this.hideToast(toast);
                        }, duration);
                    }
                    return toast;
                },


                updateToast(toastIdOrEl, message, options = {}) {
                    const toast = (typeof toastIdOrEl === 'string') ? document.getElementById(toastIdOrEl) : toastIdOrEl;
                    if (toast) {
                        const messageHolder = toast.querySelector('span') || toast;
                        if (/<[a-z][\s\S]*>/i.test(message)) {
                            messageHolder.innerHTML = message;
                        } else {
                            messageHolder.textContent = message;
                        }

                        // Handle duration option - auto-hide toast after duration
                        if (options.duration && options.duration > 0) {
                            setTimeout(() => {
                                toast.classList.remove('show');
                                setTimeout(() => toast.remove(), 400);
                            }, options.duration);
                        }

                        // Handle type option - update toast class
                        if (options.type) {
                            toast.className = toast.className.replace(/toast-(success|error|info|warning)/g, '');
                            toast.classList.add(`toast-${options.type}`);
                        }
                    }
                },

                hideToast(toastIdOrEl) {
                    const toast = (typeof toastIdOrEl === 'string') ? document.getElementById(toastIdOrEl) : toastIdOrEl;
                    if (toast) {
                        toast.classList.remove('show');
                        setTimeout(() => toast.remove(), 400);
                    }
                },

                getSettingsLayoutHTML(activeTabId, title, contentHTML) {
                    const isPremium = App.license.isPremium();
                    const navItems = [
                        { id: 'appearance', icon: 'fa-palette', label: 'Appearance Model', action: 'showAppearanceModal', isLocked: false },
                        { id: 'profile', icon: 'fa-circle-user', label: 'Profile & Account', action: 'showLicenseModal', isLocked: false },
                        { id: 'categories', icon: 'fa-folder-tree', label: 'Category Manager', action: 'showCategoryManagerModal', isLocked: false },
                        { id: 'storage', icon: 'fa-database', label: 'Storage & Sync', action: 'showStorageModal', isLocked: false },
                        { id: 'audio', icon: 'fa-microphone-lines', label: 'Audio & Scribe', action: 'showAudioSettingsModal', isLocked: false },
                        { id: 'ai', icon: 'fa-wand-magic-sparkles', label: 'NoteKash AI', action: 'showAiSettingsModal', isLocked: !isPremium },
                        { id: 'shortcuts', icon: 'fa-keyboard', label: 'Shortcut Manual', action: 'showShortcutsModal', isLocked: false },
                    ];

                    const sidebarNavHTML = navItems.map(item => {
                        const isActive = item.id === activeTabId;
                        const activeClass = isActive ? 'active' : '';
                        const lockedClass = item.isLocked ? 'locked' : '';
                        
                        return `
                            <a class="settings-sidebar-item ${activeClass} ${lockedClass}" 
                                onclick="if (!this.classList.contains('locked')) { App.ui.closeModal(); App.ui.${item.action}(); } else { App.ui.showAscensionModal(); }">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                                ${item.isLocked ? '<i class="fa-solid fa-lock sidebar-lock-icon"></i>' : '<i class="fa-solid fa-chevron-right sidebar-arrow-icon"></i>'}
                            </a>
                        `;
                    }).join('');

                    const sidebarHTML = `
                        <div class="settings-sidebar">
                            <div class="settings-sidebar-header">
                                <h3>Settings</h3>
                            </div>
                            <nav class="settings-sidebar-nav">
                                ${sidebarNavHTML}
                            </nav>
                        </div>
                    `;

                    return `
                        ${sidebarHTML}
                        <div class="settings-content-pane">
                            <div class="settings-content-header">
                                <h3>${title}</h3>
                                <button class="btn-icon desktop-only" onclick="App.ui.closeModal()" title="Close Settings" style="background: transparent; border: none; font-size: 1.15rem; color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 28px; height: 28px; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-secondary)'"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                            <div class="settings-scroll-area">
                                ${contentHTML}
                            </div>
                        </div>
                    `;
                },

                showSettingsModal() {
                    if (window.innerWidth > 768) {
                        App.ui.showAppearanceModal();
                        return;
                    }

                    const isPremium = App.license.isPremium();

                    const navItems = [
                        { id: 'appearance', icon: 'fa-palette', label: 'Appearance Model', action: 'showAppearanceModal', isLocked: false },
                        { id: 'profile', icon: 'fa-circle-user', label: 'Profile & Account', action: 'showLicenseModal', isLocked: false },
                        { id: 'categories', icon: 'fa-folder-tree', label: 'Category Manager', action: 'showCategoryManagerModal', isLocked: false },
                        { id: 'storage', icon: 'fa-database', label: 'Storage & Sync', action: 'showStorageModal', isLocked: false },
                        { id: 'audio', icon: 'fa-microphone-lines', label: 'Audio & Scribe', action: 'showAudioSettingsModal', isLocked: false },
                        { id: 'ai', icon: 'fa-wand-magic-sparkles', label: 'NoteKash AI', action: 'showAiSettingsModal', isLocked: !isPremium },
                        { id: 'shortcuts', icon: 'fa-keyboard', label: 'Shortcut Manual', action: 'showShortcutsModal', isLocked: false },
                    ];

                    const navItemsHTML = navItems.map(item => `
                    <a class="settings-nav-item ${item.isLocked ? 'locked' : ''}" 
                       onclick="if (!this.classList.contains('locked')) { App.ui.closeModal(); App.ui.${item.action}(); } else { App.ui.showAscensionModal(); }">
                        <div class="settings-nav-item-left">
                            <i class="fa-solid ${item.icon}"></i> 
                            <span>${item.label}</span>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size: 0.8rem; color: var(--text-secondary); opacity: 0.6;"></i>
                    </a>
                `).join('');

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div class="modal-content ui-card" style="max-width: 420px; border-radius: 20px; padding: 2rem; background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));" onclick="event.stopPropagation()">
                            <h3 style="text-align: center; margin-bottom: 1.5rem; border: none; font-family: var(--font-display); font-weight: 700;">Settings</h3>
                            <nav class="settings-nav">
                                ${navItemsHTML}
                            </nav>
                            <div class="modal-buttons" style="margin-top: 1.25rem; border: none; padding: 0;">
                                <button class="btn btn-secondary" onclick="App.ui.closeModal()" style="width: 100%; padding: 10px; font-weight: 600; border-radius: 12px;">Close</button>
                            </div>
                        </div>
                    </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                toggleKeyVisibility(inputId, iconId) {
                    const input = document.getElementById(inputId);
                    const icon = document.getElementById(iconId);
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                },

                switchAiProvider() {
                    const select = document.getElementById('ai-provider-select');
                    if (!select) return;
                    const provider = select.value;
                    document.querySelectorAll('.provider-content').forEach(c => c.style.display = 'none');
                    const active = document.getElementById(`provider-${provider}`);
                    if (active) active.style.display = 'block';
                },

                toggleKeyVisibility(inputId, iconId) {
                    const input = document.getElementById(inputId);
                    const icon = document.getElementById(iconId);
                    if (!input || !icon) return;
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.replace('fa-eye', 'fa-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.replace('fa-eye-slash', 'fa-eye');
                    }
                },

                deleteAiKey(providerId) {
                    if (confirm('Delete this API key?')) {
                        App.settings.set(`${providerId}Key`, null);
                        App.ui.showAiSettingsModal();
                    }
                },

                showAdvancedModal() {
                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div id="advanced-settings-modal" class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                            ${App.ui.getSettingsLayoutHTML('advanced', 'Advanced Settings', `
                            
                            <div class="settings-section">
                                <h4 style="margin-bottom: 0.5rem;"><i class="fa-solid fa-microchip"></i> Memory & Performance</h4>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                                    If the app feels slow or is using too much RAM, use this tool to clear cached snippets and temporary data.
                                </p>
                                <button class="btn btn-secondary" id="free-ram-btn" onclick="App.ui.handleFreeRam()" style="width: 100%;">
                                    Free RAM / Clear Cache
                                </button>
                                <div id="ram-status" style="display: block; margin-top: 0.5rem; text-align: center; color: var(--text-success); font-weight: bold;"></div>
                            </div>

                            <div class="settings-section">
                                <h4 style="margin-bottom: 0.5rem;"><i class="fa-solid fa-calculator"></i> System Consistency</h4>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                                    Update word counts for all articles to ensure total statistics are accurate.
                                </p>
                                <button class="btn btn-secondary" onclick="App.ui.recalculateAllWordCounts()" style="width: 100%;">
                                    Recalculate All Word Counts
                                </button>
                            </div>

                                <div class="modal-buttons" style="margin-top: 1.5rem; border: none; padding: 0;">
                                    <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                                    <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                                </div>
                            `)}
                        </div>
                    </div>`;
                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                async handleFreeRam() {
                    const btn = document.getElementById('free-ram-btn');
                    const status = document.getElementById('ram-status');
                    if (btn) btn.disabled = true;
                    if (status) status.textContent = "Cleaning up...";

                    await new Promise(r => setTimeout(r, 500)); // Visual feedback
                    App.util.freeMemory();

                    if (status) status.textContent = "Memory optimized successfully!";
                    if (btn) btn.disabled = false;

                    App.ui.showToast("Memory cleanup complete!", "success");
                },

                async recalculateAllWordCounts() {
                    if (!confirm('This will update word counts for all articles. Continue?')) return;

                    const toastId = App.ui.showToast("Recalculating word counts...", { duration: 0 });
                    const articles = App.state.articles;
                    let updatedCount = 0;

                    for (let i = 0; i < articles.length; i++) {
                        const article = articles[i];
                        if (article.content) {
                            const newCount = App.util.calculateWordCount(article.content);
                            if (article.wordCount !== newCount) {
                                await App.storage.updateArticle(article.id, { wordCount: newCount });
                                updatedCount++;
                            }
                        }
                        if (i % 5 === 0) {
                            App.ui.updateToast(toastId, `Processing ${i + 1}/${articles.length}...`);
                            await new Promise(r => setTimeout(r, 0));
                        }
                    }

                    App.ui.hideToast(toastId);
                    App.ui.showToast(`Updated word count for ${updatedCount} articles.`, "success");
                },

                showAiSettingsModal() {
                    const savedProvider = App.settings.get('aiProvider') || 'openrouter';

                    const providers = [
                        { id: 'openrouter', name: 'OpenRouter', key: App.settings.get('openRouterKey'), model: App.settings.get('openRouterModel') || 'mistralai/mistral-7b-instruct:free', keyPlaceholder: 'sk-or-...', modelPlaceholder: 'e.g. openai/gpt-4o' },
                        { id: 'gemini', name: 'Google Gemini', key: App.settings.get('geminiKey'), model: App.settings.get('geminiModel') || 'gemini-2.5-flash', keyPlaceholder: 'AIzaSy...' },
                        { id: 'openai', name: 'OpenAI', key: App.settings.get('openaiKey'), model: App.settings.get('openaiModel') || 'gpt-4o-mini', keyPlaceholder: 'sk-...', modelPlaceholder: 'e.g. gpt-4o' },
                        { id: 'huggingface', name: 'Hugging Face', key: App.settings.get('huggingfaceKey'), model: App.settings.get('huggingfaceModel') || 'mistralai/Mistral-7B-Instruct-v0.2', keyPlaceholder: 'hf_...', modelPlaceholder: 'user/model-name' }
                    ];

                    const providerOptionsHTML = providers.map(p => `<option value="${p.id}" ${savedProvider === p.id ? 'selected' : ''}>${p.name}</option>`).join('');

                    const contentSectionsHTML = providers.map(p => {
                        const isVisible = savedProvider === p.id ? 'block' : 'none';
                        const hasKey = !!p.key;

                        let modelHTML = '';
                        if (p.id === 'gemini') {
                            modelHTML = `
                                <div class="settings-grid">
                                    <label for="gemini-model-select">Model</label>
                                    <select id="gemini-model-select" class="btn btn-secondary">
                                        <option value="gemini-2.5-flash-live" ${p.model === 'gemini-2.5-flash-live' ? 'selected' : ''}>Live (Flash Live)</option>
                                        <option value="gemini-2.5-flash" ${p.model === 'gemini-2.5-flash' ? 'selected' : ''}>Medium (Flash)</option>
                                        <option value="gemini-2.5-flash-lite" ${p.model === 'gemini-2.5-flash-lite' ? 'selected' : ''}>Air (Lite)</option>
                                        <option value="gemma-3-27b" ${p.model === 'gemma-3-27b' ? 'selected' : ''}>Heavy (Gemma)</option>
                                    </select>
                                </div>`;
                        } else {
                            modelHTML = `
                                <div class="settings-grid">
                                    <label for="${p.id}-model-input">Model</label>
                                    <input type="text" id="${p.id}-model-input" class="text-input" value="${p.model}" placeholder="${p.modelPlaceholder || 'Model ID'}">
                                </div>`;
                        }

                        return `
                        <div id="provider-${p.id}" class="provider-content" style="display: ${isVisible};">
                            <div class="settings-grid" style="margin-bottom: 0.5rem;">
                                <label for="${p.id}-key-input">API Key</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <div style="position: relative; flex: 1;">
                                        <input type="password" id="${p.id}-key-input" class="text-input" value="${p.key || ''}" placeholder="${p.keyPlaceholder}" style="padding-right: 2.5rem;">
                                        <i class="fa-solid fa-eye" id="${p.id}-eye-icon" onclick="App.ui.toggleKeyVisibility('${p.id}-key-input', '${p.id}-eye-icon')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted);"></i>
                                    </div>
                                    ${hasKey ? `<button class="btn btn-danger" onclick="App.ui.deleteAiKey('${p.id}')" title="Delete Key"><i class="fa-solid fa-trash"></i></button>` : ''}
                                </div>
                            </div>
                            ${modelHTML}
                        </div>`;
                    }).join('');

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                            ${App.ui.getSettingsLayoutHTML('ai', 'NoteKash AI (BYOK)', `

                            <div class="settings-section">
                                <h4>AI Provider</h4>
                                <div class="settings-grid">
                                    <label for="ai-provider-select">Select Provider</label>
                                    <select id="ai-provider-select" class="btn btn-secondary" onchange="App.ui.switchAiProvider()">
                                        ${providerOptionsHTML}
                                    </select>
                                </div>
                                <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">
                                    <i class="fa-solid fa-circle-info"></i> Bring your own API Key, that are stored locally. Check "Openrouter" for free AI Keys.
                                </small>
                            </div>

                            <div class="settings-section">
                                <h4>Configuration</h4>
                                ${contentSectionsHTML}
                            </div>

                            <div class="modal-buttons">
                                <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();">Back</button>
                                <button class="btn btn-primary" onclick="App.events.ai.saveAiSettings()">Save Settings</button>
                                <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();">Close</button>
                            </div>
                        `)}
                        </div>
                    </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                showAudioSettingsModal() {
                    const currentBitrate = App.settings.get('audioBitrate');

                    const bitrateOptions = [
                        { value: 16000, label: 'Mini (To Save Space)' },
                        { value: 32000, label: 'Low (Voice Memo)' },
                        { value: 64000, label: 'Medium (Podcast - Recommended)' },
                        { value: 128000, label: 'High (Music)' }
                    ].map(opt => `<option value="${opt.value}" ${currentBitrate === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('');

                    const models = [
                        { id: 'tiny', name: 'Smooth', size: '75 MB' }, { id: 'base', name: 'Good', size: '142 MB' },
                        { id: 'small', name: 'Better', size: '466 MB' }, { id: 'medium', name: 'Excellent', size: '1.42 GB' }
                    ];
                    const modelsHTML = models.map(model => `
                    <div class="settings-item">
                        <div class="settings-label"><b>${model.name} Model</b><small>${model.size} download</small></div>
                        <button class="btn btn-secondary" id="download-model-${model.id}" onclick="App.audio.downloadTranscriptionModel('Xenova/whisper-${model.id}')">Download</button>
                    </div>
                `).join('');

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div id="audio-settings-modal-content" class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                            ${App.ui.getSettingsLayoutHTML('audio', 'Audio & Scribe', `

                            <div class="settings-section">
                                <h4>Audio Configuration</h4>
                                <div class="settings-grid">
                                    <label for="audio-bitrate-select">Recording Quality</label>
                                    <select id="audio-bitrate-select" class="btn btn-secondary" onchange="App.settings.set('audioBitrate', parseInt(this.value, 10))">${bitrateOptions}</select>
                                </div>
                                <div id="ascension-witty-message" class="witty-gradient-text" style="text-align: left; margin-top: 1rem; font-size: 1.1em;">Premium Offline Transcription</div>
                                <div class="settings-label" style="padding: 2px 0;">
                                    <small>Download a model to enable offline, private audio transcription.</small>
                                </div>
                                ${modelsHTML}
                                <div class="settings-item" style="margin-top: 1rem;">
                                    <div class="settings-label"><b>Current Status</b><small id="transcription-model-status">No model downloaded.</small></div>
                                    <button class="btn btn-danger" id="delete-models-btn" style="display:none;" onclick="App.audio.deleteTranscriptionModels()">Delete Models</button>
                                </div>
                            </div>

                            <div class="modal-buttons">
                                <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                                <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                            </div>
                        `)}
                        </div>
                    </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                    App.audio.updateModelStatusUI();
                },

                showAppearanceModal() {
                    const currentTheme = App.settings.get('theme');
                    const themeOptions = App.config.themes.map(t => {
                        const isPremium = t.id === 'custom';
                        const isDisabled = isPremium && !App.license.isPremium();
                        return `<option value="${t.id}" ${currentTheme === t.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>${t.name}${isDisabled ? ' 👑' : ''}</option>`;
                    }).join('');

                    const currentFont = App.settings.get('fontFamily');
                    const fontOptions = App.config.fonts.map(font => {
                        const freeFonts = ['Arial, Helvetica, sans-serif', 'Cambria, Cochin, Georgia, Times, "Times New Roman", serif', "'Courier New', Courier, monospace", 'Garamond, serif', 'Georgia, serif', 'Helvetica, Arial, sans-serif', 'Monaco, "Lucida Console", monospace', 'Palatino, "Palatino Linotype", serif', 'sans-serif', "'Times New Roman', Times, serif", 'Verdana, Geneva, sans-serif'];
                        const isPremium = !freeFonts.includes(font.value);
                        const isDisabled = isPremium && !App.license.isPremium();
                        return `<option value="${font.value}" ${currentFont === font.value ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>${font.name}${isDisabled ? ' 👑' : ''}</option>`;
                    }).join('');

                    const currentSize = parseFloat(App.settings.get('fontSize'));
                    const currentLineHeight = App.settings.get('lineHeight');
                    const currentOpacity = App.settings.get('uiOpacity');
                    const ocrThreshold = App.settings.get('ocrThreshold') || 128;
                    const customThemeBase = App.settings.get('customThemeBase');
                    const isMobileViewEnabled = App.settings.get('mobileViewEnabled');
                    const mobileViewLabel = isMobileViewEnabled ? 'Switch to Desktop View' : 'Switch to Mobile View';
                    const mobileViewDescription = isMobileViewEnabled ? 'For utilizing the full power of the app.' : 'Optimized for small screens & touch.';
                    const libraryTitle = App.settings.get('libraryTitle') || 'My Library';

                    const captionThemes = [
                        { id: 'sharp-light', name: 'Sharp Light (Default)' },
                        { id: 'sharp-dark', name: 'Sharp Dark' },
                        { id: 'forest', name: 'Forest Green Text' },
                        { id: 'navy', name: 'Navy Blue Text' },
                        { id: 'maroon', name: 'Maroon Text' },
                        { id: 'chocolate', name: 'Chocolate Text' },
                        { id: 'charcoal', name: 'Charcoal Text' },
                        { id: 'sunbeam', name: 'Sunbeam Yellow' },
                        { id: 'aqua', name: 'Aqua Blue' },
                        { id: 'lime', name: 'Lime Green' },
                        { id: 'rose', name: 'Rose Pink' },
                        { id: 'lavender', name: 'Lavender' },
                        { id: 'soft-glow', name: 'Soft Glow' },
                        { id: 'letterpress', name: 'Letterpress (Carved)' },
                        { id: 'gold-leaf', name: 'Gold Leaf (Glow)' }
                    ];
                    const currentCaptionTheme = App.settings.get('captionTheme') || 'sharp-light';
                    const captionThemeOptions = captionThemes.map(t => `<option value="${t.id}" ${currentCaptionTheme === t.id ? 'selected' : ''}>${t.name}</option>`).join('');

                    const captionAlignments = [
                        { id: 'bottom', name: 'Bottom' }, { id: 'middle', name: 'Middle' }, { id: 'top', name: 'Top' }
                    ];
                    const currentCaptionAlign = App.settings.get('captionAlign') || 'bottom';
                    const captionAlignOptions = captionAlignments.map(a => `<option value="${a.id}" ${currentCaptionAlign === a.id ? 'selected' : ''}>${a.name}</option>`).join('');


                    const proPresenterModes = [
                        { id: 'living-cell', name: '🔬 Living Cell' },
                        { id: 'liquid-glow', name: '💧 Liquid Glow' },
                        { id: 'breathing-border', name: '🫁 Breathing Border' },
                        { id: 'electric-flow', name: '⚡ Phantom Wire' },
                        { id: 'sleek-trace', name: '🎯 Sleek Trace' }
                    ];
                    const currentProPresenterMode = App.settings.get('proPresenterMode') || 'living-cell';
                    const isProPresenterLocked = !App.license.isPremium();
                    const proPresenterModeOptions = proPresenterModes.map(m =>
                        `<option value="${m.id}" ${currentProPresenterMode === m.id ? 'selected' : ''} ${isProPresenterLocked ? 'disabled' : ''}>${m.name}${isProPresenterLocked ? ' 👑' : ''}</option>`
                    ).join('');

                    const modalHTML = `
                <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                    <div class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                        ${App.ui.getSettingsLayoutHTML('appearance', 'Appearance', `
                        
                        <div class="settings-section">
                            <h4><i class="fa-solid fa-swatchbook"></i> Theme & Layout</h4>
                            <div class="settings-grid">
                                <label for="theme-select">Theme</label>
                                <select id="theme-select" class="btn btn-secondary">${themeOptions}</select>

                                <label for="library-title-input">Library Title</label>
                                <input type="text" id="library-title-input" class="text-input" value="${App.util.escapeHtml(libraryTitle)}" placeholder="e.g., My Knowledge Garden">
                            </div>
                        </div>

                        <div id="custom-theme-controls" style="display: ${currentTheme === 'custom' ? 'block' : 'none'};" class="settings-section">
                            <h4><i class="fa-solid fa-image"></i> Custom Background</h4>
                            <div class="settings-grid">
                                <label for="custom-theme-base">UI Base</label>
                                <select id="custom-theme-base" class="btn btn-secondary">
                                    <option value="light" ${customThemeBase === 'light' ? 'selected' : ''}>Light UI</option>
                                    <option value="dark" ${customThemeBase === 'dark' ? 'selected' : ''}>Dark UI</option>
                                </select>
                                <div class="control-span" style="grid-column: 1 / -1;">
                                    <button id="change-bg-btn" class="btn btn-secondary" style="width:100%">Change Background Image</button>
                                </div>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4><i class="fa-solid fa-font"></i> Typography</h4>
                            <div class="settings-grid">
                                <label for="font-family-select">Font Family</label>
                                <select id="font-family-select" class="btn btn-secondary">${fontOptions}</select>
                                
                                <div class="settings-label" title="Controls the default text size within notes."><b>Font Size</b></div>
                                <div class="slider-control-wrapper"><input type="range" id="font-size-slider" min="0.8" max="2.2" step="0.05" value="${currentSize}"><span id="font-size-value">${currentSize.toFixed(2)}rem</span></div>

                                <div class="settings-label" title="Adjusts the vertical spacing between lines of text for better readability."><b>Line Spacing</b></div>
                                <div class="slider-control-wrapper"><input type="range" id="line-height-slider" min="1.4" max="2.2" step="0.05" value="${currentLineHeight}"><span id="line-height-value">${currentLineHeight}</span></div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4><i class="fa-solid fa-closed-captioning"></i> Image Caption Style</h4>
                            <div class="settings-grid">
                                <label for="caption-theme-select">Caption Color</label>
                                <select id="caption-theme-select" class="btn btn-secondary">${captionThemeOptions}</select>

                                <label for="caption-align-select">Caption Position</label>
                                <select id="caption-align-select" class="btn btn-secondary">${captionAlignOptions}</select>
                            </div>
                        </div>

                        <div class="settings-section">
                             <h4><i class="fa-solid fa-sliders"></i> UI & Image Settings</h4>
                             <div class="settings-grid">
                                <div class="settings-label" title="Adjusts the transparency of UI elements like modals and toolbars. Set to 0% for a fully transparent look."><b>UI Opacity</b></div>
                                <div class="slider-control-wrapper"><input type="range" id="opacity-slider" min="0" max="1" step="0.05" value="${currentOpacity}"><span id="opacity-value">${Math.round(currentOpacity * 100)}%</span></div>

                                <div class="settings-label" title="Controls the compression level for pasted or dropped images. Lower quality means smaller file sizes."><b>Import Image Quality</b></div>
                                <div class="slider-control-wrapper"><input type="range" id="image-quality-slider" min="0.1" max="1" step="0.05" value="${App.settings.get('jpegQuality')}"><span id="image-quality-value">${Math.round(App.settings.get('jpegQuality') * 100)}%</span></div>
                                
                                <div class="settings-label" title="Choose image format: JPEG for smaller file sizes, PNG for reliability (prevents corruption, keeps transparency)."><b>Image Format</b></div>
                                <select id="image-format-select" class="btn btn-secondary">
                                    <option value="jpeg" ${App.settings.get('imageFormat') === 'jpeg' ? 'selected' : ''}>Compressed (JPEG)</option>
                                    <option value="png" ${App.settings.get('imageFormat') === 'png' ? 'selected' : ''}>Reliable (PNG)</option>
                                </select>
                                <div class="settings-label" title="Adjusts the black/white contrast for OCR. Higher values work for light text on dark backgrounds; lower values for dark text on light backgrounds."><b>OCR Contrast</b></div>
                                <div class="slider-control-wrapper"><input type="range" id="ocr-threshold-slider" min="50" max="200" step="1" value="${ocrThreshold}"><span id="ocr-threshold-value">${ocrThreshold}</span></div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4><span style="display:inline-flex; align-items:center; vertical-align:middle; margin-right:8px;">${App.util.icons.proPresent}</span> Pro Presenter ${isProPresenterLocked ? '<span style="font-size:0.7em;opacity:0.6;">👑 Premium</span>' : ''}</h4>
                            <div class="settings-grid">
                                <div class="settings-label" title="Choose the animated border style shown when Pro Presenter is active. Each style is theme-sensitive."><b>Border Style</b></div>
                                <select id="pro-presenter-mode-select" class="btn btn-secondary" ${isProPresenterLocked ? 'disabled' : ''}>${proPresenterModeOptions}</select>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4><i class="fa-solid fa-mobile-screen-button"></i> View Mode</h4>
                            <div class="settings-item">
                                <div class="settings-label" id="mobile-view-label-container"><b>${mobileViewLabel}</b><small>${mobileViewDescription}</small></div>
                                <div id="mobile-view-toggle" class="toggle-switch ${isMobileViewEnabled ? 'active' : ''}"></div>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4><i class="fa-solid fa-calculator"></i> Reading Stats</h4>
                            <div class="settings-item">
                                <div class="settings-label"><b>Selection Word Counter</b><small>Show live word count when selecting text in Read Mode.</small></div>
                                <div id="read-mode-word-count-toggle" class="toggle-switch ${App.settings.get('showReadModeWordCount') ? 'active' : ''}"></div>
                            </div>
                        </div>

                        <div class="modal-buttons">
                            <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                            <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                        </div>
                    `)}
                    </div>
                </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                    document.getElementById('theme-select').addEventListener('change', (e) => App.events.handleThemeChange(e.target.value));
                    document.getElementById('library-title-input').addEventListener('input', App.events.changeLibraryTitle);
                    document.getElementById('font-family-select').addEventListener('input', App.events.changeFontFamily);
                    document.getElementById('font-size-slider').addEventListener('input', App.events.changeFontSize);
                    document.getElementById('line-height-slider').addEventListener('input', App.events.changeLineHeight);
                    document.getElementById('custom-theme-base').addEventListener('input', App.events.handleCustomThemeBaseChange);
                    document.getElementById('opacity-slider').addEventListener('input', App.events.changeUiOpacity);
                    document.getElementById('mobile-view-toggle').addEventListener('click', App.events.toggleMobileView);
                    document.getElementById('read-mode-word-count-toggle').addEventListener('click', function () {
                        this.classList.toggle('active');
                        App.settings.set('showReadModeWordCount', this.classList.contains('active'));
                    });
                    document.getElementById('image-quality-slider').addEventListener('input', App.events.changeImageQuality);
                    document.getElementById('ocr-threshold-slider').addEventListener('input', App.events.changeOcrThreshold);
                    document.getElementById('change-bg-btn').addEventListener('click', () => App.events.triggerBgImageUpload());

                    document.getElementById('caption-theme-select').addEventListener('change', (e) => App.settings.set('captionTheme', e.target.value));
                    document.getElementById('caption-align-select').addEventListener('change', (e) => App.settings.set('captionAlign', e.target.value));
                    document.getElementById('image-format-select').addEventListener('change', (e) => App.settings.set('imageFormat', e.target.value));
                    const ppModeSelect = document.getElementById('pro-presenter-mode-select');
                    if (ppModeSelect) {
                        ppModeSelect.addEventListener('change', (e) => {
                            const newMode = e.target.value;
                            App.settings.set('proPresenterMode', newMode);
                            // Apply immediately if Pro Presenter is active
                            if (document.body.classList.contains('is-pro-presenter-active')) {
                                document.body.setAttribute('data-pro-presenter-mode', newMode);
                            }
                        });
                    }
                },

                showFlashcardSettingsModal() {
                    const currentFim = App.settings.get('intervalModifier');
                    const currentSessionSize = App.settings.get('studySessionSize');

                    this.showConfirmationModal({
                        title: 'Flashcard Settings ⚙️',
                        message: `
                        <div class="settings-grid" style="gap: 1.5rem;">
                            <div class="control-span" title="Set the number of cards to study in a standard session.">
                                <label for="session-size-input" style="flex-grow: 1;">Study Session Size</label>
                                <input type="number" id="session-size-input" class="text-input" value="${currentSessionSize}" min="1" style="width: 80px; text-align: center;">
                            </div>
                            <div class="control-span" title="Adjust the speed of all review intervals. >100% is longer, <100% is shorter.">
                                <label for="interval-modifier-slider">Spaced Recall Controller</label>
                                <input type="range" id="interval-modifier-slider" min="0.3" max="2.5" step="0.05" value="${currentFim}">
                                <span id="interval-modifier-value" style="min-width: 50px; text-align: right;">${Math.round(currentFim * 100)}%</span>
                            </div>
                        </div>
                    `,
                        confirmText: 'Done',
                        showCancel: false,
                        onConfirm: () => { }, // The button will just close the modal
                        modalClass: 'flashcard-settings-modal'
                    });

                    // Add live event listeners for the new controls
                    document.getElementById('session-size-input').addEventListener('change', (e) => {
                        const newLimit = parseInt(e.target.value, 10);
                        if (newLimit > 0) {
                            App.settings.set('studySessionSize', newLimit);
                        }
                    });

                    document.getElementById('interval-modifier-slider').addEventListener('input', (e) => {
                        const modifier = parseFloat(e.target.value);
                        document.getElementById('interval-modifier-value').textContent = `${Math.round(modifier * 100)}%`;
                        App.settings.set('intervalModifier', modifier);
                    });
                },

                showChartModal() {
                    App.state.savedRange = window.getSelection().getRangeAt(0).cloneRange(); // Save cursor position

                    this.showConfirmationModal({
                        title: 'Create Chart',
                        message: `
                        <div class="settings-grid" style="gap: 1rem;">
                            <label for="chart-type-select">Chart Type</label>
                            <select id="chart-type-select" class="btn btn-secondary">
                                <option value="bar">Bar Chart</option>
                                <option value="bar-vertical">Bar (Vertical)</option>
                                <option value="line">Line Chart</option>
                                <option value="doughnut">Doughnut Chart</option>
                            </select>
                            <label for="chart-data-input" style="align-self: start; padding-top: 8px;">Data</label>
                            <textarea id="chart-data-input" class="text-input" rows="6" placeholder="Enter data, one item per line.\nFormat: Label,Value\n\nExample:\nApples,12\nOranges,9\nBananas,5"></textarea>
                        </div>
                    `,
                        confirmText: 'Insert Chart',
                        onConfirm: () => App.ui.insertChartFromModal(),
                        modalClass: 'chart-modal'
                    });
                    App.util.trapFocus(document.querySelector('.chart-modal'));
                    setTimeout(() => {
                        const dataInput = document.getElementById('chart-data-input');
                        if (dataInput) {
                            dataInput.focus();
                            dataInput.select();
                        }
                    }, 50);
                },


                async insertChartFromModal() {
                    if (!window.Chart && App.loadLibrary) {
                        try {
                            await App.loadLibrary('chartjs');
                        } catch (e) {
                            console.error('Failed to lazy load ChartJS:', e);
                        }
                    }
                    if (!window.Chart) {
                        App.ui.showToast("Chart library is not available.", { type: 'error' });
                        return;
                    }

                    const typeInput = document.getElementById('chart-type-select').value;
                    const dataText = document.getElementById('chart-data-input').value;
                    const lines = dataText.trim().split('\n').filter(line => line.includes(','));

                    if (lines.length === 0) {
                        App.ui.showToast("Invalid data format.", { type: 'error' });
                        return;
                    }

                    const labels = lines.map(line => line.split(',')[0].trim());
                    const data = lines.map(line => parseFloat(line.split(',')[1].trim()));

                    if (data.some(isNaN)) {
                        App.ui.showToast("Data contains non-numeric values.", { type: 'error' });
                        return;
                    }


                    let chartType;
                    switch (typeInput) {
                        case 'line':
                            chartType = 'line';
                            break;
                        case 'doughnut':
                            chartType = 'doughnut';
                            break;
                        case 'bar':
                        case 'bar-vertical':
                        default:
                            chartType = 'bar';
                            break;
                    }



                    const chartConfig = {

                        type: chartType,
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data
                            }]
                        },
                        options: {

                            indexAxis: typeInput === 'bar-vertical' ? 'y' : 'x',
                        }
                    };

                    const canvasId = `chart-${crypto.randomUUID()}`;
                    const chartConfigString = App.util.escapeHtml(JSON.stringify(chartConfig));

                    const html = `<div class="chart-container" contenteditable="false"><canvas id="${canvasId}" data-chart-config="${chartConfigString}" width="600" height="400" style="max-width: 100%; height: auto;"></canvas></div>`;

                    App.util.restoreSelection();
                    App.util.insertGuardianBlock(`<p>${html}</p>`); // Use the helper

                    setTimeout(() => {
                        const newCanvas = document.getElementById(canvasId);
                        if (newCanvas) {
                            App.ui.renderChartOnCanvas(newCanvas);
                        }
                        App.state.isArticleDirty = true; // Ensure autosave picks up the change
                    }, 100);
                },

                updateSettingsUIState() {
                    const modalContent = document.querySelector('.modal-content');
                    if (!modalContent) return;
                    const themeSelect = modalContent.querySelector('#theme-select');
                    if (!themeSelect) return;
                    const currentTheme = themeSelect.value;
                    modalContent.classList.toggle('is-custom-theme', currentTheme === 'custom');
                },

                showCategoryManagerModal() {
                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div id="category-manager-modal" class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                            ${App.ui.getSettingsLayoutHTML('categories', 'Category Manager', `
                                <div id="category-list-container" style="margin: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem;">
                                </div>
                                <div class="settings-section" style="padding-top: 1rem; margin-top: 1rem;">
                                    <h4 style="margin-top: 0;">Add New Category</h4>
                                    <div style="display: flex; gap: 0.75rem;">
                                        <input type="text" id="new-category-name" class="text-input" placeholder="Enter new category name...">
                                        <button class="btn btn-primary" id="add-category-btn">Add</button>
                                    </div>
                                </div>
                                <div class="modal-buttons" style="margin-top: 1.5rem; border: none; padding: 0;">
                                    <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                                    <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                                </div>
                            `)}
                        </div>
                    </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                    App.events.categories.refreshManager();

                    document.getElementById('add-category-btn').onclick = () => {
                        const input = document.getElementById('new-category-name');
                        if (input.value) {
                            App.events.categories.add(input.value);
                            input.value = '';
                        }
                    };
                    document.getElementById('new-category-name').onkeydown = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('add-category-btn').click();
                        }
                    };
                },


                async showStorageModal() {
                    // --- 1. GET CURRENT STATE ---
                    const isPremium = App.license.isPremium();
                    const clientId = App.settings.get('dropboxClientId') || '';
                    const isConnected = App.state.isDropboxReady;
                    const hasKey = !!clientId.trim();
                    const syncEnabled = App.settings.get('enableDropboxSync');
                    const lastSyncTime = App.util.formatTimestamp(App.settings.get('lastSyncTimestamp'));

                    // --- 2. BUILD THE CLOUD SYNC SECTION HTML ---

                    // This class locks the entire section if the user is not premium.
                    const premiumLockClass = !isPremium ? 'premium-feature-locked' : '';
                    let cloudSyncHTML = '';

                    if (!isPremium) {
                        // --- STATE A: SPARK (FREE) USER ---
                        // Show a clear upsell message.
                        cloudSyncHTML = `
                        <div class="premium-cta-text" style="text-align: center; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--border-radius-lg);">
                            Cloud Sync is a Premium feature.
                            <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="App.ui.showAscensionModal()">Unlock All Features</button>
                        </div>
                    `;
                    } else {
                        // --- STATE B-E: PREMIUM USER ---
                        // The user is Premium, so we show the step-by-step setup.

                        // STEP 1: API Key Input (Always visible for premium users)
                        const step1_ApiKeyHTML = `
                        <div class="settings-item">
                            <div class="settings-label">
                                <b>Step 1: Set Your API Key</b>
                                <small>Get this from your Dropbox App Console.</small>
                            </div>
                        </div>
                        <div style="display:flex; gap: 8px; align-items: stretch; margin-top: -0.5rem; margin-bottom: 1rem;">
                            <input type="password" id="dropbox-client-id-input" class="text-input" placeholder="Paste your App Key (Client ID) here" value="${clientId}">
                            <button class="btn btn-secondary" onclick="${hasKey ? 'App.events.removeDropboxClientId()' : 'App.events.saveDropboxClientId()'}">${hasKey ? 'Remove' : 'Save'}</button>
                        </div>
                    `;

                        // STEP 2: Connect Button (Enabled only if key is saved)
                        const step2_ConnectHTML = `
                        <div class="settings-item">
                            <div class="settings-label">
                                <b>Step 2: Connect to Dropbox</b>
                                <small>${isConnected ? `Connected as ${App.state.dropboxUser.email}` : 'Please save an API key and connect.'}</small>
                            </div>
                            ${isConnected ?
                                `<button class="btn btn-danger" onclick="App.dropbox.disconnect(); App.ui.showStorageModal();">Disconnect</button>` :
                                `<button class="btn btn-primary" onclick="App.dropbox.connect()" ${!hasKey ? 'disabled' : ''}>Connect</button>`
                            }
                        </div>
                    `;

                        // STEP 3: Enable Toggle (Enabled only if connected)
                        const step3_EnableHTML = `
                        <div class="settings-item" style="${!isConnected ? 'opacity: 0.5; pointer-events: none;' : ''}">
                            <div class="settings-label">
                                <b>Step 3: Enable Sync</b>
                                <small>${!isConnected ? 'You must be connected to enable sync.' : 'Turn on automatic syncing.'}</small>
                            </div>
                            <div id="sync-toggle" class="toggle-switch ${syncEnabled ? 'active' : ''} ${!isConnected ? 'is-disabled' : ''}"></div>
                        </div>
                    `;

                        // STEP 4: Manual Sync Button (Visible only if enabled)
                        const step4_ManualSyncHTML = (isConnected && syncEnabled) ? `
                        <div class="settings-item">
                            <div class="settings-label">
                                <b>Manual Sync</b>
                                <small>Last sync: ${lastSyncTime}</small>
                            </div>
                            <button id="sync-now-btn" class="btn btn-primary" onclick="App.dropbox.syncChanges()" ${!App.state.directoryHandle && App.state.storageMode !== 'browser' ? 'disabled' : ''} title="${!App.state.directoryHandle && App.state.storageMode !== 'browser' ? 'Please select a folder or use browser storage first.' : 'Sync Now'}">
                                ${App.state.isSyncing ? `<i class="fa-solid fa-arrows-rotate spin"></i> Syncing...` : 'Sync Now'}
                            </button>
                        </div>
                    ` : '';

                        // HELP GUIDE: Separate from the inputs, always available at the bottom.
                        const helpGuideHTML = `
                        <div class="settings-item" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                            <div class="settings-label">
                                <b>Need help?</b>
                                <small>Follow these steps to get your API key.</small>
                            </div>
                            <button class="btn btn-secondary" onclick="document.getElementById('dropbox-guide-content').style.display = document.getElementById('dropbox-guide-content').style.display === 'block' ? 'none' : 'block';">
                                Show Setup Guide
                            </button>
                        </div>
                        <div class="guide-content" id="dropbox-guide-content" style="display: none;">
                            <h3>1. Create Dropbox App</h3>
                            <ol>
                                <li>Go to the <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer">Dropbox App Console</a> and click <strong>Create app</strong>.</li>
                                <li>Select <strong>Scoped access</strong> &rarr; <strong>App folder</strong>. Name your app (e.g., "NoteKashSync").</li>
                                <li>In <strong>Permissions</strong>, check <code>files.content.read</code> and <code>files.content.write</code>. Click Submit. (you can allow more items as well)</li>
                                <li>In <strong>Settings</strong>, find "Redirect URIs" and add this exact URL: <code>https://notekash.com</code> or you can copy from "web address" as well. </li> 
                                <li>Copy the <strong>App key (Client ID)</strong> from this page.</li>
                            </ol>
                            <h3>2. Save Your Key</h3>
                            <p>Paste the <strong>App key (Client ID)</strong> into the "Step 1" input box above and click <strong>Save</strong> then click <strong> Connect </strong> and you have sucessfully connected the <strong> powerful Automatic Multi Device Sync </strong>.</p>
                        </div>
                    `;

                        // Combine all parts for the premium user
                        cloudSyncHTML = step1_ApiKeyHTML + step2_ConnectHTML + step3_EnableHTML + step4_ManualSyncHTML + helpGuideHTML;
                    }

                    // --- 3. ASSEMBLE THE FINAL MODAL ---
                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                            ${App.ui.getSettingsLayoutHTML('storage', 'Storage & Sync', `

                            <div class="settings-section">
                                <h4><i class="fa-solid fa-folder-open"></i> Local Storage</h4>
                                <div class="settings-item">
                                    <div class="settings-label"><b>Notes Folder</b><small>${App.state.directoryHandle ? `Using folder: '${App.state.directoryHandle.name}'` : 'Using Browser Storage.'}</small></div>
                                    <button class="btn btn-secondary" onclick="App.ui.closeModal(); App.router.navigateTo('welcome');">Change</button>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-label"><b>Backup</b><small>Save or Restore your Note or All Data files.</small></div>
                                    <div style="display:flex; gap: 8px;">
                                        <button class="btn btn-secondary" onclick="App.events.triggerZipImport()">Import</button>
                                        <button class="btn btn-secondary" onclick="App.services.backup.exportToZip()">Export</button>
                                    </div>
                                </div>
                            </div>


                            <div class="settings-section ${premiumLockClass}">
                                <h4><i class="fa-brands fa-dropbox"></i> Cloud Sync</h4>
                                ${cloudSyncHTML}
                            </div>

                            <!-- App Updater Section -->
                            <div class="settings-section">
                                <h4><i class="fa-solid fa-arrows-rotate"></i> App Update</h4>
                                <div class="settings-item">
                                    <div class="settings-label">
                                        <b>Check for Updates</b>
                                        <small>Upgrade to the latest build with new features and fixes.</small>
                                    </div>
                                    <button onclick="App.ui.showUpdateConfirmationModal()" class="btn btn-primary" style="padding: 7px 16px; display: inline-flex; align-items: center; gap: 7px; font-weight: 600; white-space: nowrap; border-radius: 10px;">
                                        <i class="fa-solid fa-arrows-rotate"></i> Check Now
                                    </button>
                                </div>
                            </div>

                            <div class="modal-buttons">
                                <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                                <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                            </div>
                        `)}
                        </div>
                    </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;

                    // --- 4. RE-ATTACH LISTENERS ---
                    const syncToggle = document.getElementById('sync-toggle');
                    if (syncToggle && !syncToggle.classList.contains('is-disabled')) {
                        syncToggle.addEventListener('click', App.events.handleSyncToggle);
                    }
                },

                showUpdateConfirmationModal() {
                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div class="modal-content ui-card" style="max-width: 400px; text-align: center; border-radius: 24px; padding: 2.25rem 2rem; box-shadow: 0 24px 48px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
                            <div style="width: 60px; height: 60px; margin: 0 auto 1.25rem; border-radius: 18px; background: linear-gradient(135deg, rgba(255, 69, 0, 0.12), rgba(251, 191, 36, 0.15)); display: flex; align-items: center; justify-content: center; font-size: 2rem; border: 1px solid rgba(255, 69, 0, 0.25);">🚀</div>
                            <h3 style="margin: 0 0 0.5rem 0; font-family: var(--font-display); font-weight: 700; font-size: 1.35rem; color: var(--text-primary);">Check for Updates</h3>
                            
                            <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0 0 1.5rem 0; line-height: 1.5;">
                                Get the latest features and improvements.
                                <br>
                                <span style="font-size: 0.82rem; opacity: 0.85; color: var(--text-muted);">All notes and data remain safely preserved.</span>
                            </p>

                            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                                <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px 18px; font-weight: 600; border-radius: 14px; font-size: 0.95rem; background: linear-gradient(135deg, #ff4500 0%, #ff8c00 100%); border: none; box-shadow: 0 4px 16px rgba(255, 69, 0, 0.35);" onclick="App.ui.closeModal(); App.Updater.nukeCacheAndReload()">
                                    ⚡ Update Now
                                </button>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
                                    <button class="btn btn-secondary" style="justify-content: center; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; font-weight: 500;" onclick="App.services.backup.exportToZip()" title="Export all notes before updating">
                                        <i class="fa-solid fa-download" style="margin-right: 6px;"></i> Backup
                                    </button>
                                    <button class="btn btn-secondary" style="justify-content: center; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; font-weight: 500;" onclick="App.ui.closeModal()">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    document.getElementById('modal-container').innerHTML = modalHTML;
                },


                showShortcutsModal() {
                    const cmdKey = App.util.getCommandKey();
                    const messageContent = `<div class="shortcut-modal-content" style="font-size: 0.9rem;">
                        <h4>Global & Navigation</h4>
                        <ul>
                            <li><b>New Article:</b> <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd></li>
                            <li><b>Open Search:</b> <kbd>${cmdKey}</kbd> + <kbd>K</kbd></li>
                            <li><b>Open/Change Notes Folder:</b> <kbd>Alt</kbd> + <kbd>O</kbd></li>
                            <li><b>Close Modal / Exit View:</b> <kbd>Esc</kbd></li>
                        </ul><hr>
                        
                        <h4>Library & Search Bar</h4>
                        <ul>
                            <li><b>Focus Search Box:</b> Press <kbd>S</kbd> (in Library or Flashcard view)</li>
                            <li><b>Filter by Category:</b> <kbd>*sci</kbd> (filters for 'Science')</li>
                            <li><b>Quick Commands (type in search and press Enter):</b>
                                <ul style="margin-top: 0.5rem; list-style-type: '→ '; padding-left: 20px;">
                                    <li><kbd>%new</kbd> or <kbd>%+</kbd> &mdash; Create a new article</li>
                                    <li><kbd>%flash</kbd> &mdash; Go to Flashcards</li>
                                    <li><kbd>%study</kbd> &mdash; Start a study session</li>
                                    <li><kbd>!stats</kbd> &mdash; Open Stats Dashboard</li>
                                    <li><kbd>!quiz</kbd> &mdash; Start a new Quiz</li>
                                </ul>
                            </li>
                        </ul><hr>
                        <h4>Write Mode: Formatting Shortcuts</h4>
                        <ul>
                            <li><b>Save Article:</b> <kbd>${cmdKey}</kbd> + <kbd>S</kbd></li>
                            <li><b>Insert Accordion/Flashcard:</b> <kbd>${cmdKey}</kbd> + <kbd>J</kbd></li>
                            <li><b>Bold / Italic / Underline:</b> <kbd>${cmdKey}</kbd> + <kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd></li>
                            <li><b>Create Cloze Flashcard:</b> Select text + <kbd>${cmdKey}</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></li>
                            <li><b>Create Visual Tag [[...]]:</b> <kbd>${cmdKey}</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd></li>
                            <li><b>Cycle All Highlights/Colors:</b> Select text + <kbd>${cmdKey}</kbd> + <kbd>Shift</kbd> + <kbd>1</kbd></li>
                            <li><b>Specific Highlights:</b> Select text + <kbd>${cmdKey}</kbd> + <kbd>Shift</kbd> + <kbd>2</kbd> through <kbd>7</kbd></li>
                            <li><b>Color Text (Green/Red/Blue/Magenta):</b> Select text + <kbd>${cmdKey}</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd> / <kbd>9</kbd> / <kbd>0</kbd> / <kbd>-</kbd></li>
                        </ul><hr>
                        <h4>Write Mode: Markdown-Style Shortcuts</h4>
                        <p>Type these at the start of a new line, then press space.</p>
                        <ul>
                            <li><b>Visual Tag:</b> <kbd>[[Your Tag]]</kbd></li>
                            <li><b>Bulleted List:</b> <kbd>*</kbd> or <kbd>-</kbd> + <kbd>Space</kbd></li>
                            <li><b>Numbered List:</b> <kbd>1.</kbd> + <kbd>Space</kbd></li>
                            <li><b>Blockquote:</b> <kbd>&gt;</kbd> + <kbd>Space</kbd></li>
                            <li><b>Heading:</b> <kbd>##</kbd> + <kbd>Space</kbd></li>
                            <li><b>Horizontal Line:</b> <kbd>---</kbd> + <kbd>Enter</kbd></li>
                            <li><b>Custom Highlights:</b>
                                <ul style="margin-top: 0.5rem; list-style-type: '→ '; padding-left: 20px;">
                                    <li><kbd>==text==</kbd> for <span class="highlight-1">Yellow</span></li>
                                    <li><kbd>==text==g</kbd> for <span class="highlight-2">Green</span></li>
                                    <li><kbd>==text==b</kbd> for <span class="highlight-3">Blue</span></li>
                                    <li><kbd>==text==r</kbd> for <span class="highlight-4">Red</span></li>
                                    <li><kbd>==text==p</kbd> for <span class="highlight-5">Purple</span></li>
                                    <li><kbd>==text==c</kbd> for <span class="highlight-6">Cyan</span></li>
                                    <li><kbd>==text==m</kbd> for <span class="highlight-7">Magenta</span> (Rendered Tag style)</li>
                                </ul>
                            </li>
                            <li><b>Color Text:</b>
                                <ul style="margin-top: 0.5rem; list-style-type: '→ '; padding-left: 20px;">
                                    <li><kbd>::text_r::</kbd> for <span class="text-red">Red Text</span></li>
                                    <li><kbd>::text_g::</kbd> for <span class="text-green">Green Text</span></li>
                                    <li><kbd>::text_b::</kbd> for <span class="text-blue">Blue Text</span></li>
                                    <li><kbd>::text_m::</kbd> for <span class="text-magenta">Magenta Text</span></li>
                                </ul>
                            </li>
                        </ul><hr>
                        <h4>Visual Map View</h4>
                        <p>These shortcuts work when the search bar is not focused.</p>
                        <ul>
                            <li><b>Focus Search:</b> <kbd>S</kbd></li>
                            <li><b>Save Snapshot & Export Image:</b> <kbd>F</kbd></li>
                            <li><b>Zoom:</b> <kbd>Spacebar</kbd> / <kbd>Shift</kbd>+<kbd>Spacebar</kbd> or <kbd>+</kbd> / <kbd>-</kbd></li>
                            <li><b>Pan View:</b> <kbd>Arrow Keys</kbd></li>
                            <li><b>Reset View:</b> <kbd>R</kbd></li>
                            <li><b>Toggle Lasso Tool:</b> <kbd>L</kbd></li>
                            <li><b>Cycle Category Focus:</b> <kbd>C</kbd></li>
                            <li><b>Exit Focus Mode / Clear Search:</b> <kbd>Esc</kbd></li>
                        </ul><hr>
                        <h4>Mind Map View</h4>
                        <p>These shortcuts work when the search bar is not focused.</p>
                        <ul>
                            <li><b>Focus Search:</b> <kbd>S</kbd></li>
                            <li><b>Save Snapshot & Export Image:</b> <kbd>F</kbd></li>
                            <li><b>Next / Previous Map:</b> <kbd>K</kbd> / <kbd>J</kbd></li>
                            <li><b>Zoom:</b> <kbd>Spacebar</kbd> / <kbd>Shift</kbd>+<kbd>Spacebar</kbd></li>
                            <li><b>Exit Focus Mode / Clear Search:</b> <kbd>Esc</kbd></li>
                        </ul><hr>
                        <h4>Study & Quiz Mode</h4>
                        <ul>
                            <li><b>Flip Card:</b> <kbd>Spacebar</kbd></li>
                            <li><b>Previous / Next Card:</b> <kbd>←</kbd> / <kbd>→</kbd></li>
                            <li><b>Rate Again/Hard/Hold/Good/Easy:</b> <kbd>A</kbd> / <kbd>4</kbd> / <kbd>3</kbd> / <kbd>2</kbd> / <kbd>1</kbd></li>
                        </ul>
                    </div>`;

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div id="shortcuts-modal" class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                            ${App.ui.getSettingsLayoutHTML('shortcuts', 'Shortcut Manual', `
                                ${messageContent}
                                <div class="modal-buttons" style="margin-top: 1.5rem; border: none; padding: 0;">
                                    <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                                    <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                                </div>
                            `)}
                        </div>
                    </div>`;
                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                showAudioConfigModal() {
                    const currentBitrate = App.settings.get('audioBitrate');
                    // ADDED: New "Mini" option with a 16000 bitrate
                    const bitrateOptions = [
                        { value: 16000, label: 'Mini (To Save Space)' },
                        { value: 32000, label: 'Low (Voice Memo - Smallest File)' },
                        { value: 64000, label: 'Medium (Podcast - Recommended)' },
                        { value: 128000, label: 'High (Music - Largest File)' }
                    ].map(opt => `<option value="${opt.value}" ${currentBitrate === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('');

                    const models = [
                        { id: 'tiny', name: 'Smooth', size: '75 MB' },
                        { id: 'base', name: 'Good', size: '142 MB' },
                        { id: 'small', name: 'Better', size: '466 MB' },
                        { id: 'medium', name: 'Excellent', size: '1.42 GB' }
                    ];
                    // ... (The rest of the function remains exactly the same) ...
                    const modelsHTML = models.map(model => `
                    <div class="settings-item">
                        <div class="settings-label">
                            <b>${model.name} Model</b>
                            <small>${model.size} download</small>
                        </div>
                        <button class="btn btn-secondary" id="download-model-${model.id}" onclick="App.audio.downloadTranscriptionModel('Xenova/whisper-${model.id}')">Download</button>
                    </div>
                `).join('');

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div id="audio-config-modal" class="modal-content ui-card" onclick="event.stopPropagation()">
                            <h3>Audio Configuration</h3>
                            <div class="settings-section">
                                <h4>Recording Quality</h4>
                                <div class="settings-grid">
                                    <label for="audio-bitrate-select">Audio Quality</label>
                                    <select id="audio-bitrate-select" class="btn btn-secondary">${bitrateOptions}</select>
                                </div>
                            </div>
                            <div class="settings-section">
                                <div id="ascension-witty-message" class="witty-gradient-text">Only for Premium Users</div>
                                <h4>Audio Transcription (by AI Model)</h4>
                                <div class="settings-label" style="padding: 2px 0;">
                                    <small>Download a model to enable offline, private audio transcription. Larger models are more accurate but require more storage and processing power.</small>
                                </div>
                                ${modelsHTML}
                                    <button class="btn btn-danger" id="delete-models-btn" style="display:none;" onclick="App.audio.deleteTranscriptionModels()">Delete</button>
                                 </div>
                            </div>
                            <div class="modal-buttons" style="margin-top: 1.5rem;">
                                <button class="btn btn-secondary" onclick="App.ui.closeModal(); App.ui.showSettingsModal();">Back</button>
                            </div>
                        </div>
                    </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;
                    document.getElementById('audio-bitrate-select').addEventListener('change', (e) => App.settings.set('audioBitrate', parseInt(e.target.value, 10)));
                    App.audio.updateModelStatusUI();
                },

                selectProfileGender(gender) {
                    document.getElementById('profile-gender-select').value = gender;
                    
                    const maleBtn = document.getElementById('profile-gender-male');
                    const femaleBtn = document.getElementById('profile-gender-female');
                    if (gender === 'Male') {
                        maleBtn.style.background = 'var(--bg-primary)';
                        maleBtn.style.color = 'var(--primary-color)';
                        maleBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        femaleBtn.style.background = 'transparent';
                        femaleBtn.style.color = 'var(--text-secondary)';
                        femaleBtn.style.boxShadow = 'none';
                    } else {
                        femaleBtn.style.background = 'var(--bg-primary)';
                        femaleBtn.style.color = 'var(--primary-color)';
                        femaleBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        maleBtn.style.background = 'transparent';
                        maleBtn.style.color = 'var(--text-secondary)';
                        maleBtn.style.boxShadow = 'none';
                    }

                    this.renderProfileAvatarList(gender);
                },

                renderProfileAvatarList(gender) {
                    const avatarScroll = document.getElementById('profile-avatar-scroll');
                    if (!avatarScroll) return;
                    const currentAvatarId = parseInt(document.getElementById('profile-avatar-select').value, 10);
                    
                    let selectedId = currentAvatarId;
                    if (gender === 'Male' && currentAvatarId > 6) selectedId = 1;
                    else if (gender === 'Female' && currentAvatarId <= 6) selectedId = 7;
                    document.getElementById('profile-avatar-select').value = selectedId;
                    
                    const startIdx = gender === 'Male' ? 1 : 7;
                    const endIdx = gender === 'Male' ? 6 : 12;
                    
                    let html = '';
                    for (let id = startIdx; id <= endIdx; id++) {
                        const isSelected = id === selectedId;
                        html += `
                            <div class="profile-avatar-item" onclick="App.ui.selectProfileAvatar(${id})" style="width: 46px; height: 46px; border-radius: 50%; overflow: hidden; cursor: pointer; flex-shrink: 0; border: 3px solid ${isSelected ? 'var(--primary-color)' : 'transparent'}; box-shadow: ${isSelected ? '0 0 10px rgba(var(--primary-color-rgb), 0.3)' : 'none'}; padding: 2px; transition: all 0.2s; background: var(--bg-secondary);">
                                ${App.util.getAvatarSVG(id)}
                            </div>
                        `;
                    }
                    avatarScroll.innerHTML = html;
                    document.getElementById('profile-avatar-preview-container').innerHTML = App.util.getAvatarSVG(selectedId);
                },

                selectProfileAvatar(id) {
                    document.getElementById('profile-avatar-select').value = id;
                    
                    const items = document.querySelectorAll('.profile-avatar-item');
                    const gender = document.getElementById('profile-gender-select').value;
                    const offset = gender === 'Male' ? 1 : 7;
                    
                    items.forEach((item, index) => {
                        const itemId = offset + index;
                        const isSelected = itemId === id;
                        item.style.borderColor = isSelected ? 'var(--primary-color)' : 'transparent';
                        item.style.boxShadow = isSelected ? '0 0 10px rgba(var(--primary-color-rgb), 0.3)' : 'none';
                    });

                    document.getElementById('profile-avatar-preview-container').innerHTML = App.util.getAvatarSVG(id);
                },

                async showLicenseModal() {
                    let session = App.state._cachedSession || null;
                    let dbProfile = App.state._cachedProfile || null;

                    const renderModal = (curSession, curProfile) => {
                        const isPremium = App.license.isPremium();
                        const tierName = App.license.state.tier || 'Spark';
                        const brandName = App.settings.get('brandName') || '';
                        const brandLink = App.settings.get('brandLink') || '';

                        const userName = curProfile?.full_name || App.license.state.userName || (curSession ? curSession.user.email.split('@')[0] : 'Valued User');
                        const userBio = curProfile?.bio || '';
                        const userGender = curProfile?.gender || 'Male';
                        const avatarId = curProfile?.avatar_id || 1;

                        const brandSectionHTML = isPremium ? `
                            <div class="settings-section" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem; text-align: left; width: 100%;">
                                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-copyright" style="color: var(--primary-color);"></i> Brand &amp; Watermark Settings</h4>
                                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">Customize your export brand signature and watermark text. Changes are saved automatically.</p>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        <label for="brand-name-input" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Brand / Watermark Name</label>
                                        <input type="text" id="brand-name-input" class="text-input" value="${App.util.escapeHtml(brandName)}" placeholder="e.g. My Study Notes" onchange="App.settings.set('brandName', this.value.trim())" style="background: var(--bg-primary); padding: 8px 12px; border-radius: 8px;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        <label for="brand-link-input" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Brand Link URL</label>
                                        <input type="url" id="brand-link-input" class="text-input" value="${App.util.escapeHtml(brandLink)}" placeholder="https://yoursite.com" onchange="App.settings.set('brandLink', this.value.trim())" style="background: var(--bg-primary); padding: 8px 12px; border-radius: 8px;">
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="settings-section" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem; text-align: left; width: 100%; opacity: 0.65;">
                                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">🔒 Brand &amp; Watermark Settings <span style="font-size: 0.75rem; font-weight: normal; color: var(--primary-color);">(Premium)</span></h4>
                                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">Add dynamic brand headers and remove watermarks on HTML/PDF exports.</p>
                                <div style="display: flex; flex-direction: column; gap: 12px; pointer-events: none;">
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        <input type="text" class="text-input" placeholder="Upgrade to premium to unlock" disabled style="background: var(--bg-primary); padding: 8px 12px; border-radius: 8px;">
                                    </div>
                                </div>
                            </div>
                        `;

                        let contentHTML = '';

                        if (curSession) {
                            contentHTML = `
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 1.2rem; width: 100%;">
                                    <!-- Hidden input elements to support Supabase updates -->
                                    <input type="hidden" id="profile-avatar-select" value="${avatarId}">
                                    <input type="hidden" id="profile-gender-select" value="${userGender}">

                                    <!-- ID Card View -->
                                    <div id="profile-view-card" style="width: 100%; padding: 1.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 24px; box-shadow: 0 12px 30px rgba(0,0,0,0.06); box-sizing: border-box; text-align: left; position: relative; overflow: hidden; animation: fadeIn 0.25s ease;">
                                        <!-- Decorative ambient background glow -->
                                        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255, 69, 0, 0.1) 0%, rgba(255, 69, 0, 0) 70%); pointer-events: none; border-radius: 50%;"></div>
                                        <div style="position: absolute; right: -10px; bottom: -10px; opacity: 0.03; transform: scale(1.5) rotate(-15deg); pointer-events: none;">
                                            ${App.util.getTierBadgeHTML(tierName, 120)}
                                        </div>
                                        
                                        <div style="display: flex; gap: 18px; align-items: center; margin-bottom: 1.25rem; position: relative; z-index: 2;">
                                            <div id="profile-badge-preview-container" style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                                                ${App.util.getTierBadgeHTML(tierName, 52)}
                                            </div>
                                            <div style="flex: 1; min-width: 0;">
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${App.util.escapeHtml(userName)}</h4>
                                                    <div id="profile-avatar-preview-container" style="width: 30px; height: 30px; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary-color); display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); padding: 1px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(255,69,0,0.12);">
                                                        ${App.util.getAvatarSVG(avatarId)}
                                                    </div>
                                                </div>
                                                <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; opacity: 0.8;">${App.util.escapeHtml(curSession.user.email)}</p>
                                            </div>
                                        </div>
                                        
                                        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-bottom: 1.25rem; position: relative; z-index: 2;">
                                            <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; margin-bottom: 5px;">Biography / Study Goals</div>
                                            <p style="margin: 0; font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; min-height: 36px; font-style: ${userBio ? 'normal' : 'italic'}; opacity: ${userBio ? '1' : '0.75'};">
                                                ${userBio ? App.util.escapeHtml(userBio) : 'No bio or study goals added yet.'}
                                            </p>
                                        </div>
                                        
                                        <!-- PRO MEMBERSHIP STATUS TILE -->
                                        ${isPremium ? (() => {
                                            const now = new Date();
                                            const expiry = new Date(App.license.state.expiry);
                                            const diffMs = expiry - now;
                                            const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                                            
                                            let totalDays = 90;
                                            if (tierName === 'Silver') totalDays = 180;
                                            if (tierName === 'Gold') totalDays = 365;
                                            if (tierName === 'Diamond') totalDays = 36500;
                                            
                                            const percent = tierName === 'Diamond' ? 100 : Math.min(100, Math.max(0, (daysLeft / totalDays) * 100));
                                            const formattedExpiry = expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                            
                                            return `
                                            <div class="pro-status-tile" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 18px; padding: 1.25rem; margin-bottom: 1.25rem; color: var(--text-primary); position: relative; z-index: 2; box-shadow: 0 6px 18px rgba(0,0,0,0.04);">
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                                    <div style="display: flex; align-items: center; gap: 8px;">
                                                        <span style="font-size: 1.1rem; display: flex; align-items: center;">💎</span>
                                                        <span style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-primary);">Pro Membership Status</span>
                                                    </div>
                                                    <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 20px; background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">ACTIVE</span>
                                                </div>
                                                
                                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
                                                    <div>
                                                        <div style="font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 4px;">Valid Until</div>
                                                        <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${formattedExpiry}</div>
                                                    </div>
                                                    <div style="text-align: right;">
                                                        <div style="font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 4px;">Time Remaining</div>
                                                        <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">${tierName === 'Diamond' ? 'Lifetime Access' : `${daysLeft} Days left`}</div>
                                                    </div>
                                                </div>
                                                
                                                <div style="width: 100%; height: 5px; background: var(--bg-primary); border-radius: 10px; overflow: hidden; margin-top: 10px; border: 1px solid var(--border-color);">
                                                    <div style="width: ${percent}%; height: 100%; background: var(--primary-color); border-radius: 10px; transition: width 0.5s ease-out;"></div>
                                                </div>
                                            </div>
                                            `;
                                        })() : `
                                            <div style="background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: 18px; padding: 1rem; margin-bottom: 1.25rem; text-align: center; position: relative; z-index: 2;">
                                                <div style="font-size: 1.1rem; margin-bottom: 4px;">✨</div>
                                                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Spark League (Free Tier)</div>
                                                <div style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px;">Upgrade to unlock all premium features.</div>
                                            </div>
                                        `}
                                        
                                        <button class="btn btn-secondary" onclick="document.getElementById('profile-view-card').style.display='none'; document.getElementById('profile-edit-section').style.display='flex';" style="width: 100%; padding: 10px; font-weight: 600; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                            <i class="fa-solid fa-pen-to-square"></i> Edit Profile
                                        </button>
                                    </div>

                                    <!-- Edit Profile Section (Hidden by default) -->
                                    <div id="profile-edit-section" style="display: none; text-align: left; width: 100%; flex-direction: column; gap: 12px; animation: fadeIn 0.25s ease;">
                                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
                                            <h4 style="font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text-primary);">Edit Profile Details</h4>
                                            <button class="btn btn-secondary" onclick="document.getElementById('profile-edit-section').style.display='none'; document.getElementById('profile-view-card').style.display='block';" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 8px;">Cancel</button>
                                        </div>
                                        
                                        <div style="display: flex; flex-direction: column; gap: 4px;">
                                            <label style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Full Name *</label>
                                            <input type="text" id="profile-name-input" class="text-input" value="${App.util.escapeHtml(userName)}" style="background: var(--bg-primary); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 0.9rem; width: 100%;">
                                        </div>

                                        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                                <label style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Gender *</label>
                                                <div class="gender-toggle-group" style="display: flex; background: var(--bg-tertiary); padding: 4px; border-radius: 12px; border: 1px solid var(--border-color); gap: 4px; width: 100%; box-sizing: border-box;">
                                                    <button type="button" id="profile-gender-male" onclick="App.ui.selectProfileGender('Male')" style="flex: 1; border: none; padding: 10px; border-radius: 9px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: ${userGender === 'Male' ? 'var(--bg-primary)' : 'transparent'}; color: ${userGender === 'Male' ? 'var(--primary-color)' : 'var(--text-secondary)'}; box-shadow: ${userGender === 'Male' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};">Male</button>
                                                    <button type="button" id="profile-gender-female" onclick="App.ui.selectProfileGender('Female')" style="flex: 1; border: none; padding: 10px; border-radius: 9px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: ${userGender === 'Female' ? 'var(--bg-primary)' : 'transparent'}; color: ${userGender === 'Female' ? 'var(--primary-color)' : 'var(--text-secondary)'}; box-shadow: ${userGender === 'Female' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'};">Female</button>
                                                </div>
                                            </div>
                                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                                <label style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Select Avatar *</label>
                                                <div id="profile-avatar-scroll" style="display: flex; gap: 10px; overflow-x: auto; padding: 6px 2px; width: 100%; -webkit-overflow-scrolling: touch; scrollbar-width: none; box-sizing: border-box;">
                                                    <!-- Dynamic avatar options populated by JS -->
                                                </div>
                                            </div>
                                        </div>

                                        <div style="display: flex; flex-direction: column; gap: 4px;">
                                            <label style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Bio / Study Goals</label>
                                            <textarea id="profile-bio-input" rows="2" style="background: var(--bg-primary); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-color); font-family: inherit; font-size: 0.9rem; resize: none; width: 100%;">${App.util.escapeHtml(userBio)}</textarea>
                                        </div>

                                        <button class="btn btn-primary" onclick="App.ui.updateProfileDetails()" style="margin-top: 4px; font-weight: 600; padding: 10px; width: 100%;">Save Profile Changes</button>
                                    </div>
                                    
                                    <div style="display: flex; gap: 12px; margin-top: 0.5rem; width: 100%; justify-content: center;">
                                        ${!isPremium ? `<button class="btn btn-primary" onclick="App.ui.closeModal(); App.ui.showAscensionModal();" style="flex: 1; padding: 10px; font-weight: 600; background: linear-gradient(135deg, var(--primary-color), #ff8c00); border: none; color: white;">Upgrade to Pro</button>` : ''}
                                        <button class="btn btn-danger" onclick="App.ui.handleSignOut()" style="flex: 1; padding: 10px; font-weight: 600;">Sign Out</button>
                                    </div>
                                </div>
                                ${brandSectionHTML}
                            </div>
                        `;
                        } else {
                            contentHTML = `
                                <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 1.5rem 0; width: 100%;">
                                    <div style="font-size: 3.5rem; filter: drop-shadow(0 0 10px rgba(255, 69, 0, 0.2));">☁️</div>
                                    <h4 style="font-size: 1.4rem; font-weight: 700; background: linear-gradient(135deg, var(--primary-color), #ff8c00); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Sign In or Sign Up</h4>
                                    <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; max-width: 320px; margin: 0 auto; margin-bottom: 0.5rem;">Sign in to sync your notes, focus time, and premium membership across all NoteKash apps.</p>
                                    <button class="btn btn-primary" onclick="window.location.href='./login.html'" style="padding: 12px 32px; font-weight: 700; border-radius: 12px; background: linear-gradient(135deg, var(--primary-color), #ff8c00); border: none; box-shadow: 0 4px 15px rgba(255,69,0,0.3); cursor: pointer; transition: all 0.2s;">Sign In / Sign Up</button>
                                    ${brandSectionHTML}
                                </div>
                            `;
                        }

                        const modalHTML = `
                        <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                            <div id="license-modal-content" class="modal-content settings-modal-container" onclick="event.stopPropagation()">
                                ${App.ui.getSettingsLayoutHTML('profile', 'Profile & Account', `
                                    ${contentHTML}
                                    <div class="modal-buttons" style="margin-top: 1.5rem; border: none; padding: 0;">
                                        <button class="btn btn-secondary mobile-only" onclick="App.ui.closeModal(); App.ui.showSettingsModal();" style="width: 100%;">Back</button>
                                        <button class="btn btn-secondary desktop-only" onclick="App.ui.closeModal();" style="width: 100%;">Close</button>
                                    </div>
                                `)}
                            </div>
                        </div>`;
                        document.getElementById('modal-container').innerHTML = modalHTML;

                        if (curSession) {
                            App.ui.renderProfileAvatarList(userGender);
                        }
                    };

                    // 1. INSTANT RENDER (0ms latency, never wait for network)
                    renderModal(session, dbProfile);

                    // 2. Refresh Supabase session/profile asynchronously in background
                    if (App.supabase && App.supabase.auth) {
                        try {
                            const { data } = await App.supabase.auth.getSession();
                            const freshSession = data?.session || null;
                            App.state._cachedSession = freshSession;
                            let freshProfile = null;

                            if (freshSession) {
                                try {
                                    const { data: pData } = await App.supabase
                                        .from('profiles')
                                        .select('full_name, avatar_id, gender, bio')
                                        .eq('id', freshSession.user.id)
                                        .single();
                                    if (pData) freshProfile = pData;
                                    App.state._cachedProfile = freshProfile;
                                } catch (err) {
                                    console.warn("Profile fetch error:", err);
                                }
                            }

                            // If modal is still open and fresh data is available, update seamlessly
                            const modalEl = document.getElementById('license-modal-content');
                            if (modalEl && (freshSession !== session || freshProfile !== dbProfile)) {
                                renderModal(freshSession, freshProfile);
                            }
                        } catch (e) {
                            console.warn("Background session sync warning:", e);
                        }
                    }
                },

                filterProfileAvatarDropdown() {
                    const gender = document.getElementById('profile-gender-select').value;
                    const avatarSelect = document.getElementById('profile-avatar-select');
                    const currentValue = parseInt(avatarSelect.value, 10);
                    
                    if (gender === 'Male' && currentValue > 6) {
                        avatarSelect.value = "1";
                    } else if (gender === 'Female' && currentValue <= 6) {
                        avatarSelect.value = "7";
                    }
                },

                async updateProfileDetails() {
                    try {
                        const { data: { session } } = await App.supabase.auth.getSession();
                        if (!session) return;

                        const name = document.getElementById('profile-name-input').value.trim();
                        const gender = document.getElementById('profile-gender-select').value;
                        const avatarId = parseInt(document.getElementById('profile-avatar-select').value, 10);
                        const bio = document.getElementById('profile-bio-input').value.trim();

                        if (!name) {
                            App.ui.showToast("Name is required.", "error");
                            return;
                        }

                        App.ui.showToast("Saving details...", "info");
                        const { error } = await App.supabase
                            .from('profiles')
                            .update({
                                full_name: name,
                                gender: gender,
                                avatar_id: avatarId,
                                bio: bio
                            })
                            .eq('id', session.user.id);

                        if (error) throw error;

                        App.ui.showToast("Profile updated successfully!", "success");
                        
                        // Reload state to synchronize Name & Avatar UI
                        if (App.license && typeof App.license.loadState === 'function') {
                            await App.license.loadState();
                        }
                        
                        // Rerender profile modal to show updated avatar immediately
                        App.ui.showLicenseModal();
                    } catch (e) {
                        console.error(e);
                        App.ui.showToast(e.message || "Failed to update profile.", "error");
                    }
                },

                showQuizResultModal(score, total) {
                    // RATIONALE: User requested "aggressive" and "catchy" feedback to push them harder.
                    let feedbackQuote = "";
                    const percentage = (score / total) * 100;
                    if (percentage === 100) feedbackQuote = "King mode Activated! You are incredible.";
                    else if (percentage > 80) feedbackQuote = "Surgical Precision. Nearly Flawless.";
                    else if (percentage > 65) feedbackQuote = "Solid Grind. But you can do better.";
                    else if (percentage > 45) feedbackQuote = "Going Okay, you need to Push Harder .";
                    else if (percentage > 25) feedbackQuote = "Too low. Time to Bleed or Die.";
                    else feedbackQuote = "Poor, Ask yourself why you Started?.";

                    // RATIONALE: The Power Quote is now fetched as an *additional* message.
                    const powerQuote = App.util.getPowerQuote();

                    const modalHTML = `
                    <div class="modal-backdrop" onclick="App.ui.closeModal()">
                        <div class="modal-content ui-card quiz-result-card" onclick="event.stopPropagation()">
                            <h3>Quiz Complete!</h3>
                            <div class="quiz-score-display">${score.toFixed(1)} / ${total}</div>
                            <p class="quiz-motivational-quote">"${feedbackQuote}"</p>

                            <p class="power-quote-gradient" style="font-size: 1.2rem; margin-top: 1rem;">
                                &ldquo;${powerQuote}&rdquo;
                            </p>

                            <div class="modal-buttons" style="margin-top: 1.5rem;">
                                <button class="btn btn-primary" onclick="App.ui.closeModal()">Awesome!</button>
                            </div>
                        </div>
                    </div>`;
                    document.getElementById('modal-container').innerHTML = modalHTML;
                },

                showCustomModal({ title, message, buttons = [] }) {
                    const modalContainer = document.getElementById('modal-container');
                    const buttonsHTML = buttons.map((btn, index) =>
                        `<button class="btn ${btn.className || 'btn-secondary'}" id="custom-modal-btn-${index}">${btn.text}</button>`
                    ).join('');

                    modalContainer.innerHTML = `
                    <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                        <div class="modal-content ui-card">
                            <h3>${title}</h3>
                            <div>${message}</div>
                            <div class="modal-buttons">${buttonsHTML}</div>
                        </div>
                    </div>`;

                    buttons.forEach((btn, index) => {
                        document.getElementById(`custom-modal-btn-${index}`).onclick = () => {
                            if (btn.onClick) btn.onClick();
                        };
                    });
                },

                showConfirmationModal({ title, message, onConfirm, confirmText = 'Confirm', showCancel = true, modalClass = '', onCancel }) {
                    const modalContainer = document.getElementById('modal-container');
                    modalContainer.innerHTML = `
                    <div class="modal-backdrop">
                        <div class="modal-content ui-card ${modalClass}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                            <h3 id="modal-title">${title}</h3>
                            <div>${message}</div>
                            <div class="modal-buttons">
                                ${showCancel ? `<button class="btn btn-secondary" id="modal-cancel">Cancel</button>` : ''}
                                <button class="btn ${confirmText === 'Delete' || confirmText === 'Reset' || confirmText === 'Overwrite' || confirmText === 'Remove' ? 'btn-danger' : 'btn-primary'}" id="modal-confirm">${confirmText}</button>
                            </div>
                        </div>
                    </div>`;
                    const modal = modalContainer.querySelector('.modal-content');
                    const backdrop = modalContainer.querySelector('.modal-backdrop');
                    const confirmBtn = modalContainer.querySelector('#modal-confirm');
                    const cancelBtn = modalContainer.querySelector('#modal-cancel');

                    const closeModalAction = () => { if (onCancel) onCancel(); this.closeModal(); };

                    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) { closeModalAction(); } });
                    confirmBtn.addEventListener('click', () => { if (onConfirm) onConfirm(); this.closeModal(); });

                    if (cancelBtn) cancelBtn.addEventListener('click', closeModalAction);
                    App.util.trapFocus(modal);
                },

                showKashSuiteModal() {
                    const modalContainer = document.getElementById('modal-container');
                    modalContainer.innerHTML = `
                    <div class="modal-backdrop">
                        <div class="modal-content ui-card explore-suite-modal" role="dialog" aria-modal="true" aria-labelledby="suite-modal-title">
                            <button id="close-suite-modal" class="suite-close-btn" aria-label="Close modal" title="Close">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            
                            <div class="suite-header">
                                <div class="suite-brand-pill">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    Kash Ecosystem
                                </div>
                                <h3 id="suite-modal-title" class="suite-title">Explore <span>Kash Suite</span></h3>
                                <p class="suite-subtitle">Handcrafted study &amp; productivity tools designed to supercharge your learning flow.</p>
                            </div>
                            
                            <!-- Join Community Button -->
                            <a href="https://t.me/civilskash" target="_blank" rel="noopener noreferrer" class="suite-community-btn" title="Join our Telegram Community">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                <span>Join our Community</span>
                            </a>
                            
                            <!-- 2x2 Apps Grid -->
                            <div class="suite-apps-grid">
                                <!-- 1. MCQ Kash -->
                                <a href="https://civilskash.in/mcq" target="_blank" rel="noopener noreferrer" class="suite-app-card" style="--card-accent: #10b981;">
                                    <div class="suite-app-top">
                                        <div class="suite-app-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M9 11l3 3L22 4"></path>
                                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                            </svg>
                                        </div>
                                        <span class="suite-app-badge">Realtime</span>
                                    </div>
                                    <div class="suite-app-content">
                                        <div class="suite-app-title">
                                            <span>MCQ Kash</span>
                                            <i class="fa-solid fa-arrow-up-right-from-square suite-app-arrow"></i>
                                        </div>
                                        <div class="suite-app-desc">India's premier MCQ app with live battles &amp; smart spaced repetition</div>
                                    </div>
                                </a>
                                
                                <!-- 2. Focus Timer -->
                                <a href="https://focus.notekash.com" target="_blank" rel="noopener noreferrer" class="suite-app-card" style="--card-accent: #f43f5e;">
                                    <div class="suite-app-top">
                                        <div class="suite-app-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                        </div>
                                        <span class="suite-app-badge">Deep Work</span>
                                    </div>
                                    <div class="suite-app-content">
                                        <div class="suite-app-title">
                                            <span>Focus Timer</span>
                                            <i class="fa-solid fa-arrow-up-right-from-square suite-app-arrow"></i>
                                        </div>
                                        <div class="suite-app-desc">Aesthetic Pomodoro timer &amp; task manager to lock in and get in the zone</div>
                                    </div>
                                </a>
                                
                                <!-- 3. Notepad Writer -->
                                <a href="https://notepad.notekash.com" target="_blank" rel="noopener noreferrer" class="suite-app-card" style="--card-accent: #06b6d4;">
                                    <div class="suite-app-top">
                                        <div class="suite-app-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 20h9"></path>
                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                            </svg>
                                        </div>
                                        <span class="suite-app-badge">Markdown</span>
                                    </div>
                                    <div class="suite-app-content">
                                        <div class="suite-app-title">
                                            <span>Notepad Writer</span>
                                            <i class="fa-solid fa-arrow-up-right-from-square suite-app-arrow"></i>
                                        </div>
                                        <div class="suite-app-desc">Distraction-free quick scratchpad &amp; markdown writer for thoughts</div>
                                    </div>
                                </a>
                                
                                <!-- 4. Typing Game -->
                                <a href="https://typing.civilskash.in" target="_blank" rel="noopener noreferrer" class="suite-app-card" style="--card-accent: #8b5cf6;">
                                    <div class="suite-app-top">
                                        <div class="suite-app-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                                                <line x1="6" y1="8" x2="6.01" y2="8"></line>
                                                <line x1="10" y1="8" x2="10.01" y2="8"></line>
                                                <line x1="14" y1="8" x2="14.01" y2="8"></line>
                                                <line x1="18" y1="8" x2="18.01" y2="8"></line>
                                                <line x1="6" y1="12" x2="6.01" y2="12"></line>
                                                <line x1="18" y1="12" x2="18.01" y2="12"></line>
                                                <line x1="7" y1="16" x2="17" y2="16"></line>
                                                <line x1="10" y1="12" x2="14" y2="12"></line>
                                            </svg>
                                        </div>
                                        <span class="suite-app-badge">Speedrun</span>
                                    </div>
                                    <div class="suite-app-content">
                                        <div class="suite-app-title">
                                            <span>Typing Game</span>
                                            <i class="fa-solid fa-arrow-up-right-from-square suite-app-arrow"></i>
                                        </div>
                                        <div class="suite-app-desc">Speed run typing practice to boost your typing velocity &amp; accuracy</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>`;
                    
                    const modal = modalContainer.querySelector('.modal-content');
                    const backdrop = modalContainer.querySelector('.modal-backdrop');
                    const closeBtn = modalContainer.querySelector('#close-suite-modal');
                    
                    const closeAction = () => { this.closeModal(); };
                    
                    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeAction(); });
                    closeBtn.addEventListener('click', closeAction);
                    
                    App.util.trapFocus(modal);
                },

                showNoteKashExportModal() {
                    const article = App.storage.getArticle(App.state.activeArticleId);
                    if (!article) return App.ui.showToast('Article not found.', { type: 'error' });

                    if (article.preventReExport) {
                        return App.ui.showToast('Creator has disabled export of shared notes.', { type: 'warning' });
                    }

                    const modalContent = `
                        <div style="margin-bottom: 1.5rem; text-align: center;">
                            <div style="font-size: 3rem; color: var(--primary-color); margin-bottom: 0.5rem;"><i class="fa-solid fa-share-nodes"></i></div>
                            <h3 style="margin: 0; font-family: var(--font-display); color: var(--text-primary); font-size: 1.4em;">Share .notekash File</h3>
                            <p style="margin: 5px 0 0 0; color: var(--text-secondary); font-size: 0.9em;">Configure how recipients can interact with your note.</p>
                        </div>
                        <div style="margin-bottom: 1rem; padding: 15px; background: var(--bg-tertiary); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 15px; transition: all 0.2s ease;">
                            <label style="display: flex; align-items: flex-start; gap: 15px; cursor: pointer; width: 100%;">
                                <div style="flex-shrink: 0; padding-top: 2px;">
                                    <input type="checkbox" id="export-readonly-cb" style="width: 20px; height: 20px; accent-color: var(--primary-color); cursor: pointer;" ${article.isReadOnly ? 'checked disabled' : ''}>
                                </div>
                                <div>
                                    <strong style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 1.05em; color: var(--text-primary);">
                                        <i class="fa-solid fa-eye" style="color: var(--primary-color);"></i> Read Only Mode
                                    </strong>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); line-height: 1.5;">
                                        Recipients will only be able to view this note. Write mode and editing will be permanently disabled for them.
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div style="margin-bottom: 1rem; padding: 15px; background: var(--bg-tertiary); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 15px; transition: all 0.2s ease;">
                            <label style="display: flex; align-items: flex-start; gap: 15px; cursor: pointer; width: 100%;">
                                <div style="flex-shrink: 0; padding-top: 2px;">
                                    <input type="checkbox" id="export-preventreexport-cb" style="width: 20px; height: 20px; accent-color: var(--primary-color); cursor: pointer;" ${article.preventReExport ? 'checked disabled' : ''}>
                                </div>
                                <div>
                                    <strong style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 1.05em; color: var(--text-primary);">
                                        <i class="fa-solid fa-lock" style="color: var(--primary-color);"></i> Restrict Re-Sharing
                                    </strong>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); line-height: 1.5;">
                                        Recipients cannot export this note as a .notekash, HTML, PDF file or share it. Note will remain private to them.
                                    </div>
                                </div>
                            </label>
                        </div>
                    `;

                    this.showConfirmationModal({
                        title: ' ',
                        message: modalContent,
                        confirmText: '<i class="fa-solid fa-paper-plane" style="margin-right: 5px;"></i> Share Note',
                        onConfirm: () => {
                            const isReadOnly = document.getElementById('export-readonly-cb').checked;
                            const preventReExport = document.getElementById('export-preventreexport-cb').checked;
                            App.services.export.exportAsNoteKashFile({ isReadOnly, preventReExport });
                        }
                    });
                },

                showTemplateHubModal() {
                    const preDefinedTemplates = [
                        { id: 'cornell-notes', icon: '🎓', title: 'Cornell Notes 2.0', desc: 'A robust system for structured note-taking and review.' },
                        { id: 'vocab-card', icon: '📚', title: 'Vocabulary Card', desc: 'Build your lexicon with structured vocabulary cards.' },
                        { id: 'upsc-analysis', icon: '🗞', title: 'UPSC Analysis', desc: 'For Current Affairs & syllabus linkage.' },
                        { id: 'meeting-agenda', icon: '🤝', title: 'Meeting Agenda', desc: 'A clean, professional structure for any meeting.' },
                        { id: 'daily-planner', icon: '📅', title: 'Daily Planner', desc: 'Organize your day with tasks and priorities.' },
                        { id: 'smart-goals', icon: '🎯', title: 'SMART Goals', desc: 'Define Specific, Measurable, Relevant goals.' },
                        { id: 'kwl-chart', icon: '🧠', title: 'KWL Chart', desc: 'Track what you Know, Want, and Learned.' },
                        { id: 'pros-cons', icon: '‼️', title: 'Pros & Cons', desc: 'A balanced matrix for informed decisions.' },
                        { id: 'swot-analysis', icon: '⚖️', title: 'SWOT Analysis', desc: 'Analyze Strengths, Weaknesses, Opportunities, Threats.' },
                        { id: 'content-planner', icon: '🚀', title: 'Content Planner', desc: 'A simple Kanban board to track your ideas.' }
                    ];

                    const cardsHTML = preDefinedTemplates.map(t => `
                    <div class="template-hub-card" onclick="App.events.ai.executeKashTemplate('${t.id}')">
                        <div class="template-card-icon">${t.icon}</div>
                        <div class="template-card-text">
                            <h3 class="template-card-title">${t.title}</h3>
                            <p class="template-card-desc">${t.desc}</p>
                        </div>
                    </div>
                `).join('');

                    const isPremium = App.license.isPremium();
                    const premiumLockClass = isPremium ? '' : 'premium-feature-locked';

                    const modalHTML = `
                
                <div class="modal-backdrop" onclick="if(event.target === this) App.ui.closeModal()">
                    <div class="modal-content ui-card" style="max-width: 900px;" onclick="event.stopPropagation()">
                        <button class="modal-close-btn" onclick="App.ui.closeModal()">&times;</button>
                        <div style="text-align: center;">
                            <h3 class="witty-gradient-text" style="font-size: 1.8rem;">Template Hub</h3>
                            <p style="color: var(--text-secondary);">Choose a pre-made template or ask AI to create a custom one for you.</p>
                        </div>
                        
                        <div class="settings-section ${premiumLockClass}">
                            <h4><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary-color);"></i> Create with AI</h4>
                            <div style="display: flex; gap: 0.75rem;">
                                <input type="text" id="custom-template-prompt" class="text-input" placeholder="e.g., a simple weekly meal planner...">
                                <button class="btn btn-primary" id="generate-custom-template-btn">Generate</button>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4><i class="fa-solid fa-star" style="color: var(--primary-color);"></i> Curated Templates</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-top: 1rem;">
                                ${cardsHTML}
                            </div>
                        </div>
                    </div>
                </div>`;

                    document.getElementById('modal-container').innerHTML = modalHTML;

                    const customInput = document.getElementById('custom-template-prompt');
                    const generateBtn = document.getElementById('generate-custom-template-btn');

                    const generateAction = () => {
                        const prompt = customInput.value.trim();
                        if (prompt) {
                            if (isPremium) {
                                App.events.ai.executeKashTemplate(prompt);
                            } else {
                                App.ui.showAscensionModal();
                            }
                        } else {
                            App.ui.showToast("Please describe the template you want.", "warning");
                        }
                    };

                    generateBtn.addEventListener('click', generateAction);
                    customInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            generateAction();
                        }
                    });
                },

                toggleProfileNotification() {
                    const notificationCard = document.getElementById('profile-notification-card');
                    const profileBadge = document.getElementById('profile-badge');

                    if (!notificationCard || !profileBadge) return;

                    if (notificationCard.style.display === 'flex') {
                        this.closeProfileNotification();
                    } else {
                        this.renderProfileNotification();
                        notificationCard.style.display = 'flex';
                        profileBadge.classList.add('active'); // Indicate active state
                        // Add a global listener to close when clicking outside
                        setTimeout(() => { // Small delay to prevent immediate close if click initiated toggle
                            document.addEventListener('click', this.closeProfileNotificationOutside, { once: true });
                        }, 100);
                    }
                },

                closeProfileNotification() {
                    const notificationCard = document.getElementById('profile-notification-card');
                    const profileBadge = document.getElementById('profile-badge');
                    if (notificationCard) {
                        notificationCard.style.display = 'none';
                    }
                    if (profileBadge) {
                        profileBadge.classList.remove('active');
                    }
                    document.removeEventListener('click', App.ui.closeProfileNotificationOutside);
                },

                closeProfileNotificationOutside(event) {
                    const profileHub = document.getElementById('profile-hub');
                    if (profileHub && !profileHub.contains(event.target)) {
                        App.ui.closeProfileNotification();
                    } else {
                        // Re-add listener if click was inside profile hub but not on card itself
                        document.addEventListener('click', App.ui.closeProfileNotificationOutside, { once: true });
                    }
                },

                renderProfileNotification() {
                    const tierName = App.license.state.tier || 'Spark';
                    const isPremium = App.license.isPremium();
                    const userName = App.license.state.userName || 'Valued User';

                    const notificationBadgeIcon = document.getElementById('notification-badge-icon');
                    const notificationTitle = document.getElementById('notification-title');
                    const notificationMessage = document.getElementById('notification-message');
                    const notificationLink = document.getElementById('notification-link');

                    const powerQuote = App.util.getPowerQuote();

                    if (notificationBadgeIcon) {
                        notificationBadgeIcon.innerHTML = App.util.getTierBadgeHTML(tierName);
                        // ENABLE DRAG INTERACTION
                        this.enableBadgeDrag(notificationBadgeIcon);
                    }

                    // Always show the Power Quote in the main body
                    if (notificationMessage) {
                        notificationMessage.innerHTML = `&ldquo;${powerQuote}&rdquo;`;
                        notificationMessage.style.display = 'block';
                    }

                    // Hide the link section completely (Developer Upsell is gone)
                    if (notificationLink) {
                        notificationLink.style.display = 'none';
                    }

                    if (isPremium) {
                        if (notificationTitle) {
                            notificationTitle.innerHTML = App.util.getAppreciationMessage(userName, tierName);
                        }
                    } else {
                        if (notificationTitle) {
                            notificationTitle.innerHTML = `You are in the <strong>Spark League</strong>`;
                        }
                    }
                },

                enableBadgeDrag(element) {
                    if (!element || element.dataset.dragEnabled) return;
                    element.dataset.dragEnabled = 'true';

                    let isDragging = false;
                    let isDetached = element.dataset.detached === 'true';
                    let startX, startY;
                    let hasMoved = false;
                    let placeholder = document.getElementById('notification-badge-placeholder');

                    // Animation defaults
                    element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';

                    // --- FUN: Spark Animation ---
                    const triggerSpark = () => {
                        const colors = ['#FFD700', '#FFA500', '#FF4500', '#00BFFF', '#ADFF2F', '#FF69B4', '#ffffff', '#ffd700'];
                        const rect = element.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        // Increased particle count for "Grand" effect
                        for (let i = 0; i < 40; i++) {
                            const spark = document.createElement('div');
                            spark.className = 'spark-particle';
                            spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

                            // Slight size variation
                            const size = 6 + Math.random() * 6;
                            spark.style.width = size + 'px';
                            spark.style.height = size + 'px';

                            spark.style.left = centerX + 'px';
                            spark.style.top = centerY + 'px';
                            document.body.appendChild(spark);

                            // Random explosive direction
                            const angle = Math.random() * Math.PI * 2;
                            // Larger velocity range
                            const velocity = 80 + Math.random() * 120;
                            const tx = Math.cos(angle) * velocity;
                            const ty = Math.sin(angle) * velocity;

                            const anim = spark.animate([
                                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
                            ], {
                                // Slower duration
                                duration: 1000 + Math.random() * 500,
                                easing: 'cubic-bezier(0, .9, .57, 1)'
                            });
                            anim.onfinish = () => spark.remove();
                        }
                    };

                    const detach = (rect) => {
                        if (isDetached) return;
                        isDetached = true;
                        element.dataset.detached = 'true';

                        // Create placeholder if not exists
                        const parent = element.parentNode;
                        if (parent) {
                            placeholder = document.createElement('div');
                            placeholder.id = 'notification-badge-placeholder';
                            placeholder.style.width = '48px';
                            placeholder.style.height = '48px';
                            placeholder.style.flexShrink = '0';
                            parent.insertBefore(placeholder, element);
                        }

                        // Move to body
                        document.body.appendChild(element);

                        // Set fixed position at current visual location
                        element.style.position = 'fixed';
                        element.style.left = rect.left + 'px';
                        element.style.top = rect.top + 'px';
                        element.style.zIndex = '2147483647'; // Maximum Z-Index to stay on top of EVERYTHING
                        element.style.width = '48px';
                        element.style.height = '48px';
                        element.style.margin = '0';
                    };

                    const resetDocking = () => {
                        if (!isDetached) return;

                        // Find placeholder again (it might be in the hidden card)
                        const currentPlaceholder = document.getElementById('notification-badge-placeholder');
                        if (currentPlaceholder && currentPlaceholder.parentNode) {
                            currentPlaceholder.parentNode.insertBefore(element, currentPlaceholder);
                            currentPlaceholder.remove();
                        } else {
                            // Fallback if placeholder is gone
                            const header = document.querySelector('#profile-notification-card .notification-header');
                            if (header) header.prepend(element);
                        }

                        element.style.position = '';
                        element.style.left = '';
                        element.style.top = '';
                        element.style.zIndex = '';
                        element.style.margin = '';
                        element.dataset.detached = 'false';
                        isDetached = false;
                        placeholder = null; // Reset ref

                        // Reset animation
                        element.animate([
                            { transform: 'scale(1.2)' },
                            { transform: 'scale(1.0)' }
                        ], { duration: 300, easing: 'ease-out' });
                    };

                    // --- SMOOTH RETURN ANIMATION ---
                    const animateBackToHome = () => {
                        if (!isDetached) return;

                        // Locate Target
                        let targetRect;
                        const currentPlaceholder = document.getElementById('notification-badge-placeholder');
                        if (currentPlaceholder) {
                            targetRect = currentPlaceholder.getBoundingClientRect();
                        } else {
                            const header = document.querySelector('#profile-notification-card .notification-header');
                            if (header) targetRect = header.getBoundingClientRect();
                        }

                        if (!targetRect) { resetDocking(); return; }

                        const startRect = element.getBoundingClientRect();
                        const deltaX = targetRect.left - startRect.left;
                        const deltaY = targetRect.top - startRect.top;

                        // Animate from current fixed pos to delta
                        const anim = element.animate([
                            { transform: 'translate(0, 0) scale(1)' },
                            { transform: `translate(${deltaX}px, ${deltaY}px) scale(1)` }
                        ], {
                            duration: 1200, // Slower for visibility
                            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Springy
                        });

                        anim.onfinish = () => {
                            resetDocking();
                        };
                    };

                    // Double click to reset
                    element.addEventListener('dblclick', (e) => {
                        e.stopPropagation(); // Prevent closing card
                        animateBackToHome();
                    });

                    element.addEventListener('mousedown', (e) => {
                        // Left click only
                        if (e.button !== 0) return;

                        // Prevent default interactions
                        e.preventDefault();
                        e.stopPropagation();

                        const rect = element.getBoundingClientRect();
                        startX = e.clientX;
                        startY = e.clientY;
                        hasMoved = false; // Reset
                        const offsetX = e.clientX - rect.left;
                        const offsetY = e.clientY - rect.top;

                        // Detach immediately on interaction if not already detached
                        if (!isDetached) {
                            detach(rect);
                        }

                        isDragging = true;
                        element.style.cursor = 'grabbing';

                        // Disable transition during drag for responsiveness
                        element.style.transition = 'none';

                        const onMouseMove = (moveEvent) => {
                            if (!isDragging) return;
                            moveEvent.preventDefault();

                            // Check movement threshold
                            if (!hasMoved && (Math.abs(moveEvent.clientX - startX) > 4 || Math.abs(moveEvent.clientY - startY) > 4)) {
                                hasMoved = true;
                            }

                            // Calculate raw position
                            let x = moveEvent.clientX - offsetX;
                            let y = moveEvent.clientY - offsetY;

                            // BOUNDARY CHECKS
                            // Ensure it never goes off-screen (with 5px buffer)
                            const maxX = window.innerWidth - element.offsetWidth - 5;
                            const maxY = window.innerHeight - element.offsetHeight - 5;
                            const minX = 5;
                            const minY = 5;

                            x = Math.max(minX, Math.min(x, maxX));
                            y = Math.max(minY, Math.min(y, maxY));

                            element.style.left = x + 'px';
                            element.style.top = y + 'px';
                        };

                        const onMouseUp = () => {
                            isDragging = false;
                            element.style.cursor = 'grab';
                            // Restore transition for hover effects
                            element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';

                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);

                            // IF CLICKED (Not Dragged) -> SPARK
                            if (!hasMoved) {
                                triggerSpark();
                            }
                        };

                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                    });

                    // Safety: Ensure it stays on screen if window resizes
                    window.addEventListener('resize', () => {
                        if (!isDetached) return;
                        const rect = element.getBoundingClientRect();
                        const maxX = window.innerWidth - element.offsetWidth - 5;
                        const maxY = window.innerHeight - element.offsetHeight - 5;

                        if (rect.left > maxX) element.style.left = maxX + 'px';
                        if (rect.top > maxY) element.style.top = maxY + 'px';
                    });
                },

                closeModal() {
                    Object.values(App.state.chartInstances).forEach(chart => chart?.destroy());
                    App.state.chartInstances = {};
                    document.removeEventListener('keydown', App.events.handleProductivityHubKeyDown, true);
                    if (App.ui.aiMagicModal.state.isOpen) {
                        App.ui.aiMagicModal.close();
                    }

                    document.getElementById('modal-container').innerHTML = '';
                },

                updateTheLine(progress) {
                    const line = document.getElementById('the-line');
                    if (line) {
                        line.style.transform = `scaleX(${progress})`;
                    }
                },

                async showLibraryLoadingScreenAndLoadData() {
                    await App.loadInitialData();
                    App.router.navigateTo('library');
                },


                async renderChartOnCanvas(canvas) {
                    if (!canvas || !canvas.dataset.chartConfig) return;

                    if (typeof Chart === 'undefined' && App.loadLibrary) {
                        try {
                            await App.loadLibrary('chartjs');
                        } catch (e) {
                            console.error('Failed to lazy load ChartJS for renderChartOnCanvas:', e);
                        }
                    }

                    try {
                        // 1. Get the raw config string and parse safely (handling possible entity escaping)
                        let rawConfig = canvas.dataset.chartConfig;
                        if (typeof rawConfig === 'string' && (rawConfig.includes('&quot;') || rawConfig.includes('&#39;'))) {
                            const txt = document.createElement('textarea');
                            txt.innerHTML = rawConfig;
                            rawConfig = txt.value;
                        }
                        let config = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;

                        // 2. Schema normalizer for 3rd-party LLMs or flat configs
                        if (!config || typeof config !== 'object') return;
                        if (!config.type) config.type = 'bar';

                        // Support flat format: { labels: [...], values: [...] } or { labels: [...], data: [...] }
                        if (!config.data) {
                            config.data = {
                                labels: config.labels || [],
                                datasets: [{
                                    data: config.values || config.dataPoints || []
                                }]
                            };
                        } else if (Array.isArray(config.data)) {
                            config.data = {
                                labels: config.labels || [],
                                datasets: [{ data: config.data }]
                            };
                        }

                        if (!Array.isArray(config.data.datasets) || config.data.datasets.length === 0) {
                            config.data.datasets = [{ data: [] }];
                        }

                        // Ensure numeric values in all datasets
                        config.data.datasets.forEach(ds => {
                            if (Array.isArray(ds.data)) {
                                ds.data = ds.data.map(v => typeof v === 'number' ? v : (parseFloat(v) || 0));
                            } else {
                                ds.data = [];
                            }
                        });

                        // 3. Get fresh styling information based on the CURRENT theme.
                        const themeColors = App.util.getChartColors();
                        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#333';
                        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e5e7eb';
                        const secondaryBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary') || '#ffffff';

                        // 4. Dynamically apply all styling to datasets in memory.
                        config.data.datasets.forEach((dataset, idx) => {
                            const primaryColor = themeColors[idx % themeColors.length] || '#0d9488';
                            const primaryRgb = App.util.colorToRgb(primaryColor);

                            if (config.type === 'line') {
                                dataset.borderColor = dataset.borderColor || primaryColor;
                                dataset.backgroundColor = dataset.backgroundColor || (primaryRgb ? `rgba(${primaryRgb.join(',')}, 0.2)` : '#0d948833');
                                dataset.fill = dataset.fill !== undefined ? dataset.fill : true;
                                dataset.tension = dataset.tension !== undefined ? dataset.tension : 0.4;
                                dataset.pointBackgroundColor = primaryColor;
                                dataset.pointBorderColor = secondaryBg;
                                dataset.pointBorderWidth = 2;
                            } else if (config.type === 'doughnut' || config.type === 'pie') {
                                dataset.backgroundColor = dataset.backgroundColor || themeColors;
                                dataset.borderColor = secondaryBg;
                                dataset.borderWidth = 3;
                            } else {
                                // Bar charts
                                dataset.backgroundColor = dataset.backgroundColor || (config.data.datasets.length > 1 ? primaryColor : themeColors);
                                dataset.borderColor = secondaryBg;
                                dataset.borderWidth = 1;
                                dataset.borderRadius = 6;
                            }
                        });

                        config.options = {
                            ...config.options, // Keep structural options like indexAxis
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: config.type === 'doughnut' || config.type === 'pie' || config.data.datasets.length > 1,
                                    position: 'bottom',
                                    labels: { color: textColor, boxWidth: 12, padding: 12 }
                                },
                                ...(config.options?.plugins || {})
                            },
                            scales: (config.type !== 'doughnut' && config.type !== 'pie') ? {
                                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                                y: { ticks: { color: textColor }, grid: { color: gridColor } }
                            } : {}
                        };

                        // 5. If a chart instance already exists on this canvas, destroy it first.
                        if (typeof Chart !== 'undefined' && Chart.getChart(canvas)) {
                            Chart.getChart(canvas).destroy();
                        }

                        // 6. Create the new Chart.js instance with the freshly styled config.
                        App.offline.safeChart(canvas.getContext('2d'), config);

                    } catch (e) {
                        console.error("Failed to render chart from data attribute:", e);
                        if (canvas && canvas.parentElement && !canvas.parentElement.querySelector('.chart-error-fallback')) {
                            const errNotice = document.createElement('p');
                            errNotice.className = 'chart-error-fallback';
                            errNotice.style.cssText = 'color:var(--text-secondary);font-size:0.9em;font-style:italic;margin:0.5em 0;';
                            errNotice.textContent = '[Chart format error: could not render]';
                            canvas.parentElement.appendChild(errNotice);
                        }
                    }
                },


                updateStudyProgressUI() {
                    const s = App.state.studySession;
                    const progressBar = document.getElementById('study-progress-bar');
                    let progress = 0;
                    if (s.isActive && s.cards.length > 0) {
                        progress = (s.currentIndex + 1) / s.cards.length;
                    } else {
                        progress = 1;
                    }

                    this.updateTheLine(progress);
                    if (progressBar) {
                        progressBar.value = s.currentIndex + 1;
                        progressBar.max = s.cards.length;
                    }
                },

                _progressTimer: null,
                _progressBarEl: null,

                showViewTransition() {
                    let overlay = document.getElementById('nk-view-transition-overlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'nk-view-transition-overlay';
                        overlay.setAttribute('aria-hidden', 'true');
                        overlay.innerHTML = '<div class="nk-transition-spinner"></div>';
                        document.body.appendChild(overlay);
                    }
                    overlay.classList.add('transition-active');
                },

                hideViewTransition() {
                    const overlay = document.getElementById('nk-view-transition-overlay');
                    if (overlay) {
                        overlay.classList.remove('transition-active');
                    }
                },

                _initProgressBar() {
                    if (this._progressBarEl) return;
                    
                    const el = document.createElement('div');
                    el.id = 'nk-global-progress-bar';
                    Object.assign(el.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        height: '3px',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #6366f1 100%)',
                        width: '0%',
                        zIndex: '10000000',
                        transition: 'width 0.3s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.4s ease',
                        opacity: '0',
                        pointerEvents: 'none',
                        boxShadow: '0 1px 10px rgba(59, 130, 246, 0.5)'
                    });
                    document.body.appendChild(el);
                    this._progressBarEl = el;
                },

                startLoadingProgress() {
                    this._initProgressBar();
                    if (this._progressTimer) clearInterval(this._progressTimer);
                    
                    const el = this._progressBarEl;
                    el.style.opacity = '1';
                    el.style.width = '0%';
                    
                    let percent = 0;
                    this._progressTimer = setInterval(() => {
                        if (percent < 50) {
                            percent += Math.random() * 15 + 5;
                        } else if (percent < 85) {
                            percent += Math.random() * 3 + 1;
                        } else if (percent < 95) {
                            percent += 0.5;
                        }
                        el.style.width = `${Math.min(percent, 98)}%`;
                    }, 120);
                },

                stopLoadingProgress() {
                    if (this._progressTimer) {
                        clearInterval(this._progressTimer);
                        this._progressTimer = null;
                    }
                    if (this._progressBarEl) {
                        const el = this._progressBarEl;
                        el.style.width = '100%';
                        setTimeout(() => {
                            el.style.opacity = '0';
                            setTimeout(() => {
                                el.style.width = '0%';
                            }, 400);
                        }, 200);
                    }
                }
};
