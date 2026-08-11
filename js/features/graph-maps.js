// ==========================================================================
// NoteKash - js/features/graph-maps.js
// Phase 5 Extraction: Mind Map + Visual Map (D3-force graph engines)
//
// ZERO REGRESSION POLICY: This is an exact copy of the logic from
// golden/NoteKash-v8.248c.html. No logic has been rewritten. All property
// names, method signatures, and behavior are identical to the original.
//
// Both modules depend on: App.state, App.ui, App.fs, App.util
// via global window.App — available at call-time (these modules are
// only activated when the user navigates to their respective views).
//
// Lazy-load pattern: This module is dynamically imported by the stub in
// main.js only when App.mindMap.init() or App.visualMap.init() is called.
// ==========================================================================

const ICON_FORCE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4h-2.5a3.5 3.5 0 0 0-3.5 3.5V11"/><path d="M6 11h2.5a3.5 3.5 0 0 1 3.5 3.5V18"/><circle cx="6" cy="4" r="2"/><circle cx="18" cy="18" r="2"/></svg>`;
const ICON_RADIAL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>`;
const ICON_MINDMAP_FORCE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h3M18 12h3M12 3v3M12 18v3"/><circle cx="12" cy="12" r="7"/><path d="M8.5 8.5c.66-.66 1.54-1.2 2.5-1.42"/><path d="M15.5 15.5c-.66.66-1.54 1.2-2.5 1.42"/><path d="M15.5 8.5c-.66-.66-1.54-1.2-2.5-1.42"/><path d="M8.5 15.5c.66.66 1.54 1.2 2.5 1.42"/></svg>`;
const ICON_MINDMAP_RADIAL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>`;
const ICON_MINDMAP_TOPDOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M6 9h12M6 15h12"/><circle cx="12" cy="3" r="3"/><circle cx="6" cy="9" r="3"/><circle cx="18" cy="9" r="3"/><circle cx="6" cy="15" r="3"/><circle cx="18" cy="15" r="3"/></svg>`;
const ICON_MINDMAP_LEFTRIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M9 6v12M15 6v12"/><circle cx="3" cy="12" r="3"/><circle cx="9" cy="6" r="3"/><circle cx="9" cy="18" r="3"/><circle cx="15" cy="6" r="3"/><circle cx="15" cy="18" r="3"/></svg>`;
const ICON_MINDMAP_SEQUENTIAL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><circle cx="6" cy="12" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg>`;

export const mindMap = {
                svg: null, g: null, zoom: null, simulation: null, width: 0, height: 0, resizeObserver: null, isInitialLoad: true,
                mindmapRoots: [], currentMindmapIndex: -1, nodeStates: {}, layoutMode: 'Force',
                currentSnapshotIndex: -1, currentMindmapSearchResults: [], currentMindmapSearchIndex: -1,

                // INTERNALIZED: ColorManager is now part of this module to avoid global conflicts.
                colorManager: {
                    palettes: [
                        'lime-ink', 'goldenrod-pad', 'mint-chip', 'aqua-sky', 'peach-sorbet', 'powder-snow',
                        'terminal', 'crimson-night', 'royal-indigo', 'emerald-tablet', 'obsidian-ruby', 'blueprint', 'midnight-sun',
                        'evergreen', 'clay-sky', 'sandstone-agave', 'stone-moss', 'mahogany', 'riverbed', 'matrix',
                        'rosewater', 'azure-depth', 'olive-grove', 'sterling', 'greyscale',
                        'neon-abyss', 'solar-eclipse', 'deep-ocean', 'cloud-nine'
                    ],
                    assignment: new Map(),
                    seed: 1,
                    _pseudoRandom() { let x = Math.sin(this.seed++) * 10000; return x - Math.floor(x); },
                    getSchemeFor(id, index) {
                        if (!this.assignment.has(id)) this.assignment.set(id, this.palettes[index % this.palettes.length]);
                        return this.assignment.get(id);
                    },
                    rotateSchemes() {
                        const shuffledPalettes = [...this.palettes];
                        for (let i = shuffledPalettes.length - 1; i > 0; i--) {
                            const j = Math.floor(this._pseudoRandom() * (i + 1));
                            [shuffledPalettes[i], shuffledPalettes[j]] = [shuffledPalettes[j], shuffledPalettes[i]];
                        }
                        const currentIds = Array.from(this.assignment.keys());
                        this.assignment.clear();
                        currentIds.forEach((id, index) => this.assignment.set(id, shuffledPalettes[index % shuffledPalettes.length]));
                    },
                    clear() { this.assignment.clear(); }
                },

                calculateEdgePoint(source, target) {
                    const dx = target.x - source.x; const dy = target.y - source.y;
                    if (dx === 0 && dy === 0) return { x: source.x, y: source.y };
                    const w = source.width / 2; const h = source.height / 2;
                    if (w === 0 || h === 0) return { x: source.x, y: source.y };
                    const slope = dy / dx; const absSlope = Math.abs(slope);
                    let x, y;
                    if (absSlope < h / w) { x = dx > 0 ? w : -w; y = slope * x; }
                    else { y = dy > 0 ? h : -h; x = y / slope; }
                    return { x: source.x + x, y: source.y + y };
                },

                async init() {
                    if (typeof d3 === 'undefined' && App.loadLibrary) {
                        try {
                            await App.loadLibrary('d3');
                        } catch (e) {
                            console.error('Failed to lazy load D3 for mindMap:', e);
                        }
                    }
                    if (typeof d3 === 'undefined') {
                        const container = document.getElementById('mindmap-container');
                        if (container) container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:var(--text-secondary);">Mind Map unavailable.</div>';
                        return;
                    }

                    this.isInitialLoad = true;

                    if (!App.state.dataCache.isBuilt) {
                        App.ui.showToast('Building mind map cache...', { type: 'info' });
                        App.contentTools.buildDataCache();
                        App.ui.showToast('Cache ready!', { type: 'success' });
                    }

                    if (this.svg) {
                        this.renderAllMindmaps();
                        return;
                    }

                    this.render();
                    this.initControls();

                    const container = document.getElementById('mindmap-container');
                    container.focus();

                    container.onkeydown = (e) => {
                        if (document.activeElement.tagName !== 'INPUT') {
                            if (e.key === ' ' && e.shiftKey) { this.zoomOut(); e.preventDefault(); }
                            else if (e.key === ' ') { this.zoomIn(); e.preventDefault(); }
                            else {
                                switch (e.key) {
                                    case 'ArrowUp': this._panCanvas(0, 1); e.preventDefault(); break;
                                    case 'ArrowDown': this._panCanvas(0, -1); e.preventDefault(); break;
                                    case 'ArrowLeft': this._panCanvas(1, 0); e.preventDefault(); break;
                                    case 'ArrowRight': this._panCanvas(-1, 0); e.preventDefault(); break;
                                    default:
                                        switch (e.key.toLowerCase()) {
                                            case 's': document.getElementById('mindmap-search-input').focus(); e.preventDefault(); break;
                                            case 'p': this.saveSnapshotAndExport(); e.preventDefault(); break;
                                            case 'k': this.navigateToNextMap(); e.preventDefault(); break;
                                            case 'j': this.navigateToPrevMap(); e.preventDefault(); break;
                                            case 'f': App.events.toggleCanvasFocusMode(); e.preventDefault(); break;
                                            case 'c':
                                                if (App.license.isPremium()) {
                                                    this.colorManager.rotateSchemes();
                                                    this.renderAllMindmaps();
                                                } else {
                                                    App.ui.showAscensionModal();
                                                }
                                                e.preventDefault();
                                                break;
                                            case 'escape':
                                                if (document.body.classList.contains('canvas-focus-mode')) {
                                                    App.events.toggleCanvasFocusMode();
                                                } else {
                                                    const searchInput = document.getElementById('mindmap-search-input');
                                                    searchInput.value = ''; this.searchNodes(''); searchInput.blur();
                                                }
                                                e.preventDefault();
                                                break;
                                        }
                                }
                            }
                        } else if (e.key === 'Enter' && document.activeElement === document.getElementById('mindmap-search-input')) {
                            e.preventDefault();
                            this.findNextSearchResult();
                        }
                    };

                    const snapshots = App.state.mindMapState.snapshots || [];
                    if (snapshots.length > 0) this.loadSnapshot(snapshots[snapshots.length - 1]);
                    else this.renderAllMindmaps();

                    this.resizeObserver = new ResizeObserver(entries => {
                        if (entries[0].contentRect.width < 1) return;
                        this.width = entries[0].contentRect.width;
                        this.height = entries[0].contentRect.height;
                        this.svg.attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height]);
                        if (this.simulation) this.simulation.force("center", d3.forceCenter(0, 0)).alpha(0.3).restart();
                    });
                    this.resizeObserver.observe(container);
                },

                triggerResize() {
                    const container = document.getElementById('mindmap-container');
                    if (!container || !this.resizeObserver) return;
                    // Temporarily disconnect to avoid infinite loops, manually trigger, then reconnect
                    this.resizeObserver.disconnect();
                    const newWidth = container.clientWidth;
                    const newHeight = container.clientHeight;
                    if (newWidth > 0 && newHeight > 0) {
                        this.width = newWidth;
                        this.height = newHeight;
                        this.svg.attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height]);
                        if (this.simulation) this.simulation.force("center", d3.forceCenter(0, 0)).alpha(0.3).restart();
                    }
                    this.resizeObserver.observe(container);
                },

                destroy() {
                    if (this.simulation && typeof d3 !== 'undefined') this.simulation.stop();
                    if (this.resizeObserver) this.resizeObserver.disconnect();
                    if (typeof d3 !== 'undefined') {
                        d3.select("#mindmap-container > svg").remove();
                        d3.select("#mindmap-container > #mindmap-sticky-layer").remove();
                    } else {
                        const svg = document.querySelector("#mindmap-container > svg");
                        if (svg) svg.remove();
                        const sticky = document.querySelector("#mindmap-container > #mindmap-sticky-layer");
                        if (sticky) sticky.remove();
                    }
                    this.pinBoard.pins.clear();
                    this.pinBoard._layer = null;
                    this.svg = this.g = this.zoom = this.simulation = this.resizeObserver = this.stickyLayer = null;
                },

                initControls() {
                    // Free Controls
                    document.getElementById('mindmap-find-next-btn').onclick = () => this.findNextSearchResult();
                    document.getElementById('mindmap-next-btn').onclick = () => this.navigateToNextMap();
                    document.getElementById('mindmap-prev-btn').onclick = () => this.navigateToPrevMap();
                    document.getElementById('mindmap-zoom-in-btn').onclick = () => this.zoomIn();
                    document.getElementById('mindmap-zoom-out-btn').onclick = () => this.zoomOut();
                    document.getElementById('mindmap-reset-view-btn').onclick = () => this.zoomToFit();
                    document.getElementById('mm-focus-line').onclick = () => App.events.toggleCanvasFocusMode();

                    // Search listeners
                    const searchInput = document.getElementById('mindmap-search-input');
                    searchInput.oninput = (e) => this.searchNodes(e.target.value);
                    searchInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); this.findNextSearchResult(); } };

                    // Premium Feature Gates
                    document.getElementById('mindmap-expand-all').onclick = () => {
                        if (App.license.isPremium()) { this.nodeStates = {}; this.renderAllMindmaps(); }
                        else App.ui.showAscensionModal();
                    };
                    document.getElementById('mindmap-collapse-all').onclick = () => {
                        if (App.license.isPremium()) {
                            Object.entries(App.state.dataCache.mindMapSnippets).forEach(([articleId, snippets]) => {
                                this.nodeStates[articleId] = { collapsed: true };
                                snippets.forEach(snippet => {
                                    this.nodeStates[snippet.id] = { collapsed: true };
                                });
                            });
                            this.renderAllMindmaps();
                        } else App.ui.showAscensionModal();
                    };
                    document.getElementById('mindmap-gather-nodes-btn').onclick = () => {
                        if (App.license.isPremium()) this.gatherNodes(); else App.ui.showAscensionModal('visual_map');
                    };
                    const layoutToggle = document.getElementById('mindmap-layout-toggle');
                    layoutToggle.innerHTML = ICON_MINDMAP_FORCE;
                    layoutToggle.onclick = () => {
                        if (App.license.isPremium()) this.toggleLayout(); else App.ui.showAscensionModal('visual_map');
                    };
                    document.getElementById('mindmap-rotate-colors').onclick = () => {
                        if (App.license.isPremium()) { this.colorManager.rotateSchemes(); this.renderAllMindmaps(); }
                        else App.ui.showAscensionModal();
                    };
                    document.getElementById('mindmap-snapshot-btn').onclick = () => {
                        if (App.license.isPremium()) this.saveSnapshotAndExport(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('mindmap-toggle-snapshots-btn').onclick = () => {
                        if (App.license.isPremium()) this.cycleSnapshots(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('mindmap-delete-snapshots-btn').onclick = () => {
                        if (App.license.isPremium()) this.deleteOldSnapshots(); else App.ui.showAscensionModal();
                    };
                },

                toggleLayout() {
                    const modes = ['Force', 'Radial', 'TopDown', 'LeftRight', 'Sequential'];
                    const icons = [ICON_MINDMAP_FORCE, ICON_MINDMAP_RADIAL, ICON_MINDMAP_TOPDOWN, ICON_MINDMAP_LEFTRIGHT, ICON_MINDMAP_SEQUENTIAL];
                    const currentIndex = modes.indexOf(this.layoutMode) === -1 ? 0 : modes.indexOf(this.layoutMode);
                    const nextIndex = (currentIndex + 1) % modes.length;

                    this.layoutMode = modes[nextIndex];
                    const btn = document.getElementById('mindmap-layout-toggle');
                    btn.innerHTML = icons[nextIndex];

                    if (this.simulation) {
                        // Always unpin all nodes when switching any layout
                        this.simulation.nodes().forEach(n => { n.fx = null; n.fy = null; });

                        if (this.layoutMode === 'Radial') {
                            // Compact Radial: mild repulsion keeps nodes from overlapping
                            this.simulation
                                .force("link", d3.forceLink().id(d => d.id)
                                    .distance(d => d.source.width / 2 + d.target.width / 2 + 20)
                                    .strength(0.9))
                                .force("charge", d3.forceManyBody().strength(-150))
                                .force("collide", d3.forceCollide().radius(d => Math.max(d.width, d.height) / 2 + 12).strength(1.0))
                                .force("center", d3.forceCenter(0, 0).strength(0.05))
                                .alphaDecay(0.03)
                                .velocityDecay(0.5);
                        } else if (this.layoutMode === 'Force') {
                            // Restore default Force-mode simulation parameters
                            this.simulation
                                .force("link", d3.forceLink().id(d => d.id)
                                    .distance(d => d.source.width / 2 + d.target.width / 2 + 40)
                                    .strength(0.3))
                                .force("charge", d3.forceManyBody().strength(-800))
                                .force("collide", d3.forceCollide().radius(d => Math.max(d.width, d.height) / 2 + 15).strength(0.8))
                                .force("center", d3.forceCenter(0, 0))
                                .alphaDecay(0.05)
                                .velocityDecay(0.6);
                        }
                        this.simulation.alpha(0.5).restart();
                    }
                    this.renderAllMindmaps({ shouldZoomToFit: true, isInteraction: true });
                },

                prepareAllMindmapData() {
                    const nodes = [], links = [];
                    this.mindmapRoots = [];
                    const allLinks = [];
                    const allNodesMap = new Map();

                    Object.entries(App.state.dataCache.mindMapSnippets).forEach(([articleId, snippetsData], index) => {
                        if (snippetsData.length === 0) return;

                        const article = App.storage.getArticle(articleId);
                        if (!article) return;
                        const colorScheme = this.colorManager.getSchemeFor(articleId, index);

                        const rootDims = this.calculateNodeDimensions(article.title || 'Untitled', 'root');
                        const rootNode = {
                            id: articleId, mindmapId: articleId, text: article.title || 'Untitled',
                            type: 'root', colorScheme, ...rootDims,
                            childrenIds: [], hasChildren: false
                        };

                        allNodesMap.set(rootNode.id, rootNode);
                        this.mindmapRoots.push(rootNode);

                        // STATE MACHINE FOR HIERARCHICAL MIND MAP
                        const lastNodes = { 0: rootNode.id };
                        // Track the most recent mindmap node level so highlighted images
                        let lastMindmapLevel = 1;

                        snippetsData.forEach((snippet) => {
                            const isImageSnippet = !!snippet.isImage;
                            const level = isImageSnippet ? lastMindmapLevel : (snippet.level || 1);
                            const nodeText = isImageSnippet ? `<img src="${snippet.src}">` : snippet.text;
                            const childDims = this.calculateNodeDimensions(nodeText, 'child');

                            const nodeData = {
                                id: snippet.id, articleId: articleId, mindmapId: articleId,
                                text: nodeText, type: 'child', level: level, colorScheme, ...childDims,
                                childrenIds: [], hasChildren: false
                            };
                            allNodesMap.set(nodeData.id, nodeData);

                            let targetParentLevel = level - 1;
                            while (targetParentLevel > 0 && !lastNodes[targetParentLevel]) {
                                targetParentLevel--;
                            }

                            const parentId = lastNodes[targetParentLevel] || rootNode.id;
                            allLinks.push({ source: parentId, target: snippet.id });

                            const parentNode = allNodesMap.get(parentId);
                            if (parentNode) {
                                parentNode.childrenIds.push(snippet.id);
                                parentNode.hasChildren = true;
                            }

                            // Images are "attachments" to the current mindmap position.
                            if (!isImageSnippet) {
                                lastMindmapLevel = level;
                                lastNodes[level] = snippet.id;
                                Object.keys(lastNodes).forEach(k => { if (parseInt(k) > level) delete lastNodes[k]; });
                            }
                        });
                    });

                    // Build visible array based on collapsed states
                    const visibleNodes = new Set();
                    const visibleLinks = [];

                    const traverse = (nodeId) => {
                        visibleNodes.add(nodeId);
                        const node = allNodesMap.get(nodeId);
                        if (!node) return;

                        const isCollapsed = this.nodeStates[nodeId]?.collapsed;
                        node.isCollapsed = isCollapsed;

                        if (!isCollapsed && node.hasChildren) {
                            node.childrenIds.forEach(childId => {
                                visibleLinks.push({ source: nodeId, target: childId });
                                traverse(childId);
                            });
                        }
                    };

                    this.mindmapRoots.forEach(r => traverse(r.id));

                    // --- NEW: Add cross-links for Mindmap Snippets inside articles ---
                    App.state.articles.forEach(article => {
                        if (!article.content) return;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = article.content;
                        tempDiv.querySelectorAll('a[data-link-type="mindmap_snippet"]').forEach(link => {
                            const targetMindmapId = link.getAttribute('data-link-id');
                            if (targetMindmapId && allNodesMap.has(targetMindmapId) && allNodesMap.has(article.id) && article.id !== targetMindmapId.split('-')[1]) {
                                allLinks.push({ source: article.id, target: targetMindmapId, isCrossLink: true });
                                if (visibleNodes.has(article.id) && visibleNodes.has(targetMindmapId)) {
                                    const linkExists = visibleLinks.some(l => l.source === article.id && l.target === targetMindmapId && l.isCrossLink);
                                    if (!linkExists) {
                                        visibleLinks.push({ source: article.id, target: targetMindmapId, isCrossLink: true });
                                    }
                                }
                            }
                        });
                    });

                    allNodesMap.forEach(node => {
                        if (visibleNodes.has(node.id)) nodes.push(node);
                    });

                    visibleLinks.forEach(link => {
                        links.push(link);
                    });

                    this.mindmapRoots.sort((a, b) => a.text.localeCompare(b.text));
                    return { nodes, links };
                },

                calculateNodeDimensions(text, type) {

                    if (typeof text === 'string' && text.trim().startsWith('<img')) {
                        return { width: 180, height: 140, needsCustomScroll: false, lineHeight: 0 };
                    }

                    const measurer = document.getElementById('text-measurer');
                    if (!measurer) return { width: 288, height: 112, needsCustomScroll: false, lineHeight: 18 };

                    const isRoot = type === 'root';
                    measurer.style.fontSize = isRoot ? '14px' : '12px';
                    measurer.style.fontWeight = isRoot ? '600' : 'normal';
                    measurer.style.lineHeight = '1.5';
                    measurer.style.width = 'auto';
                    measurer.style.display = 'inline-block';
                    measurer.innerHTML = text;

                    const maxWidth = 250, maxHeight = 150, horizontalPadding = 28, verticalPadding = 20;
                    let contentWidth = measurer.offsetWidth;
                    let finalWidth = Math.min(maxWidth, contentWidth + horizontalPadding);
                    measurer.style.width = `${finalWidth - horizontalPadding}px`;
                    let contentHeight = measurer.scrollHeight;
                    const needsCustomScroll = contentHeight > (maxHeight - verticalPadding);
                    let finalHeight = needsCustomScroll ? maxHeight : Math.max(50, contentHeight + verticalPadding);
                    measurer.style.display = 'block';

                    return { width: finalWidth, height: finalHeight, needsCustomScroll, lineHeight: (isRoot ? 14 : 12) * 1.5 };
                },

                render() {
                    const container = d3.select("#mindmap-container");
                    container.selectAll("*").remove();
                    this.width = container.node().clientWidth;
                    this.height = container.node().clientHeight;

                    // Append sticky layer BEFORE svg so it sits above it in z-index
                    this.stickyLayer = container.append("div").attr("id", "mindmap-sticky-layer");

                    this.svg = container.append("svg").attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height]);
                    this.g = this.svg.append("g");

                    // Mindmap SVG has a centred viewBox, so node x/y coords are centred.
                    this.currentZoom = d3.zoomIdentity;
                    this.zoom = d3.zoom().scaleExtent([0.1, 4]).on("zoom", (e) => {
                        this.currentZoom = e.transform;
                        this.g.attr("transform", e.transform);
                        // Apply the same transform to the sticky layer that D3 applies to the SVG <g>.
                        if (this.stickyLayer) {
                            const hw = this.width / 2;
                            const hh = this.height / 2;
                            this.stickyLayer.style(
                                'transform',
                                `translate(${e.transform.x + hw}px, ${e.transform.y + hh}px) scale(${e.transform.k})`
                            );
                        }
                    });
                    this.svg.call(this.zoom);
                },

                /* For Loading MindMap Quickly we use renderState & renderBatch */
                _renderState: {
                    allRootNodes: [],
                    fullNodes: [],
                    fullLinks: [],
                    renderedNodeIds: new Set(),
                    renderIndex: 0,
                    isRendering: false,
                    batchSize: 25, // Render 25 complete mind maps per batch
                    renderHandle: null
                },


                _renderNextMindMapBatch() {
                    if (!this._renderState.isRendering) return;
                    const { allRootNodes, fullNodes, fullLinks, batchSize } = this._renderState;
                    const { renderIndex } = this._renderState;
                    const rootsToRender = allRootNodes.slice(renderIndex, renderIndex + batchSize);
                    const rootIdsToRender = new Set(rootsToRender.map(r => r.id));
                    const nodesForThisBatch = fullNodes.filter(n => rootIdsToRender.has(n.mindmapId));
                    const linksForThisBatch = fullLinks.filter(l => rootIdsToRender.has(l.source.mindmapId || l.source));
                    const currentNodes = this.simulation.nodes();
                    const newNodes = [...currentNodes, ...nodesForThisBatch];
                    this.simulation.nodes(newNodes);
                    this.simulation.force("link").links([...this.simulation.force("link").links(), ...linksForThisBatch]);
                    const link = this.g.selectAll(".mindmap-link").data(this.simulation.force("link").links(), d => `${d.source.id}-${d.target.id}`);
                    link.enter().append("path").attr("class", d => `mindmap-link ambiance-${d.source.colorScheme}`).style("stroke", d => `var(--primary-color)`).attr("opacity", 0).transition().duration(500).attr("opacity", 0.8);
                    const node = this.g.selectAll(".mindmap-node").data(newNodes, d => d.id);

                    const nodeEnter = node.enter().append("g").attr("class", d => `mindmap-node mindmap-${d.type} ambiance-${d.colorScheme}`).attr("opacity", 0);
                    nodeEnter.append("rect");
                    nodeEnter.append('foreignObject');

                    const toggle = nodeEnter.append("g").attr("class", "node-toggle").style("display", "none");
                    toggle.append("circle").attr("r", 12).attr("class", "toggle-bg").style("cursor", "pointer").style("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))");
                    toggle.append("text").attr("class", "toggle-icon").attr("text-anchor", "middle").attr("dy", "0.33em").style("font-size", "15px").style("font-weight", "900").style("cursor", "pointer");



                    const allNodes = nodeEnter.merge(node);

                    allNodes.raise();

                    allNodes.call(this.drag(this.simulation))
                        .on("contextmenu", (event, d) => {
                            event.preventDefault();
                            // Right-click → pin as sticky note. Article navigation moved to sticky note header.
                            App.mindMap.pinBoard.create(d);
                        })
                        .on("dblclick", (event, d) => {
                            event.stopPropagation();
                            // Double-click → pin as sticky note
                            App.mindMap.pinBoard.create(d);
                        })
                        .on("click", (event, d) => {
                            if (event.target.closest('.scroll-button-line')) return;
                            event.stopPropagation();
                            if (d.type === 'root') {
                                this.nodeStates[d.id] = { collapsed: !this.nodeStates[d.id]?.collapsed };
                                this.renderAllMindmaps({ shouldZoomToFit: false, isInteraction: true });
                            } else {
                                const nodeEl = d3.select(event.currentTarget);
                                const isFaded = nodeEl.classed('faded');
                                nodeEl.classed('faded', !isFaded);
                                this.g.selectAll('.mindmap-link').filter(l => l.target.id === d.id).classed('faded', !isFaded);
                            }
                        });
                    allNodes.selectAll('.node-toggle')
                        .style("display", d => d.hasChildren ? "block" : "none")
                        .attr("transform", d => `translate(${d.width / 2}, 0)`)
                        .on("click", (event, d) => {
                            event.stopPropagation();
                            this.nodeStates[d.id] = { collapsed: !this.nodeStates[d.id]?.collapsed };
                            const savedX = d.x;
                            const savedY = d.y;
                            if (this.simulation && this.layoutMode === 'Force') {
                                d.fx = savedX;
                                d.fy = savedY;
                            }
                            this.renderAllMindmaps({ shouldZoomToFit: false, isInteraction: true });
                            if (this.layoutMode === 'Force') {
                                if (this.simulation) {
                                    const clickedNode = this.simulation.nodes().find(n => n.id === d.id);
                                    if (clickedNode) { clickedNode.fx = savedX; clickedNode.fy = savedY; }
                                    this.simulation.alphaTarget(0.01).restart();
                                }
                                setTimeout(() => { if (!this.simulation) return; this.simulation.alphaTarget(0); this.simulation.nodes().forEach(nodeData => { if (nodeData.id === d.id) { nodeData.fx = null; nodeData.fy = null; } }); }, 1500);
                            }
                        });
                    allNodes.select('.node-toggle .toggle-bg').style("fill", d => d.type === 'root' ? `var(--text-primary)` : `var(--bg-primary)`).style("stroke", d => d.type === 'root' ? `var(--bg-primary)` : `var(--border-color)`).style("stroke-width", "2px");
                    allNodes.select('.node-toggle .toggle-icon').text(d => d.isCollapsed ? "+" : "-").style("fill", d => d.type === 'root' ? `var(--bg-primary)` : `var(--text-primary)`);

                    allNodes.select("rect").attr("width", d => d.width).attr("height", d => d.height).attr("x", d => -d.width / 2).attr("y", d => -d.height / 2).style("fill", d => d.type === 'root' ? `var(--text-primary)` : `var(--bg-primary)`).style("stroke", d => d.type === 'root' ? `var(--text-primary)` : 'var(--border-color)');
                    allNodes.select('foreignObject')
                        .attr('width', d => d.width).attr('height', d => d.height)
                        .attr('x', d => -d.width / 2).attr('y', d => -d.height / 2)
                        .html(d => `<div class="node-content-wrapper"><div class="node-html-content ${d.needsCustomScroll ? 'has-custom-scroll' : ''}" style="color: ${d.type === 'child' ? `var(--text-primary)` : `var(--bg-primary)`}">${d.text}</div></div>`)
                        .on('contextmenu', (event, d) => {
                            event.preventDefault();
                            event.stopPropagation();
                            App.mindMap.pinBoard.create(d);
                        })
                        .on('dblclick', (event, d) => {
                            event.stopPropagation();
                            App.mindMap.pinBoard.create(d);
                        });
                    allNodes.transition().duration(500).attr("opacity", 1);
                    this.simulation.alphaTarget(0.1).restart();
                    setTimeout(() => this.simulation.alphaTarget(0), 500);
                    this._renderState.renderIndex += batchSize;
                    if (this.isInitialLoad) {
                        const progressPercent = Math.round((this._renderState.renderIndex / allRootNodes.length) * 100);
                        App.ui.showToast(`Loading map... ${Math.min(100, progressPercent)}%`, { type: 'info', duration: 2000 });
                    }
                    if (this._renderState.renderIndex < allRootNodes.length) {
                        const schedule = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback : (cb) => setTimeout(cb, 16);
                        this._renderState.renderHandle = schedule(() => this._renderNextMindMapBatch());
                    } else {
                        this._renderState.isRendering = false;
                        if (this.isInitialLoad) App.ui.showToast('Map ready!', { type: 'success' });
                        this.isInitialLoad = false;
                    }
                },

                renderAllMindmaps(options = {}) {
                    const { shouldZoomToFit = true, isInteraction = false } = typeof options === 'boolean' ? { shouldZoomToFit: options } : options;

                    if (this._renderState.isRendering && this._renderState.renderHandle) {
                        if (typeof window.cancelIdleCallback === 'function') {
                            window.cancelIdleCallback(this._renderState.renderHandle);
                        } else {
                            clearTimeout(this._renderState.renderHandle);
                        }
                    }

                    const oldNodePositions = new Map();
                    if (this.simulation) {
                        this.simulation.nodes().forEach(node => {
                            oldNodePositions.set(node.id, { x: node.x, y: node.y, fx: node.fx, fy: node.fy });
                        });
                    }

                    const { nodes, links } = this.prepareAllMindmapData();
                    const allRootNodes = this.mindmapRoots;

                    nodes.forEach(node => {
                        if (oldNodePositions.has(node.id)) {
                            const pos = oldNodePositions.get(node.id);
                            node.x = pos.x; node.y = pos.y; node.fx = pos.fx; node.fy = pos.fy;
                        } else {
                            const parentLink = links.find(l => {
                                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                                return targetId === node.id;
                            });
                            if (parentLink) {
                                const parentId = typeof parentLink.source === 'object' ? parentLink.source.id : parentLink.source;
                                if (oldNodePositions.has(parentId)) {
                                    const parentPos = oldNodePositions.get(parentId);
                                    node.x = parentPos.x; node.y = parentPos.y;
                                }
                            }
                        }
                    });

                    // This new logic distinguishes between the initial load and subsequent interactions
                    if (!isInteraction && allRootNodes.length > this._renderState.batchSize && this.layoutMode === 'Force') {
                        this._renderState.allRootNodes = allRootNodes; this._renderState.fullNodes = nodes; this._renderState.fullLinks = links; this._renderState.renderIndex = 0; this._renderState.isRendering = true;

                        this.g.selectAll("*").remove(); // Clear only on initial full load

                        this.simulation = d3.forceSimulation().alphaDecay(0.05).velocityDecay(0.6).force("link", d3.forceLink().id(d => d.id).distance(d => d.source.width / 2 + d.target.width / 2 + 40).strength(0.3)).force("charge", d3.forceManyBody().strength(-800)).force("center", d3.forceCenter(0, 0)).force("collide", d3.forceCollide().radius(d => Math.max(d.width, d.height) / 2 + 15).strength(0.8));
                        this.simulation.on("tick", () => { const nodeMap = new Map(this.simulation.nodes().map(n => [n.id, n])); this.g.selectAll(".mindmap-link").attr("d", d => { const sourceNode = typeof d.source === 'string' ? nodeMap.get(d.source) : d.source; const targetNode = typeof d.target === 'string' ? nodeMap.get(d.target) : d.target; if (!sourceNode || !targetNode) return null; const sourcePoint = this.calculateEdgePoint(sourceNode, targetNode); const targetPoint = this.calculateEdgePoint(targetNode, sourceNode); return `M${sourcePoint.x},${sourcePoint.y}C${sourcePoint.x},${(sourcePoint.y + targetPoint.y) / 2} ${targetPoint.x},${(sourcePoint.y + targetPoint.y) / 2} ${targetPoint.x},${targetPoint.y}`; }); this.g.selectAll(".mindmap-node").attr("transform", d => `translate(${d.x},${d.y})`); });

                        this._renderNextMindMapBatch();
                    } else {
                        // This is the flicker-free path for small maps and ALL interactions on large maps
                        this._renderState.isRendering = false;
                        if (!this.simulation) {
                            this.simulation = d3.forceSimulation().alphaDecay(0.05).velocityDecay(0.6).force("link", d3.forceLink().id(d => d.id).distance(d => d.source.width / 2 + d.target.width / 2 + 40).strength(0.3)).force("charge", d3.forceManyBody().strength(-800)).force("center", d3.forceCenter(0, 0)).force("collide", d3.forceCollide().radius(d => Math.max(d.width, d.height) / 2 + 15).strength(0.8));
                            this.simulation.on("tick", () => { const nodeMap = new Map(this.simulation.nodes().map(n => [n.id, n])); this.g.selectAll(".mindmap-link").attr("d", d => { const sourceNode = typeof d.source === 'string' ? nodeMap.get(d.source) : d.source; const targetNode = typeof d.target === 'string' ? nodeMap.get(d.target) : d.target; if (!sourceNode || !targetNode) return null; const sourcePoint = this.calculateEdgePoint(sourceNode, targetNode); const targetPoint = this.calculateEdgePoint(targetNode, sourceNode); return `M${sourcePoint.x},${sourcePoint.y}C${sourcePoint.x},${(sourcePoint.y + targetPoint.y) / 2} ${targetPoint.x},${(sourcePoint.y + targetPoint.y) / 2} ${targetPoint.x},${targetPoint.y}`; }).style("stroke-dasharray", d => d.isCrossLink ? "4 4" : "none"); this.g.selectAll(".mindmap-node").attr("transform", d => `translate(${d.x},${d.y})`); });
                        }
                        this.simulation.nodes(nodes);
                        this.simulation.force("link").links(links);

                        if (this.layoutMode !== 'Force') {
                            this.applyAlternativeLayout(nodes, links);
                            // For Radial: nodes are seeded by position hints (x/y), NOT locked (fx/fy).
                            if (this.layoutMode === 'Radial') {
                                // Compact Radial: same mild forces as toggleLayout sets
                                this.simulation
                                    .force("link", d3.forceLink().id(d => d.id)
                                        .distance(d => d.source.width / 2 + d.target.width / 2 + 20)
                                        .strength(0.9))
                                    .force("charge", d3.forceManyBody().strength(-150))
                                    .force("collide", d3.forceCollide().radius(d => Math.max(d.width, d.height) / 2 + 12).strength(1.0))
                                    .force("center", d3.forceCenter(0, 0).strength(0.05))
                                    .alphaDecay(0.03)
                                    .velocityDecay(0.5);
                            }
                        } else {
                            if (!isInteraction) {
                                nodes.forEach(n => { n.fx = null; n.fy = null; });
                            }
                        }

                        const link = this.g.selectAll(".mindmap-link").data(links, d => `${d.source.id}-${d.target.id}`);
                        link.join(
                            enter => enter.append("path").attr("class", d => `mindmap-link ambiance-${d.source.colorScheme}`).style("stroke", d => `var(--primary-color)`).attr("opacity", 0).transition().duration(500).attr("opacity", 0.8),
                            update => update.attr("class", d => `mindmap-link ambiance-${d.source.colorScheme}`),
                            exit => exit.transition().duration(300).attr("opacity", 0).remove()
                        );

                        const node = this.g.selectAll(".mindmap-node").data(nodes, d => d.id);
                        node.join(
                            enter => {
                                const g = enter.append("g").attr("class", d => `mindmap-node mindmap-${d.type} ambiance-${d.colorScheme} ${d.text.includes('<img') ? 'image-node' : ''}`).attr("opacity", 0);
                                g.append("rect"); g.append('foreignObject');

                                const toggle = g.append("g").attr("class", "node-toggle").style("display", "none");
                                toggle.append("circle").attr("r", 12).attr("class", "toggle-bg").style("cursor", "pointer").style("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))");
                                toggle.append("text").attr("class", "toggle-icon").attr("text-anchor", "middle").attr("dy", "0.33em").style("font-size", "15px").style("font-weight", "900").style("cursor", "pointer");


                                g.call(this.drag(this.simulation))
                                    .on("contextmenu", (event, d) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        App.mindMap.pinBoard.create(d);
                                    })
                                    .on("dblclick", (event, d) => {
                                        event.stopPropagation();
                                        App.mindMap.pinBoard.create(d);
                                    })

                                    .on("click", (event, d) => {
                                        if (event.target.closest('.scroll-button-line')) return;
                                        event.stopPropagation();
                                        if (d.type === 'root') {
                                            this.nodeStates[d.id] = { collapsed: !this.nodeStates[d.id]?.collapsed };
                                            this.renderAllMindmaps({ shouldZoomToFit: false, isInteraction: true });
                                        } else {
                                            const nodeEl = d3.select(event.currentTarget);
                                            const isFaded = nodeEl.classed('faded');
                                            nodeEl.classed('faded', !isFaded);
                                            this.g.selectAll('.mindmap-link').filter(l => l.target.id === d.id).classed('faded', !isFaded);
                                        }
                                    });
                                g.transition().duration(500).attr("opacity", 1);
                                return g;
                            },
                            update => {
                                update.attr("class", d => `mindmap-node mindmap-${d.type} ambiance-${d.colorScheme} ${d.text.includes('<img') ? 'image-node' : ''}`);
                                return update;
                            },
                            exit => exit.transition().duration(300).attr("opacity", 0).remove()
                        );

                        this.g.selectAll(".mindmap-node").call(el => {
                            el.selectAll('.node-toggle')
                                .style("display", d => d.hasChildren ? "block" : "none")
                                .attr("transform", d => `translate(${d.width / 2}, 0)`)
                                .on("click", (event, d) => {
                                    event.stopPropagation();
                                    this.nodeStates[d.id] = { collapsed: !this.nodeStates[d.id]?.collapsed };
                                    const savedX = d.x;
                                    const savedY = d.y;
                                    if (this.simulation && this.layoutMode === 'Force') {
                                        d.fx = savedX;
                                        d.fy = savedY;
                                    }
                                    this.renderAllMindmaps({ shouldZoomToFit: false, isInteraction: true });
                                    if (this.layoutMode === 'Force') {
                                        if (this.simulation) {
                                            const clickedNode = this.simulation.nodes().find(n => n.id === d.id);
                                            if (clickedNode) { clickedNode.fx = savedX; clickedNode.fy = savedY; }
                                            this.simulation.alphaTarget(0.01).restart();
                                        }
                                        setTimeout(() => { if (!this.simulation) return; this.simulation.alphaTarget(0); this.simulation.nodes().forEach(nodeData => { if (nodeData.id === d.id) { nodeData.fx = null; nodeData.fy = null; } }); }, 1500);
                                    }
                                });
                            el.select('.node-toggle .toggle-bg').style("fill", d => d.type === 'root' ? `var(--text-primary)` : `var(--bg-primary)`).style("stroke", d => d.type === 'root' ? `var(--bg-primary)` : `var(--border-color)`).style("stroke-width", "2px");
                            // Center the +/- icon using dy and text-anchor
                            el.select('.node-toggle .toggle-icon').text(d => d.isCollapsed ? "+" : "-").style("fill", d => d.type === 'root' ? `var(--bg-primary)` : `var(--text-primary)`).attr("text-anchor", "middle").attr("dy", "0.3em");

                            el.select("rect")
                                .attr("width", d => d.width).attr("height", d => d.height)
                                .attr("x", d => -d.width / 2).attr("y", d => -d.height / 2)
                                .style("fill", d => {
                                    // For image nodes, use the app's secondary background for the mat effect
                                    if (d.text.includes('<img')) return 'var(--bg-secondary)';
                                    return d.type === 'root' ? `var(--text-primary)` : `var(--bg-primary)`;
                                })
                                .style("stroke", d => {
                                    // For image nodes, use a subtle border for a crisp edge
                                    if (d.text.includes('<img')) return 'var(--border-color)';
                                    return d.type === 'root' ? `var(--text-primary)` : 'var(--border-color)';
                                })
                                // Remove the custom filter and border-radius; let the main stylesheet handle it
                                .style("filter", null)
                                .style("border-radius", null);

                            el.select('foreignObject')
                                .attr('width', d => d.width).attr('height', d => d.height)
                                .attr('x', d => -d.width / 2).attr('y', d => -d.height / 2)
                                .html(d => {
                                    const content = d.text;
                                    return `<div class="node-content-wrapper"><div class="node-html-content ${d.needsCustomScroll ? 'has-custom-scroll' : ''}" style="color: ${d.type === 'child' ? `var(--text-primary)` : `var(--bg-primary)`}">${content}</div></div>`
                                })
                                .on('contextmenu', (event, d) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    App.mindMap.pinBoard.create(d);
                                })
                                .on('dblclick', (event, d) => {
                                    event.stopPropagation();
                                    App.mindMap.pinBoard.create(d);
                                });
                            el.filter(d => d.needsCustomScroll)
                                .select('.node-content-wrapper')
                                .append('xhtml:div')
                                .attr('class', 'scroll-button-line')
                                .style('background-color', d => {
                                    const theme = document.documentElement.getAttribute('data-theme');
                                    if (d.type === 'root') return 'rgba(255, 255, 255, 0.5)';
                                    return theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : `var(--primary-color)`;
                                })
                                .on('click', function (event, d) {
                                    event.stopPropagation();
                                    const container = this.parentNode.querySelector('.node-html-content');
                                    if (!container) return;

                                    const scrollAmount = 100; // A consistent scroll amount in pixels is more reliable
                                    const currentTop = container.scrollTop;
                                    const maxScroll = container.scrollHeight - container.clientHeight;

                                    let targetScrollTop;
                                    if (currentTop >= maxScroll - 5) {
                                        targetScrollTop = 0;
                                    } else {

                                        targetScrollTop = Math.min(maxScroll, currentTop + scrollAmount);
                                    }

                                    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                                })


                        });
                        this.simulation.alphaTarget(0.1).restart();
                        setTimeout(() => this.simulation.alphaTarget(0), 500);
                        if (shouldZoomToFit) setTimeout(() => this.zoomToFit(), 200);
                    }
                },

                applyAlternativeLayout(nodes, links) {
                    const nodesMap = new Map();
                    nodes.forEach(n => { nodesMap.set(n.id, n); n.childrenNodes = []; });
                    links.forEach(l => {
                        const source = typeof l.source === 'object' ? l.source : nodesMap.get(l.source);
                        const target = typeof l.target === 'object' ? l.target : nodesMap.get(l.target);
                        if (source && target) source.childrenNodes.push(target);
                    });
                    const rootNodes = nodes.filter(n => n.type === 'root');
                    let currentOffsetX = 0, currentOffsetY = 0;
                    rootNodes.forEach(root => {
                        const hierarchy = d3.hierarchy(root, d => d.childrenNodes);
                        if (this.layoutMode === 'TopDown') {
                            const tree = d3.tree().nodeSize([300, 200]); tree(hierarchy);
                            let minX = Infinity, maxX = -Infinity;
                            hierarchy.each(d => { d.data.fx = d.x + currentOffsetX; d.data.fy = d.y; if (d.data.fx < minX) minX = d.data.fx; if (d.data.fx > maxX) maxX = d.data.fx; });
                            currentOffsetX += (maxX - minX) + 350;
                        } else if (this.layoutMode === 'LeftRight') {
                            const tree = d3.tree().nodeSize([150, 350]); tree(hierarchy);
                            let minY = Infinity, maxY = -Infinity;
                            hierarchy.each(d => { d.data.fx = d.y; d.data.fy = d.x + currentOffsetY; if (d.data.fy < minY) minY = d.data.fy; if (d.data.fy > maxY) maxY = d.data.fy; });
                            currentOffsetY += (maxY - minY) + 200;
                        } else if (this.layoutMode === 'Sequential') {
                            let counter = 0;
                            hierarchy.eachBefore(d => { d.data.fx = d.depth * 100; d.data.fy = (counter++) * 130 + currentOffsetY; });
                            currentOffsetY += counter * 130 + 100;
                        } else if (this.layoutMode === 'Radial') {
                            // Radial: seed initial positions in concentric rings by depth.
                            const ringSpacing = 130;
                            const depthGroups = {};
                            hierarchy.each(d => {
                                if (!depthGroups[d.depth]) depthGroups[d.depth] = [];
                                depthGroups[d.depth].push(d);
                            });
                            const maxDepth = Math.max(1, hierarchy.height);
                            hierarchy.data.x = currentOffsetX;
                            hierarchy.data.y = 0;
                            // Seed each depth ring angularly
                            Object.entries(depthGroups).forEach(([dep, members]) => {
                                const depth = parseInt(dep);
                                if (depth === 0) return;
                                const r = depth * ringSpacing;
                                members.forEach((d, i) => {
                                    const angle = (2 * Math.PI * i / members.length) - Math.PI / 2;
                                    // Set x/y as position hints (not fx/fy), simulation can move freely from here
                                    d.data.x = Math.cos(angle) * r + currentOffsetX;
                                    d.data.y = Math.sin(angle) * r;
                                    // Explicitly clear any stale fixed positions from other layout modes
                                    d.data.fx = null;
                                    d.data.fy = null;
                                });
                            });
                            currentOffsetX += maxDepth * ringSpacing * 2 + 350;
                        }
                    });
                },

                searchNodes(term) {
                    this.currentMindmapSearchResults = []; this.currentMindmapSearchIndex = -1;
                    const resultsList = document.getElementById('mindmap-search-results');
                    const termLower = term.toLowerCase().trim();
                    this.g.selectAll('.mindmap-node').classed('mindmap-search-highlight', false);
                    resultsList.innerHTML = ''; resultsList.style.display = 'none';
                    if (!termLower) return;
                    const results = this.g.selectAll('.mindmap-node').filter(d => d.text.toLowerCase().includes(termLower));
                    if (!results.empty()) {
                        results.classed('mindmap-search-highlight', true);
                        const resultsData = results.data();

                        // FIX: Sort the results to prioritize master nodes over children nodes.
                        resultsData.sort((a, b) => {
                            // If a is a root and b is a child, a comes first (-1).
                            if (a.type === 'root' && b.type !== 'root') {
                                return -1;
                            }
                            // If b is a root and a is a child, b comes first (1).
                            if (a.type !== 'root' && b.type === 'root') {
                                return 1;
                            }
                            // If both are the same type, sort them alphabetically.
                            return a.text.localeCompare(b.text);
                        });

                        this.currentMindmapSearchResults = resultsData;
                        const ul = document.createElement('ul');
                        resultsData.forEach(d => {
                            const li = document.createElement('li'); const a = document.createElement('a'); a.href = '#'; a.textContent = `${d.type === 'root' ? 'Article:' : 'Snippet:'} ${d.text.slice(0, 30)}...`;
                            a.onclick = (e) => { e.preventDefault(); this.zoomToNode(d); resultsList.style.display = 'none'; };
                            li.appendChild(a); ul.appendChild(li);
                        });
                        resultsList.appendChild(ul); resultsList.style.display = 'block';

                        this.findNextSearchResult();
                    }
                },
                findNextSearchResult() {
                    if (!this.currentMindmapSearchResults || this.currentMindmapSearchResults.length === 0) { const searchTerm = document.getElementById('mindmap-search-input').value; if (searchTerm) { this.searchNodes(searchTerm); if (!this.currentMindmapSearchResults || this.currentMindmapSearchResults.length === 0) { App.ui.showToast("No results found.", { type: 'error' }); return; } } else { App.ui.showToast("Nothing to search for.", { type: 'error' }); return; } }
                    this.currentMindmapSearchIndex = (this.currentMindmapSearchIndex + 1) % this.currentMindmapSearchResults.length;
                    const targetNodeData = this.currentMindmapSearchResults[this.currentMindmapSearchIndex];
                    if (targetNodeData) { this.zoomToNode(targetNodeData); this.g.selectAll('.mindmap-node').filter(d => d.id === targetNodeData.id).select('rect').transition().duration(200).style('stroke', 'var(--danger-color)').style('stroke-width', '4px').transition().duration(1500).style('stroke', 'var(--border-color)').style('stroke-width', '1.5px'); }
                },
                navigateToNextMap() { if (this.mindmapRoots.length === 0) return; this.currentMindmapIndex = (this.currentMindmapIndex + 1) % this.mindmapRoots.length; this.zoomToNode(this.mindmapRoots[this.currentMindmapIndex]); App.ui.showToast(`Mind Map ${this.currentMindmapIndex + 1} of ${this.mindmapRoots.length}`); },
                navigateToPrevMap() { if (this.mindmapRoots.length === 0) return; this.currentMindmapIndex--; if (this.currentMindmapIndex < 0) this.currentMindmapIndex = this.mindmapRoots.length - 1; this.zoomToNode(this.mindmapRoots[this.currentMindmapIndex]); App.ui.showToast(`Mind Map ${this.currentMindmapIndex + 1} of ${this.mindmapRoots.length}`); },

                // MINDMAP PIN BOARD — Ephemeral sticky notes (cleared on refresh)
                pinBoard: {
                    pins: new Map(), // pinId -> pinState

                    // --- Helpers ---
                    _stripHtml(html) {
                        const d = document.createElement('div');
                        d.innerHTML = html;
                        return (d.textContent || d.innerText || '').trim();
                    },

                    _getArticleId(nodeData) {
                        return nodeData.type === 'root' ? nodeData.id : (nodeData.articleId || nodeData.id);
                    },

                    // --- Sync the sticky layer CSS transform to match the current zoom state ---
                    // Called once on init so the layer is correctly placed before any zoom event fires.
                    _syncLayerTransform() {
                        if (!this._layer) return;
                        const t = App.mindMap.currentZoom || d3.zoomIdentity;
                        const hw = (App.mindMap.width || 0) / 2;
                        const hh = (App.mindMap.height || 0) / 2;
                        this._layer.style(
                            'transform',
                            `translate(${t.x + hw}px, ${t.y + hh}px) scale(${t.k})`
                        );
                    },

                    // --- Create or flash-raise an existing pin ---
                    create(nodeData) {
                        const pinId = `mmpin-${nodeData.id}`;
                        if (this.pins.has(pinId)) {
                            // Already open: flash-raise it
                            const el = document.getElementById(pinId);
                            if (el) {
                                el.classList.remove('spawn');
                                void el.offsetWidth;
                                el.classList.add('spawn');
                                el.style.zIndex = Date.now() % 9999 + 10;
                            }
                            return;
                        }

                        const articleId = this._getArticleId(nodeData);
                        const article = App.storage.getArticle(articleId);

                        // For child nodes: use the parent node's label as the sticky header title.
                        let rawTitle;
                        if (nodeData.type !== 'root' && App.mindMap.simulation) {
                            const simLinks = App.mindMap.simulation.force('link').links();
                            const parentLink = simLinks.find(l => {
                                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                                return targetId === nodeData.id;
                            });
                            if (parentLink) {
                                const parentNode = typeof parentLink.source === 'object' ? parentLink.source : null;
                                rawTitle = parentNode ? this._stripHtml(parentNode.text).slice(0, 60) : (article ? (article.title || 'Untitled') : this._stripHtml(nodeData.text).slice(0, 40));
                            } else {
                                rawTitle = article ? (article.title || 'Untitled') : this._stripHtml(nodeData.text).slice(0, 40);
                            }
                        } else {
                            rawTitle = article ? (article.title || 'Untitled') : this._stripHtml(nodeData.text).slice(0, 40);
                        }

                        // Positions are stored in SVG data-space (same coords as nodes).
                        // The sticky layer's CSS transform handles converting to screen space.
                        // Width/height are computed after DOM render based on content.
                        const plainTextLen = this._stripHtml(nodeData.text || '').length;
                        const autoWidth = Math.min(380, Math.max(220, 220 + Math.floor(plainTextLen / 6)));
                        const pinState = {
                            id: pinId,
                            nodeId: nodeData.id,
                            articleId: articleId,
                            nodeType: nodeData.type,
                            title: rawTitle,
                            contentHtml: nodeData.text || '',
                            svgX: (nodeData.x || 0) + 30,  // SVG data-space; CSS transform does the rest
                            svgY: (nodeData.y || 0) - 30,
                            color: 'default',
                            sizeIndex: -1,   // -1 = auto-sized; cycleSize will step up from here
                            width: autoWidth,
                            height: null     // null = measure from DOM after render
                        };

                        this.pins.set(pinId, pinState);
                        this.render(pinId);
                        App.ui.showToast('Pinned as sticky note', { type: 'success', duration: 1500 });
                    },

                    // --- Render a sticky note tile into #mindmap-sticky-layer ---
                    render(pinId) {
                        const pinState = this.pins.get(pinId);
                        if (!pinState) return;

                        // Cache the layer reference for use in _syncLayerTransform
                        if (!this._layer) {
                            this._layer = d3.select('#mindmap-sticky-layer');
                        }
                        const stickyLayer = this._layer;
                        if (stickyLayer.empty()) return;

                        // Remove stale DOM element if it exists
                        d3.select(`#${pinId}`).remove();

                        const sanitized = App.util.sanitizeHTML(pinState.contentHtml);

                        const noteHTML = `
                            <div class="sticky-note-header">
                                <h5 title="Click to open article">${pinState.title}</h5>
                            </div>
                            <div class="sticky-note-content">${sanitized}</div>
                            <div class="sticky-note-controls">
                                <button class="btn-icon color-btn" title="Cycle colour">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>
                                </button>
                                <button class="btn-icon scroll-btn" title="Scroll content">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>
                                </button>
                                <button class="btn-icon resize-btn" title="Cycle size">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                                </button>
                                <button class="btn-icon close-btn" title="Close">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        `;

                        // Positions are in SVG data coords; the layer CSS transform scales+pans everything.
                        const note = stickyLayer.append('div')
                            .attr('id', pinId)
                            .attr('class', `sticky-note-tile color-${pinState.color} spawn`)
                            .style('left', `${pinState.svgX}px`)
                            .style('top', `${pinState.svgY}px`)
                            .style('width', `${pinState.width}px`)
                            .style('height', pinState.height ? `${pinState.height}px` : 'auto')
                            .html(noteHTML);

                        // --- Auto-size: sum child heights directly for a compact fit ---
                        if (!pinState.height) {
                            const el = document.getElementById(pinId);
                            if (el) {
                                const headerEl = el.querySelector('.sticky-note-header');
                                const contentEl = el.querySelector('.sticky-note-content');
                                const ctrlEl = el.querySelector('.sticky-note-controls');
                                const headerH = headerEl ? headerEl.scrollHeight : 0;
                                const ctrlH = ctrlEl ? ctrlEl.offsetHeight : 36;
                                const rawContentH = contentEl ? contentEl.scrollHeight : 0;
                                const maxH = Math.floor(window.innerHeight * 0.60);
                                const naturalH = headerH + rawContentH + 32; // Tighter fit for absolute controls
                                const finalH = Math.min(maxH, Math.max(100, naturalH));
                                d3.select(`#${pinId}`).style('height', `${finalH}px`);
                                pinState.height = finalH;
                                if (contentEl) {
                                    contentEl.style.overflow = finalH >= maxH ? 'auto' : 'hidden';
                                }
                            }
                        }

                        // Header → open source article; child nodes scroll to their snippet
                        note.select('h5').on('click', (e) => {
                            e.stopPropagation();
                            if (pinState.nodeType === 'root') {
                                App.router.navigateTo('article', { id: pinState.articleId, mode: 'read' });
                            } else {
                                App.router.navigateTo('article', { id: pinState.articleId, mode: 'read', scrollToSnippetId: pinState.nodeId });
                            }
                        });

                        // Controls
                        note.select('.close-btn').on('mousedown', (e) => { e.stopPropagation(); this.remove(pinId); });
                        note.select('.color-btn').on('click', (e) => { e.stopPropagation(); this.cycleColor(pinId); });
                        note.select('.resize-btn').on('click', (e) => { e.stopPropagation(); this.cycleSize(pinId); });
                        note.select('.scroll-btn').on('click', (e) => { e.stopPropagation(); this.scrollContent(pinId); });

                        // Drag — deltas arrive in screen pixels; divide by k to get SVG data-space movement.
                        // Then update left/top in data coords. The layer transform handles the rest.
                        const dragMove = d3.drag()
                            .filter(event => !event.target.closest('.sticky-note-controls'))
                            .on('start', () => {
                                note.raise().classed('dragging', true);
                            })
                            .on('drag', (e) => {
                                const k = (App.mindMap.currentZoom || d3.zoomIdentity).k;
                                pinState.svgX += e.dx / k;
                                pinState.svgY += e.dy / k;
                                note.style('left', `${pinState.svgX}px`).style('top', `${pinState.svgY}px`);
                            })
                            .on('end', () => {
                                note.classed('dragging', false);
                            });

                        note.call(dragMove);

                        // Ensure the layer transform is up-to-date when a new pin is rendered.
                        this._syncLayerTransform();
                    },

                    remove(pinId) {
                        d3.select(`#${pinId}`).remove();
                        this.pins.delete(pinId);
                    },

                    cycleColor(pinId) {
                        const pinState = this.pins.get(pinId);
                        if (!pinState) return;
                        const noteEl = d3.select(`#${pinId}`);
                        noteEl.classed(`color-${pinState.color}`, false);
                        const idx = App.config.stickyNoteColors.indexOf(pinState.color);
                        pinState.color = App.config.stickyNoteColors[(idx + 1) % App.config.stickyNoteColors.length];
                        noteEl.classed(`color-${pinState.color}`, true);
                    },

                    cycleSize(pinId) {
                        const pinState = this.pins.get(pinId);
                        if (!pinState) return;
                        const sizes = [
                            { w: 180, h: 140 }, { w: 210, h: 170 }, { w: 240, h: 200 },
                            { w: 280, h: 240 }, { w: 340, h: 280 }, { w: 400, h: 320 }, { w: 460, h: 360 }
                        ];
                        // Cycle: -1 (Auto-Fit) -> 0 -> 1 -> ... -> 6 -> -1
                        let nextIndex = (pinState.sizeIndex === undefined ? -1 : pinState.sizeIndex) + 1;
                        if (nextIndex >= sizes.length) {
                            pinState.sizeIndex = -1;
                            pinState.height = null;
                            // Re-compute auto-width
                            const plainTextLen = this._stripHtml(pinState.contentHtml || '').length;
                            pinState.width = Math.min(380, Math.max(220, 220 + Math.floor(plainTextLen / 6)));
                            this.render(pinId);
                            return;
                        }
                        pinState.sizeIndex = nextIndex;
                        const s = sizes[nextIndex];
                        pinState.width = s.w;
                        pinState.height = s.h;
                        d3.select(`#${pinId}`).transition().duration(250)
                            .style('width', `${s.w}px`)
                            .style('height', `${s.h}px`);
                        const contentEl = d3.select(`#${pinId}`).select('.sticky-note-content');
                        if (!contentEl.empty()) contentEl.style('overflow', 'auto');
                    },

                    scrollContent(pinId) {
                        const el = document.getElementById(pinId);
                        if (!el) return;
                        const content = el.querySelector('.sticky-note-content');
                        if (!content) return;
                        const max = content.scrollHeight - content.clientHeight;
                        const page = content.clientHeight * 0.8;
                        content.scrollTo({
                            top: content.scrollTop >= max - 5 ? 0 : Math.min(max, content.scrollTop + page),
                            behavior: 'smooth'
                        });
                    },
                },
                // ==========================================================

                cycleSnapshots() { const snapshots = App.state.mindMapState.snapshots; if (!snapshots || snapshots.length === 0) { App.ui.showToast('No snapshots saved.'); return; } this.currentSnapshotIndex = (this.currentSnapshotIndex + 1) % snapshots.length; const snapshotToLoad = snapshots[snapshots.length - 1 - this.currentSnapshotIndex]; this.loadSnapshot(snapshotToLoad); App.ui.showToast(`Snapshot ${this.currentSnapshotIndex + 1}/${snapshots.length} ${this.currentSnapshotIndex === 0 ? '(Latest)' : ''}`); },
                deleteOldSnapshots() { const snapshots = App.state.mindMapState.snapshots; if (!snapshots || snapshots.length === 0) { App.ui.showToast('No snapshots to delete.', { type: 'error' }); return; } snapshots.shift(); this.currentSnapshotIndex = -1; App.fs.write('mind-map-state.json', App.state.mindMapState); App.ui.showToast(`Oldest Snapshot Deleted.`); },
                loadSnapshot(snapshot) {
                    if (!snapshot) return; this.nodeStates = snapshot.nodeStates || {}; this.renderAllMindmaps(false);
                    if (snapshot.nodePositions && this.simulation) {
                        const positionMap = new Map(snapshot.nodePositions.map(p => [p.id, p]));
                        this.simulation.nodes().forEach(node => { const savedPos = positionMap.get(node.id); if (savedPos) { node.x = savedPos.x; node.y = savedPos.y; node.fx = savedPos.fx; node.fy = savedPos.fy; } });
                    }
                    if (snapshot.transform) { const { x, y, k } = snapshot.transform; this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(k)); }
                },
                async saveSnapshotAndExport() {
                    if (typeof htmlToImage === 'undefined') {
                        App.ui.showToast('Snapshot feature unavailable offline.', { type: 'error' });
                        return;
                    }
                    const btn = document.getElementById('mindmap-snapshot-btn'); btn.style.color = 'var(--primary-color)';
                    const transform = d3.zoomTransform(this.svg.node());
                    const nodePositions = this.simulation ? this.simulation.nodes().map(n => ({ id: n.id, x: n.x, y: n.y, fx: n.fx, fy: n.fy })) : [];
                    const newSnapshot = { transform: { x: transform.x, y: transform.y, k: transform.k }, nodeStates: JSON.parse(JSON.stringify(this.nodeStates)), nodePositions, timestamp: new Date().toISOString() };
                    App.state.mindMapState.snapshots.push(newSnapshot);
                    if (App.state.mindMapState.snapshots.length > 10) App.state.mindMapState.snapshots.shift();
                    await App.fs.write('mind-map-state.json', App.state.mindMapState);
                    try {
                        const container = document.getElementById('mindmap-container');
                        const blob = await htmlToImage.toBlob(container, { backgroundColor: getComputedStyle(container).backgroundColor });
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        App.ui.showToast('Snapshot saved & image copied!');
                    } catch (e) { console.error("Mind map copy failed", e); App.ui.showToast('Snapshot saved (image copy failed).', { type: 'error' }); }
                    setTimeout(() => { btn.style.color = ''; }, 1000);
                },
                zoomToNode(nodeData) {
                    if (!nodeData || typeof nodeData.x !== 'number') return;
                    const scale = 1.2; const x = -nodeData.x * scale; const y = -nodeData.y * scale;
                    const transform = d3.zoomIdentity.translate(x, y).scale(scale);
                    const currentTransform = d3.zoomTransform(this.svg.node());
                    if (Math.abs(currentTransform.k - transform.k) < 0.01 && Math.abs(currentTransform.x - transform.x) < 1 && Math.abs(currentTransform.y - transform.y) < 1) return;
                    this.svg.transition().duration(750).call(this.zoom.transform, transform);
                },
                zoomToFit() {
                    if (!this.g.node() || this.g.selectAll('.mindmap-node').empty()) return;
                    const bounds = this.g.node().getBBox(); if (bounds.width === 0 || bounds.height === 0) return;
                    const { x, y, width, height } = bounds;
                    const scale = Math.min(1.5, 0.8 / Math.max(width / this.width, height / this.height));
                    const transform = d3.zoomIdentity.translate(-x * scale - (width * scale / 2), -y * scale - (height * scale / 2)).scale(scale);
                    this.svg.transition().duration(750).call(this.zoom.transform, transform);
                },
                zoomIn() { this.zoom && this.svg.transition().duration(750).call(this.zoom.scaleBy, 1.3); },
                zoomOut() { this.zoom && this.svg.transition().duration(750).call(this.zoom.scaleBy, 1 / 1.3); },
                _panCanvas(dx, dy) {
                    if (!this.zoom || !this.svg) return;
                    const panX = dx * (this.width / 4);
                    const panY = dy * (this.height / 4);
                    this.svg.transition().duration(300).call(this.zoom.translateBy, panX, panY);
                },
                gatherNodes() {
                    if (!this.simulation) return;
                    this.simulation.nodes().forEach(node => {
                        if (node.type === 'root') {
                            node.fx = null;
                            node.fy = null;
                        }
                    });

                    this.simulation
                        .force("x_gather", d3.forceX(0).strength(d => d.type === 'root' ? 0.15 : 0))
                        .force("y_gather", d3.forceY(0).strength(d => d.type === 'root' ? 0.15 : 0));

                    this.simulation.alpha(1).restart();

                    setTimeout(() => {
                        if (!this.simulation) return;
                        this.simulation.force("x_gather", null)
                            .force("y_gather", null);
                    }, 3000);
                },

                drag(simulation) {
                    const self = this;
                    function dragstarted(event, d) {
                        // Always heat the simulation on drag so magnetic forces respond
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }
                    function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                        d3.select(this).classed('dragging', true);
                    }
                    function dragended(event, d) {
                        if (!event.active) simulation.alphaTarget(0);
                        d3.select(this).classed('dragging', false);

                        if (self.layoutMode === 'Force') {
                            // Unpin the node after drag so the graph remains fluid
                            d.fx = null;
                            d.fy = null;
                        } else if (self.layoutMode === 'Radial') {
                            // Keep node pinned at new position — releasing it causes
                            simulation.alpha(0.1).restart();
                        }
                        // TopDown / LeftRight / Sequential / Radial: keep pinned (structural layouts)
                    }
                    return d3.drag()
                        .filter(event => !event.button && !event.target.closest('.scroll-button-line') && !event.target.closest('.node-toggle'))
                        .on("start", dragstarted).on("drag", dragged).on("end", dragended);
                },
};

