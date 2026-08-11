export const contentTools = {
                slugify: (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-'),
                _applyWrapper(className, attributes = {}) {
                    const selection = window.getSelection();
                    if (!selection.rangeCount || selection.isCollapsed) return;
                    const editor = document.getElementById('article-content');
                    if (!editor.contains(selection.anchorNode)) return;
                    const range = selection.getRangeAt(0);
                    const parent = range.commonAncestorContainer.parentElement;
                    if (parent && parent.classList.contains(className)) {
                        parent.replaceWith(...parent.childNodes);
                    } else {
                        const wrapper = document.createElement(className === 'mindmap-snippet' ? 'mark' : 'span');
                        wrapper.className = className;
                        Object.entries(attributes).forEach(([key, value]) => wrapper.setAttribute(key, value));
                        wrapper.textContent = selection.toString();
                        range.deleteContents();
                        range.insertNode(wrapper);
                    }
                    selection.removeAllRanges();
                },

                async clipArticle(url) {
                    const toastId = App.ui.showToast('Clipping article...', { type: 'info', duration: 0 });

                    const insertClippedHTML = (article) => {
                        const clippedHTML = `
                        <blockquote>
                            <p><em>Clipped from: <a href="${App.util.escapeHtml(article.source)}" target="_blank" rel="noopener noreferrer">${App.util.escapeHtml(article.title)}</a></em></p>
                        </blockquote>
                        ${article.content}
                        <p><br></p>`;

                        document.execCommand('insertHTML', false, clippedHTML);
                        App.state.isArticleDirty = true;
                        App.ui.hideToast(toastId);
                        App.ui.showToast('Article clipped successfully!', { type: 'success' });
                    };

                    try {
                        const response = await fetch('/clipper', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url })
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || `Server responded with status ${response.status}`);
                        }

                        const article = await response.json();
                        insertClippedHTML(article);

                    } catch (tier1Error) {
                        console.warn("Clip: Tier 1 failed, attempting Tier 2 (Fallback). Reason:", tier1Error.message);
                        App.ui.updateToast(toastId, 'Advanced clipping failed. Trying fallback...');

                        try {
                            if (typeof Readability === 'undefined') {
                                throw new Error("Readability library is not loaded.");
                            }
                            const proxyUrl = 'https://api.allorigins.win/raw?url=';
                            const response = await fetch(proxyUrl + encodeURIComponent(url));

                            if (!response.ok) {
                                throw new Error(`Fallback fetch failed. Status: ${response.statusText}`);
                            }

                            const rawHtml = await response.text();
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(rawHtml, 'text/html');
                            const reader = new Readability(doc);
                            const article = reader.parse();

                            if (!article || !article.content) {
                                throw new Error("Fallback could not parse article content.");
                            }

                            insertClippedHTML({
                                title: article.title,
                                content: article.content,
                                source: url
                            });

                        } catch (tier2Error) {
                            console.error('Clip: Tier 2 (Fallback) also failed:', tier2Error);
                            App.ui.hideToast(toastId);
                            App.ui.showToast(`Clipping failed completely: ${tier2Error.message}`, { type: 'error' });
                        }
                    }
                },


                tagSelection(nodeToReplace = null) {
                    if (nodeToReplace) {
                        const slug = this.slugify(nodeToReplace.textContent);
                        const wrapper = document.createElement('span');
                        wrapper.className = 'rendered-tag';
                        wrapper.dataset.tag = slug;
                        wrapper.textContent = nodeToReplace.textContent;
                        nodeToReplace.replaceWith(wrapper);
                    } else {
                        const selectionText = window.getSelection().toString();
                        if (!selectionText.trim()) return;
                        const slug = this.slugify(selectionText);
                        this._applyWrapper('rendered-tag', { 'data-tag': slug });
                    }
                },
                extractTagsFromHTML(html) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    return Array.from(tempDiv.querySelectorAll('.rendered-tag[data-tag]')).map(node => node.dataset.tag);
                },

                convertContentSyntax(htmlString) {
                    if (!htmlString) return '';
                    // DOM-based approach: Only process text nodes, never attributes (protects data: URLs)
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlString;
                    const tagRegex = /\[\[(.*?)\]\]/g;
                    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
                    const nodesToProcess = [];
                    while (walker.nextNode()) {
                        const node = walker.currentNode;
                        // Skip if inside protected elements
                        if (node.parentElement.closest('code, pre, .nk-code-block, .rendered-tag, .nk-mcq-explanation')) continue;
                        const protectedMath = App.util.protectMathSegments(node.nodeValue);
                        tagRegex.lastIndex = 0;
                        if (tagRegex.test(protectedMath.text)) {
                            tagRegex.lastIndex = 0; // Reset regex
                            nodesToProcess.push({ node, text: protectedMath.text, mathTokens: protectedMath.tokens });
                        }
                    }
                    nodesToProcess.forEach(({ node: textNode, text, mathTokens }) => {
                        const fragment = document.createDocumentFragment();
                        let lastIndex = 0;
                        let match;
                        tagRegex.lastIndex = 0;
                        while ((match = tagRegex.exec(text)) !== null) {
                            if (match.index > lastIndex) {
                                fragment.appendChild(document.createTextNode(App.util.restoreMathSegments(text.substring(lastIndex, match.index), mathTokens)));
                            }
                            const content = match[1];
                            const slug = this.slugify(content);
                            if (slug) {
                                const span = document.createElement('span');
                                span.className = 'rendered-tag';
                                span.dataset.tag = slug;
                                span.textContent = content;
                                fragment.appendChild(span);
                            } else {
                                fragment.appendChild(document.createTextNode(match[0]));
                            }
                            lastIndex = match.index + match[0].length;
                        }
                        if (lastIndex < text.length) {
                            fragment.appendChild(document.createTextNode(App.util.restoreMathSegments(text.substring(lastIndex), mathTokens)));
                        }
                        textNode.parentNode.replaceChild(fragment, textNode);
                    });
                    return tempDiv.innerHTML;
                },
                updateDataTagsInContent(html) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    tempDiv.querySelectorAll('.rendered-tag').forEach(tag => {
                        tag.setAttribute('data-tag', this.slugify(tag.textContent));
                    });
                    return tempDiv.innerHTML;
                },
                autoSuggestTags(contentEl) {
                    clearTimeout(App.state.suggestionTimeout);
                    App.state.suggestionTimeout = setTimeout(() => {
                        const tagDisplayNames = Object.values(App.state.tags).map(t => t.displayName);
                        // CRITICAL FIX: Filter out empty/falsy display names to prevent regex matching empty strings at word boundaries
                        const validTagNames = tagDisplayNames.filter(name => name && name.trim());
                        if (validTagNames.length === 0) return;
                        const regex = new RegExp(`\\b(${validTagNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
                        const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT);
                        const nodesToProcess = [];
                        while (walker.nextNode()) {
                            if (walker.currentNode.parentElement.closest('.rendered-tag, .tag-suggestion')) continue;
                            nodesToProcess.push(walker.currentNode);
                        }
                        nodesToProcess.forEach(textNode => {
                            const text = textNode.nodeValue;
                            if (!regex.test(text)) return;
                            const fragment = document.createDocumentFragment(); let lastIndex = 0;
                            text.replace(regex, (match, ...args) => {
                                const offset = args[args.length - 2];
                                if (offset > lastIndex) fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
                                // SAFEGUARD: Skip empty or whitespace-only matches
                                if (match && match.trim()) {
                                    const span = document.createElement('span'); span.className = 'tag-suggestion'; span.textContent = match; fragment.appendChild(span);
                                } else {
                                    fragment.appendChild(document.createTextNode(match));
                                }
                                lastIndex = offset + match.length;
                            });
                            if (lastIndex < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                            textNode.parentNode.replaceChild(fragment, textNode);
                        });
                    }, 250);
                },
                async updateTagsIndex() {
                    const newTagsIndex = {};
                    App.state.articles.forEach(article => {
                        (article.tags || []).forEach(tag => {
                            const displayName = App.state.tags[tag]?.displayName || tag.replace(/-/g, ' ');
                            if (!newTagsIndex[tag]) newTagsIndex[tag] = { id: tag, displayName, count: 0, articles: [] };
                            newTagsIndex[tag].count++;
                            if (!newTagsIndex[tag].articles.includes(article.id)) newTagsIndex[tag].articles.push(article.id);
                        });
                    });
                    App.state.tags = newTagsIndex;
                    await App.fs.write('tags.json', App.state.tags);
                },
                buildDataCache(articleId = null) {

                    if (articleId) {
                        // Incremental update for a specific article
                        const article = App.storage.getArticle(articleId);
                        if (article) {
                            let snippets = App.util.extractSnippets(article, 'mindmap');
                            App.state.dataCache.mindMapSnippets[article.id] = snippets.filter(s => s.html);
                        } else {
                            delete App.state.dataCache.mindMapSnippets[articleId];
                        }
                    } else {
                        // Full rebuild
                        const mindMapSnippets = {};
                        App.state.articles.forEach(article => {
                            let snippets = App.util.extractSnippets(article, 'mindmap');
                            mindMapSnippets[article.id] = snippets.filter(s => s.html);
                        });
                        App.state.dataCache.mindMapSnippets = mindMapSnippets;
                    }

                    App.state.dataCache.isBuilt = true;
                },
};
