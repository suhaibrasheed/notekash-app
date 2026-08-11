export const dropbox = {
                SINGLETON_DATA_FILES: ['settings.json', 'todos.json', 'pomodoro.json', 'quiz_stats.json', 'tags.json', 'visual-map-state.json', 'mind-map-state.json'],
                async init() {
                    if (App.state.dropboxToken) {
                        await this.validateToken();
                    }
                },

                async connect() {
                    const clientId = App.settings.get('dropboxClientId');
                    if (!clientId) { App.ui.showToast("Please set your Dropbox Client ID first.", { type: 'error' }); return; }
                    const codeVerifier = this.generateCodeVerifier();
                    localStorage.setItem('dropbox-code-verifier', codeVerifier); // <-- FIX #2
                    localStorage.setItem('dropbox-client-id', clientId); // <-- FIX #4: Backup Client ID
                    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
                    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');

                    const dynamicRedirectUri = (window.location.origin + window.location.pathname).replace(/\/$/, "");

                    authUrl.searchParams.set('client_id', clientId);
                    authUrl.searchParams.set('response_type', 'code');
                    authUrl.searchParams.set('redirect_uri', dynamicRedirectUri);
                    authUrl.searchParams.set('code_challenge_method', 'S256');
                    authUrl.searchParams.set('code_challenge', codeChallenge);
                    window.location.href = authUrl.toString();
                },

                async handleRedirect() {
                    const urlParams = new URLSearchParams(window.location.search);
                    const authCode = urlParams.get('code');
                    const codeVerifier = localStorage.getItem('dropbox-code-verifier'); // <-- FIX #3a

                    //Retrieve Client ID from settings OR LocalStorage backup
                    let clientId = App.settings.get('dropboxClientId');
                    if (!clientId) {
                        clientId = localStorage.getItem('dropbox-client-id');
                        console.log("Retrieved Dropbox Client ID from LocalStorage backup.");
                    }

                    if (!authCode || !codeVerifier || !clientId) {
                        App.ui.showToast("Dropbox connection failed: Missing auth data.", { type: 'error' });
                        console.error('Auth Data Missing:', {
                            hasCode: !!authCode,
                            hasVerifier: !!codeVerifier,
                            hasClientId: !!clientId
                        });
                        return;
                    }
                    try {
                        const dynamicRedirectUri = (window.location.origin + window.location.pathname).replace(/\/$/, "");

                        const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                code: authCode,
                                grant_type: 'authorization_code',
                                redirect_uri: dynamicRedirectUri,
                                code_verifier: codeVerifier,
                                client_id: clientId,
                            })
                        });
                        if (!response.ok) throw new Error('Failed to get token');
                        const data = await response.json();

                        // Ensure we update settings (and memory) with the new token
                        await App.settings.set('dropboxToken', data.access_token);
                        App.state.dropboxToken = data.access_token;

                        await this.validateToken();
                    } catch (error) {
                        console.error("Dropbox Auth Error:", error);
                        App.ui.showToast("Dropbox connection failed.", { type: 'error' });
                    } finally {
                        window.history.replaceState({}, document.title, window.location.pathname);
                        localStorage.removeItem('dropbox-code-verifier'); // <-- FIX #3b
                        localStorage.removeItem('dropbox-client-id'); // <-- FIX #4: Cleanup

                        App.ui.applyTheme(App.settings.get('theme'), true);
                        App.ui.showStorageModal();
                    }
                },

                async validateToken() {
                    try {
                        const user = await this.apiCall('users/get_current_account', null, { silent: true });
                        App.state.dropboxUser = user;
                        App.state.isDropboxReady = true;
                        if (App.state.dropboxToken) App.ui.showToast(`Connected as ${user.name.display_name}.`, { type: 'success' });
                    } catch (error) {
                        console.error("Token validation failed:", error);
                        if (App.offline.isOffline || error.message === 'Network error') {
                            console.warn("Offline mode detected. Pausing Dropbox token validation.");
                            return;
                        }
                        // Already disconnected by apiCall if 401, but just in case
                        if (App.state.dropboxToken) this.disconnect(true);
                    }
                },
                async disconnect(silent = false) {
                    await App.settings.set('dropboxToken', null);
                    App.state.dropboxToken = null;
                    App.state.dropboxUser = null;
                    App.state.isDropboxReady = false;
                    if (!silent) App.ui.showToast("Disconnected from Dropbox.");
                    if (document.getElementById('settings-modal-content')) App.ui.showSettingsModal(); // <-- FIX: Immediate UI Refresh
                },

                async apiCall(endpoint, body, options = {}) {
                    if (!App.state.dropboxToken) {
                        return Promise.reject(new Error("Not connected to Dropbox."));
                    }

                    const isUpload = endpoint.includes('files/upload');
                    const isDownload = endpoint.includes('files/download');

                    const apiUrl = (isUpload || isDownload)
                        ? `https://content.dropboxapi.com/2/${endpoint}`
                        : `https://api.dropboxapi.com/2/${endpoint}`;

                    const headers = { 'Authorization': `Bearer ${App.state.dropboxToken}`, ...options.headers };
                    const fetchOptions = { method: 'POST', headers };

                    if (isUpload) {
                        // Uploads (like articles) send data in the body
                        headers['Content-Type'] = 'application/octet-stream';
                        fetchOptions.body = body;
                    } else if (isDownload) {

                    } else if (body) {
                        // Standard API calls (like list_folder) send JSON
                        headers['Content-Type'] = 'application/json';
                        fetchOptions.body = JSON.stringify(body);
                    }


                    try {
                        const response = await fetch(apiUrl, fetchOptions);

                        if (!response.ok) {
                            if (response.status === 401) {
                                this.disconnect(options.silent);
                                if (!options.silent) App.ui.showToast("Dropbox connection expired. Please reconnect.", { type: 'error' });
                            }

                            if (response.status === 429) {
                                const retryAfter = response.headers.get('Retry-After') || 60;
                                console.warn(`Dropbox rate limit hit. Retry after ${retryAfter}s.`);
                                throw new Error(`Rate limit hit. Pausing sync for ${retryAfter}s.`);
                            }

                            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                            try {
                                const errorJson = await response.json();
                                if (errorJson.error_summary) {
                                    errorMessage = errorJson.error_summary; // e.g., "path/not_found/..."
                                } else if (errorJson.error && errorJson.error.reason) {
                                    errorMessage = JSON.stringify(errorJson.error.reason); // Deeper error object
                                } else if (errorJson.error) {
                                    errorMessage = errorJson.error;
                                }
                            } catch (e) {
                            }

                            if (errorMessage.includes('insufficient_space')) {
                                App.ui.showToast("Your Dropbox is full. Sync failed.", { type: 'error' });
                            }

                            throw new Error(errorMessage);
                        }

                        if (options.isDownload) {
                            const content = await response.text();
                            return { content };
                        }
                        if (response.headers.get('content-length') === '0' || response.status === 204) {
                            return null;
                        }

                        return response.json();

                    } catch (e) {
                        if (e instanceof TypeError) {
                            console.warn("Network error during Dropbox API call:", e);
                            if (App.offline.isOffline || e.message === 'Failed to fetch') {
                                throw new Error('Network error');
                            }
                        }
                        throw e;
                    }
                },

                async syncChanges(isSilent = false, specificArticleId = null) {
                    if (App.offline.isOffline) {
                        if (!isSilent) App.ui.showToast("Offline. Sync paused.", { type: 'warning' });
                        return;
                    }
                    if (App.state.isSyncing) {
                        if (!isSilent) App.ui.showToast("Sync already in progress.", { type: 'warning' });
                        return;
                    }
                    if (!this.isReady()) {
                        console.warn("Dropbox sync called but not ready. Aborting.");
                        return;
                    }

                    App.state.isSyncing = true;
                    if (document.getElementById('settings-modal-content')) App.ui.showSettingsModal();

                    let syncToastId = null;
                    if (!isSilent) {
                        syncToastId = App.ui.showToast("Syncing...", { duration: 0, type: 'info' });
                    }

                    // Stats for Summary Toast
                    const stats = { uploaded: 0, downloaded: 0, deleted: 0, errors: 0 };

                    // Throttling Helper (Simple concurrency limiter)
                    const processInBatches = async (items, batchSize, taskFn) => {
                        const results = [];
                        for (let i = 0; i < items.length; i += batchSize) {
                            const batch = items.slice(i, i + batchSize);
                            const batchResults = await Promise.allSettled(batch.map(item => taskFn(item)));
                            results.push(...batchResults);
                        }
                        return results;
                    };

                    try {
                        // STEP 1: GET LOCAL DATA (Unchanged for Articles)
                        const localArticles = await App.storage._getAllArticlesFromCurrentStore();
                        const localDeletedRecords = await App.storage.getDeletedRecords();

                        let localArticlesMap;
                        if (specificArticleId) {
                            // Filter to ONLY the requested article for super-fast targeted sync.
                            const article = localArticles.find(a => a.id === specificArticleId);
                            localArticlesMap = new Map(article ? [[article.id, article]] : []);
                        } else {
                            localArticlesMap = new Map(localArticles.map(a => [a.id, a]));
                        }
                        const localDeletedMap = new Map(localDeletedRecords.map(r => [r.id, r]));

                        // STEP 2: GET REMOTE DATA & SEGREGATE
                        let remoteFiles = [];
                        if (specificArticleId) {
                            // FAST PATH: Targeted Sync avoids the heavy listAllFiles() call.
                            try {
                                const metadata = await this.apiCall('files/get_metadata', { path: `/${specificArticleId}.json` }, { silent: true });
                                if (metadata['.tag'] === 'file') remoteFiles = [metadata];
                            } catch (e) {
                                // If not found, remoteFiles remains empty (this is a new note).
                                if (!e.message || !e.message.includes('path/not_found')) {
                                    console.warn("Dropbox targeted metadata check failed:", e.message);
                                }
                            }
                        } else {
                            // FULL PATH: Startup or manual sync. 
                            remoteFiles = await this.listAllFiles();
                        }

                        let remoteDeletedRecords = [];
                        const remoteArticlesMap = new Map();
                        const remoteSingletonsMap = new Map();

                        for (const file of remoteFiles) {
                            const name = file.name;
                            if (name === App.storage.DELETED_RECORDS_FILENAME) {
                                const { content } = await this.apiCall('files/download', null, { headers: { 'Dropbox-API-Arg': JSON.stringify({ path: file.path_lower }) }, isDownload: true });
                                remoteDeletedRecords = content ? JSON.parse(content) : [];
                            }
                            else if (this.SINGLETON_DATA_FILES.includes(name)) {
                                remoteSingletonsMap.set(name, file);
                            }
                            else if (name.endsWith('.json') && !name.startsWith('_') && name.startsWith('art_')) {
                                remoteArticlesMap.set(name.replace('.json', ''), file);
                            }
                        }

                        const remoteDeletedMap = new Map(remoteDeletedRecords.map(r => [r.id, r]));

                        // STEP 3: MERGE DELETION RECORDS 
                        const masterDeletedMap = new Map(localDeletedMap);
                        remoteDeletedMap.forEach((remoteRecord, id) => {
                            const localRecord = masterDeletedMap.get(id);
                            if (!localRecord || new Date(remoteRecord.deletedAt) > new Date(localRecord.deletedAt)) {
                                masterDeletedMap.set(id, remoteRecord);
                            }
                        });

                        // STEP 4: COMPARE & BUILD SYNC LISTS
                        const toUploadArticles = [], toDownloadArticles = [], toDeleteLocal = [], toDeleteRemotePaths = [];
                        const toUploadSingletons = [], toDownloadSingletons = [];
                        const TOLERANCE_MS = 2000; // Dropbox timestamp tolerance

                        // 4a. Compare Articles
                        const allArticleIds = new Set([...localArticlesMap.keys(), ...remoteArticlesMap.keys()]);
                        for (const id of allArticleIds) {
                            if (masterDeletedMap.has(id)) continue;
                            const local = localArticlesMap.get(id);
                            const remote = remoteArticlesMap.get(id);

                            if (local && !remote) { toUploadArticles.push(local); }
                            else if (!local && remote) { toDownloadArticles.push(remote); }
                            else if (local && remote) {
                                const localDate = new Date(local.updatedAt);
                                // FIX: Apples-to-apples comparison using logical editing timestamp (client_modified).
                                const remoteDate = new Date(remote.client_modified || remote.server_modified);
                                if (Math.abs(localDate.getTime() - remoteDate.getTime()) > TOLERANCE_MS) {
                                    if (localDate > remoteDate) { toUploadArticles.push(local); }
                                    else { toDownloadArticles.push(remote); }
                                }
                            }
                        }

                        // 4b. Compare Deletion Lists 
                        masterDeletedMap.forEach(record => {
                            if (localArticlesMap.has(record.id)) toDeleteLocal.push(record.id);
                            if (remoteArticlesMap.has(record.id)) toDeleteRemotePaths.push({ path: `/${record.id}.json` });
                        });

                        // 4c. Compare Singleton Data Files (SKIP if this is a targeted article sync)
                        if (!specificArticleId) {
                            for (const fileName of this.SINGLETON_DATA_FILES) {
                                const localMeta = await App.fs.getFileMetadata(fileName);
                                const remoteMeta = remoteSingletonsMap.get(fileName);

                                if (localMeta && !remoteMeta) {
                                    const localData = await App.fs.read(fileName);
                                    if (localData) toUploadSingletons.push({ name: fileName, data: localData });
                                }
                                else if (!localMeta && remoteMeta) {
                                    toDownloadSingletons.push(remoteMeta);
                                }
                                else if (localMeta && remoteMeta) {
                                    const localDate = new Date(localMeta.lastModified);
                                    const remoteDate = new Date(remoteMeta.server_modified);

                                    if (Math.abs(localDate.getTime() - remoteDate.getTime()) > TOLERANCE_MS) {
                                        if (localDate > remoteDate) {
                                            const localData = await App.fs.read(fileName);
                                            if (localData) toUploadSingletons.push({ name: fileName, data: localData });
                                        } else {
                                            toDownloadSingletons.push(remoteMeta);
                                        }
                                    }
                                }
                            }
                        }

                        // STEP 5: EXECUTE SYNC OPERATIONS (THROTTLED)
                        const BATCH_SIZE = 3; // Max parallel requests

                        // 5a. Uploads (Articles + Singletons)
                        const allUploads = [...toUploadArticles.map(a => ({ type: 'article', data: a })), ...toUploadSingletons.map(s => ({ type: 'singleton', ...s }))];
                        await processInBatches(allUploads, BATCH_SIZE, async (item) => {
                            try {
                                const path = item.type === 'article' ? `/${item.data.id}.json` : `/${item.name}`;
                                const body = item.type === 'article' ? JSON.stringify(item.data) : JSON.stringify(item.data);

                                const uploadArgs = { path, mode: 'overwrite' };
                                if (item.type === 'article' && item.data.updatedAt) {
                                    const dateObj = new Date(item.data.updatedAt);
                                    if (!isNaN(dateObj.getTime())) {
                                        uploadArgs.client_modified = dateObj.toISOString().split('.')[0] + 'Z';
                                    }
                                }

                                await this.apiCall('files/upload', body, { headers: { 'Dropbox-API-Arg': JSON.stringify(uploadArgs) } });
                                stats.uploaded++;
                            } catch (e) {
                                console.error(`Failed upload: ${item.name || item.data.id}`, e);
                                stats.errors++;
                            }
                        });


                        // 5b. Downloads (Articles + Singletons)
                        const allDownloads = [...toDownloadArticles.map(m => ({ type: 'article', meta: m })), ...toDownloadSingletons.map(m => ({ type: 'singleton', meta: m }))];
                        await processInBatches(allDownloads, BATCH_SIZE, async (item) => {
                            try {
                                const { content } = await this.downloadFile(item.meta);
                                if (content) {
                                    const data = JSON.parse(content);
                                    if (item.type === 'article') {
                                        if (localArticlesMap.has(data.id)) await App.storage.updateArticle(data.id, data);
                                        else await App.storage.createArticle(data);
                                    } else {
                                        await App.fs.write(item.meta.name, data);
                                    }
                                    stats.downloaded++;
                                }
                            } catch (e) {
                                console.error(`Failed download: ${item.meta.name}`, e);
                                stats.errors++;
                            }
                        });


                        // 5e. Remote Deletions 
                        if (toDeleteRemotePaths.length > 0) {
                            await this.apiCall('files/delete_batch', { entries: toDeleteRemotePaths });
                            stats.deleted += toDeleteRemotePaths.length;
                        }

                        // 5f. Local Deletions 
                        for (const id of toDeleteLocal) {
                            await App.storage.deleteArticle(id);
                            stats.deleted++;
                        }

                        // 5g. Sync Deleted Records 
                        const finalDeletedRecords = Array.from(masterDeletedMap.values());
                        if (localDeletedMap.size !== finalDeletedRecords.length || remoteDeletedMap.size !== finalDeletedRecords.length) {
                            await App.storage.saveDeletedRecords(finalDeletedRecords);
                            await this.apiCall('files/upload', JSON.stringify(finalDeletedRecords), { headers: { 'Dropbox-API-Arg': JSON.stringify({ path: `/${App.storage.DELETED_RECORDS_FILENAME}`, mode: 'overwrite' }) } });
                        }

                        // STEP 6: FINALIZE & RELOAD UI
                        const hasChanges = stats.uploaded + stats.downloaded + stats.deleted > 0;

                        if (hasChanges) {
                            // Re-sort and Refresh
                            if (toUploadArticles.length + toDownloadArticles.length > 0) {
                                App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                                await App.util.reconcileCategories();
                                const activeView = App.router.getActiveView();
                                if (['library', 'flashcard', 'stats-dashboard', 'visual-map', 'mindmap', 'category'].includes(activeView)) {
                                    App.router.navigateTo(activeView, App.router.getActiveViewData(), true); // Fix #1 used here
                                }
                            }
                        }

                        // CONSOLIDATED FEEDBACK
                        if (!isSilent) {
                            if (stats.errors > 0) {
                                App.ui.showToast(`Sync Complete: ${stats.uploaded}↑ ${stats.downloaded}↓. ${stats.errors} failed.`, { type: 'warning', duration: 5000 });
                            } else if (hasChanges) {
                                App.ui.showToast(`Sync Complete: ${stats.uploaded}↑ ${stats.downloaded}↓.`, { type: 'success' });
                            } else {
                                App.ui.showToast("Everthing is up to date.", { type: 'success' });
                            }
                        }

                        await App.settings.set('lastSyncTimestamp', new Date().toISOString());

                    } catch (error) {
                        console.error("Sync Error:", error);
                        if (!isSilent) App.ui.showToast(`Sync failed: ${error.message}`, { type: 'error' });
                    } finally {
                        if (syncToastId) App.ui.hideToast(syncToastId);
                        App.state.isSyncing = false;
                        if (document.getElementById('settings-modal-content')) App.ui.showSettingsModal();
                    }
                },

                async downloadFile(remoteMeta) {
                    return await this.apiCall('files/download', null, { headers: { 'Dropbox-API-Arg': JSON.stringify({ path: remoteMeta.path_lower }) }, isDownload: true });
                },
                async listAllFiles() {
                    if (!this.isReady()) return [];
                    try {
                        let result = await this.apiCall('files/list_folder', { path: '' });
                        const allFiles = [...result.entries];
                        while (result.has_more) {
                            result = await this.apiCall('files/list_folder/continue', { cursor: result.cursor });
                            allFiles.push(...result.entries);
                        }
                        return allFiles.filter(f => f['.tag'] === 'file');
                    } catch (err) {
                        if (err.message && err.message.includes("path/not_found")) return [];
                        else throw err;
                    }
                },
                generateCodeVerifier() { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01236789-._~'; let r = ''; const v = new Uint8Array(128); crypto.getRandomValues(v); for (let i = 0; i < v.length; i++)r += c[v[i] % c.length]; return r; },
                async generateCodeChallenge(v) { const d = new TextEncoder().encode(v); const h = await crypto.subtle.digest('SHA-256', d); return btoa(String.fromCharCode.apply(null, new Uint8Array(h))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
                isReady: () => App.state.isDropboxReady,
};