export const visualMap = {
                svg: null, g: null, zoom: null, simulation: null, link: null, node: null, width: 0, height: 0, resizeObserver: null,
                currentFilter: 'all', currentCategoryIndex: -1, nodeStates: {}, layoutMode: 'Force',
                selectedNodes: new Set(), currentZoom: { k: 1, x: 0, y: 0 },
                currentSearchResults: [], currentSearchIndex: -1,
                isLassoActive: false, lassoPoints: [], lassoSelection: null,
                colorPalettes: {
                    category: ["#d90429", "#f77f00", "#ef476f", "#c71f37", "#ff85a1", "#ffafcc"],
                    tag: ["#4361ee", "#3a0ca3", "#7209b7", "#00b4d8", "#5e60ce", "#64dfdf", "#9d4edd", "#0077b6", "#ade8f4", "#480ca8"],
                    article: ["#55a630", "#80b918", "#aacc00", "#f4e409", "#ffbe0b", "#008000", "#70e000", "#b5e48c", "#d4d700", "#eeef20"],
                    orphan: ["#6c757d", "#adb5bd", "#495057", "#ced4da"]
                },

                initEventListeners() {
                    document.getElementById('zoom-in-btn').onclick = () => this.zoomIn();
                    document.getElementById('zoom-out-btn').onclick = () => this.zoomOut();
                    document.getElementById('reset-view-btn').onclick = () => this.zoomToFit();
                    document.getElementById('cycle-category-btn').onclick = () => this.cycleCategoryFocus();
                    document.getElementById('revert-color-btn').onclick = () => this.setDefaultNodeColors();
                    document.getElementById('gather-nodes-btn').onclick = () => this.gatherNodes();
                    document.getElementById('filter-all-btn').onclick = () => this.setNodeStates('expand-all');
                    document.getElementById('filter-tags-btn').onclick = () => this.setNodeStates('collapse-to-tags');
                    document.getElementById('filter-orphans-btn').onclick = () => this.setNodeStates('orphans');
                    document.getElementById('vm-focus-line').onclick = () => App.events.toggleCanvasFocusMode();

                    // Premium Feature Gates
                    document.getElementById('random-color-btn').onclick = () => {
                        if (App.license.isPremium()) this.randomizeNodeColors(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('visual-map-layout-toggle').onclick = () => {
                        if (App.license.isPremium()) this.toggleLayout(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('visual-map-snapshot-btn').onclick = () => {
                        if (App.license.isPremium()) this.exportAndSave(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('toggle-snapshots-btn').onclick = () => {
                        if (App.license.isPremium()) this.cycleSnapshots(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('delete-snapshots-btn').onclick = () => {
                        if (App.license.isPremium()) this.deleteOldSnapshots(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('lasso-btn').onclick = () => {
                        if (App.license.isPremium()) this.toggleLasso(); else App.ui.showAscensionModal();
                    };
                    document.getElementById('expand-selection-btn').onclick = () => {
                        if (App.license.isPremium()) this.modifySelection('expand'); else App.ui.showAscensionModal();
                    };
                    document.getElementById('collapse-selection-btn').onclick = () => {
                        if (App.license.isPremium()) this.modifySelection('collapse'); else App.ui.showAscensionModal();
                    };

                    // Search listeners
                    const searchInput = document.getElementById('graph-search-input');
                    searchInput.oninput = (e) => this.searchNodes(e.target.value);
                    searchInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); this.findNextSearchResult(); } };
                    document.getElementById('find-next-btn').onclick = () => this.findNextSearchResult();

                    const layoutBtn = document.getElementById('visual-map-layout-toggle');
                    if (layoutBtn) layoutBtn.innerHTML = ICON_FORCE;
                },

                async init() {
                    if (typeof d3 === 'undefined' && App.loadLibrary) {
                        try {
                            await App.loadLibrary('d3');
                        } catch (e) {
                            console.error('Failed to lazy load D3 for visualMap:', e);
                        }
                    }
                    if (typeof d3 === 'undefined') {
                        const container = document.getElementById('visual-map-container');
                        if (container) container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:var(--text-secondary);">Visual Map unavailable.</div>';
                        return;
                    }
                    // If the view is already set up, just update the data
                    if (this.svg) {
                        this.updateGraph();
                        return;
                    }

                    // If it's the first time, render the canvas, then set up all listeners.
                    this.render();
                    this.initEventListeners();

                    const container = document.getElementById('visual-map-container');
                    container.focus();

                    // ... (rest of the original function from this point onwards)
                    container.onkeydown = (e) => {
                        if (document.activeElement.tagName !== 'INPUT') {
                            if (e.key === ' ' && e.shiftKey) { this.zoomOut(); e.preventDefault(); }
                            else if (e.key === ' ') { this.zoomIn(); e.preventDefault(); }
                            else {
                                switch (e.key.toLowerCase()) {
                                    case 'arrowup': this.pan(0, 1); e.preventDefault(); break;
                                    case 'arrowdown': this.pan(0, -1); e.preventDefault(); break;
                                    case 'arrowleft': this.pan(1, 0); e.preventDefault(); break;
                                    case 'arrowright': this.pan(-1, 0); e.preventDefault(); break;
                                    case 't': this.cycleCategoryFocus(); e.preventDefault(); break;
                                    case 'c':
                                        if (App.license.isPremium()) this.randomizeNodeColors();
                                        else App.ui.showAscensionModal();
                                        e.preventDefault();
                                        break;
                                    case 'f': App.events.toggleCanvasFocusMode(); e.preventDefault(); break;
                                    // --- SHORTCUT SWAP ---
                                    case 's': document.getElementById('graph-search-input')?.focus(); e.preventDefault(); break; // 'S' is now for Search
                                    case 'p': this.exportAndSave(); e.preventDefault(); break; // 'F' is now for snapshot/save frame
                                    // --- END SWAP ---
                                    case 'l': this.toggleLasso(); e.preventDefault(); break;
                                    case 'r': this.zoomToFit(); e.preventDefault(); break;
                                    case 'escape':
                                        if (document.body.classList.contains('canvas-focus-mode')) {
                                            App.events.toggleCanvasFocusMode();
                                        } else if (this.isLassoActive) {
                                            this.toggleLasso();
                                        } else {
                                            const searchInput = document.getElementById('graph-search-input');
                                            if (searchInput) { searchInput.value = ''; this.searchNodes(''); searchInput.blur(); }
                                        }
                                        e.preventDefault();
                                        break;
                                    case '+': case '=': this.zoomIn(); e.preventDefault(); break;
                                    case '-': this.zoomOut(); e.preventDefault(); break;
                                }
                            }
                        }
                    };

                    const snapshots = App.state.visualMapState.snapshots || [];
                    if (snapshots.length > 0) {
                        this.loadSnapshot(snapshots[snapshots.length - 1]);
                    } else {
                        this.zoomToFit();
                    }

                    this.resizeObserver = new ResizeObserver(entries => {
                        const { width, height } = entries[0].contentRect;
                        if ((width === this.width && height === this.height) || width < 1) return;
                        this.width = width;
                        this.height = height;
                        this.svg.attr("viewBox", [0, 0, this.width, this.height]);
                        this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2)).alpha(0.3).restart();
                    });
                    this.resizeObserver.observe(container);

                    container.addEventListener('wheel', e => e.preventDefault(), { passive: false });
                },

                triggerResize() {
                    const container = document.getElementById('visual-map-container');
                    if (!container || !this.resizeObserver) return;
                    this.resizeObserver.disconnect();
                    const newWidth = container.clientWidth;
                    const newHeight = container.clientHeight;
                    if (newWidth > 0 && newHeight > 0) {
                        this.width = newWidth;
                        this.height = newHeight;
                        this.svg.attr("viewBox", [0, 0, this.width, this.height]);
                        this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2)).alpha(0.3).restart();
                    }
                    this.resizeObserver.observe(container);
                },

                destroy() {
                    if (this.simulation && typeof d3 !== 'undefined') this.simulation.stop();
                    if (this.resizeObserver) this.resizeObserver.disconnect();
                    if (typeof d3 !== 'undefined') {
                        d3.select("#visual-map-container > svg").remove();
                        d3.select("#visual-map-container > #sticky-note-layer").remove();
                    } else {
                        const svg = document.querySelector("#visual-map-container > svg");
                        if (svg) svg.remove();
                        const sticky = document.querySelector("#visual-map-container > #sticky-note-layer");
                        if (sticky) sticky.remove();
                    }
                    this.svg = this.g = this.zoom = this.simulation = this.resizeObserver = null;
                },
                // Located in App.visualMap
                render() {
                    const container = d3.select("#visual-map-container");
                    container.selectAll("*").remove();
                    if (this.simulation) this.simulation.stop();
                    const rect = container.node().getBoundingClientRect();
                    this.width = Math.max(10, Math.floor(rect.width));
                    this.height = Math.max(10, Math.floor(rect.height));
                    if (this.width < 10 || this.height < 10) {
                        requestAnimationFrame(() => this.render());
                        return;
                    }

                    this.svg = container.append("svg").attr("viewBox", [0, 0, this.width, this.height]);
                    // Reversing to strictly CSS handling, but guaranteeing container doesn't block by making it explicit
                    const stickyNoteLayer = container.append("div").attr("id", "sticky-note-layer")
                        .style("pointer-events", "none")
                        .style("z-index", "50").style("position", "absolute")
                        .style("top", "0").style("left", "0")
                        .style("width", "100%").style("height", "100%");
                    const defs = this.svg.append("defs");
                    defs.append("radialGradient").attr("id", "node-gradient").append("stop").attr("offset", "0%").attr("stop-color", "white").attr("stop-opacity", 0.3).select(function () { return this.parentNode; }).append("stop").attr("offset", "100%").attr("stop-color", "white").attr("stop-opacity", 0);
                    const dropShadow = defs.append("filter").attr("id", "drop-shadow").attr("height", "130%");
                    dropShadow.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 1);
                    dropShadow.append("feOffset").attr("dx", 1).attr("dy", 1).attr("result", "offsetblur");
                    const feMerge = dropShadow.append("feMerge");
                    feMerge.append("feMergeNode"); feMerge.append("feMergeNode").attr("in", "SourceGraphic");
                    this.g = this.svg.append("g");
                    this.g.append('rect').attr('class', 'background-rect').attr('width', '140%').attr('height', '140%').attr('x', '-20%').attr('y', '-20%').attr('fill', 'var(--bg-secondary)');
                    this.link = this.g.append("g").attr("class", "links").selectAll("line");
                    this.node = this.g.append("g").attr("class", "nodes").selectAll("g.node-group");
                    this.simulation = d3.forceSimulation()
                        .force("charge", d3.forceManyBody().strength(-300))
                        .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(1))
                        .force("collision", d3.forceCollide().radius(d => d.type === 'category' ? 30 : 20))
                        .force("link", d3.forceLink().id(d => d.id).distance(80).strength(1))
                        .force("x", d3.forceX(this.width / 2).strength(0.05))
                        .force("y", d3.forceY(this.height / 2).strength(0.05))
                        .alphaDecay(0.0228)
                        .velocityDecay(0.4);

                    this.updateGraph();

                    // FIX: The "tick" handler is simplified to remove the node constraints.
                    this.simulation.on("tick", () => {
                        this.node.attr("transform", d => `translate(${d.x},${d.y})`);
                        this.link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
                    });

                    this.zoom = d3.zoom().scaleExtent([0.1, 4])
                        .filter(event => !event.target.closest('.node-group'))
                        .on("zoom", (e) => {
                            this.currentZoom = e.transform;
                            this.g.attr("transform", e.transform);
                            stickyNoteLayer.style("transform", `translate(${e.transform.x}px, ${e.transform.y}px) scale(${e.transform.k})`);
                            this.g.selectAll('.node-text').classed('lod-hidden', e.transform.k < 0.6);
                        });
                    this.svg.call(this.zoom).on("dblclick.zoom", null);
                },


                /* Fix for Large DataSets for Map */
                _renderState: {
                    fullNodes: [],
                    fullLinks: [],
                    renderIndex: 0,
                    isRendering: false,
                    batchSize: 150, // Render 150 nodes per batch
                    renderHandle: null
                },
                // Located in App.visualMap - REPLACE the entire function
                _renderNextBatch() {
                    if (!this._renderState.isRendering) return;

                    const { fullNodes, fullLinks, batchSize } = this._renderState;
                    let { renderIndex } = this._renderState;

                    const nodesBatch = fullNodes.slice(0, renderIndex + batchSize);

                    const renderedNodeIds = new Set(nodesBatch.map(n => n.id));
                    const linksBatch = fullLinks.filter(l => renderedNodeIds.has(l.source.id || l.source) && renderedNodeIds.has(l.target.id || l.target));

                    this.simulation.nodes(nodesBatch);
                    this.simulation.force("link").links(linksBatch);

                    this.link = this.g.select(".links").selectAll("line").data(linksBatch, d => d.id);
                    this.link.enter().append("line").attr('class', 'link').attr("stroke-opacity", 0).merge(this.link)
                        .attr("stroke-width", 1.5).attr("stroke", d => {
                            if (d.source.type === 'category' && d.target.type === 'tag') return 'var(--node-category)';
                            if (d.source.type === 'tag' && d.target.type === 'article') return 'var(--node-tag)';
                            return 'var(--border-color)';
                        }).transition().duration(500).attr("stroke-opacity", 0.6);
                    this.link.exit().remove();

                    this.node = this.g.select(".nodes").selectAll("g.node-group").data(nodesBatch, d => d.id);
                    const nodeEnter = this.node.enter().append("g").attr("class", "node-group").attr("opacity", 0);

                    nodeEnter.append("title").text(d => {
                        if (d.type === 'article' || d.type === 'orphan') { const article = App.storage.getArticle(d.realId); if (!article) return d.label; const tempDiv = document.createElement('div'); tempDiv.innerHTML = article.content; const excerpt = (tempDiv.textContent || "").substring(0, 150); return `${article.title}\n\n${excerpt}...`; } return d.label;
                    });
                    nodeEnter.append("circle").attr("class", "node-main-body").attr("r", d => d.type === 'category' ? 15 : (d.type === 'tag' || d.type === 'orphan') ? 10 : 8).style("fill", d => d.isDuplicate ? `var(--node-article-duplicate)` : `var(--node-${d.type})`).style("filter", "url(#drop-shadow)");
                    nodeEnter.append("circle").attr("class", "node-highlight").attr("r", d => d.type === 'category' ? 15 : (d.type === 'tag' || d.type === 'orphan') ? 10 : 8).attr("fill", "url(#node-gradient)");
                    nodeEnter.append("text").attr("class", d => `node-text ${this.currentZoom.k < 0.6 ? 'lod-hidden' : ''}`).text(d => d.label).attr("fill", "var(--node-text-color)").attr("x", d => d.type === 'category' ? 20 : 15).attr("y", 4).style("pointer-events", "none");
                    nodeEnter.call(this.drag(this.simulation));


                    nodeEnter.on("click", (event, d) => {
                        if (event.defaultPrevented) return;
                        event.stopPropagation();
                        if (event.shiftKey) {
                            this.toggleNodeSelection(d.id);
                        } else {
                            if (d.type === 'article') {
                                this.stickyNotes.create(d);
                            } else if (d.type === 'orphan') {
                                App.router.navigateTo('article', { id: d.realId, mode: 'read' });
                            } else {
                                // This is the logic that handles collapsing for Categories and Tags
                                this.nodeStates[d.id] = { collapsed: !(this.nodeStates[d.id]?.collapsed) };
                                this.updateGraph(); // This re-runs the main render function with the new state
                            }
                        }
                    });


                    this.node = nodeEnter.merge(this.node);
                    this.node.exit().transition().duration(300).attr("opacity", 0).remove();
                    this.node.raise().transition().duration(500).attr("opacity", 1);

                    this.simulation.alpha(0.3).restart();

                    this._renderState.renderIndex += batchSize;

                    const progressPercent = Math.round((this._renderState.renderIndex / fullNodes.length) * 100);
                    App.ui.showToast(`Loading graph... ${Math.min(100, progressPercent)}%`, { type: 'info', duration: 2000 });

                    if (this._renderState.renderIndex < fullNodes.length) {
                        const schedule = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback : (cb) => setTimeout(cb, 16);
                        this._renderState.renderHandle = schedule(() => this._renderNextBatch());
                    } else {
                        this._renderState.isRendering = false;
                        App.ui.showToast('Graph loaded!', { type: 'success' });
                    }
                },


                updateGraph() {
                    if (this._renderState.isRendering && this._renderState.renderHandle) {
                        if (typeof window.cancelIdleCallback === 'function') {
                            window.cancelIdleCallback(this._renderState.renderHandle);
                        } else {
                            clearTimeout(this._renderState.renderHandle);
                        }
                    }

                    const { nodes, links } = this.prepareGraphData(this.currentFilter);

                    if (nodes.length <= this._renderState.batchSize) {
                        this._renderState.isRendering = false;
                        this.simulation.nodes(nodes);
                        this.simulation.force("link").links(links);

                        this.link = this.g.select(".links").selectAll("line").data(links, d => d.id).join(enter => enter.append("line").attr('class', 'link').attr("stroke-opacity", 0), u => u, exit => exit.transition().duration(300).attr("stroke-opacity", 0).remove());
                        this.node = this.g.select(".nodes").selectAll("g.node-group").data(nodes, d => d.id).join(enter => { const nodeEnter = enter.append("g").attr("class", "node-group").attr("opacity", 0); nodeEnter.append("circle").attr("class", "node-main-body").attr("r", d => d.type === 'category' ? 15 : (d.type === 'tag' || d.type === 'orphan') ? 10 : 8).style("fill", d => d.isDuplicate ? `var(--node-article-duplicate)` : `var(--node-${d.type})`).style("filter", "url(#drop-shadow)"); nodeEnter.append("circle").attr("class", "node-highlight").attr("r", d => d.type === 'category' ? 15 : (d.type === 'tag' || d.type === 'orphan') ? 10 : 8).attr("fill", "url(#node-gradient)"); nodeEnter.append("text").attr("class", d => `node-text ${this.currentZoom.k < 0.6 ? 'lod-hidden' : ''}`).text(d => d.label).attr("font-size", "10px").attr("fill", "var(--node-text-color)").attr("x", d => d.type === 'category' ? 20 : 15).attr("y", 4).style("pointer-events", "none"); nodeEnter.call(this.drag(this.simulation)); nodeEnter.on("click", (event, d) => { if (event.defaultPrevented) return; event.stopPropagation(); if (event.shiftKey) { this.toggleNodeSelection(d.id); } else { if (d.type === 'article') { this.stickyNotes.create(d); } else if (d.type === 'orphan') { App.router.navigateTo('article', { id: d.realId, mode: 'read' }); } else { this.nodeStates[d.id] = { collapsed: !(this.nodeStates[d.id]?.collapsed) }; this.updateGraph(); } } }); return nodeEnter; }, u => u, exit => exit.transition().duration(300).attr("opacity", 0).remove());
                        this.link.attr("stroke-width", 1.5).attr("stroke", d => { if (d.source.type === 'category' && d.target.type === 'tag') return 'var(--node-category)'; if (d.source.type === 'tag' && d.target.type === 'article') return 'var(--node-tag)'; return 'var(--border-color)'; });
                        this.node.raise();
                        this.node.transition().duration(500).attr("opacity", 1);
                        this.link.transition().duration(500).attr("stroke-opacity", 0.6);
                        const numNodes = this.simulation.nodes().length;
                        const forceCharge = this.simulation.force("charge");
                        if (forceCharge) forceCharge.strength(-250 - numNodes * 5);
                        const forceLink = this.simulation.force("link");
                        if (forceLink) forceLink.distance(d => (d.source.type === 'category' ? 100 : 60) + (numNodes / 4));
                        this.simulation.alpha(0.3).restart();

                    } else {
                        this._renderState.fullNodes = nodes;
                        this._renderState.fullLinks = links;
                        this._renderState.renderIndex = 0;
                        this._renderState.isRendering = true;

                        this.simulation.nodes([]);
                        this.simulation.force("link").links([]);
                        this.g.select(".nodes").selectAll("g.node-group").remove();
                        this.g.select(".links").selectAll("line").remove();

                        this._renderNextBatch();
                    }
                },



                prepareGraphData(filter) {
                    const articles = App.state.articles;
                    if (filter === 'orphans') {
                        const orphanNodes = articles.filter(a => !a.tags || a.tags.length === 0)
                            .map(a => ({ id: a.id, realId: a.id, label: a.title || 'Untitled', type: 'orphan', isDuplicate: false }));
                        return { nodes: orphanNodes, links: [] };
                    }


                    const categoryNodes = new Map();
                    App.settings.get('userCategories').forEach(catObj => {
                        // We now correctly use catObj.name for both the ID and for getting the display name.
                        categoryNodes.set(catObj.name, { id: catObj.name, type: 'category', label: App.util.getCategoryDisplayName(catObj.name) });
                    });


                    const tagNodes = new Map();
                    const articleIdToTags = new Map();
                    const tagToCategories = new Map();
                    const articleIdCounts = new Map();

                    articles.forEach(article => {
                        if (!article.tags || article.tags.length === 0) return;

                        articleIdToTags.set(article.id, article.tags);

                        article.tags.forEach(tagId => {
                            articleIdCounts.set(article.id, (articleIdCounts.get(article.id) || 0) + 1);
                            if (!tagNodes.has(tagId)) {
                                tagNodes.set(tagId, { id: tagId, type: 'tag', label: App.state.tags[tagId]?.displayName || tagId });
                            }
                            if (article.category) {
                                if (!tagToCategories.has(tagId)) tagToCategories.set(tagId, new Set());
                                tagToCategories.get(tagId).add(article.category);
                            }
                        });
                    });

                    const collapsedCategoryIds = new Set(Object.keys(this.nodeStates).filter(id => this.nodeStates[id]?.collapsed));
                    const visibleTagIds = new Set();
                    tagNodes.forEach((tagNode, tagId) => {
                        const parentCategories = tagToCategories.get(tagId) || new Set();
                        const isVisible = Array.from(parentCategories).some(catId => !collapsedCategoryIds.has(catId));
                        if (isVisible) {
                            visibleTagIds.add(tagId);
                        }
                    });

                    const finalNodes = [...categoryNodes.values()];
                    const finalLinks = [];
                    const collapsedTagIds = new Set(Object.keys(this.nodeStates).filter(id => this.nodeStates[id]?.collapsed));

                    visibleTagIds.forEach(tagId => finalNodes.push(tagNodes.get(tagId)));

                    tagToCategories.forEach((categories, tagId) => {
                        if (visibleTagIds.has(tagId)) {
                            categories.forEach(catId => {
                                if (!collapsedCategoryIds.has(catId)) {
                                    finalLinks.push({ id: `${catId}-${tagId}`, source: catId, target: tagId });
                                }
                            });
                        }
                    });

                    articleIdToTags.forEach((tags, articleId) => {
                        const article = App.storage.getArticle(articleId);
                        tags.forEach(tagId => {
                            if (visibleTagIds.has(tagId) && !collapsedTagIds.has(tagId)) {
                                const articleNodeId = `${articleId}-${tagId}`;
                                const isDuplicate = (articleIdCounts.get(articleId) || 0) > 1;
                                finalNodes.push({ id: articleNodeId, realId: articleId, label: article.title || 'Untitled', type: 'article', tagId: tagId, isDuplicate });
                                finalLinks.push({ id: `${tagId}-${articleNodeId}`, source: tagId, target: articleNodeId });
                            }
                        });
                    });

                    return { nodes: finalNodes, links: finalLinks };
                },



                searchNodes(term) {
                    if (!this.simulation) return; this.currentSearchResults = []; this.currentSearchIndex = -1;
                    const termLower = term.toLowerCase().trim();
                    const allNodes = this.g.selectAll('.node-group'); const allLinks = this.g.selectAll('.link'); const allText = this.g.selectAll('.node-text');
                    allNodes.classed('faded', false); allLinks.classed('faded', false);
                    allText.each(function (d) { d3.select(this).text(d.label).selectAll('tspan').remove(); });
                    if (!termLower) return;

                    if (this.currentFilter === 'orphans') {
                        const spotlightIds = new Set();
                        this.simulation.nodes().forEach(d => { if (d.label && d.label.toLowerCase().includes(termLower)) spotlightIds.add(d.id); });
                        this.currentSearchResults = Array.from(spotlightIds);
                        allNodes.classed('faded', d => !spotlightIds.has(d.id));
                        allText.filter(d => spotlightIds.has(d.id)).html(d => { const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); return d.label.replace(regex, `<tspan class="search-highlight">$&</tspan>`); });
                        // Auto-focus the first orphan result
                        if (this.currentSearchResults.length > 0) this.findNextSearchResult();
                        return;
                    }

                    const spotlightIds = new Set(); const directMatchIds = new Set();
                    const simulationNodes = this.simulation.nodes();
                    simulationNodes.forEach(d => { if (d.label && d.label.toLowerCase().includes(termLower)) { spotlightIds.add(d.id); directMatchIds.add(d.id); if (d.type === 'article' && d.tagId) spotlightIds.add(d.tagId); if (d.type === 'tag' && d.categoryIds) { d.categoryIds.forEach(catId => spotlightIds.add(catId)); simulationNodes.forEach(node => { if (node.tagId === d.id) spotlightIds.add(node.id); }); } if (d.type === 'category' && d.tagIds) { d.tagIds.forEach(tagId => spotlightIds.add(tagId)); } } });

                    // --- START OF HIERARCHICAL SEARCH FIX ---
                    const allNodesMap = new Map(simulationNodes.map(n => [n.id, n]));
                    const matchingNodeObjects = Array.from(directMatchIds).map(id => allNodesMap.get(id)).filter(Boolean);

                    const priority = { 'category': 1, 'tag': 2, 'article': 3, 'orphan': 3 };

                    matchingNodeObjects.sort((a, b) => {
                        const priorityA = priority[a.type] || 4;
                        const priorityB = priority[b.type] || 4;
                        if (priorityA !== priorityB) {
                            return priorityA - priorityB;
                        }
                        return a.label.localeCompare(b.label);
                    });

                    this.currentSearchResults = matchingNodeObjects.map(n => n.id);
                    // --- END OF HIERARCHICAL SEARCH FIX ---

                    allNodes.classed('faded', d => !spotlightIds.has(d.id));
                    allLinks.classed('faded', l => !spotlightIds.has(l.source.id) || !spotlightIds.has(l.target.id));
                    allText.filter(d => directMatchIds.has(d.id)).html(d => { const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); return d.label.replace(regex, `<tspan class="search-highlight">$&</tspan>`); });

                    // Auto-focus the first result
                    if (this.currentSearchResults.length > 0) {
                        this.findNextSearchResult();
                    }
                },


                findNextSearchResult() {
                    if (!this.currentSearchResults || this.currentSearchResults.length === 0) { App.ui.showToast("No search results to cycle through."); return; }
                    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.currentSearchResults.length;
                    const targetNodeId = this.currentSearchResults[this.currentSearchIndex]; const targetNode = this.simulation.nodes().find(n => n.id === targetNodeId);
                    if (targetNode) {
                        const scale = this.currentZoom.k > 1.5 ? this.currentZoom.k : 1.5; const x = this.width / 2 - targetNode.x * scale; const y = this.height / 2 - targetNode.y * scale;
                        this.svg.transition().duration(750).ease(d3.easeCubicInOut).call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
                        this.node.selectAll('.node-main-body').style('stroke', null).style('stroke-width', null);
                        this.node.filter(d => d.id === targetNodeId).select('.node-main-body').transition().duration(200).style('stroke', 'var(--danger-color)').style('stroke-width', '4px').transition().duration(1500).style('stroke', null).style('stroke-width', null);
                    }
                },
                focusOnStickyNote(noteId) {
                    // CORRECTED: Uses App.state
                    const noteState = App.state.visualMapState.stickyNotes[noteId];
                    if (!noteState || !this.svg) return;
                    const noteCenterX = noteState.x + (noteState.width / 2), noteCenterY = noteState.y + (noteState.height / 2);
                    const viewportCenterX = this.width / 2, viewportCenterY = this.height / 2;
                    const desiredScale = Math.min(2, Math.min(this.width / (noteState.width * 2), this.height / (noteState.height * 2)));
                    const newX = viewportCenterX - (noteCenterX * desiredScale), newY = viewportCenterY - (noteCenterY * desiredScale);
                    this.svg.transition().duration(750).ease(d3.easeCubicInOut).call(this.zoom.transform, d3.zoomIdentity.translate(newX, newY).scale(desiredScale));
                },
                cycleCategoryFocus() { if (!this.simulation) return; const categoryNodes = this.simulation.nodes().filter(n => n.type === 'category'); if (categoryNodes.length === 0) return; this.currentCategoryIndex = (this.currentCategoryIndex + 1) % categoryNodes.length; const targetNode = categoryNodes[this.currentCategoryIndex]; if (typeof targetNode.x !== 'number') return; const scale = 1.5; const x = this.width / 2 - targetNode.x * scale; const y = this.height / 2 - targetNode.y * scale; this.svg.transition().duration(1000).ease(d3.easeCubicInOut).call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale)); },


                setNodeStates(mode) {
                    document.querySelectorAll('#visual-map-controls .control-btn.active').forEach(b => b.classList.remove('active'));
                    if (mode === 'expand-all') { this.nodeStates = {}; this.currentFilter = 'all'; document.getElementById('filter-all-btn')?.classList.add('active'); }
                    // CORRECTED: Uses App.state
                    else if (mode === 'collapse-to-tags') { this.nodeStates = {}; Object.values(App.state.tags).forEach(t => this.nodeStates[t.id] = { collapsed: true }); this.currentFilter = 'all'; document.getElementById('filter-tags-btn')?.classList.add('active'); }
                    else if (mode === 'orphans') { this.currentFilter = 'orphans'; document.getElementById('filter-orphans-btn')?.classList.add('active'); }
                    this.updateGraph(); this.zoomToFit();
                    const currentSearchTerm = document.getElementById('graph-search-input').value; if (currentSearchTerm) this.searchNodes(currentSearchTerm);
                },
                currentSnapshotIndex: -1,
                cycleSnapshots() {
                    // CORRECTED: Uses App.state
                    const snapshots = App.state.visualMapState.snapshots; if (!snapshots || snapshots.length === 0) { App.ui.showToast('No snapshots saved.'); return; }
                    this.currentSnapshotIndex = (this.currentSnapshotIndex + 1) % snapshots.length;
                    const snapshotToLoad = snapshots[snapshots.length - 1 - this.currentSnapshotIndex]; this.loadSnapshot(snapshotToLoad); App.ui.showToast(`Snapshot ${this.currentSnapshotIndex + 1}/${snapshots.length} ${this.currentSnapshotIndex === 0 ? '(Latest)' : ''}`);
                },
                deleteOldSnapshots() {
                    const snapshots = App.state.visualMapState.snapshots; if (!snapshots || snapshots.length === 0) { App.ui.showToast('No snapshots to delete.', { type: 'error' }); return; }
                    App.state.visualMapState.snapshots.shift(); this.currentSnapshotIndex = -1;
                    // CORRECTED: Uses App.fs
                    App.fs.write('visual-map-state.json', App.state.visualMapState); App.ui.showToast(`Oldest Snapshot Deleted.`);
                },
                loadSnapshot(snapshot) {
                    if (!snapshot) return; d3.select('#sticky-note-layer').selectAll('*').remove();
                    this.nodeStates = (snapshot.collapsedNodes || []).reduce((acc, id) => { acc[id] = { collapsed: true }; return acc; }, {}); this.updateGraph();
                    if (snapshot.transform) { const { x, y, k } = snapshot.transform; this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(k)); }
                    if (snapshot.openStickyNotes) { snapshot.openStickyNotes.forEach(noteStateInSnapshot => { if (App.storage.getArticle(noteStateInSnapshot.articleId)) { App.state.visualMapState.stickyNotes[noteStateInSnapshot.id] = noteStateInSnapshot; this.stickyNotes.render(noteStateInSnapshot.id); } }); }
                },
                async exportAndSave() {
                    if (typeof htmlToImage === 'undefined') {
                        App.ui.showToast('Snapshot feature unavailable offline.', { type: 'error' });
                        return;
                    }
                    const btn = document.getElementById('visual-map-snapshot-btn'); btn.style.color = 'var(--primary-color)'; const container = document.getElementById('visual-map-container');
                    try {
                        const blob = await htmlToImage.toBlob(container, { backgroundColor: getComputedStyle(container).backgroundColor, width: container.clientWidth, height: container.clientHeight });
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); App.ui.showToast('Snapshot saved & image copied!');
                    } catch (e) { console.error("Image copy failed", e); App.ui.showToast('Snapshot saved (image copy failed).'); }
                    const transform = d3.zoomTransform(this.svg.node());
                    const collapsedNodes = Object.keys(this.nodeStates).filter(k => this.nodeStates[k].collapsed);
                    const openStickyNotes = Array.from(document.querySelectorAll('#sticky-note-layer .sticky-note-tile')).map(el => App.state.visualMapState.stickyNotes[el.id]).filter(Boolean);
                    const newSnapshot = { transform: { x: transform.x, y: transform.y, k: transform.k }, collapsedNodes, openStickyNotes, timestamp: new Date().toISOString() };
                    App.state.visualMapState.snapshots.push(newSnapshot);
                    if (App.state.visualMapState.snapshots.length > 10) App.state.visualMapState.snapshots.shift();
                    await App.fs.write('visual-map-state.json', App.state.visualMapState);
                    setTimeout(() => { btn.style.color = ''; }, 1000);
                },
                zoomToFit() {
                    setTimeout(() => {
                        if (!this.g || !this.simulation || this.simulation.nodes().length === 0) return;
                        const bounds = this.g.node().getBBox(); if (bounds.width === 0 || bounds.height === 0) return;
                        const { x, y, width, height } = bounds;
                        const scale = Math.min(1.5, 0.9 / Math.max(width / this.width, height / this.height));
                        const translate = [this.width / 2 - scale * (x + width / 2), this.height / 2 - scale * (y + height / 2)];
                        const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
                        this.svg.transition().duration(750).call(this.zoom.transform, transform);
                    }, 150);
                },
                zoomIn() { this.zoom && this.zoom.scaleBy(this.svg.transition().duration(750), 1.5); },
                zoomOut() { this.zoom && this.zoom.scaleBy(this.svg.transition().duration(750), 1 / 1.5); },
                pan(dx, dy) { if (!this.zoom) return; const panX = dx * (this.width / 4); const panY = dy * (this.height / 4); this.zoom.translateBy(this.svg.transition().duration(600), -panX, -panY); },


                setDefaultNodeColors() {
                    if (!this.node) return;
                    this.node.selectAll(".node-main-body").transition().duration(750)
                        .style("fill", d => d.isDuplicate ? `var(--node-article-duplicate)` : `var(--node-${d.type})`);
                },
                gatherNodes() {
                    if (!this.simulation) return;
                    // Temporarily increase the strength of centering forces
                    const forceCenter = this.simulation.force("center");
                    const forceX = this.simulation.force("x");
                    const forceY = this.simulation.force("y");
                    
                    if (forceCenter) forceCenter.strength(1.5);
                    if (forceX) forceX.strength(0.5);
                    if (forceY) forceY.strength(0.5);

                    // "Reheat" the simulation to make nodes move
                    this.simulation.alpha(1).restart();
                    // Reset strengths back to normal after 2 seconds
                    setTimeout(() => {
                        if (!this.simulation) return;
                        const fc = this.simulation.force("center");
                        const fx = this.simulation.force("x");
                        const fy = this.simulation.force("y");
                        if (fc) fc.strength(1);
                        if (fx) fx.strength(0.05);
                        if (fy) fy.strength(0.05);
                    }, 2000);
                },
                toggleLayout() {
                    if (!this.simulation) return;
                    this.layoutMode = this.layoutMode === 'Force' ? 'Radial' : 'Force';
                    const btn = document.getElementById('visual-map-layout-toggle');
                    btn.innerHTML = this.layoutMode === 'Force' ? ICON_FORCE : ICON_RADIAL;

                    if (this.layoutMode === 'Radial') {
                        // Apply radial forces
                        this.simulation.force("x", null).force("y", null); // Remove X and Y forces
                        this.simulation.force("radial", d3.forceRadial(d => d.type === 'category' ? 0 : (d.type === 'tag' ? 150 : 250), this.width / 2, this.height / 2).strength(0.8));
                    } else {
                        // Apply standard X and Y forces
                        this.simulation.force("radial", null); // Remove radial force
                        this.simulation.force("x", d3.forceX(this.width / 2).strength(0.05));
                        this.simulation.force("y", d3.forceY(this.height / 2).strength(0.05));
                    }
                    this.simulation.alpha(1).restart();
                },


                randomizeNodeColors() {
                    if (!this.node) return; const articleColorMap = {};
                    this.node.selectAll(".node-main-body").each((d, i, nodes) => {
                        let color; const palette = this.colorPalettes[d.type]; if (!palette) return;
                        if (d.type === 'article' || d.type === 'orphan') { if (!articleColorMap[d.realId]) articleColorMap[d.realId] = palette[Math.floor(Math.random() * palette.length)]; color = articleColorMap[d.realId]; }
                        else color = palette[Math.floor(Math.random() * palette.length)];
                        d3.select(nodes[i]).transition().duration(750).style("fill", color);
                    });
                },
                drag(simulation) {
                    const self = this;
                    function dragstarted(e, d) { if (!e.active && self.layoutMode === 'Force') simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
                    function dragged(e, d) { d.fx = e.x; d.fy = e.y; }
                    function dragended(e, d) {
                        if (!e.active && self.layoutMode === 'Force') simulation.alphaTarget(0);
                        if (self.layoutMode === 'Force') { d.fx = null; d.fy = null; }
                    }
                    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
                },
                pointInPolygon(point, polygon) { let x = point[0], y = point[1]; let inside = false; for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { let xi = polygon[i][0], yi = polygon[i][1]; let xj = polygon[j][0], yj = polygon[j][1]; let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi); if (intersect) inside = !inside; } return inside; },
                toggleLasso() {
                    this.isLassoActive = !this.isLassoActive; const btn = document.getElementById('lasso-btn'); const container = document.getElementById('visual-map-container');
                    if (this.isLassoActive) { btn.classList.add('active'); container.style.cursor = 'crosshair'; this.clearSelection(); this.svg.on('.zoom', null); this.svg.on('mousedown.lasso', (e) => this.lassoStart(e)).on('mousemove.lasso', (e) => this.lassoDraw(e)).on('mouseup.lasso', (e) => this.lassoEnd(e)); }
                    else { btn.classList.remove('active'); container.style.cursor = 'grab'; if (this.lassoSelection) this.lassoSelection.remove(); this.lassoSelection = null; this.svg.on('.lasso', null); this.svg.call(this.zoom); this.clearSelection(); }
                },
                clearSelection() { this.selectedNodes.clear(); this.node.classed('selected', false); document.getElementById('expand-selection-btn').style.display = 'none'; document.getElementById('collapse-selection-btn').style.display = 'none'; },
                modifySelection(action) {
                    if (this.selectedNodes.size === 0) return;
                    this.selectedNodes.forEach(nodeId => {
                        const nodeData = this.simulation.nodes().find(n => n.id === nodeId);
                        if (nodeData && (nodeData.type === 'category' || nodeData.type === 'tag')) { if (action === 'collapse') this.nodeStates[nodeId] = { collapsed: true }; else if (this.nodeStates[nodeId]) delete this.nodeStates[nodeId]; }
                    });
                    this.updateGraph(); this.toggleLasso();
                },
                lassoStart(event) { if (!this.isLassoActive) return; this.clearSelection(); this.lassoPoints = []; if (this.lassoSelection) this.lassoSelection.remove(); this.lassoSelection = this.g.append("path").style('fill', 'rgba(0, 123, 255, 0.1)').style('stroke', 'var(--primary-color)').style('stroke-width', '1.5px'); },
                lassoDraw(event) { if (!this.isLassoActive || this.lassoPoints === null) return; const [x, y] = d3.pointer(event, this.g.node()); this.lassoPoints.push([x, y]); this.lassoSelection.attr("d", "M" + this.lassoPoints.join("L") + "Z"); },
                lassoEnd(event) {
                    if (!this.isLassoActive || !this.lassoPoints || this.lassoPoints.length < 3) { if (this.lassoSelection) this.lassoSelection.remove(); this.lassoSelection = null; this.lassoPoints = null; return; }
                    this.node.each(d => { if (this.pointInPolygon([d.x, d.y], this.lassoPoints)) this.selectedNodes.add(d.id); });
                    if (this.selectedNodes.size > 0) { this.node.classed('selected', d => this.selectedNodes.has(d.id)); document.getElementById('expand-selection-btn').style.display = 'flex'; document.getElementById('collapse-selection-btn').style.display = 'flex'; }
                    this.lassoPoints = null; setTimeout(() => { if (this.lassoSelection) this.lassoSelection.remove(); this.lassoSelection = null; }, 500);
                },

                stickyNotes: {
                    extractSmartSnippet(articleId, tagId) {
                        const article = App.storage.getArticle(articleId);
                        if (!article || !article.content) return { html: "<p>Content unavailable.</p>", snippetId: null };

                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = article.content;
                        const tagElement = tempDiv.querySelector(`.rendered-tag[data-tag="${tagId}"]`);

                        if (tagElement) {
                            const parentBlock = tagElement.closest('p, ul, ol, blockquote, h1, h2, h3, h4, h5, h6, li');
                            if (parentBlock) {

                                return { html: parentBlock.outerHTML, snippetId: tagElement.id };
                            }
                        }

                        const firstP = tempDiv.querySelector('p');
                        const fallbackHtml = firstP ? firstP.outerHTML : `<p>${article.content.substring(0, 250)}...</p>`;
                        return { html: fallbackHtml, snippetId: null };
                    },
                    create(nodeData) {
                        const noteId = `note-${nodeData.realId}-${nodeData.tagId}`;
                        if (!App.state.visualMapState.stickyNotes[noteId]) {
                            const article = App.storage.getArticle(nodeData.realId);
                            if (!article) return;
                            // This new logic correctly fetches AND stores the snippetId
                            const snippetData = this.extractSmartSnippet(nodeData.realId, nodeData.tagId);
                            const noteState = { id: noteId, articleId: nodeData.realId, tagId: nodeData.tagId, snippetId: snippetData.snippetId, x: nodeData.x + 40, y: nodeData.y - 40, width: 280, height: 240, sizeIndex: 3, color: 'default', title: article.title || 'Untitled' };
                            App.state.visualMapState.stickyNotes[noteId] = noteState;
                        }
                        if (!document.getElementById(noteId)) { this.render(noteId); }
                        else {
                            App.visualMap.focusOnStickyNote(noteId);
                            const el = document.getElementById(noteId); el.classList.remove('spawn'); void el.offsetWidth; el.classList.add('spawn'); d3.select(el).raise();
                        }
                        App.fs.write('visual-map-state.json', App.state.visualMapState);
                    },
                    render(noteId) {
                        const noteState = App.state.visualMapState.stickyNotes[noteId];
                        if (!noteState) return;

                        // UPDATED: Ensure size properties exist, providing new, larger defaults if not.
                        noteState.width = noteState.width || 280;
                        noteState.height = noteState.height || 240;
                        noteState.sizeIndex = noteState.sizeIndex === undefined ? 3 : noteState.sizeIndex;

                        const noteLayer = d3.select('#sticky-note-layer');
                        const snippetData = this.extractSmartSnippet(noteState.articleId, noteState.tagId);
                        const sanitizedSnippet = App.util.sanitizeHTML(snippetData.html);

                        const noteHTML = `
                        <div class="sticky-note-header">
                            <h5 data-article-id="${noteState.articleId}" data-tag-id="${noteState.tagId}">${noteState.title}</h5>
                        </div>
                        <div class="sticky-note-content">${sanitizedSnippet}</div>
                        <div class="sticky-note-controls">
                            <button class="btn-icon color-btn" title="Cycle color">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>
                            </button>
                            <button class="btn-icon scroll-btn" title="Scroll content">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>
                            </button>
                            <button class="btn-icon resize-btn" title="Cycle size">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                            </button>
                            <button class="btn-icon close-btn" title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    `;

                        const note = noteLayer.append('div')
                            .attr('id', noteId)
                            .attr('class', `sticky-note-tile color-${noteState.color} spawn`)
                            .style('left', `${noteState.x}px`)
                            .style('top', `${noteState.y}px`)
                            .style('width', `${noteState.width}px`)
                            .style('height', `${noteState.height}px`)
                            .html(noteHTML);

                        note.select('.close-btn').on('mousedown', (e) => { e.stopPropagation(); this.remove(noteId); });
                        note.select('h5').on('click', (e) => {
                            e.stopPropagation();
                            App.router.navigateTo('article', { id: noteState.articleId, mode: 'read', scrollToSnippetId: noteState.snippetId })
                        });
                        note.select('.color-btn').on('click', (e) => { e.stopPropagation(); this.cycleColor(noteId); });
                        note.select('.resize-btn').on('click', (e) => { e.stopPropagation(); this.cycleSize(noteId); });
                        note.select('.scroll-btn').on('click', (e) => { e.stopPropagation(); this.scrollContent(noteId); });

                        const dragMove = d3.drag()
                            .filter(event => !event.target.closest('.sticky-note-controls'))
                            .on("start", (e) => note.raise().classed('dragging', true))
                            .on("drag", (e) => {
                                noteState.x += e.dx / App.visualMap.currentZoom.k;
                                noteState.y += e.dy / App.visualMap.currentZoom.k;
                                note.style('left', `${noteState.x}px`).style('top', `${noteState.y}px`);
                            }).on("end", () => {
                                note.classed('dragging', false);
                                App.fs.write('visual-map-state.json', App.state.visualMapState);
                            });

                        note.call(dragMove);
                    },

                    cycleSize(noteId) {
                        const noteState = App.state.visualMapState.stickyNotes[noteId];
                        if (!noteState) return;

                        const sizes = [
                            { w: 180, h: 140 }, // 1. X-Small
                            { w: 210, h: 170 }, // 2. Small
                            { w: 240, h: 200 }, // 3. Compact
                            { w: 280, h: 240 }, // 4. Default
                            { w: 340, h: 280 }, // 5. Large
                            { w: 400, h: 320 }, // 6. X-Large
                            { w: 460, h: 360 }  // 7. XX-Large
                        ];

                        noteState.sizeIndex = ((noteState.sizeIndex || 0) + 1) % sizes.length;
                        const newSize = sizes[noteState.sizeIndex];

                        noteState.width = newSize.w;
                        noteState.height = newSize.h;

                        const noteEl = d3.select(`#${noteId}`);
                        noteEl.transition().duration(250)
                            .style('width', `${noteState.width}px`)
                            .style('height', `${noteState.height}px`);

                        App.fs.write('visual-map-state.json', App.state.visualMapState);
                    },

                    scrollContent(noteId) {
                        const noteEl = document.getElementById(noteId);
                        if (!noteEl) return;
                        const contentEl = noteEl.querySelector('.sticky-note-content');
                        if (!contentEl) return;

                        const currentTop = contentEl.scrollTop;
                        const maxScroll = contentEl.scrollHeight - contentEl.clientHeight;
                        const pageHeight = contentEl.clientHeight * 0.8;

                        if (currentTop >= maxScroll - 5) {
                            contentEl.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                            contentEl.scrollTo({ top: Math.min(maxScroll, currentTop + pageHeight), behavior: 'smooth' });
                        }
                    },

                    remove(noteId) {
                        d3.select(`#${noteId}`).remove();
                        delete App.state.visualMapState.stickyNotes[noteId];
                        App.fs.write('visual-map-state.json', App.state.visualMapState);
                    },
                    cycleColor(noteId) {
                        const noteState = App.state.visualMapState.stickyNotes[noteId];
                        if (!noteState) return;
                        const noteEl = d3.select(`#${noteId}`);
                        noteEl.classed(`color-${noteState.color}`, false);
                        const currentIndex = App.config.stickyNoteColors.indexOf(noteState.color);
                        noteState.color = App.config.stickyNoteColors[(currentIndex + 1) % App.config.stickyNoteColors.length];
                        noteEl.classed(`color-${noteState.color}`, true);
                        App.fs.write('visual-map-state.json', App.state.visualMapState);
                    },
                },
};
