export const globalSearch = {
                fuse: null,
                searchableData: [],
                selectedIndex: -1,
                results: [],
                isInitialized: false,

                els: {
                    overlay: null, modal: null, input: null,
                    resultsContainer: null, searchBtn: null,
                },

                commandRegistry: [
                    { name: 'note', keywords: ['note', 'n'] }
                ],

                init() {
                    this.els.overlay = document.getElementById('global-search-overlay');
                    this.els.modal = document.getElementById('global-search-modal');
                    this.els.input = document.getElementById('global-search-input');
                    this.els.resultsContainer = document.getElementById('global-search-results');
                    this.els.searchBtn = document.getElementById('global-search-btn');

                    this.els.searchBtn.addEventListener('click', () => this.openSearch());
                    this.els.overlay.addEventListener('click', (e) => { if (e.target === this.els.overlay) this.closeSearch(); });
                    this.els.input.addEventListener('input', () => this.handleInput());
                    document.addEventListener('keydown', (e) => this._handleKeyDown(e));
                },

                openSearch() {
                    // 1. VISUAL FEEDBACK: Show UI IMMEDIATELY
                    this.els.overlay.classList.remove('hidden');
                    this.els.input.value = '';
                    this.els.resultsContainer.innerHTML = '';
                    this.els.input.style.height = 'auto';
                    this.els.input.focus();

                    // Show "Indexing" toast
                    const toast = App.ui.showToast('Indexing...', { type: 'searching-process', duration: 0, id: 'indexing-feedback-toast' });

                    // Force the toast to show immediately (bypass default 100ms animation delay)
                    requestAnimationFrame(() => {
                        if (toast) toast.classList.add('show');
                    });

                    // 2. Defer heavy indexing to allow DOM to paint and toast to appear
                    setTimeout(() => {
                        this.buildIndex();

                        // Hide the toast when done
                        const toastEl = document.getElementById('indexing-feedback-toast');
                        if (toastEl && App.ui.hideToast) {
                            App.ui.hideToast(toastEl);
                        } else if (toastEl) {
                            toastEl.classList.remove('show');
                            setTimeout(() => toastEl.remove(), 300);
                        }
                    }, 200);
                },

                closeSearch() {
                    this.els.overlay.classList.add('hidden');
                    this.els.modal.classList.remove('expanded-input');
                },

                handleInput() {
                    this.selectedIndex = -1;
                    const query = this.els.input.value;
                    this.els.input.classList.toggle('expanded', query.includes('>>'));

                    const lowerQuery = query.trim().toLowerCase();

                    // NEW: Handle the "kashask:" command hint
                    if (lowerQuery.startsWith('kashask')) {
                        let hintItem;
                        if (lowerQuery === 'kashask') {
                            hintItem = {
                                type: 'suggestion',
                                displayText: 'Add a colon and type your question...',
                                categoryText: 'e.g., kashask: who invented the lightbulb?'
                            };
                        } else if (lowerQuery === 'kashask:') {
                            hintItem = {
                                type: 'suggestion',
                                displayText: 'Type your question for the AI...',
                                categoryText: 'Press Enter to ask'
                            };
                        } else if (lowerQuery.startsWith('kashask:')) {
                            const promptText = query.substring(8).trim();
                            hintItem = {
                                type: 'suggestion',
                                displayText: `Ask AI: "${promptText}"`,
                                categoryText: 'Ready to ask...'
                            };
                        }
                        if (hintItem) {
                            this.results = [hintItem];
                            this._renderResults(this.results);
                            return;
                        }
                    }

                    // 1. Handle Navigation Commands (%)
                    if (lowerQuery.startsWith('%')) {
                        const navTerm = lowerQuery.substring(1);
                        const navCommands = [
                            { id: 'library', name: 'Go to Library', icon: '📚' },
                            { id: 'all-snippets', name: 'View All Snippets', icon: '🌍' },
                            { id: 'new', name: 'Create New Article', icon: '📝' },
                            { id: 'study', name: 'Start Study Session', icon: '🧑‍🎓' },
                            { id: 'quiz', name: 'Start a Quiz', icon: '❓' },
                            { id: 'visual-map', name: 'Go to Visual Map', icon: '🕸️' },
                            { id: 'mindmap', name: 'Go to Mind Map', icon: '🧠' },
                            { id: 'flashcard', name: 'Go to Flashcards', icon: '📇' },
                            { id: 'stats-dashboard', name: 'Go to Stats', icon: '📊' },
                            { id: 'tags', name: 'Go to Tags View', icon: '🏷️' },
                            { id: 'settings', name: 'Go to Settings', icon: '⚙️' }
                        ];

                        const categoryCommands = App.config.categories.map(cat => ({
                            id: cat,
                            name: `Go to Category: ${App.util.getCategoryDisplayName(cat)}`,
                            icon: '📂',
                            isCategory: true
                        }));

                        const flashcardCategoryCommands = App.config.categories.map(cat => ({
                            id: `flashcard-${cat.toLowerCase()}`,
                            name: `Go to Flashcard Deck: ${App.util.getCategoryDisplayName(cat)}`,
                            icon: '📇',
                            isFlashcardCategory: true,
                            category: cat
                        }));

                        const allCommands = [...navCommands, ...categoryCommands, ...flashcardCategoryCommands];


                        if (navTerm === '') { // User just typed "%"
                            this.results = allCommands.map(cmd => ({ type: 'navigate', ...cmd }));
                        } else { // User is typing a command
                            this.results = allCommands
                                .filter(cmd => cmd.id.toLowerCase().startsWith(navTerm) || App.util.getCategoryDisplayName(cmd.id).toLowerCase().startsWith(navTerm))
                                .map(cmd => ({ type: 'navigate', ...cmd }));
                        }
                        this._renderResults(this.results);
                        return;
                    }

                    // New logic for the image filter
                    if (lowerQuery.startsWith('image')) {
                        const searchTerm = lowerQuery.replace(/^image:?\s*/, '');
                        let itemsToSearch = this.searchableData.filter(item => item.type === 'image');

                        if (searchTerm.trim()) {
                            const fuse = App.offline.safeFuse(itemsToSearch, { keys: ['title'], threshold: 0.4, includeScore: true });
                            this.results = fuse.search(searchTerm).map(r => r.item);
                        } else {
                            this.results = itemsToSearch;
                        }
                        this._renderResults(this.results);
                        return;
                    }

                    if (lowerQuery.startsWith('pdf')) {
                        const searchTerm = lowerQuery.replace(/^pdf:?\s*/, '');
                        let itemsToSearch = this.searchableData.filter(item => item.type === 'pdf');
                        if (searchTerm.trim()) {
                            const fuse = App.offline.safeFuse(itemsToSearch, { keys: ['title', 'content'], threshold: 0.4, includeScore: true });
                            this.results = fuse.search(searchTerm).map(r => r.item);
                        } else {
                            this.results = itemsToSearch;
                        }
                        this._renderResults(this.results);
                        return;
                    }

                    const filterMatch = lowerQuery.match(/^(title|flashcard|snip|tag):\s*(.*)/);
                    if (filterMatch) {
                        const typeMap = { snip: 'snippet', title: 'note' };
                        const searchType = typeMap[filterMatch[1]] || filterMatch[1];
                        const searchTerm = filterMatch[2];

                        let itemsToSearch = this.searchableData.filter(item => item.type === searchType);

                        if (searchTerm.trim()) {
                            const keys = searchType === 'note' ? ['title'] : ['title', 'content'];
                            const fuse = App.offline.safeFuse(itemsToSearch, { keys: keys, threshold: 0.4, includeScore: true });
                            this.results = fuse.search(searchTerm).map(r => r.item);
                        } else {
                            this.results = itemsToSearch;
                        }
                        this._renderResults(this.results);
                        return;
                    }

                    const genericSearches = {
                        'title': { type: 'note', hint: 'Filter by title with "title: [term]"' },
                        'flashcard': { type: 'flashcard', hint: 'Filter with "flashcard: [term]"' },
                        'tag': { type: 'tag', hint: 'Filter tags with "tag: [term]" or view snippets with "snip: [term]"' },
                        'snip': { type: 'snippet', hint: 'Filter snippets with "snip: [term]"' }
                    };
                    if (genericSearches[lowerQuery]) {
                        const config = genericSearches[lowerQuery];
                        const allItems = this.searchableData.filter(item => item.type === config.type);
                        const suggestion = {
                            type: 'suggestion',
                            displayText: config.hint,
                            categoryText: 'Command Hint'
                        };
                        this.results = [suggestion, ...allItems];
                        this._renderResults(this.results);
                        return;
                    }

                    const commandPrefix = this.commandRegistry.find(cmd => cmd.keywords.some(kw => lowerQuery.startsWith(kw + ':')));
                    if (commandPrefix && !query.includes('>>')) {
                        let hint = '';
                        if (commandPrefix.name === 'note') {
                            hint = 'Syntax: `note:[category]: Title >> Content`';
                        }
                        this.results = [{ type: 'suggestion', displayText: hint, categoryText: 'Command Syntax Hint' }];
                        this._renderResults(this.results);
                        return;
                    }

                    const commandAction = this.parseCommand(query);
                    if (commandAction) {
                        this.results = [commandAction];
                        this._renderResults(this.results);
                        return;
                    }

                    this.results = this.search(query);
                    this._renderResults(this.results);
                },

                parseCommand(query) {
                    const trimmedQuery = query.trim();
                    const lowerQuery = trimmedQuery.toLowerCase();

                    const command = this.commandRegistry.find(cmd => cmd.keywords.some(kw => lowerQuery.startsWith(kw + ':') || lowerQuery.startsWith(kw + ' ')));
                    if (!command) return null;

                    const findCategory = (catIdentifier) => {

                        if (!catIdentifier) {
                            const defaultCat = App.settings.get('userCategories').find(c => c.isDefault);
                            return defaultCat ? defaultCat.name : 'General';
                        }
                        const lowerCat = catIdentifier.toLowerCase();
                        const userCategories = App.settings.get('userCategories');
                        const exactMatch = userCategories.find(c =>
                            (c.displayName && c.displayName.toLowerCase() === lowerCat) ||
                            c.name.toLowerCase() === lowerCat
                        );
                        if (exactMatch) return exactMatch.name;
                        const partialMatch = userCategories.find(c =>
                            (c.displayName && c.displayName.toLowerCase().startsWith(lowerCat)) ||
                            c.name.toLowerCase().startsWith(lowerCat)
                        );
                        if (partialMatch) return partialMatch.name;

                        const defaultCat = userCategories.find(c => c.isDefault);
                        return defaultCat ? defaultCat.name : 'General';
                    };
                    let action = { type: 'command', command: command.name };

                    if (command.name === 'note') {
                        const noteRegex = /^(?:note|n):?(?:([^:]+):)?\s*(.*?)\s*>>\s*(.*)$/s;
                        const match = trimmedQuery.match(noteRegex);
                        if (!match) return null;
                        let [, category, title, content] = match;
                        if (!title.trim() && !content?.trim()) return null;
                        action.title = title.trim();
                        action.category = findCategory(category);
                        action.content = content ? App.util.textToHtml(content.trim()) : '<p><br></p>';
                        action.displayText = `Create Note: "${action.title}"`;
                        action.categoryText = `in ${App.util.getCategoryDisplayName(action.category)}`;
                    }
                    return action;
                },

                async buildIndex() {
                    if (!App.state || !App.state.articles) return;
                    this.searchableData = [];
                    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

                    const articles = App.state.articles || [];
                    for (let i = 0; i < articles.length; i++) {
                        const note = articles[i];
                        this.searchableData.push({ id: note.id, type: 'note', title: note.title, content: note.content.substring(0, 100), action: 'openNote' });
                        if (i % 50 === 0) await yieldToMain();
                    }


                    const flashcards = App.util.getAllFlashcards() || [];
                    for (let i = 0; i < flashcards.length; i++) {
                        const card = flashcards[i];
                        let title = '';
                        let content = '';

                        // Intelligently determine the primary text based on flashcard type
                        if (card.type === 'mcq') {
                            title = card.question || '';
                            content = (card.options || []).map(opt => opt.text).join(' ');
                        } else if (card.type === 'collapsible') {
                            title = card.frontText || '';
                            content = card.backText || '';
                        } else { // Default to cloze
                            title = card.fullText || '';
                        }

                        this.searchableData.push({
                            id: card.id,
                            type: 'flashcard',
                            title: title,
                            content: content,
                            action: 'openFlashcard',
                            category: card.category
                        });
                        if (i % 50 === 0) await yieldToMain();
                    }

                    Object.values(App.state.tags || {}).forEach(tag => this.searchableData.push({ id: tag.id, type: 'tag', title: tag.displayName, action: 'filterNotesByTag' }));

                    const allSnippets = App.util.extractSnippets(null, ['highlight', 'mindmap', 'tag']);


                    // Process snippets, separating text from images
                    for (let i = 0; i < allSnippets.length; i++) {
                        const snip = allSnippets[i];
                        const article = App.storage.getArticle(snip.articleId);
                        if (!article) continue;

                        if (snip.isImage) {
                            // This is our new logic to add images as a distinct type
                            this.searchableData.push({
                                ...snip,
                                type: 'image',
                                title: snip.text, // The caption is the searchable text
                                content: `In: ${article.title}`,
                                action: 'openImage' // A new action we will create
                            });
                        } else if (snip.type === 'mindmap') {
                            this.searchableData.push({
                                ...snip,
                                type: 'mindmap_snippet',
                                title: snip.text,
                                content: `Mindmap in: ${article.title}`,
                                action: 'openSnippet'
                            });
                        } else {
                            // This is the existing logic for text snippets
                            this.searchableData.push({
                                ...snip,
                                type: 'snippet',
                                title: snip.text,
                                content: `In: ${article.title}`,
                                action: 'openSnippet'
                            });
                        }
                        if (i % 50 === 0) await yieldToMain();
                    }

                    const pdfArticles = (App.state.articles || []).filter(n => n.attachments && n.attachments.length > 0);
                    for (let i = 0; i < pdfArticles.length; i++) {
                        const note = pdfArticles[i];
                        note.attachments.forEach(attachment => {
                            if (attachment.type === 'application/pdf') {
                                this.searchableData.push({
                                    id: attachment.id,
                                    type: 'pdf',
                                    title: attachment.name.replace(/\.pdf$/i, ''),
                                    content: `In: ${note.title}`,
                                    action: 'openPdfArticle',
                                    articleId: note.id
                                });
                            }
                        });
                        if (i % 20 === 0) await yieldToMain();
                    }

                    const options = { includeScore: true, keys: ['title', 'content'], threshold: 0.4 };
                    this.fuse = App.offline.safeFuse(this.searchableData, options);
                    this.isInitialized = true;
                },

                search(query) {
                    if (!query || !this.fuse) { this.results = []; return []; }
                    this.results = this.fuse.search(query).map(result => result.item);
                    return this.results;
                },

                async executeAction(item) {
                    if (!item) return;
                    if (item.type === 'suggestion') return;

                    if (item.type !== 'command') {
                        this.closeSearch();
                    }

                    switch (item.type) {
                        case 'navigate':
                            switch (item.id) {
                                case 'all-snippets':
                                    App.router.navigateTo('category', 'All');
                                    break;
                                case 'flashcard':
                                    await App.settings.set('flashcardCategory', 'All');
                                    App.router.navigateTo('flashcard');
                                    break;
                                case 'study':
                                    App.events.study.start();
                                    break;
                                case 'quiz':
                                    App.quiz.start();
                                    break;
                                case 'settings':
                                    App.ui.showSettingsModal();
                                    break;
                                case 'new':
                                    App.events.createNewArticle();
                                    break;
                                default:
                                    if (item.isFlashcardCategory) {
                                        await App.settings.set('flashcardCategory', item.category);
                                        App.router.navigateTo('flashcard');
                                    } else {
                                        const destination = item.isCategory ? 'category' : item.id;
                                        const data = item.isCategory ? item.id : null;
                                        App.router.navigateTo(destination, data);
                                    }
                                    break;
                            }
                            break;

                        case 'command':
                            switch (item.command) {
                                case 'note':
                                    if (!App.license.isPremium() && App.state.articles.length >= App.config.sparkTierLimit) {
                                        App.ui.showAscensionModal();
                                        App.ui.showToast('Note limit reached. Go Premium for unlimited notes.', 'warning');
                                        this.closeSearch();
                                        return; // Stop execution
                                    }
                                    const noteData = { title: item.title, content: item.content, category: item.category };
                                    const newNote = await App.storage.createArticle(noteData);
                                    if (newNote) {
                                        App.ui.showToast(`Note "${newNote.title}" created!`, { type: 'success' });
                                        this.closeSearch();
                                        App.router.navigateTo('article', { id: newNote.id, mode: 'write' });
                                    }
                                    break;
                            }
                            break;

                        default:
                            switch (item.action) {
                                case 'openNote':
                                    App.router.navigateTo('article', { id: item.id, mode: 'read' });
                                    break;
                                case 'openSnippet':
                                    App.router.navigateTo('article', { id: item.articleId, mode: 'read', scrollToSnippetId: item.id });
                                    break;
                                case 'openImage':
                                    App.router.navigateTo('article', { id: item.articleId, mode: 'read', scrollToSnippetId: item.id });
                                    break;

                                case 'openPdfArticle':
                                    App.router.navigateTo('article', { id: item.articleId, mode: 'read', scrollToSnippetId: item.id });
                                    break;
                                case 'openFlashcard':
                                    await App.settings.set('flashcardCategory', item.category);
                                    App.router.navigateTo('flashcard');
                                    break;
                                case 'filterNotesByTag':
                                    // For navigation parity with highlight snippets: jump to the first
                                    // occurrence of this supertag.
                                    const articlesWithTag = (App.state.articles || [])
                                        .filter(a => a.tags && a.tags.includes(item.id))
                                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                                    if (articlesWithTag.length > 0) {
                                        App.events.navigateToTagInArticle(articlesWithTag[0].id, item.id, true);
                                    } else {
                                        App.ui.showToast('No articles found for this tag.', { type: 'info' });
                                    }
                                    break;
                            }
                            break;
                    }
                },

                _renderResults(results) {
                    this.els.resultsContainer.innerHTML = '';

                    const isPremium = App.license.isPremium();
                    const searchLimit = 5;

                    // RATIONALE: Changed from .push() to .unshift() to make the premium message the FIRST item.
                    if (!isPremium && results.length > searchLimit) {
                        results = results.slice(0, searchLimit);
                        results.unshift({
                            type: 'premium-upsell',
                            title: 'Unlock Ultimate Search',
                            category: App.util.getRandomMessage(App.util.wittyDeveloperMessages),
                            icon: App.util.getTierBadgeHTML('Diamond', 24)
                        });
                    }

                    if (this.els.input.value && results.length === 0) {
                        this.els.resultsContainer.innerHTML = `<div class="no-results-item">No results found.</div>`; return;
                    }


                    results.forEach((item, index) => {
                        const itemEl = document.createElement('div');
                        itemEl.className = 'search-result-item';
                        itemEl.dataset.index = index;

                        let icon, title, category;
                        if (item.type === 'ai_result') {
                            icon = item.icon;
                            title = `<div style="white-space: pre-wrap; line-height: 1.6;">${item.title}</div>`; // <-- The fix is removing App.util.escapeHtml()
                            category = item.category;
                            itemEl.addEventListener('click', () => {
                                this._saveKashAskResult(item.prompt, item.response);
                            });
                        } else if (item.type === 'command' || item.type === 'suggestion') {
                            icon = item.type === 'command' ? '⚡️' : '💡';
                            title = item.displayText;
                            category = item.categoryText;
                        } else if (item.type === 'premium-upsell') {
                            icon = item.icon;
                            title = item.title;
                            category = item.category;
                        } else if (item.type === 'navigate') {
                            icon = item.icon;
                            title = item.name;
                            category = 'Navigation Command';
                        } else {
                            const icons = {
                                note: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
                                pdf: App.util.icons.pdf,
                                flashcard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
                                tag: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 7.586 2H2zm1 5.586 7 7L15.586 9l-7-7H3v4.586z"></path><path d="M5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>`,
                                'tag-snippet': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12.586 2.586a2 2 0 0 0-2.828 0L2.172 10.172a2 2 0 0 0 0 2.828l7.414 7.414a2 2 0 0 0 2.828 0l7.414-7.414a2 2 0 0 0 0-2.828L12.586 2.586z"></path><line x1="9" y1="9" x2="9.01" y2="9"></line></svg>`,
                                snippet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21h18M7 12v4h10v-4M5 12V3h14v9M11 3h2"></path></svg>`,
                                mindmap: App.util.icons.mindmap || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
                                image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
                            };
                            icon = icons[item.type] || '🔍';
                            category = (item.type === 'image' || item.type === 'tag-snippet')
                                ? `Image in: ${App.storage.getArticle(item.articleId)?.title || 'Unknown'}`
                                : item.type;

                            if (item.type === 'image') {
                                title = `<div class="search-result-image-wrapper">
                                        <img src="${item.src}" alt="Image snippet">
                                        ${item.title ? `<div class="search-result-caption">${App.util.escapeHtml(item.title)}</div>` : ''}
                                    </div>`;
                            } else if ((item.type === 'snippet' || item.type === 'tag-snippet') && item.html) {
                                title = item.html;
                            } else if (item.type === 'tag') {
                                title = `<span class="rendered-tag">${item.title}</span>`;
                            } else if (item.type === 'flashcard') {
                                // Use our new cleaning utility for a beautiful display
                                title = App.util.escapeHtml(App.util.cleanFlashcardTextForDisplay(item.title));
                            } else {
                                title = App.util.escapeHtml(item.title);
                            }
                        }

                        itemEl.innerHTML = `<div class="result-icon">${icon}</div><div class="result-content"><div class="result-text">${title}</div><div class="result-category">${category}</div></div>`;

                        if (item.type === 'premium-upsell') {
                            itemEl.classList.add('selected');
                            itemEl.addEventListener('click', () => { App.ui.showAscensionModal(); this.closeSearch(); });
                        } else if (item.type !== 'suggestion') {
                            itemEl.addEventListener('click', () => { this.selectedIndex = index; this.executeAction(this.results[this.selectedIndex]); });
                        } else {
                            itemEl.style.opacity = '0.7';
                            itemEl.style.cursor = 'default';
                        }
                        this.els.resultsContainer.appendChild(itemEl);
                    });

                    if (results.length > 0) {
                        this.selectedIndex = 0;
                        this._updateSelection();
                    }
                },

                _handleKeyDown(e) {
                    if (this.els.overlay.classList.contains('hidden')) return;

                    // NEW: kashask logic takes priority on Enter key
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const query = this.els.input.value.trim();
                        if (query.toLowerCase().startsWith('kashask:')) {
                            this._executeKashAsk(query);
                            return;
                        }
                    }
                    if (e.key === 'Tab') {
                        if (this.selectedIndex !== -1 && this.results[this.selectedIndex]?.type === 'ai_result') {
                            e.preventDefault(); // Prevent default browser behavior for Tab
                            const selectedItem = this.results[this.selectedIndex];
                            this._saveKashAskResult(selectedItem.prompt, selectedItem.response);
                            return;
                        }
                    }

                    if (e.key === 'Escape') { this.closeSearch(); }
                    else if (e.key === 'ArrowDown') { e.preventDefault(); if (this.selectedIndex < this.results.length - 1) { this.selectedIndex++; this._updateSelection(); } }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); if (this.selectedIndex > 0) { this.selectedIndex--; this._updateSelection(); } }
                    else if (e.key === 'Enter') { // This part remains for other searches
                        e.preventDefault();
                        if (this.selectedIndex !== -1 && this.results[this.selectedIndex]) {
                            this.executeAction(this.results[this.selectedIndex]);
                        }
                    }
                },

                _executeKashAsk: async function (fullQuery) {
                    const prompt = fullQuery.substring(8).trim();
                    if (!prompt) {
                        App.ui.showToast("Please enter a question after 'kashask:'.", "warning");
                        return;
                    }

                    this.results = [{ type: 'suggestion', displayText: 'Your Second Brain is thinking...', categoryText: 'Please wait a moment.' }];
                    this._renderResults(this.results);

                    try {
                        const systemPrompt = "You are a knowledgeable and adaptive assistant. Analyze the user’s prompt/question/query carefully and respond while Acting as Subject Expert of that field.  Use clear, natural language that fits the user’s intent — concise for short factual queries, detailed for conceptual or how-to questions. You may freely choose the best structure (<p>, <b>, <i>, <ul>, <ol>, <li>, <small>) depending on context, you can also use revision tables (in html) wherever required and other things too. Always keep answers accurate, readable, in-depth and directly Useful. The final output must be reliable, stylish looking HTML ready for display. CRITICAL RULE: Your entire response must ONLY be HTML content itself. DO NOT include ```html, markdown fences, or any text outside of the HTML tags..";
                        const aiResponse = await App.services.ai.queryGenerativeAI(systemPrompt, prompt);

                        if (!aiResponse || !aiResponse.trim()) {
                            throw new Error("AI returned an empty response.");
                        }

                        const cleanedResponse = aiResponse.trim().replace(/(\r\n|\n|\r)/gm, "");

                        this.results = [{
                            type: 'ai_result',
                            title: cleanedResponse, // <-- Use the cleaned response
                            category: 'Click or Press Tab to save as New Note',
                            icon: '✨',
                            prompt: prompt,
                            response: cleanedResponse // <-- Use the cleaned response here too
                        }];
                        this._renderResults(this.results);
                        this.selectedIndex = 0;
                        this._updateSelection();

                    } catch (error) {
                        console.error("KashAsk execution error:", error);
                        App.ui.showToast(`AI query failed: ${error.message}`, "error");
                        this.results = [{ type: 'suggestion', displayText: 'Sorry, the AI query failed.', categoryText: 'Please check your API key or try again.' }];
                        this._renderResults(this.results);
                    }
                },

                _saveKashAskResult: async function (prompt, response) {
                    try {
                        const category = (App.settings.get('userCategories').find(c => c.isDefault) || { name: 'General' }).name;
                        const noteData = {
                            title: prompt,
                            content: `<p>${response.replace(/\n/g, '</p><p>')}</p>`, // Convert newlines to paragraphs
                            category: category
                        };
                        const newNote = await App.storage.createArticle(noteData);
                        if (newNote) {
                            App.ui.showToast('Saved Article', 'success');

                            if (App.router.getActiveView() === 'library') {

                                App.ui.filterAndRenderArticles();
                            }
                            this.closeSearch();
                        } else {
                            throw new Error("Failed to create the article file.");
                        }
                    } catch (error) {
                        console.error("Failed to save KashAsk result:", error);
                        App.ui.showToast('Error saving the note.', 'error');
                    }
                },

                // --- DATA BINDING: Checkbox Listener ---
                _initCheckboxListener() {
                    const articleContent = document.getElementById('article-content');
                    if (!articleContent) return;

                    articleContent.addEventListener('change', async (e) => {
                        if (e.target.matches('input[type="checkbox"]')) {
                            // Only apply in Read/Stage/Focus modes (where content isn't editable directly)
                            if (App.state.currentMode === 'write') return;

                            const id = App.state.activeArticleId;
                            const article = App.storage.getArticle(id);
                            if (!article) return;

                            const allCheckboxes = Array.from(articleContent.querySelectorAll('input[type="checkbox"]'));
                            const index = allCheckboxes.indexOf(e.target);

                            if (index > -1) {
                                // Find N-th checkbox in source content and update it
                                let matchIndex = -1;
                                const regex = /<input[^>]+type=["']checkbox["'][^>]*>/gi;
                                let occurrence = 0;

                                const newContent = article.content.replace(regex, (match) => {
                                    if (occurrence === index) {
                                        const isChecked = e.target.checked;
                                        if (isChecked) {
                                            if (!match.includes('checked')) {
                                                return match.replace(/>$/, ' checked>');
                                            }
                                        } else {
                                            return match.replace(/ checked(=["']?checked["']?)?/i, '');
                                        }
                                        return match;
                                    }
                                    occurrence++;
                                    return match;
                                });

                                if (newContent !== article.content) {
                                    // Save quietly
                                    await App.events.saveArticle({ content: newContent, isAutosave: true });
                                    // Make sure we update the in-memory article so subsequent clicks work on fresh data
                                    article.content = newContent;
                                }
                            }
                        }
                    });
                },

                _updateSelection() {
                    const items = this.els.resultsContainer.querySelectorAll('.search-result-item');
                    items.forEach((item, index) => {
                        item.classList.toggle('selected', index === this.selectedIndex);
                        if (index === this.selectedIndex) item.scrollIntoView({ block: 'nearest' });
                    });
                },
};

export const find = {
                _bar: null,
                _input: null,
                _count: null,
                _prevBtn: null,
                _nextBtn: null,
                _caseBtn: null,
                _matches: [],
                _current: -1,
                _caseSensitive: false,
                _debounceTimer: null,

                init() {
                    this._bar = document.getElementById('nk-find-bar');
                    this._input = document.getElementById('nk-find-input');
                    this._count = document.getElementById('nk-find-count');
                    this._prevBtn = document.getElementById('nk-find-prev');
                    this._nextBtn = document.getElementById('nk-find-next');
                    this._caseBtn = document.getElementById('nk-find-case');
                    if (!this._bar) return;

                    // Input: debounced live search
                    this._input.addEventListener('input', () => {
                        clearTimeout(this._debounceTimer);
                        this._debounceTimer = setTimeout(() => this._run(), 120);
                    });

                    this._input.addEventListener('keydown', e => {
                        if (e.key === 'Enter') { e.preventDefault(); this._navigate(e.shiftKey ? -1 : 1); }
                        else if (e.key === 'Escape') this.close();
                    });

                    this._prevBtn.addEventListener('click', () => this._navigate(-1));
                    this._nextBtn.addEventListener('click', () => this._navigate(1));

                    this._caseBtn.addEventListener('click', () => {
                        this._caseSensitive = !this._caseSensitive;
                        this._caseBtn.classList.toggle('nk-find-case-active', this._caseSensitive);
                        this._caseBtn.title = this._caseSensitive ? 'Case Sensitive (active)' : 'Toggle Case Sensitive';
                        this._run();
                    });

                    document.getElementById('nk-find-close').addEventListener('click', () => this.close());

                    // Global Ctrl+F / Cmd+F shortcut
                    document.addEventListener('keydown', (e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                            if (App.state && App.state.activeArticleId) {
                                e.preventDefault();
                                this.open();
                            }
                        }
                    });
                },

                open() {
                    if (!this._bar) return;
                    this._bar.style.display = 'flex';
                    requestAnimationFrame(() => {
                        this._bar.classList.add('is-visible');
                    });
                    setTimeout(() => this._input.focus(), 60);
                    if (this._input.value.trim()) this._run();
                },

                close() {
                    if (!this._bar) return;
                    this._bar.classList.remove('is-visible');
                    setTimeout(() => { this._bar.style.display = 'none'; }, 220);
                    this._clear();
                    this._count.textContent = '';
                    this._setNavEnabled(false);
                },

                _run() {
                    this._clear();
                    const query = this._input.value.trim();
                    if (!query) {
                        this._count.textContent = '';
                        this._setNavEnabled(false);
                        return;
                    }
                    const content = document.getElementById('article-content');
                    if (!content) return;

                    // Escape regex special chars for literal match
                    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const flags = this._caseSensitive ? 'g' : 'gi';
                    let regex;
                    try { regex = new RegExp(escaped, flags); } catch (e) { return; }

                    this._highlightNode(content, regex);

                    if (this._matches.length === 0) {
                        this._count.textContent = 'No results';
                        this._count.style.color = 'var(--danger-color)';
                        this._setNavEnabled(false);
                        return;
                    }

                    this._count.style.color = '';
                    this._current = 0;
                    this._updateCount();
                    this._scrollTo(0);
                    this._setNavEnabled(true);
                },

                _highlightNode(root, regex) {
                    const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT']);
                    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                        acceptNode: node => {
                            const p = node.parentElement;
                            return (!p || skip.has(p.tagName) || p.closest('#nk-find-bar'))
                                ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                        }
                    });
                    const nodes = [];
                    let n; while ((n = walker.nextNode())) nodes.push(n);

                    for (const tn of nodes) {
                        const text = tn.nodeValue;
                        if (!text) continue;
                        const parts = [];
                        let last = 0, m;
                        regex.lastIndex = 0;
                        while ((m = regex.exec(text)) !== null) {
                            if (m.index > last) parts.push(document.createTextNode(text.slice(last, m.index)));
                            const mark = document.createElement('mark');
                            mark.className = 'nk-find-hl';
                            mark.textContent = m[0];
                            parts.push(mark);
                            this._matches.push(mark);
                            last = regex.lastIndex;
                            if (regex.lastIndex === m.index) regex.lastIndex++;
                        }
                        if (!parts.length) continue;
                        if (last < text.length) parts.push(document.createTextNode(text.slice(last)));
                        const frag = document.createDocumentFragment();
                        parts.forEach(p => frag.appendChild(p));
                        tn.parentNode.replaceChild(frag, tn);
                    }
                },

                _clear() {
                    const content = document.getElementById('article-content');
                    if (!content) return;
                    content.querySelectorAll('mark.nk-find-hl').forEach(m => {
                        m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
                    });
                    content.normalize();
                    this._matches = [];
                    this._current = -1;
                },

                _navigate(dir) {
                    if (!this._matches.length) return;
                    this._current = (this._current + dir + this._matches.length) % this._matches.length;
                    this._updateCount();
                    this._scrollTo(this._current);
                },

                _scrollTo(index) {
                    this._matches.forEach((m, i) => m.classList.toggle('nk-find-hl-current', i === index));
                    const el = this._matches[index];
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                },

                _updateCount() {
                    this._count.textContent = `${this._current + 1} / ${this._matches.length}`;
                },

                _setNavEnabled(on) {
                    this._prevBtn.disabled = !on;
                    this._nextBtn.disabled = !on;
                },
};
