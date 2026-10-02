// ==========================================================================
// NoteKash - js/features/pdf-tools.js
// Phase 5 Extraction: PDF Viewer + Annotation Engine
//
// ZERO REGRESSION POLICY: This is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// annotationEngine and pdf are tightly coupled — pdf.viewer.open() calls
// App.annotationEngine.init() directly. Both live in this module.
//
// Depends on: App.state, App.ui, App.storage, App.util, App.settings
// via global window.App — available at call-time.
//
// Lazy-load pattern: This module is dynamically imported only when
// App.pdf.triggerImport() or App.pdf.viewer.open() is first called.
// ==========================================================================

export const annotationEngine = {
                state: {
                    context: null,
                    isActive: false,
                    isDrawing: false,
                    tool: 'rect',
                    colors: ['#ef4444', '#f97316', '#f0b70c', '#00ff00', '#22c55e', '#06b6d4', '#0000ff', '#8b5cf6', '#ff00ff', '#8b4513', '#64748b', '#7fffd4'],
                    thicknesses: [1, 2, 3, 5, 6, 8, 10, 12, 15, 22],
                    colorIndex: 0,
                    thicknessIndex: 0,
                    lastPos: { x: 0, y: 0 },
                    currentPath: null,
                },

                init() {
                    this.state = { ...this.state, context: null, isActive: false, isDrawing: false, tool: 'rect', currentPath: null };
                },

                getCanvasAndContext() {
                    const canvas = (this.state.context === 'pdf')
                        ? document.getElementById('annotation-layer')
                        : document.getElementById('annotation-canvas');
                    return { canvas, ctx: canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null };
                },


                toggle(context) {
                    if (this.state.isActive && this.state.context !== context) {
                        this.toggle(this.state.context);
                    }

                    this.state.context = context;
                    this.state.isActive = !this.state.isActive;
                    const isPdf = context === 'pdf';

                    const container = isPdf ? document.getElementById('pdf-viewer-container') : document.querySelector('.focus-mode-overlay');
                    const toolbar = isPdf ? document.getElementById('pdf-annotation-toolbar') : document.getElementById('annotation-toolbar');
                    const toggleBtn = isPdf ? document.getElementById('pdf-annotate-toggle') : container?.querySelector('.annotation-btn');
                    const { canvas } = this.getCanvasAndContext();

                    if (!canvas || !container || !toolbar || !toggleBtn) {
                        this.init();
                        return;
                    }

                    container.classList.toggle('annotation-active', this.state.isActive);
                    toggleBtn.classList.toggle('active', this.state.isActive);
                    toolbar.style.display = this.state.isActive ? 'flex' : 'none';
                    if (isPdf) {
                        toolbar.classList.toggle('hidden', !this.state.isActive);
                        if (this.state.isActive && App.pdf?.viewer?.clampToolbar) {
                            requestAnimationFrame(() => {
                                App.pdf.viewer.clampToolbar();
                            });
                        }
                    }

                    const newCanvas = canvas.cloneNode(true);
                    canvas.parentNode.replaceChild(newCanvas, canvas);

                    if (this.state.isActive) {
                        if (context === 'focus') {
                            const bodyEl = container.querySelector('.focus-mode-body');
                            newCanvas.width = bodyEl.scrollWidth;
                            newCanvas.height = bodyEl.scrollHeight;
                            this.redrawPageAnnotations();
                        } else if (context === 'pdf') {
                            this.redrawPageAnnotations(App.pdf.state.pageNum);
                        }

                        this.updateToolbarUI();
                        newCanvas.addEventListener('mousedown', this.startDrawing.bind(this));
                        newCanvas.addEventListener('mousemove', this.draw.bind(this));
                        newCanvas.addEventListener('mouseup', this.stopDrawing.bind(this));
                        newCanvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
                        newCanvas.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]), { passive: false });
                        newCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); }, { passive: false });
                        newCanvas.addEventListener('touchend', (e) => this.stopDrawing(e.changedTouches[0]));
                    } else {
                        // NEW: Save logic for Stage Mode annotations.
                        if (context === 'focus') {
                            const session = App.state.focusSession;
                            const article = session.articles[session.currentIndex];
                            if (article) {
                                // NEW: Skip saving if in Sigma Article Mode (Temporary annotations)
                                if (session.sigmaMode === 'article') {
                                    // Do not persist to disk.
                                    App.ui.showToast('Sigma Note annotations are temporary.', { type: 'info' });
                                } else {
                                    const articleInState = App.storage.getArticle(article.id);
                                    if (articleInState) {
                                        const currentAnnotationsJSON = JSON.stringify(articleInState.stageAnnotations || {});
                                        const newAnnotationsJSON = JSON.stringify(session.annotations);

                                        if (currentAnnotationsJSON !== newAnnotationsJSON) {
                                            App.storage.updateArticle(article.id, { stageAnnotations: session.annotations });
                                            App.ui.showToast('Stage annotations saved!', { type: 'success' });
                                        }
                                    }
                                }
                            }
                        }
                        this.state.isActive = false;
                        this.state.isDrawing = false;
                        this.state.currentPath = null;
                    }
                },

                updateToolbarUI() {
                    const isPDF = this.state.context === 'pdf';
                    const toolPrefix = isPDF ? 'pdf-tool-' : 'focus-tool-';
                    const colorCyclerId = isPDF ? 'pdf-color-cycler' : 'focus-color-cycler';
                    const thicknessBtnId = isPDF ? 'pdf-thickness-cycler' : 'focus-thickness-cycler';

                    ['pen', 'rect', 'eraser'].forEach(t => {
                        const btn = document.getElementById(`${toolPrefix}${t}`); // FIX: Removed extra space
                        if (btn) btn.classList.toggle('active', this.state.tool === t);
                    });
                    const colorCyclerBtn = document.getElementById(colorCyclerId);
                    if (colorCyclerBtn) {
                        colorCyclerBtn.innerHTML = '<div class="color-cycler-inner"></div>';
                        const inner = colorCyclerBtn.querySelector('.color-cycler-inner');
                        if (inner) {
                            inner.style.backgroundColor = this.state.colors[this.state.colorIndex];
                            const isDark = ['#212529'].includes(this.state.colors[this.state.colorIndex]);
                            inner.style.border = isDark ? '2px solid var(--border-color)' : 'none';
                        }
                    }
                    const thicknessBtn = document.getElementById(thicknessBtnId);
                    if (thicknessBtn) {
                        const r = this.state.thicknesses[this.state.thicknessIndex];
                        const circle = thicknessBtn.querySelector('svg circle');
                        if (circle) circle.setAttribute('r', r * 0.5 + 1);
                    }
                },

                cycleColor() {
                    this.state.colorIndex = (this.state.colorIndex + 1) % this.state.colors.length;
                    this.updateToolbarUI();
                    App.ui.showToast(`Color changed`, { duration: 1500 });
                },
                setTool(tool) { this.state.tool = tool; this.updateToolbarUI(); },
                cycleThickness() {
                    this.state.thicknessIndex = (this.state.thicknessIndex + 1) % this.state.thicknesses.length;
                    this.updateToolbarUI();
                    App.ui.showToast(`Thickness changed`, { duration: 1500 });
                },
                _getDataStore() {
                    if (this.state.context === 'pdf') {
                        return { pageKey: App.pdf.state.pageNum, data: App.pdf.state.annotationsByPage };
                    }
                    if (this.state.context === 'focus') {
                        // NEW: Handle Sigma Article Mode context
                        if (App.state.focusSession && App.state.focusSession.sigmaMode === 'article') {
                            // Use a single page 'article' for all sigma content (scrolling canvas)
                            return { pageKey: 'article', data: App.state.focusSession.sigmaAnnotations || {} };
                        }
                        return { pageKey: App.state.focusSession.currentSlideIndex, data: App.state.focusSession.annotations };
                    }
                    return { pageKey: null, data: null };
                },

                redrawPageAnnotations() {
                    const { canvas, ctx } = this.getCanvasAndContext();
                    const { pageKey, data } = this._getDataStore();
                    if (!ctx || pageKey === null || !data) return;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const annotations = data[pageKey] || [];
                    const scrollTop = this.state.context === 'focus' ? document.querySelector('.focus-mode-body').scrollTop : 0;

                    annotations.forEach(annotation => {
                        ctx.lineWidth = annotation.thickness;
                        ctx.strokeStyle = annotation.color;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';

                        // DPR scaling factor for scroll offset
                        const dprScale = canvas.height / canvas.scrollHeight;

                        if (annotation.type === 'pen' && annotation.points.length > 1) {
                            ctx.beginPath();
                            const p0 = annotation.points[0];
                            const startX = p0[0] * canvas.width;
                            const startY = (p0[1] * canvas.height) - (scrollTop * dprScale);
                            ctx.moveTo(startX, startY);

                            for (let i = 1; i < annotation.points.length; i++) {
                                const p = annotation.points[i];
                                const x = p[0] * canvas.width;
                                const y = (p[1] * canvas.height) - (scrollTop * dprScale);

                                // For the first point, just lineTo
                                if (i === 1) {
                                    ctx.lineTo(x, y);
                                } else {
                                    // Quadratic curve to midpoint
                                    const prevP = annotation.points[i - 1];
                                    const prevX = prevP[0] * canvas.width;
                                    const prevY = (prevP[1] * canvas.height) - (scrollTop * dprScale);

                                    const midX = (prevX + x) / 2;
                                    const midY = (prevY + y) / 2;

                                    ctx.quadraticCurveTo(prevX, prevY, midX, midY);
                                }
                            }
                            // Connect to final point
                            if (annotation.points.length > 2) {
                                const last = annotation.points[annotation.points.length - 1];
                                ctx.lineTo(last[0] * canvas.width, (last[1] * canvas.height) - (scrollTop * dprScale));
                            }
                            ctx.stroke();
                        } else if (annotation.type === 'rect') {
                            const b = annotation.bounds;
                            const x = b.x * canvas.width;
                            const y = (b.y * canvas.height) - (scrollTop * dprScale);
                            const w = b.w * canvas.width;
                            const h = b.h * canvas.height;
                            const radius = Math.min(8 * (canvas.width / 800), w / 4, h / 4); // Scale radius, cap at 25% of size

                            // Use multiply blend mode for classic highlighter effect - text pops through
                            ctx.save();
                            ctx.globalCompositeOperation = 'multiply';

                            // Slightly saturated fill for vibrant highlight
                            ctx.fillStyle = App.util.hexToRgba(annotation.color, 0.28);
                            ctx.beginPath();
                            ctx.roundRect(x, y, w, h, radius);
                            ctx.fill();

                            ctx.restore(); // Return to normal blend mode

                            // Subtle border with soft inner glow effect
                            ctx.strokeStyle = App.util.hexToRgba(annotation.color, 0.4);
                            ctx.lineWidth = 1.2 * (canvas.width / 800); // Scale with canvas
                            ctx.beginPath();
                            ctx.roundRect(x, y, w, h, radius);
                            ctx.stroke();

                        }
                    });
                },


                startDrawing(e) {
                    if (e.target?.closest?.('#pdf-annotation-toolbar') || e.target?.closest?.('.pdf-actions-flyout')) return;
                    const { canvas, ctx } = this.getCanvasAndContext();
                    const { pageKey, data } = this._getDataStore();
                    if (!ctx || !this.state.isActive || pageKey === null || !data) return;

                    this.state.isDrawing = true;
                    const rect = canvas.getBoundingClientRect();

                    // FIX: Conditionally add scroll position ONLY for focus mode.
                    const scrollTop = this.state.context === 'focus' ? document.querySelector('.focus-mode-body').scrollTop : 0;
                    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top + scrollTop };
                    this.state.lastPos = pos;
                    this.state.latestDrawPos = pos; // Track raw pixels for efficient drawing logic

                    if (!data[pageKey]) data[pageKey] = [];

                    if (this.state.tool === 'eraser') {
                        // Eraser logic... (remains unchanged and safe)
                        const annotations = data[pageKey];
                        let deleted = false;
                        for (let i = annotations.length - 1; i >= 0; i--) {
                            const annotation = annotations[i];
                            const relPos = { x: pos.x / rect.width, y: pos.y / rect.height };
                            let inBounds = false;
                            if (annotation.type === 'pen') {
                                const minX = Math.min(...annotation.points.map(p => p[0])), maxX = Math.max(...annotation.points.map(p => p[0])),
                                    minY = Math.min(...annotation.points.map(p => p[1])), maxY = Math.max(...annotation.points.map(p => p[1]));
                                if (relPos.x >= minX && relPos.x <= maxX && relPos.y >= minY && relPos.y <= maxY) inBounds = true;
                            } else if (annotation.type === 'rect') {
                                const b = annotation.bounds;
                                if (relPos.x >= b.x && relPos.x <= b.x + b.w && relPos.y >= b.y && relPos.y <= b.y + b.h) inBounds = true;
                            }
                            if (inBounds) { annotations.splice(i, 1); deleted = true; break; }
                        }
                        if (deleted) this.redrawPageAnnotations();
                        this.state.isDrawing = false;
                    } else {
                        this.state.currentPath = { type: this.state.tool, color: this.state.colors[this.state.colorIndex], thickness: this.state.thicknesses[this.state.thicknessIndex] };
                        if (this.state.tool === 'pen') this.state.currentPath.points = [[pos.x / rect.width, pos.y / rect.height]];
                        else if (this.state.tool === 'rect') this.state.currentPath.bounds = { x: pos.x / rect.width, y: pos.y / rect.height, w: 0, h: 0 };
                    }
                },

                draw(e) {
                    if (!this.state.isDrawing || !this.state.currentPath) return;
                    const { canvas, ctx } = this.getCanvasAndContext();
                    if (!ctx) return;
                    const rect = canvas.getBoundingClientRect();
                    const scrollTop = this.state.context === 'focus' ? document.querySelector('.focus-mode-body').scrollTop : 0;
                    const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top + scrollTop };

                    // FIX: Scale coordinates for High DPI (Retina) displays where canvas.width > rect.width
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    if (this.state.tool === 'pen') {
                        ctx.lineWidth = this.state.currentPath.thickness;
                        ctx.strokeStyle = this.state.currentPath.color;

                        // Last pos relative to canvas (scaled):
                        const lastX = (this.state.latestDrawPos ? this.state.latestDrawPos.x : this.state.lastPos.x) * scaleX;
                        const lastY = (this.state.latestDrawPos ? this.state.latestDrawPos.y : this.state.lastPos.y) * scaleY;
                        const currX = currentPos.x * scaleX;
                        const currY = currentPos.y * scaleY;

                        ctx.beginPath();
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(currX, currY);
                        ctx.stroke();

                        this.state.currentPath.points.push([currentPos.x / rect.width, currentPos.y / rect.height]);
                        this.state.latestDrawPos = { x: currentPos.x, y: currentPos.y }; // Keep visual coords

                    } else if (this.state.tool === 'rect') {
                        // For RECT, we MUST redraw the underlying page to clear the previous frame's rectangle
                        this.redrawPageAnnotations();

                        // Scaling start pos and size to canvas internal pixels
                        const startX = this.state.lastPos.x * scaleX;
                        const startY = this.state.lastPos.y * scaleY;
                        const width = (currentPos.x - this.state.lastPos.x) * scaleX;
                        const height = (currentPos.y - this.state.lastPos.y) * scaleY;

                        // Visual styling for rect draft
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.fillStyle = App.util.hexToRgba(this.state.currentPath.color, 0.35);
                        ctx.beginPath();
                        ctx.rect(startX, startY, width, height);
                        ctx.fill();
                        ctx.globalCompositeOperation = 'source-over';

                        ctx.strokeStyle = this.state.currentPath.color;
                        ctx.lineWidth = this.state.currentPath.thickness;
                        ctx.beginPath();
                        ctx.rect(startX, startY, width, height);
                        ctx.stroke();
                    }
                },

                stopDrawing(e) {
                    if (!this.state.isDrawing || !this.state.currentPath) return;
                    this.state.isDrawing = false;
                    const { canvas } = this.getCanvasAndContext();
                    if (!canvas) return;
                    const { pageKey, data } = this._getDataStore();
                    const rect = canvas.getBoundingClientRect();

                    // FIX: Conditionally add scroll position ONLY for focus mode.
                    const scrollTop = this.state.context === 'focus' ? document.querySelector('.focus-mode-body').scrollTop : 0;
                    const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top + scrollTop };

                    if (this.state.tool === 'rect') {
                        const startX = this.state.lastPos.x / rect.width;
                        const startY = this.state.lastPos.y / rect.height;
                        const endX = currentPos.x / rect.width;
                        const endY = currentPos.y / rect.height;
                        this.state.currentPath.bounds = { x: Math.min(startX, endX), y: Math.min(startY, endY), w: Math.abs(endX - startX), h: Math.abs(endY - startY) };
                    }

                    if ((this.state.currentPath.type === 'pen' && this.state.currentPath.points.length > 1) || (this.state.currentPath.type === 'rect' && this.state.currentPath.bounds.w > 0)) {
                        data[pageKey].push(this.state.currentPath);
                    }
                    this.state.currentPath = null;
                    this.redrawPageAnnotations();
                },

                undo() {
                    const { pageKey, data } = this._getDataStore();
                    if (data && data[pageKey] && data[pageKey].length > 0) {
                        data[pageKey].pop();
                        this.redrawPageAnnotations();
                    }
                },
                clearCurrentPage() {
                    const { pageKey, data } = this._getDataStore();
                    if (data) {
                        data[pageKey] = [];
                        this.redrawPageAnnotations();
                        App.ui.showToast('Annotations for this view cleared.', 'info');
                    }
                },
};

