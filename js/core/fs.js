// ==========================================================================
// NoteKash - js/core/fs.js
// Phase 4 Extraction: File System Abstraction Layer (App.fs)
//
// ZERO REGRESSION POLICY: This file is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// Depends on: App.state.directoryHandle, App.state.storageMode, App.browserStore, App.ui
// These are available on window.App at the time any method here is called.
// ==========================================================================

// --------------------------------------------------------------------------
// App.fs — Dual-mode File System Reader/Writer
//
// In File System mode (directoryHandle exists): reads/writes real JSON files
// from the user's selected local directory.
//
// In Browser mode (no directoryHandle): delegates reads/writes to the
// IndexedDB browserStore abstraction layer.
// --------------------------------------------------------------------------
export const fs = {
    async read(fileName) {
        if (App.state.directoryHandle) {
            try {
                const fileHandle = await App.state.directoryHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                const text = await file.text();
                if (!text) return null;
                return JSON.parse(text);
            } catch (err) {
                if (err.name === 'NotFoundError') return null;
                console.error(`Error reading or parsing ${fileName}:`, err);
                App.ui.showToast(`Could not load ${fileName}. It may be corrupted.`, 'error');
                return null;
            }
        } else {
            return App.browserStore.getFile(fileName);
        }
    },

    async write(fileName, data) {
        if (App.state.directoryHandle) {
            try {
                const fileHandle = await App.state.directoryHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(data, null, 2));
                await writable.close();
            } catch (err) {
                console.error(`Error writing to ${fileName}:`, err);
                App.ui.showToast(`Error saving data to ${fileName}.`, 'error');
            }
        } else {
            await App.browserStore.setFile(fileName, data);
        }
    },

    async getFileMetadata(fileName) {
        if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
            try {
                const fileHandle = await App.state.directoryHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                return { lastModified: new Date(file.lastModified).toISOString() };
            } catch (err) {
                if (err.name === 'NotFoundError') return null; // File doesn't exist
                console.error(`Error getting metadata for ${fileName}:`, err);
                return null;
            }
        } else if (App.state.storageMode === 'browser') {
            return await App.browserStore.getFileMetadata(fileName);
        }
        return null;
    },
};
