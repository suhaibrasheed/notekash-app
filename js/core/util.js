export const util = {

                // Optimized: Debounce Function
                debounce(func, wait) {
                    let timeout;
                    return function (...args) {
                        const context = this;
                        clearTimeout(timeout);
                        timeout = setTimeout(() => func.apply(context, args), wait);
                    };
                },

                protectMathSegments(text) {
                    const tokens = [];
                    if (!text || typeof text !== 'string') return { text: text || '', tokens };

                    let protectedText = text.replace(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g, (match) => {
                        const index = tokens.push(match) - 1;
                        return `\uE100MATH${index}\uE100`;
                    });

                    protectedText = protectedText.replace(/(^|[^\\$])\$([^$\n]{1,300})\$/g, (match, prefix, body) => {
                        if (!App.util.isLikelySingleDollarMath(body)) return match;
                        const index = tokens.push(`$${body}$`) - 1;
                        return `${prefix}\uE100MATH${index}\uE100`;
                    });

                    return { text: protectedText, tokens };
                },

                restoreMathSegments(text, tokens = []) {
                    if (!text || !tokens.length) return text || '';
                    return text.replace(/\uE100MATH(\d+)\uE100/g, (match, index) => tokens[Number.parseInt(index, 10)] ?? match);
                },

                hasMathSyntax(text) {
                    if (!text || typeof text !== 'string') return false;
                    return App.util.protectMathSegments(text).tokens.length > 0;
                },

                parseMathToken(token) {
                    const value = (token || '').trim();
                    if (value.startsWith('$$') && value.endsWith('$$')) {
                        return { latex: value.slice(2, -2), display: true };
                    }
                    if (value.startsWith('\\[') && value.endsWith('\\]')) {
                        return { latex: value.slice(2, -2), display: true };
                    }
                    if (value.startsWith('\\(') && value.endsWith('\\)')) {
                        return { latex: value.slice(2, -2), display: false };
                    }
                    if (value.startsWith('$') && value.endsWith('$')) {
                        return { latex: value.slice(1, -1), display: false };
                    }
                    return { latex: value, display: false };
                },

                isLikelySingleDollarMath(body) {
                    const value = (body || '').trim();
                    if (!value || value.length > 300) return false;
                    if (/^\d+(?:[.,]\d+)?(?:\s+\w+)*$/.test(value)) return false;
                    return /\\[a-zA-Z]+/.test(value)
                        || /[=^_{}<>±×÷∑∆Δ∫√≈≤≥≠→←]/.test(value)
                        || /[A-Za-z0-9)]\s*[+\-*/]\s*[A-Za-z0-9(]/.test(value)
                        || /^[A-Za-z](?:[_^][A-Za-z0-9{}]+)?$/.test(value);
                },

                convertSingleDollarMathText(text) {
                    if (!text || typeof text !== 'string') return text || '';
                    return text.replace(/(^|[^\\$])\$([^$\n]{1,300})\$/g, (match, prefix, body) => {
                        return App.util.isLikelySingleDollarMath(body) ? `${prefix}\\(${body}\\)` : match;
                    });
                },

                prepareSingleDollarMath(container) {
                    if (!container) return;
                    const skipTags = new Set(['SCRIPT', 'NOSCRIPT', 'STYLE', 'TEXTAREA', 'PRE', 'CODE', 'OPTION']);
                    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
                        acceptNode: node => {
                            const parent = node.parentElement;
                            if (!parent || skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
                            if (parent.closest('.katex, .nk-code-block, .rendered-tag, .tag-suggestion, .nk-mcq-toolbar, .resize-handle, .pdf-attachment-name')) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    });
                    const nodes = [];
                    while (walker.nextNode()) nodes.push(walker.currentNode);
                    nodes.forEach(node => {
                        node.nodeValue = App.util.convertSingleDollarMathText(node.nodeValue);
                    });
                },

                renderMathInElement(container) {
                    if (!container || typeof renderMathInElement !== 'function') return;
                    try {
                        App.util.prepareSingleDollarMath(container);
                        renderMathInElement(container, {
                            delimiters: [
                                { left: '$$', right: '$$', display: true },
                                { left: '\\[', right: '\\]', display: true },
                                { left: '\\(', right: '\\)', display: false }
                            ],
                            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
                            ignoredClasses: [
                                'katex',
                                'nk-code-block',
                                'rendered-tag',
                                'tag-suggestion',
                                'nk-mcq-toolbar',
                                'resize-handle',
                                'pdf-attachment-name'
                            ],
                            throwOnError: false,
                            strict: 'warn',
                            trust: false
                        });
                    } catch (error) {
                        console.warn('KaTeX render skipped:', error);
                    }
                },

                hasRenderedMath(container) {
                    return !!container?.querySelector?.('.katex, .katex-display');
                },

                // Surgical & consistent Word Count logic
                calculateWordCount(content) {
                    if (!content || typeof content !== 'string') return 0;
                    // Replace HTML tags with spaces to ensure words separated by tags are counted correctly
                    // Example: <span>Hello</span><span>World</span> becomes " Hello  World " (2 words)
                    // textContent would return "HelloWorld" (1 word)
                    const textOnly = content.replace(/<[^>]+>/g, ' ');
                    return textOnly.trim().split(/\s+/).filter(Boolean).length;
                },

                // NEW: Surgical Memory Cleanup
                // Clears cached snippets and large temporary objects to prevent RAM bloat
                freeMemory() {
                    // 1. Clear cached snippets from all articles
                    if (App.state.articles) {
                        App.state.articles.forEach(article => {
                            if (article.snippets) {
                                delete article.snippets; // Allow GC to reclaim snippet HTML strings
                            }
                            // Clear any other temp props
                            if (article._tempContent) delete article._tempContent;
                        });
                    }

                    // 2. Clear focus session heavy data if not active
                    if (!App.state.focusSession?.isActive) {
                        App.state.focusSession = { isActive: false, articles: [], annotations: {} };
                    }

                    // 3. Clear category render state
                    App.state.categoryRender = {
                        articles: [],
                        currentIndex: 0,
                        observer: null
                    };

                    // 4. Force strict garbage collection hint (nullifying large reachable objects)
                    // (Browsers manage GC automatically, but breaking references helps)
                },

                isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

                escapeRegex(string) {
                    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                },
                escapeHtml: (u) => {
                    if (u === null || u === undefined) return '';
                    const str = typeof u === 'string' ? u : String(u);
                    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                },

                // Enhanced MCQ Parser

                parseMcqText(text) {
                    // Pre-process: Normalize newlines & remove zero-width chars
                    let cleanText = text.replace(/\r\n/g, '\n').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
                    if (!cleanText) return [];

                    // Smart formatting for single-line / paragraph-style MCQs:
                    // 1. Put separators on their own lines
                    cleanText = cleanText.replace(/\s*(>>>|---|___|\*\*\*)\s*/g, '\n$1\n');

                    // 2. Put inline options on their own lines
                    // Matches: " A) ", " B. ", " (C) ", " [D] ", " 1) ", etc.
                    cleanText = cleanText.replace(/(?:\s+|^)([A-Ea-e1-5](?:\.|\)|:)|[\[\(][A-Ea-e1-5][\]\)])(?=\s+|$|[a-zA-Z0-9])/g, '\n$1 ');

                    // 3. Put inline answers on their own lines
                    cleanText = cleanText.replace(/(?:\s+|^)(Correct\s+Answer|Answer|Ans)([\s\:\-]+)([a-eA-E1-5])(?:\s|$|\.)/ig, '\n$1$2$3\n');

                    // 4. Put inline explanations on their own lines
                    cleanText = cleanText.replace(/(?:\s+|^)(Explanation|Exp|Solution|Sol)([\s\:\-]+)/ig, '\n$1$2');

                    let allBlocks = [];

                    // 1. Explicit Splitting ONLY via MCQ Breaks (>>>, ---, ***, ___)
                    const SEPARATOR_REGEX = /(?:^|\n)\s*(?:>>>|---|___|\*\*\*)\s*(?:\n|$)/;


                    if (SEPARATOR_REGEX.test(cleanText)) {
                        const rawChunks = cleanText.split(SEPARATOR_REGEX).filter(c => c.trim().length > 0);
                        rawChunks.forEach(chunk => {
                            const parsed = this._parseSingleMcq(chunk.trim());
                            if (parsed) allBlocks.push(parsed);
                        });
                    } else {
                        const parsed = this._parseSingleMcq(cleanText);
                        if (parsed) allBlocks.push(parsed);
                    }

                    return allBlocks;
                },

                // Initialize Plyr players
                async initPlyr(container) {
                    if (typeof Plyr === 'undefined' && window.App?.loadLibrary) {
                        try {
                            await Promise.all([App.loadLibrary('plyr'), App.loadLibrary('plyrCss')]);
                        } catch (e) {
                            console.warn('Could not lazy-load Plyr:', e);
                        }
                    }
                    if (typeof Plyr === 'undefined') {
                        if (container) {
                            container.querySelectorAll('.js-plyr-video').forEach(el => {
                                el.innerHTML = '<div style="padding:20px;text-align:center;background:var(--bg-secondary);color:var(--text-secondary);border-radius:8px;">Video player unavailable offline.</div>';
                            });
                        }
                        return;
                    }
                    if (!container) return;

                    // 1. YouTube & Shorts
                    container.querySelectorAll('.js-plyr-video').forEach(el => {
                        if (el.plyr) return; // Prevent double init
                        const options = {
                            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
                            hideControls: true,
                            youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
                        };
                        const ratio = el.dataset.ratio; // Check for custom ratio (e.g., 9:16)
                        if (ratio) options.ratio = ratio;
                        try {
                            el.plyr = new Plyr(el, options);
                        } catch (e) {
                            console.warn('Plyr init failed', e);
                        }
                    });
                },

                // Prepare content for saving by stripping Plyr DOM
                cleanPlyrForSave(container) {
                    if (!container) return;
                    // Iterate over wrappers
                    container.querySelectorAll('.nk-plyr-wrapper').forEach(wrapper => {
                        const provider = wrapper.dataset.provider;
                        const embedId = wrapper.dataset.embedId;
                        const ratio = wrapper.dataset.ratio ? `data-ratio="${wrapper.dataset.ratio}"` : '';
                        if (provider && embedId) {
                            // Hard reset content to seed state
                            wrapper.innerHTML = `<div class="js-plyr-video" data-plyr-provider="${provider}" data-plyr-embed-id="${embedId}" ${ratio}></div>`;
                        }
                    });
                },

                _parseSingleMcq(text) {
                    const allLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    if (allLines.length < 2) return null; // Need at least question + 1 option

                    // Option detection patterns - ordered by specificity
                    const LETTER_OPTION = /^\s*(?:[\[\(]\s*[a-zA-Z]\s*[\]\)]|[a-zA-Z][\.\)\-\:]|[a-eA-E]\s+)(?=\s|\d|$)/; // [A], (a), A., a), A-, A: or A space (for A-E) etc.
                    const ROMAN_OPTION = /^\s*(?:[\[\(]\s*[iIvVxX]+\s*[\]\)]|[iIvVxX]+\s*[\.\)\-])(?:\s+|$)/; // (i), (ii), [I], [II], i., ii) etc.
                    const NUMBER_BRACKET = /^\s*[\[\(]\s*\d+\s*[\]\)]\.?\s+/; // [1], (1), [2] etc.
                    const BULLET_OPTION = /^\s*[\u2022\u25E6\u25AA\u25CF\u25CB\u2023•◦▪●○‣\-\*]\s+/; // •, ○, -, * etc.

                    let parsedExplanationLines = [];
                    let parsedAnswerStr = null;

                    let mcqLinesEndIndex = allLines.length;
                    let inExplanationZone = false;

                    for (let i = 0; i < allLines.length; i++) {
                        const line = allLines[i];

                        // Answer detection (before or after explanation)
                        const ansMatch = line.match(/^(?:Correct\s+Answer|Answer|Ans)[\s\:\-]+([a-eA-E]|[1-5])(?:\s|$|\.)/i);
                        if (ansMatch && !inExplanationZone) {
                            parsedAnswerStr = ansMatch[1].trim().toUpperCase();
                            if (i < mcqLinesEndIndex) mcqLinesEndIndex = i;
                            continue;
                        }

                        // Explanation detection
                        const expMatch = line.match(/^(?:Explanation|Exp|Solution|Sol)[\s\:\-]*(.*)/i);
                        if (expMatch && !inExplanationZone) {
                            inExplanationZone = true;
                            if (i < mcqLinesEndIndex) mcqLinesEndIndex = i;
                            const firstLineExp = expMatch[1].trim();
                            if (firstLineExp) parsedExplanationLines.push(firstLineExp);
                            continue;
                        }

                        // Metadata-only line detection (e.g. #medium #cell_biology [[UPSC 2018]])
                        const hasMetadata = /#(easy|medium|hard)\b/i.test(line) || /#[\w]+/.test(line) || /\[\[([^\]]+)\]\]/.test(line);
                        const isOptionMarker = LETTER_OPTION.test(line) || ROMAN_OPTION.test(line) || NUMBER_BRACKET.test(line) || BULLET_OPTION.test(line);
                        if (hasMetadata && !isOptionMarker && !inExplanationZone) {
                            inExplanationZone = true;
                            if (i < mcqLinesEndIndex) mcqLinesEndIndex = i;
                            parsedExplanationLines.push(line);
                            continue;
                        }

                        if (inExplanationZone) {
                            // Can also catch answer inside explanation zone just in case
                            const ansMatchInExp = line.match(/^(?:Correct\s+Answer|Answer|Ans)[\s\:\-]+([a-eA-E]|[1-5])(?:\s|$|\.)/i);
                            if (ansMatchInExp) {
                                parsedAnswerStr = ansMatchInExp[1].trim().toUpperCase();
                            } else {
                                parsedExplanationLines.push(line);
                            }
                        }
                    }

                    let lines = allLines.slice(0, mcqLinesEndIndex);
                    // Fail-safe: if metadata stripping removed too much, fallback
                    if (lines.length < 2) {
                        lines = allLines;
                        parsedExplanationLines = [];
                        parsedAnswerStr = null;
                    }


                    // Statement patterns (NOT options) - numbered without brackets typically
                    const NUMBERED_STATEMENT = /^\s*\d+[\.\)]\s+(?!\s*only\s|\s*all\s|\s*none\s|\s*both\s)/i; // 1. Statement, 2) Statement (but not "1. Only 1")


                    const isOptionLine = (line, position, totalLines) => {
                        if (LETTER_OPTION.test(line)) return true;
                        if (ROMAN_OPTION.test(line)) return true;
                        if (NUMBER_BRACKET.test(line)) return true; // [1], (1) style

                        // Bullet points are options ONLY if they're at the end
                        if (BULLET_OPTION.test(line)) return true;

                        return false;
                    };

                    const isNumberedStatement = (line) => {
                        return NUMBERED_STATEMENT.test(line) && !LETTER_OPTION.test(line) && !NUMBER_BRACKET.test(line);
                    };

                    // STEP 1: Scan from bottom-up to find the options zone
                    let optionsStartIndex = -1;
                    let consecutiveOptions = 0;
                    let lastOptionType = null;

                    for (let i = lines.length - 1; i >= 0; i--) {
                        const line = lines[i];

                        // Determine what type of marker this line has
                        let currentType = null;
                        if (LETTER_OPTION.test(line)) currentType = 'letter';
                        else if (ROMAN_OPTION.test(line)) currentType = 'roman';
                        else if (NUMBER_BRACKET.test(line)) currentType = 'number_bracket';
                        else if (BULLET_OPTION.test(line)) currentType = 'bullet';

                        if (currentType) {
                            // Line is an option
                            if (lastOptionType === null || lastOptionType === currentType) {
                                consecutiveOptions++;
                                optionsStartIndex = i;
                                lastOptionType = currentType;
                            } else {
                                // Different type - this might be a statement, not an option
                                if (consecutiveOptions >= 2) {
                                    break; // We have our options, stop here
                                } else {
                                    consecutiveOptions = 1;
                                    optionsStartIndex = i;
                                    lastOptionType = currentType;
                                }
                            }
                        } else {
                            // Line is NOT an option marker
                            if (consecutiveOptions >= 2) {
                                break;
                            } else if (consecutiveOptions === 1) {
                                // Only 1 option so far - might be a continuation or different format
                                if (isNumberedStatement(line)) {
                                    break;
                                }
                                // Otherwise, reset - single option line was probably a statement
                                consecutiveOptions = 0;
                                optionsStartIndex = -1;
                                lastOptionType = null;
                            }
                        }
                    }

                    // STEP 2: Split into Question and Options
                    let questionLines = [];
                    let optionLines = [];

                    if (optionsStartIndex > 0 && consecutiveOptions >= 2) {
                        questionLines = lines.slice(0, optionsStartIndex);
                        optionLines = lines.slice(optionsStartIndex);
                    } else {
                        // Fallback: No clear options zone detected via bottom-up scan
                        // Check for letter-based options anywhere (they're most reliable indicators)
                        const letterIndices = [];
                        lines.forEach((line, idx) => {
                            if (LETTER_OPTION.test(line)) letterIndices.push(idx);
                        });

                        if (letterIndices.length >= 2) {
                            // Letter options found - use first letter option as start of options zone
                            const firstLetter = letterIndices[0];
                            questionLines = lines.slice(0, firstLetter);
                            optionLines = lines.slice(firstLetter);
                        } else {
                            // Try bullet point strategy
                            const bulletIndices = [];
                            lines.forEach((line, idx) => {
                                if (BULLET_OPTION.test(line)) bulletIndices.push(idx);
                            });

                            if (bulletIndices.length >= 2) {
                                // Bullet points found - first bullet starts options
                                const firstBullet = bulletIndices[0];
                                questionLines = lines.slice(0, firstBullet);
                                optionLines = lines.slice(firstBullet);
                            } else {
                                // Super fallback: First line is question, rest are options
                                questionLines = [lines[0]];
                                optionLines = lines.slice(1);
                            }
                        }
                    }

                    // Any question data for building result?
                    if (questionLines.length === 0 || optionLines.length === 0) {
                        return null;
                    }

                    // STEP 3: Clean up and build the result
                    return this._finalizeBlock({
                        qLines: questionLines,
                        oLines: optionLines,
                        explanation: parsedExplanationLines.length > 0 ? parsedExplanationLines.join('<br>') : null,
                        correctAnswerLabel: parsedAnswerStr
                    });
                },


                _parseMcqChunk(text) {
                    const result = this._parseSingleMcq(text);
                    return result ? [result] : [];
                },


                _finalizeBlock(block) {
                    const STRIP_OPTION_MARKER = /^\s*(?:[\[\(]\s*[a-zA-Z0-9iIvVxX]+\s*[\]\)]\.?|[a-zA-Z][\.\)\-\:]|[a-eA-E]\s+|[\u2022\u25E6\u25AA\u25CF\u25CB\u2023•◦▪●○‣\-\*]|\d+[\.\)])\s*/;
                    const NUMBERED_STATEMENT = /^\s*\d+[\.\)]\s+(?!\s*only\s|\s*all\s|\s*none\s|\s*both\s)/i;

                    let qLines = [];
                    if (block.qLines) {
                        qLines = [...block.qLines];
                    } else if (block.question && typeof block.question === 'string') {
                        qLines = block.question.split(/<br>|\n/);
                    } else if (block.q && typeof block.q === 'string') {
                        qLines = block.q.split(/<br>|\n/);
                    }

                    // Filter out MCQ metadata/question numbers from the start
                    while (qLines.length > 0) {
                        const line = qLines[0].trim();
                        if (line.length === 0) {
                            qLines.shift();
                            continue;
                        }

                        // Is it a statement like "1. ..." or "2. ..."? If so, DO NOT STRIP.
                        if (NUMBERED_STATEMENT.test(line)) break;

                        // Is it a standard question number or prefix (e.g., "7.", "Question 1:", "MCQ:")
                        const isMetadata = /^(MCQ|Question|Q)?[\d\s\.:)]+$/i.test(line);
                        if (isMetadata) {
                            qLines.shift();
                            continue;
                        }

                        // Try stripping just the leading marker from the first line (e.g., "7. With reference...")
                        const leadingMarker = /^(MCQ|Question|Q)?\s*\d+[\.:)]\s*/i;
                        if (leadingMarker.test(line)) {
                            qLines[0] = line.replace(leadingMarker, '').trim();
                        }
                        break;
                    }

                    let cleanQ = qLines.join('<br>').trim();
                    const rawOpts = block.options || block.oLines || block.o || [];

                    const cleanOptions = rawOpts.map(o => {
                        if (typeof o !== 'string') return '';
                        return o.replace(STRIP_OPTION_MARKER, '').trim();
                    }).filter(o => o.length > 0);

                    // Need at least 2 options for a valid MCQ
                    if (cleanOptions.length < 2) {
                        // Try to salvage by splitting if there's only 1 "option" (might be comma-separated)
                        if (cleanOptions.length === 1 && cleanOptions[0].includes(',')) {
                            const split = cleanOptions[0].split(',').map(s => s.trim()).filter(s => s.length > 0);
                            if (split.length >= 2) {
                                return { question: cleanQ, options: split };
                            }
                        }
                        return null;
                    }

                    return {
                        question: cleanQ,
                        options: cleanOptions,
                        explanation: block.explanation,
                        correctAnswerLabel: block.correctAnswerLabel
                    };
                },

                icons: {
                    eyeOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`, eyeClosed: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
                    textView: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25H12" /></svg>`,

                    chevronUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
                    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
                    pen: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`, edit: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>`, done: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
                    category: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`, close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
                    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
                    cycle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M12.433 10.07C14.133 9.585 16 8.007 16 6c0-2.208-1.79-4-4-4s-4 1.792-4 4c0 1.397.646 2.622 1.657 3.313-.42.223-.79.482-1.12.768-.907.643-1.482 1.458-1.752 2.313-.27.856-.333 1.632-.234 2.298C3.666 15.453 5.135 16 6.729 16c1.595 0 3.067-.547 4.143-1.523.27-.855.334-1.631.235-2.298-.27-.855-.846-1.67-1.753-2.312a4.996 4.996 0 0 1-1.12-.768zM6 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm2.5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm2.5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm.5 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`,
                    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`,
                    list: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`,
                    table: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg>`,
                    accordion: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><path d="m15 14-3 3-3-3"/></svg>`,
                    image: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
                    tag: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 7.586 2H2zm1 5.586 7 7L15.586 9l-7-7H3v4.586z"/><path d="M5 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`,
                    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`, html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`, clearFormatting: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.646 4.646a.5.5 0 0 1 .708 0L14 6.293l1.646-1.647a.5.5 0 0 1 .708.708L14.707 7l1.647 1.646a.5.5 0 0 1-.708.708L14 7.707l-1.646 1.647a.5.5 0 0 1-.708-.708L13.293 7l-1.647-1.646a.5.5 0 0 1 0-.708z"/><path d="M2.5 0A2.5 2.5 0 0 0 0 2.5v11A2.5 2.5 0 0 0 2.5 16h6.086a2.5 2.5 0 0 0 1.768-.732l3.5-3.5a2.5 2.5 0 0 0 0-3.536l-3.5-3.5A2.5 2.5 0 0 0 8.586 2H2.5zm5.553 4.24a.5.5 0 0 1 .707 0l1.25 1.25a.5.5 0 0 1 0 .707L8.707 7.5l1.25 1.25a.5.5 0 0 1-.707.707L8 8.207 6.75 9.457a.5.5 0 0 1-.707-.707L7.293 7.5 6.043 6.25a.5.5 0 0 1 0-.707l1.25-1.25z"/></svg>`, save: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1-1H7.5a1 1 0 0 0-1 1H2zm3 2h4.5v2.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V2zm7 0v2.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V2h4zM3 14v-7h10v7H3z"/></svg>`, saveAndRead: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`,
                    expand: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 3H3v6M15 21h6v-6M9 21H3v-6"/></svg>`, compress: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3H5M16 3v3h3M8 21v-3H5M16 21v-3h3"/></svg>`,
                    zoomIn: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>`,
                    zoomOut: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" /></svg>`,
                    article: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.5 1h5a.5.5 0 0 1 .5.5v2h.5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5-.5h-6a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5h.5v-2a.5.5 0 0 1 .5-.5zM5 1.5v2h4v-2H5zm0 3v10.5h4V4.5H5z"/></svg>`, reset: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>`, plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>`, minus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/></svg>`, alignLeft: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z"/></svg>`, alignCenter: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>`, alignRight: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>`,
                    star: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>`,
                    starOutline: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.329-.313.158-.888-.283-.95l-4.898-.696L8.465.792a.5.5 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.5.5 0 0 0-.182-.389l-2.832-2.767 3.958-.564a.5.5 0 0 0 .398-.293L8 2.223l1.791 3.582a.5.5 0 0 0 .398.293l3.958.564-2.832 2.767a.5.5 0 0 0-.182.389l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/></svg>`,
                    caption: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4.414l.914.914A.5.5 0 0 0 7 13.5v-2.414l.914.914A.5.5 0 0 0 8 12.5h4a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M4.5 5.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zM4 8a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1H4z"/></svg>`,
                    theme: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>`,
                    pdf: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`,
                    hint: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-1.832 5.97 5.97 0 00.832-3.585 5.97 5.97 0 00-3.417-5.585 5.97 5.97 0 00-6.833 2.166" /></svg>`,
                    reversible: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>`,
                    actions: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"/></svg>`,
                    pdfExport: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2"></path><path d="M9 17h6"></path><path d="M13 13h2"></path></svg>`,
                    print: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,

                    present: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" ry="3"></rect><polygon points="10 9 10 15 15 12 10 9" fill="currentColor" stroke="none"></polygon></svg>`,
                    proPresent: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>`,
                    stop: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>`,
                    play: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>`,
                    pause: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>`,
                    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1 0 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105 0l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.31-.17a1.464 1.464 0 0 1 2.105-.872l-.1-.34c.413-1.4 2.397-1.4 2.81 0l.1.34a1.464 1.464 0 0 1 2.105.872l.31.17c1.283.698-2.686-.705-1.987-1.987l-.169-.311a1.464 1.464 0 0 1 0-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105 0l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.31.17a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>`,
                    zen: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 12.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zM12.5 0a.5.5 0 0 1 .5.5v2h-1V.5a.5.5 0 0 1 .5-.5zm-2 0a.5.5 0 0 1 .5.5v2h-1V.5a.5.5 0 0 1 .5-.5zm-2 0a.5.5 0 0 1 .5.5v2h-1V.5a.5.5 0 0 1 .5-.5zm-2 0a.5.5 0 0 1 .5.5v2h-1V.5a.5.5 0 0 1 .5-.5z"/><path fill-rule="evenodd" d="M.5 4a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5-.5h-14a.5.5 0 0 1-.5-.5v-8zM1 4.5v7h14v-7H1z"/></svg>`,
                    miniExpand: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 1A.5.5 0 0 1 2 0h4.5a.5.5 0 0 1 0 1H3v2.5a.5.5 0 0 1-1 0V1zm12 0a.5.5 0 0 1 .5-.5H15v2.5a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1 0-1zm0 12a.5.5 0 0 1 .5.5V15h-2.5a.5.5 0 0 1 0-1H14v-2.5a.5.5 0 0 1 1 0zM2 15v-2.5a.5.5 0 0 1 1 0V14h2.5a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5z"/></svg>`,
                    miniClose: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>`,
                    pomoCycle: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="M8 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-1a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/><path d="M8 4.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H7v2.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H8V4.5Z"/></svg>`,
                    pomoPlay: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/></svg>`,
                    bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>`,
                    mindmap: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 9V5"></path><circle cx="12" cy="3" r="2"></circle><path d="M14.5 13.5 18 16"></path><circle cx="19.5" cy="17.5" r="2"></circle><path d="M9.5 13.5 6 16"></path><circle cx="4.5" cy="17.5" r="2"></circle></svg>`

                },


                hapticFeedback(intensity = 'light') {
                    if ('vibrate' in navigator) {
                        const pattern = intensity === 'heavy' ? [100] : [50];
                        navigator.vibrate(pattern);
                    }
                },

                powerQuotes: [
                    "Every master was once a beginner.", "The secret of getting ahead is getting started.",
                    "Your only limit is your mind.", "Push yourself, because no one else is going to do it for you.",
                    "Great things never come from comfort zones.", "Dream it. Wish it. Do it.",
                    "Success doesn’t just find you. You have to go out and get it.", "The harder you work, the luckier you get.",
                    "Turn your can'ts into cans and your dreams into plans.", "Don't stop until you're proud."
                ],
                getPowerQuote() {
                    return this.powerQuotes[Math.floor(Math.random() * this.powerQuotes.length)];
                },
                typewriter(element, text, speed = 28) {
                    if (!element) return;
                    element.innerHTML = '<span class="typewriter-cursor">|</span>';
                    let i = 0;
                    // Slight randomness makes it feel like real quick typing
                    const typing = () => {
                        if (i < text.length) {
                            element.innerHTML = text.substring(0, i + 1) + '<span class="typewriter-cursor">|</span>';
                            i++;
                            const jitter = speed + (Math.random() * 14 - 7); // ±7ms jitter
                            setTimeout(typing, Math.max(12, jitter));
                        } else {
                            // Remove cursor when done
                            element.innerHTML = text;
                        }
                    };
                    setTimeout(typing, speed);
                },

                wittyDeveloperMessages: [
                    "Your support is my superpower!", "Fueling this app requires a lot of coffee.",
                    "Developer is in Debt, He needs Help.", "Help me build the best note app in the universe!",
                    "Developer needs some coffee to survive, could you help?", "I'm the solo dev behind NoteKash!",
                    "Go Premium, and I'll name my next houseplant after you."
                ],

                maybeLaterMessages: [
                    "Maybe Later", "I'm good for now", "Will help you Later",
                    "Continue with Spark", "No Rush, Thanks", "I will Stay Free",
                    "Not Today Dev", "Let me Study", "I am also Poor", "Maybe Soon",
                    "Later, I Promise", "Keep me Free", "Will give you Nothing",
                    "Let me Focus", "Let me Try First", "Will Upgrade Later",
                    "I am on Budget", "Not that Valuable", "Happy as it is", "Will donate later"
                ],

                getRandomMessage(messageArray) {
                    if (!messageArray || messageArray.length === 0) return '';
                    return messageArray[Math.floor(Math.random() * messageArray.length)];
                },

                getTierBadgeHTML(tierName, size = 80) {
                    const tiers = {
                        Spark: {
                            tierClass: 'spark',
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>`
                        },
                        Bronze: {
                            tierClass: 'bronze',
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><g class="orbiting-dots"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></g></svg>`
                        },
                        Silver: {
                            tierClass: 'silver',
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
                        },
                        Gold: {
                            tierClass: 'gold',
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
                        },
                        Diamond: {
                            tierClass: 'diamond',
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.49,6.51A2.12,2.12,0,0,0,16.88,6L12,2,7.13,6a2.12,2.12,0,0,0-2.62.51L2,11.84l10,10,10-10Z"/></svg>`
                        }
                    };
                    const tier = tiers[tierName] || tiers.Spark;
                    const sizeStyle = `width: ${size}px; height: ${size}px;`;
                    return `<div class="badge-icon astral ${tier.tierClass}" style="${sizeStyle}"><div class="inner-icon">${tier.icon}</div></div>`;
                },

                getAvatarSVG(avatarId) {
                    const avatars = [
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e0f2fe"/><circle cx="50" cy="54" r="22" fill="#fed7aa"/><path d="M50 32c-12 0-16 6-16 14v4h32v-4c0-8-4-14-16-14z" fill="#1e293b"/><circle cx="43" cy="54" r="5" fill="none" stroke="#0f172a" stroke-width="2"/><circle cx="57" cy="54" r="5" fill="none" stroke="#0f172a" stroke-width="2"/><path d="M48 54h4" stroke="#0f172a" stroke-width="2"/><circle cx="43" cy="54" r="1.5" fill="#0f172a"/><circle cx="57" cy="54" r="1.5" fill="#0f172a"/><path d="M47 64q3 2 6 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 88c2-12 10-18 20-18s18 6 20 18z" fill="#3b82f6"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ffedd5"/><circle cx="50" cy="54" r="22" fill="#c2410c"/><path d="M34 42c0-8 6-12 16-12s16 4 16 12l2 4c0 4-4 4-4 4s-4-6-14-6-14 6-14 6-4 0-4-4z" fill="#1e293b"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#f97316"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#dcfce7"/><circle cx="50" cy="54" r="22" fill="#fdba74"/><path d="M32 38c6-8 16-8 22-8 10 0 14 6 14 12v4H32z" fill="#475569"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#10b981"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#f3e8ff"/><circle cx="50" cy="52" r="22" fill="#fed7aa"/><path d="M32 38c4-8 12-10 18-10s18 4 18 12v2H32z" fill="#0f172a"/><circle cx="42" cy="50" r="2" fill="#0f172a"/><circle cx="58" cy="50" r="2" fill="#0f172a"/><path d="M42 60c2 4 14 4 16 0" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#8b5cf6"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fef9c3"/><circle cx="50" cy="54" r="22" fill="#ffedd5"/><path d="M30 40l6-10 8 4 6-10 6 10 8-4 6 10v6H30z" fill="#334155"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#eab308"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fee2e2"/><circle cx="50" cy="56" r="22" fill="#fed7aa"/><path d="M32 44c0-10 6-14 18-14s18 4 18 14z" fill="#ef4444"/><rect x="30" y="42" width="40" height="6" rx="3" fill="#dc2626"/><circle cx="42" cy="54" r="2" fill="#0f172a"/><circle cx="58" cy="54" r="2" fill="#0f172a"/><path d="M46 64q4 2 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#4b5563"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fce7f3"/><path d="M28 32c6-10 24-8 32 0 8 10 12 28 12 36s-8 6-12 0c-4-6-10-14-10-14s-10 16-16 12S24 40 28 32z" fill="#db2777"/><circle cx="50" cy="54" r="21" fill="#ffe4e6"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#ec4899"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ecfeff"/><path d="M26 38c4-12 20-12 30-10s22 4 22 18v16c0 6-6 6-6 6s-6-14-16-14S30 60 26 38z" fill="#0f172a"/><circle cx="50" cy="54" r="22" fill="#fed7aa"/><circle cx="42" cy="52" r="5" fill="none" stroke="#0f172a" stroke-width="2"/><circle cx="58" cy="52" r="5" fill="none" stroke="#0f172a" stroke-width="2"/><path d="M47 52h6" stroke="#0f172a" stroke-width="2"/><circle cx="42" cy="52" r="1.5" fill="#0f172a"/><circle cx="58" cy="52" r="1.5" fill="#0f172a"/><path d="M46 63q4 3 8 0" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#06b6d4"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ffedd5"/><circle cx="70" cy="36" r="12" fill="#ea580c"/><circle cx="50" cy="54" r="22" fill="#fdba74"/><path d="M28 34c4-8 16-10 26-10 12 0 18 10 18 18v8H28z" fill="#ea580c"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#f97316"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fef9c3"/><circle cx="36" cy="38" r="12" fill="#1e293b"/><circle cx="64" cy="38" r="12" fill="#1e293b"/><circle cx="50" cy="32" r="14" fill="#1e293b"/><circle cx="50" cy="54" r="22" fill="#7c2d12"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#eab308"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#f0fdfa"/><circle cx="26" cy="56" r="8" fill="#0d9488"/><circle cx="74" cy="56" r="8" fill="#0d9488"/><circle cx="50" cy="54" r="22" fill="#fed7aa"/><path d="M30 36c4-10 16-10 24-10s18 6 18 14H28z" fill="#0d9488"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#14b8a6"/></svg>`,
                        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#eff6ff"/><path d="M24 36c2-12 16-14 26-14s24 4 24 16v32c0 6-4 6-4 6s-6-18-20-18S24 72 24 64V36z" fill="#1e293b"/><circle cx="36" cy="28" r="5" fill="#f43f5e"/><circle cx="50" cy="54" r="22" fill="#ffedd5"/><circle cx="42" cy="52" r="2" fill="#0f172a"/><circle cx="58" cy="52" r="2" fill="#0f172a"/><path d="M46 62q4 3 8 0" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M28 88c2-12 10-18 20-18s18 6 20 18z" fill="#3b82f6"/></svg>`
                    ];
                    const idx = (avatarId && avatarId >= 1 && avatarId <= 12) ? avatarId - 1 : 0;
                    return avatars[idx];
                },

                getCommandKey() { return navigator.platform.toUpperCase().includes('MAC') ? 'Cmd' : 'Ctrl'; },
                getCategoryDisplayName(originalName) {
                    if (!originalName) return 'General'; // Failsafe
                    const catObj = App.settings.get('userCategories').find(c => c.name === originalName);
                    // Return the display name if it exists and is not empty, otherwise fall back to the original name.
                    return catObj?.displayName || originalName;
                },

                getOriginalCategoryName(displayName) {
                    if (!displayName) return 'General';
                    const catObj = App.settings.get('userCategories').find(c => c.displayName === displayName);
                    // If we find a match by display name, return its true, stable name.
                    if (catObj) {
                        return catObj.name;
                    }
                    // Fallback for cases where the display name is the same as the original name.
                    return displayName;
                },


                getCategoryColor(colorIndex) {
                    return `var(--cat-color-${colorIndex}-bg)`;
                },
                getCategoryColorCount() {
                    return 20;
                },

                _colorRgbCache: new Map(),

                colorToRgb(color) {
                    if (!color) return null;
                    if (this._colorRgbCache && this._colorRgbCache.has(color)) {
                        return this._colorRgbCache.get(color);
                    }

                    // Fast path: hex colors #fff, #ffffff, #ffffffff
                    if (color.startsWith('#')) {
                        let hex = color.slice(1);
                        if (hex.length === 3) {
                            hex = hex.split('').map(c => c + c).join('');
                        }
                        if (hex.length >= 6) {
                            const r = parseInt(hex.slice(0, 2), 16);
                            const g = parseInt(hex.slice(2, 4), 16);
                            const b = parseInt(hex.slice(4, 6), 16);
                            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                                const res = [r, g, b];
                                if (!this._colorRgbCache) this._colorRgbCache = new Map();
                                this._colorRgbCache.set(color, res);
                                return res;
                            }
                        }
                    }

                    // Fast path: rgb/rgba strings e.g. "rgb(255, 69, 0)"
                    if (color.startsWith('rgb')) {
                        const match = color.match(/\d+/g);
                        if (match && match.length >= 3) {
                            const res = match.slice(0, 3).map(Number);
                            if (!this._colorRgbCache) this._colorRgbCache = new Map();
                            this._colorRgbCache.set(color, res);
                            return res;
                        }
                    }

                    // Fallback: computed style without layout reflow + caching
                    try {
                        const tempDiv = document.createElement('div');
                        tempDiv.style.color = color;
                        tempDiv.style.display = 'none';
                        document.body.appendChild(tempDiv);
                        const rgbColor = window.getComputedStyle(tempDiv).color;
                        document.body.removeChild(tempDiv);
                        const match = rgbColor.match(/\d+/g);
                        const res = match ? match.map(Number) : null;
                        if (res) {
                            if (!this._colorRgbCache) this._colorRgbCache = new Map();
                            this._colorRgbCache.set(color, res);
                        }
                        return res;
                    } catch (e) {
                        return null;
                    }
                },
                async requestDurableStorage() {
                    if (navigator.storage && navigator.storage.persist) {
                        try { if (!(await navigator.storage.persisted())) { await navigator.storage.persist(); } }
                        catch (e) { console.warn("Could not request persistent storage:", e); }
                    }
                },
                downloadBlob(blob, filename) {
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
                },

                insertGuardianBlock(html) {
                    document.execCommand('insertHTML', false, html + '<p><br></p>');
                    App.state.isArticleDirty = true;
                },

                ensureCaretVisible() {
                    if (App.state.currentMode !== 'write') return;
                    const controls = document.getElementById('article-controls');
                    if (!controls) return;

                    const sel = window.getSelection();
                    if (!sel || sel.rangeCount === 0) return;

                    const r = sel.getRangeAt(0).cloneRange();
                    r.collapse(false);
                    const rect = (r.getClientRects && r.getClientRects()[0]) || (r.getBoundingClientRect && r.getBoundingClientRect());
                    if (!rect) return;

                    const toolbarTop = controls.getBoundingClientRect().top;
                    const margin = 12;
                    if (rect.bottom <= toolbarTop - margin) return;

                    const delta = rect.bottom - (toolbarTop - margin);
                    const main = document.querySelector('main');
                    if (main && main.scrollHeight > main.clientHeight) main.scrollTop += delta;
                    else window.scrollBy(0, delta);
                },

                extractSnippets(source = null, types = ['highlight'], returnHtml = false) {
                    const sources = source ? [source] : App.state.articles.map(a => ({ content: a.content, id: a.id }));
                    const results = [];
                    
                    // Use HTML5 inert <template> element so embedded images and media NEVER trigger network fetches (preventing 404s/ERR_INVALID_URL)
                    const hasTemplate = typeof document !== 'undefined' && typeof document.createElement === 'function';
                    const templateEl = hasTemplate ? document.createElement('template') : null;
                    const isTemplateSupported = !!(templateEl && templateEl.content);
                    const container = isTemplateSupported ? templateEl : (hasTemplate ? document.createElement('div') : null);
                    if (!container) return results;

                    const selectors = {
                        cloze: '.cloze-flashcard',
                        highlight: '.highlight-1, .highlight-2, .highlight-3, .highlight-4, .highlight-5, .highlight-6',
                        mindmap: '.mindmap-node',
                        image: '.image-container.highlighted-image',
                        textile: '.nk-text-tile',
                        mcq: '.nk-mcq-block',
                        accordion: '.nk-accordion',
                        blocks: '.nk-timeline-block, .chart-container, .nk-video-embed',
                        tag: '.rendered-tag'
                    };

                    sources.forEach(src => {
                        if (!src.content) return;
                        let final = App.util.renderClozeForDisplay(App.util.parseShortcuts(src.content));
                        container.innerHTML = App.util.sanitizeHTML(final);
                        const queryRoot = isTemplateSupported ? container.content : container;

                        let selectorsToQuery = [];
                        if (types.includes('highlight')) {
                            selectorsToQuery.push(selectors.highlight, selectors.image, selectors.textile);
                        }
                        if (types.includes('mindmap')) {
                            selectorsToQuery.push(selectors.mindmap, selectors.image);
                        }
                        if (types.includes('mcq')) {
                            selectorsToQuery.push(selectors.mcq);
                        }
                        if (types.includes('blocks')) {
                            selectorsToQuery.push(selectors.blocks, selectors.accordion);
                        }

                        if (types.includes('tag')) {
                            selectorsToQuery.push(selectors.tag);
                        }
                        if (types.includes('cloze')) {
                            selectorsToQuery.push(selectors.cloze);
                        }

                        const masterSelector = selectorsToQuery.join(', ');
                        if (!masterSelector) return;

                        queryRoot.querySelectorAll(masterSelector).forEach((node, index) => {
                            let snippetObject = null;

                            if (node.matches(selectors.tag)) {
                                const snippetId = node.id || `tag-snip-${src.id}-${index}`;
                                if (!node.id) node.id = snippetId;

                                const parentBlock = node.closest('p, ul, ol, blockquote, h1, h2, h3, h4, h5, h6, li');
                                if (parentBlock) {
                                    snippetObject = {
                                        id: snippetId,
                                        html: parentBlock.innerHTML, // Use the parent's full HTML for display
                                        text: (parentBlock.textContent || "").trim(), // Use the parent's text for searching
                                        articleId: src.id,
                                        type: 'tag-snippet'
                                    };
                                }
                            }

                            else if (node.matches(selectors.textile)) {
                                const snippetId = node.id || `tile-${src.id}-${index}`;
                                if (!node.id) node.id = snippetId;
                                snippetObject = { id: snippetId, html: node.outerHTML, text: (node.querySelector('.nk-text-tile-content')?.textContent || "").trim(), articleId: src.id, type: 'snippet' };
                            }
                            else if (node.matches(selectors.image)) {
                                const img = node.querySelector('img');
                                if (img) {
                                    const snippetId = node.id || `img-${src.id}-${index}`;
                                    const caption = node.querySelector('.image-caption');
                                    snippetObject = { id: snippetId, isImage: true, src: img.src, text: caption ? caption.textContent.trim() : '', html: node.outerHTML, articleId: src.id, type: 'snippet' };
                                }
                            }
                            else if (node.matches(selectors.mcq)) {
                                const questionEl = node.querySelector('.nk-mcq-question');
                                if (questionEl) snippetObject = { id: `mcq-${src.id}-${index}`, html: node.outerHTML, text: (questionEl.textContent || "").trim(), articleId: src.id, type: 'mcq' };
                            }
                            else if (node.matches(selectors.accordion)) {
                                const titleEl = node.querySelector('.nk-accordion-title');
                                if (titleEl) snippetObject = { id: `accordion-${src.id}-${index}`, html: node.outerHTML, text: (titleEl.textContent || "").trim(), articleId: src.id, type: 'accordion' };
                            }
                            else if (node.matches(selectors.blocks)) {
                                if (node.matches('.nk-timeline-block')) {
                                    const firstTitle = node.querySelector('.nk-timeline-title');
                                    snippetObject = { id: `timeline-${src.id}-${index}`, html: node.outerHTML, text: `Timeline: ${firstTitle ? firstTitle.textContent.trim() : 'Event'}`, articleId: src.id, type: 'timeline' };
                                } else if (node.matches('.chart-container')) {
                                    const canvas = node.querySelector('canvas');
                                    if (canvas && canvas.dataset.chartConfig) snippetObject = { id: `chart-${src.id}-${index}`, html: node.outerHTML, text: `Chart Data`, articleId: src.id, type: 'chart' };
                                } else if (node.matches('.nk-video-embed')) {
                                    snippetObject = { id: `video-${src.id}-${index}`, html: node.outerHTML, text: `Video Embed`, articleId: src.id, type: 'video' };
                                }
                            }
                            else if (node.matches(selectors.mindmap)) {
                                const snippetId = node.id || `mindmap-${src.id}-${index}`;
                                snippetObject = { id: snippetId, html: node.outerHTML, text: (node.textContent || "").trim(), articleId: src.id, type: 'mindmap', level: parseInt(node.getAttribute('data-level')) || 1 };
                            }
                            else if (node.matches(selectors.highlight)) {
                                const snippetId = node.id || `snip-${src.id}-${index}`;
                                snippetObject = { id: snippetId, html: node.outerHTML, text: (node.textContent || "").trim(), articleId: src.id, type: 'snippet' };
                            }

                            if (snippetObject) {
                                results.push(snippetObject);
                            }
                        });
                    });
                    return results.filter(s => (s.text && s.text.trim()) || s.isImage || s.type === 'accordion' || s.type === 'video' || s.type === 'timeline' || s.type === 'chart');

                },


                unwrapNode(node) {
                    const p = node.parentNode; if (!p) return;
                    while (node.firstChild) p.insertBefore(node.firstChild, node);
                    try { p.removeChild(node); } catch (e) { }
                },
                fuzzySearch(query, items, key) {
                    if (!query || !query.trim()) return items;
                    if (!items || items.length === 0) return [];
                    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
                    return items.filter(item => {
                        if (!item) return false;

                        let searchableText = '';
                        if (key === 'article') {
                            const title = item.title || '';
                            const tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
                            const content = item.content || '';
                            searchableText = `${title} ${tags} ${content}`;
                        } else if (key === 'flashcard') {
                            if (item.type === 'mcq') {
                                const optionsText = (item.options || []).map(o => o.text).join(' ');
                                searchableText = `${item.question || ''} ${optionsText} ${item.explanation || ''}`;
                            } else { // For Cloze and Collapsible cards
                                searchableText = item.fullText || `${item.frontText || ''} ${item.backText || ''}`;
                            }
                        }
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = searchableText;
                        const cleanText = (tempDiv.textContent || tempDiv.innerText || "").toLowerCase();
                        return searchTerms.every(term => cleanText.includes(term));
                    });
                },
                // --- FIX: Safe Regex with Negative Lookahead to prevent runaway matching ---
                renderClozeForDisplay(text) {
                    if (!text) return '';
                    // Protect HTML tags (especially images and data URLs) from cloze/math regexes
                    const htmlTokens = [];
                    const tagRegex = /<\/?[\w:-]+(?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>|<!--[\s\S]*?-->/g;
                    const maskedText = text.replace(tagRegex, (match) => {
                        htmlTokens.push(match);
                        return `\uE000${htmlTokens.length - 1}\uE000`;
                    });
                    const protectedMath = App.util.protectMathSegments(maskedText);
                    // First restore Mind Map nodes so they are preserved
                    let processed = protectedMath.text.replace(/\{\{m(\d+)::(.*?)\}\}/g, (match, level, content) => { return `<span class="mindmap-node" data-level="${level}" id="snip-${App.util.cyrb53(level + content)}">${content}</span>`; });
                    // Accept the occasional extra-brace variant users paste/type around cloze cards.
                    processed = processed.replace(/\{\{\{c\d+::((?:(?!\{\{\{?c\d+::)[\s\S])*?)\}\}\}/g, '<span class="cloze-flashcard">$1</span>');
                    // Then parse Cloze (Matches {{c1::...}} but stops if it sees another {{c inside)
                    processed = processed.replace(/{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g, '<span class="cloze-flashcard">$1</span>');
                    let restored = App.util.restoreMathSegments(processed, protectedMath.tokens);
                    return restored.replace(/\uE000(\d+)\uE000/g, (match, index) => htmlTokens[parseInt(index, 10)] ?? match);
                },

                normalizeRenderedClozeToTokens(text) {
                    if (!text) return '';
                    let clozeCounter = 0;
                    return text.replace(
                        /<span\b[^>]*\bclass=(["'])[^"']*\bcloze-flashcard\b[^"']*\1[^>]*>([\s\S]*?)<\/span>/gi,
                        (match, quote, content) => `{{c${++clozeCounter}::${content}}}`
                    );
                },

                hashString(str) {
                    let hash = 5381;
                    for (let i = 0; i < str.length; i++) {
                        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
                    }
                    return hash.toString();
                },

                parseShortcuts(text) {
                    if (!text) return '';

                    // --- FIX: Robust quote-aware protection of HTML tags (especially data:image URLs) ---
                    const tokens = [];
                    const tagRegex = /<\/?[\w:-]+(?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>|<!--[\s\S]*?-->/g;
                    const maskedText = text.replace(tagRegex, (match) => {
                        tokens.push(match);
                        return `\uE000${tokens.length - 1}\uE000`;
                    });
                    const protectedMath = App.util.protectMathSegments(maskedText);

                    const createSnippetId = () => `snip-${crypto.randomUUID().slice(0, 12)}`;
                    let processedHtml = protectedMath.text
                        .replace(/^\s*>\s*(.*)/gm, '<blockquote>$1</blockquote>')
                        .replace(/^\s*---\s*$/gm, '<hr>')
                        .replace(/\*\*(.*?)\*\*/g, '<i>$1</i>').replace(/\*([^*]+)\*/g, '<b>$1</b>')

                        .replace(/__(.*?)__/g, '<span class="text-underline">$1</span>').replace(/~~(.*?)~~/g, '<del>$1</del>')
                        .replace(/==(.*?)==g/g, `<span class="highlight-2" id="${createSnippetId()}">$1</span>`).replace(/==(.*?)==b/g, `<span class="highlight-3" id="${createSnippetId()}">$1</span>`)
                        .replace(/==(.*?)==r/g, `<span class="highlight-4" id="${createSnippetId()}">$1</span>`).replace(/==(.*?)==p/g, `<span class="highlight-5" id="${createSnippetId()}">$1</span>`)
                        .replace(/==(.*?)==c/g, `<span class="highlight-6" id="${createSnippetId()}">$1</span>`).replace(/==(.*?)==m/g, `<span class="highlight-7" id="${createSnippetId()}">$1</span>`).replace(/==(.*?)==/g, `<span class="highlight-1" id="${createSnippetId()}">$1</span>`)
                        .replace(/::(.*?)_r::/g, `<span class="text-red" id="${createSnippetId()}">$1</span>`).replace(/::(.*?)_g::/g, `<span class="text-green" id="${createSnippetId()}">$1</span>`)
                        .replace(/::(.*?)_b::/g, `<span class="text-blue" id="${createSnippetId()}">$1</span>`).replace(/::(.*?)_m::/g, `<span class="text-magenta" id="${createSnippetId()}">$1</span>`);

                    processedHtml = App.util.restoreMathSegments(processedHtml, protectedMath.tokens);
                    // Restore tags
                    processedHtml = processedHtml.replace(/\uE000(\d+)\uE000/g, (match, index) => tokens[parseInt(index, 10)] ?? match);

                    processedHtml = App.contentTools.convertContentSyntax(processedHtml);
                    return processedHtml;
                },



                cyrb53(str, seed = 0) {
                    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
                    for (let i = 0, ch; i < str.length; i++) {
                        ch = str.charCodeAt(i);
                        h1 = Math.imul(h1 ^ ch, 2654435761);
                        h2 = Math.imul(h2 ^ ch, 1597334677);
                    }
                    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
                    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
                    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
                },

                // --- FIX: Robust parsing with safety checks and unique IDs ---
                extractFlashcards(html, articleId, category, existing) {
                    const isPremium = App.license.isPremium();
                    const totalFlashcards = isPremium ? 0 : this.getAllFlashcards().length;
                    const flashcardLimit = App.config.sparkTierLimit;
                    let canCreateMore = isPremium || totalFlashcards < flashcardLimit;
                    let limitReachedMessageShown = false;

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = App.util.normalizeRenderedClozeToTokens(html);
                    const newCards = {};

                    const checkAndShowLimitMessage = () => {
                        if (!canCreateMore && !limitReachedMessageShown) {
                            App.ui.showAscensionModal();
                            App.ui.showToast(`Flashcard limit of ${flashcardLimit} reached.`, 'warning');
                            limitReachedMessageShown = true;
                        }
                    };

                    const addEnhancedProperties = (existingCard) => ({
                        easeFactor: existingCard?.easeFactor || 2.5,
                        lapses: existingCard?.lapses || 0,
                    });

                    const safeClozeRegex = /{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g;


                    // FIXED: Added 'div' and 'span' to selectors for robustness, with duplicate check
                    tempDiv.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, pre, div, span').forEach(p => {
                        if ((p.tagName === 'DIV' || p.tagName === 'SPAN') && p.querySelector('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, pre')) return;

                        if (p.tagName === 'SPAN' && p.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, pre, div')) {

                        }

                        if (p.innerHTML.includes('{{c')) {
                            const fullText = p.innerHTML;


                            const normalizedText = fullText.replace(/\s+/g, ' ').trim();
                            const cardId = `chash_${this.cyrb53(normalizedText)}`;

                            const existingCard = existing[cardId] || Object.values(existing).find(c => c.fullText === fullText);

                            if (fullText.match(safeClozeRegex)) {
                                if (existingCard || canCreateMore) {
                                    newCards[cardId] = {
                                        id: cardId, type: 'cloze', articleId, category, fullText,
                                        rating: existingCard?.rating || null, reviewCount: existingCard?.reviewCount || 0,
                                        interval: existingCard?.interval || 0, lastReviewed: existingCard?.lastReviewed || null,
                                        nextReviewDue: existingCard?.nextReviewDue || null, createdAt: existingCard?.createdAt || new Date().toISOString(),
                                        reviewHistory: existingCard?.reviewHistory || [],
                                        ...addEnhancedProperties(existingCard)
                                    };
                                    if (!existingCard) canCreateMore = isPremium || (totalFlashcards + Object.keys(newCards).length) < flashcardLimit;
                                } else { checkAndShowLimitMessage(); }
                            }
                        }
                    });

                    tempDiv.querySelectorAll('.nk-accordion').forEach(cardEl => {
                        const frontEl = cardEl.querySelector('.nk-accordion-title');
                        const backEl = cardEl.querySelector('.nk-accordion-content');
                        const hintEl = cardEl.querySelector('.nk-accordion-hint-content');
                        if (!frontEl || !backEl) return;

                        const frontText = frontEl.innerHTML.trim();
                        const backText = backEl.innerHTML.trim();
                        const hintText = hintEl ? hintEl.innerHTML.trim() : null;
                        const isReversible = cardEl.dataset.reversible === 'true';
                        const cardId = `coll_${this.cyrb53(frontText + backText)}`;

                        if (cardId && frontEl && backEl) {
                            const isFrontEmpty = frontText === '' || frontText === '<p><br></p>'; const isBackEmpty = backText === '' || backText === '<p><br></p>';
                            if (isFrontEmpty || isBackEmpty) return;

                            const existingCard = existing[cardId];
                            const cardData = {
                                type: 'collapsible', articleId, category, rating: existingCard?.rating || null,
                                reviewCount: existingCard?.reviewCount || 0, interval: existingCard?.interval || 0,
                                lastReviewed: existingCard?.lastReviewed || null, nextReviewDue: existingCard?.nextReviewDue || null,
                                createdAt: existingCard?.createdAt || new Date().toISOString(), reviewHistory: existingCard?.reviewHistory || [],
                                ...addEnhancedProperties(existingCard)
                            };
                            if (hintText) cardData.hint = hintText;

                            if (existingCard || canCreateMore) {
                                newCards[cardId] = { ...cardData, id: cardId, frontText, backText, isReversed: false };
                                if (!existingCard) canCreateMore = isPremium || (totalFlashcards + Object.keys(newCards).length) < flashcardLimit;
                            } else { checkAndShowLimitMessage(); }

                            if (isReversible) {
                                const reversedCardId = `${cardId}_rev`;
                                const existingReversedCard = existing[reversedCardId];
                                if (existingReversedCard || canCreateMore) {
                                    newCards[reversedCardId] = {
                                        ...cardData,
                                        id: reversedCardId, frontText: backText, backText: frontText, isReversed: true,
                                        rating: existingReversedCard?.rating || null, reviewCount: existingReversedCard?.reviewCount || 0,
                                        interval: existingReversedCard?.interval || 0, lastReviewed: existingReversedCard?.lastReviewed || null,
                                        nextReviewDue: existingReversedCard?.nextReviewDue || null, createdAt: existingReversedCard?.createdAt || new Date().toISOString(),
                                        reviewHistory: existingReversedCard?.reviewHistory || [],
                                        ...addEnhancedProperties(existingReversedCard)
                                    };
                                    if (!existingReversedCard) canCreateMore = isPremium || (totalFlashcards + Object.keys(newCards).length) < flashcardLimit;
                                } else { checkAndShowLimitMessage(); }
                            }
                        }
                    });

                    tempDiv.querySelectorAll('.nk-mcq-block').forEach(mcqBlock => {
                        const questionEl = mcqBlock.querySelector('.nk-mcq-question');
                        if (!questionEl || !questionEl.textContent.trim()) return;

                        const questionText = questionEl.innerHTML.trim();
                        const options = Array.from(mcqBlock.querySelectorAll('.nk-mcq-option')).map(opt => ({
                            text: opt.querySelector('.nk-mcq-option-text').innerHTML.trim(),
                            isCorrect: opt.dataset.isCorrect === 'true'
                        })).filter(opt => opt.text);

                        const explanationEl = mcqBlock.querySelector('.nk-mcq-explanation');
                        let explanationText = null;
                        if (explanationEl && explanationEl.textContent.trim()) {
                            explanationText = explanationEl.innerHTML;
                        }
                        if (options.length < 2 || !options.some(opt => opt.isCorrect)) return;

                        const allOptionsText = options.map(o => o.text).join('');
                        const cardId = `mcq_${this.cyrb53(questionText + allOptionsText)}`;

                        const existingCard = existing[cardId];
                        if (existingCard || canCreateMore) {
                            newCards[cardId] = {
                                id: cardId, type: 'mcq', articleId, category,
                                question: questionText, options: options, explanation: explanationText,
                                rating: existingCard?.rating || null, reviewCount: existingCard?.reviewCount || 0,
                                interval: existingCard?.interval || 0, lastReviewed: existingCard?.lastReviewed || null,
                                nextReviewDue: existingCard?.nextReviewDue || null, createdAt: existingCard?.createdAt || new Date().toISOString(),
                                reviewHistory: existingCard?.reviewHistory || [],
                                ...addEnhancedProperties(existingCard)
                            };
                            if (!existingCard) canCreateMore = isPremium || (totalFlashcards + Object.keys(newCards).length) < flashcardLimit;
                        } else { checkAndShowLimitMessage(); }
                    });

                    // Extract Image Occlusion Flashcards (Visual Flashcards from Whiteboard)
                    tempDiv.querySelectorAll('.nk-visual-flashcard.wb-embed').forEach(vfc => {
                        const frontImg = vfc.querySelector('.nk-vfc-front img');
                        const backImg = vfc.querySelector('.nk-vfc-back img');
                        const wbId = vfc.dataset.wbId;
                        if (!frontImg || !backImg || !wbId) return;

                        const cardId = `vfc_${wbId}`;
                        const existingCard = existing[cardId];

                        if (existingCard || canCreateMore) {
                            newCards[cardId] = {
                                id: cardId,
                                type: 'image-occlusion',
                                articleId,
                                category,
                                frontImage: frontImg.src,
                                backImage: backImg.src,
                                wbId: wbId,
                                rating: existingCard?.rating || null,
                                reviewCount: existingCard?.reviewCount || 0,
                                interval: existingCard?.interval || 0,
                                lastReviewed: existingCard?.lastReviewed || null,
                                nextReviewDue: existingCard?.nextReviewDue || null,
                                createdAt: existingCard?.createdAt || new Date().toISOString(),
                                reviewHistory: existingCard?.reviewHistory || [],
                                ...addEnhancedProperties(existingCard)
                            };
                            if (!existingCard) canCreateMore = isPremium || (totalFlashcards + Object.keys(newCards).length) < flashcardLimit;
                        } else { checkAndShowLimitMessage(); }
                    });

                    return newCards;
                },

                getAllFlashcards() { return App.state.articles.flatMap(a => (a.flashcards ? Object.values(a.flashcards) : [])); },

                getAllTagsWithData() {
                    const tagMap = new Map();
                    App.state.articles.forEach(article => {
                        if (article.tags && article.tags.length > 0) {
                            const createdAtDate = new Date(article.createdAt);
                            const updatedAtDate = new Date(article.updatedAt);
                            article.tags.forEach(tag => {
                                if (!tagMap.has(tag)) {
                                    tagMap.set(tag, { tag: tag, firstUsed: createdAtDate, lastUsed: updatedAtDate });
                                } else {
                                    const existing = tagMap.get(tag);
                                    if (createdAtDate < existing.firstUsed) existing.firstUsed = createdAtDate;
                                    if (updatedAtDate > existing.lastUsed) existing.lastUsed = updatedAtDate;
                                }
                            });
                        }
                    });
                    return Array.from(tagMap.values());
                },

                getSortedFlashcardsForDisplay(searchTerm = '') {
                    let cards = this.getAllFlashcards();
                    let currentSearchTerm = searchTerm.trim();

                    // NEW: Check for Rating filter
                    const ratingMap = { '0': null, '1': 'Easy', '2': 'Good', '3': 'Hold', '4': 'Hard', '5': 'Again' };
                    const ratingMatch = currentSearchTerm.match(/^([0-5])\s*(.*)/);

                    if (ratingMatch) {
                        const ratingKey = ratingMatch[1];
                        const ratingFilter = ratingMap[ratingKey];
                        currentSearchTerm = ratingMatch[2].trim();
                        cards = cards.filter(c => c.rating === ratingFilter);
                    }

                    const category = App.settings.get('flashcardCategory') || 'All';
                    const sortBy = App.settings.get('flashcardSortBy');
                    if (category !== 'All') { cards = cards.filter(fc => fc.category === category); }
                    if (currentSearchTerm) { cards = App.util.fuzzySearch(currentSearchTerm, cards, 'flashcard'); }

                    switch (sortBy) {
                        case 'mcq':
                            cards = cards.filter(c => c.type === 'mcq');
                            cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Default sort for MCQs is newest first
                            break;
                        case 'sm2':
                            const ratingOrder = { 'Again': 1, 'Hard': 2, 'Hold': 3, 'Good': 4, 'Easy': 5 };
                            cards.sort((a, b) => (ratingOrder[a.rating] || 6) - (ratingOrder[b.rating] || 6) || (a.nextReviewDue ? new Date(a.nextReviewDue) : Infinity) - (b.nextReviewDue ? new Date(b.nextReviewDue) : Infinity));
                            break;
                        case 'random':
                            cards.sort(() => Math.random() - 0.5);
                            break;
                        case 'createdAt-asc':
                            cards.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                            break;
                        case 'createdAt-desc':
                            cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            break;

                        case 'read':
                            cards = cards.filter(c => c.rating !== null).sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed));
                            break;
                        case 'unread':
                            cards = cards.filter(c => c.rating === null).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            break;
                        case 'leeches':
                            cards = cards.filter(c => (c.lapses || 0) >= App.config.sm2.leechThreshold);
                            cards.sort((a, b) => (b.lapses || 0) - (a.lapses || 0));
                            break;
                    }
                    return cards;
                },

                getDueFlashcards(allCategories = false) {
                    let cards = this.getAllFlashcards();
                    const category = App.settings.get('flashcardCategory') || 'All'; const now = new Date();
                    if (category !== 'All' && !allCategories) { cards = cards.filter(fc => fc.category === category); }
                    const dueCards = cards.filter(card => card.rating === null || (card.nextReviewDue && new Date(card.nextReviewDue) <= now));
                    const ratingOrder = { 'Again': 1, 'Hard': 2, 'Hold': 3, 'Good': 4, 'Easy': 5 };
                    dueCards.sort((a, b) => { const aIsNew = a.rating === null, bIsNew = b.rating === null; if (aIsNew && !bIsNew) return -1; if (!aIsNew && bIsNew) return 1; return (ratingOrder[a.rating] || 6) - (ratingOrder[b.rating] || 6); });
                    return dueCards;
                },
                getAppStartDate() {
                    if (App.state.articles.length === 0) { const now = new Date(); return { firstYear: now.getFullYear(), firstMonth: now.getMonth() }; }
                    const firstTimestamp = Math.min(...App.state.articles.map(a => new Date(a.createdAt).getTime()));
                    const firstDate = new Date(firstTimestamp);
                    return { firstYear: firstDate.getFullYear(), firstMonth: firstDate.getMonth() };
                },
                getFlashcardStats() {
                    const allCards = App.util.getAllFlashcards();
                    return { total: allCards.length, due: App.util.getDueFlashcards(true).length, ratings: allCards.reduce((acc, card) => { const rating = card.rating || 'New'; acc[rating] = (acc[rating] || 0) + 1; return acc; }, {}) };
                },
                getReadingStats() {
                    const stats = { total: 0, completed: 0, unread: 0, stages: {} };
                    App.state.articles.forEach(article => {
                        stats.total++;
                        const readCount = article.readCount || 0;
                        if (readCount > 0) { stats.completed++; let stage = readCount >= 5 ? '5' : String(readCount); stats.stages[stage] = (stats.stages[stage] || 0) + 1; }
                        else { stats.unread++; }
                    });
                    return stats;
                },
                getFlashcardStatsForPeriod(period) {
                    const start = new Date(); start.setHours(0, 0, 0, 0); if (period === 'yesterday') start.setDate(start.getDate() - 1);
                    const end = new Date(start); end.setHours(23, 59, 59, 999);
                    let reviewed = 0;
                    this.getAllFlashcards().forEach(card => {
                        if (card.reviewHistory && card.reviewHistory.length > 0) {
                            card.reviewHistory.forEach(ts => { const reviewDate = new Date(ts); if (reviewDate >= start && reviewDate <= end) reviewed++; });
                        }
                    });
                    return { reviewed };
                },
                getReadingStatsForPeriod(period) {
                    const start = new Date(); start.setHours(0, 0, 0, 0); if (period === 'yesterday') start.setDate(start.getDate() - 1);
                    const end = new Date(start); end.setHours(23, 59, 59, 999);
                    let read = 0;
                    App.state.articles.forEach(article => {
                        if (article.readHistory && article.readHistory.length > 0) {
                            article.readHistory.forEach(ts => { const readDate = new Date(ts); if (readDate >= start && readDate <= end) read++; });
                        }
                    });
                    return { read };
                },
                getFlashcardChartData(month, year) {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1); const data = Array(daysInMonth).fill(0);
                    this.getAllFlashcards().forEach(card => {
                        if (card.reviewHistory) {
                            card.reviewHistory.forEach(ts => { const reviewDate = new Date(ts); if (reviewDate.getFullYear() === year && reviewDate.getMonth() === month) data[reviewDate.getDate() - 1]++; });
                        }
                    });
                    return { labels, data };
                },
                getReadingChartData(month, year) {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1); const data = Array(daysInMonth).fill(0);
                    for (const article of App.state.articles) {
                        if (article.readHistory && Array.isArray(article.readHistory)) {
                            for (const timestamp of article.readHistory) { const readDate = new Date(timestamp); if (readDate.getFullYear() === year && readDate.getMonth() === month) data[readDate.getDate() - 1]++; }
                        }
                    }
                    return { labels, data };
                },

                getFlashcardReviewHeatmapData() {
                    const history = App.quiz.stats.quizHistory || [];
                    const reviewCounts = {};
                    history.forEach(ts => {
                        const dateStr = ts.substring(0, 10);
                        reviewCounts[dateStr] = (reviewCounts[dateStr] || 0) + 1;
                    });
                    return reviewCounts;
                },

                getFlashcardForecastData() {
                    const forecast = Array(30).fill(0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const allCards = this.getAllFlashcards();
                    allCards.forEach(card => {
                        if (card.nextReviewDue) {
                            const dueDate = new Date(card.nextReviewDue);
                            dueDate.setHours(0, 0, 0, 0);
                            const diffTime = dueDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays >= 0 && diffDays < 30) {
                                forecast[diffDays]++;
                            }
                        }
                    });
                    return forecast;
                },

                getCardEaseDistributionData() {
                    const distribution = {
                        Leech: 0,       // EF < 1.8
                        Hard: 0,        // 1.8 <= EF < 2.2
                        Normal: 0,      // 2.2 <= EF < 2.8
                        Easy: 0,        // EF >= 2.8
                        New: 0
                    };
                    const allCards = this.getAllFlashcards();
                    allCards.forEach(card => {
                        if (card.rating === null) {
                            distribution.New++;
                        } else {
                            const ef = card.easeFactor || 2.5;
                            if (ef < 1.8) distribution.Leech++;
                            else if (ef < 2.2) distribution.Hard++;
                            else if (ef < 2.8) distribution.Normal++;
                            else distribution.Easy++;
                        }
                    });
                    return distribution;
                },

                getReadProgressColorVar(readCount) {
                    if (readCount <= 0) return '--rc-0-gray';
                    if (readCount === 1) return '--rc-1-red';
                    if (readCount === 2) return '--rc-2-orange';
                    if (readCount === 3) return '--rc-3-pink';
                    if (readCount === 4) return '--rc-4-purple';
                    if (readCount === 5) return '--rc-5-indigo';
                    if (readCount === 6) return '--rc-6-teal';
                    if (readCount === 7) return '--rc-7-green-light';
                    if (readCount === 8) return '--rc-8-green-med';
                    if (readCount === 9) return '--rc-9-green-bright';
                    return '--rc-10-green-best'; // 10+ reads
                },

                cleanFlashcardTextForDisplay(htmlString) {
                    if (!htmlString) return '';
                    let cleanText = htmlString.replace(/{{c\d+::((?:(?!{{c\d+::)[\s\S])*?)}}/g, '[$1]');
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = cleanText;
                    return tempDiv.textContent || tempDiv.innerText || '';
                },

                escapeForTsv(str) {
                    if (str === null || str === undefined) return '';
                    let result = String(str);
                    if (result.includes('\t') || result.includes('\n') || result.includes('"')) result = '"' + result.replace(/"/g, '""') + '"';
                    return result;
                },

                sanitizeForTeleprompter(htmlString) {
                    const allowedTags = [
                        'P', 'BR', 'B', 'I', 'U', 'STRONG', 'EM', 'SPAN',
                        'UL', 'OL', 'LI', 'BLOCKQUOTE', 'HR',
                        'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
                    ];
                    const allowedAttributes = {
                        'span': ['class'] // Only allow 'class' for highlights/text-colors
                    };

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlString;
                    const allNodes = tempDiv.querySelectorAll('*');

                    allNodes.forEach(node => {
                        const tagName = node.tagName.toUpperCase();
                        if (!allowedTags.includes(tagName)) {
                            // We use unwrapNode to keep the text content (e.g., from a link)
                            App.util.unwrapNode(node);
                            return;
                        }
                        for (const attr of [...node.attributes]) {
                            const attrName = attr.name.toLowerCase();
                            const allowedForTag = allowedAttributes[tagName.toLowerCase()] || [];

                            if (!allowedForTag.includes(attrName)) {
                                node.removeAttribute(attr.name);
                            }
                        }
                    });

                    return tempDiv.innerHTML;
                },

                sanitizeHTML(htmlString) {
                    if (!htmlString || typeof htmlString !== 'string') return '';
                    const { allowedTags, allowedAttributes } = App.config.sanitizer;
                    // Use inert <template> element so embedded images and media NEVER trigger network preloads/404s
                    const template = document.createElement('template');
                    template.innerHTML = htmlString;
                    const content = template.content;
                    // FIX: Don't remove iframes so video embeds work in Read Mode
                    content.querySelectorAll('script, style, link, meta, object, embed').forEach(el => el.remove());
                    const allNodes = content.querySelectorAll('*');
                    allNodes.forEach(node => {
                        const tagName = node.tagName.toUpperCase();
                        if (!allowedTags.includes(tagName)) { App.util.unwrapNode(node); return; }
                        for (const attr of [...node.attributes]) {
                            const attrName = attr.name.toLowerCase();
                            const allowedForTag = allowedAttributes[tagName.toLowerCase()] || [];
                            const allowedGlobally = allowedAttributes['*'] || [];
                            if (!allowedForTag.includes(attrName) && !allowedGlobally.includes(attrName)) node.removeAttribute(attr.name);
                        }
                    });
                    return template.innerHTML;
                },
                htmlToMarkdown(node) {
                    let markdown = '';
                    const BOLD_TAGS = ['B', 'STRONG'], ITALIC_TAGS = ['I', 'EM'], UNDERLINE_TAGS = ['U', 'SPAN'];
                    if (BOLD_TAGS.includes(node.tagName)) markdown = `**${node.textContent.trim()}**`;
                    else if (ITALIC_TAGS.includes(node.tagName)) markdown = `*${node.textContent.trim()}*`;
                    else if (UNDERLINE_TAGS.includes(node.tagName) && node.classList.contains('text-underline')) markdown = `<u>${node.textContent.trim()}</u>`;
                    else markdown = node.textContent.trim();
                    return markdown;
                },
                trapFocus(element) {
                    const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="number"]:not([disabled]), input[type="range"]:not([disabled]), select:not([disabled])');
                    if (focusableEls.length === 0) return;
                    const firstFocusableEl = focusableEls[0], lastFocusableEl = focusableEls[focusableEls.length - 1];
                    firstFocusableEl?.focus();
                    element.addEventListener('keydown', function (e) {
                        if (e.key !== 'Tab') return;
                        if (e.shiftKey) { if (document.activeElement === firstFocusableEl) { lastFocusableEl.focus(); e.preventDefault(); } }
                        else { if (document.activeElement === lastFocusableEl) { firstFocusableEl.focus(); e.preventDefault(); } }
                    });
                },
                slugify(text) { return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, ''); },
                textToHtml(text) {
                    const paragraphs = text.split(/(\r\n|\n){2,}/g);
                    return paragraphs.filter(p => p && p.trim() !== '' && p !== '\n' && p !== '\r\n').map(p => `<p>${p.trim().replace(/\r\n|\n/g, '<br>')}</p>`).join('');
                },
                placeCursor(element, atStart = false) {
                    const range = document.createRange(); const sel = window.getSelection(); range.selectNodeContents(element); range.collapse(atStart); sel.removeAllRanges(); sel.addRange(range);
                },
                restoreSelection() {
                    if (App.state.savedRange) { const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(App.state.savedRange); }
                },
                escapeHtml: (u) => {
                    if (u === null || u === undefined) return '';
                    const str = typeof u === 'string' ? u : String(u);
                    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                },
                sm2: {
                    rateCard(card, rating) {
                        const now = new Date();

                        // Handle the "Bury" command first, as it's a special case.
                        if (rating === 'Hold') {
                            const nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
                            return {
                                ...card,
                                rating: 'Hold', // Keep original rating
                                nextReviewDue: nextReviewDate.toISOString(),
                                lastReviewed: now.toISOString(),
                            };
                        }

                        let easeFactor = (typeof card.easeFactor === 'number' && isFinite(card.easeFactor)) ? card.easeFactor : 2.5;
                        let reviewCount = (typeof card.reviewCount === 'number' && isFinite(card.reviewCount)) ? card.reviewCount : 0;
                        let interval = (typeof card.interval === 'number' && isFinite(card.interval)) ? card.interval : 0;
                        let lapses = (typeof card.lapses === 'number' && isFinite(card.lapses)) ? card.lapses : 0;

                        // ✨ Branch logic: Is this the first time the user is rating this card?
                        if (reviewCount === 0) {
                            switch (rating) {
                                case 'Again':
                                    lapses += 1;
                                    easeFactor = Math.max(1.3, easeFactor - 0.20);
                                    interval = 10 * 60 * 1000; // 10 minutes
                                    reviewCount = 0; // Stays at 0 because it was incorrect
                                    break;
                                case 'Hard':
                                    easeFactor = Math.max(1.3, easeFactor - 0.15);
                                    interval = 6 * 60 * 60 * 1000; // 6 hours
                                    reviewCount = 1; // It was a successful, rated review
                                    break;
                                case 'Easy':
                                    easeFactor += 0.15;
                                    interval = 2 * 24 * 60 * 60 * 1000; // 2 days
                                    reviewCount = 1;
                                    break;
                                case 'Good':
                                default:
                                    // Default/Good
                                    interval = 12 * 60 * 60 * 1000; // 12 hours
                                    reviewCount = 1;
                                    break;
                            }
                        } else {
                            const qualityMap = { 'Again': 0, 'Hard': 3, 'Good': 4, 'Easy': 5 };
                            const quality = qualityMap[rating] !== undefined ? qualityMap[rating] : 4;

                            if (quality < 3) { // User rated 'Again'
                                lapses += 1;
                                easeFactor = Math.max(1.3, easeFactor - 0.20);
                                reviewCount = 0; // Reset consecutive correct reviews
                                interval = 90 * 60 * 1000; // Re-learn in 90 minutes
                            } else { // 'Hard', 'Good', or 'Easy'
                                reviewCount += 1;
                                interval = Math.round(interval * easeFactor);

                                // Update ease factor based on performance
                                easeFactor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                                if (easeFactor < 1.3) easeFactor = 1.3;
                            }
                        }

                        if (!isFinite(easeFactor) || isNaN(easeFactor) || easeFactor < 1.3) {
                            easeFactor = 2.5;
                        }

                        const intervalModifier = App.settings.get('intervalModifier') || 1.0;
                        interval *= intervalModifier;

                        const fuzz = (Math.random() * 0.1) - 0.05; // +/- 5%
                        interval *= (1 + fuzz);

                        const minInterval = 60000; // 1 minute
                        if (!isFinite(interval) || isNaN(interval) || interval < minInterval) {
                            interval = minInterval;
                        }

                        const nextReviewDue = new Date(now.getTime() + interval);
                        const reviewHistory = [...(card.reviewHistory || []), now.toISOString()];

                        return {
                            rating: rating || 'Good',
                            reviewCount,
                            interval,
                            lastReviewed: now.toISOString(),
                            nextReviewDue: isNaN(nextReviewDue.getTime()) ? new Date(now.getTime() + 86400000).toISOString() : nextReviewDue.toISOString(),
                            reviewHistory,
                            easeFactor,
                            lapses,
                        };
                    },
                    getRatingColor(rating) {
                        if (!rating) return 'var(--sm2-unrated)';
                        const colorName = App.config.sm2.colors[rating];
                        return `var(--sm2-${colorName})`;
                    }
                },
                formatTimestamp(isoString) {
                    if (!isoString) return 'Never';
                    const date = new Date(isoString); const now = new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    now.setDate(now.getDate() - 1); const isYesterday = date.toDateString() === now.toDateString();
                    const timeFormat = { hour: 'numeric', minute: 'numeric' };
                    if (isToday) return `Today at ${date.toLocaleTimeString([], timeFormat)}`;
                    if (isYesterday) return `Yesterday at ${date.toLocaleTimeString([], timeFormat)}`;
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                },
                dataURLtoBlob(dataurl) {
                    if (!dataurl || !dataurl.includes(',')) return null;
                    try {
                        const parts = dataurl.split(',');
                        const mimeMatch = parts[0].match(/:(.*?);/);
                        if (!mimeMatch || mimeMatch.length < 2) return null;
                        const mime = mimeMatch[1];
                        const bstr = atob(parts[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
                        return new Blob([u8arr], { type: mime });
                    } catch (e) {
                        console.error("Failed to convert data URL to blob:", e);
                        return null;
                    }
                },
                getChartColors() {
                    const theme = document.documentElement.getAttribute('data-theme') || 'sepia';
                    const palettes = {
                        light: ['#0d9488', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'],
                        dark: ['#E0B453', '#22c55e', '#60a5fa', '#a78bfa', '#f87171', '#f59e0b', '#34d399', '#c37aff'],
                        // --- UPGRADED SEPIA PALETTE FOR HIGH CONTRAST ---
                        sepia: ['#8c6d46', '#047857', '#a16207', '#5b4636', '#c2410c', '#4d7c0f', '#1d4ed8', '#be185d']
                    };
                    return palettes[theme] || palettes.light;
                },
                calculateQuizStreak() {
                    const history = App.quiz.stats.quizHistory;
                    if (!history || history.length === 0) {
                        return 0;
                    }

                    const uniqueDates = [...new Set(history.map(ts => ts.substring(0, 10)))].sort();

                    if (uniqueDates.length === 0) {
                        return 0;
                    }

                    let streak = 0;
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    const todayStr = today.toISOString().substring(0, 10);
                    const yesterdayStr = yesterday.toISOString().substring(0, 10);

                    const lastQuizDateStr = uniqueDates[uniqueDates.length - 1];

                    // If the last quiz wasn't today or yesterday, the streak is broken.
                    if (lastQuizDateStr !== todayStr && lastQuizDateStr !== yesterdayStr) {
                        return 0;
                    }

                    // Start counting from the last quiz day.
                    let currentDate = new Date(lastQuizDateStr + 'T12:00:00Z');

                    for (let i = uniqueDates.length - 1; i >= 0; i--) {
                        const dateInHistory = uniqueDates[i];
                        const expectedDateStr = currentDate.toISOString().substring(0, 10);

                        if (dateInHistory === expectedDateStr) {
                            streak++;
                            currentDate.setDate(currentDate.getDate() - 1); // Move to the previous day
                        } else {
                            // A day was missed, so the streak is broken.
                            break;
                        }
                    }

                    return streak;
                },
                getWeekNumber(d) {
                    // Helper function to get the ISO week number for a given date
                    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
                    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                    return d.getUTCFullYear() + '-' + weekNo;
                },

                calculateWeeklyQuizStreak() {
                    const history = App.quiz.stats.quizHistory;
                    if (!history || history.length === 0) return 0;

                    // Create a set of unique week identifiers (e.g., "2025-38")
                    const uniqueWeeks = [...new Set(history.map(ts => this.getWeekNumber(new Date(ts))))].sort();
                    if (uniqueWeeks.length === 0) return 0;

                    let streak = 0;
                    const today = new Date();
                    const lastWeek = new Date();
                    lastWeek.setDate(lastWeek.getDate() - 7);

                    const currentWeekStr = this.getWeekNumber(today);
                    const lastWeekStr = this.getWeekNumber(lastWeek);
                    const lastQuizWeekStr = uniqueWeeks[uniqueWeeks.length - 1];

                    // If the last quiz wasn't this week or last week, streak is broken
                    if (lastQuizWeekStr !== currentWeekStr && lastQuizWeekStr !== lastWeekStr) {
                        return 0;
                    }

                    // Start counting backwards from the last quiz week
                    let expectedWeek = new Date(today);
                    for (let i = uniqueWeeks.length - 1; i >= 0; i--) {
                        const weekInHistory = uniqueWeeks[i];
                        const expectedWeekStr = this.getWeekNumber(expectedWeek);

                        if (weekInHistory === expectedWeekStr) {
                            streak++;
                            expectedWeek.setDate(expectedWeek.getDate() - 7); // Go back one week
                        } else {
                            break; // A week was missed
                        }
                    }
                    return streak;
                },

                getWeekCompletionData() {
                    const quizHistory = App.quiz.stats.quizHistory || [];
                    const completedDates = new Set(quizHistory.map(ts => ts.substring(0, 10)));
                    const weekData = [];
                    const today = new Date();

                    // Set to the Monday of the current week
                    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust for Sunday

                    const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

                    for (let i = 0; i < 7; i++) {
                        const currentDay = new Date(startOfWeek);
                        currentDay.setDate(startOfWeek.getDate() + i);

                        const dateStr = currentDay.toISOString().substring(0, 10);
                        const todayStr = today.toISOString().substring(0, 10);

                        weekData.push({
                            dayLetter: dayLetters[i],
                            dateNumber: currentDay.getDate(),
                            isCompleted: completedDates.has(dateStr),
                            isToday: dateStr === todayStr
                        });
                    }
                    return weekData;
                },

                appreciationMessages: [
                    "{name}, you are in the <strong>{tier} League</strong>",
                    "{name}, you are our precious <strong>{tier} Member</strong>",
                    "{name}, You are a <strong>{tier}</strong> in our Ecosystem",
                    "Welcome Legend our Union will be Exquisitive",
                    "Shine bright, my love {name}.",
                    "Are you feeling the power of {tier} membership?",
                    "{name} your IQ can match Elon Musk.",
                    "{tier} suits {name}.",
                    "{name} I can feel, you have Bright future ahead",
                    "{tier} privileges on.",
                    "{name}, pure {tier} vibes.",
                    "Welcome to the <strong>{tier} League</strong>, {name}!",
                    "Your support as a <strong>{tier} Member</strong> is amazing, {name}."
                ],
                cleanPastedStyles(element) {
                    // Query ALL elements with style attribute
                    element.querySelectorAll('[style]').forEach(el => {
                        if (el.hasAttribute('data-user-font')) {
                            return;
                        }

                        // Method 1: Use DOM CSSStyleDeclaration to reliably strip unwanted styles
                        if (el.style) {
                            // Typography & Colors
                            el.style.removeProperty('font-family');
                            el.style.removeProperty('font-size');
                            el.style.removeProperty('line-height');
                            el.style.removeProperty('background-color');
                            el.style.removeProperty('background');
                            el.style.removeProperty('color');

                            // Remove inline borders which might have been computed/copied by Chrome
                            el.style.removeProperty('border');
                            el.style.removeProperty('border-color');
                            el.style.removeProperty('border-style');
                            el.style.removeProperty('border-width');
                            // FIX Bug#1: Strip bold/italic/underline inline styles from pasted content
                            // These leak into existing notes and override user's carefully applied bold.
                            el.style.removeProperty('font-weight');
                            el.style.removeProperty('font-style');
                            el.style.removeProperty('text-decoration');
                            el.style.removeProperty('text-decoration-line');

                            // Layout & Dimensions (Fixes cutoff/spacing issues)
                            el.style.removeProperty('height');
                            el.style.removeProperty('width');
                            el.style.removeProperty('max-height');
                            el.style.removeProperty('max-width');
                            el.style.removeProperty('min-height');
                            el.style.removeProperty('min-width');

                            // Spacing & Positioning
                            el.style.removeProperty('margin');
                            el.style.removeProperty('padding');
                            el.style.removeProperty('position');
                            el.style.removeProperty('top');
                            el.style.removeProperty('left');
                            el.style.removeProperty('right');
                            el.style.removeProperty('bottom');
                            el.style.removeProperty('overflow');
                            el.style.removeProperty('z-index');

                            const remainingStyles = el.getAttribute('style');
                            if (!remainingStyles || remainingStyles.trim() === '') {
                                el.removeAttribute('style');
                            }
                        }
                    });

                    // Method 2: Additional regex-based cleanup as a safety net
                    element.querySelectorAll('[style]').forEach(el => {
                        if (el.hasAttribute('data-user-font')) {
                            return;
                        }

                        let style = el.getAttribute('style');
                        if (style) {
                            // Typography & Colors
                            style = style.replace(/font-family\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/font-size\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/line-height\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/background-color\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/background\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/color\s*:\s*[^;]+(!important)?;?/gi, '');
                            // FIX Bug#1: Strip bold/italic/underline inline styles (regex safety net)
                            style = style.replace(/font-weight\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/font-style\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/text-decoration(-line)?\s*:\s*[^;]+(!important)?;?/gi, '');

                            // Layout & Positioning
                            style = style.replace(/(min-|max-)?(width|height)\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/(margin|padding)(-[a-z]+)?\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/position\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/overflow(-[xy])?\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/z-index\s*:\s*[^;]+(!important)?;?/gi, '');
                            style = style.replace(/(top|left|right|bottom)\s*:\s*[^;]+(!important)?;?/gi, '');

                            style = style.replace(/;+/g, ';').replace(/^;|;$/g, '').trim();

                            if (style) {
                                el.setAttribute('style', style);
                            } else {
                                el.removeAttribute('style');
                            }
                        }
                    });
                },

                getAppreciationMessage(name, tier) {
                    const messageTemplate = this.appreciationMessages[Math.floor(Math.random() * this.appreciationMessages.length)];
                    return messageTemplate.replace('{name}', name).replace('{tier}', tier);
                },

                async reconcileCategories(showToast = false) {
                    console.log("[NoteKash] Checking and reconciling article categories...");
                    const allArticles = App.state.articles;
                    let userCategories = App.settings.get('userCategories') || [];
                    const existingCategoryNames = new Set(userCategories.map(c => (c.name || '').toLowerCase()));
                    let newCategoriesAdded = false;

                    allArticles.forEach(article => {
                        const articleCategory = article.category;
                        if (articleCategory && !existingCategoryNames.has(articleCategory.toLowerCase())) {
                            console.log(`[NoteKash] Found new category '${articleCategory}' in articles — adding to settings.`);
                            const newCategory = {
                                name: articleCategory,
                                displayName: articleCategory,
                                colorIndex: userCategories.length % App.util.getCategoryColorCount(),
                                isDefault: false // New categories are never the default
                            };
                            userCategories.push(newCategory);
                            existingCategoryNames.add(articleCategory.toLowerCase());
                            newCategoriesAdded = true;
                        }
                    });

                    if (newCategoriesAdded) {
                        await App.settings.set('userCategories', userCategories);
                        if (showToast && App.ui?.showToast) {
                            App.ui.showToast('New categories from imported notes have been added!', 'success');
                        }
                    }
                    return newCategoriesAdded;
                },

                _transformMcqsForTeleprompter(htmlString) {
                    if (!htmlString || !htmlString.includes('nk-mcq-block')) {
                        return htmlString; // No MCQs, return immediately.
                    }

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlString;

                    const mcqBlocks = tempDiv.querySelectorAll('.nk-mcq-block');
                    if (mcqBlocks.length === 0) {
                        return htmlString; // No MCQs found by selector, return.
                    }

                    mcqBlocks.forEach(block => {
                        const questionEl = block.querySelector('.nk-mcq-question');
                        const options = block.querySelectorAll('.nk-mcq-option');

                        if (!questionEl || options.length === 0) return; // Malformed MCQ, skip it.
                        const questionText = questionEl.innerHTML;
                        const optionsHTML = Array.from(options).map(opt => {
                            const optionTextEl = opt.querySelector('.nk-mcq-option-text');
                            if (!optionTextEl) return '';

                            const optionText = optionTextEl.innerHTML; // Get innerHTML to preserve styles
                            const isCorrect = opt.dataset.isCorrect === 'true';
                            return `<li>${isCorrect ? `<b>${optionText}</b>` : optionText}</li>`;
                        }).join('');
                        const newHtml = `
                        <p style="margin-top: 1em;"><b>Question:</b> ${questionText}</p>
                        <ul>${optionsHTML}</ul>
                    `;
                        block.outerHTML = newHtml;
                    });

                    return tempDiv.innerHTML;
                },
                _transformAccordionsForTeleprompter(htmlString) {
                    if (!htmlString || !htmlString.includes('nk-accordion')) {
                        return htmlString; // No accordions, return immediately.
                    }

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlString;

                    const accordionBlocks = tempDiv.querySelectorAll('.nk-accordion');
                    if (accordionBlocks.length === 0) {
                        return htmlString;
                    }

                    accordionBlocks.forEach(block => {
                        const titleEl = block.querySelector('.nk-accordion-title');
                        const contentEl = block.querySelector('.nk-accordion-content');

                        if (!titleEl || !contentEl) return; // Malformed, skip it.
                        const titleText = titleEl.innerHTML;
                        const contentText = contentEl.innerHTML;
                        const newHtml = `
                        <hr style="border-top: 1px dashed var(--border-color); margin: 1em 0;">
                        <p><b>Question:</b> ${titleText}</p>
                        <p><b>Answer:</b> ${contentText}</p>
                    `;
                        block.outerHTML = newHtml;
                    });

                    return tempDiv.innerHTML;
                },

                hexToRgba(hex, alpha) {
                    if (!hex) return `rgba(0,0,0,${alpha})`;
                    let r = 0, g = 0, b = 0;
                    if (hex.length === 4) {
                        r = "0x" + hex[1] + hex[1];
                        g = "0x" + hex[2] + hex[2];
                        b = "0x" + hex[3] + hex[3];
                    } else if (hex.length === 7) {
                        r = "0x" + hex[1] + hex[2];
                        g = "0x" + hex[3] + hex[4];
                        b = "0x" + hex[5] + hex[6];
                    }
                    return `rgba(${+r},${+g},${+b},${alpha})`;
                },

                parseMcqExplanationMeta(explanationEl) {
                    const block = explanationEl.closest('.nk-mcq-block');
                    if (!block) return;
                    
                    // Get raw text (strip HTML tags for parsing, but keep original HTML for display)
                    const text = explanationEl.innerText || explanationEl.textContent || '';
                    
                    // ── Difficulty ──────────────────────────────────────────────────────────
                    const diffMatch = text.match(/#(easy|medium|hard)\b/i);
                    if (diffMatch) {
                        explanationEl.dataset.difficulty = diffMatch[1].toLowerCase();
                    } else {
                        delete explanationEl.dataset.difficulty;
                    }
                    
                    // ── Tags (all #words that are NOT difficulty keywords) ──────────────────
                    const tagRegex = /#([\w]+)/g;
                    const DIFFICULTY_KEYWORDS = new Set(['easy', 'medium', 'hard']);
                    const tags = [];
                    let m;
                    while ((m = tagRegex.exec(text)) !== null) {
                        const raw = m[1];
                        if (DIFFICULTY_KEYWORDS.has(raw.toLowerCase())) continue;
                        // Convert underscores to spaces and preserve exact original casing
                        const display = raw.replace(/_/g, ' ');
                        if (!tags.includes(display)) tags.push(display);
                    }
                    if (tags.length > 0) {
                        explanationEl.dataset.tags = tags.join(',');
                    } else {
                        delete explanationEl.dataset.tags;
                    }
                    
                    // ── PYQ ── [[Exam Year]] syntax ──────────────────────────────────────────
                    const pyqMatch = text.match(/\[\[([^\]]+)\]\]/);
                    if (pyqMatch) {
                        explanationEl.dataset.pyq = pyqMatch[1].trim();
                    } else {
                        delete explanationEl.dataset.pyq;
                    }
                },

                parseAllMcqMetadata() {
                    document.querySelectorAll('#article-content .nk-mcq-explanation').forEach(el => this.parseMcqExplanationMeta(el));
                },

                renderMcqCapsules(container = document) {
                    container.querySelectorAll('.nk-mcq-block').forEach(block => {
                        // Clean up existing capsule bars first
                        block.querySelectorAll('.nk-mcq-meta-bar').forEach(el => el.remove());
                        
                        const expEl = block.querySelector('.nk-mcq-explanation');
                        if (!expEl) return;
                        
                        const difficulty = expEl.dataset.difficulty;
                        const tags = expEl.dataset.tags
                            ? expEl.dataset.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : [];
                        const pyq = expEl.dataset.pyq;
                        
                        // Clean visual metadata from explanation text nodes to keep read mode clean
                        const cleanNodeText = (node) => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                let val = node.nodeValue;
                                val = val.replace(/#(easy|medium|hard)\b/gi, '');
                                val = val.replace(/#([\w]+)/g, '');
                                val = val.replace(/\[\[([^\]]+)\]\]/g, '');
                                node.nodeValue = val;
                            } else {
                                for (let child of Array.from(node.childNodes)) {
                                    cleanNodeText(child);
                                }
                            }
                        };
                        cleanNodeText(expEl);
                        
                        // Tidy up trailing/leading spaces and whitespace in the HTML safely
                        let html = expEl.innerHTML;
                        html = html.replace(/\s+/g, ' ');
                        html = html.replace(/\s+([.,!?;:])?/g, (match, p1) => p1 ? p1 : ' ');
                        html = html.trim();
                        expEl.innerHTML = html;
                        
                        // Only render if there's something to show
                        if (!difficulty && tags.length === 0 && !pyq) return;
                        
                        const bar = document.createElement('div');
                        bar.className = 'nk-mcq-meta-bar';
                        bar.contentEditable = 'false';
                        
                        // ── Difficulty capsule ──────────────────────────────────────────────
                        if (difficulty) {
                            const badge = document.createElement('span');
                            const cleanDiff = difficulty.toLowerCase().trim();
                            badge.className = `nk-mcq-difficulty-capsule nk-diff-${cleanDiff}`;
                            
                            let emoji = '🟢';
                            if (cleanDiff === 'medium') {
                                emoji = '🟠';
                            } else if (cleanDiff === 'hard') {
                                emoji = '🔴';
                            }
                            
                            const icon = document.createElement('span');
                            icon.className = 'nk-capsule-icon';
                            icon.textContent = emoji;
                            badge.appendChild(icon);
                            
                            bar.appendChild(badge);
                        }
                        
                        // ── Topic tag capsules ────────────────────────────────────────────
                        tags.forEach(tag => {
                            const capsule = document.createElement('span');
                            capsule.className = 'nk-mcq-tag-capsule';
                            capsule.textContent = tag;
                            bar.appendChild(capsule);
                        });
                        
                        // ── PYQ capsule ───────────────────────────────────────────────────
                        if (pyq) {
                            const pyqBadge = document.createElement('span');
                            pyqBadge.className = 'nk-mcq-pyq-capsule';
                            
                            const pyqIcon = document.createElement('i');
                            pyqIcon.className = 'fa-solid fa-graduation-cap nk-pyq-icon';
                            pyqBadge.appendChild(pyqIcon);
                            
                            const pyqText = document.createTextNode(pyq);
                            pyqBadge.appendChild(pyqText);
                            
                            bar.appendChild(pyqBadge);
                        }
                        
                        // Insert at the top of the MCQ block (before question)
                        const questionEl = block.querySelector('.nk-mcq-question');
                        if (questionEl) {
                            questionEl.before(bar);
                        } else {
                            block.prepend(bar);
                        }
                    });
                },

                removeAllMcqCapsules(container = document) {
                    container.querySelectorAll('.nk-mcq-meta-bar').forEach(el => el.remove());
                },

};

if (typeof window !== 'undefined') {
    window.parseMcqExplanationMeta = (el) => util.parseMcqExplanationMeta(el);
    window.parseAllMcqMetadata = () => util.parseAllMcqMetadata();
    window.renderMcqCapsules = (container) => util.renderMcqCapsules(container);
    window.removeAllMcqCapsules = (container) => util.removeAllMcqCapsules(container);
}
