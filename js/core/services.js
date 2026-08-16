export const services = {
                export: {
                    _getUpsellPdfBlock(isAtEnd = false) {
                        // ── Native PDF export palette ─────────────────────────────────────────────
                        const WHITE = '#FFFFFF';
                        const BRAND = '#6366F1';   // used: snippet borders, highlight counts
                        const DARK = '#0F172A';   // used: h1 title color
                        const TEXT = '#374151';   // used: snippet body text
                        const MUTED = '#64748B';   // used: page numbers
                        const FAINT = '#94A3B8';   // used: footer text
                        const BORDER = '#E2E8F0';   // used: footer rule & content dividers

                        // Pill bg colors = the 8 highlight underline colors from highlightUnderlineMap
                        const PILLS = [
                            { label: 'VISUAL MAP', bg: '#4F46E5', tc: WHITE },  // accent indigo
                            { label: 'MIND MAP', bg: '#9333EA', tc: WHITE },  // purple-600
                            { label: 'FLASHCARDS', bg: '#DC2626', tc: WHITE },  // red-600
                            { label: 'FOCUS MODE', bg: '#2563EB', tc: WHITE },  // blue-600
                            { label: 'NoteKash AI', bg: '#16A34A', tc: WHITE },  // green-600
                            { label: 'SUPER TAGS', bg: '#EAB308', tc: DARK },  // yellow-500
                            { label: 'WHITEBOARD', bg: '#0891B2', tc: WHITE },  // cyan-600
                            { label: 'CLOUD SYNC', bg: '#DB2777', tc: WHITE }   // pink-600
                        ];

                        // makePillGrid — fresh object each call (pdfmake mutates objects in-place)
                        const makePillGrid = () => ({
                            table: {
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    PILLS.slice(0, 4).map(p => ({
                                        text: p.label, bold: true, fontSize: 7.5,
                                        color: p.tc, fillColor: p.bg, alignment: 'center',
                                        link: 'https://notekash.com'
                                    })),
                                    PILLS.slice(4, 8).map(p => ({
                                        text: p.label, bold: true, fontSize: 7.5,
                                        color: p.tc, fillColor: p.bg, alignment: 'center',
                                        link: 'https://notekash.com'
                                    }))
                                ]
                            },
                            layout: {
                                hLineWidth: () => 3, vLineWidth: () => 3,  // 3pt white gap = pill spacing
                                hLineColor: () => WHITE, vLineColor: () => WHITE,
                                paddingLeft: () => 0, paddingRight: () => 0,
                                paddingTop: () => 9, paddingBottom: () => 9
                            }
                        });

                        const contentCell = {
                            stack: [
                                // Brand header
                                {
                                    columns: [
                                        {
                                            width: '*',
                                            text: [
                                                { text: 'NOTE', bold: true, fontSize: 18, color: DARK },
                                                { text: ' KASH', bold: true, fontSize: 18, color: BRAND }
                                            ]
                                        },
                                        {
                                            width: 'auto',
                                            text: 'CIVILSKASH EDITION',
                                            fontSize: 7.5, bold: true, color: FAINT,
                                            characterSpacing: 1.5, alignment: 'right',
                                            margin: [0, 5, 0, 0], link: 'https://notekash.com'
                                        }
                                    ],
                                    margin: [0, 0, 0, 12]
                                },
                                // Thin rule
                                {
                                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 447, y2: 0, lineWidth: 0.5, lineColor: BORDER }],
                                    margin: [0, 0, 0, 14]
                                },
                                // Two-column value prop
                                {
                                    columns: [
                                        {
                                            width: '50%',
                                            stack: [
                                                { text: 'FOR NEW USERS', bold: true, fontSize: 14, color: BRAND, characterSpacing: 1.2, margin: [0, 0, 0, 9] },
                                                { text: 'Flashcards  ·  Focus Study Mode', fontSize: 12, color: TEXT, margin: [0, 0, 0, 5] },
                                                { text: 'Mind map  ·  Visual map (special)', fontSize: 12, color: TEXT, margin: [0, 0, 0, 5] },
                                                { text: 'AI NoteTaking  ·  Super Search', fontSize: 12, color: TEXT, margin: [0, 0, 0, 5] },
                                                { text: 'Spatial Notes  ·  Whiteboard', fontSize: 12, color: TEXT, margin: [0, 0, 0, 13] },
                                                { text: 'Unlock your Second Brain only on NoteKash.', fontSize: 10, color: FAINT, lineHeight: 1.5 }
                                            ]
                                        },
                                        {
                                            width: '50%',
                                            stack: [
                                                { text: 'FOR CREATORS', bold: true, fontSize: 14, color: '#DC2626', characterSpacing: 1.2, margin: [0, 0, 0, 9] },
                                                { text: 'Remove watermark & add Branding', fontSize: 12, color: TEXT, margin: [0, 0, 0, 5] },
                                                { text: 'Unlimited AI + Presentation Tools', fontSize: 12, color: TEXT, margin: [0, 0, 0, 5] },
                                                { text: 'Share Project or Export notes', fontSize: 12, color: TEXT, margin: [0, 0, 0, 5] },
                                                { text: 'MCQs, Accordian & Audio Transcribe', fontSize: 12, color: TEXT, margin: [0, 0, 0, 13] },
                                                { text: 'Upgrade to Creator tier to start curating Pro Content.', fontSize: 10, color: FAINT, lineHeight: 1.5 }
                                            ]
                                        }
                                    ],
                                    margin: [0, 0, 0, 16]
                                },
                                // Feature pills
                                makePillGrid(),
                                // Rule + CTA
                                {
                                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 447, y2: 0, lineWidth: 0.5, lineColor: BORDER }],
                                    margin: [0, 14, 0, 11]
                                },
                                {
                                    text: [
                                        { text: 'Get started free at  ', color: MUTED, fontSize: 9, link: 'https://notekash.com' },
                                        { text: 'notekash.com', color: BRAND, bold: true, fontSize: 9, link: 'https://notekash.com' }
                                    ],
                                    alignment: 'center'
                                }
                            ],
                            fillColor: WHITE,
                            margin: [24, 20, 24, 20]  // cell margin acts as inner padding (layout padding = 0)
                        };

                        // Outer card: white, indigo 4pt top-accent, hairline border on sides & bottom
                        const block = {
                            table: {
                                widths: ['*'],
                                body: [[contentCell]]
                            },
                            layout: {
                                hLineWidth: (i, node) => (i === 0) ? 4 : (i === node.table.body.length ? 0.5 : 0),
                                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0,
                                hLineColor: (i) => (i === 0) ? BRAND : BORDER,
                                vLineColor: () => BORDER,
                                paddingLeft: () => 0, paddingRight: () => 0,
                                paddingTop: () => 0, paddingBottom: () => 0
                            }
                        };

                        if (isAtEnd) {
                            block.pageBreak = 'before';
                        } else {
                            block.margin = [0, 0, 0, 22];
                        }

                        return block;
                    },
                    getCategoryContent(category, sortedArticles, asMarkdown = false) {
                        return sortedArticles.map(article => {
                            if (article.isReadOnly || article.preventReExport) return '';
                            const snippets = App.util.extractSnippets({ content: article.content, id: article.id }, 'highlight', asMarkdown);
                            if (snippets.length === 0) return '';
                            return (asMarkdown ? `## ${article.title}\n` : `Title: ${article.title}\n`) + snippets.map(s => (asMarkdown ? `- ${s.text}` : `• ${s.text}`)).join('\n');
                        }).filter(Boolean).join('\n\n');
                    },
                    getSortedArticlesForCategory(category) {
                        const sortBy = App.settings.get('categorySortBy') || 'updatedAt';
                        let articles = category === 'All' ? [...App.state.articles] : App.state.articles.filter(a => a.category === category);

                        if (sortBy === 'random') return articles.sort(() => Math.random() - 0.5);

                        articles.sort((a, b) => {
                            switch (sortBy) {
                                case 'createdAt': return new Date(a.createdAt) - new Date(b.createdAt);
                                case 'read': return (b.readCount || 0) - (a.readCount || 0);
                                case 'unread': return (a.readCount || 0) - (b.readCount || 0);
                                default: return new Date(b.updatedAt) - new Date(a.updatedAt);
                            }
                        });

                        if (sortBy === 'unread') articles = articles.filter(a => !a.readCount || a.readCount === 0);
                        if (sortBy === 'read') articles = articles.filter(a => a.readCount > 0);
                        return articles;
                    },
                    copyCategoryContent(category) {
                        if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                            return App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                        }
                        const sortedArticles = this.getSortedArticlesForCategory(category);
                        const text = this.getCategoryContent(category, sortedArticles, false);
                        if (!text) return App.ui.showToast('No content to copy.');
                        navigator.clipboard.writeText(text).then(() => App.ui.showToast("Content copied!"));
                    },
                    copyCategoryContentAsMarkdown(category) {
                        if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                            return App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                        }
                        const sortedArticles = this.getSortedArticlesForCategory(category);
                        const text = this.getCategoryContent(category, sortedArticles, true);
                        if (!text) return App.ui.showToast('No content to copy.');
                        navigator.clipboard.writeText(text).then(() => App.ui.showToast("Markdown content copied!"));
                    },
                    categoryAsText(category) {
                        const sortedArticles = this.getSortedArticlesForCategory(category);
                        const text = this.getCategoryContent(category, sortedArticles, false);
                        if (!text) return App.ui.showToast('No content to export.');
                        App.util.downloadBlob(new Blob([text], { type: 'text/plain' }), `${category}-highlights.txt`);
                    },
                    async categoryAsPdf(category, brandName = '', brandLink = '') {
                        // Check pdfmake availability
                        if (typeof pdfMake === 'undefined' && App.loadLibrary) {
                            const loadToast = App.ui.showToast('Loading PDF library...', { type: 'info', duration: 0 });
                            try {
                                await App.loadLibrary('pdfmake');
                                await App.loadLibrary('pdfmakeFonts');
                            } catch (e) {
                                console.error('Failed to load pdfmake:', e);
                                App.ui.showToast('Failed to load PDF library. Please check your internet connection.', { type: 'error' });
                                return;
                            } finally {
                                App.ui.hideToast(loadToast);
                            }
                        }
                        if (typeof pdfMake === 'undefined') {
                            App.ui.showToast('PDF library is not available.', { type: 'error' });
                            return;
                        }

                        const sortedArticles = this.getSortedArticlesForCategory(category);
                        const articlesWithSnippets = sortedArticles
                            .filter(article => !(article.isReadOnly || article.preventReExport))
                            .map(article => ({
                                ...article,
                                snippets: App.util.extractSnippets({ content: article.content, id: article.id }, 'highlight', true)
                            }))
                            .filter(article => article.snippets.length > 0);

                        if (articlesWithSnippets.length === 0) {
                            App.ui.showToast('No highlights in this category to export.', { type: 'info' });
                            return;
                        }

                        const toastId = App.ui.showToast('✨ Preparing PDF export...', { type: 'info', duration: 0 });

                        try {
                            // --- METHOD TO CREATE UPSELL PAGE ---
                            const createUpsellPage = (isAtEnd = false) => this._getUpsellPdfBlock(isAtEnd);

                            // ═══════════════════════════════════════════════════════════
                            // 🎨 DESIGN SYSTEM - Premium category snippets PDF
                            // ═══════════════════════════════════════════════════════════
                            const categoryName = App.util.getCategoryDisplayName(category);
                            const categoryColor = App.util.getCategoryColor(category);
                            const totalSnippets = articlesWithSnippets.reduce((sum, a) => sum + a.snippets.length, 0);

                            // Build content for each article with premium styling
                            const articleBlocks = [];
                            articlesWithSnippets.forEach((article, idx) => {
                                // Article separator (except first)
                                if (idx > 0) {
                                    articleBlocks.push({
                                        canvas: [{
                                            type: 'line',
                                            x1: 100, y1: 0,
                                            x2: 395, y2: 0,
                                            lineWidth: 0.5,
                                            lineColor: '#E5E7EB'
                                        }],
                                        margin: [0, 18, 0, 20]
                                    });
                                }

                                // Article title with snippet count - refined elegant design
                                articleBlocks.push({
                                    columns: [
                                        {
                                            text: article.title,
                                            bold: true,
                                            fontSize: 14,
                                            color: '#111827',
                                            width: '*',
                                            lineHeight: 1.2
                                        },
                                        {
                                            stack: [
                                                {
                                                    text: `${article.snippets.length}`,
                                                    fontSize: 11,
                                                    color: '#6366F1',
                                                    bold: true,
                                                    alignment: 'center'
                                                },
                                                {
                                                    text: article.snippets.length === 1 ? 'snip' : 'snips',
                                                    fontSize: 7,
                                                    color: '#9CA3AF',
                                                    alignment: 'center',
                                                    margin: [0, 1, 0, 0]
                                                }
                                            ],
                                            width: 35,
                                            alignment: 'right'
                                        }
                                    ],
                                    margin: [0, 0, 0, 12]
                                });

                                // Snippets for this article - premium left-bordered quotes
                                article.snippets.forEach((snippet, snippetIdx) => {
                                    // Strip HTML tags for clean text
                                    const cleanText = snippet.text || snippet.html?.replace(/<[^>]*>/g, '') || '';
                                    articleBlocks.push({
                                        table: {
                                            widths: [2.5, '*'],
                                            body: [[
                                                { text: '', fillColor: '#6366F1' },
                                                {
                                                    text: cleanText,
                                                    margin: [16, 12, 14, 12],
                                                    fontSize: 10.5,
                                                    color: '#374151',
                                                    lineHeight: 1.65,
                                                    italics: true,
                                                    fillColor: '#FAFBFC'
                                                }
                                            ]]
                                        },
                                        layout: {
                                            hLineWidth: () => 0,
                                            vLineWidth: () => 0,
                                            paddingLeft: () => 0,
                                            paddingRight: () => 0,
                                            paddingTop: () => 0,
                                            paddingBottom: () => 0
                                        },
                                        margin: [0, 0, 0, 8]
                                    });
                                });
                            });

                            // Premium user check (for watermark logic)
                            const isPremiumUser = App.license.isPremium();

                            // Build PDF document with premium design
                            const docDefinition = {
                                pageSize: 'A4',
                                pageMargins: [50, 50, 50, 55],

                                // ═══ WATERMARK (Non-premium — pure pdfmake vector text, zero image overhead, not clickable/selectable) ═══
                                watermark: !isPremiumUser ? { text: 'notekash.com', color: '#6366F1', opacity: 0.055, bold: true, fontSize: 54, angle: -45 } : undefined,

                                // ═══ FOOTER - Premium branding ═══
                                footer: function (currentPage, pageCount) {
                                    return {
                                        stack: [
                                            // Refined separator line
                                            {
                                                canvas: [{
                                                    type: 'line',
                                                    x1: 50, y1: 0,
                                                    x2: 545, y2: 0,
                                                    lineWidth: 0.4,
                                                    lineColor: '#E2E8F0'
                                                }]
                                            },
                                            // Elegant footer content
                                            {
                                                columns: [
                                                    // Left: Page indicator
                                                    {
                                                        text: [
                                                            { text: 'Page ', color: '#94A3B8', fontSize: 8 },
                                                            { text: `${currentPage}`, color: '#64748B', fontSize: 8, bold: true },
                                                            { text: ' of ', color: '#94A3B8', fontSize: 8 },
                                                            { text: `${pageCount}`, color: '#64748B', fontSize: 8, bold: true }
                                                        ],
                                                        margin: [50, 10, 0, 0],
                                                        width: '*'
                                                    },
                                                    // Center: User brand (Premium only)
                                                    {
                                                        text: brandName
                                                            ? (brandLink
                                                                ? [{ text: brandName, color: '#0891B2', bold: true, fontSize: 8.5, link: brandLink }]
                                                                : [{ text: brandName, color: '#0891B2', bold: true, fontSize: 8.5 }])
                                                            : '',
                                                        alignment: 'center',
                                                        margin: [0, 10, 0, 0],
                                                        width: '*'
                                                    },
                                                    // Right: notekash.com branding
                                                    {
                                                        text: [
                                                            { text: 'note', fontSize: 9, color: '#64748B', bold: true, link: 'https://notekash.com' },
                                                            { text: 'kash', fontSize: 9, color: '#6366F1', bold: true, link: 'https://notekash.com' },
                                                            { text: '.com', fontSize: 9, color: '#94A3B8', link: 'https://notekash.com' }
                                                        ],
                                                        alignment: 'right',
                                                        margin: [0, 9, 50, 0],
                                                        width: '*'
                                                    }
                                                ]
                                            }
                                        ],
                                        margin: [0, 8, 0, 0]
                                    };
                                },

                                content: [
                                    // Category badge - elegant uppercase label
                                    {
                                        text: categoryName.toUpperCase(),
                                        fontSize: 9,
                                        bold: true,
                                        color: categoryColor,
                                        characterSpacing: 1.5,
                                        margin: [0, 0, 0, 8]
                                    },

                                    // Main title - premium typography
                                    {
                                        text: 'Highlights Collection',
                                        fontSize: 32,
                                        bold: true,
                                        color: '#0F172A',
                                        lineHeight: 1.05,
                                        margin: [0, 0, 0, 6]
                                    },

                                    // Elegant subtitle
                                    {
                                        text: 'Curated snippets from your research',
                                        fontSize: 12,
                                        color: '#64748B',
                                        italics: true,
                                        margin: [0, 0, 0, 16]
                                    },

                                    // Meta info row - refined stats
                                    {
                                        columns: [
                                            {
                                                text: [
                                                    { text: `${totalSnippets} `, color: '#6366F1', bold: true, fontSize: 12 },
                                                    { text: `highlight${totalSnippets !== 1 ? 's' : ''}`, color: '#64748B', fontSize: 11 },
                                                    { text: '  ·  ', color: '#CBD5E1', fontSize: 11 },
                                                    { text: `${articlesWithSnippets.length} `, color: '#6366F1', bold: true, fontSize: 12 },
                                                    { text: `source${articlesWithSnippets.length !== 1 ? 's' : ''}`, color: '#64748B', fontSize: 11 }
                                                ]
                                            },
                                            {
                                                text: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
                                                fontSize: 10,
                                                color: '#94A3B8',
                                                alignment: 'right'
                                            }
                                        ],
                                        margin: [0, 0, 0, 12]
                                    },

                                    // Premium double-line divider with accent
                                    {
                                        canvas: [
                                            {
                                                type: 'line',
                                                x1: 0, y1: 0,
                                                x2: 495, y2: 0,
                                                lineWidth: 2.5,
                                                lineColor: categoryColor
                                            },
                                            {
                                                type: 'line',
                                                x1: 0, y1: 5,
                                                x2: 495, y2: 5,
                                                lineWidth: 0.5,
                                                lineColor: '#E2E8F0'
                                            }
                                        ],
                                        margin: [0, 6, 0, 28]
                                    },

                                    // Article blocks with snippets
                                    ...(!isPremiumUser ? [createUpsellPage(false)] : []),
                                    ...articleBlocks,
                                    ...(!isPremiumUser ? [createUpsellPage(true)] : [])
                                ],

                                defaultStyle: {
                                    font: 'Roboto',
                                    fontSize: 11,
                                    color: '#1E293B',
                                    lineHeight: 1.65
                                }
                            };

                            App.ui.updateToast(toastId, '🖨️ Generating PDF...');

                            // Generate and download
                            const filename = `${App.util.slugify(categoryName)}-highlights.pdf`;
                            if (App.offline.check('PDF Export') && typeof pdfMake !== 'undefined') pdfMake.createPdf(docDefinition).download(filename);

                            App.ui.updateToast(toastId, `✅ PDF exported: ${filename}`, { type: 'success', duration: 3000 });

                        } catch (error) {
                            console.error('Category PDF export error:', error);
                            App.ui.updateToast(toastId, '❌ Failed to generate PDF', { type: 'error', duration: 3000 });
                        }
                    },
                    copyCurrentArticleHighlights() {
                        if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                            return App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                        }
                        const article = App.storage.getArticle(App.state.activeArticleId); if (!article) return;
                        if (article.isReadOnly || article.preventReExport) return App.ui.showToast('Creator has disabled copying from this note', { type: 'warning' });
                        const highlights = App.util.extractSnippets({ content: article.content, id: article.id }, 'highlight');
                        if (highlights.length === 0) return App.ui.showToast("No highlights to copy.");
                        const watermark = '\n\n---\nShared from notekash.com';
                        const text = `Title: ${article.title}\n\n` + highlights.map(h => h.text).join('\n\n') + watermark;
                        navigator.clipboard.writeText(text).then(() => App.ui.showToast("Title and highlights copied!"));
                    },
                    copyArticleSnippets(articleId) {
                        if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                            return App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                        }
                        const article = App.storage.getArticle(articleId); if (!article) return;
                        if (article.isReadOnly || article.preventReExport) return App.ui.showToast('Creator has disabled copying from this note', { type: 'warning' });
                        const snippets = App.util.extractSnippets({ content: article.content, id: article.id }, 'highlight');
                        if (snippets.length === 0) return App.ui.showToast("No snippets to copy for this article.");
                        const text = `Title: ${article.title}\n` + snippets.map(s => `• ${s.text}`).join('\n');
                        navigator.clipboard.writeText(text).then(() => App.ui.showToast(`Snippets for "${article.title}" copied!`));
                    },
                    exportFlashcardsAsTxt() {
                        const cards = App.util.getSortedFlashcardsForDisplay();
                        if (cards.length === 0) return App.ui.showToast("No flashcards to export.");
                        const text = cards.map(c => c.fullText).join('\n\n---\n\n');
                        App.util.downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${App.util.getCategoryDisplayName(App.settings.get('flashcardCategory') || 'All')}-flashcards.txt`);
                    },
                    exportFlashcardsAsTsv() {
                        const cards = App.util.getSortedFlashcardsForDisplay();
                        if (cards.length === 0) return App.ui.showToast("No flashcards to export.");
                        const tsvHeader = "Front\tBack\tDeck\tTags\n";
                        const tsvRows = cards.map(c => {
                            const article = App.storage.getArticle(c.articleId);
                            const tags = article?.tags?.join(' ') || '';
                            let front, back;
                            if (c.type === 'collapsible') {
                                front = c.frontText;
                                back = c.backText;
                            } else { // Cloze card
                                front = c.fullText;
                                back = ''; // Cloze cards are single-field in Anki
                            }
                            return [front, back, App.util.getCategoryDisplayName(c.category), tags].map(App.util.escapeForTsv).join('\t');
                        });
                        const tsvContent = tsvHeader + tsvRows.join('\n');
                        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
                        App.util.downloadBlob(new Blob([bom, tsvContent], { type: 'text/tab-separated-values;charset=utf-8' }), `${App.util.getCategoryDisplayName(App.settings.get('flashcardCategory') || 'All')}-flashcards-anki.tsv`);
                    },


                    _getHtmlExportTemplate(title, bodyContent, themeName = 'light', brandName = '', brandLink = '', options = {}) {
                        const styles = getComputedStyle(document.documentElement);
                        const articleFontFamily = styles.getPropertyValue('--article-font-family');
                        const includeMathCss = !!options.includeMathCss;
                        const cssVars = [
                            '--bg-primary', '--bg-secondary', '--bg-tertiary', '--text-primary', '--text-secondary',
                            '--border-color', '--primary-color', '--hl-text', '--category-pill-text',
                            '--hl-1-bg', '--hl-1-border', '--hl-2-bg', '--hl-2-border', '--hl-3-bg', '--hl-3-border',
                            '--hl-4-bg', '--hl-4-border', '--hl-5-bg', '--hl-5-border', '--hl-6-bg', '--hl-6-border',
                            '--hl-7-bg', '--hl-7-border', '--text-red', '--text-green', '--text-blue',
                            '--success-color', '--danger-color', '--border-radius-lg', '--transition-fast', '--shadow',
                            '--textile-bg-1', '--textile-border-1', '--textile-text-1',
                            '--textile-bg-2', '--textile-border-2', '--textile-text-2',
                            '--textile-bg-3', '--textile-border-3', '--textile-text-3',
                            '--textile-bg-4', '--textile-border-4', '--textile-text-4',
                            '--textile-bg-5', '--textile-border-5', '--textile-text-5',
                            '--textile-bg-6', '--textile-border-6', '--textile-text-6',
                            '--textile-bg-7', '--textile-border-7', '--textile-text-7',
                            '--textile-bg-8', '--textile-border-8', '--textile-text-8',
                            '--textile-bg-9', '--textile-border-9', '--textile-text-9'
                        ].map(v => `${v}: ${styles.getPropertyValue(v)};`).join('\n');

                        // Inject article font family into root
                        const rootCss = `:root { ${cssVars} --article-font-family: ${articleFontFamily}; }`;

                        const watermarkButtonHTML = `<a id="notekash-watermark" href="https://notekash.com" target="_blank" rel="noopener noreferrer">notekash.com</a>`;
                        let brandWatermarkHTML = '';
                        if (brandName) {
                            if (brandLink) {
                                brandWatermarkHTML = `<a id="brand-watermark" href="${App.util.escapeHtml(brandLink)}" target="_blank" rel="noopener noreferrer">${App.util.escapeHtml(brandName)}</a>`;
                            } else {
                                brandWatermarkHTML = `<span id="brand-watermark">${App.util.escapeHtml(brandName)}</span>`;
                            }
                        }

                        // MASTER CSS: Generates the perfect "carved" look for the watermark AND pills based on the exported theme.
                        const getThemeAwareCSS = (theme) => {
                            const baseCSS = `
                            #notekash-watermark, #brand-watermark, .exported-pill {
                                display: inline-block;
                                padding: 8px 16px;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                font-size: 12px;
                                font-weight: 600;
                                text-decoration: none;
                                border-radius: 999px;
                                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                            }
                            #notekash-watermark {
                                position: fixed;
                                bottom: 20px;
                                right: 25px;
                                z-index: 9999;
                            }
                            #brand-watermark {
                                position: fixed;
                                bottom: 20px;
                                left: 25px;
                                z-index: 9999;
                            }
                            .exported-pills-container { margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
                            .exported-pill.category { font-size: 13px; padding: 9px 18px; }
                            .article-metadata { margin-bottom: 2rem; color: var(--text-secondary); font-size: 0.9rem; font-family: var(--article-font-family); display: flex; gap: 16px; align-items: center; opacity: 0.8; }
                            .exported-pill[href] { cursor: pointer; }
                        `;

                            switch (theme) {
                                case 'dark':
                                    return baseCSS + `
                                    #notekash-watermark, #brand-watermark, .exported-pill { /* Honed Slate */
                                        background-color: #21262D;
                                        color: #8B949E;
                                        border: 1px solid #30363D;
                                        box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05);
                                        text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.6);
                                    }
                                    #notekash-watermark:hover, #brand-watermark:hover, .exported-pill:hover {
                                        color: #c9d1d9;
                                        transform: translateY(-2px);
                                        box-shadow: 0 8px 25px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05);
                                    }
                                `;
                                case 'sepia':
                                    return baseCSS + `
                                    #notekash-watermark, #brand-watermark, .exported-pill { /* Aged Brass */
                                        background: linear-gradient(145deg, #d3c8b6, #fbf0d9);
                                        color: #7a6a57;
                                        border: 1px solid rgba(91, 70, 54, 0.3);
                                        box-shadow: 0 5px 20px rgba(91, 70, 54, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.7);
                                        text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8), 0 -1px 1px rgba(91, 70, 54, 0.2);
                                    }
                                    #notekash-watermark:hover, #brand-watermark:hover, .exported-pill:hover {
                                        color: #5b4636;
                                        transform: translateY(-2px);
                                        box-shadow: 0 10px 30px rgba(91, 70, 54, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.7);
                                    }
                                `;
                                default: // Light Theme
                                    return baseCSS + `
                                    #notekash-watermark, #brand-watermark, .exported-pill { /* Polished Marble */
                                        background: linear-gradient(145deg, #e9ecef, #ffffff);
                                        color: var(--text-secondary);
                                        border: 1px solid var(--border-color);
                                        box-shadow: 0 5px 20px rgba(0,0,0,0.07), inset 0 1px 1px rgba(255,255,255,0.8);
                                        text-shadow: 0 1px 1px rgba(255, 255, 255, 0.9), 0 -1px 1px rgba(0, 0, 0, 0.05);
                                    }
                                    #notekash-watermark:hover, #brand-watermark:hover, .exported-pill:hover {
                                        color: var(--text-primary);
                                        transform: translateY(-2px);
                                        box-shadow: 0 10px 30px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8);
                                    }
                                `;
                            }
                        };

                        const watermarkCSS = getThemeAwareCSS(themeName);

                        // --- NATIVE ELEMENT STYLES (Export) ---
                        const nativeElementsCSS = `
                            /* Accordion (Native <details>) */
                            details.nk-accordion { border: 1px solid var(--border-color); border-radius: 8px; margin: 1.5em 0; background-color: var(--bg-secondary); overflow: hidden; }
                            summary.nk-accordion-trigger { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 1rem 1.25rem; background-color: color-mix(in srgb, var(--border-color) 25%, var(--bg-tertiary)); border: none; font-family: inherit; font-size: inherit; color: var(--text-primary); text-align: left; cursor: pointer; list-style: none; user-select: none; }
                            summary.nk-accordion-trigger::-webkit-details-marker { display: none; } /* Hide default triangle */
                            summary.nk-accordion-trigger:after { content: '+'; font-size: 1.5rem; line-height: 1rem; color: var(--text-secondary); transition: transform 0.2s; }
                            details[open] summary.nk-accordion-trigger:after { transform: rotate(45deg); }
                            .nk-accordion-title { flex-grow: 1; font-weight: 600; display: inline-block; }
                            .nk-accordion-content { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); display: block; animation: slideDown 0.3s ease-out; }
                            @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                            
                            /* Tables */
                            table {
                                width: 100% !important;
                                border-collapse: separate;
                                border-spacing: 0;
                                margin: 1.5em 0;
                                border: 1px solid var(--border-color);
                                border-radius: 10px;
                                overflow: hidden;
                                table-layout: auto;
                            }
                            th, td {
                                border-bottom: 1px solid var(--border-color);
                                padding: 12px 16px;
                                text-align: left;
                                vertical-align: top;
                            }
                            td { border-left: 1px solid var(--border-color); }
                            td:first-child, th:first-child { border-left: none; }
                            th {
                                background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
                                font-weight: 600;
                            }
                            tr:last-child td { border-bottom: none; }

                            /* MCQ */
                            .nk-mcq-block { position: relative; background: var(--bg-secondary); border: 1px solid var(--border-color); border-left: 3px solid var(--primary-color); border-radius: 10px; padding: 1.25rem 1.5rem; margin: 1.5em 0; }
                            .nk-mcq-question { font-weight: 500; font-size: 1.05em; margin-bottom: 1rem; color: var(--text-primary); line-height: 1.55; letter-spacing: -0.005em; }
                            .nk-mcq-options { display: flex; flex-direction: column; gap: 0.6rem; }
                            .nk-mcq-option { display: flex; align-items: center; gap: 0.75rem; padding: 8px; border-radius: 6px; border: 1px solid transparent; }
                            .nk-mcq-option-radio { width: 18px; height: 18px; border: 2px solid var(--text-secondary); border-radius: 50%; display: grid; place-items: center; }
                            .nk-mcq-option[data-is-correct="true"] .nk-mcq-option-radio { border-color: var(--success-color); background-color: var(--success-color); }

                            /* Flashcards + Tags */
                            .cloze-flashcard {
                                display: inline-block;
                                padding: 0.08em 0.45em;
                                margin: 0 0.08em;
                                border-radius: 8px;
                                color: #7c2d12;
                                background: linear-gradient(135deg, #fff7ed, #ffedd5);
                                border: 1px solid #fed7aa;
                                box-shadow: inset 0 -1px 0 rgba(124, 45, 18, 0.12);
                                font-weight: 700;
                            }
                            .rendered-tag {
                                display: inline-block;
                                padding: 0.08em 0.52em;
                                margin: 0 0.08em;
                                border-radius: 999px;
                                color: #3730a3;
                                background: linear-gradient(135deg, #eef2ff, #e0e7ff);
                                border: 1px solid #c7d2fe;
                                text-decoration: none;
                                font-weight: 700;
                                box-shadow: inset 0 -1px 0 rgba(55, 48, 163, 0.12);
                            }
                            .rendered-tag::before { content: "#"; opacity: 0.65; margin-right: 0.08em; }
                            .rendered-tag:target {
                                outline: 3px solid color-mix(in srgb, var(--primary-color) 55%, transparent);
                                outline-offset: 3px;
                            }

                            /* Textile (single) + Textile Deck */
                            .nk-text-tile {
                                display: flex;
                                align-items: flex-start;
                                gap: 0.65rem;
                                vertical-align: middle;
                                border: 1px solid rgba(0, 0, 0, 0.08);
                                border-left: 3.5px solid var(--border-color);
                                border-radius: 9px;
                                padding: 0.75rem 1.15rem;
                                margin: 0.45rem 0;
                                box-sizing: border-box;
                                width: 100%;
                            }
                            .nk-text-tile-icon {
                                font-size: 1.05em;
                                opacity: 0.92;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                                line-height: 1;
                                margin-top: 0.18em;
                            }
                            .nk-text-tile-content {
                                color: inherit;
                                width: 100%;
                                white-space: pre-wrap;
                                word-break: break-word;
                                overflow-wrap: anywhere;
                                line-height: 1.5;
                            }
                            .nk-text-tile-content p,
                            .nk-text-tile-content div {
                                margin: 0.25em 0;
                                line-height: inherit;
                            }
                            .nk-text-tile-content > *:first-child {
                                margin-top: 0;
                            }
                            .nk-text-tile-content > *:last-child {
                                margin-bottom: 0;
                            }
                            .nk-textile-deck {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 10px;
                                padding: 0.75rem;
                                border-radius: 12px;
                                border: 1px solid var(--border-color);
                                background-color: color-mix(in srgb, var(--border-color) 10%, transparent);
                                margin: 0.65rem 0;
                                position: relative;
                            }
                            .nk-text-tile + .nk-text-tile { margin-top: 0.35rem; }
                            .nk-textile-deck + .nk-textile-deck { margin-top: 0.45rem; }
                            .nk-text-tile + .nk-textile-deck, .nk-textile-deck + .nk-text-tile { margin-top: 0.45rem; }
                            .nk-textile-deck .nk-text-tile {
                                margin: 0;
                                flex: 1 1 180px;
                                min-width: 140px;
                                width: auto;
                            }
                            .nk-textile-deck.layout-stack {
                                flex-direction: column;
                                align-items: stretch;
                                gap: 6px;
                            }
                            .deck-layout-toggle, .deck-add-tile-btn, .nk-text-tile-color-cycler { display: none !important; }

                            .nk-text-tile.color-1 { background: var(--textile-bg-1); border-color: color-mix(in srgb, var(--textile-border-1) 18%, transparent); border-left: 3.5px solid var(--textile-border-1); color: var(--textile-text-1); }
                            .nk-text-tile.color-2 { background: var(--textile-bg-2); border-color: color-mix(in srgb, var(--textile-border-2) 18%, transparent); border-left: 3.5px solid var(--textile-border-2); color: var(--textile-text-2); }
                            .nk-text-tile.color-3 { background: var(--textile-bg-3); border-color: color-mix(in srgb, var(--textile-border-3) 18%, transparent); border-left: 3.5px solid var(--textile-border-3); color: var(--textile-text-3); }
                            .nk-text-tile.color-4 { background: var(--textile-bg-4); border-color: color-mix(in srgb, var(--textile-border-4) 18%, transparent); border-left: 3.5px solid var(--textile-border-4); color: var(--textile-text-4); }
                            .nk-text-tile.color-5 { background: var(--textile-bg-5); border-color: color-mix(in srgb, var(--textile-border-5) 18%, transparent); border-left: 3.5px solid var(--textile-border-5); color: var(--textile-text-5); }
                            .nk-text-tile.color-6 { background: var(--textile-bg-6); border-color: color-mix(in srgb, var(--textile-border-6) 18%, transparent); border-left: 3.5px solid var(--textile-border-6); color: var(--textile-text-6); }
                            .nk-text-tile.color-7 { background: var(--textile-bg-7); border-color: color-mix(in srgb, var(--textile-border-7) 18%, transparent); border-left: 3.5px solid var(--textile-border-7); color: var(--textile-text-7); }
                            .nk-text-tile.color-8 { background: var(--textile-bg-8); border-color: color-mix(in srgb, var(--textile-border-8) 18%, transparent); border-left: 3.5px solid var(--textile-border-8); color: var(--textile-text-8); }
                            .nk-text-tile.color-9 { background: var(--textile-bg-9); border-color: color-mix(in srgb, var(--textile-border-9) 18%, transparent); border-left: 3.5px solid var(--textile-border-9); color: var(--textile-text-9); }
                            .nk-text-tile.color-default {
                                background: color-mix(in srgb, var(--primary-color) 3%, var(--bg-tertiary));
                                border-color: color-mix(in srgb, var(--primary-color) 25%, transparent);
                                border-left: 3.5px solid var(--primary-color);
                            }
                            
                            /* Image Interactions */
                            img { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: zoom-in; }
                            img:hover { transform: scale(1.02); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

                            /* Hide admin/interactive controls in static export */
                            .nk-accordion-chevron, .nk-accordion-controls, .nk-mcq-toolbar, .nk-mcq-delete-option, .nk-mcq-add-option, .nk-mcq-delete-block, .nk-mcq-copy-block { display: none !important; }
                            
                            /* Legacy Web Link Cards (forced inline minimal style) */
                            .nk-web-link-container { 
                                display: inline-flex !important; 
                                align-items: center !important; 
                                justify-content: center !important;
                                gap: 6px !important; 
                                padding: 4px 12px !important; 
                                margin: 2px 4px !important; 
                                background: var(--bg-secondary) !important; 
                                border: 1px solid var(--border-color) !important; 
                                border-radius: 20px !important; 
                                text-decoration: none !important; 
                                font-weight: 500 !important; 
                                font-size: 0.9em !important; 
                                box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; 
                                width: auto !important; 
                                max-width: 100% !important; 
                                height: auto !important;
                                flex-direction: row !important;
                            }
                            .nk-web-link-container img, .nk-web-link-container > div.favicon-placeholder, .nk-web-link-container p { display: none !important; }
                            .nk-web-link-container > div, .nk-web-link-container h3 { display: inline-flex !important; margin: 0 !important; padding: 0 !important; font-size: inherit !important; font-weight: inherit !important; color: inherit !important; background: transparent !important; }
                            .nk-web-link-container::before { content: "🌐"; font-size: 1.1em; line-height: 1; margin-right: 4px; }
                        `;

                        return `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>${title}</title>
                                    <link rel="preconnect" href="https://fonts.googleapis.com">
                                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Montserrat:wght@400;700&family=Satisfy&family=Pacifico&family=Lobster&family=Patrick+Hand&family=Shadows+Into+Light&family=Great+Vibes&family=Dancing+Script&family=Caveat:wght@400;700&display=swap" rel="stylesheet">
                                    ${includeMathCss ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">' : ''}
                                    
                                </head>
                                <body>
                                    ${bodyContent}
                                    ${watermarkButtonHTML}
                                    ${brandWatermarkHTML}
                                </body>
                                </html>`;
                    },
                    exportArticleAsHtml(brandName = '', brandLink = '') {
                        const article = App.storage.getArticle(App.state.activeArticleId); if (!article) return;
                        if (article.preventReExport) {
                            return App.ui.showToast('Creator has disabled Re-Sharing of notes.', { type: 'warning' });
                        }
                        const categoryObj = App.settings.get('userCategories').find(c => c.name === article.category) || { name: article.category, colorIndex: 0 };
                        const categoryPill = `<div class="exported-pill category" style="background-color: ${App.util.getCategoryColor(categoryObj.colorIndex)}; color: var(--category-pill-text);">${App.util.getCategoryDisplayName(categoryObj.name)}</div>`;

                        // Metadata Calculation
                        const tempDiv = document.createElement('div'); tempDiv.innerHTML = article.content;
                        const wordCount = (tempDiv.textContent || "").trim().split(/\s+/).length;
                        const dateStr = new Date(article.updatedAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                        const metadataHTML = `<div class="article-metadata"><span>${wordCount} words</span> &bull; <span>${dateStr}</span></div>`;

                        let pillsHTML = '';

                        // Native Accordion Replacement: Convert div structure to details/summary
                        let processedContent = App.util.renderClozeForDisplay(App.util.parseShortcuts(article.content));

                        // Transform structural div accordions into semantic details/summary using DOMParser
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(processedContent, 'text/html');
                        const firstTagTargets = {};
                        doc.querySelectorAll('.rendered-tag[data-tag]').forEach((tag, index) => {
                            const tagSlug = tag.dataset.tag || App.contentTools.slugify(tag.textContent || `tag-${index + 1}`);
                            const id = tag.id || `tag-${tagSlug}-${index + 1}`;
                            const anchor = doc.createElement('a');
                            anchor.className = tag.className;
                            anchor.dataset.tag = tagSlug;
                            anchor.id = id;
                            anchor.href = `#${id}`;
                            anchor.textContent = tag.textContent;
                            tag.replaceWith(anchor);
                            firstTagTargets[tagSlug] ||= id;
                        });
                        doc.querySelectorAll('.nk-accordion').forEach(acc => {
                            const details = doc.createElement('details');
                            details.className = acc.className;

                            const trigger = acc.querySelector('.nk-accordion-trigger');
                            const titleSpan = acc.querySelector('.nk-accordion-title');
                            const content = acc.querySelector('.nk-accordion-content');

                            if (trigger && content) {
                                const summary = doc.createElement('summary');
                                summary.className = 'nk-accordion-trigger';
                                summary.innerHTML = `<span class="nk-accordion-title">${titleSpan ? titleSpan.innerHTML : 'Details'}</span>`;

                                details.appendChild(summary);
                                details.appendChild(content.cloneNode(true));

                                acc.replaceWith(details);
                            }
                        });

                        // Ensure web links in html export show full URL instead of potentially truncated/styled versions
                        doc.querySelectorAll('.nk-web-link, .nk-web-link-card, .nk-web-link-container').forEach(link => {
                            const url = link.getAttribute('href') || link.querySelector('a')?.getAttribute('href');
                            if (url) {
                                link.style.maxWidth = '100%';
                                link.style.wordBreak = 'break-all';

                                // New web link structure uses span, legacy card uses h3
                                const txtSpan = link.querySelector('span:nth-of-type(2)') || link.querySelectorAll('span')[1];
                                const h3 = link.querySelector('h3');

                                if (txtSpan) {
                                    txtSpan.textContent = url;
                                    txtSpan.style.maxWidth = 'none';
                                } else if (h3) {
                                    h3.textContent = url;
                                    h3.style.maxWidth = 'none';
                                }
                            }
                        });
                        processedContent = doc.body.innerHTML;
                        const tagsPills = (article.tags || []).map(tag => {
                            const label = App.state.tags[tag]?.displayName || tag;
                            const target = firstTagTargets[tag] || firstTagTargets[App.contentTools.slugify(label)];
                            return target
                                ? `<a class="exported-pill" href="#${App.util.escapeHtml(target)}">${App.util.escapeHtml(label)}</a>`
                                : `<div class="exported-pill">${App.util.escapeHtml(label)}</div>`;
                        }).join('');
                        pillsHTML = `<div class="exported-pills-container">${categoryPill}${tagsPills}</div>`;

                        const hasMath = App.util.hasMathSyntax(processedContent);
                        if (hasMath) {
                            const mathDiv = document.createElement('div');
                            mathDiv.innerHTML = processedContent;
                            App.util.renderMathInElement(mathDiv);
                            processedContent = mathDiv.innerHTML;
                        }

                        const bodyContent = `${pillsHTML}<h1>${article.title}</h1>${metadataHTML}<hr>${processedContent}`;
                        const fullHtml = this._getHtmlExportTemplate(article.title, bodyContent, App.settings.get('theme'), brandName, brandLink, { includeMathCss: hasMath });
                        App.util.downloadBlob(new Blob([fullHtml], { type: 'text/html' }), `${App.util.slugify(article.title)}.html`);
                    },

                    async exportAsNoteKashFile(options = {}) {
                        const { isReadOnly = false, preventReExport = false } = options;
                        const articleId = App.state.activeArticleId;
                        if (!articleId || articleId === 'temp_new_article') {
                            App.ui.showToast('Please save the note once before exporting.', { type: 'error' });
                            return;
                        }

                        const article = App.storage.getArticle(articleId);
                        if (!article) {
                            App.ui.showToast('Article data is missing, cannot export.', { type: 'error' });
                            return;
                        }

                        if (article.preventReExport) {
                            App.ui.showToast('Creator has disabled Re-Sharing of notes.', { type: 'warning' });
                            return;
                        }

                        const payload = {
                            format: "notekash",
                            version: "2.0",
                            generator: "NoteKash Web",
                            exportDate: new Date().toISOString(),
                            payloadType: "single_article",
                            isReadOnly: isReadOnly || article.isReadOnly || false,
                            preventReExport: preventReExport || article.preventReExport || false,
                            data: article
                        };

                        const filename = `${App.util.slugify(article.title)}.notekash`;
                        const fileContent = JSON.stringify(payload, null, 2);
                        const blob = new Blob([fileContent], { type: 'application/json' });
                        const file = new File([blob], filename, { type: 'application/json' });

                        const shareData = {
                            title: `NoteKash Note: ${article.title}`,
                            text: `Here is the NoteKash note "${article.title}"`,
                            files: [file],
                        };

                        let shareSucceeded = false;

                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            try {
                                await navigator.share(shareData);
                                shareSucceeded = true; // Mark as successful
                                App.ui.showToast('Note shared!', { type: 'success' });
                            } catch (err) {
                                if (err.name === 'AbortError') {
                                    shareSucceeded = true; // Mark as "handled"
                                    App.ui.showToast('Share cancelled.', { type: 'info' });
                                } else {
                                    console.warn('Web Share API failed, falling back to download:', err);
                                    shareSucceeded = false;
                                }
                            }
                        }
                        if (!shareSucceeded) {
                            try {
                                App.util.downloadBlob(blob, filename);
                                App.ui.showToast('NoteKash file downloaded!', { type: 'success' });
                            } catch (downloadErr) {
                                console.error('Fallback download also failed:', downloadErr);
                                App.ui.showToast('Could not share or download the file.', { type: 'error' });
                            }
                        }
                    },


                    exportCategoryAsHtml(category) {
                        const sortedArticles = this.getSortedArticlesForCategory(category);
                        const articlesWithHighlights = sortedArticles
                            .filter(article => !(article.isReadOnly || article.preventReExport))
                            .map(article => ({ ...article, snippets: App.util.extractSnippets({ content: article.content, id: article.id }, 'highlight', true) }))
                            .filter(article => article.snippets.length > 0);

                        if (articlesWithHighlights.length === 0) { App.ui.showToast("No highlights in this category to export."); return; }

                        let bodyContent = `<h1>Category: ${App.util.getCategoryDisplayName(category)}</h1>` + articlesWithHighlights.map(article =>
                            `<h2><b>${article.title}</b></h2>${article.snippets.map(s => `<p>${s.html}</p>`).join('')}`
                        ).join('<hr>');

                        const hasMath = App.util.hasMathSyntax(bodyContent);
                        if (hasMath) {
                            const mathDiv = document.createElement('div');
                            mathDiv.innerHTML = bodyContent;
                            App.util.renderMathInElement(mathDiv);
                            bodyContent = mathDiv.innerHTML;
                        }

                        const fullHtml = this._getHtmlExportTemplate(`${App.util.getCategoryDisplayName(category)} Highlights`, bodyContent, App.settings.get('theme'), '', '', { includeMathCss: hasMath });
                        App.util.downloadBlob(new Blob([fullHtml], { type: 'text/html' }), `${App.util.slugify(category)}-highlights.html`);
                    },

                    /* Export Article as PDF - Premium PDF with pdfmake (selectable text, images, elegant watermark) */
                    async exportArticleAsPdf(brandName = '', brandLink = '') {
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        if (!article) {
                            App.ui.showToast('No article to export.', { type: 'error' });
                            return;
                        }
                        if (article.preventReExport) {
                            App.ui.showToast('Creator has disabled Re-Sharing of notes.', { type: 'warning' });
                            return;
                        }

                        // Check pdfmake availability
                        if (typeof pdfMake === 'undefined' && App.loadLibrary) {
                            const loadToast = App.ui.showToast('Loading PDF library...', { type: 'info', duration: 0 });
                            try {
                                await App.loadLibrary('pdfmake');
                                await App.loadLibrary('pdfmakeFonts');
                            } catch (e) {
                                console.error('Failed to load pdfmake:', e);
                                App.ui.showToast('Failed to load PDF library. Please check your internet connection.', { type: 'error' });
                                return;
                            } finally {
                                App.ui.hideToast(loadToast);
                            }
                        }
                        if (typeof pdfMake === 'undefined') {
                            App.ui.showToast('PDF library is not available.', { type: 'error' });
                            return;
                        }

                        const isPremiumUser = App.license.isPremium();
                        const toastId = App.ui.showToast('✨ Preparing PDF export...', { type: 'info', duration: 0 });

                        try {
                            // 🎨 DESIGN SYSTEM - Print-optimized (always white background)
                            const colors = {
                                bg: '#FFFFFF',
                                paper: '#FFFFFF',
                                text: '#1A1A1A',
                                textMuted: '#6B7280',
                                accent: '#4F46E5',           // Indigo - premium brand color
                                accentLight: '#EEF2FF',
                                categoryBg: '4F46E5',       // Indigo for category badge
                                highlight: {
                                    1: '#FEF9C3',  // Yellow - softer
                                    2: '#DCFCE7',  // Green
                                    3: '#DBEAFE',  // Blue
                                    4: '#FEE2E2',  // Red/Pink
                                    5: '#F3E8FF',  // Purple
                                    6: '#E0F2FE',  // Cyan
                                    7: '#FCE7F3'   // Pink
                                }
                            };

                            // Get category styling
                            const categoryObj = App.settings.get('userCategories').find(c => c.name === article.category) || { name: article.category, colorIndex: 0 };
                            const categoryColor = App.util.getCategoryColor(categoryObj.colorIndex);
                            const categoryName = App.util.getCategoryDisplayName(article.category);

                            // Calculate word count
                            const tempWordCountDiv = document.createElement('div');
                            tempWordCountDiv.innerHTML = article.content;
                            const wordCount = (tempWordCountDiv.textContent || tempWordCountDiv.innerText || '').trim().split(/\s+/).filter(w => w.length > 0).length;


                            //  IMAGE PROCESSING - Only embedded base64 images (no URL fetching)
                            App.ui.updateToast(toastId, '🖼️ Processing images...');

                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = App.util.sanitizeHTML(App.util.parseShortcuts(article.content));
                            const allImages = tempDiv.querySelectorAll('img');
                            const imageCache = new Map();

                            let embeddedCount = 0;
                            let skippedCount = 0;

                            const standardizeImage = async (src) => {
                                return new Promise((resolve) => {
                                    if (!src) return resolve(null);
                                    const img = new Image();
                                    img.crossOrigin = 'anonymous';
                                    img.onload = () => {
                                        const naturalW = img.naturalWidth || img.width || 0;
                                        const naturalH = img.naturalHeight || img.height || 0;

                                        // If already a safe format for pdfmake, keep as-is (zero recompress),
                                        // but still return dimensions so we can smart-fit portrait images.
                                        if (src.startsWith('data:image/jpeg') || src.startsWith('data:image/png')) {
                                            return resolve({ dataUrl: src, width: naturalW, height: naturalH });
                                        }

                                        try {
                                            const canvas = document.createElement('canvas');
                                            canvas.width = Math.max(1, naturalW);
                                            canvas.height = Math.max(1, naturalH);
                                            const ctx = canvas.getContext('2d');
                                            ctx.fillStyle = '#FFFFFF';
                                            ctx.fillRect(0, 0, canvas.width, canvas.height); // white bg for transparent SVG/WebP
                                            ctx.drawImage(img, 0, 0);
                                            resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), width: naturalW, height: naturalH });
                                        } catch (e) {
                                            resolve({ dataUrl: src.startsWith('data:') ? src : null, width: naturalW, height: naturalH });
                                        }
                                    };
                                    img.onerror = () => resolve({ dataUrl: src.startsWith('data:') ? src : null, width: 0, height: 0 }); // fallback
                                    img.src = src;
                                });
                            };

                            for (const img of Array.from(allImages)) {
                                const src = img.getAttribute('src');
                                if (src) {
                                    const safe = await standardizeImage(src);
                                    if (safe?.dataUrl && safe.dataUrl.startsWith('data:image/')) {
                                        imageCache.set(src, safe);
                                        embeddedCount++;
                                    } else {
                                        skippedCount++;
                                    }
                                }
                            }

                            if (embeddedCount > 0 || skippedCount > 0) {
                            }

                            App.ui.updateToast(toastId, '📄 Building PDF...');

                            // CONTENT PARSER - Convert HTML to pdfmake format
                            const parseHtmlToPdfContent = (html) => {
                                const div = document.createElement('div');
                                div.innerHTML = App.util.sanitizeHTML(App.util.renderClozeForDisplay(App.util.parseShortcuts(html)));
                                const hasMath = App.util.hasMathSyntax(html);
                                const hasPdfMathSyntax = hasMath
                                    || /\\(?:sum|Delta|delta|frac|sqrt|times|cdot|leq?|geq?|neq|approx)\b/.test(html)
                                    || /[A-Z](?:[_^](?:\{[^{}]+\}|[A-Za-z0-9]))\s*[=+\-*/]/.test(html);

                                const preparePdfMathText = (container) => {
                                    if (!hasPdfMathSyntax) return;
                                    const skipTags = new Set(['SCRIPT', 'NOSCRIPT', 'STYLE', 'TEXTAREA', 'PRE', 'CODE', 'OPTION']);
                                    const bareLatexRe = /\\(?:frac\s*\{[^{}]*\}\s*\{[^{}]*\}|sqrt\s*\{[^{}]*\}|sum|Delta|delta|times|cdot|leq?|geq?|neq|approx)(?:\s*[A-Za-z0-9_{}^+\-=().,\\]+)*|[A-Z](?:[_^](?:\{[^{}]+\}|[A-Za-z0-9]))(?:\s*[=+\-*/]\s*-?[A-Z]?(?:[_^](?:\{[^{}]+\}|[A-Za-z0-9]))?)+/g;
                                    const appendMathSpan = (fragment, token, display = false) => {
                                        const math = display ? App.util.parseMathToken(token) : { latex: token, display: false };
                                        const span = document.createElement('span');
                                        span.className = math.display ? 'nk-pdf-math-block' : 'nk-pdf-math-inline';
                                        span.dataset.latex = math.latex;
                                        span.textContent = math.latex;
                                        fragment.appendChild(span);
                                    };
                                    const appendBareLatex = (fragment, value) => {
                                        let last = 0;
                                        bareLatexRe.lastIndex = 0;
                                        let match;
                                        while ((match = bareLatexRe.exec(value)) !== null) {
                                            if (match.index > last) fragment.appendChild(document.createTextNode(value.slice(last, match.index)));
                                            appendMathSpan(fragment, match[0], false);
                                            last = match.index + match[0].length;
                                        }
                                        if (last < value.length) fragment.appendChild(document.createTextNode(value.slice(last)));
                                    };
                                    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
                                        acceptNode: node => {
                                            const parent = node.parentElement;
                                            if (!parent || skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
                                            if (parent.closest('.katex, .nk-code-block, .rendered-tag, .tag-suggestion, .nk-mcq-toolbar, .resize-handle, .pdf-attachment-name')) {
                                                return NodeFilter.FILTER_REJECT;
                                            }
                                            bareLatexRe.lastIndex = 0;
                                            return (App.util.hasMathSyntax(node.nodeValue) || bareLatexRe.test(node.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                                        }
                                    });

                                    const nodes = [];
                                    while (walker.nextNode()) nodes.push(walker.currentNode);

                                    for (const node of nodes) {
                                        const { text, tokens } = App.util.protectMathSegments(node.nodeValue);
                                        bareLatexRe.lastIndex = 0;
                                        if (!tokens.length && !bareLatexRe.test(text)) continue;

                                        const fragment = document.createDocumentFragment();
                                        let cursor = 0;
                                        text.replace(/\uE100MATH(\d+)\uE100/g, (match, index, offset) => {
                                            if (offset > cursor) appendBareLatex(fragment, text.slice(cursor, offset));
                                            const token = tokens[Number.parseInt(index, 10)] || match;
                                            appendMathSpan(fragment, token, true);
                                            cursor = offset + match.length;
                                            return match;
                                        });
                                        if (cursor < text.length) appendBareLatex(fragment, text.slice(cursor));
                                        node.replaceWith(fragment);
                                    }
                                };

                                preparePdfMathText(div);

                                // ─── COLOR MAPS ─────────────────────────────────────────────────────
                                const highlightUnderlineMap = {
                                    'highlight-1': '#EAB308', 'highlight-2': '#16A34A',
                                    'highlight-3': '#2563EB', 'highlight-4': '#DC2626',
                                    'highlight-5': '#9333EA', 'highlight-6': '#0891B2',
                                    'highlight-7': '#DB2777'
                                };
                                const textColorMap = {
                                    'text-red': '#DC2626', 'text-green': '#16A34A',
                                    'text-blue': '#2563EB', 'text-magenta': '#C026D3',
                                    'text-orange': '#EA580C', 'text-teal': '#0D9488',
                                    'text-slate': '#475569', 'text-purple': '#C026D3',
                                    'text-cyan': '#0891B2', 'text-pink': '#DB2777'
                                };

                                // ─── EMOJI RENDERER ─────────────────────────────────────────────────────
                                const emojiCanvas = document.createElement('canvas');
                                const emojiCtx = emojiCanvas.getContext('2d');
                                const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
                                const renderEmoji = (emoji) => {
                                    emojiCanvas.width = emojiCanvas.height = 64;
                                    emojiCtx.clearRect(0, 0, 64, 64);
                                    emojiCtx.font = '54px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
                                    emojiCtx.textAlign = 'center'; emojiCtx.textBaseline = 'middle';
                                    emojiCtx.fillText(emoji, 32, 36);
                                    return emojiCanvas.toDataURL('image/png');
                                };
                                // Split text into plain/emoji segments
                                const splitEmoji = (s) => s.split(/([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}])/gu).filter(Boolean);

                                // ─── TEXT NODE → inline run(s) ──────────────────────────────────────────
                                const textRuns = (text, styles, isLink = false) => {
                                    if (!text) return null;
                                    // if it's a link, we don't want to parse emojis inside the URL
                                    if (isLink || !emojiRe.test(text)) return { text, ...styles };
                                    const parts = splitEmoji(text);
                                    if (parts.length === 1) return { text: parts[0], ...styles };
                                    return parts.map(p => emojiRe.test(p)
                                        ? { image: renderEmoji(p), width: 13, height: 13, margin: [0, 1, 0, -2] }
                                        : { text: p, ...styles });
                                };

                                const latexToReadableText = (latex = '') => {
                                    let value = String(latex).trim();
                                    const fracRe = /\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g;
                                    while (fracRe.test(value)) {
                                        value = value.replace(fracRe, '($1)/($2)');
                                        fracRe.lastIndex = 0;
                                    }
                                    return value
                                        .replace(/\\left|\\right/g, '')
                                        .replace(/\\sum\b/g, 'Σ')
                                        .replace(/\\Delta\b/g, 'Δ')
                                        .replace(/\\delta\b/g, 'δ')
                                        .replace(/\\times\b/g, '×')
                                        .replace(/\\cdot\b/g, '·')
                                        .replace(/\\div\b/g, '÷')
                                        .replace(/\\pm\b/g, '±')
                                        .replace(/\\leq?\b/g, '≤')
                                        .replace(/\\geq?\b/g, '≥')
                                        .replace(/\\neq\b/g, '≠')
                                        .replace(/\\approx\b/g, '≈')
                                        .replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)')
                                        .replace(/\\([a-zA-Z]+)\b/g, '$1')
                                        .replace(/[{}]/g, '')
                                        .replace(/\s+/g, ' ')
                                        .trim();
                                };

                                const formulaRuns = (latex, styles = {}) => {
                                    const value = latexToReadableText(latex);
                                    const baseSize = Math.min(styles.fontSize || 10.5, 10.5);
                                    const base = { fontSize: baseSize, color: '#334155', italics: true, characterSpacing: 0.35 };
                                    const runs = [{ text: ' ', ...base }];
                                    const re = /([_^])(?:\{([^{}]+)\}|([A-Za-z0-9+\-=()]))/g;
                                    let cursor = 0;
                                    let match;
                                    while ((match = re.exec(value)) !== null) {
                                        if (match.index > cursor) runs.push({ text: value.slice(cursor, match.index), ...base });
                                        const marker = match[1];
                                        const body = match[2] || match[3] || '';
                                        runs.push({
                                            text: body,
                                            ...base,
                                            fontSize: Math.max(6.5, baseSize - 2.5),
                                            sub: marker === '_',
                                            sup: marker === '^'
                                        });
                                        cursor = match.index + match[0].length;
                                    }
                                    if (cursor < value.length) runs.push({ text: value.slice(cursor), ...base });
                                    runs.push({ text: ' ', ...base });
                                    return runs;
                                };

                                const formulaRun = (latex, styles = {}) => formulaRuns(latex, styles);
                                const clozeRun = (text, styles = {}) => ({
                                    text: text || '',
                                    fontSize: styles.fontSize || 11,
                                    bold: true,
                                    color: '#9A3412',
                                    decoration: 'underline',
                                    decorationStyle: 'double',
                                    decorationColor: '#EA580C'
                                });
                                const tagRun = (text, styles = {}) => ({
                                    text: `#${text || ''}`,
                                    fontSize: Math.min(styles.fontSize || 10.5, 10.5),
                                    bold: true,
                                    color: '#3730A3',
                                    decoration: 'underline',
                                    decorationStyle: 'double',
                                    decorationColor: '#6366F1'
                                });

                                // ─── STYLE EXTRACTOR ────────────────────────────────────────────────────
                                // Returns pdfmake styles contributed by ONE element (not children).
                                const extractStyles = (node, inherited = {}) => {
                                    const s = { ...inherited };
                                    switch (node.tagName.toLowerCase()) {
                                        case 'b': case 'strong': s.bold = true; break;
                                        case 'i': case 'em': s.italics = true; break;
                                        case 'u': s.decoration = 'underline'; break;
                                        case 's': case 'strike': case 'del': s.decoration = 'lineThrough'; break;
                                        case 'sup': s.sup = true; s.fontSize = 8; break;
                                        case 'sub': s.sub = true; s.fontSize = 8; break;
                                    }
                                    (node.classList || []).forEach(cls => {
                                        if (highlightUnderlineMap[cls]) {
                                            s.decoration = 'underline';
                                            s.decorationStyle = 'double';
                                            s.decorationColor = highlightUnderlineMap[cls];
                                        }
                                        if (textColorMap[cls]) { s.color = textColorMap[cls]; s.bold = true; }
                                    });
                                    const inlineStyle = node.getAttribute('style') || '';
                                    const bgM = inlineStyle.match(/background(?:-color)?:\s*([^;]+)/i);
                                    const colM = inlineStyle.match(/(?:^|[^-])color:\s*([^;]+)/i);
                                    if (bgM?.[1]?.trim().match(/^(#|rgb)/)) s.background = bgM[1].trim();
                                    if (colM?.[1]?.trim().match(/^(#|rgb)/)) s.color = colM[1].trim();
                                    return s;
                                };

                                // ─── BLOCK TAG SET ───────────────────────────────────────────────────────
                                const BLOCK_TAGS = new Set([
                                    'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                                    'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
                                    'hr', 'figure', 'figcaption', 'section', 'article', 'header', 'footer',
                                    'aside', 'main', 'nav', 'form', 'fieldset', 'details', 'summary', 'img'
                                ]);
                                const isBlockNode = (n) => {
                                    if (n.nodeType !== Node.ELEMENT_NODE) return false;
                                    if (BLOCK_TAGS.has(n.tagName.toLowerCase())) return true;
                                    const cl = n.classList;
                                    return cl && (cl.contains('nk-text-tile') || cl.contains('nk-mcq-block') ||
                                        cl.contains('nk-accordion') || cl.contains('image-container') ||
                                        cl.contains('video-container') || cl.contains('se-video-container') ||
                                        cl.contains('nk-map-embed') || cl.contains('nk-video-embed') ||
                                        cl.contains('whiteboard-block') || cl.contains('nk-web-link-container') ||
                                        cl.contains('nk-pdf-math-block'));
                                };

                                // ─── INLINE COLLECTOR ────────────────────────────────────────────────────
                                // Recursively flattens ALL inline content under a node into a run array.
                                const collectInlineRuns = (node, styles = {}, opts = {}) => {
                                    const runs = [];
                                    const options = { includeBlockDescendants: false, ...opts };
                                    const walk = (n, s) => {
                                        if (n.nodeType === Node.TEXT_NODE) {
                                            const t = n.textContent;
                                            if (!t.replace(/[\n\r]+/g, '').length) return;
                                            // Check if we are currently styled as a link, to disable emojis in URLs
                                            const isLink = !!s?.link;
                                            const r = textRuns(t, s, isLink);
                                            if (!r) return;
                                            Array.isArray(r) ? runs.push(...r) : runs.push(r);
                                            return;
                                        }
                                        if (n.nodeType !== Node.ELEMENT_NODE) return;
                                        if (n.classList && (n.classList.contains('favicon-placeholder') || n.classList.contains('ql-ui'))) return;
                                        const tag = n.tagName.toLowerCase();
                                        if (n.classList?.contains('nk-pdf-math-inline')) {
                                            runs.push(...formulaRun(n.dataset.latex || n.textContent, s));
                                            return;
                                        }
                                        if (n.classList?.contains('cloze-flashcard')) {
                                            runs.push(clozeRun(n.textContent, s));
                                            return;
                                        }
                                        if (n.classList?.contains('rendered-tag')) {
                                            runs.push(tagRun(n.textContent, s));
                                            return;
                                        }
                                        if (tag === 'br') { runs.push({ text: '\n' }); return; }
                                        if (tag === 'a') {
                                            const href = n.getAttribute('href');
                                            const ls = href ? { ...s, link: href, color: '#2563EB', decoration: 'underline' } : s;
                                            n.childNodes.forEach(c => walk(c, ls));
                                            return;
                                        }
                                        // Default behavior: don't descend into block children (keeps inline parsing clean).
                                        // But some editors/sanitizers wrap list item text in block containers; allow opting in.
                                        if (isBlockNode(n)) {
                                            if (!options.includeBlockDescendants) return;
                                            const cs = extractStyles(n, s);
                                            n.childNodes.forEach(c => walk(c, cs));
                                            // Separate block runs so text doesn't glue together
                                            if (runs.length && runs[runs.length - 1]?.text !== '\n') runs.push({ text: '\n' });
                                            return;
                                        }
                                        const cs = extractStyles(n, s);
                                        n.childNodes.forEach(c => walk(c, cs));
                                    };
                                    node.childNodes.forEach(c => walk(c, styles));
                                    return runs;
                                };

                                const makePara = (runs, extra = {}) => {
                                    if (!runs.length) {
                                        return { text: '\n', margin: [0, 0, 0, 4] };
                                    }

                                    // if it's a single run, unwrap it to keep pdfmake clean
                                    const textContent = runs.length === 1 ? runs[0] : runs;

                                    return {
                                        text: textContent,
                                        margin: [0, 0, 0, 4],
                                        lineHeight: 1.6,
                                        ...extra
                                    };
                                };

                                // ─── BLOCK PROCESSOR ────────────────────────────────────────────────────
                                const PDF_HEADING_STYLES = {
                                    1: { fontSize: 20, margin: [0, 18, 0, 8], color: '#8c1717' },
                                    2: { fontSize: 17, margin: [0, 16, 0, 7], color: '#991B1B' },
                                    3: { fontSize: 14, margin: [0, 14, 0, 6], color: '#B91C1C' },
                                    4: { fontSize: 12, margin: [0, 10, 0, 5], color: '#DC2626' },
                                    5: { fontSize: 11, margin: [0, 8, 0, 4], color: '#EF4444' },
                                    6: { fontSize: 10, margin: [0, 6, 0, 4], color: '#6B7280' }
                                };
                                // Returns ONE pdfmake block object for a single DOM block element.
                                const processBlock = (node, context = {}) => {
                                    if (node.nodeType === Node.TEXT_NODE) {
                                        const t = node.textContent.replace(/[\n\r]+/g, '').trim();
                                        return t ? makePara([{ text: t }]) : null;
                                    }
                                    if (node.nodeType !== Node.ELEMENT_NODE) return null;

                                    const tag = node.tagName.toLowerCase();
                                    const cl = node.classList;

                                    // YouTube, Video and Map embeds
                                    if (tag === 'iframe' || cl?.contains('video-container') || cl?.contains('se-video-container') || cl?.contains('nk-map-embed') || cl?.contains('nk-video-embed')) {
                                        return null; // Completely ignore in PDF export
                                    }

                                    if (cl?.contains('nk-pdf-math-block')) {
                                        const latex = node.dataset.latex || node.textContent || '';
                                        return {
                                            table: {
                                                widths: ['*'],
                                                body: [[{
                                                    text: formulaRuns(latex, { fontSize: 11.5 }),
                                                    fontSize: 11,
                                                    color: '#334155',
                                                    characterSpacing: 0.3,
                                                    fillColor: '#F8FAFC',
                                                    margin: [10, 7, 10, 7]
                                                }]]
                                            },
                                            layout: {
                                                hLineWidth: () => 0.8,
                                                vLineWidth: () => 0.8,
                                                hLineColor: () => '#CBD5E1',
                                                vLineColor: () => '#CBD5E1',
                                                paddingLeft: () => 0,
                                                paddingRight: () => 0,
                                                paddingTop: () => 0,
                                                paddingBottom: () => 0
                                            },
                                            margin: [0, 6, 0, 8]
                                        };
                                    }

                                    // Web link cards
                                    if (tag === 'span' && cl?.contains('nk-web-link-container')) {
                                        let linkNode = node.querySelector('a.nk-web-link') || node.querySelector('a');
                                        let url = linkNode ? (linkNode.getAttribute('href') || '') : '';
                                        if (url) {
                                            if (url.startsWith('//')) url = 'https:' + url;
                                            else if (!url.startsWith('http')) url = 'https://' + url;
                                        }
                                        let linkText = linkNode ? (linkNode.textContent || url) : url;

                                        return {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                { text: 'Access Link below -->', fontSize: 11, color: '#6B7280', margin: [0, 0, 0, 4] },
                                                                { text: linkText, link: url, color: '#2563EB', decoration: 'underline', fontSize: 10, italics: true }
                                                            ],
                                                            fillColor: '#F9FAFB',
                                                            borderColor: ['#E5E7EB', '#E5E7EB', '#E5E7EB', '#E5E7EB'],
                                                            margin: [10, 8, 10, 8]
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1.5,
                                                vLineWidth: () => 1.5,
                                                hLineColor: () => '#E5E7EB',
                                                vLineColor: () => '#E5E7EB',
                                                paddingLeft: () => 0,
                                                paddingRight: () => 0,
                                                paddingTop: () => 0,
                                                paddingBottom: () => 0
                                            },
                                            margin: [0, 8, 0, 8]
                                        };
                                    }

                                    if (tag === 'a' && (cl?.contains('nk-web-link') || cl?.contains('nk-web-link-card'))) {
                                        let url = node.getAttribute('href') || '';
                                        if (url) {
                                            if (url.startsWith('//')) url = 'https:' + url;
                                            else if (!url.startsWith('http')) url = 'https://' + url;
                                        }
                                        let linkText = node.textContent || url;
                                        return {
                                            text: [
                                                { text: linkText, link: url, color: '#2563EB', decoration: 'underline', fontSize: 10, italics: true }
                                            ],
                                            margin: [0, 1, 0, 1]
                                        };
                                    }

                                    // Image containers and Whiteboards
                                    if (cl?.contains('image-container') || cl?.contains('whiteboard-block')) {
                                        const img = node.querySelector('img');
                                        if (!img) return null;

                                        const src = img.getAttribute('src');
                                        if (src && imageCache.has(src)) {
                                            const cached = imageCache.get(src);
                                            const dataUrl = cached?.dataUrl || cached;
                                            const iw = cached?.width || 0;
                                            const ih = cached?.height || 0;

                                            // If inside table cell, scale down strictly to avoid column blowout
                                            if (context?.inTableCell) {
                                                const maxCellW = context.maxCellWidth || 95;
                                                const maxCellH = 85;
                                                return {
                                                    image: dataUrl,
                                                    fit: [maxCellW, maxCellH],
                                                    margin: [0, 2, 0, 2],
                                                    alignment: 'center'
                                                };
                                            }

                                            let defaultWidth = cl.contains('whiteboard-block') ? 420 : 350;
                                            let w = parseInt(img.getAttribute('width') || img.style?.width) || defaultWidth;
                                            if (!w || w <= 0) w = defaultWidth;
                                            const maxW = Math.min(w * 1.5, 475);

                                            const ratio = (iw > 0 && ih > 0) ? (ih / iw) : 1;
                                            const maxH = cl.contains('whiteboard-block')
                                                ? 550
                                                : (ratio >= 1.6 ? 320 : (ratio >= 1.15 ? 360 : 520));

                                            return { image: dataUrl, fit: [maxW, maxH], margin: [0, 2, 0, 6], alignment: 'center' };
                                        }

                                        if (src) {
                                            return { text: '[ External image ]', fontSize: 8.5, italics: true, color: '#9CA3AF', alignment: 'center', margin: [0, 0, 0, 2] };
                                        }
                                        return null;
                                    }

                                    // Text tiles
                                    if (cl?.contains('nk-text-tile')) {
                                        let tck = 'default';
                                        cl.forEach(c => { if (c.startsWith('color-')) tck = c; });

                                        const TILE = {
                                            'color-1': { bg: '#F0F9FF', border: '#0EA5E9', text: '#0C4A6E' },
                                            'color-2': { bg: '#DCFCE7', border: '#16A34A', text: '#14532D' },
                                            'color-3': { bg: '#FFF7ED', border: '#EA580C', text: '#7C2D12' },
                                            'color-4': { bg: '#FEF2F2', border: '#DC2626', text: '#7F1D1D' },
                                            'color-5': { bg: '#FAF5FF', border: '#9333EA', text: '#581C87' },
                                            'color-6': { bg: '#FDF4FF', border: '#C026D3', text: '#701A75' },
                                            'color-7': { bg: '#F0FDFA', border: '#0D9488', text: '#134E4A' },
                                            'color-8': { bg: '#FFFBEB', border: '#D97706', text: '#78350F' },
                                            'color-9': { bg: '#EEF2FF', border: '#4F46E5', text: '#312E81' },
                                            'default': { bg: '#F3F4F6', border: '#6B7280', text: '#1F2937' }
                                        };
                                        const ts = TILE[tck] || TILE['default'];

                                        const inner = node.querySelector('.nk-text-tile-content') || node;
                                        const tileBlocks = processChildren(inner, { color: ts.text }, context);
                                        const hasHeavy = tileBlocks.some(b => b.stack || b.table || b.ul || b.ol);

                                        return {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            [hasHeavy ? 'stack' : 'text']: tileBlocks.length ? tileBlocks : [{ text: '' }],
                                                            fillColor: ts.bg,
                                                            borderColor: [ts.border, ts.border, ts.border, ts.border],
                                                            margin: [10, 6, 10, 6]
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1.5,
                                                vLineWidth: () => 1.5,
                                                hLineColor: () => ts.border,
                                                vLineColor: () => ts.border,
                                                paddingLeft: () => 0,
                                                paddingRight: () => 0,
                                                paddingTop: () => 0,
                                                paddingBottom: () => 0
                                            },
                                            margin: [0, 8, 0, 8]
                                        };
                                    }

                                    // MCQ & Accordion
                                    if (cl?.contains('nk-mcq-block') || cl?.contains('nk-accordion')) {
                                        const isMCQ = cl.contains('nk-mcq-block');
                                        const wr = blocks => blocks.length ? (blocks.length === 1 && !blocks[0].stack && !blocks[0].table ? blocks[0] : { stack: blocks }) : { text: '' };
                                        const pdfStack = [];

                                        if (isMCQ) {
                                            const qEl = node.querySelector('.nk-mcq-question');
                                            const eEl = node.querySelector('.nk-mcq-explanation');
                                            const qBlocks = qEl ? processChildren(qEl, { bold: true }, context) : [];
                                            const eBlocks = eEl && eEl.innerText.trim() ? processChildren(eEl, { color: '#36354b' }, context) : [];

                                            pdfStack.push({ text: 'Question:', bold: true, fontSize: 12.6, color: '#6366F1', margin: [0, 0, 0, 2] });
                                            pdfStack.push(wr(qBlocks));

                                            const options = Array.from(node.querySelectorAll('.nk-mcq-option'));
                                            if (options.length) {
                                                options.forEach((opt, idx) => {
                                                    const textEl = opt.querySelector('.nk-mcq-option-text');
                                                    if (textEl) {
                                                        const optChar = String.fromCharCode(65 + idx) + ')';
                                                        const tBlocks = processChildren(textEl, {}, context);
                                                        pdfStack.push({
                                                            columns: [
                                                                { text: optChar, width: 25, bold: true, color: '#4F46E5', alignment: 'right', margin: [0, 0, 8, 0] },
                                                                { stack: [wr(tBlocks)], width: '*' }
                                                            ],
                                                            margin: [0, 2, 0, 4]
                                                        });
                                                    }
                                                });
                                            }

                                            const correctOpt = node.querySelector('.nk-mcq-option[data-is-correct="true"] .nk-mcq-option-text');
                                            const aBlocks = correctOpt ? processChildren(correctOpt, { color: '#065F46' }, context) : [];
                                            if (aBlocks.length) {
                                                pdfStack.push({ text: 'Answer:', bold: true, fontSize: 12.6, color: '#16A34A', margin: [0, 6, 0, 2] });
                                                pdfStack.push(wr(aBlocks));
                                            }

                                            if (eBlocks.length) {
                                                pdfStack.push({ text: 'Explanation:', bold: true, fontSize: 12.6, color: '#F59E0B', margin: [0, 6, 0, 2] });
                                                pdfStack.push(wr(eBlocks));
                                            }
                                        } else {
                                            const qEl = node.querySelector('.nk-accordion-title');
                                            const aEl = node.querySelector('.nk-accordion-content');
                                            const qBlocks = qEl ? processChildren(qEl, { bold: true }, context) : [];
                                            const aBlocks = aEl ? processChildren(aEl, {}, context) : [];

                                            if (!qBlocks.length && !aBlocks.length) return null;

                                            pdfStack.push({ text: 'Question:', bold: true, fontSize: 12.6, color: '#6366F1', margin: [0, 0, 0, 2] });
                                            pdfStack.push(wr(qBlocks));
                                            pdfStack.push({ text: 'Answer:', bold: true, fontSize: 12.6, color: '#16A34A', margin: [0, 6, 0, 2] });
                                            pdfStack.push(wr(aBlocks));
                                        }

                                        return {
                                            table: {
                                                widths: [3, '*'],
                                                body: [
                                                    [
                                                        { text: '', fillColor: '#6366F1' },
                                                        { stack: pdfStack, margin: [10, 8, 8, 8] }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 0,
                                                vLineWidth: () => 0,
                                                paddingLeft: () => 0,
                                                paddingRight: () => 0,
                                                paddingTop: () => 0,
                                                paddingBottom: () => 0
                                            },
                                            margin: [0, 8, 0, 8]
                                        };
                                    }

                                    // Paragraphs & generic divs
                                    if (tag === 'p' || tag === 'div') {
                                        if (Array.from(node.childNodes).some(isBlockNode)) {
                                            return { stack: processChildren(node, {}, context), margin: [0, 0, 0, 4] };
                                        }
                                        return makePara(collectInlineRuns(node));
                                    }

                                    // Headings
                                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
                                        const lv = parseInt(tag[1]);

                                        const style = PDF_HEADING_STYLES[lv];

                                        const runs = collectInlineRuns(node);
                                        const textContent = runs.length ? (runs.length === 1 ? runs[0] : runs) : node.textContent;

                                        return {
                                            text: textContent,
                                            fontSize: style.fontSize,
                                            bold: true,
                                            color: style.color,
                                            margin: style.margin,
                                            lineHeight: 1.3
                                        };
                                    }

                                    // Blockquote
                                    if (tag === 'blockquote') {
                                        const quoteBlocks = processChildren(node, { italics: true, color: '#4B5563' }, context);
                                        return {
                                            table: {
                                                widths: [3, '*'],
                                                body: [
                                                    [
                                                        { text: '', fillColor: '#6366F1' },
                                                        { stack: quoteBlocks.length ? quoteBlocks : [{ text: '' }], margin: [12, 4, 4, 4] }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 0,
                                                vLineWidth: () => 0,
                                                paddingLeft: () => 0,
                                                paddingRight: () => 0,
                                                paddingTop: () => 0,
                                                paddingBottom: () => 0
                                            },
                                            margin: [0, 12, 0, 12]
                                        };
                                    }

                                    // Lists
                                    if (tag === 'ul' || tag === 'ol') {
                                        const items = [];
                                        node.querySelectorAll(':scope > li').forEach(li => {
                                            const itemBlocks = processChildren(li, { color: '#374151' }, context);
                                            items.push({
                                                stack: itemBlocks.length ? itemBlocks : [{ text: '' }],
                                                margin: [0, 2, 0, 2]
                                            });
                                        });

                                        return {
                                            [tag]: items,
                                            margin: [8, 4, 0, 12],
                                            color: '#6366F1'
                                        };
                                    }

                                    // HR
                                    if (tag === 'hr') {
                                        return {
                                            canvas: [
                                                { type: 'line', x1: 167, y1: 0, x2: 348, y2: 0, lineWidth: 0.75, lineColor: '#D1D5DB' }
                                            ],
                                            margin: [0, 16, 0, 16]
                                        };
                                    }

                                    // BR at block level
                                    if (tag === 'br') return { text: '\n' };

                                    // Standalone images or images in blocks/cells
                                    if (tag === 'img') {
                                        const src = node.getAttribute('src');
                                        if (src && imageCache.has(src)) {
                                            const cached = imageCache.get(src);
                                            const dataUrl = cached?.dataUrl || cached;
                                            const iw = cached?.width || 0;
                                            const ih = cached?.height || 0;

                                            // If inside table cell, scale down strictly to avoid column blowout
                                            if (context?.inTableCell) {
                                                const maxCellW = context.maxCellWidth || 95;
                                                const maxCellH = 85;
                                                return {
                                                    image: dataUrl,
                                                    fit: [maxCellW, maxCellH],
                                                    margin: [0, 2, 0, 2],
                                                    alignment: 'center'
                                                };
                                            }

                                            let w = parseInt(node.getAttribute('width') || node.style?.width) || 350;
                                            if (!w || w <= 0) w = 350;
                                            const maxW = Math.min(w * 1.5, 475);
                                            const ratio = (iw > 0 && ih > 0) ? (ih / iw) : 1;
                                            const maxH = (ratio >= 1.6 ? 320 : (ratio >= 1.15 ? 360 : 520));
                                            return {
                                                image: dataUrl,
                                                fit: [maxW, maxH],
                                                margin: [0, 2, 0, 6],
                                                alignment: 'center'
                                            };
                                        }

                                        if (src) {
                                            return { text: '[ External image ]', fontSize: 8.5, italics: true, color: '#9CA3AF', alignment: 'center', margin: [0, 0, 0, 2] };
                                        }
                                        return null;
                                    }

                                    // Tables
                                    if (tag === 'table') {
                                        const grid = [];
                                        const trs = Array.from(node.querySelectorAll('tr'));

                                        // Calculate maximum column count considering colspans
                                        let maxCols = 0;
                                        trs.forEach(tr => {
                                            let colsInRow = 0;
                                            Array.from(tr.cells).forEach(cell => {
                                                colsInRow += parseInt(cell.getAttribute('colspan') || '1');
                                            });
                                            if (colsInRow > maxCols) maxCols = colsInRow;
                                        });

                                        if (maxCols === 0) return null;

                                        // Available width on A4 page: 595.28 - (40 * 2) = 515.28 pt
                                        // Calculate safe column width constraint for cell images
                                        const approxColWidth = Math.max(45, Math.floor((515 - (maxCols * 12)) / maxCols));
                                        const cellContext = { inTableCell: true, maxCellWidth: Math.min(approxColWidth - 8, 110) };

                                        trs.forEach((tr, rowIndex) => {
                                            if (!grid[rowIndex]) grid[rowIndex] = [];
                                            let colIndex = 0;

                                            Array.from(tr.cells).forEach(cell => {
                                                // Skip slots already filled by rowSpan from previous rows
                                                while (grid[rowIndex][colIndex]) colIndex++;

                                                const rowSpan = parseInt(cell.getAttribute('rowspan') || '1');
                                                const colSpan = parseInt(cell.getAttribute('colspan') || '1');
                                                const isTH = cell.tagName === 'TH' || cell.closest('thead') !== null;

                                                // Use processChildren with cellContext to support images and blocks inside table cells safely
                                                const cellBlocks = processChildren(cell, isTH ? { bold: true, fontSize: 9, color: '#0F172A' } : { fontSize: 8.5, color: '#1E293B' }, cellContext);

                                                const cellDef = {
                                                    stack: cellBlocks.length ? cellBlocks : [{ text: '' }],
                                                    fillColor: isTH ? '#F1F5F9' : (rowIndex % 2 === 0 ? '#FFFFFF' : '#F8FAFC'),
                                                    rowSpan: rowSpan,
                                                    colSpan: colSpan,
                                                    borderColor: ['#CBD5E1', '#CBD5E1', '#CBD5E1', '#CBD5E1']
                                                };

                                                if (isTH) {
                                                    cellDef.color = '#0F172A';
                                                    cellDef.bold = true;
                                                }

                                                // Mark the grid slots
                                                for (let r = 0; r < rowSpan; r++) {
                                                    if (!grid[rowIndex + r]) grid[rowIndex + r] = [];
                                                    for (let c = 0; c < colSpan; c++) {
                                                        grid[rowIndex + r][colIndex + c] = (r === 0 && c === 0) ? cellDef : {};
                                                    }
                                                }
                                                colIndex += colSpan;
                                            });
                                        });

                                        if (!grid.length) return null;

                                        // Normalize grid (ensure all rows have same number of columns)
                                        grid.forEach(row => {
                                            while (row.length < maxCols) row.push({});
                                        });

                                        // Determine smart column widths
                                        const widths = Array(maxCols).fill('*');
                                        if (maxCols >= 3) {
                                            // Check if first column is a short code/index/year column (<= 10 chars across rows)
                                            let isShortCol0 = true;
                                            for (let i = 0; i < grid.length; i++) {
                                                const cell = grid[i]?.[0];
                                                if (cell?.stack) {
                                                    const textLen = cell.stack.reduce((acc, b) => acc + (typeof b.text === 'string' ? b.text.trim().length : 0), 0);
                                                    if (textLen > 10) {
                                                        isShortCol0 = false;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (isShortCol0 && grid.length > 1) {
                                                widths[0] = 'auto';
                                            }
                                        }

                                        return {
                                            table: {
                                                headerRows: node.querySelector('thead') ? 1 : 0,
                                                keepWithHeaderRows: node.querySelector('thead') ? 1 : 0,
                                                dontBreakRows: true,
                                                widths,
                                                body: grid
                                            },
                                            layout: {
                                                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1.2 : 0.5,
                                                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1.2 : 0.5,
                                                hLineColor: (i, node) => (i === 0 || i === node.table.body.length) ? '#4F46E5' : '#CBD5E1',
                                                vLineColor: (i, node) => (i === 0 || i === node.table.widths.length) ? '#4F46E5' : '#CBD5E1',
                                                paddingLeft: () => 6,
                                                paddingRight: () => 6,
                                                paddingTop: () => 5,
                                                paddingBottom: () => 5
                                            },
                                            margin: [0, 10, 0, 12],
                                            _isBlock: true
                                        };
                                    }

                                    // Fallback: treat as inline paragraph
                                    const runs = collectInlineRuns(node);
                                    return runs.length ? makePara(runs) : null;
                                };

                                // ─── PROCESS CHILDREN (entry point for any container) ────────────────────
                                const processChildren = (container, inheritedStyles = {}, context = {}) => {
                                    const blocks = [];
                                    let pendingRuns = [];

                                    const flushInline = () => {
                                        if (pendingRuns.length) {
                                            blocks.push(makePara(pendingRuns));
                                            pendingRuns = [];
                                        }
                                    };

                                    container.childNodes.forEach(child => {
                                        if (child.nodeType === Node.TEXT_NODE) {
                                            const t = child.textContent.replace(/[\n\r]/g, '');
                                            if (!t.trim() && !pendingRuns.length) return;
                                            const r = textRuns(t, inheritedStyles);
                                            if (!r) return;
                                            Array.isArray(r) ? pendingRuns.push(...r) : pendingRuns.push(r);
                                            return;
                                        }
                                        if (child.nodeType !== Node.ELEMENT_NODE) return;

                                        const tag = child.tagName.toLowerCase();

                                        if (isBlockNode(child)) {
                                            flushInline();
                                            const b = processBlock(child, context);
                                            if (b) blocks.push(b);
                                        } else if (tag === 'br') {
                                            flushInline(); // line break terminates inline run
                                        } else if (tag === 'img') {
                                            flushInline();
                                            const b = processBlock(child, context);
                                            if (b) blocks.push(b);
                                        } else if (tag === 'a' && (child.classList?.contains('nk-web-link') || child.classList?.contains('nk-web-link-card'))) {
                                            flushInline();
                                            const b = processBlock(child, context);
                                            if (b) blocks.push(b);
                                        } else {
                                            // Inline element: gather its runs into the pending accumulator
                                            const s = extractStyles(child, inheritedStyles);
                                            const runs = collectInlineRuns(child, s);
                                            pendingRuns.push(...runs);
                                        }
                                    });

                                    flushInline();
                                    return blocks;
                                };

                                // ─── ENTRY POINT ────────────────────────────────────────────────────────
                                return processChildren(div);
                            };

                            const createUpsellPage = (isAtEnd = false) => this._getUpsellPdfBlock(isAtEnd);

                            // Parse article content
                            const articleContent = parseHtmlToPdfContent(article.content);

                            // 🎨 BUILD PREMIUM PDF DOCUMENT

                            // Create stylish tag pills
                            const tagPills = (article.tags || []).map(tag => {
                                const tagDisplay = App.state.tags[tag]?.displayName || tag;
                                return {
                                    text: tagDisplay,
                                    fontSize: 9,
                                    color: '#3730A3',
                                    margin: [0, 0, 6, 0]
                                };
                            });



                            const docDefinition = {
                                pageSize: 'A4',
                                pageMargins: [40, 60, 40, 50],

                                // ═══ WATERMARK (Non-premium — pure pdfmake vector text, zero image overhead, not clickable/selectable) ═══
                                watermark: !isPremiumUser ? { text: 'notekash.com', color: '#6366F1', opacity: 0.055, bold: true, fontSize: 54, angle: -45 } : undefined,

                                // ═══ HEADER - Premium brand header ═══
                                header: function (currentPage, pageCount) {
                                    if (currentPage === 1) return null;
                                    return {
                                        columns: [
                                            {
                                                text: article.title.substring(0, 50) + (article.title.length > 50 ? '...' : ''),
                                                fontSize: 9,
                                                color: colors.textMuted,
                                                margin: [40, 25, 0, 0]
                                            },
                                            {
                                                text: categoryName,
                                                fontSize: 9,
                                                color: colors.accent,
                                                alignment: 'right',
                                                margin: [0, 25, 40, 0]
                                            }
                                        ]
                                    };
                                },

                                // ═══ FOOTER - Premium branding ═══
                                footer: function (currentPage, pageCount) {
                                    return {
                                        stack: [
                                            // Refined separator line
                                            {
                                                canvas: [{
                                                    type: 'line',
                                                    x1: 40, y1: 0,
                                                    x2: 555, y2: 0,
                                                    lineWidth: 0.4,
                                                    lineColor: '#E2E8F0'
                                                }]
                                            },
                                            // Elegant footer content
                                            {
                                                columns: [
                                                    // Left: Page indicator
                                                    {
                                                        text: [
                                                            { text: 'Page ', color: '#94A3B8', fontSize: 8 },
                                                            { text: `${currentPage}`, color: '#64748B', fontSize: 8, bold: true },
                                                            { text: ' of ', color: '#94A3B8', fontSize: 8 },
                                                            { text: `${pageCount}`, color: '#64748B', fontSize: 8, bold: true }
                                                        ],
                                                        margin: [40, 10, 0, 0],
                                                        width: '*'
                                                    },
                                                    // Center: User brand (Premium only)
                                                    {
                                                        text: brandName
                                                            ? (brandLink
                                                                ? [{ text: brandName, color: '#0891B2', bold: true, fontSize: 8.5, link: brandLink }]
                                                                : [{ text: brandName, color: '#0891B2', bold: true, fontSize: 8.5 }])
                                                            : '',
                                                        alignment: 'center',
                                                        margin: [0, 10, 0, 0],
                                                        width: '*'
                                                    },
                                                    // Right: notekash.com branding
                                                    {
                                                        text: [
                                                            { text: 'note', fontSize: 9, color: '#64748B', bold: true, link: 'https://notekash.com' },
                                                            { text: 'kash', fontSize: 9, color: '#6366F1', bold: true, link: 'https://notekash.com' },
                                                            { text: '.com', fontSize: 9, color: '#94A3B8', link: 'https://notekash.com' }
                                                        ],
                                                        alignment: 'right',
                                                        margin: [0, 9, 40, 0],
                                                        width: '*'
                                                    }
                                                ]
                                            }
                                        ],
                                        margin: [0, 8, 0, 0]
                                    };
                                },


                                // ═══ MAIN CONTENT ═══
                                content: [
                                    // Premium Header Section
                                    {
                                        stack: [
                                            // Category badge - elegant uppercase with tracking
                                            {
                                                text: categoryName.toUpperCase(),
                                                fontSize: 9,
                                                bold: true,
                                                color: categoryColor,
                                                characterSpacing: 1.5,
                                                margin: [0, 0, 0, 10]
                                            },

                                            // Title - Large, bold, impactful
                                            {
                                                text: article.title,
                                                fontSize: 30,
                                                bold: true,
                                                color: '#0F172A',
                                                lineHeight: 1.08,
                                                margin: [0, 0, 0, 12]
                                            },

                                            // Metadata row - refined with better hierarchy
                                            {
                                                text: [
                                                    {
                                                        text: new Date(article.createdAt).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }),
                                                        color: '#64748B',
                                                        fontSize: 10
                                                    },
                                                    {
                                                        text: '  ·  ',
                                                        color: '#CBD5E1',
                                                        fontSize: 10
                                                    },
                                                    {
                                                        text: `${wordCount.toLocaleString()} words`,
                                                        color: '#64748B',
                                                        fontSize: 10
                                                    },
                                                    article.readCount ? {
                                                        text: '  ·  ',
                                                        color: '#CBD5E1',
                                                        fontSize: 10
                                                    } : {},
                                                    article.readCount ? {
                                                        text: `${article.readCount} reads`,
                                                        color: '#64748B',
                                                        fontSize: 10
                                                    } : {}
                                                ],
                                                margin: [0, 0, 0, 8]
                                            }
                                        ],
                                        margin: [0, 0, 0, 2]
                                    },

                                    // Tags (if any) - Elegant hashtag styling
                                    tagPills.length > 0 ? {
                                        text: tagPills.map((tag, i) => ({
                                            text: (i > 0 ? '   ' : '') + ' #' + tag.text + ' ',
                                            fontSize: 9,
                                            color: tag.color,
                                            bold: true,
                                            decoration: 'underline',
                                            decorationStyle: 'double',
                                            decorationColor: '#6366F1'
                                        })),
                                        margin: [0, 0, 0, 14]
                                    } : {},

                                    // Premium double-line divider with category color accent
                                    {
                                        canvas: [
                                            {
                                                type: 'line',
                                                x1: 0, y1: 0,
                                                x2: 515, y2: 0,
                                                lineWidth: 2.5,
                                                lineColor: categoryColor
                                            },
                                            {
                                                type: 'line',
                                                x1: 0, y1: 5,
                                                x2: 515, y2: 5,
                                                lineWidth: 0.5,
                                                lineColor: '#E2E8F0'
                                            }
                                        ],
                                        margin: [0, 4, 0, 26]
                                    },

                                    // Main article content
                                    ...(!isPremiumUser ? [createUpsellPage(false)] : []),
                                    ...articleContent,
                                    ...(!isPremiumUser ? [createUpsellPage(true)] : [])
                                ],

                                // ═══ STYLES ═══
                                defaultStyle: {
                                    font: 'Roboto',
                                    fontSize: 11,
                                    color: '#1E293B',
                                    lineHeight: 1.7
                                },

                                styles: {
                                    header: {
                                        fontSize: 20,
                                        bold: true,
                                        color: '#0F172A',
                                        margin: [0, 16, 0, 8]
                                    },
                                    subheader: {
                                        fontSize: 15,
                                        bold: true,
                                        color: '#1E293B',
                                        margin: [0, 14, 0, 6]
                                    }
                                }
                            };

                            App.ui.updateToast(toastId, '🖨️ Generating PDF...');

                            // Generate and download PDF
                            const filename = `${App.util.slugify(article.title)}.pdf`;

                            if (App.offline.check('PDF Export') && typeof pdfMake !== 'undefined') pdfMake.createPdf(docDefinition).download(filename, () => {
                                App.ui.hideToast(toastId);
                                App.ui.showToast(`✅ PDF exported: ${filename}`, { type: 'success' });
                            });

                        } catch (error) {
                            console.error('PDF Export Error:', error);
                            App.ui.hideToast(toastId);
                            App.ui.showToast('Failed to export PDF. Please try again.', { type: 'error' });
                        }
                    }
                },
                image: {
                    async processAndInsert(file) {
                        if (file.size > App.config.image.maxUploadSize) {
                            App.ui.showToast(`Image exceeds max size of ${App.config.image.maxUploadSize / 1024 / 1024}MB`, { type: 'error' });
                            return;
                        }

                        try {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    const { maxWidth } = App.config.image;
                                    const jpegQuality = App.settings.get('jpegQuality');

                                    let { width, height } = img;
                                    if (width > maxWidth) {
                                        height *= maxWidth / width;
                                        width = maxWidth;
                                    }

                                    canvas.width = width;
                                    canvas.height = height;
                                    ctx.drawImage(img, 0, 0, width, height);

                                    // VALIDATION: Ensure canvas rendered correctly
                                    if (canvas.width === 0 || canvas.height === 0) {
                                        App.ui.showToast("Image could not be processed.", { type: 'error' });
                                        return;
                                    }

                                    // FORMAT HANDLING: Respect user's imageFormat setting
                                    const originalType = file.type || 'image/jpeg';
                                    const userPreferredFormat = App.settings.get('imageFormat') || 'jpeg';
                                    let outputFormat = 'image/jpeg';
                                    let outputQuality = jpegQuality;

                                    if (userPreferredFormat === 'png') {
                                        // PNG mode: Preserve original PNG/GIF format for reliability
                                        if (originalType === 'image/png') {
                                            outputFormat = 'image/png';
                                            outputQuality = undefined; // PNG doesn't use quality param
                                        } else if (originalType === 'image/gif') {
                                            outputFormat = 'image/png';
                                            outputQuality = undefined;
                                        }
                                    }

                                    const dataUrl = canvas.toDataURL(outputFormat, outputQuality);

                                    if (!dataUrl || dataUrl === 'data:,') {
                                        App.ui.showToast("Failed to encode image.", { type: 'error' });
                                        return;
                                    }

                                    const html = `<div class="image-container" contenteditable="false"><img src="${dataUrl}" alt="${file.name || 'image'}" data-original-width="${width}" data-original-height="${height}" style="width:${width}px; height:auto;"><div class="resize-handle resize-handle-se"></div></div>`;
                                    document.execCommand('insertHTML', false, `<p>${html}</p><p><br></p>`);

                                    const blob = App.util.dataURLtoBlob(dataUrl);
                                    if (blob) {
                                        const finalSizeKb = (blob.size / 1024).toFixed(0);
                                        const formatLabel = outputFormat === 'image/png' ? 'PNG' : 'JPEG';
                                        App.ui.showToast(`Image added (${formatLabel}) - ${finalSizeKb}kb`, { type: 'success' });
                                    }
                                };
                                img.onerror = () => {
                                    App.ui.showToast("Image is corrupted or unsupported.", { type: 'error' });
                                };
                                img.src = e.target.result;
                            };
                            reader.onerror = () => {
                                App.ui.showToast("Failed to read image data from clipboard.", { type: 'error' });
                            };
                            reader.readAsDataURL(file);

                        } catch (error) {
                            App.ui.showToast("An error occurred while processing the image.", { type: 'error' });
                            console.error('Image Processing Error:', error);
                        }
                    },

                    async runOCR() {
                        const imageContainer = App.state.selectedImageContainer;
                        if (!imageContainer) return;
                        const img = imageContainer.querySelector('img');
                        if (!img || !img.src) {
                            App.ui.showToast('Image source not found.', { type: 'error' });
                            return;
                        }

                        if (typeof Tesseract === 'undefined') {
                            App.ui.showToast('OCR library is not loaded. Please check your internet connection.', 'error');
                            return;
                        }

                        let ocrToastId = App.ui.showToast('Preprocessing image...', { type: 'info', duration: 0 });

                        try {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d', { willReadFrequently: true });

                            const imageToProcess = new Image();
                            imageToProcess.crossOrigin = "Anonymous";

                            await new Promise((resolve, reject) => {
                                imageToProcess.onload = resolve;
                                imageToProcess.onerror = reject;
                                imageToProcess.src = img.src;
                            });

                            canvas.width = imageToProcess.width;
                            canvas.height = imageToProcess.height;
                            ctx.drawImage(imageToProcess, 0, 0);

                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const data = imageData.data;

                            const threshold = App.settings.get('ocrThreshold') || 128; // A good starting point, can be made adjustable
                            for (let i = 0; i < data.length; i += 4) {
                                // Grayscale conversion using luminance formula
                                const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                                const color = luminance < threshold ? 0 : 255; // Apply threshold
                                data[i] = data[i + 1] = data[i + 2] = color;
                            }
                            ctx.putImageData(imageData, 0, 0);

                            App.ui.updateToast(ocrToastId, 'Initializing OCR engine...');

                            const worker = await Tesseract.createWorker('eng', 1, {
                                logger: m => {
                                    if (m.status === 'recognizing text') {
                                        const progress = (m.progress * 100).toFixed(0);
                                        App.ui.updateToast(ocrToastId, `Recognizing text... ${progress}%`);
                                    } else if (m.status !== 'initializing tesseract') {
                                        // Avoid showing less useful intermediate statuses
                                        App.ui.updateToast(ocrToastId, `Status: ${m.status}`);
                                    }
                                }
                            });

                            // RATIONALE: We now pass the preprocessed canvas to Tesseract, not the original image.
                            const { data: { text } } = await worker.recognize(canvas);
                            await worker.terminate();
                            App.ui.hideToast(ocrToastId);

                            if (!text.trim()) {
                                App.ui.showToast('No text could be extracted from this image.', 'warning');
                                return;
                            }

                            const ocrHtml = `
                            <blockquote>
                                <p>${App.util.escapeHtml(text)}</p>
                                <footer><small>— Text extracted from image</small></footer>
                            </blockquote>
                            <p><br></p>`;

                            const imageParentBlock = imageContainer.closest('p');
                            if (imageParentBlock) {
                                imageParentBlock.insertAdjacentHTML('afterend', ocrHtml);
                                App.state.isArticleDirty = true;
                                App.ui.showToast('Text extracted and added to note!', 'success');
                            } else {
                                document.execCommand('insertHTML', false, ocrHtml);
                                App.state.isArticleDirty = true;
                            }

                        } catch (error) {
                            if (ocrToastId) App.ui.hideToast(ocrToastId);
                            console.error('Tesseract.js OCR Error:', error);
                            App.ui.showToast('Could not perform OCR. Check console for details.', 'error');
                        }
                    },

                    copy(imageContainer) {
                        const article = App.storage.getArticle(App.state.activeArticleId);
                        if (article && (article.isReadOnly || article.preventReExport)) {
                            return App.ui.showToast('Creator has disabled copying from this note', { type: 'warning' });
                        }

                        if (!imageContainer) return;
                        const img = imageContainer.querySelector('img');
                        if (!img || !img.src) {
                            App.ui.showToast('Image source not found.', { type: 'error' });
                            return;
                        }
                        const blob = App.util.dataURLtoBlob(img.src);
                        if (blob) {
                            const objectUrl = URL.createObjectURL(blob);
                            window.open(objectUrl, '_blank');
                            App.ui.showToast('Image opened in a new tab for copying.', { type: 'info' });
                        } else {
                            App.ui.showToast('Could not process image data.', { type: 'error' });
                        }
                    },

                    delete(imageContainer) {
                        if (!imageContainer) return;
                        const p = imageContainer.closest('p');
                        if (p) p.remove();
                        else imageContainer.remove();
                        App.events.deselectImage();
                        App.ui.showToast('Image removed.');
                    }
                },

                migration: {
                    async browserToFolder(handle) {
                        try {
                            const browserArticles = await App.browserStore.getAllArticles();
                            if (browserArticles.length === 0) {
                                return 'no_browser_data';
                            }

                            let folderHasData = false;
                            try {
                                await handle.getFileHandle('_index.json', { create: false });
                                folderHasData = true;
                            } catch (e) {
                                if (e.name !== 'NotFoundError') throw e;
                            }

                            let userResponse;

                            if (folderHasData) {
                                userResponse = await new Promise(resolve => {
                                    App.ui.showCustomModal({
                                        title: 'Merge Data Sources?',
                                        message: `You have notes stored in your browser. This folder also contains notes. How would you like to proceed?<br><br><b>Merge is recommended.</b> It will intelligently combine both sources, keeping the newest version of each note.
                                            <div style="margin-top: 1rem; text-align: left;">
                                                <input type="checkbox" id="migration-backup-checkbox" checked>
                                                <label for="migration-backup-checkbox"> Create a backup of this folder before merging (Recommended)</label>
                                            </div>`,
                                        buttons: [
                                            { text: 'Use Folder Only', className: 'btn-secondary', onClick: () => { App.ui.closeModal(); resolve({ choice: 'use_folder_only' }); } },
                                            {
                                                text: 'Merge Notes', className: 'btn-primary', onClick: () => {
                                                    const shouldBackup = document.getElementById('migration-backup-checkbox').checked;
                                                    App.ui.closeModal();
                                                    resolve({ choice: 'merge', backup: shouldBackup });
                                                }
                                            },
                                            { text: 'Cancel', className: 'btn-secondary', onClick: () => { App.ui.closeModal(); resolve({ choice: 'cancelled' }); } }
                                        ]
                                    });
                                });
                            } else {
                                userResponse = await new Promise(resolve => {
                                    App.ui.showConfirmationModal({
                                        title: 'Copy Notes to New Folder?',
                                        message: `Would you like to copy your ${browserArticles.length} existing notes from the browser to this new, empty folder?`,
                                        confirmText: 'Yes, Copy Notes',
                                        onConfirm: () => resolve({ choice: 'merge', backup: false }),
                                        onCancel: () => resolve({ choice: 'use_folder_only' })
                                    });
                                });
                            }

                            if (userResponse.choice !== 'merge') {
                                return userResponse.choice;
                            }

                            App.ui.migrationScreen.show("Migrating Notes");
                            const { backup: shouldBackup } = userResponse;

                            if (shouldBackup) {
                                App.ui.migrationScreen.update(10, 'Backing up current folder...');
                                const backupDirName = `notekash_backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
                                const backupHandle = await handle.getDirectoryHandle(backupDirName, { create: true });
                                for await (const entry of handle.values()) {
                                    if (App.ui.migrationScreen.state.isCancelled) return 'cancelled';
                                    if (entry.kind === 'file') {
                                        const file = await entry.getFile();
                                        const newFileHandle = await backupHandle.getFileHandle(entry.name, { create: true });
                                        const writable = await newFileHandle.createWritable();
                                        await writable.write(file);
                                        await writable.close();
                                    }
                                }
                            }

                            // --- NEW: Read all articles in the destination folder to prepare for a smart merge.
                            App.ui.migrationScreen.update(30, 'Analyzing destination folder...');
                            const folderArticlesMap = new Map();
                            for await (const entry of handle.values()) {
                                if (App.ui.migrationScreen.state.isCancelled) return 'cancelled';
                                if (entry.kind === 'file' && entry.name.startsWith('art_')) {
                                    try {
                                        const file = await entry.getFile();
                                        const article = JSON.parse(await file.text());
                                        if (article.id) {
                                            folderArticlesMap.set(article.id, article);
                                        }
                                    } catch (e) { console.warn(`Could not parse ${entry.name} in destination folder.`); }
                                }
                            }

                            // --- NEW: Intelligently decide which articles to write based on existence and timestamp.
                            const articlesToWrite = [];
                            for (const browserArticle of browserArticles) {
                                const folderArticle = folderArticlesMap.get(browserArticle.id);
                                if (!folderArticle) {
                                    articlesToWrite.push(browserArticle); // Article is new to the folder.
                                } else if (new Date(browserArticle.updatedAt) > new Date(folderArticle.updatedAt)) {
                                    articlesToWrite.push(browserArticle); // Browser version is newer.
                                }
                                // If the folder version is the same or newer, it's skipped. No duplication, no data loss.
                            }

                            if (articlesToWrite.length === 0) {
                                App.ui.migrationScreen.hide();
                                App.ui.showToast('All notes are already up-to-date in the folder.', 'info');
                                return 'use_folder_only';
                            }

                            for (let i = 0; i < articlesToWrite.length; i++) {
                                if (App.ui.migrationScreen.state.isCancelled) return 'cancelled';
                                const article = articlesToWrite[i];
                                const progress = 50 + Math.round((i / articlesToWrite.length) * 45);
                                App.ui.migrationScreen.update(progress, `Copying newer note ${i + 1} of ${articlesToWrite.length}...`);

                                const fileHandle = await handle.getFileHandle(`${article.id}.json`, { create: true });
                                const writable = await fileHandle.createWritable();
                                await writable.write(JSON.stringify(article, null, 2));
                                await writable.close();
                            }

                            App.ui.migrationScreen.update(100, 'Migration Complete!');
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            App.ui.migrationScreen.hide();
                            return 'merge_successful';

                        } catch (err) {
                            console.error("Migration failed:", err);
                            App.ui.migrationScreen.hide();
                            App.ui.showToast('Migration process failed. Your data remains untouched.', 'error');
                            return 'error';
                        }
                    }
                },

                backup: {
                    // 1. HELPER: Gathers all app data for export
                    async getAllDataAsFiles() {
                        const files = [];
                        const dataFileNames = ['settings.json', 'todos.json', 'pomodoro.json', 'quiz_stats.json', 'tags.json', 'visual-map-state.json', 'mind-map-state.json', App.storage.DELETED_RECORDS_FILENAME];

                        if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
                            for await (const entry of App.state.directoryHandle.values()) {
                                if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                                    try {
                                        const file = await entry.getFile();
                                        const text = await file.text();
                                        // Robustness: Only export files that actually have content
                                        if (text.trim()) {
                                            files.push({ name: file.name, content: text });
                                        }
                                    } catch (e) { console.warn("Failed to read file for export:", entry.name); }
                                }
                            }
                        } else {
                            const articles = await App.browserStore.getAllArticles();
                            articles.forEach(a => files.push({ name: `${a.id}.json`, content: JSON.stringify(a, null, 2) }));

                            for (const fileName of dataFileNames) {
                                const data = await App.browserStore.getFile(fileName);
                                if (data) files.push({ name: fileName, content: JSON.stringify(data, null, 2) });
                            }
                        }
                        return files;
                    },

                    // 2. EXPORT: Full System Backup (For you, the user)
                    async exportToZip() {
                        if (!window.JSZip && App.loadLibrary) {
                            try {
                                await App.loadLibrary('jszip');
                            } catch (e) {
                                console.error('Failed to lazy load JSZip:', e);
                            }
                        }
                        if (!window.JSZip) { App.ui.showToast("Export library not loaded.", { type: 'error' }); return; }
 
                        App.ui.migrationScreen.show("Creating Full Backup");
 
                        try {
                            App.ui.migrationScreen.update(10, "Gathering files...");
                            const allFiles = await this.getAllDataAsFiles();
 
                            if (App.ui.migrationScreen.state.isCancelled) return;
                            if (allFiles.length === 0) { App.ui.showToast("No data to export.", "warning"); return; }
 
                            App.ui.migrationScreen.update(40, `Compressing ${allFiles.length} files...`);
                            const zip = new JSZip();
                            allFiles.forEach(file => zip.file(file.name, file.content));
 
                            if (App.ui.migrationScreen.state.isCancelled) return;
 
                            App.ui.migrationScreen.update(80, "Finalizing...");
                            const blob = await zip.generateAsync({ type: 'blob' });
                            const filename = `notekash-backup-${new Date().toISOString().slice(0, 10)}.zip`;
 
                            App.util.downloadBlob(blob, filename);
                            App.ui.migrationScreen.update(100, "Done!");
                            App.ui.showToast("Full backup created successfully!", "success");
                        } catch (error) {
                            console.error("Export failed:", error);
                            App.ui.showToast("Export failed. Check console.", "error");
                        } finally {
                            setTimeout(() => App.ui.migrationScreen.hide(), 1000);
                        }
                    },
 
                    // 3. EXPORT: Study Kit (For Selling/Sharing - No System Files)
                    async exportStudyKit(categoryName) {
                        if (!window.JSZip && App.loadLibrary) {
                            try {
                                await App.loadLibrary('jszip');
                            } catch (e) {
                                console.error('Failed to lazy load JSZip:', e);
                            }
                        }
                        if (!window.JSZip) { App.ui.showToast("Export library not loaded.", { type: 'error' }); return; }

                        // Handle "All" category or specific category
                        const targetArticles = categoryName === 'All'
                            ? App.state.articles
                            : App.state.articles.filter(a => a.category === categoryName);

                        if (targetArticles.length === 0) {
                            App.ui.showToast(`No notes found in category "${categoryName}".`, 'warning');
                            return;
                        }

                        App.ui.migrationScreen.show(`Creating Study Kit: ${categoryName}`);

                        try {
                            const zip = new JSZip();
                            const folderName = `StudyKit-${App.util.slugify(categoryName)}`;

                            // Add only the articles
                            targetArticles.forEach((article, index) => {
                                const progress = Math.round((index / targetArticles.length) * 90);
                                App.ui.migrationScreen.update(progress, `Packing: ${article.title}`);
                                zip.file(`${article.id}.json`, JSON.stringify(article, null, 2));
                            });

                            // Optional: Add a manifest or readme
                            zip.file("README.txt", `NoteKash Study Kit: ${categoryName}\nContains ${targetArticles.length} notes.\nImport this zip directly into NoteKash.`);

                            const blob = await zip.generateAsync({ type: 'blob' });
                            App.util.downloadBlob(blob, `${folderName}.zip`);

                            App.ui.migrationScreen.update(100, "Kit Ready!");
                            App.ui.showToast(`Study Kit downloaded! (${targetArticles.length} notes)`, "success");

                        } catch (e) {
                            console.error("Study Kit Export Failed", e);
                            App.ui.showToast("Failed to create Study Kit.", "error");
                        } finally {
                            setTimeout(() => App.ui.migrationScreen.hide(), 1000);
                        }
                    },

                    // 4. IMPORT ROUTER (The Gatekeeper)
                    async handleFileImport(files) {
                        if (!files || files.length === 0) return;

                        const zipFiles = Array.from(files).filter(f => f.name.endsWith('.zip'));
                        const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json') || f.name.endsWith('.notekash'));
                        const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

                        if (zipFiles.length > 0) {
                            await this.importFromZip(zipFiles[0]);
                        } else {
                            // Process both PDFs and Loose Files in parallel if no Zip
                            if (pdfFiles.length > 0) await this.importPdfFiles(pdfFiles);
                            if (jsonFiles.length > 0) await this.importLooseFiles(jsonFiles);
                        }
                    },

                    // 4.1 PDF IMPORT HANDLER (Creates New Article per PDF)
                    async importPdfFiles(files) {
                        App.ui.migrationScreen.show("Importing PDFs");
                        let importedCount = 0;

                        try {
                            for (const file of files) {
                                try {
                                    // 1. Read file as Base64 Data URL
                                    const dataUrl = await new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = (e) => resolve(e.target.result);
                                        reader.onerror = reject;
                                        reader.readAsDataURL(file);
                                    });

                                    // 2. Prepare Attachment Data
                                    const safeId = 'pdf_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                                    const fileData = {
                                        id: safeId,
                                        name: file.name,
                                        type: file.type,
                                        data: dataUrl
                                    };

                                    // 3. Generate HTML Content (Pill)
                                    const displayName = fileData.name.replace(/\.pdf$/i, '');
                                    const pillHTML = `
                                    <span class="pdf-attachment-pill" data-pdf-id="${fileData.id}" data-original-name="${App.util.escapeHtml(fileData.name)}">
                                        <span class="pdf-attachment-name" contenteditable="true">${App.util.escapeHtml(displayName)}</span>
                                    </span><p><br></p>`;

                                    // 4. Create New Article Object
                                    const newArticle = {
                                        id: 'Note_' + Date.now().toString(36) + Math.random().toString(36).substr(2),
                                        title: displayName, // Title is filename without extension
                                        content: pillHTML,
                                        category: (App.settings.get('userCategories').find(c => c.isDefault) || { name: 'General' }).name,
                                        tags: [],
                                        attachments: [fileData], // Attach the file to the article model
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                        readCount: 0
                                    };

                                    // 5. Add to State
                                    App.state.articles.push(newArticle);
                                    importedCount++;

                                } catch (err) {
                                    console.error("Failed to import PDF:", file.name, err);
                                }
                            }

                            // 6. Save and Refresh - Using the correct storage pattern
                            if (importedCount > 0) {
                                App.ui.migrationScreen.update(70, "Saving to Storage...");

                                // Get the newly added articles (the last 'importedCount' articles in state)
                                const newArticles = App.state.articles.slice(-importedCount);

                                // Persist each article based on storage mode
                                if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
                                    await Promise.all(newArticles.map(a => App.fs.write(`${a.id}.json`, a)));
                                } else {
                                    await Promise.all(newArticles.map(a => App.browserStore.setArticle(a)));
                                }

                                // Rebuild indexes (wrapped in try/catch as these are optional)
                                App.ui.migrationScreen.update(90, "Rebuilding Index...");
                                try {
                                    await App.storage.generateIndexFromState();
                                } catch (indexErr) {
                                    console.warn("Index regeneration warning:", indexErr);
                                }

                                try {
                                    App.globalSearch.buildIndex();
                                } catch (searchErr) {
                                    console.warn("Search index rebuild warning:", searchErr);
                                }

                                App.ui.migrationScreen.update(100, "Import Complete!");

                                // Use a small delay before UI refresh to ensure state is committed
                                setTimeout(() => {
                                    App.ui.migrationScreen.hide();
                                    App.ui.filterAndRenderArticles();
                                    App.ui.showToast(`Imported ${importedCount} PDF(s) as new notes.`, "success");
                                }, 300);
                                return; // Exit early since we handle hide in the timeout
                            } else {
                                App.ui.showToast("No PDFs were imported.", "warning");
                            }

                        } catch (e) {
                            console.error("PDF Import Error:", e);
                            App.ui.showToast("PDF Import interrupted.", "error");
                        } finally {
                            App.ui.migrationScreen.hide();
                        }
                    },

                    // 5. LOOSE FILE HANDLER (Handles Single JSON, Bulk Arrays, & .notekash)
                    async importLooseFiles(files) {
                        App.ui.migrationScreen.show("Importing Notes");
                        try {
                            const rawArticles = [];
                            for (let i = 0; i < files.length; i++) {
                                const content = await files[i].text();
                                if (!content.trim()) continue;

                                try {
                                    const parsed = JSON.parse(content);

                                    if (Array.isArray(parsed)) {
                                        parsed.forEach(item => {
                                            // Handle v2 Envelope in an array (unlikely but possible)
                                            if (item.format === 'notekash' && item.data && item.data.id) {
                                                const article = item.data;
                                                if (item.isReadOnly) article.isReadOnly = true;
                                                if (item.preventReExport) article.preventReExport = true;
                                                rawArticles.push(article);
                                            }
                                            // Handle v1 Raw Object
                                            else if (item.id && item.title) {
                                                rawArticles.push(item);
                                            }
                                        });
                                    }
                                    // Handle v2 Envelope single object
                                    else if (parsed.format === 'notekash' && parsed.data && parsed.data.id) {
                                        const article = parsed.data;
                                        if (parsed.isReadOnly) article.isReadOnly = true;
                                        if (parsed.preventReExport) article.preventReExport = true;
                                        rawArticles.push(article);
                                    }
                                    // Handle v1 Raw Object
                                    else if (parsed.id && parsed.title) {
                                        rawArticles.push(parsed);
                                    }
                                } catch (e) { console.warn("Skipping invalid JSON:", files[i].name); }
                            }

                            if (rawArticles.length === 0) {
                                App.ui.showToast("No valid notes found in selection.", "warning");
                                return;
                            }

                            await this.processImportedArticles(rawArticles);
                        } catch (e) {
                            console.error("Import error:", e);
                            App.ui.showToast("Import failed.", "error");
                        } finally {
                            App.ui.migrationScreen.hide();
                        }
                    },

                    // 6. ZIP HANDLER (Handles Backups & Study Kits)
                    async importFromZip(file) {
                        if (!window.JSZip && App.loadLibrary) {
                            try {
                                await App.loadLibrary('jszip');
                            } catch (e) {
                                console.error('Failed to lazy load JSZip:', e);
                            }
                        }
                        if (!window.JSZip) { App.ui.showToast("Import library not loaded.", { type: 'error' }); return; }

                        App.ui.migrationScreen.show("Reading Archive");

                        try {
                            const zip = await JSZip.loadAsync(file);
                            // FIX: Filter out macOS hidden files (starting with ._) and folders
                            const filesToProcess = Object.keys(zip.files).filter(path =>
                                !zip.files[path].dir &&
                                !path.startsWith('__MACOSX') &&
                                !path.split('/').pop().startsWith('._')
                            );

                            const rawArticles = [];
                            const systemFiles = ['settings.json', 'todos.json', 'pomodoro.json', 'quiz_stats.json', 'tags.json', 'visual-map-state.json', 'mind-map-state.json', App.storage.DELETED_RECORDS_FILENAME];
                            let systemFilesRestored = 0;

                            App.ui.migrationScreen.update(20, "Unpacking & Sorting...");

                            for (const path of filesToProcess) {
                                if (App.ui.migrationScreen.state.isCancelled) break;
                                if (path.includes('_index.json')) continue;

                                const content = await zip.files[path].async('string');

                                // FIX: Check for empty content to prevent crashes
                                if (!content || !content.trim()) continue;

                                // Case A: System Files (Restore immediately)
                                if (systemFiles.includes(path)) {
                                    try {
                                        const data = JSON.parse(content);
                                        await App.fs.write(path, data);

                                        if (path === 'tags.json') App.state.tags = data;

                                        systemFilesRestored++;
                                    } catch (e) { console.warn(`Skipped corrupt system file: ${path}`); }
                                }
                                // Case B: Note Files (Collect for processing)
                                else if (path.endsWith('.json') || path.endsWith('.notekash')) {
                                    try {
                                        const parsed = JSON.parse(content);
                                        if (Array.isArray(parsed)) {
                                            parsed.forEach(item => {
                                                if (item.format === 'notekash' && item.data && item.data.id) {
                                                    const article = item.data;
                                                    if (item.isReadOnly) article.isReadOnly = true;
                                                    if (item.preventReExport) article.preventReExport = true;
                                                    rawArticles.push(article);
                                                } else if (item.id && item.title) {
                                                    rawArticles.push(item);
                                                }
                                            });
                                        }
                                        else if (parsed.format === 'notekash' && parsed.data && parsed.data.id) {
                                            const article = parsed.data;
                                            if (parsed.isReadOnly) article.isReadOnly = true;
                                            if (parsed.preventReExport) article.preventReExport = true;
                                            rawArticles.push(article);
                                        }
                                        else if (parsed.id && parsed.title) {
                                            rawArticles.push(parsed);
                                        }
                                    } catch (e) { console.warn("Corrupt note file in zip:", path); }
                                }
                            }

                            if (App.ui.migrationScreen.state.isCancelled) return;

                            // Reload settings if restored
                            if (systemFilesRestored > 0) {
                                await App.settings.load();
                                App.ui.applyTheme(App.settings.get('theme'));
                            }

                            await this.processImportedArticles(rawArticles);

                        } catch (error) {
                            console.error("Zip Import Error:", error);
                            App.ui.showToast("Failed to process zip file.", "error");
                            App.ui.migrationScreen.hide();
                        }
                    },

                    // 7. THE BRAIN (Handles Merging, Flashcard Generation & Indexing)
                    async processImportedArticles(articles) {
                        let newCount = 0;
                        let updatedCount = 0;

                        App.ui.migrationScreen.update(50, "Merging Knowledge Graph...");

                        // A. Category Reconciliation (Auto-create missing categories)
                        let userCategories = App.settings.get('userCategories');
                        const existingCatNames = new Set(userCategories.map(c => c.name.toLowerCase()));
                        let categoriesUpdated = false;

                        articles.forEach(article => {
                            if (article.category && !existingCatNames.has(article.category.toLowerCase())) {
                                userCategories.push({
                                    name: article.category,
                                    displayName: article.category,
                                    colorIndex: userCategories.length % 20,
                                    isDefault: false
                                });
                                existingCatNames.add(article.category.toLowerCase());
                                categoriesUpdated = true;
                            }
                        });

                        if (categoriesUpdated) {
                            await App.settings.set('userCategories', userCategories);
                        }

                        // B. State Merge & Flashcard Generation
                        const currentArticlesMap = new Map(App.state.articles.map(a => [a.id, a]));
                        const articlesToPersist = [];

                        articles.forEach(incoming => {
                            // FIX: The critical empty object check
                            const hasNoFlashcards = !incoming.flashcards || Object.keys(incoming.flashcards).length === 0;

                            if (hasNoFlashcards && incoming.content) {
                                // Force auto-generation of flashcards for AI/External notes
                                incoming.flashcards = App.util.extractFlashcards(incoming.content, incoming.id, incoming.category || 'General', {});
                            }

                            const existing = currentArticlesMap.get(incoming.id);

                            if (!existing) {
                                App.state.articles.push(incoming);
                                articlesToPersist.push(incoming);
                                newCount++;
                            } else {
                                // Overwrite only if incoming is newer
                                const incomingDate = new Date(incoming.updatedAt || 0);
                                const existingDate = new Date(existing.updatedAt || 0);

                                if (incomingDate > existingDate) {
                                    Object.assign(existing, incoming);
                                    articlesToPersist.push(incoming);
                                    updatedCount++;
                                }
                            }
                        });

                        // C. Batch Persistence
                        App.ui.migrationScreen.update(70, "Saving to Storage...");

                        if (App.state.storageMode === 'fileSystem' && App.state.directoryHandle) {
                            await Promise.all(articlesToPersist.map(a => App.fs.write(`${a.id}.json`, a)));
                        } else {
                            await Promise.all(articlesToPersist.map(a => App.browserStore.setArticle(a)));
                        }

                        // D. Rebuild Indexes
                        App.ui.migrationScreen.update(90, "Rebuilding Master Index...");
                        App.state.articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        await App.storage.generateIndexFromState();

                        // E. Refresh App State
                        App.ui.migrationScreen.update(95, "Refreshing UI...");
                        App.globalSearch.buildIndex();
                        await App.contentTools.updateTagsIndex();
                        App.contentTools.buildDataCache();

                        // F. Finish
                        App.ui.migrationScreen.update(100, "Import Complete!");

                        setTimeout(() => {
                            App.ui.migrationScreen.hide();

                            const currentView = App.router.getActiveView();
                            if (currentView === 'library') App.ui.filterAndRenderArticles();
                            if (currentView === 'flashcard') App.ui.filterAndRenderFlashcards();
                            if (currentView === 'category') App.ui.renderCategoryView(document.getElementById('category-view'), App.router.getActiveViewData());
                            if (currentView === 'visual-map') App.visualMap.init();
                            if (currentView === 'mindmap') App.mindMap.init();
                            if (currentView === 'tags') App.events.filterAndRenderTags();

                            App.ui.showToast(`Imported ${newCount} new, updated ${updatedCount} notes.`, "success");

                            if (App.settings.get('enableDropboxSync') && App.dropbox.isReady()) {
                                App.dropbox.syncChanges(true);
                            }

                        }, 800);
                    }
                },

                share: {
                    async article() {
                        if (!navigator.share) {
                            App.ui.showToast('Share API not supported on this device.', 'warning');
                            return;
                        }

                        const article = App.storage.getArticle(App.state.activeArticleId);
                        if (!article) {
                            App.ui.showToast('Could not find the article to share.', 'error');
                            return;
                        }
                        if (article.preventReExport) {
                            App.ui.showToast('Creator has disabled Re-Sharing of notes.', { type: 'warning' });
                            return;
                        }

                        App.ui.showExportBrandModal(async (brandName, brandLink) => {
                            const categoryObj = App.settings.get('userCategories').find(c => c.name === article.category) || { name: article.category, colorIndex: 0 };
                            const categoryPill = `<div class="exported-pill category" style="background-color: ${App.util.getCategoryColor(categoryObj.colorIndex)}; color: var(--category-pill-text);">${App.util.getCategoryDisplayName(categoryObj.name)}</div>`;

                            let processedContent = App.util.renderClozeForDisplay(App.util.parseShortcuts(article.content));
                            const shareDoc = new DOMParser().parseFromString(processedContent, 'text/html');
                            const firstTagTargets = {};
                            shareDoc.querySelectorAll('.rendered-tag[data-tag]').forEach((tag, index) => {
                                const tagSlug = tag.dataset.tag || App.contentTools.slugify(tag.textContent || `tag-${index + 1}`);
                                const id = tag.id || `tag-${tagSlug}-${index + 1}`;
                                const anchor = shareDoc.createElement('a');
                                anchor.className = tag.className;
                                anchor.dataset.tag = tagSlug;
                                anchor.id = id;
                                anchor.href = `#${id}`;
                                anchor.textContent = tag.textContent;
                                tag.replaceWith(anchor);
                                firstTagTargets[tagSlug] ||= id;
                            });
                            processedContent = shareDoc.body.innerHTML;
                            const hasMath = App.util.hasMathSyntax(processedContent);
                            if (hasMath) {
                                const mathDiv = document.createElement('div');
                                mathDiv.innerHTML = processedContent;
                                App.util.renderMathInElement(mathDiv);
                                processedContent = mathDiv.innerHTML;
                            }
                            const tagsPills = (article.tags || []).map(tag => {
                                const label = App.state.tags[tag]?.displayName || tag;
                                const target = firstTagTargets[tag] || firstTagTargets[App.contentTools.slugify(label)];
                                return target
                                    ? `<a class="exported-pill" href="#${App.util.escapeHtml(target)}">${App.util.escapeHtml(label)}</a>`
                                    : `<div class="exported-pill">${App.util.escapeHtml(label)}</div>`;
                            }).join('');
                            const pillsHTML = `<div class="exported-pills-container">${categoryPill}${tagsPills}</div>`;
                            const bodyContent = `${pillsHTML}<h1>${article.title}</h1><hr>${processedContent}`;
                            const fullHtml = App.services.export._getHtmlExportTemplate(article.title, bodyContent, App.settings.get('theme'), brandName, brandLink, { includeMathCss: hasMath });

                            const blob = new Blob([fullHtml], { type: 'text/html' });
                            const file = new File([blob], `${App.util.slugify(article.title)}.html`, { type: 'text/html' });

                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                try {
                                    await navigator.share({
                                        files: [file],
                                        title: article.title,
                                        text: `Note: ${article.title}`,
                                    });
                                } catch (err) {
                                    if (err.name !== 'AbortError') {
                                        console.error('File share failed:', err);
                                        App.ui.showToast('Something went wrong while sharing.', 'error');
                                    }
                                }
                            } else {
                                if (App.state.globalCopyAllowed === false && !App.state.isCreator) {
                                    App.ui.showToast('Copying is disabled for shared notes.', { type: 'warning' });
                                    return;
                                }
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = article.content;
                                const textContent = tempDiv.textContent || tempDiv.innerText;
                                const textToCopy = `Title: ${article.title}\n\n${textContent}\n\n---\nSource: notekash.com`;

                                await navigator.clipboard.writeText(textToCopy);
                                App.ui.showToast('File sharing not supported. Full article text has been copied to your clipboard instead!', { type: 'info', duration: 6000 });
                            }
                        }, 'HTML');
                    },
                },
                ai: {
                    async queryGenerativeAI(systemPrompt, userPrompt) {
                        if (!App.offline.check('AI Features')) throw new Error("Offline");
                        const provider = App.settings.get('aiProvider') || 'openrouter';
                        const modelName = App.settings.get('openRouterModel');

                        let apiKey, apiUrl, headers, body;
                        const toastId = App.ui.showToast("AI is thinking...", { type: 'info', duration: 0 });

                        const maxRetries = 3;
                        let delay = 2000;

                        for (let attempt = 0; attempt < maxRetries; attempt++) {
                            try {
                                let apiKey, apiUrl, headers, body;

                                // --- PROVIDER LOGIC START ---
                                if (provider === 'gemini') {
                                    apiKey = App.settings.get('geminiKey');
                                    if (!apiKey) throw new Error("Google Gemini API key not set.");

                                    // Gemini Model Selection
                                    // Default to medium if not set
                                    const geminiModel = App.settings.get('geminiModel') || 'gemini-2.5-flash';

                                    // Construct URL (Standard GenerateContent)
                                    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

                                    headers = { "Content-Type": "application/json" };
                                    body = JSON.stringify({ "contents": [{ "parts": [{ "text": `${systemPrompt}\n\n${userPrompt}` }] }] });

                                } else if (provider === 'openai') {
                                    apiKey = App.settings.get('openaiKey');
                                    if (!apiKey) throw new Error("OpenAI API key not set.");
                                    const openaiModel = App.settings.get('openaiModel') || 'gpt-4o-mini';

                                    apiUrl = "https://api.openai.com/v1/chat/completions";
                                    headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" };
                                    body = JSON.stringify({
                                        "model": openaiModel,
                                        "messages": [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": userPrompt }]
                                    });

                                } else if (provider === 'huggingface') {
                                    apiKey = App.settings.get('huggingfaceKey');
                                    if (!apiKey) throw new Error("Hugging Face API key not set.");
                                    const hfModel = App.settings.get('huggingfaceModel') || 'mistralai/Mistral-7B-Instruct-v0.2';

                                    apiUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
                                    headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" };

                                    const fullPrompt = `System: ${systemPrompt}\nUser: ${userPrompt}\nAssistant:`;
                                    body = JSON.stringify({
                                        "inputs": fullPrompt,
                                        "parameters": { "max_new_tokens": 1024, "return_full_text": false }
                                    });

                                } else {
                                    // Default: OPENROUTER
                                    apiKey = App.settings.get('openRouterKey');
                                    if (!apiKey) throw new Error("OpenRouter API key not set.");
                                    apiUrl = "https://openrouter.ai/api/v1/chat/completions";
                                    headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": `${window.location.protocol}//${window.location.hostname}`, "X-Title": "NoteKash" };
                                    body = JSON.stringify({ "model": modelName, "messages": [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": userPrompt }] });
                                }
                                // --- PROVIDER LOGIC END ---

                                const response = await fetch(apiUrl, { method: "POST", headers, body });

                                if (response.ok) {
                                    const data = await response.json();
                                    let content = null;

                                    if (provider === 'gemini') {
                                        content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                                    } else if (provider === 'huggingface') {
                                        // HF usually returns array of generated_text
                                        // If array: [{ generated_text: "..." }]
                                        if (Array.isArray(data)) {
                                            content = data[0]?.generated_text;
                                        } else {
                                            content = data?.generated_text;
                                        }
                                    } else {
                                        // OpenAI and OpenRouter share format
                                        content = data?.choices?.[0]?.message?.content;
                                    }

                                    if (!content) throw new Error("AI returned an empty or invalid response structure.");
                                    App.ui.hideToast(toastId);
                                    return content;
                                }

                                const retriableStatusCodes = [429, 500, 503, 504];
                                if (retriableStatusCodes.includes(response.status) && attempt < maxRetries - 1) {
                                    App.ui.updateToast(toastId, `Model is busy. Retrying in ${delay / 1000}s...`);
                                    await new Promise(resolve => setTimeout(resolve, delay));
                                    delay *= 2;
                                    continue;
                                }

                                if (response.status === 401) throw new Error("Invalid API Key. Please check it in Settings.");
                                const errorData = await response.json().catch(() => ({}));
                                const errorMessage = errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`;
                                throw new Error(errorMessage);

                            } catch (error) {
                                // --- THIS IS THE NEW, SMARTER ERROR HANDLING ---
                                App.ui.hideToast(toastId);
                                console.error(`Generative AI Error (attempt ${attempt + 1}):`, error);

                                if (error.message.toLowerCase().includes('quota')) {
                                    const friendlyMessage = 'API Quota Exceeded. Please upgrade your API plan or check your settings.';
                                    App.ui.showToast(friendlyMessage, {
                                        type: 'error',
                                        duration: 10000,
                                        action: {
                                            label: 'Settings',
                                            callback: () => App.ui.showAiSettingsModal()
                                        }
                                    });
                                    // Also update the AI Magic viewer bubble if it's open
                                    if (App.ui.aiMagicModal.state.isOpen && App.ui.aiMagicModal.state.mode === 'viewer') {
                                        App.ui.aiMagicModal._updateLastViewerMessage(`<p style="color:var(--danger-color);">${friendlyMessage}</p>`);
                                    }

                                    return null; // Stop retrying on quota errors.
                                }

                                if (attempt === maxRetries - 1) {
                                    App.ui.showToast(`AI Error: ${error.message}`, "error");
                                    return null;
                                }

                                App.ui.updateToast(toastId, `Connection issue. Retrying in ${delay / 1000}s...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                delay *= 2;
                            }
                        }

                        App.ui.hideToast(toastId);
                        App.ui.showToast("AI query failed after multiple retries.", "error");
                        return null;
                    },
                }
};
