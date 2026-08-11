# NoteKash Modular JS Smoke Test Checklist

Use `golden/NoteKash-v8.248c.html` as the behavior reference.

## Startup
- Fresh profile opens welcome screen.
- Returning folder-storage user opens library.
- Returning browser-storage user opens library.
- No duplicate boot, no duplicate global listeners, no forced update reload.

## Storage
- Folder picker grants permission and loads `_index.json`.
- Missing or corrupt `_index.json` fails safely.
- Article open loads full content on demand.
- Create, edit, delete update article JSON and `_index.json`.
- Browser storage create, edit, delete still works.

## Large Library
- 100 notes.
- 1,000 notes.
- Image-heavy notes.
- Library cards render in batches.
- No full-note hydration during startup.

## Features
- Article read/write mode.
- Flashcards, study, quiz.
- Visual map and mind map.
- Whiteboard create/edit/save.
- Global search and command palette.
- PDF/DOCX/OCR/export/audio tools.
- Dropbox sync only runs online.
- Settings, themes, mobile layout.

## PWA / Offline / Update
- Install PWA.
- Reload offline.
- Offline indicator appears.
- Critical local assets are available offline.
- Update prompt appears after service worker version change.
- Update does not force reload while editing.