export const pdf = {
                state: {
                    isInitialized: false,
                    pdfDoc: null,
                    currentPageText: null,
                    pageNum: 1,
                    pageRendering: false,
                    pageNumPending: null,
                    scale: 1.5,
                    currentAttachment: null,
                    annotationsByPage: {},
                    isPanMode: false,
                },

                // --- NEW: PDF HIGHLIGHTS SUB-MODULE ---
                highlights: {
                    getBoxId(attachment) {
                        const name = (attachment?.name || 'Document').replace(/\.pdf$/i, '').trim();
                        const slug = App.util.slugify ? App.util.slugify(name) : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        return `pdf-highlights-${slug || 'doc'}`;
                    },

                    appendHighlightToNote(hl) {
                        if (!App.settings.get('pdfSyncHighlightsToNote', true)) return;

                        const articleId = App.pdf.state.articleId || App.state.activeArticleId;
                        const attachment = App.pdf.state.currentAttachment;
                        if (!articleId || !attachment || !hl) return;

                        const article = App.storage.getArticle(articleId);
                        if (!article) return;

                        const boxId = this.getBoxId(attachment);
                        const pdfName = App.util.escapeHtml((attachment.name || 'Document').replace(/\.pdf$/i, ''));

                        const entryHtml = `
                            <div class="pdf-highlight-entry" data-hl-id="${hl.id}" data-page="${hl.page}">
                                <span class="pdf-hl-quote ${hl.class || 'highlight-1'}">${App.util.escapeHtml(hl.text)} <em class="pdf-hl-page-inline" data-page="${hl.page}" title="Jump to page ${hl.page} in PDF">(p-${hl.page})</em></span>
                            </div>
                        `.trim();

                        // 1. Update source content in storage
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(`<div>${article.content || ''}</div>`, 'text/html');
                        const root = doc.body.firstElementChild;
                        let box = root.querySelector(`#${boxId}`);

                        if (box) {
                            let body = box.querySelector('.pdf-highlights-box-body');
                            if (!body) {
                                body = doc.createElement('div');
                                body.className = 'pdf-highlights-box-body';
                                box.appendChild(body);
                            }
                            const temp = doc.createElement('div');
                            temp.innerHTML = entryHtml;
                            body.appendChild(temp.firstElementChild);
                            const count = body.querySelectorAll('.pdf-highlight-entry').length;
                            const countEl = box.querySelector('.pdf-highlights-box-count');
                            if (countEl) countEl.textContent = count === 1 ? '1 snip' : `${count} snips`;
                        } else {
                            const boxHtml = `
                                <div id="${boxId}" class="pdf-highlights-box" data-attachment-id="${attachment.id}" data-pdf-name="${pdfName}">
                                    <div class="pdf-highlights-box-header">
                                        <div class="pdf-highlights-box-title">
                                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                            <span>Highlights: <strong>${pdfName}</strong></span>
                                        </div>
                                        <span class="pdf-highlights-box-count">1 snip</span>
                                    </div>
                                    <div class="pdf-highlights-box-body">
                                        ${entryHtml}
                                    </div>
                                </div>
                            `.trim();
                            const temp = doc.createElement('div');
                            temp.innerHTML = '<p><br></p>' + boxHtml;
                            while (temp.firstChild) root.appendChild(temp.firstChild);
                        }
                        article.content = root.innerHTML;
                        App.storage.updateArticle(article.id, { content: article.content });

                        // 2. Also update live DOM in contentDiv if active article is displayed
                        const contentDiv = document.getElementById('article-content');
                        if (contentDiv && (App.state.activeArticleId === articleId)) {
                            let liveBox = contentDiv.querySelector(`#${boxId}`);
                            if (liveBox) {
                                let liveBody = liveBox.querySelector('.pdf-highlights-box-body');
                                if (!liveBody) {
                                    liveBody = document.createElement('div');
                                    liveBody.className = 'pdf-highlights-box-body';
                                    liveBox.appendChild(liveBody);
                                }
                                liveBody.insertAdjacentHTML('beforeend', entryHtml);
                                const liveCount = liveBody.querySelectorAll('.pdf-highlight-entry').length;
                                const liveCountEl = liveBox.querySelector('.pdf-highlights-box-count');
                                if (liveCountEl) liveCountEl.textContent = liveCount === 1 ? '1 snip' : `${liveCount} snips`;
                            } else {
                                const boxHtml = `
                                    <div id="${boxId}" class="pdf-highlights-box" data-attachment-id="${attachment.id}" data-pdf-name="${pdfName}">
                                        <div class="pdf-highlights-box-header">
                                            <div class="pdf-highlights-box-title">
                                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                <span>Highlights: <strong>${pdfName}</strong></span>
                                            </div>
                                            <span class="pdf-highlights-box-count">1 snip</span>
                                        </div>
                                        <div class="pdf-highlights-box-body">
                                            ${entryHtml}
                                        </div>
                                    </div>
                                `.trim();
                                contentDiv.insertAdjacentHTML('beforeend', '<p><br></p>' + boxHtml);
                            }
                        }
                        App.events.saveArticle({ isAutosave: true });
                    },

                    removeHighlightFromNote(hlId) {
                        const articleId = App.pdf.state.articleId || App.state.activeArticleId;
                        const attachment = App.pdf.state.currentAttachment;
                        if (!articleId || !attachment || !hlId) return;

                        const article = App.storage.getArticle(articleId);
                        if (!article) return;

                        const boxId = this.getBoxId(attachment);

                        // 1. Update source content in storage
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(`<div>${article.content || ''}</div>`, 'text/html');
                        const root = doc.body.firstElementChild;
                        const box = root.querySelector(`#${boxId}`);
                        if (box) {
                            const entry = box.querySelector(`.pdf-highlight-entry[data-hl-id="${hlId}"]`);
                            if (entry) entry.remove();
                            const remaining = box.querySelectorAll('.pdf-highlight-entry').length;
                            if (remaining === 0) {
                                box.remove();
                            } else {
                                const countEl = box.querySelector('.pdf-highlights-box-count');
                                if (countEl) countEl.textContent = remaining === 1 ? '1 snip' : `${remaining} snips`;
                            }
                            article.content = root.innerHTML;
                            App.storage.updateArticle(article.id, { content: article.content });
                        }

                        // 2. Also update live DOM in contentDiv if open
                        const contentDiv = document.getElementById('article-content');
                        if (contentDiv && (App.state.activeArticleId === articleId)) {
                            const liveBox = contentDiv.querySelector(`#${boxId}`);
                            if (liveBox) {
                                const liveEntry = liveBox.querySelector(`.pdf-highlight-entry[data-hl-id="${hlId}"]`);
                                if (liveEntry) liveEntry.remove();
                                const liveRemaining = liveBox.querySelectorAll('.pdf-highlight-entry').length;
                                if (liveRemaining === 0) {
                                    liveBox.remove();
                                } else {
                                    const liveCountEl = liveBox.querySelector('.pdf-highlights-box-count');
                                    if (liveCountEl) liveCountEl.textContent = liveRemaining === 1 ? '1 snip' : `${liveRemaining} snips`;
                                }
                            }
                        }
                        App.events.saveArticle({ isAutosave: true });
                    },

                    updateHighlightClassInNote(hlId, newClass) {
                        const articleId = App.pdf.state.articleId || App.state.activeArticleId;
                        const attachment = App.pdf.state.currentAttachment;
                        if (!articleId || !attachment || !hlId) return;

                        const article = App.storage.getArticle(articleId);
                        if (!article) return;

                        const boxId = this.getBoxId(attachment);

                        // 1. Update source content in storage
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(`<div>${article.content || ''}</div>`, 'text/html');
                        const root = doc.body.firstElementChild;
                        const box = root.querySelector(`#${boxId}`);
                        if (box) {
                            const entry = box.querySelector(`.pdf-highlight-entry[data-hl-id="${hlId}"]`);
                            if (entry) {
                                const quote = entry.querySelector('.pdf-hl-quote');
                                if (quote) quote.className = `pdf-hl-quote ${newClass}`;
                                article.content = root.innerHTML;
                                App.storage.updateArticle(article.id, { content: article.content });
                            }
                        }

                        // 2. Also update live DOM in contentDiv if open
                        const contentDiv = document.getElementById('article-content');
                        if (contentDiv && (App.state.activeArticleId === articleId)) {
                            const liveBox = contentDiv.querySelector(`#${boxId}`);
                            if (liveBox) {
                                const liveEntry = liveBox.querySelector(`.pdf-highlight-entry[data-hl-id="${hlId}"]`);
                                if (liveEntry) {
                                    const liveQuote = liveEntry.querySelector('.pdf-hl-quote');
                                    if (liveQuote) liveQuote.className = `pdf-hl-quote ${newClass}`;
                                }
                            }
                        }
                        App.events.saveArticle({ isAutosave: true });
                    },

                    toggleSyncToNote() {
                        const current = App.settings.get('pdfSyncHighlightsToNote', true);
                        const next = !current;
                        App.settings.set('pdfSyncHighlightsToNote', next);
                        this.updateSyncButton();
                        App.ui.showToast(next ? 'Highlights will save to note' : 'Highlights stay in PDF only', { type: 'info', duration: 1500 });
                    },

                    updateSyncButton() {
                        const btn = document.getElementById('pdf-toggle-sync-btn');
                        if (!btn) return;
                        const isEnabled = App.settings.get('pdfSyncHighlightsToNote', true);
                        btn.innerHTML = `
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            <span style="flex: 1; text-align: left; white-space: nowrap;">Save to Note</span>
                            <span class="pdf-sync-pill ${isEnabled ? 'is-on' : 'is-off'}">${isEnabled ? 'ON' : 'OFF'}</span>
                        `.trim();
                        btn.title = isEnabled ? 'Highlights are automatically added to note (Click to turn OFF)' : 'Highlights stay in PDF only (Click to turn ON)';
                    },

                    add(text, className = 'highlight-1', rects = null) {
                        const article = App.storage.getArticle(App.pdf.state.articleId || App.state.activeArticleId);
                        const currentAttId = App.pdf.state.currentAttachment?.id;
                        if (!article || !currentAttId) return;

                        const attachmentIndex = article.attachments.findIndex(att => att.id === currentAttId);
                        if (attachmentIndex === -1) return;

                        if (!article.attachments[attachmentIndex].highlights) {
                            article.attachments[attachmentIndex].highlights = [];
                        }

                        const pageNum = App.pdf.state.pageNum;

                        const exists = article.attachments[attachmentIndex].highlights.some(h =>
                            h.page === pageNum && h.text === text && h.class === className
                        );

                        if (!exists) {
                            const newHighlight = {
                                id: 'hl_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                                page: pageNum,
                                text: text,
                                class: className,
                                rects: rects || null,
                                createdAt: Date.now()
                            };

                            article.attachments[attachmentIndex].highlights.push(newHighlight);
                            App.pdf.state.currentAttachment = article.attachments[attachmentIndex];

                            // 1. Instant optimistic visual rendering on PDF canvas (0ms perceived latency!)
                            this.renderPageHighlights(pageNum);

                            // 2. Incremental append to note box (if enabled)
                            this.appendHighlightToNote(newHighlight);

                            // 3. Lazy background persistence
                            setTimeout(async () => {
                                try {
                                    await App.storage.updateArticle(article.id, {
                                        attachments: article.attachments
                                    });
                                    App.state.isArticleDirty = true;
                                    await App.events.saveArticle({ isAutosave: true });
                                } catch (e) {
                                    console.error('Failed to background sync highlight:', e);
                                }
                            }, 0);
                        }
                    },

                    renderPageHighlights(pageNum) {
                        const pageContainer = document.querySelector('.pdf-page-container');
                        if (!pageContainer) return;

                        let highlightLayer = pageContainer.querySelector('.pdf-highlight-layer');
                        if (!highlightLayer) {
                            highlightLayer = document.createElement('div');
                            highlightLayer.className = 'pdf-highlight-layer';
                            pageContainer.insertBefore(highlightLayer, pageContainer.querySelector('.textLayer') || null);
                        }
                        highlightLayer.innerHTML = '';

                        const article = App.storage.getArticle(App.pdf.state.articleId || App.state.activeArticleId);
                        const currentAttId = App.pdf.state.currentAttachment?.id;
                        const attachment = article?.attachments?.find(a => a.id === currentAttId) || App.pdf.state.currentAttachment;
                        if (!attachment) return;
                        if (!attachment.highlights) attachment.highlights = [];

                        App.pdf.state.currentAttachment = attachment;

                        const pageHighlights = attachment.highlights.filter(h => h.page === pageNum);
                        if (!pageHighlights.length) return;

                        pageHighlights.forEach((hl, idx) => {
                            if (hl.rects && Array.isArray(hl.rects) && hl.rects.length > 0) {
                                hl.rects.forEach(rect => {
                                    const div = document.createElement('div');
                                    div.className = `pdf-highlight-rect ${hl.class || 'highlight-1'}`;
                                    div.style.left = `${rect.x * 100}%`;
                                    div.style.top = `${rect.y * 100}%`;
                                    div.style.width = `${rect.w * 100}%`;
                                    div.style.height = `${rect.h * 100}%`;
                                    div.title = `"${hl.text}" (Click to edit or remove)`;
                                    div.dataset.hlId = hl.id || idx;
                                    highlightLayer.appendChild(div);
                                });
                            }
                        });
                    },

                    remove(idOrIndex) {
                        const article = App.storage.getArticle(App.pdf.state.articleId || App.state.activeArticleId);
                        const currentAttId = App.pdf.state.currentAttachment?.id;
                        if (!article || !currentAttId) return;

                        const attachmentIndex = article.attachments.findIndex(att => att.id === currentAttId);
                        if (attachmentIndex === -1) return;

                        const list = article.attachments[attachmentIndex].highlights || [];
                        const targetItem = list.find((h, idx) => (h.id ? h.id === idOrIndex : idx === idOrIndex));
                        const targetId = targetItem?.id || idOrIndex;

                        article.attachments[attachmentIndex].highlights = list.filter((h, idx) => (h.id ? h.id !== idOrIndex : idx !== idOrIndex));
                        App.pdf.state.currentAttachment = article.attachments[attachmentIndex];

                        // 1. Instant optimistic visual update on PDF canvas
                        this.renderPageHighlights(App.pdf.state.pageNum);

                        // 2. Incremental removal from note box
                        this.removeHighlightFromNote(targetId);

                        // 3. Lazy background persistence
                        setTimeout(async () => {
                            try {
                                await App.storage.updateArticle(article.id, { attachments: article.attachments });
                                App.state.isArticleDirty = true;
                                await App.events.saveArticle({ isAutosave: true });
                            } catch (e) {
                                console.error('Failed to background sync highlight removal:', e);
                            }
                        }, 0);
                    },

                    apply() {
                        this.renderPageHighlights(App.pdf.state.pageNum);
                    },

                    copyPage() {
                        App.pdf.viewer.toggleMoreMenu(true);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!attachment || !attachment.highlights) {
                            App.ui.showToast('No snips to copy.', 'info');
                            return;
                        }
                        const pageHighlights = attachment.highlights.filter(h => h.page === App.pdf.state.pageNum);
                        if (pageHighlights.length === 0) {
                            App.ui.showToast('No snips on this page to copy.', 'info');
                            return;
                        }

                        const textToCopy = pageHighlights.map(h => `• ${h.text}`).join('\n');
                        navigator.clipboard.writeText(textToCopy);
                        App.ui.showToast(`Copied ${pageHighlights.length} snip(s) to clipboard`, 'success');
                    },

                    copyAll() {
                        App.pdf.viewer.toggleMoreMenu(true);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!attachment || !attachment.highlights || attachment.highlights.length === 0) {
                            App.ui.showToast('No snips in this document to copy.', 'info');
                            return;
                        }

                        const highlightsByPage = attachment.highlights.reduce((acc, h) => {
                            (acc[h.page] = acc[h.page] || []).push(h.text);
                            return acc;
                        }, {});

                        let textToCopy = `Highlights from "${attachment.name.replace(/\.pdf$/i, '')}"\n\n`;
                        Object.keys(highlightsByPage).sort((a, b) => a - b).forEach(pageNum => {
                            textToCopy += `--- Page ${pageNum} ---\n`;
                            textToCopy += highlightsByPage[pageNum].map(text => `• ${text}`).join('\n') + '\n\n';
                        });
                        navigator.clipboard.writeText(textToCopy.trim());
                        App.ui.showToast(`Copied all ${attachment.highlights.length} snip(s) to clipboard`, 'success');
                    },

                    clearPage() {
                        App.pdf.viewer.toggleMoreMenu(true);

                        const article = App.storage.getArticle(App.pdf.state.articleId || App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!article || !attachment || !attachment.highlights) return;

                        const attachmentIndex = article.attachments.findIndex(att => att.id === attachment.id);
                        if (attachmentIndex === -1) return;

                        const highlightsOnPage = article.attachments[attachmentIndex].highlights.filter(h => h.page === App.pdf.state.pageNum);
                        if (highlightsOnPage.length === 0) return;

                        const highlightsToKeep = article.attachments[attachmentIndex].highlights.filter(h => h.page !== App.pdf.state.pageNum);
                        article.attachments[attachmentIndex].highlights = highlightsToKeep;
                        App.pdf.state.currentAttachment = article.attachments[attachmentIndex];

                        // 1. Instant optimistic visual update on canvas
                        this.renderPageHighlights(App.pdf.state.pageNum);

                        // 2. Incremental removal of cleared snips from note box
                        highlightsOnPage.forEach(hl => {
                            this.removeHighlightFromNote(hl.id);
                        });

                        // 3. Lazy background persistence
                        setTimeout(async () => {
                            try {
                                await App.storage.updateArticle(article.id, { attachments: article.attachments });
                                App.state.isArticleDirty = true;
                                await App.events.saveArticle({ isAutosave: true });
                            } catch (e) {
                                console.error('Failed to background sync page snips clear:', e);
                            }
                        }, 0);
                    },
                },


                init() {
                    if (this.state.isInitialized) return;
                    this.state.isInitialized = true;

                    if (window.pdfjsLib) {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                    }
                    const input = document.getElementById('pdf-import-input');
                    if (input) {
                        input.addEventListener('change', (e) => this.handleFileSelect(e));
                    }

                    // Interactive navigation: clicking inline citation (p-X) or AI note page tag jumps directly to that page in the PDF reader
                    document.addEventListener('click', async (e) => {
                        const pageInline = e.target.closest('.pdf-hl-page-inline, .pdf-ai-note-page-tag');
                        if (pageInline) {
                            const pageNum = parseInt(pageInline.dataset.page || (pageInline.textContent.match(/\d+/) || [])[0], 10);
                            if (!pageNum) return;
                            e.preventDefault();
                            e.stopPropagation();

                            const box = pageInline.closest('.pdf-highlights-box, .pdf-ai-notes-box');
                            let attId = box?.dataset?.attachmentId;
                            if (!attId) {
                                const article = App.storage.getArticle(App.pdf.state.articleId || App.state.activeArticleId);
                                const rawPdfName = box?.dataset?.pdfName || box?.querySelector('.pdf-highlights-box-title strong, .pdf-ai-notes-box-title strong')?.textContent?.trim();
                                if (rawPdfName && article?.attachments) {
                                    const att = article.attachments.find(a => (a.name || '').replace(/\.pdf$/i, '').trim().toLowerCase() === rawPdfName.toLowerCase());
                                    if (att) {
                                        attId = att.id;
                                        box.dataset.attachmentId = att.id;
                                    }
                                }
                            }

                            if (App.pdf?.state?.pdfDoc && (!attId || App.pdf.state.currentAttachment?.id === attId)) {
                                if (App.pdf?.viewer?.queueRenderPage) {
                                    App.pdf.viewer.queueRenderPage(pageNum);
                                } else if (App.pdf?.viewer?.renderPage) {
                                    App.pdf.viewer.renderPage(pageNum);
                                }
                            } else if (attId && App.pdf?.viewer?.open) {
                                await App.pdf.viewer.open(attId);
                                if (App.pdf?.viewer?.queueRenderPage) {
                                    App.pdf.viewer.queueRenderPage(pageNum);
                                } else if (App.pdf?.viewer?.renderPage) {
                                    App.pdf.viewer.renderPage(pageNum);
                                }
                            } else if (App.pdf?.state?.pdfDoc) {
                                if (App.pdf?.viewer?.queueRenderPage) {
                                    App.pdf.viewer.queueRenderPage(pageNum);
                                } else if (App.pdf?.viewer?.renderPage) {
                                    App.pdf.viewer.renderPage(pageNum);
                                }
                            }
                        }
                    });
                },

                triggerImport() {
                    if (!this.state.isInitialized) {
                        this.init();
                        this.state.isInitialized = true;
                    }
                    const input = document.getElementById('pdf-import-input');
                    if (input) {
                        input.click();
                    } else {
                        App.ui.showToast("PDF import feature is not properly configured.", "error");
                    }
                },

                async handleFileSelect(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    // --- PDF IMPORT (Existing Logic) ---
                    if (file.type === 'application/pdf') {
                        // LOCK UI: Prevent saving or navigating away while processing
                        App.ui.migrationScreen.show("Attaching PDF...");

                        try {
                            const reader = new FileReader();
                            reader.onload = async (e) => {
                                try {
                                    const safeId = 'pdf_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                                    const fileData = {
                                        id: safeId,
                                        name: file.name,
                                        type: file.type,
                                        data: e.target.result
                                    };
                                    await this.saveAttachment(fileData);
                                    this.insertAttachmentPill(fileData);
                                    App.ui.showToast(`Attached "${file.name}"`, 'success');
                                } catch (err) {
                                    console.error('Error saving attachment:', err);
                                    App.ui.showToast('Error attaching PDF.', 'error');
                                } finally {
                                    App.ui.migrationScreen.hide();
                                }
                            };
                            reader.onerror = () => {
                                App.ui.showToast('Error reading file.', 'error');
                                App.ui.migrationScreen.hide();
                            };
                            reader.readAsDataURL(file);
                        } catch (err) {
                            App.ui.showToast('Error initiating import.', 'error');
                            App.ui.migrationScreen.hide();
                        } finally {
                            event.target.value = null;
                        }
                        return;
                    }

                    // --- TXT IMPORT ---
                    if (file.name.toLowerCase().endsWith('.txt')) {
                        App.ui.migrationScreen.show("Importing Text...");
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const text = e.target.result;
                                // Helper to sanitize and insert text
                                const cleanText = App.util.escapeHtml(text).replace(/\n/g, '<br>');

                                if (document.queryCommandSupported('insertHTML')) {
                                    document.execCommand('insertHTML', false, cleanText);
                                } else {
                                    // Fallback: simple append if command not supported (unlikely)
                                    const article = App.storage.getArticle(App.state.activeArticleId);
                                    if (article) {
                                        article.content += `<div>${cleanText}</div>`;
                                        const contentDiv = document.getElementById('article-content');
                                        if (contentDiv) {
                                            contentDiv.innerHTML = article.content;
                                        }
                                    }
                                }
                                App.ui.showToast(`Imported "${file.name}"`, 'success');
                            } catch (err) {
                                console.error("Text import failed", err);
                                App.ui.showToast("Failed to import text file.", 'error');
                            } finally {
                                App.ui.migrationScreen.hide();
                            }
                        };
                        reader.readAsText(file);
                        event.target.value = null;
                        return;
                    }

                    // --- DOC/DOCX IMPORT (via Mammoth) ---
                    if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
                        if (typeof mammoth === 'undefined' && window.App?.loadLibrary) {
                            try {
                                await App.loadLibrary('mammoth');
                            } catch (e) {
                                console.warn('Could not load Mammoth:', e);
                            }
                        }
                        if (typeof mammoth === 'undefined') {
                            App.ui.showToast('DOCX conversion library not loaded. Please check internet connection.', 'error');
                            event.target.value = null;
                            return;
                        }

                        App.ui.migrationScreen.show("Converting Document...");
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            try {
                                const arrayBuffer = e.target.result;
                                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                                const html = result.value;

                                // Insert the converted HTML
                                if (document.queryCommandSupported('insertHTML')) {
                                    document.execCommand('insertHTML', false, html);
                                } else {
                                    const article = App.storage.getArticle(App.state.activeArticleId);
                                    if (article) {
                                        article.content += `<div>${html}</div>`;
                                        const contentDiv = document.getElementById('article-content');
                                        if (contentDiv) {
                                            contentDiv.innerHTML = article.content;
                                        }
                                    }
                                }

                                App.ui.showToast(`Imported "${file.name}"`, 'success');
                            } catch (err) {
                                console.error("Mammoth conversion failed", err);
                                App.ui.showToast("Failed to convert document.", 'error');
                            } finally {
                                App.ui.migrationScreen.hide();
                            }
                        };
                        reader.readAsArrayBuffer(file);
                        event.target.value = null;
                        return;
                    }

                    // --- UNSUPPORTED TYPE ---
                    App.ui.showToast('Unsupported file type. Please select PDF, TXT, DOC, or DOCX.', 'warning');
                    event.target.value = null;
                },

                insertAttachmentPill(fileData) {
                    const displayName = fileData.name.replace(/\.pdf$/i, '');
                    const isWriteMode = App.state.currentMode === 'write';
                    const pillHTML = `
                    <span class="pdf-attachment-pill" data-pdf-id="${fileData.id}" data-original-name="${App.util.escapeHtml(fileData.name)}">
                        <span class="pdf-attachment-name" contenteditable="${isWriteMode}">${App.util.escapeHtml(displayName)}</span>
                    </span>`;
                    App.util.insertGuardianBlock(pillHTML);
                },

                async saveAttachment(fileData) {
                    const articleId = App.state.activeArticleId;
                    if (!articleId || articleId === 'temp_new_article') {
                        App.ui.showToast("Please save the note before attaching files.", 'warning');
                        return;
                    }
                    const article = App.storage.getArticle(articleId);
                    if (!article) {
                        App.ui.showToast("Could not find the current article to save to.", 'error');
                        return;
                    }
                    const attachments = article.attachments || [];
                    attachments.push(fileData);
                    await App.storage.updateArticle(articleId, { attachments });
                },

                viewer: {
                    toggleMoreMenu(forceClose = false) {
                        const menu = document.getElementById('pdf-more-menu');
                        if (!menu) return;
                        const closeHandler = (event) => {
                            const isClickInside = menu.contains(event.target) || event.target.closest('#pdf-more-btn');
                            if (!isClickInside) { this.toggleMoreMenu(true); }
                        };
                        if (forceClose || menu.classList.contains('visible')) {
                            menu.classList.remove('visible');
                            document.removeEventListener('click', closeHandler, true);
                        } else {
                            if (App.pdf?.highlights?.updateSyncButton) App.pdf.highlights.updateSyncButton();
                            const container = document.getElementById('pdf-viewer-container');
                            const isFullscreen = container?.classList.contains('pdf-fullscreen-active');
                            const menuBtn = document.getElementById('pdf-menu-fullscreen');
                            if (menuBtn) {
                                menuBtn.innerHTML = `${isFullscreen ? App.util.icons.compress : App.util.icons.expand} ${isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}`;
                            }
                            menu.classList.add('visible');
                            setTimeout(() => { document.addEventListener('click', closeHandler, { capture: true, once: true }); }, 0);
                        }
                    },

                    togglePanMode() {
                        const container = document.getElementById('pdf-viewer-container');
                        App.pdf.state.isPanMode = !App.pdf.state.isPanMode;
                        container.classList.toggle('pan-active', App.pdf.state.isPanMode);

                        // Turn off annotation mode if panning to avoid conflict
                        if (App.pdf.state.isPanMode && App.annotationEngine.state.isActive) {
                            App.annotationEngine.toggle('pdf');
                        }

                        const btn = document.getElementById('pdf-pan-toggle');
                        if (btn) {
                            btn.classList.toggle('btn-primary', App.pdf.state.isPanMode);
                            btn.classList.toggle('btn-secondary', !App.pdf.state.isPanMode);
                        }

                        App.ui.showToast(App.pdf.state.isPanMode ? "Pan Mode Enabled: Drag to move" : "Pan Mode Disabled", "info");
                        this.toggleMoreMenu(true);
                    },



                    cycleTextViewTheme() {
                        const themes = App.events.presentation.themes;
                        const currentTheme = App.settings.get('pdfTextViewTheme') || 'default';
                        const currentIndex = themes.indexOf(currentTheme);
                        const nextIndex = (currentIndex + 1) % themes.length;
                        const newTheme = themes[nextIndex];
                        App.settings.set('pdfTextViewTheme', newTheme);
                        this.applyTextViewTheme();
                        const themeName = newTheme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        App.ui.showToast(`${themeName} Theme`, { type: 'info', duration: 1500 });
                    },

                    applyTextViewTheme() {
                        const theme = App.settings.get('pdfTextViewTheme');
                        const container = document.getElementById('pdf-viewer-container');
                        if (!container) return;
                        container.className = container.className.replace(/\bambiance-\S+/g, '').trim();
                        if (theme && theme !== 'default') {
                            container.classList.add(`ambiance-${theme}`);
                        }
                    },

                    applyTextViewHighlight(colorClass = 'highlight-1') {
                        const selection = window.getSelection();
                        let textToHighlight = '';
                        let range = null;

                        if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
                            textToHighlight = selection.toString().trim();
                            range = selection.getRangeAt(0);
                        } else if (this._currentSelection && this._currentSelection.text) {
                            textToHighlight = this._currentSelection.text;
                        }

                        if (!textToHighlight) return;

                        const pageContainer = document.querySelector('.pdf-page-container');
                        let normalizedRects = null;

                        if (range && pageContainer) {
                            const pageRect = pageContainer.getBoundingClientRect();
                            const clientRects = Array.from(range.getClientRects());
                            if (clientRects.length > 0) {
                                // 3.5px breathing room at start & end, 1px top & bottom
                                const padX = 3.5;
                                const padY = 1;
                                normalizedRects = clientRects.map(r => {
                                    const left = Math.max(0, r.left - pageRect.left - padX);
                                    const top = Math.max(0, r.top - pageRect.top - padY);
                                    const right = Math.min(pageRect.width, r.right - pageRect.left + padX);
                                    const bottom = Math.min(pageRect.height, r.bottom - pageRect.top + padY);

                                    return {
                                        x: left / pageRect.width,
                                        y: top / pageRect.height,
                                        w: (right - left) / pageRect.width,
                                        h: (bottom - top) / pageRect.height
                                    };
                                });
                            }
                        } else if (this._currentSelection && this._currentSelection.normalizedRects) {
                            normalizedRects = this._currentSelection.normalizedRects;
                        }

                        App.pdf.highlights.add(textToHighlight, colorClass, normalizedRects);
                        window.getSelection()?.removeAllRanges();
                        this._currentSelection = null;
                        this.hideSelectionPopup();
                    },

                    toggleTextView() {
                        App.ui.showToast('Unified PDF Reader: native text selection is always active.', { type: 'info' });
                    },

                    initSelectionPopup() {
                        let popup = document.getElementById('pdf-selection-popup');
                        if (!popup) {
                            popup = document.createElement('div');
                            popup.id = 'pdf-selection-popup';
                            popup.className = 'pdf-selection-popup';
                            // CRITICAL: Prevent mousedown from clearing text selection in browser!
                            popup.addEventListener('mousedown', (e) => e.preventDefault());
                            popup.innerHTML = `
                                <div class="pdf-swatches">
                                    <button class="pdf-swatch highlight-1" data-class="highlight-1" title="Yellow (2)"></button>
                                    <button class="pdf-swatch highlight-2" data-class="highlight-2" title="Green (3)"></button>
                                    <button class="pdf-swatch highlight-3" data-class="highlight-3" title="Blue (4)"></button>
                                    <button class="pdf-swatch highlight-4" data-class="highlight-4" title="Coral (5)"></button>
                                    <button class="pdf-swatch highlight-5" data-class="highlight-5" title="Purple (6)"></button>
                                    <button class="pdf-swatch highlight-6" data-class="highlight-6" title="Cyan (7)"></button>
                                </div>
                                <div class="popup-divider"></div>
                                <button class="popup-icon-btn btn-ai-explain" id="pdf-popup-explain-btn" title="Explain with NoteKash AI">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                        <path d="M12 2.25c.34 0 .647.205.778.52l1.986 4.767a1.5 1.5 0 00.869.869l4.767 1.986a.857.857 0 010 1.576l-4.767 1.986a1.5 1.5 0 00-.869.869l-1.986 4.767a.857.857 0 01-1.576 0l-1.986-4.767a1.5 1.5 0 00-.869-.869L2.77 12.018a.857.857 0 010-1.576l4.767-1.986a1.5 1.5 0 00.869-.869L10.422 2.77c.131-.315.438-.52.778-.52zM19.5 16.5a.75.75 0 01.696.471l.666 1.666 1.666.666a.75.75 0 010 1.394l-1.666.666-.666 1.666a.75.75 0 01-1.394 0l-.666-1.666-1.666-.666a.75.75 0 010-1.394l1.666-.666.666-1.666a.75.75 0 01.7-.471z"/>
                                    </svg>
                                </button>
                                <button class="popup-icon-btn btn-ai-ask" id="pdf-popup-ai-btn" title="Ask NoteKash AI">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </button>
                                <button class="popup-icon-btn btn-remove-hl" id="pdf-popup-trash-btn" title="Remove Highlight" style="display: none;">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            `;

                            const explainBtn = popup.querySelector('#pdf-popup-explain-btn');
                            if (explainBtn) {
                                explainBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    const sel = window.getSelection();
                                    const text = sel ? sel.toString().trim() : '';
                                    App.pdf.viewer.hideSelectionPopup();
                                    if (text && App.ui.aiMagicModal) {
                                        if (!App.ui.aiMagicModal.state.isOpen || App.ui.aiMagicModal.state.mode !== 'viewer') {
                                            App.ui.aiMagicModal.openAsViewer('pdf');
                                        }
                                        App.ui.aiMagicModal._sendViewerMessage(`Explain this passage in simple, intuitive terms with key takeaways:\n"${text}"`);
                                    }
                                };
                            }

                            const aiBtn = popup.querySelector('#pdf-popup-ai-btn');
                            if (aiBtn) {
                                aiBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    const sel = window.getSelection();
                                    const text = sel ? sel.toString().trim() : '';
                                    App.pdf.viewer.hideSelectionPopup();
                                    if (App.ui.aiMagicModal) {
                                        if (!App.ui.aiMagicModal.state.isOpen || App.ui.aiMagicModal.state.mode !== 'viewer') {
                                            App.ui.aiMagicModal.openAsViewer('pdf');
                                        }
                                        if (text) {
                                            setTimeout(() => {
                                                const input = document.getElementById('ai-viewer-input');
                                                if (input) {
                                                    input.value = `Regarding: "${text.slice(0, 100)}${text.length > 100 ? '...' : ''}" - `;
                                                    input.focus();
                                                    input.selectionStart = input.selectionEnd = input.value.length;
                                                }
                                            }, 100);
                                        }
                                    }
                                };
                            }

                            document.body.appendChild(popup);
                        }

                        if (this._selectionPopupInitialized) return;
                        this._selectionPopupInitialized = true;

                        const handleSelection = () => {
                            const selection = window.getSelection();
                            if (!selection || selection.isCollapsed || !selection.rangeCount) {
                                this.hideSelectionPopup();
                                return;
                            }

                            const text = selection.toString().trim();
                            if (!text || text.length === 0) {
                                this.hideSelectionPopup();
                                return;
                            }

                            const range = selection.getRangeAt(0);
                            const pageContainer = range.commonAncestorContainer.nodeType === 1
                                ? range.commonAncestorContainer.closest('.pdf-page-container')
                                : range.commonAncestorContainer.parentElement?.closest('.pdf-page-container');

                            if (!pageContainer) {
                                this.hideSelectionPopup();
                                return;
                            }

                            const rects = range.getClientRects();
                            if (!rects || rects.length === 0) {
                                this.hideSelectionPopup();
                                return;
                            }

                            const pageRect = pageContainer.getBoundingClientRect();
                            const clientRects = Array.from(rects);
                            const padX = 3.5;
                            const padY = 1;
                            const normalizedRects = clientRects.map(r => {
                                const left = Math.max(0, r.left - pageRect.left - padX);
                                const top = Math.max(0, r.top - pageRect.top - padY);
                                const right = Math.min(pageRect.width, r.right - pageRect.left + padX);
                                const bottom = Math.min(pageRect.height, r.bottom - pageRect.top + padY);

                                return {
                                    x: left / pageRect.width,
                                    y: top / pageRect.height,
                                    w: (right - left) / pageRect.width,
                                    h: (bottom - top) / pageRect.height
                                };
                            });

                            this._currentSelection = {
                                text: text,
                                normalizedRects: normalizedRects,
                                page: App.pdf.state.pageNum
                            };

                            const firstRect = rects[0];
                            const popupEl = document.getElementById('pdf-selection-popup');
                            if (popupEl) {
                                popupEl.style.display = 'flex';
                                const popupWidth = popupEl.offsetWidth || 190;
                                const halfWidth = popupWidth / 2;
                                let targetLeft = firstRect.left + (firstRect.width / 2);
                                targetLeft = Math.max(halfWidth + 12, Math.min(targetLeft, window.innerWidth - halfWidth - 12));

                                popupEl.style.left = `${targetLeft}px`;

                                if (firstRect.top < 65) {
                                    popupEl.style.top = `${firstRect.bottom}px`;
                                    popupEl.classList.add('popup-below');
                                } else {
                                    popupEl.style.top = `${firstRect.top}px`;
                                    popupEl.classList.remove('popup-below');
                                }

                                // Check if active selection overlaps an existing highlight on this page
                                const article = App.storage?.getArticle(App.state?.activeArticleId);
                                const attachment = App.pdf?.state?.currentAttachment;
                                const pageHighlights = (attachment?.highlights || []).filter(h => h.page === App.pdf.state.pageNum);
                                const matchingHl = pageHighlights.find(h => h.text.includes(text) || text.includes(h.text));

                                const trashBtn = popupEl.querySelector('#pdf-popup-trash-btn');
                                if (trashBtn) {
                                    if (matchingHl) {
                                        trashBtn.style.display = 'inline-flex';
                                        trashBtn.onclick = (e) => {
                                            e.stopPropagation();
                                            App.pdf.highlights.remove(matchingHl.id);
                                            window.getSelection()?.removeAllRanges();
                                            this.hideSelectionPopup();
                                        };
                                    } else {
                                        trashBtn.style.display = 'none';
                                    }
                                }

                                // Wire swatches to apply highlight to current selection
                                popupEl.querySelectorAll('.pdf-swatch').forEach(btn => {
                                    btn.onclick = (e) => {
                                        e.stopPropagation();
                                        const cls = btn.dataset.class || 'highlight-1';
                                        App.pdf.viewer.applyTextViewHighlight(cls);
                                    };
                                });
                            }
                        };

                        document.addEventListener('mouseup', handleSelection);
                        document.addEventListener('keyup', (e) => {
                            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                handleSelection();
                            } else if (e.key === 'Escape') {
                                this.hideSelectionPopup();
                            }
                        });

                        document.addEventListener('mousedown', (e) => {
                            const popupEl = document.getElementById('pdf-selection-popup');
                            if (popupEl && !popupEl.contains(e.target) && !e.target.closest('.textLayer')) {
                                this.hideSelectionPopup();
                            }
                        });

                        // Tap on existing highlight to open compact popup (re-color or delete)
                        document.addEventListener('click', (e) => {
                            const sel = window.getSelection();
                            if (sel && !sel.isCollapsed) return;

                            const popupEl = document.getElementById('pdf-selection-popup');
                            if (popupEl && popupEl.contains(e.target)) return;

                            const pageContainer = e.target.closest('.pdf-page-container');
                            if (!pageContainer) return;

                            const pageRect = pageContainer.getBoundingClientRect();
                            const clickX = (e.clientX - pageRect.left) / pageRect.width;
                            const clickY = (e.clientY - pageRect.top) / pageRect.height;

                            const article = App.storage?.getArticle(App.state?.activeArticleId);
                            const attachment = App.pdf?.state?.currentAttachment;
                            if (!article || !attachment || !attachment.highlights) return;

                            const pageHighlights = attachment.highlights.filter(h => h.page === App.pdf.state.pageNum);
                            const hit = pageHighlights.find(h => {
                                return h.rects && Array.isArray(h.rects) && h.rects.some(r =>
                                    clickX >= r.x && clickX <= (r.x + r.w) &&
                                    clickY >= r.y && clickY <= (r.y + r.h)
                                );
                            });

                            if (hit && popupEl) {
                                popupEl.style.display = 'flex';
                                const popupWidth = popupEl.offsetWidth || 190;
                                const halfWidth = popupWidth / 2;
                                let targetLeft = Math.max(halfWidth + 12, Math.min(e.clientX, window.innerWidth - halfWidth - 12));
                                popupEl.style.left = `${targetLeft}px`;

                                if (e.clientY < 65) {
                                    popupEl.style.top = `${e.clientY + 22}px`;
                                    popupEl.classList.add('popup-below');
                                } else {
                                    popupEl.style.top = `${e.clientY - 12}px`;
                                    popupEl.classList.remove('popup-below');
                                }

                                const trashBtn = popupEl.querySelector('#pdf-popup-trash-btn');
                                if (trashBtn) {
                                    trashBtn.style.display = 'inline-flex';
                                    trashBtn.onclick = (ev) => {
                                        ev.stopPropagation();
                                        App.pdf.highlights.remove(hit.id);
                                        App.pdf.viewer.hideSelectionPopup();
                                    };
                                }

                                popupEl.querySelectorAll('.pdf-swatch').forEach(btn => {
                                    btn.onclick = (ev) => {
                                        ev.stopPropagation();
                                        const newClass = btn.dataset.class || 'highlight-1';
                                        hit.class = newClass;
                                        const att = article.attachments.find(a => a.id === attachment.id);
                                        if (att) {
                                            const target = att.highlights.find(h => h.id === hit.id);
                                            if (target) target.class = newClass;

                                            // 1. Instant optimistic visual rendering on PDF canvas
                                            App.pdf.highlights.renderPageHighlights(App.pdf.state.pageNum);
                                            App.pdf.viewer.hideSelectionPopup();

                                            // 2. Lazy background persistence and article note sync
                                            setTimeout(async () => {
                                                try {
                                                    await App.storage.updateArticle(article.id, { attachments: article.attachments });
                                                    App.state.isArticleDirty = true;
                                                    await App.events.saveArticle({ isAutosave: true });
                                                    App.pdf.highlights.updateHighlightClassInNote(hit.id, newClass);
                                                } catch (e) {
                                                    console.error('Failed to background sync highlight color change:', e);
                                                }
                                            }, 0);
                                        } else {
                                            App.pdf.viewer.hideSelectionPopup();
                                        }
                                    };
                                });
                            }
                        });
                    },

                    hideSelectionPopup() {
                        const popup = document.getElementById('pdf-selection-popup');
                        if (popup) popup.style.display = 'none';
                    },

                    async capturePage() {
                        this.toggleMoreMenu(true);
                        const container = document.getElementById('pdf-viewer-container');
                        if (!container) return;

                        if (container.classList.contains('text-view-active')) {
                            // TEXT VIEW: Copy with branded footer
                            const textContentDiv = document.getElementById('pdf-text-view-content');
                            if (!textContentDiv) { App.ui.showToast("Cannot find text content to copy.", "error"); return; }
                            try {
                                const brandedFooter = `\n\n─────────────────────────────\n✨ Made smarter with NoteKash.com\n📝 AI-Powered Notes • 🎴 Smart Flashcards • 🧠 Visual Mind Maps\n─────────────────────────────`;

                                const htmlBranded = textContentDiv.innerHTML + `<div style="margin-top:24px;padding:12px;border-top:1px solid #ddd;color:#666;font-size:12px;text-align:center;">✨ Made smarter with <a href="https://NoteKash.com" style="color:#2563eb;font-weight:600;">NoteKash.com</a> — AI-Powered Notes • Smart Flashcards • Visual Mind Maps</div>`;
                                const textBranded = textContentDiv.innerText + brandedFooter;

                                const htmlBlob = new Blob([htmlBranded], { type: 'text/html' });
                                const textBlob = new Blob([textBranded], { type: 'text/plain' });
                                await navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })]);
                                App.ui.showToast('Text view content copied!', 'success');
                            } catch (err) {
                                console.error('Failed to copy text content:', err);
                                App.ui.showToast('Could not copy text. Check browser permissions.', 'error');
                            }
                        } else {
                            // IMAGE VIEW: Capture with engraved watermark
                            if (typeof htmlToImage === 'undefined' && window.App?.loadLibrary) {
                                try {
                                    await App.loadLibrary('htmlToImage');
                                } catch (e) {
                                    console.warn('Could not load htmlToImage:', e);
                                }
                            }
                            if (typeof htmlToImage === 'undefined') { App.ui.showToast("Capture library is not available.", "error"); return; }

                            const pageContainer = document.querySelector('.pdf-page-container');
                            if (!pageContainer) { App.ui.showToast("Cannot find PDF page to capture.", "error"); return; }

                            const toastId = App.ui.showToast('Capturing page...', { type: 'info', duration: 0 });
                            try {
                                const pixelRatio = window.devicePixelRatio || 2;
                                const originalBlob = await htmlToImage.toBlob(pageContainer, { pixelRatio });

                                // Create canvas to add watermark
                                const img = new Image();
                                const loadPromise = new Promise((resolve, reject) => {
                                    img.onload = resolve;
                                    img.onerror = reject;
                                });
                                img.src = URL.createObjectURL(originalBlob);
                                await loadPromise;

                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                                // Draw original image
                                ctx.drawImage(img, 0, 0);
                                URL.revokeObjectURL(img.src);

                                // Add engraved watermark in top-right
                                const fontSize = Math.max(14, Math.round(canvas.width * 0.018)); // Scale with image
                                const padding = fontSize * 0.8;
                                const watermarkText = 'NoteKash.com';

                                ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                                ctx.textAlign = 'right';
                                ctx.textBaseline = 'top';

                                const x = canvas.width - padding;
                                const y = padding;

                                // 3D Engraved effect: dark shadow (inset), light highlight, semi-transparent main text

                                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                                ctx.fillText(watermarkText, x + 1, y + 1);


                                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                                ctx.fillText(watermarkText, x - 0.5, y - 0.5);


                                ctx.fillStyle = 'rgba(60, 60, 80, 0.45)';
                                ctx.fillText(watermarkText, x, y);

                                const watermarkedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

                                await navigator.clipboard.write([new ClipboardItem({ 'image/png': watermarkedBlob })]);
                                App.ui.hideToast(toastId);
                                App.ui.showToast('Page image with annotations copied to clipboard!', 'success');
                            } catch (err) {
                                App.ui.hideToast(toastId);
                                console.error('Failed to copy PDF page to clipboard:', err);
                                App.ui.showToast('Could not copy image. Check browser permissions.', 'error');
                            }
                        }
                    },

                    makeToolbarDraggable(toolbar, handle) {
                        if (!toolbar || !handle) return;
                        let isDragging = false;
                        let hasDragged = false;
                        let startX = 0, startY = 0;
                        let initialLeft = 0, initialTop = 0;
                        let downTime = 0;
                        let lastTapTime = 0;
                        let lastTapX = 0, lastTapY = 0;

                        const pad = 10;

                        const updateFlyoutDirection = (left, top, width, height) => {
                            toolbar.classList.toggle('flyout-below', top < 65);
                            toolbar.classList.toggle('flyout-left', left + width > window.innerWidth - 140);
                        };

                        const clampToolbar = () => {
                            if (!toolbar || toolbar.style.display === 'none' || toolbar.classList.contains('hidden')) return;

                            const winWidth = window.innerWidth;
                            const winHeight = window.innerHeight;

                            const rect = toolbar.getBoundingClientRect();
                            const width = toolbar.offsetWidth || rect.width || 44;
                            const height = toolbar.offsetHeight || rect.height || 44;

                            const maxLeft = Math.max(pad, winWidth - width - pad);
                            const maxTop = Math.max(pad, winHeight - height - pad);

                            const currentLeft = rect.left;
                            const currentTop = rect.top;

                            const newLeft = Math.max(pad, Math.min(currentLeft, maxLeft));
                            const newTop = Math.max(pad, Math.min(currentTop, maxTop));

                            toolbar.style.transform = 'none';
                            toolbar.style.left = `${newLeft}px`;
                            toolbar.style.top = `${newTop}px`;
                            toolbar.style.right = 'auto';
                            toolbar.style.bottom = 'auto';

                            updateFlyoutDirection(newLeft, newTop, width, height);
                        };

                        App.pdf.viewer.clampToolbar = clampToolbar;

                        const toggleOrientation = (e) => {
                            if (e) {
                                if (e.preventDefault) e.preventDefault();
                                if (e.stopPropagation) e.stopPropagation();
                            }

                            // 1. Calculate focal center before flipping
                            const rect = toolbar.getBoundingClientRect();
                            const centerX = rect.left + rect.width / 2;
                            const centerY = rect.top + rect.height / 2;

                            // 2. Toggle orientation class
                            toolbar.classList.toggle('is-vertical');

                            // 3. Reposition anchored to center
                            const newWidth = toolbar.offsetWidth;
                            const newHeight = toolbar.offsetHeight;

                            let newLeft = centerX - newWidth / 2;
                            let newTop = centerY - newHeight / 2;

                            const maxLeft = Math.max(pad, window.innerWidth - newWidth - pad);
                            const maxTop = Math.max(pad, window.innerHeight - newHeight - pad);

                            newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
                            newTop = Math.max(pad, Math.min(newTop, maxTop));

                            toolbar.style.transform = 'none';
                            toolbar.style.left = `${newLeft}px`;
                            toolbar.style.top = `${newTop}px`;

                            updateFlyoutDirection(newLeft, newTop, newWidth, newHeight);
                        };

                        const onPointerDown = (e) => {
                            if (e.button !== undefined && e.button !== 0) return;
                            // Do not start drag on buttons or controls
                            if (e.target.closest('button') || e.target.closest('.color-cycler-inner')) return;

                            isDragging = true;
                            hasDragged = false;
                            toolbar.classList.add('is-dragging');

                            const rect = toolbar.getBoundingClientRect();
                            initialLeft = rect.left;
                            initialTop = rect.top;

                            toolbar.style.transform = 'none';
                            toolbar.style.left = `${initialLeft}px`;
                            toolbar.style.top = `${initialTop}px`;
                            toolbar.style.right = 'auto';
                            toolbar.style.bottom = 'auto';

                            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                            startX = clientX;
                            startY = clientY;
                            downTime = Date.now();

                            document.addEventListener('mousemove', onPointerMove, { passive: false });
                            document.addEventListener('mouseup', onPointerUp);
                            document.addEventListener('touchmove', onPointerMove, { passive: false });
                            document.addEventListener('touchend', onPointerUp);
                            document.addEventListener('touchcancel', onPointerUp);
                            e.preventDefault();
                        };

                        const onPointerMove = (e) => {
                            if (!isDragging) return;
                            e.preventDefault();
                            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                            const deltaX = clientX - startX;
                            const deltaY = clientY - startY;

                            if (Math.hypot(deltaX, deltaY) > 8) {
                                hasDragged = true;
                            }

                            let newLeft = initialLeft + deltaX;
                            let newTop = initialTop + deltaY;

                            const maxLeft = Math.max(pad, window.innerWidth - toolbar.offsetWidth - pad);
                            const maxTop = Math.max(pad, window.innerHeight - toolbar.offsetHeight - pad);

                            newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
                            newTop = Math.max(pad, Math.min(newTop, maxTop));

                            toolbar.style.left = `${newLeft}px`;
                            toolbar.style.top = `${newTop}px`;
                        };

                        const onPointerUp = (e) => {
                            if (!isDragging) return;
                            isDragging = false;
                            toolbar.classList.remove('is-dragging');
                            document.removeEventListener('mousemove', onPointerMove);
                            document.removeEventListener('mouseup', onPointerUp);
                            document.removeEventListener('touchmove', onPointerMove);
                            document.removeEventListener('touchend', onPointerUp);
                            document.removeEventListener('touchcancel', onPointerUp);

                            clampToolbar();

                            const clientX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX || startX);
                            const clientY = e.changedTouches ? e.changedTouches[0].clientY : (e.clientY || startY);
                            const elapsed = Date.now() - downTime;
                            const moveDist = Math.hypot(clientX - startX, clientY - startY);

                            // Detect deliberate tap (not a drag)
                            if (!hasDragged && moveDist < 8 && elapsed < 350) {
                                const timeSinceLastTap = Date.now() - lastTapTime;
                                const tapDist = Math.hypot(clientX - lastTapX, clientY - lastTapY);

                                if (timeSinceLastTap < 400 && tapDist < 30) {
                                    // DOUBLE TAP CONFIRMED!
                                    toggleOrientation(e);
                                    lastTapTime = 0;
                                } else {
                                    lastTapTime = Date.now();
                                    lastTapX = clientX;
                                    lastTapY = clientY;
                                }
                            }
                        };

                        toolbar.addEventListener('mousedown', onPointerDown);
                        toolbar.addEventListener('touchstart', onPointerDown, { passive: false });

                        if (this._toolbarResizeHandler) {
                            window.removeEventListener('resize', this._toolbarResizeHandler);
                        }
                        this._toolbarResizeHandler = () => clampToolbar();
                        window.addEventListener('resize', this._toolbarResizeHandler);
                    },

                    openWhiteboard() {
                        const pdfLaser = document.getElementById('pdf-laser-canvas');
                        if (pdfLaser && pdfLaser.style.display !== 'none') {
                            App.events.toggleSharedLaser('pdf');
                        }
                        const articleId = App.pdf.state.articleId || App.state.activeArticleId;
                        App.whiteboard.open('end', articleId);
                    },

                    async open(attachmentId) {
                        App.pdf.init(); // Ensure worker is loaded
                        const aiToggle = document.getElementById('ai-magic-toggle');
                        if (aiToggle) aiToggle.style.display = 'flex';
                        this.applyTextViewTheme();
                        App.pdf.state.articleId = App.state.activeArticleId;
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = article?.attachments?.find(att => att.id === attachmentId);
                        if (!attachment) { App.ui.showToast('Could not find attached PDF data.', 'error'); return; }

                        // Load existing annotations into the in-memory store
                        App.pdf.state.currentAttachment = attachment;
                        App.pdf.state.annotationsByPage = attachment.annotations ? JSON.parse(JSON.stringify(attachment.annotations)) : {};

                        App.annotationEngine.init();
                        App.annotationEngine.state.context = 'pdf';

                        document.body.classList.add('pdf-viewer-active');

                        const container = document.getElementById('pdf-viewer-container');
                        container.classList.add('visible');
                        const displayName = attachment.name.replace(/\.pdf$/i, '');

                        container.innerHTML = `
                        <div class="pdf-viewer-header">
                            <div class="pdf-viewer-controls">
                                <button id="pdf-thumbnails-toggle" class="btn-icon" title="Toggle Page Thumbnails (T)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 3h8v8H3V3m0 10h8v8H3v-8m10-10h8v8h-8V3m0 10h8v8h-8v-8z"/></svg></button>
                                <div class="control-divider"></div>
                                <button id="pdf-annotate-toggle" class="btn-icon" title="Toggle Annotation Mode (A)"></button>
                            </div>
                            <span class="pdf-viewer-title" title="${App.util.escapeHtml(attachment.name)}">${App.util.escapeHtml(displayName)}</span>
                            <div class="pdf-viewer-controls">
                                <button id="pdf-prev" class="btn-icon" title="Previous Page (←)"></button>
                                <span class="pdf-page-indicator"><input type="number" id="pdf-page-num" min="1"> &nbsp;of&nbsp; <span id="pdf-page-count"></span></span>
                                <button id="pdf-next" class="btn-icon" title="Next Page (→)"></button>
                                <div class="control-divider"></div>
                                <button id="pdf-fullscreen-toggle" class="btn-icon" title="Toggle Fullscreen (F)" style="display: none;"></button>
                                <div class="pdf-more-menu-container">
                                    <button id="pdf-more-btn" class="btn-icon" title="More Options"></button>
                                    <div id="pdf-more-menu" class="pdf-more-menu"></div>
                                </div>
                                <button id="pdf-close" class="btn-icon" title="Close Viewer (Esc)"></button>
                            </div>
                        </div>
                        <div class="pdf-viewer-main">
                            <div id="pdf-thumbnails-bar"></div>
                            <div class="pdf-viewer-canvas-wrapper">
                                <div class="pdf-page-container"><canvas id="pdf-viewer-canvas"></canvas></div>
                            </div>
                        </div>
                        <div id="pdf-annotation-toolbar" class="pdf-compact-toolbar hidden" style="display: none;">
                            <div class="pdf-toolbar-drag-handle" title="Double-click to toggle vertical/horizontal orientation • Drag to move">
                                <svg class="handle-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                                    <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                                </svg>
                            </div>
                            <button id="pdf-tool-pen" class="btn-icon" title="Pen Tool (P)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg></button>
                            <button id="pdf-tool-rect" class="btn-icon" title="Rectangle Tool (R)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg></button>
                            <button id="pdf-tool-laser" class="btn-icon" title="Laser Pointer (L)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25a8.25 8.25 0 00-8.25 8.25c0 1.721.576 3.322 1.568 4.675A8.25 8.25 0 0012 21.75a8.25 8.25 0 008.25-8.25c0-4.556-3.694-8.25-8.25-8.25z" /></svg></button>
                            <button id="pdf-tool-eraser" class="btn-icon" title="Eraser Tool (E)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                            <div class="control-divider"></div>
                            <button id="pdf-color-cycler" class="btn-icon" style="border-radius: 50%;" title="Cycle Color (C)"></button>
                            <button id="pdf-thickness-cycler" class="btn-icon" title="Cycle Thickness (T)"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></button>
                            <div class="control-divider"></div>
                            <div class="pdf-actions-menu-container" id="pdf-actions-menu-container">
                                <button id="pdf-more-tools-btn" class="btn-icon" title="More Actions (Undo, Clear, Whiteboard)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>
                                    </svg>
                                </button>
                                <div class="pdf-actions-flyout" id="pdf-actions-flyout">
                                    <button id="pdf-undo-btn" class="btn-icon" title="Undo Last Annotation (U)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg></button>
                                    <button id="pdf-clear-page-btn" class="btn-icon" title="Clear Annotations on Page (X)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                                    <button id="pdf-whiteboard-btn" class="btn-icon" title="Whiteboard Notes (W)"><i class="fa-solid fa-pen-nib"></i></button>
                                </div>
                            </div>
                        </div>`;

                        // Re-populate icons and re-attach listeners
                        const header = container.querySelector('.pdf-viewer-header');
                        header.querySelector('#pdf-annotate-toggle').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>`;

                        header.querySelector('#pdf-prev').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
                        header.querySelector('#pdf-next').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
                        header.querySelector('#pdf-fullscreen-toggle').innerHTML = App.util.icons.expand;
                        header.querySelector('#pdf-more-btn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"></line><circle cx="9" cy="6" r="2.5" fill="currentColor"></circle><line x1="4" y1="12" x2="20" y2="12"></line><circle cx="15" cy="12" r="2.5" fill="currentColor"></circle><line x1="4" y1="18" x2="20" y2="18"></line><circle cx="10" cy="18" r="2.5" fill="currentColor"></circle></svg>';
                        header.querySelector('#pdf-close').innerHTML = App.util.icons.close;
                        const isFullscreen = container.classList.contains('pdf-fullscreen-active');
                        const isSyncEnabled = App.settings.get('pdfSyncHighlightsToNote', true);
                        header.querySelector('#pdf-more-menu').innerHTML = `
                        <button id="pdf-menu-ai" class="btn btn-secondary" onclick="App.ui.aiMagicModal.openAsViewer('pdf')"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 6px; color: #a855f7;"><path d="M12 2.25c.34 0 .647.205.778.52l1.986 4.767a1.5 1.5 0 00.869.869l4.767 1.986a.857.857 0 010 1.576l-4.767 1.986a1.5 1.5 0 00-.869.869l-1.986 4.767a.857.857 0 01-1.576 0l-1.986-4.767a1.5 1.5 0 00-.869-.869L2.77 12.018a.857.857 0 010-1.576l4.767-1.986a1.5 1.5 0 00.869-.869L10.422 2.77c.131-.315.438-.52.778-.52zM19.5 16.5a.75.75 0 01.696.471l.666 1.666 1.666.666a.75.75 0 010 1.394l-1.666.666-.666 1.666a.75.75 0 01-1.394 0l-.666-1.666-1.666-.666a.75.75 0 010-1.394l1.666-.666.666-1.666a.75.75 0 01.7-.471z"/></svg> NoteKash AI Magic</button>
                        <button id="pdf-menu-fullscreen" class="btn btn-secondary" onclick="App.pdf.viewer.toggleFullscreen()">${isFullscreen ? App.util.icons.compress : App.util.icons.expand} ${isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
                        <button id="pdf-pan-toggle" class="btn btn-secondary" onclick="App.pdf.viewer.togglePanMode()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg> Pan Mode</button>
                        <div class="control-divider" style="margin: 4px 8px; height: auto; width: calc(100% - 16px);"></div>
                        <button class="btn btn-secondary" id="pdf-zoom-out" title="Zoom Out (-)">${App.util.icons.zoomOut} Zoom Out</button>
                        <button class="btn btn-secondary" id="pdf-zoom-percent" title="Reset Zoom">100%</button>
                        <button class="btn btn-secondary" id="pdf-zoom-in" title="Zoom In (+)">${App.util.icons.zoomIn} Zoom In</button>
                        <div class="control-divider" style="margin: 4px 8px; height: auto; width: calc(100% - 16px);"></div>
                        <button id="pdf-toggle-sync-btn" class="btn btn-secondary" onclick="App.pdf.highlights.toggleSyncToNote()" title="Toggle saving highlights to note">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            <span style="flex: 1; text-align: left; white-space: nowrap;">Save to Note</span>
                            <span class="pdf-sync-pill ${isSyncEnabled ? 'is-on' : 'is-off'}">${isSyncEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                        <button id="pdf-text-theme-toggle" class="btn btn-secondary" onclick="App.pdf.viewer.cycleTextViewTheme()" title="Cycle Ambiance Theme">${App.util.icons.theme} Color Ambiance</button>
                        <button class="btn btn-secondary" onclick="App.pdf.highlights.copyPage()" title="Copy highlights from this page to clipboard">${App.util.icons.copy} Page Snips</button>
                        <button class="btn btn-secondary" onclick="App.pdf.highlights.copyAll()" title="Copy all highlights from this document to clipboard">${App.util.icons.copy} All Snips</button>
                        <button class="btn btn-secondary" onclick="App.pdf.highlights.clearPage()" title="Permanently remove all highlights from this page">${App.util.icons.trash} Clear Snips</button>
                        <div class="control-divider" style="margin: 4px 8px; height: auto; width: calc(100% - 16px);"></div>
                        <button id="pdf-capture-btn" class="btn btn-secondary" onclick="App.pdf.viewer.capturePage()">${App.util.icons.save} Capture</button>
                        <button id="pdf-share" class="btn btn-secondary">${App.util.icons.actions} Share</button>
                    `;

                        document.getElementById('pdf-thumbnails-toggle').onclick = () => App.pdf.viewer.toggleThumbnails();
                        document.getElementById('pdf-prev').onclick = () => App.pdf.viewer.onPrevPage();
                        document.getElementById('pdf-next').onclick = () => App.pdf.viewer.onNextPage();
                        document.getElementById('pdf-page-num').addEventListener('change', (e) => App.pdf.viewer.goToPage(parseInt(e.target.value, 10)));
                        document.getElementById('pdf-zoom-in').onclick = () => App.pdf.viewer.zoom(0.1);
                        document.getElementById('pdf-zoom-out').onclick = () => App.pdf.viewer.zoom(-0.1);
                        document.getElementById('pdf-zoom-percent').onclick = () => App.pdf.viewer.zoom(0);
                        this.initSelectionPopup();
                        document.getElementById('pdf-fullscreen-toggle').onclick = () => App.pdf.viewer.toggleFullscreen();
                        document.getElementById('pdf-more-btn').onclick = () => App.pdf.viewer.toggleMoreMenu();
                        document.getElementById('pdf-close').onclick = () => App.pdf.viewer.close();
                        document.getElementById('pdf-capture-btn').onclick = () => App.pdf.viewer.capturePage();
                        document.getElementById('pdf-text-theme-toggle').onclick = () => App.pdf.viewer.cycleTextViewTheme();

                        if (navigator.share) {
                            document.getElementById('pdf-share').onclick = () => App.pdf.viewer.share();
                        } else {
                            const shareBtn = document.getElementById('pdf-share');
                            if (shareBtn) shareBtn.style.display = 'none';
                        }

                        const deactivatePdfLaser = () => {
                            const pdfLaser = document.getElementById('pdf-laser-canvas');
                            if (pdfLaser && pdfLaser.style.display !== 'none') {
                                App.events.toggleSharedLaser('pdf');
                            }
                        };

                        document.getElementById('pdf-annotate-toggle').onclick = () => App.annotationEngine.toggle('pdf');
                        document.getElementById('pdf-tool-pen').onclick = () => {
                            deactivatePdfLaser();
                            App.annotationEngine.setTool('pen');
                        };
                        document.getElementById('pdf-tool-rect').onclick = () => {
                            deactivatePdfLaser();
                            App.annotationEngine.setTool('rect');
                        };
                        document.getElementById('pdf-tool-laser').onclick = () => {
                            App.events.toggleSharedLaser('pdf');
                        };
                        document.getElementById('pdf-tool-eraser').onclick = () => {
                            deactivatePdfLaser();
                            App.annotationEngine.setTool('eraser');
                        };
                        const actionsMenuContainer = document.getElementById('pdf-actions-menu-container');
                        const moreToolsBtn = document.getElementById('pdf-more-tools-btn');
                        if (moreToolsBtn && actionsMenuContainer) {
                            moreToolsBtn.onclick = (e) => {
                                e.stopPropagation();
                                actionsMenuContainer.classList.toggle('is-open');
                            };
                            if (this._closeFlyoutHandler) {
                                document.removeEventListener('pointerdown', this._closeFlyoutHandler);
                            }
                            this._closeFlyoutHandler = (e) => {
                                if (!actionsMenuContainer.contains(e.target)) {
                                    actionsMenuContainer.classList.remove('is-open');
                                }
                            };
                            document.addEventListener('pointerdown', this._closeFlyoutHandler);
                        }

                        document.getElementById('pdf-color-cycler').onclick = () => App.annotationEngine.cycleColor();
                        document.getElementById('pdf-thickness-cycler').onclick = () => App.annotationEngine.cycleThickness();
                        document.getElementById('pdf-undo-btn').onclick = () => {
                            actionsMenuContainer?.classList.remove('is-open');
                            App.annotationEngine.undo();
                        };
                        const clearPageBtn = document.getElementById('pdf-clear-page-btn') || container.querySelector('button[title*="Clear Annotations"]');
                        if (clearPageBtn) {
                            clearPageBtn.onclick = () => {
                                actionsMenuContainer?.classList.remove('is-open');
                                App.annotationEngine.clearCurrentPage();
                            };
                        }
                        const wbBtn = document.getElementById('pdf-whiteboard-btn');
                        if (wbBtn) {
                            wbBtn.onclick = () => {
                                actionsMenuContainer?.classList.remove('is-open');
                                App.pdf.viewer.openWhiteboard();
                            };
                        }

                        // Initialize Draggable Floating Toolbar
                        const toolbarEl = document.getElementById('pdf-annotation-toolbar');
                        const dragHandle = toolbarEl?.querySelector('.pdf-toolbar-drag-handle');
                        if (toolbarEl && dragHandle) {
                            this.makeToolbarDraggable(toolbarEl, dragHandle);
                        }

                        document.addEventListener('keydown', this.handleKeyDown);
                        document.addEventListener('keyup', this.handleKeyUp);

                        // Attach Pan Listeners
                        const wrapper = container.querySelector('.pdf-viewer-canvas-wrapper');
                        let isDown = false;
                        let startX, startY, scrollLeft, scrollTop;

                        // Zoom on Wheel (Ctrl/Meta + Wheel)
                        wrapper.addEventListener('wheel', (e) => {
                            if (e.ctrlKey || e.metaKey) {
                                e.preventDefault();
                                const delta = e.deltaY || e.deltaX;
                                const zoomStep = Math.abs(delta) < 50 ? 0.05 : 0.1;
                                App.pdf.viewer.zoom(delta < 0 ? zoomStep : -zoomStep);
                            }
                        }, { passive: false });

                        wrapper.addEventListener('mousedown', (e) => {
                            // Enable pan for: PanMode, Middle Click, or Spacebar held
                            const isMiddleClick = e.button === 1;
                            const isSpacePan = App.pdf.state.isSpacePan;

                            if (!App.pdf.state.isPanMode && !isMiddleClick && !isSpacePan) return;

                            if (isMiddleClick || isSpacePan) e.preventDefault();
                            isDown = true;
                            container.classList.add('is-dragging');
                            startX = e.pageX - wrapper.offsetLeft;
                            startY = e.pageY - wrapper.offsetTop;
                            scrollLeft = wrapper.scrollLeft;
                            scrollTop = wrapper.scrollTop;
                        });
                        wrapper.addEventListener('mouseleave', () => {
                            isDown = false;
                            container.classList.remove('is-dragging');
                        });
                        wrapper.addEventListener('mouseup', () => {
                            isDown = false;
                            container.classList.remove('is-dragging');
                        });
                        wrapper.addEventListener('mousemove', (e) => {
                            if (!isDown) return;
                            e.preventDefault();
                            const x = e.pageX - wrapper.offsetLeft;
                            const y = e.pageY - wrapper.offsetTop;
                            const walkX = (x - startX);
                            const walkY = (y - startY);
                            wrapper.scrollLeft = scrollLeft - walkX;
                            wrapper.scrollTop = scrollTop - walkY;
                        });


                        let pdfData;
                        try {
                            pdfData = atob(attachment.data.substring(attachment.data.indexOf(',') + 1));
                        } catch (err) {
                            console.error('Invalid PDF attachment base64 data:', err);
                            App.ui.showToast('Could not read attached PDF data.', 'error');
                            return;
                        }

                        if (typeof pdfjsLib === 'undefined' && window.App?.loadLibrary) {
                            try {
                                await App.loadLibrary('pdfjs');
                            } catch (e) {
                                console.warn('Could not load PDF.js:', e);
                            }
                        }
                        if (typeof pdfjsLib === 'undefined') {
                            App.ui.showToast('PDF Viewer not available offline.', { type: 'error' });
                            return;
                        }

                        if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                        }

                        try {
                            const pdfDoc_ = await pdfjsLib.getDocument({ data: pdfData }).promise;
                            App.pdf.state.pdfDoc = pdfDoc_;
                            const pageCountEl = document.getElementById('pdf-page-count');
                            if (pageCountEl) pageCountEl.textContent = App.pdf.state.pdfDoc.numPages;
                            const pageNumInput = document.getElementById('pdf-page-num');
                            if (pageNumInput) {
                                pageNumInput.max = App.pdf.state.pdfDoc.numPages;
                                pageNumInput.value = attachment.lastPage || 1;
                            }
                            App.pdf.state.pageNum = attachment.lastPage || 1;
                            this.renderPage(App.pdf.state.pageNum);
                            this.buildThumbnails();
                        } catch (err) {
                            console.error('Failed to load PDF document:', err);
                            App.ui.showToast('Could not load PDF document.', 'error');
                        }
                    },

                    async renderTextViewForPage(pageNum) {
                        if (!App.pdf.state.pdfDoc) return;
                        try {
                            const page = await App.pdf.state.pdfDoc.getPage(pageNum);
                            const textContent = await page.getTextContent();

                            const pageText = textContent.items.map(item => item.str).join(' ');
                            App.pdf.state.currentPageText = pageText;

                            this.renderTextViewContent(textContent);
                        } catch (error) {
                            console.error(`Failed to render text view for page ${pageNum}:`, error);
                            App.pdf.state.currentPageText = null; // Clear text on error
                            const textContentDiv = document.getElementById('pdf-text-view-content');
                            if (textContentDiv) textContentDiv.innerHTML = '<p>Error loading text content for this page.</p>';
                        }
                    },

                    async getTextContentForPage(pageNum) {
                        if (!App.pdf.state.pdfDoc || pageNum < 1 || pageNum > App.pdf.state.pdfDoc.numPages) {
                            return "";
                        }
                        try {
                            const page = await App.pdf.state.pdfDoc.getPage(pageNum);
                            await page.getOperatorList();

                            const textContent = await page.getTextContent();
                            return textContent.items.map(item => item.str).join(' ');
                        } catch (error) {
                            console.error(`Failed to get text content for page ${pageNum}:`, error);
                            return "";
                        }
                    },

                    renderPage(num) {
                        // Clear any pending zoom debounce since we are rendering now
                        if (this.zoomTimeout) {
                            clearTimeout(this.zoomTimeout);
                            this.zoomTimeout = null;
                        }

                        App.pdf.state.pageRendering = true;

                        // Update rendered scale state to match the current requested scale
                        App.pdf.state.renderedScale = App.pdf.state.scale;

                        // Reset CSS transform as we are about to render at the correct resolution
                        const pageContainer = document.querySelector('.pdf-page-container');
                        if (pageContainer) {
                            pageContainer.style.transform = 'none';
                            pageContainer.style.transformOrigin = 'top center';
                        }

                        App.pdf.state.pdfDoc.getPage(num).then(page => {
                            const pageContainer = document.querySelector('.pdf-page-container');
                            if (!pageContainer) {
                                App.pdf.state.pageRendering = false;
                                return;
                            }

                            const canvas = document.getElementById('pdf-viewer-canvas');
                            const scale = App.pdf.state.scale;

                            const dpr = window.devicePixelRatio || 1;
                            const outputScale = scale * dpr;

                            const viewport = page.getViewport({ scale: outputScale });
                            const displayViewport = page.getViewport({ scale: scale });

                            // Size container to exact display CSS dimensions
                            pageContainer.style.width = displayViewport.width + 'px';
                            pageContainer.style.height = displayViewport.height + 'px';

                            // 1. Canvas Layer (Sharp Retina)
                            canvas.width = Math.floor(viewport.width);
                            canvas.height = Math.floor(viewport.height);
                            canvas.style.width = displayViewport.width + 'px';
                            canvas.style.height = displayViewport.height + 'px';

                            // 2. Highlights Layer
                            let highlightLayer = pageContainer.querySelector('.pdf-highlight-layer');
                            if (!highlightLayer) {
                                highlightLayer = document.createElement('div');
                                highlightLayer.className = 'pdf-highlight-layer';
                                pageContainer.appendChild(highlightLayer);
                            }
                            highlightLayer.style.width = displayViewport.width + 'px';
                            highlightLayer.style.height = displayViewport.height + 'px';

                            // 3. Text Layer (Native Selection Stencil)
                            let textLayer = pageContainer.querySelector('.textLayer');
                            if (!textLayer) {
                                textLayer = document.createElement('div');
                                textLayer.className = 'textLayer';
                                pageContainer.appendChild(textLayer);
                            }
                            textLayer.innerHTML = '';
                            textLayer.style.width = displayViewport.width + 'px';
                            textLayer.style.height = displayViewport.height + 'px';
                            textLayer.style.setProperty('--scale-factor', displayViewport.scale);

                            // 4. Freehand Annotation Layer
                            let annotationLayer = pageContainer.querySelector('#annotation-layer');
                            if (!annotationLayer) {
                                annotationLayer = document.createElement('canvas');
                                annotationLayer.id = 'annotation-layer';
                                pageContainer.appendChild(annotationLayer);
                            }
                            annotationLayer.width = Math.floor(viewport.width);
                            annotationLayer.height = Math.floor(viewport.height);
                            annotationLayer.style.width = displayViewport.width + 'px';
                            annotationLayer.style.height = displayViewport.height + 'px';

                            // Start Canvas Rendering
                            const renderPromise = page.render({
                                canvasContext: canvas.getContext('2d', { willReadFrequently: true }),
                                viewport: viewport
                            }).promise;

                            // Concurrently render Text Layer
                            page.getTextContent().then(textContent => {
                                const pageText = textContent.items.map(item => item.str).join(' ');
                                App.pdf.state.currentPageText = pageText;

                                if (window.pdfjsLib && pdfjsLib.renderTextLayer) {
                                    pdfjsLib.renderTextLayer({
                                        textContentSource: textContent,
                                        container: textLayer,
                                        viewport: displayViewport,
                                        textDivs: []
                                    });
                                } else if (window.pdfjsLib && pdfjsLib.TextLayer) {
                                    const tl = new pdfjsLib.TextLayer({
                                        textContentSource: textContent,
                                        container: textLayer,
                                        viewport: displayViewport
                                    });
                                    tl.render();
                                }
                            }).catch(err => {
                                console.warn('Text layer render warning:', err);
                            });

                            renderPromise.then(() => {
                                App.pdf.state.pageRendering = false;
                                if (App.ui.aiMagicModal?.updateViewerPage) {
                                    App.ui.aiMagicModal.updateViewerPage(num);
                                }

                                if (App.annotationEngine.state.isActive) {
                                    const newCanvas = annotationLayer.cloneNode(true);
                                    annotationLayer.parentNode.replaceChild(newCanvas, annotationLayer);
                                    newCanvas.addEventListener('mousedown', App.annotationEngine.startDrawing.bind(App.annotationEngine));
                                    newCanvas.addEventListener('mousemove', App.annotationEngine.draw.bind(App.annotationEngine));
                                    newCanvas.addEventListener('mouseup', App.annotationEngine.stopDrawing.bind(App.annotationEngine));
                                    newCanvas.addEventListener('mouseleave', App.annotationEngine.stopDrawing.bind(App.annotationEngine));
                                    newCanvas.addEventListener('touchstart', (e) => App.annotationEngine.startDrawing(e.touches[0]), { passive: false });
                                    newCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); App.annotationEngine.draw(e.touches[0]); }, { passive: false });
                                    newCanvas.addEventListener('touchend', (e) => App.annotationEngine.stopDrawing(e.changedTouches[0]));
                                }

                                // Redraw annotations and highlights
                                App.annotationEngine.redrawPageAnnotations(num);
                                App.pdf.highlights.renderPageHighlights(num);

                                if (App.pdf.state.pageNumPending !== null) {
                                    this.renderPage(App.pdf.state.pageNumPending);
                                    App.pdf.state.pageNumPending = null;
                                }
                            });
                        });

                        document.getElementById('pdf-page-num').value = num;
                        document.getElementById('pdf-zoom-percent').textContent = `${Math.round(App.pdf.state.scale * 100)}%`;
                        const thumbnailsBar = document.getElementById('pdf-thumbnails-bar');
                        if (thumbnailsBar) {
                            thumbnailsBar.querySelectorAll('.pdf-thumbnail.active').forEach(t => t.classList.remove('active'));
                            const activeThumbnail = thumbnailsBar.querySelector(`.pdf-thumbnail[data-page-num="${num}"]`);
                            if (activeThumbnail) {
                                activeThumbnail.classList.add('active');
                                activeThumbnail.scrollIntoView({ block: 'nearest' });
                            }
                        }
                    },

                    renderTextViewContent(textContent) {
                        const textContentDiv = document.getElementById('pdf-text-view-content');
                        if (!textContentDiv) return;

                        this.applyTextViewFontSize();
                        textContentDiv.innerHTML = '';

                        if (!textContent || textContent.items.length === 0) {
                            textContentDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">No text content found on this page.</p>';
                            return;
                        }

                        const items = textContent.items;
                        let finalHtml = '';
                        let lastY = -1;
                        let lastX = -1;
                        const lineThreshold = 5;

                        const sortedItems = [...items].sort((a, b) => {
                            const yA = a.transform[5];
                            const yB = b.transform[5];
                            if (Math.abs(yA - yB) > lineThreshold) return yB - yA;
                            return a.transform[4] - b.transform[4];
                        });

                        sortedItems.forEach(item => {
                            if (!item.str.trim()) return;
                            const currentY = item.transform[5];
                            const currentX = item.transform[4];

                            if (lastY !== -1 && Math.abs(currentY - lastY) > lineThreshold) {
                                finalHtml += '\n';
                            }

                            if (lastY !== -1 && Math.abs(currentY - lastY) <= lineThreshold) {
                                const spaceWidth = 8;
                                const itemWidth = items.find(i => i.transform[4] === lastX)?.width || 0;
                                const gap = currentX - (lastX + itemWidth);
                                if (gap > spaceWidth) {
                                    finalHtml += ' '.repeat(Math.round(gap / spaceWidth));
                                } else {
                                    finalHtml += ' ';
                                }
                            }

                            finalHtml += item.str;
                            lastY = currentY;
                            lastX = currentX;
                        });

                        const pre = document.createElement('pre');
                        pre.textContent = finalHtml.trim();
                        textContentDiv.appendChild(pre);

                        App.pdf.highlights.apply();
                    },

                    queueRenderPage(num) { if (App.pdf.state.pageRendering) { App.pdf.state.pageNumPending = num; } else { this.renderPage(num); } },
                    onPrevPage() { if (App.pdf.state.pageNum <= 1) return; App.pdf.state.pageNum--; this.queueRenderPage(App.pdf.state.pageNum); },
                    onNextPage() { if (App.pdf.state.pageNum >= App.pdf.state.pdfDoc.numPages) return; App.pdf.state.pageNum++; this.queueRenderPage(App.pdf.state.pageNum); },
                    goToPage(num) {
                        const pageNum = Math.max(1, Math.min(App.pdf.state.pdfDoc.numPages, num));
                        if (pageNum !== App.pdf.state.pageNum) { App.pdf.state.pageNum = pageNum; this.queueRenderPage(pageNum); }
                    },
                    zoom(amount) {
                        if (amount === 0) App.pdf.state.scale = 1.0;
                        else App.pdf.state.scale = Math.max(0.5, Math.min(3, App.pdf.state.scale + amount));

                        if (!App.pdf.state.renderedScale) App.pdf.state.renderedScale = 1.0;

                        const cssScale = App.pdf.state.scale / App.pdf.state.renderedScale;
                        const pageContainer = document.querySelector('.pdf-page-container');

                        if (pageContainer) {
                            pageContainer.style.transformOrigin = 'top center';
                            pageContainer.style.transform = `scale(${cssScale})`;
                        }

                        if (this.zoomTimeout) clearTimeout(this.zoomTimeout);

                        this.zoomTimeout = setTimeout(() => {
                            this.queueRenderPage(App.pdf.state.pageNum);
                        }, 200);
                    },
                    toggleFullscreen() {
                        const container = document.getElementById('pdf-viewer-container');
                        if (!container) return;
                        const isNowFullscreen = container.classList.toggle('pdf-fullscreen-active');
                        const menuBtn = document.getElementById('pdf-menu-fullscreen');
                        if (menuBtn) {
                            menuBtn.innerHTML = `${isNowFullscreen ? App.util.icons.compress : App.util.icons.expand} ${isNowFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}`;
                        }
                        requestAnimationFrame(() => {
                            if (App.pdf?.viewer?.clampToolbar) App.pdf.viewer.clampToolbar();
                        });
                    },

                    handleKeyDown: (e) => {
                        if (App.whiteboard?.state?.isOpen) return;
                        if (App.ui.aiMagicModal.state.isOpen && App.ui.aiMagicModal.state.mode === 'viewer') return;

                        // Spacebar for Pan Mode (Hold)
                        if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                            App.pdf.state.isSpacePan = true;
                            const container = document.getElementById('pdf-viewer-container');
                            if (container) container.classList.add('grab-mode');
                        }

                        if (e.target.id === 'pdf-page-num' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
                        const isAnnotationActive = App.annotationEngine.state.isActive && App.annotationEngine.state.context === 'pdf';

                        switch (e.key.toLowerCase()) {
                            case 'escape': App.pdf.viewer.close(); break;
                            case 'arrowleft': if (!isAnnotationActive) App.pdf.viewer.onPrevPage(); break;
                            case 'arrowright': if (!isAnnotationActive) App.pdf.viewer.onNextPage(); break;
                            case '+': case '=': if (!isAnnotationActive) { App.pdf.viewer.zoom(0.1); e.preventDefault(); } break;
                            case '-': if (!isAnnotationActive) { App.pdf.viewer.zoom(-0.1); e.preventDefault(); } break;
                            case 't':
                                if (isAnnotationActive) App.annotationEngine.cycleThickness();
                                else App.pdf.viewer.toggleThumbnails();
                                break;
                            case 'f': App.pdf.viewer.toggleFullscreen(); break;
                            case '2': case '3': case '4': case '5': case '6': case '7': {
                                const sel = window.getSelection();
                                const hasSelection = (sel && !sel.isCollapsed) || (App.pdf.viewer._currentSelection && App.pdf.viewer._currentSelection.text);
                                if (hasSelection) {
                                    e.preventDefault();
                                    const map = { '2': 'highlight-1', '3': 'highlight-2', '4': 'highlight-3', '5': 'highlight-4', '6': 'highlight-5', '7': 'highlight-6' };
                                    App.pdf.viewer.applyTextViewHighlight(map[e.key]);
                                }
                                break;
                            }
                            case 'a': App.annotationEngine.toggle('pdf'); break;
                            case 'l':
                                e.preventDefault();
                                App.events.toggleSharedLaser('pdf');
                                break;
                            case 'w':
                                e.preventDefault();
                                App.pdf.viewer.openWhiteboard();
                                break;
                            case 'p':
                                if (isAnnotationActive) {
                                    const pdfLaser = document.getElementById('pdf-laser-canvas');
                                    if (pdfLaser && pdfLaser.style.display !== 'none') App.events.toggleSharedLaser('pdf');
                                    App.annotationEngine.setTool('pen');
                                    e.preventDefault();
                                }
                                break;
                            case 'r':
                                if (isAnnotationActive) {
                                    const pdfLaser = document.getElementById('pdf-laser-canvas');
                                    if (pdfLaser && pdfLaser.style.display !== 'none') App.events.toggleSharedLaser('pdf');
                                    App.annotationEngine.setTool('rect');
                                    e.preventDefault();
                                }
                                break;
                            case 'e':
                                if (isAnnotationActive) {
                                    const pdfLaser = document.getElementById('pdf-laser-canvas');
                                    if (pdfLaser && pdfLaser.style.display !== 'none') App.events.toggleSharedLaser('pdf');
                                    App.annotationEngine.setTool('eraser');
                                    e.preventDefault();
                                }
                                break;
                            case 'u':
                                if (isAnnotationActive) {
                                    App.annotationEngine.undo();
                                    e.preventDefault();
                                }
                                break;
                            case 'c':
                                if (isAnnotationActive) {
                                    App.annotationEngine.cycleColor();
                                    e.preventDefault();
                                }
                                break;
                            case 'x':
                                if (isAnnotationActive) {
                                    App.annotationEngine.clearCurrentPage();
                                    e.preventDefault();
                                }
                                break;
                        }
                    },

                    handleKeyUp: (e) => {
                        if (e.code === 'Space') {
                            App.pdf.state.isSpacePan = false;
                            const container = document.getElementById('pdf-viewer-container');
                            if (container) container.classList.remove('grab-mode');
                        }
                    },

                    async share() {
                        const attachment = App.pdf.state.currentAttachment; if (!attachment || !navigator.share) return;
                        try {
                            const blob = App.util.dataURLtoBlob(attachment.data); if (!blob) throw new Error("Could not convert PDF data.");
                            const file = new File([blob], attachment.name, { type: blob.type });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: attachment.name }); }
                            else { App.ui.showToast("Cannot share this file type.", 'warning'); }
                        } catch (err) { if (err.name !== 'AbortError') App.ui.showToast("Could not share PDF.", 'error'); }
                    },
                    toggleThumbnails() {
                        const main = document.querySelector('.pdf-viewer-main'); const btn = document.getElementById('pdf-thumbnails-toggle');
                        if (main && btn) { main.classList.toggle('thumbnails-active'); btn.classList.toggle('active'); }
                    },
                    async buildThumbnails() {
                        const bar = document.getElementById('pdf-thumbnails-bar'); const doc = App.pdf.state.pdfDoc; bar.innerHTML = '';
                        for (let i = 1; i <= doc.numPages; i++) {
                            const page = await doc.getPage(i); const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d', { willReadFrequently: true }); const viewport = page.getViewport({ scale: 0.2 });
                            canvas.width = viewport.width; canvas.height = viewport.height;
                            await page.render({ canvasContext: ctx, viewport: viewport, backgroundColor: '#FFFFFF' }).promise;
                            const thumbDiv = document.createElement('div'); thumbDiv.className = 'pdf-thumbnail'; thumbDiv.dataset.pageNum = i; thumbDiv.appendChild(canvas);
                            const pageLabel = document.createElement('span'); pageLabel.textContent = i; thumbDiv.appendChild(pageLabel);
                            thumbDiv.onclick = () => this.goToPage(i); bar.appendChild(thumbDiv);
                        }
                    },

                    async close() {
                        this.hideSelectionPopup();
                        document.getElementById('ai-magic-toggle').style.display = 'none';
                        if (App.ui.aiMagicModal.state.isOpen && App.ui.aiMagicModal.state.mode === 'viewer') App.ui.aiMagicModal.closeViewer();

                        // Clean up laser if active
                        const pdfLaser = document.getElementById('pdf-laser-canvas');
                        if (pdfLaser && pdfLaser.style.display !== 'none') {
                            App.events.toggleSharedLaser('pdf');
                        }

                        if (App.annotationEngine.state.isActive) {
                            App.annotationEngine.toggle('pdf');
                        }


                        let needsSave = this.saveAnnotationsToAttachment();

                        // Save Last Read Page
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (article && attachment) {
                            const att = article.attachments.find(a => a.id === attachment.id);
                            if (att && att.lastPage !== App.pdf.state.pageNum) {
                                att.lastPage = App.pdf.state.pageNum;
                                needsSave = true;
                            }
                        }

                        if (needsSave) {
                            await App.events.saveArticle({ isAutosave: true });
                        }

                        const container = document.getElementById('pdf-viewer-container');
                        container.classList.remove('visible', 'text-view-active', 'annotation-active');
                        container.innerHTML = '';
                        document.removeEventListener('keydown', this.handleKeyDown);
                        document.removeEventListener('keyup', this.handleKeyUp);
                        if (this._toolbarResizeHandler) {
                            window.removeEventListener('resize', this._toolbarResizeHandler);
                            this._toolbarResizeHandler = null;
                        }
                        if (this._closeFlyoutHandler) {
                            document.removeEventListener('pointerdown', this._closeFlyoutHandler);
                            this._closeFlyoutHandler = null;
                        }

                        App.pdf.state.pdfDoc = null;
                        App.pdf.state.pageNum = 1;
                        App.pdf.state.pageRendering = false;
                        App.pdf.state.pageNumPending = null;
                        App.pdf.state.currentAttachment = null;
                        App.pdf.state.annotationsByPage = {};
                        container.classList.remove('pdf-fullscreen-active');
                        document.body.classList.remove('pdf-viewer-active');
                    },

                    saveAnnotationsToAttachment() {
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!article || !attachment) return false;

                        const attachmentIndex = article.attachments.findIndex(att => att.id === attachment.id);
                        if (attachmentIndex === -1) return false;

                        const currentAnnotations = JSON.stringify(article.attachments[attachmentIndex].annotations || {});
                        const newAnnotations = JSON.stringify(App.pdf.state.annotationsByPage);

                        if (currentAnnotations !== newAnnotations) {
                            article.attachments[attachmentIndex].annotations = JSON.parse(newAnnotations);
                            App.state.isArticleDirty = true;
                            App.ui.showToast('PDF annotations saved!', { type: 'success', duration: 1500 });
                            return true;
                        }
                        return false;
                    },
                }
            };
