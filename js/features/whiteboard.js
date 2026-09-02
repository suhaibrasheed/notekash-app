const whiteboard = {
    state: {
        isOpen: false,
        tool: 'pen',
        color: '--text-primary',
        thickness: 3,
        thicknesses: [1, 1.5, 2, 3, 4, 5, 7, 10, 14, 18],
        thicknessIndex: 3,
        isDrawing: false,
        lastPos: { x: 0, y: 0 },
        startPos: { x: 0, y: 0 },
        history: [],
        historyIndex: -1,
        insertMode: 'end', // 'end' or 'cursor'
        previewImageData: null,
        zoom: 1,
        pan: { x: 0, y: 0 },
        isPanning: false,
        panStart: { x: 0, y: 0 },
        textBoxes: [],
        textBoxIdCounter: 0,
        activeTextBox: null,
        imageBoxes: [],
        connectors: [], // {from: id, to: id}
        isConnecting: false,
        connectFromId: null,
        editingBlockId: null, // Track when editing from existing block
        backgroundStyle: 0, // 0=transparent, 1=white, 2=dark, 3=grid
        // Image annotation mode
        isImageAnnotation: false,
        sourceImageContainer: null,
        backgroundImage: null,
        bgImageData: null,
        // Image manipulation state
        imageSelected: false,
        isDraggingImage: false,
        isResizingImage: false,
        resizeHandle: null, // 'nw', 'ne', 'sw', 'se'
        dragStartPos: null,
        dragStartImagePos: null,
        animationFrameId: null, // For animation cleanup
        // Occlusion Tape state (Visual Flashcard)
        tapeBoxes: [],          // Array of tape objects: {id, x, y, w, h, element, revealed}
        tapeIdCounter: 0,       // Counter for unique tape IDs
        isDrawingTape: false,   // Currently drawing a tape?
        tapeStartPos: null,     // Start position for tape drawing
        tapePreview: null,      // Preview element during drawing
        // Stage mode screenshot state
        stageModeSrcArticleId: null, // Article ID when opened from stage mode
    },

    // NEW: Initialize whiteboard with an existing image as full-viewport background
    async initImageAnnotation(imageContainer) {
        if (!imageContainer) return;

        const img = imageContainer.querySelector('img');
        if (!img) return;

        // 1. Get original image dimensions
        const src = img.src;
        const imgNaturalW = img.naturalWidth || img.width || 800;
        const imgNaturalH = img.naturalHeight || img.height || 600;

        // 2. Pre-load image object and wait for it
        const imageObj = new Image();
        imageObj.crossOrigin = "Anonymous";

        const imageLoaded = new Promise((resolve, reject) => {
            imageObj.onload = () => resolve(imageObj);
            imageObj.onerror = () => reject(new Error('Failed to load image'));
            if (imageObj.complete && imageObj.naturalWidth > 0) {
                resolve(imageObj);
            }
        });
        imageObj.src = src;

        try {
            await imageLoaded;
        } catch (err) {
            App.ui.showToast('Failed to load image for annotation', { type: 'error' });
            return;
        }

        // 3. Open whiteboard and reset state
        this.state.insertMode = 'cursor';
        this.state.isOpen = true;
        this.state.pan = { x: 0, y: 0 };
        this.state.textBoxes = [];
        this.state.imageBoxes = [];
        this.state.tapeBoxes = [];
        this.state.tapeIdCounter = 0;
        this.state.activeTextBox = null;
        this.state.connectors = [];
        this.state.isConnecting = false;
        this.state.connectFromId = null;
        this.state.connectFromColor = null;
        this.state.backgroundStyle = 0;

        // Reset container visual
        if (this.els.container) {
            this.els.container.style.background = 'transparent';
            this.els.container.style.backgroundImage = 'none';
        }
        this.els.overlay.classList.add('active');
        this.els.overlay.classList.add('has-bg-image'); // Enable image tool visibility
        this.els.overlay.focus();
        document.body.style.overflow = 'hidden';

        // 4. Set image annotation state
        this.state.isImageAnnotation = true;
        this.state.sourceImageContainer = imageContainer;
        this.state.backgroundImage = imageObj;

        // 5. Get viewport dimensions and set canvas to fill it
        const viewportW = this.els.container.clientWidth || window.innerWidth - 100;
        const viewportH = this.els.container.clientHeight || window.innerHeight - 150;
        const dpr = window.devicePixelRatio || 1;
        const padding = 40; // Padding around image

        // Available space for image
        const availW = viewportW - (padding * 2);
        const availH = viewportH - (padding * 2);

        // Scale image to fit (contain) within viewport
        const imgAspect = imgNaturalW / imgNaturalH;
        const viewAspect = availW / availH;

        let drawW, drawH;
        if (imgAspect > viewAspect) {
            // Image is wider - fit to width
            drawW = availW;
            drawH = availW / imgAspect;
        } else {
            // Image is taller - fit to height
            drawH = availH;
            drawW = availH * imgAspect;
        }

        // Center the image in viewport
        const drawX = padding + (availW - drawW) / 2;
        const drawY = padding + (availH - drawH) / 2;

        // Size canvas to fill viewport (not image size!)
        this.els.canvas.width = viewportW * dpr;
        this.els.canvas.height = viewportH * dpr;
        this.els.canvas.style.width = viewportW + 'px';
        this.els.canvas.style.height = viewportH + 'px';

        // Reset and scale context for DPR
        this.els.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.els.ctx.scale(dpr, dpr);

        // 6. Store image data and draw it as background
        this.state.bgImageData = {
            x: drawX,
            y: drawY,
            w: drawW,
            h: drawH,
            originalW: imgNaturalW,
            originalH: imgNaturalH
        };

        // Draw the background image with rounded corners
        this.redrawWithImage();

        // Clear history (fresh start for undo)
        this.state.history = [];
        this.state.historyIndex = -1;

        // Set zoom to 100% - canvas already fits viewport
        this.setZoom(1);

        // Reset scroll position
        this.els.container.scrollLeft = 0;
        this.els.container.scrollTop = 0;

        // Auto-select image tool for easy manipulation
        this.setTool('image');
    },

    els: {
        overlay: null,
        card: null,
        canvas: null,
        ctx: null,
        container: null,
        zoomSlider: null,
        zoomDisplay: null,
        connectorsSvg: null,
    },

    init() {
        this.els.overlay = document.getElementById('whiteboard-overlay');
        this.els.card = document.getElementById('whiteboard-card');
        this.els.canvas = document.getElementById('whiteboard-canvas');
        this.els.container = document.getElementById('whiteboard-canvas-container');
        this.els.bgImage = document.getElementById('whiteboard-bg-image'); // Background image layer
        this.els.zoomSlider = document.getElementById('whiteboard-zoom-slider');
        this.els.zoomDisplay = document.getElementById('whiteboard-zoom-display');
        this.els.connectorsSvg = document.getElementById('whiteboard-connectors');

        if (!this.els.overlay || !this.els.canvas) return;
        this.els.ctx = this.els.canvas.getContext('2d', { willReadFrequently: true });

        // Tool buttons
        this.els.overlay.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
        });

        // Color swatches
        this.els.overlay.querySelectorAll('.wb-color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => this.setColor(swatch.dataset.color));
        });

        // Global Paste Listener
        document.addEventListener('paste', (e) => this.onPaste(e));

        // Drag and Drop Listeners for Image Import
        this.els.overlay.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.els.overlay.addEventListener('drop', (e) => this.handleDrop(e));

        // Action buttons
        document.getElementById('whiteboard-undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('whiteboard-paste-btn')?.addEventListener('click', () => this.pasteContent());
        document.getElementById('whiteboard-clear-btn')?.addEventListener('click', () => this.clear());
        document.getElementById('whiteboard-clear-menu-btn')?.addEventListener('click', () => this.clear());
        document.getElementById('whiteboard-cancel-btn')?.addEventListener('click', () => this.close());

        document.getElementById('whiteboard-add-btn')?.addEventListener('click', async () => {
            try {
                await this.addToArticle();
            } catch (e) {
                console.error('Save and exit error:', e);
                App.ui.showToast('❌ Failed to save: ' + (e.message || 'Unknown error'), { type: 'error' });
            }
        });

        // Save & New: save current whiteboard then immediately open a fresh one
        document.getElementById('whiteboard-savenew-btn')?.addEventListener('click', async () => {
            const articleId = App.state.activeArticleId;
            if (!articleId && !this.state.stageModeSrcArticleId) {
                App.ui.showToast('No active article — open an article first', { type: 'info' });
                return;
            }
            try {
                await this.addToArticle(true); // pass keepOpen = true
            } catch (e) {
                console.error('Save & New error:', e);
                App.ui.showToast('❌ Failed to save: ' + (e.message || 'Unknown error'), { type: 'error' });
            }
        });

        document.getElementById('whiteboard-thickness-btn')?.addEventListener('click', () => this.cycleThickness());

        document.getElementById('whiteboard-bg-btn')?.addEventListener('click', () => this.cycleBackground());

        this.els.zoomSlider?.addEventListener('input', (e) => {
            this.setZoom(parseInt(e.target.value) / 100);
        });

        document.getElementById('wb-auto-layout-btn')?.addEventListener('click', () => {
            this.autoLayout();
        });

        // More Menu Toggle Listener
        document.getElementById('whiteboard-more-btn')?.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately
            const container = document.getElementById('wb-more-container');
            container?.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const container = document.getElementById('wb-more-container');
            if (container && container.classList.contains('active') && !container.contains(e.target)) {
                container.classList.remove('active');
            }
        });

        // Canvas drawing events - MOVED TO CONTAINER to capture events even if canvas is pointer-events: none
        this.els.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.els.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.els.container.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.els.container.addEventListener('mouseleave', () => {
            if (this.state.isDrawing && this.state.tool === 'pen') this.stopDrawing();
        });

        // Touch events for mobile
        this.els.container.addEventListener('touchstart', (e) => {
            if (e.target === this.els.canvas || this.state.tool !== 'select') {
                e.preventDefault();
            }
            if (e.touches && e.touches[0]) this.handleMouseDown(e.touches[0]);
        }, { passive: false });

        this.els.container.addEventListener('touchmove', (e) => {
            if (e.target === this.els.canvas || this.state.tool !== 'select') {
                e.preventDefault();
            }
            if (e.touches && e.touches[0]) this.handleMouseMove(e.touches[0]);
        }, { passive: false });

        this.els.container.addEventListener('touchend', (e) => {
            this.handleMouseUp(e.changedTouches ? e.changedTouches[0] : e);
        });

        // Block ALL keyboard events when whiteboard is open (prevent background leakage)
        this.els.overlay.addEventListener('keydown', (e) => {
            if (e.target.classList?.contains('wb-text-content') || e.target.contentEditable === 'true') {

                // RAPID FIRE: TAB to Spawn Child / Shift+Tab to Parent
                if (e.key === 'Tab') {
                    e.preventDefault();
                    e.stopPropagation();

                    // Find active box
                    let activeBox = this.state.activeTextBox;
                    if (!activeBox) {
                        const boxEl = e.target.closest('.wb-text-box');
                        if (boxEl) {
                            const id = parseInt(boxEl.getAttribute('data-id'));
                            activeBox = this.state.textBoxes.find(tb => tb.id === id);
                        }
                    }

                    if (activeBox) {
                        if (e.shiftKey) {
                            this.navigateToParent(activeBox);
                        } else {
                            this.spawnChildTextBox(activeBox);
                        }
                    }
                    return;
                }

                // Still block Escape
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.target.blur();
                    this.deselectAllTextBoxes();
                }
                return;
            }
            e.stopPropagation();
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                this.undo();
            }
        }, true); // Use capture phase

        this.els.overlay.addEventListener('click', (e) => {
            if (e.target === this.els.overlay) this.close();
        });

        this.els.card?.addEventListener('click', (e) => e.stopPropagation());

        window.addEventListener('resize', () => {
            if (this.state.isOpen) this.resizeCanvas();
        });

        if (window.ResizeObserver && this.els.container) {
            new ResizeObserver(() => {
                if (this.state.isOpen) this.resizeCanvas();
            }).observe(this.els.container);
        }

        this.els.container?.addEventListener('click', (e) => {
            if ((e.target === this.els.canvas || e.target === this.els.container) && this.state.tool === 'select') {
                this.deselectAllTextBoxes();
            }
        });


        // --- SHAPES FLYOUT LOGIC ---
        const shapesContainer = document.getElementById('wb-shapes-container');
        const shapesTriggerBtn = document.getElementById('wb-shapes-trigger-btn');
        const shapesFlyout = document.getElementById('wb-shapes-flyout');
        const shapesIcon = document.getElementById('wb-shapes-icon');

        // SVG icons for each shape tool
        const shapeIcons = {
            line: `<line x1="5" y1="19" x2="19" y2="5"/>`,
            rect: `<rect x="4" y="4" width="16" height="16" rx="2"/>`,
            circle: `<circle cx="12" cy="12" r="9"/>`,
            star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`
        };

        let lastShapeTool = 'rect'; // default
        let shapesOpen = false;

        const closeFlyout = () => {
            shapesOpen = false;
            shapesContainer?.classList.remove('open');
        };

        const openFlyout = () => {
            shapesOpen = true;
            shapesContainer?.classList.add('open');
        };

        const updateShapesIcon = (tool) => {
            if (shapesIcon && shapeIcons[tool]) {
                shapesIcon.innerHTML = shapeIcons[tool];
            }
        };

        shapesTriggerBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!shapesOpen) {
                openFlyout();
            } else {
                closeFlyout();
            }
        });

        // Handle clicks on individual shape buttons inside the flyout
        // Changed 'click' to 'pointerdown' to make it extremely responsive on pens/touch
        shapesFlyout?.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tool = btn.dataset.tool;
                lastShapeTool = tool;
                this.setTool(tool);
                updateShapesIcon(tool);
                shapesContainer?.classList.add('shape-active');
                closeFlyout();
            });
            // Prevent click from propagating to canvas
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Close flyout when pointerdown outside
        document.addEventListener('pointerdown', (e) => {
            if (shapesContainer && shapesOpen && !shapesContainer.contains(e.target)) {
                closeFlyout();
            }
        }, { capture: true });

        // When another tool is activated, remove shape-active badge
        const origSetTool = this.setTool.bind(this);
        this._setToolWithShapeReset = (tool) => {
            origSetTool(tool);
            if (!['line', 'rect', 'circle', 'star'].includes(tool)) {
                shapesContainer?.classList.remove('shape-active');
            }
        };
        // Patch the tool buttons (non-shape) to also reset shapes badge
        this.els.overlay.querySelectorAll('[data-tool]').forEach(btn => {
            const tool = btn.dataset.tool;
            if (!['line', 'rect', 'circle', 'star'].includes(tool)) {
                btn.addEventListener('click', () => {
                    shapesContainer?.classList.remove('shape-active');
                    closeFlyout();
                });
            }
        });

        // --- LASSO TOOL LOGIC ---
        const lassoBtn = document.getElementById('wb-lasso-btn');
        const lassoOverlay = document.getElementById('wb-lasso-overlay');
        const lassoActionbar = document.getElementById('wb-lasso-actionbar');
        const lassoMoreContainer = document.getElementById('wb-more-container');

        // Lasso state
        this.lasso = {
            active: false,
            drawing: false,
            path: [],
            selectedIndices: [],
            bbox: null
        };

        const lassoSelf = this;

        const setLassoActive = (on) => {
            lassoSelf.lasso.active = on;
            if (on) {
                lassoSelf.setTool('pen'); // keep pen cursor logic but override canvas events
                lassoBtn?.classList.add('active');
                lassoSelf.els.canvas.style.cursor = 'crosshair';
                // Close more menu
                lassoMoreContainer?.classList.remove('active');
            } else {
                lassoBtn?.classList.remove('active');
                clearLassoUI();
            }
        };

        const clearLassoUI = () => {
            if (lassoSelf.lasso.floatingCanvas) {
                const ctx = lassoSelf.els.canvas.getContext('2d');
                const fw = lassoSelf.lasso.floatingCanvas.width / (window.devicePixelRatio || 1);
                const fh = lassoSelf.lasso.floatingCanvas.height / (window.devicePixelRatio || 1);
                ctx.drawImage(lassoSelf.lasso.floatingCanvas, lassoSelf.lasso.floatingX, lassoSelf.lasso.floatingY, fw, fh);
                lassoSelf.saveToHistory();
                lassoSelf.lasso.floatingCanvas.remove();
                lassoSelf.lasso.floatingCanvas = null;
            }
            if (lassoOverlay) lassoOverlay.innerHTML = '';
            if (lassoActionbar) lassoActionbar.classList.remove('visible');
            lassoSelf.lasso.path = [];
            lassoSelf.lasso.selectedIndices = [];
            lassoSelf.lasso.bbox = null;
            lassoSelf.lasso.drawing = false;
            lassoSelf.lasso.isMoving = false;
            if (lassoSelf.lasso.active) {
                lassoSelf.els.canvas.style.cursor = 'crosshair';
            }
        };

        const drawLassoPath = (path) => {
            if (!lassoOverlay || path.length < 2) return;
            const pts = path.map(p => `${p.x},${p.y}`).join(' ');
            const lw = Math.max(2, lassoSelf.state.thickness || 2);
            lassoOverlay.innerHTML = `
                <polygon points="${pts}"
                    fill="rgba(99,102,241,0.08)"
                    stroke="rgba(99,102,241,0.8)"
                    stroke-width="${lw}"
                    stroke-dasharray="6,3"
                    stroke-linejoin="round"
                    fill-rule="evenodd"/>`;
        };

        const pointInPolygon = (px, py, poly) => {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const xi = poly[i].x, yi = poly[i].y;
                const xj = poly[j].x, yj = poly[j].y;
                const intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        };

        const findSelectedStrokes = (path) => {
            const history = lassoSelf.state.history;
            if (!history || history.length === 0) return [];
            // Use the latest history snapshot (the most recent state)
            const currentSnapshot = history[lassoSelf.state.historyIndex];
            if (!currentSnapshot) return [];
            const strokes = currentSnapshot.strokes || currentSnapshot;
            if (!Array.isArray(strokes)) return [];
            const selected = [];
            strokes.forEach((stroke, idx) => {
                if (!stroke.points || stroke.points.length === 0) return;
                // Check if any point of the stroke is inside the lasso
                const hits = stroke.points.some(p => pointInPolygon(p.x, p.y, path));
                if (hits) selected.push(idx);
            });
            return selected;
        };

        // Canvas pointer events for lasso
        const lassoPointerDown = (e) => {
            if (!lassoSelf.lasso.active) return;
            if (e.target && e.target.closest && (e.target.closest('#wb-lasso-actionbar') || e.target.closest('#whiteboard-toolbar'))) return;
            e.preventDefault();
            e.stopPropagation();
            const rect = lassoSelf.els.canvas.getBoundingClientRect();
            const cx = (e.clientX - rect.left);
            const cy = (e.clientY - rect.top);

            if (lassoSelf.lasso.path && lassoSelf.lasso.path.length > 3 && pointInPolygon(cx, cy, lassoSelf.lasso.path)) {
                // We are moving the selection!
                lassoSelf.lasso.isMoving = true;
                lassoSelf.lasso.moveStartX = cx;
                lassoSelf.lasso.moveStartY = cy;

                if (!lassoSelf.lasso.floatingCanvas) {
                    // First lift, extract pixels
                    const path = lassoSelf.lasso.path;
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    path.forEach(p => {
                        if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
                        if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
                    });
                    const w = Math.max(1, Math.ceil(maxX - minX));
                    const h = Math.max(1, Math.ceil(maxY - minY));
                    const dpr = window.devicePixelRatio || 1;

                    const fCanvas = document.createElement('canvas');
                    fCanvas.width = w * dpr;
                    fCanvas.height = h * dpr;
                    fCanvas.style.width = w + 'px';
                    fCanvas.style.height = h + 'px';
                    fCanvas.style.position = 'absolute';
                    fCanvas.style.pointerEvents = 'none';
                    fCanvas.style.zIndex = '25';
                    fCanvas.style.left = minX + 'px';
                    fCanvas.style.top = minY + 'px';

                    const offCtx = fCanvas.getContext('2d');
                    offCtx.scale(dpr, dpr);
                    offCtx.save();
                    offCtx.beginPath();
                    offCtx.moveTo(path[0].x - minX, path[0].y - minY);
                    path.forEach(p => offCtx.lineTo(p.x - minX, p.y - minY));
                    offCtx.closePath();
                    offCtx.clip();
                    offCtx.drawImage(lassoSelf.els.canvas, minX * dpr, minY * dpr, w * dpr, h * dpr, 0, 0, w, h);
                    offCtx.restore();

                    document.getElementById('whiteboard-canvas-container').appendChild(fCanvas);
                    lassoSelf.lasso.floatingCanvas = fCanvas;
                    lassoSelf.lasso.floatingX = minX;
                    lassoSelf.lasso.floatingY = minY;

                    // clear main canvas under path
                    const ctx = lassoSelf.els.canvas.getContext('2d');
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(path[0].x, path[0].y);
                    path.forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.closePath();
                    ctx.clip();
                    ctx.clearRect(0, 0, lassoSelf.els.canvas.width, lassoSelf.els.canvas.height);
                    ctx.restore();
                }
                try { e.target.setPointerCapture(e.pointerId); } catch (_) { }
                return;
            }

            // Otherwise start new lasso
            clearLassoUI();
            lassoSelf.lasso.drawing = true;
            lassoSelf.lasso.path = [{ x: cx, y: cy }];
            try { e.target.setPointerCapture(e.pointerId); } catch (_) { }
        };

        const lassoPointerMove = (e) => {
            if (!lassoSelf.lasso.active) return;
            e.preventDefault();
            e.stopPropagation();
            const rect = lassoSelf.els.canvas.getBoundingClientRect();
            const cx = (e.clientX - rect.left);
            const cy = (e.clientY - rect.top);

            if (lassoSelf.lasso.isMoving) {
                const dx = cx - lassoSelf.lasso.moveStartX;
                const dy = cy - lassoSelf.lasso.moveStartY;
                lassoSelf.lasso.moveStartX = cx;
                lassoSelf.lasso.moveStartY = cy;

                lassoSelf.lasso.floatingX += dx;
                lassoSelf.lasso.floatingY += dy;
                lassoSelf.lasso.floatingCanvas.style.left = lassoSelf.lasso.floatingX + 'px';
                lassoSelf.lasso.floatingCanvas.style.top = lassoSelf.lasso.floatingY + 'px';

                lassoSelf.lasso.path.forEach(p => { p.x += dx; p.y += dy; });
                drawLassoPath(lassoSelf.lasso.path);
                return;
            }

            if (!lassoSelf.lasso.drawing) return;
            lassoSelf.lasso.path.push({ x: cx, y: cy });
            drawLassoPath(lassoSelf.lasso.path);
        };

        const lassoPointerUp = (e) => {
            if (!lassoSelf.lasso.active) return;
            e.preventDefault();
            e.stopPropagation();

            if (lassoSelf.lasso.isMoving) {
                lassoSelf.lasso.isMoving = false;
                return;
            }

            // ending drawing
            if (!lassoSelf.lasso.drawing) return;
            lassoSelf.lasso.drawing = false;
            if (lassoSelf.lasso.path.length > 3) {
                // Close the path visually
                lassoSelf.lasso.path.push(lassoSelf.lasso.path[0]);
                drawLassoPath(lassoSelf.lasso.path);
                lassoActionbar?.classList.add('visible');
                App.ui.showToast('Selection ready (Drag inside to move)', { duration: 2500 });
            } else {
                clearLassoUI();
            }
        };

        // Add lasso pointer listeners on canvas container
        const lassoContainer = document.getElementById('whiteboard-canvas-container');
        if (lassoContainer) {
            lassoContainer.addEventListener('pointerdown', lassoPointerDown, { capture: true });
            lassoContainer.addEventListener('pointermove', lassoPointerMove, { capture: true, passive: false });
            lassoContainer.addEventListener('pointerup', lassoPointerUp, { capture: true });
        }

        // Wire lasso button
        lassoBtn?.addEventListener('click', () => {
            const isNowActive = !lassoSelf.lasso.active;
            setLassoActive(isNowActive);
            if (!isNowActive) {
                // Restore to pen tool
                lassoSelf.setTool('pen');
            }
        });

        // Lasso delete
        document.getElementById('lasso-delete-btn')?.addEventListener('click', () => {
            if (!lassoSelf.lasso.path || lassoSelf.lasso.path.length < 3) return;

            if (lassoSelf.lasso.floatingCanvas) {
                lassoSelf.lasso.floatingCanvas.remove();
                lassoSelf.lasso.floatingCanvas = null;
                // already removed from main canvas during initial drag, so just history save
                lassoSelf.saveToHistory();
                clearLassoUI();
            } else {
                // Clear the canvas area inside the lasso polygon using clip
                const ctx = lassoSelf.els.canvas.getContext('2d');
                if (!ctx) return;
                ctx.save();
                ctx.beginPath();
                const path = lassoSelf.lasso.path;
                ctx.moveTo(path[0].x, path[0].y);
                path.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();
                ctx.clip();
                ctx.clearRect(0, 0, lassoSelf.els.canvas.width, lassoSelf.els.canvas.height);
                ctx.restore();
                // Save to history
                lassoSelf.saveToHistory();
                clearLassoUI();
            }
            App.ui.showToast('Selected strokes deleted', { duration: 1200 });
        });

        // Lasso copy as PNG
        document.getElementById('lasso-copy-btn')?.addEventListener('click', async () => {
            if (!lassoSelf.lasso.path || lassoSelf.lasso.path.length < 3) return;

            let targetCanvas = lassoSelf.lasso.floatingCanvas;

            if (!targetCanvas) {
                const path = lassoSelf.lasso.path;
                // Compute bounding box
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                path.forEach(p => {
                    if (p.x < minX) minX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y > maxY) maxY = p.y;
                });
                const w = Math.ceil(maxX - minX);
                const h = Math.ceil(maxY - minY);
                if (w < 2 || h < 2) return;

                const dpr = window.devicePixelRatio || 1;
                // Create offscreen canvas
                targetCanvas = document.createElement('canvas');
                targetCanvas.width = w * dpr;
                targetCanvas.height = h * dpr;
                // Make it renderable via Blob without implicit scaling issues if drawn later
                const offCtx = targetCanvas.getContext('2d');
                offCtx.scale(dpr, dpr);
                // Clip to lasso shape
                offCtx.save();
                offCtx.beginPath();
                offCtx.moveTo(path[0].x - minX, path[0].y - minY);
                path.forEach(p => offCtx.lineTo(p.x - minX, p.y - minY));
                offCtx.closePath();
                offCtx.clip();
                // Draw portion of the main canvas
                offCtx.drawImage(lassoSelf.els.canvas, minX * dpr, minY * dpr, w * dpr, h * dpr, 0, 0, w, h);
                offCtx.restore();
            }

            try {
                targetCanvas.toBlob(async (blob) => {
                    if (!blob) return;
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    App.ui.showToast('✅ Copied as PNG — paste anywhere!', { type: 'success' });
                }, 'image/png');
            } catch (e) {
                App.ui.showToast('Copy failed (browser permission needed)', { type: 'error' });
            }
        });

        // Lasso dismiss
        document.getElementById('lasso-dismiss-btn')?.addEventListener('click', () => {
            clearLassoUI();
        });

        // Deactivate lasso when another tool is chosen via toolbar
        this.els.overlay.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (lassoSelf.lasso.active) {
                    setLassoActive(false);
                }
            });
        });

        // Pre-sync scratchpad from App.fs (Folder Storage / IndexedDB)
        setTimeout(() => {
            if (!this.getScratchpadState()) {
                this.loadScratchpadFromStorage();
            }
        }, 500);
    },

    open(insertMode = 'end', articleId = null) {
        if (this.els.overlay) {
            this.els.overlay.classList.remove('is-fullscreen');
            const bgImg = this.els.overlay.querySelector('#whiteboard-bg-image');
            if (bgImg) bgImg.style.display = 'none';
        }
        // Preserve caret for cursor insert (overlay steals focus/selection)
        if (insertMode === 'cursor' && App.state.currentMode === 'write') {
            const contentDiv = document.getElementById('article-content');
            const sel = window.getSelection();
            if (contentDiv && sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                if (contentDiv.contains(range.commonAncestorContainer)) {
                    App.state.savedRange = range.cloneRange();
                }
            }
        }
        this.state.insertMode = insertMode;
        this.state.isOpen = true;
        this.state.editingBlockId = null; // Fresh whiteboard, not editing existing
        this.state.pan = { x: 0, y: 0 };
        this.state.textBoxes = [];
        this.state.imageBoxes = [];
        this.state.tapeBoxes = [];
        this.state.tapeIdCounter = 0;
        this.state.activeTextBox = null;
        this.state.connectors = [];
        this.state.isConnecting = false;
        this.state.connectFromId = null;
        this.state.connectFromColor = null;
        this.state.backgroundStyle = 0;
        this.state.isImageAnnotation = false;
        this.state.sourceImageContainer = null;
        this.state.backgroundImage = null;
        this.state.bgImageData = null;

        // Store article ID if provided (for stage mode saves)
        this.state.stageModeSrcArticleId = articleId;

        if (this.els.container) {
            this.els.container.style.background = 'transparent';
            this.els.container.style.backgroundImage = 'none';
        }
        this.els.overlay.classList.add('active');

        this.resizeCanvas();

        const scratchState = this.getScratchpadState();
        if (scratchState && this.hasSavedContent(scratchState)) {
            this.restoreFromState(scratchState, true);
        } else {
            this.clear(false);
            this.setTool('pen');
            // Try loading from App.fs (Folder Storage / IndexedDB) if localStorage was empty
            this.loadScratchpadFromStorage().then(fsState => {
                if (fsState && this.state.isOpen && !this.state.editingBlockId && !this.state.hasContent) {
                    this.restoreFromState(fsState, true);
                }
            });
        }

        this.els.overlay.focus();
        document.body.style.overflow = 'hidden';
    },

    // NEW: Open whiteboard with a screenshot image as full-viewport background
    async openWithScreenshot(imageDataUrl, imgNaturalW, imgNaturalH, articleId = null, isFullScreen = false) {
        // 1. Pre-load image object and wait for it
        const imageObj = new Image();
        imageObj.crossOrigin = "Anonymous";

        const imageLoaded = new Promise((resolve, reject) => {
            imageObj.onload = () => resolve(imageObj);
            imageObj.onerror = () => reject(new Error('Failed to load screenshot'));
            if (imageObj.complete && imageObj.naturalWidth > 0) {
                resolve(imageObj);
            }
        });
        imageObj.src = imageDataUrl;

        try {
            await imageLoaded;
        } catch (err) {
            App.ui.showToast('Failed to load screenshot for annotation', { type: 'error' });
            return;
        }

        // 2. Open whiteboard and reset state
        this.state.insertMode = 'end';
        this.state.isOpen = true;
        this.state.editingBlockId = null;
        this.state.pan = { x: 0, y: 0 };
        this.state.textBoxes = [];
        this.state.imageBoxes = [];
        this.state.tapeBoxes = [];
        this.state.tapeIdCounter = 0;
        this.state.activeTextBox = null;
        this.state.connectors = [];
        this.state.isConnecting = false;
        this.state.connectFromId = null;
        this.state.connectFromColor = null;
        this.state.backgroundStyle = 0;

        // Store the article ID for stage mode saving
        this.state.stageModeSrcArticleId = articleId;

        // Reset container visual
        if (this.els.container) {
            this.els.container.style.background = 'transparent';
            this.els.container.style.backgroundImage = 'none';
        }
        this.els.overlay.classList.add('active');
        if (isFullScreen) {
            this.els.overlay.classList.add('is-fullscreen');
        } else {
            this.els.overlay.classList.remove('is-fullscreen');
        }
        this.els.overlay.classList.add('has-bg-image'); // Enable image tool visibility
        this.els.overlay.focus();
        document.body.style.overflow = 'hidden';

        // 3. Set image annotation state
        this.state.isImageAnnotation = true;
        this.state.sourceImageContainer = null; // No source container for screenshot mode
        this.state.backgroundImage = imageObj;

        // 4. Get viewport dimensions and set canvas to fill it
        const viewportW = this.els.container.clientWidth || window.innerWidth - 100;
        const viewportH = this.els.container.clientHeight || window.innerHeight - 150;
        const dpr = window.devicePixelRatio || 1;
        const padding = isFullScreen ? 0 : 20;

        const availW = viewportW - (padding * 2);
        const availH = viewportH - (padding * 2);

        const imgAspect = imgNaturalW / imgNaturalH;
        const viewAspect = availW / availH;

        let drawW, drawH;
        if (imgAspect > viewAspect) {
            // Image is wider - fit to width
            drawW = availW;
            drawH = availW / imgAspect;
        } else {
            // Image is taller - fit to height
            drawH = availH;
            drawW = availH * imgAspect;
        }

        const drawX = padding + (availW - drawW) / 2;
        const drawY = padding + (availH - drawH) / 2;

        this.els.canvas.width = viewportW * dpr;
        this.els.canvas.height = viewportH * dpr;
        this.els.canvas.style.width = viewportW + 'px';
        this.els.canvas.style.height = viewportH + 'px';

        this.els.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.els.ctx.scale(dpr, dpr);

        // 5. Store image data for export
        this.state.bgImageData = {
            x: drawX,
            y: drawY,
            w: drawW,
            h: drawH,
            originalW: imgNaturalW,
            originalH: imgNaturalH
        };

        // 6. Use SEPARATE background image element (not on canvas) for proper z-index layering
        if (this.els.bgImage) {
            this.els.bgImage.src = imageDataUrl;
            this.els.bgImage.style.display = 'block';
            this.els.bgImage.style.left = drawX + 'px';
            this.els.bgImage.style.top = drawY + 'px';
            this.els.bgImage.style.width = drawW + 'px';
            this.els.bgImage.style.height = drawH + 'px';
        }

        this.state.useSeparateBgImage = true;

        this.state.history = [];
        this.state.historyIndex = -1;

        this.setZoom(1);

        this.els.container.scrollLeft = 0;
        this.els.container.scrollTop = 0;

        this.setTool('pen');
    },

    close() {
        // Auto-save scratchpad if in regular whiteboard mode
        if (!this.state.editingBlockId && !this.state.isImageAnnotation && !this.state.useSeparateBgImage) {
            this.saveScratchpadState();
        }

        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
        this.state.isOpen = false;
        this.state.editingBlockId = null; // Reset editing mode
        this.els.overlay.classList.remove('active');
        this.els.overlay.classList.remove('has-bg-image'); // Clean up image mode class
        document.body.style.overflow = '';
        // Hide background image element
        if (this.els.bgImage) {
            this.els.bgImage.style.display = 'none';
            this.els.bgImage.src = '';
        }
        this.state.useSeparateBgImage = false;
        this.state.textBoxes.forEach(tb => tb.element?.remove());
        this.state.textBoxes = [];
        (this.state.imageBoxes || []).forEach(ib => ib.element?.remove());
        this.state.imageBoxes = [];
        (this.state.tapeBoxes || []).forEach(tb => tb.element?.remove());
        this.state.tapeBoxes = [];
        this.state.connectors = [];
        if (this.els.connectorsSvg) this.els.connectorsSvg.innerHTML = '';
    },

    resizeCanvas() {
        if (!this.els.container || !this.els.canvas) return;

        // Use unscaled client dimensions to ensure full 100% width and height coverage
        const width = this.els.container.clientWidth || this.els.container.getBoundingClientRect().width;
        const height = this.els.container.clientHeight || this.els.container.getBoundingClientRect().height;
        const dpr = window.devicePixelRatio || 1;

        if (width <= 0 || height <= 0) return;

        const targetW = Math.round(width * dpr);
        const targetH = Math.round(height * dpr);

        // If dimensions haven't changed, skip reallocation
        if (this.els.canvas.width === targetW && this.els.canvas.height === targetH) {
            return;
        }

        // Store current drawing if any
        let imageData = null;
        if (this.els.canvas.width > 0 && this.els.canvas.height > 0) {
            try {
                imageData = this.els.ctx.getImageData(0, 0, this.els.canvas.width, this.els.canvas.height);
            } catch (e) { /* empty canvas */ }
        }

        this.els.canvas.width = targetW;
        this.els.canvas.height = targetH;
        this.els.canvas.style.width = width + 'px';
        this.els.canvas.style.height = height + 'px';

        this.els.ctx.scale(dpr, dpr);

        // Restore drawing if we had one
        if (imageData) {
            this.els.ctx.putImageData(imageData, 0, 0);
        }
    },

    setZoom(zoom) {
        this.state.zoom = Math.max(0.5, Math.min(2, zoom));
        this.els.canvas.style.transform = `scale(${this.state.zoom})`;
        this.els.canvas.style.transformOrigin = 'center center';
        if (this.els.zoomDisplay) {
            this.els.zoomDisplay.textContent = Math.round(this.state.zoom * 100) + '%';
        }
    },

    setTool(tool) {
        const prevTool = this.state.tool;
        this.state.tool = tool;
        this.els.overlay.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });

        // Update cursor based on tool
        const cursors = {
            'select': 'default',
            'hand': 'grab',
            'pen': 'crosshair',
            'line': 'crosshair',
            'rect': 'crosshair',
            'circle': 'crosshair',
            'star': 'crosshair',
            'text': 'text',
            'eraser': 'crosshair',
            'image': 'default',
            'tape': 'crosshair'
        };
        this.els.canvas.style.cursor = cursors[tool] || 'crosshair';
        this.els.container.style.cursor = cursors[tool] || 'crosshair'; // Apply to container too

        // Toggle Tool Classes on Container
        this.els.container.className = this.els.container.className.replace(/\bwb-tool-\S+/g, '');
        this.els.container.classList.add(`wb-tool-${tool}`);

        // Handle image tool selection
        if (tool === 'image' && this.state.isImageAnnotation) {
            this.redrawWithImage(); // Show handles
            App.ui.showToast('📷 Drag to move, corners to resize', { duration: 2000 });
        } else if (prevTool === 'image' && tool !== 'image' && this.state.isImageAnnotation) {
            // Cancel animation when switching away from image tool
            if (this.state.animationFrameId) {
                cancelAnimationFrame(this.state.animationFrameId);
                this.state.animationFrameId = null;
            }
            this.redrawWithImage(); // Hide handles
        }
    },

    setColor(colorVar) {
        this.state.color = '--' + colorVar;
        this.els.overlay.querySelectorAll('.wb-color-swatch').forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color === colorVar);
        });

        // Update active text box color if any
        if (this.state.activeTextBox) {
            const tb = this.state.activeTextBox;
            const color = this.getActiveColor();

            // Change border and text color
            tb.color = color;
            this.updateTextBoxVisuals(tb);
        }

        // Recolor Lasso selection if active
        if (this.lasso && this.lasso.active && this.lasso.path && this.lasso.path.length >= 3) {
            const targetCtx = this.lasso.floatingCanvas ? this.lasso.floatingCanvas.getContext('2d') : this.els.ctx;
            if (!targetCtx) return;
            targetCtx.save();

            if (!this.lasso.floatingCanvas) {
                targetCtx.beginPath();
                const path = this.lasso.path;
                targetCtx.moveTo(path[0].x, path[0].y);
                path.forEach(p => targetCtx.lineTo(p.x, p.y));
                targetCtx.closePath();
                targetCtx.clip();
            }

            targetCtx.globalCompositeOperation = 'source-in';
            targetCtx.fillStyle = this.getActiveColor();
            targetCtx.fillRect(0, 0, targetCtx.canvas.width, targetCtx.canvas.height);
            targetCtx.restore();

            if (!this.lasso.floatingCanvas) {
                this.saveToHistory();
            }
            App.ui.showToast('Selection recolored', { duration: 1200 });
        }
    },

    getActiveColor() {
        return getComputedStyle(document.documentElement).getPropertyValue(this.state.color).trim() || '#212529';
    },

    updateTextBoxVisuals(tb) {
        const style = ['default', 'filled', 'glass', 'minimal'][tb.boxStyleIndex || 0];
        const content = tb.element.querySelector('.wb-text-content');
        const color = tb.color || this.getActiveColor();

        // Reset inline styles
        tb.element.style.backgroundColor = '';

        if (style === 'filled') {
            tb.element.style.backgroundColor = color;
            tb.element.style.borderColor = color;
            content.style.color = '#ffffff';
        } else if (style === 'minimal') {
            tb.element.style.borderColor = 'transparent';
            content.style.color = color;
        } else {
            // Default, Glass
            tb.element.style.borderColor = color;
            content.style.color = color;
        }
    },

    cycleThickness() {
        this.state.thicknessIndex = (this.state.thicknessIndex + 1) % this.state.thicknesses.length;
        this.state.thickness = this.state.thicknesses[this.state.thicknessIndex];

        const btn = document.getElementById('whiteboard-thickness-btn');
        const circle = btn?.querySelector('circle');
        if (circle) circle.setAttribute('r', 2 + this.state.thickness * 0.5);

        if (this.lasso && this.lasso.active) {
            const lassoPoly = document.querySelector('#wb-lasso-overlay polygon');
            if (lassoPoly) {
                lassoPoly.setAttribute('stroke-width', Math.max(2, this.state.thickness));
            }
        }

        App.ui.showToast(`Thickness: ${this.state.thickness}px`, { duration: 1200 });
    },

    cycleBackground() {
        const styles = ['transparent', 'white', 'sepia', 'dark', 'paper', 'grid'];
        const labels = ['Transparent', 'White', 'Sepia', 'Dark', 'Paper', 'Grid'];
        this.state.backgroundStyle = (this.state.backgroundStyle + 1) % styles.length;
        const style = styles[this.state.backgroundStyle];

        // Apply visual background to container
        const container = this.els.container;

        // Reset Logic
        container.style.background = '';
        container.style.backgroundImage = '';
        container.classList.remove('wb-theme-dark', 'wb-bg-sepia', 'wb-bg-paper');

        // Specific Handling
        if (style === 'transparent') {
            container.style.background = 'transparent';
        } else if (style === 'white') {
            container.style.background = '#ffffff';
        } else if (style === 'sepia') {
            container.classList.add('wb-bg-sepia');
        } else if (style === 'paper') {
            container.classList.add('wb-bg-paper');
        } else if (style === 'dark') {
            container.style.background = '#1a1a2e';
            container.classList.add('wb-theme-dark');
        } else if (style === 'grid') {
            container.style.background = '#fafafa';
            container.style.backgroundImage =
                'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), ' +
                'linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)';
            container.style.backgroundSize = '20px 20px';
        }

        // Update button visual indicator
        const btn = document.getElementById('whiteboard-bg-btn');
        if (btn) {
            // const icons = ['◻', '◼', '◾', '▦'];
            btn.title = `Background: ${labels[this.state.backgroundStyle]}`;
        }

        App.ui.showToast(`Background: ${labels[this.state.backgroundStyle]}`, { duration: 1200 });
    },


    // MOUSE/TOUCH HANDLERS
    handleMouseDown(e) {
        // Prevent drawing if the user is interacting with the toolbar or its flyouts
        if (e.target && e.target.closest && e.target.closest('#whiteboard-toolbar')) return;
        // Prevent drawing if lasso tool is active (lasso handles its own pointer events)
        if (this.lasso && this.lasso.active) return;

        if (this.state.tool === 'select' || this.state.tool === 'hand') {
            this.startPanning(e);
            return;
        }
        if (this.state.tool === 'image' && this.state.isImageAnnotation) {
            this.handleImageMouseDown(e);
            return;
        }
        if (this.state.tool === 'text') {
            this.createTextBox(e);
            return;
        }
        // Tape tool - start drawing preview
        if (this.state.tool === 'tape') {
            this.startTapeDrawing(e);
            return;
        }
        this.startDrawing(e);
    },


    handleMouseMove(e) {
        if (this.state.isPanning) {
            this.doPanning(e);
            return;
        }
        if (this.state.isDraggingImage || this.state.isResizingImage) {
            this.handleImageMouseMove(e);
            return;
        }
        // Update cursor for image tool hover
        if (this.state.tool === 'image' && this.state.isImageAnnotation) {
            this.updateImageCursor(e);
        }
        // Tape drawing preview
        if (this.state.isDrawingTape) {
            this.updateTapePreview(e);
            return;
        }
        this.draw(e);
    },

    handleMouseUp(e) {
        if (this.state.isPanning) {
            this.stopPanning();
            return;
        }
        if (this.state.isDraggingImage || this.state.isResizingImage) {
            this.handleImageMouseUp(e);
            return;
        }
        // Finalize tape drawing
        if (this.state.isDrawingTape) {
            this.finishTapeDrawing(e);
            return;
        }
        this.stopDrawing(e);
    },

    // TAPE DRAWING FUNCTIONS
    startTapeDrawing(e) {
        const rect = this.els.container.getBoundingClientRect();
        const x = e.clientX - rect.left + this.els.container.scrollLeft;
        const y = e.clientY - rect.top + this.els.container.scrollTop;

        this.state.isDrawingTape = true;
        this.state.tapeStartPos = { x, y };

        // Create preview element
        const preview = document.createElement('div');
        preview.className = 'wb-tape-preview';
        preview.style.left = x + 'px';
        preview.style.top = y + 'px';
        preview.style.width = '0px';
        preview.style.height = '0px';
        this.els.container.appendChild(preview);
        this.state.tapePreview = preview;
    },

    updateTapePreview(e) {
        if (!this.state.tapePreview || !this.state.tapeStartPos) return;

        const rect = this.els.container.getBoundingClientRect();
        const currentX = e.clientX - rect.left + this.els.container.scrollLeft;
        const currentY = e.clientY - rect.top + this.els.container.scrollTop;

        const startX = this.state.tapeStartPos.x;
        const startY = this.state.tapeStartPos.y;

        // Calculate dimensions (allow drawing in any direction)
        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const w = Math.abs(currentX - startX);
        const h = Math.abs(currentY - startY);

        this.state.tapePreview.style.left = x + 'px';
        this.state.tapePreview.style.top = y + 'px';
        this.state.tapePreview.style.width = w + 'px';
        this.state.tapePreview.style.height = h + 'px';
    },

    finishTapeDrawing(e) {
        if (!this.state.tapePreview || !this.state.tapeStartPos) {
            this.state.isDrawingTape = false;
            return;
        }

        const rect = this.els.container.getBoundingClientRect();
        const currentX = e.clientX - rect.left + this.els.container.scrollLeft;
        const currentY = e.clientY - rect.top + this.els.container.scrollTop;

        const startX = this.state.tapeStartPos.x;
        const startY = this.state.tapeStartPos.y;

        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const w = Math.abs(currentX - startX);
        const h = Math.abs(currentY - startY);

        // Remove preview
        this.state.tapePreview.remove();
        this.state.tapePreview = null;
        this.state.tapeStartPos = null;
        this.state.isDrawingTape = false;

        // Only create tape if it has minimum size
        if (w >= 20 && h >= 10) {
            this.addTapeBox(x, y, w, h);
            App.ui.showToast('🎯 Occluded', { duration: 2000 });
        }
    },

    // PAN FUNCTIONALITY
    startPanning(e) {
        this.state.isPanning = true;
        this.state.panStart = { x: e.clientX, y: e.clientY };
        this.els.canvas.style.cursor = 'grabbing';
    },

    doPanning(e) {
        if (!this.state.isPanning) return;
        const dx = e.clientX - this.state.panStart.x;
        const dy = e.clientY - this.state.panStart.y;
        this.els.container.scrollLeft -= dx;
        this.els.container.scrollTop -= dy;
        this.state.panStart = { x: e.clientX, y: e.clientY };
    },

    stopPanning() {
        this.state.isPanning = false;
        this.els.canvas.style.cursor = 'grab';
    },


    // IMAGE MANIPULATION
    getCanvasCoords(e) {
        const rect = this.els.canvas.getBoundingClientRect();
        const zoom = this.state.zoom || 1;
        return {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom
        };
    },

    // Check if point is on a resize handle (returns handle name or null)
    getResizeHandle(pos) {
        if (!this.state.bgImageData) return null;
        const { x, y, w, h } = this.state.bgImageData;
        const handleSize = 12;

        // Corner handles
        const handles = {
            'nw': { x: x, y: y },
            'ne': { x: x + w, y: y },
            'sw': { x: x, y: y + h },
            'se': { x: x + w, y: y + h }
        };

        for (const [name, corner] of Object.entries(handles)) {
            if (Math.abs(pos.x - corner.x) < handleSize &&
                Math.abs(pos.y - corner.y) < handleSize) {
                return name;
            }
        }
        return null;
    },

    // Check if point is inside image bounds
    isInsideImage(pos) {
        if (!this.state.bgImageData) return false;
        const { x, y, w, h } = this.state.bgImageData;
        return pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h;
    },

    handleImageMouseDown(e) {
        const pos = this.getCanvasCoords(e);

        // Check for resize handle first
        const handle = this.getResizeHandle(pos);
        if (handle) {
            this.state.isResizingImage = true;
            this.state.resizeHandle = handle;
            this.state.dragStartPos = { ...pos };
            this.state.dragStartImagePos = { ...this.state.bgImageData };
            e.preventDefault();
            return;
        }

        // Check if clicking on image (for dragging)
        if (this.isInsideImage(pos)) {
            this.state.isDraggingImage = true;
            this.state.dragStartPos = { ...pos };
            this.state.dragStartImagePos = { ...this.state.bgImageData };
            this.els.canvas.style.cursor = 'grabbing';
            e.preventDefault();
        }
    },

    handleImageMouseMove(e) {
        const pos = this.getCanvasCoords(e);

        if (this.state.isDraggingImage) {
            // Move image
            const dx = pos.x - this.state.dragStartPos.x;
            const dy = pos.y - this.state.dragStartPos.y;
            this.state.bgImageData.x = this.state.dragStartImagePos.x + dx;
            this.state.bgImageData.y = this.state.dragStartImagePos.y + dy;
            this.redrawWithImage();
        } else if (this.state.isResizingImage) {
            // Resize image (maintain aspect ratio)
            const startImg = this.state.dragStartImagePos;
            const aspectRatio = startImg.w / startImg.h;
            const handle = this.state.resizeHandle;

            let newX = startImg.x;
            let newY = startImg.y;
            let newW = startImg.w;
            let newH = startImg.h;

            const dx = pos.x - this.state.dragStartPos.x;
            const dy = pos.y - this.state.dragStartPos.y;

            if (handle === 'se') {
                newW = Math.max(100, startImg.w + dx);
                newH = newW / aspectRatio;
            } else if (handle === 'sw') {
                newW = Math.max(100, startImg.w - dx);
                newH = newW / aspectRatio;
                newX = startImg.x + startImg.w - newW;
            } else if (handle === 'ne') {
                newW = Math.max(100, startImg.w + dx);
                newH = newW / aspectRatio;
                newY = startImg.y + startImg.h - newH;
            } else if (handle === 'nw') {
                newW = Math.max(100, startImg.w - dx);
                newH = newW / aspectRatio;
                newX = startImg.x + startImg.w - newW;
                newY = startImg.y + startImg.h - newH;
            }

            this.state.bgImageData = {
                ...this.state.bgImageData,
                x: newX, y: newY, w: newW, h: newH
            };
            this.redrawWithImage();
        }
    },

    handleImageMouseUp(e) {
        if (this.state.isDraggingImage || this.state.isResizingImage) {
            this.state.isDraggingImage = false;
            this.state.isResizingImage = false;
            this.state.resizeHandle = null;
            this.els.canvas.style.cursor = 'default';
            // Save history for undo
            this.saveState();
        }
    },

    updateImageCursor(e) {
        const pos = this.getCanvasCoords(e);
        const handle = this.getResizeHandle(pos);

        if (handle) {
            const cursors = {
                'nw': 'nwse-resize',
                'ne': 'nesw-resize',
                'sw': 'nesw-resize',
                'se': 'nwse-resize'
            };
            this.els.canvas.style.cursor = cursors[handle];
        } else if (this.isInsideImage(pos)) {
            this.els.canvas.style.cursor = 'move';
        } else {
            this.els.canvas.style.cursor = 'default';
        }
    },

    // Redraw canvas with image and handles
    redrawWithImage() {
        if (!this.state.backgroundImage || !this.state.bgImageData) return;

        if (this.state.useSeparateBgImage) {
            const { x, y, w, h } = this.state.bgImageData;

            if (this.els.bgImage) {
                this.els.bgImage.style.left = x + 'px';
                this.els.bgImage.style.top = y + 'px';
                this.els.bgImage.style.width = w + 'px';
                this.els.bgImage.style.height = h + 'px';
            }

            if (this.state.tool === 'image') {
                const ctx = this.els.ctx;
                const dpr = window.devicePixelRatio || 1;
                const cornerRadius = 16;

                // Clear canvas and draw handles only
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
                ctx.scale(dpr, dpr);
                this.drawImageHandles(ctx, x, y, w, h, cornerRadius);
            }
            return;
        }

        const ctx = this.els.ctx;
        const dpr = window.devicePixelRatio || 1;
        const { x, y, w, h } = this.state.bgImageData;
        const cornerRadius = 16; // Modern rounded corners

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
        ctx.scale(dpr, dpr);

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
        ctx.beginPath();
        this.roundRect(ctx, x, y, w, h, cornerRadius);
        ctx.fillStyle = 'rgba(0,0,0,0.01)'; // Nearly invisible but triggers shadow
        ctx.fill();
        ctx.restore();

        // Draw background image with rounded corners using clip path
        ctx.save();
        ctx.beginPath();
        this.roundRect(ctx, x, y, w, h, cornerRadius);
        ctx.clip();
        ctx.drawImage(this.state.backgroundImage, x, y, w, h);
        ctx.restore();

        // Draw selection handles if image tool is active
        if (this.state.tool === 'image') {
            this.drawImageHandles(ctx, x, y, w, h, cornerRadius);
        }

    },

    // Helper function to draw rounded rectangles
    roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    },

    // Draw premium selection handles around image
    drawImageHandles(ctx, x, y, w, h, cornerRadius = 16) {
        const handleSize = 14;
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim() || '#6366f1';

        // Draw animated gradient border (premium look)
        ctx.save();
        ctx.strokeStyle = primaryColor;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -Date.now() / 100 % 24; // Animated dash
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        this.roundRect(ctx, x - 1, y - 1, w + 2, h + 2, cornerRadius);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Draw corner handles with shadow
        const corners = [
            { x: x, y: y },                 // NW
            { x: x + w, y: y },             // NE
            { x: x, y: y + h },             // SW
            { x: x + w, y: y + h }          // SE
        ];

        corners.forEach(corner => {
            // Handle shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;

            // White fill with primary border - circular handles
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, handleSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.restore();

            // Border
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, handleSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        });

        // Request animation frame for continuous border animation
        if (this.state.tool === 'image' && this.state.isImageAnnotation) {
            // Cancel previous frame to prevent stacking
            if (this.state.animationFrameId) {
                cancelAnimationFrame(this.state.animationFrameId);
            }
            this.state.animationFrameId = requestAnimationFrame(() => this.redrawWithImage());
        }
    },


    // TEXT BOX FUNCTIONALITY
    // Available font families for text boxes - 18 diverse options with cursive variety
    fontFamilies: [
        { name: 'Serif', value: 'var(--font-serif)' },
        { name: 'Display', value: 'var(--font-display)' },
        { name: 'Monospace', value: "'SF Mono', 'Fira Code', Consolas, monospace" },
        { name: 'Montserrat', value: "'Montserrat', sans-serif" },
        { name: 'Playfair', value: "'Playfair Display', Georgia, serif" },
        { name: 'Courier', value: "'Courier New', Courier, monospace" },
        { name: 'Trebuchet', value: "'Trebuchet MS', Helvetica, sans-serif" },
        { name: 'Impact', value: "Impact, 'Arial Black', sans-serif" },
        { name: 'Futura', value: "Futura, 'Century Gothic', sans-serif" },
        // Cursive & Script Fonts
        { name: 'Patrick Hand', value: "'Patrick Hand', cursive" },
        { name: 'Satisfy', value: "'Satisfy', cursive" },
        { name: 'Pacifico', value: "'Pacifico', cursive" },
        { name: 'Lobster', value: "'Lobster', cursive" },
        { name: 'Dancing Script', value: "'Dancing Script', cursive" },
        { name: 'Shadows Into Light', value: "'Shadows Into Light', cursive" },
        { name: 'Great Vibes', value: "'Great Vibes', cursive" },
        { name: 'Caveat', value: "'Caveat', cursive" },
        { name: 'Handwriting', value: "'Comic Sans MS', 'Segoe Print', cursive" }
    ],

    // Smart text box resizing (auto-grow to avoid clipping/overflow)
    ensureTextMeasureEl() {
        if (this.state.textMeasureEl && document.body.contains(this.state.textMeasureEl)) return this.state.textMeasureEl;
        const el = document.createElement('div');
        el.setAttribute('data-role', 'wb-text-measure');
        el.style.position = 'fixed';
        el.style.left = '-10000px';
        el.style.top = '-10000px';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        el.style.whiteSpace = 'pre-wrap';
        el.style.wordBreak = 'break-word';
        el.style.padding = '0';
        el.style.margin = '0';
        el.style.border = '0';
        el.style.boxSizing = 'border-box';
        document.body.appendChild(el);
        this.state.textMeasureEl = el;
        return el;
    },

    autoResizeTextBox(tb, opts = {}) {
        const box = tb?.element;
        if (!box) return;
        const content = box.querySelector('.wb-text-content');
        if (!content) return;

        // Don't fight the user's active drag gesture
        if (box.classList.contains('dragging')) return;

        const csBox = getComputedStyle(box);
        const padX = (parseFloat(csBox.paddingLeft) || 0) + (parseFloat(csBox.paddingRight) || 0);
        const padY = (parseFloat(csBox.paddingTop) || 0) + (parseFloat(csBox.paddingBottom) || 0);

        const measure = this.ensureTextMeasureEl();
        const csContent = getComputedStyle(content);
        measure.style.fontFamily = csContent.fontFamily;
        measure.style.fontSize = csContent.fontSize;
        measure.style.fontWeight = csContent.fontWeight;
        measure.style.lineHeight = csContent.lineHeight;

        const text = (content.innerText || '').replace(/\u00A0/g, ' ');
        const safeText = text.length ? text : ' '; // keep one line measurable

        // === Height auto-grow (respect current width/wrapping) ===
        const innerW = Math.max(80, (box.clientWidth || box.offsetWidth || 0) - padX);
        measure.style.whiteSpace = 'pre-wrap';
        measure.style.wordBreak = 'break-word';
        measure.style.width = innerW + 'px';
        measure.textContent = safeText;
        const desiredH = Math.ceil(measure.scrollHeight + padY);
        const minH = Math.max(50, desiredH); // allow growth; enforce minimum
        if ((box.offsetHeight || 0) < minH || opts.force) {
            // Only grow; never shrink automatically (keeps manual resize intent)
            box.style.height = Math.max(minH, box.offsetHeight || 0, 50) + 'px';
        }

        // === Width auto-grow (only if content would overflow horizontally) ===
        // Measure longest line without wrapping. Cap to container width remaining.
        measure.style.whiteSpace = 'pre';
        measure.style.wordBreak = 'normal';
        measure.style.width = 'auto';
        measure.style.display = 'inline-block';
        measure.textContent = safeText;
        const measuredW = Math.ceil(measure.scrollWidth + padX + 8); // small breathing room
        measure.style.display = 'block';

        const container = this.els?.container;
        const maxAllowed = container ? Math.max(160, container.scrollWidth - (tb.x || 0) - 24) : measuredW;
        const desiredW = Math.min(Math.max(120, measuredW), maxAllowed);
        if ((box.offsetWidth || 0) < desiredW) {
            box.style.width = desiredW + 'px';
        }

        this.drawConnectors?.();
    },

    createTextBox(e) {
        // If connecting via dot drag, don't create new box
        if (this.state.isConnecting) return;

        const rect = this.els.container.getBoundingClientRect();
        const x = e.clientX - rect.left + this.els.container.scrollLeft;
        const y = e.clientY - rect.top + this.els.container.scrollTop;
        const color = this.getActiveColor();

        this.addTextBox(x, y, color);
        this.setTool('select'); // Switch to select mode to allow interaction
    },

    addTextBox(x, y, color) {
        const id = ++this.state.textBoxIdCounter;

        const box = document.createElement('div');
        box.className = 'wb-text-box wb-spawn';
        box.setAttribute('data-id', id);
        box.setAttribute('data-box-style', 'default');
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.borderColor = color;

        box.innerHTML = `
            <div class="wb-text-controls">
                <button data-action="style" title="Change Style">◐</button>
                <button data-action="font-family" title="Change Font">Aa</button>
                <button data-action="font-down" title="Smaller">A-</button>
                <button data-action="font-up" title="Larger">A+</button>
                <div class="wb-ctrl-divider"></div>
                <button data-action="ai-spark" title="AI Sparks">✨</button>
                <button data-action="delete" class="danger" title="Delete">✕</button>
            </div>
            <div class="wb-text-content" contenteditable="true" style="color: ${color}; font-size: 16px; font-family: var(--font-body);" placeholder="Type here..."></div>
            <div class="wb-text-resize"></div>
            <div class="wb-connector-dot" title="Click to add child node"></div>
        `;

        this.els.container.appendChild(box);

        // Remove spawn class after animation
        setTimeout(() => box.classList.remove('wb-spawn'), 300);

        const textBoxData = {
            id,
            element: box,
            x, y,
            color,
            fontSize: 16,
            fontFamilyIndex: 0, // Track current font family
            boxStyleIndex: 0,  // Track current box style (0=default, 1=filled, 2=glass, 3=minimal)
        };
        this.state.textBoxes.push(textBoxData);

        // Setup interactions
        this.setupTextBoxInteractions(textBoxData);

        // Focus and select text - auto-editable immediately
        const content = box.querySelector('.wb-text-content');
        content.innerHTML = '';  // Clear placeholder
        setTimeout(() => {
            content.focus();
            this.selectTextBox(textBoxData);
            this.autoResizeTextBox(textBoxData, { force: true });
        }, 50);

        this.state.hasContent = true;
        this.scheduleScratchpadSave();

        return textBoxData;
    },

    spawnChildTextBox(parentTb) {
        const gapY = 150;
        // Random small x offset for organic look
        const x = parentTb.x + (Math.random() * 60 - 30);
        const y = parentTb.y + gapY;

        // Create new box with parent's color
        const childTb = this.addTextBox(x, y, parentTb.color);

        // Copy box style (gradient/filled/glass/outline)
        if (parentTb.boxStyleIndex !== undefined) {
            childTb.boxStyleIndex = parentTb.boxStyleIndex;
            const styles = ['default', 'filled', 'glass', 'minimal'];
            childTb.element.setAttribute('data-box-style', styles[parentTb.boxStyleIndex]);
        }

        // Copy font family
        if (parentTb.fontFamilyIndex !== undefined) {
            childTb.fontFamilyIndex = parentTb.fontFamilyIndex;
            const font = this.fontFamilies[parentTb.fontFamilyIndex];
            const childContent = childTb.element.querySelector('.wb-text-content');
            if (childContent && font) {
                childContent.style.fontFamily = font.value;
            }
        }

        // Copy font size
        if (parentTb.fontSize) {
            childTb.fontSize = parentTb.fontSize;
            const childContent = childTb.element.querySelector('.wb-text-content');
            if (childContent) {
                childContent.style.fontSize = parentTb.fontSize + 'px';
            }
        }

        this.updateTextBoxVisuals(childTb);

        this.state.connectors.push({
            from: parentTb.id,
            to: childTb.id,
            color: parentTb.color
        });
        this.drawConnectors();
    },

    navigateToParent(childTb) {
        // Find connection where to == childTb.id
        const connection = this.state.connectors.find(c => c.to === childTb.id);
        if (connection) {
            const parentTb = this.state.textBoxes.find(tb => tb.id === connection.from);
            if (parentTb) {
                this.selectTextBox(parentTb);
                // Also focus the text content
                const content = parentTb.element.querySelector('.wb-text-content');
                if (content) {
                    content.focus();
                    // Move cursor to end
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(content);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else {
            App.ui.showToast("No parent node found", "info");
        }
    },

    // --- AI EXPANSION LOGIC ---
    async expandNodeWithAI(parentNode) {
        const contentEl = parentNode.element.querySelector('.wb-text-content');
        const originalText = contentEl.innerText;

        if (!originalText || originalText.trim().length === 0) {
            App.ui.showToast("Please type a topic first!", "warning");
            return;
        }

        const btn = parentNode.element.querySelector('[data-action="ai-spark"]');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const systemPrompt = `Act as a Context-Aware Expert AI Expander. Analyze the provided input.

                If the input is a Broad Topic (e.g., 'Evolution'): Deconstruct it into 5-9 distinct, high-impact sub-topics or sub-concepts necessary to understand the main idea.

                If the input is a Specific Request (e.g., '5 Classical Dances of India'): Provide the direct answers or specific items requested as the nodes.

                Constraints:
                - Keep each node concise (under 12 words).
                - Return ONLY a raw JSON array of strings.
                - NO Markdown formatting. NO Code fences.

                Example Output: ["Answer 1", "Answer 2", "Answer 3"]`;
            const response = await App.services.ai.queryGenerativeAI(systemPrompt, originalText);

            if (!response) throw new Error("AI returned no content.");

            let cleanResponse = response.trim();
            // Sanitize Markdown code blocks if present
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            let concepts;
            try {
                concepts = JSON.parse(cleanResponse);
            } catch (e) {
                console.error("AI JSON Parse Error:", e, cleanResponse);
                throw new Error("AI response was not valid JSON.");
            }

            if (!Array.isArray(concepts) || concepts.length === 0) {
                throw new Error("AI returned no concepts.");
            }

            this.layoutAndCreateChildNodes(parentNode, concepts);
            App.ui.showToast(`Expanded with ${concepts.length} new ideas!`, "success");

        } catch (error) {
            console.error("AI Expansion Error:", error);
            App.ui.showToast("AI couldn't think right now.", "error");
        } finally {
            if (btn) btn.innerHTML = originalIcon;
        }
    },

    layoutAndCreateChildNodes(parentNode, concepts) {
        const count = concepts.length;
        const radius = 250; // Distance from parent

        const angleStep = (2 * Math.PI) / count;
        const canvasW = this.els.container.clientWidth;
        const canvasH = this.els.container.clientHeight;
        // Safety padding to prevent partial clipping
        const padding = 50;
        const boxW = 200; // Estimated box width
        const boxH = 100; // Estimated box height

        concepts.forEach((text, index) => {
            const angle = index * angleStep;

            let x = parentNode.x + radius * Math.cos(angle);
            let y = parentNode.y + radius * Math.sin(angle);

            // Clamp to within whiteboard bounds
            x = Math.max(padding, Math.min(x, canvasW - boxW - padding));
            y = Math.max(padding, Math.min(y, canvasH - boxH - padding));

            // Create node
            const childTb = this.addTextBox(x, y, parentNode.color);

            // Set text
            const contentEl = childTb.element.querySelector('.wb-text-content');
            if (contentEl) contentEl.innerText = text;

            // Create connector
            this.state.connectors.push({
                from: parentNode.id,
                to: childTb.id,
                color: parentNode.color
            });
        });

        this.drawConnectors();
    },

    // --- AUTO-LAYOUT MAGIC WAND (6 MODES) ---
    autoLayout() {
        // 0. Proactive CSS Fix


        // 1. Cycle Layout Modes (0 to 5)
        this.state.layoutMode = (this.state.layoutMode === undefined) ? 0 : (this.state.layoutMode + 1) % 6;
        const MODES = [
            'Radial Fit', 'Tree Horizontal', 'Tree Vertical',
            'Mind Map (Split)', 'Grid Gallery', 'Golden Spiral'
        ];
        const modeIdx = this.state.layoutMode;

        const nodes = this.state.textBoxes;
        const connectors = this.state.connectors;
        if (nodes.length === 0) return;

        // 2. Build Graph
        const adj = {};
        const inDegree = {};
        nodes.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
        connectors.forEach(c => {
            if (adj[c.from]) adj[c.from].push(c.to);
            if (inDegree[c.to] !== undefined) inDegree[c.to]++;
        });

        let roots = nodes.filter(n => inDegree[n.id] === 0);
        if (roots.length === 0 && nodes.length > 0) roots = [nodes[0]];

        // Parameters
        const W = this.els.container.clientWidth;
        const H = this.els.container.clientHeight;
        const margin = 100;
        const centerX = W / 2;
        const centerY = H / 2;

        // Common Helpers
        const getLeafCount = (nodeId, visited = new Set()) => {
            if (visited.has(nodeId)) return 1;
            visited.add(nodeId);
            const children = adj[nodeId] || [];
            if (children.length === 0) return 1;
            return children.reduce((sum, c) => sum + getLeafCount(c, new Set(visited)), 0);
        };

        const getMaxDepth = (nodeId, d = 0, visited = new Set()) => {
            if (visited.has(nodeId)) return d;
            visited.add(nodeId);
            const children = adj[nodeId] || [];
            if (children.length === 0) return d;
            return Math.max(...children.map(c => getMaxDepth(c, d + 1, new Set(visited))));
        };

        const moveTo = (nodeId, x, y) => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return;
            // Clamp
            const safeX = Math.max(20, Math.min(x, W - 160));
            const safeY = Math.max(20, Math.min(y, H - 90));

            node.x = safeX; node.y = safeY;
            node.element.style.transition = 'left 0.8s cubic-bezier(0.16, 1, 0.3, 1), top 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            node.element.style.left = safeX + 'px';
            node.element.style.top = safeY + 'px';
            setTimeout(() => { node.element.style.transition = ''; }, 850);
        };

        // --- ALGORITHMS ---

        if (modeIdx === 0) {
            // 1. RADIAL FIT
            let maxDepth = 0;
            roots.forEach(r => maxDepth = Math.max(maxDepth, getMaxDepth(r.id)));
            const rStepX = (W / 2 - margin) / Math.max(1, maxDepth);
            const rStepY = (H / 2 - margin) / Math.max(1, maxDepth);

            const getRadialWeight = (nid, visited = new Set()) => {
                if (visited.has(nid)) return 0;
                visited.add(nid);
                const children = adj[nid] || [];
                if (children.length === 0) return 1;
                return children.reduce((s, c) => s + getRadialWeight(c, new Set(visited)), 0);
            }

            const placeRadial = (nid, startA, endA, level, visited = new Set()) => {
                if (visited.has(nid)) return;
                visited.add(nid);
                const children = (adj[nid] || []).filter(c => !visited.has(c));
                const totalW = children.reduce((s, c) => s + getRadialWeight(c, new Set(visited)), 0);
                let curA = startA;
                children.forEach(cid => {
                    const w = getRadialWeight(cid, new Set(visited));
                    const share = (w / totalW) * (endA - startA);
                    const mid = curA + share / 2;
                    const radX = (level + 1) * rStepX;
                    const radY = (level + 1) * rStepY;
                    moveTo(cid, centerX + radX * Math.cos(mid), centerY + radY * Math.sin(mid));
                    placeRadial(cid, curA, curA + share, level + 1, new Set(visited));
                    curA += share;
                });
            };
            const rootGap = (W - 2 * margin) / (roots.length + 1);
            const gV = new Set();
            roots.forEach((r, i) => {
                moveTo(r.id, margin + rootGap * (i + 1), centerY);
                placeRadial(r.id, 0, 2 * Math.PI, 0, gV);
            });

        } else if (modeIdx === 1) {
            // 2. TREE HORIZONTAL (Left -> Right)
            let maxDepth = 0;
            roots.forEach(r => maxDepth = Math.max(maxDepth, getMaxDepth(r.id)));
            const xStep = (W - 2 * margin) / Math.max(1, maxDepth);

            const placeTreeH = (nid, x, yStart, yEnd, visited = new Set()) => {
                if (visited.has(nid)) return;
                visited.add(nid);
                const yMid = (yStart + yEnd) / 2;
                moveTo(nid, x, yMid);

                const children = (adj[nid] || []).filter(c => !visited.has(c));
                if (children.length === 0) return;

                const totalLeaves = children.reduce((s, c) => s + getLeafCount(c, new Set(visited)), 0);
                const hAvailable = yEnd - yStart;
                let curY = yStart;

                children.forEach(cid => {
                    const leaves = getLeafCount(cid, new Set(visited));
                    const hShare = (leaves / totalLeaves) * hAvailable;
                    placeTreeH(cid, x + xStep, curY, curY + hShare, new Set(visited));
                    curY += hShare;
                });
            };

            const totalLeaves = roots.reduce((s, r) => s + getLeafCount(r.id), 0);
            let curRootY = margin;
            const gV = new Set();
            roots.forEach(r => {
                const leaves = getLeafCount(r.id);
                const hShare = (leaves / totalLeaves) * (H - 2 * margin);
                placeTreeH(r.id, margin, curRootY, curRootY + hShare, gV);
                curRootY += hShare;
            });

        } else if (modeIdx === 2) {
            // 3. TREE VERTICAL (Top -> Down)
            let maxDepth = 0;
            roots.forEach(r => maxDepth = Math.max(maxDepth, getMaxDepth(r.id)));
            const yStep = (H - 2 * margin) / Math.max(1, maxDepth);

            const placeTreeV = (nid, y, xStart, xEnd, visited = new Set()) => {
                if (visited.has(nid)) return;
                visited.add(nid);
                const xMid = (xStart + xEnd) / 2;
                moveTo(nid, xMid, y);
                const children = (adj[nid] || []).filter(c => !visited.has(c));
                if (children.length === 0) return;
                const totalLeaves = children.reduce((s, c) => s + getLeafCount(c, new Set(visited)), 0);
                const wAvailable = xEnd - xStart;
                let curX = xStart;
                children.forEach(cid => {
                    const leaves = getLeafCount(cid, new Set(visited));
                    const wShare = (leaves / totalLeaves) * wAvailable;
                    placeTreeV(cid, y + yStep, curX, curX + wShare, new Set(visited));
                    curX += wShare;
                });
            };
            const totalLeaves = roots.reduce((s, r) => s + getLeafCount(r.id), 0);
            let curRootX = margin;
            const gV = new Set();
            roots.forEach(r => {
                const leaves = getLeafCount(r.id);
                const wShare = (leaves / totalLeaves) * (W - 2 * margin);
                placeTreeV(r.id, margin, curRootX, curRootX + wShare, gV);
                curRootX += wShare;
            });

        } else if (modeIdx === 3) {
            // 4. MIND MAP (Double Split Horizontal)
            // Split roots or first-level children into Left/Right groups based on balance
            let leftNodes = [], rightNodes = [];
            let leftWeight = 0, rightWeight = 0;
            const gV = new Set();

            // For single root with many children, split children
            if (roots.length === 1 && (adj[roots[0].id] || []).length > 1) {
                const r = roots[0];
                gV.add(r.id);
                const children = adj[r.id];
                // Sort children by size to balance
                children.sort((a, b) => getLeafCount(b) - getLeafCount(a));
                children.forEach(c => {
                    if (leftWeight <= rightWeight) { leftNodes.push(c); leftWeight += getLeafCount(c); }
                    else { rightNodes.push(c); rightWeight += getLeafCount(c); }
                });
                // Place Root Center
                moveTo(r.id, centerX, centerY);
            } else {
                // Multiple roots, split roots
                roots.sort((a, b) => getLeafCount(b.id) - getLeafCount(a.id));
                roots.forEach(r => {
                    if (leftWeight <= rightWeight) { leftNodes.push(r.id); leftWeight += getLeafCount(r.id); }
                    else { rightNodes.push(r.id); rightWeight += getLeafCount(r.id); }
                });
            }

            let maxDepth = 0;
            nodes.forEach(n => maxDepth = Math.max(maxDepth, getMaxDepth(n.id)));
            const xStep = (W / 2 - margin) / Math.max(1, maxDepth); // Half width available

            // Generalized Tree H with direction multiplier
            const placeSide = (nid, x, yStart, yEnd, dir, visited) => {
                if (visited.has(nid)) return;
                visited.add(nid);
                const yMid = (yStart + yEnd) / 2;
                moveTo(nid, x, yMid);

                const children = (adj[nid] || []).filter(c => !visited.has(c));
                if (children.length === 0) return;
                const totalLeaves = children.reduce((s, c) => s + getLeafCount(c, new Set(visited)), 0);
                const hAvailable = yEnd - yStart;
                let curY = yStart;
                children.forEach(cid => {
                    const leaves = getLeafCount(cid, new Set(visited));
                    const hShare = (leaves / totalLeaves) * hAvailable;
                    placeSide(cid, x + (xStep * dir), curY, curY + hShare, dir, visited);
                    curY += hShare;
                });
            };

            // Process Left
            let curY = margin;
            leftNodes.forEach(nid => {
                const leaves = getLeafCount(nid);
                const hShare = (leaves / Math.max(1, leftWeight)) * (H - 2 * margin);
                const startX = roots.length === 1 ? centerX - xStep : centerX - 50;
                placeSide(nid, startX, curY, curY + hShare, -1, gV);
                curY += hShare;
            });
            // Process Right
            curY = margin;
            rightNodes.forEach(nid => {
                const leaves = getLeafCount(nid);
                const hShare = (leaves / Math.max(1, rightWeight)) * (H - 2 * margin);
                const startX = roots.length === 1 ? centerX + xStep : centerX + 50;
                placeSide(nid, startX, curY, curY + hShare, 1, gV);
                curY += hShare;
            });

        } else if (modeIdx === 4) {
            // 5. GRID GALLERY (Grid Sort)
            // Ignore tree structure, pack by BFS order or ID
            // Let's use BFS from roots to keep related items somewhat near
            const sortedNodes = [];
            const visited = new Set();
            const queue = [...roots];

            while (queue.length > 0) {
                const r = queue.shift();
                if (visited.has(r.id)) continue;
                visited.add(r.id);
                sortedNodes.push(r);
                const children = adj[r.id] || [];
                queue.push(...children.map(cid => nodes.find(n => n.id === cid)).filter(x => x));
            }
            // Add any disconnected nodes
            nodes.forEach(n => { if (!visited.has(n.id)) sortedNodes.push(n); });

            const N = sortedNodes.length;
            const ratio = W / H;
            const cols = Math.ceil(Math.sqrt(N * ratio));
            const rows = Math.ceil(N / cols);

            const cellW = (W - 2 * margin) / cols;
            const cellH = (H - 2 * margin) / rows;

            sortedNodes.forEach((n, i) => {
                const c = i % cols;
                const r = Math.floor(i / cols);
                moveTo(n.id, margin + c * cellW + cellW / 2, margin + r * cellH + cellH / 2);
            });

        } else if (modeIdx === 5) {
            // 6. GOLDEN SPIRAL
            // Nodes in BFS order
            const sortedNodes = [];
            const visited = new Set();
            const queue = [...roots];
            while (queue.length > 0) {
                const r = queue.shift();
                if (visited.has(r.id)) continue;
                visited.add(r.id);
                sortedNodes.push(r);
                const children = adj[r.id] || [];
                queue.push(...children.map(cid => nodes.find(n => n.id === cid)).filter(x => x));
            }
            nodes.forEach(n => { if (!visited.has(n.id)) sortedNodes.push(n); });

            // Spiral Math
            const N = sortedNodes.length;
            // Determine max Radius needed to fit screen
            const maxR = Math.min(W, H) / 2 - margin;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399 rad

            // We choose parameters such that the last node lands at roughly maxR
            // r = c * sqrt(i)
            // maxR = c * sqrt(N) => c = maxR / sqrt(N)
            const c = maxR / Math.sqrt(Math.max(1, N));

            sortedNodes.forEach((n, i) => {
                if (i === 0) {
                    moveTo(n.id, centerX, centerY);
                } else {
                    const dist = c * Math.sqrt(i);
                    const theta = i * goldenAngle;
                    const x = centerX + dist * Math.cos(theta);
                    const y = centerY + dist * Math.sin(theta);
                    moveTo(n.id, x, y);
                }
            });
        }

        // Loop Animation
        let start = null;
        const animateConnectors = (timestamp) => {
            if (!start) start = timestamp;
            if (timestamp - start < 700) {
                this.drawConnectors();
                requestAnimationFrame(animateConnectors);
            } else {
                this.drawConnectors();
            }
        };
        requestAnimationFrame(animateConnectors);

        App.ui.showToast(`Layout: ${MODES[modeIdx]} (${modeIdx + 1}/6) ✨`, "success");
    },

    setupTextBoxInteractions(tb) {
        const box = tb.element;
        const content = box.querySelector('.wb-text-content');
        const resizeHandle = box.querySelector('.wb-text-resize');
        const self = this;

        // Prevent canvas drawing when interacting with text box
        box.addEventListener('mousedown', (e) => e.stopPropagation());
        box.addEventListener('touchstart', (e) => e.stopPropagation());

        // Select on click
        box.addEventListener('click', (e) => {
            e.stopPropagation();
            // If connecting, finish connection
            if (self.state.isConnecting && self.state.connectFromId !== tb.id) {
                self.finishConnection(tb);
                return;
            }
            self.selectTextBox(tb);
        });

        // Smart auto-resize while typing/pasting (grow only)
        if (content) {
            const scheduleResize = (force = false) => requestAnimationFrame(() => self.autoResizeTextBox(tb, { force }));
            content.addEventListener('input', () => {
                scheduleResize(false);
                self.state.hasContent = true;
                self.scheduleScratchpadSave();
            });
            content.addEventListener('blur', () => {
                self.scheduleScratchpadSave();
            });
            content.addEventListener('paste', () => setTimeout(() => {
                scheduleResize(true);
                self.state.hasContent = true;
                self.scheduleScratchpadSave();
            }, 0));
            content.addEventListener('focus', () => scheduleResize(true));
        }

        // Control buttons
        box.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'style') self.cycleBoxStyle(tb);
                else if (action === 'font-family') self.cycleFontFamily(tb);
                else if (action === 'font-down') self.changeFontSize(tb, -2);
                else if (action === 'font-up') self.changeFontSize(tb, 2);
                else if (action === 'delete') self.deleteTextBox(tb);
                else if (action === 'ai-spark') self.expandNodeWithAI(tb);
            });
        });

        // === DRAG FUNCTIONALITY ===
        let dragState = { active: false, startX: 0, startY: 0, boxX: 0, boxY: 0 };

        const onDragStart = (e) => {
            // Ignore if clicking on controls, content, resize, or any connector dot
            if (e.target.closest('.wb-text-controls') ||
                e.target.closest('.wb-text-content') ||
                e.target === resizeHandle ||
                e.target.closest('.wb-connector-dot') ||
                e.target.closest('.nk-accordion-control-btn')) return;

            dragState.active = true;
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            dragState.boxX = tb.x;
            dragState.boxY = tb.y;
            box.classList.add('dragging');
            e.preventDefault();
        };

        const onDragMove = (e) => {
            if (!dragState.active) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            tb.x = dragState.boxX + dx;
            tb.y = dragState.boxY + dy;
            box.style.left = tb.x + 'px';
            box.style.top = tb.y + 'px';
            self.drawConnectors();
        };

        const onDragEnd = () => {
            if (dragState.active) {
                dragState.active = false;
                box.classList.remove('dragging');
            }
        };

        box.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);

        // === RESIZE FUNCTIONALITY ===
        let resizeState = { active: false, startX: 0, startY: 0, w: 0, h: 0 };

        resizeHandle.addEventListener('mousedown', (e) => {
            resizeState.active = true;
            resizeState.startX = e.clientX;
            resizeState.startY = e.clientY;
            resizeState.w = box.offsetWidth;
            resizeState.h = box.offsetHeight;
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!resizeState.active) return;
            box.style.width = Math.max(100, resizeState.w + (e.clientX - resizeState.startX)) + 'px';
            box.style.height = Math.max(50, resizeState.h + (e.clientY - resizeState.startY)) + 'px';
            self.drawConnectors();
        });

        document.addEventListener('mouseup', () => {
            resizeState.active = false;
        });

        // === CONNECTOR DOT CLICK - Single dot for connections ===
        const connectorDot = box.querySelector('.wb-connector-dot');
        if (connectorDot) {
            connectorDot.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                self.spawnChildTextBox(tb);
            });
        }
    },

    changeFontSize(tb, delta) {
        tb.fontSize = Math.min(48, Math.max(10, (tb.fontSize || 16) + delta));
        const content = tb.element.querySelector('.wb-text-content');
        content.style.fontSize = tb.fontSize + 'px';
        this.autoResizeTextBox(tb, { force: true });
    },

    cycleFontFamily(tb) {
        // Cycle to next font family
        tb.fontFamilyIndex = ((tb.fontFamilyIndex || 0) + 1) % this.fontFamilies.length;
        const font = this.fontFamilies[tb.fontFamilyIndex];
        const content = tb.element.querySelector('.wb-text-content');
        content.style.fontFamily = font.value;
        App.ui.showToast(`Font: ${font.name}`, { duration: 1200 });
        this.autoResizeTextBox(tb, { force: true });
    },

    cycleBoxStyle(tb) {
        // Cycle through box styles: default → filled → glass → outline
        const styles = ['default', 'filled', 'glass', 'minimal'];
        const styleNames = ['Gradient', 'Filled', 'Glass', 'Outline'];
        tb.boxStyleIndex = ((tb.boxStyleIndex || 0) + 1) % styles.length;
        const newStyle = styles[tb.boxStyleIndex];
        tb.element.setAttribute('data-box-style', newStyle);

        this.updateTextBoxVisuals(tb);
        this.autoResizeTextBox(tb, { force: true });

        App.ui.showToast(`Style: ${styleNames[tb.boxStyleIndex]}`, { duration: 1200 });
    },

    // ========================
    // CONNECTOR FUNCTIONALITY
    // ========================
    // startConnection and finishConnection removed (deprecated)

    // Get edge point on a box based on angle to target
    getEdgePoint(box, targetCx, targetCy) {
        const el = box.element;
        const cx = box.x + el.offsetWidth / 2;
        const cy = box.y + el.offsetHeight / 2;
        const w = el.offsetWidth / 2;
        const h = el.offsetHeight / 2;

        const dx = targetCx - cx;
        const dy = targetCy - cy;
        const angle = Math.atan2(dy, dx);

        // Determine which edge based on angle
        const tanAngle = Math.abs(dy / (dx || 0.001));
        const boxTan = h / w;

        let edgeX, edgeY;
        if (tanAngle <= boxTan) {
            // Hits left or right edge
            edgeX = dx > 0 ? box.x + el.offsetWidth : box.x;
            edgeY = cy + (edgeX - cx) * Math.tan(angle);
        } else {
            // Hits top or bottom edge
            edgeY = dy > 0 ? box.y + el.offsetHeight : box.y;
            edgeX = cx + (edgeY - cy) / Math.tan(angle);
        }

        return { x: edgeX, y: edgeY };
    },

    // ========================
    // PASTE & IMAGE FUNCTIONALITY
    // Handle native paste event (Ctrl+V) - No permissions prompt usually!
    handleDragOver(e) { e.preventDefault(); e.stopPropagation(); },

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.dataTransfer || !e.dataTransfer.items) return;

        const items = e.dataTransfer.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        // --- Image Compression ---
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const jpegQuality = App.settings.get('jpegQuality') || 0.8;

                        let naturalWidth = img.width;
                        let naturalHeight = img.height;

                        if (App.config && App.config.image && App.config.image.maxWidth) {
                            const maxWidth = App.config.image.maxWidth;
                            if (naturalWidth > maxWidth) {
                                naturalHeight = (maxWidth / naturalWidth) * naturalHeight;
                                naturalWidth = maxWidth;
                            }
                        }

                        canvas.width = naturalWidth;
                        canvas.height = naturalHeight;
                        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
                        const mimeType = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
                        const compressedDataUrl = canvas.toDataURL(mimeType, jpegQuality);

                        // Display size
                        let w = naturalWidth;
                        let h = naturalHeight;
                        const maxW = 300;
                        if (w > maxW) {
                            h = (maxW / w) * h;
                            w = maxW;
                        }

                        // Place at drop position relative to container
                        const containerRect = this.els.container.getBoundingClientRect();
                        const x = (e.clientX - containerRect.left) + this.els.container.scrollLeft - (w / 2);
                        const y = (e.clientY - containerRect.top) + this.els.container.scrollTop - (h / 2);

                        this.addImageBox(x, y, compressedDataUrl, w, h);
                        App.ui.showToast('Image pasted from drop!', { duration: 2000 });
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(blob);
            }
        }
    },

    onPaste(e) {
        if (!this.state.isOpen) return;
        // Don't intercept if user is typing in a real input
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.contentEditable === 'true')) return;

        e.preventDefault();

        if (!e.clipboardData || !e.clipboardData.items) return;

        const items = e.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        // --- Image Compression ---
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const jpegQuality = App.settings.get('jpegQuality') || 0.8;

                        let naturalWidth = img.width;
                        let naturalHeight = img.height;

                        if (App.config && App.config.image && App.config.image.maxWidth) {
                            const maxWidth = App.config.image.maxWidth;
                            if (naturalWidth > maxWidth) {
                                naturalHeight = (maxWidth / naturalWidth) * naturalHeight;
                                naturalWidth = maxWidth;
                            }
                        }

                        canvas.width = naturalWidth;
                        canvas.height = naturalHeight;
                        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
                        const mimeType = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
                        const compressedDataUrl = canvas.toDataURL(mimeType, jpegQuality);

                        // Calculate center
                        const rect = this.els.container.getBoundingClientRect();
                        const cx = rect.width / 2;
                        const cy = rect.height / 2;

                        let w = naturalWidth;
                        let h = naturalHeight;
                        const maxW = 300;
                        if (w > maxW) {
                            h = (maxW / w) * h;
                            w = maxW;
                        }

                        this.addImageBox(cx - w / 2, cy - h / 2, compressedDataUrl, w, h);
                        App.ui.showToast('Image pasted via shortcut!', { duration: 2000 });
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(blob);
            } else if (item.type === 'text/plain') {
                item.getAsString((text) => {
                    if (text) {
                        const rect = this.els.container.getBoundingClientRect();
                        this.addTextBox(rect.width / 2 - 100, rect.height / 2 - 20, text);
                        App.ui.showToast('Text pasted via shortcut!', { duration: 2000 });
                    }
                });
            }
        }
    },

    // Smart Paste: Text or Image (Button Click)
    async pasteContent() {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                // Check for image
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            // --- Image Compression ---
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const jpegQuality = App.settings.get('jpegQuality') || 0.8;

                            let naturalWidth = img.width;
                            let naturalHeight = img.height;

                            if (App.config && App.config.image && App.config.image.maxWidth) {
                                const maxWidth = App.config.image.maxWidth;
                                if (naturalWidth > maxWidth) {
                                    naturalHeight = (maxWidth / naturalWidth) * naturalHeight;
                                    naturalWidth = maxWidth;
                                }
                            }

                            canvas.width = naturalWidth;
                            canvas.height = naturalHeight;
                            ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
                            const mimeType = imageType === 'image/png' ? 'image/png' : 'image/jpeg';
                            const compressedDataUrl = canvas.toDataURL(mimeType, jpegQuality);

                            // Default size
                            let w = naturalWidth;
                            let h = naturalHeight;
                            const maxW = 300;
                            if (w > maxW) {
                                h = (maxW / w) * h;
                                w = maxW;
                            }

                            // Center on screen
                            const rect = this.els.container.getBoundingClientRect();
                            const x = this.els.container.scrollLeft + (rect.width / 2) - (w / 2);
                            const y = this.els.container.scrollTop + (rect.height / 2) - (h / 2);

                            this.addImageBox(x, y, compressedDataUrl, w, h);
                            App.ui.showToast('Image pasted from clipboard!', { duration: 2000 });
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(blob);
                    return;
                }

                // Check for text
                const textType = item.types.find(type => type === 'text/plain');
                if (textType) {
                    const blob = await item.getType(textType);
                    const text = await blob.text();
                    if (text.trim()) {
                        const rect = this.els.container.getBoundingClientRect();
                        const x = this.els.container.scrollLeft + (rect.width / 2) - 100;
                        const y = this.els.container.scrollTop + (rect.height / 2) - 20;
                        const tb = this.addTextBox(x, y, this.getActiveColor());
                        const content = tb.element.querySelector('.wb-text-content');
                        // Use innerText to preserve line breaks
                        content.textContent = text;
                        App.ui.showToast('Text pasted from clipboard!', { duration: 2000 });
                    }
                    return;
                }
            }
        } catch (err) {
            console.warn('Clipboard API Read failed (probably permission denied or insecure context). Trying text fallback...', err);
            // Fallback for simple text
            try {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    const rect = this.els.container.getBoundingClientRect();
                    const x = this.els.container.scrollLeft + (rect.width / 2) - 100;
                    const y = this.els.container.scrollTop + (rect.height / 2) - 20;
                    const tb = this.addTextBox(x, y, this.getActiveColor());
                    tb.element.querySelector('.wb-text-content').textContent = text;
                    App.ui.showToast('Text pasted (Image paste requires Ctrl+V in this mode)', { duration: 3000 });
                    return; // Success text
                }
            } catch (e2) {
                // Ignore text error, show main error
            }

            App.ui.showToast('Could not access clipboard directly. Please use Ctrl+V / Cmd+V to paste.', { type: 'error', duration: 4000 });
        }
    },

    addImageBox(x, y, src, w, h) {
        const id = ++this.state.textBoxIdCounter; // Shared ID counter for simplicity

        const box = document.createElement('div');
        box.className = 'wb-image-box wb-spawn';
        box.setAttribute('data-id', id);
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = w + 'px';
        box.style.height = h + 'px';

        box.innerHTML = `
            <div class="wb-image-move-handle" title="Move"></div>
            <div class="wb-image-delete-handle" title="Delete">✕</div>
            <img src="${src}" draggable="false">
            <div class="wb-image-resize-handle"></div>
        `;

        this.els.container.appendChild(box);
        setTimeout(() => box.classList.remove('wb-spawn'), 300);

        const imageBoxData = {
            id,
            element: box,
            x, y, w, h,
            src
        };

        if (!this.state.imageBoxes) this.state.imageBoxes = [];
        this.state.imageBoxes.push(imageBoxData);

        this.setupImageBoxInteractions(imageBoxData);
        return imageBoxData;
    },

    setupImageBoxInteractions(ib) {
        const box = ib.element;
        const resizeHandle = box.querySelector('.wb-image-resize-handle');
        const self = this;

        // Stop propagation ONLY on interactive elements
        // box.addEventListener('mousedown', (e) => e.stopPropagation()); -> Removed to allow drawing through
        // box.addEventListener('touchstart', (e) => e.stopPropagation()); -> Removed

        // Selection - Handled by Move Handle mostly, but we can allow click selection only if clicking explicitly (rare if pointer events none)
        // With pointer-events: none on box, this click listener won't fire for the image body, which is what we want.
        box.addEventListener('click', (e) => {
            // This might not fire due to pointer-events: none, but if we ever re-enable, we want to prevent bubbling
            e.stopPropagation();
        });

        // Delete interaction
        const deleteHandle = box.querySelector('.wb-image-delete-handle');
        if (deleteHandle) {
            deleteHandle.addEventListener('click', (e) => {
                e.stopPropagation();
                box.remove();
                self.state.imageBoxes = self.state.imageBoxes.filter(i => i.id !== ib.id);
            });
            // Prevent click from bubbling to select (though pointer-events handles this, good safety)
            deleteHandle.addEventListener('mousedown', (e) => e.stopPropagation());
        }

        // Move Handle (Drag)
        const moveHandle = box.querySelector('.wb-image-move-handle');
        if (moveHandle) {
            moveHandle.addEventListener('click', (e) => {
                e.stopPropagation();
                // Select interaction
                self.state.textBoxes.forEach(t => t.element.classList.remove('active'));
                if (self.state.imageBoxes) self.state.imageBoxes.forEach(i => i.element.classList.remove('active'));
                box.classList.add('active');
                self.state.activeTextBox = null;
            });

            // Drag
            let dragState = { active: false, startX: 0, startY: 0, boxX: 0, boxY: 0 };
            const onDragStart = (e) => {
                dragState.active = true;
                dragState.startX = e.clientX;
                dragState.startY = e.clientY;
                dragState.boxX = ib.x;
                dragState.boxY = ib.y;
                box.classList.add('dragging');
                // Select on drag start
                self.state.textBoxes.forEach(t => t.element.classList.remove('active'));
                if (self.state.imageBoxes) self.state.imageBoxes.forEach(i => i.element.classList.remove('active'));
                box.classList.add('active');
                e.preventDefault();
                e.stopPropagation(); // Prevent canvas drawing
            };

            moveHandle.addEventListener('mousedown', onDragStart);

            const onDragMove = (e) => {
                if (!dragState.active) return;
                const dx = e.clientX - dragState.startX;
                const dy = e.clientY - dragState.startY;
                ib.x = dragState.boxX + dx;
                ib.y = dragState.boxY + dy;
                box.style.left = ib.x + 'px';
                box.style.top = ib.y + 'px';
            };

            const onDragEnd = () => {
                if (dragState.active) {
                    dragState.active = false;
                    box.classList.remove('dragging');
                }
            };

            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
        }

        // Remove generic box mousedown that blocked drawing
        // box.addEventListener('mousedown', ...); -> REMOVED

        // Resize
        let resizeState = { active: false, startX: 0, startY: 0, w: 0, h: 0 };
        resizeHandle.addEventListener('mousedown', (e) => {
            resizeState.active = true;
            resizeState.startX = e.clientX;
            resizeState.startY = e.clientY;
            resizeState.w = ib.w;
            resizeState.h = ib.h;
            e.stopPropagation(); // Prevent drag
            e.preventDefault();
        });
        const onResizeMove = (e) => {
            if (!resizeState.active) return;
            const dx = e.clientX - resizeState.startX;
            const dy = e.clientY - resizeState.startY;
            ib.w = Math.max(50, resizeState.w + dx);
            ib.h = Math.max(50, resizeState.h + dy);
            box.style.width = ib.w + 'px';
            box.style.height = ib.h + 'px';
        };
        const onResizeEnd = () => {
            resizeState.active = false;
        };
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeEnd);
    },

    // ========================
    // OCCLUSION TAPE FUNCTIONS
    // ========================
    addTapeBox(x, y, w, h) {
        const id = ++this.state.tapeIdCounter;

        const box = document.createElement('div');
        box.className = 'wb-tape-box wb-spawn';
        box.setAttribute('data-tape-id', id);
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = Math.max(40, w) + 'px';
        box.style.height = Math.max(20, h) + 'px';

        box.innerHTML = `
            <div class="wb-tape-delete" title="Delete">✕</div>
            <div class="wb-tape-resize"></div>
        `;

        this.els.container.appendChild(box);
        setTimeout(() => box.classList.remove('wb-spawn'), 300);

        const tapeData = {
            id,
            element: box,
            x, y,
            w: Math.max(40, w),
            h: Math.max(20, h),
            revealed: false
        };

        this.state.tapeBoxes.push(tapeData);
        this.setupTapeBoxInteractions(tapeData);

        this.state.hasContent = true;
        this.scheduleScratchpadSave();

        return tapeData;
    },

    setupTapeBoxInteractions(tb) {
        const box = tb.element;
        const resizeHandle = box.querySelector('.wb-tape-resize');
        const deleteBtn = box.querySelector('.wb-tape-delete');
        const self = this;

        // Prevent canvas drawing when interacting with tape
        box.addEventListener('mousedown', (e) => e.stopPropagation());
        box.addEventListener('touchstart', (e) => e.stopPropagation());

        // Toggle reveal on click (but not on delete/resize)
        box.addEventListener('click', (e) => {
            if (e.target.closest('.wb-tape-delete') || e.target.closest('.wb-tape-resize')) return;
            e.stopPropagation();

            // Toggle revealed state
            tb.revealed = !tb.revealed;
            box.classList.toggle('revealed', tb.revealed);

            // Deselect other tapes, select this one
            self.state.tapeBoxes.forEach(t => t.element.classList.remove('active'));
            box.classList.add('active');
        });

        // Delete handler
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            self.deleteTapeBox(tb);
        });

        // === DRAG FUNCTIONALITY ===
        let dragState = { active: false, startX: 0, startY: 0, boxX: 0, boxY: 0 };

        const onDragStart = (e) => {
            if (e.target.closest('.wb-tape-delete') || e.target.closest('.wb-tape-resize')) return;

            dragState.active = true;
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            dragState.boxX = tb.x;
            dragState.boxY = tb.y;
            box.classList.add('dragging');
            e.preventDefault();
        };

        const onDragMove = (e) => {
            if (!dragState.active) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            tb.x = dragState.boxX + dx;
            tb.y = dragState.boxY + dy;
            box.style.left = tb.x + 'px';
            box.style.top = tb.y + 'px';
        };

        const onDragEnd = () => {
            if (dragState.active) {
                dragState.active = false;
                box.classList.remove('dragging');
            }
        };

        box.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);

        // === RESIZE FUNCTIONALITY ===
        let resizeState = { active: false, startX: 0, startY: 0, w: 0, h: 0 };

        resizeHandle.addEventListener('mousedown', (e) => {
            resizeState.active = true;
            resizeState.startX = e.clientX;
            resizeState.startY = e.clientY;
            resizeState.w = tb.w;
            resizeState.h = tb.h;
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!resizeState.active) return;
            tb.w = Math.max(40, resizeState.w + (e.clientX - resizeState.startX));
            tb.h = Math.max(20, resizeState.h + (e.clientY - resizeState.startY));
            box.style.width = tb.w + 'px';
            box.style.height = tb.h + 'px';
        });

        document.addEventListener('mouseup', () => {
            resizeState.active = false;
        });
    },

    deleteTapeBox(tb) {
        tb.element.remove();
        this.state.tapeBoxes = this.state.tapeBoxes.filter(t => t.id !== tb.id);
    },

    drawConnectors() {
        if (!this.els.connectorsSvg) return;

        let svg = '';

        // Add SVG filter for subtle connector shadows
        svg += `<defs>
            <filter id="connectorShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.12"/>
            </filter>
        </defs>`;

        this.state.connectors.forEach((conn) => {
            const fromBox = this.state.textBoxes.find(t => t.id === conn.from);
            const toBox = this.state.textBoxes.find(t => t.id === conn.to);
            if (!fromBox || !toBox) return;

            const fromEl = fromBox.element;
            const toEl = toBox.element;

            // Get center points
            const fromCx = fromBox.x + fromEl.offsetWidth / 2;
            const fromCy = fromBox.y + fromEl.offsetHeight / 2;
            const toCx = toBox.x + toEl.offsetWidth / 2;
            const toCy = toBox.y + toEl.offsetHeight / 2;

            // Calculate edge points (border-to-border)
            const fromEdge = this.getEdgePoint(fromBox, toCx, toCy);
            const toEdge = this.getEdgePoint(toBox, fromCx, fromCy);

            // Use connection color (from parent box)
            const strokeColor = conn.color || 'var(--primary-color)';

            // --- SMART BEZIER CURVES ---
            const startX = fromEdge.x;
            const startY = fromEdge.y;
            const endX = toEdge.x;
            const endY = toEdge.y;

            const dx = endX - startX;
            const dy = endY - startY;

            // Determine orientation for natural flow (Vertical vs Horizontal)
            const isHorizontal = Math.abs(dx) > Math.abs(dy);

            let pathD = '';
            // Curvature intensity allows for organic flow
            const intensity = 0.5;

            if (isHorizontal) {
                // Horizontal "S" Curve
                // Control points extracted horizontally
                const cp1X = startX + dx * intensity;
                const cp1Y = startY;
                const cp2X = endX - dx * intensity;
                const cp2Y = endY;
                pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
            } else {
                // Vertical "S" Curve
                // Control points extracted vertically
                const cp1X = startX;
                const cp1Y = startY + dy * intensity;
                const cp2X = endX;
                const cp2Y = endY - dy * intensity;
                pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
            }

            // Draw organic path connector
            svg += `<path d="${pathD}" 
                stroke="${strokeColor}" 
                stroke-width="2.5" 
                fill="none"
                stroke-linecap="round"
                filter="url(#connectorShadow)"
                style="opacity: 0.85; transition: stroke 0.3s ease;"/>`;
        });

        this.els.connectorsSvg.innerHTML = svg;
    },

    selectTextBox(tb) {
        this.deselectAllTextBoxes();
        tb.element.classList.add('active');
        this.state.activeTextBox = tb;
    },

    deselectAllTextBoxes() {
        this.state.textBoxes.forEach(tb => {
            tb.element.classList.remove('active');
        });
        this.state.activeTextBox = null;
    },

    deleteTextBox(tb) {
        tb.element.remove();
        this.state.textBoxes = this.state.textBoxes.filter(t => t.id !== tb.id);

        // Remove associated connectors
        this.state.connectors = this.state.connectors.filter(c => c.from !== tb.id && c.to !== tb.id);
        this.drawConnectors();

        if (this.state.activeTextBox?.id === tb.id) {
            this.state.activeTextBox = null;
        }
    },

    // ========================
    // DRAWING FUNCTIONALITY
    // ========================
    startDrawing(e) {
        const rect = this.els.canvas.getBoundingClientRect();

        this.state.startPos = {
            x: (e.clientX - rect.left) / this.state.zoom,
            y: (e.clientY - rect.top) / this.state.zoom
        };
        this.state.lastPos = { ...this.state.startPos };

        // Save current state for undo before starting new stroke
        this.saveToHistory();

        this.state.isDrawing = true;

        if (this.state.tool === 'pen' || this.state.tool === 'eraser') {
            this.els.ctx.beginPath();
            this.els.ctx.moveTo(this.state.lastPos.x, this.state.lastPos.y);
        }

        // For shape tools, save the image to restore during preview
        if (['line', 'rect', 'circle', 'star'].includes(this.state.tool)) {
            this.state.previewImageData = this.els.ctx.getImageData(0, 0, this.els.canvas.width, this.els.canvas.height);
        }
    },

    draw(e) {
        if (!this.state.isDrawing) return;

        const rect = this.els.canvas.getBoundingClientRect();
        const pos = {
            x: (e.clientX - rect.left) / this.state.zoom,
            y: (e.clientY - rect.top) / this.state.zoom
        };

        const ctx = this.els.ctx;

        if (this.state.tool === 'pen') {
            ctx.strokeStyle = this.getActiveColor();
            ctx.lineWidth = this.state.thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Smooth curve algorithm: Draw from previous mid to new mid
            // using the previous point as control point
            const midPoint = {
                x: (this.state.lastPos.x + pos.x) / 2,
                y: (this.state.lastPos.y + pos.y) / 2
            };

            ctx.quadraticCurveTo(this.state.lastPos.x, this.state.lastPos.y, midPoint.x, midPoint.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(midPoint.x, midPoint.y);
            this.state.lastPos = pos;
        } else if (this.state.tool === 'eraser') {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = this.state.thickness * 8; // Larger eraser for better usability
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.restore();
            this.state.lastPos = pos;
        } else {
            // Shapes: redraw preview
            if (this.state.previewImageData) {
                ctx.putImageData(this.state.previewImageData, 0, 0);
            }
            this.drawShape(this.state.startPos, pos);
        }
    },

    stopDrawing(e) {
        if (!this.state.isDrawing) return;

        // Finish smooth curve for pen (connect last midpoint to actual end)
        if (this.state.tool === 'pen') {
            this.els.ctx.lineTo(this.state.lastPos.x, this.state.lastPos.y);
            this.els.ctx.stroke();
            this.els.ctx.closePath();
        }

        this.state.isDrawing = false;

        // Finalize shape if drawing a shape
        if (['line', 'rect', 'circle', 'star'].includes(this.state.tool) && e) {
            const rect = this.els.canvas.getBoundingClientRect();
            const pos = {
                x: (e.clientX - rect.left) / this.state.zoom,
                y: (e.clientY - rect.top) / this.state.zoom
            };
            // Clear the preview and draw final shape
            if (this.state.previewImageData) {
                this.els.ctx.putImageData(this.state.previewImageData, 0, 0);
            }
            this.drawShape(this.state.startPos, pos);
            this.state.previewImageData = null;
        }

        // End any ongoing paths
        this.els.ctx.beginPath();
        this.state.hasContent = true;
        this.saveToHistory();
        this.scheduleScratchpadSave();
    },

    drawShape(start, end) {
        const ctx = this.els.ctx;
        ctx.strokeStyle = this.getActiveColor();
        ctx.lineWidth = this.state.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        if (this.state.tool === 'line') {
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
        } else if (this.state.tool === 'rect') {
            ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (this.state.tool === 'circle') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        } else if (this.state.tool === 'star') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            const spikes = 5;
            const innerRadius = radius / 2;
            let rot = Math.PI / 2 * 3;
            let x = start.x;
            let y = start.y;
            const step = Math.PI / spikes;

            ctx.moveTo(start.x, start.y - radius);
            for (let i = 0; i < spikes; i++) {
                x = start.x + Math.cos(rot) * radius;
                y = start.y + Math.sin(rot) * radius;
                ctx.lineTo(x, y);
                rot += step;

                x = start.x + Math.cos(rot) * innerRadius;
                y = start.y + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(start.x, start.y - radius);
            ctx.closePath();
        }

        ctx.stroke();
    },

    saveToHistory() {
        const imageData = this.els.ctx.getImageData(0, 0, this.els.canvas.width, this.els.canvas.height);
        // Truncate history if we've undone and are adding new actions
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        }
        this.state.history.push(imageData);
        this.state.historyIndex = this.state.history.length - 1;
        // Limit history to 30 steps
        if (this.state.history.length > 30) {
            this.state.history.shift();
            this.state.historyIndex--;
        }
    },

    undo() {
        if (this.state.historyIndex < 0) {
            App.ui.showToast('Nothing to undo', { duration: 1000 });
            return;
        }
        if (this.state.historyIndex === 0) {
            // Clear to initial state
            this.els.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
            this.state.historyIndex = -1;

            // Redraw background image if in annotation mode (and not using separate element)
            if (this.state.isImageAnnotation && this.state.backgroundImage && this.state.bgImageData && !this.state.useSeparateBgImage) {
                const bg = this.state.bgImageData;
                this.els.ctx.drawImage(this.state.backgroundImage, bg.x, bg.y, bg.w, bg.h);
            }
        } else {
            this.state.historyIndex--;
            const imageData = this.state.history[this.state.historyIndex];
            this.els.ctx.putImageData(imageData, 0, 0);
        }
    },

    clear(wipeScratchpad = true) {
        this.state.history = [];
        this.state.historyIndex = -1;
        this.els.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);

        // Redraw background image if in annotation mode (and not using separate element)
        if (this.state.isImageAnnotation && this.state.backgroundImage && this.state.bgImageData && !this.state.useSeparateBgImage) {
            const bg = this.state.bgImageData;
            this.els.ctx.drawImage(this.state.backgroundImage, bg.x, bg.y, bg.w, bg.h);
        }

        // Also clear text boxes, image boxes, tape boxes and connectors
        this.state.textBoxes.forEach(tb => tb.element?.remove());
        this.state.textBoxes = [];
        if (this.state.imageBoxes) {
            this.state.imageBoxes.forEach(ib => ib.element?.remove());
            this.state.imageBoxes = [];
        }
        (this.state.tapeBoxes || []).forEach(tb => tb.element?.remove());
        this.state.tapeBoxes = [];
        this.state.activeTextBox = null;
        this.state.connectors = [];
        if (this.els.connectorsSvg) this.els.connectorsSvg.innerHTML = '';

        if (wipeScratchpad && !this.state.editingBlockId && !this.state.isImageAnnotation && !this.state.useSeparateBgImage) {
            this.clearScratchpadState();
            App.ui.showToast('🧹 Canvas cleared', { duration: 1200 });
        }
    },

    // Keyboard shortcuts removed per user request - users prefer clicking

    async addToArticle(keepOpen = false) {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.els.canvas.width / dpr;
        const displayHeight = this.els.canvas.height / dpr;

        if (typeof htmlToImage === 'undefined') {
            await App.loadLibrary('htmlToImage');
        }

        if (window.App && App.ui && App.ui.startLoadingProgress) {
            App.ui.startLoadingProgress();
        }


        // WYSIWYG EXPORT: Use html-to-image for perfect DOM snapshot
        try {
            // Hide all interactive elements before snapshot
            const controlsToHide = this.els.container.querySelectorAll('.wb-text-controls, .wb-text-resize, .wb-connector-dot, .wb-img-box-controls, .wb-img-box-resize, .wb-tape-box-controls, .wb-tape-box-resize');
            controlsToHide.forEach(el => {
                el.style.display = 'none';
            });

            // Temporarily hide the actual tape boxes so they don't get baked into the image
            const tapesToHide = this.els.container.querySelectorAll('.wb-tape-box');
            tapesToHide.forEach(tape => {
                tape.style.display = 'none';
            });

            // Also hide any active selection/focus states
            document.querySelectorAll('.wb-text-box.selected, .wb-img-box.selected, .wb-tape-box.selected').forEach(el => {
                el.classList.remove('selected');
            });


            const bgImg = document.getElementById('whiteboard-bg-image');
            const bgImgParent = bgImg ? bgImg.parentNode : null;
            const bgImgNextSibling = bgImg ? bgImg.nextSibling : null;

            // Only remove background image if we are NOT using it as the main content (Stage Mode)
            const shouldRemoveBg = bgImg && !this.state.useSeparateBgImage;
            if (shouldRemoveBg) {
                bgImg.remove();
            }

            const exportOptions = {
                quality: 1.0,
                pixelRatio: 2, // 2x for crisp export
                backgroundColor: null, // Preserve transparency
                cacheBust: true, // REVERTED: Match v8.176 behavior
                skipAutoScale: true,
                skipFonts: true,
                fontEmbedCSS: ''
            };

            // Generate PNG from actual DOM
            let dataUrl = await htmlToImage.toPng(this.els.container, exportOptions);

            const activeOcclusions = (this.state.tapeBoxes || []).filter(tb => !tb.revealed);
            const isVisualFlashcard = activeOcclusions.length > 0;

            let dataUrlBack = null;

            if (isVisualFlashcard) {
                dataUrlBack = dataUrl;

                this.state.tapeBoxes.forEach(tb => {
                    if (tb.element && !tb.revealed) {
                        tb.element.style.display = 'block';
                        tb.element.style.opacity = '1';
                    }
                });

                // Capture FRONT image (with tape)
                const dataUrlFront = await htmlToImage.toPng(this.els.container, exportOptions);

                // Swap: front becomes main dataUrl
                const temp = dataUrl;
                dataUrl = dataUrlFront;
            }

            // Restore background image
            if (shouldRemoveBg && bgImg && bgImgParent) {
                bgImgParent.insertBefore(bgImg, bgImgNextSibling);
            }

            // Restore visibility of controls
            controlsToHide.forEach(el => {
                el.style.display = '';
            });
            tapesToHide.forEach(tape => {
                tape.style.display = 'block';
            });

            // === NON-DESTRUCTIVE EMBED: Serialize and store state ===
            const whiteboardState = this.serializeState();
            const stateBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(whiteboardState))));

            const blockId = this.state.editingBlockId || `wb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const scriptId = `wbs-${blockId}`;

            const maxDisplayWidth = Math.min(displayWidth, 700);

            const dataVaultHTML = `<div id="${scriptId}" class="wb-data-vault" style="display:none;" data-role="wb-vault">${stateBase64}</div>`;

            let html;
            if (isVisualFlashcard) {
                const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
                html = `<div class="nk-visual-flashcard wb-embed" contenteditable="false" data-wb-id="${blockId}" data-wb-state-id="${scriptId}" style="max-width:${maxDisplayWidth}px;">
                    <div class="nk-vfc-inner">
                        <div class="nk-vfc-front">
                            <img src="${dataUrl}" alt="Visual Flashcard (Front)" data-original-width="${displayWidth}" data-original-height="${displayHeight}">
                            <button class="nk-vfc-edit-btn" title="Edit in Whiteboard">${editIcon}</button>
                        </div>
                        <div class="nk-vfc-back">
                            <img src="${dataUrlBack}" alt="Visual Flashcard (Back)" data-original-width="${displayWidth}" data-original-height="${displayHeight}">
                        </div>
                    </div>
                    <div class="resize-handle resize-handle-se"></div>
                    ${dataVaultHTML}
                </div>`;
            } else {
                // Standard Whiteboard HTML — use full article width (100%) so it feels native
                html = `<div class="image-container wb-embed wb-article-embed" contenteditable="false" data-wb-id="${blockId}" data-wb-state-id="${scriptId}"><img src="${dataUrl}" alt="Whiteboard sketch" data-original-width="${displayWidth}" data-original-height="${displayHeight}" style="width:100%; height:auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); display:block;"><div class="resize-handle resize-handle-se"></div>${dataVaultHTML}</div>`;
            }

            // Check if we're in stage mode (whiteboard opened from presentation)
            const stageArticleId = this.state.stageModeSrcArticleId;

            // Check if we're in Read Mode (whiteboard opened from read mode toolbar)
            const isReadMode = App.state.currentMode === 'read';
            const currentArticleId = App.state.activeArticleId; // FIX: was App.state.currentArticleId

            // CASE 1: STAGE MODE (Save directly to DB)
            // Only for Stage Mode where editor is not context
            if (stageArticleId) {
                const targetId = stageArticleId || currentArticleId;
                try {
                    const article = App.storage.getArticle(targetId);
                    if (article) {
                        // Append the whiteboard HTML to the article content
                        const newContent = (article.content || '') + `<p>${html}</p><p><br></p>`;
                        const existingFlashcards = article.flashcards || {};
                        const newFlashcards = App.util.extractFlashcards(newContent, targetId, article.category || 'General', existingFlashcards);
                        const newTags = App.contentTools.extractTagsFromHTML(newContent);

                        await App.storage.updateArticle(targetId, {
                            content: newContent,
                            flashcards: newFlashcards,
                            tags: newTags,
                            updatedAt: new Date().toISOString()
                        });

                        if (keepOpen) {
                            this.resetForNewWhiteboard();
                        } else {
                            this.close();
                            this.state.stageModeSrcArticleId = null; // Reset only when closing
                        }
                        App.ui.showToast(keepOpen ? '✅ Saved! Start your next whiteboard...' : '🎨 Sketch added to article!', { type: 'success' });
                        return;
                    } else {
                        App.ui.showToast('Article not found', { type: 'error' });
                        return;
                    }
                } catch (dbErr) {
                    console.error('Failed to save whiteboard to article:', dbErr);
                    App.ui.showToast('Failed to save to article: ' + dbErr.message, { type: 'error' });
                    return;
                }
            }

            // CASE 2: READ MODE (Save directly to DB like stage mode)
            if (isReadMode && currentArticleId && !this.state.stageModeSrcArticleId) {
                try {
                    const article = App.storage.getArticle(currentArticleId);
                    if (article) {
                        const newContent = (article.content || '') + `<p>${html}</p><p><br></p>`;
                        const existingFlashcards = article.flashcards || {};
                        const newFlashcards = App.util.extractFlashcards(newContent, currentArticleId, article.category || 'General', existingFlashcards);
                        const newTags = App.contentTools.extractTagsFromHTML(newContent);

                        await App.storage.updateArticle(currentArticleId, {
                            content: newContent,
                            flashcards: newFlashcards,
                            tags: newTags,
                            updatedAt: new Date().toISOString()
                        });
                        if (keepOpen) {
                            this.resetForNewWhiteboard();
                        } else {
                            this.close();
                        }
                        App.ui.showToast(keepOpen ? '✅ Saved! Start your next whiteboard...' : '🎨 Sketch saved to article!', { type: 'success' });
                        // Reload the article view so the embedded whiteboard appears
                        if (!keepOpen) {
                            App.router.navigateTo('article', { id: currentArticleId, mode: 'read' });
                        }
                        return;
                    } else {
                        App.ui.showToast('Article not found', { type: 'error' });
                        return;
                    }
                } catch (dbErr) {
                    console.error('Failed to save whiteboard (read mode):', dbErr);
                    App.ui.showToast('Failed to save: ' + dbErr.message, { type: 'error' });
                    return;
                }
            }

            // CASE 3: WRITE MODE (Insert into visible Editor DOM)
            // Try to insert into visible article-content
            let contentDiv = document.getElementById('article-content');

            if (!contentDiv) {
                // If opened from a view without an active editor (e.g. Study Mode, Mind Map, Visual Map, Library)
                this.saveScratchpadState();
                this.close();
                App.ui.showToast('💾 Scratchpad saved!', { type: 'success' });
                return;
            }

            // Check if we're UPDATING an existing embed (re-edit mode)
            let wasUpdated = false;
            if (this.state.editingBlockId) {
                const existingEmbed = contentDiv.querySelector(`.wb-embed[data-wb-id="${this.state.editingBlockId}"]`);
                if (existingEmbed) {
                    const isExistingFlashcard = existingEmbed.classList.contains('nk-visual-flashcard');

                    // If structure changed (normal <-> flashcard), replace entire embed
                    if (isVisualFlashcard !== isExistingFlashcard) {
                        existingEmbed.outerHTML = html;
                        console.log('Whiteboard type changed, replaced entire embed');
                    } else if (isVisualFlashcard) {
                        const frontImg = existingEmbed.querySelector('.nk-vfc-front img');
                        const backImg = existingEmbed.querySelector('.nk-vfc-back img');
                        if (backImg) backImg.src = dataUrlBack;
                        console.log('Visual Flashcard updated with front/back images');
                    } else {
                        const existingImg = existingEmbed.querySelector('img');
                        if (existingImg) {
                            existingImg.src = dataUrl;
                            existingImg.setAttribute('data-original-width', displayWidth);
                            existingImg.setAttribute('data-original-height', displayHeight);
                        }
                    }

                    // 4. Update the Data Storage
                    const scriptId = `wbs-${this.state.editingBlockId}`;
                    let scriptTag = document.getElementById(scriptId);

                    if (!scriptTag) {
                        // Create new data vault if it doesn't exist (inside the container)
                        scriptTag = document.createElement('div');
                        scriptTag.id = scriptId;
                        scriptTag.className = 'wb-data-vault';
                        scriptTag.style.display = 'none';
                        scriptTag.dataset.role = 'wb-vault';
                        existingEmbed.appendChild(scriptTag); // CHANGED: append inside, not after
                        existingEmbed.setAttribute('data-wb-state-id', scriptId);
                    }
                    // Update content
                    scriptTag.textContent = stateBase64;

                    console.log('Whiteboard updated (robust storage):', {
                        blockId: this.state.editingBlockId,
                        scriptId
                    });

                    wasUpdated = true;
                    this.state.editingBlockId = null;
                } else {
                    // Fallback in case existingEmbed not found despite ID
                    contentDiv.insertAdjacentHTML('beforeend', `<p>${html}</p><p><br></p>`);
                }
            } else if (this.state.isImageAnnotation && this.state.sourceImageContainer) {
                // INSERT annotated image AFTER the original (preserve original)
                const oldContainer = this.state.sourceImageContainer;
                if (contentDiv.contains(oldContainer)) {
                    // Find the parent paragraph or container to insert after
                    let insertAfter = oldContainer;
                    if (oldContainer.parentElement && oldContainer.parentElement.tagName === 'P') {
                        insertAfter = oldContainer.parentElement;
                    }
                    insertAfter.insertAdjacentHTML('afterend', `<p>${html}</p><p><br></p>`);
                    App.ui.showToast('✅ Annotated image added!', { type: 'success' });
                } else {
                    // Fallback if container was removed/lost
                    contentDiv.insertAdjacentHTML('beforeend', `<p>${html}</p><p><br></p>`);
                }
            } else if (this.state.insertMode === 'cursor' && App.state.currentMode === 'write') {
                if (App.state.savedRange) App.util.restoreSelection();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0 && contentDiv.contains(selection.anchorNode)) {
                    document.execCommand('insertHTML', false, `<p>${html}</p><p><br></p>`);
                    // Maintain sequential flow for "Save and New"
                    const updatedSelection = window.getSelection();
                    if (updatedSelection && updatedSelection.rangeCount > 0) {
                        App.state.savedRange = updatedSelection.getRangeAt(0);
                    }
                } else {
                    contentDiv.insertAdjacentHTML('beforeend', `<p>${html}</p><p><br></p>`);
                }
            } else {
                contentDiv.insertAdjacentHTML('beforeend', `<p>${html}</p><p><br></p>`);
            }
            // Mark dirty BEFORE save
            App.state.isArticleDirty = true;

            // IMPORTANT: Force a single save immediately to persist the change
            await App.events.saveArticle({ isAutosave: false });
            console.log("Whiteboard image saved to article.");


            if (keepOpen) {
                this.resetForNewWhiteboard();
            } else {
                this.close();
            }

            // Show appropriate toast (avoid duplicate for update case)
            if (wasUpdated) {
                App.ui.showToast(isVisualFlashcard ? '✅ Visual Flashcard updated!' : '✅ Whiteboard updated!', { type: 'success' });
            } else if (!this.state.isImageAnnotation) {
                if (keepOpen) {
                    App.ui.showToast('✅ Saved! Start your next whiteboard...', { type: 'success', duration: 2500 });
                } else {
                    App.ui.showToast(isVisualFlashcard ? '🃏 Visual Flashcard added!' : '🎨 Sketch added to article!', { type: 'success' });
                }
            }
        } catch (error) {
            console.error('Error exporting whiteboard:', error);
            App.ui.showToast('❌ Failed to export: ' + (error.message || 'Unknown error'), { type: 'error' });

            // RESTORE UI ON ERROR (Critical for usability if export fails)

            // 1. Restore Background Image if it was removed
            if (this.els.bgImage && !this.els.bgImage.parentNode && this.els.canvas && this.els.canvas.parentNode) {
                this.els.canvas.parentNode.insertBefore(this.els.bgImage, this.els.canvas);
            }

            // 2. Restore Controls Visibility
            const controls = this.els.container.querySelectorAll('.wb-text-controls, .wb-text-resize, .wb-connector-dot, .wb-img-box-controls, .wb-img-box-resize, .wb-tape-box-controls, .wb-tape-box-resize');
            controls.forEach(el => el.style.display = '');
            
            // 3. Restore Connector dots
            const connectorDots = this.els.container.querySelectorAll('.wb-connector-dot');
            connectorDots.forEach(dot => {
                dot.style.display = '';
            });
        } finally {
            if (window.App && App.ui && App.ui.stopLoadingProgress) {
                App.ui.stopLoadingProgress();
            }
        }
    },

    // Reset whiteboard content state to start a new sketch without closing
    resetForNewWhiteboard() {

        // Reset canvas (keep overlay open, just clear everything)
        this.state.pan = { x: 0, y: 0 };
        this.state.textBoxes = [];
        this.state.imageBoxes = [];
        this.state.tapeBoxes = [];
        this.state.tapeIdCounter = 0;
        this.state.activeTextBox = null;
        this.state.connectors = [];
        this.state.editingBlockId = null;
        this.state.isImageAnnotation = false;
        this.state.sourceImageContainer = null;
        this.state.backgroundImage = null;
        this.state.bgImageData = null;
        this.state.backgroundStyle = 0;
        this.state.useSeparateBgImage = false;
        if (this.els.bgImage) this.els.bgImage.style.display = 'none';
        if (this.els.container) {
            this.els.container.style.background = 'transparent';
            this.els.container.style.backgroundImage = 'none';
            // Remove any lingering DOM text/image/tape boxes
            this.els.container.querySelectorAll('.wb-text-box, .wb-img-box, .wb-tape-box').forEach(el => el.remove());
        }
        this.resizeCanvas();
        this.clear(false);
        this.setTool('pen');
    },

    hasScratchpadContent() {
        if (this.state.hasContent) return true;
        if (this.state.textBoxes && this.state.textBoxes.length > 0) return true;
        if (this.state.imageBoxes && this.state.imageBoxes.length > 0) return true;
        if (this.state.tapeBoxes && this.state.tapeBoxes.length > 0) return true;
        if (this.state.connectors && this.state.connectors.length > 0) return true;
        if (this.state.history && this.state.history.length > 0) return true;
        return false;
    },

    hasSavedContent(savedState) {
        if (!savedState) return false;
        if (savedState.textBoxes && savedState.textBoxes.length > 0) return true;
        if (savedState.imageBoxes && savedState.imageBoxes.length > 0) return true;
        if (savedState.tapeBoxes && savedState.tapeBoxes.length > 0) return true;
        if (savedState.connectors && savedState.connectors.length > 0) return true;
        if (savedState.canvasData && typeof savedState.canvasData === 'string' && savedState.canvasData.startsWith('data:image/')) return true;
        return false;
    },

    scheduleScratchpadSave() {
        if (this.state.editingBlockId || this.state.isImageAnnotation || this.state.useSeparateBgImage) {
            return;
        }
        if (this._saveScratchpadTimeout) {
            clearTimeout(this._saveScratchpadTimeout);
        }
        this._saveScratchpadTimeout = setTimeout(() => {
            this.saveScratchpadState();
        }, 300);
    },

    saveScratchpadState() {
        if (this.state.editingBlockId || this.state.isImageAnnotation || this.state.useSeparateBgImage) {
            return;
        }
        if (!this.hasScratchpadContent()) {
            return;
        }
        try {
            const state = this.serializeState();
            // 1. Fast synchronous cache in localStorage
            localStorage.setItem('notekash_wb_scratchpad_v1', JSON.stringify(state));

            // 2. Dual persistence across Folder Storage (App.fs file mode) and Browser Storage (App.fs IndexedDB)
            if (window.App && App.fs && typeof App.fs.write === 'function') {
                App.fs.write('_whiteboard_scratchpad.json', state).catch(err => {
                    console.warn('App.fs.write scratchpad warning:', err);
                });
            }
        } catch (e) {
            console.warn('Failed to save whiteboard scratchpad:', e);
        }
    },

    getScratchpadState() {
        try {
            const raw = localStorage.getItem('notekash_wb_scratchpad_v1');
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('Failed to parse whiteboard scratchpad from localStorage:', e);
        }
        return null;
    },

    async loadScratchpadFromStorage() {
        if (window.App && App.fs && typeof App.fs.read === 'function') {
            try {
                const fileData = await App.fs.read('_whiteboard_scratchpad.json');
                if (fileData && this.hasSavedContent(fileData)) {
                    localStorage.setItem('notekash_wb_scratchpad_v1', JSON.stringify(fileData));
                    return fileData;
                }
            } catch (e) {
                console.warn('Failed to read scratchpad from App.fs:', e);
            }
        }
        return null;
    },

    clearScratchpadState() {
        try {
            localStorage.removeItem('notekash_wb_scratchpad_v1');
        } catch (e) {}
        if (window.App && App.fs && typeof App.fs.write === 'function') {
            App.fs.write('_whiteboard_scratchpad.json', null).catch(() => {});
        }
        this.state.hasContent = false;
    },

    restoreFromState(savedState, isScratchpad = false) {
        if (!savedState) return;

        // Reset visual containers & elements
        this.state.textBoxes.forEach(tb => tb.element?.remove());
        this.state.textBoxes = [];
        (this.state.imageBoxes || []).forEach(ib => ib.element?.remove());
        this.state.imageBoxes = [];
        (this.state.tapeBoxes || []).forEach(tb => tb.element?.remove());
        this.state.tapeBoxes = [];
        this.state.tapeIdCounter = 0;
        this.state.connectors = [];
        if (this.els.connectorsSvg) this.els.connectorsSvg.innerHTML = '';

        this.state.hasContent = true;

        // Restore background style
        this.state.backgroundStyle = savedState.backgroundStyle || 0;
        if (this.els.container) {
            const bgColors = { 0: 'transparent', 1: '#ffffff', 2: '#1a1a2e', 3: '#fafafa' };
            this.els.container.style.background = bgColors[this.state.backgroundStyle] || 'transparent';
            if (this.state.backgroundStyle === 3) {
                this.els.container.style.backgroundImage =
                    'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), ' +
                    'linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)';
                this.els.container.style.backgroundSize = '20px 20px';
            } else {
                this.els.container.style.backgroundImage = 'none';
            }
            if (this.state.backgroundStyle === 2) {
                this.els.container.classList.add('wb-theme-dark');
            } else {
                this.els.container.classList.remove('wb-theme-dark');
            }
        }

        // Restore canvas drawing
        if (savedState.canvasData) {
            const img = new Image();
            const renderCanvas = () => {
                const dpr = window.devicePixelRatio || 1;
                this.els.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.els.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
                this.els.ctx.drawImage(img, 0, 0, this.els.canvas.width, this.els.canvas.height);
                this.els.ctx.scale(dpr, dpr);
                this.state.history = [];
                this.state.historyIndex = -1;
                this.saveToHistory();
                this.state.hasContent = true;
            };
            img.onload = renderCanvas;
            img.onerror = (err) => console.warn('Failed to load whiteboard canvasData image:', err);
            img.src = savedState.canvasData;
            if (img.complete && img.naturalWidth > 0) {
                renderCanvas();
            }
        }

        // Restore image boxes
        if (savedState.imageBoxes && savedState.imageBoxes.length > 0) {
            if (!this.state.imageBoxes) this.state.imageBoxes = [];
            savedState.imageBoxes.forEach(ibData => {
                this.addImageBox(ibData.x, ibData.y, ibData.src, ibData.w, ibData.h);
            });
        }

        // Restore text boxes
        const idMap = {};
        if (savedState.textBoxes && savedState.textBoxes.length > 0) {
            savedState.textBoxes.forEach(tbData => {
                const tb = this.addTextBox(tbData.x, tbData.y, tbData.color || this.getActiveColor());
                const content = tb.element.querySelector('.wb-text-content');
                if (content && tbData.text) {
                    content.textContent = tbData.text;
                }
                if (tbData.fontSize) {
                    tb.fontSize = tbData.fontSize;
                    content.style.fontSize = tbData.fontSize + 'px';
                }
                if (tbData.fontFamilyIndex !== undefined) {
                    tb.fontFamilyIndex = tbData.fontFamilyIndex;
                    const font = this.fontFamilies ? this.fontFamilies[tbData.fontFamilyIndex] : null;
                    if (font) content.style.fontFamily = font.value;
                }
                if (tbData.boxStyleIndex !== undefined) {
                    tb.boxStyleIndex = tbData.boxStyleIndex;
                    const styles = ['default', 'filled', 'glass', 'minimal'];
                    tb.element.setAttribute('data-box-style', styles[tbData.boxStyleIndex] || 'default');
                    this.updateTextBoxVisuals(tb);
                }
                if (tbData.width) tb.element.style.width = tbData.width + 'px';
                if (tbData.height) tb.element.style.minHeight = tbData.height + 'px';

                idMap[tbData.id] = tb.id;
            });
        }

        // Restore connectors
        if (savedState.connectors && savedState.connectors.length > 0) {
            savedState.connectors.forEach(conn => {
                const newFrom = idMap[conn.from] || conn.from;
                const newTo = idMap[conn.to] || conn.to;
                if (newFrom && newTo) {
                    this.state.connectors.push({
                        from: newFrom,
                        to: newTo,
                        color: conn.color
                    });
                }
            });
            setTimeout(() => this.drawConnectors(), 50);
        }

        // Restore tape boxes
        if (savedState.tapeBoxes && savedState.tapeBoxes.length > 0) {
            savedState.tapeBoxes.forEach(tbData => {
                const tape = this.addTapeBox(tbData.x, tbData.y, tbData.w, tbData.h);
                if (tbData.revealed) {
                    tape.revealed = true;
                    tape.element.classList.add('revealed');
                }
            });
            const maxId = Math.max(...savedState.tapeBoxes.map(t => t.id || 0));
            if (maxId >= this.state.tapeIdCounter) {
                this.state.tapeIdCounter = maxId + 1;
            }
        }

        // Restore tools & color
        this.setTool(savedState.tool || 'pen');
        if (savedState.color) this.setColor(savedState.color.replace(/^--/, ''));
        if (savedState.thickness) this.state.thickness = savedState.thickness;
    },

    // Reopen whiteboard from an existing wb-embed container
    reopenFromEmbed(embedContainer) {
        if (!embedContainer || !embedContainer.classList.contains('wb-embed')) {
            App.ui.showToast('This image is not an editable whiteboard', { type: 'info' });
            return;
        }

        // Debug: Log container info
        console.log('Reopening whiteboard from embed:', {
            hasWbState: !!embedContainer.dataset.wbState,
            wbId: embedContainer.dataset.wbId,
            stateLength: embedContainer.dataset.wbState?.length || 0,
            rawAttribute: embedContainer.getAttribute('data-wb-state')?.length || 0
        });

        // 1. Load from Robust Storage (Script Tag)
        let stateBase64 = null;
        const linkedScriptId = embedContainer.dataset.wbStateId;

        if (linkedScriptId) {
            const scriptTag = document.getElementById(linkedScriptId);
            if (scriptTag) {
                stateBase64 = scriptTag.textContent;
                console.log('Restoring from Robust Data Vault:', linkedScriptId);
            }
        }

        if (!stateBase64) {
            console.error('No linked script storage found for whiteboard:', embedContainer);
            App.ui.showToast('No whiteboard data found', { type: 'error' });
            return;
        }

        try {
            // Decode the base64 state
            const stateJson = decodeURIComponent(escape(atob(stateBase64)));
            const savedState = JSON.parse(stateJson);

            // Generate a unique ID for this embed if not present
            let embedId = embedContainer.dataset.wbId;
            if (!embedId) {
                embedId = 'wb-' + Date.now();
                embedContainer.dataset.wbId = embedId;
            }

            // Open whiteboard in edit mode
            this.state.insertMode = 'cursor';
            this.state.isOpen = true;
            this.state.editingBlockId = embedId; // Track which embed we're editing
            this.state.pan = { x: 0, y: 0 };
            this.state.isImageAnnotation = false;
            this.state.sourceImageContainer = null;
            this.state.backgroundImage = null;
            this.state.bgImageData = null;

            this.els.overlay.classList.add('active');
            this.els.overlay.focus();
            document.body.style.overflow = 'hidden';

            this.resizeCanvas();
            this.restoreFromState(savedState, false);

            App.ui.showToast('✏️ Whiteboard reopened for editing', { type: 'success' });

        } catch (err) {
            console.error('Failed to restore whiteboard state:', err);
            App.ui.showToast('Failed to restore whiteboard', { type: 'error' });
        }
    },

    // Serialize current whiteboard state for storage
    serializeState() {
        const dpr = window.devicePixelRatio || 1;
        return {
            version: 1,
            canvasData: this.els.canvas.toDataURL('image/png'),
            canvasWidth: this.els.canvas.width,
            canvasHeight: this.els.canvas.height,
            dpr: dpr,
            backgroundStyle: this.state.backgroundStyle,
            textBoxes: this.state.textBoxes.map(tb => ({
                id: tb.id,
                x: tb.x,
                y: tb.y,
                color: tb.color,
                fontSize: tb.fontSize,
                fontFamilyIndex: tb.fontFamilyIndex || 0,
                boxStyleIndex: tb.boxStyleIndex || 0,
                text: tb.element?.querySelector('.wb-text-content')?.textContent || '',
                width: tb.element?.offsetWidth || 200,
                height: tb.element?.offsetHeight || 100
            })),
            imageBoxes: (this.state.imageBoxes || []).map(ib => ({
                id: ib.id,
                x: ib.x,
                y: ib.y,
                w: ib.w,
                h: ib.h,
                src: ib.src
            })),
            connectors: this.state.connectors.map(c => ({
                from: c.from,
                to: c.to,
                color: c.color
            })),
            tapeBoxes: (this.state.tapeBoxes || []).map(tb => ({
                id: tb.id,
                x: tb.x,
                y: tb.y,
                w: tb.w,
                h: tb.h,
                revealed: tb.revealed || false
            })),
            tool: this.state.tool,
            color: this.state.color,
            thickness: this.state.thickness
        };
    },

    // Generate a thumbnail preview of the whiteboard
    generateThumbnail() {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.els.canvas.width / dpr;
        const displayHeight = this.els.canvas.height / dpr;

        // Create thumbnail canvas at smaller size
        const thumbCanvas = document.createElement('canvas');
        const thumbWidth = Math.min(displayWidth, 600);
        const scale = thumbWidth / displayWidth;
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = displayHeight * scale;
        const thumbCtx = thumbCanvas.getContext('2d');

        // Fill with theme background
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#ffffff';
        thumbCtx.fillStyle = bgColor;
        thumbCtx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);

        // Scale and draw canvas content
        thumbCtx.scale(scale, scale);
        thumbCtx.drawImage(this.els.canvas, 0, 0, displayWidth, displayHeight);

        // Draw connectors
        thumbCtx.lineWidth = 2.5;
        thumbCtx.lineCap = 'round';
        const defaultLineColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6366f1';
        this.state.connectors.forEach(conn => {
            const fromBox = this.state.textBoxes.find(t => t.id === conn.from);
            const toBox = this.state.textBoxes.find(t => t.id === conn.to);
            if (!fromBox || !toBox) return;

            const fromCx = fromBox.x + fromBox.element.offsetWidth / 2;
            const fromCy = fromBox.y + fromBox.element.offsetHeight / 2;
            const toCx = toBox.x + toBox.element.offsetWidth / 2;
            const toCy = toBox.y + toBox.element.offsetHeight / 2;

            const fromEdge = this.getEdgePoint(fromBox, toCx, toCy);
            const toEdge = this.getEdgePoint(toBox, fromCx, fromCy);

            const dx = toEdge.x - fromEdge.x;
            const dy = toEdge.y - fromEdge.y;
            const isMoreHorizontal = Math.abs(dx) > Math.abs(dy);

            let cp1x, cp1y, cp2x, cp2y;
            if (isMoreHorizontal) {
                cp1x = fromEdge.x + dx * 0.25; cp1y = fromEdge.y;
                cp2x = fromEdge.x + dx * 0.75; cp2y = toEdge.y;
            } else {
                cp1x = fromEdge.x; cp1y = fromEdge.y + dy * 0.25;
                cp2x = toEdge.x; cp2y = fromEdge.y + dy * 0.75;
            }

            thumbCtx.strokeStyle = conn.color || defaultLineColor;
            thumbCtx.beginPath();
            thumbCtx.moveTo(fromEdge.x, fromEdge.y);
            thumbCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toEdge.x, toEdge.y);
            thumbCtx.stroke();
        });

        // 3.5 Render Image Boxes (draw to canvas)
        if (this.state.imageBoxes) {
            this.state.imageBoxes.forEach(ib => {
                const imgEl = ib.element.querySelector('img');
                if (imgEl) {
                    thumbCtx.drawImage(imgEl, ib.x, ib.y, ib.w, ib.h);
                }
            });
        }

        // Draw text boxes
        this.state.textBoxes.forEach(tb => {
            const content = tb.element?.querySelector('.wb-text-content');
            const text = content?.textContent || '';
            const x = tb.x;
            const y = tb.y;
            const w = tb.element?.offsetWidth || 200;
            const h = tb.element?.offsetHeight || 100;

            thumbCtx.strokeStyle = tb.color;
            thumbCtx.lineWidth = 2;
            this.roundRect(thumbCtx, x, y, w, h, 8);
            thumbCtx.stroke();

            if (text.trim()) {
                thumbCtx.font = `${tb.fontSize || 16}px ${content?.style.fontFamily || 'sans-serif'} `;
                thumbCtx.fillStyle = tb.color;
                thumbCtx.textBaseline = 'middle';
                thumbCtx.textAlign = 'center';
                thumbCtx.fillText(text, x + w / 2, y + h / 2);
            }
        });

        // Render Tape Boxes for thumbnail
        if (this.state.tapeBoxes) {
            this.state.tapeBoxes.forEach(tb => {
                if (tb.revealed) return;

                const x = tb.x;
                const y = tb.y;
                const w = tb.w;
                const h = tb.h;
                const chamfer = 8;

                thumbCtx.save();
                thumbCtx.beginPath();
                thumbCtx.moveTo(x + chamfer, y);
                thumbCtx.lineTo(x + w - chamfer, y);
                thumbCtx.lineTo(x + w, y + chamfer);
                thumbCtx.lineTo(x + w, y + h - chamfer);
                thumbCtx.lineTo(x + w - chamfer, y + h);
                thumbCtx.lineTo(x + chamfer, y + h);
                thumbCtx.lineTo(x, y + h - chamfer);
                thumbCtx.lineTo(x, y + chamfer);
                thumbCtx.closePath();
                thumbCtx.fillStyle = '#fbbf24';
                thumbCtx.fill();
                thumbCtx.restore();
            });
        }

        return thumbCanvas.toDataURL('image/png', 0.7);
    },

    // Restore whiteboard state from saved data
    deserializeState(data) {
        if (!data || data.version !== 1) return;

        // Clear current state
        this.state.textBoxes.forEach(tb => tb.element?.remove());
        this.state.textBoxes = [];
        // Clear tape boxes
        (this.state.tapeBoxes || []).forEach(tb => tb.element?.remove());
        this.state.tapeBoxes = [];
        this.state.connectors = [];
        if (this.els.connectorsSvg) this.els.connectorsSvg.innerHTML = '';

        // Restore canvas
        const img = new Image();
        img.onload = () => {
            this.els.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
            this.els.ctx.drawImage(img, 0, 0);
        };
        img.src = data.canvasData;

        // Restore text boxes
        data.textBoxes.forEach(tb => {
            const box = this.createTextBoxFromData(tb);
            this.state.textBoxes.push(box);
        });

        // Restore connectors
        this.state.connectors = data.connectors.map(c => ({
            from: c.from,
            to: c.to,
            color: c.color
        }));

        // Restore tape boxes (Visual Flashcard occlusions)
        if (data.tapeBoxes && data.tapeBoxes.length > 0) {
            data.tapeBoxes.forEach(tb => {
                const tapeData = this.addTapeBox(tb.x, tb.y, tb.w, tb.h);
                // Restore revealed state
                if (tb.revealed) {
                    tapeData.revealed = true;
                    tapeData.element.classList.add('revealed');
                }
            });
            // Update tape ID counter
            const maxId = Math.max(...data.tapeBoxes.map(t => t.id || 0));
            if (maxId >= this.state.tapeIdCounter) {
                this.state.tapeIdCounter = maxId + 1;
            }
        }

        // Restore tool settings
        if (data.tool) this.setTool(data.tool);
        if (data.color) this.setColor(data.color);
        if (data.thickness) this.state.thickness = data.thickness;

        // Redraw connectors
        setTimeout(() => this.drawConnectors(), 100);
    },

    // Create a text box from saved data
    createTextBoxFromData(data) {
        const box = document.createElement('div');
        box.className = 'wb-text-box';
        box.style.cssText = `left: ${data.x} px; top: ${data.y} px; width: ${data.width} px; min - height: ${data.height} px; `;
        box.dataset.id = data.id;

        box.innerHTML = `
                    < div class="wb-text-controls" >
                <button class="wb-text-font-btn" title="Change Font">Aa</button>
                <button class="wb-text-size-btn" title="Increase Font Size">A+</button>
                <button class="wb-text-delete-btn" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div >
            <div class="wb-text-content" contenteditable="true" style="font-size: ${data.fontSize || 16}px; font-family: ${data.fontFamily || 'var(--font-body)'}; color: ${data.color || 'var(--text-primary)'}">${data.text || ''}</div>
            <div class="wb-text-resize"></div>
            <div class="wb-connector-dot" title="Click to connect"></div>
        `;

        box.style.borderColor = data.color;
        this.els.container.appendChild(box);

        const tb = {
            id: data.id,
            element: box,
            x: data.x,
            y: data.y,
            color: data.color,
            fontSize: data.fontSize,
            fontFamily: data.fontFamily
        };

        this.setupTextBoxInteractions(tb);

        // Update text box ID counter
        const idNum = parseInt(data.id.replace('tb-', ''));
        if (idNum >= this.state.textBoxIdCounter) {
            this.state.textBoxIdCounter = idNum + 1;
        }

        return tb;
    },

    // Helper to draw rounded rectangles on canvas
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },

    // Helper to wrap text for canvas rendering
    wrapText(ctx, text, maxWidth) {
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines.length ? lines : [text];
    },

    // Helper to convert any CSS color to rgba with custom alpha
    colorToRgba(color, alpha) {
        if (!color) return `rgba(99, 102, 241, ${alpha})`; // Default indigo

        // Already rgba - extract values and replace alpha
        if (color.startsWith('rgba')) {
            const match = color.match(/[\d.]+/g);
            if (match && match.length >= 3) {
                return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
            }
        }

        // rgb - extract values and add alpha
        if (color.startsWith('rgb')) {
            const match = color.match(/[\d.]+/g);
            if (match && match.length >= 3) {
                return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
            }
        }

        // Hex color
        if (color.startsWith('#')) {
            let hex = color.slice(1);
            // Handle shorthand hex (#RGB -> #RRGGBB)
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // Fallback - return as-is with hope it works
        return color;
    }
};

export default whiteboard;
