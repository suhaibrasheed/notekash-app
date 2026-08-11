export const storage = {
                DELETED_RECORDS_FILENAME: '_deleted.json',

                async load() {
                    // This function is now ONLY for File System mode. Browser mode is handled in loadInitialData.
                    if (!App.state.directoryHandle) return;

                    const { articles, failedCount, total } = await this.getAll();
                    App.state.articles = articles;
                    App.state.deletedRecords = await this.getDeletedRecords();
                    App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                    if (failedCount > 0) App.ui.showToast(`${failedCount} corrupt file(s) skipped.`, { type: 'warning' });
                    if (total > 0) App.ui.showToast(`${articles.length} articles loaded.`, { type: 'success' });
                },

                async createArticle(data) {
                    // Refined for Sync: Respect existing ID and metadata if provided (e.g. from Dropbox)
                    const newArticle = {
                        id: data.id || ('art_' + crypto.randomUUID()),
                        title: data.title || 'Untitled Article',
                        content: data.content || '<p><br></p>',
                        category: data.category || 'General',
                        readCount: (typeof data.readCount === 'number') ? data.readCount : 0,
                        readHistory: Array.isArray(data.readHistory) ? data.readHistory : [],
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        flashcards: (typeof data.flashcards === 'object') ? data.flashcards : {},
                        createdAt: data.createdAt || new Date().toISOString(),
                        updatedAt: data.updatedAt || new Date().toISOString()
                    };

                    try {
                        newArticle.wordCount = App.util.calculateWordCount(newArticle.content);

                        if (App.state.directoryHandle) {
                            await App.fs.write(`${newArticle.id}.json`, newArticle); // Directly use App.fs
                            await this.generateIndexFromState();
                        } else {
                            await App.browserStore.setArticle(newArticle); // Use new browser store
                        }

                        App.state.articles.unshift(newArticle);
                        App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        this.broadcastStateChange({ type: 'ARTICLE_CREATED', article: newArticle });
                        return newArticle;
                    } catch (err) { console.error("Failed to create article:", err); App.ui.showToast("Error saving new article.", { type: 'error' }); return null; }
                },

                async updateArticle(id, updates) {
                    const articleIndex = App.state.articles.findIndex(a => a.id === id);
                    if (articleIndex === -1) return { success: false, error: 'Article not found in state.' };

                    let baseArticle = App.state.articles[articleIndex];

                    // CRITICAL FIX: If the in-memory note has un-hydrated content (from _index.json)
                    // and this update is metadata-only, fetch the existing note payload from storage first
                    // so content is never erased or overwritten with undefined.
                    if (baseArticle.content === undefined && updates.content === undefined) {
                        try {
                            const fullArticle = App.state.storageMode === 'browser'
                                ? await App.browserStore.getArticle(id)
                                : await App.fs.read(`${id}.json`);
                            if (fullArticle && fullArticle.content !== undefined) {
                                baseArticle = { ...fullArticle, ...baseArticle, content: fullArticle.content };
                                App.state.articles[articleIndex] = baseArticle;
                            }
                        } catch (loadErr) {
                            console.warn(`Could not preload full article payload for ${id}:`, loadErr);
                        }
                    }

                    // Refined for Sync: Use provided updatedAt if available, otherwise generate new one.
                    const updatedArticle = {
                        ...baseArticle,
                        ...updates,
                        updatedAt: updates.updatedAt || new Date().toISOString()
                    };

                    try {
                        if (updatedArticle.content) {
                            updatedArticle.wordCount = App.util.calculateWordCount(updatedArticle.content);
                        }

                        if (App.state.directoryHandle) {
                            await App.fs.write(`${updatedArticle.id}.json`, updatedArticle); // Directly use App.fs
                            await this.generateIndexFromState();
                        } else {
                            await App.browserStore.setArticle(updatedArticle); // Use new browser store
                        }

                        App.state.articles[articleIndex] = updatedArticle;
                        App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        this.broadcastStateChange({ type: 'ARTICLE_UPDATED', id, article: updatedArticle });
                        return { success: true, article: updatedArticle };
                    } catch (err) {
                        console.error("Failed to update article:", err);
                        App.ui.showToast(`Save failed. Could not update the article.`, { type: 'error' });
                        return { success: false, error: err.message };
                    }
                },

                async deleteArticle(id) {
                    const articleInState = this.getArticle(id);
                    if (!articleInState) return;
                    App.state.articles = App.state.articles.filter(a => a.id !== id);
                    try {
                        // FIX: Record deletion across BOTH storage modes to stop zombie notes
                        await this.recordDeletion(id);
                        if (App.state.directoryHandle) {
                            await App.state.directoryHandle.removeEntry(`${id}.json`).catch(e => { if (e.name !== 'NotFoundError') throw e; });
                            await this.generateIndexFromState();
                        } else {
                            await App.browserStore.deleteArticle(id); // Use new browser store
                        }
                        this.broadcastStateChange({ type: 'ARTICLE_DELETED', id });
                    } catch (err) { console.error("Failed to delete article:", err); App.ui.showToast("Error: Could not delete the article.", { type: 'error' }); }
                },

                _broadcastChannel: null,

                broadcastStateChange(payload) {
                    if (typeof BroadcastChannel !== 'undefined') {
                        try {
                            if (!this._broadcastChannel) {
                                this._broadcastChannel = new BroadcastChannel('notekash_state_sync');
                            }
                            this._broadcastChannel.postMessage(payload);
                        } catch (e) {
                            console.warn('Storage: BroadcastChannel postMessage failed (cross-tab sync unavailable).', e);
                        }
                    }
                },

                async handleMobileImport(event) {
                    const files = event.target.files;
                    if (!files.length) return;
                    const toast = App.ui.showToast(`Importing 0 / ${files.length} notes...`, { duration: 0 });
                    let importedCount = 0;
                    for (const file of files) {
                        if (file.name.endsWith('.json')) {
                            try {
                                const article = JSON.parse(await file.text());
                                if (article.id && article.title) {
                                    await App.browserStore.setArticle(article);
                                    importedCount++;
                                    App.ui.updateToast(toast, `Importing ${importedCount} / ${files.length} notes...`);
                                }
                            } catch (e) { console.warn(`Skipping invalid file: ${file.name}`); }
                        }
                    }
                    App.ui.hideToast(toast);
                    App.ui.showToast(`${importedCount} notes imported!`, 'success');

                    // Set the correct state and trigger the main loading sequence for consistency.
                    App.state.isInitialLoadComplete = false;
                    App.state.isHydrated = false; // <-- THE FIX: Reset the hydration flag
                    App.state.storageMode = 'browser';
                    App.state.directoryHandle = null;

                    await App.loadInitialData();
                    App.router.navigateTo('library');
                },

                // --- The functions below are now ONLY used for File System mode ---
                async verifyPermission(handle) {
                    if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
                    if (await handle.requestPermission({ mode: 'readwrite' }) === 'granted') return true;
                    return false;
                },
                async getAll(showToast = false) {
                    if (!App.state.directoryHandle) return { articles: [], failedCount: 0, total: 0 };
                    const entries = [];
                    const dataFiles = ['settings.json', 'todos.json', 'pomodoro.json', 'quiz_stats.json', 'tags.json', 'visual-map-state.json', 'mind-map-state.json'];
                    for await (const entry of App.state.directoryHandle.values()) {
                        if (entry.kind === 'file' && entry.name.endsWith('.json') && !entry.name.startsWith('_') && !dataFiles.includes(entry.name)) {
                            entries.push(entry);
                        }
                    }
                    const total = entries.length;
                    if (total === 0) return { articles: [], failedCount: 0, total: 0 };

                    const toastId = (showToast && App.ui?.showToast) ? App.ui.showToast(`Loading 0 / ${total} articles...`, { type: 'info', duration: 120000 }) : null;
                    const articles = [];
                    let failedCount = 0;
                    let count = 0;
                    const BATCH_SIZE = 16;

                    // Concurrent chunked reads with thread yielding for high-speed hydration without UI jank
                    for (let i = 0; i < total; i += BATCH_SIZE) {
                        const batch = entries.slice(i, i + BATCH_SIZE);
                        const results = await Promise.all(batch.map(async (entry) => {
                            try {
                                const file = await entry.getFile();
                                const content = await file.text();
                                const article = JSON.parse(content);
                                if (typeof article.id === 'string' && typeof article.title === 'string' && typeof article.content === 'string' && typeof article.category === 'string' && !isNaN(new Date(article.updatedAt))) {
                                    return { success: true, article };
                                } else {
                                    throw new Error('Invalid NoteKash article structure');
                                }
                            } catch (err) {
                                console.error(`Skipping invalid or corrupt file ${entry.name}:`, err.message);
                                if (App.ui?.showToast) App.ui.showToast(`Skipped corrupt file: ${entry.name}`, { type: 'warning' });
                                return { success: false, name: entry.name };
                            }
                        }));

                        for (const res of results) {
                            count++;
                            if (res.success) {
                                articles.push(res.article);
                            } else {
                                failedCount++;
                            }
                        }

                        if (toastId && App.ui?.updateToast) {
                            App.ui.updateToast(toastId, `Loading ${count} / ${total} articles...`);
                        }

                        // Yield execution to allow rendering and animation frames to process
                        await new Promise(r => setTimeout(r, 0));
                    }

                    if (toastId && App.ui?.hideToast) App.ui.hideToast(toastId);
                    return { articles, failedCount, total };
                },
                async generateIndexFromState() {
                    if (!App.state.directoryHandle) return;
                    const indexData = App.state.articles.map(article => {
                        let wordCount = article.wordCount;
                        if (wordCount === undefined && typeof article.content === 'string') {
                            wordCount = App.util.calculateWordCount(article.content);
                        }
                        return { id: article.id, title: article.title, category: article.category, tags: article.tags || [], readCount: article.readCount || 0, createdAt: article.createdAt, updatedAt: article.updatedAt, wordCount: wordCount || 0 };
                    });
                    await App.fs.write('_index.json', indexData);
                    console.warn(`Storage: Regenerated _index.json from state with ${indexData.length} articles.`);
                },
                async getDeletedRecords() { return await App.fs.read(this.DELETED_RECORDS_FILENAME) || []; },
                async saveDeletedRecords(records) { await App.fs.write(this.DELETED_RECORDS_FILENAME, records); },
                async recordDeletion(id) {
                    const now = new Date().toISOString(); const records = await this.getDeletedRecords();
                    if (!records.some(r => r.id === id)) { records.push({ id, deletedAt: now }); }
                    await this.saveDeletedRecords(records); App.state.deletedRecords = records;
                },
                async _getAllArticlesFromCurrentStore() {
                    // --- SMART SYNC OPTIMIZATION ---
                    // If we've already loaded and hydrated all articles in memory, use that as the source of truth for sync comparison.
                    // This avoids hitting the disk for every single article file and prevents the "Loading articles" toast from appearing during background syncs.
                    if (App.state.isHydrated && App.state.articles && App.state.articles.length > 0) {
                        return App.state.articles;
                    }

                    if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
                        const { articles } = await this.getAll();
                        return articles;
                    } else if (App.state.storageMode === 'browser') {
                        return await App.browserStore.getAllArticles();
                    }
                    return [];
                },
                getArticle(id) { return App.state.articles.find(a => a.id === id); },
};
