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
                    if (isPdf) toolbar.classList.toggle('hidden', !this.state.isActive);

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
                    currentAttachment: null,
                    annotationsByPage: {},
                    isPanMode: false,
                },

                // --- NEW: PDF HIGHLIGHTS SUB-MODULE ---
                highlights: {
                    add(text, className) {
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!article || !attachment) return;

                        const attachmentIndex = article.attachments.findIndex(att => att.id === attachment.id);
                        if (attachmentIndex === -1) return;

                        if (!article.attachments[attachmentIndex].highlights) {
                            article.attachments[attachmentIndex].highlights = [];
                        }

                        const exists = article.attachments[attachmentIndex].highlights.some(h =>
                            h.page === App.pdf.state.pageNum && h.text === text && h.class === className
                        );

                        if (!exists) {
                            article.attachments[attachmentIndex].highlights.push({
                                page: App.pdf.state.pageNum,
                                text: text,
                                class: className
                            });
                            App.state.isArticleDirty = true; // Mark the main article for autosave
                        }
                    },

                    apply() {
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        const textContentDiv = document.getElementById('pdf-text-view-content');
                        const preElement = textContentDiv ? textContentDiv.querySelector('pre') : null;

                        if (!article || !attachment || !preElement || !attachment.highlights) return;

                        const pageHighlights = attachment.highlights.filter(h => h.page === App.pdf.state.pageNum);
                        if (pageHighlights.length === 0) return;

                        let content = preElement.textContent;

                        pageHighlights.forEach(highlight => {
                            if (!highlight.text) return;
                            const regex = new RegExp(App.util.escapeRegex(highlight.text), 'g');
                            const escapedHighlightText = App.util.escapeHtml(highlight.text);
                            content = content.replace(regex, `< span class="${highlight.class}" > ${escapedHighlightText}</span > `);
                        });

                        preElement.innerHTML = content;
                    },

                    async copyPage() {
                        App.pdf.viewer.toggleMoreMenu(true);
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!article || !attachment || !attachment.highlights) {
                            App.ui.showToast('No snips to copy.', 'info');
                            return;
                        }
                        const pageHighlights = attachment.highlights.filter(h => h.page === App.pdf.state.pageNum);
                        if (pageHighlights.length === 0) {
                            App.ui.showToast('No snips on this page to copy.', 'info');
                            return;
                        }

                        const textToCopy = pageHighlights.map(h => `• ${h.text} `).join('\n');
                        navigator.clipboard.writeText(textToCopy);
                        App.ui.showToast(`Copied ${pageHighlights.length} snip(s) from page ${App.pdf.state.pageNum}.`, 'success');

                        try {
                            const pdfName = App.util.escapeHtml(attachment.name.replace(/\.pdf$/i, ''));
                            const pageNum = App.pdf.state.pageNum;
                            const highlightsHtml = pageHighlights.map(h => `< li > ${App.util.escapeHtml(h.text)}</li > `).join('');
                            const snippetHtml = `< blockquote ><ul>${highlightsHtml}</ul><footer><small>— Snips extracted from page ${pageNum} of "${pdfName}"</small></footer></blockquote > <p><br></p>`;
                            const updatedContent = article.content + snippetHtml;

                            const result = await App.storage.updateArticle(article.id, { content: updatedContent });

                            if (result.success) {
                                App.ui.showToast('Page snips also added to your note!', 'success');
                            } else {
                                throw new Error('Failed to update the article.');
                            }
                        } catch (e) {
                            console.error('Failed to append page snips to article:', e);
                            App.ui.showToast('Could not add snips to note.', 'error');
                        }
                    },

                    async copyAll() {
                        App.pdf.viewer.toggleMoreMenu(true);
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!article || !attachment || !attachment.highlights || attachment.highlights.length === 0) {
                            App.ui.showToast('No snips in this document to copy.', 'info');
                            return;
                        }

                        const highlightsByPage = attachment.highlights.reduce((acc, h) => {
                            (acc[h.page] = acc[h.page] || []).push(h.text);
                            return acc;
                        }, {});

                        let textToCopy = `Highlights from "${attachment.name.replace(/\.pdf$/i, '')}"\n\n`;
                        Object.keys(highlightsByPage).sort((a, b) => a - b).forEach(pageNum => {
                            textToCopy += `-- - Page ${pageNum} ---\n`;
                            textToCopy += highlightsByPage[pageNum].map(text => `• ${text} `).join('\n') + '\n\n';
                        });
                        navigator.clipboard.writeText(textToCopy.trim());
                        App.ui.showToast(`Copied all ${attachment.highlights.length} snip(s).`, 'success');

                        try {
                            const pdfName = App.util.escapeHtml(attachment.name.replace(/\.pdf$/i, ''));
                            let allHighlightsHtml = '';
                            Object.keys(highlightsByPage).sort((a, b) => a - b).forEach(pageNum => {
                                allHighlightsHtml += `< p > <b>Page ${pageNum}:</b></p > <ul>`;
                                allHighlightsHtml += highlightsByPage[pageNum].map(text => `<li>${App.util.escapeHtml(text)}</li>`).join('');
                                allHighlightsHtml += '</ul>';
                            });

                            const snippetHtml = `<blockquote>${allHighlightsHtml}<footer><small>— All snips extracted from "${pdfName}"</small></footer></blockquote><p><br></p>`;
                            const updatedContent = article.content + snippetHtml;

                            const result = await App.storage.updateArticle(article.id, { content: updatedContent });

                            if (result.success) {
                                App.ui.showToast('All snips also added to your note!', 'success');
                            } else {
                                throw new Error('Failed to update the article.');
                            }
                        } catch (e) {
                            console.error('Failed to append all snips to article:', e);
                            App.ui.showToast('Could not add all snips to note.', 'error');
                        }
                    },

                    async clearPage() {
                        App.pdf.viewer.toggleMoreMenu(true); // Close the menu immediately

                        const article = App.storage.getArticle(App.state.activeArticleId);
                        const attachment = App.pdf.state.currentAttachment;
                        if (!article || !attachment || !attachment.highlights) {
                            App.ui.showToast('No highlights to clear on this page.', 'info');
                            return;
                        }

                        const attachmentIndex = article.attachments.findIndex(att => att.id === attachment.id);
                        if (attachmentIndex === -1) return;

                        const highlightsOnPage = article.attachments[attachmentIndex].highlights.some(h => h.page === App.pdf.state.pageNum);
                        if (!highlightsOnPage) {
                            App.ui.showToast('No highlights to clear on this page.', 'info');
                            return;
                        }
                        const highlightsToKeep = article.attachments[attachmentIndex].highlights.filter(h => h.page !== App.pdf.state.pageNum);

                        article.attachments[attachmentIndex].highlights = highlightsToKeep;

                        await App.events.saveArticle({ isAutosave: true });
                        await App.pdf.viewer.renderTextViewForPage(App.pdf.state.pageNum);
                        App.ui.showToast(`Page Snips Cleared`, 'success');
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

                    cycleTextViewFontSize() {
                        const fontSizes = ['0.9rem', '1.1rem', '1.3rem', '1.5rem', '1.7rem', '1.8rem', '2rem', '2.2rem', '2.5rem', '2.8rem', '3rem'];
                        const currentSize = App.settings.get('pdfTextViewFontSize') || '1.1rem';
                        const currentIndex = fontSizes.indexOf(currentSize);
                        const nextIndex = (currentIndex + 1) % fontSizes.length;
                        const newSize = fontSizes[nextIndex];
                        App.settings.set('pdfTextViewFontSize', newSize);
                        this.applyTextViewFontSize();
                        App.ui.showToast(`Font size: ${newSize}`, { duration: 1500 });
                    },

                    applyTextViewFontSize() {
                        const size = App.settings.get('pdfTextViewFontSize');
                        const textContentDiv = document.getElementById('pdf-text-view-content');
                        if (textContentDiv) { textContentDiv.style.fontSize = size; }
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

                    applyTextViewHighlight() {
                        const selection = window.getSelection();
                        if (!selection || selection.isCollapsed) {
                            App.ui.showToast('Please select text to highlight.', 'warning');
                            return;
                        }
                        const textToHighlight = selection.toString();
                        if (!textToHighlight) return;

                        App.pdf.highlights.add(textToHighlight, 'highlight-1');
                        this.renderTextViewForPage(App.pdf.state.pageNum);
                        selection.removeAllRanges();
                    },

                    toggleTextView() {
                        const container = document.getElementById('pdf-viewer-container');
                        const toggleBtn = document.getElementById('pdf-text-view-toggle');
                        if (!container || !toggleBtn) return;

                        if (App.annotationEngine.state.isActive) {
                            App.annotationEngine.toggle('pdf');
                        }

                        const isActive = container.classList.toggle('text-view-active');

                        if (isActive) {
                            toggleBtn.innerHTML = App.util.icons.pdf;
                            toggleBtn.title = 'Switch to PDF View';
                            toggleBtn.classList.add('active');
                            App.ui.showToast('Text View Enabled', { type: 'info' });
                        } else {
                            toggleBtn.innerHTML = App.util.icons.textView;
                            toggleBtn.title = 'Switch to Text View';
                            toggleBtn.classList.remove('active');
                            App.ui.showToast('PDF View Enabled', { type: 'info' });
                        }
                        this.queueRenderPage(App.pdf.state.pageNum);

                        this.toggleMoreMenu(true);
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

                    async open(attachmentId) {
                        App.pdf.init(); // Ensure worker is loaded
                        const aiToggle = document.getElementById('ai-magic-toggle');
                        if (aiToggle) aiToggle.style.display = 'flex';
                        this.applyTextViewTheme();
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

                                <div id="pdf-annotation-toolbar" class="pdf-viewer-controls hidden">
                                    <div class="control-divider"></div>
                                    <button id="pdf-tool-rect" class="btn-icon" title="Rectangle Tool (R)"></button>
                                    <button id="pdf-tool-pen" class="btn-icon" title="Pen Tool (P)"></button>
                                    
                                    <button id="pdf-tool-eraser" class="btn-icon" title="Eraser Tool (E)"></button>
                                    <div class="control-divider"></div>
                                    <button id="pdf-color-cycler" class="btn-icon" style="border-radius: 50%;" title="Cycle Color (C)"></button>
                                    <button id="pdf-thickness-cycler" class="btn-icon" title="Cycle Thickness (T)"></button>
                                    <div class="control-divider"></div>
                                    <button id="pdf-undo-btn" class="btn-icon" title="Undo Last Annotation (U)">${App.util.icons.reset}</button>
                                    <button class="btn-icon" title="Clear Annotations on Page">${App.util.icons.trash}</button>
                                </div>
                            </div>
                            <span class="pdf-viewer-title" title="${App.util.escapeHtml(attachment.name)}">${App.util.escapeHtml(displayName)}</span>
                            <div class="pdf-viewer-controls">
                                <button id="pdf-prev" class="btn-icon" title="Previous Page (←)"></button>
                                <span class="pdf-page-indicator"><input type="number" id="pdf-page-num" min="1"> &nbsp;of&nbsp; <span id="pdf-page-count"></span></span>
                                <button id="pdf-next" class="btn-icon" title="Next Page (→)"></button>
                                <div class="control-divider"></div>
                                <button id="pdf-text-highlight-btn" class="btn-icon text-view-only-btn"></button>
                                <button id="pdf-text-view-toggle" class="btn-icon" title="Switch to Text View"></button>
                                <button id="pdf-fullscreen-toggle" class="btn-icon" title="Toggle Fullscreen (F)"></button>
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
                                <div id="pdf-text-view-content" class="ui-card"></div>
                            </div>
                        </div>`;

                        // Re-populate icons and re-attach listeners
                        const header = container.querySelector('.pdf-viewer-header');
                        header.querySelector('#pdf-annotate-toggle').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>`;
                        header.querySelector('#pdf-tool-pen').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>`;
                        header.querySelector('#pdf-tool-rect').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>`;
                        header.querySelector('#pdf-tool-eraser').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
                        header.querySelector('#pdf-thickness-cycler').innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`;

                        header.querySelector('#pdf-prev').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
                        header.querySelector('#pdf-next').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
                        header.querySelector('#pdf-text-highlight-btn').innerHTML = App.util.icons.pen;
                        header.querySelector('#pdf-text-view-toggle').innerHTML = App.util.icons.textView;
                        header.querySelector('#pdf-fullscreen-toggle').innerHTML = App.util.icons.expand;
                        header.querySelector('#pdf-more-btn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>';
                        header.querySelector('#pdf-close').innerHTML = App.util.icons.close;
                        header.querySelector('#pdf-more-menu').innerHTML = `
                        <button class="btn btn-secondary mobile-only-btn" onclick="App.pdf.viewer.toggleThumbnails()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 3h8v8H3V3m0 10h8v8H3v-8m10-10h8v8h-8V3m0 10h8v8h-8v-8z"/></svg> Page Snips</button>
                        <button class="btn btn-secondary mobile-only-btn" onclick="App.pdf.viewer.toggleFullscreen()">${App.util.icons.expand} Fullscreen</button>
                        <div class="control-divider mobile-only-btn" style="margin: 4px 8px; height: auto; width: calc(100% - 16px);"></div>
                        <button id="pdf-pan-toggle" class="btn btn-secondary" onclick="App.pdf.viewer.togglePanMode()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg> Pan Mode</button>
                        <button class="btn btn-secondary" id="pdf-zoom-out" title="Zoom Out (-)">${App.util.icons.zoomOut} Zoom Out</button>
                        <button class="btn btn-secondary" id="pdf-zoom-percent" title="Reset Zoom">100%</button>
                        <button class="btn btn-secondary" id="pdf-zoom-in" title="Zoom In (+)">${App.util.icons.zoomIn} Zoom In</button>
                        <div class="control-divider text-view-only-btn" style="margin: 4px 8px; height: auto; width: calc(100% - 16px);"></div>
                        <button id="pdf-text-font-size-toggle" class="btn btn-secondary text-view-only-btn" onclick="App.pdf.viewer.cycleTextViewFontSize()" title="Cycle Font Size">${App.util.icons.actions} Font Size</button>
                        <button id="pdf-text-theme-toggle" class="btn btn-secondary text-view-only-btn" onclick="App.pdf.viewer.cycleTextViewTheme()" title="Cycle Ambiance Theme">${App.util.icons.theme} Color Ambiance</button>
                        <button class="btn btn-secondary text-view-only-btn" onclick="App.pdf.highlights.copyPage()" title="Copy highlights from this page">${App.util.icons.copy} Page Snips</button>
                        <button class="btn btn-secondary text-view-only-btn" onclick="App.pdf.highlights.copyAll()" title="Copy all highlights from this document">${App.util.icons.copy} All Snips</button>
                        <button class="btn btn-danger text-view-only-btn" onclick="App.pdf.highlights.clearPage()" title="Permanently remove all highlights from this page">${App.util.icons.trash} Clear Snips</button>
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
                        document.getElementById('pdf-text-view-toggle').onclick = () => App.pdf.viewer.toggleTextView();
                        document.getElementById('pdf-text-highlight-btn').onclick = () => App.pdf.viewer.applyTextViewHighlight();
                        document.getElementById('pdf-fullscreen-toggle').onclick = () => App.pdf.viewer.toggleFullscreen();
                        document.getElementById('pdf-more-btn').onclick = () => App.pdf.viewer.toggleMoreMenu();
                        document.getElementById('pdf-close').onclick = () => App.pdf.viewer.close();
                        document.getElementById('pdf-capture-btn').onclick = () => App.pdf.viewer.capturePage();
                        document.getElementById('pdf-text-font-size-toggle').onclick = () => App.pdf.viewer.cycleTextViewFontSize();
                        document.getElementById('pdf-text-theme-toggle').onclick = () => App.pdf.viewer.cycleTextViewTheme();

                        if (navigator.share) {
                            document.getElementById('pdf-share').onclick = () => App.pdf.viewer.share();
                        } else {
                            const shareBtn = document.getElementById('pdf-share');
                            if (shareBtn) shareBtn.style.display = 'none';
                        }

                        document.getElementById('pdf-annotate-toggle').onclick = () => App.annotationEngine.toggle('pdf');
                        document.getElementById('pdf-tool-pen').onclick = () => App.annotationEngine.setTool('pen');
                        document.getElementById('pdf-tool-rect').onclick = () => App.annotationEngine.setTool('rect');
                        document.getElementById('pdf-tool-eraser').onclick = () => App.annotationEngine.setTool('eraser');
                        document.getElementById('pdf-color-cycler').onclick = () => App.annotationEngine.cycleColor();
                        document.getElementById('pdf-thickness-cycler').onclick = () => App.annotationEngine.cycleThickness();
                        document.getElementById('pdf-undo-btn').onclick = () => App.annotationEngine.undo();
                        header.querySelector('button[title="Clear Annotations on Page"]').onclick = () => App.annotationEngine.clearCurrentPage();
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

                        const container = document.getElementById('pdf-viewer-container');
                        const isInTextView = container.classList.contains('text-view-active');

                        App.pdf.state.pdfDoc.getPage(num).then(page => {
                            const pageContainer = document.querySelector('.pdf-page-container');
                            if (pageContainer.querySelector('#annotation-layer')) {
                                pageContainer.querySelector('#annotation-layer').remove();
                            }

                            if (!isInTextView) {
                                const canvas = document.getElementById('pdf-viewer-canvas');
                                const scale = App.pdf.state.scale;

                                const dpr = window.devicePixelRatio || 1;
                                const outputScale = scale * dpr;

                                const viewport = page.getViewport({ scale: outputScale });
                                const displayViewport = page.getViewport({ scale: scale });

                                canvas.width = viewport.width;
                                canvas.height = viewport.height;

                                // CSS display size (original) - THIS IS KEY FOR ANNOTATION SAFETY
                                canvas.style.width = displayViewport.width + 'px';
                                canvas.style.height = displayViewport.height + 'px';

                                const annotationLayer = document.createElement('canvas');
                                annotationLayer.id = 'annotation-layer';
                                annotationLayer.width = viewport.width;
                                annotationLayer.height = viewport.height;
                                annotationLayer.style.width = displayViewport.width + 'px';
                                annotationLayer.style.height = displayViewport.height + 'px';
                                pageContainer.appendChild(annotationLayer);

                                page.render({
                                    canvasContext: canvas.getContext('2d', { willReadFrequently: true }),
                                    viewport: viewport
                                }).promise.then(() => {
                                    App.pdf.state.pageRendering = false;

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

                                    // FIX: ALWAYS redraw annotations after all canvas setup (visible in all modes)
                                    App.annotationEngine.redrawPageAnnotations(num);

                                    if (App.pdf.state.pageNumPending !== null) {
                                        this.renderPage(App.pdf.state.pageNumPending);
                                        App.pdf.state.pageNumPending = null;
                                    }
                                });
                            }

                            // The text view rendering remains unchanged.
                            this.renderTextViewForPage(num);

                            if (isInTextView) {
                                App.pdf.state.pageRendering = false;
                                if (App.pdf.state.pageNumPending !== null) {
                                    this.renderPage(App.pdf.state.pageNumPending);
                                    App.pdf.state.pageNumPending = null;
                                }
                            }
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
                        container.classList.toggle('pdf-fullscreen-active');
                    },

                    handleKeyDown: (e) => {
                        if (App.ui.aiMagicModal.state.isOpen && App.ui.aiMagicModal.state.mode === 'viewer') return;

                        // Spacebar for Pan Mode (Hold)
                        if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                            App.pdf.state.isSpacePan = true;
                            const container = document.getElementById('pdf-viewer-container');
                            if (container) container.classList.add('grab-mode');
                        }

                        if (e.target.id === 'pdf-page-num') return;
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
                            case 'a': App.annotationEngine.toggle('pdf'); break;
                            case 'p': if (isAnnotationActive) { App.annotationEngine.setTool('pen'); e.preventDefault(); } break;
                            case 'r': if (isAnnotationActive) { App.annotationEngine.setTool('rect'); e.preventDefault(); } break;
                            case 'e': if (isAnnotationActive) { App.annotationEngine.setTool('eraser'); e.preventDefault(); } break;
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
                        document.getElementById('ai-magic-toggle').style.display = 'none';
                        if (App.ui.aiMagicModal.state.isOpen && App.ui.aiMagicModal.state.mode === 'viewer') App.ui.aiMagicModal.closeViewer();

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
