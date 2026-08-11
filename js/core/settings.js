// ==========================================================================
// NoteKash - js/core/settings.js
// Phase 4 Extraction: Settings Management (App.settings)
//
// ZERO REGRESSION POLICY: This file is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// Depends on: App.fs, App.state, App.util.getCategoryColorCount
// These are available on window.App at the time any method here is called.
// ==========================================================================

// --------------------------------------------------------------------------
// App.settings — Persistent User Preferences Manager
//
// Manages default settings, merges with user-saved settings from disk,
// and provides synchronous get/set operations backed by async file I/O.
// --------------------------------------------------------------------------
export const settings = {
    defaults: {
        lastStorageMode: null,
        hasSetViewPreference: false,
        mobileViewEnabled: false,
        userCategories: null,
        categoryLayout: 'list',
        categoryHighlightsVisible: true,
        libraryTitle: 'My Library',
        categoryNameStyle: 'full',
        focusModeFontSize: '1.1rem',
        theme: 'sepia',
        readerTheme: 'default',
        uiOpacity: 1.0,
        fontFamily: 'Georgia, serif',
        fontSize: '1.15rem',
        lineHeight: '1.7',
        backgroundImage: null,
        customThemeBase: 'light',
        flashcardSortBy: 'sm2',
        tagSortBy: 'alpha',
        colorCycleIndex: 0,
        showTagsOnTiles: true,
        categoryRenames: {},
        enableDropboxSync: false,
        dropboxToken: null,
        dropboxClientId: null,
        lastSyncTimestamp: null,
        pomodoroWork: 25,
        pomodoroBreak: 5,
        hubSoundEnabled: true,
        studySessionSize: 25,
        studyCardFontSize: '1.6rem',
        jpegQuality: 0.9,
        imageFormat: 'jpeg', // 'jpeg' for compression, 'png' for reliability
        ocrThreshold: 128,
        proPresenterMode: 'living-cell', // Options: living-cell | tidal-waves | deep-breath | neon-pulse | aurora-flow
        audioBitrate: 32000,
        pdfTextViewFontSize: '1.1rem',
        pdfTextViewTheme: 'default',
        intervalModifier: 1.0,
        showReadModeWordCount: false, // Default is off
    },

    _saveTimer: null,

    loadFromLocalStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem('notekash_settings');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        App.state.settings = { ...this.defaults, ...App.state.settings, ...parsed };
                    }
                }
            }
        } catch (e) {
            console.warn("Could not read settings from localStorage:", e);
        }
    },

    syncToLocalStorage() {
        try {
            if (typeof localStorage !== 'undefined' && App.state.settings) {
                localStorage.setItem('notekash_settings', JSON.stringify(App.state.settings));
            }
        } catch (e) {
            console.warn("Could not sync settings to localStorage:", e);
        }
    },

    async load() {
        // 1. Instant baseline hydration from localStorage
        this.loadFromLocalStorage();

        // 2. If storage backend is ready (directoryHandle exists or browser mode is active), load settings.json
        if (App.state.directoryHandle || App.state.storageMode === 'browser') {
            const savedSettings = await App.fs.read('settings.json');
            if (savedSettings && typeof savedSettings === 'object') {
                App.state.settings = { ...this.defaults, ...App.state.settings, ...savedSettings };
                this.syncToLocalStorage();
            }
        }

        if (!App.state.settings) {
            App.state.settings = { ...this.defaults };
            this.syncToLocalStorage();
        }

        // 3. User categories initialization/migration
        if (!App.state.settings.userCategories || !Array.isArray(App.state.settings.userCategories) || App.state.settings.userCategories.length === 0 || typeof App.state.settings.userCategories[0] === 'string' || !App.state.settings.userCategories[0].name) {
            const defaultCount = (App.util && typeof App.util.getCategoryColorCount === 'function') ? App.util.getCategoryColorCount() : 12;
            const rawCategories = App.state.settings.userCategories;
            const categoryList = (Array.isArray(rawCategories) && rawCategories.length > 0)
                ? rawCategories
                : (App.config?.categories || ['General', 'Inbox', 'Study', 'Personal', 'Work']);
            const migratedCategories = categoryList.map((item, index) => {
                const catName = typeof item === 'string' ? item : (item?.name || `Category ${index + 1}`);
                const colorIdx = typeof item === 'object' && typeof item?.colorIndex === 'number' ? item.colorIndex : index % defaultCount;
                return {
                    name: catName,
                    displayName: item?.displayName || catName,
                    colorIndex: colorIdx,
                    isDefault: catName === 'General'
                };
            });

            await this.set('userCategories', migratedCategories);
        }
        App.state.dropboxToken = App.state.settings.dropboxToken;
    },

    async save() {
        this.syncToLocalStorage(); // Always synchronous — localStorage is always current
        // Debounce expensive FS/IDB writes. Batches rapid calls (e.g. during init)
        // into a single write. localStorage above ensures no data is lost if the
        // tab closes within the debounce window.
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(async () => {
            await App.fs.write('settings.json', App.state.settings);
            if (App.browserStore && typeof App.browserStore.setFile === 'function') {
                try {
                    await App.browserStore.setFile('settings.json', App.state.settings);
                } catch (e) {
                    console.error('Settings: IndexedDB write failed. Settings may not persist across reloads.', e);
                    if (App.ui && typeof App.ui.showToast === 'function') {
                        App.ui.showToast('⚠️ Settings could not be saved (storage full?)', { type: 'warning', duration: 4000 });
                    }
                }
            }
        }, 250);
    },

    get(key) {
        if (!App.state.settings) {
            this.loadFromLocalStorage();
        }
        if (!App.state.settings) {
            App.state.settings = { ...this.defaults };
        }
        return App.state.settings[key] !== undefined ? App.state.settings[key] : this.defaults[key];
    },

    async set(key, value) {
        if (!App.state.settings) {
            this.loadFromLocalStorage();
        }
        if (!App.state.settings) {
            App.state.settings = { ...this.defaults };
        }
        App.state.settings[key] = value;
        this.syncToLocalStorage();
        await this.save();
    }
};
