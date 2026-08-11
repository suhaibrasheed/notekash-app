// ==========================================================================
// NoteKash - js/core/db.js
// Phase 4 Extraction: IndexedDB Handle Persistence + Browser Storage Abstraction
//
// ZERO REGRESSION POLICY: This file is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// BUG FIX (2026-06-21): Added onversionchange handler + InvalidStateError
// recovery. When another tab/page opens a newer DB version, the browser
// fires onversionchange and forcibly closes the connection. Without a handler,
// all subsequent _getStore() calls throw "The database connection is closing".
// Fix: close gracefully in onversionchange, reset _dbPromise so the next call
// reopens the connection cleanly. Also added a retry in _getStore() as a
// safety net for any remaining race conditions.
// ==========================================================================

// --------------------------------------------------------------------------
// App.indexedDB — File System Handle Persistence (small, fast DB)
// Stores directoryHandle across page reloads using IndexedDB key-value store.
// --------------------------------------------------------------------------
export const indexedDBModule = {
    db: null, dbName: 'NoteKashFSDatabase_v2', storeName: 'fileSystemHandles',
    async openDB() {
        return new Promise((resolve, reject) => {
            if (this.db && !this.db.closePending) return resolve(this.db);
            // Reset stale reference
            this.db = null;
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = () => reject("IndexedDB error: " + request.error);
            request.onsuccess = (e) => {
                this.db = e.target.result;
                // Reset if another tab forces a version upgrade
                this.db.onversionchange = () => {
                    this.db.close();
                    this.db = null;
                };
                resolve(this.db);
            };
            request.onupgradeneeded = (e) => e.target.result.createObjectStore(this.storeName);
        });
    },
    async setHandle(key, value) {
        const db = await this.openDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).put(value, key);
        return new Promise(resolve => tx.oncomplete = resolve);
    },
    async getHandle(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const req = db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
};

// --------------------------------------------------------------------------
// App.browserStore — Full IndexedDB Abstraction (articles + files)
// Used when the File System API is unavailable (e.g. mobile browsers).
// Stores full articles and JSON data files (settings.json, todos.json etc.)
// --------------------------------------------------------------------------
export const browserStore = {
    _dbPromise: null,
    _dbName: 'NoteKash_BrowserStore_v1',
    _version: 1,

    _getDB() {
        // This robust pattern ensures indexedDB.open is only called ONCE.
        // All subsequent calls will await the same initial connection promise, preventing deadlocks.
        if (!this._dbPromise) {
            this._dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this._dbName, this._version);

                request.onerror = (event) => {
                    this._dbPromise = null; // Allow retry on next call
                    console.error("IndexedDB connection error:", event.target.error);
                    reject("IndexedDB connection failed. Your browser might be in private mode or have storage disabled.");
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;

                    // KEY FIX: Handle version change events from other tabs/windows.
                    // Without this, the browser forcibly closes the connection and ALL
                    // subsequent db.transaction() calls throw InvalidStateError.
                    db.onversionchange = () => {
                        console.warn('[NoteKash] IndexedDB version change detected. Closing connection gracefully.');
                        db.close();
                        // Reset so the next _getDB() call reopens with the new version.
                        this._dbPromise = null;
                    };

                    resolve(db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('articles')) {
                        db.createObjectStore('articles', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('files')) {
                        db.createObjectStore('files', { keyPath: 'fileName' });
                    }
                };
            });
        }
        return this._dbPromise;
    },

    async _getStore(storeName, mode) {
        const db = await this._getDB();
        try {
            return db.transaction(storeName, mode).objectStore(storeName);
        } catch (err) {
            if (err.name === 'InvalidStateError') {
                // The DB connection was closed (e.g. by onversionchange or browser GC).
                // Reset and reopen once.
                console.warn('[NoteKash] DB connection was closed; reopening…');
                this._dbPromise = null;
                const freshDb = await this._getDB();
                return freshDb.transaction(storeName, mode).objectStore(storeName);
            }
            throw err;
        }
    },

    // --- Article-specific methods ---
    async getArticle(id) {
        const store = await this._getStore('articles', 'readonly');
        return new Promise((resolve) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    },

    async getAllArticles() {
        const store = await this._getStore('articles', 'readonly');
        return new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    },

    async setArticle(article) {
        const store = await this._getStore('articles', 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(article);
            request.onsuccess = resolve;
            request.onerror = (event) => {
                console.error("Error setting article in IndexedDB:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    async deleteArticle(articleId) {
        const store = await this._getStore('articles', 'readwrite');
        return new Promise((resolve) => {
            store.delete(articleId).onsuccess = resolve;
        });
    },

    async getFileMetadata(fileName) {
        const store = await this._getStore('files', 'readonly');
        return new Promise((resolve) => {
            const request = store.get(fileName);
            request.onsuccess = () => resolve(request.result ? { lastModified: request.result.lastModified } : null);
            request.onerror = () => resolve(null);
        });
    },

    // --- File-specific methods (for settings.json, todos.json, etc.) ---
    async getFile(fileName) {
        const store = await this._getStore('files', 'readonly');
        return new Promise((resolve) => {
            const request = store.get(fileName);
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = () => resolve(null);
        });
    },

    async setFile(fileName, data) {
        const store = await this._getStore('files', 'readwrite');
        const wrapper = {
            fileName: fileName,
            data: data,
            lastModified: new Date().toISOString()
        };
        return new Promise((resolve, reject) => {
            const request = store.put(wrapper);
            request.onsuccess = resolve;
            request.onerror = (event) => {
                console.error("Error setting file in IndexedDB:", event.target.error);
                reject(event.target.error);
            };
        });
    },
};
